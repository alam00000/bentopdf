---
title: Change Permissions
description: Set or modify PDF usage permissions for printing, copying, editing, and annotating. Uses 256-bit AES encryption.
---

# Change Permissions

Fine-tune what recipients can do with your PDF. Unlike basic encryption that just locks the file behind a password, this tool lets you selectively allow or deny printing, copying, editing, annotating, form filling, document assembly, and page extraction -- all enforced through 256-bit AES encryption.

## How It Works

1. Upload a PDF file.
2. If the PDF is already encrypted, enter the **Current Password**.
3. Set a **New User Password** (required to open) and/or **New Owner Password** (controls permissions).
4. Toggle individual permissions on or off using the checkboxes.
5. Click **Change Permissions**.
6. Download the updated PDF.

If you leave both new password fields empty, the tool decrypts the PDF entirely, removing all encryption and restrictions.

## Permission Controls

| Permission                  | What It Controls                                      |
| --------------------------- | ----------------------------------------------------- |
| **Allow Printing**          | Whether the document can be printed                   |
| **Allow Copying**           | Whether text and images can be selected and copied    |
| **Allow Modifying**         | Whether the document content can be edited            |
| **Allow Annotating**        | Whether comments, highlights, and stamps can be added |
| **Allow Filling Forms**     | Whether interactive form fields can be completed      |
| **Allow Document Assembly** | Whether pages can be inserted, deleted, or rotated    |
| **Allow Page Extraction**   | Whether individual pages can be extracted             |

All permissions require an owner password to be enforced. Without an owner password, permission flags are ignored by most PDF readers.

## How Permissions Work in PDF

PDF permissions are part of the encryption specification. They are stored as bit flags in the encryption dictionary and enforced by compliant PDF readers. The key distinction:

- **User password**: Required to open the file at all.
- **Owner password**: Required to change permissions or remove restrictions. Without it, the permission flags control what operations the user can perform.

If you set only an owner password (no user password), anyone can open the file but they are restricted to the allowed operations. If you set both, the file requires a password to open and is restricted after authentication.

## Use Cases

- Distributing a report that can be viewed and printed but not edited or copied
- Sharing a contract template that recipients can fill out but not modify
- Publishing a PDF catalog where copying images is disabled
- Allowing annotation on a review draft while preventing structural changes

## Tips

- To be effective, always set an owner password. Permissions without an owner password are unenforceable.
- Some third-party PDF tools ignore permission flags. For stronger protection, consider rasterizing the PDF or using DRM.
- Use this tool to upgrade old RC4-encrypted PDFs to AES-256.

## Related Tools

- [Encrypt PDF](./encrypt-pdf) -- simple password protection without granular permissions
- [Decrypt PDF](./decrypt-pdf) -- remove encryption entirely
- [Remove Restrictions](./remove-restrictions) -- strip all restrictions when you have the owner password
