# Tauri Desktop & Mobile Setup

This app uses Tauri to create native Windows desktop and Android mobile apps.

## Prerequisites

### For Windows Desktop

1. **Rust** - Install from [rustup.rs](https://rustup.rs/)
2. **Visual Studio Build Tools** - Install with "Desktop development with C++"
3. **WebView2** - Usually pre-installed on Windows 10/11

### For Android

1. **Android Studio** - Download from [developer.android.com](https://developer.android.com/studio)
2. **Android SDK** - Install via Android Studio SDK Manager
3. **Android NDK** - Install via Android Studio SDK Manager
4. **Java JDK 17+** - Usually bundled with Android Studio

#### Environment Variables (Windows)

Add these to your system environment variables:

```powershell
# Set ANDROID_HOME
setx ANDROID_HOME "%LOCALAPPDATA%\Android\Sdk"

# Set JAVA_HOME (adjust path to your JDK installation)
setx JAVA_HOME "C:\Program Files\Android\Android Studio\jbr"

# Add to PATH
setx PATH "%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\cmdline-tools\latest\bin"
```

#### Required Android SDK Components

Open Android Studio → SDK Manager and install:
- Android SDK Platform 34 (or latest)
- Android SDK Build-Tools 34.0.0
- NDK (Side by side) - latest version
- Android SDK Command-line Tools
- Android SDK Platform-Tools

## Commands

### Windows Desktop

```bash
# Development mode (hot reload)
npm run tauri:dev

# Build Windows installer (.exe and .msi)
npm run tauri:build
```

Build output: `src-tauri/target/release/bundle/`

### Android

```bash
# First time only: Initialize Android project
npm run android:init

# Development mode (connects to device/emulator)
npm run android:dev

# Build APK
npm run android:build
```

Build output: `src-tauri/gen/android/app/build/outputs/apk/`

## Troubleshooting

### Android "SDK not found"

Make sure `ANDROID_HOME` is set correctly:
```powershell
echo $env:ANDROID_HOME
# Should output: C:\Users\<you>\AppData\Local\Android\Sdk
```

### Android "NDK not found"

Install NDK via Android Studio SDK Manager, then set:
```powershell
setx NDK_HOME "%ANDROID_HOME%\ndk\<version>"
```

### WebView2 not found

Download from [Microsoft WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)

## App Configuration

Edit `src-tauri/tauri.conf.json` to customize:
- Window size and title
- App identifier
- Bundle icons
- Security settings
