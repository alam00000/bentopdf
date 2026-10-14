import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  countSignatures,
  extractSignatures,
  validatePdfSignatures,
} from '@/js/logic/validate-signature-pdf';
import {
  buildPdf,
  helvetica,
  textLine,
  type PdfObject,
} from './helpers/pdf-builder';

const SAMPLE_PDF_PATH = path.resolve(__dirname, './fixtures/sample.pdf');
const SIGNED_PDF_PATH = path.resolve(__dirname, './fixtures/signed-sample.pdf');

const enc = new TextEncoder();

/** Byte-exact encoding, so tests can hold non-UTF-8 PDF text strings. */
function latin1Bytes(text: string): Uint8Array {
  const bytes = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++) bytes[i] = text.charCodeAt(i) & 0xff;
  return bytes;
}

/**
 * Hex placeholder of the size real signers reserve for the PKCS#7 blob.
 * Anything above a few kilobytes used to push the sibling keys of the
 * signature dictionary out of the scanned window (issue #831).
 */
function placeholder(hexLength: number): string {
  return 'ab'.repeat(hexLength / 2);
}

function signatureDict(options: {
  typeKey?: string;
  hexLength?: number;
  contentsFirst?: boolean;
  extraKeys?: string;
}): string {
  const type = options.typeKey === undefined ? ' /Type /Sig' : options.typeKey;
  const contents = `/Contents <${placeholder(options.hexLength ?? 24000)}>`;
  const byteRange = '/ByteRange [0 840 24960 1180]';
  const order = options.contentsFirst
    ? `${contents} ${byteRange}`
    : `${byteRange} ${contents}`;

  return `<<${type} /Filter /Adobe.PPKLite /SubFilter /adbe.pkcs7.detached ${order}${
    options.extraKeys ? ' ' + options.extraKeys : ''
  } >>`;
}

/** Minimal AcroForm document carrying the given signature dictionaries. */
function buildPdfWithSignatures(dicts: string[]): Uint8Array {
  const content = enc.encode(textLine('F1', 12, 72, 720, 'Signed document'));
  const firstFieldObj = 6;
  const fieldRefs = dicts
    .map((_, i) => `${firstFieldObj + i * 2} 0 R`)
    .join(' ');

  const objects: PdfObject[] = [
    { body: `<< /Type /Catalog /Pages 2 0 R /AcroForm 5 0 R >>` },
    { body: '<< /Type /Pages /Kids [3 0 R] /Count 1 >>' },
    {
      body:
        '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] ' +
        `/Resources << /Font << /F1 4 0 R >> >> /Contents 9999 0 R /Annots [${fieldRefs}] >>`,
    },
    { body: helvetica() },
    { body: `<< /Fields [${fieldRefs}] /SigFlags 3 >>` },
  ];

  dicts.forEach((dict, i) => {
    const fieldObj = firstFieldObj + i * 2;
    objects.push({
      body:
        `<< /Type /Annot /Subtype /Widget /FT /Sig /T (Signature${i + 1}) ` +
        `/Rect [0 0 0 0] /V ${fieldObj + 1} 0 R >>`,
    });
    objects.push({ body: latin1Bytes(dict) });
  });

  objects.push({ body: `<< /Length ${content.length} >>`, stream: content });

  return buildPdf(objects);
}

/** Appends a second revision holding one more signature dictionary. */
function appendRevision(base: Uint8Array, dict: string): Uint8Array {
  const nextObj = 100;
  const revision = enc.encode(
    `${nextObj} 0 obj\n${dict}\nendobj\n` +
      `xref\n0 1\n0000000000 65535 f \n` +
      `trailer\n<< /Size ${nextObj + 1} /Root 1 0 R /Prev 0 >>\nstartxref\n${base.length}\n%%EOF\n`
  );

  const out = new Uint8Array(base.length + revision.length);
  out.set(base, 0);
  out.set(revision, base.length);
  return out;
}

