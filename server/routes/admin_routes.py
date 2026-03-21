from flask import Blueprint, request, jsonify
from dotenv import load_dotenv
import os
import pymongo

load_dotenv()
MONGO_URI = os.getenv("MONGODB_URI")
client = pymongo.MongoClient(MONGO_URI) if MONGO_URI else None
db = client["Eloquence"] if client else None

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')


@admin_bp.route('/stats', methods=['GET'])
def stats():
    """Return simple counts for collections for admin dashboard."""
    if not db:
        return jsonify({"error": "DB not configured"}), 500
    users_count = db['users'].count_documents({})
    reports_count = db['reports'].count_documents({})
    admins_count = db['admins'].count_documents({})
    return jsonify({"users": users_count, "reports": reports_count, "admins": admins_count}), 200
