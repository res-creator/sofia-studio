// Cover for episode 22: "YOUR RING = AN AD" — one hero: the boyfriend on one knee with the glowing ring box, the ad man with the megaphone behind,
// in the channel style (howitsrun_style/). COVERS.md: headline in the 3:4 crop (y 240..1680), clear of the caption area and the buttons. No logos.
const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const R = require('../hirkit/rig');
const K = require('../tests/mcd_collage/kit');
const ST = require('../howitsrun_style/style');
const P = require('../howitsrun_style/people');
const S = require('./diakit');
const { GUY, GIRL, ADMAN, lady, megaphone } = S.CS;
const cv = createCanvas(ST.W, ST.H), ctx = cv.getContext('2d');
ST.layer(ctx, { x: -20, y: -560, z: 1.0 }, 1, w => {
  S.hall(w, 1);
  P.person(w, -430, 0, 0.95, 1, ADMAN, { face: R.expr('grin', { look: [1, 0] }), lean: 0.06, armN: { hand: [140, -420], grip: 'hold', item: g => megaphone(g, 0.9) }, armF: { hand: [60, -300], grip: 'fist' } }, { tie: K.C.yellow });
  S.shout(w, -430 + 330 * 0.95, -470 * 0.95, 0.95, 0.2);
  P.person(w, -30, 0, 0.95, 1, GUY, { hip: [-10, -170], legN: { foot: [120, 0] }, legF: { foot: [-170, 0] }, face: R.expr('grin', { look: [1, -0.5] }), armN: { hand: [150, -300], grip: 'hold', item: g => S.ringBox(g, 0.7, 1, 1, 0.3) }, armF: { hand: [110, -290], grip: 'hold' } });
  lady(w, 360, 0, 0.95, -1, GIRL, { face: R.expr('surprised', { look: [1, 0.35] }), armN: { hand: [80, -430], grip: 'open' } });
});
ST.headline2(ctx, 'YOUR RING =', 'AN AD', 1, 470);
ST.label(ctx, 'TRUE STORY · USA SINCE 1938', ST.W / 2, 300, 1, { size: 36, col: '#171717', fg: '#FFC857', rot: 0 });
ST.grade(ctx, 'golden', 0.18); ST.paper(ctx);
fs.writeFileSync(`${__dirname}/your_ring_is_an_ad_cover.png`, cv.toBuffer('image/png')); console.log('cover ok');
