---
title: Extract Pages
description: Save a specific range of pages from a PDF as a new document.
---

# Extract Pages

Pull a set of pages out of a PDF and save them as a new file. Specify exactly which pages you want using range syntax, and the tool creates a clean PDF containing only those pages.

## How It Works

1. Upload a PDF file. The tool displays the file name, size, and total page count.
2. Enter the pages you want to extract using range syntax (e.g., `1-5`, `3, 7, 10-12`).
3. Optionally choose to download each range as a separate PDF in a ZIP archive.
4. Click the process button. The extracted pages download as a new PDF (or ZIP).

## Features

- Flexible page range syntax: individual pages, ranges, or comma-separated combinations
- Displays total page count after upload for easy reference
- Option to output as a single combined PDF or separate files in a ZIP
- Preserves original page content and formatting

## Use Cases

- Pulling the executive summary (first few pages) out of a lengthy report
- Extracting a single chapter from a textbook PDF
- Saving specific pages from a form packet as standalone documents
- Creating a sample document from selected pages of a larger file

## Tips

- Page numbers are 1-indexed. Use `1` for the first page, not `0`.
- For removing pages instead of extracting them, use [Delete Pages](./delete-pages) -- it is the inverse operation.
- If you need visual page selection with thumbnails, use [Split PDF](./split-pdf) in Visual Select mode.

## Related Tools

- [Split PDF](./split-pdf)
- [Delete Pages](./delete-pages)
- [Merge PDF](./merge-pdf)
