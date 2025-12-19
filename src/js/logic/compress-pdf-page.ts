import { showLoader, hideLoader, showAlert } from '../ui.js';
import {
    downloadFile,
    readFileAsArrayBuffer,
    formatBytes,
    getPDFDocument,
} from '../utils/helpers.js';
import { state } from '../state.js';
import { createIcons, icons } from 'lucide';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, PDFName, PDFDict, PDFStream, PDFNumber } from 'pdf-lib';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

function dataUrlToBytes(dataUrl: any) {
    const base64 = dataUrl.split(',')[1];
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function performSmartCompression(arrayBuffer: any, settings: any) {
    const pdfDoc = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
    });
    const pages = pdfDoc.getPages();

    if (settings.removeMetadata) {
        try {
            pdfDoc.setTitle('');
            pdfDoc.setAuthor('');
            pdfDoc.setSubject('');
            pdfDoc.setKeywords([]);
            pdfDoc.setCreator('');
            pdfDoc.setProducer('');
        } catch (e) {
            console.warn('Could not remove metadata:', e);
        }
    }

    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const resources = page.node.Resources();
        if (!resources) continue;

        const xobjects = resources.lookup(PDFName.of('XObject'));
        if (!(xobjects instanceof PDFDict)) continue;

        for (const [key, value] of xobjects.entries()) {
            const stream = pdfDoc.context.lookup(value);
            if (
                !(stream instanceof PDFStream) ||
                stream.dict.get(PDFName.of('Subtype')) !== PDFName.of('Image')
            )
                continue;

            try {
                const imageBytes = stream.getContents();
                if (imageBytes.length < settings.skipSize) continue;

                const width =
                    stream.dict.get(PDFName.of('Width')) instanceof PDFNumber
                        ? (stream.dict.get(PDFName.of('Width')) as PDFNumber).asNumber()
                        : 0;
                const height =
                    stream.dict.get(PDFName.of('Height')) instanceof PDFNumber
                        ? (stream.dict.get(PDFName.of('Height')) as PDFNumber).asNumber()
                        : 0;
                const bitsPerComponent =
                    stream.dict.get(PDFName.of('BitsPerComponent')) instanceof PDFNumber
                        ? (
                            stream.dict.get(PDFName.of('BitsPerComponent')) as PDFNumber
                        ).asNumber()
                        : 8;

                if (width > 0 && height > 0) {
                    let newWidth = width;
                    let newHeight = height;

                    const scaleFactor = settings.scaleFactor || 1.0;
                    newWidth = Math.floor(width * scaleFactor);
                    newHeight = Math.floor(height * scaleFactor);

                    if (newWidth > settings.maxWidth || newHeight > settings.maxHeight) {
                        const aspectRatio = newWidth / newHeight;
                        if (newWidth > newHeight) {
                            newWidth = Math.min(newWidth, settings.maxWidth);
                            newHeight = newWidth / aspectRatio;
                        } else {
                            newHeight = Math.min(newHeight, settings.maxHeight);
                            newWidth = newHeight * aspectRatio;
                        }
                    }

                    const minDim = settings.minDimension || 50;
                    if (newWidth < minDim || newHeight < minDim) continue;

                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = Math.floor(newWidth);
                    canvas.height = Math.floor(newHeight);

                    const img = new Image();
                    const imageUrl = URL.createObjectURL(
                        new Blob([new Uint8Array(imageBytes)])
                    );

                    await new Promise((resolve, reject) => {
                        img.onload = resolve;
                        img.onerror = reject;
                        img.src = imageUrl;
                    });

                    ctx.imageSmoothingEnabled = settings.smoothing !== false;
                    ctx.imageSmoothingQuality = settings.smoothingQuality || 'medium';

                    if (settings.grayscale) {
                        ctx.filter = 'grayscale(100%)';
                    } else if (settings.contrast) {
                        ctx.filter = `contrast(${settings.contrast}) brightness(${settings.brightness || 1})`;
                    }

                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    let bestBytes = null;
                    let bestSize = imageBytes.length;

                    const jpegDataUrl = canvas.toDataURL('image/jpeg', settings.quality);
                    const jpegBytes = dataUrlToBytes(jpegDataUrl);
                    if (jpegBytes.length < bestSize) {
                        bestBytes = jpegBytes;
                        bestSize = jpegBytes.length;
                    }

                    if (settings.tryWebP) {
                        try {
                            const webpDataUrl = canvas.toDataURL(
                                'image/webp',
                                settings.quality
                            );
                            const webpBytes = dataUrlToBytes(webpDataUrl);
                            if (webpBytes.length < bestSize) {
                                bestBytes = webpBytes;
                                bestSize = webpBytes.length;
                            }
                        } catch (e) {
                            /* WebP not supported */
                        }
                    }

                    if (bestBytes && bestSize < imageBytes.length * settings.threshold) {
                        (stream as any).contents = bestBytes;
                        stream.dict.set(PDFName.of('Length'), PDFNumber.of(bestSize));
                        stream.dict.set(PDFName.of('Width'), PDFNumber.of(canvas.width));
                        stream.dict.set(PDFName.of('Height'), PDFNumber.of(canvas.height));
                        stream.dict.set(PDFName.of('Filter'), PDFName.of('DCTDecode'));
                        stream.dict.delete(PDFName.of('DecodeParms'));
                        stream.dict.set(PDFName.of('BitsPerComponent'), PDFNumber.of(8));

                        if (settings.grayscale) {
                            stream.dict.set(
                                PDFName.of('ColorSpace'),
                                PDFName.of('DeviceGray')
                            );
                        }
                    }
                    URL.revokeObjectURL(imageUrl);
                }
            } catch (error) {
                console.warn('Skipping an uncompressible image in smart mode:', error);
            }
        }
    }

    const saveOptions = {
        useObjectStreams: settings.useObjectStreams !== false,
        addDefaultPage: false,
        objectsPerTick: settings.objectsPerTick || 50,
    };

    return await pdfDoc.save(saveOptions);
}

