---
title: Alternate & Mix Pages
description: Merge PDFs by interleaving pages from each file in alternating order, with bookmark preservation.
---

# Alternate & Mix Pages

Interleave pages from multiple PDF files so that pages alternate between documents. This is the tool you reach for when a standard merge would just append files end-to-end but you need page 1 of File A, then page 1 of File B, then page 2 of File A, and so on.

## How It Works

1. Upload at least two PDF files using the drop zone.
2. The tool displays each file with its page count and file size.
3. Drag the grip handles to reorder which file's pages come first in the interleaving sequence.
4. Click **Mix Pages** to produce the interleaved output.
5. The result downloads as `alternated-mixed.pdf`.

## Features

- Interleaves pages across any number of PDFs (minimum two)
- Drag-and-drop reordering of files to control interleaving priority
- Preserves bookmarks from the source documents
- Displays page count and file size for each uploaded file
- Processes via a dedicated web worker for responsive UI

## Use Cases

- Reassembling double-sided scans where odd and even pages were scanned separately
- Combining question sheets with answer keys so each question is followed by its answer
- Merging two-language documents page by page (e.g., English on one side, translation on the next)
- Interleaving front and back scans from a single-sided scanner

## Tips

- If your source PDFs have different page counts, the shorter document's pages will run out first and remaining pages from the longer document will appear at the end.
- The file order matters -- the first file in the list contributes the first page of the output. Drag to rearrange if needed.

## Related Tools

- [Merge PDF](./merge-pdf)
- [Organize & Duplicate](./organize-pdf)
- [Split PDF](./split-pdf)
