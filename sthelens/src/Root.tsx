import React from 'react';
import { Composition, Still } from 'remotion';
import { Avatar, Banner } from './Brand';
import { Opening, OPEN_DUR } from './Opening';
import { FullFilm, FILM_DUR } from './Film';
export const Root: React.FC = () => (<>
  <Composition id="Film" component={FullFilm} durationInFrames={Math.ceil(FILM_DUR * 30)} fps={30} width={1920} height={1080} />
  <Composition id="Opening" component={Opening} durationInFrames={Math.ceil(OPEN_DUR * 30)} fps={30} width={1920} height={1080} />
  <Still id="Avatar" component={Avatar} width={800} height={800} />
  <Still id="Banner" component={Banner} width={2560} height={1440} />
</>);
