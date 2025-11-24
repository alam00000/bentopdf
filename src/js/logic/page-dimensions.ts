import { state } from '../state.js';
import { getStandardPageName, convertPoints } from '../utils/helpers.js';
import { icons, createIcons } from 'lucide';

let analyzedPagesData: any = []; // Store raw data to avoid re-analyzing

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
      convertedArea = areaInPoints / (72 * 72); // 72 points per inch
      unitSuffix = 'in²';
      break;
    case 'mm':
      convertedArea = areaInPoints / (72 * 72) * (25.4 * 25.4); // Convert to mm²
      unitSuffix = 'mm²';
      break;
    case 'px':
      const pxPerPoint = 96 / 72;
      convertedArea = areaInPoints * (pxPerPoint * pxPerPoint);
      unitSuffix = 'px²';
      break;
    default: // 'pt'
      convertedArea = areaInPoints;
      unitSuffix = 'pt²';
      break;
  }

  return `${convertedArea.toFixed(2)} ${unitSuffix}`;
}


function getSummaryStats() {
  const totalPages = analyzedPagesData.length;

  // Count unique page sizes
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

/**
 * Renders the dimensions table based on the stored data and selected unit.
 * @param {string} unit The unit to display dimensions in ('pt', 'in', 'mm', 'px').
 */
function renderTable(unit: any) {
  const tableBody = document.getElementById('dimensions-table-body');
  if (!tableBody) return;

  tableBody.textContent = ''; // Clear the table body safely

  analyzedPagesData.forEach((pageData) => {
    const width = convertPoints(pageData.width, unit);
    const height = convertPoints(pageData.height, unit);
    const aspectRatio = calculateAspectRatio(pageData.width, pageData.height);
    const area = calculateArea(pageData.width, pageData.height, unit);

    const row = document.createElement('tr');

    // Page number
    const pageNumCell = document.createElement('td');
    pageNumCell.className = 'px-4 py-3 text-white';
    pageNumCell.textContent = pageData.pageNum;

    // Dimensions
    const dimensionsCell = document.createElement('td');
    dimensionsCell.className = 'px-4 py-3 text-gray-300';
    dimensionsCell.textContent = `${width} x ${height} ${unit}`;

    // Standard size
    const sizeCell = document.createElement('td');
    sizeCell.className = 'px-4 py-3 text-gray-300';
    sizeCell.textContent = pageData.standardSize;

    // Orientation
    const orientationCell = document.createElement('td');
    orientationCell.className = 'px-4 py-3 text-gray-300';
    orientationCell.textContent = pageData.orientation;

    // Aspect Ratio
    const aspectRatioCell = document.createElement('td');
    aspectRatioCell.className = 'px-4 py-3 text-gray-300';
    aspectRatioCell.textContent = aspectRatio;

    // Area
    const areaCell = document.createElement('td');
    areaCell.className = 'px-4 py-3 text-gray-300';
    areaCell.textContent = area;

    // Rotation
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

/**
 * Main function to analyze the PDF and display dimensions.
 * This is called once after the file is loaded.
 */
export function analyzeAndDisplayDimensions() {
  if (!state.pdfDoc) return;

  analyzedPagesData = []; // Reset stored data
  const pages = state.pdfDoc.getPages();

  pages.forEach((page: any, index: any) => {
    const { width, height } = page.getSize();
    const rotation = page.getRotation().angle || 0;

    analyzedPagesData.push({
      pageNum: index + 1,
      width, // Store raw width in points
      height, // Store raw height in points
      orientation: width > height ? 'Landscape' : 'Portrait',
      standardSize: getStandardPageName(width, height),
      rotation: rotation
    });
  });

  const resultsContainer = document.getElementById('dimensions-results');
  const unitsSelect = document.getElementById('units-select');

  renderSummary();

  // Initial render with default unit (points)
  // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
  renderTable(unitsSelect.value);

  resultsContainer.classList.remove('hidden');

  unitsSelect.addEventListener('change', (e) => {
    // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'EventTarg... Remove this comment to see the full error message
    renderTable(e.target.value);
  });

  const exportButton = document.getElementById('export-csv-btn');
  if (exportButton) {
    exportButton.addEventListener('click', exportToCSV);
  }
}
