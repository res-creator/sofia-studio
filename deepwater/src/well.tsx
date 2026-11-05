// One consistent schematic for the whole film: rig → water column → seafloor + BOP → well.
// RECONSTRUCTION · SIMPLIFIED, NOT TO SCALE. Same positions, colours and names every time it returns.
// Layers are switched on per scene (one new idea at a time).
import React from 'react';
import { AbsoluteFill, interpolate, Easing } from 'remotion';
import { SANS, INK, ACC, BG } from './kit';
const cl = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
export const k = (t: number, a: number, d = 0.6) => interpolate(t, [a, a + d], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
// palette (fixed for the whole film)
export const WC = { sky: '#141A20', water: '#0E2A3C', water2: '#0A1F2E', rock: '#3A3026', rock2: '#2C251E', steel: '#9AA3A8', mud: '#B8743A', sea: '#7FC4E0', hc: '#E0533A', bop: '#D8A13A' };
// geometry (px): x of the well axis, key depths
const X = 960, SURF = 210, FLOOR = 640, TD = 1040;
type Layer = 'rig' | 'labels' | 'riser' | 'bop' | 'well' | 'pipe' | 'kill' | 'gauges' | 'mud' | 'cement' | 'flow' | 'depth' | 'seawater' | 'bopglow';
export const Well: React.FC<{ t: number; show: Layer[]; at?: Partial<Record<Layer, number>>; dp?: number; kl?: number; caption?: [string, string]; capAt?: number; zoom?: { s: number; y: number }; gtag?: string; cam?: { x: number; y: number; s: number }; hideRecon?: boolean; gnote?: [string, string] }> = ({ t, show, at = {}, dp = 1400, kl = 0, caption, capAt = 0.3, zoom, gtag, cam, hideRecon, gnote }) => {
  const on = (l: Layer, d = 0.6) => (show.includes(l) ? k(t, at[l] ?? 0, d) : 0);
  const seawater = on('seawater', 3.0), bopglow = on('bopglow', 0.8);
  const rig = on('rig'), riser = on('riser'), bop = on('bop'), well = on('well'), pipe = on('pipe'), kill = on('kill'), gauges = on('gauges'), mud = on('mud', 1.2), cement = on('cement'), flow = on('flow', 2.5), depth = on('depth'), labels = on('labels');
  const z = zoom ?? { s: 1, y: 540 };
  const lab = (x: number, y: number, s: string, o: number, color = INK, anchor: 'start' | 'end' | 'middle' = 'start', size = 26) => (
    <text x={x} y={y} fill={color} opacity={o} fontFamily={SANS} fontWeight={700} fontSize={size} letterSpacing={1.5} textAnchor={anchor} style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.8)', strokeWidth: 5 }}>{s}</text>
  );
  const gauge = (x: number, y: number, title: string, v: number, o: number, warn: boolean) => (
    <g opacity={o} transform={`translate(${x},${y})`}>
      <rect x={-160} y={-48} width={320} height={96} rx={12} fill="#0B0C0D" stroke={warn ? WC.hc : WC.steel} strokeWidth={3} />
      <text x={0} y={-14} fill={INK} fontFamily={SANS} fontWeight={600} fontSize={20} textAnchor="middle" letterSpacing={1}>{title}</text>
      <text x={0} y={30} fill={warn ? WC.hc : WC.sea} fontFamily={SANS} fontWeight={800} fontSize={38} textAnchor="middle">{Math.round(v * o).toLocaleString('en-US')} psi</text>
    </g>
  );
  return (
    <AbsoluteFill style={{ background: BG, overflow: 'hidden' }}>
      <svg width={1920} height={1080} style={{ position: 'absolute', overflow: 'visible', transform: cam ? `translate(${960 - cam.x * cam.s}px, ${540 - cam.y * cam.s}px) scale(${cam.s})` : `scale(${z.s})`, transformOrigin: cam ? '0 0' : `960px ${z.y}px` }}>
        {/* sky / water / rock */}
        <rect x={-2000} y={-2000} width={6000} height={2000 + SURF} fill={WC.sky} />
        <rect x={-2000} y={SURF} width={6000} height={FLOOR - SURF} fill={WC.water} />
        <rect x={-2000} y={FLOOR} width={6000} height={2000} fill={WC.rock} />
        {[0, 1, 2].map((i) => <rect key={i} x={0} y={FLOOR + 110 + i * 110} width={1920} height={55} fill={WC.rock2} opacity={0.6} />)}
        <line x1={0} y1={SURF} x2={1920} y2={SURF} stroke={WC.sea} strokeWidth={2} opacity={0.6} />
        {/* rig (semi-submersible silhouette) */}
        <g opacity={rig}>
          <rect x={X - 230} y={SURF + 10} width={460} height={26} fill={WC.steel} opacity={0.7} />
          <rect x={X - 200} y={SURF - 30} width={40} height={60} fill={WC.steel} /><rect x={X + 160} y={SURF - 30} width={40} height={60} fill={WC.steel} />
          <rect x={X - 260} y={SURF - 70} width={520} height={40} fill={WC.steel} />
          <path d={`M${X - 30},${SURF - 70} L${X - 12},${SURF - 190} L${X + 12},${SURF - 190} L${X + 30},${SURF - 70} Z`} fill="none" stroke={WC.steel} strokeWidth={5} />
        </g>
        {/* riser */}
        <rect x={X - 16} y={SURF - 30} width={32} height={(FLOOR - SURF + 30) * riser} fill="none" stroke={WC.steel} strokeWidth={4} opacity={riser} />
        {/* kill line beside the riser */}
        {kill > 0 && <line x1={X + 34} y1={SURF - 30} x2={X + 34} y2={SURF - 30 + (FLOOR - SURF + 40) * kill} stroke={WC.sea} strokeWidth={5} opacity={0.9} />}
        {bopglow > 0 && <circle cx={X} cy={FLOOR - 42} r={110} fill="none" stroke={WC.bop} strokeWidth={5} opacity={bopglow * (0.6 + 0.4 * Math.sin(t * 3))} />}
        {/* BOP on the seafloor */}
        <g opacity={bop}>
          <rect x={X - 60} y={FLOOR - 90} width={120} height={95} rx={6} fill={WC.bop} stroke="#000" strokeWidth={2} />
          {[0, 1, 2].map((i) => <rect key={i} x={X - 74} y={FLOOR - 78 + i * 28} width={148} height={14} fill="#8C6418" />)}
        </g>
        {/* well (casing) */}
        <g opacity={well}>
          <rect x={X - 22} y={FLOOR} width={44} height={(TD - FLOOR) * well} fill={WC.mud} opacity={0.35} />
          <line x1={X - 22} y1={FLOOR} x2={X - 22} y2={FLOOR + (TD - FLOOR) * well} stroke={WC.steel} strokeWidth={4} />
          <line x1={X + 22} y1={FLOOR} x2={X + 22} y2={FLOOR + (TD - FLOOR) * well} stroke={WC.steel} strokeWidth={4} />
        </g>
        {/* mud column (primary barrier), shown as fill inside riser + well */}
        {mud > 0 && <rect x={X - 14} y={SURF - 28} width={28} height={(TD - SURF + 28) * mud} fill={WC.mud} opacity={0.85} />}
        {/* seawater replacing mud from the top (displacement) */}
        {seawater > 0 && <rect x={X - 14} y={SURF - 28} width={28} height={(FLOOR - SURF + 60) * seawater} fill={WC.sea} opacity={0.85} />}
        {/* cement at the bottom */}
        {cement > 0 && <rect x={X - 24} y={TD - 70} width={48} height={70} fill="#A9A9A2" opacity={cement} stroke="#000" strokeWidth={2} />}
        {/* drill pipe */}
        {pipe > 0 && <rect x={X - 5} y={SURF - 70} width={10} height={(TD - 140 - SURF + 70) * pipe} fill="#D9DDE0" opacity={0.95} />}
        {/* hydrocarbons rising (flow) */}
        {flow > 0 && [0, 1, 2, 3, 4, 5].map((i) => {
          const y = TD - 60 - ((t * 120 + i * 140) % (TD - SURF));
          return <circle key={i} cx={X + (i % 2 ? 6 : -6)} cy={y} r={9} fill={WC.hc} opacity={flow * (y < FLOOR ? 0.95 : 0.8)} />;
        })}
        {/* depth labels */}
        {depth > 0 && <g opacity={depth}>
          <line x1={X - 420} y1={SURF} x2={X - 420} y2={FLOOR} stroke={INK} strokeWidth={2} strokeDasharray="8 8" />
          {lab(X - 440, (SURF + FLOOR) / 2, 'ABOUT 5,000 FT OF WATER', 1, INK, 'end', 24)}
          <line x1={X - 420} y1={FLOOR} x2={X - 420} y2={TD} stroke={INK} strokeWidth={2} strokeDasharray="8 8" />
          {lab(X - 440, (FLOOR + TD) / 2 + 10, 'WELL: ABOUT 13,000 FT', 1, INK, 'end', 24)}
          {lab(X - 440, (FLOOR + TD) / 2 + 42, 'BELOW THE SEAFLOOR', 1, INK, 'end', 24)}
        </g>}
        {/* element labels */}
        {labels > 0 && <>
          {lab(X + 250, SURF + 72, 'DEEPWATER HORIZON (RIG)', labels * rig)}
          {lab(X + 70, (SURF + FLOOR) / 2, 'RISER', labels * riser)}
          {lab(X + 100, FLOOR - 40, 'BLOWOUT PREVENTER', labels * bop, WC.bop)}
          {lab(X + 70, FLOOR + 160, 'MACONDO WELL', labels * well)}
          {cement > 0 && lab(X + 70, TD - 30, 'CEMENT', labels * cement)}
          {mud > 0 && lab(X - 70, SURF + 90, seawater > 0.3 ? 'SEAWATER REPLACING MUD' : 'HEAVY DRILLING MUD', labels * mud, seawater > 0.3 ? WC.sea : WC.mud, 'end')}
          {kill > 0 && lab(X + 60, SURF + 60, 'KILL LINE', labels * kill, WC.sea)}
          {pipe > 0 && lab(X - 70, SURF + 140, 'DRILL PIPE', labels * pipe, '#D9DDE0', 'end')}
        </>}
        {/* gauges: the contradiction of the negative test */}
        {gauges > 0 && <>
          {gauge(X - 420, 95, gtag ? `DRILL PIPE · ${gtag}` : 'DRILL PIPE', dp, gauges, dp > 0)}
          {gnote && gauges > 0 && <g opacity={gauges}>{lab(X - 420, 175, gnote[0], 1, dp > 0 ? WC.hc : WC.sea, 'middle', 22)}{gnote[1] ? lab(X + 420, 175, gnote[1], 1, WC.sea, 'middle', 22) : null}</g>}
          {kl >= 0 && gauge(X + 420, 95, gtag ? `KILL LINE · ${gtag}` : 'KILL LINE', kl, k(t, (at.gauges ?? 0) + 1.0), kl > 0)}
          <line x1={X - 290} y1={95} x2={X - 10} y2={SURF - 70} stroke={WC.hc} strokeWidth={2} opacity={gauges * 0.7} />
          {kl >= 0 && <line x1={X + 290} y1={95} x2={X + 34} y2={SURF - 30} stroke={WC.sea} strokeWidth={2} opacity={k(t, (at.gauges ?? 0) + 1.0) * 0.7} />}
        </>}
      </svg>
      {caption && <div style={{ position: 'absolute', left: 70, bottom: 70, maxWidth: 820, opacity: k(t, capAt, 0.5), background: 'rgba(8,9,10,0.78)', padding: '16px 24px', borderRadius: 6 }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 40, color: ACC, letterSpacing: 1.5 }}>{caption[0]}</div>
        {caption[1] && <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 31, color: INK, marginTop: 8, lineHeight: 1.3 }}>{caption[1]}</div>}
      </div>}
      {!hideRecon && <div style={{ position: 'absolute', right: 60, bottom: 34, fontFamily: SANS, fontWeight: 700, fontSize: 20, letterSpacing: 3, color: 'rgba(242,239,233,0.6)' }}>RECONSTRUCTION · SIMPLIFIED, NOT TO SCALE</div>}
    </AbsoluteFill>
  );
};
