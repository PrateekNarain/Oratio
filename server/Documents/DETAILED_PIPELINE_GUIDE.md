# Detailed Analysis Pipeline Guide

## Overview

The Detailed Analysis Pipeline is a comprehensive speech analysis system that processes audio/video files through 9 distinct stages, providing in-depth insights, metrics, and actionable recommendations at each step.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    DETAILED ANALYSIS PIPELINE                    │
└─────────────────────────────────────────────────────────────────┘

Stage 1: Media Processing
├─ Extract audio from video (if applicable)
├─ Analyze facial expressions (video only)
└─ Determine processing mode (audio/video)
         ↓
Stage 2: Transcription
├─ Convert speech to text using Whisper
├─ Count words and sentences
└─ Prepare text for analysis
         ↓
Stage 3: Vocal Emotion Analysis
├─ Detect emotions in audio chunks
├─ Calculate emotion distribution
└─ Generate emotion timeline
         ↓
Stage 4: Linguistic Analysis
├─ Vocabulary richness (lexical diversity)
├─ Filler word detection (um, uh, like, etc.)
├─ Hedge word analysis (maybe, perhaps, etc.)
├─ Power word detection (achieve, proven, etc.)
├─ Weak word identification
├─ Transition word usage
├─ POS (Part-of-Speech) distribution
├─ Named entity recognition
├─ Sentence structure analysis
└─ Generate linguistic summary
         ↓
Stage 5: Vocabulary Evaluation
├─ AI-powered vocabulary assessment
├─ Identify strengths and weaknesses
├─ Provide specific examples
└─ Generate actionable recommendations
         ↓
Stage 6: Speech Delivery Report
├─ Analyze emotional appropriateness
├─ Evaluate clarity and expressiveness
├─ Assess confidence markers
└─ Provide delivery feedback
         ↓
Stage 7: Facial Expression Report
├─ Analyze facial emotion distribution
├─ Evaluate expression appropriateness
├─ Assess engagement level
└─ Check consistency with speech tone
         ↓
Stage 8: Scoring
├─ Vocabulary Score (0-100)
├─ Voice Score (0-100)
├─ Expression Score (0-100)
└─ Detailed scoring criteria
         ↓
Stage 9: Advanced Insights
├─ Identify key strengths
├─ Highlight areas for improvement
├─ Generate prioritized recommendations
└─ Provide key performance metrics
         ↓
┌─────────────────────────────────────────────────────────────────┐
│                      COMPREHENSIVE REPORT                        │
│  • Transcription                                                 │
│  • Scores (Vocabulary, Voice, Expressions)                       │
│  • Detailed Reports (Vocabulary, Speech, Expression)             │
│  • Linguistic Analysis (10+ metrics)                             │
│  • Advanced Insights (Strengths, Improvements, Recommendations)  │
│  • Processing Metrics (Stage timings, total time)                │
└─────────────────────────────────────────────────────────────────┘
```

## Features

### 1. **Comprehensive Linguistic Analysis**
- **Vocabulary Metrics**: Lexical diversity, unique words, word length statistics
- **Filler Words**: Detection of 40+ filler patterns (um, uh, like, you know, etc.)
- **Confidence Markers**: Power words vs. hedge words ratio
- **Sentence Structure**: Complexity, passive voice, repetitive patterns
- **Named Entities**: People, organizations, locations, dates
- **POS Distribution**: Nouns, verbs, adjectives, adverbs breakdown

### 2. **Multi-Modal Emotion Analysis**
- **Vocal Emotions**: Chunk-by-chunk emotion detection (happy, sad, angry, neutral)
- **Facial Expressions**: Frame-by-frame facial emotion analysis (video only)
- **Emotion Timeline**: Temporal alignment of emotions with speech segments

### 3. **AI-Powered Reports**
- **Vocabulary Report**: Detailed assessment with specific examples and recommendations
- **Speech Delivery Report**: Emotional appropriateness, clarity, expressiveness
- **Expression Report**: Facial expression analysis and consistency evaluation

### 4. **Scoring System**
- **Vocabulary Score (0-100)**: Based on richness, relevance, and variety
- **Voice Score (0-100)**: Based on expressiveness and emotional impact
- **Expression Score (0-100)**: Based on facial expression appropriateness

### 5. **Advanced Insights**
- **Strengths**: Identified positive aspects of the speech
- **Areas for Improvement**: Specific weaknesses with examples
- **Prioritized Recommendations**: Actionable steps with priority levels
- **Key Metrics**: Confidence level, vocabulary richness, clarity ratings

### 6. **Performance Tracking**
- **Stage Timings**: Duration of each processing stage
- **Total Processing Time**: End-to-end analysis time
- **Progress Indicators**: Real-time feedback during analysis

## Usage

### Basic Usage

```python
from utils.detailed_analysis_pipeline import run_detailed_analysis

# Run analysis on a file
results = run_detailed_analysis(
    file_path="path/to/video.mp4",
    context="Business presentation",
    title="Q4 Sales Review",
    user_id="user123",
    verbose=True  # Show progress
)

