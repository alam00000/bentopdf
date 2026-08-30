const enc = new TextEncoder();

export type PdfPart = string | Uint8Array;

export interface PdfObject {
  body: PdfPart;
  stream?: Uint8Array;
}

function concat(parts: Uint8Array[]): Uint8Array {
  let n = 0;
  for (const p of parts) n += p.length;
  const out = new Uint8Array(n);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

function toBytes(part: PdfPart): Uint8Array {
  return typeof part === 'string' ? enc.encode(part) : part;
}

export function buildPdf(objects: PdfObject[], rootRef = '1 0 R'): Uint8Array {
  const parts: Uint8Array[] = [];
  const offsets: number[] = [];
  let pos = 0;
  const push = (part: PdfPart) => {
    const b = toBytes(part);
    parts.push(b);
    pos += b.length;
  };

  push('%PDF-1.7\n%\xE2\xE3\xCF\xD3\n');

  objects.forEach((obj, i) => {
    offsets[i] = pos;
    push(`${i + 1} 0 obj\n`);
    push(obj.body);
    if (obj.stream) {
      push(`\nstream\n`);
      push(obj.stream);
      push(`\nendstream`);
    }
    push('\nendobj\n');
  });

  const xrefPos = pos;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) {
    xref += String(off).padStart(10, '0') + ' 00000 n \n';
  }
  xref += `trailer\n<< /Size ${objects.length + 1} /Root ${rootRef} >>\nstartxref\n${xrefPos}\n%%EOF\n`;
  push(xref);

  return concat(parts);
}

export interface FontSpec {
  name: string;
  dict: string;
}

export interface PagePdfOptions {
  width?: number;
  height?: number;
  content: string;
  fonts?: FontSpec[];
  extraObjects?: PdfObject[];
  pageExtra?: string;
}

export function buildTextPdf(opts: PagePdfOptions): Uint8Array {
  const width = opts.width ?? 612;
  const height = opts.height ?? 792;
  const fonts = opts.fonts ?? [{ name: 'F1', dict: helvetica() }];
  const extras = opts.extraObjects ?? [];

  const contentBytes = enc.encode(opts.content);
  const fontFirst = 5;
  const fontRefs = fonts
    .map((f, i) => `/${f.name} ${fontFirst + i} 0 R`)
    .join(' ');

  const objects: PdfObject[] = [
    { body: '<< /Type /Catalog /Pages 2 0 R >>' },
    { body: '<< /Type /Pages /Kids [3 0 R] /Count 1 >>' },
    {
      body:
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] ` +
        `/Resources << /Font << ${fontRefs} >> >> /Contents 4 0 R${opts.pageExtra ? ' ' + opts.pageExtra : ''} >>`,
    },
    {
      body: `<< /Length ${contentBytes.length} >>`,
      stream: contentBytes,
    },
    ...fonts.map((f) => ({ body: f.dict })),
    ...extras,
  ];

  return buildPdf(objects);
}

export function helvetica(base = 'Helvetica'): string {
  return `<< /Type /Font /Subtype /Type1 /BaseFont /${base} /Encoding /WinAnsiEncoding >>`;
}

export function escapePdfString(s: string): string {
  return s.replace(/[\\()]/g, (c) => '\\' + c);
}

export function textLine(
  font: string,
  size: number,
  x: number,
  y: number,
  text: string
): string {
  return `BT /${font} ${size} Tf 1 0 0 1 ${x} ${y} Tm (${escapePdfString(text)}) Tj ET\n`;
}
