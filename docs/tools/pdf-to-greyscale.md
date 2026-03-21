---
title: PDF to Greyscale
description: Convert a color PDF into a greyscale (black-and-white) version. Produces a new PDF with all color removed from every page.
---

# PDF to Greyscale

Converts a color PDF into a greyscale version. Each page is rendered, desaturated, and re-embedded as a JPEG image in a new PDF. The output preserves the original page dimensions.

## How It Works

1. Upload a PDF by clicking the drop zone or dragging a file onto it.
2. Click **Convert** to process the file.
3. A new `greyscale.pdf` downloads with all pages converted to black and white.

Under the hood, each page is rendered at 2x scale, the pixel data is run through a greyscale filter, then re-encoded as a JPEG at 90% quality and placed in a fresh PDF document.

## Options

This tool has no configurable options. The greyscale conversion uses a standard luminance formula and JPEG quality is fixed at 90%.

## Output Format

- A single `greyscale.pdf` file containing all pages as greyscale JPEG images.

## Use Cases

- Preparing documents for black-and-white printing to save on color ink costs.
- Meeting submission requirements for legal or government filings that mandate greyscale.
- Reducing file size on color-heavy PDFs (JPEG greyscale images are smaller than color).
- Creating a consistent visual style across documents with mixed color and B&W pages.

## Tips

- Because each page is rasterized and re-embedded as JPEG, the output is image-based. Text in the original PDF will no longer be selectable or searchable. If you need searchable text afterward, run the output through the OCR tool.
- For more control over color adjustments (brightness, contrast, saturation), look at the Adjust Colors tool or the Greyscale node in the [PDF Workflow Builder](./pdf-workflow).

## Related Tools

- [PDF to JPG](./pdf-to-jpg)
- [PDF to PNG](./pdf-to-png)
- [PDF Workflow Builder](./pdf-workflow)
