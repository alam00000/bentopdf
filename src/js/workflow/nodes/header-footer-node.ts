import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, processBatch } from '../types';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { hexToRgb } from '../../utils/helpers.js';

export class HeaderFooterNode extends BaseWorkflowNode {
  readonly category = 'Edit & Annotate' as const;
  readonly icon = 'ph-paragraph';
  readonly description = 'Add header and footer text';

  constructor() {
    super('Header & Footer');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
    this.addOutput(
      'pdf',
      new ClassicPreset.Output(pdfSocket, 'PDF with Header/Footer')
    );
    this.addControl(
      'headerLeft',
      new ClassicPreset.InputControl('text', { initial: '' })
    );
    this.addControl(
      'headerCenter',
      new ClassicPreset.InputControl('text', { initial: '' })
    );
    this.addControl(
      'headerRight',
      new ClassicPreset.InputControl('text', { initial: '' })
    );
    this.addControl(
      'footerLeft',
      new ClassicPreset.InputControl('text', { initial: '' })
    );
    this.addControl(
      'footerCenter',
      new ClassicPreset.InputControl('text', {
        initial: 'Page {page} of {total}',
      })
    );
    this.addControl(
      'footerRight',
      new ClassicPreset.InputControl('text', { initial: '' })
    );
    this.addControl(
      'fontSize',
      new ClassicPreset.InputControl('number', { initial: 10 })
    );
    this.addControl(
      'color',
      new ClassicPreset.InputControl('text', { initial: '#000000' })
    );
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'Header & Footer');

    const getText = (key: string) => {
      const ctrl = this.controls[key] as
        | ClassicPreset.InputControl<'text'>
        | undefined;
      return ctrl?.value || '';
    };
    const sizeCtrl = this.controls['fontSize'] as
      | ClassicPreset.InputControl<'number'>
      | undefined;
    const fontSize = Math.max(4, Math.min(72, sizeCtrl?.value ?? 10));

    const colorHex = getText('color') || '#000000';
    const c = hexToRgb(colorHex);
    const color = rgb(c.r, c.g, c.b);

    const fields = {
      headerLeft: getText('headerLeft'),
      headerCenter: getText('headerCenter'),
      headerRight: getText('headerRight'),
      footerLeft: getText('footerLeft'),
      footerCenter: getText('footerCenter'),
      footerRight: getText('footerRight'),
    };

    const hasAny = Object.values(fields).some((v) => v.length > 0);

    return {
      pdf: await processBatch(pdfInputs, async (input) => {
        if (!hasAny) return input;

        const pdfDoc = await PDFDocument.load(input.bytes);
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const pages = pdfDoc.getPages();
        const totalPages = pages.length;
        const margin = 36;

        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          const { width, height } = page.getSize();
          const pageNum = i + 1;

          const processText = (tmpl: string) =>
            tmpl
              .replace(/{page}/g, String(pageNum))
              .replace(/{total}/g, String(totalPages));

          const drawOpts = { size: fontSize, font, color };

          if (fields.headerLeft) {
            page.drawText(processText(fields.headerLeft), {
              ...drawOpts,
              x: margin,
              y: height - margin,
            });
          }
          if (fields.headerCenter) {
            const text = processText(fields.headerCenter);
            const tw = font.widthOfTextAtSize(text, fontSize);
            page.drawText(text, {
              ...drawOpts,
              x: (width - tw) / 2,
              y: height - margin,
            });
          }
          if (fields.headerRight) {
            const text = processText(fields.headerRight);
            const tw = font.widthOfTextAtSize(text, fontSize);
            page.drawText(text, {
              ...drawOpts,
              x: width - margin - tw,
              y: height - margin,
            });
          }
          if (fields.footerLeft) {
            page.drawText(processText(fields.footerLeft), {
              ...drawOpts,
              x: margin,
              y: margin - fontSize,
            });
          }
          if (fields.footerCenter) {
            const text = processText(fields.footerCenter);
            const tw = font.widthOfTextAtSize(text, fontSize);
            page.drawText(text, {
              ...drawOpts,
              x: (width - tw) / 2,
              y: margin - fontSize,
            });
          }
          if (fields.footerRight) {
            const text = processText(fields.footerRight);
            const tw = font.widthOfTextAtSize(text, fontSize);
            page.drawText(text, {
              ...drawOpts,
              x: width - margin - tw,
              y: margin - fontSize,
            });
          }
        }

        const pdfBytes = await pdfDoc.save();
        return {
          type: 'pdf',
          document: pdfDoc,
          bytes: new Uint8Array(pdfBytes),
          filename: input.filename.replace(/\.pdf$/i, '_hf.pdf'),
        };
      }),
    };
  }
}
