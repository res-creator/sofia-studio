// "The Pickens: The Smart Fridge" — vertical 1080x1920 test renderer.
// node render.js video out.mp4 | still t1,t2,... out.png
require('../lib/fonts');
const { createCanvas } = require('@napi-rs/canvas');
const { spawn } = require('child_process');
const fs = require('fs');
const T = require('./toon');
const { shape, rrect, ell, stroke, OL } = T;
const TL = JSON.parse(fs.readFileSync(__dirname + '/timeline.json'));
const W = 1080, H = 1920, FPS = TL.fps, FLOOR = 1640;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, u) => a + (b - a) * u;
const eio = u => u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2;
const eback = u => 1 + 2.7 * (u - 1) ** 3 + 1.7 * (u - 1) ** 2;
const I = Object.fromEntries(TL.items.map(i => [i.id, i]));
const itemAt = t => { let c = TL.items[0]; for (const i of TL.items) if (t >= i.t0) c = i; return c; };
const after = (id, t) => t >= I[id].t0;
const prog = (id, t) => clamp((t - I[id].t0) / (I[id].t1 - I[id].t0));

// speaking amplitude for a character at time t
function talk(who, t) {
  const it = TL.items.find(i => i.kind === 'line' && i.who === who && t >= i.t0 && t < i.t1);
  if (!it) return 0;
  const w = it.words.find(w => t >= w.t0 - 0.03 && t < w.t1);
  if (!w) return 0.05;
  return 0.25 + 0.6 * Math.abs(Math.sin((t - w.t0) * 17 + w.t0 * 3));
}
function wordAt(id, re, t) { const it = I[id]; const w = it.words.find(x => re.test(x.w)); return w ? t >= w.t0 : false; }

// ---------- world positions ----------
const EARL_X = 230, ES = 0.8, FRIDGE_X = 640, FS = 0.85, PENNY_X = 955, PS = 0.66;
const SOCKET = [440, 1560];
const FR_SCREEN = [FRIDGE_X + FS * (70 + 130 - 215), FLOOR - FS * (1010 - 165)];

