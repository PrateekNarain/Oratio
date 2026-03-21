# Quick Start: Integrated Linguistic Analysis

## What Changed?

### ✅ New Features Added

1. **Detailed Linguistic Analysis** - spaCy-powered analysis of:
   - Filler words (um, uh, like, etc.)
   - Hedge words (uncertainty markers)
   - Power words (confident language)
   - Part-of-speech distribution
   - Named entity recognition
   - Passive voice detection
   - Sentence complexity

2. **Enhanced Reports** - Reports now include:
   - Specific metrics (not just descriptions)
   - Concrete examples from speech
   - Actionable recommendations

3. **Conversational Feature** - Chat with your reports:
   - Ask questions about your performance
   - Get personalized advice
   - Understand specific weaknesses

4. **Better Scoring** - Scores informed by actual metrics:
   - Lexical diversity
   - Filler word percentage
   - Confidence ratios

## Installation

```bash
# Install new dependency
pip install spacy

# Download language model
python -m spacy download en_core_web_sm
```

## How It Works

### Before (Old Flow)
```
Upload → Transcribe → Generate Report → Save
```

### After (New Flow)
```
Upload → Transcribe → Linguistic Analysis → Enhanced Report → Save
                              ↓
                    Detailed Metrics + Insights
```

## Example Output

### Old Vocabulary Report
```
"The speaker uses good vocabulary with some repetition. 
Consider using more varied words."
```

### New Vocabulary Report
```
OVERVIEW:
Your vocabulary shows good diversity with a lexical diversity 
score of 0.62. However, filler word usage at 5.1% impacts clarity.

STRENGTHS:
• Strong use of power words (18 instances) including "achieve", 
  "demonstrate", and "establish"
• Good transition word usage (12 instances) for logical flow
• Appropriate technical terminology for business context

AREAS FOR IMPROVEMENT:
• High filler word usage: "um" (8x), "uh" (7x), "like" (5x)
• Hedge words indicate uncertainty: "maybe" (4x), "i think" (5x)
• Repetitive sentence starts: "So" used to begin 5 sentences

SPECIFIC RECOMMENDATIONS:
1. Replace "um" and "uh" with brief pauses
2. Change "I think" to "I believe" or "The data shows"
3. Vary sentence openings - use transitions instead of "So"
4. Add more action verbs - currently 85 verbs vs 120 nouns
5. Reduce "like" by being more specific in comparisons
```

## API Changes

### Upload Endpoint (Enhanced)
```python
POST /upload

# Response now includes:
{
  "transcription": "...",
  "vocabulary_report": "...",  # Enhanced with metrics
  "speech_report": "...",       # Enhanced with confidence data
  "scores": {...},              # Informed by linguistic analysis
  
  # NEW FIELDS:
  "linguistic_analysis": {
    "vocabulary": {...},
    "filler_words": {...},
    "hedge_words": {...},
    "power_words": {...},
    "pos_distribution": {...},
    "named_entities": {...},
    "sentence_structure": {...}
  },
  "linguistic_summary": {
    "vocabulary": "...",
    "fillers": "...",
    "confidence": "...",
    "structure": "..."
  }
}
```

### New Chat Endpoint
```python
POST /chat

# Request:
{
  "reportId": "abc123",
  "message": "How can I reduce filler words?",
  "history": []  # Optional chat history
}

# Response:
{
  "response": "Based on your speech, you used 'um' 8 times...",
  "reportId": "abc123"
}
```

### New Single Report Endpoint
```python
GET /report/<report_id>

# Returns full report with all linguistic analysis
```

## Frontend Integration

### Display Filler Words
```javascript
const fillers = report.linguistic_analysis.filler_words;

// Show percentage
console.log(`Filler words: ${fillers.percentage}%`);

// Show breakdown
fillers.top_3.forEach(([word, count]) => {
  console.log(`${word}: ${count} times`);
});
```

