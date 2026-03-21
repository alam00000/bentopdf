import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, processBatch } from '../types';
import { PDFDocument } from 'pdf-lib';

export class AddBlankPageNode extends BaseWorkflowNode {
  readonly category = 'Organize & Manage' as const;
  readonly icon = 'ph-file-plus';
  readonly description = 'Insert blank pages';

  constructor() {
    super('Add Blank Page');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
    this.addOutput('pdf', new ClassicPreset.Output(pdfSocket, 'PDF'));
    this.addControl(
      'blankPosition',
      new ClassicPreset.InputControl('text', { initial: 'end' })
    );
    this.addControl(
      'afterPage',
      new ClassicPreset.InputControl('number', { initial: 1 })
    );
    this.addControl(
      'count',
      new ClassicPreset.InputControl('number', { initial: 1 })
    );
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'Add Blank Page');
    const posCtrl = this.controls['blankPosition'] as
      | ClassicPreset.InputControl<'text'>
      | undefined;
    const position = posCtrl?.value || 'end';
    const afterPageCtrl = this.controls['afterPage'] as
      | ClassicPreset.InputControl<'number'>
      | undefined;
    const afterPage = afterPageCtrl?.value ?? 1;
    const countCtrl = this.controls['count'] as
      | ClassicPreset.InputControl<'number'>
      | undefined;
    const count = Math.max(1, Math.min(100, countCtrl?.value ?? 1));

    return {
      pdf: await processBatch(pdfInputs, async (input) => {
        const pdfDoc = await PDFDocument.load(input.bytes);
        const firstPage = pdfDoc.getPages()[0];
        const { width, height } = firstPage
          ? firstPage.getSize()
          : { width: 595.28, height: 841.89 };
        for (let i = 0; i < count; i++) {
          if (position === 'start') {
            pdfDoc.insertPage(0, [width, height]);
          } else if (position === 'after') {
            const insertAt =
              Math.min(Math.max(1, afterPage), pdfDoc.getPageCount()) + i;
            pdfDoc.insertPage(insertAt, [width, height]);
          } else {
            pdfDoc.addPage([width, height]);
          }
        }
        const pdfBytes = await pdfDoc.save();
        return {
          type: 'pdf',
          document: pdfDoc,
          bytes: new Uint8Array(pdfBytes),
          filename: input.filename.replace(/\.pdf$/i, '_blank.pdf'),
        };
      }),
    };
  }
}
