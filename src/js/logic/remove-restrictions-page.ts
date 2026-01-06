import { showAlert } from '../ui.js';
import { downloadFile, formatBytes, initializeQpdf, readFileAsArrayBuffer } from '../utils/helpers.js';
import { icons, createIcons } from 'lucide';
import { RemoveRestrictionsState } from '@/types';

const pageState: RemoveRestrictionsState = {
    file: null,
};

function resetState() {
    pageState.file = null;

    const fileDisplayArea = document.getElementById('file-display-area');
    if (fileDisplayArea) fileDisplayArea.innerHTML = '';

    const toolOptions = document.getElementById('tool-options');
    if (toolOptions) toolOptions.classList.add('hidden');

    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';

    const passwordInput = document.getElementById('owner-password-remove') as HTMLInputElement;
    if (passwordInput) passwordInput.value = '';
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

async function removeRestrictions() {
    if (!pageState.file) {
        showAlert('No File', 'Please upload a PDF file first.');
        return;
    }

    const password = (document.getElementById('owner-password-remove') as HTMLInputElement)?.value || '';

    const inputPath = '/input.pdf';
    const outputPath = '/output.pdf';
    let qpdf: any;

    const loaderModal = document.getElementById('loader-modal');
    const loaderText = document.getElementById('loader-text');

    try {
        if (loaderModal) loaderModal.classList.remove('hidden');
        if (loaderText) loaderText.textContent = 'Initializing...';

        qpdf = await initializeQpdf();

        if (loaderText) loaderText.textContent = 'Reading PDF...';
        const fileBuffer = await readFileAsArrayBuffer(pageState.file);
        const uint8Array = new Uint8Array(fileBuffer as ArrayBuffer);

        qpdf.FS.writeFile(inputPath, uint8Array);

        if (loaderText) loaderText.textContent = 'Removing restrictions...';

        const args = [inputPath];

        if (password) {
            args.push(`--password=${password}`);
        }

        args.push('--decrypt', '--remove-restrictions', '--', outputPath);

        try {
            qpdf.callMain(args);
        } catch (qpdfError: any) {
            console.error('qpdf execution error:', qpdfError);
            if (
                qpdfError.message?.includes('password') ||
                qpdfError.message?.includes('encrypt')
            ) {
                throw new Error(
                    'Failed to remove restrictions. The PDF may require the correct owner password.'
                );
            }

            throw new Error(
                'Failed to remove restrictions: ' +
                (qpdfError.message || 'Unknown error')
            );
        }

        if (loaderText) loaderText.textContent = 'Preparing download...';
        const outputFile = qpdf.FS.readFile(outputPath, { encoding: 'binary' });

        if (!outputFile || outputFile.length === 0) {
            throw new Error('Operation resulted in an empty file.');
        }

        const blob = new Blob([outputFile], { type: 'application/pdf' });
        downloadFile(blob, `unrestricted-${pageState.file.name}`);

        if (loaderModal) loaderModal.classList.add('hidden');

        showAlert(
            'Success',
            'PDF restrictions removed successfully! The file is now fully editable and printable.',
            'success',
            () => { resetState(); }
        );
    } catch (error: any) {
        console.error('Error during restriction removal:', error);
        if (loaderModal) loaderModal.classList.add('hidden');
        showAlert(
            'Operation Failed',
            `An error occurred: ${error.message || 'The PDF might be corrupted or password-protected.'}`
        );
    } finally {
        try {
            if (qpdf?.FS) {
                try {
                    qpdf.FS.unlink(inputPath);
                } catch (e) {
                    console.warn('Failed to unlink input file:', e);
                }
                try {
                    qpdf.FS.unlink(outputPath);
                } catch (e) {
                    console.warn('Failed to unlink output file:', e);
                }
            }
        } catch (cleanupError) {
            console.warn('Failed to cleanup WASM FS:', cleanupError);
        }
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
        processBtn.addEventListener('click', removeRestrictions);
    }
});
