import type { PDFDocument } from 'pdf-lib';

export interface PDFData {
  type: 'pdf';
  document: PDFDocument;
  bytes: Uint8Array;
  filename: string;
}

export interface ImageData {
  type: 'image';
  blob: Blob;
  filename: string;
}

export interface MultiPDFData {
  type: 'multi-pdf';
  items: PDFData[];
}

export type SocketData = PDFData | ImageData | MultiPDFData;

function clonePdf(pdf: PDFData): PDFData {
  return { ...pdf, bytes: pdf.bytes.slice() };
}

export function extractSinglePdf(input: SocketData): PDFData {
  if (input.type === 'pdf') return clonePdf(input as PDFData);
  if (input.type === 'multi-pdf') {
    const items = (input as MultiPDFData).items;
    if (items.length === 0) throw new Error('No PDFs in input');
    return clonePdf(items[0]);
  }
  throw new Error('Expected PDF input');
}

export function extractAllPdfs(inputs: SocketData[]): PDFData[] {
  const result: PDFData[] = [];
  for (const item of inputs) {
    if (item.type === 'pdf') result.push(clonePdf(item as PDFData));
    if (item.type === 'multi-pdf')
      result.push(...(item as MultiPDFData).items.map(clonePdf));
  }
  return result;
}

export type NodeCategory =
  | 'Input'
  | 'Edit & Annotate'
  | 'Organize & Manage'
  | 'Optimize & Repair'
  | 'Secure PDF'
  | 'Output';

export interface NodeMeta {
  id: string;
  label: string;
  category: NodeCategory;
  icon: string;
  description: string;
}

export interface SerializedWorkflow {
  version: number;
  nodes: SerializedNode[];
  connections: SerializedConnection[];
}

export interface SerializedNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  controls: Record<string, unknown>;
}

export interface SerializedConnection {
  id: string;
  source: string;
  sourceOutput: string;
  target: string;
  targetInput: string;
}

export interface ExecutionProgress {
  nodeId: string;
  nodeName: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress?: number;
  message?: string;
}

export const WORKFLOW_VERSION = 1;

export class WorkflowError extends Error {
  nodeName?: string;
  constructor(message: string, nodeName?: string) {
    super(nodeName ? `${nodeName}: ${message}` : message);
    this.name = 'WorkflowError';
    this.nodeName = nodeName;
  }
}

export function requirePdfInput(
  inputs: Record<string, SocketData[]>,
  nodeName: string
): SocketData[] {
  if (!inputs['pdf']?.[0])
    throw new WorkflowError('No PDF connected', nodeName);
  return inputs['pdf'];
}

export async function processBatch(
  pdfInputs: SocketData[],
  fn: (pdf: PDFData) => Promise<PDFData>
): Promise<SocketData> {
  const allPdfs = extractAllPdfs(pdfInputs);
  if (allPdfs.length === 0) throw new Error('No PDFs in input');
  if (allPdfs.length === 1) return fn(allPdfs[0]);
  const results: PDFData[] = [];
  for (const pdf of allPdfs) {
    results.push(await fn(pdf));
  }
  return { type: 'multi-pdf', items: results } as MultiPDFData;
}
