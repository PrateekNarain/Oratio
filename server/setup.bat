@echo off
REM ORATIO Quick Setup Script for Windows
REM This script automates the setup process

echo ============================================================
echo   ORATIO Setup Script
echo   Setting up the speech analysis system...
echo ============================================================
echo.

REM Check Python installation
echo [1/7] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.10+ from https://www.python.org/
    pause
    exit /b 1
)
python --version
echo.

REM Create virtual environment
echo [2/7] Creating virtual environment...
if exist venv (
    echo Virtual environment already exists, skipping...
) else (
    python -m venv venv
    if errorlevel 1 (
        echo ERROR: Failed to create virtual environment
        pause
        exit /b 1
    )
    echo Virtual environment created successfully
)
echo.

REM Activate virtual environment
echo [3/7] Activating virtual environment...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ERROR: Failed to activate virtual environment
    pause
    exit /b 1
)
echo Virtual environment activated
echo.

REM Upgrade pip
echo [4/7] Upgrading pip...
python -m pip install --upgrade pip
echo.

REM Install requirements
echo [5/7] Installing Python packages (this may take 10-15 minutes)...
echo This will download PyTorch with CUDA 11.8 support and other dependencies
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install requirements
    pause
    exit /b 1
)
echo.

REM Download spaCy model
echo [6/7] Downloading spaCy language model...
python -m spacy download en_core_web_sm
if errorlevel 1 (
    echo WARNING: Failed to download spaCy model
    echo You may need to run this manually: python -m spacy download en_core_web_sm
)
echo.

REM Verify setup
echo [7/7] Verifying installation...
python verify_setup.py
echo.

REM Check for .env file
if not exist .env (
    echo ============================================================
    echo   IMPORTANT: Environment Configuration Required
    echo ============================================================
    echo.
    echo You need to create a .env file with the following variables:
    echo.
    echo MONGODB_URI=your_mongodb_connection_string
    echo GOOGLE_API_KEY=your_gemini_api_key
    echo.
    echo Please create this file before running the application.
    echo.
)

echo ============================================================
echo   Setup Complete!
echo ============================================================
echo.
echo Next steps:
echo 1. Make sure FFmpeg is installed (check with: ffmpeg -version)
echo 2. Create/update .env file with your API keys
echo 3. Run the application: python app.py
echo.
echo To activate the virtual environment in the future, run:
echo   venv\Scripts\activate
echo.
pause
