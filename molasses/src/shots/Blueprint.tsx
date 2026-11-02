import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import { C, FONT, appear, prog, Tag, Grain, Vignette, ws, fmt } from '../lib';
import { toOld } from '../lib';

// Tank drawn to scale: 90 ft wide x 50 ft tall, 10 px per ft
const X0 = 510, X1 = 1410, YB = 840, YT = 340, ROOF = 34;
const W = X1 - X0, H = YB - YT;
const COURSES = 7;
const BlueBG: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ background: '#F4F7FA' }}>
    <svg width="1920" height="1080">
      <defs>
        <pattern id="g1" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="rgba(47,93,134,0.08)" strokeWidth="1" /></pattern>
        <pattern id="g2" width="200" height="200" patternUnits="userSpaceOnUse"><path d="M200 0H0V200" fill="none" stroke="rgba(47,93,134,0.16)" strokeWidth="1" /></pattern>
      </defs>
      <g transform={`translate(${-t * 6},0)`}>
        <rect x="-200" width="2400" height="1080" fill="url(#g1)" />
        <rect x="-200" width="2400" height="1080" fill="url(#g2)" />
      </g>
    </svg>
  </AbsoluteFill>
);

const outlinePath = `M${X0},${YB} L${X0},${YT} L${(X0 + X1) / 2},${YT - ROOF} L${X1},${YT} L${X1},${YB} Z`;
const OUTLINE_LEN = 2 * H + 2 * Math.hypot(W / 2, ROOF) + W;

