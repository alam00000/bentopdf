import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { PDFData, SocketData, MultiPDFData } from '../types';
import { PDFDocument } from 'pdf-lib';
import { loadPyMuPDF } from '../../utils/pymupdf-loader.js';

export class TextToPdfNode extends BaseWorkflowNode {
  readonly category = 'Input' as const;
  readonly icon = 'ph-text-t';
  readonly description = 'Upload text file and convert to PDF';

  private files: File[] = [];

  constructor() {
    super('Text Input');
    this.addOutput('pdf', new ClassicPreset.Output(pdfSocket, 'PDF'));
    this.addControl(
      'fontSize',
      new ClassicPreset.InputControl('number', { initial: 12 })
    );
    this.addControl(
      'fontFamily',
      new ClassicPreset.InputControl('text', { initial: 'helv' })
    );
    this.addControl(
      'fontColor',
      new ClassicPreset.InputControl('text', { initial: '#000000' })
    );
  }

  async addFiles(fileList: File[]): Promise<void> {
    for (const file of fileList) {
      if (file.name.endsWith('.txt') || file.type === 'text/plain') {
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
    return `${this.files.length} text files`;
  }

  async data(
    _inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    if (this.files.length === 0)
      throw new Error('No text files uploaded in Text Input node');

    const fontSizeCtrl = this.controls['fontSize'] as
      | ClassicPreset.InputControl<'number'>
      | undefined;
    const fontSize = fontSizeCtrl?.value ?? 12;
    const fontFamilyCtrl = this.controls['fontFamily'] as
      | ClassicPreset.InputControl<'text'>
      | undefined;
    const fontName = (fontFamilyCtrl?.value ?? 'helv') as
      | 'helv'
      | 'tiro'
      | 'cour'
      | 'times';
    const fontColorCtrl = this.controls['fontColor'] as
      | ClassicPreset.InputControl<'text'>
      | undefined;
    const textColor = fontColorCtrl?.value ?? '#000000';

    const pymupdf = await loadPyMuPDF();
    const results: PDFData[] = [];
    for (const file of this.files) {
      const textContent = await file.text();
      const pdfBlob = await pymupdf.textToPdf(textContent, {
        fontSize,
        fontName,
        textColor,
        pageSize: 'a4',
      });
      const bytes = new Uint8Array(await pdfBlob.arrayBuffer());
      const pdfDoc = await PDFDocument.load(bytes);
      results.push({
        type: 'pdf',
        document: pdfDoc,
        bytes,
        filename: file.name.replace(/\.[^.]+$/, '.pdf'),
      });
    }

    if (results.length === 1) return { pdf: results[0] };
    return { pdf: { type: 'multi-pdf', items: results } as MultiPDFData };
  }
}
