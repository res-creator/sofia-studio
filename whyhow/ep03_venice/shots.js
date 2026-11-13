// EP03 Venice — ~70% real Venice footage, a new picture every ~3–4 s; graphics as short inserts.
// Footage not from Venice (Chioggia, forests, glassblower…) carries only generic labels.
const fs = require('fs'), path = require('path');
const MF = JSON.parse(fs.readFileSync(path.join(__dirname, 'footage/manifest.json')));
const FT = Object.fromEntries(MF.map(x => [x.key, x]));
const assets = {}; for (const x of MF) if (x.type === 'photo') assets[x.key] = 'footage/' + x.key + '.jpg';
const credit = k => { const f = FT[k]; if (!f || !f.attribution) return ''; if (f.source === 'pixabay' || f.source === 'coverr') return ''; return f.source === 'nasa' ? f.attribution.split(';')[0] : 'Photo: ' + f.attribution; };
const C = n => require('../atlaskit/core').C[n];
const VEN = { lon: 12.33, lat: 45.44 };
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
const ALL = { drive: 1, platform: 1, stone: 1, brick: 1, pack: 1 };

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
  beats('V001', [
    F('px_drone_riva_st_marks_aerial', { over: [head('THIS CITY SHOULD NOT EXIST', null, 200, 100)] }),
    F('px_lagoon_from_boat_green_water', { over: [low('A SALT-WATER LAGOON', 'lagoon')] }),
    F('px_water_level_grand_canal_red_arches', { over: [low('NO SOLID GROUND · ONLY SAND AND MUD', 'mud')] }),
  ], { start: 0 });
  beats('V002', [
    F('px_doge_palace_statues_arches', { in: 3 }),
    F('px_st_marks_waterfront_telephoto_alps', { in: 10, over: [low('1,000+ YEARS · STONE ON MUD', 'mud')] }),
    F('px_campanile_lamp_low_angle'),
  ]);
  beats('V003', [
    F('px_crowd_walk_to_st_marks', { over: [head('UNDER THESE STREETS…', null, 200, 96)] }),
    S('piles', { ...ALL, zoom: [[0, 1.5], [3, 1.15]], fy: [[0, 380], [3, 620]], over: [head('…A FOREST', 'forest', 200, 110, '#FFC857')] }),
    F('px_gondola_between_wooden_poles', { over: [low('MILLIONS OF TREE TRUNKS', 'Millions')] }),
  ]);
  beats('V004', [
    F('px_rain_storm_grand_canal', { over: [low('WOOD · UNDER WATER · FOR CENTURIES', 'Wood')] }),
    F('px_grand_canal_from_rialto_traffic', { over: [head("WHY DOESN'T VENICE SINK?", 'Why', 200, 92)] }),
    F('px_water_level_grand_canal_waves', { over: [head('IT IS SINKING', 'sinking', 200, 110, '#FFC857')] }),
  ]);
  add(T.e('V004') + 0.15, S('title', { lines: ["WHY DOESN'T", 'VENICE', 'SINK?'], hl: 1, img: 'nasa_iss_venice_city_2007', credit: credit('nasa_iss_venice_city_2007'), brand: true }), 'cut');

  // ===== CH1 =====
  chapter('V005', 1, 'A city built to hide');
  beats('V005', [F('px_lagoon_stilt_fishing_huts'), F('px_lagoon_dilapidated_stilt_house', { over: [low('WHO BUILDS A CITY IN A SWAMP?', 'who')] })]);
  beats('V006', [
    S('globe', { lon: [[0, 20], [4, 12.3]], lat: [[0, 38], [4, 45.4]], R: [[0, 700], [4.5, 2600]], pins: [{ ...VEN, label: 'VENICE', sub: 'NORTH-EAST ITALY', at: 1.2 }] }),
    F('nasa_venice_alps_kidsat', { over: [{ type: 'note', text: 'THE LAGOON AND THE ALPS · NASA', x: 60, y: 70, at: 0.3 }] }),
    F('px_aerial_lagoon_fish_farms', { over: [low('5TH–6TH CENTURIES: PEOPLE FLEE TO THE LAGOON', 'fled')] }),
    F('px_chioggia_lagoon_sunset_bricole', { over: [low('WATER TOO SHALLOW FOR WARSHIPS', 'shallow')] }),
  ]);
  beats('V007', [
    F('nasa_venice_lagoon_aster', { over: [{ type: 'note', text: 'THE VENETIAN LAGOON · NASA ASTER', x: 60, y: 70, at: 0.3 }] }),
    F('px_chioggia_fog_canal_boats', { over: [low('A MAZE FOR INVADERS', 'maze')] }),
    F('px_lagoon_boat_wake_skyline', { over: [low('…AND A PERFECT PLACE TO TRADE', 'trade')] }),
  ]);
  beats('V007B', [
    F('px_doge_palace_courtyard_facade', { over: [low('THE REPUBLIC OF VENICE', 'republic', '~1,100 YEARS · RULED BY A DOGE')] }),
    F('px_st_marks_basilica_top_facade'),
    F('px_canaletto_painting_canal', { over: [low('SILK · SPICES · SALT · GLASS', 'silk')] }),
    F('px_glassblower_flame', { in: 4 }),
    F('px_grand_canal_gothic_palazzi', { over: [low('ONE OF THE RICHEST PLACES ON EARTH', 'richest')] }),
  ]);
  beats('V007C', [
    F('px_arsenale_canal', { over: [low('THE ARSENAL · VENICE’S SHIPYARD', 'shipyard')] }),
    S('stats', { head: 'THE ARSENAL AT ITS PEAK', items: [{ pre: '~', v: 16000, label: 'WORKERS', at: 0.4 }, { pre: '~', v: 1, label: 'SHIP A DAY, IN WARTIME', w: 'ship' }], source: 'Source: Wikipedia / World History Encyclopedia (estimates)' }),
    F('px_regatta_rowers_grand_canal'),
    F('px_molino_stucky_giudecca'),
  ]);
  beats('V008', [
    F('px_rooftops_birds_eye', { over: [{ type: 'count', from: 0, to: 118, pre: '~', label: 'ISLANDS', y: 520, w: 'hundred' }] }),
    F('px_people_on_small_bridge', { over: [low('~400 BRIDGES', 'bridges')] }),
    F('px_brick_bridge_gondola_under'),
    F('px_rooftops_giudecca_panorama', { over: [low('EVERY ISLAND HAD TO BE MADE STRONG', 'strong')] }),
  ]);

  // ===== CH2 =====
  chapter('V009', 2, 'The upside-down forest');
  beats('V009', [S('piles', { drive: 0, over: [chipC('TOP LAYER: SOFT MUD', null, 980, 52)] }), F('px_canal_palazzo_arcade_waterline', { over: [low('A STONE HOUSE SINKS IN', 'sinks')] })]);
  beats('V010', [S('piles', { drive: 0, zoom: [[0, 1], [4, 1.4]], fy: [[0, 540], [4, 860]], over: [chipC('CARANTO: HARD, COMPACT CLAY', 'caranto', 120, 56)] }), F('px_lagoon_dusk_wooden_piles')]);
  beats('V010B', [
    F('px_tree_felling_lumberjack', { over: [low('NO MACHINES', 'machines')] }),
    S('piles', { drive: [[0, 0], [9, 0.55]], over: [chipC('A HEAVY WEIGHT · DROPPED AGAIN AND AGAIN', 'weight', 980, 48)] }),
    F('px_gondola_among_poles_san_giorgio'),
  ]);
  beats('V011', [
    F('px_larches_mountain_slope', { over: [low('LARCH · OAK · ALDER', 'larch')] }),
    F('cv_woodpiles_storage', { over: [low('SHARPENED TRUNKS', 'sharpened')] }),
    S('piles', { drive: [[0, 0.5], [6, 1]] }),
  ]);
  beats('V012', [
    S('piles', { drive: 1, pack: [[0.5, 0], [3, 1]], over: [chipC('MUD SQUEEZED INTO A HARD BLOCK', 'squeeze', 980, 52)] }),
    F('px_gondolas_san_marco_poles'),
  ]);
  beats('V013', [
    S('piles', { drive: 1, pack: 1, platform: [[0.2, 0], [1.2, 1]], over: [{ type: 'label', text: 'WOODEN PLATFORM', x: 1500, y: 360, to: [1330, 430], w: 'platform' }] }),
    S('piles', { drive: 1, pack: 1, platform: 1, stone: [[0.2, 0], [1.4, 1]], over: [{ type: 'label', text: 'ISTRIAN STONE · ALMOST WATERPROOF', x: 1400, y: 160, to: [1300, 300], w: 'Istrian' }] }),
    S('piles', { drive: 1, pack: 1, platform: 1, stone: 1, brick: [[0.2, 0], [2, 1]], over: [{ type: 'label', text: 'BRICK · ONLY ABOVE THE WATER', x: 1500, y: 120, to: [1320, 200], w: 'brick' }] }),
  ]);
  beats('V014', [
    F('px_canal_palazzo_arcade_waterline', { in: 8, over: [low('WHITE STONE WHERE THE WATER TOUCHES', 'white')] }),
    F('px_arcade_restaurant_waterline', { over: [low('BRICK ABOVE IT', 'brick')] }),
    F('px_gondola_pov_brick_canal', { over: [low("THE BUILDING'S RAINCOAT", 'raincoat')] }),
  ]);
  beats('V015', [
    F('px_rialto_bridge_wide', { over: [low('RIALTO BRIDGE · FINISHED 1591', 'Rialto')] }),
    S('stats', { head: 'UNDER THE RIALTO BRIDGE', items: [{ pre: '~', v: 12000, label: 'WOODEN PILES', at: 0.3, size: 240 }], source: 'Source: Italia.it' }),
  ]);
  beats('V016', [
    F('px_grand_canal_salute_dome', { over: [low('SANTA MARIA DELLA SALUTE', 'Santa')] }),
    F('px_rooftops_salute_domes', { over: [chipC('> 1,000,000 PILES (BY MOST ACCOUNTS)', 'million', 900, 52)] }),
  ]);
  beats('V017', [
    F('px_larch_forest_autumn_stream', { over: [low('FORESTS IN THE MOUNTAINS', 'forests')] }),
    F('px_larches_autumn_wind'),
    F('px_logs_stacked_forest_road', { over: [low('FLOATED DOWN RIVERS TO THE LAGOON', 'floated')] }),
    S('piles', { ...ALL, zoom: [[0, 1.0], [4, 1.12]], over: [head('A FOREST, UPSIDE DOWN', 'forest', 160, 90, '#FFC857')] }),
  ]);

  // ===== CH3 =====
  chapter('V018', 3, "Why doesn't the wood rot?");
  beats('V018', [F('px_gondolas_moored_grand_canal'), F('px_rain_grand_canal_palazzo', { over: [head('WOOD IN WATER ROTS', 'rots', 200, 96)] })]);
  beats('V018B', [
    F('px_lagoon_sunset_bricole_lido', { over: [low('CHANNEL MARKERS IN THE LAGOON', 'posts')] }),
    F('px_chioggia_fog_mooring_poles_seagulls', { over: [low('WORN BY THE TIDES', 'tides')] }),
    S('piles', { ...ALL, worm: 1, labels: false, zoom: [[0, 1.6], [4, 1.5]], fx: [[0, 420], [4, 380]], fy: [[0, 440], [4, 440]], over: [chipC('CHEWED BY SHIPWORMS', 'shipworms', 980, 56)] }),
    F('px_chioggia_lagoon_purple_sunset', { over: [low('REPLACED AGAIN AND AGAIN', 'replaced')] }),
  ]);
  beats('V019', [S('mythq', { q: 'The piles under Venice never rot, because there is no oxygen in the mud', verdict: 'PARTLY', answerAt: 99 })]);
  beats('V020', [
    S('mythq', { q: 'The piles under Venice never rot, because there is no oxygen in the mud', verdict: 'PARTLY', answerAt: 0.3, note: 'NO OXYGEN → FUNGI CAN’T SURVIVE' }),
    F('px_lagoon_dusk_wooden_piles', { in: 6, over: [low('DEEP IN WET CLAY: ALMOST NO OXYGEN', 'clay')] }),
    S('piles', { ...ALL, zoom: [[0, 1.2], [5, 1.35]], fy: [[0, 640], [5, 680]], over: [chipC('LASTED FOR CENTURIES', 'centuries', 120, 56)] }),
  ]);
  beats('V021', [
    S('piles', { ...ALL, rot: [[1, 0], [4, 1]], zoom: [[0, 1.4], [5, 1.6]], fy: [[0, 650], [5, 700]], over: [chipC('BACTERIA EAT THE OUTER LAYER · VERY SLOWLY', 'bacteria', 120, 46)] }),
    F('px_weathered_brick_marble_wall', { over: [low('UNIVERSITY OF PADUA RESEARCH', 'Padua')] }),
    F('px_stone_wall_low_angle_texture', { over: [low('THE CORE STAYS STRONG', 'core')] }),
  ]);
  beats('V022', [
    F('px_canal_wooden_poles_palazzi'),
    F('px_grand_canal_palace_mooring_piles', { over: [low('SHIPWORMS CAN’T REACH THEM IN THE MUD', 'shipworms')] }),
    S('piles', { ...ALL, rot: 1, over: [chipC('MUD HOLDS THEM · WATER FILLS THE WOOD', 'mud', 980, 50)] }),
    F('px_gondolas_poles_rialto', { over: [head('THE FOREST IS STILL WORKING', 'working', 200, 88)] }),
  ]);

  // ===== CH4 =====
  chapter('V022B', 4, 'A city without cars');
  beats('V022B', [
    F('px_calle_toward_rialto', { over: [low('EVERYTHING CAME BY BOAT', 'boat')] }),
    F('px_looking_up_narrow_calle', { over: [low('NO CARS · NO BUSES', 'cars')] }),
    F('px_crowded_narrow_calle', { over: [low('NOT EVEN BICYCLES', 'bicycle')] }),
  ]);
  beats('V022C', [
    F('px_vaporetto_stop_rialto_dusk', { over: [low('THE BUS: THE VAPORETTO', 'vaporetti')] }),
    F('px_grand_canal_accademia_boats', { over: [low('TAXIS ARE BOATS', 'Taxis')] }),
    F('px_vaporetto_grand_canal_salute'),
  ]);
  beats('V022D', [
    F('px_speedboat_lagoon_skyline', { over: [low('AMBULANCE · FIRE · POLICE: ALL BY BOAT', 'ambulance')] }),
    F('px_grand_canal_rialto_traffic'),
    F('px_murano_barge_old_houses', { over: [low('EVEN THE RUBBISH LEAVES BY BOAT', 'rubbish')] }),
  ]);
  beats('V022E', [
    F('px_old_boatman_working_boat_bw', { over: [low('EVERY SHOP IS SUPPLIED BY WATER', 'supplied')] }),
    F('px_seafood_on_ice_market'),
    F('px_side_canal_small_boats_brick', { over: [low('THEN: HAND TROLLEYS OVER THE BRIDGES', 'trolley')] }),
    F('px_trattoria_sign_calle', { in: 10 }),
  ]);
  beats('V022F', [
    F('px_water_taxi_san_michele', { over: [low('SAN MICHELE · THE CEMETERY ISLAND', 'cemetery')] }),
    F('px_fog_gondolas_canal'),
  ]);
  beats('V022G', [
    F('px_gondola_grand_canal_palazzi'),
    S('stats', { head: 'GONDOLAS IN VENICE', items: [{ pre: '~', v: 10000, label: '16TH CENTURY', at: 0.3 }, { pre: '~', v: 400, label: 'TODAY', w: 'Today' }], source: 'Source: Wikipedia; Fortune (2024)' }),
    F('px_gondolas_flower_bridge_tourists', { over: [low('ALMOST ALL CARRY TOURISTS', 'tourists')] }),
  ]);

  // ===== CH5 =====
  chapter('V023', 5, 'So is Venice sinking?');
  beats('V023', [F('px_canal_dark_facades'), F('px_old_facades_peeling', { over: [head('YES. BUT NOT BECAUSE OF THE WOOD', 'wood', 200, 80)] })]);
  beats('V024', [
    F('nasa_venice_lagoon_aster', { over: [low('PORTO MARGHERA · INDUSTRY ON THE MAINLAND', 'Marghera')] }),
    F('px_lagoon_construction_crane', { over: [low('1950s–60s: GROUNDWATER PUMPED OUT', 'pumped')] }),
    F('px_side_canal_yellow_house_gondola', { over: [low('THE GROUND COMPRESSED LIKE A SPONGE', 'sponge')] }),
  ]);
  beats('V025', [
    S('compare', { title: 'HOW MUCH VENICE SANK, 1950–1970', zeroY: 380, scale: 30, unit: ' cm', items: [{ label: 'VENICE', v: -12, hl: true, w: 'twelve' }], note: 'FOR A CITY BARELY ABOVE THE WATER — ENORMOUS', noteW: 'enormous', source: 'Source: Comune di Venezia' }),
    F('px_gondola_pov_narrow_canal'),
  ]);
  beats('V026', [F('px_graffiti_calle_canal', { over: [low('EARLY 1970s: PUMPING STOPPED', 'stopped')] }), F('px_brick_arch_backyard', { over: [low('THE GROUND STILL SETTLES A LITTLE', 'settles')] })]);
  beats('V027', [
    F('px_sunrise_sea_clouds_beach', { over: [low('…AND THE SEA IS RISING', 'rising')] }),
    S('stats', { head: 'THE WATER vs THE CITY', items: [{ pre: '+', v: 2.5, dec: 1, suf: ' MM', label: 'EVERY YEAR, FOR 150 YEARS', w: 'two', size: 240 }], source: 'Source: Zanchettin et al. 2021, NHESS' }),
    F('px_water_level_grand_canal_waves', { in: 8, over: [low('SLOW — BUT IT NEVER STOPS', 'Slow')] }),
  ]);

  // ===== CH6 =====
  chapter('V028', 6, 'When the sea walks in');
  beats('V028', [F('px_flood_st_marks_square', { over: [head('ACQUA ALTA', 'acqua', 200, 130)] })]);
  beats('V029', [
    F('px_rain_storm_grand_canal', { in: 12, over: [low('HIGH TIDE + SOUTH WIND + LOW PRESSURE', 'tide')] }),
    F('px_flood_tape_waves_san_giorgio'),
    F('px_aqua_alta_gondolas_sunrise', { over: [low('THE WATER WALKS INTO THE CITY', 'walks')] }),
  ]);
  beats('V030', [
    F('px_campanile_lamp_low_angle', { over: [low('SIRENS · A FEW HOURS AHEAD', 'sirens')] }),
    S('sirens', { smAt: 99, toneW: ['One', 'Two', 'Four', 'Four'] }),
  ]);
  beats('V031', [
    F('px_empty_piazza_san_marco_timelapse', { over: [low("ST MARK'S SQUARE · THE LOWEST PLACE", 'lowest')] }),
    S('sirens', { smAt: 0.3, toneAt: [99, 99, 99, 99], title: 'WHERE THE WATER COMES IN FIRST' }),
    F('px_flood_piazzetta_dusk', { over: [low('THE SQUARE FLOODS FIRST', 'floods')] }),
    F('px_flood_doge_palace_reflection', { over: [low('RAISED WALKWAYS · RUBBER BOOTS', 'walkways')] }),
  ]);
  beats('V031B', [
    F('px_rain_grand_canal_palazzo', { in: 20 }),
    S('compare', { title: 'TIDES ABOVE 110 CM, PER YEAR', zeroY: 860, scale: 22, unit: '×', items: [{ label: '1950s', v: 2, at: 0.3 }, { label: '2010s', v: 10, at: 1.0 }, { label: '2019', v: 28, hl: true, at: 1.7 }], source: 'Source: ISPRA' }),
    F('px_aqua_alta_gondolas_sunrise', { over: [low('MORE OFTEN EVERY DECADE', 'frequent')] }),
  ]);
  beats('V031C', [
    F('px_damp_stairs_stained_walls', { over: [low('SALT WATER SOAKS INTO THE WALLS', 'salt')] }),
    F('px_peeling_plaster_wall_calle', { over: [low('SALT CRYSTALS BREAK THE BRICKS', 'crystallizes')] }),
    F('px_boarded_blue_house_peeling'),
  ]);
  beats('V032', [S('sirens', { smAt: 0.1, toneAt: [0.1, 0.1, 0.1, 0.1], records: true, recAt: 0.6, title: 'THE WORST FLOODS ON RECORD' })]);
  beats('V033', [
    S('stats', { head: '12 NOVEMBER 2019 · NIGHT', items: [{ v: 187, suf: ' CM', label: 'SECOND-HIGHEST TIDE EVER', at: 0.3, size: 240 }], source: 'Source: Copernicus Marine; CEDIM' }),
    F('px_flood_st_marks_square', { kb: { z: [1.25, 1.05] }, over: [low("WATER INSIDE ST MARK'S BASILICA", 'Basilica')] }),
    F('px_flood_tape_waves_san_giorgio', { kb: { z: [1.2, 1.05], x: [0.6, 0.4] }, over: [low('A STATE OF EMERGENCY', 'emergency')] }),
  ]);

  // ===== CH7 =====
  chapter('V034', 7, 'Seventy-eight steel gates');
  beats('V034', [F('cm_mose_construction_2009_a', { over: [low('MOSE · UNDER CONSTRUCTION (2009)', 'MOSE')] }), F('cm_mose_punta_sabbioni_cranes', { over: [low('IN 2019, STILL NOT WORKING', 'working')] })]);
  beats('V035', [
    F('nasa_iss_lagoon_barrier_island_2014', { over: [low('THE LAGOON MEETS THE SEA AT 3 INLETS', 'three')] }),
    F('cm_mose_lido_inlet_aerial'),
    S('mose', { raise: 0, over: [chipC('78 STEEL GATES ON THE SEABED', 'seventy-eight', 980, 52)] }),
  ]);
  beats('V036', [
    S('mose', { raise: [[0.6, 0], [5, 1]], air: [[0.4, 0], [0.8, 1], [5, 1], [5.5, 0]] }),
    S('mose', { raise: 1, sea: [[0, 0], [2.5, 1]], over: [chipC('~30 MINUTES · A STEEL WALL', 'wall', 980, 52)] }),
  ]);
  beats('V037', [
    F('px_san_marco_from_lagoon_vaporetto', { over: [low('3 OCTOBER 2020 · FIRST REAL USE', 'October')] }),
    F('cm_mose_sentinel1_radar_2020', { over: [{ type: 'note', text: 'MOSE RAISED · SENTINEL-1 RADAR · DEC 2020', x: 60, y: 70, at: 0.3 }] }),
    S('mose', { raise: 1, sea: 1, over: [head('THE CITY STAYED DRY', 'dry', 300, 90)] }),
  ]);
  beats('V038', [
    S('stats', { head: 'MOSE', items: [{ v: 100, label: 'RAISINGS BY MARCH 2025', at: 0.3 }, { pre: '>€', v: 6, suf: ' BN', label: 'TO BUILD', w: 'billion' }], source: 'Source: Ministry of Infrastructure; Engineering.com' }),
    F('cm_mose_jackup_barge', { over: [low('EVERY RAISING: HUNDREDS OF THOUSANDS €', 'raising')] }),
    F('px_lagoon_from_boat_dogana_skyline'),
  ]);
  beats('V038B', [
    F('px_st_marks_basilica_top_facade', { in: 4, over: [low('SMALLER FLOODS STILL GET IN', 'Smaller')] }),
    F('px_calle_view_st_marks_basilica', { over: [low("ST MARK'S BASILICA · GLASS WALL SINCE 2022", 'glass')] }),
    F('px_flood_doge_palace_reflection', { kb: { z: [1.2, 1.05] } }),
  ]);
  beats('V039', [
    F('px_cruise_ship_behind_gondolas', { over: [low('GATES CLOSED = NO SHIPS IN OR OUT', 'Ships')] }),
    F('px_lido_ferry_lagoon', { over: [low('THE LAGOON CAN’T REFRESH ITSELF', 'refresh')] }),
    F('px_speedboat_lagoon_skyline', { in: 3, over: [low('HIGHER SEAS → CLOSED MORE OFTEN', 'rises')] }),
  ]);

  // ===== CH8 =====
  chapter('V040', 8, 'The other flood');
  beats('V040', [F('px_crowded_calle_shops')], { tail: 0.25 });
  beats('V041', [
    S('stats', { head: 'VISITORS EVERY YEAR', items: [{ pre: '25–', from: 25, v: 30, suf: ' MILLION', label: 'INCLUDING OVERNIGHT GUESTS', at: 0.3, size: 200 }], source: 'Source: Venice Smart Control Room via Euronews' }),
    F('px_crowded_shopping_street', { over: [low('LIKE A STADIUM EXIT', 'stadium')] }),
    F('px_rialto_bridge_crowd_top'),
  ]);
  beats('V042', [
    F('px_canal_laundry_hanging', { over: [low('THE PEOPLE WHO LIVE HERE ARE LEAVING', 'leaving')] }),
    S('stats', { head: 'RESIDENTS OF THE HISTORIC CENTRE', items: [{ v: 174808, label: '1951', at: 0.3 }, { pre: '<', v: 50000, label: '2022', w: 'twenty' }], source: 'Source: Comune di Venezia; ANSA' }),
    F('px_laundry_window_clothesline'),
  ]);
  beats('V043', [F('px_shop_street_posters', { over: [low('APARTMENTS → HOLIDAY RENTALS', 'apartments')] }), F('px_burano_alley_laundry', { over: [low('LOCALS MOVED TO THE MAINLAND', 'mainland')] })]);
  beats('V044', [
    F('px_piazza_pigeons_tourists', { over: [low('2024: A TICKET TO ENTER THE CITY', 'charge')] }),
    S('stats', { head: 'VENICE ACCESS FEE · DAY VISITORS', items: [{ pre: '€', v: 5, label: 'BUSIEST DAYS', at: 0.3 }, { pre: '€', v: 10, label: 'BOOKED AT THE LAST MINUTE', at: 1.2 }], source: 'Source: Euronews; Lonely Planet' }),
    F('px_tourists_side_canal_gondola'),
  ]);

  // ===== ENDING =====
  chapter('V045', 9, 'The answer');
  beats('V045', [F('px_gondolier_mist_salute')], { tail: 0.25 });
  beats('V046', [
    S('piles', { ...ALL, zoom: [[0, 1.3], [4, 1.0]], fy: [[0, 650], [4, 540]], over: [head('UNDER THE PALACES, A FOREST', null, 120, 80)] }),
    F('px_fog_gondolas_poles'),
    F('px_gondolas_riva_sunny', { over: [low('STILL DOING THEIR JOB, AFTER CENTURIES', 'still')] }),
  ]);
  beats('V047', [F('px_lagoon_sunset_bricole_lido', { in: 5, over: [head('A SEA THAT KEEPS RISING', 'sea', 200, 90)] }), F('px_night_calle_lamp', { over: [head('A CITY THAT KEEPS EMPTYING', 'emptying', 200, 90, '#FFC857')] })]);
  beats('V048', [F('px_foggy_night_sottoportego'), F('px_night_grand_canal_lights'), F('px_redentore_fireworks_lagoon', { over: [head('ONE MORE WAY TO SURVIVE?', 'one', 200, 88)] })]);
  beats('V049', [
    F('px_grand_canal_rialto_sunset_vaporetto', { in: 12 }),
    S('endq', { img: 'px_night_salute_lamp_gondolas', credit: '', lines: ['WOULD YOU STILL', 'VISIT', 'VENICE?'], hl: 2, sub: 'Or leave it to the Venetians? · Which city should we explain next?' }),
  ]);
  add(T.tl.voiceEnd + T.tl.qcard, S('endscreen', {}), 'fade');
  return out;
}
module.exports = { assets, build, defaultTrans: 'cut', splitOver: 6, splitTo: 4 };
