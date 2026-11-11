/**
 * Regenerates appearance streams for form text fields that contain Hebrew.
 *
 * Why: when PDF.js saves a filled form and the field's font (usually
 * Helvetica) cannot encode the value, it drops the widget's /AP entirely and
 * sets /NeedAppearances. Most viewers then show an empty field, and viewers
 * that do regenerate it use Helvetica (no Hebrew glyphs) and often lay the
 * text out left-to-right. This module draws the value itself with an
 * embedded Hebrew font (plus a Latin font for digits and English), in correct
 * bidi visual order, so the filled PDF looks the same everywhere.
 */
import {
  PDFDocument,
  PDFTextField,
  PDFName,
  PDFDict,
  PDFArray,
  PDFNumber,
  PDFBool,
  PDFString,
  PDFHexString,
  PDFDropdown,
  PDFOptionList,
  PDFFont,
  TextAlignment,
} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import bidiFactory from 'bidi-js';

const HEBREW_RE = /[\u0590-\u05FF\uFB1D-\uFB4F]/;
const PADDING = 2;

export interface RtlFontBytes {
  hebrew: ArrayBuffer | Uint8Array;
  latin: ArrayBuffer | Uint8Array;
}

type FontLoader = () => Promise<RtlFontBytes>;

type Glyphs = { hasGlyphForCodePoint(cp: number): boolean };

interface FontPair {
  heb: PDFFont;
  lat: PDFFont;
  hebRaw: Glyphs;
  latRaw: Glyphs;
}

interface Run {
  text: string;
  font: 'heb' | 'lat';
}

let bidi: ReturnType<typeof bidiFactory> | null = null;
function getBidi() {
  if (!bidi) bidi = bidiFactory();
  return bidi;
}

export function textNeedsRtlFix(text: string | undefined): boolean {
  return !!text && HEBREW_RE.test(text);
}

/** Visual (left-to-right display) order of one line, with bracket mirroring. */
export function toVisualOrder(
  line: string,
  direction?: 'ltr' | 'rtl'
): { visual: string; rtl: boolean } {
  const b = getBidi();
  const levels = b.getEmbeddingLevels(line, direction);
  const rtl = levels.paragraphs[0]?.level === 1;
  return { visual: b.getReorderedString(line, levels), rtl };
}

function pickFont(ch: string, prev: 'heb' | 'lat', f: FontPair): 'heb' | 'lat' {
  const cp = ch.codePointAt(0)!;
  if (HEBREW_RE.test(ch)) return 'heb';
  // Spaces and neutral punctuation stay in the current run to avoid switches.
  const inPrev = prev === 'heb' ? f.hebRaw : f.latRaw;
  if (/\s/.test(ch) && inPrev.hasGlyphForCodePoint(cp)) return prev;
  if (f.latRaw.hasGlyphForCodePoint(cp)) return 'lat';
  if (f.hebRaw.hasGlyphForCodePoint(cp)) return 'heb';
  return 'lat';
}

function splitRuns(visual: string, f: FontPair): Run[] {
  const runs: Run[] = [];
  let prev: 'heb' | 'lat' = 'lat';
  for (const ch of visual) {
    const font = pickFont(ch, prev, f);
    const last = runs[runs.length - 1];
    if (last && last.font === font) last.text += ch;
    else runs.push({ text: ch, font });
    prev = font;
  }
  return runs;
}

// Encode one character at a time: fontkit's layout() reverses RTL runs on its
// own, which would undo our bidi reordering.
function encodeChars(font: PDFFont, text: string): string {
  let hex = '';
  for (const ch of text) {
    const s = font.encodeText(ch).toString();
    hex += s.slice(1, -1);
  }
  return hex;
}

function widthOf(runs: Run[], size: number, f: FontPair): number {
  let w = 0;
  for (const r of runs) {
    const font = r.font === 'heb' ? f.heb : f.lat;
    for (const ch of r.text) w += font.widthOfTextAtSize(ch, size);
  }
  return w;
}

function logicalWidth(text: string, size: number, f: FontPair): number {
  return widthOf(splitRuns(text, f), size, f);
}

