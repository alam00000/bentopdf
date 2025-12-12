import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, readFileAsArrayBuffer, getPDFDocument } from '../utils/helpers.js';
import { state } from '../state.js';
import { renderPagesProgressively, cleanupLazyRendering } from '../utils/render-utils.js';

import { createIcons, icons } from 'lucide';
import * as pdfjsLib from 'pdfjs-dist';
import Sortable from 'sortablejs';

// @ts-ignore
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

interface MergeState {
    pdfDocs: Record<string, any>;
    pdfBytes: Record<string, ArrayBuffer>;
    activeMode: 'file' | 'page';
    sortableInstances: {
        fileList?: Sortable;
        pageThumbnails?: Sortable;
    };
    isRendering: boolean;
    cachedThumbnails: boolean | null;
    lastFileHash: string | null;
    mergeSuccess: boolean;
}

const mergeState: MergeState = {
    pdfDocs: {},
    pdfBytes: {},
    activeMode: 'file',
    sortableInstances: {},
    isRendering: false,
    cachedThumbnails: null,
    lastFileHash: null,
    mergeSuccess: false,
};

const mergeWorker = new Worker(import.meta.env.BASE_URL + 'workers/merge.worker.js');

function initializeFileListSortable() {
    const fileList = document.getElementById('file-list');
    if (!fileList) return;

    if (mergeState.sortableInstances.fileList) {
        mergeState.sortableInstances.fileList.destroy();
    }

    mergeState.sortableInstances.fileList = Sortable.create(fileList, {
        handle: '.drag-handle',
        animation: 150,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        onStart: function (evt: any) {
            evt.item.style.opacity = '0.5';
        },
        onEnd: function (evt: any) {
            evt.item.style.opacity = '1';
        },
    });
}

function initializePageThumbnailsSortable() {
    const container = document.getElementById('page-merge-preview');
    if (!container) return;

    if (mergeState.sortableInstances.pageThumbnails) {
        mergeState.sortableInstances.pageThumbnails.destroy();
    }

    mergeState.sortableInstances.pageThumbnails = Sortable.create(container, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        onStart: function (evt: any) {
            evt.item.style.opacity = '0.5';
        },
        onEnd: function (evt: any) {
            evt.item.style.opacity = '1';
        },
    });
}

function generateFileHash() {
    return (state.files as File[])
        .map((f) => `${f.name}-${f.size}-${f.lastModified}`)
        .join('|');
}

