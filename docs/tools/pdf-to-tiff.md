---
title: PDF to TIFF
description: Convert PDF pages to TIFF images, commonly used in print, fax, and archival workflows. Falls back to PNG if encoding fails.
---

# PDF to TIFF

Converts each page of a PDF into a TIFF image. TIFF is the standard format for print production, fax systems, and document archival. The tool uses PackBits compression for TIFF encoding and falls back to PNG if a page fails to encode.

## How It Works

1. Upload a PDF by clicking the drop zone or dragging a file onto it.
2. Click **Convert** to process the file.
3. A single TIFF file or a ZIP archive downloads automatically.

## Options

This tool has no configurable options. Pages render at a fixed 2x scale.

## Output Format

- **Single page**: `filename.tiff`
- **Multiple pages**: `filename_tiffs.zip` containing `page_1.tiff`, `page_2.tiff`, etc.

If TIFF encoding fails for a specific page (due to compression issues), that page is saved as a `.png` file instead. The ZIP will contain a mix of TIFF and PNG files in that case.

## Use Cases

- Submitting documents to government agencies or legal systems that require TIFF format.
- Preparing pages for fax transmission through digital fax services.
- Archiving scanned documents in a widely supported lossless format.
- Feeding pages into enterprise document management systems.

## Tips

- TIFF files are large. If you only need lossless quality for web or screen use, [PDF to PNG](./pdf-to-png) is a better choice.
- Check the ZIP contents if some pages needed the PNG fallback -- you may want to convert those separately.

## Related Tools

- [PDF to PNG](./pdf-to-png)
- [PDF to BMP](./pdf-to-bmp)
- [PDF to JPG](./pdf-to-jpg)
