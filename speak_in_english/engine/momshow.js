// "When Mom shows off your English" renderer (hard_cut camera): node momshow.js start end out.mp4 | node momshow.js 0 0 --png=f1,f2
// One dining room (same build as saidheard). Lena is pulled up into a spotlight and spills family secrets in English;
// Mom keeps a proud smile, but small tells grow (eye twitch, a fork bending in her fist, rattling tea, a tiny vein).
// The reveal: Mom answers in perfect English and shows her one-year app streak. Lena is sent to the kitchen with the store salad.
process.env.LAYOUT = process.env.LAYOUT || 'v1';   // shots are directed by hand below, no camera assist
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, rr, createCanvas } = Hq;
const adapt = q => ({ beginPath() {}, moveTo: q.m, lineTo: q.l, quadraticCurveTo: q.q, bezierCurveTo: q.b, closePath: q.z, arc: (x, y, r, a0 = 0, a1 = Math.PI * 2, ccw) => q.a(x, y, r, a0, a1, ccw), ellipse: (x, y, rx, ry, rot = 0, a0 = 0, a1 = Math.PI * 2, ccw) => q.e(x, y, rx, ry, rot, a0, a1, ccw),
  roundRect(x, y, w, h, r) { q.m(x + r, y); q.l(x + w - r, y); q.q(x + w, y, x + w, y + r); q.l(x + w, y + h - r); q.q(x + w, y + h, x + w - r, y + h); q.l(x + r, y + h); q.q(x, y + h, x, y + h - r); q.l(x, y + r); q.q(x, y, x + r, y); q.z(); } });
const paint = (ctx, fn, base, o) => Hq.paint(ctx, q => { const a = adapt(q); fn(Object.assign(a, { m: q.m, l: q.l, b: q.b, q: q.q, e: q.e, a: q.a, z: q.z })); }, base, o);
const TL = JSON.parse(fs.readFileSync('eps/momshow/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
for (const s of TL.speech) { s.fs = 54; s.rfs = 44; }   // big, phone-readable bubbles (Russian line too)
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const fitTxt = (c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') => { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); };

// ---------------- cast
const LENA = { ...BASE.her_dinner };
const TANYA = { ...BASE.linda, top: { type: 'sweater', col: '#C2504A' } };
const VERA = { ...BASE.margot, top: { type: 'coat', col: '#6A3A6A', col2: '#F5EBDD' } };
const NIGEL = { ...BASE.reggie };
const G = { lena: geom(LENA), tanya: geom(TANYA), vera: geom(VERA), nigel: geom(NIGEL) };
const SEAT = 250, TT = -470;                                   // seated feet y, table-top edge y
const X = { lena: -560, tanya: 0, vera: 560, nigel: 1100 };
const hang = (g, s) => reach(g, s, s * g.sw * 0.8, g.ySh + 480);
const chest = (g, s, k = 0.6) => reach(g, s, s * g.sw * k, g.ySh + 230);
const gest = (st, g, who, t, side, base) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } };

// ---------------- phases
const UP = ev('hook', 'up'), SPOT = ev('hook', 'spot');
const lenaY = t => lerp(SEAT, 0, eBack(P(t, UP, UP + 0.35), 1.4));
const WALK = ev('S4', 'walk');
const lenaX = t => X.lena - 1300 * eIn(P(t, WALK, WALK + 1.5));
const spotK = t => P(t, SPOT - 0.05, SPOT + 0.1) * (1 - P(t, SC.S2.s, SC.S2.s + 0.4));
const forkBend = t => 0.35 * eBack(P(t, ev('S3', 'f1'), ev('S3', 'f1') + 0.25)) + 0.45 * eBack(P(t, ev('S3', 'f2'), ev('S3', 'f2') + 0.25)) + 0.6 * eBack(P(t, ev('S3', 'f3'), ev('S3', 'f3') + 0.25));
const forkDown = t => t >= ev('S4', 'down');
const rattle = t => (t > SP.s3_l3.t + 0.6 && t < ev('S4', 'down')) ? Math.sin(t * 70) * 5 * (t > ev('S3', 'f3') ? 1.6 : 0.6) : 0;
const vein = t => Math.max(0.55 * P(t, ev('S3', 'f2'), ev('S3', 'f2') + 0.2), P(t, ev('S3', 'f3'), ev('S3', 'f3') + 0.2)) * (1 - P(t, ev('S4', 'down'), ev('S4', 'down') + 0.3));
const PH0 = ev('S4', 'phone') - 0.25, PH1 = SP.s4_l.t - 0.15;
const pushK = t => eOut(P(t, ev('S2', 'push'), ev('S2', 'push') + 0.4));

// ---------------- props (world coords)
function plate(c, x, y) { paint(c, q => q.ellipse(x, y, 190, 40, 0, 0, TAU), '#FFFDF8', { shade: '#DCD4C0', sx: 6, sy: 8, lw: 5 }); c.fillStyle = '#EADFC8'; c.beginPath(); c.ellipse(x, y - 2, 120, 24, 0, 0, TAU); c.fill(); }
function salad(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s);   // the famous store salad (olivier-ish): bowl + heap with peas and carrots
  paint(c, q => q.ellipse(0, -40, 120, 70, 0, 0, TAU), '#F3E6B8', { shade: '#D8C88A', sx: 4, sy: 6, lw: 5 });
  for (let i = 0; i < 14; i++) { c.fillStyle = i % 2 ? '#5FAE4E' : '#E9823B'; c.beginPath(); c.arc(-80 + hash(i) * 160, -80 + hash(i + 4) * 60, 9, 0, TAU); c.fill(); }
  paint(c, q => { q.moveTo(-170, -30); q.quadraticCurveTo(0, 10, 170, -30); q.lineTo(120, 40); q.quadraticCurveTo(0, 70, -120, 40); q.closePath(); }, '#3FA7A0', { shade: '#2C7C76', sx: 4, sy: 6, lw: 6 });
  c.restore(); }
