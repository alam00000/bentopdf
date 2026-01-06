import { createIcons, icons } from 'lucide';
import { showAlert, showLoader, hideLoader } from '../ui.js';
import { downloadFile, hexToRgb, formatBytes, readFileAsArrayBuffer } from '../utils/helpers.js';
import { PDFDocument as PDFLibDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { AddWatermarkState } from '@/types';

const pageState: AddWatermarkState = { file: null, pdfDoc: null };

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
} else {
    initializePage();
}

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
            e.preventDefault();
            dropZone.classList.remove('border-indigo-500');
            if (e.dataTransfer?.files.length) handleFiles(e.dataTransfer.files);
        });
    }

    if (backBtn) backBtn.addEventListener('click', () => { window.location.href = import.meta.env.BASE_URL; });
    if (processBtn) processBtn.addEventListener('click', addWatermark);

    setupWatermarkUI();
}

function handleFileUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files?.length) handleFiles(input.files);
}

async function handleFiles(files: FileList) {
    const file = files[0];
    if (!file || file.type !== 'application/pdf') {
        showAlert('Invalid File', 'Please upload a valid PDF file.');
        return;
    }
    showLoader('Loading PDF...');
    try {
        const arrayBuffer = await file.arrayBuffer();
        pageState.pdfDoc = await PDFLibDocument.load(arrayBuffer);
        pageState.file = file;
        updateFileDisplay();
        document.getElementById('options-panel')?.classList.remove('hidden');
    } catch (error) {
        console.error(error);
        showAlert('Error', 'Failed to load PDF file.');
    } finally {
        hideLoader();
    }
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
    pageState.file = null;
    pageState.pdfDoc = null;
    const fileDisplayArea = document.getElementById('file-display-area');
    if (fileDisplayArea) fileDisplayArea.innerHTML = '';
    document.getElementById('options-panel')?.classList.add('hidden');
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
}

function setupWatermarkUI() {
    const watermarkTypeRadios = document.querySelectorAll('input[name="watermark-type"]');
    const textOptions = document.getElementById('text-watermark-options');
    const imageOptions = document.getElementById('image-watermark-options');

    watermarkTypeRadios.forEach((radio) => {
        radio.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            if (target.value === 'text') {
                textOptions?.classList.remove('hidden');
                imageOptions?.classList.add('hidden');
            } else {
                textOptions?.classList.add('hidden');
                imageOptions?.classList.remove('hidden');
            }
        });
    });

    const opacitySliderText = document.getElementById('opacity-text') as HTMLInputElement;
    const opacityValueText = document.getElementById('opacity-value-text');
    const angleSliderText = document.getElementById('angle-text') as HTMLInputElement;
    const angleValueText = document.getElementById('angle-value-text');

    opacitySliderText?.addEventListener('input', () => { if (opacityValueText) opacityValueText.textContent = opacitySliderText.value; });
    angleSliderText?.addEventListener('input', () => { if (angleValueText) angleValueText.textContent = angleSliderText.value; });

    const opacitySliderImage = document.getElementById('opacity-image') as HTMLInputElement;
    const opacityValueImage = document.getElementById('opacity-value-image');
    const angleSliderImage = document.getElementById('angle-image') as HTMLInputElement;
    const angleValueImage = document.getElementById('angle-value-image');

    opacitySliderImage?.addEventListener('input', () => { if (opacityValueImage) opacityValueImage.textContent = opacitySliderImage.value; });
    angleSliderImage?.addEventListener('input', () => { if (angleValueImage) angleValueImage.textContent = angleSliderImage.value; });
}

async function addWatermark() {
    if (!pageState.pdfDoc) {
        showAlert('Error', 'Please upload a PDF file first.');
        return;
    }

    const watermarkType = (document.querySelector('input[name="watermark-type"]:checked') as HTMLInputElement)?.value || 'text';
    showLoader('Adding watermark...');

    try {
        const pages = pageState.pdfDoc.getPages();
        let watermarkAsset: any = null;

        if (watermarkType === 'text') {
            watermarkAsset = await pageState.pdfDoc.embedFont(StandardFonts.Helvetica);
        } else {
            const imageFile = (document.getElementById('image-watermark-input') as HTMLInputElement).files?.[0];
            if (!imageFile) throw new Error('Please select an image file for the watermark.');
            const imageBytes = await readFileAsArrayBuffer(imageFile);
            if (imageFile.type === 'image/png') {
                watermarkAsset = await pageState.pdfDoc.embedPng(imageBytes as ArrayBuffer);
            } else if (imageFile.type === 'image/jpeg') {
                watermarkAsset = await pageState.pdfDoc.embedJpg(imageBytes as ArrayBuffer);
            } else {
                throw new Error('Unsupported Image. Please use a PNG or JPG for the watermark.');
            }
        }

        for (const page of pages) {
            const { width, height } = page.getSize();

            if (watermarkType === 'text') {
                const text = (document.getElementById('watermark-text') as HTMLInputElement).value;
                if (!text.trim()) throw new Error('Please enter text for the watermark.');
                const fontSize = parseInt((document.getElementById('font-size') as HTMLInputElement).value) || 72;
                const angle = parseInt((document.getElementById('angle-text') as HTMLInputElement).value) || 0;
                const opacity = parseFloat((document.getElementById('opacity-text') as HTMLInputElement).value) || 0.3;
                const colorHex = (document.getElementById('text-color') as HTMLInputElement).value;
                const textColor = hexToRgb(colorHex);
                const textWidth = watermarkAsset.widthOfTextAtSize(text, fontSize);

                page.drawText(text, {
                    x: (width - textWidth) / 2,
                    y: height / 2,
                    font: watermarkAsset,
                    size: fontSize,
                    color: rgb(textColor.r, textColor.g, textColor.b),
                    opacity: opacity,
                    rotate: degrees(angle),
                });
            } else {
                const angle = parseInt((document.getElementById('angle-image') as HTMLInputElement).value) || 0;
                const opacity = parseFloat((document.getElementById('opacity-image') as HTMLInputElement).value) || 0.3;
                const scale = 0.5;
                const imgWidth = watermarkAsset.width * scale;
                const imgHeight = watermarkAsset.height * scale;

                page.drawImage(watermarkAsset, {
                    x: (width - imgWidth) / 2,
                    y: (height - imgHeight) / 2,
                    width: imgWidth,
                    height: imgHeight,
                    opacity: opacity,
                    rotate: degrees(angle),
                });
            }
        }

        const newPdfBytes = await pageState.pdfDoc.save();
        downloadFile(new Blob([new Uint8Array(newPdfBytes)], { type: 'application/pdf' }), 'watermarked.pdf');
        showAlert('Success', 'Watermark added successfully!', 'success', () => { resetState(); });
    } catch (e: any) {
        console.error(e);
        showAlert('Error', e.message || 'Could not add the watermark.');
    } finally {
        hideLoader();
    }
}
