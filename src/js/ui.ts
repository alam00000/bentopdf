import { resetState } from './state.js';
import { formatBytes, getPDFDocument } from './utils/helpers.js';
import { tesseractLanguages } from './config/tesseract-languages.js';
import { renderPagesProgressively, cleanupLazyRendering } from './utils/render-utils.js';
import { icons, createIcons } from 'lucide';
import Sortable from 'sortablejs';
import { getRotationState, updateRotationState } from './utils/rotation-state.js';
import * as pdfjsLib from 'pdfjs-dist';
import { t } from './i18n/i18n';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();


// Centralizing DOM element selection
export const dom = {
    gridView: document.getElementById('grid-view'),
    toolGrid: document.getElementById('tool-grid'),
    toolInterface: document.getElementById('tool-interface'),
    toolContent: document.getElementById('tool-content'),
    backToGridBtn: document.getElementById('back-to-grid'),
    loaderModal: document.getElementById('loader-modal'),
    loaderText: document.getElementById('loader-text'),
    alertModal: document.getElementById('alert-modal'),
    alertTitle: document.getElementById('alert-title'),
    alertMessage: document.getElementById('alert-message'),
    alertOkBtn: document.getElementById('alert-ok'),
    heroSection: document.getElementById('hero-section'),
    featuresSection: document.getElementById('features-section'),
    toolsHeader: document.getElementById('tools-header'),
    dividers: document.querySelectorAll('.section-divider'),
    hideSections: document.querySelectorAll('.hide-section'),
    shortcutsModal: document.getElementById('shortcuts-modal'),
    closeShortcutsModalBtn: document.getElementById('close-shortcuts-modal'),
    shortcutsList: document.getElementById('shortcuts-list'),
    shortcutSearch: document.getElementById('shortcut-search'),
    resetShortcutsBtn: document.getElementById('reset-shortcuts-btn'),
    importShortcutsBtn: document.getElementById('import-shortcuts-btn'),
    exportShortcutsBtn: document.getElementById('export-shortcuts-btn'),
    openShortcutsBtn: document.getElementById('open-shortcuts-btn'),
    warningModal: document.getElementById('warning-modal'),
    warningTitle: document.getElementById('warning-title'),
    warningMessage: document.getElementById('warning-message'),
    warningCancelBtn: document.getElementById('warning-cancel-btn'),
    warningConfirmBtn: document.getElementById('warning-confirm-btn'),
};

export const showLoader = (text = t('common.loading'), progress?: number) => {
    if (dom.loaderText) dom.loaderText.textContent = text;

    // Add or update progress bar if progress is provided
    const loaderModal = dom.loaderModal;
    if (loaderModal) {
        let progressBar = loaderModal.querySelector('.loader-progress-bar') as HTMLElement;
        let progressContainer = loaderModal.querySelector('.loader-progress-container') as HTMLElement;

        if (progress !== undefined && progress >= 0) {
            // Create progress container if it doesn't exist
            if (!progressContainer) {
                progressContainer = document.createElement('div');
                progressContainer.className = 'loader-progress-container w-64 mt-4';
                progressContainer.innerHTML = `
                    <div class="bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div class="loader-progress-bar bg-indigo-500 h-full transition-all duration-300" style="width: 0%"></div>
                    </div>
                    <p class="loader-progress-text text-xs text-gray-400 mt-1 text-center">0%</p>
                `;
                loaderModal.querySelector('.bg-gray-800')?.appendChild(progressContainer);
                progressBar = progressContainer.querySelector('.loader-progress-bar') as HTMLElement;
            }

            // Update progress
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
            const progressText = progressContainer.querySelector('.loader-progress-text');
            if (progressText) {
                progressText.textContent = `${Math.round(progress)}%`;
            }
            progressContainer.classList.remove('hidden');
        } else {
            // Hide progress bar if no progress provided
            if (progressContainer) {
                progressContainer.classList.add('hidden');
            }
        }

        loaderModal.classList.remove('hidden');
    }
};

export const hideLoader = () => {
    if (dom.loaderModal) dom.loaderModal.classList.add('hidden');
};

export const showAlert = (title: any, message: any, type: string = 'error', callback?: () => void) => {
    if (dom.alertTitle) dom.alertTitle.textContent = title;
    if (dom.alertMessage) dom.alertMessage.textContent = message;
    if (dom.alertModal) dom.alertModal.classList.remove('hidden');

    if (dom.alertOkBtn) {
        const newOkBtn = dom.alertOkBtn.cloneNode(true) as HTMLElement;
        dom.alertOkBtn.replaceWith(newOkBtn);
        dom.alertOkBtn = newOkBtn;

        newOkBtn.addEventListener('click', () => {
            hideAlert();
            if (callback) callback();
        });
    }
};

