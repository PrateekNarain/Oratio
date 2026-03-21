# ORATIO Quick Reference

## 🚀 Quick Commands

### Setup (First Time)
```bash
# Windows
setup.bat

# Linux/Mac
chmod +x setup.sh
./setup.sh
```

### Daily Use
```bash
# Activate environment
# Windows:
venv\Scripts\activate

# Linux/Mac:
source venv/bin/activate

# Run server
python app.py

# Verify setup
python verify_setup.py
```

### Testing
```bash
python test_pipeline.py              # Test transcription
python test_detailed_pipeline.py     # Test full analysis
python test_gemini_models.py         # Test AI integration
```

## 📋 Environment Variables (.env)

```env
MONGODB_URI=mongodb://localhost:27017/
GOOGLE_API_KEY=your_api_key_here
```

## 🔧 Troubleshooting Commands

### Check Python
```bash
python --version                     # Should be 3.10+
```

### Check CUDA
```bash
python -c "import torch; print(torch.cuda.is_available())"
```

### Check FFmpeg
```bash
ffmpeg -version
```

### Check Packages
```bash
pip list                             # List all packages
pip show torch                       # Check specific package
```

### Reinstall Requirements
```bash
pip install -r requirements.txt --force-reinstall
```

### Download spaCy Model
```bash
python -m spacy download en_core_web_sm
```

## 📦 Package Versions (CUDA 11.8)

| Package | Version | Purpose |
|---------|---------|---------|
| Python | 3.10+ | Runtime |
| PyTorch | 2.5.1+cu118 | Deep Learning |
| Transformers | 4.46.3 | Whisper Model |
| SpeechBrain | 1.0.3 | Emotion Recognition |
| DeepFace | 0.0.95 | Face Analysis |
| spaCy | 3.8.2 | NLP |
| Flask | 3.0.3 | Web Framework |

## 🎯 API Endpoints

### Upload & Analyze
```bash
POST /upload
Body: multipart/form-data
- file: video/audio file
- userId: user identifier
- title: session title
- context: speech context
```

### Get Report
```bash
GET /report/:reportId
```

### User Reports
```bash
GET /user-reports?userId=xxx        # Overall stats
GET /user-reports-list?userId=xxx   # All reports
```

### Chat
```bash
POST /chat
Body: JSON
{
  "reportId": "xxx",
  "message": "question",
  "history": []
}
```

## 📊 Analysis Scores

### Vocabulary (0-100)
- 90-100: Excellent variety and sophistication
- 70-89: Good vocabulary with minor issues
- 50-69: Basic vocabulary, needs improvement
- 30-49: Limited variety, repetitive
- 0-29: Poor vocabulary usage

### Voice (0-100)
- 90-100: Excellent expressiveness and clarity
- 70-89: Good emotional range
- 50-69: Average expressiveness
- 30-49: Limited emotional range
- 0-29: Monotone or unclear

### Expressions (0-100)
- 90-100: Dynamic and engaging
- 70-89: Mostly appropriate
- 50-69: Average dynamism
- 30-49: Limited expressiveness
- 0-29: Flat or inappropriate

## 🔍 Linguistic Metrics

- **Lexical Diversity**: Unique words / Total words
- **Filler Words**: um, uh, like, you know, etc.
- **Hedge Words**: maybe, perhaps, might, etc.
- **Power Words**: achieve, proven, excellent, etc.
- **Weak Words**: try, hope, seems, etc.
- **Transitions**: however, therefore, for example, etc.
- **POS Distribution**: Nouns, verbs, adjectives, etc.
- **Named Entities**: People, places, organizations, etc.

## 💾 File Locations

```
server/
├── venv/                    # Virtual environment
├── uploads/                 # Temporary uploads (auto-created)
├── output/                  # Analysis outputs (auto-created)
├── tmp_emotion_model/       # Emotion model cache (auto-created)
├── .env                     # Your environment config (create this)
└── app.py                   # Main application
```

## 🌐 URLs

- **Local Server**: http://localhost:5000
- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
- **Gemini API**: https://makersuite.google.com/app/apikey
- **FFmpeg Download**: https://ffmpeg.org/download.html

## 🆘 Common Issues

### "CUDA not available"
- Install NVIDIA drivers
- Reinstall PyTorch with CUDA 11.8
- Check: `nvidia-smi`

### "FFmpeg not found"
- Install FFmpeg
- Add to system PATH
- Restart terminal

### "Module not found"
- Activate virtual environment
- Run: `pip install -r requirements.txt`

### "MongoDB connection failed"
- Check MongoDB is running
- Verify .env file
- Check connection string

### "Out of memory"
- Use CPU mode
- Process shorter videos
- Close other applications

## 📞 Getting Help

1. Run: `python verify_setup.py`
2. Check: `SETUP_GUIDE.md`
3. Review: Error messages carefully
4. Verify: All prerequisites installed

## 🎓 Model Info

### Whisper Medium
- Size: ~1.5GB
- Purpose: Speech transcription
- Language: English (multilingual capable)
- Accuracy: High

### Wav2Vec2 IEMOCAP
- Size: ~400MB
- Purpose: Emotion recognition
- Emotions: Happy, Sad, Angry, Neutral
- Sample Rate: 16kHz

### DeepFace
- Size: ~500MB
- Purpose: Facial expression analysis
- Emotions: 7 basic emotions
- Backend: Multiple models

### spaCy en_core_web_sm
- Size: ~50MB
- Purpose: NLP and linguistic analysis
- Features: POS, NER, dependencies

## ⚡ Performance Tips

### GPU Users
- Ensure CUDA 11.8 installed
- 2-3x faster than CPU
- Recommended for production

### CPU Users
- Still fully functional
- Slower processing (2-5 min for 5 min video)
- Consider shorter clips

### Optimization
- Close unnecessary applications
- Use SSD for model storage
- Ensure adequate RAM (16GB+)

---

**Quick Start**: Run `setup.bat` (Windows) or `./setup.sh` (Linux/Mac), create `.env` file, then `python app.py`
