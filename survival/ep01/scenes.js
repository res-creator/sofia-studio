// Ep 1 "The First 5 Days of a Zombie Outbreak" - scenes. draw(ctx, t) gets global time t.
const L = require('../lib');
const { clamp, lerp, ease, hash, fillR, stroke, circle, hero, zombie, person, tape, pill, cross, check } = L;
const TL = require('./timeline.json');
const W = 1920, H = 1080;

const LN = id => TL.lines.find(l => l.id === id);
function at(id, re) { const l = LN(id); if (!re) return l.t0; const w = l.words.find(w => re.test(w.w)); return w ? w.t0 : l.t0; }
const sc = id => TL.scenes.find(s => s.id === id);
const pop = (t, t0, d = 0.3) => clamp((t - t0) / d);
const blink = t => (t % 3.3) < 0.11;
// mouth opening for a speaker at time t
function talk(t, who) {
  for (const l of TL.lines) if (l.who === who && t >= l.t0 && t < l.t1 && l.env) { const v = l.env[Math.floor((t - l.t0) * TL.fps)] || 0; return v < 0.12 ? 0 : v; }
  return 0;
}
const HERO = { bow: false, hoodie: true };
const me = (ctx, x, fy, s, o) => hero(ctx, x, fy, s, Object.assign({}, HERO, o));
// camera: list of framings [tStart, cx, cy, zoom, snap]; hard cut unless snap (fast ease from previous)
function shot(ctx, t, list) {
  let i = 0; list.forEach((f, j) => { if (t >= f[0]) i = j; });
  let [t0, x, y, z, snap] = list[i];
  if (snap && i > 0) { const p = list[i - 1], u = ease.out(clamp((t - t0) / 0.16)); x = lerp(p[1], x, u); y = lerp(p[2], y, u); z = lerp(p[3], z, u); }
  const d = (t - t0) * 0.012; z *= 1 + d;
  ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-x, -y);
}
function shake(ctx, t, amp) { if (amp > 0) ctx.translate((hash(Math.floor(t * 30)) - 0.5) * amp, (hash(Math.floor(t * 30) + 7) - 0.5) * amp); }
function stamp(ctx, x, y, text, u, col = '#d6413a', rot = -0.12, size = 70) {
  if (u <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const k = 1 + (1 - ease.out(clamp(u))) * 1.2; ctx.scale(k, k); ctx.globalAlpha = clamp(u * 2);
  ctx.font = `${size}px Anton`; const w = ctx.measureText(text).width + 50; ctx.lineWidth = 9; ctx.strokeStyle = col; ctx.strokeRect(-w / 2, -size * 0.75, w, size * 1.4);
  ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 4); ctx.restore();
}

