// QC sheet for the extended rig: every expression front + 3/4, a bust, and one figure at two zooms (outline width check).
const { createCanvas } = require('@napi-rs/canvas'); const fs = require('fs');
const R = require('../../hirkit/rig'); const { C } = require('../mcd_collage/kit');
const CUST = { skin: '#8D5A3B', hair: '#1E1612', hairStyle: 'curly', top: C.red, cuff: '#B82533', shirt: '#FFFDF8', zip: 1, pants: '#2E3A59', shoes: '#FFFDF8', sole: '#C9C1B1' };
const BAR = { skin: '#F1C6A4', hair: '#B5482A', hairStyle: 'bun', top: '#2B2B2B', apron: C.yellow, pants: '#3A3A3A', shoes: '#5A3A22', iris: '#3D6E8C' };
const names = Object.keys(R.EXPR), cv = createCanvas(2400, 1500), ctx = cv.getContext('2d'); ctx.fillStyle = '#F3E6CF'; ctx.fillRect(0, 0, 2400, 1500);
names.forEach((n, i) => { const x = 110 + i * 200; R.headFront(ctx, x, 140, 70, i % 2 ? BAR : CUST, R.expr(n)); R.head(ctx, x, 380, 70, i % 2 ? CUST : BAR, R.expr(n));
  ctx.fillStyle = '#171717'; ctx.font = '26px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(n, x, 500); });
R.bust(ctx, 300, 1100, 1.1, CUST, { face: R.expr('skeptical', { look: [0.5, -0.7] }), hands: [{ side: -1, hand: [-10, -40], grip: 'fist' }] });
R.bust(ctx, 800, 1100, 1.1, BAR, { face: R.expr('grin') , hands: [{ side: 1, hand: [60, 120], grip: 'hold', item: c => { c.save(); c.translate(0, 50); R.cup(c, 0.9); c.restore(); } }] });
ctx.save(); ctx.translate(1300, 1450); ctx.scale(0.4, 0.4); R.figure(ctx, 0, 0, 1, 1, CUST, { face: R.expr('smile') }); ctx.restore();
ctx.save(); ctx.translate(1700, 1700); ctx.scale(2.0, 2.0); R.figure(ctx, 0, 0, 1, 1, CUST, { face: R.expr('surprised') }); ctx.restore();
fs.writeFileSync(process.argv[2], cv.toBuffer('image/png'));
