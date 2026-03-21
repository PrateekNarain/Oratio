# ORATIO Setup Guide

Complete setup instructions for running the ORATIO speech analysis system.

## Prerequisites

- **Python 3.10 or higher** (3.10 recommended)
- **CUDA 11.8** (for GPU acceleration - optional but recommended)
- **FFmpeg** (required for audio/video processing)
- **MongoDB** (local or cloud instance)
- **Google Gemini API Key** (for AI analysis)

## Quick Start

### 1. Clone and Navigate

```bash
cd server
```

### 2. Create Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Linux/Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

This will install all required packages including PyTorch with CUDA 11.8 support.

### 4. Download spaCy Model

```bash
python -m spacy download en_core_web_sm
```

### 5. Install FFmpeg

**Windows:**
1. Download from https://ffmpeg.org/download.html
2. Extract and add to PATH
3. Verify: `ffmpeg -version`

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

**Mac:**
```bash
brew install ffmpeg
```

### 6. Configure Environment Variables

Create a `.env` file in the `server` directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/

# Google Gemini API Key
GOOGLE_API_KEY=your_gemini_api_key_here

# Optional: Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
```

**Get API Keys:**
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Google Gemini: https://makersuite.google.com/app/apikey

### 7. Verify Installation

**Check Python packages:**
```bash
pip list
```

**Check CUDA (if using GPU):**
```bash
python -c "import torch; print(f'CUDA available: {torch.cuda.is_available()}'); print(f'CUDA version: {torch.version.cuda}')"
```

**Check FFmpeg:**
```bash
ffmpeg -version
```

### 8. Run the Application

```bash
python app.py
```

The server should start on `http://localhost:5000`

## First Run Notes

### Model Downloads

On first run, the system will automatically download several large models:

1. **Whisper Medium** (~1.5GB) - Speech transcription
2. **Wav2Vec2 IEMOCAP** (~400MB) - Emotion recognition
3. **DeepFace models** (~500MB) - Facial expression analysis
4. **spaCy model** (~50MB) - Linguistic analysis

These are cached locally and only downloaded once.

### Expected Directory Structure

After setup, you should have:

```
server/
├── venv/                          # Virtual environment
├── tmp_emotion_model/             # SpeechBrain emotion model (auto-created)
├── pretrained_models/             # Cached models (auto-created)
├── uploads/                       # Temporary upload folder (auto-created)
├── output/                        # Analysis outputs (auto-created)
├── app.py                         # Main application
├── requirements.txt               # Dependencies
├── .env                           # Environment variables (you create this)
├── routes/                        # API routes
├── utils/                         # Utility functions
└── ...
```

## Testing the Setup

### Test Individual Components

**Test transcription:**
```bash
python test_pipeline.py
```

**Test detailed analysis:**
```bash
python test_detailed_pipeline.py
```

**Test Gemini API:**
```bash
python test_gemini_models.py
```

### Test API Endpoints

Use Postman, curl, or the client application to test:

```bash
# Health check
curl http://localhost:5000/

# Upload and analyze (requires file)
curl -X POST http://localhost:5000/upload \
  -F "file=@your_video.mp4" \
  -F "userId=test_user_123" \
  -F "title=Test Speech" \
  -F "context=Practice presentation"
```

## Troubleshooting

### CUDA Issues

**Problem:** CUDA not detected
```bash
# Check NVIDIA driver
nvidia-smi

# Reinstall PyTorch with correct CUDA version
pip uninstall torch torchaudio torchvision
pip install torch==2.5.1+cu118 torchaudio==2.5.1+cu118 torchvision==0.20.1+cu118 --extra-index-url https://download.pytorch.org/whl/cu118
```

### FFmpeg Issues

**Problem:** FFmpeg not found
- Ensure FFmpeg is in your system PATH
- Restart terminal after installation
- Test: `ffmpeg -version`

### MongoDB Connection Issues

**Problem:** Cannot connect to MongoDB
- Check MongoDB is running: `mongod --version`
- Verify connection string in `.env`
- For Atlas, check network access and IP whitelist

### Memory Issues

**Problem:** Out of memory errors
- Reduce batch sizes in model processing
- Use CPU instead of GPU for some models
- Close other applications
- Increase system swap/page file

### Model Download Issues

**Problem:** Models fail to download
- Check internet connection
- Try manual download and placement
- Clear cache: `rm -rf ~/.cache/huggingface/`

### Import Errors

**Problem:** Module not found
```bash
# Ensure virtual environment is activated
# Reinstall requirements
pip install -r requirements.txt --force-reinstall
```

## Performance Optimization

### For GPU Users (CUDA 11.8)

- Ensure CUDA drivers are up to date
- Use GPU for Whisper, Wav2Vec2, and DeepFace
- Expected processing: ~2-3x faster than CPU

### For CPU Users

- Processing will be slower but functional
- Expect 2-5 minutes for a 5-minute video
- Consider using smaller models if needed

## System Requirements

### Minimum
- Python 3.10+
- 8GB RAM
- 10GB free disk space
- Dual-core CPU

### Recommended
- Python 3.10+
- 16GB RAM
- 20GB free disk space
- Quad-core CPU or better
- NVIDIA GPU with 6GB+ VRAM
- CUDA 11.8

## Additional Resources

- **Flask Documentation:** https://flask.palletsprojects.com/
- **PyTorch Documentation:** https://pytorch.org/docs/
- **Transformers Documentation:** https://huggingface.co/docs/transformers/
- **spaCy Documentation:** https://spacy.io/usage
- **MongoDB Documentation:** https://docs.mongodb.com/

## Getting Help

If you encounter issues:

1. Check the error message carefully
2. Verify all prerequisites are installed
3. Check the `.env` file configuration
4. Review the troubleshooting section
5. Check model download status
6. Verify FFmpeg installation

## Next Steps

After successful setup:

1. Start the Flask server: `python app.py`
2. Set up the client application (see `client/README.md`)
3. Test with sample videos
4. Review the API documentation
5. Explore the analysis pipeline

---

**Note:** First-time setup may take 15-30 minutes due to model downloads. Subsequent runs will be much faster.
