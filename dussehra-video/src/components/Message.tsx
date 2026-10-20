import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT_SCRIPT, T } from "../theme";
import { ramp } from "../util";
import type { Layout } from "../layout";

/** Closing line, set exactly as supplied: “May goodness, health & happiness triumph.” */
export const Message: React.FC<{ L: Layout }> = ({ L }) => {
  const frame = useCurrentFrame();
  const m = L.message;
  const W = 1200;
  return (
    <div style={{ position: "absolute", left: m.cx - W / 2, top: m.top, width: W, textAlign: "center" }}>
      {m.lines.map((line, i) => {
        const a = T.message[0] + i * 8;
        const u = ramp(frame, [a, a + (T.message[1] - T.message[0])]);
        return (
          <div
            key={i}
            style={{
              fontFamily: FONT_SCRIPT,
              fontStyle: "italic",
              fontWeight: 600,
              fontSize: m.size,
              lineHeight: 1.22,
              color: C.maroon,
              opacity: u,
              transform: `translateY(${(1 - u) * 20}px)`,
              filter: u < 1 ? `blur(${(1 - u) * 5}px)` : undefined,
              textShadow: "0 2px 14px rgba(252,246,234,0.9)",
            }}
          >
            {line}
          </div>
        );
      })}
    </div>
  );
};
