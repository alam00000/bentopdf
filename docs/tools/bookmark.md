---
title: Edit Bookmarks
description: Add, edit, import, export, and delete PDF bookmarks with a visual editor and CSV/JSON support.
---

# Edit Bookmarks

The bookmark editor gives you full control over PDF navigation bookmarks (also called outlines). You can add new bookmarks, edit existing ones, reorganize the hierarchy, and import or export bookmark data in CSV and JSON formats.

## How It Works

1. Upload your PDF by clicking or dragging a file into the drop zone.
2. Optionally check **Auto-extract existing bookmarks** to pull in the document's current bookmark tree.
3. The editor opens with a split view: PDF viewer on the left, bookmark panel on the right.
4. Type a bookmark title and click **Add to Page** to create a new bookmark pointing to the current page.
5. Use the toolbar buttons to rearrange, style, or delete bookmarks.
6. Click **Save PDF with Bookmarks** to download the updated file.

## Features

- Visual PDF viewer with page navigation, zoom controls, and go-to-page input
- Add bookmarks to any page with a single click
- Click directly on the PDF to set a precise bookmark destination (picking mode)
- Nested bookmark hierarchy with drag-and-drop reordering
- Batch operations: select multiple bookmarks to change color, style, or delete at once
- Bookmark search to quickly find entries in large trees
- Undo and redo support for all changes
- Import bookmarks from CSV (title, page, level) or JSON files
- Export bookmarks to CSV or JSON for external editing
- Bookmark styling: color (red, blue, green, yellow, purple) and font style (bold, italic, bold italic)
- Quick navigation: scroll through pages with page up/down keys

## Options

- **Auto-extract existing bookmarks** -- When checked, the tool reads and displays the PDF's current bookmarks on load.
- **Batch Mode** -- Toggle to select multiple bookmarks and apply bulk color, style, or delete operations.
- **Expand/Collapse All** -- Quickly show or hide nested bookmark children.

## Use Cases

- Adding a table of contents to a textbook or manual that lacks bookmarks
- Restructuring bookmarks in a scanned document after OCR processing
- Exporting bookmarks to CSV, editing them in a spreadsheet, then re-importing
- Cleaning up auto-generated bookmarks that have incorrect page references
- Adding colored bookmarks to flag important sections in a legal brief

## Tips

- Use CSV import for bulk bookmark creation. The format is simple: `title,page,level` where level 1 is top-level.
- The picking mode lets you click an exact spot on the PDF page to set the bookmark destination, which is more precise than just targeting a page number.
- Export your bookmarks before making major changes so you have a backup.

## Related Tools

- [Table of Contents](./table-of-contents)
- [PDF Editor](./edit-pdf)
- [Add Page Labels](./add-page-labels)
