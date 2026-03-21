import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, processBatch } from '../types';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

export class PosterizeNode extends BaseWorkflowNode {
  readonly category = 'Organize & Manage' as const;
  readonly icon = 'ph-notepad';
  readonly description = 'Split pages into tile grid for poster printing';

  constructor() {
    super('Posterize');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
    this.addOutput(
      'pdf',
      new ClassicPreset.Output(pdfSocket, 'Posterized PDF')
    );
    this.addControl(
      'rows',
      new ClassicPreset.InputControl('number', { initial: 2 })
    );
    this.addControl(
      'cols',
      new ClassicPreset.InputControl('number', { initial: 2 })
    );
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'Posterize');

    const rowsCtrl = this.controls['rows'] as
      | ClassicPreset.InputControl<'number'>
      | undefined;
    const colsCtrl = this.controls['cols'] as
      | ClassicPreset.InputControl<'number'>
      | undefined;
    const rows = Math.max(1, Math.min(8, rowsCtrl?.value ?? 2));
    const cols = Math.max(1, Math.min(8, colsCtrl?.value ?? 2));

    return {
      pdf: await processBatch(pdfInputs, async (input) => {
        const pdfjsDoc = await pdfjsLib.getDocument({ data: input.bytes })
          .promise;
        const newDoc = await PDFDocument.create();

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

          const tileW = viewport.width / cols;
          const tileH = viewport.height / rows;

          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const tileCanvas = document.createElement('canvas');
              tileCanvas.width = tileW;
              tileCanvas.height = tileH;
              const tileCtx = tileCanvas.getContext('2d');
              if (!tileCtx)
                throw new Error('Failed to get tile canvas context');
              tileCtx.drawImage(
                canvas,
                c * tileW,
                r * tileH,
                tileW,
                tileH,
                0,
                0,
                tileW,
                tileH
              );

              const pngBlob = await new Promise<Blob | null>((resolve) =>
                tileCanvas.toBlob(resolve, 'image/png')
              );
              if (!pngBlob)
                throw new Error(
                  `Failed to render tile (row ${r}, col ${c}) of page ${i}`
                );
              const pngBytes = new Uint8Array(await pngBlob.arrayBuffer());
              const pngImage = await newDoc.embedPng(pngBytes);
              const newPage = newDoc.addPage([tileW / 2, tileH / 2]);
              newPage.drawImage(pngImage, {
                x: 0,
                y: 0,
                width: tileW / 2,
                height: tileH / 2,
              });
            }
          }
        }

        const pdfBytes = new Uint8Array(await newDoc.save());
        return {
          type: 'pdf',
          document: newDoc,
          bytes: pdfBytes,
          filename: input.filename.replace(/\.pdf$/i, '_posterized.pdf'),
        };
      }),
    };
  }
}
