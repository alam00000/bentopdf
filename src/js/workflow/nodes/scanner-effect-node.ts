import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, processBatch } from '../types';
import { applyScannerEffect } from '../../utils/image-effects';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import type { ScanSettings } from '../../types/scanner-effect-type';

export class ScannerEffectNode extends BaseWorkflowNode {
  readonly category = 'Edit & Annotate' as const;
  readonly icon = 'ph-scan';
  readonly description = 'Apply scanner simulation effect';

  constructor() {
    super('Scanner Effect');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
    this.addOutput('pdf', new ClassicPreset.Output(pdfSocket, 'Scanned PDF'));
    this.addControl(
      'grayscale',
      new ClassicPreset.InputControl('text', { initial: 'false' })
    );
    this.addControl(
      'border',
      new ClassicPreset.InputControl('text', { initial: 'false' })
    );
    this.addControl(
      'rotation',
      new ClassicPreset.InputControl('number', { initial: 0 })
    );
    this.addControl(
      'rotationVariance',
      new ClassicPreset.InputControl('number', { initial: 0 })
    );
    this.addControl(
      'brightness',
      new ClassicPreset.InputControl('number', { initial: 0 })
    );
    this.addControl(
      'contrast',
      new ClassicPreset.InputControl('number', { initial: 0 })
    );
    this.addControl(
      'blur',
      new ClassicPreset.InputControl('number', { initial: 0 })
    );
    this.addControl(
      'noise',
      new ClassicPreset.InputControl('number', { initial: 10 })
    );
    this.addControl(
      'yellowish',
      new ClassicPreset.InputControl('number', { initial: 0 })
    );
    this.addControl(
      'resolution',
      new ClassicPreset.InputControl('number', { initial: 150 })
    );
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'Scanner Effect');

    const getNum = (key: string, fallback: number) => {
      const ctrl = this.controls[key] as
        | ClassicPreset.InputControl<'number'>
        | undefined;
      return ctrl?.value ?? fallback;
    };

    const getBool = (key: string) => {
      const ctrl = this.controls[key] as
        | ClassicPreset.InputControl<'text'>
        | undefined;
      return ctrl?.value === 'true';
    };

    const settings: ScanSettings = {
      grayscale: getBool('grayscale'),
      border: getBool('border'),
      rotate: getNum('rotation', 0),
      rotateVariance: getNum('rotationVariance', 0),
      brightness: getNum('brightness', 0),
      contrast: getNum('contrast', 0),
      blur: getNum('blur', 0),
      noise: getNum('noise', 10),
      yellowish: getNum('yellowish', 0),
      resolution: getNum('resolution', 150),
    };

    return {
      pdf: await processBatch(pdfInputs, async (input) => {
        const newPdfDoc = await PDFDocument.create();
        const pdfjsDoc = await pdfjsLib.getDocument({ data: input.bytes })
          .promise;
        const dpiScale = settings.resolution / 72;

        for (let i = 1; i <= pdfjsDoc.numPages; i++) {
          const page = await pdfjsDoc.getPage(i);
          const viewport = page.getViewport({ scale: dpiScale });

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
          const baselineCopy = new ImageData(
            new Uint8ClampedArray(baseData.data),
            baseData.width,
            baseData.height
          );

          const outputCanvas = document.createElement('canvas');
          applyScannerEffect(baselineCopy, outputCanvas, settings, 0, dpiScale);

          const jpegBlob = await new Promise<Blob | null>((resolve) =>
            outputCanvas.toBlob(resolve, 'image/jpeg', 0.85)
          );

          if (!jpegBlob) throw new Error(`Failed to render page ${i} to image`);

          const jpegBytes = await jpegBlob.arrayBuffer();
          const jpegImage = await newPdfDoc.embedJpg(jpegBytes);
          const newPage = newPdfDoc.addPage([
            outputCanvas.width,
            outputCanvas.height,
          ]);
          newPage.drawImage(jpegImage, {
            x: 0,
            y: 0,
            width: outputCanvas.width,
            height: outputCanvas.height,
          });
        }

        if (newPdfDoc.getPageCount() === 0)
          throw new Error('No pages were processed');
        const pdfBytes = await newPdfDoc.save();
        return {
          type: 'pdf',
          document: newPdfDoc,
          bytes: new Uint8Array(pdfBytes),
          filename: input.filename.replace(/\.pdf$/i, '_scanned.pdf'),
        };
      }),
    };
  }
}
