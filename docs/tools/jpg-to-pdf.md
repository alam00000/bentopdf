---
title: JPG to PDF
description: Convert one or more JPG, JPEG, and JPEG 2000 images into a single PDF file directly in your browser.
---

# JPG to PDF

Turn JPG images into a clean PDF. Upload one file or batch multiple JPGs together -- each image becomes a full-size page in the output document.

## Supported Formats

| Format    | Extensions      |
| :-------- | :-------------- |
| JPEG      | `.jpg`, `.jpeg` |
| JPEG 2000 | `.jp2`, `.jpx`  |

## How It Works

1. Click the upload area or drag and drop your JPG files. Multiple selection is supported.
2. Review the uploaded files. Use the trash icon to remove individual files, or click **Add More Files** to append to the list.
3. Select a **PDF Quality** level.
4. Click **Convert to PDF**. The tool compresses images according to your quality setting, converts them via the PyMuPDF engine, and downloads `from_jpgs.pdf`.

## Options

**PDF Quality** adjusts the compression applied to each image before it is embedded in the PDF:

- **High Quality** -- preserves maximum detail. Use for photography or print.
- **Medium Quality** (default) -- a solid balance between clarity and file size.
- **Low Quality** -- aggressive compression for the smallest output.

## Use Cases

- Converting scanned documents saved as JPGs into a single submission PDF
- Packaging product photos into a catalog for clients
- Turning JPEG 2000 medical or satellite images into a portable PDF
- Creating a printable photo album from camera exports

## Tips

- JPEG 2000 files (`.jp2`, `.jpx`) are fully supported, not just standard JPEG. This is useful for medical imaging and geospatial data.
- If your JPGs come from a phone camera, Medium quality usually produces a file that is 40-60% smaller than High with no visible difference on screen.

## Related Tools

- [Images to PDF](./image-to-pdf)
- [PNG to PDF](./png-to-pdf)
- [WebP to PDF](./webp-to-pdf)
