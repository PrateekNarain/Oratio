"""Lightweight backend runner for development.

This script creates a minimal Flask app and registers the authentication
blueprint only. It's useful for local development when the full `app.py`
imports heavy analysis dependencies (pandas, ML libs) that are not required
for testing auth endpoints.

Run this with the project's venv Python:
  .\.venv\Scripts\python.exe run_simple_backend.py
"""
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Import only the auth blueprint (which uses utils.auth and pymongo)
from routes.auth_routes import auth_bp

load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Register auth blueprint
    app.register_blueprint(auth_bp)

    @app.route('/')
    def home():
        return 'Hello World (simple backend)'

    return app


if __name__ == '__main__':
    app = create_app()
    # Use env DEBUG if provided, default to True for local dev
    debug = os.getenv('FLASK_DEBUG', '1') == '1'
    app.run(debug=debug)
