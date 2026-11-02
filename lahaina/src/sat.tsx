// Realistic map shots: real Sentinel-2 imagery (Copernicus) layered from island scale down to street scale,
// with HUD overlays (burn-scar outline from the satellite data itself, highway, labels, markers).
import React from 'react';
import { AbsoluteFill, Img, staticFile, interpolate, Easing } from 'remotion';
import M from './data/map.json';
import BURN from './data/burn.json';
import { C, SANS, DISPLAY, pe, lin, SP } from './lib';

const O = M.origin as number[];
export const P = (lon: number, lat: number) => [(lon - O[0]) * 111.32 * Math.cos((O[1] * Math.PI) / 180), -(lat - O[1]) * 110.57];
const LAYERS: { key: string; b: [number, number, number, number] }[] = [
  { key: 'maui', b: [-156.72, 20.56, -155.95, 21.05] },
  { key: 'westmaui', b: [-156.72, 20.78, -156.46, 21.03] },
  { key: 'lahaina', b: [-156.705, 20.86, -156.655, 20.90] },
];
export type GKey = { t: number; lon: number; lat: number; w: number }; // w = visible width in km
const camAt = (keys: GKey[], t: number) => {
  if (t <= keys[0].t) return keys[0];
  for (let i = 1; i < keys.length; i++) if (t <= keys[i].t) {
    const a = keys[i - 1], b = keys[i]; const k = interpolate(t, [a.t, b.t], [0, 1], { easing: Easing.bezier(0.45, 0, 0.2, 1) });
    return { t, lon: a.lon + (b.lon - a.lon) * k, lat: a.lat + (b.lat - a.lat) * k, w: Math.exp(Math.log(a.w) + (Math.log(b.w) - Math.log(a.w)) * k) };
  }
  return keys[keys.length - 1];
};
export const LAH = { lon: -156.6825, lat: 20.8783 };

