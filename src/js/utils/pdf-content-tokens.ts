import type { ContentOperation, ContentToken } from '@/types';

import { trText } from '../i18n/i18n.js';

const charCode = (char: string) => char.charCodeAt(0);

const BACKSLASH = charCode('\\');
const OPEN_PAREN = charCode('(');
const CLOSE_PAREN = charCode(')');
const LESS_THAN = charCode('<');
const GREATER_THAN = charCode('>');
const OPEN_BRACKET = charCode('[');
const CLOSE_BRACKET = charCode(']');
const SLASH = charCode('/');
const PERCENT = charCode('%');
const LINE_FEED = charCode('\n');
const CARRIAGE_RETURN = charCode('\r');
const LETTER_E = charCode('E');
const LETTER_I = charCode('I');

const WHITESPACE = new Set([0x00, 0x09, 0x0a, 0x0c, 0x0d, 0x20]);
const DELIMITERS = new Set([...'()<>[]{}/%'].map(charCode));
const OPERAND_KEYWORDS = new Set(['true', 'false', 'null']);
const TEXT_CHECK_LENGTH = 16;

const COMPONENTS_PER_COLOR_SPACE = new Map([
  ['G', 1],
  ['DeviceGray', 1],
  ['RGB', 3],
  ['DeviceRGB', 3],
  ['CMYK', 4],
  ['DeviceCMYK', 4],
  ['I', 1],
  ['Indexed', 1],
]);

function isRegularChar(byte: number): boolean {
  return !WHITESPACE.has(byte) && !DELIMITERS.has(byte);
}

function isHexDigit(byte: number): boolean {
  return (
    (byte >= charCode('0') && byte <= charCode('9')) ||
    (byte >= charCode('A') && byte <= charCode('F')) ||
    (byte >= charCode('a') && byte <= charCode('f'))
  );
}

function bytesToString(bytes: Uint8Array, start: number, end: number): string {
  let text = '';
  for (let i = start; i < end; i++) text += String.fromCharCode(bytes[i]);
  return text;
}

function skipWhitespaceAndComments(bytes: Uint8Array, pos: number): number {
  while (pos < bytes.length) {
    if (WHITESPACE.has(bytes[pos])) {
      pos++;
    } else if (bytes[pos] === PERCENT) {
      while (
        pos < bytes.length &&
        bytes[pos] !== LINE_FEED &&
        bytes[pos] !== CARRIAGE_RETURN
      ) {
        pos++;
      }
    } else {
      break;
    }
  }
  return pos;
}

function findLiteralStringEnd(bytes: Uint8Array, start: number): number {
  let depth = 0;
  for (let i = start; i < bytes.length; i++) {
    const byte = bytes[i];
    if (byte === BACKSLASH) {
      i++;
    } else if (byte === OPEN_PAREN) {
      depth++;
    } else if (byte === CLOSE_PAREN) {
      depth--;
      if (depth === 0) return i + 1;
    }
  }
  throw new Error(trText('Unterminated string in content stream'));
}

function findHexStringEnd(bytes: Uint8Array, start: number): number {
  for (let i = start + 1; i < bytes.length; i++) {
    const byte = bytes[i];
    if (byte === GREATER_THAN) return i + 1;
    if (!isHexDigit(byte) && !WHITESPACE.has(byte)) {
      throw new Error(trText('Invalid hex string in content stream'));
    }
  }
  throw new Error(trText('Unterminated hex string in content stream'));
}

function findClosingDelimiter(
  bytes: Uint8Array,
  start: number,
  closing: number[]
): number {
  let pos = start;
  while (true) {
    pos = skipWhitespaceAndComments(bytes, pos);
    if (pos >= bytes.length) {
      throw new Error(
        trText('Unterminated array or dictionary in content stream')
      );
    }
    if (closing.every((byte, offset) => bytes[pos + offset] === byte)) {
      return pos + closing.length;
    }
    pos = readToken(bytes, pos).end;
  }
}

function readToken(bytes: Uint8Array, start: number): ContentToken {
  const byte = bytes[start];

  if (byte === OPEN_PAREN) {
    const end = findLiteralStringEnd(bytes, start);
    return { kind: 'operand', value: '', start, end };
  }
  if (byte === LESS_THAN && bytes[start + 1] === LESS_THAN) {
    const end = findClosingDelimiter(bytes, start + 2, [
      GREATER_THAN,
      GREATER_THAN,
    ]);
    return { kind: 'dict', value: '', start, end };
  }
  if (byte === LESS_THAN) {
    const end = findHexStringEnd(bytes, start);
    return { kind: 'operand', value: '', start, end };
  }
  if (byte === OPEN_BRACKET) {
    const end = findClosingDelimiter(bytes, start + 1, [CLOSE_BRACKET]);
    return { kind: 'operand', value: '', start, end };
  }
  if (byte === SLASH) {
    let end = start + 1;
    while (end < bytes.length && isRegularChar(bytes[end])) end++;
    const name = bytesToString(bytes, start + 1, end);
    return { kind: 'name', value: name, start, end };
  }
  if (DELIMITERS.has(byte)) {
    throw new Error(trText('Unexpected delimiter in content stream'));
  }

  let end = start;
  while (end < bytes.length && isRegularChar(bytes[end])) end++;
  const word = bytesToString(bytes, start, end);
  const isNumber = /^[\d+.-]/.test(word);
  const kind = isNumber || OPERAND_KEYWORDS.has(word) ? 'operand' : 'operator';
  return { kind, value: word, start, end };
}

