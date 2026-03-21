# Eloquence System Architecture & Flow

## Table of Contents
1. [System Overview](#system-overview)
2. [Complete Processing Flow](#complete-processing-flow)
3. [Component Architecture](#component-architecture)
4. [Data Flow Diagrams](#data-flow-diagrams)
5. [Token Usage Optimization](#token-usage-optimization)
6. [API Endpoints](#api-endpoints)
7. [Database Schema](#database-schema)

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     ELOQUENCE SYSTEM                             │
│                AI-Powered Speech Analysis Platform               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  INPUT: Video/Audio → ANALYSIS → OUTPUT: Detailed Reports       │
│                                                                   │
│  Technologies:                                                    │
│  • Flask (Backend API)                                           │
│  • Whisper (Transcription)                                       │
│  • SpeechBrain (Vocal Emotion)                                   │
│  • DeepFace (Facial Emotion)                                     │
│  • spaCy (Linguistic Analysis) ⭐ NEW                            │
│  • Gemini AI (Report Generation)                                 │
│  • MongoDB (Data Storage)                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Complete Processing Flow

```
┌──────────────┐
│  User Upload │
│ Video/Audio  │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    STEP 1: PREPROCESSING                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────┐         ┌──────────────────────────────────┐     │
│  │  Video?  │───YES──▶│ Extract Audio (FFmpeg)           │     │
│  └────┬─────┘         │ • In-memory processing           │     │
│       │               │ • 16kHz mono                      │     │
│       NO              │ • Float32 normalized              │     │
│       │               └──────────────────────────────────┘     │
│       ▼                                                          │
│  ┌──────────┐                                                   │
│  │  Audio   │                                                   │
│  │  Ready   │                                                   │
│  └──────────┘                                                   │
└─────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│              STEP 2: PARALLEL ANALYSIS (Phase 1)                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐ │
│  │  TRANSCRIPTION  │  │ VOCAL EMOTION   │  │ FACIAL EMOTION │ │
│  │   (Whisper)     │  │  (SpeechBrain)  │  │   (DeepFace)   │ │
│  ├─────────────────┤  ├─────────────────┤  ├────────────────┤ │
│  │ • Chunk audio   │  │ • 4s chunks     │  │ • 1 FPS sample │ │
│  │ • 30s segments  │  │ • Wav2Vec2      │  │ • OpenCV       │ │
│  │ • Beam search   │  │ • 4 emotions    │  │ • 7 emotions   │ │
│  │ • Overlap 0.5s  │  │ • Timestamps    │  │ • Timestamps   │ │
│  └────────┬────────┘  └────────┬────────┘  └────────┬───────┘ │
│           │                    │                     │          │
│           ▼                    ▼                     ▼          │
│     "Full text..."      [{emotion, time}]    [{emotion, time}] │
└─────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│           STEP 3: LINGUISTIC ANALYSIS (spaCy) ⭐ NEW            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Input: Transcription + Vocal Emotions                          │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  ANALYZE 10+ LINGUISTIC FEATURES:                          │ │
│  │                                                             │ │
│  │  1. Filler Words    → um, uh, like (40+ patterns)         │ │
│  │  2. Hedge Words     → maybe, probably (60+ patterns)       │ │
│  │  3. Power Words     → achieve, proven (130+ words)         │ │
│  │  4. Weak Words      → very, really (30+ patterns)          │ │
│  │  5. Transitions     → however, therefore (40+ words)       │ │
│  │  6. POS Distribution → Nouns, Verbs, Adjectives           │ │
│  │  7. Named Entities  → People, Orgs, Locations             │ │
│  │  8. Passive Voice   → Dependency parsing                   │ │
│  │  9. Sentence Stats  → Length, complexity                   │ │
│  │  10. Lexical Diversity → Unique words / Total words       │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                   │
│  Output: Detailed Linguistic Analysis Object                    │
│  Processing Time: ~1-2 seconds ⚡                                │
└─────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│         STEP 4: AI REPORT GENERATION (Gemini) 🤖                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  REPORT 1: VOCABULARY EVALUATION                         │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │ Input:                                              │  │  │
│  │  │ • Full transcription (~3,500 tokens)               │  │  │
│  │  │ • Linguistic metrics (compact, ~200 tokens)        │  │  │
│  │  │ • Context                                           │  │  │
│  │  │                                                      │  │  │
│  │  │ Output:                                             │  │  │
│  │  │ • Overview (2-3 sentences)                         │  │  │
│  │  │ • Strengths (3-4 bullets with examples)            │  │  │
│  │  │ • Areas for improvement (3-4 bullets)              │  │  │
│  │  │ • Specific recommendations (3-5 items)             │  │  │
│  │  │                                                      │  │  │
│  │  │ Tokens: ~4,500                                      │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ⏱️ Wait 2 seconds (rate limiting)                               │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  REPORT 2: SCORE GENERATION                             │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │ Input:                                              │  │  │
│  │  │ • Full transcription (~3,500 tokens)               │  │  │
│  │  │ • Emotion summary (~50 tokens)                     │  │  │
│  │  │ • Linguistic metrics (~200 tokens)                 │  │  │
│  │  │                                                      │  │  │
│  │  │ Output:                                             │  │  │
│  │  │ • Vocabulary score (0-100)                         │  │  │
│  │  │ • Voice score (0-100)                              │  │  │
│  │  │ • Expressions score (0-100)                        │  │  │
│  │  │                                                      │  │  │
│  │  │ Tokens: ~4,000                                      │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ⏱️ Wait 2 seconds (rate limiting)                               │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  REPORT 3: SPEECH ANALYSIS                              │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │ Input:                                              │  │  │
│  │  │ • Emotion summary (~50 tokens)                     │  │  │
│  │  │ • Linguistic metrics (~200 tokens)                 │  │  │
│  │  │ • Context                                           │  │  │
│  │  │                                                      │  │  │
│  │  │ Output:                                             │  │  │
│  │  │ • 2-3 paragraph detailed report                    │  │  │
│  │  │ • Emotional appropriateness analysis               │  │  │
│  │  │ • Confidence assessment                            │  │  │
│  │  │                                                      │  │  │
│  │  │ Tokens: ~500                                        │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ⏱️ Wait 2 seconds (rate limiting)                               │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  REPORT 4: EXPRESSION ANALYSIS (Video only)             │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │ Input:                                              │  │  │
│  │  │ • Facial emotion data (~300 tokens)                │  │  │
│  │  │                                                      │  │  │
│  │  │ Output:                                             │  │  │
│  │  │ • 1 paragraph report                               │  │  │
│  │  │ • Expression appropriateness                       │  │  │
│  │  │                                                      │  │  │
│  │  │ Tokens: ~500                                        │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  TOTAL TOKENS: ~9,500 per speech ✅                              │
└─────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│              STEP 5: SAVE TO DATABASE (MongoDB)                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Collection: reports                                             │
│  {                                                                │
│    userId, title, context,                                       │
│    transcription,                                                │
│    vocabulary_report, speech_report, expression_report,         │
│    scores: {vocabulary, voice, expressions},                    │
│    linguistic_analysis: {...},  ⭐ NEW                           │
│    linguistic_summary: {...},   ⭐ NEW                           │
│    vocal_emotions: [...]                                         │
│  }                                                                │
│                                                                   │
│  Collection: overall_reports (updated)                          │
│  {                                                                │
│    userId,                                                        │
│    avg_vocabulary, avg_voice, avg_expressions,                  │
│    overall_reports: {voice, expressions, vocabulary}            │
│  }                                                                │
└─────────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────┐
│   Response   │
│  to Client   │
└──────────────┘
```

---

## Component Architecture

### Backend Components

```
┌─────────────────────────────────────────────────────────────────┐
│                         FLASK APPLICATION                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  app.py (Main Application)                               │  │
│  │  • Route handlers                                         │  │
│  │  • Request validation                                     │  │
│  │  • Error handling                                         │  │
│  │  • Database operations                                    │  │
│  │  • Report generation orchestration                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  routes/                                                  │  │
│  │  ├─ auth_routes.py (Authentication)                      │  │
│  │  │  • Login, Signup, JWT tokens                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  utils/ (Processing Modules)                             │  │
│  │  ├─ audioextraction.py                                    │  │
│  │  │  • FFmpeg wrapper                                      │  │
│  │  │  • In-memory audio extraction                         │  │
│  │  │                                                         │  │
│  │  ├─ transcription.py                                      │  │
│  │  │  • Whisper model (medium)                             │  │
│  │  │  • Chunking & overlap                                 │  │
│  │  │  • Duplicate removal                                  │  │
│  │  │                                                         │  │
│  │  ├─ vocals.py                                             │  │
│  │  │  • SpeechBrain emotion recognition                    │  │
│  │  │  • Wav2Vec2 model                                     │  │
│  │  │  • 4-second chunk analysis                            │  │
│  │  │                                                         │  │
│  │  ├─ expressions.py                                        │  │
│  │  │  • DeepFace emotion detection                         │  │
│  │  │  • Frame sampling (1 FPS)                             │  │
│  │  │  • 7 emotion categories                               │  │
│  │  │                                                         │  │
│  │  ├─ linguistic_analysis.py ⭐ NEW                         │  │
│  │  │  • spaCy NLP pipeline                                 │  │
│  │  │  • 10+ linguistic features                            │  │
│  │  │  • Pattern matching (300+ patterns)                   │  │
│  │  │  • POS tagging, NER, dependency parsing              │  │
│  │  │                                                         │  │
│  │  └─ vocabulary.py                                         │  │
│  │     • Gemini API integration                             │  │
│  │     • Prompt engineering                                 │  │
│  │     • Retry logic with rate limiting                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow Between Components

```
┌──────────┐
│  Upload  │
└────┬─────┘
     │
     ▼
┌─────────────────┐
│ audioextraction │──────┐
└─────────────────┘      │
                         ▼
                    ┌──────────┐
                    │  Audio   │
                    │  Data    │
                    └────┬─────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌───────────────┐ ┌────────────┐ ┌──────────────┐
│transcription  │ │   vocals   │ │ expressions  │
└───────┬───────┘ └─────┬──────┘ └──────┬───────┘
        │               │               │
        │               └───────┬───────┘
        │                       │
        ▼                       │
┌──────────────────┐            │
│linguistic_analysis│◄───────────┘
└────────┬──────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  vocabulary.py (Gemini API)         │
│  • Vocabulary report generation     │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  app.py (Gemini API)                │
│  • Score generation                 │
│  • Speech report                    │
│  • Expression report                │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  MongoDB                            │
│  • Save complete report             │
│  • Update overall reports           │
└─────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Linguistic Analysis Detail

```
┌─────────────────────────────────────────────────────────────────┐
│              LINGUISTIC ANALYSIS PIPELINE (spaCy)                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  INPUT: "Thank you. So my father used to always tell me..."     │
│         (13,920 characters)                                      │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  STEP 1: spaCy Processing                                  │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ • Tokenization                                        │ │ │
│  │  │ • Sentence segmentation                               │ │ │
│  │  │ • POS tagging                                         │ │ │
│  │  │ • Lemmatization                                       │ │ │
│  │  │ • Dependency parsing                                  │ │ │
│  │  │ • Named Entity Recognition                            │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  STEP 2: Pattern Matching                                  │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ Filler Words (40+ patterns)                          │ │ │
│  │  │ ├─ "um" found 8 times                                │ │ │
│  │  │ ├─ "uh" found 7 times                                │ │ │
│  │  │ └─ "like" found 5 times                              │ │ │
│  │  │                                                        │ │ │
│  │  │ Hedge Words (60+ patterns)                           │ │ │
│  │  │ ├─ "I think" found 5 times                           │ │ │
│  │  │ ├─ "maybe" found 4 times                             │ │ │
│  │  │ └─ "probably" found 3 times                          │ │ │
│  │  │                                                        │ │ │
│  │  │ Power Words (130+ words)                             │ │ │
│  │  │ ├─ "achieve" found 3 times                           │ │ │
│  │  │ ├─ "demonstrate" found 2 times                       │ │ │
│  │  │ └─ "proven" found 1 time                             │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  STEP 3: Statistical Analysis                              │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ • Total words: 2,847                                 │ │ │
│  │  │ • Unique words: 1,234                                │ │ │
│  │  │ • Lexical diversity: 0.622                           │ │ │
│  │  │ • Sentences: 35                                      │ │ │
│  │  │ • Avg sentence length: 12.8 words                    │ │ │
│  │  │ • Passive voice: 3 instances                         │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  OUTPUT: Structured JSON with 10+ metrics                       │
│  Processing Time: 1-2 seconds                                    │
└─────────────────────────────────────────────────────────────────┘
```

### Token Usage Optimization

```
┌─────────────────────────────────────────────────────────────────┐
│                    TOKEN USAGE BREAKDOWN                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  BEFORE OPTIMIZATION (❌ 208,500 tokens):                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Vocabulary Report:                                          │ │
│  │ ├─ Transcription: 3,500 tokens                             │ │
│  │ ├─ Linguistic data (FULL DICTS): 50,000 tokens ❌          │ │
│  │ └─ Instructions: 300 tokens                                │ │
│  │ TOTAL: 53,800 tokens                                        │ │
│  │                                                              │ │
│  │ Overall Reports (3 previous):                               │ │
│  │ ├─ Full reports with transcriptions: 150,000 tokens ❌     │ │
│  │ └─ Instructions: 300 tokens                                │ │
│  │ TOTAL: 150,300 tokens                                       │ │
│  │                                                              │ │
│  │ Other reports: 4,400 tokens                                │ │
│  │                                                              │ │
│  │ GRAND TOTAL: 208,500 tokens ❌ HITS LIMIT!                 │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  AFTER OPTIMIZATION (✅ 16,000 tokens):                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Vocabulary Report:                                          │ │
│  │ ├─ Transcription: 3,500 tokens ✅                          │ │
│  │ ├─ Linguistic data (COMPACT): 200 tokens ✅                │ │
│  │ └─ Instructions: 300 tokens                                │ │
│  │ TOTAL: 4,000 tokens                                         │ │
│  │                                                              │ │
│  │ Score Generation:                                           │ │
│  │ ├─ Transcription: 3,500 tokens ✅                          │ │
│  │ ├─ Emotion summary: 50 tokens ✅                           │ │
│  │ ├─ Linguistic data: 200 tokens ✅                          │ │
│  │ └─ Instructions: 300 tokens                                │ │
│  │ TOTAL: 4,050 tokens                                         │ │
│  │                                                              │ │
│  │ Speech Report:                                              │ │
│  │ ├─ Emotion summary: 50 tokens ✅                           │ │
│  │ ├─ Linguistic data: 200 tokens ✅                          │ │
│  │ └─ Instructions: 300 tokens                                │ │
│  │ TOTAL: 550 tokens                                           │ │
│  │                                                              │ │
│  │ Expression Report:                                          │ │
│  │ ├─ Emotion data: 300 tokens ✅                             │ │
│  │ └─ Instructions: 200 tokens                                │ │
│  │ TOTAL: 500 tokens                                           │ │
│  │                                                              │ │
│  │ Overall Reports (10 previous):                              │ │
│  │ ├─ Compact summaries only: 3,000 tokens ✅                 │ │
│  │ └─ Instructions: 300 tokens                                │ │
│  │ TOTAL: 3,300 tokens                                         │ │
│  │                                                              │ │
│  │ GRAND TOTAL: 12,400 tokens ✅ 94% REDUCTION!               │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  KEY OPTIMIZATIONS:                                              │
│  • Compact formatting (not full dictionaries)                   │
│  • Emotion summaries (not 268-item lists)                       │
│  • Report summaries (not full historical data)                  │
│  • Kept full transcription where needed for quality             │
└─────────────────────────────────────────────────────────────────┘
```

---