describe('extractSignatures', () => {
  it('returns no signature for a PDF without one', () => {
    const bytes = new Uint8Array(fs.readFileSync(SAMPLE_PDF_PATH));

    expect(extractSignatures(bytes)).toEqual([]);
    expect(countSignatures(bytes)).toBe(0);
  });

  it('finds a signature whose /Contents placeholder exceeds 10 KB', () => {
    const bytes = buildPdfWithSignatures([signatureDict({ hexLength: 32244 })]);

    const signatures = extractSignatures(bytes);

    expect(signatures).toHaveLength(1);
    expect(signatures[0].byteRange).toEqual([0, 840, 24960, 1180]);
    expect(signatures[0].contents.length).toBeGreaterThan(16000);
  });

  it('finds a signature when /Contents precedes /ByteRange', () => {
    const bytes = buildPdfWithSignatures([
      signatureDict({ hexLength: 32244, contentsFirst: true }),
    ]);

    expect(extractSignatures(bytes)).toHaveLength(1);
  });

  it('finds a signature dictionary without the optional /Type key', () => {
    const bytes = buildPdfWithSignatures([signatureDict({ typeKey: '' })]);

    expect(extractSignatures(bytes)).toHaveLength(1);
  });

  it('finds a document timestamp dictionary', () => {
    const bytes = buildPdfWithSignatures([
      signatureDict({ typeKey: ' /Type /DocTimeStamp' }),
    ]);

    expect(extractSignatures(bytes)).toHaveLength(1);
  });

  it('finds every signature of a multi-signature document', () => {
    const bytes = buildPdfWithSignatures([
      signatureDict({ hexLength: 18944 }),
      signatureDict({ hexLength: 28624 }),
      signatureDict({ hexLength: 32244 }),
    ]);

    const signatures = extractSignatures(bytes);

    expect(signatures.map((s) => s.index)).toEqual([0, 1, 2]);
    expect(countSignatures(bytes)).toBe(3);
  });

  it('finds the signature added by an incremental revision', () => {
    const bytes = appendRevision(
      buildPdfWithSignatures([signatureDict({})]),
      signatureDict({ hexLength: 15140 })
    );

    expect(extractSignatures(bytes)).toHaveLength(2);
  });

  it('keeps a signature whose text strings are not valid UTF-8', () => {
    const bytes = buildPdfWithSignatures([
      signatureDict({
        extraKeys: '/Reason (Sign\xE9 \xE0 Ploemel) /Name (Ren\xE9e)',
      }),
    ]);

    const signatures = extractSignatures(bytes);

    expect(signatures).toHaveLength(1);
    expect(signatures[0].reason).toBe('Sign\xE9 \xE0 Ploemel');
    expect(signatures[0].name).toBe('Ren\xE9e');
  });

  it('decodes UTF-8 text strings', () => {
    const bytes = buildPdfWithSignatures([
      signatureDict({ extraKeys: '/Reason (Sign\xC3\xA9) /Location (Lyon)' }),
    ]);

    const signatures = extractSignatures(bytes);

    expect(signatures[0].reason).toBe('Signé');
    expect(signatures[0].location).toBe('Lyon');
  });

  it('ignores a dictionary that has no /Contents placeholder', () => {
    const bytes = buildPdfWithSignatures([
      '<< /Type /Sig /Filter /Adobe.PPKLite /ByteRange [0 840 24960 1180] >>',
    ]);

    expect(extractSignatures(bytes)).toEqual([]);
  });

  it('ignores a /ByteRange that is not a numeric array', () => {
    const bytes = buildPdfWithSignatures([
      '<< /Type /Sig /ByteRange [0 840 /Placeholder 1180] ' +
        `/Contents <${placeholder(400)}> >>`,
    ]);

    expect(extractSignatures(bytes)).toEqual([]);
  });

  it('ignores signature-looking text inside a content stream', () => {
    const decoy = enc.encode(
      `BT /F1 12 Tf 72 700 Td (${signatureDict({ hexLength: 400 })}) Tj ET`
    );
    const bytes = buildPdf([
      { body: '<< /Type /Catalog /Pages 2 0 R >>' },
      { body: '<< /Type /Pages /Kids [3 0 R] /Count 1 >>' },
      {
        body:
          '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] ' +
          '/Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
      },
      { body: helvetica() },
      { body: `<< /Length ${decoy.length} >>`, stream: decoy },
    ]);

    expect(extractSignatures(bytes)).toEqual([]);
    expect(countSignatures(bytes)).toBe(0);
  });

  it('ignores signature-looking text inside a literal string', () => {
    const bytes = buildPdfWithSignatures([
      `<< /Type /Annot /T (note: ${signatureDict({ hexLength: 400 })}) >>`,
    ]);

    expect(extractSignatures(bytes)).toEqual([]);
  });

  it('reads the keys outside a string that mimics them', () => {
    const bytes = buildPdfWithSignatures([
      signatureDict({
        extraKeys: '/Reason (fake /ByteRange [1 2 3 4] /Contents <ffff>)',
      }),
    ]);

    const signatures = extractSignatures(bytes);
    expect(signatures).toHaveLength(1);
    expect(signatures[0].byteRange).toEqual([0, 840, 24960, 1180]);
    expect(signatures[0].reason).toBe(
      'fake /ByteRange [1 2 3 4] /Contents <ffff>'
    );
  });

  it('rejects a /ByteRange with an odd number of entries', () => {
    const bytes = buildPdfWithSignatures([
      `<< /Type /Sig /ByteRange [0 840 24960] /Contents <${placeholder(400)}> >>`,
    ]);

    expect(extractSignatures(bytes)).toEqual([]);
  });

  it('accepts a /ByteRange with more than two pairs', () => {
    const bytes = buildPdfWithSignatures([
      `<< /Type /Sig /ByteRange [0 100 300 100 600 100] /Contents <${placeholder(400)}> >>`,
    ]);

    const signatures = extractSignatures(bytes);
    expect(signatures).toHaveLength(1);
    expect(signatures[0].byteRange).toEqual([0, 100, 300, 100, 600, 100]);
  });

  it('stays linear on a file full of unterminated object headers', () => {
    const bytes = enc.encode(
      '%PDF-1.7\n' + '1 0 obj\n<< /ByteRange [0 1 2 3] >>\n'.repeat(20000)
    );

    const started = performance.now();
    expect(extractSignatures(bytes)).toEqual([]);
    expect(performance.now() - started).toBeLessThan(2000);
  });

  it('reports each signature only once per object', () => {
    const bytes = buildPdfWithSignatures([signatureDict({})]);

    expect(extractSignatures(bytes)).toHaveLength(1);
  });
});

describe('validatePdfSignatures', () => {
  it('verifies a genuinely signed PDF', async () => {
    const bytes = new Uint8Array(fs.readFileSync(SIGNED_PDF_PATH));

    const results = await validatePdfSignatures(bytes);

    expect(results).toHaveLength(1);
    expect(results[0].errorMessage).toBeUndefined();
    expect(results[0].cryptoVerificationStatus).toBe('verified');
    expect(results[0].cryptoVerified).toBe(true);
    expect(results[0].coverageStatus).toBe('full');
    expect(results[0].isSelfSigned).toBe(true);
    expect(results[0].signerName).toBe('BentoPDF Test Signer');
    expect(results[0].reason).toBe('Test signature for BentoPDF issue 831');
    expect(results[0].location).toBe('Test Suite');
    expect(results[0].algorithms.digest).toBe('SHA-256');
  });

  it('returns nothing for a PDF without signatures', async () => {
    const bytes = new Uint8Array(fs.readFileSync(SAMPLE_PDF_PATH));

    await expect(validatePdfSignatures(bytes)).resolves.toEqual([]);
  });
});
