---
title: WebP to PDF
description: Convert WebP images to PDF format directly in your browser with adjustable compression quality.
---

# WebP to PDF

Convert Google's WebP image format to PDF. This is particularly useful when you have downloaded images from the web that are in WebP format and need them in a more universally accepted format for printing or sharing.

## Supported Formats

| Format | Extensions |
| :----- | :--------- |
| WebP   | `.webp`    |

## How It Works

1. Click the upload area or drag and drop your WebP files.
2. Review the file list and remove any files you do not need.
3. Select a **PDF Quality** level.
4. Click **Convert to PDF**. The output downloads as `from_webps.pdf`.

Internally, each WebP image is decoded through the browser's canvas API, then embedded in the PDF using pdf-lib. This means the conversion works on any browser that supports WebP decoding (all modern browsers do).

## Options

**PDF Quality** controls compression when embedding images:

- **High Quality** -- preserves the most detail.
- **Medium Quality** (default) -- balanced output.
- **Low Quality** -- smallest file size.

## Use Cases

- Converting web-downloaded images saved as WebP into a printable PDF
- Packaging WebP screenshots from Chrome or Edge into documentation
- Creating a PDF portfolio from images exported by design tools that default to WebP
- Archiving WebP images in a more universally readable format

## Tips

- WebP is decoded to PNG internally before PDF embedding, so lossless WebP images retain their quality at the High setting.
- If you have a mix of WebP and other image formats, use the [Images to PDF](./image-to-pdf) tool instead -- it accepts everything in one go.

## Related Tools

- [Images to PDF](./image-to-pdf)
- [PNG to PDF](./png-to-pdf)
- [JPG to PDF](./jpg-to-pdf)
