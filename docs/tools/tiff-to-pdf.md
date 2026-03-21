---
title: TIFF to PDF
description: Convert single and multi-page TIFF images to PDF format in your browser with full page support.
---

# TIFF to PDF

Convert TIFF files to PDF, including multi-page TIFFs. Each page (or "IFD") in a TIFF file becomes a separate page in the output PDF. This is especially useful for scanned documents, faxes, and medical images that are commonly stored as multi-page TIFFs.

## Supported Formats

| Format | Extensions      |
| :----- | :-------------- |
| TIFF   | `.tiff`, `.tif` |

## How It Works

1. Click the upload area or drag and drop your TIFF files.
2. Review the file list and manage it as needed.
3. Click **Convert to PDF**. The result downloads as `from_tiff.pdf`.

The tool decodes each TIFF file using a JavaScript TIFF decoder, extracting every page's raw RGBA pixel data. Each page is rendered onto a canvas, exported as PNG, and embedded in the PDF. Page dimensions match the original TIFF pages.

## Options

This tool does not expose additional quality settings. Images are embedded at their native resolution.

## Use Cases

- Converting multi-page fax documents (TIFF-F) to a more portable PDF format
- Turning scanned document archives stored as TIFF into searchable PDFs (combine with the OCR tool afterward)
- Processing medical imaging files (pathology slides, radiology exports) that use TIFF
- Converting GIS or satellite imagery TIFF files into shareable documents

## Tips

- Multi-page TIFFs are fully supported. A 10-page TIFF will produce a 10-page PDF. You do not need to split the TIFF first.
- Very large TIFF files (hundreds of megabytes) may take longer to process since the entire file must be decoded in browser memory.
- If you need OCR on the resulting PDF, run it through the [OCR PDF](./ocr-pdf) tool after conversion.

## Related Tools

- [Images to PDF](./image-to-pdf)
- [BMP to PDF](./bmp-to-pdf)
- [JPG to PDF](./jpg-to-pdf)
