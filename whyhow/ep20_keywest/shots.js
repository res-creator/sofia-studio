// EP20 Key West — real Florida Keys photos (Wikimedia Commons: Florida Keys Public Libraries, State Archives of Florida, NOAA, NASA, USFWS, CC authors) + Pixabay.
// Anything not literally the place named is labelled ILLUSTRATIVE. No AI images.
// Anything not literally the place/line named is labelled ILLUSTRATIVE. No AI images.
const fs = require('fs'), path = require('path');
const MF = JSON.parse(fs.readFileSync(path.join(__dirname, 'footage/manifest.json')));
const FT = Object.fromEntries(MF.map(x => [x.key, x]));
const assets = {}; for (const x of MF) if (x.type === 'photo' && fs.existsSync(path.join(__dirname, 'footage/' + x.key + '.jpg'))) assets[x.key] = 'footage/' + x.key + '.jpg';
const credit = k => { const f = FT[k]; if (!f || !f.attribution) return ''; if (/pixabay/i.test(f.source)) return '';
  if (/nasa|esa|gov/i.test(f.source)) return 'Image: ' + f.attribution; return (f.type === 'video' ? 'Video: ' : 'Photo: ') + f.attribution; };
const C = n => require('../atlaskit/core').C[n];
let kbi = 0;
const KB = [{ z: [1.04, 1.18], x: [0.45, 0.55] }, { z: [1.18, 1.04], x: [0.55, 0.45] }, { z: [1.05, 1.2], y: [0.55, 0.45] }, { z: [1.2, 1.06], x: [0.5, 0.5], y: [0.45, 0.55] }];
const F = (key, o = {}) => { const f = FT[key]; if (!f) throw new Error('no footage ' + key);
  if (f.type === 'video') return { scene: 'video', p: { file: 'footage/' + key + '.mp4', credit: credit(key), cold: 0, ...o } };
  return { scene: 'photo', p: { img: key, credit: credit(key), kb: KB[kbi++ % KB.length], cold: 0, ...o } }; };
