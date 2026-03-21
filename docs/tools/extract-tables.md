---
title: Extract Tables
description: Detect and extract tables from PDF documents. Export as CSV, JSON, or Markdown with per-table granularity.
---

# Extract Tables

Detects all tables in a PDF and lets you export them in your choice of format: CSV, JSON, or Markdown. Each table is extracted individually with page and position metadata. Powered by PyMuPDF's table detection engine.

## How It Works

1. Upload a PDF by clicking the drop zone or dragging a file onto it.
2. Select your preferred **export format** -- CSV, JSON, or Markdown.
3. Click **Extract** to start processing.
4. If one table is found, it downloads as a single file. Multiple tables produce a ZIP archive with one file per table.

## Options

- **Export Format** -- choose between:
  - **CSV** -- comma-separated values with proper quoting for fields containing commas, quotes, or newlines. Suitable for spreadsheets and databases.
  - **JSON** -- array-of-arrays structure, pretty-printed with 2-space indentation. Suitable for programmatic consumption.
  - **Markdown** -- pipe-delimited table format rendered by PyMuPDF. Suitable for documentation and README files.

## Output Format

- **Single table**: `filename_table.csv` (or `.json` / `.md`)
- **Multiple tables**: `filename_tables.zip` containing files named `table_1_page3.csv`, `table_2_page5.csv`, etc.

## Use Cases

- Extracting specific tables from lengthy PDF reports without pulling the entire document's data.
- Getting tables in Markdown format for pasting directly into GitHub issues, wikis, or documentation.
- Pulling structured JSON data from PDF tables for API integrations or scripts.
- Comparing tables across different PDF versions by exporting both to CSV and diffing.

## Tips

- This tool gives you per-table control. If you just want all tables dumped into a single CSV, use [PDF to CSV](./pdf-to-csv). For a full Excel workbook, use [PDF to Excel](./pdf-to-excel).
- Tables that span multiple pages may be detected as separate tables per page. You may need to concatenate them manually.
- If no tables are detected, the PDF might be a scanned image. Run it through OCR first to add a text layer.

## Related Tools

- [PDF to CSV](./pdf-to-csv)
- [PDF to Excel](./pdf-to-excel)
- [PDF to Text](./pdf-to-text)
