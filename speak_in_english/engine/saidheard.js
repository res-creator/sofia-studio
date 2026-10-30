// "Said / Heard: dinner with his parents" renderer (hard_cut camera): node saidheard.js start end out.mp4 | node saidheard.js 0 0 --png=f1,f2
// One dining room. What the parents imagine is drawn as full-screen inserts (cloth factory, chef chaos, chocolate factory)
// or as a grade over the room (the sad Dickens movie). Hat from the chef-chaos insert lands on Frank and stays on.
process.env.LAYOUT = process.env.LAYOUT || 'v1';   // shots are directed by hand below, no camera assist
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, rr, createCanvas } = Hq;
// Hq.paint hands the callback a pen (m/l/b/q/e/a/z); wrap it so shapes can be written with canvas-style calls (arc, ellipse, roundRect, ...)
const adapt = q => ({ beginPath() {}, moveTo: q.m, lineTo: q.l, quadraticCurveTo: q.q, bezierCurveTo: q.b, closePath: q.z, arc: (x, y, r, a0 = 0, a1 = Math.PI * 2, ccw) => q.a(x, y, r, a0, a1, ccw), ellipse: (x, y, rx, ry, rot = 0, a0 = 0, a1 = Math.PI * 2, ccw) => q.e(x, y, rx, ry, rot, a0, a1, ccw),
  roundRect(x, y, w, h, r) { q.m(x + r, y); q.l(x + w - r, y); q.q(x + w, y, x + w, y + r); q.l(x + w, y + h - r); q.q(x + w, y + h, x + w - r, y + h); q.l(x + r, y + h); q.q(x, y + h, x, y + h - r); q.l(x, y + r); q.q(x, y, x + r, y); q.z(); } });
const paint = (ctx, fn, base, o) => Hq.paint(ctx, q => { const a = adapt(q); fn(Object.assign(a, { m: q.m, l: q.l, b: q.b, q: q.q, e: q.e, a: q.a, z: q.z })); }, base, o);
const TL = JSON.parse(fs.readFileSync('eps/saidheard/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const fitTxt = (c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') => { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); };

// ---------------- cast
const DASHA = { ...BASE.her_dinner };
const FRANK = { ...BASE.greg, top: { type: 'sweater', col: '#8A6F4E' } };
const LINDA = { ...BASE.linda };
const MIKE = { ...BASE.tom, top: { type: 'sweater', col: '#C2504A' } };
const CHEF = { ...BASE.greg, seed: 21, skin: '#E58A78', top: { type: 'coat', col: '#FFFFFF', col2: '#E8E8EE' } };   // the chef in their heads / the real boss
const G = { dasha: geom(DASHA), frank: geom(FRANK), mom: geom(LINDA), son: geom(MIKE), chef: geom(CHEF) };
const SEAT = 250, TT = -470;                                   // seated feet y, table-top edge y
const X = { dasha: -560, frank: 0, mom: 560, son: 1040 };
const hang = (g, s) => reach(g, s, s * g.sw * 0.8, g.ySh + 480);
const chest = (g, s, k = 0.6) => reach(g, s, s * g.sw * k, g.ySh + 230);
const gest = (st, g, who, t, side, base) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } };

// ---------------- props
function toque(c, x, y, hh, tall = 1) { c.save(); c.translate(x, y - hh * 0.78); const w = hh * 0.82;
  paint(c, q => rr(q, -w, -hh * 0.1, 2 * w, hh * 0.42, 8), '#FFFFFF', { shade: '#DCDCE6', sx: 5, sy: 5, lw: 5 });
  for (const [dx, dy, r] of [[-w * 0.55, -hh * 0.5 * tall, hh * 0.52], [w * 0.55, -hh * 0.5 * tall, hh * 0.52], [0, -hh * 0.85 * tall, hh * 0.62], [-w * 0.2, -hh * 0.3 * tall, hh * 0.5], [w * 0.2, -hh * 0.3 * tall, hh * 0.5]]) paint(c, q => q.arc(dx, dy, r, 0, TAU), '#FFFFFF', { shade: '#E4E4EE', sx: 4, sy: 4, lw: 5 });
  c.restore(); }
function giftBox(c, x, y, open, glow) { c.save(); c.translate(x, y);
  if (glow > 0) { const g = c.createRadialGradient(0, -90, 20, 0, -90, 360); g.addColorStop(0, `rgba(255,214,120,${0.7 * glow})`); g.addColorStop(1, 'rgba(255,214,120,0)'); c.fillStyle = g; c.fillRect(-400, -460, 800, 700); }
  paint(c, q => rr(q, -130, -150, 260, 150, 12), '#E0474C', { shade: '#B03038', sx: 8, sy: 8, lw: 6 });
  c.fillStyle = '#F2C14E'; c.fillRect(-18, -150, 36, 150);
  if (!open) { paint(c, q => rr(q, -146, -190, 292, 52, 10), '#E0474C', { shade: '#B03038', sx: 8, sy: 6, lw: 6 }); c.fillStyle = '#F2C14E'; c.fillRect(-18, -190, 36, 52);
    for (const s of [-1, 1]) { c.save(); c.translate(s * 50, -214); c.rotate(s * 0.5); paint(c, q => q.ellipse(0, 0, 56, 30, 0, 0, TAU), '#F2C14E', { lw: 5 }); c.restore(); } }
  else { c.save(); c.translate(150, -60); c.rotate(0.5); paint(c, q => rr(q, -146, -26, 292, 52, 10), '#E0474C', { shade: '#B03038', sx: 6, sy: 4, lw: 6 }); c.restore();
    for (const [dx, dy] of [[-80, -170], [-30, -190], [30, -176], [80, -166], [0, -150], [-50, -150]]) paint(c, q => q.arc(dx, dy, 32, 0, TAU), '#5A3420', { shade: '#3E2314', sx: 4, sy: 4, lw: 5 }); }
  c.restore(); }
