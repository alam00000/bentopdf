/**
 * A minimal, platform-shaped toast. Deliberately hand-rolled rather than
 * pulling in @capacitor/toast: the native toasts look different on each OS and
 * we want one calm, consistent confirmation that matches the app's design.
 */
let host: HTMLDivElement | null = null;
let hideTimer: number | undefined;

const ensureHost = (): HTMLDivElement => {
  if (host?.isConnected) return host;
  host = document.createElement('div');
  host.className = 'native-toast';
  host.setAttribute('role', 'status');
  host.setAttribute('aria-live', 'polite');
  document.body.appendChild(host);
  return host;
};

export const showToast = (message: string, duration = 2600): void => {
  const element = ensureHost();
  element.textContent = message;

  // restart the animation even if a toast is already on screen
  element.classList.remove('is-visible');
  void element.offsetWidth;
  element.classList.add('is-visible');

  window.clearTimeout(hideTimer);
  hideTimer = window.setTimeout(() => {
    element.classList.remove('is-visible');
  }, duration);
};
