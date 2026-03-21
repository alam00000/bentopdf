---
title: XPS to PDF
description: Convert XPS and OXPS documents to PDF format in your browser. No upload, no signup, fully private.
---

# XPS to PDF

Convert Microsoft XPS and OXPS documents into standard PDF files. XPS (XML Paper Specification) was Microsoft's answer to PDF, but support for it has dwindled across platforms. This tool makes those documents universally readable again.

## Supported Formats

| Format | Extension | Notes                                   |
| :----- | :-------- | :-------------------------------------- |
| XPS    | `.xps`    | Original Microsoft XPS format           |
| OXPS   | `.oxps`   | Open XPS, the ECMA-388 standard variant |

## How It Works

1. Click the upload area or drag and drop your XPS/OXPS files. You can select multiple files at once.
2. Review the file list. Remove individual files with the trash icon, or click **Add More Files** to append additional documents.
3. Click **Convert to PDF**. The PyMuPDF engine processes each document locally in your browser.
4. A single file downloads directly as a PDF. Multiple files are bundled into a ZIP archive named `xps-converted.zip`.

## Options

This tool performs a direct format conversion with no additional configuration. The output preserves the original page dimensions, vector graphics, fonts, and images from the XPS source.

## Use Cases

- Opening XPS files received from older Windows systems that defaulted to the XPS print driver
- Converting OXPS documents from Windows 10/11 for sharing with macOS or Linux users
- Archiving legacy XPS files into a more widely supported format
- Making XPS-based government or corporate documents accessible to external recipients

## Tips

- Both `.xps` and `.oxps` extensions are handled automatically -- you can mix them in the same batch.
- If the original XPS file was created from a high-resolution print driver, the resulting PDF retains that quality. No resampling occurs.

## Related Tools

- [Word to PDF](./word-to-pdf)
- [XML to PDF](./xml-to-pdf)
