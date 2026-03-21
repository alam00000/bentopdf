---
title: Add Page Labels
description: Add PDF page labels with Roman numerals, letter prefixes, custom numbering, and multiple rules per document.
---

# Add Page Labels

Page labels control how page numbers display in PDF viewers (the number shown in the toolbar, not printed on the page). This tool lets you assign different labeling schemes to different page ranges -- Roman numerals for front matter, decimal numbers for the body, lettered appendices, and more.

## How It Works

1. Upload your PDF file.
2. The options panel appears with one label rule by default.
3. Configure each rule with a page range, style, optional prefix, and start value.
4. Click **Add Rule** to create additional rules for different sections.
5. Click **Add Page Labels** to apply all rules and download the result.

## Options

Each label rule has these settings:

- **Page Range** -- Which pages the rule applies to. Leave empty for all pages. Supports ranges like `1-4`, `7`, `odd`, or `1-9,30-40`.
- **Label Style** -- Decimal Arabic, Lowercase Roman (i, ii, iii), Uppercase Roman (I, II, III), Lowercase Letters (a, b, c), Uppercase Letters (A, B, C), or No Label (prefix only).
- **Label Prefix** -- Optional text prepended to each label, such as "A-" to create labels like A-1, A-2, A-3.
- **Start Value** -- The number to begin counting from. Defaults to 1. Set to 0 for zero-based numbering.
- **Continue numbering across disjoint ranges** -- Enable this when a rule targets non-contiguous pages (like `1-9,30-40` or `odd`) and you want numbering to continue sequentially.
- **Remove existing page labels** -- Checked by default. Clears any previous labels before applying your new rules.

## Features

- Multiple label rules per document for complex numbering schemes
- Six label styles covering all standard numbering systems
- Custom prefix support for section-based labeling
- Disjoint range support with progressive numbering
- Option to preserve or remove existing labels

## Use Cases

- Setting Roman numeral labels (i, ii, iii) for a book's preface and decimal labels for the main text
- Labeling appendix pages with letter prefixes like "A-1", "A-2", "B-1", "B-2"
- Correcting page labels in a scanned document where the physical page numbers don't match the PDF page order
- Adding zero-based numbering for technical documents

## Tips

- Page labels are metadata that PDF viewers display in their navigation toolbar. They do not print on the actual page. For visible numbers, use [Page Numbers](./page-numbers).
- This tool requires CoherentPDF (CPDF) to be configured in your WASM Settings. If it is not set up, you will be prompted to configure it.

## Related Tools

- [Page Numbers](./page-numbers)
- [Bates Numbering](./bates-numbering)
- [Edit Bookmarks](./bookmark)
