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
export const Label: React.FC<{ t: number; at?: number; text: string; credit?: string; right?: boolean; top?: boolean }> = ({ t, at = 0.3, text, credit, right, top }) => (<>
  <div style={{ position: 'absolute', left: 0, right: 0, [top ? 'top' : 'bottom']: 0, height: 270, transform: top ? 'scaleY(-1)' : undefined, background: 'linear-gradient(0deg, rgba(0,0,0,0.74), rgba(0,0,0,0.35) 55%, rgba(0,0,0,0))', opacity: pe(t, at, 0.5) }} />
  <div style={{ position: 'absolute', [right ? 'right' : 'left']: 70, [top ? 'top' : 'bottom']: top ? 50 : 56, maxWidth: 1100, opacity: pe(t, at, 0.5), textAlign: right ? 'right' : 'left', textShadow: shadow }}>
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
    <div style={{ position: 'absolute', left: 80, bottom: 90, opacity: k, textShadow: shadow, background: 'rgba(8,9,10,0.72)', padding: '16px 30px 18px', borderRadius: 6 }}>
      <div style={{ width: 70 * k, height: 4, background: ACC, marginBottom: 12 }} />
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 40, color: INK }}>{name}</div>
      <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 26, color: 'rgba(242,239,233,0.85)', marginTop: 4 }}>{role}</div>
    </div>
  );
};
// Document: the real page in context first, then a slow move to the lines that matter; the rest dims.
// box = [x0, y0, x1, y1] in page fractions (from pdftotext -bbox); zoomAt = local time when the move starts
export const Doc: React.FC<SP & { src: string; aspect: number; box: number[]; zoomAt?: number; zoom?: number }> = (p) => {
  const H = 1000, W = H * p.aspect; // page drawn 1000 px tall, centred
  const zk = pe(p.t, p.zoomAt ?? 1.2, 1.6); const z = 1 + ((p.zoom ?? 2.3) - 1) * zk;
  const [x0, y0, x1, y1] = p.box; const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const tx = (0.5 - cx) * W * zk, ty = (0.5 - cy) * H * zk;
  const dim = 0.6 * pe(p.t, (p.zoomAt ?? 1.2) + 1.0, 0.6);
  return (
    <AbsoluteFill style={{ background: '#16171A', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 960 - W / 2, top: 40, width: W, height: H, transform: `scale(${z}) translate(${tx}px, ${ty}px)`, transformOrigin: '50% 50%', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
        <Img src={staticFile('doc/' + p.src)} style={{ width: '100%', height: '100%' }} />
        <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
          <defs><mask id={'m' + p.src}><rect width={W} height={H} fill="white" /><rect x={x0 * W - 8} y={y0 * H - 6} width={(x1 - x0) * W + 16} height={(y1 - y0) * H + 12} fill="black" /></mask></defs>
          <rect width={W} height={H} fill="black" opacity={dim} mask={`url(#m${p.src})`} />
          <rect x={x0 * W - 8} y={y0 * H - 6} width={(x1 - x0) * W + 16} height={(y1 - y0) * H + 12} fill="none" stroke={ACC} strokeWidth={3 / z} opacity={pe(p.t, (p.zoomAt ?? 1.2) + 1.2, 0.5)} />
        </svg>
      </div>
    </AbsoluteFill>
  );
};
// ---- main film additions
export const Chapter: React.FC<{ t: number; n: number; title: string }> = ({ t, n, title }) => (
  <div style={{ position: 'absolute', left: 70, top: 56, opacity: pe(t, 0.2, 0.5) * (1 - pe(t, 4.0, 0.8)), textShadow: shadow, background: 'rgba(8,9,10,0.6)', padding: '10px 20px', borderRadius: 6 }}>
    <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, color: ACC, letterSpacing: 3 }}>{n} · </span>
    <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, color: INK, letterSpacing: 3 }}>{title}</span>
  </div>
);
// a documented quote over a photo or on its own (source always shown)
export const Quote: React.FC<{ t: number; at?: number; text: string; src: string; side?: boolean }> = ({ t, at = 0.4, text, src, side }) => (
  <div style={{ position: 'absolute', right: side ? 80 : 160, left: side ? 1060 : 160, top: side ? 200 : 300, opacity: pe(t, at, 0.5), background: side ? 'rgba(8,9,10,0.78)' : 'transparent', padding: side ? '26px 32px' : 0, borderRadius: 8, textAlign: side ? 'left' : 'center' }}>
    <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: side ? 40 : 56, color: INK, lineHeight: 1.3 }}>{text}</div>
    <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: side ? 24 : 28, color: 'rgba(242,239,233,0.78)', marginTop: 18 }}>{src}</div>
  </div>
);
export const Stamp: React.FC<{ t: number; at: number; text: string }> = ({ t, at, text }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', opacity: pe(t, at, 0.35) }}>
    <span style={{ display: 'inline-block', fontFamily: DISPLAY, fontSize: 100, color: BG, background: ACC, padding: '6px 40px', letterSpacing: 4, transform: `rotate(-2deg) scale(${1.15 - 0.15 * pe(t, at, 0.3)})`, boxShadow: '0 10px 40px rgba(0,0,0,0.6)' }}>{text}</span>
  </div>
);
// people/role table: rows appear at given times; hl = highlighted rows
export const Roster: React.FC<{ t: number; title: string; rows: { who: string; role: string; note?: string; at: number }[]; src?: string }> = ({ t, title, rows, src }) => (
  <AbsoluteFill style={{ background: BG }}>
    <div style={{ position: 'absolute', left: 160, top: 110, fontFamily: SANS, fontWeight: 800, fontSize: 46, color: ACC, letterSpacing: 3, opacity: pe(t, 0.1) }}>{title}</div>
    {rows.map((r, i) => (
      <div key={i} style={{ position: 'absolute', left: 160, top: 230 + i * 118, width: 1600, opacity: pe(t, r.at, 0.5), borderTop: '2px solid rgba(242,239,233,0.18)', paddingTop: 16, display: 'flex', alignItems: 'baseline' }}>
        <div style={{ width: 700, fontFamily: SANS, fontWeight: 700, fontSize: 44, color: INK }}>{r.who}</div>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 34, color: 'rgba(242,239,233,0.85)' }}>{r.role}{r.note && <span style={{ color: RED, fontWeight: 700 }}>{' · ' + r.note}</span>}</div>
      </div>
    ))}
    {src && <div style={{ position: 'absolute', left: 70, bottom: 40, fontFamily: SANS, fontSize: 22, color: 'rgba(242,239,233,0.7)' }}>{src}</div>}
  </AbsoluteFill>
);
export const TextCard: React.FC<{ t: number; title: string; lines: { s: string; at: number }[]; src?: string }> = ({ t, title, lines, src }) => (
  <AbsoluteFill style={{ background: BG }}>
    <div style={{ position: 'absolute', left: 160, top: 150, fontFamily: SANS, fontWeight: 800, fontSize: 46, color: ACC, letterSpacing: 3, opacity: pe(t, 0.1) }}>{title}</div>
    {lines.map((l, i) => <div key={i} style={{ position: 'absolute', left: 160, top: 270 + i * 130, width: 1600, fontFamily: SANS, fontWeight: 600, fontSize: 44, color: INK, lineHeight: 1.25, opacity: pe(t, l.at, 0.5) }}>{l.s}</div>)}
    {src && <div style={{ position: 'absolute', left: 70, bottom: 40, fontFamily: SANS, fontSize: 22, color: 'rgba(242,239,233,0.7)' }}>{src}</div>}
  </AbsoluteFill>
);
export const BigTime: React.FC<{ t: number; at?: number; text: string; sub?: string }> = ({ t, at = 0.2, text, sub }) => (
  <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: pe(t, at, 0.6) }}>
    <div style={{ fontFamily: DISPLAY, fontSize: 150, color: INK, letterSpacing: 4 }}>{text}</div>
    {sub && <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 32, color: 'rgba(242,239,233,0.8)', letterSpacing: 3 }}>{sub}</div>}
  </AbsoluteFill>
);
