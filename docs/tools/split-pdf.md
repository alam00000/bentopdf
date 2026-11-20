---
title: Split PDF
description: Split a PDF into smaller files by page range, visual selection, bookmarks, even/odd pages, fixed intervals, or a maximum file size.
---

# Split PDF

Break a PDF into smaller documents using one of seven splitting modes. From simple page ranges to bookmark-based splitting, this tool handles every scenario for dividing a document.

## How It Works

1. Upload a single PDF file.
2. Choose a split mode from the dropdown.
3. Configure the mode-specific options (page ranges, selections, etc.).
4. Click the process button.
5. The result downloads as a single PDF or a ZIP archive depending on the mode and settings.

## Split Modes

| Mode                  | Description                                                                                                                                                                              |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Range**             | Enter page ranges like `1-3, 5, 8-10`. Multiple ranges produce separate PDFs in a ZIP. A single range produces one PDF.                                                                  |
| **Visual Select**     | Browse page thumbnails and click to select the pages you want. Selected pages are extracted into a new PDF.                                                                              |
| **Even / Odd**        | Extract only even-numbered or odd-numbered pages.                                                                                                                                        |
| **All Pages**         | Split every page into its own individual PDF file, downloaded as a ZIP.                                                                                                                  |
| **Bookmarks**         | Split at bookmark boundaries. Choose the bookmark level to control where splits occur.                                                                                                   |
| **Every N Pages**     | Split into chunks of N pages each (e.g., every 5 pages). The last chunk may have fewer pages.                                                                                            |
| **Maximum File Size** | Split into the fewest contiguous page ranges that each stay under a size limit in MB. Pages are never split; if one page exceeds the limit, the operation stops without producing files. |

## Features

- Seven distinct splitting modes covering virtually every use case
- Size-capped splitting that packs whole pages into the fewest files under a chosen MB limit
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
- Keeping each output under an email attachment or upload size limit

## Tips

- Multiple page ranges separated by commas (e.g., `1-5, 10-15, 20-25`) produce separate PDFs, one per range, bundled in a ZIP.
- The bookmark split mode requires the PDF to actually contain bookmarks. If none are found, you will get an error message.
- In Range and Visual modes, the **Output** option lets you choose **Single combined PDF** or **One PDF per range**.
- The maximum file size limit is 1024-based (1 MB = 1,024 × 1,024 bytes), matching the PDF Multi Tool.

## Related Tools

- [Merge PDF](./merge-pdf)
- [Extract Pages](./extract-pages)
- [Delete Pages](./delete-pages)
- [PDF Multi Tool](./pdf-multi-tool)
