import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { PDFDocument } from 'pdf-lib';
import {
  stampPDF,
  defaultPosition,
  DEFAULT_QR_SIZE_PT,
  type QRPosition,
} from './qr-stamper.js';
import {
  generateId,
  generatePacketCode,
  generateAssignmentCode,
  buildPacketTokens,
  buildGenericTokens,
} from './tokens.js';
import {
  saveAssignment,
  savePackets,
  saveTokens,
  type Assignment,
  type Packet,
  type QRToken,
} from './store.js';
import { initPbI18n, pt } from './pb-i18n.js';
import { mountThemeToggle } from './theme.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

// ─── State ───────────────────────────────────────────────────────────────────
let currentStep = 1;
let pdfBytes: Uint8Array | null = null;
let pageCount = 0;
let fileName = '';
let pageDimensions: Array<{ width: number; height: number }> = [];
let qrPositions: QRPosition[] = [];

// Drag listener cleanup registry — prevents accumulation across re-renders
let cleanupDragListeners: Array<() => void> = [];

// Per-thumbnail marker refs (for updating without full re-render)
interface ThumbRef {
  marker: HTMLElement;
  canvasWrap: HTMLElement;
  markerWFrac: number;
  markerHFrac: number;
}
let thumbRefs: ThumbRef[] = [];

// Modal state
let modalPageIndex = -1;
let modalDragCleanup: (() => void) | null = null;

// ─── Element refs ─────────────────────────────────────────────────────────────
const dropZone = document.getElementById('drop-zone')!;
const pdfInput = document.getElementById('pdf-input') as HTMLInputElement;
const browseBtn = document.getElementById('browse-btn')!;
const pdfPreview = document.getElementById('pdf-preview')!;
const fileNameEl = document.getElementById('file-name')!;
const fileMetaEl = document.getElementById('file-meta')!;
const removeFileBtn = document.getElementById('remove-file-btn')!;
const thumbnailsEl = document.getElementById('page-thumbnails')!;
const step1Next = document.getElementById('step1-next') as HTMLButtonElement;
const step2Back = document.getElementById('step2-back')!;
const step2Next = document.getElementById('step2-next')!;
const titleInput = document.getElementById(
  'assignment-title'
) as HTMLInputElement;
const classInput = document.getElementById('class-label') as HTMLInputElement;
const packetCountInput = document.getElementById(
  'packet-count'
) as HTMLInputElement;
const packetCountSection = document.getElementById('packet-count-section')!;
const applyAllBtn = document.getElementById('apply-all-btn')!;
const placementThumbsEl = document.getElementById('placement-thumbnails')!;
const progressLabel = document.getElementById('progress-label')!;
const progressBar = document.getElementById('progress-bar') as HTMLElement;
const generateProgress = document.getElementById('generate-progress')!;
const generateResults = document.getElementById('generate-results')!;
const successMessage = document.getElementById('success-message')!;
const downloadZipBtn = document.getElementById('download-zip-btn')!;
const downloadZipLabel = document.getElementById('download-zip-label')!;
const downloadCombinedBtn = document.getElementById('download-combined-btn')!;
const downloadCombinedLabel = document.getElementById(
  'download-combined-label'
)!;
const packetListEl = document.getElementById('packet-list')!;
const step3New = document.getElementById('step3-new')!;

