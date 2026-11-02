// Dark maps of Maui / Lahaina (Natural Earth + OpenStreetMap). Units: km, origin at Maui centre.
import React from 'react';
import { AbsoluteFill, interpolate, Easing } from 'remotion';
import M from './data/map.json';
import { C, SANS, DISPLAY, pe, lin, SP } from './lib';

type Key = { t: number; x: number; y: number; w: number }; // camera centre (km) and visible width (km)
export const cam = (keys: Key[], t: number) => {
  if (t <= keys[0].t) return keys[0];
  for (let i = 1; i < keys.length; i++) if (t <= keys[i].t) {
    const a = keys[i - 1], b = keys[i]; const k = interpolate(t, [a.t, b.t], [0, 1], { easing: Easing.bezier(0.45, 0, 0.25, 1) });
    // zoom in log space feels natural
    const w = Math.exp(Math.log(a.w) + (Math.log(b.w) - Math.log(a.w)) * k);
    return { t, x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, w };
  }
  return keys[keys.length - 1];
};
const LAH = M.lahaina as number[];
export const LAHAINA = { x: LAH[0], y: LAH[1] };
export const IGN = { x: (M.ignition as number[])[0], y: (M.ignition as number[])[1] };

export const MapBase: React.FC<SP & { keys: Key[]; children?: (k: number, c: Key) => React.ReactNode; streets?: number; labels?: boolean }> = (p) => {
  const c = cam(p.keys, p.t);
  const k = 1920 / c.w; // px per km
  const vb = `${c.x - c.w / 2} ${c.y - (c.w * 1080) / 1920 / 2} ${c.w} ${(c.w * 1080) / 1920}`;
  const st = p.streets ?? interpolate(c.w, [3, 12], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: C.sea, overflow: 'hidden' }}>
      <svg width="1920" height="1080" viewBox={vb} preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="seaG" cx="50%" cy="50%" r="70%"><stop offset="0%" stopColor="#12283A" /><stop offset="100%" stopColor="#060D13" /></radialGradient>
        </defs>
        <rect x={c.x - c.w} y={c.y - c.w} width={c.w * 2} height={c.w * 2} fill="url(#seaG)" />
        {(M.land as string[]).map((d, i) => <path key={i} d={d} fill={C.land} stroke="rgba(243,238,230,0.35)" strokeWidth={1.4 / k} />)}
        {st > 0.01 && (
          <g opacity={st}>
            {(M.bld as string[]).map((d, i) => <path key={'b' + i} d={d} fill="rgba(243,238,230,0.10)" />)}
            {(M.roads as string[]).map((d, i) => <path key={'r' + i} d={d} fill="none" stroke="rgba(243,238,230,0.22)" strokeWidth={1.2 / k} />)}
            {(M.major as any[]).map((m, i) => <path key={'m' + i} d={m.d} fill="none" stroke="rgba(243,238,230,0.45)" strokeWidth={2.6 / k} />)}
          </g>
        )}
        {p.children && p.children(k, c)}
      </svg>
      <div style={{ position: 'absolute', left: 40, bottom: 28, fontFamily: SANS, fontSize: 17, color: 'rgba(243,238,230,0.5)' }}>Map data: Natural Earth · © OpenStreetMap contributors{st > 0.3 ? ' · present-day streets' : ''}</div>
    </AbsoluteFill>
  );
};
// map label in screen-independent size (sized by px-per-km)
export const MLabel: React.FC<{ x: number; y: number; k: number; text: string; size?: number; color?: string; o?: number; dy?: number; font?: string; anchor?: 'middle' | 'start' }> = ({ x, y, k, text, size = 34, color = C.ink, o = 1, dy = 0, font = SANS, anchor = 'middle' }) => (
  <text x={x} y={y + dy / k} textAnchor={anchor} fontFamily={font} fontWeight={700} fontSize={size / k} letterSpacing={(size * 0.18) / k} fill={color} opacity={o} style={{ paintOrder: 'stroke', stroke: 'rgba(7,9,11,0.85)', strokeWidth: 6 / k } as any}>{text}</text>
);
export const Pulse: React.FC<{ x: number; y: number; k: number; t: number; at: number; color?: string; r?: number }> = ({ x, y, k, t, at, color = C.red, r = 10 }) => {
  if (t < at) return null;
  const ph = ((t - at) % 1.2) / 1.2;
  return (
    <g>
      <circle cx={x} cy={y} r={(r + 40 * ph) / k} fill="none" stroke={color} strokeWidth={3 / k} opacity={1 - ph} />
      <circle cx={x} cy={y} r={r / k} fill={color} opacity={pe(t, at, 0.3)} />
    </g>
  );
};
// animated wind streaks moving from east to west (the downslope wind that drove the fire)
export const Wind: React.FC<{ t: number; k: number; c: { x: number; y: number; w: number }; o?: number }> = ({ t, k, c, o = 1 }) => {
  const n = 70; const h = (c.w * 1080) / 1920;
  return (
    <g opacity={o}>
      {Array.from({ length: n }).map((_, i) => {
        const r1 = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1, r2 = Math.abs(Math.sin(i * 78.233) * 12345.678) % 1;
        const speed = 0.35 + 0.4 * r2; const ph = (t * speed + r1) % 1;
        const x = c.x + c.w / 2 - ph * c.w * 1.3; const y = c.y - h / 2 + r2 * h;
        const len = (60 + 120 * r1) / k;
        return <line key={i} x1={x} y1={y} x2={x + len} y2={y - len * 0.18} stroke="rgba(243,238,230,0.55)" strokeWidth={(1.5 + 1.5 * r1) / k} strokeLinecap="round" opacity={Math.sin(Math.PI * ph)} />;
      })}
    </g>
  );
};
export const SIRENS = M.sirens as number[][];
