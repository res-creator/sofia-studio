// The full episode (~12:50): cold open (the approved Todd test segment, unchanged) + 10 chapters.
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate, Easing } from 'remotion';
import TL from '../data/timeline.json';
import T from '../data/full.json';
import { C } from '../lib';
import { Main } from '../Main';
import { CollageShot } from './kit';
import { SP, ChapterCard, TextCard, NumberCard, ChipsCard, TimelineCard, FlowCard, WordsCard, NamesCard, PhotoShot, PrintShot, MapShot, GraphCard, HeightsCard, TANK } from './kit';
import { TankDiagram, SteelCard, RivetCrack, RadarCard, ModelCard, CrestCard } from './tank';

const FPS = 30;
const LN = T.lines as Record<string, { s: number; e: number; ch: string; words: number[] }>;
const L = (id: string) => LN[id].s;
const E = (id: string) => LN[id].e;
const WORDS = T.words as { w: string; s: number; line: string }[];
// start time of the first word in line `id` that starts with `w` (case/punctuation-insensitive)
const W = (id: string, w: string, nth = 0) => {
  const norm = (x: string) => x.toLowerCase().replace(/[^a-z0-9$']/g, '');
  const hits = WORDS.filter((x) => x.line === id && norm(x.w).startsWith(norm(w)));
  if (!hits[nth]) throw new Error(`cue not found: ${id} / ${w}`);
  return hits[nth].s;
};
const CH = Object.fromEntries(T.chapters.map((c: any) => [c.id, c]));

// ---- photos (all public domain, see sources.txt)
const SRC = {
  pano: 'Photo: Boston Public Library (Globe Newspaper Co.), Jan. 15, 1919 · Public domain',
  el: 'Photo: photographer unknown, 1919, via Wikimedia Commons · Public domain',
  cba: 'Photo: Boston Elevated Railway Co., January 1919 · City of Boston Archives · Public domain',
  under: 'Photo: photographer unknown, 1919, via Wikimedia Commons · Public domain',
  tank: 'Photo: The Bostonian Society, via Wikimedia Commons · Public domain',
  post: 'The Boston Post, January 16, 1919 · via Wikimedia Commons · Public domain',
  rc: 'Photo: American Red Cross, January 1919 · Library of Congress · No known restrictions',
  amb: 'Photo: photographer unknown, 1919, via Wikimedia Commons · Public domain',
  globe: 'The Boston Daily Globe, January 16, 1919 · via Wikimedia Commons · Public domain',
  nyt: 'The New York Times, January 16, 1919 · via Wikimedia Commons · Public domain',
  det: 'Photo: Detroit Publishing Co., c. 1906 · Library of Congress · Public domain',
};
// Ken Burns that frames point (px,py) of the cover-fitted image, scale s0->s1
// (object-fit: cover clips the image to the frame, so the pan is clamped to keep the frame filled)
const cl = (v: number, s: number) => Math.max(-50 * (s - 1), Math.min(50 * (s - 1), v));
const kb = (px: number, py: number, s0: number, s1: number, dx = 0, dy = 0) => ({
  s0, s1, x0: cl((-(px - 960) * s0) / 19.2, s0), x1: cl((-(px - 960) * s1) / 19.2 + dx, s1), y0: cl((-(py - 540) * s0) / 10.8, s0), y1: cl((-(py - 540) * s1) / 10.8 + dy, s1),
});
const POST = { src: 'boston_post.jpg', srcW: 1127, srcH: 1435 };
const TANKP = { src: 'tank_before.jpg', srcW: 417, srcH: 327 };
const GLOBE = { src: 'globe.jpg', srcW: 1920, srcH: 2880 };
const NYT = { src: 'nyt.jpg', srcW: 295, srcH: 930 };
const AMB = { src: 'ambulance.jpg', srcW: 588, srcH: 439 };
// faint drifting photo behind text cards
const wash = (src: string, x = -1, y = 0, o = 0.2) => ({ src, x, y, o });

type Shot = { at: number; fade?: number; el: (p: SP) => React.ReactNode; full?: boolean };
const s = (at: number, el: Shot['el'], fade = 0.3): Shot => ({ at, el, fade });
// full-frame picture (photo / map): two of these in a row crossfade, everything else uses a "push" transition
const ph = (at: number, el: Shot['el']): Shot => ({ at, el, fade: 0.4, full: true });
const first = (cid: string) => CH[cid].vo - 0.25;

const SHOTS: Shot[] = [
  // ===================== CHAPTER 1 — A TANK BY THE HARBOR
  ph(first('c1'), (p) => <MapShot {...p} keys={[[0, -71.06, 42.36, 60], [p.dur, -71.0565, 42.3655, 4.4]]} texts={[{ lon: -71.046, lat: 42.3625, text: 'Boston Harbor', at: L('c1_01') + 2.5, size: 30 }]} />),
  s(L('c1_02'), (p) => <NumberCard {...p} kicker="Built" value="1915" sub="by the Purity Distilling Company" subAt={W('c1_02', 'Purity')} />),
  ph(W('c1_02', '529') - 0.3, (p) => <MapShot {...p} keys={[[0, TANK.lon + 0.001, TANK.lat - 0.001, 3.2], [p.dur, TANK.lon + 0.001, TANK.lat - 0.001, 2.6]]} markers={[{ lon: TANK.lon, lat: TANK.lat, label: '529 Commercial Street', sub: 'NORTH END', at: W('c1_02', '529') }]} />),
  ph(L('c1_03'), (p) => <PhotoShot {...p} src="waterfront.jpg" intro="wipe" kb={kb(960, 600, 1.06, 1.18, -2, 0)} text="Boston’s waterfront, c. 1906: ships tied up right at the wharves" source={SRC.det} />),
  s(W('c1_03', 'unload') - 0.2, (p) => <FlowCard {...p} kicker="How the molasses moved" steps={[{ text: 'Ship', sub: 'at the pier', at: W('c1_03', 'unload') }, { text: 'Tank', sub: 'Commercial Street', at: W('c1_03', 'pump') }]} tag="Diagram" />),
  ph(L('c1_04'), (p) => <MapShot {...p} keys={[[0, TANK.lon - 0.004, TANK.lat - 0.001, 4.2], [p.dur, TANK.lon - 0.005, TANK.lat - 0.001, 3.8]]} markers={[{ lon: TANK.lon, lat: TANK.lat, label: 'Tank', at: L('c1_04') }]} west={{ at: W('c1_04', 'pipe'), label: 'pipe to Purity’s plant in Cambridge (route not shown)' }} />),
  s(L('c1_05'), (p) => <FlowCard {...p} steps={[{ text: 'Molasses', at: L('c1_05') + 0.2 }, { text: 'Fermented', at: W('c1_05', 'fermented') }, { text: 'Ethanol', at: W('c1_05', 'ethanol') }]} tag="Diagram" />),
  s(L('c1_06'), (p) => <FlowCard {...p} branch steps={[{ text: 'Ethanol', at: L('c1_06') }, { text: 'Alcoholic drinks', at: W('c1_06', 'drinks') - 0.2 }, { text: 'Munitions', at: W('c1_06', 'munitions') - 0.2 }]} tag="Diagram" />),
  s(L('c1_07'), (p) => <TextCard {...p} kicker="The First World War" lines={[{ text: 'Munitions were very good business.', at: W('c1_07', 'munitions') }]} wash={wash('east_boston.jpg')} />),
  s(L('c1_08'), (p) => <TimelineCard {...p} items={[{ top: '1915', label: 'Purity Distilling builds the tank', at: L('c1_08') + 0.1 }, { top: '1917', label: 'Bought by United States Industrial Alcohol (USIA)', at: W('c1_08', '1917'), hi: true }]} />),
  s(L('c1_09'), (p) => <TextCard {...p} kicker="The owner" lines={[{ text: 'United States Industrial Alcohol', at: L('c1_09') + 0.1 }, { text: 'The Commercial Street tank: part of a national operation', at: W('c1_09', 'national') }]} wash={wash('waterfront.jpg', 1)} />),
  s(L('c1_10'), (p) => <TextCard {...p} kicker="The man responsible" lines={[{ text: 'Not an engineer.', at: W('c1_10', 'not') }]} wash={wash('tank_before.jpg', 0, -1, 0.16)} />),
  ph(L('c1_11'), (p) => <MapShot {...p} keys={[[0, TANK.lon + 0.003, TANK.lat - 0.001, 3.0], [p.dur, TANK.lon + 0.002, TANK.lat - 0.0005, 2.4]]} texts={[{ lon: TANK.lon + 0.0045, lat: TANK.lat + 0.0012, text: 'harbor & piers', at: W('c1_11', 'harbor'), size: 30 }]} commercial={W('c1_11', 'Picture')} markers={[{ lon: TANK.lon, lat: TANK.lat, label: 'Tank', at: L('c1_11') + 0.3 }]} />),
  s(W('c1_11', 'Overhead'), (p) => <PrintShot {...p} {...TANKP} w={1060} text="Commercial Street before 1919: the elevated railway on the left, the molasses tank on the right." source={SRC.tank} />),
  s(L('c1_12'), (p) => <PrintShot {...p} {...POST} crop={[300, 430, 520, 300]} w={1500} text="Labels from the Boston Post, Jan. 16, 1919: the elevated structure, where the tank stood, the Engine 31 firehouse." source={SRC.post} />),
  s(L('c1_13'), (p) => <TankDiagram {...p} mode="outline" at={L('c1_13')} title="A fifty-foot wall of steel" />),

  // ===================== CHAPTER 2 — BUILT IN A HURRY
  s(first('c2'), (p) => <TextCard {...p} kicker="In charge of the tank" lines={[{ text: 'Arthur Jell', at: W('c2_01', 'Arthur') }, { text: 'USIA treasurer (some sources: assistant treasurer)', at: W('c2_01', 'treasurer') }]} />),
  s(L('c2_02'), (p) => <ChipsCard {...p} kicker="Arthur Jell" chips={[{ text: 'Oversaw construction', at: W('c2_02', 'oversaw') }, { text: 'Architecture background', at: W('c2_02', 'architecture'), x: true }, { text: 'Engineering background', at: W('c2_02', 'engineering'), x: true }]} />),
  s(L('c2_03'), (p) => <TextCard {...p} kicker="A financial man" lines={[{ text: 'In charge of a tank for millions of gallons', at: W('c2_03', 'construction') }]} />),
  s(L('c2_04'), (p) => <TextCard {...p} kicker="Investigators, later" lines={[{ text: 'Poorly built.', at: W('c2_04', 'poorly') }, { text: 'Not tested enough.', at: W('c2_04', 'tested'), size: 84, weight: 800, color: C.amber }]} />),
  s(L('c2_05'), (p) => <TankDiagram {...p} mode="test" at={W('c2_06', 'fill')} at2={E('c2_06') + 0.4} title="The normal step: a water test" sub="fill it with water, watch for leaks" subAt={L('c2_06')} />),
  s(L('c2_08'), (p) => <TankDiagram {...p} mode="leak" at={W('c2_08', 'leaking')} title="1915: leaking from the first filling" titleAt={W('c2_08', 'leaking')} />),
  s(L('c2_09'), (p) => <PrintShot {...p} {...TANKP} crop={[200, 70, 217, 150]} w={1100} zoom={0.06} text="The tank, before 1919" source={SRC.tank} />),
  s(L('c2_10'), (p) => <TankDiagram {...p} mode="leak" at={L('c2_10')} title="Through the seams, down the sides" />),
  s(L('c2_11'), (p) => <TankDiagram {...p} mode="pail" at={W('c2_11', 'brought')} title="Neighbors collected the leaking molasses" titleAt={W('c2_11', 'brought')} tag="Illustration" />),
  s(L('c2_12'), (p) => <TankDiagram {...p} mode="paint" at={W('c2_12', 'paint')} title="The answer: paint it brown" titleAt={W('c2_12', 'paint')} tag="Illustration" />),
  s(L('c2_13'), (p) => <TextCard {...p} lines={[{ text: 'Brown, like molasses.', at: L('c2_13') }, { text: 'So the streaks would be harder to see.', at: W('c2_13', 'So') }]} />),
  s(L('c2_14'), (p) => <TankDiagram {...p} mode="noise" at={W('c2_14', 'noises')} title="Other warnings: noises" labels={[{ text: 'groaning', at: W('c2_14', 'Groaning') }, { text: 'rumbling', at: W('c2_14', 'rumbling') }]} tag="Illustration" />),
  s(L('c2_15'), (p) => <WordsCard {...p} words={[{ text: 'Warnings', at: L('c2_15') }, { text: 'ignored.', at: W('c2_15', 'ignored'), amber: true }]} />),
  s(L('c2_16'), (p) => <TextCard {...p} lines={[{ text: 'Jell heard about the noises.', at: L('c2_16') }, { text: 'The tank stayed in service.', at: W('c2_16', 'tank'), size: 84, weight: 800, color: C.amber }]} wash={wash('tank_before.jpg', 1, 0, 0.16)} />),
  s(L('c2_17'), (p) => <TankDiagram {...p} mode="fill" level={0.9} at={L('c2_17') - 1} at2={L('c2_17')} title="Pressure to keep it full" />),
  s(L('c2_18'), (p) => <PrintShot {...p} {...GLOBE} crop={[10, 1545, 550, 400]} w={1050} pan={[0, 10]} text="The Boston Daily Globe, January 16, 1919: “One more state to make country dry”" source={SRC.globe} />),
  s(W('c2_18', 'ratified') - 0.3, (p) => <TimelineCard {...p} kicker="Prohibition is coming" items={[{ top: 'Jan 15, 1919', label: 'the disaster', at: W('c2_18', 'ratified') - 0.2 }, { top: 'Jan 16, 1919', label: 'the amendment banning alcohol is ratified', at: W('c2_18', 'sixteenth'), hi: true }]} />),
  s(L('c2_19'), (p) => <TextCard {...p} kicker="Several historians argue" lines={[{ text: 'A rush to produce before the law took effect', at: W('c2_19', 'rushing') }]} wash={wash('waterfront.jpg')} />),
  s(L('c2_20'), (p) => <TimelineCard {...p} items={[{ top: '1919', label: 'amendment ratified', at: L('c2_20') }, { top: '1920', label: 'the ban begins, one year later', at: W('c2_20', 'year'), hi: true }]} />),
  s(L('c2_21'), (p) => <NumberCard {...p} kicker="Filled to capacity" value="8" unit="times" ticks={{ n: 8, at: W('c2_21', 'filled') }} label="in its whole life" />),
  s(L('c2_22'), (p) => <TankDiagram {...p} mode="fill" at={L('c2_22')} at2={W('c2_22', 'gallons')} count={{ to: 2000000, at: W('c2_22', 'more'), label: '+ gallons · January 15, 1919' }} title="January 15, 1919" />),

  // ===================== CHAPTER 3 — THE WARM DAY
  s(first('c3'), (p) => <GraphCard {...p} kicker="Boston, January 1919 · schematic" xl="days →" yl="°F" pts={[[0, 0.06], [0.15, 0.04], [0.3, 0.07], [0.45, 0.05], [0.6, 0.06]]} at={L('c3_01')} d={2} labels={[{ i: 3, text: '≈ 2°F', at: W('c3_02', 'two') }]} color={C.blue} tag="Schematic" />),
  s(L('c3_03'), (p) => <GraphCard {...p} kicker="Then the weather turned · schematic" xl="days →" yl="°F" pts={[[0, 0.06], [0.15, 0.04], [0.3, 0.07], [0.45, 0.05], [0.6, 0.06], [0.7, 0.25], [0.8, 0.55], [0.9, 0.82], [1, 0.86]]} at={L('c3_03') - 0.5} d={2.5} labels={[{ i: 3, text: '≈ 2°F', at: L('c3_03') }, { i: 8, text: '> 40°F', at: W('c3_03', 'forty') }]} tag="Schematic" />),
  s(L('c3_04'), (p) => <TextCard {...p} kicker="January 15, 1919 · above 40°F" lines={[{ text: 'It felt almost like spring.', at: W('c3_04', 'felt') }]} wash={wash('waterfront.jpg', 1, 0, 0.24)} />),
  ph(L('c3_05'), (p) => <PhotoShot {...p} src="east_boston.jpg" intro="zoom" kb={kb(1100, 520, 1.08, 1.2, -2, 0)} text="Ships in Boston Harbor, c. 1906. The day before the flood, a ship delivered a fresh load of molasses." source={SRC.det} />),
  s(L('c3_06'), (p) => <TankDiagram {...p} mode="warm" at={L('c3_06')} title="Warmed, to flow more easily" labels={[{ text: '', at: 0 }, { text: 'warm molasses', at: W('c3_06', 'warmed') }]} tag="Illustration" />),
  s(L('c3_07'), (p) => <TankDiagram {...p} mode="warm" at={L('c3_07') - 1.6} title="Warm into cold" labels={[{ text: 'colder molasses', at: W('c3_07', 'colder') }, { text: 'warm molasses', at: L('c3_07') }, { text: 'outside: suddenly mild', at: W('c3_07', 'mild') }]} tag="Illustration" />),
  s(L('c3_08'), (p) => <TankDiagram {...p} mode="expand" at={W('c3_08', 'expansion')} title="Expansion inside the tank" sub="some researchers believe it added to the strain" subAt={W('c3_08', 'added')} tag="Illustration" />),
  s(L('c3_09'), (p) => <TankDiagram {...p} mode="level" at={W('c3_09', 'Not')} title="Liquids take up more space when warm" sub="in a tank of 2 million+ gallons, a little is a lot" subAt={W('c3_09', 'But')} tag="Illustration" />),
  s(L('c3_10'), (p) => <ChipsCard {...p} kicker="Already" chips={[{ text: 'leaking', at: W('c3_10', 'leaking') }, { text: 'groaning', at: W('c3_10', 'groaning') }, { text: 'steel never strong enough', at: W('c3_10', 'never') }]} />),

  // ===================== CHAPTER 4 — TWELVE THIRTY
  s(first('c4'), (p) => <NumberCard {...p} kicker="January 15, 1919" value="12:30" unit="p.m." sub="Commercial Street" subAt={W('c4_01', 'Commercial')} />),
  ph(L('c4_02'), (p) => <PhotoShot {...p} src="cba_052.jpg" kb={kb(960, 560, 1.05, 1.12)} text="The tracks of the elevated railway, bent by the flood" source={SRC.cba} />),
  s(L('c4_03'), (p) => <WordsCard {...p} words={[{ text: 'A crash.', at: W('c4_03', 'crash') }, { text: 'A growl.', at: W('c4_03', 'growl') }, { text: 'A bang like thunder.', at: W('c4_03', 'bang'), amber: true }]} size={100} slam />),
  s(L('c4_04'), (p) => <TankDiagram {...p} mode="rivets" at={W('c4_04', 'popping')} title="Rivets shooting out of the steel" titleAt={W('c4_04', 'rivets')} tag="Illustration" />),
  s(L('c4_05'), (p) => <TankDiagram {...p} mode="burst" at={L('c4_05')} at2={W('c4_05', 'came')} level={0.9} title="More than two million gallons, at once" titleAt={W('c4_05', 'more')} tag="Illustration" />),
  s(L('c4_06'), (p) => <HeightsCard {...p} bars={[{ ft: 25, label: '~25 ft', sub: 'most cited', at: W('c4_06', 'twenty'), hi: true }, { ft: 15, label: '15 ft', sub: 'some accounts', at: W('c4_06', 'fifteen') }, { ft: 40, label: '40 ft', sub: 'memorial plaque', at: W('c4_06', 'forty') }]} />),
  s(L('c4_07'), (p) => <NumberCard {...p} kicker="Speed of the wave · estimate" value="~35" unit="mph" />),
  ph(L('c4_08'), (p) => <PhotoShot {...p} src="el_structure.jpg" kb={kb(700, 500, 1.04, 1.12)} text="The elevated railway on Atlantic Avenue: its steel frame bent and torn." source={SRC.el} arrows={[{ px: 330, py: 420, dx: 170, dy: 150, at: W('c4_08', 'structure'), label: 'Bent girder' }]} />),
  ph(L('c4_09'), (p) => <PhotoShot {...p} src="cba_031.jpg" kb={kb(700, 520, 1.05, 1.11)} text="A streetcar under the elevated tracks, after the flood" source={SRC.cba} arrows={[{ px: 240, py: 470, dx: 160, dy: -150, at: L('c4_09') + 0.3, label: 'Streetcar' }]} />),
  ph(L('c4_10'), (p) => <CollageShot {...p} panels={[{ src: 'panorama.jpg', at: L('c4_10') - 0.2 }, { src: 'cba_051.jpg', at: L('c4_10') + 0.1 }, { src: 'redcross.jpg', at: L('c4_10') + 0.4 }]} expand={W('c4_10', 'truck')} text="Buildings off their foundations, wreckage across the site, January 1919" source="Photos: Boston Public Library; City of Boston Archives; American Red Cross / Library of Congress · Public domain" />),
  ph(L('c4_11'), (p) => <MapShot {...p} keys={[[0, TANK.lon + 0.0004, TANK.lat - 0.0012, 2.0], [p.dur, TANK.lon + 0.0004, TANK.lat - 0.0012, 1.8]]} wave={{ at: L('c4_11') - 1.0, d: 0.1, r: 0.36 }} note={{ text: 'Several blocks flooded 2–3 feet deep', at: W('c4_11', 'flooded') }} tag="Reconstruction · illustrative extent" />),
  s(L('c4_12'), (p) => <TextCard {...p} kicker="Walking home from school" lines={[{ text: 'Anthony di Stasio', at: W('c4_12', 'Anthony') }]} />),
  s(L('c4_13'), (p) => <CrestCard {...p} at={W('c4_13', 'picked')} under={W('c4_13', 'rolled')} survived={L('c4_14')} />),
  s(L('c4_15'), (p) => <TextCard {...p} lines={[{ text: 'What made it so deadly', at: W('c4_15', 'deadly') }]} wash={wash('under_el.jpg', 1, 0, 0.22)} />),
  s(L('c4_16'), (p) => <GraphCard {...p} kicker="As it cooled, it thickened · illustrative" xl="time after the burst →" yl="thickness" pts={[[0, 0.15], [0.2, 0.22], [0.4, 0.38], [0.6, 0.58], [0.8, 0.78], [1, 0.9]]} at={L('c4_16')} d={2.6} tag="Illustration" />),
  ph(L('c4_17'), (p) => <PhotoShot {...p} src="under_el.jpg" intro="3d" kb={kb(900, 640, 1.06, 1.14)} text="Rescuers in the molasses under the elevated tracks" source={SRC.under} />),
  s(L('c4_18'), (p) => <TextCard {...p} lines={[{ text: 'Molasses on a cold morning', at: L('c4_18') + 0.2 }]} wash={wash('cba_023.jpg', -1, 0, 0.2)} />),
  s(L('c4_19'), (p) => <WordsCard {...p} words={[{ text: 'Thick.', at: L('c4_19') }, { text: 'Slow.', at: W('c4_19', 'Slow') }, { text: 'Almost solid.', at: W('c4_19', 'Almost'), amber: true }]} />),
  ph(L('c4_20'), (p) => <MapShot {...p} keys={[[0, TANK.lon + 0.0004, TANK.lat - 0.0012, 2.1], [p.dur, TANK.lon + 0.0004, TANK.lat - 0.0012, 1.9]]} wave={{ at: L('c4_20'), d: 3.5, r: 0.36 }} note={{ text: 'Warm and fast out of the tank', at: W('c4_20', 'warm') }} tag="Reconstruction · illustrative extent" />),
  s(L('c4_21'), (p) => <GraphCard {...p} kicker="January air: cooling as it slowed · illustrative" xl="time →" yl="temperature" pts={[[0, 0.85], [0.2, 0.7], [0.4, 0.52], [0.6, 0.38], [0.8, 0.28], [1, 0.22]]} at={L('c4_21') + 0.3} d={3} color={C.blue} tag="Illustration" />),
  s(L('c4_22'), (p) => <WordsCard {...p} words={[{ text: 'Cooler.', at: L('c4_22') }, { text: 'Thicker.', at: W('c4_22', 'thicker'), amber: true }]} />),
  s(L('c4_23'), (p) => <TextCard {...p} kicker="Within minutes" lines={[{ text: 'A fast-moving wave…', at: W('c4_23', 'fast') }, { text: 'closer to wet cement', at: W('c4_23', 'closer'), size: 84, weight: 800, color: C.amber }]} wash={wash('cba_052.jpg', 1, 0, 0.2)} />),

  // ===================== CHAPTER 5 — THE RESCUE
  ph(first('c5'), (p) => <MapShot {...p} keys={[[0, TANK.lon + 0.002, TANK.lat - 0.0005, 3.4], [p.dur, TANK.lon + 0.002, TANK.lat - 0.0005, 2.8]]} markers={[{ lon: TANK.lon, lat: TANK.lat, label: 'Tank site', at: L('c5_01') }]} note={{ text: 'USS Nantucket, a training ship of the Massachusetts Nautical School, docked nearby', at: W('c5_02', 'training') }} />),
  s(L('c5_03'), (p) => <NumberCard {...p} kicker="First on the scene" value="116" label="cadets" sub="led by Lt. Cmdr. H. J. Copeland" subAt={W('c5_03', 'Lieutenant')} />),
  ph(L('c5_04'), (p) => <PhotoShot {...p} src="under_el.jpg" kb={kb(1300, 560, 1.15, 1.24)} text="Wading into the molasses" source={SRC.under} />),
  ph(L('c5_05'), (p) => <PhotoShot {...p} src="redcross.jpg" intro="iris" kb={kb(760, 560, 1.06, 1.22, 2, -1)} text="Ambulances, trucks and rescuers on Commercial Street, January 1919" source={SRC.rc} />),
  s(L('c5_06'), (p) => <PrintShot {...p} {...AMB} w={1000} text="A Red Cross ambulance under the elevated tracks, 1919" source={SRC.amb} />),
  s(L('c5_07'), (p) => <TextCard {...p} lines={[{ text: 'A makeshift hospital', at: W('c5_07', 'makeshift') }, { text: 'set up nearby', at: W('c5_07', 'nearby') }]} wash={wash('redcross.jpg', 1, 0, 0.22)} />),
  s(L('c5_08'), (p) => <TextCard {...p} kicker="Doctors saw it again and again" lines={[{ text: 'Coughing', at: W('c5_08', 'coughing') }, { text: 'people had breathed in the molasses', at: W('c5_08', 'breathed') }]} wash={wash('cba_023.jpg', -1, 0, 0.2)} />),
  s(L('c5_09'), (p) => <NumberCard {...p} kicker="The search" value="4" unit="days" wash={wash('cba_054.jpg', 1, 0, 0.2)} />),
  ph(L('c5_10'), (p) => <PhotoShot {...p} src="panorama.jpg" kb={kb(900, 520, 1.2, 1.3)} text="Searchers on the flooded site" source={SRC.pano} />),
  ph(L('c5_11'), (p) => <MapShot {...p} keys={[[0, TANK.lon + 0.004, TANK.lat - 0.0005, 4.0], [p.dur, TANK.lon + 0.005, TANK.lat - 0.0005, 4.6]]} texts={[{ lon: TANK.lon + 0.007, lat: TANK.lat + 0.0005, text: 'Boston Harbor', at: L('c5_11'), size: 30 }]} note={{ text: 'Some victims were found 3–4 months later', at: W('c5_11', 'found') }} />),
  s(L('c5_12'), (p) => <ChipsCard {...p} wash={wash('panorama.jpg', -1, 0, 0.18)} title="21 people died" chips={[{ text: 'workers', at: W('c5_13', 'workers') }, { text: 'drivers', at: W('c5_13', 'drivers') }, { text: 'firefighters', at: W('c5_13', 'firefighters') }, { text: 'neighbors', at: W('c5_13', 'neighbors') }]} />),
  s(L('c5_14'), (p) => <NamesCard {...p} kicker="The youngest" names={[{ name: 'Maria Di Stasio', age: '10', at: W('c5_14', 'Maria') }, { name: 'Pasquale Iantosca', age: '10', at: W('c5_14', 'Pasquale') }]} wash={wash('cba_052.jpg', 1, 0, 0.18)} />),
  s(L('c5_15'), (p) => <NamesCard {...p} kicker="Firefighter" names={[{ name: 'George Layhe', at: W('c5_15', 'George') }]} wash={wash('under_el.jpg', -1, 0, 0.18)} />),
  s(L('c5_16'), (p) => <ChipsCard {...p} kicker="January 15, 1919" chips={[{ text: '21 dead', at: L('c5_16') }, { text: 'several horses', at: W('c5_16', 'horses') }, { text: '~150 injured', at: W('c5_16', 'hundred') }]} wash={wash('redcross.jpg', -1, 0, 0.18)} />),

  // ===================== CHAPTER 5B — THE NAMES
  s(first('c5b'), (p) => <PrintShot {...p} {...POST} crop={[560, 720, 280, 300]} w={760} text="The Boston Post’s first, incomplete list of the dead, January 16, 1919" source={SRC.post} />),
  s(L('c5b_02'), (p) => <NamesCard {...p} names={[{ name: 'Patrick Breen', age: '44', at: L('c5b_02') }, { name: 'William Brogan', age: '61', at: L('c5b_03') }, { name: 'Bridget Clougherty', age: '65', at: L('c5b_04') }, { name: 'Stephen Clougherty', age: '34', at: W('c5b_04', 'Stephen') }]} wash={wash('panorama.jpg', -1, 0, 0.2)} />),
  s(L('c5b_05'), (p) => <NamesCard {...p} names={[{ name: 'Flaminio Gallerani', age: '37', at: L('c5b_05') }, { name: 'Eric Laird', age: '17', at: L('c5b_06') }, { name: 'Peter Shaughnessy', age: '18', at: L('c5b_07') }, { name: 'Ralph Martin', age: '21', at: L('c5b_08') }]} wash={wash('redcross.jpg', 1, 0, 0.2)} />),
  s(L('c5b_09'), (p) => <NamesCard {...p} names={[{ name: 'Michael Sinnott', age: '78', at: L('c5b_09') }, { name: 'Maria Di Stasio', age: '10', at: L('c5b_10') }, { name: 'Pasquale Iantosca', age: '10', at: W('c5b_10', 'Pasquale') }]} wash={wash('cba_051.jpg', -1, 0, 0.2)} />),
  ph(L('c5b_11'), (p) => <PhotoShot {...p} src="cba_035.jpg" intro="wipe" kb={kb(960, 540, 1.05, 1.16, -2, 0)} text="Along the elevated railway after the flood, January 1919" source={SRC.cba} />),
  s(L('c5b_12'), (p) => <TextCard {...p} lines={[{ text: 'None of them had any say', at: L('c5b_12') }, { text: 'in how that tank was built.', at: W('c5b_12', 'how'), size: 64, weight: 800, color: C.amber }]} wash={wash('tank_before.jpg', 0, -1, 0.2)} />),

  // ===================== CHAPTER 6 — A STICKY CITY
  ph(first('c6'), (p) => <PhotoShot {...p} src="cba_023.jpg" intro="zoom" kb={kb(800, 520, 1.06, 1.16, 2, 0)} text="A street flooded with molasses beside the elevated railway, January 1919" source={SRC.cba} />),
  s(W('c6_02', 'salt') - 0.3, (p) => <ChipsCard {...p} kicker="The cleanup" chips={[{ text: 'salt water from a fireboat', at: W('c6_02', 'salt') }, { text: 'sand to soak it up', at: W('c6_02', 'sand') }]} wash={wash('cba_023.jpg', -1, 0, 0.2)} />),
  s(L('c6_03'), (p) => <TextCard {...p} lines={[{ text: 'Several hundred workers', at: W('c6_03', 'hundred') }, { text: 'weeks of work to clear the area', at: W('c6_03', 'weeks') }]} wash={wash('redcross.jpg', 1, 0, 0.22)} />),
  ph(L('c6_04'), (p) => <MapShot {...p} keys={[[0, TANK.lon + 0.002, TANK.lat - 0.002, 2.6], [p.dur, -71.058, 42.362, 5.5]]} markers={[{ lon: TANK.lon, lat: TANK.lat, label: 'North End', at: L('c6_04') }]} />),
  s(L('c6_06'), (p) => <ChipsCard {...p} kicker="Molasses turned up" chips={[{ text: 'subway platforms', at: W('c6_06', 'subway') }, { text: 'streetcar seats', at: W('c6_06', 'streetcar') }, { text: 'telephones', at: W('c6_06', 'telephones') }, { text: 'homes', at: W('c6_06', 'homes') }]} wash={wash('cba_031.jpg', -1, 0, 0.18)} />),
  s(L('c6_07'), (p) => <TextCard {...p} quote lines={[{ text: 'Everything that a Bostonian touched was sticky.', at: W('c6_07', 'Everything') }, { text: 'as one account put it', at: L('c6_07') + 0.3 }]} />),
  ph(L('c6_08'), (p) => <MapShot {...p} keys={[[0, TANK.lon + 0.004, TANK.lat - 0.002, 4.4], [p.dur, TANK.lon + 0.004, TANK.lat - 0.002, 4.0]]} water={W('c6_08', 'brown')} note={{ text: 'Boston Harbor stayed brown until the summer', at: W('c6_08', 'brown') }} tag="Illustration" />),

  // ===================== CHAPTER 7 — "ANARCHISTS"
  s(first('c7'), (p) => <TextCard {...p} lines={[{ text: 'Who was responsible?', at: W('c7_01', 'who') }]} wash={wash('panorama.jpg', 1, 0, 0.24)} />),
  s(L('c7_02'), (p) => <PrintShot {...p} {...NYT} crop={[0, 0, 295, 200]} w={1120} pan={[0, 8]} text="The New York Times, January 16, 1919: from the first day, the word was “explodes”" source={SRC.nyt} />),
  s(W('c7_02', 'blown') - 0.3, (p) => <TextCard {...p} kicker="USIA’s explanation" lines={[{ text: 'The tank was blown up.', at: W('c7_02', 'blown') }, { text: 'By anarchists.', at: W('c7_02', 'anarchists'), size: 84, weight: 800, color: C.amber }]} wash={wash('cba_031.jpg', 0, 1, 0.18)} />),
  s(L('c7_03'), (p) => <FlowCard {...p} steps={[{ text: 'Molasses', at: L('c7_03') + 0.3 }, { text: 'Alcohol', at: W('c7_03', 'alcohol') }, { text: 'Munitions', at: W('c7_03', 'munitions') }]} tag="Diagram" />),
  s(L('c7_04'), (p) => <TextCard {...p} kicker="1919" lines={[{ text: 'Fear of political bombings was real.', at: W('c7_04', 'fear') }]} wash={wash('cba_051.jpg', 0, -1, 0.18)} />),
  s(L('c7_05'), (p) => <FlowCard {...p} kicker="USIA’s logic" steps={[{ text: 'An attack', at: W('c7_05', 'attacked') }, { text: 'Not to blame', sub: 'the company', at: W('c7_05', 'blame') - 0.3 }]} />),
  ph(L('c7_06') - 0.2, (p) => <PhotoShot {...p} src="redcross.jpg" intro="wipe" kb={kb(400, 640, 1.3, 1.42, 2, 0)} text="Crowds at the site, January 1919" source={SRC.rc} />),
  s(L('c7_07'), (p) => <NumberCard {...p} kicker="Took USIA to court, together" count={{ to: 119, at: L('c7_07') + 0.1, d: 1.3 }} label="residents" wash={wash('panorama.jpg', -1, 0, 0.18)} />),
  s(L('c7_08'), (p) => <TextCard {...p} kicker="Class action" lines={[{ text: 'One of the first in Massachusetts', at: W('c7_08', 'first') }]} wash={wash('cba_035.jpg', 0, 1, 0.18)} />),
  s(L('c7_09'), (p) => <TextCard {...p} kicker="Today" lines={[{ text: 'A milestone in corporate regulation', at: W('c7_09', 'milestone') }]} wash={wash('waterfront.jpg', 1, 0, 0.2)} />),
  s(L('c7_10'), (p) => <ChipsCard {...p} kicker="USIA had to answer, in detail" chips={[{ text: 'how it built the tank', at: W('c7_10', 'built') }, { text: 'how it ran it', at: W('c7_10', 'ran') }]} wash={wash('tank_before.jpg', 1, 0, 0.18)} />),
  s(L('c7_11'), (p) => <NamesCard {...p} kicker="Court-appointed auditor" names={[{ name: 'Hugh W. Ogden', at: W('c7_11', 'Hugh') }]} wash={wash('el_structure.jpg', 0, -1, 0.16)} />),
  s(L('c7_12'), (p) => <NumberCard {...p} kicker="Hearings" value="3" unit="years" ticks={{ n: 3, at: W('c7_12', 'three') }} wash={wash('cba_052.jpg', 0, 1, 0.16)} />),
  ph(L('c7_13'), (p) => <PhotoShot {...p} src="cba_054.jpg" intro="zoom" kb={kb(1000, 560, 1.08, 1.2, -2, 0)} text="The evidence: torn steel under the elevated structure, January 1919" source={SRC.cba} />),
  s(W('c7_13', 'leaks') - 0.3, (p) => <ChipsCard {...p} kicker="The anarchist theory vs. the evidence" chips={[{ text: 'the leaks', at: W('c7_13', 'leaks') }, { text: 'the warnings', at: W('c7_13', 'warnings') }, { text: 'the steel', at: W('c7_13', 'steel') }]} wash={wash('cba_054.jpg', -1, 0, 0.2)} />),
  s(L('c7_14'), (p) => <TextCard {...p} kicker="The auditor’s finding" lines={[{ text: 'USIA was responsible.', at: W('c7_14', 'USIA') }]} wash={wash('tank_before.jpg', 0, 1, 0.18)} />),
  s(L('c7_15'), (p) => <NumberCard {...p} kicker="Damages paid by USIA" count={{ to: 628000, prefix: '$', at: W('c7_15', 'six') - 0.1, d: 0.9 }} wash={wash('under_el.jpg', 0, -1, 0.16)} />),
  s(L('c7_16'), (p) => <NumberCard {...p} prev="$628,000 in damages in total" kicker="Per victim’s family, reportedly" value="~$7,000" />),
  s(L('c7_17'), (p) => <ChipsCard {...p} chips={[{ text: 'criminal conviction', at: W('c7_17', 'criminal'), x: true }, { text: 'prison sentence', at: W('c7_17', 'prison'), x: true }, { text: 'A bill.', at: W('c7_17', 'bill') - 0.2 }]} />),
  s(L('c7_18'), (p) => <TextCard {...p} lines={[{ text: 'Not an attack.', at: W('c7_18', 'attack') }, { text: 'A tank that should never have been trusted.', at: W('c7_18', 'tank'), size: 72, weight: 800, color: C.amber }]} wash={wash('cba_051.jpg', 1, 0, 0.2)} />),

  // ===================== CHAPTER 8 — WHAT THE STEEL SAID
  ph(first('c8'), (p) => <PhotoShot {...p} src="cba_054.jpg" intro="3d" kb={kb(1100, 600, 1.06, 1.14)} text="Steel under the elevated structure, January 1919" source={SRC.cba} />),
  s(L('c8_02'), (p) => <SteelCard {...p} at={W('c8_02', 'steel')} at2={W('c8_02', 'half')} />),
  s(L('c8_03'), (p) => <TextCard {...p} kicker="The steel also" lines={[{ text: 'lacked manganese', at: W('c8_03', 'manganese') }, { text: '→ more brittle', at: W('c8_03', 'brittle'), size: 72, weight: 800, color: C.amber }]} />),
  s(L('c8_04'), (p) => <RivetCrack {...p} at={W('c8_04', 'cracks')} />),
  s(L('c8_05'), (p) => <ChipsCard {...p} kicker="Harvard, 2016" title="Studying the flood" chips={[{ text: '1919 newspapers', at: W('c8_05', 'newspapers') }, { text: 'maps', at: W('c8_05', 'maps') }, { text: 'weather reports', at: W('c8_05', 'weather') }]} />),
  s(L('c8_06'), (p) => <ModelCard {...p} at={W('c8_06', 'poured')} />),
  s(L('c8_07'), (p) => <TextCard {...p} kicker="Their conclusion" lines={[{ text: 'The reported speeds were believable.', at: W('c8_07', 'speeds') }]} wash={wash('cba_052.jpg', -1, 0, 0.2)} />),
  s(L('c8_08'), (p) => <GraphCard {...p} kicker="Cold made it thicken quickly · illustrative" xl="time →" yl="thickness" pts={[[0, 0.15], [0.2, 0.3], [0.4, 0.5], [0.6, 0.68], [0.8, 0.8], [1, 0.88]]} at={L('c8_08')} d={2.2} tag="Illustration" />),
  s(L('c8_09'), (p) => <TextCard {...p} lines={[{ text: 'The rules changed.', at: W('c8_09', 'changed') }, { text: 'construction laws, after the flood', at: L('c8_10') }]} wash={wash('waterfront.jpg', 1, 0, 0.2)} />),
  s(L('c8_11'), (p) => <TankDiagram {...p} mode="check" at={W('c8_11', 'licensed')} labels={[{ text: '', at: W('c8_11', 'architect') }, { text: '', at: W('c8_11', 'civil') }]} title="Overseen by" titleAt={L('c8_11')} />),
  s(L('c8_12'), (p) => <TankDiagram {...p} mode="outline" at={L('c8_12')} title="Designed and checked by people trained to do it" titleAt={W('c8_12', 'designed')} />),
  s(L('c8_13'), (p) => <TextCard {...p} kicker="1915 · Commercial Street" lines={[{ text: 'Nobody had required that.', at: W('c8_13', 'nobody') }]} wash={wash('tank_before.jpg', 0, 1, 0.22)} />),

  // ===================== CHAPTER 9 — THE PARK ON COMMERCIAL STREET
  ph(first('c9'), (p) => <PhotoShot {...p} src="redcross.jpg" intro="zoom" kb={kb(1300, 400, 1.2, 1.32, -2, 0)} text="Where the tank stood: wreckage on Commercial Street, January 1919" source={SRC.rc} />),
  ph(L('c9_02'), (p) => <MapShot {...p} keys={[[0, TANK.lon + 0.0008, TANK.lat - 0.0004, 1.6], [p.dur, TANK.lon + 0.0008, TANK.lat - 0.0004, 1.35]]} park={W('c9_02', 'Langone')} texts={[{ lon: TANK.lon + 0.0004, lat: TANK.lat + 0.0012, text: 'LANGONE PARK', at: W('c9_02', 'Langone'), size: 34 }]} note={{ text: 'Little League field · playground · bocce courts', at: W('c9_02', 'Little') }} />),
  s(L('c9_03'), (p) => <TextCard {...p} lines={[{ text: 'A small plaque', at: W('c9_03', 'plaque') }, { text: 'remembers the disaster', at: W('c9_03', 'remembers') }]} wash={wash('waterfront.jpg', -1, 0, 0.18)} />),
  s(L('c9_04'), (p) => <RadarCard {...p} at={W('c9_04', 'ground')} at2={W('c9_05', 'twenty')} />),
  s(L('c9_06'), (p) => <NamesCard {...p} cols={3} size={40} kicker="Read aloud, January 15, 2019" wash={wash('panorama.jpg', 1, 0, 0.16)} names={['Patrick Breen', 'William Brogan', 'John Callahan', 'Bridget Clougherty', 'Stephen Clougherty', 'Maria Di Stasio', 'William Duffy', 'Peter Francis', 'Flaminio Gallerani', 'Pasquale Iantosca', 'James J. Kenneally', 'Eric Laird', 'George Layhe', 'James Lennon', 'Ralph Martin', 'James McMullen', 'Cesar Nicolo', 'Thomas Noonan', 'John M. Seiberlich', 'Peter Shaughnessy', 'Michael Sinnott'].map((n, i) => ({ name: n, at: L('c9_06') + 0.12 * i }))} />),
  s(L('c9_07'), (p) => <TextCard {...p} kicker="A North End legend" lines={[{ text: 'On hot summer days, the smell of molasses', at: W('c9_07', 'hot') }]} wash={wash('east_boston.jpg', 1, 0, 0.22)} />),
  s(L('c9_08'), (p) => <TankDiagram {...p} mode="noise" at={W('c9_08', 'groaned')} title="It leaked for years. It groaned." tag="Illustration" />),
  s(L('c9_09'), (p) => <TankDiagram {...p} mode="paint" at={W('c9_09', 'coat')} title="A coat of brown paint" tag="Illustration" />),
  s(L('c9_10'), (p) => <TextCard {...p} lines={[{ text: 'Not a freak of nature.', at: W('c9_10', 'not') }, { text: 'A warning nobody wanted to hear.', at: W('c9_11', 'warning'), size: 72, weight: 800, color: C.amber }]} wash={wash('tank_before.jpg', 0, -1, 0.2)} />),
  s(L('c9_12'), (p) => <ChipsCard {...p} chips={[{ text: '21 people', at: L('c9_12') }, { text: '~150 injured', at: W('c9_12', 'hundred') }, { text: 'a neighborhood buried in molasses', at: W('c9_12', 'neighborhood') }]} wash={wash('panorama.jpg', -1, 0, 0.2)} />),
  s(L('c9_13'), (p) => <TextCard {...p} lines={[{ text: 'Not because nobody knew.', at: L('c9_13') }, { text: 'The people who knew decided it could wait.', at: W('c9_13', 'Because'), size: 64, weight: 800, color: C.amber }]} wash={wash('redcross.jpg', 1, 0, 0.2)} />),
  ph(L('c9_14'), (p) => <PhotoShot {...p} src="cba_051.jpg" intro="3d" kb={kb(960, 560, 1.04, 1.1)} text="Wreckage beside the elevated tracks, January 1919" source={SRC.cba} />),
  s(L('c9_15'), (p) => <TankDiagram {...p} mode="paint" at={W('c9_15', 'brown')} title="Remember the streaks." titleAt={W('c9_15', 'streaks')} tag="Illustration" />),
];

const EndCard: React.FC<SP> = (p) => <ChapterCardEnd {...p} />;
const ChapterCardEnd: React.FC<SP> = (p) => (
  <TextCard {...p} kicker="Boston · January 15, 1919" lines={[{ text: 'THE GREAT MOLASSES FLOOD', at: p.start + 0.2 }, { text: 'In memory of the 21 people who died', at: p.start + 0.9 }]} />
);

// ---- transitions, After-Effects style. Each item gets an incoming transition type:
//  push  : outgoing lifts away first, incoming rises in with a short blur (cards; no double text)
//  whip  : whip-pan — both shots slide sideways together with horizontal motion blur (photo -> photo)
//  zoom  : zoom-through — outgoing flies into the lens, incoming pulls back from close (photo/map -> photo/map)
//  slide : card -> card lateral slide with motion blur
type Trans = 'push' | 'whip' | 'zoom' | 'slide';
const IN = 0.42, OUT = 0.22, TW = 0.42;
const ex = Easing.bezier(0.16, 1, 0.3, 1), ei = Easing.bezier(0.7, 0, 0.84, 0), eio = Easing.bezier(0.76, 0, 0.24, 1);
const clamp = (t: number, a: number, b: number, e = eio) => interpolate(t, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e });
// motion-blur strength for a 0..1 eased move: velocity peaks mid-way
const mb = (k: number, max = 8) => Math.round(max * Math.sin(Math.PI * Math.min(1, Math.max(0, k))));
const MB_DEFS = (
  <svg width={0} height={0} style={{ position: 'absolute' }}>
    <defs>
      {Array.from({ length: 9 }).map((_, n) => (
        <filter key={n} id={`mb${n}`} x="-20%" y="0%" width="140%" height="100%"><feGaussianBlur stdDeviation={`${n * 9} 0`} /></filter>
      ))}
    </defs>
  </svg>
);
const Seq: React.FC<{ shot: Item; end: number; next?: Item }> = ({ shot, end, next }) => {
  const outT: Trans = next?.trans ?? 'push';
  const tail = outT === 'push' ? 0.04 : TW;
  const from = Math.round(shot.at * FPS);
  const to = Math.round((end + tail) * FPS);
  return (
    <Sequence from={from} durationInFrames={Math.max(1, to - from)}>
      <Fader el={shot.el} start={shot.at} dur={end - shot.at} inT={shot.trans ?? 'push'} outT={outT} dir={shot.dir ?? 1} ndir={next?.dir ?? 1} />
    </Sequence>
  );
};
const Fader: React.FC<{ el: Shot['el']; start: number; dur: number; inT: Trans; outT: Trans; dir: number; ndir: number }> = ({ el, start, dur, inT, outT, dir, ndir }) => {
  const f = useCurrentFrame(); const t = f / FPS;
  let op = 1, tx = 0, ty = 0, sc = 1, blur = 0, mbN = 0;
  // incoming
  if (inT === 'push') { const k = clamp(t, 0, IN, ex); op *= Math.min(1, k * 1.25); ty += (1 - k) * 44; sc *= 1.04 - 0.04 * k; blur += (1 - k) * 6; }
  if (inT === 'whip' || inT === 'slide') { const k = clamp(t, 0, TW); tx += dir * 1920 * (1 - k); mbN = Math.max(mbN, mb(k)); }
  if (inT === 'zoom') { const k = clamp(t, 0, TW); sc *= 0.72 + 0.28 * k; op *= Math.min(1, k * 1.6); blur += (1 - k) * 10; }
  // outgoing
  if (outT === 'push') { const o = clamp(t, dur - OUT, dur + 0.04, ei); op *= 1 - o; ty -= o * 30; sc *= 1 + 0.035 * o; }
  if (outT === 'whip' || outT === 'slide') { const k = clamp(t, dur, dur + TW); tx -= ndir * 1920 * k; mbN = Math.max(mbN, mb(k)); }
  if (outT === 'zoom') { const k = clamp(t, dur, dur + TW, ei); sc *= 1 + 1.4 * k; op *= 1 - k; blur += k * 12; }
  const filt = [mbN ? `url(#mb${mbN})` : '', blur > 0.05 ? `blur(${blur.toFixed(1)}px)` : ''].join(' ').trim();
  return <AbsoluteFill style={{ opacity: op, transform: `translate(${tx}px, ${ty}px) scale(${sc})`, filter: filt || undefined }}>{el({ t, start, dur })}</AbsoluteFill>;
};

// ---- camera shake + flashes on impact moments (bang, rivets, the split)
const SHAKES = [
  { at: W('c4_02', 'deep'), amp: 4, d: 2.2, hz: 9 },
  { at: W('c4_03', 'crash'), amp: 10, d: 0.6, hz: 14 },
  { at: W('c4_03', 'bang'), amp: 22, d: 0.9, hz: 13 },
  { at: W('c4_04', 'popping'), amp: 7, d: 1.6, hz: 26 },
  { at: W('c4_05', 'split'), amp: 30, d: 1.3, hz: 11 },
  { at: W('c4_08', 'thrown'), amp: 9, d: 0.6, hz: 14 },
];
const FLASHES = [{ at: W('c4_03', 'bang'), o: 0.55 }, { at: W('c4_05', 'split'), o: 0.75 }];
const IMPACTS = [W('c4_03', 'bang'), W('c4_05', 'split')];
const nz = (x: number) => Math.sin(x * 1.7) * 0.5 + Math.sin(x * 3.1 + 1.3) * 0.3 + Math.sin(x * 5.3 + 2.1) * 0.2;
const Camera: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const t = useCurrentFrame() / FPS;
  let x = 0, y = 0, r = 0, z = 0;
  for (const s of SHAKES) {
    if (t < s.at || t > s.at + s.d) continue;
    const e = Math.exp(-(t - s.at) / (s.d / 3));
    x += s.amp * e * nz(t * s.hz); y += s.amp * 0.7 * e * nz(t * s.hz + 7); r += 0.04 * s.amp * e * nz(t * s.hz + 3); z = Math.max(z, 0.02 * (s.amp / 10) * e);
  }
  let fl = 0;
  for (const q of FLASHES) if (t >= q.at && t < q.at + 0.6) fl = Math.max(fl, q.o * Math.exp(-(t - q.at) / 0.13));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px) rotate(${r}deg) scale(${1 + z + (x || y ? 0.03 : 0)})` }}>{children}</AbsoluteFill>
      {fl > 0.01 && <AbsoluteFill style={{ background: '#FFFDF8', opacity: fl }} />}
    </AbsoluteFill>
  );
};
// light leak sweep over chapter cards (warm, subtle, light palette)
const Leak: React.FC<{ at: number }> = ({ at }) => {
  const t = useCurrentFrame() / FPS - at;
  if (t < -0.1 || t > 1.6) return null;
  const k = clamp(t, 0, 1.5, Easing.bezier(0.3, 0, 0.3, 1));
  return <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'multiply', opacity: 0.55 * Math.sin(Math.PI * k), background: `radial-gradient(ellipse 60% 90% at ${-20 + 140 * k}% 40%, rgba(199,122,26,0.55) 0%, rgba(232,170,90,0.25) 40%, rgba(255,255,255,0) 70%)` }} />;
};

// build the full sequence list: chapter cards + shots, each shot ends where the next begins
type Item = Shot & { key: string; trans?: Trans; dir?: number };
// cold open hook: open on the strongest photograph, then hand over to the approved opening map
const HOOK_END = (TL as any).words.find((w: any) => /^it/i.test(w.w) && w.s > 2).s - 0.15;
const items: Item[] = [];
for (const c of T.chapters as any[]) {
  items.push({ key: 'card-' + c.id, at: c.card, fade: 0.5, el: (p) => <ChapterCard {...p} num={c.num} title={c.title} /> });
  SHOTS.filter((x) => x.at >= c.card && x.at < c.end).forEach((x, i) => items.push({ ...x, key: c.id + '-' + i }));
}
const END_AT = (T.chapters as any[])[T.chapters.length - 1].end;
items.push({ key: 'end', at: END_AT, fade: 0.6, el: (p) => <EndCard {...p} /> });
const OutAt: React.FC<{ end: number; children: React.ReactNode }> = ({ end, children }) => {
  const t = useCurrentFrame() / FPS;
  const o = interpolate(t, [end - OUT, end + 0.04], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ei });
  return <AbsoluteFill style={{ opacity: 1 - o, transform: `translateY(${-o * 30}px) scale(${1 + 0.035 * o})` }}>{children}</AbsoluteFill>;
};
items.sort((a, b) => a.at - b.at);
// assign transitions: picture -> picture alternates whip / zoom-through, every third card -> card slides
items.forEach((it, i) => {
  const pv = items[i - 1];
  if (!pv) { it.trans = 'push'; return; }
  if (it.key.startsWith('card-') || it.key === 'end') it.trans = 'zoom';
  else if (pv.full && it.full) it.trans = i % 2 ? 'whip' : 'zoom';
  else if (!pv.full && !it.full && !pv.key.startsWith('card-') && i % 3 === 0) it.trans = 'slide';
  else it.trans = 'push';
  it.dir = i % 4 === 1 ? -1 : 1;
});
const SWOOSH = items.filter((it) => it.trans === 'whip' || it.trans === 'slide' || it.trans === 'zoom').map((it) => ({ at: it.at, v: it.trans === 'slide' ? 0.1 : 0.16 }));

// the hook photo needs the real local time for its Ken Burns move, then dissolves into the map
const HookFade: React.FC<{ end: number; children: React.ReactElement }> = ({ end, children }) => {
  const t = useCurrentFrame() / FPS;
  const o = interpolate(t, [end - 0.1, end + 0.45], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return <AbsoluteFill style={{ opacity: o }}>{React.cloneElement(children, { t } as any)}</AbsoluteFill>;
};
export const FULL_DURATION = T.duration;
export const Full: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Sequence from={0} durationInFrames={Math.round((items[0].at + 0.05) * FPS)}>
      <OutAt end={items[0].at}><Main noAudio /></OutAt>
    </Sequence>
    <Sequence from={0} durationInFrames={Math.round((HOOK_END + 0.5) * FPS)}>
      <HookFade end={HOOK_END}>
        <PhotoShot t={0} start={0} dur={HOOK_END} src="redcross.jpg" kb={kb(1100, 420, 1.16, 1.3, -2, 0)} text="Commercial Street, Boston · January 15, 1919" source={SRC.rc} />
      </HookFade>
    </Sequence>
    {MB_DEFS}
    <Camera>
      {items.map((it, i) => <Seq key={it.key} shot={it} end={i + 1 < items.length ? items[i + 1].at : T.duration} next={items[i + 1]} />)}
    </Camera>
    {(T.chapters as any[]).map((c) => <Leak key={c.id} at={c.card} />)}
    <Audio src={staticFile('audio/full_mix.wav')} />
    {SWOOSH.map((w, i) => <Sequence key={'w' + i} from={Math.max(0, Math.round((w.at - 0.28) * FPS))} durationInFrames={20}><Audio src={staticFile('audio/whoosh.wav')} volume={w.v} /></Sequence>)}
    {IMPACTS.map((a, i) => <Sequence key={'i' + i} from={Math.round((a - 0.02) * FPS)} durationInFrames={36}><Audio src={staticFile('audio/impact.wav')} volume={0.22} /></Sequence>)}
  </AbsoluteFill>
);
export const SHOT_COUNT = items.length;
