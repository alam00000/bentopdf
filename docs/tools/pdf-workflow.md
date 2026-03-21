---
title: PDF Workflow Builder
description: Build custom PDF processing pipelines visually by connecting nodes on a canvas. Chain operations like merge, compress, watermark, and export.
---

# PDF Workflow Builder

The Workflow Builder lets you chain multiple PDF operations into a single automated pipeline. Instead of running tools one at a time, you wire up a visual graph of nodes -- input, processing, output -- and execute everything with one click. Your files never leave the browser.

## How It Works

The interface is split into three panels: a **node toolbox** on the left, the **canvas** in the center, and a **settings panel** on the right that appears when you select a node.

1. **Add nodes** by clicking them in the left sidebar, or drag them directly onto the canvas. Use the search bar at the top of the toolbox to filter by name.
2. **Connect nodes** by dragging from an output socket (bottom of a node) to an input socket (top of another node). Connections flow top-to-bottom.
3. **Configure settings** by clicking a node to open its settings panel on the right. Each node type has its own options (page ranges, quality sliders, passwords, etc.).
4. **Run the workflow** by clicking the **Run** button in the toolbar. The engine executes nodes in topological order, processing each one in sequence. A status bar at the bottom tracks progress.
5. **Download results** -- the terminal Download node saves the final PDF (or ZIP if multiple files are produced).

## Node Categories

Nodes are organized into six categories, each color-coded on the canvas:

- **Input** (blue) -- PDF Input, Image Input, Word/Excel/PowerPoint to PDF, and 15+ other format converters that feed files into the pipeline.
- **Edit & Annotate** (indigo) -- Crop, Greyscale, Invert Colors, Watermark, Page Numbers, Header & Footer, Scanner Effect, Adjust Colors, Background Color, Remove Blank Pages, Remove Annotations.
- **Organize & Manage** (violet) -- Merge, Split, Extract Pages, Rotate, Delete Pages, Reverse, Add Blank Page, Divide Pages, N-Up, Fix Page Size, Combine to Single Page, Booklet, Posterize, Edit Metadata, Table of Contents, OCR.
- **Optimize & Repair** (amber) -- Compress, Rasterize, Linearize, Deskew, PDF to PDF/A, Font to Outline, Repair.
- **Secure PDF** (rose) -- Encrypt, Decrypt, Sanitize, Flatten, Digital Sign, Redact.
- **Output** (teal) -- Download (auto-detects single PDF vs. ZIP), PDF to Images, PDF to Text, PDF to DOCX, PDF to XLSX, PDF to CSV, PDF to SVG, PDF to Markdown, Extract Images.

## Saving and Loading Workflows

The toolbar provides four persistence options:

- **Save** -- stores the current workflow as a named template in your browser's local storage. You can save multiple templates.
- **Load** -- opens a modal listing all saved templates. Click Load to restore one, or delete templates you no longer need.
- **Export** -- downloads the workflow as a `.json` file so you can share it or back it up.
- **Import** -- loads a `.json` workflow file from disk, restoring all nodes, positions, and connections.

Templates persist across sessions in local storage. Exported JSON files are portable between browsers and machines.

## Execution Model

The engine builds a dependency graph from your connections and executes nodes in topological order. If any node fails, execution halts and the failing node is marked red. A few rules to keep in mind:

- Every workflow needs at least one **Input** node and one **Output** node.
- The engine detects circular dependencies and blocks execution with an error.
- The **Encrypt** node must be the last processing step before the output node. Placing it earlier will trigger a validation warning because downstream nodes cannot operate on encrypted data.
- Password-protected PDFs prompt for a password during execution.
- Multi-PDF inputs are supported -- the Merge node can combine them, or batch-processing nodes will process each PDF individually.

## Socket Types

Connections use typed sockets to prevent invalid wiring:

- **PDF** (indigo) -- a single PDF document.
- **MultiPDF** (amber) -- multiple PDF documents bundled together.
- **Image** (green) -- an image blob.

## Options

Every node has its own configuration accessible through the right settings panel. Common patterns include:

- **Page ranges** on Split, Extract Pages, Delete Pages nodes
- **Quality sliders** on image conversion output nodes
- **Password fields** on Encrypt and Decrypt nodes
- **Text inputs** for Watermark, Header & Footer, Edit Metadata
- **Rotation angles** on the Rotate node
- **Compression level** on the Compress node
- **OCR language selection** on the OCR node

## Use Cases

- **Invoice processing pipeline**: PDF Input -> OCR -> Extract Tables -> Download as CSV.
- **Report standardization**: Word to PDF -> Fix Page Size -> Add Page Numbers -> Watermark -> Compress -> Download.
- **Archival preparation**: PDF Input -> Repair -> Flatten -> Sanitize -> PDF to PDF/A -> Download.
- **Batch image extraction**: PDF Input (multiple files) -> Extract Images -> Download ZIP.
- **Print-ready booklets**: PDF Input -> Booklet -> Crop -> Compress -> Download.
- **Secure distribution**: PDF Input -> Redact -> Remove Annotations -> Encrypt -> Download.

## Tips

- Use **Delete** or **Backspace** to remove the selected node from the canvas.
- Click the **X** button on a node's status bar to delete it directly.
- Pan the canvas by clicking and dragging on empty space. The cursor changes to a grab icon while panning.
- On mobile, use the **+** button in the toolbar to toggle the node toolbox.
- If your workflow produces multiple output files, the Download node automatically bundles them into a ZIP.
- Start simple -- build and test a two-node pipeline before adding complexity.

## Related Tools

- [PDF to Text](./pdf-to-text)
- [PDF to Excel](./pdf-to-excel)
- [Extract Images](./extract-images)
- [PDF to Markdown](./pdf-to-markdown)