// ---- props -----------------------------------------------------------------
function room(ctx, wall = '#36505a', floor = '#5b4636') {
  ctx.fillStyle = wall; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,0.04)'; for (let x = 0; x < W; x += 90) ctx.fillRect(x, 0, 45, 800);
  ctx.fillStyle = floor; ctx.fillRect(0, 800, W, 280); ctx.fillStyle = 'rgba(0,0,0,0.15)'; for (let x = 0; x < W; x += 160) ctx.fillRect(x, 800, 4, 280);
  ctx.fillStyle = '#e9e1cf'; ctx.fillRect(0, 790, W, 16);
}
function windowNight(ctx, x, y, w, h, t) {
  fillR(ctx, x - 14, y - 14, w + 28, h + 28, 8, '#e9e1cf'); ctx.fillStyle = '#16213a'; ctx.fillRect(x, y, w, h);
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  for (let i = 0; i < 9; i++) { const bx = x + i * w / 8 - 20, bh = 120 + hash(i) * 180; ctx.fillStyle = '#0d1528'; ctx.fillRect(bx, y + h - bh, w / 9, bh);
    for (let j = 0; j < 6; j++) if (hash(i * 9 + j) > 0.55) { ctx.fillStyle = hash(i + j + Math.floor(t)) > 0.97 ? '#c93a32' : '#e8c66a'; ctx.fillRect(bx + 10 + (j % 2) * 26, y + h - bh + 20 + Math.floor(j / 2) * 40, 12, 16); } }
  ctx.restore(); ctx.fillStyle = '#e9e1cf'; ctx.fillRect(x + w / 2 - 6, y, 12, h); ctx.fillRect(x, y + h / 2 - 6, w, 12);
}
function couchBack(ctx, x, y, w) { fillR(ctx, x, y, w, 200, 40, '#8b4b3c'); fillR(ctx, x - 40, y + 90, 80, 210, 30, '#7a3f33'); fillR(ctx, x + w - 40, y + 90, 80, 210, 30, '#7a3f33'); }
function couchFront(ctx, x, y, w) { fillR(ctx, x + 20, y + 140, w - 40, 160, 24, '#9c5545'); ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(x + w / 2 - 3, y + 150, 6, 140); fillR(ctx, x - 40, y + 90, 80, 210, 30, '#7a3f33'); fillR(ctx, x + w - 40, y + 90, 80, 210, 30, '#7a3f33'); }
function tv(ctx, x, y, t, msg) {
  fillR(ctx, x - 20, y + 300, 380, 30, 6, '#3a2d26'); fillR(ctx, x, y, 340, 260, 14, '#141518'); ctx.fillStyle = '#2b5f86'; ctx.fillRect(x + 14, y + 14, 312, 232);
  ctx.save(); ctx.beginPath(); ctx.rect(x + 14, y + 14, 312, 232); ctx.clip();
  circle(ctx, x + 170, y + 120, 42, '#e8c9a8'); fillR(ctx, x + 110, y + 160, 120, 110, 30, '#1f2b44');
  ctx.fillStyle = '#c93a32'; ctx.fillRect(x + 14, y + 180, 312, 44); ctx.fillStyle = '#fff'; ctx.font = '30px Anton'; ctx.fillText('BREAKING', x + 24, y + 214);
  ctx.fillStyle = '#111'; ctx.fillRect(x + 14, y + 224, 312, 22); ctx.fillStyle = '#ffd34d'; ctx.font = '800 16px Nunito';
  const tick = msg; const off = (t * 70) % 900; ctx.fillText(tick, x + 330 - off, y + 241); ctx.fillText(tick, x + 1230 - off, y + 241);
  ctx.restore(); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(x + 14, y + 14 + ((t * 120) % 232), 312, 6);
}
function bowl(ctx, x, y) { ctx.beginPath(); ctx.arc(x, y, 34, 0, Math.PI); ctx.fillStyle = '#e9e4d6'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#16181d'; ctx.stroke(); ctx.fillStyle = '#e0a530'; for (let i = 0; i < 5; i++) circle(ctx, x - 22 + i * 11, y - 2, 6, '#d8952b'); }
function duck(ctx, x, y, s = 1, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.beginPath(); ctx.ellipse(0, 0, 46, 32, 0, 0, 7); ctx.fillStyle = '#ffd23f'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#16181d'; ctx.stroke();
  circle(ctx, 26, -34, 26, '#16181d'); circle(ctx, 26, -34, 22.5, '#ffd23f'); ctx.beginPath(); ctx.ellipse(54, -30, 16, 8, 0, 0, 7); ctx.fillStyle = '#f08a24'; ctx.fill(); ctx.stroke();
  circle(ctx, 32, -40, 5, '#16181d'); ctx.fillStyle = '#f2c230'; ctx.beginPath(); ctx.ellipse(-8, -4, 22, 12, -0.3, 0, 7); ctx.fill(); ctx.restore();
}
function cat(ctx, x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const OL = '#16181d', fur = '#e58f3c', fur2 = '#c9732a';
  // tail
  ctx.save(); ctx.lineCap = 'round'; ctx.lineWidth = 34; ctx.strokeStyle = OL; const tw = Math.sin(t * 3) * 30 * (o.angry ? 2 : 1);
  ctx.beginPath(); ctx.moveTo(-90, 0); ctx.quadraticCurveTo(-200, -40 + tw, -170, -170 + tw); ctx.stroke(); ctx.lineWidth = 26; ctx.strokeStyle = fur; ctx.stroke(); ctx.restore();
  ctx.beginPath(); ctx.ellipse(0, -40, 120, 90, 0, 0, 7); ctx.fillStyle = fur; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = OL; ctx.stroke();
  if (o.angry) { ctx.fillStyle = fur2; for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * 28 - 12, -120); ctx.lineTo(i * 28, -150 - hash(i) * 20); ctx.lineTo(i * 28 + 12, -120); ctx.fill(); } }
  ctx.save(); ctx.translate(70, -150 + (o.angry ? -10 : 0)); ctx.rotate(o.turn || 0);
  for (const k of [-1, 1]) { ctx.beginPath(); ctx.moveTo(k * 30, -50); ctx.lineTo(k * 66, -112); ctx.lineTo(k * 74, -30); ctx.closePath(); ctx.fillStyle = fur; ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(k * 44, -54); ctx.lineTo(k * 62, -92); ctx.lineTo(k * 64, -48); ctx.fillStyle = '#f2a7a0'; ctx.fill(); }
  circle(ctx, 0, 0, 82, OL); circle(ctx, 0, 0, 77, fur);
  ctx.fillStyle = fur2; for (const k of [-1, 0, 1]) { ctx.beginPath(); ctx.moveTo(k * 22 - 7, -74); ctx.lineTo(k * 22, -40); ctx.lineTo(k * 22 + 7, -74); ctx.fill(); }
  const ec = o.eyes || '#9be35a';
  for (const k of [-1, 1]) { ctx.beginPath(); ctx.ellipse(k * 30, -6, 20, o.squint ? 6 : 17, 0, 0, 7); ctx.fillStyle = ec; ctx.fill(); ctx.lineWidth = 4; ctx.stroke(); ctx.beginPath(); ctx.ellipse(k * 30, -6, 4, o.squint ? 4 : 14, 0, 0, 7); ctx.fillStyle = OL; ctx.fill();
    if (o.glow) { ctx.save(); ctx.globalAlpha = 0.35; circle(ctx, k * 30, -6, 34, ec); ctx.restore(); } }
  ctx.beginPath(); ctx.moveTo(-8, 18); ctx.lineTo(8, 18); ctx.lineTo(0, 28); ctx.fillStyle = '#e46f86'; ctx.fill();
  if (o.hiss) { ctx.beginPath(); ctx.ellipse(0, 46, 26, 18, 0, 0, 7); ctx.fillStyle = '#5a1f1f'; ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff'; for (const k of [-1, 1]) { ctx.beginPath(); ctx.moveTo(k * 14 - 5, 30); ctx.lineTo(k * 14, 46); ctx.lineTo(k * 14 + 5, 30); ctx.fill(); } }
  else { stroke(ctx, [[0, 28], [-12, 38]], 4, OL); stroke(ctx, [[0, 28], [12, 38]], 4, OL); }
  for (const k of [-1, 1]) for (const d of [-8, 6]) stroke(ctx, [[k * 40, 24 + d], [k * 100, 16 + d * 1.6]], 3, OL);
  ctx.restore();
  for (const k of [-1, 1]) { ctx.beginPath(); ctx.ellipse(40 + k * 45, 44, 30, 18, 0, 0, 7); ctx.fillStyle = fur; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = OL; ctx.stroke(); }
  ctx.restore();
}
function rat(ctx, x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const OL = '#16181d';
  ctx.lineWidth = 8; ctx.strokeStyle = '#e39aa0'; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-80, 10); ctx.quadraticCurveTo(-170, 40 + Math.sin(t * 6) * 20, -220, -10); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, 0, 95, 55, 0, 0, 7); ctx.fillStyle = '#7c7f8a'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = OL; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(60, -40); ctx.quadraticCurveTo(170, -20 + Math.sin(t * 9) * 3, 175, 10); ctx.quadraticCurveTo(120, 40, 60, 30); ctx.fillStyle = '#8a8d98'; ctx.fill(); ctx.stroke();
  circle(ctx, 70, -50, 26, OL); circle(ctx, 70, -50, 21, '#e39aa0'); circle(ctx, 176, 8, 9, '#e46f86');
  ctx.save(); ctx.globalAlpha = 0.4; circle(ctx, 120, -12, 22, '#ff3b30'); ctx.restore(); circle(ctx, 120, -12, 10, '#ff3b30'); circle(ctx, 123, -15, 3, '#fff');
  for (const k of [-1, 1]) stroke(ctx, [[165, 6], [225, 0 + k * 14]], 3, OL);
  ctx.restore();
}
function pigeon(ctx, x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const OL = '#16181d', bob = Math.max(0, Math.sin(t * 5)) * 18;
  ctx.beginPath(); ctx.ellipse(0, 0, 110, 70, -0.15, 0, 7); ctx.fillStyle = '#8d93a3'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = OL; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(-30, -10, 70, 40, -0.4, 0, 7); ctx.fillStyle = '#767c8c'; ctx.fill();
  ctx.save(); ctx.translate(80 + bob, -70); ctx.beginPath(); ctx.ellipse(-20, 30, 40, 50, 0.3, 0, 7); ctx.fillStyle = '#6b8f84'; ctx.fill();
  circle(ctx, 0, 0, 46, OL); circle(ctx, 0, 0, 41, '#8d93a3'); ctx.beginPath(); ctx.moveTo(36, -2); ctx.lineTo(70, 8); ctx.lineTo(36, 14); ctx.fillStyle = '#e0a530'; ctx.fill(); ctx.stroke();
  ctx.save(); ctx.globalAlpha = 0.4; circle(ctx, 12, -8, 22, '#ff3b30'); ctx.restore(); circle(ctx, 12, -8, 11, '#ff6b2c'); circle(ctx, 12, -8, 5, OL); ctx.restore();
  stroke(ctx, [[-10, 60], [-14, 100]], 7, '#e46f86'); stroke(ctx, [[30, 60], [34, 100]], 7, '#e46f86');
  ctx.restore();
}
function shelfUnit(ctx, x, y, w, items) {
  fillR(ctx, x, y, w, 560, 8, '#b9c3cc'); ctx.fillStyle = '#9aa6b1';
  for (let r = 0; r < 4; r++) { ctx.fillRect(x, y + 120 + r * 140, w, 16); }
  items.forEach((it, r) => { for (let i = 0; i < it.n; i++) { const ix = x + 20 + i * (w - 40) / it.n; fillR(ctx, ix, y + 120 + r * 140 - it.h, (w - 40) / it.n - 10, it.h, 6, it.c[i % it.c.length]); } });
}
function tpPack(ctx, x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); fillR(ctx, -70, -60, 140, 120, 16, '#eef3f7'); ctx.strokeStyle = '#9fb4c7'; ctx.lineWidth = 4; for (const a of [-35, 0, 35]) for (const b of [-25, 25]) { ctx.beginPath(); ctx.arc(a, b, 16, 0, 7); ctx.stroke(); } fillR(ctx, -70, -12, 140, 24, 0, '#5aa0d8'); ctx.restore(); }
function bandaid(ctx, x, y, s, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  fillR(ctx, -150, -45, 300, 90, 45, '#ffb3d1'); ctx.lineWidth = 6; ctx.strokeStyle = '#16181d'; ctx.stroke(); fillR(ctx, -55, -35, 110, 70, 14, '#ffe3ef');
  // tiny unicorn
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(0, 6, 26, 16, 0, 0, 7); ctx.fill(); circle(ctx, 22, -10, 12, '#fff'); ctx.beginPath(); ctx.moveTo(26, -20); ctx.lineTo(34, -40); ctx.lineTo(32, -18); ctx.fillStyle = '#ffd23f'; ctx.fill();
  ctx.fillStyle = '#b48bff'; ctx.beginPath(); ctx.ellipse(10, -16, 10, 5, -0.6, 0, 7); ctx.fill(); circle(ctx, 24, -12, 2.5, '#16181d');
  for (const k of [-1, 1]) for (let i = 0; i < 3; i++) circle(ctx, k * (90 + (i % 2) * 18), -16 + i * 16, 4, 'rgba(0,0,0,0.15)');
  ctx.restore();
}
function door(ctx, x, y, w, h, t, knock) {
  const k = knock ? (hash(Math.floor(t * 30)) - 0.5) * 10 : 0;
  fillR(ctx, x - 24, y - 24, w + 48, h + 24, 6, '#e9e1cf'); fillR(ctx, x + k, y, w, h, 4, '#7b5236');
  fillR(ctx, x + 40 + k, y + 50, w - 80, h * 0.35, 6, '#6c4630'); fillR(ctx, x + 40 + k, y + 90 + h * 0.4, w - 80, h * 0.35, 6, '#6c4630');
  circle(ctx, x + w - 50 + k, y + h * 0.55, 18, '#e0b45a'); circle(ctx, x + w / 2 + k, y + 170, 12, '#16181d'); circle(ctx, x + w / 2 + k, y + 170, 6, '#8fa8c0');
  stroke(ctx, [[x + w - 70 + k, y + h * 0.4], [x + w - 120 + k, y + h * 0.45], [x + w - 70 + k, y + h * 0.48]], 6, '#c9cfd6');
}

