import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { createIcons, icons } from 'lucide';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

// State
const pageState: {
    pdfDoc: PDFDocument | null;
    file: File | null;
    detectedBlankPages: number[];
    pageThumbnails: Map<number, string>;
} = {
    pdfDoc: null,
    file: null,
    detectedBlankPages: [],
    pageThumbnails: new Map()
};

function showLoader(msg = 'Processing...') {
    document.getElementById('loader-modal')?.classList.remove('hidden');
    const txt = document.getElementById('loader-text');
    if (txt) txt.textContent = msg;
}

function hideLoader() { document.getElementById('loader-modal')?.classList.add('hidden'); }

function showAlert(title: string, msg: string, type = 'error', cb?: () => void) {
    const modal = document.getElementById('alert-modal');
    const t = document.getElementById('alert-title');
    const m = document.getElementById('alert-message');
    if (t) t.textContent = title;
    if (m) m.textContent = msg;
    modal?.classList.remove('hidden');
    const okBtn = document.getElementById('alert-ok');
    if (okBtn) {
        const newBtn = okBtn.cloneNode(true) as HTMLElement;
        okBtn.replaceWith(newBtn);
        newBtn.addEventListener('click', () => {
            modal?.classList.add('hidden');
            if (cb) cb();
        });
    }
}

function downloadFile(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
}

function updateFileDisplay() {
    const area = document.getElementById('file-display-area');
    if (!area || !pageState.file || !pageState.pdfDoc) return;

    const fileSize = pageState.file.size < 1024 * 1024
        ? `${(pageState.file.size / 1024).toFixed(1)} KB`
        : `${(pageState.file.size / 1024 / 1024).toFixed(2)} MB`;
    const pageCount = pageState.pdfDoc.getPageCount();

    area.innerHTML = `
        <div class="bg-gray-700 p-3 rounded-lg border border-gray-600 hover:border-indigo-500 transition-colors">
            <div class="flex items-center justify-between">
                <div class="flex-1 min-w-0">
                    <p class="truncate font-medium text-white">${pageState.file.name}</p>
                    <p class="text-gray-400 text-sm">${fileSize} • ${pageCount} page${pageCount !== 1 ? 's' : ''}</p>
                </div>
                <button id="remove-file" class="text-red-400 hover:text-red-300 p-2 flex-shrink-0 ml-2" title="Remove file">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>
        </div>
    `;
    createIcons({ icons });
    document.getElementById('remove-file')?.addEventListener('click', resetState);
}

function resetState() {
    pageState.pdfDoc = null;
    pageState.file = null;
    pageState.detectedBlankPages = [];
    pageState.pageThumbnails.forEach(url => URL.revokeObjectURL(url));
    pageState.pageThumbnails.clear();

    const area = document.getElementById('file-display-area');
    if (area) area.innerHTML = '';
    document.getElementById('options-panel')?.classList.add('hidden');
    document.getElementById('preview-panel')?.classList.add('hidden');
    const inp = document.getElementById('file-input') as HTMLInputElement;
    if (inp) inp.value = '';
}

async function handleFileUpload(file: File) {
    if (!file || file.type !== 'application/pdf') {
        showAlert('Error', 'Please upload a valid PDF file.');
        return;
    }
    showLoader('Loading PDF...');
    try {
        const buf = await file.arrayBuffer();
        pageState.pdfDoc = await PDFDocument.load(buf);
        pageState.file = file;
        pageState.detectedBlankPages = [];
        updateFileDisplay();
        document.getElementById('options-panel')?.classList.remove('hidden');
        document.getElementById('preview-panel')?.classList.add('hidden');
    } catch (e) {
        console.error(e);
        showAlert('Error', 'Failed to load PDF file.');
    } finally {
        hideLoader();
    }
}

async function isPageBlank(page: any, threshold = 250): Promise<boolean> {
    const viewport = page.getViewport({ scale: 0.5 }); // Lower scale for faster processing
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport }).promise;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let totalBrightness = 0;
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        totalBrightness += (r + g + b) / 3;
    }

    const avgBrightness = totalBrightness / (data.length / 4);
    return avgBrightness > threshold;
}

async function generateThumbnail(page: any): Promise<string> {
    const viewport = page.getViewport({ scale: 0.3 });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport }).promise;
    return canvas.toDataURL('image/jpeg', 0.7);
}

async function detectBlankPages() {
    if (!pageState.pdfDoc || !pageState.file) return showAlert('Error', 'Please upload a PDF first.');

    const sensitivitySlider = document.getElementById('sensitivity-slider') as HTMLInputElement;
    const sensitivityPercent = parseInt(sensitivitySlider?.value || '80');
    const threshold = Math.round(255 - (sensitivityPercent * 2.55));

    showLoader('Detecting blank pages...');
    try {
        const pdfData = await pageState.file.arrayBuffer();
        const pdfDoc = await pdfjsLib.getDocument({ data: pdfData }).promise;
        const totalPages = pdfDoc.numPages;

        pageState.detectedBlankPages = [];
        pageState.pageThumbnails.forEach(url => URL.revokeObjectURL(url));
        pageState.pageThumbnails.clear();

        for (let i = 1; i <= totalPages; i++) {
            const page = await pdfDoc.getPage(i);
            if (await isPageBlank(page, threshold)) {
                pageState.detectedBlankPages.push(i - 1); // 0-indexed
                const thumbnail = await generateThumbnail(page);
                pageState.pageThumbnails.set(i - 1, thumbnail);
            }
        }

        if (pageState.detectedBlankPages.length === 0) {
            showAlert('Info', 'No blank pages detected in this PDF.');
            hideLoader();
            return;
        }

        // Show preview panel
        updatePreviewPanel();
        document.getElementById('preview-panel')?.classList.remove('hidden');
        hideLoader();
    } catch (e) {
        console.error(e);
        showAlert('Error', 'Could not detect blank pages.');
        hideLoader();
    }
}

