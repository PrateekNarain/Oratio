# Linguistic Analysis Integration Guide

## Overview

The linguistic analysis system is now fully integrated into your Eloquence app. Here's how everything works together:

## Flow Diagram

```
User uploads video/audio
         ↓
Extract audio from video (if needed)
         ↓
┌────────────────────────────────────────┐
│  PARALLEL PROCESSING                   │
├────────────────────────────────────────┤
│  1. Transcription (Whisper)            │
│  2. Vocal Emotion (SpeechBrain)        │
│  3. Facial Emotion (DeepFace - video)  │
└────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────┐
│  LINGUISTIC ANALYSIS (spaCy)           │
├────────────────────────────────────────┤
│  • Vocabulary richness                 │
│  • Filler words detection              │
│  • Hedge words (uncertainty)           │
│  • Power words (confidence)            │
│  • Weak words                          │
│  • Transition words                    │
│  • POS distribution                    │
│  • Named entity recognition            │
│  • Passive voice detection             │
│  • Sentence complexity                 │
└────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────┐
│  ENHANCED REPORTS (Gemini AI)          │
├────────────────────────────────────────┤
│  • Vocabulary Report (with metrics)    │
│  • Speech Report (with confidence)     │
│  • Expression Report                   │
│  • Scores (informed by linguistics)    │
└────────────────────────────────────────┘
         ↓
Save to MongoDB with full analysis
```

## What Gets Stored in Database

Each report now contains:

```json
{
  "_id": "report_id",
  "userId": "user_id",
  "title": "My Presentation",
  "context": "Business presentation",
  "transcription": "Full speech text...",
  
  // Traditional reports
  "vocabulary_report": "Detailed vocabulary analysis...",
  "speech_report": "Speech delivery analysis...",
  "expression_report": "Facial expression analysis...",
  
  // Scores
  "scores": {
    "vocabulary": 85,
    "voice": 78,
    "expressions": 90
  },
  
  // NEW: Detailed linguistic analysis
  "linguistic_analysis": {
    "vocabulary": {
      "total_words": 450,
      "unique_words": 280,
      "lexical_diversity": 0.622,
      "most_common_words": [["presentation", 8], ["team", 6]],
      "word_length_stats": {"avg": 5.2, "min": 1, "max": 14}
    },
    "filler_words": {
      "total_count": 23,
      "percentage": 5.1,
      "breakdown": {"um": 8, "uh": 7, "like": 5, "you know": 3},
      "top_3": [["um", 8], ["uh", 7], ["like", 5]]
    },
    "hedge_words": {
      "total_count": 12,
      "percentage": 2.7,
      "breakdown": {"maybe": 4, "probably": 3, "i think": 5}
    },
    "power_words": {
      "total_count": 18,
      "percentage": 4.0,
      "by_category": {"achievement": 5, "confidence": 8, "action": 5}
    },
    "weak_words": {
      "total_count": 15,
      "percentage": 3.3
    },
    "transitions": {
      "total_count": 12,
      "by_category": {"addition": 4, "contrast": 3, "cause_effect": 5}
    },
    "pos_distribution": {
      "details": {
        "nouns": 120,
        "verbs": 85,
        "adjectives": 45,
        "adverbs": 30
      }
    },
    "named_entities": {
      "total_entities": 8,
      "entity_types": {"PERSON": 2, "ORG": 3, "GPE": 3},
      "entities_by_type": {
        "ORG": ["Microsoft", "Google", "Apple"]
      }
    },
    "sentence_structure": {
      "total_sentences": 35,
      "sentence_length_stats": {"avg": 12.8, "min": 3, "max": 28},
      "passive_voice": {
        "count": 3,
        "examples": ["The project was completed by our team"]
      },
      "avg_dependency_depth": 3.2
    },
    "segments": [
      {
        "start_time": 0.0,
        "end_time": 4.0,
        "text": "Good morning everyone...",
        "emotion": "neutral"
      }
    ]
  },
  
  // NEW: Human-readable summary
  "linguistic_summary": {
    "vocabulary": "Good vocabulary diversity, but could use more variety.",
    "fillers": "Moderate filler word usage. Reduce 'um', 'uh'.",
    "confidence": "Generally confident, but some uncertainty markers present.",
    "structure": "Well-balanced sentence length for clarity.",
    "passive_voice": "Found 3 passive voice constructions. Use active voice for impact."
  },
  
  // Vocal emotions with timestamps
  "vocal_emotions": [
    {
      "chunk": 1,
      "start_time": 0.0,
      "end_time": 4.0,
      "emotion": "neutral"
    }
  ]
}
```

## API Endpoints

### 1. Upload & Analyze
```
POST /upload
```
**Request:**
- `file`: Audio/video file
- `context`: Speech context
- `title`: Session title
- `userId`: User ID

**Response:**
Full report with all analysis data

### 2. Get User Reports List
```
GET /user-reports-list?userId=<user_id>
```
Returns all reports for a user

### 3. Get Overall Reports
```
GET /user-reports?userId=<user_id>
```
Returns aggregated performance across all sessions

### 4. Get Single Report
```
GET /report/<report_id>
```
Returns detailed report with all linguistic analysis

