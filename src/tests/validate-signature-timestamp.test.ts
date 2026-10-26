import { describe, it, expect } from 'vitest';
import forge from 'node-forge';
import { validatePdfSignatures } from '@/js/logic/validate-signature-pdf';

const TST_INFO_OID = '1.2.840.113549.1.9.16.1.4';
const RANGE_PLACEHOLDER = '{{RANGE}}';
const RANGE_WIDTH = 64;
const HEX_LENGTH = 8192;
const HEAD =
  '%PDF-1.7\n1 0 obj\n<< /Type /DocTimeStamp /Filter /Adobe.PPKLite ' +
  `/SubFilter /ETSI.RFC3161 ${RANGE_PLACEHOLDER} /Contents `;
const TAIL = ' >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n';

const keys = forge.pki.rsa.generateKeyPair(1024);
const tsaCert = forge.pki.createCertificate();
tsaCert.publicKey = keys.publicKey;
tsaCert.serialNumber = '02';
tsaCert.validity.notBefore = new Date(Date.now() - 86400000);
tsaCert.validity.notAfter = new Date(Date.now() + 86400000 * 365);
tsaCert.setSubject([{ name: 'commonName', value: 'Test TSA' }]);
tsaCert.setIssuer([{ name: 'commonName', value: 'Test TSA' }]);
tsaCert.sign(keys.privateKey, forge.md.sha256.create());

const { asn1 } = forge;
const node = (type: number, value: string | forge.asn1.Asn1[]) =>
  asn1.create(asn1.Class.UNIVERSAL, type, Array.isArray(value), value);
const oid = (id: string) => node(asn1.Type.OID, asn1.oidToDer(id).getBytes());

function tstInfoDer(imprint: string): string {
  return asn1
    .toDer(
      node(asn1.Type.SEQUENCE, [
        node(asn1.Type.INTEGER, asn1.integerToDer(1).getBytes()),
        oid('1.2.3.4.1'),
        node(asn1.Type.SEQUENCE, [
          node(asn1.Type.SEQUENCE, [
            oid(forge.pki.oids.sha256),
            node(asn1.Type.NULL, ''),
          ]),
          node(asn1.Type.OCTETSTRING, imprint),
        ]),
        node(asn1.Type.INTEGER, asn1.integerToDer(42).getBytes()),
        node(asn1.Type.GENERALIZEDTIME, '20260102030405Z'),
      ])
    )
    .getBytes();
}

/** An RFC 3161 token whose TSTInfo carries the given document hash. */
function timestampTokenHex(imprint: string): string {
  const p7 = forge.pkcs7.createSignedData();
  p7.content = forge.util.createBuffer(tstInfoDer(imprint));
  p7.addCertificate(tsaCert);
  p7.addSigner({
    key: keys.privateKey,
    certificate: tsaCert,
    digestAlgorithm: forge.pki.oids.sha256,
    authenticatedAttributes: [
      { type: forge.pki.oids.contentType, value: TST_INFO_OID },
      { type: forge.pki.oids.messageDigest },
    ],
  });
  p7.sign();
  const contentInfo = p7.toAsn1();
  // node-forge always labels the content as id-data; a TSA labels it TSTInfo
  const signedData = (contentInfo.value as forge.asn1.Asn1[])[1]
    .value as forge.asn1.Asn1[];
  const encap = (signedData[0].value as forge.asn1.Asn1[])[2]
    .value as forge.asn1.Asn1[];
  encap[0] = oid(TST_INFO_OID);
  return forge.util.bytesToHex(asn1.toDer(contentInfo).getBytes());
}

function sha256(content: string): string {
  const md = forge.md.sha256.create();
  md.update(content);
  return md.digest().bytes();
}

function buildTimestampedPdf(
  imprintFor: (signedContent: string) => string = sha256
): Uint8Array {
  const headLength = HEAD.length - RANGE_PLACEHOLDER.length + RANGE_WIDTH;
  const gapLength = HEX_LENGTH + 2;
  const byteRange = [0, headLength, headLength + gapLength, TAIL.length];
  const head = HEAD.replace(
    RANGE_PLACEHOLDER,
    `/ByteRange [${byteRange.join(' ')}]`.padEnd(RANGE_WIDTH)
  );
  const hex = timestampTokenHex(imprintFor(head + TAIL)).padEnd(
    HEX_LENGTH,
    '0'
  );
  return new TextEncoder().encode(`${head}<${hex}>${TAIL}`);
}

describe('document timestamps (RFC 3161)', () => {
  it('verifies an intact document timestamp', async () => {
    const [result] = await validatePdfSignatures(buildTimestampedPdf());

    expect(result.isTimestamp).toBe(true);
    expect(result.cryptoVerificationStatus).toBe('verified');
    expect(result.coverageStatus).toBe('full');
    expect(result.isValid).toBe(true);
    expect(result.signerName).toBe('Test TSA');
    expect(result.signatureDate?.toISOString()).toBe(
      '2026-01-02T03:04:05.000Z'
    );
  });

  it('fails when the document no longer matches the timestamped hash', async () => {
    const pdfBytes = buildTimestampedPdf();
    // Rename /Adobe.PPKLite to /Adobe.QPKLite: still a valid PDF, new bytes
    const at = new TextDecoder('latin1').decode(pdfBytes).indexOf('PPKLite');
    pdfBytes[at] = 'Q'.charCodeAt(0);

    const [result] = await validatePdfSignatures(pdfBytes);

    expect(result.isValid).toBe(false);
    expect(result.cryptoVerificationStatus).toBe('failed');
    expect(result.errorMessage).toMatch(/modified after timestamping/);
  });

  it('fails when the token holds the hash of a different document', async () => {
    const [result] = await validatePdfSignatures(
      buildTimestampedPdf(() => sha256('some other document'))
    );

    expect(result.isValid).toBe(false);
    expect(result.cryptoVerificationStatus).toBe('failed');
  });

  it('fails when the TSTInfo was altered after the TSA signed it', async () => {
    const pdfBytes = buildTimestampedPdf();
    const text = new TextDecoder('latin1').decode(pdfBytes);
    // GeneralizedTime 20260102030405Z, hex-encoded inside /Contents
    const timeHex = forge.util.bytesToHex('20260102030405Z');
    const at = text.indexOf(timeHex);
    expect(at).toBeGreaterThan(0);
    pdfBytes[at + 1] = pdfBytes[at + 1] === 0x31 ? 0x32 : 0x31;

    const [result] = await validatePdfSignatures(pdfBytes);

    expect(result.isValid).toBe(false);
    expect(result.cryptoVerificationStatus).toBe('failed');
  });
});
