# RuralCare Native Android WebView App

Native Android wrapper application for the RuralCare Smart India Hackathon healthcare platform.

## Features
- **Full Hardware Accelerated WebView**: Smooth 60fps rendering of the RuralCare web client.
- **WebRTC Camera & Audio Permissions**: Video consultations in TelemedicineHub and AI visual/vocal screening.
- **Emergency SOS Dialer Integration**: Direct 1-tap dialer launch for `108` (Ambulance), `112` (National Emergency), `104` (Health Helpline), and `102`.
- **Geolocation & Mapping**: Instant GPS positioning for the Hospital & PHC locator across all 36 districts of Maharashtra.
- **Pull-To-Refresh**: Native `SwipeRefreshLayout` with brand emerald indicator.
- **Offline Mode & Caching**: Offline fallback screen with retry button; automatically leverages IndexedDB cached records when network connectivity is lost.
- **File Chooser**: Allows users and ASHA workers to capture photos or attach prescription documents directly from their mobile storage.
- **Download Manager**: Native handling of Digital Health Card PDF and prescription downloads.

## How to Build
### Android Studio
1. Open Android Studio.
2. Select **Open** and choose the `android/` directory.
3. Allow Gradle to sync dependencies.
4. Click **Run** on an Android emulator or connected device (Android 7.0+).

### Command Line
```bash
cd android
./gradlew assembleDebug
```
The compiled APK will be located at:
`android/app/build/outputs/apk/debug/app-debug.apk`
