# BloomIQ Mobile App (React Native)

## Setup Instructions

### Prerequisites
- Node.js 16+
- React Native CLI
- Android Studio (for Android)
- Xcode (for iOS, macOS only)
- Java JDK 11+

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   
   Create `.env` file:
   ```env
   API_URL=http://10.0.2.2:5000/api
   ```
   
   > Note: `10.0.2.2` is the Android emulator's localhost

3. **Android Setup**
   
   Make sure Android Studio is installed with:
   - Android SDK
   - Android SDK Platform 33
   - Android Virtual Device (AVD)

4. **Run the App**
   
   ```bash
   # Start Metro bundler
   npm start
   
   # In another terminal, run Android
   npm run android
   
   # Or for iOS (macOS only)
   npm run ios
   ```

## Features

- 📸 Camera integration for crop capture
- 🎨 Native animations with React Native Reanimated
- 🔐 Secure authentication with AsyncStorage
- 📊 Beautiful UI matching web design
- ☁️ Weather insights
- 📈 Analysis reports history

## Project Structure

```
mobile/
├── src/
│   ├── screens/         # App screens
│   ├── components/      # Reusable components
│   ├── navigation/      # Navigation setup
│   ├── services/        # API calls
│   ├── context/         # Context providers
│   └── utils/           # Utility functions
├── android/             # Android native code
├── ios/                 # iOS native code (if needed)
└── App.tsx              # Entry point
```

## Building for Production

### Android APK

```bash
cd android
./gradlew assembleRelease
```

APK location: `android/app/build/outputs/apk/release/app-release.apk`

### Android Bundle (for Play Store)

```bash
cd android
./gradlew bundleRelease
```

## Common Issues

### Metro Bundler Issues
```bash
npm start -- --reset-cache
```

### Android Build Failures
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Camera Permissions
Make sure `AndroidManifest.xml` includes:
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

## Notes

- This is a basic React Native setup
- Full implementation requires additional configuration
- iOS development requires macOS and Xcode
- For complete mobile app, refer to React Native documentation

---

**For full project documentation, see main README.md**
