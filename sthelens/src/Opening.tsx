// Opening test (≈90 s). Each shot: what the viewer learns, why here — see research/edit_plan.md.
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import T from './data/open.json';
import { FPS, BG, INK, SANS, DISPLAY, pe, SP, Photo, Film, Label, DateSuper, Lower } from './kit';
import { RegionMap, ReliefMap } from './maps';
const LN = T.lines as Record<string, { s: number; e: number; words: { w: string; s: number }[] }>;
const W = (id: string, w: string, nth = 0) => { const h = LN[id].words.filter((x) => x.w.toLowerCase().replace(/[^a-z0-9:']/g, '').startsWith(w.toLowerCase())); if (!h[nth]) throw new Error(`cue ${id}/${w}`); return h[nth].s; };
const S = (id: string) => LN[id].s;
const B = T.bites as Record<string, { at: number; from: number; dur: number }>;
const E = T.events as Record<string, { at: number; dur: number }>;
type Shot = { at: number; el: (p: SP) => React.ReactNode; fade?: number };
const shots: Shot[] = [];
const sh = (at: number, el: Shot['el'], fade = 0) => shots.push({ at, el, fade });
const GLICKEN = 'Photo: Harry Glicken, USGS (public domain)';
// 1 — place and date: the calm mountain the evening before
sh(0, (p) => (<><Photo {...p} src="mount-st-helens-may-17-1980-one-day-devastating-er.jpg" s0={1.0} s1={1.06} fy={0.45} /><DateSuper t={p.t} at={0.5} big="MAY 17, 1980" small="MOUNT ST. HELENS · WASHINGTON" /><Label t={p.t} at={1.2} text="View from the ridge six miles northwest of the volcano" credit={GLICKEN} /></>));
// 2 — where this is
sh(S('n02') - 0.25, (p) => <RegionMap {...p} />, 0.4);
// 3 — the ridge, the post, the distance
sh(W('n02', 'trailer') - 0.5, (p) => <ReliefMap {...p} a={{ cx: 0.6, cy: 0.515, w: 0.8 }} b={{ cx: 0.62, cy: 0.52, w: 0.74 }} show={['place']} ats={{ place: 0.3 }} />, 0.5);
// 4 — the person
sh(S('n03') - 0.1, (p) => (<><Photo {...p} src="johnston_coldwater2_1980-05-17.jpg" s0={1.0} s1={1.12} fx={0.72} fy={0.4} /><Label t={p.t} at={0.6} text="David A. Johnston, USGS · Coldwater II, about 7 p.m., May 17, 1980" credit={GLICKEN} /></>));
// 5–7 — what had been happening at the summit
sh(S('n04') - 0.1, (p) => (<><Film {...p} src="aerial_crater.mp4" /><Label t={p.t} at={0.3} text="The summit from a USGS aircraft · spring 1980" credit="USGS film, CC0 · exact date not recorded" /></>));
sh(W('n04', 'Steam') - 0.15, (p) => (<><Film {...p} src="crater_steam.mp4" /><Label t={p.t} at={0.2} text="Inside the new summit crater · spring 1980" credit="USGS film, CC0" /></>));
sh(W('n04', 'A', 1) - 0.1, (p) => (<><Film {...p} src="johnston_crater.mp4" /><Label t={p.t} at={0.2} text="USGS identifies this geologist as David Johnston, in the crater before May 18" credit="USGS film, CC0" /></>));
// 8–9 — the real problem: the north flank
sh(S('n05') - 0.1, (p) => <ReliefMap {...p} a={{ cx: 0.7, cy: 0.6, w: 0.5 }} b={{ cx: 0.72, cy: 0.64, w: 0.4 }} show={['flank']} ats={{ flank: 0.6 }} />, 0.4);
sh(B.cc_banks.at - 0.9, (p) => (<><Photo {...p} src="bulge-north-slope-mount-st-helens-may-18-198.jpg" s0={1.0} s1={1.04} /><Label t={p.t} at={0.2} text="The bulge on the north flank, seen from the air before May 18" credit="Photo: Robert Tilling, USGS (public domain)" /></>));
// 10 — a scientist who measured it, in his own words; then what he describes
sh(B.cc_banks.at + 0.55, (p) => (<><Film {...p} src="cc_banks.mov" from={B.cc_banks.from + 0.55} /><Label t={p.t} at={0.4} text="Norm Banks, USGS · recalling spring 1980" credit="From the USGS film “Mount St. Helens: May 18, 1980” (2010), public domain" right /></>));
sh(B.cc_banks.at + 4.4, (p) => (<><Film {...p} src="tl_coldwater.mp4" /><Label t={p.t} at={0.3} text="USGS time-lapse camera “Coldwater I”, north of the volcano · May 4, 1980" credit="USGS film, CC0" /></>));
sh(B.cc_banks.at + 7.0, (p) => (<><Film {...p} src="tl_notes.mp4" /><Label t={p.t} at={0.2} text="Field note at the camera: “Coldwater I · 5-4-80”" credit="USGS film, CC0" /></>));
sh(S('n06') - 0.1, (p) => (<><Photo {...p} src="bulge-north-side-mount-st-helens-developed-magma-push.jpg" s0={1.0} s1={1.05} fx={0.4} fy={0.4} /><Label t={p.t} at={0.3} text="Measuring the bulge from a survey station north of the volcano · 1980" credit="Photo: USGS (public domain)" /></>));
// 11 — the next morning
sh(S('n07') - 0.1, (p) => (<><Photo {...p} src="mount-st-helens-may-17-1980-one-day-devastating-er.jpg" s0={1.12} s1={1.18} fx={0.5} fy={0.4} /><DateSuper t={p.t} at={0.3} big="MAY 18, 1980 · 8:32 A.M." small="SUNDAY MORNING" /><Label t={p.t} at={0.8} text="The north face, photographed the evening before" credit={GLICKEN} /></>));
// 12 — the radio message (text only; no recording is used or imitated)
sh(E.radio.at, (p) => (
  <AbsoluteFill style={{ background: BG, alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 84, color: INK, opacity: pe(p.t, 0.0, 0.35) }}>“Vancouver! Vancouver! This is it!”</div>
    <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 34, color: 'rgba(242,239,233,0.85)', marginTop: 34, opacity: pe(p.t, 0.5, 0.5) }}>David Johnston’s last radio message, 8:32 a.m. — as reported by the USGS</div>
  </AbsoluteFill>
));
// 13–14 — two colleagues, in their own words
sh(B.cc_miller.at, (p) => (<><Film {...p} src="cc_miller.mov" from={B.cc_miller.from} /><Lower t={p.t} at={0.3} name="Dan Miller, USGS geologist" role="Driving north on Interstate 5 that morning" /></>));
sh(B.cc_swanson.at, (p) => (<><Film {...p} src="cc_swanson.mov" from={B.cc_swanson.from} /><Lower t={p.t} at={0.2} name="Voice: Don Swanson, USGS geologist" role="In Vancouver, Washington, at 8:32 a.m. · photo: David Johnston, May 17" /></>));
// 15–16 — what Swanson filmed later that morning; then the direction of the blast (schematic)
sh(S('n10') - 0.1, (p) => (<><Film {...p} src="sw_column.mp4" /><Label t={p.t} at={0.3} text="Filmed by Don Swanson from a USGS aircraft, about 9:30 a.m.–12:30 p.m., May 18" credit="USGS film, public domain" /></>));
sh(W('n10', 'north') - 0.2, (p) => (<><Film {...p} src="sw_mountain.mp4" /><Label t={p.t} at={0.3} text="The volcano later that morning, its north side gone · Don Swanson, USGS" credit="USGS film, public domain" /></>));
sh(W('n10', 'sideways') - 0.3, (p) => <ReliefMap {...p} a={{ cx: 0.6, cy: 0.515, w: 0.8 }} b={{ cx: 0.61, cy: 0.515, w: 0.77 }} show={['place', 'blast']} ats={{ place: 0, blast: 0.3 }} />, 0.3);
// 17 — back to the beginning
sh(S('n11') - 0.1, (p) => (<><Photo {...p} src="upper-cone-mount-st-helens-may-18-1980-eruption-no.jpg" s0={1.0} s1={1.06} fy={0.35} /><Label t={p.t} at={0.3} text="The summit on March 24, 1980, four days after the first earthquakes" credit="Photo: David Frank, USGS (public domain)" /></>));
// 18 — title
sh(E.title.at, (p) => (
  <AbsoluteFill style={{ background: BG, alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ fontFamily: DISPLAY, fontSize: 132, color: INK, letterSpacing: 3, textAlign: 'center', lineHeight: 0.95, opacity: pe(p.t, 0.2, 0.8) }}>THE MORNING MOUNT ST. HELENS<br />EXPLODED SIDEWAYS</div>
  </AbsoluteFill>
), 0.4);
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
