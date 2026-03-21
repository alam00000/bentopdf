---
title: Font to Outline
description: Convert all PDF fonts to vector outlines for consistent rendering across devices. Eliminates font dependency issues.
---

# Font to Outline

Converting fonts to outlines transforms every text character from a font-based glyph into a vector path. The PDF no longer depends on any installed fonts -- it renders identically on every device, every operating system, and every printer. This is a standard step in prepress workflows.

## How It Works

1. Upload one or more PDF files.
2. Click **Convert to Outlines**.
3. Ghostscript converts all text to vector paths.
4. Download the result. Multiple files produce a ZIP archive.

There are no settings to configure. The tool uses Ghostscript (WebAssembly) to convert all font references to outlined paths in a single pass.

## What Changes

- Text characters become vector curves (bezier paths)
- Font embedding is no longer necessary -- the PDF is self-contained at the glyph level
- File size may increase because vector paths are typically larger than font references
- Visual appearance is preserved exactly

## What You Lose

- Text selection and copy-paste
- Text searchability (Ctrl+F stops working)
- The ability to edit text content
- Screen reader accessibility

## Use Cases

- Sending PDFs to a print shop that requires outlined fonts
- Sharing documents that use custom or licensed fonts with people who do not have those fonts
- Preventing font substitution that changes the look of your document on other systems
- Preparing PDFs for laser engraving or CNC cutting workflows that require vector input
- Ensuring a logo-heavy PDF displays correctly across all platforms

## Tips

- Keep your original PDF. Outlining is irreversible -- you cannot convert paths back to editable text.
- If you need the text to remain searchable, consider the Rasterize PDF tool with OCR as a follow-up instead.
- Outlined PDFs tend to be larger. Run Compress PDF afterward if file size matters.

## Related Tools

- [Flatten PDF](./flatten-pdf) -- flatten forms and annotations without touching fonts
- [Rasterize PDF](./rasterize-pdf) -- convert to image-based PDF instead of vector outlines
- [Compress PDF](./compress-pdf) -- reduce file size after outlining
- [PDF to PDF/A](./pdf-to-pdfa) -- convert for archival after ensuring font independence
