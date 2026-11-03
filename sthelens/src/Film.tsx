// KNOWN IN ADVANCE — "The Morning Mount St. Helens Exploded Sideways" (full film).
// Every shot: what the viewer learns and why here — see research/film_plan.md. Cuts are tied to narration words.
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import T from './data/film.json';
import { FPS, BG, INK, ACC, SANS, DISPLAY, pe, SP, Photo, Film, Label, DateSuper, Lower, Doc } from './kit';
import { RegionMap, ReliefMap } from './maps';
import { Recon } from './recon';
const LN = T.lines as Record<string, { s: number; e: number; words: { w: string; s: number }[] }>;
const W = (id: string, w: string, nth = 0) => { const h = LN[id].words.filter((x) => x.w.toLowerCase().replace(/[^a-z0-9:'-]/g, '').startsWith(w.toLowerCase())); if (!h[nth]) throw new Error(`cue ${id}/${w}`); return h[nth].s; };
const S = (id: string) => LN[id].s;
const B = T.bites as Record<string, { at: number; dur: number }>;
const E = T.events as Record<string, { at: number; dur: number }>;
type Shot = { at: number; el: (p: SP) => React.ReactNode; fade?: number };
const shots: Shot[] = [];
const sh = (at: number, el: Shot['el'], fade = 0) => shots.push({ at, el, fade });
const USGS = 'USGS film';
const GL = 'Photo: Harry Glicken, USGS';
const PRE = 0.3; // pre-roll of the interview clips
const bite = (id: string, offset = 0) => B[id].at + offset;
const Card: React.FC<{ t: number; top?: string; quote?: string; src?: string; qat?: number }> = ({ t, top, quote, src, qat = 0.2 }) => (
  <AbsoluteFill style={{ background: BG, alignItems: 'center', justifyContent: 'center', padding: '0 160px' }}>
    {top && <div style={{ fontFamily: DISPLAY, fontSize: 96, color: INK, letterSpacing: 3, opacity: pe(t, 0.1, 0.5) }}>{top}</div>}
    {quote && <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 64, lineHeight: 1.3, color: INK, textAlign: 'center', marginTop: top ? 40 : 0, opacity: pe(t, qat, 0.5) }}>{quote}</div>}
    {src && <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 32, color: 'rgba(242,239,233,0.85)', marginTop: 30, textAlign: 'center', opacity: pe(t, qat + 0.6, 0.5) }}>{src}</div>}
  </AbsoluteFill>
);
const MAPA = { cx: 0.6, cy: 0.515, w: 0.8 }, MAPB = { cx: 0.62, cy: 0.52, w: 0.74 }, POSA = { cx: 0.6, cy: 0.47, w: 0.8 }, POSB = { cx: 0.61, cy: 0.47, w: 0.78 };

