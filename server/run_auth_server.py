"""
Lightweight server to run only the authentication routes.

This avoids importing the heavier analysis pipeline modules in `app.py` so
you can run the auth endpoints (signup/login) quickly during development.
"""
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

from routes.auth_routes import auth_bp

app.register_blueprint(auth_bp)

@app.route('/')
def home():
    return "Auth-only server running"

if __name__ == '__main__':
    app.run(debug=True)
