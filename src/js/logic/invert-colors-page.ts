import { createIcons, icons } from 'lucide';
import { showAlert, showLoader, hideLoader } from '../ui.js';
import { downloadFile, formatBytes, getPDFDocument } from '../utils/helpers.js';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { InvertColorsState } from '@/types';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

const pageState: InvertColorsState = { file: null, pdfDoc: null };

if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initializePage); }
else { initializePage(); }

function initializePage() {
    createIcons({ icons });
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    const dropZone = document.getElementById('drop-zone');
    const backBtn = document.getElementById('back-to-tools');
    const processBtn = document.getElementById('process-btn');

    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
        fileInput.addEventListener('click', () => { fileInput.value = ''; });
    }
    if (dropZone) {
        dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('border-indigo-500'); });
        dropZone.addEventListener('dragleave', () => { dropZone.classList.remove('border-indigo-500'); });
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault(); dropZone.classList.remove('border-indigo-500');
            if (e.dataTransfer?.files.length) handleFiles(e.dataTransfer.files);
        });
    }
    if (backBtn) backBtn.addEventListener('click', () => { window.location.href = import.meta.env.BASE_URL; });
    if (processBtn) processBtn.addEventListener('click', invertColors);
}

function handleFileUpload(e: Event) { const input = e.target as HTMLInputElement; if (input.files?.length) handleFiles(input.files); }

async function handleFiles(files: FileList) {
    const file = files[0];
    if (!file || file.type !== 'application/pdf') { showAlert('Invalid File', 'Please upload a valid PDF file.'); return; }
    showLoader('Loading PDF...');
    try {
        const arrayBuffer = await file.arrayBuffer();
        pageState.pdfDoc = await PDFLibDocument.load(arrayBuffer);
        pageState.file = file;
        updateFileDisplay();
        document.getElementById('options-panel')?.classList.remove('hidden');
    } catch (error) { console.error(error); showAlert('Error', 'Failed to load PDF file.'); }
    finally { hideLoader(); }
}

function updateFileDisplay() {
    const fileDisplayArea = document.getElementById('file-display-area');
    if (!fileDisplayArea || !pageState.file || !pageState.pdfDoc) return;
    fileDisplayArea.innerHTML = '';
    const fileDiv = document.createElement('div');
    fileDiv.className = 'flex items-center justify-between bg-gray-700 p-3 rounded-lg';
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
    pageState.file = null; pageState.pdfDoc = null;
    const fileDisplayArea = document.getElementById('file-display-area');
    if (fileDisplayArea) fileDisplayArea.innerHTML = '';
    document.getElementById('options-panel')?.classList.add('hidden');
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
}

async function invertColors() {
    if (!pageState.pdfDoc || !pageState.file) { showAlert('Error', 'Please upload a PDF file first.'); return; }
    showLoader('Inverting PDF colors...');
    try {
        const newPdfDoc = await PDFLibDocument.create();
        const pdfBytes = await pageState.pdfDoc.save();
        const pdfjsDoc = await getPDFDocument({ data: pdfBytes }).promise;

        for (let i = 1; i <= pdfjsDoc.numPages; i++) {
            showLoader(`Processing page ${i} of ${pdfjsDoc.numPages}...`);
            const page = await pdfjsDoc.getPage(i);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d')!;
            await page.render({ canvasContext: ctx, viewport, canvas }).promise;

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            for (let j = 0; j < data.length; j += 4) {
                data[j] = 255 - data[j];
                data[j + 1] = 255 - data[j + 1];
                data[j + 2] = 255 - data[j + 2];
            }
            ctx.putImageData(imageData, 0, 0);

            const pngImageBytes = await new Promise<Uint8Array>((resolve) =>
                canvas.toBlob((blob) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
                    reader.readAsArrayBuffer(blob!);
                }, 'image/png')
            );

            const image = await newPdfDoc.embedPng(pngImageBytes);
            const newPage = newPdfDoc.addPage([image.width, image.height]);
            newPage.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
        }
        const newPdfBytes = await newPdfDoc.save();
        downloadFile(new Blob([new Uint8Array(newPdfBytes)], { type: 'application/pdf' }), 'inverted.pdf');
        showAlert('Success', 'Colors inverted successfully!', 'success', () => { resetState(); });
    } catch (e) { console.error(e); showAlert('Error', 'Could not invert PDF colors.'); }
    finally { hideLoader(); }
}
