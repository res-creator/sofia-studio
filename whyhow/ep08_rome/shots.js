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
    F('cm_trevi_fountain_day_pan', { in: 2, over: [head('THE TREVI FOUNTAIN, ROME', null, 200, 90)] }),
    F('px_trevi_cascade_close', { in: 0.6, over: [head('THIS WATER STARTED FLOWING IN 19 BC', 'nineteen', 200, 84, Yc)] }),
    F('cm_remains_aqua_virgo_aqueduct_rinascente', { cutW: 'Same', over: [low('SAME SPRINGS', 'Same'), note('REMAINS OF ITS AQUEDUCT, THE AQUA VIRGO')] }),
    F('px_trevi_tilt_down', { in: 6, cutW: 'Still', over: [head('STILL RUNNING', 'Still', 200, 110, Yc)] }),
  ], { start: 0 });
  beats('R002', [
    F('px_forum_colosseum_above', { over: [low('A CITY OF ~1 MILLION PEOPLE (ESTIMATE)', 'million')] }),
    F('px_pont_du_gard_drone_tiers', { cutW: 'pumps', over: [head('NO PUMPS', 'pumps', 200, 120)] }),
    F('cm_arl_open_channel_on_arches', { cutW: 'slope', over: [low("JUST A SLOPE YOU CAN'T SEE", 'slope')] }),
  ]);
  beats('R003', [
    F('cm_hermann_vogel_illustration_belisarius_attacking', { over: [head('THEN AN ARMY SWITCHED IT OFF', 'army', 200, 90, Yc), note('ILLUSTRATION: THE SIEGE OF ROME, AD 537')] }),
    F('cm_thomas_cole_painting_aqueduct_near', { cutW: 'took', over: [low('ALMOST 1,000 YEARS TO GET IT BACK', 'thousand'), note('PAINTING: THOMAS COLE, 1832')] }),
    F('cm_arl_aqua_claudia_meadow_walk', { cutW: 'how', over: [head('HOW DID IT GET IN? HOW DID IT STOP?', 'how', 200, 80)] }),
  ]);
  add(T.e('R003') + 0.15, S('title', { lines: ['HOW ANCIENT ROME', 'GOT ITS', 'WATER'], hl: 2, img: 'cm_aqua_claudia_arches_sunny_day', credit: credit('cm_aqua_claudia_arches_sunny_day'), brand: true }), 'cut');

  // ===== CH1 =====
  beats('R004', [
    F('px_tiber_ponte_sant_angelo_st_peters', { over: [low('ROME SITS ON THE RIVER TIBER', 'Tiber')] }),
    F('cm_mouth_cloaca_maxima_tiber_embankment', { over: [note('THE OUTLET OF THE GREAT SEWER, STILL ON THE TIBER')] }),
    F('cm_photograph_forum_boarium_temple_hercules', { over: [note('PHOTO: TIBER FLOOD, 1900')] }),
  ]);
  beats('R005', [
    F('cm_upper_aniene_river_near_subiaco', { over: [low('CLEAN SPRINGS IN THE HILLS', 'springs'), note('THE ANIENE VALLEY, SOURCE OF FOUR AQUEDUCTS')] }),
    F('cm_arl_aqua_marcia_specus', { in: 4.5, cutW: 'fifty', over: [{ type: 'count', from: 50, to: 50, suf: '+ MILES AWAY', label: 'THE AQUA MARCIA: ABOUT 91 KM', w: 'fifty', dur: 0.2, y: 560, size: 150 }] }),
    F('cm_map_route_aqua_appia', { cutW: 'Starting', over: [low('312 BC: THE FIRST, THE AQUA APPIA', 'three'), note('MAP: ROUTE OF THE AQUA APPIA')] }),
    st('eleven', 'BY THE 3RD CENTURY AD', [{ v: 11, from: 11, label: 'AQUEDUCTS CARRIED WATER INTO ROME', at: 0.3, cnt: 0.2, size: 260 }], 'Source: Frontinus; Wikipedia "List of aqueducts in the city of Rome"', { img: 'cm_porta_maggiore_front', dark: 0.62 }),
  ]);

  // ===== CH2 =====
  chapter('R009', 1, 'Downhill all the way');
  beats('R009', [
    F('px_pont_du_gard_through_arch', { over: [head("HERE'S THE SECRET", 'secret', 200, 96)] }),
    S('slope', { title: 'A CHANNEL THAT RUNS VERY SLIGHTLY DOWNHILL', sub: 'from the spring to the city', labels: false, dur: 3.4 }),
    F('cm_arl_open_channel_on_arches'),
  ]);
  beats('R010', [
    F('cm_arl_pont_du_gard_specus_sinter', { in: 1.5, over: [note('INSIDE THE PONT DU GARD CHANNEL')] }),
    S('slope', { cutW: 'steep', title: 'GETTING THE SLOPE RIGHT', labels: false, dur: 2.0, tag: 'TOO STEEP: IT WEARS THE CHANNEL AWAY · TOO FLAT: IT STOPS', tagAt: 0.6 }),
    F('cm_long_ruined_arcade_anio_novus'),
    F('cm_francis_towne_watercolour_ruined_claudian', { over: [note('WATERCOLOUR: FRANCIS TOWNE, 1780')] }),
  ]);
  beats('R011', [
    F('cm_castellum_divisorium_n_mes_above', { over: [low('NÎMES, SOUTHERN FRANCE', 'Nimes'), note("THE END OF THE LINE: NÎMES' WATER TANK")] }),
    st('thirty', 'THE NÎMES AQUEDUCT', [{ pre: '~', from: 30, v: 30, suf: ' MILES', label: 'LONG (ABOUT 50 KM)', at: 0.3, cnt: 0.2, size: 200 }, { pre: '~', from: 40, v: 40, suf: ' FT', label: 'TOTAL DROP (ABOUT 12.6 M)', w: 'forty', cnt: 0.2, size: 200 }], 'Source: Wikipedia "Pont du Gard"; romaq.org', { img: 'cm_open_trench_n_mes_aqueduct', dark: 0.62 }),
    F('cm_vaulted_channel_n_mes_aqueduct', { over: [note('THE NÎMES AQUEDUCT CHANNEL, IN THE WOODS')] }),
  ]);
  beats('R012', [
    F('px_pont_du_gard_drone_tiers', { over: [low('THE PONT DU GARD', 'Pont')] }),
    st('hundred', 'THE PONT DU GARD', [{ pre: '~', v: 160, suf: ' FT', label: 'HIGH (ABOUT 49 M)', at: 0.3, cnt: 0.7, size: 220 }], null, { img: 'px_pont_du_gard_b', dark: 0.55 }),
    F('cm_aerial_along_pont_du_gard', { over: [low('ABOUT 1,500 FEET LONG', 'fifteen')] }),
    S('inch', { cutW: 'water' }),
  ]);
  beats('R012B', [
    F('cm_corner_pont_du_gard_showing', { over: [low('THE LOWER ARCHES: NO MORTAR', 'mortar')] }),
    F('cm_large_cut_limestone_blocks_pont'),
    F('cm_underside_pont_du_gard_arch'),
  ]);
  beats('R013', [
    F('cm_full_size_replica_chorobates_levelling', { over: [note('FULL-SIZE REPLICA')] }),
    F('cm_arl_chorobates_animation', { cutW: 'table', over: [head('A TABLE WITH A WATER LEVEL', 'table', 180, 80)] }),
    F('cm_arl_groma_replica_tilt_up', { cutW: 'sighting', over: [head('A SIGHTING CROSS', 'sighting', 180, 80), note('MUSEUM REPLICA')] }),
  ]);
  beats('R014', [
    F('cm_aqua_claudia_arches_stretching_across'),
    F('cm_dramatic_low_aqua_claudia_arches', { over: [head('THE ARCHES ARE THE EXCEPTION', 'exception', 200, 90, Yc)] }),
    S('slope', { cutW: 'underground', title: 'MOST OF AN AQUEDUCT RUNS UNDERGROUND', hl: 'tunnel', under: true, dur: 2.2 }),
    F('cm_tunnel_aqua_marcia_cut_through', { over: [note('AQUA MARCIA TUNNEL, NEAR VICOVARO')] }),
    F('cm_aqua_claudia_arches_beside_ploughed'),
  ]);
  beats('R015', [
    F('cm_arl_narrow_channel_toward_light', { over: [note('AQUEDUCT CHANNEL, SOUTHERN FRANCE')] }),
    F('cm_inside_vaulted_stone_channel_specus', { over: [low('SHAFTS EVERY FEW HUNDRED FEET', 'shafts'), note('INSIDE THE NÎMES AQUEDUCT CHANNEL')] }),
    F('cm_arl_specus_tool_marks'),
    F('cm_illustration_vitiges_king_goths_besieging', { cutW: 'enemy', over: [head('ONE DAY, AN ARMY WOULD TRY TO USE THEM', 'enemy', 200, 80, Yc), note('LATER ILLUSTRATION: THE GOTHS AT ROME')] }),
  ]);
  beats('R016', [
    F('cm_ruined_arches_gier_aqueduct_siphon', { over: [note('GIER AQUEDUCT, LYON')] }),
    S('slope', { cutW: 'sealed', title: 'SEALED PIPES, DOWN AND BACK UP', siphon: true, hl: 'siphon', dur: 1.5, labels: true }),
    F('cm_1818_drawing_inverted_siphons_gier', { over: [note('DRAWING, 1818: THE GIER SIPHONS')] }),
    F('cm_gier_aqueduct_siphon_bridge_arches', { over: [low('"AN INVERTED SIPHON"', 'inverted'), note('THE BRIDGE THAT CARRIED THE SIPHON PIPES, BEAUNANT')] }),
  ]);

  // ===== CH3 =====
  chapter('R017', 2, 'Free water for everyone');
  beats('R017', [
    F('cm_arl_pompeii_castellum_exterior', { over: [low('A DISTRIBUTION TANK', 'distribution'), note("POMPEII'S WATER TANK")] }),
    F('cm_arl_castellum_pipe_holes', { over: [note("NÎMES' WATER TANK, FRANCE")] }),
  ]);
  beats('R018', [
    F('cm_arl_pompeii_street_fountain', { over: [low('1. PUBLIC FOUNTAINS: FREE FOR ANYONE', 'public'), note('STREET FOUNTAIN, POMPEII')] }),
    F('cm_terrax_cgi_aqueduct_distribution', { in: 7, cutW: 'Then', over: [low('2. THE PUBLIC BATHS', 'baths'), { ...note('ANIMATION OF ROMAN COLOGNE: TERRA X / ZDF'), y: 130, at: 0.1 }] }),
    F('cm_arl_lead_pipes_along_wall', { cutW: 'rich', over: [low('3. LAST: PRIVATE HOMES, FOR THOSE WHO PAID', 'rich')] }),
  ]);
  beats('R019', [
    F('cm_nasone_rome_sidewalk_water_running', { over: [note('TODAY: A ROMAN "NASONE" STREET FOUNTAIN')] }),
    F('cm_photo_woman_zinc_tub_nasone', { over: [note('OLD PHOTO, ROME')] }),
    F('cm_cloaca_maxima_grating_roman_forum'),
  ]);
  beats('R020', [
    F('px_bath_roman_baths_steam', { over: [note('ROMAN BATHS IN BATH, ENGLAND')] }),
    F('cm_ostia_antica_public_latrine_rows', { over: [low('PUBLIC TOILETS: DOZENS OF SEATS', 'toilets'), note("OSTIA, ROME'S PORT")] }),
    F('cm_latrine_ephesus_marble_seats_water', { over: [note('EPHESUS, TURKEY')] }),
  ]);
  beats('R020B', [
    F('cm_arl_caracalla_walk_a', { over: [low('THE BATHS OF CARACALLA, ROME', 'Caracalla')] }),
    st('thousand', 'BATHERS AT A TIME', [{ v: 1000, suf: '+', label: 'ESTIMATES GO UP TO ~1,600', at: 0.3, cnt: 0.9, size: 240 }], 'Source: Wikipedia "Baths of Caracalla"', { img: 'cm_massive_ruined_vaults_baths_caracalla' }),
    F('px_caracalla_walls'),
    F('cm_underground_service_tunnels_beneath_baths', { over: [note('SERVICE TUNNELS UNDER THE BATHS')] }),
  ]);

  // ===== CH4 =====
  chapter('R022', 3, 'The water thieves');
  beats('R022', [F('cm_arl_aqua_claudia_pier_overcast', { over: [head("WHERE THERE'S FREE WATER, THERE ARE THIEVES", 'thieves', 200, 76, Yc)] })]);
  beats('R023', [
    S('stats', { img: 'cm_porta_maggiore_tomb_eurysaces', dark: 0.62, head: 'A NEW WATER COMMISSIONER', items: [], over: [at(head('AD 97', null, 520, 200, Yc), 0.2), { ...chipC("FRONTINUS: ROME'S WATER COMMISSIONER", null, 720, 56), w: 'Frontinus' }] }),
    F('cm_engraved_portrait_medallion_sextus_julius', { over: [low('A SENATOR NAMED FRONTINUS', 'senator'), note('IMAGINARY PORTRAIT, 1788')] }),
    F('cm_title_page_1513_printed_edition', { over: [note('PRINTED EDITION, 1513')] }),
  ]);
  beats('R024', [
    F('cm_remains_aqua_marcia'),
    F('cm_arl_aqua_claudia_pines_pan'),
    F('cm_photograph_aqua_claudia_arches_campagna', { over: [note('OLD PHOTO: THE ROMAN CAMPAGNA')] }),
    F('cm_arl_lead_pipes_behind_grille', { over: [low('WATER WORKERS PAID TO CONNECT SECRET PIPES', 'secretly')] }),
  ]);
  beats('R025', [
    F('cm_roman_lead_water_pipes_fistulae'),
    S('stats', { cutW: 'plumbum', img: 'cm_roman_lead_pipes_found_arles', dark: 0.62, head: 'LATIN FOR LEAD', items: [], over: [head('PLUMBUM → PLUMBING', null, 560, 140, Yc)] }),
  ]);
  beats('R026', [
    F('cm_stamped_inscription_roman_lead_pipe', { over: [low('PIPES WERE STAMPED WITH NAMES', 'stamped')] }),
    F('cm_roman_lead_pipe_stamped_emperors', { kb: { z: [1.0, 1.04] }, over: [low("…SO THE CITY KNEW WHOSE PIPE IT WAS", 'belonged'), note("STAMPED WITH THE EMPEROR'S NAME")] }),
    F('cm_roman_lead_pipes_one_imperial', { kb: { z: [1.0, 1.05] }, over: [] }),
    F('cm_inscribed_boundary_stone_cippus_aqua', { over: [note('BOUNDARY STONE OF THREE AQUEDUCTS')] }),
  ]);

  // ===== CH5 =====
  chapter('R027', 4, 'The day the water stopped');
  beats('R027', [F('cm_19th_century_photo_aqueduct_ruins', { over: [low('800+ YEARS OF WATER. THEN IT STOPPED.', 'stopped'), note('PHOTO, 1800s')] })]);
  beats('R028', [
    F('cm_illustration_vitiges_king_goths_besieging', { over: [low('AD 537: THE GOTHS BESIEGE ROME', 'Gothic'), note('LATER ILLUSTRATION')] }),
    F('cm_arl_aqua_claudia_meadow_wide'),
  ]);
  beats('R028B', [
    F('cm_engraving_siege_battle_romes_walls', { over: [note('ENGRAVING: A SIEGE OF ROME')] }),
    F('cm_inside_stone_water_channel_specus', { over: [note('INSIDE THE AQUA CLAUDIA CHANNEL')] }),
    F('cm_arl_specus_channel_water'),
    F('cm_scarpelli_illustration_byzantine_general_belisarius', { over: [low('THE ROMAN COMMANDER, BELISARIUS, EXPECTED IT', 'expected'), note('ILLUSTRATION, EARLY 1900s')] }),
    F('cm_narrow_channel_passage_aqua_marcia', { over: [low('THE CHANNEL WAS ALREADY SEALED', 'sealed')] }),
  ]);
  beats('R029', [
    F('cm_piranesi_etching_ruined_roman_aqueduct', { over: [note('ETCHING: PIRANESI')] }),
    F('cm_arl_narrow_channel_toward_light', { in: 7, over: [note('DEPOSITS INSIDE AN AQUEDUCT CHANNEL, SOUTHERN FRANCE')] }),
    F('cm_coloured_aquatint_ruined_claudian_aqueduct', { over: [note('AQUATINT, 19TH CENTURY')] }),
  ]);
  beats('R030', [
    F('cm_hackert_rome_ruined_baths_caracalla', { kb: { z: [1.45, 1.55], x: [0.5, 0.52], y: [0.78, 0.78] }, over: [low('FROM HUNDREDS OF THOUSANDS…', 'hundreds'), note('PAINTING: HACKERT, c. 1780')] }),
    F('cm_thomas_cole_roman_campagna_1843', { over: [note('PAINTING: THOMAS COLE, 1843')] }),
    F('cm_19th_century_photo_tiber_bank', { over: [note('PHOTO, 1800s')] }),
  ]);
  beats('R030B', [
    F('cm_piranesi_etching_roman_aqueduct_remains', { over: [note('ETCHING: PIRANESI')] }),
    F('cm_reconstructed_arch_eifel_aqueduct_vussem', { over: [low('COLOGNE, GERMANY: THE EIFEL AQUEDUCT', 'Cologne'), note('PARTLY RECONSTRUCTED BRIDGE, VUSSEM')] }),
    F('cm_cross_section_eifel_aqueduct_channel'),
    F('cm_polished_aqueduct_marble_sinter_eifel'),
    F('cm_columns_eifel_aqueduct_sinter_wartburg', { over: [note('COLUMNS OF "AQUEDUCT MARBLE", WARTBURG CASTLE')] }),
  ]);
  beats('R031', [
    F('cm_lano_e_painting_aqua_claudia', { over: [low('ALMOST 1,000 YEARS LATER…', 'thousand'), note('PAINTING: LANOÜE, 19TH CENTURY')] }),
    F('cm_1553_medal_pope_julius_iii', { over: [low('1400s: POPES RESTORE THE AQUA VIRGO', 'popes'), note('PAPAL MEDAL, 1553')] }),
    F('cm_engraving_trevi_fountain_salvatore_busuttil', { over: [chipC('1762: THE TREVI FOUNTAIN IS FINISHED', 'seventeen', 960, 56), note('OLD ENGRAVING')] }),
    F('cm_map_aqua_virgo_inside_rome', { over: [note('MAP: THE AQUA VIRGO INSIDE ROME')] }),
    F('px_trevi_night_warm'),
  ]);

  // ===== CH6 =====
  chapter('R032', 5, 'Built to last');
  beats('R032', [
    F('cm_segovia_aqueduct_high_view_a', { over: [low('SEGOVIA, SPAIN', 'Segovia')] }),
    F('px_segovia_granite_close', { over: [{ type: 'count', from: 0, to: 20000, suf: '+', label: 'GRANITE BLOCKS · NO MORTAR', w: 'twenty', dur: 0.9, y: 560, size: 170 }] }),
    F('cm_arl_segovia_low_angle_walk', { over: [low('CARRIED WATER UNTIL THE 1970s', 'carried')] }),
  ]);
  beats('R033', [
    F('px_pantheon_light_beam', { over: [low('MIT, 2023: ROMAN CONCRETE HEALS ITS OWN CRACKS', 'MIT'), note('THE PANTHEON: A ROMAN CONCRETE DOME')] }),
    F('px_pantheon_coffers'),
  ]);
  beats('R034', [
    F('cm_nasone_drinking_fountain_rome_street', { over: [low('IN ROME, WATER IS STILL FREE', 'free')] }),
    F('cm_nasone_piazza_dei_ponziani_rome', { over: [{ type: 'count', from: 0, to: 2500, suf: '+', label: '"NASONI" STREET FOUNTAINS', w: 'two', dur: 0.9, y: 560, size: 170 }] }),
    F('cm_nasone_rome_sidewalk_water_running'),
  ]);
  beats('R035', [
    F('cm_worker_waders_sweeping_coins_drained', { over: [low('AND THE COINS? COLLECTED FOR CHARITY', 'coins')] }),
    F('cm_coins_water_trevi_fountain', { over: [{ type: 'count', pre: '> €', from: 1, to: 1, suf: ' MILLION A YEAR', w: 'million', dur: 0.3, y: 560, size: 140 }] }),
  ]);

  // ===== ENDING =====
  chapter('R036', 6, 'The answer');
  beats('R036', [F('px_parco_acquedotti_claudia_a', { in: 12 })]);
  beats('R037', [
    F('cm_fontaine_deure_spring_uz_s', { over: [note('THE SPRING OF THE NÎMES AQUEDUCT, UZÈS')] }),
    F('px_pont_du_gard_drone_river', { in: 4, cutW: 'gravity' }),
    F('cm_looking_out_aqua_marcia_tunnel', { cutW: 'underground' }),
    F('cm_arl_pompeii_street_fountain', { in: 2, cutW: 'free' }),
    F('cm_stamped_inscription_roman_lead_pipe', { kb: { z: [1.0, 1.05] }, cutW: 'thieves' }),
  ]);
  beats('R038', [
    F('cm_pillement_painting_ruined_aqueduct_arches', { over: [head('WHEN THE WATER STOPPED, ROME STOPPED', 'stopped', 200, 80, Yc), { ...note('PAINTING: PILLEMENT, 18TH CENTURY'), y: 1030 }] }),
    F('px_trevi_night_blue_water'),
  ]);
  beats('R039', [
    F('cm_arl_aqua_claudia_meadow_walk', { in: 7 }),
    S('endq', { img: 'cm_aqua_claudia_arches_sunny_day', credit: credit('cm_aqua_claudia_arches_sunny_day'), lines: ['WOULD YOU DRINK', 'FROM A 2,000-YEAR-OLD', 'AQUEDUCT?'], hl: 2, sub: 'Tell me in the comments · Which city should we explain next?' }),
  ]);
  add(T.tl.voiceEnd + T.tl.qcard, S('endscreen', {}), 'fade');
  return out;
}
module.exports = { assets, build, defaultTrans: 'cut', splitOver: 4.5, splitTo: 3 };
