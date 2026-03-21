---
title: Page Dimensions
description: Analyze PDF page sizes, orientations, aspect ratios, and rotation. Detect mixed-size documents and export data to CSV.
---

# Page Dimensions

A diagnostic tool that reads every page in your PDF and reports its exact dimensions, orientation, standard size name, aspect ratio, area, and rotation. Useful for catching mixed-size pages before printing or for documenting the properties of a PDF you received.

## How It Works

1. Upload a PDF file. Analysis starts automatically -- no button to press.
2. A summary panel shows total pages, number of unique page sizes, and whether the document has mixed sizes.
3. Browse the full results table with per-page details.
4. Switch display units between Points, Inches, Millimeters, or Pixels.
5. Click **Export to CSV** to save the data.

## Reported Fields

| Column        | Description                                 |
| ------------- | ------------------------------------------- |
| Page #        | Sequential page number                      |
| Dimensions    | Width x Height in the selected unit         |
| Standard Size | Matched name (A4, Letter, etc.) or "Custom" |
| Orientation   | Portrait or Landscape                       |
| Aspect Ratio  | Width-to-height ratio as a decimal          |
| Area          | Page area in the selected unit squared      |
| Rotation      | Page rotation in degrees                    |

## Features

- Automatic detection of standard paper sizes (A3, A4, A5, Letter, Legal, Tabloid, and more)
- Mixed-size document warning with a breakdown of which sizes appear and how many pages use each
- Unit conversion between points, inches, millimeters, and pixels (at 96 PPI)
- CSV export for use in spreadsheets or documentation systems

## Use Cases

- Verifying all pages are A4 before submitting a document to a print shop
- Diagnosing why a merged PDF prints with unexpected margins on certain pages
- Documenting the page layout of a large PDF archive for metadata records
- Identifying rotated pages that need correction

## Tips

- If the summary shows "Mixed Sizes," use the Fix Page Size tool to standardize before printing.
- The rotation field helps identify pages that display correctly but have a non-zero rotation attribute, which can cause issues in some workflows.

## Related Tools

- [Fix Page Size](./fix-page-size) -- standardize pages after identifying mixed sizes
- [Compress PDF](./compress-pdf) -- optimize the PDF after fixing page issues
- [Rotate PDF](./rotate-pdf) -- correct rotated pages
