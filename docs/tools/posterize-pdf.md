---
title: Posterize PDF
description: Split PDF pages into a grid of smaller pages for large-format printing across multiple sheets.
---

# Posterize PDF

Divide each page of a PDF into a grid of smaller sub-pages. This is the tool for printing a single page across multiple sheets of paper, which you then tile together to create a large poster or banner.

## How It Works

1. Upload a PDF file.
2. Set the number of **rows** and **columns** to define the grid (e.g., 2 rows x 2 columns splits each page into 4 sub-pages).
3. Optionally specify a page range to limit which pages get posterized.
4. The preview canvas shows a grid overlay on the current page so you can visualize the cuts.
5. Navigate between pages to check the overlay on different pages.
6. Click the process button. Each grid cell becomes its own page in the output PDF.

## Features

- Configurable row and column count for flexible grid sizes
- Live preview with grid overlay showing exactly where pages will be divided
- Page range filter to posterize only specific pages
- Page-by-page navigation in the preview
- Cached page snapshots for fast preview navigation
- Dashed red grid lines clearly mark the cut boundaries

## Options

| Option         | Description                                  |
| -------------- | -------------------------------------------- |
| **Rows**       | Number of horizontal divisions (default: 1)  |
| **Columns**    | Number of vertical divisions (default: 1)    |
| **Page range** | Which pages to posterize (blank = all pages) |

## Use Cases

- Printing a poster-sized PDF across standard A4 or Letter sheets to assemble on a wall
- Creating large banners from a single-page PDF design
- Splitting oversized technical drawings into printable tiles
- Making large-format prints without access to a wide-format printer

## Tips

- A 2x2 grid turns one page into 4 pages. A 3x3 grid turns one page into 9. Plan your grid based on how large you want the final assembled output.
- The preview overlay helps you verify that important content does not fall on a cut line. Adjust rows/columns if needed.
- For the reverse operation (fitting multiple pages onto one sheet), use [N-Up PDF](./n-up-pdf).

## Related Tools

- [N-Up PDF](./n-up-pdf)
- [Divide Pages](./divide-pages)
- [Split PDF](./split-pdf)
