import { createIcons, icons } from 'lucide';
import { showAlert, showLoader, hideLoader } from '../ui.js';
import {
  downloadFile,
  hexToRgb,
  formatBytes,
  readFileAsArrayBuffer,
} from '../utils/helpers.js';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import {
  addTextWatermark,
  addImageWatermark,
  parsePageRange,
} from '../utils/pdf-operations.js';
import { AddWatermarkState, PageWatermarkConfig } from '@/types';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const pageState: AddWatermarkState = {
  file: null,
  pdfDoc: null,
  pdfBytes: null,
  previewCanvas: null,
  watermarkX: 0.5,
  watermarkY: 0.5,
};

let watermarkType: 'text' | 'image' = 'text';
let imageWatermarkDataUrl: string | null = null;
let imageWatermarkFile: File | null = null;
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let previewScale = 1;
let pdfPageWidth = 0;
let pdfPageHeight = 0;
let isResizing = false;
let resizeStartDistance = 0;
let resizeStartFontSize = 0;
let resizeStartImageScale = 0;

let currentPageNum = 1;
let totalPageCount = 1;
let cachedPdfjsDoc: pdfjsLib.PDFDocumentProxy | null = null;
const pageWatermarks: Map<number, PageWatermarkConfig> = new Map();
let applyToAllPages = true;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePage);
} else {
  initializePage();
}

function initializePage() {
  createIcons({ icons });

  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  const dropZone = document.getElementById('drop-zone');
  const backBtn = document.getElementById('back-to-tools');
  const editorBackBtn = document.getElementById('editor-back-btn');
  const processBtn = document.getElementById('process-btn');

  if (fileInput) {
    fileInput.addEventListener('change', handleFileUpload);
    fileInput.addEventListener('click', () => {
      fileInput.value = '';
    });
  }

  if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('border-indigo-500');
    });
    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('border-indigo-500');
    });
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('border-indigo-500');
      if (e.dataTransfer?.files.length) handleFiles(e.dataTransfer.files);
    });
  }

  if (backBtn)
    backBtn.addEventListener('click', () => {
      window.location.href = import.meta.env.BASE_URL;
    });

  if (editorBackBtn)
    editorBackBtn.addEventListener('click', () => {
      resetState();
      document.getElementById('uploader')?.classList.remove('hidden');
      document.getElementById('editor-panel')?.classList.add('hidden');
    });

  if (processBtn) processBtn.addEventListener('click', applyWatermark);

  setupEditorControls();
  setupPageNavigation();
}

function handleFileUpload(e: Event) {
  const input = e.target as HTMLInputElement;
  if (input.files?.length) handleFiles(input.files);
}

async function handleFiles(files: FileList) {
  const file = files[0];
  if (!file || file.type !== 'application/pdf') {
    showAlert('Invalid File', 'Please upload a valid PDF file.');
    return;
  }
  showLoader('Loading PDF...');
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfBytes = new Uint8Array(arrayBuffer);
    pageState.pdfDoc = await PDFLibDocument.load(pdfBytes);
    pageState.file = file;
    pageState.pdfBytes = pdfBytes;

    cachedPdfjsDoc = await pdfjsLib.getDocument({ data: pdfBytes.slice() })
      .promise;
    totalPageCount = cachedPdfjsDoc.numPages;
    currentPageNum = 1;
    pageWatermarks.clear();

    updateFileDisplay();

    document.getElementById('uploader')?.classList.add('hidden');
    document.getElementById('editor-panel')?.classList.remove('hidden');

    const editorFileInfo = document.getElementById('editor-file-info');
    if (editorFileInfo) {
      editorFileInfo.textContent = `${file.name} (${formatBytes(file.size)}, ${totalPageCount} pages)`;
    }

    updatePageNavUI();
    await renderPreview();
    updateWatermarkOverlay();
  } catch (error) {
    console.error(error);
    showAlert('Error', 'Failed to load PDF file.');
  } finally {
    hideLoader();
  }
}

