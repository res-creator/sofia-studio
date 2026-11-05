// Deepwater Horizon — main film after the opening. Shot jobs: research/edit_plan_film.md. Facts: research/facts.md.
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate } from 'remotion';
import T from './data/film.json';
import { FPS, BG, INK, ACC, SANS, DISPLAY, pe, SP, Film as Clip, Photo, Label, Lower, Doc, Pull, Chapter, Quote, Stamp, Roster, TextCard, BigTime } from './kit';
import { Well } from './well';
import { Bop } from './bop';
import { SystemView, PhotoView, StackView, BsrClose, PodsView, RovView, Headline, Badge, Footer, ease, PHOTO_BOX } from './bopscene';
import { ShopPlan } from './shopplan';
import { BeatPlea, BeatCourt, BeatRules } from './consequences';
import { Rescue } from './rescue';
const LN = T.lines as Record<string, { s: number; e: number; words: { w: string; s: number }[] }>;
const W = (id: string, w: string, nth = 0) => { const h = LN[id].words.filter((x) => x.w.toLowerCase().replace(/[^a-z0-9:'-]/g, '').startsWith(w.toLowerCase())); if (!h[nth]) throw new Error(`cue ${id}/${w}`); return h[nth].s; };
const S = (id: string) => LN[id].s;
const B = T.bites as Record<string, { at: number; src: number; dur: number }[]>;
const E = T.events as Record<string, { at: number; dur: number }>;
type Shot = { at: number; el: (p: SP) => React.ReactNode; fade?: number };
const shots: Shot[] = [];
const sh = (at: number, el: Shot['el'], fade = 0) => shots.push({ at, el, fade });
const USCG = 'Video: U.S. Coast Guard (DVIDS)';
const HEARP = (who: string) => `Photo: PO2 Thomas Blue, U.S. Coast Guard (DVIDS) · ${who}`;
const COMM = (p: string) => `Presidential commission report (2011), ${p}`;
const BASE = ['rig', 'riser', 'bop', 'well', 'labels'] as const;
const CYAN = '#7FC4E0', RED2 = '#E0533A';
// camera keys [at, x, y, scale]: each key eases in over 1.2 s from the previous state
const camK = (t: number, keys: [number, number, number, number][]) => { let c = { x: keys[0][1], y: keys[0][2], s: keys[0][3] };
  for (const [at, x, y, sc] of keys.slice(1)) { const e = ease(t, at, 1.2); c = { x: c.x + (x - c.x) * e, y: c.y + (y - c.y) * e, s: c.s + (sc - c.s) * e }; } return c; };
const lerp = (t: number, a: number, b: number, v0: number, v1: number) => interpolate(t, [a, b], [v0, v1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
const DocL: React.FC<SP & { src: string; box: number[]; cap: string; zoom?: number; pull: string }> = (p) => (<><Doc {...p} aspect={0.7} zoomAt={0.5} zoom={p.zoom ?? 2.0} /><Label t={p.t} at={0.3} text={p.cap} top /><Pull t={p.t} text={p.pull} /></>);
// ===================== 1 · THE RIG AND THE WELL
sh(0, (p) => (<><Photo {...p} src="dvids_img_1095288.jpg" s1={1.06} /><Chapter t={p.t} n={1} title="THE RIG AND THE WELL" /><Label t={p.t} at={0.3} text="NOT THE DEEPWATER HORIZON: Development Driller III, a similar rig, at the same site · May 7, 2010" credit="Photo: PO3 Patrick Kelley, U.S. Coast Guard (DVIDS)" /></>));
{ const a = S('b02') - 0.2; sh(a, (p) => <Well t={p.t} show={[...BASE, 'depth']} at={{ rig: 0, labels: 0, riser: W('b02', 'riser') - a, bop: W('b02', 'blowout') - a, depth: W('b02', 'five') - a, well: W('b02', 'From') - a }} />, 0.4); }
sh(S('b03') - 0.2, (p) => <DocL {...p} src="comm-018.jpg" box={[0.1429, 0.3579, 0.8634, 0.3912]} cap="BP engineer Brian Morel’s email, April 14, 2010 · commission report, p. 2" pull="“…this has been [a] nightmare well which has everyone all over the place.”" />, 0.3);
{ const a = S('b04') - 0.2; sh(a, (p) => <Roster t={p.t} title="ABOARD: 126 PEOPLE FROM 13 COMPANIES" rows={[
  { who: 'BP · Transocean · Halliburton', role: 'operator · rig owner and crew · cement', at: 0.6 },
  { who: 'Bob Kaluza', role: 'BP well site leader (day)', at: W('b04', 'Bob') - a - 0.4 },
  { who: 'Don Vidrine', role: 'BP well site leader (night)', at: W('b04', 'Don') - a - 0.4 },
  { who: 'Jason Anderson', role: 'Transocean toolpusher', at: W('b04', 'Jason') - a - 0.4 },
  { who: 'Dewey Revette', role: 'Transocean driller', at: W('b04', 'Dewey') - a - 0.4 }]} src="Roles: National Commission report (2011); U.S. Chemical Safety Board (2014)" />, 0.3); }
// cement: the camera goes to the bottom of the well
{ const a = S('b05') - 0.2; const c1 = W('b05', 'cemented') - a; sh(a, (p) => <Well t={p.t + 3} show={[...BASE, 'cement', 'mud']} at={{ cement: 3 + c1 + 0.6 }} cam={camK(p.t, [[0, 960, 540, 1], [c1 - 0.6, 960, 930, 2.4]])} caption={['APRIL 20, 12:40 A.M.', 'Cement is pumped to the bottom of the well.']} capAt={3 + c1 + 0.4} />, 0.3); }
// ===================== 2 · THREE BARRIERS — the camera visits each barrier as it is named
{ const a = E.ch2.at; const m = W('b06', 'mud') - a, c = W('b06', 'cement') - a, b = W('b06', 'blowout') - a;
  sh(a, (p) => (<><Well t={p.t + 3} show={[...BASE, 'cement', 'mud', 'bopglow']} at={{ bopglow: 3 + b }} cam={camK(p.t, [[0, 960, 930, 2.4], [0.4, 960, 540, 1], [m - 0.5, 960, 420, 1.7], [c - 0.5, 960, 960, 2.4], [b - 0.5, 960, 600, 2.4]])} />
    <Chapter t={p.t} n={2} title="THREE BARRIERS" />
    <Headline t={p.t} at={m - 0.3} out={c - 0.4} bottom big="1 · HEAVY DRILLING MUD" small="Its weight holds back the oil and gas." />
    <Headline t={p.t} at={c - 0.2} out={b - 0.4} bottom big="2 · CEMENT AT THE BOTTOM" />
    <Headline t={p.t} at={b - 0.2} bottom big="3 · THE BLOWOUT PREVENTER" small="On the seafloor, on top of the well" /></>), 0.3); }
{ const a = S('b07') - 0.2; sh(a, (p) => <Well t={p.t} show={[...BASE, 'cement', 'mud', 'seawater']} at={{ mud: -2, cement: -2, seawater: W('b07', 'seawater') - a }} cam={camK(p.t, [[0, 960, 600, 2.4], [0.3, 960, 430, 1.5]])} caption={['THE PLAN', 'Swap the mud in the riser for lighter seawater. Then the cement alone holds back the oil and gas.']} capAt={0.5} />, 0.3); }
{ const a = S('b08') - 0.2; const cm = W('b08', 'commission') - a; sh(a, (p) => (<><Well t={p.t + 9} show={[...BASE, 'cement', 'mud', 'seawater']} at={{ mud: -2, cement: -2, seawater: -9 }} cam={camK(p.t, [[0, 960, 430, 1.5], [0.2, 960, 960, 2.6]])} />
  <Headline t={p.t} at={0.6} out={cm - 0.4} bottom big="THAT MORNING: NO CEMENT CHECK" small="The team that could have tested the cement left on the 11 a.m. helicopter. (Commission, p. 4)" />
  <Headline t={p.t} at={cm - 0.2} bottom big="LATER: “BP SHOULD HAVE RUN ONE”" small="Commission report, p. 117 · the investigators’ conclusion" /></>), 0.3); }
sh(S('b09') - 0.2, (p) => <DocL {...p} src="comm-117.jpg" box={[0.1071, 0.8823, 0.8321, 0.9337]} cap={'Commission report, p. 101 · final results reached BP on April 26'} zoom={1.9} pull="“…showed once again that the cement slurry would be unstable. The Commission does not believe that Halliburton ever reported this information to BP.”" />, 0.3);
// ===================== 3 · THE TEST — close on the drill-pipe gauge; the kill line appears only when it is explained
const GCAM: [number, number, number] = [560, 230, 1.7];
{ const a = E.ch3.at; sh(a, (p) => (<><Well t={p.t + 3} show={[...BASE, 'cement', 'mud', 'pipe', 'gauges']} dp={0} kl={-1} gnote={['SEALED WELL: STAYS AT 0', '']} at={{ mud: -2, cement: -2, pipe: 3 + 0.4, gauges: 3 + W('b10', 'lower') - a }} cam={camK(p.t, [[0, 960, 540, 1], [W('b10', 'lower') - a - 0.4, ...GCAM]])} caption={['THE NEGATIVE PRESSURE TEST', 'Lower the pressure in the well and watch. If the cement holds: no pressure, no flow.']} capAt={3 + W('b10', 'If') - a} /><Chapter t={p.t} n={3} title="THE TEST" /></>), 0.3); }
sh(S('b11') - 0.2, (p) => (<><Well t={p.t + 30} show={[...BASE, 'cement', 'mud', 'pipe', 'gauges']} dp={0} kl={-1} gnote={['SEALED WELL: STAYS AT 0', '']} at={{}} cam={{ x: GCAM[0], y: GCAM[1], s: GCAM[2] }} />
  <Headline t={p.t} at={0.3} bottom big="NO STANDARD PROCEDURE" small="No written rules for running or reading the test, and no formal training. (Commission, p. 119)" /></>));
{ const a = S('b12') - 0.2; const r0 = W('b12', 'back') - a, r1 = W('b12', 'fourteen') - a; sh(a, (p) => <Well t={p.t + 30} show={[...BASE, 'cement', 'mud', 'pipe', 'gauges']} at={{}} dp={p.t < r0 ? 0 : p.t < r1 ? 1262 : 1400} kl={-1} gnote={['SHOULD STAY AT 0', '']} cam={{ x: GCAM[0], y: GCAM[1], s: GCAM[2] }} caption={['FROM ABOUT 5 P.M.', 'Bled to zero, the pressure came back: 1,262 psi, then 1,400.']} capAt={0.5} />); }
{ const d = S('b13') - 0.2;
  sh(d, (p) => <DocL {...p} src="comm-123.jpg" box={[0.1071, 0.7195, 0.8383, 0.8251]} cap={'Commission report, p. 107 · well site leaders’ statements'} zoom={1.9} pull="“…Anderson said that the 1,400 psi pressure on the drill pipe was being caused by a phenomenon called the ‘bladder effect.’”" />, 0.3); }
sh(S('b14') - 0.2, (p) => <AbsoluteFill style={{ background: BG }}><Quote t={p.t} at={0.3} text="“…not known to exist in the context of negative pressure tests.”" src="U.S. District Court, E.D. Louisiana, MDL 2179, Phase One findings (2014), on the “bladder effect”" /></AbsoluteFill>, 0.3);
{ const a = S('b15') - 0.2; const kk = W('b15', 'kill') - a; sh(a, (p) => <Well t={p.t + 30} show={[...BASE, 'cement', 'mud', 'pipe', 'kill', 'gauges']} at={{ kill: 30 + kk }} dp={1400} kl={0} gnote={['STILL 1,400 PSI', 'NO FLOW']} cam={camK(p.t, [[0, ...GCAM], [kk - 0.5, 960, 180, 1.35]])} caption={['SECOND TEST, ON THE KILL LINE', 'No flow for 30 minutes. The drill pipe still read 1,400 psi.']} capAt={W('b15', 'Nothing') - a} />, 0.3); }
{ const a = S('b16') - 0.3; sh(a, (p) => (<><Well t={p.t + 30} show={[...BASE, 'cement', 'mud', 'pipe', 'kill', 'gauges']} at={{}} dp={1400} kl={0} gnote={['STILL 1,400 PSI', 'NO FLOW']} cam={{ x: 960, y: 180, s: 1.35 }} /><Stamp t={p.t} at={W('b16', 'declared') - a} text="≈ 8 P.M. · DECLARED A SUCCESS" /></>)); }
sh(S('b17') - 0.2, (p) => <DocL {...p} src="comm-135.jpg" box={[0.1071, 0.1774, 0.7921, 0.2107]} cap={'Commission report, p. 119 · a later conclusion'} zoom={2.1} pull="“The pressure data were not ambiguous.”" />, 0.3);
sh(S('b18') - 0.2, (p) => <DocL {...p} src="comm-140.jpg" box={[0.1429, 0.8143, 0.8712, 0.8478]} cap={'Commission report, p. 124 · North Sea, Dec. 23, 2009'} zoom={2.1} pull="“…according to Transocean, neither the PowerPoint nor this advisory ever made it to the Deepwater Horizon crew.”" />, 0.3);
// ===================== 4 · THE SIGNS
sh(E.ch4.at, (p) => (<><Photo {...p} src="dvids_img_1095923.jpg" s1={1.05} fy={0.35} /><Chapter t={p.t} n={4} title="THE SIGNS" /><Lower t={p.t} at={1.2} name="Chris Haire" role="Cementer, Halliburton · at the hearing, May 28, 2010" /><Label t={p.t} at={1.2} text="" credit={HEARP('Kenner, La.')} top right /></>), 0.3);
{ const a = S('b20') - 0.2; sh(a, (p) => <Well t={p.t + 3} show={[...BASE, 'cement', 'mud', 'pipe', 'seawater', 'flow']} at={{ mud: -2, cement: -2, pipe: -2, seawater: 3 + 0, flow: 3 + W('b20', 'oil') - a }} cam={camK(p.t, [[0, 960, 540, 1], [W('b20', 'oil') - a - 1.0, 960, 880, 2.0]])} caption={['ABOUT 8:50 P.M. · COMPUTER MODELS', 'With the mud gone, oil and gas begin to enter the well.']} capAt={3 + W('b20', 'eight') - a} />, 0.3); }
{ const a = S('b21') - 0.2; const s1 = W('b21', 'nine-oh-one') - a, s2 = W('b21', 'Minutes') - a, s3 = W('b21', 'nine-ten') - a;
  const wl = (p: SP, cap: [string, string], g: boolean, cam: { x: number; y: number; s: number }) => <Well t={p.t + 10} show={[...BASE, 'cement', 'pipe', 'seawater', 'flow', ...(g ? ['gauges' as const] : [])]} at={{ seawater: -9, flow: -9, gauges: 10 + s1 - 0.4 }} dp={p.t < s1 + 3 ? 1250 : 1350} kl={-1} gnote={['9:01 → 9:08 P.M.', '']} caption={cap} capAt={0} cam={cam} />;
  sh(a, (p) => wl(p, ['9:01 P.M.', 'Drill pipe pressure rises, 1,250 to 1,350 psi, while the pumps run steadily.'], true, camK(p.t, [[0, 960, 880, 2.0], [s1 - 0.8, ...GCAM]])), 0.3);
  sh(a + s2 - 0.2, (p) => wl({ ...p, t: p.t + s2 - 0.2 }, ['ABOUT 9:08 P.M.', 'Pumps off for a check, but fluid keeps flowing out.'], false, camK(p.t, [[0, ...GCAM], [0.1, 960, 330, 1.4]])));
  sh(a + s3 - 0.2, (p) => wl({ ...p, t: p.t + s3 - 0.2 }, ['ABOUT 9:10 P.M.', 'Returns sent overboard, past the flow meters.'], false, { x: 960, y: 330, s: 1.4 }));
  sh(S('b22') - 0.1, (p) => wl({ ...p, t: p.t + 20 }, ['WHAT INVESTIGATORS FOUND', 'The crew was busy with other work. The signs were missed.'], false, camK(p.t, [[0, 960, 330, 1.4], [0.2, 960, 540, 1]]))); }
sh(S('b23') - 0.2, (p) => (<><Photo {...p} src="dvids_img_1095928.jpg" s0={1.25} s1={1.32} fx={0.72} fy={0.4} /><Lower t={p.t} at={0.5} name="Randy Ezell (right)" role="Senior toolpusher, Transocean · at the hearing, May 28, 2010" /><Quote t={p.t} at={W('b23', 'By') - S('b23')} side left text="“It went good… We watched it for 30 minutes and we had no flow.”" src="Jason Anderson at about 9:20 p.m., as recalled by Ezell (Commission report, p. 7)" /><Label t={p.t} at={0.5} text="" credit={HEARP('Kenner, La.')} top right /></>), 0.3);
{ const a = S('b24') - 0.2; const s2 = W('b24', 'Ten') - a;
  sh(a, (p) => <Well t={p.t + 10} show={[...BASE, 'cement', 'pipe', 'seawater', 'flow']} at={{ seawater: -9, flow: -9 }} cam={{ x: 960, y: 540, s: 1 }} caption={['ABOUT 9:30 P.M.', 'A pressure difference. Pumps off; drill pipe pressure rises about 550 psi.']} capAt={0} />, 0.3);
  sh(a + s2 - 0.2, (p) => <Well t={p.t + 20} show={[...BASE, 'cement', 'pipe', 'seawater', 'flow']} at={{ seawater: -9, flow: 18 }} cam={camK(p.t, [[0, 960, 540, 1], [0.2, 960, 250, 1.7]])} caption={['ABOUT 9:40 P.M.', 'Mud shoots out of the riser onto the rig floor.']} capAt={0} />); }
// ===================== 5 · THE BLOWOUT
sh(E.ch5.at, (p) => (<><Well t={p.t + 30} show={[...BASE, 'cement', 'pipe', 'seawater', 'flow', 'bopglow']} at={{ seawater: -9, flow: -9, bopglow: 30 + W('b25', 'closed') - E.ch5.at }} cam={camK(p.t, [[0, 960, 250, 1.7], [0.3, 960, 560, 2.0]])} caption={['9:40–9:47 P.M.', 'Gas is already above the preventer. The flow goes to the mud-gas separator; the preventer is closed.']} capAt={0.6} /><Chapter t={p.t} n={5} title="THE BLOWOUT" /></>), 0.3);
sh(S('b26') - 0.2, (p) => (<><Photo {...p} src="dvids_img_1095937.jpg" s1={1.05} /><Lower t={p.t} at={0.4} name="Micah Sandell (right)" role="Crane operator, Transocean · at the hearing, May 29, 2010" /><Quote t={p.t} at={1.0} side left text="“I seen mud shooting all the way up to the derrick… Then something exploded.”" src="Commission report, p. 9" /><Label t={p.t} at={0.4} text="" credit={HEARP('Kenner, La.')} top right /></>), 0.3);
const WST = (p: SP, s0: number, s1: number, f = 'w_still.jpg') => (<><Photo {...p} src={f} s0={s0} s1={s1} fx={0.62} fy={0.45} /><Label t={p.t} at={0.3} text="Voice: Mike Williams · testimony, July 23, 2010" right top /><Label t={p.t} at={0.3} text="Williams (right) · hearing video still" credit={USCG} top /></>);
const VOICE = (p: SP) => <Label t={p.t} at={0.3} text="Voice: Mike Williams · testimony, July 23, 2010" right top />;
sh(S('b28') - 0.2, (p) => (<>{WST(p, 1.0, 1.08)}<Lower t={p.t} at={1.0} name="Mike Williams" role="Chief electronics technician, Transocean" /></>), 0.3);
{ const a = B.w_hiss[0].at - 0.2; const g = W('b29', 'Gas') - a, e0 = B.w_engine[0].at - a, e1 = B.w_engine[1].at - a;
  sh(a, (p) => (<><ShopPlan t={p.t} above={ease(p.t, 0.3, 0.6)} ecr={p.t > S('b29') - a ? 1 : 0} gas={ease(p.t, g, 1.2)} eng3={p.t > e0 ? 1 : 0}
    push={ease(p.t, 0, e1 + 12)} caption={p.t < S('b29') - a - 0.2 ? ['A HISS AND A THUMP', 'From above: the riser skate and the rig floor'] : p.t < e0 - 0.3 ? ['ALARMS NEXT DOOR', 'Then gas reached the engines.'] : p.t < e1 - 0.2 ? ['ENGINE 3 RACES', '“…way above what I’d ever heard it run before.” — Williams'] : ['HE REACHES FOR THE DOOR', 'The engine keeps speeding up. (his account)']} capAt={0.3} />{VOICE(p)}
    <AbsoluteFill style={{ background: BG, opacity: 0 * e1 }} /></>), 0.5); }
sh(B.w_engine[2].at - 0.15, (p) => (<AbsoluteFill style={{ background: BG }}>{VOICE(p)}</AbsoluteFill>), 0.3);
sh(S('b30') - 0.2, (p) => <BigTime t={p.t} text="ABOUT 9:49 P.M." sub="FIRST EXPLOSION · TIMES APPROXIMATE" />, 0.3);
sh(B.x_crawl[0].at - 0.2, (p) => (<><ShopPlan t={p.t} route={ease(p.t, 0.6, 1.0)} ecr={1} caption={['OUT THROUGH THE ENGINE CONTROL ROOM', 'In the dark, on his hands and knees (Williams)']} capAt={0.4} />{VOICE(p)}</>), 0.5);
const LATER = (p: SP) => (<><Label t={p.t} at={0} text="Voice: Mike Williams · testimony, July 23, 2010" right top /><Label t={p.t} at={0} text="FILMED AFTER 11 P.M. · the rig more than an hour after the explosions" credit={USCG} /></>);
sh(S('b31') - 0.3, (p) => (<><Clip {...p} src="night_rig.mp4" from={8} />{LATER(p)}</>), 0.4);
// ===================== 6 · ABANDON SHIP
{ const a = E.ch6.at; const from = (533.98 - 524) - (B.y_alarm[0].at - a);
  sh(a, (p) => (<><Clip {...p} src="w_live.mp4" from={from} /><Chapter t={p.t} n={6} title="ABANDON SHIP" /><Label t={p.t} at={0.4} text="Mike Williams (right, olive shirt) · hearing, July 23, 2010" credit={USCG} /></>), 0.4); }
{ const a = S('b33') - 0.2; const th = B.y_three[0].at - a;
  sh(a, (p) => <Rescue t={p.t} lb={0.8} cam={camK(p.t, [[0, 1000, 600, 1.2], [th - 0.5, 740, 570, 1.6]])} caption={p.t < th - 0.3 ? ['FROM ABOUT 9:52 P.M.', 'Alarm and Mayday. Two lifeboats head for the supply vessel Damon B. Bankston.'] : ['ON DECK', 'Williams and two others: no life raft, no lifeboat (his account)']} />, 0.4); }
sh(B.y_jump[0].at - 0.2, (p) => (<><Clip {...p} src="night_fireboats.mp4" />{LATER(p)}</>), 0.4);
{ const a = B.y_water[0].at - 0.2; sh(a, (p) => (<><Rescue t={p.t + 6} lb={-20} burn={ease(p.t, 0.4, 1.0)} cam={camK(p.t, [[0, 700, 650, 1.6], [0.5, 690, 660, 2.0]])} caption={['IN THE WATER', 'Fuel burning on the surface around the rig (his account)']} />{VOICE(p)}</>), 0.5); }
{ const a = B.y_over[0].at - 0.2; sh(a, (p) => (<><Rescue t={p.t + 4} lb={-20} burn={1} frc={4 + 0.5} pickN={3} cam={camK(p.t, [[0, 690, 660, 2.0], [2, 820, 620, 1.45]])} caption={['ABOUT 10 P.M. · RECONSTRUCTION', 'The Bankston’s fast rescue craft pulls people from the water near the rig.']} />{p.t < S('b35') - a ? VOICE(p) : null}</>), 0.6); }
sh(S('b37') - 0.2, (p) => (<><Clip {...p} src="rescue_basket.mp4" /><Label t={p.t} at={0.5} text="After midnight, April 21: a Coast Guard helicopter hoists an injured survivor from a support vessel (not named)" credit={USCG} /></>), 0.4);
sh(W('b37', 'flown') - 0.2, (p) => (<><Clip {...p} src="medevac.mp4" from={2} /><Label t={p.t} at={0.4} text="Injured crew arrive at Coast Guard Air Station New Orleans · April 21, 2010" credit={USCG} /></>), 0.3);
sh(S('b38') - 0.2, (p) => (<><Clip {...p} src="search_cutter.mp4" /><Label t={p.t} at={0.4} text="A Coast Guard patrol boat searching, April 21, 2010" credit={USCG} /></>), 0.4);
sh(E.hold6.at + 0.6, () => <AbsoluteFill style={{ background: BG }} />, 1.2);
// ===================== 7 · THE LAST LINE OF DEFENSE — where it is → what it looks like → how it should work → what happened → why
{ const a = E.ch7.at; const ph = 3.0, ol = 5.6, mo = 7.6;
  sh(a, (p) => { const t = p.t; const z = ease(t, 1.6, 1.4); const phO = ease(t, ph, 0.7); const m = ease(t, mo, 0.9);
    const Bx = PHOTO_BOX; const place = { x: interpolate(m, [0, 1], [Bx.x + Bx.w / 2, 1240]), y: interpolate(m, [0, 1], [Bx.y + Bx.h / 2 + 20, 560]), k: interpolate(m, [0, 1], [Bx.h / 800, 1.08]) };
    return (<AbsoluteFill>
      <SystemView t={t} zoom={z} caption={<Headline t={t} at={0.4} out={1.8} bottom big="THE LAST LINE OF DEFENSE" small="The blowout preventer, 5,000 feet down, on top of the well" />} />
      <AbsoluteFill style={{ opacity: phO * (1 - 0.8 * m) }}><PhotoView t={t - ph} outlineAt={ol - ph} /></AbsoluteFill>
      <AbsoluteFill style={{ opacity: ease(t, mo, 0.5) }}><AbsoluteFill style={{ background: `rgba(11,12,13,${0.85 * m})` }} /><StackView t={t} place={place} s={{ mode: 'should', hl: 0, labels: m }} /></AbsoluteFill>
      <Chapter t={t} n={7} title="THE LAST LINE OF DEFENSE" />
    </AbsoluteFill>); }, 0.3); }
sh(S('b39') - 0.1, (p) => (<><Photo {...p} src="dvids_img_1095905.jpg" s1={1.05} fx={0.75} fy={0.35} /><Lower t={p.t} at={0.6} name="Chris Pleasant" role="Subsea supervisor, Transocean · sworn in at the hearing, May 28, 2010" /><Label t={p.t} at={0.6} text="" credit={HEARP('Kenner, La.')} top right /></>), 0.4);
{ const it = W('b39', 'It'), bl = W('b39', 'blind'), bd = W('b39', 'blades'), ct = W('b39', 'cut'), fr = W('b39', 'freed'), li = W('b39', 'lights'), nt = W('b39', 'not');
  sh(it - 0.15, (p) => (<AbsoluteFill style={{ background: BG }}><StackView t={p.t} s={{ mode: 'should', hl: ease(p.t, bl - it, 0.5) }} /><Badge t={p.t} at={0.1} text="HOW IT WAS MEANT TO WORK" color={CYAN} /><Headline t={p.t} at={bl - it - 0.3} big="EMERGENCY DISCONNECT" small="Close the blind shear ram, then release the rig." color={CYAN} /><Footer /></AbsoluteFill>), 0.3);
  sh(bd - 0.1, (p) => (<><BsrClose t={p.t} mode="should" close={ease(p.t, ct - bd - 0.2, 1.6)} buckle={0} flow={1} /><Badge t={p.t} at={0} text="HOW IT WAS MEANT TO WORK" color={CYAN} /><Headline bottom t={p.t} at={0.1} maxW={720} big="CUT THE PIPE, SEAL THE WELL" color={CYAN} /></>), 0.3);
  sh(fr - 0.2, (p) => (<AbsoluteFill style={{ background: BG }}><StackView t={p.t} s={{ mode: 'should', hl: 1, lift: ease(p.t, 0.3, 1.4) }} /><Badge t={p.t} at={0} text="HOW IT WAS MEANT TO WORK" color={CYAN} /><Headline t={p.t} at={0.2} big="RELEASE THE RIG" small="The upper package and riser unlatch and lift away." color={CYAN} /><Footer /></AbsoluteFill>), 0.3);
  sh(li - 0.1, (p) => (<AbsoluteFill style={{ background: BG }}><StackView t={p.t} s={{ mode: 'real', hl: 0.4, flow: ease(p.t, 0.2, 0.8) }} /><Badge t={p.t} at={0} text="WHAT HAPPENED" color={RED2} /><Headline t={p.t} at={0.1} big="ABOUT 9:52–9:56 P.M." small="The button was pressed. Panel lights changed." color={INK} />
    <div style={{ position: 'absolute', left: 0, right: 0, top: 860, textAlign: 'center', opacity: ease(p.t, nt - li, 0.4) }}><span style={{ fontFamily: DISPLAY, fontSize: 110, color: RED2, background: 'rgba(8,9,10,0.8)', padding: '4px 30px', letterSpacing: 3 }}>NO DISCONNECT</span></div><Footer /></AbsoluteFill>), 0.3); }
// the deadman, in close shots: control → connections → lost → command → blades
{ const a = S('b40') - 0.2; const pw = W('b40', 'power') - a, cm = W('b40', 'communication') - a, hy = W('b40', 'hydraulic') - a, af = W('b40', 'After') - a;
  sh(a, (p) => (<><PodsView t={p.t} lines={[ease(p.t, pw - 0.1, 0.4), ease(p.t, cm - 0.1, 0.4), ease(p.t, hy - 0.1, 0.4)]} cut={ease(p.t, af, 0.6)} signal={0} />
    <Headline bottom t={p.t} at={0.3} out={pw - 0.3} big="THE DEADMAN" small="An automatic backup, run by two control pods" />
    <Headline bottom t={p.t} at={af} big="AFTER THE EXPLOSIONS" small="All three connections to the rig: lost" color={RED2} /></>), 0.4); }
{ const a = S('b41') - 0.2; const cs = W('b41', 'Chemical') - a, fi = W('b41', 'fire') - a, dr = W('b41', 'drill') - a;
  sh(a, (p) => (<><PodsView t={p.t} lines={[1, 1, 1]} cut={1} signal={ease(p.t, fi - 0.2, 1.2)} />
    <Headline bottom t={p.t} at={0.2} out={cs - 0.3} big="INVESTIGATORS DISAGREED" small="on when the blades closed" />
    <Headline bottom t={p.t} at={cs - 0.1} big="THE DEADMAN MOST LIKELY FIRED" small="Source: U.S. Chemical Safety Board, 2014–2016" /></>), 0.4);
  sh(S('b41') - 0.2 + dr - 0.2, (p) => { const b0 = W('b41', 'buckled') - (S('b41') + dr - 0.4), c0 = W('b41', 'blades') - (S('b41') + dr - 0.4), s0 = W('b41', 'seal') - (S('b41') + dr - 0.4);
    return (<><BsrClose t={p.t} mode="real" close={ease(p.t, c0 - 0.1, 1.4)} buckle={ease(p.t, b0 - 0.2, 1.4)} flow={1} gapLabel={ease(p.t, s0 - 0.3, 0.5)} />
      <Headline bottom t={p.t} at={0.1} maxW={720} big="WHY THE BLADES COULD NOT SEAL" small="Source: U.S. Chemical Safety Board, 2014–2016" /></>); }, 0.3); }
{ const a = S('b42') - 0.2; const bu = W('b42', 'but') - a, ro = W('b42', 'robot') - a;
  sh(a, (p) => (<><BsrClose t={p.t + 10} mode="real" close={1} buckle={1} flow={1} gapLabel={0} />
    <Headline bottom t={p.t} at={0.1} maxW={720} big="ALSO: PIPE OFF CENTER" small="Source: joint federal investigation / DNV forensic examination, 2011" /></>), 0.3);
  sh(a + bu - 0.1, (p) => (<><RovView t={p.t} arrive={0.3} />
    <Headline bottom t={p.t} at={0.2} big="BUT CLOSED TWO DAYS LATER" small="Most likely April 22, triggered by an underwater robot (joint investigation / DNV)" /></>), 0.4); void ro; }
sh(E.pods.at - 0.2, (p) => (<><PodsView t={p.t} lines={[1, 1, 1]} cut={1} signal={0} faults={ease(p.t, 0.6, 0.5)} blades={0} />
  <Headline bottom t={p.t} at={0.2} big="THE CONTROL PODS HAD FAULTS" small="Commission (2011): they would have stopped the deadman. CSB (2016): wiring errors; it most likely fired anyway." /></>), 0.4);
sh(S('b43') - 0.2, (p) => (<><SystemView t={p.t} zoom={1 - ease(p.t, 0.3, 2.4)} flow={1} caption={<Headline t={p.t} at={2.4} bottom big="NIGHT OF APRIL 20" small="The flow may already have been too strong to stop. (Commission, p. 114)" color={RED2} />} /></>), 0.4);
sh(S('b44') - 0.2, (p) => (<><Photo {...p} src="bop_recovered_upright.jpg" s0={1.0} s1={1.06} fy={0.7} /><Label t={p.t} at={0.4} text="The blowout preventer on the Q4000 after it was raised, September 4, 2010" credit="Photo: PO1 Thomas M. Blue, U.S. Coast Guard (DVIDS)" /></>), 0.4);
// ===================== 8 · AFTER
sh(E.ch8.at, (p) => (<><Clip {...p} src="day_deck.mp4" /><Chapter t={p.t} n={8} title="AFTER" /><Label t={p.t} at={0.6} text="April 21, 2010" credit={USCG} /></>), 0.3);
sh(W('b45', 'On') - 0.3, (p) => (<><Photo {...p} src="dvids_img_272213.jpg" s1={1.06} /><Label t={p.t} at={0.4} text="Debris and oil where the rig sank · April 22, 2010" credit="Photo: U.S. Coast Guard (DVIDS)" /></>), 0.4);
sh(S('b46') - 0.2, (p) => <SystemView t={p.t} zoom={0} flow={ease(p.t, 0.3, 1.2)} after caption={<Headline t={p.t} at={0.6} bottom big="APRIL 22 – JULY 15" small="Oil and gas escaped at the seafloor for 87 days. (Schematic; the damaged equipment is not drawn.)" color={RED2} />} />, 0.4);
sh(W('b46', 'government') - 0.3, (p) => (<><Photo {...p} src="nasa_may17.jpg" s0={1.0} s1={1.08} /><Label t={p.t} at={0.4} text="The oil slick from space · May 17, 2010" credit="Image: NASA Earth Observatory, MODIS Rapid Response Team (Terra)" /></>), 0.4);
sh(W('b46', 'federal') - 0.3, (p) => (<><Clip {...p} src="burn_may7.mp4" /><Label t={p.t} at={0.4} text="A controlled burn of oil on the surface · May 7, 2010" credit="Video: MC1 Jeffery Tilghman Williams, U.S. Navy (DVIDS)" /></>), 0.4);
sh(S('b47') - 0.2, (p) => (<><Photo {...p} src="dvids_img_1096998.jpg" s1={1.06} /><Label t={p.t} at={0.4} text="Discoverer Inspiration, the drillship that lowered the capping stack · July 10, 2010" credit="Photo: U.S. Coast Guard (DVIDS)" /></>), 0.4);
{ const a = S('b48') - 0.2; const fe = W('b48', 'federal') - a, tr = W('b48', 'Transocean') - a;
  sh(a, (p) => <BeatPlea t={p.t} mansl={W('b48', 'eleven') - a} money={W('b48', 'four', 1) - a} />, 0.4);
  sh(a + fe - 0.2, (p) => <BeatCourt t={p.t} tro={tr - fe + 0.2} />, 0.4);
  sh(S('b49') - 0.2, (p) => <BeatRules t={p.t} split={W('b49', 'broken') - S('b49') + 0.2} rule={W('b49', 'New') - S('b49') + 0.2} />, 0.4); }
// ===================== 9 · THE ANSWER
{ const a = E.ch9.at; sh(a, (p) => (<><Well t={p.t + 30} show={[...BASE, 'cement', 'pipe', 'gauges']} at={{}} dp={1400} kl={0} gtag="EVENING TEST" caption={['WHY WAS THE WELL JUDGED SAFE?', 'Cement check skipped · test read as a success · no standard for reading it · in fact, the cement had failed']} capAt={30 + 0.4} /><Chapter t={p.t} n={9} title="THE ANSWER" /></>), 0.4); }
sh(S('b51') - 0.2, (p) => (<><BsrClose t={p.t + 10} mode="real" close={1} buckle={1} flow={1} gapLabel={1} /><Headline bottom t={p.t} at={0.2} maxW={720} big="WHY DIDN’T THE PREVENTER STOP IT?" small="Signs missed until gas was above it · the pipe in the wrong place to seal" /></>), 0.3);
sh(S('b52') - 0.2, (p) => <DocL {...p} src="comm-009.jpg" box={[0.151, 0.3579, 0.8477, 0.4273]} cap={COMM('p. vii')} zoom={1.9} pull="“…a series of identifiable mistakes made by BP, Halliburton, and Transocean…”" />, 0.3);
{ const a = E.names.at; const N = [['Jason Anderson', 'toolpusher'], ['Aaron Dale Burkeen', 'crane operator'], ['Donald Clark', 'assistant driller'], ['Stephen Curtis', 'assistant driller'], ['Gordon Jones', 'mud engineer'], ['Roy Wyatt Kemp', 'derrickhand'], ['Karl Dale Kleppinger Jr.', 'floorhand'], ['Blair Manuel', 'mud engineer'], ['Dewey Revette', 'driller'], ['Shane Roshto', 'floorhand'], ['Adam Weise', 'floorhand']];
  sh(a, (p) => (<AbsoluteFill style={{ background: BG }}>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 36, color: ACC, letterSpacing: 4, opacity: pe(p.t, 0.4, 0.8) }}>KILLED ON THE DEEPWATER HORIZON, APRIL 20, 2010</div>
    {N.map(([n, r], i) => <div key={n} style={{ position: 'absolute', left: i < 6 ? 260 : 1010, top: 220 + (i % 6) * 112, width: 700, opacity: pe(p.t, 1.2 + i * 0.5, 0.8) }}>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 42, color: INK }}>{n}</div><div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 26, color: 'rgba(242,239,233,0.7)' }}>{r}</div></div>)}
    <div style={{ position: 'absolute', left: 70, bottom: 40, fontFamily: SANS, fontSize: 22, color: 'rgba(242,239,233,0.6)' }}>Names: Commission report, dedication · roles: Coast Guard investigation report (2011)</div>
  </AbsoluteFill>), 1.0); }