// ---- scenes ----------------------------------------------------------------
const S = {};
S.open = { draw(ctx, t) {
  const f2 = at('c02');
  ctx.save(); shot(ctx, t, [[0, 960, 560, 1.0], [at('c01', /five/i), 1060, 520, 1.25, true], [f2 - 0.05, 1210, 440, 2.3]]);
  room(ctx); windowNight(ctx, 1300, 150, 420, 300, t);
  ctx.save(); ctx.translate(140, 250); ctx.scale(1.45, 1.45); tv(ctx, 0, 0, t, '...STAY INDOORS ... DO NOT OPEN THE DOOR ... DO NOT HUG GARY ... STAY INDOORS ...'); ctx.restore();
  couchBack(ctx, 900, 520, 620);
  const sp = t < f2; me(ctx, 1210, 812, 1.05, { dir: 1, look: t < f2 - 0.1 ? -1.4 : 0, arms: sp ? 'spoon' : 'hold', chew: sp && Math.sin(t * 2.4) < 0, t, talk: talk(t, 'H'), brow: t >= f2 ? 'up' : null, blink: blink(t) });
  if (!sp) bowl(ctx, 1262, 590);
  couchFront(ctx, 900, 520, 620);
  ctx.restore();
} };

S.market = { draw(ctx, t) {
  const s = sc('market'), war = at('d1a', /war/), skip = at('d1b', /Skip/), tw = at('d1b', /water/), tc = at('d1b', /cans/), tb = at('d1b', /batteries/);
  ctx.save(); shot(ctx, t, [[s.t0, 960, 540, 1.0], [war - 0.1, 880, 560, 1.6, true], [skip - 0.1, 960, 540, 1.0]]);
  if (t > war && t < skip) shake(ctx, t, 6);
  ctx.fillStyle = '#d9dfd6'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#c7cec4'; ctx.fillRect(0, 0, W, 120);
  for (let i = 0; i < 5; i++) fillR(ctx, 100 + i * 380, 30, 220, 26, 10, '#fff7d6');
  ctx.fillStyle = '#8a9a8c'; ctx.fillRect(0, 820, W, 260);
  shelfUnit(ctx, 40, 240, 560, [{ n: 9, h: 70, c: ['#c8473b', '#e0a530', '#4f9d69'] }, { n: 7, h: 90, c: ['#6fb4d8'] }, { n: 10, h: 60, c: ['#d9d3c4', '#c8473b'] }, { n: 8, h: 80, c: ['#4f6d9a', '#e0a530'] }]);
  shelfUnit(ctx, 1320, 240, 560, [{ n: 8, h: 80, c: ['#4f9d69', '#e0a530'] }, { n: 0, h: 0, c: [] }, { n: 9, h: 70, c: ['#c8473b'] }, { n: 7, h: 90, c: ['#6fb4d8'] }]);
  // empty TP shelf in the middle
  fillR(ctx, 680, 240, 560, 560, 8, '#b9c3cc'); ctx.fillStyle = '#9aa6b1'; for (let r = 0; r < 4; r++) ctx.fillRect(680, 360 + r * 140, 560, 16);
  fillR(ctx, 820, 250, 280, 50, 10, '#5aa0d8'); ctx.fillStyle = '#fff'; ctx.font = '34px Anton'; ctx.textAlign = 'center'; ctx.fillText('TOILET PAPER', 960, 288); ctx.textAlign = 'left';
  ctx.fillStyle = '#16181d'; ctx.font = '800 26px Nunito'; ctx.fillText('SOLD OUT', 900, 470);
  // tug of war
  const tug = Math.sin(t * 7) * 18;
  person(ctx, 720 + tug, 980, 0.95, { skin: '#e8c9a8', shirt: '#4f6d9a', shirt2: '#3d5679', pants: '#2c3445', hair: '#b04a2a', dir: 1, arms: 'push', look: 1, brow: 'angry', flat: true });
  person(ctx, 1200 + tug, 980, 0.95, { skin: '#9b6a4a', shirt: '#9a4f9a', shirt2: '#7d3d7d', pants: '#3a3a3a', hair: '#1a1a1a', dir: -1, arms: 'push', look: -1, brow: 'angry', talk: 0.6 + Math.sin(t * 13) * 0.3 });
  tpPack(ctx, 960 + tug, 760, 0.9);
  // dust puffs
  if (t > war) for (let i = 0; i < 6; i++) { const a = t * 3 + i; circle(ctx, 960 + Math.cos(a) * 260, 860 + Math.sin(a * 1.3) * 60, 40 + hash(i) * 30, 'rgba(255,255,255,0.5)'); }
  // runner with a TV (the joke in the background)
  const rx = ((t - s.t0) * 520) % 2600 - 300; person(ctx, rx, 1000, 0.7, { skin: '#f0c7a0', shirt: '#4f9d69', shirt2: '#3c7c53', pants: '#333', hair: '#e0c060', dir: 1, walk: t * 14, arms: 'carry', grin: true });
  fillR(ctx, rx + 10, 800, 120, 90, 8, '#141518');
  // the hero grabs supplies
  if (t > skip) { const u = clamp((t - skip) / (tb + 0.8 - skip)); me(ctx, lerp(2100, 1500, ease.out(u)), 1010, 1.0, { dir: -1, walk: u < 1 ? t * 12 : null, arms: 'push', flat: true, squint: true, brow: 'angry', look: -1 }); }
  ctx.restore();
  cross(ctx, 960, 470, 70, pop(t, skip));
  const items = [[tw, 'WATER', '#6fb4d8'], [tc, 'CANS', '#c8473b'], [tb, 'BATTERIES', '#e0a530']];
  items.forEach(([ti, txt, c], i) => { const u = pop(t, ti); if (u > 0) { pill(ctx, 1560, 170 + i * 120, txt, c, u, '#fff', 50); check(ctx, 1560 + 230, 170 + i * 120, 36, pop(t, ti + 0.15)); } });
} };