function plate(c, x, y, food) { paint(c, q => q.ellipse(x, y, 190, 40, 0, 0, TAU), '#FFFDF8', { shade: '#DCD4C0', sx: 6, sy: 8, lw: 5 }); c.fillStyle = '#EADFC8'; c.beginPath(); c.ellipse(x, y - 2, 120, 24, 0, 0, TAU); c.fill(); if (food) food(c, x, y); }
const roast = (c, x, y) => { paint(c, q => q.ellipse(x, y - 34, 90, 46, 0, 0, TAU), '#9A5A32', { shade: '#6A3A1E', sx: 6, sy: 6, lw: 5 }); for (const dx of [-60, 0, 60]) paint(c, q => q.arc(x + dx, y - 6, 22, 0, TAU), '#E9A23B', { lw: 4 }); };
const potato = (c, x, y) => paint(c, q => q.ellipse(x, y - 22, 46, 30, 0.2, 0, TAU), '#B58A55', { shade: '#7A5A30', sx: 4, sy: 4, lw: 5 });

// ---------------- dining room (prerendered, softly blurred)
const BX0 = -2400, BY0 = -3400, BW = 4800, BH = 4800, BS = 0.5;
function drawRoom(c) {
  const g = c.createLinearGradient(0, BY0, 0, 300); g.addColorStop(0, '#D9B98C'); g.addColorStop(1, '#EBCFA6'); c.fillStyle = g; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = 'rgba(160,70,60,.10)'; for (let x = BX0; x < BX0 + BW; x += 150) c.fillRect(x, BY0, 70, 3700);             // wallpaper stripes
  c.fillStyle = '#8A5A3A'; c.fillRect(BX0, -380, BW, 80); c.fillStyle = '#B88660'; c.fillRect(BX0, -300, BW, 650);              // wainscot
  c.fillStyle = '#7A4E30'; c.fillRect(BX0, 300, BW, 1100); c.strokeStyle = 'rgba(0,0,0,.14)'; c.lineWidth = 5; for (let x = BX0; x < BX0 + BW; x += 260) { c.beginPath(); c.moveTo(x, 300); c.lineTo(x - 120, 1400); c.stroke(); }
  c.fillStyle = '#9C3F4A'; rr(c, -1300, 330, 3200, 900, 30); c.fill();                                                          // rug
  // window with curtains
  c.fillStyle = '#6A4A30'; rr(c, -1750, -2900, 760, 1450, 20); c.fill(); const sk = c.createLinearGradient(0, -2860, 0, -1500); sk.addColorStop(0, '#2B3A6E'); sk.addColorStop(1, '#6A8CC8'); c.fillStyle = sk; c.fillRect(-1720, -2870, 700, 1390);
  c.fillStyle = '#FFFDF8'; for (const [x, y, r] of [[-1600, -2700, 6], [-1480, -2600, 5], [-1350, -2760, 7], [-1180, -2650, 5]]) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
  c.fillStyle = '#6A4A30'; c.fillRect(-1390, -2870, 16, 1390); c.fillRect(-1720, -2200, 700, 16);
  for (const s of [-1, 1]) { c.fillStyle = '#3FA7A0'; c.beginPath(); c.moveTo(s < 0 ? -1790 : -930, -2950); c.lineTo(s < 0 ? -1500 : -1220, -2950); c.quadraticCurveTo(s < 0 ? -1560 : -1160, -2200, s < 0 ? -1700 : -1020, -1400); c.lineTo(s < 0 ? -1820 : -900, -1400); c.closePath(); c.fill(); }
  // pictures, shelf, chandelier
  for (const [x, y, w, h, col] of [[-350, -2750, 420, 520, '#C8A86A'], [420, -2800, 520, 380, '#7FB0D8'], [1250, -2700, 380, 500, '#B9A2E6']]) { c.fillStyle = '#5A3A22'; rr(c, x - w / 2 - 22, y - 22, w + 44, h + 44, 10); c.fill(); c.fillStyle = col; c.fillRect(x - w / 2, y, w, h); c.fillStyle = 'rgba(255,255,255,.3)'; c.beginPath(); c.arc(x, y + h * 0.4, w * 0.18, 0, TAU); c.fill(); c.fillStyle = 'rgba(0,0,0,.16)'; c.beginPath(); c.moveTo(x - w / 2, y + h); c.quadraticCurveTo(x, y + h * 0.5, x + w / 2, y + h); c.fill(); }
  c.fillStyle = '#5A3A22'; rr(c, 1500, -1500, 800, 120, 14); c.fill(); c.fillRect(1560, -1400, 40, 1100); c.fillRect(2200, -1400, 40, 1100);
  c.strokeStyle = '#3A2A1A'; c.lineWidth = 12; c.beginPath(); c.moveTo(300, BY0); c.lineTo(300, -3150); c.stroke(); c.fillStyle = '#F2C14E'; c.beginPath(); c.ellipse(300, -3120, 360, 70, 0, 0, TAU); c.fill();
  for (let i = -3; i <= 3; i++) { c.fillStyle = '#FFF4C2'; c.beginPath(); c.arc(300 + i * 100, -3170, 22, 0, TAU); c.fill(); }
  // chairs (backs)
  for (const x of [X.dasha, X.frank, X.mom]) { c.fillStyle = '#5A3A22'; rr(c, x - 250, -1000, 500, 1050, 40); c.fill(); c.fillStyle = '#7A4E30'; rr(c, x - 220, -970, 440, 990, 30); c.fill(); }
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BG = mkBG(drawRoom);

// ---------------- phases
const dickens = t => P(t, ev('S3', 'dick0'), ev('S3', 'dick0') + 0.4) * (1 - P(t, ev('S4', 'warm'), ev('S4', 'warm') + 0.5));
const hatOn = t => t >= ev('S2', 'chaos1') + 0.05;
const boxOpen = t => t >= ev('S5', 'choc0') - 0.2;
const chaosW = t => t >= ev('S2', 'chaos0') && t < ev('S2', 'chaos1');
const chocW = t => t >= ev('S5', 'choc0') && t < ev('S5', 'choc1');
const mikeIn = t => t >= ev('S4', 'mike');

// ---------------- characters
function dashaState(t, L) { const g = G.dasha, st = { t, talk: talk('dasha', t), mood: 'happy', turn: 0.3, look: 0.5, armL: hang(g, -1), armR: hang(g, 1), items: {} };
  gest(st, g, 'dasha', t, 1, 120);
  if (L === 'S3') { st.mood = 'happy'; if (speaking('s3_d', t, 0, 0.1)) st.armL = reach(g, -1, -g.sw * 0.25, g.ySh + 150, { planar: true }); if (t > endOf('s3_d') + 0.3) { st.mood = 'worried'; st.armL = hang(g, -1); st.lookY = 0.1; } }
  if (L === 'S4') { st.mood = t > ev('S4', 'warm') ? 'happy' : 'worried'; }
  if (L === 'S5') { st.mood = 'happy'; if (t > SP.s5_f.t + 0.2 && t < SP.s5_d.t) st.mood = 'smug'; }
  if (L === 'S6') { st.mood = 'happy'; if (speaking('s6_d', t, 0.1, 0.9)) { st.mood = 'neutral'; st.blink = 0; st.turn = 0; st.look = 0; } }
  if (L === 'hook') { st.mood = 'happy'; }
  return st; }
function frankState(t, L) { const g = G.frank, st = { t, talk: talk('frank', t), mood: 'neutral', turn: -0.2, look: -0.4, armL: hang(g, -1), armR: hang(g, 1), items: {} };
  if (L === 'hook') { st.mood = 'shock'; st.blink = 0; }
  if (L === 'S1') { st.mood = speaking('s1_l', t, 0, 3) ? 'worried' : 'neutral'; }
  if (L === 'S2') { st.mood = t > ev('S2', 'chaos1') ? 'worried' : 'neutral'; }
  if (L === 'S3') { st.mood = 'sad'; }
  if (L === 'S4') { st.mood = 'worried'; if (t > ev('S4', 'fix3')) { st.mood = 'happy'; st.laugh = true; } }
  if (L === 'S5') { st.mood = 'happy'; }
  if (L === 'S6') { st.mood = 'happy'; st.laugh = speaking('s6_f', t, 0, 1); if (speaking('s6_f', t, 0.3, 1.2)) st.armR = reach(g, 1, g.sw * 1.1, g.ySh - 140, { planar: true }); }
  return st; }
function momState(t, L) { const g = G.mom, st = { t, talk: talk('mom', t), mood: 'happy', turn: -0.35, look: -0.7, armL: hang(g, -1), armR: hang(g, 1), items: {} };
  if (L === 'hook' || L === 'S1') { st.mood = speaking('s1_d', t, 0, 2) ? 'worried' : 'happy'; }
  if (L === 'S2') { st.mood = t > ev('S2', 'chaos1') ? 'worried' : 'happy'; st.armR = chest(g, 1); }
  if (L === 'S3') { st.mood = 'sad'; st.blink = 0.3; st.armR = chest(g, 1); st.armL = chest(g, -1); }
  if (L === 'S4') { st.mood = t > ev('S4', 'fix3') ? 'happy' : 'sad'; if (t > ev('S4', 'fix3')) st.laugh = true; }
  if (L === 'S5') { st.mood = 'surprised'; }
  if (L === 'S6') { st.mood = 'happy'; st.laugh = speaking('s6_l', t, 0, 1); if (speaking('s6_l', t, 0.2, 1)) st.armL = reach(g, -1, -g.sw * 1.1, g.ySh - 140, { planar: true }); }
  return st; }
function mikeState(t, L) { const g = G.son, st = { t, talk: talk('son', t), mood: 'neutral', turn: -0.3, look: -0.6, armL: hang(g, -1), armR: hang(g, 1), items: {} };
  if (L === 'S4') { st.mood = t < SP.s4_m2.t - 0.1 ? 'surprised' : 'worried'; if (t > ev('S4', 'fix1') - 1.2) gest(st, g, 'son', t, -1, 140); }
  if (L === 'S6') { st.mood = 'tired'; if (speaking('s6_m', t, 0.1, 1)) { st.blink = 1; } }
  return st; }

// ---------------- the world: room + people + table (which characters a shot draws: clean singles)
const DRAW = { wide: ['dasha', 'frank', 'mom', 'son'], two: ['dasha', 'frank', 'mom', 'son'], par: ['frank', 'mom'], dasha: ['dasha'], frank: ['frank'], mom: ['mom'], son: ['son'] };
const OFFR = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function table(c, t) { const dk = dickens(t);
  c.fillStyle = 'rgba(0,0,0,.22)'; c.fillRect(-1100, TT + 20, 2700, 40);
  paint(c, q => rr(q, -1120, TT - 36, 2740, 52, 14), '#F6EEDD', { shade: '#D8CCB0', sx: 0, sy: 8, lw: 6 });
  c.fillStyle = '#F6EEDD'; c.fillRect(-1100, TT, 2700, 900); c.fillStyle = 'rgba(224,71,76,.22)'; for (let x = -1100; x < 1600; x += 140) c.fillRect(x, TT, 70, 900); for (let y = TT; y < TT + 900; y += 140) c.fillRect(-1100, y, 2700, 70);
  c.strokeStyle = '#171717'; c.lineWidth = 5; c.strokeRect(-1100, TT, 2700, 900);
  for (const x of [X.dasha, X.frank, X.mom]) plate(c, x, TT - 36, x === X.frank + 280 ? null : null);
  if (dk < 0.5) roast(c, 280, TT - 40); else { potato(c, 280, TT - 36); }
  for (const x of [-290, 290]) { c.fillStyle = '#F2C14E'; c.fillRect(x + (x < 0 ? 0 : 0) - 8, TT - 190, 16, 150); c.fillStyle = '#FFD7A0'; c.beginPath(); c.ellipse(x, TT - 215 + Math.sin(t * 9 + x) * 2, 14, 30, 0, 0, TAU); c.fill(); }
  if (dk > 0.5) { c.save(); c.translate(-30, TT - 36); paint(c, q => q.ellipse(0, -26, 26, 22, 0, 0, TAU), '#9A9A9A', { lw: 4 }); paint(c, q => q.arc(-18, -52, 11, 0, TAU), '#9A9A9A', { lw: 4 }); paint(c, q => rr(q, 18, -70, 20, 56, 8), '#B8793A', { lw: 4 }); c.restore(); }
  giftBox(c, X.dasha + 60, TT - 40, boxOpen(t), boxOpen(t) ? clamp((t - ev('S5', 'choc0') + 0.2) / 0.5) : 0); }
function shawl(c, hd, w) { c.save(); c.translate(hd.x, hd.y + hd.hh * 1.18); paint(c, q => { q.moveTo(-w, -10); q.quadraticCurveTo(0, hd.hh * 0.9, w, -10); q.lineTo(w * 0.8, hd.hh * 1.5); q.lineTo(-w * 0.8, hd.hh * 1.5); q.closePath(); }, '#8C8C96', { shade: '#6A6A74', sx: 6, sy: 6, lw: 6 }); c.restore(); }
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, h = {};
  c.drawImage(BG, BX0, BY0, BW, BH);
  const dk = dickens(t);
  const put = (n, cfg, st, x, y) => { const r = K.put(c, cfg, st, x, y); h[n] = r; return r; };
  if (who.includes('dasha')) put('dasha', DASHA, dashaState(t, L), X.dasha, SEAT);
  if (who.includes('frank')) { const r = put('frank', FRANK, frankState(t, L), X.frank, SEAT); if (hatOn(t)) toque(c, r.x, r.y, r.hh, 1.0); }
  if (who.includes('mom')) { const r = put('mom', LINDA, momState(t, L), X.mom, SEAT); }
  if (who.includes('son') && mikeIn(t)) put('son', MIKE, mikeState(t, L), X.son, 0);
  table(c, t);
  for (const n of ['dasha', 'frank', 'mom']) if (!h[n]) h[n] = OFFL; if (!h.son) h.son = OFFR;
  return h; }

