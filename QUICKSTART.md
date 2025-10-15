# 🚀 Quick Start Guide - BloomIQ

This guide will help you get BloomIQ up and running in minutes.

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Node.js** (v16+) - [Download](https://nodejs.org/)
- [ ] **Python** (v3.9+) - [Download](https://www.python.org/)
- [ ] **npm** (comes with Node.js)
- [ ] **pip** (comes with Python)
- [ ] **Git** - [Download](https://git-scm.com/)

### Optional (for mobile development):
- [ ] **React Native CLI**
- [ ] **Android Studio**
- [ ] **Java JDK 11+**

---

## 🎯 Setup Steps

### Step 1: Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd BloomIQ-v4

# Install backend dependencies
cd backend
npm install

# Install Python dependencies
cd python-service
pip install -r requirements.txt
cd ../..

# Install web frontend dependencies
cd web
npm install
cd ..
```

### Step 2: Configure Environment

#### Backend Configuration

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
JWT_SECRET=my-super-secret-key-123
PYTHON_SERVICE_URL=http://localhost:8000
WEATHER_API_KEY=your-key-here
```

> **Get Weather API Key:** Sign up at [OpenWeatherMap](https://openweathermap.org/api) (free tier available)

#### Web Configuration

```bash
cd web
cp .env.example .env
```

Edit `web/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Step 3: Add YOLOv8 Models (Optional)

If you have trained models:

```bash
# Copy your models to backend/models/
cp /path/to/flower_model.pt backend/models/
cp /path/to/fruit_model.pt backend/models/
```

> **Don't have models?** The app will use YOLOv8n as fallback.

---

## 🏃 Running the Application

### Option A: All Services Separately (Recommended for Development)

Open **3 terminal windows**:

#### Terminal 1: Backend Server
```bash
cd backend
npm run dev
```
✅ Server should start on `http://localhost:5000`

#### Terminal 2: Python AI Service
```bash
cd backend/python-service
python app.py
```
✅ Service should start on `http://localhost:8000`

#### Terminal 3: Web Frontend
```bash
cd web
npm start
```
✅ Browser should open at `http://localhost:3000`

### Option B: Using Concurrently (Requires Setup)

```bash
cd backend
npm run dev-all
```

---

## ✅ Verify Installation

### 1. Check Backend Health
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "...",
  "service": "BloomIQ Backend"
}
```

### 2. Check Python Service
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "ok",
  "models_loaded": true
}
```

### 3. Open Web App

Navigate to: `http://localhost:3000`

You should see the BloomIQ login page! 🌿

---

## 🎉 First Time Usage

1. **Register:** Click "Register" and create an account
2. **Login:** Use your credentials to log in
3. **Dashboard:** Explore the dashboard
4. **Analyze:** Upload a crop image (any plant/flower image works)
5. **View Results:** See AI analysis with recommendations

---

## 🐛 Troubleshooting

### Python Dependencies Error

```bash
cd backend/python-service
pip install --upgrade pip
pip install -r requirements.txt
```

### Port Already in Use

**Backend (5000):**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

**Python (8000):**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

### React Not Starting

```bash
cd web
rm -rf node_modules package-lock.json
npm install
npm start
```

### Database Issues

```bash
cd backend
rm database.sqlite  # Deletes existing database
npm run dev  # Creates fresh database
```

---

## 📱 Mobile App (Optional)

```bash
cd mobile
npm install

# For Android
npm run android

# For iOS (macOS only)
npm run ios
```

See `mobile/README.md` for detailed setup.

---

## 🎓 Next Steps

- Read the [Full Documentation](./README.md)
- Check [API Documentation](./README.md#api-documentation)
- Explore [Deployment Options](./README.md#deployment)

---

## 💡 Tips

1. **Weather API:** Free tier allows 1000 calls/day
2. **Models:** Train custom YOLOv8 models for better accuracy
3. **Database:** Switch to PostgreSQL for production
4. **Deployment:** Use Docker for easier deployment

---

## 🆘 Need Help?

- Check main [README.md](./README.md)
- Open a GitHub Issue
- Review error messages carefully

---

**Happy Farming! 🌱**
