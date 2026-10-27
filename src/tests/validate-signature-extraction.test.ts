import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import forge from 'node-forge';
import { signPdf, parsePemFiles } from '@/js/logic/digital-sign-pdf';
import {
  countSignatures,
  extractSignatures,
  validatePdfSignatures,
} from '@/js/logic/validate-signature-pdf';
import type { CertificateData } from '@/types';

const RANGE_PLACEHOLDER = '{{RANGE}}';
const RANGE_WIDTH = 64;
const HEX_LENGTH = 8192;
const SIG_HEAD =
  '%PDF-1.7\n1 0 obj\n<< /Type /Sig /Filter /Adobe.PPKLite /SubFilter /adbe.pkcs7.detached ';
const SIG_TAIL =
  ' /M (D:20260101120000Z) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n';

const keys = forge.pki.rsa.generateKeyPair(1024);
const cert = forge.pki.createCertificate();
cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = new Date(Date.now() - 86400000);
cert.validity.notAfter = new Date(Date.now() + 86400000 * 365);
cert.setSubject([{ name: 'commonName', value: 'Test Signer' }]);
cert.setIssuer([{ name: 'commonName', value: 'Test Signer' }]);
cert.sign(keys.privateKey, forge.md.sha256.create());

const certificateData: CertificateData = parsePemFiles(
  forge.pki.certificateToPem(cert),
  forge.pki.privateKeyToPem(keys.privateKey)
);

const samplePdf = new Uint8Array(
  fs.readFileSync(path.resolve(__dirname, './fixtures/sample.pdf'))
);

function signedCmsHex(content: string): string {
  const p7 = forge.pkcs7.createSignedData();
  p7.content = forge.util.createBuffer(content);
  p7.addCertificate(cert);
  p7.addSigner({
    key: keys.privateKey,
    certificate: cert,
    digestAlgorithm: forge.pki.oids.sha256,
    authenticatedAttributes: [
      { type: forge.pki.oids.contentType, value: forge.pki.oids.data },
      { type: forge.pki.oids.messageDigest },
    ],
  });
  p7.sign({ detached: true });
  return forge.util.bytesToHex(forge.asn1.toDer(p7.toAsn1()).getBytes());
}

function buildSignedPdf(layout: {
  prefix?: string;
  head: string;
  gap: (hex: string) => string;
  tail: string;
  hexLength?: number;
}): Uint8Array {
  const prefix = layout.prefix ?? '';
  const hexLength = layout.hexLength ?? HEX_LENGTH;
  const headLength =
    layout.head.length - RANGE_PLACEHOLDER.length + RANGE_WIDTH;
  const gapLength = layout.gap('0'.repeat(hexLength)).length;
  const byteRange = [
    prefix.length,
    headLength,
    prefix.length + headLength + gapLength,
    layout.tail.length,
  ];
  const head = layout.head.replace(
    RANGE_PLACEHOLDER,
    `/ByteRange [${byteRange.join(' ')}]`.padEnd(RANGE_WIDTH)
  );
  const hex = signedCmsHex(head + layout.tail).padEnd(hexLength, '0');
  return new TextEncoder().encode(
    prefix + head + layout.gap(hex) + layout.tail
  );
}

function appendIncrementalUpdate(pdfBytes: Uint8Array): Uint8Array {
  const update = new TextEncoder().encode(
    '\n2 0 obj\n<< /Type /Annot /Subtype /Text /Contents (Added later) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n'
  );
  const updated = new Uint8Array(pdfBytes.length + update.length);
  updated.set(pdfBytes, 0);
  updated.set(update, pdfBytes.length);
  return updated;
}

