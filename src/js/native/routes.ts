/**
 * The app's navigation model.
 *
 * The web build is a 100+ page multi-page site with a marketing-shaped
 * information architecture. A native app needs a small, fixed set of
 * destinations, so we map the useful pages onto four tabs and treat
 * everything else as a pushed detail screen.
 */
export const HOME_PAGE = 'index.html';

export interface NativeTab {
  id: string;
  label: string;
  /** Page filename, or `null` for a tab that opens an in-app sheet. */
  page: string | null;
  /** Inline SVG path data, drawn at a 24x24 viewBox. */
  icon: string;
}

export const TABS: NativeTab[] = [
  {
    id: 'home',
    label: 'Home',
    page: 'index.html',
    icon: 'M3 10.2 12 3.5l9 6.7V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  },
  {
    id: 'tools',
    label: 'Tools',
    page: 'tools.html',
    icon: 'M4 4h7v7H4zm9 0h7v7h-7zM4 13h7v7H4zm9 0h7v7h-7z',
  },
  {
    id: 'editor',
    label: 'Editor',
    page: 'edit-pdf.html',
    icon: 'M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3zM14.5 6.5l3 3',
  },
  {
    id: 'more',
    label: 'More',
    page: null,
    icon: 'M5 12h.01M12 12h.01M19 12h.01',
  },
];

/** Links shown in the "More" sheet - the pages that do not deserve a tab. */
export const MORE_LINKS: Array<{ label: string; page: string }> = [
  { label: 'About BentoPDF', page: 'about.html' },
  { label: 'FAQ', page: 'faq.html' },
  { label: 'Privacy', page: 'privacy.html' },
  { label: 'Terms', page: 'terms.html' },
  { label: 'Licensing', page: 'licensing.html' },
];

/** Filename of the page currently being displayed, e.g. `merge-pdf.html`. */
export const currentPage = (): string => {
  const last = window.location.pathname.split('/').pop();
  return !last || last === '' ? HOME_PAGE : last;
};

export const isTabPage = (): boolean =>
  TABS.some((tab) => tab.page && tab.page === currentPage());

export const activeTabId = (): string | null =>
  TABS.find((tab) => tab.page === currentPage())?.id ?? null;
