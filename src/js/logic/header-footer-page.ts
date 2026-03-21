import { createIcons, icons } from 'lucide';
import { showAlert, showLoader, hideLoader } from '../ui.js';
import { downloadFile, hexToRgb, formatBytes, parsePageRanges } from '../utils/helpers.js';
import { PDFDocument as PDFLibDocument, rgb, StandardFonts } from 'pdf-lib';
import { HeaderFooterState } from '@/types';

const pageState: HeaderFooterState = { file: null, pdfDoc: null };

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
} else { initializePage(); }

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
    if (processBtn) processBtn.addEventListener('click', addHeaderFooter);
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
        const totalPagesSpan = document.getElementById('total-pages');
        if (totalPagesSpan) totalPagesSpan.textContent = String(pageState.pdfDoc.getPageCount());
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

async function addHeaderFooter() {
    if (!pageState.pdfDoc) { showAlert('Error', 'Please upload a PDF file first.'); return; }
    showLoader('Adding header & footer...');
    try {
        const helveticaFont = await pageState.pdfDoc.embedFont(StandardFonts.Helvetica);
        const allPages = pageState.pdfDoc.getPages();
        const totalPages = allPages.length;
        const margin = 40;
        const fontSize = parseInt((document.getElementById('font-size') as HTMLInputElement)?.value || '10') || 10;
        const colorHex = (document.getElementById('font-color') as HTMLInputElement)?.value || '#000000';
        const fontColor = hexToRgb(colorHex);
        const pageRangeInput = (document.getElementById('page-range') as HTMLInputElement)?.value || '';
        const texts = {
            headerLeft: (document.getElementById('header-left') as HTMLInputElement)?.value || '',
            headerCenter: (document.getElementById('header-center') as HTMLInputElement)?.value || '',
            headerRight: (document.getElementById('header-right') as HTMLInputElement)?.value || '',
            footerLeft: (document.getElementById('footer-left') as HTMLInputElement)?.value || '',
            footerCenter: (document.getElementById('footer-center') as HTMLInputElement)?.value || '',
            footerRight: (document.getElementById('footer-right') as HTMLInputElement)?.value || '',
        };
        const indicesToProcess = parsePageRanges(pageRangeInput, totalPages);
        if (indicesToProcess.length === 0) throw new Error("Invalid page range specified.");
        const drawOptions = { font: helveticaFont, size: fontSize, color: rgb(fontColor.r, fontColor.g, fontColor.b) };

        for (const pageIndex of indicesToProcess) {
            const page = allPages[pageIndex];
            const { width, height } = page.getSize();
            const pageNumber = pageIndex + 1;
            const processText = (text: string) => text.replace(/{page}/g, String(pageNumber)).replace(/{total}/g, String(totalPages));
            const processed = {
                headerLeft: processText(texts.headerLeft), headerCenter: processText(texts.headerCenter), headerRight: processText(texts.headerRight),
                footerLeft: processText(texts.footerLeft), footerCenter: processText(texts.footerCenter), footerRight: processText(texts.footerRight),
            };
            if (processed.headerLeft) page.drawText(processed.headerLeft, { ...drawOptions, x: margin, y: height - margin });
            if (processed.headerCenter) page.drawText(processed.headerCenter, { ...drawOptions, x: width / 2 - helveticaFont.widthOfTextAtSize(processed.headerCenter, fontSize) / 2, y: height - margin });
            if (processed.headerRight) page.drawText(processed.headerRight, { ...drawOptions, x: width - margin - helveticaFont.widthOfTextAtSize(processed.headerRight, fontSize), y: height - margin });
            if (processed.footerLeft) page.drawText(processed.footerLeft, { ...drawOptions, x: margin, y: margin });
            if (processed.footerCenter) page.drawText(processed.footerCenter, { ...drawOptions, x: width / 2 - helveticaFont.widthOfTextAtSize(processed.footerCenter, fontSize) / 2, y: margin });
            if (processed.footerRight) page.drawText(processed.footerRight, { ...drawOptions, x: width - margin - helveticaFont.widthOfTextAtSize(processed.footerRight, fontSize), y: margin });
        }
        const newPdfBytes = await pageState.pdfDoc.save();
        downloadFile(new Blob([new Uint8Array(newPdfBytes)], { type: 'application/pdf' }), 'header-footer-added.pdf');
        showAlert('Success', 'Header & Footer added successfully!', 'success', () => { resetState(); });
    } catch (e: any) { console.error(e); showAlert('Error', e.message || 'Could not add header or footer.'); }
    finally { hideLoader(); }
}