const S = (scene, p = {}) => ({ scene, p });
const low = (text, w, sub) => ({ type: 'lower', text, sub, w });
const head = (text, w, y = 200, size = 96, color) => ({ type: 'head', text, w, y, size, color });
const chipC = (text, w, y, size = 56) => ({ type: 'chip', text, x: 960, y, align: 'center', size, w });
const at = (o, a) => ({ ...o, at: a });
const note = (text) => ({ type: 'note', text, x: 60, y: 70, at: 0.3 });
const Yc = '#FFC857';
const IL = 'ILLUSTRATIVE';
// V: footage with a note label; I: illustrative footage
const FB = {};
const R = (k, label) => [k, label];
const V = (k0, label0, o = {}) => { const [k, label] = R(k0, label0); return F(k, { ...o, over: [...(o.over || []), note(label)] }); };
const I = (k, label, o = {}) => V(k, label + ' · ' + IL, o);
const A = (k, label, o = {}) => V(k, label, { sfx: 'click', ...o });
const Q = (cutW, top, l1, l2, chipT, source) => S('stats', { cutW, head: top, items: [], sfx: 'boom', over: [at(head(l1, null, l2 ? 470 : 520, 88, Yc), 0.05), ...(l2 ? [at(head(l2, null, 590, 88, Yc), 0.25)] : []), ...(chipT ? [{ ...chipC(chipT, null, l2 ? 740 : 700, 44), at: 0.6 }] : [])], source });
const G = { fc: { lon: -80.48, lat: 25.45 }, kw: { lon: -81.78, lat: 24.555 }, largo: { lon: -80.44, lat: 25.09 }, isla: { lon: -80.63, lat: 24.92 }, mara: { lon: -81.09, lat: 24.71 }, stock: { lon: -81.74, lat: 24.57 }, miami: { lon: -80.19, lat: 25.77 }, havana: { lon: -82.37, lat: 23.11 } };
const PIPE = [[-80.48, 25.45], [-80.43, 25.25], [-80.44, 25.09], [-80.63, 24.92], [-80.85, 24.80], [-81.09, 24.71], [-81.2, 24.68], [-81.35, 24.67], [-81.55, 24.62], [-81.78, 24.555]];
const GL = (o = {}) => ({ relief: true, borders: true, lon: [[0, -81.2], [3, -81.1]], lat: [[0, 25.0], [3, 24.95]], R: [[0, 26000], [3, 30000]], ...o });
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
      for (const kw of ['routes', 'pins', 'labels', 'zones', 'waves']) for (const it of (sh.p[kw] || [])) if (typeof it.w === 'string') { it.at = rel(it.w, t0, it.n); delete it.w; }
      add(t0, sh, 'cut'); });
  }
  const chapter = (pid, n, title) => add(T.s(pid) - 2.0, S('chapter', { n, title }), 'cut');

  // ===== COLD OPEN (fast, ≤20 s) =====
  beats('A001', [
    V('cm_key_west_aerial_ne', 'KEY WEST, FLORIDA', { over: [head('NO RIVERS', 'rivers', 200, 96)] }),
    V('cm_sunset_key_aerial', 'KEY WEST FROM THE AIR', { cutW: 'No', over: [head('NO LAKES', 'lakes', 200, 96)] }),
  ], { start: 0 });
  beats('A002', [
    V('cm_duval_street', 'DUVAL STREET, KEY WEST', { over: [low('~25,000 PEOPLE', 'twenty-five')] }),
    I('px_kitchen_tap_glass', 'A KITCHEN TAP', { cutW: 'every' }),
  ]);
  beats('A003', [S('stats', { head: '', items: [], sfx: 'boom', over: [at(head('SO WHERE DOES', null, 470, 110), 0.05), at(head('THE WATER COME FROM?', null, 610, 110, Yc), 0.3)] })]);
  beats('A004', [
    V('cm_seven_mile_aerial', 'SEVEN MILE BRIDGE, FLORIDA KEYS', { over: [head('130 MILES AWAY', 'hundred', 200, 96, Yc)] }),
    S('globe', GL({ cutW: 'through', pins: [{ ...G.fc, label: 'FLORIDA CITY', at: 0.2 }, { ...G.kw, label: 'KEY WEST', at: 1.6 }], routes: [{ pts: PIPE, at: 0.3, dur: 2.6 }] })),
  ]);
  beats('A005', [
    I('px_rain_on_roof', 'RAIN ON A ROOF', { over: [head('JUST COLLECT RAIN?', 'first', 200, 76)] }),
    V('cm_conch_house_porch', 'A KEY WEST HOUSE', { cutW: 'But', over: [low('~3 FEET OF RAIN A YEAR', 'three')] }),
  ]);
  beats('A006', [
    I('px_reef_beach_aerial', 'SEAWATER', { over: [head('MAKE IT FROM SEAWATER?', 'Second', 200, 76)] }),
    V('cm_key_west_shoreline', 'KEY WEST SHORELINE', { cutW: 'But', over: [low('MOST DAYS: SWITCHED OFF', 'switched')] }),
  ]);
  beats('A007', [
    V('cm_1909_hurricane_tank', 'KEY WEST, c. 1909', { over: [low('1 · RAIN BARRELS', 'rain')] }),
    A('cm_train_long_key_postcard', 'OVERSEAS RAILROAD, LONG KEY VIADUCT', { cutW: 'ride', over: [low('2 · A RAILROAD ACROSS THE SEA', 'railroad')] }),
    V('cm_donna_pipeline_1', 'THE WATER PIPELINE, 1960', { cutW: 'follow', over: [low('3 · THE PIPE', 'pipe')] }),
    V('gov_irma_geocolor', 'HURRICANE IRMA FROM SPACE', { cutW: 'survive', over: [low('4 · HURRICANES', 'hurricanes')] }),
  ]);
  add(T.e('A007') + 0.15, S('title', { lines: ['THE ISLAND THAT DRINKS', 'THROUGH A STRAW'], hl: 1, img: 'cm_seven_mile_aerial_b', credit: '', brand: true, sfx: 'riser' }), 'cut');

  // ===== CH1 =====
  chapter('A008', 1, 'Every drop from the sky');
  beats('A008', [V('cm_ann_street_old', 'ANN STREET, KEY WEST (OLD PHOTO)')]);
  beats('A009', [
    V('cm_caroline_street', 'CAROLINE STREET, KEY WEST', { over: [low('ROOF → GUTTER → CISTERN', 'roof')] }),
    I('px_rain_on_roof', 'RAINWATER OFF A ROOF', { cutW: 'When' }),
    V('cm_1909_hurricane_tank', 'KEY WEST, c. 1909: A WATER TANK', { cutW: 'That' }),
  ]);
  beats('A010', [V('cm_key_west_houses', 'OLD KEY WEST HOUSES', { over: [head('KEROSENE vs MOSQUITOES', 'kerosene', 200, 64, Yc)] })]);
  beats('A011', [
    V('cm_bahama_street_1940s', 'BAHAMA STREET, KEY WEST'),
    I('px_tap_hands', 'FRESH WATER', { cutW: 'Fresh' }),
  ]);
  beats('A011B', [
    S('stats', { head: 'A 1,000 SQ FT ROOF IN THE KEYS', items: [{ v: 22200, pre: '~', label: 'GALLONS OF RAIN A YEAR', at: 0.4, color: Yc, size: 150 }], source: 'Source: J. Wilkinson, History of the FKAA (keyshistory.org)' }),
    V('cm_old_town_bakery', 'OLD TOWN KEY WEST', { cutW: 'So' }),
  ]);
  beats('A012', [V('cm_key_west_downtown', 'KEY WEST TODAY', { over: [low('1860s: 7,000 GALLONS A DAY', 'seven')] })]);
  beats('A013', [Q(null, 'ONE SEAWATER STILL, 1860s', '≈ 20 HOMES', null, 'FOR A WHOLE FORT', 'Sources: keyshistory.org; US EPA WaterSense (~300 gal/day per family)')]);
  beats('A014', [
    V('px_keys_boat', 'FLORIDA KEYS WATERS'),
    V('cm_duval_street_1921', 'DUVAL STREET, 1921', { cutW: 'Which' }),
  ]);

  // ===== CH2 =====
  chapter('A015', 2, 'Water by train');
  beats('A015', [A('cm_rambler_train', 'TRAIN ON THE OVERSEAS RAILROAD')]);
  beats('A016', [
    A('cm_henry_flagler', 'HENRY FLAGLER', { kb: { z: [1.0, 1.06], y: [0.3, 0.34] }, over: [low('HENRY FLAGLER', 'Flagler')] }),
    A('cm_flagler_first_train', 'LONG KEY VIADUCT, 1912', { cutW: 'decided' }),
    A('cm_bahia_honda_before', 'BAHIA HONDA RAIL BRIDGE', { cutW: 'all' }),
  ]);
  beats('A017', [
    A('cm_train_long_key_postcard', 'LONG KEY VIADUCT, POSTCARD'),
    V('cm_long_key_viaduct', 'LONG KEY VIADUCT TODAY', { cutW: 'His', over: [low('MOST WELLS HIT SALT WATER', 'salt')] }),
  ]);
  beats('A018', [
    V('cm_bahia_honda_rail_bridge', 'OLD BAHIA HONDA RAIL BRIDGE', { over: [head('WATER BY TANK CAR', 'tank', 200, 72, Yc)] }),
    V('cm_seven_mile_palm', 'FLORIDA KEYS, OLD RAIL BRIDGES', { cutW: 'millions' }),
  ]);
  beats('A019', [
    A('cm_first_train_key_west_1912', 'FIRST TRAIN INTO KEY WEST, 22 JAN 1912', { over: [low('JANUARY 1912', 'January')] }),
    A('cm_flagler_key_west', 'HENRY FLAGLER IN KEY WEST', { cutW: 'For', kb: { z: [1.0, 1.06], y: [0.35, 0.4] } }),
  ]);
  beats('A020', [
    A('cm_1935_hurricane', 'AFTER THE LABOR DAY HURRICANE, 1935', { over: [low('2 SEPTEMBER 1935', 'Labor')] }),
    A('cm_long_key_station_1935', 'LONG KEY STATION AFTER THE STORM', { cutW: 'It' }),
  ]);
  beats('A021', [
    A('cm_bahia_honda_old_road', 'THE OLD BAHIA HONDA BRIDGE AS A ROAD'),
    V('cm_overseas_highway', 'OVERSEAS HIGHWAY TODAY', { cutW: 'And', over: [low('113 MILES · 42 BRIDGES', 'Overseas')] }),
  ]);

  // ===== CH3 =====
  chapter('A022', 3, 'The longest straw');
  beats('A022', [A('cm_naval_station_key_west_old', 'NAVAL STATION KEY WEST')]);
  beats('A023', [
    A('cm_nas_key_west_1947', 'NAVAL AIR STATION, KEY WEST, 1940s'),
    S('bars', { cutW: 'Its', title: 'NAVY BASE, 1939: WATER PER DAY', sub: 'gallons per day', max: 80000, items: [{ label: 'NEEDED', v: 75000, text: '75,000', color: Yc, at: 0.3 }, { label: 'ITS OWN SEAWATER PLANT MADE', v: 35000, text: '35,000', color: C('iceL'), w: 'thirty-five' }], source: 'Source: J. Wilkinson, History of the FKAA (keyshistory.org)' }),
  ]);
  beats('A024', [
    V('cm_us1_florida_city', 'US 1 SOUTH, FLORIDA CITY', { over: [low('WELLS IN FLORIDA CITY', 'wells')] }),
    S('globe', GL({ cutW: 'all', pins: [{ ...G.fc, label: 'FLORIDA CITY', at: 0.1 }, { ...G.kw, label: 'KEY WEST', at: 1.8 }], routes: [{ pts: PIPE, at: 0.2, dur: 2.4 }] })),
  ]);
  beats('A025', [
    V('cm_donna_pipeline_3', 'THE PIPE ALONG INDIAN KEY CHANNEL BRIDGE (1960)'),
    V('cm_donna_pipeline_4', 'THE PIPE AT A BRIDGE (1960)', { cutW: 'Everywhere' }),
  ]);
  beats('A026', [A('cm_key_west_1950s_aerial', 'KEY WEST FROM THE AIR', { over: [low('22 SEPTEMBER 1942', 'September')] })]);
  beats('A027', [Q(null, 'FLORIDA CITY → KEY WEST, 1942', '~6 DAYS', null, 'FOR ONE DROP', 'Source: keyshistory.org')]);
  beats('A027B', [I('px_resort_pool_aerial', 'A POOL', { over: [low('~10 MILLION GALLONS INSIDE THE PIPE', 'ten')] })]);
  beats('A028', [
    A('cm_sailors_bar_1940s', 'KEY WEST, 1940s'),
    I('px_shower_slowmo', 'A SHOWER', { cutW: 'If', over: [head('NO PRESSURE ON WEEKENDS', 'second', 200, 64, Yc)] }),
  ]);
  beats('A028B', [A('cm_army_water_tower_1945', 'ARMY WATER TOWER, KEY WEST, 1945', { over: [low('1976: SOLD FOR $7 MILLION', 'seven')] })]);
  beats('A029', [V('cm_overseas_highway_aerial', 'OVERSEAS HIGHWAY FROM THE AIR', { over: [low('1982: A 36-INCH PIPE', 'thirty-six')] })]);
  beats('A030', [
    V('cm_biscayne_aquifer_map', 'BISCAYNE AQUIFER (USGS MAP)', { kb: { z: [1.0, 1.15], x: [0.4, 0.55], y: [0.55, 0.6] } }),
    I('px_water_pipe_flow', 'WATER FROM A PIPE', { cutW: 'Wells' }),
  ]);
  beats('A031', [
    S('stats', { head: 'THE KEYS\' WATER LINE TODAY', items: [{ v: 130, pre: '~', label: 'MILES OF PIPE', at: 0.3, color: Yc }, { v: 45, label: 'BRIDGE CROSSINGS', w: 'Forty-five' }], source: 'Source: Florida Keys Aqueduct Authority (WaterWorld, 2023)' }),
    V('cm_seven_mile_pigeon_b', 'SEVEN MILE BRIDGE AND PIGEON KEY', { cutW: 'Around', over: [low('~20 MILLION GALLONS A DAY', 'twenty')] }),
  ]);
  beats('A032', [V('px_keys_backcountry_drone', 'FLORIDA KEYS FROM THE AIR', { over: [head('ONE VERY LONG STRAW', 'straw', 200, 80, Yc)] })]);
  beats('A032B', [
    V('cm_overseas_highway_dusk', 'OVERSEAS HIGHWAY NEAR DUCK KEY'),
    V('cm_donna_pipeline_2', 'THE PIPE BESIDE A BRIDGE (1960)', { cutW: 'That' }),
  ]);

  // ===== CH4 =====
  chapter('A033', 4, 'When the storm comes');
  beats('A033', [I('px_palms_wind', 'PALMS IN A STORM')]);
  beats('A034', [
    V('cm_donna_pipeline_5', 'PIPELINE DAMAGED BY HURRICANE DONNA, 1960', { over: [low('HURRICANE DONNA · 1960', 'Donna')] }),
    V('cm_donna_pipeline_1', 'INDIAN KEY CHANNEL BRIDGE, 1960', { cutW: 'It' }),
  ]);
  beats('A035', [V('cm_key_west_kennedy_aerial', 'STOCK ISLAND AND KEY WEST FROM THE AIR', { over: [low('1967: A SEAWATER PLANT', 'nineteen')] })]);
  beats('A036', [
    V('gov_irma_jose', 'HURRICANE IRMA FROM SPACE, 2017', { over: [low('IRMA · CATEGORY 4', 'Irma')] }),
    I('px_hurricane_waves', 'STORM SURF', { cutW: 'smashed' }),
  ]);
  beats('A037', [
    V('cm_irma_summerland_1', 'SUMMERLAND KEY AFTER IRMA'),
    V('cm_irma_summerland_2', 'SUMMERLAND KEY AFTER IRMA', { cutW: 'The', over: [low('BOIL-WATER NOTICE', 'boil')] }),
  ]);
  beats('A038', [
    V('cm_marathon_after_irma', 'MARATHON AFTER IRMA'),
    I('px_reef_beach_aerial', 'SEAWATER', { cutW: 'Machines', over: [head('SEAWATER → DRINKING WATER', 'turning', 200, 64, Yc)] }),
  ]);
  beats('A039', [V('cm_irma_blue_roof', 'BLUE ROOFS AFTER IRMA, FLORIDA KEYS', { over: [low('KIRK ZUELCH · FKAA', 'Zuelch')] })]);
  beats('A040', [
    V('cm_key_west_aerial_ne', 'KEY WEST AND STOCK ISLAND FROM THE AIR', { over: [low('MAY 2025: NEW PLANT, STOCK ISLAND', 'May')] }),
    Q('about', 'STOCK ISLAND REVERSE OSMOSIS PLANT', '~4 MILLION', 'GALLONS A DAY', null, 'Sources: FKAA; WLRN; Carollo (May 2025)'),
  ]);
  beats('A041', [V('cm_sunset_key_aerial', 'KEY WEST FROM THE AIR', { over: [head('A SPARE TIRE FOR A CITY', 'spare', 200, 72, Yc)] })]);

  // ===== CH5 =====
  chapter('A042', 5, 'Where it all goes');
  beats('A042', [I('px_shower_slowmo', 'A SHOWER')]);
  beats('A043', [
    V('cm_key_west_houses', 'KEY WEST HOMES'),
    I('px_water_pipe_flow', 'WASTEWATER', { cutW: 'Septic', over: [low('SEPTIC TANKS & CESSPITS', 'Septic')] }),
  ]);
  beats('A044', [
    V('cm_looe_key_reef', 'LOOE KEY REEF FROM THE AIR', { over: [low('THE ONLY LIVING BARRIER REEF IN THE LOWER 48', 'only')] }),
    V('cm_coral_bleaching_2023', 'STRESSED CORAL, FLORIDA KEYS, 2023', { cutW: 'Leaking' }),
  ]);
  beats('A045', [
    V('cm_elkhorn_coral', 'ELKHORN CORAL, FLORIDA KEYS'),
    Q('today', 'MONROE COUNTY HOMES', '~94%', 'ON CENTRAL SEWERS', null, 'Sources: NOAA; Monroe County'),
  ]);
  beats('A046', [
    V('cm_donna_pipeline_3', 'THE OLD PIPE (1960)'),
    V('cm_seven_mile_aerial_b', 'SEVEN MILE BRIDGE', { cutW: 'So', over: [low('REPLACING IT ALL: 20–30 YEARS', 'twenty')] }),
  ]);
  beats('A047', [
    Q(null, 'REPLACING THE KEYS\' PIPE', '~$10 MILLION', 'A MILE', null, 'Sources: FKAA (WaterWorld 2023); Miami Herald'),
    I('px_road_bridge_sea_drone', 'A BRIDGE OVER THE SEA', { cutW: 'And', over: [low('NEW PIPE UNDER THE SEABED', 'seabed')] }),
  ]);
  beats('A047B', [
    V('cm_carnival_dream_key_west', 'CRUISE SHIP AT KEY WEST', { over: [low('2024: 563,000 CRUISE PASSENGERS', 'half')] }),
    V('cm_mallory_square_crowd', 'MALLORY SQUARE, KEY WEST', { cutW: 'Every' }),
  ]);

  // ===== ENDING =====
  beats('A048', [V('cm_mallory_sunset', 'SUNSET, MALLORY SQUARE, KEY WEST')]);
  beats('A049', [
    I('px_shower_slowmo', 'A HOTEL SHOWER'),
    V('cm_biscayne_aquifer_map', 'BISCAYNE AQUIFER', { cutW: 'soaked', kb: { z: [1.1, 1.2], x: [0.45, 0.5], y: [0.6, 0.62] } }),
    S('globe', GL({ cutW: 'traveled', pins: [{ ...G.fc, label: 'FLORIDA CITY', at: 0.1 }, { ...G.kw, label: 'KEY WEST', at: 1.6 }], routes: [{ pts: PIPE, at: 0.2, dur: 2.2 }] })),
    V('cm_seven_mile_pigeon', 'SEVEN MILE BRIDGE', { cutW: 'just' }),
  ]);
  beats('A050', [V('cm_southernmost_buoy', 'SOUTHERNMOST POINT, KEY WEST', { over: [head('80+ YEARS · ONE PIPE', 'eighty', 200, 72, Yc)] })]);
  beats('A051', [
    V('cm_southernmost_point', 'KEY WEST', { over: [head('WOULD YOU LIVE HERE?', null, 200, 80, Yc)] }),
    V('px_key_colony_beach', 'KEY COLONY BEACH, FLORIDA KEYS', { cutW: 'And' }),
  ]);
  add(T.tl.voiceEnd + 0.4, S('endscreen', {}), 'fade');
  return out;
}
module.exports = { assets, build, defaultTrans: 'cut', splitOver: 4.5, splitTo: 3, smooth: true };
