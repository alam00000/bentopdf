---
title: PDF to WebP
description: Convert PDF pages to WebP images with adjustable quality. Smaller file sizes than JPG at comparable visual quality.
---

# PDF to WebP

Converts each page of a PDF into a WebP image. WebP typically produces files 25-35% smaller than JPG at the same perceived quality, making it a strong choice for web use.

## How It Works

1. Upload a PDF by clicking the drop zone or dragging a file onto it.
2. Adjust the **Quality** slider.
3. Click **Convert** to process the file.
4. A single `.webp` file or a ZIP archive downloads automatically.

## Options

- **Quality** -- a slider from 0% to 100% (default 85%). Controls the lossy compression level. Higher values retain more detail.

Pages render at 2x scale internally, producing images at roughly double the PDF's native dimensions.

## Output Format

- **Single page**: `filename.webp`
- **Multiple pages**: `filename_webps.zip` containing `page_1.webp`, `page_2.webp`, etc.

## Use Cases

- Preparing page previews for websites where bandwidth matters.
- Generating lightweight image versions of flyers or brochures for social media.
- Batch-converting multi-page documents into a web-optimized image set.

## Tips

- WebP is supported in all modern browsers. For legacy compatibility, fall back to [PDF to JPG](./pdf-to-jpg).
- A quality of 80-85% is usually indistinguishable from the original on screen while keeping file sizes small.

## Related Tools

- [PDF to JPG](./pdf-to-jpg)
- [PDF to PNG](./pdf-to-png)
- [PDF to BMP](./pdf-to-bmp)
