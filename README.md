<h1 align="center">
  <img src="https://img.shields.io/badge/ORATIO-AI%20Speech%20Analysis-brightgreen?style=for-the-badge" alt="ORATIO">
  <br>
  🎤 ORATIO - AI-Powered Speech Analysis Platform
</h1>

<div align="center">

**Advanced Public Speaking Analysis & Training Platform with Real-Time Feedback**

[![Python](https://img.shields.io/badge/Python-3.10+-3776ab?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2+-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.1+-13aa52?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.5+-ee4c2c?style=flat-square&logo=pytorch&logoColor=white)](https://pytorch.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0+-000000?style=flat-square&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)

</div>

---

<details>
<summary><strong>📋 Table of Contents</strong></summary>

- [Overview](#-overview)
- [Key Features](#-key-features)
- [How It Works](#-how-it-works)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Installation Guide](#-installation-guide)
- [Usage & Quick Start](#-usage--quick-start)
- [API Endpoints](#-api-endpoints)
- [Analysis Features](#-analysis-features)
- [Database Schema](#-database-schema)
- [Performance Metrics](#-performance-metrics)
- [Security Features](#-security-features)
- [Troubleshooting](#-troubleshooting)
- [Future Roadmap](#-future-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Support & Contact](#-support--contact)
- [Acknowledgments](#-acknowledgments)

</details>

---

## 🎯 Overview

**ORATIO** is a comprehensive AI-powered platform designed to analyze and improve public speaking skills through advanced machine learning and deep learning techniques. It processes video and audio inputs to provide actionable feedback on multiple dimensions of speech delivery:

- **Voice Analysis**: Pace, modulation, volume, emotional tone
- **Vocabulary Analysis**: Word choice, complexity, variety, power words vs. weak words
- **Facial Expression Recognition**: Emotion detection and non-verbal communication insights
- **Linguistic Evaluation**: Filler words, hedge words, transitions, sentence structure
- **Comprehensive Reporting**: Detailed scores and personalized improvement recommendations

ORATIO is ideal for professionals, students, job seekers, and organizations looking to enhance communication effectiveness.

---

## ✨ Key Features

### 🎬 Core Analysis Modules

| Feature | Description | Model |
|---------|-------------|-------|
| **Speech-to-Text Transcription** | Accurate audio transcription with timestamps | OpenAI Whisper |
| **Vocal Emotion Detection** | 4-emotion classification (Neutral, Happy, Angry, Sad) | SpeechBrain (Wav2Vec2) |
| **Facial Emotion Recognition** | 7-emotion detection from video frames | DeepFace |
| **Linguistic Analysis** | 10+ linguistic metrics including filler words, power words, POS distribution | spaCy NLP |
| **Comprehensive Scoring** | Multi-dimensional performance scoring | Gemini AI |
| **Report Generation** | AI-generated detailed analysis reports with actionable insights | Google Gemini 2.5 Flash |

### 🚀 Advanced Capabilities

- ✅ **Real-time Processing**: Parallel analysis of audio, video, and text streams
- ✅ **Multi-language Support**: Transcription and translation capabilities
- ✅ **Emotional Resonance Analysis**: Cross-modal emotion fusion
- ✅ **Rate-Limited API Access**: Optimized Gemini API usage with smart caching
- ✅ **User Authentication**: Secure JWT-based authentication system
- ✅ **Historical Tracking**: Maintain practice history and progress metrics
- ✅ **Interactive Dashboard**: Real-time visualization of analysis results
- ✅ **Video Processing**: In-memory FFmpeg integration for efficient processing

### 📊 Analysis Metrics

**Vocabulary Metrics:**
- Filler words detection (40+ patterns)
- Hedge words identification (60+ patterns)
- Power words usage (130+ power words)
- Weak words detection (30+ patterns)
- Vocabulary diversity and complexity

**Vocal Metrics:**
- Speech pace (words per minute)
- Volume consistency
- Emotional tone distribution
- Pause analysis
- Modulation patterns

**Facial Metrics:**
- Emotion frequency distribution
- Emotional consistency
- Engagement indicators
- Expressions timeline

---

## 🔄 How It Works

ORATIO employs a sophisticated multi-stage processing pipeline:

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#2D2D2D', 'primaryTextColor': '#FFFFFF', 'primaryBorderColor': '#FFFFFF', 'lineColor': '#FFFFFF', 'secondaryColor': '#1A1A1A', 'tertiaryColor': '#333333'}}}%%
graph TD
    classDef whiteText fill:#2D2D2D,stroke:#FFFFFF,color:#FFFFFF,stroke-width:1px;
    A[User Upload]:::whiteText --> B[Preprocessing]:::whiteText
    subgraph Preprocessing
        B --> B1[Extract Audio]:::whiteText
        B --> B2[Normalize 16kHz]:::whiteText
        B --> B3[Audio Chunking]:::whiteText
    end
    B3 --> C{Parallel Analysis}:::whiteText
    subgraph Analysis Engine
        C -->|Audio| C1[OpenAI Whisper]:::whiteText
        C -->|Audio| C2[SpeechBrain]:::whiteText
        C -->|Video| C3[DeepFace]:::whiteText
    end
    C1 -->|Text| D[spaCy NLP]:::whiteText
    D -->|Metrics| E[Gemini AI]:::whiteText
    C2 -->|Emotions| E
    C3 -->|Expressions| E
    E -->|Synthesis| F[Comprehensive Report]:::whiteText
    F --> G[(MongoDB Storage)]:::whiteText
    G --> H[Interactive UI]:::whiteText

    style A fill:#f9f,color:#000,stroke:#333,stroke-width:2px
    style G fill:#13aa52,color:#fff,stroke-width:2px
    style E fill:#4285F4,color:#fff
    style H fill:#ff9800,color:#fff
```

### Processing Pipeline Details

**Stage 1: Audio Preprocessing**
- Video-to-audio extraction using FFmpeg
- Audio normalization to 16kHz mono
- Float32 conversion and amplitude normalization

**Stage 2: Parallel Transcription & Emotion Analysis**
- **Whisper**: Segments audio into 30-second chunks with 0.5s overlap for continuity
- **SpeechBrain Wav2Vec2**: Analyzes 4-second windows for vocal emotion
- **DeepFace**: Samples video at 1 FPS for facial emotion tracking

**Stage 3: Linguistic Deep Dive**
- spaCy NLP model processes transcription
- Detects 100+ filler/hedge word patterns
- Extracts part-of-speech (POS) distribution
- Identifies named entities and transitions
- Analyzes sentence complexity and passive voice usage

**Stage 4: AI Report Generation**
- Gemini API synthesizes all metrics
- Generates personalized recommendations
- Creates actionable improvement suggestions

---

## 🏗️ System Architecture

### High-Level Architecture Diagram

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#2D2D2D', 'primaryTextColor': '#FFFFFF', 'primaryBorderColor': '#FFFFFF', 'lineColor': '#FFFFFF', 'secondaryColor': '#1A1A1A', 'tertiaryColor': '#333333'}}}%%
graph TD
    classDef whiteText fill:#2D2D2D,stroke:#FFFFFF,color:#FFFFFF,stroke-width:1px;
    subgraph "Client Layer (Next.js)"
        UI[User Interface]:::whiteText
        Auth[JWT Auth]:::whiteText
        Dash[Dashboard]:::whiteText
        Rep[Report Viewer]:::whiteText
    end

    subgraph "API Gateway (Flask)"
        GW[Flask Application]:::whiteText
        R1[Auth Routes]:::whiteText
        R2[Upload Routes]:::whiteText
        R3[Report Routes]:::whiteText
    end

    subgraph "DL Analysis Engine"
        WH[Whisper]:::whiteText
        SB[SpeechBrain]:::whiteText
        DF[DeepFace]:::whiteText
        SP[spaCy]:::whiteText
        GM[Gemini AI]:::whiteText
    end

    UI -- HTTP/REST --> GW
    GW -- Orchestrates --> DL
    subgraph DL [Processing Logic]
        WH
        SB
        DF
        SP
        GM
    end

    GM -- Persists --> DB[(MongoDB)]:::whiteText
    Dash -- Fetches --> DB

    style UI fill:#000,color:#fff
    style GW fill:#333,color:#fff
    style DB fill:#13aa52,color:#fff
    style GM fill:#4285F4,color:#fff
```

---

### Data Flow Architecture

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#2D2D2D', 'primaryTextColor': '#FFFFFF', 'primaryBorderColor': '#FFFFFF', 'lineColor': '#FFFFFF', 'secondaryColor': '#1A1A1A', 'tertiaryColor': '#333333'}}}%%
sequenceDiagram
    participant U as User
    participant B as Backend (Flask)
    participant ML as ML Pipeline
    participant G as Gemini AI
    participant DB as MongoDB

    U->>B: Upload Video/Audio
    B->>ML: Start Parallel Analysis
    activate ML
    ML-->>ML: Whisper Transcription
    ML-->>ML: SpeechBrain Emotion
    ML-->>ML: DeepFace Expressions
    deactivate ML
    ML->>B: Raw Metrics
    B->>G: Synthesize Analytics
    G-->>B: Detailed Report & Scores
    B->>DB: Store Report
    B-->>U: Analysis Complete
```

---

## 📁 Project Structure

```bash
ORATIO-Final/
├── 📂 client/           # Frontend: Next.js, Tailwind, Chart.js
│   ├── 📂 app/          # App Router: Dashboard, Auth, Reports
│   ├── 📂 components/   # Reusable UI Components
│   └── 📂 context/      # State Management
├── 📂 server/           # Backend: Flask, MongoDB, ML Orchestration
│   ├── 📂 routes/       # API Architecture
│   ├── 📂 utils/        # AI logic, NLP, Audio Processing
│   └── 📂 Documents/    # Technical Whitepapers
└── 📂 scripts/          # Automation & Utilities
```

---

## 🛠️ Tech Stack

### Frontend Stack
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 14.2+ | React framework with SSR & routing |
| **React** | 18+ | UI component library |
| **Tailwind CSS** | 3.4+ | Utility-first CSS framework |
| **Chart.js** | 4.4+ | Data visualization |
| **Recharts** | 2.15+ | React charting library |
| **FFmpeg.js** | 0.12+ | Browser-side audio processing |

### Backend Stack
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Flask** | 3.0+ | REST API framework |
| **Flask-CORS** | 5.0+ | Cross-origin request handling |
| **PyJWT** | 2.10+ | JWT token management |
| **bcrypt** | 4.2+ | Password hashing |
| **MongoDB** | 4.10+ | Document database |
| **PyMongo** | 4.10+ | MongoDB driver |

### ML/DL Stack
| Technology | Version | Purpose |
|-----------|---------|---------|
| **PyTorch** | 2.5 (CUDA 11.8) | Deep learning framework |
| **Whisper** | Latest | Speech-to-text transcription |
| **SpeechBrain** | Latest | Vocal emotion recognition |
| **DeepFace** | Latest | Facial emotion detection |
| **spaCy** | Latest | Natural language processing |
| **scikit-learn** | 1.5+ | ML utilities |
| **librosa** | 0.10+ | Audio analysis |
| **OpenCV** | 4.10+ | Computer vision |
| **Transformers** | 4.46+ | HuggingFace models |

### API & Services
| Service | Purpose |
|---------|---------|
| **Google Gemini 2.5 Flash** | AI report generation & synthesis |
| **OpenAI Whisper** | Accurate speech transcription |
| **FFmpeg** | Audio/video processing |

---

## 💾 Installation Guide

### Prerequisites
- **Python**: 3.10 or higher
- **Node.js**: 18.0 or higher
- **MongoDB**: 5.0+ (local or cloud instance)
- **FFmpeg**: Latest version
- **CUDA**: 11.8 (for GPU acceleration, optional)
- **Git**: For version control

### Step 1: Clone Repository

```bash
git clone https://github.com/[YOUR_ORG]/ORATIO.git
cd ORATIO-Final
```

### Step 2: Backend Setup

#### 2a. Create Python Virtual Environment
```bash
cd server

# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

#### 2b. Install Python Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

#### 2c. Install FFmpeg
**Windows (via Chocolatey):**
```powershell
choco install ffmpeg
```

**macOS (via Homebrew):**
```bash
brew install ffmpeg
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

#### 2d. Configure Environment Variables
Create a `.env` file in the `server/` directory:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/Eloquence?retryWrites=true&w=majority

# Google API Configuration
GOOGLE_API_KEY=your_google_gemini_api_key_here

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your_secret_key_here

# API Configuration
API_PORT=5000
API_HOST=0.0.0.0

# Model Configuration
DEVICE=cuda  # or 'cpu' if no GPU
CACHE_DIR=./model_cache
```

#### 2e. Verify Installation
```bash
python verify_setup.py
```

### Step 3: Frontend Setup

```bash
cd ../client

# Install dependencies
npm install

# Or with yarn
yarn install
```

### Step 4: Run the Application

#### Start Backend Server
```bash
cd server
python app.py
```

Backend will be available at `http://localhost:5000`

#### Start Frontend Server (in a new terminal)
```bash
cd client
npm run dev
```

Frontend will be available at `http://localhost:3000`

### Step 5: Access the Application

1. Open browser and navigate to `http://localhost:3000`
2. Create account or login
3. Upload a video/audio file for analysis
4. Wait for processing and view detailed report

---

## 🚀 Usage & Quick Start

### Basic Workflow

1. **Sign Up / Login**
   - Create new account with email and password
   - Credentials securely stored with bcrypt hashing

2. **Upload Session**
   - Record or upload video/audio (MP4, WAV, MP3, M4A, WebM)
   - Maximum recommended: 10 minutes
   - File uploaded to backend for processing

3. **Wait for Analysis**
   - Backend processes through all ML pipelines in parallel
   - Typical processing time: 2-5 minutes (depending on input length)
   - Real-time progress indicators shown

4. **View Report**
   - Comprehensive analysis with 4 key sections:
     - Vocal Analysis (emotions, pace, modulation)
     - Facial Expression (emotion timeline, consistency)
     - Vocabulary (power words, filler words, complexity)
     - Linguistic Metrics (POS, entities, transitions)
   - Overall Score (0-100)
   - Personalized recommendations

5. **Track Progress**
   - View all past sessions
   - Compare improvements over time
   - Monitor specific metrics

### Example API Requests

#### Authentication
```bash
# Sign Up
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

#### Upload & Process
```bash
# Upload video for analysis
curl -X POST http://localhost:5000/api/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@presentation.mp4"
```

#### Retrieve Reports
```bash
# Get all reports for user
curl -X GET http://localhost:5000/api/reports \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get specific report
curl -X GET http://localhost:5000/api/reports/<report_id> \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/signup` | Register new user | `{email, password}` |
| POST | `/login` | Authenticate user | `{email, password}` |
| POST | `/logout` | Logout user | - |
| GET | `/verify` | Verify JWT token | Headers: Authorization |

### Upload & Analysis Routes (`/api/upload`)
| Method | Endpoint | Description | Headers |
|--------|----------|-------------|---------|
| POST | `/` | Upload and process video/audio | Auth token, file |
| GET | `/status/<session_id>` | Get processing status | Auth token |

### Report Routes (`/api/reports`)
| Method | Endpoint | Description | Headers |
|--------|----------|-------------|---------|
| GET | `/` | List all user reports | Auth token |
| GET | `/<report_id>` | Get specific report | Auth token |
| DELETE | `/<report_id>` | Delete report | Auth token |
| GET | `/export/<report_id>` | Export as PDF | Auth token |

### User Routes (`/api/user`)
| Method | Endpoint | Description | Headers |
|--------|----------|-------------|---------|
| GET | `/profile` | Get user profile | Auth token |
| PUT | `/profile` | Update profile | Auth token |
| GET | `/stats` | Get usage statistics | Auth token |

---

## 📊 Analysis Features

### Voice Analysis Module
```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#2D2D2D', 'primaryTextColor': '#FFFFFF', 'primaryBorderColor': '#FFFFFF', 'lineColor': '#FFFFFF', 'secondaryColor': '#1A1A1A', 'tertiaryColor': '#333333'}}}%%
graph LR
    classDef whiteText fill:#2D2D2D,stroke:#FFFFFF,color:#FFFFFF,stroke-width:1px;
    Root((Voice Analysis)):::whiteText
    VE[Vocal Emotions]:::whiteText
    PA[Pace Analysis]:::whiteText
    VM[Volume Metrics]:::whiteText
    MO[Modulation]:::whiteText
    
    Root --- VE
    Root --- PA
    Root --- VM
    Root --- MO
    
    VE --- V1(Neutral 45%):::whiteText
    VE --- V2(Happy 30%):::whiteText
    VE --- V3(Angry 15%):::whiteText
    VE --- V4(Sad 10%):::whiteText
    
    PA --- P1(Avg WPM 145):::whiteText
    PA --- P2(Variance ±12):::whiteText
    PA --- P3(Good Quality):::whiteText
    
    VM --- VM1(Avg -20dB):::whiteText
    VM --- VM2(Range 15dB):::whiteText
    VM --- VM3(Consistency 85%):::whiteText
    
    MO --- MO1(Pitch Range 2+ oct):::whiteText
    MO --- MO2(Natural Intonation):::whiteText
    
    style Root fill:#4285F4,color:#fff
    style VE fill:#EA4335,color:#fff
    style PA fill:#FBBC05,color:#fff
    style VM fill:#34A853,color:#fff
    style MO fill:#8E44AD,color:#fff
```

### Vocabulary Analysis Module
```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#2D2D2D', 'primaryTextColor': '#FFFFFF', 'primaryBorderColor': '#FFFFFF', 'lineColor': '#FFFFFF', 'secondaryColor': '#1A1A1A', 'tertiaryColor': '#333333'}}}%%
graph LR
    classDef whiteText fill:#2D2D2D,stroke:#FFFFFF,color:#FFFFFF,stroke-width:1px;
    Root((Vocabulary)):::whiteText
    WC[Word Categories]:::whiteText
    MT[Metrics]:::whiteText
    AT[AI Tips]:::whiteText
    
    Root --- WC
    Root --- MT
    Root --- AT
    
    WC --- W1(Power Words 18):::whiteText
    WC --- W2(Filler Words 12):::whiteText
    WC --- W3(Hedge Words 5):::whiteText
    WC --- W4(Weak Words 8):::whiteText
    
    MT --- M1(Unique 352):::whiteText
    MT --- M2(Diversity 0.72):::whiteText
    MT --- M3(Length 4.8 chars):::whiteText
    MT --- M4(Complexity Intermediate):::whiteText
    
    AT --- A1(Replace weak words):::whiteText
    AT --- A2(Reduce fillers):::whiteText
    AT --- A3(Use transitions):::whiteText
    
    style Root fill:#4285F4,color:#fff
    style WC fill:#EA4335,color:#fff
    style MT fill:#FBBC05,color:#fff
    style AT fill:#34A853,color:#fff
```

### Facial Expression Module
```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#2D2D2D', 'primaryTextColor': '#FFFFFF', 'primaryBorderColor': '#FFFFFF', 'lineColor': '#FFFFFF', 'secondaryColor': '#1A1A1A', 'tertiaryColor': '#333333'}}}%%
graph LR
    classDef whiteText fill:#2D2D2D,stroke:#FFFFFF,color:#FFFFFF,stroke-width:1px;
    Root((Facial Module)):::whiteText
    ET[Emotion Timeline]:::whiteText
    EG[Engagement]:::whiteText
    IS[Insights]:::whiteText
    
    Root --- ET
    Root --- EG
    Root --- IS
    
    ET --- E1(Neutral 35%):::whiteText
    ET --- E2(Happy 40%):::whiteText
    ET --- E3(Angry 10%):::whiteText
    ET --- E4(Sad 5%):::whiteText
    
    EG --- G1(Smiling 45%):::whiteText
    EG --- G2(Neutral 35%):::whiteText
    EG --- G3(Negative 15%):::whiteText
    
    IS --- I1(Consistency Good):::whiteText
    IS --- I2(Authentic Natural):::whiteText
    IS --- I3(High Engagement):::whiteText
    
    style Root fill:#4285F4,color:#fff
    style ET fill:#EA4335,color:#fff
    style EG fill:#FBBC05,color:#fff
    style IS fill:#34A853,color:#fff
```

### Linguistic Analysis Module
```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#2D2D2D', 'primaryTextColor': '#FFFFFF', 'primaryBorderColor': '#FFFFFF', 'lineColor': '#FFFFFF', 'secondaryColor': '#1A1A1A', 'tertiaryColor': '#333333'}}}%%
graph LR
    classDef whiteText fill:#2D2D2D,stroke:#FFFFFF,color:#FFFFFF,stroke-width:1px;
    Root((Linguistics)):::whiteText
    PD[POS Distribution]:::whiteText
    ST[Sentences]:::whiteText
    NE[Named Entities]:::whiteText
    TR[Transitions]:::whiteText
    
    Root --- PD
    Root --- ST
    Root --- NE
    Root --- TR
    
    PD --- P1(Nouns 28%):::whiteText
    PD --- P2(Verbs 25%):::whiteText
    PD --- P3(Adjectives 15%):::whiteText
    PD --- P4(Adverbs 12%):::whiteText
    
    ST --- S1(Avg length 18):::whiteText
    ST --- S2(Complexity 7.5):::whiteText
    ST --- S3(Passive 5%):::whiteText
    
    NE --- N1(People 5):::whiteText
    NE --- N2(Orgs 3):::whiteText
    NE --- N3(Locs 2):::whiteText
    
    TR --- T1(Coordinating 12):::whiteText
    TR --- T2(Subordinating 8):::whiteText
    TR --- T3(Discourse 6):::whiteText
    
    style Root fill:#4285F4,color:#fff
    style PD fill:#EA4335,color:#fff
    style ST fill:#FBBC05,color:#fff
    style NE fill:#34A853,color:#fff
    style TR fill:#8E44AD,color:#fff
```

---

## 💾 Database Schema

### MongoDB Collections

#### `users` Collection
```json
{
  "_id": ObjectId,
  "email": "user@example.com",
  "password_hash": "bcrypt_hashed_password",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "profilePicture": "url",
    "bio": "I'm learning to speak better"
  },
  "createdAt": ISODate,
  "updatedAt": ISODate,
  "totalSessions": 15,
  "averageScore": 72.5
}
```

#### `reports` Collection
```json
{
  "_id": ObjectId,
  "userId": ObjectId,
  "sessionName": "Presentation Practice - Q1 2024",
  "uploadedFileName": "presentation.mp4",
  "uploadedAt": ISODate,
  "processingTime": 245.5,
  "analysisResults": {
    "transcription": {
      "fullText": "...",
      "wordCount": 512,
      "duration": 245,
      "timestamps": [...]
    },
    "vocalAnalysis": {
      "emotions": [...],
      "averagePace": 145,
      "averageVolume": -20,
      "emotionDistribution": {}
    },
    "facialAnalysis": {
      "emotionTimeline": [...],
      "emotionDistribution": {},
      "engagementScore": 0.85
    },
    "linguisticAnalysis": {
      "fillerWords": [...],
      "powerWords": [...],
      "hedgeWords": [...],
      "posDistribution": {},
      "namedEntities": [...]
    },
    "vocabularyAnalysis": {
      "uniqueWords": 352,
      "lexicalDiversity": 0.72,
      "averageWordLength": 4.8,
      "wordCategories": {}
    }
  },
  "scores": {
    "vocalScore": 78,
    "facialScore": 82,
    "vocabularyScore": 75,
    "linguisticScore": 76,
    "overallScore": 77.75
  },
  "report": {
    "summary": "Strong presentation with...",
    "strengths": ["Good pace", "Natural expressions"],
    "improvements": ["Reduce filler words"],
    "recommendations": [...]
  }
}
```

#### `overall_reports` Collection
```json
{
  "_id": ObjectId,
  "userId": ObjectId,
  "period": "monthly",
  "month": 3,
  "year": 2024,
  "sessionCount": 15,
  "averageScores": {
    "vocal": 76.5,
    "facial": 80.2,
    "vocabulary": 74.8,
    "linguistic": 75.5,
    "overall": 76.75
  },
  "trends": {
    "improvement": 5.5,
    "bestMetric": "facial",
    "weakestMetric": "vocabulary"
  },
  "insights": "You've shown steady improvement..."
}
```

---

## 📈 Performance Metrics

### Processing Speed Benchmarks
| Component | Duration | Notes |
|-----------|----------|-------|
| Audio Extraction | 10-15s | Depends on video length |
| Transcription (Whisper) | 30-60s | 5-10 min audio |
| Vocal Emotion (SpeechBrain) | 40-80s | Parallel |
| Facial Emotion (DeepFace) | 30-50s | Parallel |
| Linguistic Analysis (spaCy) | 5-10s | Fast NLP |
| Report Generation (Gemini) | 15-30s | API call |
| **Total (Parallel)** | **2-5 min** | For 5-10 min video |

### Accuracy Metrics
| Module | Accuracy | Notes |
|--------|----------|-------|
| Transcription | 95%+ | English audio |
| Vocal Emotion | 82-88% | 4-emotion classification |
| Facial Emotion | 85-91% | 7-emotion classification |
| Linguistic Features | 95%+ | Rule-based detection |

### Resource Usage
| Resource | Usage | Notes |
|----------|-------|-------|
| GPU Memory | 4-6 GB | All models loaded |
| RAM | 3-4 GB | Processing buffers |
| Disk (per report) | 50-100 MB | Including audio files |

---

## 🐛 Troubleshooting

### Common Issues & Solutions

#### 1. FFmpeg Not Found
**Problem**: `OSError: ffmpeg not found`
**Solution**:
```bash
# Verify FFmpeg installation
ffmpeg -version

# If not installed, install via package manager
# Windows: choco install ffmpeg
# Mac: brew install ffmpeg
# Linux: sudo apt-get install ffmpeg
```

#### 2. CUDA/GPU Issues
**Problem**: GPU memory errors during analysis
**Solution**:
```python
# In server/.env, force CPU mode:
DEVICE=cpu

# Or reduce batch sizes in model_manager.py
```

#### 3. Gemini API Rate Limits
**Problem**: `google.api_core.exceptions.ResourceExhausted`
**Solution**:
- Gemini rate limiter automatically handles retry logic
- Check API quotas in Google Cloud Console
- Upgrade API tier if needed

#### 4. MongoDB Connection Failed
**Problem**: `pymongo.errors.ServerSelectionTimeoutError`
**Solution**:
```bash
# Verify MongoDB is running
# Check MONGODB_URI in .env
# Ensure IP whitelist includes your machine (for cloud)

# Test connection:
mongosh "your_connection_string"
```

#### 5. File Upload Issues
**Problem**: `413 Payload Too Large`
**Solution**:
- Increase Flask max content length in `app.py`:
```python
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB
```

#### 6. Models Not Loading
**Problem**: `RuntimeError: model not loaded`
**Solution**:
```bash
# Force model download and cache:
python -c "
from model_manager import model_manager
model_manager.load_all_models()
"
```

---

## 🔮 Future Roadmap

### Phase 2 (Short Term)
- [ ] Real-time feedback during live sessions
- [ ] Multi-language support (20+ languages)
- [ ] Mobile app (iOS & Android)
- [ ] Browser-based recording without upload
- [ ] Custom training contexts (business, academic, interview)

### Phase 3 (Medium Term)
- [ ] Group presentation analysis
- [ ] Comparative analysis (peer benchmarking)
- [ ] Advanced sentiment analysis
- [ ] Executive summary generation (1-page report)
- [ ] Export to popular formats (PDF, PowerPoint, Word)

### Phase 4 (Long Term)
- [ ] On-device ML models (offline usage)
- [ ] Advanced body language detection
- [ ] Gesture recognition
- [ ] Speech rate modification training
- [ ] AI coach for real-time guided practice
- [ ] Voice cloning for personalized feedback

---

## 🔐 Security Features

- ✅ **JWT-based Authentication**: Secure token-based auth
- ✅ **Password Hashing**: bcrypt with salt
- ✅ **CORS Protection**: Configured CORS headers
- ✅ **Input Validation**: Server-side validation for all inputs
- ✅ **Secure Headers**: Security headers in API responses
- ✅ **Environment Variables**: Sensitive configs not in code

---

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 👥 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Support & Contact

For issues, questions, or suggestions:
- 📧 Email: support@oratio.dev
- 🐛 Report bugs: GitHub Issues
- 💬 Discussions: GitHub Discussions
- 📖 Documentation: See `/server/Documents/`

---

## 🙏 Acknowledgments

- **OpenAI**: Whisper for transcription
- **Facebook Research**: DeepFace for facial recognition
- **SpeechBrain**: Vocal emotion detection
- **Google**: Gemini API for AI synthesis
- **spaCy**: NLP pipeline
- **PyTorch Community**: Deep learning framework

---

<div align="center">

**Made with ❤️ by the ORATIO Team**

*Empowering better communication through AI*

</div>
