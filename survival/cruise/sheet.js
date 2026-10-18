// Character sheet for the Cruise Ship cast (approval / QA): node sheet.js out.png
const { createCanvas } = require('../node_modules/@napi-rs/canvas'); require('../lib');
const K = require('./lib/cast'), V = require('./lib/views'), PR = require('./lib/props'), { R } = K, { paint, line, shade } = R;
const W = 3200, H = 1560, c = createCanvas(W, H), x = c.getContext('2d'), G1 = 900, G2 = 1880;
x.fillStyle = '#20262e'; x.fillRect(0, 0, W, H);
const lightBg = (x0, w) => { const g = x.createLinearGradient(0, 0, 0, G1); g.addColorStop(0, '#3a4654'); g.addColorStop(1, '#55606c'); x.fillStyle = g; x.fillRect(x0, 0, w, G1 + 60); };
lightBg(0, W); x.fillStyle = '#2a3038'; x.fillRect(0, G1, W, 60);
const label = (t, X, Y) => { x.save(); x.fillStyle = '#ffd23f'; x.font = '40px Anton'; x.textAlign = 'center'; x.fillText(t, X, Y); x.restore(); };
// front-view overlays for the cruise costumes (views.js knows only the base skins)
function frontOverlay(ch, X) { const S = ch.S, hipY = G1 - S.ankle - S.thigh - S.shin, neckY = hipY - S.torso, headY = neckY - S.neck - S.headR * 0.92, Rr = S.headR;
  if (ch.C.waiter) { paint(x, S, q => { q.moveTo(X - 26, neckY - 4); q.lineTo(X, neckY + 30); q.lineTo(X + 26, neckY - 4); q.closePath(); }, '#f6f3ea');
    paint(x, S, q => { q.moveTo(X, neckY + 14); q.lineTo(X - 26, neckY + 2); q.lineTo(X - 26, neckY + 26); q.closePath(); q.moveTo(X, neckY + 14); q.lineTo(X + 26, neckY + 2); q.lineTo(X + 26, neckY + 26); q.closePath(); }, '#16161a');
    for (const y of [70, 110]) paint(x, S, q => q.arc(X, neckY + y, 5, 0, 7), '#3a2a12'); }
  if (ch.C.wrap) { paint(x, S, q => { q.moveTo(X - Rr * 0.98, headY - Rr * 0.3); q.quadraticCurveTo(X - Rr * 1.05, headY - Rr * 1.25, X, headY - Rr * 1.22); q.quadraticCurveTo(X + Rr * 1.05, headY - Rr * 1.25, X + Rr * 0.98, headY - Rr * 0.3); q.quadraticCurveTo(X, headY - Rr * 0.6, X - Rr * 0.98, headY - Rr * 0.3); q.closePath(); }, ch.C.wrap, { k: 0.7 });
    line(x, [[X - Rr * 0.98, headY - Rr * 0.5], [X + Rr * 0.98, headY - Rr * 0.5]], 9, '#1d1d20'); paint(x, S, q => q.roundRect(X - Rr * 0.17, headY - Rr * 0.66, Rr * 0.34, Rr * 0.24, 5), '#3a3d44');
    x.fillStyle = 'rgba(40,20,14,0.5)'; for (const k of [-1, 1]) { x.beginPath(); x.arc(X + k * Rr * 0.4, headY + Rr * 0.12, Rr * 0.16, 0.4, Math.PI - 0.4); x.lineWidth = 2.5; x.strokeStyle = 'rgba(40,20,14,0.55)'; x.stroke(); }
    x.fillStyle = '#3a2e24'; x.fillRect(X - 70, hipY - 8, 140, 18); }
}
function profileOverlay(ch, X) { const S = ch.S, hipY = G1 - S.ankle - S.thigh - S.shin, neckY = hipY - S.torso, headY = neckY - S.neck - S.headR * 0.92, Rr = S.headR, hx = X - 6;
  if (ch.C.waiter) { paint(x, S, q => { q.moveTo(hx - 30, neckY - 2); q.lineTo(hx - 6, neckY + 18); q.lineTo(hx + 4, neckY - 6); q.closePath(); }, '#f6f3ea'); paint(x, S, q => { q.moveTo(hx - 26, neckY + 6); q.lineTo(hx - 42, neckY - 4); q.lineTo(hx - 42, neckY + 16); q.closePath(); }, '#16161a'); }
  if (ch.C.wrap) { paint(x, S, q => { q.moveTo(hx - Rr * 0.75, headY - Rr * 0.45); q.quadraticCurveTo(hx - Rr * 0.4, headY - Rr * 1.25, hx + Rr * 0.4, headY - Rr * 1.15); q.quadraticCurveTo(hx + Rr * 1.05, headY - Rr * 0.9, hx + Rr * 0.95, headY - Rr * 0.2); q.quadraticCurveTo(hx, headY - Rr * 0.55, hx - Rr * 0.75, headY - Rr * 0.45); q.closePath(); }, ch.C.wrap, { k: 0.7 });
    paint(x, S, q => q.ellipse(hx + Rr * 1.02, headY - Rr * 0.5, Rr * 0.2, Rr * 0.15, 0.5, 0, 7), shade(ch.C.wrap, 0.85)); line(x, [[hx - Rr * 0.72, headY - Rr * 0.52], [hx + Rr * 0.95, headY - Rr * 0.42]], 9, '#1d1d20');
    paint(x, S, q => q.roundRect(hx - Rr * 0.86, headY - Rr * 0.66, Rr * 0.26, Rr * 0.24, 5), '#3a3d44'); x.fillStyle = '#3a2e24'; x.fillRect(X - 50, hipY - 8, 100, 18); }
}
const row = [['WAITER', K.WAITER], ['ROSA OKAFOR', K.ROSA]];
row.forEach(([name, ch], r) => { const X0 = r * 1600 + 160;
  label(name, X0 + 640, 70);
  V.front(x, ch.S, ch.C, X0, G1, { eyes: 'open', mouth: 'flat', brow: 'neutral' }); frontOverlay(ch, X0); label('front', X0, G1 + 50);
  K.person(x, ch, { pose: { x: X0 + 330, ground: G1 }, e: { eyes: 'open', brow: 'neutral', mouth: 'flat' }, t: 0.4 }, 'sheet'); label('3/4', X0 + 330, G1 + 50);
  V.profile(x, ch.S, ch.C, X0 + 640, G1, { eyes: 'open', mouth: 'flat' }); profileOverlay(ch, X0 + 640); label('profile', X0 + 640, G1 + 50);
  // action pose
  const AX = X0 + 1030;
  if (r === 0) { const J0 = R.solve(ch.S, { x: AX, ground: G1, lean: 0.05 }), t = PR.tray([J0.shN[0] - 150, J0.shN[1] + 40], 0);
    K.person(x, ch, { pose: { x: AX, ground: G1, lean: 0.05 }, grips: { near: t.grip }, e: { eyes: 'open', brow: 'neutral', mouth: 'smile', look: [-0.8, 0] }, t: 0.4, holdNear: q => PR.drawTray(q, t) }, 'tray');
    const p = PR.pan([AX + 260, G1 - 330], -1.9); K.person(x, ch, { pose: { x: AX + 320, ground: G1, crouch: 0.3, lean: 0.25 }, grips: { near: p.high, far: [p.G[0] + 6, p.G[1] + 4] }, farFront: true, e: { eyes: 'wide', brow: 'worried', mouth: 'frown', look: [-0.9, 0], sweat: 1 }, t: 0.4, hold: q => PR.drawPan(q, p) }, 'pan');
    label('serving / defending', AX + 160, G1 + 50); }
  else { const J0 = R.solve(ch.S, { x: AX, ground: G1, lean: -0.02 }), f = PR.flareGun([J0.shN[0] - 170, J0.shN[1] + 30], 0.05);
    K.person(x, ch, { pose: { x: AX, ground: G1, lean: -0.02 }, grips: { near: f.G, far: [f.G[0] + 18, f.G[1] + 12] }, farFront: true, e: { eyes: 'squint', brow: 'angry', mouth: 'flat', look: [-0.9, 0] }, t: 0.4, lampOn: true, holdNear: q => PR.drawFlareGun(q, f) }, 'flare');
    const fl = PR.flashlight([AX + 200, G1 - 360], -0.3); K.person(x, ch, { pose: { x: AX + 330, ground: G1, crouch: 0.15, lean: 0.12 }, grips: { near: fl.G }, e: { eyes: 'half', brow: 'flat', mouth: 'flat', look: [-0.9, 0.1] }, t: 0.4, holdNear: q => PR.drawFlashlight(q, fl, true, 300) }, 'torch');
    label('standoff / searching', AX + 160, G1 + 50); }
});
// expressions (head + shoulders crops) — serious range
const EX = { WAITER: [['neutral', { eyes: 'open', brow: 'neutral', mouth: 'flat' }], ['listening', { eyes: 'half', brow: 'worried', mouth: 'flat', look: [0.6, -0.4] }], ['afraid', { eyes: 'wide', brow: 'worried', mouth: 'o', look: [-0.9, 0], sweat: 1 }],
  ['holding breath', { eyes: 'squint', brow: 'worried', mouth: 'closed', look: [-0.6, 0.2] }], ['determined', { eyes: 'open', brow: 'angry', mouth: 'flat', look: [-0.9, 0] }], ['relief', { eyes: 'half', brow: 'up', mouth: 'smile', look: [-0.5, 0.2] }]],
  ROSA: [['tired', { eyes: 'half', brow: 'flat', mouth: 'flat', look: [-0.6, 0.2] }], ['suspicious', { eyes: 'squint', brow: 'angry', mouth: 'flat', look: [-0.9, 0] }], ['explaining', { eyes: 'open', brow: 'worried', mouth: 'small', open: 0.3, look: [-0.8, 0] }],
  ['wry', { eyes: 'half', brow: 'skeptic', mouth: 'smirk', look: [-0.8, 0] }], ['alarmed', { eyes: 'wide', brow: 'up', mouth: 'o', look: [-0.9, -0.2] }], ['fear', { eyes: 'wide', brow: 'worried', mouth: 'frown', look: [0.4, -0.6], sweat: 1 }]] };
x.fillStyle = '#2a3038'; x.fillRect(0, G1 + 80, W, H - G1 - 80);
[['WAITER', K.WAITER], ['ROSA', K.ROSA]].forEach(([n, ch], r) => EX[n].forEach(([lab, e], i) => { const cw = 260, X = r * 1600 + 40 + i * cw, Y = G1 + 120;
  x.save(); x.beginPath(); x.roundRect(X, Y, cw - 20, 380, 14); x.fillStyle = '#3a4654'; x.fill(); x.clip();
  x.translate(X + cw / 2 - 10, Y + 640); x.scale(0.9, 0.9); K.person(x, ch, { pose: { x: 0, ground: 0 }, e, t: 0.4 }, 'face'); x.restore();
  x.save(); x.fillStyle = '#e8e2d0'; x.font = '28px Anton'; x.textAlign = 'center'; x.fillText(lab, X + cw / 2 - 10, Y + 420); x.restore(); }));
require('fs').writeFileSync(process.argv[2], c.toBuffer('image/png'));
console.log([...new Set(R.QA)].join('\n') || 'QA ok');