S.cart = { draw(ctx, t) {
  const s = sc('cart'), dk = at('d1c', /duck/), lone = at('d1d');
  ctx.save(); shot(ctx, t, [[s.t0, 960, 560, 1.0], [dk - 0.05, 1110, 560, 2.3, true], [lone - 0.1, 880, 470, 1.7]]);
  ctx.fillStyle = '#d9dfd6'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#8a9a8c'; ctx.fillRect(0, 820, W, 260);
  shelfUnit(ctx, 1300, 240, 560, [{ n: 8, h: 80, c: ['#4f9d69', '#e0a530'] }, { n: 7, h: 90, c: ['#6fb4d8'] }, { n: 9, h: 70, c: ['#c8473b'] }, { n: 6, h: 90, c: ['#d9d3c4'] }]);
  // cart
  const cx = 1110; fillR(ctx, cx - 220, 600, 440, 260, 10, 'rgba(185,195,204,0.35)');
  for (let i = 0; i < 6; i++) fillR(ctx, cx - 200 + i * 66, 560 - (i % 2) * 30, 56, 110, 10, '#6fb4d8');
  for (let i = 0; i < 5; i++) fillR(ctx, cx - 190 + i * 80, 650, 66, 80, 8, ['#c8473b', '#e0a530', '#4f9d69'][i % 3]);
  ctx.strokeStyle = '#8a959f'; ctx.lineWidth = 10; ctx.strokeRect(cx - 220, 600, 440, 260); for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(cx - 220 + i * 73, 600); ctx.lineTo(cx - 220 + i * 73, 860); ctx.stroke(); }
  stroke(ctx, [[cx - 220, 600], [cx - 300, 520]], 12, '#8a959f'); for (const k of [-1, 1]) circle(ctx, cx + k * 180, 900, 24, '#1d1f26');
  // duck on top, wobbles when noticed
  const held = t > lone - 0.1;
  if (!held) duck(ctx, cx + 40, 520, 1.3, t > dk ? Math.sin(t * 20) * 0.08 * Math.max(0, 1 - (t - dk)) : 0);
  me(ctx, 760, 1000, 1.15, { dir: 1, arms: held ? 'hold' : 'down', look: held ? 0 : 1, brow: held ? 'worried' : null, talk: talk(t, 'H'), blink: blink(t), flat: !held });
  if (held) duck(ctx, 815, 660, 1.35, -0.15);
  ctx.restore();
  stamp(ctx, 1450, 200, 'ESSENTIAL ITEM', pop(t, lone + 0.9, 0.25), '#3fae63', 0.08, 64);
} };

