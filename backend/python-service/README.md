# BloomIQ Roboflow ML Service

This service uses Roboflow's Inference SDK to analyze crop images and detect flowering and fruiting stages.

## Setup

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

Or install individually:

```bash
pip install flask inference-sdk python-dotenv pillow
```

### 2. Configure Environment Variables

The service reads configuration from `backend/.env`:

```env
ROBOFLOW_API_KEY=nRWwVHvuqJPkPtV2WZoB
ROBOFLOW_WORKSPACE=moh-s15o3
ROBOFLOW_WORKFLOW_ID=custom-workflow
```

### 3. Run the Service

```bash
python roboflow_service.py
```

The service will start on `http://localhost:8000`

## API Endpoints

### Health Check
```bash
GET /health
```

Response:
```json
{
  "status": "ok",
  "service": "roboflow",
  "client_initialized": true,
  "workspace": "moh-s15o3",
  "workflow_id": "custom-workflow"
}
```

### Predict (Analyze Image)
```bash
POST /predict
Content-Type: multipart/form-data
```

Parameters:
- `file`: Image file (JPEG, PNG)

Response:
```json
{
  "stage": "flowering",
  "confidence": 0.89,
  "detections": 5,
  "flowering_results": {
    "confidence": 0.89,
    "detections": 5
  },
  "fruiting_results": {
    "confidence": 0,
    "detections": 0
  },
  "recommendations": [
    "Plant is in flowering stage",
    "Ensure adequate pollination",
    "Maintain consistent watering"
  ],
  "processing_time": 1.23,
  "model_version": "roboflow-v1"
}
```

### Workflow Info
```bash
GET /workflow/info
```

### Test Connection
```bash
GET /test
```

## Testing with cURL

```bash
# Health check
curl http://localhost:8000/health

# Test connection
curl http://localhost:8000/test

# Analyze an image
curl -X POST http://localhost:8000/predict \
  -F "file=@/path/to/your/image.jpg"
```

## Workflow Configuration

The service uses Roboflow's workflow system. Make sure your workflow:
1. Is configured in your Roboflow workspace
2. Returns predictions with class names containing keywords like:
   - "flower", "bloom" for flowering stage
   - "fruit", "berry", "pod" for fruiting stage
3. Has the correct workflow ID in the environment variables

## Customization

### Adjusting Stage Detection

Edit the `parse_roboflow_result()` function to customize:
- Stage classification logic
- Confidence thresholds
- Recommendation messages
- Detection counting

### Adding More Stages

You can add more plant growth stages by modifying the parsing logic:
- Seedling
- Vegetative
- Flowering
- Fruiting
- Harvesting

## Troubleshooting

### Client Not Initialized
- Check your API key is correct
- Verify internet connection
- Ensure Roboflow API is accessible

### No Detections
- Verify workflow is configured correctly
- Check image quality and format
- Review workflow output structure
- Enable debug mode to see raw results

### Import Errors
- Make sure all dependencies are installed
- Use Python 3.8 or higher
- Try creating a virtual environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Architecture

```
Image Upload (Node.js)
    ↓
Flask Service (Port 8000)
    ↓
Roboflow Inference SDK
    ↓
Serverless Workflow (Roboflow Cloud)
    ↓
Results Parsed & Returned
    ↓
Saved to MongoDB (Node.js)
```

## Performance

- First request: ~2-3 seconds (cold start)
- Cached requests: <1 second
- Parallel processing: Supported
- Max file size: 10MB (configurable in Node.js)

## Security

- API keys should be kept secret
- Use environment variables for credentials
- Validate all file uploads
- Implement rate limiting in production
- Use HTTPS in production

## License

Part of the BloomIQ project.
