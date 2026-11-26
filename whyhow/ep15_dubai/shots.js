// EP15 Dubai — real Dubai footage (Pixabay, Flickr CC, Commons), NASA ISS / Landsat / Earth Observatory, ESA Sentinel-2.
// Anything not literally Dubai/UAE is labelled ILLUSTRATIVE. No AI images.
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
// Commons files may be missing (Commons rate limit): honest fallbacks with their own labels
const FB = { cm_uae_flood_april_2024_road: ['pb_flooded_road_228296', 'FLOODED ROAD · ' + IL], cm_dubai_1965_windtowers: ['loc_1910_dubai_arms_traffic_bain', 'DUBAI, c. 1910 (LIBRARY OF CONGRESS)'],
  cm_graphic_1881_pearl_fishery: ['fl_expo2020_pearl_diving_exhibit', 'PEARL DIVING EXHIBIT, EXPO 2020 DUBAI'], cm_arab_pearl_divers_persian_gulf_1908: ['pb_dhow_3216218', 'TRADITIONAL BOAT · ' + IL],
  cm_jubail_1935_pearl_divers_07: ['pb_dhow_2042790', 'DHOW · ' + IL], cm_jubail_1935_pearl_divers_01: ['pb_pearl_oyster_4870120', 'PEARLS · ' + IL],
  cm_dubai_creek_yeowatzup: ['fl_dubai_creek_abras_neekoh', 'DUBAI CREEK'], cm_sheikh_rashid_1968_meeting: ['fl_dubai_creek_water_taxis_hurd', 'DUBAI CREEK'], cm_abra_ride_2008_imresolt: ['fl_dubai_creek_abra_hurd', 'DUBAI CREEK'],
  cm_dubai_1965_airport_panorama: ['gov_nasa_iss_2021_airport_creek', 'DUBAI AIRPORT AND THE CREEK (NASA ISS, 2021)'], cm_dubai_1965_airport_first_comet: ['gov_nasa_iss_2009_dubai_night', 'DUBAI AT NIGHT (NASA ISS, 2009)'],
  cm_jebel_ali_port_1_imresolt: ['pb_container_terminal_7418239', 'CONTAINER PORT · ' + IL], cm_jebel_ali_port_3_imresolt: ['pb_container_port_141056', 'CONTAINER TERMINAL · ' + IL],
  cm_cira_2024_storm_oman_uae: ['gov_nasa_eo_abu_dhabi_flood_20240419', 'ABU DHABI AREA, 19 APRIL 2024 (NASA LANDSAT 9)'], cm_sheikh_rashid_1971_portrait: ['fl_dubai_creek_traffic_mamamusings', 'DUBAI CREEK'],
  cm_uae_flood_16_april_2024_cars: ['pb_flooded_road_302862', 'FLOODED ROAD · ' + IL], cm_dubai_after_heavy_rain_jebel_ali_2024: ['gov_nasa_eo_dubai_flood_after_20240419', 'DUBAI, 19 APRIL 2024 (NASA LANDSAT 9)'] };