function updateFileDisplay() {
  const fileDisplayArea = document.getElementById('file-display-area');
  if (!fileDisplayArea || !pageState.file || !pageState.pdfDoc) return;
  fileDisplayArea.innerHTML = '';
  const fileDiv = document.createElement('div');
  fileDiv.className =
    'flex items-center justify-between bg-gray-700 p-3 rounded-lg';
  const infoContainer = document.createElement('div');
  infoContainer.className = 'flex flex-col flex-1 min-w-0';
  const nameSpan = document.createElement('div');
  nameSpan.className = 'truncate font-medium text-gray-200 text-sm mb-1';
  nameSpan.textContent = pageState.file.name;
  const metaSpan = document.createElement('div');
  metaSpan.className = 'text-xs text-gray-400';
  metaSpan.textContent = `${formatBytes(pageState.file.size)} • ${pageState.pdfDoc.getPageCount()} pages`;
  infoContainer.append(nameSpan, metaSpan);
  const removeBtn = document.createElement('button');
  removeBtn.className = 'ml-4 text-red-400 hover:text-red-300 flex-shrink-0';
  removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
  removeBtn.onclick = resetState;
  fileDiv.append(infoContainer, removeBtn);
  fileDisplayArea.appendChild(fileDiv);
  createIcons({ icons });
}

function resetState() {
  pageState.file = null;
  pageState.pdfDoc = null;
  pageState.pdfBytes = null;
  pageState.previewCanvas = null;
  pageState.watermarkX = 0.5;
  pageState.watermarkY = 0.5;
  imageWatermarkDataUrl = null;
  imageWatermarkFile = null;
  cachedPdfjsDoc = null;
  currentPageNum = 1;
  totalPageCount = 1;
  pageWatermarks.clear();
  const fileDisplayArea = document.getElementById('file-display-area');
  if (fileDisplayArea) fileDisplayArea.innerHTML = '';
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  if (fileInput) fileInput.value = '';
}

function setupPageNavigation() {
  const prevBtn = document.getElementById('prev-page-btn');
  const nextBtn = document.getElementById('next-page-btn');
  const pageInput = document.getElementById(
    'page-num-input'
  ) as HTMLInputElement;

  prevBtn?.addEventListener('click', () => changePage(currentPageNum - 1));
  nextBtn?.addEventListener('click', () => changePage(currentPageNum + 1));

  pageInput?.addEventListener('change', () => {
    const val = parseInt(pageInput.value);
    if (val >= 1 && val <= totalPageCount) {
      changePage(val);
    } else {
      pageInput.value = String(currentPageNum);
    }
  });

  pageInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  });

  const applyAllCheckbox = document.getElementById(
    'apply-all-pages'
  ) as HTMLInputElement;
  const pageRangeSection = document.getElementById('page-range-section');
  applyAllCheckbox?.addEventListener('change', () => {
    const wasApplyAll = applyToAllPages;
    applyToAllPages = applyAllCheckbox.checked;

    if (pageRangeSection) {
      pageRangeSection.style.display = applyToAllPages ? '' : 'none';
    }

    if (!applyToAllPages && wasApplyAll) {
      const config = getCurrentConfig();
      for (let i = 1; i <= totalPageCount; i++) {
        if (!pageWatermarks.has(i)) {
          pageWatermarks.set(i, { ...config });
        }
      }
    }
  });
}

function updatePageNavUI() {
  const prevBtn = document.getElementById('prev-page-btn') as HTMLButtonElement;
  const nextBtn = document.getElementById('next-page-btn') as HTMLButtonElement;
  const pageInput = document.getElementById(
    'page-num-input'
  ) as HTMLInputElement;
  const totalSpan = document.getElementById('total-pages');

  if (prevBtn) prevBtn.disabled = currentPageNum <= 1;
  if (nextBtn) nextBtn.disabled = currentPageNum >= totalPageCount;
  if (pageInput) {
    pageInput.value = String(currentPageNum);
    pageInput.max = String(totalPageCount);
  }
  if (totalSpan) totalSpan.textContent = String(totalPageCount);
}

