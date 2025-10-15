"""
BloomIQ - Roboflow ML Service
Using Roboflow's Inference SDK for crop analysis
"""

from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
import sys
from pathlib import Path
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv(Path(__file__).parent.parent / '.env')

# Import Roboflow Inference SDK
try:
    from inference_sdk import InferenceHTTPClient
except ImportError:
    print("❌ Error: inference_sdk not installed.")
    print("   Run: pip install inference-sdk")
    sys.exit(1)

app = Flask(__name__)

# Configuration
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
UPLOAD_FOLDER = './temp_uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Roboflow Configuration
ROBOFLOW_API_KEY = os.getenv('ROBOFLOW_API_KEY', 'nRWwVHvuqJPkPtV2WZoB')
ROBOFLOW_WORKSPACE = os.getenv('ROBOFLOW_WORKSPACE', 'moh-s15o3')
ROBOFLOW_WORKFLOW_ID = os.getenv('ROBOFLOW_WORKFLOW_ID', 'custom-workflow')
ROBOFLOW_API_URL = os.getenv('ROBOFLOW_API_URL', 'https://serverless.roboflow.com')

# Initialize Roboflow client
client = None

def init_roboflow_client():
    """Initialize Roboflow Inference Client"""
    global client
    try:
        client = InferenceHTTPClient(
            api_url=ROBOFLOW_API_URL,
            api_key=ROBOFLOW_API_KEY
        )
        print("✅ Roboflow client initialized successfully")
        return True
    except Exception as e:
        print(f"❌ Failed to initialize Roboflow client: {e}")
        return False


def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def analyze_with_roboflow(image_path):
    """
    Run inference using Roboflow workflow
    """
    global client
    
    if client is None:
        if not init_roboflow_client():
            raise Exception("Roboflow client not initialized")
    
    try:
        start_time = time.time()
        
        # Run workflow on the image
        result = client.run_workflow(
            workspace_name=ROBOFLOW_WORKSPACE,
            workflow_id=ROBOFLOW_WORKFLOW_ID,
            images={
                "image": image_path  # Path to the uploaded image
            },
            use_cache=True  # Speeds up repeated requests
        )
        
        processing_time = time.time() - start_time
        
        # Parse results from Roboflow
        # The structure depends on your workflow configuration
        parsed_result = parse_roboflow_result(result, processing_time)
        
        return parsed_result
        
    except Exception as e:
        raise Exception(f"Roboflow analysis error: {str(e)}")


