import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, processBatch } from '../types';
import { PDFDocument } from 'pdf-lib';
import { WasmProvider } from '../../utils/wasm-provider.js';

export class TableOfContentsNode extends BaseWorkflowNode {
  readonly category = 'Organize & Manage' as const;
  readonly icon = 'ph-list';
  readonly description = 'Generate table of contents from bookmarks';

  constructor() {
    super('Table of Contents');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
    this.addOutput('pdf', new ClassicPreset.Output(pdfSocket, 'PDF with TOC'));
    this.addControl(
      'title',
      new ClassicPreset.InputControl('text', { initial: 'Table of Contents' })
    );
    this.addControl(
      'fontSize',
      new ClassicPreset.InputControl('number', { initial: 12 })
    );
    this.addControl(
      'fontFamily',
      new ClassicPreset.InputControl('number', { initial: 0 })
    );
    this.addControl(
      'addBookmark',
      new ClassicPreset.InputControl('text', { initial: 'true' })
    );
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'Table of Contents');

    const titleCtrl = this.controls['title'] as
      | ClassicPreset.InputControl<'text'>
      | undefined;
    const fontSizeCtrl = this.controls['fontSize'] as
      | ClassicPreset.InputControl<'number'>
      | undefined;
    const fontFamilyCtrl = this.controls['fontFamily'] as
      | ClassicPreset.InputControl<'number'>
      | undefined;
    const addBookmarkCtrl = this.controls['addBookmark'] as
      | ClassicPreset.InputControl<'text'>
      | undefined;

    const title = titleCtrl?.value ?? 'Table of Contents';
    const fontSize = fontSizeCtrl?.value ?? 12;
    const fontFamily = fontFamilyCtrl?.value ?? 0;
    const addBookmark = (addBookmarkCtrl?.value ?? 'true') === 'true';

    const cpdfUrl = WasmProvider.getUrl('cpdf');
    if (!cpdfUrl)
      throw new Error(
        'CoherentPDF is not configured. Please configure it in Advanced Settings.'
      );

    return {
      pdf: await processBatch(pdfInputs, async (input) => {
        const resultBytes = await new Promise<Uint8Array>((resolve, reject) => {
          const worker = new Worker(
            import.meta.env.BASE_URL + 'workers/table-of-contents.worker.js'
          );

          worker.onmessage = (e: MessageEvent) => {
            worker.terminate();
            if (e.data.status === 'success') {
              resolve(new Uint8Array(e.data.pdfBytes));
            } else {
              reject(
                new Error(
                  e.data.message || 'Failed to generate table of contents'
                )
              );
            }
          };

          worker.onerror = (err) => {
            worker.terminate();
            reject(new Error('Worker error: ' + err.message));
          };

          const arrayBuffer = input.bytes.buffer.slice(
            input.bytes.byteOffset,
            input.bytes.byteOffset + input.bytes.byteLength
          );

          worker.postMessage(
            {
              command: 'generate-toc',
              pdfData: arrayBuffer,
              title,
              fontSize,
              fontFamily,
              addBookmark,
              cpdfUrl: cpdfUrl + 'coherentpdf.browser.min.js',
            },
            [arrayBuffer]
          );
        });

        const bytes = new Uint8Array(resultBytes);
        const document = await PDFDocument.load(bytes);

        return {
          type: 'pdf',
          document,
          bytes,
          filename: input.filename.replace(/\.pdf$/i, '_toc.pdf'),
        };
      }),
    };
  }
}
