const THEME_STORAGE_KEY = 'pixelpdf-theme';

function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Theme is optional; storage may be unavailable in private contexts.
  }
  document
    .getElementById('theme-toggle')
    ?.setAttribute('aria-pressed', String(theme === 'dark'));
}

function initializeTheme() {
  let initialTheme: 'light' | 'dark' = 'light';
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') {
      initialTheme = stored;
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      initialTheme = 'dark';
    }
  } catch {
    // Keep the light default if storage is unavailable.
  }
  document.documentElement.dataset.theme = initialTheme;
  document
    .getElementById('theme-toggle')
    ?.setAttribute('aria-pressed', String(initialTheme === 'dark'));
}

function initializeMenusAndTheme() {
  initializeTheme();

  const themeToggle = document.getElementById('theme-toggle');
  themeToggle?.addEventListener('click', () => {
    applyTheme(
      document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
    );
  });

  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIcon = document.getElementById('menu-icon');
  const closeIcon = document.getElementById('close-icon');

  if (mobileMenuButton && mobileMenu) {
    const closeMenu = (restoreFocus = false) => {
      mobileMenu.classList.add('hidden');
      menuIcon?.classList.remove('hidden');
      closeIcon?.classList.add('hidden');
      mobileMenuButton.setAttribute('aria-expanded', 'false');
      if (restoreFocus) mobileMenuButton.focus();
    };

    const openMenu = () => {
      mobileMenu.classList.remove('hidden');
      menuIcon?.classList.add('hidden');
      closeIcon?.classList.remove('hidden');
      mobileMenuButton.setAttribute('aria-expanded', 'true');
      mobileMenu.querySelector<HTMLElement>('a, button')?.focus();
    };

    mobileMenuButton.addEventListener('click', (event) => {
      event.stopPropagation();
      const isExpanded =
        mobileMenuButton.getAttribute('aria-expanded') === 'true';
      if (isExpanded) closeMenu();
      else openMenu();
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => closeMenu());
    });

    document.addEventListener('click', (event) => {
      const target = event.target as Node;
      if (
        !mobileMenu.contains(target) &&
        !mobileMenuButton.contains(target) &&
        !mobileMenu.classList.contains('hidden')
      ) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
        closeMenu(true);
      }
    });
  }

  const mobileProductsButton = document.getElementById(
    'mobile-products-button'
  );
  const mobileProductsMenu = document.getElementById('mobile-products-menu');

  if (mobileProductsButton && mobileProductsMenu) {
    mobileProductsButton.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen =
        mobileProductsButton.getAttribute('aria-expanded') === 'true';
      mobileProductsMenu.hidden = isOpen;
      mobileProductsButton.setAttribute('aria-expanded', (!isOpen).toString());
    });
  }

  const productsButton = document.getElementById('products-menu-button');
  const productsMenu = document.getElementById('products-menu');

  if (productsButton && productsMenu) {
    const closeProducts = () => {
      productsMenu.hidden = true;
      productsButton.setAttribute('aria-expanded', 'false');
    };

    productsButton.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = productsButton.getAttribute('aria-expanded') === 'true';
      productsMenu.hidden = isOpen;
      productsButton.setAttribute('aria-expanded', (!isOpen).toString());
    });

    document.addEventListener('click', (event) => {
      const target = event.target as Node;
      if (!productsMenu.contains(target) && !productsButton.contains(target)) {
        closeProducts();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !productsMenu.hidden) {
        closeProducts();
        productsButton.focus();
      }
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeMenusAndTheme, {
    once: true,
  });
} else {
  initializeMenusAndTheme();
}
