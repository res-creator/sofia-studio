// EP18 Iquitos — real Iquitos photos (Wikimedia Commons, CC/PD), generic Amazon B-roll from Pixabay (labelled ILLUSTRATIVE). No AI images.
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
// short names for footage keys
const K = { old1925: 'cm_ccc_no_11_1925_vista_panoramica_de_una_parte_de_', st1926: 'cm_ccc_no_20_1926_a_traves_de_sud_america_bajo_la_l', river1926: 'cm_ccc_no_24_1926_en_las_selvas_del_amazonas_ritos_',
  air1928: 'cm_ccc_no_37_1928_el_nuevo_servicio_aereo_con_iquitx', st1929a: 'cm_ccc_no_43_1929_iquitos_la_gran_capital_de_nuestr', st1929b: 'cm_ccc_no_43_1929_iquitos_la_gran_capital_de_nuestrx', church1929: 'cm_ccc_no_43_1929_iquitos_la_gran_capital_de_nuestrxx',
  barracks: 'cm_barracks_of_the_loreto_regiment_in_iquitos_peru', prospero1910: 'cm_calle_prospero_iquitos_1910', rail1: 'cm_el_ferrocarril_de_iquitos_peru', rail2: 'cm_el_ferrocarril_en_plaza_de_armas_de_iquitos_peru', rail3: 'cm_primer_ferrocarril_de_iquitos',
  seaplanes: 'cm_hidroaviones_peruanos', iq1900: 'cm_iquitos_1900', pier: 'cm_lower_end_of_the_pier_at_iquitos', prefectura: 'cm_n_269_yquitos_prefectura_y_cuartel', belenOld: 'cm_n_270_yquitos_calle_de_belen', portOld: 'cm_n_271_yquitos_puerto',
  steam1900: 'cm_photograph_of_a_steamship_at_iquitos_circa_1900', balsaOld: 'cm_balsa_houses_at_iquitos_peru', warehouse: 'cm_shipments_a_warehouse_in_iquitos_between_1920_25', booth: 'cm_the_booth_pier_iquitos',
  rubberLanding: 'cm_rubber_on_the_landing_stage_at_iquitos', atracadero: 'cm_un_atracadero_en_iquitos', rubberProc: 'cm_processing_rubber_at_argelia_circa_1912', rubberLoad: 'cm_loading_rubber_from_la_florida_a_peruvian_amazon', arana: 'cm_julio_cesar_arana_on_the_road_to_atenas',
  tapSpiral: 'cm_spiral_tapping_of_hevea_brasiliensis', tapCup: 'cm_koh_chang_thailand_rubber_tapping_latex', tapTree: 'cm_rubber_tree_tapping', tapped: 'cm_tapped_rubber_tree', latex: 'cm_latex_being_collected_from_a_tapped_rubber_tree',
  fitzModel: 'cm_filmmuseum_berlin_fitzcarraldo_boat_model', fitzModel2: 'cm_filmmuseum_berlin_fitzcarraldo_boat_model_2', fitzBar: 'cm_fizcarraldo_iquitos_peru',
  iron1: 'cm_iquitos_casa_de_hierro_4', iron2: 'cm_la_casa_de_fierro_iquitos_peru', ironOld: 'cm_casadefierro_plaza_antiguedad',
  tile1: 'cm_c010_sin_nombre_1', tile2: 'cm_c011_sin_nombre_1', barcia: 'cm_c012_casa_de_barcia_1', tile4: 'cm_c014_sin_nombre_1', tile5: 'cm_c045_sin_nombre_1', tile6: 'cm_c019_sin_nombre_2', strass: 'cm_c023_casa_de_strassberger', hern: 'cm_c021_casa_de_hernandez_2', kahn: 'cm_c020_casa_de_kahn_1',
  drone: 'cm_morb_drone', skyline: 'cm_skyline_iquitos', disco1: 'cm_discoteca_en_iquitos', disco2: 'cm_discotecas_en_iquitos', ucp: 'cm_entrada_de_la_ucp', air: 'cm_iquitos_desde_el_aire', santaClara: 'cm_santa_clara_drone', plaza2012: 'cm_iquitos_2012_plaza',
  fromRiver: 'cm_vista_ciudad_desde_rio', plaza: 'cm_plaza_de_armas_en_iquitos', cathedral: 'cm_catedral_de_iquitos_peru', night: 'cm_iquitos_en_la_noche', malecon: 'cm_malecon_tarapaca', malecon2: 'cm_iquitos_city_malecon',
  ave1: 'cm_avenida_jose_abelardo_quinones_de_iquitos', ave2: 'cm_avenida_la_participacion', traffic: 'cm_iquitos_traffic_9138526280', jam: 'cm_motocarro_traffic_jam', moto1: 'cm_iquitos_nx_10', moto2: 'cm_iquitos_nx_9', moto3: 'cm_motocars_iquitos_peru', moto4: 'cm_iquitosmoto', moto5: 'cm_motocarro_iquitos',
  timber: 'cm_amazonas_iquitos_leticia_kolumbien_11472107875', port1: 'cm_puerto_en_iquitos_2026', port2: 'cm_puerto_en_iquitos_enero_2026', yuri: 'cm_ep_geografia_yurimaguas', shipyard: 'cm_sima_iquitos', transat: 'cm_transatlantic_steamships_at_the_port_of_iquitos',
  amz1: 'cm_amazonas_iquitos_leticia_kolumbien_11472506936', amz2: 'cm_amazonas_iquitos_leticia_kolumbien_11473071826', road1: 'cm_santa_clara_curva', road2: 'cm_carretera_iquitos_nauta', road3: 'cm_ruta_lo_103', roadBuild: 'cm_carretera_en_construccion_de_la_nueva_ciudad_de_', sign: 'cm_pe_5n_i_route_sign',
  plane: 'cm_viva_air_peru', airport: 'cm_aeropuerto_internacional_francisco_secada_vignet', floatplane: 'cm_hidroavion_de_flotadores_en_iquitos', power1: 'cm_electro_oriente', power2: 'cm_empresa_de_electro_oriente',
  village: 'cm_amazonas_floating_village_iquitos_photo_by_sasch', belen1: 'cm_belen_iquitos_11473601463', belen2: 'cm_belen_iquitos_11473826413', belenSt: 'cm_calle_en_belen_bajo', float1: 'cm_floating_house_iquitos_sg', float2: 'cm_floating_house_iquitos', float3: 'cm_floating_houses_on_the_amazon',
  iqAmz: 'cm_iquitos_amazonico', canoe: 'cm_iquitos_peru_11470859936', nx6: 'cm_iquitos_nx_6', nx7: 'cm_iquitos_nx_7', nx8: 'cm_iquitos_nx_8', belenLife: 'cm_life_around_belen_district_6745157177', flood1: 'cm_shelter_flooding_water_continues_to_rise', flood2: 'cm_inundacion_iquitos',
  varzea: 'cm_selva_de_varzea_a_las_afueras_de_iquitos_maynas', belen3: 'cm_belen_iquitos_peru', belen4: 'cm_belen_iquitos_11473478223', belenLow1: 'cm_belen_zona_baja_6745151459', belenLow2: 'cm_belen_zona_baja_6745152879', venice: 'cm_venice_of_the_amazon',
  mkt1: 'cm_belen_market', mkt2: 'cm_belen_market_pasaje_paquito_6745149793', mkt3: 'cm_belen_market_pasaje_paquito', paiche: 'cm_paiche_en_belen', fest1: 'cm_festival_de_belen_iquitos_06', fest2: 'cm_festival_de_belen_iquitos_29', fest3: 'cm_festival_de_belen_iquitos_11',
  dol1: 'cm_bufeo_colorado', dol2: 'cm_amazon_river_dolphin_6', dol3: 'cm_amazon_river_dolphin_3', dol4: 'cm_inia_geoffrensis_geoffrensis_62673186', dol5: 'cm_inia_geoffrensis_179341177', agu1: 'cm_aguaje_fruto', agu2: 'cm_fruto_de_aguaje_mauritia_flexuosa',
  fruit1: 'cm_iquitos_peru_11470824354', fruit2: 'cm_cauz89an', fruit3: 'cm_local_fruit', fruit4: 'cm_more_fruit', nanay: 'cm_the_amazon_meets_rio_nanay', sunset: 'cm_atardecer', amz1983: 'cm_amazon_1983_50734537801', defor: 'cm_deforestation',
  pxMist: 'px_amazon_river_mist_aerial', pxClouds: 'px_amazon_river_clouds_aerial', pxBend: 'px_amazon_bend_clouds_aerial', pxBrown: 'px_wide_brown_river_forest', pxBanks: 'px_jungle_river_banks', pxStilt: 'px_stilt_house_riverbank', pxMuddy: 'px_muddy_river_far_hills',
  pxBoatTop: 'px_boat_on_dark_river_top', pxCanopy: 'px_rainforest_canopy_flyover', pxBarge: 'px_barge_tow_city_river', pxCanoe: 'px_canoe_topdown_river', pxMudTop: 'px_muddy_river_canopy_top', pxTap: 'px_rubber_tapping_cut', pxSwamp: 'px_boat_swamp_river', pxDark: 'px_dark_river_jungle_aerial', pxPlants: 'px_river_floating_plants_aerial' };
