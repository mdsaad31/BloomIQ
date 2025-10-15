from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
import sys
from pathlib import Path
import numpy as np
from PIL import Image
import io

# Import YOLOv8
try:
    from ultralytics import YOLO
except ImportError:
    print("Error: ultralytics not installed. Run: pip install ultralytics")
    sys.exit(1)

app = Flask(__name__)

# Configuration
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
UPLOAD_FOLDER = './temp_uploads'
MODEL_DIR = '../models'

# Ensure directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)

# Model paths
FLOWER_MODEL_PATH = os.path.join(MODEL_DIR, 'flower_model.pt')
FRUIT_MODEL_PATH = os.path.join(MODEL_DIR, 'fruit_model.pt')

# Load models (will be loaded on first request if not available)
flower_model = None
fruit_model = None


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def load_models():
    """Load YOLOv8 models"""
    global flower_model, fruit_model
    
    try:
        # Check if custom models exist, otherwise use default YOLOv8
        if os.path.exists(FLOWER_MODEL_PATH):
            print(f"Loading flower model from {FLOWER_MODEL_PATH}")
            flower_model = YOLO(FLOWER_MODEL_PATH)
        else:
            print("⚠️ Flower model not found. Using YOLOv8n as placeholder.")
            print(f"   Place your trained model at: {FLOWER_MODEL_PATH}")
            flower_model = YOLO('yolov8n.pt')  # Default model as fallback
        
        if os.path.exists(FRUIT_MODEL_PATH):
            print(f"Loading fruit model from {FRUIT_MODEL_PATH}")
            fruit_model = YOLO(FRUIT_MODEL_PATH)
        else:
            print("⚠️ Fruit model not found. Using YOLOv8n as placeholder.")
            print(f"   Place your trained model at: {FRUIT_MODEL_PATH}")
            fruit_model = YOLO('yolov8n.pt')  # Default model as fallback
        
        print("✅ Models loaded successfully")
        return True
        
    except Exception as e:
        print(f"❌ Error loading models: {e}")
        return False


def analyze_image(image_path):
    """
    Run inference with both models and determine the dominant stage
    """
    global flower_model, fruit_model
    
    # Load models if not already loaded
    if flower_model is None or fruit_model is None:
        if not load_models():
            raise Exception("Failed to load models")
    
    try:
        # Run inference with both models
        flower_results = flower_model(image_path, conf=0.25)
        fruit_results = fruit_model(image_path, conf=0.25)
        
        # Extract detections
        flower_detections = []
        flower_max_conf = 0
        
        for result in flower_results:
            if result.boxes is not None and len(result.boxes) > 0:
                for box in result.boxes:
                    conf = float(box.conf[0])
                    if conf > flower_max_conf:
                        flower_max_conf = conf
                    
                    flower_detections.append({
                        'bbox': box.xyxy[0].tolist(),
                        'confidence': conf,
                        'class': int(box.cls[0]),
                        'class_name': result.names[int(box.cls[0])]
                    })
        
        fruit_detections = []
        fruit_max_conf = 0
        
        for result in fruit_results:
            if result.boxes is not None and len(result.boxes) > 0:
                for box in result.boxes:
                    conf = float(box.conf[0])
                    if conf > fruit_max_conf:
                        fruit_max_conf = conf
                    
                    fruit_detections.append({
                        'bbox': box.xyxy[0].tolist(),
                        'confidence': conf,
                        'class': int(box.cls[0]),
                        'class_name': result.names[int(box.cls[0])]
                    })
        
        # Determine dominant stage
        stage = "Unknown"
        confidence = 0
        detections = []
        health_summary = ""
        recommendations = []
        
        if flower_max_conf > fruit_max_conf:
            stage = "Flower"
            confidence = flower_max_conf
            detections = flower_detections
            health_summary = f"Detected {len(flower_detections)} flower(s) in flowering stage"
            recommendations = [
                "Ensure adequate pollination",
                "Maintain consistent watering",
                "Monitor for pests on flowers",
                "Avoid excessive fertilization during flowering"
            ]
        elif fruit_max_conf > 0:
            stage = "Fruit"
            confidence = fruit_max_conf
            detections = fruit_detections
            health_summary = f"Detected {len(fruit_detections)} fruit(s) in development stage"
            recommendations = [
                "Increase watering as fruits develop",
                "Apply potassium-rich fertilizer",
                "Support heavy fruit-bearing branches",
                "Monitor for fruit flies and diseases"
            ]
        else:
            # No strong detections from either model
            stage = "Vegetative"
            confidence = 0.5
            health_summary = "Plant appears to be in vegetative growth stage"
            recommendations = [
                "Continue regular watering schedule",
                "Apply balanced NPK fertilizer",
                "Monitor leaf health",
                "Ensure adequate sunlight"
            ]
        
        return {
            'stage': stage,
            'confidence': round(confidence, 3),
            'detections': detections,
            'health_summary': health_summary,
            'recommendations': recommendations,
            'detection_counts': {
                'flowers': len(flower_detections),
                'fruits': len(fruit_detections)
            }
        }
        
    except Exception as e:
        raise Exception(f"Analysis error: {str(e)}")


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    models_loaded = flower_model is not None and fruit_model is not None
    return jsonify({
        'status': 'ok',
        'models_loaded': models_loaded,
        'flower_model_exists': os.path.exists(FLOWER_MODEL_PATH),
        'fruit_model_exists': os.path.exists(FRUIT_MODEL_PATH)
    })


@app.route('/predict', methods=['POST'])
def predict():
    """
    Main prediction endpoint
    Accepts image file and returns analysis
    """
    try:
        # Check if file is in request
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Only PNG, JPG, JPEG allowed'}), 400
        
        # Save file temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        try:
            # Run analysis
            result = analyze_image(filepath)
            
            # Clean up temporary file
            if os.path.exists(filepath):
                os.remove(filepath)
            
            return jsonify(result)
            
        except Exception as e:
            # Clean up on error
            if os.path.exists(filepath):
                os.remove(filepath)
            raise e
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/models/info', methods=['GET'])
def models_info():
    """Get information about loaded models"""
    return jsonify({
        'flower_model': {
            'path': FLOWER_MODEL_PATH,
            'exists': os.path.exists(FLOWER_MODEL_PATH),
            'loaded': flower_model is not None
        },
        'fruit_model': {
            'path': FRUIT_MODEL_PATH,
            'exists': os.path.exists(FRUIT_MODEL_PATH),
            'loaded': fruit_model is not None
        }
    })


if __name__ == '__main__':
    print("🌿 BloomIQ Python Inference Service")
    print("=" * 50)
    print(f"Flower model path: {FLOWER_MODEL_PATH}")
    print(f"Fruit model path: {FRUIT_MODEL_PATH}")
    print("=" * 50)
    
    # Preload models
    print("\n🔄 Loading models...")
    load_models()
    
    print("\n🚀 Starting Flask server on port 8000...")
    app.run(host='0.0.0.0', port=8000, debug=True)