async function performLegacyCompression(arrayBuffer: any, settings: any) {
    const pdfJsDoc = await getPDFDocument({ data: arrayBuffer }).promise;
    const newPdfDoc = await PDFDocument.create();

    for (let i = 1; i <= pdfJsDoc.numPages; i++) {
        const page = await pdfJsDoc.getPage(i);
        const viewport = page.getViewport({ scale: settings.scale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport, canvas: canvas })
            .promise;

        const jpegBlob = await new Promise((resolve) =>
            canvas.toBlob(resolve, 'image/jpeg', settings.quality)
        );
        const jpegBytes = await (jpegBlob as Blob).arrayBuffer();
        const jpegImage = await newPdfDoc.embedJpg(jpegBytes);
        const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);
        newPage.drawImage(jpegImage, {
            x: 0,
            y: 0,
            width: viewport.width,
            height: viewport.height,
        });
    }
    return await newPdfDoc.save();
}

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    const dropZone = document.getElementById('drop-zone');
    const processBtn = document.getElementById('process-btn');
    const fileDisplayArea = document.getElementById('file-display-area');
    const compressOptions = document.getElementById('compress-options');
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
        if (!fileDisplayArea || !compressOptions || !processBtn || !fileControls) return;

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
                metaSpan.textContent = `${formatBytes(file.size)} • Loading pages...`;

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

                try {
                    const arrayBuffer = await readFileAsArrayBuffer(file);
                    const pdfDoc = await getPDFDocument({ data: arrayBuffer }).promise;
                    metaSpan.textContent = `${formatBytes(file.size)} • ${pdfDoc.numPages} pages`;
                } catch (error) {
                    console.error('Error loading PDF:', error);
                    metaSpan.textContent = `${formatBytes(file.size)} • Could not load page count`;
                }
            }

            createIcons({ icons });
            fileControls.classList.remove('hidden');
            compressOptions.classList.remove('hidden');
            (processBtn as HTMLButtonElement).disabled = false;
        } else {
            fileDisplayArea.innerHTML = '';
            fileControls.classList.add('hidden');
            compressOptions.classList.add('hidden');
            (processBtn as HTMLButtonElement).disabled = true;
        }
    };

    const resetState = () => {
        state.files = [];
        state.pdfDoc = null;

        const compressionLevel = document.getElementById('compression-level') as HTMLSelectElement;
        if (compressionLevel) compressionLevel.value = 'balanced';

        const compressionAlgorithm = document.getElementById('compression-algorithm') as HTMLSelectElement;
        if (compressionAlgorithm) compressionAlgorithm.value = 'vector';

        updateUI();
    };

    const compress = async () => {
        const level = (document.getElementById('compression-level') as HTMLSelectElement).value;
        const algorithm = (document.getElementById('compression-algorithm') as HTMLSelectElement).value;

        const settings = {
            balanced: {
                smart: {
                    quality: 0.5,
                    threshold: 0.95,
                    maxWidth: 1800,
                    maxHeight: 1800,
                    skipSize: 3000,
                },
                legacy: { scale: 1.5, quality: 0.6 },
            },
            'high-quality': {
                smart: {
                    quality: 0.7,
                    threshold: 0.98,
                    maxWidth: 2500,
                    maxHeight: 2500,
                    skipSize: 5000,
                },
                legacy: { scale: 2.0, quality: 0.9 },
            },
            'small-size': {
                smart: {
                    quality: 0.3,
                    threshold: 0.95,
                    maxWidth: 1200,
                    maxHeight: 1200,
                    skipSize: 2000,
                },
                legacy: { scale: 1.2, quality: 0.4 },
            },
            extreme: {
                smart: {
                    quality: 0.1,
                    threshold: 0.95,
                    maxWidth: 1000,
                    maxHeight: 1000,
                    skipSize: 1000,
                },
                legacy: { scale: 1.0, quality: 0.2 },
            },
        };

        const smartSettings = { ...settings[level].smart, removeMetadata: true };
        const legacySettings = settings[level].legacy;

        try {
            if (state.files.length === 0) {
                showAlert('No Files', 'Please select at least one PDF file.');
                hideLoader();
                return;
            }

            if (state.files.length === 1) {
                const originalFile = state.files[0];
                const arrayBuffer = await readFileAsArrayBuffer(originalFile);

                let resultBytes;
                let usedMethod;

                if (algorithm === 'vector') {
                    showLoader('Running Vector (Smart) compression...');
                    resultBytes = await performSmartCompression(arrayBuffer, smartSettings);
                    usedMethod = 'Vector';
                } else if (algorithm === 'photon') {
                    showLoader('Running Photon (Rasterize) compression...');
                    resultBytes = await performLegacyCompression(arrayBuffer, legacySettings);
                    usedMethod = 'Photon';
                } else {
                    showLoader('Running Automatic (Vector first)...');
                    const vectorResultBytes = await performSmartCompression(
                        arrayBuffer,
                        smartSettings
                    );

                    if (vectorResultBytes.length < originalFile.size) {
                        resultBytes = vectorResultBytes;
                        usedMethod = 'Vector (Automatic)';
                    } else {
                        showAlert('Vector failed to reduce size. Trying Photon...', 'info');
                        showLoader('Running Automatic (Photon fallback)...');
                        resultBytes = await performLegacyCompression(
                            arrayBuffer,
                            legacySettings
                        );
                        usedMethod = 'Photon (Automatic)';
                    }
                }

                const originalSize = formatBytes(originalFile.size);
                const compressedSize = formatBytes(resultBytes.length);
                const savings = originalFile.size - resultBytes.length;
                const savingsPercent =
                    savings > 0 ? ((savings / originalFile.size) * 100).toFixed(1) : 0;

                downloadFile(
                    new Blob([resultBytes], { type: 'application/pdf' }),
                    'compressed-final.pdf'
                );

                hideLoader();

                if (savings > 0) {
                    showAlert(
                        'Compression Complete',
                        `Method: ${usedMethod}. File size reduced from ${originalSize} to ${compressedSize} (Saved ${savingsPercent}%).`,
                        'success',
                        () => resetState()
                    );
                } else {
                    showAlert(
                        'Compression Finished',
                        `Method: ${usedMethod}. Could not reduce file size. Original: ${originalSize}, New: ${compressedSize}.`,
                        'warning',
                        () => resetState()
                    );
                }
            } else {
                showLoader('Compressing multiple PDFs...');
                const JSZip = (await import('jszip')).default;
                const zip = new JSZip();
                let totalOriginalSize = 0;
                let totalCompressedSize = 0;

                for (let i = 0; i < state.files.length; i++) {
                    const file = state.files[i];
                    showLoader(`Compressing ${i + 1}/${state.files.length}: ${file.name}...`);
                    const arrayBuffer = await readFileAsArrayBuffer(file);
                    totalOriginalSize += file.size;

                    let resultBytes;
                    if (algorithm === 'vector') {
                        resultBytes = await performSmartCompression(arrayBuffer, smartSettings);
                    } else if (algorithm === 'photon') {
                        resultBytes = await performLegacyCompression(arrayBuffer, legacySettings);
                    } else {
                        const vectorResultBytes = await performSmartCompression(
                            arrayBuffer,
                            smartSettings
                        );
                        resultBytes = vectorResultBytes.length < file.size
                            ? vectorResultBytes
                            : await performLegacyCompression(arrayBuffer, legacySettings);
                    }

                    totalCompressedSize += resultBytes.length;
                    const baseName = file.name.replace(/\.pdf$/i, '');
                    zip.file(`${baseName}_compressed.pdf`, resultBytes);
                }

                const zipBlob = await zip.generateAsync({ type: 'blob' });
                const totalSavings = totalOriginalSize - totalCompressedSize;
                const totalSavingsPercent =
                    totalSavings > 0
                        ? ((totalSavings / totalOriginalSize) * 100).toFixed(1)
                        : 0;

                downloadFile(zipBlob, 'compressed-pdfs.zip');

                hideLoader();

                if (totalSavings > 0) {
                    showAlert(
                        'Compression Complete',
                        `Compressed ${state.files.length} PDF(s). Total size reduced from ${formatBytes(totalOriginalSize)} to ${formatBytes(totalCompressedSize)} (Saved ${totalSavingsPercent}%).`,
                        'success',
                        () => resetState()
                    );
                } else {
                    showAlert(
                        'Compression Finished',
                        `Compressed ${state.files.length} PDF(s). Total size: ${formatBytes(totalCompressedSize)}.`,
                        'info',
                        () => resetState()
                    );
                }
            }
        } catch (e: any) {
            hideLoader();
            showAlert(
                'Error',
                `An error occurred during compression. Error: ${e.message}`
            );
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
                const pdfFiles = Array.from(files).filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
                if (pdfFiles.length > 0) {
                    const dataTransfer = new DataTransfer();
                    pdfFiles.forEach(f => dataTransfer.items.add(f));
                    handleFileSelect(dataTransfer.files);
                }
            }
        });

        // Clear value on click to allow re-selecting the same file
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
        processBtn.addEventListener('click', compress);
    }
});
