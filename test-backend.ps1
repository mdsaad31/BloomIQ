# BloomIQ Backend Test Script
# Run this to verify the unified backend is working

Write-Host "`n" -NoNewline
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🧪 BloomIQ Backend Test Suite" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:5000"
$testsPassed = 0
$testsFailed = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    Write-Host "Testing: $Name..." -NoNewline
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            UseBasicParsing = $true
            TimeoutSec = 10
        }
        
        if ($Body) {
            $params.Body = $Body
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-WebRequest @params
        
        if ($response.StatusCode -eq 200) {
            Write-Host " ✅ PASSED" -ForegroundColor Green
            $script:testsPassed++
            return $true
        } else {
            Write-Host " ⚠️ UNEXPECTED STATUS: $($response.StatusCode)" -ForegroundColor Yellow
            $script:testsFailed++
            return $false
        }
    }
    catch {
        Write-Host " ❌ FAILED" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        $script:testsFailed++
        return $false
    }
}

# Test 1: Server Health
Write-Host "`n📊 Core Services" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
Test-Endpoint -Name "Server Health Check" -Url "$baseUrl/health"
Test-Endpoint -Name "ML Service Health Check" -Url "$baseUrl/api/analysis/ml-health"

# Test 2: Authentication Endpoints
Write-Host "`n🔐 Authentication" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray

# Generate random email for testing
$randomEmail = "test$(Get-Random -Minimum 1000 -Maximum 9999)@test.com"

Write-Host "Testing: User Registration..." -NoNewline
try {
    $registerBody = @{
        name = "Test User"
        email = $randomEmail
        password = "test123456"
        location = "Test City"
    } | ConvertTo-Json
    
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json" -UseBasicParsing
    
    if ($registerResponse.token) {
        Write-Host " ✅ PASSED" -ForegroundColor Green
        $script:testsPassed++
        $token = $registerResponse.token
    } else {
        Write-Host " ❌ FAILED (No token returned)" -ForegroundColor Red
        $script:testsFailed++
    }
}
catch {
    Write-Host " ❌ FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    $script:testsFailed++
}

# Test 3: Login
Write-Host "Testing: User Login..." -NoNewline
try {
    $loginBody = @{
        email = $randomEmail
        password = "test123456"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -UseBasicParsing
    
    if ($loginResponse.token) {
        Write-Host " ✅ PASSED" -ForegroundColor Green
        $script:testsPassed++
        $token = $loginResponse.token
    } else {
        Write-Host " ❌ FAILED (No token returned)" -ForegroundColor Red
        $script:testsFailed++
    }
}
catch {
    Write-Host " ❌ FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    $script:testsFailed++
}

# Test 4: Protected Endpoints (if we have a token)
if ($token) {
    Write-Host "`n🔒 Protected Endpoints" -ForegroundColor Cyan
    Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
    
    $authHeaders = @{
        "Authorization" = "Bearer $token"
    }
    
    Test-Endpoint -Name "User Profile" -Url "$baseUrl/api/profile" -Headers $authHeaders
    Test-Endpoint -Name "Analysis Stats" -Url "$baseUrl/api/analysis/stats" -Headers $authHeaders
    Test-Endpoint -Name "User Reports" -Url "$baseUrl/api/reports" -Headers $authHeaders
}

# Test 5: Weather API (requires token)
if ($token) {
    Write-Host "`n🌤️ Weather Integration" -ForegroundColor Cyan
    Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
    
    Write-Host "Testing: Current Weather..." -NoNewline
    try {
        $weatherBody = @{
            location = "London"
        } | ConvertTo-Json
        
        $weatherResponse = Invoke-RestMethod -Uri "$baseUrl/api/weather/current" -Method POST -Body $weatherBody -ContentType "application/json" -Headers @{"Authorization" = "Bearer $token"} -UseBasicParsing
        
        if ($weatherResponse.location) {
            Write-Host " ✅ PASSED" -ForegroundColor Green
            $script:testsPassed++
        } else {
            Write-Host " ❌ FAILED (No location data)" -ForegroundColor Red
            $script:testsFailed++
        }
    }
    catch {
        Write-Host " ❌ FAILED" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        $script:testsFailed++
    }
}

# Summary
Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "📈 Test Results" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "✅ Tests Passed: $testsPassed" -ForegroundColor Green
Write-Host "❌ Tests Failed: $testsFailed" -ForegroundColor $(if ($testsFailed -eq 0) { "Green" } else { "Red" })
Write-Host "📊 Success Rate: $([math]::Round(($testsPassed / ($testsPassed + $testsFailed)) * 100, 2))%" -ForegroundColor $(if ($testsFailed -eq 0) { "Green" } else { "Yellow" })
Write-Host "============================================================" -ForegroundColor Cyan

if ($testsFailed -eq 0) {
    Write-Host "`n🎉 All tests passed! Backend is working perfectly!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️ Some tests failed. Check the error messages above." -ForegroundColor Yellow
}

Write-Host ""
