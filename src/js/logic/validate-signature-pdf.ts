import forge from 'node-forge';
import { SignatureValidationResult } from '@/types';
import type { ExtractedSignatureWithError, PdfValueSpan } from '@/types';

import { trText } from '../i18n/i18n.js';

const INSECURE_DIGEST_OIDS = new Set<string>([
  '1.2.840.113549.2.5',
  '1.3.14.3.2.26',
]);

const MIN_RSA_EXPONENT = new forge.jsbn.BigInteger('65537');

const PDF_WHITESPACE = new Set('\0\t\n\f\r ');
const PDF_TOKEN_TERMINATORS = new Set('\0\t\n\f\r ()<>[]{}/%');
const PDF_STRING_ESCAPES: Record<string, string> = {
  n: '\n',
  r: '\r',
  t: '\t',
  b: '\b',
  f: '\f',
  '\r\n': '',
  '\r': '',
  '\n': '',
};

export function extractSignatures(
  pdfBytes: Uint8Array
): ExtractedSignatureWithError[] {
  const signatures: ExtractedSignatureWithError[] = [];
  const pdfString = new TextDecoder('latin1').decode(pdfBytes);

  // Find all signature dictionaries (see isSignatureDictionary)
  const objectHeader = /\d+\s+\d+\s+obj\b/g;
  let endobj = -1;

  while (objectHeader.exec(pdfString) !== null) {
    const start = objectHeader.lastIndex;
    if (endobj < start) {
      endobj = pdfString.indexOf('endobj', start);
      if (endobj < 0) endobj = pdfString.length;
    }
    const body = pdfString.slice(0, endobj);
    const dictionaries: Map<string, PdfValueSpan>[] = [];
    const end = parsePdfValue(
      body,
      skipPdfWhitespace(body, start),
      dictionaries,
      0
    );
    objectHeader.lastIndex = end < 0 ? endobj : end;
    if (end < 0) continue;

    for (const entries of dictionaries) {
      if (isSignatureDictionary(pdfString, entries)) {
        signatures.push(
          readSignatureDictionary(
            pdfString,
            pdfBytes,
            entries,
            signatures.length
          )
        );
      }
    }
  }

  return signatures;
}

/**
 * /Type is optional in a signature dictionary (PDF 32000-1, 12.8.1, Table
 * 252), and some signers leave it out, so a dictionary without /Type that
 * carries both /ByteRange and /Contents is a signature too. Document
 * timestamps (/Type /DocTimeStamp, /SubFilter /ETSI.RFC3161) hold an RFC 3161
 * token rather than a CMS signature over the document and stay out.
 */
function isSignatureDictionary(
  pdfString: string,
  entries: Map<string, PdfValueSpan>
): boolean {
  const name = (key: string) => {
    const span = entries.get(key);
    return span ? pdfString.slice(span.start, span.end) : undefined;
  };
  const type = name('Type');
  if (type !== undefined) return type === '/Sig';
  return (
    entries.has('ByteRange') &&
    entries.has('Contents') &&
    name('SubFilter') !== '/ETSI.RFC3161'
  );
}

