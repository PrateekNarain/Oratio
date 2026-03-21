# ORATIO Installation Checklist

Use this checklist to ensure a smooth installation process.

## 📋 Pre-Installation Checklist

### System Requirements
- [ ] Windows 10/11, Linux (Ubuntu 20.04+), or macOS 10.15+
- [ ] 8GB+ RAM (16GB recommended)
- [ ] 20GB+ free disk space
- [ ] Stable internet connection (for downloads)

### Software Prerequisites
- [ ] Python 3.10 or higher installed
  - Check: `python --version` or `python3 --version`
  - Download: https://www.python.org/downloads/

- [ ] FFmpeg installed
  - Check: `ffmpeg -version`
  - Windows: https://ffmpeg.org/download.html
  - Linux: `sudo apt-get install ffmpeg`
  - Mac: `brew install ffmpeg`

- [ ] MongoDB installed OR MongoDB Atlas account
  - Local: https://www.mongodb.com/try/download/community
  - Cloud: https://www.mongodb.com/cloud/atlas

- [ ] (Optional) CUDA 11.8 for GPU acceleration
  - Check: `nvidia-smi`
  - Download: https://developer.nvidia.com/cuda-11-8-0-download-archive

### API Keys Ready
- [ ] Google Gemini API key obtained
  - Get it: https://makersuite.google.com/app/apikey
  - Free tier available

- [ ] MongoDB connection string ready
  - Local: `mongodb://localhost:27017/`
  - Atlas: `mongodb+srv://username:password@cluster.mongodb.net/`

## 🚀 Installation Steps

### Step 1: Project Setup
- [ ] Downloaded/cloned the project
- [ ] Navigated to the `server` directory
- [ ] Verified all files are present

### Step 2: Run Setup Script

**Windows:**
- [ ] Opened Command Prompt or PowerShell
- [ ] Navigated to `server` directory
- [ ] Ran `setup.bat`
- [ ] Setup completed without errors

**Linux/Mac:**
- [ ] Opened Terminal
- [ ] Navigated to `server` directory
- [ ] Made script executable: `chmod +x setup.sh`
- [ ] Ran `./setup.sh`
- [ ] Setup completed without errors

### Step 3: Environment Configuration
- [ ] Copied `.env.example` to `.env`
- [ ] Opened `.env` file in text editor
- [ ] Added MongoDB connection string
- [ ] Added Google Gemini API key
- [ ] Saved the file

### Step 4: Verification
- [ ] Activated virtual environment
  - Windows: `venv\Scripts\activate`
  - Linux/Mac: `source venv/bin/activate`
- [ ] Ran `python verify_setup.py`
- [ ] All checks passed ✓

## ✅ Post-Installation Verification

### Package Verification
- [ ] PyTorch installed
  ```bash
  python -c "import torch; print(torch.__version__)"
  ```
  Expected: `2.5.1+cu118` or similar

- [ ] CUDA available (if GPU present)
  ```bash
  python -c "import torch; print(torch.cuda.is_available())"
  ```
  Expected: `True` (or `False` if using CPU)

- [ ] Transformers installed
  ```bash
  python -c "import transformers; print(transformers.__version__)"
  ```
  Expected: `4.46.3` or similar

- [ ] spaCy model downloaded
  ```bash
  python -c "import spacy; nlp = spacy.load('en_core_web_sm'); print('OK')"
  ```
  Expected: `OK`

- [ ] Flask installed
  ```bash
  python -c "import flask; print(flask.__version__)"
  ```
  Expected: `3.0.3` or similar

### FFmpeg Verification
- [ ] FFmpeg accessible
  ```bash
  ffmpeg -version
  ```
  Expected: Version information displayed

### MongoDB Verification
- [ ] MongoDB connection works
  ```bash
  python -c "import pymongo; client = pymongo.MongoClient('your_connection_string'); print('Connected')"
  ```
  Expected: `Connected`

### Directory Structure
- [ ] `venv/` directory exists (virtual environment)
- [ ] `tmp_emotion_model/` created (or will be on first run)
- [ ] `uploads/` directory exists or will be created
- [ ] `output/` directory exists or will be created

## 🧪 Testing

### Basic Tests
- [ ] Run transcription test
  ```bash
  python test_pipeline.py
  ```
  Expected: Transcription output

- [ ] Run detailed analysis test
  ```bash
  python test_detailed_pipeline.py
  ```
  Expected: Detailed analysis output

- [ ] Run Gemini API test
  ```bash
  python test_gemini_models.py
  ```
  Expected: API response

### Server Test
- [ ] Start the server
  ```bash
  python app.py
  ```
  Expected: Server starts on port 5000

- [ ] Access in browser
  - Open: http://localhost:5000
  - Expected: "Hello World" message

- [ ] Stop the server (Ctrl+C)

## 📊 Model Downloads (First Run)

These will download automatically on first use:

- [ ] Whisper Medium (~1.5GB)
  - Downloads when first transcription runs
  - Cached in `~/.cache/huggingface/`

- [ ] Wav2Vec2 IEMOCAP (~400MB)
  - Downloads when first emotion analysis runs
  - Cached in `tmp_emotion_model/`

