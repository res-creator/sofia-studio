// Cover for episode 25: "THE RIGGED / DOCTORS' SURVEY" — one hero: the 1946 billboard (a doctor holding up a sealed, logo-free pack),
// a passer-by looking up, worried. Channel style (howitsrun_style/). No smoking, no smoke, no logos. COVERS.md: everything inside y 240..1680.
const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const R = require('../hirkit/rig');
const ST = require('../howitsrun_style/style');
const P = require('../howitsrun_style/people');
const S = require('./camelkit');
const cv = createCanvas(ST.W, ST.H), ctx = cv.getContext('2d');
ST.layer(ctx, { x: 40, y: -760, z: 0.95 }, 1, w => {
  S.street(w, 2); S.billboard(w, 2, 0.95, { face: R.expr('grin', { look: [0, 0] }) });
  const L = { ...P.LOOKS.casual, top: '#8A6A4A', cuff: '#76583C', pants: '#4A4F57' }, Pz = { face: R.expr('shocked', { look: [0.8, -0.9] }), headTilt: -0.12 };
  const r = P.person(w, -340, 160, 1.1, 1, L, Pz); w.save(); w.translate(-340, 160); w.scale(1.1, 1.1); S.CS.fedora(w, r, Pz, '#5A4A3A'); w.restore();
});
ST.headline2(ctx, 'THE RIGGED', "DOCTORS' SURVEY", 1, 420);
ST.label(ctx, 'TRUE STORY · USA 1946', ST.W / 2, 290, 1, { size: 36, col: '#171717', fg: '#FFC857', rot: 0 });
ctx.save(); ctx.translate(690, 1360); ST.stampWord(ctx, 'AD CLAIM', 62, 1, '#E63946', -0.1); ctx.restore();
ST.grade(ctx, 'day', 0.2); ST.paper(ctx);
fs.writeFileSync(`${__dirname}/more_doctors_smoke_cover.png`, cv.toBuffer('image/png')); console.log('cover ok');
