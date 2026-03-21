# ORATIO Analysis Pipeline - Mermaid Diagram

## Complete Analysis Flow

```mermaid
flowchart TD
    Start([User Uploads File]) --> FileCheck{File Type?}
    
    FileCheck -->|Video .mp4| VideoPath[Video Processing Path]
    FileCheck -->|Audio .wav/.mp3/.m4a| AudioPath[Audio Processing Path]
    
    VideoPath --> ExtractAudio[Extract Audio to Memory<br/>FFmpeg → NumPy Array<br/>16kHz, Mono]
    VideoPath --> FacialAnalysis[Facial Expression Analysis<br/>DeepFace + OpenCV<br/>Sample 1 FPS]
    
    AudioPath --> DirectAudio[Load Audio File<br/>Direct Path]
    AudioPath --> NoFacial[No Facial Analysis<br/>Audio Only Mode]
    
    ExtractAudio --> Transcription
    DirectAudio --> Transcription
    
    Transcription[Speech Transcription<br/>Whisper Medium<br/>30s Chunks + Overlap]
    
    Transcription --> VocalEmotion[Vocal Emotion Analysis<br/>Wav2Vec2 IEMOCAP<br/>4s Chunks]
    
    FacialAnalysis --> EmotionData[(Facial Emotion Data<br/>7 Emotions<br/>Timestamped)]
    NoFacial --> EmptyEmotion[(Empty DataFrame<br/>Audio Mode)]
    
    VocalEmotion --> VocalData[(Vocal Emotion Data<br/>Happy/Sad/Angry/Neutral<br/>Timestamped)]
    
    Transcription --> LinguisticAnalysis[Detailed Linguistic Analysis<br/>spaCy NLP Engine]
    
    LinguisticAnalysis --> LA1[Vocabulary Analysis<br/>• Lexical Diversity<br/>• Word Frequency<br/>• Most Common Words]
    LinguisticAnalysis --> LA2[Filler Words Detection<br/>• um, uh, like, you know<br/>• Percentage Calculation<br/>• Top 3 Fillers]
    LinguisticAnalysis --> LA3[Confidence Markers<br/>• Hedge Words<br/>• Power Words<br/>• Weak Words]
    LinguisticAnalysis --> LA4[Speech Patterns<br/>• Transitions<br/>• POS Distribution<br/>• Named Entities]
    
    LA1 --> LinguisticData
    LA2 --> LinguisticData
    LA3 --> LinguisticData
    LA4 --> LinguisticData
    
    LinguisticData[(Complete Linguistic Data<br/>12+ Metrics)]
    
    VocalData --> VocabularyEval
    LinguisticData --> VocabularyEval[Vocabulary Evaluation<br/>Google Gemini 2.5 Flash<br/>Context-Aware]
    Transcription --> VocabularyEval
    
    VocabularyEval --> VocabReport[Vocabulary Report<br/>• Strengths<br/>• Improvements<br/>• Recommendations]
    
    Transcription --> ScoreGen
    VocalData --> ScoreGen
    EmotionData --> ScoreGen
    EmptyEmotion --> ScoreGen
    LinguisticData --> ScoreGen
    
    ScoreGen[Generate Scores<br/>Google Gemini 2.5 Flash<br/>JSON Output]
    
    ScoreGen --> Scores[Scores 0-100<br/>• Vocabulary<br/>• Voice<br/>• Expressions]
    
    Transcription --> SpeechReport
    VocalData --> SpeechReport
    LinguisticData --> SpeechReport
    
    SpeechReport[Speech Report Generation<br/>Google Gemini 2.5 Flash<br/>2-3 Paragraphs]
    
    SpeechReport --> SpeechText[Speech Analysis<br/>• Emotional Tone<br/>• Clarity<br/>• Confidence]
    
    EmotionData --> ExpressionReport
    EmptyEmotion --> NoExprReport
    
    ExpressionReport[Expression Report<br/>Google Gemini 2.5 Flash<br/>1 Paragraph]
    
    ExpressionReport --> ExprText[Expression Analysis<br/>• Appropriateness<br/>• Dynamism<br/>• Consistency]
    
    NoExprReport[Audio Mode Message<br/>No Expression Analysis]
    
    LinguisticData --> LingSummary[Generate Linguistic Summary<br/>Rule-Based Analysis]
    
    LingSummary --> SummaryText[Summary Insights<br/>• Vocabulary Quality<br/>• Filler Usage<br/>• Confidence Level]
    
    VocabReport --> SaveReport
    Scores --> SaveReport
    SpeechText --> SaveReport
    ExprText --> SaveReport
    NoExprReport --> SaveReport
    SummaryText --> SaveReport
    LinguisticData --> SaveReport
    VocalData --> SaveReport
    Transcription --> SaveReport
    
    SaveReport[Save to MongoDB<br/>Reports Collection]
    
    SaveReport --> UpdateOverall[Update Overall Reports<br/>Calculate Averages<br/>Generate Trends]
    
    UpdateOverall --> Complete([Analysis Complete<br/>Return Report to User])
    
    style Start fill:#4CAF50,stroke:#2E7D32,color:#fff
    style Complete fill:#4CAF50,stroke:#2E7D32,color:#fff
    style Transcription fill:#2196F3,stroke:#1565C0,color:#fff
    style VocalEmotion fill:#2196F3,stroke:#1565C0,color:#fff
    style FacialAnalysis fill:#2196F3,stroke:#1565C0,color:#fff
    style LinguisticAnalysis fill:#9C27B0,stroke:#6A1B9A,color:#fff
    style ScoreGen fill:#FF9800,stroke:#E65100,color:#fff
    style VocabularyEval fill:#FF9800,stroke:#E65100,color:#fff
    style SpeechReport fill:#FF9800,stroke:#E65100,color:#fff
    style ExpressionReport fill:#FF9800,stroke:#E65100,color:#fff
    style SaveReport fill:#F44336,stroke:#C62828,color:#fff
```

