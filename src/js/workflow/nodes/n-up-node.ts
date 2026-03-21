import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, processBatch } from '../types';
import { PDFDocument, rgb } from 'pdf-lib';
import { hexToRgb } from '../../utils/helpers.js';

export class NUpNode extends BaseWorkflowNode {
  readonly category = 'Organize & Manage' as const;
  readonly icon = 'ph-squares-four';
  readonly description = 'Arrange multiple pages per sheet';

  constructor() {
    super('N-Up');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
    this.addOutput('pdf', new ClassicPreset.Output(pdfSocket, 'N-Up PDF'));
    this.addControl(
      'pagesPerSheet',
      new ClassicPreset.InputControl('number', { initial: 4 })
    );
    this.addControl(
      'orientation',
      new ClassicPreset.InputControl('text', { initial: 'auto' })
    );
    this.addControl(
      'margins',
      new ClassicPreset.InputControl('text', { initial: 'true' })
    );
    this.addControl(
      'border',
      new ClassicPreset.InputControl('text', { initial: 'false' })
    );
    this.addControl(
      'borderColor',
      new ClassicPreset.InputControl('text', { initial: '#000000' })
    );
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'N-Up');

    const nCtrl = this.controls['pagesPerSheet'] as
      | ClassicPreset.InputControl<'number'>
      | undefined;
    const n = [2, 4, 9, 16].includes(nCtrl?.value ?? 4)
      ? (nCtrl?.value ?? 4)
      : 4;

    const getText = (key: string, fallback: string) => {
      const ctrl = this.controls[key] as
        | ClassicPreset.InputControl<'text'>
        | undefined;
      return ctrl?.value || fallback;
    };

    const orientation = getText('orientation', 'auto');
    const useMargins = getText('margins', 'true') === 'true';
    const addBorder = getText('border', 'false') === 'true';
    const borderHex = getText('borderColor', '#000000');
    const bc = hexToRgb(borderHex);
    const borderColor = rgb(bc.r, bc.g, bc.b);

    return {
      pdf: await processBatch(pdfInputs, async (input) => {
        const gridDims: Record<number, [number, number]> = {
          2: [2, 1],
          4: [2, 2],
          9: [3, 3],
          16: [4, 4],
        };
        const [cols, rows] = gridDims[n];

        const srcDoc = await PDFDocument.load(input.bytes);
        const newDoc = await PDFDocument.create();
        const pageCount = srcDoc.getPageCount();
        const firstPage = srcDoc.getPages()[0];
        let { width: pageWidth, height: pageHeight } = firstPage.getSize();

        if (orientation === 'landscape' && pageWidth < pageHeight) {
          [pageWidth, pageHeight] = [pageHeight, pageWidth];
        } else if (orientation === 'portrait' && pageWidth > pageHeight) {
          [pageWidth, pageHeight] = [pageHeight, pageWidth];
        }

        const margin = useMargins ? 36 : 0;
        const gutter = useMargins ? 5 : 0;
        const usableWidth = pageWidth - margin * 2;
        const usableHeight = pageHeight - margin * 2;
        const cellWidth = (usableWidth - gutter * (cols - 1)) / cols;
        const cellHeight = (usableHeight - gutter * (rows - 1)) / rows;

        for (let start = 0; start < pageCount; start += n) {
          const outputPage = newDoc.addPage([pageWidth, pageHeight]);
          const chunk = Math.min(n, pageCount - start);

          for (let j = 0; j < chunk; j++) {
            const srcPage = srcDoc.getPages()[start + j];
            const embedded = await newDoc.embedPage(srcPage);
            const col = j % cols;
            const row = Math.floor(j / cols);
            const x = margin + col * (cellWidth + gutter);
            const y =
              pageHeight - margin - (row + 1) * cellHeight - row * gutter;

            outputPage.drawPage(embedded, {
              x,
              y,
              width: cellWidth,
              height: cellHeight,
            });

            if (addBorder) {
              outputPage.drawRectangle({
                x,
                y,
                width: cellWidth,
                height: cellHeight,
                borderColor,
                borderWidth: 1,
              });
            }
          }
        }

        const pdfBytes = await newDoc.save();
        return {
          type: 'pdf',
          document: newDoc,
          bytes: new Uint8Array(pdfBytes),
          filename: input.filename.replace(/\.pdf$/i, '_nup.pdf'),
        };
      }),
    };
  }
}
