import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, processBatch } from '../types';
import { rotatePdfUniform } from '../../utils/pdf-operations';
import { PDFDocument } from 'pdf-lib';

export class RotateNode extends BaseWorkflowNode {
  readonly category = 'Organize & Manage' as const;
  readonly icon = 'ph-arrow-clockwise';
  readonly description = 'Rotate all pages';

  constructor() {
    super('Rotate');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
    this.addOutput('pdf', new ClassicPreset.Output(pdfSocket, 'Rotated PDF'));
    this.addControl(
      'angle',
      new ClassicPreset.InputControl('text', { initial: '90' })
    );
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'Rotate');
    const angleControl = this.controls['angle'] as
      | ClassicPreset.InputControl<'text'>
      | undefined;
    const angle = parseInt(angleControl?.value ?? '90', 10) || 90;

    return {
      pdf: await processBatch(pdfInputs, async (input) => {
        const resultBytes = await rotatePdfUniform(input.bytes, angle);
        const resultDoc = await PDFDocument.load(resultBytes);
        return {
          type: 'pdf',
          document: resultDoc,
          bytes: resultBytes,
          filename: input.filename.replace(/\.pdf$/i, '_rotated.pdf'),
        };
      }),
    };
  }
}