async function renderPageMergeThumbnails() {
    const container = document.getElementById('page-merge-preview');
    if (!container) return;

    const currentFileHash = generateFileHash();
    const filesChanged = currentFileHash !== mergeState.lastFileHash;

    if (!filesChanged && mergeState.cachedThumbnails !== null) {
        // Simple check to see if it's already rendered to avoid flicker.
        if (container.firstChild) {
            initializePageThumbnailsSortable();
            return;
        }
    }

    if (mergeState.isRendering) {
        return;
    }

    mergeState.isRendering = true;
    container.textContent = '';

    cleanupLazyRendering();

    let totalPages = 0;
    for (const file of state.files) {
        const doc = mergeState.pdfDocs[file.name];
        if (doc) totalPages += doc.numPages;
    }

    try {
        let currentPageNumber = 0;

        // Function to create wrapper element for each page
        const createWrapper = (canvas: HTMLCanvasElement, pageNumber: number, fileName?: string) => {
            const wrapper = document.createElement('div');
            wrapper.className =
                'page-thumbnail relative cursor-move flex flex-col items-center gap-1 p-2 border-2 border-gray-600 hover:border-indigo-500 rounded-lg bg-gray-700 transition-colors';
            wrapper.dataset.fileName = fileName || '';
            wrapper.dataset.pageIndex = (pageNumber - 1).toString();

            const imgContainer = document.createElement('div');
            imgContainer.className = 'relative';

            const img = document.createElement('img');
            img.src = canvas.toDataURL();
            img.className = 'rounded-md shadow-md max-w-full h-auto';

            const pageNumDiv = document.createElement('div');
            pageNumDiv.className =
                'absolute top-1 left-1 bg-indigo-600 text-white text-xs px-2 py-1 rounded-md font-semibold shadow-lg';
            pageNumDiv.textContent = pageNumber.toString();

            imgContainer.append(img, pageNumDiv);

            const fileNamePara = document.createElement('p');
            fileNamePara.className =
                'text-xs text-gray-400 truncate w-full text-center';
            const fullTitle = fileName ? `${fileName} (page ${pageNumber})` : `Page ${pageNumber}`;
            fileNamePara.title = fullTitle;
            fileNamePara.textContent = fileName
                ? `${fileName.substring(0, 10)}... (p${pageNumber})`
                : `Page ${pageNumber}`;

            wrapper.append(imgContainer, fileNamePara);
            return wrapper;
        };

        // Render pages from all files progressively
        for (const file of state.files) {
            const pdfjsDoc = mergeState.pdfDocs[file.name];
            if (!pdfjsDoc) continue;

            // Create a wrapper function that includes the file name
            const createWrapperWithFileName = (canvas: HTMLCanvasElement, pageNumber: number) => {
                return createWrapper(canvas, pageNumber, file.name);
            };

            // Render pages progressively with lazy loading
            await renderPagesProgressively(
                pdfjsDoc,
                container,
                createWrapperWithFileName,
                {
                    batchSize: 8,
                    useLazyLoading: true,
                    lazyLoadMargin: '300px',
                    onProgress: (current, total) => {
                        currentPageNumber++;
                        showLoader(
                            `Rendering page previews...`
                        );
                    },
                    onBatchComplete: () => {
                        createIcons({ icons });
                    }
                }
            );
        }

        mergeState.cachedThumbnails = true;
        mergeState.lastFileHash = currentFileHash;

        initializePageThumbnailsSortable();
    } catch (error) {
        console.error('Error rendering page thumbnails:', error);
        showAlert('Error', 'Failed to render page thumbnails');
    } finally {
        hideLoader();
        mergeState.isRendering = false;
    }
}

const updateUI = async () => {
    const fileControls = document.getElementById('file-controls');
    const mergeOptions = document.getElementById('merge-options');

    if (state.files.length > 0) {
        if (fileControls) fileControls.classList.remove('hidden');
        if (mergeOptions) mergeOptions.classList.remove('hidden');
        await refreshMergeUI();
    } else {
        if (fileControls) fileControls.classList.add('hidden');
        if (mergeOptions) mergeOptions.classList.add('hidden');
        // Clear file list UI
        const fileList = document.getElementById('file-list');
        if (fileList) fileList.innerHTML = '';
    }
};

const resetState = async () => {
    state.files = [];
    state.pdfDoc = null;

    mergeState.pdfDocs = {};
    mergeState.pdfBytes = {};
    mergeState.activeMode = 'file';
    mergeState.cachedThumbnails = null;
    mergeState.lastFileHash = null;
    mergeState.mergeSuccess = false;

    const fileList = document.getElementById('file-list');
    if (fileList) fileList.innerHTML = '';

    const pageMergePreview = document.getElementById('page-merge-preview');
    if (pageMergePreview) pageMergePreview.innerHTML = '';

    const fileModeBtn = document.getElementById('file-mode-btn');
    const pageModeBtn = document.getElementById('page-mode-btn');
    const filePanel = document.getElementById('file-mode-panel');
    const pagePanel = document.getElementById('page-mode-panel');

    if (fileModeBtn && pageModeBtn && filePanel && pagePanel) {
        fileModeBtn.classList.add('bg-indigo-600', 'text-white');
        fileModeBtn.classList.remove('bg-gray-700', 'text-gray-300');
        pageModeBtn.classList.remove('bg-indigo-600', 'text-white');
        pageModeBtn.classList.add('bg-gray-700', 'text-gray-300');

        filePanel.classList.remove('hidden');
        pagePanel.classList.add('hidden');
    }

    await updateUI();
};