function readSignatureDictionary(
  pdfString: string,
  pdfBytes: Uint8Array,
  entries: Map<string, PdfValueSpan>,
  index: number
): ExtractedSignatureWithError {
  const text = (key: string) => decodePdfText(pdfBytes, entries.get(key));
  const timeMatch = text('M')?.match(
    /^D:(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/
  );
  const signature: ExtractedSignatureWithError = {
    index,
    contents: new Uint8Array(0),
    byteRange: [],
    reason: text('Reason'),
    location: text('Location'),
    contactInfo: text('ContactInfo'),
    name: text('Name'),
    signingTime: timeMatch
      ? `${timeMatch[1]}-${timeMatch[2]}-${timeMatch[3]}T${timeMatch[4]}:${timeMatch[5]}:${timeMatch[6]}`
      : undefined,
  };

  const rangeSpan = entries.get('ByteRange');
  const rangeMatch = rangeSpan
    ? /^\[\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s*\]$/.exec(
        pdfString.slice(rangeSpan.start, rangeSpan.end)
      )
    : null;
  if (!rangeMatch) {
    signature.extractionError = trText(
      'Signature has a missing or malformed /ByteRange'
    );
    return signature;
  }

  signature.byteRange = rangeMatch.slice(1).map(Number);
  const byteRangeError = getByteRangeError(
    signature.byteRange,
    pdfBytes.length
  );
  if (byteRangeError) {
    signature.extractionError = byteRangeError;
    return signature;
  }

  const gapStart = signature.byteRange[0] + signature.byteRange[1];
  const gapEnd = signature.byteRange[2];
  const gap = pdfString.slice(gapStart, gapEnd);
  if (gap.length % 2 !== 0 || !/^<[0-9A-Fa-f]+>$/.test(gap)) {
    signature.extractionError = trText(
      'The bytes excluded by /ByteRange are not exactly a hex-encoded signature'
    );
    return signature;
  }

  const contentsSpan = entries.get('Contents');
  if (contentsSpan?.start !== gapStart || contentsSpan.end !== gapEnd) {
    signature.extractionError = trText(
      'The bytes excluded by /ByteRange are not the /Contents of this signature'
    );
    return signature;
  }

  const contents = hexToBytes(gap.slice(1, -1));
  const derObjectLength = getDerObjectLength(contents);
  if (
    derObjectLength === null ||
    derObjectLength > contents.length ||
    contents.subarray(derObjectLength).some((byte) => byte !== 0)
  ) {
    signature.extractionError = trText(
      'Signature /Contents is not a single DER object followed by zero padding'
    );
    return signature;
  }

  signature.contents = contents.slice(0, derObjectLength);
  return signature;
}

function getByteRangeError(
  byteRange: number[],
  fileLength: number
): string | null {
  if (
    byteRange.length !== 4 ||
    !byteRange.every((value) => Number.isSafeInteger(value) && value >= 0)
  ) {
    return trText('Malformed ByteRange');
  }
  const [start1, len1, start2, len2] = byteRange;
  if (start1 !== 0) {
    return trText('ByteRange does not start at the beginning of the file');
  }
  if (start1 + len1 > start2 || start2 + len2 > fileLength) {
    return trText('ByteRange out of bounds');
  }
  return null;
}

function skipPdfWhitespace(text: string, pos: number): number {
  while (pos < text.length) {
    if (text[pos] === '%') {
      while (pos < text.length && text[pos] !== '\n' && text[pos] !== '\r') {
        pos++;
      }
    } else if (PDF_WHITESPACE.has(text[pos])) {
      pos++;
    } else {
      break;
    }
  }
  return pos;
}

function findTokenEnd(text: string, pos: number): number {
  while (pos < text.length && !PDF_TOKEN_TERMINATORS.has(text[pos])) pos++;
  return pos;
}

function findLiteralStringEnd(text: string, start: number): number {
  let depth = 0;
  for (let pos = start; pos < text.length; pos++) {
    if (text[pos] === '\\') {
      pos++;
    } else if (text[pos] === '(') {
      depth++;
    } else if (text[pos] === ')') {
      depth--;
      if (depth === 0) return pos + 1;
    }
  }
  return -1;
}

function parsePdfValue(
  text: string,
  start: number,
  dictionaries: Map<string, PdfValueSpan>[],
  depth: number
): number {
  if (depth > 32 || start >= text.length) return -1;

  if (text.startsWith('<<', start)) {
    const entries = new Map<string, PdfValueSpan>();
    dictionaries.push(entries);
    let pos = skipPdfWhitespace(text, start + 2);
    while (!text.startsWith('>>', pos)) {
      const keyEnd = text[pos] === '/' ? findTokenEnd(text, pos + 1) : pos;
      const valueStart = skipPdfWhitespace(text, keyEnd);
      const valueEnd = parsePdfValue(text, valueStart, dictionaries, depth + 1);
      if (valueEnd < 0) return -1;
      if (keyEnd > pos) {
        entries.set(text.slice(pos + 1, keyEnd), {
          start: valueStart,
          end: valueEnd,
        });
      }
      pos = skipPdfWhitespace(text, valueEnd);
    }
    return pos + 2;
  }

  if (text[start] === '<') {
    const end = text.indexOf('>', start);
    return end < 0 ? -1 : end + 1;
  }

  if (text[start] === '(') return findLiteralStringEnd(text, start);

  if (text[start] === '[') {
    let pos = skipPdfWhitespace(text, start + 1);
    while (text[pos] !== ']') {
      const end = parsePdfValue(text, pos, dictionaries, depth + 1);
      if (end < 0) return -1;
      pos = skipPdfWhitespace(text, end);
    }
    return pos + 1;
  }

  const end = findTokenEnd(text, text[start] === '/' ? start + 1 : start);
  return end > start ? end : -1;
}

function decodePdfText(
  pdfBytes: Uint8Array,
  span: PdfValueSpan | undefined
): string | undefined {
  if (!span) return undefined;
  const raw = uint8ToLatin1(pdfBytes.subarray(span.start, span.end));
  let text: string;
  if (raw.startsWith('(')) {
    text = raw
      .slice(1, -1)
      .replace(/\\([0-7]{1,3}|\r\n|[\s\S])/g, (_, escaped: string) =>
        /^[0-7]/.test(escaped)
          ? String.fromCharCode(parseInt(escaped, 8) & 0xff)
          : (PDF_STRING_ESCAPES[escaped] ?? escaped)
      );
  } else if (/^<[0-9A-Fa-f\s]*>$/.test(raw)) {
    const hex = raw.slice(1, -1).replace(/\s/g, '');
    text = uint8ToLatin1(hexToBytes(hex.length % 2 ? hex + '0' : hex));
  } else {
    return undefined;
  }

  const bytes = latin1ToUint8(text);
  if (text.startsWith('\xfe\xff')) {
    return new TextDecoder('utf-16be').decode(bytes.subarray(2));
  }
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return text;
  }
}

