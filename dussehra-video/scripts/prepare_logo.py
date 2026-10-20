# Converts the official logo (black line art on white) to a transparent PNG.
# The logo is pure greyscale, so alpha = 1 - luminance keeps every anti-aliased
# black edge (and the soft shadow under the signature) exactly as drawn.
# Only cropping to the artwork's bounding box is applied: no scaling, no redraw.
# Run: python3 scripts/prepare_logo.py
from PIL import Image
import numpy as np

src = Image.open("public/logo/logo-source.png").convert("L")
g = np.asarray(src).astype(np.float32) / 255.0
ys, xs = np.where(g < 0.98)
pad = 12
x0, x1 = max(0, xs.min() - pad), min(g.shape[1], xs.max() + pad + 1)
y0, y1 = max(0, ys.min() - pad), min(g.shape[0], ys.max() + pad + 1)
crop = g[y0:y1, x0:x1]
alpha = np.clip((1.0 - crop) * 255.0 + 0.5, 0, 255).astype(np.uint8)
rgba = np.zeros((*crop.shape, 4), np.uint8)
rgba[..., 3] = alpha  # colour stays pure black, as in the original
Image.fromarray(rgba, "RGBA").save("public/logo/logo-transparent.png")
print("logo-transparent.png", rgba.shape[1], "x", rgba.shape[0])