// ─── Step navigation ──────────────────────────────────────────────────────────
function goToStep(n: number): void {
  currentStep = n;
  document.querySelectorAll('.step-panel').forEach((el) => {
    (el as HTMLElement).style.display = 'none';
  });
  const panel = document.getElementById(`step-${n}`);
  if (panel) panel.style.display = '';
  updateStepIndicator(n);
  if (n === 2) renderPlacementThumbnails();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateStepIndicator(active: number): void {
  for (let i = 1; i <= 3; i++) {
    const stepEl = document.querySelector<HTMLElement>(
      `.pb-step[data-step="${i}"]`
    );
    if (!stepEl) continue;
    stepEl.classList.remove('pb-step--active', 'pb-step--done');
    if (i < active) stepEl.classList.add('pb-step--done');
    else if (i === active) stepEl.classList.add('pb-step--active');
  }
}

// ─── File handling ─────────────────────────────────────────────────────────────
async function loadPDF(file: File): Promise<void> {
  const buffer = await file.arrayBuffer();
  pdfBytes = new Uint8Array(buffer);
  fileName = file.name;

  const pdf = await pdfjsLib.getDocument({ data: pdfBytes.slice() }).promise;
  pageCount = pdf.numPages;

  pageDimensions = [];
  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const vp = page.getViewport({ scale: 1 });
    pageDimensions.push({ width: vp.width, height: vp.height });
  }

  qrPositions = pageDimensions.map(({ width, height }) =>
    defaultPosition(width, height, DEFAULT_QR_SIZE_PT)
  );

  fileNameEl.textContent = file.name;
  fileMetaEl.textContent = `${pageCount} page${pageCount !== 1 ? 's' : ''} · ${(file.size / 1024).toFixed(1)} KB`;
  pdfPreview.style.display = '';
  dropZone.style.display = 'none';
  step1Next.disabled = false;

  await renderThumbnails(pdf, Math.min(pageCount, 8));
}

async function renderThumbnails(
  pdf: pdfjsLib.PDFDocumentProxy,
  count: number
): Promise<void> {
  thumbnailsEl.innerHTML = '';
  for (let i = 1; i <= count; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 0.3 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;

    canvas.style.cssText =
      'display:block;width:100%;height:auto;border-radius:var(--pb-radius-sm);border:1px solid var(--pb-border)';

    const wrapper = document.createElement('div');
    const label = document.createElement('p');
    label.style.cssText =
      'color:var(--pb-text-3);text-align:center;font-size:.7rem;margin-top:.25rem';
    label.textContent = `p.${i}`;
    wrapper.appendChild(canvas);
    wrapper.appendChild(label);
    thumbnailsEl.appendChild(wrapper);
  }
  if (pageCount > count) {
    const more = document.createElement('div');
    more.style.cssText =
      'display:flex;align-items:center;justify-content:center;background:var(--pb-surface-2);border:1px solid var(--pb-border);border-radius:var(--pb-radius-sm);color:var(--pb-text-3);font-size:.75rem;aspect-ratio:3/4';
    more.textContent = `+${pageCount - count} more`;
    thumbnailsEl.appendChild(more);
  }
}

function clearFile(): void {
  cleanupDragListeners.forEach((fn) => fn());
  cleanupDragListeners = [];
  thumbRefs = [];
  pdfBytes = null;
  pageCount = 0;
  fileName = '';
  pageDimensions = [];
  qrPositions = [];
  pdfInput.value = '';
  pdfPreview.style.display = 'none';
  dropZone.style.display = '';
  thumbnailsEl.innerHTML = '';
  placementThumbsEl.innerHTML = '';
  step1Next.disabled = true;
}

// ─── QR marker positioning ────────────────────────────────────────────────────

/**
 * Position the marker within a container using actual CSS pixel dimensions.
 * containerW / containerH are the element's rendered CSS pixel size, not buffer size.
 */
function positionMarker(
  marker: HTMLElement,
  pos: QRPosition,
  containerW: number,
  containerH: number,
  markerWFrac: number,
  markerHFrac: number
): void {
  const maxLeft = containerW * (1 - markerWFrac);
  const maxTop = containerH * (1 - markerHFrac);
  marker.style.left = `${Math.max(0, Math.min(pos.x * containerW, maxLeft))}px`;
  marker.style.top = `${Math.max(0, Math.min(pos.y * containerH, maxTop))}px`;
}

/**
 * Wire drag events on a marker. Reads actual container dimensions from
 * getBoundingClientRect() at drag start so the math is correct regardless
 * of how the canvas is scaled by CSS.
 * Returns a cleanup function that removes all window listeners.
 */
