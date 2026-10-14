import { describe, it, expect, vi } from 'vitest';
import forge from 'node-forge';

vi.mock('zgapdfsigner', () => ({ PdfSigner: vi.fn() }));

import {
  parsePfxFile,
  parsePemFiles,
  parseCombinedPem,
} from '@/js/logic/digital-sign-pdf';

function makeCert(
  commonName: string,
  keys: forge.pki.rsa.KeyPair,
  issuer: { commonName: string; privateKey: forge.pki.rsa.PrivateKey },
  serialNumber: string
) {
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = serialNumber;
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date(Date.now() + 86400000);
  cert.setSubject([{ name: 'commonName', value: commonName }]);
  cert.setIssuer([{ name: 'commonName', value: issuer.commonName }]);
  cert.sign(issuer.privateKey, forge.md.sha256.create());
  return cert;
}

function toPfxBytes(
  key: forge.pki.PrivateKey,
  certs: forge.pki.Certificate[],
  password: string | null
): ArrayBuffer {
  const asn1 = forge.pkcs12.toPkcs12Asn1(key, certs, password as string, {
    algorithm: '3des',
  });
  const der = forge.asn1.toDer(asn1).getBytes();
  const out = new Uint8Array(der.length);
  for (let i = 0; i < der.length; i++) out[i] = der.charCodeAt(i);
  return out.buffer;
}

const caKeys = forge.pki.rsa.generateKeyPair(1024);
const caCert = makeCert(
  'Test CA',
  caKeys,
  { commonName: 'Test CA', privateKey: caKeys.privateKey },
  '01'
);
const leafKeys = forge.pki.rsa.generateKeyPair(1024);
const leafCert = makeCert(
  'Test Leaf',
  leafKeys,
  { commonName: 'Test CA', privateKey: caKeys.privateKey },
  '02'
);
const leafKeyPem = forge.pki.privateKeyToPem(leafKeys.privateKey);

function cn(cert: forge.pki.Certificate) {
  return cert.subject.getField('CN').value;
}

describe('parsePfxFile', () => {
  it('parses a PFX protected by a password and keeps the original file', () => {
    const bytes = toPfxBytes(leafKeys.privateKey, [leafCert], 'secret');
    const result = parsePfxFile(bytes, 'secret');
    expect(result.password).toBe('secret');
    expect(result.p12Buffer).toBe(bytes);
    expect(cn(result.certificate)).toBe('Test Leaf');
  });

  it('parses a PFX created with an empty-string password', () => {
    const bytes = toPfxBytes(leafKeys.privateKey, [leafCert], '');
    const result = parsePfxFile(bytes, '');
    expect(cn(result.certificate)).toBe('Test Leaf');
    // re-wrapped so the signer never receives an empty password
    expect(result.password).not.toBe('');
    const reparsed = parsePfxFile(result.p12Buffer, result.password);
    expect(reparsed.certificate.serialNumber).toBe(leafCert.serialNumber);
  });

  it('parses a PFX with an unencrypted key bag (no password)', () => {
    const bytes = toPfxBytes(leafKeys.privateKey, [leafCert], null);
    const result = parsePfxFile(bytes, '');
    expect(cn(result.certificate)).toBe('Test Leaf');
    expect(result.password).not.toBe('');
    const reparsed = parsePfxFile(result.p12Buffer, result.password);
    expect(reparsed.certificate.serialNumber).toBe(leafCert.serialNumber);
  });

  it('picks the certificate matching the key when the CA is listed first', () => {
    const bytes = toPfxBytes(leafKeys.privateKey, [caCert, leafCert], '');
    const result = parsePfxFile(bytes, '');
    expect(cn(result.certificate)).toBe('Test Leaf');
  });

  it('rejects a wrong password', () => {
    const bytes = toPfxBytes(leafKeys.privateKey, [leafCert], 'secret');
    expect(() => parsePfxFile(bytes, '')).toThrow(/password/i);
    expect(() => parsePfxFile(bytes, 'nope')).toThrow(/password/i);
  });
});

describe('parseCombinedPem', () => {
  it('parses an unencrypted combined RSA PEM', () => {
    const pem = forge.pki.certificateToPem(leafCert) + leafKeyPem;
    expect(parseCombinedPem(pem).certificate.serialNumber).toBe('02');
  });

  it('picks the certificate matching the key when the CA comes first', () => {
    const pem =
      forge.pki.certificateToPem(caCert) +
      forge.pki.certificateToPem(leafCert) +
      leafKeyPem;
    expect(cn(parseCombinedPem(pem).certificate)).toBe('Test Leaf');
  });

  it('tells the user which PEM blocks were found when there is no key', () => {
    const pem = forge.pki.certificateToPem(leafCert);
    expect(() => parseCombinedPem(pem)).toThrow(
      /No private key found in PEM file \(found: CERTIFICATE\)/
    );
  });

  it('reports unsupported private key formats instead of "no key"', () => {
    const pem =
      forge.pki.certificateToPem(leafCert) +
      '-----BEGIN OPENSSH PRIVATE KEY-----\nAAAA\n-----END OPENSSH PRIVATE KEY-----\n';
    expect(() => parseCombinedPem(pem)).toThrow(
      /Unsupported private key format "OPENSSH PRIVATE KEY"/
    );
  });

  it('throws a clear error when there is no certificate', () => {
    expect(() => parseCombinedPem(leafKeyPem)).toThrow(
      /No certificate found in PEM file \(found: .*PRIVATE KEY\)/
    );
  });

  it('decrypts an encrypted key with the right password', () => {
    const encrypted = forge.pki.encryptRsaPrivateKey(
      leafKeys.privateKey,
      'pw123'
    );
    const pem = forge.pki.certificateToPem(leafCert) + encrypted;
    expect(parseCombinedPem(pem, 'pw123').certificate.serialNumber).toBe('02');
    expect(() => parseCombinedPem(pem, 'wrong')).toThrow(/password/i);
    expect(() => parseCombinedPem(pem)).toThrow(/password/i);
  });
});

describe('parsePemFiles', () => {
  it('uses a random throwaway password for unencrypted keys', () => {
    const result = parsePemFiles(
      forge.pki.certificateToPem(leafCert),
      leafKeyPem
    );
    expect(result.password).not.toBe('');
    const reparsed = parsePfxFile(result.p12Buffer, result.password);
    expect(reparsed.certificate.serialNumber).toBe('02');
  });
});
