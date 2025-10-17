import { state } from '../state.js';
import { getStandardPageName, convertPoints } from '../utils/helpers.js';

let analyzedPagesData: any = []; // Store raw data to avoid re-analyzing

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

    const row = document.createElement('tr');

    // Create and append each cell safely using textContent
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

    row.append(pageNumCell, dimensionsCell, sizeCell, orientationCell);
    tableBody.appendChild(row);
  });
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
    analyzedPagesData.push({
      pageNum: index + 1,
      width, // Store raw width in points
      height, // Store raw height in points
      orientation: width > height ? 'Landscape' : 'Portrait',
      standardSize: getStandardPageName(width, height),
    });
  });

  const resultsContainer = document.getElementById('dimensions-results');
  const unitsSelect = document.getElementById('units-select');

  // Initial render with default unit (points)
  // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
  renderTable(unitsSelect.value);

  // Show the results table
  resultsContainer.classList.remove('hidden');

  // Add event listener to handle unit changes
  unitsSelect.addEventListener('change', (e) => {
    // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'EventTarg... Remove this comment to see the full error message
    renderTable(e.target.value);
  });
}
