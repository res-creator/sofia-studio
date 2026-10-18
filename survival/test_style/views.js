// Turnaround (front / 3-4 / profile) and expression sheets for checking proportions and faces.
// Usage: node views.js turnaround <skin> out.png | node views.js faces <skin> out.png
const { createCanvas } = require('../node_modules/@napi-rs/canvas'); require('../lib');
const R = require('./rig'), P = require('./props');
const { paint, cap, line, shade } = R;

function dims(S, C) {
  const sw = (S.shW + 18) * (C.wide || 1), B = C.belly ? C.belly : 1;
  return { sw, B, legW: 26 * S.limbW, armW: 20 * S.limbW, hand: 22 * S.limbW };
}
function eyeFront(ctx, S, C, x, y, rx, ry, e, look = [0, 0.1]) {
  if (e.eyes === 'happy') { line(ctx, [[x - rx, y + ry * 0.2], [x, y - ry * 0.45], [x + rx, y + ry * 0.2]], S.lw * 1.2, S.ink); return; }
  if (e.eyes === 'closed') { line(ctx, [[x - rx, y], [x + rx, y]], S.lw * 1.1, S.ink); return; }
  ctx.save(); ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, 7); ctx.fillStyle = '#fbfaf6'; ctx.fill(); ctx.lineWidth = S.lw * 0.9; ctx.strokeStyle = S.ink; ctx.stroke(); ctx.clip();
  if (e.blood) { ctx.strokeStyle = '#d0453c'; ctx.lineWidth = 2; for (let i = 0; i < 5; i++) { const a = i * 1.3; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * rx, y + Math.sin(a) * ry); ctx.lineTo(x + Math.cos(a) * rx * 0.45, y + Math.sin(a + 0.4) * ry * 0.45); ctx.stroke(); } }
  const pr = Math.min(rx, ry) * (e.eyes === 'tiny' ? 0.18 : 0.38); ctx.fillStyle = S.ink; ctx.beginPath(); ctx.arc(x + look[0] * rx * 0.4, y + look[1] * ry * 0.4, pr, 0, 7); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + look[0] * rx * 0.4 + pr * 0.35, y + look[1] * ry * 0.4 - pr * 0.35, pr * 0.28, 0, 7); ctx.fill(); ctx.restore();
}
function headFront(ctx, S, C, x, y, e) {
  const Rr = S.headR, D = S.name === 'D';
  for (const k of [-1, 1]) paint(ctx, S, c => c.ellipse(x + k * Rr * 0.92, y + Rr * 0.08, Rr * 0.14, Rr * 0.22, 0, 0, 7), C.skin);
  const skull = c => { c.moveTo(x - Rr * 0.92, y - Rr * 0.1); c.quadraticCurveTo(x - Rr * 0.95, y - Rr * 1.02, x, y - Rr * 1.02); c.quadraticCurveTo(x + Rr * 0.95, y - Rr * 1.02, x + Rr * 0.92, y - Rr * 0.1);
    c.quadraticCurveTo(x + Rr * 0.88, y + Rr * 0.72, x, y + Rr * 0.96); c.quadraticCurveTo(x - Rr * 0.88, y + Rr * 0.72, x - Rr * 0.92, y - Rr * 0.1); c.closePath(); };
  paint(ctx, S, skull, C.skin, { lx: 0 });
  if (C.bald) { ctx.save(); ctx.strokeStyle = C.hair; ctx.lineWidth = D ? 6 : 4; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x + Rr * 0.7, y - Rr * (0.5 - i * 0.12)); ctx.quadraticCurveTo(x, y - Rr * (1.2 - i * 0.12), x - Rr * 0.7, y - Rr * (0.62 - i * 0.1)); ctx.stroke(); } ctx.restore(); }
  else paint(ctx, S, c => { c.moveTo(x - Rr * 0.98, y - Rr * 0.18); c.quadraticCurveTo(x - Rr * 1.05, y - Rr * 1.15, x, y - Rr * 1.18); c.quadraticCurveTo(x + Rr * 1.05, y - Rr * 1.15, x + Rr * 0.98, y - Rr * 0.18);
    c.lineTo(x + Rr * 0.8, y - Rr * 0.5); c.lineTo(x + Rr * 0.45, y - Rr * 0.58); c.lineTo(x + Rr * 0.3, y - Rr * 0.78); c.lineTo(x + Rr * 0.05, y - Rr * 0.56); c.lineTo(x - Rr * 0.25, y - Rr * 0.74); c.lineTo(x - Rr * 0.45, y - Rr * 0.55); c.lineTo(x - Rr * 0.8, y - Rr * 0.5); c.closePath();
    c.moveTo(x - Rr * 0.2, y - Rr * 1.1); c.lineTo(x - Rr * 0.1, y - Rr * 1.45); c.lineTo(x + Rr * 0.12, y - Rr * 1.12); c.moveTo(x + Rr * 0.2, y - Rr * 1.1); c.lineTo(x + Rr * 0.45, y - Rr * 1.38); c.lineTo(x + Rr * 0.5, y - Rr * 1.0); }, C.hair, { k: 0.7 });
  const ex = Rr * (D ? 0.4 : 0.36), ey = y - Rr * 0.04, rx = Rr * S.eyeR * (D ? 0.95 : 0.9), ry = rx * 1.12;
  for (const k of [-1, 1]) { eyeFront(ctx, S, C, x + k * ex, ey, rx, ry, e);
    const tilt = { angry: 0.35, worried: -0.35, up: 0, neutral: 0 }[e.brow || 'neutral'] * -k, lift = e.brow === 'up' ? -Rr * 0.1 : 0;
    ctx.save(); ctx.translate(x + k * ex, ey - ry - Rr * 0.1 + lift); ctx.rotate(tilt); ctx.beginPath(); ctx.ellipse(0, 0, rx * 1.05, Rr * 0.05, 0, 0, 7); ctx.fillStyle = C.bald ? shade(C.skin, 0.55) : C.hair; ctx.fill(); ctx.restore(); }
  if (C.glasses) { ctx.save(); ctx.lineWidth = S.lw * 1.05; ctx.strokeStyle = S.ink; for (const k of [-1, 1]) { ctx.beginPath(); ctx.ellipse(x + k * ex, ey, rx * S.glassR, ry * S.glassR * 0.95, 0, 0, 7); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(x - ex + rx * S.glassR, ey); ctx.lineTo(x + ex - rx * S.glassR, ey); ctx.stroke(); ctx.restore(); }
  paint(ctx, S, c => c.ellipse(x, y + Rr * 0.24, Rr * 0.12 * S.noseK, Rr * 0.13 * S.noseK, 0, 0, 7), C.skin, { k: 0.9 });
  const my = y + Rr * 0.58, mw = Rr * S.mouthW * 0.8;
  ctx.save(); ctx.lineWidth = S.lw * 0.9; ctx.strokeStyle = S.ink; ctx.lineCap = 'round';
  if (e.mouth === 'biggrin' || e.mouth === 'grin') { ctx.beginPath(); ctx.moveTo(x - mw, my - Rr * 0.08); ctx.quadraticCurveTo(x, my + Rr * 0.4, x + mw, my - Rr * 0.08); ctx.closePath(); ctx.fillStyle = '#fbfaf2'; ctx.fill(); ctx.stroke(); }
  else if (e.mouth === 'wide') { ctx.beginPath(); ctx.ellipse(x, my + Rr * 0.06, mw * 0.55, Rr * 0.2, 0, 0, 7); ctx.fillStyle = '#5b1f22'; ctx.fill(); ctx.stroke(); }
  else { ctx.beginPath(); ctx.moveTo(x - mw * 0.6, my); ctx.quadraticCurveTo(x, my + Rr * 0.12, x + mw * 0.6, my); ctx.stroke(); }
  ctx.restore();
}
function front(ctx, S, C, x, ground, e) {
  const d = dims(S, C), hipY = ground - S.ankle - S.thigh - S.shin, neckY = hipY - S.torso, headY = neckY - S.neck - S.headR * 0.92, hw = d.sw * 0.42;
  // legs + shoes
  for (const k of [-1, 1]) { R.limb(ctx, S, [x + k * hw, hipY], [x + k * (hw + 3), hipY + S.thigh], [x + k * (hw + 5), ground - S.ankle], d.legW * 1.2, d.legW, d.legW * 0.8, k < 0 ? C.pants : shade(C.pants, 0.9));
    paint(ctx, S, c => c.ellipse(x + k * (hw + 14), ground - 2, S.foot * 0.5, 18, 0, 0, 7), C.shoe); }
  // torso
  const sw = d.sw, B = d.B, T = S.torso;
  const body = c => { c.moveTo(x - sw * 0.45, neckY - 6); c.quadraticCurveTo(x - sw * 1.2, neckY - 4, x - sw * 1.2, neckY + 34); c.quadraticCurveTo(x - sw * 1.18 * B, neckY + T * 0.5, x - sw * 1.08 * B, hipY - T * 0.1);
    c.quadraticCurveTo(x - sw * 1.0, hipY + 20, x, hipY + 24); c.quadraticCurveTo(x + sw * 1.0, hipY + 20, x + sw * 1.08 * B, hipY - T * 0.1); c.quadraticCurveTo(x + sw * 1.18 * B, neckY + T * 0.5, x + sw * 1.2, neckY + 34); c.quadraticCurveTo(x + sw * 1.2, neckY - 4, x + sw * 0.45, neckY - 6); c.closePath(); };
  paint(ctx, S, body, C.top, { lx: 0.3 });
  ctx.save(); ctx.beginPath(); body(ctx); ctx.clip();
  if (C.hood) { line(ctx, [[x - 14, neckY + 8], [x - 18, neckY + 70]], 4, '#f4efe4'); line(ctx, [[x + 14, neckY + 8], [x + 18, neckY + 70]], 4, '#f4efe4'); ctx.beginPath(); ctx.roundRect(x - sw * 0.75, hipY - T * 0.38, sw * 1.5, T * 0.24, 10); ctx.lineWidth = S.lw * 0.6; ctx.strokeStyle = S.ink; ctx.stroke(); ctx.fillStyle = C.top2; ctx.fillRect(x - sw * 2, hipY - 4, sw * 4, 40); }
  if (C.belt) { ctx.fillStyle = C.pants; ctx.fillRect(x - sw * 2, hipY + 2, sw * 4, 40); ctx.fillStyle = '#3a2a1e'; ctx.fillRect(x - sw * 2, hipY, sw * 4, 12); ctx.fillStyle = '#d9b860'; ctx.fillRect(x - 12, hipY - 2, 24, 16); }
  if (C.stain) { ctx.fillStyle = 'rgba(140,60,40,0.4)'; ctx.beginPath(); ctx.ellipse(x - sw * 0.3, neckY + T * 0.45, 22, 14, 0.4, 0, 7); ctx.fill(); }
  ctx.restore();
  if (C.hood) paint(ctx, S, c => { c.moveTo(x - sw * 0.75, neckY + 4); c.quadraticCurveTo(x, neckY + 34, x + sw * 0.75, neckY + 4); c.quadraticCurveTo(x, neckY - 20, x - sw * 0.75, neckY + 4); }, C.top2);
  // neck + head
  paint(ctx, S, c => cap(c, [x, neckY + 4], [x, neckY - S.neck - 12], 12 * S.limbW + 2, 12 * S.limbW), C.skin);
  headFront(ctx, S, C, x, headY, e);
  // arms (both sides, relaxed)
  const armCol = C.arm === 'skin' ? C.skin : C.top;
  for (const k of [-1, 1]) { const sh = [x + k * sw * 1.05, neckY + 30], tgt = [x + k * (sw * 1.18 * B + 16), hipY + 6];
    const a = (function () { const dd = Math.hypot(tgt[0] - sh[0], tgt[1] - sh[1]), L = S.ua + S.fa - 18; const u = [(tgt[0] - sh[0]) / dd, (tgt[1] - sh[1]) / dd]; const w = [sh[0] + u[0] * Math.min(dd, L), sh[1] + u[1] * Math.min(dd, L)]; return { e: [(sh[0] + w[0]) / 2 + k * 10, (sh[1] + w[1]) / 2], w }; })();
    R.limb(ctx, S, sh, a.e, a.w, d.armW * 1.1, d.armW, d.armW * 0.85, armCol); R.hand(ctx, S, C, a.e, a.w, 'fist'); }
  return headY - S.headR * 1.0;
}
function headProfile(ctx, S, C, x, y, e) {
  const Rr = S.headR, D = S.name === 'D';
  const skull = c => { c.moveTo(-Rr * 0.7, -Rr * 0.6); c.quadraticCurveTo(-Rr * 0.3, -Rr * 1.05, Rr * 0.35, -Rr * 0.95); c.quadraticCurveTo(Rr * 0.95, -Rr * 0.7, Rr * 0.9, Rr * 0.05); c.quadraticCurveTo(Rr * 0.85, Rr * 0.6, Rr * 0.2, Rr * 0.85);
    c.quadraticCurveTo(-Rr * 0.35, Rr * (D ? 0.95 : 0.98), -Rr * 0.62, Rr * 0.62); c.lineTo(-Rr * 0.72, Rr * 0.35); c.quadraticCurveTo(-Rr * 0.82, Rr * 0.05, -Rr * 0.78, -Rr * 0.2); c.closePath(); };
  ctx.save(); ctx.translate(x, y);
  paint(ctx, S, skull, C.skin);
  paint(ctx, S, c => c.ellipse(Rr * 0.18, Rr * 0.05, Rr * 0.14, Rr * 0.22, 0, 0, 7), C.skin);
  if (C.bald) { ctx.strokeStyle = C.hair; ctx.lineWidth = D ? 6 : 4; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(Rr * 0.75, -Rr * (0.45 - i * 0.1)); ctx.quadraticCurveTo(Rr * 0.1, -Rr * (1.1 - i * 0.12), -Rr * 0.5, -Rr * (0.7 - i * 0.12)); ctx.stroke(); } }
  else paint(ctx, S, c => { c.moveTo(-Rr * 0.75, -Rr * 0.5); c.quadraticCurveTo(-Rr * 0.4, -Rr * 1.2, Rr * 0.4, -Rr * 1.1); c.quadraticCurveTo(Rr * 1.05, -Rr * 0.85, Rr * 0.96, -Rr * 0.05); c.lineTo(Rr * 0.5, Rr * 0.0); c.lineTo(Rr * 0.4, -Rr * 0.45); c.lineTo(Rr * 0.05, -Rr * 0.55); c.lineTo(-Rr * 0.2, -Rr * 0.72); c.lineTo(-Rr * 0.4, -Rr * 0.5); c.closePath();
    c.moveTo(-Rr * 0.1, -Rr * 1.05); c.lineTo(Rr * 0.05, -Rr * 1.45); c.lineTo(Rr * 0.3, -Rr * 1.02); c.moveTo(Rr * 0.4, -Rr * 0.98); c.lineTo(Rr * 0.75, -Rr * 1.25); c.lineTo(Rr * 0.72, -Rr * 0.85); }, C.hair, { k: 0.7 });
  // eye, brow, glasses, nose, mouth
  const ex = -Rr * 0.48, ey = -Rr * 0.05, rx = Rr * S.eyeR * 0.6, ry = Rr * S.eyeR * 1.05;
  eyeFront(ctx, S, C, ex, ey, rx, ry, e, [-0.8, 0.1]);
  ctx.save(); ctx.translate(ex, ey - ry - Rr * 0.1); ctx.rotate(e.brow === 'angry' ? 0.3 : e.brow === 'worried' ? -0.3 : 0); ctx.beginPath(); ctx.ellipse(0, e.brow === 'up' ? -Rr * 0.08 : 0, rx * 1.3, Rr * 0.05, 0, 0, 7); ctx.fillStyle = C.bald ? shade(C.skin, 0.55) : C.hair; ctx.fill(); ctx.restore();
  if (C.glasses) { ctx.lineWidth = S.lw * 1.05; ctx.strokeStyle = S.ink; ctx.beginPath(); ctx.ellipse(ex, ey, rx * 1.35, ry * 1.25, 0, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(ex + rx * 1.35, ey - 4); ctx.lineTo(Rr * 0.12, ey - Rr * 0.02); ctx.stroke(); }
  paint(ctx, S, c => { c.moveTo(-Rr * 0.74, -Rr * 0.05); c.quadraticCurveTo(-Rr * (0.98 + 0.14 * S.noseK), Rr * 0.18, -Rr * (0.86 + 0.08 * S.noseK), Rr * 0.32); c.quadraticCurveTo(-Rr * 0.74, Rr * 0.36, -Rr * 0.7, Rr * 0.28); }, C.skin, { k: 0.9 });
  ctx.lineWidth = S.lw * 0.9; ctx.strokeStyle = S.ink; ctx.beginPath();
  if (e.mouth === 'biggrin' || e.mouth === 'grin') { ctx.moveTo(-Rr * 0.68, Rr * 0.48); ctx.quadraticCurveTo(-Rr * 0.45, Rr * 0.66, -Rr * 0.25, Rr * 0.44); } else { ctx.moveTo(-Rr * 0.66, Rr * 0.52); ctx.lineTo(-Rr * 0.45, Rr * 0.52); }
  ctx.stroke(); ctx.restore();
}
function profile(ctx, S, C, x, ground, e) {
  const d = dims(S, C), hipY = ground - S.ankle - S.thigh - S.shin, neckY = hipY - S.torso, headY = neckY - S.neck - S.headR * 0.92;
  const sh = { pants: shade(C.pants, 0.85) };
  R.limb(ctx, S, [x + 8, hipY], [x + 4, hipY + S.thigh], [x + 10, ground - S.ankle], d.legW * 1.2, d.legW, d.legW * 0.8, sh.pants); R.shoe(ctx, S, Object.assign({}, C, { shoe: shade(C.shoe, 0.88) }), [x + 10, ground - S.ankle]);
  R.limb(ctx, S, [x - 6, hipY], [x - 10, hipY + S.thigh], [x - 4, ground - S.ankle], d.legW * 1.2, d.legW, d.legW * 0.8, C.pants); R.shoe(ctx, S, C, [x - 4, ground - S.ankle]);
  const dep = d.sw * 0.82, B = d.B, T = S.torso;
  const body = c => { c.moveTo(x - dep * 0.5, neckY - 8); c.quadraticCurveTo(x - dep * 1.05, neckY + 10, x - dep * 1.0 * B, neckY + T * 0.45); c.quadraticCurveTo(x - dep * 1.1 * B, hipY - T * 0.05, x - dep * 0.8, hipY + 22);
    c.lineTo(x + dep * 0.8, hipY + 20); c.quadraticCurveTo(x + dep * 0.95, neckY + T * 0.4, x + dep * 0.7, neckY - 4); c.closePath(); };
  paint(ctx, S, body, C.top);
  ctx.save(); ctx.beginPath(); body(ctx); ctx.clip(); if (C.belt) { ctx.fillStyle = C.pants; ctx.fillRect(x - dep * 2, hipY + 2, dep * 4, 40); ctx.fillStyle = '#3a2a1e'; ctx.fillRect(x - dep * 2, hipY, dep * 4, 12); } if (C.hood) { ctx.fillStyle = C.top2; ctx.fillRect(x - dep * 2, hipY - 4, dep * 4, 40); } ctx.restore();
  if (C.hood) paint(ctx, S, c => { c.moveTo(x - 4, neckY - 4); c.quadraticCurveTo(x + dep * 0.9, neckY - 34, x + dep * 1.0, neckY + 20); c.quadraticCurveTo(x + dep * 0.5, neckY + 16, x + 10, neckY + 8); c.closePath(); }, C.top2);
  paint(ctx, S, c => cap(c, [x - 4, neckY + 4], [x - 8, neckY - S.neck - 12], 12 * S.limbW + 2, 12 * S.limbW), C.skin);
  headProfile(ctx, S, C, x - 6, headY, e);
  const armCol = C.arm === 'skin' ? C.skin : C.top, s0 = [x + 2, neckY + 30], w = [x - 6, s0[1] + S.ua + S.fa - 30], el = [x + 14, s0[1] + S.ua * 0.95];
  R.limb(ctx, S, s0, el, w, d.armW * 1.1, d.armW, d.armW * 0.85, armCol); R.hand(ctx, S, C, el, w, 'fist');
}
function threeQ(ctx, S, C, x, ground, e) { const J = R.solve(S, { x, ground }); R.drawChar(ctx, S, C, J, e, { t: 0.4 }); }