function getDerObjectLength(bytes: Uint8Array): number | null {
  if (bytes.length < 2) return null;
  if (bytes[1] < 0x80) return 2 + bytes[1];
  const count = bytes[1] & 0x7f;
  if (count === 0 || count > 4 || bytes.length < 2 + count) return null;
  let length = 0;
  for (let i = 0; i < count; i++) length = length * 256 + bytes[2 + i];
  return 2 + count + length;
}

export async function validateSignature(
  signature: ExtractedSignatureWithError,
  pdfBytes: Uint8Array,
  trustedCert?: forge.pki.Certificate
): Promise<SignatureValidationResult> {
  const result: SignatureValidationResult = {
    signatureIndex: signature.index,
    isValid: false,
    signerName: trText('Unknown'),
    issuer: trText('Unknown'),
    validFrom: new Date(0),
    validTo: new Date(0),
    isExpired: false,
    isSelfSigned: false,
    isTrusted: false,
    algorithms: { digest: trText('Unknown'), signature: trText('Unknown') },
    serialNumber: '',
    byteRange: signature.byteRange,
    coverageStatus: 'unknown',
    reason: signature.reason,
    location: signature.location,
    contactInfo: signature.contactInfo,
  };

  if (signature.extractionError) {
    result.errorMessage = signature.extractionError;
    result.cryptoVerified = false;
    result.cryptoVerificationStatus = 'failed';
    return result;
  }

  try {
    const binaryString = String.fromCharCode.apply(
      null,
      Array.from(signature.contents)
    );
    const asn1 = forge.asn1.fromDer(binaryString);
    const p7 = forge.pkcs7.messageFromAsn1(
      asn1
    ) as forge.pkcs7.PkcsSignedData & {
      rawCapture?: {
        digestAlgorithm?: string;
        authenticatedAttributes?: forge.asn1.Asn1[];
        signature?: string;
        signatureAlgorithm?: forge.asn1.Asn1[];
        issuer?: forge.asn1.Asn1;
        serial?: string;
      };
    };

    if (!p7.certificates || p7.certificates.length === 0) {
      result.errorMessage = trText('No certificates found in signature');
      return result;
    }

    const certificates = p7.certificates as forge.pki.Certificate[];
    const signerCert = findSignerCertificate(
      certificates,
      p7.rawCapture?.issuer,
      p7.rawCapture?.serial
    );
    if (!signerCert) {
      result.errorMessage = trText('Could not parse signer info');
      return result;
    }

    const subjectCN = signerCert.subject.getField('CN');
    const subjectO = signerCert.subject.getField('O');
    const subjectE =
      signerCert.subject.getField('E') ||
      signerCert.subject.getField('emailAddress');
    const issuerCN = signerCert.issuer.getField('CN');
    const issuerO = signerCert.issuer.getField('O');

    result.signerName = (subjectCN?.value as string) ?? trText('Unknown');
    result.signerOrg = subjectO?.value as string | undefined;
    result.signerEmail = subjectE?.value as string | undefined;
    result.issuer = (issuerCN?.value as string) ?? trText('Unknown');
    result.issuerOrg = issuerO?.value as string | undefined;
    result.validFrom = signerCert.validity.notBefore;
    result.validTo = signerCert.validity.notAfter;
    result.serialNumber = signerCert.serialNumber;

    const now = new Date();
    result.isExpired = now > result.validTo || now < result.validFrom;

    result.isSelfSigned = signerCert.isIssuer(signerCert);

    // Check trust against provided certificate (cryptographic, not name/serial match)
    if (trustedCert) {
      try {
        result.isTrusted = chainsToTrustedCert(
          signerCert,
          certificates,
          trustedCert
        );
      } catch {
        result.isTrusted = false;
      }
    }

    const signerInfoFields = extractSignerInfoFields(p7);
    const digestOid = signerInfoFields?.digestOid;

    result.algorithms = {
      digest:
        (digestOid && getDigestAlgorithmName(digestOid)) ||
        getDigestAlgorithmName(signerCert.siginfo?.algorithmOid || ''),
      signature: getSignatureAlgorithmName(signerCert.signatureOid || ''),
    };

    if (digestOid && INSECURE_DIGEST_OIDS.has(digestOid)) {
      result.usesInsecureDigest = true;
    }

    // Parse signing time if available in signature
    if (signature.signingTime) {
      result.signatureDate = new Date(signature.signingTime);
    } else {
      try {
        const attrs = p7.rawCapture?.authenticatedAttributes;
        if (attrs) {
          for (const attrNode of attrs) {
            const attrChildren = attrNode.value;
            if (!Array.isArray(attrChildren) || attrChildren.length < 2)
              continue;
            const oidNode = attrChildren[0];
            const setNode = attrChildren[1];
            if (!oidNode || oidNode.type !== forge.asn1.Type.OID) continue;
            const oid = forge.asn1.derToOid(oidNode.value as string);
            if (oid === forge.pki.oids.signingTime) {
              const setValue = setNode?.value;
              if (Array.isArray(setValue) && setValue[0]) {
                const timeNode = setValue[0];
                const timeStr = timeNode.value as string;
                if (typeof timeStr === 'string' && timeStr.length > 0) {
                  result.signatureDate =
                    timeNode.type === forge.asn1.Type.UTCTIME
                      ? forge.asn1.utcTimeToDate(timeStr)
                      : forge.asn1.generalizedTimeToDate(timeStr);
                }
              }
              break;
            }
          }
        }
      } catch (e) {
        console.warn(
          'Failed to extract signing time from authenticated attributes',
          e
        );
      }
    }

    if (signature.byteRange && signature.byteRange.length === 4) {
      const [, , start2, len2] = signature.byteRange;
      const expectedEnd = start2 + len2;

      if (expectedEnd === pdfBytes.length) {
        result.coverageStatus = 'full';
      } else if (expectedEnd < pdfBytes.length) {
        result.coverageStatus = 'partial';
      }
    }

    const verification = await performCryptoVerification(
      p7,
      pdfBytes,
      signature.byteRange,
      signerCert,
      signerInfoFields
    );

    result.cryptoVerified = verification.status === 'verified';
    result.cryptoVerificationStatus = verification.status;
    if (verification.status === 'unsupported') {
      result.unsupportedAlgorithmReason = verification.reason;
    } else if (verification.status === 'failed') {
      result.errorMessage =
        verification.reason || trText('Cryptographic verification failed');
    }

    result.isValid =
      verification.status === 'verified' &&
      result.coverageStatus === 'full' &&
      !result.usesInsecureDigest;
  } catch (e) {
    result.errorMessage =
      e instanceof Error ? e.message : trText('Failed to parse signature');
  }

  return result;
}

