import { createIcons, icons } from 'lucide';
import { showAlert, showLoader, hideLoader } from '../ui.js';
import { readFileAsArrayBuffer, formatBytes, downloadFile, getPDFDocument } from '../utils/helpers.js';
import {
    signPdf,
    parsePfxFile,
    parseCombinedPem,
    getCertificateInfo,
} from './digital-sign-pdf.js';
import { SignatureInfo, VisibleSignatureOptions, DigitalSignState } from '@/types';

const state: DigitalSignState = {
    pdfFile: null,
    pdfBytes: null,
    certFile: null,
    certData: null,
    sigImageData: null,
    sigImageType: null,
};

function resetState(): void {
    state.pdfFile = null;
    state.pdfBytes = null;
    state.certFile = null;
    state.certData = null;
    state.sigImageData = null;
    state.sigImageType = null;

    const fileDisplayArea = getElement<HTMLDivElement>('file-display-area');
    if (fileDisplayArea) fileDisplayArea.innerHTML = '';

    const certDisplayArea = getElement<HTMLDivElement>('cert-display-area');
    if (certDisplayArea) certDisplayArea.innerHTML = '';

    const fileInput = getElement<HTMLInputElement>('file-input');
    if (fileInput) fileInput.value = '';

    const certInput = getElement<HTMLInputElement>('cert-input');
    if (certInput) certInput.value = '';

    const sigImageInput = getElement<HTMLInputElement>('sig-image-input');
    if (sigImageInput) sigImageInput.value = '';

    const sigImagePreview = getElement<HTMLDivElement>('sig-image-preview');
    if (sigImagePreview) sigImagePreview.classList.add('hidden');

    const certSection = getElement<HTMLDivElement>('certificate-section');
    if (certSection) certSection.classList.add('hidden');

    hidePasswordSection();
    hideSignatureOptions();
    hideCertInfo();
    updateProcessButton();
}

function getElement<T extends HTMLElement>(id: string): T | null {
    return document.getElementById(id) as T | null;
}

function initializePage(): void {
    createIcons({ icons });

    const fileInput = getElement<HTMLInputElement>('file-input');
    const dropZone = getElement<HTMLDivElement>('drop-zone');
    const certInput = getElement<HTMLInputElement>('cert-input');
    const certDropZone = getElement<HTMLDivElement>('cert-drop-zone');
    const certPassword = getElement<HTMLInputElement>('cert-password');
    const processBtn = getElement<HTMLButtonElement>('process-btn');
    const backBtn = getElement<HTMLButtonElement>('back-to-tools');

    if (fileInput) {
        fileInput.addEventListener('change', handlePdfUpload);
        fileInput.addEventListener('click', () => {
            fileInput.value = '';
        });
    }

    if (dropZone) {
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('bg-gray-700');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('bg-gray-700');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('bg-gray-700');
            const droppedFiles = e.dataTransfer?.files;
            if (droppedFiles && droppedFiles.length > 0) {
                handlePdfFile(droppedFiles[0]);
            }
        });
    }

    if (certInput) {
        certInput.addEventListener('change', handleCertUpload);
        certInput.addEventListener('click', () => {
            certInput.value = '';
        });
    }

    if (certDropZone) {
        certDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            certDropZone.classList.add('bg-gray-700');
        });

        certDropZone.addEventListener('dragleave', () => {
            certDropZone.classList.remove('bg-gray-700');
        });

        certDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            certDropZone.classList.remove('bg-gray-700');
            const droppedFiles = e.dataTransfer?.files;
            if (droppedFiles && droppedFiles.length > 0) {
                handleCertFile(droppedFiles[0]);
            }
        });
    }

    if (certPassword) {
        certPassword.addEventListener('input', handlePasswordInput);
        certPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handlePasswordInput();
            }
        });
    }

    if (processBtn) {
        processBtn.addEventListener('click', processSignature);
    }

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = import.meta.env.BASE_URL;
        });
    }

    const enableVisibleSig = getElement<HTMLInputElement>('enable-visible-sig');
    const visibleSigOptions = getElement<HTMLDivElement>('visible-sig-options');
    const sigPage = getElement<HTMLSelectElement>('sig-page');
    const customPageWrapper = getElement<HTMLDivElement>('custom-page-wrapper');
    const sigImageInput = getElement<HTMLInputElement>('sig-image-input');
    const sigImagePreview = getElement<HTMLDivElement>('sig-image-preview');
    const sigImageThumb = getElement<HTMLImageElement>('sig-image-thumb');
    const removeSigImage = getElement<HTMLButtonElement>('remove-sig-image');
    const enableSigText = getElement<HTMLInputElement>('enable-sig-text');
    const sigTextOptions = getElement<HTMLDivElement>('sig-text-options');

    if (enableVisibleSig && visibleSigOptions) {
        enableVisibleSig.addEventListener('change', () => {
            if (enableVisibleSig.checked) {
                visibleSigOptions.classList.remove('hidden');
            } else {
                visibleSigOptions.classList.add('hidden');
            }
        });
    }

    if (sigPage && customPageWrapper) {
        sigPage.addEventListener('change', () => {
            if (sigPage.value === 'custom') {
                customPageWrapper.classList.remove('hidden');
            } else {
                customPageWrapper.classList.add('hidden');
            }
        });
    }

    if (sigImageInput) {
        sigImageInput.addEventListener('change', async (e) => {
            const input = e.target as HTMLInputElement;
            if (input.files && input.files.length > 0) {
                const file = input.files[0];
                const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
                if (!validTypes.includes(file.type)) {
                    showAlert('Invalid Image', 'Please select a PNG, JPG, or WebP image.');
                    return;
                }
                state.sigImageData = await readFileAsArrayBuffer(file) as ArrayBuffer;
                state.sigImageType = file.type.replace('image/', '') as 'png' | 'jpeg' | 'webp';

                if (sigImageThumb && sigImagePreview) {
                    const url = URL.createObjectURL(file);
                    sigImageThumb.src = url;
                    sigImagePreview.classList.remove('hidden');
                }
            }
        });
    }

    if (removeSigImage && sigImagePreview) {
        removeSigImage.addEventListener('click', () => {
            state.sigImageData = null;
            state.sigImageType = null;
            sigImagePreview.classList.add('hidden');
            if (sigImageInput) sigImageInput.value = '';
        });
    }

    if (enableSigText && sigTextOptions) {
        enableSigText.addEventListener('change', () => {
            if (enableSigText.checked) {
                sigTextOptions.classList.remove('hidden');
            } else {
                sigTextOptions.classList.add('hidden');
            }
        });
    }
}

