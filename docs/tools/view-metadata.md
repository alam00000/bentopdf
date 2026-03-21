---
title: View Metadata
description: Inspect all metadata properties of a PDF including document info, XMP data, and structural details.
---

# View Metadata

Examine the hidden properties embedded in a PDF file. The tool displays document information (title, author, dates), XMP metadata, page dimensions, and other structural data in a readable format.

## How It Works

1. Upload a PDF file.
2. The tool immediately parses the file and displays all available metadata in organized sections.
3. Review the document info dictionary, XMP metadata tree, and structural properties.
4. No processing step is needed -- metadata is displayed as soon as the file loads.

## Features

- Displays standard document info fields: Title, Author, Subject, Keywords, Creator, Producer
- Shows creation and modification dates in human-readable format
- Parses and renders the full XMP metadata tree with nested namespaces
- Handles PDF date format (`D:20240101120000Z`) conversion to readable dates
- Organized into collapsible sections for easy navigation

## Metadata Sections

| Section                 | Contents                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------- |
| **Document Info**       | Title, Author, Subject, Keywords, Creator, Producer, Creation Date, Modification Date |
| **XMP Metadata**        | Full XML-based metadata tree with Dublin Core, XAP, PDF, and custom namespaces        |
| **Document Properties** | Page count, PDF version, file size, encryption status                                 |

## Use Cases

- Checking who authored a PDF and when it was last modified
- Verifying that metadata was properly set before publishing a document
- Auditing PDFs for privacy by checking what personal information is embedded
- Investigating the software used to create or modify a PDF (via the Producer field)
- Reviewing XMP metadata for digital asset management compliance

## Tips

- PDF date strings that start with `D:` are automatically converted to your local timezone format.
- If metadata fields appear empty, the PDF creator simply did not set them. Not all PDFs contain rich metadata.
- To modify metadata after inspecting it, use [Edit Metadata](./edit-metadata). To strip it entirely, use Remove Metadata.

## Related Tools

- [Edit Metadata](./edit-metadata)
- [PDF OCG Layers](./pdf-layers)
- [Compare PDFs](./compare-pdfs)