### 5. Chat with Report (NEW)
```
POST /chat
```
**Request:**
```json
{
  "reportId": "report_id",
  "message": "How can I reduce my filler words?",
  "history": [
    {"role": "user", "content": "What was my score?"},
    {"role": "assistant", "content": "Your vocabulary score was 85/100..."}
  ]
}
```

**Response:**
```json
{
  "response": "Based on your speech, you used 'um' 8 times and 'uh' 7 times...",
  "reportId": "report_id"
}
```

## How Components Work Together

### 1. Transcription → Linguistic Analysis
```python
transcription = speech_to_text_long(audio_data)
linguistic_analysis = analyze_transcript_complete(transcription, vocal_emotions)
```

The linguistic analysis extracts:
- Word patterns
- Speech confidence markers
- Vocabulary richness
- Sentence structure

### 2. Linguistic Analysis → Enhanced Reports
```python
vocabulary_report = evaluate_vocabulary(
    transcription, 
    context, 
    linguistic_analysis  # Provides detailed metrics
)
```

The vocabulary report now includes:
- Specific filler word counts
- Lexical diversity scores
- Power vs hedge word ratios
- Concrete examples from speech

### 3. Linguistic Analysis → Better Scores
```python
scores = generate_scores(
    transcription,
    vocal_emotion_analysis,
    emotion_analysis_str,
    linguistic_analysis  # Informs scoring
)
```

Scores now consider:
- Actual lexical diversity (not just LLM judgment)
- Filler word percentage
- Confidence markers
- Sentence complexity

### 4. Conversational Feature
```python
# User asks: "Why did I get 78 for vocabulary?"
# System responds with specific data:
# "Your lexical diversity was 0.62, which is good, but you used 
#  23 filler words (5.1% of speech). Specifically, you said 'um' 
#  8 times and 'like' 5 times. Reducing these would improve your score."
```

## Frontend Integration Examples

### Display Linguistic Insights
```javascript
// Show filler word breakdown
const fillers = report.linguistic_analysis.filler_words;
console.log(`Total fillers: ${fillers.total_count} (${fillers.percentage}%)`);
fillers.top_3.forEach(([word, count]) => {
  console.log(`  ${word}: ${count} times`);
});

// Show confidence ratio
const hedges = report.linguistic_analysis.hedge_words.total_count;
const power = report.linguistic_analysis.power_words.total_count;
const confidenceRatio = power / (hedges + power);
console.log(`Confidence ratio: ${(confidenceRatio * 100).toFixed(1)}%`);
```

### Display Named Entities
```javascript
const entities = report.linguistic_analysis.named_entities;
console.log(`You mentioned ${entities.total_entities} specific references:`);
Object.entries(entities.entities_by_type).forEach(([type, items]) => {
  console.log(`  ${type}: ${items.join(', ')}`);
});
```

### Show Segments with Emotions
```javascript
const segments = report.linguistic_analysis.segments;
segments.forEach(segment => {
  console.log(`[${segment.start_time}s - ${segment.end_time}s]`);
  console.log(`  Emotion: ${segment.emotion}`);
  console.log(`  Text: ${segment.text}`);
});
```

### Chat Interface
```javascript
async function askQuestion(reportId, message, history) {
  const response = await fetch('/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reportId, message, history })
  });
  const data = await response.json();
  return data.response;
}

// Usage
const answer = await askQuestion(
  reportId,
  "How can I sound more confident?",
  chatHistory
);
```

## Benefits of Integration

### 1. **More Accurate Scoring**
- Scores based on actual metrics, not just LLM judgment
- Consistent scoring across sessions
- Explainable scores (can show why score is X)

### 2. **Detailed Feedback**
- Specific examples from speech
- Quantified metrics (not just "you use filler words")
- Actionable recommendations

### 3. **Progress Tracking**
- Track filler word reduction over time
- Monitor lexical diversity improvement
- See confidence ratio trends

### 4. **Conversational Learning**
- Ask follow-up questions
- Get personalized advice
- Understand specific weaknesses

### 5. **Better Understanding**
- See exactly what words were detected
- Understand POS distribution
- Know which entities were mentioned

## Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Download spaCy model (auto-downloads on first run, but can pre-install)
python -m spacy download en_core_web_sm
```

## Testing

```python
# Test linguistic analysis
from utils.linguistic_analysis import analyze_transcript_complete

text = "Um, so today I want to talk about, you know, public speaking..."
result = analyze_transcript_complete(text)
print(result['filler_words'])
print(result['vocabulary'])
```

## Performance Notes

- **spaCy processing**: ~1-2 seconds for typical speech (500 words)
- **Total analysis time**: Dominated by Whisper transcription (30-60s)
- **Linguistic analysis**: Adds minimal overhead (<5% of total time)

## Future Enhancements

1. **Real-time analysis**: Process audio chunks as they arrive
2. **Custom word lists**: Let users define their own filler words
3. **Industry-specific vocabulary**: Different standards for different contexts
4. **Comparative analysis**: Compare against top speakers in same domain
5. **Practice mode**: Real-time filler word detection during practice