async function changePage(newPageNum: number) {
  if (newPageNum < 1 || newPageNum > totalPageCount) return;
  if (newPageNum === currentPageNum) return;

  saveCurrentPageConfig();
  currentPageNum = newPageNum;
  updatePageNavUI();
  await renderPreview();
  loadPageConfig(currentPageNum);
  updateWatermarkOverlay();
}

function getDefaultConfig(): PageWatermarkConfig {
  return {
    type: 'text',
    x: 0.5,
    y: 0.5,
    text: '',
    fontSize: 72,
    color: '#888888',
    opacityText: 0.3,
    angleText: -45,
    imageDataUrl: null,
    imageFile: null,
    imageScale: 100,
    opacityImage: 0.3,
    angleImage: 0,
  };
}

function getCurrentConfig(): PageWatermarkConfig {
  return {
    type: watermarkType,
    x: pageState.watermarkX,
    y: pageState.watermarkY,
    text:
      (document.getElementById('watermark-text') as HTMLInputElement)?.value ||
      '',
    fontSize:
      parseInt(
        (document.getElementById('font-size') as HTMLInputElement)?.value
      ) || 72,
    color:
      (document.getElementById('text-color') as HTMLInputElement)?.value ||
      '#888888',
    opacityText:
      parseFloat(
        (document.getElementById('opacity-text') as HTMLInputElement)?.value
      ) || 0.3,
    angleText:
      parseInt(
        (document.getElementById('angle-text') as HTMLInputElement)?.value
      ) || 0,
    imageDataUrl: imageWatermarkDataUrl,
    imageFile: imageWatermarkFile,
    imageScale:
      parseInt(
        (document.getElementById('image-scale') as HTMLInputElement)?.value
      ) || 100,
    opacityImage:
      parseFloat(
        (document.getElementById('opacity-image') as HTMLInputElement)?.value
      ) || 0.3,
    angleImage:
      parseInt(
        (document.getElementById('angle-image') as HTMLInputElement)?.value
      ) || 0,
  };
}

function saveCurrentPageConfig() {
  pageWatermarks.set(currentPageNum, getCurrentConfig());
}

function loadPageConfig(pageNum: number) {
  let config: PageWatermarkConfig;

  if (applyToAllPages) {
    config = pageWatermarks.get(1) || getCurrentConfig();
  } else {
    config = pageWatermarks.get(pageNum) || getDefaultConfig();
  }

  watermarkType = config.type;
  pageState.watermarkX = config.x;
  pageState.watermarkY = config.y;
  imageWatermarkDataUrl = config.imageDataUrl;
  imageWatermarkFile = config.imageFile;

  const typeTextBtn = document.getElementById('type-text-btn');
  const typeImageBtn = document.getElementById('type-image-btn');
  const textOptions = document.getElementById('text-watermark-options');
  const imageOptions = document.getElementById('image-watermark-options');

  if (config.type === 'text') {
    typeTextBtn!.className =
      'flex-1 py-2 px-3 text-sm font-medium rounded-lg bg-indigo-600 text-white transition-colors';
    typeImageBtn!.className =
      'flex-1 py-2 px-3 text-sm font-medium rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors';
    textOptions?.classList.remove('hidden');
    imageOptions?.classList.add('hidden');
  } else {
    typeImageBtn!.className =
      'flex-1 py-2 px-3 text-sm font-medium rounded-lg bg-indigo-600 text-white transition-colors';
    typeTextBtn!.className =
      'flex-1 py-2 px-3 text-sm font-medium rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors';
    textOptions?.classList.add('hidden');
    imageOptions?.classList.remove('hidden');
  }

  const watermarkText = document.getElementById(
    'watermark-text'
  ) as HTMLInputElement;
  const fontSize = document.getElementById('font-size') as HTMLInputElement;
  const textColor = document.getElementById('text-color') as HTMLInputElement;
  const opacityText = document.getElementById(
    'opacity-text'
  ) as HTMLInputElement;
  const angleText = document.getElementById('angle-text') as HTMLInputElement;
  const opacityValueText = document.getElementById('opacity-value-text');
  const angleValueText = document.getElementById('angle-value-text');

  if (watermarkText) watermarkText.value = config.text;
  if (fontSize) fontSize.value = String(config.fontSize);
  if (textColor) textColor.value = config.color;
  if (opacityText) opacityText.value = String(config.opacityText);
  if (angleText) angleText.value = String(config.angleText);
  if (opacityValueText)
    opacityValueText.textContent = String(config.opacityText);
  if (angleValueText) angleValueText.textContent = String(config.angleText);

  const imageScale = document.getElementById('image-scale') as HTMLInputElement;
  const opacityImage = document.getElementById(
    'opacity-image'
  ) as HTMLInputElement;
  const angleImage = document.getElementById('angle-image') as HTMLInputElement;
  const imageScaleValue = document.getElementById('image-scale-value');
  const opacityValueImage = document.getElementById('opacity-value-image');
  const angleValueImage = document.getElementById('angle-value-image');

  if (imageScale) imageScale.value = String(config.imageScale);
  if (opacityImage) opacityImage.value = String(config.opacityImage);
  if (angleImage) angleImage.value = String(config.angleImage);
  if (imageScaleValue) imageScaleValue.textContent = String(config.imageScale);
  if (opacityValueImage)
    opacityValueImage.textContent = String(config.opacityImage);
  if (angleValueImage) angleValueImage.textContent = String(config.angleImage);

  updatePresetHighlight(config.x, config.y);
}

