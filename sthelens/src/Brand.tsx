// Channel art for "Known in Advance": avatar 800x800, banner 2560x1440 (text inside YouTube's 1546x423 safe area).
import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { SANS, DISPLAY, INK, ACC } from './kit';
// a seismogram trace: quiet line, a few small tremors, one large signal — "the signs before"
const trace = (w: number, h: number, x0: number, amp: number) => {
  const pts: string[] = [];
  for (let i = 0; i <= 240; i++) {
    const x = (i / 240) * w; const u = (x - x0) / w;
    const burst = Math.exp(-Math.pow(u / 0.045, 2)) * amp * Math.sin(i * 1.9);
    const small = (Math.exp(-Math.pow((u + 0.2) / 0.025, 2)) * 0.22 + Math.exp(-Math.pow((u + 0.33) / 0.02, 2)) * 0.12) * amp * Math.sin(i * 2.3);
    const noise = 0.015 * amp * Math.sin(i * 3.7) * Math.cos(i * 1.3);
    pts.push(`${x.toFixed(1)},${(h / 2 - burst - small - noise).toFixed(1)}`);
  }
  return pts.join(' ');
};
export const Avatar: React.FC = () => (
  <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 45%, #1C1F22 0%, #0B0C0D 70%)', alignItems: 'center', justifyContent: 'center' }}>
    <svg width={800} height={800} viewBox="0 0 800 800" style={{ position: 'absolute' }}>
      <polyline points={trace(600, 400, 380, 170)} transform="translate(100,200)" fill="none" stroke={ACC} strokeWidth={16} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  </AbsoluteFill>
);
export const Banner: React.FC = () => (
  <AbsoluteFill style={{ background: '#0B0C0D' }}>
    <Img src={staticFile('img/mount-st-helens-may-17-1980-one-day-devastating-er.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 38%', filter: 'saturate(0.85)', transform: 'scale(1.12)' }} />
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(8,9,10,0.35) 0%, rgba(8,9,10,0.62) 35%, rgba(8,9,10,0.62) 65%, rgba(8,9,10,0.35) 100%)' }} />
    {/* safe area: 1546x423 centred */}
    <div style={{ position: 'absolute', left: 507, top: 508, width: 1546, height: 423, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: DISPLAY, fontSize: 190, color: INK, letterSpacing: 14, lineHeight: 0.9, textShadow: '0 4px 30px rgba(0,0,0,0.6)' }}>KNOWN IN ADVANCE</div>
      <svg width={1100} height={70} style={{ marginTop: 14 }}><polyline points={trace(1100, 70, 760, 26)} fill="none" stroke={ACC} strokeWidth={5} strokeLinejoin="round" /></svg>
      <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 44, color: INK, letterSpacing: 4, marginTop: 12, textShadow: '0 2px 16px rgba(0,0,0,0.7)' }}>Documentary stories of real disasters</div>
    </div>
  </AbsoluteFill>
);