## Simplified High-Level Flow

```mermaid
flowchart LR
    A[Upload File] --> B[Audio Extraction]
    B --> C[Transcription<br/>Whisper]
    B --> D[Vocal Emotion<br/>Wav2Vec2]
    A --> E[Facial Analysis<br/>DeepFace]
    C --> F[Linguistic Analysis<br/>spaCy]
    C --> G[AI Evaluation<br/>Gemini]
    D --> G
    E --> G
    F --> G
    G --> H[Generate Report]
    H --> I[Save to Database]
    
    style A fill:#4CAF50,color:#fff
    style C fill:#2196F3,color:#fff
    style D fill:#2196F3,color:#fff
    style E fill:#2196F3,color:#fff
    style F fill:#9C27B0,color:#fff
    style G fill:#FF9800,color:#fff
    style I fill:#F44336,color:#fff
```

## Model Architecture

```mermaid
graph TB
    subgraph Input["Input Layer"]
        Video[Video File .mp4]
        Audio[Audio File .wav/.mp3/.m4a]
    end
    
    subgraph Processing["Processing Layer"]
        Whisper[Whisper Medium<br/>1.5GB Model<br/>Speech-to-Text]
        Wav2Vec[Wav2Vec2 IEMOCAP<br/>400MB Model<br/>Emotion Recognition]
        DeepFace[DeepFace<br/>500MB Models<br/>Facial Analysis]
        SpaCy[spaCy en_core_web_sm<br/>50MB Model<br/>NLP Analysis]
    end
    
    subgraph AI["AI Analysis Layer"]
        Gemini[Google Gemini 2.5 Flash<br/>Cloud API<br/>Report Generation]
    end
    
    subgraph Output["Output Layer"]
        Report[Comprehensive Report<br/>• Scores<br/>• Feedback<br/>• Insights]
        Database[(MongoDB<br/>User Data<br/>History)]
    end
    
    Video --> Whisper
    Video --> Wav2Vec
    Video --> DeepFace
    Audio --> Whisper
    Audio --> Wav2Vec
    
    Whisper --> SpaCy
    Whisper --> Gemini
    Wav2Vec --> Gemini
    DeepFace --> Gemini
    SpaCy --> Gemini
    
    Gemini --> Report
    Report --> Database
    
    style Whisper fill:#2196F3,color:#fff
    style Wav2Vec fill:#2196F3,color:#fff
    style DeepFace fill:#2196F3,color:#fff
    style SpaCy fill:#9C27B0,color:#fff
    style Gemini fill:#FF9800,color:#fff
    style Database fill:#F44336,color:#fff
```

## Data Flow with Metrics

