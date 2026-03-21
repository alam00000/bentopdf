import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData, PDFData } from '../types';
import { requirePdfInput, extractAllPdfs } from '../types';
import { downloadFile } from '../../utils/helpers.js';
import * as pdfjsLib from 'pdfjs-dist';
import { loadPyMuPDF } from '../../utils/pymupdf-loader.js';

export class PdfToImagesNode extends BaseWorkflowNode {
  readonly category = 'Output' as const;
  readonly icon = 'ph-file-image';
  readonly description = 'Convert PDF pages to images (ZIP)';

  constructor() {
    super('PDF to Images');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
    this.addControl(
      'format',
      new ClassicPreset.InputControl('text', { initial: 'jpg' })
    );
    this.addControl(
      'quality',
      new ClassicPreset.InputControl('number', { initial: 90 })
    );
    this.addControl(
      'dpi',
      new ClassicPreset.InputControl('number', { initial: 150 })
    );
  }

  private async addPdfPages(
    pdf: PDFData,
    zip: any,
    format: string,
    mimeType: string,
    quality: number,
    scale: number,
    prefix: string
  ): Promise<void> {
    const pdfjsDoc = await pdfjsLib.getDocument({ data: pdf.bytes }).promise;
    for (let i = 1; i <= pdfjsDoc.numPages; i++) {
      const page = await pdfjsDoc.getPage(i);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d')!;
      await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, mimeType, quality)
      );
      // Release canvas memory
      canvas.width = 0;
      canvas.height = 0;
      if (blob) {
        zip.file(`${prefix}page_${i}.${format}`, blob);
      }
    }
  }

  private async addPdfPagesAsSvg(allPdfs: PDFData[], zip: any): Promise<void> {
    const pymupdf = await loadPyMuPDF();
    for (const pdf of allPdfs) {
      const blob = new Blob([new Uint8Array(pdf.bytes)], {
        type: 'application/pdf',
      });
      const doc = await pymupdf.open(blob);
      try {
        const pageCount = doc.pageCount;
        const prefix =
          allPdfs.length > 1 ? pdf.filename.replace(/\.pdf$/i, '') + '/' : '';
        for (let i = 0; i < pageCount; i++) {
          const page = doc.getPage(i);
          const svg = page.toSvg();
          zip.file(`${prefix}page_${i + 1}.svg`, svg);
        }
      } finally {
        doc.close();
      }
    }
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'PDF to Images');
    const allPdfs = extractAllPdfs(pdfInputs);

    const fmtCtrl = this.controls['format'] as
      | ClassicPreset.InputControl<'text'>
      | undefined;
    const format = ['jpg', 'png', 'webp', 'svg'].includes(fmtCtrl?.value ?? '')
      ? (fmtCtrl?.value ?? 'jpg')
      : 'jpg';

    const qualCtrl = this.controls['quality'] as
      | ClassicPreset.InputControl<'number'>
      | undefined;
    const quality = Math.max(10, Math.min(100, qualCtrl?.value ?? 90)) / 100;

    const dpiCtrl = this.controls['dpi'] as
      | ClassicPreset.InputControl<'number'>
      | undefined;
    const dpi = Math.max(72, Math.min(600, dpiCtrl?.value ?? 150));
    const scale = dpi / 72;

    const mimeMap: Record<string, string> = {
      jpg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
    };
    const mimeType = mimeMap[format] || 'image/jpeg';

    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    if (format === 'svg') {
      await this.addPdfPagesAsSvg(allPdfs, zip);
    } else if (allPdfs.length === 1) {
      await this.addPdfPages(
        allPdfs[0],
        zip,
        format,
        mimeType,
        quality,
        scale,
        ''
      );
    } else {
      for (const pdf of allPdfs) {
        const prefix = pdf.filename.replace(/\.pdf$/i, '') + '/';
        await this.addPdfPages(
          pdf,
          zip,
          format,
          mimeType,
          quality,
          scale,
          prefix
        );
      }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadFile(zipBlob, 'images.zip');

    return {};
  }
}
