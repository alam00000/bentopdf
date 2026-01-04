import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, formatBytes } from '../utils/helpers.js';
import { createIcons, icons } from 'lucide';
import { PyMuPDF } from '@bentopdf/pymupdf-wasm';
import { getWasmBaseUrl } from '../config/wasm-cdn-config.js';

let files: File[] = [];
let currentMode: 'upload' | 'text' = 'upload';

// RTL character detection pattern (Arabic, Hebrew, Persian, etc.)
const RTL_PATTERN = /[\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0750-\u077F\u0780-\u07BF\u07C0-\u07FF\u08A0-\u08FF\uFB1D-\uFB4F\uFB50-\uFDFF\uFE70-\uFEFF]/;

function hasRtlCharacters(text: string): boolean {
    return RTL_PATTERN.test(text);
}

const updateUI = () => {
    const fileDisplayArea = document.getElementById('file-display-area');
    const fileControls = document.getElementById('file-controls');
    const dropZone = document.getElementById('drop-zone');

    if (!fileDisplayArea || !fileControls || !dropZone) return;

    fileDisplayArea.innerHTML = '';

    if (files.length > 0 && currentMode === 'upload') {
        dropZone.classList.add('hidden');
        fileControls.classList.remove('hidden');

        files.forEach((file, index) => {
            const fileDiv = document.createElement('div');
            fileDiv.className = 'flex items-center justify-between bg-gray-700 p-3 rounded-lg text-sm';

            const infoSpan = document.createElement('span');
            infoSpan.className = 'truncate font-medium text-gray-200';
            infoSpan.textContent = file.name;

            const sizeSpan = document.createElement('span');
            sizeSpan.className = 'text-gray-400 text-xs ml-2';
            sizeSpan.textContent = `(${formatBytes(file.size)})`;

            const removeBtn = document.createElement('button');
            removeBtn.className = 'ml-4 text-red-400 hover:text-red-300';
            removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
            removeBtn.onclick = () => {
                files = files.filter((_, i) => i !== index);
                updateUI();
            };

            fileDiv.append(infoSpan, sizeSpan, removeBtn);
            fileDisplayArea.appendChild(fileDiv);
        });
        createIcons({ icons });
    } else {
        dropZone.classList.remove('hidden');
        fileControls.classList.add('hidden');
    }
};

const resetState = () => {
    files = [];
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    const textInput = document.getElementById('text-input') as HTMLTextAreaElement;
    if (fileInput) fileInput.value = '';
    if (textInput) textInput.value = '';
    updateUI();
};

async function convert() {
    const fontSize = parseInt((document.getElementById('font-size') as HTMLInputElement).value) || 12;
    const pageSizeKey = (document.getElementById('page-size') as HTMLSelectElement).value;
    const fontName = (document.getElementById('font-family') as HTMLSelectElement)?.value || 'helv';
    const textColor = (document.getElementById('text-color') as HTMLInputElement)?.value || '#000000';

    if (currentMode === 'upload' && files.length === 0) {
        showAlert('No Files', 'Please select at least one text file.');
        return;
    }

    if (currentMode === 'text') {
        const textInput = document.getElementById('text-input') as HTMLTextAreaElement;
        if (!textInput.value.trim()) {
            showAlert('No Text', 'Please enter some text to convert.');
            return;
        }
    }

    showLoader('Loading engine...');

    try {
        const pymupdf = new PyMuPDF(getWasmBaseUrl('pymupdf'));
        await pymupdf.load();

        let textContent = '';

        if (currentMode === 'upload') {
            for (const file of files) {
                const text = await file.text();
                textContent += text + '\n\n';
            }
        } else {
            const textInput = document.getElementById('text-input') as HTMLTextAreaElement;
            textContent = textInput.value;
        }

        showLoader('Creating PDF...');

        const pdfBlob = await pymupdf.textToPdf(textContent, {
            fontSize,
            pageSize: pageSizeKey as 'a4' | 'letter' | 'legal' | 'a3' | 'a5',
            fontName: fontName as 'helv' | 'tiro' | 'cour' | 'times',
            textColor,
            margins: 72
        });

        downloadFile(pdfBlob, 'text_to_pdf.pdf');

        showAlert('Success', 'Text converted to PDF successfully!', 'success', () => {
            resetState();
        });
    } catch (e: any) {
        console.error('[TxtToPDF] Error:', e);
        showAlert('Error', `Failed to convert text to PDF. ${e.message || ''}`);
    } finally {
        hideLoader();
    }
}

