# 📱 Building APK for BloomIQ Mobile App

## 🎯 Two Methods to Build APK

---

## **Method 1: EAS Build (Cloud Build) - Recommended ⭐**

This method builds your APK on Expo's servers. It's easier and doesn't require Android Studio.

### Step 1: Login to Expo
```powershell
cd mobile-expo
eas login
```
- If you don't have an account, create one at https://expo.dev
- Enter your email and password

### Step 2: Configure Project
```powershell
eas build:configure
```
- This will create/update your eas.json file
- When prompted, choose "Android"

### Step 3: Build APK
```powershell
eas build --platform android --profile preview
```

**What happens:**
- ✅ Code is uploaded to Expo servers
- ✅ APK is built in the cloud (~10-20 minutes)
- ✅ You get a download link when done
- ✅ QR code to install directly on device

**Build Profiles:**
- `preview` - APK for testing (recommended)
- `production` - APK for Play Store
- `development` - Development build with debugging

### Step 4: Download & Install
After build completes:
1. **Download APK** from the provided link
2. **Transfer to phone** via USB/Google Drive/Telegram
3. **Install** (enable "Install from Unknown Sources" if needed)

---

## **Method 2: Local Build with Expo (Faster for Testing)**

This creates a development build that you can test immediately.

### Option A: Export for Local APK
```powershell
cd mobile-expo
npx expo export --platform android
```
This exports the JavaScript bundle that can be used with Expo Go.

### Option B: Build with Android Studio (Advanced)
If you have Android Studio installed:

```powershell
# Generate native Android project
npx expo prebuild --platform android

# Build with Gradle
cd android
.\gradlew assembleRelease

# APK will be in: android\app\build\outputs\apk\release\app-release.apk
```

---

## 📋 Pre-Build Checklist

### 1. Update API URL for Production
Edit `mobile-expo/.env`:
```env
# Replace with your production server IP or domain
API_URL=http://YOUR_SERVER_IP:5000/api
# OR
API_URL=https://your-domain.com/api
```

### 2. Update App Icon (Optional)
Replace these files in `mobile-expo/assets/`:
- `icon.png` (1024x1024)
- `adaptive-icon.png` (1024x1024)
- `splash-icon.png` (1242x2436)

### 3. Update App Version
Edit `mobile-expo/app.json`:
```json
{
  "expo": {
    "version": "1.0.0",  // Change this for updates
    "android": {
      "versionCode": 1   // Increment this for each build
    }
  }
}
```

---

## 🚀 Quick Build Commands

### For Testing (Recommended):
```powershell
cd mobile-expo
eas build --platform android --profile preview
```

### For Production:
```powershell
cd mobile-expo
eas build --platform android --profile production
```

### Check Build Status:
```powershell
eas build:list
```

---

## 📦 What's Included in the APK

✅ All 7 screens (Login, Register, Dashboard, Analysis, Reports, Weather, Profile)
✅ Lottie animations (PlantLoader, TomatoStatus, FlowerAnimation)
✅ Camera & Gallery access
✅ Image upload & analysis
✅ Weather forecasting
✅ Report management
✅ User authentication
✅ Secure storage

---

## 🔐 Signing the APK (For Production)

### Generate Keystore:
```powershell
keytool -genkeypair -v -keystore bloomiq-release.keystore -alias bloomiq -keyalg RSA -keysize 2048 -validity 10000
```

### Update app.json:
```json
{
  "android": {
    "package": "com.bloomiq.app",
    "versionCode": 1
  }
}
```

### Configure EAS for Signing:
EAS Build will automatically handle signing for you!

---

## 📱 Installing APK on Device

### Method 1: Direct Install (USB)
1. Enable **Developer Options** on Android
2. Enable **USB Debugging**
3. Connect phone via USB
4. Run: `adb install app-release.apk`

### Method 2: Download & Install
1. Upload APK to Google Drive/Dropbox
2. Download on phone
3. Tap to install
4. Enable "Install from Unknown Sources" if prompted

### Method 3: QR Code (EAS Build)
1. After build completes, EAS shows QR code
2. Scan with camera app
3. Download and install

---

## 🐛 Troubleshooting

### Build Failed?
```powershell
# Check logs
eas build:list
# Click on build to see detailed logs
```

### Common Issues:

**1. "Package name already exists"**
- Change `android.package` in app.json
- Use unique name like: `com.yourname.bloomiq`

**2. "Keystore error"**
- Let EAS manage keystore (recommended)
- Or provide your own in eas.json

**3. "Bundle size too large"**
- Optimize images in assets/
- Remove unused dependencies

**4. "API URL not working in APK"**
- Use production server IP or domain
- Don't use `localhost` or `10.0.2.2`
- Ensure backend is accessible from internet

---

## 📊 Build Size Optimization

### Reduce APK Size:
```json
// In app.json
{
  "android": {
    "enableProguardInReleaseBuilds": true,
    "enableShrinkResourcesInReleaseBuilds": true
  }
}
```

### Optimize Images:
- Compress PNG/JPG files
- Use WebP format
- Remove unused assets

---

## 🎯 Recommended Build Flow

1. **Test with Expo Go** (already done ✅)
2. **Build Preview APK** for internal testing
3. **Test on multiple devices**
4. **Fix any issues**
5. **Build Production APK** for release

---

## 📈 Next Steps After Build

### Internal Testing:
- [ ] Install on 3-5 different Android devices
- [ ] Test all features (login, analysis, reports, weather)
- [ ] Test camera and gallery
- [ ] Test on different Android versions
- [ ] Check performance and battery usage

### Production Release:
- [ ] Create Play Store developer account
- [ ] Prepare store listing (description, screenshots)
- [ ] Upload production APK
- [ ] Submit for review

---

## 🔗 Useful Links

- **EAS Build Docs:** https://docs.expo.dev/build/introduction/
- **Android Studio:** https://developer.android.com/studio
- **Play Store Console:** https://play.google.com/console
- **Expo Dashboard:** https://expo.dev

---

## 💡 Tips

1. **Use EAS Build** - Easiest and most reliable
2. **Test Preview builds** before production
3. **Keep your API_URL updated** in .env
4. **Increment versionCode** for each build
5. **Save your keystore** securely if self-signing

---

**Ready to build!** 🚀

Run this command to start building your APK:
```powershell
cd mobile-expo
eas login
eas build --platform android --profile preview
```