// ===================== OPENING (approved; date and caption fixes)
sh(0, (p) => (<><Photo {...p} src="mount-st-helens-may-17-1980-one-day-devastating-er.jpg" s0={1.0} s1={1.06} fy={0.45} /><DateSuper t={p.t} at={0.5} big="MAY 17, 1980" small="MOUNT ST. HELENS · WASHINGTON" /><Label t={p.t} at={1.2} text="View from the ridge six miles northwest of the volcano" credit={GL} /></>));
sh(S('n02') - 0.25, (p) => <RegionMap {...p} />, 0.4);
sh(W('n02', 'trailer') - 0.5, (p) => <ReliefMap {...p} a={MAPA} b={MAPB} show={['place']} ats={{ place: 0.3 }} />, 0.5);
sh(S('n03') - 0.1, (p) => (<><Photo {...p} src="johnston_coldwater2_1980-05-17.jpg" s0={1.0} s1={1.12} fx={0.72} fy={0.4} /><Label t={p.t} at={0.6} text="David A. Johnston, USGS · Coldwater II, about 7 p.m., May 17, 1980" credit={GL} /></>));
sh(S('n04') - 0.1, (p) => (<><Film {...p} src="aerial_crater.mp4" /><Label t={p.t} at={0.3} text="The new summit crater, seen from a USGS aircraft · spring 1980" credit={USGS} /></>));
sh(W('n04', 'Steam') - 0.15, (p) => (<><Film {...p} src="crater_steam.mp4" /><Label t={p.t} at={0.2} text="Inside the summit crater · spring 1980" credit={USGS} /></>));
sh(W('n04', 'A', 1) - 0.1, (p) => (<><Film {...p} src="johnston_crater.mp4" /><Label t={p.t} at={0.2} text="David Johnston in the crater (identified by USGS) · before May 18" credit={USGS} /></>));
sh(S('n05') - 0.1, (p) => <ReliefMap {...p} a={{ cx: 0.7, cy: 0.6, w: 0.5 }} b={{ cx: 0.72, cy: 0.64, w: 0.4 }} show={['flank']} ats={{ flank: 0.6 }} />, 0.4);
sh(bite('cc_banks') - 0.9, (p) => (<><Photo {...p} src="bulge-north-slope-mount-st-helens-may-18-198.jpg" s0={1.0} s1={1.04} /><Label t={p.t} at={0.2} text="The bulge on the north flank, from the air · before May 18" credit="Photo: Robert Tilling, USGS" /></>));
sh(bite('cc_banks', 0.55), (p) => (<><Film {...p} src="cc_banks.mov" from={PRE + 0.55} /><Label t={p.t} at={0.4} text="Norm Banks, USGS · recalling spring 1980" credit="USGS interview, 2010" right /></>));
sh(bite('cc_banks', 4.4), (p) => (<><Film {...p} src="tl_coldwater.mp4" /><Label t={p.t} at={0.3} text="USGS time-lapse camera “Coldwater I” · May 4, 1980" credit={USGS} /></>));
sh(bite('cc_banks', 7.0), (p) => (<><Film {...p} src="tl_notes.mp4" /><Label t={p.t} at={0.2} text="Field note held up to the camera: “Coldwater I · 5-4-80”" credit={USGS} /></>));
sh(S('n06') - 0.1, (p) => (<><Photo {...p} src="bulge-north-side-mount-st-helens-developed-magma-push.jpg" s0={1.0} s1={1.05} fx={0.4} fy={0.4} /><Label t={p.t} at={0.3} text="Measuring the bulge from a survey station north of the volcano · 1980" credit="Photo: USGS" /></>));
// one card from "8:32 the next morning" through the quote: no older photo under a new date
sh(S('n07') - 0.1, (p) => <Card t={p.t} top="SUNDAY, MAY 18, 1980 · 8:32 A.M." quote={p.t > E.radio.at - (S('n07') - 0.1) ? '“Vancouver, Vancouver, this is it!”' : undefined} qat={E.radio.at - (S('n07') - 0.1) + 0.05} src="David Johnston’s last radio message, as printed by the USGS" />);
sh(B.cc_miller.at, (p) => (<><Film {...p} src="cc_miller.mov" from={PRE} /><Lower t={p.t} at={0.3} name="Dan Miller, USGS geologist" role="Driving north on Interstate 5 that morning" /></>));
sh(B.cc_swanson.at, (p) => (<><Film {...p} src="cc_swanson.mov" from={PRE} /><Lower t={p.t} at={0.2} name="Voice: Don Swanson, USGS geologist" role="In Vancouver, Washington, at 8:32 a.m. · photo: David Johnston, May 17" /></>));
sh(S('n10') - 0.1, (p) => (<><Film {...p} src="sw_column.mp4" /><Label t={p.t} at={0.3} text="Filmed by Don Swanson from a USGS aircraft, between about 9:30 a.m. and 12:30 p.m., May 18" credit={USGS} /></>));
sh(W('n10', 'north') - 0.2, (p) => (<><Film {...p} src="sw_mountain.mp4" /><Label t={p.t} at={0.3} text="The volcano later that morning, its north side gone" credit="USGS film · Don Swanson" /></>));
sh(W('n10', 'sideways') - 0.3, (p) => <ReliefMap {...p} a={MAPA} b={{ cx: 0.61, cy: 0.515, w: 0.77 }} show={['place', 'blast']} ats={{ place: 0, blast: 0.3 }} />, 0.3);
sh(S('n11') - 0.1, (p) => (<><Photo {...p} src="upper-cone-mount-st-helens-may-18-1980-eruption-no.jpg" s0={1.0} s1={1.06} fy={0.35} /><Label t={p.t} at={0.3} text="The summit on March 24, 1980, four days after the first earthquakes" credit="Photo: David Frank, USGS" /></>));
sh(E.title.at, (p) => (<AbsoluteFill style={{ background: BG, alignItems: 'center', justifyContent: 'center' }}><div style={{ fontFamily: DISPLAY, fontSize: 132, color: INK, letterSpacing: 3, textAlign: 'center', lineHeight: 0.95, opacity: pe(p.t, 0.2, 0.8) }}>THE MORNING MOUNT ST. HELENS<br />EXPLODED SIDEWAYS</div></AbsoluteFill>), 0.4);