const [mode, skin, file] = process.argv.slice(2);
const base = Object.assign({}, R.SKINS[skin || 'D2'], { garyVar: '20' });
if (mode === 'turnaround') {
  const W = 2400, H = 1500, FL1 = 680, FL2 = 1400, c = createCanvas(W, H), x = c.getContext('2d');
  x.fillStyle = '#ece7f4'; x.fillRect(0, 0, W, H);
  for (const fl of [FL1, FL2]) { x.fillStyle = '#d6cde3'; x.fillRect(0, fl, W, 30); x.strokeStyle = 'rgba(60,40,90,0.18)'; x.lineWidth = 2; for (let i = 1; i <= 4; i++) { const y = fl - i * 172; x.beginPath(); x.moveTo(0, y); x.lineTo(W, y); x.stroke(); } }
  const rows = [['hero', FL1, { mouth: 'smile', brow: 'neutral', look: [-0.4, 0.1] }], ['gary', FL2, { mouth: 'biggrin', brow: 'up', blood: 1, look: [-0.4, 0.1] }]];
  for (const [who, fl, e] of rows) { const { S, C } = R.who(base, who); front(x, S, C, 420, fl, e); threeQ(x, S, C, 1200, fl, e); profile(x, S, C, 1980, fl, e); }
  x.fillStyle = '#2a1f3d'; x.font = '900 40px Nunito'; x.fillText(`Style ${skin || 'D2'} turnaround: front  ·  3/4  ·  profile   (grid = 1 head of the hero)`, 30, 56);
  require('fs').writeFileSync(file, c.toBuffer('image/png'));
} else {
  const cols = 8, cw = 300, W = cols * cw, H = 2 * 380 + 70, c = createCanvas(W, H), x = c.getContext('2d');
  x.fillStyle = '#ece7f4'; x.fillRect(0, 0, W, H);
  const HERO = [['neutral', {}], ['happy', { eyes: 'happy', mouth: 'biggrin', brow: 'up' }], ['smug', { eyes: 'half', brow: 'skeptic', mouth: 'smirk', look: [0.6, 0.1] }], ['angry', { brow: 'angry', mouth: 'frown', look: [-0.8, 0] }],
    ['scared', { eyes: 'wide', brow: 'worried', mouth: 'o', sweat: 1 }], ['panic', { eyes: 'tiny', brow: 'worried', mouth: 'wide', open: 1, hairUp: 1, sweat: 1 }], ['deadpan', { eyes: 'squint', brow: 'flat', mouth: 'flat', look: [0.2, 0] }], ['talking', { mouth: 'wide', open: 0.7, brow: 'up' }]];
  const GARY = [['creepy', { mouth: 'biggrin', brow: 'up', blood: 1 }], ['talking', { mouth: 'wide', open: 0.8, brow: 'up', blood: 1 }], ['crazy', { eyes: 'wide', brow: 'up', mouth: 'teeth', blood: 1, look: [0, 0] }], ['twitch', { eyes: 'open', twitch: 1, mouth: 'biggrin', brow: 'skeptic', blood: 1 }],
    ['sad', { brow: 'worried', mouth: 'frown', blood: 1, look: [-0.5, 0.4] }], ['angry', { brow: 'angry', mouth: 'teeth', blood: 1 }], ['hungry', { eyes: 'half', brow: 'up', mouth: 'o', blood: 1, look: [-0.9, 0] }], ['smug', { eyes: 'half', brow: 'skeptic', mouth: 'smirk', blood: 1 }]];
  [['hero', HERO], ['gary', GARY]].forEach(([who, list], r) => { const { S, C } = R.who(base, who);
    list.forEach(([name, e], i) => { const cx = i * cw + cw / 2, cy = 70 + r * 380 + 190; x.save(); x.translate(cx, cy); x.scale(1.25, 1.25); R.head(x, S, C, [0, 0], 0, Object.assign({ look: [-0.4, 0.1] }, e)); x.restore();
      x.fillStyle = '#2a1f3d'; x.font = '900 28px Nunito'; x.textAlign = 'center'; x.fillText(name, cx, 70 + r * 380 + 370); x.textAlign = 'left'; }); });
  x.fillStyle = '#2a1f3d'; x.font = '900 36px Nunito'; x.fillText(`Style ${skin || 'D2'} expressions`, 20, 46);
  require('fs').writeFileSync(file, c.toBuffer('image/png'));
}
