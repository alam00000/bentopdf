import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, formatBytes } from '../utils/helpers.js';
import { state } from '../state.js';
import { createIcons, icons } from 'lucide';
import { PyMuPDF } from '@bentopdf/pymupdf-wasm';
import { getWasmBaseUrl } from '../config/wasm-cdn-config.js';
import JSZip from 'jszip';
import { PDFDocument } from 'pdf-lib';

const EXTENSIONS = ['.cbz', '.cbr'];
const TOOL_NAME = 'CBZ';
const ALL_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.tif', '.webp', '.avif', '.jxl', '.heic', '.heif'];

const IMAGE_SIGNATURES = {
    jpeg: [0xFF, 0xD8, 0xFF],
    png: [0x89, 0x50, 0x4E, 0x47],
    gif: [0x47, 0x49, 0x46],
    bmp: [0x42, 0x4D],
    webp: [0x52, 0x49, 0x46, 0x46],
    avif: [0x00, 0x00, 0x00],
};

function matchesSignature(data: Uint8Array, signature: number[], offset = 0): boolean {
    for (let i = 0; i < signature.length; i++) {
        if (data[offset + i] !== signature[i]) return false;
    }
    return true;
}

function detectImageFormat(data: Uint8Array): 'jpeg' | 'png' | 'gif' | 'bmp' | 'webp' | 'avif' | 'unknown' {
    if (data.length < 12) return 'unknown';
    if (matchesSignature(data, IMAGE_SIGNATURES.jpeg)) return 'jpeg';
    if (matchesSignature(data, IMAGE_SIGNATURES.png)) return 'png';
    if (matchesSignature(data, IMAGE_SIGNATURES.gif)) return 'gif';
    if (matchesSignature(data, IMAGE_SIGNATURES.bmp)) return 'bmp';
    if (matchesSignature(data, IMAGE_SIGNATURES.webp) &&
        data[8] === 0x57 && data[9] === 0x45 && data[10] === 0x42 && data[11] === 0x50) {
        return 'webp';
    }
    if (data[4] === 0x66 && data[5] === 0x74 && data[6] === 0x79 && data[7] === 0x70) {
        const brand = String.fromCharCode(data[8], data[9], data[10], data[11]);
        if (brand === 'avif' || brand === 'avis' || brand === 'mif1' || brand === 'miaf') {
            return 'avif';
        }
    }
    return 'unknown';
}

function isCbzFile(filename: string): boolean {
    return filename.toLowerCase().endsWith('.cbz');
}

async function convertImageToPng(imageData: ArrayBuffer, filename: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const blob = new Blob([imageData]);
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                URL.revokeObjectURL(url);
                reject(new Error('Failed to get canvas context'));
                return;
            }
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((pngBlob) => {
                URL.revokeObjectURL(url);
                if (pngBlob) {
                    resolve(pngBlob);
                } else {
                    reject(new Error(`Failed to convert ${filename} to PNG`));
                }
            }, 'image/png');
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error(`Failed to load image: ${filename}`));
        };
        img.src = url;
    });
}

async function convertCbzToPdf(file: File): Promise<Blob> {
    const zip = await JSZip.loadAsync(file);
    const pdfDoc = await PDFDocument.create();

    const imageFiles = Object.keys(zip.files)
        .filter(name => {
            if (zip.files[name].dir) return false;
            const ext = name.toLowerCase().substring(name.lastIndexOf('.'));
            return ALL_IMAGE_EXTENSIONS.includes(ext);
        })
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

    for (const filename of imageFiles) {
        const zipEntry = zip.files[filename];
        const imageData = await zipEntry.async('arraybuffer');
        const dataArray = new Uint8Array(imageData);
        const actualFormat = detectImageFormat(dataArray);

        let imageBytes: Uint8Array;
        let embedMethod: 'png' | 'jpg';

        if (actualFormat === 'jpeg') {
            imageBytes = dataArray;
            embedMethod = 'jpg';
        } else if (actualFormat === 'png') {
            imageBytes = dataArray;
            embedMethod = 'png';
        } else {
            const pngBlob = await convertImageToPng(imageData, filename);
            imageBytes = new Uint8Array(await pngBlob.arrayBuffer());
            embedMethod = 'png';
        }

        const image = embedMethod === 'png'
            ? await pdfDoc.embedPng(imageBytes)
            : await pdfDoc.embedJpg(imageBytes);
        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height,
        });
    }

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

