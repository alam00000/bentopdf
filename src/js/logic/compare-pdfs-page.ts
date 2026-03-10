import { showLoader, hideLoader, showAlert } from '../ui.ts';
import { getPDFDocument } from '../utils/helpers.ts';
import { icons, createIcons } from 'lucide';
import * as pdfjsLib from 'pdfjs-dist';
import { CompareState } from '@/types';
import type {
  CompareFilterType,
  ComparePageResult,
  CompareTextChange,
  CompareCategoryFilterState,
} from '../compare/types.ts';
import { extractDocumentSignatures } from '../compare/engine/page-signatures.ts';
import { pairPagesAsync } from '../compare/worker-api.ts';
import type {
  ComparePdfExportMode,
  CompareCaches,
  CompareRenderContext,
} from '../compare/types.ts';
import { exportComparePdf } from '../compare/reporting/export-compare-pdf.ts';
import { LRUCache } from '../compare/lru-cache.ts';
import { COMPARE_CACHE_MAX_SIZE } from '../compare/config.ts';
import {
  getElement,
  computeComparisonForPair,
  getComparisonCacheKey,
} from './compare-render.ts';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const pageState: CompareState = {
  pdfDoc1: null,
  pdfDoc2: null,
  currentPage: 1,
  viewMode: 'side-by-side',
  isSyncScroll: true,
  currentComparison: null,
  activeChangeIndex: 0,
  pagePairs: [],
  activeFilter: 'all',
  categoryFilter: {
    text: true,
    image: true,
    'header-footer': true,
    annotation: true,
    formatting: true,
    background: true,
  },
  changeSearchQuery: '',
  useOcr: true,
  ocrLanguage: 'eng',
  zoomLevel: 1.0,
};

const caches: CompareCaches = {
  pageModelCache: new LRUCache(COMPARE_CACHE_MAX_SIZE),
  comparisonCache: new LRUCache(COMPARE_CACHE_MAX_SIZE),
  comparisonResultsCache: new LRUCache(COMPARE_CACHE_MAX_SIZE),
  ocrModelCache: new LRUCache(COMPARE_CACHE_MAX_SIZE),
};
const documentNames = {
  left: 'first.pdf',
  right: 'second.pdf',
};

let renderGeneration = 0;

function getActivePair() {
  return pageState.pagePairs[pageState.currentPage - 1] || null;
}

function getRenderContext(): CompareRenderContext {
  return {
    useOcr: pageState.useOcr,
    ocrLanguage: pageState.ocrLanguage,
    viewMode: pageState.viewMode,
    zoomLevel: pageState.zoomLevel,
    showLoader,
  };
}

function getVisibleChanges(result: ComparePageResult | null) {
  if (!result) return [];

  const filteredByType =
    pageState.activeFilter === 'all'
      ? result.changes
      : result.changes.filter((change) => {
          if (pageState.activeFilter === 'removed') {
            return change.type === 'removed' || change.type === 'page-removed';
          }
          if (pageState.activeFilter === 'added') {
            return change.type === 'added' || change.type === 'page-added';
          }
          return change.type === pageState.activeFilter;
        });

  const filteredByCategory = filteredByType.filter(
    (change) => pageState.categoryFilter[change.category]
  );

  const searchQuery = pageState.changeSearchQuery.trim().toLowerCase();
  if (!searchQuery) {
    return filteredByCategory;
  }

  return filteredByCategory.filter((change) => {
    const searchableText = [
      change.description,
      change.beforeText,
      change.afterText,
    ]
      .join(' ')
      .toLowerCase();
    return searchableText.includes(searchQuery);
  });
}

function updateFilterButtons() {
  const pills: Array<{ id: string; filter: CompareFilterType }> = [
    { id: 'filter-modified', filter: 'modified' },
    { id: 'filter-added', filter: 'added' },
    { id: 'filter-removed', filter: 'removed' },
    { id: 'filter-moved', filter: 'moved' },
    { id: 'filter-style-changed', filter: 'style-changed' },
  ];

  pills.forEach(({ id, filter }) => {
    const button = getElement<HTMLButtonElement>(id);
    if (!button) return;
    button.classList.toggle('active', pageState.activeFilter === filter);
  });
}

