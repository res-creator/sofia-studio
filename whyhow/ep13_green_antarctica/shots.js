// EP13 Green Antarctica — real Antarctic fossils (Field Museum, Seymour Island), Scott 1911 photos, USGS and CC maps, NASA visualisations and IceBridge aerials, Commons, Pixabay (ILLUSTRATIVE);
// licensed human-made paleoart labelled RECONSTRUCTION. No AI images.
const fs = require('fs'), path = require('path');
const MF = JSON.parse(fs.readFileSync(path.join(__dirname, 'footage/manifest.json')));
const FT = Object.fromEntries(MF.map(x => [x.key, x]));
const assets = {}; for (const x of MF) if (x.type === 'photo') assets[x.key] = 'footage/' + x.key + '.jpg';
const credit = k => { const f = FT[k]; if (!f || !f.attribution) return ''; if (/pixabay/.test(f.source)) return '';
  if (f.source === 'archive.org' || f.source === 'archive_org') return 'Film: ' + f.attribution; if (f.source === 'nasa') return 'Video: ' + f.attribution;
  return (f.type === 'video' ? 'Video: ' : 'Photo: ') + f.attribution; };
const C = n => require('../atlaskit/core').C[n];
let kbi = 0;
const KB = [{ z: [1.04, 1.18], x: [0.45, 0.55] }, { z: [1.18, 1.04], x: [0.55, 0.45] }, { z: [1.05, 1.2], y: [0.55, 0.45] }, { z: [1.2, 1.06], x: [0.5, 0.5], y: [0.45, 0.55] }];
const F = (key, o = {}) => { const f = FT[key]; if (!f) throw new Error('no footage ' + key);
  if (f.type === 'video') return { scene: 'video', p: { file: 'footage/' + key + '.mp4', credit: credit(key), cold: 0.08, ...o } };
  return { scene: 'photo', p: { img: key, credit: credit(key), kb: KB[kbi++ % KB.length], cold: 0.06, ...o } }; };
const S = (scene, p = {}) => ({ scene, p });
const low = (text, w, sub) => ({ type: 'lower', text, sub, w });
const head = (text, w, y = 200, size = 96, color) => ({ type: 'head', text, w, y, size, color });
const chipC = (text, w, y, size = 56) => ({ type: 'chip', text, x: 960, y, align: 'center', size, w });
const at = (o, a) => ({ ...o, at: a });
const note = (text) => ({ type: 'note', text, x: 60, y: 70, at: 0.3 });
const Yc = '#FFC857';
const A = (k, o = {}) => F(k, { sfx: 'click', ...o });                     // archival photo
const Wd = (k, o = {}) => F(k, { amb: 'wind', ...o }); const St = (k, o = {}) => F(k, { amb: 'storm', ...o });
const cnt = (w, to, o = {}) => ({ type: 'count', from: o.from != null ? o.from : to, to, w, dur: o.dur || 0.3, y: o.y || 560, size: o.size || 170, pre: o.pre, suf: o.suf, label: o.label, dec: o.dec, x: o.x });
const Q = (cutW, top, l1, l2, chipT, source) => S('stats', { cutW, head: top, items: [], sfx: 'boom', over: [at(head(l1, null, l2 ? 470 : 520, 88, Yc), 0.3), ...(l2 ? [at(head(l2, null, 590, 88, Yc), 0.6)] : []), ...(chipT ? [{ ...chipC(chipT, null, l2 ? 740 : 700, 44), at: 1.0 }] : [])], source });
const IL = 'ILLUSTRATIVE';
const G = { sp: { lon: 0, lat: -89.99 }, kirk: { lon: 166.5, lat: -84.33 }, jri: { lon: -57.8, lat: -64.2 }, sey: { lon: -56.73, lat: -64.28 }, wilkes: { lon: 136.0, lat: -63.3 },
  amund: { lon: -107.0, lat: -73.6 }, gamb: { lon: 76.0, lat: -80.5 }, denman: { lon: 99.5, lat: -66.75 }, thw: { lon: -106.75, lat: -75.5 }, vos: { lon: 106.8, lat: -78.47 },
  oliver: { lon: 163.0, lat: -85.1 }, alaska: { lon: -151.0, lat: 69.5 }, chix: { lon: -89.5, lat: 21.3 }, beardmore: { lon: 170.0, lat: -84.0 } };
const pt = g => [g.lon, g.lat];
const ANT = (o = {}) => ({ relief: true, ice: true, borders: false, lon: [[0, 0], [3, 0]], lat: [[0, -80], [3, -82]], R: [[0, 1500], [3, 1700]], ...o });
const REC = 'RECONSTRUCTION (ARTIST)';

