import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT_DISPLAY, T } from "../theme";
import { ramp } from "../util";
import type { Layout } from "../layout";
import { Ornament } from "./Ornament";

/** Letters rise and sharpen into place one after another. */
const Staggered: React.FC<{ text: string; start: number; end: number; style: React.CSSProperties }> = ({ text, start, end, style }) => {
  const frame = useCurrentFrame();
  const n = text.length;
  const each = 24;
  const step = Math.max(1, (end - start - each) / Math.max(1, n - 1));
  return (
    <div style={{ display: "flex", justifyContent: "center", whiteSpace: "pre", ...style }}>
      {text.split("").map((ch, i) => {
        const a = start + i * step;
        const u = ramp(frame, [a, a + each]);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: u,
              transform: `translateY(${(1 - u) * 30}px)`,
              filter: u < 1 ? `blur(${(1 - u) * 6}px)` : undefined,
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};

export const Greeting: React.FC<{ L: Layout }> = ({ L }) => {
  const g = L.greeting;
  const W = 1000;
  const happySpacing = 0.42;
  return (
    <div style={{ position: "absolute", left: g.cx - W / 2, top: g.top, width: W, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Ornament width={g.ornament * 0.62} start={T.ornament[0]} end={T.ornament[1]} flip />
      <Staggered
        text="HAPPY"
        start={T.happy[0]}
        end={T.happy[1]}
        style={{
          marginTop: g.happy * 0.18,
          fontFamily: FONT_DISPLAY,
          fontWeight: 500,
          fontSize: g.happy,
          letterSpacing: `${happySpacing}em`,
          paddingLeft: `${happySpacing}em`, // balance the trailing tracking
          color: C.maroon,
          lineHeight: 1.1,
        }}
      />
      <Staggered
        text="DUSSEHRA"
        start={T.dussehra[0]}
        end={T.dussehra[1]}
        style={{
          fontFamily: FONT_DISPLAY,
          fontWeight: 700,
          fontSize: g.dussehra,
          letterSpacing: "0.035em",
          paddingLeft: "0.035em",
          color: C.maroon,
          lineHeight: 1.12,
          textShadow: "0 3px 0 rgba(201,151,58,0.30), 0 12px 34px rgba(120,60,10,0.14)",
        }}
      />
      <Ornament width={g.ornament} start={T.ornament[0] + 6} end={T.ornament[1] + 6} style={{ marginTop: g.dussehra * 0.06 }} />
    </div>
  );
};