/** Word-wrap in logical order (so RTL lines break correctly), then reorder. */
function wrapLogical(
  paragraph: string,
  maxWidth: number,
  size: number,
  f: FontPair
): string[] {
  const words = paragraph.split(/(\s+)/);
  const lines: string[] = [];
  let cur = '';
  const fits = (s: string) => logicalWidth(s.trimEnd(), size, f) <= maxWidth;
  for (const w of words) {
    const next = cur + w;
    if (fits(next)) {
      cur = next;
      continue;
    }
    if (cur.trim()) lines.push(cur.trimEnd());
    cur = w.trimStart();
    // A single token wider than the line: split it by character.
    if (!fits(cur)) {
      let piece = '';
      for (const ch of cur) {
        if (piece && !fits(piece + ch)) {
          lines.push(piece);
          piece = '';
        }
        piece += ch;
      }
      cur = piece;
    }
  }
  lines.push(cur.trimEnd());
  return lines;
}

/** Paragraph direction from its first strong character (UAX #9, P2/P3). */
function paragraphDirection(paragraph: string): 'ltr' | 'rtl' {
  return toVisualOrder(paragraph).rtl ? 'rtl' : 'ltr';
}

/** Resolve /DA from the widget, then the field and its ancestors, then the form. */
function resolveDA(
  widgetDict: PDFDict,
  field: PDFTextField,
  formDA: string | undefined
): string | undefined {
  const seen = new Set<PDFDict>();
  const dicts: (PDFDict | undefined)[] = [widgetDict, field.acroField.dict];
  for (let d: unknown = field.acroField.dict.lookup(PDFName.of('Parent')); ; ) {
    if (!(d instanceof PDFDict) || seen.has(d)) break;
    seen.add(d);
    dicts.push(d);
    d = d.lookup(PDFName.of('Parent'));
  }
  for (const d of dicts) {
    const da = d?.lookup(PDFName.of('DA'));
    if (da instanceof PDFString || da instanceof PDFHexString) {
      return da.decodeText();
    }
  }
  return formDA;
}

