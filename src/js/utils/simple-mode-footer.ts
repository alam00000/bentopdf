import { APP_VERSION } from '../../version.js';
import { createLanguageSwitcher } from '../i18n/language-switcher.js';

// Handle simple mode adjustments for tool pages
if (__SIMPLE_MODE__) {
  const sectionsToHide = [
    'How It Works',
    'Related PDF Tools',
    'Related Tools',
    'Frequently Asked Questions',
  ];

  document.querySelectorAll('section').forEach((section) => {
    const h2 = section.querySelector('h2');
    if (h2) {
      const heading = h2.textContent?.trim() || '';
      if (sectionsToHide.some((text) => heading.includes(text))) {
        (section as HTMLElement).style.display = 'none';
      }
    }
  });

  const versionElement = document.getElementById('app-version-simple');
  if (versionElement) {
    versionElement.textContent = APP_VERSION;
  }

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
