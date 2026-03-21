---
title: Edit Metadata
description: View and modify PDF metadata fields including title, author, keywords, dates, and custom properties.
---

# Edit Metadata

Edit the metadata embedded in a PDF file. The tool pre-populates a form with the document's existing metadata, lets you modify any field, and saves the changes into a new PDF.

## How It Works

1. Upload a PDF file. The tool reads its current metadata and populates the form.
2. Edit any of the standard fields: Title, Author, Subject, Keywords, Creator, Producer.
3. Adjust the Creation Date and Modification Date using date-time pickers.
4. Add custom metadata fields by clicking the add button and entering a key-value pair.
5. Click the process button to save the modified PDF.

## Features

- Pre-fills all existing metadata from the uploaded PDF
- Standard fields: Title, Author, Subject, Keywords, Creator, Producer
- Date-time pickers for Creation Date and Modification Date
- Custom key-value metadata fields for arbitrary properties
- Saves changes directly into the PDF's document info dictionary

## Editable Fields

| Field                 | Description                                          |
| --------------------- | ---------------------------------------------------- |
| **Title**             | The document title displayed in PDF readers          |
| **Author**            | The person or organization that created the document |
| **Subject**           | A brief description of the document's topic          |
| **Keywords**          | Comma-separated terms for search and categorization  |
| **Creator**           | The application that originally created the content  |
| **Producer**          | The application that generated the PDF               |
| **Creation Date**     | When the document was originally created             |
| **Modification Date** | When the document was last modified                  |
| **Custom fields**     | Any additional key-value pairs you define            |

## Use Cases

- Setting a proper title and author before publishing a document
- Adding keywords to improve searchability in document management systems
- Updating the modification date to reflect the current revision
- Adding custom metadata fields like Department, Project ID, or Classification
- Cleaning up metadata left by the original authoring software

## Tips

- Custom fields are written directly into the PDF's info dictionary. Some PDF readers may not display custom fields, but they are preserved in the file.
- Leave a field blank to clear it from the metadata. The process button saves whatever is in the form.
- To view metadata without editing, use [View Metadata](./view-metadata). To remove all metadata entirely, use Remove Metadata.

## Related Tools

- [View Metadata](./view-metadata)
- [PDF OCG Layers](./pdf-layers)
- [Compress PDF](./compress-pdf)
