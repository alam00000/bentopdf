import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, processBatch } from '../types';
import { performOcr } from '../../utils/ocr';

export class OCRNode extends BaseWorkflowNode {
  readonly category = 'Organize & Manage' as const;
  readonly icon = 'ph-barcode';
  readonly description = 'Add searchable text layer via OCR';

  constructor() {
    super('OCR');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
    this.addOutput(
      'pdf',
      new ClassicPreset.Output(pdfSocket, 'Searchable PDF')
    );
    this.addControl(
      'language',
      new ClassicPreset.InputControl('text', { initial: 'eng' })
    );
    this.addControl(
      'resolution',
      new ClassicPreset.InputControl('text', { initial: '3.0' })
    );
    this.addControl(
      'binarize',
      new ClassicPreset.InputControl('text', { initial: 'false' })
    );
    this.addControl(
      'whitelist',
      new ClassicPreset.InputControl('text', { initial: '' })
    );
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'OCR');

    const langCtrl = this.controls['language'] as
      | ClassicPreset.InputControl<'text'>
      | undefined;
    const language = langCtrl?.value || 'eng';

    const resCtrl = this.controls['resolution'] as
      | ClassicPreset.InputControl<'text'>
      | undefined;
    const resolution = Math.max(
      1.0,
      Math.min(4.0, parseFloat(resCtrl?.value ?? '3.0'))
    );

    const binarizeCtrl = this.controls['binarize'] as
      | ClassicPreset.InputControl<'text'>
      | undefined;
    const binarize = (binarizeCtrl?.value ?? 'false') === 'true';

    const whitelistCtrl = this.controls['whitelist'] as
      | ClassicPreset.InputControl<'text'>
      | undefined;
    const whitelist = whitelistCtrl?.value || '';

    return {
      pdf: await processBatch(pdfInputs, async (input) => {
        const result = await performOcr(input.bytes, {
          language,
          resolution,
          binarize,
          whitelist,
        });

        return {
          type: 'pdf',
          document: result.pdfDoc,
          bytes: result.pdfBytes,
          filename: input.filename.replace(/\.pdf$/i, '_ocr.pdf'),
        };
      }),
    };
  }
}