function handlePdfUpload(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
        handlePdfFile(input.files[0]);
    }
}

async function handlePdfFile(file: File): Promise<void> {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        showAlert('Invalid File', 'Please select a PDF file.');
        return;
    }

    state.pdfFile = file;
    state.pdfBytes = new Uint8Array(await readFileAsArrayBuffer(file) as ArrayBuffer);

    updatePdfDisplay();
    showCertificateSection();
}

async function updatePdfDisplay(): Promise<void> {
    const fileDisplayArea = getElement<HTMLDivElement>('file-display-area');

    if (!fileDisplayArea || !state.pdfFile) return;

    fileDisplayArea.innerHTML = '';

    const fileDiv = document.createElement('div');
    fileDiv.className = 'flex items-center justify-between bg-gray-700 p-3 rounded-lg';

    const infoContainer = document.createElement('div');
    infoContainer.className = 'flex flex-col flex-1 min-w-0';

    const nameSpan = document.createElement('div');
    nameSpan.className = 'truncate font-medium text-gray-200 text-sm mb-1';
    nameSpan.textContent = state.pdfFile.name;

    const metaSpan = document.createElement('div');
    metaSpan.className = 'text-xs text-gray-400';
    metaSpan.textContent = `${formatBytes(state.pdfFile.size)} • Loading pages...`;

    infoContainer.append(nameSpan, metaSpan);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'ml-4 text-red-400 hover:text-red-300 flex-shrink-0';
    removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
    removeBtn.onclick = () => {
        state.pdfFile = null;
        state.pdfBytes = null;
        fileDisplayArea.innerHTML = '';
        hideCertificateSection();
        updateProcessButton();
    };

    fileDiv.append(infoContainer, removeBtn);
    fileDisplayArea.appendChild(fileDiv);
    createIcons({ icons });

    try {
        if (state.pdfBytes) {
            const pdfDoc = await getPDFDocument({ data: state.pdfBytes.slice() }).promise;
            metaSpan.textContent = `${formatBytes(state.pdfFile.size)} • ${pdfDoc.numPages} pages`;
        }
    } catch (error) {
        console.error('Error loading PDF:', error);
        metaSpan.textContent = `${formatBytes(state.pdfFile.size)}`;
    }
}

