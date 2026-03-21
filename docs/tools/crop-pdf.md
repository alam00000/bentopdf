---
title: Crop PDF
description: Visually crop PDF pages by drawing a crop region on each page with a Cropper.js-powered editor.
---

# Crop PDF

Trim the margins of your PDF pages using a visual cropping interface. Draw a crop rectangle directly on each page, preview the result, and apply the crop. You can set different crop regions for different pages or apply the same crop to the entire document.

## How It Works

1. Upload your PDF file.
2. The cropper editor opens, showing the first page with a draggable crop overlay.
3. Adjust the crop rectangle by dragging its edges or corners.
4. Use the page navigation buttons to move between pages and set crop regions for each one.
5. Click **Crop** to apply the crop and download the result.

## Features

- Visual crop editor powered by Cropper.js with handles for precise adjustment
- Page-by-page navigation to set individual crop regions
- Stores crop settings per page so you can define different crops for different pages
- Live preview of the selected crop area
- Supports PDFs of any page size or orientation

## Use Cases

- Removing wide margins from scanned documents to focus on the content area
- Trimming printer crop marks or registration marks from prepress PDFs
- Cropping lecture slides to remove the presenter notes area
- Removing headers or footers from every page before sharing a document excerpt
- Resizing pages to fit a specific display or print layout

## Tips

- The crop overlay can be freely resized and repositioned. Drag the corners for proportional resizing or the edges for one-axis adjustment.
- For documents where every page needs the same crop, set it on the first page -- the tool remembers your crop region as you navigate pages.
- If you need to standardize page sizes rather than visually crop, the Fix Page Size tool may be a better fit.

## Related Tools

- [PDF Editor](./edit-pdf)
- [Page Numbers](./page-numbers)
- [Remove Blank Pages](./remove-blank-pages)
