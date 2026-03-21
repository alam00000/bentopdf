import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, processBatch } from '../types';
import { PDFDocument, rgb } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { hexToRgb } from '../../utils/helpers.js';

export class CombineSinglePageNode extends BaseWorkflowNode {
  readonly category = 'Organize & Manage' as const;
  readonly icon = 'ph-arrows-out-line-vertical';
  readonly description = 'Stitch all pages into one continuous page';

  constructor() {
    super('Combine to Single Page');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
    this.addOutput('pdf', new ClassicPreset.Output(pdfSocket, 'Combined PDF'));
    this.addControl(
      'orientation',
      new ClassicPreset.InputControl('text', { initial: 'vertical' })
    );
    this.addControl(
      'spacing',
      new ClassicPreset.InputControl('number', { initial: 0 })
    );
    this.addControl(
      'backgroundColor',
      new ClassicPreset.InputControl('text', { initial: '#ffffff' })
    );
    this.addControl(
      'separator',
      new ClassicPreset.InputControl('text', { initial: 'false' })
    );
    this.addControl(
      'separatorThickness',
      new ClassicPreset.InputControl('number', { initial: 0.5 })
    );
    this.addControl(
      'separatorColor',
      new ClassicPreset.InputControl('text', { initial: '#000000' })
    );
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'Combine to Single Page');

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

    const isVertical = getText('orientation', 'vertical') === 'vertical';
    const spacing = Math.max(0, getNum('spacing', 0));
    const bgC = hexToRgb(getText('backgroundColor', '#ffffff'));
    const bgColor = rgb(bgC.r, bgC.g, bgC.b);
    const addSeparator = getText('separator', 'false') === 'true';
    const sepThickness = getNum('separatorThickness', 0.5);
    const sepC = hexToRgb(getText('separatorColor', '#000000'));
    const sepColor = rgb(sepC.r, sepC.g, sepC.b);

    return {
      pdf: await processBatch(pdfInputs, async (input) => {
        const pdfjsDoc = await pdfjsLib.getDocument({ data: input.bytes })
          .promise;
        const newDoc = await PDFDocument.create();

        const pageDims: { width: number; height: number }[] = [];
        for (let i = 1; i <= pdfjsDoc.numPages; i++) {
          const page = await pdfjsDoc.getPage(i);
          const vp = page.getViewport({ scale: 1.0 });
          pageDims.push({ width: vp.width, height: vp.height });
        }

        const maxWidth = Math.max(...pageDims.map((d) => d.width));
        const maxHeight = Math.max(...pageDims.map((d) => d.height));
        const totalSpacing = spacing * (pdfjsDoc.numPages - 1);

        const finalWidth = isVertical
          ? maxWidth
          : pageDims.reduce((sum, d) => sum + d.width, 0) + totalSpacing;
        const finalHeight = isVertical
          ? pageDims.reduce((sum, d) => sum + d.height, 0) + totalSpacing
          : maxHeight;

        const combinedPage = newDoc.addPage([finalWidth, finalHeight]);
        combinedPage.drawRectangle({
          x: 0,
          y: 0,
          width: finalWidth,
          height: finalHeight,
          color: bgColor,
        });

        let offset = isVertical ? finalHeight : 0;

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

          const pngBlob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, 'image/png')
          );
          if (!pngBlob) throw new Error(`Failed to render page ${i} to image`);

          const pngBytes = await pngBlob.arrayBuffer();
          const pngImage = await newDoc.embedPng(pngBytes);
          const dim = pageDims[i - 1];

          if (isVertical) {
            offset -= dim.height;
            combinedPage.drawImage(pngImage, {
              x: 0,
              y: offset,
              width: dim.width,
              height: dim.height,
            });
            if (addSeparator && i < pdfjsDoc.numPages) {
              combinedPage.drawLine({
                start: { x: 0, y: offset - spacing / 2 },
                end: { x: finalWidth, y: offset - spacing / 2 },
                thickness: sepThickness,
                color: sepColor,
              });
            }
            offset -= spacing;
          } else {
            combinedPage.drawImage(pngImage, {
              x: offset,
              y: 0,
              width: dim.width,
              height: dim.height,
            });
            offset += dim.width;
            if (addSeparator && i < pdfjsDoc.numPages) {
              combinedPage.drawLine({
                start: { x: offset + spacing / 2, y: 0 },
                end: { x: offset + spacing / 2, y: finalHeight },
                thickness: sepThickness,
                color: sepColor,
              });
            }
            offset += spacing;
          }
        }

        const pdfBytes = await newDoc.save();
        return {
          type: 'pdf',
          document: newDoc,
          bytes: new Uint8Array(pdfBytes),
          filename: input.filename.replace(/\.pdf$/i, '_combined.pdf'),
        };
      }),
    };
  }
}
