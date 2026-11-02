// Demo: the cold-open hook (~72 s). Every cut is tied to a word of the narration.
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate } from 'remotion';
import WJ from '../vo/hook.words.json';
import { C, SANS, DISPLAY, FPS, pe, lin, SP, Still, Clip, Slam, Type, Stamp, Count, Credit, Tag, Burst, Grain, Vignette } from './lib';
import { MapBase, MLabel, Pulse, Wind, LAHAINA, IGN, SIRENS } from './maps';
import M from './data/map.json';

const WORDS = WJ as { w: string; s: number; e: number; line: string }[];
const norm = (x: string) => x.toLowerCase().replace(/[^a-z0-9:]/g, '');
export const W = (line: string, w: string, nth = 0) => {
  const h = WORDS.filter((x) => x.line === line && norm(x.w).startsWith(norm(w)));
  if (!h[nth]) throw new Error(`cue ${line}/${w}`);
  return h[nth].s;
};
const L = (line: string) => WORDS.find((x) => x.line === line)!.s;
const LE = (line: string) => [...WORDS].reverse().find((x) => x.line === line)!.e;
export const VO_END = LE('h14');
export const DEMO_DUR = VO_END + 4.0;

const DVIDS = 'Photo: U.S. Customs and Border Protection / Glenn Fawcett · Public domain';
const FEMAV = 'Video: FEMA · Public domain';
const NG = 'Photo: The National Guard · CC BY 2.0';
const USCG = 'Photo: U.S. Coast Guard · Public domain';

// rising embers over fire scenes
const Embers: React.FC<{ t: number; n?: number; o?: number }> = ({ t, n = 46, o = 1 }) => (
  <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'screen', opacity: o }}>
    <svg width="1920" height="1080">
      {Array.from({ length: n }).map((_, i) => {
        const r1 = Math.abs(Math.sin(i * 91.7) * 4375.5) % 1, r2 = Math.abs(Math.sin(i * 17.3) * 9123.1) % 1;
        const ph = (t * (0.12 + 0.18 * r2) + r1) % 1;
        const x = 1920 * r2 + 120 * Math.sin(t * 1.3 + i) - 300 * ph; const y = 1100 - ph * 1250;
        return <circle key={i} cx={x} cy={y} r={1.5 + 3 * r1} fill={r1 > 0.5 ? '#FFB347' : '#FF6A1A'} opacity={(0.4 + 0.6 * Math.abs(Math.sin(t * 7 + i))) * Math.sin(Math.PI * ph)} />;
      })}
    </svg>
  </AbsoluteFill>
);
// red glitch flash for timestamps (very short, no shaking)
const Flash: React.FC<{ t: number; at: number; color?: string; o?: number }> = ({ t, at, color = '#FFFFFF', o = 0.5 }) => {
  if (t < at || t > at + 0.4) return null;
  return <AbsoluteFill style={{ background: color, opacity: o * Math.exp(-(t - at) / 0.08), pointerEvents: 'none' }} />;
};

type Shot = { at: number; el: (p: SP & { a: number }) => React.ReactNode; x?: 'cut' | 'fade' | 'zoom' };
const sh = (at: number, el: Shot['el'], x: Shot['x'] = 'cut'): Shot => ({ at, el, x });

