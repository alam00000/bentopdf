import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, processBatch } from '../types';
import { PDFDocument } from 'pdf-lib';
import {
  performCondenseCompression,
  performPhotonCompression,
} from '../../utils/compress.js';
import type { CondenseCustomSettings } from '../../utils/compress.js';
import { isPyMuPDFAvailable } from '../../utils/pymupdf-loader.js';

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
      'algorithm',
      new ClassicPreset.InputControl('text', { initial: 'condense' })
    );
    this.addControl(
      'compressionLevel',
      new ClassicPreset.InputControl('text', { initial: 'balanced' })
    );
    this.addControl(
      'imageQuality',
      new ClassicPreset.InputControl('number', { initial: 75 })
    );
    this.addControl(
      'dpiTarget',
      new ClassicPreset.InputControl('number', { initial: 96 })
    );
    this.addControl(
      'dpiThreshold',
      new ClassicPreset.InputControl('number', { initial: 150 })
    );
    this.addControl(
      'removeMetadata',
      new ClassicPreset.InputControl('text', { initial: 'true' })
    );
    this.addControl(
      'subsetFonts',
      new ClassicPreset.InputControl('text', { initial: 'true' })
    );
    this.addControl(
      'convertToGrayscale',
      new ClassicPreset.InputControl('text', { initial: 'false' })
    );
    this.addControl(
      'removeThumbnails',
      new ClassicPreset.InputControl('text', { initial: 'true' })
    );
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

    const algorithm = this.getTextControl('algorithm', 'condense');
    const level = this.getTextControl('compressionLevel', 'balanced');
    const customSettings: CondenseCustomSettings = {
      imageQuality: this.getNumberControl('imageQuality', 75),
      dpiTarget: this.getNumberControl('dpiTarget', 96),
      dpiThreshold: this.getNumberControl('dpiThreshold', 150),
      removeMetadata: this.getTextControl('removeMetadata', 'true') === 'true',
      subsetFonts: this.getTextControl('subsetFonts', 'true') === 'true',
      convertToGrayscale:
        this.getTextControl('convertToGrayscale', 'false') === 'true',
      removeThumbnails:
        this.getTextControl('removeThumbnails', 'true') === 'true',
    };

    return {
      pdf: await processBatch(pdfInputs, async (input) => {
        const arrayBuffer = input.bytes.buffer.slice(
          input.bytes.byteOffset,
          input.bytes.byteOffset + input.bytes.byteLength
        ) as ArrayBuffer;

        let pdfBytes: Uint8Array;

        if (algorithm === 'condense' && isPyMuPDFAvailable()) {
          const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
          const result = await performCondenseCompression(
            blob,
            level,
            customSettings
          );
          pdfBytes = new Uint8Array(await result.blob.arrayBuffer());
        } else {
          pdfBytes = await performPhotonCompression(arrayBuffer, level);
        }

        const document = await PDFDocument.load(pdfBytes);

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
