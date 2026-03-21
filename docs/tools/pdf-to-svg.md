---
title: PDF to SVG
description: Convert PDF pages to scalable SVG vector graphics. Preserves text and shapes as vector paths for infinite scaling.
---

# PDF to SVG

Converts each page of a PDF into an SVG (Scalable Vector Graphics) file. Unlike raster formats, SVG preserves vector paths, text, and shapes so the output scales to any size without pixelation. Powered by PyMuPDF.

## How It Works

1. Upload one or more PDFs by clicking the drop zone or dragging files onto it. You can add multiple files and manage them individually.
2. Click **Convert** to process all uploaded files.
3. Single-page, single-file conversions download as a standalone `.svg`. Everything else downloads as a ZIP archive.

## Options

This tool has no configurable options. Each page is converted to SVG using PyMuPDF's native vector export.

## Output Format

- **Single file, single page**: `filename.svg`
- **Single file, multiple pages**: `filename_svg.zip` containing `page_1.svg`, `page_2.svg`, etc.
- **Multiple files**: `pdf_to_svg.zip` with files organized by source document name.

## Use Cases

- Extracting vector diagrams, charts, or illustrations from PDF reports for use in web pages.
- Editing PDF page content in a vector editor like Inkscape or Illustrator.
- Embedding scalable page previews in responsive web applications.
- Extracting logos or graphics from PDF brochures while preserving sharp edges.

## Tips

- SVG works best with PDFs that contain vector content. Scanned documents or image-heavy PDFs will produce large SVG files with embedded raster data.
- For raster output of image-heavy PDFs, use [PDF to PNG](./pdf-to-png) or [PDF to JPG](./pdf-to-jpg) instead.
- This tool supports batch conversion -- upload multiple PDFs at once to convert them all in a single run.

## Related Tools

- [PDF to PNG](./pdf-to-png)
- [PDF to JPG](./pdf-to-jpg)
- [PDF to Markdown](./pdf-to-markdown)
