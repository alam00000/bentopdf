---
title: Split PDF
description: Split a PDF into smaller files by page range, visual selection, bookmarks, even/odd pages, or fixed intervals.
---

# Split PDF

Break a PDF into smaller documents using one of six splitting modes. From simple page ranges to bookmark-based splitting, this tool handles every scenario for dividing a document.

## How It Works

1. Upload a single PDF file.
2. Choose a split mode from the dropdown.
3. Configure the mode-specific options (page ranges, selections, etc.).
4. Click the process button.
5. The result downloads as a single PDF or a ZIP archive depending on the mode and settings.

## Split Modes

| Mode              | Description                                                                                                             |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Range**         | Enter page ranges like `1-3, 5, 8-10`. Multiple ranges produce separate PDFs in a ZIP. A single range produces one PDF. |
| **Visual Select** | Browse page thumbnails and click to select the pages you want. Selected pages are extracted into a new PDF.             |
| **Even / Odd**    | Extract only even-numbered or odd-numbered pages.                                                                       |
| **All Pages**     | Split every page into its own individual PDF file, downloaded as a ZIP.                                                 |
| **Bookmarks**     | Split at bookmark boundaries. Choose the bookmark level to control where splits occur.                                  |
| **Every N Pages** | Split into chunks of N pages each (e.g., every 5 pages). The last chunk may have fewer pages.                           |

## Features

- Six distinct splitting modes covering virtually every use case
- Visual page selector with lazy-loaded thumbnails
- Bookmark-aware splitting with level filtering
- ZIP output option for range and visual modes
- Handles page ranges with mixed syntax (`1-3, 5, 8-10`)
- Warning when N-page splits result in uneven chunks

## Use Cases

- Extracting a specific chapter or section from a large document
- Separating odd and even pages for double-sided printing workflows
- Breaking a book PDF into individual chapter files at bookmark boundaries
- Isolating specific pages (like a signature page) from a contract
- Splitting a compiled report into per-section files for distribution

## Tips

- Multiple page ranges separated by commas (e.g., `1-5, 10-15, 20-25`) produce separate PDFs, one per range, bundled in a ZIP.
- The bookmark split mode requires the PDF to actually contain bookmarks. If none are found, you will get an error message.
- The "Download as ZIP" checkbox in Range and Visual modes lets you get individual PDFs per page instead of a combined file.

## Related Tools

- [Merge PDF](./merge-pdf)
- [Extract Pages](./extract-pages)
- [Delete Pages](./delete-pages)
- [PDF Multi Tool](./pdf-multi-tool)