export const hideAlert = () => {
    if (dom.alertModal) dom.alertModal.classList.add('hidden');
};

export const switchView = (view: any) => {
    if (view === 'grid') {
        dom.gridView.classList.remove('hidden');
        dom.toolInterface.classList.add('hidden');
        // show hero and features and header
        dom.heroSection.classList.remove('hidden');
        dom.featuresSection.classList.remove('hidden');
        dom.toolsHeader.classList.remove('hidden');
        // show dividers
        dom.dividers.forEach((divider) => {
            divider.classList.remove('hidden');
        });
        // show hideSections
        dom.hideSections.forEach((section) => {
            section.classList.remove('hidden');
        });

        resetState();
    } else {
        dom.gridView.classList.add('hidden');
        dom.toolInterface.classList.remove('hidden');
        dom.featuresSection.classList.add('hidden');
        dom.heroSection.classList.add('hidden');
        dom.toolsHeader.classList.add('hidden');
        dom.dividers.forEach((divider) => {
            divider.classList.add('hidden');
        });
        dom.hideSections.forEach((section) => {
            section.classList.add('hidden');
        });
    }
};

const thumbnailState = {
    sortableInstances: {},
};

function initializeOrganizeSortable(containerId: any) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (thumbnailState.sortableInstances[containerId]) {
        thumbnailState.sortableInstances[containerId].destroy();
    }

    thumbnailState.sortableInstances[containerId] = Sortable.create(container, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        filter: '.delete-page-btn',
        preventOnFilter: true,
        onStart: function (evt: any) {
            evt.item.style.opacity = '0.5';
        },
        onEnd: function (evt: any) {
            evt.item.style.opacity = '1';
        },
    });
}

/**
 * Renders page thumbnails for tools like 'Organize' and 'Rotate'.
 * @param {string} toolId The ID of the active tool.
 * @param {object} pdfDoc The loaded pdf-lib document instance.
 */
