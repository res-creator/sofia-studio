// EP19 Kiruna — real Kiruna photos (Wikimedia Commons, CC/PD), generic Arctic B-roll from Pixabay (labelled ILLUSTRATIVE). No AI images.
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

const K = { ch1: 'cm_church_aerial_1', ch2: 'cm_church_aerial_2', ch3: 'cm_church_aerial_3', chFront: 'cm_church_front', chWinter: 'cm_church_winter', chRelief: 'cm_church_relief', chCeil: 'cm_church_ceiling', chSide: 'cm_church_side', chSummer: 'cm_church_summer', chW2011: 'cm_church_winter_2011', chSnow: 'cm_church_snow_2011',
  mvCrowd1: 'cm_move_crowd_1', mvRoad1: 'cm_move_road_1', mvCrowd2: 'cm_move_crowd_2', mvSide: 'cm_move_side', mvStart: 'cm_move_start', mvTrail: 'cm_move_trailers', mvRoad2: 'cm_move_road_2', mvWork: 'cm_move_workers',
  mineTown: 'cm_mine_town_view', ore1: 'cm_ore_loading_1', ore2: 'cm_ore_loading_2', pit1: 'cm_mine_pit_1', pit2: 'cm_mine_pit_2', mineOver: 'cm_mine_over_town', cracks: 'cm_mine_cracks', mineMt: 'cm_mine_mountain', mineSil: 'cm_mine_silhouette', mineSun: 'cm_mine_sunset', plants: 'cm_mine_plants', fire: 'cm_fire_station_mine', mineWRoad: 'cm_mine_winter_road', mineW: 'cm_mine_winter',
  chNight: 'cm_cityhall_night', chW: 'cm_cityhall_winter', chClock: 'cm_cityhall_clock', site1: 'cm_newcentre_site_1', site2: 'cm_newcentre_site_2', site3: 'cm_newcentre_site_3', new22: 'cm_newcentre_2022', newBld: 'cm_newcentre_buildings', crystal: 'cm_crystal_clocktower',
  oldW2000: 'cm_oldtown_winter_2000', oldSt2000: 'cm_oldtown_street_2000', oldHouses: 'cm_oldtown_houses_1998', oldSt1: 'cm_oldtown_street_1', oldSt2: 'cm_oldtown_street_2', lund1: 'cm_lundbohm_house_1', lundNew: 'cm_lundbohm_house_new', lundOffice: 'cm_lundbohm_office',
  winter23: 'cm_winter_town_2023', winterAir: 'cm_winter_aerial', town15: 'cm_town_2015', oldView: 'cm_old_view_1', oldStW: 'cm_old_street_winter', oldTram: 'cm_old_tram', aur1: 'cm_aurora_kiruna', aur2: 'cm_aurora_kiruna_2',
  trainLake: 'cm_ore_train_lake', trainSnow: 'cm_ore_train_snow', train1931: 'cm_ore_train_1931', gabna: 'cm_gabna_reindeer', esrange: 'cm_esrange_rocket', air1: 'cm_town_aerial_1', air2: 'cm_town_aerial_2', fromEast: 'cm_town_from_east', air3: 'cm_town_aerial_3', townMine: 'cm_town_and_mine',
  pxReinDrone: 'px_reindeer_lapland_drone', pxRein: 'px_reindeer_forest', pxSnowRoad: 'px_snow_road_drone', pxSnowForest: 'px_snow_forest_aerial', pxArctic: 'px_arctic_mountains_winter', pxTrain: 'px_cargo_train_winter', pxLoader: 'px_wheel_loader_mine', pxSteel: 'px_steel_sparks', pxSnowNight: 'px_snowfall_town_night', pxAur: 'px_aurora_mountains', pxAur2: 'px_aurora_sky', pxLamp: 'px_underground_lamp', pxTunnel: 'px_rock_tunnel_norway' };
