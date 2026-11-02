import React from 'react';
import { Composition, Still } from 'remotion';
import { Main } from './Main';
import tl from './data/timeline.json';
export const FPS = 30;
export const Root: React.FC = () => (
  <>
    <Composition id="Main" component={Main} durationInFrames={Math.ceil(tl.duration * FPS)} fps={FPS} width={1920} height={1080} />
  </>
);
