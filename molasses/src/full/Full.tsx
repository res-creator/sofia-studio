// The full episode (~12:50): cold open (the approved Todd test segment, unchanged) + 10 chapters.
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate } from 'remotion';
import T from '../data/full.json';
import { C } from '../lib';
import { Main } from '../Main';
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
};
// Ken Burns that frames point (px,py) of the cover-fitted image, scale s0->s1
// (object-fit: cover clips the image to the frame, so the pan is clamped to keep the frame filled)
const cl = (v: number, s: number) => Math.max(-50 * (s - 1), Math.min(50 * (s - 1), v));
const kb = (px: number, py: number, s0: number, s1: number, dx = 0, dy = 0) => ({
  s0, s1, x0: cl((-(px - 960) * s0) / 19.2, s0), x1: cl((-(px - 960) * s1) / 19.2 + dx, s1), y0: cl((-(py - 540) * s0) / 10.8, s0), y1: cl((-(py - 540) * s1) / 10.8 + dy, s1),
});
const POST = { src: 'boston_post.jpg', srcW: 1127, srcH: 1435 };
const TANKP = { src: 'tank_before.jpg', srcW: 417, srcH: 327 };

type Shot = { at: number; fade?: number; el: (p: SP) => React.ReactNode };
const s = (at: number, el: Shot['el'], fade = 0.3): Shot => ({ at, el, fade });
const first = (cid: string) => CH[cid].vo - 0.25;

