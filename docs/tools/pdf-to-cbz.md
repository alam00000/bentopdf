---
title: PDF to CBZ
description: Convert a PDF into a CBZ (Comic Book Archive) file for comic readers like Komga, Kavita, CDisplayEx, and Calibre.
---

# PDF to CBZ

Converts a PDF into a CBZ (Comic Book ZIP) file — the standard format for digital comics and manga. Each PDF page becomes an image inside the archive. The tool generates metadata in three formats for maximum compatibility: ComicInfo.xml, metadata.opf, and ComicBookInfo JSON.

## How It Works

1. Upload a PDF by clicking the drop zone or dragging a file onto it.
2. Choose image format, quality, scale, and optional metadata.
3. Click **Convert** to generate the CBZ file.
4. The `.cbz` file downloads automatically.

## Options

| Option           | Values          | Default | Description                                                                   |
| ---------------- | --------------- | ------- | ----------------------------------------------------------------------------- |
| Image Format     | JPEG, PNG, WebP | JPEG    | JPEG for color comics, PNG for lossless B&W manga, WebP for best compression. |
| Quality          | 50–100%         | 85%     | Controls JPEG/WebP compression. Hidden for PNG (always lossless).             |
| Scale            | 1.0x–4.0x       | 2.0x    | Higher scale produces sharper images for high-res screens.                    |
| Grayscale        | On/Off          | Off     | Converts pages to grayscale. Reduces file size for B&W content.               |
| Manga mode       | On/Off          | Off     | Sets right-to-left reading direction in metadata.                             |
| Include metadata | On/Off          | On      | Embeds ComicInfo.xml, metadata.opf, and ComicBookInfo JSON.                   |

## Metadata Fields

When metadata is enabled, you can fill in:

- **Title** — Auto-detected from the PDF filename.
- **Series** — The series name (e.g., "Naruto").
- **Number (#)** — Issue number within the series.
- **Volume (Vol.)** — Volume number.
- **Author(s)** — Writer or creator name.
- **Publisher** — Publishing company.
- **Tags / Genre** — Comma-separated tags (e.g., "Action, Adventure").
- **Published Year** — Year of publication (1900–2100).
- **Rating** — Community rating from 0 to 5.

## Metadata Compatibility

The tool writes metadata in three formats so every reader can find it:

| Format             | Location          | Supported by                                |
| ------------------ | ----------------- | ------------------------------------------- |
| ComicInfo.xml      | File inside ZIP   | Komga, Kavita, CDisplayEx, Mylar, ComicRack |
| metadata.opf       | File inside ZIP   | Calibre                                     |
| ComicBookInfo JSON | ZIP comment field | Calibre (fallback)                          |

## Output Format

- `filename.cbz` — A ZIP archive containing numbered page images and metadata files.

Page images are named with zero-padded numbers (`01.jpg`, `02.jpg`, etc.) so readers display them in the correct order.

## Use Cases

- Converting manga or comic PDFs for use with comic book readers.
- Building a digital comic library in Komga, Kavita, or Calibre.
- Converting scanned comic books to a reader-friendly format.
- Sharing comics in a format that preserves reading direction and metadata.

## Tips

- Use **JPEG** for color comics and **PNG** for black-and-white manga — PNG compresses B&W content very efficiently.
- Enable **Grayscale** for manga to significantly reduce file size.
- Fill in the **Series** and **Number** fields so library managers (Komga, Calibre) can organize your collection automatically.
- **WebP** offers the best compression but older comic readers may not support it.

## Related Tools

- [PDF to JPG](./pdf-to-jpg)
- [PDF to PNG](./pdf-to-png)
- [PDF to TIFF](./pdf-to-tiff)
- [Extract Images](./extract-images)
