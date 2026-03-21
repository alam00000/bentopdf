import { showAlert } from '../ui.js';
import { downloadFile, formatBytes, initializeQpdf, readFileAsArrayBuffer } from '../utils/helpers.js';
import { icons, createIcons } from 'lucide';
import { EncryptPdfState } from '@/types';

const pageState: EncryptPdfState = {
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

    const userPasswordInput = document.getElementById('user-password-input') as HTMLInputElement;
    if (userPasswordInput) userPasswordInput.value = '';

    const ownerPasswordInput = document.getElementById('owner-password-input') as HTMLInputElement;
    if (ownerPasswordInput) ownerPasswordInput.value = '';
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

async function encryptPdf() {
    if (!pageState.file) {
        showAlert('No File', 'Please upload a PDF file first.');
        return;
    }

    const userPassword = (document.getElementById('user-password-input') as HTMLInputElement)?.value || '';
    const ownerPasswordInput = (document.getElementById('owner-password-input') as HTMLInputElement)?.value || '';

    if (!userPassword) {
        showAlert('Input Required', 'Please enter a user password.');
        return;
    }

    const ownerPassword = ownerPasswordInput || userPassword;
    const hasDistinctOwnerPassword = ownerPasswordInput !== '';

    const inputPath = '/input.pdf';
    const outputPath = '/output.pdf';
    let qpdf: any;

    const loaderModal = document.getElementById('loader-modal');
    const loaderText = document.getElementById('loader-text');

    try {
        if (loaderModal) loaderModal.classList.remove('hidden');
        if (loaderText) loaderText.textContent = 'Initializing encryption...';

        qpdf = await initializeQpdf();

        if (loaderText) loaderText.textContent = 'Reading PDF...';
        const fileBuffer = await readFileAsArrayBuffer(pageState.file);
        const uint8Array = new Uint8Array(fileBuffer as ArrayBuffer);

        qpdf.FS.writeFile(inputPath, uint8Array);

        if (loaderText) loaderText.textContent = 'Encrypting PDF with 256-bit AES...';

        const args = [inputPath, '--encrypt', userPassword, ownerPassword, '256'];

        // Only add restrictions if a distinct owner password was provided
        if (hasDistinctOwnerPassword) {
            args.push(
                '--modify=none',
                '--extract=n',
                '--print=none',
                '--accessibility=n',
                '--annotate=n',
                '--assemble=n',
                '--form=n',
                '--modify-other=n'
            );
        }

        args.push('--', outputPath);

        try {
            qpdf.callMain(args);
        } catch (qpdfError: any) {
            console.error('qpdf execution error:', qpdfError);
            throw new Error(
                'Encryption failed: ' + (qpdfError.message || 'Unknown error')
            );
        }

        if (loaderText) loaderText.textContent = 'Preparing download...';
        const outputFile = qpdf.FS.readFile(outputPath, { encoding: 'binary' });

        if (!outputFile || outputFile.length === 0) {
            throw new Error('Encryption resulted in an empty file.');
        }

        const blob = new Blob([outputFile], { type: 'application/pdf' });
        downloadFile(blob, `encrypted-${pageState.file.name}`);

        if (loaderModal) loaderModal.classList.add('hidden');

        let successMessage = 'PDF encrypted successfully with 256-bit AES!';
        if (!hasDistinctOwnerPassword) {
            successMessage +=
                ' Note: Without a separate owner password, the PDF has no usage restrictions.';
        }

        showAlert('Success', successMessage, 'success', () => { resetState(); });
    } catch (error: any) {
        console.error('Error during PDF encryption:', error);
        if (loaderModal) loaderModal.classList.add('hidden');
        showAlert(
            'Encryption Failed',
            `An error occurred: ${error.message || 'The PDF might be corrupted.'}`
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
        processBtn.addEventListener('click', encryptPdf);
    }
});