function makeDraggable(
  marker: HTMLElement,
  canvasWrap: HTMLElement,
  pageIndex: number,
  markerWFrac: number,
  markerHFrac: number
): () => void {
  let dragging = false;
  let startClientX = 0,
    startClientY = 0;
  let startLeft = 0,
    startTop = 0;
  let containerW = 0,
    containerH = 0;

  function onStart(clientX: number, clientY: number): void {
    dragging = true;
    const rect = canvasWrap.getBoundingClientRect();
    containerW = rect.width;
    containerH = rect.height;
    startClientX = clientX;
    startClientY = clientY;
    startLeft = parseFloat(marker.style.left) || 0;
    startTop = parseFloat(marker.style.top) || 0;
  }

  function onMove(clientX: number, clientY: number): void {
    if (!dragging) return;
    const newLeft = Math.max(
      0,
      Math.min(
        startLeft + clientX - startClientX,
        containerW * (1 - markerWFrac)
      )
    );
    const newTop = Math.max(
      0,
      Math.min(
        startTop + clientY - startClientY,
        containerH * (1 - markerHFrac)
      )
    );
    marker.style.left = `${newLeft}px`;
    marker.style.top = `${newTop}px`;
    qrPositions[pageIndex] = {
      x: newLeft / containerW,
      y: newTop / containerH,
    };
  }

  function onEnd(): void {
    dragging = false;
  }

  const onMouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY);
  const onMouseUp = () => onEnd();
  const onTouchMove = (e: TouchEvent) => {
    if (dragging) {
      e.preventDefault();
      onMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };
  const onTouchEnd = () => onEnd();

  marker.addEventListener('mousedown', (e) => {
    e.preventDefault();
    onStart(e.clientX, e.clientY);
  });
  marker.addEventListener(
    'touchstart',
    (e) => {
      e.preventDefault();
      onStart(e.touches[0].clientX, e.touches[0].clientY);
    },
    { passive: false }
  );
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('touchend', onTouchEnd);

  return () => {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);
  };
}

function makeQRMarkerInner(wPx: number, hPx: number): HTMLElement {
  const inner = document.createElement('div');
  inner.className = 'qr-marker-inner';
  inner.style.width = `${wPx}px`;
  inner.style.height = `${hPx}px`;
  inner.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h.01M14 18h.01M18 14h.01M18 18h4v3h-4z"/></svg>`;
  return inner;
}

// ─── Placement thumbnails ─────────────────────────────────────────────────────
const LABEL_BLOCK_PT = 18; // matches stampPDF: 2 lines × 8pt + 2pt gap

async function renderPlacementThumbnails(): Promise<void> {
  // Remove stale window listeners before clearing the DOM
  cleanupDragListeners.forEach((fn) => fn());
  cleanupDragListeners = [];
  thumbRefs = [];

  if (!pdfBytes || pageCount === 0) return;
  placementThumbsEl.innerHTML = '';

  const pdf = await pdfjsLib.getDocument({ data: pdfBytes.slice() }).promise;
  const SCALE = 0.35;

  for (let i = 0; i < pageCount; i++) {
    const pageNumber = i + 1;
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: SCALE });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;

    const { width: pdfW, height: pdfH } = pageDimensions[i];
    const markerWFrac = DEFAULT_QR_SIZE_PT / pdfW;
    const markerHFrac = (DEFAULT_QR_SIZE_PT + LABEL_BLOCK_PT) / pdfH;

    // canvasWrap: positioned parent for the absolute marker
    const canvasWrap = document.createElement('div');
    canvasWrap.style.cssText = 'position:relative;display:block';

    const marker = document.createElement('div');
    marker.className = 'qr-marker';
    marker.dataset.page = String(i);

    // Placeholder inner — sized correctly after DOM insertion (offsetWidth available)
    const inner = makeQRMarkerInner(1, 1);
    marker.appendChild(inner);
    canvasWrap.appendChild(canvas);
    canvasWrap.appendChild(marker);

    const label = document.createElement('p');
    label.style.cssText =
      'color:var(--pb-text-3);text-align:center;font-size:.7rem;margin-top:.25rem';
    label.textContent = `p.${pageNumber}`;

    const wrap = document.createElement('div');
    wrap.className = 'thumb-wrap thumb-zoom-wrap';
    wrap.appendChild(canvasWrap);
    wrap.appendChild(label);

    // Append to live DOM so offsetWidth reflects actual CSS layout
    placementThumbsEl.appendChild(wrap);

    // Read actual rendered CSS dimensions (forces layout reflow)
    const cW = canvasWrap.offsetWidth;
    const cH = canvasWrap.offsetHeight;

    // Now size the marker correctly and position it
    inner.style.width = `${Math.round(markerWFrac * cW)}px`;
    inner.style.height = `${Math.round(markerHFrac * cH)}px`;
    positionMarker(marker, qrPositions[i], cW, cH, markerWFrac, markerHFrac);

    const cleanup = makeDraggable(
      marker,
      canvasWrap,
      i,
      markerWFrac,
      markerHFrac
    );
    cleanupDragListeners.push(cleanup);
    thumbRefs.push({ marker, canvasWrap, markerWFrac, markerHFrac });

    // Click on canvas area (not the marker) → zoom modal
    const idx = i;
    canvasWrap.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('.qr-marker')) return;
      openZoomedModal(idx);
    });
  }
}

