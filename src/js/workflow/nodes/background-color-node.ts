import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, processBatch } from '../types';
import { PDFDocument, rgb } from 'pdf-lib';
import { hexToRgb } from '../../utils/helpers.js';

export class BackgroundColorNode extends BaseWorkflowNode {
  readonly category = 'Edit & Annotate' as const;
  readonly icon = 'ph-palette';
  readonly description = 'Change background color';

  constructor() {
    super('Background Color');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
    this.addOutput('pdf', new ClassicPreset.Output(pdfSocket, 'PDF'));
    this.addControl(
      'color',
      new ClassicPreset.InputControl('text', { initial: '#ffffff' })
    );
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'Background Color');

    const colorCtrl = this.controls['color'] as
      | ClassicPreset.InputControl<'text'>
      | undefined;
    const hex = colorCtrl?.value || '#ffffff';
    const c = hexToRgb(hex);

    return {
      pdf: await processBatch(pdfInputs, async (input) => {
        const srcDoc = await PDFDocument.load(input.bytes);
        const newDoc = await PDFDocument.create();

        for (let i = 0; i < srcDoc.getPageCount(); i++) {
          const [originalPage] = await newDoc.copyPages(srcDoc, [i]);
          const { width, height } = originalPage.getSize();
          const newPage = newDoc.addPage([width, height]);
          newPage.drawRectangle({
            x: 0,
            y: 0,
            width,
            height,
            color: rgb(c.r, c.g, c.b),
          });
          const embedded = await newDoc.embedPage(originalPage);
          newPage.drawPage(embedded, { x: 0, y: 0, width, height });
        }

        const pdfBytes = await newDoc.save();
        return {
          type: 'pdf',
          document: newDoc,
          bytes: new Uint8Array(pdfBytes),
          filename: input.filename.replace(/\.pdf$/i, '_bg.pdf'),
        };
      }),
    };
  }
}