// ---------- background ----------
const bgC = createCanvas(1700, H), bx = bgC.getContext('2d');
(function drawBg(ctx) {
  ctx.translate(300, 0);
  ctx.fillStyle = '#F1C9E0'; ctx.fillRect(-300, 0, 1700, FLOOR);
  // wallpaper stripes
  ctx.fillStyle = '#EBB9D6'; for (let x = -300; x < 1400; x += 90) ctx.fillRect(x, 0, 40, FLOOR);
  // wainscot
  shape(ctx, c => c.rect(-320, 1180, 1740, FLOOR - 1180), '#9C7BC8');
  for (let x = -260; x < 1400; x += 150) shape(ctx, rrect(x, 1230, 110, 340, 12), '#8B69B8', 5);
  stroke(ctx, [[-320, 1180], [1420, 1180]], 10, OL);
  // upper cabinets
  for (const cx of [-260, -20]) { shape(ctx, rrect(cx, 140, 220, 380, 16), '#F7E6B8'); shape(ctx, rrect(cx + 25, 170, 170, 320, 10), '#EBD49C', 5); shape(ctx, ell(cx + 175, 330, 9, 9), '#c9a', 4); }
  // window with moon
  shape(ctx, rrect(250, 160, 330, 380, 14), '#22305E');
  ctx.save(); ctx.beginPath(); rrect(250, 160, 330, 380, 14)(ctx); ctx.clip();
  ctx.fillStyle = '#fff'; for (let i = 0; i < 26; i++) { ctx.globalAlpha = 0.5 + (i % 3) * 0.2; ctx.fillRect(260 + (i * 97) % 310, 170 + (i * 53) % 360, 4, 4); }
  ctx.globalAlpha = 1; shape(ctx, ell(500, 250, 46, 46), '#FFF3B0', 5); shape(ctx, ell(522, 238, 40, 40), '#22305E', 0);
  ctx.restore();
  stroke(ctx, [[415, 160], [415, 540]], 9, OL); stroke(ctx, [[250, 350], [580, 350]], 9, OL);
  shape(ctx, rrect(250, 160, 330, 380, 14), null, 9);
  // curtains
  shape(ctx, c => { c.moveTo(230, 140); c.quadraticCurveTo(300, 330, 250, 560); c.lineTo(225, 560); c.closePath(); }, '#FFD45E', 6);
  shape(ctx, c => { c.moveTo(600, 140); c.quadraticCurveTo(530, 330, 580, 560); c.lineTo(605, 560); c.closePath(); }, '#FFD45E', 6);
  shape(ctx, rrect(215, 130, 400, 22, 10), '#c58b4a', 6);
  // clock (midnight)
  shape(ctx, ell(890, 300, 90, 90), '#FFF7E8', 9); stroke(ctx, [[890, 300], [890, 228]], 10, OL); stroke(ctx, [[890, 300], [893, 245]], 14, OL);
  for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; stroke(ctx, [[890 + Math.cos(a) * 70, 300 + Math.sin(a) * 70], [890 + Math.cos(a) * 80, 300 + Math.sin(a) * 80]], 5, OL); }
  // counter left (behind Earl)
  shape(ctx, rrect(-320, 1240, 740, 410, 6), '#F7E6B8'); shape(ctx, rrect(-330, 1210, 760, 50, 10), '#E7774F');
  for (const dx of [-250, 10, 230]) shape(ctx, rrect(dx, 1300, 160, 290, 10), '#EBD49C', 5);
  // toaster + cookie jar (locked!)
  shape(ctx, rrect(60, 1080, 170, 130, 30), '#C9D6DF'); stroke(ctx, [[90, 1100], [130, 1100]], 10, OL); stroke(ctx, [[150, 1100], [190, 1100]], 10, OL);
  shape(ctx, rrect(-200, 1040, 140, 170, 30), '#C4E0F5'); shape(ctx, rrect(-215, 1020, 170, 40, 14), '#E7774F');
  ctx.font = 'bold 26px FredokaL'; ctx.fillStyle = OL; ctx.textAlign = 'center'; ctx.fillText('COOKIES', -130, 1135);
  // light switch
  shape(ctx, rrect(1010, 1010, 60, 96, 10), '#FFF7E8', 6); shape(ctx, rrect(1030, 1030, 20, 34, 6), '#ddd', 4);
  // socket
  shape(ctx, rrect(SOCKET[0] - 30, SOCKET[1] - 42, 60, 84, 10), '#FFF7E8', 6);
  stroke(ctx, [[SOCKET[0] - 10, SOCKET[1] - 18], [SOCKET[0] - 10, SOCKET[1] - 4]], 6, OL); stroke(ctx, [[SOCKET[0] + 10, SOCKET[1] - 18], [SOCKET[0] + 10, SOCKET[1] - 4]], 6, OL);
  // floor checker in perspective
  ctx.fillStyle = '#F6F0E2'; ctx.fillRect(-300, FLOOR, 1700, H - FLOOR);
  const rows = [FLOOR, 1690, 1755, 1835, 1930];
  for (let r = 0; r < rows.length - 1; r++) {
    for (let k = -14; k < 16; k++) {
      if ((k + r) % 2) continue;
      const vx = 540, top = rows[r], bot = rows[r + 1], tw = 110 * (1 + (top - FLOOR) / 300), bw = 110 * (1 + (bot - FLOOR) / 300);
      ctx.fillStyle = '#5E9ED6'; ctx.beginPath(); ctx.moveTo(vx + k * tw, top); ctx.lineTo(vx + (k + 1) * tw, top); ctx.lineTo(vx + (k + 1) * bw, bot); ctx.lineTo(vx + k * bw, bot); ctx.fill();
    }
  }
  stroke(ctx, [[-320, FLOOR], [1420, FLOOR]], 9, OL);
})(bx);