// ─── Zoom modal ───────────────────────────────────────────────────────────────
async function openZoomedModal(pageIndex: number): Promise<void> {
  if (!pdfBytes) return;
  modalPageIndex = pageIndex;

  if (modalDragCleanup) {
    modalDragCleanup();
    modalDragCleanup = null;
  }

  const modal = document.getElementById('qr-modal')!;
  const canvasWrap = document.getElementById('qr-modal-canvas-wrap')!;
  const canvasEl = document.getElementById(
    'qr-modal-canvas'
  ) as HTMLCanvasElement;
  const pageLabel = document.getElementById('qr-modal-page-label')!;

  // Remove old modal marker
  canvasWrap.querySelectorAll('.qr-marker').forEach((el) => el.remove());

  pageLabel.textContent = `Page ${pageIndex + 1} of ${pageCount}`;
  modal.style.display = 'flex';

  // Scale to fit the modal scroll area (capped at 1.0 for sharpness)
  const { width: pdfW, height: pdfH } = pageDimensions[pageIndex];
  const maxW = Math.min(window.innerWidth - 80, 600);
  const scale = Math.min(1.0, maxW / pdfW);

  const pdf = await pdfjsLib.getDocument({ data: pdfBytes.slice() }).promise;
  if (modalPageIndex !== pageIndex) return; // stale — user opened another page

  const page = await pdf.getPage(pageIndex + 1);
  const viewport = page.getViewport({ scale });

  canvasEl.width = viewport.width;
  canvasEl.height = viewport.height;
  canvasEl.style.cssText =
    'display:block;border-radius:var(--pb-radius-sm);border:1px solid var(--pb-border)';

  const ctx = canvasEl.getContext('2d')!;
  await page.render({ canvasContext: ctx, viewport, canvas: canvasEl }).promise;
  if (modalPageIndex !== pageIndex) return;

  const markerWFrac = DEFAULT_QR_SIZE_PT / pdfW;
  const markerHFrac = (DEFAULT_QR_SIZE_PT + LABEL_BLOCK_PT) / pdfH;

  // Modal canvas is NOT CSS-scaled, so buffer px = CSS px
  const cW = viewport.width;
  const cH = viewport.height;

  const marker = document.createElement('div');
  marker.className = 'qr-marker';
  const inner = makeQRMarkerInner(
    Math.round(markerWFrac * cW),
    Math.round(markerHFrac * cH)
  );
  marker.appendChild(inner);
  canvasWrap.appendChild(marker);

  positionMarker(
    marker,
    qrPositions[pageIndex],
    cW,
    cH,
    markerWFrac,
    markerHFrac
  );
  modalDragCleanup = makeDraggable(
    marker,
    canvasWrap,
    pageIndex,
    markerWFrac,
    markerHFrac
  );
}

