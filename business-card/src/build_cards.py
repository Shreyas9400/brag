"""Generate the FlowwTech Industries business card artwork as SVG.

All geometry is in millimetres. Each SVG is 96 x 60 mm (90 x 54 mm trim +
3 mm bleed on every side); card content is placed in trim coordinates via
translate(3,3). A second "trim" SVG per side crops the viewBox to 90 x 54 mm.

Run:  python3 src/build_cards.py   (after src/trace_logo.py)
"""
import base64, json, math, os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
ASSETS = os.path.join(ROOT, "assets")
OUT = os.path.join(ROOT, "artwork")
os.makedirs(OUT, exist_ok=True)
os.makedirs(os.path.join(ROOT, "build"), exist_ok=True)

TRIM_W, TRIM_H, BLEED, SAFE = 90.0, 54.0, 3.0, 4.0
PT = 0.352778  # mm per point

# ---- palette: RGB for screen, CMYK for press (applied by src/cmyk_remap.py) -
# Small text uses K-only builds to avoid registration blur; front uses a
# balanced rich black (C60 M40 Y40 K100, TAC 240%).
PALETTE = {
    "INK":        ("#0B0E0F", (0.60, 0.40, 0.40, 1.00)),  # front background
    "CHARCOAL":   ("#111516", (0.00, 0.00, 0.00, 1.00)),  # primary text on light
    "BODY":       ("#2B3332", (0.00, 0.00, 0.00, 0.88)),  # services text
    "SLATE":      ("#4F5A57", (0.00, 0.00, 0.00, 0.72)),  # secondary text
    "RULE":       ("#DDE2E0", (0.00, 0.00, 0.00, 0.14)),  # hairline divider
    "PAPER":      ("#F8F9F7", (0.00, 0.00, 0.00, 0.00)),  # back = uncoated white stock
    "TEAL":       ("#06816E", (0.86, 0.22, 0.63, 0.08)),  # brand sea green
    "TEAL_LIGHT": ("#22B89A", (0.74, 0.00, 0.52, 0.00)),  # sea green reversed on black
    "WHITE":      ("#F3F6F5", (0.00, 0.00, 0.00, 0.00)),  # paper white knock-out
    "DOT":        ("#FFFFFF", (0.00, 0.00, 0.00, 0.00)),  # motif dots on black
    "MIST":       ("#B3BDBA", (0.00, 0.00, 0.00, 0.30)),  # tagline on black
}
globals().update({k: v[0] for k, v in PALETTE.items()})

FONT = "Inter, Manrope, 'Helvetica Neue', Arial, sans-serif"

L = json.load(open(os.path.join(ASSETS, "logo-layers.json")))
MARK_FILL = base64.b64encode(open(os.path.join(ASSETS, "mark-fill.png"), "rb").read()).decode()

# Logo source-pixel bounding boxes
LOCKUP_BOX = (145, 252, 1112, 980)   # x0, y0, x1, y1 : mark + FLOWW + TECH
MARK_BOX = (456, 252, 868, 680)


def defs_logo():
    m = L["mark"]
    return f'<clipPath id="markClip"><path transform="{m["transform"]}" d="{m["d"]}"/></clipPath>'


def logo(box, x, y, height, wordmark=CHARCOAL, teal=TEAL, parts=("mark", "wordmark", "teal")):
    """Place the logo (or a part of it) so `box` maps to (x, y) at `height` mm."""
    x0, y0, x1, y1 = box
    s = height / (y1 - y0)
    mf = L["markFill"]
    out = [f'<g transform="translate({x:.4f},{y:.4f}) scale({s:.6f}) translate({-x0},{-y0})">']
    if "mark" in parts:
        out.append(f'<image clip-path="url(#markClip)" href="data:image/png;base64,{MARK_FILL}" '
                   f'x="{mf["x"]}" y="{mf["y"]}" width="{mf["w"]}" height="{mf["h"]}" '
                   f'preserveAspectRatio="none"/>')
    if "wordmark" in parts:
        w = L["wordmark"]
        out.append(f'<path fill="{wordmark}" transform="{w["transform"]}" d="{w["d"]}"/>')
    if "teal" in parts:
        t = L["teal"]
        out.append(f'<path fill="{teal}" transform="{t["transform"]}" d="{t["d"]}"/>')
    out.append("</g>")
    return "\n".join(out), (x1 - x0) * s


