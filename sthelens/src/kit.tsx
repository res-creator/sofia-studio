// Documentary kit: archival photo/film shown at native aspect (contain, never stretched), plain labels, maps from real data.
import React from 'react';
import { AbsoluteFill, Img, OffthreadVideo, staticFile, interpolate, Easing } from 'remotion';
import './fonts.css';
import './fonts_display.css';
export const FPS = 30;
export const SANS = 'Inter, sans-serif';
export const DISPLAY = "'Bebas', Inter, sans-serif";
export const BG = '#0B0C0D';
export const INK = '#F2EFE9';
export const ACC = '#E8A33D';
export const RED = '#E0533A';
export type SP = { t: number; dur: number };
export const pe = (t: number, at: number, d = 0.5) => interpolate(t, [at, at + d], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
// slow, steady push: scale s0->s1 around a focus point (fractions of the frame)
const push = (t: number, dur: number, s0 = 1, s1 = 1.05, fx = 0.5, fy = 0.5) => {
  const k = interpolate(t, [0, Math.max(dur, 0.1)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.sin) });
  return { transform: `scale(${s0 + (s1 - s0) * k})`, transformOrigin: `${fx * 100}% ${fy * 100}%` };
};
export const Photo: React.FC<SP & { src: string; s0?: number; s1?: number; fx?: number; fy?: number }> = (p) => (
  <AbsoluteFill style={{ background: BG, overflow: 'hidden' }}>
    <AbsoluteFill style={push(p.t, p.dur, p.s0 ?? 1, p.s1 ?? 1.05, p.fx, p.fy)}>
      <Img src={staticFile('img/' + p.src)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
    </AbsoluteFill>
  </AbsoluteFill>
);
export const Film: React.FC<SP & { src: string; from?: number; s0?: number; s1?: number; fx?: number; fy?: number }> = (p) => (
  <AbsoluteFill style={{ background: BG, overflow: 'hidden' }}>
    <AbsoluteFill style={push(p.t, p.dur, p.s0 ?? 1, p.s1 ?? 1, p.fx, p.fy)}>
      <OffthreadVideo src={staticFile('vid/' + p.src)} startFrom={Math.round((p.from ?? 0) * FPS)} muted style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
    </AbsoluteFill>
  </AbsoluteFill>
);
const shadow = '0 2px 10px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.9)';
// source label: what it is · where/when, and the credit line
export const Label: React.FC<{ t: number; at?: number; text: string; credit?: string; right?: boolean }> = ({ t, at = 0.3, text, credit, right }) => (<>
  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 230, background: 'linear-gradient(0deg, rgba(0,0,0,0.55), rgba(0,0,0,0))', opacity: pe(t, at, 0.5) }} />
  <div style={{ position: 'absolute', [right ? 'right' : 'left']: 70, bottom: 56, maxWidth: 1100, opacity: pe(t, at, 0.5), textAlign: right ? 'right' : 'left', textShadow: shadow }}>
    <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 34, color: INK, lineHeight: 1.25 }}>{text}</div>
    {credit && <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 25, color: 'rgba(242,239,233,0.78)', marginTop: 6 }}>{credit}</div>}
  </div>
</>);
export const DateSuper: React.FC<{ t: number; at?: number; big: string; small: string }> = ({ t, at = 0.4, big, small }) => (
  <div style={{ position: 'absolute', left: 70, top: 64, opacity: pe(t, at, 0.6), textShadow: shadow }}>
    <div style={{ fontFamily: DISPLAY, fontSize: 92, color: INK, letterSpacing: 2, lineHeight: 0.95 }}>{big}</div>
    <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 30, color: INK, letterSpacing: 3, marginTop: 8 }}>{small}</div>
  </div>
);
export const Lower: React.FC<{ t: number; at?: number; name: string; role: string }> = ({ t, at = 0.2, name, role }) => {
  const k = pe(t, at, 0.5);
  return (
    <div style={{ position: 'absolute', left: 110, bottom: 110, opacity: k, textShadow: shadow }}>
      <div style={{ width: 70 * k, height: 4, background: ACC, marginBottom: 12 }} />
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 40, color: INK }}>{name}</div>
      <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 26, color: 'rgba(242,239,233,0.85)', marginTop: 4 }}>{role}</div>
    </div>
  );
};
