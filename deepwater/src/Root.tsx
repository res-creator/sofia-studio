import React from 'react';
import { Composition } from 'remotion';
import { Opening, OPEN_DUR } from './Opening';
import { Film, FILM_DUR } from './Film';
export const Root: React.FC = () => (<>
  <Composition id="Opening" component={Opening} durationInFrames={Math.ceil(OPEN_DUR * 30)} fps={30} width={1920} height={1080} />
  <Composition id="Film" component={Film} durationInFrames={Math.ceil(FILM_DUR * 30)} fps={30} width={1920} height={1080} />
</>);
