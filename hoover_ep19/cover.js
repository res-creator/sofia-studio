// Cover for episode 19: "BUY A VACUUM / GET 2 FREE FLIGHTS" — one hero: the customer with the vacuum box walking up the air stairs,
// in the channel style (howitsrun_style/). COVERS.md: headline in the 3:4 crop (y 240..1680), clear of the caption area and the buttons.
const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const R = require('../hirkit/rig');
const ST = require('../howitsrun_style/style');
const P = require('../howitsrun_style/people');
const S = require('./hoovkit');
const cv = createCanvas(ST.W, ST.H), ctx = cv.getContext('2d');
ST.layer(ctx, { x: 120, y: -330, z: 1.35 }, 1, w => {
  S.apron(w, 2); S.airliner(w, 0.62, {});
  const [x, y] = S.stairPt(0, 0.62, 0.45);
  P.person(w, x - 40, y + 10, 0.62, 1, S.CS.CUSTOMER, { ...R.walk(1.2), face: R.expr('grin', { look: [1, -0.2] }), armN: { hand: [120, -200], grip: 'hold', item: g => S.CS.vacBox(g, 0.62) }, armF: { hand: [100, -195], grip: 'hold' } });
  P.person(w, -420, 0, 0.62, 1, S.CROWD[1], { ...R.walk(2.4), face: R.expr('smile', { look: [1, 0] }), armN: { hand: [120, -200], grip: 'hold', item: g => S.CS.vacBox(g, 0.62) }, armF: { hand: [100, -195], grip: 'hold' } });
});
ST.headline2(ctx, 'BUY A VACUUM', 'GET 2 FREE FLIGHTS', 1, 470);
ST.label(ctx, 'TRUE STORY · UK 1992', ST.W / 2, 300, 1, { size: 36, col: '#171717', fg: '#FFC857', rot: 0 });
ST.grade(ctx, 'day', 0.2); ST.paper(ctx);
fs.writeFileSync(`${__dirname}/hoover_free_flights_cover.png`, cv.toBuffer('image/png')); console.log('cover ok');
