---
title: PDF to JSON
description: Convert PDF files to structured JSON format using CPDF. Exports PDF internal structure as machine-readable JSON data.
---

# PDF to JSON

Converts one or more PDF files into JSON format. The tool uses CPDF (Coherent PDF) to serialize the internal structure of each PDF into a machine-readable JSON representation. The output is always delivered as a ZIP archive.

## How It Works

1. Select one or more PDF files using the file picker.
2. Click **Convert** to start processing. The conversion runs in a background web worker.
3. A ZIP archive downloads containing one JSON file for each input PDF.

The status bar shows progress through the conversion and ZIP creation stages.

## Options

This tool has no configurable options. Each PDF is converted to its full JSON representation.

## Output Format

- A `pdfs-to-json.zip` file containing `filename.json` for each input PDF.

The JSON output represents the PDF's internal object structure, including page trees, font references, metadata, and content streams.

## Use Cases

- Inspecting the internal structure of a PDF for debugging or validation.
- Extracting structured metadata and page properties programmatically.
- Feeding PDF structure data into custom processing pipelines.
- Auditing PDF documents for compliance by analyzing their object trees.

## Tips

- This tool outputs the raw PDF object structure, not extracted text content. If you need page text in JSON format, use [Prepare PDF for AI](./prepare-pdf-for-ai) instead.
- For plain text extraction, [PDF to Text](./pdf-to-text) is more straightforward.
- Large PDFs with complex structures produce very large JSON files.

## Related Tools

- [PDF to Text](./pdf-to-text)
- [Prepare PDF for AI](./prepare-pdf-for-ai)
- [Extract Tables](./extract-tables)
