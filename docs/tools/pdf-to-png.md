---
title: PDF to PNG
description: Convert PDF pages to lossless PNG images with adjustable scale. Ideal for high-quality screenshots and transparent backgrounds.
---

# PDF to PNG

Converts each page of a PDF into a PNG image. PNG uses lossless compression, so the output preserves every detail of the original page. Single-page PDFs download as a `.png` file; multi-page PDFs produce a ZIP.

## How It Works

1. Upload a PDF by clicking the drop zone or dragging a file onto it.
2. Set the **Scale** slider to control output resolution.
3. Click **Convert** to start processing.
4. A single PNG or a ZIP archive downloads automatically.

## Options

- **Scale** -- ranges from 1.0x to 3.0x (default 2.0x). At 2.0x, a standard letter-size page renders at approximately 1,224 x 1,584 pixels. Higher scale values produce larger, sharper images at the cost of file size and processing time.

## Output Format

- **Single page**: `filename.png`
- **Multiple pages**: `filename_pngs.zip` containing `page_1.png`, `page_2.png`, etc.

## Use Cases

- Capturing high-fidelity screenshots of PDF pages for presentations.
- Extracting charts or diagrams that need crisp edges and no compression artifacts.
- Preparing assets for web design from PDF mockups.
- Creating lossless page images for OCR preprocessing.

## Tips

- PNG files are significantly larger than JPG. If file size matters more than perfect quality, use [PDF to JPG](./pdf-to-jpg) or [PDF to WebP](./pdf-to-webp).
- At scale 1.0x, output matches the PDF's native resolution. Bump to 3.0x for print-quality exports.

## Related Tools

- [PDF to JPG](./pdf-to-jpg)
- [PDF to WebP](./pdf-to-webp)
- [PDF to SVG](./pdf-to-svg)
