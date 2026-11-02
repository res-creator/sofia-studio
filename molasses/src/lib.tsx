import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing, continueRender, delayRender } from 'remotion';
import tl from './data/timeline.json';

export const C = {
  bg: '#0A0A0B',
  card: '#0E0E10',
  text: '#F4F1EA',
  dim: 'rgba(244,241,234,0.62)',
  faint: 'rgba(244,241,234,0.28)',
  amber: '#C77A1A',
  amberHi: '#E0952F',
  brown: '#5A3410',
  blue: '#8FB4D6',
};
export const FONT = 'Inter, sans-serif';

// ---- fonts: Inter embedded as base64 in src/fonts.css (no network, no async wait)
import './fonts.css';

// ---- timing: word start/end (seconds) by index in timeline.json
export const ws = (i: number) => tl.words[i].s;
export const we = (i: number) => tl.words[i].e;
export const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};
const ease = Easing.bezier(0.33, 0, 0.2, 1);
// 0..1 progress between t0 and t1 seconds (local time)
export const prog = (t: number, t0: number, t1: number, e = true) =>
  interpolate(t, [t0, t1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e ? ease : undefined });
export const appear = (t: number, t0: number, d = 0.45) => prog(t, t0, t0 + d);

// ---- shot wrapper: fades the shot in over `fin` seconds (crossfade with the previous shot underneath)
export const ShotCtx = React.createContext({ start: 0 });
export const useShotT = () => {
  const t = useT();
  const { start } = React.useContext(ShotCtx);
  return { t, abs: t + start };
};

// ---- film grain + vignette (very subtle, keeps frames "alive")
export const Grain: React.FC<{ o?: number }> = ({ o = 0.07 }) => {
  const f = useCurrentFrame();
  const seed = f % 8;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'overlay', opacity: o }}>
      <svg width="1920" height="1080">
        <filter id={`g${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="1920" height="1080" filter={`url(#g${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};
export const Vignette: React.FC<{ o?: number }> = ({ o = 0.75 }) => (
  <AbsoluteFill style={{ pointerEvents: 'none', background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,${o}) 100%)` }} />
);

// ---- labels
export const Tag: React.FC<{ children: React.ReactNode; t: number; at?: number; pos?: 'tr' | 'tl' }> = ({ children, t, at = 0.2, pos = 'tr' }) => (
  <div
    style={{
      position: 'absolute', top: 54, [pos === 'tr' ? 'right' : 'left']: 64, fontFamily: FONT, fontWeight: 600, fontSize: 20,
      letterSpacing: 3, textTransform: 'uppercase', color: C.text, padding: '9px 16px', border: `1.5px solid ${C.amber}`,
      background: 'rgba(10,10,11,0.72)', opacity: appear(t, at), borderRadius: 3,
    } as any}
  >
    {children}
  </div>
);

export const Caption: React.FC<{ text: string; source?: string; t: number; at?: number; maxW?: number }> = ({ text, source, t, at = 0.25, maxW = 1150 }) => {
  const p = appear(t, at, 0.5);
  return (
    <div style={{ position: 'absolute', left: 72, bottom: 70, maxWidth: maxW, opacity: p, transform: `translateY(${(1 - p) * 10}px)` }}>
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 18 }}>
        <div style={{ width: 4, background: C.amber, borderRadius: 2 }} />
        <div>
          <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 34, lineHeight: 1.28, color: C.text, textShadow: '0 2px 14px rgba(0,0,0,0.9)' }}>{text}</div>
          {source && (
            <div style={{ fontFamily: FONT, fontWeight: 400, fontSize: 19, marginTop: 10, color: C.dim, letterSpacing: 0.3, textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}>{source}</div>
          )}
        </div>
      </div>
      <div style={{ position: 'absolute', inset: '-40px -60px -40px -72px', zIndex: -1, background: 'radial-gradient(ellipse at 30% 60%, rgba(0,0,0,0.55), rgba(0,0,0,0) 70%)' }} />
    </div>
  );
};

// arrow drawn from (x1,y1) to (x2,y2) in screen px
export const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; t: number; at: number; label?: string; lx?: number; ly?: number; anchor?: string }> = ({ x1, y1, x2, y2, t, at, label, lx, ly, anchor = 'start' }) => {
  const p = prog(t, at, at + 0.6);
  const len = Math.hypot(x2 - x1, y2 - y1);
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const hx = x2, hy = y2;
  const a1 = ang + Math.PI - 0.45, a2 = ang + Math.PI + 0.45;
  return (
    <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0 }}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.amber} strokeWidth={4} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - p)} />
      <path d={`M${hx + 22 * Math.cos(a1)},${hy + 22 * Math.sin(a1)} L${hx},${hy} L${hx + 22 * Math.cos(a2)},${hy + 22 * Math.sin(a2)}`} fill="none" stroke={C.amber} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" opacity={prog(t, at + 0.45, at + 0.7)} />
      {label && (
        <text x={lx ?? x1} y={ly ?? y1 - 16} textAnchor={anchor as any} fill={C.text} fontFamily={FONT} fontWeight={600} fontSize={26} opacity={appear(t, at + 0.3)} style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.75)', strokeWidth: 6 } as any}>
          {label}
        </text>
      )}
    </svg>
  );
};

// ---- archival photo with slow Ken Burns move and a restrained grade
export type KB = { s0: number; s1: number; x0: number; x1: number; y0: number; y1: number }; // scale & offset (% of frame)
export const Photo: React.FC<{ src: string; t: number; dur: number; kb: KB; sepia?: number; bright?: number; fit?: 'cover' | 'contain' }> = ({ src, t, dur, kb, sepia = 0.25, bright = 0.92, fit = 'cover' }) => {
  const p = interpolate(t, [0, dur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const s = kb.s0 + (kb.s1 - kb.s0) * p;
  const x = kb.x0 + (kb.x1 - kb.x0) * p;
  const y = kb.y0 + (kb.y1 - kb.y0) * p;
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: C.bg }}>
      <Img src={staticFile('img/' + src)} style={{ width: '100%', height: '100%', objectFit: fit, transform: `translate(${x}%, ${y}%) scale(${s})`, filter: `grayscale(1) sepia(${sepia}) contrast(1.08) brightness(${bright})` }} />
    </AbsoluteFill>
  );
};

export const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
