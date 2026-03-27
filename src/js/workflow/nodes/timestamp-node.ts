import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, processBatch } from '../types';
import { TIMESTAMP_TSA_PRESETS } from '../../config/timestamp-tsa.js';
import { timestampPdf } from '../../logic/digital-sign-pdf.js';
import { loadPdfDocument } from '../../utils/load-pdf-document.js';

export class TimestampNode extends BaseWorkflowNode {
  readonly category = 'Secure PDF' as const;
  readonly icon = 'ph-clock';
  readonly description = 'Add an RFC 3161 document timestamp';

  constructor() {
    super('Timestamp');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
    this.addOutput(
      'pdf',
      new ClassicPreset.Output(pdfSocket, 'Timestamped PDF')
    );
    this.addControl(
      'tsaUrl',
      new ClassicPreset.InputControl('text', {
        initial: TIMESTAMP_TSA_PRESETS[0].url,
      })
    );
  }

  getTsaPresets(): { label: string; url: string }[] {
    return TIMESTAMP_TSA_PRESETS;
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'Timestamp');

    const tsaUrlCtrl = this.controls['tsaUrl'] as
      | ClassicPreset.InputControl<'text'>
      | undefined;
    const tsaUrl = tsaUrlCtrl?.value || TIMESTAMP_TSA_PRESETS[0].url;

    return {
      pdf: await processBatch(pdfInputs, async (input) => {
        let bytes: Uint8Array;
        try {
          bytes = await timestampPdf(input.bytes, tsaUrl);
        } catch (err) {
          throw new Error(
            `Failed to timestamp using TSA ${tsaUrl}: ${err instanceof Error ? err.message : err}`,
            { cause: err }
          );
        }
        const document = await loadPdfDocument(bytes);

        return {
          type: 'pdf',
          document,
          bytes,
          filename: input.filename.replace(/\.pdf$/i, '_timestamped.pdf'),
        };
      }),
    };
  }
}