const G = { kir: { lon: 20.225, lat: 67.856 }, nar: { lon: 17.43, lat: 68.44 }, sto: { lon: 18.07, lat: 59.33 }, esr: { lon: 21.10, lat: 67.89 } };
const GL = (o = {}) => ({ relief: true, borders: true, lon: 20.2, lat: 67.86, R: 2600, ...o });

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
    A(K.mvRoad1, 'KIRUNA CHURCH ON THE MOVE, 19 AUG 2025', { over: [low('224 WHEELS', 'wheels')] }),
    V(K.mvTrail, 'KIRUNA CHURCH ON TRAILERS, 2025', { cutW: 'On' }),
    V(K.mvCrowd1, 'THE BIG CHURCH MOVE, 2025', { cutW: 'Slower', over: [low('SLOWER THAN YOU WALK', 'walk')] }),
  ], { start: 0 });
  beats('A002', [V(K.mvRoad2, 'KIRUNA, AUGUST 2025'), V(K.oldSt2000, 'OLD KIRUNA CENTRE', { cutW: 'The' })]);
  beats('A003', [V(K.town15, 'KIRUNA, SWEDEN', { over: [head('WHY MOVE A TOWN?', 'move', 200, 80)] })]);
  beats('A004', [V(K.oldW2000, 'OLD KIRUNA CENTRE IN WINTER'), V(K.cracks, 'CAVED GROUND ON KIIRUNAVAARA', { cutW: 'The' }), V(K.pit2, 'THE MINE NEXT TO TOWN', { cutW: 'It\'s', n: 2 })]);
  beats('A005', [
    S('globe', GL({ lon: [[0, 12], [3, 20.2]], lat: [[0, 58], [3, 67.86]], R: [[0, 900], [3, 3800]], pins: [{ ...G.kir, label: 'KIRUNA', at: 1.2 }, { ...G.sto, label: 'STOCKHOLM', at: 0.6 }] })),
    V(K.winter23, 'WINTER IN KIRUNA', { cutW: 'Around', over: [low('~23,000 PEOPLE', 'thousand')] }),
    V(K.pxAur, 'NORTHERN LIGHTS · ' + IL, { cutW: 'long' }),
  ]);
  beats('A006', [
    V(K.mineOver, 'KIIRUNAVAARA ABOVE THE TOWN', { over: [low('1 · THE MOUNTAIN', 'mountain')] }),
    V(K.lundNew, 'A HOUSE IN THE NEW CENTRE', { cutW: 'see', over: [low('2 · MOVING A TOWN', 'town')] }),
    V(K.mvSide, 'KIRUNA CHURCH, 2025', { cutW: 'ride', over: [low('3 · THE CHURCH', 'church')] }),
    V(K.site3, 'THE NEW CENTRE SITE', { cutW: 'and', over: [low('4 · NOT DONE YET', 'over')] }),
  ]);
  add(T.e('A006') + 0.15, S('title', { lines: ['THE TOWN THAT', 'IS MOVING'], hl: 1, img: K.townMine, credit: '', brand: true, sfx: 'riser' }), 'cut');

  // ===== CH1 =====
  chapter('A007', 1, 'A mountain made of iron');
  beats('A007', [V(K.chRelief, 'KIRUNA CHURCH GABLE'), V(K.pxRein, 'REINDEER · ' + IL, { cutW: 'It', over: [low('GIRON = PTARMIGAN', 'ptarmigan')] }), V(K.gabna, 'GABNA SÁMI VILLAGE, REINDEER HERDING', { cutW: 'The' })]);
  beats('A008', [V(K.mineMt, 'KIIRUNAVAARA'), V(K.mineSun, 'KIIRUNAVAARA AT SUNSET', { cutW: 'Kiirunavaara' })]);
  beats('A009', [
    A(K.oldView, 'KIRUNA, EARLY 1900s', { over: [low('1900: A TOWN PLAN', 'hundred')] }),
    A(K.train1931, 'ELECTRIC ORE TRAIN, 1931', { cutW: 'Soon' }),
    S('globe', GL({ cutW: 'Narvik', lon: 18.9, lat: 68.15, R: 14000, pins: [{ ...G.kir, label: 'KIRUNA', at: 0.2 }, { ...G.nar, label: 'NARVIK', at: 0.5, align: 'right', dx: -22 }], routes: [{ pts: [[20.22, 67.86], [19.5, 68.2], [18.6, 68.35], [17.43, 68.44]], at: 0.6, dur: 1.6 }] })),
  ]);
  beats('A009B', [V(K.esrange, 'ROCKET LAUNCH, ESRANGE SPACE CENTER', { over: [low('ESRANGE · ~25 MI FROM KIRUNA', 'Esrange')] }), V(K.pxAur2, 'NIGHT SKY · ' + IL, { cutW: 'Iron' })]);
  beats('A010', [A(K.oldStW, 'KIRUNA IN WINTER, EARLY 1900s'), V(K.lundOffice, 'LUNDBOHM\'S OFFICE, KIRUNA', { cutW: 'He', over: [low('HJALMAR LUNDBOHM', 'Lundbohm')] }), V(K.chW2011, 'KIRUNA CHURCH', { cutW: 'Hold' })]);
  beats('A011', [V(K.plants, 'LKAB PLANTS AT KIIRUNAVAARA'), Q('world\'s', 'KIIRUNAVAARA', 'WORLD\'S LARGEST', 'UNDERGROUND IRON MINE', 'RUN BY LKAB', 'Source: LKAB')]);
  beats('A012', [V(K.ore1, 'LOADING IRON ORE, KIRUNA MINE'), Q('six', 'IRON ORE MINED EVERY DAY', '≈ 6.5', 'EIFFEL TOWERS', null, 'Source: LKAB')]);
  beats('A013', [V(K.pxTunnel, 'ROCK TUNNEL · ' + IL), V(K.pxLamp, 'UNDERGROUND · ' + IL, { cutW: 'That\'s', over: [low('> HALF A MILE DOWN', 'deeper')] })]);
  beats('A013B', [V(K.pxLoader, 'MINE LOADER · ' + IL), V(K.ore2, 'ORE LOADING, KIRUNA MINE', { cutW: 'giant', over: [low('40 TONNES PER LIFT', 'forty')] }), V(K.trainSnow, 'LKAB ORE TRAIN', { cutW: 'and' }), V(K.fire, 'KIRUNA WITH THE MINE BEHIND', { cutW: 'Every' })]);
  beats('A014', [V(K.pit1, 'CAVED GROUND, KIIRUNAVAARA', { over: [low('SUBLEVEL CAVING', 'sublevel')] }), V(K.pit2, 'CAVED GROUND, KIIRUNAVAARA', { cutW: 'Miners' }), V(K.mineSil, 'KIIRUNAVAARA AT NIGHT', { cutW: 'Blasting', over: [low('BLASTING EVERY NIGHT', 'night')] })]);
  beats('A015', [V(K.cracks, 'CRACKED, SINKING GROUND'), V(K.mineTown, 'THE MINE AND THE TOWN', { cutW: 'And' })]);
  beats('A016', [V(K.mineOver, 'THE MINE AND THE TOWN'), V(K.oldHouses, 'OLD KIRUNA HOMES', { cutW: 'And' })]);
  beats('A017', [V(K.oldSt1, 'OLD KIRUNA CENTRE', { over: [low('2004: THE NEWS', 'four')] }), V(K.townMine, 'KIRUNA CENTRE AND THE MINE', { cutW: 'So' }), Q('Close', 'THE CHOICE', 'CLOSE THE MINE', 'OR MOVE THE TOWN', null, 'Source: Smithsonian; Atlas Obscura')]);

  // ===== CH2 =====
  chapter('A018', 2, 'How do you move a town?');
  beats('A018', [V(K.fromEast, 'KIRUNA SEEN FROM THE NEW CENTRE SITE', { over: [low('NEW CENTRE: ~2 MILES EAST', 'east')] }), V(K.site1, 'THE NEW CENTRE SITE, 2017', { cutW: 'on' })]);
  beats('A019', [V(K.site1, 'THE NEW CENTRE SITE, 2017', { over: [low('LKAB PAYS', 'pays')] })]);
  beats('A020', [V(K.oldSt2, 'OLD KIRUNA CENTRE'), Q('Take', 'IF YOUR HOME IS IN THE WAY', 'VALUE + 25%', null, 'OR A BRAND-NEW HOUSE', 'Source: LKAB'), V(K.newBld, 'NEW KIRUNA CENTRE', { cutW: 'Or' })]);
  beats('A021', [V(K.oldHouses, 'OLD KIRUNA STREET'), V(K.oldW2000, 'OLD KIRUNA IN WINTER', { cutW: 'The' }), V(K.oldSt2000, 'OLD KIRUNA CENTRE', { cutW: 'The', n: 2 })]);
  beats('A022', [V(K.oldSt1, 'OLD KIRUNA CENTRE'), V(K.townMine, 'KIRUNA AND THE MINE', { cutW: 'The', over: [low('"CAUGHT BETWEEN TWO TOWNS"', 'caught')] })]);
  beats('A023', [V(K.lund1, 'HJALMAR LUNDBOHMSGÅRDEN, 2011'), V(K.mvTrail, 'A BUILDING ON TRAILERS, 2025', { cutW: 'It' })]);
  beats('A024', [V(K.lund1, 'LUNDBOHM\'S HOUSE, OLD SITE', { over: [low('CUT INTO 3 PIECES', 'three')] }), V(K.lundNew, 'LUNDBOHM\'S HOUSE, NEW SITE, 2017', { cutW: 'Today' })]);
  beats('A024B', [V(K.mvStart, 'BUILDING ON TRAILERS, KIRUNA'), V(K.mvWork, 'MOVE CREW, KIRUNA', { cutW: 'jack' }), V(K.mvRoad2, 'ROLLING DOWN THE ROAD', { cutW: 'Then' })]);
  beats('A025', [V(K.mvSide, 'ON THE MOVE, KIRUNA'), Q('More', 'HISTORIC BUILDINGS MOVED', '20+', null, 'SO FAR', 'Sources: AP; LKAB')]);
  beats('A026', [V(K.site2, 'NEW TOWN HALL UNDER CONSTRUCTION, 2017'), V(K.chW, 'TOWN HALL "KRISTALLEN"', { cutW: 'They', over: [low('THE CRYSTAL, 2018', 'Crystal')] })]);
  beats('A027', [V(K.crystal, 'KRISTALLEN AND THE OLD CLOCK TOWER'), V(K.chClock, 'THE MOVED CLOCK TOWER', { cutW: 'The' }), V(K.chNight, 'KRISTALLEN AT NIGHT', { cutW: 'Same' })]);
  beats('A028', [V(K.new22, 'NEW KIRUNA CENTRE, 2022'), V(K.newBld, 'NEW KIRUNA CENTRE', { cutW: 'Shops' }), V(K.site3, 'THE NEW CENTRE GROWS', { cutW: 'A' })]);

  // ===== CH3 =====
  chapter('A029', 3, 'The church on wheels');
  beats('A029', [V(K.ch1, 'KIRUNA CHURCH FROM THE AIR'), V(K.chFront, 'KIRUNA CHURCH', { cutW: 'Kiruna', over: [low('FINISHED 1912', 'twelve')] })]);
  beats('A030', [V(K.chSide, 'KIRUNA CHURCH'), V(K.chWinter, 'KIRUNA CHURCH IN WINTER', { cutW: 'So' }), V(K.chCeil, 'INSIDE KIRUNA CHURCH', { cutW: 'with' })]);
  beats('A031', [V(K.chSummer, 'KIRUNA CHURCH'), Q('Swedes', 'SWEDEN\'S FAVOURITE BUILDING', 'BEFORE 1950', null, 'NATIONAL VOTE, 2001', 'Source: Riksutställningar via Kiruna municipality')]);
  beats('A032', [V(K.ch2, 'KIRUNA CHURCH FROM THE AIR'), V(K.mineSun, 'THE MINE NEXT DOOR', { cutW: 'But' })]);
  beats('A033', [V(K.mvStart, 'KIRUNA CHURCH, MOVE DAY'), Q('Three', 'THE PLAN', '1,000+ HOURS', null, 'FOR ONE 3-MILE TRIP', 'Source: AP')]);
  beats('A034', [V(K.mvSide, 'KIRUNA CHURCH ON TRAILERS', { over: [low('~672 TONNES', 'six')] }), V(K.mvTrail, 'KIRUNA CHURCH ON TRAILERS', { cutW: 'That\'s', over: [low('≈ 100 ELEPHANTS', 'elephants')] })]);
  beats('A035', [V(K.mvRoad2, '224 WHEELS'), V(K.mvWork, 'THE MOVE CREW', { cutW: 'And', over: [low('STEERED WITH A JOYSTICK', 'joystick')] })]);
  beats('A036', [V(K.mvRoad1, '19 AUGUST 2025'), Q('And', 'FIRST HOUR', '~30 METERS', null, 'TARGET: 500 M', 'Source: The Guardian via Irish Times')]);
  beats('A037', [V(K.mvCrowd1, 'CROWDS AT THE CHURCH MOVE', { over: [low('~10,000 SPECTATORS', 'ten')] }), V(K.mvCrowd2, 'WATCHING THE CHURCH ROLL BY', { cutW: 'Swedish' }), V(K.mvRoad2, 'LIVE ON SWEDISH TV', { cutW: 'The' })]);
  beats('A038', [V(K.mvSide, 'ARRIVING, 20 AUGUST 2025'), V(K.mvCrowd2, 'THE CHURCH MOVE', { cutW: 'And' })]);
  beats('A039', [V(K.mvRoad1, '113 YEARS · 3 MILES · 2 DAYS'), V(K.ch3, 'KIRUNA CHURCH', { cutW: 'Then' })]);

  // ===== CH4 =====
  chapter('A040', 4, 'Not done yet');
  beats('A040', [V(K.newBld, 'NEW KIRUNA', { over: [head('HAPPY ENDING?', 'ending', 200, 80)] })]);
  beats('A041', [V(K.mineOver, 'THE MINE AND THE TOWN'), V(K.air1, 'KIRUNA FROM THE AIR', { cutW: 'LKAB' })]);
  beats('A042', [Q('Another', 'AUGUST 2025 UPDATE', '+2,700 HOMES', '+6,000 PEOPLE', '≈ A THIRD OF THE TOWN', 'Sources: LKAB; Bloomberg'), V(K.air2, 'KIRUNA CENTRE FROM THE AIR', { cutW: 'That\'s' })]);
  beats('A043', [V(K.air3, 'KIRUNA FROM THE AIR'), Q('About', 'COST OF THE NEW AREA', '~SEK 22.5 BN', null, '≈ $2+ BILLION', 'Source: LKAB'), V(K.chW, 'KIRUNA TOWN HALL', { cutW: 'And' })]);
  beats('A043B', [V(K.oldSt2000, 'OLD KIRUNA CENTRE'), V(K.oldW2000, 'OLD KIRUNA CENTRE', { cutW: 'one' })]);
  beats('A044', [V(K.gabna, 'GABNA SÁMI VILLAGE, REINDEER HERDING'), V(K.pxReinDrone, 'REINDEER HERD · ' + IL, { cutW: 'say', over: [low('A NARROW STRIP OF LAND', 'narrow')] })]);
  beats('A045', [V(K.pxSteel, 'STEELMAKING · ' + IL), V(K.trainLake, 'LKAB ORE TRAIN BY TORNETRÄSK', { cutW: 'And' })]);
  beats('A046', [Q('Europe\'s', 'PER GEIJER, NEAR KIRUNA (2023)', 'EUROPE\'S LARGEST', 'RARE EARTH DEPOSIT', null, 'Source: LKAB'), V(K.pxArctic, 'ARCTIC WINTER · ' + IL, { cutW: 'Those' }), V(K.mineW, 'KIIRUNAVAARA IN WINTER', { cutW: 'Europe' })]);
  beats('A046B', [V(K.pxRein, 'REINDEER · ' + IL), V(K.mineWRoad, 'KIRUNA IN WINTER', { cutW: 'So' })]);
  beats('A047', [V(K.winterAir, 'KIRUNA IN WINTER FROM THE AIR'), V(K.fromEast, 'KIRUNA AND THE MINE', { cutW: 'Which' })]);

  // ===== END =====
  beats('A048', [V(K.townMine, 'KIRUNA AND THE MINE'), V(K.pxSnowNight, 'SNOW AT NIGHT · ' + IL, { cutW: 'Same' }), V(K.aur1, 'NORTHERN LIGHTS, KIRUNA', { cutW: 'Same', n: 3 }), V(K.chNight, 'NEW KIRUNA', { cutW: 'Just' })]);
  beats('A049', [V(K.chSnow, 'KIRUNA CHURCH'), V(K.ch3, 'KIRUNA CHURCH', { cutW: 'getting' })]);
  beats('A050', [V(K.mvRoad1, 'KIRUNA, 2025', { over: [head('NEW HOUSE. OLD STREET. YOUR CALL?', 'deal', 200, 60, Yc)] }), V(K.aur2, 'NORTHERN LIGHTS, KIRUNA', { cutW: 'And' })]);
  add(T.tl.voiceEnd + 0.4, S('endscreen', {}), 'fade');
  return out;
}
module.exports = { assets, build, defaultTrans: 'cut', splitOver: 4.5, splitTo: 3, smooth: true };
