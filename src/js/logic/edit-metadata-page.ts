import { EditMetadataState } from '@/types';
import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, formatBytes } from '../utils/helpers.js';
import { createIcons, icons } from 'lucide';
import { PDFDocument as PDFLibDocument, PDFName, PDFString } from 'pdf-lib';

const pageState: EditMetadataState = {
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

    // Clear form fields
    const fields = ['meta-title', 'meta-author', 'meta-subject', 'meta-keywords', 'meta-creator', 'meta-producer', 'meta-creation-date', 'meta-mod-date'];
    fields.forEach(function (fieldId) {
        const field = document.getElementById(fieldId) as HTMLInputElement;
        if (field) field.value = '';
    });

    // Clear custom fields
    const customFieldsContainer = document.getElementById('custom-fields-container');
    if (customFieldsContainer) customFieldsContainer.innerHTML = '';
}

function formatDateForInput(date: Date | undefined): string {
    if (!date) return '';
    try {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
        return '';
    }
}

function addCustomFieldRow(key: string = '', value: string = '') {
    const container = document.getElementById('custom-fields-container');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'flex flex-col gap-2';

    const keyInput = document.createElement('input');
    keyInput.type = 'text';
    keyInput.placeholder = 'Key (e.g., Department)';
    keyInput.value = key;
    keyInput.className = 'custom-meta-key w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2.5';

    const valueInput = document.createElement('input');
    valueInput.type = 'text';
    valueInput.placeholder = 'Value (e.g., Marketing)';
    valueInput.value = value;
    valueInput.className = 'custom-meta-value w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2.5';

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'text-red-400 hover:text-red-300 p-2 self-center';
    removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-5 h-5"></i>';
    removeBtn.onclick = function () {
        row.remove();
    };

    row.append(keyInput, valueInput, removeBtn);
    container.appendChild(row);
    createIcons({ icons });
}

