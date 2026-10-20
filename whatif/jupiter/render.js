// "What if you fell into Jupiter?" — TikTok 9:16 renderer (1080x1920, 30 fps).
// Usage: node whatif/jupiter/render.js video A B out.mp4 | still t1,t2,... out.png | cues (writes cues.json for audio)
require('../../lib/fonts');
const F = require('../../lib/fonts');
const { createCanvas } = require('@napi-rs/canvas');
const { spawn } = require('child_process');
const fs = require('fs');
const { OL, paint, line, ease, clamp, lerp, hash, noise1 } = require('../../lib/draw');
const { drawDummyFx, target } = require('../../lib/dummy');
const TL = require('./timeline.json');
const W = 1080, H = 1920, FPS = TL.fps;
const SC = Object.fromEntries(TL.scenes.map(s => [s.id, s]));
const LN = Object.fromEntries(TL.lines.map(l => [l.scene, l]));
const YEL = '#FFD23F', RED = '#FF4757', BLUE = '#3EC1F3', INK = '#14141c';

// ------------------------------------------------------------ timing helpers
const k = (t, a, d) => clamp((t - a) / d);
function word(sc, re) { const L = LN[sc]; const w = L.words.find(w => re.test(w.w)); if (!w) throw new Error(`no word ${re} in ${sc}`); return w.t0; }
function talk(t) { for (const L of TL.lines) if (t >= L.t0 && t < L.t1) { const i = Math.floor((t - L.t0) * FPS); return clamp((L.env[i] || 0) * 1.1); } return 0; }
function mouth(t, base = {}) { const v = talk(t); if (v < 0.05) return base; return Object.assign({ smile: 0.3 }, base, { open: clamp(0.25 + v * 0.8), o: noise1(t * 7) > 0.45 ? 1 : 0 }); }
function blink(t, seed = 0) { const u = (t + seed) % 3.4; return u < 0.08 ? u / 0.08 : u < 0.17 ? 1 - (u - 0.08) / 0.09 : 0; }

