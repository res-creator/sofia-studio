// EP06 New York — mostly real NYC footage/photos (Pixabay, Coverr, Wikimedia Commons, Library of Congress, NASA), a new picture every ~2–4 s.
const fs = require('fs'), path = require('path');
const MF = JSON.parse(fs.readFileSync(path.join(__dirname, 'footage/manifest.json')));
const FT = Object.fromEntries(MF.map(x => [x.key, x]));
const assets = {}; for (const x of MF) if (x.type === 'photo') assets[x.key] = 'footage/' + x.key + '.jpg';
const credit = k => { const f = FT[k]; if (!f || !f.attribution) return ''; if (f.source === 'pixabay' || f.source === 'coverr') return ''; if (f.source === 'loc') return 'Photo: Library of Congress'; return f.source === 'nasa' ? f.attribution.split(';')[0] : (f.type === 'video' ? 'Video: ' : 'Photo: ') + f.attribution; };
const C = n => require('../atlaskit/core').C[n];
const NY = { lon: -74.0, lat: 40.71 };
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
  beats('N001', [
    F('px_skyscrapers_in_fog', { over: [head('MANHATTAN · A COLD MORNING', null, 200, 90)] }),
    F('cm_steam_walking_through_street_2024', { over: [low('STEAM, POURING OUT OF THE STREET', 'Steam')] }),
    F('px_steam_stack_street_night', { over: [low('ORANGE AND WHITE CHIMNEYS IN THE ROAD', 'chimneys')] }),
  ], { start: 0 });
  beats('N002', [
    F('cm_steamy_manhole_2005', { over: [low('THE SUBWAY? THE SEWERS?', 'subway')] }),
    F('cm_steam_vapor_typical_nyc', { over: [head('NO.', "isn't", 200, 140, '#FFC857')] }),
    F('px_steam_clouds_between_towers', { over: [low('A HIDDEN SYSTEM, 100+ YEARS OLD', 'hidden')] }),
  ]);
  beats('N003', [
    F('px_aerial_midtown_canyon', { over: [head('A SECOND CITY UNDERGROUND', 'second', 200, 90)] }),
    F('cm_open_manhole_2024', { over: [low('PIPES FULL OF STEAM', 'Pipes')] }),
    F('cm_sandhogs_round_tunnel', { over: [low('TUNNELS CARRYING WATER FROM 125 MILES AWAY', 'Tunnels')] }),
    F('px_subway_train_rushing', { over: [low('A SUBWAY THAT NEVER STOPS', 'subway')] }),
  ]);
  beats('N004', [
    F('px_one_wtc_above_fog'),
    F('cm_aerial_midtown_night', { over: [head("WHAT'S REALLY UNDER NEW YORK?", 'really', 200, 86)] }),
  ]);
  add(T.e('N004') + 0.15, S('title', { lines: ["WHAT'S HIDDEN", 'UNDER', 'NEW YORK CITY?'], hl: 2, img: 'cm_steam_rising_street_towers', credit: credit('cm_steam_rising_street_towers'), brand: true }), 'cut');

  // ===== CH1 =====
  chapter('N005', 1, 'A city heated by steam');
  beats('N005', [F('cv_businessman_broadway_steam')]);
  beats('N006', [
    F('cm_steam_felt_hats_39th_bw', { over: [low('1882 · LOWER MANHATTAN', 'eighteen')] }),
    F('loc_steam_drills_excavation', { over: [low('COAL · BOILING WATER · STEAM IN PIPES', 'coal')] }),
    F('cm_23rd_street_1901_film', { over: [low('A FEW MILES OF PIPE AT FIRST', 'few'), { type: 'note', text: 'FILM, 1901', x: 60, y: 70, at: 0.3 }] }),
  ]);
  beats('N007', [
    F('cm_con_ed_east_river_station_skyline', { over: [low('TODAY: CON EDISON', 'Edison')] }),
    S('stats', { head: 'THE LARGEST STEAM SYSTEM IN THE US', items: [{ pre: '>', v: 100, suf: ' MILES', label: 'OF STEAM PIPES UNDER MANHATTAN', at: 0.4, size: 240 }], source: 'Source: Con Edison' }),
  ]);
  beats('N008', [
    F('cm_aerial_chrysler_grand_central', { over: [low('~1,700 BUILDINGS', 'seventeen')] }),
    F('cv_grand_central_facade', { over: [low('OFFICES · HOTELS · HOSPITALS · MUSEUMS', 'offices')] }),
    F('px_aerial_avenue_traffic', { over: [low('FROM THE SOUTHERN TIP UP TO 96TH STREET', 'Ninety-Sixth')] }),
  ]);
  beats('N009', [
    F('cm_con_ed_plant_night', { over: [low('> 400°F WHEN IT LEAVES THE PLANT', 'four')] }),
    F('px_night_towers_dark', { over: [low('HEAT · HOT WATER · EVEN AIR CONDITIONING', 'air')] }),
  ]);
  beats('N010', [
    F('cm_steam_e60_fifth_avenue', { over: [low('A LEAK — OR WATER ON A HOT PIPE', 'leaks')] }),
    F('cm_steam_stacks_broadway_dey', { over: [low('THE STACKS LIFT IT ABOVE THE TRAFFIC', 'stacks')] }),
    F('cm_steam_stack_avenue_hotdog_cart', { over: [low('SO DRIVERS CAN STILL SEE', 'drivers')] }),
  ]);
  beats('N011', [F('px_manhole_cover_street_level', { over: [low('MOSTLY HARMLESS…', 'harmless')] }), F('cm_steam_explosion_2007_plume3', { over: [low('18 JULY 2007 · LEXINGTON AVE · NEAR GRAND CENTRAL', 'eighteenth')] })]);
  beats('N012', [
    F('cm_steam_explosion_2007_plume', { over: [low('HIGHER THAN THE NEARBY SKYSCRAPERS', 'higher')] }),
    F('cm_steam_explosion_2007_crowd4', { over: [low('A CRATER IN THE STREET', 'crater')] }),
    F('cm_steam_explosion_2007_police_mask', { over: [low('THE PIPE WAS LAID IN 1924', 'pipe')] }),
  ]);

  // ===== CH2 =====
  chapter('N012B', 2, 'Water from 125 miles away');
  beats('N012B', [F('px_central_park_reservoir_photo', { over: [low('WHY TUNNELS 100 MILES LONG?', 'tunnels')] })]);
  beats('N012C', [
    F('loc_hester_street_market', { over: [low('200 YEARS AGO: WELLS AND A FILTHY POND', 'wells')] }),
    S('stats', { head: 'CHOLERA · 1832', items: [{ pre: '~', v: 3500, label: 'DEAD IN NEW YORK', at: 0.4, size: 240 }], source: 'Source: NYC DEP' }),
    F('loc_nassau_street_crowd', { over: [low('DIRTY WATER HELPED IT SPREAD', 'Dirty')] }),
  ]);
  beats('N012D', [
    F('cm_old_croton_aqueduct_map', { over: [low('THE CROTON AQUEDUCT · ~40 MILES', 'aqueduct')] }),
    F('loc_high_bridge_aqueduct', { over: [low('ALMOST ALL BY GRAVITY', 'gravity')] }),
    F('cm_croton_water_celebration_1842', { over: [low('1842: THE WATER ARRIVES — A HUGE CELEBRATION', 'celebration')] }),
  ]);
  beats('N013', [
    F('cm_hydrant_spraying_brooklyn'),
    S('stats', { head: 'NEW YORK USES EVERY DAY', items: [{ pre: '~', v: 1, suf: ' BILLION', label: 'GALLONS OF WATER', at: 0.4, size: 260 }], source: 'Source: NYC DEP' }),
  ]);
  beats('N014', [
    F('cm_ashokan_from_mountain', { over: [low('ASHOKAN RESERVOIR · CATSKILL MOUNTAINS', 'reservoirs')] }),
    F('cm_kensico_reservoir', { over: [low('19 RESERVOIRS AND LAKES', 'nineteen')] }),
    F('px_catskills_winter_stream', { over: [low('UP TO 125 MILES FROM THE CITY', 'twenty-five')] }),
  ]);
  beats('N015', [
    F('cm_new_croton_dam_waterfall', { over: [low('THE RESERVOIRS SIT HIGHER THAN THE CITY', 'higher')] }),
    F('cm_catskill_aqueduct_map_1910', { over: [low('AQUEDUCTS AND GIANT TUNNELS', 'aqueducts')] }),
    S('stats', { head: "NEW YORK'S WATER", items: [{ pre: '~', v: 95, suf: '%', label: 'ARRIVES BY GRAVITY ALONE — NO PUMPS', w: 'ninety-five', size: 260 }], source: 'Source: Columbia Climate School; US EPA' }),
  ]);
  beats('N016', [F('cm_ashokan_reflections', { over: [low('SO CLEAN IT SKIPS FILTRATION', 'filtration')] }), F('cm_black_fire_hydrant_manhattan', { over: [low('DISINFECTED — BUT NOT FILTERED', 'disinfected')] })]);
  beats('N016B', [
    F('cv_road_construction_workers', { over: [low('~6,800 MILES OF WATER MAINS', 'mains')] }),
    F('cm_cable_install_manhole', { over: [low('~7,500 MILES OF SEWERS', 'sewers')] }),
    F('nasa_manhattan_iss010_clear', { over: [chipC('ENOUGH PIPE TO CROSS THE US 4+ TIMES', 'cross', 960, 52)] }),
  ]);
  beats('N017', [F('cv_panorama_rooftops', { over: [low('GRAVITY LIFTS IT ABOUT 6 STORIES', 'six')] }), F('px_glass_towers_low_angle_clouds', { over: [low('ABOVE THAT, BUILDINGS NEED HELP', 'help')] })]);
  beats('N018', [
    F('cm_water_towers_cluster_rooftops', { over: [low('WOODEN WATER TOWERS', 'Wooden')] }),
    F('cm_water_tower_empire_state', { over: [low('PUMP UP TO THE ROOF…', 'pump')] }),
    F('cm_soho_rooftop_water_towers', { over: [low('…GRAVITY BRINGS IT DOWN', 'gravity')] }),
  ]);
  beats('N019', [
    F('px_water_tower_snow', { over: [low('~10,000 OF THEM', 'thousand')] }),
    F('cm_brooklyn_water_tower', { over: [low('STILL MADE OF WOOD', 'wood')] }),
    F('cm_water_tower_closeup_rooftops', { over: [low('A NEW TANK IN A SINGLE DAY', 'day')] }),
  ]);

  // ===== CH3 =====
  chapter('N020', 3, 'The tunnel that takes half a century');
  beats('N020', [
    F('cm_nyc_water_tunnel_map', { over: [low('TUNNEL No. 1 (1917) · TUNNEL No. 2 (1936)', 'tunnels')] }),
    F('cm_aqueduct_tunnel_workers_1910s'),
    F('px_chrysler_from_park_haze', { over: [head('WHAT IF ONE FAILED?', 'failed', 200, 100)] }),
  ]);
  beats('N021', [
    F('cm_aqueduct_cross_section_drawing', { over: [low("THEY CAN'T BE SHUT DOWN TO INSPECT", 'inspect')] }),
    F('cm_water_tunnel_3_shaft_26b', { over: [low('1970: CITY WATER TUNNEL No. 3', 'seventy')] }),
  ]);
  beats('N022', [
    F('cm_esa_bored_tunnel_round', { over: [low('HUNDREDS OF FEET UNDER THE CITY', 'hundreds'), { type: 'note', text: 'PHOTO: A ROCK TUNNEL UNDER MANHATTAN', x: 60, y: 70, at: 0.3 }] }),
    F('cm_tunnel_blast_fire', { over: [low('THROUGH SOLID ROCK', 'rock')] }),
    F('cm_sandhogs_lirr_tunnel', { over: [low('"SANDHOGS"', 'sandhogs')] }),
    F('cm_esa_workers_silhouettes'),
  ]);
  beats('N023', [
    F('cm_esa_tbm_cutterhead', { over: [low('ONE OF THE BIGGEST PROJECTS IN CITY HISTORY', 'biggest')] }),
    S('stats', { head: 'CITY WATER TUNNEL No. 3', items: [{ v: 24, label: 'WORKERS DIED', w: 'Twenty-four' }, { v: 2013, label: 'MANHATTAN SECTION SWITCHED ON', w: 'thirteen', size: 140 }], source: 'Source: NYC DEP; ENR' }),
  ]);
  beats('N024', [F('cm_esa_cavern_workers', { over: [low('STILL NOT FINISHED', 'finished')] }), F('cm_second_ave_tunnel_lit', { over: [chipC('1970 → 2030s', 'expected', 960, 70)] })]);

  // ===== CH4 =====
  chapter('N025', 4, 'The subway that never sleeps');
  beats('N025', [F('cv_subway_green_sign'), F('cv_subway_turnstile_entering')]);
  beats('N026', [
    F('px_subway_train_doors', { over: [low('24 HOURS A DAY · 365 DAYS A YEAR', 'twenty-four')] }),
    S('stats', { head: 'THE NEW YORK SUBWAY', items: [{ v: 472, label: 'STATIONS', at: 0.4, size: 260 }], source: 'Source: MTA' }),
    F('cv_subway_platform_timelapse'),
  ]);
  beats('N027', [
    F('cm_53_street_tunnel_pumping', { over: [low('BELOW THE WATER TABLE', 'water')] }),
    S('stats', { head: 'PUMPED OUT ON A DRY DAY', items: [{ pre: '~', v: 13, suf: ' MILLION', label: 'GALLONS OF WATER', at: 0.4, size: 260 }], source: 'Source: MTA via NY1' }),
    F('cm_pumping_water_cranberry_street', { over: [low('IF THE PUMPS STOPPED, IT WOULD FLOOD', 'stopped')] }),
  ]);
  beats('N028', [
    F('cm_sandy_east_river_manhattan', { over: [low('OCTOBER 2012 · HURRICANE SANDY', 'October')] }),
    F('cm_mta_water_pouring_stairs', { over: [low('SALT WATER POURS INTO THE SUBWAY', 'poured')] }),
    F('cm_14th_street_tunnel_flooded', { over: [low('7 TUNNELS UNDER THE EAST RIVER FLOODED', 'Seven')] }),
    F('cm_south_ferry_platform_flooded', { over: [low('SOUTH FERRY: TRACKS TO CEILING', 'Ferry')] }),
  ]);
  beats('N029', [
    F('cm_sandy_con_ed_explosion_video', { over: [low('"THE WORST DISASTER IN THE SUBWAY\'S HISTORY"', 'worst')] }),
    F('cm_pumping_out_south_ferry', { over: [low('SALT WATER ATE SIGNALS AND CABLES', 'signals')] }),
    F('cm_clark_street_tube_repair', { over: [low('REPAIRS TOOK YEARS', 'years')] }),
  ]);
  beats('N030', [
    F('cm_city_hall_postcard_color', { over: [low('CITY HALL STATION · 1904', 'nineteen-oh-four')] }),
    F('cm_city_hall_station_platform_wide', { over: [low('ARCHED TILE · SKYLIGHTS · CHANDELIERS', 'tile')] }),
  ]);
  beats('N031', [
    F('cm_city_hall_habs_skylight', { over: [low('CLOSED 1945 · PLATFORM TOO SHORT', 'closed')] }),
    F('cm_city_hall_6_train_passing', { over: [low('STAY ON THE 6 TRAIN AFTER THE LAST STOP…', 'stay')] }),
    F('loc_city_hall_subway_station_1904', { over: [low('…AND YOU CAN STILL SEE IT', 'see')] }),
  ]);

  // ===== CH5 =====
  chapter('N032', 5, 'The rock under the skyline');
  beats('N032', [F('cm_72nd_street_cavern_rock', { over: [low('…AND UNDER ALL OF IT: ROCK', 'rock')] })]);
  beats('N033', [
    F('cm_manhattan_schist_bedrock_night', { over: [low('MANHATTAN SCHIST', 'schist')] }),
    F('cm_central_park_rock_folds'),
    F('px_central_park_rocks_skyline', { over: [low('BREAKING THROUGH THE GRASS IN CENTRAL PARK', 'Central')] }),
  ]);
  beats('N034', [F('px_midtown_aerial_panorama', { over: [low('TWO CLUSTERS: MIDTOWN AND DOWNTOWN', 'clusters')] }), F('cm_nyc_geology_map', { over: [low('"WHERE THE ROCK IS CLOSE TO THE SURFACE"', 'rock')] })]);
  beats('N035', [
    F('cm_manhattan_aerial_1931', { over: [low("THE ROCK BETWEEN ISN'T MUCH DEEPER", 'deeper')] }),
    F('cv_nyse_flags_facade', { over: [low('TOWERS WENT WHERE THE MONEY WAS', 'money')] }),
    F('loc_grand_central_park_avenue_view', { over: [low('…AROUND THE GREAT TRAIN STATIONS', 'stations')] }),
    F('loc_skyscraper_foundations', { over: [low('ENGINEERS JUST DUG DEEPER', 'dug')] }),
  ]);
  beats('N036', [
    F('cm_brooklyn_bridge_tower_construction', { over: [low('BROOKLYN BRIDGE · 1870s', 'Brooklyn')] }),
    F('cm_brooklyn_bridge_caisson_exterior', { over: [low('GIANT WOODEN BOXES OF COMPRESSED AIR', 'wooden')] }),
    F('cm_brooklyn_bridge_caisson_1', { over: [low('A MYSTERIOUS ILLNESS', 'mysterious')] }),
  ]);
  beats('N037', [
    F('cm_brooklyn_bridge_transverse_section', { over: [low('"THE BENDS"', 'bends')] }),
    F('cm_frank_leslies_1883_bridge', { over: [low('100+ FELL ILL · SOME DIED', 'hundred')] }),
    F('px_brooklyn_bridge_tower_dusk', { over: [low('WASHINGTON ROEBLING — PARTLY PARALYSED', 'Roebling')] }),
    F('px_brooklyn_bridge_cables_sunset', { over: [low('EMILY ROEBLING HELPED FINISH IT', 'Emily')] }),
  ]);

  // ===== ENDING =====
  chapter('N038', 6, 'The answer');
  beats('N038', [F('cm_aerial_downtown_night')]);
  beats('N039', [
    F('cm_steam_rising_street_towers', { over: [low('STEAM UNDER THE STREETS', 'steam')] }),
    F('cm_ashokan_sunset', { over: [low('WATER FROM 125 MILES AWAY', 'Water')] }),
    F('cm_second_ave_tunnel_round', { over: [low('A TUNNEL DUG FOR HALF A CENTURY', 'tunnel')] }),
    F('cv_subway_arriving', { over: [low('A SUBWAY THAT NEVER SLEEPS', 'subway')] }),
  ]);
  beats('N040', [F('px_times_square_night_crowd', { over: [low('MILLIONS WALK OVER IT EVERY DAY', 'millions')] }), F('cv_skyline_sunset_drone', { over: [head('THAT’S HOW IT’S RUN', 'exactly', 200, 100, '#FFC857')] })]);
  beats('N041', [
    F('px_brooklyn_bridge_night_wide'),
    S('endq', { img: 'nasa_nyc_night_gold_iss035', credit: credit('nasa_nyc_night_gold_iss035'), lines: ['WOULD YOU TAKE', 'A TOUR UNDER', 'NEW YORK?'], hl: 2, sub: 'Tell us in the comments · Which city should we explain next?' }),
  ]);
  add(T.tl.voiceEnd + T.tl.qcard, S('endscreen', {}), 'fade');
  return out;
}
module.exports = { assets, build, defaultTrans: 'cut', splitOver: 6, splitTo: 4 };