// ---------- characters state ----------
function earlState(t) {
  const it = itemAt(t), id = it.id, u = prog(id, t);
  const p = { mouth: { open: talk('earl', t), smile: 0.25 }, eyes: { look: [0.4, 0] }, brow: 0 };
  let x = EARL_X, bob = 0;
  const breathe = Math.sin(t * 2.2) * 3;
  bob = breathe;
  // blink
  if ((t % 3.7) < 0.12) p.eyes.shut = true;
  if (!after('e1', t) || id === 'title') return null;
  if (id === 'e1') {
    const w = clamp(u / 0.85); x = lerp(-260, EARL_X, w);
    const ph = t * 6.5;
    if (w < 1) { p.legs = [Math.max(0, Math.sin(ph)) * 40, Math.max(0, -Math.sin(ph)) * 40]; bob = Math.abs(Math.sin(ph)) * 22; }
    p.armR = [150, -560 + 10]; p.armL = [-60, -600]; p.handR = 'open'; p.handRAng = -0.6;
    p.armR = [215, -480]; p.armL = [60, -470];
    p.eyes.look = [Math.sin(t * 2.2) > 0 ? 0.8 : -0.8, 0]; p.eyes.lid = 0.35;
    p.mouth.smile = 0.7; p.brow = 0.4;
  } else if (id === 'wake') { p.eyes = { wide: true, look: [0.8, -0.2] }; p.brow = -1; p.mouth = { open: 0.2, smile: -0.4 }; p.armR = [215, -480]; p.armL = [60, -470]; p.squash = -Math.sin(prog('wake', t) * Math.PI) * 0.6; }
  else if (id === 'f1') { p.eyes.look = [0.8, -0.2]; p.brow = -1; p.mouth.smile = -0.3; p.sweat = wordAt('f1', /four/i, t); }
  else if (id === 'e2') { p.sweat = true; p.mouth.smile = 0.6; p.brow = -1; p.armL = [-40, -760]; p.handL = 'open'; p.eyes.look = [-0.5, -0.3]; }
  else if (id === 'f2') { p.eyes = { wide: true, look: [0.8, 0] }; p.brow = -1; p.mouth = { open: wordAt('f2', /salad/i, t) ? 0.7 : 0.1, smile: -0.6 }; }
  else if (id === 'e3') { p.brow = 1; p.armR = [320, -830]; p.armL = [-320, -830]; p.handR = p.handL = 'fist'; p.mouth.smile = -0.5; bob += Math.abs(Math.sin(t * 9)) * 8; }
  else if (id === 'disguise') { const k = eback(clamp(u / 0.45)); p.disguise = k; p.armR = [170, -680]; p.handR = 'open'; p.eyes.lid = 0.3; p.mouth.smile = 0.8; }
  else if (id === 'e4' || id === 'f3') { p.disguise = 1; p.eyes.lid = 0.35; p.mouth.smile = id === 'f3' ? -0.3 : 0.6; p.armR = [200, -380]; p.armL = [-200, -380]; p.brow = id === 'f3' ? -0.6 : 0.3; }
  else if (id === 'e5') { p.disguise = 1; p.brow = 1; p.armR = [320, -830]; p.armL = [-320, -830]; p.handR = p.handL = 'fist'; p.mouth.smile = -0.6; bob += Math.abs(Math.sin(t * 12)) * 14; }
  else if (id === 'unplug') {
    p.disguise = 0; p.brow = 1; p.eyes.look = [0.6, 0.8];
    const sl = (SOCKET[0] - EARL_X) / ES, sy = (SOCKET[1] - FLOOR) / ES;
    if (u < 0.5) { const k = eio(clamp(u / 0.35)); p.armR = [lerp(200, sl, k), lerp(-380, sy + 30, k)]; p.squash = k * 0.8; p.tilt = 0.15 * k; p.handR = 'fist'; }
    else { const k = eback(clamp((u - 0.5) / 0.2)); p.armR = [lerp(sl, 230, k), lerp(sy + 30, -760, k)]; p.handR = 'fist'; p.mouth = { open: 0.5, smile: 0.8 }; }
  }
  else if (id === 'e6') { p.eyes = { happy: true }; p.mouth.smile = 0.9; p.armR = [70, -470]; p.armL = [-30, -470]; p.handR = p.handL = 'open'; bob += Math.abs(Math.sin(t * 10)) * 6; }
  else if (id === 'f4') { p.eyes = { wide: true, look: [0.9, -0.3] }; p.brow = -1; p.mouth = { open: 0.15, smile: -0.8 }; }
  else if (id === 'e7') { const k = Math.sin(clamp(u / 0.6) * Math.PI); bob += k * 140; p.hairUp = 1; p.eyes = { wide: true, look: [0, 0] }; p.brow = -1; p.armR = [300, -800]; p.armL = [-300, -800]; p.legs = [30 * k, -30 * k]; p.mouth = { open: 0.9 + 0.1 * Math.sin(t * 40), smile: -0.6 }; }
  else if (id === 'lights') { p.eyes = { wide: true, look: [1, 0] }; p.brow = -1; p.armR = [120, -760]; p.armL = [-20, -760]; p.mouth = { open: 0.2, smile: -0.5 }; p.sweat = true; }
  else if (id === 'p1' || id === 'f5' || id === 'icecream') { p.eyes.look = [1, 0]; p.brow = id === 'p1' ? 0.2 : -0.4; p.mouth.smile = id === 'p1' ? 0.1 : -0.4; }
  else if (id === 'e8') { p.eyes = { wide: true, look: [1, 0] }; p.brow = -1; p.armR = [240, -560]; p.armL = [-240, -560]; p.mouth.smile = -0.4; }
  else if (id === 'p2') { p.eyes = { look: [1, 0], lid: 0.45 }; p.brow = 1; p.mouth = { open: 0, smile: -0.7 }; p.armR = [200, -330]; p.armL = [-200, -330]; }
  else if (id === 'e9') { p.mouth = { grit: talk('earl', t) < 0.1, open: talk('earl', t) * 0.6, smile: 0.5 }; p.eyes = { look: [0.8, -0.3], lid: 0.2 }; p.brow = -0.7; p.armR = [70, -500]; p.armL = [10, -500]; p.handR = p.handL = 'fist'; p.sweat = true; }
  else if (id === 'f6') { p.eyes = { look: [0.8, -0.3], wide: wordAt('f6', /salad/i, t) }; p.mouth = { open: 0, smile: 0.9 }; p.armR = [70, -500]; p.armL = [10, -500]; p.handR = p.handL = 'fist'; }
  if (['salad', 'e10', 'end'].includes(id)) {
    const k = id === 'salad' ? eio(clamp(u / 0.5)) : 1;
    p.armR = [130, -430]; p.armL = [-60, -430]; p.handR = p.handL = 'open';
    if (k >= 1) p.holdBoth = (c, hl, hr) => T.salad(c, (hl[0] + hr[0]) / 2, (hl[1] + hr[1]) / 2 - 20, 1);
    p.eyes = id === 'salad' ? { wide: true, look: [0, 0.6] } : { shut: true };
    p.brow = -1;
    if (id !== 'salad') { p.tears = t; p.tilt = -0.08; p.mouth = { open: 0.35 + talk('earl', t) * 0.6, smile: -0.9, teeth: false }; bob -= 20; p.squash = 0.4; }
  }
  return { x, bob, p };
}
function pennyState(t) {
  if (!after('lights', t)) return null;
  const it = itemAt(t), id = it.id, u = prog(id, t);
  const p = { mouth: { open: talk('penny', t), smile: 0.6 }, eyes: { look: [0.5, 0] } };
  let x = PENNY_X, bob = 0;
  if ((t % 4.1) < 0.12) p.eyes.shut = true;
  if (id === 'lights') {
    const w = clamp((u - 0.25) / 0.7); x = lerp(1300, PENNY_X, eio(w));
    if (w > 0 && w < 1) { const ph = t * 9; p.legs = [Math.sin(ph) * 22, -Math.sin(ph) * 22]; bob = Math.abs(Math.sin(ph)) * 12; }
  }
  if (id === 'p1') { p.eyes.look = [0.6, -0.5]; p.tilt = 0.08; }
  const hasIce = t >= I.icecream.t0 + I.icecream.t1 * 0 + (I.icecream.t1 - I.icecream.t0) * 0.7;
  if (hasIce) { p.armR = [70, -300]; p.holdR = c => T.iceCream(c, 1, (id === 'p2' || id === 'e9') ? Math.abs(Math.sin(t * 4)) : 0); }
  if (id === 'p2') { p.smug = true; p.eyes = { look: [-0.5, 0], lid: 0.4 }; }
  if (['e8', 'e9', 'f6', 'salad', 'e10'].includes(id)) p.eyes.look = [-0.4, 0];
  if (id === 'e10' || id === 'end') { p.eyes = { happy: true }; }
  return { x, bob, p };
}
function fridgeState(t) {
  const it = itemAt(t), id = it.id, u = prog(id, t);
  const p = { mode: 'face', mood: 'eyes', talk: talk('fridge', t), blink: (t % 3.1) < 0.12 };
  if (!after('wake', t)) p.mode = 'off';
  if (id === 'wake') { if (u < 0.3) p.mode = 'off'; else if (u < 0.45) p.mode = (Math.floor(t * 30) % 2) ? 'off' : 'face'; }
  if (id === 'f1') { p.mood = 'happy'; if (wordAt('f1', /four/i, t)) p.mode = 'sandwich'; }
  if (id === 'f2') { p.mode = 'text'; p.text = 'ACCESS\nDENIED'; p.col = '#ff4d5e'; p.size = 50; if (wordAt('f2', /salad/i, t)) { p.mode = 'salad'; p.col = '#7CFF8A'; } }
  if (id === 'e3' || id === 'e2') p.mood = 'flat';
  if (id === 'f3' || id === 'e5' || id === 'e4' || id === 'disguise') p.mood = id === 'disguise' ? 'eyes' : 'flat';
  if (id === 'unplug') { p.mood = 'angry'; p.col = '#5ff0ff'; if (u > 0.55) p.mode = 'off'; }
  if (id === 'e6') p.mode = 'off';
  if (id === 'f4') { p.mode = u < 0.15 ? ((Math.floor(t * 30) % 2) ? 'off' : 'battery') : 'battery'; p.col = '#ff4d5e'; if (u > 0.9) { p.mode = 'face'; p.mood = 'angry'; } }
  if (id === 'e7') { p.mode = 'face'; p.mood = 'angry'; p.col = '#ff4d5e'; }
  if (['lights', 'p1', 'f5', 'icecream', 'e8', 'p2', 'e9', 'f6', 'salad', 'e10', 'end'].includes(id)) { p.mood = 'happy'; if (id === 'lights') p.mood = 'eyes'; }
  if (id === 'icecream') p.door = Math.sin(u * Math.PI);
  if (id === 'salad') p.door = Math.sin(clamp(u / 0.6) * Math.PI);
  return p;
}

