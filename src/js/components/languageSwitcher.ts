import { changeLanguage, getCurrentLanguage } from '../i18n';
import { createIcons, icons } from 'lucide';

/**
 * Helper function to create icons that works with both CDN and npm package
 */
function renderIcons(): void {
  // Try using the imported createIcons first (npm package)
  try {
    if (typeof createIcons === 'function') {
      createIcons({ icons });
      console.log('npm createIcons() called');
      return;
    }
  } catch (e) {
    console.log('npm createIcons not available:', e);
  }
  
  // For CDN version, wait for it to be available
  const waitForLucide = (attempts = 0) => {
    if (typeof (window as any).lucide !== 'undefined' && typeof (window as any).lucide.createIcons === 'function') {
      (window as any).lucide.createIcons();
      console.log('CDN lucide.createIcons() called');
    } else if (attempts < 20) { // Try for up to 1 second
      setTimeout(() => waitForLucide(attempts + 1), 50);
    } else {
      console.warn('Lucide CDN not loaded after 1 second');
    }
  };
  
  waitForLucide();
}

/**
 * Language switcher component configuration
 */
interface LanguageOption {
  code: string;
  label: string;
  displayCode: string;
}

/**
 * Callback function to be called after language change
 */
type LanguageChangeCallback = (lang: string) => void | Promise<void>;

let onLanguageChangeCallback: LanguageChangeCallback | null = null;
let dropdownInitialized = false;
let clickOutsideListenerAdded = false;

const languages: LanguageOption[] = [
  { code: 'en', label: 'English', displayCode: 'EN' },
  { code: 'nb', label: 'Norsk', displayCode: 'NB' }
];

/**
 * Register a callback to be called after language changes
 * @param callback - Function to call after language change
 */
export function onLanguageChange(callback: LanguageChangeCallback): void {
  onLanguageChangeCallback = callback;
}

/**
 * Creates and returns the HTML for the desktop language switcher
 */
