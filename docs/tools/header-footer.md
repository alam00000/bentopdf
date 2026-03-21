---
title: Header & Footer
description: Add customizable header and footer text to PDF pages with dynamic page number variables.
---

# Header & Footer

Add text to six positions on your PDF pages: header left, header center, header right, footer left, footer center, and footer right. The tool supports dynamic variables for page numbers and total page count, so you can create templates like "Page 3 of 10" that update automatically per page.

## How It Works

1. Upload your PDF file.
2. The options panel appears showing formatting controls and six text input fields.
3. Enter your desired text in any of the header/footer positions.
4. Use `{page}` and `{total}` placeholders for dynamic page numbering.
5. Adjust font size, font color, and optionally limit to a specific page range.
6. Click **Add Header & Footer** to process and download.

## Options

- **Page Range** -- Optionally limit which pages get headers and footers. Leave empty to apply to all pages. Format: "1-3, 5" (comma-separated ranges).
- **Font Size** -- Between 6 and 24 points. Defaults to 10.
- **Font Color** -- Pick any color using the color selector.
- **Header Left / Center / Right** -- Text fields for the top of each page.
- **Footer Left / Center / Right** -- Text fields for the bottom of each page.

## Features

- Six independent text positions per page
- Dynamic `{page}` variable that inserts the current page number
- Dynamic `{total}` variable that inserts the total page count
- Page range filtering to target specific pages
- Customizable font size and color
- Helvetica font for clean, professional output

## Use Cases

- Adding "Page {page} of {total}" to the footer center of a report
- Placing a company name in the header left and a document date in the header right
- Adding confidentiality notices to the footer of legal documents
- Stamping document revision numbers on specific page ranges

## Tips

- Combine `{page}` and `{total}` in a single field for formats like "Page {page} of {total}" or "{page}/{total}".
- You can leave most fields empty and only fill in the positions you need. Empty fields are simply skipped.
- For more complex headers with images or logos, consider using the [Add Watermark](./add-watermark) tool positioned at the top of the page.

## Related Tools

- [Page Numbers](./page-numbers)
- [Add Watermark](./add-watermark)
- [Bates Numbering](./bates-numbering)
