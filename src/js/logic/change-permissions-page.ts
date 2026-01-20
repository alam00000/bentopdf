import { showAlert } from '../ui.js';
import { downloadFile, formatBytes, initializeQpdf, readFileAsArrayBuffer } from '../utils/helpers.js';
import { icons, createIcons } from 'lucide';
import { ChangePermissionsState } from '@/types';

const pageState: ChangePermissionsState = {
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

    const currentPassword = document.getElementById('current-password') as HTMLInputElement;
    if (currentPassword) currentPassword.value = '';

    const newUserPassword = document.getElementById('new-user-password') as HTMLInputElement;
    if (newUserPassword) newUserPassword.value = '';

    const newOwnerPassword = document.getElementById('new-owner-password') as HTMLInputElement;
    if (newOwnerPassword) newOwnerPassword.value = '';
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

async function changePermissions() {
    if (!pageState.file) {
        showAlert('No File', 'Please upload a PDF file first.');
        return;
    }

    const currentPassword = (document.getElementById('current-password') as HTMLInputElement)?.value || '';
    const newUserPassword = (document.getElementById('new-user-password') as HTMLInputElement)?.value || '';
    const newOwnerPassword = (document.getElementById('new-owner-password') as HTMLInputElement)?.value || '';

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

        if (loaderText) loaderText.textContent = 'Processing PDF permissions...';

        const args = [inputPath];

        if (currentPassword) {
            args.push('--password=' + currentPassword);
        }

        const shouldEncrypt = newUserPassword || newOwnerPassword;

        if (shouldEncrypt) {
            const finalUserPassword = newUserPassword;
            const finalOwnerPassword = newOwnerPassword;

            args.push('--encrypt', finalUserPassword, finalOwnerPassword, '256');

            const allowPrinting = (document.getElementById('allow-printing') as HTMLInputElement)?.checked;
            const allowCopying = (document.getElementById('allow-copying') as HTMLInputElement)?.checked;
            const allowModifying = (document.getElementById('allow-modifying') as HTMLInputElement)?.checked;
            const allowAnnotating = (document.getElementById('allow-annotating') as HTMLInputElement)?.checked;
            const allowFillingForms = (document.getElementById('allow-filling-forms') as HTMLInputElement)?.checked;
            const allowDocumentAssembly = (document.getElementById('allow-document-assembly') as HTMLInputElement)?.checked;
            const allowPageExtraction = (document.getElementById('allow-page-extraction') as HTMLInputElement)?.checked;

            if (finalOwnerPassword) {
                if (!allowModifying) args.push('--modify=none');
                if (!allowCopying) args.push('--extract=n');
                if (!allowPrinting) args.push('--print=none');
                if (!allowAnnotating) args.push('--annotate=n');
                if (!allowDocumentAssembly) args.push('--assemble=n');
                if (!allowFillingForms) args.push('--form=n');
                if (!allowPageExtraction) args.push('--extract=n');
                if (!allowModifying) args.push('--modify-other=n');
            } else if (finalUserPassword) {
                args.push('--allow-insecure');
            }
        } else {
            args.push('--decrypt');
        }

        args.push('--', outputPath);
        try {
            qpdf.callMain(args);
        } catch (qpdfError: any) {
            console.error('qpdf execution error:', qpdfError);

            const errorMsg = qpdfError.message || '';

            if (
                errorMsg.includes('invalid password') ||
                errorMsg.includes('incorrect password') ||
                errorMsg.includes('password')
            ) {
                throw new Error('INVALID_PASSWORD');
            }

            if (
                errorMsg.includes('encrypted') ||
                errorMsg.includes('password required')
            ) {
                throw new Error('PASSWORD_REQUIRED');
            }

            throw new Error('Processing failed: ' + errorMsg || 'Unknown error');
        }

        if (loaderText) loaderText.textContent = 'Preparing download...';
        const outputFile = qpdf.FS.readFile(outputPath, { encoding: 'binary' });

        if (!outputFile || outputFile.length === 0) {
            throw new Error('Processing resulted in an empty file.');
        }

        const blob = new Blob([outputFile], { type: 'application/pdf' });
        downloadFile(blob, `permissions-changed-${pageState.file.name}`);

        if (loaderModal) loaderModal.classList.add('hidden');

        let successMessage = 'PDF permissions changed successfully!';
        if (!shouldEncrypt) {
            successMessage = 'PDF decrypted successfully! All encryption and restrictions removed.';
        }

        showAlert('Success', successMessage, 'success', () => { resetState(); });
    } catch (error: any) {
        console.error('Error during PDF permission change:', error);
        if (loaderModal) loaderModal.classList.add('hidden');

        if (error.message === 'INVALID_PASSWORD') {
            showAlert(
                'Incorrect Password',
                'The current password you entered is incorrect. Please try again.'
            );
        } else if (error.message === 'PASSWORD_REQUIRED') {
            showAlert(
                'Password Required',
                'This PDF is password-protected. Please enter the current password to proceed.'
            );
        } else {
            showAlert(
                'Processing Failed',
                `An error occurred: ${error.message || 'The PDF might be corrupted or password protected.'}`
            );
        }
    } finally {
        try {
            if (qpdf?.FS) {
                try {
                    qpdf.FS.unlink(inputPath);
                } catch (e) { }
                try {
                    qpdf.FS.unlink(outputPath);
                } catch (e) { }
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
        processBtn.addEventListener('click', changePermissions);
    }
});
