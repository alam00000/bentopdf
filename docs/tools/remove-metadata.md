---
title: Remove Metadata
description: Strip all hidden metadata from PDF files including author, title, creation date, producer, XMP data, and document IDs.
---

# Remove Metadata

Every PDF carries metadata that can reveal who created it, what software was used, when it was last modified, and more. This tool strips all of it -- the info dictionary, XMP metadata streams, document IDs, and application-specific data -- leaving a clean document with no trace of its origin.

## How It Works

1. Upload a PDF file.
2. Click **Remove Metadata**.
3. Download the cleaned file.

No options to configure. The tool is thorough by design: it clears everything.

## What Gets Removed

- **Info dictionary fields**: Title, Author, Subject, Keywords, Creator, Producer, creation date, modification date
- **XMP metadata stream**: The XML-based metadata block stored in the document catalog
- **Document IDs**: Unique identifiers in the PDF trailer that can be used to track a document across systems
- **PieceInfo**: Application-specific metadata added by programs like Illustrator or InDesign

## What Stays

- All visible page content (text, images, graphics)
- Form fields and annotations
- Bookmarks and links
- The document structure itself

## Use Cases

- Removing your name and organization from a document before publishing it anonymously
- Stripping creation timestamps that reveal when a document was prepared
- Cleaning producer strings that identify your PDF software stack
- Preparing documents for regulatory submissions that require metadata-free PDFs
- Removing edit history traces before sharing a document externally

## Tips

- Use the View Metadata tool first to see exactly what metadata your PDF contains before stripping it.
- If you need to remove metadata _and_ JavaScript, annotations, and embedded files, use Sanitize PDF for a more thorough cleaning.
- Metadata removal is permanent. Keep your original if you might need that data later.

## Related Tools

- [Sanitize PDF](./sanitize-pdf) -- remove metadata plus scripts, attachments, and more
- [Encrypt PDF](./encrypt-pdf) -- protect the cleaned PDF with a password
- [Compress PDF](./compress-pdf) -- removing metadata can slightly reduce file size; compress for more savings