// ===================== 1 — THE MOUNTAIN WAKES
sh(S('b1_01') - 0.6, (p) => <Card t={p.t} top="TWO MONTHS EARLIER" quote="March 20, 1980" qat={0.6} />);
sh(W('b1_01', 'seismographs') - 0.2, (p) => (<><Photo {...p} src="view-ne-a-small-phreatic-eruption-mount-st-helens-befor.jpg" s0={1.0} s1={1.05} /><Label t={p.t} at={0.4} text="March 1980: after 123 quiet years, earthquakes begin under the volcano" credit="Photo: Donald A. Swanson, USGS" /></>));
sh(S('b1_03') - 0.1, (p) => (<><Photo {...p} src="top-mount-st-helens-showing-a-graben-and-new-crater.jpg" s0={1.0} s1={1.07} fx={0.45} fy={0.4} /><Label t={p.t} at={0.3} text="The new crater and a crack across the summit · spring 1980" credit="Photo: Peter Lipman, USGS" /></>));
sh(S('b1_04') - 0.1, (p) => (<><Film {...p} src="m28_plume.mp4" /><Label t={p.t} at={0.3} text="Ash rising through the clouds · March 28, 1980" credit={USGS} /></>));
sh(W('b1_05', 'But') - 0.1, (p) => (<><Photo {...p} src="steam-blast-phreatic-eruption-summit-crater-mount-st.jpg" s0={1.0} s1={1.06} /><Label t={p.t} at={0.3} text="A steam-blast eruption from the summit crater · April 6, 1980" credit="Photo: USGS" /></>));
sh(S('b1_06') - 0.1, (p) => (<><Photo {...p} src="small-phreatic-eruption-mount-st-helens-spring-1980.jpg" s0={1.0} s1={1.05} /><Label t={p.t} at={0.3} text="A small steam eruption seen from the north · spring 1980" credit="Photo: USGS" /></>));
sh(E.crandell.at, (p) => <Card t={p.t} quote="“Mount St. Helens has done so many different things in the past that hardly anything would be a surprise… The only thing it hasn’t done is blow itself apart.”" src="Dwight Crandell, USGS, to the Seattle Times, April 6, 1980 · as quoted in USGS Professional Paper 1249" qat={0.1} />);

// ===================== 2 — WHAT WAS WRITTEN IN 1978
sh(S('b2_01') - 0.2, (p) => <Doc {...p} src="b1383c-09.jpg" aspect={0.6263} box={[0.1336, 0.0939, 0.9307, 0.1623]} zoomAt={2.6} zoom={1.9} />);
sh(S('b2_02') - 0.2, (p) => <Doc {...p} src="b1383c-32.jpg" aspect={0.6263} box={[0.0725, 0.1192, 0.8714, 0.1718]} zoomAt={0.8} zoom={2.1} />);
sh(S('b2_03') - 0.2, (p) => <Doc {...p} src="b1383c-32.jpg" aspect={0.6263} box={[0.0729, 0.5277, 0.8719, 0.5798]} zoomAt={0.3} zoom={2.1} />);
sh(W('b2_04', 'And'), (p) => (<><Film {...p} src="c7_flank.mp4" /><Label t={p.t} at={0.3} text="The north flank from a USGS aircraft · spring 1980" credit={USGS} /></>));
// ===================== 3 — THE BULGE
sh(bite('cc_swanson_local'), (p) => (<><Film {...p} src="cc_swanson_local.mov" from={PRE} /><Label t={p.t} at={1.2} text="Don Swanson, USGS · recalling spring 1980" credit="USGS interview, 2010" right /></>));
sh(S('b3_01') - 0.1, (p) => (<><Film {...p} src="c9_flank.mp4" /><Label t={p.t} at={0.3} text="The summit and the fractured north flank · before May 18" credit={USGS} /></>));
sh(bite('cc_miller_crypto'), (p) => (<><Film {...p} src="cc_miller_crypto.mov" from={PRE} /><Label t={p.t} at={1.2} text="Dan Miller, USGS · with USGS diagrams from the same film" credit="USGS interview, 2010" right /></>));
sh(S('b3_02') - 0.1, (p) => <ReliefMap {...p} a={{ cx: 0.7, cy: 0.55, w: 0.6 }} b={{ cx: 0.7, cy: 0.56, w: 0.55 }} show={['place', 'flank']} ats={{ place: 0.2, flank: 0.2 }} />, 0.3);
sh(W('b3_02', 'One') - 0.1, (p) => (<><Film {...p} src="c7_hoblitt.mp4" /><Label t={p.t} at={0.2} text="USGS geologist Rick Hoblitt in the field · spring 1980" credit={USGS} /></>));
sh(S('b3_03') - 0.1, (p) => (<><Film {...p} src="c7_field.mp4" /><Label t={p.t} at={0.3} text="A USGS field crew near the volcano · spring 1980" credit={USGS} /></>));
sh(S('b3_04') - 0.1, (p) => (<><Photo {...p} src="view-north-mount-st-helens-eruption-and-first-crater.jpg" s0={1.0} s1={1.06} /><Label t={p.t} at={0.3} text="The summit crater and the upper north side from the air · spring 1980" credit="Photo: David Frank, USGS" /></>));

