#!/usr/bin/env bash
# Regenerate the Pixel PDF logo-derived PNG assets (favicons + social cards).
# Source artwork: public/images/pixelpdf-logo.png  (the official new wordmark)
#                 public/images/pixelpdf-icon.png  (the pixel-document mark)
# Requires ImageMagick (`convert`/`identify`). Safe to re-run.
set -euo pipefail
cd "$(dirname "$0")/.."

BG='#F5F7FB'
INK='#2B3446'
MUTED='#5F6D87'
LOGO=public/images/pixelpdf-logo.png
ICON=public/images/pixelpdf-icon.png

# --- PWA / favicon raster icons ------------------------------------------------
for sz in 192 512 180 64; do
  pad=$((sz * 78 / 100))
  convert -size "${sz}x${sz}" "xc:${BG}" \
    \( "$ICON" -resize "${pad}x${pad}" \) -gravity center -composite \
    "PNG32:/tmp/pixelpdf-icon-${sz}.png"
done
cp /tmp/pixelpdf-icon-192.png public/images/favicon-192x192.png
cp /tmp/pixelpdf-icon-512.png public/images/favicon-512x512.png
cp /tmp/pixelpdf-icon-180.png public/images/apple-touch-icon.png
cp /tmp/pixelpdf-icon-64.png  public/images/favicon.png
convert /tmp/pixelpdf-icon-64.png -define icon:auto-resize=64,48,32,16 public/favicon.ico

# --- Social / Open Graph cards -------------------------------------------------
# usage: make_card <outfile> <title> <subtitle>
make_card() {
  local out="$1" title="$2" subtitle="$3"
  convert -size 1040x8 gradient:'#0E8BF5-#3A2BB0' /tmp/pixelpdf-strip.png
  convert -size 1200x630 "xc:${BG}" \
    \( "$ICON" -resize 300x300 -alpha set -channel A -evaluate multiply 0.07 +channel \) \
      -gravity southeast -geometry +60+60 -composite \
    \( "$LOGO" -resize 520x \) -gravity northwest -geometry +80+64 -composite \
    /tmp/pixelpdf-strip.png -gravity northwest -geometry +80+220 -composite \
    -font DejaVu-Sans-Bold -pointsize 66 -fill "$INK" \
      -annotate +78+345 "$title" \
    -font DejaVu-Sans -pointsize 27 -fill "$MUTED" \
      -annotate +80+485 "$subtitle" \
    -font DejaVu-Sans-Bold -pointsize 22 -fill '#2567E8' \
      -annotate +80+575 '100% IN YOUR BROWSER   ·   NO UPLOADS   ·   ALWAYS FREE' \
    "$out"
}

make_card public/images/og-home.png           'Your PDFs, your device.'   '100+ free PDF tools. Merge, split, compress, convert and edit.'
make_card public/images/twitter-home.png      'Your PDFs, your device.'   '100+ free PDF tools. Merge, split, compress, convert and edit.'
make_card public/images/og-tools.png          'All PDF Tools'             '103 free tools · Converters · Editors · Security · Merge'
make_card public/images/pixelpdf-tools.png    'All PDF Tools'             '103 free tools · Converters · Editors · Security · Merge'
make_card public/images/og-pdf-converter.png  'PDF Converter'             'Convert to and from PDF — locally, with no uploads.'
make_card public/images/og-pdf-editor.png     'PDF Editor'                'Edit, annotate and sign PDFs on your own device.'
make_card public/images/og-pdf-merge-split.png 'Merge & Split PDF'        'Combine files and divide pages in seconds.'
make_card public/images/og-pdf-security.png   'PDF Security'              'Protect, redact, flatten and sign with confidence.'

echo 'Pixel PDF brand assets regenerated.'
