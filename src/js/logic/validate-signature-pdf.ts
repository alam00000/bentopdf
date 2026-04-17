import forge from 'node-forge';
import { ExtractedSignature, SignatureValidationResult } from '@/types';

const INSECURE_DIGEST_OIDS = new Set<string>([
  '1.2.840.113549.2.5',
  '1.3.14.3.2.26',
]);

export function extractSignatures(pdfBytes: Uint8Array): ExtractedSignature[] {
  const signatures: ExtractedSignature[] = [];
  const pdfString = new TextDecoder('latin1').decode(pdfBytes);

  // Find all signature objects for /Type /Sig
  const sigRegex = /\/Type\s*\/Sig\b/g;
  let sigMatch;
  let sigIndex = 0;

  while ((sigMatch = sigRegex.exec(pdfString)) !== null) {
    try {
      const searchStart = Math.max(0, sigMatch.index - 5000);
      const searchEnd = Math.min(pdfString.length, sigMatch.index + 10000);
      const context = pdfString.substring(searchStart, searchEnd);
      const byteRangeMatch = context.match(
        /\/ByteRange\s*\[\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s*\]/
      );
      if (!byteRangeMatch) continue;

      const byteRange = [
        parseInt(byteRangeMatch[1], 10),
        parseInt(byteRangeMatch[2], 10),
        parseInt(byteRangeMatch[3], 10),
        parseInt(byteRangeMatch[4], 10),
      ];

      const contentsMatch = context.match(/\/Contents\s*<([0-9A-Fa-f]+)>/);
      if (!contentsMatch) continue;

      const hexContents = contentsMatch[1];
      const contentsBytes = hexToBytes(hexContents);

      const reasonMatch = context.match(/\/Reason\s*\(([^)]*)\)/);
      const locationMatch = context.match(/\/Location\s*\(([^)]*)\)/);
      const contactMatch = context.match(/\/ContactInfo\s*\(([^)]*)\)/);
      const nameMatch = context.match(/\/Name\s*\(([^)]*)\)/);
      const timeMatch = context.match(
        /\/M\s*\(D:(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/
      );

      let signingTime: string | undefined;
      if (timeMatch) {
        signingTime = `${timeMatch[1]}-${timeMatch[2]}-${timeMatch[3]}T${timeMatch[4]}:${timeMatch[5]}:${timeMatch[6]}`;
      }

      signatures.push({
        index: sigIndex++,
        contents: contentsBytes,
        byteRange,
        reason: reasonMatch
          ? decodeURIComponent(escape(reasonMatch[1]))
          : undefined,
        location: locationMatch
          ? decodeURIComponent(escape(locationMatch[1]))
          : undefined,
        contactInfo: contactMatch
          ? decodeURIComponent(escape(contactMatch[1]))
          : undefined,
        name: nameMatch ? decodeURIComponent(escape(nameMatch[1])) : undefined,
        signingTime,
      });
    } catch (e) {
      console.warn('Error extracting signature at index', sigIndex, e);
    }
  }

  return signatures;
}

