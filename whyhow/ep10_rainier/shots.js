// EP10 Mount Rainier — real footage: USGS, NPS, NASA, Wikimedia Commons, Pixabay; USGS model animations labelled; our own diagrams.
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
  const SIM = 'USGS COMPUTER MODEL, NOT REAL FOOTAGE';

  // ===== COLD OPEN =====
  beats('T001', [
    F('gov_usgs_lahar_drill_students_fairgrounds_2024', { over: [note('LAHAR EVACUATION DRILL, PUYALLUP, MARCH 2024')] }),
    F('gov_colombia_orting_drill_walk', { cutW: 'Thousands', over: [note('A LAHAR DRILL IN THE VALLEY (USGS VIDEO)')] }),
    F('gov_usgs_rainier_over_puyallup_valley_orting_a', { cutW: 'uphill', over: [low('UP TO 2 MILES, UPHILL', 'uphill')] }),
  ], { start: 0 });
  beats('T002', [
    F('ia_journey_rainier_paradise_flowers', { over: [head('MOUNT RAINIER', null, 200, 100)] }),
    F('cm_orting_street_rainier', { cutW: 'Orting', over: [low('ORTING, WASHINGTON', 'Orting')] }),
    F('cm_orting_volcano_evacuation_route_sign', { cutW: 'roughly', over: [cnt('forty', 40, { suf: ' MIN', label: 'AFTER THE ALARM', y: 520 })] }),
  ]);
  beats('T003', [F('cm_tahoma_heli_down_valley_a', { over: [head('NO ERUPTION NEEDED', 'eruption', 200, 100, Yc), note('DEBRIS-FLOW CHANNEL, TAHOMA CREEK, 2019')] })]);
  beats('T004', [
    F('px_rainier_over_lake_town', { over: [head('HOW DO YOU LIVE UNDER THIS?', 'live', 200, 90)] }),
    S('treerings', { cutW: 'forest', dur: 0.01 }),
  ]);
  add(T.e('T004') + 0.15, S('title', { lines: ['THE TOWN THAT', 'PRACTICES OUTRUNNING', 'MOUNT RAINIER'], hl: 2, img: 'gov_usgs_rainier_over_puyallup_valley_orting_b', credit: credit('gov_usgs_rainier_over_puyallup_valley_orting_b'), brand: true }), 'cut');

  // ===== CH1 (no card) =====
  beats('T005', [
    F('ia_sunrise_rainier_from_burroughs', { over: [low('14,410 FT · HIGHEST IN THE CASCADES', 'fourteen')] }),
    F('nasa_iss056_rainier_from_space_2018', { cutW: 'carries', over: [low('THE MOST GLACIATED PEAK IN THE LOWER 48', 'glacier'), note('FROM THE SPACE STATION, 2018')] }),
  ]);
  beats('T006', [
    F('px_rainier_rocky_face_closeup', { over: [low('ACIDIC WATER EATS THE ROCK', 'eating')] }),
    F('cm_nps_tahoma_debris_wall_crack_2015', { cutW: 'soft', over: [note('LOOSE, WEAK ROCK ON THE WEST SIDE (2015)')] }),
    F('px_rainier_west_face_blue', { cutW: 'Surveys', over: [low('WORST ON THE UPPER WEST SIDE', 'west')] }),
  ]);
  beats('T007', [
    F('ia_carbon_icefall_avalanche', { over: [note('ICE AVALANCHE ON RAINIER')] }),
    F('ia_dclaw_sim_lahar_descends', { cutW: 'lahar', over: [low('A LAHAR: MUD, BOULDERS, TREES', 'lahar'), note(SIM)] }),
  ]);
  beats('T008', [
    F('ia_dclaw_sim_tahoma_headwall', { over: [low('100+ MPH ON THE UPPER SLOPES', 'hundred'), note(SIM)] }),
    F('cm_tahoma_heli_downstream_braids', { cutW: 'Down', over: [low('15–20 MPH IN THE VALLEYS', 'fifteen'), note('DEBRIS-FLOW DEPOSITS, 2019')] }),
  ]);
  beats('T009', [
    F('px_seattle_space_needle_rainier', { over: [low('ASH USUALLY BLOWS EAST', 'east')] }),
    F('ia_flood_river_past_boulders', { cutW: 'killer', over: [head('THE KILLER IS THE MUD', 'mud', 200, 96, Yc)] }),
  ]);
  beats('T009B', [
    F('cm_seattle_rainier_1880s', { over: [low('1894: "BLACK SMOKE"?', 'eighteen'), note('SEATTLE, 1880s')] }),
    F('cm_rainier_summit_crater_aerial', { cutW: 'last', over: [low('LAST FRESH MAGMA: ~1,000 YEARS AGO', 'thousand')] }),
  ]);

  // ===== CH2 =====
  chapter('T010', 1, 'Cities built on old mud');
  beats('T010', [
    F('cm_usgs_osceola_collapse_map', { over: [note('USGS MAP: THE SCAR OF THE SUMMIT COLLAPSE')] }),
    F('ia_peace_rainier_lenticular_valley', { cutW: 'wet', over: [low('~5,600 YEARS AGO: THE OSCEOLA MUDFLOW', 'Osceola')] }),
  ]);
  beats('T011', [
    F('cm_usgs_map_osceola_electron_mudflows', { over: [low('330+ FT DEEP · 75+ MILES', 'three'), note('USGS MAP OF THE OLD MUDFLOWS')] }),
    F('cm_aerial_enumclaw_auburn_plateau', { cutW: 'valley', over: [low('THIS VALLEY WAS ONCE SEA', 'arm'), note('THE VALLEY BETWEEN ENUMCLAW AND AUBURN TODAY')] }),
  ]);
  beats('T013', [
    F('cm_usgs_rainier_hazard_map_jpg', { over: [low('11+ BIG LAHARS IN 6,000 YEARS', 'eleven'), note('USGS HAZARD MAP')] }),
    F('cm_amtrak_puyallup_rainier_2025', { cutW: 'In', over: [cnt('seven', 7, { pre: '1 IN ', label: 'IN AN AVERAGE LIFETIME (USGS, 2002)', y: 500 })] }),
  ]);
  beats('T014', [
    F('px_rainier_over_lake_boats', { over: [cnt('ninety', 90000, { pre: '~', label: 'PEOPLE LIVE IN THE LAHAR ZONES', y: 500 })] }),
    F('cm_sumner_main_street_shops', { cutW: 'Sumner', over: [note('SUMNER')] }),
  ]);
  beats('T014B', [
    F('cm_puyallup_rainier_over_highway', { over: [low('PUYALLUP: THE MOST PEOPLE AT RISK', 'most'), note('PUYALLUP')] }),
    F('cm_orting_washington_street', { cutW: 'Orting', over: [low('ORTING: MOST OF THE TOWN IS IN THE ZONE', 'worst'), note('DOWNTOWN ORTING')] }),
  ]);

  // ===== CH3 =====
  chapter('T015', 2, 'The forest under Orting');
  beats('T015', [F('cm_orting_fields_rainier', { over: [low('1993: STUMPS, STILL STANDING UPRIGHT', 'upright'), note('ORTING')] })]);
  beats('T016', [
    F('cm_orting_high_school', { over: [note('ORTING HIGH SCHOOL')] }),
    F('ia_climate_tahoma_dead_trees_valley', { cutW: 'Douglas', over: [low('DOUGLAS FIRS UP TO 10 FT WIDE', 'Douglas'), note('TREES KILLED BY A DEBRIS FLOW IN THE PARK (NOT ORTING)')] }),
    F('ia_climate_tahoma_valley_logs_rainier', { cutW: 'wide', over: [note('TAHOMA CREEK, IN THE NATIONAL PARK')] }),
  ]);
  beats('T017', [
    F('cm_usgs_map_osceola_electron_mudflows', { kb: { z: [1.5, 1.7], x: [0.4, 0.4], y: [0.5, 0.5] }, over: [low('THE ELECTRON MUDFLOW', 'Electron'), note('USGS MAP')] }),
    F('cm_orting_foothills_trail_rainier', { cutW: 'By', over: [low('BURIED UP TO 15 FT DOWN', 'fifteen')] }),
  ]);
  beats('T018', [
    F('px_rainier_trees_foreground', { over: [low('21 BURIED TREES', 'twenty-one')] }),
    S('treerings', { cutW: 'Four', dur: 3 }),
  ]);
  beats('T019', [
    F('px_rainier_west_face_blue', { kb: { z: [1.3, 1.15] }, over: [head('NO ERUPTION', 'eruption', 200, 110, Yc)] }),
    F('ia_dclaw_sim_sunset_amphitheater', { cutW: 'landslide', over: [low('A LANDSLIDE ON THE WEST SIDE', 'landslide'), note(SIM)] }),
    F('ia_peace_fog_forest', { cutW: 'Puyallup', over: [low('PUYALLUP TRIBE: OLD STORIES OF A BURIED VALLEY', 'stories')] }),
  ]);

  // ===== CH4 =====
  chapter('T021', 3, 'Forty minutes');
  beats('T021', [
    F('gov_colombia_ruiz_summit_aerial', { over: [low('1985: NEVADO DEL RUIZ, COLOMBIA', 'Nevado'), note('USGS PHOTO')] }),
    F('gov_colombia_ruiz_valley_aerial', { cutW: 'About', over: [note('A VALLEY BELOW NEVADO DEL RUIZ (USGS VIDEO)')] }),
    F('gov_colombia_armero_mudplain_photo', { cutW: 'Armero', over: [note('WHERE ARMERO STOOD (USGS)')] }),
    F('ia_dclaw_valley_town_view', { cutW: 'just', over: [note('A VALLEY TOWN BELOW RAINIER TODAY')] }),
    F('gov_colombia_armero_mud_filled_ruin', { cutW: 'twenty-three', over: [cnt('twenty-three', 23000, { pre: '~', label: 'DEAD IN ARMERO', y: 500 }), note('A RUIN IN ARMERO, STILL FULL OF MUD')] }),
    F('gov_colombia_armero_mudplain_photo', { cutW: 'hazard', kb: { z: [1.35, 1.15] }, over: [note('WHERE ARMERO STOOD')] }),
    F('gov_colombia_lagunilla_lahar_path_captions', { cutW: 'night', over: [low('THE WARNING NEVER ARRIVED', 'nobody'), note('THE VALLEY THE LAHARS FOLLOWED TO ARMERO')] }),
  ]);
  beats('T022', [F('gov_usgs_lahar_station_install_montage', { over: [low('1998: A LAHAR DETECTION SYSTEM', 'nineteen'), note('USGS: INSTALLING LAHAR STATIONS')] })]);
  beats('T023', [
    F('gov_usgs_lahar_station_pr05_rainier_2020', { over: [low('TRIPWIRES AND SENSORS', 'tripwires')] }),
    F('gov_usgs_station_para_seismic_infrasound_2020', { cutW: 'twenty-five', over: [low('25 NEW SEISMIC STATIONS', 'twenty-five')] }),
    F('ia_dclaw_scientist_computer', { cutW: 'Their', }),
    F('ia_dclaw_rainier_over_city', { cutW: 'centers', over: [low('~10 SECONDS TO EMERGENCY CENTERS', 'ten'), low('2 WARNING POINTS, STAFFED 24/7', 'staffed')] }),
  ]);
  beats('T024', [
    F('gov_colombia_lahar_warning_test_sign_siren', { over: [low('SIRENS IN THE VALLEY TOWNS', 'sirens')] }),
    F('gov_colombia_rainier_over_valley_farms', { cutW: 'forty', over: [low('40 MIN TO 3 HOURS OF WARNING', 'three')] }),
    F('cm_orting_street_rainier_2009', { cutW: 'Orting', over: [note('ORTING')] }),
  ]);
  beats('T025', [S('laharmap', { dur: 7 })]);
  beats('T025B', [
    F('ia_dclaw_sim_orting_inundation', { over: [low('SENSORS NEED A FEW MINUTES', 'Sensors'), note(SIM)] }),
    F('cm_orting_volcano_evacuation_route_sign', { cutW: 'forty', kb: { z: [1.3, 1.15] }, over: [low('ORTING: ABOUT 40 MINUTES', 'forty')] }),
  ]);
  beats('T025C', [
    F('ia_dclaw_sim_sumner_puyallup', { over: [low('NOT A 30-FT WALL', 'Forget'), note(SIM)] }),
    F('cm_nps_tahoma_flood_trim_lines_2019', { cutW: 'thirteen', over: [low('~13 FT DEEP · ~9 MPH AT ORTING (MODEL)', 'thirteen'), note('REAL DEBRIS-FLOW MARKS ON TREES, TAHOMA CREEK, 2019')] }),
  ]);
  beats('T026', [
    F('cm_orting_sr162_east_rainier_a', { over: [head("WALK. DON'T DRIVE.", 'Walk', 200, 110, Yc)] }),
    F('gov_usgs_rainier_over_puyallup_valley_orting_a', { cutW: 'Roads', kb: { z: [1.25, 1.1] }, over: [low('100+ FT ABOVE THE VALLEY FLOOR', 'hundred')] }),
  ]);
  beats('T027', [F('gov_usgs_lahar_drill_students_fairgrounds_2024', { kb: { z: [1.3, 1.1] }, over: [cnt('forty-five', 45000, { suf: '+', label: "THE WORLD'S LARGEST LAHAR DRILL, 2024", y: 500 })] })]);
  beats('T028', [F('cm_orting_middle_school', { over: [low('2006: 25 MIN TO GET HALFWAY', 'twenty-five'), note('ORTING MIDDLE SCHOOL')] })]);
  beats('T029', [
    F('cm_orting_sr162_east_rainier_b', { over: [low('THE HIGHWAY BETWEEN TOWN AND THE HILLS', 'highway'), note('STATE ROUTE 162, ORTING')] }),
    F('cm_orting_sr162_east_rainier_a', { cutW: 'Construction', kb: { z: [1.3, 1.15] }, over: [low('"BRIDGE FOR KIDS": BUILDING SINCE 2025', 'Construction'), note('STATE ROUTE 162, ORTING')] }),
    F('cm_orting_sr162_bridge_puyallup_river', { cutW: 'second', over: [low('RIVER BRIDGE: NO FUNDING YET', 'money'), note('THE RIVER BRIDGE AT ORTING TODAY')] }),
  ]);
  beats('T030', [
    F('gov_usgs_rainier_puyallup_daffodil_field_1989', { kb: { z: [1.2, 1.1] }, over: [note('PUYALLUP (USGS PHOTO, 1989)')] }),
    S('stats', { cutW: 'county', head: 'PIERCE COUNTY, MAY 2023', items: [], over: [at(head('"THERE IS NO LAHAR."', null, 520, 120, Yc), 0.3), { ...chipC('AN OLD SIREN WENT OFF BY MISTAKE', null, 700, 50), at: 0.8 }], source: 'Recreated text. Source: Pierce County Emergency Management' }),
  ]);
  beats('T030B', [
    F('gov_colombia_lahar_warning_test_sign_siren', { in: 1.2, over: [low('MONTHLY TEST: A CHIME, NOT THE ALARM', 'chime')] }),
    F('px_siren_pole_generic', { cutW: 'real', kb: { z: [1.05, 1.2] }, over: [note('ILLUSTRATIVE SIREN, NOT PIERCE COUNTY')] }),
  ]);

  // ===== CH5 =====
  chapter('T031', 4, 'The question nobody can answer');
  beats('T031', [F('ia_westside_cloudy_valley')]);
  beats('T032', [
    F('ia_dclaw_sim_nisqually_alder', { over: [low('THE LAHAR REACHES ALDER LAKE IN ~50 MIN', 'fifty'), note(SIM)] }),
    F('ia_dclaw_sim_alder_dam_3d', { cutW: 'pushes', over: [low('WATER OVER THE 330-FT DAM', 'pour'), note(SIM)] }),
    F('ia_journey_river_rainier_behind', { cutW: 'What', over: [low('AFTER THAT: UNKNOWN', 'model')] }),
  ]);
  beats('T032B', [
    F('cm_sumner_white_river_from_bridge_2022', { over: [note('THE WHITE RIVER IN SUMNER')] }),
    F('cm_mud_mountain_lake_filled', { cutW: 'nineteen-oh-six', over: [low('1906: A LOGJAM TURNED THE RIVER SOUTH', 'logjam'), note('WHITE RIVER FLOODWATER, MUD MOUNTAIN DAM')] }),
  ]);
  beats('T033', [
    F('ia_emmons_winthrop_timelapse', { over: [low('SINCE 1896: ~HALF THE GLACIER ICE GONE', 'half'), note('TIME-LAPSE, EMMONS GLACIER (NPS)')] }),
    F('cm_nisqually_glacier_ice_wall_1895', { cutW: 'One', over: [note('NISQUALLY GLACIER, 1895')] }),
  ]);
  beats('T034', [
    F('cm_tahoma_heli_gorge', { over: [low('TAHOMA CREEK: ~35 DEBRIS FLOWS SINCE 1967', 'thirty-five')] }),
    F('ia_westside_cyclists_gravel_road', { cutW: 'road', over: [low('CLOSED TO CARS SINCE THE 1980s', 'closed'), note('THE WESTSIDE ROAD TODAY')] }),
  ]);
  beats('T035', [
    F('gov_usgs_rainier_swarm_2025_map', { over: [low('JULY 2025: ~1,350 SMALL QUAKES', 'thirteen'), note('USGS MAP OF THE 2025 SWARM')] }),
    F('gov_usgs_seismometer_para_install_2020', { cutW: 'Scientists', over: [low('HOT FLUIDS, NOT MAGMA · ALERT LEVEL: NORMAL', 'fluids')] }),
  ]);

  // ===== ENDING =====
  chapter('T036', 5, 'The answer');
  beats('T036', [
    F('ia_peace_rainier_people_road'),
    F('gov_colombia_orting_drill_walk', { cutW: 'teach', in: 2 }),
    F('gov_usgs_rainier_over_puyallup_valley_orting_b', { cutW: 'build' }),
  ]);
  beats('T037A', [F('px_rainier_sunset_over_water', { over: [head('WHICH PLACE SHOULD WE EXPLAIN NEXT?', null, 200, 80)] })]);
  beats('T037', [
    F('cm_orting_last_light_rainier_red_barn'),
    S('treerings', { cutW: 'fifteen-oh-seven', dur: 0.01 }),
    F('px_rainier_alpenglow_over_field', { cutW: 'every', over: [head('NEXT TIME, THE PEOPLE WILL BE GONE', 'gone', 200, 80, Yc)] }),
  ]);
  add(T.tl.voiceEnd + 0.4, S('endscreen', {}), 'fade');
  return out;
}
module.exports = { assets, build, defaultTrans: 'cut', splitOver: 4.5, splitTo: 3 };
