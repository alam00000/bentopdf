import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, processBatch } from '../types';
import { PDFDocument, PageSizes } from 'pdf-lib';

const paperSizeLookup: Record<string, [number, number]> = {
  Letter: PageSizes.Letter,
  A4: PageSizes.A4,
  A3: PageSizes.A3,
  Tabloid: PageSizes.Tabloid,
  Legal: PageSizes.Legal,
};

export class BookletNode extends BaseWorkflowNode {
  readonly category = 'Organize & Manage' as const;
  readonly icon = 'ph-book-open';
  readonly description = 'Arrange pages for booklet printing';

  constructor() {
    super('Booklet');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
    this.addOutput('pdf', new ClassicPreset.Output(pdfSocket, 'Booklet PDF'));
    this.addControl(
      'gridMode',
      new ClassicPreset.InputControl('text', { initial: '1x2' })
    );
    this.addControl(
      'paperSize',
      new ClassicPreset.InputControl('text', { initial: 'Letter' })
    );
    this.addControl(
      'orientation',
      new ClassicPreset.InputControl('text', { initial: 'auto' })
    );
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'Booklet');

    const getText = (key: string, fallback: string) => {
      const ctrl = this.controls[key] as
        | ClassicPreset.InputControl<'text'>
        | undefined;
      return ctrl?.value || fallback;
    };

    const gridMode = getText('gridMode', '1x2');
    const paperSizeKey = getText('paperSize', 'Letter');
    const orientationVal = getText('orientation', 'auto');

    let rows: number, cols: number;
    switch (gridMode) {
      case '2x2':
        rows = 2;
        cols = 2;
        break;
      case '2x4':
        rows = 2;
        cols = 4;
        break;
      case '4x4':
        rows = 4;
        cols = 4;
        break;
      default:
        rows = 1;
        cols = 2;
        break;
    }

    const isBookletMode = rows === 1 && cols === 2;
    const pageDims = paperSizeLookup[paperSizeKey] || PageSizes.Letter;
    const orientation =
      orientationVal === 'portrait'
        ? 'portrait'
        : orientationVal === 'landscape'
          ? 'landscape'
          : isBookletMode
            ? 'landscape'
            : 'portrait';

    const sheetWidth = orientation === 'landscape' ? pageDims[1] : pageDims[0];
    const sheetHeight = orientation === 'landscape' ? pageDims[0] : pageDims[1];

    return {
      pdf: await processBatch(pdfInputs, async (input) => {
        const sourceDoc = await PDFDocument.load(input.bytes);
        const totalPages = sourceDoc.getPageCount();
        const pagesPerSheet = rows * cols;
        const outputDoc = await PDFDocument.create();

        let numSheets: number;
        let totalRounded: number;
        if (isBookletMode) {
          totalRounded = Math.ceil(totalPages / 4) * 4;
          numSheets = Math.ceil(totalPages / 4) * 2;
        } else {
          totalRounded = totalPages;
          numSheets = Math.ceil(totalPages / pagesPerSheet);
        }

        const cellWidth = sheetWidth / cols;
        const cellHeight = sheetHeight / rows;
        const padding = 10;

        for (let sheetIndex = 0; sheetIndex < numSheets; sheetIndex++) {
          const outputPage = outputDoc.addPage([sheetWidth, sheetHeight]);

          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const slotIndex = r * cols + c;
              let pageNumber: number;

              if (isBookletMode) {
                const physicalSheet = Math.floor(sheetIndex / 2);
                const isFrontSide = sheetIndex % 2 === 0;
                if (isFrontSide) {
                  pageNumber =
                    c === 0
                      ? totalRounded - 2 * physicalSheet
                      : 2 * physicalSheet + 1;
                } else {
                  pageNumber =
                    c === 0
                      ? 2 * physicalSheet + 2
                      : totalRounded - 2 * physicalSheet - 1;
                }
              } else {
                pageNumber = sheetIndex * pagesPerSheet + slotIndex + 1;
              }

              if (pageNumber >= 1 && pageNumber <= totalPages) {
                const [embeddedPage] = await outputDoc.embedPdf(sourceDoc, [
                  pageNumber - 1,
                ]);
                const { width: srcW, height: srcH } = embeddedPage;
                const availableWidth = cellWidth - padding * 2;
                const availableHeight = cellHeight - padding * 2;
                const scale = Math.min(
                  availableWidth / srcW,
                  availableHeight / srcH
                );
                const scaledWidth = srcW * scale;
                const scaledHeight = srcH * scale;
                const x =
                  c * cellWidth + padding + (availableWidth - scaledWidth) / 2;
                const y =
                  sheetHeight -
                  (r + 1) * cellHeight +
                  padding +
                  (availableHeight - scaledHeight) / 2;
                outputPage.drawPage(embeddedPage, {
                  x,
                  y,
                  width: scaledWidth,
                  height: scaledHeight,
                });
              }
            }
          }
        }

        const pdfBytes = new Uint8Array(await outputDoc.save());
        return {
          type: 'pdf',
          document: outputDoc,
          bytes: pdfBytes,
          filename: input.filename.replace(/\.pdf$/i, '_booklet.pdf'),
        };
      }),
    };
  }
}
