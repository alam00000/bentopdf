import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, processBatch } from '../types';
import { PDFDocument } from 'pdf-lib';

export class CropNode extends BaseWorkflowNode {
  readonly category = 'Edit & Annotate' as const;
  readonly icon = 'ph-crop';
  readonly description = 'Trim margins from all pages';

  constructor() {
    super('Crop');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
    this.addOutput('pdf', new ClassicPreset.Output(pdfSocket, 'Cropped PDF'));
    this.addControl(
      'top',
      new ClassicPreset.InputControl('number', { initial: 0 })
    );
    this.addControl(
      'bottom',
      new ClassicPreset.InputControl('number', { initial: 0 })
    );
    this.addControl(
      'left',
      new ClassicPreset.InputControl('number', { initial: 0 })
    );
    this.addControl(
      'right',
      new ClassicPreset.InputControl('number', { initial: 0 })
    );
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'Crop');

    const getNum = (key: string) => {
      const ctrl = this.controls[key] as
        | ClassicPreset.InputControl<'number'>
        | undefined;
      return Math.max(0, ctrl?.value ?? 0);
    };

    const top = getNum('top');
    const bottom = getNum('bottom');
    const left = getNum('left');
    const right = getNum('right');

    return {
      pdf: await processBatch(pdfInputs, async (input) => {
        const pdfDoc = await PDFDocument.load(input.bytes);
        const pages = pdfDoc.getPages();

        for (const page of pages) {
          const { width, height } = page.getSize();
          const cropWidth = width - left - right;
          const cropHeight = height - top - bottom;
          if (cropWidth <= 0 || cropHeight <= 0) {
            throw new Error(
              'Crop margins exceed page dimensions. Reduce crop values.'
            );
          }
          page.setCropBox(left, bottom, cropWidth, cropHeight);
        }

        const pdfBytes = await pdfDoc.save();
        return {
          type: 'pdf',
          document: pdfDoc,
          bytes: new Uint8Array(pdfBytes),
          filename: input.filename.replace(/\.pdf$/i, '_cropped.pdf'),
        };
      }),
    };
  }
}