function getDesktopLanguageSwitcherHTML(): string {
  const currentLang = getCurrentLanguage();
  const languageOption = languages.find(lang => lang.code === currentLang);
  const displayCode = languageOption ? languageOption.displayCode : 'EN';
  
  return `
    <div class="relative language-selector">
      <button
        id="language-button"
        class="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-md hover:bg-gray-700"
        aria-label="Select Language"
      >
        <i data-lucide="globe" class="w-4 h-4"></i>
        <span id="current-language">${displayCode}</span>
        <i data-lucide="chevron-down" class="w-4 h-4"></i>
      </button>
      <div
        id="language-dropdown"
        class="hidden absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50"
      >
        <div class="py-1" role="menu" aria-orientation="vertical">
          ${languages.map(lang => `
            <button
              class="language-option block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
              data-lang="${lang.code}"
              role="menuitem"
            >
              ${lang.label}
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

/**
 * Creates and returns the HTML for the mobile language switcher
 */
function getMobileLanguageSwitcherHTML(): string {
  return `
    <div class="pt-4 pb-2 border-t border-gray-700">
      <div class="flex items-center justify-center space-x-4">
        ${languages.map(lang => `
          <button
            class="language-option flex items-center space-x-2 px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            data-lang="${lang.code}"
          >
            <i data-lucide="globe" class="w-4 h-4"></i>
            <span>${lang.label}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Initializes the language switcher dropdown behavior
 */
function initializeDropdown(): void {
  if (dropdownInitialized) {
    return; // Already initialized
  }
  
  const languageButton = document.getElementById('language-button');
  const languageDropdown = document.getElementById('language-dropdown');

  if (!languageButton || !languageDropdown) {
    console.warn('Language button or dropdown not found');
    return;
  }

  // Toggle dropdown on button click
  languageButton.addEventListener('click', (e) => {
    e.stopPropagation();
    languageDropdown.classList.toggle('hidden');
  });

  // Close dropdown when clicking outside (only add once)
  if (!clickOutsideListenerAdded) {
    document.addEventListener('click', (e) => {
      const target = e.target as Node;
      if (languageButton && languageDropdown && 
          !languageButton.contains(target) && 
          !languageDropdown.contains(target)) {
        languageDropdown.classList.add('hidden');
      }
    });
    clickOutsideListenerAdded = true;
  }
  
  dropdownInitialized = true;
  console.log('Dropdown initialized');
}

/**
 * Updates the current language display
 */
function updateLanguageDisplay(): void {
  const currentLang = getCurrentLanguage();
  const languageOption = languages.find(lang => lang.code === currentLang);
  
  console.log('Updating language display:', currentLang, languageOption);
  
  if (languageOption) {
    const currentLanguageSpan = document.getElementById('current-language');
    if (currentLanguageSpan) {
      currentLanguageSpan.textContent = languageOption.displayCode;
      console.log('Language display updated to:', languageOption.displayCode);
    } else {
      console.warn('current-language span not found');
    }
  }
}

/**
 * Initializes language option click handlers
 */
function initializeLanguageOptions(): void {
  const languageOptions = document.querySelectorAll('.language-option');
  
  console.log('Initializing language options, found:', languageOptions.length);
  
  languageOptions.forEach(option => {
    // Check if already initialized
    if (option.hasAttribute('data-initialized')) {
      return;
    }
    
    // Mark as initialized
    option.setAttribute('data-initialized', 'true');
    
    option.addEventListener('click', async (e) => {
      const target = e.currentTarget as HTMLElement;
      const lang = target.getAttribute('data-lang');
      
      console.log('Language option clicked:', lang);
      
      if (lang) {
        await changeLanguage(lang);
        updateLanguageDisplay();
        
        // Close dropdown if it exists
        const dropdown = document.getElementById('language-dropdown');
        if (dropdown) {
          dropdown.classList.add('hidden');
        }
        
        // Call registered callback if exists
        if (onLanguageChangeCallback) {
          await onLanguageChangeCallback(lang);
        }
        
        // Re-render icons after language change
        renderIcons();
      }
    });
  });
}

/**
 * Injects the desktop language switcher into the navigation
 * @param targetSelector - CSS selector for where to inject the switcher
 */
export function injectDesktopLanguageSwitcher(targetSelector: string = '.hidden.md\\:flex.items-center.space-x-8'): void {
  const desktopNav = document.querySelector(targetSelector);
  
  if (desktopNav) {
    const switcherHTML = getDesktopLanguageSwitcherHTML();
    desktopNav.insertAdjacentHTML('beforeend', switcherHTML);
    
    console.log('Desktop language switcher injected');
    
    // Use setTimeout to ensure DOM is updated before manipulating it
    setTimeout(() => {
      console.log('Desktop switcher initialization starting');
      
      // Initialize language option handlers first
      initializeLanguageOptions();
      
      // Initialize dropdown behavior
      initializeDropdown();
      
      // Re-render icons for the newly added elements
      renderIcons();
      
      // Update display to show current language
      updateLanguageDisplay();
      
      console.log('Desktop switcher initialization complete');
    }, 50); // Increased timeout for CDN script loading
  }
}

/**
 * Injects the mobile language switcher into the mobile menu
 * @param targetSelector - CSS selector for where to inject the switcher (should be the mobile menu container)
 */
export function injectMobileLanguageSwitcher(targetSelector: string = '#mobile-menu .px-2'): void {
  const mobileMenuContainer = document.querySelector(targetSelector);
  
  if (mobileMenuContainer) {
    const switcherHTML = getMobileLanguageSwitcherHTML();
    mobileMenuContainer.insertAdjacentHTML('beforeend', switcherHTML);
    
    console.log('Mobile language switcher injected');
    
    // Use setTimeout to ensure DOM is updated before manipulating it
    setTimeout(() => {
      console.log('Mobile switcher initialization starting');
      
      // Initialize language option handlers (will apply to both desktop and mobile)
      initializeLanguageOptions();
      
      // Re-render icons for the newly added elements
      renderIcons();
      
      console.log('Mobile switcher initialization complete');
    }, 50); // Increased timeout for CDN script loading
  }
}

/**
 * Initializes both desktop and mobile language switchers
 * This is the main function to call from your page scripts
 */
export function initializeLanguageSwitcher(): void {
  // Check if we're in simple mode (look for simple mode container)
  const simpleModeContainer = document.getElementById('simple-mode-language-switcher');
  
  if (simpleModeContainer) {
    // Inject into simple mode nav
    injectDesktopLanguageSwitcher('#simple-mode-language-switcher');
  } else {
    // Inject desktop switcher into normal nav
    injectDesktopLanguageSwitcher();
    
    // Inject mobile switcher
    injectMobileLanguageSwitcher();
  }
  
  console.log('Language switcher initialized');
}

/**
 * Re-initializes the language switcher after DOM changes
 * Useful if navigation is dynamically rebuilt
 */
export function reinitializeLanguageSwitcher(): void {
  // Remove existing switchers
  document.querySelectorAll('.language-selector').forEach(el => el.remove());
  document.querySelectorAll('.language-option').forEach(el => {
    if (el.closest('.border-t.border-gray-700')) {
      el.closest('.border-t.border-gray-700')?.remove();
    }
  });
  
  // Reinitialize
  initializeLanguageSwitcher();
}
