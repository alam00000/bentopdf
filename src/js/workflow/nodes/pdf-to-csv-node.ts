import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, extractAllPdfs } from '../types';
import { downloadFile } from '../../utils/helpers.js';
import { loadPyMuPDF } from '../../utils/pymupdf-loader.js';

function tableToCsv(rows: (string | null)[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const str = String(cell ?? '');
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(',')
    )
    .join('\n');
}

export class PdfToCsvNode extends BaseWorkflowNode {
  readonly category = 'Output' as const;
  readonly icon = 'ph-file-csv';
  readonly description = 'Extract tables from PDF to CSV';

  constructor() {
    super('PDF to CSV');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
  }

  private async extractTables(bytes: Uint8Array): Promise<(string | null)[][]> {
    const pymupdf = await loadPyMuPDF();
    const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
    const doc = await pymupdf.open(blob);
    const allRows: (string | null)[][] = [];

    try {
      const pageCount = doc.pageCount;
      for (let i = 0; i < pageCount; i++) {
        const page = doc.getPage(i);
        const tables = page.findTables();
        tables.forEach((table: any) => {
          allRows.push(...table.rows);
        });
      }
    } finally {
      doc.close();
    }

    return allRows;
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'PDF to CSV');
    const allPdfs = extractAllPdfs(pdfInputs);

    if (allPdfs.length === 1) {
      const allRows = await this.extractTables(allPdfs[0].bytes);
      if (allRows.length === 0) {
        throw new Error('No tables found in PDF');
      }
      const csv = tableToCsv(allRows);
      const csvBlob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const name = allPdfs[0].filename.replace(/\.pdf$/i, '') + '.csv';
      downloadFile(csvBlob, name);
    } else {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      for (const pdf of allPdfs) {
        const allRows = await this.extractTables(pdf.bytes);
        if (allRows.length === 0) continue;
        const csv = tableToCsv(allRows);
        const name = pdf.filename.replace(/\.pdf$/i, '') + '.csv';
        zip.file(name, csv);
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadFile(zipBlob, 'csv_files.zip');
    }

    return {};
  }
}
