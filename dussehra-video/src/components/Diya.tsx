import React from "react";
import { useCurrentFrame } from "remotion";
import { C, T } from "../theme";
import { ramp, wobble } from "../util";

// Unit teardrop flame, base at y=0, tip at y=-1.
const FLAME = "M0 -1 C 0.18 -0.62 0.5 -0.38 0.42 -0.12 C 0.36 0.06 0.16 0.13 0 0.13 C -0.16 0.13 -0.36 0.06 -0.42 -0.12 C -0.5 -0.38 -0.18 -0.62 0 -1 Z";

/** Gentle, organic flicker: slow sway + small height breathing + rare tiny gusts. */
export const Flame: React.FC<{ seed: number; size?: number; delay?: number }> = ({ seed, size = 1, delay = 0 }) => {
  const frame = useCurrentFrame();
  const t = frame * 1.35;
  const lit = ramp(frame, [6 + delay, 34 + delay]);
  const n = wobble(t, seed);
  const jitter = 0.5 * Math.sin(t * 2.9 + seed * 7) + 0.5 * Math.sin(t * 4.3 + seed * 11);
  const hs = (1 + 0.075 * n + 0.025 * jitter) * lit;
  const ws = 1 - 0.04 * n;
  const sway = 4.5 * wobble(t * 0.8, seed + 9);
  const w = 30 * size, h = 78 * size;
  const g = `fl${seed}`;
  return (
    <g>
      <defs>
        <radialGradient id={`${g}halo`}>
          <stop offset="0" stopColor="#FFD27A" stopOpacity="0.75" />
          <stop offset="0.4" stopColor="#FFB851" stopOpacity="0.28" />
          <stop offset="1" stopColor="#FFB851" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${g}o`} x1="0" y1="-1" x2="0" y2="0.13" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFC93C" />
          <stop offset="0.55" stopColor="#FF8E1E" />
          <stop offset="1" stopColor="#E0581A" stopOpacity="0.55" />
        </linearGradient>
        <filter id={`${g}b`} x="-1" y="-1" width="3" height="3">
          <feGaussianBlur stdDeviation={0.9 * size} />
        </filter>
      </defs>
      <circle cy={-h * 0.45} r={h * 1.25} fill={`url(#${g}halo)`} opacity={lit * (0.75 + 0.12 * n)} />
      <g filter={`url(#${g}b)`}>
        <g transform={`skewX(${sway}) scale(${w * ws} ${h * hs})`}>
          <path d={FLAME} fill={`url(#${g}o)`} />
        </g>
      </g>
      <g transform={`skewX(${sway * 0.7}) scale(${w * 0.5 * ws} ${h * 0.56 * hs})`}>
        <path d={FLAME} fill="#FFF7DC" opacity={0.92} />
      </g>
      <ellipse cy={1} rx={2.4 * size} ry={4 * size} fill="#5B2A0E" opacity={lit} />
    </g>
  );
};

/** Clay diya with painted gold rim and a flickering flame. Origin = centre of the rim. */
export const Diya: React.FC<{ x: number; y: number; s: number; seed: number }> = ({ x, y, s, seed }) => {
  const frame = useCurrentFrame();
  const u = ramp(frame, T.scenery);
  const id = `dy${seed}`;
  return (
    <g transform={`translate(${x} ${y + (1 - u) * 24}) scale(${s})`} opacity={u}>
      <defs>
        <linearGradient id={`${id}c`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#B85A2A" />
          <stop offset="0.6" stopColor={C.clay} />
          <stop offset="1" stopColor={C.clayDeep} />
        </linearGradient>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={C.goldDeep} />
          <stop offset="0.5" stopColor={C.goldLight} />
          <stop offset="1" stopColor={C.goldDeep} />
        </linearGradient>
      </defs>
      <ellipse cy={66} rx={82} ry={10} fill="#7A4A1A" opacity={0.16} />
      {/* bowl */}
      <path d="M-84 0 C -78 40 -40 62 0 62 C 40 62 78 40 84 0 Z" fill={`url(#${id}c)`} />
      <path d="M-70 22 C -50 40 50 40 70 22" fill="none" stroke={`url(#${id}g)`} strokeWidth={4} />
      {Array.from({ length: 9 }, (_, i) => {
        const px = -56 + i * 14;
        const py = 33 + 7 * (1 - (px / 60) ** 2);
        return <path key={i} d={`M${px - 4} ${py + 2} L${px} ${py + 10} L${px + 4} ${py + 2} Z`} fill={C.goldLight} opacity={0.8} />;
      })}
      {/* foot */}
      <path d="M-26 58 L-22 70 L22 70 L26 58 Z" fill={C.clayDeep} />
      {/* rim and oil */}
      <ellipse rx={84} ry={15} fill={`url(#${id}g)`} />
      <ellipse rx={74} ry={10} fill="#4A2008" />
      <ellipse rx={60} ry={6} cy={1} fill="#7A3E10" opacity={0.6} />
      {/* spout lip carrying the wick */}
      <path d="M-14 -2 C -8 -10 8 -10 14 -2 Z" fill={`url(#${id}g)`} />
      <g transform="translate(0 -7)">
        <Flame seed={seed} delay={seed * 3} />
      </g>
    </g>
  );
};