// ---------------- the parents' heads: full-screen inserts
function factoryBG(c, t, mode) { const choc = mode === 'choc';
  const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, choc ? '#FFC9DC' : '#BFE3EE'); g.addColorStop(0.62, choc ? '#FFE6EE' : '#E8F4F6'); g.addColorStop(0.62, choc ? '#8A5A3A' : '#C8B58F'); g.addColorStop(1, choc ? '#5E3A24' : '#A8956F'); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  c.fillStyle = choc ? '#D98AA8' : '#7FA8B8'; rr(c, 60, 560, 960, 760, 18); c.fill(); c.fillStyle = choc ? '#B86A8A' : '#5E8898'; c.fillRect(60, 560, 960, 70);
  for (const x of [190, 540, 890]) { c.fillStyle = choc ? '#8A4A3A' : '#E0474C'; c.fillRect(x - 60, 330, 120, 250); c.fillStyle = choc ? '#C9A0B0' : '#FFFDF8'; c.fillRect(x - 60, 400, 120, 40); c.fillRect(x - 60, 480, 120, 40);
    for (let i = 0; i < 6; i++) { const u = (t * 0.45 + i / 6 + x * 0.001) % 1, yy = 330 - u * 330, a = 1 - u; c.globalAlpha = a * 0.9; c.fillStyle = choc ? '#E8A0B8' : '#FFFFFF'; c.beginPath(); c.arc(x + Math.sin(u * 7 + i) * 30, yy, 38 + u * 40, 0, TAU); c.fill(); } c.globalAlpha = 1; }
  c.fillStyle = choc ? '#FFE15A' : '#FFFDF8'; rr(c, 200, 640, 680, 190, 24); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 8; c.stroke(); fitTxt(c, choc ? 'CHOCOLATE FACTORY' : 'FABRIC', 540, 735, choc ? 80 : 120, choc ? '#5A3420' : '#3FA7A0', 620);
  c.fillStyle = '#4A4F5C'; c.fillRect(0, 1130, W, 70); c.fillStyle = '#2B2F3A'; for (let x = -((t * 120) % 60); x < W; x += 60) c.fillRect(x, 1140, 30, 12);
  const roll = [['#EE5E9A', '#3FB6A8', '#F2C14E', '#7FB0D8'], ['#5A3420', '#7A4A2A', '#E8A0B8', '#3E2314']][choc ? 1 : 0];
  for (let i = 0; i < 6; i++) { const x = ((t * 140 + i * 210) % 1300) - 110, col = roll[i % 4];
    if (choc) paint(c, q => rr(q, x - 50, 1050, 100, 80, 10), col, { shade: '#2A140A', sx: 4, sy: 4, lw: 5 }); else { paint(c, q => rr(q, x - 70, 1060, 140, 70, 10), col, { lw: 5 }); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x - 70, 1090, 140, 10); } } }