// ---------- camera ----------
const SHOT = {
  wide: [545, 1110, 1.2],
  two: [430, 1180, 1.45],
  earl: [EARL_X + 40, 1080, 2.0],
  fridge: [FR_SCREEN[0], FR_SCREEN[1] + 70, 2.3],
  penny: [PENNY_X - 70, 1330, 2.1],
  ep: [690, 1195, 1.35],
};
const SHOTS = { e1: 'wide', wake: 'two', f1: 'fridge', e2: 'earl', f2: 'fridge', e3: 'earl', disguise: 'earl', e4: 'earl', f3: 'fridge', e5: 'earl', unplug: 'two', e6: 'wide', f4: 'fridge', e7: 'earl', lights: 'wide', p1: 'penny', f5: 'fridge', icecream: 'ep', e8: 'earl', p2: 'penny', e9: 'earl', f6: 'fridge', salad: 'two', e10: 'wide', end: 'wide' };
function camera(t) {
  const it = itemAt(t), s = SHOT[SHOTS[it.id] || 'wide'];
  let [cx, cy, z] = s;
  const u = clamp((t - it.t0) / Math.max(1, it.t1 - it.t0));
  z *= 1 + 0.04 * u; // slow push-in
  if (it.id === 'e10') { z = lerp(1.6, 1.2, eio(clamp((t - it.t0) / 2.2))); cx = lerp(EARL_X + 40, 545, eio(clamp((t - it.t0) / 2.2))); cy = lerp(1150, 1110, eio(clamp((t - it.t0) / 2.2))); }
  let sx = 0, sy = 0;
  if (['e5', 'e7'].includes(it.id) || (it.id === 'unplug' && u > 0.5 && u < 0.7)) { sx = Math.sin(t * 61) * 12; sy = Math.cos(t * 47) * 10; }
  return { cx, cy, z, sx, sy };
}

