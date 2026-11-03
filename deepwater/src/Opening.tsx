// Deepwater Horizon — opening test. Each shot's job: see research/edit_plan_opening.md.
import React from 'react';
import { AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame } from 'remotion';
import T from './data/open.json';
import M from './data/map.json';
import { FPS, BG, INK, ACC, SANS, DISPLAY, pe, SP, Film, Photo, Label, Lower, Doc, Pull } from './kit';
import { Well, WC } from './well';
import { TestCard } from './testcard';
const LN = T.lines as Record<string, { s: number; e: number; words: { w: string; s: number }[] }>;
const W = (id: string, w: string, nth = 0) => { const h = LN[id].words.filter((x) => x.w.toLowerCase().replace(/[^a-z0-9:'-]/g, '').startsWith(w.toLowerCase())); if (!h[nth]) throw new Error(`cue ${id}/${w}`); return h[nth].s; };
const S = (id: string) => LN[id].s;
const B = T.bites as Record<string, { at: number; src: number; dur: number }[]>;
const E = T.events as Record<string, { at: number; dur: number }>;
type Shot = { at: number; el: (p: SP) => React.ReactNode; fade?: number };
const shots: Shot[] = [];
const sh = (at: number, el: Shot['el'], fade = 0) => shots.push({ at, el, fade });
const USCG = 'Video: U.S. Coast Guard (DVIDS)';
const HEAR = 'Joint investigation hearing (U.S. Coast Guard / BOEMRE) · July 23, 2010';
const ALL = ['rig', 'riser', 'bop', 'well', 'cement', 'mud', 'labels'] as const;
// ---- Gulf locator
const GulfMap: React.FC<SP> = ({ t, dur }) => {
  const s0 = 1.0, s1 = 1.18; const k = Math.min(1, t / Math.max(dur, 0.1)); const sc = s0 + (s1 - s0) * k;
  const iw = 1920, ih = 1920 * M.h / M.w; const fx = M.rig[0], fy = M.rig[1] - 0.15;
  const P = (q: number[]) => [960 + (q[0] - fx) * iw * sc, 540 + (q[1] - fy) * ih * sc];
  const [rx, ry] = P(M.rig), [nx, ny] = P(M.nola), [vx, vy] = P(M.venice), [lx, ly] = P(M.la);
  const txt = (x: number, y: number, s: string, o: number, c = INK, size = 32, a: 'start' | 'middle' | 'end' = 'start') => <text x={x} y={y} fill={c} opacity={o} fontFamily={SANS} fontWeight={700} fontSize={size} letterSpacing={2} textAnchor={a} style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.8)', strokeWidth: 6 }}>{s}</text>;
  return (
    <AbsoluteFill style={{ background: '#0E2A3C', overflow: 'hidden' }}>
      <Img src={staticFile('img/map_gulf.jpg')} style={{ position: 'absolute', width: iw * sc, height: ih * sc, left: 960 - fx * iw * sc, top: 540 - fy * ih * sc, maxWidth: 'none' }} />
      <svg width={1920} height={1080} style={{ position: 'absolute' }}>
        {txt(lx, ly, 'LOUISIANA', 0.8, INK, 40, 'middle')}
        <circle cx={nx} cy={ny} r={8} fill={INK} opacity={pe(t, 0.3)} />{txt(nx + 18, ny + 10, 'New Orleans', pe(t, 0.3), INK, 28)}
        <line x1={vx} y1={vy} x2={vx + (rx - vx) * pe(t, 1.0, 1.2)} y2={vy + (ry - vy) * pe(t, 1.0, 1.2)} stroke={INK} strokeWidth={3} strokeDasharray="10 8" opacity={0.85} />
        {txt((vx + rx) / 2 + 20, (vy + ry) / 2 - 10, 'ABOUT 50 MILES', pe(t, 1.8), INK, 28)}
        <circle cx={rx} cy={ry} r={14} fill={ACC} stroke="#000" strokeWidth={3} opacity={pe(t, 0.6)} /><circle cx={rx} cy={ry} r={24} fill="none" stroke={ACC} strokeWidth={3} opacity={pe(t, 0.6) * 0.6} />
        {txt(rx + 34, ry + 4, 'DEEPWATER HORIZON', pe(t, 0.8), ACC, 36)}
        {txt(rx + 34, ry + 44, 'Macondo well', pe(t, 1.4), INK, 28)}
        {txt(960, 1000, 'GULF OF MEXICO', 0.7, INK, 36, 'middle')}
      </svg>
      <div style={{ position: 'absolute', left: 60, bottom: 30, fontFamily: SANS, fontSize: 20, color: 'rgba(242,239,233,0.7)' }}>Map: Natural Earth · position approximate</div>
    </AbsoluteFill>
  );
};
// ===================== shots (v2)
const C0 = B.w_call[0].at;
sh(0, () => <AbsoluteFill style={{ background: BG }} />);
sh(C0 + 1.0, (p) => (<><Film {...p} src="night_rig.mp4" /><Label t={p.t} at={0.3} text="Voice: Mike Williams, testifying on July 23, 2010, about a phone call that night" right top /><Label t={p.t} at={1.2} text="The rig, filmed by the Coast Guard after 11 p.m. on April 20, 2010" credit={USCG} /></>));
sh(B.w_call[1].at + 4.0, (p) => (<><Film {...p} src="night_wide.mp4" /><Label t={p.t} at={0.3} text="Voice: Mike Williams · testimony, July 23, 2010" right top /><Label t={p.t} at={0.3} text="Coast Guard footage, night of April 20–21, 2010" credit={USCG} /></>));
sh(S('c01') - 0.1, (p) => (<><Film {...p} src="jit_sworn.mp4" /><Label t={p.t} at={0.3} text="Joint investigation hearing · July 23, 2010" credit={USCG} top /><Lower t={p.t} at={0.5} name="Mike Williams" role="Chief electronics technician, Deepwater Horizon · being sworn in" /></>));
sh(S('c02') - 0.2, (p) => <GulfMap {...p} />, 0.3);
const T0 = S('c03') - 0.2;
sh(T0, (p) => <TestCard t={p.t} killAt={W('c04', 'One') - T0} pipeAt={W('c04', 'drill') - T0} declAt={W('c05', 'declared') - T0} />, 0.3);
sh(S('c06') - 0.2, (p) => (<><Doc {...p} src="comm-125.jpg" aspect={0.7} box={[0.1071, 0.1228, 0.8531, 0.1926]} zoomAt={0.4} zoom={2.2} /><Label t={p.t} at={0.3} text="National Commission on the BP Deepwater Horizon Oil Spill, report to the President (2011), p. 109 · the investigators’ conclusion" top /><Pull t={p.t} at={1.4} text="“…at 8 p.m., BP Well Site Leaders, in consultation with the crew, made a key error…”" /></>));
sh(S('c07') - 0.2, (p) => (<><Film {...p} src="jit_wide1.mp4" /><Label t={p.t} at={0.3} text="Voice: Mike Williams · the hearing room, July 23, 2010" credit={USCG} /></>));
const F0 = S('c08') - 0.2;
sh(F0, (p) => <Well t={p.t + 6} show={['rig', 'riser', 'bop', 'well', 'mud', 'seawater', 'flow', 'labels']} at={{ seawater: 0, flow: 6 + W('c08', 'mud') - F0 }} caption={['ABOUT 9:40 P.M.', 'Mud and gas surge up the riser and onto the rig floor. (The crew had replaced the mud in the riser with seawater after 8 p.m.)']} capAt={6 + W('c08', 'nine', 1) - F0} />, 0.3);
sh(W('c08', 'exploded') - 0.6, (p) => (<><Film {...p} src="night_wide.mp4" from={10} /><Label t={p.t} at={0.4} text="The rig after the explosions, filmed by the Coast Guard after 11 p.m." credit={USCG} /></>), 0.3);
sh(E.silence.at - 0.3, (p) => (<><Film {...p} src="night_fireboats.mp4" /><Label t={p.t} at={1.0} text="Fireboats spray the burning rig · night of April 20–21, 2010" credit={USCG} /></>), 0.5);
sh(S('c10') - 0.3, (p) => (<><Film {...p} src="day_fire.mp4" /><Label t={p.t} at={0.4} text="The next morning, April 21, 2010" credit={USCG} /></>), 0.5);
sh(E.title.at, (p) => (<AbsoluteFill style={{ background: BG, alignItems: 'center', justifyContent: 'center' }}>
  <div style={{ fontFamily: DISPLAY, fontSize: 124, color: INK, letterSpacing: 4, opacity: pe(p.t, 0.2, 0.7) }}>DEEPWATER HORIZON</div>
  <div style={{ fontFamily: DISPLAY, fontSize: 72, color: ACC, letterSpacing: 3, marginTop: 10, opacity: pe(p.t, 0.7, 0.7) }}>THE TEST THEY CALLED A SUCCESS</div>
</AbsoluteFill>), 0.4);
shots.sort((a, b) => a.at - b.at);
export const OPEN_DUR = T.duration as number;
const ShotV: React.FC<{ s: Shot; dur: number }> = ({ s, dur }) => {
  const t = useCurrentFrame() / FPS;
  return <AbsoluteFill style={{ opacity: s.fade ? pe(t, 0, s.fade) : 1 }}>{s.el({ t, dur })}</AbsoluteFill>;
};
export const Opening: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
    {shots.map((s, i) => {
      const end = i + 1 < shots.length ? shots[i + 1].at + (shots[i + 1].fade ?? 0) : OPEN_DUR;
      const from = Math.round(s.at * FPS), to = Math.round(end * FPS);
      return <Sequence key={i} from={from} durationInFrames={Math.max(1, to - from)}><ShotV s={s} dur={end - s.at} /></Sequence>;
    })}
    <Audio src={staticFile('audio/open_mix.wav')} />
  </AbsoluteFill>
);
