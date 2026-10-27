---
title: Compress PDF
description: Reduce PDF file size by up to 90% with the Hyper Compress engine. Supports target file sizes, batch processing, and custom quality settings.
---

# Compress PDF

Shrink your PDF files without destroying them. Compress PDF is powered by [Hyper Compress](https://www.bentopdf.com/hyper-compress), BentoPDF's own compression engine. It recompresses images, subsets and merges fonts, and strips dead weight such as embedded thumbnails and private application data. The PDF stays fully functional: text remains selectable, links and form fields keep working.

Hyper Compress is compiled to WebAssembly and ships with BentoPDF, so compression works offline and in air-gapped deployments with no extra setup.

## How It Works

1. Upload one or more PDFs by clicking the drop zone or dragging files in.
2. Pick a **Compression Level**: Low, Medium, High, or Lossless.
3. Optionally enter a **Target File Size**, or expand **Custom Settings** for fine-grained control, including **Convert to grayscale**.
4. Click **Compress PDF**. For multiple files, you get a single ZIP download.

## Special Documents

- **Digitally signed PDFs** are returned unchanged, because any change would invalidate the signature. Turn on **Override content protection** under Custom Settings to remove the signatures and compress them; the visible signature stays on the page, but the file is no longer signed.
- **PDF/A files** lose their PDF/A label after compression, so the file never claims a conformance it no longer meets. Turn on **Preserve PDF/A** under Custom Settings to keep the file conformant instead.
- **Password-protected PDFs** get a password field on their file card. Enter the password there and Hyper Compress opens the file itself, no separate unlock step. With two or more locked files, one shared field unlocks every file that uses the same password. The compressed copy has no password; use [Protect PDF](./protect-pdf) to add one again.
- **Scans with no text layer** can shrink further with **Rasterize pages** under Custom Settings, which replaces each page with one optimized image. It is skipped for any document that has selectable text, including OCR'd scans, unless **Override content protection** is on. Then text pages become images too, so text stops being selectable and links stop working.

## Compression Levels

| Level        | Image Quality    | Max Resolution | Best For                       |
| ------------ | ---------------- | -------------- | ------------------------------ |
| **Low**      | 80               | 200 DPI        | Preserving visual quality      |
| **Medium**   | 50               | 150 DPI        | Everyday documents             |
| **High**     | 20               | 72 DPI         | Email attachments, web uploads |
| **Lossless** | Images untouched | Unchanged      | Archival copies                |

High also unembeds the 14 standard PDF fonts, plus look-alikes such as Arial when that is safe.

## Target File Size

Enter a size in KB or MB and Hyper Compress searches for the best image quality that still fits, starting from the level you picked. If the document cannot get that small, you get the smallest version it can make and a message saying so. The dedicated pages such as [Compress PDF to 1MB](https://www.bentopdf.com/compress-pdf-to-1mb) open with the target already filled in.

## Custom Settings

Expand the Custom Settings panel to adjust Hyper Compress directly. Choosing a compression level resets these to that level's values, and editing any of them switches the level to Custom.

- **Override content protection**: by default Hyper Compress leaves signed PDFs untouched and won't rasterize pages that have text. Turning this on bypasses both. It stays on when you change the level.

- **Images**: image quality, maximum resolution, forced resampling, color reduction, clipping invisible image areas, removing alternate images, simplifying color profiles, JPEG 2000, and lossless mode
- **Fonts**: subsetting, merging duplicates, and unembedding standard fonts and their look-alikes
- **Content**: flattening annotations, form fields, or links
- **Cleanup**: removing thumbnails, application data, article threads, web capture information, the structure tree, or output intents
- **Rasterize**: replacing pages with images, for image-only scans; skipped when the document has selectable text
- **Output**: Preserve PDF/A, and Brotli compression for PDF 2.0 readers that support it

## Use Cases

- Bringing a 50 MB report under an email attachment limit
- Getting a scan under a portal's strict upload limit with a target file size
- Optimizing marketing PDFs for faster website downloads
- Archiving large document sets where storage costs matter
- Reducing mobile data usage when sharing PDFs over messaging apps

## Tips

- Start with Medium. If the result is still too large, set a target file size or step up to High.
- For a scan with no text layer, turn on Rasterize pages under Custom Settings.
- Convert to grayscale, under Custom Settings, can cut file size for color-heavy documents.

## Related Tools

- [Linearize PDF](./linearize-pdf): optimize the compressed PDF for fast web viewing
- [Rasterize PDF](./rasterize-pdf): convert pages to images at a specific DPI, including pages with text
- [Repair PDF](./repair-pdf): fix a PDF that broke during compression elsewhere
- [Remove Metadata](./remove-metadata): strip hidden data for privacy
