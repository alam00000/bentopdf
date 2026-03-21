import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, formatBytes, hexToRgb, getPDFDocument } from '../utils/helpers.js';
import { createIcons, icons } from 'lucide';
import { PDFDocument as PDFLibDocument, rgb } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { CombineSinglePageState } from '@/types';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

const pageState: CombineSinglePageState = {
    file: null,
    pdfDoc: null,
};

function resetState() {
    pageState.file = null;
    pageState.pdfDoc = null;

    const fileDisplayArea = document.getElementById('file-display-area');
    if (fileDisplayArea) fileDisplayArea.innerHTML = '';

    const toolOptions = document.getElementById('tool-options');
    if (toolOptions) toolOptions.classList.add('hidden');

    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
}

async function updateUI() {
    const fileDisplayArea = document.getElementById('file-display-area');
    const toolOptions = document.getElementById('tool-options');

    if (!fileDisplayArea) return;

    fileDisplayArea.innerHTML = '';

    if (pageState.file) {
        const fileDiv = document.createElement('div');
        fileDiv.className = 'flex items-center justify-between bg-gray-700 p-3 rounded-lg text-sm';

        const infoContainer = document.createElement('div');
        infoContainer.className = 'flex flex-col overflow-hidden';

        const nameSpan = document.createElement('div');
        nameSpan.className = 'truncate font-medium text-gray-200 text-sm mb-1';
        nameSpan.textContent = pageState.file.name;

        const metaSpan = document.createElement('div');
        metaSpan.className = 'text-xs text-gray-400';
        metaSpan.textContent = `${formatBytes(pageState.file.size)} • Loading...`;

        infoContainer.append(nameSpan, metaSpan);

        const removeBtn = document.createElement('button');
        removeBtn.className = 'ml-4 text-red-400 hover:text-red-300 flex-shrink-0';
        removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
        removeBtn.onclick = function () {
            resetState();
        };

        fileDiv.append(infoContainer, removeBtn);
        fileDisplayArea.appendChild(fileDiv);
        createIcons({ icons });

        try {
            showLoader('Loading PDF...');
            const arrayBuffer = await pageState.file.arrayBuffer();
            pageState.pdfDoc = await PDFLibDocument.load(arrayBuffer, {
                ignoreEncryption: true,
                throwOnInvalidObject: false
            });
            hideLoader();

            const pageCount = pageState.pdfDoc.getPageCount();
            metaSpan.textContent = `${formatBytes(pageState.file.size)} • ${pageCount} pages`;

            if (toolOptions) toolOptions.classList.remove('hidden');
        } catch (error) {
            console.error('Error loading PDF:', error);
            hideLoader();
            showAlert('Error', 'Failed to load PDF file.');
            resetState();
        }
    } else {
        if (toolOptions) toolOptions.classList.add('hidden');
    }
}