def text(x, y, s, size_pt, fill, weight=400, spacing=0.0, anchor="start", extra=""):
    ls = f' letter-spacing="{spacing * size_pt * PT:.4f}"' if spacing else ""
    return (f'<text x="{x:.3f}" y="{y:.3f}" font-family="{FONT}" font-size="{size_pt * PT:.4f}" '
            f'font-weight="{weight}" fill="{fill}" text-anchor="{anchor}"{ls}{extra}>{s}</text>')


def network(x0, y0, x1, y1, pitch, origin, dot, reach, max_op, links, link_color, link_w):
    """Dot lattice fading out from `origin`, with a few connected nodes.

    links: list of polylines given in lattice cells relative to origin cell.
    """
    ox, oy = origin
    g = []
    nx0, nx1 = math.floor((x0 - ox) / pitch), math.ceil((x1 - ox) / pitch)
    ny0, ny1 = math.floor((y0 - oy) / pitch), math.ceil((y1 - oy) / pitch)
    for i in range(nx0, nx1 + 1):
        for j in range(ny0, ny1 + 1):
            px, py = ox + i * pitch, oy + j * pitch
            dist = math.hypot(px - ox, py - oy)
            op = max_op * max(0.0, 1 - dist / reach) ** 1.6
            if op > 0.01:
                g.append(f'<circle cx="{px:.3f}" cy="{py:.3f}" r="{dot}" fill-opacity="{op:.3f}"/>')
    lines = []
    for poly, op in links:
        pts = [(ox + i * pitch, oy + j * pitch) for i, j in poly]
        d = "M" + " L".join(f"{px:.3f},{py:.3f}" for px, py in pts)
        lines.append(f'<path d="{d}" fill="none" stroke="{link_color}" stroke-width="{link_w}" '
                     f'stroke-opacity="{op}" stroke-linecap="round" stroke-linejoin="round"/>')
        ex, ey = pts[-1]
        lines.append(f'<circle cx="{ex:.3f}" cy="{ey:.3f}" r="{link_w * 2.6:.3f}" fill="none" '
                     f'stroke="{link_color}" stroke-width="{link_w}" stroke-opacity="{op}"/>')
        lines.append(f'<circle cx="{ex:.3f}" cy="{ey:.3f}" r="{link_w * 1.1:.3f}" fill="{link_color}" '
                     f'fill-opacity="{op}"/>')
    return g, lines


def wrap(body, defs, bg, title):
    W, H = TRIM_W + 2 * BLEED, TRIM_H + 2 * BLEED
    full = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}mm" height="{H}mm" viewBox="0 0 {W} {H}">