async function renderPreview() {
  if (!pageState.pdfBytes || !cachedPdfjsDoc) return;

  const page = await cachedPdfjsDoc.getPage(currentPageNum);

  const container = document.getElementById('preview-container');
  const wrapper = document.getElementById('preview-wrapper');
  if (!container || !wrapper) return;

  const isDesktop = window.innerWidth >= 1024;
  const availableWidth = wrapper.clientWidth - 16;
  let availableHeight: number;

  if (isDesktop) {
    const controlsCard = document.querySelector(
      '.lg\\:w-80 > div'
    ) as HTMLElement;
    if (controlsCard && controlsCard.offsetHeight > 100) {
      const cardHeader = wrapper.parentElement?.querySelector(
        '.flex.items-center.justify-between'
      ) as HTMLElement;
      const headerH = cardHeader ? cardHeader.offsetHeight + 12 : 40;
      const cardPadding = 32;
      availableHeight = controlsCard.offsetHeight - headerH - cardPadding;
    } else {
      availableHeight =
        wrapper.clientHeight > 100
          ? wrapper.clientHeight - 16
          : window.innerHeight * 0.8;
    }
  } else {
    availableHeight = Math.min(window.innerHeight * 0.55, 600);
  }

  const unscaledViewport = page.getViewport({ scale: 1 });
  pdfPageWidth = unscaledViewport.width;
  pdfPageHeight = unscaledViewport.height;

  previewScale = Math.min(
    availableWidth / pdfPageWidth,
    availableHeight / pdfPageHeight
  );
  const displayWidth = Math.floor(pdfPageWidth * previewScale);
  const displayHeight = Math.floor(pdfPageHeight * previewScale);

  const dpr = 2;
  const viewport = page.getViewport({ scale: previewScale * dpr });

  const canvas = document.getElementById('preview-canvas') as HTMLCanvasElement;
  if (!canvas) return;

  canvas.width = viewport.width;
  canvas.height = viewport.height;
  canvas.style.width = displayWidth + 'px';
  canvas.style.height = displayHeight + 'px';

  container.style.width = displayWidth + 'px';
  container.style.height = displayHeight + 'px';

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({ canvasContext: ctx, canvas, viewport }).promise;

  pageState.previewCanvas = canvas;
  setupDragHandlers(container);
}