def parse_roboflow_result(result, processing_time):
    """
    Parse Roboflow workflow result into BloomIQ format
    Handles the actual Roboflow workflow response structure
    """
    
    print("🔍 Raw Roboflow Result:")
    print(result)
    print("=" * 60)
    
    # Default response structure
    response = {
        'stage': 'unknown',
        'confidence': 0,
        'detections': 0,
        'flowering_results': {
            'confidence': 0,
            'detections': 0
        },
        'fruiting_results': {
            'confidence': 0,
            'detections': 0
        },
        'recommendations': [],
        'processing_time': round(processing_time, 2),
        'model_version': 'roboflow-v1',
        'raw_result': result  # Include raw result for debugging
    }
    
    try:
        # Roboflow workflow returns a list of results
        if not isinstance(result, list) or len(result) == 0:
            print("⚠️ Warning: Empty or invalid result from Roboflow")
            response['recommendations'] = [
                'No detections found in the image',
                'Try uploading a clearer image of the plant'
            ]
            return response
        
        workflow_output = result[0]
        print(f"📊 Workflow output keys: {workflow_output.keys()}")
        
        flower_count = 0
        fruit_count = 0
        max_confidence = 0
        all_detections = []
        
        # Parse different possible output structures
        # Check for 'output' key (common in Roboflow workflows)
        if 'output' in workflow_output:
            output_data = workflow_output['output']
            print(f"📦 Output data type: {type(output_data)}")
            
            # If output contains predictions array
            if isinstance(output_data, dict) and 'predictions' in output_data:
                predictions = output_data['predictions']
                print(f"🎯 Found {len(predictions)} predictions")
                
                for pred in predictions:
                    confidence = pred.get('confidence', 0)
                    class_name = pred.get('class', '').lower()
                    
                    all_detections.append({
                        'class': class_name,
                        'confidence': confidence
                    })
                    
                    if confidence > max_confidence:
                        max_confidence = confidence
                    
                    # Count flowers and fruits based on class names
                    if 'flower' in class_name or 'bloom' in class_name or 'blossom' in class_name:
                        flower_count += 1
                    elif 'fruit' in class_name or 'berry' in class_name or 'pod' in class_name or 'apple' in class_name or 'tomato' in class_name:
                        fruit_count += 1
        
        # Also check top-level predictions (alternative structure)
        elif 'predictions' in workflow_output:
            predictions = workflow_output['predictions']
            print(f"🎯 Found {len(predictions)} predictions at top level")
            
            for pred in predictions:
                confidence = pred.get('confidence', 0)
                class_name = pred.get('class', '').lower()
                
                all_detections.append({
                    'class': class_name,
                    'confidence': confidence
                })
                
                if confidence > max_confidence:
                    max_confidence = confidence
                
                if 'flower' in class_name or 'bloom' in class_name or 'blossom' in class_name:
                    flower_count += 1
                elif 'fruit' in class_name or 'berry' in class_name or 'pod' in class_name or 'apple' in class_name or 'tomato' in class_name:
                    fruit_count += 1
        
        print(f"🌸 Flowers detected: {flower_count}")
        print(f"🍎 Fruits detected: {fruit_count}")
        print(f"💯 Max confidence: {max_confidence}")
        
        # Determine stage based on detections
        total_detections = flower_count + fruit_count
        
        if total_detections == 0:
            response['stage'] = 'vegetative'
            response['confidence'] = 0.5
            response['recommendations'] = [
                'No flowers or fruits detected',
                'Plant appears to be in vegetative stage',
                'Continue regular watering and fertilization',
                'Monitor for early signs of flowering'
            ]
        elif flower_count > fruit_count:
            response['stage'] = 'flowering'
            response['confidence'] = max_confidence
            response['detections'] = flower_count
            response['flowering_results'] = {
                'confidence': max_confidence,
                'detections': flower_count
            }
            response['recommendations'] = [
                f'🌸 Detected {flower_count} flower(s) - Plant is in flowering stage',
                'Ensure adequate pollination (bees, hand pollination)',
                'Maintain consistent watering - avoid water stress',
                'Monitor for pests on flowers (aphids, thrips)',
                'Avoid excessive nitrogen - promote flower development'
            ]
        elif fruit_count > 0:
            response['stage'] = 'fruiting'
            response['confidence'] = max_confidence
            response['detections'] = fruit_count
            response['fruiting_results'] = {
                'confidence': max_confidence,
                'detections': fruit_count
            }
            response['recommendations'] = [
                f'🍎 Detected {fruit_count} fruit(s) - Plant is in fruiting stage',
                'Increase watering as fruits develop',
                'Apply potassium-rich fertilizer (promotes fruit quality)',
                'Support heavy fruit-bearing branches if needed',
                'Monitor for fruit flies and diseases'
            ]
        
        # Add detection details
        if all_detections:
            response['all_detections'] = all_detections
            print(f"📝 All detections: {all_detections}")
        
    except Exception as e:
        print(f"❌ Error parsing Roboflow result: {e}")
        import traceback
        traceback.print_exc()
        
        response['recommendations'] = [
            'Analysis completed but results parsing failed',
            'Please check the logs and try again',
            f'Error: {str(e)}'
        ]
    
    return response


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    client_initialized = client is not None
    return jsonify({
        'status': 'ok',
        'service': 'roboflow',
        'client_initialized': client_initialized,
        'workspace': ROBOFLOW_WORKSPACE,
        'workflow_id': ROBOFLOW_WORKFLOW_ID,
        'api_url': ROBOFLOW_API_URL
    })


