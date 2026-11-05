// Rescue around the rig, night of April 20, 2010 — RECONSTRUCTION, positions approximate, not to scale.
// Confirmed points only: the Damon B. Bankston was alongside taking mud; its crew cut loose, backed off about 500 m and launched
// a fast rescue craft that pulled people from the water; both lifeboats and all 115 survivors ended up on the Bankston.
// Sources: USCG Joint Investigation report Vol. I, App. H-12 to H-21; National Commission report p. 12.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { SANS, INK, ACC, BG } from './kit';
import { k, WC } from './well';
const RIG = [720, 560], BK0 = [880, 560], BK1 = [1430, 640];
export const Rescue: React.FC<{ t: number; lb?: number; frc?: number; caption?: [string, string]; cam?: { x: number; y: number; s: number }; burn?: number; pickN?: number }> = ({ t, lb, frc, caption, cam = { x: 960, y: 560, s: 1 }, burn = 0, pickN = 1 }) => {
  const kb = k(t, 0.2, 2.5);
  const bx = BK0[0] + (BK1[0] - BK0[0]) * kb, by = BK0[1] + (BK1[1] - BK0[1]) * kb;
  const l = lb !== undefined ? k(t, lb, 4) : 0; const f = frc !== undefined ? (t - frc) : -1;
  const dots = [[640, 700], [600, 650], [790, 720], [560, 560], [700, 760]];
  const fx = f < 0 ? bx - 60 : f < 4 ? bx - 60 + (dots[0][0] + 40 - (bx - 60)) * k(f, 0, 4) : dots[0][0] + 40 + 30 * Math.sin(f * 0.6);
  const fy = f < 0 ? by + 30 : f < 4 ? by + 30 + (dots[0][1] - (by + 30)) * k(f, 0, 4) : dots[0][1] + 20 * Math.cos(f * 0.5);
  const txt = (x: number, y: number, s: string, c = INK, size = 28, a: 'start' | 'middle' | 'end' = 'start', w = 700) => <text x={x} y={y} fill={c} fontFamily={SANS} fontWeight={w} fontSize={size} textAnchor={a} style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.85)', strokeWidth: 5 }}>{s}</text>;
  return (
    <AbsoluteFill style={{ background: WC.water2 }}>
      <svg width={1920} height={1080} style={{ position: 'absolute', overflow: 'visible' }}><g transform={`translate(${960 - cam.x * cam.s},${540 - cam.y * cam.s}) scale(${cam.s})`}>
        <rect x={-2000} y={-2000} width={6000} height={6000} fill={WC.water2} />
        <defs><radialGradient id="glow"><stop offset="0" stopColor="#FFB347" stopOpacity="0.9" /><stop offset="1" stopColor="#E0533A" stopOpacity="0" /></radialGradient></defs>
        <circle cx={RIG[0]} cy={RIG[1]} r={230 + 10 * Math.sin(t * 2)} fill="url(#glow)" opacity={0.55} />
        <rect x={RIG[0] - 90} y={RIG[1] - 70} width={180} height={140} fill="#2A2E31" stroke={WC.steel} strokeWidth={4} />
        <circle cx={RIG[0]} cy={RIG[1]} r={26} fill={WC.hc} opacity={0.9} />
        {burn > 0 && [[600, 680, 90], [760, 700, 70], [650, 610, 60], [820, 640, 50]].map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y} rx={r * burn} ry={r * 0.5 * burn} fill="#F07A1A" opacity={0.35 + 0.1 * Math.sin(t * 3 + i)} />)}
        {burn > 0 && f < 0 && txt(470, 790, 'BURNING FUEL ON THE WATER', '#F7A35C', 26)}
        {txt(RIG[0], RIG[1] - 100, 'DEEPWATER HORIZON (ON FIRE)', INK, 30, 'middle')}
        {/* Bankston backing away */}
        <line x1={BK0[0]} y1={BK0[1]} x2={bx} y2={by} stroke={INK} strokeWidth={3} strokeDasharray="10 8" opacity={0.7} />
        <path d={`M${bx - 110},${by - 22} L${bx + 80},${by - 22} L${bx + 115},${by} L${bx + 80},${by + 22} L${bx - 110},${by + 22} Z`} fill="#C9CDD0" stroke="#000" strokeWidth={2} />
        {txt(bx, by - 46, 'DAMON B. BANKSTON', INK, 30, 'middle')}
        {txt(bx, by + 62, 'supply vessel · was alongside; backed off about 500 m', INK, 22, 'middle', 600)}
        {/* lifeboats to the Bankston */}
        {l > 0 && [0, 1].map((i) => { const x0 = RIG[0] - 40 + i * 80, y0 = RIG[1] - 80, x = x0 + (bx - 140 - i * 60 - x0) * l, y = y0 + (by - y0) * l - 120 * Math.sin(Math.PI * l);
          return <g key={i}><ellipse cx={x} cy={y} rx={26} ry={12} fill={ACC} stroke="#000" strokeWidth={2} /></g>; })}
        {l > 0 && txt(RIG[0] + 260, RIG[1] - 200, 'TWO LIFEBOATS → TO THE BANKSTON', ACC, 26, 'start')}
        {/* people in the water and the fast rescue craft */}
        {f >= 0 && dots.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={9} fill={INK} opacity={i < pickN && f > 5 + i * 4 ? 0 : 0.95} />)}
        {f >= 0 && txt(420, 770, 'PEOPLE IN THE WATER', INK, 26)}
        {f >= 0 && <g><path d={`M${fx - 22},${fy - 9} L${fx + 18},${fy - 9} L${fx + 28},${fy} L${fx + 18},${fy + 9} L${fx - 22},${fy + 9} Z`} fill="#F07A1A" stroke="#000" strokeWidth={2} />{txt(fx + 40, fy + 50, 'FAST RESCUE CRAFT (from the Bankston)', '#F7A35C', 24)}</g>}
      </g></svg>
      {caption && <div style={{ position: 'absolute', left: 70, bottom: 110, width: 900, background: 'rgba(8,9,10,0.8)', padding: '16px 24px', borderRadius: 6, opacity: k(t, 0.3, 0.5) }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 40, color: ACC, letterSpacing: 1.5 }}>{caption[0]}</div>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 31, color: INK, marginTop: 8, lineHeight: 1.3 }}>{caption[1]}</div>
      </div>}
      <div style={{ position: 'absolute', right: 60, bottom: 36, textAlign: 'right', fontFamily: SANS, fontWeight: 700, fontSize: 20, letterSpacing: 2, color: 'rgba(242,239,233,0.75)', lineHeight: 1.5 }}>RECONSTRUCTION · POSITIONS APPROXIMATE, NOT TO SCALE<br />Coast Guard investigation report (2011), App. H · Commission report, p. 12</div>
    </AbsoluteFill>
  );
};
