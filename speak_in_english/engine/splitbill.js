// "When you try to split the bill" episode renderer (hard_cut camera): node splitbill.js start end out.mp4 | --png=f1,f2
// One restaurant table with four seats: friend 1, HER, friend 2 and an EMPTY 4th seat with a silver plate + a big red lobster on it from the very first frame (the setup for the C2 twist).
// Inserts: receipt (TOTAL $300 / full list with LOBSTER $120), calculator (B1). C1 flashback: sepia, the waiter joins them for the cheesecake and sits at the lobster seat.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/splitbill/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];

// ---------------- cast
const HER = { ...BASE.her_restaurant };
const FR1 = { ...BASE.jay, top: { type: 'tee', col: '#E27D3C' } };
const FR2 = { ...BASE.tony, top: { type: 'polo', col: '#3C6FB4' } };
const WTR = { ...BASE.oliver, top: { type: 'tee', col: '#FFFDF8' }, bottom: { type: 'trousers', col: '#2B2F3A' } };
const G = { her: geom(HER), fr1: geom(FR1), fr2: geom(FR2), wtr: geom(WTR) };
function txt(c, s, x, y, size, col, font = 'Unb9', align = 'center') { c.font = `${size}px ${font}`; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
const SEAT = 330, TOP = -500;                 // seated upper body is dropped by SEAT; the table top is at y = TOP
const SX = { fr1: -620, her: -210, fr2: 230, seat4: 650 };   // seat x positions
const WSTAND = 1080;                          // waiter stands at the right end of the table
const forkItem = (ctx) => { ctx.save(); ctx.rotate(0.35); ctx.strokeStyle = '#C9CED6'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -120); ctx.stroke(); for (const dx of [-12, 0, 12]) { ctx.beginPath(); ctx.moveTo(dx, -120); ctx.lineTo(dx, -165); ctx.stroke(); } ctx.restore(); };
const forkCake = (ctx) => { forkItem(ctx); ctx.save(); ctx.rotate(0.35); ctx.fillStyle = '#FFF1C9'; ctx.beginPath(); ctx.moveTo(-22, -170); ctx.lineTo(22, -170); ctx.lineTo(0, -215); ctx.fill(); ctx.restore(); };
const billItem = (ctx) => { ctx.save(); ctx.rotate(-0.1); ctx.fillStyle = '#FFFDF8'; rr(ctx, -45, -170, 90, 170, 6); ctx.fill(); ctx.fillStyle = '#C9C3B4'; for (let k = 0; k < 6; k++) ctx.fillRect(-32, -150 + k * 24, 64, 5); ctx.fillStyle = '#E0474C'; ctx.fillRect(-32, -20, 64, 8); ctx.restore(); };
const trayItem = (ctx) => { ctx.fillStyle = '#C9CED6'; ctx.beginPath(); ctx.ellipse(0, -10, 120, 24, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#FFFDF8'; rr(ctx, -40, -80, 80, 70, 6); ctx.fill(); };

// ---------------- the room (prerendered, softly blurred)
const BX0 = -2400, BY0 = -3000, BW = 4800, BH = 4800, BS = 0.5;
function drawRestaurant(c) {
  c.fillStyle = '#7A2E3A'; c.fillRect(BX0, BY0, BW, BH);                                                           // burgundy wall
  c.fillStyle = 'rgba(255,255,255,.07)'; for (let x = BX0; x < BX0 + BW; x += 220) c.fillRect(x, BY0, 90, 3000);
  c.fillStyle = '#5A1F2A'; c.fillRect(BX0, -1500, BW, 20); c.fillStyle = '#5E3A2A'; c.fillRect(BX0, -1480, BW, 1240);          // wainscot
  for (let x = BX0 + 60; x < BX0 + BW; x += 300) { c.fillStyle = 'rgba(0,0,0,.18)'; rr(c, x, -1420, 240, 1100, 12); c.fill(); }
  c.fillStyle = '#2B3560'; rr(c, -1500, -2500, 700, 900, 14); c.fill(); c.fillStyle = '#FFE7B8'; for (let i = 0; i < 14; i++) c.fillRect(-1480 + hash(i) * 660, -2480 + hash(i + 4) * 860, 36, 60);   // night window with city lights
  c.strokeStyle = '#FFFDF8'; c.lineWidth = 16; c.strokeRect(-1500, -2500, 700, 900); c.beginPath(); c.moveTo(-1150, -2500); c.lineTo(-1150, -1600); c.stroke();
  for (const [x, w, h, col] of [[700, 420, 300, '#F2C14E'], [1250, 340, 420, '#7FB0D8'], [1700, 400, 300, '#EE5E9A']]) { c.fillStyle = '#C9A57E'; rr(c, x - 14, -2300 - 14, w + 28, h + 28, 8); c.fill(); c.fillStyle = col; rr(c, x, -2300, w, h, 4); c.fill(); }   // framed pictures
  for (const x of [-700, 300, 1300]) { c.strokeStyle = '#2B2F3A'; c.lineWidth = 6; c.beginPath(); c.moveTo(x, -3000); c.lineTo(x, -2150); c.stroke(); c.fillStyle = '#FFE7B8'; c.beginPath(); c.moveTo(x - 150, -2000); c.lineTo(x + 150, -2000); c.lineTo(x + 70, -2160); c.lineTo(x - 70, -2160); c.fill();
    const g = c.createRadialGradient(x, -2000, 10, x, -2000, 520); g.addColorStop(0, 'rgba(255,225,160,.55)'); g.addColorStop(1, 'rgba(255,225,160,0)'); c.fillStyle = g; c.fillRect(x - 520, -2520, 1040, 1040); }
  for (const [x, s] of [[-1900, 1], [2000, 1.1]]) { c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(x, -700, 300 * s, 120, 0, 0, TAU); c.fill(); c.fillRect(x - 12, -700, 24, 450); }   // other tables, dark in the background
  c.fillStyle = '#4A7A4A'; for (let i = 0; i < 7; i++) { c.beginPath(); c.ellipse(-2050 + i * 40, -1000 - i * 70, 70, 190, -0.6 + i * 0.2, 0, TAU); c.fill(); } c.fillStyle = '#8A5A3A'; rr(c, -2120, -420, 260, 230, 20); c.fill();
  c.fillStyle = '#8A5A3A'; c.fillRect(BX0, -240, BW, 2000); c.fillStyle = 'rgba(0,0,0,.10)'; for (let x = BX0; x < BX0 + BW; x += 240) c.fillRect(x, -240, 8, 2000);       // wooden floor
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };   // drawn sharp, blurred once
const BG = { rest: mkBG(drawRestaurant) };
function chair(c, x, col = '#5A3A2A') { c.fillStyle = col; rr(c, x - 150, -1040, 300, 560, 40); c.fill(); c.fillStyle = 'rgba(255,255,255,.12)'; rr(c, x - 120, -1010, 240, 500, 30); c.fill(); }
function lobsterPlate(c, x, t) { c.save(); c.translate(x, TOP + 6); c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(0, 10, 200, 34, 0, 0, TAU); c.fill(); c.fillStyle = '#E8ECF2'; c.beginPath(); c.ellipse(0, 0, 190, 36, 0, 0, TAU); c.fill(); c.strokeStyle = '#B9C1CD'; c.lineWidth = 5; c.stroke();
  paint(c, q => q.e(0, -52, 120, 52), '#E0474C', { sd: 6, hd: 3, lw: 4 }); paint(c, q => q.e(110, -64, 62, 30), '#C93A40', { sd: 6, hd: 3, lw: 4 });                          // body + tail
  for (const s of [-1, 1]) { paint(c, q => { q.m(s * 80, -80); q.l(s * 150, -150); q.l(s * 112, -170); q.l(s * 190, -210); q.l(s * 205, -150); q.l(s * 130, -90); q.z(); }, '#E0474C', { sd: 6, hd: 3, lw: 4 }); }   // claws
  c.strokeStyle = '#E0474C'; c.lineWidth = 4; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-50 + i * 34, -30); c.lineTo(-70 + i * 44, 10); c.stroke(); }
  c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(-130, -14, 20, 0, TAU); c.fill(); c.strokeStyle = '#4CAF6A'; c.lineWidth = 5; c.beginPath(); c.arc(-130, -14, 20, 0, TAU); c.stroke();     // lemon
  c.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(-10 + i * 30, -118 - ((t * 40 + i * 30) % 60), 6, 0, TAU); c.fill(); }   // steam
  c.restore(); }
