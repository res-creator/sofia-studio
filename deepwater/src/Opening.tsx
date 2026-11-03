// Deepwater Horizon — opening test. Each shot's job: see research/edit_plan_opening.md.
import React from 'react';
import { AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame } from 'remotion';
import T from './data/open.json';
import M from './data/map.json';
import { FPS, BG, INK, ACC, SANS, DISPLAY, pe, SP, Film, Photo, Label, Lower, Doc } from './kit';
import { Well, WC } from './well';
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
        {txt(rx + 34, ry + 44, 'above the Macondo well', pe(t, W('n02', 'Macondo') - S('n02') + 0.4), INK, 28)}
        {txt(960, 1000, 'GULF OF MEXICO', 0.7, INK, 36, 'middle')}
      </svg>
      <div style={{ position: 'absolute', left: 60, bottom: 30, fontFamily: SANS, fontSize: 20, color: 'rgba(242,239,233,0.7)' }}>Map: Natural Earth · position approximate</div>
    </AbsoluteFill>
  );
};
// ===================== shots
sh(0, (p) => (<><Film {...p} src="night_rig.mp4" /><Label t={p.t} at={0.8} text="Gulf of Mexico · night of April 20–21, 2010" credit={USCG} /></>));
sh(S('n02') - 0.2, (p) => <GulfMap {...p} />, 0.4);
sh(S('n03') - 0.1, (p) => (<><Film {...p} src="jit_sworn.mp4" /><Label t={p.t} at={0.4} text={HEAR} credit={USCG} top />{p.t > W('n03', 'One') - S('n03') && <Lower t={p.t} at={W('n03', 'One') - S('n03') + 0.4} name="Mike Williams" role="Chief electronics technician, Deepwater Horizon · standing, being sworn in" />}</>));
sh(B.w_tests[0].at - 0.3, (p) => (<><Film {...p} src="jit_wide1.mp4" /><Label t={p.t} at={0.2} text="Voice: Mike Williams · the hearing room, July 23, 2010" credit={USCG} /></>));
// schematic: one idea per beat
const W0 = S('n04') - 0.3;
sh(W0, (p) => <Well t={p.t} show={['rig', 'riser', 'bop', 'well', 'mud', 'cement', 'labels']} at={{ rig: 0.1, riser: 0.4, bop: 0.8, well: 1.1, mud: 1.6, labels: 0.4, cement: W('n04', 'cement') - W0 }} caption={['THE WELL', 'The rig floats on the surface. A pipe called the riser runs down to the seafloor, to the blowout preventer and the well below.']} capAt={0.8} />, 0.4);
sh(S('n05') - 0.2, (p) => <Well t={p.t + 5} show={[...ALL, 'pipe', 'kill']} at={{ pipe: 5.3, kill: 5.6 }} caption={['THE TEST', 'Sealed well: pressure in the drill pipe stays at zero.']} capAt={5.3} />);
sh(S('n06') - 0.1, (p) => { const o = S('n06') - 0.1; return <Well t={p.t} show={[...ALL, 'pipe', 'kill', 'gauges']} at={{ gauges: W('n06', 'drill') - o }} dp={1400} kl={0} caption={['THE READINGS', 'Two lines into the same well. Two different answers.']} capAt={W('n06', 'second') - o} />; });
sh(S('n07') - 0.1, (p) => <Doc {...p} src="comm-125.jpg" aspect={0.7727} box={[0.1071, 0.1228, 0.8531, 0.1774]} zoomAt={0.9} zoom={2.2} />);
sh(S('n08') - 0.1, (p) => <Well t={p.t + 5} show={[...ALL, 'pipe', 'seawater']} at={{ seawater: 5.2 }} caption={['8:02 P.M.', 'The heavy mud, the main barrier holding the well back, is replaced with lighter seawater.']} capAt={5.2} />);
sh(W('n08', 'Around'), (p) => (<><Photo {...p} src="deck_plan_hearing.jpg" s0={1.0} s1={1.12} fx={0.45} fy={0.35} /><Label t={p.t} at={0.4} text="A deck plan of the Deepwater Horizon, used at the investigation hearings, May 2010 (the pin marks another crew member)" credit="Photo: U.S. Coast Guard (DVIDS)" /></>));
sh(B.w_phone[1].at, (p) => (<><Film {...p} src="jit_wide2.mp4" /><Label t={p.t} at={0.2} text="Voice: Mike Williams · the hearing room, July 23, 2010" credit={USCG} /></>));
const F0 = S('n09') - 0.2;
sh(F0, (p) => <Well t={p.t + 5} show={[...ALL, 'pipe', 'seawater', 'flow']} at={{ seawater: 0, flow: 5.0 }} caption={['ABOUT 9:40 P.M.', 'Mud and gas surge up the riser and onto the rig floor.']} capAt={5.1} />);
sh(W('n09', 'Eleven') - 0.2, (p) => (<><Film {...p} src="night_fireboats.mp4" /><Label t={p.t} at={0.3} text="Fireboats spray the burning rig · night of April 20–21, 2010" credit={USCG} /></>), 0.3);
sh(S('n10') - 0.1, (p) => <Well t={p.t + 5} show={[...ALL, 'bopglow']} at={{ bopglow: 5.0 + W('n10', 'blowout') - S('n10') }} zoom={{ s: 1.0 + 0.5 * pe(p.t, W('n10', 'blowout') - S('n10'), 2.5), y: 600 }} />, 0.3);
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
