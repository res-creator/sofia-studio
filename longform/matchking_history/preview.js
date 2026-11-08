// Previews for the owner: node preview.js sheet out.png (character sheet) | set <name> t out.png
const P = require('./lib/par.js'); const K = require('./lib/kreuger.js'); const fs = require('fs');
const { createCanvas, W, H } = P;
function match(ctx, g) { ctx.save(); ctx.rotate(-0.25); ctx.fillStyle = '#e8c88f'; ctx.fillRect(-3, -70, 6, 80); ctx.fillStyle = '#9b1d1d'; ctx.beginPath(); ctx.ellipse(0, -72, 6, 8, 0, 0, 7); ctx.fill(); P.flame(ctx, 0, -76, 0.55, g); ctx.restore(); }
function pen(ctx) { ctx.save(); ctx.rotate(0.5); ctx.fillStyle = '#16120f'; ctx.fillRect(-3, 10, 6, 60); ctx.fillStyle = '#d8b45a'; ctx.fillRect(-3, 10, 6, 8); ctx.restore(); }
function sheet(out) { const c = createCanvas(W, H), x = c.getContext('2d');
  P.sky(x, [[0, '#2a2230'], [1, '#5a4636']]); P.glow(x, W / 2, 300, 900, '255,190,120', 0.18);
  const items = [
    ['YOUNG ENGINEER · 1900s', { age: 'young', pose: 'hold', expr: 'smile', look: [0.5, 0], prop: (c) => { c.save(); c.rotate(1.2); c.fillStyle = '#e9e4d4'; c.fillRect(-12, -60, 24, 150); c.strokeStyle = '#7a8aa0'; c.lineWidth = 2; c.strokeRect(-12, -60, 24, 150); c.restore(); } }],
    ['MATCH KING · REST', { age: 'king', pose: 'rest', expr: 'neutral' }],
    ['LIGHTS A MATCH', { age: 'king', pose: 'match', expr: 'cold', look: [0, 0.5], prop: match }],
    ['SIGNS A LOAN', { age: 'king', pose: 'sign', expr: 'serious', look: [0.4, 1], prop: pen }],
    ['OPEN HANDS · TALKING', { age: 'king', pose: 'open', expr: 'smile', m: 0.6 }],
    ['WORRIED · 1932', { age: 'king', pose: 'chin', expr: 'worried', look: [-0.6, 0.3] }] ];
  items.forEach(([lab, st], i) => { const cx = 170 + i * 316; K.kreuger(x, cx, 360, 0.82, Object.assign({ legs: 'stand', rim: '255,200,140' }, st), 1.3 + i);
    P.plate(x, lab, cx, 1010, 1, { size: 22, align: 'center', bg: 'rgba(0,0,0,0.55)' }); });
  // expression strip (heads only, bigger)
  P.vignette(x, 0.35); fs.writeFileSync(out, c.toBuffer('image/png')); }
function faces(out) { const c = createCanvas(W, H), x = c.getContext('2d'); P.sky(x, [[0, '#ece2cf'], [1, '#cdbb9b']]);
  Object.keys(K.EXPR).forEach((e, i) => { const cx = 190 + i * 308; x.save(); x.beginPath(); x.rect(cx - 150, 0, 300, 760); x.clip(); K.kreuger(x, cx, 560, 2.0, { age: 'king', expr: e, m: e === 'surprised' ? 0.7 : e === 'smile' ? 0.2 : 0 }, 0.5); x.restore();
    P.plate(x, e.toUpperCase(), cx, 820, 1, { size: 30, align: 'center' }); });
  ['young', 'king'].forEach((a, i) => { x.save(); x.translate(0, 0); K.kreuger(x, 760 + i * 420, 1240, 1.2, { age: a, expr: 'neutral' }, 0); x.restore(); });
  fs.writeFileSync(out, c.toBuffer('image/png')); }
const [mode, a1, a2, a3] = process.argv.slice(2);
if (mode === 'sheet') sheet(a1); if (mode === 'faces') faces(a1);
if (mode === 'set') { const S = require('./lib/sets.js'); const c = createCanvas(W, H), x = c.getContext('2d'); S[a1](x, +a2, {}); fs.writeFileSync(a3, c.toBuffer('image/png')); }
if (mode === 'sets') { const S = require('./lib/sets.js'); const list = a1.split(','), sh = createCanvas(960 * 2, 540 * Math.ceil(list.length / 2)), c2 = sh.getContext('2d'), c = createCanvas(W, H), x = c.getContext('2d');
  list.forEach((it, i) => { const [n, t] = it.split('@'); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.filter = 'none'; S[n](x, +t, {}); c2.drawImage(c, (i % 2) * 960, Math.floor(i / 2) * 540, 960, 540);
    c2.fillStyle = '#ff3030'; c2.font = '24px sans-serif'; c2.fillText(it, (i % 2) * 960 + 10, Math.floor(i / 2) * 540 + 30); }); fs.writeFileSync(a2, sh.toBuffer('image/png')); }
