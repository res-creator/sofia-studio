import React from 'react';
import { Composition } from 'remotion';
import { Opening, OPEN_DUR } from './Opening';
export const Root: React.FC = () => (<>
  <Composition id="Opening" component={Opening} durationInFrames={Math.ceil(OPEN_DUR * 30)} fps={30} width={1920} height={1080} />
</>);
