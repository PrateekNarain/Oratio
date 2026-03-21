from flask import Blueprint, request, jsonify
from dotenv import load_dotenv
import os
import pymongo

load_dotenv()
MONGO_URI = os.getenv("MONGODB_URI")
client = pymongo.MongoClient(MONGO_URI) if MONGO_URI else None
db = client["Eloquence"] if client else None

user_bp = Blueprint('users', __name__, url_prefix='/users')


@user_bp.route('/profile/<username>', methods=['GET'])
def profile(username):
    """Return public profile info for a user (safe fields only)."""
    if not db:
        return jsonify({"error": "DB not configured"}), 500
    user = db['users'].find_one({"username": username}, {"password": 0})
    if not user:
        return jsonify({"error": "User not found"}), 404
    # convert ObjectId to string for JSON
    user['_id'] = str(user['_id'])
    return jsonify(user), 200


@user_bp.route('/mine', methods=['GET'])
def my_data():
    """Placeholder for authenticated user's own data. Authentication not enforced here.
    In future, replace with proper auth decorator to read user from token.
    """
    if not db:
        return jsonify({"error": "DB not configured"}), 500
    # simple sample: return all reports for a fixed test user (for now)
    reports = list(db['reports'].find({}).limit(20))
    for r in reports:
        r['_id'] = str(r['_id'])
    return jsonify({"reports": reports}), 200