// table (in front of the seated people): top, cloth, plates; the tags/price labels are part of it
const TAGP = [['SALAD  $15', -190, 'p1'], ['BURGER  $25', -560, 'p2'], ['STEAK  $80', 190, 'p3']];
function tableFront(c, t, L, who = 'all') {
  c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(-960, -240, 1920, 40);
  c.fillStyle = '#FFFDF8'; c.fillRect(-920, TOP, 1840, 330); c.fillStyle = '#E0474C'; for (let y = TOP + 20; y < TOP + 320; y += 60) for (let x = -920 + ((y / 60) % 2) * 60; x < 920; x += 120) c.fillRect(x, y, 60, 60); c.globalAlpha = 0.14; c.fillStyle = '#000'; c.fillRect(-920, TOP + 280, 1840, 50); c.globalAlpha = 1;
  paint(c, q => { q.m(-960, TOP - 36); q.l(960, TOP - 36); q.l(930, TOP + 18); q.l(-930, TOP + 18); q.z(); }, '#F4EAD8', { sd: 4, hd: 2, lw: 4 });   // table top edge
  const plate = (x, col, kind) => { c.fillStyle = '#E8ECF2'; c.beginPath(); c.ellipse(x, TOP - 38, 150, 26, 0, 0, TAU); c.fill();
    if (kind === 'salad') { c.fillStyle = '#6DBE6A'; c.beginPath(); c.ellipse(x, TOP - 54, 100, 30, 0, 0, TAU); c.fill(); c.fillStyle = '#E0474C'; c.beginPath(); c.arc(x - 30, TOP - 66, 14, 0, TAU); c.fill(); c.beginPath(); c.arc(x + 36, TOP - 60, 12, 0, TAU); c.fill(); }
    if (kind === 'burger') { c.fillStyle = '#E0A25A'; c.beginPath(); c.ellipse(x, TOP - 78, 90, 36, 0, Math.PI, 0); c.fill(); c.fillStyle = '#6A3A22'; c.fillRect(x - 92, TOP - 74, 184, 18); c.fillStyle = '#E0A25A'; c.fillRect(x - 86, TOP - 56, 172, 18); }
    if (kind === 'steak') { c.fillStyle = '#7A3A22'; c.beginPath(); c.ellipse(x, TOP - 56, 118, 30, -0.05, 0, TAU); c.fill(); c.strokeStyle = '#4A2212'; c.lineWidth = 5; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(x + i * 30 - 12, TOP - 68); c.lineTo(x + i * 30 + 12, TOP - 44); c.stroke(); } } };
  plate(SX.her, 0, 'salad'); plate(SX.fr1, 0, 'burger'); plate(SX.fr2, 0, 'steak');
  if (L !== 'hook' || true) { // appetizer basket in the middle (one mozzarella stick left from B1 on)
    c.fillStyle = '#C9A57E'; c.beginPath(); c.ellipse(0, TOP - 40, 100, 22, 0, 0, TAU); c.fill(); const n = (L === 'hook' || L === 'A1' || L === 'A2') ? 4 : 1; c.fillStyle = '#F2C14E'; for (let i = 0; i < n; i++) rr(c, -60 + i * 38, TOP - 76 - (i % 2) * 10, 30, 56, 8), c.fill(); }
  if (['B2', 'C1', 'C2'].includes(L)) { c.fillStyle = '#E8ECF2'; c.beginPath(); c.ellipse(430, TOP - 38, 130, 22, 0, 0, TAU); c.fill(); c.fillStyle = '#FFF1C9'; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(390 + i * 18, TOP - 42 + (i % 2) * 6, 6, 0, TAU); c.fill(); } for (const dx of [-30, 30]) { c.strokeStyle = '#C9CED6'; c.lineWidth = 6; c.beginPath(); c.moveTo(405 + dx, TOP - 30); c.lineTo(455 + dx, TOP - 52); c.stroke(); } }   // empty dessert plate + forks (B2 on)
  if (L === 'hook' || (L === 'A1' && t < ev('A1', 'billin') + 1.5) || L === 'A2' || L === 'B1') {   // the huge bill lies on the table in front of her, hanging off the edge
    if (L === 'hook' || L === 'A1') { c.save(); c.translate(-400, TOP - 16); c.rotate(-0.04); c.fillStyle = '#FFFDF8'; rr(c, -60, -140, 220, 190, 6); c.fill(); c.strokeStyle = '#C9C3B4'; c.lineWidth = 3; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(-40, -112 + k * 26); c.lineTo(140, -112 + k * 26); c.stroke(); } c.fillStyle = '#E0474C'; fitTxt(c, '$300', 50, 20, 40, '#E0474C', 150); c.restore(); } }
}
function tags(c, t) { // price tags above the plates, A2 (appear one by one, stay until the narrator)
  const A = SP.a2_h.t + 1.0, B = SP.a2_f.t, Cc = SP.a2_f2.t;
  [['SALAD  $15', SX.her, A], ['BURGER  $25', SX.fr1, B], ['STEAK  $80', SX.fr2, Cc]].forEach(([s, x, a], i) => { const k = eBack(P(t, a, a + 0.3), 2.2) * (1 - clamp(P(t, SP.a2_nar.t - 0.05, SP.a2_nar.t + 0.2))); if (k <= 0) return;
    c.save(); c.translate(x, TOP - 190 - (i === 2 && t > ev('A2', 'p4') ? Math.sin((t - ev('A2', 'p4')) * 14) * 8 : 0)); c.scale(k, k); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -150 + 5, -34 + 8, 300, 68, 34); c.fill(); c.fillStyle = i === 2 ? '#E0474C' : '#FFFDF8'; c.strokeStyle = C.oliveD; c.lineWidth = 5; rr(c, -150, -34, 300, 68, 34); c.fill(); c.stroke(); fitTxt(c, s, 0, 3, 36, i === 2 ? '#FFFFFF' : C.oliveD, 260); c.restore(); }); }

