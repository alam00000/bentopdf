---
title: Remove Restrictions
description: Remove password protection, printing restrictions, editing locks, and copying limits from PDF files.
---

# Remove Restrictions

PDFs can carry two types of passwords: a user password (required to open the file) and an owner password (controls what you can do with it). This tool strips both, along with all associated restrictions -- printing, editing, copying, and annotation locks.

## How It Works

1. Upload a PDF file.
2. If the PDF has an owner password, enter it in the **Owner Password** field. Leave it blank if the PDF only has usage restrictions without a password.
3. Click **Remove Restrictions**.
4. Download the unrestricted PDF.

The tool uses QPDF's `--decrypt` and `--remove-restrictions` flags to produce a clean, unrestricted copy.

## What Gets Removed

- Password protection (both user and owner passwords)
- Printing restrictions
- Editing restrictions
- Text and image copying restrictions
- Annotation and commenting restrictions
- All other security limitations encoded in the PDF

## Use Cases

- Unlocking a PDF you own but whose password you set years ago
- Removing print restrictions from a document you have legitimate access to
- Enabling copy-paste on reference materials for note-taking
- Preparing PDFs for accessibility tools that cannot handle restricted documents

## Tips

- You must know the owner password if one is set. This tool does not crack or brute-force passwords.
- If you need to keep the file encrypted but change specific permissions, use the Change Permissions tool instead.
- The output file has zero encryption -- anyone who receives it can open it freely.

## Related Tools

- [Decrypt PDF](./decrypt-pdf) -- unlock a PDF when you know the user password
- [Encrypt PDF](./encrypt-pdf) -- re-apply encryption with new settings
- [Change Permissions](./change-permissions) -- selectively modify which actions are allowed