const SHOTS: Shot[] = [
  // ===================== CHAPTER 1 — A TANK BY THE HARBOR
  s(first('c1'), (p) => <MapShot {...p} keys={[[0, -71.06, 42.36, 60], [p.dur, -71.0555, 42.3655, 5]]} texts={[{ lon: -71.035, lat: 42.357, text: 'Boston Harbor', at: L('c1_01') + 2.5, size: 30 }]} />),
  s(L('c1_02'), (p) => <NumberCard {...p} kicker="Built" value="1915" sub="by the Purity Distilling Company" subAt={W('c1_02', 'Purity')} />),
  s(W('c1_02', '529') - 0.3, (p) => <MapShot {...p} keys={[[0, TANK.lon + 0.001, TANK.lat - 0.001, 3.2], [p.dur, TANK.lon + 0.001, TANK.lat - 0.001, 2.6]]} markers={[{ lon: TANK.lon, lat: TANK.lat, label: '529 Commercial Street', sub: 'NORTH END', at: W('c1_02', '529') }]} />),
  s(L('c1_03'), (p) => <FlowCard {...p} kicker="How the molasses moved" steps={[{ text: 'Ship', sub: 'at the pier', at: W('c1_03', 'Ships') }, { text: 'Tank', sub: 'Commercial Street', at: W('c1_03', 'pump') }]} tag="Diagram" />),
  s(L('c1_04'), (p) => <MapShot {...p} keys={[[0, TANK.lon - 0.004, TANK.lat - 0.001, 4.2], [p.dur, TANK.lon - 0.005, TANK.lat - 0.001, 3.8]]} markers={[{ lon: TANK.lon, lat: TANK.lat, label: 'Tank', at: L('c1_04') }]} west={{ at: W('c1_04', 'pipe'), label: 'pipe to Purity’s plant in Cambridge (route not shown)' }} />),
  s(L('c1_05'), (p) => <FlowCard {...p} steps={[{ text: 'Molasses', at: L('c1_05') + 0.2 }, { text: 'Fermented', at: W('c1_05', 'fermented') }, { text: 'Ethanol', at: W('c1_05', 'ethanol') }]} tag="Diagram" />),
  s(L('c1_06'), (p) => <FlowCard {...p} branch steps={[{ text: 'Ethanol', at: L('c1_06') }, { text: 'Alcoholic drinks', at: W('c1_06', 'drinks') - 0.2 }, { text: 'Munitions', at: W('c1_06', 'munitions') - 0.2 }]} tag="Diagram" />),
  s(L('c1_07'), (p) => <TextCard {...p} kicker="The First World War" lines={[{ text: 'Munitions were very good business.', at: W('c1_07', 'munitions') }]} />),
  s(L('c1_08'), (p) => <TimelineCard {...p} items={[{ top: '1915', label: 'Purity Distilling builds the tank', at: L('c1_08') + 0.1 }, { top: '1917', label: 'Bought by United States Industrial Alcohol (USIA)', at: W('c1_08', '1917'), hi: true }]} />),
  s(L('c1_09'), (p) => <TextCard {...p} kicker="The owner" lines={[{ text: 'United States Industrial Alcohol', at: L('c1_09') + 0.1 }, { text: 'The Commercial Street tank: part of a national operation', at: W('c1_09', 'national') }]} />),
  s(L('c1_10'), (p) => <TextCard {...p} kicker="The man responsible" lines={[{ text: 'Not an engineer.', at: W('c1_10', 'not') }]} />),
  s(L('c1_11'), (p) => <MapShot {...p} keys={[[0, TANK.lon + 0.003, TANK.lat - 0.001, 3.0], [p.dur, TANK.lon + 0.002, TANK.lat - 0.0005, 2.4]]} texts={[{ lon: TANK.lon + 0.0045, lat: TANK.lat + 0.0012, text: 'harbor & piers', at: W('c1_11', 'harbor'), size: 30 }]} commercial={W('c1_11', 'Picture')} markers={[{ lon: TANK.lon, lat: TANK.lat, label: 'Tank', at: L('c1_11') + 0.3 }]} />),
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
  s(L('c2_16'), (p) => <TextCard {...p} lines={[{ text: 'Jell heard about the noises.', at: L('c2_16') }, { text: 'The tank stayed in service.', at: W('c2_16', 'tank'), size: 84, weight: 800, color: C.amber }]} />),
  s(L('c2_17'), (p) => <TankDiagram {...p} mode="fill" level={0.9} at={L('c2_17') - 1} at2={L('c2_17')} title="Pressure to keep it full" />),
  s(L('c2_18'), (p) => <TimelineCard {...p} kicker="Prohibition is coming" items={[{ top: 'Jan 15, 1919', label: 'the disaster', at: W('c2_18', 'amendment') }, { top: 'Jan 16, 1919', label: 'the amendment banning alcohol is ratified', at: W('c2_18', 'ratified'), hi: true }]} />),
  s(L('c2_19'), (p) => <TextCard {...p} kicker="Several historians argue" lines={[{ text: 'A rush to produce before the law took effect', at: W('c2_19', 'rushing') }]} />),
  s(L('c2_20'), (p) => <TimelineCard {...p} items={[{ top: '1919', label: 'amendment ratified', at: L('c2_20') }, { top: '1920', label: 'the ban begins, one year later', at: W('c2_20', 'year'), hi: true }]} />),
  s(L('c2_21'), (p) => <NumberCard {...p} kicker="Filled to capacity" value="8" unit="times" ticks={{ n: 8, at: W('c2_21', 'filled') }} label="in its whole life" />),
  s(L('c2_22'), (p) => <TankDiagram {...p} mode="fill" at={L('c2_22')} at2={W('c2_22', 'gallons')} count={{ to: 2000000, at: W('c2_22', 'more'), label: '+ gallons · January 15, 1919' }} title="January 15, 1919" />),

  // ===================== CHAPTER 3 — THE WARM DAY
  s(first('c3'), (p) => <GraphCard {...p} kicker="Boston, January 1919 · schematic" xl="days →" yl="°F" pts={[[0, 0.06], [0.15, 0.04], [0.3, 0.07], [0.45, 0.05], [0.6, 0.06]]} at={L('c3_01')} d={2} labels={[{ i: 3, text: '≈ 2°F', at: W('c3_02', 'two') }]} color={C.blue} tag="Schematic" />),
  s(L('c3_03'), (p) => <GraphCard {...p} kicker="Then the weather turned · schematic" xl="days →" yl="°F" pts={[[0, 0.06], [0.15, 0.04], [0.3, 0.07], [0.45, 0.05], [0.6, 0.06], [0.7, 0.25], [0.8, 0.55], [0.9, 0.82], [1, 0.86]]} at={L('c3_03') - 0.5} d={2.5} labels={[{ i: 3, text: '≈ 2°F', at: L('c3_03') }, { i: 8, text: '> 40°F', at: W('c3_03', 'forty') }]} tag="Schematic" />),
  s(L('c3_04'), (p) => <TextCard {...p} kicker="January 15, 1919" lines={[{ text: 'It felt almost like spring.', at: W('c3_04', 'felt') }]} />),
  s(L('c3_05'), (p) => <FlowCard {...p} kicker="The day before" steps={[{ text: 'Ship', sub: 'fresh load of molasses', at: L('c3_05') + 0.2 }, { text: 'Tank', sub: 'Commercial Street', at: W('c3_05', 'delivered') }]} tag="Diagram" />),
  s(L('c3_06'), (p) => <TankDiagram {...p} mode="warm" at={L('c3_06')} title="Warmed, to flow more easily" labels={[{ text: '', at: 0 }, { text: 'warm molasses', at: W('c3_06', 'warmed') }]} tag="Illustration" />),
  s(L('c3_07'), (p) => <TankDiagram {...p} mode="warm" at={L('c3_07') - 1.6} title="Warm into cold" labels={[{ text: 'colder molasses', at: W('c3_07', 'colder') }, { text: 'warm molasses', at: L('c3_07') }, { text: 'outside: suddenly mild', at: W('c3_07', 'mild') }]} tag="Illustration" />),
  s(L('c3_08'), (p) => <TankDiagram {...p} mode="expand" at={W('c3_08', 'expansion')} title="Expansion inside the tank" sub="some researchers believe it added to the strain" subAt={W('c3_08', 'added')} tag="Illustration" />),
  s(L('c3_09'), (p) => <TankDiagram {...p} mode="level" at={W('c3_09', 'Not')} title="Liquids take up more space when warm" sub="in a tank of 2 million+ gallons, a little is a lot" subAt={W('c3_09', 'But')} tag="Illustration" />),
  s(L('c3_10'), (p) => <ChipsCard {...p} kicker="Already" chips={[{ text: 'leaking', at: W('c3_10', 'leaking') }, { text: 'groaning', at: W('c3_10', 'groaning') }, { text: 'steel never strong enough', at: W('c3_10', 'never') }]} />),

  // ===================== CHAPTER 4 — TWELVE THIRTY
  s(first('c4'), (p) => <NumberCard {...p} kicker="January 15, 1919" value="12:30" unit="p.m." sub="Commercial Street" subAt={W('c4_01', 'Commercial')} />),
  s(L('c4_02'), (p) => <PhotoShot {...p} src="cba_052.jpg" kb={kb(960, 560, 1.05, 1.12)} text="The tracks of the elevated railway, bent by the flood" source={SRC.cba} />),
  s(L('c4_03'), (p) => <WordsCard {...p} words={[{ text: 'A crash.', at: W('c4_03', 'crash') }, { text: 'A growl.', at: W('c4_03', 'growl') }, { text: 'A bang like thunder.', at: W('c4_03', 'bang'), amber: true }]} size={100} />),
  s(L('c4_04'), (p) => <TankDiagram {...p} mode="rivets" at={W('c4_04', 'popping')} title="Rivets shooting out of the steel" titleAt={W('c4_04', 'rivets')} tag="Illustration" />),
  s(L('c4_05'), (p) => <TankDiagram {...p} mode="burst" at={L('c4_05')} at2={W('c4_05', 'came')} level={0.9} title="More than two million gallons, at once" titleAt={W('c4_05', 'more')} tag="Illustration" />),
  s(L('c4_06'), (p) => <HeightsCard {...p} bars={[{ ft: 25, label: '~25 ft', sub: 'most cited', at: W('c4_06', 'twenty'), hi: true }, { ft: 15, label: '15 ft', sub: 'some accounts', at: W('c4_06', 'fifteen') }, { ft: 40, label: '40 ft', sub: 'memorial plaque', at: W('c4_06', 'forty') }]} />),
  s(L('c4_07'), (p) => <NumberCard {...p} kicker="Speed of the wave · estimate" value="~35" unit="mph" />),
  s(L('c4_08'), (p) => <PhotoShot {...p} src="el_structure.jpg" kb={kb(700, 500, 1.04, 1.12)} text="The elevated railway on Atlantic Avenue: steel from the tank was driven into its frame." source={SRC.el} arrows={[{ px: 330, py: 420, dx: 170, dy: 150, at: W('c4_08', 'structure'), label: 'Bent girder' }]} />),
  s(L('c4_09'), (p) => <PhotoShot {...p} src="cba_031.jpg" kb={kb(700, 520, 1.05, 1.11)} text="A streetcar under the elevated tracks, after the flood" source={SRC.cba} arrows={[{ px: 240, py: 470, dx: 160, dy: -150, at: L('c4_09') + 0.3, label: 'Streetcar' }]} />),
  s(L('c4_10'), (p) => <PhotoShot {...p} src="panorama.jpg" kb={kb(1300, 260, 1.25, 1.36)} text="Buildings off their foundations, wreckage across the site" source={SRC.pano} />),
  s(L('c4_11'), (p) => <MapShot {...p} keys={[[0, TANK.lon + 0.0004, TANK.lat - 0.0012, 2.0], [p.dur, TANK.lon + 0.0004, TANK.lat - 0.0012, 1.8]]} wave={{ at: L('c4_11') - 1.0, d: 0.1, r: 0.36 }} note={{ text: 'Several blocks flooded 2–3 feet deep', at: W('c4_11', 'flooded') }} tag="Reconstruction · illustrative extent" />),
  s(L('c4_12'), (p) => <TextCard {...p} kicker="Walking home from school" lines={[{ text: 'Anthony di Stasio', at: W('c4_12', 'Anthony') }]} />),
  s(L('c4_13'), (p) => <CrestCard {...p} at={W('c4_13', 'picked')} under={W('c4_13', 'rolled')} survived={L('c4_14')} />),
  s(L('c4_15'), (p) => <TextCard {...p} lines={[{ text: 'What made it so deadly', at: W('c4_15', 'deadly') }]} />),
  s(L('c4_16'), (p) => <GraphCard {...p} kicker="As it cooled, it thickened · illustrative" xl="time after the burst →" yl="thickness" pts={[[0, 0.15], [0.2, 0.22], [0.4, 0.38], [0.6, 0.58], [0.8, 0.78], [1, 0.9]]} at={L('c4_16')} d={2.6} tag="Illustration" />),
  s(L('c4_17'), (p) => <PhotoShot {...p} src="under_el.jpg" kb={kb(900, 640, 1.06, 1.14)} text="Rescuers in the molasses under the elevated tracks" source={SRC.under} />),
  s(L('c4_18'), (p) => <TextCard {...p} lines={[{ text: 'Molasses on a cold morning', at: L('c4_18') + 0.2 }]} />),
  s(L('c4_19'), (p) => <WordsCard {...p} words={[{ text: 'Thick.', at: L('c4_19') }, { text: 'Slow.', at: W('c4_19', 'Slow') }, { text: 'Almost solid.', at: W('c4_19', 'Almost'), amber: true }]} />),
  s(L('c4_20'), (p) => <MapShot {...p} keys={[[0, TANK.lon + 0.0004, TANK.lat - 0.0012, 2.1], [p.dur, TANK.lon + 0.0004, TANK.lat - 0.0012, 1.9]]} wave={{ at: L('c4_20'), d: 3.5, r: 0.36 }} note={{ text: 'Warm and fast out of the tank', at: W('c4_20', 'warm') }} tag="Reconstruction · illustrative extent" />),
  s(L('c4_21'), (p) => <GraphCard {...p} kicker="January air: cooling as it slowed · illustrative" xl="time →" yl="temperature" pts={[[0, 0.85], [0.2, 0.7], [0.4, 0.52], [0.6, 0.38], [0.8, 0.28], [1, 0.22]]} at={L('c4_21') + 0.3} d={3} color={C.blue} tag="Illustration" />),
  s(L('c4_22'), (p) => <WordsCard {...p} words={[{ text: 'Cooler.', at: L('c4_22') }, { text: 'Thicker.', at: W('c4_22', 'thicker'), amber: true }]} />),
  s(L('c4_23'), (p) => <TextCard {...p} kicker="Within minutes" lines={[{ text: 'A fast-moving wave…', at: W('c4_23', 'fast') }, { text: 'closer to wet cement', at: W('c4_23', 'closer'), size: 84, weight: 800, color: C.amber }]} />),

  // ===================== CHAPTER 5 — THE RESCUE
  s(first('c5'), (p) => <MapShot {...p} keys={[[0, TANK.lon + 0.002, TANK.lat - 0.0005, 3.4], [p.dur, TANK.lon + 0.002, TANK.lat - 0.0005, 2.8]]} markers={[{ lon: TANK.lon, lat: TANK.lat, label: 'Tank site', at: L('c5_01') }]} note={{ text: 'USS Nantucket, a training ship of the Massachusetts Nautical School, docked nearby', at: W('c5_02', 'training') }} />),
  s(L('c5_03'), (p) => <NumberCard {...p} kicker="First on the scene" value="116" label="cadets" sub="led by Lt. Cmdr. H. J. Copeland" subAt={W('c5_03', 'Lieutenant')} />),
  s(L('c5_04'), (p) => <PhotoShot {...p} src="under_el.jpg" kb={kb(1300, 560, 1.15, 1.24)} text="Wading into the molasses" source={SRC.under} />),
  s(L('c5_05'), (p) => <ChipsCard {...p} kicker="Then came" chips={[{ text: 'Boston police', at: W('c5_05', 'police') }, { text: 'Red Cross', at: W('c5_05', 'Red') }, { text: 'Army', at: W('c5_05', 'Army') }, { text: 'Navy', at: W('c5_05', 'Navy') }]} />),
  s(L('c5_06'), (p) => <PhotoShot {...p} src="cba_023.jpg" kb={kb(800, 520, 1.05, 1.12)} text="A flooded street beside the elevated railway, January 15, 1919" source={SRC.cba} />),
  s(L('c5_07'), (p) => <TextCard {...p} lines={[{ text: 'A makeshift hospital', at: W('c5_07', 'makeshift') }, { text: 'set up nearby', at: W('c5_07', 'nearby') }]} />),
  s(L('c5_08'), (p) => <TextCard {...p} kicker="One of the most common problems" lines={[{ text: 'Coughing', at: W('c5_08', 'coughing') }, { text: 'people had breathed in the molasses', at: W('c5_08', 'breathed') }]} />),
  s(L('c5_09'), (p) => <NumberCard {...p} kicker="The search" value="4" unit="days" />),
  s(L('c5_10'), (p) => <PhotoShot {...p} src="panorama.jpg" kb={kb(900, 520, 1.2, 1.3)} text="Searchers on the flooded site" source={SRC.pano} />),
  s(L('c5_11'), (p) => <MapShot {...p} keys={[[0, TANK.lon + 0.004, TANK.lat - 0.0005, 4.0], [p.dur, TANK.lon + 0.005, TANK.lat - 0.0005, 4.6]]} texts={[{ lon: TANK.lon + 0.007, lat: TANK.lat + 0.0005, text: 'Boston Harbor', at: L('c5_11'), size: 30 }]} note={{ text: 'Some victims were found 3–4 months later', at: W('c5_11', 'found') }} />),
  s(L('c5_12'), (p) => <ChipsCard {...p} title="21 people died" chips={[{ text: 'workers', at: W('c5_13', 'workers') }, { text: 'drivers', at: W('c5_13', 'drivers') }, { text: 'firefighters', at: W('c5_13', 'firefighters') }, { text: 'neighbors', at: W('c5_13', 'neighbors') }]} />),
  s(L('c5_14'), (p) => <NamesCard {...p} kicker="The youngest" names={[{ name: 'Maria Di Stasio', age: '10', at: W('c5_14', 'Maria') }, { name: 'Pasquale Iantosca', age: '10', at: W('c5_14', 'Pasquale') }]} />),
  s(L('c5_15'), (p) => <NamesCard {...p} kicker="Firefighter" names={[{ name: 'George Layhe', at: W('c5_15', 'George') }]} />),
  s(L('c5_16'), (p) => <ChipsCard {...p} kicker="January 15, 1919" chips={[{ text: '21 dead', at: L('c5_16') }, { text: 'several horses', at: W('c5_16', 'horses') }, { text: '~150 injured', at: W('c5_16', 'hundred') }]} />),

  // ===================== CHAPTER 5B — THE NAMES
  s(first('c5b'), (p) => <PrintShot {...p} {...POST} crop={[560, 720, 280, 300]} w={760} text="The Boston Post’s first, incomplete list of the dead, January 16, 1919" source={SRC.post} />),
  s(L('c5b_02'), (p) => <NamesCard {...p} names={[{ name: 'Patrick Breen', age: '44', at: L('c5b_02') }, { name: 'William Brogan', age: '61', at: L('c5b_03') }, { name: 'Bridget Clougherty', age: '65', at: L('c5b_04') }, { name: 'Stephen Clougherty', age: '34', at: W('c5b_04', 'Stephen') }]} />),
  s(L('c5b_05'), (p) => <NamesCard {...p} names={[{ name: 'Flaminio Gallerani', age: '37', at: L('c5b_05') }, { name: 'Eric Laird', age: '17', at: L('c5b_06') }, { name: 'Peter Shaughnessy', age: '18', at: L('c5b_07') }, { name: 'Ralph Martin', age: '21', at: L('c5b_08') }]} />),
  s(L('c5b_09'), (p) => <NamesCard {...p} names={[{ name: 'Michael Sinnott', age: '78', at: L('c5b_09') }, { name: 'Maria Di Stasio', age: '10', at: L('c5b_10') }, { name: 'Pasquale Iantosca', age: '10', at: W('c5b_10', 'Pasquale') }]} />),
  s(L('c5b_11'), (p) => <PhotoShot {...p} src="panorama.jpg" kb={kb(700, 900, 1.3, 1.4, -1, 0)} text="Commercial Street, January 15, 1919" source={SRC.pano} />),
  s(L('c5b_12'), (p) => <PrintShot {...p} {...TANKP} w={1060} text="None of them had any say in how this tank was built." source={SRC.tank} />),

  // ===================== CHAPTER 6 — A STICKY CITY
  s(first('c6'), (p) => <ChipsCard {...p} kicker="The cleanup" chips={[{ text: 'salt water from a fireboat', at: W('c6_02', 'salt') }, { text: 'sand to soak it up', at: W('c6_02', 'sand') }]} />),
  s(L('c6_03'), (p) => <TextCard {...p} lines={[{ text: 'Several hundred workers', at: W('c6_03', 'hundred') }, { text: 'weeks of work to clear the area', at: W('c6_03', 'weeks') }]} />),
  s(L('c6_04'), (p) => <MapShot {...p} keys={[[0, TANK.lon + 0.002, TANK.lat - 0.002, 2.6], [p.dur, -71.058, 42.362, 5.5]]} markers={[{ lon: TANK.lon, lat: TANK.lat, label: 'North End', at: L('c6_04') }]} />),
  s(L('c6_06'), (p) => <ChipsCard {...p} kicker="Molasses turned up" chips={[{ text: 'subway platforms', at: W('c6_06', 'subway') }, { text: 'streetcar seats', at: W('c6_06', 'streetcar') }, { text: 'telephones', at: W('c6_06', 'telephones') }, { text: 'homes', at: W('c6_06', 'homes') }]} />),
  s(L('c6_07'), (p) => <TextCard {...p} quote lines={[{ text: 'Everything that a Bostonian touched was sticky.', at: W('c6_07', 'Everything') }, { text: 'as one account put it', at: L('c6_07') + 0.3 }]} />),
  s(L('c6_08'), (p) => <MapShot {...p} keys={[[0, TANK.lon + 0.004, TANK.lat - 0.002, 4.4], [p.dur, TANK.lon + 0.004, TANK.lat - 0.002, 4.0]]} water={W('c6_08', 'brown')} note={{ text: 'Boston Harbor stayed brown until the summer', at: W('c6_08', 'brown') }} tag="Illustration" />),

  // ===================== CHAPTER 7 — "ANARCHISTS"
  s(first('c7'), (p) => <TextCard {...p} lines={[{ text: 'Who was responsible?', at: W('c7_01', 'who') }]} />),
  s(L('c7_02'), (p) => <TextCard {...p} kicker="USIA’s explanation" lines={[{ text: 'The tank was blown up.', at: W('c7_02', 'blown') }, { text: 'By anarchists.', at: W('c7_02', 'anarchists'), size: 84, weight: 800, color: C.amber }]} />),
  s(L('c7_03'), (p) => <FlowCard {...p} steps={[{ text: 'Molasses', at: L('c7_03') + 0.3 }, { text: 'Alcohol', at: W('c7_03', 'alcohol') }, { text: 'Munitions', at: W('c7_03', 'munitions') }]} tag="Diagram" />),
  s(L('c7_04'), (p) => <TextCard {...p} kicker="1919" lines={[{ text: 'Fear of political bombings was real.', at: W('c7_04', 'fear') }]} />),
  s(L('c7_05'), (p) => <FlowCard {...p} kicker="USIA’s logic" steps={[{ text: 'An attack', at: W('c7_05', 'attacked') }, { text: 'Not to blame', sub: 'the company', at: W('c7_05', 'blame') - 0.3 }]} />),
  s(L('c7_06'), (p) => <TextCard {...p} lines={[{ text: 'The families did not accept that.', at: L('c7_06') }]} />),
  s(L('c7_07'), (p) => <NumberCard {...p} kicker="Took USIA to court, together" value="119" label="residents" />),
  s(L('c7_08'), (p) => <TextCard {...p} kicker="Class action" lines={[{ text: 'One of the first in Massachusetts', at: W('c7_08', 'first') }]} />),
  s(L('c7_09'), (p) => <TextCard {...p} kicker="Today" lines={[{ text: 'A milestone in corporate regulation', at: W('c7_09', 'milestone') }]} />),
  s(L('c7_10'), (p) => <ChipsCard {...p} kicker="USIA had to answer, in detail" chips={[{ text: 'how it built the tank', at: W('c7_10', 'built') }, { text: 'how it ran it', at: W('c7_10', 'ran') }]} />),
  s(L('c7_11'), (p) => <NamesCard {...p} kicker="Court-appointed auditor" names={[{ name: 'Hugh W. Ogden', at: W('c7_11', 'Hugh') }]} />),
  s(L('c7_12'), (p) => <NumberCard {...p} kicker="Hearings" value="3" unit="years" />),
  s(L('c7_13'), (p) => <ChipsCard {...p} kicker="The anarchist theory vs. the evidence" chips={[{ text: 'the leaks', at: W('c7_13', 'leaks') }, { text: 'the warnings', at: W('c7_13', 'warnings') }, { text: 'the steel', at: W('c7_13', 'steel') }]} />),
  s(L('c7_14'), (p) => <TextCard {...p} kicker="The auditor’s finding" lines={[{ text: 'USIA was responsible.', at: W('c7_14', 'USIA') }]} />),
  s(L('c7_15'), (p) => <NumberCard {...p} kicker="Damages paid by USIA" count={{ to: 628000, prefix: '$', at: W('c7_15', 'six'), d: 1.6 }} />),
  s(L('c7_16'), (p) => <NumberCard {...p} kicker="Per victim’s family, reportedly" value="~$7,000" />),
  s(L('c7_17'), (p) => <ChipsCard {...p} chips={[{ text: 'criminal conviction', at: W('c7_17', 'criminal'), x: true }, { text: 'prison sentence', at: W('c7_17', 'prison'), x: true }, { text: 'A bill.', at: W('c7_17', 'bill') - 0.2 }]} />),
  s(L('c7_18'), (p) => <TextCard {...p} lines={[{ text: 'Not an attack.', at: W('c7_18', 'attack') }, { text: 'A tank that should never have been trusted.', at: W('c7_18', 'tank'), size: 72, weight: 800, color: C.amber }]} />),

  // ===================== CHAPTER 8 — WHAT THE STEEL SAID
  s(first('c8'), (p) => <PhotoShot {...p} src="cba_054.jpg" kb={kb(1100, 600, 1.06, 1.14)} text="Steel under the elevated structure, January 1919" source={SRC.cba} />),
  s(L('c8_02'), (p) => <SteelCard {...p} at={W('c8_02', 'steel')} at2={W('c8_02', 'half')} />),
  s(L('c8_03'), (p) => <TextCard {...p} kicker="The steel also" lines={[{ text: 'lacked manganese', at: W('c8_03', 'manganese') }, { text: '→ more brittle', at: W('c8_03', 'brittle'), size: 72, weight: 800, color: C.amber }]} />),
  s(L('c8_04'), (p) => <RivetCrack {...p} at={W('c8_04', 'cracks')} />),
  s(L('c8_05'), (p) => <ChipsCard {...p} kicker="Harvard, 2016" title="Studying the flood" chips={[{ text: '1919 newspapers', at: W('c8_05', 'newspapers') }, { text: 'maps', at: W('c8_05', 'maps') }, { text: 'weather reports', at: W('c8_05', 'weather') }]} />),
  s(L('c8_06'), (p) => <ModelCard {...p} at={W('c8_06', 'poured')} />),
  s(L('c8_07'), (p) => <TextCard {...p} kicker="Their conclusion" lines={[{ text: 'The reported speeds were believable.', at: W('c8_07', 'speeds') }]} />),
  s(L('c8_08'), (p) => <GraphCard {...p} kicker="Cold made it thicken quickly · illustrative" xl="time →" yl="thickness" pts={[[0, 0.15], [0.2, 0.3], [0.4, 0.5], [0.6, 0.68], [0.8, 0.8], [1, 0.88]]} at={L('c8_08')} d={2.2} tag="Illustration" />),
  s(L('c8_09'), (p) => <TextCard {...p} lines={[{ text: 'The rules changed.', at: W('c8_09', 'changed') }, { text: 'construction laws, after the flood', at: L('c8_10') }]} />),
  s(L('c8_11'), (p) => <TankDiagram {...p} mode="check" at={W('c8_11', 'licensed')} labels={[{ text: '', at: W('c8_11', 'architect') }, { text: '', at: W('c8_11', 'civil') }]} title="Overseen by" titleAt={L('c8_11')} />),
  s(L('c8_12'), (p) => <TankDiagram {...p} mode="outline" at={L('c8_12')} title="Designed and checked by people trained to do it" titleAt={W('c8_12', 'designed')} />),
  s(L('c8_13'), (p) => <PrintShot {...p} {...TANKP} w={1060} text="Commercial Street, before 1919. Nobody had required it." source={SRC.tank} />),

  // ===================== CHAPTER 9 — THE PARK ON COMMERCIAL STREET
  s(first('c9'), (p) => <PhotoShot {...p} src="panorama.jpg" kb={kb(1390, 220, 1.3, 1.38)} text="The tank was never rebuilt." source={SRC.pano} />),
  s(L('c9_02'), (p) => <MapShot {...p} keys={[[0, TANK.lon + 0.0008, TANK.lat - 0.0004, 1.6], [p.dur, TANK.lon + 0.0008, TANK.lat - 0.0004, 1.35]]} park={W('c9_02', 'Langone')} texts={[{ lon: TANK.lon + 0.0004, lat: TANK.lat + 0.0012, text: 'LANGONE PARK', at: W('c9_02', 'Langone'), size: 34 }]} note={{ text: 'Little League field · playground · bocce courts', at: W('c9_02', 'Little') }} />),
  s(L('c9_03'), (p) => <TextCard {...p} lines={[{ text: 'A small plaque', at: W('c9_03', 'plaque') }, { text: 'remembers the disaster', at: W('c9_03', 'remembers') }]} />),
  s(L('c9_04'), (p) => <RadarCard {...p} at={W('c9_04', 'ground')} at2={W('c9_05', 'twenty')} />),
  s(L('c9_06'), (p) => <NamesCard {...p} cols={3} size={40} kicker="Read aloud, January 15, 2019" names={['Patrick Breen', 'William Brogan', 'John Callahan', 'Bridget Clougherty', 'Stephen Clougherty', 'Maria Di Stasio', 'William Duffy', 'Peter Francis', 'Flaminio Gallerani', 'Pasquale Iantosca', 'James J. Kenneally', 'Eric Laird', 'George Layhe', 'James Lennon', 'Ralph Martin', 'James McMullen', 'Cesar Nicolo', 'Thomas Noonan', 'John M. Seiberlich', 'Peter Shaughnessy', 'Michael Sinnott'].map((n, i) => ({ name: n, at: L('c9_06') + 0.12 * i }))} />),
  s(L('c9_07'), (p) => <TextCard {...p} kicker="A North End legend" lines={[{ text: 'On hot summer days, the smell of molasses', at: W('c9_07', 'hot') }]} />),
  s(L('c9_08'), (p) => <TankDiagram {...p} mode="noise" at={W('c9_08', 'groaned')} title="It leaked for years. It groaned." tag="Illustration" />),
  s(L('c9_09'), (p) => <TankDiagram {...p} mode="paint" at={W('c9_09', 'coat')} title="A coat of brown paint" tag="Illustration" />),
  s(L('c9_10'), (p) => <TextCard {...p} lines={[{ text: 'Not a freak of nature.', at: W('c9_10', 'not') }, { text: 'A warning nobody wanted to hear.', at: W('c9_11', 'warning'), size: 72, weight: 800, color: C.amber }]} />),
  s(L('c9_12'), (p) => <ChipsCard {...p} chips={[{ text: '21 people', at: L('c9_12') }, { text: '~150 injured', at: W('c9_12', 'hundred') }, { text: 'a neighborhood buried in molasses', at: W('c9_12', 'neighborhood') }]} />),
  s(L('c9_13'), (p) => <TextCard {...p} lines={[{ text: 'Not because nobody knew.', at: L('c9_13') }, { text: 'The people who knew decided it could wait.', at: W('c9_13', 'Because'), size: 64, weight: 800, color: C.amber }]} />),
  s(L('c9_14'), (p) => <PhotoShot {...p} src="cba_051.jpg" kb={kb(960, 560, 1.04, 1.1)} text="Wreckage beside the elevated tracks, January 1919" source={SRC.cba} />),
  s(L('c9_15'), (p) => <TankDiagram {...p} mode="paint" at={W('c9_15', 'brown')} title="Remember the streaks." titleAt={W('c9_15', 'streaks')} tag="Illustration" />),
];