### Display Confidence Metrics
```javascript
const hedges = report.linguistic_analysis.hedge_words.total_count;
const power = report.linguistic_analysis.power_words.total_count;

const confidenceScore = (power / (hedges + power)) * 100;
console.log(`Confidence: ${confidenceScore.toFixed(0)}%`);
```

### Show Named Entities
```javascript
const entities = report.linguistic_analysis.named_entities;

Object.entries(entities.entities_by_type).forEach(([type, items]) => {
  console.log(`${type}: ${items.join(', ')}`);
});
// Output: "ORG: Microsoft, Google, Apple"
```

### Chat Interface
```javascript
async function chat(reportId, message) {
  const res = await fetch('/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reportId, message })
  });
  return await res.json();
}

// Usage
const response = await chat(reportId, "Why is my vocabulary score 78?");
console.log(response.response);
```

## Testing

### Test Linguistic Analysis
```python
from utils.linguistic_analysis import analyze_transcript_complete

text = """
Um, so today I want to talk about, you know, the importance 
of public speaking. I think it's really important. Maybe we 
should practice more. Public speaking can transform your career.
"""

result = analyze_transcript_complete(text)

print(f"Filler words: {result['filler_words']['total_count']}")
print(f"Hedge words: {result['hedge_words']['total_count']}")
print(f"Power words: {result['power_words']['total_count']}")
print(f"Lexical diversity: {result['vocabulary']['lexical_diversity']}")
```

### Test Chat Feature
```bash
curl -X POST http://localhost:5000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "reportId": "your_report_id",
    "message": "How can I improve my vocabulary?"
  }'
```

## Performance Impact

- **Linguistic Analysis**: ~1-2 seconds (minimal overhead)
- **Total Processing**: Still dominated by Whisper transcription
- **Storage**: ~50KB additional data per report (negligible)

## Backward Compatibility

✅ All existing endpoints still work
✅ Old reports still accessible
✅ New fields are additions (not replacements)

## What to Update in Frontend

1. **Display linguistic metrics** in report view
2. **Add chat interface** for conversational feedback
3. **Show filler word breakdown** with charts
4. **Display confidence ratio** as progress bar
5. **Show named entities** as tags
6. **Add detailed vocabulary insights** section

## Common Use Cases

### 1. Reduce Filler Words
```javascript
// Track filler word reduction over time
const sessions = await getUserReports(userId);
const fillerTrend = sessions.map(s => ({
  date: s.createdAt,
  percentage: s.linguistic_analysis.filler_words.percentage
}));
// Plot trend chart
```

### 2. Improve Confidence
```javascript
// Show confidence ratio
const analysis = report.linguistic_analysis;
const confidenceRatio = 
  analysis.power_words.total_count / 
  (analysis.hedge_words.total_count + analysis.power_words.total_count);

if (confidenceRatio < 0.5) {
  console.log("Tip: Use more assertive language");
}
```

### 3. Vocabulary Diversity
```javascript
// Show lexical diversity score
const diversity = report.linguistic_analysis.vocabulary.lexical_diversity;

if (diversity < 0.5) {
  console.log("Try using more varied vocabulary");
} else if (diversity > 0.7) {
  console.log("Excellent vocabulary diversity!");
}
```

## Troubleshooting

### spaCy model not found
```bash
python -m spacy download en_core_web_sm
```

### Import errors
```bash
pip install -r requirements.txt
```

### Slow processing
- Linguistic analysis is fast (~1-2s)
- If slow, check Whisper transcription settings
- Consider using smaller Whisper model for speed

## Next Steps

1. ✅ Install spaCy and download model
2. ✅ Test upload endpoint with new response format
3. ✅ Update frontend to display linguistic metrics
4. ✅ Implement chat interface
5. ✅ Add visualizations for metrics
6. ✅ Track progress over time

## Questions?

Check `INTEGRATION_GUIDE.md` for detailed technical documentation.
