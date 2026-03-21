---
title: Extract Images
description: Extract all embedded images from PDF files. Preview them in a grid and download individually or as a ZIP archive.
---

# Extract Images

Pulls every embedded image out of one or more PDF files. Extracted images are displayed in a preview grid where you can download them individually, or grab everything at once as a ZIP. Powered by PyMuPDF.

## How It Works

1. Upload one or more PDFs by clicking the drop zone or dragging files onto it. Add more files or remove individual ones as needed.
2. Click **Extract** to start processing.
3. The tool scans every page of every uploaded PDF, finding and extracting embedded images.
4. Extracted images appear in a grid with thumbnails. Each image has a download button.
5. Click **Download All** to save everything as a ZIP archive.

## Options

This tool has no configurable options. All embedded images are extracted in their native format (typically PNG, JPEG, or whatever format was used when the image was embedded in the PDF).

## Output Format

- Images display in a preview grid named `image_1.png`, `image_2.jpg`, etc.
- **Download All** produces `extracted-images.zip` containing all images.
- Individual images can be downloaded one at a time from the grid.

## Use Cases

- Recovering photos or graphics from a PDF to reuse in another project.
- Extracting product images from a catalog PDF for an e-commerce listing.
- Pulling diagrams from technical documentation for use in presentations.
- Auditing which images are embedded in a document before sharing it.

## Tips

- The tool extracts images exactly as they are stored in the PDF. It does not re-render pages as images -- for that, use [PDF to PNG](./pdf-to-png) or [PDF to JPG](./pdf-to-jpg).
- If the tool reports "No Images Found", the PDF may use vector graphics rather than embedded raster images, or it may be a scanned document where the entire page is one large image.
- Batch processing works across multiple PDFs. All images from all files are combined into a single grid and ZIP.

## Related Tools

- [PDF to PNG](./pdf-to-png)
- [PDF to JPG](./pdf-to-jpg)
- [PDF Workflow Builder](./pdf-workflow)
