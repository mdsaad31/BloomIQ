# 🔧 Python Service Updated - Testing Guide

## ✅ Changes Made

### 1. Enhanced Roboflow Integration
- **Improved logging**: Detailed console output for debugging
- **Better error handling**: Comprehensive try-catch blocks
- **Multiple parsing strategies**: Handles different Roboflow response formats
- **Raw result logging**: See exactly what Roboflow returns

### 2. New Features
- **Enhanced `/predict` endpoint**: Detailed logging at every step
- **New `/test-workflow` endpoint**: Test workflow without full analysis
- **Detection details**: Returns all detected classes and confidences
- **Better recommendations**: More specific based on detections

### 3. New Test Script
- **`test_roboflow.py`**: Standalone script to test workflow connection
- Tests directly with Roboflow SDK
- Shows raw response structure
- Helps debug workflow configuration

---

## 🚀 Quick Start

### Step 1: Install Dependencies

```powershell
cd backend\python-service

# If virtual environment doesn't exist
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install packages
pip install inference-sdk flask python-dotenv pillow werkzeug
```

### Step 2: Test Workflow Connection

```powershell
# Make sure you're in the virtual environment
python test_roboflow.py
```

This will:
- Connect to Roboflow
- Test your workflow with a sample image
- Show the exact response structure
- Help you understand what your workflow returns

### Step 3: Start the Service

```powershell
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

---

## 🧪 Testing the Service

### Test 1: Health Check

```powershell
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "roboflow",
  "client_initialized": true,
  "workspace": "moh-s15o3",
  "workflow_id": "custom-workflow"
}
```

### Test 2: Test Workflow (New!)

```powershell
# Test with an image URL
curl -X POST http://localhost:8000/test-workflow `
  -H "Content-Type: application/json" `
  -d '{"url": "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800"}'

# Or test with a file
curl -X POST http://localhost:8000/test-workflow `
  -F "file=@path\to\your\image.jpg"
```

This will show you:
- Raw result from Roboflow
- Result structure (keys, types)
- Processing time
- Any errors

### Test 3: Full Prediction

```powershell
curl -X POST http://localhost:8000/predict `
  -F "file=@path\to\your\image.jpg"
```

---

## 📊 Understanding the Logs

When you make a prediction request, you'll see detailed logs:

```
============================================================
📸 New prediction request received
============================================================
📁 File received: test_image.jpg
💾 File saved to: ./temp_uploads/1729012345_test_image.jpg
📏 File size: 1234567 bytes
🚀 Starting Roboflow analysis...

🔍 Raw Roboflow Result:
[{'output': {...}, 'image': {...}}]
============================================================
📊 Workflow output keys: dict_keys(['output', 'image'])
📦 Output data type: <class 'dict'>
🎯 Found 5 predictions
🌸 Flowers detected: 3
🍎 Fruits detected: 2
💯 Max confidence: 0.89
📝 All detections: [{'class': 'flower', 'confidence': 0.89}, ...]

✅ Analysis complete!
📊 Result: flowering stage detected
🎯 Confidence: 0.89
🔢 Detections: 3
🗑️ Cleaned up temporary file
============================================================
✅ Request completed successfully
============================================================
```

---

## 🔍 Debugging Your Workflow

### Check What Your Workflow Returns

1. **Run the test script:**
   ```powershell
   python test_roboflow.py
   ```

2. **Look at the "Raw Result" section** - This shows exactly what your workflow returns

3. **Common structures:**

   **Structure A: Output with predictions**
   ```python
   [
     {
       "output": {
         "predictions": [
           {"class": "flower", "confidence": 0.89},
           {"class": "fruit", "confidence": 0.76}
         ]
       }
     }
   ]
   ```

   **Structure B: Top-level predictions**
   ```python
   [
     {
       "predictions": [
         {"class": "flower", "confidence": 0.89}
       ]
     }
   ]
   ```

4. **Update the parser if needed** - The service handles both structures, but if yours is different, update `parse_roboflow_result()`

---

## 🎯 Response Format

The service returns:

```json
{
  "stage": "flowering",
  "confidence": 0.89,
  "detections": 3,
  "flowering_results": {
    "confidence": 0.89,
    "detections": 3
  },
  "fruiting_results": {
    "confidence": 0,
    "detections": 0
  },
  "recommendations": [
    "🌸 Detected 3 flower(s) - Plant is in flowering stage",
    "Ensure adequate pollination (bees, hand pollination)",
    "Maintain consistent watering - avoid water stress",
    "Monitor for pests on flowers (aphids, thrips)",
    "Avoid excessive nitrogen - promote flower development"
  ],
  "processing_time": 1.23,
  "model_version": "roboflow-v1",
  "all_detections": [
    {"class": "flower", "confidence": 0.89},
    {"class": "flower", "confidence": 0.82},
    {"class": "flower", "confidence": 0.76}
  ],
  "raw_result": [...]  // Full Roboflow response for debugging
}
```

---

## 🔧 Customizing Detection Logic

Edit `roboflow_service.py` around line 160:

```python
# Add your custom class names
if 'flower' in class_name or 'bloom' in class_name or 'blossom' in class_name:
    flower_count += 1