function closeModal(): void {
  const modal = document.getElementById('qr-modal')!;
  modal.style.display = 'none';
  if (modalDragCleanup) {
    modalDragCleanup();
    modalDragCleanup = null;
  }

  // Sync the small thumbnail marker to reflect any position change from the modal
  if (modalPageIndex >= 0 && thumbRefs[modalPageIndex]) {
    const { marker, canvasWrap, markerWFrac, markerHFrac } =
      thumbRefs[modalPageIndex];
    const cW = canvasWrap.offsetWidth;
    const cH = canvasWrap.offsetHeight;
    const inner = marker.querySelector<HTMLElement>('.qr-marker-inner');
    if (inner) {
      inner.style.width = `${Math.round(markerWFrac * cW)}px`;
      inner.style.height = `${Math.round(markerHFrac * cH)}px`;
    }
    positionMarker(
      marker,
      qrPositions[modalPageIndex],
      cW,
      cH,
      markerWFrac,
      markerHFrac
    );
  }
  modalPageIndex = -1;
}

// Wire modal close button and backdrop click
document
  .getElementById('qr-modal-close')
  ?.addEventListener('click', closeModal);
document.getElementById('qr-modal')?.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal(); // backdrop
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ─── QR mode selection ────────────────────────────────────────────────────────
function getQRMode(): 'anonymous' | 'generic' {
  return (
    (document.querySelector<HTMLInputElement>('input[name="qr-mode"]:checked')
      ?.value as 'anonymous' | 'generic') || 'anonymous'
  );
}

document
  .querySelectorAll<HTMLInputElement>('input[name="qr-mode"]')
  .forEach((radio) => {
    radio.addEventListener('change', () => {
      const mode = getQRMode();
      packetCountSection.style.display = mode === 'anonymous' ? '' : 'none';
      document
        .querySelectorAll<HTMLElement>('.qr-mode-card')
        .forEach((card) => {
          card.classList.toggle(
            'pb-mode-card--active',
            card.dataset.mode === mode
          );
        });
    });
  });

applyAllBtn.addEventListener('click', () => {
  if (qrPositions.length === 0) return;
  const first = { ...qrPositions[0] };
  for (let i = 1; i < qrPositions.length; i++) qrPositions[i] = { ...first };
  // Update small thumbnail markers directly — no PDF re-load needed
  thumbRefs.forEach(({ marker, canvasWrap, markerWFrac, markerHFrac }, i) => {
    const cW = canvasWrap.offsetWidth;
    const cH = canvasWrap.offsetHeight;
    positionMarker(marker, qrPositions[i], cW, cH, markerWFrac, markerHFrac);
  });
});

// ─── Generation ───────────────────────────────────────────────────────────────
interface GeneratedPacket {
  packet: Packet;
  pdfBytes: Uint8Array;
  tokens: QRToken[];
}

