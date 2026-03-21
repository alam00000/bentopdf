import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, processBatch } from '../types';
import { PDFDocument } from 'pdf-lib';
import { loadPyMuPDF } from '../../utils/pymupdf-loader.js';
import { hexToRgb } from '../../utils/helpers.js';

export class RedactNode extends BaseWorkflowNode {
  readonly category = 'Secure PDF' as const;
  readonly icon = 'ph-eye-slash';
  readonly description = 'Redact text from PDF';

  constructor() {
    super('Redact');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
    this.addOutput('pdf', new ClassicPreset.Output(pdfSocket, 'Redacted PDF'));
    this.addControl(
      'redactMode',
      new ClassicPreset.InputControl('text', { initial: 'text' })
    );
    this.addControl(
      'text',
      new ClassicPreset.InputControl('text', { initial: '' })
    );
    this.addControl(
      'x0',
      new ClassicPreset.InputControl('number', { initial: 0 })
    );
    this.addControl(
      'y0',
      new ClassicPreset.InputControl('number', { initial: 0 })
    );
    this.addControl(
      'x1',
      new ClassicPreset.InputControl('number', { initial: 200 })
    );
    this.addControl(
      'y1',
      new ClassicPreset.InputControl('number', { initial: 50 })
    );
    this.addControl(
      'fillColor',
      new ClassicPreset.InputControl('text', { initial: '#000000' })
    );
  }

  private getText(key: string, fallback: string): string {
    const ctrl = this.controls[key] as
      | ClassicPreset.InputControl<'text'>
      | undefined;
    return ctrl?.value || fallback;
  }

  private getNum(key: string, fallback: number): number {
    const ctrl = this.controls[key] as
      | ClassicPreset.InputControl<'number'>
      | undefined;
    return ctrl?.value ?? fallback;
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'Redact');

    const mode = this.getText('redactMode', 'text');
    const searchText = this.getText('text', '');
    const fill = hexToRgb(this.getText('fillColor', '#000000'));

    if (mode === 'text' && !searchText) {
      throw new Error('Redact: No text specified to redact');
    }

    const areaRect = {
      x0: this.getNum('x0', 0),
      y0: this.getNum('y0', 0),
      x1: this.getNum('x1', 200),
      y1: this.getNum('y1', 50),
    };

    return {
      pdf: await processBatch(pdfInputs, async (input) => {
        const pymupdf = await loadPyMuPDF();
        const blob = new Blob([new Uint8Array(input.bytes)], {
          type: 'application/pdf',
        });
        const doc = await pymupdf.open(blob);

        for (const page of doc.pages()) {
          if (mode === 'text') {
            const rects = page.searchFor(searchText);
            for (const rect of rects) {
              page.addRedaction(rect, '', fill);
            }
            if (rects.length > 0) {
              page.applyRedactions();
            }
          } else {
            page.addRedaction(areaRect, '', fill);
            page.applyRedactions();
          }
        }

        const resultBytes = new Uint8Array(doc.save());
        doc.close();

        const resultDoc = await PDFDocument.load(resultBytes);

        return {
          type: 'pdf',
          document: resultDoc,
          bytes: resultBytes,
          filename: input.filename.replace(/\.pdf$/i, '_redacted.pdf'),
        };
      }),
    };
  }
}
