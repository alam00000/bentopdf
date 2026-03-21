---
title: Flatten PDF
description: Flatten interactive forms and annotations into static content. Makes form fields non-editable and burns annotations into the page.
---

# Flatten PDF

Flattening merges interactive elements -- form fields, dropdowns, checkboxes, annotations, highlights, sticky notes -- directly into the page content. The visual appearance stays the same, but nothing is editable or extractable anymore. It is the PDF equivalent of printing a filled-out form and scanning it back in, except the quality stays perfect.

## How It Works

1. Upload one or more PDF files.
2. Click **Flatten PDF**.
3. A single file downloads directly. Multiple files produce a ZIP archive.

The tool uses pdf-lib to flatten form fields (via `form.flatten()`) and a dedicated annotation flattener to burn annotations into the page stream. Both operations happen in a single pass.

## What Gets Flattened

- **Form fields**: Text inputs, checkboxes, radio buttons, dropdowns, signature fields
- **Annotations**: Comments, highlights, strikethrough, underline, sticky notes, stamps, ink annotations
- **Interactive elements**: Buttons, action triggers

## What Stays Unchanged

- Text content (remains selectable and searchable)
- Images and graphics
- Page layout and dimensions
- Bookmarks and table of contents
- Hyperlinks (unless they are annotation-based)

## Use Cases

- Locking a completed form so recipients cannot change the submitted answers
- Preparing a PDF for archival where interactive elements are unnecessary
- Fixing display issues caused by annotations rendering differently across viewers
- Ensuring a signed document cannot be modified after the signature is applied
- Reducing file size by eliminating form field definitions and annotation objects

## Tips

- Flatten after all edits are complete. There is no way to unflatten a PDF.
- If you need to flatten and also strip metadata, JavaScript, and attachments, use the Sanitize PDF tool instead -- it includes flattening as one of its options.
- Some PDFs report "no form found" -- this is normal if the document only has annotations and no form fields.

## Related Tools

- [Sanitize PDF](./sanitize-pdf) -- flatten forms plus remove metadata, scripts, and more
- [Rasterize PDF](./rasterize-pdf) -- convert to image-based PDF for maximum flattening
- [Font to Outline](./font-to-outline) -- flatten fonts to vector paths
- [Encrypt PDF](./encrypt-pdf) -- lock the flattened PDF with a password
