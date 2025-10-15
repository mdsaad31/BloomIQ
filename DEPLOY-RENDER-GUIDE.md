# 🚀 Deploy BloomIQ Backend to Render.com

## 📋 Prerequisites

- GitHub account
- Render.com account (free tier available)
- MongoDB Atlas account (or any MongoDB instance)
- Roboflow API key
- Weather API key (optional)

---

## 🎯 Step-by-Step Deployment Guide

### **Step 1: Push Backend to GitHub**

1. **Initialize Git** (if not already done):
```bash
cd backend
git init
git add .
git commit -m "Initial commit - BloomIQ Backend"
```

2. **Create GitHub Repository**:
- Go to https://github.com/new
- Create a new repository: `bloomiq-backend`
- Don't initialize with README (we already have code)

3. **Push to GitHub**:
```bash
git remote add origin https://github.com/YOUR_USERNAME/bloomiq-backend.git
git branch -M main
git push -u origin main
```

---

### **Step 2: Set Up MongoDB Atlas** (If Not Already Done)

1. **Go to** https://cloud.mongodb.com
2. **Create free cluster**
3. **Create database user**:
   - Username: `bloomiq`
   - Password: Generate strong password
   - Save the password!

4. **Whitelist IP addresses**:
   - Click "Network Access"
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

5. **Get Connection String**:
   - Click "Connect" on your cluster
   - Select "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Example: `mongodb+srv://bloomiq:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/bloomiq?retryWrites=true&w=majority`

---

### **Step 3: Deploy to Render**

#### **Option A: Using Render Dashboard (Recommended)**

1. **Go to Render.com** and login
2. **Click "New +" → "Web Service"**
3. **Connect GitHub Repository**:
   - Click "Connect GitHub"
   - Select your repository: `bloomiq-backend`
   - Click "Connect"

4. **Configure Service**:
   ```
   Name: bloomiq-backend
   Region: Oregon (US West)
   Branch: main
   Root Directory: (leave empty if backend is at root)
   Runtime: Node
   Build Command: npm install
   Start Command: node server.js
   Instance Type: Free
   ```

5. **Add Environment Variables**:
   Click "Advanced" → "Add Environment Variable"

   **Required Variables:**
   ```
   NODE_ENV = production
   PORT = 5000
   MONGODB_URI = your_mongodb_connection_string
   JWT_SECRET = your_generated_secret_key
   ROBOFLOW_API_KEY = your_roboflow_api_key
   ROBOFLOW_WORKSPACE = moh-s15o3
   ROBOFLOW_WORKFLOW_ID = custom-workflow
   ```

   **Optional Variables:**
   ```
   WEATHER_API_KEY = your_weatherapi_key
   UPLOAD_DIR = ./uploads
   ```

6. **Click "Create Web Service"**

7. **Wait for Deployment** (5-10 minutes)
   - Render will install dependencies
   - Start your server
   - You'll see build logs in real-time

8. **Get Your Backend URL**:
   - After successful deployment
   - You'll get a URL like: `https://bloomiq-backend.onrender.com`
   - This is your production backend URL!

#### **Option B: Using render.yaml (Blueprint)**

1. **Commit render.yaml** to your repo:
```bash
git add render.yaml
git commit -m "Add Render configuration"
git push
```

2. **In Render Dashboard**:
   - Click "New +" → "Blueprint"
   - Connect your repository
   - Render will automatically detect `render.yaml`
   - Click "Apply"

3. **Add Environment Variables** in Render dashboard

---

### **Step 4: Update Mobile App API URL**

1. **Get your Render URL**:
   - Example: `https://bloomiq-backend.onrender.com`

2. **Update mobile app** `.env`:
```bash
# Edit mobile-expo/.env
API_URL=https://bloomiq-backend.onrender.com/api
```

3. **Rebuild mobile app**:
```bash
cd mobile-expo
eas build --platform android --profile preview
```

---

### **Step 5: Test Deployment**

1. **Test Health Endpoint**:
```bash
curl https://YOUR_RENDER_URL.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-15T...",
  "service": "BloomIQ Backend",
  "mongodb": "connected",
  "uptime": 123.45
}
```

2. **Test Root Endpoint**:
```bash
curl https://YOUR_RENDER_URL.onrender.com/
```

Expected response:
```json
{
  "name": "BloomIQ Backend API",
  "version": "1.0.0",
  "status": "running",
  "endpoints": {
    "health": "/health",
    "auth": "/api/auth",
    ...
  }
}
```

