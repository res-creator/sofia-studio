// Motion-graphics test (35 s, opening of EP15 Dubai, owner's voice "How its run Narrator").
// Shows: kinetic titles, counters over blurred photos, animated bars, a camera dive from orbit to the city, an animated route.
const fs = require('fs'), path = require('path');
const MF = JSON.parse(fs.readFileSync(path.join(__dirname, 'footage/manifest.json')));
const FT = Object.fromEntries(MF.map(x => [x.key, x]));
const USE = ['cm_uae_flood_16_april_2024_cars', 'gov_nasa_iss_2025_dubai_abudhabi', 'gov_nasa_iss_2021_desert_city', 'gov_nasa_iss_2021_airport_creek', 'gov_nasa_eo_dubai_flood_after_20240419', 'esa_2024_dubai_floods_sentinel2', 'gov_nasa_iss_2025_dubai_islands'];
const assets = Object.fromEntries(USE.map(k => [k, 'footage/' + k + '.jpg']));
const C = require('../atlaskit/core').C;
const Y = '#FFC857', IL = 'ILLUSTRATIVE';
const note = (text) => ({ type: 'note', text, x: 60, y: 70, at: 0.3 });
const cr = k => { const f = FT[k]; return f && f.attribution && !/pixabay/i.test(f.source) ? 'Image: ' + f.attribution : ''; };
const vid = (k, o = {}) => ({ scene: 'video', p: { file: 'footage/' + k + '.mp4', cold: 0, z0: 1.0, z1: 1.08, ...o } });
function build(T) {
  const o = 0.5, out = [], add = (t, sh) => out.push({ t: o + t, scene: sh.scene, p: sh.p, trans: 'fade' });
  // 0.0 date title over the real flood photo (blurred)
  add(-0.5, { scene: 'blurcard', p: { img: 'cm_uae_flood_16_april_2024_cars', dark: 0.45, blur: 10, kins: [{ at: 0.1, y: 470, lines: [{ text: 'TUESDAY', size: 70, color: C.iceL, ls: 8 }, { text: '16 APRIL 2024', size: 150, color: Y }], bar: true, barW: 260 }], credit: cr('cm_uae_flood_16_april_2024_cars') } });
  // 2.6 flooded road, kinetic lower title
  add(2.6, vid('pb_flooded_road_302862', { over: [note('FLOODED ROAD · ' + IL), { type: 'kin', at: 1.0, x: 120, y: 880, align: 'left', lines: [{ text: 'ONE OF THE BUSIEST AIRPORTS ON EARTH', size: 56 }] }] }));
  // 6.5 rain
  add(6.5, vid('pb_heavy_rain_street_209759', { over: [note('HEAVY RAIN · ' + IL), { type: 'kin', at: 0.6, x: 120, y: 880, align: 'left', lines: [{ text: 'JETS TAXIING THROUGH WATER', size: 56, color: Y }] }] }));
  // 9.6 counter over blurred satellite flood image
  add(9.6, { scene: 'blurcard', p: { img: 'esa_2024_dubai_floods_sentinel2', head: 'DUBAI INTERNATIONAL · 2 DAYS', items: [{ v: 1244, at: 0.4, label: 'FLIGHTS CANCELLED', color: Y, size: 200 }], source: 'Source: Dubai officials via The National, 18 Apr 2024', credit: cr('esa_2024_dubai_floods_sentinel2') } });
  // 13.9 camera dive: orbit -> Dubai -> creek
  add(13.9, { scene: 'mgzoom', p: { imgs: [{ img: 'gov_nasa_iss_2025_dubai_abudhabi', z: [1, 1.9], fx: 0.5, fy: 0.3 }, { img: 'gov_nasa_iss_2021_desert_city', z: [1, 2.0], fx: 0.55, fy: 0.5 }, { img: 'gov_nasa_iss_2021_airport_creek', z: [1, 1.6] }], over: [note('DUBAI FROM THE INTERNATIONAL SPACE STATION (NASA)'), { type: 'kin', at: 1.1, y: 560, lines: [{ text: 'DUBAI', size: 190, ls: 14 }], bar: true, barW: 300 }], credit: 'Images: NASA' } });
  // 20.9 rain bars: a normal year vs one day
  add(19.4, { scene: 'blurcard', p: { img: 'gov_nasa_eo_dubai_flood_after_20240419', head: 'RAIN IN DUBAI', barMax: 7.6, bars: [{ label: 'PHOENIX, A WHOLE YEAR', v: 7.2, text: '7.2 IN', color: C.iceL, at: 0.3 }, { label: 'DUBAI, A WHOLE YEAR', v: 3.7, text: '3.7 IN', color: C.cream, at: 1.1 }, { label: 'DUBAI, 16 APRIL 2024 (ONE DAY)', v: 5.6, text: '~5.6 IN', color: C.red, at: 2.6 }], source: 'Sources: NOAA normals; NCM / AP' } });
  // 26.0 kinetic statement
  add(25.9, { scene: 'blurcard', p: { img: 'gov_nasa_iss_2025_dubai_islands', dark: 0.6, kins: [{ at: 0.2, y: 470, lines: [{ text: 'ALMOST EVERY DROP', size: 120 }, { text: 'OF WATER IS MADE', size: 120, color: Y }], bar: true, barW: 340 }], credit: cr('gov_nasa_iss_2025_dubai_islands') } });
  // 31.6 animated route: from the sea into the city (Landsat, 19 Apr 2024)
  add(31.6, { scene: 'mapline', p: { img: 'gov_nasa_eo_dubai_flood_after_20240419', kb: { z: [1.05, 1.18], x: [0.45, 0.5] }, pts: [[0.08, 0.2], [0.3, 0.38], [0.52, 0.55], [0.7, 0.62]], at: 0.3, dur: 2.4, color: '#4FC3F7', labels: [{ text: 'THE SEA', x: 0.12, y: 0.14, at: 0.2 }, { text: 'THE CITY', x: 0.72, y: 0.72, at: 2.4, bg: Y, colorT: C.ink }], over: [note('DUBAI, 19 APRIL 2024 (NASA LANDSAT 9) · ROUTE IS SCHEMATIC')], credit: cr('gov_nasa_eo_dubai_flood_after_20240419') } });
  return out;
}
module.exports = { assets, build, defaultTrans: 'fade', smooth: true };
