# FlowwTech Industries — Business Card

Double-sided horizontal card, 90 × 54 mm (Indian standard), 3 mm bleed, 4 mm safe zone.

| | |
|---|---|
| **Front** | Deep black, reversed FlowwTech logo (mark + FLOWW + TECH), company name, tagline “Software Built Around Your Business.” |
| **Back** | White, mark + company name, positioning line, services, phone and website |

## Files

| Path | What it is |
|---|---|
| `print/flowwtech-business-card-print-cmyk.pdf` | **Send this to the printer.** 2 pages (1 = front, 2 = back), 96 × 60 mm with bleed, TrimBox 90 × 54 mm, CMYK, all text converted to outlines, logo vector with its original gradient pixels at 900+ dpi |
| `print/flowwtech-business-card-proof.pdf` | A4 proof at 100% scale with crop marks, trim line and safe zone |
| `renders/flowwtech-card-{front,back}-600dpi.png` | Trimmed previews for screens and approval |
| `renders/flowwtech-card-{front,back}-bleed-300dpi.png` | 300 dpi raster with bleed (1134 × 709 px), for printers that only take images |
| `renders/flowwtech-business-card-mockup.png` | Mockup showing both sides (3200 × 2200 px) |
| `artwork/flowwtech-card-{front,back}.svg` | **Editable** artwork with live Inter text (trim size). Opens in Illustrator, Figma, Inkscape or a browser |
| `artwork/flowwtech-card-{front,back}-bleed.svg` | The same artwork with bleed |
| `src/` | Source that rebuilds everything above |

## Colour (press builds)

Applied exactly in the print PDF (`src/cmyk_remap.py` rewrites every vector colour):

| Use | Screen | CMYK |
|---|---|---|
| Front background (rich black, total ink 240%) | `#0B0E0F` | C60 M40 Y40 K100 |
| Brand sea green (on white) | `#06816E` | C86 M22 Y63 K8 |
| Sea green reversed on black | `#22B89A` | C74 M0 Y52 K0 |
| Primary text | `#111516` | K100 |
| Services text | `#2B3332` | K88 |
| Secondary text | `#4F5A57` | K72 |
| Tagline on black | `#B3BDBA` | K30 |
| Divider hairline | `#DDE2E0` | K14 |
| White text / back background | `#F3F6F5` / `#F8F9F7` | No ink (paper white) |

Small text uses black ink only (K) so it stays sharp even if the press plates are slightly misregistered. The F mark keeps its original gradient. The highest total ink on the card is about 270%, in the mark's darkest shadow.

**Suggested stock:** 350–400 gsm matte or soft-touch laminated board. Optional spot UV or foil on the front logo mark.

## Logo handling

The supplied PNG (`assets/flowwtech-logo-source.png`) was traced with potrace at 4× upsampling, without redrawing:
- The FLOWW wordmark and the teal TECH elements became solid vector shapes.
- The F mark keeps its original gradient pixels, clipped by its traced vector outline so the edges stay sharp.

The trace matches the original to a mean pixel difference of about 1.4/255. On the black front, the wordmark is reversed to white and the teal parts use a lighter sea green so they stay legible.

## Type

Inter (SemiBold, Bold, Medium, Regular). Sizes at print: company name on the back 7.8 pt, contact details 7.8 pt, services 6.2 pt, tagline 6.6 pt, labels 4.6 pt caps.

## Editing & rebuilding

Edit text, sizes or positions in `src/build_cards.py`. All coordinates there are in mm. Then run:

```bash
pip install pillow numpy scipy pypdf      # + apt: potrace ghostscript; node + playwright
python3 src/trace_logo.py                 # only if the logo source changes
./src/export.sh                           # rebuilds artwork/, print/, renders/
node src/check_safe.mjs                   # verifies all text/logo sits inside the safe zone
```

If you edit an SVG by hand in a design tool, keep content inside the dotted safe zone shown in the proof. Before export, outline the text or make sure Inter is installed.
