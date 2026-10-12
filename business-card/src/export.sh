#!/usr/bin/env bash
# Build all deliverables from src/. Requires: python3 (pillow, numpy, scipy, pypdf),
# potrace, ghostscript, node + playwright (Chromium).
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p build print renders
python3 src/build_cards.py
for s in front back; do
  # vector PDF with bleed (96 x 60 mm)
  node src/render.mjs pdf artwork/flowwtech-card-$s-bleed.svg build/$s-rgb.pdf 96 60
  # 300 dpi (bleed) and 600 dpi (trim) PNGs: 96mm = 362.83 css px
  node src/render.mjs png artwork/flowwtech-card-$s-bleed.svg renders/flowwtech-card-$s-bleed-300dpi.png 363 227 3.125
  node src/render.mjs png artwork/flowwtech-card-$s.svg renders/flowwtech-card-$s-600dpi.png 340 204 6.25
done
# Merge, convert to CMYK, outline all text (no font dependencies at the printer)
gs -q -dBATCH -dNOPAUSE -dSAFER -sDEVICE=pdfwrite -dCompatibilityLevel=1.6 \
   -sColorConversionStrategy=CMYK -sProcessColorModel=DeviceCMYK -dNoOutputFonts \
   -dDownsampleColorImages=false -dAutoFilterColorImages=false -sColorImageFilter=FlateEncode \
   -sOutputFile=build/cmyk.pdf build/front-rgb.pdf build/back-rgb.pdf
python3 src/cmyk_remap.py build/cmyk.pdf build/cmyk-press.pdf
python3 src/set_boxes.py build/cmyk-press.pdf print/flowwtech-business-card-print-cmyk.pdf
node src/render.mjs pdf src/proof.html print/flowwtech-business-card-proof.pdf 297 210
node src/render.mjs png src/mockup.html renders/flowwtech-business-card-mockup.png 1600 1100 2
echo done
