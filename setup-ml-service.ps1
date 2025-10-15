# BloomIQ Python Service Setup Script
# Installs dependencies and starts the Roboflow ML service

Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 59) -ForegroundColor Cyan
Write-Host "🌿 BloomIQ - Python ML Service Setup" -ForegroundColor Green
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 59) -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
Write-Host "🔍 Checking Python installation..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Python not found. Please install Python 3.8 or higher." -ForegroundColor Red
    Write-Host "   Download from: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Found: $pythonVersion" -ForegroundColor Green
Write-Host ""

# Navigate to python-service directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$pythonServicePath = Join-Path $scriptPath "backend\python-service"
Set-Location $pythonServicePath

Write-Host "📂 Working directory: $pythonServicePath" -ForegroundColor Cyan
Write-Host ""

# Check if virtual environment exists
$venvPath = Join-Path $pythonServicePath "venv"
if (-Not (Test-Path $venvPath)) {
    Write-Host "🔧 Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to create virtual environment" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Virtual environment created" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "✅ Virtual environment already exists" -ForegroundColor Green
    Write-Host ""
}

# Activate virtual environment
Write-Host "🔄 Activating virtual environment..." -ForegroundColor Yellow
$activateScript = Join-Path $venvPath "Scripts\Activate.ps1"
& $activateScript

# Upgrade pip
Write-Host "📦 Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip --quiet
Write-Host "✅ pip upgraded" -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "📦 Installing Python dependencies..." -ForegroundColor Yellow
Write-Host "   This may take a few minutes..." -ForegroundColor Gray
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ All dependencies installed" -ForegroundColor Green
Write-Host ""

# Check if .env exists
$envPath = Join-Path (Split-Path $pythonServicePath) ".env"
if (-Not (Test-Path $envPath)) {
    Write-Host "⚠️  Warning: .env file not found" -ForegroundColor Yellow
    Write-Host "   Please create backend/.env with Roboflow credentials" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "✅ Environment configuration found" -ForegroundColor Green
    Write-Host ""
}

# Display configuration
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 59) -ForegroundColor Cyan
Write-Host "📋 Configuration" -ForegroundColor Green
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 59) -ForegroundColor Cyan
Write-Host "Service Type: Roboflow Inference SDK" -ForegroundColor White
Write-Host "Port: 8000" -ForegroundColor White
Write-Host "API URL: http://localhost:8000" -ForegroundColor White
Write-Host ""
Write-Host "Endpoints:" -ForegroundColor Cyan
Write-Host "  - GET  /health       - Health check" -ForegroundColor Gray
Write-Host "  - POST /predict      - Analyze image" -ForegroundColor Gray
Write-Host "  - GET  /workflow/info - Workflow details" -ForegroundColor Gray
Write-Host "  - GET  /test         - Test connection" -ForegroundColor Gray
Write-Host ""

# Ask if user wants to start the service
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 59) -ForegroundColor Cyan
$startService = Read-Host "🚀 Start the ML service now? (Y/n)"
if ($startService -eq "" -or $startService -eq "Y" -or $startService -eq "y") {
    Write-Host ""
    Write-Host "🌿 Starting BloomIQ ML Service..." -ForegroundColor Green
    Write-Host "   Press Ctrl+C to stop" -ForegroundColor Gray
    Write-Host ""
    python roboflow_service.py
} else {
    Write-Host ""
    Write-Host "✅ Setup complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "To start the service manually:" -ForegroundColor Yellow
    Write-Host "  cd backend\python-service" -ForegroundColor Gray
    Write-Host "  .\venv\Scripts\Activate.ps1" -ForegroundColor Gray
    Write-Host "  python roboflow_service.py" -ForegroundColor Gray
    Write-Host ""
}
