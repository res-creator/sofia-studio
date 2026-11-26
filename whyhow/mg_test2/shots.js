// Motion-graphics test 2 (~40 s, Tokyo trains), light and friendly tone. Owner's voice "How its run Narrator" (ElevenLabs).
// Brighter grade, warm accents, soft moves: kinetic titles, counters over blurred photos, a camera dive, smooth dissolves.
const fs = require('fs'), path = require('path');
const MF = JSON.parse(fs.readFileSync(path.join(__dirname, 'footage/manifest.json')));
const FT = Object.fromEntries(MF.map(x => [x.key, x]));
const USE = ['pxp_shibuya_crossing_from_above', 'pxp_packed_platform_shibuya', 'pxp_tokyo_station_night_aerial', 'pxp_shinjuku_skyline_haze', 'cm_minami_nagareyama_exits_2022', 'pxp_yamanote_tracks_ikebukuro'];
const assets = Object.fromEntries(USE.map(k => [k, 'footage/' + k + '.jpg']));
const C = require('../atlaskit/core').C;
const Y = '#FFC857', PINK = '#FF8FA3', MINT = '#7FE3C4', IL = 'ILLUSTRATIVE';
const note = (text) => ({ type: 'note', text, x: 60, y: 70, at: 0.3 });
const cr = k => { const f = FT[k]; return f && f.attribution && !/pixabay/i.test(f.source) ? 'Photo: ' + f.attribution : ''; };
const vid = (k, o = {}) => ({ scene: 'video', p: { file: 'footage/' + k + '.mp4', cold: 0, z0: 1.0, z1: 1.07, ...o } });
function build(T) {
  const W = (w, n) => T.at('A001', w, n) - 0.15;            // cut just before a word
  const out = [], add = (t, sh) => out.push({ t, scene: sh.scene, p: sh.p, trans: 'fade' });
  add(0, vid('px_shibuya_crossing_aerial_night', { over: [note('SHIBUYA, TOKYO'), { type: 'kin', at: 0.3, y: 520, lines: [{ text: "HERE'S A FUN ONE", size: 110, color: Y }], bar: true, barW: 240, barColor: PINK }] }));
  add(W('In'), { scene: 'blurcard', p: { img: 'cm_minami_nagareyama_exits_2022', dark: 0.35, blur: 8, kins: [{ at: 0.4, y: 470, lines: [{ text: 'A TRAIN LEFT', size: 90 }, { text: '20 SECONDS EARLY', size: 140, color: Y }], bar: true, barW: 320, barColor: MINT }], credit: cr('cm_minami_nagareyama_exits_2022') } });
  add(W('Nobody'), vid('px_jr_platform_train_departs_vertical', { over: [note('TOKYO-AREA PLATFORM · ' + IL), { type: 'kin', at: 0.2, x: 120, y: 860, align: 'left', lines: [{ text: 'NOBODY MISSED IT.', size: 64 }] }, { type: 'kin', at: 1.3, x: 120, y: 940, align: 'left', lines: [{ text: 'NOBODY COMPLAINED.', size: 64, color: MINT }] }] }));
  add(W('And'), { scene: 'blurcard', p: { img: 'pxp_tokyo_station_night_aerial', dark: 0.4, blur: 10, kins: [{ at: 0.3, y: 470, lines: [{ text: '"WE DEEPLY APOLOGIZE"', size: 110, color: Y }, { text: 'OFFICIALLY. IN WRITING.', size: 60, color: C.cream }], bar: true, barW: 300, barColor: PINK }], source: 'Tsukuba Express, 14 Nov 2017 (NPR / Japan Today)' } });
  add(W('Now'), vid('dv_yamanote_platform_clock_boarding', { over: [note('YAMANOTE LINE, TOKYO'), { type: 'kin', at: 0.6, x: 120, y: 880, align: 'left', lines: [{ text: 'NOT ACTUALLY PERFECT', size: 64, color: Y }] }] }));
  add(W('But'), { scene: 'mgzoom', p: { imgs: [{ img: 'pxp_shinjuku_skyline_haze', z: [1, 1.5] }, { img: 'pxp_shibuya_crossing_from_above', z: [1.05, 1.6] }], over: [{ type: 'kin', at: 0.4, y: 300, lines: [{ text: "HERE'S THE COOL PART", size: 80, color: C.cream }] }] } });
  add(W('Every'), { scene: 'blurcard', p: { img: 'pxp_packed_platform_shibuya', dark: 0.35, blur: 9, head: 'TRAIN RIDES AROUND TOKYO, EVERY DAY', items: [{ v: 40, from: 0, suf: ' MILLION', at: 0.6, label: '≈ ALL OF CALIFORNIA, BY TRAIN', color: Y, size: 180 }], source: 'Source: MLIT (rail trips, Greater Tokyo)', credit: cr('pxp_packed_platform_shibuya') } });
  add(W('And', 2), vid('px_shinkansen_fuji_bridge_blue_sky', { over: [note('SHINKANSEN, FUJI RIVER'), { type: 'kin', at: 0.4, y: 520, lines: [{ text: 'AND IT JUST WORKS', size: 110, color: C.cream }], bar: true, barW: 280, barColor: MINT }] }));
  add(W('So'), vid('px_tokyo_skytree_aerial_sunrise', { over: [note('TOKYO AT SUNRISE'), { type: 'kin', at: 0.5, y: 500, lines: [{ text: 'SO, HOW?', size: 160, color: Y }, { text: "LET'S HOP ON", size: 70, color: C.cream }] }] }));
  return out;
}
module.exports = { assets, build, defaultTrans: 'fade', smooth: true };
