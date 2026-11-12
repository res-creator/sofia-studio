// EP01 v3 — generic footage only under generic words (never with Norilsk labels), each asset max 2 uses; shot list with real footage, a new picture every ~5–7 s (cuts on sentence starts), motion everywhere.
const fs = require('fs'), path = require('path');
const CR = JSON.parse(fs.readFileSync(path.join(__dirname, 'assets/credits.json')));
const MF = JSON.parse(fs.readFileSync(path.join(__dirname, 'footage/manifest.json')));
const FT = Object.fromEntries(MF.map(x => [x.key, x]));
const assets = {};
for (const k of Object.keys(CR)) assets[k] = `assets/${k}.jpg`;
for (const x of MF) if (x.type === 'photo') assets[x.key] = `footage/${x.key}.jpg`;
const credit = k => CR[k] ? CR[k].short : FT[k] && FT[k].attribution ? (FT[k].source === 'nasa' ? FT[k].attribution.split(';')[0] : 'Photo: ' + FT[k].attribution) : '';
const C = n => require('../../atlaskit/core').C[n];
const NOR = { lon: 88.2, lat: 69.33 };

// --- shot constructors (word-anchored overlays use {w:'word'} instead of {at}) ---
const V = (key, o = {}) => ({ scene: 'video', p: { file: `footage/${key}.mp4`, credit: credit(key), ...o } });
const Ph = (key, o = {}) => ({ scene: 'photo', p: { img: key, credit: credit(key), ...o } });
const S = (scene, p = {}) => ({ scene, p });
const kb = (z0, z1, x0 = 0.5, x1 = 0.5, y0 = 0.5, y1 = 0.5) => ({ z: [z0, z1], x: [x0, x1], y: [y0, y1] });

