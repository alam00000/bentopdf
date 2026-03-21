---
title: RTF to PDF
description: Convert Rich Text Format (RTF) files to PDF in your browser using a LibreOffice-powered engine.
---

# RTF to PDF

Convert Rich Text Format documents to PDF. RTF is a cross-platform document format supported by virtually every word processor. This tool uses a browser-based LibreOffice engine to render RTF files with their formatting intact -- bold, italic, tables, and embedded images all carry over to the PDF.

## Supported Formats

| Format | Extensions | MIME Types                    |
| :----- | :--------- | :---------------------------- |
| RTF    | `.rtf`     | `text/rtf`, `application/rtf` |

## How It Works

1. Click the upload area or drag and drop one or more RTF files.
2. Review the file list. Add more or remove files as needed.
3. Click **Convert to PDF**. The LibreOffice engine initializes on first use, then processes each file.
4. A single file downloads directly as a PDF. Multiple files are delivered as `rtf-converted.zip`.

## Options

This tool has no additional settings. The conversion preserves the original RTF formatting.

## Output

| Input Count | Output                                                        |
| :---------- | :------------------------------------------------------------ |
| 1 file      | Single PDF download (e.g., `letter.pdf`)                      |
| 2+ files    | ZIP archive (`rtf-converted.zip`) containing one PDF per file |

## Use Cases

- Converting legacy RTF documents from older word processors to modern PDFs
- Turning RTF email templates into PDF previews
- Processing RTF output from legal or medical software systems
- Batch converting RTF files from a document management system to PDF for archival

## Tips

- The LibreOffice engine is loaded once and cached. The first conversion in a session takes a few extra seconds; subsequent ones are faster.
- RTF files with embedded OLE objects may not render all objects perfectly. Plain text, images, and standard formatting convert reliably.
- If your RTF files were created by Microsoft Word, you can also convert them directly with the [Word to PDF](./word-to-pdf) tool, which accepts RTF alongside DOC and DOCX.

## Related Tools

- [Word to PDF](./word-to-pdf)
- [ODT to PDF](./odt-to-pdf)
- [Text to PDF](./txt-to-pdf)
