---
title: Delete Pages
description: Remove specific pages from a PDF by page number, range, or visual thumbnail selection.
---

# Delete Pages

Remove unwanted pages from a PDF document. Specify pages to delete by typing page numbers or ranges, or click directly on page thumbnails to mark them for removal.

## How It Works

1. Upload a PDF file. The tool renders thumbnail previews of every page.
2. Enter the pages to delete in the text field using range syntax (e.g., `2, 5-8`), or click thumbnails to toggle them.
3. Marked pages are visually highlighted so you can confirm your selection.
4. Click the process button. A new PDF is created with the selected pages removed.

## Features

- Text-based page selection with range syntax (`2, 5-8, 12`)
- Visual thumbnail grid for click-to-select deletion
- Real-time preview highlighting of pages marked for deletion
- Input validation against the actual page count
- Keeps all non-deleted pages in their original order

## Use Cases

- Removing blank or filler pages from a scanned document
- Stripping cover pages or appendices before sharing a document
- Cleaning up draft pages that were accidentally left in a final PDF
- Removing pages with sensitive information before distribution

## Tips

- Deleting pages does not affect the remaining pages' content or formatting. The output is a faithful copy of the original minus the removed pages.
- If you want to keep only specific pages rather than removing specific ones, [Extract Pages](./extract-pages) is the better fit.
- The thumbnail view loads lazily, so large documents stay responsive.

## Related Tools

- [Extract Pages](./extract-pages)
- [Organize & Duplicate](./organize-pdf)
- [Split PDF](./split-pdf)