async function combineToSinglePage() {
    if (!pageState.pdfDoc || !pageState.file) {
        showAlert('Error', 'Please upload a PDF first.');
        return;
    }

    const orientation = (document.getElementById('combine-orientation') as HTMLSelectElement).value;
    const spacing = parseInt((document.getElementById('page-spacing') as HTMLInputElement).value) || 0;
    const backgroundColorHex = (document.getElementById('background-color') as HTMLInputElement).value;
    const addSeparator = (document.getElementById('add-separator') as HTMLInputElement).checked;
    const separatorThickness = parseFloat((document.getElementById('separator-thickness') as HTMLInputElement).value) || 0.5;
    const separatorColorHex = (document.getElementById('separator-color') as HTMLInputElement).value;

    const backgroundColor = hexToRgb(backgroundColorHex);
    const separatorColor = hexToRgb(separatorColorHex);

    showLoader('Combining pages...');

    try {
        const sourceDoc = pageState.pdfDoc;
        const newDoc = await PDFLibDocument.create();

        const pdfBytes = await sourceDoc.save();
        const pdfjsDoc = await getPDFDocument({ data: pdfBytes }).promise;

        const sourcePages = sourceDoc.getPages();
        let maxWidth = 0;
        let maxHeight = 0;
        let totalWidth = 0;
        let totalHeight = 0;

        sourcePages.forEach(function (page) {
            const { width, height } = page.getSize();
            if (width > maxWidth) maxWidth = width;
            if (height > maxHeight) maxHeight = height;
            totalWidth += width;
            totalHeight += height;
        });

        let finalWidth: number, finalHeight: number;
        if (orientation === 'horizontal') {
            finalWidth = totalWidth + Math.max(0, sourcePages.length - 1) * spacing;
            finalHeight = maxHeight;
        } else {
            finalWidth = maxWidth;
            finalHeight = totalHeight + Math.max(0, sourcePages.length - 1) * spacing;
        }

        const newPage = newDoc.addPage([finalWidth, finalHeight]);

        if (backgroundColorHex.toUpperCase() !== '#FFFFFF') {
            newPage.drawRectangle({
                x: 0,
                y: 0,
                width: finalWidth,
                height: finalHeight,
                color: rgb(backgroundColor.r, backgroundColor.g, backgroundColor.b),
            });
        }

        let currentX = 0;
        let currentY = finalHeight;

        for (let i = 0; i < sourcePages.length; i++) {
            showLoader(`Processing page ${i + 1} of ${sourcePages.length}...`);
            const sourcePage = sourcePages[i];
            const { width, height } = sourcePage.getSize();

            try {
                const page = await pdfjsDoc.getPage(i + 1);
                const scale = 2.0;
                const viewport = page.getViewport({ scale });

                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const context = canvas.getContext('2d')!;

                await page.render({
                    canvasContext: context,
                    viewport,
                    canvas
                }).promise;

                const pngDataUrl = canvas.toDataURL('image/png');
                const pngImage = await newDoc.embedPng(pngDataUrl);

                if (orientation === 'horizontal') {
                    const y = (finalHeight - height) / 2;
                    newPage.drawImage(pngImage, { x: currentX, y, width, height });
                } else {
                    currentY -= height;
                    const x = (finalWidth - width) / 2;
                    newPage.drawImage(pngImage, { x, y: currentY, width, height });
                }
            } catch (renderError) {
                console.warn(`Failed to render page ${i + 1}:`, renderError);
            }

            if (addSeparator && i < sourcePages.length - 1) {
                if (orientation === 'horizontal') {
                    const lineX = currentX + width + spacing / 2;
                    newPage.drawLine({
                        start: { x: lineX, y: 0 },
                        end: { x: lineX, y: finalHeight },
                        thickness: separatorThickness,
                        color: rgb(separatorColor.r, separatorColor.g, separatorColor.b),
                    });
                    currentX += width + spacing;
                } else {
                    const lineY = currentY - spacing / 2;
                    newPage.drawLine({
                        start: { x: 0, y: lineY },
                        end: { x: finalWidth, y: lineY },
                        thickness: separatorThickness,
                        color: rgb(separatorColor.r, separatorColor.g, separatorColor.b),
                    });
                    currentY -= spacing;
                }
            } else {
                if (orientation === 'horizontal') {
                    currentX += width + spacing;
                } else {
                    currentY -= spacing;
                }
            }
        }

        const newPdfBytes = await newDoc.save();
        const originalName = pageState.file.name.replace(/\.pdf$/i, '');

        downloadFile(
            new Blob([new Uint8Array(newPdfBytes)], { type: 'application/pdf' }),
            `${originalName}_combined.pdf`
        );

        showAlert('Success', 'Pages combined successfully!', 'success', function () {
            resetState();
        });
    } catch (e) {
        console.error(e);
        showAlert('Error', 'An error occurred while combining pages.');
    } finally {
        hideLoader();
    }
}

function handleFileSelect(files: FileList | null) {
    if (files && files.length > 0) {
        const file = files[0];
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
            pageState.file = file;
            updateUI();
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    const dropZone = document.getElementById('drop-zone');
    const processBtn = document.getElementById('process-btn');
    const backBtn = document.getElementById('back-to-tools');
    const addSeparatorCheckbox = document.getElementById('add-separator');
    const separatorOptions = document.getElementById('separator-options');

    if (backBtn) {
        backBtn.addEventListener('click', function () {
            window.location.href = import.meta.env.BASE_URL;
        });
    }

    if (addSeparatorCheckbox && separatorOptions) {
        addSeparatorCheckbox.addEventListener('change', function () {
            if ((addSeparatorCheckbox as HTMLInputElement).checked) {
                separatorOptions.classList.remove('hidden');
            } else {
                separatorOptions.classList.add('hidden');
            }
        });
    }

    if (fileInput && dropZone) {
        fileInput.addEventListener('change', function (e) {
            handleFileSelect((e.target as HTMLInputElement).files);
        });

        dropZone.addEventListener('dragover', function (e) {
            e.preventDefault();
            dropZone.classList.add('bg-gray-700');
        });

        dropZone.addEventListener('dragleave', function (e) {
            e.preventDefault();
            dropZone.classList.remove('bg-gray-700');
        });

        dropZone.addEventListener('drop', function (e) {
            e.preventDefault();
            dropZone.classList.remove('bg-gray-700');
            const files = e.dataTransfer?.files;
            if (files && files.length > 0) {
                const pdfFiles = Array.from(files).filter(function (f) {
                    return f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
                });
                if (pdfFiles.length > 0) {
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(pdfFiles[0]);
                    handleFileSelect(dataTransfer.files);
                }
            }
        });

        fileInput.addEventListener('click', function () {
            fileInput.value = '';
        });
    }

    if (processBtn) {
        processBtn.addEventListener('click', combineToSinglePage);
    }
});
