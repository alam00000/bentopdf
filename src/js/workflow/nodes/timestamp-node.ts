import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, processBatch } from '../types';
import { PDFDocument } from 'pdf-lib';
import { timestampPdf } from '../../logic/digital-sign-pdf.js';

const TSA_PRESETS: { label: string; url: string }[] = [
  { label: 'DigiCert', url: 'http://timestamp.digicert.com' },
  { label: 'Sectigo', url: 'http://timestamp.sectigo.com' },
  { label: 'SSL.com', url: 'http://ts.ssl.com' },
  {
    label: 'Entrust',
    url: 'http://timestamp.entrust.net/TSS/RFC3161sha2TS',
  },
  { label: 'FreeTSA', url: 'http://freetsa.org/tsr' },
];

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
        initial: TSA_PRESETS[0].url,
      })
    );
  }

  getTsaPresets(): { label: string; url: string }[] {
    return TSA_PRESETS;
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'Timestamp');

    const tsaUrlCtrl = this.controls['tsaUrl'] as
      | ClassicPreset.InputControl<'text'>
      | undefined;
    const tsaUrl = tsaUrlCtrl?.value || TSA_PRESETS[0].url;

    return {
      pdf: await processBatch(pdfInputs, async (input) => {
        const timestampedBytes = await timestampPdf(input.bytes, tsaUrl);

        const bytes = new Uint8Array(timestampedBytes);
        const document = await PDFDocument.load(bytes);

        return {
          type: 'pdf',
          document,
          bytes,
          filename: input.filename.replace(
            /\.pdf$/i,
            '_timestamped.pdf'
          ),
        };
      }),
    };
  }
}
