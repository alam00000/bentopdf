---
title: PNG to PDF
description: Convert one or more PNG images into a PDF document with adjustable quality, entirely in your browser.
---

# PNG to PDF

Convert PNG images to PDF while preserving their full resolution. Each PNG becomes its own page, sized to match the original image dimensions. Transparency is handled automatically.

## Supported Formats

| Format | Extensions |
| :----- | :--------- |
| PNG    | `.png`     |

## How It Works

1. Click the upload area or drag and drop PNG files. You can select several at once.
2. Manage the file list -- remove unwanted files or add more.
3. Choose a **PDF Quality** level from the dropdown.
4. Click **Convert to PDF**. The output downloads as `from_jpgs.pdf`.

The tool uses pdf-lib to embed each image directly. If a PNG cannot be embedded natively (e.g., due to an unusual color profile), it falls back to re-rendering through a canvas as JPEG.

## Options

**PDF Quality** controls the compression applied before embedding:

- **High Quality** -- minimal compression, largest file size.
- **Medium Quality** (default) -- good balance of size and clarity.
- **Low Quality** -- maximum compression, smallest output.

## Use Cases

- Converting screenshots into a multi-page PDF for bug reports or documentation
- Packaging UI design exports into a single file for review
- Turning diagram exports (draw.io, Excalidraw) into a shareable PDF
- Assembling a set of chart images into a report

## Tips

- PNG files with transparency get a white background in the PDF. If you need a different background, edit the images beforehand.
- For screenshots and diagrams with sharp edges and text, High quality avoids JPEG compression artifacts. Medium or Low may convert to JPEG internally.

## Related Tools

- [Images to PDF](./image-to-pdf)
- [JPG to PDF](./jpg-to-pdf)
- [SVG to PDF](./svg-to-pdf)
