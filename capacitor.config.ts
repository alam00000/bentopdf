import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor configuration for the personal-use BentoPDF native apps.
 *
 * These builds are intended for sideloading onto your own devices - they are
 * not configured for, or intended for, App Store / Play Store distribution.
 * See NATIVE_APPS.md for the build and install walkthrough.
 */
const config: CapacitorConfig = {
  appId: 'com.bentopdf.personal',
  appName: 'BentoPDF',
  webDir: 'dist',

  // The app is fully offline: everything is bundled and served from the
  // WebView's own local origin. No remote server, no live reload in release.
  server: {
    androidScheme: 'https',
    iosScheme: 'capacitor',
    hostname: 'localhost',
  },

  android: {
    // Keep the WebView background matching the app shell so there is no
    // white flash between the splash screen and first paint.
    backgroundColor: '#0B0F17',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },

  ios: {
    backgroundColor: '#0B0F17',
    // Let our own CSS handle the safe areas so we can draw edge-to-edge.
    contentInset: 'never',
    scrollEnabled: true,
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 600,
      launchAutoHide: false, // hidden by the app once the first screen is ready
      backgroundColor: '#0B0F17',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: false,
    },
    StatusBar: {
      // Android lays the WebView out *below* the status bar and paints it with
      // the app-bar colour, which is what a native Android app does and avoids
      // relying on safe-area insets the Android WebView reports inconsistently.
      // iOS always draws edge-to-edge and gets real env(safe-area-inset-*).
      overlaysWebView: false,
      style: 'DARK', // dark UI chrome => light (white) status bar content
      backgroundColor: '#0B0F17',
    },
    Keyboard: {
      resize: 'native',
      resizeOnFullScreen: true,
      style: 'DARK',
    },
  },
};

export default config;