function build(T) {
  const out = []; const add = (t, sh, trans) => out.push({ t, scene: sh.scene, p: sh.p, trans });
  // distribute shots over a paragraph, cutting at sentence starts near even targets
  function beats(pid, list, o = {}) {
    const p = T.P[pid], ws = T.words(pid); const st = o.start != null ? o.start : p.start; const end = p.start + p.dur;
    const cand = [st]; ws.forEach((w, i) => { if (i > 0 && /[.?!]$/.test(ws[i - 1].w)) cand.push(w.s - 0.12); });
    const n = list.length; const ts = [st];
    for (let k = 1; k < n; k++) { const target = st + (end - st) * k / n; let best = null;
      for (const c of cand) if (c > ts[k - 1] + 2.5 && (best == null || Math.abs(c - target) < Math.abs(best - target))) best = c;
      // fall back to a word start near the target
      if (best == null || Math.abs(best - target) > 3) { let bw = null; for (const w of ws) if (w.s > ts[k - 1] + 2.5 && (bw == null || Math.abs(w.s - target) < Math.abs(bw - target))) bw = w.s; best = bw != null ? bw - 0.08 : target; }
      ts.push(best); }
    list.forEach((sh, k) => { if (!sh) return; const t0 = ts[k];
      for (const ov of (sh.p.over || [])) if (ov.w) { ov.at = Math.max(0.2, T.at(pid, ov.w, ov.n || 1) - t0); delete ov.w; }
      for (const it of (sh.p.items || [])) if (it.w) { it.at = Math.max(0.2, T.at(pid, it.w, it.n || 1) - t0); delete it.w; }
      for (const pn of (sh.p.pins || [])) if (pn.w) { pn.at = Math.max(0.2, T.at(pid, pn.w, pn.n || 1) - t0); delete pn.w; }
      if (sh.p.extra && sh.p.extra.w) { sh.p.extra.at = Math.max(0.2, T.at(pid, sh.p.extra.w) - t0); delete sh.p.extra.w; }
      for (const [kw, ka] of [['crossW', 'crossAt'], ['realW', 'realAt']]) if (sh.p[kw]) sh.p[ka] = Math.max(0.5, T.at(pid, sh.p[kw]) - t0);
      if (sh.p.cards) for (const c of sh.p.cards) if (c.w) { c.at = Math.max(0.2, T.at(pid, c.w, c.n || 1) - t0); delete c.w; }
      add(t0, sh, k === 0 ? (o.trans || 'cut') : 'cut'); });
  }
  const chapter = (pid, n, title) => add(T.s(pid) - 1.8, S('chapter', { n, title }), 'fade');

  // ===== COLD OPEN =====
  beats('P001', [
    V('px_aurora_alaska_night', { over: [{ type: 'head', text: 'WINTER IN THE ARCTIC', y: 180, size: 100, at: 0.3 }] }),
    Ph('car_snow', { kb: kb(1.05, 1.25, 0.5, 0.55), over: [{ type: 'lower', text: 'NORILSK · DOWN TO −50°C', w: 'fifty' }] }),
    V('px_steaming_mug_window', { over: [{ type: 'lower', text: 'INSIDE: +20°C', w: 'Inside' }] }),
    S('xsec', { house: 'block', season: 0, frost: [[0, 0], [2, 1]], over: [{ type: 'label', text: 'FROZEN SOLID', x: 1420, y: 820, at: 1.0 }] }),
  ], { start: 0 });
  beats('P002', [
    S('globe', { lon: [[0, 70], [4, 88]], lat: [[0, 35], [4, 64]], R: [[0, 430], [4.5, 2400]], arctic: [[2.5, 0], [3.2, 1]], arcticLabel: 64,
      pins: [{ ...NOR, label: 'NORILSK', sub: '174,000 PEOPLE', at: 1.2 }], bracket: { lon: 88.2, lat0: 66.56, lat1: 69.33, at: 3.4, label: '~300 KM' } }),
    Ph('cm_norilsk_blue_blocks_summer', { kb: kb(1.05, 1.22, 0.4, 0.55), over: [{ type: 'lower', text: 'NO ROAD TO THE REST OF RUSSIA', w: 'road' }] }),
  ]);
  beats('P002B', [
    S('sat', { img: 'spill_esa', crop: [1320, 60, 1200, 675], z: [[0, 1.0], [8, 1.2]], credit: credit('spill_esa'), over: [{ type: 'lower', text: '2020 · FUEL TANK FAILS', at: 0.4 }, { type: 'count', from: 0, to: 21000, suf: ' T', label: 'OF DIESEL', y: 540, w: 'thousand' }] }),
    Ph('ambarnaya_river_diesel_spill_sentinel_2020', { kb: kb(1.1, 1.35, 0.5, 0.45, 0.5, 0.45), cold: 0, over: [{ type: 'head', text: 'WAS IT THE FROZEN GROUND?', y: 200, size: 96, w: 'Was' }] }),
  ]);
  beats('P002C', [
    V('permafrost_tunnel_frozen_soil', { over: [{ type: 'lower', text: 'FROZEN GROUND', sub: 'HARD AS CONCRETE', w: 'concrete' }] }),
    S('xsec', { house: 'stone', season: 0, heat: [[0.5, 0], [1.2, 1]], thaw: [[1, 0], [6, 0.8]], sink: [[5, 0], [8, 0.6], [10, 1]], crack: [[9, 0], [10.5, 1]],
      over: [{ type: 'label', text: 'ICE MELTS', x: 1460, y: 800, at: 2.5 }, { type: 'label', text: 'IT SINKS · TILTS · CRACKS', x: 960, y: 230, at: 8 }] }),
  ]);
  beats('P003', [
    Ph('house1', { kb: kb(1.0, 1.15, 0.3, 0.35, 0.6, 0.62), over: [{ type: 'head', text: 'SO HOW DOES NORILSK DO IT?', y: 180, size: 96, at: 0.2 }] }),
    S('xsec', { house: 'block', season: 0, frost: 1, zoom: [[0, 1], [4, 1.7]], fy: [[0, 540], [4, 800]], fx: [[0, 960], [4, 1400]], probe: [[1.5, 0], [3.5, 1]], probeText: '10 M DOWN' }),
  ]);
  add(T.e('P003') + 0.15, S('title', { lines: ["WHY DON'T HOUSES", 'IN NORILSK', 'SINK?'], hl: 1, img: 'lenina', credit: credit('lenina'), brand: true }), 'cut');

  // ===== CH1 =====
  chapter('P004', 1, "A city that shouldn't exist");
  beats('P004', [
    S('globe', { lon: [[0, 60], [6, 75]], lat: [[0, 45], [6, 64]], R: [[0, 600], [6, 1700]], pins: [{ ...NOR, label: 'NORILSK', sub: '69°N · TAYMYR', at: 1.0 },
      { lon: 33.08, lat: 68.97, label: 'MURMANSK', sub: 'BIGGER, BUT FURTHER SOUTH', w: 'Murmansk', small: true, size: 36, align: 'right', lx: -26 }] }),
    Ph('norilsk_satellite_landsat_2016', { kb: kb(1.0, 1.3), cold: 0, over: [{ type: 'note', text: 'NORILSK FROM SPACE · LANDSAT', x: 60, y: 70, at: 0.3 }] }),
  ]);
  beats('P005', [
    S('stats', { head: 'NORILSK CLIMATE', items: [{ pre: '−', v: 8, suf: '°C', label: 'AVERAGE OVER A YEAR', w: 'average' }, { pre: '−', v: 27, suf: '°C', label: 'AVERAGE IN JANUARY', w: 'January' }, { pre: '−', v: 53, suf: '°C', label: 'RECORD LOW', w: 'record' }] }),
    V('px_town_night_lights_snow_aerial', { over: [{ type: 'lower', text: 'THE POLAR NIGHT', w: 'sun' }] }),
    S('calendar', {}),
  ]);
  beats('P006', [
    Ph('pano', { kb: kb(1.1, 1.25, 0.6, 0.4), over: [{ type: 'chip', text: 'NICKEL · COPPER · PALLADIUM', x: 960, y: 210, align: 'center', size: 56, w: 'nickel' }] }),
    Ph('norilsk_smelter_plume_landsat_2017', { kb: kb(1.0, 1.25), cold: 0, over: [{ type: 'note', text: 'NORILSK SMELTER PLUME FROM SPACE · LANDSAT 2017', x: 60, y: 70, at: 0.3 }] }),
    S('stats', { items: [{ pre: '>', v: 40, suf: '%', label: "OF THE WORLD'S PALLADIUM (NORNICKEL)", at: 0.6, size: 220 }], source: 'Source: Reuters, 2024' }),
  ]);
  beats('P007', [
    Ph('norillag_memorial_belfry_winter', { kb: kb(1.02, 1.2), dark: 0.25, over: [{ type: 'head', text: 'NORILLAG', sub: 'SOVIET LABOR CAMP · 1935–1956', y: 200, w: 'Norillag' }] }),
    S('stats', { items: [{ pre: '~', v: 400000, label: 'PRISONERS PASSED THROUGH (ESTIMATE)', at: 0.5 }, { pre: '>', v: 16000, label: 'DEATHS IN OFFICIAL RECORDS', w: 'Official' }], source: 'Sources: Memorial estimate; camp records (Hoover Institution)' }),
    V('px_siberia_taiga_winter', { dark: 0.2 }),
  ]);
  beats('P008', [
    Ph('norilsk_first_house_winter', { kb: kb(1.02, 1.2), snow: 50, over: [{ type: 'lower', text: "NORILSK'S FIRST HOUSE", at: 0.5 }] }),
    V('permafrost_soil_pit_scientist', { over: [{ type: 'lower', text: 'WHAT IS PERMAFROST?', w: 'permafrost' }] }),
  ]);

  // ===== CH2 =====
  chapter('P009', 2, 'What is permafrost, really?');
  beats('P009', [
    S('xsec', { house: 'none', season: 0, rulerA: [[0, 0], [1, 1]], over: [{ type: 'chip', text: '0°C OR COLDER · 2+ YEARS IN A ROW', x: 960, y: 220, align: 'center', size: 56, w: 'Any' }] }),
    V('permafrost_tunnel_frozen_soil', { in: 2, rate: 0.8, over: [{ type: 'lower', text: 'ROCK · SAND · CLAY · PEAT', w: 'rock' }] }),
  ]);
  beats('P010', [Ph('talnakh_new_blocks_forest', { kb: kb(1.02, 1.2, 0.4, 0.6), over: [{ type: 'chip', text: 'CONTINUOUS PERMAFROST', x: 960, y: 200, align: 'center', size: 60, w: 'continuous' }] }),
    Ph('talnakh_panel_blocks_view', { kb: kb(1.15, 1.0) })]);
  beats('P011', [
    V('thawing_snow_ground_patches', { over: [{ type: 'lower', text: 'EVERY SUMMER, THE TOP THAWS', w: 'summer' }] }),
    S('xsec', { house: 'none', season: [[0, 1], [3, 1], [4.5, 0]], over: [{ type: 'label', text: 'ACTIVE LAYER · ~1 M', x: 1250, y: 520, to: [1250, 640], at: 0.6 }, { type: 'label', text: 'FROZEN ALL YEAR', x: 960, y: 880, at: 2.5 }] }),
    V('arctic_thermokarst_lakes_from_plane', {}),
  ]);
  beats('P012', [V('px_ice_bubbles_cracks', { over: [{ type: 'lower', text: 'ICE WORKS LIKE GLUE', w: 'glue' }] }), S('split', {})]);
  beats('P013', [
    Ph('lomonosova', { kb: kb(1.02, 1.2, 0.4, 0.55), over: [{ type: 'lower', text: '−30°C OUTSIDE · +20°C INSIDE', at: 0.8 }] }),
    S('xsec', { house: 'stone', season: 0, heat: [[0, 0], [0.7, 1]], thaw: [[0.5, 0], [6, 1]], sink: [[6, 0], [9, 0.7]], crack: [[9, 0], [10, 1]] }),
  ]);

  // ===== CH3 =====
  chapter('P014', 3, 'The houses that cracked');
  beats('P014', [
    S('stats', { head: 'NORILSK, 1937–1940', items: [{ pre: '~', v: 30, label: 'LOW STONE HOUSES, SHALLOW FOUNDATIONS', at: 0.6 }, { pre: '~', v: 50, suf: '%', label: 'BEGAN TO DEFORM ALMOST AT ONCE', w: 'half' }], source: 'According to Russian engineering studies' }),
    S('xsec', { house: 'stone', season: 0, heat: 1, thaw: [[0, 0.3], [3, 0.9]], sink: [[0, 0.2], [3, 0.8]], crack: [[1, 0], [2, 1]] }),
  ]);
  beats('P015', [
    V('excavator_digging_ground', { over: [{ type: 'lower', text: 'DIG DOWN TO SOLID ROCK', w: 'digging' }] }),
    V('px_foundation_construction_site_cranes', { over: [{ type: 'lower', text: 'SLOW · EXPENSIVE', w: 'slow' }] }),
    Ph('lomonosova', { kb: kb(1.25, 1.1, 0.6, 0.45), over: [{ type: 'lower', text: 'ONLY WHERE ROCK IS CLOSE', w: 'works' }] }),
  ]);
  beats('P016', [
    Ph('norilsk_leninsky_prospekt_street', { kb: kb(1.02, 1.2, 0.5, 0.6) }),
    Ph('house2', { kb: kb(1.0, 1.15, 0.45, 0.4, 0.6, 0.65), dark: 0.1, over: [{ type: 'head', text: 'PROTECT THE ICE', y: 200, size: 120, w: 'protect' }] }),
    Ph('house1', { kb: kb(1.2, 1.35, 0.4, 0.45, 0.7, 0.72), over: [{ type: 'label', text: 'HIDING UNDER EVERY BUILDING', x: 1150, y: 300, to: [1100, 640], w: 'hiding' }] }),
  ]);

  // ===== CH4 =====
  chapter('P017', 4, 'The trick: stilts and cold air');
  beats('P017', [
    S('versus', { title: 'SOVIET BUILDING CODES: TWO WAYS TO BUILD ON PERMAFROST', cards: [
      { who: 'PRINCIPLE II', text: 'Accept that the ground will thaw, and design the building for it.', color: C('orange'), w: 'accepts' },
      { who: 'PRINCIPLE I', text: 'Keep the ground frozen for the whole life of the building. Most of Norilsk.', color: C('ice'), w: 'opposite' }] }),
    Ph('kirova', { kb: kb(1.05, 1.2, 0.55, 0.45), over: [{ type: 'lower', text: 'MOST OF NORILSK: PRINCIPLE I', w: 'Most' }] }),
  ]);
  beats('P018', [
    S('xsec', { house: 'block', season: 0, piles: [[0.3, 0], [5, 1]], frost: 0, rulerA: 1, over: [{ type: 'label', text: 'PILES', x: 520, y: 900, to: [612, 860], at: 2 }] }),
    V('px_concrete_pillars_construction', { over: [{ type: 'lower', text: 'LONG CONCRETE PILES', at: 0.4 }] }),
    V('px_ice_cracks_closeup', { over: [{ type: 'lower', text: 'LIKE A STICK FROZEN INTO ICE', w: 'stick' }] }),
    S('xsec', { house: 'block', season: 0, piles: 1, frost: [[0, 0], [2, 1]], zoom: [[0, 1.2], [6, 1.45]], fy: [[0, 700], [6, 780]], over: [{ type: 'label', text: 'FROZEN GRIP', x: 1450, y: 900, to: [1270, 860], at: 1 }] }),
  ]);
  beats('P019', [
    S('xsec', { house: 'block', season: 0, frost: 1, gap: [[0, 0.2], [2, 1]], zoom: [[0, 1], [4, 1.35]], fy: [[0, 540], [4, 560]], over: [{ type: 'label', text: 'VENTILATED GAP', x: 960, y: 780, to: [960, 560], w: 'ventilated' }] }),
    Ph('house3', { kb: kb(1.05, 1.2, 0.5, 0.55, 0.5, 0.55), over: [{ type: 'lower', text: 'NORILSK: THE GROUND FLOOR STANDS ABOVE THE GROUND', w: 'Look', size: 44 }] }),
    Ph('talnah_yard', { kb: kb(1.1, 1.25, 0.5, 0.4, 0.7, 0.75) }),
  ]);
  beats('P020', [
    S('xsec', { house: 'block', frost: 1, season: 0, wind: [[0, 0], [0.6, 1]], heat: 1, over: [{ type: 'label', text: 'A FRIDGE FOR THE GROUND', x: 960, y: 230, w: 'fridge' }] }),
    V('px_frost_steam_residential_coast', { over: [{ type: 'lower', text: 'WINTER: FREEZING AIR', at: 0.4 }] }),
    S('xsec', { house: 'block', frost: 1, season: [[0, 0.2], [1.5, 1]], heat: 1, over: [{ type: 'label', text: 'SUMMER: SHADE', x: 960, y: 230, at: 1 }] }),
  ]);
  beats('P021', [
    S('xsec', { house: 'block', season: 0, frost: 1, pipes: [[0, 0], [0.8, 1]], zoom: [[0, 1], [4, 1.3]], fx: [[0, 960], [4, 640]], over: [{ type: 'label', text: 'PIPES ABOVE GROUND', x: 600, y: 300, to: [400, 520], at: 1 }] }),
    V('px_steam_chimneys_snowing_suburb', { over: [{ type: 'lower', text: 'HEAT STAYS IN THE AIR', at: 0.4 }] }),
  ]);
  beats('P022', [
    Ph('talnakh_panel_blocks_view', { kb: kb(1.0, 1.2, 0.4, 0.6), over: [{ type: 'lower', text: 'PANEL BLOCKS · 5 AND 9 STOREYS', w: 'panel' }] }),
    V('px_apartment_blocks_night_windows', {}),
    Ph('norilsk_lenin_prospect_from_above', { kb: kb(1.25, 1.05, 0.6, 0.4), over: [{ type: 'lower', text: 'NORILSK: MOST BUILT BEFORE THE 1980s', at: 0.3 }] }),
  ]);
  beats('P023', [
    S('xsec', { house: 'block', season: 0, frost: 1, warm: [[0.5, 0], [5, 0.45]], over: [{ type: 'chip', text: 'ONLY WORKS IF THE GROUND STAYS COLD', x: 960, y: 220, align: 'center', size: 52, w: 'only' }] }),
    Ph('cm_norilsk_snow_on_porch_roof', { kb: kb(1.0, 1.2, 0.6, 0.5), over: [{ type: 'lower', text: 'PROBLEM 1: THE CITY ITSELF', w: 'One' }] }),
  ]);

  // ===== CH5 =====
  chapter('P024', 5, 'When the trick fails');
  beats('P024', [
    Ph('snowdrifts', { kb: kb(1.0, 1.2, 0.45, 0.5), over: [{ type: 'lower', text: 'NORILSK SNOWDRIFTS', sub: 'SNOW = A WARM BLANKET', w: 'blanket' }] }),
    V('px_blizzard_street_parked_cars', {}),
    S('xsec', { house: 'block', season: 0, frost: [[0, 1], [7, 0.3]], wind: [[0, 1], [2, 0]], drift: [[0, 0.3], [2, 1]], leak: [[2.5, 0], [3, 1]], talik: [[3, 0], [8, 1]],
      over: [{ type: 'label', text: 'LEAKING PIPE', x: 1300, y: 300, to: [1040, 520], at: 3 }] }),
  ]);
  beats('P025', [
    V('permafrost_soil_pit_scientist', { in: 1, over: [{ type: 'lower', text: 'MEASURING THE GROUND', at: 0.4 }] }),
    S('thermo', { extra: { w: 'spots', text: '+3 TO 5°C WARMER AT SOME SITES THAN IN THE 1940s' } }),
  ]);
  beats('P026', [
    S('sat', { img: 'sat_2021', crop: [700, 300, 2600, 1462], z: [[0, 1.0], [8, 1.15]], credit: credit('sat_2021'), dark: 0.15, over: [{ type: 'count', from: 0, to: 1.4, dec: 1, pre: '+', suf: '°C', label: 'NORILSK AIR TEMPERATURE, 1970s → 2010s', y: 560, w: 'rose' }] }),
    V('arctic_sea_ice_satellite_2017', { over: [{ type: 'lower', text: 'THE ARCTIC IS WARMING FAST', at: 0.4 }] }),
    S('ratio', {}),
  ]);
  beats('P027', [
    Ph('cm_norilsk_blue_blocks_summer', { kb: kb(1.3, 1.45, 0.3, 0.4, 0.6, 0.55), over: [{ type: 'lower', text: 'FROZEN GROUND GETS WEAKER', sub: 'EVEN BEFORE IT MELTS', at: 0.4 }] }),
    S('bars', { title: "THE GROUND'S ABILITY TO CARRY BUILDINGS — LOSS BY 2013", sub: 'Norilsk, model study', max: 100, items: [
      { label: 'Buildings from the 1960s', v: 15, at: 0.8 }, { label: 'Buildings from the 1970s–80s', v: 21, w: 'seventies' }], source: 'Source: Streletskiy, Shiklomanov, Kokorev & Anisimov, 2015' }),
  ]);
  beats('P028', [
    S('bars', { title: 'PROJECTED LOSS OF BEARING CAPACITY', sub: 'Six climate models · wide uncertainty', max: 100, items: [
      { label: 'By 2020 (1970s–80s buildings)', v: 37, err: 22, text: '−37%', at: 0.8 }, { label: 'By 2050 (older foundations)', v: 67, err: 28, text: '−67%', w: 'fifty' }], source: 'Source: Streletskiy et al., 2015 (projections, ± range)' }),
    V('px_glacier_meltwater', { over: [{ type: 'lower', text: 'ALL ESTIMATES POINT ONE WAY: WARMER', at: 0.4 }] }),
  ]);
  beats('P029', [
    S('stats', { img: 'snowdrifts', credit: credit('snowdrifts'), head: 'NORILSK, MID-2010s', items: [{ pre: '~', v: 300, label: 'STRUCTURES WITH SIGNIFICANT DEFORMATIONS', w: 'structures' }, { pre: '>', v: 100, label: 'HOMES IN STRUCTURAL FAILURE · ~5,000 FAMILIES', w: 'residential' }], source: 'Source: Streletskiy et al., 2015' }),
    V('px_demolition_excavator_ruins', {}),
    Ph('house3', { kb: kb(1.2, 1.05), dark: 0.3, over: [{ type: 'count', from: 0, to: 50, pre: '~', label: 'NORILSK BLOCKS ALREADY TAKEN APART', y: 560, w: 'fifty' }] }),
  ]);
  beats('P030', [S('myth', { crossW: 'nobody', realW: 'Permafrost' })]);

  // ===== CH6 =====
  chapter('P031', 6, 'May 29, 2020');
  beats('P031', [
    Ph('pano', { kb: kb(1.15, 1.3, 0.3, 0.4), dark: 0.2, over: [{ type: 'lower', text: 'NORILSK · 29 MAY 2020', sub: 'A POWER PLANT FUEL TANK FAILS', at: 0.4 }] }),
    S('sat', { img: 'spill_esa', crop: [1320, 60, 1200, 675], z: [[0, 1.04], [10, 1.2]], credit: credit('spill_esa'), dark: 0.1, over: [{ type: 'count', from: 0, to: 21000, suf: ' T', label: 'OF DIESEL SPILLED', y: 540, w: 'diesel' }] }),
    Ph('ambarnaya_river_diesel_spill_sentinel_2020', { kb: kb(1.0, 1.25), cold: 0, over: [{ type: 'lower', text: 'ONE OF THE WORST ARCTIC SPILLS', w: 'worst' }] }),
  ]);
  beats('P032', [
    S('versus', { title: 'WHAT CAUSED IT?', cards: [{ who: 'THE COMPANY (FIRST)', text: '"The supports sank because the permafrost thawed."', color: C('orange'), at: 0.5, src: 'NTEK / Nornickel, 2020' }] }),
    S('sat', { img: 'spill_esa', crop: [40, 960, 1200, 675], z: [[0, 1.0], [8, 1.15]], credit: credit('spill_esa'), over: [{ type: 'lower', text: '"THE FIRST BIG DISASTER OF MELTING PERMAFROST"', at: 0.4, size: 44 }] }),
  ]);
  beats('P033', [
    S('xsec', { house: 'none', season: 0, over: [{ type: 'chip', text: 'SOME PILES SHORTER THAN DESIGNED', x: 960, y: 220, align: 'center', size: 52, at: 0.5 }, { type: 'chip', text: 'NOT SET INTO BEDROCK', x: 960, y: 310, align: 'center', size: 52, at: 2 }] }),
    S('versus', { title: 'WHAT THE INVESTIGATIONS FOUND', cards: [
      { who: 'REVIEW FOR NORNICKEL', text: 'Some piles were shorter than designed and never set into bedrock.', color: C('orange'), at: 0.3, src: 'ERM review, 2020' },
      { who: 'SAFETY REGULATOR', text: 'No sign of thawed permafrost. Weak foundations, missed inspections.', color: C('ice'), w: 'regulator', src: 'Rostekhnadzor, Nov 2020' }] }),
    S('sat', { img: 'spill_esa', crop: [1320, 960, 1200, 675], z: [[0, 1.0], [8, 1.15]], credit: credit('spill_esa'), over: [{ type: 'note', text: 'SENTINEL-2 · 13 JUNE 2020', x: 60, y: 70, at: 0.3 }, { type: 'lower', text: 'BACK IN USE IN 2019 — UNCHECKED', w: 'back' }] }),
    S('sat', { img: 'spill_esa', crop: [40, 60, 1200, 675], z: [[0, 1.0], [8, 1.15]], credit: credit('spill_esa'), over: [{ type: 'note', text: 'BEFORE: 21 MAY 2020', x: 60, y: 70, at: 0.3 }] }),
  ]);
  beats('P034', [
    S('stats', { head: 'RECORD ENVIRONMENTAL FINE · PAID MARCH 2021', items: [{ v: 146, suf: ' BN', label: 'RUBLES', w: 'hundred' }, { pre: '~$', v: 2, suf: ' BN', label: 'US DOLLARS', w: 'dollars' }], source: 'Source: Meduza, 10 Mar 2021' }),
    Ph('norilsk_smelter_plume_landsat_2017', { kb: kb(1.3, 1.1, 0.6, 0.5), cold: 0, over: [{ type: 'lower', text: "RUSSIA'S LARGEST ENVIRONMENTAL FINE", w: 'largest' }] }),
  ]);
  beats('P035', [
    Ph('kirova', { kb: kb(1.25, 1.1, 0.4, 0.5), dark: 0.35, over: [{ type: 'chip', text: '1. THE GROUND STAYS COLD', x: 960, y: 420, align: 'center', size: 62, w: 'ground', n: 2 }, { type: 'chip', text: '2. HUMANS DO THEIR JOB', x: 960, y: 540, align: 'center', size: 62, w: 'humans' }] }),
    V('px_ice_cracks_closeup', { in: 4, over: [{ type: 'lower', text: 'A PIPE THAT NEEDS NO POWER', w: 'pipe' }] }),
  ]);

  // ===== CH7 =====
  chapter('P036', 7, 'A refrigerator under the city');
  beats('P036', [S('siphon', { season: 0, over: [{ type: 'chip', text: 'THERMOSIPHON', x: 1400, y: 300, size: 66, w: 'thermosiphon' }, { type: 'note', text: 'NO ELECTRICITY', x: 1400, y: 380, size: 34, w: 'electricity' }] })]);
  beats('P037', [
    S('siphon', { season: 0, over: [{ type: 'label', text: 'SEALED PIPE', x: 1400, y: 250, to: [1000, 260], at: 0.4 }] }),
    S('siphon', { season: 0, over: [{ type: 'label', text: 'LIQUID PICKS UP HEAT', x: 1400, y: 900, to: [990, 930], at: 0.3 }, { type: 'label', text: 'VAPOR RISES, COOLS, RETURNS', x: 1450, y: 520, to: [1010, 420], w: 'top' }] }),
  ]);
  beats('P038', [S('siphon', { season: [[0, 0], [2, 0], [3.2, 1]], over: [{ type: 'chip', text: 'HEAT MOVES ONE WAY: OUT', x: 1400, y: 300, size: 52, w: 'direction' }] }),
    V('px_icicles_melting', { over: [{ type: 'lower', text: 'IN SUMMER, THE CYCLE STOPS', at: 0.4 }] })]);
  beats('P039', [S('examples', { second: 9 })]);
  beats('P040', [
    S('xsec', { house: 'block', season: 0, frost: 1, siph: [[0, 0], [2.5, 1]], cold: [[1, 0], [6, 1]], over: [{ type: 'chip', text: 'PILOT: 2 BUILDINGS · 2019–2020', x: 960, y: 200, align: 'center', size: 50, w: 'pilot' }] }),
    Ph('talnakh_new_blocks_forest', { kb: kb(1.25, 1.05, 0.6, 0.45), over: [{ type: 'lower', text: 'NORILSK PLAN: HUNDREDS OF HOUSES BY 2035', w: 'hundreds' }] }),
  ]);
  beats('P041', [
    Ph('sevastopolskaya', { kb: kb(1.02, 1.18, 0.4, 0.5), over: [{ type: 'lower', text: 'NORILSK RENOVATION PROGRAM · 2021', sub: 'FAILING BLOCKS → NEW APARTMENTS', w: 'renovation' }] }),
    V('px_residential_towers_apartments', {}),
    S('stats', { items: [{ pre: '~', v: 165, label: 'BUILDINGS & STRUCTURES UNDER SENSOR MONITORING', at: 0.6, size: 220 }], source: 'Source: Nornickel via ComNews, 2022' }),
  ]);

  // ===== ENDING =====
  chapter('P042', 8, 'The answer');
  beats('P042', [
    S('xsec', { house: 'block', season: 0, frost: 1, wind: 1, heat: 1, pipes: 1, siph: 1, cold: 1, zoom: [[0, 1.2], [8, 1]], over: [{ type: 'label', text: 'STILTS IN THE WIND', x: 960, y: 760, to: [960, 560], w: 'Stilts' }, { type: 'label', text: 'STEEL TUBES PUMP HEAT OUT', x: 1500, y: 300, to: [1430, 420], w: 'steel' }] }),
    V('px_town_night_lights_snow_aerial', { in: 4 }),
  ]);
  beats('P043', [
    Ph('lenina', { kb: kb(1.15, 1.02), dark: 0.3, over: [{ type: 'head', text: 'NOT FROZEN GROUND', y: 330, size: 110, w: 'stand' }, { type: 'head', text: 'GROUND IT KEEPS FROZEN', y: 480, size: 110, color: '#FFC857', w: 'keeps' }] }),
    S('xsec', { house: 'block', season: 0, frost: 1, siph: 1, cold: 1, warm: [[0, 0], [8, 0.5]], wind: 1 }),
  ]);
  beats('P044', [
    S('globe', { lon: [[0, 80], [12, 100]], lat: [[0, 75], [12, 78]], R: [[0, 520], [12, 560]], arctic: 1, arcticLabel: 150,
      over: [{ type: 'count', from: 0, to: 4000000, pre: '~', label: 'PEOPLE ON THAW-RISK GROUND BY 2050', x: 480, y: 470, size: 110, labelSize: 30, w: 'million' },
        { type: 'count', from: 0, to: 70, pre: '~', suf: '%', label: 'OF ARCTIC PERMAFROST INFRASTRUCTURE', x: 1440, y: 470, size: 110, labelSize: 30, w: 'seventy' },
        { type: 'note', text: 'Source: Hjort et al. 2018, Nature Communications', x: 960, y: 1030, align: 'center', size: 22, at: 1 }] }),
    V('arctic_thermokarst_lakes_from_plane', { in: 2 }),
  ]);
  beats('P044B', [V('px_night_snow_streetlamp_houses', {}), V('px_tea_mug_steam_window', { over: [{ type: 'lower', text: '−30°C OUTSIDE · +20°C INSIDE', at: 0.4 }] }),
    S('xsec', { house: 'block', season: 0, frost: 1, siph: 1, cold: 1, wind: 1 })]);
  beats('P045', [V('px_aurora_alaska_night', { in: 5 }), S('endq', { img: 'cm_norilsk_snow_on_porch_roof', credit: credit('cm_norilsk_snow_on_porch_roof'), lines: ['WOULD YOU LIVE', 'IN A CITY THAT', 'REFRIGERATES ITS GROUND?'], hl: 2, sub: 'Tell us in the comments · Which place should we explain next?' })]);
  add(T.tl.voiceEnd + T.tl.qcard, S('endscreen', {}), 'fade');
  return out;
}
module.exports = { assets, build, defaultTrans: 'cut', splitOver: 7.5, splitTo: 5.5 };