function setupEditorControls() {
  const typeTextBtn = document.getElementById('type-text-btn');
  const typeImageBtn = document.getElementById('type-image-btn');
  const textOptions = document.getElementById('text-watermark-options');
  const imageOptions = document.getElementById('image-watermark-options');

  typeTextBtn?.addEventListener('click', () => {
    watermarkType = 'text';
    typeTextBtn.className =
      'flex-1 py-2 px-3 text-sm font-medium rounded-lg bg-indigo-600 text-white transition-colors';
    typeImageBtn!.className =
      'flex-1 py-2 px-3 text-sm font-medium rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors';
    textOptions?.classList.remove('hidden');
    imageOptions?.classList.add('hidden');
    updateWatermarkOverlay();
  });

  typeImageBtn?.addEventListener('click', () => {
    watermarkType = 'image';
    typeImageBtn.className =
      'flex-1 py-2 px-3 text-sm font-medium rounded-lg bg-indigo-600 text-white transition-colors';
    typeTextBtn!.className =
      'flex-1 py-2 px-3 text-sm font-medium rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors';
    textOptions?.classList.add('hidden');
    imageOptions?.classList.remove('hidden');
    updateWatermarkOverlay();
  });

  const watermarkText = document.getElementById(
    'watermark-text'
  ) as HTMLInputElement;
  const fontSize = document.getElementById('font-size') as HTMLInputElement;
  const textColor = document.getElementById('text-color') as HTMLInputElement;
  const opacityText = document.getElementById(
    'opacity-text'
  ) as HTMLInputElement;
  const angleText = document.getElementById('angle-text') as HTMLInputElement;
  const opacityValueText = document.getElementById('opacity-value-text');
  const angleValueText = document.getElementById('angle-value-text');

  watermarkText?.addEventListener('input', () => updateWatermarkOverlay());
  fontSize?.addEventListener('input', () => updateWatermarkOverlay());
  textColor?.addEventListener('input', () => updateWatermarkOverlay());

  opacityText?.addEventListener('input', () => {
    if (opacityValueText) opacityValueText.textContent = opacityText.value;
    updateWatermarkOverlay();
  });

  angleText?.addEventListener('input', () => {
    if (angleValueText) angleValueText.textContent = angleText.value;
    updateWatermarkOverlay();
  });

  const opacityImage = document.getElementById(
    'opacity-image'
  ) as HTMLInputElement;
  const angleImage = document.getElementById('angle-image') as HTMLInputElement;
  const imageScale = document.getElementById('image-scale') as HTMLInputElement;
  const opacityValueImage = document.getElementById('opacity-value-image');
  const angleValueImage = document.getElementById('angle-value-image');
  const imageScaleValue = document.getElementById('image-scale-value');

  opacityImage?.addEventListener('input', () => {
    if (opacityValueImage) opacityValueImage.textContent = opacityImage.value;
    updateWatermarkOverlay();
  });

  angleImage?.addEventListener('input', () => {
    if (angleValueImage) angleValueImage.textContent = angleImage.value;
    updateWatermarkOverlay();
  });

  imageScale?.addEventListener('input', () => {
    if (imageScaleValue) imageScaleValue.textContent = imageScale.value;
    updateWatermarkOverlay();
  });

  const imageInput = document.getElementById(
    'image-watermark-input'
  ) as HTMLInputElement;
  imageInput?.addEventListener('change', () => {
    const file = imageInput.files?.[0];
    if (!file) return;
    imageWatermarkFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      imageWatermarkDataUrl = reader.result as string;
      updateWatermarkOverlay();
    };
    reader.readAsDataURL(file);
  });

  document.querySelectorAll('.pos-preset-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const pos = (btn as HTMLElement).dataset.pos;
      if (!pos) return;
      const [x, y] = pos.split(',').map(Number);
      pageState.watermarkX = x;
      pageState.watermarkY = y;
      updatePresetHighlight(x, y);
      updateWatermarkOverlay();
    });
  });
}

function updatePresetHighlight(x: number, y: number) {
  document.querySelectorAll('.pos-preset-btn').forEach((btn) => {
    const pos = (btn as HTMLElement).dataset.pos;
    if (!pos) return;
    const [bx, by] = pos.split(',').map(Number);
    if (Math.abs(bx - x) < 0.01 && Math.abs(by - y) < 0.01) {
      btn.className =
        'pos-preset-btn py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors';
    } else {
      btn.className =
        'pos-preset-btn py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors';
    }
  });
}

