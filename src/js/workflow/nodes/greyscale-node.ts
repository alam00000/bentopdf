import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, processBatch } from '../types';
import { applyGreyscale } from '../../utils/image-effects';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

export class GreyscaleNode extends BaseWorkflowNode {
  readonly category = 'Edit & Annotate' as const;
  readonly icon = 'ph-palette';
  readonly description = 'Convert to greyscale';

  constructor() {
    super('Greyscale');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
    this.addOutput('pdf', new ClassicPreset.Output(pdfSocket, 'Greyscale PDF'));
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'Greyscale');

    return {
      pdf: await processBatch(pdfInputs, async (input) => {
        const newPdfDoc = await PDFDocument.create();
        const pdfjsDoc = await pdfjsLib.getDocument({ data: input.bytes })
          .promise;

        for (let i = 1; i <= pdfjsDoc.numPages; i++) {
          const page = await pdfjsDoc.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 });

          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          if (!ctx)
            throw new Error(`Failed to get canvas context for page ${i}`);
          await page.render({ canvasContext: ctx, viewport, canvas }).promise;

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          applyGreyscale(imageData);
          ctx.putImageData(imageData, 0, 0);

          const jpegBlob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, 'image/jpeg', 0.9)
          );

          if (!jpegBlob) throw new Error(`Failed to render page ${i} to image`);
          const jpegBytes = await jpegBlob.arrayBuffer();
          const jpegImage = await newPdfDoc.embedJpg(jpegBytes);
          const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);
          newPage.drawImage(jpegImage, {
            x: 0,
            y: 0,
            width: viewport.width,
            height: viewport.height,
          });
        }

        if (newPdfDoc.getPageCount() === 0)
          throw new Error('No pages were processed');
        const pdfBytes = await newPdfDoc.save();
        return {
          type: 'pdf',
          document: newPdfDoc,
          bytes: new Uint8Array(pdfBytes),
          filename: input.filename.replace(/\.pdf$/i, '_greyscale.pdf'),
        };
      }),
    };
  }
}
