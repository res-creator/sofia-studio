// Cover for episode 24: "FLOOR CLEANER → / MOUTHWASH" — one hero: the amber bottle (no logo) with a mop leaning on it and gargle bubbles,
// in the channel style (howitsrun_style/). COVERS.md: headline in the 3:4 crop (y 240..1680), clear of the caption area and the buttons.
const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const ST = require('../howitsrun_style/style');
const S = require('./listkit');
const CS = require('./cast');
const cv = createCanvas(ST.W, ST.H), ctx = cv.getContext('2d');
ST.layer(ctx, { x: 0, y: -520, z: 1.25 }, 1, w => {
  S.washroom(w, 0); S.puddle(w, -150, 260, 0.3);
  w.save(); w.translate(-330, 0); S.bucket(w, 1); w.restore();
  S.mop(w, 60, -560, -150);
  w.save(); w.translate(110, 0); CS.bottle(w, 2.0, { name: 'LISTERINE' }); w.restore();
  S.bubbles(w, 130, -640, 0.4, 7);
});
ST.headline2(ctx, 'FLOOR CLEANER →', 'MOUTHWASH', 1, 470);
ST.label(ctx, 'TRUE STORY · USA 1920s', ST.W / 2, 300, 1, { size: 36, col: '#171717', fg: '#FFC857', rot: 0 });
ST.grade(ctx, 'office', 0.2); ST.paper(ctx);
fs.writeFileSync(`${__dirname}/floor_cleaner_to_mouthwash_cover.png`, cv.toBuffer('image/png')); console.log('cover ok');
