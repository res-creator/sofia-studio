// EP04 Hong Kong — ~70% real Hong Kong footage/photos, a new picture every ~2–4 s; graphics as short inserts.
const fs = require('fs'), path = require('path');
const MF = JSON.parse(fs.readFileSync(path.join(__dirname, 'footage/manifest.json')));
const FT = Object.fromEntries(MF.map(x => [x.key, x]));
const assets = {}; for (const x of MF) if (x.type === 'photo') assets[x.key] = 'footage/' + x.key + '.jpg';
const credit = k => { const f = FT[k]; if (!f || !f.attribution) return ''; if (f.source === 'pixabay' || f.source === 'coverr') return ''; return f.source === 'nasa' ? f.attribution.split(';')[0] : 'Photo: ' + f.attribution; };
const C = n => require('../atlaskit/core').C[n];
const HK = { lon: 114.17, lat: 22.32 };
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
    const rel = (w, t0, nn) => Math.max(0.2, T.at(pid, w, nn || 1) - t0);
    list.forEach((sh, k) => { if (!sh) return; const t0 = ts[k];
      for (const ov of (sh.p.over || [])) if (ov.w) { ov.at = rel(ov.w, t0, ov.n); delete ov.w; }
      for (const it of (sh.p.items || [])) if (it.w) { it.at = rel(it.w, t0, it.n); delete it.w; }
      for (const [kw, ka] of [['answerW', 'answerAt'], ['noteW', 'noteAt'], ['recW', 'recAt']]) if (sh.p[kw]) { sh.p[ka] = Math.max(0.5, T.at(pid, sh.p[kw]) - t0); delete sh.p[kw]; }
      if (sh.p.toneW) { sh.p.toneAt = sh.p.toneW.map(w => Math.max(0.3, T.at(pid, w) - t0)); delete sh.p.toneW; }
      add(t0, sh, 'cut'); });
  }
  const chapter = (pid, n, title) => add(T.s(pid) - 1.5, S('chapter', { n, title }), 'fade');


  // ===== COLD OPEN =====
  beats('H001', [
    F('px_aerial_dense_towers_to_harbour', { over: [head('ONE OF THE MOST CROWDED CITIES ON EARTH', null, 200, 80)] }),
    F('px_ph_tiltshift_crowd_crossing', { over: [{ type: 'count', from: 0, to: 7.5, dec: 1, suf: ' MILLION', label: 'PEOPLE', y: 520, w: 'seven' }] }),
    F('px_ph_looking_down_canyon_of_towers', { over: [low('STREETS THAT NEVER SEE THE SUN', 'sun')] }),
  ], { start: 0 });
  beats('H002', [
    F('px_skyline_reveal_from_wooded_hill'),
    F('px_aerial_cliff_coast_forest', { over: [low('MOUNTAINS · JUNGLE · EMPTY BEACHES', 'Mountains')] }),
    F('px_aerial_wild_beach_steep_hills', { over: [head("MOST OF HONG KONG ISN'T CITY", 'Most', 200, 86)] }),
  ]);
  beats('H003', [
    F('px_lion_rock_wall_of_towers', { over: [head('HOW DO 7.5 MILLION FIT HERE?', null, 200, 90)] }),
    F('px_ph_facade_of_tiny_balconies', { over: [low('SOME OF THE SMALLEST HOMES IN THE WORLD', 'smallest')] }),
    F('px_aerial_mountain_towers_coast'),
  ]);
  add(T.e('H003') + 0.15, S('title', { lines: ['HOW 7.5 MILLION', 'PEOPLE FIT INTO', 'HONG KONG'], hl: 2, img: 'px_ph_night_dense_towers_from_hill', credit: '', brand: true }), 'cut');

  // ===== CH1 =====
  chapter('H004', 1, 'A city with nowhere to go');
  beats('H004', [
    S('globe', { lon: [[0, 100], [4, 114.2]], lat: [[0, 30], [4, 22.3]], R: [[0, 700], [4.5, 3200]], pins: [{ ...HK, label: 'HONG KONG', sub: '~1,100 KM² OF LAND', at: 1.2 }] }),
    F('nasa_sts9_hong_kong_1983', { over: [{ type: 'note', text: 'HONG KONG FROM SPACE · NASA, 1983', x: 60, y: 70, at: 0.3 }] }),
    F('px_aerial_po_toi_ridge_sea', { over: [low('260+ ISLANDS · STEEP ROCKY HILLS', 'islands')] }),
  ]);
  beats('H005', [
    S('stats', { head: "HONG KONG'S LAND", items: [{ pre: '~', v: 24, suf: '%', label: 'BUILT ON', at: 0.3, size: 230 }, { pre: '~', v: 76, suf: '%', label: 'MOUNTAINS · FOREST · RESERVOIRS', w: 'rest' }], source: 'Source: Planning Department' }),
    F('px_aerial_reservoir_wooded_islands'),
  ]);
  beats('H006', [
    F('px_aerial_maclehose_trail_ridge_beach', { over: [low('~40% IS PROTECTED COUNTRY PARK', 'forty')] }),
    F('px_lion_rock_head_hikers', { over: [low('FROM THE BUSIEST STREET TO A MOUNTAIN TRAIL', 'busiest')] }),
    F('px_ph_hikers_view_islands_sea', { over: [low('…IN LESS THAN AN HOUR', 'hour')] }),
  ]);
  beats('H007', [
    F('px_deep_water_bay_towers_under_mountain', { over: [low('A NARROW STRIP OF FLAT LAND', 'narrow')] }),
    F('px_ph_ap_lei_chau_towers_bay'),
    F('px_aerial_towers_edge_forest_bay', { over: [head('ONLY ONE DIRECTION LEFT', 'direction', 200, 90)] }),
  ]);
  beats('H007B', [
    F('px_ph_old_tenement_balconies', { over: [low("IT WASN'T ALWAYS THIS CROWDED", 'always')] }),
    F('px_ph_red_sail_junk_bw', { over: [low('AFTER 1949: HUNDREDS OF THOUSANDS OF REFUGEES', 'refugees')] }),
    F('px_ph_stacked_flats_facade_bw'),
    F('px_ph_old_alley_clutter', { over: [low('SHACKS ON THE HILLSIDES', 'shacks')] }),
  ]);

  // ===== CH2 =====
  chapter('H008', 2, 'The vertical city');
  beats('H008', [F('px_ph_housing_tower_wide_angle', { over: [head('UP.', null, 300, 200, '#FFC857')] })], { tail: 0.25 });
  beats('H009', [
    F('px_aerial_central_harbour_kowloon'),
    S('stats', { head: 'BUILDINGS 150 M OR TALLER', items: [{ v: 669, label: 'HONG KONG · #1 IN THE WORLD', at: 0.3, size: 260 }], source: 'Source: Guinness World Records (CTBUH data, Jan 2025)' }),
    F('px_cathedral_bank_of_china_lookup', { over: [low('MORE THAN NEW YORK · MORE THAN DUBAI', 'York')] }),
    F('px_timelapse_citic_tower_clouds'),
  ]);
  beats('H010', [
    F('px_aerial_estate_towers_close', { over: [low("MOST OF THEM AREN'T OFFICES. THEY'RE HOMES", 'homes')] }),
    F('px_aerial_estate_towers_road_bus', { over: [low('40 · 50 · 60 FLOORS', 'forty')] }),
    F('px_ph_tower_facade_green_grid', { over: [low("NEIGHBOURS SEE INTO EACH OTHER'S KITCHENS", 'kitchens')] }),
  ]);
  beats('H011', [
    F('px_ph_monster_building_courtyard_colour', { over: [low('THE "MONSTER BUILDING" · QUARRY BAY', 'Monster')] }),
    F('px_ph_monster_building_walls_up', { over: [low('5 BLOCKS JOINED INTO ONE WALL', 'five')] }),
    F('px_ph_monster_building_courtyard_bw', { over: [low('EARLY 1970s · THOUSANDS STILL LIVE HERE', 'thousands')] }),
    F('px_ph_old_flats_windows_ac'),
  ]);
  beats('H012', [
    F('px_central_street_tram_tracks', { over: [low('BAMBOO SCAFFOLDING', 'bamboo')] }),
    F('px_tiltshift_construction_site_cranes'),
    F('px_tiltshift_tower_cranes_core', { over: [low('LIGHT · CHEAP · FAST', 'light')] }),
    F('px_tiltshift_concrete_pump'),
  ]);
  beats('H013', [
    S('stats', { head: 'WANG FUK COURT, TAI PO · 26 NOVEMBER 2025', items: [{ v: 168, label: 'LIVES LOST', at: 0.5, size: 240 }], source: 'Source: AP; Wang Fuk Court fire inquiry (2026)' }),
    F('px_ph_housing_tower_bw_lookup', { over: [low('INQUIRY: FLAMMABLE NETTING AND FOAM BOARDS', 'inquiry')] }),
  ]);
  beats('H014', [
    F('px_tiltshift_site_trucks', { over: [low('PUBLIC WORKS: FROM BAMBOO TO METAL', 'metal')] }),
    F('px_ph_tenement_street_canyon', { over: [low('A FAMOUS SIGHT, SLOWLY DISAPPEARING', 'disappearing')] }),
  ]);
  beats('H014B', [
    F('px_ph_low_cloud_over_city', { over: [low('BUILT TO SURVIVE TYPHOONS', 'typhoons')] }),
    F('px_ph_rainy_street_central', { over: [chipC('SIGNAL No. 8 → OFFICES AND SCHOOLS CLOSE', 'eight', 900, 50)] }),
    F('px_ph_wet_street_night_rain', { over: [low('THE CITY WAITS INDOORS', 'waits')] }),
  ]);

  // ===== CH3 =====
  chapter('H015', 3, 'Making new land');
  beats('H015', [F('px_harbourfront_construction_cranes', { over: [head('NO FLAT GROUND? MAKE MORE.', 'made', 200, 90)] })]);
  beats('H016', [F('px_aerial_high_island_dam_dolosse', { over: [low('ROCK AND SAND, POURED INTO THE SEA', 'rock')] }), F('px_waterfront_reclamation_works_traffic', { over: [low('RECLAMATION', 'reclamation')] })]);
  beats('H017', [
    S('stats', { head: 'LAND MADE FROM THE SEA', items: [{ pre: '~', v: 7, suf: '%', label: 'OF ALL LAND', at: 0.3 }, { pre: '~', v: 70, suf: '%', label: 'OF COMMERCIAL LAND', w: 'business' }], source: 'Sources: CEDD; Development Bureau' }),
    F('px_dusk_aerial_central_lights', { over: [low('MUCH OF THIS SKYLINE STANDS ON FORMER SEA', 'ships')] }),
    F('px_harbour_boat_skyline_peak'),
  ]);
  beats('H017B', [
    F('px_harbour_ferry_wake_island_skyline', { over: [low('VICTORIA HARBOUR', 'Harbour')] }),
    F('px_ph_star_ferry_skyline_blue_sky', { over: [low('1997: A LAW TO PROTECT WHAT IS LEFT', 'law')] }),
    F('px_harbour_cargo_barge_skyline', { over: [low('"OVERRIDING PUBLIC NEED" ONLY', 'overriding')] }),
  ]);
  beats('H018', [
    F('nasa_hk_radar_sir_c_xsar_1994', { over: [{ type: 'note', text: 'SPACE SHUTTLE RADAR, 1994 · KAI TAK AIRPORT IN THE CITY', x: 60, y: 70, at: 0.3 }] }),
    F('px_ph_cargo_jet_past_estate_towers', { over: [low('KAI TAK: PLANES LOW OVER APARTMENT BLOCKS', 'low', 'PHOTO: TODAY’S AIRPORT AREA')] }),
    F('px_ph_overfilled_street_kowloon', { over: [low('…LOOKING INTO LIVING ROOMS', 'living')] }),
  ]);
  beats('H019', [
    F('px_ph_kowloon_evening_roads_aerial', { over: [low('PILOTS AIMED AT A CHECKERBOARD PAINTED ON A HILL', 'checkerboard')] }),
    F('px_ph_ups_jet_landing_airport', { over: [low('A SHARP TURN AT THE LAST MOMENT', 'turn')] }),
    F('px_night_drone_down_between_towers', { over: [low('ONE OF THE SCARIEST LANDINGS IN THE WORLD', 'nerve-racking')] }),
  ]);
  beats('H020', [
    F('px_ph_airport_runway_aprons', { over: [low('1998: KAI TAK CLOSES', 'closed')] }),
    F('px_ph_airport_terminal_corridor', { over: [low('THE NEW AIRPORT: AN ISLAND, FLATTENED AND EXTENDED', 'flattened')] }),
    S('stats', { head: 'NEW LAND FOR THE AIRPORT', items: [{ pre: '>', v: 9, suf: ' KM²', label: 'RECLAIMED FROM THE SEA', at: 0.4, size: 240 }] }),
  ]);
  beats('H020B', [
    F('px_ph_ngong_ping_cable_car', { over: [low('LANTAU ISLAND', 'Lantau')] }),
    F('px_aerial_sea_arch_island', { over: [low('PLAN: ~1,000 HECTARES OF ARTIFICIAL ISLANDS', 'thousand')] }),
    F('px_aerial_topdown_rock_islet_waves', { over: [low('ON HOLD · TOO EXPENSIVE FOR NOW', 'hold')] }),
  ]);

  // ===== CH4 =====
  chapter('H021', 4, 'Life in a shoebox');
  beats('H021', [F('px_aerial_new_town_tower_clusters', { over: [low('…AND STILL NOT ENOUGH ROOM', 'room')] })], { tail: 0.25 });
  beats('H022', [
    F('px_aerial_dense_towers_ifc'),
    S('stats', { head: 'LEAST AFFORDABLE HOUSING MARKET', items: [{ pre: '~', v: 14, label: "YEARS OF A TYPICAL FAMILY'S INCOME FOR A HOME", at: 0.4, size: 260 }], source: 'Source: Demographia International Housing Affordability' }),
    F('px_ph_mid_levels_tower_cluster', { over: [low('#1 FOR 15+ YEARS IN A ROW', 'years')] }),
  ]);
  beats('H023', [
    F('px_ph_old_tenement_corner', { over: [low('SUBDIVIDED FLATS', 'subdivided')] }),
    F('px_ph_looking_up_between_towers', { over: [low('ONE APARTMENT → SEVERAL TINY UNITS', 'several')] }),
    F('px_ph_facade_of_tiny_balconies', { kb: { z: [1.25, 1.05] }, over: [low('BED · KITCHEN · TOILET · ONE ROOM', 'bed')] }),
    F('px_ph_old_flats_windows_ac', { kb: { z: [1.2, 1.05], x: [0.6, 0.4] }, over: [low('THE SIZE OF A PARKING SPOT', 'parking')] }),
  ]);
  beats('H024', [S('stats', { head: 'SUBDIVIDED FLATS · 2021 CENSUS', items: [{ pre: '>', v: 200000, label: 'PEOPLE', at: 0.3 }, { pre: '~', v: 10, suf: ' M²', label: 'TYPICAL UNIT', w: 'ten' }], source: 'Sources: Census and Statistics Dept; AP' }), F('px_ph_tower_facade_green_grid', { kb: { z: [1.3, 1.1] } })]);
  beats('H024B', [F('px_aerial_new_town_rings_of_towers'), S('stats', { head: 'LIVING SPACE PER PERSON', items: [{ pre: '~', v: 16, suf: ' M²', label: 'TYPICAL, CITY-WIDE (2021)', at: 0.4, size: 240 }], source: 'Source: LegCo Research Office' })]);
  beats('H025', [F('px_ph_old_alley_clutter', { kb: { z: [1.25, 1.05] }, over: [low('CAGE HOMES · COFFIN HOMES', 'cage')] }), F('px_ph_stacked_flats_facade_bw', { kb: { z: [1.2, 1.05] }, over: [low('A BUNK, RENTED BY THE MONTH', 'month')] })]);
  beats('H025B', [
    F('px_ph_old_street_steps_residents', { over: [low('PUBLIC HOUSING BEGAN WITH A DISASTER', 'disaster')] }),
    S('stats', { head: 'SHEK KIP MEI FIRE · 25 DECEMBER 1953', items: [{ pre: '>', v: 50000, label: 'PEOPLE LEFT HOMELESS', at: 0.4, size: 230 }], source: 'Source: Hong Kong Housing Authority' }),
    F('px_ph_estate_towers_bw', { over: [low('SIMPLE CONCRETE BLOCKS', 'concrete')] }),
    F('px_aerial_kowloon_estates_rail', { over: [low("THE CITY'S FIRST PUBLIC HOUSING ESTATE", 'first')] }),
  ]);
  beats('H026', [
    F('px_aerial_housing_estate_highway'),
    S('stats', { head: 'LIVE IN PUBLIC HOUSING (2024)', items: [{ pre: '~', v: 45, suf: '%', label: 'OF HONG KONG', at: 0.3, size: 260 }], source: 'Source: Housing Authority, Housing in Figures 2025' }),
    F('px_ph_wall_of_estate_towers_highway', { over: [low('HUGE ESTATES OF IDENTICAL TOWERS', 'identical')] }),
  ]);
  beats('H027', [F('px_aerial_estate_towers_row', { over: [low('THE WAIT FOR A PUBLIC RENTAL FLAT', 'wait')] }), F('px_ph_estate_towers_railway', { over: [chipC('~5 YEARS', 'five', 900, 70)] })]);

  // ===== CH5 =====
  chapter('H028', 5, 'A city that moves like a machine');
  beats('H028', [F('px_night_crossing_crowd_buses'), F('px_street_crossing_pedestrians_day', { over: [low('MOVING THIS MANY PEOPLE', 'moving')] })]);
  beats('H029', [
    F('px_mtr_platform_passengers_train', { over: [low('THE MTR · MILLIONS OF JOURNEYS A DAY', 'MTR')] }),
    S('stats', { head: 'MTR PASSENGER JOURNEYS ON TIME', items: [{ v: 99.9, dec: 1, suf: '%', label: '2024', at: 0.3, size: 280 }], source: 'Source: MTR Corporation; LegCo' }),
    F('px_mtr_train_passing_platform'),
  ]);
  beats('H029B', [
    F('px_ph_light_rail_street', { over: [low('OCTOPUS CARD · SINCE 1997', 'Octopus')] }),
    F('px_street_corner_crowd_minibus', { over: [low('TRAINS · BUSES · FERRIES · SHOPS', 'trains')] }),
    F('px_ph_mtr_platform_screen_doors', { over: [low('ONE OF THE FIRST IN THE WORLD', 'first')] }),
  ]);
  beats('H030', [
    F('px_ph_tram_old_shops_day', { over: [low('DOUBLE-DECKER TRAMS · SINCE 1904', 'trams')] }),
    F('px_street_tram_tracks_red_taxis'),
    F('px_ph_star_ferry_close', { over: [low('THE STAR FERRY · SINCE THE 1880s', 'Star')] }),
    F('px_ph_star_ferry_in_fog'),
  ]);
  beats('H031', [
    F('px_aerial_midlevels_towers_islands', { over: [low('A CITY THAT CLIMBS A MOUNTAIN', 'climbs')] }),
    F('px_ph_mid_levels_escalator_people', { over: [low('CENTRAL–MID-LEVELS ESCALATOR', 'escalator')] }),
    S('stats', { head: 'THE ESCALATOR', items: [{ pre: '~', v: 800, suf: ' M', label: 'LONG', at: 0.3 }, { pre: '~', v: 135, suf: ' M', label: 'UPHILL', w: 'thirty-five' }, { v: 1993, label: 'OPENED', w: 'opened', size: 140 }] }),
    F('px_peak_view_central_towers_harbour'),
  ]);
  beats('H032', [F('px_ph_mid_levels_escalator_people', { kb: { z: [1.25, 1.05], x: [0.6, 0.45] }, over: [low('MORNING: DOWNHILL, TO THE OFFICES', 'morning')] }), F('px_aerial_hillside_towers_west_harbour', { over: [low('LATER: BACK UP THE MOUNTAIN', 'back')] })]);

  // ===== CH6 =====
  chapter('H033', 6, 'The densest place on Earth');
  beats('H033', [F('px_ph_mong_kok_night_crowd_neon', { over: [head('HOW CROWDED CAN IT GET?', null, 200, 90)] })]);
  beats('H034', [
    F('px_ph_mong_kok_neon_signs_day', { over: [low('MONG KOK · KOWLOON', 'Mong')] }),
    S('stats', { head: 'MONG KOK (GUINNESS WORLD RECORDS)', items: [{ pre: '~', v: 130000, label: 'PEOPLE PER KM²', at: 0.4, size: 230 }] }),
    F('px_ph_mong_kok_crossing_night'),
  ]);
  beats('H035', [F('px_ph_neon_signs_night_street'), F('px_ph_kowloon_walled_city_model', { over: [low('THE KOWLOON WALLED CITY', 'Kowloon')] })]);
  beats('H036', [
    F('px_ph_dense_city_from_above', { over: [low('SMALLER THAN 4 FOOTBALL FIELDS', 'four')] }),
    S('stats', { head: 'KOWLOON WALLED CITY · 1987', items: [{ pre: '~', v: 33000, label: 'PEOPLE', at: 0.3 }, { pre: '>', v: 1, suf: ' MILLION', label: 'PER KM²', w: 'million' }], source: 'Source: 1987 government survey (via Wikipedia)' }),
    F('px_ph_topdown_dense_blocks'),
  ]);
  beats('H037', [F('px_ph_tenement_street_canyon', { kb: { z: [1.25, 1.05] }, over: [low('ONE SOLID MASS OF BUILDINGS', 'mass')] }), F('px_ph_old_corner_building_crowd', { over: [low('LAMPS LIT EVEN AT MIDDAY', 'lamps')] })]);
  beats('H037B', [
    F('px_ph_market_alley_bw', { over: [low('HOMES · FACTORIES · DENTISTS · FOOD STALLS', 'homes')] }),
    F('px_ph_dried_sausage_stall'),
    F('px_ph_kowloon_tailor_shops_tenements', { over: [low('NEITHER BRITAIN NOR CHINA FULLY GOVERNED IT', 'Britain')] }),
  ]);
  beats('H038', [F('px_aerial_reservoir_forest_islands', { over: [low('1993: DEMOLITION · TODAY: A PARK', 'Demolition')] })], { tail: 0.25 });

  // ===== ENDING =====
  chapter('H039', 7, 'The answer');
  beats('H039', [F('px_harbour_timelapse_dusk')], { tail: 0.25 });
  beats('H040', [
    F('px_night_drone_central_ifc', { over: [low('BUILD UP', 'build')] }),
    F('px_night_container_terminal_hyperlapse', { over: [low('MAKE LAND FROM THE SEA', 'land')] }),
    F('px_ph_tram_neon_street_night', { over: [low('LIVE SMALL', 'smallest')] }),
    F('px_night_flight_over_city_traffic', { in: 20, over: [low('MOVE LIKE A MACHINE', 'move')] }),
  ]);
  beats('H041', [F('px_lion_rock_over_kowloon_towers'), F('px_aerial_green_peninsula_sea', { over: [head('ALMOST HALF THE LAND STAYS WILD', 'wild', 200, 86)] })]);
  beats('H042', [F('px_repulse_bay_beach_wooded_slope'), F('px_ph_skyline_in_low_cloud_night', { over: [head('NOWHERE TO GO BUT UP', 'up', 300, 110, '#FFC857')] })]);
  beats('H043', [
    F('px_ph_silhouettes_over_night_towers'),
    S('endq', { img: 'px_ph_night_dense_towers_from_hill', credit: '', lines: ['COULD YOU LIVE IN', 'A HOME THIS SMALL', 'WITH THIS VIEW?'], hl: 2, sub: 'Tell us in the comments · Which city should we explain next?' }),
  ]);
  add(T.tl.voiceEnd + T.tl.qcard, S('endscreen', {}), 'fade');
  return out;
}
module.exports = { assets, build, defaultTrans: 'cut', splitOver: 6, splitTo: 4 };
