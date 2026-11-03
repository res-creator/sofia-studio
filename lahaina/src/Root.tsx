import React from 'react';
import { Composition, Still } from 'remotion';
import { Thumb } from './Thumb';
import { Demo, DEMO_DUR } from './Demo';
import { SatTest } from './SatTest';
import { FullEp, FULL_DUR } from './Full';
export const Root: React.FC = () => (
  <>
    <Composition id="Demo" component={Demo} durationInFrames={Math.ceil(DEMO_DUR * 30)} fps={30} width={1920} height={1080} />
    <Composition id="Full" component={FullEp} durationInFrames={Math.ceil(FULL_DUR * 30)} fps={30} width={1920} height={1080} />
    <Composition id="SatTest" component={SatTest} durationInFrames={270} fps={30} width={1920} height={1080} />
    <Still id="Thumb" component={Thumb} width={1280} height={720} />
  </>
);