function updateSummary() {
  const comparison = pageState.currentComparison;
  const addedCount = getElement<HTMLElement>('summary-added-count');
  const removedCount = getElement<HTMLElement>('summary-removed-count');
  const modifiedCount = getElement<HTMLElement>('summary-modified-count');
  const movedCount = getElement<HTMLElement>('summary-moved-count');
  const styleChangedCount = getElement<HTMLElement>(
    'summary-style-changed-count'
  );
  const panelLabel1 = getElement<HTMLElement>('compare-panel-label-1');
  const panelLabel2 = getElement<HTMLElement>('compare-panel-label-2');

  if (panelLabel1) panelLabel1.textContent = documentNames.left;
  if (panelLabel2) panelLabel2.textContent = documentNames.right;

  if (!comparison) {
    if (addedCount) addedCount.textContent = '0';
    if (removedCount) removedCount.textContent = '0';
    if (modifiedCount) modifiedCount.textContent = '0';
    if (movedCount) movedCount.textContent = '0';
    if (styleChangedCount) styleChangedCount.textContent = '0';
    updateCategoryPills(null);
    return;
  }

  if (addedCount) addedCount.textContent = comparison.summary.added.toString();
  if (removedCount)
    removedCount.textContent = comparison.summary.removed.toString();
  if (modifiedCount)
    modifiedCount.textContent = comparison.summary.modified.toString();
  if (movedCount) movedCount.textContent = comparison.summary.moved.toString();
  if (styleChangedCount)
    styleChangedCount.textContent = comparison.summary.styleChanged.toString();

  updateCategoryPills(comparison);
}

function updateCategoryPills(comparison: ComparePageResult | null) {
  const categoryKeys: Array<keyof CompareCategoryFilterState> = [
    'text',
    'image',
    'header-footer',
    'annotation',
    'formatting',
    'background',
  ];

  const summary = comparison?.categorySummary;

  for (const key of categoryKeys) {
    const countEl = getElement<HTMLElement>(`category-count-${key}`);
    const pill = getElement<HTMLButtonElement>(`category-${key}`);
    if (countEl) countEl.textContent = summary ? summary[key].toString() : '0';
    if (pill) {
      pill.classList.toggle('active', pageState.categoryFilter[key]);
      pill.classList.toggle('disabled', !pageState.categoryFilter[key]);
    }
  }
}

function renderHighlights() {
  const highlightLayer1 = getElement<HTMLDivElement>('highlights-1');
  const highlightLayer2 = getElement<HTMLDivElement>('highlights-2');

  if (!highlightLayer1 || !highlightLayer2) return;

  highlightLayer1.innerHTML = '';
  highlightLayer2.innerHTML = '';

  const comparison = pageState.currentComparison;
  if (!comparison) return;

  getVisibleChanges(comparison).forEach((change, index) => {
    const activeClass = index === pageState.activeChangeIndex ? ' active' : '';
    change.beforeRects.forEach((rect) => {
      const marker = document.createElement('div');
      marker.className = `compare-highlight ${change.type}${activeClass}`;
      marker.style.left = `${rect.x}px`;
      marker.style.top = `${rect.y}px`;
      marker.style.width = `${rect.width}px`;
      marker.style.height = `${rect.height}px`;
      highlightLayer1.appendChild(marker);
    });

    change.afterRects.forEach((rect) => {
      const marker = document.createElement('div');
      marker.className = `compare-highlight ${change.type}${activeClass}`;
      marker.style.left = `${rect.x}px`;
      marker.style.top = `${rect.y}px`;
      marker.style.width = `${rect.width}px`;
      marker.style.height = `${rect.height}px`;
      highlightLayer2.appendChild(marker);
    });
  });
}