function findSignerCertificate(
  certificates: forge.pki.Certificate[],
  issuer: forge.asn1.Asn1 | undefined,
  serial: string | undefined
): forge.pki.Certificate | null {
  if (issuer && serial) {
    const serialHex = forge.util.createBuffer(serial).toHex();
    const issuerDer = forge.asn1.toDer(issuer).getBytes();
    const match = certificates.find(
      (cert) =>
        cert.serialNumber === serialHex &&
        forge.asn1
          .toDer(forge.pki.distinguishedNameToAsn1(cert.issuer))
          .getBytes() === issuerDer
    );
    return match ?? null;
  }
  return certificates[0];
}

function hasLowRsaExponent(key: unknown): boolean {
  const exponent = (key as Partial<forge.pki.rsa.PublicKey> | undefined)?.e;
  return !!exponent && exponent.compareTo(MIN_RSA_EXPONENT) < 0;
}

function isIssuedBy(
  issuer: forge.pki.Certificate,
  child: forge.pki.Certificate
): boolean {
  if (hasLowRsaExponent(issuer.publicKey)) return false;
  try {
    return issuer.verify(child);
  } catch {
    return false;
  }
}

function isCertificateAuthority(cert: forge.pki.Certificate): boolean {
  const basicConstraints = cert.getExtension('basicConstraints') as
    | { cA?: boolean }
    | undefined;
  return basicConstraints?.cA === true;
}

function chainsToTrustedCert(
  signerCert: forge.pki.Certificate,
  certificates: forge.pki.Certificate[],
  trustedCert: forge.pki.Certificate
): boolean {
  const trustedPem = forge.pki.certificateToPem(trustedCert);
  const visited = new Set<string>();
  let current = signerCert;

  for (let depth = 0; depth < 10; depth++) {
    const currentPem = forge.pki.certificateToPem(current);
    if (currentPem === trustedPem || isIssuedBy(trustedCert, current)) {
      return true;
    }
    if (visited.has(currentPem)) return false;
    visited.add(currentPem);

    const parent = certificates.find(
      (cert) => isCertificateAuthority(cert) && isIssuedBy(cert, current)
    );
    if (!parent) return false;
    current = parent;
  }
  return false;
}

