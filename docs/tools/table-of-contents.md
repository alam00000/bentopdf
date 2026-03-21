---
title: Table of Contents
description: Generate a formatted table of contents page from your PDF's existing bookmarks.
---

# Table of Contents

This tool reads the bookmarks (outlines) in your PDF and generates a formatted table of contents page that gets prepended to the document. If your PDF already has bookmarks but lacks a visible TOC page, this tool creates one automatically.

## How It Works

1. Upload a PDF that contains bookmarks.
2. Customize the TOC title, font size, and font family.
3. Optionally check **Add bookmark for TOC page** to include the TOC itself in the bookmark tree.
4. Click **Generate Table of Contents** to process the file.
5. The updated PDF downloads automatically with the TOC page inserted at the beginning.

## Options

- **TOC Title** -- The heading displayed at the top of the generated page. Defaults to "Table of Contents".
- **Font Size** -- Choose from 10pt to 72pt. The default is 12pt.
- **Font Family** -- Select from Times Roman, Helvetica, or Courier variants (regular, bold, italic, bold italic). Defaults to Helvetica.
- **Add bookmark for TOC page** -- When checked, a bookmark entry for the TOC page itself is added to the PDF's outline tree.

## Features

- Reads the full bookmark hierarchy from the PDF
- Generates a cleanly formatted TOC page with page number references
- Supports nested bookmark levels with indentation
- Choice of 12 built-in PDF fonts
- Optional self-referencing bookmark for the TOC page

## Use Cases

- Adding a printable table of contents to e-books or reports that only have digital bookmarks
- Creating a TOC for a merged document after combining multiple PDFs
- Generating a reference page for long technical manuals
- Preparing documents for print where a visible TOC is expected

## Tips

- If your PDF has no bookmarks, use the [Edit Bookmarks](./bookmark) tool first to create them, then come back here to generate the TOC.
- For large documents, a bigger font size like 14pt or 16pt improves readability.

## Related Tools

- [Edit Bookmarks](./bookmark)
- [Page Numbers](./page-numbers)
- [Header & Footer](./header-footer)
