#!/usr/bin/env python3
"""
Enhanced Flask web app to test and verify parsed IELTS tests
Displays questions with HTML content and auto-renders answer areas based on question types
"""

from flask import Flask, render_template, jsonify, send_from_directory
import json
import os
from pathlib import Path

app = Flask(__name__)

# Base paths
BASE_DIR = Path(__file__).parent.parent
ENHANCED_DIR = BASE_DIR / "web_scraping" / "parsed_enhanced"
PARSED_DIR = BASE_DIR / "web_scraping" / "parsed"
MEDIA_DIR = BASE_DIR / "web_scraping" / "media"


def get_available_tests():
    """Get all available enhanced tests organized by skill and type"""
    tests = {
        "reading": {},
        "listening": {},
        "writing": {},
        "speaking": {}
    }
    
    # Reading tests (from enhanced)
    reading_base = ENHANCED_DIR / "reading"
    if reading_base.exists():
        for subdir in reading_base.iterdir():
            if subdir.is_dir():
                test_files = []
                for test_file in sorted(subdir.glob("*.json")):
                    if test_file.name not in ["batch_summary.json", "validation_summary.json"]:
                        test_files.append({
                            "filename": test_file.name,
                            "path": str(test_file.relative_to(BASE_DIR))
                        })
                if test_files:
                    tests["reading"][subdir.name] = test_files
    
    # Listening tests (from enhanced)
    listening_base = ENHANCED_DIR / "listening"
    if listening_base.exists():
        for subdir in listening_base.iterdir():
            if subdir.is_dir():
                test_files = []
                for test_file in sorted(subdir.glob("*.json")):
                    if test_file.name not in ["batch_summary.json", "validation_summary.json"]:
                        test_files.append({
                            "filename": test_file.name,
                            "path": str(test_file.relative_to(BASE_DIR))
                        })
                if test_files:
                    tests["listening"][subdir.name] = test_files
    
    # Writing tests (from parsed - no enhancement needed)
    writing_base = PARSED_DIR / "writing"
    if writing_base.exists():
        for subdir in writing_base.iterdir():
            if subdir.is_dir():
                test_files = []
                for test_file in sorted(subdir.glob("*.json")):
                    if test_file.name not in ["batch_summary.json", "validation_summary.json"]:
                        test_files.append({
                            "filename": test_file.name,
                            "path": str(test_file.relative_to(BASE_DIR))
                        })
                if test_files:
                    tests["writing"][subdir.name] = test_files
    
    # Speaking tests (from parsed - no enhancement needed)
    speaking_base = PARSED_DIR / "speaking"
    if speaking_base.exists():
        for subdir in speaking_base.iterdir():
            if subdir.is_dir():
                test_files = []
                for test_file in sorted(subdir.glob("*.json")):
                    if test_file.name not in ["batch_summary.json", "validation_summary.json"]:
                        test_files.append({
                            "filename": test_file.name,
                            "path": str(test_file.relative_to(BASE_DIR))
                        })
                if test_files:
                    tests["speaking"][subdir.name] = test_files
    
    return tests


@app.route('/')
def index():
    """Main page - test selector"""
    tests = get_available_tests()
    return render_template('index.html', tests=tests)


@app.route('/api/test/<skill>/<test_type>/<filename>')
def get_test(skill, test_type, filename):
    """API endpoint to get enhanced test data"""
    try:
        # Writing and Speaking tests are in parsed dir, others in enhanced dir
        if skill in ['writing', 'speaking']:
            test_path = PARSED_DIR / skill / test_type / filename
        else:
            test_path = ENHANCED_DIR / skill / test_type / filename
        
        if not test_path.exists():
            return jsonify({"error": "Test not found"}), 404
        
        with open(test_path, 'r', encoding='utf-8') as f:
            test_data = json.load(f)
        
        return jsonify(test_data)
    except Exception as e:
        print(f"Error loading test file: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route('/media/<path:filepath>')
def serve_media(filepath):
    """Serve media files (images, audio)"""
    media_path = MEDIA_DIR / filepath
    if media_path.exists():
        return send_from_directory(MEDIA_DIR, filepath)
    return "Media not found", 404


@app.route('/test/<skill>/<test_type>/<filename>')
def view_test(skill, test_type, filename):
    """View a specific test with enhanced viewer"""
    if skill == 'writing':
        return render_template('writing_viewer.html', skill=skill, test_type=test_type, filename=filename)
    if skill == 'speaking':
        return render_template('speaking_viewer.html', skill=skill, test_type=test_type, filename=filename)
    return render_template('enhanced_viewer.html', skill=skill, test_type=test_type, filename=filename)


if __name__ == '__main__':
    app.run(debug=True, port=5000)
