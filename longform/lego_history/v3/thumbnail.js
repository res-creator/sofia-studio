// YouTube thumbnail (1280x720) for the v3 film, made with the v3 engine (no Figma, no logos, plain type):
// a big red 2x4 brick cracked in two over a dark studio, a few loose odd pieces falling, the headline and the loss figure.
// node v3/thumbnail.js [out.png]
const D = require('./doc.js'); const { E, W, H, clamp, lerp, hash, Scene, BH, brick, oddPiece, camera, render, C, PAL, DARK } = D;
const fs = require('fs'), path = require('path');
const out = process.argv[2] || path.join(__dirname, 'thumbnail.png');
const cv = E.createCanvas(W, H), ctx = cv.getContext('2d');
// background: dark studio with a warm hot spot behind the brick
{ const g = ctx.createRadialGradient(W * 0.68, H * 0.55, 50, W * 0.68, H * 0.55, W * 0.75); g.addColorStop(0, '#3a2a22'); g.addColorStop(0.5, '#17131a'); g.addColorStop(1, '#09090c'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
// the brick, cracked: two halves of a 2x4 drifting apart, tilted, with a few loose pieces
const cam = camera([26, 46, 100], [0, 6, 0], 34), sc = new Scene();
brick(sc, { x: -26, y: 3, z: -8, yaw: 0.22, roll: 0.14 }, 2, 2, C.red, { seg: 18 });
brick(sc, { x: 6, y: -1, z: -8, yaw: -0.14, roll: -0.22 }, 2, 2, C.red, { seg: 18 });
for (let i = 0; i < 6; i++) { const a = 0.6 + i * 1.05, r = 32 + hash(i * 1.3) * 12; oddPiece(sc, { x: Math.cos(a) * r, y: 6 + hash(i * 5.1) * 26, z: Math.sin(a) * r * 0.4 - 16, yaw: hash(i) * 6, pitch: hash(i * 2) * 2, s: 0.32 }, i % 8, PAL[(i * 5 + 3) % PAL.length]); }
E.glow(ctx, 1500, 580, 420, 'rgba(255,120,60,1)', 0.28);
ctx.save(); ctx.translate(560, 60); render(ctx, sc, cam, Object.assign({}, DARK, { amb: 0.55, fogFar: 2400 })); ctx.restore();
// headline (left), big and readable at phone size
ctx.save(); ctx.textBaseline = 'alphabetic'; ctx.shadowColor = 'rgba(0,0,0,0.75)'; ctx.shadowBlur = 30;
ctx.font = `900 190px ${E.F}`; ctx.fillStyle = '#F4EFE6'; ctx.fillText('LEGO', 80, 300); ctx.fillText('ALMOST', 80, 480);
ctx.fillStyle = '#E3B341'; ctx.fillText('DIED', 80, 660); ctx.restore();
ctx.save(); ctx.translate(90, 730); ctx.rotate(-0.035); ctx.font = `900 92px ${E.F}`; const tw = ctx.measureText('−$300 MILLION').width; ctx.fillStyle = '#C91A14'; ctx.fillRect(0, 0, tw + 60, 140);
ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle'; ctx.fillText('−$300 MILLION', 30, 74); ctx.restore();
ctx.font = `800 48px ${E.F}`; ctx.fillStyle = 'rgba(244,239,230,0.85)'; ctx.fillText('LOST IN ONE YEAR · 2004', 100, 960);
E.vignette(ctx, 0.4); E.grain(ctx, 1, 0.04);
const t = E.createCanvas(1280, 720); t.getContext('2d').drawImage(cv, 0, 0, 1280, 720);
fs.writeFileSync(out, t.toBuffer('image/png')); console.log('thumbnail', out);