const town = { x: LAHAINA.x + 0.2, y: LAHAINA.y };
const SHOTS: Shot[] = [
  // h01 — date / place
  sh(0, (p) => (<>
    <Clip {...p} src="v11.mp4" from={0.5} cam={{ s0: 1.25, s1: 1.1 }} />
    <AbsoluteFill style={{ background: `rgba(0,0,0,${0.75 - 0.4 * lin(p.t, 0, 1.5)})` }} />
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}><Type t={p.a} at={0.35} text="August 8, 2023" size={64} /></AbsoluteFill>
    <Credit text={FEMAV} />
  </>)),
  sh(W('h01', 'Lahaina') - 0.25, (p) => (
    <MapBase {...p} keys={[{ t: 0, x: -2, y: -1, w: 120 }, { t: p.dur, x: town.x, y: town.y, w: 22 }]} streets={0}>
      {(k) => (<>
        <Pulse x={LAHAINA.x} y={LAHAINA.y} k={k} t={p.t} at={0.25} />
        <MLabel x={LAHAINA.x} y={LAHAINA.y} k={k} dy={-38} text="LAHAINA" size={46} font={DISPLAY} o={pe(p.t, 0.3, 0.4)} />
        <MLabel x={-2} y={2} k={k} text="MAUI, HAWAII" size={30} o={1 - lin(p.t, 0.6, 1.6)} />
      </>)}
    </MapBase>
  )),
  // h02 — 6:37 am, downed power line
  sh(L('h02') - 0.1, (p) => (<>
    <Still {...p} src="powerlines.jpg" cam={{ s0: 1.25, s1: 1.1, y0: 3, y1: 0 }} />
    <Stamp t={p.t} at={0.15} time="6:37 AM" sub="Downed power line" />
    <Flash t={p.t} at={0} o={0.35} />
    <Credit text={DVIDS} />
  </>)),
  sh(W('h02', 'brush') - 0.3, (p) => (<>
    <MapBase {...p} keys={[{ t: 0, x: IGN.x - 0.3, y: IGN.y, w: 5.5 }, { t: p.dur, x: IGN.x - 0.5, y: IGN.y, w: 4.2 }]} streets={1}>
      {(k) => (<>
        <circle cx={IGN.x} cy={IGN.y} r={(60 + 40 * Math.sin(p.t * 6)) / k} fill="rgba(255,122,31,0.25)" />
        <Pulse x={IGN.x} y={IGN.y} k={k} t={p.t} at={0.2} color={C.fire} r={12} />
        <MLabel x={IGN.x} y={IGN.y} k={k} dy={-44} text="BRUSH FIRE" size={34} color={C.fire} o={pe(p.t, 0.4, 0.4)} />
        <MLabel x={LAHAINA.x - 0.35} y={LAHAINA.y + 0.2} k={k} text="LAHAINA" size={30} o={0.7} />
      </>)}
    </MapBase>
    <Tag text="Approximate location" />
  </>)),
  // h03 — contained by nine
  sh(L('h03') - 0.1, (p) => (<>
    <MapBase {...p} keys={[{ t: 0, x: IGN.x - 0.5, y: IGN.y, w: 4.2 }, { t: p.dur, x: IGN.x - 0.5, y: IGN.y, w: 3.8 }]} streets={1}>
      {(k) => (<>
        <circle cx={IGN.x} cy={IGN.y} r={(70 * (1 - pe(p.t, 0.6, 1.2))) / k} fill="rgba(255,122,31,0.3)" />
        <circle cx={IGN.x} cy={IGN.y} r={60 / k} fill="none" stroke={C.ink} strokeWidth={3 / k} strokeDasharray={`${(2 * Math.PI * 60 * pe(p.t, 0.5, 0.9)) / k} 999`} />
      </>)}
    </MapBase>
    <Stamp t={p.t} at={0.1} time="9:00 AM" />
    <Slam t={p.t} at={W('h03', 'contained') - p.a + p.t - 0.05} text="CONTAINED" size={180} y={-60} />
  </>)),
  // h04 — 3:30 pm, it comes back
  sh(L('h04') - 0.1, (p) => (<>
    <Still {...p} src="chinook2.jpg" cam={{ s0: 1.1, s1: 1.24, x0: 2, x1: -2 }} />
    <Stamp t={p.t} at={0.1} time="3:30 PM" />
    <Flash t={p.t} at={0} color={C.red} o={0.3} />
    <Credit text={NG + ' · water drop on Maui, Aug. 9, 2023'} />
  </>)),
  sh(W('h04', 'comes') - 0.2, (p) => (<>
    <MapBase {...p} keys={[{ t: 0, x: IGN.x - 0.6, y: IGN.y, w: 4.6 }, { t: p.dur, x: IGN.x - 0.8, y: IGN.y, w: 3.6 }]} streets={1}>
      {(k) => {
        const r = (40 + 260 * pe(p.t, 0, 1.6)) / k;
        return (<>
          <defs><radialGradient id="fg"><stop offset="0%" stopColor="#FFB347" stopOpacity={0.9} /><stop offset="55%" stopColor="#FF5A1A" stopOpacity={0.55} /><stop offset="100%" stopColor="#E5352B" stopOpacity={0} /></radialGradient></defs>
          <circle cx={IGN.x} cy={IGN.y} r={r} fill="url(#fg)" />
        </>);
      }}
    </MapBase>
    <Embers t={p.a} o={0.8} />
    <Slam t={p.t} at={0.15} text="IT COMES BACK" size={170} color={C.ember} glow />
  </>)),
  // h05 — wind
  sh(L('h05') - 0.1, (p) => (<>
    <MapBase {...p} keys={[{ t: 0, x: -6, y: -1, w: 70 }, { t: p.dur, x: -10, y: -2, w: 55 }]} streets={0}>
      {(k, c) => (<><Wind t={p.a} k={k} c={c} /><Pulse x={LAHAINA.x} y={LAHAINA.y} k={k} t={p.t} at={0.2} color={C.fire} /></>)}
    </MapBase>
    <Count t={p.t} at={W('h05', 'eighty') - p.a + p.t - 0.25} to={80} d={0.9} suffix="+" label="mph wind gusts" size={300} />
    <Tag text="Wind: illustrative" />
  </>)),
  // h06 — crosses the highway into town (4:46)
  sh(L('h06') - 0.1, (p) => {
    const front = IGN.x + 0.4 - 2.6 * pe(p.t, 0.4, p.dur - 0.2, (x) => x);
    return (<>
      <MapBase {...p} keys={[{ t: 0, x: LAHAINA.x + 0.3, y: LAHAINA.y, w: 4.6 }, { t: p.dur, x: LAHAINA.x - 0.1, y: LAHAINA.y, w: 3.9 }]} streets={1}>
        {(k, c) => (<>
          <defs>
            <linearGradient id="ff" x1="0" x2="1"><stop offset="0%" stopColor="#FFB347" stopOpacity={0} /><stop offset="3%" stopColor="#FFD27A" stopOpacity={1} /><stop offset="9%" stopColor="#FF6A1A" stopOpacity={0.85} /><stop offset="35%" stopColor="#C8380F" stopOpacity={0.6} /><stop offset="100%" stopColor="#4A1208" stopOpacity={0.5} /></linearGradient>
            <filter id="rag" filterUnits="userSpaceOnUse" x={c.x - c.w} y={c.y - c.w} width={c.w * 2} height={c.w * 2}><feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed={Math.floor(p.t * 8)} /><feDisplacementMap in="SourceGraphic" scale={0.35} /><feGaussianBlur stdDeviation="3" /></filter>
          </defs>
          <g filter="url(#rag)" style={{ mixBlendMode: 'screen' } as any}><rect x={front} y={c.y - c.w} width={c.w * 1.6} height={c.w * 2} fill="url(#ff)" /></g>
          {(M.major as any[]).filter((m) => m.name === 'Honoapiilani Highway').map((m, i) => <path key={i} d={m.d} fill="none" stroke={C.red} strokeWidth={6 / k} opacity={pe(p.t, 0.2, 0.4)} />)}
          <MLabel x={LAHAINA.x + 0.55} y={LAHAINA.y + 0.9} k={k} text="HONOAPIʻILANI HWY" size={26} color={C.red} o={pe(p.t, 0.3, 0.4)} />
        </>)}
      </MapBase>
      <Embers t={p.a} n={40} o={0.9} />
      <Stamp t={p.t} at={0.1} time="4:46 PM" sub="Fire crosses the highway" />
      <Tag text="Fire spread: illustrative" />
    </>);
  }),
  sh(W('h06', 'enters') - 0.25, (p) => (<><Clip {...p} src="v02.mp4" from={0.5} cam={{ s0: 1.12, s1: 1.06 }} /><Embers t={p.a} n={30} o={0.6} /><Credit text={FEMAV + ' · Lahaina, Aug. 2023'} /></>), 'zoom'),
  // h07 — 80 sirens
  sh(L('h07') - 0.1, (p) => (<>
    <MapBase {...p} keys={[{ t: 0, x: -4, y: -1, w: 78 }, { t: p.dur, x: -4, y: -1, w: 70 }]} streets={0}>
      {(k) => SIRENS.map(([x, y], i) => {
        const at = 0.25 + i * 0.028; if (p.t < at) return null; const q = pe(p.t, at, 0.25);
        return <g key={i}><circle cx={x} cy={y} r={(5 + 18 * (1 - q)) / k} fill="none" stroke={C.ember} strokeWidth={2 / k} opacity={1 - q} /><circle cx={x} cy={y} r={6 / k} fill={C.ember} /></g>;
      })}
    </MapBase>
    <Count t={p.t} at={0.25} to={80} d={2.2} suffix="+" label="outdoor warning sirens" size={250} y={-20} />
    <Tag text="Siren positions: illustrative" />
  </>)),
  sh(W('h07', 'exist') - 0.2, (p) => (<>
    <AbsoluteFill style={{ background: C.bg }} />
    <SirenIcon t={p.t} on />
    <Slam t={p.t} at={W('h07', 'exactly') - p.a + p.t - 0.1} text="BUILT FOR THIS" size={130} y={330} />
  </>)),
  // h08 — not one sounded
  sh(L('h08') - 0.05, (p) => (<>
    <MapBase {...p} keys={[{ t: 0, x: -4, y: -1, w: 70 }, { t: p.dur, x: -4, y: -1, w: 66 }]} streets={0}>
      {(k) => SIRENS.map(([x, y], i) => {
        const off = 0.2 + (i % 20) * 0.04 + Math.floor(i / 20) * 0.05;
        const on = p.t < off || (p.t < off + 0.12 && Math.floor(p.t * 30) % 2 === 0);
        return <circle key={i} cx={x} cy={y} r={6 / k} fill={on ? C.ember : 'rgba(243,238,230,0.18)'} />;
      })}
    </MapBase>
    <AbsoluteFill style={{ background: `rgba(0,0,0,${0.55 * pe(p.t, 1.1, 0.6)})` }} />
    <Slam t={p.t} at={W('h08', 'not') - p.a + p.t} text="0" size={520} color={C.red} glow />
    <Slam t={p.t} at={W('h08', 'sounded') - p.a + p.t} text="SOUNDED" size={110} y={300} />
  </>)),
  // h09 — the ocean
  sh(L('h09') - 0.1, (p) => (<><Clip {...p} src="v03.mp4" from={0.3} cam={{ s0: 1.08, s1: 1.18, x0: 2, x1: -2 }} /><Stamp t={p.t} at={0.15} time="5:45 PM" sub="The fire reaches the ocean" /><Credit text={FEMAV} /></>)),
  sh(W('h09', 'People') - 0.2, (p) => (<><Burst {...p} srcs={['cars_ocean.jpg', 'waterfront_cars.jpg', 'beach_palms.jpg', 'charred_cars.jpg']} step={0.62} /><Credit text={DVIDS + ' · Aug. 17–18, 2023'} /></>)),
  sh(W('h09', 'Coast') - 0.2, (p) => (<>
    <Still {...p} src="cg_aerial.jpg" cam={{ s0: 1.1, s1: 1.25 }} />
    <AbsoluteFill style={{ background: 'rgba(0,0,0,0.35)' }} />
    <Count t={p.t} at={W('h09', 'seventeen') - p.a + p.t - 0.2} to={17} d={0.7} label="pulled from the sea" size={300} />
    <Credit text={USCG} />
  </>)),
  // h10 — the toll
  sh(L('h10') - 0.1, (p) => (<><Clip {...p} src="v06.mp4" from={0.2} cam={{ s0: 1.06, s1: 1.16 }} /><AbsoluteFill style={{ background: 'rgba(0,0,0,0.3)' }} /><Count t={p.t} at={W('h10', 'two') - p.a + p.t - 0.2} to={2207} d={1.2} label="buildings destroyed" size={250} /><Credit text={FEMAV} /></>)),
  sh(W('h10', 'One') - 0.2, (p) => (<><Still {...p} src="overlook.jpg" cam={{ s0: 1.2, s1: 1.08 }} /><AbsoluteFill style={{ background: 'rgba(0,0,0,0.45)' }} /><Count t={p.t} at={0.3} to={102} d={1.0} label="people dead" size={340} color={C.red} /><Credit text={DVIDS} /></>), 'fade'),
  // h11 — deadliest in a century
  sh(L('h11') - 0.1, (p) => (<><Clip {...p} src="v10.mp4" from={0.3} cam={{ s0: 1.15, s1: 1.06 }} /><AbsoluteFill style={{ background: 'rgba(0,0,0,0.4)' }} /><Slam t={p.t} at={W('h11', 'deadliest') - p.a + p.t - 0.1} text="DEADLIEST" size={210} y={-70} color={C.ink} /><Slam t={p.t} at={W('h11', 'wildfire') - p.a + p.t - 0.1} text="U.S. WILDFIRE SINCE 1918" size={92} y={90} color={C.ember} /><Credit text={FEMAV} /></>)),
  // h12 — the questions begin
  sh(L('h12') - 0.1, (p) => (<><Still {...p} src="atf.jpg" cam={{ s0: 1.1, s1: 1.22, x0: -2, x1: 2 }} /><Credit text={DVIDS + ' · ATF fire investigator, Aug. 18, 2023'} /></>)),
  // h13 — three questions
  sh(L('h13') - 0.05, (p) => (<><AbsoluteFill style={{ background: C.bg }} /><SirenIcon t={p.t} on={false} /><Slam t={p.t} at={W('h13', 'silent') - p.a + p.t - 0.25} text="SILENT?" size={170} y={330} color={C.red} /></>)),
  sh(W('h13', 'Why', 1) - 0.15, (p) => (<><Clip {...p} src="v13.mp4" from={0.4} cam={{ s0: 1.1, s1: 1.2 }} /><AbsoluteFill style={{ background: 'rgba(0,0,0,0.35)' }} /><Slam t={p.t} at={W('h13', 'hydrants') - p.a + p.t - 0.1} text="NO WATER?" size={180} color={C.red} /><Credit text={FEMAV} /></>)),
  sh(W('h13', 'And') - 0.15, (p) => (<><Still {...p} src="charred_palm.jpg" cam={{ s0: 1.08, s1: 1.2 }} /><Stamp t={p.t} at={W('h13', 'contained') - p.a + p.t - 0.3} time="9:00 AM" sub="Declared contained" /><Credit text={DVIDS} /></>)),
  sh(W('h13', 'come') - 0.15, (p) => (<><Burst {...p} srcs={['lone_palm.jpg', 'stove.jpg', 'old_fort.jpg', 'usar_overlook.jpg']} step={0.5} /><Slam t={p.t} at={W('h13', 'destroy') - p.a + p.t - 0.05} text="AN ENTIRE TOWN" size={150} y={360} glow /><Credit text={DVIDS + ' · FEMA'} /></>)),
  // h14 — title
  sh(L('h14') - 0.1, (p) => (<><Clip {...p} src="v11.mp4" from={2} cam={{ s0: 1.18, s1: 1.06 }} /><AbsoluteFill style={{ background: 'rgba(0,0,0,0.55)' }} /><Embers t={p.a} n={60} /><Title t={p.t} at={W('h14', 'Lahaina') - p.a + p.t - 0.1} /></>), 'fade'),
];