function updateWatermarkOverlay() {
  const box = document.getElementById('watermark-box') as HTMLElement;
  const textOverlay = document.getElementById(
    'watermark-overlay'
  ) as HTMLElement;
  const imageOverlay = document.getElementById(
    'image-watermark-overlay'
  ) as HTMLImageElement;
  if (!box || !textOverlay || !imageOverlay) return;

  const container = document.getElementById('preview-container');
  if (!container) return;

  const containerW = container.clientWidth;
  const containerH = container.clientHeight;

  if (watermarkType === 'text') {
    box.classList.remove('hidden');
    textOverlay.classList.remove('hidden');
    imageOverlay.classList.add('hidden');

    const text =
      (document.getElementById('watermark-text') as HTMLInputElement)?.value ||
      'CONFIDENTIAL';
    const fontSizePdf =
      parseInt(
        (document.getElementById('font-size') as HTMLInputElement)?.value
      ) || 72;
    const color =
      (document.getElementById('text-color') as HTMLInputElement)?.value ||
      '#888888';
    const opacity =
      parseFloat(
        (document.getElementById('opacity-text') as HTMLInputElement)?.value
      ) || 0.3;
    const angle =
      parseInt(
        (document.getElementById('angle-text') as HTMLInputElement)?.value
      ) || 0;

    const fontSizePreview = fontSizePdf * previewScale;

    textOverlay.textContent = text;
    textOverlay.style.fontSize = fontSizePreview + 'px';
    textOverlay.style.color = color;
    textOverlay.style.opacity = String(opacity);
    textOverlay.style.fontFamily =
      '"Noto Sans SC", "Noto Sans JP", "Noto Sans KR", "Noto Sans Arabic", sans-serif';
    textOverlay.style.fontWeight = 'bold';

    box.style.left = pageState.watermarkX * containerW + 'px';
    box.style.top = pageState.watermarkY * containerH + 'px';
    box.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
  } else {
    textOverlay.classList.add('hidden');

    if (imageWatermarkDataUrl) {
      box.classList.remove('hidden');
      imageOverlay.classList.remove('hidden');
      imageOverlay.src = imageWatermarkDataUrl;

      const scale =
        parseInt(
          (document.getElementById('image-scale') as HTMLInputElement)?.value
        ) || 100;
      const opacity =
        parseFloat(
          (document.getElementById('opacity-image') as HTMLInputElement)?.value
        ) || 0.3;
      const angle =
        parseInt(
          (document.getElementById('angle-image') as HTMLInputElement)?.value
        ) || 0;

      imageOverlay.style.opacity = String(opacity);
      imageOverlay.style.maxWidth = (scale / 100) * containerW * 0.5 + 'px';

      box.style.left = pageState.watermarkX * containerW + 'px';
      box.style.top = pageState.watermarkY * containerH + 'px';
      box.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
    } else {
      box.classList.add('hidden');
      imageOverlay.classList.add('hidden');
    }
  }
}

