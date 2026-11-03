// Deepwater Horizon — main film after the opening. Shot jobs: research/edit_plan_film.md. Facts: research/facts.md.
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate } from 'remotion';
import T from './data/film.json';
import { FPS, BG, INK, ACC, SANS, DISPLAY, pe, SP, Film as Clip, Photo, Label, Lower, Doc, Pull, Chapter, Quote, Stamp, Roster, TextCard, BigTime } from './kit';
import { Well } from './well';
import { Bop } from './bop';
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
const COMM = (p: string) => `National Commission on the BP Deepwater Horizon Oil Spill, report to the President (2011), ${p}`;
const BASE = ['rig', 'riser', 'bop', 'well', 'labels'] as const;
const lerp = (t: number, a: number, b: number, v0: number, v1: number) => interpolate(t, [a, b], [v0, v1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
const DocL: React.FC<SP & { src: string; box: number[]; cap: string; zoom?: number; pull: string }> = (p) => (<><Doc {...p} aspect={0.7} zoomAt={0.5} zoom={p.zoom ?? 2.0} /><Label t={p.t} at={0.3} text={p.cap} top /><Pull t={p.t} text={p.pull} /></>);
// ===================== 1 · THE RIG AND THE WELL
sh(0, (p) => (<><Photo {...p} src="dvids_img_1095288.jpg" s1={1.06} /><Chapter t={p.t} n={1} title="THE RIG AND THE WELL" /><Label t={p.t} at={0.3} text="NOT THE DEEPWATER HORIZON: Development Driller III, a similar rig, at the same site · May 7, 2010" credit="Photo: PO3 Patrick Kelley, U.S. Coast Guard (DVIDS)" /></>));
{ const a = S('b02') - 0.2; sh(a, (p) => <Well t={p.t} show={[...BASE, 'depth']} at={{ rig: 0, labels: 0, riser: W('b02', 'riser') - a, bop: W('b02', 'blowout') - a, depth: W('b02', 'five') - a, well: W('b02', 'From') - a }} />, 0.4); }
sh(S('b03') - 0.2, (p) => <DocL {...p} src="comm-018.jpg" box={[0.1429, 0.3579, 0.8634, 0.3912]} cap="BP engineer Brian Morel's email of April 14, 2010, as quoted by the presidential commission" pull="“…this has been [a] nightmare well which has everyone all over the place.”" />, 0.3);
{ const a = S('b04') - 0.2; sh(a, (p) => <Roster t={p.t} title="ABOARD: 126 PEOPLE FROM 13 COMPANIES" rows={[
  { who: 'BP · Transocean · Halliburton', role: 'operator · rig owner and crew · cement', at: 0.6 },
  { who: 'Bob Kaluza', role: 'BP well site leader (day)', at: W('b04', 'Bob') - a - 0.4 },
  { who: 'Don Vidrine', role: 'BP well site leader (night)', at: W('b04', 'Don') - a - 0.4 },
  { who: 'Jason Anderson', role: 'Transocean toolpusher', at: W('b04', 'Jason') - a - 0.4 },
  { who: 'Dewey Revette', role: 'Transocean driller', at: W('b04', 'Dewey') - a - 0.4 }]} src="Roles: National Commission report (2011); U.S. Chemical Safety Board (2014)" />, 0.3); }
{ const a = S('b05') - 0.2; sh(a, (p) => <Well t={p.t + 3} show={[...BASE, 'cement', 'mud']} at={{ cement: 3 + W('b05', 'cemented') - a }} caption={['APRIL 20, 12:40 A.M.', 'Halliburton finishes cementing the bottom of the well. Next: seal it temporarily and move the rig.']} capAt={3 + 0.6} />, 0.3); }
// ===================== 2 · THREE BARRIERS
{ const a = E.ch2.at; sh(a, (p) => (<><Well t={p.t + 3} show={[...BASE, 'cement', 'mud', 'bopglow']} at={{ bopglow: 3 + W('b06', 'blowout') - a }} caption={['THREE BARRIERS', 'Heavy drilling mud · cement at the bottom · the blowout preventer']} capAt={3 + W('b06', 'Three') - a} /><Chapter t={p.t} n={2} title="THREE BARRIERS" /></>), 0.3); }
{ const a = S('b07') - 0.2; sh(a, (p) => <Well t={p.t} show={[...BASE, 'cement', 'mud', 'seawater']} at={{ mud: -2, cement: -2, seawater: W('b07', 'seawater') - a }} caption={['THE PLAN', 'Replace the mud in the riser and the top of the well with seawater. Then the cement alone holds back the reservoir.']} capAt={0.5} />); }
sh(S('b08') - 0.2, (p) => <DocL {...p} src="comm-020.jpg" box={[0.1429, 0.1271, 0.8929, 0.2146]} cap={COMM('p. 4')} zoom={1.9} pull="“…if the cementing went smoothly, as it had, they could skip Schlumberger’s cement evaluation.”" />, 0.3);
sh(S('b09') - 0.2, (p) => <DocL {...p} src="comm-117.jpg" box={[0.1071, 0.8823, 0.8321, 0.9337]} cap={COMM('p. 101') + ' · Halliburton laboratory tests, April 2010'} zoom={1.9} pull="“…showed once again that the cement slurry would be unstable. The Commission does not believe that Halliburton ever reported this information to BP.”" />, 0.3);
// ===================== 3 · THE TEST
{ const a = E.ch3.at; sh(a, (p) => (<><Well t={p.t + 3} show={[...BASE, 'cement', 'mud', 'pipe', 'gauges']} dp={0} kl={0} at={{ mud: -2, cement: -2, pipe: 3 + 0.4, gauges: 3 + W('b10', 'lower') - a }} caption={['THE NEGATIVE PRESSURE TEST', 'Lower the pressure inside the well. If the cement holds: no pressure, no flow.']} capAt={3 + W('b10', 'If') - a} /><Chapter t={p.t} n={3} title="THE TEST" /></>), 0.3); }
sh(S('b11') - 0.2, (p) => <DocL {...p} src="comm-135b.jpg" box={[0.1151, 0.4663, 0.8554, 0.5718]} cap={COMM('p. 119')} zoom={1.8} pull="“…there was no standard procedure for running or interpreting the test…”" />, 0.3);
{ const a = S('b12') - 0.2; const r0 = W('b12', 'bled') - a, r1 = W('b12', 'fourteen') - a; sh(a, (p) => <Well t={p.t + 3} show={[...BASE, 'cement', 'mud', 'pipe', 'gauges']} at={{ mud: -2, cement: -2, pipe: -2, gauges: 0 }} dp={p.t < r0 ? 0 : p.t < r0 + 1.2 ? lerp(p.t, r0, r0 + 1.2, 0, 1262) : lerp(p.t, r0 + 1.6, r1, 1262, 1400)} kl={0} caption={['FROM ABOUT 5 P.M.', 'Bled off, the drill pipe pressure kept coming back.']} capAt={3 + 0.4} />, 0.3); }
{ const d = S('b13') - 0.2;
  sh(d, (p) => <DocL {...p} src="comm-123.jpg" box={[0.1071, 0.7195, 0.8383, 0.8251]} cap={COMM('p. 107') + ' · statements of both BP well site leaders'} zoom={1.9} pull="“…Anderson said that the 1,400 psi pressure on the drill pipe was being caused by a phenomenon called the ‘bladder effect.’”" />, 0.3); }
sh(S('b14') - 0.2, (p) => <AbsoluteFill style={{ background: BG }}><Quote t={p.t} at={0.3} text="“…not known to exist in the context of negative pressure tests.”" src="U.S. District Court, E.D. Louisiana, MDL 2179, Phase One findings (2014), on the “bladder effect”" /></AbsoluteFill>, 0.3);
{ const a = S('b15') - 0.2; sh(a, (p) => (<><Well t={p.t + 3} show={[...BASE, 'cement', 'mud', 'pipe', 'kill', 'gauges']} at={{ mud: -2, cement: -2, pipe: -2, gauges: -2, kill: 3 + W('b15', 'kill') - a }} dp={1400} kl={0} caption={['SECOND TEST, ON THE KILL LINE', 'No flow for 30 minutes. The drill pipe still read 1,400 psi.']} capAt={3 + W('b15', 'Nothing') - a} />
  {/* the decision, over the same picture */}
  </>), 0.3); }
{ const a = S('b16') - 0.3; sh(a, (p) => (<><Well t={p.t + 30} show={[...BASE, 'cement', 'mud', 'pipe', 'kill', 'gauges']} at={{}} dp={1400} kl={0} /><Stamp t={p.t} at={W('b16', 'declared') - a} text="≈ 8 P.M. · DECLARED A SUCCESS" /></>)); }
sh(S('b17') - 0.2, (p) => <DocL {...p} src="comm-135.jpg" box={[0.1071, 0.1774, 0.7921, 0.2107]} cap={COMM('p. 119') + ' · the investigators’ conclusion, after the fact'} zoom={2.1} pull="“The pressure data were not ambiguous.”" />, 0.3);
sh(S('b18') - 0.2, (p) => <DocL {...p} src="comm-140.jpg" box={[0.1429, 0.8143, 0.8712, 0.8478]} cap={COMM('p. 124') + ' · North Sea near miss, December 23, 2009'} zoom={2.1} pull="“…according to Transocean, neither the PowerPoint nor this advisory ever made it to the Deepwater Horizon crew.”" />, 0.3);
// ===================== 4 · NINE O'CLOCK
sh(E.ch4.at, (p) => (<><Photo {...p} src="dvids_img_1095923.jpg" s1={1.05} fy={0.35} /><Chapter t={p.t} n={4} title="THE SIGNS" /><Lower t={p.t} at={1.2} name="Chris Haire" role="Cementer, Halliburton · at the hearing, May 28, 2010" /><Label t={p.t} at={1.2} text="" credit={HEARP('Kenner, La.')} top right /></>), 0.3);
{ const a = S('b20') - 0.2; sh(a, (p) => <Well t={p.t + 3} show={[...BASE, 'cement', 'mud', 'pipe', 'seawater', 'flow']} at={{ mud: -2, cement: -2, pipe: -2, seawater: 3 + 0, flow: 3 + W('b20', 'oil') - a }} caption={['ABOUT 8:50 P.M. · LATER COMPUTER MODELS', 'With the mud gone, oil and gas begin to enter the well.']} capAt={3 + W('b20', 'eight') - a} />, 0.3); }
{ const a = S('b21') - 0.2; const s1 = W('b21', 'nine-oh-one') - a, s2 = W('b21', 'Minutes') - a, s3 = W('b21', 'nine-ten') - a;
  const wl = (p: SP, cap: [string, string]) => <Well t={p.t + 10} show={[...BASE, 'cement', 'pipe', 'seawater', 'flow', 'gauges']} at={{ seawater: -9, flow: -9, gauges: 10 + s1 - 0.4 }} dp={lerp(p.t, s1, s1 + 4, 1250, 1350)} kl={-1} caption={cap} capAt={0} />;
  sh(a, (p) => wl(p, ['9:01 P.M.', 'Drill pipe pressure rises while the pumps run steadily.']), 0.3);
  sh(a + s2 - 0.2, (p) => wl({ ...p, t: p.t + s2 - 0.2 }, ['ABOUT 9:08 P.M.', 'Pumps off for a check, but fluid keeps flowing out.']));
  sh(a + s3 - 0.2, (p) => wl({ ...p, t: p.t + s3 - 0.2 }, ['ABOUT 9:10 P.M.', 'Returns sent overboard, past the flow meters.']));
  sh(S('b22') - 0.1, (p) => wl({ ...p, t: p.t + 20 }, ['WHAT INVESTIGATORS FOUND', 'The crew was busy with other work. The signs were missed.'])); }
sh(S('b23') - 0.2, (p) => (<><Photo {...p} src="dvids_img_1095928.jpg" s0={1.25} s1={1.32} fx={0.72} fy={0.4} /><Lower t={p.t} at={0.5} name="Randy Ezell (right)" role="Senior toolpusher, Transocean · at the hearing, May 28, 2010" /><Quote t={p.t} at={W('b23', 'By') - S('b23')} side text="“It went good… We watched it for 30 minutes and we had no flow.”" src="Jason Anderson at about 9:20 p.m., as recalled by Ezell (Commission report, p. 7)" /><Label t={p.t} at={0.5} text="" credit={HEARP('Kenner, La.')} top right /></>), 0.3);
{ const a = S('b24') - 0.2; const s2 = W('b24', 'Ten') - a;
  sh(a, (p) => <Well t={p.t + 10} show={[...BASE, 'cement', 'pipe', 'seawater', 'flow']} at={{ seawater: -9, flow: -9 }} caption={['ABOUT 9:30 P.M.', 'A pressure difference. Pumps off; drill pipe pressure rises about 550 psi.']} capAt={0} />, 0.3);
  sh(a + s2 - 0.2, (p) => <Well t={p.t + 20} show={[...BASE, 'cement', 'pipe', 'seawater', 'flow']} at={{ seawater: -9, flow: 18 }} caption={['ABOUT 9:40 P.M.', 'Mud shoots out of the riser onto the rig floor.']} capAt={0} />); }
// ===================== 5 · THE BLOWOUT
sh(E.ch5.at, (p) => (<><Well t={p.t + 30} show={[...BASE, 'cement', 'pipe', 'seawater', 'flow', 'bopglow']} at={{ seawater: -9, flow: -9, bopglow: 30 + W('b25', 'closed') - E.ch5.at }} caption={['9:40–9:47 P.M.', 'Flow sent to the mud-gas separator, not overboard. The preventer is closed.']} capAt={30 + 0.6} /><Chapter t={p.t} n={5} title="THE BLOWOUT" /></>), 0.3);
sh(S('b26') - 0.2, (p) => (<><Photo {...p} src="dvids_img_1095937.jpg" s1={1.05} /><Lower t={p.t} at={0.4} name="Micah Sandell (right)" role="Crane operator, Transocean · at the hearing, May 29, 2010" /><Quote t={p.t} at={1.0} side text="“I seen mud shooting all the way up to the derrick… Then something exploded.”" src="Commission report, p. 9" /><Label t={p.t} at={0.4} text="" credit={HEARP('Kenner, La.')} top right /></>), 0.3);
sh(S('b27') - 0.2, (p) => <AbsoluteFill style={{ background: BG }}><Quote t={p.t} at={0.3} text="“…mud falling on the back half of my boat, kind of like a black rain.”" src="Capt. Alwin Landry, supply vessel Damon B. Bankston, about 9:45 p.m. (Commission report, p. 12)" /></AbsoluteFill>, 0.3);
const WST = (p: SP, s0: number, s1: number, f = 'w_still.jpg') => (<><Photo {...p} src={f} s0={s0} s1={s1} fx={0.62} fy={0.45} /><Label t={p.t} at={0.3} text="Voice: Mike Williams · testimony, July 23, 2010" right top /><Label t={p.t} at={0.3} text="Williams (right) · hearing video still" credit={USCG} top /></>);
sh(S('b28') - 0.2, (p) => (<>{WST(p, 1.0, 1.08)}<Lower t={p.t} at={1.0} name="Mike Williams" role="Chief electronics technician, Transocean" /></>), 0.3);
sh(B.w_hiss[0].at - 0.1, (p) => WST(p, 1.35, 1.45, 'w_still_515.jpg'));
sh(B.w_engine[2].at - 0.1, (p) => (<AbsoluteFill style={{ background: BG }}><Label t={p.t} at={0.3} text="Voice: Mike Williams · testimony, July 23, 2010" right top /></AbsoluteFill>), 0.6);
sh(S('b30') - 0.2, (p) => <BigTime t={p.t} text="ABOUT 9:49 P.M." sub="FIRST EXPLOSION · TIMES APPROXIMATE" />, 0.3);
sh(B.x_door[0].at - 0.1, (p) => WST(p, 1.5, 1.6, 'w_still_527.jpg'), 0.6);
sh(S('b31') - 0.3, (p) => (<><Clip {...p} src="night_rig.mp4" /><Label t={p.t} at={0.3} text="Voice: Mike Williams · testimony, July 23, 2010" right top /><Label t={p.t} at={0.8} text="The rig on fire, filmed by the Coast Guard after 11 p.m., more than an hour after the explosions" credit={USCG} /></>), 0.4);
sh(B.x_bridge[0].at - 0.2, (p) => WST(p, 1.15, 1.25, 'w_still_548.jpg'), 0.4);
// ===================== 6 · ABANDON SHIP
sh(E.ch6.at, (p) => (<><Photo {...p} src="deck_plan_hearing.jpg" s0={2.2} s1={2.3} fx={0.85} fy={0.97} /><Label t={p.t} at={0.6} text="Part of the rig’s deck plan, as shown at the hearings, May 2010" credit="Photo: U.S. Coast Guard (DVIDS)" /><Chapter t={p.t} n={6} title="ABANDON SHIP" /></>), 0.4);
sh(B.y_alarm[0].at, (p) => (<><Clip {...p} src="w_sync1.mp4" /><Label t={p.t} at={0.2} text="Mike Williams (right, olive shirt) answers the hearing panel · July 23, 2010" credit={USCG} /></>));
sh(S('b33') - 0.2, (p) => (<><Photo {...p} src="deck_plan_hearing.jpg" s0={2.2} s1={2.35} fx={0.15} fy={0.97} /><Label t={p.t} at={0.6} text="Part of the rig’s deck plan, as shown at the hearings, May 2010" credit="Photo: U.S. Coast Guard (DVIDS)" /><AbsoluteFill style={{ background: 'rgba(8,9,10,0.6)', opacity: pe(p.t, 0.3, 0.5) }} /><BigTime t={p.t} at={0.4} text="FROM ABOUT 9:52 P.M." sub="GENERAL ALARM · MAYDAY · LIFEBOATS · TIMES APPROXIMATE" /></>), 0.4);
sh(B.y_cook[0].at - 0.2, (p) => WST(p, 1.2, 1.3, 'w_still_548.jpg'), 0.4);
sh(B.y_jump[0].at - 0.2, (p) => WST(p, 1.45, 1.55, 'w_still_562.jpg'), 0.4);
sh(B.y_jump[2].at + 7.5, (p) => (<AbsoluteFill style={{ background: BG }}><Label t={p.t} at={0.3} text="Voice: Mike Williams · testimony, July 23, 2010" right top /></AbsoluteFill>), 0.8);
sh(B.y_over[0].at - 0.2, (p) => WST(p, 1.0, 1.1, 'w_still.jpg'), 0.8);
sh(S('b35') - 0.2, (p) => (<AbsoluteFill style={{ background: BG }}><BigTime t={p.t} at={0.3} text="ABOUT 10 P.M." sub="THE BANKSTON’S RESCUE BOAT PULLS SURVIVORS FROM THE WATER · NO FOOTAGE" /><Label t={p.t} at={0.3} text="Voice: Mike Williams · testimony, July 23, 2010" right top /></AbsoluteFill>), 0.4);
sh(S('b37') - 0.2, (p) => (<><Clip {...p} src="rescue_basket.mp4" /><Label t={p.t} at={0.5} text="After midnight, April 21: a Coast Guard helicopter hoists an injured survivor from a support vessel (not named)" credit={USCG} /></>), 0.4);
sh(W('b37', 'flown') - 0.2, (p) => (<><Clip {...p} src="medevac.mp4" /><Label t={p.t} at={0.4} text="Injured crew arrive at Coast Guard Air Station New Orleans · April 21, 2010" credit={USCG} /></>), 0.3);
sh(S('b38') - 0.2, (p) => (<><Clip {...p} src="search_cutter.mp4" /><Label t={p.t} at={0.4} text="A Coast Guard patrol boat searching, April 21, 2010" credit={USCG} /></>), 0.4);
sh(E.hold6.at + 0.6, () => <AbsoluteFill style={{ background: BG }} />, 1.2);
// ===================== 7 · THE LAST LINE OF DEFENSE
sh(E.ch7.at, (p) => (<><Photo {...p} src="dvids_img_1095905.jpg" s1={1.05} fx={0.75} fy={0.35} /><Chapter t={p.t} n={7} title="THE LAST LINE OF DEFENSE" /><Lower t={p.t} at={1.2} name="Chris Pleasant" role="Subsea supervisor, Transocean · sworn in at the hearing, May 28, 2010" /><Label t={p.t} at={1.2} text="" credit={HEARP('Kenner, La.')} top right /></>), 0.3);
{ const a = W('b39', 'blind') - 0.3; sh(a, (p) => <Bop t={p.t} caption={['EMERGENCY DISCONNECT · ABOUT 9:52–9:56 P.M.', 'Should close the blind shear ram and free the rig. The rig did not disconnect.']} capAt={0.4} />, 0.3); }
{ const a = S('b40') - 0.2; sh(a, (p) => <Bop t={p.t + 5} pods={5 + W('b40', 'deadman') - a} caption={['THE DEADMAN', 'Closes the blades on its own if power, communication and hydraulics from the rig are lost.']} capAt={5 + 0.3} />); }
{ const a = S('b41') - 0.2; sh(a, (p) => <Bop t={p.t + 5} pods={0} buckle={5 + W('b41', 'buckled') - a} close={5 + W('b41', 'blades') - a} flow={5 + W('b41', 'blades') - a + 1.6} caption={['U.S. CHEMICAL SAFETY BOARD (2014–2016)', 'Deadman most likely fired April 20. Buckled, off-center pipe kept the blades from sealing.']} capAt={5 + 0.3} />); }
{ const a = S('b42') - 0.2; sh(a, (p) => <Bop t={p.t + 20} pods={0} buckle={0} close={2} flow={4} caption={['JOINT INVESTIGATION / DNV (2011)', 'Pipe off center. Blades most likely closed April 22, triggered by an underwater robot.']} capAt={20 + 0.3} />); }
{ const a = S('b43') - 0.2; const s2 = W('b43', 'And') - a; sh(a, (p) => <Bop t={p.t + 20} pods={0} faults={20 + 0.6} buckle={0} close={2} flow={4} caption={['CONTROL POD WIRING FAULTS', 'Commission (2011): they kept the deadman from working. CSB (2016): it fired anyway.']} capAt={20 + 0.3} />);
  sh(a + s2 - 0.2, (p) => <Well t={p.t + 30} show={[...BASE, 'cement', 'pipe', 'seawater', 'flow', 'bopglow']} at={{ seawater: -9, flow: -9, bopglow: 0 }} caption={['WHEN THE CREW CLOSED IT', '“Flow rates at this point may have been too high… Earlier kick detection would have improved the odds.” (Commission, p. 114)']} capAt={30 + 0.4} />, 0.3); }
sh(S('b44') - 0.2, (p) => (<><Photo {...p} src="dvids_img_1098147.jpg" s1={1.06} /><Label t={p.t} at={0.4} text="The blowout preventer on the deck of the Q4000 after it was raised, September 4, 2010" credit="Photo: PO1 Thomas M. Blue, U.S. Coast Guard (DVIDS)" /></>), 0.4);
// ===================== 8 · AFTER
sh(E.ch8.at, (p) => (<><Clip {...p} src="day_fire.mp4" /><Chapter t={p.t} n={8} title="AFTER" /><Label t={p.t} at={0.6} text="April 21, 2010" credit={USCG} /></>), 0.3);
sh(W('b45', 'On') - 0.3, (p) => (<><Photo {...p} src="dvids_img_272213.jpg" s1={1.06} /><Label t={p.t} at={0.4} text="Debris and oil where the rig sank · April 22, 2010" credit="Photo: U.S. Coast Guard (DVIDS)" /></>), 0.4);
sh(S('b46') - 0.2, (p) => (<><Photo {...p} src="nasa_may17.jpg" s0={1.0} s1={1.08} /><Label t={p.t} at={0.4} text="The oil slick from space · May 17, 2010" credit="Image: NASA Earth Observatory, MODIS Rapid Response Team (Terra)" /></>), 0.4);
sh(W('b46', 'federal') - 0.3, (p) => (<><Clip {...p} src="burn_may7.mp4" /><Label t={p.t} at={0.4} text="A controlled burn of oil on the surface · May 7, 2010" credit="Video: MC1 Jeffery Tilghman Williams, U.S. Navy (DVIDS)" /></>), 0.4);
sh(S('b47') - 0.2, (p) => (<><Photo {...p} src="dvids_img_1096998.jpg" s1={1.06} /><Label t={p.t} at={0.4} text="Discoverer Inspiration, the drillship that lowered the capping stack · July 10, 2010" credit="Photo: U.S. Coast Guard (DVIDS)" /></>), 0.4);
{ const a = S('b48') - 0.2; sh(a, (p) => <TextCard t={p.t} title="WHAT FOLLOWED" lines={[
  { s: 'BP: guilty plea to 14 criminal counts, including 11 of seaman’s manslaughter · $4 billion (2013)', at: 0.4 },
  { s: 'Federal court: BP grossly negligent (2014)', at: W('b48', 'federal') - a },
  { s: 'Offshore regulator MMS split up (2010–2011) · Well Control Rule (2016)', at: W('b49', 'federal') - a }]} src="U.S. Department of Justice; U.S. EPA; MDL 2179 Phase One findings; Federal Register 81 FR 25888" />, 0.4); }
// ===================== 9 · THE ANSWER
{ const a = E.ch9.at; sh(a, (p) => (<><Well t={p.t + 30} show={[...BASE, 'cement', 'pipe', 'gauges']} at={{}} dp={1400} kl={0} caption={['WHY WAS THE WELL JUDGED SAFE?', 'A test read as a success · no standard for reading it · in fact, the cement had failed']} capAt={30 + 0.4} /><Chapter t={p.t} n={9} title="THE ANSWER" /></>), 0.4); }
sh(S('b51') - 0.2, (p) => <Bop t={p.t + 20} pods={0} buckle={0} close={2} flow={4} caption={['WHY DIDN’T THE PREVENTER STOP IT?', 'Signs missed until gas was above it · pipe in the wrong place to seal']} capAt={20 + 0.3} />, 0.3);
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
