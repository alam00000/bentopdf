import { showLoader, hideLoader, showAlert } from '../ui.js';
import { getPDFDocument } from '../utils/helpers.js';
import { icons, createIcons } from 'lucide';
import * as pdfjsLib from 'pdfjs-dist';
import { CompareState } from '@/types';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

const pageState: CompareState = {
    pdfDoc1: null,
    pdfDoc2: null,
    currentPage: 1,
    viewMode: 'overlay',
    isSyncScroll: true,
};

async function renderPage(
    pdfDoc: pdfjsLib.PDFDocumentProxy,
    pageNum: number,
    canvas: HTMLCanvasElement,
    container: HTMLElement
) {
    const page = await pdfDoc.getPage(pageNum);

    const containerWidth = container.clientWidth - 2;
    const viewport = page.getViewport({ scale: 1.0 });
    const scale = containerWidth / viewport.width;
    const scaledViewport = page.getViewport({ scale: scale });

    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;

    await page.render({
        canvasContext: canvas.getContext('2d')!,
        viewport: scaledViewport,
        canvas
    }).promise;
}

async function renderBothPages() {
    if (!pageState.pdfDoc1 || !pageState.pdfDoc2) return;

    showLoader(`Loading page ${pageState.currentPage}...`);

    const canvas1 = document.getElementById('canvas-compare-1') as HTMLCanvasElement;
    const canvas2 = document.getElementById('canvas-compare-2') as HTMLCanvasElement;
    const panel1 = document.getElementById('panel-1') as HTMLElement;
    const panel2 = document.getElementById('panel-2') as HTMLElement;
    const wrapper = document.getElementById('compare-viewer-wrapper') as HTMLElement;

    const container1 = pageState.viewMode === 'overlay' ? wrapper : panel1;
    const container2 = pageState.viewMode === 'overlay' ? wrapper : panel2;

    await Promise.all([
        renderPage(
            pageState.pdfDoc1,
            Math.min(pageState.currentPage, pageState.pdfDoc1.numPages),
            canvas1,
            container1
        ),
        renderPage(
            pageState.pdfDoc2,
            Math.min(pageState.currentPage, pageState.pdfDoc2.numPages),
            canvas2,
            container2
        ),
    ]);

    updateNavControls();
    hideLoader();
}

function updateNavControls() {
    const maxPages = Math.max(
        pageState.pdfDoc1?.numPages || 0,
        pageState.pdfDoc2?.numPages || 0
    );
    const currentDisplay = document.getElementById('current-page-display-compare');
    const totalDisplay = document.getElementById('total-pages-display-compare');
    const prevBtn = document.getElementById('prev-page-compare') as HTMLButtonElement;
    const nextBtn = document.getElementById('next-page-compare') as HTMLButtonElement;

    if (currentDisplay) currentDisplay.textContent = pageState.currentPage.toString();
    if (totalDisplay) totalDisplay.textContent = maxPages.toString();
    if (prevBtn) prevBtn.disabled = pageState.currentPage <= 1;
    if (nextBtn) nextBtn.disabled = pageState.currentPage >= maxPages;
}

function setViewMode(mode: 'overlay' | 'side-by-side') {
    pageState.viewMode = mode;
    const wrapper = document.getElementById('compare-viewer-wrapper');
    const overlayControls = document.getElementById('overlay-controls');
    const sideControls = document.getElementById('side-by-side-controls');
    const btnOverlay = document.getElementById('view-mode-overlay');
    const btnSide = document.getElementById('view-mode-side');
    const canvas2 = document.getElementById('canvas-compare-2') as HTMLCanvasElement;
    const opacitySlider = document.getElementById('opacity-slider') as HTMLInputElement;

    if (mode === 'overlay') {
        if (wrapper) wrapper.className = 'compare-viewer-wrapper overlay-mode bg-gray-900 rounded-lg border border-gray-700 min-h-[400px] relative';
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
        if (canvas2 && opacitySlider) canvas2.style.opacity = opacitySlider.value;
    } else {
        if (wrapper) wrapper.className = 'compare-viewer-wrapper side-by-side-mode bg-gray-900 rounded-lg border border-gray-700 min-h-[400px]';
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
    }
    renderBothPages();
}

async function handleFileInput(inputId: string, docKey: 'pdfDoc1' | 'pdfDoc2', displayId: string) {
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

            displayDiv.append(icon, p);
            createIcons({ icons });
        }

        try {
            showLoader(`Loading ${file.name}...`);
            const arrayBuffer = await file.arrayBuffer();
            pageState[docKey] = await getPDFDocument({ data: arrayBuffer }).promise;

            if (pageState.pdfDoc1 && pageState.pdfDoc2) {
                const compareViewer = document.getElementById('compare-viewer');
                if (compareViewer) compareViewer.classList.remove('hidden');
                pageState.currentPage = 1;
                await renderBothPages();
            }
        } catch (e) {
            showAlert('Error', 'Could not load PDF. It may be corrupt or password-protected.');
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
    const backBtn = document.getElementById('back-to-tools');

    if (backBtn) {
        backBtn.addEventListener('click', function () {
            window.location.href = import.meta.env.BASE_URL;
        });
    }

    handleFileInput('file-input-1', 'pdfDoc1', 'file-display-1');
    handleFileInput('file-input-2', 'pdfDoc2', 'file-display-2');

    const prevBtn = document.getElementById('prev-page-compare');
    const nextBtn = document.getElementById('next-page-compare');

    if (prevBtn) {
        prevBtn.addEventListener('click', function () {
            if (pageState.currentPage > 1) {
                pageState.currentPage--;
                renderBothPages();
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', function () {
            const maxPages = Math.max(
                pageState.pdfDoc1?.numPages || 0,
                pageState.pdfDoc2?.numPages || 0
            );
            if (pageState.currentPage < maxPages) {
                pageState.currentPage++;
                renderBothPages();
            }
        });
    }

    const btnOverlay = document.getElementById('view-mode-overlay');
    const btnSide = document.getElementById('view-mode-side');

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

    const flickerBtn = document.getElementById('flicker-btn');
    const canvas2 = document.getElementById('canvas-compare-2') as HTMLCanvasElement;
    const opacitySlider = document.getElementById('opacity-slider') as HTMLInputElement;

    // Track flicker state
    let flickerVisible = true;

    if (flickerBtn && canvas2) {
        flickerBtn.addEventListener('click', function () {
            flickerVisible = !flickerVisible;
            canvas2.style.transition = 'opacity 150ms ease-in-out';
            canvas2.style.opacity = flickerVisible ? (opacitySlider?.value || '0.5') : '0';
        });
    }

    if (opacitySlider && canvas2) {
        opacitySlider.addEventListener('input', function () {
            flickerVisible = true; // Reset flicker state when slider changes
            canvas2.style.transition = '';
            canvas2.style.opacity = opacitySlider.value;
        });
    }

    const panel1 = document.getElementById('panel-1');
    const panel2 = document.getElementById('panel-2');
    const syncToggle = document.getElementById('sync-scroll-toggle') as HTMLInputElement;

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
                setTimeout(function () { scrollingPanel = null; }, 100);
            }
        });

        panel2.addEventListener('scroll', function () {
            if (pageState.isSyncScroll && scrollingPanel !== panel1) {
                scrollingPanel = panel2;
                panel1.scrollTop = panel2.scrollTop;
                setTimeout(function () { scrollingPanel = null; }, 100);
            }
        });
    }

    createIcons({ icons });
});