@app.route('/predict', methods=['POST'])
def predict():
    """
    Main prediction endpoint
    Accepts image file and returns analysis using Roboflow
    """
    print("\n" + "=" * 60)
    print("📸 New prediction request received")
    print("=" * 60)
    
    try:
        # Check if file is in request
        if 'file' not in request.files:
            print("❌ No file in request")
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        print(f"📁 File received: {file.filename}")
        
        if file.filename == '':
            print("❌ Empty filename")
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            print(f"❌ Invalid file type: {file.filename}")
            return jsonify({'error': 'Invalid file type. Only PNG, JPG, JPEG allowed'}), 400
        
        # Save file temporarily
        filename = secure_filename(file.filename)
        timestamp = int(time.time())
        filepath = os.path.join(UPLOAD_FOLDER, f"{timestamp}_{filename}")
        file.save(filepath)
        print(f"💾 File saved to: {filepath}")
        print(f"📏 File size: {os.path.getsize(filepath)} bytes")
        
        try:
            # Run analysis with Roboflow
            print(f"🚀 Starting Roboflow analysis...")
            result = analyze_with_roboflow(filepath)
            print(f"✅ Analysis complete!")
            print(f"📊 Result: {result.get('stage', 'unknown')} stage detected")
            print(f"🎯 Confidence: {result.get('confidence', 0)}")
            print(f"🔢 Detections: {result.get('detections', 0)}")
            
            # Clean up temporary file
            if os.path.exists(filepath):
                os.remove(filepath)
                print(f"🗑️ Cleaned up temporary file")
            
            print("=" * 60)
            print("✅ Request completed successfully")
            print("=" * 60 + "\n")
            
            return jsonify(result), 200
            
        except Exception as e:
            # Clean up on error
            if os.path.exists(filepath):
                os.remove(filepath)
                print(f"🗑️ Cleaned up temporary file after error")
            
            print(f"❌ Analysis error: {e}")
            import traceback
            traceback.print_exc()
            raise e
        
    except Exception as e:
        print(f"❌ Prediction error: {e}")
        import traceback
        traceback.print_exc()
        print("=" * 60 + "\n")
        return jsonify({'error': str(e)}), 500


@app.route('/workflow/info', methods=['GET'])
def workflow_info():
    """Get information about the Roboflow workflow"""
    return jsonify({
        'workspace': ROBOFLOW_WORKSPACE,
        'workflow_id': ROBOFLOW_WORKFLOW_ID,
        'api_url': ROBOFLOW_API_URL,
        'client_initialized': client is not None
    })


@app.route('/test', methods=['GET'])
def test_endpoint():
    """Test endpoint to verify service is working"""
    return jsonify({
        'message': 'BloomIQ Roboflow Service is running!',
        'status': 'ok',
        'timestamp': time.time()
    })


@app.route('/test-workflow', methods=['POST'])
def test_workflow():
    """
    Test Roboflow workflow with a sample image URL or uploaded file
    Useful for debugging workflow configuration
    """
    try:
        global client
        
        if client is None:
            if not init_roboflow_client():
                return jsonify({'error': 'Roboflow client not initialized'}), 500
        
        # Check if it's a file upload or URL
        if 'file' in request.files:
            file = request.files['file']
            filename = secure_filename(file.filename)
            timestamp = int(time.time())
            filepath = os.path.join(UPLOAD_FOLDER, f"test_{timestamp}_{filename}")
            file.save(filepath)
            image_source = filepath
        elif request.json and 'url' in request.json:
            image_source = request.json['url']
        else:
            return jsonify({'error': 'No file or URL provided'}), 400
        
        print(f"\n🧪 Testing workflow with: {image_source}")
        
        # Test the workflow
        start_time = time.time()
        result = client.run_workflow(
            workspace_name=ROBOFLOW_WORKSPACE,
            workflow_id=ROBOFLOW_WORKFLOW_ID,
            images={
                "image": image_source
            },
            use_cache=False  # Don't cache test requests
        )
        processing_time = time.time() - start_time
        
        # Clean up if it was a file
        if 'file' in request.files and os.path.exists(image_source):
            os.remove(image_source)
        
        print(f"✅ Test complete in {processing_time:.2f}s")
        print(f"📊 Raw result structure:")
        print(result)
        
        return jsonify({
            'success': True,
            'processing_time': round(processing_time, 2),
            'raw_result': result,
            'result_type': str(type(result)),
            'result_length': len(result) if isinstance(result, (list, dict)) else 0
        })
        
    except Exception as e:
        print(f"❌ Test error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


if __name__ == '__main__':
    print("=" * 60)
    print("🌿 BloomIQ - Roboflow ML Service")
    print("=" * 60)
    print(f"📊 Workspace: {ROBOFLOW_WORKSPACE}")
    print(f"🔄 Workflow ID: {ROBOFLOW_WORKFLOW_ID}")
    print(f"🔗 API URL: {ROBOFLOW_API_URL}")
    print(f"🔑 API Key: {'*' * 10}{ROBOFLOW_API_KEY[-4:]}")
    print("=" * 60)
    
    # Initialize Roboflow client
    print("\n🔄 Initializing Roboflow client...")
    init_roboflow_client()
    
    print("\n🚀 Starting Flask server on port 8000...")
    print("📍 Endpoints:")
    print("   - GET  /health       - Health check")
    print("   - POST /predict      - Analyze image")
    print("   - GET  /workflow/info - Workflow details")
    print("   - GET  /test         - Test connection")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=8000, debug=True)