sh(E.end.at, (p) => (<AbsoluteFill style={{ background: BG, alignItems: 'center', justifyContent: 'center' }}>
  <div style={{ fontFamily: DISPLAY, fontSize: 96, color: INK, letterSpacing: 6, opacity: pe(p.t, 0.3, 0.8) }}>KNOWN IN ADVANCE</div>
  <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 28, color: 'rgba(242,239,233,0.75)', marginTop: 14, opacity: pe(p.t, 0.8, 0.8) }}>Sources and archive credits are listed in the description</div>
</AbsoluteFill>), 0.8);
shots.sort((a, b) => a.at - b.at);
export const FILM_DUR = T.duration as number;
const ShotV: React.FC<{ s: Shot; dur: number }> = ({ s, dur }) => { const t = useCurrentFrame() / FPS; return <AbsoluteFill style={{ opacity: s.fade ? pe(t, 0, s.fade) : 1 }}>{s.el({ t, dur })}</AbsoluteFill>; };
export const Film: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
    {shots.map((s, i) => { const end = i + 1 < shots.length ? shots[i + 1].at + (shots[i + 1].fade ?? 0) : FILM_DUR; const from = Math.round(s.at * FPS), to = Math.round(end * FPS);
      return <Sequence key={i} from={from} durationInFrames={Math.max(1, to - from)}><ShotV s={s} dur={end - s.at} /></Sequence>; })}
    <Audio src={staticFile('audio/film_mix.wav')} />
  </AbsoluteFill>
);
