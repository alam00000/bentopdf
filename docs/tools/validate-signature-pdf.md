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