function updatePreviewPanel() {
    const previewInfo = document.getElementById('preview-info');
    const previewContainer = document.getElementById('blank-pages-preview');

    if (!previewInfo || !previewContainer) return;

    previewInfo.textContent = `Found ${pageState.detectedBlankPages.length} blank page(s). Click on a page to deselect it.`;
    previewContainer.innerHTML = '';

    pageState.detectedBlankPages.forEach((pageIndex) => {
        const thumbnail = pageState.pageThumbnails.get(pageIndex) || '';
        const div = document.createElement('div');
        div.className = 'relative cursor-pointer group';
        div.dataset.pageIndex = String(pageIndex);
        div.dataset.selected = 'true';

        div.innerHTML = `
            <div class="relative border-2 border-red-500 rounded-lg overflow-hidden transition-all">
                <img src="${thumbnail}" alt="Page ${pageIndex + 1}" class="w-full h-auto">
                <div class="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs text-center py-1">
                    Page ${pageIndex + 1}
                </div>
                <div class="absolute top-1 right-1 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center check-mark">
                    <i data-lucide="check" class="w-3 h-3 text-white"></i>
                </div>
            </div>
        `;

        div.addEventListener('click', () => togglePageSelection(div, pageIndex));
        previewContainer.appendChild(div);
    });

    createIcons({ icons });
}

function togglePageSelection(div: HTMLElement, pageIndex: number) {
    const isSelected = div.dataset.selected === 'true';
    const border = div.querySelector('.border-2') as HTMLElement;
    const checkMark = div.querySelector('.check-mark') as HTMLElement;

    if (isSelected) {
        div.dataset.selected = 'false';
        border?.classList.remove('border-red-500');
        border?.classList.add('border-gray-500', 'opacity-50');
        checkMark?.classList.add('hidden');
    } else {
        div.dataset.selected = 'true';
        border?.classList.add('border-red-500');
        border?.classList.remove('border-gray-500', 'opacity-50');
        checkMark?.classList.remove('hidden');
    }
}

async function processRemoveBlankPages() {
    if (!pageState.pdfDoc || !pageState.file) return showAlert('Error', 'Please upload a PDF first.');

    // Get selected pages to remove
    const previewContainer = document.getElementById('blank-pages-preview');
    const selectedPages: number[] = [];
    previewContainer?.querySelectorAll('[data-selected="true"]').forEach(el => {
        const pageIndex = parseInt((el as HTMLElement).dataset.pageIndex || '-1');
        if (pageIndex >= 0) selectedPages.push(pageIndex);
    });

    if (selectedPages.length === 0) {
        showAlert('Info', 'No pages selected for removal.');
        return;
    }

    showLoader(`Removing ${selectedPages.length} blank page(s)...`);
    try {
        const newPdf = await PDFDocument.create();
        const pages = pageState.pdfDoc.getPages();

        for (let i = 0; i < pages.length; i++) {
            if (!selectedPages.includes(i)) {
                const [copiedPage] = await newPdf.copyPages(pageState.pdfDoc, [i]);
                newPdf.addPage(copiedPage);
            }
        }

        const newPdfBytes = await newPdf.save();
        downloadFile(new Blob([new Uint8Array(newPdfBytes)], { type: 'application/pdf' }), 'blank-pages-removed.pdf');
        showAlert('Success', `Removed ${selectedPages.length} blank page(s) successfully!`, 'success', resetState);
    } catch (e) {
        console.error(e);
        showAlert('Error', 'Could not remove blank pages.');
    } finally {
        hideLoader();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    const dropZone = document.getElementById('drop-zone');
    const detectBtn = document.getElementById('detect-btn');
    const processBtn = document.getElementById('process-btn');
    const sensitivitySlider = document.getElementById('sensitivity-slider') as HTMLInputElement;
    const sensitivityValue = document.getElementById('sensitivity-value');

    sensitivitySlider?.addEventListener('input', (e) => {
        const value = (e.target as HTMLInputElement).value;
        if (sensitivityValue) sensitivityValue.textContent = value;
    });

    fileInput?.addEventListener('change', (e) => {
        const f = (e.target as HTMLInputElement).files?.[0];
        if (f) handleFileUpload(f);
    });

    dropZone?.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('border-indigo-500');
    });

    dropZone?.addEventListener('dragleave', () => {
        dropZone.classList.remove('border-indigo-500');
    });

    dropZone?.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-indigo-500');
        const f = e.dataTransfer?.files[0];
        if (f) handleFileUpload(f);
    });

    detectBtn?.addEventListener('click', detectBlankPages);
    processBtn?.addEventListener('click', processRemoveBlankPages);

    document.getElementById('back-to-tools')?.addEventListener('click', () => {
        window.location.href = '../../index.html';
    });
});