function sheep(c, x, y, t, s = 1, hat = true) { c.save(); c.translate(x, y + Math.sin(t * 6 + x) * 6); c.scale(s, s);
  paint(c, q => q.ellipse(0, 0, 90, 64, 0, 0, TAU), '#FFFDF8', { shade: '#DCD4C0', sx: 6, sy: 8, lw: 6 }); for (const dx of [-50, 0, 50]) paint(c, q => q.arc(dx, -42, 34, 0, TAU), '#FFFDF8', { lw: 5 });
  paint(c, q => q.ellipse(80, -6, 36, 44, 0, 0, TAU), '#4A3A32', { lw: 5 }); c.fillStyle = '#fff'; c.beginPath(); c.arc(90, -16, 9, 0, TAU); c.fill(); c.fillStyle = '#171717'; c.beginPath(); c.arc(92, -16, 4, 0, TAU); c.fill();
  if (hat) paint(c, q => { q.moveTo(48, -40); q.quadraticCurveTo(80, -86, 112, -40); q.closePath(); }, '#F2C14E', { lw: 5 });
  for (const dx of [-40, 40]) { c.fillStyle = '#4A3A32'; c.fillRect(dx - 8, 50, 16, 40); } c.restore(); }
function clothView(c, t, k) { factoryBG(c, t, 'cloth'); sheep(c, 190, 1050, t, 0.8); sheep(c, 880, 1050, t + 1, 0.8);
  c.save(); c.translate(540, 1720); for (const [dx, dy, col] of [[-250, -60, '#EE5E9A'], [250, -60, '#3FB6A8'], [-120, -150, '#F2C14E'], [130, -170, '#7FB0D8'], [0, -80, '#E0474C']]) paint(c, q => rr(q, dx - 150, dy - 80, 300, 160, 70), col, { shade: 'rgba(0,0,0,.2)', sx: 6, sy: 8, lw: 6 }); c.restore();
  const r = K.put(c, DASHA, { t, mood: 'happy', talk: talk('dasha', t), turn: 0, look: 0, armL: reach(G.dasha, -1, -G.dasha.sw * 1.9, G.dasha.ySh - 100, { planar: true }), armR: reach(G.dasha, 1, G.dasha.sw * 1.9, G.dasha.ySh - 100, { planar: true }), items: {} }, 540, 1900, 0.62);
  paint(c, q => { q.moveTo(r.x - 70, r.y - r.hh * 0.9); q.lineTo(r.x - 50, r.y - r.hh * 1.55); q.lineTo(r.x - 20, r.y - r.hh * 1.2); q.lineTo(r.x, r.y - r.hh * 1.7); q.lineTo(r.x + 20, r.y - r.hh * 1.2); q.lineTo(r.x + 50, r.y - r.hh * 1.55); q.lineTo(r.x + 70, r.y - r.hh * 0.9); q.closePath(); }, '#F2C14E', { lw: 6 });
  return { dasha: r }; }
