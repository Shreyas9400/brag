import React from "react";

const PALETTE = {
  orange: ["#C9520A", "#E26C0E", "#EE8418", "#F59C28", "#F9B444"],
  yellow: ["#D98E08", "#EDA810", "#F4BC1E", "#F8CC36", "#FBDB5A"],
};

/** Layered ruffled marigold, drawn from circles. Origin = flower centre, radius r. */
export const Marigold: React.FC<{ r: number; hue?: "orange" | "yellow"; rot?: number; leaves?: boolean }> = ({
  r,
  hue = "orange",
  rot = 0,
  leaves,
}) => {
  const cols = PALETTE[hue];
  return (
    <g transform={`rotate(${rot})`}>
      {leaves && (
        <g fill="#4F7A2A">
          <path d={`M0 0 C ${r * 0.6} ${-r * 0.5} ${r * 1.5} ${-r * 0.3} ${r * 1.7} ${r * 0.1} C ${r * 1.2} ${r * 0.4} ${r * 0.5} ${r * 0.35} 0 0 Z`} />
          <path d={`M0 0 C ${-r * 0.6} ${-r * 0.6} ${-r * 1.4} ${-r * 0.5} ${-r * 1.6} ${-r * 0.1} C ${-r * 1.1} ${r * 0.3} ${-r * 0.5} ${r * 0.3} 0 0 Z`} opacity={0.85} />
        </g>
      )}
      {cols.map((c, k) => {
        const rk = r * (1 - k * 0.19);
        const n = 18 - k * 2;
        return (
          <g key={k} fill={c} stroke="rgba(120,40,0,0.28)" strokeWidth={Math.max(0.6, r * 0.025)}>
            {Array.from({ length: n }, (_, i) => {
              const a = ((360 / n) * i + k * 9) * (Math.PI / 180);
              return <circle key={i} cx={Math.cos(a) * rk * 0.64} cy={Math.sin(a) * rk * 0.64} r={rk * 0.37} />;
            })}
          </g>
        );
      })}
      <circle r={r * 0.2} fill={cols[4]} />
      <circle r={r * 0.09} fill={cols[1]} opacity={0.8} />
      {/* soft volume shading */}
      <circle r={r * 1.0} fill="url(#marigoldShade)" />
    </g>
  );
};

/** Shared gradient for marigold shading — render once per SVG. */
export const MarigoldDefs: React.FC = () => (
  <defs>
    <radialGradient id="marigoldShade" cx="0.38" cy="0.32" r="0.75">
      <stop offset="0" stopColor="#FFF4C0" stopOpacity="0.32" />
      <stop offset="0.55" stopColor="#FFF4C0" stopOpacity="0" />
      <stop offset="1" stopColor="#5A1E00" stopOpacity="0.32" />
    </radialGradient>
  </defs>
);
