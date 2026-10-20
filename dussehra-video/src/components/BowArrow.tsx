import React from "react";
import { Easing, useCurrentFrame } from "remotion";
import { C, T } from "../theme";
import { lerp, ramp, taperedCubic } from "../util";
import type { Layout } from "../layout";

// Local coordinates: bow grip at the origin, arrow pointing toward -x.
const TIP = { x: 52, y: 292 };
const PULL = 46;
const SHAFT = 470;

/** Tooth (molar) silhouette, upright: crown at top (y≈-40), two roots at bottom (y≈+46). */
const TOOTH =
  "M0 -33 C 12 -45 35 -43 33 -20 C 32 -4 25 8 21 26 C 18 41 10 49 6.5 40 C 3.5 31 3.5 19 0 15 C -3.5 19 -3.5 31 -6.5 40 C -10 49 -18 41 -21 26 C -25 8 -32 -4 -33 -20 C -35 -43 -12 -45 0 -33 Z";

const Limb: React.FC<{ dir: 1 | -1; flex: number }> = ({ dir, flex }) => {
  const tx = TIP.x + flex * 0.2;
  const ty = (TIP.y - flex * 0.08) * dir;
  const p0: [number, number] = [0, 34 * dir];
  const p1: [number, number] = [-50, 118 * dir];
  const p2: [number, number] = [-28, 236 * dir];
  const p3: [number, number] = [tx, ty];
  const curl = taperedCubic(p3, [tx + 18, ty + 13 * dir], [tx + 14, ty + 34 * dir], [tx - 2, ty + 34 * dir], 8, 3, 24);
  const dots = [0.34, 0.56, 0.78].map((t) => {
    const m = 1 - t;
    return [
      m ** 3 * p0[0] + 3 * m * m * t * p1[0] + 3 * m * t * t * p2[0] + t ** 3 * p3[0],
      m ** 3 * p0[1] + 3 * m * m * t * p1[1] + 3 * m * t * t * p2[1] + t ** 3 * p3[1],
    ];
  });
  return (
    <g>
      <path d={taperedCubic(p0, p1, p2, p3, 28, 9)} fill="url(#bowGold)" stroke={C.goldDeep} strokeWidth={1.4} />
      <path d={`M${p0.join(" ")} C ${p1.join(" ")} ${p2.join(" ")} ${p3.join(" ")}`} fill="none" stroke={C.goldPale} strokeWidth={2.4} opacity={0.75} />
      <path d={curl} fill="url(#bowGold)" stroke={C.goldDeep} strokeWidth={1.2} />
      <circle cx={tx - 2} cy={ty + 34 * dir} r={4.5} fill={C.gold} stroke={C.goldDeep} strokeWidth={1.2} />
      {dots.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={6} fill={C.goldPale} stroke={C.goldDeep} strokeWidth={1.2} />
          <circle cx={x} cy={y} r={3.2} fill={C.maroon} />
        </g>
      ))}
    </g>
  );
};

