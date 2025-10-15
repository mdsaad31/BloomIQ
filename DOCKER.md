# Docker Deployment Guide

## Prerequisites

- Docker Desktop installed
- Docker Compose installed

## Quick Start

### 1. Build and Start All Services

```bash
# Create .env file
cp backend/.env.example .env

# Edit .env with your values
# JWT_SECRET=your-secret-key
# WEATHER_API_KEY=your-api-key

# Build and start
docker-compose up --build
```

Services will be available at:
- Backend API: http://localhost:5000
- Python Service: http://localhost:8000
- Web Frontend: http://localhost:3000

### 2. Stop Services

```bash
docker-compose down
```

### 3. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f python-service
```

## Production Deployment

### Using Docker Compose

```bash
# Build for production
docker-compose -f docker-compose.yml up -d --build

# Scale services (if needed)
docker-compose up -d --scale python-service=3
```

### Individual Containers

```bash
# Build backend
cd backend
docker build -t bloomiq-backend .
docker run -p 5000:5000 --env-file .env bloomiq-backend

# Build Python service
cd python-service
docker build -t bloomiq-python .
docker run -p 8000:8000 bloomiq-python

# Build web (requires build first)
cd web
npm run build
docker run -p 3000:80 -v $(pwd)/build:/usr/share/nginx/html nginx:alpine
```

## Environment Variables

Create `.env` file in project root:

```env
JWT_SECRET=your-super-secret-jwt-key
WEATHER_API_KEY=your-openweathermap-api-key
NODE_ENV=production
PORT=5000
```

## Data Persistence

Volumes are created for:
- `/backend/uploads` - Uploaded images
- `/backend/database.sqlite` - Database
- `/backend/models` - YOLOv8 models

## Health Checks

```bash
# Backend
curl http://localhost:5000/health

# Python Service
curl http://localhost:8000/health
```

## Troubleshooting

### Container won't start
```bash
docker-compose logs <service-name>
```

### Rebuild containers
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Clear all data
```bash
docker-compose down -v
```

## Cloud Deployment

### AWS (Elastic Beanstalk)
- Upload `docker-compose.yml`
- Configure environment variables
- Deploy

### Google Cloud (Cloud Run)
- Build container images
- Push to Container Registry
- Deploy to Cloud Run

### Azure (Container Instances)
- Build images
- Push to Azure Container Registry
- Create container groups

## Security Notes

- Change default JWT secret
- Use HTTPS in production
- Set up firewall rules
- Use secrets management
- Regular security updates

---

For more deployment options, see main README.md
