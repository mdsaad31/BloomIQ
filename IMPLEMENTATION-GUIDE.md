# 🌿 BloomIQ - Complete Implementation Guide

## 📚 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Getting Started](#getting-started)
4. [Development Guide](#development-guide)
5. [Deployment](#deployment)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

BloomIQ is a production-level crop analysis platform that uses **YOLOv8 AI models** to detect crop growth stages (Flower/Fruit) and provide actionable farming recommendations.

### Key Features
- 🔐 **Authentication:** JWT-based secure login
- 📸 **Image Analysis:** Dual YOLOv8 model inference
- 📊 **Reports:** Historical analysis tracking
- ☁️ **Weather:** Live weather with farming tips
- 🎨 **Beautiful UI:** Nature-inspired design with animations
- 📱 **Mobile Ready:** React Native structure included

### Tech Stack
```
Frontend:  React.js + TailwindCSS + Framer Motion
Backend:   Node.js + Express.js + SQLite
AI/ML:     Python + Flask + YOLOv8 (Ultralytics)
Mobile:    React Native (structure)
DevOps:    Docker + Docker Compose + Nginx
```

---

## 🏗️ Architecture

### System Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                         │
│  ┌──────────────┐              ┌──────────────┐        │
│  │  React Web   │              │ React Native │        │
│  │  (Port 3000) │              │   (Mobile)   │        │
│  └──────┬───────┘              └──────┬───────┘        │
│         │                             │                 │
│         └─────────────┬───────────────┘                 │
│                       │ HTTP/REST                       │
└───────────────────────┼─────────────────────────────────┘
                        │
┌───────────────────────┼─────────────────────────────────┐
│                       ▼   API LAYER                     │
│          ┌────────────────────────┐                     │
│          │   Express.js Server    │                     │
│          │     (Port 5000)        │                     │
│          │                        │                     │
│          │  Routes:               │                     │
│          │  • /api/auth           │                     │
│          │  • /api/analysis       │                     │
│          │  • /api/reports        │                     │
│          │  • /api/weather        │                     │
│          │  • /api/profile        │                     │
│          └───┬──────────────┬─────┘                     │
│              │              │                           │
└──────────────┼──────────────┼───────────────────────────┘
               │              │
               │              └──────────────┐
               ▼                             ▼
┌──────────────────────┐      ┌──────────────────────────┐
│   DATA LAYER         │      │   AI/ML LAYER            │
│                      │      │                          │
│  ┌────────────┐      │      │  ┌────────────────┐     │
│  │   SQLite   │      │      │  │ Python Flask   │     │
│  │  Database  │      │      │  │  (Port 8000)   │     │
│  │            │      │      │  │                │     │
│  │ • users    │      │      │  │  YOLOv8 Models:│     │
│  │ • reports  │      │      │  │  • flower.pt   │     │
│  │ • stats    │      │      │  │  • fruit.pt    │     │
│  └────────────┘      │      │  └────────────────┘     │
│                      │      │                          │
│  ┌────────────┐      │      │  Inference Logic:       │
│  │  Uploads   │      │      │  1. Run both models     │
│  │  Directory │      │      │  2. Compare confidence  │
│  └────────────┘      │      │  3. Return dominant     │
│                      │      │                          │
└──────────────────────┘      └──────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────┐
│              EXTERNAL SERVICES                           │
│  ┌─────────────────────────────────────────────┐        │
│  │       OpenWeatherMap API                    │        │
│  │  • Current weather                          │        │
│  │  • Temperature, humidity, rainfall          │        │
│  │  • Farming recommendations                  │        │
│  └─────────────────────────────────────────────┘        │
└──────────────────────────────────────────────────────────┘
```

### Data Flow: Image Analysis
```
1. User uploads image via React frontend
   ↓
2. Express server receives image (Multer)
   ↓
3. Server sends image to Python service (HTTP)
   ↓
4. Python loads both YOLOv8 models
   ↓
5. Flower model runs inference → confidence_f
   ↓
6. Fruit model runs inference → confidence_fruit
   ↓
7. Compare: if confidence_f > confidence_fruit
      → return "Flower" + flower detections
   else
      → return "Fruit" + fruit detections
   ↓
8. Add health summary and recommendations
   ↓
9. Express saves to database
   ↓
10. Return result to frontend
   ↓
11. Display animated result card to user
```

---

## 🚀 Getting Started

### Prerequisites
```bash
# Check versions
node --version    # Should be 16+
python --version  # Should be 3.9+
npm --version
pip --version
```

### Quick Setup (Windows PowerShell)
```powershell
# Run setup script
.\setup.ps1
```

### Quick Setup (Linux/Mac)
```bash
# Make executable and run
chmod +x setup.sh
./setup.sh
```

### Manual Setup

#### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your settings
```

#### 2. Python Service
```bash
cd backend/python-service
pip install -r requirements.txt
# Add models to ../models/ directory
```

#### 3. Web Frontend
```bash
cd web
npm install
cp .env.example .env
```

### Environment Configuration

**backend/.env:**
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=generate-a-secure-random-string-here
PYTHON_SERVICE_URL=http://localhost:8000
WEATHER_API_KEY=get-from-openweathermap-org
DATABASE_PATH=./database.sqlite
```

**web/.env:**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Output: 🌿 BloomIQ Backend Server running on port 5000
```

**Terminal 2 - Python AI Service:**
```bash
cd backend/python-service
python app.py
# Output: 🚀 Starting Flask server on port 8000...
```

**Terminal 3 - Web Frontend:**
```bash
cd web
npm start
# Output: Compiled successfully! Open http://localhost:3000
```

---

## 💻 Development Guide

### Adding a New API Endpoint

1. **Create route file** (`backend/routes/newRoute.js`)
```javascript
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
  // Your logic here
  res.json({ message: 'Success' });
});

module.exports = router;
```

2. **Register in server.js**
```javascript
const newRoute = require('./routes/newRoute');
app.use('/api/new', newRoute);
```

### Adding a New React Page

1. **Create page** (`web/src/pages/NewPage.js`)
```javascript
import React from 'react';
import { motion } from 'framer-motion';

const NewPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1>New Page</h1>
    </motion.div>
  );
};

export default NewPage;
```

2. **Add route in App.js**
```javascript
<Route path="newpage" element={<NewPage />} />
```

3. **Add to navigation** (`web/src/components/Navbar.js`)
```javascript
{ path: '/newpage', icon: IconName, label: 'New Page' }
```

### Database Operations

**Add new table:**
```javascript
// In backend/database/db.js
db.run(`
  CREATE TABLE IF NOT EXISTS new_table (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
```

**Query examples:**
```javascript
// Insert
await dbRun('INSERT INTO table (id, data) VALUES (?, ?)', [id, data]);

// Select
const row = await dbGet('SELECT * FROM table WHERE id = ?', [id]);

// Select multiple
const rows = await dbAll('SELECT * FROM table WHERE user_id = ?', [userId]);
```

### Modifying YOLOv8 Inference

**Edit `backend/python-service/app.py`:**
```python
def analyze_image(image_path):
    # Your custom logic
    flower_results = flower_model(image_path, conf=0.25)
    fruit_results = fruit_model(image_path, conf=0.25)
    
    # Process results
    # Return custom structure
    return {
        'stage': 'Custom Stage',
        'confidence': 0.95,
        'custom_field': 'value'
    }
```

---

## 🚢 Deployment

### Docker Deployment

**Build and run:**
```bash
docker-compose up --build -d
```

**Check logs:**
```bash
docker-compose logs -f
```

**Stop services:**
```bash
docker-compose down
```

### Production Deployment Options

#### 1. **Traditional Server (VPS)**
```bash
# Install PM2
npm install -g pm2

# Start backend
cd backend
pm2 start server.js --name bloomiq-backend

# Start Python
cd python-service
pm2 start app.py --name bloomiq-python --interpreter python3

# Setup nginx reverse proxy
```

#### 2. **Vercel (Frontend Only)**
```bash
cd web
npm run build
vercel --prod
```

#### 3. **Heroku**
```bash
# Add Procfile
echo "web: node backend/server.js" > Procfile
git push heroku main
```

#### 4. **AWS**
- **EC2:** Traditional deployment
- **Elastic Beanstalk:** Docker deployment
- **Lambda:** Serverless (requires refactoring)

#### 5. **Google Cloud**
- **Cloud Run:** Container deployment
- **App Engine:** Standard/Flexible environment
- **Compute Engine:** VM-based

### Production Checklist
- [ ] Change JWT_SECRET to secure random string
- [ ] Use production database (PostgreSQL)
- [ ] Enable HTTPS/SSL
- [ ] Set up CDN for images
- [ ] Configure CORS properly
- [ ] Add rate limiting
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Add logging service
- [ ] Load test application

---

## 🔧 Troubleshooting

### Common Issues

#### 1. "EADDRINUSE: Port already in use"
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

#### 2. "Python service not connecting"
```bash
# Check if running
curl http://localhost:8000/health

# Restart
cd backend/python-service
python app.py
```

#### 3. "Models not loading"
- Check files exist: `backend/models/flower_model.pt` and `fruit_model.pt`
- System uses YOLOv8n as fallback if missing
- Check Python logs for errors

#### 4. "Database locked"
```bash
cd backend
rm database.sqlite
npm run dev  # Recreates database
```

#### 5. "React build fails"
```bash
cd web
rm -rf node_modules package-lock.json
npm install
npm start
```

### Debug Mode

**Backend:**
```bash
NODE_ENV=development npm run dev
```

**Python:**
```python
# In app.py
app.run(host='0.0.0.0', port=8000, debug=True)
```

---

## 📖 Additional Resources

- **Main README:** [README.md](./README.md)
- **Quick Start:** [QUICKSTART.md](./QUICKSTART.md)
- **API Testing:** [API-TESTING.md](./API-TESTING.md)
- **Docker Guide:** [DOCKER.md](./DOCKER.md)
- **Roadmap:** [ROADMAP.md](./ROADMAP.md)
- **Checklist:** [CHECKLIST.md](./CHECKLIST.md)

---

## 🤝 Support

For issues and questions:
1. Check documentation files
2. Review error messages carefully
3. Check logs (backend, Python, browser console)
4. Open a GitHub issue with:
   - Error message
   - Steps to reproduce
   - Environment details

---

**Happy farming with BloomIQ! 🌱**
