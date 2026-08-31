/**
 * Navigation behaviour that a native app is expected to have: a working
 * hardware back button on Android, and internal links that actually resolve
 * without a web server in front of them.
 */
import { hasPlugin, isAndroid } from './platform.js';
import { showToast } from './toast.js';
import { HOME_PAGE, currentPage } from './routes.js';

/**
 * Modal-ish overlays the app opens without touching history. Back should close
 * the top one before it navigates anywhere, which is what users expect.
 */
const OVERLAY_IDS = [
  'shortcuts-modal',
  'preview-modal',
  'password-modal',
  'alert-modal',
];

const closeTopOverlay = (): boolean => {
  for (const id of OVERLAY_IDS) {
    const overlay = document.getElementById(id);
    if (!overlay || overlay.classList.contains('hidden')) continue;
    overlay.classList.add('hidden');
    return true;
  }

  const nativeSheet = document.querySelector('.native-sheet.is-open');
  if (nativeSheet) {
    nativeSheet.classList.remove('is-open');
    return true;
  }

  return false;
};

/**
 * The site links to `/merge-pdf` and relies on a server rewrite to `.html`.
 * The build rewrites the static markup (see `nativeLinkRewritePlugin`), but
 * links rendered at runtime still need this safety net.
 */
const initLinkResolution = (): void => {
  document.addEventListener(
    'click',
    (event) => {
      if (event.defaultPrevented || event.button !== 0) return;
      const anchor = (event.target as Element | null)?.closest?.(
        'a[href]'
      ) as HTMLAnchorElement | null;
      if (!anchor || anchor.hasAttribute('download') || anchor.target) return;

      const href = anchor.getAttribute('href') || '';
      if (!href.startsWith('/') || href.startsWith('//')) return;

      const [path, rest] = href.split(/(?=[?#])/, 2) as [string, string?];
      // Only bare, extensionless page paths - never assets or deep paths.
      if (!/^\/[a-z0-9-]+$/i.test(path)) return;

      event.preventDefault();
      window.location.href = `${path}.html${rest ?? ''}`;
    },
    true
  );
};

const initHardwareBack = async (): Promise<void> => {
  if (!isAndroid() || !hasPlugin('App')) return;
  const { App } = await import('@capacitor/app');

  let exitArmedUntil = 0;

  App.addListener('backButton', ({ canGoBack }) => {
    if (closeTopOverlay()) return;

    if (canGoBack && window.history.length > 1) {
      window.history.back();
      return;
    }

    if (currentPage() !== HOME_PAGE) {
      window.location.href = `/${HOME_PAGE}`;
      return;
    }

    // On the home screen, require a deliberate double-press to quit.
    if (Date.now() < exitArmedUntil) {
      void App.exitApp();
      return;
    }
    exitArmedUntil = Date.now() + 2000;
    showToast('Press back again to exit');
  }).catch(() => {});
};

export const initNativeNavigation = async (): Promise<void> => {
  initLinkResolution();
  await initHardwareBack();
};
