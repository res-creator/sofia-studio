import React from 'react';
import { Composition, Still } from 'remotion';
import { Main } from './Main';
import { Full, FULL_DURATION } from './full/Full';
import tl from './data/timeline.json';
import { Thumb } from './Thumb';
export const FPS = 30;
export const Root: React.FC = () => (
  <>
    <Composition id="Main" component={Main} durationInFrames={Math.ceil(tl.duration * FPS)} fps={FPS} width={1920} height={1080} />
    <Composition id="Full" component={Full} durationInFrames={Math.ceil(FULL_DURATION * FPS)} fps={FPS} width={1920} height={1080} />
    <Still id="Thumb" component={Thumb} width={1280} height={720} />
  </>
);
