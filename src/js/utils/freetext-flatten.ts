import type { FreeTextSystemFontAnnotation } from '@/types';
import { needsFontEmbedding } from './freetext-script.js';

export const FPDF_ANNOT_FREETEXT = 3;

export function hexToRgba(hex: string): number {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex ?? '');
  if (!m) return 0x000000ff;
  const r = parseInt(m[1], 16);
  const g = parseInt(m[2], 16);
  const b = parseInt(m[3], 16);
  return ((r << 24) | (g << 16) | (b << 8) | 0xff) >>> 0;
}

export type FlattenInput = FreeTextSystemFontAnnotation;

interface EngineModule {
  _malloc: (n: number) => number;
  _free: (p: number) => void;
  HEAPF32: Float32Array;
  HEAPU16: Uint16Array;
  _FPDFPage_GetAnnotCount: (page: number) => number;
  _FPDFPage_GetAnnot: (page: number, i: number) => number;
  _FPDFPage_RemoveAnnot: (page: number, i: number) => number;
  _FPDFAnnot_GetSubtype: (annot: number) => number;
  _FPDFAnnot_GetRect: (annot: number, out: number) => number;
  _FPDFAnnot_GetStringValue: (
    annot: number,
    key: number,
    buf: number,
    len: number
  ) => number;
  stringToUTF8: (s: string, p: number, n: number) => void;
  lengthBytesUTF8: (s: string) => number;
}

interface EngineLike {
  M: EngineModule;
  page: number;
  pageCount: number;
  open: (b: Uint8Array) => void;
  loadPage: (i: number) => void;
  addParagraph: (
    x: number,
    yTop: number,
    width: number,
    runs: unknown[],
    fmt: unknown
  ) => unknown;
  saveSpliced: (opts?: unknown) => Promise<Uint8Array | null>;
}

function readAnnotString(M: EngineModule, annot: number, key: string): string {
  const kn = M.lengthBytesUTF8(key) + 1;
  const kp = M._malloc(kn);
  M.stringToUTF8(key, kp, kn);
  const need = M._FPDFAnnot_GetStringValue(annot, kp, 0, 0);
  if (need <= 2) {
    M._free(kp);
    return '';
  }
  const bp = M._malloc(need);
  M._FPDFAnnot_GetStringValue(annot, kp, bp, need);
  let out = '';
  for (let i = 0; i + 1 < need; i += 2) {
    const c = M.HEAPU16[(bp + i) >> 1];
    if (!c) break;
    out += String.fromCharCode(c);
  }
  M._free(bp);
  M._free(kp);
  return out;
}

interface LocalFontRecord {
  family: string;
  style: string;
  postscriptName: string;
  blob: () => Promise<Blob>;
}

async function primeScriptFonts(
  mod: {
    PdfEngine: { localFonts: Map<string, Uint8Array> };
    scriptFallbackFamilies: (cps: number[]) => string[];
  },
  texts: string[]
): Promise<void> {
  const qlf = (
    globalThis as unknown as {
      queryLocalFonts?: () => Promise<LocalFontRecord[]>;
    }
  ).queryLocalFonts;
  if (typeof qlf !== 'function') return;

  const cps = new Set<number>();
  for (const t of texts) {
    for (const ch of t) {
      if (!needsFontEmbedding(ch)) continue;
      const cp = ch.codePointAt(0);
      if (cp) cps.add(cp);
    }
  }
  if (cps.size === 0) return;

  let wanted: string[];
  try {
    wanted = mod.scriptFallbackFamilies([...cps]);
  } catch (err) {
    console.warn('flatten: script fallback lookup failed', err);
    return;
  }
  if (wanted.length === 0) return;

  let list: LocalFontRecord[];
  try {
    list = await qlf();
  } catch (err) {
    console.warn('flatten: local font access denied', err);
    return;
  }

  const byFamily = new Map<string, LocalFontRecord>();
  for (const f of list) {
    const key = f.family.toLowerCase();
    const cur = byFamily.get(key);
    const plain = /^(regular|book|normal)$/i.test(f.style ?? '');
    if (!cur || plain) byFamily.set(key, f);
  }

  const MAX_FACE_BYTES = 40 << 20;
  for (const family of wanted) {
    if (mod.PdfEngine.localFonts.has(family)) continue;
    const rec = byFamily.get(family.toLowerCase());
    if (!rec) continue;
    try {
      const blob = await rec.blob();
      if (blob.size === 0 || blob.size > MAX_FACE_BYTES) continue;
      const bytes = new Uint8Array(await blob.arrayBuffer());
      mod.PdfEngine.localFonts.set(family, bytes);
      mod.PdfEngine.localFonts.set(family + '|00', bytes);
    } catch (err) {
      console.warn('flatten: font unavailable', family, err);
    }
  }
}

