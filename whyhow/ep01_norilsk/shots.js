// EP01 Norilsk — shot list. Rendered by ../atlaskit/render.js. Times come from the real voice (timeline.json, words.json).
const fs = require('fs'), path = require('path');
const CR = JSON.parse(fs.readFileSync(path.join(__dirname, 'assets/credits.json')));
const has = k => !!CR[k];
const assets = Object.fromEntries(Object.keys(CR).map(k => [k, `assets/${k}.jpg`]));
const cr = k => CR[k] ? CR[k].short : '';
const pick = (...ks) => ks.find(has);
const NOR = { lon: 88.2, lat: 69.33 };
function ph(img, extra = {}) { return { img, credit: cr(img), ...extra }; }

function build(T) {
  const S = []; const add = (t, scene, p = {}, trans) => S.push({ t, scene, p, trans });
  const { s, e, at } = T; const rel = (id, w, n) => at(id, w, n); // absolute times
  const L = (id, w, n) => rel(id, w, n) - rel(id, 0); // time inside the paragraph

  // ===== COLD OPEN =====
  add(0, 'photo', ph('pano', { kb: { z: [1.0, 1.12], x: [0.35, 0.45] }, snow: 80, dark: 0.15,
    over: [{ type: 'head', text: 'A CITY BUILT ON ICE', y: 190, size: 120, at: 0.15 }, { type: 'tag', text: '69°N 88°E · NORILSK', at: 0.6 }] }), 'cut');
  { const t0 = at('P001', 'city'); add(t0, 'globe', { lon: [[0, 70], [4, 88]], lat: [[0, 35], [4, 64]], R: [[0, 430], [4.5, 2400]], arctic: [[2.5, 0], [3.2, 1]], arcticLabel: 64,
    pins: [{ ...NOR, label: 'NORILSK', sub: '174,000 PEOPLE', at: 2.0 }], bracket: { lon: 88.2, lat0: 66.56, lat1: 69.33, at: 3.6, label: '~300 KM' } }); }
  add(at('P001', 'road'), 'photo', ph('kirova', { kb: { z: [1.05, 1.15], x: [0.55, 0.45] }, over: [
    { type: 'chip', text: 'NO ROAD TO THE REST OF RUSSIA', x: 960, y: 200, align: 'center', size: 54, at: 0.1 },
    { type: 'chip', text: 'NO RAILWAY EITHER', x: 960, y: 290, align: 'center', size: 54, at: L('P001', 'railway') - L('P001', 'road') }] }));
  add(at('P001', 'every'), 'xsec', { house: 'block', season: 0, frost: [[0, 0], [2.5, 1]], piles: 1, gap: 1, rulerA: [[0, 0], [1.5, 1]],
    zoom: [[0, 1.25], [4, 1]], fy: [[0, 480], [4, 540]], over: [{ type: 'label', text: 'FROZEN SOLID', x: 1420, y: 820, at: 1.5 }] });
  // P002
  add(s('P002'), 'xsec', { house: 'stone', season: 0, heat: [[L('P002', 'moment') - 0.5, 0], [L('P002', 'moment'), 1]],
    thaw: [[L('P002', 'moment'), 0], [L('P002', 'sinks'), 0.8]], sink: [[L('P002', 'sinks') - 0.3, 0], [L('P002', 'tilts'), 0.6], [L('P002', 'cracks'), 1]], crack: [[L('P002', 'cracks') - 0.2, 0], [L('P002', 'cracks') + 0.6, 1]],
    over: [{ type: 'label', text: 'HARD AS CONCRETE', x: 1460, y: 800, at: L('P002', 'concrete') - 0.4, until: L('P002', 'catch') }, { type: 'label', text: 'ICE MELTS', x: 1460, y: 800, at: L('P002', 'melt') - 0.3 }] });
  // P003
  add(s('P003'), 'photo', ph('house1', { kb: { z: [1.0, 1.1], x: [0.3, 0.35], y: [0.6, 0.62] }, over: [{ type: 'head', text: 'SO HOW DOES NORILSK DO IT?', y: 180, size: 96, at: 0.2 }] }));
  add(at('P003', 'answer'), 'xsec', { house: 'block', season: 0, frost: 1, zoom: [[0, 1], [3.5, 1.7]], fy: [[0, 540], [3.5, 800]], fx: [[0, 960], [3.5, 1400]], probe: [[1.2, 0], [3.2, 1]], probeText: '10 M DOWN' });
  add(e('P003') + 0.3, 'title', { lines: ["WHY DON'T HOUSES", 'IN NORILSK', 'SINK?'], hl: 1, img: 'lenina', credit: cr('lenina'), brand: true });

  // ===== CH1 =====
  add(s('P004') - 3.2, 'chapter', { n: 1, title: "A city that shouldn't exist" });
  add(s('P004'), 'globe', { lon: [[0, 60], [5, 75]], lat: [[0, 45], [5, 64]], R: [[0, 600], [5, 1700]],
    pins: [{ ...NOR, label: 'NORILSK', sub: '69°N · TAYMYR', at: 1.5 }, { lon: 33.08, lat: 68.97, label: 'MURMANSK', sub: 'BIGGER, BUT FURTHER SOUTH', at: L('P004', 'Murmansk'), small: true, size: 36, align: 'right', lx: -26 }] });
  add(s('P005'), 'stats', { img: 'car_snow', credit: cr('car_snow'), head: 'NORILSK CLIMATE', items: [
    { pre: '−', v: 8, suf: '°C', label: 'AVERAGE OVER A YEAR', at: L('P005', 'average') }, { pre: '−', v: 27, suf: '°C', label: 'AVERAGE IN JANUARY', at: L('P005', 'January') }, { pre: '−', v: 53, suf: '°C', label: 'RECORD LOW', at: L('P005', 'record') }] });
  add(at('P005', 'weeks') - 1.2, 'calendar', {});
  add(s('P006'), 'photo', ph('pano', { kb: { z: [1.1, 1.2], x: [0.6, 0.4] }, over: [{ type: 'chip', text: 'NICKEL · COPPER · PALLADIUM', x: 960, y: 210, align: 'center', size: 56, at: L('P006', 'nickel') }] }));
  add(at('P006', 'Today'), 'stats', { img: 'pano', credit: cr('pano'), items: [{ pre: '>', v: 40, suf: '%', label: "OF THE WORLD'S PALLADIUM (NORNICKEL)", at: 1.0, size: 220 }], source: 'Source: Reuters, 2024' });
  if (has('belfry')) add(s('P007'), 'photo', ph('belfry', { kb: { z: [1.05, 1.15] }, dark: 0.3, over: [{ type: 'head', text: 'NORILLAG', sub: 'SOVIET LABOR CAMP · 1935–1956', y: 200, at: L('P007', 'Norillag') }] }));
  else add(s('P007'), 'title', { lines: ['NORILLAG', '1935–1956'], hl: 1 });
  add(at('P007', 'Historians'), 'stats', { items: [{ pre: '~', v: 400000, label: 'PRISONERS PASSED THROUGH (ESTIMATE)', at: 0.6 }, { pre: '>', v: 16000, label: 'DEATHS IN OFFICIAL RECORDS', at: L('P007', 'Official') - L('P007', 'Historians') }],
    source: 'Sources: Memorial estimate; camp records (Hoover Institution)' });
  add(s('P008'), 'photo', ph(pick('first_house', 'lomonosova'), { kb: { z: [1.02, 1.12] }, snow: 60 }));

  // ===== CH2 =====
  add(s('P009') - 3.2, 'chapter', { n: 2, title: 'What is permafrost, really?' });
  add(s('P009'), 'xsec', { house: 'none', season: 0, rulerA: [[0, 0], [1, 1]], over: [{ type: 'chip', text: '0°C OR COLDER · 2+ YEARS IN A ROW', x: 960, y: 220, align: 'center', size: 56, at: L('P009', 'Any') },
    { type: 'note', text: 'ROCK · SAND · CLAY · PEAT', x: 960, y: 300, align: 'center', size: 32, at: L('P009', 'rock') }] });
  add(s('P010'), 'photo', ph('talnah_yard', { kb: { z: [1.05, 1.16], y: [0.6, 0.5] }, over: [{ type: 'chip', text: 'CONTINUOUS PERMAFROST', x: 960, y: 200, align: 'center', size: 60, at: L('P010', 'continuous') }] }));
  add(s('P011'), 'xsec', { house: 'none', season: [[0, 0], [L('P011', 'summer'), 0], [L('P011', 'summer') + 1.5, 1], [L('P011', 'winter') , 1], [L('P011', 'winter') + 1.5, 0]],
    over: [{ type: 'label', text: 'ACTIVE LAYER · ~1 M', x: 1250, y: 520, to: [1250, 640], at: L('P011', 'active') }, { type: 'label', text: 'FROZEN ALL YEAR', x: 960, y: 880, at: L('P011', 'Below') }] });
  add(s('P012'), 'split', {});
  add(s('P013'), 'xsec', { house: 'stone', season: 0, heat: [[L('P013', 'Heat') - 0.3, 0], [L('P013', 'Heat'), 1]], thaw: [[L('P013', 'warms') - 0.5, 0], [L('P013', 'strength'), 1]],
    sink: [[L('P013', 'One') - 0.3, 0], [L('P013', 'walls'), 0.7]], crack: [[L('P013', 'crack') - 0.3, 0], [L('P013', 'crack') + 0.5, 1]],
    over: [{ type: 'note', text: '−30°C OUTSIDE · +20°C INSIDE', x: 960, y: 120, align: 'center', size: 34, at: 0.8 }] });

  // ===== CH3 =====
  add(s('P014') - 3.2, 'chapter', { n: 3, title: 'The houses that cracked' });
  add(s('P014'), 'stats', { img: pick('first_house', 'lomonosova'), credit: cr(pick('first_house', 'lomonosova')), head: 'NORILSK, 1937–1940', items: [
    { pre: '~', v: 30, label: 'LOW STONE HOUSES, SHALLOW FOUNDATIONS', at: 1.2 }, { pre: '~', v: 50, suf: '%', label: 'BEGAN TO DEFORM ALMOST AT ONCE', at: L('P014', 'half') }], source: 'According to Russian engineering studies' });
  add(s('P015'), 'xsec', { house: 'stone', season: 0, heat: 1, thaw: [[0, 0.3], [3, 0.9]], sink: [[0, 0.2], [3, 0.8]], crack: 1 });
  add(at('P015', 'digging'), 'photo', ph('lomonosova', { kb: { z: [1.02, 1.12], x: [0.4, 0.55] }, over: [{ type: 'chip', text: 'COLUMNS DOWN TO SOLID ROCK', x: 960, y: 200, align: 'center', size: 54, at: 0.3 },
    { type: 'note', text: 'ONLY WHERE ROCK IS CLOSE · SLOW · EXPENSIVE', x: 960, y: 280, align: 'center', size: 30, at: L('P015', 'works') - L('P015', 'digging') }] }));
  add(s('P016'), 'photo', ph('house2', { kb: { z: [1.0, 1.12], x: [0.45, 0.4], y: [0.6, 0.65] }, dark: 0.1, over: [{ type: 'head', text: 'PROTECT THE ICE', y: 200, size: 120, at: L('P016', 'protect') }] }));

  // ===== CH4 =====
  add(s('P017') - 3.2, 'chapter', { n: 4, title: 'The trick: stilts and cold air' });
  add(s('P017'), 'versus', { title: 'SOVIET BUILDING CODES: TWO WAYS TO BUILD ON PERMAFROST', cards: [
    { who: 'PRINCIPLE II', text: 'Accept that the ground will thaw, and design the building for it.', color: C('orange'), at: L('P017', 0.22) },
    { who: 'PRINCIPLE I', text: 'Keep the ground frozen for the whole life of the building. Most of Norilsk.', color: C('ice'), at: L('P017', 0.5) }] });
  add(s('P018'), 'xsec', { house: 'block', season: 0, piles: [[0.3, 0], [L('P018', 'drilled') + 0.8, 1]], frost: [[L('P018', 'refreezes'), 0], [L('P018', 'refreezes') + 2, 1]], rulerA: 1,
    over: [{ type: 'label', text: 'PILES', x: 520, y: 900, to: [612, 860], at: L('P018', 'piles') + 0.5 }, { type: 'label', text: 'FROZEN GRIP', x: 1450, y: 900, to: [1270, 860], at: L('P018', 'gripped') }] });
  add(s('P019'), 'xsec', { house: 'block', season: 0, frost: 1, gap: [[0, 0.2], [L('P019', 'open'), 1]], zoom: [[0, 1], [3, 1.35]], fy: [[0, 540], [3, 560]],
    over: [{ type: 'label', text: 'VENTILATED GAP', x: 960, y: 780, to: [960, 560], at: L('P019', 'ventilated') }] });
  add(at('P019', 'Look'), 'photo', ph('house1', { kb: { z: [1.0, 1.15], x: [0.42, 0.45], y: [0.65, 0.7] }, over: [{ type: 'label', text: 'THE BUILDING STANDS ABOVE THE GROUND', x: 1150, y: 300, to: [1100, 640], at: 1.0 }] }));
  add(at('P019', 'hover'), 'photo', ph('house3', { kb: { z: [1.05, 1.15], x: [0.5, 0.55], y: [0.5, 0.55] } }));
  add(s('P020'), 'xsec', { house: 'block', frost: 1, season: [[0, 0], [L('P020', 'summer') - 0.5, 0], [L('P020', 'summer') + 1, 1]],
    wind: [[L('P020', 'winter'), 0], [L('P020', 'winter') + 0.6, 1], [L('P020', 'summer') - 0.4, 1], [L('P020', 'summer'), 0]], heat: [[L('P020', 'heat', 2) - 0.4, 0], [L('P020', 'heat', 2), 1]],
    over: [{ type: 'label', text: 'COLD AIR PULLS HEAT OUT', x: 960, y: 230, at: L('P020', 'freezing'), until: L('P020', 'summer') }, { type: 'label', text: 'SHADE', x: 960, y: 230, at: L('P020', 'shadow') }] });
  add(s('P021'), 'xsec', { house: 'block', season: 0, frost: 1, pipes: [[L('P021', 'pipes') - 0.3, 0], [L('P021', 'pipes'), 1]], zoom: [[0, 1], [3, 1.3]], fx: [[0, 960], [3, 640]],
    over: [{ type: 'label', text: 'PIPES ABOVE GROUND', x: 600, y: 300, to: [400, 520], at: L('P021', 'pipes') + 0.4 }] });
  add(s('P022'), 'photo', ph('talnah_yard', { kb: { z: [1.12, 1.0], y: [0.5, 0.45] }, over: [{ type: 'chip', text: 'PANEL BLOCKS · 5 AND 9 STOREYS', x: 960, y: 200, align: 'center', size: 54, at: L('P022', 'panel') },
    { type: 'note', text: 'MOST BUILT BEFORE THE 1980s', x: 960, y: 280, align: 'center', size: 34, at: L('P022', 'most') }] }));
  add(s('P023'), 'xsec', { house: 'block', season: 0, frost: 1, warm: [[L('P023', 'warmer') - 0.5, 0], [L('P023', 'directions'), 0.45]],
    over: [{ type: 'chip', text: 'ONLY WORKS IF THE GROUND STAYS COLD', x: 960, y: 220, align: 'center', size: 52, at: L('P023', 'only') }] });

  // ===== CH5 =====
  add(s('P024') - 3.2, 'chapter', { n: 5, title: 'When the trick fails' });
  add(s('P024'), 'xsec', { house: 'block', season: 0, frost: [[0, 1], [L('P024', 'melt'), 0.3]], wind: [[0, 1], [L('P024', 'snow') + 1, 0]], drift: [[L('P024', 'snow'), 0], [L('P024', 'snow') + 2, 1]],
    leak: [[L('P024', 'leaking') - 0.2, 0], [L('P024', 'leaking') + 0.5, 1]], talik: [[L('P024', 'floods'), 0], [L('P024', 'melt') + 1.5, 1]],
    over: [{ type: 'label', text: 'SNOW = BLANKET', x: 520, y: 300, to: [460, 540], at: L('P024', 'blanket') - 0.3, until: L('P024', 'leaking') }, { type: 'label', text: 'LEAKING PIPE', x: 1300, y: 300, to: [1040, 520], at: L('P024', 'leaking') + 0.3 }] });
  add(s('P025'), 'thermo', { extra: { at: L('P025', 'spots'), text: '+3 TO 5°C WARMER AT SOME SITES THAN IN THE 1940s' } });
  add(s('P026'), 'sat', { img: 'sat_2021', crop: [700, 300, 2600, 1462], z: [[0, 1.0], [8, 1.12]], credit: cr('sat_2021'), dark: 0.15,
    over: [{ type: 'count', from: 0, to: 1.4, dec: 1, pre: '+', suf: '°C', label: 'AIR TEMPERATURE, 1970s → 2010s', y: 560, at: L('P026', 'rose') - 0.8 }, { type: 'note', text: 'NORILSK FROM SPACE · OCT 2021', x: 48, y: 60, at: 0.2 }] });
  add(at('P026', 'Arctic') - 0.3, 'ratio', {});
  add(s('P027'), 'bars', { title: "THE GROUND'S ABILITY TO CARRY BUILDINGS — LOSS BY 2013", sub: 'Norilsk, model study', max: 100, items: [
    { label: 'Buildings from the 1960s', v: 15, at: L('P027', 'sixties') }, { label: 'Buildings from the 1970s–80s', v: 21, at: L('P027', 'seventies') }], source: 'Source: Streletskiy, Shiklomanov, Kokorev & Anisimov, 2015' });
  add(s('P028'), 'bars', { title: 'PROJECTED LOSS OF BEARING CAPACITY', sub: 'Six climate models · wide uncertainty', max: 100, items: [
    { label: 'By 2020 (all 1970s–80s buildings)', v: 37, err: 22, text: '−37%', at: L('P028', 'twenty') }, { label: 'By 2050 (older foundations)', v: 67, err: 28, text: '−67%', at: L('P028', 'fifty') }], source: 'Source: Streletskiy et al., 2015 (projections, ± range)' });
  add(s('P029'), 'stats', { img: pick('snowdrifts', 'house3'), credit: cr(pick('snowdrifts', 'house3')), head: 'NORILSK, MID-2010s', items: [
    { pre: '~', v: 300, label: 'STRUCTURES WITH SIGNIFICANT DEFORMATIONS', at: L('P029', 'structures') }, { pre: '>', v: 100, label: 'HOMES IN STRUCTURAL FAILURE · ~5,000 FAMILIES INSIDE', at: L('P029', 'residential') },
    { pre: '~', v: 50, label: 'BLOCKS ALREADY TAKEN APART', at: L('P029', 'buildings', 2) }], source: 'Source: Streletskiy et al., 2015' });
  add(s('P030'), 'myth', { crossAt: L('P030', 'nobody'), realAt: L('P030', 'Permafrost') });

  // ===== CH6 =====
  add(s('P031') - 3.2, 'chapter', { n: 6, title: 'May 29, 2020' });
  { const im = pick('spill_ambarnaya', 'spill_esa'); if (im) add(s('P031'), 'photo', ph(im, { kb: { z: [1.0, 1.12] }, cold: 0, over: [{ type: 'count', from: 0, to: 21000, suf: ' T', label: 'OF DIESEL SPILLED', y: 560, at: L('P031', 'diesel') - 0.8 }, { type: 'note', text: 'SATELLITE VIEW · COPERNICUS SENTINEL-2 · 2020', at: 0.3 }] }));
    else add(s('P031'), 'stats', { img: 'pano', credit: cr('pano'), head: '29 MAY 2020 · POWER PLANT FUEL TANK', items: [{ pre: '~', v: 21000, suf: ' T', label: 'OF DIESEL INTO SOIL AND RIVERS', at: L('P031', 'diesel') - 0.8, size: 190 }] }); }
  add(s('P032'), 'versus', { title: 'WHAT CAUSED IT?', cards: [{ who: 'THE COMPANY (FIRST)', text: '"The supports sank because the permafrost thawed."', color: C('orange'), at: 0.6, src: 'NTEK / Nornickel, 2020' }] });
  add(s('P033'), 'versus', { title: 'WHAT THE INVESTIGATIONS FOUND', cards: [
    { who: 'REVIEW FOR NORNICKEL', text: 'Some piles were shorter than designed and never set into bedrock.', color: C('orange'), at: L('P033', 'review') - 0.5, src: 'ERM review, 2020' },
    { who: 'SAFETY REGULATOR', text: 'No sign of thawed permafrost. Weak foundations, missed inspections. Back in use in 2019 unchecked.', color: C('ice'), at: L('P033', 'regulator') - 0.5, src: 'Rostekhnadzor, Nov 2020' }] });
  add(s('P034'), 'stats', { head: 'RECORD ENVIRONMENTAL FINE · PAID MARCH 2021', items: [{ v: 146, suf: ' BN', label: 'RUBLES', at: L('P034', 'hundred') }, { pre: '~$', v: 2, suf: ' BN', label: 'US DOLLARS', at: L('P034', 'dollars') - 0.8 }],
    source: 'Source: Meduza, 10 Mar 2021' });
  add(s('P035'), 'photo', ph('house3', { kb: { z: [1.12, 1.02] }, dark: 0.35, over: [{ type: 'chip', text: '1. THE GROUND STAYS COLD', x: 960, y: 420, align: 'center', size: 62, at: L('P035', 'ground', 2) - 0.2 }, { type: 'chip', text: '2. HUMANS DO THEIR JOB', x: 960, y: 540, align: 'center', size: 62, at: L('P035', 'humans') }] }));

  // ===== CH7 =====
  add(s('P036') - 3.2, 'chapter', { n: 7, title: 'A refrigerator under the city' });
  add(s('P036'), 'siphon', { season: 0, over: [{ type: 'chip', text: 'THERMOSIPHON', x: 1400, y: 300, size: 66, at: L('P036', 'thermosiphon') }, { type: 'note', text: 'NO ELECTRICITY', x: 1400, y: 380, size: 34, at: L('P036', 'electricity') }] });
  add(s('P037'), 'siphon', { season: 0, over: [{ type: 'label', text: 'SEALED PIPE', x: 1400, y: 250, to: [1000, 260], at: L('P037', 'sealed') }, { type: 'label', text: 'LIQUID PICKS UP HEAT', x: 1400, y: 900, to: [990, 930], at: L('P037', 'liquid', 2) },
    { type: 'label', text: 'VAPOR RISES, COOLS, RETURNS', x: 1450, y: 520, to: [1010, 420], at: L('P037', 'vapor', 2) }] }, 'cut');
  add(s('P038'), 'siphon', { season: [[0, 0], [L('P038', 'summer'), 0], [L('P038', 'summer') + 1.2, 1], [L('P038', 'direction') , 1], [L('P038', 'direction') + 1, 0]],
    over: [{ type: 'chip', text: 'HEAT MOVES ONE WAY: OUT', x: 1400, y: 300, size: 52, at: L('P038', 'direction') }] }, 'cut');
  add(s('P039'), 'examples', { second: L('P039', 0.45) });
  add(s('P040'), 'xsec', { house: 'block', season: 0, frost: 1, siph: [[0, 0], [2.5, 1]], cold: [[1, 0], [6, 1]], over: [
    { type: 'chip', text: 'PILOT: 2 BUILDINGS · 2019–2020', x: 960, y: 200, align: 'center', size: 50, at: L('P040', 'pilot') },
    { type: 'chip', text: 'PLAN: HUNDREDS OF HOUSES BY 2035', x: 960, y: 290, align: 'center', size: 50, at: L('P040', 'hundreds') }] });
  add(s('P041'), 'photo', ph('sevastopolskaya', { kb: { z: [1.02, 1.14], x: [0.4, 0.5] }, over: [{ type: 'chip', text: 'RENOVATION PROGRAM · 2021', x: 960, y: 200, align: 'center', size: 56, at: L('P041', 'renovation') },
    { type: 'note', text: 'DOZENS OF FAILING BLOCKS → NEW APARTMENTS', x: 960, y: 280, align: 'center', size: 34, at: L('P041', 'demolished') }] }));
  add(at('P041', 'Nornickel', 2), 'stats', { img: 'kirova', credit: cr('kirova'), items: [{ pre: '~', v: 165, label: 'BUILDINGS & STRUCTURES UNDER SENSOR MONITORING', at: 0.8, size: 220 }], source: 'Source: Nornickel via ComNews, 2022' });

  // ===== ENDING =====
  add(s('P042') - 1.2, 'xsec', { house: 'block', season: 0, frost: 1, wind: 1, heat: 1, pipes: 1, siph: 1, cold: 1, zoom: [[0, 1.2], [10, 1]],
    over: [{ type: 'label', text: 'STILTS IN THE WIND', x: 960, y: 760, to: [960, 560], at: L('P042', 'Stilts') + 1.2 }, { type: 'label', text: 'PIPES ABOVE GROUND', x: 420, y: 300, to: [300, 520], at: L('P042', 'pipes') + 1.2 },
      { type: 'label', text: 'STEEL TUBES PUMP HEAT OUT', x: 1500, y: 300, to: [1430, 420], at: L('P042', 'steel') + 1.2 }] });
  add(s('P043'), 'photo', ph('lenina', { kb: { z: [1.15, 1.02] }, dark: 0.3, over: [{ type: 'head', text: 'NOT FROZEN GROUND', y: 330, size: 110, at: L('P043', 'stand') - 0.3 }, { type: 'head', text: 'GROUND IT KEEPS FROZEN', y: 480, size: 110, color: '#FFC857', at: L('P043', 'keeps') - 0.2 }] }));
  add(at('P043', 'refrigerator'), 'xsec', { house: 'block', season: 0, frost: 1, siph: 1, cold: 1, warm: [[0, 0], [8, 0.5]], wind: 1, zoom: [[0, 1], [8, 0.9]] });
  add(s('P044'), 'globe', { lon: [[0, 80], [12, 100]], lat: [[0, 75], [12, 78]], R: [[0, 520], [12, 560]], arctic: 1, arcticLabel: 150,
    over: [{ type: 'count', from: 0, to: 4000000, pre: '~', label: 'PEOPLE ON THAWING-RISK GROUND BY 2050', x: 480, y: 470, size: 110, labelSize: 30, at: L('P044', 'million') - 1.0 },
      { type: 'count', from: 0, to: 70, pre: '~', suf: '%', label: 'OF ARCTIC PERMAFROST INFRASTRUCTURE', x: 1440, y: 470, size: 110, labelSize: 30, at: L('P044', 'seventy') - 0.6 },
      { type: 'note', text: 'Source: Hjort et al. 2018, Nature Communications', x: 960, y: 1030, align: 'center', size: 22, at: 1 }] });
  add(s('P045'), 'endq', { img: 'house1', credit: cr('house1'), lines: ['WOULD YOU LIVE', 'IN A CITY THAT', 'REFRIGERATES ITS GROUND?'], hl: 2, sub: 'Tell us in the comments · Which place should we explain next?' });
  add(T.tl.voiceEnd + T.tl.qcard, 'endscreen', {});
  return S;
}
function C(n) { return require('../atlaskit/core').C[n]; }
module.exports = { assets, build };
