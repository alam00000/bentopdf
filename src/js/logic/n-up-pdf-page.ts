import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, formatBytes, hexToRgb } from '../utils/helpers.js';
import { createIcons, icons } from 'lucide';
import { PDFDocument as PDFLibDocument, rgb, PageSizes } from 'pdf-lib';

interface NUpState {
    file: File | null;
    pdfDoc: PDFLibDocument | null;
}

const pageState: NUpState = {
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

async function nUpTool() {
    if (!pageState.pdfDoc || !pageState.file) {
        showAlert('Error', 'Please upload a PDF first.');
        return;
    }

    const n = parseInt((document.getElementById('pages-per-sheet') as HTMLSelectElement).value);
    const pageSizeKey = (document.getElementById('output-page-size') as HTMLSelectElement).value as keyof typeof PageSizes;
    let orientation = (document.getElementById('output-orientation') as HTMLSelectElement).value;
    const useMargins = (document.getElementById('add-margins') as HTMLInputElement).checked;
    const addBorder = (document.getElementById('add-border') as HTMLInputElement).checked;
    const borderColor = hexToRgb((document.getElementById('border-color') as HTMLInputElement).value);

    showLoader('Creating N-Up PDF...');

    try {
        const sourceDoc = pageState.pdfDoc;
        const newDoc = await PDFLibDocument.create();
        const sourcePages = sourceDoc.getPages();

        const gridDims: Record<number, [number, number]> = { 2: [2, 1], 4: [2, 2], 9: [3, 3], 16: [4, 4] };
        const dims = gridDims[n];

        let [pageWidth, pageHeight] = PageSizes[pageSizeKey];

        if (orientation === 'auto') {
            const firstPage = sourcePages[0];
            const isSourceLandscape = firstPage.getWidth() > firstPage.getHeight();
            orientation = isSourceLandscape && dims[0] > dims[1] ? 'landscape' : 'portrait';
        }

        if (orientation === 'landscape' && pageWidth < pageHeight) {
            [pageWidth, pageHeight] = [pageHeight, pageWidth];
        }

        const margin = useMargins ? 36 : 0;
        const gutter = useMargins ? 10 : 0;

        const usableWidth = pageWidth - margin * 2;
        const usableHeight = pageHeight - margin * 2;

        for (let i = 0; i < sourcePages.length; i += n) {
            showLoader(`Processing sheet ${Math.floor(i / n) + 1}...`);
            const chunk = sourcePages.slice(i, i + n);
            const outputPage = newDoc.addPage([pageWidth, pageHeight]);

            const cellWidth = (usableWidth - gutter * (dims[0] - 1)) / dims[0];
            const cellHeight = (usableHeight - gutter * (dims[1] - 1)) / dims[1];

            for (let j = 0; j < chunk.length; j++) {
                const sourcePage = chunk[j];
                const embeddedPage = await newDoc.embedPage(sourcePage);

                const scale = Math.min(
                    cellWidth / embeddedPage.width,
                    cellHeight / embeddedPage.height
                );
                const scaledWidth = embeddedPage.width * scale;
                const scaledHeight = embeddedPage.height * scale;

                const row = Math.floor(j / dims[0]);
                const col = j % dims[0];
                const cellX = margin + col * (cellWidth + gutter);
                const cellY = pageHeight - margin - (row + 1) * cellHeight - row * gutter;

                const x = cellX + (cellWidth - scaledWidth) / 2;
                const y = cellY + (cellHeight - scaledHeight) / 2;

                outputPage.drawPage(embeddedPage, {
                    x,
                    y,
                    width: scaledWidth,
                    height: scaledHeight,
                });

                if (addBorder) {
                    outputPage.drawRectangle({
                        x,
                        y,
                        width: scaledWidth,
                        height: scaledHeight,
                        borderColor: rgb(borderColor.r, borderColor.g, borderColor.b),
                        borderWidth: 1,
                    });
                }
            }
        }

        const newPdfBytes = await newDoc.save();
        const originalName = pageState.file.name.replace(/\.pdf$/i, '');

        downloadFile(
            new Blob([new Uint8Array(newPdfBytes)], { type: 'application/pdf' }),
            `${originalName}_${n}-up.pdf`
        );

        showAlert('Success', 'N-Up PDF created successfully!', 'success', function () {
            resetState();
        });
    } catch (e) {
        console.error(e);
        showAlert('Error', 'An error occurred while creating the N-Up PDF.');
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
    const addBorderCheckbox = document.getElementById('add-border');
    const borderColorWrapper = document.getElementById('border-color-wrapper');

    if (backBtn) {
        backBtn.addEventListener('click', function () {
            window.location.href = import.meta.env.BASE_URL;
        });
    }

    if (addBorderCheckbox && borderColorWrapper) {
        addBorderCheckbox.addEventListener('change', function () {
            borderColorWrapper.classList.toggle('hidden', !(addBorderCheckbox as HTMLInputElement).checked);
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
        processBtn.addEventListener('click', nUpTool);
    }
});