const Arrow: React.FC<{ x0: number }> = ({ x0 }) => {
  const xh = x0 - SHAFT;
  return (
    <g>
      {/* fletching: two swept feathers with a gold centre vane */}
      {[-1, 1].map((d) => (
        <g key={d}>
          <path
            d={`M${x0 - 6} ${-3 * d} L${x0 - 16} ${-24 * d} C ${x0 - 40} ${-23 * d} ${x0 - 74} ${-14 * d} ${x0 - 106} ${-3 * d} Z`}
            fill={d < 0 ? C.maroon : C.maroonDeep}
          />
          {[0.3, 0.5, 0.7].map((k) => (
            <line key={k} x1={x0 - 106 * k} y1={-3 * d} x2={x0 - 106 * k + 10} y2={-20 * d * (1.15 - k)} stroke={C.goldLight} strokeWidth={1} opacity={0.6} />
          ))}
        </g>
      ))}
      {/* shaft */}
      <rect x={xh} y={-3.4} width={SHAFT} height={6.8} rx={3} fill="url(#shaftGold)" stroke={C.goldDeep} strokeWidth={0.8} />
      {[x0 - 112, x0 - 124, xh + 40].map((x, i) => (
        <rect key={i} x={x} y={-5} width={5} height={10} rx={1.5} fill={C.maroon} />
      ))}
      <path d={`M${x0} -6 L${x0 + 9} 0 L${x0} 6 Z`} fill={C.goldDeep} />
      {/* ferrule + tooth-shaped head (roots pointing forward) */}
      <rect x={xh - 10} y={-7} width={16} height={14} rx={3} fill="url(#bowGold)" stroke={C.goldDeep} strokeWidth={1} />
      <g transform={`translate(${xh - 48} 0) rotate(90)`}>
        <path d={TOOTH} fill="url(#toothGold)" stroke={C.goldDeep} strokeWidth={2.4} strokeLinejoin="round" />
        <path d="M-22 -24 C -20 -34 -8 -36 -2 -30" fill="none" stroke="#FFFBEA" strokeWidth={4} strokeLinecap="round" opacity={0.85} />
        <path d="M-24 -10 C -23 0 -20 10 -17 20" fill="none" stroke="#FFFBEA" strokeWidth={2.5} strokeLinecap="round" opacity={0.55} />
      </g>
    </g>
  );
};

const Sparkle: React.FC<{ v: number }> = ({ v }) => {
  if (v <= 0 || v >= 1) return null;
  const s = Math.sin(Math.PI * Math.pow(v, 0.6));
  const ray = (len: number, w: number, rot: number, o: number) => (
    <path d={`M0 ${-len} L${w} 0 L0 ${len} L${-w} 0 Z`} transform={`rotate(${rot})`} fill="#FFF6D2" opacity={o} />
  );
  return (
    <g>
      <circle r={46 * s} fill="url(#sparkGlow)" />
      <g transform={`scale(${s}) rotate(${v * 40})`}>
        {ray(64, 4.5, 0, 0.95)}
        {ray(64, 4.5, 90, 0.95)}
        {ray(30, 3, 45, 0.7)}
        {ray(30, 3, -45, 0.7)}
      </g>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 + 0.3;
        const r = 14 + 70 * v;
        return <circle key={i} cx={Math.cos(a) * r} cy={Math.sin(a) * r} r={2.6 * (1 - v)} fill={C.goldLight} opacity={1 - v} />;
      })}
    </g>
  );
};

