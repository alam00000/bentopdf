import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, extractAllPdfs } from '../types';
import { downloadFile } from '../../utils/helpers.js';
import { loadPyMuPDF } from '../../utils/pymupdf-loader.js';

export class ExtractImagesNode extends BaseWorkflowNode {
  readonly category = 'Output' as const;
  readonly icon = 'ph-download-simple';
  readonly description = 'Extract all images from PDF';

  constructor() {
    super('Extract Images');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'Extract Images');
    const allPdfs = extractAllPdfs(pdfInputs);
    const pymupdf = await loadPyMuPDF();

    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    let totalImages = 0;

    for (const pdf of allPdfs) {
      const blob = new Blob([new Uint8Array(pdf.bytes)], {
        type: 'application/pdf',
      });
      const doc = await pymupdf.open(blob);
      const pageCount = doc.pageCount;
      const prefix =
        allPdfs.length > 1 ? pdf.filename.replace(/\.pdf$/i, '') + '/' : '';

      for (let pageIdx = 0; pageIdx < pageCount; pageIdx++) {
        const page = doc.getPage(pageIdx);
        const images = page.getImages();

        for (const imgInfo of images) {
          try {
            const imgData = page.extractImage(imgInfo.xref);
            if (imgData && imgData.data) {
              totalImages++;
              zip.file(
                `${prefix}image_${totalImages}.${imgData.ext || 'png'}`,
                imgData.data
              );
            }
          } catch {
            continue;
          }
        }
      }
      doc.close();
    }

    if (totalImages === 0) {
      throw new Error('No images found in any of the connected PDFs');
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadFile(zipBlob, 'extracted_images.zip');

    return {};
  }
}
