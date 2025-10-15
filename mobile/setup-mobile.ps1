# BloomIQ Mobile Setup Script

Write-Host "🚀 Setting up BloomIQ Mobile App..." -ForegroundColor Green

# Check if we're in the mobile directory
if (!(Test-Path "package.json")) {
    Write-Host "❌ Please run this script from the mobile directory" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host "🔧 Checking React Native environment..." -ForegroundColor Yellow
npx react-native doctor

Write-Host "📱 For Android development:" -ForegroundColor Cyan
Write-Host "   1. Make sure Android Studio is installed" -ForegroundColor White
Write-Host "   2. Set up Android SDK and AVD" -ForegroundColor White
Write-Host "   3. Add Android SDK to your PATH" -ForegroundColor White
Write-Host "   4. Create or start an Android Virtual Device (AVD)" -ForegroundColor White

Write-Host "🍎 For iOS development (macOS only):" -ForegroundColor Cyan
Write-Host "   1. Install Xcode from App Store" -ForegroundColor White
Write-Host "   2. Install Xcode Command Line Tools" -ForegroundColor White
Write-Host "   3. Install CocoaPods: sudo gem install cocoapods" -ForegroundColor White

Write-Host "🌐 Backend Configuration:" -ForegroundColor Cyan
Write-Host "   1. Make sure your backend is running on port 5000" -ForegroundColor White
Write-Host "   2. Update .env file with your computer's IP address for physical device testing" -ForegroundColor White
Write-Host "   3. Android Emulator uses 10.0.2.2 to access localhost" -ForegroundColor White

Write-Host "🏃‍♂️ To run the app:" -ForegroundColor Green
Write-Host "   # Start Metro bundler" -ForegroundColor White
Write-Host "   npm start" -ForegroundColor White
Write-Host ""
Write-Host "   # In another terminal, run Android" -ForegroundColor White
Write-Host "   npm run android" -ForegroundColor White
Write-Host ""
Write-Host "   # Or for iOS (macOS only)" -ForegroundColor White
Write-Host "   npm run ios" -ForegroundColor White

Write-Host "✅ Mobile app setup complete!" -ForegroundColor Green
Write-Host "📖 Check README.md for detailed instructions" -ForegroundColor Yellow