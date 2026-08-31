/**
 * Entry point for the native (Capacitor) app shell.
 *
 * This module - and everything it imports - is only pulled in by builds made
 * with `npm run native:build`, where `__NATIVE_APP__` is true. The web build
 * tree-shakes the whole thing away, so none of it ships to bentopdf.com.
 *
 * See NATIVE_APPS.md for how to build and install the apps.
 */
import '../../css/native.css';
import { isNativeApp } from './platform.js';
import { initSystemUi, hideSplash } from './system-ui.js';
import { initNativeShell } from './shell.js';
import { initNativeDownloads } from './save.js';
import { initNativeNavigation } from './navigation.js';
import { initTouchFeedback } from './feedback.js';

let started = false;

/**
 * Last line of defence: if anything upstream of us throws before the shell
 * boots, the user would be left staring at a frozen splash screen. This runs
 * as soon as the module is evaluated, independent of `initNativeApp`.
 */
if (isNativeApp()) {
  window.setTimeout((): void => void hideSplash(), 5000);
}

export const initNativeApp = async (): Promise<void> => {
  if (started || !isNativeApp()) return;
  started = true;

  try {
    // Downloads are patched first: a tool can finish before the chrome is up.
    initNativeDownloads();
    initNativeShell();
    initTouchFeedback();

    await Promise.all([initSystemUi(), initNativeNavigation()]);
  } catch (error) {
    console.error('[native] Shell failed to initialise', error);
  } finally {
    // Whatever happened above, never leave the user staring at the splash.
    await hideSplash();
  }
};
