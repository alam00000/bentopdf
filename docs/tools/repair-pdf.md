---
title: Repair PDF
description: Recover data from corrupted or damaged PDF files using QPDF's repair engine. Supports batch processing.
---

# Repair PDF

When a PDF refuses to open, displays garbled content, or triggers errors in your viewer, this tool attempts to rebuild its internal structure. It uses QPDF's repair engine, which can recover data from many types of corruption -- broken cross-reference tables, truncated streams, invalid object references, and more.

## How It Works

1. Upload one or more damaged PDF files.
2. Click **Repair PDF**.
3. A single repaired file downloads directly. Multiple files produce a ZIP archive.

The tool passes each file through QPDF with the `--decrypt` flag, which forces QPDF to read and rewrite the entire PDF structure, fixing recoverable issues along the way.

## Features

- Batch repair of multiple PDFs in one operation
- Automatic detection of recoverable vs. unrecoverable files
- Per-file success/failure reporting when processing multiple files
- Uses QPDF (WebAssembly), a battle-tested PDF transformation library

## What It Can Fix

- Broken or missing cross-reference tables
- Truncated file endings from incomplete downloads
- Invalid object numbering and stream lengths
- Minor structural inconsistencies from buggy PDF generators
- Encryption artifacts from failed decryption attempts

## What It Cannot Fix

- Severely truncated files where most content data is missing
- PDFs encrypted with a password you do not have
- Files that are not actually PDFs (wrong file extension)
- Image corruption within the PDF (the structure is fixed, but pixel data is not regenerated)

## Use Cases

- Recovering a PDF from a failed email download
- Opening files produced by legacy or non-standard PDF generators
- Fixing PDFs that work in one viewer but not another
- Preparing damaged archival documents for long-term storage

## Tips

- If repair fails, try opening the file in a browser first -- browsers have their own recovery logic and may render enough content to re-save.
- For encrypted PDFs that fail repair, try Decrypt PDF first, then repair the decrypted output.

## Related Tools

- [Compress PDF](./compress-pdf) -- clean up the repaired PDF's structure further
- [Linearize PDF](./linearize-pdf) -- optimize the repaired file for web delivery
- [Flatten PDF](./flatten-pdf) -- flatten forms that may have been damaged