const R = (k, label) => (FT[k] && require('fs').existsSync(path.join(__dirname, FT[k].type === 'video' ? 'footage/' + k + '.mp4' : 'footage/' + k + '.jpg'))) ? [k, label] : (FB[k] || [k, label]);
const V = (k0, label0, o = {}) => { const [k, label] = R(k0, label0); return F(k, { ...o, over: [...(o.over || []), note(label)] }); };
const I = (k, label, o = {}) => V(k, label + ' · ' + IL, o);
const A = (k, label, o = {}) => V(k, label, { sfx: 'click', ...o });
const Q = (cutW, top, l1, l2, chipT, source) => S('stats', { cutW, head: top, items: [], sfx: 'boom', over: [at(head(l1, null, l2 ? 470 : 520, 88, Yc), 0.05), ...(l2 ? [at(head(l2, null, 590, 88, Yc), 0.25)] : []), ...(chipT ? [{ ...chipC(chipT, null, l2 ? 740 : 700, 44), at: 0.6 }] : [])], source });
const G = { dubai: { lon: 55.27, lat: 25.2 }, phx: { lon: -112.07, lat: 33.45 }, jebel: { lon: 55.03, lat: 24.99 }, alain: { lon: 55.74, lat: 24.2 }, abudhabi: { lon: 54.37, lat: 24.45 }, hassyan: { lon: 54.85, lat: 24.93 }, solar: { lon: 55.35, lat: 24.77 }, awir: { lon: 55.6, lat: 25.15 }, fateh: { lon: 54.4, lat: 25.6 } };
const GL = (o = {}) => ({ relief: true, borders: true, lon: [[0, 50], [3, 55]], lat: [[0, 22], [3, 25]], R: [[0, 1400], [3, 2200]], ...o });

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

  // ===== COLD OPEN =====
  beats('A001', [
    V('cm_uae_flood_16_april_2024_cars', 'FLOODED ROAD, UAE, 16 APRIL 2024', { over: [low('TUESDAY, 16 APRIL 2024', 'Tuesday')] }),
    V('esa_2024_dubai_floods_sentinel2', 'DUBAI, 17 APRIL 2024 (COPERNICUS SENTINEL-2, ESA)', { cutW: 'At', kb: { z: [1.1, 1.35] } }),
    I('pb_heavy_rain_street_209759', 'HEAVY RAIN', { cutW: 'passenger' }),
  ], { start: 0 });
  beats('A002', [
    Q(null, 'DUBAI INTERNATIONAL, 2 DAYS', '1,244 FLIGHTS CANCELLED', null, '41 DIVERTED', 'Source: Dubai officials via The National, 18 Apr 2024'),
    I('pb_flooded_road_302862', 'FLOODED ROAD', { cutW: 'Highways' }),
    V('cm_uae_flood_april_2024_road', 'UAE, APRIL 2024', { cutW: 'Cars' }),
  ]);
  beats('A003', [
    V('pb_dubai_skyline_31956', 'DUBAI', { over: [low('DUBAI: ~3.7 IN (95 MM) OF RAIN A YEAR', 'Phoenix')] }),
    S('bars', { cutW: 'That', title: 'RAIN', sub: 'Dubai airport gauge', max: 7, items: [{ label: 'A NORMAL YEAR', v: 3.7, text: '3.7 IN', color: C('iceL'), at: 0.5 }, { label: '16 APRIL 2024 (24 HOURS)', v: 5.6, text: '~5.6 IN', color: C('red'), w: 'year' }], source: 'Sources: NCM / AP (142 mm in 24 h); average 94.7 mm' }),
    V('gov_nasa_eo_dubai_flood_after_20240419', 'DUBAI, 19 APRIL 2024: FLOODWATER IN BLUE (NASA LANDSAT 9)', { cutW: 'single' }),
  ]);
  beats('A004', [
    V('cm_dubai_after_heavy_rain_jebel_ali_2024', 'JEBEL ALI, DUBAI, 19 APRIL 2024', { over: [low('AL BARSHA, DUBAI', 'Barsha')] }),
    I('pb_tap_water_180728', 'A DRY TAP', { cutW: 'had' }),
    S('stats', { cutW: 'In', head: 'AL BARSHA, 16 APRIL 2024', items: [], over: [at(head('RESIDENTS SCOOPED WATER', null, 470, 90), 0.1), at(head('FROM THE POOL', null, 590, 90, Yc), 0.4)], source: 'Source: Khaleej Times, 19 Apr 2024' }),
  ]);
  beats('A005', [
    V('pb_dubai_night_209890', 'STORM OVER DUBAI'),
    I('pb_sea_waves_283533', 'THE SEA', { cutW: 'It', over: [low('ALMOST EVERY DROP: FROM THE SEA', 'sea')] }),
    I('pb_storm_drain_20283', 'DRAIN', { cutW: 'And', over: [head('NOT BUILT TO GET RID OF WATER', 'never', 200, 72)] }),
  ]);
  beats('A006', [
    V('pb_burj_khalifa_213422', 'DUBAI AT NIGHT', { over: [low('~4.6 MILLION PEOPLE', 'four')] }),
    V('pb_dubai_creek_129251', 'DESERT ROAD, DUBAI', { cutW: 'Where' }),
    V('pb_dubai_traffic_303794', 'SHEIKH ZAYED ROAD, DUBAI', { cutW: 'What' }),
    V('pb_dubai_skyline_26114', 'BURJ KHALIFA', { cutW: 'And' }),
  ]);
  beats('A007', [
    S('stats', { head: 'THE OBVIOUS ANSWER', items: [], over: [at(head('OIL MONEY?', null, 470, 120, Yc), 0.2), { ...chipC('OIL TODAY: ~1% OF DUBAI\'S ECONOMY', 'only', 660, 50) }], source: 'Sources: Oxford Business Group; Dubai statistics' }),
    S('stats', { cutW: 'The', head: 'THE SECOND ANSWER', items: [], over: [at(head('UNDERGROUND WATER?', null, 470, 110, Yc), 0.2), { ...chipC('THE OLD WELLS ARE ALMOST GONE', 'gone', 660, 50) }] }),
    V('pb_dubai_creek_4642470', 'DUBAI CREEK, DEIRA', { cutW: 'And' }),
  ]);
  add(T.e('A007') + 0.15, S('title', { lines: ['HOW DUBAI STAYS', 'ALIVE IN THE DESERT'], hl: 1, img: 'gov_nasa_iss_2021_desert_city', credit: credit('gov_nasa_iss_2021_desert_city'), brand: true, sfx: 'riser' }), 'cut');

  // ===== CH1 =====
  chapter('A008', 1, 'A town that lived on pearls');
  beats('A008', [
    A('loc_1910_dubai_arms_traffic_bain', 'DUBAI, c. 1910 (LIBRARY OF CONGRESS)', { over: [low('1881: FEWER THAN 12,000 PEOPLE', 'twelve')] }),
    V('cm_dubai_creek_yeowatzup', 'DUBAI CREEK', { cutW: 'on' }),
  ]);
  beats('A009', [
    A('cm_graphic_1881_pearl_fishery', 'PEARL FISHING IN THE GULF, "THE GRAPHIC", 1881 · ' + IL, { over: [low('335 PEARLING BOATS IN DUBAI', 'three')] }),
    A('cm_jubail_1935_pearl_divers_07', 'PEARL DIVERS, JUBAIL, 1935 · ' + IL, { cutW: 'almost' }),
    V('pb_dubai_abra_9060098', 'DUBAI CREEK, TRADITIONAL BOATS', { cutW: 'Divers' }),
  ]);
  beats('A011', [
    I('pb_dhow_3216218', 'TRADITIONAL BOAT AT SUNRISE', { over: [low('MOHAMMED BIN ABDULLA AL SUWAIDI', 'Mohammed', 'one of the last pearl divers')] }),
    V('fl_dubai_creek_abras_neekoh', 'DUBAI CREEK', { cutW: 'He' }),
    S('stats', { cutW: 'died', head: 'AL SUWAIDI', items: [], over: [at(head('50+ YEARS AT SEA', null, 440, 100, Yc), 0.2), at(head('DIED 1998, AGED 96', null, 560, 80), 0.6), ], source: 'Source: Gulf News; The National' }),
    V('fl_dubai_creek_abra_hurd', 'DUBAI CREEK', { cutW: 'His', over: [low('HIS GRANDSON: PEARL FARMING', 'farms')] }),
  ]);
  beats('A012', [
    I('pb_pearl_oyster_4870120', 'CULTURED PEARLS', { kb: { z: [1.3, 1.1] }, over: [low('1920s: JAPANESE CULTURED PEARLS', 'Japan')] }),
    Q('They', 'CULTURED vs NATURAL', 'UP TO 10× CHEAPER', null, null, 'Source: Qatar Digital Library'),
    S('stats', { cutW: 'Then', head: '', items: [], sfx: 'boom', over: [at(head('1929', null, 520, 200, Yc), 0.2), at(head('THE CRASH', null, 680, 80), 0.5)] }),
  ]);
  beats('A013', [
    V('fl_dubai_creek_water_taxis_hurd', 'DUBAI CREEK', { kb: { z: [1.3, 1.1] } }),
    S('stats', { cutW: 'people', head: 'DUBAI PEARL MUSEUM MANAGER', items: [], over: [at(head('"PEOPLE GOT EVEN POORER.', null, 470, 80), 0.2), at(head('IT WAS STARVATION."', null, 580, 80, Yc), 0.8)] }),
  ]);

  // ===== CH2 =====
  chapter('A015', 2, 'Water from the sea');
  beats('A015', [
    V('pb_dubai_desert_6826299', 'DESERT NEAR DUBAI', { over: [low('UNTIL ~1961: NO CLEAN PUBLIC WATER', 'nineteen')] }),
    V('pb_dubai_abra_7767575', 'DUBAI CREEK', { cutW: 'People' }),
    S('stats', { cutW: 'diseases', head: 'BEFORE PIPED WATER', items: [], over: [at(head('TYPHOID · CHOLERA', null, 520, 110, Yc), 0.2)] }),
  ]);
  beats('A016', [
    S('globe', GL({ pins: [{ ...G.dubai, label: 'DUBAI', at: 0.2 }, { ...G.awir, label: 'AL AWIR', w: 'Awir', small: true, size: 40 }] })),
    V('fl_dubai_creek_abras_mccaffrey', 'DUBAI CREEK', { cutW: 'fresh', over: [low('ERIC TULLOCH, WATER ENGINEER', 'Tulloch')] }),
    I('pb_water_pipe_190323', 'WATER PIPE', { cutW: 'pipes', in: 3 }),
  ]);
  beats('A017', [
    A('cm_sheikh_rashid_1971_portrait', 'SHEIKH RASHID BIN SAEED AL MAKTOUM, 1971', { kb: { z: [1.05, 1.2] }, over: [low('SHEIKH RASHID, RULER 1958–1990', 'Rashid')] }),
    V('fl_dubai_creek_traffic_mamamusings', 'DUBAI CREEK', { cutW: 'borrowed' }),
    V('cm_abra_ride_2008_imresolt', 'DUBAI CREEK', { cutW: 'Dubai' }),
  ]);
  beats('A018', [
    S('globe', GL({ lon: [[0, 54.5], [3, 54.8]], lat: [[0, 25.0], [3, 25.2]], R: [[0, 9000], [3, 11000]], pins: [{ ...G.dubai, label: 'DUBAI', at: 0.2 }, { ...G.fateh, label: 'FATEH OIL FIELD, 1966', at: 0.6, small: true, size: 40 }] })),
    I('pb_pipeline_67364', 'OIL INDUSTRY', { cutW: 'The', over: [low('FIRST EXPORT: 1969', 'nineteen')] }),
    S('globe', GL({ cutW: 'But', lon: [[0, 54.6], [3, 54.6]], lat: [[0, 24.4], [3, 24.4]], R: [[0, 5000], [3, 5200]], pins: [{ ...G.dubai, label: 'DUBAI: LITTLE OIL', at: 0.2 }, { ...G.abudhabi, label: 'ABU DHABI: MOST OF IT', w: 'Abu' }] })),
  ]);
  beats('A019', [
    A('cm_sheikh_rashid_1968_meeting', 'SHEIKH RASHID (CENTRE) AND HIS SONS, 1968'),
    V('cm_dubai_1965_airport_panorama', 'DUBAI AIRPORT, 1965', { cutW: 'And' }),
    S('globe', GL({ cutW: 'Jebel', lon: [[0, 55.1], [3, 55.1]], lat: [[0, 25.05], [3, 25.05]], R: [[0, 14000], [3, 16000]], pins: [{ ...G.dubai, label: 'OLD DUBAI', at: 0.2, small: true, size: 40 }, { ...G.jebel, label: 'JEBEL ALI · 1979', w: 'Jebel' }] })),
  ]);
  beats('A020', [
    V('cm_jebel_ali_port_1_imresolt', 'JEBEL ALI PORT, DUBAI', { over: [low('FEB 1979: QUEEN ELIZABETH II OPENS THE PORT', 'February')] }),
    Q('June', 'JUNE 1979 · JEBEL ALI', 'DUBAI\'S FIRST', 'DESALINATED WATER', null, 'Source: DEWA'),
  ]);
  beats('A021', [
    I('pb_sea_waves_283533', 'SEAWATER', { in: 2, over: [low('DESALINATION: TAKING THE SALT OUT', 'salt')] }),
    I('pb_tap_water_147075', 'TAP WATER', { cutW: 'Almost', over: [head('ALMOST ALL OF IT COMES FROM THE SEA', 'Almost', 200, 64)] }),
  ]);
  beats('A022', [
    V('gov_nasa_iss_2021_uae_coast_industrial', 'INDUSTRY ON THE UAE COAST (NASA ISS, 2021) · ' + IL),
    Q('Guinness', 'JEBEL ALI POWER & DESALINATION', '~590 MILLION', 'GALLONS A DAY', 'GUINNESS: LARGEST SINGLE-SITE DESALINATION PLANT', 'Source: DEWA / Guinness World Records 2022'),
  ]);
  beats('A023', [V('gov_nasa_iss_2021_airport_creek', 'DUBAI FROM THE SPACE STATION (NASA, 2021)', { over: [low('ONE SITE: MORE THAN HALF OF WHAT ALL OF NEW YORK CITY USES', 'half')] })]);
  beats('A024', [
    S('stats', { head: 'HOW MOST OF IT IS MADE', items: [], over: [at(head('SEAWATER + HEAT', null, 440, 96), 0.2), { ...head('→ STEAM → FRESH WATER', 'evaporates', 570, 84, Yc) }], source: 'Multi-stage flash: 427 of 495 MIGD (DEWA)' }),
    I('pb_power_plant_128312', 'POWER PLANT (EUROPE)', { cutW: 'evaporates' }),
  ]);
  beats('A025', [
    I('pb_air_conditioner_102435', 'POWER PLANT CHIMNEY', { over: [head('POWER + WATER = ONE MACHINE', 'same', 200, 72, Yc)] }),
    V('gov_nasa_iss_2013_uae_night', 'THE UAE AT NIGHT (NASA ISS, 2013)', { cutW: 'If', over: [low('IF THE TURBINES STOP, SO DOES MOST OF THE WATER', 'stop')] }),
  ]);
  beats('A026', [
    V('pb_dubai_skyline_254757', 'DUBAI MARINA'),
    S('stats', { cutW: 'In', head: 'DUBAI, 2025', items: [{ v: 194, suf: ' BN', label: 'GALLONS OF WATER IN A YEAR', at: 0.5, color: Yc }, { v: 585, suf: ' M', label: 'GALLONS ON THE BUSIEST DAY', at: 1.4 }], source: 'Source: DEWA 2025 results (converted to US gallons)' }),
    V('pb_dubai_night_163160', 'THE DUBAI FOUNTAIN', { cutW: 'busiest' }),
  ]);
  beats('A026B', [S('stats', { head: 'BUSIEST DAY vs WHAT THE PLANTS CAN MAKE', items: [], over: [at(head('~98%', null, 520, 220, Yc), 0.2), { ...chipC('ALMOST NO SPARE WATER', null, 720, 50), at: 1.2 }], source: 'Our calculation: 487 MIG peak day / 495 MIGD capacity (DEWA)' }),
    V('gov_nasa_iss_2022_dubai_night', 'DUBAI AT NIGHT (NASA ISS, 2022)', { cutW: 'On' })]);
  beats('A027', [
    V('pb_dubai_desert_16138', 'DESERT, DUBAI', { over: [low('NO GOING BACK TO WELLS', 'wells')] }),
    V('gov_nasa_iss_2011_rub_al_khali_sand_sea', 'RUB AL KHALI SAND SEA (NASA ISS, 2011)', { cutW: 'Much' }),
    Q('in', 'FARM AREAS, ABU DHABI', 'WATER TABLE: DOWN', 'UP TO 5 M (16 FT) A YEAR', null, 'Source: Environment Agency Abu Dhabi'),
    I('pb_water_pipe_190323', 'WELL WATER', { cutW: 'Here', in: 1, over: [low('WELLS: EMERGENCY BACKUP ONLY', 'backup')] }),
  ]);

  // ===== CH3 =====
  chapter('A028', 3, 'The war on heat');
  beats('A028', [V('pb_dubai_airport_111204', 'DUBAI IN THE HAZE')]);
  beats('A029', [
    I('pb_sun_heat_4753', 'SUMMER SUN', { over: [low('1 AUGUST 2025 · SWEIHAN, UAE', 'August')] }),
    S('stats', { cutW: 'That\'s', head: 'UAE AUGUST RECORD', items: [{ v: 125.2, dec: 1, suf: '°F', label: '51.8°C · 1 AUG 2025', color: C('red'), at: 0.3 }, { v: 122, suf: '°F', label: 'PHOENIX ALL-TIME RECORD', w: 'Phoenix' }], source: 'Source: UAE National Center of Meteorology' }),
  ]);
  beats('A030', [
    V('pb_dubai_marina_31956', 'DUBAI IN SUMMER HAZE'),
    Q('the', 'DUBAI · 17 JULY 2024', 'FEELS LIKE 144°F', null, 'HEAT INDEX ~62°C', 'Source: Washington Post / Euronews analysis'),
    I('pb_dubai_fog_328740', 'HUMID AIR', { cutW: 'The' }),
  ]);
  beats('A031', [
    I('pb_construction_workers_42923', 'CONSTRUCTION WORKERS', { over: [low('15 JUNE – 15 SEPTEMBER', 'June')] }),
    Q('outdoor', 'THE MIDDAY BREAK LAW', '12:30 – 3:00 PM', null, 'NO OUTDOOR WORK IN THE SUN', 'Source: UAE Ministry of Human Resources'),
    I('pb_construction_site_crane_206315', 'CONSTRUCTION SITE', { cutW: 'Companies', over: [low('FINE: PER WORKER', 'fined')] }),
  ]);
  beats('A032', [I('pb_construction_workers_67460', 'CONSTRUCTION WORKER')]);
  beats('A033', [
    V('pb_dubai_skyline_203952', 'DOWNTOWN DUBAI', { over: [low('EVERYONE ELSE LIVES INDOORS', 'indoors')] }),
    I('pb_air_conditioning_units_build_1028554', 'AIR-CONDITIONING UNITS', { cutW: 'On' }),
    Q('sixty', 'SUMMER AFTERNOON PEAK', 'UP TO 60%', null, 'OF PEAK POWER GOES TO COOLING', 'Source: DEWA'),
  ]);
  beats('A034', [
    S('stats', { head: 'DUBAI PEAK ELECTRICITY DEMAND', items: [{ v: 10.76, dec: 2, suf: ' GW', label: '2024', at: 0.4 }, { v: 11.39, dec: 2, suf: ' GW', label: '2025', at: 1.0 }, { v: 11.68, dec: 2, suf: ' GW', label: 'SUMMER 2026 (RECORD)', color: C('red'), w: 'record' }], source: 'Source: DEWA' }),
    V('gov_nasa_iss_2012_dubai_night', 'DUBAI AT NIGHT (NASA ISS, 2012)', { cutW: 'That\'s', over: [low('> 5 HOOVER DAMS', 'Hoover')] }),
  ]);
  beats('A035', [I('pb_air_conditioning_units_build_7687775', 'AC UNITS ON A BUILDING', { over: [head('IT PIPES COLD TO THEM', 'pipes', 200, 80, Yc)] })]);
  beats('A036', [
    S('stats', { head: 'DISTRICT COOLING', items: [], over: [at(head('CENTRAL PLANT → CHILLED WATER', null, 440, 80), 0.2), { ...head('→ UNDERGROUND PIPES → BUILDINGS', null, 560, 72, Yc), at: 1.2 }], source: 'ILLUSTRATION OF THE PRINCIPLE' }),
    I('pb_industrial_pipes_8899206', 'INSULATED PIPE', { cutW: 'through' }),
    V('pb_dubai_aerial_108522', 'SHEIKH ZAYED ROAD, DUBAI', { cutW: 'The', over: [low('EMPOWER: "WORLD\'S LARGEST DISTRICT COOLING PROVIDER"', 'Empower')] }),
  ]);
  beats('A037', [
    V('fl_dubai_metro_szr_travelourplanet', 'DUBAI METRO, SHEIKH ZAYED ROAD'),
    S('stats', { cutW: 'Today', head: 'EMPOWER', items: [{ v: 1750, pre: '~', label: 'BUILDINGS CONNECTED', at: 0.4, color: Yc }, { v: 6, pre: '~', suf: ' GW', label: 'OF COOLING (OUR CALC)', at: 1.2 }], source: 'Source: Empower / Dubai Media Office, Jan 2026' }),
    V('pb_dubai_skyline_213422', 'BUSINESS BAY AND DOWNTOWN, DUBAI', { cutW: 'Business', over: [low('BUSINESS BAY PLANT: A GUINNESS RECORD', 'Guinness')] }),
  ]);
  beats('A038', [
    I('pb_pipeline_67364', 'GAS INDUSTRY', { in: 2, over: [low('MOSTLY NATURAL GAS', 'gas')] }),
    I('pb_solar_panels_desert_72837', 'SOLAR PARK IN A DESERT', { cutW: 'South', over: [low('MOHAMMED BIN RASHID SOLAR PARK: 3.9 GW', 'solar')] }),
    I('pb_solar_panels_desert_42388', 'SOLAR PANELS', { cutW: 'nearly' }),
    Q('But', 'DUBAI\'S POWER, 2025', 'CLEAN ENERGY: ~1/6', null, '16% OF ELECTRICITY GENERATED', 'Source: DEWA 2025 results'),
  ]);

  // ===== CH4 =====
  chapter('A039', 4, 'A city that imports everything');
  beats('A039', [V('pb_dubai_desert_6826298', 'DESERT NEAR DUBAI', { over: [head('FOOD', 'Food', 200, 120, Yc)] })]);
  beats('A040', [
    Q(null, 'UAE FOOD', '85–90% IMPORTED', null, 'NEARLY 9 OF EVERY 10 BITES', 'Sources: WEF; UAE Ministry of Climate Change & Environment'),
    I('pb_supermarket_vegetables_4730', 'FOOD MARKET', { cutW: 'Nearly' }),
  ]);
  beats('A041', [
    V('cm_jebel_ali_port_3_imresolt', 'JEBEL ALI PORT, DUBAI'),
    I('pb_container_port_23544', 'CONTAINER PORT', { cutW: 'and' }),
  ]);
  beats('A042', [
    I('pb_hydroponic_4255400', 'HYDROPONIC GREENS', { over: [low('BUSTANICA: BILLED AS THE WORLD\'S LARGEST VERTICAL FARM', 'Bustanica')] }),
    I('pb_hydroponic_2139526', 'INDOOR FARM', { cutW: 'It' }),
    Q('around', 'BUSTANICA', '~3,000 KG A DAY', null, '~6,600 LB OF GREENS, MOSTLY FOR AIRLINE MEALS', 'Source: Emirates, 2022'),
    V('pb_dubai_airport_51857', 'DUBAI INTERNATIONAL AIRPORT', { cutW: 'drop' }),
  ]);
  beats('A043', [I('pb_sand_73847', 'SAND', { over: [head('IT IMPORTS SAND', 'sand', 200, 100, Yc)] })]);
  beats('A044', [
    I('pb_sand_grains_7564466', 'DESERT SAND', { kb: { z: [1.1, 1.4] }, over: [low('DESERT GRAINS: ROUND AND SMOOTH', 'round')] }),
    S('stats', { cutW: 'Builders', head: 'CONCRETE NEEDS', items: [], over: [at(head('ROUGH, ANGULAR SAND', null, 520, 100, Yc), 0.2)], source: 'Source: AGBI 2022' }),
  ]);
  beats('A045', [
    V('gov_nasa_iss_2014_palm_jumeirah', 'PALM JUMEIRAH (NASA ISS, 2014)'),
    V('gov_nasa_eo_dubai_growth_20020202', 'DUBAI COAST, FEB 2002 (NASA)', { cutW: 'It', over: [low('2002', 'built')] }),
    V('gov_nasa_eo_dubai_growth_20041106', 'DUBAI COAST, NOV 2004 (NASA)', { cutW: 'enough', over: [low('94 MILLION M³ OF SEABED SAND', 'enough')] }),
    V('gov_nasa_iss_2005_palm_under_construction', 'PALM JUMEIRAH UNDER CONSTRUCTION (NASA ISS, 2005)', { cutW: 'sprayed' }),
  ]);
  beats('A046', [
    V('cm_dubai_1965_airport_first_comet', 'DUBAI AIRPORT, 1965'),
    S('stats', { cutW: 'In', head: 'DUBAI POPULATION', items: [{ v: 59000, from: 59000, label: '1968 CENSUS', at: 0.3 }, { v: 4.58, dec: 2, suf: ' M', label: 'END OF 2025', at: 1.2, color: Yc }], source: 'Sources: Dubai Statistics Center; Digital Dubai, July 2026' }),
    V('gov_nasa_iss_2025_dubai_coast', 'DUBAI FROM THE SPACE STATION (NASA, 2025)', { cutW: 'By' }),
    V('pb_abra_dubai_264535', 'DUBAI MARINA AT NIGHT', { cutW: 'More', over: [low('MORE THAN THE CITY OF LOS ANGELES', 'Los')] }),
  ]);
  beats('A047', [
    V('pb_dubai_metro_203953', 'DUBAI METRO'),
    V('pb_abra_dubai_296958', 'DOWNTOWN DUBAI', { cutW: 'flights' }),
    V('fl_dubai_metro_red_line_seby', 'DUBAI METRO RED LINE', { cutW: 'On' }),
  ]);

  // ===== CH5 =====
  chapter('A048', 5, 'The day the desert flooded');
  beats('A048', [V('gov_nasa_eo_dubai_flood_before_20240403', 'DUBAI, 3 APRIL 2024 (NASA LANDSAT 9)')]);
  beats('A049', [
    V('gov_nasa_eo_dubai_flood_after_20240419', 'DUBAI, 19 APRIL 2024: FLOODWATER IN BLUE (NASA LANDSAT 9)', { kb: { z: [1.15, 1.35] } }),
    S('stats', { cutW: 'What', head: 'DUBAI HAD BUILT MACHINES FOR', items: [], over: [at(head('WATER · COLD · TRADE', null, 470, 96), 0.2), { ...head('NOT FOR DRAINING RAIN', 'drain', 600, 90, Yc) }] }),
  ]);
  beats('A050', [
    V('esa_2024_dubai_floods_sentinel2', 'DUBAI, 17 APRIL 2024 (COPERNICUS SENTINEL-2, ESA)'),
    I('pb_flooded_road_143563', 'FLOODWATER', { cutW: 'So' }),
  ]);
  beats('A050B', [
    I('pb_rain_car_windshield_64158', 'RAIN', { over: [low('FARHEEN, DUBAI RESIDENT', 'Farheen')] }),
    S('stats', { cutW: 'All', head: 'FARHEEN, APRIL 2024', items: [], over: [at(head('"ALL OUR APARTMENTS', null, 470, 90), 0.1), at(head('WERE RUINED."', null, 590, 90, Yc), 0.5)], source: 'Source: Khaleej Times' }),
  ]);
  beats('A051', [
    V('cm_uae_flood_16_april_2024_cars', 'UAE, 16 APRIL 2024', { kb: { z: [1.2, 1.05] } }),
    Q('Insurers', 'APRIL 2024 STORM', '5 DEATHS IN THE UAE', null, 'INSURED LOSSES: ~$3 BILLION', 'Sources: Reuters; Guy Carpenter estimate'),
  ]);
  beats('A052', [
    V('gov_nasa_iss_2022_dubai_city', 'DUBAI FROM THE SPACE STATION (NASA, 2022)', { over: [head('BLAMED ON CLOUD SEEDING?', 'cloud', 200, 80, Yc)] }),
    V('pb_dubai_night_209890', 'CLOUDS OVER DUBAI', { cutW: 'It\'s', in: 3, over: [low('UAE PLANES FIRE SALT FLARES INTO CLOUDS', 'salt')] }),
  ]);
  beats('A053', [
    Q(null, 'UAE WEATHER SERVICE (NCM)', 'NO SEEDING FLIGHTS', 'DURING THE STORM', null, 'Source: NCM via Al Jazeera, 18 Apr 2024'),
    V('cm_cira_2024_storm_oman_uae', 'STORM OVER OMAN AND THE UAE, 16 APRIL 2024 (SATELLITE, CIRA)', { cutW: 'And', over: [low('SEEDING: ~10–15% MORE, ONLY FROM CLOUDS ALREADY THERE', 'percent')] }),
  ]);
  beats('A054', [
    Q(null, 'WORLD WEATHER ATTRIBUTION', '10–40% HEAVIER', null, 'LOW CONFIDENCE: THE DATA WERE THIN', 'Source: WWA, April 2024'),
    V('pb_dubai_skyline_209890', 'STORM CLOUDS OVER DUBAI', { cutW: 'A' }),
  ]);
  beats('A055', [
    I('pb_storm_drain_4916909', 'STORM DRAIN', { over: [low('TASREEF: JUNE 2024', 'Tasreef')] }),
    Q('about', 'TASREEF DRAINAGE PROJECT', '$8.2 BILLION', null, 'DRAINAGE CAPACITY +700% BY 2033', 'Source: Dubai Media Office, 24 June 2024'),
    V('pb_dubai_traffic_303794', 'SHEIKH ZAYED ROAD, DUBAI', { cutW: 'by' }),
  ]);
  beats('A056', [
    S('globe', GL({ lon: [[0, 55.0], [3, 55.0]], lat: [[0, 24.95], [3, 24.95]], R: [[0, 12000], [3, 14000]], pins: [{ ...G.dubai, label: 'DUBAI', at: 0.2, small: true, size: 40 }, { ...G.jebel, label: 'JEBEL ALI', at: 0.5, small: true, size: 40 }, { ...G.hassyan, label: 'HASSYAN: MEMBRANE DESALINATION', at: 1.0 }] })),
    V('gov_nasa_iss_2025_dubai_artificial_islands', 'DUBAI COAST (NASA ISS, 2025)', { cutW: 'Hassyan' }),
    Q('by', 'DEWA TARGET', 'BY 2030', null, 'ALL DESALINATED WATER: CLEAN ENERGY + WASTE HEAT', 'Source: DEWA'),
  ]);
  beats('A057', [
    V('gov_nasa_iss_2025_dubai_islands', 'DUBAI COAST FROM THE SPACE STATION (NASA, 2025)'),
    V('pb_dubai_aerial_108522', 'SHEIKH ZAYED ROAD, DUBAI', { cutW: 'pipes' }),
    I('pb_container_port_23544', 'CONTAINER PORT', { cutW: 'ships' }),
    V('pb_dubai_desert_6826298', 'DESERT NEAR DUBAI', { cutW: 'spends' }),
  ]);
  beats('A058B', [V('pb_dubai_skyline_46950', 'DUBAI', { over: [head('WOULD YOU LIVE HERE?', null, 180, 80)] })]);
  beats('A058', [
    V('cm_dubai_after_heavy_rain_jebel_ali_2024', 'JEBEL ALI, DUBAI, 19 APRIL 2024', { kb: { z: [1.2, 1.05] } }),
    I('pb_tap_water_147075', 'TAP WATER', { cutW: 'Here' }),
    V('gov_nasa_iss_2025_dubai_night_lights', 'DUBAI AT NIGHT FROM THE SPACE STATION (NASA, 2025)', { cutW: 'every' }),
  ]);
  beats('A059', [V('pb_dubai_marina_203951', 'DUBAI MARINA'), V('pb_abra_dubai_264535', 'DUBAI MARINA', { cutW: 'subscribe', in: 1 })]);
  add(T.tl.voiceEnd + 0.4, S('endscreen', {}), 'fade');
  return out;
}
module.exports = { assets, build, defaultTrans: 'cut', splitOver: 4.5, splitTo: 3 };