S.door = { draw(ctx, t) {
  const s = sc('door'), tr = at('d2a', /treat/), dk = at('d2a');
  ctx.save(); shot(ctx, t, [[s.t0, 960, 540, 1.0], [tr - 0.1, 960, 520, 1.05]]);
  room(ctx, '#3d4b63', '#4a3a30');
  door(ctx, 700, 220, 420, 580, t, false);
  me(ctx, 1380, 960, 1.1, { dir: -1, look: -1, brow: 'worried', blink: blink(t), flat: true });
  ctx.restore();
  pill(ctx, 960, 140, 'NOBODY KNOWS WHO IS INFECTED', '#efe6cf', pop(t, dk + 1.2), '#1e2026', 34);
  // suspects lineup
  const u0 = pop(t, tr, 0.25);
  if (u0 > 0) { ctx.fillStyle = `rgba(10,12,18,${0.75 * u0})`; ctx.fillRect(0, 0, W, H);
    const who = [{ skin: '#f0d3b8', shirt: '#7a5ea8', shirt2: '#5e4686', pants: '#333', hair: '#d9d9d9', label: 'GRANDMA' }, { skin: '#c99872', shirt: '#2f6fb0', shirt2: '#24578a', pants: '#2c3445', hair: '#2a1f1a', label: 'MAILMAN' }, { skin: '#f2c9a0', shirt: '#4f9d69', shirt2: '#3c7c53', pants: '#3b3f4a', hair: '#e0c060', label: 'YOUR BEST FRIEND' }];
    who.forEach((p, i) => { const u = pop(t, tr + i * 0.35, 0.25); if (u <= 0) return; const x = 480 + i * 480;
      ctx.save(); ctx.globalAlpha = u; fillR(ctx, x - 190, 200, 380, 560, 20, '#efe6cf'); ctx.save(); ctx.beginPath(); ctx.rect(x - 170, 220, 340, 460); ctx.clip(); ctx.fillStyle = '#c9c1ad'; ctx.fillRect(x - 170, 220, 340, 460);
      person(ctx, x, 1180, 1.6, Object.assign({}, p, { dir: 1, blink: blink(t + i), flat: true })); ctx.restore();
      ctx.fillStyle = '#1e2026'; ctx.font = '40px Anton'; ctx.textAlign = 'center'; ctx.fillText(p.label, x, 735); ctx.restore();
      stamp(ctx, x, 300, 'INFECTED?', pop(t, tr + i * 0.35 + 0.25, 0.2), '#d6413a', -0.18, 60); });
  }
} };