function populateMetadataFields() {
    if (!pageState.pdfDoc) return;

    const titleInput = document.getElementById('meta-title') as HTMLInputElement;
    const authorInput = document.getElementById('meta-author') as HTMLInputElement;
    const subjectInput = document.getElementById('meta-subject') as HTMLInputElement;
    const keywordsInput = document.getElementById('meta-keywords') as HTMLInputElement;
    const creatorInput = document.getElementById('meta-creator') as HTMLInputElement;
    const producerInput = document.getElementById('meta-producer') as HTMLInputElement;
    const creationDateInput = document.getElementById('meta-creation-date') as HTMLInputElement;
    const modDateInput = document.getElementById('meta-mod-date') as HTMLInputElement;

    if (titleInput) titleInput.value = pageState.pdfDoc.getTitle() || '';
    if (authorInput) authorInput.value = pageState.pdfDoc.getAuthor() || '';
    if (subjectInput) subjectInput.value = pageState.pdfDoc.getSubject() || '';
    if (keywordsInput) keywordsInput.value = pageState.pdfDoc.getKeywords() || '';
    if (creatorInput) creatorInput.value = pageState.pdfDoc.getCreator() || '';
    if (producerInput) producerInput.value = pageState.pdfDoc.getProducer() || '';
    if (creationDateInput) creationDateInput.value = formatDateForInput(pageState.pdfDoc.getCreationDate());
    if (modDateInput) modDateInput.value = formatDateForInput(pageState.pdfDoc.getModificationDate());

    // Load custom fields
    const customFieldsContainer = document.getElementById('custom-fields-container');
    if (customFieldsContainer) customFieldsContainer.innerHTML = '';

    try {
        // @ts-expect-error getInfoDict is private but accessible at runtime
        const infoDict = pageState.pdfDoc.getInfoDict();
        const standardKeys = new Set([
            'Title', 'Author', 'Subject', 'Keywords', 'Creator',
            'Producer', 'CreationDate', 'ModDate'
        ]);

        const allKeys = infoDict
            .keys()
            .map(function (key: { asString: () => string }) {
                return key.asString().substring(1);
            });

        allKeys.forEach(function (key: string) {
            if (!standardKeys.has(key)) {
                const rawValue = infoDict.lookup(key);
                let displayValue = '';

                if (rawValue && typeof rawValue.decodeText === 'function') {
                    displayValue = rawValue.decodeText();
                } else if (rawValue && typeof rawValue.asString === 'function') {
                    displayValue = rawValue.asString();
                } else if (rawValue) {
                    displayValue = String(rawValue);
                }

                addCustomFieldRow(key, displayValue);
            }
        });
    } catch (e) {
        console.warn('Could not read custom metadata fields:', e);
    }
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

            populateMetadataFields();

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

async function saveMetadata() {
    if (!pageState.pdfDoc || !pageState.file) {
        showAlert('Error', 'Please upload a PDF first.');
        return;
    }

    showLoader('Updating metadata...');

    try {
        const titleInput = document.getElementById('meta-title') as HTMLInputElement;
        const authorInput = document.getElementById('meta-author') as HTMLInputElement;
        const subjectInput = document.getElementById('meta-subject') as HTMLInputElement;
        const keywordsInput = document.getElementById('meta-keywords') as HTMLInputElement;
        const creatorInput = document.getElementById('meta-creator') as HTMLInputElement;
        const producerInput = document.getElementById('meta-producer') as HTMLInputElement;
        const creationDateInput = document.getElementById('meta-creation-date') as HTMLInputElement;
        const modDateInput = document.getElementById('meta-mod-date') as HTMLInputElement;

        pageState.pdfDoc.setTitle(titleInput.value);
        pageState.pdfDoc.setAuthor(authorInput.value);
        pageState.pdfDoc.setSubject(subjectInput.value);
        pageState.pdfDoc.setCreator(creatorInput.value);
        pageState.pdfDoc.setProducer(producerInput.value);

        const keywords = keywordsInput.value;
        pageState.pdfDoc.setKeywords(
            keywords
                .split(',')
                .map(function (k) { return k.trim(); })
                .filter(Boolean)
        );

        // Handle creation date
        if (creationDateInput.value) {
            pageState.pdfDoc.setCreationDate(new Date(creationDateInput.value));
        }

        // Handle modification date
        if (modDateInput.value) {
            pageState.pdfDoc.setModificationDate(new Date(modDateInput.value));
        } else {
            pageState.pdfDoc.setModificationDate(new Date());
        }

        // Handle custom fields
        // @ts-expect-error getInfoDict is private but accessible at runtime
        const infoDict = pageState.pdfDoc.getInfoDict();
        const standardKeys = new Set([
            'Title', 'Author', 'Subject', 'Keywords', 'Creator',
            'Producer', 'CreationDate', 'ModDate'
        ]);

        // Remove existing custom keys
        const allKeys = infoDict
            .keys()
            .map(function (key: { asString: () => string }) {
                return key.asString().substring(1);
            });

        allKeys.forEach(function (key: string) {
            if (!standardKeys.has(key)) {
                infoDict.delete(PDFName.of(key));
            }
        });

        // Add new custom fields
        const customKeys = document.querySelectorAll('.custom-meta-key');
        const customValues = document.querySelectorAll('.custom-meta-value');

        customKeys.forEach(function (keyInput, index) {
            const key = (keyInput as HTMLInputElement).value.trim();
            const value = (customValues[index] as HTMLInputElement).value.trim();
            if (key && value) {
                infoDict.set(PDFName.of(key), PDFString.of(value));
            }
        });

        const newPdfBytes = await pageState.pdfDoc.save();
        const originalName = pageState.file.name.replace(/\.pdf$/i, '');

        downloadFile(
            new Blob([new Uint8Array(newPdfBytes)], { type: 'application/pdf' }),
            `${originalName}_metadata-edited.pdf`
        );

        showAlert('Success', 'Metadata updated successfully!', 'success', function () {
            resetState();
        });
    } catch (e) {
        console.error(e);
        showAlert('Error', 'Could not update metadata. Please check that date formats are correct.');
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
    const addCustomFieldBtn = document.getElementById('add-custom-field');

    if (backBtn) {
        backBtn.addEventListener('click', function () {
            window.location.href = import.meta.env.BASE_URL;
        });
    }

    if (addCustomFieldBtn) {
        addCustomFieldBtn.addEventListener('click', function () {
            addCustomFieldRow();
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
        processBtn.addEventListener('click', saveMetadata);
    }
});
