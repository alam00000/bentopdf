import { describe, it, expect } from 'vitest';
import forge from 'node-forge';
import { validateSignature } from '../js/logic/validate-signature-pdf';

type KeyPair = forge.pki.rsa.KeyPair;

function keys(e = 0x10001): KeyPair {
  return forge.pki.rsa.generateKeyPair({ bits: 1024, e });
}

function issue(
  name: string,
  serial: string,
  subjectKeys: KeyPair,
  issuer: { name: string; keys: KeyPair },
  isCa: boolean
): forge.pki.Certificate {
  const cert = forge.pki.createCertificate();
  cert.publicKey = subjectKeys.publicKey;
  cert.serialNumber = serial;
  cert.setSubject([{ name: 'commonName', value: name }]);
  cert.setIssuer([{ name: 'commonName', value: issuer.name }]);
  cert.validity.notBefore = new Date(Date.now() - 86400000);
  cert.validity.notAfter = new Date(Date.now() + 86400000);
  cert.setExtensions([{ name: 'basicConstraints', cA: isCa }]);
  cert.sign(issuer.keys.privateKey, forge.md.sha256.create());
  return cert;
}

function sign(
  embedded: forge.pki.Certificate[],
  namedSigner: forge.pki.Certificate,
  signingKey: forge.pki.rsa.PrivateKey,
  trustedCert: forge.pki.Certificate
) {
  const before = new TextEncoder().encode('%PDF-1.4\nsigned A\n');
  const after = new TextEncoder().encode('\nsigned B\n%%EOF\n');
  const pdfBytes = new Uint8Array(before.length + after.length);
  pdfBytes.set(before, 0);
  pdfBytes.set(after, before.length);

  const p7 = forge.pkcs7.createSignedData();
  p7.content = forge.util.createBuffer(String.fromCharCode(...pdfBytes));
  for (const cert of embedded) p7.addCertificate(cert);
  p7.addSigner({
    key: signingKey,
    certificate: namedSigner,
    digestAlgorithm: forge.pki.oids.sha256,
    authenticatedAttributes: [
      { type: forge.pki.oids.contentType, value: forge.pki.oids.data },
      { type: forge.pki.oids.messageDigest },
    ],
  });
  p7.sign({ detached: true });
  const der = forge.asn1.toDer(p7.toAsn1()).getBytes();
  const contents = Uint8Array.from(der, (c) => c.charCodeAt(0));

  return validateSignature(
    {
      index: 0,
      contents,
      byteRange: [0, before.length, before.length, after.length],
    },
    pdfBytes,
    trustedCert
  );
}

function chain(signerExponent = 0x10001, caExponent = 0x10001) {
  const caKeys = keys(caExponent);
  const signerKeys = keys(signerExponent);
  const ca = issue(
    'Test CA',
    '01',
    caKeys,
    { name: 'Test CA', keys: caKeys },
    true
  );
  const signer = issue(
    'Test Signer',
    '02',
    signerKeys,
    { name: 'Test CA', keys: caKeys },
    false
  );
  return { ca, signer, signerKeys };
}

describe('RSA keys with a low public exponent (GHSA-86w9-cpqp-85rv)', () => {
  it('still verifies a genuine signature from an e=3 signer key', async () => {
    const { ca, signer, signerKeys } = chain(3);
    const result = await sign([signer, ca], signer, signerKeys.privateKey, ca);
    expect(result.cryptoVerified).toBe(true);
    expect(result.isTrusted).toBe(true);
  });

  it('does not trust a chain through an e=3 CA key', async () => {
    const { ca, signer, signerKeys } = chain(0x10001, 3);
    const result = await sign([signer, ca], signer, signerKeys.privateKey, ca);
    expect(result.cryptoVerified).toBe(true);
    expect(result.isTrusted).toBe(false);
  });
});

describe('signer certificate binding', () => {
  it('rejects a signature made with another embedded certificate key', async () => {
    const { ca, signer: victim } = chain();
    const attackerKeys = keys();
    const attacker = issue(
      'Attacker',
      '03',
      attackerKeys,
      { name: 'Attacker', keys: attackerKeys },
      false
    );
    const result = await sign(
      [attacker, victim, ca],
      victim,
      attackerKeys.privateKey,
      ca
    );
    expect(result.signerName).toBe('Test Signer');
    expect(result.cryptoVerified).toBe(false);
    expect(result.isValid).toBe(false);
  });

  it('rejects a signature whose named signer certificate is missing', async () => {
    const { ca, signer: victim } = chain();
    const attackerKeys = keys();
    const attacker = issue(
      'Attacker',
      '03',
      attackerKeys,
      { name: 'Attacker', keys: attackerKeys },
      false
    );
    const result = await sign(
      [attacker, ca],
      victim,
      attackerKeys.privateKey,
      ca
    );
    expect(result.isValid).toBe(false);
    expect(result.isTrusted).toBe(false);
    expect(result.errorMessage).toBeDefined();
  });
});
