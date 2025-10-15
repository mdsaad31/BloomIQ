# BloomIQ Setup Script for Windows
# Run this script in PowerShell

Write-Host "🌿 BloomIQ Setup Script" -ForegroundColor Green
Write-Host "======================" -ForegroundColor Green
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check Python
Write-Host "Checking Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python not found. Please install from https://python.org/" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Installing Dependencies..." -ForegroundColor Yellow
Write-Host ""

# Backend dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Cyan
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Backend installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Backend dependencies installed" -ForegroundColor Green

# Python dependencies
Write-Host "📦 Installing Python dependencies..." -ForegroundColor Cyan
Set-Location python-service
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Python installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Python dependencies installed" -ForegroundColor Green
Set-Location ..\..

# Web dependencies
Write-Host "📦 Installing web dependencies..." -ForegroundColor Cyan
Set-Location web
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Web installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Web dependencies installed" -ForegroundColor Green
Set-Location ..

Write-Host ""
Write-Host "Setting up environment files..." -ForegroundColor Yellow

# Backend .env
if (-not (Test-Path "backend\.env")) {
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "✓ Created backend/.env" -ForegroundColor Green
    Write-Host "  ⚠️  Please edit backend/.env with your settings" -ForegroundColor Yellow
} else {
    Write-Host "✓ backend/.env already exists" -ForegroundColor Green
}

# Web .env
if (-not (Test-Path "web\.env")) {
    Copy-Item "web\.env.example" "web\.env"
    Write-Host "✓ Created web/.env" -ForegroundColor Green
} else {
    Write-Host "✓ web/.env already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Edit backend/.env with your JWT_SECRET and WEATHER_API_KEY" -ForegroundColor White
Write-Host "2. (Optional) Add YOLOv8 models to backend/models/" -ForegroundColor White
Write-Host "3. Run the following commands in separate terminals:" -ForegroundColor White
Write-Host ""
Write-Host "   Terminal 1: cd backend && npm run dev" -ForegroundColor Cyan
Write-Host "   Terminal 2: cd backend\python-service && python app.py" -ForegroundColor Cyan
Write-Host "   Terminal 3: cd web && npm start" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host ""
Write-Host "📖 For more info, see README.md and QUICKSTART.md" -ForegroundColor Yellow
Write-Host ""
Write-Host "Happy farming! 🌱" -ForegroundColor Green
