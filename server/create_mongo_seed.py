#!/usr/bin/env python3
"""Create initial MongoDB data for the Eloquence app.

This script reads MONGODB_URI from the environment (or .env), connects to
the MongoDB instance and creates the `Eloquence` database with collections
`user`, `reports`, and `overall_reports`. It will insert an admin user and
one regular user (if they don't already exist) and a sample report/overall
report for the regular user.

Run from the repository root or the server/ directory. It uses the project's
`utils.auth.hash_password` to hash passwords so the application can authenticate
against these seeded users.
"""
import os
import sys
from dotenv import load_dotenv
import pymongo
from utils.auth import hash_password
from bson.objectid import ObjectId


def main():
    load_dotenv()
    mongo_uri = os.getenv("MONGODB_URI")
    if not mongo_uri:
        print("MONGODB_URI not found in environment. Please set it in .env or environment.")
        sys.exit(1)

    client = pymongo.MongoClient(mongo_uri)
    db = client["Eloquence"]

    users = db["user"]
    reports = db["reports"]
    overall = db["overall_reports"]

    # Admin user
    admin_email = "admin@eloquence.local"
    admin_username = "admin"
    admin_password_plain = "AdminPass123!"

    existing_admin = users.find_one({"email": admin_email})
    if existing_admin:
        print(f"Admin user already exists (email={admin_email}), _id={existing_admin.get('_id')}")
    else:
        hashed = hash_password(admin_password_plain)
        admin_doc = {
            "username": admin_username,
            "email": admin_email,
            "password": hashed,
            "role": "admin"
        }
        res = users.insert_one(admin_doc)
        print(f"Inserted admin user with _id={res.inserted_id} and email={admin_email}")

    # Regular test user
    user_email = "testuser@example.com"
    user_username = "testuser"
    user_password_plain = "TestUserPass123!"

    existing_user = users.find_one({"email": user_email})
    if existing_user:
        user_id = existing_user.get("_id")
        print(f"User already exists (email={user_email}), _id={user_id}")
    else:
        hashed = hash_password(user_password_plain)
        user_doc = {
            "username": user_username,
            "email": user_email,
            "password": hashed,
            "role": "user"
        }
        res = users.insert_one(user_doc)
        user_id = res.inserted_id
        print(f"Inserted user with _id={user_id} and email={user_email}")

    # Insert a sample report for the test user (if none exists)
    sample_report_filter = {"userId": user_email, "title": "Sample Report"}
    existing_report = reports.find_one(sample_report_filter)
    if existing_report:
        print(f"Sample report already exists for {user_email}, _id={existing_report.get('_id')}")
    else:
        sample_report = {
            "userId": user_email,
            "title": "Sample Report",
            "context": "Demo context",
            "transcription": "This is a sample transcription for testing.",
            "vocabulary_report": {"summary": "Good vocabulary"},
            "speech_report": "Clear and expressive.",
            "expression_report": "Neutral",
            "scores": {"vocabulary": 85, "voice": 78, "expressions": 80}
        }
        rres = reports.insert_one(sample_report)
        print(f"Inserted sample report with _id={rres.inserted_id} for user {user_email}")

    # Upsert overall report for the user based on the sample
    overall_doc = {
        "userId": user_email,
        "avg_vocabulary": 85,
        "avg_voice": 78,
        "avg_expressions": 80,
        "overall_reports": {
            "voice_report": "Sample overall voice report.",
            "expressions_report": "Sample overall expressions report.",
            "vocabulary_report": "Sample overall vocabulary report."
        }
    }

    overall_res = overall.update_one({"userId": user_email}, {"$set": overall_doc}, upsert=True)
    if overall_res.upserted_id:
        print(f"Created overall_reports document with _id={overall_res.upserted_id} for {user_email}")
    else:
        print(f"Updated overall_reports for {user_email}")

    print("Seeding completed.")


if __name__ == "__main__":
    main()
