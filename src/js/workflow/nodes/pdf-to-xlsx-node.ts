import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, extractAllPdfs } from '../types';
import { downloadFile } from '../../utils/helpers.js';
import { loadPyMuPDF } from '../../utils/pymupdf-loader.js';

export class PdfToXlsxNode extends BaseWorkflowNode {
  readonly category = 'Output' as const;
  readonly icon = 'ph-microsoft-excel-logo';
  readonly description = 'Extract tables from PDF to Excel';

  constructor() {
    super('PDF to Excel');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
  }

  private async convertToXlsx(
    bytes: Uint8Array,
    filename: string
  ): Promise<{ blob: Blob; name: string }> {
    const pymupdf = await loadPyMuPDF();
    const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
    const doc = await pymupdf.open(blob);

    interface TableData {
      page: number;
      rows: (string | null)[][];
    }

    const allTables: TableData[] = [];

    try {
      const pageCount = doc.pageCount;
      for (let i = 0; i < pageCount; i++) {
        const page = doc.getPage(i);
        const tables = page.findTables();
        tables.forEach((table: any) => {
          allTables.push({ page: i + 1, rows: table.rows });
        });
      }
    } finally {
      doc.close();
    }

    if (allTables.length === 0) {
      throw new Error(`No tables found in ${filename}`);
    }

    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();

    if (allTables.length === 1) {
      const ws = XLSX.utils.aoa_to_sheet(allTables[0].rows);
      XLSX.utils.book_append_sheet(wb, ws, 'Table');
    } else {
      allTables.forEach((table, idx) => {
        const sheetName = `Table ${idx + 1} (Page ${table.page})`.substring(
          0,
          31
        );
        const ws = XLSX.utils.aoa_to_sheet(table.rows);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      });
    }

    const xlsxBytes = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const xlsxBlob = new Blob([xlsxBytes], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const name = filename.replace(/\.pdf$/i, '') + '.xlsx';
    return { blob: xlsxBlob, name };
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'PDF to Excel');
    const allPdfs = extractAllPdfs(pdfInputs);

    if (allPdfs.length === 1) {
      const { blob, name } = await this.convertToXlsx(
        allPdfs[0].bytes,
        allPdfs[0].filename
      );
      downloadFile(blob, name);
    } else {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      for (const pdf of allPdfs) {
        const { blob, name } = await this.convertToXlsx(
          pdf.bytes,
          pdf.filename
        );
        zip.file(name, blob);
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadFile(zipBlob, 'xlsx_files.zip');
    }

    return {};
  }
}