export const renderPageThumbnails = async (toolId: any, pdfDoc: any) => {
    const containerId = toolId === 'organize' ? 'page-organizer' : toolId === 'delete-pages' ? 'delete-pages-preview' : 'page-rotator';
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    // Cleanup any previous lazy loading observers
    cleanupLazyRendering();

    const currentRenderId = Date.now();
    container.dataset.renderId = currentRenderId.toString();

    showLoader(t('multiTool.renderingTitle'));

    const pdfData = await pdfDoc.save();
    const pdf = await getPDFDocument({ data: pdfData }).promise;

    // Function to create wrapper element for each page
    const createWrapper = (canvas: HTMLCanvasElement, pageNumber: number) => {
        const wrapper = document.createElement('div');
        // @ts-expect-error TS(2322) FIXME: Type 'number' is not assignable to type 'string'.
        wrapper.dataset.pageIndex = pageNumber - 1;

        const imgContainer = document.createElement('div');
        imgContainer.className =
            'w-full h-36 bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-600';

        const img = document.createElement('img');
        img.src = canvas.toDataURL();
        img.className = 'max-w-full max-h-full object-contain';

        imgContainer.appendChild(img);

        if (toolId === 'organize') {
            wrapper.className = 'page-thumbnail relative group';
            wrapper.appendChild(imgContainer);

            const pageNumSpan = document.createElement('span');
            pageNumSpan.className =
                'absolute top-1 left-1 bg-gray-900 bg-opacity-75 text-white text-xs rounded-full px-2 py-1';
            pageNumSpan.textContent = pageNumber.toString();

            const deleteBtn = document.createElement('button');
            deleteBtn.className =
                'delete-page-btn absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center';
            deleteBtn.innerHTML = '&times;';
            deleteBtn.addEventListener('click', (e) => {
                (e.currentTarget as HTMLElement).parentElement.remove();

                // Renumber remaining pages
                const pages = container.querySelectorAll('.page-thumbnail');
                pages.forEach((page, index) => {
                    const numSpan = page.querySelector('span');
                    if (numSpan) {
                        numSpan.textContent = (index + 1).toString();
                    }
                });

                initializeOrganizeSortable(containerId);
            });

            wrapper.append(pageNumSpan, deleteBtn);
        } else if (toolId === 'rotate') {
            wrapper.className = 'page-rotator-item flex flex-col items-center gap-2 relative group';

            // Read rotation from state (handles "Rotate All" on lazy-loaded pages)
            const rotationStateArray = getRotationState();
            const pageIndex = pageNumber - 1;
            const initialRotation = rotationStateArray[pageIndex] || 0;

            wrapper.dataset.rotation = initialRotation.toString();
            img.classList.add('transition-transform', 'duration-300');

            // Apply initial rotation if any
            if (initialRotation !== 0) {
                img.style.transform = `rotate(${initialRotation}deg)`;
            }

            wrapper.appendChild(imgContainer);

            // Page Number Overlay (Top Left)
            const pageNumSpan = document.createElement('span');
            pageNumSpan.className =
                'absolute top-2 left-2 bg-gray-900 bg-opacity-75 text-white text-xs font-medium rounded-md px-2 py-1 shadow-sm z-10 pointer-events-none';
            pageNumSpan.textContent = pageNumber.toString();
            wrapper.appendChild(pageNumSpan);

            const controlsDiv = document.createElement('div');
            controlsDiv.className = 'flex flex-col lg:flex-row items-center justify-center w-full gap-2 px-1';

            // Custom Stepper Component
            const stepperContainer = document.createElement('div');
            stepperContainer.className = 'flex items-center border border-gray-600 rounded-md bg-gray-800 overflow-hidden w-24 h-8';

            const decrementBtn = document.createElement('button');
            decrementBtn.className = 'px-2 h-full text-gray-400 hover:text-white hover:bg-gray-700 border-r border-gray-600 transition-colors flex items-center justify-center';
            decrementBtn.innerHTML = '<i data-lucide="minus" class="w-3 h-3"></i>';

            const angleInput = document.createElement('input');
            angleInput.type = 'number';
            angleInput.className = 'no-spinner w-full h-full bg-transparent text-white text-xs text-center focus:outline-none appearance-none m-0 p-0 border-none';
            angleInput.value = initialRotation.toString();
            angleInput.placeholder = "0";

            const incrementBtn = document.createElement('button');
            incrementBtn.className = 'px-2 h-full text-gray-400 hover:text-white hover:bg-gray-700 border-l border-gray-600 transition-colors flex items-center justify-center';
            incrementBtn.innerHTML = '<i data-lucide="plus" class="w-3 h-3"></i>';

            // Helper to update rotation
            const updateRotation = (newRotation: number) => {
                const card = wrapper; // Closure capture
                const imgEl = card.querySelector('img');
                const pageIndex = pageNumber - 1;

                // Update UI
                angleInput.value = newRotation.toString();
                card.dataset.rotation = newRotation.toString();
                imgEl.style.transform = `rotate(${newRotation}deg)`;

                // Update State
                updateRotationState(pageIndex, newRotation);
            };

            // Event Listeners
            decrementBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const current = parseInt(angleInput.value) || 0;
                updateRotation(current - 1);
            });

            incrementBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const current = parseInt(angleInput.value) || 0;
                updateRotation(current + 1);
            });

            angleInput.addEventListener('change', (e) => {
                e.stopPropagation();
                const val = parseInt((e.target as HTMLInputElement).value) || 0;
                updateRotation(val);
            });
            angleInput.addEventListener('click', (e) => e.stopPropagation());

            stepperContainer.append(decrementBtn, angleInput, incrementBtn);

            const rotateBtn = document.createElement('button');
            rotateBtn.className = 'rotate-btn btn bg-gray-700 hover:bg-gray-600 p-1.5 rounded-md text-gray-200 transition-colors flex-shrink-0';
            rotateBtn.title = 'Rotate +90°';
            rotateBtn.innerHTML = '<i data-lucide="rotate-cw" class="w-4 h-4"></i>';
            rotateBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const current = parseInt(angleInput.value) || 0;
                updateRotation(current + 90);
            });

            controlsDiv.append(stepperContainer, rotateBtn);
            wrapper.appendChild(controlsDiv);
        } else if (toolId === 'delete-pages') {
            wrapper.className = 'page-thumbnail relative group cursor-pointer transition-all duration-200';
            wrapper.dataset.pageNumber = pageNumber.toString();

            const innerContainer = document.createElement('div');
            innerContainer.className = 'relative w-full h-36 bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-600 transition-colors duration-200';
            innerContainer.appendChild(img);
            wrapper.appendChild(innerContainer);

            const pageNumSpan = document.createElement('span');
            pageNumSpan.className =
                'absolute top-2 left-2 bg-gray-900 bg-opacity-75 text-white text-xs font-medium rounded-md px-2 py-1 shadow-sm z-10 pointer-events-none';
            pageNumSpan.textContent = pageNumber.toString();
            wrapper.appendChild(pageNumSpan);

            wrapper.addEventListener('click', () => {
                const input = document.getElementById('pages-to-delete') as HTMLInputElement;
                if (!input) return;

                const currentVal = input.value;
                let pages = currentVal.split(',').map(s => s.trim()).filter(s => s);
                const pageStr = pageNumber.toString();

                if (pages.includes(pageStr)) {
                    pages = pages.filter(p => p !== pageStr);
                } else {
                    pages.push(pageStr);
                }

                pages.sort((a, b) => {
                    const numA = parseInt(a.split('-')[0]);
                    const numB = parseInt(b.split('-')[0]);
                    return numA - numB;
                });

                input.value = pages.join(', ');

                input.dispatchEvent(new Event('input'));
            });
        }

        return wrapper;
    };

    try {
        // Render pages progressively with lazy loading
        await renderPagesProgressively(
            pdf,
            container,
            createWrapper,
            {
                batchSize: 8,
                useLazyLoading: true,
                lazyLoadMargin: '300px',
                onProgress: (current, total) => {
                    showLoader(`Rendering page previews: ${current}/${total}`);
                },
                onBatchComplete: () => {
                    createIcons({ icons });
                },
                shouldCancel: () => {
                    return container.dataset.renderId !== currentRenderId.toString();
                }
            }
        );

        if (toolId === 'organize') {
            initializeOrganizeSortable(containerId);
        } else if (toolId === 'delete-pages') {
            // No sortable needed for delete pages
        }

        // Reinitialize lucide icons for dynamically added elements
        createIcons({ icons });
    } catch (error) {
        console.error('Error rendering page thumbnails:', error);
        showAlert(t('multiTool.error'), t('multiTool.errorRendering'));
    } finally {
        hideLoader();
    }
};