function setupDragHandlers(container: HTMLElement) {
  const box = document.getElementById('watermark-box')!;

  function onPointerDown(e: PointerEvent) {
    const target = e.target as HTMLElement;

    if (target.classList.contains('resize-handle')) {
      isResizing = true;
      const containerRect = container.getBoundingClientRect();
      const centerX = pageState.watermarkX * containerRect.width;
      const centerY = pageState.watermarkY * containerRect.height;
      const pointerX = e.clientX - containerRect.left;
      const pointerY = e.clientY - containerRect.top;
      resizeStartDistance = Math.max(
        Math.hypot(pointerX - centerX, pointerY - centerY),
        10
      );

      if (watermarkType === 'text') {
        resizeStartFontSize =
          parseInt(
            (document.getElementById('font-size') as HTMLInputElement).value
          ) || 72;
      } else {
        resizeStartImageScale =
          parseInt(
            (document.getElementById('image-scale') as HTMLInputElement).value
          ) || 100;
      }

      container.setPointerCapture(e.pointerId);
      e.preventDefault();
      return;
    }

    if (!box.contains(target)) return;

    isDragging = true;
    const rect = box.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left - rect.width / 2;
    dragOffsetY = e.clientY - rect.top - rect.height / 2;
    container.setPointerCapture(e.pointerId);
    e.preventDefault();
  }

  function onPointerMove(e: PointerEvent) {
    if (isResizing) {
      const containerRect = container.getBoundingClientRect();
      const centerX = pageState.watermarkX * containerRect.width;
      const centerY = pageState.watermarkY * containerRect.height;
      const pointerX = e.clientX - containerRect.left;
      const pointerY = e.clientY - containerRect.top;
      const currentDistance = Math.hypot(
        pointerX - centerX,
        pointerY - centerY
      );
      const ratio = currentDistance / resizeStartDistance;

      if (watermarkType === 'text') {
        const newSize = Math.max(
          10,
          Math.min(200, Math.round(resizeStartFontSize * ratio))
        );
        const fontSizeInput = document.getElementById(
          'font-size'
        ) as HTMLInputElement;
        fontSizeInput.value = String(newSize);
      } else {
        const newScale = Math.max(
          10,
          Math.min(200, Math.round(resizeStartImageScale * ratio))
        );
        const scaleInput = document.getElementById(
          'image-scale'
        ) as HTMLInputElement;
        scaleInput.value = String(newScale);
        const scaleValue = document.getElementById('image-scale-value');
        if (scaleValue) scaleValue.textContent = String(newScale);
      }

      updateWatermarkOverlay();
      e.preventDefault();
      return;
    }

    if (!isDragging) return;

    const containerRect = container.getBoundingClientRect();
    const x = e.clientX - containerRect.left - dragOffsetX;
    const y = e.clientY - containerRect.top - dragOffsetY;

    const clampedX = Math.max(0, Math.min(x, containerRect.width));
    const clampedY = Math.max(0, Math.min(y, containerRect.height));

    pageState.watermarkX = clampedX / containerRect.width;
    pageState.watermarkY = clampedY / containerRect.height;

    updatePresetHighlight(-1, -1);
    updateWatermarkOverlay();
    e.preventDefault();
  }

  function onPointerUp() {
    isDragging = false;
    isResizing = false;
  }

  container.addEventListener('pointerdown', onPointerDown);
  container.addEventListener('pointermove', onPointerMove);
  container.addEventListener('pointerup', onPointerUp);
  container.addEventListener('pointercancel', onPointerUp);
}

