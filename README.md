# 🌿 BloomIQ - Smart Crop Analysis Platform

BloomIQ is a production-level, AI-powered crop health monitoring application built with YOLOv8 for real-time flower and fruit stage detection. It combines modern web and mobile technologies to deliver accurate, fast, and visually rich crop analysis.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## ✨ Features

### 🌿 Home Dashboard
- Beautiful plant-themed interface with natural animations
- Quick stats: weather, total analyses, recent reports
- Quick actions: Analyze Now, View Reports, Check Weather

### 📸 Crop Analysis
- Upload or capture crop images
- **Dual YOLOv8 Model Integration:**
  - `flower_model.pt` - Flower stage detection
  - `fruit_model.pt` - Fruit stage detection
- Real-time inference and stage determination
- Confidence levels and health summaries
- Actionable care recommendations

### 📊 Reports
- Complete analysis history
- Expandable detailed reports
- Detection counts and confidence metrics
- Care recommendations archive

### ☁️ Weather Insights
- Live weather data (OpenWeatherMap API)
- Temperature, humidity, rainfall probability
- Smart farming recommendations based on conditions
- Watering and fertilization timing suggestions

### 👤 Authentication
- Email + Password authentication
- JWT-based secure sessions
- Profile management (name, region, language)

---

## 🛠️ Tech Stack

### Frontend
- **Web:** React.js 18
- **Mobile:** React Native (Android)
- **Styling:** TailwindCSS
- **Animations:** Framer Motion (web), React Native Reanimated (mobile)
- **HTTP Client:** Axios

### Backend
- **Server:** Node.js + Express.js
- **Database:** SQLite (lightweight, file-based)
- **Authentication:** JWT (JSON Web Tokens)
- **File Upload:** Multer

### AI/ML
- **Framework:** Python + Flask
- **Model:** YOLOv8 (Ultralytics)
- **Image Processing:** OpenCV, Pillow

### APIs
- **Weather:** OpenWeatherMap API

---

## 🏗️ Architecture

```
┌─────────────────┐
│   React Web     │
│   React Native  │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐
│  Node.js Server │
│   (Express.js)  │
└────┬───────┬────┘
     │       │
     │       └──────────────┐
     ▼                      ▼
┌─────────┐        ┌────────────────┐
│ SQLite  │        │ Python Service │
│   DB    │        │   (YOLOv8)     │
└─────────┘        └────────────────┘
```

### Inference Flow

1. User uploads image → Express server
2. Server sends image → Python Flask service
3. Python loads both models:
   - `flower_model.pt`
   - `fruit_model.pt`
4. Both models run inference
5. System compares confidence scores
6. Returns dominant stage (Flower/Fruit) + recommendations
7. Server stores result in database
8. Client displays analysis

---

## 📦 Prerequisites

### General
- **Node.js** 16.x or higher
- **Python** 3.9 or higher
- **npm** or **yarn**
- **pip** (Python package manager)

### For Mobile (Optional)
- **React Native CLI**
- **Android Studio** (for Android development)
- **Java JDK** 11 or higher

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd BloomIQ-v4
```

### 2. Backend Setup

#### Install Node.js Dependencies

```bash
cd backend
npm install
```

#### Install Python Dependencies

```bash
cd python-service
pip install -r requirements.txt
cd ..
```

#### Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this
PYTHON_SERVICE_URL=http://localhost:8000
WEATHER_API_KEY=your-openweathermap-api-key
```

#### Add YOLOv8 Models

Place your trained models in `backend/models/`:
- `flower_model.pt`
- `fruit_model.pt`

> **Note:** If models are missing, the system uses YOLOv8n as fallback.

### 3. Web Frontend Setup

```bash
cd ../web
npm install
```

Create `.env`:

```bash
cp .env.example .env
```

Edit `.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Mobile Setup (Optional)

```bash
cd ../mobile
npm install
```

For Android:

```bash
npx react-native run-android
```

---

## 🎯 Usage

### Start All Services

#### Terminal 1: Node.js Backend

```bash
cd backend
npm run dev
```

Server runs on `http://localhost:5000`

#### Terminal 2: Python Inference Service

```bash
cd backend/python-service
python app.py
```

Service runs on `http://localhost:8000`

#### Terminal 3: React Web App

```bash
cd web
npm start
```

App opens at `http://localhost:3000`

### Using the Application

1. **Register/Login:** Create account or sign in
2. **Dashboard:** View stats and weather
3. **Analyze:** Upload/capture crop image
4. **Results:** View stage, confidence, recommendations
5. **Reports:** Check analysis history
6. **Weather:** Get farming recommendations

---

## 📡 API Documentation

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "region": "California",
  "language": "en"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Analysis

#### Analyze Crop
```http
POST /api/analysis/analyze
Authorization: Bearer <token>
Content-Type: multipart/form-data

image: <file>
```

**Response:**
```json
{
  "reportId": "uuid",
  "stage": "Flower",
  "confidence": 0.89,
  "detections": [...],
  "health_summary": "Detected 3 flowers...",
  "recommendations": ["Ensure pollination", ...],
  "imageUrl": "http://..."
}
```

### Weather

#### Get Current Weather
```http
GET /api/weather/current?city=California
Authorization: Bearer <token>
```

### Reports

#### Get All Reports
```http
GET /api/reports
Authorization: Bearer <token>
```

#### Get Report by ID
```http
GET /api/reports/:id
Authorization: Bearer <token>
```

---

## 🌐 Deployment

### Backend (Node.js + Python)

#### Option 1: Traditional Server

```bash
# Install PM2
npm install -g pm2

# Start Node.js
cd backend
pm2 start server.js --name bloomiq-backend

# Start Python (separate process)
cd python-service
pm2 start app.py --name bloomiq-python --interpreter python3
```

#### Option 2: Docker

```dockerfile
# Example Dockerfile for backend
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

### Frontend

#### Web (React)

```bash
cd web
npm run build
# Deploy 'build' folder to:
# - Vercel
# - Netlify
# - AWS S3 + CloudFront
# - GitHub Pages
```

#### Mobile (React Native)

```bash
cd mobile
# Android
npx react-native build-android --release

# Generate APK in android/app/build/outputs/apk/release/
```

---

## 🔧 Troubleshooting

### Python Service Not Connecting

```bash
# Check if service is running
curl http://localhost:8000/health

# Restart service
cd backend/python-service
python app.py
```

### Models Not Loading

- Ensure `flower_model.pt` and `fruit_model.pt` are in `backend/models/`
- Check file permissions
- Verify PyTorch and Ultralytics are installed

### Database Issues

```bash
# Reset database
cd backend
rm database.sqlite
npm run dev  # Recreates tables
```

---

## 📝 License

MIT License - See LICENSE file

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📞 Support

For issues and questions:
- Open a GitHub Issue
- Email: support@bloomiq.example

---

## 🌟 Acknowledgments

- **Ultralytics YOLOv8** - Object detection framework
- **OpenWeatherMap** - Weather data API
- **React Team** - Frontend framework
- **Express.js** - Backend framework

---

**Made with 🌱 by the BloomIQ Team**
