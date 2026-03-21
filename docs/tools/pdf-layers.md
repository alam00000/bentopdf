---
title: PDF OCG Layers
description: View, toggle, add, and delete Optional Content Group (OCG) layers in a PDF document.
---

# PDF OCG Layers

Manage the Optional Content Groups (OCG) -- commonly called "layers" -- inside a PDF. You can toggle layer visibility, add new layers (including nested child layers), delete layers, and save the modified PDF.

## How It Works

1. Upload a PDF file.
2. Click the process button to load the document with the PyMuPDF engine.
3. The tool displays all existing layers with their visibility state, lock status, and nesting hierarchy.
4. Toggle checkboxes to show or hide layers. Locked layers cannot be toggled.
5. Add new top-level layers by typing a name and clicking the add button, or add child layers under an existing parent.
6. Delete layers you no longer need.
7. Click **Save** to download the modified PDF with your layer changes applied.

## Features

- Displays layer hierarchy with proper indentation for nested layers
- Toggle layer visibility on or off
- Locked layer indicator prevents accidental changes
- Add top-level or child layers with custom names
- Delete individual layers
- Saves all changes into a new PDF file

## Use Cases

- Toggling visibility of markup layers in architectural or engineering drawings
- Adding new annotation layers to a multi-layer design document
- Removing obsolete layers from a template before distributing it
- Inspecting which layers exist in a complex PDF received from a third party

## Tips

- If the PDF has no layers, the tool shows an empty state with a prompt to add one. Not all PDFs use OCG layers -- they are most common in CAD exports and design files.
- Child layers are visually indented under their parent. You can nest layers to any depth.
- Locked layers are displayed with a lock icon and their checkboxes are disabled. These locks are set by the PDF creator.

## Related Tools

- [View Metadata](./view-metadata)
- [Edit Metadata](./edit-metadata)
- [Organize & Duplicate](./organize-pdf)