function chaosView(c, t) { const u = t - ev('S2', 'chaos0'), dur = ev('S2', 'chaos1') - ev('S2', 'chaos0'); factoryBG(c, t, 'cloth'); c.fillStyle = 'rgba(224,71,76,.16)'; c.fillRect(0, 0, W, HH);
  const sh = Math.sin(u * 30) * 6;
  for (const [x, y, s_] of [[170, 1060, 0.7], [900, 1070, 0.7]]) sheep(c, x, y + (u > 0.4 ? 30 : 0), t * 2, s_);   // ducking
  const g = G.chef, cx = 540 + sh, cy = 1900, S = 0.7;
  const thrown = u > dur - 0.75, armsUp = Math.sin(u * 9) * 40;
  const st = { t, mood: 'angry', talk: 0.9, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 1.7, g.ySh - 160 + armsUp, { planar: true, fist: true }), armR: reach(g, 1, g.sw * 1.7, g.ySh - 160 - armsUp, { planar: true, fist: true }), items: {} };
  const r = K.put(c, CHEF, st, cx, cy, S);
  if (!thrown) toque(c, r.x, r.y, r.hh, 1.35);
  else { const v = clamp((u - (dur - 0.75)) / 0.75), sc_ = lerp(1, 7, v * v), x = lerp(r.x, 920, v), y = lerp(r.y - r.hh * 1.2, 700, v) - Math.sin(v * Math.PI) * 220; toque(c, x, y + r.hh * 0.8 * sc_, r.hh * sc_, 1.35); }
  for (let i = 0; i < 6; i++) { const v = ((u * 0.9 + i * 0.17) % 1), x = lerp(r.x, i % 2 ? 80 + i * 40 : 1000 - i * 40, v), y = lerp(r.y + 330, 420 + i * 60, v) - Math.sin(v * Math.PI) * 520; c.save(); c.translate(x, y); c.rotate(v * 9 + i); paint(c, q => rr(q, -50, -30, 100, 60, 12), i % 2 ? '#C0C4CE' : '#E0474C', { shade: 'rgba(0,0,0,.25)', sx: 4, sy: 4, lw: 6 }); c.fillStyle = '#171717'; c.fillRect(48, -10, 70, 20); c.restore();
    if (v > 0.8) { c.strokeStyle = '#F2C14E'; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); for (let j = 0; j < 6; j++) c.lineTo(x - 50 + j * 20, y + 60 + (j % 2 ? 20 : -20)); c.stroke(); } }
  c.save(); c.globalAlpha = clamp(u / 0.2) * (1 - clamp((u - dur + 0.25) / 0.25)); fitTxt(c, 'А ПОВАР?!', 540, 1700, 118, '#E0474C', 880); c.restore();
  return {}; }
