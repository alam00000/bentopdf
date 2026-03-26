import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, processBatch } from '../types';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { loadPdfDocument } from '../../utils/load-pdf-document.js';

export class RemoveBlankPagesNode extends BaseWorkflowNode {
  readonly category = 'Edit & Annotate' as const;
  readonly icon = 'ph-file-minus';
  readonly description = 'Remove blank pages automatically';

  constructor() {
    super('Remove Blank Pages');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
    this.addOutput('pdf', new ClassicPreset.Output(pdfSocket, 'PDF'));
    this.addControl(
      'threshold',
      new ClassicPreset.InputControl('number', { initial: 250 })
    );
  }

  private async isPageBlank(
    page: pdfjsLib.PDFPageProxy,
    maxNonWhitePercent: number
  ): Promise<boolean> {
    const viewport = page.getViewport({ scale: 0.5 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const totalPixels = data.length / 4;
    let nonWhitePixels = 0;
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (brightness < 240) nonWhitePixels++;
    }
    const nonWhitePercent = (nonWhitePixels / totalPixels) * 100;
    return nonWhitePercent <= maxNonWhitePercent;
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'Remove Blank Pages');

    const threshCtrl = this.controls['threshold'] as
      | ClassicPreset.InputControl<'number'>
      | undefined;
    const maxNonWhitePercent = Math.max(
      0.1,
      Math.min(5, threshCtrl?.value ?? 0.5)
    );

    return {
      pdf: await processBatch(pdfInputs, async (input) => {
        const pdfjsDoc = await pdfjsLib.getDocument({ data: input.bytes })
          .promise;
        const srcDoc = await loadPdfDocument(input.bytes);
        const nonBlankIndices: number[] = [];

        for (let i = 1; i <= pdfjsDoc.numPages; i++) {
          const page = await pdfjsDoc.getPage(i);
          const blank = await this.isPageBlank(page, maxNonWhitePercent);
          if (!blank) {
            nonBlankIndices.push(i - 1);
          } else {
            console.log(`Page ${i} detected as blank, removing`);
          }
        }

        if (nonBlankIndices.length === 0) {
          throw new Error('All pages are blank');
        }

        const newDoc = await PDFDocument.create();
        const copiedPages = await newDoc.copyPages(srcDoc, nonBlankIndices);
        copiedPages.forEach((page) => newDoc.addPage(page));

        const pdfBytes = await newDoc.save();
        return {
          type: 'pdf',
          document: newDoc,
          bytes: new Uint8Array(pdfBytes),
          filename: input.filename.replace(/\.pdf$/i, '_cleaned.pdf'),
        };
      }),
    };
  }
}
