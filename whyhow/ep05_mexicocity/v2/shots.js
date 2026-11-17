// EP05 v2 Mexico City — real Mexico City footage/photos (Wikimedia Commons, Pixabay, Coverr, NASA), labelled archive maps/paintings, and our own diagrams.
const fs = require('fs'), path = require('path');
const MF = JSON.parse(fs.readFileSync(path.join(__dirname, 'footage/manifest.json')));
const FT = Object.fromEntries(MF.map(x => [x.key, x]));
const assets = {}; for (const x of MF) if (x.type === 'photo') assets[x.key] = 'footage/' + x.key + '.jpg';
const credit = k => { const f = FT[k]; if (!f || !f.attribution) return ''; if (f.source === 'pixabay' || f.source === 'coverr') return ''; if (f.source === 'loc') return 'Photo: ' + f.attribution;
  if (f.source === 'archive_org') return 'Film: ' + (f.attribution || 'US government (public domain)'); return f.source === 'nasa' ? 'Image: ' + f.attribution.replace(/^Image:\s*/, '') : (f.type === 'video' ? 'Video: ' : 'Photo: ') + f.attribution; };
const C = n => require('../atlaskit/core').C[n];
let kbi = 0;
const KB = [{ z: [1.04, 1.18], x: [0.45, 0.55] }, { z: [1.18, 1.04], x: [0.55, 0.45] }, { z: [1.05, 1.2], y: [0.55, 0.45] }, { z: [1.2, 1.06], x: [0.5, 0.5], y: [0.45, 0.55] }];
// F = footage (video or photo by manifest type)
const F = (key, o = {}) => { const f = FT[key]; if (!f) throw new Error('no footage ' + key);
  if (f.type === 'video') return { scene: 'video', p: { file: 'footage/' + key + '.mp4', credit: credit(key), cold: 0, ...o } };
  return { scene: 'photo', p: { img: key, credit: credit(key), kb: KB[kbi++ % KB.length], cold: 0, ...o } }; };
