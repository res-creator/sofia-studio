// EP11 Aleutians — real footage: US Navy / Army Signal Corps / NARA films (Internet Archive), USFWS, AEC, Wikimedia Commons, Pixabay; our own maps and diagrams.
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
  const A = (k, o = {}) => F(k, { sfx: 'click', ...o });            // archival photo: projector click
  const sea = (k, o = {}) => F(k, { amb: 'sea', ...o }); const storm = (k, o = {}) => F(k, { amb: 'storm', ...o });
  const Q = (cutW, top, l1, l2, chipT, source) => S('stats', { cutW, head: top, items: [], sfx: 'boom', over: [at(head(l1, null, l2 ? 470 : 520, 92, Yc), 0.3), ...(l2 ? [at(head(l2, null, 590, 92, Yc), 0.6)] : []), ...(chipT ? [{ ...chipC(chipT, null, l2 ? 740 : 700, 48), at: 1.0 }] : [])], source });
  const G = { attu: { lon: 173.2, lat: 52.9 }, adak: { lon: -176.65, lat: 51.88 }, dut: { lon: -166.54, lat: 53.89 }, kiska: { lon: 177.5, lat: 51.98 }, atka: { lon: -174.2, lat: 52.2 },
    anc: { lon: -149.9, lat: 61.2 }, kam: { lon: 158.65, lat: 53.0 }, unimak: { lon: -164.3, lat: 54.7 }, kom: { lon: 166.0, lat: 55.0 }, otaru: { lon: 141.0, lat: 43.19 }, sitkin: { lon: -176.11, lat: 52.08 } };
  const pt = g => [g.lon, g.lat];

  // ===== COLD OPEN =====
  beats('A001', [
    sea('ia_attu_1943_snowy_coast_horizon', { over: [low('JUNE 7, 1942 · ATTU', 'June')] }),
    A('cm_attu_village_1937', { cutW: 'Sunday', kb: { z: [1.0, 1.12], y: [0.75, 0.8] }, over: [note('ATTU VILLAGE, 1937')] }),
    A('cm_attu_russian_orthodox_church_early', { cutW: 'villagers', over: [note('THE CHURCH AT ATTU (EARLY PHOTO)')] }),
  ], { start: 0 });
  beats('A002', [
    A('cm_attu_village_aerial_1942', { over: [note('ATTU VILLAGE UNDER JAPANESE OCCUPATION, 1942')] }),
    sea('ia_attu_1943_fog_boat_in_mist', { cutW: 'About', over: [low('ABOUT HALF NEVER CAME BACK', 'half')] }),
  ]);
  beats('A003', [
    A('cm_attu_coast_guard_station', { over: [low('ATTU TODAY: NOBODY', 'nobody'), note('FORMER COAST GUARD STATION, ATTU')] }),
    A('cm_adak_city', { cutW: 'Adak', over: [note('ADAK')] }),
    F('cm_adak_abandoned_homes', { cutW: 'Last', over: [low('WINTER 2025: A FEW DOZEN PEOPLE', 'dozen')] }),
  ]);
  beats('A004', [storm('gov_tiglax_dark_clouds_island', { over: [head('WHY DO THEY KEEP EMPTYING?', null, 200, 90)] })]);
  beats('A005', [
    F('ia_attu_1943_valley_guns_firing_smoke', { over: [head('THE WAR?', null, 200, 120, Yc)] }),
    A('cm_adak_base_1980s', { cutW: 'Adak', over: [low('ADAK, 1990: 4,633 PEOPLE', 'four'), note('NAVAL AIR STATION ADAK, 1980s')] }),
  ]);
  beats('A006', [
    storm('ia_1942_newsreel_soldiers_wind', { over: [head('THE WEATHER?', null, 200, 120, Yc)] }),
    storm('gov_tiglax_rough_sea_wind', { cutW: 'cloud' }),
    A('cm_kittlitz_unalaska_natives_canoes_1827', { cutW: 'But', over: [low('PEOPLE HERE FOR ~9,000 YEARS', 'thousand'), note('UNANGAN KAYAKS OFF UNALASKA, 1827 (KITTLITZ)')] }),
  ]);
  beats('A007', [
    F('cm_adak_alaska_airlines', { cutW: 'first', over: [low('1 · GETTING THERE', 'first')] }),
    sea('ia_attu_1943_fog_landing_craft_emerge', { cutW: 'back', over: [low('2 · 1942', 'nineteen')] }),
    F('cm_adak_ruined_homes', { cutW: 'visit', over: [low('3 · THE NAVY TOWN', 'Navy')] }),
    storm('gov_tiglax_ship_backlit_storm_sky', { cutW: 'end', over: [low('4 · WHAT REALLY EMPTIES THEM', 'really')] }),
  ]);
  add(T.e('A007') + 0.15, S('title', { lines: ['THE AMERICAN ISLANDS', 'JAPAN INVADED', 'ARE STILL EMPTY'], hl: 2, img: 'cm_attu_jarmin_pass_panorama', credit: credit('cm_attu_jarmin_pass_panorama'), brand: true, sfx: 'riser' }), 'cut');

  // ===== CH1 (no card) =====
  beats('A008', [S('globe', { relief: true, borders: false, lon: [[0, -150], [3.5, -176]], lat: [[0, 42], [3.5, 54]], R: [[0, 430], [3.5, 2600]],
    routes: [{ pts: [pt(G.unimak), pt(G.dut), pt(G.atka), pt(G.adak), pt(G.kiska), pt(G.attu)], at: 3.8, dur: 2.4, dash: false, w: 7, label: 'OVER 1,000 MILES', ly: 60 }],
    pins: [{ ...G.attu, label: 'ATTU', at: 6.2, small: true, size: 36 }, { ...G.dut, label: 'DUTCH HARBOR', at: 4.2, small: true, size: 36 }],
    labels: [{ lon: -170, lat: 47.5, text: '≈ NEW YORK → MIAMI', at: 7.5, size: 40, color: C('yellow') }, { lon: -168, lat: 58.5, text: 'BERING SEA', at: 3.6, mono: true }, { lon: 178, lat: 47.5, text: 'PACIFIC OCEAN', at: 3.6, mono: true }] })]);
  beats('A009', [
    F('gov_tiglax_volcano_steaming', { over: [note('A STEAMING ALEUTIAN VOLCANO (USFWS)')] }),
    S('globe', { cutW: 'Great', relief: true, borders: false, lon: [[0, -176.4], [4, -176.4]], lat: [[0, 52.0], [4, 52.0]], R: [[0, 9000], [4, 12000]],
      pins: [{ ...G.sitkin, label: 'GREAT SITKIN', sub: 'LAVA IN THE CRATER SINCE 2021', color: C('red'), at: 0.3 }, { ...G.adak, label: 'ADAK', small: true, size: 34, at: 0.8, lx: -150, ly: 40 }], waves: [{ ...G.sitkin, at: 0.4, n: 3, speed: 200, max: 500, color: C('red') }] }),
  ]);
  beats('A011', [S('globe', { relief: true, borders: false, lon: [[0, -176], [3, -178]], lat: [[0, 53], [3, 54]], R: [[0, 2600], [3, 1500]],
    pins: [{ ...G.attu, label: 'ATTU', at: 0.3 }, { ...G.anc, label: 'ANCHORAGE', at: 1.2, small: true, size: 36 }, { ...G.kam, label: 'KAMCHATKA', at: 6.5, small: true, size: 36, align: 'right', lx: -26 }],
    routes: [{ pts: [pt(G.attu), pt(G.anc)], at: 1.4, dur: 1.8, label: '1,500 MI ≈ LONDON → MOSCOW', size: 34, ly: -40 }, { pts: [pt(G.attu), pt(G.kam)], at: 6.8, dur: 1.2, color: C('red'), label: '< 550 MI', size: 36, ly: 50 }] })]);
  beats('A012', [
    F('cm_adak_alaska_airlines', { kb: { z: [1.25, 1.1] }, over: [low('ADAK: 2 FLIGHTS A WEEK', 'two')] }),
    F('cm_adak_short_final_runway', { cutW: 'Anchorage' }),
    sea('cm_unalaska_harbor', { cutW: 'ferry', over: [low('FERRY: ~ONCE A MONTH, SUMMER ONLY', 'month')] }),
    F('cm_shemya_aerial_color', { cutW: 'West', over: [low('WEST OF ADAK: NO SCHEDULED SERVICE', 'scheduled'), note('SHEMYA ISLAND')] }),
  ]);
  beats('A013', [
    storm('ia_amchitka_1944_windsock_gale', { over: [low('AMCHITKA: WIND 22–30 MPH ON AVERAGE', 'twenty-two'), note('AMCHITKA, 1944 (U.S. ARMY FILM)')] }),
    storm('ia_amchitka_aec_1970_blizzard_surf', { cutW: 'calm', over: [cnt('calm', 1, { pre: '<', suf: '%', label: 'OF THE TIME IT IS CALM (DOE)', y: 520 })] }),
    storm('ia_report_1943_windsock_tent_wind', { cutW: "Adak's" }),
    A('cm_adak_1943_pby_gale', { cutW: 'until', over: [note('A PLANE HELD DOWN IN A GALE, ADAK, 1943')] }),
  ]);
  beats('A014', [
    storm('ia_attu_1943_seabees_canvas_wind', { over: [head('WILLIWAW', null, 200, 130, Yc)] }),
    F('cm_aleutian_wave_clouds_2016', { cutW: 'sudden', over: [note('WIND OFF THE ISLANDS SEEN FROM SPACE, 2016')] }),
  ]);
  beats('A014B', [
    sea('gov_tiglax_sea_stacks_glitter'),
    A('cm_waxell_aleuts_shumagin_1741', { cutW: 'It', over: [low('IT CAME BY SHIP', 'ship'), note('ALEUTS MEET THE BERING EXPEDITION, 1741 (SVEN WAXELL)')] }),
  ]);

  // ===== CH2 =====
  chapter('A015', 1, 'Nine thousand years without help');
  beats('A015', [
    sea('gov_tiglax_aerial_green_valley_snow'),
    sea('gov_tiglax_green_cliffs_sea_stacks', { cutW: 'oldest', over: [low('OLDEST SITE: ~9,000 YEARS', 'nine')] }),
  ]);
  beats('A016', [
    A('cm_unalaska_aleuts_two_hatch_bidarkas', { over: [note('UNANGAN HUNTERS IN KAYAKS, UNALASKA, c.1900')] }),
    A('cm_sea_otter_hunters_kayaks', { cutW: 'hunted' }),
    A('cm_choris_aleut', { cutW: 'kayaks', over: [note('UNANGAN MAN, 1822 (LOUIS CHORIS)')] }),
    A('cm_unalaska_winter_dwelling_interior', { cutW: 'houses', over: [low('ULAX: A HOUSE HALF UNDERGROUND', 'halfway'), note('ENGRAVING, COOK VOYAGE, 1778')] }),
  ]);
  beats('A017', [
    A('cm_tikhanov_aleut_festival_dress', { over: [low('15,000–18,000 PEOPLE (NPS ESTIMATE)', 'fifteen'), note('ALEUT IN FESTIVAL DRESS, 1818 (TIKHANOV)')] }),
    sea('gov_tiglax_auklet_millions_sea', { cutW: 'They' }),
  ]);
  beats('A018', [
    A('cm_choris_unalaska', { over: [low('1745: RUSSIAN FUR HUNTERS', 'seventeen'), note('UNALASKA, 1817 (LOUIS CHORIS)')] }),
    A('cm_map_near_islands', { cutW: 'Within' }),
    sea('ia_attu_1943_massacre_bay_curving_shore', { cutW: 'bay', over: [low('MASSACRE BAY, ATTU', 'Massacre'), note('MASSACRE BAY ON 1943 NAVY FILM')] }),
  ]);
  beats('A019', [
    sea('px_v_sea_otters_alaska', { over: [note('SEA OTTERS (ILLUSTRATIVE, ALASKA)')] }),
    A('cm_sea_otter_skins_1892', { cutW: 'forced', over: [note('SEA OTTER SKINS, 1892')] }),
    A('cm_tikhanov_baranov_1818', { cutW: 'Violence', over: [note('ALEXANDER BARANOV, RUSSIAN-AMERICAN COMPANY (1818)')] }),
    A('cm_unalaska_old_russian_graveyard', { cutW: 'By', over: [cnt('eighty', 80, { pre: '~', suf: '%', label: 'OF THE UNANGAN LOST (NPS)', y: 520 })] }),
  ]);
  beats('A020', [
    A('cm_unalaska_two_aleuts_kayak_fort', { over: [note('A RUSSIAN POST AT UNALASKA (EARLY ILLUSTRATION)')] }),
    A('cm_russian_america_settlements_map', { cutW: 'eighteen' }),
    storm('px_v_storm_ocean_rain_wind', { cutW: 'No', over: [head('NO SHIP FOR FIVE YEARS', 'five', 200, 100, Yc), note('ILLUSTRATIVE')] }),
  ]);
  beats('A020B', [A('cm_attu_russian_orthodox_church_early', { kb: { z: [1.3, 1.1] }, over: [low('1831: 120 PEOPLE ON ATTU', 'hundred')] })]);
  beats('A021', [
    A('cm_unalaska_town_1906', { over: [low('1867: ALASKA SOLD TO THE U.S.', 'eighteen'), note('UNALASKA, 1906')] }),
    sea('ia_attu_1943_snowy_ridges_lake', { cutW: 'Within', over: [low('ATTU: 220 → 107 IN ~10 YEARS', 'halved')] }),
  ]);
  beats('A022', [
    A('cm_attu_village_aerial_1942', { kb: { z: [1.3, 1.1] }, over: [low('1942: 45 UNANGAN ON ATTU', 'forty-five')] }),
    F('ia_report_1943_map_dutch_harbor_midway', { cutW: 'That', over: [note('U.S. ARMY FILM, 1943')] }),
  ]);

  // ===== CH3 =====
  chapter('A023', 2, 'The village that never came home');
  beats('A023', [
    A('cm_dutch_harbor_1942_burning_oil_tanks', { over: [low('DUTCH HARBOR, JUNE 3–4, 1942', 'Dutch')] }),
    A('cm_dutch_harbor_1942_northwestern_burning', { cutW: 'Harbor' }),
    A('cm_attu_1942_japanese_rufes_holtz_bay', { cutW: 'Days', over: [note('JAPANESE FLOATPLANES AT ATTU, 1942')] }),
  ]);
  beats('A024', [
    F('ia_report_1943_sunset_mountains_fog', { over: [note('ALEUTIANS, 1943 (U.S. ARMY FILM)')] }),
    sea('gov_tiglax_bird_clouds_cliff', { cutW: 'He' }),
    Q('body', 'CHARLES FOSTER JONES, ATTU', '1948: SHOT', 'THROUGH THE HEAD', 'JAPAN HAD CALLED IT SUICIDE', 'Source: NPS, "Attu Boy" (2012)'),
  ]);
  beats('A025', [
    storm('ia_attu_1943_bow_plunges_waves', { over: [low('SEPT 1942: SHIPPED TO JAPAN', 'September')] }),
    S('globe', { cutW: 'Otaru', relief: true, borders: false, lon: [[0, 165], [3, 158]], lat: [[0, 50], [3, 48]], R: [[0, 1500], [3, 1250]],
      pins: [{ ...G.attu, label: 'ATTU', at: 0.2 }, { ...G.otaru, label: 'OTARU, JAPAN', at: 1.6, color: C('red') }], routes: [{ pts: [pt(G.attu), pt(G.kiska), pt(G.otaru)], at: 0.4, dur: 1.4 }] }),
  ]);
  beats('A026', [
    Q(null, 'OLEAN GOLODOFF, IN JAPAN', '"I FED THEM', 'TO MY CHILDREN"', 'ORANGE PEELS', 'Quoted by AP (2023); NPS, "Attu Boy"'),
    storm('gov_tiglax_dark_clouds_island', { cutW: 'She', in: 4 }),
    sea('ia_report_1943_snowy_peaks_sea', { cutW: 'About', over: [low('ABOUT HALF OF THE ATTUANS DIED IN JAPAN', 'half')] }),
  ]);
  beats('A027', [
    A('cm_aleut_evacuation_1942', { over: [note('UNANGAN EVACUATION, 1942')] }),
    F('ia_dutch_harbor_1943_crowd_dock_mountains', { cutW: 'Eight', over: [cnt('eighty-one', 881, { label: 'UNANGAN REMOVED · 9 VILLAGES', y: 520 }), note('DUTCH HARBOR, 1943')] }),
    sea('ia_report_1943_harbor_ships_flag', { cutW: 'On', over: [low('ST. PAUL: A FEW HOURS · ONE SUITCASE', 'suitcase')] }),
  ]);
  beats('A027B', [Q('Greg', 'GREG FRATIS, ST. PAUL, AGE 2', '"ONE SUITCASE.', 'THE BOAT IS HERE."', 'AT 77: "LET\'S NOT LET IT HAPPEN AGAIN."', 'Source: USFWS (2017)')]);
  beats('A028', [A('cm_atka_reindeer_ww2_plane', { over: [low('JUNE 1942: ATKA BURNED BY U.S. FORCES', 'fire'), note('ATKA ISLAND TODAY')] })]);
  beats('A029', [
    A('cm_funter_bay', { over: [low('FUNTER BAY: AN OLD CANNERY', 'cannery'), note('FUNTER BAY TODAY')] }),
    A('cm_killisnoo_evacuation_camp_1942', { cutW: 'herring', over: [note('KILLISNOO CAMP, 1942')] }),
    A('cm_ward_lake_camp_meal', { cutW: 'rotten', over: [note('WARD LAKE CAMP, 1942–45')] }),
    A('cm_funter_bay_aleut_womens_petition_1943', { cutW: 'At', over: [low('AT LEAST 74 DIED IN THE CAMPS', 'seventy-four'), note('PETITION BY UNANGAN WOMEN, FUNTER BAY, 1943')] }),
  ]);
  beats('A034', [
    sea('ia_report_1943_ship_dusk_mountains'),
    F('ia_kiska_1943_color_battleship_firing', { cutW: 'And', sfx: 'boom' }),
  ]);

  // ===== CH4 =====
  chapter('A035', 3, 'The battle for an empty island');
  beats('A035', [
    S('globe', { relief: true, borders: false, lon: [[0, 172], [3, 170]], lat: [[0, 53], [3, 53.5]], R: [[0, 1800], [3, 3000]],
      pins: [{ ...G.kom, label: 'KOMANDORSKI ISLANDS', sub: 'MARCH 26, 1943', at: 0.5, color: C('red'), align: 'right', lx: -26 }, { ...G.attu, label: 'ATTU', at: 1.0, small: true, size: 34 }, { ...G.kiska, label: 'KISKA', at: 1.2, small: true, size: 34 }],
      waves: [{ ...G.kom, at: 0.6, n: 4, speed: 220, max: 600, color: C('red') }],
      routes: [{ pts: [[158, 50.5], [163, 53.3], [165.5, 54.6]], at: 1.0, dur: 1.4, color: C('red'), label: 'SUPPLY CONVOY TURNED BACK', size: 30, ly: 50 }] }),
    F('ia_kiska_1943_color_battleships_bay', { cutW: 'After', over: [low('NO MORE JAPANESE SUPPLY SHIPS', 'never')] }),
  ]);
  beats('A036', [
    sea('ia_attu_1943_fog_megaphone_silhouette', { over: [low('ATTU, MAY 11, 1943', 'fifteen')] }),
    sea('ia_attu_1943_fog_landing_craft_emerge', { in: 3, cutW: 'landed' }),
    F('ia_attu_1943_troops_climb_snow_slope', { cutW: 'fight' }),
    A('cm_attu_peace_memorial_engineer_hill', { cutW: 'Of', over: [low('~2,500 JAPANESE · 29 SURVIVED', 'twenty-nine'), note('ENGINEER HILL, ATTU')] }),
    F('ia_attu_1943_bw_column_below_peaks', { cutW: 'About', over: [low('~550 U.S. DEAD · 1,200 HURT BY THE COLD', 'cold')] }),
  ]);
  beats('A036B', [
    A('cm_attu_japanese_memorial', { over: [note('JAPANESE MEMORIAL, ATTU')] }),
    A('cm_attu_valley_from_engineer_hill', { cutW: 'Fog', over: [low('DIGGING SEASON: JULY–AUGUST', 'July')] }),
  ]);
  beats('A037', [
    sea('ia_kiska_1943_color_landing_craft_rough_sea', { over: [low('KISKA, AUG 15, 1943 · 34,000+ TROOPS', 'thirty-four')] }),
    F('ia_kiska_1943_color_troops_climb_green_cliff', { cutW: 'stormed' }),
  ]);
  beats('A038', [
    F('ia_kiska_1943_color_men_on_cliffs_sea', { over: [head('IT WAS EMPTY', null, 200, 120, Yc)] }),
    A('cm_kiska_japanese_camp', { cutW: 'Cut', over: [note('RUINS OF THE JAPANESE CAMP, KISKA')] }),
  ]);
  beats('A039', [
    sea('ia_kiska_1943_color_fog_bank_valley', { over: [low('~300 KILLED OR WOUNDED', 'three')] }),
    F('ia_kiska_1943_bw_troops_ridge_fog', { cutW: 'friendly' }),
    A('cm_kiska_rusted_75mm_gun', { cutW: 'booby' }),
    storm('ia_report_1943_flag_ship_heavy_sea', { cutW: 'mine', over: [low('DESTROYER ABNER READ: 71 KILLED', 'Abner'), note('A U.S. WARSHIP IN THE ALEUTIANS, 1943')] }),
  ]);
  beats('A030', [
    A('cm_unalaska_holy_ascension_historic', { over: [low('HOMES AND CHURCHES LOOTED', 'looted'), note('UNALASKA (HISTORIC PHOTO)')] }),
    A('cm_morzhovoi_1897', { cutW: 'Many' }),
  ]);
  beats('A031', [
    A('cm_kashega_village_1938', { over: [note('KASHEGA, 1938')] }),
    A('cm_biorka_village', { cutW: 'Kashega', over: [note('BIORKA')] }),
    A('cm_attu_lost_village_sign', { cutW: 'The', over: [low('"TOO COSTLY TO TRAVEL TO"', 'costly')] }),
  ]);
  beats('A032', [
    A('cm_atka_st_nicholas_chapel', { over: [note('ATKA')] }),
    sea('gov_tiglax_snowy_volcano_bay', { cutW: 'Nick' }),
    A('cm_nikolski_rainbow_habs', { cutW: 'In', over: [low('1988: $12,000 PER SURVIVOR', 'twelve'), note('NIKOLSKI')] }),
  ]);

  // ===== CH5 =====
  chapter('A040', 4, 'The town that turned off the lights');
  beats('A040', [
    A('cm_adak_1989_uss_cape_cod', { over: [note('ADAK, 1989')] }),
    A('cm_adak_base_1980s', { cutW: 'Adak', kb: { z: [1.3, 1.1] } }),
  ]);
  beats('A041', [
    A('cm_adak_1986_navy_helicopter', { over: [low('PEAK: NEARLY 6,000 PEOPLE', 'six'), note('NAVAL AIR STATION ADAK, 1986')] }),
    F('cm_adak_residences', { cutW: 'It', over: [low("McDONALD'S · PIZZA HUT · CINEMA · SKI AREA", 'ski')] }),
  ]);
  beats('A042', [
    F('cm_adak_tundra', { over: [note('ADAK: NO NATIVE TREES')] }),
    F('cm_adak_national_forest_sign', { cutW: 'Someone', kb: { z: [1.05, 1.35], x: [0.5, 0.5] }, over: [note('THE "ADAK NATIONAL FOREST" TODAY')] }),
  ]);
  beats('A043', [F('cm_adak_abandoned_military_facilities', { over: [low('1997: THE BASE CLOSES', 'nineteen')] })]);
  beats('A044', [
    F('cm_adak_abandoned_homes', { kb: { z: [1.3, 1.1] }, over: [low('2000: 316 · 2020: ~170', 'twenty')] }),
    F('cm_adak_ruined_homes', { cutW: 'ninety-six', over: [cnt('ninety-six', 96, { pre: '−', suf: '%', label: 'PEOPLE SINCE 1990', y: 520 })] }),
    S('stats', { cutW: 'If', head: 'IF NEW YORK SHRANK THE SAME WAY', items: [], over: [at(head('8.3 MILLION → 300,000', null, 540, 110, Yc), 0.4)], source: 'Our calculation from US Census figures' }),
  ]);
  beats('A045', [
    F('cm_adak_army_naval_base_aerial'),
    F('cm_adak_abandoned_playground', { cutW: 'In', over: [low('SCHOOL: 5 STUDENTS (2022–23)', 'five')] }),
  ]);
  beats('A046', [
    sea('cm_adak_wreck_heritage', { over: [note('WRECK OF A FISHING BOAT, ADAK')] }),
    sea('px_alaska_trawler_bay', { cutW: 'depended', over: [note('ILLUSTRATIVE')] }),
    F('cm_adak_shipwreck_harbor', { cutW: 'In', over: [low('2019: COD QUOTA STRUCK DOWN · 2020: PLANT CLOSED', 'closed')] }),
  ]);
  beats('A047', [
    F('cm_adak_power_line', { over: [low('OCTOBER 2025: THE POWER FAILS', 'October')] }),
    storm('px_v_dark_storm_ocean', { cutW: 'The', over: [low('THE NEW GENERATOR: ON A BARGE', 'barge'), note('ILLUSTRATIVE')] }),
    F('cm_adak_quonset_hut', { cutW: 'To' }),
    F('cm_adak_abandoned_church', { cutW: 'For', over: [cnt('seventeen', 17, { suf: ' DAYS', label: 'WITHOUT POWER FOR PARTS OF TOWN', y: 520 })] }),
  ]);
  beats('A048', [Q(null, 'STEVEN CARROLL, ADAK, OCT 2025', '"I DON\'T KNOW HOW LONG', 'WE CAN GET BY."', 'HE COOKED FOR THREE FAMILIES', 'Quoted by Alaska Public Media (2025)')]);
  beats('A049', [
    A('cm_attu_coast_guard_station', { kb: { z: [1.3, 1.1] }, over: [low('2010: THE LAST 21 LEAVE ATTU', 'twenty-one')] }),
    sea('gov_tiglax_snowy_island_sea', { cutW: 'Even', over: [low('THE PLANE WAS LATE: FOG', 'fog'), note('WESTERN ALEUTIANS (USFWS)')] }),
  ]);

  // ===== CH6 =====
  chapter('A050', 5, 'What really empties the islands');
  beats('A050', [storm('px_v_cliffs_sea_waves_faroe', { over: [note('ILLUSTRATIVE')] })]);
  beats('A051', [A('cm_unalaska_aleuts_two_hatch_bidarkas', { kb: { z: [1.3, 1.1] } })]);
  const NODES = [{ id: 'anc', name: 'ANCHORAGE', x: 1760, y: 300, src: true }, { id: 'dut', name: 'DUTCH HARBOR', x: 1380, y: 520 }, { id: 'atk', name: 'LOST VILLAGES', x: 1060, y: 630 }, { id: 'adk', name: 'ADAK', x: 820, y: 670 }, { id: 'ksk', name: 'KISKA', x: 520, y: 660 }, { id: 'att', name: 'ATTU', x: 200, y: 600 }];
  const t52 = T.P['A052'].start, t53 = T.P['A053'].start, t55 = T.P['A055'].start;
  beats('A052', [S('supplyline', { nodes: NODES, dur: T.P['A052'].dur, events: [{ at: T.at('A052', 'fur') - t52, year: '1745', label: 'FUR SHIPS' }, { at: T.at('A052', 'government') - t52, year: '1867', label: 'GOVERNMENT SERVICES' }, { at: T.at('A052', 'military') - t52, year: '1942', label: 'MILITARY MONEY' }, { at: T.at('A052', 'quota') - t52, year: '2000s', label: 'A FISH QUOTA' }, { at: T.at('A052', 'barge') - t52, year: '2025', label: 'A BARGE WITH A GENERATOR' }] })]);
  beats('A053', [S('supplyline', { nodes: NODES, events: [{ at: T.at('A053', 'Attu') - t53, year: '1867+', label: 'ATTU: SERVICES SHRINK', cut: 'att' }, { at: T.at('A053', 'lost') - t53, year: '1945', label: 'FOUR VILLAGES NEVER RESETTLED', cut: 'atk' }, { at: T.at('A053', 'Kiska') - t53, year: '1943', label: 'JAPAN CUT OFF ON KISKA', cut: 'ksk' }, { at: T.at('A053', 'Adak') - t53, year: '1997', label: 'THE NAVY LEAVES ADAK', cut: 'adk' }] })]);
  beats('A054', [
    A('cm_unalaska_2021_a', { over: [low('#1 U.S. FISHING PORT BY VOLUME, 26 YEARS', 'twenty-six'), note('DUTCH HARBOR / UNALASKA, 2021')] }),
    A('cm_dutch_harbor_offloading_crab', { cutW: 'But' }),
    A('cm_dutch_harbor_processing_plants', { cutW: 'four', over: [low('~4 IN 5 PLANT WORKERS FROM OUTSIDE ALASKA', 'outside')] }),
  ]);
  beats('A055', [
    S('supplyline', { nodes: NODES, title: 'THE LINE COMES BACK', events: [{ at: 0.01, year: '', label: '', cut: 'att' }, { at: 0.01, year: '', label: '', cut: 'ksk' }, { at: 0.01, year: '', label: '', cut: 'atk' }, { at: 0.02, year: '1997', label: 'ADAK CUT OFF', cut: 'adk' }, { at: T.at('A055', 'April') - t55, year: 'APRIL 2026', label: 'UP TO $115M: POWER, RUNWAY, PORT, FUEL', rebuild: 'adk' }] }),
    F('cm_adak_short_final_runway', { cutW: 'power', kb: { z: [1.05, 1.3] } }),
  ]);
  beats('A056', [
    A('cm_shemya_cobra_dane_radar', { over: [low('SHEMYA, OCT 2026: FIGHTER JETS ON ALERT', 'fighter'), note('COBRA DANE RADAR, SHEMYA')] }),
    A('cm_unalaska_2025_destroyer', { cutW: 'Chinese', over: [note('U.S. NAVY DESTROYER AT UNALASKA, 2025')] }),
  ]);
  beats('A057', [F('cm_adak_sweeper_cove_moffett', { over: [note('ADAK')] })]);

  // ===== ENDING =====
  beats('A058A', [F('cm_adak_city', { kb: { z: [1.05, 1.25] }, over: [head('WOULD YOU LIVE HERE FOR A YEAR?', null, 200, 80)] })]);
  beats('A058', [
    A('cm_attu_village_1937', { kb: { z: [1.0, 1.2] }, over: [note('ATTU, 1937')] }),
    sea('ia_attu_1943_snowy_coast_horizon', { cutW: 'Today', in: 6 }),
    sea('gov_tiglax_ship_sea_stacks', { cutW: 'some', over: [note('THE REFUGE SHIP TIGLAX (USFWS)')] }),
    sea('gov_tiglax_aerial_twin_volcanoes_coast', { cutW: 'About', over: [low('~300 ATTUAN DESCENDANTS IN THE U.S.', 'three')] }),
  ]);
  add(T.tl.voiceEnd + 0.4, S('endscreen', {}), 'fade');
  return out;
}
module.exports = { assets, build, defaultTrans: 'cut', splitOver: 4.5, splitTo: 3 };
