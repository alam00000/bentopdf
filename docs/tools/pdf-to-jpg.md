---
title: PDF to JPG
description: Convert PDF pages to JPG images with adjustable quality. Single-page PDFs download directly; multi-page PDFs export as a ZIP.
---

# PDF to JPG

Converts each page of a PDF into a JPG image. Single-page documents download as a standalone `.jpg` file. Multi-page PDFs produce a ZIP archive containing one JPG per page.

## How It Works

1. Upload a PDF by clicking the drop zone or dragging a file onto it. The tool displays the filename, file size, and page count.
2. Adjust the **Quality** slider to control JPG compression.
3. Click **Convert** to start processing.
4. The result downloads automatically -- a single JPG for one-page PDFs, or a ZIP file for multi-page documents.

## Options

- **Quality** -- a slider from 0% to 100% (default 90%). Higher values produce sharper images with larger file sizes. Lower values compress more aggressively.

Pages render at 2x scale internally, so the output resolution is double the PDF page dimensions. A standard letter-size page produces roughly a 1,224 x 1,584 pixel image.

## Output Format

- **Single page**: `filename.jpg`
- **Multiple pages**: `filename_jpgs.zip` containing `page_1.jpg`, `page_2.jpg`, etc.

## Use Cases

- Generating preview thumbnails for a document management system.
- Sharing a page from a report in a chat or email that doesn't support PDF.
- Creating image assets from PDF diagrams or illustrations.
- Archiving scanned documents as individual images.

## Tips

- For lossless output, use [PDF to PNG](./pdf-to-png) instead.
- A quality setting of 80-90% strikes a good balance between file size and visual fidelity.
- If you need a specific format per page, consider the [PDF Workflow Builder](./pdf-workflow) which has a PDF to Images output node.

## Related Tools

- [PDF to PNG](./pdf-to-png)
- [PDF to WebP](./pdf-to-webp)
- [PDF to BMP](./pdf-to-bmp)
- [PDF to TIFF](./pdf-to-tiff)
