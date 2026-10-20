import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, T } from "../theme";
import { ramp } from "../util";
import type { Layout } from "../layout";

/** Warm ivory base. Also reused as the closing fade so the last frame matches the first. */
export const IvoryBase: React.FC<{ L: Layout; style?: React.CSSProperties }> = ({ L, style }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse ${L.W * 0.9}px ${L.H * 0.75}px at ${L.glow.cx}px ${L.glow.cy}px, ${C.ivory} 0%, #FAF0DD 55%, ${C.ivoryWarm} 100%)`,
      ...style,
    }}
  />
);

const Vignette: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse 78% 70% at 50% 46%, rgba(0,0,0,0) 60%, rgba(176,118,40,0.16) 100%)" }} />
);

/** Exactly what frame 0 shows; used for the closing fade so the video loops cleanly. */
export const OpeningFrame: React.FC<{ L: Layout; style?: React.CSSProperties }> = ({ L, style }) => (
  <AbsoluteFill style={style}>
    <IvoryBase L={L} />
    <Vignette />
  </AbsoluteFill>
);

/** Mandala rosette drawn procedurally, very faint gold. */
const Rosette: React.FC<{ r: number }> = ({ r }) => {
  const petals = (n: number, rad: number, len: number, w: number) =>
    Array.from({ length: n }, (_, i) => (
      <ellipse key={i} cx={0} cy={-rad} rx={w} ry={len} transform={`rotate(${(360 / n) * i})`} />
    ));
  return (
    <g fill="none" stroke={C.gold} strokeWidth={2}>
      <circle r={r * 0.98} />
      <circle r={r * 0.93} strokeDasharray="2 10" strokeWidth={4} strokeLinecap="round" />
      <circle r={r * 0.72} />
      <circle r={r * 0.42} />
      {petals(24, r * 0.82, r * 0.1, r * 0.035)}
      {petals(16, r * 0.57, r * 0.14, r * 0.05)}
      {petals(12, r * 0.28, r * 0.13, r * 0.055)}
      <circle r={r * 0.1} />
    </g>
  );
};

export const Background: React.FC<{ L: Layout }> = ({ L }) => {
  const frame = useCurrentFrame();
  const glow = ramp(frame, T.bgGlow);
  const breathe = 1 + 0.035 * Math.sin(frame / 22);
  const ros = Math.max(L.W, L.H) * 0.36;
  return (
    <AbsoluteFill>
      <IvoryBase L={L} />
      {/* soft golden glow behind the greeting */}
      <AbsoluteFill
        style={{
          opacity: glow * 0.9,
          background: `radial-gradient(circle ${L.glow.r * breathe}px at ${L.glow.cx}px ${L.glow.cy}px, rgba(246,214,140,0.62) 0%, rgba(246,214,140,0.22) 45%, rgba(246,214,140,0) 75%)`,
        }}
      />
      <svg width={L.W} height={L.H} style={{ position: "absolute", opacity: 0.075 * glow }}>
        <g transform={`translate(${L.glow.cx} ${L.glow.cy}) rotate(${frame * 0.04})`}>
          <Rosette r={ros} />
        </g>
      </svg>
      {/* warm vignette */}
      <Vignette />
    </AbsoluteFill>
  );
};