3. **Test Registration**:
```bash
curl -X POST https://YOUR_RENDER_URL.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

## 🔐 Environment Variables Reference

### **Required Variables:**

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret for JWT tokens | `your_secret_key_here` |
| `ROBOFLOW_API_KEY` | Roboflow API key | `your_api_key` |
| `ROBOFLOW_WORKSPACE` | Roboflow workspace | `moh-s15o3` |
| `ROBOFLOW_WORKFLOW_ID` | Roboflow workflow ID | `custom-workflow` |

### **Optional Variables:**

| Variable | Description | Default |
|----------|-------------|---------|
| `WEATHER_API_KEY` | WeatherAPI.com key | Mock data |
| `UPLOAD_DIR` | Upload directory | `./uploads` |

---

## 📊 Render Free Tier Limitations

- ✅ 750 hours/month (always on)
- ✅ Automatic HTTPS
- ✅ Automatic deployments from GitHub
- ⚠️ Sleeps after 15 minutes of inactivity
- ⚠️ Cold starts (15-30 seconds wake-up time)
- ⚠️ 512 MB RAM

### **Handling Cold Starts:**

Add a ping service to keep backend awake:
```javascript
// Optional: Use a service like UptimeRobot to ping your backend every 5 minutes
// https://uptimerobot.com
```

---

## 🔄 Continuous Deployment

Render automatically deploys when you push to GitHub:

1. **Make changes** to backend code
2. **Commit and push**:
```bash
git add .
git commit -m "Update backend"
git push
```
3. **Render auto-deploys** - Check logs in Render dashboard

---

## 🐛 Troubleshooting

### **Deployment Failed:**

**Check Render Logs:**
1. Go to Render dashboard
2. Click on your service
3. Click "Logs" tab
4. Look for error messages

**Common Issues:**

1. **MongoDB Connection Failed:**
   - Check MONGODB_URI is correct
   - Verify password has no special characters or is URL-encoded
   - Check MongoDB Atlas whitelist (should allow 0.0.0.0/0)

2. **Missing Environment Variables:**
   - Verify all required env vars are set in Render
   - Check for typos in variable names

3. **Build Failed:**
   - Check package.json has all dependencies
   - Verify Node version compatibility

### **Backend Works But Can't Connect from Mobile:**

1. **Check API_URL in mobile app**:
   - Should be `https://YOUR_RENDER_URL.onrender.com/api`
   - NOT `http://localhost:5000/api`

2. **Check CORS**:
   - Backend should have `app.use(cors())` enabled

3. **Test with cURL first** before testing mobile app

---

## 🎯 Post-Deployment Checklist

- [ ] Backend deployed successfully on Render
- [ ] MongoDB connected (check logs)
- [ ] Health endpoint returns OK
- [ ] Environment variables configured
- [ ] Mobile app updated with production API URL
- [ ] Test user registration
- [ ] Test login
- [ ] Test crop analysis
- [ ] Test weather API
- [ ] Set up uptime monitoring (optional)

---

## 📱 Update Mobile App

After backend is deployed:

1. **Update API URL** in `mobile-expo/.env`:
```env
API_URL=https://YOUR_RENDER_URL.onrender.com/api
```

2. **Test locally first**:
```bash
cd mobile-expo
npx expo start
# Test on device
```

3. **Build production APK**:
```bash
eas build --platform android --profile production
```

---

## 🔗 Useful Links

- **Render Dashboard**: https://dashboard.render.com
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Render Docs**: https://render.com/docs
- **Render Status**: https://status.render.com

---

## 💡 Tips for Production

1. **Use Environment Variables** for all secrets
2. **Never commit** .env file to Git
3. **Set up monitoring** (UptimeRobot, Datadog, etc.)
4. **Check logs regularly** in Render dashboard
5. **Keep dependencies updated** (npm audit)
6. **Use proper error handling** in all routes
7. **Add rate limiting** for API endpoints (optional)

---

## 🚀 Alternative Deployment Options

If Render free tier doesn't work:

1. **Railway.app** - Similar to Render, free tier
2. **Heroku** - $5/month for basic dyno
3. **DigitalOcean App Platform** - $5/month
4. **AWS Elastic Beanstalk** - Pay per usage
5. **Google Cloud Run** - Free tier available

---

## ✅ Deployment Complete!

Once deployed, your backend will be:
- ✅ Publicly accessible
- ✅ HTTPS enabled
- ✅ Auto-deploying from GitHub
- ✅ Connected to MongoDB
- ✅ Ready for mobile app

**Your mobile app can now connect to a production backend!** 🎉

---

## 🎯 Next Steps

1. Deploy backend to Render
2. Update mobile app API URL
3. Test all features with production backend
4. Build production APK
5. Distribute to users!

**Need help?** Check Render logs or contact support!