export async function validateSignature(
  signature: ExtractedSignature,
  pdfBytes: Uint8Array,
  trustedCert?: forge.pki.Certificate
): Promise<SignatureValidationResult> {
  const result: SignatureValidationResult = {
    signatureIndex: signature.index,
    isValid: false,
    signerName: 'Unknown',
    issuer: 'Unknown',
    validFrom: new Date(0),
    validTo: new Date(0),
    isExpired: false,
    isSelfSigned: false,
    isTrusted: false,
    algorithms: { digest: 'Unknown', signature: 'Unknown' },
    serialNumber: '',
    byteRange: signature.byteRange,
    coverageStatus: 'unknown',
    reason: signature.reason,
    location: signature.location,
    contactInfo: signature.contactInfo,
  };

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
      };
    };

    if (!p7.certificates || p7.certificates.length === 0) {
      result.errorMessage = 'No certificates found in signature';
      return result;
    }

    const signerCert = p7.certificates[0] as forge.pki.Certificate;

    const subjectCN = signerCert.subject.getField('CN');
    const subjectO = signerCert.subject.getField('O');
    const subjectE =
      signerCert.subject.getField('E') ||
      signerCert.subject.getField('emailAddress');
    const issuerCN = signerCert.issuer.getField('CN');
    const issuerO = signerCert.issuer.getField('O');

    result.signerName = (subjectCN?.value as string) ?? 'Unknown';
    result.signerOrg = subjectO?.value as string | undefined;
    result.signerEmail = subjectE?.value as string | undefined;
    result.issuer = (issuerCN?.value as string) ?? 'Unknown';
    result.issuerOrg = issuerO?.value as string | undefined;
    result.validFrom = signerCert.validity.notBefore;
    result.validTo = signerCert.validity.notAfter;
    result.serialNumber = signerCert.serialNumber;

    const now = new Date();
    result.isExpired = now > result.validTo || now < result.validFrom;

    result.isSelfSigned = signerCert.isIssuer(signerCert);

    // Check trust against provided certificate
    if (trustedCert) {
      try {
        const isTrustedIssuer = trustedCert.isIssuer(signerCert);
        const isSameCert = signerCert.serialNumber === trustedCert.serialNumber;

        let chainTrusted = false;
        for (const cert of p7.certificates) {
          if (
            trustedCert.isIssuer(cert) ||
            (cert as forge.pki.Certificate).serialNumber ===
              trustedCert.serialNumber
          ) {
            chainTrusted = true;
            break;
          }
        }

        result.isTrusted = isTrustedIssuer || isSameCert || chainTrusted;
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
      const [, len1, start2, len2] = signature.byteRange;
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
        verification.reason || 'Cryptographic verification failed';
    }

    result.isValid =
      verification.status === 'verified' &&
      result.coverageStatus !== 'unknown' &&
      !result.usesInsecureDigest;
  } catch (e) {
    result.errorMessage =
      e instanceof Error ? e.message : 'Failed to parse signature';
  }

  return result;
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

  let actualLength = bytes.length;
  while (actualLength > 0 && bytes[actualLength - 1] === 0) {
    actualLength--;
  }

  return bytes.slice(0, actualLength);
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
  return digestAlgorithms[oid] || oid || 'Unknown';
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
  return signatureAlgorithms[oid] || oid || 'Unknown';
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
    return { unsupported: 'Missing signatureAlgorithm' };
  }
  const oidNode = signatureAlgorithmArr[0];
  if (!oidNode || oidNode.type !== forge.asn1.Type.OID) {
    return { unsupported: 'Malformed signatureAlgorithm' };
  }
  const oid = forge.asn1.derToOid(oidNode.value as string);
  const implicitHash = hashNameFromOid(digestOid);

  switch (oid) {
    case '1.2.840.113549.1.1.1':
      return implicitHash
        ? { kind: 'rsa-pkcs1', hashName: implicitHash }
        : { unsupported: `Unsupported digest OID ${digestOid}` };
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
        : { unsupported: `Unsupported digest OID ${digestOid}` };
    default:
      return { unsupported: `Unsupported signature algorithm OID ${oid}` };
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
  }
): Uint8Array | null {
  try {
    const certsNode = p7.rawCapture?.certificates;
    if (!certsNode || !Array.isArray(certsNode.value) || !certsNode.value[0]) {
      return null;
    }
    const certAsn1 = certsNode.value[0];
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
      reason: 'Web Crypto API not available in this context',
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
            reason:
              'RSA-PSS signature does not verify against signer public key',
          };
    }

    if (scheme.kind === 'ecdsa') {
      const curve = curveFromSpki(spki);
      if (!curve) {
        return {
          status: 'unsupported',
          reason: 'Unsupported ECDSA curve in signer certificate',
        };
      }
      const p1363 = ecdsaDerToP1363(sig, curve.coordBytes);
      if (!p1363) {
        return {
          status: 'failed',
          reason: 'Malformed ECDSA signature (could not parse r,s)',
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
            reason: 'ECDSA signature does not verify against signer public key',
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
            reason:
              'RSA-PKCS1 signature does not verify against signer public key',
          };
    }

    return {
      status: 'unsupported',
      reason: `Signature scheme ${scheme.kind} not implemented`,
    };
  } catch (e) {
    return {
      status: 'unsupported',
      reason:
        'Web Crypto import/verify failed: ' +
        (e instanceof Error ? e.message : String(e)),
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
    return { status: 'failed', reason: 'Could not parse signer info' };
  }
  if (byteRange.length !== 4) {
    return { status: 'failed', reason: 'Malformed ByteRange' };
  }

  const md = createMd(fields.digestOid);
  if (!md) {
    return {
      status: 'unsupported',
      reason: `Unsupported digest OID ${fields.digestOid}`,
    };
  }

  const [start1, len1, start2, len2] = byteRange;
  if (
    start1 < 0 ||
    len1 < 0 ||
    start2 < 0 ||
    len2 < 0 ||
    start1 + len1 > pdfBytes.length ||
    start2 + len2 > pdfBytes.length
  ) {
    return { status: 'failed', reason: 'ByteRange out of bounds' };
  }

  const signedContent = new Uint8Array(len1 + len2);
  signedContent.set(pdfBytes.subarray(start1, start1 + len1), 0);
  signedContent.set(pdfBytes.subarray(start2, start2 + len2), len1);

  md.update(uint8ToLatin1(signedContent));
  const contentHashBytes = md.digest().bytes();

  const authAttrs = fields.authAttrs;
  const signatureBytes = fields.signatureBytes;
  if (!signatureBytes) {
    return { status: 'failed', reason: 'Empty signature bytes' };
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
        reason:
          'Content hash does not match messageDigest attribute — PDF was modified after signing',
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

  if (scheme.kind === 'rsa-pkcs1') {
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

  const spkiDer = extractSpkiDer(p7);
  if (!spkiDer) {
    return {
      status: 'unsupported',
      reason: 'Could not extract signer public key',
    };
  }
  return verifyViaWebCrypto(
    scheme,
    spkiDer,
    signedBytesForVerify,
    latin1ToUint8(signatureBytes)
  );
}