S.peep = { draw(ctx, t) {
  const s = sc('peep'), g = LN('d2b'), su = at('d2c'), nope = at('d2d');
  if (t < nope - 0.15) {
    // fisheye view through the peephole
    ctx.save(); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    ctx.beginPath(); ctx.arc(960, 540, 470, 0, 7); ctx.clip();
    ctx.translate(960, 540); const z = t > su ? 1.18 + (t - su) * 0.04 : 1.0; ctx.scale(z, z); ctx.translate(-960, -540);
    ctx.fillStyle = '#b7a47e'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#7a6a4d'; ctx.fillRect(0, 760, W, 400);
    for (let i = 0; i < 4; i++) fillR(ctx, 300 + i * 360, 260, 120, 420, 6, '#8f6b4a');
    fillR(ctx, 860, 120, 200, 30, 10, '#fff4d0');
    const tw = Math.floor(t * 8) % 7 === 0;
    person(ctx, 960, 1320, 2.1, { skin: '#c9c7a6', shirt: '#a9b4c2', shirt2: '#8995a5', pants: '#3b3f4a', hair: '#6a5a45', dir: 1, arms: t < g.t0 + 1.2 ? 'wave' : 'hold', t, talk: talk(t, 'G'), grin: t > su && !talk(t, 'G'), squint: tw && t > g.t0 + 2, look: 0.2, brow: 'up' });
    // mug "SUGAR?"
    if (t > g.t0 + 1.2) { fillR(ctx, 1030, 640, 110, 120, 14, '#f4f1e8'); ctx.lineWidth = 12; ctx.strokeStyle = '#f4f1e8'; ctx.beginPath(); ctx.arc(1145, 700, 34, -1.2, 1.2); ctx.stroke(); ctx.fillStyle = '#c93a32'; ctx.font = '26px Anton'; ctx.textAlign = 'center'; ctx.fillText('SUGAR?', 1085, 710); ctx.textAlign = 'left'; }
    // stain + bite on Gary's shirt
    ctx.fillStyle = 'rgba(120,30,30,0.55)'; ctx.beginPath(); ctx.ellipse(880, 850, 40, 26, 0.4, 0, 7); ctx.fill();
    ctx.restore();
    // lens rim + fisheye vignette
    const g2 = ctx.createRadialGradient(960, 540, 300, 960, 540, 480); g2.addColorStop(0, 'rgba(0,0,0,0)'); g2.addColorStop(1, 'rgba(0,0,0,0.85)'); ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(960, 540, 480, 0, 7); ctx.fill();
    if (t > su) { stamp(ctx, 960, 130, 'DOES NOT NEED SUGAR', pop(t, su + 0.5, 0.2), '#d6413a', -0.06, 66); }
  } else {
    // inside: the hero slowly backs away from the door
    const u = clamp((t - nope) / 1.6);
    ctx.save(); shot(ctx, t, [[nope - 0.15, 1130, 560, 2.1], [nope + 1.0, 1000, 520, 1.15]]);
    room(ctx, '#3d4b63', '#4a3a30'); door(ctx, 700, 220, 420, 580, t, false);
    me(ctx, lerp(1150, 1500, ease.inOut(clamp((t - nope - 1.0) / 1.0))), 960, 1.1, { dir: -1, look: 1, squint: true, flat: !talk(t, 'H'), talk: talk(t, 'H') * 0.5, brow: 'angry', walk: t > nope + 1 && t < nope + 2 ? t * 6 : null });
    // chain locks pop in
    for (let i = 0; i < 3; i++) { const v = pop(t, nope + 1.0 + i * 0.25, 0.15); if (v > 0) { ctx.save(); ctx.globalAlpha = v; stroke(ctx, [[1080, 400 + i * 70], [1040, 420 + i * 70], [1080, 440 + i * 70]], 9, '#c9cfd6'); ctx.restore(); } }
    ctx.restore();
  }
} };

S.animals = { draw(ctx, t) {
  const s = sc('animals'), tr = at('d3a', /Rats/), tp = at('d3a', /Pigeons/), ty = at('d3a', /yes/);
  if (t < tr) { ctx.save(); shot(ctx, t, [[s.t0, 960, 540, 1.0]]); room(ctx, '#2e3a46', '#3a3029'); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(0, 0, W, H);
    // dark hallway with shadows of animals
    for (let i = 0; i < 3; i++) { ctx.save(); ctx.globalAlpha = 0.6; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(500 + i * 450, 760, 110, 50, 0, 0, 7); ctx.fill(); ctx.restore(); circle(ctx, 560 + i * 450, 730, 9, '#ff3b30'); }
    ctx.restore(); return; }
  if (t < tp) { ctx.save(); shot(ctx, t, [[tr, 960, 560, 1.0], [tr + 0.5, 1050, 540, 1.3, true]]);
    ctx.fillStyle = '#3b3f45'; ctx.fillRect(0, 0, W, H); for (let y = 0; y < H; y += 80) for (let x = (y / 80 % 2) * 80; x < W; x += 160) fillR(ctx, x, y, 150, 70, 4, '#454a51');
    fillR(ctx, 560, 300, 800, 520, 20, '#25282d'); ctx.fillStyle = '#5c6168'; for (let i = 0; i < 9; i++) ctx.fillRect(560, 330 + i * 56, 800, 18);
    rat(ctx, 960 + Math.sin(t * 2) * 30, 640, 1.6, t); ctx.restore(); return; }
  if (t < ty) { ctx.save(); shot(ctx, t, [[tp, 960, 540, 1.0], [tp + 0.5, 1050, 470, 1.3, true]]);
    ctx.fillStyle = '#9fc4dd'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#c4d7e4'; for (let i = 0; i < 6; i++) ctx.fillRect(i * 340, 380 - hash(i) * 200, 260, 800);
    fillR(ctx, -20, 700, W + 40, 60, 0, '#d9d3c4'); ctx.fillStyle = '#e9e1cf'; ctx.fillRect(0, 760, W, 400);
    pigeon(ctx, 960, 590, 1.9, t); ctx.restore(); return; }
  // "And yes..." slow push towards a dark doorway with a cat silhouette
  ctx.save(); shot(ctx, t, [[ty, 960, 540, 1.0]]); ctx.translate(960, 540); ctx.scale(1 + (t - ty) * 0.15, 1 + (t - ty) * 0.15); ctx.translate(-960, -540);
  room(ctx, '#22303a', '#2f2621'); fillR(ctx, 760, 280, 400, 520, 6, '#0b0d10');
  ctx.save(); ctx.globalAlpha = 0.9; cat(ctx, 960, 790, 1.0, t, { eyes: '#9be35a', glow: true }); ctx.restore();
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'lighter'; for (const k of [-1, 1]) circle(ctx, 1030 + k * 30, 634, 14, 'rgba(155,227,90,0.8)'); ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
} };

