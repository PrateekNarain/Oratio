# Testing Guide for Enhanced Eloquence Pipeline

## Overview

The `test_pipeline.py` script now tests the complete enhanced pipeline including linguistic analysis and chat features.

## Prerequisites

1. **Flask server running**:
   ```bash
   cd server
   flask run
   ```

2. **Test video file**: Update the `VIDEO_PATH` in `test_pipeline.py` to point to your test video

3. **Dependencies installed**:
   ```bash
   pip install -r requirements.txt
   python -m spacy download en_core_web_sm
   ```

## Test Modes

### 1. Full Pipeline Test (Default)

Tests the complete upload and analysis pipeline with enhanced linguistic features.

```bash
python test_pipeline.py
```

**What it tests:**
- Video/audio upload
- Transcription (Whisper)
- Vocal emotion analysis (SpeechBrain)
- Facial emotion analysis (DeepFace)
- **NEW**: Linguistic analysis (spaCy)
- **NEW**: Enhanced reports with metrics
- Score generation
- Database storage

**Output includes:**
- Overall scores (Vocabulary, Voice, Expressions)
- **NEW**: Linguistic summary (quick insights)
- **NEW**: Detailed linguistic metrics:
  - Vocabulary richness (lexical diversity, unique words)
  - Filler words breakdown (um, uh, like, etc.)
  - Hedge words (uncertainty markers)
  - Power words (confident language)
  - Confidence ratio
  - Weak words
  - Transition words
  - Part-of-speech distribution
  - Named entities
  - Sentence structure analysis
  - Passive voice detection
- LLM-generated reports
- Full transcription
- Vocal emotions timeline
- Report ID for chat testing

### 2. Chat Feature Test

Tests the conversational feature with a specific report.

```bash
python test_pipeline.py chat <report_id>
```

**Example:**
```bash
python test_pipeline.py chat 67a1b2c3d4e5f6g7h8i9j0k1
```

**What it tests:**
- Chat endpoint functionality
- Context-aware responses
- Report data retrieval
- Conversational flow with history

**Test questions asked:**
1. "What was my vocabulary score and why?"
2. "How can I reduce my filler words?"
3. "What are my top 3 areas for improvement?"
4. "Can you give me specific examples of weak language I used?"
5. "How confident did I sound overall?"

## Sample Output

### Pipeline Test Output

```
Uploading 'video.mp4' to http://127.0.0.1:5000/upload...
Server responded with status code: 200

✅ Success! Pipeline completed.

================================================================================
 ANALYSIS REPORT FOR: My Presentation
================================================================================

--- SCORES ---
  - Vocabulary:  85 / 100
  - Voice:       78 / 100
  - Expressions: 90 / 100

--- LINGUISTIC SUMMARY ---
  [VOCABULARY]
    Good vocabulary diversity with a lexical diversity score of 0.62.
  [FILLERS]
    Moderate filler word usage (5.1%). Reduce 'um', 'uh'.
  [CONFIDENCE]
    Generally confident, but some uncertainty markers present.
  [STRUCTURE]
    Well-balanced sentence length for clarity.

--- DETAILED LINGUISTIC ANALYSIS ---

  [VOCABULARY RICHNESS]
    Total words: 450
    Unique words: 280
    Lexical diversity: 0.622
    Unique lemmas: 245
    Most common words: presentation(8), team(6), project(5), goal(4), achieve(3)

  [FILLER WORDS]
    Total count: 23
    Percentage: 5.11%
    Top fillers: um(8), uh(7), like(5)

  [HEDGE WORDS (Uncertainty)]
    Total count: 12
    Percentage: 2.67%
    Top hedges: i think(5), maybe(4), probably(3)

  [POWER WORDS (Confidence)]
    Total count: 18
    Percentage: 4.00%
    By category: confidence(8), achievement(5), action(5)

  [CONFIDENCE RATIO]
    60.00% (Power words / Total confidence markers)
    ✓ Strong confident language

  [TRANSITION WORDS]
    Total count: 12
    By type: cause_effect(5), addition(4), contrast(3)

  [PART OF SPEECH DISTRIBUTION]
    Nouns: 120
    Verbs: 85
    Adjectives: 45
    Adverbs: 30
    Verb/Noun ratio: 0.71
      ✓ Good action-oriented language

  [NAMED ENTITIES]
    Total entities: 8
    Types: ORG(3), PERSON(2), GPE(3)
    ORG: Microsoft, Google, Apple
    PERSON: Steve Jobs, Bill Gates

  [SENTENCE STRUCTURE]
    Total sentences: 35
    Avg sentence length: 12.8 words
    Min/Max: 3 / 28 words
    Passive voice: 3 instances
      Example: "The project was completed by our team..."

--- LLM-GENERATED FEEDBACK ---

[Vocabulary Report]
OVERVIEW:
Your vocabulary shows good diversity with a lexical diversity score of 0.62...

[Vocal Tone Report]
The emotional tone of your speech generally matches the business context...

[Expression Report]
Your facial expressions demonstrate good engagement...

--- FULL TRANSCRIPTION ---
Good morning everyone. Today I want to talk about our project...

--- VOCAL EMOTIONS TIMELINE ---
  [0.0s - 4.0s]: neutral
  [4.0s - 8.0s]: happy
  [8.0s - 12.0s]: neutral
  ... and 42 more chunks

================================================================================

💡 TIP: You can now chat with this report using the /chat endpoint!
   Report ID: 67a1b2c3d4e5f6g7h8i9j0k1
================================================================================
```

