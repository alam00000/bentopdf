import { showLoader, hideLoader, showAlert } from '../ui.js';
import {
    downloadFile,
    readFileAsArrayBuffer,
    formatBytes,
} from '../utils/helpers.js';
import { state } from '../state.js';
import { createIcons, icons } from 'lucide';

document.addEventListener('DOMContentLoaded', () => {
    state.files = [];

    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    const dropZone = document.getElementById('drop-zone');
    const convertOptions = document.getElementById('convert-options');
    const fileDisplayArea = document.getElementById('file-display-area');
    const fileControls = document.getElementById('file-controls');
    const addMoreBtn = document.getElementById('add-more-btn');
    const clearFilesBtn = document.getElementById('clear-files-btn');
    const backBtn = document.getElementById('back-to-tools');
    const processBtn = document.getElementById('process-btn');

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = import.meta.env.BASE_URL;
        });
    }

    const updateUI = async () => {
        if (!convertOptions) return;

        if (state.files.length > 0) {
            if (fileDisplayArea) {
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
            }
            if (fileControls) fileControls.classList.remove('hidden');
            convertOptions.classList.remove('hidden');
        } else {
            if (fileDisplayArea) fileDisplayArea.innerHTML = '';
            if (fileControls) fileControls.classList.add('hidden');
            convertOptions.classList.add('hidden');
        }
    };

    const resetState = () => {
        state.files = [];
        state.pdfDoc = null;
        updateUI();
    };

    const convertToPdf = async () => {
        try {
            console.log('[CSV2PDF] Starting conversion...');
            console.log('[CSV2PDF] Number of files:', state.files.length);

            if (state.files.length === 0) {
                showAlert('No Files', 'Please select at least one CSV file.');
                hideLoader();
                return;
            }

            const { convertCsvToPdf } = await import('../utils/csv-to-pdf.js');

            if (state.files.length === 1) {
                const originalFile = state.files[0];
                console.log('[CSV2PDF] Converting single file:', originalFile.name, 'Size:', originalFile.size, 'bytes');

                const pdfBlob = await convertCsvToPdf(originalFile, {
                    onProgress: (percent, message) => {
                        console.log(`[CSV2PDF] Progress: ${percent}% - ${message}`);
                        showLoader(message, percent);
                    }
                });

                console.log('[CSV2PDF] Conversion complete! PDF size:', pdfBlob.size, 'bytes');

                const fileName = originalFile.name.replace(/\.csv$/i, '') + '.pdf';
                downloadFile(pdfBlob, fileName);
                console.log('[CSV2PDF] File downloaded:', fileName);

                hideLoader();

                showAlert(
                    'Conversion Complete',
                    `Successfully converted ${originalFile.name} to PDF.`,
                    'success',
                    () => resetState()
                );
            } else {
                console.log('[CSV2PDF] Converting multiple files:', state.files.length);
                showLoader('Preparing conversion...');
                const JSZip = (await import('jszip')).default;
                const zip = new JSZip();

                for (let i = 0; i < state.files.length; i++) {
                    const file = state.files[i];
                    console.log(`[CSV2PDF] Converting file ${i + 1}/${state.files.length}:`, file.name);

                    const pdfBlob = await convertCsvToPdf(file, {
                        onProgress: (percent, message) => {
                            const overallPercent = ((i / state.files.length) * 100) + (percent / state.files.length);
                            showLoader(`Converting ${i + 1}/${state.files.length}: ${file.name}...`, overallPercent);
                        }
                    });

                    console.log(`[CSV2PDF] Converted ${file.name}, PDF size:`, pdfBlob.size);

                    const baseName = file.name.replace(/\.csv$/i, '');
                    const pdfBuffer = await pdfBlob.arrayBuffer();
                    zip.file(`${baseName}.pdf`, pdfBuffer);
                }

                console.log('[CSV2PDF] Generating ZIP file...');
                showLoader('Creating ZIP archive...');
                const zipBlob = await zip.generateAsync({ type: 'blob' });
                console.log('[CSV2PDF] ZIP size:', zipBlob.size);

                downloadFile(zipBlob, 'csv-converted.zip');

                hideLoader();

                showAlert(
                    'Conversion Complete',
                    `Successfully converted ${state.files.length} CSV file(s) to PDF.`,
                    'success',
                    () => resetState()
                );
            }
        } catch (e: any) {
            console.error('[CSV2PDF] ERROR:', e);
            console.error('[CSV2PDF] Error stack:', e.stack);
            hideLoader();
            showAlert(
                'Error',
                `An error occurred during conversion. Error: ${e.message}`
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
                const csvFiles = Array.from(files).filter(f => f.name.toLowerCase().endsWith('.csv') || f.type === 'text/csv');
                if (csvFiles.length > 0) {
                    const dataTransfer = new DataTransfer();
                    csvFiles.forEach(f => dataTransfer.items.add(f));
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
        processBtn.addEventListener('click', convertToPdf);
    }

    updateUI();
});
