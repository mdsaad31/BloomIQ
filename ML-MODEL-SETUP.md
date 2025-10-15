# 🤖 BloomIQ ML Model Setup - Roboflow Integration

## Overview

BloomIQ now uses **Roboflow's Inference SDK** for real-time crop analysis, detecting flowering and fruiting stages with high accuracy.

---

## ✅ What Changed

### 1. **Weather API Updated**
- ❌ Old: OpenWeatherMap API
- ✅ New: **WeatherAPI.com**
- Updated endpoint structure and response parsing
- Better UV index support
- More accurate precipitation data

### 2. **ML Model Migration**
- ❌ Old: Local YOLOv8 models (required training)
- ✅ New: **Roboflow Workflow** (cloud-based, pre-trained)
- No local GPU required
- Instant scaling
- Automatic model updates

---

## 🚀 Quick Start

### Step 1: Install Python Dependencies

```powershell
# Run the automated setup script
.\setup-ml-service.ps1
```

Or manually:

```powershell
cd backend\python-service
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Step 2: Verify Environment Variables

Check `backend\.env` contains:

```env
# Roboflow Configuration
ROBOFLOW_API_KEY=nRWwVHvuqJPkPtV2WZoB
ROBOFLOW_WORKSPACE=moh-s15o3
ROBOFLOW_WORKFLOW_ID=custom-workflow

# Weather API
WEATHER_API_KEY=a1de6ce90efa4a56b33162802252709
```

✅ Already configured!

### Step 3: Start the ML Service

```powershell
cd backend\python-service
python roboflow_service.py
```

You should see:

```
==============================================================
🌿 BloomIQ - Roboflow ML Service
==============================================================
📊 Workspace: moh-s15o3
🔄 Workflow ID: custom-workflow
🔗 API URL: https://serverless.roboflow.com
🔑 API Key: **********WZoB
==============================================================

🔄 Initializing Roboflow client...
✅ Roboflow client initialized successfully

🚀 Starting Flask server on port 8000...
```

### Step 4: Test the Service

Open a new terminal:

```powershell
# Health check
curl http://localhost:8000/health

# Test endpoint
curl http://localhost:8000/test

# Analyze an image
curl -X POST http://localhost:8000/predict -F "file=@path\to\your\image.jpg"
```

---

## 📊 Roboflow Workflow Configuration

### Your Workflow Details

- **Workspace:** `moh-s15o3`
- **Workflow ID:** `custom-workflow`
- **API Key:** `nRWwVHvuqJPkPtV2WZoB`
- **API URL:** `https://serverless.roboflow.com`

### How It Works

```
1. User uploads image → Node.js backend
2. Backend sends to Python service (port 8000)
3. Python service calls Roboflow API
4. Roboflow runs workflow on serverless GPU
5. Results parsed and returned
6. Saved to MongoDB with recommendations
```

### Expected Workflow Output

Your workflow should return predictions with class names:

**For Flowering Stage:**
- Class names: "flower", "bloom", "blossom"
- Multiple detections counted
- High confidence scores

**For Fruiting Stage:**
- Class names: "fruit", "berry", "pod"
- Tracks fruit development
- Maturity indicators

### Customizing the Workflow

If your workflow has different class names, edit `roboflow_service.py`:

```python
def parse_roboflow_result(result, processing_time):
    # Modify these keywords to match your workflow
    if 'flower' in class_name or 'bloom' in class_name:
        flower_count += 1
    elif 'fruit' in class_name or 'berry' in class_name:
        fruit_count += 1
```

---

## 🧪 Testing the Complete Flow

### 1. Start All Services

```powershell
# Terminal 1: Backend (MongoDB + Express)
cd backend
npm install
node server.js

# Terminal 2: ML Service (Python + Roboflow)
cd backend\python-service
python roboflow_service.py

# Terminal 3: Frontend (React)
cd web
npm install
npm start
```

### 2. Test Authentication

```powershell
# Register a user
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'

# Login and get token
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"test123"}'
```

Save the returned token!

### 3. Test Image Analysis

