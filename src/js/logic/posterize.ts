import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, parsePageRanges } from '../utils/helpers.js';
import { state } from '../state.js';
import { PDFDocument, rgb, PageSizes } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

let pdfJsDoc = null;
let pageSnapshot = null;

async function renderPosterizePreview() {
    if (!pdfJsDoc) return;
    showLoader('Rendering preview...');

    const canvas = document.getElementById('posterize-preview-canvas') as HTMLCanvasElement;
    const context = canvas.getContext('2d');

    const page = await pdfJsDoc.getPage(1); // Always preview the first page
    const viewport = page.getViewport({ scale: 1.5 });

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport }).promise;

    pageSnapshot = context.getImageData(0, 0, canvas.width, canvas.height);

    drawGridOverlay();
    hideLoader();
}

function drawGridOverlay() {
    if (!pageSnapshot) return;

    const canvas = document.getElementById('posterize-preview-canvas') as HTMLCanvasElement;
    const context = canvas.getContext('2d');
    const rows = parseInt((document.getElementById('posterize-rows') as HTMLInputElement).value) || 1;
    const cols = parseInt((document.getElementById('posterize-cols') as HTMLInputElement).value) || 1;

    context.putImageData(pageSnapshot, 0, 0);

    context.strokeStyle = 'rgba(239, 68, 68, 0.9)'; // Grid line color 
    context.lineWidth = 2;
    context.setLineDash([10, 5]);

    const cellWidth = canvas.width / cols;
    const cellHeight = canvas.height / rows;

    for (let i = 1; i < cols; i++) {
        context.beginPath();
        context.moveTo(i * cellWidth, 0);
        context.lineTo(i * cellWidth, canvas.height);
        context.stroke();
    }

    for (let i = 1; i < rows; i++) {
        context.beginPath();
        context.moveTo(0, i * cellHeight);
        context.lineTo(canvas.width, i * cellHeight);
        context.stroke();
    }

    context.setLineDash([]);
}

export async function setupPosterizeTool() {
    if (state.pdfDoc) {
        document.getElementById('total-pages').textContent = state.pdfDoc.getPageCount().toString();

        const pdfBytes = await state.pdfDoc.save();
        pdfJsDoc = await pdfjsLib.getDocument({ data: pdfBytes }).promise;

        await renderPosterizePreview();

        // Add event listeners to update the grid on change
        document.getElementById('posterize-rows').addEventListener('input', drawGridOverlay);
        document.getElementById('posterize-cols').addEventListener('input', drawGridOverlay);
    }
}

export async function posterize() {
    showLoader('Posterizing PDF...');
    try {
        const rows = parseInt((document.getElementById('posterize-rows') as HTMLInputElement).value) || 1;
        const cols = parseInt((document.getElementById('posterize-cols') as HTMLInputElement).value) || 1;
        const pageSizeKey = (document.getElementById('output-page-size') as HTMLSelectElement).value;
        const orientation = (document.getElementById('output-orientation') as HTMLSelectElement).value;
        const scalingMode = (document.querySelector('input[name="scaling-mode"]:checked') as HTMLInputElement).value;
        const overlap = parseFloat((document.getElementById('overlap') as HTMLInputElement).value) || 0;
        const overlapUnits = (document.getElementById('overlap-units') as HTMLSelectElement).value;
        const pageRangeInput = (document.getElementById('page-range') as HTMLInputElement).value;

        let overlapInPoints = overlap;
        if (overlapUnits === 'in') {
            overlapInPoints = overlap * 72;
        } else if (overlapUnits === 'mm') {
            overlapInPoints = overlap * (72 / 25.4);
        }

        const sourceDoc = state.pdfDoc;
        const newDoc = await PDFDocument.create();
        const totalPages = sourceDoc.getPageCount();
        const pageIndicesToProcess = parsePageRanges(pageRangeInput, totalPages);

        if (pageIndicesToProcess.length === 0) {
            throw new Error("Invalid page range specified. Please check your input (e.g., '1-3, 5').");
        }

        let [targetWidth, targetHeight] = PageSizes[pageSizeKey];
        if (orientation === 'landscape' && targetWidth < targetHeight) {
            [targetWidth, targetHeight] = [targetHeight, targetWidth];
        } else if (orientation === 'portrait' && targetWidth > targetHeight) {
            [targetWidth, targetHeight] = [targetHeight, targetWidth];
        }

        for (const pageIndex of pageIndicesToProcess) {
            const sourcePage = sourceDoc.getPages()[pageIndex as number];
            const { width: sourceWidth, height: sourceHeight } = sourcePage.getSize();

            const embeddedPage = await newDoc.embedPage(sourcePage);

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const newPage = newDoc.addPage([targetWidth, targetHeight]);

                    const tileWidth = sourceWidth / cols;
                    const tileHeight = sourceHeight / rows;

                    const scaleX = targetWidth / tileWidth;
                    const scaleY = targetHeight / tileHeight;
                    const scale = scalingMode === 'fit' ? Math.min(scaleX, scaleY) : Math.max(scaleX, scaleY);

                    const scaledTileWidth = tileWidth * scale;
                    const scaledTileHeight = tileHeight * scale;

                    const offsetX = (targetWidth - scaledTileWidth) / 2;
                    const offsetY = (targetHeight - scaledTileHeight) / 2;

                    const tileRowIndexFromBottom = rows - 1 - r;
                    const overlapOffset = tileRowIndexFromBottom * overlapInPoints;

                    newPage.drawPage(embeddedPage, {
                        x: -c * scaledTileWidth + offsetX - (c * overlapInPoints),
                        y: -tileRowIndexFromBottom * scaledTileHeight + offsetY + overlapOffset,
                        width: sourceWidth * scale,
                        height: sourceHeight * scale,
                    });
                }
            }
        }

        const newPdfBytes = await newDoc.save();
        downloadFile(new Blob([new Uint8Array(newPdfBytes)], { type: 'application/pdf' }), 'posterized.pdf');
        showAlert('Success', 'Your PDF has been posterized.');

    } catch (e) {
        console.error(e);
        showAlert('Error', e.message || 'Could not posterize the PDF.');
    } finally {
        hideLoader();
    }
}