// ===================== 4 — WHO COULD BE NEAR THE MOUNTAIN
sh(S('b4_01') - 0.3, (p) => <Doc {...p} src="pp1249-047.jpg" aspect={0.7708} box={[0.332, 0.2312, 0.6058, 0.3332]} zoomAt={1.0} zoom={2.6} />);
sh(S('b4_02') - 0.1, (p) => <Card t={p.t} top="HARRY R. TRUMAN, 83" quote="Owner of the Mount St. Helens Lodge at Spirit Lake. He refused to leave." src="USGS Professional Paper 1249 · no public-domain photograph is available" qat={0.4} />);
sh(S('b4_03') - 0.2, (p) => <Doc {...p} src="pp1249-053.jpg" aspect={0.7694} box={[0.6382, 0.6756, 0.9138, 0.8082]} zoomAt={0.8} zoom={2.8} />);

// ===================== 5 — THE LAST EVENING AND THE MORNING
sh(S('b5_01') - 0.3, (p) => { const o = S('b5_01') - 0.3; return <ReliefMap {...p} a={POSA} b={POSB} show={['positions']} ats={{ positions: 0.3, cw1: W('b5_02', 'Coldwater') - o, martin: W('b5_02', 'Gerry') - o, truman: 0.3 }} />; }, 0.4);
sh(S('b5_03') - 0.1, (p) => (<><Photo {...p} src="mount-st-helens-may-17-1980-one-day-devastating-er.jpg" s0={1.1} s1={1.16} fx={0.5} fy={0.4} /><Label t={p.t} at={0.3} text="The north face from Johnston's Ridge · photographed May 17, 1980" credit={GL} /></>));
sh(S('b5_04') - 0.2, (p) => <Card t={p.t} top="8:32:11 A.M." quote="Magnitude 5.1 earthquake" qat={0.4} />);
sh(S('b5_05') - 0.2, (p) => <Doc {...p} src="pp1249-007.jpg" aspect={0.7721} box={[0.3261, 0.7513, 0.9308, 0.8077]} zoomAt={0.6} zoom={2.3} />);

