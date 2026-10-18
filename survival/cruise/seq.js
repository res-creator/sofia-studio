// Cruise Ship edit list: voice lines, silent beats (actions) and marks. Times come from the real voice takes.
// ['l', id, gapAfter]  ['b', name, seconds]
const SEQ = {
  s01: [['b', 's01_buzz1', 0.7], ['l', 's01_1', 0.2], ['b', 's01_swarm', 1.2], ['l', 's01_2', 0.3], ['b', 's01_chime', 0.7], ['l', 's01_3', 0], ['b', 's01_cut', 2.0], ['l', 's01_4', 0.3], ['b', 's01_drop', 1.8]],
  s02: [['l', 's02_1', 0.2], ['b', 's02_hide', 2.0], ['l', 's02_2', 0.2], ['b', 's02_plate', 2.8], ['l', 's02_3', 0.4], ['b', 's02_shadow', 1.6]],
  s03: [['b', 's03_map', 1.2], ['l', 's03_1', 0.2], ['b', 's03_chaos', 1.8], ['l', 's03_2', 0.2], ['b', 's03_door', 1.3]],
  s04: [['l', 's04_1', 0.2], ['l', 's04_2', 0.2], ['b', 's04_bang', 3.4], ['b', 's04_timer', 2.4], ['l', 's04_3', 0.5], ['b', 's04_night', 0.8], ['l', 's04_4', 0.3], ['b', 's04_stop', 1.8]],
  s05: [['l', 's05_1', 0.2], ['l', 's05_2', 0.4], ['b', 's05_cold', 1.3], ['l', 's05_3', 0.2], ['l', 's05_4', 0.3], ['b', 's05_print', 1.6]],
  s06: [['l', 's06_1', 0.3], ['b', 's06_wait', 4.6], ['b', 's06_visitor', 6.4], ['l', 's06_2', 0.3], ['b', 's06_band', 1.8]],
  s07: [['l', 's07_1', 0.2], ['l', 's07_2', 0.2], ['b', 's07_walk', 6.4], ['b', 's07_mess', 1.8], ['l', 's07_3', 0.1], ['b', 's07_ice', 3.0], ['b', 's07_back', 1.6], ['l', 's07_4', 0.8]],
  s08: [['b', 's08_mat', 1.0], ['l', 's08_1', 0.2], ['b', 's08_breath', 3.2], ['l', 's08_2', 0.8]],
  s09: [['l', 's09_1', 0.3], ['b', 's09_torch', 2.0], ['l', 's09_2', 0.3], ['b', 's09_turn', 2.2], ['l', 's09_3', 0.3], ['b', 's09_ship', 1.6], ['l', 's09_4', 0.6]],
  s10: [['l', 's10_1', 0.2], ['l', 's10_2', 0.2], ['b', 's10_hatch', 1.4], ['b', 's10_crawl', 4.0], ['b', 's10_behind', 3.2], ['b', 's10_timer', 2.6], ['l', 's10_3', 0.3], ['b', 's10_drop', 1.6]],
  s11: [['l', 's11_1', 0.2], ['b', 's11_band', 1.2], ['l', 's11_2', 0.2], ['b', 's11_bread', 1.6], ['l', 's11_3', 0.3], ['l', 's11_4', 0.5], ['l', 's11_5', 0.3], ['l', 's11_6', 0.3], ['l', 's11_7', 1.0]],
  s12: [['l', 's12_1', 0.2], ['l', 's12_2', 0.4], ['b', 's12_days', 4.4], ['l', 's12_3', 0.5], ['l', 's12_4', 1.2]],
  s13: [['b', 's13_quiet', 1.8], ['b', 's13_switch', 1.6], ['l', 's13_1', 0.3], ['l', 's13_2', 0.4], ['b', 's13_cctv', 5.6], ['b', 's13_click', 1.4], ['l', 's13_3', 0.6], ['l', 's13_4', 1.4], ['l', 's13_5', 1.0], ['b', 's13_engines', 1.4], ['l', 's13_6', 0.3], ['l', 's13_7', 0.6], ['b', 's13_end', 4.0]],
};
const ORDER = Object.keys(SEQ);
const TL = require('./lib/core').build(SEQ, ORDER);
module.exports = { SEQ, ORDER, TL };
if (require.main === module) { for (const b of ORDER) console.log(b, TL.blocks[b].t0.toFixed(1), (TL.blocks[b].t1 - TL.blocks[b].t0).toFixed(1)); console.log('TOTAL', TL.T.toFixed(1), (TL.T / 60).toFixed(2) + ' min'); }
