---
title: PDF to Markdown
description: Convert PDF documents to Markdown format with optional image extraction. Supports batch conversion of multiple files.
---

# PDF to Markdown

Converts PDF files to Markdown (`.md`) format, preserving headings, paragraphs, lists, and basic formatting. Optionally extracts and includes embedded images. Supports single and batch conversion. Powered by PyMuPDF.

## How It Works

1. Upload one or more PDFs by clicking the drop zone or dragging files onto it.
2. Optionally toggle **Include Images** to embed extracted images in the Markdown output.
3. Click **Convert** to start processing.
4. A single file downloads as `filename.md`. Multiple files produce a `markdown-files.zip`.

## Options

- **Include Images** -- when checked, embedded images from the PDF are extracted and referenced in the Markdown output. When unchecked, only text content is converted.

## Output Format

- **Single file**: `filename.md`
- **Multiple files**: `markdown-files.zip` containing one `.md` per input PDF.

## Use Cases

- Converting PDF documentation into Markdown for a static site generator like VitePress, Hugo, or Jekyll.
- Turning PDF research papers into editable Markdown for note-taking apps like Obsidian.
- Migrating legacy PDF knowledge bases into a Git-friendly text format.
- Extracting structured content from PDF ebooks for reformatting.

## Tips

- The Include Images option is useful when the PDF contains diagrams or figures that are essential to the content. Disable it for text-heavy documents to keep the output clean.
- Complex layouts with sidebars, footnotes, or multi-column text may produce imperfect Markdown. Review and adjust the output as needed.
- For raw text without any formatting, use [PDF to Text](./pdf-to-text) instead.

## Related Tools

- [PDF to Text](./pdf-to-text)
- [PDF to Word](./pdf-to-docx)
- [Prepare PDF for AI](./prepare-pdf-for-ai)
