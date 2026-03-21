import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, processBatch } from '../types';
import { applyInvertColors } from '../../utils/image-effects';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

export class InvertColorsNode extends BaseWorkflowNode {
  readonly category = 'Edit & Annotate' as const;
  readonly icon = 'ph-circle-half';
  readonly description = 'Invert all colors';

  constructor() {
    super('Invert Colors');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
    this.addOutput('pdf', new ClassicPreset.Output(pdfSocket, 'Inverted PDF'));
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'Invert Colors');

    return {
      pdf: await processBatch(pdfInputs, async (input) => {
        const newPdfDoc = await PDFDocument.create();
        const pdfjsDoc = await pdfjsLib.getDocument({ data: input.bytes })
          .promise;

        for (let i = 1; i <= pdfjsDoc.numPages; i++) {
          const page = await pdfjsDoc.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });

          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          if (!ctx)
            throw new Error(`Failed to get canvas context for page ${i}`);
          await page.render({ canvasContext: ctx, viewport, canvas }).promise;

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          applyInvertColors(imageData);
          ctx.putImageData(imageData, 0, 0);

          const pngBytes = await new Promise<Uint8Array>((resolve, reject) =>
            canvas.toBlob((blob) => {
              if (!blob) {
                reject(new Error(`Failed to render page ${i}`));
                return;
              }
              const reader = new FileReader();
              reader.onload = () =>
                resolve(new Uint8Array(reader.result as ArrayBuffer));
              reader.onerror = () =>
                reject(new Error('Failed to read image data'));
              reader.readAsArrayBuffer(blob);
            }, 'image/png')
          );

          const image = await newPdfDoc.embedPng(pngBytes);
          const newPage = newPdfDoc.addPage([image.width, image.height]);
          newPage.drawImage(image, {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height,
          });
        }

        const pdfBytes = await newPdfDoc.save();
        return {
          type: 'pdf',
          document: newPdfDoc,
          bytes: new Uint8Array(pdfBytes),
          filename: input.filename.replace(/\.pdf$/i, '_inverted.pdf'),
        };
      }),
    };
  }
}
