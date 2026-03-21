---
title: Images to PDF
description: Convert JPG, PNG, BMP, GIF, TIFF, SVG, HEIC, WebP, PSD, and 10+ other image formats into a single PDF file.
---

# Images to PDF

The universal image-to-PDF converter. Upload images in virtually any format and combine them into a single PDF document. Each image gets its own page, sized to match the original dimensions.

## Supported Formats

| Format          | Extensions                             |
| :-------------- | :------------------------------------- |
| JPEG            | `.jpg`, `.jpeg`                        |
| JPEG 2000       | `.jp2`, `.jpx`                         |
| PNG             | `.png`                                 |
| BMP             | `.bmp`                                 |
| GIF             | `.gif`                                 |
| TIFF            | `.tiff`, `.tif`                        |
| SVG             | `.svg`                                 |
| HEIC/HEIF       | `.heic`, `.heif`                       |
| WebP            | `.webp`                                |
| PSD             | `.psd`                                 |
| Portable Anymap | `.pnm`, `.pgm`, `.pbm`, `.ppm`, `.pam` |
| JPEG XR         | `.jxr`                                 |

This is the broadest format support of any BentoPDF image converter. If you only need a specific format, use one of the dedicated tools instead.

## How It Works

1. Click the upload area or drag and drop your image files. You can select multiple files at once.
2. Review the file list. Remove any unwanted files with the trash icon, or click **Add More Files** to include additional images.
3. Choose a **PDF Quality** level from the dropdown.
4. Click **Convert to PDF**. The tool processes images through the PyMuPDF engine and downloads the result as `images_to_pdf.pdf`.

## Options

**PDF Quality** controls the image compression applied when embedding images into the PDF:

- **High Quality** -- minimal compression, larger file size. Best for print or archival use.
- **Medium Quality** (default) -- balanced compression. Good for most purposes.
- **Low Quality** -- aggressive compression, smallest file size. Suitable for email or quick sharing.

HEIC and WebP files are automatically converted to PNG before embedding. This happens transparently and does not require any extra steps.

## Use Cases

- Combining scanned receipts or documents from a phone camera into one PDF
- Creating a photo portfolio or lookbook from mixed-format images
- Converting iPhone photos (HEIC) to a shareable PDF without installing desktop software
- Assembling design mockups from PSD exports and screenshots into a client deliverable
- Archiving a folder of legacy image formats (PNM, JXR, JP2) as a single PDF

## Tips

- The order of images in the PDF matches the order they appear in the file list. Upload them in the sequence you want.
- For the smallest possible file size, choose Low Quality. The visual difference is often negligible for text-heavy scans.
- If you only have one image format, the dedicated converters (JPG to PDF, PNG to PDF, etc.) offer the same result with a simpler interface.

## Related Tools

- [JPG to PDF](./jpg-to-pdf)
- [PNG to PDF](./png-to-pdf)
- [HEIC to PDF](./heic-to-pdf)
- [WebP to PDF](./webp-to-pdf)