<title>{title}</title>
<defs>{defs}</defs>
<rect width="{W}" height="{H}" fill="{bg}"/>
<g id="card" transform="translate({BLEED},{BLEED})">
{body}
</g>
</svg>
'''
    trim = full.replace(f'width="{W}mm" height="{H}mm" viewBox="0 0 {W} {H}"',
                        f'width="{TRIM_W}mm" height="{TRIM_H}mm" viewBox="{BLEED} {BLEED} {TRIM_W} {TRIM_H}"')
    return full, trim


# ============================================================================
# FRONT
# ============================================================================
def front():
    cx = TRIM_W / 2
    defs = [defs_logo(),
            ]
    body = []

    dots, links = network(52, 28, TRIM_W + BLEED, TRIM_H + BLEED, pitch=2.25,
                          origin=(TRIM_W + 0.4, TRIM_H + 0.6), dot=0.13, reach=32, max_op=0.22,
                          links=[([(1, -3), (-2, -3), (-4, -5), (-7, -5)], 0.95),
                                 ([(1, -1), (-3, -1), (-5, -3)], 0.55)],
                          link_color=TEAL_LIGHT, link_w=0.14)
    body.append(f'<g id="motif" fill="{DOT}">{"".join(dots)}</g><g id="motif-links">{"".join(links)}</g>')

    lockup_h = 19.0
    (x0, y0, x1, y1) = LOCKUP_BOX
    lockup_w = (x1 - x0) * lockup_h / (y1 - y0)
    svg, _ = logo(LOCKUP_BOX, cx - lockup_w / 2, 9.6, lockup_h, wordmark=WHITE, teal=TEAL_LIGHT)
    body.append(f'<g id="logo">{svg}</g>')

    body.append(text(cx, 37.4, "FLOWWTECH INDUSTRIES", 5.4, WHITE, weight=600, spacing=0.34,
                     anchor="middle", extra=' id="company"'))
    body.append(f'<rect x="{cx - 2.2:.3f}" y="39.55" width="4.4" height="0.22" fill="{TEAL_LIGHT}"/>')
    body.append(text(cx, 43.9, "Software Built Around Your Business.", 6.6, MIST, weight=400,
                     spacing=0.01, anchor="middle", extra=' id="tagline"'))
    return wrap("\n".join(body), "".join(defs), INK, "FlowwTech Industries — business card front")


# ============================================================================
# BACK
# ============================================================================
def back():
    m = 7.0  # left content margin
    defs = [defs_logo()]
    body = []

    dots, links = network(48, -BLEED, TRIM_W + BLEED, 26, pitch=2.25,
                          origin=(TRIM_W + 0.4, -0.6), dot=0.13, reach=30, max_op=0.34,
                          links=[([(1, 3), (-2, 3), (-4, 5), (-6, 5)], 0.9)],
                          link_color=TEAL, link_w=0.14)
    body.append(f'<g id="motif" fill="{TEAL}">{"".join(dots)}</g><g id="motif-links">{"".join(links)}</g>')

    # identity block: mark + name + positioning line
    mark_h = 8.6
    svg, mark_w = logo(MARK_BOX, m, 7.3, mark_h, parts=("mark",))
    body.append(f'<g id="mark">{svg}</g>')
    tx = m + mark_w + 3.0
    body.append(text(tx, 11.05, "FLOWWTECH INDUSTRIES", 7.8, CHARCOAL, weight=700, spacing=0.12,
                     extra=' id="company"'))
    body.append(text(tx, 15.25, "Custom Business Software &amp; Automation Solutions", 5.8, SLATE,
                     weight=400, spacing=0.01, extra=' id="positioning"'))

    # services
    sep = f'<tspan fill="{TEAL}" font-weight="300" dx="1.1">|</tspan><tspan dx="1.1">'
    def services(y, items, idv):
        inner = (f"</tspan>{sep}").join(items)
        return (f'<text id="{idv}" x="{m}" y="{y}" font-family="{FONT}" font-size="{6.2 * PT:.4f}" '
                f'font-weight="400" fill="{BODY}" letter-spacing="{0.01 * 6.2 * PT:.4f}"><tspan>{inner}</tspan></text>')
    body.append(services(25.9, ["Healthcare Solutions", "Operations Management"], "services-1"))
    body.append(services(30.1, ["Web Applications", "Mobile Apps", "Cloud &amp; AI Solutions"], "services-2"))

    # contact
    col2 = 39.0
    body.append(f'<line x1="{m}" y1="35.6" x2="{TRIM_W - m}" y2="35.6" stroke="{RULE}" stroke-width="0.12"/>')
    for x, label, value, idv in [(m, "PHONE", "+91 83699 08157", "phone"),
                                 (col2, "WEB", "www.flowwtechindustries.com", "web")]:
        body.append(text(x, 41.3, label, 4.6, TEAL, weight=600, spacing=0.24))
        body.append(text(x, 46.0, value, 7.8, CHARCOAL, weight=500, spacing=0.0, extra=f' id="{idv}"'))
    return wrap("\n".join(body), "".join(defs), PAPER, "FlowwTech Industries — business card back")


json.dump({v[0]: v[1] for v in PALETTE.values()}, open(os.path.join(ROOT, "build", "palette.json"), "w"), indent=1)
for name, (full, trim) in {"front": front(), "back": back()}.items():
    open(os.path.join(OUT, f"flowwtech-card-{name}-bleed.svg"), "w").write(full)
    open(os.path.join(OUT, f"flowwtech-card-{name}.svg"), "w").write(trim)
print("wrote", sorted(os.listdir(OUT)))
