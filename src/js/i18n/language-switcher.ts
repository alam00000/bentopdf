import {
  supportedLanguages,
  languageNames,
  getLanguageFromUrl,
  changeLanguage,
} from './i18n';

export const createLanguageSwitcher = (): HTMLElement => {
  const currentLang = getLanguageFromUrl();

  const container = document.createElement('div');
  container.className = 'relative';
  container.id = 'language-switcher';

  const button = document.createElement('button');
  button.className = `
    inline-flex items-center gap-1.5 text-sm font-medium
    bg-gray-800 text-gray-200 border border-gray-600
    px-3 py-1.5 rounded-full transition-colors duration-200
    shadow-sm hover:shadow-md hover:bg-gray-700
  `.trim();
  button.setAttribute('aria-haspopup', 'true');
  button.setAttribute('aria-expanded', 'false');

  const textSpan = document.createElement('span');
  textSpan.className = 'font-medium';
  textSpan.textContent = languageNames[currentLang];

  const chevron = document.createElement('svg');
  chevron.className = 'w-4 h-4';
  chevron.setAttribute('fill', 'none');
  chevron.setAttribute('stroke', 'currentColor');
  chevron.setAttribute('viewBox', '0 0 24 24');
  chevron.innerHTML =
    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>';

  button.appendChild(textSpan);
  button.appendChild(chevron);

  const dropdown = document.createElement('div');
  dropdown.className = `
    hidden absolute right-0 mt-2 w-40 rounded-lg
    bg-gray-800 border border-gray-700 shadow-xl
    py-1 z-50
  `.trim();
  dropdown.setAttribute('role', 'menu');

  supportedLanguages.forEach((lang) => {
    const option = document.createElement('button');
    option.className = `
      w-full px-4 py-2 text-left text-sm text-gray-200
      hover:bg-gray-700 flex items-center gap-2
      ${lang === currentLang ? 'bg-gray-700' : ''}
    `.trim();
    option.setAttribute('role', 'menuitem');

    const name = document.createElement('span');
    name.textContent = languageNames[lang];

    option.appendChild(name);

    option.addEventListener('click', () => {
      if (lang !== currentLang) {
        changeLanguage(lang);
      }
    });

    dropdown.appendChild(option);
  });

  container.appendChild(button);
  container.appendChild(dropdown);

  button.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', (!isExpanded).toString());
    dropdown.classList.toggle('hidden');
  });

  document.addEventListener('click', () => {
    button.setAttribute('aria-expanded', 'false');
    dropdown.classList.add('hidden');
  });

  return container;
};

export const injectLanguageSwitcher = (): void => {
  const simpleModeContainer = document.getElementById(
    'simple-mode-language-switcher'
  );
  if (simpleModeContainer) {
    const switcher = createLanguageSwitcher();
    simpleModeContainer.appendChild(switcher);
    return;
  }

  const footer = document.querySelector('footer');
  if (!footer) return;

  const headings = footer.querySelectorAll('h3');
  let followUsColumn: HTMLElement | null = null;

  headings.forEach((h3) => {
    if (
      h3.textContent?.trim() === 'Follow Us' ||
      h3.textContent?.trim() === 'Folgen Sie uns' ||
      h3.textContent?.trim() === 'Theo dõi chúng tôi'
    ) {
      followUsColumn = h3.parentElement;
    }
  });

  if (followUsColumn) {
    const socialIconsContainer = followUsColumn.querySelector('.space-x-4');

    if (socialIconsContainer) {
      const wrapper = document.createElement('div');
      wrapper.className = 'inline-flex flex-col gap-4'; // gap-4 adds space between icons and switcher

      socialIconsContainer.parentNode?.insertBefore(
        wrapper,
        socialIconsContainer
      );

      wrapper.appendChild(socialIconsContainer);
      const switcher = createLanguageSwitcher();

      switcher.className = 'relative w-full';

      const button = switcher.querySelector('button');
      if (button) {
        button.className = `
                    flex items-center justify-between w-full text-sm font-medium
                    bg-gray-800 text-gray-400 border border-gray-700
                    px-3 py-2 rounded-lg transition-colors duration-200
                    hover:text-white hover:border-gray-600
                `.trim();
      }

      const dropdown = switcher.querySelector('div[role="menu"]');
      if (dropdown) {
        dropdown.classList.remove('mt-2', 'w-40');
        dropdown.classList.add('bottom-full', 'mb-2', 'w-full');
      }

      wrapper.appendChild(switcher);
    } else {
      const switcherContainer = document.createElement('div');
      switcherContainer.className = 'mt-4 w-full';
      const switcher = createLanguageSwitcher();
      switcherContainer.appendChild(switcher);
      followUsColumn.appendChild(switcherContainer);
    }
  }
};
