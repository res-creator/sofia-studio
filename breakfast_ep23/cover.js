// Cover for episode 23: "WHO SAID / BREAKFAST MATTERS?" — one hero: the cereal box in a suit at the press podium, camera flashes,
// in the channel style (howitsrun_style/). COVERS.md: headline in the 3:4 crop (y 240..1680), clear of the caption area and the buttons.
const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const ST = require('../howitsrun_style/style');
const S = require('./bfkit');
const { cerealBox, boxArm } = S.CS;
const cv = createCanvas(ST.W, ST.H), ctx = cv.getContext('2d');
ST.layer(ctx, { x: 0, y: -560, z: 1.25 }, 1, w => {
  S.pressRoom(w, 0);
  w.save(); w.translate(0, -360); cerealBox(w, 1, { face: 'smug', look: [0, 0.3] }); boxArm(w, 1, -1, -200, -50); boxArm(w, 1, 1, 200, -50); w.restore();
  S.podium(w, 1); w.save(); w.translate(0, -410); S.mics(w, 0.6); w.restore();
});
S.flash(ctx, 180, 1150, 110, 0.5); S.flash(ctx, 900, 1000, 90, 0.5); S.flash(ctx, 140, 780, 70, 0.5);
ST.headline2(ctx, 'WHO SAID', 'BREAKFAST MATTERS?', 1, 430);
ST.label(ctx, 'TRUE STORY · USA 1917 / 1920s', ST.W / 2, 300, 1, { size: 36, col: '#171717', fg: '#FFC857', rot: 0 });
ST.grade(ctx, 'office', 0.2); ST.paper(ctx);
fs.writeFileSync(`${__dirname}/who_said_breakfast_matters_cover.png`, cv.toBuffer('image/png')); console.log('cover ok');