```powershell
# Replace YOUR_TOKEN and YOUR_IMAGE
curl -X POST http://localhost:5000/api/analysis/analyze `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -F "file=@YOUR_IMAGE.jpg"
```

Expected response:

```json
{
  "success": true,
  "reportId": "...",
  "stage": "flowering",
  "confidence": 89.5,
  "detections": 5,
  "floweringResults": {
    "confidence": 89.5,
    "detections": 5
  },
  "fruitingResults": {
    "confidence": 0,
    "detections": 0
  },
  "recommendations": [
    "Plant is in flowering stage",
    "Ensure adequate pollination",
    "Maintain consistent watering"
  ],
  "imageUrl": "http://localhost:5000/uploads/...",
  "timestamp": "2025-10-15T..."
}
```

### 4. Test Weather API

```powershell
curl -X GET "http://localhost:5000/api/weather/current?city=London" `
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔧 Troubleshooting

### Python Service Won't Start

**Error: `ModuleNotFoundError: No module named 'inference_sdk'`**

Solution:
```powershell
cd backend\python-service
.\venv\Scripts\Activate.ps1
pip install inference-sdk
```

**Error: `Client initialization failed`**

Solution:
- Check internet connection
- Verify API key is correct
- Test connection: `curl https://serverless.roboflow.com`

### Roboflow API Errors

**Error: `Workflow not found`**

Solution:
- Verify workspace name: `moh-s15o3`
- Verify workflow ID: `custom-workflow`
- Check workflow exists in Roboflow dashboard
- Ensure workflow is published

**Error: `API key invalid`**

Solution:
- Check `.env` file has correct key
- Regenerate API key in Roboflow dashboard
- Update `.env` and restart service

### Analysis Returns Empty Results

**Issue: No detections or low confidence**

Solution:
1. Test with sample images from Roboflow
2. Check workflow configuration
3. Review image quality (min 640x640 recommended)
4. Enable debug mode to see raw results:
   ```python
   'raw_result': result  # Already included in response
   ```

### Weather API Errors

**Error: `Weather data unavailable`**

Solution:
- Verify API key: `a1de6ce90efa4a56b33162802252709`
- Check location format (city name or lat,lon)
- Test directly: `curl "https://api.weatherapi.com/v1/current.json?key=YOUR_KEY&q=London"`

---

## 📚 API Documentation

### Python ML Service Endpoints

#### `GET /health`
Check service health and configuration

**Response:**
```json
{
  "status": "ok",
  "service": "roboflow",
  "client_initialized": true,
  "workspace": "moh-s15o3",
  "workflow_id": "custom-workflow"
}
```

#### `POST /predict`
Analyze crop image

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: `file` (image file)

**Response:**
```json
{
  "stage": "flowering|fruiting|vegetative|unknown",
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
  "recommendations": ["..."],
  "processing_time": 1.23,
  "model_version": "roboflow-v1"
}
```

#### `GET /workflow/info`
Get workflow configuration

#### `GET /test`
Simple test endpoint

---

## 🎯 Next Steps

### 1. Test Frontend Integration ✅
- Login page is ready
- Image upload component needs connection
- Results display needs implementation

### 2. Enhance Register Page
- Match Login page design
- Add validation
- Toast notifications

### 3. Build Dashboard
- Stats cards
- Recent analyses
- Weather widget
- Quick actions

### 4. Build Analysis Page
- Drag-drop upload
- Camera capture
- Live preview
- Results visualization
- Confidence meters
- Recommendation cards

### 5. Production Readiness
- Error handling
- Rate limiting
- Image optimization
- Caching strategy
- Monitoring

---

## 🎨 Frontend Components Ready

✅ **UI Components:**
- Button (6 variants)
- Card (with Header/Body/Footer)
- Input (with validation)
- Toast (4 types)
- Modal (3 sizes)
- Loading (spinner, dots, skeleton)

✅ **Pages:**
- Login (enhanced with animations)
- Register (needs enhancement)

⏳ **To Build:**
- Dashboard
- Analysis
- Reports
- Profile
- Weather

---

## 📦 Dependencies Installed

### Backend (Node.js)
```json
✅ express
✅ mongoose
✅ bcryptjs
✅ jsonwebtoken
✅ multer
✅ axios
✅ form-data
✅ cors
✅ dotenv
```

### Python Service
```txt
✅ Flask
✅ inference-sdk
✅ python-dotenv
✅ Pillow
✅ requests
```

### Frontend (React)
```json
✅ react-router-dom
✅ axios
✅ framer-motion
✅ lucide-react
✅ tailwindcss
```

---

## 🚀 Ready to Go!

Your BloomIQ app now has:
- ✅ MongoDB Atlas connection
- ✅ JWT authentication
- ✅ Roboflow ML model
- ✅ WeatherAPI.com integration
- ✅ Enhanced UI components
- ✅ Complete backend API

**Run the setup script to start:**

```powershell
.\setup-ml-service.ps1
```

Then access the app at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- ML Service: http://localhost:8000

Happy coding! 🌿✨