// ===================== 6 — HOW A MOUNTAIN EXPLODES SIDEWAYS (reconstruction, then the record)
const R0 = S('b6_01') - 0.2;
sh(R0, (p) => (<><Recon t={p.t} s={[W('b6_02', 'broke') - R0, W('b6_04', 'stripped') - R0, 999]} />{p.t > bite('cc_miller_uncork') - R0 && <Lower t={p.t} at={bite('cc_miller_uncork') - R0 + 0.2} name="Voice: Dan Miller, USGS geologist" role="USGS interview, 2010" />}</>), 0.4);
sh(S('b6_05') - 0.1, (p) => (<><Film {...p} src="a24_forest.mp4" /><Label t={p.t} at={0.3} text="Inside the blast zone, about a week later · May 24–26, 1980" credit={USGS} /></>));
sh(W('b6_06', 'Farther'), (p) => (<><Film {...p} src="a28_blowdown.mp4" /><Label t={p.t} at={0.3} text="Trees flattened in the direction of the blast · May 28, 1980" credit={USGS} /></>));
sh(W('b6_06', 'At'), (p) => (<><Film {...p} src="a28_forest.mp4" /><Label t={p.t} at={0.3} text="At the edge of the blast zone · May 28, 1980" credit={USGS} /></>));
sh(bite('cc_miller_scale'), (p) => (<><Photo {...p} src="nara_logging_equipment.jpg" s0={1.02} s1={1.08} /><Lower t={p.t} at={0.2} name="Voice: Dan Miller, USGS geologist" role="USGS interview, 2010 · photo: blown-down timber, June 1980, Walt Conner, FEMA (National Archives)" /></>));
sh(S('b6_07') - 0.2, (p) => <ReliefMap {...p} a={POSA} b={POSB} show={['positions', 'blast']} ats={{ positions: 0, cw1: 0, martin: 0, truman: 0, blast: 0.4 }} />, 0.3);
sh(S('b6_08') - 0.1, (p) => (<><Photo {...p} src="eruption-column-may-18-1980-mount-st-helens-eruption.jpg" s0={1.0} s1={1.06} fy={0.3} /><Label t={p.t} at={0.3} text="The eruption column, May 18, 1980" credit="Photo: Austin Post, USGS" /></>));
sh(W('b6_08', 'It'), (p) => (<><Film {...p} src="sw_col2.mp4" /><Label t={p.t} at={0.3} text="The vertical eruption, filmed by Don Swanson · May 18, 1980" credit={USGS} /></>));
sh(S('b6_09') - 0.1, (p) => (<><Photo {...p} src="mount-st-helens-may-17-1980-one-day-devastating-er.jpg" s0={1.0} s1={1.02} /><Label t={p.t} at={0.2} text="Before: May 17, 1980, from Johnston's Ridge" credit={GL} /></>));
sh(W('b6_09', 'In') - 0.1, (p) => (<><Photo {...p} src="mount-st-helens-soon-after-may-18-1980-eruption-0.jpg" s0={1.0} s1={1.04} /><Label t={p.t} at={0.2} text="After: soon after May 18, from the same ridge" credit={GL} /></>));
sh(S('b6_10') - 0.2, (p) => <Card t={p.t} quote="“…the magnitude of the catastrophic and unprecedented landslide and lateral blast of May 18 greatly exceeded our expectations.”" src="C. Dan Miller, Donal Mullineaux and Dwight Crandell, USGS Professional Paper 1250 (1981)" qat={0.2} />);

// ===================== 7 — THE REST OF THE DAY: MUD AND ASH
sh(S('b7_01') - 0.3, (p) => <ReliefMap {...p} a={MAPA} b={{ cx: 0.5, cy: 0.42, w: 0.95 }} show={['avalanche']} ats={{ avalanche: 0.4 }} />, 0.4);
sh(W('b7_01', 'fourteen') + 0.3, (p) => (<><Film {...p} src="a28_hummocks.mp4" /><Label t={p.t} at={0.3} text="The avalanche deposit in the North Fork Toutle valley · May 28, 1980" credit={USGS} /></>));
sh(S('b7_02') - 0.1, (p) => (<><Film {...p} src="a28_toutle.mp4" /><Label t={p.t} at={0.3} text="Mudflow deposits along the North Fork Toutle River · May 28, 1980" credit={USGS} /></>));
sh(W('b7_02', 'They'), (p) => (<><Photo {...p} src="muddy-river-bridge-destruction-may-18-1980-mount-st-helens.jpg" s0={1.0} s1={1.05} /><Label t={p.t} at={0.2} text="Where the Muddy River bridge stood, after the May 18 mudflows" credit="Photo: Lyn Topinka, USGS" /></>));
sh(W('b7_02', 'reached'), (p) => (<><Photo {...p} src="nara_mudflow_house_0527.jpg" s0={1.0} s1={1.05} /><Label t={p.t} at={0.2} text="A house hit by logs carried in a mudflow · May 27, 1980" credit="Photo: U.S. Army Corps of Engineers (National Archives)" /></>));
sh(S('b7_03') - 0.1, (p) => (<><Photo {...p} src="ash-may-18-1980-eruption-mount-st-helens-covering.jpg" s0={1.0} s1={1.05} /><Label t={p.t} at={0.3} text="Ash from May 18 on a farm in Connell, Washington, about 180 miles east" credit="Photo: USGS" /></>));

