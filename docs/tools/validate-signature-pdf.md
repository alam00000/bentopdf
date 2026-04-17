---
title: Validate Signature
description: Verify digital signatures in PDF files. Check certificate validity, signer identity, document integrity, and trust chain status.
---

# Validate Signature

Upload a signed PDF and this tool extracts every digital signature, identifies the signer, checks certificate validity, and reports whether the document has been modified since signing. You can also provide a trusted certificate to verify the signature chain.

## How It Works

1. Upload a signed PDF file. Validation starts automatically.
2. The tool displays a summary: number of signatures found, how many are valid.
3. Each signature gets a detailed card showing signer name, issuer, dates, and status.
4. Optionally upload a **trusted certificate** (.pem, .crt, .cer, .der) to verify the signature against a specific trust anchor. Re-validation runs automatically.

## What Gets Checked

### Signature Parsing

The tool extracts PKCS#7 signature objects from the PDF, decodes the ASN.1 structure, and pulls out the signer's X.509 certificate along with any certificate chain embedded in the signature.

### Certificate Validity

- **Expiration**: Is the certificate currently within its valid date range?
- **Self-signed detection**: Is the certificate its own issuer?
- **Trust chain**: When a trusted certificate is provided, does the signer's certificate chain back to it?

### Cryptographic Verification

- The tool reconstructs the bytes covered by the signature's `/ByteRange`, hashes them with the algorithm the signer declared, and compares the result against the `messageDigest` attribute inside the signature.
- It then re-serializes the signed attributes as a DER SET and verifies the signature against the signer certificate's public key.
- **A signature is reported as valid only when all of these pass.** If the PDF bytes were modified after signing, or the embedded signature does not match the signer's key, the status shows "Invalid — Cryptographic Verification Failed" with the specific reason.

#### Supported Signature Algorithms

| Algorithm               | Verification path                                                                      |
| ----------------------- | -------------------------------------------------------------------------------------- |
| RSA (PKCS#1 v1.5)       | node-forge `publicKey.verify`, with Web Crypto fallback                                |
| RSA-PSS (RSASSA-PSS)    | Web Crypto `verify({name: 'RSA-PSS', saltLength})`                                     |
| ECDSA P-256/P-384/P-521 | Web Crypto `verify({name: 'ECDSA', hash})` after DER → IEEE P1363 signature conversion |

If a signature uses an algorithm outside this list (for example Ed25519, SM2, or RSA with an unusual digest OID), the card shows **"Unverified — Unsupported Signature Algorithm"** in yellow, along with the specific OID or reason. This is a deliberate three-state distinction:

- **Valid** — signature cryptographically verified against the signer's public key.
- **Invalid** — verification ran and produced a negative result (bytes changed, key mismatch).
- **Unverified** — the tool could not run verification for this algorithm. The certificate metadata is still shown, but you should treat the signature as "unknown" and verify it with Adobe Acrobat or `openssl cms -verify`.

### Insecure Digest Algorithms

- Signatures using **MD5 or SHA-1** are rejected as invalid and flagged with "Insecure Digest" status. Both algorithms have published collision attacks, so a signature over a SHA-1 or MD5 hash offers no integrity guarantee.
- SHA-224, SHA-256, SHA-384, and SHA-512 are all accepted.

### Document Coverage

- **Full coverage**: The signature covers the entire PDF file, meaning no bytes were added or changed after signing.
- **Partial coverage**: The signature covers only part of the file. This can indicate modifications were made after signing (not necessarily malicious -- incremental saves produce partial coverage).

## Signature Details

Each signature card shows:

- **Signed By**: Common name, organization, and email from the signer's certificate
- **Issuer**: The Certificate Authority that issued the signer's certificate
- **Signed On**: The timestamp embedded in the signature
- **Valid From / Valid Until**: The certificate's validity period
- **Reason**: Why the document was signed (if provided)
- **Location**: Where it was signed (if provided)
- **Coverage Status**: Full or Partial
- **Trust Badge**: Trusted or Not in trust chain (only when a custom certificate is provided)

### Technical Details

Expand the technical details section for:

- Serial number of the signer's certificate
- Digest algorithm (SHA-256, SHA-512, etc.)
- Signature algorithm (RSA with SHA-256, ECDSA with SHA-256, etc.)
- Error messages for invalid signatures

## Use Cases

- Verifying a digitally signed contract before countersigning
- Auditing signed documents to confirm they have not been tampered with
- Checking whether a certificate has expired since the document was signed
- Validating signatures against your organization's root certificate
- Inspecting the signing details of government or legal documents

## Tips

- A self-signed certificate does not mean the signature is invalid -- it means the signer's identity cannot be verified through a trusted third party. This is common for internal documents.
- Partial coverage does not always indicate tampering. Many PDF workflows add incremental updates (like a second signature) that create partial coverage.
- Upload your organization's root or intermediate certificate as the trusted certificate to get trust chain verification.

## Related Tools

- [Digital Signature](./digital-sign-pdf) -- sign PDFs with your own certificate
- [Flatten PDF](./flatten-pdf) -- flatten a PDF before signing to prevent post-signature modifications
- [Remove Metadata](./remove-metadata) -- clean a PDF before applying a signature
