"""Vectorise the supplied FlowwTech logo PNG without altering its shapes.

Outputs (in ../assets/):
  logo-layers.json   potrace paths (in source-pixel coordinates) for
                     mark silhouette, black wordmark, teal flat elements
  mark-fill.png      the F mark's original gradient pixels, colour-extended
                     past the edge so it can be clipped by the vector outline
"""
import json, os, re, subprocess, tempfile, base64
import numpy as np
from PIL import Image
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, "..", "assets")
SRC = os.path.join(ASSETS, "flowwtech-logo-source.png")
UP = 4  # upsample factor before tracing -> smoother curves

im = np.asarray(Image.open(SRC).convert("RGB")).astype(float)
H, W, _ = im.shape
r, g, b = im[..., 0], im[..., 1], im[..., 2]

# --- ink maps (0..1) -------------------------------------------------------
teal_a = np.clip((g - r) / 123.0, 0, 1)                    # flat teal over white
black_a = np.clip(((255 - im.mean(2)) - teal_a * 174) / 255.0, 0, 1)
mark_a = np.clip((255 - r) / 235.0, 0, 1)                  # mark: red channel is low everywhere

rows = np.arange(H)[:, None]
mark_a = np.where(rows < 720, mark_a, 0)
black_a = np.where(rows >= 720, black_a, 0)
teal_a = np.where(rows >= 720, teal_a, 0)


def trace(alpha):
    big = Image.fromarray((alpha * 255).astype(np.uint8)).resize((W * UP, H * UP), Image.BICUBIC)
    bw = (np.asarray(big) >= 128)
    with tempfile.TemporaryDirectory() as td:
        pbm = os.path.join(td, "in.pbm")
        Image.fromarray(np.where(bw, 0, 255).astype(np.uint8)).convert("1").save(pbm)
        out = os.path.join(td, "out.svg")
        subprocess.run(["potrace", pbm, "-s", "-o", out, "-t", "8", "-a", "1.0",
                        "-O", "0.2", "-u", "100", "--flat"], check=True)
        svg = open(out).read()
    m = re.search(r'<g transform="([^"]+)"[^>]*>(.*?)</g>', svg, re.S)
    # potrace output coords: translate(0,H*UP) scale(0.01,-0.01) with -u 100
    d = " ".join(re.findall(r'd="([^"]+)"', m.group(2)))
    # express everything in source-pixel units
    s = 0.01 / UP
    return {"d": d, "transform": f"translate(0,{H}) scale({s},{-s})"}

layers = {"size": [W, H],
          "mark": trace(mark_a),
          "wordmark": trace(black_a),
          "teal": trace(teal_a)}

# --- colour-extended mark fill ---------------------------------------------
x0, y0, x1, y1 = 440, 236, 884, 696
crop = im[y0:y1, x0:x1]
a = mark_a[y0:y1, x0:x1]
solid = ndimage.binary_erosion(a > 0.5, iterations=3)
idx = ndimage.distance_transform_edt(~solid, return_distances=False, return_indices=True)
filled = crop[idx[0], idx[1]]
Image.fromarray(filled.astype(np.uint8)).save(os.path.join(ASSETS, "mark-fill.png"))
layers["markFill"] = {"x": x0, "y": y0, "w": x1 - x0, "h": y1 - y0}

json.dump(layers, open(os.path.join(ASSETS, "logo-layers.json"), "w"))
print({k: (len(v["d"]) if isinstance(v, dict) and "d" in v else v) for k, v in layers.items()})