S.cat = { draw(ctx, t) {
  const s = sc('cat'), mw = at('d3b'), vi = at('d3c', /violence/), turn = at('d3c');
  const jump = t > vi + 0.35;
  ctx.save(); shot(ctx, t, [[s.t0, 960, 560, 1.0], [mw - 0.05, 640, 560, 1.9], [turn - 0.1, 1240, 450, 1.9], [vi, 1240, 470, 2.4, true]]);
  room(ctx); windowNight(ctx, 160, 150, 380, 280, t);
  couchBack(ctx, 900, 520, 620); couchFront(ctx, 900, 520, 620);
  const ang = t > vi - 0.1;
  if (!jump) cat(ctx, 1240, 560, 0.95, t, { turn: t > turn ? 0 : 0.35, eyes: ang ? '#ff3b30' : '#9be35a', glow: ang, hiss: ang, angry: ang, squint: t > turn && !ang });
  me(ctx, 640, 960, 1.1, { dir: 1, look: 1, brow: 'worried', talk: talk(t, 'H'), scared: t > vi, sweat: t > turn, arms: t > vi ? 'scared' : 'down', blink: blink(t) });
  ctx.restore();
  if (jump) { const u = clamp((t - vi - 0.35) / 0.35); ctx.save(); ctx.translate(960, 600); ctx.scale(1 + u * 3, 1 + u * 3); cat(ctx, 0, 0, 1.2, t, { eyes: '#ff3b30', glow: true, hiss: true, angry: true }); ctx.restore();
    if (u >= 1) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); } }
  stamp(ctx, 1340, 180, 'MR. WHISKERS · TRAITOR', pop(t, turn + 0.3, 0.2), '#d6413a', 0.06, 58);
} };

S.roof = { draw(ctx, t) {
  const s = sc('roof'), a = at('d4a', /One/), b = at('d4a', /ground/), c = at('d4a', /lock/);
  ctx.save(); shot(ctx, t, [[s.t0, 960, 540, 1.0], [a - 0.1, 1000, 560, 1.06]]);
  const g = ctx.createLinearGradient(0, 0, 0, 700); g.addColorStop(0, '#f2b880'); g.addColorStop(1, '#f6dcae'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 12; i++) { const bh = 200 + hash(i) * 300; ctx.fillStyle = '#c9a78c'; ctx.fillRect(i * 170, 700 - bh, 150, bh); }
  for (let i = 0; i < 3; i++) { ctx.fillStyle = '#3a3a3a'; ctx.globalAlpha = 0.5; circle(ctx, 300 + i * 600, 420 - i * 40, 80, '#777'); ctx.globalAlpha = 1; }
  ctx.fillStyle = '#6d6a66'; ctx.fillRect(0, 700, W, 380); ctx.fillStyle = '#8a8580'; ctx.fillRect(0, 690, W, 24);
  // water tower
  ctx.fillStyle = '#7a5236'; for (const k of [-1, 1]) ctx.fillRect(1560 + k * 90, 380, 18, 320); fillR(ctx, 1440, 200, 260, 200, 20, '#8b5d3e'); ctx.beginPath(); ctx.moveTo(1430, 210); ctx.lineTo(1570, 120); ctx.lineTo(1710, 210); ctx.fillStyle = '#5a3d2a'; ctx.fill();
  // roof access door
  fillR(ctx, 260, 340, 360, 360, 6, '#9aa0a6'); fillR(ctx, 360, 440, 160, 260, 4, '#5b6168'); circle(ctx, 500, 580, 10, '#e0b45a');
  const lk = pop(t, c, 0.2); if (lk > 0) { fillR(ctx, 470, 600, 40, 50, 8, '#e0a530'); ctx.lineWidth = 8; ctx.strokeStyle = '#c9cfd6'; ctx.beginPath(); ctx.arc(490, 600, 16, Math.PI, 0); ctx.stroke(); }
  me(ctx, 900, 1000, 1.3, { dir: 1, look: -0.6, blink: blink(t), flat: true, arms: 'down' });
  duck(ctx, 1000, 590, 0.7, 0.1);
  ctx.restore();
  // checklist card
  const cu = pop(t, at('d4a', /higher/), 0.3);
  if (cu > 0) { ctx.save(); ctx.globalAlpha = cu; fillR(ctx, 1120, 400, 740, 430, 24, 'rgba(239,230,207,0.97)'); ctx.fillStyle = '#1e2026'; ctx.font = '68px Anton'; ctx.fillText('NEW SHELTER', 1170, 490);
    ctx.font = '900 46px Nunito'; [['One way in', a], ['No ground floor windows', b], ['A door you can lock', c]].forEach(([txt, ti], i) => { ctx.fillStyle = t > ti ? '#1e2026' : 'rgba(30,32,38,0.3)'; ctx.fillText(txt, 1250, 590 + i * 82); });
    ctx.restore(); [a, b, c].forEach((ti, i) => check(ctx, 1200, 574 + i * 82, 28, pop(t, ti))); }
} };