const EndCard: React.FC<SP> = (p) => <ChapterCardEnd {...p} />;
const ChapterCardEnd: React.FC<SP> = (p) => (
  <TextCard {...p} kicker="Boston · January 15, 1919" lines={[{ text: 'THE GREAT MOLASSES FLOOD', at: p.start + 0.2 }, { text: 'In memory of the 21 people who died', at: p.start + 0.9 }]} />
);

const Seq: React.FC<{ shot: Shot; end: number; next?: Shot }> = ({ shot, end, next }) => {
  const tail = next?.fade ?? 0;
  const from = Math.round(shot.at * FPS);
  const to = Math.round((end + tail) * FPS);
  return (
    <Sequence from={from} durationInFrames={Math.max(1, to - from)}>
      <Fader fade={shot.fade ?? 0} el={shot.el} start={shot.at} dur={end - shot.at} />
    </Sequence>
  );
};
const Fader: React.FC<{ fade: number; el: Shot['el']; start: number; dur: number }> = ({ fade, el, start, dur }) => {
  const f = useCurrentFrame();
  const o = fade ? interpolate(f, [0, fade * FPS], [0, 1], { extrapolateRight: 'clamp' }) : 1;
  return <AbsoluteFill style={{ opacity: o }}>{el({ t: f / FPS, start, dur })}</AbsoluteFill>;
};

// build the full sequence list: chapter cards + shots, each shot ends where the next begins
type Item = Shot & { key: string };
const items: Item[] = [];
for (const c of T.chapters as any[]) {
  items.push({ key: 'card-' + c.id, at: c.card, fade: 0.5, el: (p) => <ChapterCard {...p} num={c.num} title={c.title} /> });
  SHOTS.filter((x) => x.at >= c.card && x.at < c.end).forEach((x, i) => items.push({ ...x, key: c.id + '-' + i }));
}
const END_AT = (T.chapters as any[])[T.chapters.length - 1].end;
items.push({ key: 'end', at: END_AT, fade: 0.6, el: (p) => <EndCard {...p} /> });
items.sort((a, b) => a.at - b.at);

export const FULL_DURATION = T.duration;
export const Full: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Sequence from={0} durationInFrames={Math.round((T.cold.dur + 0.6) * FPS)}>
      <Main noAudio />
    </Sequence>
    {items.map((it, i) => <Seq key={it.key} shot={it} end={i + 1 < items.length ? items[i + 1].at : T.duration} next={items[i + 1]} />)}
    <Audio src={staticFile('audio/full_mix.wav')} />
  </AbsoluteFill>
);
export const SHOT_COUNT = items.length;