function scrollToChange(change: CompareTextChange) {
  const panel1 = getElement<HTMLDivElement>('panel-1');
  const panel2 = getElement<HTMLDivElement>('panel-2');
  const firstBefore = change.beforeRects[0];
  const firstAfter = change.afterRects[0];

  if (panel1 && firstBefore) {
    panel1.scrollTo({
      top: Math.max(firstBefore.y - 40, 0),
      behavior: 'smooth',
    });
  }

  if (panel2 && firstAfter) {
    panel2.scrollTo({
      top: Math.max(firstAfter.y - 40, 0),
      behavior: 'smooth',
    });
  }
}

function renderChangeList() {
  const comparison = pageState.currentComparison;
  const list = getElement<HTMLDivElement>('compare-change-list');
  const emptyState = getElement<HTMLDivElement>('change-list-empty');
  const prevChangeBtn = getElement<HTMLButtonElement>('prev-change-btn');
  const nextChangeBtn = getElement<HTMLButtonElement>('next-change-btn');
  const exportDropdownBtn = getElement<HTMLButtonElement>(
    'export-dropdown-btn'
  );

  if (
    !list ||
    !emptyState ||
    !prevChangeBtn ||
    !nextChangeBtn ||
    !exportDropdownBtn
  )
    return;

  list.innerHTML = '';
  const visibleChanges = getVisibleChanges(comparison);

  if (!comparison || visibleChanges.length === 0) {
    emptyState.textContent =
      comparison?.status === 'match'
        ? 'No differences detected on this page.'
        : 'No changes match the current filter.';
    emptyState.classList.remove('hidden');
    list.classList.add('hidden');
    prevChangeBtn.disabled = true;
    nextChangeBtn.disabled = true;
    exportDropdownBtn.disabled = pageState.pagePairs.length === 0;
    return;
  }

  emptyState.classList.add('hidden');
  list.classList.remove('hidden');

  const typeLabels: Record<string, string> = {
    added: 'Added',
    removed: 'Deleted',
    modified: 'Modified',
    moved: 'Moved',
    'style-changed': 'Style Changed',
    'page-added': 'Page Added',
    'page-removed': 'Page Removed',
  };

  const grouped = new Map<
    string,
    Array<{ change: CompareTextChange; index: number }>
  >();
  visibleChanges.forEach((change, index) => {
    const key = change.type;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push({ change, index });
  });

  for (const [type, entries] of grouped) {
    const header = document.createElement('div');
    header.className = 'compare-section-header';
    header.innerHTML = `
      <span class="compare-section-label ${type}">${typeLabels[type] || type}</span>
      <span class="compare-section-count">${entries.length}</span>
      <span class="compare-section-line"></span>
    `;
    list.appendChild(header);

    const arrowSvg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 256 256" fill="currentColor" style="display:inline-block;vertical-align:-2px;margin:0 2px;opacity:0.5"><path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"></path></svg>';

    for (const { change, index } of entries) {
      const item = document.createElement('div');
      item.className = `compare-change-item${index === pageState.activeChangeIndex ? ' active' : ''}`;
      const safeDesc = change.description
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>')
        .replace(/→/g, arrowSvg);
      item.innerHTML = `<div class="compare-change-desc">${safeDesc}</div>`;

      item.addEventListener('click', function () {
        pageState.activeChangeIndex = index;
        renderComparisonUI();
        scrollToChange(change);
      });

      list.appendChild(item);
    }
  }

  prevChangeBtn.disabled = false;
  nextChangeBtn.disabled = false;
  exportDropdownBtn.disabled = pageState.pagePairs.length === 0;
}

function renderComparisonUI() {
  updateFilterButtons();
  renderHighlights();
  renderChangeList();
  updateSummary();
}

