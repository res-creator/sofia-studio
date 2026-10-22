// Cover for episode 12: "WHY UPS / AVOIDS LEFT TURNS?!" — one hero object: the big brown truck at an intersection (front view),
// a red left-turn arrow crossed out, and a bright loop of three right turns around the truck (clockwise, as seen from above).
// House rules (COVERS.md): short headline, key words on a red strip, inside the 3:4 crop (y 240..1680), clear of the caption area and the right-hand buttons. No logos.
const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const K = require('../tests/mcd_collage/kit');
const R = require('../hirkit/rig');
const LT = require('../hirkit/light');
const CL = require('../hirkit/collage');
const S = require('./upskit');
const { C, F, rr } = K;
const { W, H, txt, fitTxt } = S;

const cv = createCanvas(W, H), ctx = cv.getContext('2d');
// the street, low road camera, softened
const P = S.persp({ vx: 540, vy: 1060, f: 820, camH: 1.1, camX: 0.4, zc0: 9, zc1: 16, skyTop: '#9CCBEF', skyBot: '#FBE3B8' });
P.ground(ctx, 0); ctx.save(); ctx.filter = 'blur(3px)'; P.buildings(ctx, 0, 1); ctx.restore(); P.signal(ctx, '#5BE37A');
LT.haze(ctx, 'golden', 0.16);
// the loop of three right turns (behind the truck): a bright rounded square, clockwise arrows
const loop = () => { ctx.beginPath(); rr(ctx, 120, 700, 810, 760, 130); };
ctx.save(); ctx.lineJoin = 'round'; loop(); ctx.strokeStyle = 'rgba(23,23,23,0.6)'; ctx.lineWidth = 78; ctx.stroke(); loop(); ctx.strokeStyle = '#5BE37A'; ctx.lineWidth = 60; ctx.stroke();
ctx.setLineDash([46, 34]); loop(); ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 10; ctx.stroke(); ctx.restore();
for (const [x, y, a] of [[525, 700, 0], [930, 1080, Math.PI / 2], [525, 1460, Math.PI]]) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(70, 0); ctx.lineTo(-40, -62); ctx.lineTo(-40, 62); ctx.closePath(); R.fillStroke(ctx, '#5BE37A', 6); ctx.restore(); }
[[905, 725], [905, 1435], [145, 1435]].forEach(([x, y], i) => { ctx.save(); ctx.translate(x, y); CL.cutout(ctx, () => R.ell(ctx, 0, 0, 52, 52), C.yellow, { elev: 1.4 }); txt(ctx, String(i + 1), 0, 22, 62, '#171717'); ctx.restore(); });
// the truck (hero), Mike smiling at the wheel
ctx.save(); ctx.translate(600, 1420); ctx.scale(0.9, 0.9);
LT.lit(ctx, c => S.truckFront(c, { blinkR: true, lights: true, driver: g => S.mikeBust(g, 120, -330, 0.6, { face: R.expr('smug', { look: [0, 0.1] }) }) }), { rim: { dir: [-1, -0.4], color: '#FFE2B0', w: 9, a: 0.9 } });
ctx.restore();
// the red left arrow, crossed out
ctx.save(); ctx.translate(250, 1040); ctx.rotate(-0.08); ctx.scale(0.95, 0.95);
const arrow = () => { ctx.beginPath(); ctx.moveTo(60, 170); ctx.lineTo(60, 0); ctx.quadraticCurveTo(60, -60, 0, -60); ctx.lineTo(-40, -60); };
ctx.lineCap = 'round'; arrow(); ctx.strokeStyle = '#FFFDF8'; ctx.lineWidth = 74; ctx.stroke(); arrow(); ctx.strokeStyle = C.red; ctx.lineWidth = 50; ctx.stroke();
ctx.beginPath(); ctx.moveTo(-130, -60); ctx.lineTo(-40, -140); ctx.lineTo(-40, 20); ctx.closePath(); ctx.fillStyle = C.red; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = '#FFFDF8'; ctx.stroke();
for (const [w, c] of [[40, '#FFFDF8'], [22, '#171717']]) { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(-150, 170); ctx.lineTo(160, -170); ctx.stroke(); }
ctx.restore();
// headline: WHY UPS / AVOIDS LEFT TURNS?!
ctx.save(); ctx.translate(W / 2, 400); ctx.rotate(-0.02);
CL.cutout(ctx, () => rr(ctx, -330, -112, 660, 160, 18), '#FFFDF8', { elev: 1.8 }); txt(ctx, 'WHY UPS', 0, 14, 116, '#171717');
ctx.translate(0, 176); CL.cutout(ctx, () => rr(ctx, -480, -100, 960, 150, 18), C.red, { elev: 1.8 }); fitTxt(ctx, 'AVOIDS LEFT TURNS?!', 0, 14, 104, '#FFFDF8', 900);
ctx.restore();
LT.grade(ctx, 'golden', { vignette: 0.18 });
ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.26; ctx.drawImage(K.paperTexture(W, H), 0, 0); ctx.restore();
fs.writeFileSync(`${__dirname}/ups_shortest_route_cover.png`, cv.toBuffer('image/png')); console.log('cover ok');
