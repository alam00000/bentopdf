/**
 * Turns each web page into a native screen.
 *
 * Two jobs: strip the chrome that only makes sense on a website (site nav,
 * marketing hero, footer, donation ribbon, GitHub links), and put a real
 * native header and tab bar in its place. Everything is injected at runtime so
 * the 100+ shared HTML pages stay untouched and the web build is unaffected.
 */
import {
  HOME_PAGE,
  MORE_LINKS,
  TABS,
  activeTabId,
  currentPage,
  isTabPage,
} from './routes.js';
import { nativePlatform } from './platform.js';
import { tapFeedback } from './feedback.js';
import { escapeHtml } from '../utils/helpers.js';

/** Category landing pages whose long SEO intro has no place in the app. */
const HUB_PAGES = new Set([
  'pdf-converter.html',
  'pdf-editor.html',
  'pdf-security.html',
  'pdf-merge-split.html',
]);

const APP_NAME = 'BentoPDF';

const hide = (element: Element | null | undefined): void => {
  if (element instanceof HTMLElement) element.classList.add('native-hidden');
};

const svgIcon = (path: string, extraClass = ''): string =>
  `<svg class="native-icon ${extraClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${path}"/></svg>`;

/**
 * Removes the website furniture. Everything here is web-only: it either
 * duplicates native chrome we are about to add, or it is marketing copy.
 */
const stripWebChrome = (): void => {
  hide(document.getElementById('home-logo')?.closest('nav'));
  hide(document.querySelector('body > footer'));
  hide(document.getElementById('donation-ribbon'));
  hide(document.getElementById('scroll-to-top-btn'));

  // The site's own "back to tools" affordances - the native header owns this.
  hide(document.getElementById('back-to-tools'));
  hide(document.getElementById('back-to-grid'));

  // Star counts and repo links belong on a website, not in an installed app.
  for (const link of document.querySelectorAll('a[href*="github.com"]')) {
    hide(link);
  }

  if (currentPage() === HOME_PAGE) {
    for (const id of [
      'hero-section',
      'features-section',
      'security-compliance-section',
      'faq-accordion',
      'testimonials-section',
      'tools-header',
    ]) {
      hide(document.getElementById(id));
    }
  }

  if (HUB_PAGES.has(currentPage())) {
    // First section on a hub page is the SEO hero; the grid follows it.
    hide(document.querySelector('body > section'));
  }
};

interface ScreenTitle {
  text: string;
  /**
   * The page H1's own translation key, when it has one. Copying it onto the
   * header means `applyTranslations()` translates our title for free, exactly
   * like every other string in the app.
   */
  i18nKey: string | null;
}

/** The screen title, preferring the page's own H1 over the SEO <title>. */
const screenTitle = (): ScreenTitle => {
  if (currentPage() === HOME_PAGE) return { text: APP_NAME, i18nKey: null };

  const heading = Array.from(document.querySelectorAll('h1')).find(
    (h) => !h.closest('.native-hidden') && h.textContent?.trim()
  );
  if (heading?.textContent) {
    return {
      text: heading.textContent.trim().split(/\s+[-|]\s+/)[0],
      i18nKey: heading.getAttribute('data-i18n'),
    };
  }

  return {
    text: document.title.split(/\s*[|]\s*/)[0].trim() || APP_NAME,
    i18nKey: null,
  };
};

const navigateTo = (page: string): void => {
  window.location.href = `/${page}`;
};

const buildHeader = (): HTMLElement => {
  const header = document.createElement('header');
  header.className = 'native-header';

  const { text, i18nKey } = screenTitle();
  const title = escapeHtml(text);
  const i18nAttr = i18nKey ? ` data-i18n="${escapeHtml(i18nKey)}"` : '';
  const onTab = isTabPage();

  if (onTab) {
    header.innerHTML = `
      <div class="native-header-bar">
        <span class="native-header-title-compact"${i18nAttr}>${title}</span>
      </div>
      <div class="native-header-large">
        <h1 class="native-title-large"${i18nAttr}>${title}</h1>
      </div>`;
  } else {
    header.innerHTML = `
      <div class="native-header-bar">
        <button type="button" class="native-back" aria-label="Back">
          ${svgIcon('M15 19l-7-7 7-7')}
          <span class="native-back-label" data-i18n="tools.back">Back</span>
        </button>
        <span class="native-header-title"${i18nAttr}>${title}</span>
        <span class="native-header-spacer" aria-hidden="true"></span>
      </div>`;

    header.querySelector('.native-back')?.addEventListener('click', () => {
      tapFeedback();
      if (window.history.length > 1) window.history.back();
      else navigateTo(HOME_PAGE);
    });
  }

  return header;
};

const buildTabBar = (openMore: () => void): HTMLElement => {
  const bar = document.createElement('nav');
  bar.className = 'native-tabbar';
  bar.setAttribute('aria-label', 'Main');

  const active = activeTabId();

  for (const tab of TABS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'native-tab';
    button.dataset.tab = tab.id;
    if (tab.id === active) button.setAttribute('aria-current', 'page');
    button.innerHTML = `${svgIcon(tab.icon)}<span class="native-tab-label">${escapeHtml(tab.label)}</span>`;

    button.addEventListener('click', () => {
      tapFeedback();
      if (tab.page === null) openMore();
      else if (tab.id !== active) navigateTo(tab.page);
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    bar.appendChild(button);
  }

  return bar;
};

const buildMoreSheet = (): { element: HTMLElement; open: () => void } => {
  const sheet = document.createElement('div');
  sheet.className = 'native-sheet';
  sheet.innerHTML = `
    <div class="native-sheet-scrim"></div>
    <div class="native-sheet-panel" role="dialog" aria-modal="true" aria-label="More">
      <div class="native-sheet-grabber" aria-hidden="true"></div>
      <ul class="native-list">
        ${MORE_LINKS.map(
          (link) =>
            `<li><button type="button" class="native-list-row" data-page="${escapeHtml(link.page)}">
              <span>${escapeHtml(link.label)}</span>
              ${svgIcon('M9 5l7 7-7 7', 'native-list-chevron')}
            </button></li>`
        ).join('')}
      </ul>
      <p class="native-sheet-footnote">
        ${APP_NAME} runs entirely on this device. Files never leave it.
      </p>
    </div>`;

  const close = (): void => sheet.classList.remove('is-open');

  sheet.querySelector('.native-sheet-scrim')?.addEventListener('click', close);
  for (const row of sheet.querySelectorAll<HTMLElement>('.native-list-row')) {
    row.addEventListener('click', () => {
      tapFeedback();
      const page = row.dataset.page;
      if (page) navigateTo(page);
    });
  }

  return {
    element: sheet,
    open: () => sheet.classList.add('is-open'),
  };
};

/**
 * iOS collapses a large title into the compact bar as you scroll. Android's
 * top app bar just gains a hairline. One flag drives both in CSS.
 */
const trackScroll = (header: HTMLElement): void => {
  let ticking = false;
  const update = (): void => {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
    ticking = false;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    },
    { passive: true }
  );
  update();
};

export const initNativeShell = (): void => {
  const root = document.documentElement;
  root.classList.add('native-app');
  const platform = nativePlatform();
  if (platform) root.classList.add(`native-${platform}`);
  root.classList.add(
    isTabPage() ? 'native-screen-tab' : 'native-screen-detail'
  );

  stripWebChrome();

  const header = buildHeader();
  const more = buildMoreSheet();
  const tabBar = buildTabBar(more.open);

  document.body.prepend(header);
  document.body.append(tabBar, more.element);

  trackScroll(header);
};
