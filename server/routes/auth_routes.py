from flask import Blueprint, request, jsonify, send_file
from utils.auth import hash_password, check_password, generate_token, verify_token
from werkzeug.utils import secure_filename
import pymongo
import os
import json
import base64
import io
from dotenv import load_dotenv

# Define a Blueprint for authentication routes
auth_bp = Blueprint('auth', __name__, url_prefix='/auth')  # Add url_prefix here

# Load MongoDB URI from environment (fall back to hardcoded if not set)
load_dotenv()
MONGO_URI = os.getenv("MONGODB_URI") or "mongodb+srv://prateeknarain001_db_user:narain9812461880@cluster0.vewvizi.mongodb.net/"
client = pymongo.MongoClient(MONGO_URI)
db = client["Eloquence"]
users_collection = db["users"]


# ROUTE 1 :create a user using POST : auth/create  , doesnt require auth
@auth_bp.route('/create', methods=['POST'])  # Change to /create
def create_user():
    try:
        data = request.get_json()
        username = data['username']
        email = data['email']
        password = data['password']

        # Hash the password
        hashed_password = hash_password(password)

        # Check if user already exists
        if users_collection.find_one({'email': email}):
            return jsonify({"error": "User with this email already exists"}), 400

        # Insert the new user
        result = users_collection.insert_one({'username': username, 'password': hashed_password, 'email': email})

        # Generate JWT token (use email as identity)
        token = generate_token(email)

        # Return token and basic user info so the frontend can store username and userId
        return jsonify({"message": "User created", "token": token, "username": username, "userId": email}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth_bp.route('/update', methods=['POST'])
def update_user():
    """Update a user's public profile fields. Expects JSON: { userId: <email>, username: <new name> }"""
    try:
        data = request.get_json() or {}
        user_id = data.get('userId')
        new_username = data.get('username')

        if not user_id or not new_username:
            return jsonify({"error": "userId and username are required"}), 400

        result = users_collection.update_one({'email': user_id}, {'$set': {'username': new_username}})
        if result.matched_count == 0:
            return jsonify({"error": "User not found"}), 404

        return jsonify({"message": "User updated", "username": new_username}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500




# ROUTE 2 :authenticate a user using POST : auth/login   , no login required
@auth_bp.route('/login', methods=['POST']) 
def login_user():
    try:
        data = request.get_json()
        email = data['email']
        password = data['password']

        user = users_collection.find_one({'email': email})
        if not user:
            return jsonify({"error": "User not found"}), 404

        if not check_password(user['password'], password):
            return jsonify({"error": "Invalid password"}), 401

        # Generate JWT token
        token = generate_token(email)

        # Provide username and userId to the client so it can persist them in localStorage
        username = user.get('username') or email
        return jsonify({"message": "Login successful", "token": token, "username": username, "userId": email}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Protected Route Example
# ROUTE 3 : get loggedIn user details using POST : auth/protected , login reuqired
@auth_bp.route('/protected', methods=['POST'])
def protected():
   # get token from the body as its a post method 
    token = request.json.get("token", None)
    


    if not token:
        return jsonify({"error": "Token missing"}), 401

    # Remove 'Bearer ' from the token string if it's present
    token = token.replace("Bearer ", "")
    username = verify_token(token)  # Verify the token

    if not username:
        return jsonify({"error": "Invalid or expired token"}), 401

    return jsonify({"message": f"Hello, {username}! This is a protected route."})


# --- Profile endpoints ---

ALLOWED_IMAGE_EXT = {'jpg', 'jpeg', 'png', 'gif', 'webp'}
ALLOWED_RESUME_EXT = {'pdf'}
MAX_PHOTO_SIZE = 2 * 1024 * 1024   # 2 MB
MAX_RESUME_SIZE = 5 * 1024 * 1024  # 5 MB


def _get_email_from_token():
    auth_header = request.headers.get('Authorization', '')
    token = auth_header.replace('Bearer ', '')
    if not token:
        return None
    return verify_token(token)


def _file_to_data_uri(file_obj, allowed_exts, max_size):
    """Read an uploaded file and return a base64 data URI, or None on failure."""
    if not file_obj or not file_obj.filename:
        return None
    ext = file_obj.filename.rsplit('.', 1)[-1].lower()
    if ext not in allowed_exts:
        return None
    data = file_obj.read()
    if len(data) > max_size:
        return None
    mime_map = {
        'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png',
        'gif': 'image/gif', 'webp': 'image/webp', 'pdf': 'application/pdf',
    }
    mime = mime_map.get(ext, 'application/octet-stream')
    b64 = base64.b64encode(data).decode('utf-8')
    return f"data:{mime};base64,{b64}"


@auth_bp.route('/profile', methods=['GET'])
def get_profile():
    email = _get_email_from_token()
    if not email:
        return jsonify({"error": "Unauthorized"}), 401

    user = users_collection.find_one({'email': email}, {'password': 0, '_id': 0})
    if not user:
        return jsonify({"error": "User not found"}), 404

    profile = user.get('profile', {})
    photo = profile.get('profilePhoto', '')
    # Clear legacy file-path values that are not base64 data URIs
    if photo and not photo.startswith('data:'):
        photo = ''
    result = {
        'fullName': user.get('username', ''),
        'email': email,
        'phone': profile.get('phone', ''),
        'location': profile.get('location', ''),
        'linkedin': profile.get('linkedin', ''),
        'github': profile.get('github', ''),
        'portfolio': profile.get('portfolio', ''),
        'profilePhoto': photo,
        'currentRole': profile.get('currentRole', ''),
        'yearsExp': profile.get('yearsExp', ''),
        'skills': profile.get('skills', []),
        'existingResume': profile.get('resumeName', ''),
        'hasResume': bool(profile.get('resumeData')),
        'education': profile.get('education', []),
        'experience': profile.get('experience', []),
        'projects': profile.get('projects', []),
        'interviewTypes': profile.get('interviewTypes', []),
    }
    return jsonify(result), 200


@auth_bp.route('/profile', methods=['POST'])
def update_profile():
    email = _get_email_from_token()
    if not email:
        return jsonify({"error": "Unauthorized"}), 401

    user = users_collection.find_one({'email': email})
    if not user:
        return jsonify({"error": "User not found"}), 404

    full_name = request.form.get('fullName', '').strip()
    profile_data = {
        'phone': request.form.get('phone', '').strip(),
        'location': request.form.get('location', '').strip(),
        'linkedin': request.form.get('linkedin', '').strip(),
        'github': request.form.get('github', '').strip(),
        'portfolio': request.form.get('portfolio', '').strip(),
        'currentRole': request.form.get('currentRole', '').strip(),
        'yearsExp': request.form.get('yearsExp', '').strip(),
    }

    # Parse JSON fields
    for field in ('skills', 'education', 'experience', 'projects', 'interviewTypes'):
        raw = request.form.get(field)
        if raw:
            try:
                profile_data[field] = json.loads(raw)
            except (json.JSONDecodeError, TypeError):
                profile_data[field] = []

    # Handle profile photo — store as base64 data URI in DB
    photo = request.files.get('profilePhoto')
    photo_data_uri = _file_to_data_uri(photo, ALLOWED_IMAGE_EXT, MAX_PHOTO_SIZE)
    if photo_data_uri:
        profile_data['profilePhoto'] = photo_data_uri

    # Handle resume — store as base64 data URI in DB
    resume = request.files.get('resume')
    if resume and resume.filename:
        resume_data_uri = _file_to_data_uri(resume, ALLOWED_RESUME_EXT, MAX_RESUME_SIZE)
        if resume_data_uri:
            profile_data['resumeData'] = resume_data_uri
            profile_data['resumeName'] = resume.filename

    # Preserve existing photo/resume if not re-uploaded
    existing_profile = user.get('profile', {})
    if 'profilePhoto' not in profile_data and existing_profile.get('profilePhoto'):
        profile_data['profilePhoto'] = existing_profile['profilePhoto']
    if 'resumeData' not in profile_data and existing_profile.get('resumeData'):
        profile_data['resumeData'] = existing_profile['resumeData']
        profile_data['resumeName'] = existing_profile.get('resumeName', '')

    update_fields = {'profile': profile_data}
    if full_name:
        update_fields['username'] = full_name

    users_collection.update_one({'email': email}, {'$set': update_fields})

    return jsonify({
        "message": "Profile updated",
        "username": full_name or user.get('username', ''),
        "existingResume": profile_data.get('resumeName', ''),
    }), 200


@auth_bp.route('/profile/resume', methods=['GET'])
def download_resume():
    """Serve the resume PDF stored in the database."""
    email = _get_email_from_token()
    if not email:
        return jsonify({"error": "Unauthorized"}), 401

    user = users_collection.find_one({'email': email}, {'profile.resumeData': 1, 'profile.resumeName': 1})
    if not user:
        return jsonify({"error": "User not found"}), 404

    profile = user.get('profile', {})
    resume_data = profile.get('resumeData', '')
    resume_name = profile.get('resumeName', 'resume.pdf')

    if not resume_data:
        return jsonify({"error": "No resume found"}), 404

    # Strip data URI prefix
    if ',' in resume_data:
        resume_data = resume_data.split(',', 1)[1]

    pdf_bytes = base64.b64decode(resume_data)
    return send_file(
        io.BytesIO(pdf_bytes),
        mimetype='application/pdf',
        as_attachment=True,
        download_name=resume_name,
    )
