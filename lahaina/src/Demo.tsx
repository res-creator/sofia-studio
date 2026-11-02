// Demo: the cold-open hook (~72 s). Every cut is tied to a word of the narration.
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate } from 'remotion';
import WJ from '../vo/hook_timed.words.json';
import META from '../vo/hook_timed.meta.json';
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
export const DEMO_DUR = (META as any).duration;

const DVIDS = 'Photo: U.S. Customs and Border Protection / Glenn Fawcett · Public domain';
const FEMAV = 'Video: FEMA · Public domain';
const NG = 'Photo: The National Guard · CC BY 2.0';
const USCG = 'Photo: U.S. Coast Guard · Public domain';
const NASA = 'NASA Earth Observatory · Landsat 8 (USGS) · Aug. 8, 2023, 10:25 p.m. · Public domain';

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
  // h01 — real satellite image of the fire, the night of Aug 8 (NASA Landsat 8, 10:25 PM)
  sh(0, (p) => (<>
    <Still {...p} src="landsat_aug8.jpg" grade="contrast(1.12) saturate(1.1)" cam={{ s0: 1.08, s1: 1.22, x0: 0, x1: 6 }} />
    <AbsoluteFill style={{ background: `rgba(0,0,0,${0.7 - 0.55 * lin(p.t, 0, 1.0)})` }} />
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}><Type t={p.t} at={0.3} text="August 8, 2023" size={66} /></AbsoluteFill>
    <Credit text={NASA} />
  </>)),
  sh(W('h01', 'Lahaina') - 0.25, (p) => (<>
    <Still {...p} src="landsat_lahaina.jpg" grade="contrast(1.12) saturate(1.15)" cam={{ s0: 1.08, s1: 1.3, x0: 4, x1: 8 }} />
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}><Slam t={p.t} at={0.2} text="LAHAINA, MAUI" size={150} y={300} /></AbsoluteFill>
    <Credit text={NASA} />
  </>)),
  // h02 — 6:37 am, downed power line (map, not aftermath photos)
  sh(L('h02') - 0.1, (p) => (<>
    <MapBase {...p} keys={[{ t: 0, x: LAHAINA.x + 0.4, y: LAHAINA.y, w: 9 }, { t: p.dur, x: IGN.x - 0.3, y: IGN.y, w: 5.5 }]} streets={1}>
      {(k) => (<>
        <MLabel x={LAHAINA.x - 0.35} y={LAHAINA.y + 0.2} k={k} text="LAHAINA" size={40} o={0.85} font={DISPLAY} />
        <PowerSpark x={IGN.x} y={IGN.y} k={k} t={p.t} at={0.6} />
      </>)}
    </MapBase>
    <Stamp t={p.t} at={0.15} time="6:37 AM" sub="A downed power line" />
    <Tag text="Approximate location" />
  </>)),
  sh(W('h02', 'brush') - 0.3, (p) => (<>
    <MapBase {...p} keys={[{ t: 0, x: IGN.x - 0.3, y: IGN.y, w: 5.0 }, { t: p.dur, x: IGN.x - 0.5, y: IGN.y, w: 4.0 }]} streets={1}>
      {(k) => (<>
        <circle cx={IGN.x} cy={IGN.y} r={(60 + 40 * Math.sin(p.t * 6)) / k} fill="rgba(255,122,31,0.3)" />
        <Pulse x={IGN.x} y={IGN.y} k={k} t={p.t} at={0.1} color={C.fire} r={12} />
        <MLabel x={IGN.x} y={IGN.y} k={k} dy={-50} text="BRUSH FIRE" size={44} color={C.fire} o={pe(p.t, 0.2, 0.4)} font={DISPLAY} />
      </>)}
    </MapBase>
    <Embers t={p.a} n={20} o={0.6} />
    <Tag text="Approximate location" />
  </>)),
  // h03 — contained by nine
  sh(L('h03') - 0.1, (p) => (<>
    <MapBase {...p} keys={[{ t: 0, x: IGN.x - 0.5, y: IGN.y, w: 4.0 }, { t: p.dur, x: IGN.x - 0.5, y: IGN.y, w: 3.4 }]} streets={1}>
      {(k) => (<>
        <circle cx={IGN.x} cy={IGN.y} r={(70 * (1 - pe(p.t, 0.4, 1.0))) / k} fill="rgba(255,122,31,0.3)" />
        <circle cx={IGN.x} cy={IGN.y} r={60 / k} fill="none" stroke={C.ink} strokeWidth={3 / k} strokeDasharray={`${(2 * Math.PI * 60 * pe(p.t, 0.3, 0.8)) / k} 999`} />
      </>)}
    </MapBase>
    <Stamp t={p.t} at={0.1} time="9:00 AM" />
    <Slam t={p.t} at={W('h03', 'contained') - p.a + p.t - 0.05} text="CONTAINED" size={190} y={-60} />
  </>)),
  // h04 — by 3:30 pm, it is back
  sh(L('h04') - 0.1, (p) => (<>
    <MapBase {...p} keys={[{ t: 0, x: IGN.x - 0.6, y: IGN.y, w: 4.4 }, { t: p.dur, x: IGN.x - 0.8, y: IGN.y, w: 3.4 }]} streets={1}>
      {(k) => {
        const r = (40 + 300 * pe(p.t, W('h04', 'back') - p.a + p.t - 0.3, 1.6)) / k;
        return (<>
          <defs><radialGradient id="fg"><stop offset="0%" stopColor="#FFC46B" stopOpacity={0.95} /><stop offset="55%" stopColor="#FF5A1A" stopOpacity={0.6} /><stop offset="100%" stopColor="#E5352B" stopOpacity={0} /></radialGradient></defs>
          <circle cx={IGN.x} cy={IGN.y} r={r} fill="url(#fg)" />
        </>);
      }}
    </MapBase>
    <Embers t={p.a} o={0.85} />
    <Stamp t={p.t} at={0.1} time="3:30 PM" />
    <Flash t={p.t} at={W('h04', 'back') - p.a + p.t - 0.15} color={C.fire} o={0.25} />
    <Slam t={p.t} at={W('h04', 'back') - p.a + p.t - 0.15} text="IT'S BACK" size={200} color={C.ember} glow y={-40} />
  </>)),
  // h05 — wind
  sh(L('h05') - 0.1, (p) => (<>
    <MapBase {...p} keys={[{ t: 0, x: -14, y: -3, w: 46 }, { t: p.dur, x: -18, y: -4, w: 30 }]} streets={0}>
      {(k, c) => (<><Wind t={p.a} k={k} c={c} /><Pulse x={LAHAINA.x} y={LAHAINA.y} k={k} t={p.t} at={0.1} color={C.fire} r={14} /><MLabel x={LAHAINA.x} y={LAHAINA.y} k={k} dy={-40} text="LAHAINA" size={40} font={DISPLAY} /></>)}
    </MapBase>
    <Count t={p.t} at={W('h05', 'eighty') - p.a + p.t - 0.3} to={80} d={0.8} suffix="+" label="mph wind gusts" size={300} />
    <Tag text="Wind: illustrative" />
  </>)),
  // h06 — crosses the highway into town (4:46)
  sh(L('h06') - 0.1, (p) => {
    const front = IGN.x + 0.4 - 2.6 * pe(p.t, 0.3, p.dur - 0.2, (x) => x);
    return (<>
      <MapBase {...p} keys={[{ t: 0, x: LAHAINA.x + 0.3, y: LAHAINA.y, w: 4.6 }, { t: p.dur, x: LAHAINA.x - 0.1, y: LAHAINA.y, w: 3.9 }]} streets={1}>
        {(k, c) => (<>
          <defs>
            <linearGradient id="ff" x1="0" x2="1"><stop offset="0%" stopColor="#FFB347" stopOpacity={0} /><stop offset="3%" stopColor="#FFD27A" stopOpacity={1} /><stop offset="9%" stopColor="#FF6A1A" stopOpacity={0.85} /><stop offset="35%" stopColor="#C8380F" stopOpacity={0.6} /><stop offset="100%" stopColor="#4A1208" stopOpacity={0.5} /></linearGradient>
            <filter id="rag" filterUnits="userSpaceOnUse" x={c.x - c.w} y={c.y - c.w} width={c.w * 2} height={c.w * 2}><feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed={Math.floor(p.t * 8)} /><feDisplacementMap in="SourceGraphic" scale={0.35} /><feGaussianBlur stdDeviation="3" /></filter>
          </defs>
          <g filter="url(#rag)" style={{ mixBlendMode: 'screen' } as any}><rect x={front} y={c.y - c.w} width={c.w * 1.6} height={c.w * 2} fill="url(#ff)" /></g>
          {(M.major as any[]).filter((m) => m.name === 'Honoapiilani Highway').map((m, i) => <path key={i} d={m.d} fill="none" stroke={C.red} strokeWidth={6 / k} opacity={pe(p.t, 0.2, 0.4)} />)}
        </>)}
      </MapBase>
      <Embers t={p.a} n={40} o={0.9} />
      <div style={{ position: 'absolute', right: 70, bottom: 110, fontFamily: SANS, fontWeight: 800, fontSize: 36, letterSpacing: 6, color: C.ink, background: 'rgba(7,9,11,0.82)', padding: '10px 18px', borderLeft: `5px solid ${C.red}`, opacity: pe(p.t, 0.3, 0.4) }}>HONOAPIʻILANI HIGHWAY</div>
      <Stamp t={p.t} at={0.1} time="4:46 PM" sub="The fire crosses the highway" />
      <Tag text="Fire spread: illustrative" />
    </>);
  }),
  sh(W('h06', 'enters') - 0.25, (p) => (<>
    <Still {...p} src="landsat_lahaina.jpg" grade="contrast(1.15) saturate(1.2)" cam={{ s0: 1.5, s1: 1.9, x0: 12, x1: 16, y0: 2, y1: 3 }} />
    <Slam t={p.t} at={0.15} text="LAHAINA IS BURNING" size={140} y={330} glow />
    <Credit text={NASA} />
  </>), 'zoom'),
  // h07 — 80 sirens, then the siren itself (we hear one in the score)
  sh(L('h07') - 0.1, (p) => (<>
    <MapBase {...p} keys={[{ t: 0, x: -4, y: -1, w: 78 }, { t: p.dur, x: -4, y: -1, w: 70 }]} streets={0}>
      {(k) => SIRENS.slice(0, 80).map(([x, y], i) => {
        const at = 0.2 + i * 0.026; if (p.t < at) return null; const q = pe(p.t, at, 0.25);
        return <g key={i}><circle cx={x} cy={y} r={(6 + 22 * (1 - q)) / k} fill="none" stroke={C.ember} strokeWidth={2 / k} opacity={1 - q} /><circle cx={x} cy={y} r={7 / k} fill={C.ember} /></g>;
      })}
    </MapBase>
    <Count t={p.t} at={0.2} to={80} d={2.1} label="outdoor warning sirens" size={260} y={-20} />
    <Tag text="Siren positions: illustrative" />
  </>)),
  sh(W('h07', 'exist') - 0.2, (p) => (<>
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 40%, #1A1410 0%, #07090B 70%)' }} />
    <SirenIcon t={p.t} on />
    <Slam t={p.t} at={W('h07', 'exactly') - p.a + p.t - 0.1} text="BUILT FOR THIS" size={150} y={360} />
  </>)),
  // h08 — not one sounded ... then dead air
  sh(L('h08') - 0.05, (p) => (<>
    <MapBase {...p} keys={[{ t: 0, x: -4, y: -1, w: 70 }, { t: p.dur, x: -4, y: -1, w: 64 }]} streets={0}>
      {(k) => SIRENS.slice(0, 80).map(([x, y], i) => {
        const off = 0.15 + (i % 20) * 0.035 + Math.floor(i / 20) * 0.05;
        const on = p.t < off || (p.t < off + 0.12 && Math.floor(p.t * 30) % 2 === 0);
        return <circle key={i} cx={x} cy={y} r={7 / k} fill={on ? C.ember : 'rgba(243,238,230,0.16)'} />;
      })}
    </MapBase>
    <AbsoluteFill style={{ background: `rgba(0,0,0,${0.55 * pe(p.t, 1.0, 0.6) + 0.4 * pe(p.t, p.dur - 1.2, 1.0)})` }} />
    <Slam t={p.t} at={W('h08', 'not') - p.a + p.t} text="0" size={540} color={C.red} glow />
    <Slam t={p.t} at={W('h08', 'sounded') - p.a + p.t} text="SOUNDED" size={120} y={310} />
  </>)),
  // h09 — the ocean
  sh(L('h09') - 0.1, (p) => (<>
    <MapBase {...p} keys={[{ t: 0, x: LAHAINA.x - 0.2, y: LAHAINA.y, w: 4.2 }, { t: p.dur, x: LAHAINA.x - 0.6, y: LAHAINA.y, w: 3.4 }]} streets={1}>
      {(k, c) => (<>
        <defs>
          <linearGradient id="ff2" x1="0" x2="1"><stop offset="0%" stopColor="#FFB347" stopOpacity={0} /><stop offset="3%" stopColor="#FFD27A" stopOpacity={1} /><stop offset="9%" stopColor="#FF6A1A" stopOpacity={0.85} /><stop offset="35%" stopColor="#C8380F" stopOpacity={0.6} /><stop offset="100%" stopColor="#4A1208" stopOpacity={0.5} /></linearGradient>
          <filter id="rag2" filterUnits="userSpaceOnUse" x={c.x - c.w} y={c.y - c.w} width={c.w * 2} height={c.w * 2}><feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed={Math.floor(p.t * 8)} /><feDisplacementMap in="SourceGraphic" scale={0.35} /><feGaussianBlur stdDeviation="3" /></filter>
        </defs>
        <g filter="url(#rag2)" style={{ mixBlendMode: 'screen' } as any}><rect x={LAHAINA.x - 0.35 - 0.3 * pe(p.t, 0, 1.4)} y={c.y - c.w} width={c.w * 1.6} height={c.w * 2} fill="url(#ff2)" /></g>
      </>)}
    </MapBase>
    <Embers t={p.a} n={44} />
    <Stamp t={p.t} at={0.1} time="5:45 PM" sub="The fire reaches the ocean" />
    <Tag text="Fire spread: illustrative" />
  </>)),
  sh(W('h09', 'People') - 0.2, (p) => (<><Still {...p} src="cg_sar.jpg" cam={{ s0: 1.1, s1: 1.24, x0: -2, x1: 2 }} /><Credit text={USCG + ' · search and rescue off Lahaina, night of Aug. 9, 2023'} /></>)),
  sh(W('h09', 'Coast') - 0.2, (p) => (<>
    <Still {...p} src="cg_aerial.jpg" cam={{ s0: 1.1, s1: 1.25 }} />
    <AbsoluteFill style={{ background: 'rgba(0,0,0,0.35)' }} />
    <Count t={p.t} at={W('h09', 'seventeen') - p.a + p.t - 0.2} to={17} d={0.6} label="pulled from the sea" size={320} />
    <Credit text={USCG} />
  </>)),
  // h10 — the toll (aftermath imagery only from here on)
  sh(L('h10') - 0.1, (p) => (<>
    <Burst {...p} srcs={['cars_ocean.jpg', 'waterfront_cars.jpg', 'beach_palms.jpg', 'charred_cars.jpg']} step={0.55} />
    <AbsoluteFill style={{ zIndex: 20 }}><Count t={p.t} at={W('h10', 'two') - p.a + p.t - 0.2} to={2207} d={1.0} label="buildings destroyed" size={240} y={330} /></AbsoluteFill>
    <Credit text={DVIDS + ' · Aug. 17–18, 2023'} />
  </>)),
  sh(W('h10', 'One') - 0.2, (p) => (<>
    <Still {...p} src="overlook.jpg" cam={{ s0: 1.2, s1: 1.08 }} />
    <AbsoluteFill style={{ background: 'rgba(0,0,0,0.5)' }} />
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: pe(p.t, 0.25, 0.9) }}>
      <div style={{ fontFamily: DISPLAY, fontSize: 360, color: C.red, lineHeight: 0.85, textShadow: '0 6px 40px rgba(0,0,0,0.7)' }}>102</div>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 40, letterSpacing: 10, color: C.ink, marginTop: 18 }}>PEOPLE DEAD</div>
    </AbsoluteFill>
    <Credit text={DVIDS} />
  </>), 'fade'),
  // h11 — deadliest in a century
  sh(L('h11') - 0.1, (p) => (<><Clip {...p} src="v10.mp4" from={0.3} cam={{ s0: 1.15, s1: 1.06 }} /><AbsoluteFill style={{ background: 'rgba(0,0,0,0.42)' }} /><Slam t={p.t} at={W('h11', 'deadliest') - p.a + p.t - 0.1} text="DEADLIEST U.S. WILDFIRE" size={150} y={-70} /><Slam t={p.t} at={W('h11', 'more') - p.a + p.t - 0.1} text="IN MORE THAN 100 YEARS" size={104} y={80} color={C.ember} /><Credit text={FEMAV} /></>)),
  // h12 — the questions begin
  sh(L('h12') - 0.1, (p) => (<><Still {...p} src="atf.jpg" cam={{ s0: 1.1, s1: 1.22, x0: -2, x1: 2 }} /><Credit text={DVIDS + ' · ATF fire investigator, Aug. 18, 2023'} /></>)),
  // h13 — three questions
  sh(L('h13') - 0.05, (p) => (<><AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 40%, #14171A 0%, #07090B 70%)' }} /><SirenIcon t={p.t} on={false} /><Slam t={p.t} at={W('h13', 'silent') - p.a + p.t - 0.3} text="SILENT?" size={190} y={360} color={C.red} /></>)),
  sh(W('h13', 'Why', 1) - 0.15, (p) => (<><Clip {...p} src="v13.mp4" from={0.4} cam={{ s0: 1.1, s1: 1.2 }} /><AbsoluteFill style={{ background: 'rgba(0,0,0,0.38)' }} /><Slam t={p.t} at={W('h13', 'hydrants') - p.a + p.t - 0.15} text="HYDRANTS FAILED?" size={170} color={C.red} /><Credit text={FEMAV} /></>)),
  sh(W('h13', 'And') - 0.15, (p) => (<><Still {...p} src="charred_palm.jpg" cam={{ s0: 1.08, s1: 1.2 }} /><Stamp t={p.t} at={W('h13', 'contained') - p.a + p.t - 0.3} time="9:00 AM" sub="Declared contained" /><Credit text={DVIDS} /></>)),
  sh(W('h13', 'come') - 0.15, (p) => (<><Burst {...p} srcs={['lone_palm.jpg', 'stove.jpg', 'old_fort.jpg', 'usar_overlook.jpg']} step={0.45} /><AbsoluteFill style={{ zIndex: 20 }}><Slam t={p.t} at={W('h13', 'destroy') - p.a + p.t - 0.05} text="AN ENTIRE TOWN" size={170} y={380} glow /></AbsoluteFill><Credit text={DVIDS + ' · FEMA'} /></>)),
  // h14 — title over the real satellite image of the fire
  sh(L('h14') - 0.1, (p) => (<><Still {...p} src="landsat_lahaina.jpg" grade="contrast(1.1) saturate(1.05) brightness(0.7)" cam={{ s0: 1.25, s1: 1.1, x0: 8, x1: 4 }} /><AbsoluteFill style={{ background: 'rgba(0,0,0,0.45)' }} /><Embers t={p.a} n={60} /><Title t={p.t} at={W('h14', 'Lahaina') - p.a + p.t - 0.1} /><Credit text={NASA} /></>)),
];

const PowerSpark: React.FC<{ x: number; y: number; k: number; t: number; at: number }> = ({ x, y, k, t, at }) => {
  if (t < at) return null;
  const q = pe(t, at, 0.4); const fl = 0.6 + 0.4 * Math.abs(Math.sin(t * 23));
  return (
    <g>
      <line x1={x - 90 / k} y1={y - 60 / k} x2={x - 90 / k + (90 / k) * q} y2={y - 60 / k + (60 / k) * q} stroke={C.ink} strokeWidth={3 / k} />
      <circle cx={x} cy={y} r={(18 + 10 * fl) / k} fill={C.ember} opacity={0.5 * fl * q} />
      <circle cx={x} cy={y} r={6 / k} fill="#FFF3D6" opacity={q} />
    </g>
  );
};
const SirenIcon: React.FC<{ t: number; on: boolean }> = ({ t, on }) => {
  const k = pe(t, 0, 0.5);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: k }}>
      <svg width="1260" height="980" viewBox="-450 -350 900 700">
        <rect x={-8} y={-40} width={16} height={330} fill="#3A3F44" />
        <g transform="translate(0,-90)">
          <rect x={-120} y={-60} width={240} height={120} rx={14} fill="#2A2F33" stroke={on ? C.ember : '#555'} strokeWidth={4} />
          {[-80, -27, 27, 80].map((x) => <circle key={x} cx={x} cy={0} r={22} fill={on ? '#1A1D20' : '#16181A'} stroke={on ? C.ember : '#444'} strokeWidth={3} />)}
          {on && [0, 1, 2].map((i) => { const ph = ((t * 0.9 + i / 3) % 1); return (<g key={i} opacity={1 - ph}><path d={`M${150 + ph * 160},${-70 - ph * 40} Q${190 + ph * 200},0 ${150 + ph * 160},${70 + ph * 40}`} fill="none" stroke={C.ember} strokeWidth={5} /><path d={`M${-150 - ph * 160},${-70 - ph * 40} Q${-190 - ph * 200},0 ${-150 - ph * 160},${70 + ph * 40}`} fill="none" stroke={C.ember} strokeWidth={5} /></g>); })}
        </g>
      </svg>
      <div style={{ position: 'absolute', top: 70, fontFamily: SANS, fontWeight: 700, fontSize: 28, letterSpacing: 6, color: C.dim }}>OUTDOOR WARNING SIREN · ILLUSTRATION</div>
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
