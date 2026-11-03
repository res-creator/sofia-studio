// YouTube thumbnail 1280x720 (competitor-style formula, our own look): real photo + fire glow + year + place
import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { C, DISPLAY, SANS } from './lib';
export const Thumb: React.FC = () => (
  <AbsoluteFill style={{ background: '#000' }}>
    <Img src={staticFile('img/waterfront_cars.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.8) contrast(1.25) brightness(0.75)' }} />
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 70% 30%, rgba(255,110,30,0.55) 0%, rgba(229,53,43,0.25) 35%, rgba(0,0,0,0) 65%)', mixBlendMode: 'screen' }} />
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.7) 100%)' }} />
    <div style={{ position: 'absolute', top: 40, width: '100%', textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 64, color: '#fff', letterSpacing: 4, textShadow: '0 4px 20px rgba(0,0,0,0.9)' }}>2023</div>
    <div style={{ position: 'absolute', top: 100, width: '100%', textAlign: 'center', fontFamily: DISPLAY, fontSize: 200, color: C.red, letterSpacing: 6, lineHeight: 1, textShadow: '0 0 30px rgba(0,0,0,0.9), 0 6px 0 #5a0d08' }}>LAHAINA</div>
    <div style={{ position: 'absolute', bottom: 46, right: 50, fontFamily: DISPLAY, fontSize: 86, color: '#fff', lineHeight: 1, textAlign: 'right', textShadow: '0 4px 24px rgba(0,0,0,0.95)' }}>80 SIRENS.<br /><span style={{ color: C.ember }}>0 SOUNDED.</span></div>
  </AbsoluteFill>
);