function cup(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s);
  paint(c, q => q.ellipse(0, 6, 70, 16, 0, 0, TAU), '#FFFDF8', { lw: 4 });
  paint(c, q => { q.moveTo(-50, -70); q.lineTo(50, -70); q.quadraticCurveTo(48, 0, 0, 2); q.quadraticCurveTo(-48, 0, -50, -70); q.closePath(); }, '#FFFDF8', { shade: '#DCD4C0', sx: 4, sy: 4, lw: 5 });
  c.strokeStyle = '#171717'; c.lineWidth = 5; c.beginPath(); c.arc(56, -40, 18, -1.3, 1.3); c.stroke(); c.fillStyle = '#E0474C'; c.fillRect(-40, -52, 80, 8); c.restore(); }
function fork(c, x, y, bend, rot = 0) { c.save(); c.translate(x, y); c.rotate(rot); c.strokeStyle = '#9AA0AA'; c.lineCap = 'round';
  const L = 150, k = bend; c.lineWidth = 12; c.beginPath(); c.moveTo(0, 30); c.quadraticCurveTo(0, -L * 0.5, Math.sin(k) * L * 0.55, -L * (1 - 0.25 * k)); c.stroke();
  const tx = Math.sin(k) * L * 0.55, ty = -L * (1 - 0.25 * k); c.save(); c.translate(tx, ty); c.rotate(k * 1.3);
  c.lineWidth = 7; for (const dx of [-18, -6, 6, 18]) { c.beginPath(); c.moveTo(dx * 0.6, 0); c.lineTo(dx, -50); c.stroke(); } c.restore();
  c.strokeStyle = '#171717'; c.lineWidth = 3; c.restore(); }
function glass(c, x, y) { c.save(); c.translate(x, y); c.fillStyle = 'rgba(200,230,255,.55)'; c.strokeStyle = '#171717'; c.lineWidth = 4; c.beginPath(); c.moveTo(-34, -90); c.lineTo(34, -90); c.lineTo(22, 0); c.lineTo(-22, 0); c.closePath(); c.fill(); c.stroke(); c.fillStyle = 'rgba(200,60,80,.75)'; c.fillRect(-26, -50, 52, 46); c.restore(); }

