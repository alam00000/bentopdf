import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { PDFData, SocketData, MultiPDFData } from '../types';
import { PDFDocument } from 'pdf-lib';
import { parseEmailFile, renderEmailToHtml } from '../../logic/email-to-pdf.js';
import { loadPyMuPDF } from '../../utils/pymupdf-loader.js';

export class EmailToPdfNode extends BaseWorkflowNode {
  readonly category = 'Input' as const;
  readonly icon = 'ph-envelope';
  readonly description = 'Upload email files (.eml, .msg) and convert to PDF';

  private files: File[] = [];

  constructor() {
    super('Email Input');
    this.addOutput('pdf', new ClassicPreset.Output(pdfSocket, 'PDF'));
    this.addControl(
      'pageSize',
      new ClassicPreset.InputControl('text', { initial: 'a4' })
    );
    this.addControl(
      'includeCcBcc',
      new ClassicPreset.InputControl('text', { initial: 'true' })
    );
    this.addControl(
      'includeAttachments',
      new ClassicPreset.InputControl('text', { initial: 'true' })
    );
  }

  async addFiles(fileList: File[]): Promise<void> {
    for (const file of fileList) {
      const name = file.name.toLowerCase();
      if (name.endsWith('.eml') || name.endsWith('.msg')) {
        this.files.push(file);
      }
    }
  }

  removeFile(index: number): void {
    this.files.splice(index, 1);
  }
  hasFile(): boolean {
    return this.files.length > 0;
  }
  getFileCount(): number {
    return this.files.length;
  }
  getFilenames(): string[] {
    return this.files.map((f) => f.name);
  }
  getFilename(): string {
    if (this.files.length === 0) return '';
    if (this.files.length === 1) return this.files[0].name;
    return `${this.files.length} email files`;
  }

  async data(
    _inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    if (this.files.length === 0)
      throw new Error('No email files uploaded in Email Input node');

    const pageSizeCtrl = this.controls['pageSize'] as
      | ClassicPreset.InputControl<'text'>
      | undefined;
    const ccBccCtrl = this.controls['includeCcBcc'] as
      | ClassicPreset.InputControl<'text'>
      | undefined;
    const attachCtrl = this.controls['includeAttachments'] as
      | ClassicPreset.InputControl<'text'>
      | undefined;

    const pageSize = (pageSizeCtrl?.value ?? 'a4') as 'a4' | 'letter' | 'legal';
    const includeCcBcc = (ccBccCtrl?.value ?? 'true') === 'true';
    const includeAttachments = (attachCtrl?.value ?? 'true') === 'true';

    const pymupdf = await loadPyMuPDF();
    const results: PDFData[] = [];
    for (const file of this.files) {
      const email = await parseEmailFile(file);
      const htmlContent = renderEmailToHtml(email, {
        includeCcBcc,
        includeAttachments,
        pageSize,
      });

      const pdfBlob = await (pymupdf as any).htmlToPdf(htmlContent, {
        pageSize,
        margins: { top: 50, right: 50, bottom: 50, left: 50 },
        attachments: email.attachments
          .filter((a) => a.content)
          .map((a) => ({
            filename: a.filename,
            content: a.content!,
          })),
      });

      const bytes = new Uint8Array(await pdfBlob.arrayBuffer());
      const document = await PDFDocument.load(bytes);
      results.push({
        type: 'pdf',
        document,
        bytes,
        filename: file.name.replace(/\.[^.]+$/, '.pdf'),
      });
    }

    if (results.length === 1) return { pdf: results[0] };
    return { pdf: { type: 'multi-pdf', items: results } as MultiPDFData };
  }
}