// ---------------- timing helpers
const waiterX = (t, L) => { if (L === 'A1') { const a = ev('A1', 'billin'), b = endOf('a1_w') + 0.4; return t < b ? lerp(1900, WSTAND, eOut(P(t, a, a + 0.8))) : lerp(WSTAND, 1900, eIn(P(t, b, b + 0.8))); }
  if (L === 'B2') { const a = ev('B2', 'waiter'); return lerp(1900, WSTAND, eOut(P(t, a, a + 0.8))); }
  if (L === 'C2' && t > ev('C2', 'sit') - 0.5) return lerp(WSTAND, SX.seat4, eIO(P(t, ev('C2', 'sit') - 0.5, ev('C2', 'sit')))); return WSTAND; };
const waiterPresent = (t, L) => (L === 'A1' && t > ev('A1', 'billin') && t < endOf('a1_w') + 1.4) || L === 'B2' || L === 'C1' || L === 'C2';
const waiterSeated = (t, L) => L === 'C2' && t >= ev('C2', 'sit');
const flashOn = (t, L) => L === 'C1' && t >= ev('C1', 'flash') && t < ev('C1', 'back');
const apronOff = (t, L) => L === 'C2' && t > ev('C2', 'apron');

// ---------------- characters
function gest(st, g, who, t, side, base) { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } }
const hang = (g, s) => reach(g, s, s * g.sw * 0.8, g.ySh + 330);
const onTable = (g, s) => reach(g, s, s * g.sw * 0.7, g.ySh + 335, { planar: true });
const chin = (g, s) => reach(g, s, s * g.hw * 0.5, g.headY + g.hh * 0.85);
function seated(g, t) { return { t, mood: 'neutral', turn: 0, look: 0, legPose: 'sit', drop: SEAT, legs: false, armL: onTable(g, -1), armR: onTable(g, 1), items: {} }; }
function herState(t, L) { const g = G.her, st = { ...seated(g, t), talk: talk('her', t), mood: 'happy', turn: 0.1, look: 0.2 };
  if (L === 'hook') { st.mood = 'happy'; if (t > hev('lie') - 0.8 || t > hev('bill') + 0.3) { st.mood = 'shock'; st.blink = 0; } if (speaking('hook_h', t, 0.05, 0.3) || speaking('hook_h2', t, 0.05, 0.3)) { st.mood = 'angry'; st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 300, { planar: true, fist: true }); st.armR = reach(g, 1, g.sw * 1.6, g.ySh - 300, { planar: true, fist: true }); } return st; }
  if (L === 'A1') { st.mood = 'happy'; if (speaking('a1_h', t, 0.05, 0.3) || speaking('a1_h2', t, 0.05, 0.3)) st.mood = 'happy'; if (t > ev('A1', 'total') - 0.05) { st.mood = 'shock'; st.blink = 0; } if (speaking('a1_h3', t, 0.05, 0.4)) { st.mood = 'shock'; st.armL = reach(g, -1, -g.sw * 1.7, g.ySh - 330, { planar: true, fist: true }); st.armR = reach(g, 1, g.sw * 1.7, g.ySh - 330, { planar: true, fist: true }); } }
  if (L === 'A2') { st.mood = 'worried'; if (speaking('a2_h', t, 0.05, 0.3)) { st.mood = 'annoyed'; gest(st, g, 'her', t, -1, 160); } if (speaking('a2_h2', t, 0.05, 0.3)) { st.mood = 'angry'; st.armR = reach(g, 1, g.sw * 1.8, g.ySh - 200, { planar: true, fist: true }); } if (t > SP.a2_f3.t) st.mood = 'annoyed'; }
  if (L === 'B1') { st.mood = 'neutral'; if (speaking('b1_h', t, 0.05, 0.3)) { st.mood = 'happy'; gest(st, g, 'her', t, -1, 160); } if (speaking('b1_h2', t, 0.05, 0.3)) { st.mood = 'smug'; gest(st, g, 'her', t, 1, 160); } if (t > ev('B1', 'looks') - 0.05) { st.mood = 'skeptical'; st.look = -0.5 + Math.sin((t - ev('B1', 'looks')) * 3) * 0.8; st.turn = Math.sin((t - ev('B1', 'looks')) * 3) * 0.4; } }
  if (L === 'B2') { st.mood = 'neutral'; st.turn = 0.4; st.look = 0.9; if (speaking('b2_h', t, 0.05, 0.3)) { st.mood = 'smug'; st.turn = 0.4; gest(st, g, 'her', t, 1, 160); } if (speaking('b2_h2', t, 0.05, 0.3)) { st.mood = 'surprised'; } if (speaking('b2_h3', t, 0.05, 0.3)) st.mood = 'shock'; if (t > ev('B2', 'freeze') - 0.05) { st.mood = 'shock'; st.blink = 0; st.turn = 0; st.look = 0; } }
  if (L === 'C1') { st.mood = 'skeptical'; st.turn = 0.4; st.look = 0.9; if (speaking('c1_h', t, 0.05, 0.2)) { st.mood = 'smug'; st.armR = chin(G.her, 1); } if (speaking('c1_h2', t, 0.05, 0.3)) { st.mood = 'angry'; st.armL = reach(g, -1, -g.sw * 1.5, g.ySh - 140, { planar: true }); } if (speaking('c1_h3', t, 0.05, 0.3)) { st.mood = 'annoyed'; st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 100, { planar: true }); st.armR = reach(g, 1, g.sw * 1.6, g.ySh - 100, { planar: true }); } }
  if (L === 'C2') { st.mood = 'smug'; st.turn = 0.4; st.look = 0.9; if (speaking('c2_h', t, 0.05, 0.3)) { st.armR = reach(g, 1, g.sw * 1.8, g.ySh - 100, { planar: true }); } if (speaking('c2_h2', t, 0.05, 0.3)) st.mood = 'happy'; if (t >= SP.c2_h3.t - 0.2) { st.mood = 'worried'; }
    if (t > ev('C2', 'lob') - 0.05) { st.mood = 'shock'; st.blink = 0; st.turn = 0.2; st.look = 0.4; } if (speaking('c2_h4', t, 0.05, 0.3) || speaking('c2_h5', t, 0.05, 0.4)) { st.mood = 'angry'; st.armL = reach(g, -1, -g.sw * 1.7, g.ySh - 330, { planar: true, fist: true }); st.armR = reach(g, 1, g.sw * 1.7, g.ySh - 330, { planar: true, fist: true }); }
    if (t > SP.c2_w5.t) { st.mood = 'shock'; st.armL = onTable(g, -1); st.armR = onTable(g, 1); } if (t > ev('C2', 'sit') + 0.1) { st.mood = 'shock'; st.blink = 0; } if (speaking('c2_all', t, 0.0, 0.5)) { st.mood = 'angry'; st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 250, { planar: true, fist: true }); } }
  return st; }