export async function validatePdfSignatures(
  pdfBytes: Uint8Array,
  trustedCert?: forge.pki.Certificate
): Promise<SignatureValidationResult[]> {
  const signatures = extractSignatures(pdfBytes);
  return Promise.all(
    signatures.map((sig) => validateSignature(sig, pdfBytes, trustedCert))
  );
}

export function countSignatures(pdfBytes: Uint8Array): number {
  return extractSignatures(pdfBytes).length;
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

function getDigestAlgorithmName(oid: string): string {
  const digestAlgorithms: Record<string, string> = {
    '1.2.840.113549.2.5': 'MD5',
    '1.3.14.3.2.26': 'SHA-1',
    '2.16.840.1.101.3.4.2.1': 'SHA-256',
    '2.16.840.1.101.3.4.2.2': 'SHA-384',
    '2.16.840.1.101.3.4.2.3': 'SHA-512',
    '2.16.840.1.101.3.4.2.4': 'SHA-224',
  };
  return digestAlgorithms[oid] || oid || trText('Unknown');
}

function getSignatureAlgorithmName(oid: string): string {
  const signatureAlgorithms: Record<string, string> = {
    '1.2.840.113549.1.1.1': 'RSA',
    '1.2.840.113549.1.1.5': 'RSA with SHA-1',
    '1.2.840.113549.1.1.11': 'RSA with SHA-256',
    '1.2.840.113549.1.1.12': 'RSA with SHA-384',
    '1.2.840.113549.1.1.13': 'RSA with SHA-512',
    '1.2.840.10045.2.1': 'ECDSA',
    '1.2.840.10045.4.1': 'ECDSA with SHA-1',
    '1.2.840.10045.4.3.2': 'ECDSA with SHA-256',
    '1.2.840.10045.4.3.3': 'ECDSA with SHA-384',
    '1.2.840.10045.4.3.4': 'ECDSA with SHA-512',
  };
  return signatureAlgorithms[oid] || oid || trText('Unknown');
}

interface SignerInfoFields {
  digestOid: string;
  authAttrs: forge.asn1.Asn1[] | null;
  signatureBytes: string;
}

function extractSignerInfoFields(
  p7: forge.pkcs7.PkcsSignedData & {
    rawCapture?: {
      digestAlgorithm?: string;
      authenticatedAttributes?: forge.asn1.Asn1[];
      signature?: string;
    };
  }
): SignerInfoFields | null {
  const rc = p7.rawCapture;
  if (!rc) return null;
  const digestAlgorithmBytes = rc.digestAlgorithm;
  const signatureBytes = rc.signature;
  if (typeof digestAlgorithmBytes !== 'string' || !signatureBytes) return null;

  return {
    digestOid: forge.asn1.derToOid(digestAlgorithmBytes),
    authAttrs: Array.isArray(rc.authenticatedAttributes)
      ? rc.authenticatedAttributes
      : null,
    signatureBytes,
  };
}

function createMd(digestOid: string): forge.md.MessageDigest | null {
  switch (digestOid) {
    case forge.pki.oids.sha256:
      return forge.md.sha256.create();
    case forge.pki.oids.sha384:
      return forge.md.sha384.create();
    case forge.pki.oids.sha512:
      return forge.md.sha512.create();
    case forge.pki.oids.sha1:
      return forge.md.sha1.create();
    case forge.pki.oids.md5:
      return forge.md.md5.create();
    default:
      return null;
  }
}

function uint8ToLatin1(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += String.fromCharCode(bytes[i]);
  }
  return out;
}

type CryptoVerificationResult =
  | { status: 'verified' }
  | { status: 'failed'; reason: string }
  | { status: 'unsupported'; reason: string };

interface SigScheme {
  kind: 'rsa-pkcs1' | 'rsa-pss' | 'ecdsa' | 'rsa-raw';
  hashName: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';
  pssSaltLength?: number;
}

function latin1ToUint8(str: string): Uint8Array {
  const out = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) out[i] = str.charCodeAt(i);
  return out;
}

function hashNameFromOid(oid: string): SigScheme['hashName'] | null {
  switch (oid) {
    case '1.3.14.3.2.26':
      return 'SHA-1';
    case '2.16.840.1.101.3.4.2.1':
      return 'SHA-256';
    case '2.16.840.1.101.3.4.2.2':
      return 'SHA-384';
    case '2.16.840.1.101.3.4.2.3':
      return 'SHA-512';
    default:
      return null;
  }
}

