---
title: PDF to Excel
description: Extract tables from PDF documents into an Excel spreadsheet. Each table gets its own worksheet with page references.
---

# PDF to Excel

Extracts tables from a PDF and saves them as an Excel (`.xlsx`) spreadsheet. Each detected table is placed on its own worksheet, labeled with its table number and source page. Powered by PyMuPDF for table detection and the SheetJS library for Excel generation.

## How It Works

1. Upload a PDF by clicking the drop zone or dragging a file onto it.
2. Click **Convert** to start table extraction.
3. The tool scans every page for tables, then builds an Excel workbook.
4. A `.xlsx` file downloads with one sheet per table.

## Options

This tool has no configurable options. All detected tables are extracted automatically.

## Output Format

- A single `filename.xlsx` file.
- **One table**: a single worksheet named "Table".
- **Multiple tables**: worksheets named "Table 1 (Page 3)", "Table 2 (Page 5)", etc. Sheet names are truncated to 31 characters (the Excel limit).

## Use Cases

- Converting PDF financial reports into editable spreadsheets for further analysis.
- Extracting inventory or order tables from supplier PDFs.
- Pulling structured data from PDF forms or catalogs into Excel for sorting and filtering.
- Archiving tabular PDF data in a format that non-technical colleagues can work with.

## Tips

- If the tool reports "No Tables Found", the PDF likely uses free-flowing text layout rather than structured tables. Try [PDF to Text](./pdf-to-text) to grab the raw content instead.
- For a simpler flat format, use [PDF to CSV](./pdf-to-csv). For per-table downloads in multiple formats, use [Extract Tables](./extract-tables).
- Review the sheet names to identify which page each table came from.

## Related Tools

- [PDF to CSV](./pdf-to-csv)
- [Extract Tables](./extract-tables)
- [PDF to Text](./pdf-to-text)
