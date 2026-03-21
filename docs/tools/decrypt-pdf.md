---
title: Decrypt PDF
description: Remove password protection from encrypted PDFs. Supports batch decryption with a single password for multiple files.
---

# Decrypt PDF

If you have the password to an encrypted PDF, this tool removes the encryption entirely, producing an unlocked copy that anyone can open without credentials. It supports batch decryption when multiple PDFs share the same password.

## How It Works

1. Upload one or more encrypted PDF files.
2. Enter the **password** used to protect the files.
3. Click **Decrypt PDF**.
4. A single file downloads directly. Multiple files produce a ZIP archive with all unlocked PDFs.

## Features

- Single-file and batch decryption
- Handles both user passwords and owner passwords
- Produces a completely unencrypted output with no residual restrictions
- Clear error reporting for incorrect passwords or corrupted files
- Per-file success/failure tracking in batch mode

## How It Differs from Remove Restrictions

**Decrypt PDF** requires the password and removes all encryption. **Remove Restrictions** targets usage restrictions (printing, copying, editing) and may not require a password if only an owner password was set. Use Decrypt when the PDF will not open at all without a password.

## Use Cases

- Permanently unlocking PDFs you encrypted earlier when the password is no longer needed
- Removing encryption from a batch of archived documents for easier long-term access
- Preparing password-protected PDFs for a document management system that does not support encrypted files
- Unlocking PDFs before merging them with other documents (many merge tools cannot process encrypted input)

## Tips

- The password field applies to all uploaded files. If your PDFs have different passwords, process them in separate batches.
- If you get an "Incorrect Password" error, double-check for trailing spaces or caps lock.
- After decryption, the output has zero security. Re-encrypt with Encrypt PDF if you need to apply a new password.

## Related Tools

- [Encrypt PDF](./encrypt-pdf) -- re-apply encryption with a new password
- [Remove Restrictions](./remove-restrictions) -- remove usage restrictions without full decryption
- [Change Permissions](./change-permissions) -- modify specific permissions on an encrypted PDF
