import { createIcons, icons } from 'lucide';
import { showAlert, showLoader, hideLoader } from '../ui.js';
import { readFileAsArrayBuffer, formatBytes } from '../utils/helpers.js';
import { validatePdfSignatures } from './validate-signature-pdf.js';
import forge from 'node-forge';
import { SignatureValidationResult, ValidateSignatureState } from '@/types';

const state: ValidateSignatureState = {
    pdfFile: null,
    pdfBytes: null,
    results: [],
    trustedCertFile: null,
    trustedCert: null,
};

function getElement<T extends HTMLElement>(id: string): T | null {
    return document.getElementById(id) as T | null;
}

function resetState(): void {
    state.pdfFile = null;
    state.pdfBytes = null;
    state.results = [];

    const fileDisplayArea = getElement<HTMLDivElement>('file-display-area');
    if (fileDisplayArea) fileDisplayArea.innerHTML = '';

    const resultsSection = getElement<HTMLDivElement>('results-section');
    if (resultsSection) resultsSection.classList.add('hidden');

    const resultsContainer = getElement<HTMLDivElement>('results-container');
    if (resultsContainer) resultsContainer.innerHTML = '';

    const fileInput = getElement<HTMLInputElement>('file-input');
    if (fileInput) fileInput.value = '';

    const customCertSection = getElement<HTMLDivElement>('custom-cert-section');
    if (customCertSection) customCertSection.classList.add('hidden');
}

function resetCertState(): void {
    state.trustedCertFile = null;
    state.trustedCert = null;

    const certDisplayArea = getElement<HTMLDivElement>('cert-display-area');
    if (certDisplayArea) certDisplayArea.innerHTML = '';

    const certInput = getElement<HTMLInputElement>('cert-input');
    if (certInput) certInput.value = '';
}

function initializePage(): void {
    createIcons({ icons });

    const fileInput = getElement<HTMLInputElement>('file-input');
    const dropZone = getElement<HTMLDivElement>('drop-zone');
    const backBtn = getElement<HTMLButtonElement>('back-to-tools');
    const certInput = getElement<HTMLInputElement>('cert-input');
    const certDropZone = getElement<HTMLDivElement>('cert-drop-zone');

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

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = import.meta.env.BASE_URL;
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

    resetState();
    state.pdfFile = file;
    state.pdfBytes = new Uint8Array(await readFileAsArrayBuffer(file) as ArrayBuffer);

    updatePdfDisplay();

    const customCertSection = getElement<HTMLDivElement>('custom-cert-section');
    if (customCertSection) customCertSection.classList.remove('hidden');
    createIcons({ icons });

    await validateSignatures();
}

function updatePdfDisplay(): void {
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
    metaSpan.textContent = formatBytes(state.pdfFile.size);

    infoContainer.append(nameSpan, metaSpan);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'ml-4 text-red-400 hover:text-red-300 flex-shrink-0';
    removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
    removeBtn.onclick = () => resetState();

    fileDiv.append(infoContainer, removeBtn);
    fileDisplayArea.appendChild(fileDiv);
    createIcons({ icons });
}

function handleCertUpload(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
        handleCertFile(input.files[0]);
    }
}

async function handleCertFile(file: File): Promise<void> {
    const validExtensions = ['.pem', '.crt', '.cer', '.der'];
    const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!hasValidExtension) {
        showAlert('Invalid Certificate', 'Please select a .pem, .crt, .cer, or .der certificate file.');
        return;
    }

    resetCertState();
    state.trustedCertFile = file;

    try {
        const content = await file.text();

        if (content.includes('-----BEGIN CERTIFICATE-----')) {
            state.trustedCert = forge.pki.certificateFromPem(content);
        } else {
            const bytes = new Uint8Array(await readFileAsArrayBuffer(file) as ArrayBuffer);
            const derString = String.fromCharCode.apply(null, Array.from(bytes));
            const asn1 = forge.asn1.fromDer(derString);
            state.trustedCert = forge.pki.certificateFromAsn1(asn1);
        }

        updateCertDisplay();

        if (state.pdfBytes) {
            await validateSignatures();
        }
    } catch (error) {
        console.error('Error parsing certificate:', error);
        showAlert('Invalid Certificate', 'Failed to parse the certificate file.');
        resetCertState();
    }
}