export type Overlay = (sc: (lon: number, lat: number) => number[], kpx: number, t: number) => React.ReactNode;
export const Sat: React.FC<SP & { keys: GKey[]; scene?: 'pre' | 'post' | 'day'; burn?: { at: number; d?: number; fill?: boolean }; hwy?: number; labels?: { lon: number; lat: number; text: string; at: number; size?: number; color?: string }[]; overlay?: Overlay; dim?: number; tag?: string; wipe?: { at: number; d: number } }> = (p) => {
  const c = camAt(p.keys.map((k) => ({ ...k })), p.t);
  const [cx, cy] = P(c.lon, c.lat);
  const kpx = 1920 / c.w; // px per km
  const sc = (lon: number, lat: number) => { const [x, y] = P(lon, lat); return [960 + (x - cx) * kpx, 540 + (y - cy) * kpx]; };
  const scK = (x: number, y: number) => [960 + (x - cx) * kpx, 540 + (y - cy) * kpx];
  const scene = p.scene ?? 'pre';
  const layer = (sceneKey: string, clip?: string) => (
    <AbsoluteFill style={{ clipPath: clip }}>
      {LAYERS.map((L) => {
        const [x0, y0] = sc(L.b[0], L.b[3]); const [x1, y1] = sc(L.b[2], L.b[1]);
        // skip layers that are far too coarse/fine for this zoom
        const pxPerSrc = (x1 - x0) / (L.key === 'lahaina' ? 526 : L.key === 'westmaui' ? 2747 : 3000);
        if (L.key === 'lahaina' && pxPerSrc < 0.6) return null;
        return <Img key={L.key} src={staticFile(`sat/${sceneKey}_${L.key}.jpg`)} style={{ position: 'absolute', left: x0, top: y0, width: x1 - x0, height: y1 - y0, filter: 'saturate(0.85) contrast(1.08) brightness(0.82)', imageRendering: pxPerSrc > 2.5 ? 'auto' : 'auto' }} />;
      })}
    </AbsoluteFill>
  );
  const wk = p.wipe ? pe(p.t, p.wipe.at, p.wipe.d, Easing.bezier(0.65, 0, 0.35, 1)) : 0;
  const burnK = p.burn ? pe(p.t, p.burn.at, p.burn.d ?? 1.6, (x) => x) : 0;
  return (
    <AbsoluteFill style={{ background: '#0B1A24', overflow: 'hidden' }}>
      {layer(scene)}
      {p.wipe && layer('post', `inset(0 0 0 ${(1 - wk) * 100}%)`)}
      {p.wipe && wk > 0 && wk < 1 && <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${(1 - wk) * 100}%`, width: 4, background: C.ink, boxShadow: '0 0 18px rgba(0,0,0,0.8)' }} />}
      <AbsoluteFill style={{ background: `rgba(5,8,10,${p.dim ?? 0.18})` }} />
      <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0 }}>
        {p.hwy !== undefined && (M.major as any[]).filter((m) => m.name === 'Honoapiilani Highway').map((m, i) => {
          const pts = (m.d as string).slice(1).split('L').map((q) => q.split(',').map(Number)).map(([x, y]) => scK(x, y));
          return <polyline key={i} points={pts.map((q) => q.join(',')).join(' ')} fill="none" stroke={C.red} strokeWidth={5} strokeLinecap="round" opacity={pe(p.t, p.hwy!, 0.5)} />;
        })}
        {p.burn && (BURN.polys as number[][][]).map((poly, i) => {
          const pts = poly.map(([x, y]) => scK(x, y)); const n = Math.max(2, Math.round(pts.length * burnK));
          return (
            <g key={i}>
              {p.burn!.fill && burnK > 0.98 && <polygon points={pts.map((q) => q.join(',')).join(' ')} fill="rgba(229,53,43,0.14)" />}
              <polyline points={pts.slice(0, n).map((q) => q.join(',')).join(' ')} fill="none" stroke={C.red} strokeWidth={4} strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 6px rgba(229,53,43,0.8))' }} />
            </g>
          );
        })}
        {p.overlay && p.overlay(sc, kpx, p.t)}
        {(p.labels ?? []).map((l, i) => {
          const [x, y] = sc(l.lon, l.lat); const o = pe(p.t, l.at, 0.4);
          return <text key={i} x={x} y={y} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={l.size ?? 30} letterSpacing={4} fill={l.color ?? C.ink} opacity={o} style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.75)', strokeWidth: 6 } as any}>{l.text}</text>;
        })}
      </svg>
      <div style={{ position: 'absolute', left: 40, bottom: 28, fontFamily: SANS, fontSize: 20, color: 'rgba(243,238,230,0.6)' }}>Contains modified Copernicus Sentinel-2 data (2023){p.hwy !== undefined || p.labels ? ' · roads: © OpenStreetMap contributors' : ''}</div>
      {p.tag && <div style={{ position: 'absolute', right: 56, top: 50, fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: 4, color: C.ink, padding: '9px 15px', border: `1.5px solid ${C.red}`, background: 'rgba(7,9,11,0.6)', textTransform: 'uppercase' }}>{p.tag}</div>}
    </AbsoluteFill>
  );
};
// HUD marker (pulsing ring + label)
export const Marker: React.FC<{ x: number; y: number; t: number; at: number; label?: string; color?: string }> = ({ x, y, t, at, label, color = C.red }) => {
  if (t < at) return null; const ph = ((t - at) % 1.2) / 1.2;
  return (
    <g>
      <circle cx={x} cy={y} r={10 + 40 * ph} fill="none" stroke={color} strokeWidth={3} opacity={1 - ph} />
      <circle cx={x} cy={y} r={9} fill={color} />
      {label && <text x={x + 22} y={y - 16} fontFamily={SANS} fontWeight={800} fontSize={30} letterSpacing={3} fill={C.ink} style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.8)', strokeWidth: 7 } as any}>{label}</text>}
    </g>
  );
};
