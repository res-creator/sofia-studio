// EP17 Phoenix — real Arizona footage (Pixabay), Wikimedia Commons photos (NARA, LOC, Reclamation, NASA, CC authors).
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
const Q = (cutW, top, l1, l2, chipT, source) => S('stats', { cutW, head: top, items: [], sfx: 'boom', over: [at(head(l1, null, l2 ? 470 : 520, 88, Yc), 0.05), ...(l2 ? [at(head(l2, null, 590, 88, Yc), 0.25)] : []), ...(chipT ? [{ ...chipC(chipT, null, l2 ? 740 : 700, 44), at: 0.6 }] : [])], source });
const G = { phx: { lon: -112.07, lat: 33.45 }, havasu: { lon: -114.15, lat: 34.30 }, tucson: { lon: -110.97, lat: 32.22 }, roosevelt: { lon: -111.16, lat: 33.67 }, palo: { lon: -112.86, lat: 33.39 }, gila: { lon: -111.95, lat: 33.10 }, mead: { lon: -114.74, lat: 36.02 }, tempe: { lon: -111.93, lat: 33.43 } };
const GL = (o = {}) => ({ relief: true, borders: true, lon: [[0, -112.6], [3, -112.4]], lat: [[0, 33.8], [3, 33.6]], R: [[0, 9000], [3, 11000]], ...o });

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


  // ===== COLD OPEN (fast beat cuts) =====
  beats('A001', [
    V('px_phoenix_mountains_aerial', 'PHOENIX, ARIZONA', { over: [low('JULY 2023', 'July')] }),
    I('px_arizona_desert_morning', 'SONORAN DESERT', { cutW: 'It\'s' }),
    S('stats', { cutW: 'And', head: 'PHOENIX, SUMMER 2023', items: [], sfx: 'boom', over: [at(head('110°F+', null, 480, 170, Yc), 0.05), at(head('31 DAYS IN A ROW', null, 640, 84), 0.4)], source: 'Source: National Weather Service Phoenix' }),
  ], { start: 0 });
  beats('A002', [I('px_backyard_pool_aerial', 'A BACKYARD POOL')]);
  beats('A003', [
    V('px_scottsdale_golf_mccormick', 'McCORMICK RANCH GOLF COURSE, SCOTTSDALE'),
    V('cm_tempe_town_lake_sailboats', 'TEMPE TOWN LAKE', { cutW: 'There\'s' }),
    V('cm_phoenix_skyline_mountains', 'DOWNTOWN PHOENIX', { cutW: 'And', over: [low('METRO PHOENIX: ~5 MILLION PEOPLE', 'five')] }),
    I('px_tap_water_hands', 'A KITCHEN TAP', { cutW: 'water' }),
  ]);
  beats('A004', [
    V('px_sonoran_saguaro_aerial', 'SONORAN DESERT, ARIZONA', { over: [low('~7 INCHES OF RAIN A YEAR', 'seven')] }),
    S('stats', { cutW: 'That\'s', head: 'RAIN IN A NORMAL YEAR', items: [{ v: 7, pre: '~', suf: '"', label: 'PHOENIX', at: 0.3, color: Yc }, { v: 14, pre: '~', suf: '"', label: 'LOS ANGELES', at: 0.9 }], source: 'Source: NOAA 1991–2020 normals' }),
    V('px_saguaro_desert', 'SAGUARO, SONORAN DESERT', { cutW: 'This' }),
  ]);
  beats('A005', [
    V('gov_iss_phoenix_metro', 'METRO PHOENIX FROM THE SPACE STATION', { over: [head('PUMPED FROM UNDERGROUND?', 'first', 200, 72)] }),
    Q('Nope', 'CITY OF PHOENIX WATER SUPPLY', 'GROUNDWATER: ~2%', null, null, 'Source: City of Phoenix Water Services'),
  ]);
  beats('A006', [
    I('px_lawn_sprinkler_house', 'A LAWN SPRINKLER', { over: [head('WASTING IT?', 'Second', 200, 80)] }),
    V('cm_phoenix_aerial_grid', 'PHOENIX FROM THE AIR', { cutW: 'Well', over: [low('PER PERSON: ~30% LESS THAN 1990', 'thirty')] }),
  ]);
  beats('A007', [
    V('gov_iss_phoenix_night', 'PHOENIX AT NIGHT FROM THE SPACE STATION'),
    V('cm_hohokam_canal', 'HOHOKAM CANAL', { cutW: 'The' }),
  ]);
  beats('A007B', [
    V('cm_pueblo_grande_mound', 'PUEBLO GRANDE, PHOENIX', { over: [low('1 · THE FIRST ENGINEERS', 'first')] }),
    A('cm_roosevelt_speaking_dam', 'ROOSEVELT DAM, 1911', { cutW: 'a', over: [low('2 · A PRESIDENT\'S DAM', 'president')] }),
    V('cm_cap_canal_2013', 'CENTRAL ARIZONA PROJECT CANAL', { cutW: 'a', n: 2, over: [low('3 · A RIVER 336 MILES AWAY', 'three')] }),
    V('cm_katie_hobbs', 'KATIE HOBBS, GOVERNOR OF ARIZONA', { cutW: 'and', kb: { z: [1.0, 1.05], y: [0.34, 0.38] }, over: [low('4 · THE NEW RULES', 'rules')] }),
  ]);
  add(T.e('A007B') + 0.15, S('title', { lines: ['HOW PHOENIX EXISTS', 'IN THE DESERT'], hl: 1, img: 'cm_phoenix_skyline_lights', credit: '', brand: true, sfx: 'riser' }), 'cut');

  // ===== CH1 =====
  chapter('A008', 1, 'The first engineers');
  beats('A008', [V('cm_pueblo_grande_pithouses', 'HOHOKAM PITHOUSE REPLICAS, PUEBLO GRANDE')]);
  beats('A009', [
    V('cm_park_of_the_canals_mesa', 'PREHISTORIC HOHOKAM CANAL, MESA', { over: [low('BUILT WITH STICKS AND BASKETS', 'digging')] }),
    V('cm_phoenix_aerial_downtown', 'THE SALT RIVER VALLEY TODAY', { cutW: 'Archaeologists' }),
    Q('maybe', 'HOHOKAM CANALS (ESTIMATES)', 'UP TO ~1,000 MILES', null, 'BUILT OVER CENTURIES', 'Sources: Pueblo Grande Museum; ASCE; UA WRRC'),
  ]);
  beats('A010', [
    V('cm_hohokam_canal_reconstructed', 'RECONSTRUCTED HOHOKAM CANAL'),
    V('cm_hohokam_canals_map', 'MAP: PREHISTORIC CANALS OF THE SALT RIVER VALLEY', { cutW: 'gravity' }),
  ]);
  beats('A010B', [
    V('cm_sky_harbor_planes', 'PHOENIX SKY HARBOR AIRPORT'),
    V('cm_pueblo_grande_crosscut_canal', 'PUEBLO GRANDE: ANCIENT CANAL BANK', { cutW: 'Jets', over: [head('THOUSAND-YEAR-OLD PLUMBING', 'plumbing', 200, 64, Yc)] }),
  ]);
  beats('A011', [
    V('cm_pueblo_grande_rooms', 'PUEBLO GRANDE RUINS', { over: [low('~1400s: THE BIG VILLAGES EMPTY', 'fourteen')] }),
    V('cm_pueblo_grande_marker', 'PUEBLO GRANDE, NATIONAL HISTORIC LANDMARK', { cutW: 'But' }),
  ]);
  beats('A012', [
    A('cm_jack_swilling_portrait', 'JACK SWILLING', { kb: { z: [1.0, 1.05], y: [0.34, 0.38] }, over: [low('JACK SWILLING · 1867', 'Swilling')] }),
    V('px_arizona_desert_morning', 'SALT RIVER VALLEY', { cutW: 'long' }),
  ]);
  beats('A013', [
    A('cm_jack_swilling', 'JACK SWILLING'),
    V('cm_grand_canal_2012', 'GRAND CANAL, PHOENIX', { cutW: 'So' }),
    I('px_arizona_cotton_fields', 'ARIZONA FARMLAND', { cutW: 'and' }),
  ]);
  beats('A014', [
    V('cm_duppa_adobe', 'DUPPA ADOBE, PHOENIX (1870s)', { over: [low('DARRELL DUPPA PICKS A NAME', 'Duppa')] }),
    V('cm_phoenix_skyline_day', 'DOWNTOWN PHOENIX', { cutW: 'like' }),
    V('cm_phoenix_skyline_night', 'DOWNTOWN PHOENIX', { cutW: 'Phoenix', over: [head('PHOENIX', 'Phoenix', 200, 110, Yc)] }),
  ]);
  beats('A015', [
    V('cm_grand_canal_camelback', 'GRAND CANAL AND CAMELBACK MOUNTAIN'),
    V('cm_grand_canal_sunset', 'GRAND CANAL, PHOENIX', { cutW: 'The', over: [low('SOME CANALS FOLLOW HOHOKAM ROUTES', 'city\'s')] }),
  ]);

  // ===== CH2 =====
  chapter('A016', 2, 'The dam with a president');
  beats('A016', [V('px_salt_river_canyon_drone', 'SALT RIVER CANYON, ARIZONA')]);
  beats('A017', [
    V('cm_salt_river_dry_bed', 'SALT RIVER BED, PHOENIX', { over: [low('DROUGHT ONE YEAR...', 'trickled')] }),
    V('cm_granite_reef_nara', 'SALT RIVER, EARLY 1900s (NARA)', { cutW: 'Other', over: [low('...FLOODS THE NEXT', 'flooded')] }),
  ]);
  beats('A018', [
    A('cm_granite_reef_dam', 'GRANITE REEF DIVERSION DAM (RECLAMATION)', { over: [low('1902: THE RECLAMATION ACT', 'nineteen')] }),
    V('cm_srp_crosscut_powerhouse', 'SALT RIVER PROJECT, CROSS CUT CANAL (NARA)', { cutW: 'They', over: [low('FARMERS PLEDGED THEIR LAND', 'collateral')] }),
  ]);
  beats('A019', [
    V('cm_roosevelt_dam_haer', 'ROOSEVELT DAM, SALT RIVER CANYON', { over: [low('~75 MILES FROM PHOENIX', 'seventy-five')] }),
    A('cm_roosevelt_dam_1911', 'ROOSEVELT DAM, 1911', { cutW: 'On', over: [low('18 MARCH 1911', 'March')] }),
    A('cm_roosevelt_speaking_dam', 'THEODORE ROOSEVELT AT THE DAM, 1911', { cutW: 'Theodore' }),
  ]);
  beats('A020', [
    A('cm_roosevelt_dam_dedication_crowd', 'DEDICATION OF ROOSEVELT DAM, 1911 (LOC)'),
    V('cm_roosevelt_dam_lake', 'THEODORE ROOSEVELT DAM TODAY', { cutW: 'Fill', over: [head('A SAVINGS ACCOUNT FOR WATER', 'savings', 200, 64, Yc)] }),
  ]);
  beats('A021', [
    V('cm_phoenix_aerial_sprawl', 'THE VALLEY FROM THE AIR'),
    S('stats', { cutW: 'Today', head: 'SALT RIVER PROJECT CANALS', items: [{ v: 131, label: 'MILES OF MAIN CANALS', at: 0.3, color: Yc }, { v: 1000, pre: '~', label: 'MILES OF SMALLER ONES', w: 'thousand' }], source: 'Source: Salt River Project' }),
    V('cm_grand_canal_camelback', 'GRAND CANAL, PHOENIX', { cutW: 'That\'s', kb: { z: [1.25, 1.05] } }),
  ]);
  beats('A022', [
    V('cm_salt_river_dry_bed_b', 'THE SALT RIVER IN PHOENIX: USUALLY DRY'),
    V('cm_tempe_town_lake_dry', 'TEMPE TOWN LAKE, DRAINED', { cutW: 'So', over: [low('1999: TEMPE BUILDS A LAKE', 'nineteen')] }),
    V('cm_tempe_town_lake_dams', 'TEMPE TOWN LAKE DAMS', { cutW: 'filled' }),
  ]);
  beats('A023', [V('cm_tempe_town_lake_night', 'TEMPE TOWN LAKE AT NIGHT')]);

  // ===== CH3 =====
  chapter('A024', 3, 'A river 336 miles away');
  beats('A024', [
    V('px_arizona_desert_lake_cliffs', 'ARIZONA RESERVOIR, SALT RIVER COUNTRY'),
    S('bars', { cutW: 'But', title: 'WHERE PHOENIX\'S TAP WATER COMES FROM', sub: 'share of the city\'s supply', max: 60, items: [{ label: 'SALT & VERDE RIVERS', v: 58, text: '~58%', color: C('iceL'), at: 0.3 }, { label: 'COLORADO RIVER (CAP)', v: 40, text: '~40%', color: Yc, w: 'Colorado' }, { label: 'GROUNDWATER', v: 2, text: '~2%', color: C('red'), at: 1.4 }], source: 'Source: City of Phoenix Water Services' }),
    V('cm_lake_havasu', 'LAKE HAVASU, COLORADO RIVER', { cutW: 'The' }),
  ]);
  beats('A025', [
    S('globe', GL({ lon: [[0, -113.2], [3, -112.6]], lat: [[0, 33.6], [3, 33.3]], R: [[0, 7000], [3, 8000]], pins: [{ ...G.havasu, label: 'LAKE HAVASU', at: 0.2 }, { ...G.phx, label: 'PHOENIX', at: 0.8 }, { ...G.tucson, label: 'TUCSON', at: 1.2, small: true, size: 36 }] })),
    V('cm_lake_havasu_aerial', 'LAKE HAVASU FROM THE AIR', { cutW: 'For' }),
  ]);
  beats('A026', [
    A('cm_carl_hayden_1912', 'CARL HAYDEN, 1912', { kb: { z: [1.0, 1.05], y: [0.34, 0.38] }, over: [low('SENATOR CARL HAYDEN', 'Hayden')] }),
    A('cm_carl_hayden_old', 'CARL HAYDEN', { cutW: 'In', kb: { z: [1.0, 1.05], y: [0.34, 0.38] }, over: [low('1968: CAP APPROVED', 'sixty-eight')] }),
  ]);
  beats('A027', [
    V('cm_cap_canal_desert', 'CENTRAL ARIZONA PROJECT CANAL', { over: [low('BUILT 1973–1993', 'seventy-three')] }),
    S('globe', GL({ cutW: 'a', lon: [[0, -112.9], [3, -112.4]], lat: [[0, 33.4], [3, 33.2]], R: [[0, 7000], [3, 7600]], pins: [{ ...G.havasu, label: 'LAKE HAVASU', at: 0.1 }, { ...G.phx, label: 'PHOENIX', at: 1.0 }, { ...G.tucson, label: 'TUCSON', at: 1.8 }], routes: [{ pts: [[-114.15, 34.30], [-113.6, 33.95], [-113.0, 33.75], [-112.3, 33.65], [-112.07, 33.62], [-111.75, 33.4], [-111.55, 33.05], [-111.2, 32.6], [-110.97, 32.22]], at: 0.2, dur: 2.2 }] })),
    S('stats', { cutW: 'That\'s', head: 'THE CAP CANAL', items: [{ v: 336, label: 'MILES LONG', at: 0.2, color: Yc }, { v: 270, pre: '~', label: 'LA → LAS VEGAS (MILES)', at: 0.8 }], source: 'Sources: Central Arizona Project; Bureau of Reclamation' }),
  ]);
  beats('A028', [
    V('cm_cap_aqueduct', 'CAP AQUEDUCT', { over: [head('WATER DOESN\'T FLOW UPHILL', 'Water', 200, 66)] }),
    S('ladder', { cutW: 'So', title: 'HOW HIGH THE CAP LIFTS WATER', max: 3200, min: 0, items: [{ v: 1454, label: 'EMPIRE STATE BUILDING', sub: 'TO THE TIP', at: 0.3 }, { v: 2900, label: 'THE CAP LIFT', sub: '≈ 2 EMPIRE STATE BUILDINGS', w: 'Empire', hl: true }], source: 'Source: Central Arizona Project (~2,900–3,000 ft)', unit: ' FT', step: 500, nosnow: true, rise: true }),
    V('cm_cap_canal_bridge', 'CAP CANAL', { cutW: 'That\'s' }),
  ]);
  beats('A028B', [
    V('cm_cap_canal_geodil', 'CENTRAL ARIZONA PROJECT'),
    V('cm_cap_canal_2013', 'CAP CANAL THROUGH THE HILLS', { cutW: 'A' }),
  ]);
  beats('A029', [
    I('px_cooling_towers', 'A POWER STATION', { over: [low('ONE OF ARIZONA\'S BIGGEST POWER USERS', 'biggest')] }),
    V('cm_phoenix_skyline_lights', 'PHOENIX AT NIGHT', { cutW: 'Basically', over: [head('IT DRINKS ELECTRICITY', 'electricity', 200, 70, Yc)] }),
  ]);
  beats('A030', [V('cm_downtown_from_sky_harbor', 'DOWNTOWN PHOENIX')]);

  // ===== CH4 =====
  chapter('A031', 4, 'The shrinking river');
  beats('A031', [
    V('cm_hoover_dam_black_canyon', 'HOOVER DAM AND LAKE MEAD', { over: [low('~40 MILLION PEOPLE · 7 STATES + MEXICO', 'forty')] }),
    V('cm_st_thomas_cistern', 'ST. THOMAS, NEVADA: RESURFACED BY LOW WATER', { cutW: 'Lake' }),
  ]);
  beats('A031B', [
    V('cm_lake_mead_bathtub_ring', 'LAKE MEAD\'S "BATHTUB RING"', { over: [low('2022: LOWEST SINCE THE 1930s', 'lowest')] }),
    V('cm_lake_mead_drought_aster', 'LAKE MEAD FROM SPACE (NASA)', { cutW: 'That' }),
  ]);
  beats('A032', [
    V('cm_hoover_intake_towers', 'HOOVER DAM INTAKE TOWERS'),
    Q('Arizona', 'ARIZONA\'S 2023 COLORADO RIVER CUT', '592,000 ACRE-FEET', null, '≈ 1/5 OF THE STATE\'S SHARE', 'Source: Bureau of Reclamation / ADWR'),
  ]);
  beats('A033', [
    I('px_scottsdale_golf_mccormick', 'A FIELD OF GRASS', { over: [low('1 ACRE-FOOT ≈ A FOOTBALL FIELD, 1 FT DEEP', 'football')] }),
    V('cm_phoenix_suburbs_plane', 'PHOENIX SUBURBS', { cutW: 'Roughly', over: [low('≈ 2–3 FAMILIES FOR A YEAR', 'families')] }),
  ]);
  beats('A034', [
    V('cm_lake_mead_low', 'LAKE MEAD AT LOW WATER (RECLAMATION)', { over: [low('ARIZONA: JUNIOR RIGHTS', 'junior')] }),
    Q('In', 'NEW FEDERAL PLAN (AUG 2026)', '760,000 ACRE-FEET', 'A YEAR', '2027 AND 2028', 'Source: Bureau of Reclamation, via Axios / City of Phoenix'),
  ]);
  beats('A035', [
    V('px_phoenix_mountains_aerial_b', 'THE PHOENIX AREA', { over: [low('THE WATER UNDER YOUR FEET', 'under')] }),
    V('cm_katie_hobbs_b', 'KATIE HOBBS, GOVERNOR OF ARIZONA', { cutW: 'In', kb: { z: [1.0, 1.05], y: [0.34, 0.38] }, over: [low('GOV. KATIE HOBBS · JUNE 2023', 'Hobbs')] }),
    Q('Over', 'PHOENIX-AREA GROUNDWATER, NEXT 100 YEARS', '~4.8 MILLION', 'ACRE-FEET SHORT', null, 'Source: ADWR groundwater model (June 2023)'),
  ]);
  beats('A036', [
    I('px_suburb_aerial_mountains', 'A NEW SUBDIVISION', { over: [low('NO NEW SUBDIVISIONS ON GROUNDWATER ALONE', 'subdivisions')] }),
    V('cm_phoenix_suburbs_edge', 'THE EDGE OF PHOENIX\'S SUBURBS', { cutW: 'Not' }),
  ]);
  beats('A036B', [
    V('cm_phoenix_aerial_1', 'PHOENIX FROM THE AIR'),
    S('stats', { cutW: 'Since', head: 'TO BUILD A NEW HOME IN THE PHOENIX AREA', items: [], over: [at(head('100 YEARS', null, 500, 160, Yc), 0.1), at(head('OF WATER, PROVEN', null, 640, 70), 0.4)], source: 'Source: ADWR Assured Water Supply rules' }),
  ]);
  beats('A037', [V('gov_iss_phoenix_day', 'PHOENIX FROM THE SPACE STATION', { over: [head('PLANNED FOR THIS', 'planning', 200, 72, Yc)] })]);

  // ===== CH5 =====
  chapter('A038', 5, 'The desert\'s clever tricks');
  beats('A038', [
    V('gov_iss_phoenix_day', 'THE PHOENIX AREA FROM SPACE', { over: [low('PALO VERDE: ~50 MILES WEST OF PHOENIX', 'fifty')] }),
    V('cm_palo_verde_aerial', 'PALO VERDE NUCLEAR GENERATING STATION', { cutW: 'And', over: [low('COOLED WITH TREATED WASTEWATER', 'cooled')] }),
  ]);
  beats('A039', [
    I('px_arizona_desert_morning', 'THE DESERT WEST OF PHOENIX', { over: [head('NO LAKE. NO RIVER. NO OCEAN.', 'isn\'t', 200, 60, Yc)] }),
    I('px_farm_irrigation_canal', 'A WATER PIPELINE ROUTE', { cutW: 'Its' }),
  ]);
  beats('A040', [
    V('cm_lake_pleasant', 'LAKE PLEASANT (CAP STORAGE), NORTH OF PHOENIX', { over: [low('BANKING WATER UNDERGROUND', 'pour')] }),
    Q('The', 'CITY OF PHOENIX, STORED UNDERGROUND', '180,000+ ACRE-FEET', null, null, 'Source: City of Phoenix Water Services'),
  ]);
  beats('A041', [
    V('px_arizona_cotton_fields', 'ARIZONA COTTON FIELDS', { over: [low('FARMS: ~70% OF ARIZONA\'S WATER', 'seventy')] }),
    I('px_suburb_aerial_mountains', 'A SUBURB', { cutW: 'The', kb: { z: [1.2, 1.05] } }),
  ]);
  beats('A041B', [
    I('px_saguaro_desert', 'A DESERT YARD', { over: [low('LAWNS → GRAVEL AND CACTUS', 'gravel')] }),
    S('stats', { cutW: 'Old', head: 'ONE TOILET FLUSH', items: [{ v: 3.5, dec: 1, pre: '~', label: 'GALLONS · OLD', at: 0.3 }, { v: 1.28, dec: 2, label: 'GALLONS · TODAY', w: 'quarter', color: Yc }], source: 'Source: City of Phoenix; Arizona Republic' }),
    V('cm_phoenix_aerial_grid', 'PHOENIX', { cutW: 'That\'s', kb: { z: [1.05, 1.2] } }),
  ]);
  beats('A042', [
    I('px_farm_irrigation_canal', 'FARMLAND AND A CANAL', { over: [low('GILA RIVER INDIAN COMMUNITY, SOUTH OF PHOENIX', 'Gila')] }),
    I('px_solar_panels_close', 'SOLAR PANELS', { cutW: 'switched', over: [low('2024: FIRST SOLAR-OVER-CANAL IN THE US', 'first')] }),
  ]);
  beats('A043', [
    I('px_solar_farm_desert', 'SOLAR IN THE DESERT', { over: [head('POWER ON TOP. WATER BELOW.', 'Electricity', 200, 62, Yc)] }),
    V('cm_hohokam_canal', 'HOHOKAM CANAL', { cutW: 'The' }),
  ]);

  // ===== ENDING =====
  beats('A044', [
    V('cm_pueblo_grande_mound', 'PUEBLO GRANDE'),
    A('cm_roosevelt_dam_1911_b', 'ROOSEVELT DAM, 1911', { cutW: 'a' }),
    V('cm_cap_canal_bridge', 'CAP CANAL', { cutW: 'a', n: 2 }),
    V('cm_phoenix_skyline_wide', 'PHOENIX', { cutW: 'and' }),
  ]);
  beats('A045', [V('px_saguaro_sunset', 'SONORAN DESERT SUNSET', { over: [head('PLANNING 100 YEARS AHEAD', 'hundred', 200, 68, Yc)] })]);
  beats('A046', [
    I('px_resort_pool_night', 'A POOL AT NIGHT'),
    V('cm_cap_canal_desert', 'CAP CANAL', { cutW: 'climbed' }),
    V('cm_grand_canal_sunset', 'GRAND CANAL, PHOENIX', { cutW: 'and' }),
  ]);
  beats('A047', [
    V('cm_phoenix_skyline_sky_harbor', 'PHOENIX', { over: [head('WOULD YOU LIVE HERE?', null, 200, 80, Yc)] }),
    V('gov_iss_phoenix_night', 'PHOENIX AT NIGHT', { cutW: 'And' }),
  ]);
  add(T.tl.voiceEnd + 0.4, S('endscreen', {}), 'fade');
  return out;
}
module.exports = { assets, build, defaultTrans: 'cut', splitOver: 4.5, splitTo: 3, smooth: true };