function chocView(c, t) { const u = t - ev('S5', 'choc0'); factoryBG(c, t, 'choc');
  for (let i = 0; i < 14; i++) { const x = (hash(i) * 1000 + 40), y = 300 + ((t * 80 * (0.5 + hash(i + 3)) + i * 140) % 700); c.globalAlpha = 0.9; c.fillStyle = ['#FFFDF8', '#F2C14E', '#EE5E9A', '#7FB0D8'][i % 4]; c.beginPath(); c.arc(x, y, 8, 0, TAU); c.fill(); } c.globalAlpha = 1;
  const rv = c.createLinearGradient(0, 1210, 0, 1330); rv.addColorStop(0, '#6A3E22'); rv.addColorStop(1, '#4A2A16'); c.fillStyle = rv; c.beginPath(); c.moveTo(0, 1230); for (let x = 0; x <= W; x += 30) c.lineTo(x, 1230 + Math.sin(x * 0.02 + t * 3) * 14); c.lineTo(W, 1340); c.lineTo(0, 1340); c.fill();
  const g = G.chef, S = 0.66, thr = u > 1.4;
  const st = { t, mood: u > 1.4 ? 'angry' : 'angry', talk: 0.8, turn: -0.1, look: 0, armL: reach(g, -1, -g.sw * 1.6, g.ySh - 160 + Math.sin(u * 9) * 30, { planar: true, fist: true }), armR: thr ? reach(g, 1, g.sw * 1.9, g.ySh - 330, { planar: true }) : reach(g, 1, g.sw * 1.4, g.ySh - 100, { planar: true, fist: true }), items: {} };
  const r = K.put(c, CHEF, st, 700, 1960, S);
  const hv = clamp((u - 1.5) / 0.9); if (hv <= 0) toque(c, r.x, r.y, r.hh, 1.35); else { const x = lerp(r.x, -100, hv), y = lerp(r.y - r.hh * 1.2, 520, hv) - Math.sin(hv * Math.PI) * 260; toque(c, x, y + r.hh * 0.8, r.hh, 1.35); }
  const rd = K.put(c, DASHA, { t, mood: 'happy', talk: 0, turn: 0.3, look: 0.5, armL: hang(G.dasha, -1), armR: reach(G.dasha, 1, G.dasha.sw * 1.7, G.dasha.ySh - 60, { planar: true }), items: {} }, 230, 1980, 0.6);
  c.save(); c.globalAlpha = clamp(u / 0.3) * (1 - clamp((u - 3.4) / 0.3)); fitTxt(c, 'ЭТО ШОКОЛАД!', 540, 1700, 112, '#FFFDF8', 880); c.restore();
  return {}; }