// ---------- scene ----------
function drawWorld(ctx, t) {
  ctx.drawImage(bgC, -300, 0);
  const fp = fridgeState(t);
  // power cable
  const plugged = !after('unplug', t) || prog('unplug', t) < 0.55;
  const fxL = FRIDGE_X - FS * 215;
  if (plugged) { stroke(ctx, [[fxL + 10, 1600], [SOCKET[0] + 20, 1610], [SOCKET[0], SOCKET[1] + 10]], 9, OL); shape(ctx, rrect(SOCKET[0] - 18, SOCKET[1] - 20, 36, 34, 6), '#555', 5); }
  else {
    const k = after('lights', t) ? 1 : eio(clamp((t - I.unplug.t0 - 0.55 * (I.unplug.t1 - I.unplug.t0)) / 0.3));
    const px = lerp(SOCKET[0], 330, k), py = lerp(SOCKET[1], FLOOR - 10, k);
    stroke(ctx, [[fxL + 10, 1600], [lerp(SOCKET[0], 380, k), 1615], [px, py]], 9, OL); shape(ctx, rrect(px - 18, py - 20, 36, 34, 6), '#555', 5);
  }
  ctx.save(); ctx.translate(FRIDGE_X, FLOOR); ctx.scale(FS, FS); T.drawFridge(ctx, 0, 0, fp, t); ctx.restore();
  // flying ice cream / salad
  if (itemAt(t).id === 'icecream') { const u = prog('icecream', t); if (u > 0.3 && u < 0.72) { const k = (u - 0.3) / 0.42; const x = lerp(FRIDGE_X + 80, PENNY_X - 40, k), y = lerp(1250, 1300, k) - Math.sin(k * Math.PI) * 220; ctx.save(); ctx.translate(x, y); ctx.rotate(k * 6.28); T.iceCream(ctx, 0.7); ctx.restore(); } }
  if (itemAt(t).id === 'salad') { const u = prog('salad', t); if (u > 0.15 && u < 0.5) { const k = (u - 0.15) / 0.35; const x = lerp(FRIDGE_X - 60, EARL_X + 30, k), y = lerp(1250, 1300, k) - Math.sin(k * Math.PI) * 260; T.salad(ctx, x, y, 0.8); } }
  const e = earlState(t);
  if (e) T.drawEarl(ctx, e.x, FLOOR - e.bob * ES * 0 - e.bob, ES, e.p);
  const pn = pennyState(t);
  if (pn) T.drawPenny(ctx, pn.x, FLOOR - pn.bob, PS, pn.p);
  return e;
}
function lighting(ctx, t, e) {
  const id = itemAt(t).id;
  const dark = after('unplug', t) && (!after('lights', t) || prog('lights', t) < 0.12) && !(id === 'unplug' && prog('unplug', t) < 0.58);
  const flick = id === 'lights' && prog('lights', t) >= 0.12 && prog('lights', t) < 0.25 && (Math.floor(t * 20) % 2 === 0);
  if (!after('unplug', t) || (id === 'unplug' && prog('unplug', t) < 0.58)) {
    // night: blue tint + fridge glow
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = '#b4c0f0'; ctx.fillRect(-400, 0, 1900, H); ctx.restore();
    if (after('wake', t) && prog('wake', t) > 0.3) { const g = ctx.createRadialGradient(FR_SCREEN[0], FR_SCREEN[1], 20, FR_SCREEN[0], FR_SCREEN[1], 700); g.addColorStop(0, 'rgba(120,240,255,0.35)'); g.addColorStop(1, 'rgba(120,240,255,0)'); ctx.fillStyle = g; ctx.fillRect(-400, 0, 1900, H); }
  } else if (dark || flick) {
    const red = ['f4', 'e7'].includes(id) || (id === 'lights' && !flick);
    ctx.fillStyle = red ? (id === 'e7' ? 'rgba(20,5,10,0.5)' : 'rgba(20,5,10,0.72)') : 'rgba(5,5,15,0.93)'; ctx.fillRect(-400, 0, 1900, H);
    if (red) { const g = ctx.createRadialGradient(FR_SCREEN[0], FR_SCREEN[1], 20, FR_SCREEN[0], FR_SCREEN[1], 750); g.addColorStop(0, 'rgba(255,60,80,0.45)'); g.addColorStop(1, 'rgba(255,60,80,0)'); ctx.fillStyle = g; ctx.fillRect(-400, 0, 1900, H);
      // redraw glowing screen
      const sx = FRIDGE_X + FS * (70 - 215), sy = FLOOR - FS * (1010 - 70);
      ctx.save(); ctx.beginPath(); ctx.rect(sx, sy, 260 * FS, 190 * FS); ctx.clip(); ctx.translate(FRIDGE_X, FLOOR); ctx.scale(FS, FS); T.drawFridge(ctx, 0, 0, fridgeState(t), t); ctx.restore(); }
    // Earl's eyes in the dark
    if (e && !red) {
      const ex = e.x, ey = FLOOR - e.bob - 640 * ES;
      for (const [dx, dy] of [[18, -205], [98, -208]]) {
        const X = ex + dx * ES, Y = ey + dy * ES;
        if (e.p.eyes && e.p.eyes.happy) { ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(X, Y + 10, 26, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); ctx.restore(); }
        else { shape(ctx, ell(X, Y, 35, 35), '#fff', 0); shape(ctx, ell(X + 8, Y, 9, 9), '#000', 0); }
      }
    }
  }
}
// ---------- title / end cards ----------
function card(ctx, t, title, sub, a) {
  ctx.save(); ctx.globalAlpha = a;
  ctx.fillStyle = '#5B3FA8'; ctx.fillRect(0, 0, W, H);
  ctx.translate(W / 2, H * 0.45); ctx.rotate(t * 0.25);
  ctx.fillStyle = '#6E52C0'; for (let k = 0; k < 16; k++) { ctx.rotate(Math.PI / 8); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(1500, -150); ctx.lineTo(1500, 150); ctx.closePath(); if (k % 2) ctx.fill(); }
  ctx.restore(); ctx.save(); ctx.globalAlpha = a;
  const pop = eback(clamp((t - (title === 'THE END' ? I.end.t0 : 0)) / 0.5));
  ctx.translate(W / 2, H * 0.43); ctx.scale(pop, pop); ctx.rotate(-0.06);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = 'bold 74px FredokaL'; ctx.lineWidth = 18; ctx.strokeStyle = OL; ctx.lineJoin = 'round';
  if (title !== 'THE END') { ctx.strokeText('THE', 0, -150); ctx.fillStyle = '#fff'; ctx.fillText('THE', 0, -150); }
  ctx.font = 'bold 190px FredokaL'; ctx.lineWidth = 26; ctx.strokeText(title === 'THE END' ? 'THE END' : 'PICKENS', 0, 0);
  ctx.fillStyle = '#FFD93B'; ctx.fillText(title === 'THE END' ? 'THE END' : 'PICKENS', 0, 0);
  ctx.font = 'bold 66px FredokaL'; ctx.lineWidth = 16; ctx.strokeText(sub, 0, 170); ctx.fillStyle = '#7CF0E0'; ctx.fillText(sub, 0, 170);
  ctx.restore();
}
// ---------- captions ----------
function captions(ctx, t) {
  const it = TL.items.find(i => i.kind === 'line' && t >= i.t0 && t < i.t1 + 0.1);
  if (!it || !it.words.length) return;
  // chunks of max 4 words
  const ch = []; let cur = [];
  it.words.forEach((w, i) => { cur.push(w); if (cur.length >= 3 || /[.!?,]$/.test(w.w) && cur.length >= 2 || i === it.words.length - 1) { ch.push(cur); cur = []; } });
  let c = ch[0]; for (const k of ch) if (t >= k[0].t0 - 0.05) c = k;
  ctx.save(); ctx.textBaseline = 'middle'; ctx.font = 'bold 76px FredokaL'; ctx.lineJoin = 'round';
  const sp = 22, ws = c.map(w => ctx.measureText(w.w.toUpperCase()).width), tot = ws.reduce((a, b) => a + b, 0) + sp * (c.length - 1);
  let x = W / 2 - tot / 2; const y = 1330;
  const k0 = clamp((t - c[0].t0 + 0.05) / 0.12), s = (0.85 + 0.15 * eback(k0)) * Math.min(1, 980 / tot);
  ctx.translate(W / 2, y); ctx.scale(s, s); ctx.translate(-W / 2, -y);
  c.forEach((w, i) => {
    const txt = w.w.toUpperCase(), on = t >= w.t0 && t < w.t1 + 0.15;
    ctx.lineWidth = 16; ctx.strokeStyle = OL; ctx.strokeText(txt, x, y);
    ctx.fillStyle = on ? '#FFD93B' : '#fff'; ctx.fillText(txt, x, y);
    x += ws[i] + sp;
  });
  ctx.restore();
}

