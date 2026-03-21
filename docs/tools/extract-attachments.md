---
title: Extract Attachments
description: Extract all embedded file attachments from one or more PDFs and download them as a ZIP archive.
---

# Extract Attachments

Pull out every embedded attachment from one or more PDF files. All extracted files are bundled into a single ZIP archive for download.

## How It Works

1. Upload one or more PDF files that contain embedded attachments.
2. Click **Extract Attachments**.
3. The tool scans each PDF for document-level and page-level attachments.
4. All found files are packaged into a ZIP archive and downloaded automatically.
5. A status message confirms how many attachments were found and their total size.

## Features

- Batch extraction from multiple PDFs at once
- Extracts both document-level and page-level attachments
- Outputs a single ZIP file containing all extracted files
- Displays total attachment count and combined file size
- Clear status messages if no attachments are found

## Use Cases

- Recovering data files embedded in a report PDF
- Pulling image assets out of a portfolio or specification document
- Extracting supplementary materials from training or compliance PDFs
- Auditing what files are embedded inside a batch of PDFs

## Tips

- If the tool reports no attachments, the PDF may contain embedded images or form data instead -- those are not file attachments. Use [Extract Images](./extract-images) for embedded images.
- When processing multiple PDFs, all attachments from every file end up in one ZIP. File names are preserved from the original embeddings.

## Related Tools

- [Add Attachments](./add-attachments)
- [Edit Attachments](./edit-attachments)
- [Extract Images](./extract-images)
