---
title: PDF to BMP
description: Convert PDF pages to uncompressed BMP images. Useful for legacy systems and print workflows that require bitmap input.
---

# PDF to BMP

Converts each page of a PDF into a BMP (Bitmap) image. BMP is an uncompressed format, so the output is pixel-perfect with no quality loss -- but files are large.

## How It Works

1. Upload a PDF by clicking the drop zone or dragging a file onto it.
2. Click **Convert** to process the file.
3. A single `.bmp` file or a ZIP archive downloads automatically.

## Options

This tool has no configurable options. Pages render at a fixed 2x scale, producing images at approximately double the PDF's native page dimensions.

## Output Format

- **Single page**: `filename.bmp`
- **Multiple pages**: `filename_bmps.zip` containing `page_1.bmp`, `page_2.bmp`, etc.

## Use Cases

- Feeding PDF pages into legacy systems or hardware that only accept BMP input.
- Preparing uncompressed images for specific print workflows.
- Using bitmap output as input for image-processing tools that require raw pixel data.

## Tips

- BMP files are very large because they store raw pixel data without compression. For most uses, [PDF to PNG](./pdf-to-png) gives lossless quality with much smaller files.
- If your target system accepts PNG or TIFF, prefer those formats to save disk space.

## Related Tools

- [PDF to PNG](./pdf-to-png)
- [PDF to TIFF](./pdf-to-tiff)
- [PDF to JPG](./pdf-to-jpg)
