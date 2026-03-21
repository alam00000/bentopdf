---
title: PDF to Text
description: Extract plain text content from PDF files. Supports batch extraction of multiple PDFs with output as TXT files.
---

# PDF to Text

Extracts all text content from PDF files and saves it as plain `.txt` files. Supports batch processing -- upload multiple PDFs and get each one's text extracted in a single operation. Powered by PyMuPDF.

## How It Works

1. Upload one or more PDFs by clicking the drop zone or dragging files onto it. Manage your file list with Add More and Clear buttons.
2. Click **Extract** to start processing.
3. A single file downloads as `filename.txt`. Multiple files produce a `pdf-to-text.zip` archive.

## Options

This tool has no configurable options. All text content is extracted from every page in reading order.

## Output Format

- **Single file**: `filename.txt`
- **Multiple files**: `pdf-to-text.zip` containing one `.txt` per input PDF.

## Use Cases

- Extracting body text from PDF reports for full-text search indexing.
- Converting PDF ebooks or articles to plain text for reading on e-ink devices.
- Pulling text from contracts or legal documents for keyword analysis.
- Stripping formatting from PDFs to get clean text for data processing scripts.
- Preparing text corpus from PDF archives for natural language processing.

## Tips

- Scanned PDFs (image-only) will produce empty text files because there is no text layer to extract. Run scanned documents through OCR first.
- The output preserves the reading order as interpreted by PyMuPDF, which generally follows left-to-right, top-to-bottom. Multi-column layouts may produce interleaved text.
- For structured output with headings and formatting, try [PDF to Markdown](./pdf-to-markdown). For AI-ready structured JSON, use [Prepare PDF for AI](./prepare-pdf-for-ai).

## Related Tools

- [PDF to Markdown](./pdf-to-markdown)
- [Prepare PDF for AI](./prepare-pdf-for-ai)
- [PDF to Word](./pdf-to-docx)
