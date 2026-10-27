import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, processBatch } from '../types';
import {
  compressWithHyper,
  resolveCompressLevel,
  targetSizeToBytes,
} from '../../utils/compress.js';
import { loadPdfDocument } from '../../utils/load-pdf-document.js';

export class CompressNode extends BaseWorkflowNode {
  readonly category = 'Optimize & Repair' as const;
  readonly icon = 'ph-lightning';
  readonly description = 'Reduce PDF file size';

  constructor() {
    super('Compress');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
    this.addOutput(
      'pdf',
      new ClassicPreset.Output(pdfSocket, 'Compressed PDF')
    );
    this.addControl(
      'compressionLevel',
      new ClassicPreset.InputControl('text', { initial: 'medium' })
    );
    this.addControl(
      'targetKilobytes',
      new ClassicPreset.InputControl('number', { initial: 0 })
    );
    this.addControl(
      'convertToGrayscale',
      new ClassicPreset.InputControl('text', { initial: 'false' })
    );
  }

  sanitizeControlValue(key: string, value: unknown): unknown {
    if (key === 'compressionLevel' && typeof value === 'string') {
      return super.sanitizeControlValue(key, resolveCompressLevel(value));
    }
    return super.sanitizeControlValue(key, value);
  }

  private getTextControl(key: string, fallback: string): string {
    const ctrl = this.controls[key] as
      | ClassicPreset.InputControl<'text'>
      | undefined;
    return ctrl?.value ?? fallback;
  }

  private getNumberControl(key: string, fallback: number): number {
    const ctrl = this.controls[key] as
      | ClassicPreset.InputControl<'number'>
      | undefined;
    return ctrl?.value ?? fallback;
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'Compress');

    const level = resolveCompressLevel(
      this.getTextControl('compressionLevel', 'medium')
    );
    const grayscale =
      this.getTextControl('convertToGrayscale', 'false') === 'true';
    const targetSizeBytes = targetSizeToBytes(
      this.getNumberControl('targetKilobytes', 0),
      'kb'
    );

    return {
      pdf: await processBatch(pdfInputs, async (input) => {
        const result = await compressWithHyper(input.bytes.slice().buffer, {
          preset: level,
          options: { grayscale },
          targetSizeBytes,
        });
        const pdfBytes = result.data;
        const document = await loadPdfDocument(pdfBytes);

        return {
          type: 'pdf',
          document,
          bytes: pdfBytes,
          filename: input.filename.replace(/\.pdf$/i, '_compressed.pdf'),
        };
      }),
    };
  }
}
