// Per-format placement. Everything else (timing, artwork) is shared.
export type Layout = {
  W: number;
  H: number;
  logo: { x: number; y: number; w: number };
  greeting: { cx: number; top: number; happy: number; dussehra: number; ornament: number };
  message: { cx: number; top: number; size: number; lines: string[] };
  bow: { x: number; y: number; scale: number; rotate: number; travel: number };
  glow: { cx: number; cy: number; r: number };
  garlands: { x: number; len: number; seed: number }[];
  temples: { base: number; scale: number };
  diyas: { x: number; y: number; s: number }[];
  marigolds: { x: number; y: number; s: number; hue: "orange" | "yellow" }[];
};

// The final message, exactly as supplied (line breaks only).
const MSG = "May goodness, health & happiness triumph.";

export const vertical: Layout = {
  W: 1080,
  H: 1920,
  logo: { x: 64, y: 72, w: 372 },
  greeting: { cx: 540, top: 392, happy: 70, dussehra: 132, ornament: 560 },
  message: { cx: 540, top: 1384, size: 66, lines: ["May goodness, health", "& happiness triumph."] },
  bow: { x: 800, y: 1030, scale: 0.92, rotate: 12, travel: 160 },
  glow: { cx: 540, cy: 600, r: 760 },
  garlands: [
    { x: 600, len: 4, seed: 1 },
    { x: 700, len: 6, seed: 2 },
    { x: 800, len: 8, seed: 3 },
    { x: 900, len: 6, seed: 4 },
    { x: 1000, len: 4, seed: 5 },
  ],
  temples: { base: 1772, scale: 1 },
  diyas: [
    { x: 150, y: 1800, s: 0.86 },
    { x: 345, y: 1818, s: 1.0 },
    { x: 540, y: 1826, s: 1.12 },
    { x: 735, y: 1818, s: 1.0 },
    { x: 930, y: 1800, s: 0.86 },
  ],
  marigolds: [
    { x: 40, y: 1858, s: 1.15, hue: "orange" },
    { x: 248, y: 1878, s: 0.9, hue: "yellow" },
    { x: 442, y: 1890, s: 0.95, hue: "orange" },
    { x: 638, y: 1890, s: 0.95, hue: "yellow" },
    { x: 832, y: 1878, s: 0.9, hue: "orange" },
    { x: 1040, y: 1858, s: 1.15, hue: "yellow" },
  ],
};

export const landscape: Layout = {
  W: 1920,
  H: 1080,
  logo: { x: 64, y: 54, w: 318 },
  greeting: { cx: 690, top: 214, happy: 58, dussehra: 124, ornament: 520 },
  message: { cx: 680, top: 588, size: 60, lines: [MSG] },
  bow: { x: 1680, y: 600, scale: 0.8, rotate: 6, travel: 100 },
  glow: { cx: 720, cy: 420, r: 860 },
  garlands: [
    { x: 1390, len: 3, seed: 1 },
    { x: 1490, len: 4, seed: 2 },
    { x: 1590, len: 3, seed: 3 },
    { x: 1690, len: 4, seed: 4 },
    { x: 1790, len: 3, seed: 5 },
    { x: 1890, len: 4, seed: 6 },
  ],
  temples: { base: 958, scale: 0.78 },
  diyas: [
    { x: 260, y: 980, s: 0.78 },
    { x: 540, y: 994, s: 0.88 },
    { x: 820, y: 1000, s: 0.96 },
    { x: 1100, y: 1000, s: 0.96 },
    { x: 1380, y: 994, s: 0.88 },
    { x: 1660, y: 980, s: 0.78 },
  ],
  marigolds: [
    { x: 60, y: 1030, s: 1.0, hue: "orange" },
    { x: 400, y: 1052, s: 0.8, hue: "yellow" },
    { x: 680, y: 1060, s: 0.85, hue: "orange" },
    { x: 960, y: 1062, s: 0.9, hue: "yellow" },
    { x: 1240, y: 1060, s: 0.85, hue: "orange" },
    { x: 1520, y: 1052, s: 0.8, hue: "yellow" },
    { x: 1860, y: 1030, s: 1.0, hue: "orange" },
  ],
};