// ---------------- dining room (prerendered, softly blurred) — the saidheard room, four chairs, a garage door hint on the right
const BX0 = -2400, BY0 = -3400, BW = 4800, BH = 4800, BS = 0.5;
function drawRoom(c) {
  const g = c.createLinearGradient(0, BY0, 0, 300); g.addColorStop(0, '#D9B98C'); g.addColorStop(1, '#EBCFA6'); c.fillStyle = g; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = 'rgba(160,70,60,.10)'; for (let x = BX0; x < BX0 + BW; x += 150) c.fillRect(x, BY0, 70, 3700);
  c.fillStyle = '#8A5A3A'; c.fillRect(BX0, -380, BW, 80); c.fillStyle = '#B88660'; c.fillRect(BX0, -300, BW, 650);
  c.fillStyle = '#7A4E30'; c.fillRect(BX0, 300, BW, 1100); c.strokeStyle = 'rgba(0,0,0,.14)'; c.lineWidth = 5; for (let x = BX0; x < BX0 + BW; x += 260) { c.beginPath(); c.moveTo(x, 300); c.lineTo(x - 120, 1400); c.stroke(); }
  c.fillStyle = '#9C3F4A'; rr(c, -1300, 330, 3200, 900, 30); c.fill();
  c.fillStyle = '#6A4A30'; rr(c, -1750, -2900, 760, 1450, 20); c.fill(); const sk = c.createLinearGradient(0, -2860, 0, -1500); sk.addColorStop(0, '#2B3A6E'); sk.addColorStop(1, '#6A8CC8'); c.fillStyle = sk; c.fillRect(-1720, -2870, 700, 1390);
  c.fillStyle = '#FFFDF8'; for (const [x, y, r] of [[-1600, -2700, 6], [-1480, -2600, 5], [-1350, -2760, 7], [-1180, -2650, 5]]) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
  c.fillStyle = '#6A4A30'; c.fillRect(-1390, -2870, 16, 1390); c.fillRect(-1720, -2200, 700, 16);
  for (const s of [-1, 1]) { c.fillStyle = '#3FA7A0'; c.beginPath(); c.moveTo(s < 0 ? -1790 : -930, -2950); c.lineTo(s < 0 ? -1500 : -1220, -2950); c.quadraticCurveTo(s < 0 ? -1560 : -1160, -2200, s < 0 ? -1700 : -1020, -1400); c.lineTo(s < 0 ? -1820 : -900, -1400); c.closePath(); c.fill(); }
  for (const [x, y, w, h, col] of [[-350, -2750, 420, 520, '#C8A86A'], [420, -2800, 520, 380, '#7FB0D8'], [1250, -2700, 380, 500, '#B9A2E6']]) { c.fillStyle = '#5A3A22'; rr(c, x - w / 2 - 22, y - 22, w + 44, h + 44, 10); c.fill(); c.fillStyle = col; c.fillRect(x - w / 2, y, w, h); c.fillStyle = 'rgba(255,255,255,.3)'; c.beginPath(); c.arc(x, y + h * 0.4, w * 0.18, 0, TAU); c.fill(); c.fillStyle = 'rgba(0,0,0,.16)'; c.beginPath(); c.moveTo(x - w / 2, y + h); c.quadraticCurveTo(x, y + h * 0.5, x + w / 2, y + h); c.fill(); }
  c.strokeStyle = '#3A2A1A'; c.lineWidth = 12; c.beginPath(); c.moveTo(300, BY0); c.lineTo(300, -3150); c.stroke(); c.fillStyle = '#F2C14E'; c.beginPath(); c.ellipse(300, -3120, 360, 70, 0, 0, TAU); c.fill();
  for (let i = -3; i <= 3; i++) { c.fillStyle = '#FFF4C2'; c.beginPath(); c.arc(300 + i * 100, -3170, 22, 0, TAU); c.fill(); }
  for (const x of [X.lena, X.tanya, X.vera, X.nigel]) { c.fillStyle = '#5A3A22'; rr(c, x - 250, -1000, 500, 1050, 40); c.fill(); c.fillStyle = '#7A4E30'; rr(c, x - 220, -970, 440, 990, 30); c.fill(); }
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BG = mkBG(drawRoom);

// ---------------- characters
const FORK = g => ({ x: g.sw * 1.05, y: TT - SEAT - 40 });          // Mom's right fist on the table edge (local coords)
function lenaState(t, L) { const g = G.lena, st = { t, talk: talk('lena', t), mood: 'happy', turn: 0.3, look: 0.5, armL: hang(g, -1), armR: hang(g, 1), items: {} };
  gest(st, g, 'lena', t, 1, 120);
  if (L === 'hook') { st.mood = t < UP ? 'happy' : t < UP + 0.6 ? 'shock' : 'worried'; st.look = t < UP + 0.6 ? 0 : 0.7; st.turn = 0.1; if (t > UP + 0.6 && t < SPOT) st.armL = chest(g, -1, 0.3); }
  if (L === 'S1') { st.mood = 'worried'; st.armL = chest(g, -1, 0.3); }
  if (L === 'S2' || L === 'S3') { st.mood = 'smug'; if (speaking('s2_l', t, 0, 0) || speaking('s3_l2', t)) st.mood = 'happy'; st.look = 0.6; }
  if (L === 'S4') { st.mood = 'smug';
    if (t > ev('S4', 'cut')) { st.mood = 'surprised'; st.look = 0.8; }
    if (t > ev('S4', 'phone')) { st.mood = 'shock'; st.blink = 0; }
    if (t > SP.s4_l.t) st.mood = 'worried';
    if (t > endOf('s4_m2')) { st.mood = 'sad'; st.turn = -0.5; st.look = -0.6; st.armL = reach(g, -1, -g.sw * 0.5, g.ySh + 330); st.armR = reach(g, 1, g.sw * 0.5, g.ySh + 330); } }
  return st; }
function tanyaState(t, L) { const g = G.tanya, st = { t, talk: talk('tanya', t), mood: 'happy', turn: -0.3, look: -0.7, armL: hang(g, -1), armR: reach(g, 1, FORK(g).x, FORK(g).y, { fist: true }), items: {} };
  if (L === 'hook') { st.look = -0.9; st.armL = t < UP + 0.3 ? reach(g, -1, -g.sw * 2.0, g.ySh + 60, { planar: true }) : reach(g, -1, -g.sw * 1.8, g.ySh - 160, { planar: true }); }
  if (L === 'S1' && speaking('s1_m', t, 0, 0.3)) { st.laugh = true; st.armL = reach(g, -1, -g.sw * 1.5, g.ySh - 60, { planar: true }); }
  if (L === 'S2') { const u = t - ev('S2', 'tw1'); if (u > 0 && u < 0.5) { st.blink = (Math.floor(u * 16) % 2) ? 0.85 : 0; st.mood = 'happy'; }
    if (speaking('s2_m', t, 0, 0.2)) { st.look = 0.6; st.turn = 0.3; st.armL = reach(g, -1, -g.sw * 0.2, g.ySh + 140, { planar: true }); } }
  if (L === 'S3') { for (const k of ['f1', 'f2', 'f3']) { const u = t - ev('S3', k); if (u > 0 && u < (k === 'f3' ? 1.0 : 0.5)) st.mood = 'annoyed'; }
    if (speaking('s3_m', t, 0, 0.1)) { st.mood = 'happy'; st.look = 0.5; st.turn = 0.25; st.armL = reach(g, -1, -g.sw * 1.4, g.ySh - 200 + Math.sin(t * 22) * 30, { planar: true }); }
    if (t > ev('S3', 'f3') + 1.0) { st.mood = 'happy'; st.squint = true; } }
  if (L === 'S4') { st.mood = 'neutral'; st.look = 0.4; st.turn = 0.25;
    if (forkDown(t)) st.armR = hang(g, 1);
    if (speaking('s4_m', t, 0, 0.1)) st.mood = 'smug';
    if (t >= PH0 && t < PH1) { st.mood = 'smug'; st.armR = reach(g, 1, g.sw * 1.4, g.ySh - 60, { planar: true }); }
    if (speaking('s4_m2', t, 0, 0.2)) { st.mood = 'happy'; st.squint = true; st.look = -0.9; st.turn = -0.3; st.armL = reach(g, -1, -g.sw * 2.1, g.ySh - 40, { planar: true }); }
    if (t > endOf('s4_m2') + 0.2) { st.mood = 'smug'; st.look = -0.9; } }
  return st; }
function veraState(t, L) { const g = G.vera, st = { t, talk: talk('vera', t), mood: 'smug', turn: -0.35, look: -0.8, armL: hang(g, -1), armR: chest(g, 1, 0.9), items: {} };
  if (speaking('s2_v', t, 0, 0.2)) st.mood = 'happy';
  if (L === 'S2' && t > ev('S2', 'push') - 0.1 && t < ev('S2', 'push') + 0.6) st.armL = reach(g, -1, -g.sw * 0.6, TT - SEAT - 30);
  if (L === 'S3') st.mood = speaking('s3_l3', t, 0, 2) ? 'happy' : 'smug';
  if (L === 'S4') { st.mood = 'smug'; st.look = -0.6; if (t > ev('S4', 'phone')) { st.mood = 'surprised'; st.blink = 0; } if (t > endOf('s4_m2')) st.mood = 'happy'; }
  return st; }
function nigelState(t, L) { const g = G.nigel, st = { t, talk: talk('nigel', t), mood: 'bored', turn: -0.3, look: -0.7, armL: hang(g, -1), armR: hang(g, 1), items: {} };
  if (speaking('s3_n', t, 0, 0.4)) { st.mood = 'neutral'; st.look = -0.2; }
  if (L === 'S4') { st.mood = t > ev('S4', 'phone') ? 'surprised' : 'neutral'; if (t > endOf('s4_m2')) st.mood = 'neutral';
    if (t > SP.s4_n.t - 0.4) { st.mood = 'happy'; st.squint = true; st.look = 0; st.armR = reach(g, 1, g.sw * 1.0, g.ySh - 120, { planar: true }); } }
  return st; }

// ---------------- the world: room + people + table (which characters a shot draws: clean singles)
const DRAW = { wide: ['lena', 'tanya', 'vera', 'nigel'], cover: ['lena', 'tanya', 'vera'], two: ['lena', 'tanya'], lena: ['lena'], tanya: ['tanya'], vera: ['vera'], nigel: ['nigel'] };
const OFFR = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function table(c, t, who) {
  c.fillStyle = 'rgba(0,0,0,.22)'; c.fillRect(-1100, TT + 20, 2900, 40);
  paint(c, q => rr(q, -1120, TT - 36, 2940, 52, 14), '#F6EEDD', { shade: '#D8CCB0', sx: 0, sy: 8, lw: 6 });
  c.fillStyle = '#F6EEDD'; c.fillRect(-1100, TT, 2900, 900); c.fillStyle = 'rgba(224,71,76,.22)'; for (let x = -1100; x < 1800; x += 140) c.fillRect(x, TT, 70, 900); for (let y = TT; y < TT + 900; y += 140) c.fillRect(-1100, y, 2900, 70);
  c.strokeStyle = '#171717'; c.lineWidth = 5; c.strokeRect(-1100, TT, 2900, 900);
  for (const x of [X.lena, X.tanya, X.vera + 90 * pushK(t), X.nigel]) plate(c, x, TT - 36);
  if (t < WALK + 0.1) salad(c, 300, TT - 30);
  cup(c, X.tanya - 230 + rattle(t), TT - 40 + Math.abs(rattle(t)) * 0.4);
  for (const x of [-290, 830]) { c.fillStyle = '#F2C14E'; c.fillRect(x - 8, TT - 190, 16, 150); c.fillStyle = '#FFD7A0'; c.beginPath(); c.ellipse(x, TT - 215 + Math.sin(t * 9 + x) * 2, 14, 30, 0, 0, TAU); c.fill(); }
  if (forkDown(t) && who.includes('tanya')) fork(c, X.tanya + 150, TT - 40, forkBend(t), 1.45);
}
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, h = {};
  c.drawImage(BG, BX0, BY0, BW, BH);
  const put = (n, cfg, st, x, y) => { const r = K.put(c, cfg, st, x, y); h[n] = r; return r; };
  if (who.includes('nigel')) put('nigel', NIGEL, nigelState(t, L), X.nigel, SEAT);
  if (who.includes('vera')) put('vera', VERA, veraState(t, L), X.vera, SEAT);
  if (who.includes('tanya')) put('tanya', TANYA, tanyaState(t, L), X.tanya, SEAT);
  const walking = t > WALK && t < WALK + 1.6;
  if (who.includes('lena') && t < WALK + 1.6) put('lena', LENA, lenaState(t, L), lenaX(t), lenaY(t) - (walking ? Math.abs(Math.sin((t - WALK) * 11)) * 26 : 0));
  table(c, t, who);
  // props held in hands (drawn over the table)
  if (who.includes('tanya')) { const g = G.tanya, f = FORK(g);
    if (!forkDown(t)) { const ph = t >= PH0 && t < PH1; if (!ph) fork(c, X.tanya + f.x, SEAT + f.y, forkBend(t)); } }
  if (who.includes('vera')) { const g = G.vera; cup(c, X.vera + g.sw * 0.9 + 10, SEAT + g.ySh + 250, 0.8); }
  if (who.includes('nigel')) { const g = G.nigel; if (t > SP.s4_n.t - 0.4) glass(c, X.nigel + g.sw * 1.0, SEAT + g.ySh - 100); else glass(c, X.nigel + 230, TT - 36); }
  if (who.includes('lena') && t > WALK - 0.1 && t < WALK + 1.6) { const g = G.lena; salad(c, lenaX(t), lenaY(t) + g.ySh + 380, 0.85); }
  // a tiny anger vein on Mom's temple (a rewatch detail)
  const vk = vein(t); if (vk > 0 && h.tanya) { const r = h.tanya, s = r.hh * 0.22 * vk * (1 + 0.12 * Math.sin(t * 14)); c.save(); c.translate(r.x - r.hh * 0.62, r.y - r.hh * 0.55); c.strokeStyle = '#E0474C'; c.lineWidth = s * 0.28; c.lineCap = 'round';
    for (const a of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) { c.save(); c.rotate(a + 0.785); c.beginPath(); c.moveTo(s * 0.25, -s * 0.25); c.quadraticCurveTo(s * 0.3, -s * 0.9, s * 0.9, -s * 0.3); c.stroke(); c.restore(); } c.restore(); }
  for (const n of ['lena', 'tanya', 'vera']) if (!h[n]) h[n] = OFFL; if (!h.nigel) h.nigel = OFFR;
  return h; }

