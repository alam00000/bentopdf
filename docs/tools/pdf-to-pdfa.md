---
title: PDF to PDF/A
description: Convert standard PDFs to PDF/A format for long-term archiving. Supports PDF/A-1b, PDF/A-2b, and PDF/A-3b conformance levels.
---

# PDF to PDF/A

PDF/A is an ISO-standardized subset of PDF designed for long-term digital preservation. This tool converts your standard PDFs into PDF/A-compliant documents using Ghostscript running directly in your browser.

## How It Works

1. Upload one or more PDF files.
2. Select a **PDF/A Version** from the dropdown.
3. Optionally enable **Pre-flatten PDF** for complex files that fail normal conversion.
4. Click **Convert to PDF/A**. Multiple files produce a ZIP archive.

## PDF/A Versions

| Version      | Restrictions                               | Best For                                          |
| ------------ | ------------------------------------------ | ------------------------------------------------- |
| **PDF/A-1b** | Strictest. No transparency, no layers.     | Maximum compatibility with older archival systems |
| **PDF/A-2b** | Allows transparency and JPEG2000.          | General-purpose archiving (recommended)           |
| **PDF/A-3b** | Allows embedded attachments of any format. | Archiving documents with source data files        |

PDF/A-2b is selected by default and works for the vast majority of archiving needs.

## Pre-flatten Option

Some PDFs contain features that prevent clean PDF/A conversion -- unusual font encodings, complex transparency stacks, or broken internal structures. Enabling **Pre-flatten** rasterizes the PDF at 300 DPI before conversion, which guarantees compliance at the cost of making text non-selectable. Use it as a fallback when the standard conversion produces errors.

Pre-flattening requires the PyMuPDF WASM engine.

## Use Cases

- Meeting government or legal archival requirements (many jurisdictions mandate PDF/A for court filings)
- Submitting documents to institutional repositories or digital libraries
- Preserving business records where the original software may not exist in ten years
- Preparing invoices for e-invoicing standards that require PDF/A-3b with XML attachments

## Tips

- Try conversion without pre-flatten first. Only enable it if you get an error.
- PDF/A embeds all fonts, so output files are often larger than the originals.
- Validate the output in a dedicated PDF/A validator if strict compliance is required for your workflow.

## Related Tools

- [Compress PDF](./compress-pdf) -- reduce the file size after conversion
- [Flatten PDF](./flatten-pdf) -- flatten forms before converting to PDF/A
- [Remove Metadata](./remove-metadata) -- strip metadata before archiving