async function generatePackets(
  assignment: Assignment,
  mode: 'anonymous' | 'generic'
): Promise<GeneratedPacket[]> {
  if (!pdfBytes) throw new Error('No PDF loaded');

  if (mode === 'generic') {
    const assignmentCode = generateAssignmentCode();
    const tokens = buildGenericTokens(assignmentCode, assignment.id, pageCount);
    const stamped = await stampPDF(
      pdfBytes,
      tokens.map((t) => t.token),
      {
        assignmentTitle: assignment.title,
        pageCount,
        packetCode: null,
        mode: 'generic',
        positions: qrPositions,
      }
    );
    const genericPacket: Packet = {
      id: generateId('packet'),
      assignmentId: assignment.id,
      packetCode: assignmentCode,
      mode: 'generic',
      createdAt: new Date().toISOString(),
    };
    return [{ packet: genericPacket, pdfBytes: stamped, tokens }];
  }

  const count = Math.min(
    Math.max(1, parseInt(packetCountInput.value, 10) || 30),
    200
  );
  const results: GeneratedPacket[] = [];
  for (let i = 0; i < count; i++) {
    const packetCode = generatePacketCode();
    const packet: Packet = {
      id: generateId('packet'),
      assignmentId: assignment.id,
      packetCode,
      mode: 'anonymous',
      createdAt: new Date().toISOString(),
    };
    const tokens = buildPacketTokens(packet, assignment.id, pageCount);
    const stamped = await stampPDF(
      pdfBytes,
      tokens.map((t) => t.token),
      {
        assignmentTitle: assignment.title,
        pageCount,
        packetCode,
        mode: 'anonymous',
        positions: qrPositions,
      }
    );
    results.push({ packet, pdfBytes: stamped, tokens });

    progressBar.style.width = `${Math.round(((i + 1) / count) * 100)}%`;
    progressLabel.textContent = pt('create.step3.generatingPacket', {
      current: i + 1,
      total: count,
    });
    await new Promise((r) => requestAnimationFrame(r));
  }
  return results;
}

