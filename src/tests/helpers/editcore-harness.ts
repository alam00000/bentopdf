export interface ModelRun {
  text: string;
  family: string;
  bold: boolean;
  italic: boolean;
  size: number;
  rgba: number;
  underline: boolean;
  strike: boolean;
  script: number;
  renderMode: number;
  strokeRgba: number;
  strokeWidth: number;
  hScale: number;
  rise: number;
  fallback?: string;
}

export interface ModelLine {
  y: number;
  x: number;
  w: number;
  off: number;
  px: number;
}

export interface ModelBox {
  x: number;
  top: number;
  w: number;
  h: number;
}

export interface ModelFormat {
  align: number;
  lineSpacing: number;
  charSpacing: number;
  paraSpacing: number;
  wordSpacing: number;
  firstIndent: number;
  hangIndent: number;
  dir: number;
  listLevel: number;
}

export interface ModelParagraph {
  id: number;
  editable: boolean;
  lockReason: number;
  box: ModelBox;
  rotation: number;
  marker: boolean;
  vertical: boolean;
  format: ModelFormat;
  firstBaseline: number;
  lines: ModelLine[];
  runs: ModelRun[];
}

export interface CommitResult {
  ok?: boolean;
  box?: ModelBox;
}

export interface Engine {
  pageCount: number;
  pageIndex: number;
  open(bytes: Uint8Array): void;
  loadPage(index: number): void;
  close(): void;
  buildModel(): ModelParagraph[];
  commitParagraph(
    id: number,
    runs: ModelRun[],
    fmt: ModelFormat
  ): CommitResult | null;
  previewParagraph(
    id: number,
    runs: ModelRun[],
    fmt: ModelFormat
  ): CommitResult | null;
  deleteParagraph(id: number): unknown;
  moveParagraph(id: number, dx: number, dy: number): unknown;
  saveSpliced(opts?: unknown): Promise<Uint8Array | null>;
}

interface EditCoreModule {
  PdfEngine: { create(): Promise<Engine> };
  scriptFallbackFamilies(codepoints: number[]): string[];
}

let cached: EditCoreModule | null = null;

export async function loadEditCore(): Promise<EditCoreModule> {
  if (!cached) {
    cached =
      (await import('../../js/editcore/core.js')) as unknown as EditCoreModule;
  }
  return cached;
}

export async function createEngine(): Promise<Engine> {
  const mod = await loadEditCore();
  return mod.PdfEngine.create();
}

export function modelOf(
  engine: Engine,
  bytes: Uint8Array,
  pageIndex = 0
): ModelParagraph[] {
  engine.open(bytes);
  engine.loadPage(pageIndex);
  return engine.buildModel();
}

export function paragraphText(p: ModelParagraph): string {
  return p.runs.map((r) => r.text).join('');
}

export function allText(paragraphs: ModelParagraph[]): string {
  return paragraphs.map(paragraphText).join('\n');
}

export function normalizedText(paragraphs: ModelParagraph[]): string {
  return allText(paragraphs).replace(/\s+/g, ' ').trim();
}

export function boxContains(outer: ModelBox, inner: ModelBox): boolean {
  const eps = 0.5;
  return (
    inner.x >= outer.x - eps &&
    inner.x + inner.w <= outer.x + outer.w + eps &&
    inner.top <= outer.top + eps &&
    inner.top - inner.h >= outer.top - outer.h - eps
  );
}

export function boxOverlapArea(a: ModelBox, b: ModelBox): number {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const h = Math.min(a.top, b.top) - Math.max(a.top - a.h, b.top - b.h);
  return w > 0 && h > 0 ? w * h : 0;
}

export function overlappingPairs(
  paragraphs: ModelParagraph[],
  minRatio = 0.25
): Array<[number, number]> {
  const hits: Array<[number, number]> = [];
  for (let i = 0; i < paragraphs.length; i++) {
    for (let j = i + 1; j < paragraphs.length; j++) {
      const a = paragraphs[i];
      const b = paragraphs[j];
      const area = boxOverlapArea(a.box, b.box);
      if (area <= 0) continue;
      const smallest = Math.min(a.box.w * a.box.h, b.box.w * b.box.h);
      if (smallest > 0 && area / smallest >= minRatio) hits.push([a.id, b.id]);
    }
  }
  return hits;
}

export function runsFrom(p: ModelParagraph, text: string): ModelRun[] {
  const base = p.runs[0];
  return [{ ...base, text }];
}
