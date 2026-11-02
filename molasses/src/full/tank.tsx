// Tank diagrams & illustrations for the full episode (light blueprint style). Cues are ABSOLUTE seconds.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, FONT, appear, prog, Tag, Grain, fmt } from '../lib';
import { SP } from './kit';

const A = (p: SP) => p.t + p.start;
const X0 = 560, X1 = 1360, YB = 860, YT = 420, ROOF = 30, W = X1 - X0, H = YB - YT, COURSES = 7;
const OUT = `M${X0},${YB} L${X0},${YT} L${(X0 + X1) / 2},${YT - ROOF} L${X1},${YT} L${X1},${YB} Z`;
const OLEN = 2 * H + 2 * Math.hypot(W / 2, ROOF) + W;
const INK = '#2F5D86';

export const BlueBG: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ background: '#F4F7FA' }}>
    <svg width="1920" height="1080">
      <defs>
        <pattern id="fg1" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="rgba(47,93,134,0.08)" strokeWidth="1" /></pattern>
        <pattern id="fg2" width="200" height="200" patternUnits="userSpaceOnUse"><path d="M200 0H0V200" fill="none" stroke="rgba(47,93,134,0.16)" strokeWidth="1" /></pattern>
      </defs>
      <g transform={`translate(${-(t * 6) % 200},0)`}><rect x="0" width="2400" height="1080" fill="url(#fg1)" /><rect x="0" width="2400" height="1080" fill="url(#fg2)" /></g>
    </svg>
  </AbsoluteFill>
);
const Title: React.FC<{ o: number; text: string; sub?: string; subO?: number }> = ({ o, text, sub, subO = 1 }) => (
  <div style={{ position: 'absolute', top: 120, width: '100%', textAlign: 'center', fontFamily: FONT, color: C.text }}>
    <div style={{ fontSize: 60, fontWeight: 800, letterSpacing: -0.5, opacity: o, transform: `translateY(${(1 - o) * 12}px)` }}>{text}</div>
    {sub && <div style={{ fontSize: 34, color: C.dim, marginTop: 14, opacity: subO }}>{sub}</div>}
  </div>
);
const Seams: React.FC<{ o?: number }> = ({ o = 1 }) => (
  <g opacity={o}>
    {Array.from({ length: COURSES - 1 }).map((_, i) => {
      const y = YB - ((i + 1) * H) / COURSES;
      return <g key={i}><line x1={X0} y1={y} x2={X1} y2={y} stroke={INK} strokeWidth={1.2} opacity={0.5} />{Array.from({ length: 40 }).map((_, j) => <circle key={j} cx={X0 + 10 + j * 20} cy={y - 5} r={1.6} fill={INK} opacity={0.5} />)}</g>;
    })}
  </g>
);

