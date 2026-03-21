import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData, MultiPDFData } from '../types';
import { requirePdfInput, extractAllPdfs } from '../types';
import { PDFDocument } from 'pdf-lib';
import { parsePageRange } from '../../utils/pdf-operations';

export class ExtractPagesNode extends BaseWorkflowNode {
  readonly category = 'Organize & Manage' as const;
  readonly icon = 'ph-squares-four';
  readonly description = 'Extract pages as separate PDFs';

  constructor() {
    super('Extract Pages');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
    this.addOutput(
      'pdf',
      new ClassicPreset.Output(pdfSocket, 'Extracted PDFs')
    );
    this.addControl(
      'pages',
      new ClassicPreset.InputControl('text', { initial: '1,2,3' })
    );
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'Extract Pages');
    const allPdfs = extractAllPdfs(pdfInputs);

    const pagesCtrl = this.controls['pages'] as
      | ClassicPreset.InputControl<'text'>
      | undefined;
    const rangeStr = pagesCtrl?.value || '1';

    const allItems = [];
    for (const input of allPdfs) {
      const srcDoc = await PDFDocument.load(input.bytes);
      const totalPages = srcDoc.getPageCount();
      const indices = parsePageRange(rangeStr, totalPages);

      for (const idx of indices) {
        const newPdf = await PDFDocument.create();
        const [copiedPage] = await newPdf.copyPages(srcDoc, [idx]);
        newPdf.addPage(copiedPage);
        const pdfBytes = await newPdf.save();
        allItems.push({
          type: 'pdf' as const,
          document: newPdf,
          bytes: new Uint8Array(pdfBytes),
          filename: `page_${idx + 1}.pdf`,
        });
      }
    }

    if (allItems.length === 1) {
      return { pdf: allItems[0] };
    }

    const result: MultiPDFData = {
      type: 'multi-pdf',
      items: allItems,
    };
    return { pdf: result };
  }
}
