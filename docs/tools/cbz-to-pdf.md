---
title: CBZ to PDF
description: Convert CBZ and CBR comic book archives to PDF in your browser. Free, private, no upload needed.
---

# CBZ to PDF

Turn comic book archive files into PDFs. CBZ and CBR are the standard formats for digital comics -- they are just ZIP or RAR archives filled with images. This tool extracts each page, preserves the reading order, and produces a clean PDF where every image becomes a full-size page.

## Supported Formats

| Format | Extension | Notes                                                    |
| :----- | :-------- | :------------------------------------------------------- |
| CBZ    | `.cbz`    | ZIP-based comic archive (processed locally with pdf-lib) |
| CBR    | `.cbr`    | RAR-based comic archive (processed via PyMuPDF engine)   |

The CBZ converter recognizes JPEG, PNG, GIF, BMP, WebP, AVIF, TIFF, HEIC, and JXL images inside the archive. Non-standard formats are auto-converted to PNG before embedding.

## How It Works

1. Click the upload area or drag and drop your CBZ or CBR files. You can mix both formats in a single batch.
2. Review the listed files. Remove any you don't need, or click **Add More Files** to add more.
3. Click **Convert to PDF**. For CBZ files, the tool unzips the archive, sorts image files by name in natural order, detects each image's actual format, and embeds them into a PDF using pdf-lib. CBR files are routed through the PyMuPDF engine instead.
4. A single file downloads as a PDF. Multiple files produce a ZIP archive named `comic-converted.zip`.

## Options

No configuration is required. Each image becomes a page sized to match its original dimensions, so double-page spreads stay wide and single pages stay narrow.

## Use Cases

- Reading comics on a tablet or phone app that supports PDF but not CBZ/CBR
- Printing specific pages from a digital comic
- Archiving a comic collection into a format any file viewer can open
- Sharing a comic with someone who does not have a dedicated comic reader

## Tips

- Images inside the archive are sorted using natural ordering (so `page2.jpg` comes before `page10.jpg`). Name your files with consistent numbering for correct page sequence.
- The converter detects image formats by their binary signatures, not file extensions. A PNG accidentally named `.jpg` will still embed correctly.
- CBZ files are processed entirely in the browser without loading the PyMuPDF engine, so they convert faster than CBR files.

## Related Tools

- [EPUB to PDF](./epub-to-pdf)
- [MOBI to PDF](./mobi-to-pdf)
- [Images to PDF](./image-to-pdf)
