"""Replace Ghostscript's generic RGB->CMYK conversions with exact press builds.

1. Render one swatch per palette colour (same Chromium -> Ghostscript path
   as the artwork) to learn what CMYK value each RGB colour became.
2. Rewrite every k/K operator in the print PDF to the palette's target CMYK.
Unmapped vector colours abort the build so nothing slips through.

usage: python3 cmyk_remap.py in.pdf out.pdf
"""
import json, os, re, subprocess, sys
from pypdf import PdfReader, PdfWriter
from pypdf.generic import ContentStream, FloatObject, NameObject

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
B = os.path.join(ROOT, "build")
palette = json.load(open(os.path.join(B, "palette.json")))
# Chromium drops pure-white fills on a white page; pure white maps to no ink.
palette = {c: v for c, v in palette.items() if c.upper() != "#FFFFFF"}

rects = "".join(f'<rect x="{i * 10}" y="0" width="10" height="10" fill="{c}"/>' for i, c in enumerate(palette))
open(f"{B}/swatches.svg", "w").write(
    f'<svg xmlns="http://www.w3.org/2000/svg" width="{len(palette) * 10}mm" height="10mm" '
    f'viewBox="0 0 {len(palette) * 10} 10">{rects}</svg>')
subprocess.run(["node", f"{ROOT}/src/render.mjs", "pdf", f"{B}/swatches.svg", f"{B}/swatches.pdf",
                str(len(palette) * 10), "10"], check=True)
subprocess.run(["gs", "-q", "-dBATCH", "-dNOPAUSE", "-dSAFER", "-sDEVICE=pdfwrite",
                "-sColorConversionStrategy=CMYK", "-sProcessColorModel=DeviceCMYK", "-dCompressPages=false",
                f"-sOutputFile={B}/swatches-cmyk.pdf", f"{B}/swatches.pdf"], check=True)
seq = re.findall(r"((?:[\d.]+ ){4})k", PdfReader(f"{B}/swatches-cmyk.pdf").pages[0].get_contents().get_data().decode("latin1"))
fills = [tuple(round(float(v), 3) for v in s.split()) for s in seq]
assert len(fills) == len(palette), (fills, len(palette))
lookup = {f: tuple(palette[c]) for f, c in zip(fills, palette)}
lookup[(0.0, 0.0, 0.0, 0.0)] = (0.0, 0.0, 0.0, 0.0)

r = PdfReader(sys.argv[1]); w = PdfWriter(clone_from=r)
for page in w.pages:
    cs = ContentStream(page.get_contents(), w)
    for operands, op in cs.operations:
        if op in (b"k", b"K"):
            key = tuple(round(float(v), 3) for v in operands)
            if key not in lookup:
                sys.exit(f"unmapped colour {key} {op}")
            for i, v in enumerate(lookup[key]):
                operands[i] = FloatObject(v)
    page[NameObject("/Contents")] = w._add_object(cs)
w.write(sys.argv[2])
print("remapped", {palette_c: lookup[f] for f, palette_c in zip(fills, palette)})