function friendState(id, t, L) { const g = G[id], who = id, st = { ...seated(g, t), talk: talk(id, t), mood: 'happy', turn: id === 'fr1' ? 0.3 : -0.3, look: id === 'fr1' ? 0.6 : -0.6, headX: Math.sin(t * 3 + (id === 'fr1' ? 0 : 2)) * 4 };
  if (id === 'fr1') st.items = { R: forkItem }; if (id === 'fr2') st.items = { L: forkItem };
  if (L === 'hook') { st.mood = 'happy'; if (t > hev('bill')) { st.mood = id === 'fr1' ? 'worried' : 'happy'; } }
  if (L === 'A1') { st.mood = 'happy'; if (t > ev('A1', 'total')) st.mood = id === 'fr1' ? 'worried' : 'neutral'; }
  if (L === 'A2') { st.mood = id === 'fr1' ? 'neutral' : 'smug'; if (id === 'fr1' && speaking('a2_f', t, 0.05, 0.3)) { st.mood = 'smug'; gest(st, g, 'fr1', t, 1, 160); } if (id === 'fr2' && speaking('a2_f2', t, 0.05, 0.4)) { st.mood = 'smug'; st.armL = reach(g, -1, -g.sw * 0.5, g.ySh + 200, { planar: true }); } if (id === 'fr2' && speaking('a2_f3', t, 0.05, 0.6)) { st.mood = 'happy'; st.blink = 1; st.laugh = true; } }
  if (L === 'B1') { st.mood = 'neutral'; if (id === 'fr1' && speaking('b1_f', t, 0.05, 0.3)) { st.mood = 'happy'; gest(st, g, 'fr1', t, 1, 160); } if (id === 'fr2' && speaking('b1_f2', t, 0.05, 0.3)) { st.mood = 'annoyed'; gest(st, g, 'fr2', t, -1, 160); } if (id === 'fr1' && speaking('b1_f3', t, 0.05, 0.6)) { st.mood = 'skeptical'; st.turn = 0.1; st.look = 0.2; }
    if (t > ev('B1', 'looks') - 0.05) { st.mood = 'skeptical'; st.look = (id === 'fr1' ? 1 : -1) * (0.3 + Math.abs(Math.sin((t - ev('B1', 'looks')) * 3)) * 0.5); } }
  if (L === 'B2') { st.mood = 'neutral'; st.turn = id === 'fr1' ? 0.5 : -0.5; st.look = id === 'fr1' ? 1 : -1; if (t > ev('B2', 'freeze') - 0.05) { st.mood = 'worried'; st.blink = 0; } if (speaking('b2_all', t, 0.0, 0.5)) { st.mood = 'happy'; st.laugh = true; st.armL = reach(g, -1, -g.sw * 1.5, g.ySh - 260, { planar: true }); st.armR = reach(g, 1, g.sw * 1.5, g.ySh - 260, { planar: true }); } }
  if (L === 'C1') { st.mood = 'neutral'; if (id === 'fr1' && speaking('c1_f', t, 0.05, 0.3)) { st.mood = 'happy'; gest(st, g, 'fr1', t, 1, 160); } if (id === 'fr2') st.mood = 'smug'; }
  if (L === 'C2') { st.mood = 'neutral'; st.turn = id === 'fr1' ? 0.5 : -0.5; st.look = id === 'fr1' ? 1 : -1; if (t > ev('C2', 'lob')) st.mood = 'shock'; if (speaking('c2_all', t, 0.0, 0.5)) { st.mood = 'angry'; st.armL = reach(g, -1, -g.sw * 1.5, g.ySh - 250, { planar: true, fist: true }); st.armR = reach(g, 1, g.sw * 1.5, g.ySh - 250, { planar: true, fist: true }); } }
  return st; }
