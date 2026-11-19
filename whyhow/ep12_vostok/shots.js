// EP12 Vostok — real footage: US Navy Deep Freeze films 1957–69 (Internet Archive, PD), NASA visualisations, Wikimedia Commons photos of Vostok,
// Mirny, the South Pole and Concordia, Pixabay (ILLUSTRATIVE). The 1982 fire has no photos: our own diagrams, labelled.
const fs = require('fs'), path = require('path');
const MF = JSON.parse(fs.readFileSync(path.join(__dirname, 'footage/manifest.json')));
const FT = Object.fromEntries(MF.map(x => [x.key, x]));
const assets = {}; for (const x of MF) if (x.type === 'photo') assets[x.key] = 'footage/' + x.key + '.jpg';
const credit = k => { const f = FT[k]; if (!f || !f.attribution) return ''; if (f.source === 'pixabay') return '';
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
const G = { vos: { lon: 106.8, lat: -78.47 }, mir: { lon: 93.01, lat: -66.55 }, pro: { lon: 76.38, lat: -69.38 }, sp: { lon: 0, lat: -89.99 }, dc: { lon: 123.35, lat: -75.1 },
  poi: { lon: 54.97, lat: -83.1 }, domeA: { lon: 77.1, lat: -80.37 }, oym: { lon: 143.2, lat: 63.46 } };
const pt = g => [g.lon, g.lat];
const ANT = (o = {}) => ({ relief: true, ice: true, borders: false, lon: [[0, 100], [3, 100]], lat: [[0, -74], [3, -76]], R: [[0, 1700], [3, 1900]], ...o });

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

  // ===== COLD OPEN =====
  beats('A001', [
    A('cm_vostok_1970s_view', { over: [low('12 APRIL 1982 · 4 A.M.', 'April'), note('VOSTOK STATION (1973 PHOTO)')] }),
    S('globe', ANT({ cutW: 'Vostok', lon: [[0, 80], [3, 106]], lat: [[0, -55], [3, -76]], R: [[0, 600], [3, 1900]], pins: [{ ...G.vos, label: 'VOSTOK', w: 'Vostok', size: 54 }] })),
    Wd('ia_1967_navy_night_lights_station', { cutW: 'Outside', over: [low('BELOW −55°C', 'far'), note('A POLAR STATION AT NIGHT, 1960s · ' + IL)] }),
    A('cm_concordia_sunset', { cutW: 'eleven', over: [low('POLAR NIGHT IN 11 DAYS', 'eleven'), note('LAST SUNSET, CONCORDIA STATION · ' + IL)] }),
  ], { start: 0 });
  beats('A002', [
    F('ia_1967_navy_powerplant_panel', { over: [note('A POLAR POWER STATION, 1960s · ' + IL)] }),
    S('firemap', { cutW: 'power', fireW: 'fire', spreadW: 'fifteen', title: 'VOSTOK, 12 APRIL 1982, ABOUT 4 A.M.' }),
  ]);
  beats('A003', [
    S('stats', { head: 'BY MORNING', items: [], sfx: 'boom', over: [at(head('NO ELECTRICITY', null, 400, 84, Yc), 0.3), { ...head('NO HEATING', null, 520, 84, Yc), w: 'heating' }, { ...head('NO POWER TO MELT SNOW FOR WATER', null, 640, 64, Yc), w: 'melt' }], source: 'Sources: AARI (2017), RT (2022), Nauka i Zhizn (2001)' }),
    Wd('ia_1967_navy_night_lights_station', { cutW: 'One', in: 4, over: [low('1 DEAD · 20 ALIVE', 'Twenty'), note('A POLAR STATION AT NIGHT, 1960s · ' + IL)] }),
  ]);
  beats('A004', [St('px_blowing_snow_storm', { over: [head('NOBODY CAN COME', null, 200, 100), note(IL)] })]);
  beats('A005', [
    S('ladder', { title: 'THE COLDEST AIR EVER MEASURED', min: -100, max: 0, items: [{ v: -89.2, label: 'VOSTOK, 21 JULY 1983', sub: '−128°F · WMO WORLD RECORD', w: 'minus', hl: true }], source: 'Source: World Meteorological Organization' }),
    A('cm_vostok_station_core', { cutW: 'People', over: [low('WINTERED ALMOST EVERY YEAR SINCE 1957', 'nineteen'), note('VOSTOK STATION FROM THE AIR (NOAA)')] }),
    A('cm_vostok_crew_immortal_regiment', { cutW: 'So', over: [head('HOW DO PEOPLE SURVIVE HERE?', null, 200, 80), note('VOSTOK WINTER CREW, POLAR NIGHT, 2022')] }),
  ]);
  beats('A006', [
    F('ia_1967_navy_powerplant_mechanic', { over: [head('TECHNOLOGY?', null, 200, 120, Yc), note('A POLAR POWER STATION, 1960s · ' + IL)] }),
    St('ia_1968_navy_two_men_walking_wind', { cutW: 'But', over: [low('1982: THEY LOST ALL OF IT', 'lost'), note('A STATION IN A BLIZZARD, 1960s · ' + IL)] }),
  ]);
  beats('A007', [
    F('ia_1968_navy_c130_jato_takeoff', { over: [head('RESCUE?', null, 200, 120, Yc), note('US NAVY LC-130, 1960s · ' + IL)] }),
    F('ia_1969_navy_lc130_takeoff_long', { cutW: 'But', over: [low('~9 MONTHS A YEAR: NO PLANE, NO TRACTOR', 'nine'), note('LAST FLIGHT OUT, McMURDO AREA, 1969 · ' + IL)] }),
  ]);
  beats('A008', [
    A('cm_vostok_1960s_settlement', { cutW: 'First', over: [low('1 · WHY HERE', 'why'), note('VOSTOK, 1966')] }),
    Wd('ia_1961_navy_frosted_beard_face', { cutW: 'Then', over: [low('2 · BODY AND MACHINE', 'body'), note('ANTARCTICA, c.1960 · ' + IL)] }),
    S('firemap', { cutW: 'back', fireW: 'night', spreadW: 'fire', title: 'VOSTOK, 12 APRIL 1982', over: [{ ...chipC('3 · THE NIGHT OF THE FIRE', null, 1010, 40), w: 'fire' }] }),
    A('cm_vostok_2024_new_winter_complex', { cutW: 'end', kb: { z: [1.4, 1.3], x: [0.3, 0.32] }, over: [low('4 · THE LESSON', 'lesson'), note('VOSTOK, 2024')] }),
  ]);
  add(T.e('A008') + 0.15, S('title', { lines: ['VOSTOK:', 'THE COLDEST PLACE', 'EVER MEASURED'], hl: 1, img: 'cm_vostok_station_plateau', credit: credit('cm_vostok_station_plateau'), brand: true, sfx: 'riser' }), 'cut');

  // ===== CH1 (no card) =====
  beats('A009', [
    F('ia_1957_navy_map_antarctica_labels', { over: [note('US NAVY FILM, 1957')] }),
    A('cm_south_pole_1960s', { cutW: 'America', over: [low('USA: THE SOUTH POLE', 'South'), note('SOUTH POLE STATION, 1960s')] }),
    S('globe', ANT({ cutW: 'So', lon: [[0, 70], [4, 85]], lat: [[0, -78], [4, -80]], R: [[0, 1500], [4, 1700]],
      pins: [{ ...G.sp, label: 'SOUTH POLE (USA)', at: 0.3, small: true, size: 40, color: C('iceL') }, { ...G.vos, label: 'GEOMAGNETIC POLE', w: 'Geomagnetic', small: true, size: 44 }, { ...G.poi, label: 'POLE OF INACCESSIBILITY', w: 'Inaccessibility', small: true, size: 40, lx: -20, ly: 40 }] })),
  ]);
  beats('A010', [
    A('cm_vostok_visitors_flag', { over: [low('FOUNDED 16 DECEMBER 1957', 'December'), note('VOSTOK, 1967')] }),
    F('ia_1961_navy_tractor_train_whiteout', { cutW: 'tractor', over: [note('A TRACTOR TRAIN ON THE ICE, c.1960 · ' + IL)] }),
    A('cm_dome_c_snow_surface', { cutW: 'three', over: [low('3,488 M · ~11,500 FT', 'three'), note('THE EAST ANTARCTIC PLATEAU (DOME C) · ' + IL)] }),
  ]);
  beats('A011', [
    S('globe', ANT({ lon: [[0, 100], [3, 100]], lat: [[0, -70], [3, -73]], R: [[0, 1900], [3, 2300]],
      routes: [{ pts: [pt(G.mir), [100, -72], pt(G.vos)], at: 0.6, dur: 2.2, w: 6, label: '~1,400 KM', lx: 20 }],
      pins: [{ ...G.mir, label: 'MIRNY', at: 0.3, small: true, size: 46 }, { ...G.vos, label: 'VOSTOK', at: 2.6, small: true, size: 46 }],
      labels: [{ lon: 108, lat: -64, text: '≈ LONDON → ROME', w: 'London', size: 38, color: C('yellow') }, { lon: 108, lat: -62, text: '≈ CHICAGO → DENVER', w: 'Chicago', size: 38, color: C('yellow') }] })),
    A('cm_kharkovchanka_tractor', { cutW: 'road', over: [low('NO ROAD · ONLY TRACKS IN THE SNOW', 'tracks'), note('KHARKOVCHANKA, THE MIRNY–VOSTOK TRACTOR (MIRNY)')] }),
  ]);
  beats('A012', [
    S('ladder', { title: 'THE FIRST WINTERS', min: -100, max: 0, items: [{ v: -87.2, label: '1958', sub: 'THE FIRST WINTER', w: 'eighty-seven', dy: -110 }, { v: -88.3, label: '1960', sub: 'WORLD RECORD', w: 'eighty-eight', hl: true, dy: 50 }], source: 'Source: AARI (2013)' }),
  ]);
  beats('A013', [
    St('ia_1961_navy_camp_blowing_snow', { over: [note('ANTARCTICA, c.1960 · ' + IL)] }),
    S('stats', { cutW: 'Diesel', head: 'VASILY SIDOROV, STATION CHIEF, 1960', items: [], sfx: 'boom', over: [at(head('DIESEL: A STICKY MASS', null, 420, 80, Yc), 0.3), { ...head('ANTIFREEZE: CRYSTALS', null, 540, 80, Yc), w: 'Antifreeze' }, { ...head('METAL: BRITTLE', null, 660, 80, Yc), w: 'Metal' }], source: 'As reported in The Press, Christchurch, 3 Jan 1961' }),
  ]);
  beats('A014', [
    F('ia_1967_navy_powerplant_mechanic', { in: 6, over: [low('THE MAIN GENERATOR\'S FRAME CRACKED', 'cracked'), note('A POLAR DIESEL ENGINE, 1960s · ' + IL)] }),
    F('ia_1957_navy_fuel_tank_welding', { cutW: 'At', in: 5, over: [low('NOT ENOUGH OXYGEN TO WELD', 'oxygen'), note('WELDING IN ANTARCTICA, 1956 · ' + IL)] }),
  ]);
  beats('A015', [S('supplyline', { title: 'ONE MACHINE, THREE JOBS', nodes: [{ id: 'die', name: 'DIESEL', x: 300, y: 540, src: true }, { id: 'li', name: 'LIGHT', x: 820, y: 540 }, { id: 'he', name: 'HEAT', x: 1240, y: 540 }, { id: 'wa', name: 'WATER (MELTED SNOW)', x: 1640, y: 540 }], events: [] })]);

  // ===== CH2 =====
  chapter('A016', 2, 'What the cold does');
  beats('A016', [
    A('cm_vostok_station_plateau', { over: [note('VOSTOK, 2000')] }),
    S('stats', { cutW: 'but', head: 'THIN AIR', items: [], over: [at(head('3,488 M ON THE MAP', null, 440, 80), 0.3), { ...head('~4,000 M FOR YOUR LUNGS', null, 570, 80, Yc), w: 'lungs' }, ], source: 'AARI air pressure (624 hPa); our standard-atmosphere calculation' }),
    Wd('ia_1968_navy_men_pushing_wind', { cutW: 'There', over: [low('NEARLY 40% LESS OXYGEN PER BREATH', 'forty'), note('ANTARCTICA, 1960s · ' + IL)] }),
  ]);
  beats('A017', [
    Wd('ia_1961_navy_parka_faces_goggles', { over: [note('ANTARCTICA, c.1960 · ' + IL)] }),
    S('stats', { cutW: 'five', head: 'SERGEY BUSHMANOV, STATION DOCTOR', items: [], sfx: 'boom', over: [at(head('5–10 KG', null, 500, 140, Yc), 0.4), at(head('(10–20 LB) IN THE FIRST MONTH', null, 640, 56), 0.8)], source: 'Russia Beyond / gw2ru interview' }),
  ]);
  beats('A018', [
    A('cm_concordia_frozen_face', { over: [low('−70°C: NO MORE THAN 10 MINUTES OUTSIDE', 'ten'), note('WINTER-OVER, CONCORDIA STATION · ' + IL)] }),
    A('cm_concordia_icicles_clothing', { cutW: 'A', over: [low('MASKS COMPULSORY', 'mask'), note('CONCORDIA STATION · ' + IL)] }),
    F('ia_1967_navy_greeting_party_parkas', { cutW: 'And', over: [low('≥ HALF OF EVERY CREW: VOSTOK VETERANS', 'half'), note('A SOVIET STATION, 1967 · ' + IL)] }),
  ]);
  beats('A018B', [
    A('cm_vostok_2017_water_provisioning_3', { over: [note('VOSTOK, FEBRUARY 2017: THE SNOW QUARRY')] }),
    A('cm_vostok_2017_water_provisioning_1', { cutW: 'carries', over: [note('VOSTOK, 2017')] }),
    A('cm_vostok_2017_winter_water_provisioning', { cutW: 'melts', over: [low('EVERY DROP OF WATER STARTS AS SNOW', 'melts'), note('VOSTOK, AUGUST 2017: SNOW TO BE MELTED')] }),
  ]);
  beats('A019', [
    S('yearbar', { title: 'A YEAR AT VOSTOK', bands: [{ from: 113, to: 233, label: 'POLAR NIGHT', color: '#2A3E6E', row: -1, w: 'April' }], marks: [{ day: 225, label: 'AUGUST: −68°C AVERAGE', w: 'August', color: C('iceL'), low: true }], source: 'Source: AARI' }),
    F('cm_south_pole_aurora_curtain_1997', { cutW: 'That', over: [note('POLAR NIGHT, SOUTH POLE, 1997 · ' + IL)] }),
  ]);
  beats('A020', [
    S('yearbar', { title: 'A YEAR AT VOSTOK', bands: [{ from: 113, to: 233, label: 'POLAR NIGHT', color: '#2A3E6E', row: -1, at: 0.01 }, { from: 56, to: 316, label: 'BELOW −55°C: NO PLANES, NO TRACTORS', color: '#E63946', row: 1, w: 'February' }], source: 'Source: AARI' }),
    F('ia_1967_navy_c130_takeoff', { cutW: 'Too', in: 4, over: [note('LC-130, 1960s · ' + IL)] }),
  ]);
  beats('A021', [
    S('globe', ANT({ lon: [[0, 88], [3, 92]], lat: [[0, -72], [3, -74]], R: [[0, 2000], [3, 2300]],
      routes: [{ pts: [pt(G.pro), [90, -74], pt(G.vos)], at: 0.8, dur: 2.4, w: 6, label: '~1,400 KM BY TRACTOR', lx: 20, ly: 40 }],
      pins: [{ ...G.pro, label: 'PROGRESS', w: 'Progress', small: true, size: 44 }, { ...G.vos, label: 'VOSTOK', at: 0.4, small: true, size: 46 }] })),
    A('cm_progress_station', { cutW: 'Today', over: [note('PROGRESS STATION, 2007')] }),
    F('ia_1961_navy_snocat_traverse', { cutW: 'coast', over: [note('A TRAVERSE, c.1960 · ' + IL)] }),
  ]);
  beats('A022', [
    A('cm_south_pole_traverse_2006', { over: [low('~1/3 OF THE FUEL BURNED ON THE WAY', 'third'), note('A TRACTOR TRAIN ON THE PLATEAU (US TRAVERSE) · ' + IL)] }),
  ]);
  beats('A023', [
    F('ia_1968_navy_fuel_drums', { over: [note('FUEL DRUMS, 1960s · ' + IL)] }),
    S('stats', { cutW: 'It', head: 'WHEN THE FUEL DOES NOT ARRIVE', items: [], sfx: 'boom', over: [cnt('three', 3, { pre: '≥', label: 'WINTERS VOSTOK WAS CLOSED', y: 560, size: 220 })], source: 'Source: AARI (2013, 2017)' }),
  ]);
  beats('A024', [
    F('ia_1957_navy_fuel_tank', { over: [note('POLAR FUEL STORAGE, 1956 · ' + IL)] }),
    S('supplyline', { cutW: 'turned', title: 'THE WHOLE STATION LIVES ON ONE LINE', nodes: [{ id: 'pro', name: 'PROGRESS', x: 200, y: 540, src: true }, { id: 'tr', name: 'TRACTORS', x: 560, y: 540 }, { id: 'fu', name: 'FUEL STORE', x: 900, y: 540 }, { id: 'pw', name: 'POWER STATION', x: 1240, y: 540 }, { id: 'hl', name: 'HEAT · LIGHT · WATER', x: 1640, y: 540 }],
      events: [{ at: T.at('A024', 'nineteen') - T.s('A024'), year: '12 APRIL 1982', label: 'THE POWER STATION BURNS', cut: 'pw' }, { at: T.at('A024', 'burned') - T.s('A024'), year: '', label: 'THE POWER STATION BURNS', cut: 'hl' }] }),
  ]);

  // ===== CH3 =====
  chapter('A025', 3, 'The night of the fire');
  beats('A025', [
    A('cm_vostok_glaciological_pit', { kb: { z: [1.0, 1.15] }, over: [low('JANUARY 1982 · 21 MEN', 'Twenty-one'), note('VOSTOK, JANUARY 1982 (27TH SOVIET EXPEDITION)')] }),
    A('cm_vostok_1970s_exterior', { cutW: 'Their', over: [low('PYOTR ASTAKHOV, STATION LEADER', 'Astakhov'), note('VOSTOK, 1973')] }),
    F('ia_1967_navy_soviet_us_flags', { cutW: 'Americans', over: [note('A SOVIET STATION WELCOMES AMERICANS, 1967')] }),
    A('cm_south_pole_1960s', { cutW: 'nineteen', over: [low('1967: 27 M UP A RADIO MAST AT −70°C', 'radio'), note('SOUTH POLE STATION, 1960s')] }),
    F('ia_1967_navy_polar_twilight_antennas', { cutW: 'There\'s', over: [low('TODAY: THE ASTAKHOV GLACIER', 'Glacier'), note('ANTENNAS AT A US STATION, 1960s · ' + IL)] }),
  ]);
  beats('A026', [
    F('ia_1961_navy_r4d_ski_landing', { over: [low('MARCH 1982: A FLIGHT AT BELOW −60°C', 'minus'), note('SKI PLANE, c.1960 · NOT THE ACTUAL AIRCRAFT')] }),
    A('cm_concordia_last_takeoff', { cutW: 'Then', over: [low('THE LAST PLANE LEAVES', 'last'), note('LAST TAKEOFF BEFORE WINTER, CONCORDIA · ' + IL)] }),
  ]);
  beats('A027', [
    F('ia_1961_navy_bunk_room', { over: [note('A STATION BUNK ROOM, c.1960 · ' + IL)] }),
    S('firemap', { cutW: 'fire', fireW: 'fire', spreadW: 'machine', title: 'VOSTOK, 12 APRIL 1982, ABOUT 4 A.M.', over: [{ ...chipC('WOKEN BY SMOKE: SERGEI KUZNETSOV, POWER TECHNICIAN', null, 1010, 40), at: 0.3 }] }),
  ]);
  beats('A028', [
    F('ia_1967_navy_powerplant_panel', { in: 8, over: [note('A POLAR POWER STATION, 1960s · ' + IL)] }),
    S('stats', { cutW: 'He', head: 'ALEXEI KARPENKO', items: [], sfx: 'boom', over: [at(head('HEAD OF THE POWER STATION', null, 470, 70), 0.3), { ...head('HE WENT IN TO SHUT DOWN THE DIESELS', null, 590, 56, Yc), w: 'shut' }], source: 'Sources: AARI (2017), Nauka i Zhizn (2001)' }),
  ]);
  beats('A029', [
    S('firemap', { fireAt: 0.01, spreadAt: 0.02, title: 'VOSTOK, 12 APRIL 1982', over: [{ ...chipC('THE ALUMINIUM BUILDING MELTED', null, 1010, 40), w: 'melted' }] }),
    St('ia_1968_navy_hut_blizzard', { cutW: 'All', over: [low('ALL THE GENERATORS: LOST', 'generators'), note('A STATION IN A BLIZZARD, 1960s · ' + IL)] }),
  ]);
  beats('A030', [
    S('firemap', { fireAt: 0.01, spreadAt: 0.02, windW: 'wind', saveW: 'missed', title: 'BUT ONE THING WENT THEIR WAY' }),
    F('ia_1968_navy_fuel_drums', { cutW: 'dozens', over: [low('DOZENS OF BARRELS OF DIESEL', 'barrels'), note('FUEL DRUMS, 1960s · ' + IL)] }),
    S('stats', { cutW: 'Arkady', head: 'DR ARKADY MAKSIMOV, 1982', items: [], sfx: 'boom', over: [at(head('"WITHOUT FUEL, WE WOULD HAVE HAD', null, 480, 68, Yc), 0.4), at(head('NO CHANCE OF SURVIVING."', null, 580, 68, Yc), 0.7)], source: 'Maksimov, quoted by RT (2022)' }),
  ]);
  beats('A031', [St('px_person_walking_frozen_fog', { dark: 0.45, over: [note(IL)] })]);
  beats('A032', [
    S('stats', { head: 'BORIS MOISEEV, DRILLER', items: [], over: [at(head('A GENERATOR FROM THE DRILLING RIG', null, 520, 70, Yc), 0.3)], source: 'Sources: AARI (2017), RT (2022)' }),
    F('ia_1961_navy_ham_radio_operator', { cutW: 'radio', over: [low('JUST ENOUGH FOR THE RADIO', 'radio'), note('A POLAR RADIO ROOM, c.1960 · ' + IL)] }),
    S('stats', { cutW: 'On', head: '13 APRIL 1982, EVENING', items: [], sfx: 'boom', over: [cnt('sixteen', 16, { pre: '~', suf: ' H', label: 'BEFORE ANYONE KNEW', y: 560, size: 200 })], source: 'Source: Nauka i Zhizn (2001)' }),
  ]);
  beats('A033', [
    St('ia_1967_navy_hut_blowing_snow', { over: [low('EVACUATION: IMPOSSIBLE', 'impossible'), note('A STATION IN BLOWING SNOW, 1960s · ' + IL)] }),
    Q('So', 'THE DECISION', 'WE STAY.', 'WE FINISH THE WINTER.', null, 'Sources: AARI (2017), RT (2022)'),
  ]);
  beats('A034', [F('ia_1967_navy_galley_two_men', { over: [low('FIRST: AN OLD KEROSENE STOVE IN THE MESS', 'mess'), note('A STATION MESS, 1960s · ' + IL)] }), S('stove', { cutW: 'Then', flameAt: 0.5, hotAt: 99, coldAt: 99, title: 'APRIL 1982: HEAT FROM A GAS CYLINDER' })]);
  beats('A035', [S('stove', { flameAt: 0.01, hotW: 'twenty-five', coldW: 'zero', title: 'APRIL 1982: HEAT FROM A GAS CYLINDER' }), A('cm_concordia_dark', { cutW: 'They', kb: { z: [1.25, 1.1] }, over: [low('NIGHT FIRE WATCHES', 'turns'), note('A STATION IN THE POLAR NIGHT (CONCORDIA) · ' + IL)] })]);
  beats('A036', [
    S('stove', { flameAt: 0.01, hotAt: 0.01, coldAt: 0.01, candleW: 'candles', title: 'LIGHT, WATER, BREAD' }),
    F('ia_1968_navy_galley_cooking', { cutW: 'The', over: [low('BREAD BAKED ON THE STOVE WALLS', 'bread'), note('A POLAR GALLEY, 1960s · ' + IL)] }),
  ]);
  beats('A037', [
    S('stats', { head: 'VELLO PARK, METEOROLOGIST', items: [], over: [at(head('THE FULL WEATHER PROGRAMME', null, 520, 76, Yc), 0.3)], source: 'Sources: AARI (2017), RT (2022)' }),
    F('ia_1961_navy_weather_shelter', { cutW: 'every', over: [low('EVERY OBSERVATION, ALL WINTER', 'every'), note('READING A WEATHER SCREEN, c.1960 · ' + IL)] }),
    F('ia_1961_navy_meteorologists_indoor', { cutW: 'cancelled', over: [note('WEATHER OFFICE, c.1960 · ' + IL)] }),
  ]);
  beats('A038', [S('ladder', { title: 'WINTER 1982', min: -100, max: 0, items: [{ v: -85, label: 'THE LOWEST THAT WINTER', w: 'minus', hl: true }], source: 'Source: AARI (2013)' })]);
  beats('A039', [A('cm_station_y_diesel_generator', { over: [low('AN OLD GENERATOR, DUG OUT AND REVIVED', 'revived'), note('A 1950s POLAR DIESEL GENERATOR · ' + IL)] })]);
  beats('A040', [
    F('ia_1961_navy_lc130_landing_headon', { over: [low('EARLY NOVEMBER: THE FIRST PLANE', 'November'), note('SKI PLANE · NOT THE ACTUAL Il-14')] }),
    F('ia_1961_navy_tractor_pulls_sledge', { cutW: 'About', over: [low('A TRACTOR TRAIN WITH A NEW POWER STATION', 'tractor'), note('TRACTOR TRAIN, c.1960 · ' + IL)] }),
  ]);
  beats('A041', [S('stats', { head: 'FROM THE FIRE TO THE TRACTOR TRAIN', items: [], sfx: 'boom', over: [{ ...cnt(undefined, 227, { from: 0, dur: 1.6, label: 'DAYS', y: 560, size: 230 }), at: 0.3 }], source: 'Sources: Nauka i Zhizn (2001); Astakhov biography' })]);
  beats('A042', [
    F('ia_1967_navy_soviet_us_toast', { over: [low('EVERY MAN: A STATE AWARD', 'award'), note('A SOVIET STATION, 1967 · ' + IL)] }),
    S('stats', { cutW: 'Astakhov', head: 'PYOTR ASTAKHOV', items: [], over: [at(head('NOMINATED: HERO OF THE SOVIET UNION', null, 520, 60), 0.3)], source: 'Source: Astakhov biography (Divnogorsk, 2015)' }),
    A('cm_vostok_1970s_exterior', { cutW: 'powerful', kb: { z: [1.25, 1.1] }, over: [low('BLOCKED, HIS BIOGRAPHY SAYS', 'blocked'), note('VOSTOK, 1973')] }),
  ]);

  // ===== CH4 =====
  chapter('A044', 4, 'The coldest morning on Earth');
  beats('A044', [A('cm_vostok_1970s_soviet_base', { over: [note('VOSTOK FROM ABOVE, 1974')] })]);
  beats('A045', [
    S('ladder', { title: 'JULY 1983 AT VOSTOK', min: -100, max: -60, items: [{ v: -75, label: '15 JULY', at: 0.4 }, { v: -80, label: '17 JULY', at: 1.6 }, { v: -85, label: '19 JULY', at: 2.8 }], source: 'Source: AARI (2013) · about −2.5°C a day' }),
    F('ia_1961_navy_weather_balloon_launch', { cutW: 'every', over: [note('WEATHER BALLOON LAUNCH, c.1960 · ' + IL)] }),
  ]);
  beats('A046', [
    A('cm_concordia_aurora', { over: [low('21 JULY 1983 · 05:45 MOSCOW TIME', 'July'), note('POLAR NIGHT ON THE PLATEAU (CONCORDIA) · ' + IL)] }),
    S('ladder', { cutW: 'minus', title: 'THE WORLD RECORD', min: -100, max: 0, items: [{ v: -89.2, label: 'VOSTOK, 21 JULY 1983', sub: '−128.6°F · READ BY KARPYUK AND LAZAREV', at: 0.4, hl: true }], source: 'Sources: WMO; AARI (2013)' }),
  ]);
  beats('A047', [S('ladder', { title: 'HOW COLD IS THAT?', min: -100, max: 0, items: [{ v: -18, label: 'YOUR FREEZER', w: 'freezer' }, { v: -67.7, label: 'OYMYAKON, SIBERIA (1933)', sub: 'COLDEST TOWNS PEOPLE LIVE IN', w: 'Oymyakon' }, { v: -89.2, label: 'VOSTOK (1983)', at: 0.3, hl: true }], source: 'Sources: WMO' })]);
  beats('A048', [
    A('cm_south_pole_clear_sky', { over: [low('A WEEK WITH NO CLOUD, ALMOST NO WIND', 'cloud'), note('CLEAR POLAR SKY, SOUTH POLE · ' + IL)] }),
    S('globe', ANT({ cutW: 'a', lon: [[0, 106], [4, 106]], lat: [[0, -76], [4, -78]], R: [[0, 2000], [4, 2600]], zones: [{ ...G.vos, r: 500, w: 'pool' }], pins: [{ ...G.vos, label: 'VOSTOK', at: 0.3, small: true, size: 44 }], labels: [{ lon: 106, lat: -70, text: 'A POOL OF THE COLDEST AIR', w: 'pool', size: 38, color: C('iceL') }] })),
  ]);
  beats('A049', [
    F('gov_nasa_coldest_pockets_blue', { over: [low('SNOW SURFACE: ~−98°C (SATELLITE)', 'ninety-eight'), note('NASA VISUALIZATION, 2004–2016 DATA')] }),
    S('ladder', { cutW: 'But', title: 'SNOW VS AIR', min: -100, max: -80, items: [{ v: -98, label: 'SNOW SURFACE (SATELLITE)', dash: true, at: 0.2, color: C('iceL') }, { v: -89.2, label: 'AIR: STILL THE RECORD', w: 'air', hl: true }], source: 'Sources: Scambos et al. 2018; WMO' }),
  ]);
  beats('A050', [
    A('cm_dome_c_snow_surface', { over: [note('THE EAST ANTARCTIC PLATEAU (DOME C) · ' + IL)] }),
    S('stats', { cutW: 'By', head: 'A NORMAL YEAR AT VOSTOK', items: [], over: [{ ...head('ABOUT −55°C', null, 520, 150, Yc), w: 'fifty-five' }, { ...chipC('≈ THE AVERAGE ON MARS (BY SOME ESTIMATES)', null, 760, 46), w: 'Mars' }], source: 'Sources: AARI; NASA / ESA Mars fact sheets' }),
  ]);
  beats('A051', [F('gov_nasa_subglacial_lakes_crosssection', { over: [note('NASA ANIMATION')] })]);

  // ===== CH5 =====
  chapter('A052', 5, 'The lake under the station');
  beats('A052', [
    A('cm_lake_vostok_drill_crosssection', { over: [low('~4 KM OF ICE', 'four'), note('DIAGRAM: LAKE VOSTOK (NSF)')] }),
    F('gov_nasa_lake_vostok_surface_flyover', { cutW: 'Lake', over: [low('240 KM LONG · NEARLY LAKE ONTARIO', 'two'), note('NASA / RADARSAT, 1997')] }),
    A('cm_lake_vostok_location_map', { cutW: 'Reaching', over: [note('LAKE VOSTOK FROM SPACE')] }),
  ]);
  beats('A053', [
    F('ia_1961_navy_snow_core_sample', { over: [note('PULLING A CORE, c.1960 · ' + IL)] }),
    A('cm_vostok_ice_core_team', { cutW: 'Russia', kb: { z: [1.2, 1.05] }, over: [low('RUSSIA · FRANCE · USA', 'France'), note('VOSTOK ICE CORES')] }),
    A('cm_vostok_ice_core_420ky_graph', { cutW: 'The', over: [low('420,000 YEARS OF AIR', 'four'), note('CHART: THE VOSTOK ICE CORE (PETIT ET AL. 1999)')] }),
    A('cm_vostok_ice_core_petit_chart', { cutW: 'carbon', over: [low('CO₂ AND TEMPERATURE: FOUR ICE AGES', 'ice'), note('CHART: VOSTOK ICE CORE, 420,000 YEARS')] }),
  ]);
  beats('A055', [
    A('cm_lake_vostok_system_diagram', { over: [low('5 FEB 2012: THE DRILL REACHES THE WATER', 'twelve'), note('DIAGRAM: THE LAKE VOSTOK SYSTEM')] }),
    F('gov_nasa_lake_vostok_radar_zoom', { cutW: 'Did', over: [low('LIFE?', 'life'), note('NASA / RADARSAT VISUALIZATION')] }),
    S('stats', { cutW: 'put', head: 'VLADIMIR KOROLYOV, GENETICIST, 2013', items: [], sfx: 'boom', over: [at(head('"ALL OF THEM WERE', null, 480, 90, Yc), 0.3), at(head('CONTAMINANTS."', null, 600, 90, Yc), 0.6)], source: 'Interfax, 11 March 2013' }),
    S('stats', { cutW: 'So', head: 'LIFE IN LAKE VOSTOK', items: [], over: [at(head('NOT CONFIRMED', null, 560, 120, C('iceL')), 0.2)], source: 'Sources: AARI (2017); PNPI' }),
  ]);

  // ===== CH6 =====
  chapter('A057', 6, 'The lesson of 1982');
  beats('A057', [A('cm_concordia_view', { over: [note('A PLATEAU STATION IN TWILIGHT (CONCORDIA) · ' + IL)] })]);
  beats('A058', [
    S('stats', { head: 'NOT BUILDINGS ALONE', items: [], over: [at(head('1982: THE POWER STATION BURNED', null, 470, 70), 0.3), { ...head('THEY SURVIVED', null, 590, 90, Yc), w: 'survived' }] }),
    S('stats', { cutW: 'And', head: 'NOT RESCUE', items: [], over: [at(head('THERE WAS NONE', null, 540, 110, '#E63946'), 0.5)] }),
  ]);
  const N3 = [{ id: 'fu', name: 'FUEL', x: 400, y: 560, src: true }, { id: 'cr', name: 'A VETERAN CREW', x: 960, y: 560 }, { id: 'sp', name: 'A SPARE FOR EVERYTHING', x: 1520, y: 560 }];
  beats('A059', [A('cm_south_pole_traverse_tractor', { cutW: 'Fuel', over: [low('1 · FUEL, 1,400 KM BY TRACTOR', 'Fuel'), note('A TRAVERSE TRACTOR (US) · ' + IL)] }), A('cm_vostok_scientist_tractor', { cutW: 'crew', over: [low('2 · A VETERAN CREW', 'crew'), note('VOSTOK, 1960s')] }), S('supplyline', { cutW: 'spare', title: 'VOSTOK SURVIVES ON THREE THINGS', nodes: N3, events: [] })]);
  beats('A060', [
    S('supplyline', { title: '1982', nodes: N3, events: [{ at: T.at('A060', 'spare') - T.s('A060'), year: '1982', label: 'NO SPARE: LIGHT, HEAT AND WATER IN ONE BUILDING', cut: 'sp' }] }),
    St('ia_1961_navy_station_buried_drift', { cutW: 'Light', over: [low('LIGHT, HEAT AND WATER: ONE BUILDING', 'one'), note('A STATION IN DRIFTING SNOW, c.1960 · ' + IL)] }),
    A('cm_wais_fuel_bladders_digging', { cutW: 'only', over: [low('THE ONLY SPARES: DUG OUT OF THE SNOW', 'dug'), note('DIGGING OUT IN ANTARCTICA (WAIS, 2012) · ' + IL)] }),
  ]);
  beats('A061', [
    A('cm_vostok_2024_new_winter_complex', { kb: { z: [1.55, 1.4], x: [0.2, 0.24] }, over: [low('JANUARY 2024: THE NEW WINTER COMPLEX', 'January'), note('VOSTOK, 2024')] }),
    S('stats', { cutW: 'five', head: 'THE NEW VOSTOK', items: [], over: [at(head('5 MODULES · 140 M', null, 440, 90, Yc), 0.3), { ...chipC('LONGER THAN A FOOTBALL FIELD', null, 580, 46), w: 'football' }], source: 'Source: AARI' }),
    A('cm_south_pole_station_2013', { cutW: 'standing', over: [low('36 LEGS · SNOW BLOWS UNDER', 'thirty-six'), note('A STATION ON STILTS (SOUTH POLE) · ' + IL)] }),
  ]);
  beats('A062', [
    S('stats', { head: 'BUILT ON THE LESSON', items: [], over: [at(head('80 CM WALLS', null, 400, 80), 0.3), { ...head('4 MAIN GENERATORS', null, 520, 80), w: 'four' }, { ...head('+2 BACKUPS IN A SEPARATE MODULE', null, 660, 70, Yc), w: 'backup' }], source: 'Sources: AARI; Meduza (2020)' }),
    A('cm_south_pole_elevated_station', { cutW: 'And', over: [note('A MODERN STATION ON STILTS (SOUTH POLE) · ' + IL)] }),
  ]);
  beats('A063', [
    S('globe', { relief: true, borders: false, lon: [[0, 0], [4, 10]], lat: [[0, 20], [4, -15]], R: [[0, 700], [4, 900]],
      routes: [{ pts: [[30, 59.9], [-5, 45], [-12, 15], [8, -12]], at: 0.6, dur: 2.6, w: 6, label: 'OCT–DEC 2020', lx: 20 }],
      pins: [{ lon: 30.3, lat: 59.9, label: 'ST PETERSBURG', at: 0.3, small: true, size: 40 }, { lon: 8, lat: -12, label: 'PROPELLER BROKEN OFF ANGOLA', w: 'propeller', small: true, size: 40, color: C('red') }] }),
    F('ia_1961_navy_tractor_crate_sledge', { cutW: 'The', over: [low('THE MODULES CROSSED THE ICE BY TRACTOR', 'tractor'), note('TRACTOR WITH CARGO, c.1960 · ' + IL)] }),
  ]);
  beats('A064', [F('ia_1968_navy_c130_jato_takeoff', { over: [note('SKI PLANE TAKEOFF, 1960s · ' + IL)] })]);

  // ===== ENDING =====
  beats('A065A', [A('cm_vostok_station_core', { kb: { z: [1.25, 1.05] }, over: [head('ONE WINTER AT VOSTOK?', null, 200, 90)] })]);
  beats('A065', [
    A('cm_mirny_soviet_cemetery', { over: [low('ALEXEI KARPENKO, BURIED ON BUROMSKY ISLAND', 'Karpenko'), note('EXPEDITION CEMETERY, BUROMSKY ISLAND, NEAR MIRNY')] }),
    A('cm_concordia_dark', { cutW: 'every', over: [note('A STATION IN THE POLAR NIGHT (CONCORDIA) · ' + IL)] }),
    S('stove', { cutW: 'fire', flameAt: 0.01, hotAt: 0.01, coldAt: 99, title: 'THE RIGHT KIND OF FIRE' }),
    A('cm_vostok_1970s_soviet_base', { cutW: 'spare', kb: { z: [1.0, 1.2] }, over: [low('WITH A SPARE', 'spare'), note('VOSTOK FROM ABOVE, 1974')] }),
  ]);
  add(T.tl.voiceEnd + 0.4, S('endscreen', {}), 'fade');
  return out;
}
module.exports = { assets, build, defaultTrans: 'cut', splitOver: 4.5, splitTo: 3 };
