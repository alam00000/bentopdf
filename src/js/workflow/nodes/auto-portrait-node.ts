import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, processBatch } from '../types';
import { rotateLandscapeToPortrait } from '../../utils/pdf-operations';
import { loadPdfDocument } from '../../utils/load-pdf-document.js';

/**
 * Rotates only landscape pages so the whole document is portrait.
 * Useful after Merge when inputs mix portrait and landscape documents.
 */
export class AutoPortraitNode extends BaseWorkflowNode {
  readonly category = 'Organize & Manage' as const;
  readonly icon = 'ph-device-mobile-camera';
  readonly description = 'Rotate only landscape pages to portrait';

  constructor() {
    super('Auto Portrait');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
    this.addOutput('pdf', new ClassicPreset.Output(pdfSocket, 'Portrait PDF'));
    this.addControl(
      'turnDirection',
      new ClassicPreset.InputControl('text', { initial: '90' })
    );
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'Auto Portrait');
    const ctrl = this.controls['turnDirection'] as
      | ClassicPreset.InputControl<'text'>
      | undefined;
    const direction = ctrl?.value === '270' ? 270 : 90;

    return {
      pdf: await processBatch(pdfInputs, async (input) => {
        const resultBytes = await rotateLandscapeToPortrait(
          input.bytes,
          direction
        );
        const resultDoc = await loadPdfDocument(resultBytes);
        return {
          type: 'pdf',
          document: resultDoc,
          bytes: resultBytes,
          filename: input.filename,
        };
      }),
    };
  }
}
