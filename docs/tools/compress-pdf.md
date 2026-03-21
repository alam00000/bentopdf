---
title: Compress PDF
description: Reduce PDF file size by up to 90% with smart compression algorithms. Supports batch processing and custom quality settings.
---

# Compress PDF

Shrink your PDF files without destroying them. BentoPDF offers two distinct compression algorithms -- one for text-heavy documents, another for photo-heavy scans -- so you get meaningful size reduction regardless of what your PDF contains.

## How It Works

1. Upload one or more PDFs by clicking the drop zone or dragging files in.
2. Select a **Compression Algorithm** -- Condense or Photon.
3. Pick a **Compression Level** from Light to Extreme.
4. Optionally toggle **Convert to Grayscale** or expand **Custom Settings** for fine-grained control.
5. Click **Compress PDF**. For multiple files, you get a single ZIP download.

## Compression Algorithms

### Condense (Recommended)

The default algorithm. It removes dead weight from the PDF structure, recompresses images at a target DPI, subsets fonts to strip unused glyphs, and removes embedded thumbnails. The PDF stays fully functional -- text remains selectable, links keep working.

Condense requires the PyMuPDF WASM engine.

### Photon (For Photo-Heavy PDFs)

Photon renders each page to a JPEG image and reassembles them into a new PDF. This works well for scanned documents or image-heavy files where Condense cannot squeeze much out. The trade-off is that text becomes non-selectable and hyperlinks stop working.

## Compression Levels

| Level          | Image Quality | DPI Target | Best For                       |
| -------------- | ------------- | ---------- | ------------------------------ |
| **Light**      | 90%           | 150        | Preserving visual quality      |
| **Balanced**   | 75%           | 96         | Everyday documents             |
| **Aggressive** | 50%           | 72         | Email attachments, web uploads |
| **Extreme**    | 30%           | 60         | Maximum size reduction         |

## Custom Settings

Expand the Custom Settings panel to override preset values:

- **Output Quality** (1-100%) -- JPEG quality for recompressed images
- **Resize Images To** (DPI) -- target resolution for downsampled images
- **Only Process Above** (DPI) -- images below this threshold are left untouched
- **Remove metadata** -- strips document info fields
- **Subset fonts** -- removes unused glyphs from embedded fonts
- **Remove embedded thumbnails** -- drops preview images stored inside the PDF

## Use Cases

- Bringing a 50 MB report under an email attachment limit
- Optimizing marketing PDFs for faster website downloads
- Archiving large document sets where storage costs matter
- Preparing scanned contracts for a document management system
- Reducing mobile data usage when sharing PDFs over messaging apps

## Tips

- Start with Balanced. If the result is still too large, step up to Aggressive before trying Extreme.
- Use Photon only when Condense produces minimal savings -- it permanently removes text selection.
- The grayscale toggle alone can cut file size substantially for color-heavy documents.

## Related Tools

- [Linearize PDF](./linearize-pdf) -- optimize the compressed PDF for fast web viewing
- [Rasterize PDF](./rasterize-pdf) -- convert pages to images at a specific DPI
- [Repair PDF](./repair-pdf) -- fix a PDF that broke during compression elsewhere
- [Remove Metadata](./remove-metadata) -- strip hidden data for privacy
