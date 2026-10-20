// "Survive the Science" mascot: crash-test dummy (TikTok channel @definitelyhumannews).
// drawDummy(ctx, x, hipY, s, p) — hip = point between the legs, body is ~430 units tall at s=1 (head top ≈ hipY-430).
// p: rot (whole body, around chest), squash (y-scale), eyes:'open'|'wide'|'happy'|'x'|'swirl'|'shut', look:[x,y],
//    blink 0..1, brow:{l,r} (-1 sad .. 1 angry), mouth:{open,smile,o,teeth}, shades (sunglasses), armL/armR:[x,y] hand target
//    relative to hip, legs:'stand'|'flail'|'tuck'|'sit', t (time, for flail wiggle), glow 0..1 (re-entry heat), frost 0..1,
//    bandages n (extra plasters after rebuild), hold{L,R}:(ctx)=>{} drawn at the hand, fade 0..1 (dissolve).
const { OL, paint, line, limb, ik } = require('./draw');
const Y = '#F7C21B', YS = '#D99A0B', GR = '#8E949E', GRS = '#5E636C', BELT = '#4A4E57', PL = '#F2C49B';

function target(ctx, x, y, r) { // crash-test marker: quartered black/yellow disc
  ctx.save();
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, r, i * Math.PI / 2, (i + 1) * Math.PI / 2); ctx.closePath(); ctx.fillStyle = i % 2 ? '#1d1d22' : '#FFE070'; ctx.fill(); }
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.lineWidth = 4; ctx.strokeStyle = '#1d1d22'; ctx.stroke(); ctx.restore();
}
function plaster(ctx, x, y, a, sc = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(sc, sc);
  paint(ctx, c => { c.roundRect(-34, -12, 68, 24, 12); }, PL, { lw: 4 });
  ctx.fillStyle = '#E3A97C'; ctx.fillRect(-10, -12, 20, 24);
  ctx.fillStyle = '#C98A60'; for (const [dx, dy] of [[-5, -5], [4, -5], [-5, 5], [4, 5]]) { ctx.beginPath(); ctx.arc(dx, dy, 2, 0, 7); ctx.fill(); }
  ctx.restore();
}
function eye(ctx, x, y, r, p, side) {
  const kind = p.eyes || 'open', blink = p.blink || 0;
  if (kind === 'happy' || kind === 'shut') {
    ctx.save(); ctx.beginPath();
    if (kind === 'happy') ctx.arc(x, y + 8, r * 0.7, Math.PI * 1.1, Math.PI * 1.9); else { ctx.moveTo(x - r * 0.7, y); ctx.lineTo(x + r * 0.7, y); }
    ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.strokeStyle = OL; ctx.stroke(); ctx.restore(); return;
  }
  const rr = kind === 'wide' ? r * 1.15 : r;
  paint(ctx, c => c.ellipse(x, y, rr, rr * Math.max(0.08, 1 - blink), 0, 0, 7), '#fff', { lw: 6 });
  if (blink > 0.6) return;
  ctx.save(); ctx.beginPath(); ctx.ellipse(x, y, rr, rr * Math.max(0.08, 1 - blink), 0, 0, 7); ctx.clip();
  if (kind === 'x') { line(ctx, [[x - 14, y - 14], [x + 14, y + 14]], 8, OL); line(ctx, [[x + 14, y - 14], [x - 14, y + 14]], 8, OL); }
  else if (kind === 'swirl') { ctx.beginPath(); for (let a = 0; a < 14; a += 0.2) { const q = 2 + a * 1.7; ctx.lineTo(x + Math.cos(a + (p.t || 0) * 8 * side) * q, y + Math.sin(a + (p.t || 0) * 8 * side) * q); } ctx.lineWidth = 5; ctx.strokeStyle = OL; ctx.stroke(); }
  else {
    const [lx, ly] = p.look || [0, 0]; const pr = kind === 'wide' ? r * 0.36 : r * 0.46;
    const px = x + lx * (rr - pr - 3), py = y + ly * (rr - pr - 3);
    ctx.beginPath(); ctx.arc(px, py, pr, 0, 7); ctx.fillStyle = '#1d1d22'; ctx.fill();
    ctx.beginPath(); ctx.arc(px - pr * 0.35, py - pr * 0.4, pr * 0.32, 0, 7); ctx.fillStyle = '#fff'; ctx.fill();
  }
  ctx.restore();
}
function head(ctx, p) { // centred at 0,0, r=95
  const R = 95;
  for (const k of [-1, 1]) { paint(ctx, c => c.arc(k * (R + 6), 8, 15, 0, 7), GR, { lw: 5 }); }
  paint(ctx, c => c.arc(0, 0, R, 0, 7), Y, { shade: YS, sx: 14, sy: 10, lw: 7 });
  target(ctx, -48, -58, 21);
  // eyes
  eye(ctx, -36, -4, 30, p, -1); eye(ctx, 36, -4, 30, p, 1);
  if (p.shades) {
    ctx.save(); ctx.fillStyle = '#1d1d22';
    for (const k of [-1, 1]) { ctx.beginPath(); ctx.ellipse(k * 36, -2, 34, 26, 0, 0, 7); ctx.fill(); }
    ctx.fillRect(-10, -10, 20, 7); ctx.globalAlpha = 0.5; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(-48, -12, 9, 5, -0.5, 0, 7); ctx.fill(); ctx.restore();
  }
  // brows
  const b = p.brow || {}; const bl = b.l ?? 0, br = b.r ?? 0;
  line(ctx, [[-60, -44 - bl * 4], [-14, -44 + bl * 10]], 9, OL); line(ctx, [[14, -44 + br * 10], [60, -44 - br * 4]], 9, OL);
  // mouth
  const m = p.mouth || {}; const op = m.open || 0, sm = m.smile ?? 0.4;
  if (op < 0.06) { ctx.save(); ctx.beginPath(); ctx.moveTo(-26, 48); ctx.quadraticCurveTo(0, 48 + sm * 22, 26, 48 - sm * 2); ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.strokeStyle = OL; ctx.stroke(); ctx.restore(); }
  else {
    const w = m.o ? 16 + op * 6 : 26 + op * 6, h = 8 + op * 34;
    const path = c => { if (m.o) c.ellipse(0, 52, w, h * 0.8, 0, 0, 7); else { c.moveTo(-w, 44); c.quadraticCurveTo(0, 44 + sm * 10 - 6, w, 44); c.quadraticCurveTo(w * 0.9, 44 + h, 0, 46 + h); c.quadraticCurveTo(-w * 0.9, 44 + h, -w, 44); c.closePath(); } };
    paint(ctx, path, '#7B2430', { lw: 6 });
    ctx.save(); ctx.beginPath(); path(ctx); ctx.clip();
    ctx.fillStyle = '#F07A8A'; ctx.beginPath(); ctx.ellipse(0, 46 + h, w * 0.6, h * 0.45, 0, 0, 7); ctx.fill();
    if (m.teeth) { ctx.fillStyle = '#fff'; ctx.fillRect(-w, 40, w * 2, 10); }
    ctx.restore();
  }
  plaster(ctx, 66, 16, -0.7, 0.85);
  if (p.bandages > 0) plaster(ctx, -40, -80, 0.3, 0.9);
  if (p.bandages > 1) plaster(ctx, 20, 78, 0.1, 0.8);
}
function hand(ctx, h, hold) {
  if (hold) { ctx.save(); ctx.translate(h[0], h[1]); hold(ctx); ctx.restore(); }
  paint(ctx, c => c.arc(h[0], h[1], 21, 0, 7), Y, { lw: 6, shade: YS, sx: 5, sy: 4 });
}
function arm(ctx, sh, tgt, side, hold) {
  const { el, hand: h } = ik(sh, tgt, 92, 92, side);
  limb(ctx, [sh, el, h], 34, Y, YS);
  paint(ctx, c => c.arc(el[0], el[1], 11, 0, 7), GR, { lw: 4 });
  paint(ctx, c => c.arc(sh[0], sh[1], 13, 0, 7), GR, { lw: 4 });
  hand(ctx, h, hold);
}
function leg(ctx, hip, knee, foot, side) {
  limb(ctx, [hip, knee, foot], 40, Y, YS);
  paint(ctx, c => c.arc(knee[0], knee[1], 12, 0, 7), GR, { lw: 4 });
  paint(ctx, c => c.ellipse(foot[0] + side * 16, foot[1] + 8, 36, 18, 0, 0, 7), BELT, { lw: 6 });
}
function legsFor(p) {
  const t = p.t || 0, w = Math.sin(t * 9) * 18;
  switch (p.legs) {
    case 'flail': return [[[-40, 0], [-95, 70 + w], [-110, 165 - w]], [[40, 0], [100, 60 - w], [125, 150 + w]]];
    case 'tuck': return [[[-40, 0], [-70, 80], [-30, 120]], [[40, 0], [70, 80], [30, 120]]];
    case 'sit': return [[[-40, 0], [-50, 90], [-60, 150]], [[40, 0], [50, 90], [60, 150]]];
    default: return [[[-40, 0], [-46, 120], [-48, 230]], [[40, 0], [46, 120], [48, 230]]];
  }
}
function drawDummy(ctx, x, hipY, s, p = {}) {
  ctx.save(); ctx.translate(x, hipY); ctx.scale(s, s);
  if (p.fade) ctx.globalAlpha = 1 - p.fade;
  ctx.translate(0, -150); ctx.rotate(p.rot || 0); ctx.scale(1 / (p.squash || 1) ** 0.5, p.squash || 1); ctx.translate(0, 150);
  const [L, R] = legsFor(p);
  leg(ctx, ...L, -1); leg(ctx, ...R, 1);
  // arms behind? (both drawn after torso so they read clearly)
  const shL = [-88, -150], shR = [88, -150];
  // torso
  paint(ctx, c => c.roundRect(-82, -175, 164, 190, 44), Y, { shade: YS, sx: 14, sy: 8, lw: 7 });
  line(ctx, [[-70, -20], [70, -20]], 6, YS);
  line(ctx, [[-80, -165], [70, 5]], 26, OL); line(ctx, [[-80, -165], [70, 5]], 17, BELT);
  paint(ctx, c => c.roundRect(-12, -92, 26, 22, 5), GR, { lw: 4 });
  target(ctx, 46, -128, 20);
  // neck spring + head
  ctx.save(); ctx.translate(0, -175);
  for (let i = 0; i < 3; i++) paint(ctx, c => c.roundRect(-26, -16 - i * 13, 52, 13, 6), GR, { lw: 4 });
  ctx.translate(0, -148 + (p.headBob || 0)); ctx.rotate(p.headTilt || 0); ctx.scale(1.3, 1.3); head(ctx, p); ctx.restore();
  arm(ctx, shL, p.armL || [-120, -10], -1, p.holdL); arm(ctx, shR, p.armR || [120, -10], 1, p.holdR);
  ctx.restore();
}
// tinted version (re-entry heat / frost): draw on an offscreen layer, tint only the dummy's pixels
let OFF = null;
function drawDummyFx(ctx, x, hipY, s, p = {}) {
  if (!p.glow && !p.frost) return drawDummy(ctx, x, hipY, s, p);
  const { createCanvas } = require('@napi-rs/canvas');
  const W = 800, H = 1000; if (!OFF) OFF = createCanvas(W, H);
  const o = OFF.getContext('2d'); o.setTransform(1, 0, 0, 1, 0, 0); o.clearRect(0, 0, W, H);
  drawDummy(o, W / 2, 680, 1, Object.assign({}, p, { fade: 0 }));
  o.globalCompositeOperation = 'source-atop';
  if (p.glow) { o.globalAlpha = p.glow * 0.55; o.fillStyle = '#FF5A1F'; o.fillRect(0, 0, W, H); }
  if (p.frost) { o.globalAlpha = p.frost * 0.5; o.fillStyle = '#BFE8FF'; o.fillRect(0, 0, W, H); }
  o.globalAlpha = 1; o.globalCompositeOperation = 'source-over';
  ctx.save(); if (p.fade) ctx.globalAlpha = 1 - p.fade; ctx.drawImage(OFF, x - W / 2 * s, hipY - 680 * s, W * s, H * s); ctx.restore();
}
module.exports = { drawDummy, drawDummyFx, target, plaster };