export type TankMode = 'outline' | 'fill' | 'test' | 'leak' | 'pail' | 'paint' | 'noise' | 'warm' | 'expand' | 'level' | 'rivets' | 'burst' | 'check' | 'capacity';
export const TankDiagram: React.FC<SP & { mode: TankMode; title?: string; titleAt?: number; sub?: string; subAt?: number; at?: number; at2?: number; level?: number; count?: { to: number; at: number; label: string }; labels?: { text: string; at: number }[]; tag?: string }> = (p) => {
  const a = A(p);
  const at = p.at ?? p.start + 0.3, at2 = p.at2 ?? at + 1.5;
  const zoom = 1 + 0.04 * Math.min(1, p.t / Math.max(1, p.dur));
  const draw = p.mode === 'outline' ? prog(a, at, at + 1.2) : 1;
  const m = p.mode;
  // liquid level
  let lvl = p.level ?? (['fill', 'warm', 'expand', 'level', 'rivets', 'capacity', 'noise', 'leak', 'pail'].includes(m) ? 0.9 : 0);
  if (m === 'fill') lvl = 0.9 * prog(a, at, at2);
  if (m === 'level') lvl = 0.86 + 0.04 * prog(a, at, at + 2.0);
  if (m === 'capacity') lvl = 0.92;
  const water = m === 'test' ? 0.85 * prog(a, at, at + 1.6) * (1 - prog(a, at2, at2 + 0.8)) : 0;
  const yL = YB - H * lvl;
  const sep = m === 'burst' ? prog(a, at2, at2 + 1.6) : 0;
  const crack = m === 'burst' ? prog(a, at, at2) : 0;
  const pts: [number, number][] = []; const cx = X0 + W * 0.47;
  for (let i = 0; i <= 14; i++) pts.push([cx + (i % 2 ? 16 : -12) + (i % 3) * 4, YB - (i * (H + ROOF * 0.6)) / 14]);
  const leftClip = 'M0,0 L' + pts.map((q) => q.join(',')).reverse().join(' L') + ` L${pts[0][0]},1080 L0,1080Z`;
  const paint = m === 'paint' ? prog(a, at, at + 1.3) : 0;
  const tankBody = (
    <g>
      <defs><clipPath id={`tk${m}`}><path d={OUT} /></clipPath></defs>
      <g clipPath={`url(#tk${m})`}>
        <rect x={X0} y={YT - ROOF} width={W} height={H + ROOF} fill="#FFFFFF" />
        {lvl > 0 && <rect x={X0} y={yL} width={W} height={YB - yL} fill={C.amber} opacity={0.5} />}
        {m === 'warm' && <rect x={X0} y={YB - H * 0.28 * prog(a, at, at + 1.6)} width={W} height={H * 0.28 * prog(a, at, at + 1.6)} fill="#D9502A" opacity={0.55} />}
        {water > 0 && <rect x={X0} y={YB - H * water} width={W} height={H * water} fill="#7FB3DA" opacity={0.7} />}
        {(m === 'leak' || m === 'pail' || m === 'paint') && [0.08, 0.17, 0.26, 0.33, 0.44, 0.52, 0.61, 0.7, 0.79, 0.88, 0.94].map((f, i) => {
          const g = m === 'paint' ? 1 : prog(a, at + i * 0.1, at + 1.2 + i * 0.1);
          const y0 = YB - (H * (((i * 37) % 6) + 1)) / COURSES, len = 90 + ((i * 53) % 5) * 45;
          return <path key={i} d={`M${X0 + W * f},${y0} q 4,${len * 0.5 * g} 0,${len * g}`} stroke="#8A5418" strokeWidth={6 + (i % 3) * 3} strokeLinecap="round" fill="none" opacity={0.9} />;
        })}
        {m === 'paint' && <rect x={X0} y={YB - (H + ROOF + 4) * paint} width={W} height={(H + ROOF + 4) * paint + 2} fill={C.brown} opacity={0.97} />}
      </g>
      <path d={OUT} fill="none" stroke={INK} strokeWidth={3} strokeDasharray={OLEN} strokeDashoffset={OLEN * (1 - draw)} strokeLinejoin="round" />
      <Seams o={draw} />
    </g>
  );
  return (
    <AbsoluteFill>
      <BlueBG t={p.t} />
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: '50% 62%' }}>
        <svg width="1920" height="1080">
          {m !== 'burst' && tankBody}
          {m === 'burst' && (
            <>
              <defs><clipPath id="bL"><path d={leftClip} /></clipPath><clipPath id="bR"><path d={leftClip + ' M1920,0 L0,0 L0,1080 L1920,1080Z'} clipRule="evenodd" /></clipPath></defs>
              <g clipPath="url(#bL)" transform={`translate(${-26 * sep},${4 * sep}) rotate(${-1.6 * sep} ${X0} ${YB})`}>{tankBody}</g>
              <g clipPath="url(#bR)" transform={`translate(${26 * sep},${4 * sep}) rotate(${1.6 * sep} ${X1} ${YB})`}>{tankBody}</g>
              <path d={'M' + pts.slice(0, Math.max(1, Math.round(crack * 14)) + 1).map((q) => q.join(',')).join('L')} fill="none" stroke={C.amber} strokeWidth={5} strokeLinejoin="round" />
              {sep > 0 && <path d={`M${cx - 30},${YB} C ${cx - 200},${YB + 10} ${cx - 520 * sep},${YB + 30} ${cx - 760 * sep},${YB + 40} L ${cx + 760 * sep},${YB + 40} C ${cx + 520 * sep},${YB + 30} ${cx + 200},${YB + 10} ${cx + 30},${YB}Z`} fill={C.amber} opacity={0.6} />}
            </>
          )}
          <line x1={X0 - 140} y1={YB} x2={X1 + 140} y2={YB} stroke={INK} strokeWidth={1.5} opacity={0.5} />
          {m === 'outline' && (
            <g stroke={C.amber} strokeWidth={2.5} opacity={appear(a, at + 0.8)}>
              <line x1={X0 - 70} y1={YB} x2={X0 - 70} y2={YT} /><line x1={X0 - 84} y1={YB} x2={X0 - 56} y2={YB} /><line x1={X0 - 84} y1={YT} x2={X0 - 56} y2={YT} />
              <text x={X0 - 100} y={(YB + YT) / 2 + 18} textAnchor="end" stroke="none" fill={C.text} fontFamily={FONT} fontWeight={800} fontSize={54}>50 ft</text>
            </g>
          )}
          {m === 'pail' && (() => { const d = (a * 1.4) % 1; return (
            <g>
              <path d={`M${X1 + 60},${YB - 90} L${X1 + 190},${YB - 90} L${X1 + 175},${YB} L${X1 + 75},${YB}Z`} fill="#FFFFFF" stroke={C.text} strokeWidth={3} opacity={appear(a, at)} />
              <rect x={X1 + 70} y={YB - 30 - 40 * prog(a, at, at + 3)} width={110} height={30 + 40 * prog(a, at, at + 3)} fill="#8A5418" opacity={0.85 * appear(a, at)} />
              <circle cx={X1 + 2} cy={YB - 260 + d * 160} r={8} fill="#8A5418" opacity={appear(a, at)} />
              <path d={`M${X1},${YB - 270} q 60,20 120,180`} fill="none" stroke="#8A5418" strokeWidth={4} strokeDasharray="6 10" opacity={0.6 * appear(a, at)} />
            </g>); })()}
          {m === 'noise' && [0, 1, 2].map((k) => { const ph = ((a - at) * 0.9 + k / 3) % 1; const o = a > at ? (1 - ph) * 0.8 : 0; return (
            <g key={k} opacity={o} fill="none" stroke={C.amber} strokeWidth={4}>
              <path d={`M${X0 - 60 - ph * 160},${YT + 80} q ${-50 - ph * 40},${H / 2 - 80} 0,${H - 160}`} />
              <path d={`M${X1 + 60 + ph * 160},${YT + 80} q ${50 + ph * 40},${H / 2 - 80} 0,${H - 160}`} />
            </g>); })}
          {m === 'expand' && [0.25, 0.5, 0.75].map((f, i) => { const ph = Math.sin((a - at) * 3 + i) * 0.5 + 0.5; const o = appear(a, at + i * 0.2); return (
            <g key={i} opacity={o} stroke="#D9502A" strokeWidth={6} strokeLinecap="round" fill="none">
              <path d={`M${X0 + 40},${YB - H * f} l ${-90 - 20 * ph},0 m 22,-18 l -22,18 l 22,18`} />
              <path d={`M${X1 - 40},${YB - H * f} l ${90 + 20 * ph},0 m -22,-18 l 22,18 l -22,18`} />
            </g>); })}
          {m === 'level' && (() => { const o = appear(a, at); return (
            <g opacity={o}>
              <circle cx={X1 - 110} cy={yL} r={120} fill="rgba(255,255,255,0.6)" stroke={C.text} strokeWidth={5} />
              <line x1={X1 - 110 + 85} y1={yL + 85} x2={X1 + 60} y2={yL + 230} stroke={C.text} strokeWidth={14} strokeLinecap="round" />
              <line x1={X1 - 200} y1={YB - H * 0.86} x2={X1 - 20} y2={YB - H * 0.86} stroke={C.text} strokeWidth={3} strokeDasharray="10 8" />
            </g>); })()}
          {m === 'rivets' && Array.from({ length: 16 }).map((_, i) => {
            const y = YB - (4 * H) / COURSES - 5, x = X0 + 30 + i * 49; const ti = at + i * 0.09; const g = prog(a, ti, ti + 0.5, false);
            return g > 0 ? <circle key={i} cx={x + (i % 2 ? 1 : -1) * 160 * g} cy={y - 200 * g + 320 * g * g} r={12} fill={C.amber} opacity={1 - g * 0.5} /> : <circle key={i} cx={x} cy={y} r={11} fill={INK} />;
          })}
          {m === 'test' && (() => { const o = appear(a, at2 + 0.3, 0.35); return (
            <g opacity={o} transform={`rotate(-8 960 640)`}>
              <rect x={660} y={560} width={600} height={150} fill="none" stroke="#C0392B" strokeWidth={8} rx={8} />
              <text x={960} y={658} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={62} fill="#C0392B" letterSpacing={2}>NOT PROPERLY DONE</text>
            </g>); })()}
          {m === 'check' && ['Licensed architect', 'Civil engineer'].map((s, i) => { const o = appear(a, (p.labels?.[i]?.at) ?? at + i * 0.6); return (
            <g key={i} opacity={o} transform={`translate(${X1 + 60},${YT + 120 + i * 140})`}>
              <circle cx={30} cy={0} r={30} fill={C.amber} /><path d="M16,0 l10,11 l20,-22" fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
              <text x={80} y={14} fontFamily={FONT} fontWeight={700} fontSize={40} fill={C.text}>{s}</text>
            </g>); })}
          {m === 'capacity' && Array.from({ length: 8 }).map((_, i) => { const o = appear(a, at + i * 0.22, 0.2); return <circle key={i} cx={X0 + 60 + i * 97} cy={YB + 80} r={20} fill={o > 0.5 ? C.amber : 'none'} stroke={C.amber} strokeWidth={3} />; })}
        </svg>
        {p.count && <div style={{ position: 'absolute', left: X0, width: W, top: YT + 120, textAlign: 'center', fontFamily: FONT, color: C.text, opacity: appear(a, p.count.at) }}>
          <div style={{ fontSize: 92, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{fmt(p.count.to * prog(a, p.count.at, p.count.at + 1.4))}</div>
          <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: 5, textTransform: 'uppercase' }}>{p.count.label}</div>
        </div>}
        {(p.labels ?? []).filter(() => m !== 'check').map((l, i) => (
          <div key={i} style={{ position: 'absolute', left: m === 'warm' && i === 1 ? X1 + 50 : X1 + 50, top: m === 'warm' ? (i === 0 ? YT + 120 : i === 1 ? YB - 110 : YT - 120) : YT + 60 + i * 90, fontFamily: FONT, fontSize: 40, fontWeight: 700, color: i === 1 && m === 'warm' ? '#B5401F' : C.text, opacity: appear(a, l.at), maxWidth: 460 }}>{l.text}</div>
        ))}
      </AbsoluteFill>
      {p.title && <Title o={appear(a, p.titleAt ?? p.start + 0.15)} text={p.title} sub={p.sub} subO={appear(a, p.subAt ?? p.start + 0.6)} />}
      <Tag t={p.t}>{p.tag ?? 'Diagram'}</Tag>
      <Grain o={0.04} />
    </AbsoluteFill>
  );
};

