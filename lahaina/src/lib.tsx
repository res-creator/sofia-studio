// Dark cinematic kit for the Lahaina episode.
import React from 'react';
import { AbsoluteFill, Img, OffthreadVideo, staticFile, interpolate, Easing, useCurrentFrame } from 'remotion';
import './fonts.css';
import './fonts_display.css';

export const FPS = 30;
export const C = {
  bg: '#07090B',
  ink: '#F3EEE6',
  dim: 'rgba(243,238,230,0.62)',
  red: '#E5352B',
  fire: '#FF7A1F',
  ember: '#FFB347',
  sea: '#0E1C26',
  land: '#1A1F22',
  line: 'rgba(243,238,230,0.16)',
};
export const SANS = 'Inter, sans-serif';
export const DISPLAY = "'Bebas', Inter, sans-serif";

export const ex = Easing.bezier(0.16, 1, 0.3, 1);
export const eio = Easing.bezier(0.65, 0, 0.35, 1);
export const pe = (t: number, t0: number, d: number, e = ex) => interpolate(t, [t0, t0 + d], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e });
export const lin = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
export const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

export type SP = { t: number; dur: number };

// ---- film look: grain, vignette, warm/teal grade (always covers the full frame)
export const Grain: React.FC<{ o?: number }> = ({ o = 0.09 }) => {
  const f = useCurrentFrame(); const seed = f % 10;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'overlay', opacity: o }}>
      <svg width="1920" height="1080"><filter id={`gr${seed}`}><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter><rect width="1920" height="1080" filter={`url(#gr${seed})`} /></svg>
    </AbsoluteFill>
  );
};
export const Vignette: React.FC<{ o?: number }> = ({ o = 0.85 }) => (
  <AbsoluteFill style={{ pointerEvents: 'none', background: `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,${o}) 100%)` }} />
);
const GRADE = 'saturate(0.62) contrast(1.16) brightness(0.78) sepia(0.12)';
export const Tint: React.FC = () => (
  <>
    <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'soft-light', background: 'linear-gradient(180deg, rgba(20,60,80,0.55) 0%, rgba(0,0,0,0) 45%, rgba(255,110,40,0.35) 100%)' }} />
    <Vignette />
  </>
);

// ---- camera move over a still or a clip (scale never below 1.06 -> no edges ever show)
export type Cam = { s0?: number; s1?: number; x0?: number; x1?: number; y0?: number; y1?: number };
const camStyle = (p: SP, c: Cam = {}) => {
  const q = interpolate(p.t, [0, Math.max(0.5, p.dur)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.3, 0, 0.3, 1) });
  const s = Math.max(1.06, (c.s0 ?? 1.08) + ((c.s1 ?? 1.18) - (c.s0 ?? 1.08)) * q);
  const lim = ((s - 1) / 2) * 100 * 0.95; // max pan in % that keeps the frame covered
  const cl = (v: number) => Math.max(-lim, Math.min(lim, v));
  const x = cl((c.x0 ?? 0) + ((c.x1 ?? 0) - (c.x0 ?? 0)) * q), y = cl((c.y0 ?? 0) + ((c.y1 ?? 0) - (c.y0 ?? 0)) * q);
  return { transform: `translate(${x}%, ${y}%) scale(${s})` };
};
export const Still: React.FC<SP & { src: string; cam?: Cam; grade?: string }> = (p) => (
  <AbsoluteFill style={{ overflow: 'hidden', background: C.bg }}>
    <Img src={staticFile('img/' + p.src)} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: p.grade ?? GRADE, ...camStyle(p, p.cam) }} />
    <Tint />
  </AbsoluteFill>
);
export const Clip: React.FC<SP & { src: string; from?: number; cam?: Cam; rate?: number }> = (p) => (
  <AbsoluteFill style={{ overflow: 'hidden', background: C.bg }}>
    <OffthreadVideo src={staticFile('vid/' + p.src)} startFrom={Math.round((p.from ?? 0) * FPS)} playbackRate={p.rate ?? 1} muted style={{ width: '100%', height: '100%', objectFit: 'cover', filter: GRADE, ...camStyle(p, { s0: 1.06, s1: 1.12, ...p.cam }) }} />
    <Tint />
  </AbsoluteFill>
);

