# BloomIQ Backend Keep-Alive Service (PowerShell)
# Pings the backend every 10 minutes to prevent sleeping

$BackendURL = "https://bloomiq.onrender.com"
$PingInterval = 600  # 10 minutes in seconds

Write-Host "`n" -NoNewline
Write-Host "🚀 BloomIQ Backend Keep-Alive Service" -ForegroundColor Blue
Write-Host ("=" * 50) -ForegroundColor Blue
Write-Host "Backend URL: $BackendURL" -ForegroundColor Blue
Write-Host "Interval: Every 10 minutes" -ForegroundColor Blue
Write-Host "Started at: $(Get-Date -Format 'yyyy-MM-ddTHH:mm:ss')" -ForegroundColor Blue
Write-Host ("=" * 50) -ForegroundColor Blue
Write-Host "`n"

function Ping-Backend {
    $timestamp = Get-Date -Format 'yyyy-MM-ddTHH:mm:ss'
    Write-Host "`n[$timestamp] 🔄 Pinging backend..." -ForegroundColor Blue
    
    try {
        # Ping health endpoint
        $healthResponse = Invoke-RestMethod -Uri "$BackendURL/health" -Method Get -TimeoutSec 30
        
        if ($healthResponse.status -eq "ok") {
            Write-Host "✅ Health check passed!" -ForegroundColor Green
            Write-Host "   Status: $($healthResponse.status)" -ForegroundColor Green
            Write-Host "   MongoDB: $($healthResponse.mongodb)" -ForegroundColor Green
            Write-Host "   Uptime: $([math]::Floor($healthResponse.uptime)) seconds" -ForegroundColor Green
        }
        
        # Ping root endpoint
        $rootResponse = Invoke-RestMethod -Uri "$BackendURL/" -Method Get -TimeoutSec 30
        Write-Host "✅ Root endpoint check passed!" -ForegroundColor Green
        
        return $true
    }
    catch {
        if ($_.Exception.Message -match "timeout") {
            Write-Host "⚠️  Request timeout (backend might be waking up)" -ForegroundColor Yellow
        }
        else {
            Write-Host "❌ Error pinging backend: $($_.Exception.Message)" -ForegroundColor Red
        }
        return $false
    }
}

# Run immediately on start
Ping-Backend

# Run in loop
try {
    while ($true) {
        Start-Sleep -Seconds $PingInterval
        Ping-Backend
    }
}
catch {
    Write-Host "`n👋 Shutting down keep-alive service..." -ForegroundColor Yellow
    exit 0
}
