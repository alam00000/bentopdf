import { createLanguageSwitcher } from '../i18n/language-switcher.js';

// Handle simple mode adjustments for tool pages
if (__SIMPLE_MODE__) {
  // Matched by the heading's i18n key: localized pages (/sk/, /de/, ...) are
  // translated at build time, so the English text is only there on /.
  const sectionKeysToHide = [
    'howItWorks.title',
    'relatedTools.title',
    'tools:addPageLabels.relatedToolsTitle',
    'faq.sectionTitle',
  ];
  const sectionsToHide = [
    'How It Works',
    'Related PDF Tools',
    'Related Tools',
    'Frequently Asked Questions',
  ];

  document.querySelectorAll('section').forEach((section) => {
    const h2 = section.querySelector('h2');
    if (h2) {
      const key = h2.getAttribute('data-i18n') || '';
      const heading = h2.textContent?.trim() || '';
      if (
        sectionKeysToHide.includes(key) ||
        sectionsToHide.some((text) => heading.includes(text))
      ) {
        (section as HTMLElement).style.display = 'none';
      }
    }
  });

  const langContainer = document.getElementById('simple-mode-lang-switcher');
  if (langContainer) {
    const switcher = createLanguageSwitcher();
    const dropdown = switcher.querySelector('div[role="menu"]');
    if (dropdown) {
      dropdown.classList.remove('mt-2');
      dropdown.classList.add('bottom-full', 'mb-2');
    }
    langContainer.appendChild(switcher);
  }
}