// ---- typography
// big kinetic word: slams in (scale + blur), optional red
export const Slam: React.FC<{ t: number; at: number; text: string; size?: number; color?: string; y?: number; glow?: boolean; track?: number }> = ({ t, at, text, size = 220, color = C.ink, y = 0, glow, track = 4 }) => {
  const k = pe(t, at, 0.28, Easing.bezier(0.5, 0, 0.2, 1));
  if (t < at) return null;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', transform: `translateY(${y}px)` }}>
      <div style={{ fontFamily: DISPLAY, fontSize: size, letterSpacing: track, lineHeight: 0.9, color, opacity: Math.min(1, k * 2), transform: `scale(${1.5 - 0.5 * k})`, filter: k < 0.99 ? `blur(${(1 - k) * 12}px)` : undefined, textShadow: glow ? `0 0 40px rgba(229,53,43,0.55), 0 0 90px rgba(255,122,31,0.35)` : '0 6px 30px rgba(0,0,0,0.6)', textAlign: 'center' }}>{text}</div>
    </AbsoluteFill>
  );
};
// typed HUD line (timestamps, places)
export const Type: React.FC<{ t: number; at: number; text: string; size?: number; color?: string; cps?: number; style?: React.CSSProperties }> = ({ t, at, text, size = 44, color = C.ink, cps = 28, style }) => {
  const n = Math.max(0, Math.min(text.length, Math.floor((t - at) * cps)));
  if (t < at) return null;
  const caret = n < text.length || Math.floor(t * 2.5) % 2 === 0;
  return <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: size, letterSpacing: 6, color, textTransform: 'uppercase', fontVariantNumeric: 'tabular-nums', textShadow: '0 2px 18px rgba(0,0,0,0.7)', ...style }}>{text.slice(0, n)}<span style={{ opacity: caret ? 1 : 0, color: C.red }}>▍</span></div>;
};
// timestamp block bottom-left: "06:37 AM" + caption
export const Stamp: React.FC<{ t: number; at: number; time: string; sub?: string }> = ({ t, at, time, sub }) => {
  const k = pe(t, at, 0.5);
  if (t < at) return null;
  return (
    <div style={{ position: 'absolute', left: 90, bottom: 96, opacity: k, transform: `translateX(${(1 - k) * -30}px)` }}>
      <div style={{ width: 70 * k, height: 4, background: C.red, marginBottom: 14 }} />
      <div style={{ fontFamily: DISPLAY, fontSize: 120, letterSpacing: 3, color: C.ink, lineHeight: 0.9, textShadow: '0 4px 24px rgba(0,0,0,0.7)' }}>{time}</div>
      {sub && <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 40, letterSpacing: 4, color: C.ink, marginTop: 10, textTransform: 'uppercase' }}>{sub}</div>}
    </div>
  );
};
// counting number
export const Count: React.FC<{ t: number; at: number; to: number; d?: number; size?: number; color?: string; suffix?: string; label?: string; y?: number }> = ({ t, at, to, d = 1.1, size = 260, color = C.ink, suffix = '', label, y = 0 }) => {
  if (t < at) return null;
  const k = pe(t, at, d, Easing.bezier(0.2, 0.6, 0.3, 1));
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', transform: `translateY(${y}px)` }}>
      <div style={{ fontFamily: DISPLAY, fontSize: size, color, lineHeight: 0.85, letterSpacing: 2, fontVariantNumeric: 'tabular-nums', textShadow: '0 6px 40px rgba(0,0,0,0.7)', opacity: Math.min(1, pe(t, at, 0.2) * 1.2) }}>{fmt(to * k)}{suffix}</div>
      {label && <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 44, letterSpacing: 8, color: C.ink, marginTop: 18, textTransform: 'uppercase', opacity: pe(t, at + 0.3, 0.5), textShadow: '0 2px 16px rgba(0,0,0,0.8)' }}>{label}</div>}
    </AbsoluteFill>
  );
};
// small source / honesty labels
export const Credit: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: 'absolute', right: 40, bottom: 30, fontFamily: SANS, fontSize: 22, color: 'rgba(243,238,230,0.6)', letterSpacing: 0.5 }}>{text}</div>
);
export const Tag: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: 'absolute', right: 56, top: 50, fontFamily: SANS, fontWeight: 700, fontSize: 28, letterSpacing: 4, color: C.ink, padding: '10px 16px', border: `1.5px solid ${C.red}`, background: 'rgba(7,9,11,0.6)', textTransform: 'uppercase' }}>{text}</div>
);

// ---- quick photo burst: 3-4 frames popping in one after another ("chik-chik-chik")
export const Burst: React.FC<SP & { srcs: string[]; step?: number; caption?: string }> = (p) => {
  const step = p.step ?? 0.45;
  const n = p.srcs.length;
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden' }}>
      <Still t={p.t} dur={p.dur} src={p.srcs[0]} cam={{ s0: 1.1, s1: 1.22 }} />
      <AbsoluteFill style={{ background: 'rgba(0,0,0,0.35)' }} />
      {p.srcs.slice(1).map((s, i) => {
        const at = (i + 1) * step; const k = pe(p.t, at, 0.22, Easing.bezier(0.3, 1.4, 0.5, 1));
        if (p.t < at) return null;
        const pos = [[-420, -120, -4], [380, -40, 3], [-40, 150, -2], [420, 200, 4]][i % 4];
        return (
          <div key={i} style={{ position: 'absolute', left: 960 - 380 + pos[0], top: 540 - 240 + pos[1], width: 760, height: 480, border: '10px solid #EDE7DD', boxShadow: '0 30px 70px rgba(0,0,0,0.65)', overflow: 'hidden', transform: `scale(${0.7 + 0.3 * k}) rotate(${pos[2]}deg)`, opacity: Math.min(1, k * 2), zIndex: i + 2 }}>
            <Img src={staticFile('img/' + s)} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: GRADE, transform: `scale(${1.05 + 0.05 * lin(p.t, at, p.dur)})` }} />
          </div>
        );
      })}
      {n > 0 && <Vignette o={0.7} />}
    </AbsoluteFill>
  );
};

