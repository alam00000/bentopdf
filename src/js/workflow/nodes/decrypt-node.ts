import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, processBatch } from '../types';
import { decryptPdfBytes } from '../../utils/pdf-decrypt.js';
import { loadPdfDocument } from '../../utils/load-pdf-document.js';

export class DecryptNode extends BaseWorkflowNode {
  readonly category = 'Secure PDF' as const;
  readonly icon = 'ph-lock-open';
  readonly description = 'Remove PDF password protection';

  constructor() {
    super('Decrypt');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
    this.addOutput('pdf', new ClassicPreset.Output(pdfSocket, 'Decrypted PDF'));
    this.addControl(
      'password',
      new ClassicPreset.InputControl('text', { initial: '' })
    );
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'Decrypt');

    const passCtrl = this.controls['password'] as
      | ClassicPreset.InputControl<'text'>
      | undefined;
    const password = passCtrl?.value || '';

    return {
      pdf: await processBatch(pdfInputs, async (input) => {
        const { bytes: resultBytes } = await decryptPdfBytes(
          input.bytes,
          password
        );
        const document = await loadPdfDocument(resultBytes);

        return {
          type: 'pdf',
          document,
          bytes: resultBytes,
          filename: input.filename.replace(/\.pdf$/i, '_decrypted.pdf'),
        };
      }),
    };
  }
}
