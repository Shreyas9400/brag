import React from "react";
import { random, useCurrentFrame } from "remotion";
import { T } from "../theme";
import { ramp } from "../util";
import type { Layout } from "../layout";

/** Sparse golden dust drifting upward. Deterministic (seeded). */
export const Particles: React.FC<{ L: Layout; count?: number }> = ({ L, count = 42 }) => {
  const frame = useCurrentFrame();
  const o = ramp(frame, T.dust);
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const r = (k: string) => random(`dust-${i}-${k}`);
        const size = 2.5 + r("s") * 5;
        const speed = 0.35 + r("v") * 0.7;
        const span = L.H + 80;
        const y = (((r("y") * span - frame * speed) % span) + span) % span - 40;
        const x = r("x") * L.W + Math.sin(frame / (40 + r("p") * 30) + r("ph") * 6.28) * 18;
        const tw = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(frame / (9 + r("t") * 9) + r("tp") * 6.28));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              background: "radial-gradient(circle, #FFF6D6 0%, #F2C964 45%, rgba(242,201,100,0) 72%)",
              boxShadow: `0 0 ${size * 2.4}px rgba(242,196,90,0.55)`,
              opacity: o * tw * (0.35 + r("a") * 0.5),
            }}
          />
        );
      })}
    </>
  );
};