// steel plate thickness: as it should have been vs. as built (about half)
export const SteelCard: React.FC<SP & { at: number; at2: number }> = (p) => {
  const a = A(p);
  const g1 = prog(a, Math.min(p.at, p.start + 0.6), Math.min(p.at, p.start + 0.6) + 0.8), g2 = prog(a, p.at2, p.at2 + 0.8);
  return (
    <AbsoluteFill>
      <BlueBG t={p.t} />
      <Title o={appear(p.t, 0.1)} text="Steel plate thickness" sub="2014 investigation · cross-section, schematic" />
      <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0 }}>
        <rect x={420} y={420} width={1080 * g1} height={160} fill="#9DB6CC" stroke={INK} strokeWidth={3} />
        <text x={420} y={400} fontFamily={FONT} fontSize={36} fontWeight={700} fill={C.text} opacity={g1}>What it should have been</text>
        <rect x={420} y={700} width={1080 * g2} height={80} fill={C.amber} stroke="#8A5418" strokeWidth={3} />
        <text x={420} y={680} fontFamily={FONT} fontSize={36} fontWeight={700} fill={C.text} opacity={g2}>What was built: about half as thick</text>
      </svg>
      <Tag t={p.t}>Diagram</Tag>
      <Grain o={0.04} />
    </AbsoluteFill>
  );
};

