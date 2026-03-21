---
title: HEIC to PDF
description: Convert HEIC and HEIF images from iPhones and iPads to PDF format directly in your browser.
---

# HEIC to PDF

Convert HEIC/HEIF images to PDF. HEIC is the default photo format on iPhones and iPads since iOS 11. This tool lets you turn those photos into PDFs without installing any desktop software or uploading files to a server.

## Supported Formats

| Format | Extensions |
| :----- | :--------- |
| HEIC   | `.heic`    |
| HEIF   | `.heif`    |

## How It Works

1. Click the upload area or drag and drop your HEIC/HEIF files.
2. Review the file list and remove any unwanted files.
3. Click **Convert to PDF**. The result downloads as `from_heic.pdf`.

Each HEIC file is decoded using the heic2any library, which converts it to PNG at 92% quality. The PNG is then embedded in the PDF using pdf-lib, with each image on its own page at full resolution.

## Options

This tool does not expose additional settings. HEIC images are converted at high quality (0.92) to PNG before embedding.

## Use Cases

- Creating a PDF from iPhone photos to attach to an insurance claim or report
- Converting HEIC photos for a real estate listing into a single printable document
- Turning iPad screenshots (HEIF format) into a shareable PDF
- Batch converting vacation photos for a travel journal

## Tips

- HEIC decoding happens entirely in the browser using WebAssembly. The first conversion may take a moment while the decoder loads.
- If you need to mix HEIC with other image formats (JPG, PNG, etc.), use the [Images to PDF](./image-to-pdf) tool, which handles HEIC alongside all other formats.
- HEIC files from iPhones often contain EXIF data including GPS coordinates. The PDF output does not carry this metadata forward.

## Related Tools

- [Images to PDF](./image-to-pdf)
- [JPG to PDF](./jpg-to-pdf)
- [PNG to PDF](./png-to-pdf)
