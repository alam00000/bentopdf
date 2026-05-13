const STORAGE_KEY = 'pb-theme';
type Theme = 'light' | 'dark';

function prefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function getTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored === 'light' || stored === 'dark') return stored;
  return prefersDark() ? 'dark' : 'light';
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(STORAGE_KEY, theme);
  updateToggleBtn(theme);
}

export function toggleTheme(): void {
  applyTheme(getTheme() === 'dark' ? 'light' : 'dark');
}

export function initTheme(): void {
  // Apply before paint to avoid flash
  applyTheme(getTheme());

  // Listen for system preference changes
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', (e) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
}

function updateToggleBtn(theme: Theme): void {
  const btn = document.getElementById('pb-theme-toggle');
  if (!btn) return;
  const sunEl = btn.querySelector('.pb-icon-sun') as HTMLElement | null;
  const moonEl = btn.querySelector('.pb-icon-moon') as HTMLElement | null;
  if (theme === 'dark') {
    sunEl?.style && (sunEl.style.display = 'flex');
    moonEl?.style && (moonEl.style.display = 'none');
    btn.title = 'Switch to light mode';
  } else {
    sunEl?.style && (sunEl.style.display = 'none');
    moonEl?.style && (moonEl.style.display = 'flex');
    btn.title = 'Switch to dark mode';
  }
}

export function mountThemeToggle(): void {
  const btn = document.getElementById('pb-theme-toggle');
  if (!btn) return;
  updateToggleBtn(getTheme());
  btn.addEventListener('click', toggleTheme);
}
