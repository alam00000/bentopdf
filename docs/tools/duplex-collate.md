---
title: Duplex Collate
description: Reorder duplex scan PDFs that contain front pages and back pages in separate blocks into proper front/back page order.
---

# Duplex Collate

Duplex Collate is designed for ADF scan workflows where one PDF contains two blocks of pages:

- all front sides first
- all back sides second

Instead of manually splitting and reassembling, this tool interleaves the two blocks into natural reading order: front1, back1, front2, back2, and so on.

## How It Works

1. Upload a single PDF created from duplex stack scanning.
2. Set the split point where the front block ends.
3. Choose back block handling:
   - **Reverse back block** (common when the stack is flipped before scanning backs)
   - **Keep back block as-is**
4. Click **Collate PDF** to download the reordered result.

## Options

- **Auto-detect split (half)**: sets the split point to `ceil(totalPages / 2)`.
- **Odd page warning**: warns when total pages are odd (often a scan mismatch).
- **Uneven block confirmation**: asks for confirmation when front/back block sizes differ.
- **Grouped export**: split the collated output into separate PDFs based on original document page count and download as ZIP.

## Output Behavior

- **Default**: one output PDF (single input PDF in, single output PDF out).
- **Grouped mode**: output is chunked by your pages-per-document value; if multiple chunks are produced, they are downloaded as one ZIP, otherwise a single PDF is downloaded.

If block sizes are uneven, paired pages are collated first, and remaining unpaired pages are appended at the end.

## Common Use Cases

- Restoring order after scanning a pile of double-sided forms in two passes.
- Rebuilding front/back packets from office scanners that output all fronts then all backs.
- Post-processing archive scans before splitting into per-document files.

## Tips

- Most duplex batches should have an even total page count.
- If output looks inverted on backs, switch between **Reverse back block** and **Keep back block as-is**.
- For 2-page originals (front+back), use grouped export with `2` pages per document.

## Related Tools

- [Alternate & Mix Pages](./alternate-merge)
- [Split PDF](./split-pdf)
- [Merge PDF](./merge-pdf)
- [Organize & Duplicate](./organize-pdf)
