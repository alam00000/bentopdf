---
title: JSON to PDF
description: Reconstruct PDF files from BentoPDF's JSON format. Convert JSON exports back to their original PDF documents.
---

# JSON to PDF

Reconstruct PDF documents from JSON files that were previously created by BentoPDF's **PDF to JSON** tool. This is a round-trip conversion tool -- it takes the structured JSON representation of a PDF and rebuilds the original document.

::: warning
This tool only accepts JSON files produced by BentoPDF's PDF to JSON converter. Standard JSON files from APIs, databases, or other tools are not supported.
:::

## Supported Formats

| Input   | Description                                        |
| :------ | :------------------------------------------------- |
| `.json` | JSON files exported by BentoPDF's PDF to JSON tool |

## How It Works

1. Click the upload area or drag and drop one or more JSON files.
2. The file list shows each selected file with its size.
3. Click **Convert to PDF**. The tool processes all files using a Web Worker and the CPDF engine.
4. The output downloads as `jsons-to-pdf.zip` containing one PDF per input JSON file.

The conversion runs in a background Web Worker, so the UI remains responsive even with large files.

## Options

This tool has no configurable options. The JSON structure fully determines the output PDF.

## Output

When converting multiple JSON files, results are delivered as a ZIP archive. Each PDF is named after its source JSON file (e.g., `report.json` becomes `report.pdf`).

## Use Cases

- Restoring PDFs from a JSON-based backup or archival pipeline
- Round-tripping a PDF through JSON for inspection and then back to PDF
- Rebuilding documents after programmatic modifications to the JSON structure
- Verifying that a PDF-to-JSON export captured all document content by converting it back

## Tips

- If you need to convert arbitrary JSON data (like API responses or config files) into a formatted PDF, the [Text to PDF](./txt-to-pdf) tool is a better fit. Paste the JSON as text and it will be rendered with proper formatting.
- The CPDF WebAssembly engine must be available for this tool to work. Self-hosted instances need the CPDF WASM files configured.

## Related Tools

- [Text to PDF](./txt-to-pdf)
- [Markdown to PDF](./markdown-to-pdf)
- [CSV to PDF](./csv-to-pdf)
