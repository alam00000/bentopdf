import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, extractSinglePdf } from '../types';
import { initializeQpdf } from '../../utils/helpers.js';
import { loadPdfDocument } from '../../utils/load-pdf-document.js';

export class OverlayNode extends BaseWorkflowNode {
  readonly category = 'Organize & Manage' as const;
  readonly icon = 'ph-stack-simple';
  readonly description = 'Overlay or underlay pages from one PDF onto another';

  constructor() {
    super('Overlay');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'Base PDF'));
    this.addInput('overlay', new ClassicPreset.Input(pdfSocket, 'Overlay PDF'));
    this.addOutput('pdf', new ClassicPreset.Output(pdfSocket, 'Result PDF'));
    this.addControl(
      'mode',
      new ClassicPreset.InputControl('text', { initial: 'overlay' })
    );
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const baseInputs = requirePdfInput(inputs, 'Overlay');
    const overlayInputs = inputs['overlay'];
    if (!overlayInputs || overlayInputs.length === 0) {
      throw new Error('Overlay node requires an overlay PDF input.');
    }

    const basePdf = extractSinglePdf(baseInputs[0]);
    const overlayPdf = extractSinglePdf(overlayInputs[0]);

    const modeControl = this.controls[
      'mode'
    ] as ClassicPreset.InputControl<'text'>;
    const mode = modeControl?.value === 'underlay' ? '--underlay' : '--overlay';

    const qpdf = await initializeQpdf();
    const uid = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const inputPath = `/tmp/input_overlay_${uid}.pdf`;
    const overlayPath = `/tmp/overlay_${uid}.pdf`;
    const outputPath = `/tmp/output_overlay_${uid}.pdf`;

    let resultBytes: Uint8Array;
    try {
      qpdf.FS.writeFile(inputPath, basePdf.bytes);
      qpdf.FS.writeFile(overlayPath, overlayPdf.bytes);
      qpdf.callMain([
        inputPath,
        mode,
        overlayPath,
        '--from=',
        '--repeat=1-z',
        '--',
        outputPath,
      ]);
      resultBytes = new Uint8Array(qpdf.FS.readFile(outputPath));
    } finally {
      try {
        qpdf.FS.unlink(inputPath);
      } catch {
        void 0;
      }
      try {
        qpdf.FS.unlink(overlayPath);
      } catch {
        void 0;
      }
      try {
        qpdf.FS.unlink(outputPath);
      } catch {
        void 0;
      }
    }

    const document = await loadPdfDocument(resultBytes);
    const modeLabel = mode.replace('--', '');

    return {
      pdf: {
        type: 'pdf',
        document,
        bytes: resultBytes,
        filename: basePdf.filename.replace(/\.pdf$/i, `_${modeLabel}.pdf`),
      },
    };
  }
}
