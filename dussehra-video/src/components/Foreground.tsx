import React from "react";
import { useCurrentFrame } from "remotion";
import { T } from "../theme";
import { ramp } from "../util";
import type { Layout } from "../layout";
import { Diya } from "./Diya";
import { Marigold, MarigoldDefs } from "./Marigold";

/** Row of lit diyas with marigolds tucked between them. */
export const Foreground: React.FC<{ L: Layout }> = ({ L }) => {
  const frame = useCurrentFrame();
  const u = ramp(frame, T.scenery);
  return (
    <svg width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <MarigoldDefs />
      <defs>
        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E3BE7A" stopOpacity="0" />
          <stop offset="1" stopColor="#C89646" stopOpacity="0.45" />
        </linearGradient>
      </defs>
      <rect x={0} y={L.H - 200} width={L.W} height={200} fill="url(#floor)" opacity={u} />
      <g opacity={u} transform={`translate(0 ${(1 - u) * 30})`}>
        {L.marigolds.map((m, i) => (
          <g key={i} transform={`translate(${m.x} ${m.y})`}>
            <Marigold r={34 * m.s} hue={m.hue} rot={i * 47} leaves />
            <g transform={`translate(${30 * m.s} ${16 * m.s})`}>
              <Marigold r={22 * m.s} hue={m.hue === "orange" ? "yellow" : "orange"} rot={i * 31} />
            </g>
          </g>
        ))}
      </g>
      {L.diyas.map((d, i) => (
        <Diya key={i} x={d.x} y={d.y} s={d.s} seed={i + 1} />
      ))}
    </svg>
  );
};
