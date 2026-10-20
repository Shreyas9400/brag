import React from "react";
import { useCurrentFrame } from "remotion";
import { T } from "../theme";
import { ramp } from "../util";
import type { Layout } from "../layout";

/** Subtle god-rays fanning out from behind the greeting. */
export const LightRays: React.FC<{ L: Layout }> = ({ L }) => {
  const frame = useCurrentFrame();
  const o = ramp(frame, T.rays);
  const R = Math.hypot(L.W, L.H);
  const n = 18;
  return (
    <svg width={L.W} height={L.H} style={{ position: "absolute", opacity: o * 0.5, mixBlendMode: "soft-light" }}>
      <defs>
        <radialGradient id="rayFade" cx={0} cy={0} r={R * 0.55} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFF4CF" stopOpacity="0.95" />
          <stop offset="0.35" stopColor="#F6D98E" stopOpacity="0.55" />
          <stop offset="1" stopColor="#F6D98E" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g transform={`translate(${L.glow.cx} ${L.glow.cy}) rotate(${frame * 0.06})`} fill="url(#rayFade)">
        {Array.from({ length: n }, (_, i) => {
          const a = (Math.PI * 2 * i) / n;
          const w = i % 3 === 0 ? 0.07 : 0.04;
          const p = (t: number) => `${(Math.cos(t) * R).toFixed(1)} ${(Math.sin(t) * R).toFixed(1)}`;
          return <path key={i} d={`M0 0 L${p(a - w)} L${p(a + w)} Z`} />;
        })}
      </g>
    </svg>
  );
};
