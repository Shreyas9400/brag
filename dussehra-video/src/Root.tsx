import React from "react";
import { Composition } from "remotion";
import "./fonts";
import { DURATION, FPS } from "./theme";
import { landscape, vertical } from "./layout";
import { Dussehra } from "./Dussehra";

export const Root: React.FC = () => (
  <>
    <Composition id="DussehraVertical" component={Dussehra} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{ L: vertical }} />
    <Composition id="DussehraLandscape" component={Dussehra} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} defaultProps={{ L: landscape }} />
  </>
);
