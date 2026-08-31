/**
 * Platform detection for the native (Capacitor) shell.
 *
 * Everything in `src/js/native/` is only ever loaded from a build made with
 * `npm run native:build`, but these helpers stay defensive so the module is
 * safe to import from a browser tab during development too.
 */
import { Capacitor } from '@capacitor/core';

export type NativePlatform = 'ios' | 'android';

/** True when running inside the Android/iOS app shell (not a browser tab). */
export const isNativeApp = (): boolean => {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
};

/** `'ios'` or `'android'` inside the app, `null` in a browser. */
export const nativePlatform = (): NativePlatform | null => {
  try {
    const platform = Capacitor.getPlatform();
    return platform === 'ios' || platform === 'android' ? platform : null;
  } catch {
    return null;
  }
};

export const isIOS = (): boolean => nativePlatform() === 'ios';
export const isAndroid = (): boolean => nativePlatform() === 'android';

/**
 * Plugins are bundled, but a device can still be running an app build that
 * predates a newly added plugin. Every call site goes through this so a
 * missing plugin degrades to "feature off" instead of a white screen.
 */
export const hasPlugin = (name: string): boolean => {
  try {
    return Capacitor.isPluginAvailable(name);
  } catch {
    return false;
  }
};
