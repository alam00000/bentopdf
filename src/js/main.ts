import './utils/map-upsert-polyfill.js';
import './utils/setup-pdf-worker.js';
import { categories } from './config/tools.js';
import { dom, switchView, hideAlert } from './ui.js';
import { ShortcutsManager } from './logic/shortcuts.js';
import { createIcons, icons } from 'lucide';
import '@phosphor-icons/web/regular';
import * as pdfjsLib from 'pdfjs-dist';
import '../css/styles.css';
import {
  escapeHtml,
  formatBytes,
  formatShortcutDisplay,
  formatStars,
} from './utils/helpers.js';
import {
  initI18n,
  applyTranslations,
  rewriteLinks,
  t,
  trText,
} from './i18n/index.js';
import {
  loadRuntimeConfig,
  isToolDisabled,
  isCurrentPageDisabled,
} from './utils/disabled-tools.js';
import {
  getStoredItem,
  setStoredItem,
  removeStoredItem,
} from './utils/safe-storage.js';
import { sanitizeTranslationHtml } from './utils/translation-html.js';
import type { ToolCategory } from '@/types';

const FAVORITE_STAR_PATHS = [
  [
    'off',
    'M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.38,16.38,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Zm-15.34,5.47-48.7,42a8,8,0,0,0-2.56,7.91l14.88,62.8a.37.37,0,0,1-.17.48c-.18.14-.23.11-.38,0l-54.72-33.65a8,8,0,0,0-8.38,0L69.09,215.94c-.15.09-.19.12-.38,0a.37.37,0,0,1-.17-.48l14.88-62.8a8,8,0,0,0-2.56-7.91l-48.7-42c-.12-.1-.23-.19-.13-.5s.18-.27.33-.29l63.92-5.16A8,8,0,0,0,103,91.86l24.62-59.61c.08-.17.11-.25.35-.25s.27.08.35.25L153,91.86a8,8,0,0,0,6.75,4.92l63.92,5.16c.15,0,.24,0,.33.29S224,102.63,223.84,102.73Z',
  ],
  [
    'on',
    'M234.29,114.85l-45,38.83L203,211.75a16.4,16.4,0,0,1-24.5,17.82L128,198.49,77.47,229.57A16.4,16.4,0,0,1,53,211.75l13.76-58.07-45-38.83A16.46,16.46,0,0,1,31.08,86l59-4.76,22.76-55.08a16.36,16.36,0,0,1,30.27,0l22.75,55.08,59,4.76a16.46,16.46,0,0,1,9.37,28.86Z',
  ],
] as const;
declare const __BRAND_NAME__: string;

