import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, formatBytes } from '../utils/helpers.js';
import { createIcons, icons } from 'lucide';
import JSZip from 'jszip';
import { PyMuPDF } from '@bentopdf/pymupdf-wasm';
import { getWasmBaseUrl } from '../config/wasm-cdn-config.js';

const pymupdf = new PyMuPDF(getWasmBaseUrl('pymupdf'));
let files: File[] = [];

const updateUI = () => {
    const fileDisplayArea = document.getElementById('file-display-area');
    const optionsPanel = document.getElementById('options-panel');
    const fileControls = document.getElementById('file-controls');

    if (!fileDisplayArea || !optionsPanel) return;

    fileDisplayArea.innerHTML = '';

    if (files.length > 0) {
        optionsPanel.classList.remove('hidden');
        if (fileControls) fileControls.classList.remove('hidden');

        files.forEach((file, index) => {
            const fileDiv = document.createElement('div');
            fileDiv.className = 'flex items-center justify-between bg-gray-700 p-3 rounded-lg text-sm';

            const infoContainer = document.createElement('div');
            infoContainer.className = 'flex flex-col overflow-hidden';

            const nameSpan = document.createElement('div');
            nameSpan.className = 'truncate font-medium text-gray-200 text-sm mb-1';
            nameSpan.textContent = file.name;

            const metaSpan = document.createElement('div');
            metaSpan.className = 'text-xs text-gray-400';
            metaSpan.textContent = formatBytes(file.size);

            infoContainer.append(nameSpan, metaSpan);

            const removeBtn = document.createElement('button');
            removeBtn.className = 'ml-4 text-red-400 hover:text-red-300 flex-shrink-0';
            removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
            removeBtn.onclick = () => {
                files = files.filter((_, i) => i !== index);
                updateUI();
            };

            fileDiv.append(infoContainer, removeBtn);
            fileDisplayArea.appendChild(fileDiv);
        });

        createIcons({ icons });
    } else {
        optionsPanel.classList.add('hidden');
        if (fileControls) fileControls.classList.add('hidden');
    }
};

const resetState = () => {
    files = [];
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    updateUI();
};

async function convert() {
    if (files.length === 0) {
        showAlert('No Files', 'Please upload at least one PDF file.');
        return;
    }

    showLoader('Loading Engine...');

    try {
        await pymupdf.load();

        const isSingleFile = files.length === 1;

        if (isSingleFile) {
            const doc = await pymupdf.open(files[0]);
            const pageCount = doc.pageCount;
            const baseName = files[0].name.replace(/\.[^/.]+$/, '');

            if (pageCount === 1) {
                showLoader('Converting to SVG...');
                const page = doc.getPage(0);
                const svgContent = page.toSvg();
                const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
                downloadFile(svgBlob, `${baseName}.svg`);
                showAlert('Success', 'PDF converted to SVG successfully!', 'success', () => resetState());
            } else {
                const zip = new JSZip();
                for (let i = 0; i < pageCount; i++) {
                    showLoader(`Converting page ${i + 1} of ${pageCount}...`);
                    const page = doc.getPage(i);
                    const svgContent = page.toSvg();
                    zip.file(`page_${i + 1}.svg`, svgContent);
                }
                showLoader('Creating ZIP file...');
                const zipBlob = await zip.generateAsync({ type: 'blob' });
                downloadFile(zipBlob, `${baseName}_svg.zip`);
                showAlert('Success', `Converted ${pageCount} pages to SVG!`, 'success', () => resetState());
            }
        } else {
            const zip = new JSZip();
            let totalPages = 0;

            for (let f = 0; f < files.length; f++) {
                const file = files[f];
                showLoader(`Processing file ${f + 1} of ${files.length}...`);
                const doc = await pymupdf.open(file);
                const pageCount = doc.pageCount;
                const baseName = file.name.replace(/\.[^/.]+$/, '');

                for (let i = 0; i < pageCount; i++) {
                    showLoader(`File ${f + 1}/${files.length}: Page ${i + 1}/${pageCount}`);
                    const page = doc.getPage(i);
                    const svgContent = page.toSvg();
                    const fileName = pageCount === 1 ? `${baseName}.svg` : `${baseName}_page_${i + 1}.svg`;
                    zip.file(fileName, svgContent);
                    totalPages++;
                }
            }

            showLoader('Creating ZIP file...');
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            downloadFile(zipBlob, 'pdf_to_svg.zip');
            showAlert('Success', `Converted ${files.length} files (${totalPages} pages) to SVG!`, 'success', () => resetState());
        }
    } catch (e) {
        console.error(e);
        const message = e instanceof Error ? e.message : 'Unknown error';
        showAlert('Error', `Failed to convert PDF to SVG. ${message}`);
    } finally {
        hideLoader();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    const dropZone = document.getElementById('drop-zone');
    const processBtn = document.getElementById('process-btn');
    const backBtn = document.getElementById('back-to-tools');
    const addMoreBtn = document.getElementById('add-more-btn');
    const clearFilesBtn = document.getElementById('clear-files-btn');

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = import.meta.env.BASE_URL;
        });
    }

    const handleFileSelect = (newFiles: FileList | null, replace = false) => {
        if (!newFiles || newFiles.length === 0) return;
        const validFiles = Array.from(newFiles).filter(
            (file) => file.type === 'application/pdf'
        );

        if (validFiles.length === 0) {
            showAlert('Invalid Files', 'Please upload PDF files.');
            return;
        }

        if (replace) {
            files = validFiles;
        } else {
            files = [...files, ...validFiles];
        }
        updateUI();
    };

    if (fileInput && dropZone) {
        fileInput.addEventListener('change', (e) => {
            handleFileSelect((e.target as HTMLInputElement).files, files.length === 0);
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
            handleFileSelect(e.dataTransfer?.files ?? null, files.length === 0);
        });

        fileInput.addEventListener('click', () => {
            fileInput.value = '';
        });
    }

    if (addMoreBtn) addMoreBtn.addEventListener('click', () => fileInput?.click());
    if (clearFilesBtn) clearFilesBtn.addEventListener('click', resetState);
    if (processBtn) processBtn.addEventListener('click', convert);
});