// ---------------- shots (world coordinates; a single's face at ~900 px)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const hy = n => G[n].headY + (n === 'lena' ? 0 : SEAT);           // Lena is standing for the whole show
const fy = (h, z, sy = 900) => h + (960 - sy) / z;
const SH = { WIDE: S(270, -1000, 0.5, 'wide'), COVER: S(-130, fy(hy('tanya'), 0.7, 1250), 0.7, 'cover'), TWO: S(-300, fy(hy('tanya'), 0.72, 1000), 0.72, 'two'),
  LENA: S(X.lena + 40, fy(hy('lena'), 1.0), 1.0, 'lena'), LENA_H: S(X.lena + 40, fy(hy('lena'), 1.0, 1250), 1.0, 'lena'), VERA_H: S(X.vera - 40, fy(hy('vera'), 1.0, 1250), 1.0, 'vera'), LENA_CU: S(X.lena + 20, fy(hy('lena'), 1.5, 960), 1.5, 'lena'),
  TANYA: S(X.tanya + 20, fy(hy('tanya'), 0.95, 860), 0.95, 'tanya'), VERA: S(X.vera - 40, fy(hy('vera'), 1.0), 1.0, 'vera'), NIGEL: S(X.nigel - 30, fy(hy('nigel'), 1.0), 1.0, 'nigel') };