// Update textarea direction based on RTL detection
function updateTextareaDirection(textarea: HTMLTextAreaElement) {
    const text = textarea.value;
    if (hasRtlCharacters(text)) {
        textarea.style.direction = 'rtl';
        textarea.style.textAlign = 'right';
    } else {
        textarea.style.direction = 'ltr';
        textarea.style.textAlign = 'left';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    const dropZone = document.getElementById('drop-zone');
    const addMoreBtn = document.getElementById('add-more-btn');
    const clearFilesBtn = document.getElementById('clear-files-btn');
    const processBtn = document.getElementById('process-btn');
    const backBtn = document.getElementById('back-to-tools');
    const uploadModeBtn = document.getElementById('txt-mode-upload-btn');
    const textModeBtn = document.getElementById('txt-mode-text-btn');
    const uploadPanel = document.getElementById('txt-upload-panel');
    const textPanel = document.getElementById('txt-text-panel');
    const textInput = document.getElementById('text-input') as HTMLTextAreaElement;

    // Back to Tools
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = import.meta.env.BASE_URL;
        });
    }

    // Mode switching
    if (uploadModeBtn && textModeBtn && uploadPanel && textPanel) {
        uploadModeBtn.addEventListener('click', () => {
            currentMode = 'upload';
            uploadModeBtn.classList.remove('bg-gray-700', 'text-gray-300');
            uploadModeBtn.classList.add('bg-indigo-600', 'text-white');
            textModeBtn.classList.remove('bg-indigo-600', 'text-white');
            textModeBtn.classList.add('bg-gray-700', 'text-gray-300');
            uploadPanel.classList.remove('hidden');
            textPanel.classList.add('hidden');
        });

        textModeBtn.addEventListener('click', () => {
            currentMode = 'text';
            textModeBtn.classList.remove('bg-gray-700', 'text-gray-300');
            textModeBtn.classList.add('bg-indigo-600', 'text-white');
            uploadModeBtn.classList.remove('bg-indigo-600', 'text-white');
            uploadModeBtn.classList.add('bg-gray-700', 'text-gray-300');
            textPanel.classList.remove('hidden');
            uploadPanel.classList.add('hidden');
        });
    }

    // RTL auto-detection for textarea
    if (textInput) {
        textInput.addEventListener('input', () => {
            updateTextareaDirection(textInput);
        });
    }

    // File handling
    const handleFileSelect = (newFiles: FileList | null) => {
        if (!newFiles || newFiles.length === 0) return;
        const validFiles = Array.from(newFiles).filter(
            (file) => file.name.toLowerCase().endsWith('.txt') || file.type === 'text/plain'
        );

        if (validFiles.length < newFiles.length) {
            showAlert('Invalid Files', 'Some files were skipped. Only text files are allowed.');
        }

        if (validFiles.length > 0) {
            files = [...files, ...validFiles];
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
            handleFileSelect(e.dataTransfer?.files ?? null);
        });

        fileInput.addEventListener('click', () => {
            fileInput.value = '';
        });
    }

    if (addMoreBtn && fileInput) {
        addMoreBtn.addEventListener('click', () => {
            fileInput.click();
        });
    }

    if (clearFilesBtn) {
        clearFilesBtn.addEventListener('click', () => {
            files = [];
            updateUI();
        });
    }

    if (processBtn) {
        processBtn.addEventListener('click', convert);
    }

    createIcons({ icons });
});
