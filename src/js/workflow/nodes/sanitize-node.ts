import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, processBatch } from '../types';
import { sanitizePdf } from '../../utils/sanitize';

export class SanitizeNode extends BaseWorkflowNode {
  readonly category = 'Secure PDF' as const;
  readonly icon = 'ph-broom';
  readonly description = 'Remove metadata, scripts, and hidden data';

  constructor() {
    super('Sanitize');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
    this.addOutput('pdf', new ClassicPreset.Output(pdfSocket, 'Sanitized PDF'));
    this.addControl(
      'flattenForms',
      new ClassicPreset.InputControl('text', { initial: 'true' })
    );
    this.addControl(
      'removeMetadata',
      new ClassicPreset.InputControl('text', { initial: 'true' })
    );
    this.addControl(
      'removeAnnotations',
      new ClassicPreset.InputControl('text', { initial: 'true' })
    );
    this.addControl(
      'removeJavascript',
      new ClassicPreset.InputControl('text', { initial: 'true' })
    );
    this.addControl(
      'removeEmbeddedFiles',
      new ClassicPreset.InputControl('text', { initial: 'true' })
    );
    this.addControl(
      'removeLayers',
      new ClassicPreset.InputControl('text', { initial: 'true' })
    );
    this.addControl(
      'removeLinks',
      new ClassicPreset.InputControl('text', { initial: 'true' })
    );
    this.addControl(
      'removeStructureTree',
      new ClassicPreset.InputControl('text', { initial: 'true' })
    );
    this.addControl(
      'removeMarkInfo',
      new ClassicPreset.InputControl('text', { initial: 'true' })
    );
    this.addControl(
      'removeFonts',
      new ClassicPreset.InputControl('text', { initial: 'false' })
    );
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'Sanitize');

    const getBool = (key: string, fallback: string) => {
      const ctrl = this.controls[key] as
        | ClassicPreset.InputControl<'text'>
        | undefined;
      return (ctrl?.value ?? fallback) === 'true';
    };

    const options = {
      flattenForms: getBool('flattenForms', 'true'),
      removeMetadata: getBool('removeMetadata', 'true'),
      removeAnnotations: getBool('removeAnnotations', 'true'),
      removeJavascript: getBool('removeJavascript', 'true'),
      removeEmbeddedFiles: getBool('removeEmbeddedFiles', 'true'),
      removeLayers: getBool('removeLayers', 'true'),
      removeLinks: getBool('removeLinks', 'true'),
      removeStructureTree: getBool('removeStructureTree', 'true'),
      removeMarkInfo: getBool('removeMarkInfo', 'true'),
      removeFonts: getBool('removeFonts', 'false'),
    };

    return {
      pdf: await processBatch(pdfInputs, async (input) => {
        const result = await sanitizePdf(input.bytes, options);
        return {
          type: 'pdf',
          document: result.pdfDoc,
          bytes: result.bytes,
          filename: input.filename.replace(/\.pdf$/i, '_sanitized.pdf'),
        };
      }),
    };
  }
}