const LINE = { hook_v: 'VERA', s1_l: 'LENA', s1_m: 'TANYA', s2_l: 'TWO', s2_v: 'VERA', s2_m: 'TANYA', s3_l: 'TWO', s3_n: 'NIGEL', s3_l2: 'TWO', s3_m: 'TANYA', s3_l3: 'TWO', s4_v: 'VERA', s4_m: 'TANYA', s4_l: 'LENA_CU', s4_m2: 'TANYA', s4_n: 'NIGEL' };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true });
  if (L === 'hook') { if (t < SP.hook_m.t - 0.1) return f(SH.COVER); if (t < SPOT) return f(SH.TWO); if (t < SP.hook_v.t - 0.1) return f(SH.LENA_H); return f(SH.VERA_H); }
  if (L === 'S2' && t >= ev('S2', 'push') - 0.2 && t < SP.s2_m.t - 0.1) return f(SH.VERA);
  if (L === 'S4') { if (t >= ev('S4', 'cut') && t < SP.s4_m.t) return f(SH.TANYA); if (t >= WALK - 0.1 && t < SP.s4_n.t - 0.5) return f(SH.WIDE); if (t >= ev('S4', 'clink') + 0.3) return f(SH.WIDE); }
  const cur = TL.speech.find(s => t >= s.t - 0.1 && t < s.t + s.d + 0.3); if (cur && LINE[cur.id]) return f(SH[LINE[cur.id]]);
  const next = TL.speech.find(s => t >= s.t - 0.7 && t < s.t); if (next && LINE[next.id]) return f(SH[LINE[next.id]]);
  return f(L === 'S3' ? SH.TWO : SH.WIDE); }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'impact_soft', 'clank', 'scratch']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- overlays
