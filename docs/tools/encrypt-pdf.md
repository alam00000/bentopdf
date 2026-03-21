---
title: Encrypt PDF
description: Password-protect PDF files with 256-bit AES encryption. Set user and owner passwords with configurable usage restrictions.
---

# Encrypt PDF

Lock your PDF behind a password so only authorized people can open it. BentoPDF uses 256-bit AES encryption -- the same standard used by banks and government agencies -- applied entirely in your browser via QPDF.

## How It Works

1. Upload a PDF file.
2. Enter a **User Password** (required). This is the password people will need to open the file.
3. Optionally enter an **Owner Password**. When set, the PDF gains usage restrictions that prevent printing, editing, copying, and annotating.
4. Click **Encrypt PDF**.
5. Download the encrypted file.

## Password Types

### User Password (Required)

The user password is what recipients type to open the PDF. Without it, the document is completely inaccessible. Every encrypted PDF must have one.

### Owner Password (Optional)

The owner password controls what an authorized user can do after opening the file. When you set a distinct owner password, BentoPDF automatically applies the strictest restriction set:

- Modification disabled
- Extraction/copying disabled
- Printing disabled
- Annotation disabled
- Form filling disabled
- Document assembly disabled

If you leave the owner password blank, the PDF is encrypted (it still requires the user password to open) but has no usage restrictions once opened.

## Encryption Details

- **Algorithm**: AES-256 (256-bit Advanced Encryption Standard)
- **Key length**: 256 bits
- **Standard**: PDF 2.0 encryption (QPDF implementation)

AES-256 is computationally infeasible to brute-force with current technology. The security of your encrypted PDF depends entirely on the strength of your password.

## Use Cases

- Protecting confidential financial reports before emailing them
- Securing legal documents shared with opposing counsel
- Adding a password to medical records or personally identifiable information
- Distributing paid content (e-books, reports) with access control
- Complying with data protection policies that require encryption at rest

## Tips

- Use a strong, unique password. A 12+ character passphrase with mixed case, numbers, and symbols is ideal.
- Share the password through a separate channel (phone, text message) -- never in the same email as the PDF.
- If you only need to restrict actions (no printing, no copying) without requiring a password to open, use the Change Permissions tool instead.

## Related Tools

- [Decrypt PDF](./decrypt-pdf) -- remove encryption when you know the password
- [Change Permissions](./change-permissions) -- modify specific usage restrictions
- [Remove Restrictions](./remove-restrictions) -- strip all security from a PDF
- [Sanitize PDF](./sanitize-pdf) -- remove hidden content before encrypting