function waiterState(t, L) { const g = G.wtr, seat = waiterSeated(t, L), st = { t, talk: talk('wtr', t), mood: 'neutral', turn: -0.45, look: -0.8, armL: hang(g, -1), armR: hang(g, 1), items: {}, headX: 0 };
  if (seat) Object.assign(st, { legPose: 'sit', drop: SEAT, legs: false, armL: onTable(g, -1), armR: onTable(g, 1), turn: -0.1, look: -0.2 });
  const moving = (L === 'A1' && (t < ev('A1', 'billin') + 0.8 || t > endOf('a1_w') + 0.4)) || (L === 'B2' && t < ev('B2', 'waiter') + 0.8) || (L === 'C2' && t > ev('C2', 'sit') - 0.5 && t < ev('C2', 'sit')); if (moving) st.legPose = 'walk';
  if (L === 'A1') { st.mood = 'neutral'; if (t < endOf('a1_w') + 0.4) { st.items = { R: billItem }; st.armR = reach(g, 1, -g.sw * 0.6, g.ySh + 250, { planar: true }); } }
  if (L === 'B2') { st.mood = 'happy'; if (speaking('b2_w4', t, 0.05, 0.4)) st.mood = 'smug'; gest(st, g, 'wtr', t, -1, 130); }
  if (L === 'C1') { st.mood = 'happy'; if (speaking('c1_w2', t, 0.05, 0.4)) { st.mood = 'smug'; st.laugh = true; st.armR = chin(g, 1); } gest(st, g, 'wtr', t, -1, 130); }
  if (L === 'C2') { st.mood = 'smug'; gest(st, g, 'wtr', t, -1, 130); if (speaking('c2_w3', t, 0.05, 0.3)) { st.mood = 'happy'; } if (speaking('c2_w5', t, 0.05, 0.3)) { st.mood = 'smug'; st.armL = reach(g, -1, -g.sw * 0.5, g.ySh + 140); st.armR = reach(g, 1, g.sw * 0.5, g.ySh + 140); }
    if (seat) { st.mood = 'happy'; if (speaking('c2_w6', t, 0.05, 0.5)) { st.laugh = true; st.armR = reach(g, 1, g.sw * 1.6, g.ySh - 120, { planar: true }); } st.items = { R: forkItem }; } }
  if (!apronOff(t, L) && L !== 'hook') st.afterTorso = cc => { cc.fillStyle = '#FFFDF8'; cc.strokeStyle = '#C9C3B4'; cc.lineWidth = 4; rr(cc, -g.sw * 0.7, g.ySh + 90, g.sw * 1.4, seat ? 280 : 700, 24); cc.fill(); cc.stroke(); cc.fillStyle = '#C9C3B4'; cc.fillRect(-g.sw * 0.35, g.ySh + 20, 14, 80); cc.fillRect(g.sw * 0.35 - 14, g.ySh + 20, 14, 80); };
  return st; }
function flashWaiter(t) { const a = ev('C1', 'flash'), s = ev('C1', 'sit'), g = G.wtr; const x = lerp(1500, SX.seat4, eOut(P(t, a + 0.3, s - 0.2))), sit = t >= s - 0.1;
  const st = { t, talk: 0, mood: 'happy', turn: -0.3, look: -0.6, armL: hang(g, -1), armR: hang(g, 1), items: {}, legPose: sit ? 'sit' : 'walk', afterTorso: waiterState(t, 'C1').afterTorso };
  if (sit) Object.assign(st, { drop: SEAT, legs: false, armL: onTable(g, -1), armR: onTable(g, 1), items: { R: t > s + 0.6 ? forkCake : forkItem }, mood: t > s + 0.7 ? 'happy' : 'surprised', laugh: t > s + 0.9 });
  return { st, x }; }

