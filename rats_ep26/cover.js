// Cover for episode 26: "PAID PER / RAT TAIL" — one hero moment: the townsman hands a rat tail to the colonial official for a coin,
// a worried cartoon rat (with its tail) watches. Channel style (howitsrun_style/). COVERS.md: everything inside y 240..1680, x < 940 for the key art.
const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const R = require('../hirkit/rig');
const ST = require('../howitsrun_style/style');
const S = require('./ratkit'); const CS = S.CS;
const cv = createCanvas(ST.W, ST.H), ctx = cv.getContext('2d');
const F = (n, l) => R.expr(n, { look: l });
ST.layer(ctx, { x: -20, y: -440, z: 1.05 }, 1, w => {
  S.street(w, 1, { n: 12, trees: false }); S.tree(w, -1250, 1.05); S.tree(w, 1150, 1.0);
  CS.cast(w, 300, 0, 1.15, -1, 'official', { face: F('surprised', [1, -0.1]), lean: 0.05, armN: { hand: [150, -330], grip: 'pinch', item: g => { g.save(); g.translate(18, -20); S.coin(g, 40); g.restore(); } } });
  S.bountyTable(w, 40);
  w.save(); w.translate(90, 70); w.scale(-1, 1); S.rat(w, { s: 1.15, mood: 'shock', look: [0.6, -0.4], up: 0.25 }); w.restore();
  CS.cast(w, -300, 0, 1.15, 1, 'hunter', { face: F('grin', [1, -0.2]), armN: { hand: [150, -400], grip: 'pinch', item: g => { g.save(); g.translate(14, -6); S.tail(g, 190, 0.6, 14); g.restore(); } }, lean: 0.04 });
});
ST.headline2(ctx, 'PAID PER', 'RAT TAIL', 1, 470);
ST.label(ctx, 'TRUE STORY · HANOI 1902', ST.W / 2, 330, 1, { size: 36, col: '#171717', fg: '#FFC857', rot: 0 });
ST.grade(ctx, 'golden', 0.2); ST.paper(ctx);
fs.writeFileSync(`${__dirname}/paid_per_rat_tail_cover.png`, cv.toBuffer('image/png')); console.log('cover ok');
