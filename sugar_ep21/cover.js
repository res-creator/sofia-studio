// Cover for episode 21: "SUGAR PAID / SCIENTISTS" — one hero picture: the sugar man hands the envelope of sugar cubes to the scientist
// on the campus lawn, in the channel style (howitsrun_style/). COVERS.md: headline in the 3:4 crop (y 240..1680), clear of the caption area and the buttons.
const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const R = require('../hirkit/rig');
const ST = require('../howitsrun_style/style');
const P = require('../howitsrun_style/people');
const S = require('./sugarkit');
const { EXEC, ACC, scientist } = S.CS;
const cv = createCanvas(ST.W, ST.H), ctx = cv.getContext('2d');
ST.layer(ctx, { x: 0, y: -520, z: 1.25 }, 1, w => {
  S.campus(w, 2); S.cubeRain(w, 0.4, -40, -330, 9, { p: 1.1, a: 30, dir: 0.6, pile: 8 });
  P.person(w, -300, 0, 1.1, 1, EXEC, { face: R.expr('smug', { look: [1, -0.1] }), armN: { hand: [160, -310], grip: 'hold', item: g => { g.save(); g.translate(30, -30); g.rotate(0.55); S.envelope(g, 0.5); g.restore(); } } }, ACC.EXEC);
  scientist(w, 260, 0, 1.1, -1, { face: R.expr('grin', { look: [1, 0.1] }), armN: { hand: [140, -300], grip: 'open' } });
});
ST.headline2(ctx, 'SUGAR PAID', 'SCIENTISTS', 1, 470);
ST.label(ctx, 'TRUE STORY · USA 1965–67', ST.W / 2, 300, 1, { size: 36, col: '#171717', fg: '#FFC857', rot: 0 });
ST.label(ctx, '$6,500 · NOT DISCLOSED', ST.W / 2, 1420, 1, { size: 52, col: '#FFC857', rot: -0.03 });
ST.grade(ctx, 'day', 0.2); ST.paper(ctx);
fs.writeFileSync(`${__dirname}/sugar_paid_scientists_cover.png`, cv.toBuffer('image/png')); console.log('cover ok');