const S = (scene, p = {}) => ({ scene, p });
const low = (text, w, sub) => ({ type: 'lower', text, sub, w });
const head = (text, w, y = 200, size = 96, color) => ({ type: 'head', text, w, y, size, color });
const chipC = (text, w, y, size = 56) => ({ type: 'chip', text, x: 960, y, align: 'center', size, w });
const at = (o, a) => ({ ...o, at: a });

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
    // number cards / key shots can ask to start right before their word (cutW)
    list.forEach((sh, k) => { if (k > 0 && sh && sh.p.cutW) { const t = T.at(pid, sh.p.cutW) - 0.35; if (t > ts[k - 1] + 1.5 && (k + 1 >= ts.length || t < ts[k + 1] - 1.5)) ts[k] = t; delete sh.p.cutW; } else if (sh) delete sh.p.cutW; });
    const durOf = k => (k + 1 < ts.length ? ts[k + 1] : end + 0.25) - ts[k];
    // a label or number must appear early enough to be read before the cut
    const cap = (v, k, keep) => Math.max(0.2, Math.min(v, durOf(k) - keep));
    const rel = (w, t0, nn) => Math.max(0.2, T.at(pid, w, nn || 1) - t0);
    list.forEach((sh, k) => { if (!sh) return; const t0 = ts[k];
      for (const ov of (sh.p.over || [])) { if (ov.w) { ov.at = rel(ov.w, t0, ov.n); delete ov.w; } if (ov.at != null && ov.type !== 'note') ov.at = cap(ov.at, k, 2.4); }
      for (const it of (sh.p.items || [])) { if (it.w) { it.at = rel(it.w, t0, it.n); delete it.w; } if (it.at != null) it.at = cap(it.at, k, 2.6); }
      for (const [kw, ka] of [['answerW', 'answerAt'], ['noteW', 'noteAt'], ['recW', 'recAt']]) if (sh.p[kw]) { sh.p[ka] = Math.max(0.5, T.at(pid, sh.p[kw]) - t0); delete sh.p[kw]; }
      if (sh.p.toneW) { sh.p.toneAt = sh.p.toneW.map(w => Math.max(0.3, T.at(pid, w) - t0)); delete sh.p.toneW; }
      add(t0, sh, 'cut'); });
  }
  const chapter = (pid, n, title) => add(T.s(pid) - 2.0, S('chapter', { n, title }), 'fade');


  const note = (text) => ({ type: 'note', text, x: 60, y: 70, at: 0.3 });
  const lowN = (text, w, n) => ({ type: 'lower', text, w, n });
  const Yc = '#FFC857';
  const st = (cutW, head, items, source, o = {}) => S('stats', { cutW, head, items, source, ...o });

  const cnt = (w, to, o = {}) => ({ type: 'count', from: o.from != null ? o.from : to, to, w, dur: o.dur || 0.3, y: o.y || 560, size: o.size || 170, pre: o.pre, suf: o.suf, label: o.label, dec: o.dec, x: o.x });

  // ===== COLD OPEN =====
  beats('X001', [
    F('px_angel_column_towers_wide', { over: [head('THE ANGEL OF INDEPENDENCE', null, 200, 86), note('MEXICO CITY')] }),
    F('cm_angel_inauguration_1910_escobar', { cutW: 'nineteen', over: [low('1910: 9 STEPS', 'nine'), note('INAUGURATION, SEPTEMBER 1910')] }),
    F('cm_angel_overcast_towers', { cutW: 'Today', kb: { z: [1.75, 1.9], x: [0.52, 0.52], y: [0.74, 0.76] }, over: [cnt('twenty-three', 23, { label: 'STEPS TODAY', y: 330, x: 420, size: 200 })] }),
  ], { start: 0 });
  beats('X002', [
    F('cm_angel_ceremony_1955_steps', { over: [head('NOBODY BUILT IT TALLER', 'Nobody', 200, 90), note('1955')] }),
    F('cm_usgs_building_rising_out_of_ground', { cutW: 'piles', over: [note('ANOTHER BUILDING ON PILES, MEXICO CITY (USGS)')] }),
    F('cm_maf_angel_reforma_bus_1970s', { cutW: 'street', over: [head('THE STREET SANK AROUND IT', 'street', 200, 86, Yc), note('ARCHIVE PHOTO, c. 1970s')] }),
  ]);
  beats('X003', [
    st('worst', 'IN THE WORST PARTS OF THE CITY', [{ pre: 'UP TO ', v: 40, from: 40, suf: ' CM', label: 'A YEAR · MORE THAN A FOOT', at: 0.3, cnt: 0.2, size: 220 }], 'Source: Cigna & Tapete 2021 (Sentinel-1 radar, 2014–2020)', { img: 'cm_nisar_subsidence_map_figA', dark: 0.6 }),
    F('px_drone_sunrise_haze_over_city', { cutW: 'height', over: [head('IT NEVER COMES BACK', 'never', 200, 90, Yc)] }),
  ]);
  beats('X004', [
    F('px_aerial_roofs_dense_neighbourhood', { over: [low('20+ MILLION PEOPLE (METRO AREA)', 'twenty')] }),
    F('cm_madero_eje_central_topdown_slowmo', { cutW: 'falling' }),
    F('nasa_iss_mexico_city_night_lights_2025', { cutW: 'why', over: [head("WHY CAN'T ANYONE STOP IT?", 'why', 200, 84)] }),
  ]);
  add(T.e('X004') + 0.15, S('title', { lines: ['THE CITY THAT SANK', 'BELOW ITS', 'OWN LAKE'], hl: 2, img: 'cm_sobrevuelo_flat_grid_dusk_2018', credit: credit('cm_sobrevuelo_flat_grid_dusk_2018'), brand: true }), 'cut');

  // ===== CH1 (no card) =====
  beats('X005', [
    F('cm_map_valley_1519_lakes', { over: [note('THE LAKES OF THE VALLEY, 1519 (MAP)')] }),
    F('cm_texcoco_lakebed_drive_by', { cutW: 'Under' }),
    S('clay', { cutW: 'clay', at: 99, title: 'UNDER THE STREETS: OLD LAKE CLAY' }),
  ]);
  beats('X006', [
    F('cm_water_truck_cistern_fill_point', { cutW: 'About', over: [cnt('seventy', 70, { suf: '%', label: 'OF THE SUPPLY IS GROUNDWATER' }), note('WATER FILLING POINT, MEXICO CITY')] }),
  ]);
  beats('X007', [
    S('clay', { at: 0.4, dur: 3.4 }),
    F('cm_casa_camilos_sunken_below_sidewalk', { cutW: 'Everything', over: [note('A HOUSE NOW BELOW THE PAVEMENT, MEXICO CITY')] }),
  ]);
  beats('X008', [
    F('cm_cathedral_ca1905', { over: [note('c. 1905–1910')] }),
    S('lakelevel', { cutW: 'nineteen' }),
    F('cm_sobrevuelo_centro_skyline_2017', { cutW: 'pump', over: [head('NOW IT PUMPS ITS SEWAGE UPHILL', 'pump', 200, 80, Yc)] }),
  ]);

  // ===== CH2 =====
  chapter('X009', 1, 'Killing the lake');
  beats('X009', [
    F('cm_map_tenochtitlan_1524_nuremberg', { over: [note('TENOCHTITLAN, 1524 MAP')] }),
    F('px_templo_mayor_ruins_cathedral', { cutW: 'Spanish', over: [note('AZTEC TEMPLE RUINS NEXT TO THE CATHEDRAL')] }),
    F('cm_plaza_mayor_1629_flood_map', { cutW: 'sixteen', over: [low('1629: FLOODED FOR ~5 YEARS', 'sixteen'), note('OLD MAP OF THE CITY IN ITS LAKE')] }),
  ]);
  beats('X010', [
    F('cm_humboldt_huehuetoca_canal_profile', { over: [note('DRAINAGE CUT THROUGH THE MOUNTAINS, HUMBOLDT ATLAS, 1811')] }),
    F('cm_ferrocarril_desague_zumpango_1920', { cutW: 'nineteen', over: [low('1900: THE GRAN CANAL OPENS', 'nineteen'), note('DRAINAGE-WORKS RAILWAY, c. 1920')] }),
    F('cm_lago_texcoco_aerial_1944', { cutW: 'most', over: [note('WHAT WAS LEFT OF LAKE TEXCOCO, 1944')] }),
  ]);
  beats('X011', [
    F('cm_casimiro_castro_valley_from_chapultepec_1850', { over: [note('THE VALLEY, 1850s (LITHOGRAPH)')] }),
    F('cm_lago_texcoco_shore_aerial_1940s', { cutW: 'hundreds', over: [note('THE OLD LAKEBED, 1940s')] }),
  ]);
  beats('X012', [
    F('cm_roberto_gayol_portrait', { over: [low('ROBERTO GAYOL, ENGINEER', 'Roberto')] }),
    F('cm_cathedral_1910', { cutW: 'city', over: [low('1925: THE CENTER HAD DROPPED', 'dropped'), note('c. 1910')] }),
    F('cm_zocalo_cathedral_1938', { cutW: 'took', over: [note('1938')] }),
    F('cm_aerial_city_1962', { cutW: 'nineteen', over: [low('1947: NABOR CARRILLO PROVES WHY', 'Carrillo'), note('1960s')] }),
  ]);

  // ===== CH3 =====
  chapter('X013', 2, 'The cathedral they sank on purpose');
  beats('X013', [F('cm_old_basilica_guadalupe_side', { over: [note('OLD BASILICA OF GUADALUPE')] })]);
  beats('X014', [
    F('cm_cathedral_facade_tilt_up', { over: [low('THE METROPOLITAN CATHEDRAL', 'Metropolitan')] }),
    F('cm_cathedral_casimiro_castro_lithograph', { cutW: 'builders', over: [note('LITHOGRAPH, 19TH CENTURY')] }),
    F('cm_cathedral_facade_detail', { cutW: 'cornices' }),
  ]);
  beats('X015', [
    F('cm_cathedral_1991_cohen_rose', { over: [note('JANUARY 1991')] }),
    F('cm_cathedral_pendulum_floor_marker', { cutW: 'almost', over: [cnt('two', 2.4, { dec: 1, suf: ' M', label: 'ONE END LOWER THAN THE OTHER (1989)' }), note('THE PENDULUM THAT TRACKS THE TILT')] }),
  ]);
  beats('X016', [
    S('cathedral', { dur: 4 }),
    F('cm_cathedral_foundations_archaeological_zone', { cutW: 'five', over: [note('UNDER THE CATHEDRAL')] }),
  ]);
  beats('X017', [
    F('cv_zocalo_sunrise_empty_cathedral'),
    F('cm_cathedral_pendulum_wide', { cutW: 'evenly' }),
  ]);
  beats('X018', [
    F('cv_drone_bellas_artes_alameda', { over: [low('PALACE OF FINE ARTS', 'Palace')] }),
    F('loc_bain_opera_house_construction', { cutW: 'original', over: [note('UNDER CONSTRUCTION, 1910s')] }),
    F('cm_bellas_artes_entrance_2010', { cutW: 'Visitors', over: [low("TODAY'S ENTRANCE: ONCE THE FLOOR ABOVE", 'Visitors')] }),
  ]);

  // ===== CH4 =====
  chapter('X019', 3, 'Sewage that has to go uphill');
  beats('X019', [F('cm_sobrevuelo_storm_torre_latino_2017')]);
  beats('X020', [
    st('four', 'BY THE 1950s', [{ v: 4, from: 4, suf: ' M', label: 'SEWERS BELOW THE CANAL THEY DRAIN INTO', at: 0.3, cnt: 0.2, size: 240 }], 'Source: SACMEX', { img: 'cm_pump_station_villa_coapa_2017', dark: 0.65 }),
    F('cm_flood_1952_boats_christensen', { cutW: 'floods', over: [note('MEXICO CITY FLOOD, 1952')] }),
    F('cm_maf_flood_street_men_wading', { over: [note('FLOODED DOWNTOWN STREET, 1950s (UNDATED ARCHIVE)')] }),
  ]);
  beats('X021', [
    F('cm_pump_station_villa_coapa_2017', { over: [low('SEWAGE PUMPED UPHILL', 'pumping'), note('SEWAGE & STORMWATER PUMPING PLANT, 2017')] }),
    F('cm_aerial_city_1962', { cutW: 'nineteen', kb: { z: [1.3, 1.15], x: [0.6, 0.5] }, over: [low('1967: GO DEEP', 'radical'), note('1960s')] }),
  ]);
  beats('X022', [st('shafts', 'THE DEEP DRAIN, 1975', [{ v: 200, from: 200, suf: '+ M', label: 'SOME SHAFTS DEEPER THAN THIS', at: 0.3, cnt: 0.2, size: 240 }], 'Source: SACMEX', {})]);
  beats('X023', [
    F('cm_sobrevuelo_central_abasto_2017'),
    st('sixty-two', 'EMISOR ORIENTE, 2019', [{ v: 62, from: 62, suf: ' KM', label: "THE WORLD'S LONGEST SEWAGE TUNNEL", at: 0.3, cnt: 0.2, size: 240 }], 'Source: Guinness World Records; CONAGUA'),
  ]);

  // ===== CH5 =====
  chapter('X024', 4, 'The sinking moved out of town');
  beats('X024', [
    F('cm_zocalo_works_1958', { over: [low('1940: NO NEW WELLS IN THE CENTER', 'banned'), note('1958')] }),
    F('cm_madero_street_timelapse', { cutW: 'Later' }),
    F('cm_sobrevuelo_centro_bellas_artes_2018', { cutW: 'Downtown', over: [low('DOWNTOWN: 50 CM → 10–15 CM A YEAR', 'slowed')] }),
  ]);
  beats('X025', [
    F('px_drone_nezahualcoyotl_monument_lakebed', { over: [note('CIUDAD NEZAHUALCOYOTL')] }),
    F('cm_nisar_subsidence_map_figA', { cutW: 'edges', over: [note('NASA/ISRO NISAR RADAR: FASTEST SINKING IN THE EAST')] }),
    F('cm_neza_street_2020s', { cutW: 'Neza', over: [low('~3 CM A MONTH (2019–2020)', 'month'), note('NEZA')] }),
  ]);
  beats('X026', [
    F('cm_maf_flood_aculco_iztapalapa_1988', { over: [low('2.7 MILLION PEOPLE IN SUNKEN "BOWLS"', 'million'), note('IZTAPALAPA FLOOD, 1988')] }),
    F('cm_flooded_street_microbus', { cutW: 'Another' }),
    F('cm_sobrevuelo_tlahuac_2017', { cutW: 'cracks', over: [low('1.5 MILLION ON CRACKING GROUND', 'cracks'), note('TLAHUAC, EASTERN LAKEBED, 2017')] }),
  ]);

  // ===== CH6 =====
  chapter('X027', 5, 'A lake city with no water');
  beats('X027', [F('cm_xochimilco_trajineras_wide_canal', { over: [note('XOCHIMILCO: THE LAST CANALS OF THE OLD LAKES')] })]);
  beats('X028', [
    st('lifted', 'WATER FROM THE MOUNTAINS', [{ v: 1100, from: 1100, suf: '+ M', label: 'LIFTED UPHILL', at: 0.3, cnt: 0.2, size: 220 }], 'Source: World Bank / CONAGUA (Cutzamala system)', { img: 'cm_cutzamala_system_map', dark: 0.6 }),
    F('cm_valle_de_bravo_lake_2023', { cutW: 'twenty', over: [note('VALLE DE BRAVO RESERVOIR (CUTZAMALA SYSTEM)')] }),
    F('cm_valle_de_bravo_low_water_2016', { cutW: 'quarter', over: [low('2024: RESERVOIRS ~25% FULL', 'quarter'), note('LOW WATER, 2016')] }),
    F('cm_pipa_water_truck_xochimilco', { cutW: 'homes', over: [note('A WATER TRUCK, MEXICO CITY')] }),
  ]);
  beats('X029', [
    st('forty', 'LEAKS AND ILLEGAL TAPS', [{ pre: 'UP TO ', v: 40, from: 40, suf: '%', label: 'OF THE WATER NEVER REACHES A HOME', at: 0.3, cnt: 0.2, size: 220 }], 'Source: SACMEX; Al Jazeera (2024)', { img: 'cm_casa_camilos_calderas_2', dark: 0.7 }),
  ]);

  // ===== CH7 =====
  chapter('X030', 6, 'Can it be stopped?');
  beats('X030', [F('cm_iss46_mexico_city_from_space', { over: [note('MEXICO CITY FROM THE INTERNATIONAL SPACE STATION')] })]);
  beats('X031', [
    F('nasa_sts62_mexico_city_basin_1994', { over: [head('THE LOST HEIGHT IS GONE', 'gone', 200, 86, Yc), note('SPACE SHUTTLE PHOTO, 1994')] }),
    S('clay', { cutW: 'clay', at: 0.3, dur: 2.5, title: 'THE CLAY IS STILL DRAINING' }),
  ]);
  beats('X032', [
    F('cm_sobrevuelo_centro_skyline_2017', { kb: { z: [1.25, 1.1] } }),
    F('cm_rain_tank_school_2018', { cutW: 'since', over: [cnt('seventy', 70000, { suf: '+', label: 'ROOFTOP RAIN COLLECTORS SINCE 2019' }), note('A RAIN COLLECTOR, MEXICO CITY, 2018')] }),
  ]);

  // ===== ENDING =====
  chapter('X033', 7, 'The answer');
  beats('X033', [
    F('cm_casimiro_castro_valley_from_chapultepec_1850', { kb: { z: [1.25, 1.1] }, over: [note('THE VALLEY, 1850s')] }),
    F('cm_sobrevuelo_reforma_day_2018', { cutW: 'fell' }),
  ]);
  beats('X034A', [F('px_aerial_roofs_dense_neighbourhood', { in: 6, over: [head('WHICH CITY SHOULD WE EXPLAIN NEXT?', null, 200, 80)] })]);
  beats('X034', [
    F('cm_sobrevuelo_angel_night_2016'),
    F('cm_angel_overcast_towers', { cutW: 'step', kb: { z: [1.6, 1.85], x: [0.52, 0.52], y: [0.74, 0.76] } }),
    F('px_angel_independence_night_drone', { in: 5, cutW: 'Fourteen', over: [head('14 STEPS SO FAR. AND COUNTING.', 'Fourteen', 200, 90, Yc)] }),
  ]);
  add(T.tl.voiceEnd + 0.4, S('endscreen', {}), 'fade');
  return out;
}
module.exports = { assets, build, defaultTrans: 'cut', splitOver: 4.5, splitTo: 3 };
