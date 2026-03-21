---
title: OCR PDF
description: Make scanned PDFs searchable and copyable using Tesseract OCR with multi-language support and character filtering.
---

# OCR PDF

Turn scanned documents into searchable, copyable PDFs. The tool uses Tesseract OCR to recognize text in images and overlays an invisible text layer on top of the original pages, preserving their visual appearance while making the content fully searchable.

## How It Works

1. Upload a scanned PDF or image-based PDF file.
2. Select one or more languages present in the document from the searchable language list.
3. Optionally adjust advanced settings (resolution, binarization, whitelist).
4. Click **Start OCR** and monitor progress in the real-time progress bar.
5. When complete, review the extracted text, then download the searchable PDF or a plain `.txt` file.

## Features

- Multi-language OCR with a searchable language selector
- Invisible text layer preserves the original document appearance
- Real-time progress bar and log output during processing
- Download results as a searchable PDF or plain text file
- Copy extracted text directly to clipboard
- Three resolution tiers for balancing speed versus accuracy

## Options

| Setting                        | Values                                                                                     | Default | Purpose                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------------------ | ------- | ------------------------------------------------------------------------------- |
| **Resolution**                 | Standard (192 DPI), High (288 DPI), Ultra (384 DPI)                                        | High    | Higher resolution improves accuracy on small text but takes longer              |
| **Binarize Image**             | On / Off                                                                                   | Off     | Enhances contrast for clean scans by converting to black and white              |
| **Character Whitelist Preset** | None, Alphanumeric, Numbers + Currency, Letters Only, Numbers Only, Invoice, Forms, Custom | None    | Restricts recognized characters to improve accuracy for specific document types |
| **Character Whitelist**        | Free text                                                                                  | Empty   | Manual character set when preset is set to Custom                               |

## Use Cases

- Making scanned contracts and invoices searchable so you can Ctrl+F through them
- Extracting text from photographed documents or old paper records
- Processing receipts with the Invoice preset to accurately capture dollar amounts and dates
- Creating accessible PDFs from image-only scans for compliance requirements
- Batch-extracting text content from scanned books or manuals

## Tips

- Select multiple languages if your document contains mixed-language content (e.g., English headers with Japanese body text).
- Use the binarize option for documents with faded or low-contrast text -- it can significantly improve recognition accuracy.
- The Invoice and Forms whitelist presets dramatically reduce false positives on structured documents by ignoring irrelevant character shapes.

## Related Tools

- [Extract Tables](./extract-tables)
- [Merge PDF](./merge-pdf)
- [Compress PDF](./compress-pdf)