// ---------------- the world: set + characters by shot tag (clean singles draw only the tagged character)
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
const TAGS = { tbl: ['her', 'fr1', 'fr2', 'wtr'], flash: ['her', 'fr1', 'fr2', 'wtr'], her: ['her'], fr1: ['fr1'], fr2: ['fr2'], wtr: ['wtr'] };
function world(c, t, L, tag) { const who = TAGS[tag] || TAGS.tbl, heads = {}, fl = tag === 'flash';
  c.drawImage(BG.rest, BX0, BY0, BW, BH);
  for (const x of [SX.fr1, SX.her, SX.fr2, SX.seat4]) chair(c, x);
  if (apronOff(t, L)) { c.fillStyle = '#FFFDF8'; c.strokeStyle = '#C9C3B4'; c.lineWidth = 4; rr(c, SX.seat4 - 110, -840, 220, 300, 14); c.fill(); c.stroke(); }
  if (fl || waiterSeated(t, L)) { /* waiter sits at the 4th seat */ }
  if (who.includes('fr1')) heads.fr1 = K.put(c, FR1, friendState('fr1', t, L), SX.fr1, 0);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), SX.her, 0);
  if (who.includes('fr2')) heads.fr2 = K.put(c, FR2, friendState('fr2', t, L), SX.fr2, 0);
  if (who.includes('wtr') && fl) { const fw = flashWaiter(t); heads.wtr = K.put(c, WTR, fw.st, fw.x, 0); }
  else if (who.includes('wtr') && waiterSeated(t, L)) heads.wtr = K.put(c, WTR, waiterState(t, L), waiterX(t, L), 0);
  tableFront(c, t, L); lobsterPlate(c, SX.seat4, t);
  if (fl) { const s = ev('C1', 'sit'); if (t < s + 0.4) { c.save(); c.translate(-80, TOP - 50); const k = eBack(P(t, ev('C1', 'flash') + 0.1, ev('C1', 'flash') + 0.5), 2); c.scale(k, k); c.fillStyle = '#E8ECF2'; c.beginPath(); c.ellipse(0, 0, 130, 26, 0, 0, TAU); c.fill(); c.fillStyle = '#FFF1C9'; c.beginPath(); c.moveTo(-60, -6); c.lineTo(60, -6); c.lineTo(40, -70); c.lineTo(-40, -70); c.fill(); c.fillStyle = '#E0474C'; c.beginPath(); c.arc(0, -78, 14, 0, TAU); c.fill(); c.restore(); } }
  if (who.includes('wtr') && !fl && !waiterSeated(t, L) && waiterPresent(t, L)) heads.wtr = K.put(c, WTR, waiterState(t, L), waiterX(t, L), 0);
  if (L === 'A2' && tag === 'tbl') tags(c, t);
  if (L === 'A1' && t > ev('A1', 'billin') && tag === 'tbl') K.mark(c, 'table', 0, TOP, 600);
  for (const k of ['fr1', 'fr2', 'wtr']) if (!heads[k]) heads[k] = OFF; if (!heads.her) heads.her = OFFL; heads.friends = heads.fr2 === OFF ? OFF : { x: (heads.fr1.x + heads.fr2.x) / 2, y: Math.min(heads.fr1.y, heads.fr2.y) - 40, hh: heads.fr1.hh };
  return heads; }

