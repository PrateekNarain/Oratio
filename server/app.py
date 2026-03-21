from flask import Flask, request, jsonify, send_from_directory, Response
import pymongo
import re  
from routes.auth_routes import auth_bp
from flask_cors import CORS
import os
import logging
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
import pandas as pd
from bson import ObjectId
import json
import time
from datetime import datetime, timedelta, timezone
import google.generativeai as genai
import gridfs
import mimetypes
import subprocess

# Heavy ML utilities are imported lazily inside /upload to keep startup fast.
# The model_manager handles background pre-loading.
from model_manager import model_manager
from utils.gemini_rate_limiter import gemini_generate_with_retry

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
load_dotenv()

# Database and Services Setup
MONGO_URI = os.getenv("MONGODB_URI")
if not MONGO_URI:
    raise ValueError("MONGODB_URI not set in environment variables")
client = pymongo.MongoClient(MONGO_URI)
db = client["Eloquence"]
collections_user = db["user"]
reports_collection = db["reports"]
overall_reports_collection = db["overall_reports"]

# GridFS for storing uploaded video/audio files in MongoDB
fs = gridfs.GridFS(db)

# Gemini client setup
genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))
gemini_model = genai.GenerativeModel("gemini-2.5-flash")

# Application Configuration
UPLOAD_FOLDER = 'Uploads'
ALLOWED_EXTENSIONS = {'mp4', 'wav', 'mp3', 'm4a', 'webm'}  
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def has_video_stream(file_path: str) -> bool:
    """Use ffprobe to check whether the file contains a video stream."""
    try:
        result = subprocess.run(
            ['ffprobe', '-v', 'error', '-select_streams', 'v',
             '-show_entries', 'stream=codec_type', '-of', 'csv=p=0', file_path],
            capture_output=True, text=True, timeout=10
        )
        return 'video' in result.stdout
    except Exception as e:
        logger.warning(f"ffprobe check failed for {file_path}, assuming no video: {e}")
        return False

