import React from "react";
import { useCurrentFrame } from "remotion";
import { C } from "../theme";
import { ramp } from "../util";

let uid = 0;

/** Gold filigree divider: centre lotus, scroll curls, tapered rules. Draws out from the centre, then shimmers. */
export const Ornament: React.FC<{ width: number; start: number; end: number; flip?: boolean; style?: React.CSSProperties }> = ({
  width,
  start,
  end,
  flip,
  style,
}) => {
  const frame = useCurrentFrame();
  const [id] = React.useState(() => `orn${uid++}`);
  const u = ramp(frame, [start, end]);
  const hw = width / 2;
  const H = 64;
  // highlight band sweeps across every 3 s once drawn
  const c = (((frame - end) / 90) % 1 + 1) % 1 * 1.6 - 0.3;
  const band = frame < end ? -1 : c;
  const side = (s: 1 | -1) => (
    <g transform={`scale(${s} 1)`}>
      <path d={`M48 -1.6 L${hw - 26} -0.4 L${hw - 26} 0.4 L48 1.6 Z`} />
      <path d={`M70 7 L${hw - 120} 6.4 L${hw - 120} 7.4 L70 8 Z`} opacity={0.75} />
      <path d={`M70 -7 L${hw - 120} -6.4 L${hw - 120} -7.4 L70 -8 Z`} opacity={0.75} />
      <path d="M30 0 L38 -6 L46 0 L38 6 Z" />
      <g fill="none" strokeWidth={2.2} strokeLinecap="round" stroke={`url(#${id})`}>
        <path d={`M${hw - 104} 0 c 6 -16 30 -18 34 -3 c 2 9 -9 13 -14 6 c -3 -5 2 -9 5 -6`} />
        <path d={`M${hw - 104} 0 c 6 16 30 18 34 3 c 2 -9 -9 -13 -14 -6 c -3 5 2 9 5 6`} />
      </g>
      <circle cx={hw - 14} cy={0} r={3.4} />
      <circle cx={hw - 4} cy={0} r={2} />
    </g>
  );
  return (
    <svg
      width={width}
      height={H}
      viewBox={`${-hw} ${-H / 2} ${width} ${H}`}
      style={{ display: "block", overflow: "visible", transform: flip ? "scaleY(-1)" : undefined, ...style }}
    >
      <defs>
        <linearGradient id={id} x1={-hw} x2={hw} y1={0} y2={0} gradientUnits="userSpaceOnUse">
          <stop offset={0} stopColor={C.goldDeep} />
          <stop offset={Math.max(0, band - 0.14)} stopColor={C.gold} />
          <stop offset={Math.min(1, Math.max(0, band))} stopColor={C.goldPale} />
          <stop offset={Math.min(1, Math.max(0, band + 0.14))} stopColor={C.gold} />
          <stop offset={1} stopColor={C.goldDeep} />
        </linearGradient>
        <clipPath id={`${id}c`}>
          <rect x={-hw * u - 2} y={-H / 2} width={width * u + 4} height={H} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}c)`} fill={`url(#${id})`} opacity={Math.min(1, u * 1.6)}>
        {side(1)}
        {side(-1)}
        {/* centre lotus */}
        <path d="M0 -22 C 9 -11 9 4 0 13 C -9 4 -9 -11 0 -22 Z" />
        <path d="M0 13 C 4 -1 14 -10 24 -10 C 22 2 12 11 0 13 Z" opacity={0.9} />
        <path d="M0 13 C -4 -1 -14 -10 -24 -10 C -22 2 -12 11 0 13 Z" opacity={0.9} />
        <circle cx={0} cy={21} r={2.6} />
      </g>
    </svg>
  );
};
