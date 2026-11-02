import React from 'react';
import { Composition } from 'remotion';
import { Demo, DEMO_DUR } from './Demo';
import { SatTest } from './SatTest';
export const Root: React.FC = () => (
  <>
    <Composition id="Demo" component={Demo} durationInFrames={Math.ceil(DEMO_DUR * 30)} fps={30} width={1920} height={1080} />
    <Composition id="SatTest" component={SatTest} durationInFrames={270} fps={30} width={1920} height={1080} />
  </>
);
