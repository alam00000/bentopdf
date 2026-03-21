---
title: Scanner Effect
description: Make your PDF look like a scanned document with adjustable noise, rotation, blur, and paper aging effects.
---

# Scanner Effect

Transform a clean digital PDF into something that looks like it came out of a flatbed scanner. The tool applies configurable noise, slight rotation, blur, brightness shifts, and optional yellowing to simulate the imperfections of a physical scan.

## How It Works

1. Upload your PDF file.
2. The editor opens with a live preview of the first page alongside a settings panel.
3. Adjust the scan effect parameters using the sliders and toggles.
4. The preview updates in real time as you change settings.
5. Click **Apply** to process all pages and download the result.

## Options

- **Colorspace (Grayscale toggle)** -- Convert the output to grayscale for a classic black-and-white scan look.
- **Border** -- Add a subtle dark border around the page edges to mimic scanner border artifacts.
- **Rotate** -- Apply a slight rotation (-5 to +5 degrees) to simulate misaligned paper feeding.
- **Rotate Variance** -- Add random variation to the rotation angle so each page tilts slightly differently.
- **Brightness** -- Shift the overall brightness up or down.
- **Contrast** -- Adjust contrast to simulate toner quality variations.
- **Blur** -- Apply Gaussian blur to soften text edges like a low-quality scan.
- **Noise** -- Add random pixel noise to simulate scanner sensor grain. Higher values produce grainier results.
- **Yellowish** -- Add a warm yellow tint to simulate aged or recycled paper.
- **Resolution** -- Set the output DPI. Lower values create a more pixelated, scan-like appearance.
- **Reset** -- Restore all settings to their defaults.

## Features

- Real-time preview that updates as you tweak each parameter
- Per-page random rotation variance for realistic variation
- Ten independently adjustable parameters
- Grayscale mode for authentic black-and-white scan output
- Resolution control from low-DPI fax quality to high-DPI archive quality

## Use Cases

- Making digitally created documents appear to have been scanned and printed
- Simulating physical document aging for historical document recreation
- Testing OCR software against degraded scan quality
- Producing documents that match the visual style of existing scanned archives

## Tips

- Start with subtle values. A noise level of 10-20, a slight 0.5-degree rotation, and minimal blur already produce a convincing scan look.
- Combine grayscale mode with slight yellowing for a "photocopy of a photocopy" effect.
- Lower resolution settings (100-150 DPI) create the most realistic fax-machine appearance.

## Related Tools

- [Invert Colors](./invert-colors)
- [Adjust Colors](./adjust-colors)
- [Background Color](./background-color)
