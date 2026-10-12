"""Set MediaBox/BleedBox = 96x60 mm and TrimBox = 90x54 mm on every page."""
import sys
from pypdf import PdfReader, PdfWriter
from pypdf.generic import RectangleObject
MM = 72 / 25.4
r = PdfReader(sys.argv[1]); w = PdfWriter()
for page in r.pages:
    full = RectangleObject([0, 0, 96 * MM, 60 * MM])
    page.mediabox = full; page.cropbox = full; page.bleedbox = full
    page.trimbox = RectangleObject([3 * MM, 3 * MM, 93 * MM, 57 * MM])
    w.add_page(page)
w.add_metadata({"/Title": "FlowwTech Industries — Business Card (print, CMYK, 3 mm bleed)"})
w.write(sys.argv[2])
