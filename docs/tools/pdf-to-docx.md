---
title: PDF to Word
description: Convert PDF files to editable Word (DOCX) documents. Supports batch conversion of multiple PDFs at once.
---

# PDF to Word

Converts PDF files to editable Word (`.docx`) documents. The tool uses PyMuPDF to reconstruct the document content, preserving text, basic formatting, and layout. Supports single and batch conversion.

## How It Works

1. Upload one or more PDFs by clicking the drop zone or dragging files onto it. You can add more files or remove individual ones from the list.
2. Click **Convert** to start processing.
3. A single file downloads as `filename.docx`. Multiple files are packaged into `converted-documents.zip`.

## Options

This tool has no configurable options. Each PDF is converted to DOCX using PyMuPDF's built-in conversion engine.

## Output Format

- **Single file**: `filename.docx`
- **Multiple files**: `converted-documents.zip` containing one `.docx` per input PDF.

## Use Cases

- Editing text in a PDF that you received and need to modify.
- Converting archived PDF reports into a format that colleagues can edit in Microsoft Word or Google Docs.
- Pulling content from PDF contracts or proposals into Word for redlining.
- Migrating legacy PDF documentation into an editable format.

## Tips

- Complex layouts with multi-column text, embedded forms, or heavy graphics may not convert perfectly. Review the output and adjust formatting in your word processor.
- Scanned PDFs (image-only) will produce empty or minimal DOCX files. Run them through OCR first to add a text layer.
- Batch mode is efficient for converting entire folders of PDFs -- upload them all at once.

## Related Tools

- [PDF to Text](./pdf-to-text)
- [PDF to Markdown](./pdf-to-markdown)
- [PDF Workflow Builder](./pdf-workflow)
