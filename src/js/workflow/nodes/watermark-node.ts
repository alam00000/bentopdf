import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, processBatch } from '../types';
import { addTextWatermark, parsePageRange } from '../../utils/pdf-operations';
import { PDFDocument } from 'pdf-lib';
import { hexToRgb } from '../../utils/helpers.js';
import * as pdfjsLib from 'pdfjs-dist';

export class WatermarkNode extends BaseWorkflowNode {
  readonly category = 'Edit & Annotate' as const;
  readonly icon = 'ph-drop';
  readonly description = 'Add text watermark';

  constructor() {
    super('Watermark');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
    this.addOutput(
      'pdf',
      new ClassicPreset.Output(pdfSocket, 'Watermarked PDF')
    );
    this.addControl(
      'text',
      new ClassicPreset.InputControl('text', { initial: 'DRAFT' })
    );
    this.addControl(
      'fontSize',
      new ClassicPreset.InputControl('number', { initial: 72 })
    );
    this.addControl(
      'color',
      new ClassicPreset.InputControl('text', { initial: '#808080' })
    );
    this.addControl(
      'opacity',
      new ClassicPreset.InputControl('number', { initial: 30 })
    );
    this.addControl(
      'angle',
      new ClassicPreset.InputControl('number', { initial: -45 })
    );
    this.addControl(
      'position',
      new ClassicPreset.InputControl('text', { initial: 'center' })
    );
    this.addControl(
      'pages',
      new ClassicPreset.InputControl('text', { initial: 'all' })
    );
    this.addControl(
      'flatten',
      new ClassicPreset.InputControl('text', { initial: 'no' })
    );
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'Watermark');

    const getText = (key: string, fallback: string) => {
      const ctrl = this.controls[key] as
        | ClassicPreset.InputControl<'text'>
        | undefined;
      return ctrl?.value || fallback;
    };
    const getNum = (key: string, fallback: number) => {
      const ctrl = this.controls[key] as
        | ClassicPreset.InputControl<'number'>
        | undefined;
      return ctrl?.value ?? fallback;
    };

    const colorHex = getText('color', '#808080');
    const c = hexToRgb(colorHex);

    const watermarkText = getText('text', 'DRAFT');
    const fontSize = getNum('fontSize', 72);
    const opacity = getNum('opacity', 30) / 100;
    const angle = getNum('angle', -45);

    const positionPresets: Record<string, { x: number; y: number }> = {
      'top-left': { x: 0.15, y: 0.15 },
      top: { x: 0.5, y: 0.15 },
      'top-right': { x: 0.85, y: 0.15 },
      left: { x: 0.15, y: 0.5 },
      center: { x: 0.5, y: 0.5 },
      right: { x: 0.85, y: 0.5 },
      'bottom-left': { x: 0.15, y: 0.85 },
      bottom: { x: 0.5, y: 0.85 },
      'bottom-right': { x: 0.85, y: 0.85 },
    };
    const posKey = getText('position', 'center').trim().toLowerCase();
    const { x, y } = positionPresets[posKey] ?? positionPresets['center'];

    const pagesStr = getText('pages', 'all').trim().toLowerCase();
    const shouldFlatten =
      getText('flatten', 'no').trim().toLowerCase() === 'yes';

    return {
      pdf: await processBatch(pdfInputs, async (input) => {
        const srcDoc = await PDFDocument.load(input.bytes);
        const totalPages = srcDoc.getPageCount();

        const pageIndices =
          pagesStr === 'all' ? undefined : parsePageRange(pagesStr, totalPages);

        let resultBytes = await addTextWatermark(input.bytes, {
          text: watermarkText,
          fontSize,
          color: { r: c.r, g: c.g, b: c.b },
          opacity,
          angle,
          x,
          y: 1 - y,
          pageIndices,
        });

        if (shouldFlatten) {
          const watermarkedPdf = await pdfjsLib.getDocument({
            data: resultBytes.slice(),
          }).promise;
          const flattenedDoc = await PDFDocument.create();
          const renderScale = 2.5;

          for (let i = 1; i <= watermarkedPdf.numPages; i++) {
            const page = await watermarkedPdf.getPage(i);
            const unscaledVP = page.getViewport({ scale: 1 });
            const viewport = page.getViewport({ scale: renderScale });

            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d')!;
            await page.render({ canvasContext: ctx, canvas, viewport }).promise;

            const jpegBytes = await new Promise<ArrayBuffer>(
              (resolve, reject) =>
                canvas.toBlob(
                  (blob) =>
                    blob
                      ? blob.arrayBuffer().then(resolve)
                      : reject(new Error(`Failed to rasterize page ${i}`)),
                  'image/jpeg',
                  0.92
                )
            );

            const image = await flattenedDoc.embedJpg(jpegBytes);
            const newPage = flattenedDoc.addPage([
              unscaledVP.width,
              unscaledVP.height,
            ]);
            newPage.drawImage(image, {
              x: 0,
              y: 0,
              width: unscaledVP.width,
              height: unscaledVP.height,
            });
          }

          resultBytes = new Uint8Array(await flattenedDoc.save());
        }

        const resultDoc = await PDFDocument.load(resultBytes);

        return {
          type: 'pdf',
          document: resultDoc,
          bytes: resultBytes,
          filename: input.filename.replace(/\.pdf$/i, '_watermarked.pdf'),
        };
      }),
    };
  }
}