// ------------------------------------------------------------ drawing helpers
function txt(ctx, s, x, y, size, fill, o = {}) {
  ctx.save(); ctx.font = `${o.w || 700} ${size}px ${F.EN}`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
  if (o.maxW) { let sz = size; while (ctx.measureText(s).width > o.maxW && sz > 20) { sz -= 2; ctx.font = `${o.w || 700} ${sz}px ${F.EN}`; } }
  ctx.lineJoin = 'round'; ctx.lineWidth = o.lw ?? size * 0.22; ctx.strokeStyle = o.stroke || INK; if (ctx.lineWidth > 0) ctx.strokeText(s, x, y);
  ctx.fillStyle = fill; ctx.fillText(s, x, y); ctx.restore();
}
function pop(ctx, u, x, y, rot, fn) { // scale-in with overshoot
  if (u <= 0) return; const s = ease.back(clamp(u)); ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); fn(ctx); ctx.restore();
}
function comic(ctx, s, x, y, size, col, u, rot = -0.08) { pop(ctx, u, x, y, rot, c => txt(c, s, 0, 0, size, col, { w: 700, lw: size * 0.26 })); }
function tag(ctx, s, x, y, size, bg, fg = '#fff', u = 1, rot = 0) {
  pop(ctx, u, x, y, rot, c => {
    c.font = `700 ${size}px ${F.EN}`; const w = c.measureText(s).width + size * 1.1, h = size * 1.6;
    paint(c, q => q.roundRect(-w / 2, -h / 2, w, h, h * 0.3), bg, { lw: 6, ol: INK });
    txt(c, s, 0, 2, size, fg, { lw: 0 });
  });
}
function stars(ctx, t, speed = 60, seed = 0, n = 140) {
  for (let i = 0; i < n; i++) {
    const x = hash(i + seed) * W, z = 0.3 + hash(i * 3 + seed) * 0.7, y = ((hash(i * 7 + seed) * H - t * speed * z) % H + H) % H;
    const r = 1 + z * 2.6, tw = 0.6 + 0.4 * Math.sin(t * 3 + i);
    ctx.globalAlpha = tw; ctx.fillStyle = i % 9 ? '#fff' : '#FFE9A8'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
function space(ctx, t, speed = 60, top = '#0B1026', bot = '#22134A') {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bot); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  stars(ctx, t, speed);
}
const BANDS = ['#F3E3C6', '#D9A877', '#F6EBD6', '#C07A4E', '#EAD2AE', '#B8693F', '#F1DFC0', '#CF9566', '#F5E6CB', '#A85E3A', '#E9CDA6'];
function jupiter(ctx, cx, cy, R, t, o = {}) {
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.clip();
  const n = BANDS.length;
  for (let i = 0; i < n; i++) {
    const y0 = cy - R + (2 * R) * i / n, h = 2 * R / n + 2;
    ctx.fillStyle = BANDS[i]; ctx.beginPath(); ctx.moveTo(cx - R, y0);
    for (let x = -R; x <= R; x += R / 12) ctx.lineTo(cx + x, y0 + Math.sin(x / R * 6 + i + t * 0.6) * R * 0.012);
    ctx.lineTo(cx + R, y0 + h + 4); ctx.lineTo(cx - R, y0 + h + 4); ctx.closePath(); ctx.fill();
  }
  // Great Red Spot
  ctx.save(); ctx.translate(cx + R * 0.32, cy + R * 0.36); ctx.rotate(-0.08);
  ctx.fillStyle = '#C8553D'; ctx.beginPath(); ctx.ellipse(0, 0, R * 0.2, R * 0.11, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#E0784F'; ctx.beginPath(); ctx.ellipse(-R * 0.02, -R * 0.01, R * 0.13, R * 0.06, 0, 0, 7); ctx.fill(); ctx.restore();
  // terminator shade
  const g = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.35, R * 0.2, cx, cy, R * 1.05); g.addColorStop(0, 'rgba(255,255,255,0.12)'); g.addColorStop(0.7, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(20,5,30,0.55)');
  ctx.fillStyle = g; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R); ctx.restore();
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.lineWidth = o.lw ?? 8; ctx.strokeStyle = INK; ctx.stroke();
  if (o.glow !== false) { ctx.save(); ctx.globalAlpha = 0.25; ctx.lineWidth = 30; ctx.strokeStyle = '#FFD9A0'; ctx.beginPath(); ctx.arc(cx, cy, R + 22, 0, 7); ctx.stroke(); ctx.restore(); }
}
function puff(ctx, x, y, s, col, sh) {
  const B = [[-90, 10, 60], [-30, -25, 75], [50, -10, 66], [110, 18, 48], [10, 25, 64]];
  ctx.fillStyle = sh; for (const [dx, dy, r] of B) { ctx.beginPath(); ctx.arc(x + dx * s, y + (dy + 12) * s, r * s, 0, 7); ctx.fill(); }
  ctx.fillStyle = col; for (const [dx, dy, r] of B) { ctx.beginPath(); ctx.arc(x + dx * s, y + dy * s, r * s * 0.94, 0, 7); ctx.fill(); }
}
function cloudLayer(ctx, t, speed, cols, seed, n = 9, scale = 1.6) {
  for (let i = 0; i < n; i++) {
    const x = hash(i + seed) * (W + 300) - 150, y = ((hash(i * 5 + seed) * (H + 600) - t * speed) % (H + 600) + H + 600) % (H + 600) - 300;
    puff(ctx, x, y, scale * (0.7 + hash(i * 2 + seed) * 0.8), cols[0], cols[1]);
  }
}
function speedLines(ctx, t, n, col = 'rgba(255,255,255,0.55)', len = 260, sp = 2600) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) { const x = hash(i * 13) * W, y = ((hash(i * 17) * (H + len) - t * sp * (0.6 + hash(i) * 0.6)) % (H + len) + H + len) % (H + len) - len; ctx.lineWidth = 3 + hash(i * 3) * 6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + len * (0.5 + hash(i * 5))); ctx.stroke(); }
  ctx.restore();
}
function panel(ctx, x, y, w, h, fn, bg = '#fff') {
  paint(ctx, c => c.roundRect(x, y, w, h, 28), bg, { lw: 8, ol: INK });
  ctx.save(); ctx.beginPath(); ctx.roundRect(x + 4, y + 4, w - 8, h - 8, 24); ctx.clip(); ctx.translate(x, y); fn(ctx); ctx.restore();
}
function thermo(ctx, x, y, h, level, label, col) { // vertical thermometer, level 0..1
  paint(ctx, c => c.roundRect(x - 26, y, 52, h, 26), '#fff', { lw: 7, ol: INK });
  paint(ctx, c => c.arc(x, y + h + 20, 42, 0, 7), col, { lw: 7, ol: INK });
  ctx.fillStyle = col; const lh = (h - 20) * level; ctx.fillRect(x - 13, y + h - lh, 26, lh + 10);
  txt(ctx, label, x, y - 46, 52, '#fff', { w: 700 });
}
function sunIcon(ctx, x, y, r, t) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(t * 0.5);
  for (let i = 0; i < 12; i++) { ctx.rotate(Math.PI / 6); paint(ctx, c => { c.moveTo(r * 0.95, -r * 0.18); c.lineTo(r * 1.4, 0); c.lineTo(r * 0.95, r * 0.18); c.closePath(); }, '#FFB02E', { lw: 4 }); }
  ctx.restore(); paint(ctx, c => c.arc(x, y, r, 0, 7), '#FFD23F', { lw: 6, shade: '#FFA62B', sx: r * 0.15, sy: r * 0.12 });
}
function blackHole(ctx, x, y, r, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(1, 0.38); ctx.rotate(t * 0.8);
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(0, 0, r * (1.9 - i * 0.25), 0, 7); ctx.lineWidth = r * 0.28; ctx.strokeStyle = ['#FF7A2F', '#FFB347', '#FFE8A3'][i]; ctx.stroke(); }
  ctx.restore();
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = '#000'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#FFE8A3'; ctx.stroke();
}
function elephant(ctx, x, y, s, flip = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * flip, s);
  const G = '#9AA3B5', GS = '#7B8496';
  for (const lx of [-50, -18, 22, 52]) paint(ctx, c => c.roundRect(lx - 14, 10, 28, 60, 10), GS, { lw: 5 });
  paint(ctx, c => c.ellipse(0, 0, 80, 55, 0, 0, 7), G, { lw: 6, shade: GS, sx: 10, sy: 8 });
  paint(ctx, c => { c.moveTo(-82, -10); c.quadraticCurveTo(-140, 20, -118, 70); c.lineTo(-100, 68); c.quadraticCurveTo(-112, 30, -72, 18); c.closePath(); }, G, { lw: 5 });
  paint(ctx, c => c.arc(-72, -22, 40, 0, 7), G, { lw: 6 });
  paint(ctx, c => c.ellipse(-50, -20, 26, 34, 0.3, 0, 7), '#C3C9D6', { lw: 5 });
  ctx.beginPath(); ctx.arc(-88, -32, 6, 0, 7); ctx.fillStyle = INK; ctx.fill();
  ctx.restore();
}
function sodaCan(ctx, x, y, s, crush) { // crush 0..1
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (1 + crush * 0.35), s * (1 - crush * 0.6));
  paint(ctx, c => { c.moveTo(-40, -80); c.lineTo(40, -80); for (let i = 0; i <= 6; i++) c.lineTo(40 + (i % 2 ? 14 : 0) * crush, -80 + i * 26.6); c.lineTo(-40, 80); for (let i = 6; i >= 0; i--) c.lineTo(-40 - (i % 2 ? 14 : 0) * crush, -80 + i * 26.6); c.closePath(); }, '#E8403C', { lw: 6, shade: '#B92E2B', sx: 12, sy: 0 });
  ctx.fillStyle = '#fff'; ctx.fillRect(-40, -20, 80, 24);
  ctx.restore();
}
function probe(ctx, x, y, s, chute, crush) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (chute > 0) {
    ctx.save(); ctx.globalAlpha = chute;
    line(ctx, [[-60, -40], [-110, -230]], 4, INK); line(ctx, [[60, -40], [110, -230]], 4, INK); line(ctx, [[0, -40], [0, -250]], 4, INK);
    paint(ctx, c => { c.moveTo(-170, -230); c.quadraticCurveTo(0, -420, 170, -230); c.quadraticCurveTo(0, -260, -170, -230); c.closePath(); }, '#FF7A2F', { lw: 6 });
    ctx.restore();
  }
  ctx.scale(1 + crush * 0.25, 1 - crush * 0.4);
  paint(ctx, c => { c.moveTo(-70, -40); c.lineTo(70, -40); c.lineTo(100, 30); c.quadraticCurveTo(0, 90, -100, 30); c.closePath(); }, crush > 0.3 ? '#C9542F' : '#D9D2C1', { lw: 6, shade: '#9E9682', sx: 10, sy: 6 });
  paint(ctx, c => c.roundRect(-60, -80, 120, 44, 10), '#B5B9C2', { lw: 5 });
  ctx.fillStyle = '#E8B33A'; ctx.fillRect(-56, -70, 112, 14);
  ctx.restore();
}
function sprayBottle(ctx) { // toilet-cleaner bottle, held at the hand
  paint(ctx, c => c.roundRect(-30, -40, 60, 110, 16), '#3EC1F3', { lw: 5 });
  paint(ctx, c => { c.moveTo(-16, -40); c.lineTo(-10, -80); c.lineTo(30, -80); c.lineTo(30, -64); c.lineTo(12, -64); c.lineTo(16, -40); c.closePath(); }, '#fff', { lw: 5 });
  ctx.fillStyle = '#fff'; ctx.fillRect(-22, -6, 44, 30); txt(ctx, 'NH3', 0, 10, 20, '#1E5FA8', { lw: 0 });
}
function stamp(ctx, s, x, y, size, col, u) {
  pop(ctx, u, x, y, -0.12, c => {
    c.font = `700 ${size}px ${F.EN}`; const w = c.measureText(s).width + size * 0.9, h = size * 1.45;
    c.lineWidth = 10; c.strokeStyle = col; c.strokeRect(-w / 2, -h / 2, w, h);
    txt(c, s, 0, 4, size, col, { lw: 8, stroke: '#fff' });
  });
}
function cross(ctx, x, y, r, col = RED) { line(ctx, [[x - r, y - r], [x + r, y + r]], r * 0.35, col); line(ctx, [[x + r, y - r], [x - r, y + r]], r * 0.35, col); }
function arrowDown(ctx, x, y, s, col) { paint(ctx, c => { c.moveTo(x - 22 * s, y - 40 * s); c.lineTo(x + 22 * s, y - 40 * s); c.lineTo(x + 22 * s, y); c.lineTo(x + 48 * s, y); c.lineTo(x, y + 48 * s); c.lineTo(x - 48 * s, y); c.lineTo(x - 22 * s, y); c.closePath(); }, col, { lw: 6, ol: INK }); }
function dummy(ctx, x, y, s, p) { drawDummyFx(ctx, x, y, s, p); }
function sky(ctx, c0, c1) { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, c0); g.addColorStop(1, c1); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }

