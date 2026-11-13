// EP02 Yakutsk — countdown of 7 tricks. Real footage only; footage not shot in Yakutsk carries only generic labels.
// Each asset max 2 uses, a new picture every ~5–7 s, own diagrams for everything we have no honest footage of.
const fs = require('fs'), path = require('path');
const MF2 = JSON.parse(fs.readFileSync(path.join(__dirname, 'footage/manifest.json')));
const MF1 = JSON.parse(fs.readFileSync(path.join(__dirname, '../ep01_norilsk/footage/manifest.json')));
const FT = {}; const assets = {}; const DIR = {};
for (const x of MF1) { FT[x.key] = x; DIR[x.key] = '../ep01_norilsk/footage/'; }
for (const x of MF2) { FT[x.key] = x; DIR[x.key] = 'footage/'; }
for (const k of Object.keys(FT)) if (FT[k].type === 'photo') assets[k] = DIR[k] + k + '.jpg';
const credit = k => { const f = FT[k]; if (!f || !f.attribution) return ''; return f.source === 'nasa' ? f.attribution.split(';')[0] : 'Photo: ' + f.attribution; };
const C = n => require('../atlaskit/core').C[n];
const YAK = { lon: 129.73, lat: 62.03 }, LON = { lon: -0.12, lat: 51.5 }, NOR = { lon: 88.2, lat: 69.33 }, OYM = { lon: 143.15, lat: 63.46 };

const V = (key, o = {}) => ({ scene: 'video', p: { file: DIR[key] + key + '.mp4', credit: FT[key] && FT[key].source !== 'pixabay' ? credit(key) : '', ...o } });
const Ph = (key, o = {}) => ({ scene: 'photo', p: { img: key, credit: credit(key), ...o } });
const S = (scene, p = {}) => ({ scene, p });
const kb = (z0, z1, x0 = 0.5, x1 = 0.5, y0 = 0.5, y1 = 0.5) => ({ z: [z0, z1], x: [x0, x1], y: [y0, y1] });
const low = (text, w, sub) => ({ type: 'lower', text, sub, w });
const head = (text, w, y = 200, size = 96, color) => ({ type: 'head', text, w, y, size, color });
const chipC = (text, w, y, size = 56) => ({ type: 'chip', text, x: 960, y, align: 'center', size, w });
const thermo = (v, w) => ({ type: 'thermo', v, w });

