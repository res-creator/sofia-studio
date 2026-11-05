// Thumbnail v2 (after the critique of v1): ONE hero — a giant cola bottle towering over the tiny 1886 pharmacy, a shocked Pemberton in front,
// one short line "9 → 2.2 BILLION" + "GLASSES A DAY". Drawn at 1920x1080, saved at 1280x720. Usage: node thumb_v2.js
const { createCanvas } = require('@napi-rs/canvas'); const fs = require('fs');
const L = require('../kit/look'), P = require('../kit/props'), { toon, LOOKS } = require('../kit/toon');
const { INK, CREAM, RED, YELLOW, ink, rr, poly } = L;
const cv = createCanvas(1920, 1080), ctx = cv.getContext('2d');
// sky with rays behind the bottle
L.skyGrad(ctx, 0, 0, 1920, 1080, ['#F25C3B', '#FFC86B']);
ctx.save(); ctx.translate(1290, 560); for (let i = 0; i < 18; i++) { ctx.rotate(Math.PI / 9); poly(ctx, [[0, 0], [1500, -90], [1500, 90]]); ctx.fillStyle = i % 2 ? 'rgba(255,240,200,0.22)' : 'rgba(255,255,255,0)'; ctx.fill(); } ctx.restore();
// ground + tiny 1886 street
ctx.fillStyle = '#8C6A48'; ctx.fillRect(0, 900, 1920, 180);
P.storefront(ctx, 780, 905, { w: 300, h: 300, col: '#B8714C', sign: 'PHARMACY', signCol: '#3A1E14', awning: [RED, CREAM], upper: 2 });
P.storefront(ctx, 1500, 905, { w: 280, h: 260, col: '#A65A3E', sign: 'HATS', awning: ['#2E5A3E', CREAM], upper: 2 });
P.lamppost(ctx, 1450, 910, 0.6, true);
// the giant bottle (with drop shadow) towering over the street
ctx.save(); ctx.globalAlpha = 0.25; ctx.fillStyle = '#000'; L.ell(ctx, 1300, 905, 240, 30); ctx.fill(); ctx.restore();
P.bottle(ctx, 1290, 905, 3.9, { kind: 'contour', label: 'COCA-COLA', glass: 'rgba(160,215,195,0.18)' });
P.sparkles(ctx, 1290, 300, 300, 0.4, 8, CREAM);
// shocked Pemberton, big, foreground left, holding one small glass
toon(ctx, 330, 1150, 2.6, LOOKS.pemberton, 'shock', 'shock', { t: 2, blink: false, look: [0.8, -0.6] });
P.glassCup(ctx, 600, 1010, 0.9, { fill: 0.85, fizz: 1 });
// text: one line + small strip
ctx.save(); ctx.translate(560, 150); ctx.rotate(-0.04);
rr(ctx, -500, -100, 1000, 190, 22); ink(ctx, CREAM, 8);
L.fitText(ctx, '9 → 2.2 BILLION', 0, -2, 150, INK, 940);
ctx.restore();
L.plate(ctx, 'GLASSES A DAY', 560, 330, 1, { size: 76, bg: RED, fg: CREAM, rot: 0.03 });
L.finish(ctx, 'pop', { vignette: 0.28, grain: 0.08 });
const out = createCanvas(1280, 720); out.getContext('2d').drawImage(cv, 0, 0, 1280, 720);
fs.writeFileSync(`${__dirname}/how_coca_cola_took_over_the_world_thumbnail_v2.png`, out.toBuffer('image/png')); console.log('thumb v2 ok');