// ------------------------------------------------------------ scenes: draw(ctx, t, u) where u = t - scene.t0
const S = {};
S.hook = { cues: [[0, 'boom'], [0.05, 'wind']], draw(ctx, t, u) {
  space(ctx, t, 300);
  jupiter(ctx, 540, 2350 - u * 60, 1250 + u * 120, t);
  speedLines(ctx, t, 18, 'rgba(255,255,255,0.35)');
  const sh = noise1(t * 20) * 6;
  dummy(ctx, 540 + sh, 1460, 1.25, { t, rot: Math.sin(t * 2) * 0.25, legs: 'flail', eyes: 'wide', brow: { l: -1, r: -1 }, armL: [-170, -330 + Math.sin(t * 9) * 30], armR: [170, -330 - Math.sin(t * 9) * 30], mouth: mouth(t, { open: 0.6, o: 1 }), look: [0, 1] });
  const a = 1 + 0.25 * (1 - ease.out(k(u, 0, 0.3))), b = a; // title on screen from frame 0 (cover frame)
  comic(ctx, 'WHAT IF YOU', 540, 330, 104, '#fff', a, -0.04);
  comic(ctx, 'FELL INTO', 540, 450, 104, '#fff', a, 0.03);
  comic(ctx, 'JUPITER?!', 540, 600, 150, YEL, b, -0.05);
} };
S.hook2 = { cues: [[0, 'pop'], [0.4, 'pop']], draw(ctx, t, u) {
  space(ctx, t, 30);
  jupiter(ctx, 980, 1650, 520, t);
  const L = LN.hook2, dive = k(t, L.t1 - 0.1, 0.5);
  const y = 1250 + ease.in(dive) * 1400;
  dummy(ctx, 470, y, 1.55, { t, eyes: dive > 0 ? 'wide' : 'open', blink: blink(t), mouth: mouth(t, { smile: 0.8 }), armR: t < word('hook2', /So/) ? [150, -420 + Math.sin(t * 12) * 30] : [140, -120], armL: [-130, -40], rot: dive * 0.6, legs: dive > 0 ? 'flail' : 'stand', headTilt: Math.sin(t * 2) * 0.05 });
  tag(ctx, 'CRASH-TEST DUMMY', 540, 360, 54, '#1d1d22', YEL, k(u, 0.1, 0.3), -0.03);
  if (dive > 0) comic(ctx, 'FOR SCIENCE!', 540, 520, 96, YEL, k(t, L.t1 - 0.1, 0.25));
} };
S.gas = { cues: [[0, 'whoosh']], draw(ctx, t, u) {
  space(ctx, t, 120);
  const R = 430 + u * 25; jupiter(ctx, 540, 1180, R, t);
  dummy(ctx, 540, 880 + u * 15, 0.55, { t, legs: 'flail', eyes: 'wide', look: [0, 1], armL: [-160, -300], armR: [160, -300], mouth: mouth(t, { open: 0.4, o: 1 }) });
  const L = LN.gas, g = word('gas', /^ground/);
  comic(ctx, 'NO GROUND?!', 540, 360, 96, RED, k(t, g - 0.1, 0.3), -0.06);
  const hy = word('gas', /^hydrogen/), he = word('gas', /^helium/);
  pop(ctx, k(t, hy - 0.1, 0.3), 330, 1610, 0, c => { paint(c, q => q.arc(0, 0, 105, 0, 7), '#FF8FA3', { lw: 7, ol: INK }); txt(c, 'H', 0, -14, 90, '#fff'); txt(c, '~90%', 0, 56, 38, '#fff'); });
  pop(ctx, k(t, he - 0.1, 0.3), 750, 1610, 0, c => { paint(c, q => q.arc(0, 0, 80, 0, 7), '#8FD3FF', { lw: 7, ol: INK }); txt(c, 'He', 0, -10, 70, '#fff'); txt(c, '~10%', 0, 44, 32, '#fff'); });
} };
S.speed = { cues: [[0, 'wind'], [0.2, 'whoosh']], draw(ctx, t, u) {
  space(ctx, t, 900, '#140F33', '#3A1E5C');
  speedLines(ctx, t, 40);
  const sh = noise1(t * 30) * 8;
  dummy(ctx, 540 + sh, 1250, 1.1, { t, legs: 'flail', eyes: 'wide', brow: { l: -1, r: -1 }, rot: 0.08 * Math.sin(t * 7), armL: [-180, -360], armR: [180, -360], mouth: mouth(t, { open: 0.5, o: 1 }), look: [0, -1] });
  const v = Math.round(60 * ease.out(k(u, 0.2, 2.2)));
  panel(ctx, 240, 250, 600, 190, c => { txt(c, 'SPEED', 300, 50, 40, '#888', { lw: 0 }); txt(c, `${v} KM/S`, 300, 128, 96, RED, { lw: 0 }); });
  const ny = word('speed', /^New/);
  pop(ctx, k(t, ny - 0.1, 0.3), 540, 545, 0, c => {
    paint(c, q => q.roundRect(-430, -70, 860, 140, 30), '#fff', { lw: 7, ol: INK });
    const p = k(t, ny + 0.4, 1.3);
    line(c, [[-250, 0], [250, 0]], 10, '#ddd'); line(c, [[-250, 0], [-250 + 500 * p, 0]], 10, BLUE);
    for (const [x, s] of [[-330, 'NY'], [330, 'LA']]) { paint(c, q => q.arc(x === -330 ? -250 : 250, 0, 16, 0, 7), BLUE, { lw: 5 }); txt(c, s, x, 2, 52, INK, { lw: 0 }); }
    if (p >= 1) txt(c, '~1 MIN!', 0, -42, 40, RED, { lw: 0 });
  });
} };
S.fire = { cues: [[0, 'fire']], draw(ctx, t, u) {
  space(ctx, t, 900, '#2A0E1E', '#7A2412');
  // plasma trail behind (above) the falling dummy
  for (let i = 0; i < 26; i++) { const ph = (t * 3 + hash(i)) % 1; const x = 540 + (hash(i * 3) - 0.5) * 260 * (1 - ph * 0.3), y = 1000 - ph * 1100; ctx.globalAlpha = 0.8 * (1 - ph); paint(ctx, c => c.ellipse(x, y, 90 * (1 - ph * 0.5), 200 * (1 - ph * 0.4), 0, 0, 7), ['#FFE45C', '#FFA62B', '#FF5A1F'][i % 3], { lw: 0 }); }
  ctx.globalAlpha = 1;
  const g = ctx.createRadialGradient(540, 1000, 50, 540, 1000, 520); g.addColorStop(0, 'rgba(255,200,80,0.6)'); g.addColorStop(1, 'rgba(255,90,30,0)'); ctx.fillStyle = g; ctx.fillRect(0, 400, W, 1300);
  const sh = noise1(t * 35) * 12;
  dummy(ctx, 540 + sh, 1180, 1.15, { t, legs: 'flail', glow: clamp(0.4 + u * 0.3), eyes: 'wide', brow: { l: -1, r: -1 }, armL: [-200, -330 + Math.sin(t * 14) * 40], armR: [200, -330 - Math.sin(t * 14) * 40], mouth: mouth(t, { open: 0.7, o: 1 }) });
  TL.lines.find(l => l.scene === 'fire').words.filter(w => /^Hot/.test(w.w)).forEach((w, i) => comic(ctx, 'HOT!', [260, 820, 540][i], [380, 520, 660][i], 120, ['#FFE45C', '#FFA62B', '#fff'][i], k(t, w.t0 - 0.05, 0.25), [-0.2, 0.15, -0.05][i]));
} };
S.cold = { cues: [[0, 'whoosh'], [0.1, 'wind'], [0.3, 'freeze']], draw(ctx, t, u) {
  sky(ctx, '#BFD8E8', '#F2E6CF');
  cloudLayer(ctx, t, 260, ['#FBF6EC', '#D9CFC0'], 3, 10, 1.8);
  const fr = k(u, 0.2, 1.2), shiver = noise1(t * 40) * 7 * fr;
  const am = word('cold', /^ammonia/), toilet = word('cold', /^Toilet/);
  const nose = t > toilet - 0.1;
  dummy(ctx, 540 + shiver, 1200, 1.15, { t, legs: 'tuck', frost: fr * 0.9, eyes: nose ? 'shut' : 'wide', blink: nose ? 0 : blink(t), brow: { l: -0.6, r: -0.6 }, armL: nose ? [-30, -470] : [60, -170], armR: [180, -260], holdR: t > am ? sprayBottle : null, mouth: mouth(t, { open: 0.2, teeth: 1, smile: -0.2 }) });
  thermo(ctx, 150, 380, 520, 0.08 + 0.4 * (1 - fr), '-145°C', BLUE);
  if (t > am - 0.1) tag(ctx, 'AMMONIA (NH3)', 640, 380, 54, '#fff', INK, k(t, am - 0.1, 0.3), 0.04);
  comic(ctx, 'EWW!', 830, 560, 110, '#7ED957', k(t, toilet - 0.05, 0.3), 0.15);
  comic(ctx, 'BRRR!', 380, 1590, 90, BLUE, k(u, 0.6, 0.3), -0.1);
} };
S.storm = { cues: [[0, 'whoosh'], [0.1, 'storm'], [1.6, 'boing']], draw(ctx, t, u) {
  ctx.fillStyle = '#7A2412'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.translate(540, 1000); ctx.rotate(-t * 1.6);
  for (let i = 0; i < 9; i++) { ctx.beginPath(); for (let a = 0; a < 9; a += 0.08) { const r = 30 + a * 150; ctx.lineTo(Math.cos(a + i * 0.7) * r, Math.sin(a + i * 0.7) * r * 0.85); } ctx.lineWidth = 70; ctx.strokeStyle = ['#C8553D', '#E0784F', '#A63A28', '#F09A6B'][i % 4]; ctx.globalAlpha = 0.85; ctx.stroke(); }
  ctx.restore(); ctx.globalAlpha = 1;
  dummy(ctx, 540, 1180, 1.0, { t, rot: t * 7, legs: 'tuck', eyes: 'swirl', mouth: mouth(t, { open: 0.5, o: 1 }), armL: [-190, -250], armR: [190, -250] });
  const gr = word('storm', /^Great/), ea = word('storm', /^Earth/);
  tag(ctx, 'THE GREAT RED SPOT', 540, 370, 58, RED, '#fff', k(t, gr - 0.1, 0.3), -0.03);
  pop(ctx, k(t, ea - 0.2, 0.35), 540, 1580, 0, c => {
    paint(c, q => q.roundRect(-400, -120, 800, 240, 30), '#fff', { lw: 7, ol: INK });
    paint(c, q => q.ellipse(110, 0, 220, 88, 0, 0, 7), '#C8553D', { lw: 6, ol: INK }); txt(c, 'STORM', 110, 0, 46, '#fff', { lw: 6 });
    paint(c, q => q.arc(-250, 0, 70, 0, 7), '#3E8EDE', { lw: 6, ol: INK }); paint(c, q => q.ellipse(-268, -14, 28, 20, 0.4, 0, 7), '#5BBF6A', { lw: 0 });
    txt(c, 'EARTH', -250, 96, 34, INK, { lw: 0 });
  });
  comic(ctx, 'WHEEE!', 540, 520, 120, YEL, k(t, word('storm', /^Wheee/) - 0.05, 0.3), 0.1);
} };
S.probe = { cues: [[0, 'whoosh'], ['probeCrush', 'crunch']], draw(ctx, t, u) {
  sky(ctx, '#C98A5A', '#5A2A1A');
  cloudLayer(ctx, t, 140, ['#D9A877', '#B98557'], 8, 8, 1.4);
  const yr = word('probe', /^NASA/), mn = word('probe', /^minutes/), de = word('probe', /^destroyed/);
  const crush = k(t, de - 0.2, 0.35);
  probe(ctx, 560, 1000 + Math.sin(t * 2) * 10, 1.5, 1 - k(t, mn, 0.4), crush);
  if (crush > 0.6) { for (let i = 0; i < 10; i++) { const a = i * 0.63, d = 120 + ease.out(k(t, de, 0.6)) * 220; paint(ctx, c => c.arc(560 + Math.cos(a) * d, 1000 + Math.sin(a) * d, 14, 0, 7), i % 2 ? '#C9542F' : '#999', { lw: 4 }); } }
  tag(ctx, 'NASA GALILEO PROBE', 540, 370, 54, '#1E5FA8', '#fff', k(t, yr - 0.1, 0.3), -0.03);
  tag(ctx, '1995', 540, 480, 54, '#fff', INK, k(t, yr, 0.3), 0.04);
  const mm = Math.min(58, Math.round(58 * k(t, mn - 1.2, 1.2)));
  if (t > mn - 1.4) panel(ctx, 330, 1360, 420, 160, c => { txt(c, `${mm} MIN`, 210, 82, 88, crush > 0.5 ? RED : INK, { lw: 0 }); });
  dummy(ctx, 880, 1650, 0.55, { t, eyes: 'wide', look: [-1, -0.6], mouth: { open: crush > 0.5 ? 0.6 : 0, o: 1 }, armL: [-60, -360], armR: [130, -100], brow: { l: -1, r: -1 } });
  if (crush > 0.5) comic(ctx, 'CRUNCH!', 540, 640, 110, RED, k(t, de, 0.25));
} };
S.press = { cues: [[0, 'whoosh'], [0.5, 'squeeze'], ['elephants', 'thud']], draw(ctx, t, u) {
  sky(ctx, '#6B2A14', '#2A0E08');
  cloudLayer(ctx, t, 60, ['rgba(140,60,30,0.6)', 'rgba(90,30,15,0.6)'], 12, 6, 2);
  const sq = k(u, 0.5, 3.5), el = word('press', /^thousand/);
  dummy(ctx, 380, 1450, 1.0, { t, squash: 1 - sq * 0.4, eyes: sq > 0.7 ? 'x' : 'wide', mouth: mouth(t, { open: 0.3, teeth: 1, smile: -0.3 }), armL: [-200, -150], armR: [200, -150], brow: { l: 1, r: 1 } });
  sodaCan(ctx, 820, 1460, 1.3, k(t, word('press', /^soda/), 0.8));
  const n = 3; for (let i = 0; i < n; i++) { const d = k(t, el - 0.6 + i * 0.25, 0.35); if (d > 0) elephant(ctx, 820 + (i % 2 ? 20 : -20), 1260 - i * 130 - (1 - ease.out(d)) * 900, 1.1, i % 2 ? -1 : 1); }
  if (t > el) tag(ctx, 'x 1000', 820, 660, 70, YEL, INK, k(t, el, 0.3), 0.08);
  // pressure gauge
  pop(ctx, k(u, 0.2, 0.3), 300, 420, 0, c => {
    paint(c, q => q.arc(0, 0, 150, 0, 7), '#fff', { lw: 8, ol: INK });
    for (let i = 0; i <= 8; i++) { const a = Math.PI * 0.8 + i * Math.PI * 1.4 / 8; line(c, [[Math.cos(a) * 110, Math.sin(a) * 110], [Math.cos(a) * 135, Math.sin(a) * 135]], 6, i > 5 ? RED : INK); }
    const a = Math.PI * 0.8 + Math.PI * 1.4 * clamp(sq + noise1(t * 20) * 0.03); line(c, [[0, 0], [Math.cos(a) * 115, Math.sin(a) * 115]], 10, RED);
    paint(c, q => q.arc(0, 0, 14, 0, 7), INK, { lw: 0 }); txt(c, 'PRESSURE', 0, 70, 30, INK, { lw: 0 });
  });
} };
S.metal = { cues: [[0, 'whoosh'], ['metalStart', 'bubble']], draw(ctx, t, u) {
  const hot = k(u, 0, 2);
  sky(ctx, '#3A0A06', hot > 0.5 ? '#FF6A1F' : '#8A2A0E');
  const g = ctx.createRadialGradient(540, 1500, 50, 540, 1500, 1100); g.addColorStop(0, `rgba(255,220,120,${0.7 * hot})`); g.addColorStop(1, 'rgba(255,80,20,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const lm = word('metal', /^liquid/);
  const rise = ease.out(k(t, lm - 0.4, 1.4));
  dummy(ctx, 540, 1150 + rise * 120, 0.95, { t, glow: 0.3 + hot * 0.5, eyes: 'wide', mouth: mouth(t, { open: 0.4, o: 1 }), armL: [-190, -330], armR: [190, -330], legs: 'flail', brow: { l: -1, r: -1 } });
  if (rise > 0) { // liquid metal ocean
    const top = H - rise * 640;
    const mg = ctx.createLinearGradient(0, top, 0, H); mg.addColorStop(0, '#F4F6FA'); mg.addColorStop(0.3, '#A9B2C3'); mg.addColorStop(1, '#4D5566'); ctx.fillStyle = mg;
    ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x <= W; x += 20) ctx.lineTo(x, top + Math.sin(x / 90 + t * 3) * 22 + Math.sin(x / 37 - t * 5) * 8); ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.stroke();
    ctx.globalAlpha = 0.6; ctx.fillStyle = '#fff'; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(hash(i) * W, top + 80 + hash(i + 4) * 300, 70, 10, 0, 0, 7); ctx.fill(); } ctx.globalAlpha = 1;
    tag(ctx, 'LIQUID METAL HYDROGEN', 540, 1700, 50, '#4D5566', '#fff', k(t, lm, 0.3), 0.02);
  }
  const su = word('metal', /^Sun/);
  pop(ctx, k(t, su - 0.3, 0.35), 540, 400, 0, c => {
    paint(c, q => q.roundRect(-420, -120, 840, 240, 30), '#fff', { lw: 7, ol: INK });
    sunIcon(c, -270, 0, 62, t); txt(c, '<', -120, 0, 110, RED, { lw: 0 });
    txt(c, 'DOWN HERE', 120, -28, 64, RED, { lw: 0 }); txt(c, 'UP TO 20,000°C', 120, 42, 46, INK, { lw: 0 });
  });
} };
S.bottom = { cues: [[0, 'whoosh'], ['dissolve', 'sparkle']], draw(ctx, t, u) {
  space(ctx, t, 20);
  // cutaway diagram
  const cx = 540, cy = 1020, R = 450;
  jupiter(ctx, cx, cy, R, t, { glow: false });
  ctx.save(); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R + 4, -Math.PI / 2, 0); ctx.closePath(); ctx.clip();
  const layers = [[1, '#E9CDA6'], [0.93, '#C77B4F'], [0.78, '#8E9AAF'], [0.35, '#E36A3A']];
  for (const [f, c] of layers) { ctx.beginPath(); ctx.arc(cx, cy, R * f, 0, 7); ctx.fillStyle = c; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke(); }
  ctx.restore();
  line(ctx, [[cx, cy - R], [cx, cy], [cx + R, cy]], 7, INK);
  const lab = k(u, 0.2, 0.3);
  if (lab > 0) { ctx.globalAlpha = lab; txt(ctx, 'GAS', 1000, 470, 36, '#fff', { align: 'right' }); txt(ctx, 'LIQUID', 1000, 560, 36, '#fff', { align: 'right' }); txt(ctx, 'METAL', 1000, 700, 36, '#fff', { align: 'right' }); ctx.globalAlpha = 1; }
  // "you are here" dot travels down
  const p = ease.inOut(k(u, 0.1, 2.6)); const dy = cy - R * 0.98 + p * R * 0.9, dx = cx + R * 0.32 * (1 - p) + 20;
  paint(ctx, c => c.arc(dx, dy, 22, 0, 7), YEL, { lw: 6 });
  txt(ctx, 'YOU', dx - 90, dy, 42, YEL, { align: 'right' });
  const nb = word('bottom', /^no$/i), be = word('bottom', /^become/);
  stamp(ctx, 'NO BOTTOM', 540, 420, 92, RED, k(t, nb - 0.1, 0.3));
  // dummy dissolving into Jupiter's colours
  const ds = k(t, be - 0.2, 1.4);
  dummy(ctx, 540, 1650, 0.45, { t, fade: ds, eyes: 'happy', mouth: { open: 0.2, smile: 0.6 }, armL: [-120, -40], armR: [120, -40] });
  for (let i = 0; i < 40 * ds; i++) { const a = hash(i) * 7, d = ds * (60 + hash(i + 9) * 260); ctx.globalAlpha = 1 - ds * 0.7; ctx.fillStyle = BANDS[i % BANDS.length]; ctx.beginPath(); ctx.arc(540 + Math.cos(a) * d, 1480 + Math.sin(a) * d - ds * 100, 8 + hash(i) * 8, 0, 7); ctx.fill(); }
  ctx.globalAlpha = 1;
} };
S.rebuilt = { cues: [[0, 'ding'], [0.3, 'drill'], [1.0, 'sparkle']], draw(ctx, t, u) {
  sky(ctx, '#E8F4FF', '#BFD9F2');
  ctx.fillStyle = 'rgba(255,255,255,0.6)'; for (let i = 0; i < 6; i++) ctx.fillRect(i * 200 - 40, 0, 90, 1500);
  ctx.fillStyle = '#7C8AA0'; ctx.fillRect(0, 1500, W, 420); line(ctx, [[0, 1500], [W, 1500]], 8, INK);
  const pp = ease.back(k(u, 0, 0.6));
  dummy(ctx, 540, 1330, 1.15 * pp + 0.01, { t, bandages: 2, eyes: 'happy', mouth: mouth(t, { open: 0.3, smile: 1, teeth: 1 }), rot: Math.sin(t * 5) * 0.06, armL: [-150, -90], armR: [150, -400 + Math.sin(t * 10) * 30], headTilt: Math.sin(t * 3) * 0.1 });
  for (let i = 0; i < 6; i++) { const a = t * 2 + i; const r = 1 - ((t * 1.3 + i * 0.17) % 1); ctx.globalAlpha = r; ctx.fillStyle = YEL; ctx.save(); ctx.translate(540 + Math.cos(a) * 380, 900 + Math.sin(a * 1.3) * 380); ctx.rotate(t); ctx.beginPath(); for (let j = 0; j < 8; j++) { const q = j % 2 ? 8 : 26; ctx.lineTo(Math.cos(j * Math.PI / 4) * q, Math.sin(j * Math.PI / 4) * q); } ctx.fill(); ctx.restore(); }
  ctx.globalAlpha = 1;
  stamp(ctx, 'REBUILT', 540, 380, 100, '#2E9E5B', k(u, 0.4, 0.3));
} };
S.cta = { cues: [[0, 'whoosh'], ['sun', 'pop'], ['bh', 'pop'], ['cm', 'ding']], draw(ctx, t, u) {
  space(ctx, t, 40);
  const su = word('cta', /^Sun/), bh = word('cta', /^black/), cm = word('cta', /^comments/);
  pop(ctx, k(t, su - 0.2, 0.35), 280, 520, -0.05, c => { paint(c, q => q.roundRect(-190, -230, 380, 460, 40), '#2A1F55', { lw: 8, ol: '#FFD23F' }); sunIcon(c, 0, -50, 95, t); txt(c, 'THE SUN', 0, 160, 62, YEL, { maxW: 330 }); });
  pop(ctx, k(t, bh - 0.2, 0.35), 800, 520, 0.05, c => { paint(c, q => q.roundRect(-190, -230, 380, 460, 40), '#2A1F55', { lw: 8, ol: '#B48CFF' }); blackHole(c, 0, -50, 66, t); txt(c, 'BLACK HOLE', 0, 160, 56, '#E0CCFF', { maxW: 330 }); });
  pop(ctx, k(t, su - 0.2, 0.3), 540, 520, 0, c => txt(c, 'OR', 0, 0, 80, '#fff'));
  const look = t < bh ? -1 : 1;
  dummy(ctx, 540, 1480, 1.05, { t, eyes: 'open', blink: blink(t), look: [look, -0.5], mouth: mouth(t, { smile: 0.7 }), armL: t < bh ? [-200, -380] : [-120, -20], armR: t >= bh ? [200, -380] : [120, -20], headTilt: look * 0.12 });
  if (t > cm - 0.2) { const b = 1 + Math.sin(t * 8) * 0.05; pop(ctx, k(t, cm - 0.2, 0.3), 540, 900, 0, c => { c.scale(b, b); tag(c, 'COMMENT YOUR PICK', 0, 0, 58, RED, '#fff'); }); }
} };
// cue marks that need word times
const MARK = { probeCrush: () => word('probe', /^destroyed/) - 0.15, elephants: () => word('press', /^thousand/) - 0.2, metalStart: () => word('metal', /^liquid/) - 0.3, dissolve: () => word('bottom', /^become/) - 0.2, sun: () => word('cta', /^Sun/) - 0.2, bh: () => word('cta', /^black/) - 0.2, cm: () => word('cta', /^comments/) - 0.2 };

