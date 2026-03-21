---
title: Rasterize PDF
description: Convert PDF pages to image-based PDF. Flatten all layers, remove selectable text, and control DPI and image format.
---

# Rasterize PDF

Rasterization converts each page of a PDF into an image and reassembles those images back into a PDF. The result looks identical to the original but contains no selectable text, no interactive elements, and no editable layers. It is effectively a high-quality photocopy.

## How It Works

1. Upload one or more PDF files.
2. Set the **DPI** (resolution) for the rasterized output.
3. Choose an **Image Format** -- PNG for lossless quality or JPEG for smaller files.
4. Optionally check **Convert to Grayscale**.
5. Click **Rasterize PDF**. Multiple files download as a ZIP.

## Options

| Setting          | Values                         | Default |
| ---------------- | ------------------------------ | ------- |
| **DPI**          | 72, 150, 200, 300, 600         | 150     |
| **Image Format** | PNG (lossless), JPEG (smaller) | PNG     |
| **Grayscale**    | On/Off                         | Off     |

## DPI Guidelines

- **72** -- Screen-only viewing, smallest file size
- **150** -- Good balance for general use
- **200** -- Sharper text, moderate file size
- **300** -- Print-quality output
- **600** -- High-quality archival or professional printing

## Use Cases

- Preventing text extraction from confidential documents before sharing
- Eliminating font dependency issues by converting text to pixels
- Creating a "flat" version of a PDF with complex layers or transparency that renders differently across viewers
- Preparing a PDF for a system that only accepts image-based input
- Stripping hidden content (like tracked changes or form data) by reducing the PDF to pure images

## Tips

- 150 DPI at PNG is a solid default. Only go higher if you need print output or need to zoom in on fine details.
- JPEG produces noticeably smaller files but introduces compression artifacts on sharp text edges.
- Rasterization is irreversible -- keep your original PDF if you might need editable text later.

## Related Tools

- [Compress PDF](./compress-pdf) -- reduce the rasterized PDF's file size
- [Deskew PDF](./deskew-pdf) -- straighten pages before rasterizing scanned documents
- [Font to Outline](./font-to-outline) -- convert fonts to vector paths if you want to keep scalability
- [Flatten PDF](./flatten-pdf) -- flatten forms without converting to images
