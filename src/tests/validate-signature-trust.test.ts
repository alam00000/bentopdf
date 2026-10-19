import { describe, it, expect } from 'vitest';
import forge from 'node-forge';
import { validateSignature } from '@/js/logic/validate-signature-pdf';

interface Identity {
  cert: forge.pki.Certificate;
  key: forge.pki.rsa.PrivateKey;
}

let serial = 1;

function makeIdentity(
  commonName: string,
  isCa: boolean,
  issuer?: Identity
): Identity {
  const keys = forge.pki.rsa.generateKeyPair(1024);
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = (serial++).toString(16).padStart(2, '0');
  cert.validity.notBefore = new Date(Date.now() - 86400000);
  cert.validity.notAfter = new Date(Date.now() + 86400000 * 365);
  const subject = [{ name: 'commonName', value: commonName }];
  cert.setSubject(subject);
  cert.setIssuer(issuer ? issuer.cert.subject.attributes : subject);
  cert.setExtensions([{ name: 'basicConstraints', cA: isCa }]);
  cert.sign(issuer ? issuer.key : keys.privateKey, forge.md.sha256.create());
  return { cert, key: keys.privateKey };
}

function signContent(
  content: Uint8Array,
  signer: Identity,
  bundle: forge.pki.Certificate[]
): Uint8Array {
  const p7 = forge.pkcs7.createSignedData();
  p7.content = forge.util.createBuffer(
    String.fromCharCode(...Array.from(content))
  );
  for (const cert of bundle) p7.addCertificate(cert);
  p7.addSigner({
    key: signer.key,
    certificate: signer.cert,
    digestAlgorithm: forge.pki.oids.sha256,
    authenticatedAttributes: [
      { type: forge.pki.oids.contentType, value: forge.pki.oids.data },
      { type: forge.pki.oids.messageDigest },
    ],
  });
  p7.sign({ detached: true });
  const der = forge.asn1.toDer(p7.toAsn1()).getBytes();
  return Uint8Array.from(der, (c) => c.charCodeAt(0));
}

async function check(
  signer: Identity,
  bundle: forge.pki.Certificate[],
  trusted: forge.pki.Certificate
) {
  const pdfBytes = new TextEncoder().encode('%PDF-1.7 signed content');
  const contents = signContent(pdfBytes, signer, bundle);
  return validateSignature(
    {
      index: 0,
      contents,
      byteRange: [0, pdfBytes.length, pdfBytes.length, 0],
    },
    pdfBytes,
    trusted
  );
}

describe('validateSignature trust chain', () => {
  const root = makeIdentity('Company Root CA', true);
  const intermediate = makeIdentity('Company Issuing CA', true, root);
  const employee = makeIdentity('Real Employee', false, root);
  const chainedEmployee = makeIdentity('Chained Employee', false, intermediate);
  const attacker = makeIdentity('John Smith', false);

  it('does not trust a self-made signer bundled with an unrelated company certificate', async () => {
    const result = await check(
      attacker,
      [attacker.cert, employee.cert],
      root.cert
    );
    expect(result.signerName).toBe('John Smith');
    expect(result.cryptoVerified).toBe(true);
    expect(result.isTrusted).toBe(false);
  });

  it('identifies the real signer even when another certificate is listed first', async () => {
    const result = await check(
      attacker,
      [employee.cert, attacker.cert],
      root.cert
    );
    expect(result.signerName).toBe('John Smith');
    expect(result.cryptoVerified).toBe(true);
    expect(result.isTrusted).toBe(false);
  });

  it('trusts a signer issued directly by the trusted certificate', async () => {
    const result = await check(employee, [employee.cert], root.cert);
    expect(result.cryptoVerified).toBe(true);
    expect(result.isTrusted).toBe(true);
  });

  it('trusts a signer that chains to the trusted certificate through an intermediate CA', async () => {
    const result = await check(
      chainedEmployee,
      [chainedEmployee.cert, intermediate.cert],
      root.cert
    );
    expect(result.cryptoVerified).toBe(true);
    expect(result.isTrusted).toBe(true);
  });

  it('does not accept a non-CA certificate as an intermediate', async () => {
    const issuedByLeaf = makeIdentity('Issued By Leaf', false, employee);
    const result = await check(
      issuedByLeaf,
      [issuedByLeaf.cert, employee.cert],
      root.cert
    );
    expect(result.isTrusted).toBe(false);
  });

  it('trusts a signer whose own certificate is the trusted certificate', async () => {
    const result = await check(attacker, [attacker.cert], attacker.cert);
    expect(result.isTrusted).toBe(true);
  });
});
