// Blowout preventer scene — RECONSTRUCTION · SIMPLIFIED, NOT TO SCALE.
// Sources: CSB Macondo report Vol. 2 (2014) and Exec. Summary (2016) — blind shear ram (BSR), deadman/AMF via two control pods,
// effective-compression buckling, off-centre pipe, BSR could not seal; Commission p. 114 (EDS pressed, lights, no disconnect);
// JIT Vol. II / DNV (2011) — pipe off centre, BSR most likely closed by the autoshear on April 22. Ram order per CSB Vol. 2.
// One visual system: steel = structure, amber = blind shear ram, light grey = drill pipe, red-orange = oil and gas,
// cyan outline = "how it was meant to work" (not what happened).
import React from 'react';
import { AbsoluteFill, Img, interpolate, Easing, staticFile } from 'remotion';
import { SANS, INK, ACC, BG } from './kit';
import { WC } from './well';
const cl = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
export const ease = (t: number, a: number, d = 0.8) => interpolate(t, [a, a + d], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
const lin = (t: number, a: number, d: number) => interpolate(t, [a, a + d], [0, 1], cl);
const BLUE = '#7FC4E0', HC = WC.hc, AMB = WC.bop, STEEL = '#59616A', STEEL2 = '#2B3036';
const txt = (x: number, y: number, s: string, o = 1, fill = INK, size = 30, anchor: 'start' | 'middle' | 'end' = 'start', w = 700) => (
  <text x={x} y={y} opacity={o} fill={fill} fontFamily={SANS} fontWeight={w} fontSize={size} textAnchor={anchor} style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.85)', strokeWidth: 6 }}>{s}</text>
);
// ---------------------------------------------------------------- headline (top-left) and mode badge
export const Headline: React.FC<{ t: number; at: number; out?: number; big: string; small?: string; color?: string; bottom?: boolean }> = ({ t, at, out = 1e9, big, small, color = ACC, bottom }) => {
  const o = ease(t, at, 0.5) * (1 - ease(t, out, 0.4));
  return (
    <div style={{ position: 'absolute', left: 80, [bottom ? 'bottom' : 'top']: bottom ? 90 : 64, maxWidth: 1000, opacity: o, background: bottom ? 'rgba(8,9,10,0.7)' : undefined, padding: bottom ? '16px 24px' : undefined, borderRadius: 6 }}>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 52, color, letterSpacing: 1.5, lineHeight: 1.1, textShadow: '0 3px 14px rgba(0,0,0,0.9)' }}>{big}</div>
      {small && <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 32, color: INK, marginTop: 10, textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}>{small}</div>}
    </div>
  );
};
export const Badge: React.FC<{ t: number; at: number; out?: number; text: string; color: string }> = ({ t, at, out = 1e9, text, color }) => (
  <div style={{ position: 'absolute', right: 80, top: 70, opacity: ease(t, at, 0.4) * (1 - ease(t, out, 0.3)), border: `3px solid ${color}`, color, fontFamily: SANS, fontWeight: 800, fontSize: 28, letterSpacing: 3, padding: '10px 20px', borderRadius: 6, background: 'rgba(8,9,10,0.75)' }}>{text}</div>
);
export const Footer: React.FC<{ text?: string }> = ({ text = 'RECONSTRUCTION · SIMPLIFIED, NOT TO SCALE' }) => (
  <div style={{ position: 'absolute', right: 60, bottom: 34, fontFamily: SANS, fontWeight: 700, fontSize: 20, letterSpacing: 3, color: 'rgba(242,239,233,0.6)' }}>{text}</div>
);
// rising oil and gas: deterministic particles in a channel; centre x may depend on y
const Flow: React.FC<{ t: number; o: number; x: (y: number) => number; w: number; y0: number; y1: number; n?: number; speed?: number; stopAbove?: number; r?: number }> = ({ t, o, x, w, y0, y1, n = 26, speed = 260, stopAbove, r = 9 }) => {
  if (o <= 0) return null;
  const span = y0 - y1;
  return <g opacity={o}>{Array.from({ length: n }, (_, i) => {
    const ph = (i * 0.618) % 1; const y = y0 - ((t * speed + ph * span) % span);
    if (stopAbove !== undefined && y < stopAbove) return null;
    const dx = (((i * 37) % 11) / 10 - 0.5) * w;
    return <circle key={i} cx={x(y) + dx} cy={y} r={r} fill={HC} opacity={0.9} />;
  })}</g>;
};
// ---------------------------------------------------------------- 1. the whole system with a camera
export const SystemView: React.FC<{ t: number; zoom: number; flow?: number; caption?: React.ReactNode }> = ({ t, zoom, flow = 0, caption }) => {
  const X = 960, SURF = 170, FLOOR = 800;
  const s = 1 + 3.2 * zoom, fy = FLOOR - 40; // zoom target: the BOP
  const sx = interpolate(zoom, [0, 1], [X, 960]), sy = interpolate(zoom, [0, 1], [fy, 540]); const tx = sx - X * s, ty = sy - fy * s;
  const dim = 1 - 0.6 * zoom;
  return (
    <AbsoluteFill style={{ background: BG, overflow: 'hidden' }}>
      <svg width={1920} height={1080} style={{ position: 'absolute' }}>
        <g transform={`translate(${tx},${ty}) scale(${s})`}>
          <rect x={-2000} y={-2000} width={6000} height={2000 + SURF} fill="#141A20" />
          <rect x={-2000} y={SURF} width={6000} height={FLOOR - SURF} fill={WC.water} />
          <rect x={-2000} y={FLOOR} width={6000} height={1200} fill={WC.rock} />
          <line x1={-2000} y1={SURF} x2={4000} y2={SURF} stroke={BLUE} strokeWidth={2} opacity={0.6} />
          {/* rig */}
          <g opacity={dim}>
            <rect x={X - 230} y={SURF + 10} width={460} height={24} fill={WC.steel} opacity={0.7} />
            <rect x={X - 200} y={SURF - 30} width={40} height={60} fill={WC.steel} /><rect x={X + 160} y={SURF - 30} width={40} height={60} fill={WC.steel} />
            <rect x={X - 260} y={SURF - 70} width={520} height={40} fill={WC.steel} />
            <path d={`M${X - 30},${SURF - 70} L${X - 12},${SURF - 170} L${X + 12},${SURF - 170} L${X + 30},${SURF - 70} Z`} fill="none" stroke={WC.steel} strokeWidth={5} />
          </g>
          {/* riser and well */}
          <rect x={X - 12} y={SURF - 30} width={24} height={FLOOR - 60 - SURF + 30} fill="none" stroke={WC.steel} strokeWidth={4} opacity={dim} />
          <rect x={X - 16} y={FLOOR} width={32} height={420} fill={WC.mud} opacity={0.35} />
          {/* BOP */}
          <rect x={X - 38} y={FLOOR - 75} width={76} height={80} rx={5} fill={AMB} stroke="#000" strokeWidth={2} />
          {[0, 1, 2].map((i) => <rect key={i} x={X - 50} y={FLOOR - 64 + i * 22} width={100} height={10} fill="#8C6418" />)}
          <Flow t={t} o={flow} x={() => X} w={14} y0={FLOOR + 400} y1={SURF - 20} n={30} speed={300} r={6} />
        </g>
        {zoom < 0.15 && <g opacity={1 - zoom / 0.15}>
          {txt(X + 290, SURF + 8, 'DEEPWATER HORIZON')}
          {txt(X - 60, (SURF + FLOOR) / 2, 'ABOUT 5,000 FT OF WATER', 1, INK, 28, 'end', 600)}
          {txt(X + 70, FLOOR - 30, 'BLOWOUT PREVENTER', 1, AMB, 32, 'start', 800)}
          {txt(X + 50, FLOOR + 140, 'THE WELL', 1, INK, 28, 'start', 600)}
        </g>}
      </svg>
      {caption}
      <Footer />
    </AbsoluteFill>
  );
};
// ---------------------------------------------------------------- 2. the real object
// DVIDS 1098147 (USCG, PO1 Thomas M. Blue): the blowout preventer on the deck of the Q4000, Sept. 4, 2010 (file stored rotated; shown upright).
export const PHOTO_LEFT = 1083; export const PHOTO_BOX = { x: 1083 + 335, y: 0, w: 356, h: 885 }; // the stack in the upright photo, as displayed (height 1080, centred)
export const PhotoView: React.FC<{ t: number; outlineAt: number; o?: number }> = ({ t, outlineAt, o = 1 }) => {
  const k = lin(t, outlineAt, 0.9); const B = PHOTO_BOX; const per = 2 * (B.w + B.h);
  return (
    <AbsoluteFill style={{ background: BG, opacity: o }}>
      <Img src={staticFile('img/bop_recovered_upright.jpg')} style={{ position: 'absolute', height: 1080, left: PHOTO_LEFT, top: 0 }} />
      <svg width={1920} height={1080} style={{ position: 'absolute' }}>
        <rect x={B.x} y={B.y + 6} width={B.w} height={B.h} fill="none" stroke={AMB} strokeWidth={6} strokeDasharray={per} strokeDashoffset={per * (1 - k)} />
      </svg>
      <div style={{ position: 'absolute', left: 90, top: 380, maxWidth: 900, opacity: ease(t, outlineAt - 0.8, 0.5), textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 60, color: AMB }}>THE BLOWOUT PREVENTER</div>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 34, color: INK, marginTop: 10, lineHeight: 1.3 }}>Raised from the seafloor, September 4, 2010.<br />The people at its base give the scale.</div>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 22, color: 'rgba(242,239,233,0.7)', marginTop: 6 }}>Photo: PO1 Thomas M. Blue, U.S. Coast Guard (DVIDS)</div>
      </div>
    </AbsoluteFill>
  );
};
// ---------------------------------------------------------------- 3. the stack in section (medium shot)
// local coordinates: centre x = 0; LMRP (upper package) y −430…−125; lower stack y −115…385; bore x −46…46
const RAMS = [{ n: 'BLIND SHEAR RAM', y: -40, bsr: true }, { n: 'CASING SHEAR RAM', y: 60 }, { n: 'PIPE RAMS', y: 160 }, { n: '', y: 240 }, { n: '', y: 320 }];
export type StackState = {
  mode: 'should' | 'real'; hl: number; // hl: highlight of the blind shear ram (others dim)
  lift?: number; // 'should' mode: upper package and riser lifting away (0..1)
  pods?: number; lines?: [number, number, number]; cut?: number; signal?: number; // deadman: pods, three supply lines (appear), lines cut, pods→BSR signal
  flow?: number; labels?: number;
};
export const StackView: React.FC<{ t: number; s: StackState; place?: { x: number; y: number; k: number }; body?: number }> = ({ t, s, place = { x: 1240, y: 560, k: 1.08 }, body = 1 }) => {
  const should = s.mode === 'should'; const line = should ? BLUE : STEEL;
  const lift = -150 * (s.lift ?? 0); const dimO = 1 - 0.6 * s.hl;
  const pods = s.pods ?? 0, lines = s.lines ?? [0, 0, 0], cut = s.cut ?? 0, sig = s.signal ?? 0, lab = s.labels ?? 1;
  const ram = (y: number, bsr?: boolean) => (
    <g opacity={bsr ? 1 : dimO}>
      <rect x={-170} y={y - 22} width={124} height={44} fill={bsr ? '#4A3A1A' : STEEL2} stroke={bsr ? AMB : line} strokeWidth={bsr ? 4 : 2} />
      <rect x={46} y={y - 22} width={124} height={44} fill={bsr ? '#4A3A1A' : STEEL2} stroke={bsr ? AMB : line} strokeWidth={bsr ? 4 : 2} />
    </g>
  );
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute' }}>
      <g transform={`translate(${place.x},${place.y}) scale(${place.k})`}>
        {/* supply lines from the rig (top edge): power, communication, hydraulics */}
        {[0, 1, 2].map((i) => { const x = 360 + i * 20, o = lines[i]; if (o <= 0) return null; const broken = cut > 0; const col = broken ? '#5A2A22' : [AMB, BLUE, INK][i];
          return <g key={i} opacity={o}>
            <path d={`M${x},-1100 L${x},${-300 + i * 18} L335,${-300 + i * 18}`} fill="none" stroke={col} strokeWidth={7} />
            {broken && <g opacity={cut}><line x1={x - 22} y1={-480} x2={x + 22} y2={-450} stroke={HC} strokeWidth={8} /><line x1={x - 22} y1={-450} x2={x + 22} y2={-480} stroke={HC} strokeWidth={8} /></g>}
          </g>; })}
        {/* riser + upper package (LMRP) */}
        <g transform={`translate(0,${lift})`}>
          <rect x={-40} y={-1100} width={80} height={670} fill="none" stroke={line} strokeWidth={4} opacity={dimO} />
          <rect x={-190} y={-430} width={380} height={305} rx={10} fill={should ? 'rgba(127,196,224,0.06)' : '#20252A'} stroke={line} strokeWidth={3} opacity={body} />
          {[-360, -250].map((y) => <g key={y} opacity={dimO}><ellipse cx={-108} cy={y} rx={62} ry={30} fill={STEEL2} stroke={line} strokeWidth={2} /><ellipse cx={108} cy={y} rx={62} ry={30} fill={STEEL2} stroke={line} strokeWidth={2} /></g>)}
          {/* control pods */}
          {pods > 0 && [[-275, '#D9C03A', 'YELLOW POD'], [275, '#4A8FD9', 'BLUE POD']].map(([x, c, n]) => (
            <g key={n as string} opacity={pods}>
              <rect x={(x as number) - 60} y={-370} width={120} height={150} rx={10} fill="#15181B" stroke={c as string} strokeWidth={5} />
              {txt(x as number, -280, (n as string).split(' ')[0], 1, c as string, 26, 'middle', 800)}
              {txt(x as number, -250, 'POD', 1, c as string, 26, 'middle', 800)}
            </g>))}
          <rect x={-46} y={-430} width={92} height={305} fill={BG} opacity={0.9} />
        </g>
        {/* lower stack */}
        <rect x={-190} y={-115} width={380} height={500} rx={10} fill={should ? 'rgba(127,196,224,0.06)' : '#20252A'} stroke={line} strokeWidth={3} opacity={body} />
        <rect x={-46} y={-115} width={92} height={500} fill={BG} />
        <line x1={-46} y1={-1100} x2={-46} y2={520} stroke={line} strokeWidth={3} opacity={0.6} /><line x1={46} y1={-1100} x2={46} y2={520} stroke={line} strokeWidth={3} opacity={0.6} />
        {RAMS.map((r) => <g key={r.y}>{ram(r.y, r.bsr)}</g>)}
        {/* drill pipe */}
        <rect x={-11} y={-1100 + lift * 0} width={22} height={1620} fill="#D9DDE0" opacity={0.95} />
        <Flow t={t} o={s.flow ?? 0} x={() => 0} w={70} y0={520} y1={-1100} n={34} speed={320} r={8} />
        {/* deadman signal: pods → blades */}
        {sig > 0 && [-275, 275].map((x) => <path key={x} d={`M${x},-220 L${x},-120 L${Math.sign(x) * 175},-40`} fill="none" stroke={AMB} strokeWidth={6} strokeDasharray="400" strokeDashoffset={400 * (1 - sig)} />)}
        {/* labels */}
        <g opacity={lab}>
          {txt(-215, -40 + 12, 'BLIND SHEAR RAM', 0.35 + 0.65 * s.hl, AMB, 36, 'end', 800)}
          {txt(-215, 60 + 10, 'CASING SHEAR RAM', 0.75 * dimO, INK, 28, 'end', 600)}
          {txt(-215, 160 + 10, 'PIPE RAMS', 0.75 * dimO, INK, 28, 'end', 600)}
          {txt(-215, -300 + lift, 'ANNULAR PREVENTERS', 0.75 * dimO * (1 - pods), INK, 28, 'end', 600)}
          {txt(30, 430, 'DRILL PIPE', 0.8, '#D9DDE0', 28, 'start', 700)}
        </g>
      </g>
    </svg>
  );
};
// ---------------------------------------------------------------- 4. close-up of the blades
// bore x 810…1110 (centre 960); blade band y 470…610. 'should': centred pipe is cut and the blades seal.
// 'real': the pipe has buckled off centre; the blades catch it at its edge and cannot meet — a gap stays open.
export const BsrClose: React.FC<{ t: number; mode: 'should' | 'real'; close: number; buckle: number; flow: number; gapLabel?: number }> = ({ t, mode, close, buckle, flow, gapLabel = 0 }) => {
  const should = mode === 'should'; const line = should ? BLUE : STEEL; const C = 960, L = 810, R = 1110, Y = 540;
  const off = 105 * buckle; const px = (y: number) => C + off * Math.exp(-(((y - Y) / 300) ** 2));
  const PW = 76; const pcY = px(Y);
  // blade travel; in 'real' mode the blades stop at the pipe
  const lStop = should ? R : pcY - PW / 2 + 8; const rStop = should ? L : pcY + PW / 2 - 4;
  const lEdge = L + (lStop - L) * close, rEdge = R - (R - rStop) * close;
  const cutDone = should && close > 0.62; const sealed = should && close > 0.97;
  const pipePath = Array.from({ length: 60 }, (_, i) => { const y = -40 + i * 20; return `${px(y)},${y}`; }).join(' ');
  const gapX = (pcY + rEdge) / 2;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <svg width={1920} height={1080} style={{ position: 'absolute' }}>
        {/* housing */}
        <rect x={360} y={420} width={450} height={240} fill={should ? 'rgba(127,196,224,0.06)' : '#20252A'} stroke={line} strokeWidth={3} />
        <rect x={R} y={420} width={450} height={240} fill={should ? 'rgba(127,196,224,0.06)' : '#20252A'} stroke={line} strokeWidth={3} />
        <line x1={L} y1={0} x2={L} y2={420} stroke={line} strokeWidth={4} /><line x1={L} y1={660} x2={L} y2={1080} stroke={line} strokeWidth={4} />
        <line x1={R} y1={0} x2={R} y2={420} stroke={line} strokeWidth={4} /><line x1={R} y1={660} x2={R} y2={1080} stroke={line} strokeWidth={4} />
        {/* oil and gas below and (unless sealed) above */}
        <Flow t={t} o={flow} x={(y) => (y < Y + 80 && y > Y - 80 && !should && close > 0.9 ? gapX : C + (y > Y ? 0 : 0))} w={y0w(should, close)} y0={1080} y1={0} n={40} speed={300} stopAbove={sealed ? Y + 70 : undefined} r={10} />
        {/* drill pipe (hollow) */}
        {!cutDone ? <polyline points={pipePath} fill="none" stroke="#D9DDE0" strokeWidth={PW} strokeLinejoin="round" /> : <>
          <line x1={C} y1={-40} x2={C} y2={Y - 52} stroke="#D9DDE0" strokeWidth={PW} />
          <line x1={C} y1={Y + 52} x2={C} y2={1120} stroke="#D9DDE0" strokeWidth={PW} />
        </>}
        <polyline points={pipePath} fill="none" stroke="#9CA3A8" strokeWidth={PW - 26} strokeLinejoin="round" opacity={cutDone ? 0 : 0.55} />
        {/* blades: upper blade from the left, lower blade from the right (they overlap to shear) */}
        <path d={`M${L - 420},${Y - 62} L${lEdge},${Y - 62} L${lEdge + 26},${Y - 4} L${L - 420},${Y - 4} Z`} fill={AMB} stroke="#000" strokeWidth={3} />
        <path d={`M${R + 420},${Y + 4} L${rEdge},${Y + 4} L${rEdge - 26},${Y + 62} L${R + 420},${Y + 62} Z`} fill={AMB} stroke="#000" strokeWidth={3} />
        {txt(L - 30, Y - 90, 'BLIND SHEAR RAM', 1, AMB, 30, 'end', 800)}
        {txt(C, 1040, 'DRILL PIPE', 0.85, '#D9DDE0', 26, 'middle', 700)}
        {sealed && txt(C + 260, Y - 120, 'PIPE CUT · WELL SEALED', ease(t, 0, 0.1), BLUE, 34, 'start', 800)}
        {gapLabel > 0 && <g opacity={gapLabel}>
          <line x1={gapX + 16} y1={Y + 20} x2={1330} y2={780} stroke={HC} strokeWidth={4} />
          {txt(1340, 800, 'GAP: OIL AND GAS', 1, HC, 44, 'start', 800)}
          {txt(1340, 852, 'KEEP FLOWING', 1, HC, 44, 'start', 800)}
        </g>}
        {buckle > 0.3 && !should && txt(pcY + 80, 260, 'PIPE BUCKLED, OFF CENTER', Math.min(1, (buckle - 0.3) / 0.4), INK, 32, 'start', 800)}
      </svg>
      <Footer />
    </AbsoluteFill>
  );
};
const y0w = (should: boolean, close: number) => (should ? 220 * (1 - close) + 40 : 200);
