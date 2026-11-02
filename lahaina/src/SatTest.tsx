import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Sat, LAH } from './sat';
export const SatTest: React.FC = () => {
  const t = useCurrentFrame() / 30;
  return <Sat t={t} dur={9} keys={[{ t: 0, lon: -156.33, lat: 20.80, w: 80 }, { t: 3, lon: -156.60, lat: 20.90, w: 26 }, { t: 6, lon: LAH.lon + 0.004, lat: LAH.lat, w: 4.2 }, { t: 9, lon: LAH.lon + 0.004, lat: LAH.lat, w: 3.6 }]} scene="pre" burn={{ at: 6.2, d: 1.5, fill: true }} hwy={5} labels={[{ lon: LAH.lon - 0.006, lat: LAH.lat + 0.004, text: 'LAHAINA', at: 4 }]} wipe={{ at: 7.5, d: 1.2 }} />;
};
