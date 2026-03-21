import { showAlert } from '../ui.js';
import { formatBytes, getStandardPageName, convertPoints } from '../utils/helpers.js';
import { PDFDocument } from 'pdf-lib';
import { icons, createIcons } from 'lucide';
import { PageDimensionsState } from '@/types';

const pageState: PageDimensionsState = {
    file: null,
    pdfDoc: null,
};

let analyzedPagesData: any[] = [];

function calculateAspectRatio(width: number, height: number): string {
    const ratio = width / height;
    return ratio.toFixed(3);
}

function calculateArea(width: number, height: number, unit: string): string {
    const areaInPoints = width * height;
    let convertedArea = 0;
    let unitSuffix = '';

    switch (unit) {
        case 'in':
            convertedArea = areaInPoints / (72 * 72);
            unitSuffix = 'in²';
            break;
        case 'mm':
            convertedArea = areaInPoints / (72 * 72) * (25.4 * 25.4);
            unitSuffix = 'mm²';
            break;
        case 'px':
            const pxPerPoint = 96 / 72;
            convertedArea = areaInPoints * (pxPerPoint * pxPerPoint);
            unitSuffix = 'px²';
            break;
        default:
            convertedArea = areaInPoints;
            unitSuffix = 'pt²';
            break;
    }

    return `${convertedArea.toFixed(2)} ${unitSuffix}`;
}

function getSummaryStats() {
    const totalPages = analyzedPagesData.length;

    const uniqueSizes = new Map();
    analyzedPagesData.forEach((pageData: any) => {
        const key = `${pageData.width.toFixed(2)}x${pageData.height.toFixed(2)}`;
        const label = `${pageData.standardSize} (${pageData.orientation})`;
        uniqueSizes.set(key, {
            count: (uniqueSizes.get(key)?.count || 0) + 1,
            label: label,
            width: pageData.width,
            height: pageData.height
        });
    });

    const hasMixedSizes = uniqueSizes.size > 1;

    return {
        totalPages,
        uniqueSizesCount: uniqueSizes.size,
        uniqueSizes: Array.from(uniqueSizes.values()),
        hasMixedSizes
    };
}

function renderSummary() {
    const summaryContainer = document.getElementById('dimensions-summary');
    if (!summaryContainer) return;

    const stats = getSummaryStats();

    let summaryHTML = `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div class="bg-gray-900 border border-gray-700 rounded-lg p-4">
        <p class="text-sm text-gray-400 mb-1">Total Pages</p>
        <p class="text-2xl font-bold text-white">${stats.totalPages}</p>
      </div>
      <div class="bg-gray-900 border border-gray-700 rounded-lg p-4">
        <p class="text-sm text-gray-400 mb-1">Unique Page Sizes</p>
        <p class="text-2xl font-bold text-white">${stats.uniqueSizesCount}</p>
      </div>
      <div class="bg-gray-900 border border-gray-700 rounded-lg p-4">
        <p class="text-sm text-gray-400 mb-1">Document Type</p>
        <p class="text-2xl font-bold ${stats.hasMixedSizes ? 'text-yellow-400' : 'text-green-400'}">
          ${stats.hasMixedSizes ? 'Mixed Sizes' : 'Uniform'}
        </p>
      </div>
    </div>
  `;

    if (stats.hasMixedSizes) {
        summaryHTML += `
      <div class="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
        <div class="flex items-start gap-3">
          <i data-lucide="alert-triangle" class="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0"></i>
          <div>
            <h4 class="text-yellow-200 font-semibold mb-2">Mixed Page Sizes Detected</h4>
            <p class="text-sm text-gray-300 mb-3">This document contains pages with different dimensions:</p>
            <ul class="space-y-1 text-sm text-gray-300">
              ${stats.uniqueSizes.map((size: any) => `
                <li>• ${size.label}: ${size.count} page${size.count > 1 ? 's' : ''}</li>
              `).join('')}
            </ul>
          </div>
        </div>
      </div>
    `;
    }

    summaryContainer.innerHTML = summaryHTML;

    if (stats.hasMixedSizes) {
        createIcons({ icons });
    }
}