// ---- quote card: optional portrait (or silhouette), name, role, and the quote typed out with bold keywords (**word**)
export const Quote: React.FC<SP & { text: string; who: string; role?: string; photo?: string; bg?: string; at?: number }> = (p) => {
  const at = p.at ?? 0.2;
  const parts = p.text.split(/(\*\*[^*]+\*\*)/).filter(Boolean);
  const words: { w: string; b: boolean }[] = [];
  parts.forEach((s) => { const b = s.startsWith('**'); s.replace(/\*\*/g, '').split(' ').filter(Boolean).forEach((w) => words.push({ w, b })); });
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden' }}>
      {p.bg && <AbsoluteFill style={{ opacity: 0.35 }}><Still t={p.t} dur={p.dur} src={p.bg} cam={{ s0: 1.15, s1: 1.25 }} /></AbsoluteFill>}
      <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(7,9,11,0.92) 0%, rgba(7,9,11,0.75) 55%, rgba(7,9,11,0.55) 100%)' }} />
      <div style={{ position: 'absolute', left: 150, top: 230, width: 420, height: 540, border: `3px solid ${C.ink}`, overflow: 'hidden', background: '#15191C', opacity: pe(p.t, 0, 0.5), transform: `translateY(${(1 - pe(p.t, 0, 0.6)) * 30}px)` }}>
        {p.photo ? <Img src={staticFile('img/' + p.photo)} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) contrast(1.1)' }} /> : (
          <svg width="420" height="540" viewBox="0 0 420 540"><circle cx="210" cy="200" r="95" fill="#2A3035" /><path d="M40,540 C60,370 140,320 210,320 C280,320 360,370 380,540 Z" fill="#2A3035" /></svg>
        )}
      </div>
      <div style={{ position: 'absolute', left: 150, top: 790, width: 560, opacity: pe(p.t, 0.3, 0.5) }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 36, color: C.ink, letterSpacing: 1 }}>{p.who}</div>
        {p.role && <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 26, color: C.dim, marginTop: 6 }}>{p.role}</div>}
      </div>
      <div style={{ position: 'absolute', left: 680, top: 240, width: 1100, fontFamily: SANS, fontSize: 56, lineHeight: 1.32, color: C.ink }}>
        <span style={{ fontFamily: DISPLAY, fontSize: 140, color: C.red, lineHeight: 0, position: 'relative', top: 52, marginRight: 10, opacity: pe(p.t, at, 0.3) }}>“</span>
        {words.map((x, i) => { const k = pe(p.t, at + i * 0.07, 0.25); return <span key={i} style={{ opacity: 0.15 + 0.85 * k, fontWeight: x.b ? 800 : 400, color: x.b ? C.ember : C.ink }}>{x.w} </span>; })}
      </div>
    </AbsoluteFill>
  );
};
// ---- lower third for a real person speaking on archival video
export const Lower: React.FC<{ t: number; at?: number; name: string; role?: string }> = ({ t, at = 0.3, name, role }) => {
  const k = pe(t, at, 0.6);
  return (
    <div style={{ position: 'absolute', left: 90, bottom: 120, opacity: k, transform: `translateX(${(1 - k) * -40}px)` }}>
      <div style={{ width: 80 * k, height: 4, background: C.red, marginBottom: 12 }} />
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 40, color: C.ink, textShadow: '0 2px 16px rgba(0,0,0,0.8)' }}>{name}</div>
      {role && <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 28, color: C.ink, opacity: 0.8, marginTop: 4, textShadow: '0 2px 16px rgba(0,0,0,0.8)' }}>{role}</div>}
    </div>
  );
};
// ---- burned-in subtitle for archival speech
export const Sub: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 60, textAlign: 'center' }}>
    <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 42, color: '#FFF', background: 'rgba(0,0,0,0.7)', padding: '8px 20px', lineHeight: 1.5, boxDecorationBreak: 'clone' } as any}>{text}</span>
  </div>
);
// ---- chapter title over footage (part number + title, 2 s)
export const Part: React.FC<{ t: number; n: number; title: string }> = ({ t, n, title }) => {
  const k = pe(t, 0.1, 0.6), out = 1 - pe(t, 2.2, 0.5);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: Math.min(k, out) }}>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: 14, color: C.red }}>PART {n}</div>
      <div style={{ width: 90 * k, height: 3, background: C.ink, margin: '18px 0' }} />
      <div style={{ fontFamily: DISPLAY, fontSize: 150, letterSpacing: 8 + 10 * (1 - k), color: C.ink, textShadow: '0 6px 40px rgba(0,0,0,0.8)' }}>{title}</div>
    </AbsoluteFill>
  );
};