function detectSigScheme(
  signatureAlgorithmArr: forge.asn1.Asn1[] | undefined,
  digestOid: string
): SigScheme | { unsupported: string } {
  if (!signatureAlgorithmArr || signatureAlgorithmArr.length === 0) {
    return { unsupported: trText('Missing signatureAlgorithm') };
  }
  const oidNode = signatureAlgorithmArr[0];
  if (!oidNode || oidNode.type !== forge.asn1.Type.OID) {
    return { unsupported: trText('Malformed signatureAlgorithm') };
  }
  const oid = forge.asn1.derToOid(oidNode.value as string);
  const implicitHash = hashNameFromOid(digestOid);

  switch (oid) {
    case '1.2.840.113549.1.1.1':
      return implicitHash
        ? { kind: 'rsa-pkcs1', hashName: implicitHash }
        : {
            unsupported: trText('Unsupported digest OID {{digestOid}}', {
              digestOid,
            }),
          };
    case '1.2.840.113549.1.1.5':
      return { kind: 'rsa-pkcs1', hashName: 'SHA-1' };
    case '1.2.840.113549.1.1.11':
      return { kind: 'rsa-pkcs1', hashName: 'SHA-256' };
    case '1.2.840.113549.1.1.12':
      return { kind: 'rsa-pkcs1', hashName: 'SHA-384' };
    case '1.2.840.113549.1.1.13':
      return { kind: 'rsa-pkcs1', hashName: 'SHA-512' };
    case '1.2.840.113549.1.1.10': {
      const params = parsePssParams(signatureAlgorithmArr[1]);
      return {
        kind: 'rsa-pss',
        hashName: params.hashName,
        pssSaltLength: params.saltLength,
      };
    }
    case '1.2.840.10045.4.1':
      return { kind: 'ecdsa', hashName: 'SHA-1' };
    case '1.2.840.10045.4.3.2':
      return { kind: 'ecdsa', hashName: 'SHA-256' };
    case '1.2.840.10045.4.3.3':
      return { kind: 'ecdsa', hashName: 'SHA-384' };
    case '1.2.840.10045.4.3.4':
      return { kind: 'ecdsa', hashName: 'SHA-512' };
    case '1.2.840.10045.2.1':
      return implicitHash
        ? { kind: 'ecdsa', hashName: implicitHash }
        : {
            unsupported: trText('Unsupported digest OID {{digestOid}}', {
              digestOid,
            }),
          };
    default:
      return {
        unsupported: trText('Unsupported signature algorithm OID {{oid}}', {
          oid,
        }),
      };
  }
}

function parsePssParams(paramsNode: forge.asn1.Asn1 | undefined): {
  hashName: SigScheme['hashName'];
  saltLength: number;
} {
  const fallback = { hashName: 'SHA-1' as const, saltLength: 20 };
  if (!paramsNode || !Array.isArray(paramsNode.value)) return fallback;
  let hashName: SigScheme['hashName'] = 'SHA-1';
  let saltLength = 20;
  for (const item of paramsNode.value) {
    if (item.tagClass !== forge.asn1.Class.CONTEXT_SPECIFIC) continue;
    if (item.type === 0 && Array.isArray(item.value) && item.value[0]) {
      const algoIdSeq = item.value[0];
      if (Array.isArray(algoIdSeq.value) && algoIdSeq.value[0]) {
        const hashOid = forge.asn1.derToOid(algoIdSeq.value[0].value as string);
        const resolved = hashNameFromOid(hashOid);
        if (resolved) hashName = resolved;
      }
    } else if (item.type === 2 && typeof item.value === 'string') {
      let n = 0;
      for (let i = 0; i < item.value.length; i++) {
        n = (n << 8) | item.value.charCodeAt(i);
      }
      if (n > 0 && n < 1024) saltLength = n;
    }
  }
  return { hashName, saltLength };
}

function extractSpkiDer(
  p7: forge.pkcs7.PkcsSignedData & {
    rawCapture?: { certificates?: forge.asn1.Asn1 };
  },
  index: number
): Uint8Array | null {
  try {
    const certsNode = p7.rawCapture?.certificates;
    if (
      !certsNode ||
      !Array.isArray(certsNode.value) ||
      !certsNode.value[index]
    ) {
      return null;
    }
    const certAsn1 = certsNode.value[index];
    if (!Array.isArray(certAsn1.value) || !certAsn1.value[0]) return null;
    const tbs = certAsn1.value[0];
    if (!Array.isArray(tbs.value)) return null;
    let startIdx = 0;
    if (
      tbs.value[0] &&
      tbs.value[0].tagClass === forge.asn1.Class.CONTEXT_SPECIFIC
    ) {
      startIdx = 1;
    }
    const spkiAsn1 = tbs.value[startIdx + 5];
    if (!spkiAsn1) return null;
    return latin1ToUint8(forge.asn1.toDer(spkiAsn1).getBytes());
  } catch {
    return null;
  }
}

