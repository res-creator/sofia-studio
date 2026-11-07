// YouTube thumbnail 1280x720: real USGS photos — the evening before (May 17) | the eruption (May 18).
import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { DISPLAY, SANS, INK, ACC } from './kit';
const sh = '0 4px 24px rgba(0,0,0,0.85), 0 0 4px rgba(0,0,0,0.9)';
export const Thumb: React.FC = () => (
  <AbsoluteFill style={{ background: '#0B0C0D' }}>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 640, height: 720, overflow: 'hidden' }}>
      <Img src={staticFile('img/mount-st-helens-may-17-1980-one-day-devastating-er.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 30%', transform: 'scale(1.06)' }} />
    </div>
    <div style={{ position: 'absolute', left: 640, top: 0, width: 640, height: 720, overflow: 'hidden' }}>
      <Img src={staticFile('img/eruption-column-may-18-1980-mount-st-helens-eruption.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 40%', filter: 'contrast(1.1)' }} />
    </div>
    <div style={{ position: 'absolute', left: 634, top: 0, width: 12, height: 720, background: ACC }} />
    <AbsoluteFill style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.0) 45%)' }} />
    <div style={{ position: 'absolute', left: 28, top: 24, fontFamily: DISPLAY, fontSize: 64, color: INK, textShadow: sh, letterSpacing: 2 }}>MAY 17</div>
    <div style={{ position: 'absolute', right: 28, top: 24, fontFamily: DISPLAY, fontSize: 64, color: ACC, textShadow: sh, letterSpacing: 2 }}>MAY 18</div>
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 34, textAlign: 'center', fontFamily: DISPLAY, fontSize: 150, lineHeight: 0.9, color: INK, textShadow: sh, letterSpacing: 3 }}>
      IT EXPLODED <span style={{ color: ACC }}>SIDEWAYS</span>
    </div>
  </AbsoluteFill>
);