- [ ] DeepFace models (~500MB)
  - Downloads when first facial analysis runs
  - Cached in `~/.deepface/`

- [ ] spaCy model (~50MB)
  - Downloaded during setup
  - Located in virtual environment

## 🎯 Ready to Use Checklist

### Development Environment
- [ ] Virtual environment activates successfully
- [ ] All Python packages import without errors
- [ ] FFmpeg accessible from command line
- [ ] MongoDB connection established
- [ ] API keys configured in .env

### Application
- [ ] Server starts without errors
- [ ] Can access http://localhost:5000
- [ ] Test upload works (if you have a test file)
- [ ] Analysis completes successfully

### Optional (GPU)
- [ ] CUDA detected by PyTorch
- [ ] GPU memory available
- [ ] Models run on GPU (check logs)

## 🐛 Troubleshooting Checklist

If something doesn't work:

- [ ] Checked Python version (must be 3.10+)
- [ ] Virtual environment is activated
- [ ] Ran `pip install -r requirements.txt` again
- [ ] FFmpeg is in system PATH
- [ ] .env file exists and has correct values
- [ ] MongoDB is running (if local)
- [ ] Internet connection is stable
- [ ] Sufficient disk space available
- [ ] Reviewed error messages carefully
- [ ] Checked SETUP_GUIDE.md for solutions

## 📝 Common Issues

### Issue: "Python not found"
- [ ] Installed Python 3.10+
- [ ] Added Python to PATH
- [ ] Restarted terminal

### Issue: "pip not found"
- [ ] Ran `python -m pip` instead of `pip`
- [ ] Reinstalled Python with pip option

### Issue: "Virtual environment activation failed"
- [ ] Used correct command for OS
- [ ] Ran as administrator (Windows)
- [ ] Checked execution policy (PowerShell)

### Issue: "Package installation failed"
- [ ] Updated pip: `python -m pip install --upgrade pip`
- [ ] Checked internet connection
- [ ] Tried installing packages individually

### Issue: "CUDA not available"
- [ ] Verified NVIDIA GPU present
- [ ] Installed CUDA 11.8
- [ ] Updated NVIDIA drivers
- [ ] Accepted CPU mode (still works)

### Issue: "FFmpeg not found"
- [ ] Installed FFmpeg
- [ ] Added to system PATH
- [ ] Restarted terminal
- [ ] Verified with `ffmpeg -version`

### Issue: "MongoDB connection failed"
- [ ] Started MongoDB service
- [ ] Checked connection string
- [ ] Verified network access (Atlas)
- [ ] Checked firewall settings

### Issue: "Out of memory"
- [ ] Closed other applications
- [ ] Used CPU instead of GPU
- [ ] Processed shorter videos
- [ ] Increased system swap

## ✨ Success Indicators

You're ready to use ORATIO when:

1. ✅ `python verify_setup.py` shows all green checkmarks
2. ✅ `python app.py` starts without errors
3. ✅ Browser shows "Hello World" at http://localhost:5000
4. ✅ Test scripts run successfully
5. ✅ Can upload and analyze a sample file

## 🎉 Next Steps

After completing this checklist:

1. **Read the documentation**
   - [ ] README.md - Project overview
   - [ ] QUICK_REFERENCE.md - Common commands
   - [ ] SETUP_GUIDE.md - Detailed guide

2. **Try the system**
   - [ ] Upload a test video/audio
   - [ ] Review the analysis results
   - [ ] Explore the API endpoints

3. **Set up the frontend** (if needed)
   - [ ] Navigate to `client/` directory
   - [ ] Run `npm install`
   - [ ] Run `npm run dev`

4. **Customize** (optional)
   - [ ] Adjust model parameters
   - [ ] Modify analysis thresholds
   - [ ] Add custom features

## 📞 Getting Help

If you're stuck:

1. [ ] Reviewed this checklist completely
2. [ ] Checked SETUP_GUIDE.md
3. [ ] Ran `python verify_setup.py`
4. [ ] Reviewed error messages
5. [ ] Checked troubleshooting section

## 📅 Maintenance Checklist

For future updates:

- [ ] Keep Python updated
- [ ] Update packages: `pip install -r requirements.txt --upgrade`
- [ ] Update spaCy model if needed
- [ ] Clear model cache if issues occur
- [ ] Backup .env file before changes

---

**Installation Time Estimate:**
- Setup script: 10-15 minutes
- Model downloads (first run): 10-20 minutes
- Total: 20-35 minutes

**Note:** Most time is spent downloading models. This only happens once!

---

## ✅ Final Confirmation

I confirm that:

- [ ] All prerequisites are installed
- [ ] Setup script completed successfully
- [ ] Environment is configured
- [ ] Verification passed
- [ ] Server starts and runs
- [ ] Ready to use ORATIO!

**Date Completed:** _______________

**System:** Windows / Linux / Mac (circle one)

**GPU:** Yes / No (circle one)

**Notes:** _______________________________________________

---

**Congratulations! You're ready to use ORATIO! 🎉**