function buildRuns(
  contents: string,
  style: FreeTextSystemFontAnnotation | undefined
) {
  const size = style && style.fontSize > 0 ? style.fontSize : 12;
  return [
    {
      text: contents,
      family: 'Helvetica',
      size,
      rgba: hexToRgba(style?.fontColor ?? '#000000'),
      bold: false,
      italic: false,
      underline: false,
      strike: false,
      script: 0,
      renderMode: 0,
      strokeRgba: 0,
      strokeWidth: 1,
      hScale: 1,
      rise: 0,
      sourceIndex: -1,
    },
  ];
}

const FLAT_FMT = {
  align: 0,
  lineSpacing: 1.18,
  charSpacing: 0,
  paraSpacing: 0,
  wordSpacing: 0,
  firstIndent: 0,
  hangIndent: 0,
  dir: 0,
  listLevel: 0,
};

export async function flattenFreeTextToPageText(
  bytes: Uint8Array,
  annotations: FreeTextSystemFontAnnotation[],
  pageCountHint = 0
): Promise<{ bytes: Uint8Array; flattened: number }> {
  if (annotations.length === 0 && pageCountHint <= 0) {
    return { bytes, flattened: 0 };
  }

  const mod = (await import('../editcore/core.js')) as unknown as {
    PdfEngine: {
      create: () => Promise<EngineLike>;
      localFonts: Map<string, Uint8Array>;
    };
    scriptFallbackFamilies: (cps: number[]) => string[];
  };
  const eng = await mod.PdfEngine.create();
  try {
    eng.open(bytes);
  } catch (err) {
    console.error('flatten: could not open document', err);
    return { bytes, flattened: 0 };
  }

  const styleById = new Map<string, FreeTextSystemFontAnnotation>();
  const pages = new Set<number>();
  for (const a of annotations) {
    styleById.set(a.id, a);
    pages.add(a.pageIndex);
  }
  for (let i = 0; i < eng.pageCount; i++) pages.add(i);

  const M = eng.M;
  const rectPtr = M._malloc(16);
  let flattened = 0;

  const found: string[] = [];
  for (const pageIndex of [...pages].sort((x, y) => x - y)) {
    if (pageIndex < 0 || pageIndex >= eng.pageCount) continue;
    try {
      eng.loadPage(pageIndex);
    } catch (err) {
      console.warn('flatten: could not scan page', pageIndex, err);
      continue;
    }
    const scanPage = eng.page;
    for (let i = M._FPDFPage_GetAnnotCount(scanPage) - 1; i >= 0; i--) {
      const annot = M._FPDFPage_GetAnnot(scanPage, i);
      if (!annot) continue;
      if (M._FPDFAnnot_GetSubtype(annot) !== FPDF_ANNOT_FREETEXT) continue;
      const style = styleById.get(readAnnotString(M, annot, 'NM'));
      const text = style?.contents?.trim()
        ? style.contents
        : readAnnotString(M, annot, 'Contents');
      if (text.trim()) found.push(text);
    }
  }
  if (found.length === 0) {
    M._free(rectPtr);
    return { bytes, flattened: 0 };
  }
  await primeScriptFonts(mod, found);

  for (const pageIndex of [...pages].sort((x, y) => x - y)) {
    if (pageIndex < 0 || pageIndex >= eng.pageCount) continue;
    try {
      eng.loadPage(pageIndex);
    } catch (err) {
      console.warn('flatten: could not load page', pageIndex, err);
      continue;
    }
    const page = eng.page;
    for (let i = M._FPDFPage_GetAnnotCount(page) - 1; i >= 0; i--) {
      const annot = M._FPDFPage_GetAnnot(page, i);
      if (!annot) continue;
      if (M._FPDFAnnot_GetSubtype(annot) !== FPDF_ANNOT_FREETEXT) continue;
      const name = readAnnotString(M, annot, 'NM');
      const style = styleById.get(name);
      const contents = style?.contents?.trim()
        ? style.contents
        : readAnnotString(M, annot, 'Contents');
      if (!contents.trim()) continue;
      if (!M._FPDFAnnot_GetRect(annot, rectPtr)) continue;

      const left = M.HEAPF32[rectPtr >> 2];
      const bottom = M.HEAPF32[(rectPtr + 4) >> 2];
      const right = M.HEAPF32[(rectPtr + 8) >> 2];
      const top = M.HEAPF32[(rectPtr + 12) >> 2];
      const width = Math.abs(right - left);
      if (!(width > 1)) continue;

      let created: unknown;
      try {
        created = eng.addParagraph(
          Math.min(left, right),
          Math.max(bottom, top),
          width,
          buildRuns(contents, style),
          { ...FLAT_FMT, align: (style?.textAlign ?? 0) | 0 }
        );
      } catch (err) {
        console.warn('flatten: addParagraph failed', name, err);
        created = null;
      }
      if (!created) continue;
      M._FPDFPage_RemoveAnnot(page, i);
      flattened++;
    }
  }

  M._free(rectPtr);
  if (flattened === 0) return { bytes, flattened: 0 };

  try {
    const out = await eng.saveSpliced();
    if (out && out.length > 0) return { bytes: out, flattened };
  } catch (err) {
    console.error('flatten: save failed', err);
  }
  return { bytes, flattened: 0 };
}