// crack starting at a rivet hole (close-up, schematic)
export const RivetCrack: React.FC<SP & { at: number }> = (p) => {
  const a = A(p); const g = prog(a, p.at, p.at + 1.6);
  const pts = [[960, 540], [1010, 500], [1060, 515], [1130, 450], [1200, 470], [1290, 380], [1400, 395], [1520, 300]];
  const n = Math.max(1, Math.round(g * (pts.length - 1)));
  return (
    <AbsoluteFill>
      <BlueBG t={p.t} />
      <Title o={appear(p.t, 0.1)} text="Cracks began at flawed rivet holes" sub="close-up, schematic" />
      <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0, transform: `scale(${1 + 0.05 * p.t / p.dur})`, transformOrigin: '50% 55%' }}>
        <rect x={300} y={380} width={1320} height={420} fill="#C9D6E2" stroke={INK} strokeWidth={3} />
        {[560, 760, 960, 1160, 1360].map((x, i) => <circle key={i} cx={x} cy={590} r={i === 2 ? 46 : 40} fill="#F4F7FA" stroke={INK} strokeWidth={4} />)}
        <path d={'M' + pts.slice(0, n + 1).map((q) => q.join(',')).join('L')} fill="none" stroke={C.amber} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" transform="translate(40,10)" />
        <path d={'M' + pts.slice(0, n + 1).map((q) => [1920 - q[0], 1080 - q[1] + 100].join(',')).join('L')} fill="none" stroke={C.amber} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" transform="translate(-40,0)" opacity={0.85} />
      </svg>
      <Tag t={p.t}>Illustration</Tag>
      <Grain o={0.04} />
    </AbsoluteFill>
  );
};

