import JSZip from 'jszip';
import type { PyMuPDFInstance } from '@/types';

const XML_PART = /\.(rels|fdseq|fdoc|fpage|dict|xml)$/i;
const PIECE = /^(.*)[/\\]\[(\d+)\](?:\.last)?\.piece$/i;
const ATTRIBUTE_NAME = /^[A-Za-z0-9._:-]+$/;
const ATTRIBUTE =
  /([^\s\p{Cc}=/>"']+)\s*=\s*("[^"]*"|'[^']*'|[^\s"'>]*[^\s"'>/])/gu;
const VERBATIM: Array<[string, string]> = [
  ['<!--', '-->'],
  ['<![CDATA[', ']]>'],
  ['<?', '?>'],
  ['<!', '>'],
];

function decodeXml(bytes: Uint8Array): string {
  const [a, b, c] = bytes;
  if (a === 0xff && b === 0xfe)
    return new TextDecoder('utf-16le').decode(bytes);
  if (a === 0xfe && b === 0xff)
    return new TextDecoder('utf-16be').decode(bytes);
  if (a === 0x3c && b === 0) return new TextDecoder('utf-16le').decode(bytes);
  if (a === 0 && b === 0x3c) return new TextDecoder('utf-16be').decode(bytes);
  if (a === 0xef && b === 0xbb && c === 0xbf) {
    return new TextDecoder().decode(bytes);
  }
  const head = new TextDecoder('latin1').decode(bytes.subarray(0, 256));
  const declared = head.match(
    /^\s*<\?xml[^>]*?encoding\s*=\s*["']([^"']+)["']/i
  )?.[1];
  if (!declared || /^utf-?16/i.test(declared)) {
    return new TextDecoder().decode(bytes);
  }
  try {
    return new TextDecoder(declared).decode(bytes);
  } catch {
    return new TextDecoder().decode(bytes);
  }
}

function rebuildTag(inner: string): string {
  if (inner.startsWith('/')) return `</${inner.slice(1).trim()}>`;
  const name = inner.match(/^\s*([^\s/>]+)/);
  if (!name) return `<${inner}>`;
  const rest = inner.slice(name[0].length);
  const attributes = Array.from(rest.matchAll(ATTRIBUTE))
    .filter(([, attribute]) => ATTRIBUTE_NAME.test(attribute))
    .map(([, attribute, value]) =>
      /^["']/.test(value) ? `${attribute}=${value}` : `${attribute}="${value}"`
    );
  const end = /\/\s*$/.test(rest) ? '/>' : '>';
  return `<${[name[1], ...attributes].join(' ')}${end}`;
}

export function repairXml(source: string): string {
  const text = source.replace(/\0/g, '');
  let out = '';
  let i = 0;
  while (i < text.length) {
    const start = text.indexOf('<', i);
    if (start === -1) {
      out += text.slice(i);
      break;
    }
    out += text.slice(i, start);
    const verbatim = VERBATIM.find(([open]) => text.startsWith(open, start));
    if (verbatim) {
      const close = text.indexOf(verbatim[1], start + verbatim[0].length);
      const stop = close === -1 ? text.length : close + verbatim[1].length;
      out += text.slice(start, stop);
      i = stop;
      continue;
    }
    let j = start + 1;
    let quote = '';
    while (j < text.length && (quote || text[j] !== '>')) {
      if (quote) {
        if (text[j] === quote) quote = '';
      } else if (text[j] === '"' || text[j] === "'") {
        quote = text[j];
      }
      j++;
    }
    out += rebuildTag(text.slice(start + 1, j));
    i = j + 1;
  }
  return out.replace(
    /^(\s*<\?xml[^>]*?encoding\s*=\s*)["'][^"']*["']/,
    '$1"utf-8"'
  );
}

function repairPart(name: string, bytes: Uint8Array): Uint8Array {
  if (!XML_PART.test(name)) return bytes;
  return new TextEncoder().encode(repairXml(decodeXml(bytes)));
}

export async function repairXpsPackage(file: Blob): Promise<Blob> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const repaired = new JSZip();
  const pieces = new Map<string, Array<{ index: number; data: ArrayBuffer }>>();

  for (const entry of Object.values(zip.files)) {
    if (entry.dir) continue;
    const piece = entry.name.match(PIECE);
    if (piece) {
      const list = pieces.get(piece[1]) ?? [];
      list.push({
        index: Number(piece[2]),
        data: await entry.async('arraybuffer'),
      });
      pieces.set(piece[1], list);
      continue;
    }
    repaired.file(
      entry.name,
      repairPart(entry.name, await entry.async('uint8array'))
    );
  }

  for (const [name, list] of pieces) {
    list.sort((x, y) => x.index - y.index);
    const merged = await new Blob(list.map((p) => p.data)).arrayBuffer();
    repaired.file(name, repairPart(name, new Uint8Array(merged)));
  }

  return new Blob([
    await repaired.generateAsync({ type: 'arraybuffer', compression: 'STORE' }),
  ]);
}

export async function convertXpsToPdf(
  pymupdf: PyMuPDFInstance,
  file: Blob
): Promise<Blob> {
  try {
    return await pymupdf.convertToPdf(file, { filetype: 'xps' });
  } catch (error) {
    try {
      return await pymupdf.convertToPdf(await repairXpsPackage(file), {
        filetype: 'xps',
      });
    } catch {
      throw error;
    }
  }
}
