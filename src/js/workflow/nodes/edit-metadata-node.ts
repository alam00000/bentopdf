import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, processBatch } from '../types';
import { PDFDocument } from 'pdf-lib';

export class EditMetadataNode extends BaseWorkflowNode {
  readonly category = 'Organize & Manage' as const;
  readonly icon = 'ph-file-code';
  readonly description = 'Edit PDF metadata';

  constructor() {
    super('Edit Metadata');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
    this.addOutput('pdf', new ClassicPreset.Output(pdfSocket, 'PDF'));
    this.addControl(
      'title',
      new ClassicPreset.InputControl('text', { initial: '' })
    );
    this.addControl(
      'author',
      new ClassicPreset.InputControl('text', { initial: '' })
    );
    this.addControl(
      'subject',
      new ClassicPreset.InputControl('text', { initial: '' })
    );
    this.addControl(
      'keywords',
      new ClassicPreset.InputControl('text', { initial: '' })
    );
    this.addControl(
      'creator',
      new ClassicPreset.InputControl('text', { initial: '' })
    );
    this.addControl(
      'producer',
      new ClassicPreset.InputControl('text', { initial: '' })
    );
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'Edit Metadata');

    const getText = (key: string) => {
      const ctrl = this.controls[key] as
        | ClassicPreset.InputControl<'text'>
        | undefined;
      return ctrl?.value || '';
    };

    const title = getText('title');
    const author = getText('author');
    const subject = getText('subject');
    const keywords = getText('keywords');
    const creator = getText('creator');
    const producer = getText('producer');

    return {
      pdf: await processBatch(pdfInputs, async (input) => {
        const pdfDoc = await PDFDocument.load(input.bytes);

        if (title) pdfDoc.setTitle(title);
        if (author) pdfDoc.setAuthor(author);
        if (subject) pdfDoc.setSubject(subject);
        if (keywords)
          pdfDoc.setKeywords(
            keywords
              .split(',')
              .map((k) => k.trim())
              .filter(Boolean)
          );
        if (creator) pdfDoc.setCreator(creator);
        if (producer) pdfDoc.setProducer(producer);
        pdfDoc.setModificationDate(new Date());

        const pdfBytes = await pdfDoc.save();
        return {
          type: 'pdf',
          document: pdfDoc,
          bytes: new Uint8Array(pdfBytes),
          filename: input.filename.replace(/\.pdf$/i, '_metadata.pdf'),
        };
      }),
    };
  }
}