# Access results
print(f"Vocabulary Score: {results['scores']['vocabulary']}/100")
print(f"Voice Score: {results['scores']['voice']}/100")
print(f"Total Time: {results['total_processing_time']:.2f}s")
```

### Using Pipeline Object

```python
from utils.detailed_analysis_pipeline import DetailedAnalysisPipeline

# Create pipeline instance
pipeline = DetailedAnalysisPipeline(gemini_model_name="gemini-2.5-flash")

# Run analysis
results = pipeline.analyze_file(
    file_path="path/to/audio.wav",
    context="Technical presentation",
    title="AI Overview",
    user_id="user456",
    verbose=True
)

# Access stage timings
for stage, duration in results['stage_timings'].items():
    print(f"{stage}: {duration:.2f}s")
```

### Custom Model Configuration

```python
from utils.detailed_analysis_pipeline import analyze_with_custom_model

# Use a different Gemini model
results = analyze_with_custom_model(
    file_path="path/to/file.mp4",
    context="Motivational speech",
    model_name="gemini-2.5-flash",
    title="Inspiration Talk",
    verbose=True
)
```

## Testing

### Run Test Script

```bash
# Test with a video file
python test_detailed_pipeline.py Uploads/sample.mp4

# Test with an audio file
python test_detailed_pipeline.py Uploads/sample.wav
```

### Test Output

The test script provides:
1. **Progress Tracking**: Real-time updates for each stage
2. **Detailed Results**: Comprehensive breakdown of all metrics
3. **JSON Export**: Save results to `detailed_analysis_results.json`

Example output:
```
============================================================
DETAILED ANALYSIS PIPELINE
============================================================
File: Uploads/sample.mp4
Title: Business Presentation Test
Context: Practice presentation for a business meeting
============================================================

📁 STAGE 1: Media Processing
------------------------------------------------------------
  → Extracting audio from video...
  → Analyzing facial expressions...
  ✓ Facial emotions detected: 7 emotion types
  ⏱️  Stage 1 completed in 3.45s

🎤 STAGE 2: Transcription
------------------------------------------------------------
  → Converting speech to text...
  ✓ Transcription complete: 523 words
  ⏱️  Stage 2 completed in 12.34s

🎵 STAGE 3: Vocal Emotion Analysis
------------------------------------------------------------
  → Analyzing vocal emotions...
  ✓ Analyzed 15 audio chunks
  → Emotion distribution: {'neutral': 8, 'happy': 5, 'sad': 2}
  ⏱️  Stage 3 completed in 8.76s

... (continues for all 9 stages)

============================================================
PIPELINE COMPLETE - SUMMARY
============================================================
Total Processing Time: 67.89s

Scores:
  Vocabulary:  82/100
  Voice:       78/100
  Expressions: 85/100

Key Insights:
  Strengths: 3
    • Excellent use of transition words
    • Strong emotional expressiveness
  Areas for Improvement: 3
    • Reduce filler word usage (3.2%)
    • Use more varied vocabulary
============================================================
```

## Results Structure

```python
{
  "userId": "user123",
  "title": "Session Title",
  "context": "Speech context",
  "mode": "video",  # or "audio"
  
  # Core Analysis
  "transcription": "Full speech text...",
  "scores": {
    "vocabulary": 82,
    "voice": 78,
    "expressions": 85
  },
  
  # Detailed Reports
  "vocabulary_report": "Detailed vocabulary assessment...",
  "speech_report": "Speech delivery analysis...",
  "expression_report": "Facial expression evaluation...",
  
  # Linguistic Analysis
  "linguistic_analysis": {
    "vocabulary": {
      "total_words": 523,
      "unique_words": 287,
      "lexical_diversity": 0.549,
      "most_common_words": [["the", 15], ["and", 12], ...]
    },
    "filler_words": {
      "total_count": 17,
      "percentage": 3.2,
      "top_3": [["um", 8], ["like", 5], ["uh", 4]]
    },
    "hedge_words": {
      "total_count": 12,
      "percentage": 2.3
    },
    "power_words": {
      "total_count": 23,
      "by_category": {"achievement": 8, "confidence": 7, ...}
    },
    "sentence_structure": {
      "total_sentences": 45,
      "avg_words_per_sentence": 11.6,
      "questions": 3,
      "passive_voice": {"count": 2, "examples": [...]}
    },
    "pos_distribution": {
      "nouns": 145,
      "verbs": 98,
      "adjectives": 42
    },
    "named_entities": {
      "total_entities": 15,
      "entity_types": {"PERSON": 5, "ORG": 3, "DATE": 7}
    }
  },
  
  # Linguistic Summary
  "linguistic_summary": {
    "vocabulary": "Good vocabulary diversity...",
    "fillers": "Moderate filler word usage...",
    "confidence": "Generally confident language..."
  },
  
  # Emotion Data
  "vocal_emotions": [
    {
      "chunk": 1,
      "start_time": 0.0,
      "end_time": 4.0,
      "emotion": "neutral"
    },
    ...
  ],
  "facial_emotions": {
    "Human Emotions": ["Happy", "Sad", "Neutral", ...],
    "Emotion Value from the Video": [12.5, 3.2, 45.8, ...]
  },
  
  # Advanced Insights
  "advanced_insights": {
    "strengths": [
      "Excellent use of transition words",
      "Strong emotional expressiveness",
      "Clear and structured delivery"
    ],
    "areas_for_improvement": [
      "Reduce filler word usage (3.2%)",
      "Use more varied vocabulary",
      "Increase confident language markers"
    ],
    "recommendations": [
      {
        "action": "Replace 'um' and 'uh' with brief pauses",
        "reason": "Improves clarity and professionalism",
        "priority": "high"
      },
      {
        "action": "Use more power words like 'achieve', 'proven'",
        "reason": "Increases persuasiveness and confidence",
        "priority": "medium"
      }
    ],
    "key_metrics": {
      "confidence_level": "medium",
      "vocabulary_richness": "good",
      "clarity": "excellent"
    }
  },
  
  # Performance Metrics
  "stage_timings": {
    "media_processing": 3.45,
    "transcription": 12.34,
    "vocal_emotions": 8.76,
    "linguistic_analysis": 5.23,
    "vocabulary_evaluation": 8.91,
    "speech_report": 7.65,
    "expression_report": 6.43,
    "scoring": 9.12,
    "advanced_insights": 6.00
  },
  "total_processing_time": 67.89
}
```

## Integration with Flask App

### Option 1: Replace Existing Pipeline

```python
# In app.py
from utils.detailed_analysis_pipeline import DetailedAnalysisPipeline

