import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, processBatch } from '../types';
import { PDFDocument } from 'pdf-lib';
import {
  signPdf,
  parsePfxFile,
  parseCombinedPem,
} from '../../logic/digital-sign-pdf.js';
import type { CertificateData } from '@/types';

export class DigitalSignNode extends BaseWorkflowNode {
  readonly category = 'Secure PDF' as const;
  readonly icon = 'ph-certificate';
  readonly description = 'Apply a digital signature to PDF';

  private certFile: File | null = null;
  private certData: CertificateData | null = null;
  private certPassword: string = '';

  constructor() {
    super('Digital Sign');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
    this.addOutput('pdf', new ClassicPreset.Output(pdfSocket, 'Signed PDF'));
    this.addControl(
      'reason',
      new ClassicPreset.InputControl('text', { initial: '' })
    );
    this.addControl(
      'location',
      new ClassicPreset.InputControl('text', { initial: '' })
    );
    this.addControl(
      'contactInfo',
      new ClassicPreset.InputControl('text', { initial: '' })
    );
  }

  setCertFile(file: File): void {
    this.certFile = file;
    this.certData = null;
  }

  getCertFilename(): string {
    return this.certFile?.name ?? '';
  }

  hasCert(): boolean {
    return this.certData !== null;
  }

  hasCertFile(): boolean {
    return this.certFile !== null;
  }

  removeCert(): void {
    this.certFile = null;
    this.certData = null;
    this.certPassword = '';
  }

  async unlockCert(password: string): Promise<boolean> {
    if (!this.certFile) return false;
    this.certPassword = password;

    try {
      const isPem = this.certFile.name.toLowerCase().endsWith('.pem');
      if (isPem) {
        const pemContent = await this.certFile.text();
        this.certData = parseCombinedPem(pemContent, password || undefined);
      } else {
        const certBytes = await this.certFile.arrayBuffer();
        this.certData = parsePfxFile(certBytes, password);
      }
      return true;
    } catch {
      this.certData = null;
      return false;
    }
  }

  needsPassword(): boolean {
    return this.certFile !== null && this.certData === null;
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'Digital Sign');
    if (!this.certData)
      throw new Error('No certificate loaded in Digital Sign node');

    const reasonCtrl = this.controls['reason'] as
      | ClassicPreset.InputControl<'text'>
      | undefined;
    const locationCtrl = this.controls['location'] as
      | ClassicPreset.InputControl<'text'>
      | undefined;
    const contactCtrl = this.controls['contactInfo'] as
      | ClassicPreset.InputControl<'text'>
      | undefined;

    const reason = reasonCtrl?.value ?? '';
    const location = locationCtrl?.value ?? '';
    const contactInfo = contactCtrl?.value ?? '';

    return {
      pdf: await processBatch(pdfInputs, async (input) => {
        const signedBytes = await signPdf(input.bytes, this.certData!, {
          signatureInfo: {
            ...(reason ? { reason } : {}),
            ...(location ? { location } : {}),
            ...(contactInfo ? { contactInfo } : {}),
          },
        });

        const bytes = new Uint8Array(signedBytes);
        const document = await PDFDocument.load(bytes);

        return {
          type: 'pdf',
          document,
          bytes,
          filename: input.filename.replace(/\.pdf$/i, '_signed.pdf'),
        };
      }),
    };
  }
}