async function convertCbrToPdf(file: File): Promise<Blob> {
    const pymupdf = new PyMuPDF(getWasmBaseUrl('pymupdf'));
    await pymupdf.load();
    return await pymupdf.convertToPdf(file, { filetype: 'cbz' });
}

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    const dropZone = document.getElementById('drop-zone');
    const processBtn = document.getElementById('process-btn');
    const fileDisplayArea = document.getElementById('file-display-area');
    const fileControls = document.getElementById('file-controls');
    const addMoreBtn = document.getElementById('add-more-btn');
    const clearFilesBtn = document.getElementById('clear-files-btn');
    const backBtn = document.getElementById('back-to-tools');

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = import.meta.env.BASE_URL;
        });
    }

    const updateUI = async () => {
        if (!fileDisplayArea || !processBtn || !fileControls) return;

        if (state.files.length > 0) {
            fileDisplayArea.innerHTML = '';

            for (let index = 0; index < state.files.length; index++) {
                const file = state.files[index];
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
                    state.files = state.files.filter((_, i) => i !== index);
                    updateUI();
                };

                fileDiv.append(infoContainer, removeBtn);
                fileDisplayArea.appendChild(fileDiv);
            }

            createIcons({ icons });
            fileControls.classList.remove('hidden');
            processBtn.classList.remove('hidden');
            (processBtn as HTMLButtonElement).disabled = false;
        } else {
            fileDisplayArea.innerHTML = '';
            fileControls.classList.add('hidden');
            processBtn.classList.add('hidden');
            (processBtn as HTMLButtonElement).disabled = true;
        }
    };

    const resetState = () => {
        state.files = [];
        state.pdfDoc = null;
        updateUI();
    };

    const convertToPdf = async () => {
        try {
            if (state.files.length === 0) {
                showAlert('No Files', `Please select at least one ${TOOL_NAME} file.`);
                return;
            }

            if (state.files.length === 1) {
                const originalFile = state.files[0];
                showLoader(`Converting ${originalFile.name}...`);

                let pdfBlob: Blob;
                if (isCbzFile(originalFile.name)) {
                    pdfBlob = await convertCbzToPdf(originalFile);
                } else {
                    pdfBlob = await convertCbrToPdf(originalFile);
                }

                const fileName = originalFile.name.replace(/\.[^.]+$/, '') + '.pdf';
                downloadFile(pdfBlob, fileName);
                hideLoader();

                showAlert(
                    'Conversion Complete',
                    `Successfully converted ${originalFile.name} to PDF.`,
                    'success',
                    () => resetState()
                );
            } else {
                showLoader('Converting files...');
                const outputZip = new JSZip();

                for (let i = 0; i < state.files.length; i++) {
                    const file = state.files[i];
                    showLoader(`Converting ${i + 1}/${state.files.length}: ${file.name}...`);

                    let pdfBlob: Blob;
                    if (isCbzFile(file.name)) {
                        pdfBlob = await convertCbzToPdf(file);
                    } else {
                        pdfBlob = await convertCbrToPdf(file);
                    }

                    const baseName = file.name.replace(/\.[^.]+$/, '');
                    const pdfBuffer = await pdfBlob.arrayBuffer();
                    outputZip.file(`${baseName}.pdf`, pdfBuffer);
                }

                const zipBlob = await outputZip.generateAsync({ type: 'blob' });
                downloadFile(zipBlob, 'comic-converted.zip');

                hideLoader();

                showAlert(
                    'Conversion Complete',
                    `Successfully converted ${state.files.length} ${TOOL_NAME} file(s) to PDF.`,
                    'success',
                    () => resetState()
                );
            }
        } catch (e: any) {
            console.error(`[${TOOL_NAME}2PDF] ERROR:`, e);
            hideLoader();
            showAlert('Error', `An error occurred during conversion. Error: ${e.message}`);
        }
    };

    const handleFileSelect = (files: FileList | null) => {
        if (files && files.length > 0) {
            state.files = [...state.files, ...Array.from(files)];
            updateUI();
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
            if (files && files.length > 0) {
                const validFiles = Array.from(files).filter(f => {
                    const name = f.name.toLowerCase();
                    return EXTENSIONS.some(ext => name.endsWith(ext));
                });
                if (validFiles.length > 0) {
                    const dataTransfer = new DataTransfer();
                    validFiles.forEach(f => dataTransfer.items.add(f));
                    handleFileSelect(dataTransfer.files);
                }
            }
        });

        fileInput.addEventListener('click', () => {
            fileInput.value = '';
        });
    }

    if (addMoreBtn) {
        addMoreBtn.addEventListener('click', () => {
            fileInput.click();
        });
    }

    if (clearFilesBtn) {
        clearFilesBtn.addEventListener('click', () => {
            resetState();
        });
    }

    if (processBtn) {
        processBtn.addEventListener('click', convertToPdf);
    }
});
