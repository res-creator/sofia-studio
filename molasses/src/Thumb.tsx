// YouTube thumbnail 1280x720 (light style, real 1919 photo, English only)
import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { C, FONT } from './lib';
export const Thumb: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg, fontFamily: FONT }}>
    <Img src={staticFile('img/redcross.jpg')} style={{ position: 'absolute', right: -40, top: -30, width: 900, height: 780, objectFit: 'cover', objectPosition: '60% 40%', filter: 'grayscale(1) contrast(1.12) brightness(1.04)' }} />
    <AbsoluteFill style={{ background: 'linear-gradient(90deg, #F5F1E9 0%, #F5F1E9 40%, rgba(245,241,233,0.85) 52%, rgba(245,241,233,0) 70%)' }} />
    <div style={{ position: 'absolute', left: 64, top: 92, width: 640 }}>
      <div style={{ display: 'inline-block', background: C.amber, color: '#fff', fontWeight: 800, fontSize: 34, letterSpacing: 3, padding: '10px 18px', borderRadius: 4 }}>BOSTON · 1919</div>
      <div style={{ fontSize: 118, fontWeight: 800, lineHeight: 0.98, letterSpacing: -3, color: C.text, marginTop: 26 }}>A WAVE OF<br /><span style={{ color: C.amber }}>MOLASSES</span></div>
      <div style={{ fontSize: 46, fontWeight: 700, color: C.text, marginTop: 26, lineHeight: 1.15 }}>Over 2 million gallons.<br />21 dead.</div>
    </div>
  </AbsoluteFill>
);
