---
title: Deskew PDF
description: Automatically straighten tilted pages in scanned PDFs using OpenCV skew detection. Adjustable threshold and DPI settings.
---

# Deskew PDF

Scanned documents are rarely perfectly straight. Even a slight tilt makes OCR less accurate and printing look sloppy. This tool uses OpenCV's image processing algorithms to detect the skew angle of each page and rotate it back to level.

## How It Works

1. Upload one or more scanned PDFs.
2. Set the **Skew Threshold** -- pages with detected skew below this value are left untouched.
3. Choose a **Processing Quality (DPI)** -- higher DPI improves detection accuracy but takes longer.
4. Click **Deskew PDF**.
5. After processing, a results panel shows each page's detected angle and whether it was corrected.

## Options

| Setting            | Values                     | Default |
| ------------------ | -------------------------- | ------- |
| **Skew Threshold** | 0.1, 0.5, 1.0, 2.0 degrees | 0.5     |
| **Processing DPI** | 100, 150, 200, 300         | 150     |

## How Skew Detection Works

The tool renders each page to an image at the selected DPI, then uses OpenCV to detect dominant line angles in the content. If the detected skew exceeds the threshold, the page is rotated by the inverse angle to straighten it. Pages below the threshold are passed through unchanged.

## Use Cases

- Cleaning up batch-scanned contracts or legal documents
- Preparing scanned receipts or invoices for OCR processing
- Straightening pages from a flatbed scanner with inconsistent paper placement
- Improving the visual quality of digitized archival materials

## Tips

- Lower the threshold to 0.1 degrees if you need pixel-perfect alignment for OCR.
- 150 DPI is fast and accurate for most documents. Use 300 DPI for very small text or fine-detail pages.
- Deskew works best on documents with clear horizontal text lines. It may struggle with pages that are mostly images or diagonal design elements.

## Related Tools

- [Rasterize PDF](./rasterize-pdf) -- convert the deskewed output to a flat image-based PDF
- [Compress PDF](./compress-pdf) -- reduce file size after deskewing
- [Repair PDF](./repair-pdf) -- fix structural issues in scanned PDFs