// ---------------- shots (world coordinates; a single's face at ~900 px)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const hy = n => G[n].headY + (n === 'son' ? 0 : SEAT);
const fy = (h, z, sy = 900) => h + (960 - sy) / z;
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const SH = { WIDE: S(250, -1000, 0.5, 'wide'), TWO: S(-280, fy(hy('frank'), 0.75, 760), 0.75, 'two'), PAR: S(280, fy(hy('frank'), 0.85, 900), 0.85, 'par'), COVER: S(-100, fy(hy('frank'), 0.7, 1000), 0.7, 'two'),
  DASHA: S(X.dasha + 40, fy(hy('dasha'), 1.0), 1.0, 'dasha'), DASHA_CU: S(X.dasha + 20, fy(hy('dasha'), 1.5, 960), 1.5, 'dasha'),
  FRANK: S(X.frank - 30, fy(hy('frank'), 1.0), 1.0, 'frank'), FRANK_H: S(X.frank - 30, fy(hy('frank'), 1.4, 1230), 1.4, 'frank'), FRANK_CU: S(X.frank - 30, fy(hy('frank'), 1.5, 960), 1.5, 'frank'),
  MOM: S(X.mom - 40, fy(hy('mom'), 1.0), 1.0, 'mom'), MOM_CU: S(X.mom - 40, fy(hy('mom'), 1.5, 960), 1.5, 'mom'),
  MIKE: S(X.son - 30, fy(hy('son'), 0.9, 900), 0.9, 'son'),
  CLOTH: U('cloth', 1), CHAOS: U('chaos', 2), CHOC: U('choc', 3) };
const SINGLE = { dasha: SH.DASHA, frank: SH.FRANK, mom: SH.MOM, son: SH.MIKE };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), s_ = (id, a = 0.1, b = 0.2) => speaking(id, t, a, b);
  if (L === 'hook') { if (t < ev('hook', 'pop')) return f(SH.CLOTH); if (s_('hook_f', 0.4, 0.5)) return f(SH.FRANK_H); return f(SH.COVER); }
  if (chaosW(t)) return f(SH.CHAOS); if (chocW(t)) return f(SH.CHOC);
  if (L === 'S2') { if (t >= ev('S2', 'chaos1') && t < SP.s2_l.t - 0.1) return f(SH.FRANK_CU); if (s_('s2_m', 0.1, 0.3) || s_('s2_l2', 0.1, 0.4)) return f(SH.PAR); }
  if (L === 'S3') { if (t >= ev('S3', 'dick0') && t < ev('S3', 'dick0') + 0.9) return f(SH.WIDE); if (s_('s3_l', 0.1, 0.5)) return f(SH.MOM_CU); if (t > endOf('s3_l') + 0.1) return f(SH.DASHA); }
  if (L === 'S4') { if (t < SP.s4_m.t - 0.1) return f(SH.WIDE); if (t >= endOf('s4_m4') + 0.05) return f(SH.WIDE); if (t >= ev('S4', 'warm') + 0.3 && t < SP.s4_m4.t) return f(SH.WIDE); }
  if (L === 'S5') { if (s_('s5_l', 0.0, 0.0)) return f(SH.CHOC); if (t >= ev('S5', 'choc1') && t < SP.s5_d2.t - 0.1) return f(SH.WIDE); }
  if (L === 'S6') { if (t >= endOf('s6_m') + 0.1) return f(SH.WIDE); if (s_('s6_d', 0.1, 0.5)) return f(SH.DASHA_CU); }
  const cur = TL.speech.find(s => s.id.startsWith(L.toLowerCase() + '_') && t >= s.t - 0.1 && t < s.t + s.d + 0.25);
  if (cur) return f(SINGLE[cur.who]);
  const next = TL.speech.find(s => s.id.startsWith(L.toLowerCase() + '_') && t >= s.t - 0.6 && t < s.t); if (next) return f(SINGLE[next.who]);
  return SH.TWO; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'thud', 'clank']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- overlays
function dickensFX(c, t) { const k = dickens(t); if (k <= 0) return;
  c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = `rgba(${Math.round(255 - 120 * k)},${Math.round(255 - 90 * k)},${Math.round(255 - 40 * k)},1)`; c.fillRect(0, 0, W, HH); c.restore();
  c.save(); c.globalAlpha = 0.9 * k; c.fillStyle = '#FFFFFF'; for (let i = 0; i < 70; i++) { const x = (hash(i) * 1200 + Math.sin(t * 1.5 + i) * 40) % W, y = ((t * (90 + hash(i + 9) * 120) + hash(i + 5) * HH) % (HH + 40)) - 20; c.beginPath(); c.arc(x, y, 3 + hash(i + 2) * 5, 0, TAU); c.fill(); } c.restore();
  Hq.vignette(c, W, HH, 0.5 * k); }
function sticker(c, t, t0, bad, badRu, good, goodRu, y) { const k = eBack(P(t, t0, t0 + 0.3), 2.2); if (k <= 0) return; c.save(); c.translate(540, y); c.scale(k, k); c.rotate(-0.025);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -440 + 8, -78 + 10, 880, 156, 40); c.fill(); c.fillStyle = '#FFFDF8'; rr(c, -440, -78, 880, 156, 40); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 7; c.stroke();
  fitTxt(c, bad, -250, -14, 66, '#E0474C', 360); const w = c.measureText(bad).width; c.strokeStyle = '#E0474C'; c.lineWidth = 8; c.beginPath(); c.moveTo(-250 - w / 2 - 6, -14); c.lineTo(-250 + w / 2 + 6, -14); c.stroke(); fitTxt(c, badRu, -250, 36, 34, '#8A8A8A', 360, 'Nun9');
  c.fillStyle = C.oliveD; c.beginPath(); c.moveTo(-60, -40); c.lineTo(10, -14); c.lineTo(-60, 12); c.closePath(); c.fill();
  fitTxt(c, good, 230, -14, 66, '#2E9E5A', 400); fitTxt(c, goodRu, 230, 36, 34, '#6A6A6A', 400, 'Nun9'); c.restore(); }