// ===================== 8 — PEOPLE
sh(S('b8_01') - 0.3, (p) => <Card t={p.t} top="57" quote="people died" qat={0.5} />);
sh(S('b8_02') - 0.1, (p) => <ReliefMap {...p} a={POSA} b={POSB} show={['positions']} ats={{ positions: 0, cw1: 0, martin: 0, truman: 0 }} />, 0.3);
sh(W('b8_02', 'Reid') - 0.1, (p) => (<><Photo {...p} src="nara_blackburn_car_0611.jpg" s0={1.0} s1={1.05} /><Label t={p.t} at={0.3} text="Reid Blackburn's car at Coldwater I, June 1980; Sandia Laboratory staff recover one of his remote cameras" credit="Photo: Walt Conner, FEMA (National Archives)" /></>));
sh(W('b8_02', 'Harry') - 0.1, (p) => (<><Photo {...p} src="spirit-lake-and-devastated-forest-area-surrounding-mount-st-he.jpg" s0={1.0} s1={1.05} /><Label t={p.t} at={0.3} text="Spirit Lake after the eruption, covered with logs" credit="Photo: USGS" /></>));
sh(bite('cc_swanson_plane'), (p) => (<><Film {...p} src="cc_swanson_plane.mov" from={PRE} /><Lower t={p.t} at={0.2} name="Voice: Don Swanson, USGS geologist" role="Flying near the volcano that morning · USGS interview, 2010 · USGS photos of May 18" /></>));
sh(S('b8_03') - 0.1, (p) => (<><Film {...p} src="a24_blowdown.mp4" /><Label t={p.t} at={0.3} text="Blown-down forest north of the volcano · May 24–26, 1980" credit={USGS} /></>));
sh(W('b8_03', 'They'), (p) => <Card t={p.t} top="MIKE AND LU MOORE" quote="Camping about 13 miles north with their two daughters. They walked out through the ash and were lifted out by helicopter." src="USGS Professional Paper 1250; press interviews" qat={0.3} />);
sh(S('b8_04') - 0.1, (p) => (<><Photo {...p} src="nara_heli_blowdown.jpg" s0={1.0} s1={1.06} fy={0.4} /><Label t={p.t} at={0.3} text="An Air Force Reserve rescue helicopter over the destroyed forest, days after May 18" credit="Photo: MSgt Robert Leach, U.S. Air Force (National Archives)" /></>));
sh(S('b8_05') - 0.1, (p) => (<><Photo {...p} src="nara_heli_rescue_road.jpg" s0={1.0} s1={1.06} /><Label t={p.t} at={0.3} text="A 304th Rescue Squadron helicopter over a ruined road during rescue operations" credit="Photo: MSgt Robert Leach, U.S. Air Force (National Archives)" /></>));
sh(W('b8_05', 'Air'), (p) => (<><Film {...p} src="a24_heli.mp4" /><Label t={p.t} at={0.2} text="Helicopters at a staging area near the volcano · May 1980" credit={USGS} /></>));
sh(S('b8_06') - 0.1, (p) => (<><Photo {...p} src="nara_search_landing_0528.jpg" s0={1.0} s1={1.05} /><Label t={p.t} at={0.3} text="The search for the missing: a helicopter landing in the ash · May 28, 1980 (print with its original caption)" credit="U.S. Forest Service collection (National Archives)" /></>));
sh(bite('cc_miller_dave'), (p) => (<><Photo {...p} src="nara_search_pilot_0528.jpg" s0={1.0} s1={1.05} /><Lower t={p.t} at={0.3} name="Voice: Dan Miller, USGS geologist" role="USGS interview, 2010 · photo: Army search flight, May 28, 1980 (National Archives)" /></>));
sh(bite('cc_miller_dave', 12.6), (p) => (<><Film {...p} src="cc_miller_dave.mov" from={PRE + 12.6} /></>));

