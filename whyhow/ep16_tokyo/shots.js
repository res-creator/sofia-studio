// EP16 Tokyo — real Tokyo rail footage (Pixabay, US DoD DVIDS public domain), Wikimedia Commons photos.
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
const Q = (cutW, top, l1, l2, chipT, source) => S('stats', { cutW, head: top, items: [], sfx: 'boom', over: [at(head(l1, null, l2 ? 470 : 520, 88, Yc), 0.3), ...(l2 ? [at(head(l2, null, 590, 88, Yc), 0.6)] : []), ...(chipT ? [{ ...chipC(chipT, null, l2 ? 740 : 700, 44), at: 1.0 }] : [])], source });
const G = { tokyo: { lon: 139.69, lat: 35.69 }, shinjuku: { lon: 139.70, lat: 35.69 }, mnag: { lon: 139.90, lat: 35.84 }, den: { lon: 139.667, lat: 35.597 }, shibuya: { lon: 139.70, lat: 35.658 }, kasu: { lon: 139.751, lat: 35.674 }, kinka: { lon: 141.58, lat: 38.29 }, sendai: { lon: 140.88, lat: 38.26 }, osaka: { lon: 135.50, lat: 34.70 }, tokyost: { lon: 139.767, lat: 35.681 } };
const GL = (o = {}) => ({ relief: true, borders: true, lon: [[0, 135], [3, 139.7]], lat: [[0, 33], [3, 35.7]], R: [[0, 1400], [3, 2600]], ...o });

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
    V('cm_minami_nagareyama_exits_2022', 'MINAMI-NAGAREYAMA STATION', { over: [low('TUESDAY, 14 NOVEMBER 2017 · 9:44 AM', 'Tuesday')] }),
    V('cm_tsukuba_express_tx3000_otakanomori', 'TSUKUBA EXPRESS TRAIN (TX-3000), 2024', { cutW: 'station' }),
    I('px_japan_station_train_departs', 'A TRAIN DEPARTS', { cutW: 'A' }),
  ], { start: 0 });
  beats('A002', [S('stats', { head: '', items: [], sfx: 'boom', over: [at(head('20 SECONDS', null, 500, 200, Yc), 0.05), at(head('EARLY', null, 680, 110), 0.3)] })]);
  beats('A003', [
    V('cm_minami_nagareyama_platforms', 'MINAMI-NAGAREYAMA STATION PLATFORMS', { over: [low('NEXT TRAIN: 4 MINUTES LATER', 'four')] }),
    S('stats', { cutW: 'But', head: 'METROPOLITAN INTERCITY RAILWAY, 14 NOV 2017', items: [], over: [at(head('"WE DEEPLY APOLOGIZE', null, 450, 84), 0.2), { ...head('FOR THE SEVERE INCONVENIENCE…"', 'severe', 570, 72, Yc) }], source: 'Source: company statement, via NPR / Japan Today' }),
    I('px_japan_local_station_train_arrives', 'A TRAIN ARRIVES', { cutW: 'customers' }),
  ]);
  beats('A004', [
    V('cm_tsukuba_express_tx3000_interior', 'TSUKUBA EXPRESS CAR INTERIOR'),
    V('cm_e235_yamanote_shibuya_2026', 'YAMANOTE LINE (E235), SHIBUYA, 2026', { cutW: 'On', over: [low('THE YAMANOTE LINE', 'Yamanote')] }),
    S('stats', { cutW: 'the', head: 'YAMANOTE LINE · OFFICIAL DELAY NOTES', items: [], sfx: 'boom', over: [at(head('~15 OF EVERY 20', null, 470, 130, Yc), 0.2), at(head('WEEKDAYS', null, 610, 80), 0.5), { ...chipC('MOSTLY FOR DELAYS UNDER 10 MINUTES', 'mostly', 740, 44) }], source: 'Source: MLIT, 10 April 2026 (FY2024 data)' }),
  ]);
  beats('A005', [
    V('pxp_packed_train_interior_straps', 'PACKED TOKYO TRAIN'),
    Q('At', 'RUSH HOUR, SOME LINES', '~160% OF CAPACITY', null, null, 'Source: MLIT congestion survey FY2025'),
  ]);
  beats('A006', [
    V('px_shibuya_crossing_aerial_night', 'SHIBUYA, TOKYO', { over: [low('~40 MILLION RAIL TRIPS A DAY', 'forty')] }),
    Q('That\'s', 'GREATER TOKYO RAIL vs NYC SUBWAY', '≈ 10 NEW YORK', 'SUBWAY SYSTEMS', null, 'Sources: MLIT; MTA weekday ridership'),
  ]);
  beats('A007', [
    V('px_shinjuku_skyline_from_park', 'SHINJUKU, TOKYO', { over: [low('GREATER TOKYO: ~37 MILLION PEOPLE', 'metro')] }),
    V('dv_takadanobaba_crossing_crowd', 'TAKADANOBABA, TOKYO', { cutW: 'without' }),
    V('pxp_station_staff_yamanote_motion', 'STATION STAFF, YAMANOTE LINE', { cutW: 'The', over: [head('NOT ONE PERFECT MACHINE', 'isn\'t', 200, 72)] }),
  ]);
  beats('A007B', [
    V('cm_shinjuku_southeast_exit_crowds', 'SHINJUKU STATION', { over: [low('1 · THE BUSIEST STATION', 'busiest')] }),
    V('pxp_packed_platform_shibuya', 'PACKED PLATFORM, SHIBUYA', { cutW: 'then', over: [low('2 · A 200% TRAIN', 'squeeze')] }),
    V('cm_denenchofu_old_station_building_1', 'DEN-EN-CHOFU STATION', { cutW: 'meet', over: [low('3 · THE RAILWAY THAT SELLS HOUSES', 'sells')] }),
    V('px_shinkansen_fuji_bridge_blue_sky', 'SHINKANSEN, FUJI RIVER BRIDGE', { cutW: 'and', over: [low('4 · THE DAY THE GROUND SHOOK', 'ground')] }),
  ]);
  add(T.e('A007B') + 0.15, S('title', { lines: ['HOW TOKYO MOVES', '40 MILLION RIDES A DAY'], hl: 1, img: 'pxp_shibuya_crossing_from_above', credit: '', brand: true, sfx: 'riser' }), 'cut');

  // ===== CH1 =====
  chapter('A008', 1, 'The busiest station on Earth');
  beats('A008', [V('cm_shinjuku_south_exit', 'SHINJUKU STATION, SOUTH EXIT', { over: [low('GUINNESS: BUSIEST STATION IN THE WORLD', 'Guinness')] })]);
  beats('A009', [
    Q(null, 'SHINJUKU STATION, 2022', '2.7 MILLION', 'PEOPLE A DAY', null, 'Source: Guinness World Records'),
    S('stats', { cutW: 'That\'s', head: 'EVERY DAY', items: [{ v: 4.5, dec: 1, suf: '×', label: 'NEW YORK\'S PENN STATION', at: 0.3, color: Yc }, { v: 2.7, dec: 1, suf: ' M', label: '≈ ALL OF CHICAGO', w: 'Chicago' }], source: 'Sources: Guinness; Amtrak / NY Governor; US Census' }),
    V('cm_shinjuku_sunday_crowds', 'SHINJUKU STATION', { cutW: 'Before', over: [low('BEFORE COVID: 3.5 MILLION+', 'three')] }),
  ]);
  beats('A010', [
    V('cm_shinjuku_east_west_passage', 'SHINJUKU STATION EAST-WEST PASSAGE', { over: [low('5 RAIL COMPANIES', 'five')] }),
    V('cm_shinjuku_yamanote_platform', 'YAMANOTE PLATFORM, SHINJUKU', { cutW: 'It\'s' }),
  ]);
  beats('A011', [
    I('pxp_salaryman_subway_platform', 'TOKYO SUBWAY PLATFORM', { over: [low('1955, THE STORY GOES', 'nineteen')] }),
    V('px_keio_train_platform_tokyo', 'KEIO LINE PLATFORM, TOKYO', { cutW: 'Station' }),
    I('px_jr_platform_train_leaving_vertical', 'DOORS CLOSING', { cutW: 'so' }),
  ]);
  beats('A012', [
    S('stats', { head: 'THE PUSHERS', items: [], over: [at(head('OSHIYA', null, 520, 180, Yc), 0.2)] }),
    V('dv_mejiro_ticket_gates_crowd', 'MEJIRO STATION, TOKYO', { cutW: 'Many', over: [low('MANY WERE STUDENTS', 'students')] }),
    Q('At', 'TOKYO RUSH HOUR, 1975', '221% OF CAPACITY', null, 'AVERAGE OF THE MAIN LINES', 'Source: MLIT'),
  ]);
  beats('A013', [
    V('pxp_yamanote_platform_passengers', 'YAMANOTE LINE PLATFORM', { over: [low('~¥1,500 AN HOUR (~$10)', 'fifteen')] }),
    V('dv_e235_yamanote_doors_tokyo', 'YAMANOTE DOORS (E235)', { cutW: 'One', over: [low('"HARUKA", PUSHER SINCE 2021', 'Haruka')] }),
    V('dv_yamanote_platform_clock_boarding', 'YAMANOTE PLATFORM', { cutW: 'She', over: [low('MOSTLY: TUCKING IN COATS AND BAGS', 'tucking')] }),
  ]);

  // ===== CH2 =====
  chapter('A014', 2, 'What 200% feels like');
  beats('A014', [V('pxp_subway_car_commuters_phones', 'TOKYO SUBWAY CAR', { over: [low('THE GOVERNMENT\'S CROWDING GUIDE', 'guide')] })]);
  beats('A015', [
    S('ladder', { title: 'HOW CROWDED IS YOUR TRAIN?', max: 260, min: 80, items: [{ v: 100, label: 'FULL', sub: 'A SEAT, A STRAP OR A POLE', at: 0.5 }, { v: 150, label: 'NEWSPAPER', sub: 'YOU CAN STILL OPEN ONE', w: 'fifty' }, { v: 200, label: 'BODY CONTACT', sub: 'YOU CAN JUST READ A MAGAZINE', w: 'two', hl: true }], source: 'Source: MLIT crowding guide', unit: '%', step: 20, nosnow: true }),
    V('pxp_packed_train_interior_straps', 'PACKED TOKYO TRAIN', { cutW: 'considerable', kb: { z: [1.3, 1.1] } }),
  ]);
  beats('A016', [
    V('cm_tozai_15000_series', 'TOZAI LINE (TOKYO METRO), 15000 SERIES', { over: [low('TOZAI LINE: KIBA → MONZEN-NAKACHO', 'Tozai')] }),
    Q('In', 'TOZAI LINE, FY2019', '199%', null, 'NO. 1 IN JAPAN', 'Source: MLIT'),
  ]);
  beats('A017', [
    V('cm_tozai_15000_interior', 'TOZAI LINE CAR: WIDE DOORS FOR CROWDS', { over: [low('TODAY: ~160%', 'sixty')] }),
    S('stats', { cutW: 'But', head: 'ONE MORNING HOUR, ONE STRETCH', items: [{ v: 64800, label: 'PEOPLE', at: 0.4, color: Yc }, { v: 27, label: 'TRAINS', at: 1.0 }, { v: 2400, pre: '~', label: 'PER TRAIN', w: 'twenty-four' }], source: 'Source: MLIT FY2025' }),
    V('px_shibuya_crossroad_walkers_vertical', 'SHIBUYA, TOKYO', { cutW: 'A' }),
  ]);
  beats('A018', [
    V('cm_women_only_sign_roppongi', 'WOMEN-ONLY CAR SIGN, ROPPONGI STATION (HIBIYA LINE)', { over: [low('1912: FIRST WOMEN-ONLY CARS (FOR SCHOOLGIRLS)', 'nineteen')] }),
    V('pxp_women_only_car_sign', '"WOMEN ONLY" SIGN ON A TRAIN CAR', { cutW: 'The' }),
    V('cm_ladies_only_boarding_point_2010', 'LADIES-ONLY BOARDING POINT, JAPAN, 2010', { cutW: 'by', over: [low('BY 2005: MOST TOKYO LINES', 'five')] }),
  ]);
  beats('A019', [
    V('px_shibuya_crossing_pedestrians_night', 'SHIBUYA, TOKYO'),
    Q('The', 'SMALL DELAYS IN TOKYO, CAUSED BY…', 'PASSENGERS: 64%', null, 'DOORS · DROPPED ITEMS · SICKNESS · SLOW BOARDING', 'Source: MLIT, April 2026'),
    V('px_keihin_tohoku_e233_platform_vertical', 'KEIHIN-TOHOKU LINE PLATFORM', { cutW: 'People' }),
  ]);
  beats('A020', [
    V('dv_yamanote_incar_delay_info_screen', 'YAMANOTE LINE: SERVICE INFORMATION SCREEN', { over: [low('THE "DELAY CERTIFICATE"', 'certificate')] }),
    S('stats', { cutW: 'It\'s', head: 'A DELAY CERTIFICATE IS…', items: [], over: [at(head('NOT A REFUND', null, 460, 110), 0.2), { ...head('AN EXCUSE NOTE', 'excuse', 600, 110, Yc) }] }),
    V('dv_nippori_north_gate_departure_board', 'NIPPORI STATION, NORTH GATE', { cutW: 'And' }),
  ]);
  beats('A021', [S('bars', { title: 'DAYS WITH A DELAY CERTIFICATE', sub: 'out of 20 weekdays (FY2024)', max: 20, items: [{ label: 'SAIKYO LINE (WORST)', v: 19.8, text: '19.8', color: C('red'), at: 0.4 }, { label: 'YAMANOTE LINE', v: 14.9, text: '14.9', color: Yc, at: 1.0 }, { label: 'TOKYU OIMACHI LINE (BEST)', v: 1.3, text: '1.3', color: C('iceL'), w: 'best' }], source: 'Source: MLIT, 10 April 2026' })]);

  // ===== CH3 =====
  chapter('A022', 3, 'The railway that sells houses');
  beats('A022', [
    V('pxp_yamanote_tracks_ikebukuro', 'JR TRACKS INTO IKEBUKURO'),
    V('pxp_tokyu_train_curved_platform', 'TOKYU RAILWAY TRAIN', { cutW: 'and' }),
    S('stats', { cutW: 'And', head: 'MANY PRIVATE RAILWAYS ARE…', items: [], over: [at(head('ALSO PROPERTY COMPANIES', null, 520, 100, Yc), 0.2)] }),
  ]);
  beats('A023', [
    S('globe', GL({ lon: [[0, 139.72], [3, 139.70]], lat: [[0, 35.66], [3, 35.63]], R: [[0, 60000], [3, 90000]], pins: [{ ...G.tokyost, label: 'CENTRAL TOKYO', at: 0.2, small: true, size: 40 }, { ...G.den, label: 'DEN-EN-CHOFU, 1923', at: 1.2 }] })),
    V('cm_denenchofu_old_station_building_2', 'DEN-EN-CHOFU STATION (1920s DESIGN, REBUILT)', { cutW: 'And' }),
  ]);
  beats('A024', [
    V('cm_denenchofu_station_2010', 'DEN-EN-CHOFU', { over: [low('ON SALE: AUGUST 1923', 'August')] }),
    A('cm_kanto_earthquake_1923_destruction', 'TOKYO AFTER THE GREAT KANTO EARTHQUAKE, SEPT 1923', { cutW: 'Then', over: [low('1 SEPTEMBER 1923', 'September')] }),
    A('cm_kanto_earthquake_1923_sumida_fires', 'THE BURNED-OUT SUMIDA AREA, 1923', { cutW: 'much' }),
    V('cm_denenchofu_old_station_building_1', 'DEN-EN-CHOFU: THE SUBURB WAS BARELY DAMAGED', { cutW: 'But' }),
  ]);
  beats('A025', [
    A('cm_goto_keita_portrait', 'GOTO KEITA, FOUNDER OF THE TOKYU GROUP', { over: [low('GOTO KEITA', 'Goto')] }),
    V('cm_shibuya_tokyu_toyoko_dept_2017', 'TOKYU TOYOKO DEPARTMENT STORE, SHIBUYA, 2017', { cutW: 'And', over: [low('THE IDEA CAME FROM HANKYU, OSAKA', 'Hankyu')] }),
    S('stats', { cutW: 'Build', head: 'THE RAILWAY MODEL', items: [], over: [at(head('LINE → LAND → HOUSES', null, 470, 96), 0.2), { ...head('→ DEPARTMENT STORE', 'department', 600, 96, Yc) }] }),
    V('cm_tokyu_shibuya_rush_hour', 'TOKYU SHIBUYA TERMINAL AT RUSH HOUR', { cutW: 'so' }),
  ]);
  beats('A026', [
    S('bars', { title: 'TOKYU: OPERATING PROFIT', sub: 'year to March 2026 (reported)', max: 50, items: [{ label: 'REAL ESTATE', v: 43.6, text: '¥43.6 BN', color: Yc, at: 0.5 }, { label: 'RAILWAYS AND BUSES', v: 27.3, text: '¥27.3 BN', color: C('iceL'), at: 1.2 }], source: 'Source: Tokyu segment data (reported)' }),
    V('cm_shibuya_tokyu_toyoko_dept_night_2017', 'TOKYU TOYOKO, SHIBUYA, AT NIGHT', { cutW: 'The', over: [head('THE PRODUCT: THE HOME NEXT TO THE STATION', 'home', 200, 60)] }),
  ]);
  beats('A027', [
    V('px_tokyo_tower_aerial_sunset', 'TOKYO'),
    V('px_ochanomizu_subway_bridge', 'OCHANOMIZU, TOKYO', { cutW: 'but' }),
  ]);

  // ===== CH4 =====
  chapter('A028', 4, 'The bullet train');
  beats('A028', [V('px_shinkansen_fuji_river_bridge_snow', 'TOKAIDO SHINKANSEN, FUJI RIVER BRIDGE')]);
  beats('A029', [
    A('cm_0_series_bullet_train_1971', '0-SERIES SHINKANSEN, 1971', { over: [low('1 OCTOBER 1964', 'October')] }),
    A('cm_0_series_railway_museum', '0-SERIES SHINKANSEN (RAILWAY MUSEUM)', { cutW: 'Its' }),
    Q('That\'s', 'TOP SPEED, 1964', '130 MPH', null, '210 KM/H', 'Source: JR Central / IEEE Milestone'),
  ]);
  beats('A030', [
    I('pxp_railway_museum_old_trains', 'JAPANESE NATIONAL RAILWAYS TRAINS, MUSEUM', { over: [low('SOGO SHINJI (PRESIDENT) · SHIMA HIDEO (ENGINEER)', 'Sogo')] }),
    S('stats', { cutW: 'resigned', head: 'SOGO AND SHIMA', items: [], over: [at(head('RESIGNED IN 1963', null, 470, 110, Yc), 0.2), { ...chipC('OVER COST OVERRUNS', null, 640, 50), at: 0.8 }], source: 'Sources: NYT obituary 1998; NDL' }),
    A('cm_0_series_last_day', '0-SERIES ON ITS LAST DAY, 2008', { cutW: 'By' }),
  ]);
  beats('A031', [
    V('dv_n700_passing_tokyo_station_tracks', 'N700 SHINKANSEN NEAR TOKYO STATION', { over: [low('383 TRAINS · 460,000 PASSENGERS A DAY', 'three')] }),
    V('px_n700_hamamatsucho_tracks', 'TOKAIDO SHINKANSEN TRACKS, HAMAMATSUCHO', { cutW: 'And' }),
    Q('average', 'TOKAIDO SHINKANSEN · AVERAGE DELAY, 2024', '1.4 MINUTES', null, 'INCLUDING TYPHOONS AND EARTHQUAKES', 'Source: JR Central Integrated Report 2025'),
  ]);
  beats('A032', [
    V('pxp_e7_tokyo_station', 'E7 SHINKANSEN (JR EAST) AT TOKYO STATION', { over: [low('JR EAST, TOKYO STATION', 'JR')] }),
    S('stats', { cutW: 'cleaning', head: 'A 12-MINUTE STOP', items: [], over: [at(head('~7 MINUTES', null, 500, 170, Yc), 0.2), at(head('TO CLEAN THE WHOLE TRAIN', null, 650, 70), 0.6)], source: 'Source: JR East Tessei' }),
    V('pxp_tohoku_shinkansen_tokyo_station', 'JR EAST SHINKANSEN AT TOKYO STATION', { cutW: 'entire' }),
    V('px_e7_shinkansen_underground_platform', 'E7 SHINKANSEN PLATFORM · ' + IL, { cutW: 'Every' }),
  ]);
  beats('A033', [
    V('pxp_e3_tsubasa_tokyo_station', 'E3 "TSUBASA" SHINKANSEN, TOKYO STATION', { over: [low('"THE SEVEN-MINUTE MIRACLE"', 'miracle')] }),
    S('stats', { cutW: 'In', head: '2005', items: [], over: [at(head('TERUO YABE', null, 470, 130, Yc), 0.2), at(head('40 YEARS IN RAIL SAFETY', null, 610, 64), 0.6)], source: 'Source: Harvard Business School case "Trouble at Tessei"' }),
  ]);
  beats('A034', [
    V('pxp_e7_platform_nose', 'E7 SHINKANSEN (JR EAST)', { over: [low('HE TREATED IT LIKE A PERFORMANCE', 'performance')] }),
    S('stats', { cutW: 'Harvard', head: 'HARVARD BUSINESS SCHOOL CASE', items: [], over: [at(head('"TROUBLE AT TESSEI"', null, 520, 110, Yc), 0.2)] }),
  ]);

  // ===== CH5 =====
  chapter('A035', 5, 'When the ground shakes');
  beats('A035', [S('globe', GL({ pins: [{ ...G.tokyo, label: 'TOKYO', at: 0.3 }], labels: [{ lon: 143, lat: 36, text: 'PACIFIC PLATE', at: 1.0, size: 40 }] }))]);
  beats('A036', [
    I('cm_seismograph_museum', 'SEISMOGRAPH ON DISPLAY', { over: [low('YUTAKA NAKAMURA, SEISMOLOGIST', 'Nakamura')] }),
    S('stats', { cutW: 'detects', head: 'UrEDAS', items: [], over: [at(head('FIRST WAVE DETECTED', null, 460, 90), 0.2), { ...head('→ POWER TO TRAINS CUT', 'cuts', 590, 90, Yc) }], source: 'In use on the Tokaido Shinkansen from 1992 (Nakamura, WCEE 2008)' }),
    V('px_shinkansen_viaduct_valley', 'SHINKANSEN ON A VIADUCT', { cutW: 'It' }),
  ]);
  beats('A037', [
    A('cm_shinjuku_station_march_11_2011', 'SHINJUKU STATION, 11 MARCH 2011', { over: [low('11 MARCH 2011 · MAGNITUDE 9', 'March')] }),
    S('globe', GL({ cutW: 'seismometer', lon: [[0, 140.5], [3, 140.8]], lat: [[0, 37.5], [3, 38]], R: [[0, 6000], [3, 9000]], pins: [{ ...G.kinka, label: 'COASTAL SEISMOMETER, KINKASAN', at: 0.3 }, { ...G.sendai, label: 'SENDAI', at: 0.6, small: true, size: 40 }] })),
    A('cm_tohoku_shinkansen_damage_2011', 'TOHOKU SHINKANSEN LINE DAMAGED BY THE EARTHQUAKE, 2011', { cutW: 'power' }),
  ]);
  beats('A038', [
    S('stats', { head: 'TOHOKU SHINKANSEN, 11 MARCH 2011', items: [{ v: 19, label: 'TRAINS WITH PASSENGERS', at: 0.3, color: Yc }, { v: 0, label: 'DERAILED', at: 1.2 }, { v: 0, label: 'HURT ON BOARD', at: 2.0 }], source: 'Sources: Government of Japan; Japan Times' }),
    A('cm_tohoku_shinkansen_repair_2011', 'CREWS REPAIRING THE TOHOKU SHINKANSEN, 2011', { cutW: 'Nobody' }),
  ]);
  beats('A038B', [
    A('cm_stopped_hayate_2011', 'E2 "HAYATE" SHINKANSEN STOPPED, MARCH 2011', { over: [low('ONLY DERAILMENT WITH PASSENGERS: 2004 · NOBODY HURT', 'only')] }),
    A('cm_stopped_max_yamabiko_2011', 'E4 "MAX YAMABIKO" STOPPED, MARCH 2011', { cutW: 'Nobody' }),
  ]);
  beats('A039', [
    V('cm_kasumigaseki_station', 'KASUMIGASEKI STATION (TOKYO METRO)', { over: [low('20 MARCH 1995', 'March')] }),
    S('stats', { cutW: 'members', head: '20 MARCH 1995 · RUSH HOUR', items: [], over: [at(head('SARIN GAS ON 5 TRAINS', null, 520, 100, Yc), 0.2)] }),
  ]);
  beats('A040', [
    V('cm_kasumigaseki_chiyoda_platform_2022', 'CHIYODA LINE PLATFORM, KASUMIGASEKI, 2022', { over: [low('KAZUMASA TAKAHASHI, ASSISTANT STATIONMASTER', 'Takahashi')] }),
    S('stats', { cutW: 'He', head: 'KAZUMASA TAKAHASHI', items: [], over: [at(head('HE DIED', null, 470, 130, Yc), 0.1), { ...chipC('THE ATTACK: 14 DEAD · 6,000+ INJURED', 'total', 650, 50) }], source: 'Sources: Japan Times; AP' }),
    V('cm_kasumigaseki_sakurada_dori_gate', 'KASUMIGASEKI STATION GATE', { cutW: 'In' }),
  ]);
  beats('A041', [
    V('dv_mejiro_ticket_gates_crowd', 'MEJIRO STATION', { over: [low('NO TRASH CANS', 'trash')] }),
    V('pxp_station_signs_platform', 'STATION PLATFORM SIGNS', { cutW: 'The' }),
  ]);

  // ===== CH6 =====
  chapter('A042', 6, 'The next problem');
  beats('A042', [V('cm_e235_resumed_operation', 'YAMANOTE TRAIN BACK IN SERVICE AFTER A SUSPENSION')]);
  beats('A043', [
    S('stats', { head: '16 JANUARY 2026', items: [], sfx: 'boom', over: [at(head('YAMANOTE LINE STOPPED', null, 470, 100, Yc), 0.2), { ...head('~8 HOURS', 'eight', 600, 120) }] }),
    V('cm_e235_two_trains_ikebukuro', 'YAMANOTE TRAINS AT IKEBUKURO', { cutW: 'Around', over: [low('~673,000 PEOPLE AFFECTED', 'six')] }),
    V('cm_tokaido_shinkansen_gate_closed_typhoon_2024', 'CLOSED SHINKANSEN GATES, TOKYO STATION, 2024 · ' + IL, { cutW: 'The' }),
  ]);
  beats('A044', [
    V('px_tokyo_sidewalk_commuters', 'TOKYO COMMUTERS', { over: [low('JAPAN\'S POPULATION IS SHRINKING', 'shrinking')] }),
    V('pxp_platform_sunset_woman', 'TOKYO PLATFORM AT SUNSET', { cutW: 'and' }),
  ]);
  beats('A045', [
    Q(null, 'JR EAST, 14 MARCH 2026', 'FIRST FARE RISE', 'SINCE 1987', 'AVERAGE +7.1%', 'Source: JR East / Japan Times'),
    V('cm_e235_entering_shinagawa', 'YAMANOTE LINE (E235), SHINAGAWA', { cutW: 'And', over: [low('PLAN: NO DRIVER BY 2035', 'driver')] }),
  ]);
  beats('A046', [
    S('bars', { title: 'TOKYO RUSH-HOUR CROWDING', sub: 'average of main lines', max: 230, items: [{ label: '1975', v: 221, text: '221%', color: C('red'), at: 0.3 }, { label: '2020 (COVID)', v: 107, text: '107%', color: C('iceL'), at: 1.0 }, { label: '2025', v: 143, text: '143%', color: Yc, at: 1.7 }], source: 'Source: MLIT, July 2026' }),
    V('px_tokyo_station_dusk_people', 'TOKYO STATION', { cutW: 'rush-hour' }),
  ]);
  beats('A049', [V('px_shibuya_crowd_new_buildings', 'SHIBUYA, TOKYO', { over: [head('COULD YOUR SUBWAY SURVIVE THIS?', null, 180, 72)] })]);
  beats('A047', [
    V('dv_e235_yamanote_arrives_uguisudani', 'YAMANOTE LINE, UGUISUDANI'),
    V('px_odakyu_level_crossing', 'ODAKYU LINE LEVEL CROSSING', { cutW: 'With' }),
    V('px_shinkansen_fuji_bridge_blue_sky_b', 'SHINKANSEN, FUJI RIVER BRIDGE', { cutW: 'crews' }),
    V('px_skytree_night_train_passing', 'TOKYO AT NIGHT', { cutW: 'and' }),
  ]);
  beats('A048', [
    V('px_keihin_tohoku_e233_platform_vertical_b', 'KEIHIN-TOHOKU LINE PLATFORM', { over: [low('LINE UP · LET PEOPLE OFF · DON\'T HOLD THE DOORS', 'Line')] }),
    V('px_jr_platform_train_departs_vertical', 'JR PLATFORM', { cutW: 'Don\'t' }),
    V('cm_minami_nagareyama_station_south', 'MINAMI-NAGAREYAMA STATION', { cutW: 'That\'s' }),
    V('px_shibuya_crossing_aerial_night', 'SHIBUYA, TOKYO', { cutW: 'In', in: 3, over: [head('EVERY SECOND BELONGS TO EVERYONE', 'every', 200, 64, Yc)] }),
  ]);
  beats('A050', [V('px_tokyo_station_marunouchi_night', 'TOKYO STATION'), V('px_tokyo_skytree_skyline_evening', 'TOKYO', { cutW: 'Subscribe' })]);
  add(T.tl.voiceEnd + 0.4, S('endscreen', {}), 'fade');
  return out;
}
module.exports = { assets, build, defaultTrans: 'cut', splitOver: 4.5, splitTo: 3 };