const Tank: React.FC<{ draw: number; seams: number; stroke?: string; fill?: React.ReactNode; clip?: string }> = ({ draw, seams, stroke = C.blue, fill }) => (
  <g>
    {fill}
    <path d={outlinePath} fill="none" stroke={stroke} strokeWidth={3} strokeDasharray={OUTLINE_LEN} strokeDashoffset={OUTLINE_LEN * (1 - draw)} strokeLinejoin="round" />
    {Array.from({ length: COURSES - 1 }).map((_, i) => {
      const y = YB - ((i + 1) * H) / COURSES;
      const p = interpolate(seams, [i / COURSES, (i + 1.5) / COURSES], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
      return (
        <g key={i} opacity={p}>
          <line x1={X0} y1={y} x2={X0 + W * p} y2={y} stroke={stroke} strokeWidth={1.2} opacity={0.55} />
          {Array.from({ length: 45 }).map((_, j) => (j / 45 < p ? <circle key={j} cx={X0 + 10 + j * 20} cy={y - 5} r={1.6} fill={stroke} opacity={0.5} /> : null))}
        </g>
      );
    })}
  </g>
);

const Dim: React.FC<{ x1: number; y1: number; x2: number; y2: number; label: string; p: number; lx: number; ly: number; anchor?: string }> = ({ x1, y1, x2, y2, label, p, lx, ly, anchor = 'middle' }) => {
  const xm = x1 + (x2 - x1) * p, ym = y1 + (y2 - y1) * p;
  const vert = x1 === x2;
  const tick = (x: number, y: number) => (vert ? <line x1={x - 14} y1={y} x2={x + 14} y2={y} /> : <line x1={x} y1={y - 14} x2={x} y2={y + 14} />);
  return (
    <g stroke={C.amberHi} strokeWidth={2.5} opacity={p > 0 ? 1 : 0}>
      {tick(x1, y1)}
      <line x1={x1} y1={y1} x2={xm} y2={ym} />
      {p > 0.98 && tick(x2, y2)}
      <text x={lx} y={ly} fill={C.text} stroke="none" fontFamily={FONT} fontWeight={800} fontSize={54} textAnchor={anchor as any} opacity={prog(p, 0.5, 1)}>{label}</text>
    </g>
  );
};

// ---------------- Shot 5: blueprint with dimensions and a gallons counter
export const BlueprintShot: React.FC<{ t: number; start: number }> = ({ t, start: start0 }) => {
  const start = toOld(start0); const a = toOld(t + start0);
  const draw = prog(a, start, start + 1.0);
  const seams = prog(a, start + 0.5, start + 2.2);
  const h50 = prog(a, ws(32) - 0.05, ws(32) + 0.6);
  const w90 = prog(a, ws(35) - 0.05, ws(35) + 0.6);
  const fillP = prog(a, ws(38), ws(46) + 0.6);
  const cnt = prog(a, ws(42) - 0.1, ws(46) + 0.4);
  const yFill = YB - H * 0.93 * fillP;
  const push = 1 + 0.045 * prog(a, start, start + 8, false);
  return (
    <AbsoluteFill>
      <BlueBG t={t} />
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: '50% 55%' }}>
        <svg width="1920" height="1080">
          <defs><clipPath id="tk"><path d={outlinePath} /></clipPath></defs>
          <g clipPath="url(#tk)">
            <rect x={X0} y={yFill} width={W} height={YB - yFill} fill={C.amber} opacity={0.55} />
            <path d={`M${X0},${yFill} ${Array.from({ length: 19 }).map((_, i) => `L${X0 + i * 50},${yFill + 4 * Math.sin(i * 1.3 + a * 2.2)}`).join(' ')} L${X1},${yFill}`} fill="none" stroke={C.amberHi} strokeWidth={2} opacity={fillP > 0.02 ? 0.9 : 0} />
          </g>
          <Tank draw={draw} seams={seams} />
          <line x1={X0 - 120} y1={YB} x2={X1 + 120} y2={YB} stroke={C.blue} strokeWidth={1.5} opacity={0.5 * draw} />
          <Dim x1={X0 - 70} y1={YB} x2={X0 - 70} y2={YT} label="50 ft" p={h50} lx={X0 - 100} ly={(YB + YT) / 2 + 18} anchor="end" />
          <Dim x1={X0} y1={YB + 70} x2={X1} y2={YB + 70} label="90 ft" p={w90} lx={(X0 + X1) / 2} ly={YB + 140} />
        </svg>
        <div style={{ position: 'absolute', left: X0, width: W, top: 450, textAlign: 'center', fontFamily: FONT, color: C.text, opacity: appear(a, ws(42) - 0.1) }}>
          <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: -1, fontVariantNumeric: 'tabular-nums' }}>{fmt(2300000 * cnt)}</div>
          <div style={{ fontSize: 34, fontWeight: 600, letterSpacing: 6, textTransform: 'uppercase', color: C.text, opacity: 0.9 }}>gallons of molasses</div>
        </div>
      </AbsoluteFill>
      <div style={{ position: 'absolute', left: 72, top: 60, fontFamily: FONT, color: C.blue, fontSize: 21, letterSpacing: 3, fontWeight: 600, opacity: appear(t, 0.3) }}>
        MOLASSES STORAGE TANK · COMMERCIAL STREET
      </div>
      <Tag t={t}>Diagram · to scale</Tag>
      <Vignette o={0.55} />
      <Grain o={0.05} />
    </AbsoluteFill>
  );
};

