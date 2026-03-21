---
title: PowerPoint to PDF
description: Convert PowerPoint presentations (PPT, PPTX) and ODP files to PDF with slide formatting preserved.
---

# PowerPoint to PDF

Convert presentation files to PDF. Each slide becomes a page in the output document, with text, images, shapes, and transitions rendered through a browser-based LibreOffice engine. Supports both modern and legacy PowerPoint formats, plus the OpenDocument Presentation format.

## Supported Formats

| Format                    | Extensions |
| :------------------------ | :--------- |
| PowerPoint (modern)       | `.pptx`    |
| PowerPoint (legacy)       | `.ppt`     |
| OpenDocument Presentation | `.odp`     |

## How It Works

1. Click the upload area or drag and drop your presentation files.
2. Review the file list. Add more or remove files as needed.
3. Click **Convert to PDF**. The LibreOffice engine loads on first use, then converts each file.
4. A single file downloads directly as a PDF. Multiple files are packaged into `powerpoint-converted.zip`.

## Options

This tool has no additional settings. Slides are rendered at their native dimensions.

## Output

| Input Count | Output                                                               |
| :---------- | :------------------------------------------------------------------- |
| 1 file      | Single PDF download (original filename with `.pdf` extension)        |
| 2+ files    | ZIP archive (`powerpoint-converted.zip`) containing one PDF per file |

## Use Cases

- Converting a presentation to PDF before sharing with an audience that may not have PowerPoint
- Creating a printable handout version of a slide deck for a conference or workshop
- Archiving presentations in a format that renders identically on every device
- Batch converting a library of ODP presentations from LibreOffice Impress to PDF
- Producing a PDF version of a pitch deck for email attachments

## Tips

- Slide animations and transitions are not represented in the PDF. Each slide is captured as a static page.
- Embedded videos will not appear in the output. Replace them with a screenshot or placeholder image if needed.
- Speaker notes are not included in the default PDF export. If you need notes, consider exporting from PowerPoint's native "Print Notes" view first.
- The LibreOffice engine caches after first load, so converting a second presentation in the same session is much faster.

## Related Tools

- [Word to PDF](./word-to-pdf)
- [Excel to PDF](./excel-to-pdf)
- [Images to PDF](./image-to-pdf)
