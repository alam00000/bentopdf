import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * The native shell only ever runs inside Capacitor, so every test here pretends
 * to be an iOS/Android WebView. `@capacitor/core` reports `web` under jsdom,
 * which would make the module a no-op.
 */
const platform = { value: 'ios' as 'ios' | 'android' | 'web' };

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: () => platform.value !== 'web',
    getPlatform: () => platform.value,
    isPluginAvailable: () => false,
  },
}));

// The design layer is irrelevant to behaviour and jsdom cannot parse it.
vi.mock('@/css/native.css', () => ({}));

const setPage = (path: string, body: string): void => {
  window.history.replaceState({}, '', path);
  document.documentElement.className = '';
  document.body.innerHTML = body;
};

const NAV = `
  <nav class="site-nav">
    <div id="home-logo"></div>
    <a href="https://github.com/alam00000/bentopdf/">stars</a>
  </nav>`;

const loadShell = async () => {
  const module = await import('@/js/native/shell');
  return module.initNativeShell;
};

describe('native shell', () => {
  beforeEach(() => {
    vi.resetModules();
    platform.value = 'ios';
  });

  afterEach(() => {
    document.body.innerHTML = '';
    document.documentElement.className = '';
  });

  it('marks the platform and screen type on the root element', async () => {
    setPage('/index.html', NAV);
    (await loadShell())();

    const root = document.documentElement;
    expect(root.classList.contains('native-app')).toBe(true);
    expect(root.classList.contains('native-ios')).toBe(true);
    expect(root.classList.contains('native-screen-tab')).toBe(true);
  });

  it('strips the website chrome that the native UI replaces', async () => {
    setPage(
      '/index.html',
      `${NAV}
      <section id="hero-section"></section>
      <section id="features-section"></section>
      <div id="donation-ribbon"></div>
      <footer></footer>`
    );
    (await loadShell())();

    for (const selector of [
      'nav.site-nav',
      '#hero-section',
      '#features-section',
      '#donation-ribbon',
      'footer',
      'a[href*="github.com"]',
    ]) {
      expect(
        document.querySelector(selector)?.classList.contains('native-hidden'),
        selector
      ).toBe(true);
    }
  });

  it('gives tab screens a large title and no back button', async () => {
    setPage('/tools.html', NAV);
    (await loadShell())();

    expect(document.querySelector('.native-title-large')).not.toBeNull();
    expect(document.querySelector('.native-back')).toBeNull();
    expect(
      document
        .querySelector('.native-tab[data-tab="tools"]')
        ?.getAttribute('aria-current')
    ).toBe('page');
  });

  it('gives tool screens a back button titled from the page H1', async () => {
    setPage(
      '/merge-pdf.html',
      `${NAV}<h1 data-i18n="tools:mergePdf.name">Merge PDF</h1>`
    );
    (await loadShell())();

    expect(document.querySelector('.native-back')).not.toBeNull();
    const title = document.querySelector('.native-header-title');
    expect(title?.textContent).toBe('Merge PDF');
    // The H1's translation key is carried over so applyTranslations() picks it up.
    expect(title?.getAttribute('data-i18n')).toBe('tools:mergePdf.name');
  });

  it('renders every tab, and no tab is marked active off-tab', async () => {
    setPage('/merge-pdf.html', `${NAV}<h1>Merge PDF</h1>`);
    (await loadShell())();

    expect(document.querySelectorAll('.native-tab')).toHaveLength(4);
    expect(document.querySelector('.native-tab[aria-current]')).toBeNull();
    expect(
      document.documentElement.classList.contains('native-screen-detail')
    ).toBe(true);
  });

  it('escapes titles taken from page content', async () => {
    setPage('/rogue.html', `${NAV}<h1>&lt;img src=x onerror=alert(1)&gt;</h1>`);
    (await loadShell())();

    const header = document.querySelector('.native-header');
    expect(header?.querySelector('img')).toBeNull();
    expect(header?.textContent).toContain('<img src=x onerror=alert(1)>');
  });

  it('uses the Android class when running on Android', async () => {
    platform.value = 'android';
    setPage('/index.html', NAV);
    (await loadShell())();

    expect(document.documentElement.classList.contains('native-android')).toBe(
      true
    );
  });
});
