// EP14 Singapore — real Singapore footage (Pixabay, Wikimedia Commons), NASA ISS/Terra/Aqua imagery, 1960s Commons archive photos.
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
const G = { sg: { lon: 103.82, lat: 1.35 }, kl: { lon: 101.69, lat: 3.14 }, johor: { lon: 103.76, lat: 1.49 }, changi: { lon: 103.99, lat: 1.36 }, tekong: { lon: 104.05, lat: 1.41 }, jurong: { lon: 103.70, lat: 1.27 }, marina: { lon: 103.86, lat: 1.28 }, tuas: { lon: 103.62, lat: 1.27 }, eastcoast: { lon: 103.93, lat: 1.30 }, jkt: { lon: 106.85, lat: -6.2 }, riau: { lon: 104.2, lat: 0.9 }, pp: { lon: 104.9, lat: 11.55 } };
const GL = (o = {}) => ({ relief: true, borders: true, lon: [[0, 100], [3, 103.8]], lat: [[0, 5], [3, 1.4]], R: [[0, 1400], [3, 2800]], ...o });

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
    A('cm_lee_kuan_yew_1969_conference_1', 'LEE KUAN YEW (PHOTO: 1969)', { over: [low('MONDAY, 9 AUGUST 1965 · NOON', 'Monday')] }),
    A('cm_singapore_river_1960s_01', 'THE SINGAPORE RIVER, EARLY 1960s', { cutW: 'In' }),
    A('cm_lee_kuan_yew_holt_1965', 'LEE KUAN YEW WITH AUSTRALIAN PM HAROLD HOLT, 1965', { cutW: 'And', kb: { z: [1.1, 1.3] } }),
  ], { start: 0 });
  beats('A002', [
    S('stats', { head: 'LEE KUAN YEW, PRESS CONFERENCE, 9 AUG 1965', items: [], over: [at(head('"FOR ME, IT IS', null, 450, 96), 0.1), at(head('A MOMENT OF ANGUISH"', null, 570, 96, Yc), 0.5)], source: 'Source: National Archives of Singapore transcript' }),
    S('stats', { cutW: 'The', head: 'TRANSCRIPT', items: [], over: [at(head('(RECORDING WAS STOPPED…)', null, 520, 84, Yc), 0.2)], source: 'Source: National Archives of Singapore' }),
  ]);
  beats('A003', [
    S('globe', GL({ pins: [{ ...G.kl, label: 'MALAYSIA', at: 0.3, small: true, size: 40 }, { ...G.sg, label: 'SINGAPORE', w: 'country' }] })),
    A('cm_chinatown_1965_05', 'CHINATOWN, SINGAPORE, 1965', { cutW: 'No', over: [low('ALMOST NO ARMY · NO RESOURCES · BARELY ANY LAND', 'army')] }),
  ]);
  beats('A004', [
    A('cm_water_reservoir_1890', 'WATER RESERVOIR, SINGAPORE, c. 1890', { over: [head('"OUR WATER SUPPLY COMES FROM JOHORE."', 'Our', 200, 64, Yc)] }),
    S('globe', GL({ cutW: 'The', lon: [[0, 103.85], [3, 103.85]], lat: [[0, 1.45], [3, 1.45]], R: [[0, 30000], [3, 40000]], pins: [{ ...G.sg, label: 'SINGAPORE', at: 0.2 }, { ...G.johor, label: 'JOHOR (MALAYSIA): THE WATER', at: 0.8 }] })),
  ]);
  beats('A005', [
    V('px_marina_bay_sands_flyer_dusk', 'MARINA BAY, SINGAPORE'),
    V('gov_iss_singapore_johor_2025', 'SINGAPORE FROM THE SPACE STATION (NASA, 2025)', { cutW: 'Since', over: [low('+28% LAND SINCE 1965', 'quarter')] }),
    V('px_skyline_lake_timelapse', 'SINGAPORE SKYLINE', { cutW: 'It' }),
  ]);
  beats('A006', [
    V('px_dredger_rainbowing_sand', 'DREDGER SPRAYING SAND · ' + IL),
    V('px_sand_quarry_aerial', 'SAND PIT · ' + IL, { cutW: 'Why' }),
    V('px_tetrapod_sea_wall', 'SEA WALL · ' + IL, { cutW: 'And' }),
  ]);
  beats('A006B', [
    V('px_hdb_window_sunrise', 'SINGAPORE HOUSING ESTATE', { over: [head('JUST BUILD UP?', null, 180, 90)] }),
    S('stats', { cutW: 'New', head: 'PEOPLE PER SQUARE MILE', items: [{ v: 29300, pre: '~', label: 'NEW YORK CITY', at: 0.4, color: Yc }, { v: 21500, pre: '~', label: 'SINGAPORE', at: 1.2 }], source: 'Sources: US Census; SingStat 2025' }),
    V('px_cbd_skyline_clouds', 'SINGAPORE CBD', { cutW: 'Singapore' }),
  ]);
  add(T.e('A006B') + 0.15, S('title', { lines: ['HOW SINGAPORE', 'MADE ITSELF BIGGER'], hl: 1, img: 'cm_aerial_2024_04', credit: credit('cm_aerial_2024_04'), brand: true, sfx: 'riser' }), 'cut');

  // ===== CH1 =====
  chapter('A007', 1, 'An island with nowhere to go');
  beats('A007', [
    V('gov_sts50_singapore_1992', 'SINGAPORE AND THE MALAY PENINSULA FROM THE SPACE SHUTTLE, 1992', { over: [low('1965: ~580 KM² (~225 SQ MI)', 'eighty')] }),
    Q('That\'s', 'SINGAPORE IN 1965', '≈ 3/4 OF NEW YORK CITY', null, null, 'NYC land area: ~300 sq mi'),
  ]);
  beats('A008', [
    V('gov_aster_singapore_2011', 'SINGAPORE ISLAND (NASA TERRA / ASTER, 2011)', { over: [low('HOMES · FACTORIES · PORT · AIRPORT · ARMY · WATER', 'Homes')] }),
    V('cm_pasir_panjang_strait_panorama', 'PASIR PANJANG TERMINAL AND THE SINGAPORE STRAIT', { cutW: 'an' }),
  ]);
  beats('A009', [
    A('cm_chinatown_1965_01', 'CHINATOWN, SINGAPORE, 1965'),
    A('cm_kampong_braddell_hill_1964', 'KAMPONG AT BRADDELL HILL, SINGAPORE, c. 1964', { cutW: 'Many', over: [low('KAMPONGS: WOODEN VILLAGES', 'kampongs')] }),
    A('cm_braddell_road_1963', 'BRADDELL ROAD AREA, 1963', { cutW: 'In' }),
    Q('around', 'BUKIT HO SWEE FIRE · 25 MAY 1961', '~16,000 HOMELESS', null, '2,000+ HOUSES BURNED IN ONE AFTERNOON', 'Source: NLB / Loh Kah Seng, "Squatters into Citizens"'),
  ]);
  beats('A010', [
    A('cm_hdb_commonwealth_drive_1964_a', 'ORIGINAL 1964 HDB BLOCK PLAQUE, COMMONWEALTH DRIVE', { over: [low('HOUSING AND DEVELOPMENT BOARD (HDB), 1960', 'Housing')] }),
    V('cm_hdb_jurong_west_2025', 'HDB BLOCKS, JURONG WEST, 2025', { cutW: 'Today', over: [low('~3 IN 4 RESIDENTS LIVE IN HDB FLATS', 'three')] }),
  ]);
  beats('A011', [
    V('cm_hdb_bidadari_new', 'NEW HDB FLATS, BIDADARI, 2021', { over: [low('A 99-YEAR LEASE', 'lease')] }),
    S('stats', { cutW: 'When', head: 'WHEN THE LEASE RUNS OUT', items: [], over: [at(head('THE FLAT GOES BACK', null, 470, 100), 0.2), at(head('TO THE STATE', null, 590, 100, Yc), 0.5)], source: 'Source: gov.sg (Minister Khaw Boon Wan, 2014)' }),
  ]);
  beats('A012', [
    V('px_orchard_crossing_crowd', 'ORCHARD ROAD, SINGAPORE', { over: [low('~6.1 MILLION PEOPLE TODAY', 'six')] }),
    V('px_waves_on_rocks', 'THE SEA · ' + IL, { cutW: 'Outward' }),
  ]);

  // ===== CH2 =====
  chapter('A013', 2, 'Moving hills into the sea');
  beats('A013', [
    V('cm_east_coast_park_2024', 'EAST COAST PARK: RECLAIMED LAND', { over: [low('FROM 1966: BEDOK AND TAMPINES HILLS → THE SEA', 'Bedok')] }),
    V('px_sand_quarry_aerial', 'DIGGING EARTH · ' + IL, { cutW: 'cut' }),
    V('px_earth_heap_sky', 'EARTH FILL · ' + IL, { cutW: 'dumped' }),
  ]);
  beats('A014', [
    V('cm_east_coast_park_zone_h', 'EAST COAST PARK'),
    Q('about', 'EAST COAST RECLAMATION', '~30 YEARS', null, '15+ KM² (~6 SQ MI) OF NEW COAST', 'Source: Biblioasia (NLB) 2017'),
    V('cm_east_coast_parkway_night', 'EAST COAST PARKWAY ON RECLAIMED LAND', { cutW: 'Today' }),
    V('cm_east_coast_park_2024', 'EAST COAST PARK', { cutW: 'what', kb: { z: [1.25, 1.1] } }),
  ]);
  beats('A015', [
    A('cm_lee_kuan_yew_wellington_1975', 'LEE KUAN YEW, APRIL 1975', { over: [low('APRIL 1975: A NEW AIRPORT AT CHANGI', 'Changi')] }),
    S('globe', GL({ cutW: 'Changi', lon: [[0, 103.85], [3, 103.9]], lat: [[0, 1.35], [3, 1.36]], R: [[0, 30000], [3, 42000]], pins: [{ ...G.changi, label: 'CHANGI', at: 0.4 }] })),
    V('cm_changi_airport_aerial_2011', 'CHANGI AIRPORT ON RECLAIMED LAND, 2011', { cutW: 'Most' }),
  ]);
  beats('A016', [
    V('px_dredger_rainbowing_sand', 'DREDGER PUMPING SAND · ' + IL, { in: 1 }),
    Q('forty-one', 'CHANGI RECLAMATION, FROM 1975', '41 MILLION M³', null, '5 DREDGERS · 10 KM (6 MI) OF PIPE', 'Source: Biblioasia (NLB) 2021'),
    V('px_sand_pipeline_beach_sunset', 'JETTY AT SUNSET · ' + IL, { cutW: 'through' }),
  ]);
  beats('A017', [S('stats', { head: 'PEK HOCK THIAM, RECLAMATION TEAM', items: [], over: [at(head('"WHO WOULD BELIEVE WE COULD', null, 460, 76), 0.1), at(head('CREATE SO MUCH LAND IN 2½ YEARS?"', null, 570, 76, Yc), 0.5)], source: 'Source: Biblioasia (NLB) 2021' })]);
  beats('A018', [
    V('px_changi_control_tower', 'CHANGI AIRPORT CONTROL TOWER', { over: [low('OPENED: 1 JULY 1981', 'July')] }),
    V('cm_changi_sia_landing_coast', 'LANDING AT CHANGI', { cutW: 'The' }),
    V('px_jewel_rain_vortex_1', 'JEWEL CHANGI AIRPORT', { cutW: 'Today' }),
    V('cm_changi_t5_construction', 'CHANGI TERMINAL 5 UNDER CONSTRUCTION, 2026', { cutW: 'still' }),
  ]);
  beats('A019', [
    V('px_marina_bay_evening_wide_1', 'MARINA BAY, SINGAPORE', { over: [low('ALL ON RECLAIMED LAND', 'reclaimed')] }),
    V('px_supertrees_low_angle', 'GARDENS BY THE BAY', { cutW: 'giant' }),
    V('cm_gardens_by_the_bay_aerial', 'GARDENS BY THE BAY, MARINA SOUTH', { cutW: 'from' }),
  ]);
  beats('A020', [
    V('px_scooter_marina_bay_dawn_3', 'MARINA BAY'),
    V('cm_aerial_2024_12', 'SINGAPORE FROM THE AIR, 2024', { cutW: 'To', over: [head('IT NEEDED SAND', 'sand', 200, 90, Yc)] }),
  ]);

  // ===== CH3 =====
  chapter('A021', 3, 'The sand wars');
  beats('A021', [
    V('px_reclaimed_sand_beach_port', 'PUMPED SAND · ' + IL),
    S('stats', { cutW: 'For', head: 'FOR BUILDING AND RECLAMATION', items: [], over: [at(head('RIVER · BEACH · SEABED SAND', null, 520, 90, Yc), 0.2)], source: 'Source: UNEP 2019' }),
  ]);
  beats('A022', [
    V('px_port_aerial_quay', 'SHIP AT A QUAY BESIDE SAND FLATS · ' + IL),
    Q('over', 'SINGAPORE SAND IMPORTS, 20 YEARS', '517 MILLION TONNES', null, '"BY FAR THE LARGEST IMPORTER"', 'Source: UNEP, 7 May 2019'),
    V('px_bulk_ship_port_aerial', 'BULK SHIP · ' + IL, { cutW: 'By' }),
  ]);
  beats('A023', [
    S('globe', GL({ lon: [[0, 103.8], [3, 104.2]], lat: [[0, 2], [3, 3]], R: [[0, 2600], [3, 2400]], pins: [{ ...G.sg, label: 'SINGAPORE', at: 0.2 }, { lon: 101.5, lat: 3.5, label: 'MALAYSIA', at: 0.6, small: true, size: 36 }, { ...G.riau, label: 'INDONESIA', at: 0.9, small: true, size: 36 }, { ...G.pp, label: 'CAMBODIA', at: 1.2, small: true, size: 36 }, { lon: 106.7, lat: 10.8, label: 'VIETNAM', at: 1.5, small: true, size: 36 }] })),
    Q('In', 'INDONESIA, BY 2009', 'UP TO 26 SMALL ISLANDS', 'LOST TO EROSION', 'MANY BLAMED THE SAND TRADE', 'Source: Indonesian officials via SCMP'),
    V('px_port_aerial_coast_2', 'BUILT COASTLINE · ' + IL, { cutW: 'blamed' }),
  ]);
  beats('A024', [
    V('px_ships_anchored_hazy_sunset', 'SHIPS AT ANCHOR · ' + IL),
    Q('Singapore', 'SINGAPORE vs INDONESIA TRADE DATA', '120 MILLION TONNES', null, 'MORE IMPORTED THAN INDONESIA SAID IT EXPORTED', 'Source: UNEP 2014 via sg101'),
    V('cm_aerial_2024_09', 'SINGAPORE COAST FROM THE AIR, 2024', { cutW: 'exported' }),
  ]);
  beats('A025', [
    S('stats', { head: 'ONE BY ONE, THE NEIGHBORS SAID STOP', items: [], over: [{ ...head('1997 · MALAYSIA', 'Malaysia', 520, 120, Yc) }], source: 'Source: sg101 (Singapore government)' }),
    V('px_port_aerial_haze_2', 'PORT · ' + IL, { cutW: 'Indonesia', over: [low('2003: INDONESIA BANS SEA SAND', 'Indonesia')] }),
    V('px_container_ship_top_aerial', 'SHIP · ' + IL, { cutW: 'tightened', over: [low('2007: TIGHTENED · INDONESIA SUPPLIED ~90%', 'ninety')] }),
  ]);
  beats('A026', [
    V('px_port_aerial_coast_1', 'INDUSTRIAL COAST · ' + IL, { over: [low('2007: PRICES SHOT UP', 'Prices')] }),
    Q('hills', 'THE NATIONAL SAND STOCKPILE', 'LOCATION: NOT PUBLISHED', null, 'SIZE: NOT PUBLISHED', 'Sources: MND; HDB annual report'),
  ]);
  beats('A027', [
    V('px_tanker_passing', 'TANKER · ' + IL, { over: [low('VIETNAM AND CAMBODIA BAN SAND TOO', 'Vietnam')] }),
    Q('And', '2019', 'MALAYSIA STOPS', 'ALL SEA SAND EXPORTS', 'IT HAD SUPPLIED 97%+ OF SINGAPORE\'S IMPORTS', 'Source: Reuters, 2019'),
  ]);
  beats('A028', [
    V('px_tanker_passing_2', 'SHIP · ' + IL, { over: [low('2023: INDONESIA LIFTS ITS BAN', 'Indonesia')] }),
    V('px_tetrapod_breakwater_aerial', 'BREAKWATER · ' + IL, { cutW: 'But', over: [head('MAKE LAND WITH LESS SAND', 'less', 200, 72, Yc)] }),
  ]);

  // ===== CH4 =====
  chapter('A029', 4, 'Building land without sand');
  beats('A029', [
    S('globe', GL({ lon: [[0, 103.75], [3, 103.7]], lat: [[0, 1.3], [3, 1.27]], R: [[0, 40000], [3, 60000]], pins: [{ ...G.jurong, label: 'SEVEN ISLANDS → JURONG ISLAND', at: 0.5 }] })),
    V('cm_jurong_hill_panorama', 'JURONG, TOWARDS JURONG ISLAND', { cutW: 'Singapore' }),
  ]);
  beats('A030', [
    S('stats', { head: 'JURONG ISLAND', items: [{ v: 10, pre: '< ', suf: ' KM²', label: 'THE 7 ORIGINAL ISLANDS', at: 0.3 }, { v: 30, pre: '~', suf: ' KM²', label: 'TODAY', w: 'Today', color: Yc }], source: 'Source: JTC' }),
    V('cm_jurong_island_from_hill', 'JURONG ISLAND REFINERIES', { cutW: 'and' }),
  ]);
  beats('A031', [
    V('cm_jurong_island_2026', 'JURONG ISLAND, 2026', { over: [low('THE SECOND TRICK: GO DOWN', 'down')] }),
    S('ladder', { cutW: 'Under', title: 'JURONG ROCK CAVERNS', max: 0, min: -160, items: [{ v: 0, label: 'SEABED', at: 0.3 }, { v: -130, label: 'OIL CAVERNS', sub: '~430 FT DOWN', w: 'hundred', hl: true }], source: 'Source: JTC', unit: ' M', step: 20, nosnow: true }),
    V('px_oil_tank_farm_aerial', 'OIL TANKS · ' + IL, { cutW: 'holding', over: [low('1.47 MILLION M³ · 9+ MILLION BARRELS', 'million')] }),
  ]);
  beats('A032', [
    V('cm_jurong_island_2011', 'JURONG ISLAND', { over: [low('60 HECTARES FREED · ~150 ACRES', 'sixty')] }),
    S('stats', { cutW: 'At', head: 'PM LEE HSIEN LOONG, 2014', items: [], over: [at(head('"LAND CONSTRAINT IS A LITTLE', null, 460, 76), 0.1), at(head('BIT LIKE PEAK OIL."', null, 570, 80, Yc), 0.5)], source: 'Source: AFP / SBS' }),
  ]);
  beats('A032B', [
    V('cm_pulau_tekong_from_mainland', 'PULAU TEKONG SEEN FROM THE MAINLAND, 2022', { over: [low('PULAU TEKONG: 10+ VILLAGES', 'villages')] }),
    A('cm_kampong_braddell_hill_1964', 'A SINGAPORE KAMPONG, c. 1964 · ' + IL, { cutW: 'In', kb: { z: [1.3, 1.1] } }),
    S('stats', { cutW: 'In', n: 2, head: 'SEPTEMBER 1986', items: [], over: [at(head('NAVY LANDING CRAFT CARRIED', null, 460, 76), 0.1), at(head('A TEMPLE\'S GODS ACROSS', null, 570, 80, Yc), 0.5)], source: 'Source: National Archives of Singapore' }),
  ]);
  beats('A033', [V('cm_tekong_johor_river', 'PULAU TEKONG FROM THE AIR', { over: [low('THE DUTCH TRICK: A POLDER', 'polder')] })]);
  beats('A034', [
    S('ladder', { title: 'THE TEKONG POLDER', max: 7, min: -3, items: [{ v: 6, label: 'DIKE TOP', sub: '~20 FT · 10 KM (6 MI) LONG', at: 0.6 }, { v: 0, label: 'SEA LEVEL', at: 1.2 }, { v: -1.2, label: 'NEW LAND', sub: '~4 FT BELOW THE SEA', w: 'below', hl: true }], source: 'Source: HDB / PUB, Sept 2025', unit: ' M', step: 1, nosnow: true }),
    V('px_long_dyke_reservoir', 'DIKE · ' + IL, { cutW: 'pumped' }),
    V('px_sluice_gates', 'PUMPED WATER · ' + IL, { cutW: 'The' }),
  ]);
  beats('A035', [
    V('px_rock_breakwater_aerial', 'SEA DIKE · ' + IL, { over: [low('~50% LESS SAND · BUT PUMPS FOREVER', 'half')] }),
    S('stats', { cutW: 'The', head: 'JAAP DEKKER, BOSKALIS PROJECT DIRECTOR', items: [], over: [at(head('"YOU NEED PUMPS TO TAKE', null, 460, 76), 0.1), at(head('THE WATER OUT…"', null, 570, 80, Yc), 0.5)], source: 'Source: Boskalis magazine' }),
    V('cm_marina_barrage_pump_house', 'PUMP HOUSE (MARINA BARRAGE) · ' + IL, { cutW: 'so' }),
  ]);
  beats('A036', [
    V('cm_pulau_tekong_bmtc', 'PULAU TEKONG: ARMY TRAINING ISLAND', { over: [low('ANNOUNCED COMPLETE: SEPT 2025 · ~800 HA', 'September')] }),
    S('stats', { cutW: 'By', head: 'SINGAPORE\'S LAND AREA', items: [{ v: 581.5, from: 581.5, dec: 1, suf: ' KM²', label: '1965', at: 0.3 }, { v: 744.3, from: 744.3, dec: 1, suf: ' KM²', label: 'END OF 2025', at: 1.0, color: Yc }], source: 'Source: SLA via SingStat' }),
    V('gov_iss_singapore_johor_2025', 'SINGAPORE FROM THE ISS (NASA, 2025)', { cutW: 'Twenty-eight', over: [low('+28% SINCE 1965', 'Twenty-eight'), low('≈ A WASHINGTON, D.C. OF NEW LAND', 'Washington')] }),
  ]);
  // ===== CH5 =====
  chapter('A037', 5, 'Every drop counts');
  beats('A037', [V('px_tap_dripping', 'WATER · ' + IL, { over: [head('WATER', 'Water', 200, 120, Yc)] })]);
  beats('A038', [
    A('cm_singapore_river_1960s_05', 'SINGAPORE RIVER, EARLY 1960s', { over: [low('1962 WATER AGREEMENT', 'agreement')] }),
    S('globe', GL({ cutW: 'Johor', lon: [[0, 103.8], [3, 103.8]], lat: [[0, 1.55], [3, 1.6]], R: [[0, 26000], [3, 30000]], pins: [{ ...G.sg, label: 'SINGAPORE', at: 0.2 }, { lon: 103.95, lat: 1.75, label: 'JOHOR RIVER', at: 0.6 }] })),
    Q('The', '1962 WATER AGREEMENT', '~300 MILLION US GAL/DAY', null, 'PRICE: < 1 US CENT PER 1,000 GALLONS', 'Source: MFA Singapore; our conversion'),
  ]);
  beats('A039', [S('stats', { head: 'THE AGREEMENT RUNS OUT IN', items: [], sfx: 'boom', over: [at(head('2061', null, 540, 220, Yc), 0.2)], source: 'Source: MFA Singapore' }), V('cm_lower_peirce_reservoir_sunset', 'LOWER PEIRCE RESERVOIR', { cutW: 'So' })]);
  beats('A040', [
    S('stats', { head: 'THE FOUR NATIONAL TAPS', items: [], over: [at(head('1 · RAIN', null, 520, 130, Yc), 0.2)] }),
    V('cm_macritchie_reservoir_sunset', 'MACRITCHIE RESERVOIR', { cutW: 'Rivers', over: [low('17 RESERVOIRS', 'seventeen')] }),
    V('cm_drone_video_singapore', 'MARINA BARRAGE (OPENED 2008)', { cutW: 'In' }),
    V('cm_marina_reservoir_2024', 'MARINA RESERVOIR: NOW FRESH WATER', { cutW: 'the' }),
  ]);
  beats('A041', [
    V('cm_newater_uv_unit', 'NEWATER UV UNIT (MODEL)', { over: [head('2 · JOHOR   3 · NEWATER', null, 200, 80, Yc)] }),
    V('cm_newater_microfiltration', 'MICROFILTRATION, BEDOK NEWATER FACTORY', { cutW: 'sewage', over: [low('USED WATER, CLEANED TO ULTRA-PURE', 'ultra-pure')] }),
    V('cm_newater_bedok_plant', 'BEDOK NEWATER PLANT', { cutW: 'Most' }),
  ]);
  beats('A042', [
    A('cm_national_day_1960s_01', 'NATIONAL DAY, SINGAPORE, EARLY 1960s · ' + IL),
    Q('sixty', 'NATIONAL DAY PARADE, 2002', '60,000 PEOPLE', null, 'TOASTED WITH RECYCLED WATER', 'Source: PUB / NLB'),
  ]);
  beats('A043', [
    V('cm_marina_barrage_2008', 'MARINA BARRAGE, 2008', { over: [head('4 · THE SEA', null, 200, 100, Yc), low('5 DESALINATION PLANTS', 'five')] }),
    V('px_skyline_construction_trains', 'SINGAPORE', { cutW: 'Today', over: [low('~530 MILLION US GALLONS A DAY', 'five')] }),
    Q('By', 'WATER DEMAND BY 2065', '× ~2', null, null, 'Source: PUB / MSE'),
  ]);
  // ===== CH6 =====
  chapter('A044', 6, 'The sea comes back');
  beats('A044', [V('px_storm_waves_old_groyne', 'ROUGH SEA · ' + IL, { over: [head('THE SEA IS RISING', 'rising', 200, 90, Yc)] })]);
  beats('A045', [
    S('ladder', { title: 'SEA LEVEL OUTLOOK, SINGAPORE', max: 5, min: 0, items: [{ v: 1.15, label: 'BY 2100', sub: '~4 FT', at: 0.6 }, { v: 5, big: '4–5 M', label: 'TIDES + STORMS', sub: 'UP TO 16 FT', w: 'tides', hl: true }], source: 'Source: 3rd National Climate Change Study, Jan 2024', unit: ' M', step: 1, nosnow: true, rise: true }),
    V('px_riprap_waves', 'WAVES ON A ROCK WALL · ' + IL, { cutW: 'With' }),
    V('px_waves_on_rocks', 'WAVES · ' + IL, { cutW: 'above' }),
  ]);
  beats('A046', [
    V('cm_east_coast_park_2024', 'EAST COAST PARK', { kb: { z: [1.2, 1.05] }, over: [low('~30% OF THE LAND: < 5 M ABOVE SEA LEVEL', 'thirty')] }),
    V('px_merlion_rain', 'THE MERLION IN THE RAIN', { cutW: 'In' }),
    Q('protecting', 'PM LEE HSIEN LOONG, 2019', 'S$100 BILLION', null, 'COASTAL PROTECTION, 50–100 YEARS', 'Source: National Day Rally 2019'),
  ]);
  beats('A047', [
    S('globe', GL({ lon: [[0, 103.95], [3, 103.95]], lat: [[0, 1.31], [3, 1.31]], R: [[0, 40000], [3, 56000]], pins: [{ ...G.eastcoast, label: 'LONG ISLAND (PLANNED)', at: 0.5 }] })),
    V('cm_east_coast_park_zone_h', 'EAST COAST PARK', { cutW: 'About', over: [low('~800 HA · ~2× MARINA BAY', 'eight')] }),
  ]);
  beats('A048', [
    V('px_long_breakwater_aerial', 'BREAKWATER · ' + IL, { over: [low('BUILT HIGH, AS A WALL AGAINST THE SEA', 'wall')] }),
    V('cm_marina_barrage_2022', 'MARINA BARRAGE: THE MODEL', { cutW: 'And', over: [low('BEHIND IT: A NEW RESERVOIR', 'reservoir')] }),
    Q('Preparation', 'LONG ISLAND', 'WORKS FROM 2027', null, 'LAND + FLOOD DEFENCE + WATER', 'Source: URA Master Plan 2025'),
  ]);
  beats('A049', [
    V('cm_tuas_port_finger2_construction', 'TUAS PORT UNDER CONSTRUCTION ON RECLAIMED LAND, 2023', { over: [low('TUAS MEGA PORT', 'Tuas')] }),
    V('cm_tuas_port_2023_a', 'TUAS PORT, 2023', { cutW: 'on' }),
    V('cm_tuas_port_sultan_shoal', 'TUAS PORT CRANES, SULTAN SHOAL LIGHTHOUSE', { cutW: 'with' }),
  ]);
  beats('A050', [
    V('cm_singapore_river_1960s_03', 'SINGAPORE RIVER, EARLY 1960s'),
    V('px_bulk_ship_port_aerial', 'BULK SHIP · ' + IL, { cutW: 'bought' }),
    V('cm_jurong_island_from_hill', 'JURONG ISLAND', { cutW: 'joined' }),
    V('cm_newater_control_room', 'NEWATER CONTROL ROOM', { cutW: 'borrowed' }),
  ]);
  beats('A051B', [V('cm_pulau_tekong_bmtc', 'PULAU TEKONG', { kb: { z: [1.25, 1.05] }, over: [head('WOULD YOU LIVE BELOW THE SEA?', null, 180, 72)] })]);
  beats('A051', [
    A('cm_lee_kuan_yew_1969_conference_4', 'LEE KUAN YEW (PHOTO: 1969)', { kb: { z: [1.2, 1.05] } }),
    V('px_marina_bay_night_reflections', 'MARINA BAY AT NIGHT', { cutW: 'A' }),
    V('gov_iss_singapore_lightning_2025', 'SINGAPORE AT NIGHT FROM THE ISS (NASA, 2025)', { cutW: 'Not' }),
  ]);
  beats('A052', [V('px_singapore_river_boat_night', 'SINGAPORE RIVER'), V('px_marina_bay_sands_flyer_dusk', 'MARINA BAY', { cutW: 'subscribe', in: 1 })]);
  add(T.tl.voiceEnd + 0.4, S('endscreen', {}), 'fade');
  return out;
}
module.exports = { assets, build, defaultTrans: 'cut', splitOver: 4.5, splitTo: 3 };
