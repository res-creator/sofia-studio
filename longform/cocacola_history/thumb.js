// YouTube thumbnail 1280x720 (drawn at 1920x1080): left = 1886 pharmacy counter, Pemberton with one glass ("9 A DAY");
// right = today's world covered in bottles ("2.2 BILLION A DAY"); a big arrow between them. Long-form kit look. Usage: node thumb.js
const { createCanvas } = require('@napi-rs/canvas'); const fs = require('fs');
const L = require('../kit/look'), P = require('../kit/props'), { toon, LOOKS } = require('../kit/toon');
const { INK, CREAM, RED, YELLOW, ink, rr, ell, poly } = L;
const cv = createCanvas(1920, 1080), ctx = cv.getContext('2d');
// left: warm 1886
ctx.save(); poly(ctx, [[0, 0], [1010, 0], [870, 1080], [0, 1080]]); ctx.clip();
L.wallpaper(ctx, 0, 0, 1100, 1080, '#7A3F2E', '#8E4E38'); P.shelves(ctx, 40, 60, 900, 560, { rows: 4, seed: 4 }); L.glow(ctx, 480, 300, 600, '#FFD58A', 0.35);
toon(ctx, 470, 1010, 1.75, LOOKS.pemberton, 'present', 'happy', { t: 2, blink: false, itemR: (g, ang) => { g.rotate(ang); P.glassCup(g, 0, 30, 0.62, { fill: 0.85, fizz: 1 }); } });
P.fountain(ctx, 470, 1080, 0.75, { w: 1300, taps: 2, stools: false });
L.finish(ctx, 'gaslight', { vignette: 0.25, grain: 0.1 }); ctx.restore();
// right: bright today
ctx.save(); poly(ctx, [[1010, 0], [1920, 0], [1920, 1080], [870, 1080]]); ctx.clip();
L.skyGrad(ctx, 870, 0, 1100, 1080, ['#1A2A5E', '#2D8CF0']); for (let i = 0; i < 60; i++) { ctx.beginPath(); ctx.arc(900 + L.hash(i) * 1000, L.hash(i * 2.7) * 600, 2 + L.hash(i * 4) * 2, 0, 6.27); ctx.fillStyle = CREAM; ctx.fill(); }
ctx.save(); ctx.translate(1450, 640); ctx.beginPath(); ctx.arc(0, 0, 330, 0, 6.27); ink(ctx, '#3F8FD8', 8); ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 330, 0, 6.27); ctx.clip();
for (const [lx, ly, rx, ry] of [[-0.45, -0.35, 0.32, 0.22], [-0.3, 0.3, 0.18, 0.3], [0.2, -0.3, 0.38, 0.2], [0.25, 0.2, 0.2, 0.28]]) { ell(ctx, lx * 330, ly * 330, rx * 330, ry * 330, 0.3); ink(ctx, '#7CC36A', 6); }
ctx.globalAlpha = 0.25; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(110, 70, 345, 0, 6.27); ctx.fill(); ctx.restore(); ctx.beginPath(); ctx.arc(0, 0, 330, 0, 6.27); ink(ctx, null, 8);
for (let i = 0; i < 22; i++) { const a = -Math.PI + i / 21 * Math.PI; ctx.save(); ctx.translate(Math.cos(a) * 335, Math.sin(a) * 335); ctx.rotate(a + Math.PI / 2); P.bottle(ctx, 0, 0, 0.46, { label: 'COLA', kind: 'contour' }); ctx.restore(); }
ctx.restore(); P.truck(ctx, 1240, 1060, 0.55, { era: 2020, text: 'COCA-COLA', load: false }); L.finish(ctx, 'modern', { vignette: 0.2, grain: 0.08 }); ctx.restore();
// divider + arrow
ctx.beginPath(); ctx.moveTo(1010, 0); ctx.lineTo(870, 1080); ctx.lineWidth = 14; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 6; ctx.strokeStyle = CREAM; ctx.stroke();
ctx.save(); ctx.scale(1, 1); ctx.lineWidth = 1; P.arrow(ctx, 640, 640, 1060, 520, 1, YELLOW, 2.2); ctx.restore();
// text
L.plate(ctx, '9 A DAY', 470, 140, 1, { size: 120, rot: -0.04 });
L.plate(ctx, '2.2 BILLION', 1450, 120, 1, { size: 132, bg: RED, fg: CREAM, rot: 0.03 });
L.plate(ctx, 'A DAY', 1450, 265, 1, { size: 80, rot: -0.02 });
const out = createCanvas(1280, 720); out.getContext('2d').drawImage(cv, 0, 0, 1280, 720);
fs.writeFileSync(`${__dirname}/how_coca_cola_took_over_the_world_thumbnail.png`, out.toBuffer('image/png')); console.log('thumb ok');
