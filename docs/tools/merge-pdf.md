---
title: Merge PDF
description: Combine multiple PDF files into one document with drag-and-drop reordering and page-level control.
---

# Merge PDF

Combine multiple PDF files into a single document. You can merge entire files in a specific order, or switch to Page Mode for granular control over individual pages from every uploaded PDF.

## How It Works

1. Upload two or more PDF files by clicking the drop zone or dragging them in.
2. Choose between **File Mode** and **Page Mode** using the toggle at the top.
3. In File Mode, drag files to reorder them and optionally specify page ranges (e.g., `1-3, 5`) for each file. Leave the range blank to include all pages.
4. In Page Mode, drag and drop individual page thumbnails to build your exact page sequence.
5. Click **Merge PDFs** to combine everything into one file. The merged PDF downloads automatically.

## Features

- Two merge modes: File Mode for quick whole-file combining, Page Mode for per-page control
- Drag-and-drop reordering in both modes with smooth animations
- Page range syntax (e.g., `1-3, 5, 8-10`) lets you cherry-pick pages without switching to Page Mode
- Lazy-loaded page thumbnails keep the UI responsive even with large documents
- No limit on number of files or total page count
- Preserves original PDF quality with no re-encoding

## Options

| Option          | Description                                                                             |
| --------------- | --------------------------------------------------------------------------------------- |
| **File Mode**   | Merge entire files in a custom order, with optional page range filters per file         |
| **Page Mode**   | Visual grid of all pages from all files -- drag thumbnails to build your exact sequence |
| **Pages input** | Per-file text field accepting ranges like `1-3, 5` to include only specific pages       |

## Use Cases

- Combining separate chapter PDFs into a single book or report
- Merging a cover letter and resume into one application document
- Pulling specific pages from multiple source documents into a consolidated file
- Assembling scanned receipts or invoices into one archive PDF
- Creating a presentation handout from slides across multiple decks

## Tips

- Use Page Mode when you need to interleave pages from different files rather than appending one file after another.
- You can add more files after the initial upload using the **Add More Files** button without losing your current arrangement.
- Page ranges are 1-indexed, so `1` refers to the first page of that file.

## Related Tools

- [Split PDF](./split-pdf)
- [Organize & Duplicate](./organize-pdf)
- [Alternate & Mix Pages](./alternate-merge)
- [Delete Pages](./delete-pages)
