---
title: Digital Signature
description: Add cryptographic digital signatures to PDFs using X.509 certificates. Supports PKCS#12 and PEM formats with visible signature options.
---

# Digital Signature

A digital signature is cryptographic proof that a specific person signed a document and that the document has not been altered since. Unlike a drawn signature (which is just an image), a digital signature uses X.509 certificates and PKCS#7 standards to provide verifiable authenticity and integrity.

BentoPDF applies digital signatures entirely in your browser. Your private key never leaves your device.

## How It Works

1. Upload a PDF file.
2. Upload your certificate file (.pfx, .p12, or .pem).
3. Enter the certificate password to unlock it. The tool displays the certificate subject, issuer, and validity period.
4. Optionally configure signature metadata (reason, location, contact info).
5. Optionally enable a **visible signature** with position, size, image, and text customization.
6. Click **Sign PDF**.

## Supported Certificate Formats

| Format      | Extensions | Description                                                                                                        |
| ----------- | ---------- | ------------------------------------------------------------------------------------------------------------------ |
| **PKCS#12** | .pfx, .p12 | Industry-standard bundle containing the private key and certificate chain. Most common format.                     |
| **PEM**     | .pem       | Text-based format. Must contain both the certificate and private key in one file. Supports encrypted private keys. |

## Visible Signature Options

When enabled, a visible signature block is rendered on the PDF page:

- **Position**: X/Y coordinates and width/height in points
- **Page**: First page, last page, all pages, or a specific page number
- **Image**: Upload a PNG, JPG, or WebP image (your handwritten signature, company seal, etc.)
- **Text**: Custom text with configurable color and font size. If no image or text is provided, the tool auto-generates text from the certificate's common name and current date.

## Signature Metadata

- **Reason**: Why the document was signed (e.g., "Approved", "Reviewed")
- **Location**: Where the signing took place (e.g., "New York, NY")
- **Contact Info**: How to reach the signer (e.g., email address)

## Internet Connection Note

Signing may require an internet connection. The signing library fetches the certificate chain from URLs embedded in your certificate's Authority Information Access (AIA) extension. If those servers are unreachable, signing will fail for certificates that require chain validation.

## Use Cases

- Signing contracts, proposals, and agreements with legally binding digital signatures
- Certifying official documents in workflows that require PKI-based authentication
- Signing PDF invoices for regulatory compliance (many EU countries require digitally signed e-invoices)
- Adding organizational approval to engineering drawings or quality documents

## Tips

- Self-signed certificates work for testing but will show warnings in Adobe Reader. Use a certificate from a trusted Certificate Authority for production documents.
- The visible signature is purely visual. The cryptographic signature is embedded regardless of whether the visible block is enabled.
- Verify your signed PDF with the Validate Signature tool to confirm the signature is intact.

## Related Tools

- [Validate Signature](./validate-signature-pdf) -- verify digital signatures in signed PDFs
- [Flatten PDF](./flatten-pdf) -- flatten forms before signing to prevent modifications
- [Encrypt PDF](./encrypt-pdf) -- add password protection on top of the digital signature
- [Remove Metadata](./remove-metadata) -- strip metadata before signing