describe('validatePdfSignatures extraction and coverage', () => {
  it('validates a signature made by the app signer with full coverage', async () => {
    const signed = await signPdf(samplePdf, certificateData, {
      signatureInfo: {
        reason: 'Approved (final) é',
        location: '東京',
        contactInfo: 'signer@example.com',
      },
    });

    const results = await validatePdfSignatures(signed);

    expect(countSignatures(signed)).toBe(1);
    expect(results).toHaveLength(1);
    expect(results[0].cryptoVerified).toBe(true);
    expect(results[0].coverageStatus).toBe('full');
    expect(results[0].isValid).toBe(true);
    expect(results[0].errorMessage).toBeUndefined();
    expect(results[0].signerName).toBe('Test Signer');
    expect(results[0].reason).toBe('Approved (final) é');
    expect(results[0].location).toBe('東京');
    expect(results[0].contactInfo).toBe('signer@example.com');
    expect(results[0].signatureDate).toBeInstanceOf(Date);
  });

  it('validates a hand-assembled signature whose gap is exactly its /Contents', async () => {
    const pdfBytes = buildSignedPdf({
      head: `${SIG_HEAD}${RANGE_PLACEHOLDER} /Prop_Build << /App << /Name /Builder >> >> /Name (Real Signer) /Contents `,
      gap: (hex) => `<${hex}>`,
      tail: SIG_TAIL,
    });

    const [result] = await validatePdfSignatures(pdfBytes);

    expect(result.isValid).toBe(true);
    expect(result.coverageStatus).toBe('full');
    expect(result.signatureDate).toBeInstanceOf(Date);
    expect(extractSignatures(pdfBytes)[0].name).toBe('Real Signer');
  });

  it('validates a signature whose /Contents placeholder is tens of kilobytes', async () => {
    // Signers routinely reserve 4-40 KB for the CMS blob (issue #831).
    const pdfBytes = buildSignedPdf({
      head: `${SIG_HEAD}${RANGE_PLACEHOLDER} /Contents `,
      gap: (hex) => `<${hex}>`,
      tail: SIG_TAIL,
      hexLength: 74506,
    });

    const results = await validatePdfSignatures(pdfBytes);

    expect(results).toHaveLength(1);
    expect(results[0].isValid).toBe(true);
    expect(results[0].coverageStatus).toBe('full');
  });

  it('validates a signature dictionary without the optional /Type key', async () => {
    const pdfBytes = buildSignedPdf({
      head: `${SIG_HEAD.replace('/Type /Sig ', '')}${RANGE_PLACEHOLDER} /Contents `,
      gap: (hex) => `<${hex}>`,
      tail: SIG_TAIL,
    });

    const results = await validatePdfSignatures(pdfBytes);

    expect(countSignatures(pdfBytes)).toBe(1);
    expect(results).toHaveLength(1);
    expect(results[0].isValid).toBe(true);
    expect(results[0].coverageStatus).toBe('full');
  });

  it('does not take other untyped dictionaries for signatures', () => {
    const pdfBytes = new TextEncoder().encode(
      '%PDF-1.7\n' +
        '1 0 obj\n<< /Subtype /Text /Contents (A note) >>\nendobj\n' +
        '2 0 obj\n<< /Filter /Adobe.PPKLite /SubFilter /ETSI.RFC3161 ' +
        '/ByteRange [0 10 20 10] /Contents <00> >>\nendobj\n' +
        '3 0 obj\n<< /Type /DocTimeStamp /ByteRange [0 10 20 10] ' +
        '/Contents <00> >>\nendobj\n%%EOF\n'
    );

    expect(countSignatures(pdfBytes)).toBe(0);
  });

  it('reports an intact signature as partial when an incremental update follows', async () => {
    const signed = await signPdf(samplePdf, certificateData, {
      signatureInfo: { reason: 'Original' },
    });

    const [result] = await validatePdfSignatures(
      appendIncrementalUpdate(signed)
    );

    expect(result.cryptoVerified).toBe(true);
    expect(result.cryptoVerificationStatus).toBe('verified');
    expect(result.coverageStatus).toBe('partial');
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBeUndefined();
    expect(result.reason).toBe('Original');
  });

  it('keeps the earlier signature partial and the latest one full in a multi-signed file', async () => {
    const first = await signPdf(samplePdf, certificateData, {
      signatureInfo: { reason: 'First' },
    });
    const second = await signPdf(first, certificateData, {
      signatureInfo: { reason: 'Second' },
    });

    const results = await validatePdfSignatures(second);

    expect(countSignatures(second)).toBe(2);
    expect(results.map((r) => r.reason)).toEqual(['First', 'Second']);
    expect(results.map((r) => r.coverageStatus)).toEqual(['partial', 'full']);
    expect(results.map((r) => r.cryptoVerified)).toEqual([true, true]);
    expect(results.map((r) => r.errorMessage)).toEqual([undefined, undefined]);
    expect(results[1].isValid).toBe(true);
  });

  it('rejects a decoy /Contents whose gap holds a different signature', async () => {
    const pdfBytes = buildSignedPdf({
      head: `${SIG_HEAD}/Contents <> ${RANGE_PLACEHOLDER} /Decoy /Contents `,
      gap: (hex) => `<${hex}>`,
      tail: SIG_TAIL,
    });

    const results = await validatePdfSignatures(pdfBytes);

    expect(results).toHaveLength(1);
    expect(results[0].isValid).toBe(false);
    expect(results[0].cryptoVerified).toBe(false);
    expect(results[0].coverageStatus).toBe('unknown');
    expect(results[0].errorMessage).toMatch(
      /not the \/Contents of this signature/
    );
  });

  it('rejects a ByteRange that does not start at byte 0', async () => {
    const pdfBytes = buildSignedPdf({
      prefix:
        '%PDF-1.7\n9 0 obj\n<< /Type /Catalog /Unsigned true >>\nendobj\n',
      head: `${SIG_HEAD}${RANGE_PLACEHOLDER} /Contents `,
      gap: (hex) => `<${hex}>`,
      tail: SIG_TAIL,
    });

    const results = await validatePdfSignatures(pdfBytes);

    expect(results).toHaveLength(1);
    expect(results[0].isValid).toBe(false);
    expect(results[0].cryptoVerified).toBe(false);
    expect(results[0].errorMessage).toMatch(
      /does not start at the beginning of the file/
    );
  });

  it('rejects a gap that carries unsigned bytes after the hex signature', async () => {
    const pdfBytes = buildSignedPdf({
      head: `${SIG_HEAD}${RANGE_PLACEHOLDER} /Contents `,
      gap: (hex) => `<${hex}> /Reason (Approved by the CEO)`,
      tail: SIG_TAIL,
    });

    const results = await validatePdfSignatures(pdfBytes);

    expect(results).toHaveLength(1);
    expect(results[0].isValid).toBe(false);
    expect(results[0].cryptoVerified).toBe(false);
    expect(results[0].errorMessage).toMatch(
      /not exactly a hex-encoded signature/
    );
  });
});