const G = { iq: { lon: -73.25, lat: -3.75 }, lima: { lon: -77.04, lat: -12.05 }, yuri: { lon: -76.09, lat: -5.90 }, nauta: { lon: -73.58, lat: -4.51 }, belem: { lon: -48.5, lat: -1.45 }, manaus: { lon: -60.02, lat: -3.1 }, sara: { lon: -77.40, lat: -4.57 }, estrecho: { lon: -72.95, lat: -2.45 }, puc: { lon: -74.55, lat: -8.38 } };
const GL = (o = {}) => ({ relief: true, borders: true, lon: -73.25, lat: -3.75, R: 2600, ...o });
// Amazon course (rough, for an animated route): Iquitos -> Leticia -> Manaus -> Santarém -> mouth
const AMZ = [[-73.25, -3.75], [-71.0, -4.2], [-69.95, -4.2], [-67.5, -3.4], [-64.8, -3.4], [-62.0, -3.3], [-60.0, -3.15], [-58.5, -3.2], [-56.5, -2.5], [-54.7, -2.4], [-52.0, -1.6], [-50.0, -0.5]];

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
    V(K.santaClara, 'IQUITOS, PERU', { over: [low('ABOUT HALF A MILLION PEOPLE', 'half')] }),
    V(K.jam, 'IQUITOS TRAFFIC', { cutW: 'Traffic' }),
    V(K.disco2, 'NIGHTLIFE, IQUITOS', { cutW: 'a' }),
    V(K.night, 'IQUITOS AT NIGHT', { cutW: 'Roughly', over: [low('≈ MIAMI', 'Miami')] }),
  ], { start: 0 });
  beats('A002', [V(K.road2, 'IQUITOS–NAUTA ROAD'), V(K.pxCanopy, 'AMAZON RAINFOREST · ' + IL, { cutW: 'You' })]);
  beats('A003', [
    V(K.port1, 'PORT OF IQUITOS, 2026', { over: [low('NO HIGHWAY IN OR OUT', 'highway')] }),
    V(K.timber, 'RIVERBANK, IQUITOS', { cutW: 'Every' }),
    V(K.port2, 'PORT OF IQUITOS', { cutW: 'arrived' }),
    V(K.plane, 'PLANE AT IQUITOS AIRPORT', { cutW: 'Or' }),
  ]);
  beats('A004', [
    S('globe', GL({ lon: [[0, -62], [3, -73.25]], lat: [[0, -8], [3, -3.75]], R: [[0, 900], [3, 5200]], pins: [{ ...G.iq, label: 'IQUITOS', at: 1.2 }] })),
    Q('Guinness', 'GUINNESS WORLD RECORDS', 'NO ROAD', 'CONNECTION', 'LARGEST CITY WITHOUT ONE', 'Source: Guinness World Records'),
  ]);
  beats('A005', [
    V(K.plaza, 'PLAZA DE ARMAS, IQUITOS'),
    V(K.ave1, 'AVENIDA QUIÑONES, IQUITOS', { cutW: 'It\'s', over: [low('BIGGER THAN PITTSBURGH OR ST. LOUIS', 'Pittsburgh')] }),
  ]);
  beats('A006', [
    V(K.malecon, 'MALECÓN TARAPACÁ, IQUITOS'),
    V(K.air, 'IQUITOS FROM THE AIR', { cutW: 'It\'s' }),
    V(K.nanay, 'WHERE THE AMAZON MEETS THE NANAY, IQUITOS', { cutW: 'three', over: [low('3 RIVERS: AMAZON · NANAY · ITAYA', 'rivers')] }),
  ]);
  beats('A007', [
    V(K.rubberLanding, 'RUBBER AT THE LANDING STAGE, IQUITOS (EARLY 1900s)', { sfx: 'click', over: [low('1 · THE RUBBER RUSH', 'rubber')] }),
    V(K.pxBrown, 'AMAZON-TYPE RIVER · ' + IL, { cutW: 'follow', over: [low('2 · THE RIVER', 'river')] }),
    V(K.float3, 'FLOATING HOUSES, IQUITOS', { cutW: 'visit', over: [low('3 · THE FLOATING NEIGHBORHOOD', 'floats')] }),
    V(K.road3, 'ROUTE LO-103 (IQUITOS–NAUTA)', { cutW: 'and', over: [low('4 · THE ROAD TO NOWHERE', 'road')] }),
  ]);
  add(T.e('A007') + 0.15, S('title', { lines: ['THE BIGGEST CITY', 'YOU CAN\'T DRIVE TO'], hl: 1, img: K.air, credit: '', brand: true, sfx: 'riser' }), 'cut');

  // ===== CH1 =====
  chapter('A007C', 1, 'The rubber rush');
  beats('A007C', [V(K.pxMist, 'AMAZON RAINFOREST · ' + IL), V(K.pxDark, 'RAINFOREST RIVER · ' + IL, { cutW: 'You' })]);
  beats('A008', [
    A(K.iq1900, 'IQUITOS, AROUND 1900', { over: [low('1903: ~9,400 PEOPLE', 'nineteen')] }),
    A(K.portOld, 'PORT OF IQUITOS, EARLY 1900s', { cutW: 'Then' }),
    V(K.tapCup, 'TAPPING A RUBBER TREE (THAILAND) · ' + IL, { cutW: 'rubber' }),
  ]);
  beats('A009', [
    V(K.latex, 'LATEX FROM A TAPPED RUBBER TREE · ' + IL),
    A(K.rubberLoad, 'LOADING RUBBER, PUTUMAYO, c. 1912', { cutW: 'And' }),
    A(K.steam1900, 'STEAMSHIP AT IQUITOS, c. 1900', { cutW: 'So' }),
  ]);
  beats('A010', [
    V(K.barcia, 'CASA DE BARCIA, IQUITOS', { over: [low('TILES SHIPPED FROM EUROPE', 'tiles')] }),
    V(K.tile4, 'TILED FAÇADE, IQUITOS', { cutW: 'And' }),
    V(K.iron2, 'CASA DE FIERRO (IRON HOUSE)', { cutW: 'the', over: [low('THE IRON HOUSE', 'Iron')] }),
  ]);
  beats('A011', [
    V(K.iron1, 'CASA DE FIERRO, PLAZA DE ARMAS'),
    Q('Here\'s', 'DESIGNED BY GUSTAVE EIFFEL?', 'NO REAL', 'EVIDENCE', null, 'Sources: Wikipedia; Atlas Obscura'),
    A(K.ironOld, 'CASA DE FIERRO, OLD POSTCARD', { cutW: 'It' }),
  ]);
  beats('A012', [
    A(K.river1926, 'AMAZON STEAMER, 1926'),
    V(K.pxBoatTop, 'BOAT ON A RAINFOREST RIVER · ' + IL, { cutW: 'So', over: [low('CARLOS FITZCARRALD', 'Fitzcarrald')] }),
    A(K.atracadero, 'LANDING AT IQUITOS (EARLY 1900s)', { cutW: 'and' }),
  ]);
  beats('A013', [
    V(K.fitzModel2, 'FITZCARRALDO FILM BOAT, FILMMUSEUM BERLIN', { over: [low('FITZCARRALDO (1982)', 'Fitzcarraldo')] }),
    V(K.fitzBar, 'FITZCARRALDO BAR, IQUITOS', { cutW: 'and' }),
    V(K.fitzModel, 'FITZCARRALDO FILM BOAT, FILMMUSEUM BERLIN', { cutW: 'Except', over: [low('A REAL SHIP OVER A HILL', 'whole')] }),
  ]);
  beats('A014', [A(K.rubberProc, 'PROCESSING RUBBER, PUTUMAYO, c. 1912'), V(K.pxTap, 'RUBBER TREE · ' + IL, { cutW: 'The' })]);
  beats('A015', [
    A(K.arana, 'JULIO CÉSAR ARANA (CENTRE), PUTUMAYO', { over: [low('JULIO CÉSAR ARANA', 'Arana')] }),
    A(K.rubberLoad, 'PUTUMAYO, c. 1912', { cutW: 'exposed', kb: { z: [1.25, 1.05] }, over: [low('EXPOSED IN 1912', 'twelve')] }),
    Q('Historians', 'PUTUMAYO, 1879–1912', 'TENS OF THOUSANDS', 'OF DEATHS', null, 'Sources: Casement report; Hardenburg (1912); historians\' estimates'),
  ]);
  beats('A016', [
    V(K.pxCanopy, 'AMAZON RAINFOREST · ' + IL),
    V(K.tapSpiral, 'HEVEA (RUBBER) TREE, SPIRAL TAPPING', { cutW: 'Henry', over: [low('1876: ~70,000 SEEDS', 'seventy')] }),
  ]);
  beats('A017', [
    V(K.tapTree, 'RUBBER PLANTATION TREE · ' + IL),
    A(K.st1929a, 'IQUITOS, 1929', { cutW: 'By', over: [low('BY THE 1920s, THE BOOM WAS OVER', 'twenties')] }),
    A(K.church1929, 'IQUITOS CHURCH, 1929', { cutW: 'But' }),
  ]);

  // ===== CH2 =====
  chapter('A017B', 2, 'Everything arrives by water');
  beats('A017B', [V(K.fromRiver, 'IQUITOS FROM THE RIVER'), V(K.amz1, 'AMAZON RIVER NEAR IQUITOS', { cutW: 'Which' })]);
  beats('A018', [V(K.port2, 'PORT OF IQUITOS', { over: [head('NO ROAD. SO HOW?', 'how', 200, 76)] })]);
  beats('A019', [
    V(K.amz2, 'AMAZON RIVER, IQUITOS'),
    S('globe', GL({ cutW: 'about', lon: -61, lat: -3, R: 1500, pins: [{ ...G.iq, label: 'IQUITOS', at: 0.2 }, { lon: -50.0, lat: -0.5, label: 'ATLANTIC', at: 2.4, align: 'right', dx: -22 }], routes: [{ pts: AMZ, at: 0.4, dur: 2.2 }] })),
    Q('That\'s', 'IQUITOS → ATLANTIC', '~2,300 MILES', null, '≈ NEW YORK → PHOENIX', 'Sources: Britannica; CruiseMapper'),
  ]);
  beats('A020', [A(K.booth, 'THE BOOTH PIER, IQUITOS (EARLY 1900s)'), A(K.transat, 'TRANSATLANTIC STEAMSHIPS, PORT OF IQUITOS', { cutW: 'A' })]);
  beats('A020B', [
    V(K.dol2, 'AMAZON RIVER DOLPHIN', { over: [low('PINK RIVER DOLPHINS', 'pink')] }),
    V(K.dol4, 'AMAZON RIVER DOLPHIN', { cutW: 'Locals' }),
    V(K.dol5, 'AMAZON RIVER DOLPHIN', { cutW: 'and' }),
  ]);
  beats('A021', [
    S('globe', GL({ lon: [[0, -73.5], [3, -74.8]], lat: [[0, -4.2], [3, -4.8]], R: [[0, 5200], [3, 6200]], pins: [{ ...G.iq, label: 'IQUITOS', at: 0.2 }, { ...G.yuri, label: 'YURIMAGUAS', at: 1.0, align: 'right', dx: -22 }] })),
    V(K.yuri, 'FERRY AT YURIMAGUAS', { cutW: 'Trucks' }),
  ]);
  beats('A022', [
    S('globe', GL({ lon: -74.7, lat: -4.8, R: 6200, pins: [{ ...G.iq, label: 'IQUITOS', at: 0.2 }, { ...G.yuri, label: 'YURIMAGUAS', at: 0.2, align: 'right', dx: -22 }], routes: [{ pts: [[-76.09, -5.9], [-75.6, -5.2], [-75.1, -4.9], [-74.4, -4.75], [-73.58, -4.51], [-73.4, -4.2], [-73.25, -3.75]], at: 0.3, dur: 2.4, label: '3–4 DAYS BY RIVER' }] })),
    V(K.pxBarge, 'RIVER BARGE · ' + IL, { cutW: 'Cars' }),
    V(K.shipyard, 'SHIPYARD ON THE RIVER, IQUITOS', { cutW: 'all' }),
  ]);
  beats('A023', [V(K.port1, 'RIVERBOATS, IQUITOS'), V(K.pxSwamp, 'RIVERBOAT · ' + IL, { cutW: 'and' }), V(K.amz1983, 'AMAZON AT DUSK, 1983', { cutW: 'Honestly' })]);
  beats('A024', [
    V(K.airport, 'IQUITOS AIRPORT FROM THE AIR', { over: [low('LIMA: ~600 MILES · UNDER 2 HOURS', 'Lima')] }),
    V(K.plane, 'PLANE AT IQUITOS AIRPORT', { cutW: 'For' }),
  ]);
  beats('A024B', [A(K.seaplanes, 'PERUVIAN SEAPLANES AT IQUITOS (1920s)'), A(K.air1928, '"THE NEW AIR SERVICE WITH IQUITOS", 1928', { cutW: 'Peru', over: [low('LATE 1920s: SEAPLANES', 'seaplanes')] }), V(K.floatplane, 'FLOATPLANE ON THE RIVER, IQUITOS', { cutW: 'landing' })]);
  beats('A025', [
    V(K.road1, 'IQUITOS–NAUTA ROAD', { over: [low('ONE ROAD · ~60 MILES', 'sixty')] }),
    S('globe', GL({ cutW: 'and', lon: -73.4, lat: -4.15, R: 22000, pins: [{ ...G.iq, label: 'IQUITOS', at: 0.2 }, { ...G.nauta, label: 'NAUTA', at: 0.6 }], routes: [{ pts: [[-73.25, -3.78], [-73.33, -3.95], [-73.4, -4.1], [-73.47, -4.3], [-73.58, -4.51]], at: 0.3, dur: 1.6 }] })),
    V(K.road3, 'END OF THE LINE · ROUTE LO-103', { cutW: 'Nauta' }),
  ]);

  // ===== CH3 =====
  chapter('A025B', 3, 'A city on its own');
  beats('A025B', [V(K.road2, 'IQUITOS–NAUTA ROAD'), V(K.night, 'IQUITOS AT NIGHT', { cutW: 'But' })]);
  beats('A026', [V(K.skyline, 'IQUITOS AT NIGHT', { over: [low('NOT ON PERU\'S NATIONAL GRID', 'grid')] })]);
  beats('A027', [V(K.power1, 'ELECTRO ORIENTE, IQUITOS'), V(K.power2, 'ELECTRO ORIENTE, IQUITOS', { cutW: 'Fuel', over: [low('FUEL OIL · BY BARGE', 'barge')] })]);
  beats('A028', [
    S('globe', GL({ lon: -75.2, lat: -5.0, R: 4200, pins: [{ ...G.iq, label: 'IQUITOS', at: 0.2 }, { lon: -76.97, lat: -6.03, label: 'MOYOBAMBA', at: 0.6, align: 'right', dx: -22 }], routes: [{ pts: [[-76.97, -6.03], [-76.0, -5.3], [-74.8, -4.7], [-73.25, -3.75]], at: 0.6, dur: 1.8, label: 'PLANNED POWER LINE · ~360 MI' }] })),
    Q('It', 'MOYOBAMBA–IQUITOS LINE', 'SIGNED 2014', null, 'STILL NOT BUILT', 'Sources: Mongabay; Congreso del Perú (2024)'),
  ]);
  beats('A029', [V(K.pxMuddy, 'LOW AMAZON RIVER · ' + IL, { over: [low('2023–2024: RECORD LOW RIVERS', 'record')] }), V(K.pxBarge, 'BARGE ON A RIVER · ' + IL, { cutW: 'fuel' })]);
  beats('A029B', [V(K.amz2, 'AMAZON RIVER NEAR IQUITOS', { over: [low('OIL REFINERY ~9 MI FROM THE CITY', 'nine')] }), Q('In', 'SEPTEMBER 2026', 'FUEL BOAT STUCK', null, 'THE RIVER WAS TOO LOW', 'Source: Petroperú'), V(K.timber, 'RIVERBANK, IQUITOS', { cutW: 'simply' })]);
  beats('A030', [V(K.moto1, 'MOTOTAXIS, IQUITOS'), V(K.jam, 'MOTOTAXI TRAFFIC, IQUITOS', { cutW: 'Iquitos' })]);
  beats('A031', [V(K.moto5, 'A MOTOTAXI, IQUITOS', { over: [low('THE MOTOTAXI', 'mototaxi')] }), Q('One', 'MOTOTAXIS IN IQUITOS', '~30,000', null, 'ONE STUDENT STUDY\'S ESTIMATE', 'Source: Universidad Científica del Perú thesis')]);
  beats('A032', [V(K.moto3, 'MOTOTAXIS, IQUITOS'), V(K.traffic, 'IQUITOS TRAFFIC', { cutW: 'A' }), V(K.moto2, 'MOTOTAXI, IQUITOS', { cutW: 'It\'s' })]);

  // ===== CH4 =====
  chapter('A032B', 4, 'The neighborhood that floats');
  beats('A032B', [V(K.nanay, 'WHERE THE AMAZON MEETS THE NANAY'), V(K.sunset, 'RIVER AT DUSK, IQUITOS', { cutW: 'And' })]);
  beats('A033', [V(K.varzea, 'FLOODED FOREST NEAR IQUITOS'), V(K.flood2, 'FLOOD SEASON, IQUITOS', { cutW: 'Every' })]);
  beats('A034', [
    S('bars', { title: 'AMAZON AT IQUITOS (ENAPU GAUGE)', sub: 'metres above sea level', max: 120, min: 100, items: [{ label: 'DRY SEASON LOW', v: 105.4, text: '~105 M', color: C('iceL'), at: 0.4 }, { label: 'FLOOD SEASON HIGH', v: 117.8, text: '~118 M', color: Yc, at: 1.1 }], source: 'Source: SENAMHI (2010 low; 2024–2025 highs)' }),
    V(K.flood1, 'FLOODING, IQUITOS', { cutW: 'That\'s', over: [low('~12 M (40 FT) ≈ A 4-STORY BUILDING', 'forty')] }),
  ]);
  beats('A035', [V(K.belen1, 'BELÉN, IQUITOS'), V(K.venice, 'BELÉN, "VENICE OF THE AMAZON"', { cutW: 'Meet', over: [low('BELÉN', 'Belén')] })]);
  beats('A036', [V(K.belenLife, 'STILT HOUSES, BELÉN'), V(K.float1, 'A FLOATING HOUSE, IQUITOS', { cutW: 'Others' }), V(K.float3, 'FLOATING HOUSES ON THE AMAZON', { cutW: 'so' })]);
  beats('A037', [V(K.belenSt, 'BELÉN BAJO', { over: [low('FEBRUARY → JULY: STREETS BECOME CANALS', 'February')] }), V(K.belen2, 'CANOES, BELÉN', { cutW: 'In' }), V(K.canoe, 'CANOE ON THE RIVER, IQUITOS', { cutW: 'by' })]);
  beats('A038', [V(K.mkt1, 'BELÉN MARKET'), V(K.mkt3, 'BELÉN MARKET', { cutW: 'Fish' }), V(K.fruit2, 'FRUIT STALL, IQUITOS', { cutW: 'It\'s' })]);
  beats('A038B', [V(K.agu2, 'AGUAJE FRUIT', { over: [low('AGUAJE (PALM FRUIT)', 'aguaje')] }), V(K.agu1, 'AGUAJE FRUIT', { cutW: 'Locals' })]);
  beats('A039', [V(K.belenLow2, 'BELÉN, LOW TOWN'), V(K.belen4, 'BELÉN, IQUITOS', { cutW: 'But' }), V(K.belen3, 'BELÉN, IQUITOS', { cutW: 'in' })]);
  beats('A039B', [V(K.fest1, 'FESTIVAL DE BELÉN'), V(K.fest2, 'FESTIVAL DE BELÉN', { cutW: 'Music' }), V(K.fest3, 'FESTIVAL DE BELÉN', { cutW: 'right' })]);

  // ===== CH5 =====
  chapter('A040', 5, 'The road that goes nowhere');
  beats('A040', [V(K.road2, 'IQUITOS–NAUTA ROAD', { over: [head('WHY NOT BUILD A ROAD?', 'road', 200, 72)] })]);
  beats('A041', [
    S('globe', GL({ lon: -75.3, lat: -3.9, R: 5600, pins: [{ ...G.iq, label: 'IQUITOS', at: 0.2 }, { ...G.sara, label: 'SARAMIRIZA', at: 0.6, align: 'right', dx: -22 }], routes: [{ pts: [[-73.25, -3.75], [-74.2, -3.6], [-75.3, -3.4], [-76.4, -3.9], [-77.4, -4.57]], at: 0.6, dur: 2.0, label: 'PROPOSED HIGHWAY (SCHEMATIC)' }] })),
    V(K.roadBuild, 'ROAD UNDER CONSTRUCTION, IQUITOS AREA', { cutW: 'to' }),
  ]);
  beats('A042', [V(K.port2, 'GOODS AT THE PORT, IQUITOS', { over: [low('SUPPORTERS: CHEAPER EVERYTHING', 'cheaper')] })]);
  beats('A043', [V(K.pxPlants, 'SWAMP FOREST · ' + IL, { over: [low('PEAT SWAMPS · PROTECTED FORESTS', 'peat')] }), V(K.pxCanopy, 'AMAZON RAINFOREST · ' + IL, { cutW: 'And' })]);
  beats('A044', [V(K.defor, 'DEFORESTATION, LORETO'), V(K.pxMudTop, 'RIVER AND FOREST · ' + IL, { cutW: 'new' })]);
  beats('A044B', [S('globe', GL({ lon: -73.0, lat: -3.0, R: 9000, pins: [{ ...G.iq, label: 'IQUITOS', at: 0.2 }, { ...G.estrecho, label: 'EL ESTRECHO', at: 0.6 }] })), V(K.defor, 'CLEARED FOREST, LORETO', { cutW: 'reporters', kb: { z: [1.25, 1.05] } })]);
  beats('A045', [V(K.pxMist, 'AMAZON RAINFOREST · ' + IL), V(K.air, 'IQUITOS AND THE FOREST AROUND IT', { cutW: 'is' })]);

  beats('A045B', [V(K.pxClouds, 'AMAZON RAINFOREST · ' + IL), V(K.pxBend, 'AMAZON RAINFOREST · ' + IL, { cutW: 'Maybe', n: 2 })]);

  // ===== END =====
  beats('A046', [V(K.port1, 'RIVERBOATS, IQUITOS'), V(K.power1, 'ELECTRO ORIENTE, IQUITOS', { cutW: 'with' }), V(K.moto4, 'MOTOTAXI, IQUITOS', { cutW: 'with', n: 2 }), V(K.float2, 'A FLOATING HOUSE, IQUITOS', { cutW: 'and' })]);
  beats('A047', [V(K.jam, 'IQUITOS TRAFFIC'), V(K.pxBarge, 'BARGE ON THE RIVER · ' + IL, { cutW: 'It' }), V(K.santaClara, 'IQUITOS', { cutW: 'In' })]);
  beats('A048', [V(K.malecon2, 'MALECÓN, IQUITOS', { over: [head('BOAT OR PLANE ONLY. WOULD YOU?', 'Would', 200, 64, Yc)] }), V(K.sunset, 'IQUITOS AT DUSK', { cutW: 'And' })]);
  add(T.tl.voiceEnd + 0.4, S('endscreen', {}), 'fade');
  return out;
}
module.exports = { assets, build, defaultTrans: 'cut', splitOver: 4.5, splitTo: 3, smooth: true };