function spotlight(c, t, heads, proj) { const k = spotK(t); if (k <= 0 || !heads.lena || heads.lena.x > 1e4 || heads.lena.x < -1e4) return; const p = proj({ x: heads.lena.x, y: heads.lena.y + heads.lena.hh * 2 });
  c.save(); c.globalAlpha = 0.55 * k; c.fillStyle = '#1A1420'; c.beginPath(); c.rect(0, 0, W, HH); c.moveTo(p.x + 330, p.y); c.ellipse(p.x, p.y, 330, 900, 0, 0, TAU, true); c.fill('evenodd'); c.restore();
  c.save(); c.globalAlpha = 0.28 * k; const g = c.createLinearGradient(p.x, -200, p.x, p.y); g.addColorStop(0, '#FFF6C8'); g.addColorStop(1, 'rgba(255,246,200,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(p.x - 60, -100); c.lineTo(p.x + 60, -100); c.lineTo(p.x + 330, p.y); c.lineTo(p.x - 330, p.y); c.closePath(); c.fill(); c.restore(); }
function streakPhone(c, t) { const k = eBack(P(t, PH0, PH0 + 0.3), 1.8) * (1 - P(t, PH1, PH1 + 0.25)); if (k <= 0) return;
  K.phone(c, 760, 1270, 0.78 * k, (d, w, h) => { d.fillStyle = '#FFF4E0'; d.fillRect(0, 0, w, h); d.fillStyle = '#4CAF6A'; d.fillRect(0, 0, w, 110); fitTxt(d, 'ENGLISH', w / 2, 58, 52, '#FFFFFF', w - 40);
    const fl = 1 + 0.06 * Math.sin(t * 12); d.save(); d.translate(w / 2, 330); d.scale(fl, fl); paint(d, q => { q.moveTo(0, -150); q.quadraticCurveTo(110, -40, 90, 40); q.quadraticCurveTo(70, 120, 0, 130); q.quadraticCurveTo(-70, 120, -90, 40); q.quadraticCurveTo(-100, -50, -30, -90); q.quadraticCurveTo(-20, -30, 10, -20); q.quadraticCurveTo(20, -90, 0, -150); q.closePath(); }, '#FF8A1E', { lw: 6 });
      paint(d, q => { q.moveTo(0, -20); q.quadraticCurveTo(50, 40, 40, 80); q.quadraticCurveTo(25, 120, 0, 120); q.quadraticCurveTo(-25, 120, -40, 80); q.quadraticCurveTo(-45, 30, 0, -20); q.closePath(); }, '#FFD23E', { lw: 0 }); d.restore();
    fitTxt(d, '365', w / 2, 540, 150, '#E0474C', w - 40); fitTxt(d, 'ДНЕЙ ПОДРЯД', w / 2, 650, 50, '#2B2F3A', w - 40); }, 0.06); }
function coverBadge(c, t) { const k = 1 - P(t, 0.25, 0.4); if (k <= 0) return; const p = 1 + 0.04 * Math.sin(t * 8); c.save(); c.globalAlpha = k; c.translate(540, 1760); c.scale(p, p); c.rotate(-0.03); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -420 + 6, -62 + 10, 840, 124, 62); c.fill(); c.fillStyle = '#FFE15A'; rr(c, -420, -62, 840, 124, 62); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; rr(c, -420, -62, 840, 124, 62); c.stroke();
  fitTxt(c, 'SAY SOMETHING IN ENGLISH!', 0, 4, 54, '#E0474C', 760); c.restore(); }
function sticker(c, t, t0, en, ru, y) { const k = eBack(P(t, t0, t0 + 0.3), 2.2); if (k <= 0) return; c.save(); c.translate(540, y); c.scale(k, k); c.rotate(-0.02);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -460 + 8, -84 + 10, 920, 168, 40); c.fill(); c.fillStyle = '#FFFDF8'; rr(c, -460, -84, 920, 168, 40); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 7; c.stroke();
  fitTxt(c, en, 0, -24, 62, '#2E9E5A', 840); fitTxt(c, ru, 0, 42, 44, '#6A6A6A', 840, 'Nun9'); c.restore(); }