function curveFromSpki(
  spkiDer: Uint8Array
): { name: 'P-256' | 'P-384' | 'P-521'; coordBytes: number } | null {
  try {
    const spki = forge.asn1.fromDer(uint8ToLatin1(spkiDer));
    if (!Array.isArray(spki.value) || !spki.value[0]) return null;
    const algoId = spki.value[0];
    if (!Array.isArray(algoId.value) || !algoId.value[1]) return null;
    const params = algoId.value[1];
    if (params.type !== forge.asn1.Type.OID) return null;
    const oid = forge.asn1.derToOid(params.value as string);
    if (oid === '1.2.840.10045.3.1.7') return { name: 'P-256', coordBytes: 32 };
    if (oid === '1.3.132.0.34') return { name: 'P-384', coordBytes: 48 };
    if (oid === '1.3.132.0.35') return { name: 'P-521', coordBytes: 66 };
    return null;
  } catch {
    return null;
  }
}

function ecdsaDerToP1363(
  derSig: Uint8Array,
  coordBytes: number
): Uint8Array | null {
  try {
    const parsed = forge.asn1.fromDer(uint8ToLatin1(derSig));
    if (!Array.isArray(parsed.value) || parsed.value.length !== 2) return null;
    const r = latin1ToUint8(parsed.value[0].value as string);
    const s = latin1ToUint8(parsed.value[1].value as string);
    const rStripped = r[0] === 0 && r.length > 1 ? r.slice(1) : r;
    const sStripped = s[0] === 0 && s.length > 1 ? s.slice(1) : s;
    if (rStripped.length > coordBytes || sStripped.length > coordBytes) {
      return null;
    }
    const out = new Uint8Array(coordBytes * 2);
    out.set(rStripped, coordBytes - rStripped.length);
    out.set(sStripped, coordBytes * 2 - sStripped.length);
    return out;
  } catch {
    return null;
  }
}

async function verifyViaWebCrypto(
  scheme: SigScheme,
  spkiDer: Uint8Array,
  signedBytes: Uint8Array,
  signatureBytes: Uint8Array
): Promise<CryptoVerificationResult> {
  const subtle =
    typeof globalThis.crypto !== 'undefined' && globalThis.crypto.subtle
      ? globalThis.crypto.subtle
      : null;
  if (!subtle) {
    return {
      status: 'unsupported',
      reason: trText('Web Crypto API not available in this context'),
    };
  }

  const spki = new Uint8Array(spkiDer);
  const signed = new Uint8Array(signedBytes);
  const sig = new Uint8Array(signatureBytes);

  try {
    if (scheme.kind === 'rsa-pss') {
      const key = await subtle.importKey(
        'spki',
        spki,
        { name: 'RSA-PSS', hash: scheme.hashName },
        false,
        ['verify']
      );
      const ok = await subtle.verify(
        { name: 'RSA-PSS', saltLength: scheme.pssSaltLength ?? 32 },
        key,
        sig,
        signed
      );
      return ok
        ? { status: 'verified' }
        : {
            status: 'failed',
            reason: trText(
              'RSA-PSS signature does not verify against signer public key'
            ),
          };
    }

    if (scheme.kind === 'ecdsa') {
      const curve = curveFromSpki(spki);
      if (!curve) {
        return {
          status: 'unsupported',
          reason: trText('Unsupported ECDSA curve in signer certificate'),
        };
      }
      const p1363 = ecdsaDerToP1363(sig, curve.coordBytes);
      if (!p1363) {
        return {
          status: 'failed',
          reason: trText('Malformed ECDSA signature (could not parse r,s)'),
        };
      }
      const key = await subtle.importKey(
        'spki',
        spki,
        { name: 'ECDSA', namedCurve: curve.name },
        false,
        ['verify']
      );
      const ok = await subtle.verify(
        { name: 'ECDSA', hash: scheme.hashName },
        key,
        new Uint8Array(p1363),
        signed
      );
      return ok
        ? { status: 'verified' }
        : {
            status: 'failed',
            reason: trText(
              'ECDSA signature does not verify against signer public key'
            ),
          };
    }

    if (scheme.kind === 'rsa-pkcs1') {
      const key = await subtle.importKey(
        'spki',
        spki,
        { name: 'RSASSA-PKCS1-v1_5', hash: scheme.hashName },
        false,
        ['verify']
      );
      const ok = await subtle.verify('RSASSA-PKCS1-v1_5', key, sig, signed);
      return ok
        ? { status: 'verified' }
        : {
            status: 'failed',
            reason: trText(
              'RSA-PKCS1 signature does not verify against signer public key'
            ),
          };
    }

    return {
      status: 'unsupported',
      reason: trText('Signature scheme {{kind}} not implemented', {
        kind: scheme.kind,
      }),
    };
  } catch (e) {
    return {
      status: 'unsupported',
      reason: trText('Web Crypto import/verify failed: {{error}}', {
        error: e instanceof Error ? e.message : String(e),
      }),
    };
  }
}

