// EP07 Las Vegas — mostly real Las Vegas / Lake Mead / Hoover Dam / Nevada Test Site footage (Wikimedia Commons, US government films, Library of Congress, NASA, Pixabay, Coverr), a new picture every ~2–4 s.
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
  const Y = '#FFC857';

  // ===== COLD OPEN =====
  beats('L001', [
    F('px_welcome_sign_blinking', { over: [head('THE LAS VEGAS STRIP', null, 200, 96)] }),
    F('cm_drone_twilight_bellagio_fountains', { over: [low('CASINOS · FOUNTAINS · GIANT HOTELS', 'casinos')] }),
    F('cm_drone_night_strip_paris_bellagio', { over: [head("…ISN'T IN LAS VEGAS", "isn't", 200, 110, Y)] }),
  ], { start: 0 });
  beats('L002', [
    F('cm_drone_morning_bellagio_lake_topdown', { in: 4, over: [low('IT DRINKS MOST OF ITS WATER TWICE', 'twice')] }),
    F('gov_dawn_flash_fireball', { in: 3, over: [low('1950s: PARTIES FOR NUCLEAR EXPLOSIONS', 'parties'), note('FILM: NEVADA TEST, 1955')] }),
    F('cm_flamingo_wash_channel_b', { over: [low('PEOPLE LIVING UNDER THE CITY', 'under')] }),
  ]);
  beats('L003', [
    F('px_lv_valley_aerial', { over: [low('2+ MILLION PEOPLE', 'million')] }),
    S('stats', { cutW: 'gets', head: 'RAIN IN A WHOLE YEAR', items: [{ pre: '~', v: 4, suf: ' INCHES', label: 'ABOUT 10 CM', at: 0.3, cnt: 0.5, size: 240 }], source: 'Source: NOAA / National Weather Service' }),
    F('px_red_rock_canyon_desert', { over: [head("IT SHOULDN'T EXIST", 'rule', 200, 100)] }),
  ]);
  beats('L004', [F('cm_drone_sunset_strip_skyline', { over: [head('SO HOW DOES IT REALLY WORK?', 'how', 200, 90)] })]);
  add(T.e('L004') + 0.15, S('title', { lines: ['LAS VEGAS', "SHOULDN'T", 'EXIST'], hl: 2, img: 'nasa_iss_lv_night_2024', credit: credit('nasa_iss_lv_night_2024'), brand: true }), 'cut');

  // ===== CH1 =====
  chapter('L005', 1, 'The meadows');
  beats('L005', [F('cm_springs_preserve', { over: [low('"LAS VEGAS" = "THE MEADOWS"', 'meadows')] })]);
  beats('L006', [
    F('cm_mormon_fort_nara', { over: [low('SPRINGS IN THE MIDDLE OF THE DESERT', 'Springs'), note('PHOTO: SPRING-FED CREEK, OLD MORMON FORT')] }),
    F('cm_tule_springs_ranch', { over: [low('A GREEN PATCH IN A DRY VALLEY', 'green')] }),
    F('px_red_rock_road', { over: [low('A WATER STOP ON THE WAY ACROSS THE MOJAVE', 'Travelers')] }),
  ]);
  beats('L007', [
    F('cm_up_depot_replica', { over: [low('1905: THE RAILROAD ARRIVES', 'railroad'), note('PHOTO: DEPOT REPLICA')] }),
    F('cm_map_las_vegas_rancho_1904', { over: [low('THE LAND AROUND THE STATION GOES ON SALE', 'land')] }),
    F('cm_first_state_bank_1905', { over: [low('15 MAY 1905 · AUCTION IN ~110°F HEAT', 'fifteenth'), note('PHOTO: LAS VEGAS, 1905')] }),
    F('cm_las_vegas_early_view_loc', { over: [low('THE BIRTHDAY OF THE CITY', 'birthday')] }),
  ]);
  beats('L008', [
    F('cm_main_street_1912_postcard', { over: [low('THE NEW TOWN DRILLED WELLS', 'wells'), note('POSTCARD: MAIN STREET, 1912')] }),
    F('cm_alfalfa_fields_early_lv', { over: [low('ARTESIAN: THE WATER SHOT UP BY ITSELF', 'artesian'), note('PHOTO: IRRIGATED FIELDS, EARLY 1900s')] }),
    F('cm_railroad_depot_early', { over: [low('MANY WELLS WERE NEVER CAPPED', 'capped')] }),
    F('cm_springs_preserve_trail', { over: [low('WATER POURED ACROSS THE DESERT, DAY AND NIGHT', 'poured'), note('PHOTO: SPRINGS PRESERVE TODAY')] }),
  ]);
  beats('L009', [
    F('px_drought_dry_riverbed', { over: [low('THE UNDERGROUND WATER DROPPED', 'dropped')] }),
    F('cm_springs_preserve_b', { over: [chipC('1962: THE SPRINGS STOP FLOWING', 'sixty-two', 960, 60), note('PHOTO: SPRINGS PRESERVE GARDEN TODAY')] }),
    F('cm_old_mormon_fort', { over: [head('THE MEADOWS WERE GONE', 'gone', 200, 100, Y)] }),
  ]);

  // ===== CH2 =====
  chapter('L010', 2, 'The Strip that escaped the city');
  beats('L010', [
    F('cm_el_rancho_vegas_1940s', { over: [low('THE HIGHWAY TO LOS ANGELES', 'highway')] }),
    F('cm_strip_july_1957_a', { over: [low('BIG RESORT CASINOS', 'resort'), note('FILM: THE STRIP, 1957')] }),
    F('cm_el_rancho_vegas_postcard', { over: [low('JUST OUTSIDE THE CITY LIMITS', 'outside')] }),
  ]);
  beats('L011', [
    F('cm_fremont_street_1930s_postcard', { over: [low('1950: THE MAYOR WANTS TO TAX THEM', 'tax'), note('POSTCARD: DOWNTOWN LAS VEGAS')] }),
    F('cm_sands_1959', { over: [low("THE CASINO BOSSES DIDN'T LIKE THAT", 'bosses')] }),
  ]);
  beats('L012', [
    F('cm_strip_july_1957_b', { over: [low('A SEPARATE TOWN AROUND THE CASINOS', 'separate')] }),
    F('cm_drone_morning_caesars', { over: [low("THEN THE CITY CAN'T ANNEX IT", 'annex')] }),
    F('px_flamingo_sign_day', { over: [low('LED BY GUS GREENBAUM OF THE FLAMINGO', 'Greenbaum')] }),
    F('cm_drone_night_flamingo', { over: [low('OPENED BY GANGSTER BUGSY SIEGEL', 'Siegel')] }),
  ]);
  beats('L013', [
    F('cm_drone_dusk_topdown_intersection', { over: [low('DECEMBER 1950: THE TOWN OF PARADISE', 'Paradise')] }),
    F('cm_paradise_welcome_sign', { over: [low('EVEN THE FAMOUS SIGN STANDS IN PARADISE', 'day')] }),
    F('cm_drone_twilight_strip_mgm', { over: [low('RUN BY THE COUNTY, NOT THE CITY', 'county')] }),
  ]);

  // ===== CH3 =====
  chapter('L014', 3, 'Bombs as a tourist attraction');
  beats('L014', [F('cm_looking_toward_nts', { over: [low('A VERY STRANGE NEW NEIGHBOR', 'strange')] })]);
  beats('L015', [
    F('gov_aec_mercury_sign', { in: 3, over: [low('JANUARY 1951: THE NEVADA TEST SITE', 'January')] }),
    F('gov_map_test_site', { over: [low('ABOUT 65 MILES FROM THE CITY', 'sixty-five')] }),
    F('cm_upshot_annie', { over: [low('NUCLEAR BOMBS, TESTED IN THE OPEN', 'testing')] }),
  ]);
  beats('L016', [
    F('gov_cloud_on_horizon', { in: 4.5, over: [low('OFTEN JUST BEFORE SUNRISE', 'sunrise'), note('FILM: AEC, 1955')] }),
    F('gov_fireball_valley', { over: [low('THE FLASH LIT UP THE SKY', 'flash')] }),
  ]);
  beats('L017', [
    F('cm_sands_1959', { kb: { z: [1.25, 1.1], x: [0.55, 0.5] }, over: [low('LAS VEGAS TURNED IT INTO A SHOW', 'show')] }),
    F('cm_teapot_desert_rock_troops', { over: [low('DAWN BOMB PARTIES', 'dawn'), note('PHOTO: WATCHING A TEST, 1955')] }),
    F('cm_upshot_encore_cloud', { over: [low('UP TO THE ROOF TO WATCH', 'roof')] }),
    F('px_cocktails_bar', { over: [low('"ATOMIC COCKTAILS"', 'cocktails'), note('STOCK FOOTAGE')] }),
    F('cm_sands_early_1960s', { kb: { z: [1.2, 1.05] }, over: [low('A SANDS SHOWGIRL: "MISS ATOMIC BOMB"', 'showgirl')] }),
  ]);
  beats('L018', [
    F('gov_fallout_cloud_drifting', { in: 6, over: [low("THE CLOUDS DIDN'T STAY IN THE DESERT", 'clouds')] }),
    F('gov_map_fallout_st_george', { in: 4.5, over: [low('FALLOUT DRIFTED EAST: NEVADA AND UTAH', 'east')] }),
    F('gov_cattle_downwind', { in: 4, over: [low('MANY PEOPLE DOWNWIND LATER GOT SICK', 'sick'), note('FILM: CATTLE DOWNWIND, AEC 1955')] }),
    F('cm_small_boy_1962', { over: [low('1962: THE LAST TESTS ABOVE GROUND', 'ended')] }),
  ]);

  // ===== CH4 =====
  chapter('L019', 4, 'Drinking the same water twice');
  beats('L019', [
    F('cm_drone_sunrise_topdown', { over: [low('SO WHERE DOES THE WATER COME FROM?', 'where')] }),
    S('stats', { cutW: 'ninety', head: "SOUTHERN NEVADA'S WATER", items: [{ pre: '~', v: 90, suf: '%', label: 'COMES FROM LAKE MEAD', at: 0.4, size: 260 }], source: 'Source: Southern Nevada Water Authority' }),
    F('px_hoover_dam_lake_mead_view', { over: [low('THE RESERVOIR BEHIND THE HOOVER DAM', 'Hoover')] }),
    F('px_lake_mead_shore', { over: [low('FILLED BY THE COLORADO RIVER', 'Colorado')] }),
  ]);
  beats('L019B', [
    F('cm_story_hoover_river_rapids', { over: [low('LAS VEGAS GOT THE SMALLEST SHARE', 'smallest'), note('FILM: THE COLORADO RIVER BEFORE THE DAM')] }),
    F('cm_story_hoover_signing_documents', { over: [low('1928: THE RIVER IS DIVIDED', 'divided')] }),
    F('cm_las_vegas_early_view_loc', { kb: { z: [1.5, 1.3], x: [0.3, 0.45] }, over: [low('LAS VEGAS: A SMALL RAILROAD TOWN', 'railroad')] }),
    S('bars', { cutW: 'three', title: 'COLORADO RIVER WATER, PER YEAR', sub: 'million acre-feet · Lower Basin states', max: 4.6, items: [{ label: 'CALIFORNIA', v: 4.4, text: '4.4', at: 0.4, color: C('iceL') }, { label: 'ARIZONA', v: 2.8, text: '2.8', at: 0.9, color: C('iceL') }, { label: 'NEVADA', v: 0.3, text: '0.3 — LESS THAN 2% OF THE RIVER', at: 1.6, color: Y }], source: 'Source: SNWA; Boulder Canyon Project Act (1928)' }),
    F('cm_story_hoover_irrigation_canal', { in: 3, over: [low('CALIFORNIA: ALMOST 15× MORE', 'fifteen'), note('FILM: CANAL TO FARMLAND')] }),
  ]);
  beats('L020', [
    F('cm_drone_twilight_fountain_arcs', { over: [low("HERE'S THE CLEVER PART", 'clever')] }),
    F('px_shower_bathroom', { over: [low('SHOWERS · SINKS · TOILETS · HOTEL KITCHENS', 'showers')] }),
    F('cm_las_vegas_wash', { over: [low('CLEANED…', 'cleaned')] }),
    F('cm_las_vegas_wash_wetlands_sunrise', { over: [low('…AND SENT BACK INTO LAKE MEAD', 'sent')] }),
  ]);
  beats('L021', [
    S('stats', { cutW: 'every', head: 'RETURN-FLOW CREDITS', items: [{ v: 1, suf: ' GALLON BACK', label: '= 1 MORE GALLON OUT', at: 0.4, size: 200 }], source: 'Source: Southern Nevada Water Authority' }),
    F('px_faucet_dripping', { over: [low('USED · CLEANED · TAKEN OUT AGAIN', 'used')] }),
    F('cm_strip_panorama_from_strat', { over: [low('~150,000 HOTEL ROOMS…', 'rooms')] }),
    F('px_hotel_pool_from_above', { over: [low("…AREN'T REALLY THE PROBLEM", 'problem')] }),
  ]);
  beats('L022', [
    F('px_lawn_irrigation_morning', { over: [low('THE REAL PROBLEM IS OUTSIDE', 'outside')] }),
    F('px_sprinkler_backlit', { over: [low("WATER ON GRASS DOESN'T COME BACK", 'back')] }),
  ]);
  beats('L023', [
    F('px_golf_clubhouse_lake', { over: [low('SO LAS VEGAS DECLARED WAR ON LAWNS', 'war')] }),
    F('cm_springs_preserve_dlc', { over: [low('PAID TO TEAR OUT THE GRASS', 'tear')] }),
    F('px_xeriscape_cactus', { over: [low('…AND PLANT DESERT PLANTS INSTEAD', 'desert')] }),
    F('cm_las_vegas_national_golf_course', { over: [low('NEVADA LAW: FROM 2027…', 'law')] }),
    F('px_lawn_close', { over: [low('NO RIVER WATER FOR DECORATIVE GRASS', 'decorative')] }),
  ]);
  beats('L023B', [
    F('px_pool_water_ripple', { over: [low('NEW HOME POOLS: MAX 600 SQ FT', 'six')] }),
    F('cm_summerlin_suburb'),
    F('px_sprinkler_garden', { over: [low('WATER WASTE INVESTIGATORS', 'investigators')] }),
    F('cm_view_of_las_vegas', { over: [low('WATER RUNNING DOWN THE STREET?', 'running')] }),
    F('cm_drone_dusk_boulevard_topdown'),
    S('stats', { cutW: 'fine', head: 'IGNORE THE WARNING', items: [{ pre: '×', v: 2, label: 'THE FINE DOUBLES EVERY TIME', at: 0.4, size: 260 }], source: 'Source: Las Vegas Valley Water District' }),
  ]);
  beats('L024', [
    F('px_lv_suburbs_housing', { over: [low('SINCE 2002: ~900,000 MORE PEOPLE', 'gained')] }),
    S('stats', { cutW: 'fifty-eight', head: 'WATER USE PER RESIDENT · 2002 → 2025', items: [{ pre: '−', v: 58, suf: '%', label: 'LESS WATER PER PERSON', at: 0.4, size: 260 }], source: 'Source: Las Vegas Valley Water District' }),
    F('cm_drone_sunrise_valley_haze'),
  ]);
  beats('L025', [
    F('cm_drone_sunset_bellagio_fountain_show', { over: [low('AND THE BELLAGIO FOUNTAINS?', 'Bellagio')] }),
    F('px_bellagio_fountains_night', { over: [low('NOT CITY WATER', 'city')] }),
    F('cm_drone_morning_bellagio_paris', { over: [low('AN OLD WELL FROM A GOLF COURSE ON THIS SPOT', 'golf')] }),
  ]);

  // ===== CH5 =====
  chapter('L026', 5, 'The third straw');
  beats('L026', [F('px_lake_mead_canyon_ring', { over: [low('WHAT IF THE LAKE DISAPPEARS?', 'disappears')] })]);
  beats('L027', [
    F('nasa_landsat_lakemead_cu_1972_2013', { in: 38, over: [low('YEARS OF DROUGHT ON THE COLORADO', 'drought')] }),
    S('stats', { cutW: 'surface', head: 'LAKE MEAD HAS DROPPED SINCE 2000', items: [{ v: 150, suf: '+ FT', label: 'MORE THAN 45 METERS', at: 0.3, cnt: 0.6, size: 240 }], source: 'Source: Las Vegas Valley Water District' }),
    F('cm_lake_mead_bathtub_ring', { over: [low('WHITE RINGS: WHERE THE WATER USED TO BE', 'rings')] }),
    F('loc_lake_mead_ground_level_2018'),
  ]);
  beats('L028', [
    F('cm_water_intakes_lake_mead', { over: [low('INTAKE PIPES, NICKNAMED "STRAWS"', 'straws'), note("PHOTO: HOOVER DAM'S INTAKE TOWERS, NOT THE CITY'S STRAWS")] }),
    F('cm_sentinel_island_low_water', { over: [low('AS THE LAKE FELL…', 'fell')] }),
    F('cm_lake_mead_july_2022', { over: [low('…THE STRAWS COULD BE LEFT SUCKING AIR', 'air'), note('LANDSAT: LAKE MEAD, JULY 2022')] }),
  ]);
  beats('L029', [
    F('cm_shuttle_las_vegas_1989', { over: [low('A THIRD STRAW, DEEPER THAN THE OTHERS', 'third'), note('SHUTTLE PHOTO: LAS VEGAS AND LAKE MEAD')] }),
    F('cm_tunnel_boring_machine_yucca_mt', { over: [low('A TUNNEL UNDER THE LAKE BED', 'tunnel'), note('PHOTO: A TUNNEL MACHINE IN NEVADA (NOT THIS PROJECT)')] }),
    F('nasa_lakemead_2022', { over: [low('CONNECTED TO THE BOTTOM OF THE LAKE', 'bottom')] }),
    F('cm_lake_mead_may_2022', { over: [low('PLUS A NEW PUMPING STATION', 'pumping')] }),
    F('cm_hoover_dam_aerial_2017', { over: [chipC('"DEAD POOL": THE DAM CAN\'T RELEASE WATER', 'dead', 960, 50)] }),
  ]);
  beats('L030', [
    S('stats', { cutW: 'billion', head: 'THE THIRD INTAKE + PUMPING STATION', items: [{ pre: '> $', v: 1, suf: ' BILLION', label: 'TOTAL COST', at: 0.4, size: 240 }], source: 'Source: SNWA; Nevada Independent' }),
    F('cm_callville_bay_marina', { over: [low('2022: AN OLD INTAKE STOPS WORKING', 'stopped')] }),
    F('px_lake_mead_low_water_drone', { over: [low('THE NEW PUMPS ARE SWITCHED ON', 'switched')] }),
  ]);
  beats('L031', [
    F('loc_lake_mead_aerial_2018_a', { over: [low('THE LAKE GAVE UP ITS SECRETS', 'secrets')] }),
    F('cm_st_thomas_evacuation', { over: [low('ST. THOMAS: FLOODED IN THE 1930s', 'Thomas')] }),
    F('cm_st_thomas_2015', { over: [low('BACK OUT OF THE WATER', 'came')] }),
    F('cm_st_thomas_ruins_b', { over: [low('PEOPLE WALK THROUGH ITS STREETS AGAIN', 'walk')] }),
  ]);
  beats('L032', [
    F('px_hoover_dam_from_bridge', { over: [low('HOOVER DAM · ~30 MILES FROM LAS VEGAS', 'thirty')] }),
    F('cm_hoover_generators', { over: [low('BUT ITS ELECTRICITY…', 'electricity')] }),
    F('cm_story_hoover_generators_colour'),
    S('bars', { cutW: 'half', title: "HOOVER DAM'S ELECTRICITY", sub: 'share of the power, by state', max: 60, items: [{ label: 'CALIFORNIA', v: 56, text: '>50%', at: 0.4, color: C('iceL') }, { label: 'NEVADA', v: 23, text: '~23%', w: 'Nevada', color: Y }, { label: 'ARIZONA', v: 19, text: '~19%', w: 'quarter', color: C('iceL') }], source: 'Source: US Bureau of Reclamation' }),
    F('cm_power_lines_to_california_nara'),
  ]);
  beats('L032B', [
    F('cm_hoover_high_scalers', { over: [low('THE MEN WHO BUILT THE DAM, 1930s', 'men')] }),
    F('gov_boulderdam_boulder_city_building', { in: 5.5, over: [low('BOULDER CITY: A TOWN BUILT FOR THEM', 'Boulder')] }),
    F('cm_boulder_city_cottage_1930s', { over: [low('GAMBLING: BANNED', 'gambling')] }),
    F('gov_boulderdam_dam_rising', { in: 4, over: [low('KEEP THE PAY · KEEP THE SCHEDULE', 'pay')] }),
  ]);
  beats('L032C', [
    F('cm_boulder_city_street', { over: [low('THE BAN IS STILL IN PLACE', 'ban')] }),
    F('gov_boulderdam_boulder_city_houses', { over: [low('1 OF ONLY 2 PLACES IN NEVADA WITHOUT GAMBLING', 'two'), note('FILM: BOULDER CITY, 1930s')] }),
    F('px_nevada_highway_desert', { over: [low('JUST OUTSIDE ITS BORDER…', 'outside')] }),
    F('cm_railroad_pass_casino', { cutW: 'casino', over: [low('RAILROAD PASS CASINO · OPENED 1931 · STILL OPEN', 'casino')] }),
  ]);
  beats('L032D', [
    F('cm_lake_mead_drought_copernicus', { kb: { z: [1.35, 1.25], x: [0.42, 0.45], y: [0.42, 0.45] }, credit: 'Image: contains modified Copernicus Sentinel data (2021), via Wikimedia Commons', over: [low('THE FIGHT REACHES THE COURTS', 'courts')] }),
    S('bars', { cutW: 'two-thirds', title: "NEVADA'S COLORADO RIVER SHARE", sub: 'thousand acre-feet a year', max: 320, items: [{ label: 'TODAY', v: 300, text: '300', at: 0.4, color: C('iceL') }, { label: '2026 FEDERAL PLAN · WORST CASE', v: 86, text: '~86 (−71%)', at: 1.4, color: Y }], source: 'Source: Nevada Independent; Salt Lake Tribune (2026)' }),
    F('loc_lake_mead_aerial_2018_b', { over: [low('NEVADA SUED THE FEDERAL GOVERNMENT', 'sued')] }),
  ]);

  // ===== CH6 =====
  chapter('L033', 6, 'The city under the city');
  beats('L033', [F('cm_las_vegas_summer_sky_storm', { kb: { z: [1.3, 1.22], x: [0.4, 0.42], y: [0.4, 0.42] }, over: [low("NOT DROUGHT — THE OPPOSITE", 'opposite')] })]);
  beats('L034', [
    F('cm_storm_clouds_spring_mountains', { over: [low('A SUMMER STORM', 'storm')] }),
    F('px_lightning_bolt_night', { over: [low("HARD, DRY GROUND: THE RAIN DOESN'T SOAK IN", 'soak')] }),
    F('cm_flooded_street_grand_teton', { over: [low('STREETS TURN INTO RIVERS', 'rivers')] }),
  ]);
  beats('L035', [
    F('cm_las_vegas_wash_vegas_valley_dr', { over: [low('FLOOD CHANNELS AND TUNNELS', 'channels')] }),
    S('stats', { cutW: 'network', head: 'UNDER AND AROUND THE CITY', items: [{ pre: '~', v: 600, suf: ' MILES', label: 'OF FLOOD CHANNELS, TUNNELS AND WASHES', at: 0.3, cnt: 0.6, size: 240 }], source: 'Source: Clark County flood district, via News 3' }),
    F('cm_las_vegas_wash_high_water', { over: [low('…ALL THE WAY TO LAKE MEAD', 'Mead')] }),
  ]);
  beats('L036', [
    F('px_historic_railroad_trail_tunnel', { over: [low('DRY · DARK · COOL', 'dry'), note('PHOTO: A DESERT TUNNEL NEAR LAKE MEAD, NOT A FLOOD TUNNEL')] }),
    F('cm_flamingo_wash_channel', { over: [low("THAT'S WHY PEOPLE LIVE IN THEM", 'live')] }),
    S('stats', { cutW: 'twelve', head: 'LIVING IN THE TUNNELS AND WASHES (ESTIMATE)', items: [{ v: 1200, label: 'TO', at: 0.4, size: 200 }, { v: 1500, label: 'PEOPLE', at: 0.9, size: 200 }], source: 'Source: outreach workers, via KFF Health News / News 3' }),
    F('cm_drone_night_topdown_strip', { over: [low('SOME RIGHT UNDER THE STRIP', 'Strip')] }),
  ]);
  beats('L037', [
    S('stats', { head: 'DOWN THERE, PEOPLE BUILD ROOMS', items: [], over: [chipC('BEDS · FURNITURE · EVEN BOOKS', 'beds', 560, 64)] }),
    F('cm_pittman_wash_flood', { over: [low('A STORM FILLS THE TUNNELS FAST', 'storm')] }),
    F('cm_pittman_wash_flood_b', { over: [low('PEOPLE HAVE DIED IN THESE FLOODS', 'died')] }),
  ]);

  // ===== ENDING =====
  chapter('L038', 7, 'The answer');
  beats('L038', [F('nasa_iss_lv_night_2025')]);
  beats('L039', [
    F('cm_springs_preserve', { kb: { z: [1.2, 1.05] }, over: [low('IT DRAINED ITS OWN SPRINGS', 'drained')] }),
    F('cm_drone_twilight_fountain_ring_topdown', { over: [low('IT DRINKS ITS WATER TWICE', 'twice')] }),
    F('px_lake_mead_canyon_ring', { kb: { z: [1.2, 1.05] }, over: [low('A STRAW UNDER A SHRINKING LAKE', 'straw')] }),
    F('cm_flamingo_wash_channel_b', { kb: { z: [1.3, 1.1] }, over: [low('600 MILES OF TUNNELS FOR RARE RAIN', 'tunnels')] }),
  ]);
  beats('L040', [F('cm_drone_night_eiffel_bellagio_lake', { over: [head("AND THE STRIP ISN'T EVEN IN LAS VEGAS", 'Strip', 200, 80, Y)] })]);
  beats('L041', [
    F('px_welcome_sign_night'),
    S('endq', { img: 'nasa_iss_lv_night_2024', credit: credit('nasa_iss_lv_night_2024'), lines: ['WOULD YOU LIVE', 'IN A CITY', 'IN THE DESERT?'], hl: 2, sub: 'Tell us in the comments · Which city should we explain next?' }),
  ]);
  add(T.tl.voiceEnd + T.tl.qcard, S('endscreen', {}), 'fade');
  return out;
}
module.exports = { assets, build, defaultTrans: 'cut', splitOver: 4.5, splitTo: 3 };