/**
 * Renders a list of uploaded files in the specified container.
 * @param {HTMLElement} container The DOM element to render the list into.
 * @param {File[]} files The array of file objects.
 */
export const renderFileDisplay = (container: any, files: any) => {
    container.textContent = '';
    if (files.length > 0) {
        files.forEach((file: any) => {
            const fileDiv = document.createElement('div');
            fileDiv.className =
                'flex items-center justify-between bg-gray-700 p-3 rounded-lg text-sm';

            const nameSpan = document.createElement('span');
            nameSpan.className = 'truncate font-medium text-gray-200';
            nameSpan.textContent = file.name;

            const sizeSpan = document.createElement('span');
            sizeSpan.className = 'flex-shrink-0 ml-4 text-gray-400';
            sizeSpan.textContent = formatBytes(file.size);

            fileDiv.append(nameSpan, sizeSpan);
            container.appendChild(fileDiv);
        });
    }
};

const createFileInputHTML = (options = {}) => {
    // @ts-expect-error TS(2339) FIXME: Property 'multiple' does not exist on type '{}'.
    const multiple = options.multiple ? 'multiple' : '';
    // @ts-expect-error TS(2339) FIXME: Property 'accept' does not exist on type '{}'.
    const acceptedFiles = options.accept || 'application/pdf';
    // @ts-expect-error TS(2339) FIXME: Property 'showControls' does not exist on type '{}... Remove this comment to see the full error message
    const showControls = options.showControls || false; // NEW: Add this parameter

    return `
        <div id="drop-zone" class="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer bg-gray-900 hover:bg-gray-700 transition-colors duration-300">
            <div class="flex flex-col items-center justify-center pt-5 pb-6">
                <i data-lucide="upload-cloud" class="w-10 h-10 mb-3 text-gray-400"></i>
                <p class="mb-2 text-sm text-gray-400"><span class="font-semibold">${t('upload.clickToSelect')}</span> ${t('upload.orDragAndDrop')}</p>
                <p class="text-xs text-gray-500">${multiple ? t('upload.pdfOrImages') : 'A single PDF file'}</p>
                <p class="text-xs text-gray-500">${t('upload.filesNeverLeave')}</p>
            </div>
            <input id="file-input" type="file" class="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" ${multiple} accept="${acceptedFiles}">
        </div>
        
        ${showControls
            ? `
            <!-- NEW: Add control buttons for multi-file uploads -->
            <div id="file-controls" class="hidden mt-4 flex gap-3">
                <button id="add-more-btn" class="btn bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2">
                    <i data-lucide="plus"></i> ${t('upload.addMore')}
                </button>
                <button id="clear-files-btn" class="btn bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2">
                    <i data-lucide="trash-2"></i> ${t('upload.clearAll')}
                </button>
            </div>
        `
            : ''
        }
    `;
};
