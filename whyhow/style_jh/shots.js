// Reference look 3: Johnny Harris — paper texture, printed photos taped on paper, red marker on maps, typewriter titles, film grain, cuts on the beat.
const { assets, vid, pho } = require('../style_common')(__dirname, ['cm_minami_nagareyama_exits_2022', 'cm_tsukuba_express_tx3000_otakanomori', 'pxp_packed_platform_shibuya', 'pxp_tokyo_station_night_aerial', 'pxp_shibuya_crossing_from_above', 'cm_e235_yamanote_shibuya_2026']);
const YAMA = [[139.700, 35.690], [139.711, 35.728], [139.739, 35.733], [139.771, 35.728], [139.776, 35.713], [139.771, 35.698], [139.767, 35.681], [139.758, 35.655], [139.740, 35.629], [139.723, 35.633], [139.702, 35.658], [139.700, 35.690]];
const TOKAIDO = [[139.767, 35.681], [139.62, 35.51], [139.15, 35.26], [138.39, 34.97], [137.73, 34.70], [136.88, 35.17], [135.76, 34.99], [135.50, 34.73]];
function build(T) { const out = [], add = (t, sh, tr = 'cut') => out.push({ t, scene: sh.scene, p: sh.p, trans: tr });
  add(0, { scene: 'papermap', p: { lon: [[0, 138], [1.3, 139.6]], lat: [[0, 37], [1.3, 35.7]], s: [[0, 80], [1.3, 380]], pins: [{ lon: 139.767, lat: 35.681, label: 'TOKYO', at: 0.5 }], title: { text: 'TOKYO, 2017', at: 0.1, x: 110, y: 150 } } });
  add(1.2, { scene: 'cutouts', p: { cards: [{ img: 'cm_minami_nagareyama_exits_2022', x: 960, y: 500, w: 980, rot: -0.03, at: 0, caption: 'MINAMI-NAGAREYAMA STATION' }] } });
  add(3.6, { scene: 'cutouts', p: { cards: [{ img: 'cm_minami_nagareyama_exits_2022', x: 700, y: 470, w: 860, rot: -0.05, at: -5 }, { img: 'cm_tsukuba_express_tx3000_otakanomori', x: 1220, y: 520, w: 880, rot: 0.04, at: 0, fromX: 400, caption: 'TSUKUBA EXPRESS' }], headline: { text: '20 SECONDS EARLY', at: 0.4, x: 120, y: 1000 } } });
  add(5.8, vid('px_jr_platform_train_departs_vertical'));
  add(7.2, vid('px_shibuya_crossing_pedestrians_night'));
  add(8.4, { scene: 'cutouts', p: { cards: [{ img: 'pxp_tokyo_station_night_aerial', x: 960, y: 470, w: 1000, rot: 0.02, at: 0 }], headline: { text: '"WE DEEPLY APOLOGIZE"', at: 1.6, x: 360, y: 1000 } } });
  add(11.6, { scene: 'cutouts', p: { cards: [{ img: 'pxp_tokyo_station_night_aerial', x: 960, y: 470, w: 1000, rot: 0.02, at: -5 }, { img: 'cm_e235_yamanote_shibuya_2026', x: 1350, y: 620, w: 620, rot: -0.06, at: 0, fromX: 300 }] } });
  add(13.6, { scene: 'papermap', p: { lon: 139.735, lat: 35.68, s: [[0, 3400], [4, 4100]], routes: [{ pts: YAMA, at: 0.3, dur: 2.4 }], pins: [{ lon: 139.767, lat: 35.681, label: 'YAMANOTE LINE', at: 2.2, dx: 70, dy: -60 }] } });
  add(18.0, vid('dv_yamanote_platform_clock_boarding'));
  add(20.2, vid('px_shibuya_crossing_aerial_night'));
  add(21.8, { scene: 'cutouts', p: { cards: [{ img: 'pxp_packed_platform_shibuya', x: 720, y: 460, w: 900, rot: -0.04, at: 0 }, { img: 'pxp_shibuya_crossing_from_above', x: 1260, y: 540, w: 760, rot: 0.05, at: 0.6, fromX: 300 }], headline: { text: '40,000,000 RIDES / DAY', at: 3.2, x: 120, y: 1000 } } });
  add(27.2, { scene: 'papermap', p: { lon: -119.5, lat: 37.2, s: [[0, 60], [4, 72]], pins: [{ lon: -119.4, lat: 36.8, label: 'CALIFORNIA · 39M', at: 0.8, dx: 70 }] } });
  add(31.6, vid('px_shinkansen_fuji_bridge_blue_sky'));
  add(34.2, { scene: 'papermap', p: { lon: [[0, 139.2], [3, 137.6]], lat: [[0, 35.4], [3, 35.2]], s: [[0, 260], [3, 170]], routes: [{ pts: TOKAIDO, at: 0.3, dur: 2.4 }], pins: [{ lon: 135.50, lat: 34.73, label: 'OSAKA', at: 2.6, dx: -10, dy: 90 }], title: { text: 'SO... HOW?', at: 0.4, x: 110, y: 160 } } });
  return out; }
module.exports = { assets, build, defaultTrans: 'cut', smooth: false };