async function buildPagePairs() {
  if (!pageState.pdfDoc1 || !pageState.pdfDoc2) return;

  showLoader('Building page pairing model...', 0);

  const leftSignatures = await extractDocumentSignatures(
    pageState.pdfDoc1,
    function (pageNumber, totalPages) {
      showLoader(
        `Indexing PDF 1 page ${pageNumber} of ${totalPages}...`,
        (pageNumber / Math.max(totalPages * 2, 1)) * 100
      );
    }
  );
  const rightSignatures = await extractDocumentSignatures(
    pageState.pdfDoc2,
    function (pageNumber, totalPages) {
      showLoader(
        `Indexing PDF 2 page ${pageNumber} of ${totalPages}...`,
        50 + (pageNumber / Math.max(totalPages * 2, 1)) * 100
      );
    }
  );

  pageState.pagePairs = await pairPagesAsync(leftSignatures, rightSignatures);
  pageState.currentPage = 1;
}

async function buildReportResults() {
  const results: ComparePageResult[] = [];
  const ctx = getRenderContext();

  for (const pair of pageState.pagePairs) {
    const cached = caches.comparisonResultsCache.get(pair.pairIndex);
    if (cached) {
      results.push(cached);
      continue;
    }

    const cacheKey = getComparisonCacheKey(pair, pageState.useOcr);
    const cachedResult = caches.comparisonCache.get(cacheKey);
    if (cachedResult) {
      results.push(cachedResult);
      continue;
    }

    const comparison = await computeComparisonForPair(
      pageState.pdfDoc1,
      pageState.pdfDoc2,
      pair,
      caches,
      ctx
    );
    caches.comparisonCache.set(cacheKey, comparison);
    caches.comparisonResultsCache.set(pair.pairIndex, comparison);
    results.push(comparison);
  }

  return results;
}

async function renderBothPages() {
  if (!pageState.pdfDoc1 || !pageState.pdfDoc2) return;

  const pair = getActivePair();
  if (!pair) return;

  const gen = ++renderGeneration;

  showLoader(
    `Loading comparison ${pageState.currentPage} of ${pageState.pagePairs.length}...`
  );

  const canvas1 = getElement<HTMLCanvasElement>(
    'canvas-compare-1'
  ) as HTMLCanvasElement;
  const canvas2 = getElement<HTMLCanvasElement>(
    'canvas-compare-2'
  ) as HTMLCanvasElement;
  const panel1 = getElement<HTMLElement>('panel-1') as HTMLElement;
  const panel2 = getElement<HTMLElement>('panel-2') as HTMLElement;

  const container1 = panel1;
  const container2 = pageState.viewMode === 'overlay' ? panel1 : panel2;

  const ctx = getRenderContext();

  const comparison = await computeComparisonForPair(
    pageState.pdfDoc1,
    pageState.pdfDoc2,
    pair,
    caches,
    ctx,
    {
      renderTargets: {
        left: {
          canvas: canvas1,
          container: container1,
          placeholderId: 'placeholder-1',
        },
        right: {
          canvas: canvas2,
          container: container2,
          placeholderId: 'placeholder-2',
        },
      },
    }
  );

  if (gen !== renderGeneration) return;

  pageState.currentComparison = comparison;
  pageState.activeChangeIndex = 0;

  updateNavControls();
  renderComparisonUI();
  hideLoader();
}

function updateNavControls() {
  const totalPairs =
    pageState.pagePairs.length ||
    Math.max(
      pageState.pdfDoc1?.numPages || 0,
      pageState.pdfDoc2?.numPages || 0
    );
  const currentDisplay = document.getElementById(
    'current-page-display-compare'
  );
  const totalDisplay = document.getElementById('total-pages-display-compare');
  const prevBtn = document.getElementById(
    'prev-page-compare'
  ) as HTMLButtonElement;
  const nextBtn = document.getElementById(
    'next-page-compare'
  ) as HTMLButtonElement;

  if (currentDisplay)
    currentDisplay.textContent = pageState.currentPage.toString();
  if (totalDisplay) totalDisplay.textContent = totalPairs.toString();
  if (prevBtn) prevBtn.disabled = pageState.currentPage <= 1;
  if (nextBtn) nextBtn.disabled = pageState.currentPage >= totalPairs;
}