function build(T) {
  const out = []; const add = (t, sh, trans) => out.push({ t, scene: sh.scene, p: sh.p, trans });
  function beats(pid, list, o = {}) {
    const p = T.P[pid], ws = T.words(pid); const st = o.start != null ? o.start : p.start; const end = p.start + p.dur + (o.tail || 0);
    const cand = [st]; ws.forEach((w, i) => { if (i > 0 && /[.?!,:]$/.test(ws[i - 1].w)) cand.push(w.s - 0.1); });
    const n = list.length; const ts = [st];
    for (let k = 1; k < n; k++) { const target = st + (end - st) * k / n; let best = null;
      for (const c of cand) if (c > ts[k - 1] + 1.8 && (best == null || Math.abs(c - target) < Math.abs(best - target))) best = c;
      if (best == null || Math.abs(best - target) > 1.5) { let bw = null; for (const w of ws) if (w.s > ts[k - 1] + 1.8 && (bw == null || Math.abs(w.s - target) < Math.abs(bw - target))) bw = w.s; best = bw != null ? bw - 0.08 : target; }
      ts.push(best); }
    list.forEach((sh, k) => { if (k > 0 && sh && sh.p.cutW) { const t = T.at(pid, sh.p.cutW) - 0.35; if (t > ts[k - 1] + 1.5 && (k + 1 >= ts.length || t < ts[k + 1] - 1.5)) ts[k] = t; delete sh.p.cutW; } else if (sh) delete sh.p.cutW; });
    const durOf = k => (k + 1 < ts.length ? ts[k + 1] : end + 0.25) - ts[k];
    const cap = (v, k, keep) => Math.max(0.2, Math.min(v, durOf(k) - keep));
    const rel = (w, t0, nn) => Math.max(0.2, T.at(pid, w, nn || 1) - t0);
    list.forEach((sh, k) => { if (!sh) return; const t0 = ts[k];
      for (const ov of (sh.p.over || [])) { if (ov.w) { ov.at = rel(ov.w, t0, ov.n); delete ov.w; } if (ov.at != null && ov.type !== 'note') ov.at = cap(ov.at, k, 2.4); }
      for (const it of (sh.p.items || [])) { if (it.w) { it.at = rel(it.w, t0, it.n); delete it.w; } if (it.at != null) it.at = cap(it.at, k, 2.6); }
      for (const arr of ['bands', 'marks']) for (const it of (sh.p[arr] || [])) if (it.w) { it.at = rel(it.w, t0, it.n); delete it.w; }
      for (const kk of ['flameAt', 'hotAt', 'coldAt', 'candleAt', 'fireAt', 'spreadAt', 'windAt', 'saveAt']) { const kw = kk.replace('At', 'W'); if (sh.p[kw]) { sh.p[kk] = rel(sh.p[kw], t0); delete sh.p[kw]; } }
      for (const kw of ['routes', 'pins', 'labels', 'zones', 'waves']) for (const it of (sh.p[kw] || [])) if (typeof it.w === 'string') { it.at = rel(it.w, t0, it.n); delete it.w; }
      add(t0, sh, 'cut'); });
  }
  const chapter = (pid, n, title) => add(T.s(pid) - 2.0, S('chapter', { n, title }), 'cut');

  const fos = (k, label, o = {}) => A(k, { over: [note(label)], ...o });

  // ===== COLD OPEN =====
  beats('A001', [
    A('cm_scott_1911_beardmore_camp', { over: [low('8 FEBRUARY 1912 · BEARDMORE GLACIER', 'February'), note('SCOTT EXPEDITION ON THE BEARDMORE, DEC 1911')] }),
    A('cm_scott_1911_beardmore_pressure_ice', { cutW: 'starving', over: [note('THE BEARDMORE GLACIER, 1911')] }),
    A('cm_scott_1911_wilson_sketching_beardmore', { cutW: 'rocky', over: [note('DR EDWARD WILSON, BEARDMORE GLACIER, 1911')] }),
  ], { start: 0 });
  beats('A002', [
    A('cm_scott_1911_mount_kyffin_beardmore', { over: [low('16 KG (35 LB) OF ROCKS', 'Sixteen'), note('BEARDMORE GLACIER, DEC 1911')] }),
    A('cm_scott_1911_cloudmaker_pressure', { cutW: 'drag', over: [note('THE BEARDMORE GLACIER, 1911 (C. S. WRIGHT)')] }),
    S('stats', { cutW: 'When', head: '12 NOVEMBER 1912', items: [], sfx: 'boom', over: [at(head('THE ROCKS WERE LYING', null, 500, 80, Yc), 0.3), at(head('NEXT TO THE BODIES', null, 610, 80, Yc), 0.7)], source: 'Source: Natural History Museum, London' }),
  ]);
  beats('A003', [
    fos('cm_glossopteris_leaf_antarctica_1', 'GLOSSOPTERIS LEAF FROM ANTARCTICA (ORTON MUSEUM)', { kb: { z: [1.05, 1.3] } }),
    fos('cm_glossopteris_leaf_antarctica_2', 'GLOSSOPTERIS, PERMIAN, ANTARCTICA', { cutW: 'Leaves' }),
  ]);
  beats('A004', [
    Wd('gov_nasa_lima_transantarctic_peaks', { over: [low('TODAY: THE COLDEST, DRIEST CONTINENT', 'coldest'), note('TRANSANTARCTIC MOUNTAINS (NASA LANDSAT)')] }),
    A('cm_cryolophosaurus_field_museum_mount', { cutW: 'forests', over: [note('ANTARCTIC DINOSAUR CRYOLOPHOSAURUS (CAST), FIELD MUSEUM')] }),
    F('px_tasmania_rainforest_creek_drone', { cutW: 'About', over: [low('~90 MILLION YEARS AGO: A RAINFOREST', 'rainforest'), note('TEMPERATE RAINFOREST, TASMANIA · ' + IL)] }),
    S('globe', ANT({ cutW: 'nine', lon: [[0, -100], [3, -107]], lat: [[0, -78], [3, -80]], R: [[0, 1300], [3, 1700]], pins: [{ ...G.sp, label: 'SOUTH POLE', at: 0.2, small: true, size: 40, color: C('iceL') }, { ...G.amund, label: 'RAINFOREST ROOTS (CORE 2017)', w: 'nine', small: true, size: 40 }], routes: [{ pts: [pt(G.amund), [-100, -86], pt(G.sp)], w: 5, at: 1.2, dur: 1.4, label: '~900 KM (560 MI)', ly: 50 }] })),
  ]);
  beats('A005', [S('stats', { head: '', items: [], over: [at(head('HOW DOES A GREEN', null, 470, 110), 0.1), at(head('CONTINENT FREEZE?', null, 600, 110, Yc), 0.4)] })]);
  beats('A006', [
    A('cm_map_gondwana_breakup_115ma_grobe', { over: [head('NEAR THE EQUATOR?', null, 170, 90, Yc), note('MAP: GONDWANA 115 MILLION YEARS AGO (H. GROBE / AWI)')] }),
    S('globe', ANT({ cutW: 'already', pins: [{ ...G.sp, label: 'SOUTH POLE', at: 0.2, small: true, size: 40 }], labels: [{ lon: 0, lat: -60, text: '90 MILLION YEARS AGO: ~82°S', w: 'already', size: 40, color: C('yellow') }] })),
  ]);
  beats('A007', [
    A('cm_reconstruction_great_cretaceous_ocean_1898', { kb: { z: [1.0, 1.15] }, over: [head('THE ASTEROID?', null, 170, 100, Yc), note('"THE GREAT CRETACEOUS OCEAN", 1898 · ' + REC)] }),
    F('px_palm_trees_from_below', { cutW: 'after', over: [low('AFTER IT: EVEN WARMER', 'warmer'), note('PALMS TODAY · ' + IL)] }),
    F('px_jungle_volcano_palms_aerial', { cutW: 'Palm', over: [low('PALMS ON THE COAST', 'Palm'), note('PALM FOREST TODAY · ' + IL)] }),
  ]);
  beats('A008', [
    A('cm_cryolophosaurus_field_museum_aurora', { cutW: 'First', over: [low('1 · DINOSAURS IN THE DARK', 'dinosaurs'), note('CRYOLOPHOSAURUS CAST, FIELD MUSEUM')] }),
    F('gov_nasa_sea_ice_ring_antarctica', { cutW: 'Then', over: [low('2 · THE SLOW FREEZE', 'freeze'), note('NASA VISUALIZATION')] }),
    F('gov_nasa_bedmap2_ice_peels_off', { cutW: 'what', over: [low('3 · WHAT THE ICE HIDES', 'hides'), note('NASA VISUALIZATION (BEDMAP2)')] }),
  ]);
  add(T.e('A008') + 0.15, S('title', { lines: ['WHEN ANTARCTICA', 'WAS GREEN'], hl: 1, img: 'cm_reconstruction_eocene_antarctic_pond', credit: credit('cm_reconstruction_eocene_antarctic_pond') + ' · reconstruction', brand: true, sfx: 'riser' }), 'cut');

  // ===== CH1 =====
  beats('A009', [
    A('cm_map_pangaea_glossopteris', { over: [low('THE SAME PLANT ON FIVE CONTINENTS', 'five'), note('MAP: WHERE GLOSSOPTERIS IS FOUND')] }),
    A('cm_glossopteris_india_purple', { cutW: 'South', over: [note('GLOSSOPTERIS FROM INDIA · ' + IL)] }),
    A('cm_glossopteris_australia_dark', { cutW: 'Antarctica', over: [note('GLOSSOPTERIS FROM AUSTRALIA · ' + IL)] }),
  ]);
  beats('A010', [
    A('cm_map_wegener_pangaea_1929', { over: [low('~300 MILLION YEARS AGO: PANGAEA', 'Pangaea'), note("ALFRED WEGENER'S MAP OF PANGAEA, 1929")] }),
    A('cm_map_pangaea_200ma', { cutW: 'Its', over: [note('MAP: PANGAEA, 200 MILLION YEARS AGO (GPLATES)')] }),
    A('cm_map_wegener_fossil_gondwana', { cutW: 'Antarctica', over: [low('ANTARCTICA: RIGHT IN THE MIDDLE', 'middle'), note('MAP: GONDWANA AND ITS FOSSILS (USGS)')] }),
  ]);
  beats('A011', [
    A('cm_map_jurassic_gondwana_breakup_usgs', { over: [note('MAP: GONDWANA BREAKS UP (USGS)')] }),
    A('cm_map_india_leaves_antarctica_120ma', { cutW: 'India', over: [low('INDIA: UP TO 20 CM (8 IN) A YEAR', 'twenty'), note('MAP: 120 MILLION YEARS AGO (GPLATES)')] }),
    S('stats', { cutW: 'Most', head: 'MOST PLATES', items: [], over: [at(head('2–5 CM A YEAR', null, 520, 120, Yc), 0.3), { ...chipC('≈ HOW FAST YOUR FINGERNAILS GROW', null, 700, 46), w: 'fingernails' }] }),
  ]);
  beats('A012', [A('cm_transantarctic_above_clouds', { over: [low('INDIA HITS ASIA → THE HIMALAYAS', 'Himalayas'), note('HIGH PEAKS (TRANSANTARCTIC MOUNTAINS) · ' + IL)] })]);
  beats('A013', [
    A('cm_map_south_atlantic_opens_126ma', { over: [note('MAP: 126 MILLION YEARS AGO (GPLATES)')] }),
    A('cm_map_gondwana_breakup_65ma_grobe', { cutW: 'Animals', over: [low('STILL JOINED TO SOUTH AMERICA AND AUSTRALIA', 'joined'), note('MAP: 65 MILLION YEARS AGO')] }),
    S('globe', ANT({ cutW: 'by', pins: [{ ...G.sp, label: 'SOUTH POLE', at: 0.2, small: true, size: 40 }] })),
  ]);
  beats('A014', [A('cm_reconstruction_cryolophosaurus_bogdanov', { over: [head('HOW DID ANYTHING LIVE THERE?', null, 170, 80), note(REC + ' · DMITRY BOGDANOV')] })]);

  // ===== CH2 =====
  chapter('A015', 1, 'Dinosaurs in the dark');
  beats('A015', [
    A('cm_transantarctic_beardmore_icebridge_2013', { over: [low('MOUNT KIRKPATRICK, 1990–91', 'Kirkpatrick'), note('TRANSANTARCTIC MTS NEAR THE BEARDMORE (NASA, 2013)')] }),
    S('globe', ANT({ cutW: 'about', lon: [[0, 166], [3, 166]], lat: [[0, -82], [3, -84]], R: [[0, 1700], [3, 4200]], pins: [{ ...G.kirk, label: 'MOUNT KIRKPATRICK', at: 0.6, small: true, size: 44 }, { ...G.sp, label: 'SOUTH POLE', at: 0.3, small: true, size: 36, color: C('iceL') }] })),
    A('cm_transantarctic_layered_cliffs_2013', { cutW: 'They', over: [low('~4,000 M UP: BONES IN THE ROCK', 'bones'), note('LAYERED ROCK, TRANSANTARCTIC MTS (NASA, 2013)')] }),
  ]);
  beats('A016', [
    A('cm_geomaud_dallmann_camp_1995', { over: [low('WILLIAM HAMMER, PALEONTOLOGIST', 'Hammer'), note('A GEOLOGY FIELD CAMP IN ANTARCTICA, 1995 · ' + IL)] }),
    A('cm_cryolophosaurus_hip_bones', { cutW: 'His', over: [low('~2,300 KG OF ROCK IN 3 WEEKS', 'three'), note('CRYOLOPHOSAURUS HIP BONES (REAL FOSSIL), FIELD MUSEUM')] }),
  ]);
  beats('A017', [
    A('cm_cryolophosaurus_holotype_skull_1', { kb: { z: [1.05, 1.25] }, over: [low('~6.5 M (21 FT)', 'six'), note('CRYOLOPHOSAURUS: REAL SKULL (FIELD MUSEUM)')] }),
    A('cm_cryolophosaurus_crest_cast_1', { cutW: 'crest', over: [note('THE CREST (CAST), ORTON GEOLOGY MUSEUM')] }),
    A('cm_cryolophosaurus_orton_skull_closeup', { cutW: 'Scientists', over: [low('"ELVISAURUS"', 'Elvisaurus'), note('CAST, ORTON GEOLOGY MUSEUM')] }),
    A('cm_reconstruction_cryolophosaurus_2022', { cutW: 'It', over: [low('~190 MILLION YEARS AGO', 'hundred'), note(REC + ' · LEOOMAS 2022')] }),
  ]);
  beats('A018', [
    fos('cm_glacialisaurus_holotype_bones', 'GLACIALISAURUS FOOT BONES (REAL FOSSIL), FIELD MUSEUM'),
    A('cm_reconstruction_glacialisaurus_model', { cutW: 'Two', over: [note('MUSEUM MODEL: GLACIALISAURUS AND CRYOLOPHOSAURUS · ' + REC)] }),
  ]);
  beats('A019', [
    A('cm_reconstruction_antarctopelta_vegavis_drawing', { over: [note('LATE CRETACEOUS ANTARCTICA · ' + REC)] }),
    S('globe', ANT({ cutW: 'In', lon: [[0, -100], [3, -107]], lat: [[0, -72], [3, -74]], R: [[0, 1700], [3, 3200]], pins: [{ ...G.amund, label: 'AMUNDSEN SEA CORE, 2017', at: 0.4, small: true, size: 44 }] })),
    F('px_misty_conifer_forest_hills', { cutW: 'The', over: [low('SOIL + A 3-M WEB OF FOSSIL ROOTS', 'roots'), note('SWAMPY TEMPERATE RAINFOREST, TASMANIA · ' + IL)] }),
    A('cm_andrill_core_table', { cutW: 'swampy', over: [note('A SEABED CORE FROM ANTARCTICA (ANDRILL) · ' + IL)] }),
  ]);
  beats('A020', [
    S('stats', { head: 'NOVEMBER 2024', items: [], sfx: 'boom', over: [at(head('THE FIRST AMBER', null, 500, 110, Yc), 0.05), at(head('EVER FOUND IN ANTARCTICA', null, 630, 70), 0.3)], source: 'Source: Alfred Wegener Institute (AWI), Antarctic Science 2024' }),
    A('px_monkey_puzzle_cones', { cutW: 'Drops', over: [note('CONIFER (ARAUCARIA) TODAY · ' + IL)] }),
  ]);
  beats('A021', [
    S('globe', ANT({ lon: [[0, -100], [3, -100]], lat: [[0, -80], [3, -82]], R: [[0, 1700], [3, 1600]], pins: [{ ...G.amund, label: 'THE RAINFOREST', at: 0.2, small: true, size: 40 }], labels: [{ lon: -40, lat: -62, text: 'MONTHS OF DARKNESS EVERY WINTER', w: 'months', size: 40, color: C('iceL') }] })),
    A('cm_reconstruction_leaellynasaura_polar_coast', { cutW: 'So', over: [head('HOW DID ANYTHING SURVIVE THE DARK?', null, 170, 70), note(REC + ' · POLAR DINOSAURS')] }),
  ]);
  beats('A022', [
    A('cm_long_island_view_james_ross_2003', { over: [low('JAMES ROSS ISLAND, 1986', 'James'), note('LOOKING TO JAMES ROSS ISLAND, 2003')] }),
    A('cm_antarctopelta_jaw_fossil', { cutW: 'found', over: [low('EDUARDO OLIVERO & ROBERTO SCASSO', 'Olivero'), note('ANTARCTOPELTA: LOWER JAW (REAL FOSSIL)')] }),
    A('cm_reconstruction_antarctopelta', { cutW: 'Antarctopelta', over: [note(REC + ' · L. MARTINEZ-REZA')] }),
    A('cm_reconstruction_antarctopelta_model', { cutW: 'For', over: [low('FOR 40 YEARS: "THE FIRST"', 'first'), note('MUSEUM MODEL · ' + REC)] }),
  ]);
  beats('A023', [
    S('stats', { head: '2026', items: [], sfx: 'boom', over: [at(head('40 YEARS IN A DRAWER', null, 520, 110, Yc), 0.3), { ...chipC('BRITISH ANTARCTIC SURVEY', null, 680, 44), w: 'Survey' }], source: 'Source: Barrett et al. 2026 (BAS)' }),
    A('cm_sauropodomorph_bones_antarctica', { cutW: 'titanosaur', over: [note('LONG-NECKED DINOSAUR BONES FROM ANTARCTICA (FIELD MUSEUM) · ' + IL)] }),
    S('stats', { cutW: 'December', head: 'MICHAEL THOMSON, GEOLOGIST', items: [], over: [at(head('9 DECEMBER 1985', null, 520, 100, Yc), 0.05), { ...chipC('ONE MONTH EARLIER', null, 680, 50), w: 'month' }] }),
  ]);
  beats('A024', [
    A('cm_reconstruction_trinisaura_mendez', { over: [note('TRINISAURA · ' + REC)] }),
    fos('cm_imperobator_holotype_bones', 'IMPEROBATOR LEG BONES (REAL FOSSIL, PAPER FIGURE)', { cutW: 'raptor-like' }),
    S('stats', { cutW: 'single', head: 'A DUCK-BILLED DINOSAUR', items: [], over: [at(head('FROM A SINGLE TOOTH', null, 540, 100, Yc), 0.2)], source: 'Source: Case et al. 2000' }),
  ]);
  beats('A025', [
    S('globe', { relief: true, borders: false, lon: [[0, -150], [3, -151]], lat: [[0, 60], [3, 66]], R: [[0, 900], [3, 1500]], pins: [{ ...G.alaska, label: 'NORTHERN ALASKA, 2021', at: 0.4, small: true, size: 44 }] }),
    A('cm_reconstruction_leaellynasaura_side', { cutW: 'A', over: [low('BABY DINOSAURS, JUST HATCHED', 'baby'), note('A SMALL POLAR DINOSAUR · ' + REC)] }),
    A('cm_reconstruction_trinisaura_martinez', { cutW: 'So', over: [low('THEY STAYED THROUGH THE POLAR NIGHT', 'stayed'), note('TRINISAURA · ' + REC)] }),
  ]);
  beats('A026', [
    A('cm_taniwhasaurus_mosasaur_field_museum', { over: [note('ANTARCTIC MOSASAUR TANIWHASAURUS (CAST), FIELD MUSEUM')] }),
    A('cm_reconstruction_aristonectes_nobu_tamura', { cutW: 'long-necked', over: [note('LONG-NECKED PLESIOSAUR · ' + REC + ' · NOBU TAMURA')] }),
    fos('cm_diplomoceras_giant_ammonite_antarctica', 'GIANT AMMONITE DIPLOMOCERAS, SEYMOUR ISLAND (REAL FOSSIL)', { cutW: 'ammonites' }),
  ]);
  beats('A027', [S('globe', { relief: true, borders: false, lon: [[0, -95], [3, -89]], lat: [[0, 10], [3, 20]], R: [[0, 900], [3, 1500]], waves: [{ ...G.chix, at: 2.2, n: 5, speed: 300 }], pins: [{ ...G.chix, label: 'CHICXULUB, MEXICO', w: 'Mexico', small: true, size: 44, color: C('red') }], labels: [{ lon: -95, lat: 30, text: '66 MILLION YEARS AGO · ~10 KM ROCK', at: 0.4, size: 40, color: C('yellow') }] })]);

  // ===== CH3 =====
  chapter('A028', 2, 'The last summer');
  beats('A028', [
    A('cm_marambio_base_seymour_aerial_2023', { over: [low('SEYMOUR ISLAND', 'Seymour'), note('SEYMOUR (MARAMBIO) ISLAND, 2023')] }),
    A('cm_map_seymour_island_geology', { cutW: 'Scientists', over: [low('6,000+ FOSSILS COUNTED', 'six'), note('MAP: SEYMOUR ISLAND ROCK LAYERS (CRAME ET AL. 2014)')] }),
    S('stats', { cutW: 'Around', head: 'SEYMOUR ISLAND, 66 MILLION YEARS AGO', items: [], sfx: 'boom', over: [{ ...cnt(undefined, 66, { from: 0, dur: 1.2, pre: '~', suf: '%', label: 'OF SPECIES VANISHED, SUDDENLY', y: 560, size: 200 }), at: 0.3 }], source: 'Source: Witts et al. 2016' }),
    A('px_ammonite_in_rock', { cutW: 'The', over: [low('THE LAST 7 KINDS OF AMMONITE: GONE', 'seven'), note('AMMONITE FOSSIL · ' + IL)] }),
  ]);
  beats('A029', [
    A('cm_seymour_island_landscape_2023', { over: [note('SEYMOUR ISLAND TODAY, 2023')] }),
    A('cm_vegavis_fossil_expo_tokyo', { cutW: 'On', over: [low('VEGAVIS, A COUSIN OF TODAY\'S DUCKS', 'Vegavis'), note('VEGAVIS FOSSIL (CAST)')] }),
    A('cm_reconstruction_vegavis', { cutW: 'It', over: [note('VEGAVIS · ' + REC)] }),
  ]);
  beats('A030', [F('px_mossy_forest_stream_sunrays', { over: [head('ANTARCTICA GOT WARMER', null, 180, 90, Yc), note(IL)] })]);
  beats('A031', [
    S('globe', ANT({ lon: [[0, 136], [3, 136]], lat: [[0, -70], [3, -68]], R: [[0, 1700], [3, 2600]], pins: [{ ...G.wilkes, label: 'IODP EXPEDITION 318, 2010', at: 0.4, small: true, size: 42 }] })),
    F('ia_1967_navy_icebreaker_eastwind', { cutW: 'The', over: [low('CARLOTA ESCUTIA & HENK BRINKHUIS', 'Escutia'), note('A SHIP IN ANTARCTIC ICE, 1960s · ' + IL)] }),
  ]);
  beats('A032', [
    F('px_fern_jungle_greenhouse', { over: [low('53 MILLION YEARS AGO: PALM POLLEN', 'palm'), note('PALMS AND FERNS (BOTANICAL GARDEN) · ' + IL)] }),
    A('px_baobab_tarangire', { cutW: 'relatives', over: [low('AND BAOBAB RELATIVES', 'baobab'), note('BAOBAB, TANZANIA · ' + IL)] }),
    F('px_rainforest_clouds_hills', { cutW: 'On', over: [note('A NEAR-TROPICAL RAINFOREST · ' + IL)] }),
  ]);
  beats('A033', [S('ladder', { title: 'THE COAST OF ANTARCTICA, ~53 MILLION YEARS AGO', min: -30, max: 30, items: [{ v: 10, label: 'EVEN IN WINTER: ABOVE +10°C', sub: '50°F · IN THE POLAR NIGHT', w: 'ten', hl: true }], source: 'Source: Pross et al. 2012, Nature' })]);
  beats('A034', [
    A('cm_marambio_base_seymour_aerial_2023', { kb: { z: [1.35, 1.15] }, over: [low('SEYMOUR ISLAND: THE FIRST ANTARCTIC MAMMAL (1982)', 'Seymour'), note('SEYMOUR ISLAND, 2023')] }),
    A('cm_reconstruction_eocene_antarctic_pond', { cutW: 'It', over: [low('A MARSUPIAL: THE FIRST LAND MAMMAL FROM ANTARCTICA', 'marsupial'), note('EOCENE ANTARCTICA · ' + REC)] }),
    A('cm_llanocetus_whale_skull_seymour', { cutW: 'first', over: [note('ALSO FROM SEYMOUR: AN EOCENE WHALE SKULL (REAL FOSSIL)')] }),
  ]);
  beats('A035', [
    F('gov_nasa_continental_drift_atlantic_opens', { over: [low('SOUTH AMERICA → ANTARCTICA → AUSTRALIA', 'bridge'), note('NASA VISUALIZATION: CONTINENTAL DRIFT')] }),
    A('px_tasmania_forest_boardwalk', { cutW: 'Australia\'s', over: [low('KOALAS, KANGAROOS: PROBABLY THIS WAY', 'koalas'), note('SOUTHERN BEECH FOREST, TASMANIA · ' + IL)] }),
  ]);
  beats('A036', [A('cm_reconstruction_kumimanu_nobu_tamura', { over: [low("ANTARCTICA'S LAST SUMMER", 'last'), note('GIANT FOSSIL PENGUIN · ' + REC + ' · NOBU TAMURA')] })]);

  // ===== CH4 =====
  chapter('A037', 3, 'The slow freeze');
  beats('A037', [S('stats', { head: 'OVER MILLIONS OF YEARS', items: [], over: [at(head('CARBON DIOXIDE FELL', null, 540, 100, Yc), 0.05)], source: 'Sources: Pagani et al. 2011; DeConto & Pollard 2003' })]);
  beats('A038', [
    A('cm_royal_society_range_noaa_1999', { over: [low('ONE LEADING IDEA: THE HIMALAYAS', 'Himalayas'), note('ROYAL SOCIETY RANGE, ANTARCTICA (NOAA) · ' + IL)] }),
    A('cm_apocalypse_peaks_aster', { cutW: 'That', over: [low('WEATHERING LOCKS CO₂ INTO STONE', 'stone'), note('BARE ROCK FROM SPACE (NASA ASTER) · ' + IL)] }),
  ]);
  beats('A039', [
    A('cm_map_gondwana_breakup_38ma_grobe', { over: [low('TASMANIAN SEAWAY: ~35.5 MILLION YEARS AGO', 'thirty-five'), note('MAP: 38 MILLION YEARS AGO (H. GROBE / AWI)')] }),
    A('cm_map_scotia_sea_bathymetry_noaa', { cutW: 'South', over: [low('THE DRAKE PASSAGE: ~800 KM', 'eight'), note('MAP: DRAKE PASSAGE SEAFLOOR (NOAA)')] }),
    A('cm_drake_passage_storm_wave_2005', { cutW: 'eight', over: [note('DRAKE PASSAGE, 2005')] }),
  ]);
  beats('A040', [
    F('gov_nasa_perpetual_ocean_south_pole', { over: [low('THE ANTARCTIC CIRCUMPOLAR CURRENT', 'current'), note('NASA PERPETUAL OCEAN')] }),
    S('stats', { cutW: 'Today', head: 'EVERY SECOND', items: [], sfx: 'boom', over: [at(head('~170 MILLION M³', null, 520, 110, Yc), 0.3)], source: 'Source: Donohue et al. 2016' }),
    F('gov_nasa_perpetual_ocean_south_america_antarctica', { cutW: 'That\'s', over: [low('> 100× ALL THE RIVERS ON EARTH', 'hundred'), note('NASA PERPETUAL OCEAN')] }),
    A('cm_map_circumpolar_current_globe', { cutW: 'It', over: [low('A WALL AGAINST WARM WATER', 'wall'), note('MAP: THE CURRENT RING (NASA)')] }),
  ]);
  beats('A041', [
    F('gov_nasa_perpetual_ocean_australia_southern', { over: [low('THE WALL: A HELPER, NOT THE CAUSE', 'helper'), note('NASA PERPETUAL OCEAN')] }),
    S('stats', { cutW: 'In', head: '2003', items: [], over: [at(head('ROBERT DECONTO & DAVID POLLARD', null, 520, 80, Yc), 0.3)], source: 'Source: DeConto & Pollard 2003, Nature' }),
    F('gov_nasa_sea_ice_growth_2024', { cutW: 'switch', over: [low('BELOW A CO₂ THRESHOLD, ICE COULD STAY', 'stay'), note('NASA VISUALIZATION (TODAY\'S SEA ICE) · ' + IL)] }),
  ]);
  beats('A042', [
    F('gov_nasa_sea_ice_ring_antarctica', { in: 2, over: [low('~34 MILLION YEARS AGO', 'thirty-four'), note('NASA VISUALIZATION (TODAY\'S ICE) · ' + IL)] }),
    F('gov_nasa_bedmap2_ice_returns', { cutW: 'In', over: [low('AN ICE SHEET IN A FEW HUNDRED THOUSAND YEARS', 'hundred'), note('NASA VISUALIZATION (BEDMAP2)')] }),
  ]);
  beats('A043', [
    S('stats', { head: 'ICE FEEDS ITSELF', items: [], over: [at(head('FRESH SNOW REFLECTS UP TO 90%', null, 470, 76, Yc), 0.3), { ...head('A FOREST: MAYBE A FIFTH', null, 590, 76), w: 'forest' }, { ...chipC('MORE ICE → LESS HEAT → MORE ICE', null, 740, 46), w: 'heat' }], source: 'Sources: NSIDC; Klages et al. 2020' }),
    F('gov_nasa_cloudy_globe_to_antarctica', { cutW: 'More', over: [note('NASA VISUALIZATION')] }),
  ]);
  beats('A044', [
    A('px_tasmania_overland_track_forest', { over: [low('THE LAST TREES: SOUTHERN BEECH', 'beech'), note('SOUTHERN BEECH FOREST, TASMANIA · ' + IL)] }),
    A('cm_oliver_bluffs_gully_beardmore', { cutW: 'Its', over: [low('BEECH FOSSILS ~500 KM FROM THE POLE', 'five'), note('OLIVER BLUFFS, BEARDMORE GLACIER')] }),
    A('px_tasmania_weindorfers_forest_light', { cutW: 'relatives', over: [low('STILL GROWING: PATAGONIA, TASMANIA, NEW ZEALAND', 'Patagonia'), note('MYRTLE BEECH, CRADLE MOUNTAIN, TASMANIA · ' + IL)] }),
  ]);
  beats('A045', [
    A('cm_wright_valley_aerial_2013', { over: [low('THE DRY VALLEYS: ~14 MILLION YEARS AGO', 'fourteen'), note('WRIGHT VALLEY, DRY VALLEYS (NASA, 2013)')] }),
    A('cm_taylor_glacier_snout_2009', { cutW: 'But', over: [note('TAYLOR GLACIER, DRY VALLEYS, 2009')] }),
  ]);
  beats('A046', [F('gov_nasa_bedmap2_ice_globe', { over: [head('THE ICE ONLY COVERED IT', null, 180, 90, Yc), note('NASA VISUALIZATION (BEDMAP2)')] })]);

  // ===== CH5 =====
  chapter('A047', 4, 'What the ice hides');
  beats('A047', [
    F('ia_1961_navy_surveyor_theodolite', { over: [low('1958: SOUND WAVES INTO THE ICE', 'sound'), note('SURVEYING IN ANTARCTICA, c.1960 · ' + IL)] }),
    S('globe', ANT({ cutW: 'They', lon: [[0, 76], [3, 76]], lat: [[0, -78], [3, -80]], R: [[0, 1700], [3, 2600]], pins: [{ ...G.gamb, label: 'GAMBURTSEV MOUNTAINS', at: 0.5, small: true, size: 44 }] })),
  ]);
  beats('A048', [
    F('gov_nasa_bedmap2_ice_peels_off', { over: [low('2008–09: RADAR FROM TWO SMALL PLANES', 'radar'), note('NASA VISUALIZATION (BEDMAP2)')] }),
    F('gov_nasa_bedmap2_bedrock_flyover', { cutW: 'the', over: [low('"THE SIZE OF THE EUROPEAN ALPS"', 'Alps'), note('MAP OF THE ROCK UNDER THE ICE (NASA BEDMAP2)')] }),
    A('cm_map_deglaciated_antarctica_topography', { cutW: 'No', over: [low('NO HUMAN HAS EVER SEEN THEM', 'seen'), note('MAP: ANTARCTICA WITHOUT ITS ICE (R. ROHDE)')] }),
  ]);
  beats('A049', [
    A('cm_map_antarctic_bedrock', { over: [low('ROOTS: ~1 BILLION YEARS OLD', 'billion'), note('MAP: THE ROCK UNDER THE ICE')] }),
    F('gov_nasa_rema_mountain_relief', { cutW: 'Some', over: [low('WHERE THE ICE SHEET WAS BORN?', 'born'), note('NASA 3D RELIEF · ' + IL)] }),
  ]);
  beats('A050', [
    A('cm_denman_glacier_bedrock_3d', { over: [low('DENMAN GLACIER: 3.5 KM BELOW SEA LEVEL', 'three'), note('DIAGRAM: THE CANYON UNDER DENMAN GLACIER (NASA)')] }),
    S('stats', { cutW: 'It', head: 'THE DEEPEST POINT ON LAND', items: [], sfx: 'boom', over: [at(head('−3,500 M', null, 520, 150, Yc), 0.3), { ...chipC('THE DEAD SEA SHORE: −430 M', null, 700, 46), w: 'Earth' }], source: 'Source: Morlighem et al. 2020, Nature Geoscience' }),
  ]);
  beats('A051', [
    F('gov_nasa_icesat2_subglacial_lakes_map', { over: [low('HUNDREDS OF LAKES UNDER THE ICE', 'Hundreds'), note('NASA ICESAT-2: SUBGLACIAL LAKES (WEST ANTARCTICA)')] }),
    A('cm_lake_vostok_drill_crosssection', { cutW: 'The', over: [low('LAKE VOSTOK: ~250 KM LONG', 'two'), note('DIAGRAM: LAKE VOSTOK (NSF)')] }),
  ]);
  beats('A052', [
    A('cm_epica_ice_core_drill', { over: [low('JANUARY 2025: BEYOND EPICA', 'January'), note('EUROPEAN ICE-CORE DRILLING (EPICA), 2002')] }),
    A('cm_wais_drilling_facility_1', { cutW: 'reached', over: [low('ICE ≥ 1.2 MILLION YEARS OLD', 'million'), note('AN ICE CORE (WAIS DIVIDE, 2012) · ' + IL)] }),
    A('cm_edml_ice_core_end', { cutW: 'Every', over: [low('BUBBLES OF ANCIENT AIR', 'bubbles'), note('ICE CORE FROM 2,775 M (EPICA)')] }),
  ]);

  // ===== CH6 =====
  chapter('A053', 5, 'Why it froze');
  beats('A053', [F('gov_nasa_globe_africa_to_antarctica', { over: [note('NASA VISUALIZATION')] })]);
  beats('A054', [
    S('stats', { head: 'NOT THE DRIFT', items: [], over: [at(head('IT WAS AT THE POLE WHEN IT WAS GREEN', null, 540, 64), 0.3)] }),
    F('gov_nasa_globe_americas_to_antarctica', { cutW: 'Not', over: [low('NOT THE ASTEROID: IT GOT WARMER AFTERWARDS', 'warmer'), note('NASA VISUALIZATION')] }),
  ]);
  beats('A055', [
    S('stats', { head: 'WHY ANTARCTICA FROZE', items: [], over: [at(head('1 · CARBON DIOXIDE FELL', null, 480, 84, Yc), 0.3), { ...head('2 · THE OCEAN CLOSED A RING', null, 620, 84), w: 'ocean' }], source: 'Sources: DeConto & Pollard 2003; Pagani et al. 2011' }),
    F('gov_nasa_ocean_flows_toward_ice', { cutW: 'the', over: [note('NASA VISUALIZATION: OCEAN CURRENTS')] }),
  ]);
  beats('A056', [
    S('stats', { head: 'CARBON DIOXIDE TODAY', items: [], sfx: 'boom', over: [at(head('> 420 PPM', null, 520, 140, Yc), 0.3), { ...chipC('PRE-INDUSTRIAL: ~280 PPM', null, 690, 46), at: 1.0 }], source: 'Source: NOAA' }),
    F('gov_nasa_globe_dive_amundsen_coast', { cutW: 'And', over: [note('NASA/JPL VISUALIZATION')] }),
    A('cm_thwaites_glacier_ice_front_nasa', { cutW: 'Thwaites', over: [low('THWAITES: ABOUT THE SIZE OF FLORIDA', 'Florida'), note('THWAITES GLACIER ICE FRONT (NASA)')] }),
    F('gov_nasa_ice_shelf_front_distance_2018', { cutW: 'Its', over: [low('A FRONT 120 KM WIDE', 'hundred'), note('WEST ANTARCTIC ICE-SHELF FRONT (NASA, 2018)')] }),
  ]);
  beats('A057', [
    A('cm_thwaites_satellite_2001_clean', { over: [low('2001', 'ice'), note('THWAITES GLACIER, LANDSAT, DEC 2001')] }),
    A('cm_thwaites_satellite_2019_clean', { cutW: 'doubled', over: [low('2019', 'doubled'), note('THWAITES GLACIER, LANDSAT, DEC 2019')] }),
    F('gov_nasa_warm_water_under_ice_shelf', { cutW: 'Tides', over: [low('WARM SEAWATER UNDER THE ICE', 'warm'), note('NASA VISUALIZATION')] }),
  ]);
  beats('A058', [
    F('gov_nasa_thwaites_thinning_red', { over: [low('FULL COLLAPSE: ~65 CM (2 FT) OF SEA LEVEL', 'sixty-five'), note('NASA: WHERE THWAITES AND PINE ISLAND LOST THE MOST ICE')] }),
    S('stats', { cutW: 'All', head: 'ALL OF WEST ANTARCTICA', items: [], over: [at(head('> 3 M (10 FT)', null, 520, 130, Yc), 0.3)], source: 'Source: ITGC 2025' }),
    F('gov_nasa_pine_island_rift_flyover_2011', { cutW: 'Scientists', over: [low('COLLAPSE UNLIKELY SOON · RETREAT SPEEDING UP', 'speeding'), note('PINE ISLAND GLACIER RIFT, 2011 (NASA)')] }),
  ]);
  beats('A059', [F('gov_nasa_draining_the_oceans_map', { over: [low('EVERY COASTLINE ON THE MAP', 'coastline'), note('NASA VISUALIZATION')] })]);

  // ===== ENDING =====
  beats('A060A', [
    A('cm_reconstruction_cryolophosaurus_side', { over: [head('WHICH ANTARCTICA WOULD YOU VISIT?', null, 180, 70), note(REC)] }),
    A('cm_cryolophosaurus_field_museum_wide', { cutW: 'among', over: [note('CRYOLOPHOSAURUS CAST, FIELD MUSEUM')] }),
  ]);
  beats('A060', [
    A('cm_scott_1911_wilson_sketching_beardmore', { kb: { z: [1.2, 1.05] }, over: [low('NATURAL HISTORY MUSEUM, LONDON', 'London'), note('DR EDWARD WILSON, BEARDMORE GLACIER, 1911')] }),
    fos('cm_glossopteris_leaf_antarctica_1', 'GLOSSOPTERIS FROM ANTARCTICA', { cutW: 'Two', kb: { z: [1.3, 1.1] } }),
    Wd('gov_nasa_lima_glacier_valley', { cutW: 'one', over: [note('ANTARCTICA TODAY (NASA LANDSAT)')] }),
  ]);
  add(T.tl.voiceEnd + 0.4, S('endscreen', {}), 'fade');
  return out;
}
module.exports = { assets, build, defaultTrans: 'cut', splitOver: 4.5, splitTo: 3 };
