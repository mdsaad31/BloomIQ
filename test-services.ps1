# BloomIQ - Quick Service Test Script
# Tests all services are running correctly

Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 59) -ForegroundColor Cyan
Write-Host "🧪 BloomIQ Service Health Check" -ForegroundColor Green
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 59) -ForegroundColor Cyan
Write-Host ""

$allHealthy = $true

# Test Backend (Node.js)
Write-Host "🔍 Testing Backend (Node.js)..." -ForegroundColor Yellow
try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    if ($backendResponse.StatusCode -eq 200) {
        Write-Host "✅ Backend is running" -ForegroundColor Green
        Write-Host "   URL: http://localhost:5000" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Backend is NOT running" -ForegroundColor Red
    Write-Host "   Start with: cd backend && node server.js" -ForegroundColor Yellow
    $allHealthy = $false
}
Write-Host ""

# Test ML Service (Python)
Write-Host "🔍 Testing ML Service (Python)..." -ForegroundColor Yellow
try {
    $mlResponse = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    if ($mlResponse.StatusCode -eq 200) {
        Write-Host "✅ ML Service is running" -ForegroundColor Green
        Write-Host "   URL: http://localhost:8000" -ForegroundColor Gray
        
        # Parse health data
        $healthData = $mlResponse.Content | ConvertFrom-Json
        Write-Host "   Workspace: $($healthData.workspace)" -ForegroundColor Gray
        Write-Host "   Workflow: $($healthData.workflow_id)" -ForegroundColor Gray
        Write-Host "   Client: $($healthData.client_initialized)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ ML Service is NOT running" -ForegroundColor Red
    Write-Host "   Start with: cd backend\python-service && python roboflow_service.py" -ForegroundColor Yellow
    $allHealthy = $false
}
Write-Host ""

# Test Frontend (React)
Write-Host "🔍 Testing Frontend (React)..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✅ Frontend is running" -ForegroundColor Green
        Write-Host "   URL: http://localhost:3000" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Frontend is NOT running" -ForegroundColor Red
    Write-Host "   Start with: cd web && npm start" -ForegroundColor Yellow
    $allHealthy = $false
}
Write-Host ""

# Summary
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 59) -ForegroundColor Cyan
if ($allHealthy) {
    Write-Host "✅ All services are healthy!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎯 Access Points:" -ForegroundColor Cyan
    Write-Host "   Frontend:   http://localhost:3000" -ForegroundColor White
    Write-Host "   Backend:    http://localhost:5000" -ForegroundColor White
    Write-Host "   ML Service: http://localhost:8000" -ForegroundColor White
    Write-Host ""
    Write-Host "📝 Next Steps:" -ForegroundColor Yellow
    Write-Host "   1. Open http://localhost:3000 in your browser" -ForegroundColor Gray
    Write-Host "   2. Register a new account" -ForegroundColor Gray
    Write-Host "   3. Upload a crop image for analysis" -ForegroundColor Gray
} else {
    Write-Host "⚠️  Some services are not running" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Start all services:" -ForegroundColor Cyan
    Write-Host "   Terminal 1: cd backend && node server.js" -ForegroundColor Gray
    Write-Host "   Terminal 2: cd backend\python-service && python roboflow_service.py" -ForegroundColor Gray
    Write-Host "   Terminal 3: cd web && npm start" -ForegroundColor Gray
}
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 59) -ForegroundColor Cyan
