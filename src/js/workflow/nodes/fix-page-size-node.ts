import { ClassicPreset } from 'rete';
import { BaseWorkflowNode } from './base-node';
import { pdfSocket } from '../sockets';
import type { SocketData } from '../types';
import { requirePdfInput, processBatch } from '../types';
import { fixPageSize } from '../../utils/pdf-operations';
import { PDFDocument } from 'pdf-lib';
import { hexToRgb } from '../../utils/helpers.js';

export class FixPageSizeNode extends BaseWorkflowNode {
  readonly category = 'Organize & Manage' as const;
  readonly icon = 'ph-frame-corners';
  readonly description = 'Standardize all pages to a target size';

  constructor() {
    super('Fix Page Size');
    this.addInput('pdf', new ClassicPreset.Input(pdfSocket, 'PDF'));
    this.addOutput(
      'pdf',
      new ClassicPreset.Output(pdfSocket, 'Standardized PDF')
    );
    this.addControl(
      'targetSize',
      new ClassicPreset.InputControl('text', { initial: 'A4' })
    );
    this.addControl(
      'orientation',
      new ClassicPreset.InputControl('text', { initial: 'auto' })
    );
    this.addControl(
      'scalingMode',
      new ClassicPreset.InputControl('text', { initial: 'fit' })
    );
    this.addControl(
      'backgroundColor',
      new ClassicPreset.InputControl('text', { initial: '#ffffff' })
    );
    this.addControl(
      'customWidth',
      new ClassicPreset.InputControl('number', { initial: 210 })
    );
    this.addControl(
      'customHeight',
      new ClassicPreset.InputControl('number', { initial: 297 })
    );
    this.addControl(
      'customUnits',
      new ClassicPreset.InputControl('text', { initial: 'mm' })
    );
  }

  async data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>> {
    const pdfInputs = requirePdfInput(inputs, 'Fix Page Size');

    const getText = (key: string, fallback: string) => {
      const ctrl = this.controls[key] as
        | ClassicPreset.InputControl<'text'>
        | undefined;
      return (ctrl?.value || fallback).trim();
    };

    const getNum = (key: string, fallback: number) => {
      const ctrl = this.controls[key] as
        | ClassicPreset.InputControl<'number'>
        | undefined;
      const value = ctrl?.value;
      return Number.isFinite(value) ? (value as number) : fallback;
    };

    const targetSize = getText('targetSize', 'A4');
    const orientation = getText('orientation', 'auto');
    const scalingMode = getText('scalingMode', 'fit');
    const backgroundHex = getText('backgroundColor', '#ffffff');
    const customWidth = Math.max(1, getNum('customWidth', 210));
    const customHeight = Math.max(1, getNum('customHeight', 297));
    const customUnits = getText('customUnits', 'mm');
    const backgroundColor = hexToRgb(backgroundHex);

    return {
      pdf: await processBatch(pdfInputs, async (input) => {
        const resultBytes = await fixPageSize(input.bytes, {
          targetSize,
          orientation,
          scalingMode,
          backgroundColor,
          customWidth,
          customHeight,
          customUnits,
        });

        const resultDoc = await PDFDocument.load(resultBytes);

        return {
          type: 'pdf',
          document: resultDoc,
          bytes: resultBytes,
          filename: input.filename.replace(/\.pdf$/i, '_standardized.pdf'),
        };
      }),
    };
  }
}
