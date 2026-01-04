import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, readFileAsArrayBuffer, formatBytes, getPDFDocument } from '../utils/helpers.js';
import { state } from '../state.js';
import { createIcons, icons } from 'lucide';
import { PyMuPDF } from '@bentopdf/pymupdf-wasm';
import { getWasmBaseUrl } from '../config/wasm-cdn-config.js';

const pymupdf = new PyMuPDF(getWasmBaseUrl('pymupdf'));

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    const dropZone = document.getElementById('drop-zone');
    const processBtn = document.getElementById('process-btn');
    const fileDisplayArea = document.getElementById('file-display-area');
    const convertOptions = document.getElementById('convert-options');
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
        if (!fileDisplayArea || !convertOptions || !processBtn || !fileControls) return;

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
                    state.files = state.files.filter((_: File, i: number) => i !== index);
                    updateUI();
                };

                fileDiv.append(infoContainer, removeBtn);
                fileDisplayArea.appendChild(fileDiv);

                try {
                    const arrayBuffer = await readFileAsArrayBuffer(file);
                    const pdfDoc = await getPDFDocument({ data: arrayBuffer }).promise;
                    metaSpan.textContent = `${formatBytes(file.size)} • ${pdfDoc.numPages} pages`;
                } catch (error) {
                    metaSpan.textContent = `${formatBytes(file.size)} • Could not load page count`;
                }
            }

            createIcons({ icons });
            fileControls.classList.remove('hidden');
            convertOptions.classList.remove('hidden');
            (processBtn as HTMLButtonElement).disabled = false;
        } else {
            fileDisplayArea.innerHTML = '';
            fileControls.classList.add('hidden');
            convertOptions.classList.add('hidden');
            (processBtn as HTMLButtonElement).disabled = true;
        }
    };

    const resetState = () => {
        state.files = [];
        state.pdfDoc = null;
        updateUI();
    };

    const convert = async () => {
        try {
            if (state.files.length === 0) {
                showAlert('No Files', 'Please select at least one PDF file.');
                return;
            }

            showLoader('Loading PDF converter...');
            await pymupdf.load();

            if (state.files.length === 1) {
                const file = state.files[0];
                showLoader(`Converting ${file.name}...`);

                const docxBlob = await pymupdf.pdfToDocx(file);
                const outName = file.name.replace(/\.pdf$/i, '') + '.docx';

                downloadFile(docxBlob, outName);
                hideLoader();

                showAlert(
                    'Conversion Complete',
                    `Successfully converted ${file.name} to DOCX.`,
                    'success',
                    () => resetState()
                );
            } else {
                showLoader('Converting multiple PDFs...');
                const JSZip = (await import('jszip')).default;
                const zip = new JSZip();

                for (let i = 0; i < state.files.length; i++) {
                    const file = state.files[i];
                    showLoader(`Converting ${i + 1}/${state.files.length}: ${file.name}...`);

                    const docxBlob = await pymupdf.pdfToDocx(file);
                    const baseName = file.name.replace(/\.pdf$/i, '');
                    const arrayBuffer = await docxBlob.arrayBuffer();
                    zip.file(`${baseName}.docx`, arrayBuffer);
                }

                showLoader('Creating ZIP archive...');
                const zipBlob = await zip.generateAsync({ type: 'blob' });

                downloadFile(zipBlob, 'converted-documents.zip');
                hideLoader();

                showAlert(
                    'Conversion Complete',
                    `Successfully converted ${state.files.length} PDF(s) to DOCX.`,
                    'success',
                    () => resetState()
                );
            }
        } catch (e: any) {
            hideLoader();
            showAlert('Error', `An error occurred during conversion. Error: ${e.message}`);
        }
    };

    const handleFileSelect = (files: FileList | null) => {
        if (files && files.length > 0) {
            const pdfFiles = Array.from(files).filter(
                f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
            );
            state.files = [...state.files, ...pdfFiles];
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
                handleFileSelect(files);
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
        processBtn.addEventListener('click', convert);
    }
});