function setViewMode(mode: 'overlay' | 'side-by-side') {
  pageState.viewMode = mode;
  const wrapper = document.getElementById('compare-viewer-wrapper');
  const overlayControls = document.getElementById('overlay-controls');
  const sideControls = document.getElementById('side-by-side-controls');
  const btnOverlay = document.getElementById('view-mode-overlay');
  const btnSide = document.getElementById('view-mode-side');
  const canvas2 = getElement<HTMLCanvasElement>(
    'canvas-compare-2'
  ) as HTMLCanvasElement;
  const opacitySlider = getElement<HTMLInputElement>(
    'opacity-slider'
  ) as HTMLInputElement;

  if (mode === 'overlay') {
    if (wrapper)
      wrapper.className =
        'compare-viewer-wrapper overlay-mode border border-slate-200';
    if (overlayControls) overlayControls.classList.remove('hidden');
    if (sideControls) sideControls.classList.add('hidden');
    if (btnOverlay) {
      btnOverlay.classList.add('bg-indigo-600');
      btnOverlay.classList.remove('bg-gray-700');
    }
    if (btnSide) {
      btnSide.classList.remove('bg-indigo-600');
      btnSide.classList.add('bg-gray-700');
    }
    if (canvas2 && opacitySlider) {
      const panel2 = getElement<HTMLElement>('panel-2');
      if (panel2) panel2.style.opacity = opacitySlider.value;
    }
    pageState.isSyncScroll = true;
  } else {
    if (wrapper)
      wrapper.className =
        'compare-viewer-wrapper side-by-side-mode border border-slate-200';
    if (overlayControls) overlayControls.classList.add('hidden');
    if (sideControls) sideControls.classList.remove('hidden');
    if (btnOverlay) {
      btnOverlay.classList.remove('bg-indigo-600');
      btnOverlay.classList.add('bg-gray-700');
    }
    if (btnSide) {
      btnSide.classList.add('bg-indigo-600');
      btnSide.classList.remove('bg-gray-700');
    }
    if (canvas2) canvas2.style.opacity = '1';
    const panel2 = getElement<HTMLElement>('panel-2');
    if (panel2) panel2.style.opacity = '1';
  }

  const p1 = getElement<HTMLElement>('panel-1');
  const p2 = getElement<HTMLElement>('panel-2');
  if (mode === 'overlay' && p1 && p2) {
    p2.scrollTop = p1.scrollTop;
    p2.scrollLeft = p1.scrollLeft;
  }

  if (pageState.pdfDoc1 && pageState.pdfDoc2) {
    renderBothPages();
  }
}

