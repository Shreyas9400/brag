import React from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import { T } from "../theme";
import { ramp } from "../util";
import type { Layout } from "../layout";

// Official logo, background removed by scripts/prepare_logo.py. Native aspect 1098 x 716.
const ASPECT = 716 / 1098;

export const Logo: React.FC<{ L: Layout }> = ({ L }) => {
  const frame = useCurrentFrame();
  const u = ramp(frame, T.logo);
  return (
    <Img
      src={staticFile("logo/logo-transparent.png")}
      style={{
        position: "absolute",
        left: L.logo.x,
        top: L.logo.y,
        width: L.logo.w,
        height: L.logo.w * ASPECT, // locked to the source proportions
        opacity: u,
        transform: `translateY(${(1 - u) * 10}px)`,
      }}
    />
  );
};