function showCertificateSection(): void {
    const certSection = getElement<HTMLDivElement>('certificate-section');
    if (certSection) {
        certSection.classList.remove('hidden');
    }
}

function hideCertificateSection(): void {
    const certSection = getElement<HTMLDivElement>('certificate-section');
    const signatureOptions = getElement<HTMLDivElement>('signature-options');

    if (certSection) {
        certSection.classList.add('hidden');
    }
    if (signatureOptions) {
        signatureOptions.classList.add('hidden');
    }

    state.certFile = null;
    state.certData = null;

    const certDisplayArea = getElement<HTMLDivElement>('cert-display-area');
    if (certDisplayArea) {
        certDisplayArea.innerHTML = '';
    }

    const certInfo = getElement<HTMLDivElement>('cert-info');
    if (certInfo) {
        certInfo.classList.add('hidden');
    }

    const certPasswordSection = getElement<HTMLDivElement>('cert-password-section');
    if (certPasswordSection) {
        certPasswordSection.classList.add('hidden');
    }
}

function handleCertUpload(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
        handleCertFile(input.files[0]);
    }
}

async function handleCertFile(file: File): Promise<void> {
    const validExtensions = ['.pfx', '.p12', '.pem'];
    const hasValidExtension = validExtensions.some(ext =>
        file.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidExtension) {
        showAlert('Invalid Certificate', 'Please select a .pfx, .p12, or .pem certificate file.');
        return;
    }

    state.certFile = file;
    state.certData = null;

    updateCertDisplay();

    const isPemFile = file.name.toLowerCase().endsWith('.pem');

    if (isPemFile) {
        try {
            const pemContent = await file.text();
            const isEncrypted = pemContent.includes('ENCRYPTED');

            if (isEncrypted) {
                showPasswordSection();
                updatePasswordLabel('Private Key Password');
            } else {
                state.certData = parseCombinedPem(pemContent);
                updateCertInfo();
                showSignatureOptions();

                const certStatus = getElement<HTMLDivElement>('cert-status');
                if (certStatus) {
                    certStatus.innerHTML = 'Certificate loaded <i data-lucide="check" class="inline w-4 h-4"></i>';
                    createIcons({ icons });
                    certStatus.className = 'text-xs text-green-400';
                }
            }
        } catch (error) {
            const certStatus = getElement<HTMLDivElement>('cert-status');
            if (certStatus) {
                certStatus.textContent = 'Failed to parse PEM file';
                certStatus.className = 'text-xs text-red-400';
            }
        }
    } else {
        showPasswordSection();
        updatePasswordLabel('Certificate Password');
    }

    hideSignatureOptions();
    updateProcessButton();
}

function updateCertDisplay(): void {
    const certDisplayArea = getElement<HTMLDivElement>('cert-display-area');

    if (!certDisplayArea || !state.certFile) return;

    certDisplayArea.innerHTML = '';

    const certDiv = document.createElement('div');
    certDiv.className = 'flex items-center justify-between bg-gray-700 p-3 rounded-lg';

    const infoContainer = document.createElement('div');
    infoContainer.className = 'flex flex-col flex-1 min-w-0';

    const nameSpan = document.createElement('div');
    nameSpan.className = 'truncate font-medium text-gray-200 text-sm mb-1';
    nameSpan.textContent = state.certFile.name;

    const metaSpan = document.createElement('div');
    metaSpan.className = 'text-xs text-gray-400';
    metaSpan.id = 'cert-status';
    metaSpan.textContent = 'Enter password to unlock';

    infoContainer.append(nameSpan, metaSpan);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'ml-4 text-red-400 hover:text-red-300 flex-shrink-0';
    removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
    removeBtn.onclick = () => {
        state.certFile = null;
        state.certData = null;
        certDisplayArea.innerHTML = '';
        hidePasswordSection();
        hideCertInfo();
        hideSignatureOptions();
        updateProcessButton();
    };

    certDiv.append(infoContainer, removeBtn);
    certDisplayArea.appendChild(certDiv);
    createIcons({ icons });
}

function showPasswordSection(): void {
    const certPasswordSection = getElement<HTMLDivElement>('cert-password-section');
    if (certPasswordSection) {
        certPasswordSection.classList.remove('hidden');
    }

    const certPassword = getElement<HTMLInputElement>('cert-password');
    if (certPassword) {
        certPassword.value = '';
        certPassword.focus();
    }
}

