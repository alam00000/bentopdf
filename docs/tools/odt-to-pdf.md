---
title: ODT to PDF
description: Convert OpenDocument Text (ODT) files to PDF format in your browser using a LibreOffice-powered engine.
---

# ODT to PDF

Convert OpenDocument Text files to PDF. ODT is the native format of LibreOffice Writer, Apache OpenOffice, and other open-source word processors. This tool uses a browser-based LibreOffice engine to produce accurate conversions that preserve formatting, tables, images, and styles.

## Supported Formats

| Format            | Extensions |
| :---------------- | :--------- |
| OpenDocument Text | `.odt`     |

## How It Works

1. Click the upload area or drag and drop one or more ODT files.
2. Review the file list. Add more files or remove unwanted ones.
3. Click **Convert to PDF**. The LibreOffice engine initializes (a progress indicator shows loading status), then each file is converted.
4. A single file downloads directly as a PDF. Multiple files are packaged into `odt-converted.zip`.

## Options

This tool has no additional configuration. The conversion preserves the original document's formatting as closely as possible.

## Output

| Input Count | Output                                                        |
| :---------- | :------------------------------------------------------------ |
| 1 file      | Single PDF download (e.g., `document.pdf`)                    |
| 2+ files    | ZIP archive (`odt-converted.zip`) containing one PDF per file |

## Use Cases

- Converting LibreOffice Writer documents to PDF for sharing with Microsoft Office users
- Producing print-ready PDFs from academic papers written in OpenDocument format
- Batch converting a folder of ODT templates into PDFs for distribution
- Generating PDFs from ODT files created by automated document generation systems

## Tips

- The LibreOffice engine loads on first use and is cached for subsequent conversions. The initial load takes a few seconds; after that, conversions are fast.
- Complex documents with embedded OLE objects or unusual fonts may render slightly differently than desktop LibreOffice. Test with a sample before batch converting.
- For Word documents (`.doc`, `.docx`), use the [Word to PDF](./word-to-pdf) tool instead, which also uses the LibreOffice engine but accepts Microsoft formats directly.

## Related Tools

- [Word to PDF](./word-to-pdf)
- [RTF to PDF](./rtf-to-pdf)
- [Text to PDF](./txt-to-pdf)
