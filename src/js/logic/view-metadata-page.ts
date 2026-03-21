import { showLoader, hideLoader, showAlert } from '../ui.js';
import { formatBytes, formatIsoDate, getPDFDocument } from '../utils/helpers.js';
import { createIcons, icons } from 'lucide';
import { ViewMetadataState } from '@/types';

const pageState: ViewMetadataState = {
    file: null,
    metadata: {},
};

function resetState() {
    pageState.file = null;
    pageState.metadata = {};

    const fileDisplayArea = document.getElementById('file-display-area');
    if (fileDisplayArea) fileDisplayArea.innerHTML = '';

    const toolOptions = document.getElementById('tool-options');
    if (toolOptions) toolOptions.classList.add('hidden');

    const metadataDisplay = document.getElementById('metadata-display');
    if (metadataDisplay) metadataDisplay.innerHTML = '';

    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
}

function createSection(title: string): { wrapper: HTMLDivElement; ul: HTMLUListElement } {
    const wrapper = document.createElement('div');
    wrapper.className = 'mb-6';
    const h3 = document.createElement('h3');
    h3.className = 'text-lg font-semibold text-white mb-2';
    h3.textContent = title;
    const ul = document.createElement('ul');
    ul.className = 'space-y-3 text-sm bg-gray-900 p-4 rounded-lg border border-gray-700';
    wrapper.append(h3, ul);
    return { wrapper, ul };
}

function createListItem(key: string, value: string): HTMLLIElement {
    const li = document.createElement('li');
    li.className = 'flex flex-col sm:flex-row';
    const strong = document.createElement('strong');
    strong.className = 'w-40 flex-shrink-0 text-gray-400';
    strong.textContent = key;
    const div = document.createElement('div');
    div.className = 'flex-grow text-white break-all';
    div.textContent = value;
    li.append(strong, div);
    return li;
}

