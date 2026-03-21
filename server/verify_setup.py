"""
Setup Verification Script for ORATIO
Run this script to verify all dependencies are correctly installed
"""

import sys
import subprocess

def print_header(text):
    print("\n" + "="*70)
    print(f"  {text}")
    print("="*70)

def print_success(text):
    print(f"✓ {text}")

def print_error(text):
    print(f"✗ {text}")

def print_warning(text):
    print(f"⚠ {text}")

def check_python_version():
    print_header("Checking Python Version")
    version = sys.version_info
    version_str = f"{version.major}.{version.minor}.{version.micro}"
    print(f"Python version: {version_str}")
    
    if version.major == 3 and version.minor >= 10:
        print_success("Python version is compatible (3.10+)")
        return True
    else:
        print_error("Python 3.10 or higher is required")
        return False

def check_package(package_name, import_name=None):
    if import_name is None:
        import_name = package_name
    
    try:
        __import__(import_name)
        print_success(f"{package_name} is installed")
        return True
    except ImportError:
        print_error(f"{package_name} is NOT installed")
        return False

def check_pytorch_cuda():
    print_header("Checking PyTorch and CUDA")
    try:
        import torch
        print_success(f"PyTorch version: {torch.__version__}")
        
        if torch.cuda.is_available():
            print_success(f"CUDA is available")
            print(f"  CUDA version: {torch.version.cuda}")
            print(f"  GPU device: {torch.cuda.get_device_name(0)}")
            print(f"  GPU memory: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.2f} GB")
            return True
        else:
            print_warning("CUDA is NOT available - will use CPU (slower)")
            print("  This is OK but GPU is recommended for better performance")
            return True
    except ImportError:
        print_error("PyTorch is NOT installed")
        return False

def check_ffmpeg():
    print_header("Checking FFmpeg")
    try:
        result = subprocess.run(['ffmpeg', '-version'], 
                              capture_output=True, 
                              text=True, 
                              timeout=5)
        if result.returncode == 0:
            version_line = result.stdout.split('\n')[0]
            print_success(f"FFmpeg is installed: {version_line}")
            return True
        else:
            print_error("FFmpeg is installed but not working correctly")
            return False
    except FileNotFoundError:
        print_error("FFmpeg is NOT installed or not in PATH")
        print("  Install from: https://ffmpeg.org/download.html")
        return False
    except Exception as e:
        print_error(f"Error checking FFmpeg: {e}")
        return False

def check_spacy_model():
    print_header("Checking spaCy Model")
    try:
        import spacy
        try:
            nlp = spacy.load("en_core_web_sm")
            print_success("spaCy model 'en_core_web_sm' is installed")
            return True
        except OSError:
            print_error("spaCy model 'en_core_web_sm' is NOT installed")
            print("  Run: python -m spacy download en_core_web_sm")
            return False
    except ImportError:
        print_error("spaCy is NOT installed")
        return False

def check_env_file():
    print_header("Checking Environment Configuration")
    import os
    from pathlib import Path
    
    env_path = Path('.env')
    if env_path.exists():
        print_success(".env file exists")
        
        # Try to load and check key variables
        try:
            from dotenv import load_dotenv
            load_dotenv()
            
            mongodb_uri = os.getenv('MONGODB_URI')
            google_api_key = os.getenv('GOOGLE_API_KEY')
            
            if mongodb_uri:
                print_success("MONGODB_URI is set")
            else:
                print_warning("MONGODB_URI is not set in .env")
            
            if google_api_key:
                print_success("GOOGLE_API_KEY is set")
            else:
                print_warning("GOOGLE_API_KEY is not set in .env")
            
            return True
        except Exception as e:
            print_warning(f"Could not validate .env contents: {e}")
            return True
    else:
        print_error(".env file does NOT exist")
        print("  Create .env file with MONGODB_URI and GOOGLE_API_KEY")
        return False

def check_core_packages():
    print_header("Checking Core Packages")
    
    packages = [
        ('Flask', 'flask'),
        ('Flask-CORS', 'flask_cors'),
        ('PyMongo', 'pymongo'),
        ('NumPy', 'numpy'),
        ('Pandas', 'pandas'),
        ('Librosa', 'librosa'),
        ('OpenCV', 'cv2'),
        ('Transformers', 'transformers'),
        ('SpeechBrain', 'speechbrain'),
        ('DeepFace', 'deepface'),
        ('TensorFlow', 'tensorflow'),
        ('spaCy', 'spacy'),
        ('Google Generative AI', 'google.generativeai'),
        ('python-dotenv', 'dotenv'),
        ('Pillow', 'PIL'),
        ('tqdm', 'tqdm'),
    ]
    
    results = []
    for package_name, import_name in packages:
        results.append(check_package(package_name, import_name))
    
    return all(results)

def check_directories():
    print_header("Checking Required Directories")
    import os
    
    dirs = ['uploads', 'output', 'tmp_emotion_model']
    
    for dir_name in dirs:
        if os.path.exists(dir_name):
            print_success(f"Directory '{dir_name}' exists")
        else:
            print_warning(f"Directory '{dir_name}' does not exist (will be created automatically)")
    
    return True

def main():
    print("\n" + "="*70)
    print("  ORATIO Setup Verification")
    print("  Checking all dependencies and configuration...")
    print("="*70)
    
    results = []
    
    # Run all checks
    results.append(check_python_version())
    results.append(check_core_packages())
    results.append(check_pytorch_cuda())
    results.append(check_ffmpeg())
    results.append(check_spacy_model())
    results.append(check_env_file())
    results.append(check_directories())
    
    # Summary
    print_header("Verification Summary")
    
    if all(results):
        print_success("All checks passed! Your setup is ready.")
        print("\nYou can now run: python app.py")
        return 0
    else:
        print_error("Some checks failed. Please review the errors above.")
        print("\nRefer to SETUP_GUIDE.md for detailed instructions.")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
