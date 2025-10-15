#!/bin/bash

# BloomIQ Setup Script for Linux/Mac
# Run: chmod +x setup.sh && ./setup.sh

echo "🌿 BloomIQ Setup Script"
echo "======================"
echo ""

# Check Node.js
echo "Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "✗ Node.js not found. Please install from https://nodejs.org/"
    exit 1
fi
echo "✓ Node.js found: $(node --version)"

# Check Python
echo "Checking Python..."
if ! command -v python3 &> /dev/null; then
    echo "✗ Python not found. Please install from https://python.org/"
    exit 1
fi
echo "✓ Python found: $(python3 --version)"

echo ""
echo "Installing Dependencies..."
echo ""

# Backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "✗ Backend installation failed"
    exit 1
fi
echo "✓ Backend dependencies installed"

# Python dependencies
echo "📦 Installing Python dependencies..."
cd python-service
pip3 install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "✗ Python installation failed"
    exit 1
fi
echo "✓ Python dependencies installed"
cd ../..

# Web dependencies
echo "📦 Installing web dependencies..."
cd web
npm install
if [ $? -ne 0 ]; then
    echo "✗ Web installation failed"
    exit 1
fi
echo "✓ Web dependencies installed"
cd ..

echo ""
echo "Setting up environment files..."

# Backend .env
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "✓ Created backend/.env"
    echo "  ⚠️  Please edit backend/.env with your settings"
else
    echo "✓ backend/.env already exists"
fi

# Web .env
if [ ! -f "web/.env" ]; then
    cp web/.env.example web/.env
    echo "✓ Created web/.env"
else
    echo "✓ web/.env already exists"
fi

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "Next Steps:"
echo "1. Edit backend/.env with your JWT_SECRET and WEATHER_API_KEY"
echo "2. (Optional) Add YOLOv8 models to backend/models/"
echo "3. Run the following commands in separate terminals:"
echo ""
echo "   Terminal 1: cd backend && npm run dev"
echo "   Terminal 2: cd backend/python-service && python3 app.py"
echo "   Terminal 3: cd web && npm start"
echo ""
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "📖 For more info, see README.md and QUICKSTART.md"
echo ""
echo "Happy farming! 🌱"
