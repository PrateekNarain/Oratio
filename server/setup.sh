#!/bin/bash
# ORATIO Quick Setup Script for Linux/Mac
# This script automates the setup process

echo "============================================================"
echo "  ORATIO Setup Script"
echo "  Setting up the speech analysis system..."
echo "============================================================"
echo ""

# Check Python installation
echo "[1/7] Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    echo "Please install Python 3.10+ from https://www.python.org/"
    exit 1
fi
python3 --version
echo ""

# Create virtual environment
echo "[2/7] Creating virtual environment..."
if [ -d "venv" ]; then
    echo "Virtual environment already exists, skipping..."
else
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to create virtual environment"
        exit 1
    fi
    echo "Virtual environment created successfully"
fi
echo ""

# Activate virtual environment
echo "[3/7] Activating virtual environment..."
source venv/bin/activate
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to activate virtual environment"
    exit 1
fi
echo "Virtual environment activated"
echo ""

# Upgrade pip
echo "[4/7] Upgrading pip..."
python -m pip install --upgrade pip
echo ""

# Install requirements
echo "[5/7] Installing Python packages (this may take 10-15 minutes)..."
echo "This will download PyTorch with CUDA 11.8 support and other dependencies"
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install requirements"
    exit 1
fi
echo ""

# Download spaCy model
echo "[6/7] Downloading spaCy language model..."
python -m spacy download en_core_web_sm
if [ $? -ne 0 ]; then
    echo "WARNING: Failed to download spaCy model"
    echo "You may need to run this manually: python -m spacy download en_core_web_sm"
fi
echo ""

# Verify setup
echo "[7/7] Verifying installation..."
python verify_setup.py
echo ""

# Check for .env file
if [ ! -f ".env" ]; then
    echo "============================================================"
    echo "  IMPORTANT: Environment Configuration Required"
    echo "============================================================"
    echo ""
    echo "You need to create a .env file with the following variables:"
    echo ""
    echo "MONGODB_URI=your_mongodb_connection_string"
    echo "GOOGLE_API_KEY=your_gemini_api_key"
    echo ""
    echo "Please create this file before running the application."
    echo ""
fi

echo "============================================================"
echo "  Setup Complete!"
echo "============================================================"
echo ""
echo "Next steps:"
echo "1. Make sure FFmpeg is installed (check with: ffmpeg -version)"
echo "2. Create/update .env file with your API keys"
echo "3. Run the application: python app.py"
echo ""
echo "To activate the virtual environment in the future, run:"
echo "  source venv/bin/activate"
echo ""
