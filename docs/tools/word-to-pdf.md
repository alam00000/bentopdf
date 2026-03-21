---
title: Word to PDF
description: Convert Word documents (DOC, DOCX), ODT, and RTF files to PDF in your browser with full formatting preservation.
---

# Word to PDF

Convert Microsoft Word documents and compatible formats to PDF. The tool uses a browser-based LibreOffice engine that handles DOC, DOCX, ODT, and RTF files, preserving formatting, tables, images, headers, footers, and styles in the output.

## Supported Formats

| Format            | Extensions |
| :---------------- | :--------- |
| Word (modern)     | `.docx`    |
| Word (legacy)     | `.doc`     |
| OpenDocument Text | `.odt`     |
| Rich Text Format  | `.rtf`     |

## How It Works

1. Click the upload area or drag and drop your Word documents. Multiple files can be selected at once.
2. Review and manage the file list.
3. Click **Convert to PDF**. The LibreOffice engine loads on first use (a progress indicator shows the initialization status), then each file is converted.
4. A single file downloads directly as a PDF. Multiple files are packaged into `word-converted.zip`.

## Options

This tool has no additional settings. The LibreOffice engine produces the output using its default PDF export profile.

## Output

| Input Count | Output                                                         |
| :---------- | :------------------------------------------------------------- |
| 1 file      | Single PDF download (original filename with `.pdf` extension)  |
| 2+ files    | ZIP archive (`word-converted.zip`) containing one PDF per file |

## Use Cases

- Converting a resume or cover letter from DOCX to PDF before submitting a job application
- Batch converting a set of contracts or proposals to PDF for a client delivery
- Turning legacy `.doc` files into modern PDFs for long-term archival
- Converting collaborative documents from Google Docs (exported as DOCX) to PDF
- Producing print-ready PDFs from Word templates used by automated document generation

## Tips

- The LibreOffice engine is downloaded once per session and cached. Expect a few seconds of loading time on the first conversion, with subsequent conversions being much faster.
- Complex formatting (macros, ActiveX controls, advanced SmartArt) may not convert perfectly. Standard document elements -- text, tables, images, headers, footnotes -- convert reliably.
- Since this tool also accepts ODT and RTF, you can use it as a one-stop converter for all word processing formats.

## Related Tools

- [ODT to PDF](./odt-to-pdf)
- [RTF to PDF](./rtf-to-pdf)
- [Excel to PDF](./excel-to-pdf)
- [PowerPoint to PDF](./powerpoint-to-pdf)