async function handleFileInput(
  inputId: string,
  docKey: 'pdfDoc1' | 'pdfDoc2',
  displayId: string
) {
  const fileInput = document.getElementById(inputId) as HTMLInputElement;
  const dropZone = document.getElementById(`drop-zone-${inputId.slice(-1)}`);

  async function handleFile(file: File) {
    if (!file || file.type !== 'application/pdf') {
      showAlert('Invalid File', 'Please select a valid PDF file.');
      return;
    }

    const displayDiv = document.getElementById(displayId);
    if (displayDiv) {
      displayDiv.innerHTML = '';

      const icon = document.createElement('i');
      icon.setAttribute('data-lucide', 'check-circle');
      icon.className = 'w-10 h-10 mb-3 text-green-500';

      const p = document.createElement('p');
      p.className = 'text-sm text-gray-300 truncate';
      p.textContent = file.name;

      if (docKey === 'pdfDoc1') documentNames.left = file.name;
      if (docKey === 'pdfDoc2') documentNames.right = file.name;

      const panelLabel1 = getElement<HTMLElement>('compare-panel-label-1');
      const panelLabel2 = getElement<HTMLElement>('compare-panel-label-2');
      if (docKey === 'pdfDoc1' && panelLabel1)
        panelLabel1.textContent = file.name;
      if (docKey === 'pdfDoc2' && panelLabel2)
        panelLabel2.textContent = file.name;

      displayDiv.append(icon, p);
      createIcons({ icons });
    }

    try {
      showLoader(`Loading ${file.name}...`);
      const arrayBuffer = await file.arrayBuffer();
      pageState[docKey] = await getPDFDocument({ data: arrayBuffer }).promise;
      caches.pageModelCache.clear();
      caches.comparisonCache.clear();
      caches.comparisonResultsCache.clear();
      pageState.changeSearchQuery = '';

      const searchInput = getElement<HTMLInputElement>('compare-search-input');
      if (searchInput) {
        searchInput.value = '';
      }

      if (pageState.pdfDoc1 && pageState.pdfDoc2) {
        const compareViewer = document.getElementById('compare-viewer');
        if (compareViewer) compareViewer.classList.remove('hidden');
        await buildPagePairs();
        await renderBothPages();
      }
    } catch (e) {
      showAlert(
        'Error',
        'Could not load PDF. It may be corrupt or password-protected.'
      );
      console.error(e);
    } finally {
      hideLoader();
    }
  }

  if (fileInput) {
    fileInput.addEventListener('change', function (e) {
      const files = (e.target as HTMLInputElement).files;
      if (files && files[0]) handleFile(files[0]);
    });
  }

  if (dropZone) {
    dropZone.addEventListener('dragover', function (e) {
      e.preventDefault();
    });
    dropZone.addEventListener('drop', function (e) {
      e.preventDefault();
      const files = e.dataTransfer?.files;
      if (files && files[0]) handleFile(files[0]);
    });
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const backBtn = getElement<HTMLButtonElement>('back-to-tools');

  if (backBtn) {
    backBtn.addEventListener('click', function () {
      window.location.href = import.meta.env.BASE_URL;
    });
  }

  handleFileInput('file-input-1', 'pdfDoc1', 'file-display-1');
  handleFileInput('file-input-2', 'pdfDoc2', 'file-display-2');

  const prevBtn = getElement<HTMLButtonElement>('prev-page-compare');
  const nextBtn = getElement<HTMLButtonElement>('next-page-compare');

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      if (pageState.currentPage > 1) {
        pageState.currentPage--;
        renderBothPages().catch(console.error);
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      const totalPairs =
        pageState.pagePairs.length ||
        Math.max(
          pageState.pdfDoc1?.numPages || 0,
          pageState.pdfDoc2?.numPages || 0
        );
      if (pageState.currentPage < totalPairs) {
        pageState.currentPage++;
        renderBothPages().catch(console.error);
      }
    });
  }

  const btnOverlay = getElement<HTMLButtonElement>('view-mode-overlay');
  const btnSide = getElement<HTMLButtonElement>('view-mode-side');

  if (btnOverlay) {
    btnOverlay.addEventListener('click', function () {
      setViewMode('overlay');
    });
  }

  if (btnSide) {
    btnSide.addEventListener('click', function () {
      setViewMode('side-by-side');
    });
  }

  const flickerBtn = getElement<HTMLButtonElement>('flicker-btn');
  const canvas2 = getElement<HTMLCanvasElement>(
    'canvas-compare-2'
  ) as HTMLCanvasElement;
  const opacitySlider = getElement<HTMLInputElement>(
    'opacity-slider'
  ) as HTMLInputElement;

  // Track flicker state
  let flickerVisible = true;

  if (flickerBtn) {
    flickerBtn.addEventListener('click', function () {
      flickerVisible = !flickerVisible;
      const p2 = getElement<HTMLElement>('panel-2');
      if (p2) {
        p2.style.transition = 'opacity 150ms ease-in-out';
        p2.style.opacity = flickerVisible ? opacitySlider?.value || '0.5' : '0';
      }
    });
  }

  if (opacitySlider) {
    opacitySlider.addEventListener('input', function () {
      flickerVisible = true;
      const p2 = getElement<HTMLElement>('panel-2');
      if (p2) {
        p2.style.transition = '';
        p2.style.opacity = opacitySlider.value;
      }
    });
  }

  const panel1 = getElement<HTMLElement>('panel-1');
  const panel2 = getElement<HTMLElement>('panel-2');
  const syncToggle = getElement<HTMLInputElement>(
    'sync-scroll-toggle'
  ) as HTMLInputElement;
  const prevChangeBtn = getElement<HTMLButtonElement>('prev-change-btn');
  const nextChangeBtn = getElement<HTMLButtonElement>('next-change-btn');
  const exportDropdownBtn = getElement<HTMLButtonElement>(
    'export-dropdown-btn'
  );
  const exportDropdownMenu = getElement<HTMLDivElement>('export-dropdown-menu');
  const ocrToggle = getElement<HTMLInputElement>('ocr-toggle');
  const searchInput = getElement<HTMLInputElement>('compare-search-input');

  const filterButtons: Array<{ id: string; filter: CompareFilterType }> = [
    { id: 'filter-modified', filter: 'modified' },
    { id: 'filter-added', filter: 'added' },
    { id: 'filter-removed', filter: 'removed' },
    { id: 'filter-moved', filter: 'moved' },
    { id: 'filter-style-changed', filter: 'style-changed' },
  ];

  if (syncToggle) {
    syncToggle.addEventListener('change', function () {
      pageState.isSyncScroll = syncToggle.checked;
    });
  }

  let scrollingPanel: HTMLElement | null = null;

  if (panel1 && panel2) {
    panel1.addEventListener('scroll', function () {
      if (pageState.isSyncScroll && scrollingPanel !== panel2) {
        scrollingPanel = panel1;
        panel2.scrollTop = panel1.scrollTop;
        panel2.scrollLeft = panel1.scrollLeft;
        setTimeout(function () {
          scrollingPanel = null;
        }, 100);
      }
    });

    panel2.addEventListener('scroll', function () {
      if (pageState.viewMode === 'overlay') return;
      if (pageState.isSyncScroll && scrollingPanel !== panel1) {
        scrollingPanel = panel2;
        panel1.scrollTop = panel2.scrollTop;
        panel1.scrollLeft = panel2.scrollLeft;
        setTimeout(function () {
          scrollingPanel = null;
        }, 100);
      }
    });
  }

  if (prevChangeBtn) {
    prevChangeBtn.addEventListener('click', function () {
      const changes = getVisibleChanges(pageState.currentComparison);
      if (changes.length === 0) return;
      pageState.activeChangeIndex =
        (pageState.activeChangeIndex - 1 + changes.length) % changes.length;
      renderComparisonUI();
      scrollToChange(changes[pageState.activeChangeIndex]);
    });
  }

  if (nextChangeBtn) {
    nextChangeBtn.addEventListener('click', function () {
      const changes = getVisibleChanges(pageState.currentComparison);
      if (changes.length === 0) return;
      pageState.activeChangeIndex =
        (pageState.activeChangeIndex + 1) % changes.length;
      renderComparisonUI();
      scrollToChange(changes[pageState.activeChangeIndex]);
    });
  }

  const ZOOM_STEP = 0.25;
  const ZOOM_MIN = 0.25;
  const ZOOM_MAX = 5.0;
  const zoomInBtn = getElement<HTMLButtonElement>('zoom-in-btn');
  const zoomOutBtn = getElement<HTMLButtonElement>('zoom-out-btn');
  const zoomResetBtn = getElement<HTMLButtonElement>('zoom-reset-btn');
  const zoomDisplay = getElement<HTMLElement>('zoom-level-display');

  function updateZoomDisplay() {
    if (zoomDisplay) {
      zoomDisplay.textContent = `${Math.round(pageState.zoomLevel * 100)}%`;
    }
    if (zoomOutBtn) zoomOutBtn.disabled = pageState.zoomLevel <= ZOOM_MIN;
    if (zoomInBtn) zoomInBtn.disabled = pageState.zoomLevel >= ZOOM_MAX;
  }

  function applyZoom() {
    updateZoomDisplay();
    caches.pageModelCache.clear();
    caches.comparisonCache.clear();
    caches.comparisonResultsCache.clear();
    if (pageState.pdfDoc1 && pageState.pdfDoc2) {
      renderBothPages().catch(console.error);
    }
  }

  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', function () {
      pageState.zoomLevel = Math.min(
        Math.round((pageState.zoomLevel + ZOOM_STEP) * 100) / 100,
        ZOOM_MAX
      );
      applyZoom();
    });
  }

  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', function () {
      pageState.zoomLevel = Math.max(
        Math.round((pageState.zoomLevel - ZOOM_STEP) * 100) / 100,
        ZOOM_MIN
      );
      applyZoom();
    });
  }

  if (zoomResetBtn) {
    zoomResetBtn.addEventListener('click', function () {
      pageState.zoomLevel = 1.0;
      applyZoom();
    });
  }

  filterButtons.forEach(({ id, filter }) => {
    const button = getElement<HTMLButtonElement>(id);
    if (!button) return;
    button.addEventListener('click', function () {
      if (pageState.activeFilter === filter) {
        pageState.activeFilter = 'all';
      } else {
        pageState.activeFilter = filter;
      }
      pageState.activeChangeIndex = 0;
      renderComparisonUI();
    });
  });

  const categoryKeys: Array<keyof CompareCategoryFilterState> = [
    'text',
    'image',
    'header-footer',
    'annotation',
    'formatting',
    'background',
  ];

  for (const key of categoryKeys) {
    const pill = getElement<HTMLButtonElement>(`category-${key}`);
    if (pill) {
      pill.addEventListener('click', function () {
        pageState.categoryFilter[key] = !pageState.categoryFilter[key];
        pageState.activeChangeIndex = 0;
        renderComparisonUI();
      });
    }
  }

  if (ocrToggle) {
    ocrToggle.checked = pageState.useOcr;
    ocrToggle.addEventListener('change', async function () {
      try {
        pageState.useOcr = ocrToggle.checked;
        caches.pageModelCache.clear();
        caches.comparisonCache.clear();
        caches.comparisonResultsCache.clear();
        if (pageState.pdfDoc1 && pageState.pdfDoc2) {
          await renderBothPages();
        }
      } catch (e) {
        console.error('OCR toggle failed:', e);
        hideLoader();
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      pageState.changeSearchQuery = searchInput.value;
      pageState.activeChangeIndex = 0;
      renderComparisonUI();
    });
  }

  let resizeFrame = 0;
  window.addEventListener('resize', function () {
    if (!pageState.pdfDoc1 || !pageState.pdfDoc2) {
      return;
    }

    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(function () {
      renderBothPages().catch(console.error);
    });
  });

  if (exportDropdownBtn && exportDropdownMenu) {
    exportDropdownBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      exportDropdownMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', function () {
      exportDropdownMenu.classList.add('hidden');
    });

    exportDropdownMenu.addEventListener('click', function (e) {
      e.stopPropagation();
    });

    document.querySelectorAll('.export-menu-item').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        const mode = (btn as HTMLElement).dataset
          .exportMode as ComparePdfExportMode;
        if (!mode || pageState.pagePairs.length === 0) return;
        exportDropdownMenu.classList.add('hidden');
        try {
          showLoader('Preparing PDF export...');
          await exportComparePdf(
            mode,
            pageState.pdfDoc1,
            pageState.pdfDoc2,
            pageState.pagePairs,
            function (message, percent) {
              showLoader(message, percent);
            }
          );
        } catch (e) {
          console.error('PDF export failed:', e);
          showAlert('Export Error', 'Could not export comparison PDF.');
        } finally {
          hideLoader();
        }
      });
    });
  }

  createIcons({ icons });
  updateFilterButtons();
  setViewMode(pageState.viewMode);
});
