---
title: SVG to PDF
description: Convert SVG vector graphics to PDF with quality control, entirely in your browser.
---

# SVG to PDF

Convert Scalable Vector Graphics (SVG) files to PDF. The tool rasterizes each SVG through the browser's rendering engine, then embeds the result at its native resolution. Useful for turning vector icons, diagrams, and illustrations into portable documents.

## Supported Formats

| Format | Extensions |
| :----- | :--------- |
| SVG    | `.svg`     |

## How It Works

1. Click the upload area or drag and drop one or more SVG files.
2. Review and manage the file list.
3. Choose a **PDF Quality** level.
4. Click **Convert to PDF**. The result downloads as `from_svgs.pdf`.

Each SVG is read as text, rendered onto a canvas at its intrinsic width and height (defaulting to 800x600 if no dimensions are specified), and exported as PNG. That PNG is then embedded in the PDF using pdf-lib. Transparent areas are filled with a white background.

## Options

**PDF Quality** controls compression after rasterization:

- **High Quality** -- closest to the original rendering.
- **Medium Quality** (default) -- good balance.
- **Low Quality** -- smallest file, some detail loss.

## Use Cases

- Converting architecture or engineering diagrams from SVG to a print-ready PDF
- Packaging icon sets into a reference PDF for a design system
- Turning data visualizations (D3.js, chart library exports) into report-ready PDFs
- Creating printable versions of SVG-based infographics

## Tips

- SVG files without explicit `width` and `height` attributes render at 800x600 pixels. For best results, set dimensions in the SVG source before converting.
- Complex SVGs with external font references or linked images may not render perfectly. Inline all assets in the SVG for reliable output.
- Since the SVG is rasterized, the PDF will contain a bitmap image rather than vector paths. For true vector PDF output, a dedicated vector tool is needed.

## Related Tools

- [Images to PDF](./image-to-pdf)
- [PNG to PDF](./png-to-pdf)
- [BMP to PDF](./bmp-to-pdf)
