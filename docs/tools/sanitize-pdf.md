---
title: Sanitize PDF
description: Remove hidden and potentially dangerous content from PDFs including metadata, JavaScript, embedded files, annotations, and layers.
---

# Sanitize PDF

PDFs can carry far more than what you see on screen. Hidden metadata, embedded JavaScript, file attachments, form data, and layer information can leak sensitive data or pose security risks. Sanitizing strips all of it, leaving you with a clean document safe to share publicly.

## How It Works

1. Upload a PDF file.
2. Select which elements to remove from the checklist.
3. Click **Sanitize PDF**.
4. Download the cleaned file.

## Sanitization Options

All options are enabled by default. Uncheck any you want to preserve.

| Option                    | What It Removes                                                  |
| ------------------------- | ---------------------------------------------------------------- |
| **Flatten Forms**         | Converts interactive form fields into static content             |
| **Remove Metadata**       | Strips author, title, creation date, software info, and XMP data |
| **Remove Annotations**    | Deletes comments, highlights, sticky notes, and markup           |
| **Remove JavaScript**     | Eliminates embedded scripts that could execute on open           |
| **Remove Embedded Files** | Strips file attachments embedded within the PDF                  |
| **Remove Layers (OCG)**   | Flattens optional content groups into a single layer             |
| **Remove Links**          | Strips hyperlinks and URL references                             |
| **Remove Structure Tree** | Removes the document structure used for accessibility tagging    |
| **Remove MarkInfo**       | Strips marked content information                                |
| **Remove Fonts**          | Removes embedded font data (use with caution)                    |

## Use Cases

- Preparing a PDF for public release by stripping internal metadata (author names, software versions, edit history)
- Removing JavaScript from a PDF received from an untrusted source before opening it
- Cleaning up a PDF before sending it to a client who should not see embedded comments or form field names
- Stripping hidden layers from an architectural drawing before sharing the final version
- Complying with data minimization requirements under privacy regulations

## Tips

- Leave "Remove Fonts" unchecked unless you are certain the PDF will still render correctly. Removing fonts can make text invisible in some viewers.
- If you only need to strip metadata, the dedicated Remove Metadata tool is faster and more focused.
- Sanitizing is irreversible. Keep your original file.

## Related Tools

- [Remove Metadata](./remove-metadata) -- strip only metadata without touching other content
- [Flatten PDF](./flatten-pdf) -- flatten forms and annotations specifically
- [Encrypt PDF](./encrypt-pdf) -- add password protection after sanitizing
- [Rasterize PDF](./rasterize-pdf) -- the nuclear option: convert to images to eliminate all hidden content
