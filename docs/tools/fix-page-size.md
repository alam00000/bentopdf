---
title: Fix Page Size
description: Standardize all pages in a PDF to a uniform size. Choose from standard paper sizes or set custom dimensions.
---

# Fix Page Size

PDFs assembled from multiple sources often end up with mismatched page sizes -- some Letter, some A4, some completely non-standard. This tool forces every page to a single target size, scaling content to fit or fill as needed.

## How It Works

1. Upload a PDF file.
2. Select a **Target Page Size** from the dropdown (A4, Letter, Legal, A3, A5, Tabloid, or Custom).
3. Choose an **Orientation** -- Auto keeps each page's original orientation, or you can force Portrait or Landscape.
4. Pick a **Content Scaling** mode: Fit (preserves all content, may add margins) or Fill (fills the page, may crop edges).
5. Optionally set a **Background Color** for any added margins.
6. Click **Fix Page Size**.

## Options

- **Standard sizes**: A4, Letter, Legal, A3, A5, Tabloid
- **Custom dimensions**: Enter width and height in inches or millimeters
- **Orientation**: Auto, Portrait, Landscape
- **Scaling mode**: Fit or Fill (Crop)
- **Background color**: Any color for margin padding

## Use Cases

- Normalizing a merged PDF where pages came from different scanners
- Converting a US Letter document to A4 for international distribution
- Preparing print-ready PDFs that require a consistent trim size
- Fixing pages that are slightly off-standard (e.g., 8.49 x 11.02 inches instead of 8.5 x 11)

## Tips

- Use Fit mode to guarantee no content is lost. Fill mode looks cleaner but can clip edges.
- Check your output with the Page Dimensions tool to confirm every page matches the target.
- White is the default background color; switch to a dark color if your document has dark margins.

## Related Tools

- [Page Dimensions](./page-dimensions) -- inspect page sizes before and after fixing
- [Compress PDF](./compress-pdf) -- reduce file size after standardization
- [Crop PDF](./crop-pdf) -- manually crop pages instead of auto-scaling