function recap(c, t) { const r0 = ev('S4', 'recap'); if (t < r0 - 0.2) return; const k = P(t, r0 - 0.2, r0 + 0.2);
  c.save(); c.globalAlpha = 0.45 * k; c.fillStyle = '#1A1420'; c.fillRect(0, 0, W, HH); c.restore();
  sticker(c, t, r0, 'PUT SOMEONE ON THE SPOT', 'поставить в неловкое положение', 560); sticker(c, t, r0 + 0.55, 'BETWEEN YOU AND ME', 'между нами', 760); sticker(c, t, r0 + 1.1, 'SHOW OFF', 'хвастаться', 960);
  const qa = ev('S4', 'ask') - 0.1, q = eBack(P(t, qa, qa + 0.3), 2); if (q > 0) { c.save(); c.translate(540, 1200); c.scale(q, q); UI.font(c, 'Unb9', 50); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, 'А ТЕБЯ ПРОСИЛИ', 0, -40, C.white, C.oliveD, 12); UI.strokeText(c, '«СКАЖИ ПО-АНГЛИЙСКИ»?', 0, 36, C.gold, C.oliveD, 12); UI.font(c, 'Unb9', 40); UI.strokeText(c, 'ПИШИ В КОММЕНТЫ!', 0, 120, C.white, C.oliveD, 10); c.restore(); } }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  const r = drawWorld(c, t, L, cam, tag, sh), heads = r.heads, M = r.M, proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f });
  Hq.vignette(c, W, HH, 0.26); spotlight(c, t, heads, proj);
  if (t >= SPOT && t < SPOT + 0.18) { c.save(); c.globalAlpha = 0.7 * (1 - P(t, SPOT, SPOT + 0.18)); c.fillStyle = '#FFF6C8'; c.fillRect(0, 0, W, HH); c.restore(); }
  const names = { tanya: ['МАМА', '#C2504A'], vera: ['ТЁТЯ ВЕРА', '#6A3A6A'], nigel: ['ДЯДЯ НАЙДЖЕЛ', '#4A4F5C'] };
  streakPhone(c, t);
  if (L === 'hook') { coverBadge(c, t); const hookProj = p => { const q = proj(p); return q.x < 0 || q.x > W ? { x: q.x < 0 ? 60 : W - 60, y: 1050 } : q; };
    K.bubbles(c, t, sc, heads, hookProj, { heroine: 'lena', cleanChunks: true, names, hold: { hook_m: 0.05, hook_v: 0.3 } }); const rk = 1 - P(t, SP.hook_m.t - 0.35, SP.hook_m.t - 0.05); if (rk > 0) { c.save(); c.globalAlpha = rk; K.titleRibbon(c, t, 540, 455); c.restore(); } UI.watermark(c); Hq.grain(c, W, HH, t, 0.045); return; }
  if (L === 'S4' && t > SP.s4_m.t + 0.3 && t < endOf('s4_m') + 0.2) K.pop(c, t, 'ОНА ВСЁ ПОНЯЛА!', SP.s4_m.t + 0.4, endOf('s4_m') + 0.1, 540, 1730, C.gold, -0.04, 70);
  K.bubbles(c, t, sc, heads, proj, { heroine: 'lena', cleanChunks: true, names, hold: { s2_v: 0.3, s3_n: 0.3, s3_l3: 0.9, s4_v: 0.6, s4_l: 0.3, s4_n: 0.3 } });
  recap(c, t);
  UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
}
E.run('momshow', NF, renderFrame);