// ─── Download helpers ─────────────────────────────────────────────────────────
function downloadBlob(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

async function buildZip(
  generated: GeneratedPacket[],
  baseName: string
): Promise<Blob> {
  const zip = new JSZip();
  for (const g of generated) {
    const suffix =
      g.packet.mode === 'anonymous' ? g.packet.packetCode : 'generic';
    zip.file(`${baseName}-${suffix}.pdf`, g.pdfBytes);
  }
  return zip.generateAsync({ type: 'blob' });
}

async function buildCombinedPDF(
  generated: GeneratedPacket[]
): Promise<Uint8Array> {
  const combined = await PDFDocument.create();
  for (const g of generated) {
    const src = await PDFDocument.load(g.pdfBytes);
    const pages = await combined.copyPages(src, src.getPageIndices());
    pages.forEach((p) => combined.addPage(p));
  }
  return combined.save();
}

function sanitizeName(s: string): string {
  return s
    .replace(/[^a-zA-Z0-9\-_. ]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// ─── Step 2 → 3: Generate ─────────────────────────────────────────────────────
step2Next.addEventListener('click', async () => {
  const title = titleInput.value.trim();
  if (!title) {
    titleInput.focus();
    titleInput.classList.add('pb-input-error');
    return;
  }
  titleInput.classList.remove('pb-input-error');

  goToStep(3);
  generateProgress.style.display = '';
  generateResults.style.display = 'none';

  const mode = getQRMode();
  const assignment: Assignment = {
    id: generateId('assign'),
    title,
    classLabel: classInput.value.trim(),
    pageCount,
    qrMode: mode,
    packetCount:
      mode === 'anonymous' ? parseInt(packetCountInput.value, 10) || 30 : 1,
    createdAt: new Date().toISOString(),
  };

  try {
    const generated = await generatePackets(assignment, mode);
    saveAssignment(assignment);
    savePackets(generated.map((g) => g.packet));
    saveTokens(generated.flatMap((g) => g.tokens));

    generateProgress.style.display = 'none';
    generateResults.style.display = '';

    const baseName = sanitizeName(title);
    const isGeneric = mode === 'generic';
    const count = generated.length;

    successMessage.textContent = isGeneric
      ? pt('create.step3.successGeneric', { title })
      : pt('create.step3.successPackets', { count, title });

    if (isGeneric) {
      downloadZipLabel.textContent = 'Download PDF';
      downloadCombinedLabel.textContent = 'Same file';
      const dl = () =>
        downloadBlob(
          new Blob([generated[0].pdfBytes as BlobPart], {
            type: 'application/pdf',
          }),
          `${baseName}.pdf`
        );
      downloadZipBtn.onclick = dl;
      downloadCombinedBtn.onclick = dl;
    } else {
      downloadZipLabel.textContent = pt('create.step3.downloadZipCount', {
        count,
      });
      downloadCombinedLabel.textContent = pt('create.step3.combinedCount', {
        count,
      });

      downloadZipBtn.onclick = async () => {
        downloadZipBtn.setAttribute('disabled', '');
        try {
          downloadBlob(
            await buildZip(generated, baseName),
            `${baseName}-packets.zip`
          );
        } finally {
          downloadZipBtn.removeAttribute('disabled');
        }
      };
      downloadCombinedBtn.onclick = async () => {
        downloadCombinedBtn.setAttribute('disabled', '');
        try {
          downloadBlob(
            new Blob([(await buildCombinedPDF(generated)) as BlobPart], {
              type: 'application/pdf',
            }),
            `${baseName}-all-packets.pdf`
          );
        } finally {
          downloadCombinedBtn.removeAttribute('disabled');
        }
      };
    }

    const packetListSection = document.getElementById('packet-list-section');
    if (!isGeneric) {
      if (packetListSection) packetListSection.style.display = '';
      packetListEl.innerHTML = generated
        .map(
          (g) => `
        <div class="pb-packet-item">
          <div style="display:flex;align-items:center;gap:.625rem">
            <span class="pb-packet-code">${g.packet.packetCode}</span>
            <span style="color:var(--pb-text-3);font-size:.75rem">${pageCount}p</span>
          </div>
          <button class="download-packet pb-btn pb-btn-ghost" style="padding:.25rem .5rem" data-code="${g.packet.packetCode}" title="Download">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
        </div>
      `
        )
        .join('');
      packetListEl
        .querySelectorAll<HTMLButtonElement>('.download-packet')
        .forEach((btn) => {
          btn.addEventListener('click', () => {
            const g = generated.find(
              (x) => x.packet.packetCode === btn.dataset.code
            );
            if (g)
              downloadBlob(
                new Blob([g.pdfBytes as BlobPart], { type: 'application/pdf' }),
                `${baseName}-${g.packet.packetCode}.pdf`
              );
          });
        });
    } else {
      if (packetListSection) packetListSection.style.display = 'none';
      packetListEl.innerHTML = '';
    }
  } catch (err) {
    generateProgress.style.display = '';
    progressLabel.textContent = `Error: ${err instanceof Error ? err.message : String(err)}`;
    progressBar.style.background = 'var(--pb-danger)';
    console.error(err);
  }
});

// ─── Other wiring ─────────────────────────────────────────────────────────────
browseBtn.addEventListener('click', () => pdfInput.click());
dropZone.addEventListener('click', (e) => {
  if (!(e.target as HTMLElement).closest('button')) pdfInput.click();
});
pdfInput.addEventListener('change', () => {
  const f = pdfInput.files?.[0];
  if (f) loadPDF(f);
});

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('pb-dropzone--over');
});
dropZone.addEventListener('dragleave', () =>
  dropZone.classList.remove('pb-dropzone--over')
);
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('pb-dropzone--over');
  const f = e.dataTransfer?.files[0];
  if (f?.type === 'application/pdf') loadPDF(f);
});

removeFileBtn.addEventListener('click', clearFile);

step1Next.addEventListener('click', () => {
  if (!pdfBytes) return;
  if (!titleInput.value.trim())
    titleInput.value = fileName.replace(/\.pdf$/i, '');
  goToStep(2);
});

step2Back.addEventListener('click', () => goToStep(1));

step3New.addEventListener('click', () => {
  clearFile();
  titleInput.value = '';
  classInput.value = '';
  packetCountInput.value = '30';
  goToStep(1);
});

function mountMobileMenu(): void {
  const btn = document.getElementById('pb-mobile-menu-btn');
  const menu = document.getElementById('pb-mobile-menu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.setAttribute(
      'aria-label',
      open ? pt('nav.menuClose') : pt('nav.menuOpen')
    );
  });
}

// ─── Initialize ───────────────────────────────────────────────────────────────
(async () => {
  await initPbI18n();
  mountThemeToggle();
  mountMobileMenu();
  updateStepIndicator(1);
})();