// ground cross-section under the ballfield; radar finds the base ~20 in down
export const RadarCard: React.FC<SP & { at: number; at2: number }> = (p) => {
  const a = A(p);
  const sx = 400 + 1100 * prog(a, p.at, p.at2 + 0.5, false);
  const found = appear(a, p.at2, 0.5);
  return (
    <AbsoluteFill style={{ background: '#EAF3FA' }}>
      <Title o={appear(p.t, 0.1)} text="Under the ballfield, Langone Park" sub="2019 · ground-penetrating radar · schematic" />
      <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0 }}>
        <rect x={0} y={520} width={1920} height={40} fill="#8DBF6A" />
        <rect x={0} y={560} width={1920} height={520} fill="#EAE0CC" />
        <rect x={560} y={690} width={800} height={60} fill="#B9B4AA" stroke="#7B766C" strokeWidth={3} opacity={0.25 + 0.75 * found} />
        <text x={960} y={800} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={36} fill={C.text} opacity={found}>The tank’s concrete base</text>
        <g opacity={found}>
          <line x1={1420} y1={540} x2={1420} y2={690} stroke={C.amber} strokeWidth={4} />
          <path d="M1404,556 l16,-16 l16,16 M1404,674 l16,16 l16,-16" fill="none" stroke={C.amber} strokeWidth={4} />
          <text x={1446} y={630} fontFamily={FONT} fontWeight={800} fontSize={52} fill={C.text}>~20 in</text>
        </g>
        <g transform={`translate(${sx},470)`}>
          <rect x={-60} y={0} width={120} height={50} rx={8} fill="#FFFFFF" stroke={C.text} strokeWidth={3} />
          <circle cx={-34} cy={58} r={12} fill={C.text} /><circle cx={34} cy={58} r={12} fill={C.text} />
          {[0, 1, 2].map((k) => { const ph = ((a * 1.2 + k / 3) % 1); return <path key={k} d={`M${-50 - ph * 60},${90 + ph * 130} q ${50 + ph * 60},${40} ${100 + ph * 120},0`} fill="none" stroke={C.amber} strokeWidth={3} opacity={1 - ph} />; })}
        </g>
      </svg>
      <Tag t={p.t}>Illustration</Tag>
      <Grain o={0.04} />
    </AbsoluteFill>
  );
};

