import { Easing, interpolate } from "remotion";

const soft = Easing.bezier(0.25, 0.1, 0.25, 1);

/** 0→1 over [a, b] with a soft ease, clamped. */
export const ramp = (frame: number, [a, b]: readonly [number, number], ease = soft) =>
  interpolate(frame, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });

export const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

/** Smooth, deterministic pseudo-noise in roughly [-1, 1] (sum of incommensurate sines). */
export const wobble = (t: number, seed: number) =>
  0.5 * Math.sin(t * 0.19 + seed * 1.7) + 0.3 * Math.sin(t * 0.47 + seed * 3.1) + 0.2 * Math.sin(t * 1.13 + seed * 5.3);

type Pt = [number, number];

/** Filled, tapered ribbon along a cubic Bézier — used for the bow limbs. */
export function taperedCubic(p0: Pt, p1: Pt, p2: Pt, p3: Pt, w0: number, w1: number, n = 48) {
  const L: Pt[] = [];
  const R: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, m = 1 - t;
    const x = m * m * m * p0[0] + 3 * m * m * t * p1[0] + 3 * m * t * t * p2[0] + t * t * t * p3[0];
    const y = m * m * m * p0[1] + 3 * m * m * t * p1[1] + 3 * m * t * t * p2[1] + t * t * t * p3[1];
    const dx = 3 * m * m * (p1[0] - p0[0]) + 6 * m * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]);
    const dy = 3 * m * m * (p1[1] - p0[1]) + 6 * m * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]);
    const len = Math.hypot(dx, dy) || 1;
    const w = lerp(w0, w1, t) / 2;
    L.push([x - (dy / len) * w, y + (dx / len) * w]);
    R.push([x + (dy / len) * w, y - (dx / len) * w]);
  }
  const f = (p: Pt) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`;
  return `M${L.map(f).join(" L")} L${R.reverse().map(f).join(" L")} Z`;
}