function isFollowedByText(bytes: Uint8Array, start: number): boolean {
  const end = Math.min(bytes.length, start + TEXT_CHECK_LENGTH);
  for (let i = start; i < end; i++) {
    const byte = bytes[i];
    const isPrintable = byte >= 0x20 && byte <= 0x7e;
    if (!isPrintable && !WHITESPACE.has(byte)) return false;
  }
  return true;
}

function getImageDataLength(
  bytes: Uint8Array,
  imageDict: Map<string, ContentToken>
): number | undefined {
  const lookup = (shortKey: string, longKey: string) =>
    imageDict.get(shortKey) ?? imageDict.get(longKey);
  const toInteger = (token: ContentToken | undefined) =>
    token?.kind === 'operand' && /^\d+$/.test(token.value)
      ? Number(token.value)
      : undefined;

  if (lookup('F', 'Filter')) return undefined;

  const isImageMask = lookup('IM', 'ImageMask')?.value === 'true';
  const colorSpace = lookup('CS', 'ColorSpace');
  const isIndexedColor =
    colorSpace?.kind === 'operand' &&
    /^\[\s*\/(I|Indexed)[\s/]/.test(
      bytesToString(bytes, colorSpace.start, colorSpace.end)
    );

  let componentsPerPixel: number | undefined;
  if (isImageMask || isIndexedColor) {
    componentsPerPixel = 1;
  } else if (colorSpace?.kind === 'name') {
    componentsPerPixel = COMPONENTS_PER_COLOR_SPACE.get(colorSpace.value);
  }

  const width = toInteger(lookup('W', 'Width'));
  const height = toInteger(lookup('H', 'Height'));
  const bitsPerComponent = isImageMask
    ? 1
    : toInteger(lookup('BPC', 'BitsPerComponent'));

  if (
    width === undefined ||
    height === undefined ||
    bitsPerComponent === undefined ||
    componentsPerPixel === undefined
  ) {
    return undefined;
  }
  const bytesPerRow = Math.ceil(
    (width * bitsPerComponent * componentsPerPixel) / 8
  );
  return height * bytesPerRow;
}

function isEndImageOperator(bytes: Uint8Array, pos: number): boolean {
  return (
    bytes[pos] === LETTER_E &&
    bytes[pos + 1] === LETTER_I &&
    (pos + 2 >= bytes.length || !isRegularChar(bytes[pos + 2]))
  );
}

function skipInlineImage(bytes: Uint8Array, start: number): number {
  const imageDict = new Map<string, ContentToken>();
  let pendingKey: ContentToken | undefined;
  let pos = start;

  while (true) {
    pos = skipWhitespaceAndComments(bytes, pos);
    if (pos >= bytes.length) {
      throw new Error(trText('Unterminated inline image in content stream'));
    }
    const token = readToken(bytes, pos);
    pos = token.end;
    if (token.kind === 'operator' && token.value === 'ID') break;
    if (pendingKey) {
      imageDict.set(pendingKey.value, token);
      pendingKey = undefined;
    } else if (token.kind === 'name') {
      pendingKey = token;
    } else {
      throw new Error(trText('Malformed inline image in content stream'));
    }
  }

  const dataStart = WHITESPACE.has(bytes[pos]) ? pos + 1 : pos;
  const dataLength = getImageDataLength(bytes, imageDict);

  if (dataLength !== undefined) {
    let end = dataStart + dataLength;
    while (end < bytes.length && WHITESPACE.has(bytes[end])) end++;
    if (isEndImageOperator(bytes, end)) return end + 2;
    throw new Error(trText('Malformed inline image in content stream'));
  }

  for (let i = dataStart; i + 1 < bytes.length; i++) {
    if (!WHITESPACE.has(bytes[i - 1]) || !isEndImageOperator(bytes, i)) {
      continue;
    }
    if (!isFollowedByText(bytes, i + 2)) break;
    return i + 2;
  }
  throw new Error(trText('Unterminated inline image in content stream'));
}

export function parseContentOperations(bytes: Uint8Array): ContentOperation[] {
  const operations: ContentOperation[] = [];
  let operands: ContentToken[] = [];
  let pos = 0;

  while (true) {
    pos = skipWhitespaceAndComments(bytes, pos);
    if (pos >= bytes.length) break;
    const token = readToken(bytes, pos);
    pos = token.end;
    if (token.kind !== 'operator') {
      operands.push(token);
      continue;
    }
    if (token.value === 'BI') pos = skipInlineImage(bytes, pos);
    operations.push({
      operator: token.value,
      operands,
      start: operands.length > 0 ? operands[0].start : token.start,
      end: pos,
    });
    operands = [];
  }

  if (operands.length > 0) {
    operations.push({
      operator: '',
      operands,
      start: operands[0].start,
      end: operands[operands.length - 1].end,
    });
  }
  return operations;
}