// the 2016 experiment: cold syrup flowing over a model of the neighbourhood
export const ModelCard: React.FC<SP & { at: number }> = (p) => {
  const a = A(p); const g = prog(a, p.at, p.at + 3.0, false);
  const blocks = [[700, 520, 160, 90], [900, 500, 120, 130], [1060, 540, 170, 80], [760, 660, 130, 110], [940, 690, 160, 80], [1150, 650, 120, 120], [620, 780, 150, 70], [1300, 760, 140, 90]];
  return (
    <Light2>
      <Title o={appear(p.t, 0.1)} text="Harvard, 2016: a scale model" sub="cold corn syrup over a model of the neighborhood · schematic" />
      <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0 }}>
        <rect x={440} y={430} width={1100} height={480} fill="#FFFFFF" stroke={C.line} strokeWidth={3} rx={8} />
        <path d={`M560,470 C ${700 + 300 * g},${480 + 60 * g} ${800 + 500 * g},${620 + 200 * g} ${560 + 900 * g},${880} L 560,880 Z`} fill={C.amber} opacity={0.55} />
        {blocks.map(([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} fill="#E3D8C4" stroke="#B8AC97" strokeWidth={2} />)}
        <circle cx={560} cy={470} r={26} fill="#FFFFFF" stroke={C.text} strokeWidth={4} />
      </svg>
      <Tag t={p.t}>Illustration</Tag>
    </Light2>
  );
};
const Light2: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 42%, #FFFFFF 0%, ${C.card} 60%, #EDE7DB 100%)` }}>{children}<Grain o={0.04} /></AbsoluteFill>
);

// a boy carried on the crest of the wave, then rolled under as it slows (schematic)
export const CrestCard: React.FC<SP & { at: number; under: number; survived: number }> = (p) => {
  const a = A(p);
  const g = prog(a, p.at, p.under, false);
  const xs = 300 + 1200 * g;
  const crest = (x: number) => 640 - 220 * Math.exp(-Math.pow((x - (300 + 1300 * prog(a, p.at, p.under + 1, false))) / 260, 2)) * (1 - 0.6 * prog(a, p.under, p.under + 1));
  const d = 'M0,900 ' + Array.from({ length: 49 }).map((_, i) => `L${i * 40},${crest(i * 40)}`).join(' ') + ' L1920,900 Z';
  const under = prog(a, p.under, p.under + 0.8);
  return (
    <Light2>
      <Title o={appear(p.t, 0.1)} text="Carried on the crest" />
      <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0 }}>
        <path d={d} fill={C.amber} opacity={0.6} />
        <circle cx={xs} cy={crest(xs) - 14 + under * 70} r={14} fill={C.text} />
      </svg>
      <div style={{ position: 'absolute', bottom: 90, width: '100%', textAlign: 'center', fontFamily: FONT, fontSize: 72, fontWeight: 800, color: C.text, opacity: appear(a, p.survived) }}>Anthony survived.</div>
      <Tag t={p.t}>Illustration</Tag>
    </Light2>
  );
};
