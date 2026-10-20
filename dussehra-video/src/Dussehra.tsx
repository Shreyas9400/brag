import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { T } from "./theme";
import { ramp } from "./util";
import type { Layout } from "./layout";
import { Background, OpeningFrame } from "./components/Background";
import { LightRays } from "./components/LightRays";
import { Particles } from "./components/Particles";
import { Temples } from "./components/Temples";
import { Garland } from "./components/Garland";
import { Greeting } from "./components/Greeting";
import { BowArrow } from "./components/BowArrow";
import { Message } from "./components/Message";
import { Foreground } from "./components/Foreground";
import { Logo } from "./components/Logo";

export const Dussehra: React.FC<{ L: Layout }> = ({ L }) => {
  const frame = useCurrentFrame();
  // closing: a warm bloom, then a soft fade back to the ivory of frame 0
  const bloom = ramp(frame, [290, 336]) * (1 - 0.4 * ramp(frame, T.fadeOut));
  const fade = ramp(frame, T.fadeOut);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Background L={L} />
      <LightRays L={L} />
      <Particles L={L} count={L.W > L.H ? 36 : 40} />
      <Temples L={L} />
      <Garland L={L} />
      <Greeting L={L} />
      <BowArrow L={L} />
      <Message L={L} />
      <Foreground L={L} />
      <Logo L={L} />
      <AbsoluteFill
        style={{
          opacity: bloom * 0.5,
          mixBlendMode: "screen",
          background: `radial-gradient(circle ${L.glow.r * 1.1}px at ${L.glow.cx}px ${L.H * 0.55}px, rgba(255,220,140,0.55) 0%, rgba(255,220,140,0) 70%)`,
        }}
      />
      <OpeningFrame L={L} style={{ opacity: fade }} />
      <Audio src={staticFile("audio/dussehra-score.wav")} />
    </AbsoluteFill>
  );
};