/** Ornate golden bow; the arrow is drawn back, released, and glides forward with a light trail. */
export const BowArrow: React.FC<{ L: Layout }> = ({ L }) => {
  const frame = useCurrentFrame();
  const b = L.bow;
  const appear = ramp(frame, T.bow);
  const draw = ramp(frame, T.draw, Easing.inOut(Easing.sin));
  const dt = frame - T.release;
  const released = dt >= 0;
  const flight = ramp(frame, [T.release, T.flightEnd], Easing.out(Easing.cubic));

  const pull = released ? 0 : draw * PULL;
  const stringOff = released ? -9 * Math.exp(-dt / 4) * Math.sin(dt * 1.4) : pull;
  const arrowOff = released ? lerp(PULL, -b.travel, flight) : pull;
  const x0 = TIP.x + arrowOff;

  const trailO = released ? ramp(frame, [T.release, T.release + 3]) * (1 - ramp(frame, [T.flightEnd - 4, T.flightEnd + 22])) : 0;
  const tail0 = TIP.x + PULL;
  const glint = (frame - (T.flightEnd + 34)) / 22;
  const swing = 4 * Math.sin(frame / 26);

  return (
    <svg
      width={L.W}
      height={L.H}
      style={{ position: "absolute", left: 0, top: 0, overflow: "visible", filter: "drop-shadow(0 10px 14px rgba(110,62,10,0.22))" }}
    >
      <defs>
        <linearGradient id="bowGold" x1="-60" y1="0" x2="80" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={C.goldDeep} />
          <stop offset="0.45" stopColor={C.goldLight} />
          <stop offset="0.7" stopColor={C.gold} />
          <stop offset="1" stopColor={C.goldDeep} />
        </linearGradient>
        <linearGradient id="shaftGold" x1="0" y1="-4" x2="0" y2="4" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={C.goldPale} />
          <stop offset="0.5" stopColor={C.gold} />
          <stop offset="1" stopColor={C.goldDeep} />
        </linearGradient>
        <linearGradient id="toothGold" x1="-30" y1="-40" x2="30" y2="45" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFF3C8" />
          <stop offset="0.45" stopColor={C.goldLight} />
          <stop offset="1" stopColor={C.gold} />
        </linearGradient>
        <linearGradient id="trail" x1={tail0} y1="0" x2={x0} y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#E9B54C" stopOpacity="0" />
          <stop offset="0.6" stopColor="#E2A93C" stopOpacity="0.7" />
          <stop offset="1" stopColor="#F7D47C" stopOpacity="1" />
        </linearGradient>
        <radialGradient id="sparkGlow">
          <stop offset="0" stopColor="#FFF4C8" stopOpacity="0.9" />
          <stop offset="1" stopColor="#F4CF73" stopOpacity="0" />
        </radialGradient>
        <filter id="trailBlur" x="-0.2" y="-4" width="1.4" height="9">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      <g
        transform={`translate(${b.x} ${b.y + (1 - appear) * 34}) rotate(${b.rotate}) scale(${b.scale * lerp(0.97, 1, appear)})`}
        opacity={appear}
      >
        {/* tassel below the grip */}
        <g transform={`translate(0 44) rotate(${swing})`}>
          <line x1={0} y1={0} x2={0} y2={30} stroke={C.goldDeep} strokeWidth={2} />
          <circle cy={32} r={6} fill={C.gold} stroke={C.goldDeep} strokeWidth={1} />
          <path d="M-7 36 L7 36 L10 78 L-10 78 Z" fill={C.maroon} />
          <path d="M-3 38 L-4 78 M3 38 L4 78" stroke={C.maroonDeep} strokeWidth={1.2} />
        </g>
        <Limb dir={-1} flex={pull} />
        <Limb dir={1} flex={pull} />
        {/* grip */}
        <rect x={-15} y={-42} width={30} height={84} rx={9} fill={C.maroon} stroke={C.goldDeep} strokeWidth={1.4} />
        {[-26, -12, 2, 16].map((y) => (
          <path key={y} d={`M-15 ${y} L15 ${y + 10}`} stroke={C.goldLight} strokeWidth={2} opacity={0.8} />
        ))}
        <rect x={-17} y={-46} width={34} height={9} rx={3} fill="url(#bowGold)" stroke={C.goldDeep} strokeWidth={1} />
        <rect x={-17} y={37} width={34} height={9} rx={3} fill="url(#bowGold)" stroke={C.goldDeep} strokeWidth={1} />
        {/* string */}
        <polyline
          points={`${TIP.x + pull * 0.2} ${-(TIP.y - pull * 0.08)} ${TIP.x + stringOff} 0 ${TIP.x + pull * 0.2} ${TIP.y - pull * 0.08}`}
          fill="none"
          stroke="#CDAE6A"
          strokeWidth={2.8}
        />
        {/* light trail behind the arrow */}
        {trailO > 0 && (
          <g opacity={trailO}>
            <rect x={x0} y={-9} width={Math.max(0, tail0 - x0)} height={18} rx={9} fill="url(#trail)" filter="url(#trailBlur)" />
            <rect x={x0} y={-1.6} width={Math.max(0, tail0 - x0)} height={3.2} rx={1.6} fill="url(#trail)" />
            <rect x={x0 - SHAFT - 60} y={-8} width={SHAFT + 60} height={16} rx={8} fill="#F2C86A" opacity={0.45} filter="url(#trailBlur)" />
          </g>
        )}
        <Arrow x0={x0} />
        {/* soft glint on the tooth once the arrow settles */}
        <g transform={`translate(${x0 - SHAFT - 70} -10) scale(0.55)`}>
          <Sparkle v={glint} />
        </g>
        <g transform={`translate(${tail0} 0)`}>
          <Sparkle v={released ? dt / 18 : 0} />
        </g>
      </g>
    </svg>
  );
};