// ---------------- Shot 7: streaks, then the tank is painted brown
const STREAKS = [0.08, 0.17, 0.26, 0.33, 0.44, 0.52, 0.61, 0.7, 0.79, 0.88, 0.94].map((f, i) => ({ x: X0 + W * f, y0: YB - (H * ((i * 37) % 6 + 1)) / COURSES, len: 90 + ((i * 53) % 5) * 45, w: 5 + (i % 3) * 3 }));
export const PaintShot: React.FC<{ t: number; start: number }> = ({ t, start: start0 }) => {
  const start = toOld(start0); const a = toOld(t + start0);
  const paint = prog(a, ws(60) - 0.1, ws(62) + 0.9);
  const hide = prog(a, ws(64) - 0.2, ws(66) + 0.4);
  const yP = YB - (H + ROOF + 4) * paint;
  const push = 1 + 0.06 * prog(a, start, start + 4.2, false);
  return (
    <AbsoluteFill>
      <BlueBG t={t + 10} />
      <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0, transform: `scale(${push})`, transformOrigin: '50% 60%' }}>
        <defs><clipPath id="tk2"><path d={outlinePath} /></clipPath></defs>
        <g clipPath="url(#tk2)">
          <rect x={X0} y={YT - ROOF} width={W} height={H + ROOF} fill="#FFFFFF" />
          {STREAKS.map((s, i) => {
            const g = 0.45 + 0.55 * prog(a, start + i * 0.06, start + 0.9 + i * 0.06);
            return <path key={i} d={`M${s.x},${s.y0} q 4,${s.len * 0.5 * g} 0,${s.len * g}`} stroke="#8A5418" strokeWidth={s.w} strokeLinecap="round" fill="none" opacity={0.95 * (1 - 0.85 * hide)} />;
          })}
          <rect x={X0} y={yP} width={W} height={YB - yP + 2} fill={C.brown} opacity={0.97} />
          <line x1={X0} y1={yP} x2={X1} y2={yP} stroke={C.amberHi} strokeWidth={3} opacity={paint > 0 && paint < 1 ? 0.9 : 0} />
        </g>
        <Tank draw={1} seams={1} stroke="rgba(47,93,134,0.9)" />
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 56, color: C.text, letterSpacing: -0.5, opacity: appear(a, ws(60)) }}>
        Painted brown <span style={{ color: C.amberHi }}>to hide the streaks</span>
      </div>
      <Tag t={t}>Illustration</Tag>
      <Vignette o={0.55} />
      <Grain o={0.05} />
    </AbsoluteFill>
  );
};

// ---------------- Shot 9: the steel splits apart (schematic)
export const SplitShot: React.FC<{ t: number; start: number }> = ({ t, start: start0 }) => {
  const start = toOld(start0); const a = toOld(t + start0);
  const crack = prog(a, ws(73) - 0.15, ws(74) + 0.45);
  const sep = prog(a, ws(74) + 0.2, ws(74) + 2.0);
  const cx = X0 + W * 0.46;
  const pts: [number, number][] = [];
  for (let i = 0; i <= 14; i++) pts.push([cx + (i % 2 ? 16 : -12) + (i % 3) * 4, YB - (i * (H + ROOF * 0.6)) / 14]);
  const n = Math.max(1, Math.round(crack * 14));
  const cd = 'M' + pts.slice(0, n + 1).map((p) => p.join(',')).join('L');
  const leftClip = 'M0,0 L' + pts.map((p) => p.join(',')).reverse().join(' L') + ` L${pts[0][0]},1080 L0,1080Z`;
  const fade = 1 - 0.6 * prog(a, ws(74) + 1.2, ws(74) + 2.2);
  return (
    <AbsoluteFill style={{ background: '#F4F7FA' }}>
      <BlueBG t={t + 20} />
      <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0, opacity: fade }}>
        <defs>
          <clipPath id="L"><path d={leftClip} /></clipPath>
          <clipPath id="Rr"><path d={leftClip + ' M1920,0 L0,0 L0,1080 L1920,1080Z'} clipRule="evenodd" /></clipPath>
        </defs>
        <g clipPath="url(#L)" transform={`translate(${-22 * sep},${4 * sep}) rotate(${-1.4 * sep} ${X0} ${YB})`}>
          <rect x={X0} y={YT} width={W} height={H} fill={C.brown} opacity={0.9} />
          <Tank draw={1} seams={1} stroke="rgba(47,93,134,0.9)" />
        </g>
        <g clipPath="url(#Rr)" transform={`translate(${22 * sep},${4 * sep}) rotate(${1.4 * sep} ${X1} ${YB})`}>
          <rect x={X0} y={YT} width={W} height={H} fill={C.brown} opacity={0.9} />
          <Tank draw={1} seams={1} stroke="rgba(47,93,134,0.9)" />
        </g>
        {sep > 0 && <rect x={cx - 40} y={YT - 10} width={80} height={H + 10} fill={C.amber} opacity={0.0} />}
        <path d={cd} fill="none" stroke={C.amberHi} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" opacity={1 - sep * 0.6} />
      </svg>
      <Tag t={t}>Illustration</Tag>
      <Vignette o={0.6} />
      <Grain o={0.05} />
    </AbsoluteFill>
  );
};
