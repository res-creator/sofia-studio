import React from 'react';
import { Composition } from 'remotion';
import { Demo, DEMO_DUR } from './Demo';
export const Root: React.FC = () => (
  <>
    <Composition id="Demo" component={Demo} durationInFrames={Math.ceil(DEMO_DUR * 30)} fps={30} width={1920} height={1080} />
  </>
);