// ------------------------------------------------------------ depth HUD (cold → bottom)
const HUD = { cold: ['0 KM', '-145°C'], storm: ['~50 KM', '-100°C'], probe: ['~150 KM', '+150°C'], press: ['~1,000 KM', '+2,000°C'], metal: ['~15,000 KM', '20,000°C'], bottom: ['???', '???'] };
function hud(ctx, t, S0) {
  const h = HUD[S0.id]; if (!h) return;
  paint(ctx, c => c.roundRect(310, 205, 460, 76, 38), 'rgba(20,20,28,0.85)', { lw: 5, ol: YEL }); txt(ctx, 'DEPTH', 400, 244, 32, YEL, { lw: 0 }); txt(ctx, h[0], 600, 244, 44, '#fff', { lw: 0 });
}

// ------------------------------------------------------------ captions (TikTok style, 3 words at a time)
const CHUNKS = []; for (const L of TL.lines) { let cur = []; L.words.forEach((w, i) => { cur.push(w); if (cur.length === 3 || /[.,!?:]$/.test(w.w) || i === L.words.length - 1) { CHUNKS.push({ scene: L.scene, words: cur, t0: cur[0].t0, t1: L.words[i + 1] ? L.words[i + 1].t0 : L.t1 + 0.25 }); cur = []; } }); }
function captions(ctx, t) {
  const c = CHUNKS.find(c => t >= c.t0 - 0.03 && t < c.t1); if (!c || c.scene === 'hook') return;
  const s = 1 + 0.12 * (1 - ease.out(k(t, c.t0, 0.12)));
  ctx.save(); ctx.translate(540, 1290); ctx.scale(s, s); ctx.font = `700 92px ${F.EN}`;
  const parts = c.words.map(w => w.w.toUpperCase()); const sp = 26; const ws = parts.map(p => ctx.measureText(p).width); let tot = ws.reduce((a, b) => a + b, 0) + sp * (parts.length - 1);
  const sc = Math.min(1, 980 / tot); ctx.scale(sc, sc);
  let x = -tot / 2;
  parts.forEach((p, i) => { const w = c.words[i]; const on = t >= w.t0 - 0.02; txt(ctx, p, x + ws[i] / 2, 0, 92, on && t < (c.words[i + 1] ? c.words[i + 1].t0 : c.t1) ? YEL : '#fff', { lw: 22 }); x += ws[i] + sp; });
  ctx.restore();
}