function build(T) {
  const out = []; const add = (t, sh, trans) => out.push({ t, scene: sh.scene, p: sh.p, trans });
  function beats(pid, list, o = {}) {
    const p = T.P[pid], ws = T.words(pid); const st = o.start != null ? o.start : p.start; const end = p.start + p.dur;
    const cand = [st]; ws.forEach((w, i) => { if (i > 0 && /[.?!]$/.test(ws[i - 1].w)) cand.push(w.s - 0.12); });
    const n = list.length; const ts = [st];
    for (let k = 1; k < n; k++) { const target = st + (end - st) * k / n; let best = null;
      for (const c of cand) if (c > ts[k - 1] + 2.5 && (best == null || Math.abs(c - target) < Math.abs(best - target))) best = c;
      if (best == null || Math.abs(best - target) > 3) { let bw = null; for (const w of ws) if (w.s > ts[k - 1] + 2.5 && (bw == null || Math.abs(w.s - target) < Math.abs(bw - target))) bw = w.s; best = bw != null ? bw - 0.08 : target; }
      ts.push(best); }
    const rel = (w, t0, nn) => Math.max(0.2, T.at(pid, w, nn || 1) - t0);
    list.forEach((sh, k) => { if (!sh) return; const t0 = ts[k];
      for (const ov of (sh.p.over || [])) if (ov.w) { ov.at = rel(ov.w, t0, ov.n); delete ov.w; }
      for (const it of (sh.p.items || [])) if (it.w) { it.at = rel(it.w, t0, it.n); delete it.w; }
      for (const pn of (sh.p.pins || [])) if (pn.w) { pn.at = rel(pn.w, t0, pn.n); delete pn.w; }
      for (const [kw, ka] of [['answerW', 'answerAt'], ['digToW', 'digTo'], ['digFromW', 'digFrom'], ['noteW', 'noteAt']]) if (sh.p[kw]) { sh.p[ka] = Math.max(0.5, T.at(pid, sh.p[kw]) - t0); delete sh.p[kw]; }
      if (sh.p.temps && sh.p.temps.w) { sh.p.temps.at = rel(sh.p.temps.w, t0); delete sh.p.temps.w; }
      add(t0, sh, 'cut'); });
  }
  // countdown card: starts 1.8 s before the paragraph and stays 1.2 s into it
  const count = (pid, n, title) => { add(T.s(pid) - 1.8, S('countdown', { n, title }), 'fade'); return { start: T.s(pid) + 1.2 }; };

  // ===== COLD OPEN: the experiment =====
  beats('Y001', [
    V('px_night_snow_streetlamp_houses', { over: [head("LET'S TRY AN EXPERIMENT", null, 200, 100)] }),
    V('px_winter_street_people_frost', { over: [thermo(-50, 'fifty'), low('−50°C · NO WIND', 'still')] }),
  ], { start: 0 });
  beats('Y002', [
    Ph('px_man_frozen_breath_forest', { kb: kb(1.05, 1.25, 0.5, 0.55), over: [thermo(-50), low('YOUR BREATH → ICE CRYSTALS', 'breath')] }),
    Ph('px_frost_beard_man_fur_hat', { kb: kb(1.2, 1.05), over: [thermo(-50), low('FROST GROWS ON YOUR EYELASHES', 'frost')] }),
    S('stats', { head: 'EVERY BREATH STINGS', items: [{ pre: '+', v: 37, suf: '°C', label: 'YOUR BODY', at: 0.4 }, { pre: '−', v: 50, suf: '°C', label: 'THE AIR', at: 1.0 }, { pre: '~', v: 87, suf: '°', label: 'DIFFERENCE', w: 'ninety' }] }),
  ]);
  beats('Y003', [
    S('frost', { over: [{ type: 'timer', from: 0, to: 300, dur: 8, w: 'clock' }] }),
    Ph('px_old_man_fur_hat_frost_window', { kb: kb(1.05, 1.2, 0.5, 0.5, 0.45, 0.5), over: [{ type: 'timer', from: 180, to: 240, dur: 60, lin: true, at: 0 }, low('NOBODY GOES OUT WITH A BARE FACE', 'nobody')] }),
  ]);
  beats('Y004', [
    V('px_boiling_water_throw_wide', { over: [low('A CUP OF BOILING WATER', 'boiling')] }),
    V('px_boiling_water_throw_freeze', { over: [head('IT NEVER LANDS AS WATER', 'vanishes', 200, 92)] }),
  ]);
  beats('Y005', [
    S('stats', { head: 'NOW HERE’S THE STRANGE PART', items: [{ v: 355000, label: 'PEOPLE LIVE IN THIS COLD', at: 0.5, size: 220 }], source: 'Source: Rosstat, 2021 census' }),
    V('px_moscow_tram_snow_street', { over: [low('THEY GO TO WORK', 'work')] }),
    V('px_steaming_mug_window', { over: [thermo(20, 'Inside'), low('INSIDE: +20°C', 'Inside')] }),
  ]);
  beats('Y006', [
    Ph('cm_yakutsk_street_frost_cars_exhaust', { kb: kb(1.04, 1.22, 0.45, 0.55), over: [head('THIS IS YAKUTSK', null, 200, 120), { type: 'tag', text: '62.0°N 129.7°E', x: 60, y: 980, at: 1 }] }),
    S('globe', { lon: [[0, 40], [5, 115]], lat: [[0, 45], [5, 58]], R: [[0, 450], [5, 1100]], pins: [{ ...LON, label: 'LONDON', sub: 'JANUARY ≈ +5°C', small: true, size: 34, at: 0.6 }, { ...YAK, label: 'YAKUTSK', sub: 'JANUARY ≈ −37°C', at: 2.2 }] }),
    S('compare', { title: 'AVERAGE JANUARY DAY', zeroY: 360, scale: 13, items: [{ label: 'LONDON', v: 5, at: 0.4 }, { label: 'YAKUTSK', v: -37, hl: true, at: 1.2 }], note: '42° COLDER · THE COLDEST WINTERS OF ANY CITY ON EARTH', noteW: 'coldest', source: 'Source: Roshydromet station 24959' }),
  ]);
  beats('Y007', [
    V('px_apartment_blocks_night_windows', { over: [head('HOW DO YOU KEEP A CITY WARM', null, 180, 88), head('AT −50°C?', null, 290, 110, '#FFC857')] }),
    S('stats', { head: 'WE COUNTED', items: [{ v: 7, label: 'TRICKS', w: 'seven', size: 300 }] }),
    S('xsec', { house: 'block', season: 0, frost: 1, zoom: [[0, 1], [5, 1.6]], fy: [[0, 540], [5, 800]], probe: [[1.5, 0], [3.5, 1]], probeText: 'UNDER EVERY BUILDING', over: [chipC('THE ONE YOU’D NEVER GUESS', 'never', 980)] }),
  ]);
  add(T.e('Y007') + 0.15, S('title', { lines: ['HOW A CITY', 'SURVIVES', '−50°C'], hl: 2, img: 'cm_yakutsk_street_frost_cars_exhaust', credit: credit('cm_yakutsk_street_frost_cars_exhaust'), brand: true }), 'cut');
  beats('Y007B', [
    V('px_siberia_taiga_winter', { over: [head('WHY LIVE HERE AT ALL?', null, 200, 100)] }),
    S('globe', { lon: [[0, 110], [6, 128]], lat: [[0, 55], [6, 62]], R: [[0, 900], [6, 1500]], pins: [{ ...YAK, label: 'YAKUTSK', sub: 'CAPITAL OF YAKUTIA', w: 'capital' }] }),
    S('stats', { head: 'BIGGER THAN ARGENTINA', items: [{ v: 3.08, dec: 2, suf: 'M KM²', label: 'YAKUTIA', at: 0.4 }, { v: 2.78, dec: 2, suf: 'M KM²', label: 'ARGENTINA', at: 1.2 }], source: 'Official areas' }),
    S('stats', { head: 'RICH UNDER THE GROUND: DIAMONDS', items: [{ pre: '~', v: 90, suf: '%', label: "OF RUSSIA'S DIAMONDS — MINED IN YAKUTIA", w: 'ninety' }, { pre: '~', v: 32, suf: '%', label: "OF THE WORLD'S — FROM RUSSIA", w: 'third' }], source: 'Source: Kommersant, Interfax (2024)' }),
  ]);
  beats('Y007C', [
    S('stats', { head: 'YAKUTSK POPULATION', items: [{ v: 269601, label: '2010', at: 0.4 }, { v: 355443, label: '2021', w: 'twenty', n: 2 }], source: 'Source: Rosstat census' }),
    V('px_siberia_omsk_city_blocks', { over: [low('STILL BUILDING NEW APARTMENT BLOCKS', 'building')] }),
  ]);

  // ===== TRICK 7: the city is a freezer =====
  beats('Y008', [
    Ph('px_thermometer_wall_frost', { kb: kb(1.05, 1.25), over: [low('NOV – MARCH: NO FREEZER NEEDED', 'November')] }),
    V('px_heavy_snow_against_house', { over: [head('THE WHOLE CITY IS ONE', 'whole', 200, 96)] }),
  ], count('Y008', 7, 'The city is a freezer'));
  beats('Y009', [
    S('stats', { head: 'THE OPEN-AIR MARKET IN WINTER', items: [{ v: 0, label: 'REFRIGERATORS', at: 0.5, size: 260 }], source: 'Source: Smithsonian Magazine' }),
    Ph('px_worker_fur_hat_snow_valves', { kb: kb(1.05, 1.2, 0.5, 0.5, 0.4, 0.45), over: [low('LAYERS ON LAYERS', 'layers', '“LIKE A CABBAGE” — A MARKET TRADER')] }),
  ]);
  beats('Y010', [
    V('px_ice_cracks_closeup', { over: [head('STROGANINA', 'stroganina', 200, 120), low('RAW FISH, FROZEN HARD, SHAVED INTO CURLS', 'raw')] }),
  ]);
  beats('Y010B', [
    Ph('cm_permafrost_kingdom_entrance_winter', { kb: kb(1.04, 1.2, 0.5, 0.5), over: [low('PERMAFROST KINGDOM · NEAR YAKUTSK', 'Permafrost')] }),
    V('permafrost_tunnel_frozen_soil', { over: [low('TUNNELS IN FROZEN GROUND', 'tunnels')] }),
    Ph('cm_permafrost_kingdom_ice_throne', { kb: kb(1.2, 1.04, 0.5, 0.5, 0.45, 0.5), over: [chipC('OPENED 2005', 'opened', 900, 60)] }),
    Ph('cm_permafrost_kingdom_ice_sculpture_fish', { kb: kb(1.05, 1.25), over: [low('BELOW ZERO ALL YEAR · EVEN IN JULY', 'July')] }),
  ]);
  beats('Y011', [
    S('mythq', { q: 'Yakutsk is the coldest city on Earth, all year round', verdict: 'MYTH', answerW: 'Not', note: 'OVER A WHOLE YEAR, NORILSK IS VERY SLIGHTLY COLDER', source: 'Source: Roshydromet (stations 24959, 23078)' }),
    S('globe', { lon: [[0, 100], [6, 112]], lat: [[0, 60], [6, 64]], R: [[0, 900], [6, 1000]], pins: [{ ...NOR, label: 'NORILSK', sub: 'YEAR −8.3°C', at: 0.4 }, { ...YAK, label: 'YAKUTSK', sub: 'YEAR −8.0°C', at: 1.2 }] }),
    S('compare', { title: 'BUT IN WINTER… (JANUARY AVERAGE)', zeroY: 360, scale: 13, items: [{ label: 'NORILSK', v: -26.5, dec: 1, at: 0.4 }, { label: 'YAKUTSK', v: -36.9, dec: 1, hl: true, at: 1.2 }], note: 'DECEMBER AND JANUARY BOTH ≈ −37°C', noteW: 'December', source: 'Source: Roshydromet' }),
  ]);
  beats('Y011B', [
    S('mythq', { q: 'Yakutsk hit −62.7°C in January 2023', verdict: 'MYTH', answerAt: 3, note: 'THAT WAS A STATION ELSEWHERE IN YAKUTIA · YAKUTSK: ABOUT −50°C', source: 'Source: AccuWeather, Roshydromet' }),
    S('stats', { head: "YAKUTSK'S OWN RECORD", items: [{ pre: '−', v: 64.4, dec: 1, suf: '°C', label: 'SET IN 1891', at: 0.4, size: 240 }], source: 'Source: Roshydromet station 24959' }),
  ]);
  beats('Y011C', [
    S('mythq', { q: 'Oymyakon once hit −71°C', verdict: 'MYTH', answerW: 'unofficial', note: 'OFFICIAL RECORD: −67.7°C (1933) · −71°C IS AN OLD ESTIMATE', source: 'Source: WMO' }),
    S('globe', { lon: [[0, 128], [6, 140]], lat: [[0, 60], [6, 63]], R: [[0, 1300], [6, 2200]], pins: [{ ...YAK, label: 'YAKUTSK', small: true, size: 34, at: 0.3 }, { ...OYM, label: 'OYMYAKON', sub: '−67.7°C · 1933', at: 1 }] }),
  ]);
  beats('Y012', [V('px_frost_steam_residential_coast', { over: [head('PROBLEM #1:', null, 180, 90), head('HEAT A CITY THIS COLD', null, 290, 100, '#FFC857')] })]);

  // ===== TRICK 6: heat the whole city from one place =====
  beats('Y013', [
    V('px_chimney_smoke_winter_roof', { over: [low('MOST OF THE WORLD: A BOILER IN EVERY HOUSE', 'most')] }),
    Ph('px_power_plant_steam_winter', { kb: kb(1.05, 1.22), over: [low('BIG POWER STATIONS BURN GAS', 'Big')] }),
    S('district', {}),
  ], count('Y013', 6, 'Heat the city from one place'));
  beats('Y014', [
    V('px_thermal_power_plant_chimneys', { over: [low('A GAS-FIRED POWER STATION', 'newest')] }),
    S('stats', { head: 'YAKUTSK GRES-2 · OPENED 2017', items: [{ v: 469, suf: ' GCAL/H', label: 'OF HEAT FOR THE CITY', at: 0.4, size: 200 }], source: 'Source: EastRussia / RusHydro' }),
    V('px_industrial_chimney_white_smoke', { over: [low('GAS FROM FIELDS HUNDREDS OF KM AWAY', 'gas')] }),
  ]);
  beats('Y014B', [
    S('district', { title: 'YOUR RADIATOR, KILOMETRES AWAY' }),
    V('px_steam_pipe_industrial', { over: [low('INSULATED PIPES · ALL WINTER, NON-STOP', 'insulated')] }),
    V('px_apartment_blocks_night_windows', { over: [low('IF THE HOT WATER STOPS, THE PIPES FREEZE', 'stopped')] }),
  ]);
  beats('Y015', [
    S('ring', { title: 'THE HEATING SEASON IN YAKUTSK', from: 8.1, to: 4.5, big: '8+ MONTHS', sub: 'EARLY SEPTEMBER → MID-MAY', color: C('orange') }),
    Ph('px_thermometer_snow', { kb: kb(1.05, 1.25), over: [low('ON AFTER 5 DAYS AT +8°C OR COLDER', 'five')] }),
  ]);
  beats('Y016', [
    S('compare', { title: 'THE LEGAL MINIMUM', zeroY: 600, scale: 8, items: [{ label: 'OUTSIDE', v: -50, at: 0.5 }, { label: 'LIVING ROOM', v: 20, hl: true, at: 1.6 }], note: '70° OF DIFFERENCE · ONE WALL AND A WINDOW', noteW: 'Seventy', source: 'Source: Russian housing rules No. 354' }),
    V('px_tea_mug_steam_window', { over: [thermo(20), low('AT LEAST +20°C INSIDE', 'least')] }),
  ]);
  beats('Y017', [
    V('px_night_snow_empty_shop_street', { over: [low('ONE WEAK POINT: IT’S SHARED', 'weak')] }),
    S('stats', { head: '1 OCTOBER 2017 · YAKUTSK', items: [{ v: 1, label: 'POWER STATION FIRE — POWER AND WATER CUT', at: 0.4, size: 160 }, { pre: '<', v: 1, suf: ' DAY', label: 'TO FIX IT', at: 1.5, size: 160 }], source: 'Source: ABN, 1 Oct 2017' }),
    V('cv_snow_blizzard_apartments_dusk', { over: [head('NOW IMAGINE IT IN JANUARY', 'imagine', 200, 96)] }),
  ]);

  // ===== TRICK 5: never switch off the car =====
  beats('Y018', [
    V('px_snowy_parking_lot_cars', { over: [low('ENGINES RUNNING · NOBODY INSIDE', 'running')] }),
    V('px_night_snow_street_traffic', { over: [low('SOMETIMES ALL NIGHT', 'night')] }),
  ], count('Y018', 5, 'Never switch the car off'));
  beats('Y019', [
    Ph('px_car_exhaust_snow', { kb: kb(1.05, 1.25), over: [chipC('OIL THICKENS', 'oil', 380), chipC('BATTERIES LOSE POWER', 'batteries', 480), chipC('IT MAY NOT START AGAIN', 'refuse', 580)] }),
    V('px_snowy_cars_traffic_jam', { over: [low('HEATED GARAGES · ENGINE HEATERS', 'garages')] }),
    S('stats', { head: 'ORDINARY DIESEL TURNS TO JELLY', items: [{ pre: '−', v: 50, suf: '°C', label: 'ARCTIC DIESEL STILL FLOWS AT', w: 'arctic', size: 220 }], source: 'GOST 305-82 (arctic grade)' }),
  ]);
  beats('Y020', [
    V('px_boiling_water_throw_freeze', { in: 3, over: [head('REMEMBER THIS?', null, 200, 100)] }),
    Ph('px_car_exhaust_snow', { kb: kb(1.25, 1.05, 0.55, 0.5), over: [low('EXHAUST = WARM WATER VAPOUR', 'exhaust')] }),
    S('vapour', {}),
  ]);
  beats('Y021', [
    Ph('px_krasnoyarsk_frost_fog_river', { kb: kb(1.04, 1.22, 0.4, 0.6), over: [head('ICE FOG', 'ice', 200, 130)] }),
    V('px_night_city_traffic_snow_aerial', { over: [low('A CLOUD THE CITY MAKES ITSELF', 'cloud')] }),
  ]);

  // ===== TRICK 4: know when it's too cold =====
  beats('Y022', [
    V('px_people_walking_snowy_park', { over: [head('WHEN IS IT TOO COLD?', null, 200, 100)] }),
    S('stats', { head: 'SCHOOL RULES · YAKUTSK (JAN 2026)', items: [{ pre: '−', v: 45, suf: '°C', label: 'YOUNGEST STAY HOME', at: 0.4 }, { pre: '−', v: 50, suf: '°C', label: 'ALL GRADES LEARN FROM HOME', at: 1.4 }], source: 'Source: Rossiyskaya Gazeta, 17 Jan 2026' }),
  ], count('Y022', 4, 'Know when it’s too cold'));
  beats('Y023', [
    S('compare', { title: 'SCHOOL IS OPEN', zeroY: 300, scale: 12, items: [{ label: 'OPEN', v: -40, w: 'forty' }, { label: 'OPEN', v: -42, w: 'forty-two' }, { label: 'OPEN', v: -44, w: 'forty-four' }, { label: 'HOME', v: -50, hl: true, at: 4 }] }),
    V('px_night_snowfall_street_people', { over: [low('DECEMBER: ABOUT 5 HOURS OF DAYLIGHT', 'five')] }),
  ]);
  beats('Y023B', [
    Ph('px_st_petersburg_white_night_bridge', { kb: kb(1.05, 1.22), over: [low('JUNE: NIGHTS THAT NEVER GET DARK', 'nights')] }),
    S('stats', { head: 'DAYLIGHT IN YAKUTSK', items: [{ pre: '~', v: 5, suf: ' H', label: 'IN DECEMBER', at: 0.3 }, { pre: '~', v: 20, suf: ' H', label: 'IN JUNE', at: 1 }], source: 'Astronomical calculation, 62°N' }),
  ]);

  // ===== TRICK 3: cross a river with no bridge =====
  beats('Y024', [
    Ph('px_lena_river_yakutia_summer', { kb: kb(1.05, 1.22, 0.4, 0.6), over: [low('THE LENA', 'Lena', 'ONE OF THE BIGGEST RIVERS IN THE WORLD')] }),
    S('river', { mode: 0, over: [head('NO BRIDGE. ANYWHERE IN THE REGION.', 'bridge', 300, 72)] }),
  ], count('Y024', 3, 'Cross a river with no bridge'));
  beats('Y025', [
    Ph('cm_yakutsk_lena_ferry_deck_cars', { kb: kb(1.04, 1.2), over: [low('SUMMER: THE FERRY', 'ferry', 'YAKUTSK – NIZHNY BESTYAKH')] }),
    S('river', { mode: 1 }),
    Ph('px_car_on_baikal_ice_sunset', { kb: kb(1.2, 1.04), over: [low('A FROZEN RIVER BECOMES A ROAD', 'road')] }),
  ]);
  beats('Y026', [
    S('river', { mode: 2 }),
    V('px_river_freeze_up_slush', { over: [low('AUTUMN: ICE TOO THIN', 'autumn')] }),
    V('px_river_ice_floes_breakup', { over: [low('SPRING: THE ICE BREAKS UP', 'spring')] }),
    Ph('px_hovercraft_on_lake_ice', { kb: kb(1.05, 1.25), over: [low('ONLY HOVERCRAFT AND HELICOPTERS', 'hovercraft')] }),
  ]);
  beats('Y026B', [
    Ph('cm_lena_late_autumn_bestyakh_shore', { kb: kb(1.04, 1.2, 0.5, 0.6), over: [low('LATE AUTUMN ON THE LENA', 'late', 'THE BANK OPPOSITE YAKUTSK')] }),
    S('ring', { title: '2023: NO FERRY ACROSS THE LENA', from: 9.8, to: 4.85, big: '7 MONTHS', sub: 'LATE OCTOBER → END OF MAY', color: C('ice') }),
    V('px_river_ice_drift_spring', { over: [low('THE CITY LIVED ON THE ICE ROAD', 'lived')] }),
  ]);
  beats('Y027', [
    V('px_cable_stayed_bridge_dusk', { over: [low('A CABLE-STAYED BRIDGE', 'cable-stayed')] }),
    S('stats', { head: 'THE LENA BRIDGE · UNDER CONSTRUCTION', items: [{ pre: '~', v: 3, suf: ' KM', label: 'OVER THE RIVER', w: 'three' }, { v: 14.5, dec: 1, suf: ' KM', label: 'WITH APPROACHES', w: 'fourteen' }, { pre: '>', v: 40, suf: ' M', label: 'PILES UNDER THE PIERS', w: 'piles' }], source: 'Source: Rossiyskaya Gazeta, Jan 2026 · target: end of 2028' }),
    V('px_arch_bridge_danube_linz', { over: [chipC('TARGET: END OF 2028', 'target', 900, 60)] }),
  ]);

  // ===== TRICK 2: lift the pipes =====
  beats('Y028', [
    Ph('px_alaska_pipeline_on_supports_winter', { kb: kb(1.04, 1.22, 0.4, 0.6), over: [low('PIPES ABOVE THE GROUND', 'pipes', 'THIS ONE: ALASKA · SAME IDEA')] }),
    S('xsec', { house: 'block', season: 0, frost: 1, pipes: [[0, 0], [2, 1]], over: [{ type: 'label', text: 'HOT WATER · WRAPPED', x: 1500, y: 300, to: [1430, 420], w: 'wrapped' }] }),
  ], count('Y028', 2, 'Lift the pipes'));
  beats('Y029', [
    S('xsec', { house: 'block', season: 0, frost: 1, leak: [[0.3, 0], [2, 1]], talik: [[1, 0], [5, 1]], sink: [[4, 0], [7, 0.6]], over: [{ ...chipC('A BURIED HOT PIPE = A HEATER', null, 980, 52), at: 0.4 }, { type: 'label', text: 'ICE MELTS · GROUND SINKS', x: 1450, y: 820, at: 3 }] }),
    S('xsec', { house: 'block', season: 0, frost: 1, pipes: [[0, 0], [1.5, 1]], cold: [[1, 0], [4, 1]], over: [{ ...chipC('SO THE PIPES GO UP', null, 980, 60), at: 0.4 }] }),
    Ph('px_alaska_pipeline_thermosyphons', { kb: kb(1.2, 1.04), over: [low('AWAY FROM THE FROZEN EARTH', 'away')] }),
  ]);
  beats('Y030', [
    V('px_siberia_winter_forest_road', { over: [head("THE REAL DANGER ISN'T THE AIR", 'danger', 200, 88)] }),
    S('xsec', { house: 'block', season: 0, frost: 1, probe: [[0.8, 0], [3, 1]], probeText: 'UNDER YOUR FEET' }),
  ]);

  // ===== TRICK 1: protect the ice =====
  beats('Y031', [
    S('title', { lines: ['YAKUTSK, 1828', 'A MERCHANT', 'WANTS A WELL'], hl: 0, size: 120 }),
    V('excavator_digging_ground', { over: [low('SO HE STARTED DIGGING', 'digging')] }),
  ], count('Y031', 1, 'Protect the ice'));
  beats('Y032', [
    S('shaft', { digFrom: 0.4, digToW: 'gave' }),
  ]);
  beats('Y033', [
    S('shaft', { digFrom: -2, digTo: -1, temps: { w: 'temperature' } }),
    S('stats', { head: "MIDDENDORFF'S ESTIMATE · 1840s", items: [{ pre: '~', v: 190, suf: ' M', label: 'OF FROZEN GROUND UNDER YAKUTSK', at: 0.4, size: 220 }], source: 'Today: hundreds of metres thick' }),
    Ph('cm_melnikov_permafrost_institute', { kb: kb(1.04, 1.2), over: [low('MELNIKOV PERMAFROST INSTITUTE · YAKUTSK', 'Today')] }),
  ]);
  beats('Y034', [
    S('split', {}),
    S('xsec', { house: 'stone', season: 0, heat: [[0.5, 0], [1.2, 1]], thaw: [[1, 0], [5, 0.8]], sink: [[4, 0], [7, 0.6], [8.5, 1]], crack: [[7.5, 0], [9, 1]], over: [{ type: 'label', text: 'HEAT FLOWS DOWN', x: 1460, y: 700, w: 'heat' }, { type: 'label', text: 'IT SINKS AND CRACKS', x: 960, y: 230, w: 'sinks' }] }),
  ]);
  beats('Y035', [
    S('xsec', { house: 'block', season: 0, frost: 1, piles: [[0, 0], [2, 1]], gap: [[1.5, 0], [3, 1]], wind: [[2.5, 0], [3.5, 1]], over: [chipC('CONCRETE PILES + AN OPEN GAP', 'piles', 980, 56)] }),
    S('mythq', { q: 'The gap keeps the cold out of the building', verdict: 'MYTH', answerAt: 2.8, note: "IT KEEPS THE BUILDING'S HEAT AWAY FROM THE ICE" }),
    V('px_concrete_pillars_structure', { over: [low('THE ICE UNDERNEATH STAYS FROZEN', 'stays')] }),
  ]);
  beats('Y036', [
    V('px_power_plant_smoke_winter', { over: [head('HERE’S THE TWIST', null, 180, 100), chipC('POWER STATIONS · HEATING · RUNNING CARS', 'power', 900, 48)] }),
    S('xsec', { house: 'block', season: 0, frost: 1, cold: 1, wind: 1, over: [{ ...chipC('THIS LAST TRICK PROTECTS THE COLD', null, 980, 56), at: 0.5 }] }),
    Ph('cm_permafrost_kingdom_ice_throne', { kb: kb(1.05, 1.2, 0.5, 0.5, 0.5, 0.45), dark: 0.3, over: [head('WARM INSIDE ONLY IF', 'warm', 380, 92), head('THE GROUND STAYS FROZEN', 'frozen', 500, 92, '#FFC857')] }),
  ]);
  beats('Y037', [
    V('permafrost_soil_pit_scientist', { over: [low('AND THE GROUND IS WARMING', 'warming')] }),
    S('stats', { head: "SHERGIN'S SHAFT · 10 M DOWN", items: [{ pre: '+', v: 3, suf: '°C', label: 'WARMER THAN IN THE 1930s', at: 0.4, size: 260 }], source: 'Source: Kunitsky et al. 2022, Land' }),
    Ph('cm_melnikov_permafrost_institute', { kb: kb(1.22, 1.05, 0.55, 0.5), over: [low('MEASURED FOR ALMOST A CENTURY', null)] }),
  ]);
  beats('Y038', [
    S('stats', { head: 'BUILDING ACCIDENTS FROM THAWING GROUND', items: [{ pre: '+', v: 61, suf: '%', label: 'IN ONE DECADE · YAKUTSK', at: 0.4, size: 260 }], source: 'Source: Streletskiy, Shiklomanov & Nelson 2012' }),
    S('xsec', { house: 'block', season: 0, frost: 1, warm: [[0, 0], [5, 0.7]], sink: [[2, 0], [7, 0.5]], over: [chipC('PARTS OF THE CITY SINK > 4 CM A YEAR', 'satellite', 980, 52), { type: 'note', text: 'SATELLITE (InSAR) MEASUREMENTS', x: 960, y: 1050, align: 'center', size: 26, w: 'satellite' }] }),
  ]);
  beats('Y039', [
    Ph('batagaika_megaslump_satellite_2016', { kb: kb(1.0, 1.25), cold: 0, over: [{ type: 'note', text: 'THAWING PERMAFROST · BATAGAIKA, YAKUTIA · NASA', x: 60, y: 70, at: 0.3 }, head('THE COLD IS NOT THE ENEMY', 'not', 420, 96), head("IT'S THE FOUNDATION", 'foundation', 540, 110, '#FFC857')] }),
  ]);

  // ===== ENDING: back to the experiment =====
  add(T.s('Y040') - 1.8, S('title', { lines: ['BACK TO THE', 'EXPERIMENT'], hl: 1 }), 'fade');
  beats('Y040', [
    V('px_winter_street_people_frost', { in: 2, over: [thermo(-50), low("YOU'VE BEEN OUTSIDE LONG ENOUGH", 'long')] }),
    V('px_night_snow_street_traffic', { in: 6, over: [thermo(-50), low('PAST THE RUNNING CARS AND THE ICE FOG', 'past')] }),
    V('px_fireplace_warm_night', { over: [thermo(20, 'Plus'), head('+20°C', 'Plus', 300, 160, '#FFC857')] }),
  ]);
  beats('Y041', [
    S('district', { title: 'GAS FROM HUNDREDS OF KM AWAY' }),
    S('xsec', { house: 'block', season: 0, frost: 1, pipes: 1, wind: 1, cold: 1, over: [{ type: 'label', text: 'PIPES LIFTED OFF THE GROUND', x: 1500, y: 300, to: [1430, 420], w: 'pipes' }, { type: 'label', text: 'PILES IN FROZEN GROUND', x: 960, y: 760, to: [960, 600], w: 'concrete' }] }),
    V('px_town_night_lights_snow_aerial', { over: [head('KEEPING THE GROUND', 'keeping', 380, 96), head('COLDER STILL', 'colder', 500, 110, '#FFC857')] }),
  ]);
  beats('Y042', [
    Ph('px_lena_river_yakutia_summer', { kb: kb(1.22, 1.05, 0.6, 0.45), over: [low('SUMMER: UP TO +38°C', 'summer')] }),
    S('compare', { title: 'YAKUTSK: COLDEST DAY TO HOTTEST', zeroY: 520, scale: 5.5, items: [{ label: 'RECORD LOW · 1891', v: -64.4, dec: 1, at: 0.3 }, { label: 'RECORD HIGH · 2011', v: 38.4, dec: 1, hl: true, at: 1 }, { label: 'LONDON RECORD · 2022', v: 40.3, dec: 1, w: "London's" }], note: '103° BETWEEN ITS COLDEST AND HOTTEST DAY', noteW: 'hundred', source: 'Source: Roshydromet; UK Met Office' }),
  ]);
  beats('Y043', [
    V('px_aurora_alaska_night', {}),
    S('endq', { img: 'px_siberia_winter_embankment_city', credit: '', lines: ['WOULD YOU SURVIVE', 'A WINTER', 'IN YAKUTSK?'], hl: 2, sub: 'The cold, the dark, or the car that never turns off? · Tell us in the comments' }),
  ]);
  add(T.tl.voiceEnd + T.tl.qcard, S('endscreen', {}), 'fade');
  return out;
}
module.exports = { assets, build, defaultTrans: 'cut', splitOver: 7.5, splitTo: 5.5 };
