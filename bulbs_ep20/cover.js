// Cover for episode 20: "SECRET DEAL: / WORSE BULBS" — one hero picture: two 1920s executives shake hands over a mountain of burnt-out bulbs,
// one bright bulb hanging above, in the channel style (howitsrun_style/). COVERS.md: headline in the 3:4 crop (y 240..1680), clear of the buttons.
const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const R = require('../hirkit/rig');
const ST = require('../howitsrun_style/style');
const P = require('../howitsrun_style/people');
const S = require('./bulbkit');
const CS = S.CS;
const cv = createCanvas(ST.W, ST.H), ctx = cv.getContext('2d');
ST.layer(ctx, { x: 0, y: -470, z: 1.18 }, 1, w => {
  S.meetRoom(w, 0, { window: 900 });
  P.person(w, -195, 0, 1.0, 1, CS.EXEC_A, { face: R.expr('grin', { look: [1, 0] }), armN: { hand: [192, -372], grip: 'fist' } }, CS.ACC_A);
  P.person(w, 195, 0, 1.0, -1, CS.EXEC_B, { face: R.expr('smug', { look: [1, 0] }), armN: { hand: [192, -372], grip: 'fist' } }, CS.ACC_B);
  w.save(); w.translate(0, 60); S.bulbPile(w, 760); w.restore();
});
ST.headline2(ctx, 'SECRET DEAL:', 'WORSE BULBS', 1, 470);
ST.label(ctx, 'TRUE STORY · GENEVA 1924', ST.W / 2, 300, 1, { size: 36, col: '#171717', fg: '#FFC857', rot: 0 });
ST.grade(ctx, 'office', 0.22); ST.paper(ctx);
fs.writeFileSync(`${__dirname}/the_lightbulb_cartel_cover.png`, cv.toBuffer('image/png')); console.log('cover ok');
