---
title: Bates Numbering
description: Apply Bates numbers to one or multiple PDFs with customizable templates, padding, fonts, and positioning.
---

# Bates Numbering

Bates numbering stamps sequential identifiers on every page of your PDFs. It is the standard method for labeling documents in legal proceedings, audits, and compliance workflows. This tool supports multiple files, customizable templates, and produces individually numbered PDFs or a single ZIP archive.

## How It Works

1. Upload one or more PDF files. You can drag multiple files at once.
2. Choose a style preset or create a custom template.
3. Configure the position, font, size, color, and starting numbers.
4. Click **Apply Bates Numbers** to process.
5. A single file downloads directly. Multiple files download as a ZIP archive.

## Options

- **Style Preset** -- Choose from built-in formats:
  - Exhibit + Case + Bates + Page (e.g., "Exhibit 1 Case XYZ 000001 Page 1")
  - Exhibit + Case + Bates (no page number)
  - Case + Bates
  - Bates Number Only (e.g., "000001")
  - Custom (write your own template)
- **Customize Style** -- A template string using placeholders: `[BATES]`, `[PAGE]`, `[FILE]`, `[FILENAME]`.
- **Bates Padding** -- Number of digits (3 to 6) for zero-padded Bates numbers. Only visible in custom mode.
- **Position** -- Header or Footer, Left, Center, or Right.
- **Bates Starts From** -- The first Bates number. Defaults to 1. Numbering continues across files.
- **File Counter Starts From** -- The starting number for the `[FILE]` placeholder.
- **Font** -- Helvetica, Times New Roman, or Courier.
- **Font Size** -- Size of the stamped text.
- **Color** -- Color picker for the Bates number text.

## Features

- Live preview showing how Bates numbers will appear across all uploaded files
- Multiple file support with continuous numbering across documents
- Drag-and-drop file reordering to control the numbering sequence
- Six position options (header/footer, left/center/right)
- Adaptive margin calculation that respects different page sizes
- ZIP output for multi-file batches
- Template placeholders for maximum flexibility

## Use Cases

- Stamping discovery documents for litigation with sequential exhibit numbers
- Numbering audit evidence packages that span dozens of files
- Applying regulatory reference numbers to compliance documentation
- Labeling patent application exhibits with case-specific identifiers

## Tips

- Drag files in the file list to reorder them before processing. The Bates numbering sequence follows this order.
- Use the `[FILENAME]` placeholder to include the original file name in the stamp, which helps trace pages back to source documents.
- The preview box updates in real time as you change settings, so you can verify the format before processing.

## Related Tools

- [Page Numbers](./page-numbers)
- [Add Page Labels](./add-page-labels)
- [Header & Footer](./header-footer)
