# 🧪 BloomIQ Mobile - Complete Testing Guide

## 📋 Prerequisites Checklist

Before testing, you need:
- [ ] Node.js installed (✅ You have this)
- [ ] Android Studio OR
- [ ] Physical Android device with USB debugging
- [ ] Backend server running on port 5000

---

## 🎯 Quick Start - 3 Options

### Option 1: Using Expo Go (Easiest - No Android Studio)
**Best for quick testing on physical device**

### Option 2: Android Studio Emulator
**Best for development without physical device**

### Option 3: Physical Android Device
**Best for real-world testing**

---

## 🚀 Option 1: Test with Expo Go (Recommended for Quick Testing)

Since React Native 0.72 doesn't use Expo by default, let's test with the built-in tools or convert to Expo.

### Quick Web Preview Alternative
While mobile uses React Native, you can test the UI logic in web first:

```bash
cd mobile
npm start
```

Then scan QR code with Expo Go app (if available) or proceed to Option 2.

---

## 🤖 Option 2: Android Studio Emulator (Full Setup)

### Step 1: Install Android Studio
1. Download from: https://developer.android.com/studio
2. Run installer (takes ~10-15 minutes)
3. Open Android Studio
4. Go to **Tools > SDK Manager**
5. Install:
   - ✅ Android SDK Platform 33
   - ✅ Android SDK Build-Tools
   - ✅ Android Emulator
   - ✅ Android SDK Platform-Tools

### Step 2: Set Environment Variables
```powershell
# Add to System Environment Variables
ANDROID_HOME = C:\Users\user\AppData\Local\Android\Sdk

# Add to PATH:
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\emulator
%ANDROID_HOME%\tools
%ANDROID_HOME%\tools\bin
```

### Step 3: Create Virtual Device
```bash
# In Android Studio
1. Click "Device Manager" (phone icon)
2. Click "Create Device"
3. Select "Pixel 5" or "Pixel 6"
4. Select "API 33" (Android 13)
5. Click "Finish"
```

### Step 4: Start Emulator
```bash
# In Android Studio
Click ▶️ on your virtual device

# OR via command line
emulator -avd Pixel_5_API_33
```

### Step 5: Run React Native App
```bash
# Terminal 1 - Start Metro Bundler
cd mobile
npm start

# Terminal 2 - Run on Android (AFTER emulator is running)
cd mobile
npm run android
```

---

## 📱 Option 3: Physical Android Device (Fastest)

### Step 1: Enable Developer Mode
1. Open **Settings** on Android
2. Go to **About Phone**
3. Tap **Build Number** 7 times
4. Developer mode enabled! 🎉

### Step 2: Enable USB Debugging
1. Go to **Settings > Developer Options**
2. Enable **USB Debugging**
3. Enable **Install via USB**

### Step 3: Connect Device
```bash
# Install minimal ADB tools
# Download from: https://dl.google.com/android/repository/platform-tools-latest-windows.zip
# Extract and add to PATH

# Connect USB cable
# Check device connected
adb devices

# Should show:
# List of devices attached
# ABC123DEF456    device
```

### Step 4: Update .env for Device
```bash
# Find your computer's local IP
ipconfig

# Look for "IPv4 Address" like: 192.168.1.100

# Update mobile/.env
API_URL=http://192.168.1.100:5000/api
```

### Step 5: Run App on Device
```bash
# Terminal 1 - Start Metro
cd mobile
npm start

# Terminal 2 - Run on device
cd mobile
npm run android
```

---

## 🎬 Step-by-Step Testing Flow

### 1. Start Backend Server
```bash
# Terminal 1
cd backend
npm start

# Should see:
# ✅ Server running on port 5000
# ✅ MongoDB connected
```

### 2. Start Mobile App
```bash
# Terminal 2
cd mobile
npm start

# Terminal 3 (after Metro is ready)
cd mobile
npm run android
```

### 3. Test Each Screen

#### ✅ Login Screen
- [ ] App opens to login screen
- [ ] Input email: `test@example.com`
- [ ] Input password: `password123`
- [ ] Click "Sign In"
- [ ] Should navigate to Dashboard

#### ✅ Dashboard Screen
- [ ] See PlantLoader animation while loading
- [ ] Statistics cards display
- [ ] Stage distribution shows
- [ ] Recent analyses list
- [ ] Quick action buttons work

#### ✅ Analysis Screen
- [ ] Tap camera icon in tab bar
- [ ] Click "Select Image"
- [ ] Choose "Gallery" or "Camera"
- [ ] Select/Take tomato plant photo
- [ ] Click "Analyze Crop"
- [ ] See PlantLoader animation with "Analyzing crop..."
- [ ] Results display with:
  - Overall stage
  - Confidence score
  - Yield & earnings
  - Class breakdown
  - All detections

#### ✅ Reports Screen
- [ ] See list of previous analyses
- [ ] Tap report to expand
- [ ] See detailed breakdown
- [ ] Delete report works

#### ✅ Weather Screen
- [ ] Search for city (e.g., "London")
- [ ] Current weather displays
- [ ] 3-day forecast shows
- [ ] Crop advice appears

#### ✅ Profile Screen
- [ ] See user information
- [ ] Edit name works
- [ ] Statistics display
- [ ] Logout button works

---

## 🎨 Animation Testing

### PlantLoader Animation
**Where:** Dashboard loading, Analysis loading

**Test:**
1. Open Dashboard → Should see plant growing animation
2. Go to Analysis → Select image → Click Analyze
3. Animation should loop smoothly
4. Message "Analyzing crop..." displays below

