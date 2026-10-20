import React from "react";
import { useCurrentFrame } from "remotion";
import { DURATION, T } from "../theme";
import { lerp, ramp } from "../util";
import type { Layout } from "../layout";

/** Curvilinear north-Indian shikhara with amalaka, kalash and pennant. */
const Shikhara = ({ x, base, w, h }: { x: number; base: number; w: number; h: number }) => {
  const top = base - h;
  const hw = w / 2;
  return (
    <g>
      <path
        d={`M${x - hw} ${base} L${x - hw} ${base - h * 0.28} L${x - hw * 0.86} ${base - h * 0.3}
            C ${x - hw * 0.86} ${base - h * 0.62} ${x - hw * 0.42} ${top + h * 0.14} ${x - hw * 0.2} ${top + h * 0.1}
            L ${x + hw * 0.2} ${top + h * 0.1}
            C ${x + hw * 0.42} ${top + h * 0.14} ${x + hw * 0.86} ${base - h * 0.62} ${x + hw * 0.86} ${base - h * 0.3}
            L${x + hw} ${base - h * 0.28} L${x + hw} ${base} Z`}
      />
      <ellipse cx={x} cy={top + h * 0.08} rx={w * 0.17} ry={h * 0.03} />
      <path d={`M${x - w * 0.06} ${top + h * 0.06} C ${x - w * 0.08} ${top + h * 0.0} ${x + w * 0.08} ${top + h * 0.0} ${x + w * 0.06} ${top + h * 0.06} Z`} />
      <rect x={x - 1.5} y={top - h * 0.1} width={3} height={h * 0.12} />
      <path d={`M${x + 1.5} ${top - h * 0.1} L${x + w * 0.22} ${top - h * 0.075} L${x + 1.5} ${top - h * 0.05} Z`} />
    </g>
  );
};

/** Pillared hall with stepped pyramidal roof. */
const Mandapa = ({ x, base, w, h }: { x: number; base: number; w: number; h: number }) => {
  const hw = w / 2;
  const wall = h * 0.45;
  const cols = 5;
  return (
    <g>
      <path
        fillRule="evenodd"
        d={`M${x - hw} ${base} L${x - hw} ${base - wall} L${x + hw} ${base - wall} L${x + hw} ${base} Z ${Array.from({ length: cols }, (_, i) => {
          const cw = w / cols;
          const l = x - hw + i * cw + 8;
          const bw = cw - 16;
          return `M${l} ${base} L${l} ${base - wall * 0.62} Q ${l + bw / 2} ${base - wall * 0.86} ${l + bw} ${base - wall * 0.62} L${l + bw} ${base} Z`;
        }).join(" ")}`}
      />
      {[0, 1, 2].map((k) => (
        <rect key={k} x={x - hw * (0.95 - k * 0.22)} y={base - wall - (k + 1) * h * 0.13} width={w * (0.95 - k * 0.22)} height={h * 0.13 + 1} />
      ))}
      <path d={`M${x - hw * 0.3} ${base - wall - h * 0.39} Q ${x} ${base - h * 1.05} ${x + hw * 0.3} ${base - wall - h * 0.39} Z`} />
      <rect x={x - 1.5} y={base - h * 1.12} width={3} height={h * 0.1} />
    </g>
  );
};

/** Small domed pavilion. */
const Chhatri = ({ x, base, w, h }: { x: number; base: number; w: number; h: number }) => (
  <g>
    <rect x={x - w / 2} y={base - h * 0.5} width={w * 0.14} height={h * 0.5} />
    <rect x={x + w / 2 - w * 0.14} y={base - h * 0.5} width={w * 0.14} height={h * 0.5} />
    <rect x={x - w * 0.62} y={base - h * 0.58} width={w * 1.24} height={h * 0.08} />
    <path d={`M${x - w / 2} ${base - h * 0.58} C ${x - w / 2} ${base - h * 0.98} ${x + w / 2} ${base - h * 0.98} ${x + w / 2} ${base - h * 0.58} Z`} />
    <rect x={x - 1.5} y={base - h * 1.08} width={3} height={h * 0.16} />
  </g>
);

type Piece = { k: "s" | "m" | "c"; x: number; w: number; h: number };
const BACK: Piece[] = [
  { k: "s", x: 0.13, w: 150, h: 330 },
  { k: "c", x: 0.3, w: 80, h: 130 },
  { k: "m", x: 0.5, w: 290, h: 170 },
  { k: "c", x: 0.7, w: 80, h: 130 },
  { k: "s", x: 0.87, w: 160, h: 360 },
];
const FRONT: Piece[] = [
  { k: "s", x: 0.04, w: 120, h: 230 },
  { k: "c", x: 0.22, w: 70, h: 110 },
  { k: "s", x: 0.36, w: 96, h: 170 },
  { k: "s", x: 0.64, w: 96, h: 170 },
  { k: "c", x: 0.78, w: 70, h: 110 },
  { k: "s", x: 0.96, w: 130, h: 250 },
];

const Row: React.FC<{ pieces: Piece[]; L: Layout }> = ({ pieces, L }) => {
  const s = L.temples.scale;
  const base = L.temples.base;
  // in wide formats, repeat the skyline so it spans the full width
  const reps = L.W > L.H ? 2 : 1;
  const out: React.ReactNode[] = [];
  for (let r = 0; r < reps; r++)
    pieces.forEach((p, i) => {
      const x = ((p.x + r) / reps) * L.W;
      const props = { x, base, w: p.w * s, h: p.h * s };
      const key = `${r}-${i}`;
      out.push(p.k === "s" ? <Shikhara key={key} {...props} /> : p.k === "m" ? <Mandapa key={key} {...props} /> : <Chhatri key={key} {...props} />);
    });
  return <>{out}</>;
};

/** Two silhouette layers drifting at different speeds for a gentle parallax. */
export const Temples: React.FC<{ L: Layout }> = ({ L }) => {
  const frame = useCurrentFrame();
  const u = ramp(frame, T.scenery);
  const p = frame / DURATION;
  const top = L.temples.base - 420 * L.temples.scale;
  return (
    <svg width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0 }}>
      <defs>
        <linearGradient id="tBack" x1="0" y1={top} x2="0" y2={L.temples.base} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#C99A4E" stopOpacity="0.14" />
          <stop offset="1" stopColor="#C99A4E" stopOpacity="0.30" />
        </linearGradient>
        <linearGradient id="tFront" x1="0" y1={top} x2="0" y2={L.temples.base} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#A9722C" stopOpacity="0.26" />
          <stop offset="1" stopColor="#A9722C" stopOpacity="0.46" />
        </linearGradient>
      </defs>
      <g fill="url(#tBack)" opacity={u} transform={`translate(${lerp(10, -10, p)} ${(1 - u) * 36})`}>
        <Row pieces={BACK} L={L} />
      </g>
      <g fill="url(#tFront)" opacity={u} transform={`translate(${lerp(26, -26, p)} ${(1 - u) * 60})`}>
        <Row pieces={FRONT} L={L} />
      </g>
      {/* ground */}
      <rect x={0} y={L.temples.base - 2} width={L.W} height={L.H - L.temples.base + 2} fill="#E9CF9C" opacity={0.55 * u} />
    </svg>
  );
};