function coverBadge(c, t) { const p = 1 + 0.04 * Math.sin(t * 8); c.save(); c.translate(540, 1640); c.scale(p, p); c.rotate(-0.03); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -360 + 6, -62 + 10, 720, 124, 62); c.fill(); c.fillStyle = '#FFE15A'; rr(c, -360, -62, 720, 124, 62); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; rr(c, -360, -62, 720, 124, 62); c.stroke();
  fitTxt(c, 'I MANAGE A FABRIC!', 0, 4, 54, '#E0474C', 660); c.restore(); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag.startsWith('ui:')) { c.save(); c.translate(sh.x, sh.y); let r = {};
    if (tag === 'ui:cloth') r = clothView(c, t); else if (tag === 'ui:chaos') chaosView(c, t); else chocView(c, t); c.restore();
    heads = { dasha: r.dasha || OFFL, frank: OFFL, mom: OFFL, son: OFFR }; proj = p => p; if (tag === 'ui:chaos') Hq.vignette(c, W, HH, 0.3); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26); dickensFX(c, t); }
  const names = { frank: ['FRANK', '#8A6F4E'], mom: ['LINDA', '#3FA7A0'], son: ['MIKE', '#C2504A'] };
  const pops = { hook: 0 };
  // flash + ring on the POP that ends the cold open and on every insert switch
  for (const [a, w, col] of [[ev('hook', 'pop'), 0.18, '#FFFFFF'], [ev('S2', 'chaos1') + 0.05, 0.2, '#FFFFFF']]) { const k = 1 - P(t, a, a + w); if (t >= a && k > 0) { c.save(); c.globalAlpha = 0.85 * k; c.fillStyle = col; c.fillRect(0, 0, W, HH); c.restore(); } }
  const popT = ev('hook', 'pop'); if (t >= popT && t < popT + 0.5) { const k = P(t, popT, popT + 0.5); c.save(); c.strokeStyle = '#FFFFFF'; c.globalAlpha = 1 - k; c.lineWidth = 30 * (1 - k) + 4; c.beginPath(); c.arc(540, 900, 100 + 700 * eOut(k), 0, TAU); c.stroke(); c.restore(); }
  if (L === 'hook') { if (t < ev('hook', 'pop')) coverBadge(c, t);
    const hookProj = p => { const q = proj(p); return q.x < 0 || q.x > W ? { x: q.x < 0 ? 60 : W - 60, y: 1050 } : q; };
    K.bubbles(c, t, sc, heads, hookProj, { heroine: 'dasha', cleanChunks: true, names, hold: { hook_d: 0.05, hook_f: 0.5 } }); K.titleRibbon(c, t, 540, 455); UI.watermark(c); Hq.grain(c, W, HH, t, 0.045); return; }
  if (L === 'S2' && t > ev('S2', 'chaos1') + 0.1 && t < SP.s2_l.t - 0.1) K.pop(c, t, 'ШАПКА ОСТАЛАСЬ!', ev('S2', 'chaos1') + 0.2, SP.s2_l.t - 0.15, 540, 1500, C.gold, -0.06, 84);
  if (L === 'S3' && t > ev('S3', 'dick0') + 0.1 && t < SP.s3_l.t - 0.1) K.pop(c, t, 'ИМ ЖАЛКО НАС?!', ev('S3', 'dick0') + 0.15, SP.s3_l.t - 0.15, 540, 1500, C.gold, -0.06, 84);
  K.bubbles(c, t, sc, heads, proj, { heroine: 'dasha', cleanChunks: true, names, hold: { s2_d: 0.1, s2_l: 0.3, s3_d: 0.1, s3_l: 0.4, s4_m: 0.1, s5_d: 0.3, s5_l: 0.5, s6_d: 0.4 } });
  const L4 = ev('S4', 'fix1'); if (t > L4 - 0.05) { const e4 = sc.id === 'S4' ? 1e9 : 1e9;
    const hide = L === 'S5' && t > SP.s5_f.t + 0.1 ? 1 : 0; if (!hide && (L === 'S4' || (L === 'S5' && t < SP.s5_f.t + 0.1))) { const fade = L === 'S5' ? 1 - P(t, SC.S5.s, SC.S5.s + 0.1) : 1; c.save(); c.globalAlpha = fade;
      sticker(c, t, ev('S4', 'fix1'), 'FABRIC', 'ткань', 'FACTORY', 'фабрика', 1180); sticker(c, t, ev('S4', 'fix2'), 'CHEF', 'повар', 'BOSS', 'начальник', 1340); sticker(c, t, ev('S4', 'fix3'), 'SYMPATHIZE', 'сочувствовать', 'LIKE', 'нравиться', 1500); c.restore(); } }
  UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
}
E.run('saidheard', NF, renderFrame);