// ---------------- shots
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const dHY = k => G[k].headY + SEAT, hW = G.wtr.headY;
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const SH = { COVER: S(110, fy(dHY('her'), 0.64, 1190), 0.64, 'tbl'), WIDE: S(110, fy(dHY('her'), 0.62, 1000), 0.62, 'tbl'), CARD: S(110, fy(dHY('her'), 0.6, 1190), 0.6, 'tbl'), FLASH: S(250, fy(dHY('her'), 0.56, 1000), 0.56, 'flash'),
  HER: S(SX.her, fy(dHY('her'), 1.0), 1.0, 'her'), HER_R: S(SX.her, fy(dHY('her'), 1.0, 1120), 1.0, 'her'), HER_CU: S(SX.her, fy(dHY('her'), 1.6, 960), 1.6, 'her'), HER_CU_H: S(SX.her, fy(dHY('her'), 1.45, 1320), 1.45, 'her'),
  FR1: S(SX.fr1, fy(dHY('fr1'), 1.0), 1.0, 'fr1'), FR2: S(SX.fr2, fy(dHY('fr2'), 1.0), 1.0, 'fr2'), WT: S(WSTAND, fy(hW, 1.0), 1.0, 'wtr'), WT_SIT: S(SX.seat4, fy(dHY('wtr'), 1.0), 1.0, 'wtr'), WT_W: S(700, fy(hW, 0.8), 0.8, 'tbl'),
  RECEIPT: U('receipt', 1), CALC: U('calc', 2) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  const sp = id => speaking(id, t, 0.1, 0.15);
  if (L === 'hook') { if (t < hev('bill') - 0.05) return SH.COVER; if (t < SP.hook_h.t - 0.1) return f(SH.RECEIPT); return f(SH.HER_CU_H); }
  const u = t - sc.s, l = L.toLowerCase(), nar = SP[l + '_nar'];
  if (u < 1.15) return f(SH.WIDE);
  if (nar && t >= nar.t - 0.1) return f(SH.CARD);
  if (L === 'A1') { if (t > e('billin') - 0.05 && t < SP.a1_w.t - 0.1) return f(SH.WT_W); if (t > e('total') - 0.05 && t < SP.a1_h3.t - 0.1) return f(SH.RECEIPT); }
  if (L === 'A2' && (sp('a2_f') || sp('a2_f2') || sp('a2_f3'))) return f(SH.WIDE);
  if (L === 'B1') { if (t > e('calc') - 0.05 && t < e('looks') - 0.02) return f(SH.CALC); if (t > e('looks') - 0.02) return f(SH.WIDE); }
  if (L === 'B2') { if (t > e('waiter') - 0.05 && t < SP.b2_w.t - 0.1) return f(SH.WT_W); if (sp('b2_all')) return f(SH.WIDE); if (t > e('freeze') - 0.05) return f(SH.HER_CU); }
  if (L === 'C1') { if (t >= e('flash') - 0.03 && t < e('back') - 0.03) return f(SH.FLASH); }
  if (L === 'C2') { if (t > e('lob') - 0.05 && t < SP.c2_h4.t - 0.1) return f(SH.RECEIPT); if (sp('c2_h4')) return f(SH.HER_CU); if (t > e('sit') - 0.55 && t < SP.c2_w6.t - 0.1) return f(SH.WIDE); if (sp('c2_w6')) return f(SH.WT_SIT); if (sp('c2_all')) return f(SH.WIDE);
    if (sp('c2_w5')) return f(SH.WT); }
  const cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.1 && t < s.t + s.d + 0.25);
  const single = who => who === 'her' ? SH.HER : who === 'fr1' ? SH.FR1 : who === 'fr2' ? SH.FR2 : who === 'wtr' ? SH.WT : SH.WIDE;
  if (cur) return f(single(cur.who));
  const next = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.6 && t < s.t);
  if (next) return f(single(next.who));
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- inserts
function backdrop(c, id) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, '#2B3040'); g.addColorStop(1, '#171A24'); c.fillStyle = g; c.fillRect(0, 0, W, HH); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id }); }
function caption(c, s, k = 1, y = 1530, col = C.pinkL) { if (k <= 0) return; c.save(); c.globalAlpha = k; UI.textFit(c, 'Nun9', 46, s, 960); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, s, 540, y, col, C.oliveD, 10); c.restore(); }
const ROWS = [['SALAD', 15], ['BURGER', 25], ['STEAK', 80], ['APPETIZERS', 30], ['CHEESECAKE', 30], ['LOBSTER', 120]];
function receiptView(c, t, L) { backdrop(c, 'receipt'); const a = L === 'hook' ? hev('bill') : L === 'A1' ? ev('A1', 'total') : ev('C2', 'lob'), full = L === 'C2', k = eBack(P(t, a, a + 0.3), 1.6);
  const dy = L === 'hook' ? 270 : 0; c.save(); c.translate(540, 900 + dy); c.rotate(-0.02); c.scale(k, k); const h = full ? 1100 : 760;
  c.fillStyle = '#FFFDF8'; c.beginPath(); c.moveTo(-380, -h / 2); for (let i = 0; i <= 19; i++) c.lineTo(-380 + i * 40, -h / 2 + (i % 2 ? 22 : 0)); c.lineTo(380, h / 2); for (let i = 19; i >= 0; i--) c.lineTo(-380 + i * 40, h / 2 - (i % 2 ? 22 : 0)); c.closePath(); c.fill();
  fitTxt(c, 'THE GOLDEN FORK', 0, -h / 2 + 90, 54, '#2B2F3A', 640); fitTxt(c, 'TABLE 7  •  4 SEATS', 0, -h / 2 + 150, 32, '#8A8480', 640);
  if (full) { ROWS.forEach(([n, p], i) => { const y = -h / 2 + 250 + i * 110, kk = clamp(P(t, a + 0.15 + i * 0.12, a + 0.3 + i * 0.12)); c.save(); c.globalAlpha = kk; fitTxt(c, n, -330, y, 44, '#2B2F3A', 460, 'Unb9', 'left'); fitTxt(c, '$' + p, 330, y, 44, '#2B2F3A', 200, 'Unb9', 'right'); c.restore(); });
    const lk = eBack(P(t, a + 0.9, a + 1.25), 2.4), ly = -h / 2 + 250 + 5 * 110; if (lk > 0) { c.save(); c.translate(0, ly); c.scale(lk, lk); c.strokeStyle = '#E0474C'; c.lineWidth = 10; c.beginPath(); c.ellipse(0, 0, 400, 62, 0, 0, TAU); c.stroke(); c.restore(); }
    c.fillStyle = '#2B2F3A'; c.fillRect(-340, h / 2 - 230, 680, 6); fitTxt(c, 'TOTAL', -330, h / 2 - 150, 54, '#2B2F3A', 300, 'Unb9', 'left'); fitTxt(c, '$300', 330, h / 2 - 150, 64, '#2B2F3A', 260, 'Unb9', 'right');
    caption(c, '«ОМАР — $120. КТО ЕГО ЗАКАЗАЛ?»', clamp(P(t, a + 0.9, a + 1.2)), 1630); }
  else { c.fillStyle = '#E8E4DC'; for (let i = 0; i < 5; i++) c.fillRect(-300, -h / 2 + 250 + i * 70, 420 + (i % 2) * 140, 22);
    const tk = eBack(P(t, a + 0.1, a + 0.45), 2); c.save(); c.translate(0, 190); c.scale(tk, tk); c.rotate(-0.04); fitTxt(c, 'TOTAL', 0, -110, 60, '#2B2F3A', 500); fitTxt(c, '$300', 0, 10, 220, '#E0474C', 640); c.restore(); }
  c.restore();
  if (!full) caption(c, '«ИТОГО: $300»', clamp(P(t, a + 0.3, a + 0.5)), 1630); }
