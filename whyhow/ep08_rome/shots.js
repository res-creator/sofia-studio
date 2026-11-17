// EP08 Rome water — mostly real footage and photos of the actual aqueducts, Rome, Pont du Gard, Segovia, Trevi (Wikimedia Commons, Pixabay, Coverr), a new picture every ~2–4 s; diagrams are our own animation.
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

  // ===== COLD OPEN =====
  beats('R001', [
    F('cm_tourists_tossing_coins_trevi_fountain', { over: [head('THE TREVI FOUNTAIN, ROME', null, 200, 90)] }),
    F('px_trevi_cascade_close', { over: [low('THE WATER WAS FIRST BROUGHT HERE 2,000+ YEARS AGO', 'water')] }),
    F('cm_arl_aqua_virgo_tunnel_lit', { over: [head('AN AQUEDUCT BUILT IN 19 BC', 'aqueduct', 200, 90), note('THE AQUA VIRGO TUNNEL, STILL IN USE')] }),
    F('px_trevi_tilt_down', { in: 6, over: [head("AND IT'S STILL RUNNING", 'still', 200, 100, Yc)] }),
  ], { start: 0 });
  beats('R002', [
    F('px_forum_colosseum_above', { over: [low('ANCIENT ROME: ~1 MILLION PEOPLE (ESTIMATE)', 'million')] }),
    S('stats', { head: 'ANCIENT ROME HAD', items: [], over: [at(chipC('NO PUMPS', null, 420, 72), 0.2), { ...chipC('NO ELECTRICITY', null, 560, 72), w: 'electricity' }, { ...chipC('NO STEEL PIPES', null, 700, 72), w: 'steel' }] }),
    F('px_parco_acquedotti_claudia_a', { in: 3, over: [low('FRESH WATER, DAY AND NIGHT', 'fresh')] }),
    F('cm_aniene_river_subiaco_green_banks', { over: [low('FROM SPRINGS DOZENS OF MILES AWAY', 'springs'), note('THE ANIENE VALLEY, SOURCE OF FOUR AQUEDUCTS')] }),
  ]);
  beats('R003', [
    F('cm_arl_aqua_claudia_meadow_walk', { over: [head('SO HOW DID THEY DO IT?', 'how', 200, 96)] }),
    F('px_pont_du_gard_drone_approach', { over: [low('ACROSS MOUNTAINS AND VALLEYS, WITH ONLY GRAVITY', 'mountains')] }),
    F('cm_thomas_cole_painting_aqueduct_near', { over: [head('AND WHY DID IT ALL STOP?', 'why', 200, 96, Yc), note('PAINTING: THOMAS COLE, 1832')] }),
  ]);
  add(T.e('R003') + 0.15, S('title', { lines: ['HOW ANCIENT ROME', 'GOT ITS', 'WATER'], hl: 2, img: 'cm_aqua_claudia_arches_sunny_day', credit: credit('cm_aqua_claudia_arches_sunny_day'), brand: true }), 'cut');

  // ===== CH1 =====
  chapter('R004', 1, 'A city that outgrew its river');
  beats('R004', [
    F('px_tiber_ponte_sant_angelo_st_peters', { over: [low('ROME SITS ON THE RIVER TIBER', 'Tiber')] }),
    F('cm_mouth_cloaca_maxima_tiber_embankment', { over: [low("THE CITY'S SEWERS EMPTIED INTO IT", 'sewers'), note('THE OUTLET OF THE GREAT SEWER, STILL ON THE TIBER')] }),
    F('cm_photograph_forum_boarium_temple_hercules', { over: [low('AND IT OFTEN FLOODED', 'flooded'), note('PHOTO: TIBER FLOOD, 1900')] }),
  ]);
  beats('R005', [
    F('px_tiber_dusk_bridge', { over: [low('THE RIVER · WELLS · LOCAL SPRINGS', 'river')] }),
    F('px_rome_view_marcellus', { over: [low('THE BIGGEST CITY IN THE MEDITERRANEAN', 'biggest')] }),
    F('cm_arl_model_rome_aqueduct', { over: [low("…THAT WASN'T ENOUGH", 'enough'), note('MODEL OF ANCIENT ROME')] }),
  ]);
  beats('R006', [
    st('three', 'THE FIRST AQUEDUCT', [{ v: 312, from: 312, suf: ' BC', label: 'THE AQUA APPIA', at: 0.3, size: 240 }], 'Source: Frontinus; "List of aqueducts in the city of Rome"'),
    F('cm_map_route_aqua_appia', { over: [low('BUILT BY APPIUS CLAUDIUS', 'Appius'), note('MAP: ROUTE OF THE AQUA APPIA')] }),
    F('cm_appian_way_original_roman_paving', { over: [low('THE SAME MAN WHO BUILT THE APPIAN WAY', 'same')] }),
    F('cm_via_appia_antica_stretching_distance', { over: [low('THE VIA APPIA, STILL THERE TODAY', 'famous')] }),
  ]);
  beats('R007', [
    F('cm_arl_porta_maggiore_tilt', { over: [low('MORE AND MORE AQUEDUCTS', 'more')] }),
    st('eleven', 'BY THE 3RD CENTURY AD', [{ v: 11, label: 'AQUEDUCTS CARRIED WATER INTO ROME', at: 0.3, cnt: 0.8, size: 260 }], 'Source: Frontinus; Wikipedia "List of aqueducts in the city of Rome"'),
    F('cm_arl_map_aqueducts_entering_rome', { over: [note('MAP: AQUEDUCT LINES ENTERING ANCIENT ROME')] }),
  ]);
  beats('R008', [
    F('cm_arl_aqua_marcia_specus', { in: 2.5, over: [low('THE LONGEST: THE AQUA MARCIA', 'Marcia')] }),
    st('fifty', 'FROM THE SPRINGS TO ROME', [{ v: 50, suf: '+ MILES', label: 'ABOUT 91 KM', at: 0.3, cnt: 0.8, size: 230 }], 'Source: Wikipedia "Aqua Marcia"'),
    F('cm_upper_aniene_river_near_subiaco', { over: [low('COLD AND CLEAR: "THE BEST WATER IN ROME"', 'cold'), note('THE UPPER ANIENE VALLEY, WHERE ITS SPRINGS ARE')] }),
  ]);

  // ===== CH2 =====
  chapter('R009', 2, 'Downhill all the way');
  beats('R009', [
    F('px_pont_du_gard_through_arch', { over: [head("HERE'S THE SECRET", 'secret', 200, 96)] }),
    S('slope', { title: 'A CHANNEL THAT RUNS VERY SLIGHTLY DOWNHILL', sub: 'from the spring to the city', labels: false, dur: 3.4 }),
    F('cm_arl_open_channel_on_arches', { over: [low('NO PUMPS. GRAVITY DOES EVERYTHING', 'pumps')] }),
  ]);
  beats('R010', [
    F('cm_arl_pont_du_gard_specus_sinter', { in: 1.5, over: [low('THE HARD PART: THE SLOPE', 'slope')] }),
    S('slope', { cutW: 'steep', title: 'GETTING THE SLOPE RIGHT', labels: false, dur: 2.0, tag: 'TOO STEEP: IT WEARS THE CHANNEL AWAY · TOO FLAT: IT STOPS', tagAt: 0.6 }),
    F('cm_long_ruined_arcade_anio_novus', { over: [low('A GENTLE, STEADY DROP', 'gentle')] }),
    F('cm_francis_towne_watercolour_ruined_claudian', { over: [low('OVER DOZENS OF MILES OF HILLS AND VALLEYS', 'dozens'), note('WATERCOLOUR: FRANCIS TOWNE, 1780')] }),
  ]);
  beats('R011', [
    F('cm_castellum_divisorium_n_mes_above', { over: [low('NÎMES, SOUTHERN FRANCE', 'Nimes'), note("THE END OF THE LINE: NÎMES' WATER TANK")] }),
    st('thirty', 'THE NÎMES AQUEDUCT', [{ pre: '~', v: 30, suf: ' MILES', label: 'LONG (ABOUT 50 KM)', at: 0.3, cnt: 0.7, size: 200 }, { pre: '~', v: 40, suf: ' FT', label: 'TOTAL DROP (ABOUT 12.6 M)', w: 'forty', cnt: 0.7, size: 200 }], 'Source: Wikipedia "Pont du Gard"; romaq.org'),
    F('cm_vaulted_channel_n_mes_aqueduct', { over: [note('THE NÎMES AQUEDUCT CHANNEL, IN THE WOODS')] }),
  ]);
  beats('R012', [
    F('px_pont_du_gard_drone_tiers', { over: [low('THE PONT DU GARD', 'Pont')] }),
    st('hundred', 'THE PONT DU GARD', [{ pre: '~', v: 160, suf: ' FT', label: 'HIGH (ABOUT 49 M)', at: 0.3, cnt: 0.7, size: 220 }]),
    F('cm_aerial_along_pont_du_gard', { over: [low('ABOUT 1,500 FEET LONG', 'fifteen')] }),
    st('inch', 'WATER CHANNEL ON TOP, END TO END', [{ v: 1, suf: ' INCH', label: 'OF DROP (ABOUT 2.5 CM)', at: 0.3, cnt: 0.4, size: 260, color: Yc }], 'Source: Structurae; Wikipedia "Pont du Gard" (figures vary)'),
  ]);
  beats('R012B', [
    F('cm_corner_pont_du_gard_showing', { over: [low('THE LOWER ARCHES: NO MORTAR', 'mortar')] }),
    F('cm_large_cut_limestone_blocks_pont', { over: [low('BLOCKS OF SEVERAL TONS', 'tons')] }),
    F('cm_underside_pont_du_gard_arch', { over: [low('HELD BY THEIR OWN WEIGHT AND A PERFECT CUT', 'weight')] }),
  ]);
  beats('R013', [
    F('cm_full_size_replica_chorobates_levelling', { over: [low('NO LASERS. NO GPS.', 'lasers'), note('FULL-SIZE REPLICA')] }),
    F('cm_arl_chorobates_animation', { cutW: 'table', over: [head('A TABLE WITH A WATER LEVEL', 'table', 180, 80)] }),
    F('cm_arl_groma_replica_tilt_up', { cutW: 'sighting', over: [head('A SIGHTING CROSS', 'sighting', 180, 80), note('MUSEUM REPLICA')] }),
  ]);
  beats('R014', [
    F('cm_aqua_claudia_arches_stretching_across', { over: [low('WHAT MOST PEOPLE GET WRONG', 'wrong')] }),
    F('cm_dramatic_low_aqua_claudia_arches', { over: [head('THE ARCHES ARE THE EXCEPTION', 'exception', 200, 90, Yc)] }),
    S('slope', { cutW: 'underground', title: 'MOST OF AN AQUEDUCT RUNS UNDERGROUND', hl: 'tunnel', dur: 2.6 }),
    F('cm_tunnel_aqua_marcia_cut_through', { over: [low('TUNNELS AND BURIED CHANNELS', 'tunnels'), note('AQUA MARCIA TUNNEL, NEAR VICOVARO')] }),
    F('cm_aqua_claudia_arches_beside_ploughed', { over: [low('ARCHES ONLY TO CROSS A VALLEY', 'valley')] }),
  ]);
  beats('R015', [
    F('cm_arl_narrow_channel_toward_light', { over: [low('COOL · CLEAN · SAFE FROM ENEMIES', 'cool')] }),
    F('cm_inside_vaulted_stone_channel_specus', { over: [low('SHAFTS EVERY FEW HUNDRED FEET', 'shafts'), note('INSIDE THE NÎMES AQUEDUCT CHANNEL')] }),
    F('cm_arl_specus_tool_marks', { over: [low('…TO CLIMB DOWN AND CLEAN IT', 'clean')] }),
  ]);
  beats('R016', [
    F('cm_ruined_arches_gier_aqueduct_siphon', { over: [low('A VALLEY TOO DEEP FOR ARCHES', 'deep'), note('GIER AQUEDUCT, LYON')] }),
    S('slope', { cutW: 'sealed', title: 'SEALED PIPES, DOWN AND BACK UP', siphon: true, hl: 'siphon', dur: 2.4, labels: true }),
    F('cm_1818_drawing_inverted_siphons_gier', { over: [low('PUSHED BY ITS OWN PRESSURE', 'pressure'), note('DRAWING, 1818: THE GIER SIPHONS')] }),
    F('cm_gier_aqueduct_siphon_bridge_arches', { over: [low('"AN INVERTED SIPHON"', 'inverted'), note('THE BRIDGE THAT CARRIED THE SIPHON PIPES, BEAUNANT')] }),
  ]);
  beats('R016B', [
    F('cm_ruined_arches_barbegal_aqueduct_near', { over: [low('SOME AQUEDUCTS POWERED MACHINES', 'machines'), note('BARBEGAL AQUEDUCT, NEAR ARLES')] }),
    F('cm_stepped_ruins_barbegal_water_mills', { over: [low('DOWN A HILLSIDE…', 'hillside')] }),
    st('sixteen', 'BARBEGAL MILLS, 2ND CENTURY AD', [{ v: 16, label: 'WATER WHEELS, ONE AFTER ANOTHER', at: 0.3, cnt: 0.8, size: 260 }], 'Source: Wikipedia "Barbegal aqueduct and mills"'),
    F('cm_museum_model_barbegal_mills_16', { over: [low('GRINDING GRAIN FOR THE REGION', 'grain'), note('MUSEUM MODEL, ARLES')] }),
    F('cm_ruins_roman_mill_terraces_barbegal', { over: [low('ONE OF THE FIRST INDUSTRIAL PLANTS', 'industrial')] }),
  ]);

  // ===== CH3 =====
  chapter('R017', 3, 'Free water for everyone');
  beats('R017', [
    F('cm_arl_pompeii_castellum_exterior', { over: [low('A DISTRIBUTION TANK', 'distribution'), note("POMPEII'S WATER TANK")] }),
    F('cm_arl_castellum_pipe_holes', { over: [low('…IN A STRICT ORDER OF PRIORITY', 'priority')] }),
  ]);
  beats('R018', [
    F('cm_arl_pompeii_street_fountain', { over: [low('1. PUBLIC FOUNTAINS: FREE FOR ANYONE', 'public'), note('STREET FOUNTAIN, POMPEII')] }),
    F('cm_terrax_cgi_aqueduct_distribution', { in: 9, cutW: 'baths', over: [low('2. THE PUBLIC BATHS', 'baths'), note('ANIMATION OF ROMAN COLOGNE: TERRA X / ZDF')] }),
    F('cm_arl_lead_pipes_along_wall', { over: [low('3. LAST: PRIVATE HOMES THAT PAID', 'last')] }),
  ]);
  beats('R019', [
    F('cm_nasone_rome_sidewalk_water_running', { over: [low('NO TAPS: THE WATER RAN ALL THE TIME', 'taps')] }),
    F('cm_photo_woman_zinc_tub_nasone', { over: [low('DAY AND NIGHT', 'day'), note('OLD PHOTO, ROME')] }),
    F('cm_cloaca_maxima_grating_roman_forum', { over: [low('THE OVERFLOW FLUSHED THE STREETS AND SEWERS', 'flushed')] }),
  ]);
  beats('R020', [
    F('px_bath_roman_baths_steam', { over: [low('HUGE PUBLIC BATHS', 'baths'), note('ROMAN BATHS IN BATH, ENGLAND')] }),
    F('cm_ostia_antica_public_latrine_rows', { over: [low('PUBLIC TOILETS WITH DOZENS OF SEATS', 'toilets'), note("OSTIA, ROME'S PORT")] }),
    F('cm_latrine_ephesus_marble_seats_water', { over: [low('PEOPLE SAT AND CHATTED', 'chatted'), note('EPHESUS, TURKEY')] }),
    F('cm_two_marble_latrine_seat_holes', { over: [low('NO TOILET PAPER: A SPONGE ON A STICK', 'sponge'), note('OSTIA')] }),
  ]);
  beats('R020B', [
    F('cm_arl_caracalla_walk_a', { over: [low('THE BATHS OF CARACALLA, ROME', 'Caracalla')] }),
    st('thousand', 'BATHERS AT A TIME', [{ v: 1000, suf: '+', label: 'MORE THAN A THOUSAND', at: 0.3, cnt: 0.9, size: 240 }], 'Source: Wikipedia "Baths of Caracalla"', { img: 'cm_massive_ruined_vaults_baths_caracalla' }),
    F('px_caracalla_walls', { over: [low('LIBRARIES · GARDENS · GYMS', 'libraries')] }),
    F('cm_underground_service_tunnels_beneath_baths', { over: [low('ALL FILLED BY AQUEDUCT WATER', 'filled'), note('SERVICE TUNNELS UNDER THE BATHS')] }),
  ]);
  beats('R021', [
    F('px_roman_forum_temple_saturn', { over: [low('ALL THAT DIRTY WATER…', 'dirty')] }),
    F('cm_map_course_cloaca_maxima_through', { over: [low('THE CLOACA MAXIMA, UNDER THE FORUM', 'Cloaca'), note('MAP: COURSE OF THE GREAT SEWER')] }),
    F('cm_piranesi_etching_cloaca_maxima', { over: [low('6TH CENTURY BC: BUILT TO DRAIN A MARSH', 'sixth'), note('ETCHING: PIRANESI, 18TH CENTURY')] }),
    F('cm_cloaca_maxima_stone_arch_tiber', { over: [low('PARTS STILL CARRY RAINWATER TODAY', 'still')] }),
  ]);

  // ===== CH4 =====
  chapter('R022', 4, 'The water thieves');
  beats('R022', [F('cm_arl_aqua_claudia_pier_overcast', { over: [head("WHERE THERE'S FREE WATER, THERE ARE THIEVES", 'thieves', 200, 76, Yc)] })]);
  beats('R023', [
    S('stats', { head: 'A NEW WATER COMMISSIONER', items: [], over: [at(head('AD 97', null, 520, 200, Yc), 0.2), { ...chipC("FRONTINUS: ROME'S WATER COMMISSIONER", null, 720, 56), w: 'Frontinus' }] }),
    F('cm_engraved_portrait_medallion_sextus_julius', { over: [low('A SENATOR NAMED FRONTINUS', 'senator'), note('IMAGINARY PORTRAIT, 1788')] }),
    F('cm_title_page_1513_printed_edition', { over: [low('HE WROTE A WHOLE BOOK ABOUT THE SYSTEM', 'book'), note('PRINTED EDITION, 1513')] }),
  ]);
  beats('R024', [
    F('cm_remains_aqua_marcia', { over: [low('WATER THAT NEVER ARRIVED', 'never')] }),
    F('cm_arl_aqua_claudia_pines_pan', { over: [low('LANDOWNERS TAPPED THE AQUEDUCTS', 'Landowners')] }),
    F('cm_romans_picnicking_grass_aqueduct_arches', { over: [low('IN THE COUNTRYSIDE', 'countryside')] }),
    F('cm_arl_lead_pipes_behind_grille', { over: [low('WATER WORKERS PAID TO CONNECT SECRET PIPES', 'secretly')] }),
  ]);
  beats('R025', [
    F('cm_roman_lead_water_pipes_fistulae', { over: [low('PIPES MADE OF LEAD', 'lead')] }),
    S('stats', { cutW: 'plumbum', head: 'LATIN FOR LEAD', items: [], over: [head('PLUMBUM → PLUMBING', null, 560, 140, Yc)] }),
  ]);
  beats('R026', [
    F('cm_stamped_inscription_roman_lead_pipe', { over: [low('PIPES WERE STAMPED WITH NAMES', 'stamped')] }),
    F('cm_roman_lead_pipe_stamped_emperors', { over: [low("…SO THE CITY KNEW WHOSE PIPE IT WAS", 'belonged'), note("STAMPED WITH THE EMPEROR'S NAME")] }),
    F('cm_arl_castellum_pipe_holes', { in: 6, over: [low('ILLEGAL PIPES TORN OUT', 'tearing')] }),
    F('cm_inscribed_boundary_stone_cippus_aqua', { over: [low('EVERY AQUEDUCT MEASURED', 'measuring'), note('BOUNDARY STONE OF THREE AQUEDUCTS')] }),
  ]);
  beats('R026B', [
    F('cm_arl_porta_tiburtina_aqueduct_arch', { over: [low('FRONTINUS WAS PROUD OF IT', 'proud')] }),
    S('stats', { cutW: 'compare', head: 'FRONTINUS, ON THE AQUEDUCTS (c. AD 97)', items: [], over: [chipC('"COMPARE THESE… TO THE IDLE PYRAMIDS', 'compare', 520, 52), chipC('OR THE USELESS, THOUGH FAMOUS,', 'useless', 640, 52), chipC('WORKS OF THE GREEKS."', 'Greeks', 760, 52)] }),
    F('cm_porta_maggiore_water_channels_check', { over: [note('PORTA MAGGIORE: TWO AQUEDUCT CHANNELS ON TOP')] }),
  ]);

  // ===== CH5 =====
  chapter('R027', 5, 'The day the water stopped');
  beats('R027', [F('cm_19th_century_photo_aqueduct_ruins', { over: [low('500 YEARS OF WATER. THEN IT STOPPED.', 'stopped')] })]);
  beats('R028', [
    F('cm_illustration_vitiges_king_goths_besieging', { over: [low('AD 537: THE GOTHS BESIEGE ROME', 'Gothic'), note('LATER ILLUSTRATION')] }),
    F('cm_arl_aqua_claudia_meadow_wide', { over: [low('THEY CUT THE AQUEDUCTS', 'cut')] }),
  ]);
  beats('R028B', [
    F('cm_engraving_siege_battle_romes_walls', { over: [low('THEN THE GOTHS TRIED SOMETHING CLEVER', 'clever'), note('ENGRAVING: A SIEGE OF ROME')] }),
    F('cm_inside_stone_water_channel_specus', { over: [low('THE CHANNELS WERE EMPTY…', 'empty'), note('INSIDE THE AQUA CLAUDIA CHANNEL')] }),
    F('cm_arl_specus_channel_water', { over: [low('…A WAY RIGHT INTO THE CITY', 'right')] }),
    F('cm_scarpelli_illustration_byzantine_general_belisarius', { over: [low('THE ROMAN COMMANDER, BELISARIUS, EXPECTED IT', 'expected'), note('ILLUSTRATION, EARLY 1900s')] }),
    F('cm_narrow_channel_passage_aqua_marcia', { over: [low('THE CHANNEL WAS ALREADY SEALED', 'sealed')] }),
  ]);
  beats('R029', [
    F('cm_piranesi_etching_ruined_roman_aqueduct', { over: [low('NO MONEY. NO WORKERS. NO REPAIRS.', 'nobody'), note('ETCHING: PIRANESI')] }),
    F('cm_arl_narrow_channel_toward_light', { in: 7, over: [low('MINERAL DEPOSITS AND RUBBLE', 'mineral'), note('DEPOSITS INSIDE AN AQUEDUCT CHANNEL, SOUTHERN FRANCE')] }),
    F('cm_coloured_aquatint_ruined_claudian_aqueduct', { over: [low('ONE BY ONE, THE AQUEDUCTS WENT DRY', 'dry')] }),
  ]);
  beats('R030', [
    F('cm_hackert_rome_ruined_baths_caracalla', { over: [low('FROM HUNDREDS OF THOUSANDS…', 'hundreds'), note('PAINTING: HACKERT, c. 1780')] }),
    F('cm_thomas_cole_roman_campagna_1843', { over: [low('…TO A SMALL TOWN BY THE RIVER', 'town'), note('PAINTING: THOMAS COLE, 1843')] }),
    F('cm_19th_century_photo_tiber_bank', { over: [low('BACK TO THE TIBER AND WELLS', 'back')] }),
  ]);
  beats('R030B', [
    F('cm_piranesi_etching_roman_aqueduct_remains', { over: [low('SOME AQUEDUCTS BECAME BUILDING MATERIAL', 'material')] }),
    F('cm_reconstructed_arch_eifel_aqueduct_vussem', { over: [low('COLOGNE, GERMANY: THE EIFEL AQUEDUCT', 'Cologne')] }),
    F('cm_cross_section_eifel_aqueduct_channel', { over: [low('A THICK LAYER OF MINERAL DEPOSIT', 'thick')] }),
    F('cm_polished_aqueduct_marble_sinter_eifel', { over: [low('CUT OUT AND POLISHED LIKE MARBLE', 'polished')] }),
    F('cm_columns_eifel_aqueduct_sinter_wartburg', { over: [low('…AND USED IN CHURCHES AND CASTLES', 'churches'), note('COLUMNS OF "AQUEDUCT MARBLE", WARTBURG CASTLE')] }),
  ]);
  beats('R031', [
    F('cm_lano_e_painting_aqua_claudia', { over: [low('MORE THAN 1,000 YEARS LATER…', 'thousand')] }),
    F('cm_1553_medal_pope_julius_iii', { over: [low('1400s: POPES RESTORE THE AQUA VIRGO', 'popes'), note('PAPAL MEDAL, 1553')] }),
    F('cm_engraving_trevi_fountain_salvatore_busuttil', { over: [chipC('1762: THE TREVI FOUNTAIN IS FINISHED', 'seventeen', 960, 56), note('OLD ENGRAVING')] }),
    F('cm_map_aqua_virgo_inside_rome', { over: [low('AT THE END OF THE LINE', 'end'), note('MAP: THE AQUA VIRGO INSIDE ROME')] }),
    F('px_trevi_night_warm', { over: [low('A MONUMENT TO THAT WATER', 'monument')] }),
  ]);

  // ===== CH6 =====
  chapter('R032', 6, 'Built to last');
  beats('R032', [
    F('cm_segovia_aqueduct_high_view_a', { over: [low('SEGOVIA, SPAIN', 'Segovia')] }),
    st('twenty', 'THE SEGOVIA AQUEDUCT', [{ v: 20000, suf: '+', label: 'GRANITE BLOCKS', at: 0.3, cnt: 0.9, size: 220 }], 'Source: Wikipedia "Aqueduct of Segovia"; ASCE'),
    F('cm_unmortared_granite_blocks_top_segovia', { over: [low('NOT A DROP OF MORTAR', 'mortar')] }),
    F('cm_arl_segovia_low_angle_walk', { over: [low('IT CARRIED WATER UNTIL THE 1970s', 'carried')] }),
    F('cm_1920s_photo_segovia_aqueduct_towering', { over: [note('PHOTO: SEGOVIA, 1920s')] }),
  ]);
  beats('R033', [
    F('px_pantheon_light_beam', { over: [low('ROMAN CONCRETE HAD A SECRET', 'secret'), note('THE PANTHEON: A ROMAN CONCRETE DOME')] }),
    S('stats', { cutW: 'twenty', head: 'ROMAN CONCRETE', items: [], over: [at(head('MIT STUDY, 2023', null, 400, 110), 0.2), chipC('WHITE LUMPS OF LIME IN THE CONCRETE', 'lumps', 520, 54), chipC('= A BUILT-IN REPAIR KIT', 'repair', 650, 54)], source: 'Source: Seymour, Masic et al., Science Advances (2023)' }),
    F('cm_pantheon_dome_interior_coffers_oculus', { over: [low('A CRACK LETS WATER IN…', 'crack')] }),
    F('px_pantheon_coffers', { over: [low('…THE LIME DISSOLVES AND FILLS IT', 'dissolves')] }),
  ]);
  beats('R034', [
    F('px_man_drinking_nasone', { over: [low('ROME STILL GIVES AWAY ITS WATER', 'gives')] }),
    st('two', 'ROME TODAY', [{ v: 2500, suf: '+', label: '"NASONI" STREET FOUNTAINS', at: 0.3, cnt: 0.9, size: 240 }], 'Source: Wikipedia "Nasone"; Wanted in Rome'),
    F('cm_nasone_piazza_dei_ponziani_rome', { over: [low('FREE, DAY AND NIGHT', 'free')] }),
  ]);
  beats('R035', [
    F('cm_tourist_throwing_coin_his_shoulder', { over: [low('AND THE COINS?', 'coins')] }),
    F('cm_worker_waders_sweeping_coins_drained', { over: [low('COLLECTED FOR CHARITY', 'charity')] }),
    st('million', 'TREVI COINS, GIVEN TO CHARITY', [{ pre: '> €', v: 1, suf: ' MILLION', label: 'A YEAR', at: 0.3, cnt: 0.5, size: 220 }], 'Source: Caritas Rome, via Reuters / CNA (amount varies by year)'),
  ]);

  // ===== ENDING =====
  chapter('R036', 7, 'The answer');
  beats('R036', [F('px_parco_acquedotti_claudia_a', { in: 12 })]);
  beats('R037', [
    F('cm_fontaine_deure_spring_uz_s', { over: [low('CLEAN SPRINGS FAR AWAY', 'springs'), note('THE SPRING OF THE NÎMES AQUEDUCT, UZÈS')] }),
    F('px_pont_du_gard_drone_river', { in: 4, over: [low('DOWNHILL FOR DOZENS OF MILES', 'downhill')] }),
    F('cm_looking_out_aqua_marcia_tunnel', { over: [low('MOSTLY UNDERGROUND', 'underground')] }),
    F('cm_arl_pompeii_street_fountain', { in: 2, over: [low('WATER FOR FREE', 'free')] }),
    F('cm_roman_lead_pipe_fistula_stamped', { over: [low('…AND A FIGHT AGAINST THIEVES', 'thieves')] }),
  ]);
  beats('R038', [
    F('cm_pillement_painting_ruined_aqueduct_arches', { over: [head('WHEN THE WATER STOPPED, ROME STOPPED', 'stopped', 200, 80, Yc)] }),
    F('px_trevi_night_blue_water', { over: [low('A THOUSAND YEARS TO GET IT BACK', 'thousand')] }),
  ]);
  beats('R039', [
    F('cm_arl_aqua_claudia_meadow_walk', { in: 7 }),
    S('endq', { img: 'cm_aqua_claudia_arches_sunny_day', credit: credit('cm_aqua_claudia_arches_sunny_day'), lines: ['WOULD YOU DRINK', 'FROM A 2,000-YEAR-OLD', 'AQUEDUCT?'], hl: 2, sub: 'Tell us in the comments · Which city should we explain next?' }),
  ]);
  add(T.tl.voiceEnd + T.tl.qcard, S('endscreen', {}), 'fade');
  return out;
}
module.exports = { assets, build, defaultTrans: 'cut', splitOver: 4.5, splitTo: 3 };