function updatePasswordLabel(labelText: string): void {
    const label = document.querySelector('label[for="cert-password"]');
    if (label) {
        label.textContent = labelText;
    }
}

function hidePasswordSection(): void {
    const certPasswordSection = getElement<HTMLDivElement>('cert-password-section');
    if (certPasswordSection) {
        certPasswordSection.classList.add('hidden');
    }
}

function showSignatureOptions(): void {
    const signatureOptions = getElement<HTMLDivElement>('signature-options');
    if (signatureOptions) {
        signatureOptions.classList.remove('hidden');
    }
    const visibleSigSection = getElement<HTMLDivElement>('visible-signature-section');
    if (visibleSigSection) {
        visibleSigSection.classList.remove('hidden');
    }
}

function hideSignatureOptions(): void {
    const signatureOptions = getElement<HTMLDivElement>('signature-options');
    if (signatureOptions) {
        signatureOptions.classList.add('hidden');
    }
    const visibleSigSection = getElement<HTMLDivElement>('visible-signature-section');
    if (visibleSigSection) {
        visibleSigSection.classList.add('hidden');
    }
}

function hideCertInfo(): void {
    const certInfo = getElement<HTMLDivElement>('cert-info');
    if (certInfo) {
        certInfo.classList.add('hidden');
    }
}

async function handlePasswordInput(): Promise<void> {
    const certPassword = getElement<HTMLInputElement>('cert-password');
    const password = certPassword?.value ?? '';

    if (!state.certFile || !password) {
        return;
    }

    try {
        const isPemFile = state.certFile.name.toLowerCase().endsWith('.pem');

        if (isPemFile) {
            const pemContent = await state.certFile.text();
            state.certData = parseCombinedPem(pemContent, password);
        } else {
            const certBytes = await readFileAsArrayBuffer(state.certFile) as ArrayBuffer;
            state.certData = parsePfxFile(certBytes, password);
        }

        updateCertInfo();
        showSignatureOptions();
        updateProcessButton();

        const certStatus = getElement<HTMLDivElement>('cert-status');
        if (certStatus) {
            certStatus.innerHTML = 'Certificate unlocked <i data-lucide="check-circle" class="inline w-4 h-4"></i>';
            createIcons({ icons });
            certStatus.className = 'text-xs text-green-400';
        }
    } catch (error) {
        state.certData = null;
        hideSignatureOptions();
        updateProcessButton();

        const certStatus = getElement<HTMLDivElement>('cert-status');
        if (certStatus) {
            const errorMessage = error instanceof Error ? error.message : 'Invalid password or certificate';
            certStatus.textContent = errorMessage.includes('password')
                ? 'Incorrect password'
                : 'Failed to parse certificate';
            certStatus.className = 'text-xs text-red-400';
        }
    }
}

function updateCertInfo(): void {
    if (!state.certData) return;

    const certInfo = getElement<HTMLDivElement>('cert-info');
    const certSubject = getElement<HTMLSpanElement>('cert-subject');
    const certIssuer = getElement<HTMLSpanElement>('cert-issuer');
    const certValidity = getElement<HTMLSpanElement>('cert-validity');

    if (!certInfo) return;

    const info = getCertificateInfo(state.certData.certificate);

    if (certSubject) {
        certSubject.textContent = info.subject;
    }
    if (certIssuer) {
        certIssuer.textContent = info.issuer;
    }
    if (certValidity) {
        const formatDate = (date: Date) => date.toLocaleDateString();
        certValidity.textContent = `${formatDate(info.validFrom)} - ${formatDate(info.validTo)}`;
    }

    certInfo.classList.remove('hidden');
}

function updateProcessButton(): void {
    const processBtn = getElement<HTMLButtonElement>('process-btn');
    if (!processBtn) return;

    const canProcess = state.pdfBytes !== null && state.certData !== null;

    if (canProcess) {
        processBtn.style.display = '';
    } else {
        processBtn.style.display = 'none';
    }
}

