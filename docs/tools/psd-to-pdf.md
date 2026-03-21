---
title: PSD to PDF
description: Convert Photoshop (PSD) files to PDF in your browser. Free, private, no Adobe software required.
---

# PSD to PDF

Convert Adobe Photoshop PSD files into PDF documents. PSD is the native format for Photoshop, and opening one normally requires expensive Adobe software. This tool renders the flattened composite of your PSD file as a full-resolution PDF page.

## Supported Formats

| Format          | Extension | Notes                                 |
| :-------------- | :-------- | :------------------------------------ |
| Adobe Photoshop | `.psd`    | Renders the flattened composite image |

## How It Works

1. Click the upload area or drag and drop your PSD files. Multiple files are supported.
2. Review the file list. Remove unwanted files with the trash icon, or use **Add More Files** to include more.
3. Click **Convert to PDF**. The PyMuPDF engine reads the PSD file and embeds the composite image into a PDF page at the original resolution.
4. A single PSD produces one PDF. When you upload multiple PSD files, they are combined into a single multi-page PDF named `psd_to_pdf.pdf`, with each PSD becoming one page.

## Options

No settings are needed. The converter uses the flattened image data from the PSD file.

## Use Cases

- Previewing Photoshop designs without opening Photoshop
- Sending design proofs to clients who don't have Adobe Creative Suite
- Printing high-resolution artwork from PSD files
- Creating a PDF portfolio from multiple PSD design files -- each becomes a page in a single document

## Tips

- The conversion renders the composite (flattened) view of the PSD. Individual layers, adjustment layers, and layer effects are not preserved as separate elements in the PDF.
- Multiple PSD files are merged into one multi-page PDF rather than individual PDFs. This is useful for building portfolios or lookbooks.
- PSD files with very high resolution (300+ DPI print files) will produce large PDFs. The tool preserves the full resolution.

## Related Tools

- [Images to PDF](./image-to-pdf)
- [PNG to PDF](./png-to-pdf)
- [VSD to PDF](./vsd-to-pdf)