async function performCryptoVerification(
  p7: forge.pkcs7.PkcsSignedData & {
    rawCapture?: {
      signatureAlgorithm?: forge.asn1.Asn1[];
      certificates?: forge.asn1.Asn1;
    };
  },
  pdfBytes: Uint8Array,
  byteRange: number[],
  signerCert: forge.pki.Certificate,
  fields: SignerInfoFields | null
): Promise<CryptoVerificationResult> {
  if (!fields) {
    return { status: 'failed', reason: trText('Could not parse signer info') };
  }
  const byteRangeError = getByteRangeError(byteRange, pdfBytes.length);
  if (byteRangeError) {
    return { status: 'failed', reason: byteRangeError };
  }

  const md = createMd(fields.digestOid);
  if (!md) {
    return {
      status: 'unsupported',
      reason: trText('Unsupported digest OID {{digestOid}}', {
        digestOid: fields.digestOid,
      }),
    };
  }

  const [start1, len1, start2, len2] = byteRange;
  const signedContent = new Uint8Array(len1 + len2);
  signedContent.set(pdfBytes.subarray(start1, start1 + len1), 0);
  signedContent.set(pdfBytes.subarray(start2, start2 + len2), len1);

  md.update(uint8ToLatin1(signedContent));
  const contentHashBytes = md.digest().bytes();

  const authAttrs = fields.authAttrs;
  const signatureBytes = fields.signatureBytes;
  if (!signatureBytes) {
    return { status: 'failed', reason: trText('Empty signature bytes') };
  }

  const scheme = detectSigScheme(
    p7.rawCapture?.signatureAlgorithm,
    fields.digestOid
  );
  if ('unsupported' in scheme) {
    return { status: 'unsupported', reason: scheme.unsupported };
  }

  let messageDigestAttrValue: string | null = null;
  let signedBytesForVerify: Uint8Array;

  if (authAttrs) {
    for (const attr of authAttrs) {
      if (!attr.value || !Array.isArray(attr.value) || attr.value.length < 2)
        continue;
      const oidNode = attr.value[0];
      const setNode = attr.value[1];
      if (!oidNode || oidNode.type !== forge.asn1.Type.OID) continue;
      const oid = forge.asn1.derToOid(oidNode.value as string);
      if (oid === forge.pki.oids.messageDigest) {
        if (
          setNode?.value &&
          Array.isArray(setNode.value) &&
          setNode.value[0]
        ) {
          messageDigestAttrValue = setNode.value[0].value as string;
        }
        break;
      }
    }

    if (messageDigestAttrValue === null) {
      return {
        status: 'failed',
        reason: 'messageDigest attribute missing from authenticated attributes',
      };
    }
    if (messageDigestAttrValue !== contentHashBytes) {
      return {
        status: 'failed',
        reason: trText(
          'Content hash does not match messageDigest attribute: PDF was modified after signing'
        ),
      };
    }

    const asSet = forge.asn1.create(
      forge.asn1.Class.UNIVERSAL,
      forge.asn1.Type.SET,
      true,
      authAttrs
    );
    signedBytesForVerify = latin1ToUint8(forge.asn1.toDer(asSet).getBytes());
  } else {
    signedBytesForVerify = signedContent;
  }

  if (scheme.kind === 'rsa-pkcs1' && !hasLowRsaExponent(signerCert.publicKey)) {
    try {
      const publicKey = signerCert.publicKey as forge.pki.rsa.PublicKey;
      const md2 = createMd(fields.digestOid)!;
      md2.update(uint8ToLatin1(signedBytesForVerify));
      const ok = publicKey.verify(md2.digest().bytes(), signatureBytes);
      if (ok) return { status: 'verified' };
    } catch {
      // fall through to Web Crypto
    }
  }

  const signerIndex = (p7.certificates ?? []).indexOf(signerCert);
  const spkiDer = signerIndex < 0 ? null : extractSpkiDer(p7, signerIndex);
  if (!spkiDer) {
    return {
      status: 'unsupported',
      reason: trText('Could not extract signer public key'),
    };
  }
  return verifyViaWebCrypto(
    scheme,
    spkiDer,
    signedBytesForVerify,
    latin1ToUint8(signatureBytes)
  );
}
