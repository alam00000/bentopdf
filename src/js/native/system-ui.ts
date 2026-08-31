/**
 * System chrome: status bar, splash screen, keyboard and viewport.
 *
 * The goal is an app that looks like it belongs on the OS - edge-to-edge on
 * iOS with real safe-area insets, and a properly tinted status bar on Android.
 */
import { hasPlugin, isAndroid, isIOS } from './platform.js';

const APP_BACKGROUND = '#0B0F17';

/**
 * `viewport-fit=cover` is what makes `env(safe-area-inset-*)` report real
 * values on iOS. The pages ship a plain viewport tag for the web, so we widen
 * it here rather than editing 100+ HTML files.
 */
const applyViewport = (): void => {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
  if (!meta) return;
  if (meta.content.includes('viewport-fit')) return;
  meta.content = `${meta.content}, viewport-fit=cover`;
};

const applyStatusBar = async (): Promise<void> => {
  if (!hasPlugin('StatusBar')) return;
  const { StatusBar, Style } = await import('@capacitor/status-bar');

  // `Style.Dark` means "dark UI behind the status bar", i.e. light content.
  await StatusBar.setStyle({ style: Style.Dark }).catch(() => {});

  if (isAndroid()) {
    await StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});
    await StatusBar.setBackgroundColor({ color: APP_BACKGROUND }).catch(
      () => {}
    );
  }
};

/**
 * Toggles `.native-keyboard-open` on <html> so the bottom tab bar can get out
 * of the way while the user is typing - the behaviour every native app has.
 */
const applyKeyboard = async (): Promise<void> => {
  if (!hasPlugin('Keyboard')) return;
  const { Keyboard } = await import('@capacitor/keyboard');

  if (isIOS()) {
    await Keyboard.setAccessoryBarVisible({ isVisible: false }).catch(() => {});
  }

  const root = document.documentElement;
  Keyboard.addListener('keyboardWillShow', (info) => {
    root.style.setProperty(
      '--native-keyboard-height',
      `${info.keyboardHeight}px`
    );
    root.classList.add('native-keyboard-open');
  }).catch(() => {});

  Keyboard.addListener('keyboardWillHide', () => {
    root.style.setProperty('--native-keyboard-height', '0px');
    root.classList.remove('native-keyboard-open');
  }).catch(() => {});
};

/**
 * The splash stays up until the first screen has actually been styled
 * (see `capacitor.config.ts` - `launchAutoHide: false`), which removes the
 * unstyled flash that gives away a web view.
 */
export const hideSplash = async (): Promise<void> => {
  if (!hasPlugin('SplashScreen')) return;
  const { SplashScreen } = await import('@capacitor/splash-screen');
  await SplashScreen.hide({ fadeOutDuration: 200 }).catch(() => {});
};

export const initSystemUi = async (): Promise<void> => {
  applyViewport();
  await Promise.all([applyStatusBar(), applyKeyboard()]);
};