elif 'fruit' in class_name or 'berry' in class_name or 'YOUR_CLASS' in class_name:
    fruit_count += 1
```

Add more stages:

```python
# Around line 200
elif seed_count > 0:
    response['stage'] = 'seeding'
    response['recommendations'] = [
        'Seeds detected',
        'Your custom recommendations'
    ]
```

---

## 🐛 Troubleshooting

### Issue: "Client not initialized"

**Solution:**
```powershell
# Check environment variables
cd backend
Get-Content .env | Select-String "ROBOFLOW"

# Should show:
# ROBOFLOW_API_KEY=nRWwVHvuqJPkPtV2WZoB
# ROBOFLOW_WORKSPACE=moh-s15o3
# ROBOFLOW_WORKFLOW_ID=custom-workflow
```

### Issue: "No detections found"

**Possible causes:**
1. Workflow not configured correctly
2. Image doesn't contain flowers/fruits
3. Class names don't match detection logic

**Solution:**
1. Run `python test_roboflow.py` to see raw results
2. Check the `all_detections` array in response
3. Update class name matching in `parse_roboflow_result()`

### Issue: "Workflow not found"

**Solution:**
- Check Roboflow dashboard
- Verify workflow ID: `custom-workflow`
- Ensure workflow is published
- Try using workflow URL from Roboflow dashboard

### Issue: Getting 200 but no predictions

**This means the request succeeded but workflow returned empty results**

**Check:**
1. Look at logs - see "Raw Roboflow Result"
2. Run test script to see exact structure
3. Verify your workflow processes the image type
4. Test with known good images (flowers/fruits)

---

## 📝 Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health check |
| POST | `/predict` | Analyze uploaded image |
| POST | `/test-workflow` | Test workflow (debugging) |
| GET | `/workflow/info` | Workflow configuration |
| GET | `/test` | Simple connection test |

---

## 🎯 Next Steps

1. **Test the updated service:**
   ```powershell
   python test_roboflow.py
   python roboflow_service.py
   ```

2. **Make a test request:**
   ```powershell
   curl -X POST http://localhost:8000/predict -F "file=@image.jpg"
   ```

3. **Check the logs** - Look for:
   - Raw Roboflow result
   - Detected classes
   - Confidence scores
   - Any errors

4. **Adjust parsing** if needed based on your workflow's response structure

5. **Test with backend:**
   ```powershell
   # Start backend in another terminal
   cd backend
   node server.js
   
   # Then test full flow
   ```

---

## 💡 Pro Tips

1. **Use `/test-workflow` first** - It's faster and shows raw results
2. **Check logs carefully** - They show exactly what's happening
3. **Test with known images** - Use images you know have flowers/fruits
4. **Raw result is your friend** - It's included in every response for debugging
5. **Update class names** - Match them to what your workflow actually returns

---

**The service is now much more verbose and easier to debug!** 🎉

Run `python test_roboflow.py` to see what your workflow returns, then adjust the parsing logic accordingly.
