import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, formatBytes } from '../utils/helpers.js';
import { createIcons, icons } from 'lucide';
import JSZip from 'jszip';
import { PyMuPDF } from '@bentopdf/pymupdf-wasm';
import { getWasmBaseUrl } from '../config/wasm-cdn-config.js';

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

function tableToCsv(rows: (string | null)[][]): string {
    return rows.map(row =>
        row.map(cell => {
            const cellStr = cell ?? '';
            if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
        }).join(',')
    ).join('\n');
}

async function extract() {
    if (!file) {
        showAlert('No File', 'Please upload a PDF file first.');
        return;
    }

    const formatRadios = document.querySelectorAll('input[name="export-format"]');
    let format = 'csv';
    formatRadios.forEach((radio: Element) => {
        if ((radio as HTMLInputElement).checked) {
            format = (radio as HTMLInputElement).value;
        }
    });

    showLoader('Loading Engine...');

    try {
        await pymupdf.load();
        showLoader('Extracting tables...');

        const doc = await pymupdf.open(file);
        const pageCount = doc.pageCount;
        const baseName = file.name.replace(/\.[^/.]+$/, '');

        interface TableData {
            page: number;
            tableIndex: number;
            rows: (string | null)[][];
            markdown: string;
            rowCount: number;
            colCount: number;
        }

        const allTables: TableData[] = [];

        for (let i = 0; i < pageCount; i++) {
            showLoader(`Scanning page ${i + 1} of ${pageCount}...`);
            const page = doc.getPage(i);
            const tables = page.findTables();

            tables.forEach((table, tableIdx) => {
                allTables.push({
                    page: i + 1,
                    tableIndex: tableIdx + 1,
                    rows: table.rows,
                    markdown: table.markdown,
                    rowCount: table.rowCount,
                    colCount: table.colCount
                });
            });
        }

        if (allTables.length === 0) {
            showAlert('No Tables Found', 'No tables were detected in this PDF.');
            return;
        }

        if (allTables.length === 1) {
            const table = allTables[0];
            let content: string;
            let ext: string;
            let mimeType: string;

            if (format === 'csv') {
                content = tableToCsv(table.rows);
                ext = 'csv';
                mimeType = 'text/csv';
            } else if (format === 'json') {
                content = JSON.stringify(table.rows, null, 2);
                ext = 'json';
                mimeType = 'application/json';
            } else {
                content = table.markdown;
                ext = 'md';
                mimeType = 'text/markdown';
            }

            const blob = new Blob([content], { type: mimeType });
            downloadFile(blob, `${baseName}_table.${ext}`);
            showAlert('Success', `Extracted 1 table successfully!`, 'success', resetState);
        } else {
            showLoader('Creating ZIP file...');
            const zip = new JSZip();

            allTables.forEach((table, idx) => {
                const filename = `table_${idx + 1}_page${table.page}`;
                let content: string;
                let ext: string;

                if (format === 'csv') {
                    content = tableToCsv(table.rows);
                    ext = 'csv';
                } else if (format === 'json') {
                    content = JSON.stringify(table.rows, null, 2);
                    ext = 'json';
                } else {
                    content = table.markdown;
                    ext = 'md';
                }

                zip.file(`${filename}.${ext}`, content);
            });

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            downloadFile(zipBlob, `${baseName}_tables.zip`);
            showAlert('Success', `Extracted ${allTables.length} tables successfully!`, 'success', resetState);
        }
    } catch (e) {
        console.error(e);
        const message = e instanceof Error ? e.message : 'Unknown error';
        showAlert('Error', `Failed to extract tables. ${message}`);
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
        processBtn.addEventListener('click', extract);
    }
});