# Create pipeline instance
pipeline = DetailedAnalysisPipeline()

@app.route('/upload', methods=['POST'])
def upload_file():
    # ... file handling code ...
    
    # Run detailed analysis
    results = pipeline.analyze_file(
        file_path=file_path,
        context=context,
        title=title,
        user_id=user_id,
        verbose=False  # Disable console output in production
    )
    
    # Save to database
    report_data = results.copy()
    result = reports_collection.insert_one(report_data)
    
    return jsonify(results), 200
```

### Option 2: Add as Separate Endpoint

```python
# In app.py
from utils.detailed_analysis_pipeline import run_detailed_analysis

@app.route('/detailed-analysis', methods=['POST'])
def detailed_analysis():
    """Run detailed analysis on an uploaded file"""
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    context = request.form.get('context', '')
    title = request.form.get('title', 'Untitled Session')
    user_id = request.form.get('userId')
    
    # Save file temporarily
    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)
    
    try:
        # Run detailed analysis
        results = run_detailed_analysis(
            file_path=file_path,
            context=context,
            title=title,
            user_id=user_id,
            verbose=False
        )
        
        # Save to database
        reports_collection.insert_one(results.copy())
        
        return jsonify(results), 200
    finally:
        # Cleanup
        if os.path.exists(file_path):
            os.remove(file_path)
```

## Performance Optimization

### 1. **Parallel Processing**
The pipeline processes stages sequentially, but some stages could be parallelized:
- Vocal emotion analysis + Facial expression analysis
- Multiple report generations

### 2. **Caching**
Cache linguistic analysis results for repeated analysis of the same text.

### 3. **Batch Processing**
Process multiple files in a batch to amortize model loading costs.

### 4. **Model Selection**
- Use `gemini-2.5-flash` for faster processing
- Use `gemini-pro` for higher quality analysis

## Troubleshooting

### Issue: Rate Limiting Errors
**Solution**: The pipeline includes automatic retry logic with exponential backoff. Increase delays between stages if needed.

### Issue: Out of Memory
**Solution**: Process shorter audio chunks or reduce the number of frames analyzed for facial expressions.

### Issue: Slow Processing
**Solution**: 
- Use audio-only mode (skip facial analysis)
- Reduce transcription quality settings
- Use faster Gemini model

### Issue: Missing Dependencies
**Solution**: Install all required packages:
```bash
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

## Best Practices

1. **Always use verbose=True during development** to track progress
2. **Save results to JSON** for debugging and analysis
3. **Monitor stage timings** to identify bottlenecks
4. **Use appropriate context** for better AI-generated reports
5. **Test with various file types** (MP4, WAV, MP3, M4A)
6. **Handle errors gracefully** in production environments

## Future Enhancements

- [ ] Real-time streaming analysis
- [ ] Multi-language support
- [ ] Custom scoring criteria
- [ ] Comparative analysis across multiple sessions
- [ ] Export to PDF/Word reports
- [ ] Interactive visualization dashboard
- [ ] Speaker diarization (multiple speakers)
- [ ] Sentiment analysis integration
- [ ] Pronunciation assessment
- [ ] Pace and rhythm analysis

## Support

For issues or questions:
1. Check the test output for detailed error messages
2. Review stage timings to identify bottlenecks
3. Verify all dependencies are installed
4. Check API keys and rate limits
5. Review the SYSTEM_ARCHITECTURE.md for system overview

---

**Version**: 1.0.0  
**Last Updated**: 2025-11-14  
**Compatibility**: Python 3.8+, Flask 2.0+