// ===================== 9 — AFTER
sh(S('b9_01') - 0.3, (p) => (<><Film {...p} src="a28_sci.mp4" /><Label t={p.t} at={0.3} text="USGS scientists in the blast zone · May 28, 1980" credit={USGS} /></>));
sh(bite('cc_miller_swarm', 3.5), (p) => (<><Film {...p} src="a24_steam.mp4" /><Lower t={p.t} at={0.2} name="Voice: Dan Miller, USGS geologist" role="USGS interview, 2010 · film: steaming deposits, May 24–26, 1980" /></>));
sh(S('b9_02') - 0.1, (p) => (<><Film {...p} src="a28_lake.mp4" /><Label t={p.t} at={0.3} text="Spirit Lake, covered with logs · May 28, 1980" credit={USGS} /></>));
sh(W('b9_02', 'Where'), (p) => (<><Film {...p} src="a24_phreatic.mp4" /><Label t={p.t} at={0.3} text="Steam explosions in the hot deposits · May 24–26, 1980" credit={USGS} /></>));
sh(S('b9_03') - 0.1, (p) => (<><Film {...p} src="a24_camera.mp4" /><Label t={p.t} at={0.3} text="A new USGS camera station in the blast zone · May 1980" credit={USGS} /></>));
sh(bite('cc_miller_forecast'), (p) => (<><Film {...p} src="cc_miller_forecast.mov" from={PRE} /><Lower t={p.t} at={0.3} name="Voice: Dan Miller, USGS geologist" role="USGS interview, 2010 · USGS photos of later field work" /></>));
sh(S('b9_04') - 0.1, (p) => (<><Photo {...p} src="nara_heli_crater.jpg" s0={1.0} s1={1.05} /><Label t={p.t} at={0.3} text="The new crater, days after May 18, 1980" credit="Photo: MSgt Robert Leach, U.S. Air Force (National Archives)" /></>));
sh(S('b9_05') - 0.1, (p) => (<><Film {...p} src="a28_logs.mp4" /><Label t={p.t} at={0.3} text="Logs carried by the mudflows · May 28, 1980" credit={USGS} /></>));
sh(S('b9_06') - 0.1, (p) => (<><Photo {...p} src="pinatubo_1991-06-12.jpg" s0={1.0} s1={1.06} /><Label t={p.t} at={0.3} text="Mount Pinatubo, Philippines · eruption column of June 12, 1991, seen from Clark Air Base" credit="Photo: USGS" /></>));
sh(bite('cc_banks_learned'), (p) => (<><Film {...p} src="cc_banks_learned.mov" from={PRE} /><Label t={p.t} at={0.3} text="Norm Banks, USGS · interview, 2010" right /></>));
sh(S('b9_07') - 0.1, (p) => (<><Photo {...p} src="evening-view-mount-st-helens-johnston-ridge-observatory-jro.jpg" s0={1.0} s1={1.07} /><Label t={p.t} at={0.6} text="Mount St. Helens from the Johnston Ridge Observatory" credit="Photo: John Pallister, USGS" /></>));
sh(W('b9_07', 'From') - 0.1, (p) => (<><Photo {...p} src="johnston_coldwater2_1980-05-17.jpg" s0={1.12} s1={1.2} fx={0.72} fy={0.4} /><Label t={p.t} at={0.4} text="David A. Johnston, Coldwater II, May 17, 1980" credit={GL} /></>), 0.6);
sh(E.end.at, (p) => (<AbsoluteFill style={{ background: BG, alignItems: 'center', justifyContent: 'center' }}>
  <div style={{ fontFamily: DISPLAY, fontSize: 104, color: INK, letterSpacing: 4, opacity: pe(p.t, 0.3, 0.8) }}>KNOWN IN ADVANCE</div>
  <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 30, color: 'rgba(242,239,233,0.8)', marginTop: 30, textAlign: 'center', lineHeight: 1.5, opacity: pe(p.t, 1.2, 0.8) }}>Archive: U.S. Geological Survey · National Archives (USAF, U.S. Forest Service, FEMA, USACE)<br />Narration: AI voice · Music: Mixkit · Full sources in the description</div>
</AbsoluteFill>), 0.6);

shots.sort((a, b) => a.at - b.at);
export const FILM_DUR = T.duration as number;
const ShotV: React.FC<{ s: Shot; dur: number }> = ({ s, dur }) => {
  const t = useCurrentFrame() / FPS;
  return <AbsoluteFill style={{ opacity: s.fade ? pe(t, 0, s.fade) : 1 }}>{s.el({ t, dur })}</AbsoluteFill>;
};
export const FullFilm: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
    {shots.map((s, i) => {
      const end = i + 1 < shots.length ? shots[i + 1].at + (shots[i + 1].fade ?? 0) : FILM_DUR;
      const from = Math.round(s.at * FPS), to = Math.round(end * FPS);
      return <Sequence key={i} from={from} durationInFrames={Math.max(1, to - from)}><ShotV s={s} dur={end - s.at} /></Sequence>;
    })}
    <Audio src={staticFile('audio/film_mix.wav')} />
  </AbsoluteFill>
);
