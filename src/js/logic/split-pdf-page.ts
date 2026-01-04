import { showLoader, hideLoader, showAlert } from '../ui.js';
import { createIcons, icons } from 'lucide';
import * as pdfjsLib from 'pdfjs-dist';
import { downloadFile, getPDFDocument, readFileAsArrayBuffer, formatBytes } from '../utils/helpers.js';
import { state } from '../state.js';
import { renderPagesProgressively, cleanupLazyRendering } from '../utils/render-utils.js';
import JSZip from 'jszip';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';

// @ts-ignore
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

document.addEventListener('DOMContentLoaded', () => {
    let visualSelectorRendered = false;

    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    const dropZone = document.getElementById('drop-zone');
    const processBtn = document.getElementById('process-btn');
    const fileDisplayArea = document.getElementById('file-display-area');
    const splitOptions = document.getElementById('split-options');
    const backBtn = document.getElementById('back-to-tools');

    // Split Mode Elements
    const splitModeSelect = document.getElementById('split-mode') as HTMLSelectElement;
    const rangePanel = document.getElementById('range-panel');
    const visualPanel = document.getElementById('visual-select-panel');
    const evenOddPanel = document.getElementById('even-odd-panel');
    const zipOptionWrapper = document.getElementById('zip-option-wrapper');
    const allPagesPanel = document.getElementById('all-pages-panel');
    const bookmarksPanel = document.getElementById('bookmarks-panel');
    const nTimesPanel = document.getElementById('n-times-panel');
    const nTimesWarning = document.getElementById('n-times-warning');

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = import.meta.env.BASE_URL;
        });
    }

    const updateUI = async () => {
        if (state.files.length > 0) {
            const file = state.files[0];
            if (fileDisplayArea) {
                fileDisplayArea.innerHTML = '';
                const fileDiv = document.createElement('div');
                fileDiv.className = 'flex items-center justify-between bg-gray-700 p-3 rounded-lg text-sm';

                const infoContainer = document.createElement('div');
                infoContainer.className = 'flex flex-col overflow-hidden';

                const nameSpan = document.createElement('div');
                nameSpan.className = 'truncate font-medium text-gray-200 text-sm mb-1';
                nameSpan.textContent = file.name;

                const metaSpan = document.createElement('div');
                metaSpan.className = 'text-xs text-gray-400';
                metaSpan.textContent = `${formatBytes(file.size)} • Loading pages...`; // Placeholder

                infoContainer.append(nameSpan, metaSpan);

                // Add remove button
                const removeBtn = document.createElement('button');
                removeBtn.className = 'ml-4 text-red-400 hover:text-red-300 flex-shrink-0';
                removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
                removeBtn.onclick = () => {
                    state.files = [];
                    state.pdfDoc = null;
                    updateUI();
                };

                fileDiv.append(infoContainer, removeBtn);
                fileDisplayArea.appendChild(fileDiv);
                createIcons({ icons });

                // Load PDF Document
                try {
                    if (!state.pdfDoc) {
                        showLoader('Loading PDF...');
                        const arrayBuffer = await readFileAsArrayBuffer(file) as ArrayBuffer;
                        state.pdfDoc = await PDFLibDocument.load(arrayBuffer);
                        hideLoader();
                    }
                    // Update page count
                    metaSpan.textContent = `${formatBytes(file.size)} • ${state.pdfDoc.getPageCount()} pages`;
                } catch (error) {
                    console.error('Error loading PDF:', error);
                    showAlert('Error', 'Failed to load PDF file.');
                    state.files = [];
                    updateUI();
                    return;
                }
            }

            if (splitOptions) splitOptions.classList.remove('hidden');

        } else {
            if (fileDisplayArea) fileDisplayArea.innerHTML = '';
            if (splitOptions) splitOptions.classList.add('hidden');
            state.pdfDoc = null;
        }
    };

    const renderVisualSelector = async () => {
        if (visualSelectorRendered) return;

        const container = document.getElementById('page-selector-grid');
        if (!container) return;

        visualSelectorRendered = true;
        container.textContent = '';

        // Cleanup any previous lazy loading observers
        cleanupLazyRendering();

        showLoader('Rendering page previews...');

        try {
            if (!state.pdfDoc) {
                // If pdfDoc is not loaded yet (e.g. page refresh), try to load it from the first file
                if (state.files.length > 0) {
                    const file = state.files[0];
                    const arrayBuffer = await readFileAsArrayBuffer(file) as ArrayBuffer;
                    state.pdfDoc = await PDFLibDocument.load(arrayBuffer);
                } else {
                    throw new Error('No PDF document loaded');
                }
            }

            const pdfData = await state.pdfDoc.save();
            const pdf = await getPDFDocument({ data: pdfData }).promise;

            // Function to create wrapper element for each page
            const createWrapper = (canvas: HTMLCanvasElement, pageNumber: number) => {
                const wrapper = document.createElement('div');
                wrapper.className =
                    'page-thumbnail-wrapper p-1 border-2 border-transparent rounded-lg cursor-pointer hover:border-indigo-500 relative';
                wrapper.dataset.pageIndex = (pageNumber - 1).toString();

                const img = document.createElement('img');
                img.src = canvas.toDataURL();
                img.className = 'rounded-md w-full h-auto';

                const p = document.createElement('p');
                p.className = 'text-center text-xs mt-1 text-gray-300';
                p.textContent = `Page ${pageNumber}`;

                wrapper.append(img, p);

                const handleSelection = (e: any) => {
                    e.preventDefault();
                    e.stopPropagation();

                    const isSelected = wrapper.classList.contains('selected');

                    if (isSelected) {
                        wrapper.classList.remove('selected', 'border-indigo-500');
                        wrapper.classList.add('border-transparent');
                    } else {
                        wrapper.classList.add('selected', 'border-indigo-500');
                        wrapper.classList.remove('border-transparent');
                    }
                };

                wrapper.addEventListener('click', handleSelection);
                wrapper.addEventListener('touchend', handleSelection);

                wrapper.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                });

                return wrapper;
            };

            // Render pages progressively with lazy loading
            await renderPagesProgressively(
                pdf,
                container,
                createWrapper,
                {
                    batchSize: 8,
                    useLazyLoading: true,
                    lazyLoadMargin: '400px',
                    onProgress: (current, total) => {
                        showLoader(`Rendering page previews: ${current}/${total}`);
                    },
                    onBatchComplete: () => {
                        createIcons({ icons });
                    }
                }
            );
        } catch (error) {
            console.error('Error rendering visual selector:', error);
            showAlert('Error', 'Failed to render page previews.');
            // Reset the flag on error so the user can try again.
            visualSelectorRendered = false;
        } finally {
            hideLoader();
        }
    };

    const resetState = () => {
        state.files = [];
        state.pdfDoc = null;

        // Reset visual selection
        document.querySelectorAll('.page-thumbnail-wrapper.selected').forEach(el => {
            el.classList.remove('selected', 'border-indigo-500');
            el.classList.add('border-transparent');
        });
        visualSelectorRendered = false;
        const container = document.getElementById('page-selector-grid');
        if (container) container.innerHTML = '';

        // Reset inputs
        const pageRangeInput = document.getElementById('page-range') as HTMLInputElement;
        if (pageRangeInput) pageRangeInput.value = '';

        const nValueInput = document.getElementById('split-n-value') as HTMLInputElement;
        if (nValueInput) nValueInput.value = '5';

        // Reset radio buttons to default (range)
        const rangeRadio = document.querySelector('input[name="split-mode"][value="range"]') as HTMLInputElement;
        if (rangeRadio) {
            rangeRadio.checked = true;
            rangeRadio.dispatchEvent(new Event('change'));
        }

        // Reset split mode select
        if (splitModeSelect) {
            splitModeSelect.value = 'range';
            splitModeSelect.dispatchEvent(new Event('change'));
        }

        updateUI();
    };

    const split = async () => {
        const splitMode = splitModeSelect.value;
        const downloadAsZip =
            (document.getElementById('download-as-zip') as HTMLInputElement)?.checked ||
            false;

        showLoader('Splitting PDF...');

        try {
            if (!state.pdfDoc) throw new Error('No PDF document loaded.');

            const totalPages = state.pdfDoc.getPageCount();
            let indicesToExtract: number[] = [];

            switch (splitMode) {
                case 'range':
                    const pageRangeInput = (document.getElementById('page-range') as HTMLInputElement).value;
                    if (!pageRangeInput) throw new Error('Choose a valid page range.');
                    const ranges = pageRangeInput.split(',');
                    
                    const rangeGroups: number[][] = [];
                    for (const range of ranges) {
                        const trimmedRange = range.trim();
                        if (!trimmedRange) continue;
                        
                        const groupIndices: number[] = [];
                        if (trimmedRange.includes('-')) {
                            const [start, end] = trimmedRange.split('-').map(Number);
                            if (
                                isNaN(start) ||
                                isNaN(end) ||
                                start < 1 ||
                                end > totalPages ||
                                start > end
                            )
                                continue;
                            for (let i = start; i <= end; i++) groupIndices.push(i - 1);
                        } else {
                            const pageNum = Number(trimmedRange);
                            if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) continue;
                            groupIndices.push(pageNum - 1);
                        }
                        
                        if (groupIndices.length > 0) {
                            rangeGroups.push(groupIndices);
                            indicesToExtract.push(...groupIndices);
                        }
                    }
                    
                    if (rangeGroups.length > 1) {
                        showLoader('Creating separate PDFs for each range...');
                        const zip = new JSZip();
                        
                        for (let i = 0; i < rangeGroups.length; i++) {
                            const group = rangeGroups[i];
                            const newPdf = await PDFLibDocument.create();
                            const copiedPages = await newPdf.copyPages(state.pdfDoc, group);
                            copiedPages.forEach((page: any) => newPdf.addPage(page));
                            const pdfBytes = await newPdf.save();
                            
                            const minPage = Math.min(...group) + 1;
                            const maxPage = Math.max(...group) + 1;
                            const filename = minPage === maxPage 
                                ? `page-${minPage}.pdf` 
                                : `pages-${minPage}-${maxPage}.pdf`;
                            zip.file(filename, pdfBytes);
                        }
                        
                        const zipBlob = await zip.generateAsync({ type: 'blob' });
                        downloadFile(zipBlob, 'split-pages.zip');
                        hideLoader();
                        showAlert('Success', `PDF split into ${rangeGroups.length} files successfully!`, 'success', () => {
                            resetState();
                        });
                        return;
                    }
                    break;

                case 'even-odd':
                    const choiceElement = document.querySelector(
                        'input[name="even-odd-choice"]:checked'
                    ) as HTMLInputElement;
                    if (!choiceElement) throw new Error('Please select even or odd pages.');
                    const choice = choiceElement.value;
                    for (let i = 0; i < totalPages; i++) {
                        if (choice === 'even' && (i + 1) % 2 === 0) indicesToExtract.push(i);
                        if (choice === 'odd' && (i + 1) % 2 !== 0) indicesToExtract.push(i);
                    }
                    break;
                case 'all':
                    indicesToExtract = Array.from({ length: totalPages }, (_, i) => i);
                    break;
                case 'visual':
                    indicesToExtract = Array.from(
                        document.querySelectorAll('.page-thumbnail-wrapper.selected')
                    )
                        .map((el) => parseInt((el as HTMLElement).dataset.pageIndex || '0'));
                    break;
                case 'bookmarks':
                    const { getCpdf } = await import('../utils/cpdf-helper.js');
                    const cpdf = await getCpdf();
                    const pdfBytes = await state.pdfDoc.save();
                    const pdf = cpdf.fromMemory(new Uint8Array(pdfBytes), '');

                    cpdf.startGetBookmarkInfo(pdf);
                    const bookmarkCount = cpdf.numberBookmarks();
                    const bookmarkLevel = (document.getElementById('bookmark-level') as HTMLSelectElement)?.value;

                    const splitPages: number[] = [];
                    for (let i = 0; i < bookmarkCount; i++) {
                        const level = cpdf.getBookmarkLevel(i);
                        const page = cpdf.getBookmarkPage(pdf, i);

                        if (bookmarkLevel === 'all' || level === parseInt(bookmarkLevel)) {
                            if (page > 1 && !splitPages.includes(page - 1)) {
                                splitPages.push(page - 1); // Convert to 0-based index
                            }
                        }
                    }
                    cpdf.endGetBookmarkInfo();
                    cpdf.deletePdf(pdf);

                    if (splitPages.length === 0) {
                        throw new Error('No bookmarks found at the selected level.');
                    }

                    splitPages.sort((a, b) => a - b);
                    const zip = new JSZip();

                    for (let i = 0; i < splitPages.length; i++) {
                        const startPage = i === 0 ? 0 : splitPages[i];
                        const endPage = i < splitPages.length - 1 ? splitPages[i + 1] - 1 : totalPages - 1;

                        const newPdf = await PDFLibDocument.create();
                        const pageIndices = Array.from({ length: endPage - startPage + 1 }, (_, idx) => startPage + idx);
                        const copiedPages = await newPdf.copyPages(state.pdfDoc, pageIndices);
                        copiedPages.forEach((page: any) => newPdf.addPage(page));
                        const pdfBytes2 = await newPdf.save();
                        zip.file(`split-${i + 1}.pdf`, pdfBytes2);
                    }

                    const zipBlob = await zip.generateAsync({ type: 'blob' });
                    downloadFile(zipBlob, 'split-by-bookmarks.zip');
                    hideLoader();
                    showAlert('Success', 'PDF split successfully!', 'success', () => {
                        resetState();
                    });
                    return;

                case 'n-times':
                    const nValue = parseInt((document.getElementById('split-n-value') as HTMLInputElement)?.value || '5');
                    if (nValue < 1) throw new Error('N must be at least 1.');

                    const zip2 = new JSZip();
                    const numSplits = Math.ceil(totalPages / nValue);

                    for (let i = 0; i < numSplits; i++) {
                        const startPage = i * nValue;
                        const endPage = Math.min(startPage + nValue - 1, totalPages - 1);
                        const pageIndices = Array.from({ length: endPage - startPage + 1 }, (_, idx) => startPage + idx);

                        const newPdf = await PDFLibDocument.create();
                        const copiedPages = await newPdf.copyPages(state.pdfDoc, pageIndices);
                        copiedPages.forEach((page: any) => newPdf.addPage(page));
                        const pdfBytes3 = await newPdf.save();
                        zip2.file(`split-${i + 1}.pdf`, pdfBytes3);
                    }

                    const zipBlob2 = await zip2.generateAsync({ type: 'blob' });
                    downloadFile(zipBlob2, 'split-n-times.zip');
                    hideLoader();
                    showAlert('Success', 'PDF split successfully!', 'success', () => {
                        resetState();
                    });
                    return;
            }

            const uniqueIndices = [...new Set(indicesToExtract)];
            if (uniqueIndices.length === 0 && splitMode !== 'bookmarks' && splitMode !== 'n-times') {
                throw new Error('No pages were selected for splitting.');
            }

            if (
                splitMode === 'all' ||
                (['range', 'visual'].includes(splitMode) && downloadAsZip)
            ) {
                showLoader('Creating ZIP file...');
                const zip = new JSZip();
                for (const index of uniqueIndices) {
                    const newPdf = await PDFLibDocument.create();
                    const [copiedPage] = await newPdf.copyPages(state.pdfDoc, [
                        index as number,
                    ]);
                    newPdf.addPage(copiedPage);
                    const pdfBytes = await newPdf.save();
                    // @ts-ignore
                    zip.file(`page-${index + 1}.pdf`, pdfBytes);
                }
                const zipBlob = await zip.generateAsync({ type: 'blob' });
                downloadFile(zipBlob, 'split-pages.zip');
            } else {
                const newPdf = await PDFLibDocument.create();
                const copiedPages = await newPdf.copyPages(
                    state.pdfDoc,
                    uniqueIndices as number[]
                );
                copiedPages.forEach((page: any) => newPdf.addPage(page));
                const pdfBytes = await newPdf.save();
                downloadFile(
                    new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' }),
                    'split-document.pdf'
                );
            }

            if (splitMode === 'visual') {
                visualSelectorRendered = false;
            }

            showAlert('Success', 'PDF split successfully!', 'success', () => {
                resetState();
            });

        } catch (e: any) {
            console.error(e);
            showAlert(
                'Error',
                e.message || 'Failed to split PDF. Please check your selection.'
            );
        } finally {
            hideLoader();
        }
    };

    const handleFileSelect = async (files: FileList | null) => {
        if (files && files.length > 0) {
            // Split tool only supports one file at a time
            state.files = [files[0]];
            await updateUI();
        }
    };

    if (fileInput && dropZone) {
        fileInput.addEventListener('change', (e) => {
            handleFileSelect((e.target as HTMLInputElement).files);
        });

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('bg-gray-700');
        });

        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.classList.remove('bg-gray-700');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('bg-gray-700');
            const files = e.dataTransfer?.files;
            if (files) {
                const pdfFiles = Array.from(files).filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
                if (pdfFiles.length > 0) {
                    // Take only the first PDF
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(pdfFiles[0]);
                    handleFileSelect(dataTransfer.files);
                }
            }
        });

        // Clear value on click to allow re-selecting the same file
        fileInput.addEventListener('click', () => {
            fileInput.value = '';
        });
    }

    if (splitModeSelect) {
        splitModeSelect.addEventListener('change', (e) => {
            const mode = (e.target as HTMLSelectElement).value;

            if (mode !== 'visual') {
                visualSelectorRendered = false;
                const container = document.getElementById('page-selector-grid');
                if (container) container.innerHTML = '';
            }

            rangePanel?.classList.add('hidden');
            visualPanel?.classList.add('hidden');
            evenOddPanel?.classList.add('hidden');
            allPagesPanel?.classList.add('hidden');
            bookmarksPanel?.classList.add('hidden');
            nTimesPanel?.classList.add('hidden');
            zipOptionWrapper?.classList.add('hidden');
            if (nTimesWarning) nTimesWarning.classList.add('hidden');

            if (mode === 'range') {
                rangePanel?.classList.remove('hidden');
                zipOptionWrapper?.classList.remove('hidden');
            } else if (mode === 'visual') {
                visualPanel?.classList.remove('hidden');
                zipOptionWrapper?.classList.remove('hidden');
                renderVisualSelector();
            } else if (mode === 'even-odd') {
                evenOddPanel?.classList.remove('hidden');
            } else if (mode === 'all') {
                allPagesPanel?.classList.remove('hidden');
            } else if (mode === 'bookmarks') {
                bookmarksPanel?.classList.remove('hidden');
                zipOptionWrapper?.classList.remove('hidden');
            } else if (mode === 'n-times') {
                nTimesPanel?.classList.remove('hidden');
                zipOptionWrapper?.classList.remove('hidden');

                const updateWarning = () => {
                    if (!state.pdfDoc) return;
                    const totalPages = state.pdfDoc.getPageCount();
                    const nValue = parseInt((document.getElementById('split-n-value') as HTMLInputElement)?.value || '5');
                    const remainder = totalPages % nValue;
                    if (remainder !== 0 && nTimesWarning) {
                        nTimesWarning.classList.remove('hidden');
                        const warningText = document.getElementById('n-times-warning-text');
                        if (warningText) {
                            warningText.textContent = `The PDF has ${totalPages} pages, which is not evenly divisible by ${nValue}. The last PDF will contain ${remainder} page(s).`;
                        }
                    } else if (nTimesWarning) {
                        nTimesWarning.classList.add('hidden');
                    }
                };

                updateWarning();
                document.getElementById('split-n-value')?.addEventListener('input', updateWarning);
            }
        });
    }

    if (processBtn) {
        processBtn.addEventListener('click', split);
    }
});
