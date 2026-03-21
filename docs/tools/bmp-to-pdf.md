---
title: BMP to PDF
description: Convert BMP bitmap images to PDF format directly in your browser, no upload to any server required.
---

# BMP to PDF

Convert Windows Bitmap (BMP) files to PDF. BMP is an uncompressed image format still found in legacy systems, medical imaging, and industrial scanners. This tool converts them to PDF without needing to install anything.

## Supported Formats

| Format | Extensions |
| :----- | :--------- |
| BMP    | `.bmp`     |

## How It Works

1. Click the upload area or drag and drop your BMP files.
2. Review the file list. Add more files or remove unwanted ones.
3. Click **Convert to PDF**. The output downloads as `from_bmps.pdf`.

Each BMP is drawn onto a canvas, exported as PNG, and then embedded in the PDF using pdf-lib. The page size matches the original image dimensions.

## Options

This tool does not expose additional quality settings. Images are embedded at their original resolution as lossless PNG within the PDF.

## Use Cases

- Converting legacy scanned documents stored as BMP into archival PDFs
- Turning BMP screenshots from older Windows applications into shareable documents
- Processing medical or industrial scanner output that defaults to BMP
- Migrating old image archives to a more portable format

## Tips

- BMP files are uncompressed, so they tend to be large. The resulting PDF will be significantly smaller since the images are re-encoded as PNG internally.
- If you have BMP files alongside other image formats, use the [Images to PDF](./image-to-pdf) tool to convert everything in a single batch.

## Related Tools

- [Images to PDF](./image-to-pdf)
- [PNG to PDF](./png-to-pdf)
- [TIFF to PDF](./tiff-to-pdf)