export async function merge() {
    showLoader('Merging PDFs...');
    try {
        // @ts-ignore
        const jobs: MergeJob[] = [];
        // @ts-ignore
        const filesToMerge: MergeFile[] = [];
        const uniqueFileNames = new Set<string>();

        if (mergeState.activeMode === 'file') {
            const fileList = document.getElementById('file-list');
            if (!fileList) throw new Error('File list not found');

            const sortedFiles = Array.from(fileList.children)
                .map((li) => {
                    return state.files.find((f) => f.name === (li as HTMLElement).dataset.fileName);
                })
                .filter(Boolean);

            for (const file of sortedFiles) {
                if (!file) continue;
                const safeFileName = file.name.replace(/[^a-zA-Z0-9]/g, '_');
                const rangeInput = document.getElementById(`range-${safeFileName}`) as HTMLInputElement;

                uniqueFileNames.add(file.name);

                if (rangeInput && rangeInput.value.trim()) {
                    jobs.push({
                        fileName: file.name,
                        rangeType: 'specific',
                        rangeString: rangeInput.value.trim()
                    });
                } else {
                    jobs.push({
                        fileName: file.name,
                        rangeType: 'all'
                    });
                }
            }
        } else {
            // Page Mode
            const pageContainer = document.getElementById('page-merge-preview');
            if (!pageContainer) throw new Error('Page container not found');
            const pageElements = Array.from(pageContainer.children);

            const rawPages: { fileName: string; pageIndex: number }[] = [];
            for (const el of pageElements) {
                const element = el as HTMLElement;
                const fileName = element.dataset.fileName;
                const pageIndex = parseInt(element.dataset.pageIndex || '', 10); // 0-based index from dataset

                if (fileName && !isNaN(pageIndex)) {
                    uniqueFileNames.add(fileName);
                    rawPages.push({ fileName, pageIndex });
                }
            }

            // Group contiguous pages
            for (let i = 0; i < rawPages.length; i++) {
                const current = rawPages[i];
                let endPage = current.pageIndex;

                while (
                    i + 1 < rawPages.length &&
                    rawPages[i + 1].fileName === current.fileName &&
                    rawPages[i + 1].pageIndex === endPage + 1
                ) {
                    endPage++;
                    i++;
                }

                if (endPage === current.pageIndex) {
                    // Single page
                    jobs.push({
                        fileName: current.fileName,
                        rangeType: 'single',
                        pageIndex: current.pageIndex
                    });
                } else {
                    // Range of pages
                    jobs.push({
                        fileName: current.fileName,
                        rangeType: 'range',
                        startPage: current.pageIndex + 1,
                        endPage: endPage + 1
                    });
                }
            }
        }

        if (jobs.length === 0) {
            showAlert('Error', 'No files or pages selected to merge.');
            hideLoader();
            return;
        }

        for (const name of uniqueFileNames) {
            const bytes = mergeState.pdfBytes[name];
            if (bytes) {
                filesToMerge.push({ name, data: bytes });
            }
        }

        // @ts-ignore
        const message: MergeMessage = {
            command: 'merge',
            files: filesToMerge,
            jobs: jobs
        };

        mergeWorker.postMessage(message, filesToMerge.map(f => f.data));

        // @ts-ignore
        mergeWorker.onmessage = (e: MessageEvent<MergeResponse>) => {
            hideLoader();
            if (e.data.status === 'success') {
                const blob = new Blob([e.data.pdfBytes], { type: 'application/pdf' });
                downloadFile(blob, 'merged.pdf');
                mergeState.mergeSuccess = true;
                showAlert('Success', 'PDFs merged successfully!', 'success', async () => {
                    await resetState();
                });
            } else {
                console.error('Worker merge error:', e.data.message);
                showAlert('Error', e.data.message || 'Failed to merge PDFs.');
            }
        };

        mergeWorker.onerror = (e) => {
            hideLoader();
            console.error('Worker error:', e);
            showAlert('Error', 'An unexpected error occurred in the merge worker.');
        };

    } catch (e) {
        console.error('Merge error:', e);
        showAlert(
            'Error',
            'Failed to merge PDFs. Please check that all files are valid and not password-protected.'
        );
        hideLoader();
    }
}

