import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, processBatch } from '../types';
import { PDFDocument } from 'pdf-lib';
import { initializeQpdf } from '../../utils/helpers.js';

export class EncryptNode extends BaseWorkflowNode {
  readonly category = 'Secure PDF' as const;
  readonly icon = 'ph-lock';
  readonly description = 'Encrypt PDF with password';

  constructor() {
    super('Encrypt');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
    this.addOutput('pdf', new ClassicPreset.Output(pdfSocket, 'Encrypted PDF'));
    this.addControl(
      'userPassword',
      new ClassicPreset.InputControl('text', { initial: '' })
    );
    this.addControl(
      'ownerPassword',
      new ClassicPreset.InputControl('text', { initial: '' })
    );
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'Encrypt');

    const getText = (key: string) => {
      const ctrl = this.controls[key] as
        | ClassicPreset.InputControl<'text'>
        | undefined;
      return ctrl?.value || '';
    };

    const userPassword = getText('userPassword');
    const ownerPassword = getText('ownerPassword') || userPassword;
    if (!userPassword)
      throw new Error('User password is required for encryption');

    return {
      pdf: await processBatch(pdfInputs, async (input) => {
        const qpdf = await initializeQpdf();
        const uid = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        const inputPath = `/tmp/input_encrypt_${uid}.pdf`;
        const outputPath = `/tmp/output_encrypt_${uid}.pdf`;

        let encryptedData: Uint8Array;
        try {
          qpdf.FS.writeFile(inputPath, input.bytes);

          const args = [
            inputPath,
            '--encrypt',
            userPassword,
            ownerPassword,
            '256',
          ];
          if (ownerPassword !== userPassword) {
            args.push(
              '--modify=none',
              '--extract=n',
              '--print=none',
              '--accessibility=n',
              '--annotate=n',
              '--assemble=n',
              '--form=n',
              '--modify-other=n'
            );
          }
          args.push('--', outputPath);
          qpdf.callMain(args);

          encryptedData = qpdf.FS.readFile(outputPath, { encoding: 'binary' });
        } finally {
          try {
            qpdf.FS.unlink(inputPath);
          } catch {
            /* cleanup */
          }
          try {
            qpdf.FS.unlink(outputPath);
          } catch {
            /* cleanup */
          }
        }

        const resultBytes = new Uint8Array(encryptedData);
        const document = await PDFDocument.load(resultBytes, {
          ignoreEncryption: true,
        });

        return {
          type: 'pdf',
          document,
          bytes: resultBytes,
          filename: input.filename.replace(/\.pdf$/i, '_encrypted.pdf'),
        };
      }),
    };
  }
}
