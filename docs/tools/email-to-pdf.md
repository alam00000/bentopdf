---
title: Email to PDF
description: Convert EML and MSG email files to PDF in your browser. Preserves headers, body, and attachments list.
---

# Email to PDF

Convert saved email files into clean, printable PDFs. The tool parses EML and MSG files, extracts the full message -- headers, body content, and attachment metadata -- and renders everything into a structured PDF. Useful for legal discovery, record-keeping, or just printing an important email.

## Supported Formats

| Format | Extension | Notes                                                         |
| :----- | :-------- | :------------------------------------------------------------ |
| EML    | `.eml`    | Standard MIME email format (exported from most email clients) |
| MSG    | `.msg`    | Microsoft Outlook proprietary format                          |

## How It Works

1. Click the upload area or drag and drop your EML or MSG files. You can mix both formats in a single batch.
2. Review the file list. Remove any unwanted entries with the trash icon, or click **Add More Files** to include more emails.
3. Configure the conversion options (see below).
4. Click **Convert to PDF**. The tool parses each email, renders the content as styled HTML, and converts it to PDF via the PyMuPDF engine.
5. A single email downloads as a PDF directly. Multiple emails are packaged into `emails-converted.zip`.

## Options

| Option                       | Default | Description                                                                                         |
| :--------------------------- | :------ | :-------------------------------------------------------------------------------------------------- |
| **Page Size**                | A4      | Choose between A4, Letter, or Legal page dimensions.                                                |
| **Include CC and BCC**       | On      | When enabled, CC and BCC recipient lists appear in the email header section of the PDF.             |
| **Include Attachments List** | On      | When enabled, a list of the email's file attachments (with filenames and sizes) appears in the PDF. |

## Use Cases

- Archiving important business correspondence as PDF for compliance or auditing
- Printing email threads for legal proceedings or discovery requests
- Creating a permanent record of order confirmations, receipts, or contracts received via email
- Backing up Outlook MSG files in a format that doesn't require Outlook to read
- Documenting customer support interactions from exported EML files

## Tips

- Both EML (used by Thunderbird, Apple Mail, and most email clients) and Outlook MSG files are supported. Export emails from your email client and drop them directly into the tool.
- HTML-formatted emails retain their styling in the PDF. Plain-text emails are rendered with clean, readable formatting.
- The attachments list shows filenames and sizes but does not embed the actual attachment files into the PDF.

## Related Tools

- [XML to PDF](./xml-to-pdf)
- [XPS to PDF](./xps-to-pdf)
