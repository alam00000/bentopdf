# BentoPDF Android build

`BentoPDF-debug.apk` - a debug-signed build for sideloading onto your own
device. Not for store distribution.

| | |
| --- | --- |
| Package | `com.bentopdf.personal` |
| Label | BentoPDF |
| targetSdk | 36 |
| Size | 75 MB (78,525,724 bytes) |
| SHA-256 | `31dd3075166bab07ab5eca79290e7c81030b9f56291e24e670a96431c69d24b5` |
| Signing | v2 scheme, debug keystore - verified with `apksigner verify` |

## Installing

1. Download the APK to your phone from this page.
2. Open it. Android will warn about an unknown source; allow "install unknown
   apps" for whichever app you opened it with (usually your browser or files
   app), then install.

The debug keystore is Android's auto-generated one. That is fine for your own
devices - it just cannot be published to Play, which is the point of this
build.

## Opening documents with it

The app registers as a handler for PDF, Word, Excel, PowerPoint, OpenDocument
and RTF files, so it appears in Android's "Open with" list and share sheets.
Tapping a PDF routes it to the PDF editor; Writer documents open in the Word
Editor and everything else in the Office Viewer.

Android content URIs rarely carry a filename, so a shared document may arrive
named `document.pdf` rather than its real name. The contents are correct; only
the label is inferred from the file type.

## What is in it

Everything in the web app, plus the two new tools:

- **Office Viewer** - opens Word, Excel, PowerPoint, OpenDocument, Visio,
  Publisher, WordPerfect and Apple Pages files, renders the pages, and exports
  to any format the engine supports.
- **Word Editor** - real editing of Writer documents through LibreOfficeKit:
  click to place the caret, type, Backspace and Enter, formatting commands,
  and save back to DOCX/ODT/RTF/TXT/PDF/HTML.

LibreOffice accounts for roughly 47 MB of the size. Everything runs on the
device; nothing is uploaded.

## Rebuilding

```sh
npm install
npm run native:init
npm run native:assets
npm run native:apk     # -> android/app/build/outputs/apk/debug/app-debug.apk
```

Needs the Android SDK (build-tools 35, platform 35). See NATIVE_APPS.md.