### Chat Test Output

```
================================================================================
 TESTING CHAT FEATURE
================================================================================

[Question 1]: What was my vocabulary score and why?

[Answer 1]:
Your vocabulary score was 85/100, which is quite good! Here's why:

Strengths:
- Your lexical diversity of 0.62 shows you used a varied vocabulary
- You used 280 unique words out of 450 total words
- Good use of power words (18 instances) like "achieve", "demonstrate"

Areas that lowered the score:
- Filler words at 5.1% (23 instances) - particularly "um" (8x) and "uh" (7x)
- Some hedge words showing uncertainty - "I think" (5x), "maybe" (4x)

To improve to 90+, focus on reducing filler words and using more assertive language.

--------------------------------------------------------------------------------

[Question 2]: How can I reduce my filler words?

[Answer 2]:
Great question! You used 23 filler words (5.1% of your speech). Here's how to reduce them:

Your top fillers:
1. "um" - 8 times
2. "uh" - 7 times  
3. "like" - 5 times

Strategies:
1. Replace with pauses: Instead of "um", take a brief silent pause
2. Practice awareness: Record yourself and count fillers
3. Slow down: Filler words often come from speaking too fast
4. Prepare transitions: Know how you'll move between topics
5. Use "and" or "so" intentionally instead of "um"

Try this: In your next practice, focus on eliminating just "um" first...

--------------------------------------------------------------------------------

✅ Chat test completed!
================================================================================
```

## Understanding the Output

### Linguistic Metrics Explained

**Lexical Diversity (0-1)**
- 0.7+: Excellent variety
- 0.5-0.7: Good variety
- <0.5: Limited variety

**Filler Word Percentage**
- <2%: Excellent
- 2-5%: Good
- 5-10%: Needs improvement
- >10%: Significant issue

**Confidence Ratio (0-1)**
- >0.6: Strong confidence
- 0.4-0.6: Balanced
- <0.4: Shows uncertainty

**Verb/Noun Ratio**
- >0.7: Action-oriented (good)
- 0.5-0.7: Balanced
- <0.5: Too descriptive

## Troubleshooting

### Test fails with "Connection refused"
```bash
# Make sure Flask is running
flask run
```

### spaCy model not found
```bash
python -m spacy download en_core_web_sm
```

### Video file not found
Update `VIDEO_PATH` in `test_pipeline.py`:
```python
VIDEO_PATH = r"C:\path\to\your\video.mp4"
```

### Chat test fails with "Invalid report ID"
1. Run the pipeline test first to get a report ID
2. Copy the report ID from the output
3. Use it in the chat test:
   ```bash
   python test_pipeline.py chat <report_id>
   ```

### Timeout errors
Increase timeout in the script:
```python
response = requests.post(FLASK_URL, files=files, data=data, timeout=600)  # 10 minutes
```

## Manual Testing

### Test Upload Endpoint
```bash
curl -X POST http://localhost:5000/upload \
  -F "file=@video.mp4" \
  -F "userId=test_user" \
  -F "context=Test speech" \
  -F "title=Test"
```

### Test Chat Endpoint
```bash
curl -X POST http://localhost:5000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "reportId": "67a1b2c3d4e5f6g7h8i9j0k1",
    "message": "How can I improve?",
    "history": []
  }'
```

### Test Single Report Endpoint
```bash
curl http://localhost:5000/report/67a1b2c3d4e5f6g7h8i9j0k1
```

## Performance Benchmarks

Typical processing times for a 2-minute video:

- Audio extraction: ~2-3 seconds
- Transcription (Whisper): ~30-60 seconds
- Vocal emotion: ~5-10 seconds
- Facial emotion: ~10-15 seconds
- **Linguistic analysis: ~1-2 seconds** ✨
- Report generation: ~5-10 seconds
- **Total: ~60-100 seconds**

The linguistic analysis adds minimal overhead (<2% of total time) while providing significant value.

## Next Steps

After successful testing:

1. ✅ Verify all metrics are calculated correctly
2. ✅ Check database for stored linguistic data
3. ✅ Test chat feature with various questions
4. ✅ Update frontend to display new metrics
5. ✅ Create visualizations for linguistic data

## Advanced Testing

### Test with Different Speech Types

```python
# Update CONTEXT in test_pipeline.py
CONTEXT = "Business presentation"  # Formal
CONTEXT = "Casual conversation"    # Informal
CONTEXT = "Academic lecture"       # Educational
CONTEXT = "Motivational speech"    # Inspirational
```

Different contexts may show different linguistic patterns.

### Batch Testing

Create a script to test multiple videos:

```python
videos = [
    ("video1.mp4", "Business", "Presentation 1"),
    ("video2.mp4", "Casual", "Practice 1"),
    ("video3.mp4", "Academic", "Lecture 1")
]

for video_path, context, title in videos:
    # Update config and run test
    pass
```

### Compare Results

Track improvements over time:

```python
# Compare filler word reduction
session1_fillers = 5.1%
session2_fillers = 3.8%
improvement = session1_fillers - session2_fillers  # 1.3% improvement!
```

## Support

If you encounter issues:

1. Check Flask logs for errors
2. Verify all dependencies are installed
3. Ensure spaCy model is downloaded
4. Check MongoDB connection
5. Review `INTEGRATION_GUIDE.md` for detailed info