function frame(ctx, t) {
  const id = itemAt(t).id;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  if (id !== 'title') {
    const c = camera(t);
    ctx.save(); ctx.translate(W / 2 + c.sx, H / 2 + c.sy); ctx.scale(c.z, c.z); ctx.translate(-c.cx, -c.cy);
    const e = drawWorld(ctx, t); lighting(ctx, t, e);
    ctx.restore();
    captions(ctx, t);
  }
  if (id === 'title') card(ctx, t, 'PICKENS', 'in "THE SMART FRIDGE"', 1 - clamp((t - (I.title.t1 - 0.25)) / 0.25));
  if (id === 'end') card(ctx, t, 'THE END', 'Earl 0  •  Fridge 1', clamp((t - I.end.t0 - 1.2) / 0.3));
}

const [, , mode, a1, a2] = process.argv;
const cv = createCanvas(W, H), ctx = cv.getContext('2d');
if (mode === 'still') {
  const ts = a1.split(',').map(Number), sc = 0.3, cols = Math.min(ts.length, 5), rows = Math.ceil(ts.length / cols);
  const out = createCanvas(W * sc * cols, H * sc * rows), o = out.getContext('2d');
  ts.forEach((t, i) => { frame(ctx, t); o.drawImage(cv, (i % cols) * W * sc, Math.floor(i / cols) * H * sc, W * sc, H * sc); o.fillStyle = '#fff'; o.font = '28px FredokaL'; o.fillText(t + 's ' + itemAt(t).id, (i % cols) * W * sc + 10, Math.floor(i / cols) * H * sc + 30); });
  fs.writeFileSync(a2, out.toBuffer('image/png'));
} else if (mode === 'video') {
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', a1], { stdio: ['pipe', 'inherit', 'inherit'] });
  const N = Math.ceil(TL.dur * FPS);
  (async () => {
    for (let f = 0; f < N; f++) {
      frame(ctx, f / FPS);
      const buf = cv.data ? cv.data() : ctx.getImageData(0, 0, W, H).data;
      if (!ff.stdin.write(Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength))) await new Promise(r => ff.stdin.once('drain', r));
      if (f % 300 === 0) console.error('frame', f, '/', N);
    }
    ff.stdin.end();
  })();
}
