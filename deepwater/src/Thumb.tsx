// YouTube thumbnail. Photo: USCG, April 21, 2010 (DVIDS 272214, public domain) — the morning after; no time is printed over it.
import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { SANS, DISPLAY, INK, ACC, BG } from './kit';
const RED = '#E0533A', OK = '#7FC4E0';
const Photo: React.FC<{ s?: number; x?: number; y?: number }> = ({ s = 1.2, x = -60, y = -170 }) => (
  <Img src={staticFile('img/dvids_img_272214.jpg')} style={{ position: 'absolute', width: 1920 * s, height: 1440 * s, left: x, top: y, maxWidth: 'none' }} />
);
export const ThumbA: React.FC = () => (
  <AbsoluteFill style={{ background: BG, overflow: 'hidden' }}>
    <Photo s={1.18} x={-260} y={-150} />
    <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.55) 62%, rgba(0,0,0,0.8) 100%)' }} />
    <div style={{ position: 'absolute', right: 70, top: 120, width: 860, textAlign: 'right' }}>
      <div style={{ fontFamily: DISPLAY, fontSize: 150, color: INK, lineHeight: 0.9, textShadow: '0 6px 24px rgba(0,0,0,0.8)' }}>8 P.M.</div>
      <div style={{ display: 'inline-block', marginTop: 34, background: ACC, padding: '18px 34px 8px', transform: 'rotate(-3deg)', boxShadow: '0 16px 50px rgba(0,0,0,0.7)' }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 168, color: BG, lineHeight: 0.92, letterSpacing: 2 }}>DECLARED<br />A SUCCESS</div>
      </div>
    </div>
  </AbsoluteFill>
);
export const ThumbB: React.FC = () => (
  <AbsoluteFill style={{ background: BG, overflow: 'hidden' }}>
    <Photo s={1.18} x={-260} y={-150} />
    <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.6) 58%, rgba(0,0,0,0.85) 100%)' }} />
    <div style={{ position: 'absolute', right: 70, top: 90, width: 780 }}>
      {[['KILL LINE', 'NO FLOW', OK], ['DRILL PIPE', '1,400 PSI', RED]].map(([t, v, c]) => (
        <div key={t} style={{ border: `6px solid ${c}`, background: 'rgba(10,12,14,0.85)', borderRadius: 16, padding: '14px 30px 4px', marginBottom: 26 }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 44, color: INK, letterSpacing: 3 }}>{t}</div>
          <div style={{ fontFamily: DISPLAY, fontSize: 170, color: c, lineHeight: 1 }}>{v}</div>
        </div>
      ))}
      <div style={{ display: 'inline-block', background: ACC, padding: '10px 26px 2px', transform: 'rotate(-3deg)' }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 96, color: BG, lineHeight: 1 }}>“SUCCESS”</div>
      </div>
    </div>
  </AbsoluteFill>
);