async function processSignature(): Promise<void> {
    if (!state.pdfBytes || !state.certData) {
        showAlert('Missing Data', 'Please upload both a PDF and a valid certificate.');
        return;
    }

    const reason = getElement<HTMLInputElement>('sign-reason')?.value ?? '';
    const location = getElement<HTMLInputElement>('sign-location')?.value ?? '';
    const contactInfo = getElement<HTMLInputElement>('sign-contact')?.value ?? '';

    const signatureInfo: SignatureInfo = {};
    if (reason) signatureInfo.reason = reason;
    if (location) signatureInfo.location = location;
    if (contactInfo) signatureInfo.contactInfo = contactInfo;

    let visibleSignature: VisibleSignatureOptions | undefined;

    const enableVisibleSig = getElement<HTMLInputElement>('enable-visible-sig');
    if (enableVisibleSig?.checked) {
        const sigX = parseInt(getElement<HTMLInputElement>('sig-x')?.value ?? '25', 10);
        const sigY = parseInt(getElement<HTMLInputElement>('sig-y')?.value ?? '700', 10);
        const sigWidth = parseInt(getElement<HTMLInputElement>('sig-width')?.value ?? '150', 10);
        const sigHeight = parseInt(getElement<HTMLInputElement>('sig-height')?.value ?? '70', 10);

        const sigPageSelect = getElement<HTMLSelectElement>('sig-page');
        let sigPage: number | string = 0;
        let numPages = 1;

        try {
            const pdfDoc = await getPDFDocument({ data: state.pdfBytes.slice() }).promise;
            numPages = pdfDoc.numPages;
        } catch (error) {
            console.error('Error getting PDF page count:', error);
        }

        if (sigPageSelect) {
            if (sigPageSelect.value === 'last') {
                sigPage = (numPages - 1).toString();
            } else if (sigPageSelect.value === 'all') {
                if (numPages === 1) {
                    sigPage = '0';
                } else {
                    sigPage = `0-${numPages - 1}`;
                }
            } else if (sigPageSelect.value === 'custom') {
                sigPage = parseInt(getElement<HTMLInputElement>('sig-custom-page')?.value ?? '1', 10) - 1;
            } else {
                sigPage = parseInt(sigPageSelect.value, 10);
            }
        }

        const enableSigText = getElement<HTMLInputElement>('enable-sig-text');
        let sigText = enableSigText?.checked ? getElement<HTMLInputElement>('sig-text')?.value : undefined;
        const sigTextColor = getElement<HTMLInputElement>('sig-text-color')?.value ?? '#000000';
        const sigTextSize = parseInt(getElement<HTMLInputElement>('sig-text-size')?.value ?? '12', 10);

        if (!state.sigImageData && !sigText && state.certData) {
            const certInfo = getCertificateInfo(state.certData.certificate);
            const date = new Date().toLocaleDateString();
            sigText = `Digitally signed by ${certInfo.subject}\n${date}`;
        }

        let finalHeight = sigHeight;
        if (sigText && !state.sigImageData) {
            const lineCount = (sigText.match(/\n/g) || []).length + 1;
            const lineHeightFactor = 1.4;
            const padding = 16;
            const calculatedHeight = Math.ceil(lineCount * sigTextSize * lineHeightFactor + padding);
            finalHeight = Math.max(calculatedHeight, sigHeight);
        }

        visibleSignature = {
            enabled: true,
            x: sigX,
            y: sigY,
            width: sigWidth,
            height: finalHeight,
            page: sigPage,
            imageData: state.sigImageData ?? undefined,
            imageType: state.sigImageType ?? undefined,
            text: sigText,
            textColor: sigTextColor,
            textSize: sigTextSize,
        };
    }

    showLoader('Applying digital signature...');

    try {
        const signedPdfBytes = await signPdf(state.pdfBytes, state.certData, {
            signatureInfo,
            visibleSignature,
        });

        const blob = new Blob([signedPdfBytes.slice().buffer], { type: 'application/pdf' });
        const originalName = state.pdfFile?.name ?? 'document.pdf';
        const signedName = originalName.replace(/\.pdf$/i, '_signed.pdf');

        downloadFile(blob, signedName);

        hideLoader();
        showAlert('Success', 'PDF signed successfully! The signature can be verified in any PDF reader.', 'success', () => { resetState(); });
    } catch (error) {
        hideLoader();
        console.error('Signing error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

        // Check if this is a CORS/network error from certificate chain fetching
        if (errorMessage.includes('Failed to fetch') || errorMessage.includes('CORS') || errorMessage.includes('NetworkError')) {
            showAlert(
                'Signing Failed',
                'Failed to fetch certificate chain. This may be due to network issues or the certificate proxy being unavailable. Please check your internet connection and try again. If the issue persists, contact support.'
            );
        } else {
            showAlert('Signing Failed', `Failed to sign PDF: ${errorMessage}`);
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
} else {
    initializePage();
}