```mermaid
flowchart TD
    Upload[File Upload] --> Audio[Audio Data<br/>16kHz Mono]
    
    Audio --> T[Transcription]
    T --> Text[Full Text Transcript]
    
    Audio --> V[Vocal Analysis]
    V --> VE[Vocal Emotions<br/>4s Chunks<br/>Happy/Sad/Angry/Neutral]
    
    Upload --> F[Facial Analysis]
    F --> FE[Facial Emotions<br/>1 FPS Sampling<br/>7 Basic Emotions]
    
    Text --> L[Linguistic Analysis]
    
    L --> L1[Vocabulary Metrics<br/>• 500 words, 250 unique<br/>• Diversity: 0.50<br/>• Top words: the, and, is]
    
    L --> L2[Filler Analysis<br/>• Total: 15 fillers<br/>• Percentage: 3%<br/>• Top: um, like, uh]
    
    L --> L3[Confidence Markers<br/>• Power: 8 words<br/>• Hedge: 12 words<br/>• Weak: 10 words]
    
    L --> L4[Structure Analysis<br/>• 25 sentences<br/>• Avg length: 20 words<br/>• 5 transitions]
    
    Text --> AI[Gemini AI]
    VE --> AI
    FE --> AI
    L1 --> AI
    L2 --> AI
    L3 --> AI
    L4 --> AI
    
    AI --> S1[Vocabulary Score<br/>85/100]
    AI --> S2[Voice Score<br/>78/100]
    AI --> S3[Expression Score<br/>90/100]
    
    AI --> R1[Vocabulary Report<br/>Strengths & Improvements]
    AI --> R2[Speech Report<br/>Tone & Clarity Analysis]
    AI --> R3[Expression Report<br/>Facial Appropriateness]
    
    S1 --> DB[(MongoDB)]
    S2 --> DB
    S3 --> DB
    R1 --> DB
    R2 --> DB
    R3 --> DB
    
    style Upload fill:#4CAF50,color:#fff
    style AI fill:#FF9800,color:#fff
    style DB fill:#F44336,color:#fff
```

## Timeline View

```mermaid
gantt
    title ORATIO Analysis Pipeline Timeline
    dateFormat X
    axisFormat %Ss
    
    section Upload
    File Upload & Validation    :0, 2s
    
    section Audio Processing
    Audio Extraction (Video)     :2, 5s
    Transcription (Whisper)      :7, 30s
    Vocal Emotion (Wav2Vec2)     :7, 15s
    
    section Video Processing
    Facial Analysis (DeepFace)   :2, 20s
    
    section NLP Analysis
    Linguistic Analysis (spaCy)  :37, 5s
    
    section AI Generation
    Vocabulary Evaluation        :42, 8s
    Score Generation             :50, 6s
    Speech Report                :56, 8s
    Expression Report            :64, 6s
    
    section Storage
    Save to Database             :70, 2s
    Update Overall Reports       :72, 3s
```

## Component Interaction

```mermaid
sequenceDiagram
    participant User
    participant Flask
    participant Audio as Audio Utils
    participant Video as Video Utils
    participant Whisper
    participant Wav2Vec2
    participant DeepFace
    participant spaCy
    participant Gemini
    participant MongoDB
    
    User->>Flask: Upload File
    Flask->>Flask: Validate File
    
    alt Video File
        Flask->>Audio: Extract Audio
        Audio-->>Flask: Audio Array
        Flask->>Video: Analyze Faces
        Video->>DeepFace: Process Frames
        DeepFace-->>Video: Emotions
        Video-->>Flask: Facial Data
    else Audio File
        Flask->>Flask: Load Audio
    end
    
    Flask->>Whisper: Transcribe
    Whisper-->>Flask: Text
    
    Flask->>Wav2Vec2: Analyze Emotion
    Wav2Vec2-->>Flask: Vocal Emotions
    
    Flask->>spaCy: Linguistic Analysis
    spaCy-->>Flask: Metrics
    
    Flask->>Gemini: Generate Scores
    Gemini-->>Flask: Scores (0-100)
    
    Flask->>Gemini: Generate Reports
    Gemini-->>Flask: Detailed Reports
    
    Flask->>MongoDB: Save Report
    MongoDB-->>Flask: Report ID
    
    Flask->>MongoDB: Update Overall
    MongoDB-->>Flask: Success
    
    Flask-->>User: Complete Report
```

## Legend

- 🟢 **Green**: Start/End points
- 🔵 **Blue**: ML Model Processing (Whisper, Wav2Vec2, DeepFace)
- 🟣 **Purple**: NLP Analysis (spaCy)
- 🟠 **Orange**: AI Generation (Gemini)
- 🔴 **Red**: Database Operations (MongoDB)

## Key Metrics

| Stage | Model | Size | Processing Time | Output |
|-------|-------|------|----------------|--------|
| Transcription | Whisper Medium | 1.5GB | ~30s for 5min audio | Full text transcript |
| Vocal Emotion | Wav2Vec2 IEMOCAP | 400MB | ~15s for 5min audio | Emotion per 4s chunk |
| Facial Analysis | DeepFace | 500MB | ~20s for 5min video | Emotion per second |
| Linguistic | spaCy | 50MB | ~5s | 12+ metrics |
| AI Reports | Gemini API | Cloud | ~20s total | Scores + Reports |

**Total Processing Time**: ~60-90 seconds for a 5-minute video