function parseDA(da: string | undefined) {
  const out = { size: 0, color: '0 g' };
  if (!da) return out;
  // DA is a tiny content stream: walk tokens, keep the last Tf and colour op.
  const tokens = da.replace(/\\n/g, ' ').split(/\s+/).filter(Boolean);
  const operands: string[] = [];
  for (const tok of tokens) {
    if (tok === 'Tf') {
      const size = parseFloat(operands[operands.length - 1]);
      if (!Number.isNaN(size)) out.size = size;
    } else if (tok === 'g' || tok === 'rg' || tok === 'k') {
      const n = tok === 'g' ? 1 : tok === 'rg' ? 3 : 4;
      const vals = operands.slice(-n);
      if (
        vals.length === n &&
        vals.every((v) => !Number.isNaN(parseFloat(v)))
      ) {
        out.color = `${vals.join(' ')} ${tok}`;
      }
    }
    if (/^[a-zA-Z*'"]+$/.test(tok)) operands.length = 0;
    else operands.push(tok);
  }
  return out;
}

function colorOps(arr: unknown, stroke: boolean): string | null {
  if (!(arr instanceof PDFArray)) return null;
  const n = arr
    .asArray()
    .map((v) => (v instanceof PDFNumber ? v.asNumber() : 0));
  const op =
    n.length === 1 ? 'g' : n.length === 3 ? 'rg' : n.length === 4 ? 'k' : null;
  if (!op) return null;
  return `${n.join(' ')} ${stroke ? op.toUpperCase() : op}`;
}

function fmt(n: number): string {
  return Number(n.toFixed(3)).toString();
}

function buildAppearance(
  field: PDFTextField,
  widgetDict: PDFDict,
  width: number,
  height: number,
  formDA: string | undefined,
  f: FontPair
): string {
  const value = field.getText() ?? '';
  const da = parseDA(resolveDA(widgetDict, field, formDA));
  const multiline = field.isMultiline();
  const alignment = field.getAlignment();
  const maxLen = field.getMaxLength();
  const comb = field.isCombed() && !!maxLen;

  const mk = widgetDict.lookup(PDFName.of('MK'));
  const bs = widgetDict.lookup(PDFName.of('BS'));
  let borderWidth = 1;
  if (bs instanceof PDFDict) {
    const w = bs.lookup(PDFName.of('W'));
    if (w instanceof PDFNumber) borderWidth = w.asNumber();
  }
  const bg =
    mk instanceof PDFDict ? colorOps(mk.lookup(PDFName.of('BG')), false) : null;
  const bc =
    mk instanceof PDFDict ? colorOps(mk.lookup(PDFName.of('BC')), true) : null;

  const ops: string[] = [];
  if (bg) ops.push(`q ${bg} 0 0 ${fmt(width)} ${fmt(height)} re f Q`);
  if (bc && borderWidth > 0) {
    const h = borderWidth / 2;
    ops.push(
      `q ${bc} ${fmt(borderWidth)} w ${fmt(h)} ${fmt(h)} ${fmt(width - borderWidth)} ${fmt(height - borderWidth)} re S Q`
    );
  }

  const inset = (bc ? borderWidth : 0) + PADDING;
  const innerW = Math.max(1, width - 2 * inset);
  const innerH = Math.max(1, height - 2 * inset);

  let size = da.size;
  const paragraphs = value.split(/\r\n|\r|\n/);

  const wrapAll = (s: number) =>
    paragraphs.flatMap((p) => {
      const dir = paragraphDirection(p);
      return wrapLogical(p, innerW, s, f).map((l) => ({ l, dir }));
    });

  if (size <= 0) {
    if (multiline) {
      // Start at 12pt and shrink until the wrapped text fits the height.
      size = 12;
      while (size > 4 && wrapAll(size).length * size * 1.15 > innerH) {
        size -= 0.5;
      }
    } else {
      size = Math.min(innerH / 1.15, 12 * 2);
      const w = logicalWidth(value, size, f);
      if (w > innerW) size = (size * innerW) / w;
    }
    size = Math.max(4, size);
  }

  type Line = { runs: Run[]; rtl: boolean };
  const lines: Line[] = [];
  const pushLine = (logical: string, dir?: 'ltr' | 'rtl') => {
    const { visual, rtl } = toVisualOrder(logical, dir);
    lines.push({ runs: splitRuns(visual, f), rtl });
  };
  if (multiline) {
    // Direction is resolved per paragraph, not per wrapped line.
    for (const { l, dir } of wrapAll(size)) pushLine(l, dir);
  } else {
    pushLine(paragraphs.join(' '));
  }

  const lineHeight = size * 1.15;
  const descent = size * 0.25;

  ops.push('/Tx BMC', 'q');
  ops.push(`${fmt(inset)} ${fmt(inset)} ${fmt(innerW)} ${fmt(innerH)} re W n`);
  ops.push('BT', da.color);

  let curFont: string | null = null;
  const setFont = (key: 'heb' | 'lat') => {
    if (curFont !== key) {
      ops.push(`/${key === 'heb' ? 'FHeb' : 'FLat'} ${fmt(size)} Tf`);
      curFont = key;
    }
  };

  if (comb && !multiline) {
    const cell = width / maxLen!;
    const y = (height - size) / 2 + descent;
    let i = 0;
    for (const run of lines[0].runs) {
      const font = run.font === 'heb' ? f.heb : f.lat;
      for (const ch of run.text) {
        const cw = font.widthOfTextAtSize(ch, size);
        const x = i * cell + (cell - cw) / 2;
        setFont(run.font);
        ops.push(
          `1 0 0 1 ${fmt(x)} ${fmt(y)} Tm <${encodeChars(font, ch)}> Tj`
        );
        i++;
      }
    }
  } else {
    let y = multiline
      ? height - inset - size + descent * 0.4
      : (height - size) / 2 + descent;
    for (const line of lines) {
      const lw = widthOf(line.runs, size, f);
      let align = alignment;
      // "Left" is the default (Q=0); for a right-to-left paragraph the natural
      // start edge is the right side.
      if (align === TextAlignment.Left && line.rtl) align = TextAlignment.Right;
      let x = inset;
      if (align === TextAlignment.Center) x = (width - lw) / 2;
      else if (align === TextAlignment.Right) x = width - inset - lw;
      ops.push(`1 0 0 1 ${fmt(x)} ${fmt(y)} Tm`);
      for (const run of line.runs) {
        setFont(run.font);
        ops.push(
          `<${encodeChars(run.font === 'heb' ? f.heb : f.lat, run.text)}> Tj`
        );
      }
      y -= lineHeight;
    }
  }

  ops.push('ET', 'Q', 'EMC');
  return ops.join('\n');
}

/**
 * Returns the PDF with correct appearances for Hebrew text fields, or the
 * input bytes unchanged if nothing needs fixing or anything goes wrong.
 */
export async function fixRtlFormAppearances(
  pdfBytes: Uint8Array,
  loadFonts: FontLoader
): Promise<Uint8Array> {
  let doc: PDFDocument;
  try {
    doc = await PDFDocument.load(pdfBytes, { updateMetadata: false });
  } catch (e) {
    console.warn('[rtl-form] could not parse saved PDF, leaving as is', e);
    return pdfBytes;
  }

  const form = doc.getForm();
  const targets = form.getFields().filter(
    (fld): fld is PDFTextField =>
      fld instanceof PDFTextField &&
      // Never write a password value into a visible appearance stream.
      !fld.isPassword() &&
      textNeedsRtlFix(fld.getText())
  );
  if (targets.length === 0) return pdfBytes;

  try {
    doc.registerFontkit(fontkit);
    const bytes = await loadFonts();
    const hebU8 = new Uint8Array(bytes.hebrew);
    const latU8 = new Uint8Array(bytes.latin);
    const f: FontPair = {
      heb: await doc.embedFont(hebU8, { subset: true }),
      lat: await doc.embedFont(latU8, { subset: true }),
      hebRaw: fontkit.create(hebU8) as unknown as Glyphs,
      latRaw: fontkit.create(latU8) as unknown as Glyphs,
    };

    // Refuse to draw if the Hebrew font lacks glyphs for the values (would
    // render missing-glyph boxes); the catch below returns the original PDF.
    for (const field of targets) {
      for (const ch of field.getText() ?? '') {
        if (
          HEBREW_RE.test(ch) &&
          !f.hebRaw.hasGlyphForCodePoint(ch.codePointAt(0)!)
        ) {
          throw new Error(
            `Hebrew font has no glyph for U+${ch.codePointAt(0)!.toString(16)}`
          );
        }
      }
    }

    const acroForm = form.acroForm.dict;
    const formDAObj = acroForm.lookup(PDFName.of('DA'));
    const formDA = formDAObj
      ? formDAObj.toString().replace(/^\(|\)$/g, '')
      : undefined;

    for (const field of targets) {
      for (const widget of field.acroField.getWidgets()) {
        const rect = widget.getRectangle();
        const content = buildAppearance(
          field,
          widget.dict,
          rect.width,
          rect.height,
          formDA,
          f
        );
        const stream = doc.context.flateStream(content, {
          Type: 'XObject',
          Subtype: 'Form',
          BBox: [0, 0, rect.width, rect.height],
          Resources: { Font: { FHeb: f.heb.ref, FLat: f.lat.ref } },
        });
        widget.setNormalAppearance(doc.context.register(stream));
      }
    }

    // PDF.js sets NeedAppearances when it couldn't draw a field. If every text
    // field now has an appearance, clear it so viewers don't redraw ours with
    // a font that can't show Hebrew.
    const stillMissing = form
      .getFields()
      .some(
        (fld) =>
          (fld instanceof PDFTextField ||
            fld instanceof PDFDropdown ||
            fld instanceof PDFOptionList) &&
          fld.acroField.getWidgets().some((w) => !w.getAppearances()?.normal)
      );
    if (!stillMissing)
      acroForm.set(PDFName.of('NeedAppearances'), PDFBool.False);

    return await doc.save({ updateFieldAppearances: false });
  } catch (e) {
    console.warn('[rtl-form] failed to rebuild Hebrew field appearances', e);
    return pdfBytes;
  }
}