function parsePdfDate(pdfDate: string | unknown): string {
    if (!pdfDate || typeof pdfDate !== 'string' || !pdfDate.startsWith('D:')) {
        return String(pdfDate || '');
    }
    try {
        const year = pdfDate.substring(2, 6);
        const month = pdfDate.substring(6, 8);
        const day = pdfDate.substring(8, 10);
        const hour = pdfDate.substring(10, 12);
        const minute = pdfDate.substring(12, 14);
        const second = pdfDate.substring(14, 16);
        return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`).toLocaleString();
    } catch {
        return pdfDate;
    }
}

function createXmpListItem(key: string, value: string, indent: number = 0): HTMLLIElement {
    const li = document.createElement('li');
    li.className = 'flex flex-col sm:flex-row';

    const strong = document.createElement('strong');
    strong.className = 'w-56 flex-shrink-0 text-gray-400';
    strong.textContent = key;
    strong.style.paddingLeft = `${indent * 1.2}rem`;

    const div = document.createElement('div');
    div.className = 'flex-grow text-white break-all';
    div.textContent = value;

    li.append(strong, div);
    return li;
}

function createXmpHeaderItem(key: string, indent: number = 0): HTMLLIElement {
    const li = document.createElement('li');
    li.className = 'flex pt-2';
    const strong = document.createElement('strong');
    strong.className = 'w-full flex-shrink-0 text-gray-300 font-medium';
    strong.textContent = key;
    strong.style.paddingLeft = `${indent * 1.2}rem`;
    li.append(strong);
    return li;
}

function appendXmpNodes(xmlNode: Element, ulElement: HTMLUListElement, indentLevel: number) {
    const xmpDateKeys = ['xap:CreateDate', 'xap:ModifyDate', 'xap:MetadataDate'];

    const childNodes = Array.from(xmlNode.children);

    for (const child of childNodes) {
        if (child.nodeType !== 1) continue;

        let key = child.tagName;
        const elementChildren = Array.from(child.children).filter(function (c) {
            return c.nodeType === 1;
        });

        if (key === 'rdf:li') {
            appendXmpNodes(child, ulElement, indentLevel);
            continue;
        }
        if (key === 'rdf:Alt') {
            key = '(alt container)';
        }

        if (child.getAttribute('rdf:parseType') === 'Resource' && elementChildren.length === 0) {
            ulElement.appendChild(createXmpListItem(key, '(Empty Resource)', indentLevel));
            continue;
        }

        if (elementChildren.length > 0) {
            ulElement.appendChild(createXmpHeaderItem(key, indentLevel));
            appendXmpNodes(child, ulElement, indentLevel + 1);
        } else {
            let value = (child.textContent || '').trim();
            if (value) {
                if (xmpDateKeys.includes(key)) {
                    value = formatIsoDate(value);
                }
                ulElement.appendChild(createXmpListItem(key, value, indentLevel));
            }
        }
    }
}

async function displayMetadata() {
    const metadataDisplay = document.getElementById('metadata-display');
    if (!metadataDisplay || !pageState.file) return;

    metadataDisplay.innerHTML = '';
    pageState.metadata = {};

    showLoader('Analyzing full PDF metadata...');

    try {
        const pdfBytes = await pageState.file.arrayBuffer();
        const pdfjsDoc = await getPDFDocument({ data: pdfBytes }).promise;

        const [metadataResult, fieldObjects] = await Promise.all([
            pdfjsDoc.getMetadata(),
            pdfjsDoc.getFieldObjects(),
        ]);

        const { info, metadata } = metadataResult;
        const rawXmpString = metadata ? metadata.getRaw() : null;

        // Info Dictionary Section
        const infoSection = createSection('Info Dictionary');
        if (info && Object.keys(info).length > 0) {
            for (const key in info) {
                const value = (info as Record<string, unknown>)[key];
                let displayValue: string;

                if (value === null || typeof value === 'undefined') {
                    displayValue = '- Not Set -';
                } else if (typeof value === 'object' && value !== null && 'name' in value) {
                    displayValue = String((value as { name: string }).name);
                } else if (typeof value === 'object') {
                    try {
                        displayValue = JSON.stringify(value);
                    } catch {
                        displayValue = '[object Object]';
                    }
                } else if ((key === 'CreationDate' || key === 'ModDate') && typeof value === 'string') {
                    displayValue = parsePdfDate(value);
                } else {
                    displayValue = String(value);
                }

                pageState.metadata[key] = displayValue;
                infoSection.ul.appendChild(createListItem(key, displayValue));
            }
        } else {
            infoSection.ul.innerHTML = `<li><span class="text-gray-500 italic">- No Info Dictionary data found -</span></li>`;
        }
        metadataDisplay.appendChild(infoSection.wrapper);

        // Interactive Form Fields Section
        const fieldsSection = createSection('Interactive Form Fields');
        if (fieldObjects && Object.keys(fieldObjects).length > 0) {
            for (const fieldName in fieldObjects) {
                const field = (fieldObjects as Record<string, Array<{ fieldValue?: unknown }>>)[fieldName][0];
                const value = field.fieldValue || '- Not Set -';
                fieldsSection.ul.appendChild(createListItem(fieldName, String(value)));
            }
        } else {
            fieldsSection.ul.innerHTML = `<li><span class="text-gray-500 italic">- No interactive form fields found -</span></li>`;
        }
        metadataDisplay.appendChild(fieldsSection.wrapper);

        // XMP Metadata Section
        const xmpSection = createSection('XMP Metadata');
        if (rawXmpString) {
            try {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(rawXmpString, 'application/xml');

                const descriptions = xmlDoc.getElementsByTagName('rdf:Description');
                if (descriptions.length > 0) {
                    for (let i = 0; i < descriptions.length; i++) {
                        appendXmpNodes(descriptions[i], xmpSection.ul, 0);
                    }
                } else {
                    appendXmpNodes(xmlDoc.documentElement, xmpSection.ul, 0);
                }

                if (xmpSection.ul.children.length === 0) {
                    xmpSection.ul.innerHTML = `<li><span class="text-gray-500 italic">- No parseable XMP properties found -</span></li>`;
                }
            } catch (xmlError) {
                console.error('Failed to parse XMP XML:', xmlError);
                xmpSection.ul.innerHTML = `<li><span class="text-red-500 italic">- Error parsing XMP XML. Displaying raw. -</span></li>`;
                const pre = document.createElement('pre');
                pre.className = 'text-xs text-gray-300 whitespace-pre-wrap break-all';
                pre.textContent = rawXmpString;
                xmpSection.ul.appendChild(pre);
            }
        } else {
            xmpSection.ul.innerHTML = `<li><span class="text-gray-500 italic">- No XMP metadata found -</span></li>`;
        }
        metadataDisplay.appendChild(xmpSection.wrapper);

        createIcons({ icons });
    } catch (e) {
        console.error('Failed to view metadata or fields:', e);
        showAlert('Error', 'Could not fully analyze the PDF. It may be corrupted or have an unusual structure.');
    } finally {
        hideLoader();
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
        metaSpan.textContent = `${formatBytes(pageState.file.size)}`;

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

        await displayMetadata();

        if (toolOptions) toolOptions.classList.remove('hidden');
    } else {
        if (toolOptions) toolOptions.classList.add('hidden');
    }
}

function copyMetadataAsJson() {
    const jsonString = JSON.stringify(pageState.metadata, null, 2);
    navigator.clipboard.writeText(jsonString).then(function () {
        showAlert('Copied', 'Metadata copied to clipboard as JSON.');
    }).catch(function (err) {
        console.error('Failed to copy:', err);
        showAlert('Error', 'Failed to copy metadata to clipboard.');
    });
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
    const copyBtn = document.getElementById('copy-metadata');
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

    if (copyBtn) {
        copyBtn.addEventListener('click', copyMetadataAsJson);
    }
});