// ------------------------------------------------------------ frame
function sceneAt(t) { let s = TL.scenes[0]; for (const x of TL.scenes) if (t >= x.t0) s = x; return s; }
function frame(ctx, t) {
  const S0 = sceneAt(t), u = t - S0.t0;
  ctx.save();
  const z = 1.06 - 0.06 * ease.out(k(u, 0, 0.35)) + u * 0.006; // punch-in on every cut, slow push
  ctx.translate(540, 960); ctx.scale(z, z); ctx.translate(-540, -960);
  S[S0.id].draw(ctx, t, u);
  ctx.restore();
  if (u < 0.08 && S0.id !== 'hook') { ctx.fillStyle = `rgba(255,255,255,${0.7 * (1 - u / 0.08)})`; ctx.fillRect(0, 0, W, H); }
  hud(ctx, t, S0);
  captions(ctx, t);
}
function cues() {
  const out = [];
  for (const s of TL.scenes) for (const [a, n] of S[s.id].cues || []) out.push({ t: +(typeof a === 'string' ? MARK[a]() : s.t0 + a).toFixed(3), n, scene: s.id });
  fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ T: TL.T, cues: out }, null, 1));
}
async function video(a, b, out) {
  const c = createCanvas(W, H), ctx = c.getContext('2d');
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const f0 = Math.round(a * FPS), f1 = Math.round(b * FPS), T0 = Date.now();
  for (let f = f0; f < f1; f++) {
    frame(ctx, f / FPS);
    const buf = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if ((f - f0) % 150 === 0) process.stderr.write(`[${out}] ${f - f0}/${f1 - f0} ${((Date.now() - T0) / 1000).toFixed(0)}s\n`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
}
function stills(ts, out, s = 0.3) {
  const n = ts.length, cols = Math.min(5, n), rows = Math.ceil(n / cols);
  const sheet = createCanvas(W * s * cols, H * s * rows), sx = sheet.getContext('2d');
  const c = createCanvas(W, H), ctx = c.getContext('2d');
  ts.forEach((t, i) => { frame(ctx, t); const X = (i % cols) * W * s, Y = Math.floor(i / cols) * H * s; sx.drawImage(c, X, Y, W * s, H * s); sx.fillStyle = '#000'; sx.fillRect(X, Y, 80, 28); sx.fillStyle = '#fff'; sx.font = '22px sans-serif'; sx.fillText(t.toFixed(1), X + 6, Y + 22); });
  fs.writeFileSync(out, sheet.toBuffer('image/png'));
}
module.exports = { frame };
if (require.main === module) {
  const [mode, A, B, O] = process.argv.slice(2);
  if (mode === 'video') video(+A, +B, O);
  else if (mode === 'still') stills(A.split(',').map(Number), B, O ? +O : 0.3);
  else if (mode === 'cues') cues();
}