function updateCertDisplay(): void {
    const certDisplayArea = getElement<HTMLDivElement>('cert-display-area');
    if (!certDisplayArea || !state.trustedCertFile || !state.trustedCert) return;

    certDisplayArea.innerHTML = '';

    const certDiv = document.createElement('div');
    certDiv.className = 'flex items-center justify-between bg-gray-700 p-3 rounded-lg';

    const infoContainer = document.createElement('div');
    infoContainer.className = 'flex flex-col flex-1 min-w-0';

    const nameSpan = document.createElement('div');
    nameSpan.className = 'truncate font-medium text-gray-200 text-sm mb-1';

    const cn = state.trustedCert.subject.getField('CN');
    nameSpan.textContent = cn?.value as string || state.trustedCertFile.name;

    const metaSpan = document.createElement('div');
    metaSpan.className = 'text-xs text-green-400';
    metaSpan.innerHTML = '<i data-lucide="check-circle" class="inline w-3 h-3 mr-1"></i>Trusted certificate loaded';

    infoContainer.append(nameSpan, metaSpan);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'ml-4 text-red-400 hover:text-red-300 flex-shrink-0';
    removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
    removeBtn.onclick = async () => {
        resetCertState();
        if (state.pdfBytes) {
            await validateSignatures();
        }
    };

    certDiv.append(infoContainer, removeBtn);
    certDisplayArea.appendChild(certDiv);
    createIcons({ icons });
}

async function validateSignatures(): Promise<void> {
    if (!state.pdfBytes) return;

    showLoader('Analyzing signatures...');

    try {
        state.results = await validatePdfSignatures(state.pdfBytes, state.trustedCert ?? undefined);
        displayResults();
    } catch (error) {
        console.error('Validation error:', error);
        showAlert('Error', 'Failed to validate signatures. The file may be corrupted.');
    } finally {
        hideLoader();
    }
}

