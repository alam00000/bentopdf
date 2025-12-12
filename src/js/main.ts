import { categories } from './config/tools.js';
import { dom, switchView, hideAlert, showLoader, hideLoader, showAlert } from './ui.js';
import { state, resetState } from './state.js';
import { ShortcutsManager } from './logic/shortcuts.js';
import { createIcons, icons } from 'lucide';
import * as pdfjsLib from 'pdfjs-dist';
import '../css/styles.css';
import { formatShortcutDisplay, formatStars } from './utils/helpers.js';
import { APP_VERSION, injectVersion } from '../version.js';
import { initI18n, applyTranslations, rewriteLinks, injectLanguageSwitcher, t } from './i18n/index.js';

const init = async () => {
  await initI18n();
  injectLanguageSwitcher();
  applyTranslations();

  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
  if (__SIMPLE_MODE__) {
    const hideBrandingSections = () => {
      // Hide navigation but keep logo
      const nav = document.querySelector('nav');
      if (nav) {
        // Hide the entire nav but we'll create a minimal one with just logo
        nav.style.display = 'none';

        // Create a simple nav with just logo on the right
        const simpleNav = document.createElement('nav');
        simpleNav.className =
          'bg-gray-800 border-b border-gray-700 sticky top-0 z-30';
        simpleNav.innerHTML = `
          <div class="container mx-auto px-4">
            <div class="flex justify-start items-center h-16">
              <div class="flex-shrink-0 flex items-center cursor-pointer" id="home-logo">
                <img src="images/favicon.svg" alt="Bento PDF Logo" class="h-8 w-8">
                <span class="text-white font-bold text-xl ml-2">
                  <a href="index.html">BentoPDF</a>
                </span>
              </div>
            </div>
          </div>
        `;
        document.body.insertBefore(simpleNav, document.body.firstChild);
      }

      const heroSection = document.getElementById('hero-section');
      if (heroSection) {
        heroSection.style.display = 'none';
      }

      const githubLink = document.querySelector('a[href*="github.com/alam00000/bentopdf"]');
      if (githubLink) {
        (githubLink as HTMLElement).style.display = 'none';
      }

      const featuresSection = document.getElementById('features-section');
      if (featuresSection) {
        featuresSection.style.display = 'none';
      }

      const securitySection = document.getElementById(
        'security-compliance-section'
      );
      if (securitySection) {
        securitySection.style.display = 'none';
      }

      const faqSection = document.getElementById('faq-accordion');
      if (faqSection) {
        faqSection.style.display = 'none';
      }

      const testimonialsSection = document.getElementById(
        'testimonials-section'
      );
      if (testimonialsSection) {
        testimonialsSection.style.display = 'none';
      }

      const supportSection = document.getElementById('support-section');
      if (supportSection) {
        supportSection.style.display = 'none';
      }

      // Hide "Used by companies" section
      const usedBySection = document.querySelector('.hide-section') as HTMLElement;
      if (usedBySection) {
        usedBySection.style.display = 'none';
      }

      // Hide footer but keep copyright
      const footer = document.querySelector('footer');
      if (footer) {
        footer.style.display = 'none';

        const simpleFooter = document.createElement('footer');
        simpleFooter.className = 'mt-16 border-t-2 border-gray-700 py-8';
        simpleFooter.innerHTML = `
          <div class="container mx-auto px-4">
            <div class="flex items-center mb-4">
              <img src="images/favicon.svg" alt="Bento PDF Logo" class="h-8 w-8 mr-2">
              <span class="text-white font-bold text-lg">BentoPDF</span>
            </div>
            <p class="text-gray-400 text-sm">
              &copy; 2025 BentoPDF. All rights reserved.
            </p>
            <p class="text-gray-500 text-xs mt-2">
              Version <span id="app-version-simple">${APP_VERSION}</span>
            </p>
          </div>
        `;
        document.body.appendChild(simpleFooter);
      }

      const sectionDividers = document.querySelectorAll('.section-divider');
      sectionDividers.forEach((divider) => {
        (divider as HTMLElement).style.display = 'none';
      });

      document.title = 'BentoPDF - PDF Tools';

      const toolsHeader = document.getElementById('tools-header');
      if (toolsHeader) {
        const title = toolsHeader.querySelector('h2');
        const subtitle = toolsHeader.querySelector('p');
        if (title) {
          title.textContent = 'PDF Tools';
          title.className = 'text-4xl md:text-5xl font-bold text-white mb-3';
        }
        if (subtitle) {
          subtitle.textContent = 'Select a tool to get started';
          subtitle.className = 'text-lg text-gray-400';
        }
      }

      const app = document.getElementById('app');
      if (app) {
        app.style.paddingTop = '1rem';
      }
    };

    hideBrandingSections();
  }

  // Hide shortcuts buttons on mobile devices (Android/iOS)
  // exclude iPad -> users can connect keyboard and use shortcuts
  const isMobile = /Android|iPhone|iPod/i.test(navigator.userAgent);
  const keyboardShortcutBtn = document.getElementById('shortcut');
  const shortcutSettingsBtn = document.getElementById('open-shortcuts-btn');

  if (isMobile) {
    if (keyboardShortcutBtn) keyboardShortcutBtn.style.display = 'none';
    if (shortcutSettingsBtn) shortcutSettingsBtn.style.display = 'none';
  } else {
    if (keyboardShortcutBtn) {
      keyboardShortcutBtn.textContent = navigator.userAgent.toUpperCase().includes('MAC')
        ? '⌘ + K'
        : 'Ctrl + K';
    }
  }


  const categoryTranslationKeys: Record<string, string> = {
    'Popular Tools': 'tools:categories.popularTools',
    'Edit & Annotate': 'tools:categories.editAnnotate',
    'Convert to PDF': 'tools:categories.convertToPdf',
    'Convert from PDF': 'tools:categories.convertFromPdf',
    'Organize & Manage': 'tools:categories.organizeManage',
    'Optimize & Repair': 'tools:categories.optimizeRepair',
    'Secure PDF': 'tools:categories.securePdf',
  };

  const toolTranslationKeys: Record<string, string> = {
    'PDF Multi Tool': 'tools:pdfMultiTool',
    'Merge PDF': 'tools:mergePdf',
    'Split PDF': 'tools:splitPdf',
    'Compress PDF': 'tools:compressPdf',
    'PDF Editor': 'tools:pdfEditor',
    'JPG to PDF': 'tools:jpgToPdf',
    'Sign PDF': 'tools:signPdf',
    'Crop PDF': 'tools:cropPdf',
    'Extract Pages': 'tools:extractPages',
    'Duplicate & Organize': 'tools:duplicateOrganize',
    'Delete Pages': 'tools:deletePages',
    'Edit Bookmarks': 'tools:editBookmarks',
    'Table of Contents': 'tools:tableOfContents',
    'Page Numbers': 'tools:pageNumbers',
    'Add Watermark': 'tools:addWatermark',
    'Header & Footer': 'tools:headerFooter',
    'Invert Colors': 'tools:invertColors',
    'Background Color': 'tools:backgroundColor',
    'Change Text Color': 'tools:changeTextColor',
    'Add Stamps': 'tools:addStamps',
    'Remove Annotations': 'tools:removeAnnotations',
    'PDF Form Filler': 'tools:pdfFormFiller',
    'Create PDF Form': 'tools:createPdfForm',
    'Remove Blank Pages': 'tools:removeBlankPages',
    'Image to PDF': 'tools:imageToPdf',
    'PNG to PDF': 'tools:pngToPdf',
    'WebP to PDF': 'tools:webpToPdf',
    'SVG to PDF': 'tools:svgToPdf',
    'BMP to PDF': 'tools:bmpToPdf',
    'HEIC to PDF': 'tools:heicToPdf',
    'TIFF to PDF': 'tools:tiffToPdf',
    'Text to PDF': 'tools:textToPdf',
    'JSON to PDF': 'tools:jsonToPdf',
    'PDF to JPG': 'tools:pdfToJpg',
    'PDF to PNG': 'tools:pdfToPng',
    'PDF to WebP': 'tools:pdfToWebp',
    'PDF to BMP': 'tools:pdfToBmp',
    'PDF to TIFF': 'tools:pdfToTiff',
    'PDF to Greyscale': 'tools:pdfToGreyscale',
    'PDF to JSON': 'tools:pdfToJson',
    'OCR PDF': 'tools:ocrPdf',
    'Alternate & Mix Pages': 'tools:alternateMix',
    'Organize & Duplicate': 'tools:duplicateOrganize',
    'Add Attachments': 'tools:addAttachments',
    'Extract Attachments': 'tools:extractAttachments',
    'Edit Attachments': 'tools:editAttachments',
    'Divide Pages': 'tools:dividePages',
    'Add Blank Page': 'tools:addBlankPage',
    'Reverse Pages': 'tools:reversePages',
    'Rotate PDF': 'tools:rotatePdf',
    'N-Up PDF': 'tools:nUpPdf',
    'Combine to Single Page': 'tools:combineToSinglePage',
    'View Metadata': 'tools:viewMetadata',
    'Edit Metadata': 'tools:editMetadata',
    'PDFs to ZIP': 'tools:pdfsToZip',
    'Compare PDFs': 'tools:comparePdfs',
    'Posterize PDF': 'tools:posterizePdf',
    'Fix Page Size': 'tools:fixPageSize',
    'Linearize PDF': 'tools:linearizePdf',
    'Page Dimensions': 'tools:pageDimensions',
    'Remove Restrictions': 'tools:removeRestrictions',
    'Repair PDF': 'tools:repairPdf',
    'Encrypt PDF': 'tools:encryptPdf',
    'Sanitize PDF': 'tools:sanitizePdf',
    'Decrypt PDF': 'tools:decryptPdf',
    'Flatten PDF': 'tools:flattenPdf',
    'Remove Metadata': 'tools:removeMetadata',
    'Change Permissions': 'tools:changePermissions',
  };

  // Homepage-only tool grid rendering (not used on individual tool pages)
  if (dom.toolGrid) {
    dom.toolGrid.textContent = '';

    categories.forEach((category) => {
      const categoryGroup = document.createElement('div');
      categoryGroup.className = 'category-group col-span-full';

      const title = document.createElement('h2');
      title.className = 'text-xl font-bold text-indigo-400 mb-4 mt-8 first:mt-0 text-white';
      const categoryKey = categoryTranslationKeys[category.name];
      title.textContent = categoryKey ? t(categoryKey) : category.name;

      const toolsContainer = document.createElement('div');
      toolsContainer.className =
        'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6';

      category.tools.forEach((tool) => {
        let toolCard: HTMLDivElement | HTMLAnchorElement;

        if (tool.href) {
          toolCard = document.createElement('a');
          toolCard.href = tool.href;
          toolCard.className =
            'tool-card block bg-gray-800 rounded-xl p-4 cursor-pointer flex flex-col items-center justify-center text-center no-underline hover:shadow-lg transition duration-200';
        } else {
          toolCard = document.createElement('div');
          toolCard.className =
            'tool-card bg-gray-800 rounded-xl p-4 cursor-pointer flex flex-col items-center justify-center text-center hover:shadow-lg transition duration-200';
          toolCard.dataset.toolId = getToolId(tool);
        }

        const icon = document.createElement('i');
        icon.className = 'w-10 h-10 mb-3 text-indigo-400';
        icon.setAttribute('data-lucide', tool.icon);

        const toolName = document.createElement('h3');
        toolName.className = 'font-semibold text-white';
        const toolKey = toolTranslationKeys[tool.name];
        toolName.textContent = toolKey ? t(`${toolKey}.name`) : tool.name;

        toolCard.append(icon, toolName);

        if (tool.subtitle) {
          const toolSubtitle = document.createElement('p');
          toolSubtitle.className = 'text-xs text-gray-400 mt-1 px-2';
          toolSubtitle.textContent = toolKey ? t(`${toolKey}.subtitle`) : tool.subtitle;
          toolCard.appendChild(toolSubtitle);
        }

        toolsContainer.appendChild(toolCard);
      });

      categoryGroup.append(title, toolsContainer);
      dom.toolGrid.appendChild(categoryGroup);
    });

    const searchBar = document.getElementById('search-bar');
    const categoryGroups = dom.toolGrid.querySelectorAll('.category-group');

    const fuzzyMatch = (searchTerm: string, targetText: string): boolean => {
      if (!searchTerm) return true;

      let searchIndex = 0;
      let targetIndex = 0;

      while (searchIndex < searchTerm.length && targetIndex < targetText.length) {
        if (searchTerm[searchIndex] === targetText[targetIndex]) {
          searchIndex++;
        }
        targetIndex++;
      }

      return searchIndex === searchTerm.length;
    };

    searchBar.addEventListener('input', () => {
      // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
      const searchTerm = searchBar.value.toLowerCase().trim();

      categoryGroups.forEach((group) => {
        const toolCards = group.querySelectorAll('.tool-card');
        let visibleToolsInCategory = 0;

        toolCards.forEach((card) => {
          const toolName = card.querySelector('h3').textContent.toLowerCase();
          const toolSubtitle =
            card.querySelector('p')?.textContent.toLowerCase() || '';

          const isMatch =
            fuzzyMatch(searchTerm, toolName) || fuzzyMatch(searchTerm, toolSubtitle);

          card.classList.toggle('hidden', !isMatch);
          if (isMatch) {
            visibleToolsInCategory++;
          }
        });

        group.classList.toggle('hidden', visibleToolsInCategory === 0);
      });
    });

    window.addEventListener('keydown', function (e) {
      const key = e.key.toLowerCase();
      const isMac = navigator.userAgent.toUpperCase().includes('MAC');
      const isCtrlK = e.ctrlKey && key === 'k';
      const isCmdK = isMac && e.metaKey && key === 'k';

      if (isCtrlK || isCmdK) {
        e.preventDefault();
        searchBar.focus();
      }
    });

    dom.toolGrid.addEventListener('click', (e) => {
      // All tools now use href and navigate directly - no modal handling needed
    });
  }

  if (dom.backToGridBtn) {
    dom.backToGridBtn.addEventListener('click', () => switchView('grid'));
  }

  if (dom.alertOkBtn) {
    dom.alertOkBtn.addEventListener('click', hideAlert);
  }

  const faqAccordion = document.getElementById('faq-accordion');
  if (faqAccordion) {
    faqAccordion.addEventListener('click', (e) => {
      // @ts-expect-error TS(2339) FIXME: Property 'closest' does not exist on type 'EventTa... Remove this comment to see the full error message
      const questionButton = e.target.closest('.faq-question');
      if (!questionButton) return;

      const faqItem = questionButton.parentElement;
      const answer = faqItem.querySelector('.faq-answer');

      faqItem.classList.toggle('open');

      if (faqItem.classList.contains('open')) {
        answer.style.maxHeight = answer.scrollHeight + 'px';
      } else {
        answer.style.maxHeight = '0px';
      }
    });
  }

  createIcons({ icons });
  console.log('Please share our tool and share the love!');


  const githubStarsElements = [
    document.getElementById('github-stars-desktop'),
    document.getElementById('github-stars-mobile')
  ];

  if (githubStarsElements.some(el => el) && !__SIMPLE_MODE__) {
    fetch('https://api.github.com/repos/alam00000/bentopdf')
      .then((response) => response.json())
      .then((data) => {
        if (data.stargazers_count !== undefined) {
          const formattedStars = formatStars(data.stargazers_count);
          githubStarsElements.forEach(el => {
            if (el) el.textContent = formattedStars;
          });
        }
      })
      .catch(() => {
        githubStarsElements.forEach(el => {
          if (el) el.textContent = '-';
        });
      });
  }


  // Initialize Shortcuts System
  ShortcutsManager.init();

  // Tab switching for settings modal
  const shortcutsTabBtn = document.getElementById('shortcuts-tab-btn');
  const preferencesTabBtn = document.getElementById('preferences-tab-btn');
  const shortcutsTabContent = document.getElementById('shortcuts-tab-content');
  const preferencesTabContent = document.getElementById('preferences-tab-content');
  const shortcutsTabFooter = document.getElementById('shortcuts-tab-footer');
  const preferencesTabFooter = document.getElementById('preferences-tab-footer');
  const resetShortcutsBtn = document.getElementById('reset-shortcuts-btn');

  if (shortcutsTabBtn && preferencesTabBtn) {
    shortcutsTabBtn.addEventListener('click', () => {
      shortcutsTabBtn.classList.add('bg-indigo-600', 'text-white');
      shortcutsTabBtn.classList.remove('text-gray-300');
      preferencesTabBtn.classList.remove('bg-indigo-600', 'text-white');
      preferencesTabBtn.classList.add('text-gray-300');
      shortcutsTabContent?.classList.remove('hidden');
      preferencesTabContent?.classList.add('hidden');
      shortcutsTabFooter?.classList.remove('hidden');
      preferencesTabFooter?.classList.add('hidden');
      resetShortcutsBtn?.classList.remove('hidden');
    });

    preferencesTabBtn.addEventListener('click', () => {
      preferencesTabBtn.classList.add('bg-indigo-600', 'text-white');
      preferencesTabBtn.classList.remove('text-gray-300');
      shortcutsTabBtn.classList.remove('bg-indigo-600', 'text-white');
      shortcutsTabBtn.classList.add('text-gray-300');
      preferencesTabContent?.classList.remove('hidden');
      shortcutsTabContent?.classList.add('hidden');
      preferencesTabFooter?.classList.remove('hidden');
      shortcutsTabFooter?.classList.add('hidden');
      resetShortcutsBtn?.classList.add('hidden');
    });
  }

  // Full-width toggle functionality
  const fullWidthToggle = document.getElementById('full-width-toggle') as HTMLInputElement;
  const toolInterface = document.getElementById('tool-interface');

  // Load saved preference
  const savedFullWidth = localStorage.getItem('fullWidthMode') === 'true';
  if (fullWidthToggle) {
    fullWidthToggle.checked = savedFullWidth;
    applyFullWidthMode(savedFullWidth);
  }

  function applyFullWidthMode(enabled: boolean) {
    if (toolInterface) {
      if (enabled) {
        toolInterface.classList.remove('max-w-4xl');
      } else {
        toolInterface.classList.add('max-w-4xl');
      }
    }

    // Apply to all page uploaders
    const pageUploaders = document.querySelectorAll('#tool-uploader');
    pageUploaders.forEach((uploader) => {
      if (enabled) {
        uploader.classList.remove('max-w-2xl', 'max-w-5xl');
      } else {
        // Restore original max-width (most are max-w-2xl, add-stamps is max-w-5xl)
        if (!uploader.classList.contains('max-w-2xl') && !uploader.classList.contains('max-w-5xl')) {
          uploader.classList.add('max-w-2xl');
        }
      }
    });
  }

  if (fullWidthToggle) {
    fullWidthToggle.addEventListener('change', (e) => {
      const enabled = (e.target as HTMLInputElement).checked;
      localStorage.setItem('fullWidthMode', enabled.toString());
      applyFullWidthMode(enabled);
    });
  }

  // Shortcuts UI Handlers
  if (dom.openShortcutsBtn) {
    dom.openShortcutsBtn.addEventListener('click', () => {
      renderShortcutsList();
      dom.shortcutsModal.classList.remove('hidden');
    });
  }

  if (dom.closeShortcutsModalBtn) {
    dom.closeShortcutsModalBtn.addEventListener('click', () => {
      dom.shortcutsModal.classList.add('hidden');
    });
  }

  // Close modal on outside click
  if (dom.shortcutsModal) {
    dom.shortcutsModal.addEventListener('click', (e) => {
      if (e.target === dom.shortcutsModal) {
        dom.shortcutsModal.classList.add('hidden');
      }
    });
  }

  if (dom.resetShortcutsBtn) {
    dom.resetShortcutsBtn.addEventListener('click', async () => {
      const confirmed = await showWarningModal(
        t('settings.warnings.resetTitle'),
        t('settings.warnings.resetMessage'),
        true
      );

      if (confirmed) {
        ShortcutsManager.reset();
        renderShortcutsList();
      }
    });
  }

  if (dom.exportShortcutsBtn) {
    dom.exportShortcutsBtn.addEventListener('click', () => {
      ShortcutsManager.exportSettings();
    });
  }

  if (dom.importShortcutsBtn) {
    dom.importShortcutsBtn.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = async (e) => {
            const content = e.target?.result as string;
            if (ShortcutsManager.importSettings(content)) {
              renderShortcutsList();
              await showWarningModal(
                t('settings.warnings.importSuccessTitle'),
                t('settings.warnings.importSuccessMessage'),
                false
              );
            } else {
              await showWarningModal(
                t('settings.warnings.importFailTitle'),
                t('settings.warnings.importFailMessage'),
                false
              );
            }
          };
          reader.readAsText(file);
        }
      };
      input.click();
    });
  }

  if (dom.shortcutSearch) {
    dom.shortcutSearch.addEventListener('input', (e) => {
      const term = (e.target as HTMLInputElement).value.toLowerCase();
      const sections = dom.shortcutsList.querySelectorAll('.category-section');

      sections.forEach((section) => {
        const items = section.querySelectorAll('.shortcut-item');
        let visibleCount = 0;

        items.forEach((item) => {
          const text = item.textContent?.toLowerCase() || '';
          if (text.includes(term)) {
            item.classList.remove('hidden');
            visibleCount++;
          } else {
            item.classList.add('hidden');
          }
        });

        if (visibleCount === 0) {
          section.classList.add('hidden');
        } else {
          section.classList.remove('hidden');
        }
      });
    });
  }

  // Reserved shortcuts that commonly conflict with browser/OS functions
  const RESERVED_SHORTCUTS: Record<string, { mac?: string; windows?: string }> = {
    'mod+w': { mac: 'Closes tab', windows: 'Closes tab' },
    'mod+t': { mac: 'Opens new tab', windows: 'Opens new tab' },
    'mod+n': { mac: 'Opens new window', windows: 'Opens new window' },
    'mod+shift+n': { mac: 'Opens incognito window', windows: 'Opens incognito window' },
    'mod+q': { mac: 'Quits application (cannot be overridden)' },
    'mod+m': { mac: 'Minimizes window' },
    'mod+h': { mac: 'Hides window' },
    'mod+r': { mac: 'Reloads page', windows: 'Reloads page' },
    'mod+shift+r': { mac: 'Hard reloads page', windows: 'Hard reloads page' },
    'mod+l': { mac: 'Focuses address bar', windows: 'Focuses address bar' },
    'mod+d': { mac: 'Bookmarks page', windows: 'Bookmarks page' },
    'mod+shift+t': { mac: 'Reopens closed tab', windows: 'Reopens closed tab' },
    'mod+shift+w': { mac: 'Closes window', windows: 'Closes window' },
    'mod+tab': { mac: 'Switches tabs', windows: 'Switches apps' },
    'alt+f4': { windows: 'Closes window' },
    'ctrl+tab': { mac: 'Switches tabs', windows: 'Switches tabs' },
  };

  function getReservedShortcutWarning(combo: string, isMac: boolean): string | null {
    const reserved = RESERVED_SHORTCUTS[combo];
    if (!reserved) return null;

    const description = isMac ? reserved.mac : reserved.windows;
    if (!description) return null;

    return description;
  }

  function showWarningModal(title: string, message: string, confirmMode: boolean = true): Promise<boolean> {
    return new Promise((resolve) => {
      if (!dom.warningModal || !dom.warningTitle || !dom.warningMessage || !dom.warningCancelBtn || !dom.warningConfirmBtn) {
        resolve(confirmMode ? confirm(message) : (alert(message), true));
        return;
      }

      dom.warningTitle.textContent = title;
      dom.warningMessage.innerHTML = message;
      dom.warningModal.classList.remove('hidden');
      dom.warningModal.classList.add('flex');

      if (confirmMode) {
        dom.warningCancelBtn.style.display = '';
        dom.warningConfirmBtn.textContent = 'Proceed';
      } else {
        dom.warningCancelBtn.style.display = 'none';
        dom.warningConfirmBtn.textContent = 'OK';
      }

      const handleConfirm = () => {
        cleanup();
        resolve(true);
      };

      const handleCancel = () => {
        cleanup();
        resolve(false);
      };

      const cleanup = () => {
        dom.warningModal?.classList.add('hidden');
        dom.warningModal?.classList.remove('flex');
        dom.warningConfirmBtn?.removeEventListener('click', handleConfirm);
        dom.warningCancelBtn?.removeEventListener('click', handleCancel);
      };

      dom.warningConfirmBtn.addEventListener('click', handleConfirm);
      dom.warningCancelBtn.addEventListener('click', handleCancel);

      // Close on backdrop click
      dom.warningModal.addEventListener('click', (e) => {
        if (e.target === dom.warningModal) {
          if (confirmMode) {
            handleCancel();
          } else {
            handleConfirm();
          }
        }
      }, { once: true });
    });
  }

  function getToolId(tool: any): string {
    if (tool.id) return tool.id;
    if (tool.href) {
      const match = tool.href.match(/\/([^/]+)\.html$/);
      return match ? match[1] : tool.href;
    }
    return 'unknown';
  }

  function renderShortcutsList() {
    if (!dom.shortcutsList) return;
    dom.shortcutsList.innerHTML = '';

    const allShortcuts = ShortcutsManager.getAllShortcuts();
    const isMac = navigator.userAgent.toUpperCase().includes('MAC');
    const allTools = categories.flatMap(c => c.tools);

    categories.forEach(category => {
      const section = document.createElement('div');
      section.className = 'category-section mb-6 last:mb-0';

      const header = document.createElement('h3');
      header.className = 'text-gray-400 text-xs font-bold uppercase tracking-wider mb-3 pl-1';
      // Translate category name
      const categoryKey = categoryTranslationKeys[category.name];
      header.textContent = categoryKey ? t(categoryKey) : category.name;
      section.appendChild(header);

      const itemsContainer = document.createElement('div');
      itemsContainer.className = 'space-y-2';
      section.appendChild(itemsContainer);

      let hasTools = false;

      category.tools.forEach(tool => {
        hasTools = true;
        const toolId = getToolId(tool);
        const currentShortcut = allShortcuts.get(toolId) || '';

        const item = document.createElement('div');
        item.className = 'shortcut-item flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors';

        const left = document.createElement('div');
        left.className = 'flex items-center gap-3';

        const icon = document.createElement('i');
        icon.className = 'w-5 h-5 text-indigo-400';
        icon.setAttribute('data-lucide', tool.icon);

        const name = document.createElement('span');
        name.className = 'text-gray-200 font-medium';
        const toolKey = toolTranslationKeys[tool.name];
        name.textContent = toolKey ? t(`${toolKey}.name`) : tool.name;

        left.append(icon, name);

        const right = document.createElement('div');
        right.className = 'relative';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'shortcut-input w-32 bg-gray-800 border border-gray-600 text-white text-center text-sm rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all';
        input.placeholder = t('settings.clickToSet');
        input.value = formatShortcutDisplay(currentShortcut, isMac);
        input.readOnly = true;

        const clearBtn = document.createElement('button');
        clearBtn.className = 'absolute -right-2 -top-2 bg-gray-700 hover:bg-red-600 text-white rounded-full p-0.5 hidden group-hover:block shadow-sm';
        clearBtn.innerHTML = '<i data-lucide="x" class="w-3 h-3"></i>';
        if (currentShortcut) {
          right.classList.add('group');
        }

        clearBtn.onclick = (e) => {
          e.stopPropagation();
          ShortcutsManager.setShortcut(toolId, '');
          renderShortcutsList();
        };

        input.onkeydown = async (e) => {
          e.preventDefault();
          e.stopPropagation();

          if (e.key === 'Backspace' || e.key === 'Delete') {
            ShortcutsManager.setShortcut(toolId, '');
            renderShortcutsList();
            return;
          }

          const keys: string[] = [];
          // On Mac: metaKey = Command, ctrlKey = Control
          // On Windows/Linux: metaKey is rare, ctrlKey = Ctrl
          if (isMac) {
            if (e.metaKey) keys.push('mod'); // Command on Mac
            if (e.ctrlKey) keys.push('ctrl'); // Control on Mac (separate from Command)
          } else {
            if (e.ctrlKey || e.metaKey) keys.push('mod'); // Ctrl on Windows/Linux
          }
          if (e.altKey) keys.push('alt');
          if (e.shiftKey) keys.push('shift');

          let key = e.key.toLowerCase();

          if (e.altKey && e.code) {
            if (e.code.startsWith('Key')) {
              key = e.code.slice(3).toLowerCase();
            } else if (e.code.startsWith('Digit')) {
              key = e.code.slice(5);
            }
          }

          const isModifier = ['control', 'shift', 'alt', 'meta'].includes(key);
          const isDeadKey = key === 'dead' || key.startsWith('dead');

          // Ignore dead keys (used for accented characters on Mac with Option key)
          if (isDeadKey) {
            input.value = formatShortcutDisplay(ShortcutsManager.getShortcut(toolId) || '', isMac);
            return;
          }

          if (!isModifier) {
            keys.push(key);
          }

          const combo = keys.join('+');

          input.value = formatShortcutDisplay(combo, isMac);

          if (!isModifier) {
            const existingToolId = ShortcutsManager.findToolByShortcut(combo);

            if (existingToolId && existingToolId !== toolId) {
              const existingTool = allTools.find(t => getToolId(t) === existingToolId);
              const existingToolName = existingTool?.name || existingToolId;
              const displayCombo = formatShortcutDisplay(combo, isMac);

              const existingToolKey = existingTool ? toolTranslationKeys[existingTool.name] : null;
              const translatedToolName = existingToolKey ? t(`${existingToolKey}.name`) : existingToolName;

              await showWarningModal(
                t('settings.warnings.alreadyInUse'),
                `<strong>${displayCombo}</strong> ${t('settings.warnings.assignedTo')}<br><br>` +
                `<em>"${translatedToolName}"</em><br><br>` +
                t('settings.warnings.chooseDifferent'),
                false
              );

              input.value = formatShortcutDisplay(ShortcutsManager.getShortcut(toolId) || '', isMac);
              input.classList.remove('border-indigo-500', 'text-indigo-400');
              input.blur();
              return;
            }

            const reservedWarning = getReservedShortcutWarning(combo, isMac);
            if (reservedWarning) {
              const displayCombo = formatShortcutDisplay(combo, isMac);
              const shouldProceed = await showWarningModal(
                t('settings.warnings.reserved'),
                `<strong>${displayCombo}</strong> ${t('settings.warnings.commonlyUsed')}<br><br>` +
                `"<em>${reservedWarning}</em>"<br><br>` +
                `${t('settings.warnings.unreliable')}<br><br>` +
                t('settings.warnings.useAnyway')
              );

              if (!shouldProceed) {
                // Revert display
                input.value = formatShortcutDisplay(ShortcutsManager.getShortcut(toolId) || '', isMac);
                input.classList.remove('border-indigo-500', 'text-indigo-400');
                input.blur();
                return;
              }
            }

            ShortcutsManager.setShortcut(toolId, combo);
            // Re-render to update all inputs (show conflicts in real-time)
            renderShortcutsList();
          }
        };

        input.onkeyup = (e) => {
          // If the user releases a modifier without pressing a main key, revert to saved
          const key = e.key.toLowerCase();
          if (['control', 'shift', 'alt', 'meta'].includes(key)) {
            const currentSaved = ShortcutsManager.getShortcut(toolId);
          }
        };

        input.onfocus = () => {
          input.value = t('settings.pressKeys');
          input.classList.add('border-indigo-500', 'text-indigo-400');
        };

        input.onblur = () => {
          input.value = formatShortcutDisplay(ShortcutsManager.getShortcut(toolId) || '', isMac);
          input.classList.remove('border-indigo-500', 'text-indigo-400');
        };

        right.append(input);
        if (currentShortcut) right.append(clearBtn);

        item.append(left, right);
        itemsContainer.appendChild(item);
      });

      if (hasTools) {
        dom.shortcutsList.appendChild(section);
      }
    });

    createIcons({ icons });
  }

  const scrollToTopBtn = document.getElementById('scroll-to-top-btn');

  if (scrollToTopBtn) {
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < lastScrollY && currentScrollY > 300) {
        scrollToTopBtn.classList.add('visible');
      } else {
        scrollToTopBtn.classList.remove('visible');
      }

      lastScrollY = currentScrollY;
    });

    scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'instant'
      });
    });
  }

  // Rewrite links after all dynamic content is fully loaded
  rewriteLinks();
};

window.addEventListener('load', init);