function renderTable(unit: string) {
    const tableBody = document.getElementById('dimensions-table-body');
    if (!tableBody) return;

    tableBody.textContent = '';

    analyzedPagesData.forEach((pageData) => {
        const width = convertPoints(pageData.width, unit);
        const height = convertPoints(pageData.height, unit);
        const aspectRatio = calculateAspectRatio(pageData.width, pageData.height);
        const area = calculateArea(pageData.width, pageData.height, unit);

        const row = document.createElement('tr');

        const pageNumCell = document.createElement('td');
        pageNumCell.className = 'px-4 py-3 text-white';
        pageNumCell.textContent = pageData.pageNum;

        const dimensionsCell = document.createElement('td');
        dimensionsCell.className = 'px-4 py-3 text-gray-300';
        dimensionsCell.textContent = `${width} x ${height} ${unit}`;

        const sizeCell = document.createElement('td');
        sizeCell.className = 'px-4 py-3 text-gray-300';
        sizeCell.textContent = pageData.standardSize;

        const orientationCell = document.createElement('td');
        orientationCell.className = 'px-4 py-3 text-gray-300';
        orientationCell.textContent = pageData.orientation;

        const aspectRatioCell = document.createElement('td');
        aspectRatioCell.className = 'px-4 py-3 text-gray-300';
        aspectRatioCell.textContent = aspectRatio;

        const areaCell = document.createElement('td');
        areaCell.className = 'px-4 py-3 text-gray-300';
        areaCell.textContent = area;

        const rotationCell = document.createElement('td');
        rotationCell.className = 'px-4 py-3 text-gray-300';
        rotationCell.textContent = `${pageData.rotation}°`;

        row.append(pageNumCell, dimensionsCell, sizeCell, orientationCell, aspectRatioCell, areaCell, rotationCell);
        tableBody.appendChild(row);
    });
}

function exportToCSV() {
    const unitsSelect = document.getElementById('units-select') as HTMLSelectElement;
    const unit = unitsSelect?.value || 'pt';

    const headers = ['Page #', `Width (${unit})`, `Height (${unit})`, 'Standard Size', 'Orientation', 'Aspect Ratio', `Area (${unit}²)`, 'Rotation'];
    const csvRows = [headers.join(',')];

    analyzedPagesData.forEach((pageData: any) => {
        const width = convertPoints(pageData.width, unit);
        const height = convertPoints(pageData.height, unit);
        const aspectRatio = calculateAspectRatio(pageData.width, pageData.height);
        const area = calculateArea(pageData.width, pageData.height, unit);

        const row = [
            pageData.pageNum,
            width,
            height,
            pageData.standardSize,
            pageData.orientation,
            aspectRatio,
            area,
            `${pageData.rotation}°`
        ];
        csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'page-dimensions.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function analyzeAndDisplayDimensions() {
    if (!pageState.pdfDoc) return;

    analyzedPagesData = [];
    const pages = pageState.pdfDoc.getPages();

    pages.forEach((page: any, index: number) => {
        const { width, height } = page.getSize();
        const rotation = page.getRotation().angle || 0;

        analyzedPagesData.push({
            pageNum: index + 1,
            width,
            height,
            orientation: width > height ? 'Landscape' : 'Portrait',
            standardSize: getStandardPageName(width, height),
            rotation: rotation
        });
    });

    const resultsContainer = document.getElementById('dimensions-results');
    const unitsSelect = document.getElementById('units-select') as HTMLSelectElement;

    renderSummary();
    renderTable(unitsSelect.value);

    if (resultsContainer) resultsContainer.classList.remove('hidden');

    unitsSelect.addEventListener('change', (e) => {
        renderTable((e.target as HTMLSelectElement).value);
    });

    const exportButton = document.getElementById('export-csv-btn');
    if (exportButton) {
        exportButton.addEventListener('click', exportToCSV);
    }

    createIcons({ icons });
}

function resetState() {
    pageState.file = null;
    pageState.pdfDoc = null;
    analyzedPagesData = [];

    const fileDisplayArea = document.getElementById('file-display-area');
    if (fileDisplayArea) fileDisplayArea.innerHTML = '';

    const resultsContainer = document.getElementById('dimensions-results');
    if (resultsContainer) resultsContainer.classList.add('hidden');

    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
}

async function updateUI() {
    const fileDisplayArea = document.getElementById('file-display-area');

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
    }
}

async function handleFileSelect(files: FileList | null) {
    if (files && files.length > 0) {
        const file = files[0];
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
            pageState.file = file;

            try {
                const arrayBuffer = await file.arrayBuffer();
                pageState.pdfDoc = await PDFDocument.load(arrayBuffer);
                updateUI();
                analyzeAndDisplayDimensions();
            } catch (e) {
                console.error('Error loading PDF:', e);
                showAlert('Error', 'Failed to load PDF file.');
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    const dropZone = document.getElementById('drop-zone');
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
            handleFileSelect(e.dataTransfer?.files);
        });

        fileInput.addEventListener('click', function () {
            fileInput.value = '';
        });
    }
});
