// Reference look 1: The B1M — footage-led, calm, long smooth shots, thin white location tags, clean centred titles.
const { assets, vid, pho } = require('../style_common')(__dirname, ['cm_minami_nagareyama_exits_2022', 'cm_tsukuba_express_tx3000_otakanomori', 'pxp_packed_platform_shibuya', 'cm_e235_yamanote_shibuya_2026']);
const tag = (text, sub, at = 0.4, until) => ({ type: 'b1m', mode: 'tag', text, sub, at, until });
const ttl = (text, sub, at = 0.3, until) => ({ type: 'b1m', mode: 'title', text, sub, at, until });
function build(T) { const out = [], add = (t, sh) => out.push({ t, scene: sh.scene, p: sh.p, trans: 'fade' });
  add(0, vid('px_shibuya_crossing_aerial_night', { over: [tag('TOKYO, JAPAN', 'Greater Tokyo · about 37 million people', 0.3, 1.35)] }));
  add(1.3, pho('cm_minami_nagareyama_exits_2022', { over: [tag('MINAMI-NAGAREYAMA STATION', '14 November 2017', 0.3)] }));
  add(3.7, pho('cm_tsukuba_express_tx3000_otakanomori', { over: [ttl('20 SECONDS EARLY', 'Tsukuba Express', 0.2)] }));
  add(5.8, vid('px_jr_platform_train_departs_vertical'));
  add(8.4, vid('px_tokyo_station_marunouchi_night', { over: [tag('THE APOLOGY', 'Official, and in writing', 0.5)] }));
  add(13.6, vid('dv_yamanote_platform_clock_boarding', { over: [tag('YAMANOTE LINE', 'Delay notes on most weekdays', 2.0)] }));
  add(18.0, pho('cm_e235_yamanote_shibuya_2026'));
  add(20.2, vid('px_shibuya_crossing_pedestrians_night'));
  add(21.8, pho('pxp_packed_platform_shibuya', { over: [ttl('40 MILLION RIDES', 'EVERY DAY', 3.3)] }));
  add(27.2, vid('px_shinkansen_fuji_bridge_blue_sky', { over: [tag('≈ ALL OF CALIFORNIA', 'by train, every day', 0.6)] }));
  add(31.6, vid('px_e7_shinkansen_underground_platform'));
  add(34.2, vid('px_tokyo_skytree_aerial_sunrise', { over: [ttl('HOW TOKYO MOVES', null, 0.4)] }));
  return out; }
module.exports = { assets, build, defaultTrans: 'fade', smooth: true };
