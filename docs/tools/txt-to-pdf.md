---
title: Text to PDF
description: Convert plain text files or typed text to PDF with custom fonts, colors, and page sizes.
---

# Text to PDF

Convert plain text into a formatted PDF. You can upload `.txt` files or type directly into the built-in text editor. The tool supports multiple fonts, custom text colors, and a wide range of page sizes -- from A0 down to A10, plus US Letter, Legal, and Tabloid.

## Supported Formats

| Input             | Extensions                    |
| :---------------- | :---------------------------- |
| Plain text files  | `.txt`                        |
| Direct text input | Type or paste into the editor |

## How It Works

1. Choose your input mode using the toggle at the top: **Upload Files** or **Type Text**.
2. If uploading, drag and drop or click to select one or more `.txt` files. If typing, enter your text directly in the textarea.
3. Configure the formatting options: font family, font size, text color, and page size.
4. Click **Create PDF**. The output downloads as `text_to_pdf.pdf`.

When uploading multiple files, their contents are concatenated with blank lines between them.

## Options

| Option          | Values                                                                   | Default         |
| :-------------- | :----------------------------------------------------------------------- | :-------------- |
| **Font Family** | Helvetica (sans-serif), Tiro (serif), Courier (monospace), Times (serif) | Helvetica       |
| **Font Size**   | 6 -- 72 pt                                                               | 12              |
| **Text Color**  | Any color via color picker                                               | Black (#000000) |
| **Page Size**   | ISO A0--A10, B0--B10, C0--C10, US Letter, Legal, Tabloid, Ledger, 11x17  | A4              |

RTL languages (Arabic, Hebrew, Persian, Urdu) are automatically detected. When RTL text is found, the text direction and alignment switch accordingly.

## Use Cases

- Converting code snippets or log files into a printable PDF with Courier font
- Creating a quick PDF from meeting notes typed on the spot
- Formatting a plain text manuscript with a specific font and page size for submission
- Producing a PDF version of a README or changelog for offline distribution

## Tips

- Use the **Type Text** mode when you want to quickly convert clipboard content without saving it as a file first.
- Courier (monospace) is the best font choice for code, logs, or any content where column alignment matters.
- The page margins are fixed at 72 points (1 inch) on all sides.

## Related Tools

- [Markdown to PDF](./markdown-to-pdf)
- [CSV to PDF](./csv-to-pdf)
- [Word to PDF](./word-to-pdf)