S.bite = { draw(ctx, t) {
  const s = sc('bite'), bit = at('d5a', /bit/), kit = at('d5a', /first/), uni = at('d5a', /unicorn/), rule = at('d5b');
  if (t < kit - 0.1) {
    // close-up: arm with a bite mark
    ctx.save(); shot(ctx, t, [[s.t0, 960, 540, 1.0], [bit - 0.05, 1000, 560, 1.35, true]]);
    ctx.fillStyle = '#3d4b63'; ctx.fillRect(0, 0, W, H);
    ctx.lineCap = 'round'; ctx.lineWidth = 250; ctx.strokeStyle = '#16181d'; ctx.beginPath(); ctx.moveTo(-100, 900); ctx.lineTo(1500, 520); ctx.stroke(); ctx.lineWidth = 236; ctx.strokeStyle = '#f2c9a0'; ctx.stroke();
    ctx.lineWidth = 280; ctx.strokeStyle = '#e0a530'; ctx.beginPath(); ctx.moveTo(-200, 930); ctx.lineTo(260, 820); ctx.stroke();
    if (t > bit) { ctx.save(); ctx.translate(1000, 640); ctx.rotate(-0.23); for (let i = 0; i < 6; i++) { const a = Math.PI * (0.15 + i * 0.14); circle(ctx, Math.cos(a) * 70, -Math.sin(a) * 34 - 6, 9, '#a8322c'); circle(ctx, Math.cos(a) * 70, Math.sin(a) * 34 + 6, 9, '#a8322c'); } ctx.restore();
      ctx.save(); ctx.globalAlpha = 0.25 + 0.15 * Math.sin(t * 4); ctx.beginPath(); ctx.ellipse(1000, 640, 130, 80, -0.23, 0, 7); ctx.fillStyle = '#7d9b5c'; ctx.fill(); ctx.restore(); }
    ctx.restore(); return;
  }
  if (t < rule - 0.1) {
    // the first aid kit: one sad unicorn band-aid
    ctx.save(); shot(ctx, t, [[kit - 0.1, 960, 560, 1.0], [uni - 0.05, 960, 520, 1.6, true]]);
    ctx.fillStyle = '#2f3a4c'; ctx.fillRect(0, 0, W, H);
    fillR(ctx, 460, 300, 1000, 560, 30, '#d6413a'); fillR(ctx, 500, 340, 920, 480, 20, '#f4f1e8'); ctx.fillStyle = '#d6413a'; ctx.fillRect(900, 110, 120, 220); fillR(ctx, 460, 100, 1000, 220, 30, '#c2372f');
    ctx.fillStyle = '#fff'; ctx.fillRect(930, 150, 60, 140); ctx.fillRect(890, 190, 140, 60);
    ctx.fillStyle = 'rgba(0,0,0,0.06)'; ctx.font = '800 30px Nunito'; ctx.textAlign = 'center'; ctx.fillText('(empty)', 700, 760); ctx.fillText('(empty)', 1220, 760); ctx.textAlign = 'left';
    bandaid(ctx, 960, 580, 1.2, 0.08 + Math.sin(t * 2) * 0.02);
    ctx.restore(); return;
  }
  // close-up stare at camera, band-aid on the arm
  ctx.save(); shot(ctx, t, [[rule - 0.1, 960, 540, 2.0], [at('d5b', /find/), 960, 520, 2.6, true]]);
  room(ctx, '#3d4b63', '#4a3a30');
  me(ctx, 960, 900, 1.1, { dir: 1, look: 0, green: 0.35, flat: true, brow: 'up', blink: blink(t) });
  ctx.restore();
  tape(ctx, 260, 150, 'RULE #1', null, pop(t, rule));
} };

S.knock = { draw(ctx, t) {
  const s = sc('knock'), q = LN('d5c'), fine = LN('d5d'), gr = fine.t0 + 1.2, endT = fine.t1 + 0.35;
  if (t >= endT) { ctx.fillStyle = '#0b0c10'; ctx.fillRect(0, 0, W, H);
    const u = pop(t, endT + 0.2, 0.3); ctx.save(); ctx.globalAlpha = u; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = '150px Anton'; ctx.fillText('DAY 6', W / 2, 520);
    ctx.font = '900 44px Nunito'; ctx.fillStyle = '#e0a530'; ctx.fillText('COMING SOON', W / 2, 610); ctx.restore(); duck(ctx, 1440, 700, 0.8 * u, 0.1); return; }
  const kn = t > q.t0 - 0.6 && t < q.t0 + 0.2;
  ctx.save(); shot(ctx, t, [[s.t0, 960, 540, 1.0], [fine.t0 - 0.1, 1260, 570, 2.2], [gr, 1260, 560, 2.9, true]]); if (kn) shake(ctx, t, 6);
  room(ctx, '#3d4b63', '#4a3a30'); door(ctx, 500, 220, 420, 580, t, kn);
  const g = t > gr;
  me(ctx, 1260, 960, 1.1, { dir: -1, look: t > fine.t0 ? 0 : -1, green: 0.55 + (g ? 0.2 : 0), grin: t > fine.t0 && !talk(t, 'H') && !g, talk: talk(t, 'H'), brow: g ? 'angry' : 'up', scared: false, blink: !g && blink(t), sweat: true });
  if (g) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const k of [-1, 1]) circle(ctx, 1260 - 6 + k * 20 * 1.1, 960 - 362 * 1.1 - 2, 12, 'rgba(255,60,40,0.9)'); ctx.restore(); }
  ctx.restore();
  if (kn) { pill(ctx, 700, 160, 'KNOCK KNOCK', '#efe6cf', 1, '#1e2026', 44); }
} };

module.exports = S;
