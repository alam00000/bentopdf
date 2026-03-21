import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, processBatch } from '../types';
import {
  addPageNumbers,
  type PageNumberPosition,
  type PageNumberFormat,
} from '../../utils/pdf-operations';
import { PDFDocument } from 'pdf-lib';
import { hexToRgb } from '../../utils/helpers.js';

export class PageNumbersNode extends BaseWorkflowNode {
  readonly category = 'Edit & Annotate' as const;
  readonly icon = 'ph-list-numbers';
  readonly description = 'Add page numbers';

  constructor() {
    super('Page Numbers');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
    this.addOutput('pdf', new ClassicPreset.Output(pdfSocket, 'Numbered PDF'));
    this.addControl(
      'position',
      new ClassicPreset.InputControl('text', { initial: 'bottom-center' })
    );
    this.addControl(
      'fontSize',
      new ClassicPreset.InputControl('number', { initial: 12 })
    );
    this.addControl(
      'numberFormat',
      new ClassicPreset.InputControl('text', { initial: 'simple' })
    );
    this.addControl(
      'color',
      new ClassicPreset.InputControl('text', { initial: '#000000' })
    );
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'Page Numbers');

    const getText = (key: string, fallback: string) => {
      const ctrl = this.controls[key] as
        | ClassicPreset.InputControl<'text'>
        | undefined;
      return ctrl?.value || fallback;
    };
    const sizeCtrl = this.controls['fontSize'] as
      | ClassicPreset.InputControl<'number'>
      | undefined;
    const fontSize = Math.max(4, Math.min(72, sizeCtrl?.value ?? 12));

    const position = getText('position', 'bottom-center') as PageNumberPosition;
    const format = getText('numberFormat', 'simple') as PageNumberFormat;
    const colorHex = getText('color', '#000000');
    const c = hexToRgb(colorHex);

    return {
      pdf: await processBatch(pdfInputs, async (input) => {
        const resultBytes = await addPageNumbers(input.bytes, {
          position,
          fontSize,
          format,
          color: { r: c.r, g: c.g, b: c.b },
        });

        const resultDoc = await PDFDocument.load(resultBytes);

        return {
          type: 'pdf',
          document: resultDoc,
          bytes: new Uint8Array(resultBytes),
          filename: input.filename.replace(/\.pdf$/i, '_numbered.pdf'),
        };
      }),
    };
  }
}
