import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, processBatch } from '../types';
import { applyColorAdjustments } from '../../utils/image-effects';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import type { AdjustColorsSettings } from '../../types/adjust-colors-type';

export class AdjustColorsNode extends BaseWorkflowNode {
  readonly category = 'Edit & Annotate' as const;
  readonly icon = 'ph-sliders-horizontal';
  readonly description = 'Adjust brightness, contrast, and colors';

  constructor() {
    super('Adjust Colors');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
    this.addOutput('pdf', new ClassicPreset.Output(pdfSocket, 'Adjusted PDF'));
    this.addControl(
      'brightness',
      new ClassicPreset.InputControl('number', { initial: 0 })
    );
    this.addControl(
      'contrast',
      new ClassicPreset.InputControl('number', { initial: 0 })
    );
    this.addControl(
      'saturation',
      new ClassicPreset.InputControl('number', { initial: 0 })
    );
    this.addControl(
      'hueShift',
      new ClassicPreset.InputControl('number', { initial: 0 })
    );
    this.addControl(
      'temperature',
      new ClassicPreset.InputControl('number', { initial: 0 })
    );
    this.addControl(
      'tint',
      new ClassicPreset.InputControl('number', { initial: 0 })
    );
    this.addControl(
      'gamma',
      new ClassicPreset.InputControl('number', { initial: 1.0 })
    );
    this.addControl(
      'sepia',
      new ClassicPreset.InputControl('number', { initial: 0 })
    );
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'Adjust Colors');

    const getNum = (key: string, fallback: number) => {
      const ctrl = this.controls[key] as
        | ClassicPreset.InputControl<'number'>
        | undefined;
      return ctrl?.value ?? fallback;
    };

    const settings: AdjustColorsSettings = {
      brightness: getNum('brightness', 0),
      contrast: getNum('contrast', 0),
      saturation: getNum('saturation', 0),
      hueShift: getNum('hueShift', 0),
      temperature: getNum('temperature', 0),
      tint: getNum('tint', 0),
      gamma: getNum('gamma', 1.0),
      sepia: getNum('sepia', 0),
    };

    return {
      pdf: await processBatch(pdfInputs, async (input) => {
        const newPdfDoc = await PDFDocument.create();
        const pdfjsDoc = await pdfjsLib.getDocument({ data: input.bytes })
          .promise;

        for (let i = 1; i <= pdfjsDoc.numPages; i++) {
          const page = await pdfjsDoc.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 });

          const renderCanvas = document.createElement('canvas');
          renderCanvas.width = viewport.width;
          renderCanvas.height = viewport.height;
          const renderCtx = renderCanvas.getContext('2d');
          if (!renderCtx)
            throw new Error(`Failed to get canvas context for page ${i}`);
          await page.render({
            canvasContext: renderCtx,
            viewport,
            canvas: renderCanvas,
          }).promise;

          const baseData = renderCtx.getImageData(
            0,
            0,
            renderCanvas.width,
            renderCanvas.height
          );
          const outputCanvas = document.createElement('canvas');
          applyColorAdjustments(baseData, outputCanvas, settings);

          const pngBlob = await new Promise<Blob | null>((resolve) =>
            outputCanvas.toBlob(resolve, 'image/png')
          );

          if (!pngBlob) throw new Error(`Failed to render page ${i} to image`);

          const pngBytes = await pngBlob.arrayBuffer();
          const pngImage = await newPdfDoc.embedPng(pngBytes);
          const origViewport = page.getViewport({ scale: 1.0 });
          const newPage = newPdfDoc.addPage([
            origViewport.width,
            origViewport.height,
          ]);
          newPage.drawImage(pngImage, {
            x: 0,
            y: 0,
            width: origViewport.width,
            height: origViewport.height,
          });
        }

        if (newPdfDoc.getPageCount() === 0)
          throw new Error('No pages were processed');
        const pdfBytes = await newPdfDoc.save();
        return {
          type: 'pdf',
          document: newPdfDoc,
          bytes: new Uint8Array(pdfBytes),
          filename: input.filename.replace(/\.pdf$/i, '_adjusted.pdf'),
        };
      }),
    };
  }
}
