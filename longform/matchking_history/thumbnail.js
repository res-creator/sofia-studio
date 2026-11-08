// YouTube thumbnail (1280x720): Kreuger lit by his own match on a dark ground, matchboxes falling, the headline and the key sourced figure.
// node thumbnail.js [out.png]
const P = require('./lib/par.js'), K = require('./lib/kreuger.js'), A = require('./lib/sets.js'); const fs = require('fs'), path = require('path');
const { W, H, createCanvas } = P; const out = process.argv[2] || path.join(__dirname, 'thumbnail.png');
const c = createCanvas(W, H), x = c.getContext('2d');
P.sky(x, [[0, '#120d0a'], [1, '#2a1a10']]); P.glow(x, 1380, 430, 900, '255,150,60', 0.35);
for (let i = 0; i < 14; i++) A.matchbox(x, 900 + P.hash(i) * 1000, 80 + P.hash(i * 3) * 900, 1.1 + P.hash(i * 5), (P.hash(i * 7) - 0.5) * 1.5);
x.save(); x.filter = 'blur(3px)'; x.globalAlpha = 0.5; x.fillStyle = '#000'; x.fillRect(0, 0, W, H); x.restore();
const match = (ctx, g) => { ctx.save(); ctx.rotate(-0.25); ctx.fillStyle = '#e8c88f'; ctx.fillRect(-3, -70, 6, 80); ctx.fillStyle = '#9b1d1d'; ctx.beginPath(); ctx.ellipse(0, -72, 6, 8, 0, 0, 7); ctx.fill(); P.flame(ctx, 0, -76, 0.7, 0.4); ctx.restore(); };
K.kreuger(x, 1420, 470, 1.55, { age: 'king', pose: 'match', expr: 'cold', look: [0, 0.6], prop: match, rim: '255,170,90' }, 1.2);
P.glow(x, 1420, 680, 380, '255,170,80', 0.35);
x.save(); x.shadowColor = 'rgba(0,0,0,0.8)'; x.shadowBlur = 30; x.font = `900 170px ${P.F}`; x.fillStyle = '#f6ecd8'; x.fillText('THE', 80, 260); x.fillText('MATCH', 80, 430); x.fillStyle = '#f2c230'; x.fillText('KING', 80, 600); x.restore();
x.save(); x.translate(90, 680); x.rotate(-0.03); x.font = `900 64px ${P.F}`; const t = '$250M THAT NEVER EXISTED', w = x.measureText(t).width; x.fillStyle = '#b8231b'; x.fillRect(0, 0, w + 50, 104); x.fillStyle = '#fff'; x.textBaseline = 'middle'; x.fillText(t, 25, 55); x.restore();
x.font = `800 44px ${P.F}`; x.fillStyle = 'rgba(246,236,216,0.85)'; x.fillText('IVAR KREUGER · 1880–1932', 96, 880);
P.vignette(x, 0.45); P.grain(x, 1, 0.04);
const o = createCanvas(1280, 720); o.getContext('2d').drawImage(c, 0, 0, 1280, 720); fs.writeFileSync(out, o.toBuffer('image/png')); console.log(out);
