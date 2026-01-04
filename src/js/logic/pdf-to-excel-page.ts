import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, formatBytes } from '../utils/helpers.js';
import { createIcons, icons } from 'lucide';
import { PyMuPDF } from '@bentopdf/pymupdf-wasm';
import { getWasmBaseUrl } from '../config/wasm-cdn-config.js';
import * as XLSX from 'xlsx';

const pymupdf = new PyMuPDF(getWasmBaseUrl('pymupdf'));
let file: File | null = null;

const updateUI = () => {
    const fileDisplayArea = document.getElementById('file-display-area');
    const optionsPanel = document.getElementById('options-panel');

    if (!fileDisplayArea || !optionsPanel) return;

    fileDisplayArea.innerHTML = '';

    if (file) {
        optionsPanel.classList.remove('hidden');

        const fileDiv = document.createElement('div');
        fileDiv.className = 'flex items-center justify-between bg-gray-700 p-3 rounded-lg text-sm';

        const infoContainer = document.createElement('div');
        infoContainer.className = 'flex flex-col overflow-hidden';

        const nameSpan = document.createElement('div');
        nameSpan.className = 'truncate font-medium text-gray-200 text-sm mb-1';
        nameSpan.textContent = file.name;

        const metaSpan = document.createElement('div');
        metaSpan.className = 'text-xs text-gray-400';
        metaSpan.textContent = formatBytes(file.size);

        infoContainer.append(nameSpan, metaSpan);

        const removeBtn = document.createElement('button');
        removeBtn.className = 'ml-4 text-red-400 hover:text-red-300 flex-shrink-0';
        removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
        removeBtn.onclick = resetState;

        fileDiv.append(infoContainer, removeBtn);
        fileDisplayArea.appendChild(fileDiv);

        createIcons({ icons });
    } else {
        optionsPanel.classList.add('hidden');
    }
};

const resetState = () => {
    file = null;
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    updateUI();
};

async function convert() {
    if (!file) {
        showAlert('No File', 'Please upload a PDF file first.');
        return;
    }

    showLoader('Loading Engine...');

    try {
        await pymupdf.load();
        showLoader('Extracting tables...');

        const doc = await pymupdf.open(file);
        const pageCount = doc.pageCount;
        const baseName = file.name.replace(/\.[^/.]+$/, '');

        interface TableData {
            page: number;
            rows: (string | null)[][];
        }

        const allTables: TableData[] = [];

        for (let i = 0; i < pageCount; i++) {
            showLoader(`Scanning page ${i + 1} of ${pageCount}...`);
            const page = doc.getPage(i);
            const tables = page.findTables();

            tables.forEach((table) => {
                allTables.push({
                    page: i + 1,
                    rows: table.rows
                });
            });
        }

        if (allTables.length === 0) {
            showAlert('No Tables Found', 'No tables were detected in this PDF.');
            return;
        }

        showLoader('Creating Excel file...');

        const workbook = XLSX.utils.book_new();

        if (allTables.length === 1) {
            const worksheet = XLSX.utils.aoa_to_sheet(allTables[0].rows);
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Table');
        } else {
            allTables.forEach((table, idx) => {
                const sheetName = `Table ${idx + 1} (Page ${table.page})`.substring(0, 31);
                const worksheet = XLSX.utils.aoa_to_sheet(table.rows);
                XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
            });
        }

        const xlsxData = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([xlsxData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        downloadFile(blob, `${baseName}.xlsx`);
        showAlert('Success', `Extracted ${allTables.length} table(s) to Excel!`, 'success', resetState);
    } catch (e) {
        console.error(e);
        const message = e instanceof Error ? e.message : 'Unknown error';
        showAlert('Error', `Failed to convert PDF to Excel. ${message}`);
    } finally {
        hideLoader();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    const dropZone = document.getElementById('drop-zone');
    const processBtn = document.getElementById('process-btn');
    const backBtn = document.getElementById('back-to-tools');

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = import.meta.env.BASE_URL;
        });
    }

    const handleFileSelect = (newFiles: FileList | null) => {
        if (!newFiles || newFiles.length === 0) return;
        const validFile = Array.from(newFiles).find(f => f.type === 'application/pdf');

        if (!validFile) {
            showAlert('Invalid File', 'Please upload a PDF file.');
            return;
        }

        file = validFile;
        updateUI();
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

    if (processBtn) {
        processBtn.addEventListener('click', convert);
    }
});
