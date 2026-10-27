import { createLanguageSwitcher } from '../i18n/language-switcher.js';
import { onPageReady } from '../i18n/i18n.js';

// Handle simple mode adjustments for tool pages
if (__SIMPLE_MODE__) {
  const sectionsToHide = [
    'How It Works',
    'Related PDF Tools',
    'Related Tools',
    'Frequently Asked Questions',
  ];

  const keysToHide = [
    'howItWorks.title',
    'relatedTools.title',
    'faq.sectionTitle',
  ];

  document.querySelectorAll('section').forEach((section) => {
    const h2 = section.querySelector('h2');
    if (h2) {
      const heading = h2.textContent?.trim() || '';
      const key = h2.getAttribute('data-i18n') || '';
      if (
        keysToHide.includes(key) ||
        sectionsToHide.some((text) => heading.includes(text))
      ) {
        (section as HTMLElement).style.display = 'none';
      }
    }
  });

  const langContainer = document.getElementById('simple-mode-lang-switcher');
  if (langContainer) {
    onPageReady(() => {
      const switcher = createLanguageSwitcher();
      const dropdown = switcher.querySelector('div[role="menu"]');
      if (dropdown) {
        dropdown.classList.remove('mt-2');
        dropdown.classList.add('bottom-full', 'mb-2');
      }
      langContainer.appendChild(switcher);
    });
  }
}
