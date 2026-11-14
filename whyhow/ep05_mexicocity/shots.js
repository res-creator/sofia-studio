// EP05 Mexico City — mostly real Mexico City footage/photos (Pixabay, Coverr, Wikimedia Commons, NASA), a new picture every ~2–4 s.
const fs = require('fs'), path = require('path');
const MF = JSON.parse(fs.readFileSync(path.join(__dirname, 'footage/manifest.json')));
const FT = Object.fromEntries(MF.map(x => [x.key, x]));
const assets = {}; for (const x of MF) if (x.type === 'photo') assets[x.key] = 'footage/' + x.key + '.jpg';
const credit = k => { const f = FT[k]; if (!f || !f.attribution) return ''; if (f.source === 'pixabay' || f.source === 'coverr') return ''; return f.source === 'nasa' ? f.attribution.split(';')[0] : (f.type === 'video' ? 'Video: ' : 'Photo: ') + f.attribution; };
const C = n => require('../atlaskit/core').C[n];
const MX = { lon: -99.13, lat: 19.43 };
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
  beats('M001', [
    F('cv_drone_topdown_golden_angel', { over: [low('THE ANGEL OF INDEPENDENCE · MEXICO CITY', 'Angel')] }),
    F('cm_angel_inauguration_1910', { over: [low('1910: NINE STEPS TO THE BASE', 'nine')] }),
    F('px_angel_column_sky_clouds'),
  ], { start: 0 });
  beats('M002', [
    F('px_angel_column_towers', { over: [chipC('TODAY: +14 STEPS', 'fourteen', 900, 70)] }),
    F('cm_angel_night_traffic', { over: [low('THE COLUMN STANDS ON DEEP FOUNDATIONS', 'foundations')] }),
    F('px_vertical_drone_angel_reforma', { over: [head('THE CITY AROUND IT SANK', 'sank', 200, 100, '#FFC857')] }),
  ]);
  beats('M003', [
    F('px_drone_sunrise_haze_over_city', { over: [head('ONE OF THE FASTEST-SINKING CITIES ON EARTH', null, 200, 76)] }),
    F('cm_nisar_subsidence_map_pia26709', { over: [{ type: 'note', text: 'NASA–ISRO NISAR RADAR · OCT 2025 – JAN 2026', x: 60, y: 70, at: 0.3 }, low('UP TO ~50 CM A YEAR IN PLACES', 'half')] }),
  ]);
  beats('M004', [
    S('compare', { title: 'HOW FAST THE GROUND SINKS (CM PER YEAR)', zeroY: 900, scale: 13, unit: ' cm', items: [{ label: 'VENICE', v: 0.25, dec: 2, at: 0.4 }, { label: 'MEXICO CITY (WORST AREAS)', v: 50, hl: true, at: 1.2 }], note: '100× FASTER, AND MORE', noteW: 'faster', source: 'Sources: Zanchettin et al. 2021; Chaussard et al. 2021' }),
    F('px_night_drone_endless_city_lights', { over: [{ type: 'count', from: 0, to: 20, pre: '>', suf: ' MILLION', label: 'PEOPLE', y: 520, w: 'twenty' }] }),
    F('cm_madero_eje_central_topdown_slowmo', { over: [head('WHY IS IT FALLING INTO THE GROUND?', 'falling', 200, 80)] }),
  ]);
  add(T.e('M004') + 0.15, S('title', { lines: ['THE CITY SINKING', 'FASTER THAN', 'VENICE'], hl: 2, img: 'cm_casa_camilos_sunken_below_sidewalk', credit: credit('cm_casa_camilos_sunken_below_sidewalk'), brand: true }), 'cut');

  // ===== CH1 =====
  chapter('M005', 1, 'A city built on a lake');
  beats('M005', [F('cm_rugendas_valley_texcoco_lake', { over: [low('700 YEARS AGO: A LAKE', 'water')] })]);
  beats('M006', [
    S('globe', { lon: [[0, -90], [4, -99.1]], lat: [[0, 25], [4, 19.4]], R: [[0, 700], [4.5, 3000]], pins: [{ ...MX, label: 'MEXICO CITY', sub: '2,240 M HIGH · RING OF MOUNTAINS', at: 1.2 }] }),
    F('cm_map_lake_texcoco_1519', { over: [low('LAKE TEXCOCO · AN ISLAND IN THE MIDDLE', 'island')] }),
    F('cm_painting_tenochtitlan_on_lake', { over: [low('TENOCHTITLAN · FOUNDED c. 1325', 'Tenochtitlan')] }),
    F('nasa_iss_volcanoes_east_of_mexico_city_2026', { over: [low('MOUNTAINS AND VOLCANOES ALL AROUND', 'volcanoes')] }),
  ]);
  beats('M007', [
    F('cm_map_tenochtitlan_1524_nuremberg', { over: [low('CAUSEWAYS TO THE SHORE', 'causeways'), { type: 'note', text: 'MAP OF TENOCHTITLAN, NUREMBERG 1524', x: 60, y: 70, at: 0.3 }] }),
    F('cm_xochimilco_boatman_poling', { over: [low('CANALS INSTEAD OF STREETS', 'canals')] }),
    F('cm_chinampa_structure_trees', { over: [low('CHINAMPAS · FLOATING GARDENS', 'chinampas')] }),
    F('cm_tenochtitlan_3d_reconstruction', { over: [low('ONE OF THE LARGEST CITIES IN THE WORLD', 'largest', 'DIGITAL RECONSTRUCTION')] }),
  ]);
  beats('M007B', [
    F('cm_tenochtitlan_model_mural', { over: [low('1519: THE SPANISH ARRIVE', 'nineteen')] }),
    F('cm_map_tenochtitlan_gulf_1524', { over: [low('"LIKE A BOOK OF ENCHANTMENTS"', 'enchantments', '— BERNAL DÍAZ DEL CASTILLO')] }),
    F('cm_velasco_valley_santa_isabel', { over: [low('"…WAS IT ALL A DREAM?"', 'dream')] }),
  ]);
  beats('M008', [
    F('cm_cathedral_zocalo_engraving_1880', { over: [low('1521: A SPANISH CAPITAL ON TOP OF THE RUINS', 'conquered')] }),
    F('px_national_palace_panorama'),
    F('cm_casimiro_castro_valley_from_chapultepec_1850', { over: [low("…BUT THEY DIDN'T LIKE THE LAKE", 'lake')] }),
  ]);
  beats('M009', [
    F('cm_bellin_map_1754_mexico_city_lakes', { over: [low('NO OUTLET TO THE SEA', 'outlet')] }),
    F('px_bellas_artes_rain_reflection', { over: [low('THE CITY FLOODED AGAIN AND AGAIN', 'flooded')] }),
    F('cm_map_valley_of_mexico_1850', { over: [low('CANALS AND TUNNELS THROUGH THE MOUNTAINS', 'tunnels')] }),
  ]);
  beats('M009B', [
    F('cm_velasco_valle_de_mexico_1877', { over: [low('1629: THE GREAT FLOOD', 'sixteen')] }),
    S('stats', { head: 'THE FLOOD OF 1629', items: [{ pre: '~', v: 5, suf: ' YEARS', label: 'PARTS OF THE CITY UNDER WATER', at: 0.4, size: 240 }], source: 'Sources: Encyclopedia.com; MDPI Land 2022' }),
    F('cm_xochimilco_pov_from_trajinera', { over: [low('PEOPLE MOVED AROUND BY CANOE', 'canoes')] }),
  ]);
  beats('M010', [
    F('cm_map_valley_1519_lakes', { over: [low('THE LAKE DISAPPEARED', 'disappeared')] }),
    F('nasa_sts62_mexico_city_basin_1994', { over: [{ type: 'note', text: 'THE VALLEY OF MEXICO FROM SPACE · NASA, 1994', x: 60, y: 70, at: 0.3 }, low('THE CITY SPREAD ACROSS THE LAKEBED', 'spread')] }),
    F('px_aerial_roofs_dense_neighbourhood', { over: [head("NOT ROCK. THE BOTTOM OF A LAKE.", 'rock', 200, 86, '#FFC857')] }),
  ]);

  // ===== CH2 =====
  chapter('M011', 2, 'Why the ground sinks');
  beats('M011', [F('px_bw_rooftops_dense_city', { over: [low('UNDER THE CITY: SOFT LAKE CLAY', 'clay')] }), F('cm_xochimilco_canal_chinampas_landscape', { over: [low('MOSTLY WATER — LIKE A SOAKED SPONGE', 'sponge')] })]);
  beats('M012', [
    F('cm_xochimilco_pipe_over_canal', { over: [low('BELOW THE CLAY: GROUNDWATER', 'aquifers')] }),
    S('stats', { head: "WHERE THE CITY'S WATER COMES FROM", items: [{ pre: '~', v: 60, suf: '%', label: 'PUMPED FROM UNDER ITS OWN STREETS', at: 0.4, size: 240 }], source: 'Source: NPR (2024); Conagua' }),
    F('px_drone_wide_avenue_traffic_buildings'),
  ]);
  beats('M013', [F('cm_aerial_sprawl_near_airport_0395', { over: [low('PUMP THE WATER OUT…', 'Pump')] }), F('px_rooftop_view_dense_city_skyline', { over: [low('…THE CLAY SHRINKS, THE CITY GOES DOWN', 'shrinks')] })]);
  beats('M014', [
    F('cm_usgs_building_rising_out_of_ground', { over: [low('ONCE SQUEEZED, IT NEVER SPRINGS BACK', 'spring')] }),
    F('cm_casa_camilos_sidewalk_step_down', { over: [head('THE SINKING IS PERMANENT', 'permanent', 200, 96, '#FFC857')] }),
  ]);
  beats('M015', [S('stats', { head: 'IN THE LAST CENTURY', items: [{ pre: '>', v: 12, suf: ' M', label: 'DROP IN PARTS OF THE CITY', at: 0.4, size: 260 }], source: 'Source: AP (2026)' }), F('px_torre_latino_sunset_skyline', { over: [low('THE HEIGHT OF A 4-STOREY BUILDING', 'four-storey')] })]);
  beats('M016', [
    F('nasa_iss_mexico_city_texcoco_voids_2025', { over: [low('2026: A NEW NASA–INDIA RADAR SATELLITE', 'radar')] }),
    F('cm_nisar_subsidence_map_figA', { over: [chipC('> 2 CM A MONTH IN SOME AREAS', 'month', 960, 56)] }),
  ]);
  beats('M016B', [
    F('cm_casa_camilos_street', { over: [low('PAVEMENTS TILT', 'Pavements')] }),
    F('cm_leaning_bell_tower_street', { over: [low('OLD BUILDINGS LEAN ON THEIR NEIGHBOURS', 'lean')] }),
    F('cm_angel_ceremony_1955_steps', { over: [low('NEW STEPS, AGAIN AND AGAIN', 'steps')] }),
  ]);

  // ===== CH3 =====
  chapter('M017', 3, 'The buildings that lean');
  beats('M017', [F('cm_la_santisima_corner', { over: [low('THE PROBLEM: SINKING UNEVENLY', 'unevenly')] }), F('cm_santa_veracruz_tower', { over: [low('ONE CORNER DROPS FASTER', 'corner')] })]);
  beats('M018', [
    F('cv_zocalo_sunrise_empty_cathedral', { over: [low('METROPOLITAN CATHEDRAL · ZÓCALO', 'Cathedral')] }),
    F('cm_cathedral_1910', { over: [low('BUILT FROM THE 1500s, ON AZTEC RUINS', 'ruins')] }),
    F('cm_cathedral_exterior_pan'),
  ]);
  beats('M018B', [F('px_templo_mayor_ruins_cathedral', { over: [low('THE TEMPLO MAYOR', 'Templo')] }), F('cm_templo_mayor_excavated_walls', { over: [low('FOUND IN 1978 BY ELECTRICITY WORKERS', 'electricity')] })]);
  beats('M019', [
    F('cm_cathedral_pendulum_brass_bob', { over: [low('A PLUMB LINE INSIDE TRACKS THE TILT', null)] }),
    S('stats', { head: 'THE CATHEDRAL IN THE 1990s', items: [{ pre: '>', v: 1.5, dec: 1, suf: ' M', label: 'ONE SIDE LOWER THAN THE OTHER', at: 0.4, size: 240 }], source: 'Sources: World Monuments Fund; BU News Service' }),
    F('cm_cathedral_interior_bw_columns', { over: [low('CRACKS RAN THROUGH THE BUILDING', 'cracks')] }),
  ]);
  beats('M020', [
    F('cm_cathedral_foundations_archaeological_zone', { over: [low('ENGINEERS DUG UNDER THE HIGH SIDE', 'dug')] }),
    F('cm_cathedral_pendulum_floor_marker', { over: [low('…TO LET IT SINK TOO', 'sink')] }),
    F('cm_cathedral_facade_tilt_up', { over: [low('THEN: GROUT INJECTED INTO THE GROUND', 'grout')] }),
  ]);
  beats('M021', [
    F('cm_bellas_artes_timelapse_2025', { over: [low('PALACIO DE BELLAS ARTES', 'Palacio')] }),
    F('px_bellas_artes_facade_low_angle', { over: [low('HEAVY MARBLE ON SOFT CLAY', 'marble')] }),
    F('cm_bellas_artes_1915_unfinished', { over: [low('1904 → TODAY: SUNK SEVERAL METRES', 'several')] }),
  ]);
  beats('M022', [
    F('cm_old_basilica_guadalupe_side', { over: [low('LEANING CHURCHES', 'Leaning')] }),
    F('cm_santa_veracruz_church_2024'),
    F('cm_casa_camilos_facade', { over: [low('STREETS THAT CRACK AND BUCKLE', 'Streets')] }),
    F('cm_la_santisima_damaged_shield', { over: [low("DOORS THAT DON'T CLOSE", 'Doors')] }),
  ]);
  beats('M022B', [F('cm_quake_2017_street_shaking_condesa', { over: [low('THE CLAY SHAKES LIKE JELLY', 'jelly')] }), F('cm_angel_1957_quake_fallen_statue', { over: [low('1957: THE ANGEL FELL IN AN EARTHQUAKE', null)] })]);
  beats('M022C', [
    S('stats', { head: '19 SEPTEMBER 1985', items: [{ pre: '>', v: 300, suf: ' KM', label: 'FROM THE EPICENTRE', at: 0.4 }, { pre: '~', v: 10000, label: 'OFFICIAL DEATH TOLL', w: 'official' }], source: 'Source: Britannica' }),
    F('cm_quake_2017_rescuers_collapsed', { over: [low('THE LAKEBED AMPLIFIED THE WAVES', 'amplified', 'PHOTO: 2017 EARTHQUAKE')] }),
    F('cm_quake_2017_volunteers_rubble'),
  ]);

  // ===== CH4 =====
  chapter('M023', 4, 'Thirsty and flooded at the same time');
  beats('M023', [F('cm_xochimilco_trajineras_wide_canal', { over: [head('A CITY ON A LAKE… RUNNING SHORT OF WATER', null, 200, 72)] })]);
  beats('M024', [F('cm_cutzamala_system_map', { over: [low('THE CUTZAMALA SYSTEM', 'Cutzamala')] }), F('nasa_iss_popocatepetl_plume_2001', { over: [low('PUMPED UPHILL OVER THE MOUNTAINS', 'uphill')] })]);
  beats('M025', [S('stats', { head: '2024 · AFTER YEARS OF DROUGHT', items: [{ pre: '~', v: 26, suf: '%', label: 'RESERVOIRS FULL', at: 0.4, size: 260 }], source: 'Sources: NPR; Conagua' }), F('px_hazy_skyline_from_above', { over: [chipC('"DAY ZERO"?', 'Zero', 900, 80)] })]);
  beats('M026', [F('px_bellas_artes_sunset', { over: [low('THE RAINS CAME BACK', 'rains')] }), F('cm_water_truck_cistern_fill_point', { over: [low('WATER: A FEW DAYS A WEEK — OR BY TRUCK', 'truck')] })]);
  beats('M026B', [F('cm_pipa_water_truck_xochimilco', { over: [low('"PIPAS" · WATER TRUCKS', 'pipas')] }), F('px_dog_walker_pack_street', { over: [low('PEOPLE LINE UP WITH BUCKETS', 'buckets')] })]);
  beats('M027', [
    F('cm_metro_workers_repair_tracks_2023', { over: [low('SINKING GROUND BENDS AND BREAKS PIPES', 'pipes')] }),
    S('stats', { head: 'LOST TO LEAKS', items: [{ pre: '~', v: 40, suf: '%', label: "OF THE CITY'S WATER", w: 'forty', size: 260 }], source: 'Source: NPR' }),
  ]);
  beats('M028', [
    F('cm_rain_bellas_artes_plaza', { over: [low('RAINY SEASON: STREETS FLOOD', 'flood')] }),
    F('cm_karte_thal_von_mexico', { over: [low('500 YEARS OF GETTING WATER OUT', 'hundred')] }),
  ]);
  beats('M029', [F('px_night_long_exposure_avenue', { over: [head('FLOODS IN SUMMER · DRY IN SPRING', 'floods', 200, 80)] }), F('cm_casa_camilos_sunken_below_sidewalk', { kb: { z: [1.25, 1.05] }, over: [head('SINKS ALL YEAR ROUND', 'sinks', 320, 100, '#FFC857')] })]);

  // ===== CH5 =====
  chapter('M030', 5, 'Can it be stopped?');
  beats('M030', [F('px_drone_lone_tower_sprawl')]);
  beats('M031', [
    F('cm_sentinel1_radar_mexico_city', { over: [low('THE SQUEEZING WILL GO ON', 'squeezing')] }),
    S('stats', { head: 'ONE STUDY ESTIMATES', items: [{ pre: '~', v: 150, suf: ' YEARS', label: 'OF COMPACTION STILL TO COME', at: 0.3 }, { pre: 'UP TO ', v: 30, suf: ' M', label: 'MORE IN THE WORST PLACES', w: 'thirty' }], source: 'Source: Chaussard et al. 2021' }),
  ]);
  beats('M032', [
    F('px_reforma_towers_traffic_trees', { over: [low('PUMP LESS → SINK SLOWER', 'slow')] }),
    F('cm_cyclists_city_ride', { over: [low('RAINWATER FROM ROOFTOPS', 'rain')] }),
    F('cm_metro_tasquena_track_switch', { over: [low('FIX THE LEAKS · REFILL THE GROUND', 'leaking')] }),
  ]);
  beats('M033', [
    F('px_drone_xochimilco_canal_chinampas', { over: [low('XOCHIMILCO', 'Xochimilco')] }),
    F('cm_xochimilco_two_boatmen_poles'),
    F('cm_xochimilco_mariachi_on_boat', { over: [low('THE LAST PIECES OF THE GREAT LAKE', 'last')] }),
  ]);
  beats('M033B', [
    F('cm_xochimilco_crowded_trajinera', { over: [low('UNESCO WORLD HERITAGE', 'UNESCO')] }),
    F('cm_xochimilco_red_trajinera_close'),
    F('px_trajinera_painted_names', { over: [low('WATER THE AZTECS ONCE FARMED', 'Aztecs')] }),
  ]);

  // ===== ENDING =====
  chapter('M034', 6, 'The answer');
  beats('M034', [F('px_drone_topdown_reforma_roundabout')]);
  beats('M035', [
    F('cm_map_tenochtitlan_1524_nuremberg', { kb: { z: [1.3, 1.1], x: [0.5, 0.5] }, over: [low('BUILT ON A LAKE', 'lake')] }),
    F('nasa_iss_mexico_city_night_lights_2025', { over: [low('THE LAKE WAS DRAINED', 'drained')] }),
    F('px_metro_station_commuters_walking', { over: [low('THE CITY DRINKS THE WATER THAT HOLDS IT UP', 'drinks')] }),
  ]);
  beats('M036', [F('cv_drone_bellas_artes_alameda', { over: [low('VENICE: FIGHTING THE WATER AROUND IT', 'Venice')] }), F('cm_eje_central_madero_crowd_crossing', { over: [low('MEXICO CITY: RUNNING OUT OF THE WATER UNDER IT', 'running')] })]);
  beats('M037', [F('px_angel_independence_night_drone', { over: [head('ONE STEP AT A TIME', 'step', 200, 110, '#FFC857')] }), F('px_golden_angel_victory_closeup')]);
  beats('M038', [
    F('cm_zocalo_fireworks_night'),
    S('endq', { img: 'px_cathedral_night_floodlit', credit: '', lines: ['WOULD YOU LIVE', 'IN A CITY THAT', 'SINKS EVERY DAY?'], hl: 2, sub: 'Tell us in the comments · Which city should we explain next?' }),
  ]);
  add(T.tl.voiceEnd + T.tl.qcard, S('endscreen', {}), 'fade');
  return out;
}
module.exports = { assets, build, defaultTrans: 'cut', splitOver: 6, splitTo: 4 };
