import { showAlert } from '../ui.js';
import { downloadFile, formatBytes } from '../utils/helpers.js';
import { PDFDocument, PDFName } from 'pdf-lib';
import { icons, createIcons } from 'lucide';

interface PageState {
    file: File | null;
}

const pageState: PageState = {
    file: null,
};

function removeMetadataFromDoc(pdfDoc: PDFDocument) {
    const infoDict = (pdfDoc as any).getInfoDict();
    const allKeys = infoDict.keys();
    allKeys.forEach((key: any) => {
        infoDict.delete(key);
    });

    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setCreator('');
    pdfDoc.setProducer('');

    try {
        const catalogDict = (pdfDoc.catalog as any).dict;
        if (catalogDict.has(PDFName.of('Metadata'))) {
            catalogDict.delete(PDFName.of('Metadata'));
        }
    } catch (e: any) {
        console.warn('Could not remove XMP metadata:', e.message);
    }

    try {
        const context = pdfDoc.context;
        if ((context as any).trailerInfo) {
            delete (context as any).trailerInfo.ID;
        }
    } catch (e: any) {
        console.warn('Could not remove document IDs:', e.message);
    }

    try {
        const catalogDict = (pdfDoc.catalog as any).dict;
        if (catalogDict.has(PDFName.of('PieceInfo'))) {
            catalogDict.delete(PDFName.of('PieceInfo'));
        }
    } catch (e: any) {
        console.warn('Could not remove PieceInfo:', e.message);
    }
}

function resetState() {
    pageState.file = null;

    const fileDisplayArea = document.getElementById('file-display-area');
    if (fileDisplayArea) fileDisplayArea.innerHTML = '';

    const toolOptions = document.getElementById('tool-options');
    if (toolOptions) toolOptions.classList.add('hidden');

    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
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
        metaSpan.textContent = formatBytes(pageState.file.size);

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

        if (toolOptions) toolOptions.classList.remove('hidden');
    } else {
        if (toolOptions) toolOptions.classList.add('hidden');
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

async function removeMetadata() {
    if (!pageState.file) {
        showAlert('No File', 'Please upload a PDF file first.');
        return;
    }

    const loaderModal = document.getElementById('loader-modal');
    const loaderText = document.getElementById('loader-text');
    if (loaderModal) loaderModal.classList.remove('hidden');
    if (loaderText) loaderText.textContent = 'Removing all metadata...';

    try {
        const arrayBuffer = await pageState.file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);

        removeMetadataFromDoc(pdfDoc);

        const newPdfBytes = await pdfDoc.save();
        downloadFile(
            new Blob([newPdfBytes as BlobPart], { type: 'application/pdf' }),
            'metadata-removed.pdf'
        );
        showAlert('Success', 'Metadata removed successfully!', 'success', () => { resetState(); });
    } catch (e) {
        console.error(e);
        showAlert('Error', 'An error occurred while trying to remove metadata.');
    } finally {
        if (loaderModal) loaderModal.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    const dropZone = document.getElementById('drop-zone');
    const processBtn = document.getElementById('process-btn');
    const backBtn = document.getElementById('back-to-tools');

    if (backBtn) {
        backBtn.addEventListener('click', function () {
            window.location.href = import.meta.env.BASE_URL;
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
        processBtn.addEventListener('click', removeMetadata);
    }
});