def convert_keys_to_strings(data):
    """
    Recursively converts all numeric keys in a dictionary to strings.
    """
    if isinstance(data, dict):
        return {str(k): convert_keys_to_strings(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [convert_keys_to_strings(item) for item in data]
    else:
        return data

def convert_objectid_to_string(data):
    """
    Recursively converts all ObjectId fields in a dictionary to strings.
    """
    if isinstance(data, dict):
        return {k: convert_objectid_to_string(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [convert_objectid_to_string(item) for item in data]
    elif isinstance(data, ObjectId):
        return str(data)
    else:
        return data

# Register auth routes
app.register_blueprint(auth_bp)

@app.route('/')
def home():
    return "Hello World"

@app.route('/health')
def health():
    """Check which ML models are loaded and ready.
    Models load on-demand when /upload is called — not at startup."""
    return jsonify({
        "status": "ok",
        "mode": "on-demand",
        "whisper_ready": model_manager.is_whisper_ready(),
        "ser_ready": model_manager.is_ser_ready(),
        "spacy_ready": model_manager.is_spacy_ready(),
    })

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    
    context = request.form.get('context', '')
    title = request.form.get('title', 'Untitled Session')
    user_id = request.form.get('userId')

    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({"error": "No selected or allowed file"}), 400

    raw_filename = secure_filename(file.filename)
    # Prefix with timestamp to avoid collisions
    filename = f"{int(time.time())}_{raw_filename}"
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)

    try:
        # Lazy-import heavy ML utilities only when actually needed
        from utils.audioextraction import extract_audio_to_memory
        from utils.expressions import analyze_video_emotions
        from utils.transcription import speech_to_text_long
        from utils.vocals import predict_emotion
        from utils.linguistic_analysis import analyze_transcript_complete, generate_linguistic_summary

        ext = file.filename.rsplit('.', 1)[1].lower()
        AUDIO_ONLY_EXTENSIONS = {'wav', 'mp3', 'm4a'}
        # Determine mode: check form field first, then probe the file
        form_mode = request.form.get('mode', '')
        if form_mode in ('video', 'audio'):
            mode = form_mode
        elif ext in AUDIO_ONLY_EXTENSIONS:
            mode = 'audio'
        elif has_video_stream(file_path):
            mode = 'video'
        else:
            mode = 'audio'

        logger.info(f"File '{filename}' detected as mode='{mode}' (ext='{ext}')")

        # In-memory audio processing
        if mode == "video":
            audio_data = extract_audio_to_memory(file_path)
            if audio_data is None:
                return jsonify({"error": "Failed to extract audio from video"}), 500
            facial_emotion_analysis, facial_emotions_timeline = analyze_video_emotions(file_path)
        else:  # Audio mode — skip all visual analysis
            logger.info(f"Audio-only file detected — skipping facial/visual analysis.")
            audio_data = extract_audio_to_memory(file_path)
            if audio_data is None:
                # Fallback: pass the file path directly (works for wav/mp3)
                audio_data = file_path
            facial_emotion_analysis = pd.DataFrame()
            facial_emotions_timeline = []

        # Run analysis with updated utility functions
        transcription = speech_to_text_long(audio_data)
        vocal_emotion_analysis = predict_emotion(audio_data)
        
        # Run detailed linguistic analysis
        print("Running linguistic analysis...")
        linguistic_analysis = analyze_transcript_complete(transcription, vocal_emotion_analysis)
        linguistic_summary = generate_linguistic_summary(linguistic_analysis)
        
        # Convert DataFrame to string for LLM processing
        emotion_analysis_str = facial_emotion_analysis.to_string(index=False) if not facial_emotion_analysis.empty else "No facial data"

        # Generate ALL reports in a SINGLE Gemini API call (saves quota)
        print("Generating combined report (scores + vocabulary + speech + expression)...")
        combined = generate_combined_report(
            transcription, context, vocal_emotion_analysis,
            emotion_analysis_str, linguistic_analysis, mode
        )
        scores = combined["scores"]
        vocabulary_report = combined["vocabulary_report"]
        speech_report = combined["speech_report"]
        expression_report = combined["expression_report"]

        # Store the file in MongoDB GridFS
        content_type = mimetypes.guess_type(filename)[0] or 'application/octet-stream'
        with open(file_path, 'rb') as f_in:
            gridfs_file_id = fs.put(
                f_in,
                filename=filename,
                content_type=content_type,
                user_id=user_id
            )
        logger.info(f"Stored file in GridFS: {filename} (id={gridfs_file_id})")

        # Clean up local file after storing in GridFS
        if os.path.exists(file_path):
            os.remove(file_path)

        # Prepare and save report
        from datetime import datetime
        report_data = {
            "userId": user_id,
            "title": title,
            "context": context,
            "transcription": transcription,
            "vocabulary_report": vocabulary_report,
            "speech_report": speech_report,
            "expression_report": expression_report,
            "scores": scores,
            "linguistic_analysis": linguistic_analysis,
            "linguistic_summary": linguistic_summary,
            "vocal_emotions": vocal_emotion_analysis,
            "facial_emotions_timeline": facial_emotions_timeline,
            "uploaded_filename": filename,
            "gridfs_file_id": str(gridfs_file_id),
            "createdAt": datetime.utcnow()
        }
        result = reports_collection.insert_one(report_data.copy())
        report_data["_id"] = str(result.inserted_id)
        update_overall_reports(user_id)
        report_data = convert_objectid_to_string(report_data)

        # After first upload, pre-warm remaining ML models in background
        # so subsequent uploads are faster
        model_manager.prewarm_remaining()

        return jsonify(report_data), 200

    except Exception as e:
        print(f"An error occurred during processing: {e}")
        # Cleanup local file on failure
        if os.path.exists(file_path):
            os.remove(file_path)
        return jsonify({"error": "An internal server error occurred during analysis"}), 500

def update_overall_reports(user_id):
    """
    Recalculate and update the overall reports and scores for a user.
    """
    user_reports = list(reports_collection.find({"userId": user_id, "deletedAt": {"$exists": False}}))

    if not user_reports:
        return

    total_vocabulary = 0
    total_voice = 0
    total_expressions = 0
    for report in user_reports:
        total_vocabulary += report["scores"]["vocabulary"]
        total_voice += report["scores"]["voice"]
        total_expressions += report["scores"]["expressions"]

    avg_vocabulary = total_vocabulary / len(user_reports)
    avg_voice = total_voice / len(user_reports)
    avg_expressions = total_expressions / len(user_reports)

    overall_reports = generate_overall_reports(user_reports)

    overall_report_data = {
        "userId": user_id,
        "avg_vocabulary": avg_vocabulary,
        "avg_voice": avg_voice,
        "avg_expressions": avg_expressions,
        "overall_reports": overall_reports
    }

    overall_reports_collection.update_one(
        {"userId": user_id},
        {"$set": overall_report_data},
        upsert=True
    )

@app.route('/user-reports-list', methods=['GET'])
def get_user_reports_list():
    user_id = request.args.get('userId')
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    user_reports = list(reports_collection.find({"userId": user_id, "deletedAt": {"$exists": False}}))
    user_reports = convert_objectid_to_string(user_reports)

    return jsonify(user_reports), 200

@app.route('/user-reports', methods=['GET'])
def get_user_reports():
    user_id = request.args.get('userId')
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    overall_report = overall_reports_collection.find_one({"userId": user_id})

    if not overall_report:
        return jsonify({"error": "No overall report found for the user"}), 404

    overall_report = convert_objectid_to_string(overall_report)

    return jsonify(overall_report), 200


@app.route('/chat', methods=['POST'])
def chat_with_report():
    """
    Conversational endpoint for asking questions about a specific report
    """
    data = request.json
    report_id = data.get('reportId')
    user_message = data.get('message')
    chat_history = data.get('history', [])
    
    if not report_id or not user_message:
        return jsonify({"error": "Report ID and message are required"}), 400
    
    # Fetch the report
    try:
        report = reports_collection.find_one({"_id": ObjectId(report_id)})
    except:
        return jsonify({"error": "Invalid report ID"}), 400
    
    if not report:
        return jsonify({"error": "Report not found"}), 404
    
    # Build context with report data
    linguistic_summary = report.get('linguistic_summary', {})
    linguistic_analysis = report.get('linguistic_analysis', {})
    
    # Format chat history
    history_text = ""
    if chat_history:
        for msg in chat_history[-5:]:  # Last 5 messages for context
            role = msg.get('role', 'user')
            content = msg.get('content', '')
            history_text += f"{role.capitalize()}: {content}\n"
    
    # Use only first 1000 words of transcription for context (still plenty for examples)
    transcription = report.get('transcription', '')
    words = transcription.split()
    transcription_sample = ' '.join(words[:1000]) if len(words) > 1000 else transcription
    
    context = f"""
You are an expert public speaking coach. Answer the user's question about their speech.

SPEECH: {report.get('title', 'Untitled')} - {report.get('context', 'General')}

SCORES: Vocabulary {report.get('scores', {}).get('vocabulary', 0)}/100, Voice {report.get('scores', {}).get('voice', 0)}/100, Expressions {report.get('scores', {}).get('expressions', 0)}/100

KEY INSIGHTS:
{json.dumps(linguistic_summary, indent=2)}

TRANSCRIPTION SAMPLE (first 1000 words):
{transcription_sample}

RECENT CHAT:
{history_text}

USER: {user_message}

Provide a helpful, specific answer. Quote from the transcription when relevant. Be conversational and encouraging.
    """
    
    try:
        response = gemini_generate_with_retry(gemini_model, context)
        
        return jsonify({
            "response": response.text,
            "reportId": report_id
        }), 200
    except Exception as e:
        print(f"Error in chat: {e}")
        return jsonify({"error": "Failed to generate response"}), 500


@app.route('/report/<report_id>', methods=['GET'])
def get_single_report(report_id):
    """
    Get a single report by ID with all details
    """
    try:
        report = reports_collection.find_one({"_id": ObjectId(report_id)})
    except:
        return jsonify({"error": "Invalid report ID"}), 400
    
    if not report:
        return jsonify({"error": "Report not found"}), 404
    
    report = convert_objectid_to_string(report)
    return jsonify(report), 200


# ─── Trash / Recycle Bin Endpoints ───

@app.route('/report/<report_id>/trash', methods=['POST'])
def trash_report(report_id):
    """Soft-delete a report by setting deletedAt timestamp."""
    try:
        oid = ObjectId(report_id)
    except:
        return jsonify({"error": "Invalid report ID"}), 400

    result = reports_collection.update_one(
        {"_id": oid, "deletedAt": {"$exists": False}},
        {"$set": {"deletedAt": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        return jsonify({"error": "Report not found or already trashed"}), 404

    # Recalculate overall reports excluding trashed
    report = reports_collection.find_one({"_id": oid})
    if report:
        update_overall_reports(report["userId"])

    return jsonify({"message": "Report moved to trash"}), 200


@app.route('/report/<report_id>/restore', methods=['POST'])
def restore_report(report_id):
    """Restore a soft-deleted report."""
    try:
        oid = ObjectId(report_id)
    except:
        return jsonify({"error": "Invalid report ID"}), 400

    result = reports_collection.update_one(
        {"_id": oid, "deletedAt": {"$exists": True}},
        {"$unset": {"deletedAt": ""}}
    )
    if result.modified_count == 0:
        return jsonify({"error": "Report not found or not in trash"}), 404

    report = reports_collection.find_one({"_id": oid})
    if report:
        update_overall_reports(report["userId"])

    return jsonify({"message": "Report restored"}), 200


@app.route('/report/<report_id>', methods=['DELETE'])
def permanent_delete_report(report_id):
    """Permanently delete a trashed report."""
    try:
        oid = ObjectId(report_id)
    except:
        return jsonify({"error": "Invalid report ID"}), 400

    report = reports_collection.find_one({"_id": oid})
    if not report or "deletedAt" not in report:
        return jsonify({"error": "Report not found in trash"}), 404

    user_id = report["userId"]
    # Delete the GridFS file if it exists
    gridfs_id = report.get("gridfs_file_id")
    if gridfs_id:
        try:
            fs.delete(ObjectId(gridfs_id))
        except Exception as e:
            logger.warning(f"Failed to delete GridFS file {gridfs_id}: {e}")
    # Fallback: also clean up local file if it exists
    uploaded_file = report.get("uploaded_filename")
    if uploaded_file:
        fpath = os.path.join(app.config['UPLOAD_FOLDER'], uploaded_file)
        if os.path.exists(fpath):
            os.remove(fpath)
    reports_collection.delete_one({"_id": oid})
    update_overall_reports(user_id)

    return jsonify({"message": "Report permanently deleted"}), 200


@app.route('/report/<report_id>/download', methods=['GET'])
def download_report_file(report_id):
    """Download the uploaded file associated with a report from GridFS."""
    try:
        oid = ObjectId(report_id)
    except:
        return jsonify({"error": "Invalid report ID"}), 400

    report = reports_collection.find_one({"_id": oid})
    if not report:
        return jsonify({"error": "Report not found"}), 404

    gridfs_id = report.get("gridfs_file_id")
    if not gridfs_id:
        return jsonify({"error": "No file available for this report"}), 404

    try:
        grid_file = fs.get(ObjectId(gridfs_id))
    except gridfs.NoFile:
        return jsonify({"error": "File not found in database"}), 404

    filename = report.get("uploaded_filename", "recording")
    ext = os.path.splitext(filename)[1] if filename else ""
    download_name = report.get("title", "recording") + ext
    content_type = grid_file.content_type or 'application/octet-stream'

    return Response(
        grid_file.read(),
        mimetype=content_type,
        headers={
            'Content-Disposition': f'attachment; filename="{download_name}"',
            'Content-Length': str(grid_file.length)
        }
    )


@app.route('/report/<report_id>/stream', methods=['GET'])
def stream_report_file(report_id):
    """Stream video/audio from GridFS with Range support for HTML5 players."""
    try:
        oid = ObjectId(report_id)
    except:
        return jsonify({"error": "Invalid report ID"}), 400

    report = reports_collection.find_one({"_id": oid})
    if not report:
        return jsonify({"error": "Report not found"}), 404

    gridfs_id = report.get("gridfs_file_id")
    if not gridfs_id:
        return jsonify({"error": "No file available for this report"}), 404

    try:
        grid_file = fs.get(ObjectId(gridfs_id))
    except gridfs.NoFile:
        return jsonify({"error": "File not found in database"}), 404

    file_size = grid_file.length
    content_type = grid_file.content_type or 'video/mp4'

    # --- Chunked streaming helper ---
    CHUNK = 256 * 1024  # 256 KB per yield
    MAX_RANGE_CHUNK = 1 * 1024 * 1024  # 1 MB cap per Range response

    range_header = request.headers.get('Range')
    if range_header:
        # Parse Range: bytes=start-end
        byte_range = range_header.replace('bytes=', '').split('-')
        start = int(byte_range[0])
        end = int(byte_range[1]) if byte_range[1] else min(start + MAX_RANGE_CHUNK - 1, file_size - 1)
        end = min(end, file_size - 1)
        length = end - start + 1

        def generate_range():
            grid_file.seek(start)
            remaining = length
            while remaining > 0:
                read_size = min(CHUNK, remaining)
                data = grid_file.read(read_size)
                if not data:
                    break
                remaining -= len(data)
                yield data

        return Response(
            generate_range(),
            status=206,
            mimetype=content_type,
            headers={
                'Content-Range': f'bytes {start}-{end}/{file_size}',
                'Accept-Ranges': 'bytes',
                'Content-Length': str(length),
                'Cache-Control': 'public, max-age=86400',
            }
        )
    else:
        # No Range header — stream the whole file in chunks
        def generate_full():
            while True:
                data = grid_file.read(CHUNK)
                if not data:
                    break
                yield data

        return Response(
            generate_full(),
            mimetype=content_type,
            headers={
                'Accept-Ranges': 'bytes',
                'Content-Length': str(file_size),
                'Cache-Control': 'public, max-age=86400',
            }
        )


@app.route('/trash', methods=['GET'])
def get_trash():
    """Get all trashed reports for a user."""
    user_id = request.args.get('userId')
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    # Auto-cleanup: permanently delete reports trashed more than 30 days ago
    cutoff = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
    reports_collection.delete_many({
        "userId": user_id,
        "deletedAt": {"$exists": True, "$lt": cutoff}
    })

    trashed = list(reports_collection.find({"userId": user_id, "deletedAt": {"$exists": True}}))
    trashed = convert_objectid_to_string(trashed)
    return jsonify(trashed), 200


@app.route('/report/<report_id>/rename', methods=['POST'])
def rename_report(report_id):
    """Rename a report by updating its title."""
    try:
        oid = ObjectId(report_id)
    except:
        return jsonify({"error": "Invalid report ID"}), 400

    data = request.get_json()
    new_title = data.get('title')
    if not new_title:
        return jsonify({"error": "Title required"}), 400

    # Update only the title (files are stored in GridFS by ID, no rename needed)
    result = reports_collection.update_one(
        {"_id": oid},
        {"$set": {"title": new_title}}
    )
    if result.modified_count == 0:
        return jsonify({"error": "Report not updated"}), 404
    return jsonify({"success": True}), 200


def generate_overall_reports(user_reports):
    """
    Generate three overall reports (Voice, Expressions, Vocabulary) in a SINGLE
    Gemini API call to conserve quota.  Returns a dict with three keys.
    """
    user_reports = convert_objectid_to_string(user_reports)

    compact_reports = []
    for report in user_reports:
        compact_reports.append({
            "title": report.get('title', 'Untitled'),
            "context": report.get('context', ''),
            "scores": report.get('scores', {}),
            "linguistic_summary": report.get('linguistic_summary', {})
        })

    prompt = f"""
You are an expert speech coach. Based on the following report summaries, generate
three short one-paragraph overall reports for the user:

Report Summaries:
{json.dumps(compact_reports, indent=2)}

Generate the following three reports (each one paragraph, no scores):

1. **voice_report**: Overall Voice performance — emotional tone, clarity, expressiveness.
2. **expressions_report**: Overall Facial Expressions — emotional appropriateness, dynamism, consistency with speech.
3. **vocabulary_report**: Overall Vocabulary — richness, relevance, clarity of words.

Return ONLY valid JSON with exactly these three keys:
{{"voice_report": "...", "expressions_report": "...", "vocabulary_report": "..."}}
    """

    try:
        response = gemini_generate_with_retry(
            gemini_model, prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.3
            )
        )
        cleaned = re.sub(r'```(?:json)?\s*|\s*```', '', response.text).strip()
        result = json.loads(cleaned)
        return {
            "voice_report": result.get("voice_report", ""),
            "expressions_report": result.get("expressions_report", ""),
            "vocabulary_report": result.get("vocabulary_report", ""),
        }
    except Exception as e:
        print(f"Error generating overall reports: {e}")
        return {
            "voice_report": "Unable to generate report due to API limitations.",
            "expressions_report": "Unable to generate report due to API limitations.",
            "vocabulary_report": "Unable to generate report due to API limitations.",
        }


def generate_combined_report(transcription, context, audio_emotion,
                             emotion_analysis_str, linguistic_data=None, mode="video"):
    """
    Generate scores, vocabulary report, speech report, and expression report
    in a SINGLE Gemini API call to conserve free-tier quota.

    Returns dict with keys: scores, vocabulary_report, speech_report, expression_report
    """
    # Build compact linguistic context
    linguistic_section = ""
    if linguistic_data:
        vocab = linguistic_data.get('vocabulary', {})
        fillers = linguistic_data.get('filler_words', {})
        hedges = linguistic_data.get('hedge_words', {})
        power = linguistic_data.get('power_words', {})
        weak = linguistic_data.get('weak_words', {})
        transitions = linguistic_data.get('transitions', {})
        confident = linguistic_data.get('confident_phrases', {})

        # Format top fillers
        top_fillers = fillers.get('top_3', [])[:3]
        fillers_str = ', '.join([f"{w}({c})" for w, c in top_fillers]) if top_fillers else "N/A"

        linguistic_section = f"""
Linguistic Metrics:
- Lexical Diversity: {vocab.get('lexical_diversity', 0):.2f}, Total Words: {vocab.get('total_words', 0)}, Unique: {vocab.get('unique_words', 0)}
- Fillers: {fillers.get('total_count', 0)} ({fillers.get('percentage', 0):.1f}%) — top: {fillers_str}
- Hedge words (uncertainty): {hedges.get('total_count', 0)}
- Power words (confidence): {power.get('total_count', 0)}
- Weak words: {weak.get('total_count', 0)}
- Confident phrases: {confident.get('total_count', 0)}
- Transitions: {transitions.get('total_count', 0)}
        """

    expression_instruction = ""
    if mode == "video":
        expression_instruction = """
4. **expression_report**: A short one-paragraph report on facial expressions.
   Focus on emotional appropriateness, dynamism, and consistency with speech tone.
   Do NOT include scores.
        """
    else:
        expression_instruction = """
4. **expression_report**: Return exactly the string "No expression analysis for audio-only mode."
        """

    prompt = f"""
You are an expert speech analysis system. Analyze the following speech data and
produce ALL of the outputs described below in a single JSON response.

=== SPEECH DATA ===
Context/Purpose: {context}

Transcription:
{transcription}

Audio Emotion Data: {audio_emotion}

Facial Emotion Analysis: {emotion_analysis_str}
{linguistic_section}

=== REQUIRED OUTPUTS (return as a single JSON object) ===

1. **scores**: An object with three integer scores (0-100):
   - "vocabulary": richness and relevance of words (consider lexical diversity, fillers, word choice)
   - "voice": expressiveness and emotional impact of vocal tone (consider emotional variety, confidence, tone consistency)
   - "expressions": appropriateness of facial expressions (consider dynamism, alignment with speech)
   Scoring guide: 90-100 excellent, 70-89 good, 50-69 average, 30-49 limited, 0-29 poor.

2. **vocabulary_report**: A comprehensive vocabulary evaluation with these sections:
   - OVERVIEW (2-3 sentences on quality and appropriateness)
   - STRENGTHS (3-4 bullet points with specific examples)
   - AREAS FOR IMPROVEMENT (3-4 bullet points with concrete suggestions)
   - SPECIFIC RECOMMENDATIONS (3-5 actionable items)
   Make it specific, reference actual words from the speech. No scores.

3. **speech_report**: A detailed 2-3 paragraph report on vocal delivery:
   - Emotional tone match with context
   - Clarity and expressiveness
   - Confidence vs hesitation
   - Specific examples and actionable feedback. No scores.
{expression_instruction}

Return ONLY valid JSON:
{{"scores": {{"vocabulary": N, "voice": N, "expressions": N}}, "vocabulary_report": "...", "speech_report": "...", "expression_report": "..."}}
    """

    try:
        response = gemini_generate_with_retry(
            gemini_model, prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.2
            )
        )

        cleaned = re.sub(r'```(?:json)?\s*|\s*```', '', response.text).strip()
        result = json.loads(cleaned)

        # Validate scores
        scores = result.get("scores", {})
        for key in ['vocabulary', 'voice', 'expressions']:
            val = scores.get(key)
            if not isinstance(val, int) or not 0 <= val <= 100:
                scores[key] = 0

        def _stringify_report(val, fallback=""):
            """Gemini may return a report as a string or a nested object; normalise to string."""
            if isinstance(val, str):
                return val
            if isinstance(val, dict):
                parts = []
                for k, v in val.items():
                    heading = k.replace("_", " ").title()
                    if isinstance(v, list):
                        items = "\n".join(f"- {item}" for item in v)
                        parts.append(f"**{heading}**\n{items}")
                    elif isinstance(v, str):
                        parts.append(f"**{heading}**\n{v}")
                    else:
                        parts.append(f"**{heading}**: {v}")
                return "\n\n".join(parts) if parts else fallback
            if isinstance(val, list):
                return "\n".join(f"- {item}" for item in val)
            return fallback

        return {
            "scores": scores,
            "vocabulary_report": _stringify_report(
                result.get("vocabulary_report"), "Unable to generate vocabulary report."),
            "speech_report": _stringify_report(
                result.get("speech_report"), "Unable to generate speech report."),
            "expression_report": _stringify_report(
                result.get("expression_report"),
                "No expression analysis for audio-only mode." if mode != "video"
                else "Unable to generate expression report."),
        }
    except Exception as e:
        print(f"Error generating combined report: {e}")
        return {
            "scores": {"vocabulary": 0, "voice": 0, "expressions": 0},
            "vocabulary_report": "Unable to generate vocabulary report due to API limitations.",
            "speech_report": "Unable to generate speech report due to API limitations.",
            "expression_report": "No expression analysis for audio-only mode." if mode != "video"
                                 else "Unable to generate expression report due to API limitations.",
        }

if __name__ == '__main__':
    if os.environ.get('WERKZEUG_RUN_MAIN') == 'true' or not app.debug:
        model_manager.start_background_loading()
    app.run(debug=True, threaded=True, use_reloader=False)