function displayResults(): void {
    const resultsSection = getElement<HTMLDivElement>('results-section');
    const resultsContainer = getElement<HTMLDivElement>('results-container');

    if (!resultsSection || !resultsContainer) return;

    resultsContainer.innerHTML = '';
    resultsSection.classList.remove('hidden');

    if (state.results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="bg-gray-700 rounded-lg p-6 text-center border border-gray-600">
                <i data-lucide="file-x" class="w-12 h-12 mx-auto mb-4 text-gray-400"></i>
                <h3 class="text-lg font-semibold text-white mb-2">No Signatures Found</h3>
                <p class="text-gray-400">This PDF does not contain any digital signatures.</p>
            </div>
        `;
        createIcons({ icons });
        return;
    }

    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'mb-4 p-3 bg-gray-700 rounded-lg border border-gray-600';

    const validCount = state.results.filter(r => r.isValid && !r.isExpired).length;
    const trustVerified = state.trustedCert ? state.results.filter(r => r.isTrusted).length : 0;

    let summaryHtml = `
        <p class="text-gray-300">
            <span class="font-semibold text-white">${state.results.length}</span> 
            signature${state.results.length > 1 ? 's' : ''} found
            <span class="text-gray-500">•</span>
            <span class="${validCount === state.results.length ? 'text-green-400' : 'text-yellow-400'}">${validCount} valid</span>
        </p>
    `;

    if (state.trustedCert) {
        summaryHtml += `
            <p class="text-xs text-gray-400 mt-1">
                <i data-lucide="shield-check" class="inline w-3 h-3 mr-1"></i>
                Trust verification: ${trustVerified}/${state.results.length} signatures verified against custom certificate
            </p>
        `;
    }

    summaryDiv.innerHTML = summaryHtml;
    resultsContainer.appendChild(summaryDiv);

    state.results.forEach((result, index) => {
        const card = createSignatureCard(result, index);
        resultsContainer.appendChild(card);
    });

    createIcons({ icons });
}

function createSignatureCard(result: SignatureValidationResult, index: number): HTMLElement {
    const card = document.createElement('div');
    card.className = 'bg-gray-700 rounded-lg p-4 border border-gray-600 mb-4';

    let statusColor = 'text-green-400';
    let statusIcon = 'check-circle';
    let statusText = 'Valid Signature';

    if (!result.isValid) {
        statusColor = 'text-red-400';
        statusIcon = 'x-circle';
        statusText = 'Invalid Signature';
    } else if (result.isExpired) {
        statusColor = 'text-yellow-400';
        statusIcon = 'alert-triangle';
        statusText = 'Certificate Expired';
    } else if (result.isSelfSigned) {
        statusColor = 'text-yellow-400';
        statusIcon = 'alert-triangle';
        statusText = 'Self-Signed Certificate';
    }

    const formatDate = (date: Date) => {
        if (!date || date.getTime() === 0) return 'Unknown';
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    let trustBadge = '';
    if (state.trustedCert) {
        if (result.isTrusted) {
            trustBadge = '<span class="text-xs bg-green-900 text-green-300 px-2 py-1 rounded ml-2"><i data-lucide="shield-check" class="inline w-3 h-3 mr-1"></i>Trusted</span>';
        } else {
            trustBadge = '<span class="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded ml-2"><i data-lucide="shield-x" class="inline w-3 h-3 mr-1"></i>Not in trust chain</span>';
        }
    }

    card.innerHTML = `
        <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
                <i data-lucide="${statusIcon}" class="w-6 h-6 ${statusColor}"></i>
                <div>
                    <h3 class="font-semibold text-white">Signature ${index + 1}</h3>
                    <p class="text-sm ${statusColor}">${statusText}</p>
                </div>
            </div>
            <div class="flex items-center">
                ${result.coverageStatus === 'full'
            ? '<span class="text-xs bg-green-900 text-green-300 px-2 py-1 rounded">Full Coverage</span>'
            : result.coverageStatus === 'partial'
                ? '<span class="text-xs bg-yellow-900 text-yellow-300 px-2 py-1 rounded">Partial Coverage</span>'
                : ''
        }${trustBadge}
            </div>
        </div>

        <div class="space-y-3 text-sm">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p class="text-gray-400">Signed By</p>
                    <p class="text-white font-medium">${escapeHtml(result.signerName)}</p>
                    ${result.signerOrg ? `<p class="text-gray-400 text-xs">${escapeHtml(result.signerOrg)}</p>` : ''}
                    ${result.signerEmail ? `<p class="text-gray-400 text-xs">${escapeHtml(result.signerEmail)}</p>` : ''}
                </div>
                <div>
                    <p class="text-gray-400">Issuer</p>
                    <p class="text-white font-medium">${escapeHtml(result.issuer)}</p>
                    ${result.issuerOrg ? `<p class="text-gray-400 text-xs">${escapeHtml(result.issuerOrg)}</p>` : ''}
                </div>
            </div>

            ${result.signatureDate ? `
                <div>
                    <p class="text-gray-400">Signed On</p>
                    <p class="text-white">${formatDate(result.signatureDate)}</p>
                </div>
            ` : ''}

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p class="text-gray-400">Valid From</p>
                    <p class="text-white">${formatDate(result.validFrom)}</p>
                </div>
                <div>
                    <p class="text-gray-400">Valid Until</p>
                    <p class="${result.isExpired ? 'text-red-400' : 'text-white'}">${formatDate(result.validTo)}</p>
                </div>
            </div>

            ${result.reason ? `
                <div>
                    <p class="text-gray-400">Reason</p>
                    <p class="text-white">${escapeHtml(result.reason)}</p>
                </div>
            ` : ''}

            ${result.location ? `
                <div>
                    <p class="text-gray-400">Location</p>
                    <p class="text-white">${escapeHtml(result.location)}</p>
                </div>
            ` : ''}

            <details class="mt-2">
                <summary class="cursor-pointer text-indigo-400 hover:text-indigo-300 text-sm">
                    Technical Details
                </summary>
                <div class="mt-2 p-3 bg-gray-800 rounded text-xs space-y-1">
                    <p><span class="text-gray-400">Serial Number:</span> <span class="text-gray-300 font-mono">${escapeHtml(result.serialNumber)}</span></p>
                    <p><span class="text-gray-400">Digest Algorithm:</span> <span class="text-gray-300">${escapeHtml(result.algorithms.digest)}</span></p>
                    <p><span class="text-gray-400">Signature Algorithm:</span> <span class="text-gray-300">${escapeHtml(result.algorithms.signature)}</span></p>
                    ${result.errorMessage ? `<p class="text-red-400">Error: ${escapeHtml(result.errorMessage)}</p>` : ''}
                </div>
            </details>
        </div>
    `;

    return card;
}

function escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
} else {
    initializePage();
}
