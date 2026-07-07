import React from "react";
import { Composition } from "remotion";
import { Demo } from "./Demo";
import { Story } from "./Story";
import { S_DURATION } from "./storyTimeline";
import { DURATION, FPS, HEIGHT, WIDTH } from "./timeline";

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="Demo"
        component={Demo}
        durationInFrames={DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="Story"
        component={Story}
        durationInFrames={S_DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    </>
  );
};