const SirenIcon: React.FC<{ t: number; on: boolean }> = ({ t, on }) => {
  const k = pe(t, 0, 0.5);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: k }}>
      <svg width="900" height="700" viewBox="-450 -350 900 700">
        <rect x={-8} y={-40} width={16} height={330} fill="#3A3F44" />
        <g transform="translate(0,-90)">
          <rect x={-120} y={-60} width={240} height={120} rx={14} fill="#2A2F33" stroke={on ? C.ember : '#555'} strokeWidth={4} />
          {[-80, -27, 27, 80].map((x) => <circle key={x} cx={x} cy={0} r={22} fill={on ? '#1A1D20' : '#16181A'} stroke={on ? C.ember : '#444'} strokeWidth={3} />)}
          {on && [0, 1, 2].map((i) => { const ph = ((t * 0.9 + i / 3) % 1); return (<g key={i} opacity={1 - ph}><path d={`M${150 + ph * 160},${-70 - ph * 40} Q${190 + ph * 200},0 ${150 + ph * 160},${70 + ph * 40}`} fill="none" stroke={C.ember} strokeWidth={5} /><path d={`M${-150 - ph * 160},${-70 - ph * 40} Q${-190 - ph * 200},0 ${-150 - ph * 160},${70 + ph * 40}`} fill="none" stroke={C.ember} strokeWidth={5} /></g>); })}
        </g>
      </svg>
      <div style={{ position: 'absolute', top: 70, fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: 6, color: C.dim }}>OUTDOOR WARNING SIREN · ILLUSTRATION</div>
    </AbsoluteFill>
  );
};
const Title: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  if (t < at) return null;
  const k = pe(t, at, 1.2);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: DISPLAY, fontSize: 280, letterSpacing: 30 - 18 * k, color: C.ink, lineHeight: 0.85, opacity: k, textShadow: '0 0 60px rgba(255,122,31,0.55), 0 0 140px rgba(229,53,43,0.35)', transform: `scale(${1.08 - 0.08 * k})` }}>LAHAINA</div>
      <div style={{ width: 520 * pe(t, at + 0.4, 0.8), height: 5, background: C.red, margin: '26px 0 22px' }} />
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 40, letterSpacing: 14, color: C.ember, opacity: pe(t, at + 0.7, 0.6) }}>MAUI · AUGUST 8, 2023</div>
    </AbsoluteFill>
  );
};

const Shot: React.FC<{ s: Shot; dur: number }> = ({ s, dur }) => {
  const f = useCurrentFrame(); const t = f / FPS;
  const fadeIn = s.x === 'fade' ? pe(t, 0, 0.45) : 1;
  const zoom = s.x === 'zoom' ? 1.12 - 0.12 * pe(t, 0, 0.5) : 1;
  return <AbsoluteFill style={{ opacity: fadeIn, transform: `scale(${zoom})` }}>{s.el({ t, dur, a: s.at + t })}</AbsoluteFill>;
};

export const Demo: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    {SHOTS.map((s, i) => {
      const end = i + 1 < SHOTS.length ? SHOTS[i + 1].at : DEMO_DUR;
      const from = Math.round(s.at * FPS), to = Math.round(end * FPS);
      return <Sequence key={i} from={from} durationInFrames={Math.max(1, to - from)}><Shot s={s} dur={end - s.at} /></Sequence>;
    })}
    <Grain o={0.1} />
    <Audio src={staticFile('audio/demo_mix.wav')} />
  </AbsoluteFill>
);
export const SHOT_TIMES = SHOTS.map((s) => s.at);
