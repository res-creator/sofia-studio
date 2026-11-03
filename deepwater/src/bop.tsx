// Blowout preventer close-up — RECONSTRUCTION · SIMPLIFIED, NOT TO SCALE.
// After: CSB Macondo report Vol. 2 (2014) and Exec. Summary (2016): buckled, off-center drill pipe; BSR could not seal; pod faults.
// JIT Vol. II / DNV (2011): pipe off center; BSR most likely closed by the autoshear on April 22. Ram order per CSB Vol. 2.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { SANS, INK, ACC, BG } from './kit';
import { k, WC } from './well';
const X = 960, BW = 120; // bore
const RAMS: [string, number, boolean][] = [['ANNULAR PREVENTERS', 230, false], ['BLIND SHEAR RAM', 450, true], ['CASING SHEAR RAM', 560, false], ['PIPE RAMS', 690, false]];
export const Bop: React.FC<{ t: number; buckle?: number; close?: number; pods?: number; faults?: number; flow?: number; caption?: [string, string]; capAt?: number; dim?: boolean }> = ({ t, buckle, close, pods, faults, flow, caption, capAt = 0.3 }) => {
  const b = buckle !== undefined ? k(t, buckle, 1.6) : 0;
  const c = close !== undefined ? k(t, close, 1.4) : 0;
  const pd = pods !== undefined ? k(t, pods) : 0, ft = faults !== undefined ? k(t, faults) : 0;
  const fl = flow !== undefined ? k(t, flow, 1.0) : 0;
  const yB = 450, off = 40 * b; // pipe offset at the BSR
  const px = (y: number) => X + off * Math.exp(-((y - yB) ** 2) / (2 * 170 ** 2));
  const pipePath = Array.from({ length: 40 }, (_, i) => { const y = 80 + i * 24; return `${px(y)},${y}`; });
  // blades: left closes to the centre; right is stopped by the off-center pipe
  const lEdge = X - BW / 2 + (BW / 2) * c; const rStop = b > 0.5 ? px(yB) + 15 : X; const rEdge = X + BW / 2 - (X + BW / 2 - rStop) * c;
  const gap = b > 0.5 && c > 0.9;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <svg width={1920} height={1080} style={{ position: 'absolute' }}>
        {/* stack body */}
        <rect x={X - 380} y={150} width={760} height={680} rx={14} fill="#2A2620" stroke={WC.bop} strokeWidth={4} />
        <rect x={X - BW / 2} y={60} width={BW} height={960} fill="#0E1418" />
        <line x1={X - BW / 2} y1={60} x2={X - BW / 2} y2={1020} stroke={WC.steel} strokeWidth={3} /><line x1={X + BW / 2} y1={60} x2={X + BW / 2} y2={1020} stroke={WC.steel} strokeWidth={3} />
        <text x={X} y={50} fill={INK} fontFamily={SANS} fontWeight={700} fontSize={22} textAnchor="middle" opacity={0.75}>RISER TO THE RIG ↑</text>
        <text x={X} y={1062} fill={INK} fontFamily={SANS} fontWeight={700} fontSize={22} textAnchor="middle" opacity={0.75}>↓ WELL</text>
        {RAMS.map(([name, y, bsr]) => (
          <g key={name}>
            <rect x={X - 360} y={y - 34} width={300 - BW / 2 + 60} height={68} fill={bsr ? '#4A3A1A' : '#3A342B'} stroke={bsr ? WC.bop : '#6D6450'} strokeWidth={bsr ? 3 : 2} />
            <rect x={X + BW / 2} y={y - 34} width={300 - BW / 2 + 60} height={68} fill={bsr ? '#4A3A1A' : '#3A342B'} stroke={bsr ? WC.bop : '#6D6450'} strokeWidth={bsr ? 3 : 2} />
            <text x={X - 400} y={y + 10} fill={bsr ? WC.bop : INK} fontFamily={SANS} fontWeight={bsr ? 800 : 600} fontSize={bsr ? 30 : 24} textAnchor="end" style={{ paintOrder: 'stroke', stroke: '#000', strokeWidth: 4 }}>{name}</text>
          </g>
        ))}
        {/* drill pipe */}
        <polyline points={pipePath.join(' ')} fill="none" stroke="#D9DDE0" strokeWidth={26} strokeLinejoin="round" />
        {/* blind shear ram blades */}
        <rect x={X - BW / 2 - 6} y={yB - 26} width={lEdge - (X - BW / 2) + 6} height={52} fill={WC.bop} opacity={c > 0 ? 1 : 0} />
        <rect x={rEdge} y={yB - 26} width={X + BW / 2 + 6 - rEdge} height={52} fill={WC.bop} opacity={c > 0 ? 1 : 0} />
        {/* flow through the bore */}
        {fl > 0 && Array.from({ length: 8 }, (_, i) => { const y = 1000 - ((t * 160 + i * 120) % 940); const x = (gap && y < yB + 30 && y > yB - 30) ? rEdge - 8 : px(y) + (i % 2 ? 28 : -28) * (gap && y < yB ? 0.3 : 1); return <circle key={i} cx={x} cy={y} r={9} fill={WC.hc} opacity={fl * 0.9} />; })}
        {gap && <g opacity={k(t, (close ?? 0) + 1.4)}><line x1={X + 70} y1={yB + 10} x2={X + 420} y2={yB + 120} stroke={WC.hc} strokeWidth={3} /><text x={X + 430} y={yB + 128} fill={WC.hc} fontFamily={SANS} fontWeight={800} fontSize={30}>PIPE OFF CENTER:</text><text x={X + 430} y={yB + 166} fill={WC.hc} fontFamily={SANS} fontWeight={800} fontSize={30}>THE BLADES CANNOT SEAL</text></g>}
        {b > 0.2 && !gap && <g opacity={b}><line x1={X + 60} y1={yB + 60} x2={X + 420} y2={yB + 130} stroke={INK} strokeWidth={2} /><text x={X + 430} y={yB + 140} fill={INK} fontFamily={SANS} fontWeight={700} fontSize={28}>DRILL PIPE BUCKLED,</text><text x={X + 430} y={yB + 176} fill={INK} fontFamily={SANS} fontWeight={700} fontSize={28}>PUSHED OFF CENTER</text></g>}
        {/* control pods */}
        {pd > 0 && <g opacity={pd}>
          {[['YELLOW POD', 1450, '#D9C03A', 'MISWIRED VALVE'], ['BLUE POD', 1690, '#4A8FD9', 'DRAINED BATTERY']].map(([n, x, col, f]) => (
            <g key={n as string}>
              <rect x={(x as number) - 95} y={150} width={190} height={130} rx={10} fill="#15181B" stroke={col as string} strokeWidth={4} />
              <text x={x as number} y={200} fill={col as string} fontFamily={SANS} fontWeight={800} fontSize={26} textAnchor="middle">{n}</text>
              <text x={x as number} y={240} fill={INK} fontFamily={SANS} fontWeight={600} fontSize={20} textAnchor="middle">control pod</text>
              <text x={x as number} y={315} fill={WC.hc} fontFamily={SANS} fontWeight={800} fontSize={22} textAnchor="middle" opacity={ft}>{f}</text>
              <line x1={x as number} y1={280} x2={X + 380} y2={300} stroke={col as string} strokeWidth={2} opacity={0.6} />
            </g>))}
          <text x={1570} y={120} fill={INK} fontFamily={SANS} fontWeight={700} fontSize={24} textAnchor="middle">“DEADMAN” (AUTOMATIC) RUNS THROUGH BOTH PODS</text>
        </g>}
      </svg>
      {caption && <div style={{ position: 'absolute', left: 70, bottom: 70, width: 760, opacity: k(t, capAt, 0.5), background: 'rgba(8,9,10,0.8)', padding: '16px 22px', borderRadius: 6 }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 32, color: ACC, letterSpacing: 2 }}>{caption[0]}</div>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 28, color: INK, marginTop: 8, lineHeight: 1.3 }}>{caption[1]}</div>
      </div>}
      <div style={{ position: 'absolute', right: 60, bottom: 40, fontFamily: SANS, fontWeight: 700, fontSize: 20, letterSpacing: 3, color: 'rgba(242,239,233,0.75)' }}>BLOWOUT PREVENTER · RECONSTRUCTION · SIMPLIFIED, NOT TO SCALE</div>
    </AbsoluteFill>
  );
};
