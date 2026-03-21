---
title: PDF to CSV
description: Extract tables from PDF documents and export them as a single CSV file. Handles multi-page PDFs with automatic table detection.
---

# PDF to CSV

Extracts tables from a PDF and exports them as a CSV file. The tool scans every page for tabular data using PyMuPDF's table detection engine, then writes all found rows into a single comma-separated output.

## How It Works

1. Upload a PDF by clicking the drop zone or dragging a file onto it.
2. Click **Convert** to start table extraction.
3. The tool scans each page and identifies tables automatically.
4. A `.csv` file downloads with all extracted table data.

Tables from different pages are separated by blank rows in the output. Cells containing commas, quotes, or newlines are properly escaped following RFC 4180.

## Options

This tool has no configurable options. All tables found in the document are extracted and combined into a single CSV.

## Output Format

- A single `filename.csv` file containing all detected tables.

## Use Cases

- Pulling financial data from PDF bank statements or invoices into a spreadsheet.
- Extracting pricing tables from vendor quotes for comparison.
- Converting tabular research data from PDF papers into a format suitable for analysis tools.
- Migrating data from legacy PDF reports into databases.

## Tips

- If no tables are found, the tool displays a "No Tables Found" message. This typically means the PDF uses text layout that looks tabular but isn't structured as an actual table.
- For more control over individual tables, use [Extract Tables](./extract-tables) which lets you choose between CSV, JSON, and Markdown output formats.
- If you need the data in Excel format with separate sheets per table, use [PDF to Excel](./pdf-to-excel).

## Related Tools

- [PDF to Excel](./pdf-to-excel)
- [Extract Tables](./extract-tables)
- [PDF to Text](./pdf-to-text)
