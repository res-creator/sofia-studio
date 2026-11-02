// YouTube thumbnail (1280x720) for the long-form "When Paying People Backfired": the rat with scissors over it + "PAID FOR THE WRONG THING".
// Channel style (howitsrun_style, 16:9 mode); drawn at 1920x1080, saved at 1280x720. Props from rats_ep26/ratkit.js (read-only).
process.env.HIR_WIDE = '1';
const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const R = require('../hirkit/rig');
const K = require('../tests/mcd_collage/kit');
const CL = require('../hirkit/collage');
const ST = require('../howitsrun_style/style');
const S = require('../rats_ep26/ratkit'); const CS = S.CS;
const cv = createCanvas(ST.W, ST.H), ctx = cv.getContext('2d');
const F = (n, l) => R.expr(n, { look: l });
ST.layer(ctx, { x: 420, y: -400, z: 1.05 }, 1, w => {
  S.street(w, 1, { n: 12, trees: false }); S.tree(w, -1250, 1.05);
  S.bountyTable(w, 40);
  w.save(); w.translate(330, 70); S.rat(w, { s: 1.45, mood: 'shock', look: [-0.7, -0.3], up: 0.1 }); w.restore();
  CS.cast(w, -260, 0, 1.15, 1, 'hunter', { face: F('grin', [1, -0.2]), lean: 0.06,
    armN: { hand: [330, -170], grip: 'pinch', item: g => { g.save(); g.translate(10, -6); g.rotate(1.1); S.scissors(g, 1.0, 0.8); g.restore(); } } });
  w.save(); w.translate(330, -300); S.coin(w, 50, '1¢'); w.restore();
});
// right side: the title, three paper strips
const strip = (s, y, col, fg, size, rot) => { ctx.save(); ctx.translate(1440, y); ctx.rotate(rot); ctx.font = `${size}px ${ST.FONT.black}`;
  const w = ctx.measureText(s).width + 70; CL.cutout(ctx, () => K.rr(ctx, -w / 2, -size * 0.82, w, size * 1.3, 18), col, { elev: 1.6 });
  ST.fitTxt(ctx, s, 0, size * 0.3, size, fg, w - 40); ctx.restore(); };
strip('PAID FOR', 300, ST.PAL.cream, '#171717', 120, -0.03);
strip('THE WRONG', 490, '#E63946', ST.PAL.cream, 132, 0.02);
strip('THING', 680, ST.PAL.cream, '#171717', 150, -0.025);
ST.label(ctx, 'TRUE STORIES · 1902 – 2016', 1440, 860, 1, { size: 44, col: '#171717', fg: '#FFC857', rot: 0.01 });
ST.grade(ctx, 'golden', 0.22); ST.paper(ctx);
const out = createCanvas(1280, 720); out.getContext('2d').drawImage(cv, 0, 0, 1280, 720);
fs.writeFileSync(`${__dirname}/when_paying_people_backfired_thumbnail.png`, out.toBuffer('image/png')); console.log('thumb ok');
