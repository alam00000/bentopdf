---
title: Excel to PDF
description: Convert Excel spreadsheets (XLS, XLSX), ODS, and CSV files to PDF with formatting preserved.
---

# Excel to PDF

Convert spreadsheet files to PDF. The tool handles modern Excel files, legacy XLS format, OpenDocument Spreadsheets, and even CSV -- all rendered through a browser-based LibreOffice engine that preserves cell formatting, formulas (as computed values), charts, and multi-sheet layouts.

## Supported Formats

| Format                   | Extensions |
| :----------------------- | :--------- |
| Excel (modern)           | `.xlsx`    |
| Excel (legacy)           | `.xls`     |
| OpenDocument Spreadsheet | `.ods`     |
| CSV                      | `.csv`     |

## How It Works

1. Click the upload area or drag and drop your spreadsheet files.
2. Review the file list. Add more files or remove unwanted ones.
3. Click **Convert to PDF**. The LibreOffice engine initializes on first use, then processes each file.
4. A single file downloads directly as a PDF. Multiple files are delivered as `excel-converted.zip`.

## Options

This tool has no additional configuration. The LibreOffice engine determines page layout, scaling, and print area based on the spreadsheet's built-in settings.

## Output

| Input Count | Output                                                          |
| :---------- | :-------------------------------------------------------------- |
| 1 file      | Single PDF download (original filename with `.pdf` extension)   |
| 2+ files    | ZIP archive (`excel-converted.zip`) containing one PDF per file |

## Use Cases

- Converting financial reports or budgets from Excel to PDF for distribution
- Creating print-ready PDFs from inventory or product catalog spreadsheets
- Sharing data analysis results with stakeholders who do not have Excel installed
- Archiving quarterly reports in a non-editable format
- Converting ODS files from LibreOffice Calc to PDF

## Tips

- Charts embedded in the spreadsheet are rendered in the PDF. Make sure they look correct in the source file before converting.
- If your spreadsheet has multiple sheets, all sheets are included in the PDF output.
- For simple CSV data without formatting, the [CSV to PDF](./csv-to-pdf) tool provides a more lightweight conversion. Use Excel to PDF when you need formatting, charts, or multiple sheets preserved.

## Related Tools

- [CSV to PDF](./csv-to-pdf)
- [Word to PDF](./word-to-pdf)
- [PowerPoint to PDF](./powerpoint-to-pdf)