function calcView(c, t) { backdrop(c, 'calc'); const a = ev('B1', 'calc'), k = eBack(P(t, a, a + 0.3), 1.6), steps = [['15', 0.2], ['15 + 25 = 40', 0.55], ['40 + 80 = 120', 0.9], ['120 + 30 = 150', 1.25]];
  c.save(); c.translate(540, 920); c.scale(k, k); c.fillStyle = 'rgba(0,0,0,.3)'; rr(c, -330 + 10, -560 + 16, 660, 1120, 50); c.fill(); c.fillStyle = '#3A3F55'; rr(c, -330, -560, 660, 1120, 50); c.fill(); c.fillStyle = '#C9E8C4'; rr(c, -290, -520, 580, 260, 24); c.fill();
  let cur = steps[0][0]; for (const [s, d] of steps) if (t > a + d + 0.2) cur = s; const done = t > a + 1.25 + 0.2; fitTxt(c, cur, 270, -440, 54, '#2B3040', 520, 'Unb9', 'right');
  fitTxt(c, done ? '150' : cur.split('= ').pop(), 270, -350, 100, done ? '#2B3040' : '#5A6A5A', 540, 'Unb9', 'right');
  for (let r = 0; r < 4; r++) for (let q = 0; q < 4; q++) { c.fillStyle = q === 3 ? '#F2C14E' : '#6A708A'; rr(c, -290 + q * 150, -210 + r * 150, 130, 120, 20); c.fill(); }
  c.restore();
  const kk = eBack(P(t, a + 1.45, a + 1.75), 2.2); if (kk > 0) { c.save(); c.translate(540, 1530); c.scale(kk, kk); c.rotate(-0.03); c.fillStyle = '#FFFDF8'; c.strokeStyle = C.oliveD; c.lineWidth = 6; rr(c, -420, -70, 840, 140, 30); c.fill(); c.stroke(); fitTxt(c, 'ЗА ЕДУ: $150', -210, 0, 40, '#4CAF6A', 360); fitTxt(c, 'В СЧЁТЕ: $300', 210, 0, 40, '#E0474C', 360); c.restore(); } }

// ---------------- cover badge + frame
function coverBadge(c, t) { const p = 1 + 0.04 * Math.sin(t * 8); c.save(); c.translate(540, 1620); c.scale(p, p); c.rotate(-0.03); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -330 + 6, -62 + 10, 660, 124, 62); c.fill(); c.fillStyle = '#FFE15A'; rr(c, -330, -62, 660, 124, 62); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; rr(c, -330, -62, 660, 124, 62); c.stroke();
  fitTxt(c, "LET'S SPLIT IT!", 0, 4, 56, '#E0474C', 600); c.restore(); }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { K.outro(c, t, { q: ['ДЕЛИШЬ СЧЁТ', 'ИЛИ ПЛАТИШЬ САМ?'], rows: [['A2', 'I only had a salad.'], ['B1', 'Pay for what we ordered'], ['C1', 'I seem to recall…'], ['C2', 'Contribute to the bill']], cta: ['ОТПРАВЬ ДРУЗЬЯМ', 'ПЕРЕД УЖИНОМ'], heroX: 190, heroS: 0.42,
    hero: (cc, tt) => { const g = G.her, gw = G.wtr; K.put(cc, WTR, { t: tt, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, armL: hang(gw, -1), armR: reach(gw, 1, gw.sw * 2.0, gw.ySh - 330 + Math.sin(tt * 8) * 30, { planar: true }) }, 1250, 60);
      K.put(cc, HER, { t: tt, mood: 'happy', turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(tt * 8) * 30, { planar: true }), armR: hang(g, 1) }, 0, 0); } });
    Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'tbl';
  let heads, proj;
  if (tag.startsWith('ui:')) { c.save(); c.translate(sh.x, sh.y); if (tag === 'ui:receipt') receiptView(c, t, L); else calcView(c, t); c.restore(); heads = { her: OFFL, fr1: OFF, fr2: OFF, wtr: OFF, friends: OFF }; proj = p => p; }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26);
    if (tag === 'flash') { c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = '#D9B98A'; c.fillRect(0, 0, W, HH); c.restore(); c.save(); c.fillStyle = '#000'; c.fillRect(0, 0, W, 200); c.fillRect(0, HH - 200, W, 200); c.restore(); Hq.vignette(c, W, HH, 0.55); } }
  const names = { fr1: ['FRIEND', '#E27D3C'], fr2: ['FRIEND 2', '#3C6FB4'], wtr: ['WAITER', '#2F3E5C'], friends: ['ALL', '#EE5E9A'] };
  if (L === 'hook') { if (tag === 'tbl' && t < hev('bill') - 0.02) coverBadge(c, t);
    const hookProj = p => { const q = proj(p); return q.x < 0 || q.x > W ? { x: q.x < 0 ? 60 : W - 60, y: 1050 } : q; };
    if (!tag.startsWith('ui:')) K.bubbles(c, t, { id: 'hook' }, heads, hookProj, { cleanChunks: true, names, hold: { hook_f: -0.2, hook_h: 0.1, hook_h2: 0.6 } }); K.titleRibbon(c, t, 540, 455); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); UI.captions(c, t);
    Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  const e = k => ev(L, k), narT = (SP[L.toLowerCase() + '_nar'] || { t: 1e9 }).t;
  if (tag === 'flash') { caption(c, '*ЧАС НАЗАД: друг угощает официанта чизкейком*', clamp(P(t, e('flash') + 0.1, e('flash') + 0.3)) * (1 - clamp(P(t, e('sit') + 0.9, e('sit') + 1.1))), 1740, C.white); K.pop(c, t, 'ЧИЗКЕЙК!', e('flash') + 0.4, e('sit') - 0.3, 540, 1330, C.gold, -0.06, 80); }
  if (L === 'B1' && t > e('looks') && t < narT - 0.1) K.pop(c, t, 'КТО СЪЕЛ?!', e('looks') + 0.05, narT - 0.2, 540, 1330, C.gold, -0.06, 80);
  if (L === 'B2' && t > e('freeze') && t < narT - 0.05) K.dots(c, t, e('freeze') + 0.05, narT - 0.05, 1450);
  if (L === 'C2' && t > e('apron') && t < e('sit') - 0.4) K.pop(c, t, 'СМЕНА ОКОНЧЕНА!', e('apron') + 0.05, e('sit') - 0.5, 540, 1330, C.gold, -0.06, 70);
  K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names, hold: { a1_h3: 0.4, a2_f3: 0.3, b1_f3: 0.4, b2_all: 0.3, b2_h3: 0.4, c1_h3: 0.4, c2_h4: 0.3, c2_w4: 0.1, c2_h5: 0.3, c2_w6: 0.1, c2_all: 0.6 } });
  K.hud(c, t, sc);
}
E.run('splitbill', NF, renderFrame);