export async function refreshMergeUI() {
    document.getElementById('merge-options')?.classList.remove('hidden');
    const processBtn = document.getElementById('process-btn') as HTMLButtonElement;
    if (processBtn) processBtn.disabled = false;

    const wasInPageMode = mergeState.activeMode === 'page';

    showLoader('Loading PDF documents...');
    try {
        mergeState.pdfDocs = {};
        mergeState.pdfBytes = {};

        for (const file of state.files) {
            const pdfBytes = await readFileAsArrayBuffer(file);
            mergeState.pdfBytes[file.name] = pdfBytes as ArrayBuffer;

            const bytesForPdfJs = (pdfBytes as ArrayBuffer).slice(0);
            const pdfjsDoc = await getPDFDocument({ data: bytesForPdfJs }).promise;
            mergeState.pdfDocs[file.name] = pdfjsDoc;
        }
    } catch (error) {
        console.error('Error loading PDFs:', error);
        showAlert('Error', 'Failed to load one or more PDF files');
        return;
    } finally {
        hideLoader();
    }

    const fileModeBtn = document.getElementById('file-mode-btn');
    const pageModeBtn = document.getElementById('page-mode-btn');
    const filePanel = document.getElementById('file-mode-panel');
    const pagePanel = document.getElementById('page-mode-panel');
    const fileList = document.getElementById('file-list');

    if (!fileModeBtn || !pageModeBtn || !filePanel || !pagePanel || !fileList) return;

    fileList.textContent = ''; // Clear list safely
    (state.files as File[]).forEach((f, index) => {
        const doc = mergeState.pdfDocs[f.name];
        const pageCount = doc ? doc.numPages : 'N/A';
        const safeFileName = f.name.replace(/[^a-zA-Z0-9]/g, '_');

        const li = document.createElement('li');
        li.className =
            'bg-gray-700 p-3 rounded-lg border border-gray-600 hover:border-indigo-500 transition-colors';
        li.dataset.fileName = f.name;

        const mainDiv = document.createElement('div');
        mainDiv.className = 'flex items-center justify-between';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'truncate font-medium text-white flex-1 mr-2';
        nameSpan.title = f.name;
        nameSpan.textContent = f.name;

        const dragHandle = document.createElement('div');
        dragHandle.className =
            'drag-handle cursor-move text-gray-400 hover:text-white p-1 rounded transition-colors';
        dragHandle.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="5" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="19" r="1"/></svg>`; // Safe: static content

        mainDiv.append(nameSpan, dragHandle);

        const rangeDiv = document.createElement('div');
        rangeDiv.className = 'mt-2 flex items-center gap-2';

        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'flex-1';

        const label = document.createElement('label');
        label.htmlFor = `range-${safeFileName}`;
        label.className = 'text-xs text-gray-400';
        label.textContent = `Pages (e.g., 1-3, 5) - Total: ${pageCount}`;

        const input = document.createElement('input');
        input.type = 'text';
        input.id = `range-${safeFileName}`;
        input.className =
            'w-full bg-gray-800 border border-gray-600 text-white rounded-md p-2 text-sm mt-1 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors';
        input.placeholder = 'Leave blank for all pages';

        inputWrapper.append(label, input);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'text-red-400 hover:text-red-300 p-2 flex-shrink-0 self-end';
        deleteBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
        deleteBtn.title = 'Remove file';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            state.files = state.files.filter((_, i) => i !== index);
            updateUI();
        };

        rangeDiv.append(inputWrapper, deleteBtn);
        li.append(mainDiv, rangeDiv);
        fileList.appendChild(li);
    });

    createIcons({ icons });
    initializeFileListSortable();

    const newFileModeBtn = fileModeBtn.cloneNode(true) as HTMLElement;
    const newPageModeBtn = pageModeBtn.cloneNode(true) as HTMLElement;
    fileModeBtn.replaceWith(newFileModeBtn);
    pageModeBtn.replaceWith(newPageModeBtn);

    newFileModeBtn.addEventListener('click', () => {
        if (mergeState.activeMode === 'file') return;

        mergeState.activeMode = 'file';
        filePanel.classList.remove('hidden');
        pagePanel.classList.add('hidden');

        newFileModeBtn.classList.add('bg-indigo-600', 'text-white');
        newFileModeBtn.classList.remove('bg-gray-700', 'text-gray-300');
        newPageModeBtn.classList.remove('bg-indigo-600', 'text-white');
        newPageModeBtn.classList.add('bg-gray-700', 'text-gray-300');
    });

    newPageModeBtn.addEventListener('click', async () => {
        if (mergeState.activeMode === 'page') return;

        mergeState.activeMode = 'page';
        filePanel.classList.add('hidden');
        pagePanel.classList.remove('hidden');

        newPageModeBtn.classList.add('bg-indigo-600', 'text-white');
        newPageModeBtn.classList.remove('bg-gray-700', 'text-gray-300');
        newFileModeBtn.classList.remove('bg-indigo-600', 'text-white');
        newFileModeBtn.classList.add('bg-gray-700', 'text-gray-300');

        await renderPageMergeThumbnails();
    });

    if (wasInPageMode) {
        mergeState.activeMode = 'page';
        filePanel.classList.add('hidden');
        pagePanel.classList.remove('hidden');

        newPageModeBtn.classList.add('bg-indigo-600', 'text-white');
        newPageModeBtn.classList.remove('bg-gray-700', 'text-gray-300');
        newFileModeBtn.classList.remove('bg-indigo-600', 'text-white');
        newFileModeBtn.classList.add('bg-gray-700', 'text-gray-300');

        await renderPageMergeThumbnails();
    } else {
        newFileModeBtn.classList.add('bg-indigo-600', 'text-white');
        newPageModeBtn.classList.add('bg-gray-700', 'text-gray-300');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    const dropZone = document.getElementById('drop-zone');
    const processBtn = document.getElementById('process-btn');

    const fileControls = document.getElementById('file-controls');
    const addMoreBtn = document.getElementById('add-more-btn');
    const clearFilesBtn = document.getElementById('clear-files-btn');
    const backBtn = document.getElementById('back-to-tools');
    const mergeOptions = document.getElementById('merge-options');

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = import.meta.env.BASE_URL;
        });
    }



    if (fileInput && dropZone) {
        fileInput.addEventListener('change', async (e) => {
            const files = (e.target as HTMLInputElement).files;
            if (files && files.length > 0) {
                state.files = [...state.files, ...Array.from(files)];
                await updateUI();
            }
        });

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('bg-gray-700');
        });

        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.classList.remove('bg-gray-700');
        });

        dropZone.addEventListener('drop', async (e) => {
            e.preventDefault();
            dropZone.classList.remove('bg-gray-700');
            const files = e.dataTransfer?.files;
            if (files && files.length > 0) {
                const pdfFiles = Array.from(files).filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
                if (pdfFiles.length > 0) {
                    state.files = [...state.files, ...pdfFiles];
                    await updateUI();
                }
            }
        });


        fileInput.addEventListener('click', () => {
            fileInput.value = '';
        });
    }

    if (addMoreBtn) {
        addMoreBtn.addEventListener('click', () => {
            fileInput.value = '';
            fileInput.click();
        });
    }

    if (clearFilesBtn) {
        clearFilesBtn.addEventListener('click', async () => {
            state.files = [];
            await updateUI();
        });
    }

    if (processBtn) {
        processBtn.addEventListener('click', async () => {
            await merge();
        });
    }


});
