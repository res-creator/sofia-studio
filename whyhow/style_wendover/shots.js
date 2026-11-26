// Reference look 2: Wendover — flat beige/blue maps, clean dark labels, routes drawn on, crisp number cards between footage.
const { assets, vid, pho } = require('../style_common')(__dirname, ['pxp_packed_platform_shibuya']);
const JP = { lon: [[0, 137.5], [3.5, 139.75]], lat: [[0, 37.0], [3.5, 35.68]], s: [[0, 70], [3.5, 520]] };
const YAMA = [[139.700, 35.690], [139.711, 35.728], [139.739, 35.733], [139.771, 35.728], [139.776, 35.713], [139.771, 35.698], [139.767, 35.681], [139.758, 35.655], [139.740, 35.629], [139.723, 35.633], [139.702, 35.658], [139.700, 35.690]];
const TOKAIDO = [[139.767, 35.681], [139.62, 35.51], [139.15, 35.26], [138.39, 34.97], [137.73, 34.70], [136.88, 35.17], [135.76, 34.99], [135.50, 34.73]];
function build(T) { const out = [], add = (t, sh) => out.push({ t, scene: sh.scene, p: sh.p, trans: 'fade' });
  add(0, { scene: 'flatmap', p: { ...JP, pins: [{ lon: 139.767, lat: 35.681, label: 'TOKYO', at: 1.2 }], title: { text: 'Japan', at: 0.3 } } });
  add(3.7, { scene: 'wcard', p: { head: 'TSUKUBA EXPRESS, NOVEMBER 2017', big: '20 SEC EARLY', sub: 'Nobody missed the train', source: 'NPR / Japan Today' } });
  add(5.8, vid('px_jr_platform_train_departs_vertical'));
  add(8.4, { scene: 'wcard', p: { head: "THE RAILWAY'S RESPONSE", big: '"SORRY"', sub: 'Officially. In writing.', color: '#2E86AB' } });
  add(11.1, vid('px_tokyo_station_marunouchi_night'));
  add(13.6, vid('dv_yamanote_platform_clock_boarding'));
  add(18.0, { scene: 'flatmap', p: { lon: 139.735, lat: 35.68, s: [[0, 3500], [3, 4200]], routes: [{ pts: YAMA, at: 0.2, dur: 2.2, color: '#5BA84E', label: '' }], pins: [{ lon: 139.700, lat: 35.690, label: 'Shinjuku', at: 0.6, size: 32 }, { lon: 139.767, lat: 35.681, label: 'Tokyo Station', at: 1.2, size: 32 }], title: { text: 'The Yamanote Line', at: 0.2 } } });
  add(21.8, pho('pxp_packed_platform_shibuya'));
  add(24.9, { scene: 'wcard', p: { head: 'RAIL RIDES AROUND TOKYO, EVERY DAY', big: '40,000,000', sub: '', source: 'MLIT' } });
  add(27.2, { scene: 'flatmap', p: { lon: -119.5, lat: 37.2, s: [[0, 62], [4, 72]], pins: [{ lon: -119.4, lat: 36.8, label: 'California · 39M people', at: 0.6, size: 38 }], title: { text: 'The same as everyone in…', at: 0.2 } } });
  add(31.6, vid('px_shinkansen_fuji_bridge_blue_sky'));
  add(34.2, { scene: 'flatmap', p: { lon: [[0, 139.2], [3, 137.6]], lat: [[0, 35.4], [3, 35.2]], s: [[0, 260], [3, 170]], routes: [{ pts: TOKAIDO, at: 0.3, dur: 2.4, color: '#E4572E' }], pins: [{ lon: 139.767, lat: 35.681, label: 'Tokyo', at: 0.2, size: 34 }, { lon: 135.50, lat: 34.73, label: 'Osaka', at: 2.6, size: 34 }], title: { text: 'So, how?', at: 0.3 } } });
  return out; }
module.exports = { assets, build, defaultTrans: 'fade', smooth: true };
