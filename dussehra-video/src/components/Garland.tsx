import React from "react";
import { useCurrentFrame } from "remotion";
import { C, T } from "../theme";
import { ramp } from "../util";
import type { Layout } from "../layout";
import { Marigold, MarigoldDefs } from "./Marigold";

const BALL = 19;
const STEP = 33;

/** One hanging strand of marigolds ending in a small brass bell. Sways from its top anchor. */
const Strand: React.FC<{ x: number; len: number; seed: number }> = ({ x, len, seed }) => {
  const frame = useCurrentFrame();
  const sway = 1.3 * Math.sin(frame / 38 + seed * 1.9) + 0.4 * Math.sin(frame / 17 + seed);
  return (
    <g transform={`translate(${x} 0) rotate(${sway})`}>
      <line x1={0} y1={0} x2={0} y2={len * STEP + 18} stroke={C.goldDeep} strokeWidth={1.6} />
      {Array.from({ length: len }, (_, i) => {
        const y = 22 + i * STEP;
        return (
          <g key={i} transform={`translate(0 ${y})`}>
            {i % 3 === 1 && (
              <g fill={C.leaf}>
                <path d="M0 0 C 10 -12 26 -10 32 -2 C 24 6 10 6 0 0 Z" />
                <path d="M0 0 C -10 -12 -26 -10 -32 -2 C -24 6 -10 6 0 0 Z" opacity={0.85} />
              </g>
            )}
            <Marigold r={BALL} hue={(i + seed) % 2 ? "orange" : "yellow"} rot={i * 37 + seed * 11} />
          </g>
        );
      })}
      {/* bell */}
      <g transform={`translate(0 ${22 + len * STEP - 6})`}>
        <path d="M-11 18 C -11 4 -7 -2 0 -2 C 7 -2 11 4 11 18 Z" fill={C.gold} stroke={C.goldDeep} strokeWidth={1.2} />
        <rect x={-13} y={17} width={26} height={4} rx={2} fill={C.goldDeep} />
        <circle cy={24} r={3} fill={C.goldDeep} />
      </g>
    </g>
  );
};

/** Toran: scalloped swags of small marigolds across the top with strands hanging below. */
export const Garland: React.FC<{ L: Layout }> = ({ L }) => {
  const frame = useCurrentFrame();
  const u = ramp(frame, T.scenery);
  const xs = L.garlands.map((g) => g.x);
  const swags: React.ReactNode[] = [];
  for (let i = 0; i < xs.length - 1; i++) {
    const a = xs[i], b = xs[i + 1];
    if (b - a > 160) continue; // only between neighbouring strands
    const n = Math.round((b - a) / 22);
    for (let k = 1; k < n; k++) {
      const t = k / n;
      const y = 6 + 34 * 4 * t * (1 - t);
      swags.push(
        <g key={`${i}-${k}`} transform={`translate(${a + (b - a) * t} ${y})`}>
          <Marigold r={12} hue={k % 2 ? "orange" : "yellow"} rot={k * 41} />
        </g>,
      );
    }
  }
  return (
    <svg width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <MarigoldDefs />
      <g opacity={u} transform={`translate(0 ${(1 - u) * -50})`}>
        {L.garlands.map((g) => (
          <Strand key={g.x} {...g} />
        ))}
        {swags}
        {L.garlands.map((g) => (
          <circle key={`k${g.x}`} cx={g.x} cy={4} r={7} fill={C.gold} stroke={C.goldDeep} strokeWidth={1.2} />
        ))}
      </g>
    </svg>
  );
};
