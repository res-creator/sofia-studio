// EP09 New Orleans — real footage: US government (USACE, NASA, NOAA, Signal Corps, FEMA), Wikimedia Commons, Pixabay; labelled archive; our own diagrams.
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
  beats('N001', [
    F('px_nola_drone_rooftops_sunset_flat', { over: [head('NEW ORLEANS', null, 200, 100)] }),
    F('cm_banks_street_kayakers_flood_2019', { cutW: 'nowhere', over: [note('BANKS STREET AFTER A DOWNPOUR, 2019')] }),
    F('cm_west_closure_complex_pumps_running', { cutW: 'pumps', over: [note('PUMP STATION TEST, 2023')] }),
    F('cm_17th_street_pccp_wet_test_2025', { cutW: 'lake', over: [note('17TH STREET CANAL PUMPS, 2025')] }),
  ], { start: 0 });
  beats('N002', [F('px_nola_drone_levee_neighbourhood_sunset', { over: [head('…AND THAT MAKES IT SINK', 'sinking', 200, 90, Yc)] })]);
  beats('N003', [
    F('cm_aerial_cbd_gasometers_1921', { over: [note('NEW ORLEANS, 1921')] }),
    F('cm_aerial_new_orleans_east_2019', { cutW: 'Today', over: [low('TODAY: ABOUT HALF BELOW SEA LEVEL', 'half'), note('NEW ORLEANS EAST, 2019')] }),
    F('cm_algiers_levee_ship_passing', { cutW: 'twelve', over: [head('UP TO 12 FT BELOW THE SEA', 'twelve', 200, 90, Yc), note('A SHIP ON THE MISSISSIPPI, ABOVE STREET LEVEL')] }),
  ]);
  beats('N004', [
    F('px_nola_drone_skyline_sunset_slow', { over: [head("WHY NOT STOP PUMPING?", 'stop', 200, 90)] }),
    F('cm_old_river_control_complex_aerial', { cutW: 'depend', over: [head('AND WHY DOES IT DEPEND ON THIS?', 'depend', 200, 84, Yc), note('OLD RIVER CONTROL, LOUISIANA')] }),
  ]);
  add(T.e('N004') + 0.15, S('title', { lines: ["WHY NEW ORLEANS", "CAN'T STOP", 'SINKING'], hl: 2, img: 'nasa_new_orleans_from_iss_2008', credit: credit('nasa_new_orleans_from_iss_2008'), brand: true }), 'cut');

  // ===== CH1 (no card) =====
  beats('N005', [
    F('cm_plan_new_orleans_1798', { over: [note('PLAN OF NEW ORLEANS, 1798')] }),
    F('px_jackson_square_cathedral_wide', { cutW: 'French', over: [low('FRENCH QUARTER: THE NATURAL HIGH GROUND', 'French')] }),
    F('px_cypress_swamp_lake_martin', { over: [note('LOUISIANA CYPRESS SWAMP (LAKE MARTIN)')] }),
  ]);
  beats('N006', [
    F('cm_pumping_station_d_cornerstone_1898', { over: [note('PUMPING STATION CORNERSTONE, 1898')] }),
    F('cm_aerial_midcity_to_cbd_1927', { cutW: 'built', over: [note('NEW NEIGHBORHOODS ON THE OLD SWAMP, 1927')] }),
  ]);
  beats('N007', [
    F('px_cypress_knees', { over: [low('PEAT: OLD ROOTS AND PLANTS', 'peat')] }),
    S('bowl', { cutW: 'air', dur: 3, title: 'DRAIN THE SWAMP · THE PEAT ROTS · THE GROUND DROPS' }),
  ]);
  beats('N008', [
    F('cm_aerial_cbd_gasometers_1921', { kb: { z: [1.4, 1.25], x: [0.4, 0.5] }, over: [low('THE 1895 MAP SAID: "20 FT"', 'twenty'), note('NEW ORLEANS, 1921')] }),
    S('bowl', { cutW: 'Correct', hold: 0 }),
  ]);
  beats('N008A', [S('bowl', { dur: 3.5 })]);
  beats('N008B', [F('nasa_radar_new_orleans_1998', { over: [low('UP TO 2 IN A YEAR (NASA RADAR, 2009–2012)', 'two'), note('NASA SPACEBORNE RADAR IMAGE, 1998')] })]);
  beats('N009', [
    F('px_nola_drone_hospital_levee_lake', { over: [head('THE TRAP', 'trap', 200, 110, Yc)] }),
    F('cm_west_closure_complex_discharge', { cutW: 'harder', over: [note('PUMPS AT WORK, 2023')] }),
  ]);

  // ===== CH2 =====
  chapter('N010', 1, 'The pumps from 1915');
  beats('N010', [
    F('cm_baldwin_wood_station_dedication_1915', { over: [low('A. BALDWIN WOOD, 1915', 'Albert'), note('DEDICATION OF A WOOD PUMP STATION, 1915')] }),
    F('cm_wood_screw_pump_patent_drawing', { cutW: 'screw', over: [note("WOOD'S SCREW PUMP, PATENT DRAWING")] }),
    F('cm_wood_screw_pump_patent_sheet2', { cutW: 'Dutch' }),
  ]);
  beats('N010B', [
    F('cm_swb_cover_bourbon_street', { over: [note('SEWERAGE & WATER BOARD COVER, BOURBON STREET')] }),
    S('raintolake', { cutW: 'fifteen' }),
  ]);
  beats('N010C', [
    F('cm_felicity_street_flooded_2023', { over: [low('ABOUT ½ INCH OF RAIN AN HOUR', 'half'), note('FELICITY STREET AFTER HEAVY RAIN, 2023')] }),
    F('cm_cars_on_neutral_ground_flood_threat', { cutW: 'streets', over: [note('CARS PARKED ON THE RAISED MEDIAN TO ESCAPE FLOODING')] }),
  ]);
  beats('N011', [F('cm_pumping_station_1_broad', { over: [low('THE BIGGEST PUMPS: 14 FT ACROSS', 'fourteen'), note('DRAINAGE PUMPING STATION NO. 1')] })]);
  beats('N012', [
    F('cm_broad_pumping_station_2018', { over: [cnt('Fifty-one', 51, { suf: ' OF 120', label: 'PUMPS RUN ON 25 HZ POWER' })] }),
  ]);
  beats('N013', [
    F('cm_orleans_avenue_canal_pumping_station', { over: [low('AN OLD STANDARD', 'standard')] }),
    F('cm_sunrise_skyline_after_ida', { cutW: 'nineteen', over: [low('TURBINE 4: INSTALLED 1915', 'nineteen'), note('POWER OUT AFTER HURRICANE IDA, 2021')] }),
    F('nasa_new_orleans_blackout_after_ida', { cutW: 'December', over: [low('RETIRED AFTER A NEW PLANT OPENED, DEC 2025', 'retire')] }),
  ]);
  beats('N014', [
    F('cm_banks_street_kayakers_flood_2019', { kb: { z: [1.3, 1.1] }, over: [note('STREET FLOODING, 2019')] }),
    F('cm_cars_on_neutral_ground_flood_threat', { cutW: 'August', kb: { z: [1.35, 1.15], x: [0.4, 0.5] }, over: [low('AUGUST 2017: 8–9 INCHES IN A FEW HOURS', 'eight'), note('A FLOODED NEW ORLEANS STREET (ANOTHER STORM)')] }),
    F('cm_felicity_street_flooded_2023', { cutW: 'water', kb: { z: [1.3, 1.1] } }),
  ]);
  beats('N014B', [
    F('gov_katrina_flooded_neighbourhood_aerial', { over: [head('THE FLOOD THAT CAME THROUGH THE WALLS', 'walls', 200, 80, Yc), note('NEW ORLEANS, 2005')] }),
  ]);

  // ===== CH3 =====
  chapter('N015', 2, 'The river that wants to leave');
  beats('N015', [F('cm_ship_crescent_city_connection_levee', { over: [note('THE MISSISSIPPI AT NEW ORLEANS')] })]);
  beats('N016', [
    F('ia_valley_meander_cutoff_map', { over: [note('1950s US ARMY CORPS FILM: HOW THE RIVER MOVES')] }),
    F('nasa_atchafalaya_delta_1973_2016_fast', { cutW: 'Atchafalaya', over: [low('THE ATCHAFALAYA: A SHORTER, STEEPER PATH', 'Atchafalaya'), note('LANDSAT, 1973–2016')] }),
  ]);
  beats('N017', [
    F('cm_atchafalaya_basin_swamp', { over: [low('1850: LESS THAN 10%', 'tenth'), note('ATCHAFALAYA BASIN')] }),
    st('nineteen', '1950: THE ATCHAFALAYA TOOK', [{ v: 30, from: 30, suf: '%', label: "OF THE MISSISSIPPI'S WATER", at: 0.3, cnt: 0.2, size: 240 }], 'Source: Loyola Univ. LUCEC; US Army Corps of Engineers', { img: 'cm_atchafalaya_delta_aerial', dark: 0.62 }),
  ]);
  beats('N018', [
    F('px_riverfront_sunset_cbd', { over: [low('DRINKING WATER · PORT · CHEMICAL PLANTS', 'drinking')] }),
    F('cm_river_road_levee_1992', { cutW: 'chemical', over: [note('LEVEE AND REFINERY, RIVER ROAD, 1992')] }),
  ]);
  beats('N018B', [
    F('px_towboat_barges_mississippi_aerial', { over: [low('2023: SALT WATER CREEPS UP THE RIVER', 'Salt')] }),
    F('nasa_delta_turquoise_plume_iss_2025', { cutW: 'September', over: [note('THE MISSISSIPPI DELTA FROM SPACE, 2025')] }),
    F('cm_sandbagging_back_levee_plaquemines', { cutW: 'Downriver', over: [low('PLAQUEMINES PARISH: 200+ DAYS', 'two'), note('PLAQUEMINES PARISH (ARCHIVE PHOTO)')] }),
  ]);
  beats('N019', [
    F('cm_old_river_control_complex_aerial', { over: [low('1963: OLD RIVER CONTROL STRUCTURE', 'Old')] }),
    S('riversplit', { cutW: 'Keep' }),
  ]);
  beats('N020', [
    F('cm_old_river_discharge_2011', { over: [low('1973: IT NEARLY BROKE', 'broke'), note('THE STRUCTURE IN THE 2011 FLOOD')] }),
    F('cm_old_river_structures_from_air_2011', { cutW: 'held', over: [note('2011')] }),
    F('cm_old_river_auxiliary_structure', { cutW: 'second', over: [low('1986: A SECOND STRUCTURE', 'second')] }),
  ]);

  // ===== CH4 =====
  chapter('N021', 3, 'The towns they flooded on purpose');
  beats('N021', [F('ia_1927_drowned_landscape', { over: [note('1927 FLOOD (US ARMY SIGNAL CORPS FILM)')] })]);
  beats('N022', [
    F('ia_1927_crevasse_water_past_houses', { over: [low('1927: ONE OF THE WORST US FLOODS', 'worst')] }),
    F('cm_1927_caernarvon_dynamite_blast', { cutW: 'Caernarvon', over: [note('CAERNARVON, 1927')] }),
    F('cm_1927_caernarvon_levee_blown', { cutW: 'thirty-nine', over: [cnt('thirty-nine', 39, { suf: ' TONS', label: 'OF DYNAMITE' })] }),
    F('ia_1927_refugees_belongings_levee', { cutW: 'About', over: [low('~10,000 PEOPLE HAD TO LEAVE', 'thousand'), note('1927 FLOOD REFUGEES (SIGNAL CORPS FILM)')] }),
  ]);
  beats('N023', [
    F('ia_1927_rescue_boat_crowded', { over: [low('PROMISED FULL COMPENSATION', 'promised')] }),
    F('cm_1927_crevasse_junior', { cutW: 'blast', over: [low('LEVEES BROKE UPRIVER ON THEIR OWN', 'broke'), note('A 1927 CREVASSE UPRIVER, JUNIOR, LOUISIANA')] }),
  ]);
  beats('N024', [
    F('cm_bonnet_carre_open_2016_a', { over: [low('BONNET CARRÉ SPILLWAY', 'Bonnet'), note('OPEN, JANUARY 2016')] }),
    F('cm_bonnet_carre_open_bw', { cutW: 'used', over: [note('HISTORIC OPENING (US ARMY CORPS PHOTO)')] }),
    F('cm_bonnet_carre_open_2016_b', { cutW: 'three', over: [low('2018 · 2019 · 2020', 'three')] }),
    F('cm_bonnet_carre_crowds_bw', { cutW: 'twice', over: [low('2019: OPENED TWICE IN ONE YEAR', 'twice'), note('CROWDS AT AN EARLIER OPENING')] }),
  ]);

  // ===== CH5 =====
  chapter('N025', 4, 'Through the walls');
  beats('N025', [F('nasa_katrina_progression_satellite', { over: [head('2005', null, 200, 120, Yc)] })]);
  beats('N025A', [
    F('cm_17th_street_canal_breach_aerial', { over: [low('THE 17TH STREET CANAL', '17th'), note('AERIAL, 2005')] }),
    F('cm_fema_17th_street_breach_aug29', { cutW: 'water', over: [low("THE WATER HADN'T REACHED THE TOP", 'reached'), note('FEMA, 29 AUGUST 2005')] }),
  ]);
  beats('N025B', [
    F('gov_katrina_canal_floodwall_flooded_homes', { in: 5, over: [low('50 MAJOR BREACHES', 'fifty')] }),
    S('iwall', { cutW: 'four' }),
    F('cm_london_canal_breach_sand_2005', { cutW: 'ground', over: [note('LONDON AVENUE CANAL BREACH SITE, NOV 2005')] }),
  ]);
  beats('N025C', [F('gov_katrina_flooded_streets_wide', { over: [cnt('eighty', 80, { suf: '%', label: 'OF THE CITY FLOODED' })] })]);
  beats('N025C1', [
    F('gov_katrina_flooded_city_cbd_smoke', { over: [note('NEW ORLEANS, SEPTEMBER 2005')] }),
    F('nasa_katrina_new_orleans_flooded_landsat', { cutW: 'six', over: [low('~6 WEEKS TO PUMP THE CITY DRY', 'six')] }),
    F('gov_katrina_superdome_damaged_roof', { cutW: 'Louisiana', over: [low('LOUISIANA: MORE THAN 1,000 DEAD', 'thousand')] }),
  ]);
  beats('N025C2', [F('cm_lower_ninth_ward_damage', { over: [low('TODAY: ~25% FEWER PEOPLE THAN IN 2000', 'quarter'), note('LOWER NINTH WARD')] })]);
  beats('N025D', [F('cm_fema_17th_street_breach_repair', { over: [low('THE ARMY CORPS TOOK RESPONSIBILITY', 'responsibility'), note('EMERGENCY REPAIR, SEPT 2005')] })]);
  beats('N025E', [
    F('cm_ihnc_surge_barrier_construction_aerial', { over: [note('SURGE BARRIER UNDER CONSTRUCTION, EAST OF THE CITY')] }),
    F('cm_ihnc_sector_gate_installation_2011', { cutW: 'gates', over: [note('INSTALLING A GIANT GATE, 2011')] }),
    F('cm_west_closure_complex_pumps_running', { cutW: 'West', over: [low('WEST CLOSURE COMPLEX', 'West')] }),
    st('fourteen', 'THE NEW WALL AROUND THE BOWL', [{ pre: '$', v: 14.5, from: 14.5, dec: 1, suf: ' BILLION', label: 'LEVEES · FLOODWALLS · GATES · PUMPS', at: 0.3, cnt: 0.2, size: 210 }], 'Source: US Army Corps of Engineers', { img: 'cm_fema_17th_street_canal_levees_2008', dark: 0.62 }),
  ]);
  beats('N026', [
    F('gov_wslp_levee_construction_aerial', { over: [low('THE NEW WALLS ARE SINKING TOO', 'sinking'), note('LEVEE WORK WEST OF THE CITY, 2025')] }),
    F('cm_carrollton_levee_high_river_2009', { cutW: 'original', over: [low('DESIGNED FOR 1 FT OF SEA-LEVEL RISE · NOW ~1.8 FT', 'one')] }),
    F('cm_carrollton_levee_top_2007', { cutW: 'twenty', over: [low('2021 PLAN: $3.2B TO RAISE ~115 MILES', 'three-point-two-billion-dollar')] }),
  ]);

  // ===== CH6 =====
  chapter('N027', 5, 'Why not stop pumping?');
  beats('N027', [F('px_nola_drone_sunset_skyline_industrial')]);
  beats('N028', [
    F('cm_aerial_new_orleans_east_2019', { kb: { z: [1.3, 1.1] }, over: [low('WELLS STOPPED · THE GROUND ROSE A LITTLE', 'risen'), note('NEW ORLEANS EAST')] }),
    F('cm_17th_street_pccp_wet_test_2025', { cutW: 'other', over: [head('RAIN PUMPING CAN NEVER STOP', 'never', 200, 86, Yc)] }),
  ]);
  beats('N028B', [F('cm_water_meter_cover_crescent', { over: [low('LEAKING PIPES: HIDDEN DRAINS', 'leaking')] })]);
  beats('N029', [
    F('px_nola_drone_rooftops_sunset_flat', { in: 6 }),
    S('bowl', { cutW: 'Switch', hold: 1, title: 'SWITCH OFF THE PUMPS, AND THE BOWL FILLS' }),
  ]);
  beats('N030', [
    F('cm_isle_de_jean_charles_stilt_house', { over: [low('DELTA FARMS: LEVEE BROKE IN 1961 AND 1971', 'Delta'), note('COASTAL LOUISIANA (NOT DELTA FARMS)')] }),
    F('nasa_louisiana_wetlands_1985_2024_landsat', { cutW: 'open', over: [head('TODAY: OPEN WATER', 'open', 200, 90, Yc), note('LANDSAT: LOUISIANA MARSH TURNING TO WATER, 1985–2024')] }),
  ]);

  // ===== ENDING =====
  chapter('N031', 6, 'The answer');
  beats('N031', [
    F('cm_west_closure_complex_discharge'),
    F('cm_old_river_discharge_2011', { cutW: 'river', kb: { z: [1.25, 1.1] } }),
    F('cm_industrial_canal_floodwall_2011', { cutW: 'lives' }),
  ]);
  beats('N032A', [F('px_nola_drone_skyline_sunset_slow', { in: 8, over: [head('WHICH CITY SHOULD WE EXPLAIN NEXT?', null, 200, 80)] })]);
  beats('N032', [
    F('px_jackson_square_washington_artillery'),
    F('cm_french_quarter_from_hotel_river', { cutW: 'still' }),
    F('nasa_supermoon_over_mississippi_steamboat', { cutW: 'Every', over: [head('EVERY TIME IT RAINS, THE PUMPS SWITCH ON', 'Every', 200, 76, Yc)] }),
  ]);
  add(T.tl.voiceEnd + 0.4, S('endscreen', {}), 'fade');
  return out;
}
module.exports = { assets, build, defaultTrans: 'cut', splitOver: 4.5, splitTo: 3 };