**Expected:**
- Smooth looping animation
- No lag or stuttering
- Proper size (60-150px)

### TomatoStatus Animation (Ready to integrate)
**Where:** Class breakdown cards

**Test:**
```tsx
// Add to AnalysisScreen class cards
<TomatoStatus status="fully_ripened" size={40} />
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot connect to backend"
**Solution:**
```bash
# Android Emulator
API_URL=http://10.0.2.2:5000/api

# Physical Device
API_URL=http://YOUR_LOCAL_IP:5000/api

# Find IP: ipconfig (look for IPv4)
```

### Issue 2: "Metro bundler not starting"
**Solution:**
```bash
cd mobile
npm start --reset-cache
```

### Issue 3: "Android build failed"
**Solution:**
```bash
cd mobile/android
./gradlew clean
cd ..
npm run android
```

### Issue 4: "adb not found"
**Solution:**
- Install Android Studio
- Set ANDROID_HOME environment variable
- Add platform-tools to PATH

### Issue 5: "Animations not showing"
**Solution:**
```bash
# Check files exist
dir src\assets\lottie\*.json

# Should show 4 files:
# plant-loader.json
# red-tomato.json
# green-tomato.json
# flower.json
```

### Issue 6: "White screen on app launch"
**Solution:**
```bash
# Clear Metro cache
npm start --reset-cache

# Rebuild app
npm run android
```

---

## 🧪 Testing Without Android Setup

If you don't have Android Studio installed yet, you can:

### 1. Test Backend APIs
```bash
# Use the test scripts
cd backend
npm test

# Or manual API testing
node test-roboflow-api.js
```

### 2. Code Review
- ✅ All TypeScript errors fixed
- ✅ All components created
- ✅ Animations integrated
- ✅ Navigation configured

### 3. Install Android Studio (Recommended)
**Time required:** ~30 minutes
**Download:** https://developer.android.com/studio

---

## 📊 Performance Benchmarks

### Expected Load Times
- Login: < 1 second
- Dashboard: 2-3 seconds (with animation)
- Image Analysis: 3-5 seconds
- Weather: 1-2 seconds

### Animation Performance
- FPS: 60 (smooth)
- Size: 50-200px (optimal)
- Loop: Infinite (loading states)

---

## 🎯 Quick Test Script

```bash
# 1. Start Backend
cd backend && npm start

# 2. New terminal - Check backend
curl http://localhost:5000/api/weather/london

# 3. Start Mobile (new terminal)
cd mobile && npm start

# 4. Run Android (new terminal, after Metro ready)
cd mobile && npm run android
```

---

## 📸 What You Should See

### 1. App Launch
```
┌─────────────────┐
│   🌱 BloomIQ    │
│                 │
│  Email: ______ │
│  Pass:  ______ │
│                 │
│   [Sign In]     │
│   Register →    │
└─────────────────┘
```

### 2. Dashboard Loading
```
┌─────────────────┐
│   Dashboard     │
│                 │
│   🌱 (animated) │
│  Loading...     │
│                 │
└─────────────────┘
```

### 3. Analysis Complete
```
┌─────────────────┐
│ ✅ Complete!    │
│                 │
│ Stage: Ripened  │
│ Conf: 94.2%     │
│ Yield: 2.5 kg   │
│ Value: ₹12.50   │
│                 │
│ [View Details]  │
└─────────────────┘
```

---

## 🚀 Recommended Testing Path

**First Time Setup (30-60 mins):**
1. ✅ Install Android Studio
2. ✅ Create emulator
3. ✅ Start backend server
4. ✅ Run mobile app

**Daily Development (2 mins):**
1. Start emulator (if not running)
2. `cd backend && npm start`
3. `cd mobile && npm start`
4. Hot reload enabled - just save files!

**Quick Tests (1 min each):**
1. Login/logout
2. Take photo + analyze
3. View reports
4. Check weather

---

## 📝 Testing Checklist

Copy this to track your testing:

```
Mobile App Testing - BloomIQ

Setup:
[ ] Android Studio installed
[ ] Emulator created / Device connected
[ ] Backend server running
[ ] Mobile app builds successfully

Screens:
[ ] Login screen loads
[ ] Register screen works
[ ] Dashboard shows data + animation
[ ] Analysis camera/gallery works
[ ] Analysis results display
[ ] Reports list/expand/delete
[ ] Weather search works
[ ] Profile edit works

Animations:
[ ] PlantLoader on Dashboard
[ ] PlantLoader on Analysis
[ ] Smooth 60fps
[ ] Proper sizing

API Integration:
[ ] Login API works
[ ] Analysis API works
[ ] Reports API works
[ ] Weather API works

Navigation:
[ ] Bottom tabs work
[ ] Stack navigation works
[ ] Back button works
[ ] Deep linking (optional)

Edge Cases:
[ ] No internet handling
[ ] Invalid login
[ ] Empty states
[ ] Large images
```

---

## 🎉 Success Criteria

Your app is working when:
- ✅ No red error screens
- ✅ Animations play smoothly
- ✅ All screens navigate properly
- ✅ API calls return data
- ✅ Images can be uploaded
- ✅ Results display correctly

---

## 📞 Need Help?

**Check logs:**
```bash
# Metro logs
npm start

# Android logs
adb logcat | grep ReactNative
```

**Common commands:**
```bash
# Restart everything
npm start --reset-cache

# Rebuild app
npm run android

# Clear cache
cd android && ./gradlew clean
```

**The app is ready to test! 🚀**
Choose your testing option and follow the guide above!
