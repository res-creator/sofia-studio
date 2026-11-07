// Thumbnail B: David Johnston at Coldwater II, 7 p.m. May 17 (Glicken, USGS) | the same ridge's view soon after May 18 (Glicken, USGS).
import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { DISPLAY, INK, ACC } from './kit';
const sh = '0 4px 24px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.9)';
export const Thumb2: React.FC = () => (
  <AbsoluteFill style={{ background: '#0B0C0D' }}>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 740, height: 720, overflow: 'hidden' }}>
      <Img src={staticFile('img/johnston_coldwater2_1980-05-17.jpg')} style={{ position: 'absolute', height: 900, left: -420, top: -60, filter: 'saturate(1.1) contrast(1.05)' }} />
    </div>
    <div style={{ position: 'absolute', left: 740, top: 0, width: 540, height: 720, overflow: 'hidden' }}>
      <Img src={staticFile('img/mount-st-helens-soon-after-may-18-1980-eruption-0.jpg')} style={{ position: 'absolute', height: 790, left: -360, top: -30, filter: 'contrast(1.15) brightness(0.85)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.6), rgba(0,0,0,0) 60%)' }} />
    </div>
    <div style={{ position: 'absolute', left: 734, top: 0, width: 12, height: 720, background: ACC }} />
    <div style={{ position: 'absolute', left: 770, right: 20, bottom: 40, fontFamily: DISPLAY, fontSize: 132, lineHeight: 0.88, color: INK, textShadow: sh, letterSpacing: 2 }}>13 HOURS<br /><span style={{ color: ACC }}>LATER</span></div>
  </AbsoluteFill>
);