async function applyWatermark() {
  if (!pageState.pdfDoc || !pageState.pdfBytes) {
    showAlert('Error', 'Please upload a PDF file first.');
    return;
  }

  showLoader('Adding watermark...');

  try {
    saveCurrentPageConfig();
    const pdfBytes = new Uint8Array(await pageState.pdfDoc.save());
    let resultBytes = pdfBytes;

    if (applyToAllPages) {
      const config = getCurrentConfig();
      const posY = 1 - config.y;

      const pageRangeStr =
        (
          document.getElementById('page-range-input') as HTMLInputElement
        )?.value.trim() || 'all';
      const pageIndices =
        pageRangeStr.toLowerCase() === 'all'
          ? undefined
          : parsePageRange(pageRangeStr, pageState.pdfDoc!.getPageCount());

      if (config.type === 'text') {
        const text = config.text;
        if (!text.trim())
          throw new Error('Please enter text for the watermark.');
        const textColor = hexToRgb(config.color);

        resultBytes = new Uint8Array(
          await addTextWatermark(resultBytes, {
            text,
            fontSize: config.fontSize,
            color: textColor,
            opacity: config.opacityText,
            angle: -config.angleText,
            x: config.x,
            y: posY,
            pageIndices,
          })
        );
      } else {
        const imageFile = config.imageFile;
        if (!imageFile)
          throw new Error('Please select an image file for the watermark.');
        const imageBytes = await readFileAsArrayBuffer(imageFile);

        let imageType: 'png' | 'jpg';
        if (imageFile.type === 'image/png') {
          imageType = 'png';
        } else if (imageFile.type === 'image/jpeg') {
          imageType = 'jpg';
        } else {
          throw new Error(
            'Unsupported Image. Please use a PNG or JPG for the watermark.'
          );
        }

        resultBytes = new Uint8Array(
          await addImageWatermark(resultBytes, {
            imageBytes: new Uint8Array(imageBytes as ArrayBuffer),
            imageType,
            opacity: config.opacityImage,
            angle: -config.angleImage,
            scale: config.imageScale / 100,
            x: config.x,
            y: posY,
            pageIndices,
          })
        );
      }
    } else {
      const configGroups: Map<
        string,
        { config: PageWatermarkConfig; indices: number[] }
      > = new Map();

      for (let i = 1; i <= totalPageCount; i++) {
        const config = pageWatermarks.get(i);
        if (!config) continue;

        const hasContent =
          config.type === 'text'
            ? config.text.trim().length > 0
            : config.imageFile !== null;
        if (!hasContent) continue;

        const key = JSON.stringify({
          type: config.type,
          x: config.x,
          y: config.y,
          text: config.text,
          fontSize: config.fontSize,
          color: config.color,
          opacityText: config.opacityText,
          angleText: config.angleText,
          imageScale: config.imageScale,
          opacityImage: config.opacityImage,
          angleImage: config.angleImage,
          imageFileName: config.imageFile?.name || null,
        });

        if (!configGroups.has(key)) {
          configGroups.set(key, { config, indices: [] });
        }
        configGroups.get(key)!.indices.push(i - 1);
      }

      for (const { config, indices } of configGroups.values()) {
        const posY = 1 - config.y;

        if (config.type === 'text') {
          const textColor = hexToRgb(config.color);
          resultBytes = new Uint8Array(
            await addTextWatermark(resultBytes, {
              text: config.text,
              fontSize: config.fontSize,
              color: textColor,
              opacity: config.opacityText,
              angle: -config.angleText,
              x: config.x,
              y: posY,
              pageIndices: indices,
            })
          );
        } else {
          if (!config.imageFile) continue;
          const imageBytes = await readFileAsArrayBuffer(config.imageFile);

          let imageType: 'png' | 'jpg';
          if (config.imageFile.type === 'image/png') {
            imageType = 'png';
          } else if (config.imageFile.type === 'image/jpeg') {
            imageType = 'jpg';
          } else {
            continue;
          }

          resultBytes = new Uint8Array(
            await addImageWatermark(resultBytes, {
              imageBytes: new Uint8Array(imageBytes as ArrayBuffer),
              imageType,
              opacity: config.opacityImage,
              angle: -config.angleImage,
              scale: config.imageScale / 100,
              x: config.x,
              y: posY,
              pageIndices: indices,
            })
          );
        }
      }
    }

    const flattenCheckbox = document.getElementById(
      'flatten-watermark'
    ) as HTMLInputElement;
    if (flattenCheckbox?.checked) {
      const watermarkedPdf = await pdfjsLib.getDocument({
        data: resultBytes.slice(),
      }).promise;
      const flattenedDoc = await PDFLibDocument.create();
      const totalPages = watermarkedPdf.numPages;
      const renderScale = 2.5;

      for (let i = 1; i <= totalPages; i++) {
        showLoader(`Flattening page ${i} of ${totalPages}...`);
        const page = await watermarkedPdf.getPage(i);
        const unscaledVP = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: renderScale });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: ctx, canvas, viewport }).promise;

        const jpegBytes = await new Promise<ArrayBuffer>((resolve) =>
          canvas.toBlob(
            (blob) => blob?.arrayBuffer().then(resolve),
            'image/jpeg',
            0.92
          )
        );

        const image = await flattenedDoc.embedJpg(jpegBytes);
        const newPage = flattenedDoc.addPage([
          unscaledVP.width,
          unscaledVP.height,
        ]);
        newPage.drawImage(image, {
          x: 0,
          y: 0,
          width: unscaledVP.width,
          height: unscaledVP.height,
        });
      }

      resultBytes = new Uint8Array(await flattenedDoc.save());
    }

    downloadFile(
      new Blob([new Uint8Array(resultBytes)], { type: 'application/pdf' }),
      'watermarked.pdf'
    );
    showAlert('Success', 'Watermark added successfully!', 'success');
  } catch (e: any) {
    console.error(e);
    showAlert('Error', e.message || 'Could not add the watermark.');
  } finally {
    hideLoader();
  }
}