const init = async () => {
  await initI18n();
  await loadRuntimeConfig();
  applyTranslations();

  if (isCurrentPageDisabled()) {
    document.title = t('disabledTool.title') || trText('الأداة غير متاحة');
    const main = document.querySelector('main') || document.body;
    const heading = t('disabledTool.heading') || trText('تم تعطيل هذه الأداة');
    const message =
      t('disabledTool.message') ||
      trText(
        'هذه الأداة غير متاحة في نشرك. تواصل مع المسؤول لمزيد من المعلومات.'
      );
    const backHome =
      t('disabledTool.backHome') || trText('العودة إلى الرئيسية');
    main.innerHTML = `
      <div class="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <i class="ph ph-prohibit text-6xl text-gray-500 mb-4"></i>
        <h1 class="text-2xl font-bold text-white mb-2">${sanitizeTranslationHtml(heading)}</h1>
        <p class="text-gray-400 mb-6">${sanitizeTranslationHtml(message)}</p>
        <a href="${import.meta.env.BASE_URL}" class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition">${sanitizeTranslationHtml(backHome)}</a>
      </div>
    `;
    return;
  }

  const HANDOFF_DB_NAME = 'pixel-pdf-workspace';
  const HANDOFF_STORE_NAME = 'files';
  const HANDOFF_KEY = 'home-pdf';

  type StoredHomeFile = {
    file: File;
    savedAt: number;
  };

  const openHandoffDb = (): Promise<IDBDatabase | null> =>
    new Promise((resolve) => {
      if (!('indexedDB' in window)) {
        resolve(null);
        return;
      }
      const request = window.indexedDB.open(HANDOFF_DB_NAME, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(HANDOFF_STORE_NAME)) {
          request.result.createObjectStore(HANDOFF_STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    });

  const saveHomePdf = async (file: File): Promise<boolean> => {
    const db = await openHandoffDb();
    if (!db) return false;
    return new Promise((resolve) => {
      try {
        const transaction = db.transaction(HANDOFF_STORE_NAME, 'readwrite');
        transaction
          .objectStore(HANDOFF_STORE_NAME)
          .put(
            { file, savedAt: Date.now() } satisfies StoredHomeFile,
            HANDOFF_KEY
          );
        transaction.oncomplete = () => {
          db.close();
          resolve(true);
        };
        transaction.onerror = () => {
          db.close();
          resolve(false);
        };
      } catch {
        db.close();
        resolve(false);
      }
    });
  };

  const loadHomePdf = async (): Promise<File | null> => {
    const db = await openHandoffDb();
    if (!db) return null;
    return new Promise((resolve) => {
      try {
        const transaction = db.transaction(HANDOFF_STORE_NAME, 'readonly');
        const request = transaction
          .objectStore(HANDOFF_STORE_NAME)
          .get(HANDOFF_KEY);
        request.onsuccess = () => {
          db.close();
          const stored = request.result as StoredHomeFile | undefined;
          resolve(stored?.file instanceof File ? stored.file : null);
        };
        request.onerror = () => {
          db.close();
          resolve(null);
        };
      } catch {
        db.close();
        resolve(null);
      }
    });
  };

  const deleteHomePdf = async (): Promise<void> => {
    const db = await openHandoffDb();
    if (!db) return;
    await new Promise<void>((resolve) => {
      try {
        const transaction = db.transaction(HANDOFF_STORE_NAME, 'readwrite');
        transaction.objectStore(HANDOFF_STORE_NAME).delete(HANDOFF_KEY);
        transaction.oncomplete = () => {
          db.close();
          resolve();
        };
        transaction.onerror = () => {
          db.close();
          resolve();
        };
      } catch {
        db.close();
        resolve();
      }
    });
  };

  const addWorkflowSteps = () => {
    const uploader = document.getElementById('tool-uploader');
    if (!uploader || uploader.querySelector('.px-workflow-steps')) return;
    const steps = document.createElement('ol');
    steps.className = 'px-workflow-steps';
    steps.setAttribute('aria-label', trText('خطوات إنجاز المهمة'));
    [
      trText('اختر الملف'),
      trText('اضبط الإعدادات'),
      trText('نفّذ المعالجة'),
      trText('نزّل النتيجة'),
    ].forEach((label, index) => {
      const item = document.createElement('li');
      const number = document.createElement('span');
      number.className = 'px-step-num';
      number.textContent = String(index + 1);
      item.append(number, document.createTextNode(label));
      steps.appendChild(item);
    });
    uploader.prepend(steps);
  };

  const hydrateHomeFileHandoff = async () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('from') !== 'home') return;
    const input = document.querySelector<HTMLInputElement>('#file-input');
    if (!input) return;
    const accept = (input.accept || '').toLowerCase();
    if (accept && !accept.includes('pdf') && !accept.includes('*/*')) return;

    const file = await loadHomePdf();
    if (!file) return;

    try {
      const transfer = new DataTransfer();
      transfer.items.add(file);
      input.files = transfer.files;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));

      const host =
        document.getElementById('tool-uploader') ||
        input.closest('main') ||
        input.parentElement;
      if (host && !host.querySelector('.px-handoff-banner')) {
        const banner = document.createElement('div');
        banner.className = 'px-handoff-banner';
        banner.setAttribute('role', 'status');
        const icon = document.createElement('i');
        icon.setAttribute('data-lucide', 'file-check');
        icon.setAttribute('aria-hidden', 'true');
        const text = document.createElement('span');
        text.textContent = trText('تمت إضافة ملفك من الصفحة الرئيسية:');
        const name = document.createElement('span');
        name.className = 'px-ltr';
        name.textContent = file.name;
        banner.append(icon, text, name);
        host.prepend(banner);
        createIcons({ icons });
      }
    } catch {
      // The tool remains fully usable with its normal file picker.
    }
  };

  addWorkflowSteps();
  void hydrateHomeFileHandoff();

  if (__SIMPLE_MODE__) {
    const hideBrandingSections = () => {
      const heroSection = document.getElementById('hero-section');
      if (heroSection) {
        heroSection.style.display = 'none';
      }

      const githubLink = document.querySelector(
        'a[href*="github.com/mohammedalhinaki-cloud/Pixel-PDF"]'
      );
      if (githubLink) {
        (githubLink as HTMLElement).style.display = 'none';
      }

      const sectionDividers = document.querySelectorAll('.section-divider');
      sectionDividers.forEach((divider) => {
        (divider as HTMLElement).style.display = 'none';
      });

      const brandName = __BRAND_NAME__ || 'Pixel PDF';
      document.title = trText('{{brandName}} - {{title}}', {
        brandName,
        title: t('simpleMode.title'),
      });

      const toolsHeader = document.getElementById('tools-header');
      if (toolsHeader) {
        const title = toolsHeader.querySelector('h2');
        const subtitle = toolsHeader.querySelector('p');
        if (title) {
          title.textContent = t('simpleMode.title');
          title.className = 'text-4xl md:text-5xl font-bold text-white mb-3';
        }
        if (subtitle) {
          subtitle.textContent = t('simpleMode.subtitle');
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
      keyboardShortcutBtn.textContent = navigator.userAgent
        .toUpperCase()
        .includes('MAC')
        ? '⌘ + K'
        : 'Ctrl + K';
    }
  }

  const categoryTranslationKeys: Record<string, string> = {
    Favorites: 'tools:categories.favorites',
    'Popular Tools': 'tools:categories.popularTools',
    'Edit & Annotate': 'tools:categories.editAnnotate',
    'Convert to PDF': 'tools:categories.convertToPdf',
    'Convert from PDF': 'tools:categories.convertFromPdf',
    'Organize & Manage': 'tools:categories.organizeManage',
    'Optimize & Repair': 'tools:categories.optimizeRepair',
    'Secure PDF': 'tools:categories.securePdf',
  };

  const toolTranslationKeys: Record<string, string> = {
    'PDF Workflow Builder': 'tools:pdfWorkflow',
    'PDF Multi Tool': 'tools:pdfMultiTool',
    'Merge PDF': 'tools:mergePdf',
    'Split PDF': 'tools:splitPdf',
    'Compress PDF': 'tools:compressPdf',
    'PDF Editor': 'tools:pdfEditor',
    'Edit PDF Text': 'tools:editPdfText',
    'JPG to PDF': 'tools:jpgToPdf',
    'Sign PDF': 'tools:signPdf',
    'Crop PDF': 'tools:cropPdf',
    'Extract Pages': 'tools:extractPages',
    'Duplicate & Organize': 'tools:duplicateOrganize',
    'Delete Pages': 'tools:deletePages',
    'Edit Bookmarks': 'tools:editBookmarks',
    'Table of Contents': 'tools:tableOfContents',
    'Page Numbers': 'tools:pageNumbers',
    'Add Page Labels': 'tools:addPageLabels',
    'Add Watermark': 'tools:addWatermark',
    'Header & Footer': 'tools:headerFooter',
    'Invert Colors': 'tools:invertColors',
    'Background Color': 'tools:backgroundColor',
    'Change Text Color': 'tools:changeTextColor',
    'Add Stamps': 'tools:addStamps',
    'Bates Numbering': 'tools:batesNumbering',
    'Remove Annotations': 'tools:removeAnnotations',
    'PDF Form Filler': 'tools:pdfFormFiller',
    'Create PDF Form': 'tools:createPdfForm',
    'Remove Blank Pages': 'tools:removeBlankPages',
    'Images to PDF': 'tools:imageToPdf',
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
    'PDF to CBZ': 'tools:pdfToCbz',
    'PDF to Greyscale': 'tools:pdfToGreyscale',
    'PDF to JSON': 'tools:pdfToJson',
    'OCR PDF': 'tools:ocrPdf',
    'Alternate & Mix Pages': 'tools:alternateMerge',
    'Duplex Collate': 'tools:duplexCollate',
    'PDF Overlay': 'tools:pdfOverlay',
    'Organize & Duplicate': 'tools:duplicateOrganize',
    'Add Attachments': 'tools:addAttachments',
    'Extract Attachments': 'tools:extractAttachments',
    'Edit Attachments': 'tools:editAttachments',
    'Divide Pages': 'tools:dividePages',
    'Add Blank Page': 'tools:addBlankPage',
    'Reverse Pages': 'tools:reversePages',
    'Rotate PDF': 'tools:rotatePdf',
    'Rotate by Custom Degrees': 'tools:rotateCustom',
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
    'Protect PDF': 'tools:protectPdf',
    'Unlock PDF': 'tools:unlockPdf',
    'Decrypt PDF': 'tools:decryptPdf',
    'Flatten PDF': 'tools:flattenPdf',
    'Remove Metadata': 'tools:removeMetadata',
    'Change Permissions': 'tools:changePermissions',
    'Email to PDF': 'tools:emailToPdf',
    'Font to Outline': 'tools:fontToOutline',
    'Deskew PDF': 'tools:deskewPdf',
    'Digital Signature': 'tools:digitalSignPdf',
    'Validate Signature': 'tools:validateSignaturePdf',
    'Timestamp PDF': 'tools:timestampPdf',
    'Scanner Effect': 'tools:scannerEffect',
    'Adjust Colors': 'tools:adjustColors',
    'Markdown to PDF': 'tools:markdownToPdf',
    'PDF Booklet': 'tools:pdfBooklet',
    'Word to PDF': 'tools:wordToPdf',
    'Excel to PDF': 'tools:excelToPdf',
    'PowerPoint to PDF': 'tools:powerpointToPdf',
    'XPS to PDF': 'tools:xpsToPdf',
    'MOBI to PDF': 'tools:mobiToPdf',
    'EPUB to PDF': 'tools:epubToPdf',
    'FB2 to PDF': 'tools:fb2ToPdf',
    'CBZ to PDF': 'tools:cbzToPdf',
    'WPD to PDF': 'tools:wpdToPdf',
    'WPS to PDF': 'tools:wpsToPdf',
    'XML to PDF': 'tools:xmlToPdf',
    'Pages to PDF': 'tools:pagesToPdf',
    'ODG to PDF': 'tools:odgToPdf',
    'ODS to PDF': 'tools:odsToPdf',
    'ODP to PDF': 'tools:odpToPdf',
    'PUB to PDF': 'tools:pubToPdf',
    'VSD to PDF': 'tools:vsdToPdf',
    'PSD to PDF': 'tools:psdToPdf',
    'ODT to PDF': 'tools:odtToPdf',
    'CSV to PDF': 'tools:csvToPdf',
    'RTF to PDF': 'tools:rtfToPdf',
    'PDF to SVG': 'tools:pdfToSvg',
    'PDF to CSV': 'tools:pdfToCsv',
    'PDF to Excel': 'tools:pdfToExcel',
    'PDF to Text': 'tools:pdfToText',
    'Extract Tables': 'tools:extractTables',
    'PDF to Word': 'tools:pdfToWord',
    'Extract Images': 'tools:extractImages',
    'PDF to Markdown': 'tools:pdfToMarkdown',
    'Prepare PDF for AI': 'tools:preparePdfForAi',
    'PDF OCG': 'tools:pdfOcg',
    'PDF to PDF/A': 'tools:pdfToPdfa',
    'Rasterize PDF': 'tools:rasterizePdf',
  };

  // Homepage-only workspace rendering (not used on individual tool pages)
  if (dom.toolGrid) {
    dom.toolGrid.textContent = '';

    const filteredCategories = categories
      .map((category) => ({
        ...category,
        tools: category.tools.filter((tool) => !isToolDisabled(tool.id)),
      }))
      .filter((category) => category.tools.length > 0);

    const availableTools = new Map<string, ToolCategory['tools'][number]>();
    filteredCategories.forEach((category) =>
      category.tools.forEach((tool) => {
        if (!availableTools.has(tool.id)) availableTools.set(tool.id, tool);
      })
    );

    type HomeTool = ToolCategory['tools'][number];
    type HomeCategoryId =
      | 'popular'
      | 'edit'
      | 'convert'
      | 'organize'
      | 'optimize'
      | 'secure'
      | 'favorites'
      | 'all';

    const homeCategoryDefinitions: Array<{
      id: HomeCategoryId;
      label: string;
      sourceNames: string[];
    }> = [
      {
        id: 'popular',
        label: 'الأدوات الشائعة',
        sourceNames: ['Popular Tools'],
      },
      { id: 'edit', label: 'تعديل وتعليق', sourceNames: ['Edit & Annotate'] },
      {
        id: 'convert',
        label: 'تحويل الملفات',
        sourceNames: ['Convert to PDF', 'Convert from PDF'],
      },
      {
        id: 'organize',
        label: 'تنظيم وإدارة',
        sourceNames: ['Organize & Manage'],
      },
      {
        id: 'optimize',
        label: 'تحسين وإصلاح',
        sourceNames: ['Optimize & Repair'],
      },
      { id: 'secure', label: 'حماية وأمان', sourceNames: ['Secure PDF'] },
      { id: 'favorites', label: 'المفضلة', sourceNames: [] },
      { id: 'all', label: 'كل الأدوات', sourceNames: [] },
    ];

    const sourceCategoryToHomeId = new Map<string, HomeCategoryId>([
      ['Popular Tools', 'popular'],
      ['Edit & Annotate', 'edit'],
      ['Convert to PDF', 'convert'],
      ['Convert from PDF', 'convert'],
      ['Organize & Manage', 'organize'],
      ['Optimize & Repair', 'optimize'],
      ['Secure PDF', 'secure'],
    ]);

    const homeCategoryByToolId = new Map<string, HomeCategoryId>();
    filteredCategories.forEach((category) => {
      const homeId = sourceCategoryToHomeId.get(category.name);
      if (!homeId) return;
      category.tools.forEach((tool) => {
        if (!homeCategoryByToolId.has(tool.id)) {
          homeCategoryByToolId.set(tool.id, homeId);
        }
      });
    });

    const uniqueCategoryTools = (sourceNames: string[]): HomeTool[] => {
      const seen = new Set<string>();
      const tools: HomeTool[] = [];
      filteredCategories
        .filter((category) => sourceNames.includes(category.name))
        .forEach((category) =>
          category.tools.forEach((tool) => {
            if (seen.has(tool.id)) return;
            seen.add(tool.id);
            tools.push(tool);
          })
        );
      return tools;
    };

    const toolsByHomeCategory = new Map<HomeCategoryId, HomeTool[]>();
    homeCategoryDefinitions.forEach((definition) => {
      if (definition.id === 'all') {
        toolsByHomeCategory.set('all', [...availableTools.values()]);
      } else if (definition.id !== 'favorites') {
        toolsByHomeCategory.set(
          definition.id,
          uniqueCategoryTools(definition.sourceNames)
        );
      }
    });

    let favoriteToolIds: string[] = [];
    let unavailableFavoriteIds: string[] = [];

    function loadFavorites() {
      let stored: unknown = [];
      try {
        stored = JSON.parse(getStoredItem('favoriteTools') || '[]');
      } catch {
        removeStoredItem('favoriteTools');
      }
      const ids = Array.isArray(stored)
        ? [
            ...new Set(
              stored.filter((id): id is string => typeof id === 'string')
            ),
          ]
        : [];
      favoriteToolIds = ids.filter((id) => availableTools.has(id));
      unavailableFavoriteIds = ids.filter((id) => !availableTools.has(id));
    }

    loadFavorites();

    function createFavoriteButton(toolId: string): HTMLButtonElement {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'tool-fav-btn';
      button.dataset.favId = toolId;
      button.appendChild(createStarIcon());
      updateFavoriteButton(button);
      return button;
    }

    function createStarIcon(): SVGSVGElement {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 256 256');
      svg.setAttribute('aria-hidden', 'true');
      for (const [kind, d] of FAVORITE_STAR_PATHS) {
        const path = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'path'
        );
        path.setAttribute('class', `tool-fav-${kind}`);
        path.setAttribute('d', d);
        svg.appendChild(path);
      }
      return svg;
    }

    const favoritesHint = document.createElement('div');
    favoritesHint.className = 'tool-fav-hint col-span-full';
    const favoritesHintText = document.createElement('span');
    const favoritesHintLabel = document.createElement('strong');
    favoritesHintLabel.className = 'tool-fav-hint-label';
    favoritesHintLabel.textContent = t('tools:favorites.hintLabel');
    favoritesHintText.append(
      favoritesHintLabel,
      document.createTextNode(` ${t('tools:favorites.hint')}`)
    );
    const favoritesHintClose = document.createElement('button');
    favoritesHintClose.type = 'button';
    favoritesHintClose.className = 'tool-fav-hint-close';
    favoritesHintClose.setAttribute(
      'aria-label',
      t('tools:favorites.hideHint')
    );
    const favoritesHintIcon = document.createElement('i');
    favoritesHintIcon.className = 'ph ph-x';
    favoritesHintIcon.setAttribute('aria-hidden', 'true');
    favoritesHintClose.appendChild(favoritesHintIcon);
    favoritesHint.append(favoritesHintText, favoritesHintClose);
    favoritesHintClose.addEventListener('click', () => {
      setStoredItem('favoritesHintHidden', 'true');
      favoritesHint.remove();
    });

    function updateFavoritesHint() {
      if (
        currentSearchQuery ||
        favoriteToolIds.length > 0 ||
        getStoredItem('favoritesHintHidden') === 'true'
      ) {
        favoritesHint.remove();
        return;
      }
      if (!favoritesHint.isConnected) {
        dom.toolGrid.insertBefore(favoritesHint, dom.toolGrid.firstChild);
      }
    }

    const favoriteMenu = document.createElement('div');
    favoriteMenu.className = 'tool-fav-menu';
    const favoriteMenuButton = document.createElement('button');
    favoriteMenuButton.type = 'button';
    favoriteMenuButton.className = 'tool-fav-menu-btn';
    const favoriteMenuLabel = document.createElement('span');
    favoriteMenuButton.append(createStarIcon(), favoriteMenuLabel);
    favoriteMenu.appendChild(favoriteMenuButton);
    let favoriteMenuStar: HTMLElement | null = null;

    function openFavoriteMenu(tile: HTMLElement) {
      const star = tile.querySelector<HTMLElement>('.tool-fav-btn');
      if (!star) return;
      favoriteMenuStar = star;
      const active = favoriteToolIds.includes(star.dataset.favId || '');
      favoriteMenuButton.classList.toggle('is-favorite', active);
      favoriteMenuLabel.textContent = active
        ? t('tools:favorites.remove')
        : t('tools:favorites.add');
      tile.appendChild(favoriteMenu);
      if (navigator.userActivation?.hasBeenActive) navigator.vibrate?.(10);
    }

    function closeFavoriteMenu() {
      favoriteMenu.remove();
      favoriteMenuStar = null;
    }

    favoriteMenuButton.addEventListener('click', (event) => {
      event.stopPropagation();
      const star = favoriteMenuStar;
      closeFavoriteMenu();
      if (star) toggleFavorite(star);
    });

    function updateFavoriteButton(button: HTMLElement) {
      const active = favoriteToolIds.includes(button.dataset.favId || '');
      button.classList.toggle('is-favorite', active);
      button.setAttribute('aria-pressed', String(active));
      const label = active
        ? t('tools:favorites.remove')
        : t('tools:favorites.add');
      button.setAttribute('aria-label', label);
      button.title = label;
    }

    function getHomeCategoryTools(categoryId: HomeCategoryId): HomeTool[] {
      if (categoryId === 'favorites') {
        return favoriteToolIds.flatMap((id) => {
          const tool = availableTools.get(id);
          return tool ? [tool] : [];
        });
      }
      return toolsByHomeCategory.get(categoryId) ?? [];
    }

    function updateCategoryCounts() {
      document
        .querySelectorAll<HTMLElement>('[data-category]')
        .forEach((button) => {
          const categoryId = button.dataset.category as HomeCategoryId;
          const count = button.querySelector('[data-category-count]');
          if (count) {
            count.textContent = String(getHomeCategoryTools(categoryId).length);
          }
          if (categoryId === 'favorites') {
            button.setAttribute(
              'aria-label',
              `${t('tools:categories.favorites')} (${favoriteToolIds.length})`
            );
          }
        });
    }

    function renderFavorites() {
      updateCategoryCounts();
      document
        .querySelectorAll<HTMLElement>('.tool-fav-btn')
        .forEach(updateFavoriteButton);
      if (activeCategory === 'favorites' && !currentSearchQuery) {
        renderCurrentCollection();
      }
    }

    function toggleFavorite(button: HTMLElement) {
      const toolId = button.dataset.favId;
      const tool = toolId ? availableTools.get(toolId) : undefined;
      if (!toolId || !tool) return;
      const adding = !favoriteToolIds.includes(toolId);
      favoriteToolIds = adding
        ? [...favoriteToolIds, toolId]
        : favoriteToolIds.filter((id) => id !== toolId);
      setStoredItem(
        'favoriteTools',
        JSON.stringify([...favoriteToolIds, ...unavailableFavoriteIds])
      );

      const wasInFavoritesView =
        activeCategory === 'favorites' && !currentSearchQuery;
      const tile = button.closest<HTMLElement>('.tool-tile');
      const neighbor =
        tile?.nextElementSibling?.querySelector<HTMLElement>(
          '.tool-fav-btn, .tool-card'
        ) ??
        tile?.previousElementSibling?.querySelector<HTMLElement>(
          '.tool-fav-btn, .tool-card'
        ) ??
        null;
      const keyboardFocus = button.matches(':focus-visible');

      updateCategoryCounts();
      dom.toolGrid
        .querySelectorAll<HTMLElement>('.tool-fav-btn')
        .forEach((other) => {
          if (other.dataset.favId === toolId) updateFavoriteButton(other);
        });
      updateFavoritesHint();

      if (wasInFavoritesView) {
        renderCurrentCollection();
        if (!adding && keyboardFocus) neighbor?.focus();
      }
    }

    const lucideIconByPhosphor: Record<string, string> = {
      archive: 'archive',
      'arrow-clockwise': 'rotate-cw',
      'arrows-clockwise': 'refresh-cw',
      'arrows-out-line-vertical': 'move-vertical',
      'arrows-vertical': 'move-vertical',
      barcode: 'barcode',
      'book-bookmark': 'book-marked',
      'book-open': 'book-open',
      'book-open-text': 'book-open',
      bookmark: 'bookmark',
      broom: 'brush',
      browsers: 'layers',
      certificate: 'badge-check',
      'circle-half': 'contrast',
      clock: 'clock',
      columns: 'layout-grid',
      crop: 'crop',
      'cursor-text': 'type',
      'device-mobile': 'smartphone',
      download: 'download',
      'download-simple': 'download',
      drop: 'droplet',
      envelope: 'mail',
      eraser: 'eraser',
      eyedropper: 'pipette',
      file: 'file',
      'file-code': 'file-code',
      'file-csv': 'file-spreadsheet',
      'file-image': 'file-image',
      'file-jpg': 'file-image',
      'file-minus': 'file-minus',
      'file-plus': 'file-plus',
      'file-png': 'file-image',
      'file-svg': 'file-image',
      'file-text': 'file-text',
      'file-x': 'file-x',
      'file-zip': 'file-archive',
      files: 'files',
      gauge: 'gauge',
      'git-branch': 'git-branch',
      'git-diff': 'arrow-left-right',
      hash: 'hash',
      image: 'image',
      images: 'images',
      info: 'info',
      lightning: 'zap',
      'link-break': 'unlink',
      list: 'list',
      'list-numbers': 'list-ordered',
      lock: 'lock',
      'lock-open': 'key-round',
      'markdown-logo': 'file-code',
      'microsoft-excel-logo': 'file-spreadsheet',
      'microsoft-powerpoint-logo': 'presentation',
      'microsoft-word-logo': 'file-text',
      notepad: 'notebook',
      palette: 'palette',
      paperclip: 'paperclip',
      'paperclip-horizontal': 'paperclip',
      paragraph: 'pilcrow',
      'pen-nib': 'pen-tool',
      'pencil-line': 'pen-line',
      'pencil-ruler': 'pencil-ruler',
      'pencil-simple': 'pencil',
      perspective: 'scan',
      presentation: 'presentation',
      ruler: 'ruler',
      scan: 'scan',
      scissors: 'scissors',
      'seal-check': 'badge-check',
      'shield-check': 'shield-check',
      shuffle: 'shuffle',
      'sliders-horizontal': 'sliders-horizontal',
      'sort-descending': 'list-ordered',
      sparkle: 'sparkles',
      'squares-four': 'layout-grid',
      stack: 'layers',
      'stack-simple': 'layers',
      stamp: 'stamp',
      table: 'table',
      'text-aa': 'type',
      'text-outdent': 'type',
      'text-t': 'type',
      trash: 'trash-2',
      'tree-structure': 'workflow',
      wrench: 'wrench',
    };

    const homeCategoryAccent: Record<HomeCategoryId, string> = {
      popular: 'teal',
      edit: 'plum',
      convert: 'blue',
      organize: 'slate',
      optimize: 'amber',
      secure: 'rose',
      favorites: 'amber',
      all: 'teal',
    };

    const homeCategoryLabel = (categoryId: HomeCategoryId): string =>
      homeCategoryDefinitions.find((definition) => definition.id === categoryId)
        ?.label ?? 'الأدوات';

    function getToolDisplay(tool: HomeTool) {
      const toolKey = toolTranslationKeys[tool.name];
      return {
        name: toolKey ? t(`${toolKey}.name`) : tool.name,
        subtitle: toolKey ? t(`${toolKey}.subtitle`) : tool.subtitle,
      };
    }

    function createToolTile(tool: HomeTool) {
      const tile = document.createElement('div');
      tile.className = 'tool-tile px-tool-tile';
      const categoryId = homeCategoryByToolId.get(tool.id) ?? activeCategory;
      tile.dataset.category = categoryId;

      const toolCard = document.createElement('a');
      toolCard.href = tool.href;
      toolCard.className = 'tool-card px-tool-card';
      toolCard.dataset.accent = homeCategoryAccent[categoryId];
      toolCard.setAttribute(
        'aria-label',
        `${getToolDisplay(tool).name}: ${getToolDisplay(tool).subtitle}`
      );

      const top = document.createElement('div');
      top.className = 'px-tool-top';
      const iconWrap = document.createElement('span');
      iconWrap.className = 'px-tool-icon';
      iconWrap.setAttribute('aria-hidden', 'true');
      const icon = document.createElement('i');
      const phosphorName = tool.icon.replace(/^ph-/, '');
      icon.setAttribute(
        'data-lucide',
        lucideIconByPhosphor[phosphorName] ?? 'file-text'
      );
      icon.dataset.phIcon = tool.icon;
      iconWrap.appendChild(icon);
      top.appendChild(iconWrap);

      const display = getToolDisplay(tool);
      const toolName = document.createElement('h3');
      toolName.textContent = display.name;

      const toolSubtitle = document.createElement('p');
      toolSubtitle.textContent = display.subtitle;

      const foot = document.createElement('div');
      foot.className = 'px-tool-foot';
      const categoryLabel = document.createElement('span');
      categoryLabel.className = 'px-tool-category';
      categoryLabel.textContent = homeCategoryLabel(categoryId);
      const arrow = document.createElement('span');
      arrow.className = 'px-tool-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      const arrowIcon = document.createElement('i');
      arrowIcon.setAttribute('data-lucide', 'arrow-left');
      arrow.appendChild(arrowIcon);
      foot.append(categoryLabel, arrow);

      toolCard.append(top, toolName, toolSubtitle, foot);
      tile.append(toolCard, createFavoriteButton(tool.id));
      return tile;
    }

    const normalizeSearchText = (value: string): string =>
      value
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u064B-\u065F\u0670]/g, '')
        .replace(/[إأآ]/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/ى/g, 'ي')
        .replace(/[ؤئ]/g, 'ي')
        .replace(/ـ/g, '')
        .replace(/[^a-z0-9\u0600-\u06FF]+/g, ' ')
        .trim();

    const searchAliasesByToolId: Record<string, string[]> = {
      'merge-pdf': ['دمج', 'ضم', 'جمع', 'combine', 'join'],
      'split-pdf': ['تقسيم', 'فصل', 'استخراج صفحات', 'extract pages'],
      'compress-pdf': ['ضغط', 'تصغير', 'حجم', 'تقليل الحجم', 'shrink'],
      'edit-pdf': ['تحرير', 'تعديل', 'تعليق', 'annotate'],
      'edit-pdf-text': ['تحرير النص', 'تعديل النص', 'نص', 'text'],
      'organize-pdf': ['تنظيم', 'ترتيب', 'صفحات', 'organize'],
      'pdf-multi-tool': ['تنظيم', 'دمج', 'تقسيم', 'حذف', 'تدوير'],
      'pdf-workflow': ['سير عمل', 'أتمتة', 'workflow', 'pipeline'],
      'protect-pdf': ['حماية', 'تشفير', 'قفل', 'كلمة مرور', 'password'],
      'unlock-pdf': ['فتح', 'فك قفل', 'إزالة كلمة المرور', 'unlock'],
      'encrypt-pdf': ['تشفير', 'حماية', 'encrypt'],
      'decrypt-pdf': ['فك تشفير', 'فتح', 'decrypt'],
      'rotate-pdf': ['تدوير', 'قلب', 'rotate'],
      'crop-pdf': ['قص', 'هوامش', 'crop'],
      'extract-pages': ['استخراج', 'صفحات', 'extract'],
      'delete-pages': ['حذف', 'إزالة صفحات', 'delete'],
      'sign-pdf': ['توقيع', 'إمضاء', 'sign'],
      'add-watermark': ['علامة مائية', 'ختم', 'watermark'],
      'ocr-pdf': ['تعرف ضوئي', 'نص قابل للبحث', 'ocr'],
      'repair-pdf': ['إصلاح', 'تالف', 'repair'],
      'remove-metadata': ['بيانات وصفية', 'خصوصية', 'metadata'],
      'view-metadata': ['بيانات وصفية', 'خصائص', 'metadata'],
      'edit-metadata': ['بيانات وصفية', 'عنوان', 'مؤلف', 'metadata'],
    };

    function getSearchAliases(tool: HomeTool): string[] {
      const aliases = new Set(searchAliasesByToolId[tool.id] ?? []);
      if (tool.id.includes('-to-pdf')) aliases.add('تحويل إلى PDF');
      if (tool.id.startsWith('pdf-to-')) aliases.add('تحويل من PDF');
      if (tool.id.includes('page')) aliases.add('صفحات');
      if (tool.id.includes('image')) aliases.add('صور');
      if (tool.id.includes('rotate')) aliases.add('تدوير');
      if (tool.id.includes('sign')) aliases.add('توقيع');
      if (tool.id.includes('metadata')) aliases.add('بيانات وصفية');
      return [...aliases];
    }

    type ToolSearchEntry = {
      tool: HomeTool;
      name: string;
      subtitle: string;
      combined: string;
    };

    const toolSearchIndex: ToolSearchEntry[] = [...availableTools.values()].map(
      (tool) => {
        const display = getToolDisplay(tool);
        const name = normalizeSearchText(
          `${display.name} ${tool.name} ${tool.id.replace(/-/g, ' ')}`
        );
        const subtitle = normalizeSearchText(
          `${display.subtitle} ${tool.subtitle}`
        );
        const aliases = normalizeSearchText(getSearchAliases(tool).join(' '));
        return {
          tool,
          name,
          subtitle,
          combined: `${name} ${subtitle} ${aliases}`,
        };
      }
    );

    function searchTools(query: string): HomeTool[] {
      const normalizedQuery = normalizeSearchText(query);
      if (!normalizedQuery) return [];
      const tokens = normalizedQuery.split(' ').filter(Boolean);
      return toolSearchIndex
        .map((entry) => {
          if (!tokens.every((token) => entry.combined.includes(token))) {
            return null;
          }
          let score = 1;
          if (entry.name === normalizedQuery) score += 100;
          if (entry.name.startsWith(normalizedQuery)) score += 45;
          if (entry.name.includes(normalizedQuery)) score += 30;
          if (entry.subtitle.includes(normalizedQuery)) score += 8;
          return { tool: entry.tool, score };
        })
        .filter(
          (result): result is { tool: HomeTool; score: number } =>
            result !== null
        )
        .sort((a, b) => b.score - a.score)
        .map((result) => result.tool);
    }

    const searchBar = document.getElementById(
      'search-bar'
    ) as HTMLInputElement | null;
    const clearSearchButton = document.getElementById('clear-search-btn');
    const searchStatus = document.getElementById('search-status');
    const collectionTitle = document.getElementById('collection-title');
    const collectionCount = document.getElementById('collection-count');
    const toolEmpty = document.getElementById('tool-empty');
    const toolEmptyTitle = document.getElementById('tool-empty-title');
    const toolEmptyMessage = document.getElementById('tool-empty-message');
    const categoryButtons = [
      ...document.querySelectorAll<HTMLElement>('[data-category]'),
    ].filter((button) => button.closest('#category-nav'));

    let currentSearchQuery = '';
    const categoryFromHash = window.location.hash.match(
      /tools-(popular|edit|convert|organize|optimize|secure|favorites|all)/
    )?.[1] as HomeCategoryId | undefined;
    let activeCategory: HomeCategoryId =
      categoryFromHash ??
      ((getStoredItem('pixelpdf-home-category') as HomeCategoryId | null) ||
        'popular');
    if (!homeCategoryDefinitions.some((item) => item.id === activeCategory)) {
      activeCategory = 'popular';
    }

    function fixUnresolvedToolIcons() {
      dom.toolGrid
        .querySelectorAll<HTMLElement>('i[data-lucide][data-ph-icon]')
        .forEach((icon) => {
          icon.className = `ph ${icon.dataset.phIcon ?? 'ph-file'}`;
          icon.removeAttribute('data-lucide');
        });
    }

    function renderToolTiles(tools: HomeTool[]) {
      closeFavoriteMenu();
      dom.toolGrid.textContent = '';
      const fragment = document.createDocumentFragment();
      tools.forEach((tool) => fragment.appendChild(createToolTile(tool)));
      dom.toolGrid.appendChild(fragment);
      createIcons({ icons });
      fixUnresolvedToolIcons();
      updateFavoritesHint();
      if (toolEmpty) toolEmpty.hidden = tools.length > 0;
    }

    function updateCollectionHeader(title: string, count: number) {
      if (collectionTitle) collectionTitle.textContent = title;
      if (collectionCount) {
        collectionCount.textContent =
          count === 0
            ? trText('لا توجد أدوات')
            : count === 1
              ? trText('أداة واحدة')
              : trText('{{count}} أداة', { count });
      }
      if (searchStatus) {
        searchStatus.textContent = currentSearchQuery
          ? count > 0
            ? trText('وجدنا {{count}} أداة مطابقة لبحثك.', { count })
            : trText(
                'لا توجد نتائج مطابقة. جرّب كلمة أبسط بالعربية أو الإنجليزية.'
              )
          : '';
      }
    }

    function renderCurrentCollection() {
      categoryButtons.forEach((button) => {
        button.setAttribute(
          'aria-pressed',
          String(button.dataset.category === activeCategory)
        );
      });
      updateCategoryCounts();

      if (currentSearchQuery) {
        const results = searchTools(currentSearchQuery);
        renderToolTiles(results);
        updateCollectionHeader(trText('نتائج البحث'), results.length);
        if (toolEmptyTitle)
          toolEmptyTitle.textContent = trText('لا توجد أدوات مطابقة');
        if (toolEmptyMessage) {
          toolEmptyMessage.textContent = trText(
            'جرّب كلمة عربية أو إنجليزية أبسط، مثل: دمج، تقسيم، ضغط، تحويل، merge أو split.'
          );
        }
        return;
      }

      const tools = getHomeCategoryTools(activeCategory);
      renderToolTiles(tools);
      updateCollectionHeader(homeCategoryLabel(activeCategory), tools.length);
      if (activeCategory === 'favorites' && tools.length === 0) {
        if (toolEmptyTitle)
          toolEmptyTitle.textContent = trText('لا توجد أدوات مفضلة بعد');
        if (toolEmptyMessage) {
          toolEmptyMessage.textContent = trText(
            'اضغط على النجمة في أي بطاقة لإضافتها هنا والوصول إليها بسرعة.'
          );
        }
      } else {
        if (toolEmptyTitle)
          toolEmptyTitle.textContent = trText('لا توجد أدوات مطابقة');
        if (toolEmptyMessage) {
          toolEmptyMessage.textContent = trText(
            'جرّب تصنيفًا آخر أو استخدم البحث للعثور على الأداة.'
          );
        }
      }
    }

    function setActiveCategory(
      categoryId: HomeCategoryId,
      options: { scroll?: boolean; replaceHash?: boolean } = {}
    ) {
      if (!homeCategoryDefinitions.some((item) => item.id === categoryId))
        return;
      activeCategory = categoryId;
      setStoredItem('pixelpdf-home-category', categoryId);
      if (currentSearchQuery) {
        currentSearchQuery = '';
        if (searchBar) searchBar.value = '';
        clearSearchButton?.toggleAttribute('hidden', true);
      }
      renderCurrentCollection();
      if (options.replaceHash !== false) {
        window.history.replaceState(null, '', `#tools-${categoryId}`);
      }
      if (options.scroll) {
        document
          .getElementById('app')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    categoryButtons.forEach((button) => {
      button.addEventListener('click', () => {
        setActiveCategory(button.dataset.category as HomeCategoryId);
      });
    });

    document
      .querySelectorAll<HTMLElement>('[data-home-category]')
      .forEach((link) => {
        link.addEventListener('click', (event) => {
          const categoryId = link.dataset.homeCategory as
            | HomeCategoryId
            | undefined;
          if (!categoryId) return;
          event.preventDefault();
          setActiveCategory(categoryId, { scroll: true });
        });
      });

    document.querySelectorAll<HTMLElement>('[data-tool-id]').forEach((card) => {
      const tool = availableTools.get(card.dataset.toolId ?? '');
      if (!tool) {
        card.style.display = 'none';
        return;
      }
      if (card instanceof HTMLAnchorElement) card.href = tool.href;
    });

    if (searchBar) {
      searchBar.addEventListener('input', () => {
        currentSearchQuery = searchBar.value.trim();
        clearSearchButton?.toggleAttribute('hidden', !currentSearchQuery);
        renderCurrentCollection();
      });
      searchBar.addEventListener('search', () => {
        currentSearchQuery = searchBar.value.trim();
        clearSearchButton?.toggleAttribute('hidden', !currentSearchQuery);
        renderCurrentCollection();
      });
    }

    clearSearchButton?.addEventListener('click', () => {
      currentSearchQuery = '';
      if (searchBar) {
        searchBar.value = '';
        searchBar.focus();
      }
      clearSearchButton.toggleAttribute('hidden', true);
      renderCurrentCollection();
    });

    document
      .getElementById('tool-empty-reset')
      ?.addEventListener('click', () => {
        currentSearchQuery = '';
        if (searchBar) searchBar.value = '';
        clearSearchButton?.toggleAttribute('hidden', true);
        setActiveCategory('popular', { scroll: false });
      });

    dom.toolGrid.addEventListener('click', (event) => {
      const card = (event.target as Element).closest<HTMLAnchorElement>(
        'a.px-tool-card'
      );
      if (!card || (event.target as Element).closest('.tool-fav-btn')) return;
      card.classList.add('is-loading');
      card.setAttribute('aria-busy', 'true');
    });

    // Homepage PDF handoff: the file stays in IndexedDB on this device only.
    const homeFileInput = document.getElementById(
      'home-file-input'
    ) as HTMLInputElement | null;
    const homeDropZone = document.getElementById('home-drop-zone');
    const homeFilePanel = document.getElementById('home-file-panel');
    const homeFileName = document.getElementById('home-file-name');
    const homeFileDetails = document.getElementById('home-file-details');
    const homeFileActions = document.getElementById('home-file-actions');
    const homeFileMessage = document.getElementById('home-file-message');
    const homeFileStatus = document.getElementById('home-file-status');
    const homeFileClear = document.getElementById('home-file-clear');

    const homeActionDefinitions: Array<{
      id: string;
      label: string;
      icon: string;
    }> = [
      { id: 'merge-pdf', label: 'دمج', icon: 'combine' },
      { id: 'split-pdf', label: 'تقسيم', icon: 'scissors' },
      { id: 'compress-pdf', label: 'ضغط', icon: 'minimize-2' },
      { id: 'edit-pdf', label: 'تحرير', icon: 'pen-tool' },
      { id: 'organize-pdf', label: 'تنظيم', icon: 'layout-grid' },
      { id: 'protect-pdf', label: 'حماية', icon: 'lock' },
    ];

    const setHomeFileMessage = (
      message: string,
      tone: '' | 'error' | 'success'
    ) => {
      if (!homeFileMessage) return;
      homeFileMessage.textContent = message;
      homeFileMessage.className = `px-upload-message${tone ? ` is-${tone}` : ''}`;
    };

    const renderHomeFile = (
      file: File,
      pageCount: number | undefined,
      stored: boolean
    ) => {
      if (homeFilePanel) homeFilePanel.hidden = false;
      if (homeFileName) homeFileName.textContent = file.name;
      if (homeFileDetails) {
        const details = [
          pageCount ? `${pageCount} صفحة` : 'ملف PDF جاهز',
          formatBytes(file.size),
          stored ? 'محفوظ مؤقتًا على جهازك' : 'جاهز للفتح داخل الأداة',
        ];
        homeFileDetails.textContent = details.join(' • ');
      }
      if (homeFileStatus) {
        homeFileStatus.textContent = trText('جاهز');
        homeFileStatus.className = 'px-upload-status is-ready';
      }
      if (homeFileActions) {
        homeFileActions.textContent = '';
        homeActionDefinitions.forEach((definition) => {
          const tool = availableTools.get(definition.id);
          if (!tool) return;
          const link = document.createElement('a');
          link.href = stored ? `${tool.href}?from=home` : tool.href;
          link.setAttribute(
            'aria-label',
            `${definition.label}: ${getToolDisplay(tool).name}`
          );
          const icon = document.createElement('i');
          icon.setAttribute('data-lucide', definition.icon);
          icon.setAttribute('aria-hidden', 'true');
          link.append(icon, document.createTextNode(definition.label));
          homeFileActions.appendChild(link);
        });
        createIcons({ icons });
      }
    };

    const resetHomeFile = () => {
      if (homeFileInput) homeFileInput.value = '';
      if (homeFilePanel) homeFilePanel.hidden = true;
      if (homeFileStatus) {
        homeFileStatus.textContent = trText('بانتظار ملف');
        homeFileStatus.className = 'px-upload-status';
      }
    };

    const handleHomeFile = async (file: File | undefined) => {
      if (!file) return;
      const isPdf =
        file.type === 'application/pdf' ||
        file.name.toLowerCase().endsWith('.pdf');
      if (!isPdf || file.size === 0) {
        resetHomeFile();
        if (homeFileStatus) {
          homeFileStatus.textContent = trText('ملف غير صالح');
          homeFileStatus.className = 'px-upload-status is-error';
        }
        setHomeFileMessage(
          trText('اختر ملف PDF صالحًا. لم يتم رفع أي ملف إلى خادم.'),
          'error'
        );
        return;
      }

      if (homeFileStatus) {
        homeFileStatus.textContent = trText('جارٍ فحص الملف');
        homeFileStatus.className = 'px-upload-status';
      }
      setHomeFileMessage(trText('جارٍ قراءة الملف والتحقق من صفحاته...'), '');

      try {
        const data = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data }).promise;
        const pageCount = pdf.numPages;
        await pdf.destroy();
        const stored = await saveHomePdf(file);
        renderHomeFile(file, pageCount, stored);
        setHomeFileMessage(
          stored
            ? trText(
                'تم تجهيز الملف. اختر عملية، وسنضيفه تلقائيًا داخل الأداة.'
              )
            : trText(
                'تم تجهيز الملف. قد تحتاج إلى اختياره مرة أخرى داخل الأداة لأن المتصفح منع الحفظ المؤقت.'
              ),
          'success'
        );
      } catch {
        resetHomeFile();
        if (homeFileStatus) {
          homeFileStatus.textContent = trText('تعذر قراءة الملف');
          homeFileStatus.className = 'px-upload-status is-error';
        }
        setHomeFileMessage(
          trText(
            'لم نتمكن من قراءة هذا الملف. تأكد أنه PDF غير تالف، أو جرّب أداة إصلاح PDF من قائمة الأدوات.'
          ),
          'error'
        );
      }
    };

    homeFileInput?.addEventListener('change', () => {
      void handleHomeFile(homeFileInput.files?.[0]);
    });

    if (homeDropZone) {
      ['dragenter', 'dragover'].forEach((eventName) => {
        homeDropZone.addEventListener(eventName, (event) => {
          event.preventDefault();
          homeDropZone.classList.add('is-dragging');
        });
      });
      ['dragleave', 'drop'].forEach((eventName) => {
        homeDropZone.addEventListener(eventName, (event) => {
          event.preventDefault();
          homeDropZone.classList.remove('is-dragging');
        });
      });
      homeDropZone.addEventListener('drop', (event) => {
        const file = (event as DragEvent).dataTransfer?.files?.[0];
        void handleHomeFile(file);
      });
    }

    homeFileClear?.addEventListener('click', async () => {
      await deleteHomePdf();
      resetHomeFile();
      setHomeFileMessage(
        trText('تمت إزالة الملف المؤقت من هذا الجهاز.'),
        'success'
      );
    });

    void loadHomePdf().then((file) => {
      if (file && homeFilePanel?.hidden) {
        renderHomeFile(file, undefined, true);
        setHomeFileMessage(
          trText(
            'استعدنا ملفك المؤقت من هذه الجلسة. يمكنك المتابعة أو إزالته.'
          ),
          'success'
        );
      }
    });

    renderCurrentCollection();
    updateFavoritesHint();

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

    dom.toolGrid.addEventListener('click', (event) => {
      // All tools now use href and navigate directly - no modal handling needed
      const favoriteButton = (event.target as Element).closest<HTMLElement>(
        '.tool-fav-btn'
      );
      if (favoriteButton) toggleFavorite(favoriteButton);
    });

    let pressTimer = 0;
    let pressStart: { x: number; y: number } | null = null;
    let suppressClick = false;
    const touchOnly = window.matchMedia('(hover: none)');

    function cancelPress() {
      window.clearTimeout(pressTimer);
      pressStart = null;
    }

    function pressedTile(target: EventTarget | null): HTMLElement | null {
      const element = target instanceof Element ? target : null;
      if (!element || element.closest('.tool-fav-btn, .tool-fav-menu')) {
        return null;
      }
      return element.closest<HTMLElement>('.tool-tile');
    }

    dom.toolGrid.addEventListener('pointerdown', (event) => {
      suppressClick = false;
      if (event.pointerType !== 'touch' || !touchOnly.matches) return;
      const tile = pressedTile(event.target);
      if (!tile) return;
      pressStart = { x: event.clientX, y: event.clientY };
      pressTimer = window.setTimeout(() => {
        pressStart = null;
        suppressClick = true;
        openFavoriteMenu(tile);
      }, 500);
    });

    dom.toolGrid.addEventListener('pointermove', (event) => {
      if (
        pressStart &&
        Math.hypot(event.clientX - pressStart.x, event.clientY - pressStart.y) >
          10
      ) {
        cancelPress();
      }
    });

    dom.toolGrid.addEventListener('pointerup', cancelPress);
    dom.toolGrid.addEventListener('pointercancel', cancelPress);

    dom.toolGrid.addEventListener('contextmenu', (event) => {
      if (!touchOnly.matches) return;
      const tile = pressedTile(event.target);
      if (!tile) return;
      event.preventDefault();
      cancelPress();
      if (!tile.contains(favoriteMenu)) {
        suppressClick = true;
        openFavoriteMenu(tile);
      }
    });

    dom.toolGrid.addEventListener(
      'click',
      (event) => {
        if (!suppressClick) return;
        suppressClick = false;
        event.preventDefault();
        event.stopPropagation();
      },
      true
    );

    document.addEventListener('pointerdown', (event) => {
      if (
        favoriteMenu.isConnected &&
        !(event.target instanceof Node && favoriteMenu.contains(event.target))
      ) {
        closeFavoriteMenu();
      }
    });
    window.addEventListener('scroll', closeFavoriteMenu, { passive: true });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeFavoriteMenu();
    });

    window.addEventListener('storage', (event) => {
      if (
        event.key !== null &&
        event.key !== 'favoriteTools' &&
        event.key !== 'favoritesHintHidden'
      ) {
        return;
      }
      closeFavoriteMenu();
      loadFavorites();
      dom.toolGrid.querySelector(':scope > .is-cat-favorites')?.remove();
      renderFavorites();
      dom.toolGrid
        .querySelectorAll<HTMLElement>('.tool-fav-btn')
        .forEach(updateFavoriteButton);
      updateFavoritesHint();
    });
  }

  if (dom.backToGridBtn) {
    dom.backToGridBtn.addEventListener('click', () => switchView('grid'));
  }

  if (dom.alertOkBtn) {
    dom.alertOkBtn.addEventListener('click', hideAlert);
  }

  const faqDetails =
    document.querySelectorAll<HTMLDetailsElement>('details.faq-d');
  if (
    faqDetails.length > 0 &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    faqDetails.forEach((detail) => {
      const summary = detail.querySelector('summary');
      const body = detail.querySelector<HTMLElement>('.faq-d-a');
      if (!summary || !body) return;

      let animation: Animation | null = null;

      summary.addEventListener('click', (event) => {
        event.preventDefault();
        animation?.cancel();

        const wasOpen = detail.open;
        if (!wasOpen) detail.open = true;

        const fullHeight = `${body.scrollHeight}px`;
        const fullPadding = window.getComputedStyle(body).paddingBottom;
        const collapsed = { height: '0px', paddingBottom: '0px', opacity: 0 };
        const expanded = {
          height: fullHeight,
          paddingBottom: fullPadding,
          opacity: 1,
        };

        body.style.overflow = 'hidden';
        animation = body.animate(
          wasOpen ? [expanded, collapsed] : [collapsed, expanded],
          { duration: 280, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)' }
        );
        animation.onfinish = () => {
          if (wasOpen) detail.open = false;
          body.style.overflow = '';
          animation = null;
        };
      });
    });
  }

  createIcons({ icons });
  console.log('Please share our tool and share the love!');

  const githubStarsElements = [
    document.getElementById('github-stars-desktop'),
    document.getElementById('github-stars-mobile'),
  ];

  if (
    githubStarsElements.some((el) => el) &&
    !__SIMPLE_MODE__ &&
    !__DISABLE_GITHUB_STARS__
  ) {
    fetch('https://api.github.com/repos/mohammedalhinaki-cloud/Pixel-PDF')
      .then((response) => response.json())
      .then((data) => {
        if (data.stargazers_count !== undefined) {
          const formattedStars = formatStars(data.stargazers_count);
          githubStarsElements.forEach((el) => {
            if (el) el.textContent = formattedStars;
          });
        }
      })
      .catch(() => {
        githubStarsElements.forEach((el) => {
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
  const preferencesTabContent = document.getElementById(
    'preferences-tab-content'
  );
  const shortcutsTabFooter = document.getElementById('shortcuts-tab-footer');
  const preferencesTabFooter = document.getElementById(
    'preferences-tab-footer'
  );
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
  const fullWidthToggle = document.getElementById(
    'full-width-toggle'
  ) as HTMLInputElement;
  const toolInterface = document.getElementById('tool-interface');

  const savedFullWidth = getStoredItem('fullWidthMode') !== 'false';
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
    const pageUploaders = document.querySelectorAll(
      '#tool-uploader, #signature-editor'
    );
    pageUploaders.forEach((uploader) => {
      if (enabled) {
        uploader.classList.remove('max-w-2xl', 'max-w-5xl');
      } else {
        // Restore original max-width (most are max-w-2xl, add-stamps is max-w-5xl)
        if (
          !uploader.classList.contains('max-w-2xl') &&
          !uploader.classList.contains('max-w-5xl')
        ) {
          uploader.classList.add('max-w-2xl');
        }
      }
    });
  }

  if (fullWidthToggle) {
    fullWidthToggle.addEventListener('change', (e) => {
      const enabled = (e.target as HTMLInputElement).checked;
      setStoredItem('fullWidthMode', enabled.toString());
      applyFullWidthMode(enabled);
    });
  }

  const compactModeToggle = document.getElementById(
    'compact-mode-toggle'
  ) as HTMLInputElement;

  const savedCompactMode = getStoredItem('compactMode') === 'true';
  if (compactModeToggle) {
    compactModeToggle.checked = savedCompactMode;
  }
  applyCompactMode(savedCompactMode);

  function applyCompactMode(enabled: boolean) {
    if (dom.toolGrid) {
      dom.toolGrid.classList.toggle('compact-mode', enabled);
    }
  }

  if (compactModeToggle) {
    compactModeToggle.addEventListener('change', (e) => {
      const enabled = (e.target as HTMLInputElement).checked;
      setStoredItem('compactMode', enabled.toString());
      applyCompactMode(enabled);
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
  const RESERVED_SHORTCUTS: Record<string, { mac?: string; windows?: string }> =
    {
      'mod+w': { mac: trText('يغلق التبويب'), windows: trText('يغلق التبويب') },
      'mod+t': {
        mac: trText('يفتح تبويبًا جديدًا'),
        windows: trText('يفتح تبويبًا جديدًا'),
      },
      'mod+n': {
        mac: trText('يفتح نافذة جديدة'),
        windows: trText('يفتح نافذة جديدة'),
      },
      'mod+shift+n': {
        mac: trText('يفتح نافذة التصفح المتخفي'),
        windows: trText('يفتح نافذة التصفح المتخفي'),
      },
      'mod+q': { mac: trText('يغلق التطبيق (لا يمكن تجاوزه)') },
      'mod+m': { mac: trText('يصغّر النافذة') },
      'mod+h': { mac: trText('يخفي النافذة') },
      'mod+r': {
        mac: trText('يعيد تحميل الصفحة'),
        windows: trText('يعيد تحميل الصفحة'),
      },
      'mod+shift+r': {
        mac: trText('يعيد تحميل الصفحة بالكامل'),
        windows: trText('يعيد تحميل الصفحة بالكامل'),
      },
      'mod+l': {
        mac: trText('يركّز على شريط العنوان'),
        windows: trText('يركّز على شريط العنوان'),
      },
      'mod+d': {
        mac: trText('صفحة الإشارات المرجعية'),
        windows: trText('صفحة الإشارات المرجعية'),
      },
      'mod+shift+t': {
        mac: trText('يعيد فتح التبويب المغلق'),
        windows: trText('يعيد فتح التبويب المغلق'),
      },
      'mod+shift+w': {
        mac: trText('يغلق النافذة'),
        windows: trText('يغلق النافذة'),
      },
      'mod+tab': {
        mac: trText('يبدّل بين التبويبات'),
        windows: trText('يبدّل بين التطبيقات'),
      },
      'alt+f4': { windows: trText('يغلق النافذة') },
      'ctrl+tab': {
        mac: trText('يبدّل بين التبويبات'),
        windows: trText('يبدّل بين التبويبات'),
      },
    };

  function getReservedShortcutWarning(
    combo: string,
    isMac: boolean
  ): string | null {
    const reserved = RESERVED_SHORTCUTS[combo];
    if (!reserved) return null;

    const description = isMac ? reserved.mac : reserved.windows;
    if (!description) return null;

    return description;
  }

  function showWarningModal(
    title: string,
    message: string,
    confirmMode: boolean = true
  ): Promise<boolean> {
    return new Promise((resolve) => {
      if (
        !dom.warningModal ||
        !dom.warningTitle ||
        !dom.warningMessage ||
        !dom.warningCancelBtn ||
        !dom.warningConfirmBtn
      ) {
        resolve(confirmMode ? confirm(message) : (alert(message), true));
        return;
      }

      dom.warningTitle.textContent = title;
      dom.warningMessage.innerHTML = sanitizeTranslationHtml(message);
      dom.warningModal.classList.remove('hidden');
      dom.warningModal.classList.add('flex');

      if (confirmMode) {
        dom.warningCancelBtn.style.display = '';
        dom.warningConfirmBtn.textContent = t('warning.proceed');
      } else {
        dom.warningCancelBtn.style.display = 'none';
        dom.warningConfirmBtn.textContent = t('alert.ok');
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
      dom.warningModal.addEventListener(
        'click',
        (e) => {
          if (e.target === dom.warningModal) {
            if (confirmMode) {
              handleCancel();
            } else {
              handleConfirm();
            }
          }
        },
        { once: true }
      );
    });
  }

  function getToolId(tool: { id?: string; href?: string }): string {
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
    const shortcutCategories = categories
      .map((category) => ({
        ...category,
        tools: category.tools.filter((tool) => !isToolDisabled(tool.id)),
      }))
      .filter((category) => category.tools.length > 0);
    const allTools = shortcutCategories.flatMap((c) => c.tools);

    shortcutCategories.forEach((category) => {
      const section = document.createElement('div');
      section.className = 'category-section mb-6 last:mb-0';

      const header = document.createElement('h3');
      header.className =
        'text-gray-400 text-xs font-bold uppercase tracking-wider mb-3 pl-1';
      const categoryKey = categoryTranslationKeys[category.name];
      header.textContent = categoryKey ? t(categoryKey) : category.name;
      section.appendChild(header);

      const itemsContainer = document.createElement('div');
      itemsContainer.className = 'space-y-2';
      section.appendChild(itemsContainer);

      let hasTools = false;

      category.tools.forEach((tool) => {
        hasTools = true;
        const toolId = getToolId(tool);
        const currentShortcut = allShortcuts.get(toolId) || '';

        const item = document.createElement('div');
        item.className =
          'shortcut-item flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors';

        const left = document.createElement('div');
        left.className = 'flex items-center gap-3';

        const icon = document.createElement('i');
        if (tool.icon.startsWith('ph-')) {
          icon.className = `ph ${tool.icon} w-5 h-5 text-indigo-400`;
        } else {
          icon.className = 'w-5 h-5 text-indigo-400';
          icon.setAttribute('data-lucide', tool.icon);
        }

        const name = document.createElement('span');
        name.className = 'text-gray-200 font-medium';
        const toolKey = toolTranslationKeys[tool.name];
        name.textContent = toolKey ? t(`${toolKey}.name`) : tool.name;

        left.append(icon, name);

        const right = document.createElement('div');
        right.className = 'relative';

        const input = document.createElement('input');
        input.type = 'text';
        input.className =
          'shortcut-input w-32 bg-gray-800 border border-gray-600 text-white text-center text-sm rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all';
        input.placeholder = t('settings.clickToSet');
        input.value = formatShortcutDisplay(currentShortcut, isMac);
        input.readOnly = true;

        const clearBtn = document.createElement('button');
        clearBtn.className =
          'absolute -right-2 -top-2 bg-gray-700 hover:bg-red-600 text-white rounded-full p-0.5 hidden group-hover:block shadow-sm';
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
            input.value = formatShortcutDisplay(
              ShortcutsManager.getShortcut(toolId) || '',
              isMac
            );
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
              const existingTool = allTools.find(
                (t) => getToolId(t) === existingToolId
              );
              const existingToolName = existingTool?.name || existingToolId;
              const displayCombo = formatShortcutDisplay(combo, isMac);

              const existingToolKey = existingTool
                ? toolTranslationKeys[existingTool.name]
                : null;
              const translatedToolName = existingToolKey
                ? t(`${existingToolKey}.name`)
                : existingToolName;

              await showWarningModal(
                t('settings.warnings.alreadyInUse'),
                `<strong>${escapeHtml(displayCombo)}</strong> ${t('settings.warnings.assignedTo')}<br><br>` +
                  `<em>"${escapeHtml(translatedToolName)}"</em><br><br>` +
                  t('settings.warnings.chooseDifferent'),
                false
              );

              input.value = formatShortcutDisplay(
                ShortcutsManager.getShortcut(toolId) || '',
                isMac
              );
              input.classList.remove('border-indigo-500', 'text-indigo-400');
              input.blur();
              return;
            }

            const reservedWarning = getReservedShortcutWarning(combo, isMac);
            if (reservedWarning) {
              const displayCombo = formatShortcutDisplay(combo, isMac);
              const shouldProceed = await showWarningModal(
                t('settings.warnings.reserved'),
                `<strong>${escapeHtml(displayCombo)}</strong> ${t('settings.warnings.commonlyUsed')}<br><br>` +
                  `"<em>${escapeHtml(reservedWarning)}</em>"<br><br>` +
                  `${t('settings.warnings.unreliable')}<br><br>` +
                  t('settings.warnings.useAnyway')
              );

              if (!shouldProceed) {
                // Revert display
                input.value = formatShortcutDisplay(
                  ShortcutsManager.getShortcut(toolId) || '',
                  isMac
                );
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
          input.value = formatShortcutDisplay(
            ShortcutsManager.getShortcut(toolId) || '',
            isMac
          );
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
        behavior: 'instant',
      });
    });
  }

  // Rewrite links after all dynamic content is fully loaded
  rewriteLinks();
};

if (document.readyState === 'complete') {
  void init();
} else {
  window.addEventListener('load', () => void init(), { once: true });
}
