// "He ordered for me" episode renderer (hard_cut camera): node orderforme.js start end out.mp4 | --png=f1,f2
// Candle-lit restaurant, a table for two: her seated on the left (dressed up for a date), Mark seated on the right,
// Reggie the waiter (waistcoat, bow tie, notepad) standing behind the table between them. The plates are the artifact:
// A1 burger -> Mark, salad -> her; A2 a salad + a tiny salad in front of her; B2 a breadstick in her mouth; C2 a HUGE burger for her, a sad salad for Mark.
// Salad counter (icon + number) bottom-left; turns into a burger in C2. Shots tagged 'ui:menu' = full-screen menu insert. No black card.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/orderforme/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];
const ORDER = ['hook', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'outro'], idx = L => ORDER.indexOf(L);

// ---------------- cast: heroine in a wine-red date dress + necklace, Mark as is, Reggie the waiter (white shirt, black waistcoat, bow tie)
const HER = { ...BASE.her_lift, necklace: true, top: { type: 'sweater', col: '#B0284F' }, bottom: { type: 'skirt', col: '#B0284F' }, shoes: { col: '#2B1A22', acc: null } };
const MARK = BASE.mark;
const WTR = { ...BASE.reggie, top: { type: 'longsleeve', col: '#FFFFFF' }, bottom: { type: 'trousers', col: '#1E1E24' } };
const SEAT = 330, TOP = -500;                         // seated upper body dropped by SEAT; table top at y = TOP
const HX = -330, MX = 330, WX = 0, WS = 0.92, WY = -40; // her / Mark seat x, waiter x + depth scale + feet y (he stands behind the table)
const G = { her: geom(HER), date: geom(MARK), waiter: geom(WTR) };
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function waistcoat(cc, g) { const sw = g.sw, y0 = g.ySh;
  paint(cc, q => { q.m(-sw * 0.92, y0 + 14); q.l(-sw * 0.3, y0 + 14); q.l(0, y0 + 260); q.l(sw * 0.3, y0 + 14); q.l(sw * 0.92, y0 + 14); q.l(sw * 0.84, y0 + 600); q.l(-sw * 0.84, y0 + 600); q.z(); }, '#1E1E24', { sd: 10, hd: 4, lw: 4 });
  cc.fillStyle = '#C9A13A'; for (const y of [y0 + 320, y0 + 410, y0 + 500]) { cc.beginPath(); cc.arc(0, y, 9, 0, TAU); cc.fill(); }
  cc.fillStyle = '#FFFFFF'; rr(cc, sw * 0.38, y0 + 120, 70, 16, 4); cc.fill();   // pocket square
  // bow tie
  cc.fillStyle = '#1E1E24'; cc.beginPath(); cc.moveTo(0, y0 + 4); cc.lineTo(-62, y0 - 26); cc.lineTo(-62, y0 + 36); cc.closePath(); cc.fill(); cc.beginPath(); cc.moveTo(0, y0 + 4); cc.lineTo(62, y0 - 26); cc.lineTo(62, y0 + 36); cc.closePath(); cc.fill();
  cc.beginPath(); cc.arc(0, y0 + 4, 14, 0, TAU); cc.fill(); }

// ---------------- food + props (local coords: (0,0) = bottom centre)
function plateDraw(c, s = 1) { c.save(); c.scale(s, s); c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.ellipse(0, 6, 160, 30, 0, 0, TAU); c.fill(); c.fillStyle = '#F4F6FA'; c.beginPath(); c.ellipse(0, 0, 150, 28, 0, 0, TAU); c.fill(); c.strokeStyle = '#C9D0DA'; c.lineWidth = 4; c.stroke(); c.beginPath(); c.ellipse(0, -2, 96, 16, 0, 0, TAU); c.stroke(); c.restore(); }
function burgerDraw(c, s = 1) { c.save(); c.scale(s, s);
  paint(c, q => { q.m(-95, 0); q.l(95, 0); q.q(100, -36, 80, -40); q.l(-80, -40); q.q(-100, -36, -95, 0); q.z(); }, '#E0A25A', { sd: 6, hd: 3, lw: 4 });   // bottom bun
  paint(c, q => { q.m(-105, -36); q.l(105, -36); q.q(112, -70, 96, -78); q.l(-96, -78); q.q(-112, -70, -105, -36); q.z(); }, '#6A3A22', { sd: 6, hd: 3, lw: 4 });   // patty
  c.fillStyle = '#F7C431'; c.beginPath(); c.moveTo(-104, -76); c.lineTo(104, -76); c.lineTo(96, -60); c.lineTo(70, -40); c.lineTo(52, -62); c.lineTo(10, -30); c.lineTo(-20, -62); c.lineTo(-60, -44); c.lineTo(-80, -64); c.lineTo(-104, -60); c.closePath(); c.fill();   // cheese drip
  c.fillStyle = '#E0474C'; rr(c, -96, -94, 192, 18, 8); c.fill();   // tomato
  c.fillStyle = '#6DBE6A'; c.beginPath(); c.moveTo(-112, -92); for (let i = 0; i <= 12; i++) c.lineTo(-112 + i * 18.6, -92 - (i % 2 ? 16 : 2)); c.lineTo(112, -86); c.lineTo(-112, -86); c.closePath(); c.fill();   // lettuce
  paint(c, q => { q.m(-104, -100); q.q(-110, -200, 0, -206); q.q(110, -200, 104, -100); q.z(); }, '#E9A956', { sd: 8, hd: 4, lw: 4 });   // top bun
  c.fillStyle = '#FFF4D6'; for (const [x, y] of [[-50, -160], [-10, -180], [30, -165], [60, -140], [-70, -130], [5, -140]]) { c.beginPath(); c.ellipse(x, y, 8, 5, 0.4, 0, TAU); c.fill(); }
  c.restore(); }
function saladDraw(c, s = 1, sad = false) { c.save(); c.scale(s, s);
  paint(c, q => { q.m(-110, -60); q.l(110, -60); q.q(100, 0, 0, 0); q.q(-100, 0, -110, -60); q.z(); }, '#F4F6FA', { sd: 6, hd: 3, lw: 4 });   // bowl
  if (!sad) { for (const [x, y, r, col] of [[-60, -70, 40, '#5FAE5C'], [-10, -86, 46, '#6DBE6A'], [44, -72, 40, '#4E9E4E'], [10, -62, 36, '#7CCB6E']]) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, Math.PI, TAU); c.fill(); }
    c.fillStyle = '#E0474C'; for (const [x, y] of [[-30, -96], [40, -90], [0, -74]]) { c.beginPath(); c.arc(x, y, 12, 0, TAU); c.fill(); } }
  else { c.fillStyle = '#7CA86A'; c.beginPath(); c.ellipse(0, -62, 34, 10, 0.1, 0, TAU); c.fill(); c.fillStyle = '#5E8C4E'; c.beginPath(); c.ellipse(-10, -66, 18, 6, -0.4, 0, TAU); c.fill(); }   // three sad leaves
  c.restore(); }
function candle(c, x, y, t) { c.fillStyle = '#C9A13A'; rr(c, x - 34, y - 14, 68, 16, 6); c.fill(); c.fillStyle = '#F7F2E8'; c.fillRect(x - 14, y - 110, 28, 98); const f = 1 + 0.12 * Math.sin(t * 17 + x);
  const gl = c.createRadialGradient(x, y - 130, 4, x, y - 130, 170); gl.addColorStop(0, 'rgba(255,210,120,.55)'); gl.addColorStop(1, 'rgba(255,210,120,0)'); c.fillStyle = gl; c.fillRect(x - 170, y - 300, 340, 340);
  paint(c, q => { q.m(x, y - 160 * f); q.q(x + 18, y - 126, x, y - 112); q.q(x - 18, y - 126, x, y - 160 * f); q.z(); }, '#F2A03B', { sd: 0, hd: 0, lw: 2 }); c.fillStyle = '#FFE7A0'; c.beginPath(); c.ellipse(x, y - 124, 6, 10, 0, 0, TAU); c.fill(); }
function stickDraw(c, len = 230) { c.fillStyle = '#E2B25E'; rr(c, 0, -7, len, 14, 7); c.fill(); c.strokeStyle = '#B98A3A'; c.lineWidth = 2; for (let x = 20; x < len - 10; x += 34) { c.beginPath(); c.moveTo(x, -6); c.lineTo(x + 10, 6); c.stroke(); } }
function sticksGlass(c, x, y, n) { for (let i = 0; i < n; i++) { c.save(); c.translate(x - 24 + i * 12, y - 40); c.rotate(-Math.PI / 2 + (i - (n - 1) / 2) * 0.12); stickDraw(c, 220); c.restore(); }
  c.fillStyle = 'rgba(220,235,245,.55)'; rr(c, x - 44, y - 120, 88, 120, 12); c.fill(); c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 3; c.stroke(); }
function menuClosed(c, x, y, rot = 0) { c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -96, -14, 196, 26, 6); c.fill(); c.fillStyle = '#2F5A46'; rr(c, -100, -20, 200, 24, 6); c.fill(); c.fillStyle = '#C9A13A'; c.fillRect(-70, -12, 140, 4); c.restore(); }
// open menu facing the camera, centred at (0,0); kind = 'burger' | 'salad'
function menuOpen(c, kind, s = 1) { c.save(); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -210 + 8, -150 + 12, 420, 300, 14); c.fill(); c.fillStyle = '#2F5A46'; rr(c, -210, -150, 420, 300, 14); c.fill();
  c.fillStyle = '#FFF8E8'; rr(c, -196, -138, 190, 276, 8); c.fill(); rr(c, 6, -138, 190, 276, 8); c.fill();
  fitTxt(c, kind === 'burger' ? 'BURGER' : 'SALAD', -101, -110, 34, '#B0284F', 170);
  c.save(); c.translate(-101, 60); if (kind === 'burger') burgerDraw(c, 0.72); else { saladDraw(c, 0.75); } c.restore();
  fitTxt(c, kind === 'burger' ? '£14' : '£9', -101, 106, 28, '#2F5A46', 160);
  c.fillStyle = 'rgba(47,90,70,.45)'; for (let k = 0; k < 7; k++) c.fillRect(26, -110 + k * 34, 150 - (k % 3) * 30, 9);
  c.restore(); }

// ---------------- restaurant (prerendered, softly blurred)
const BX0 = -2400, BY0 = -3200, BW = 4800, BH = 4600, BS = 0.5;
function drawRest(c) {
  c.fillStyle = '#4A1E2A'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = 'rgba(255,200,150,.06)'; for (let x = BX0; x < BX0 + BW; x += 200) c.fillRect(x, BY0, 80, 3000);
  c.fillStyle = '#2E1219'; c.fillRect(BX0, -1450, BW, 1250); c.fillStyle = '#C9A06A'; c.fillRect(BX0, -1470, BW, 22);
  for (let x = BX0 + 60; x < BX0 + BW; x += 300) { c.fillStyle = 'rgba(255,255,255,.04)'; rr(c, x, -1400, 240, 1100, 12); c.fill(); }
  for (const [x, w] of [[-1700, 620], [1050, 620]]) { c.fillStyle = '#C9A06A'; c.fillRect(x - 16, -2600, w + 32, 1000); c.fillStyle = '#1B2444'; c.fillRect(x, -2584, w, 968);
    c.fillStyle = 'rgba(255,240,200,.9)'; for (let i = 0; i < 24; i++) { c.beginPath(); c.arc(x + 20 + hash(i * 7 + x) * (w - 40), -2560 + hash(i * 3 + x) * 560, 3 + hash(i) * 3, 0, TAU); c.fill(); }
    c.fillStyle = '#2B3352'; for (let i = 0; i < 6; i++) { const bw = w / 6, bh = 160 + hash(i + x) * 380; c.fillRect(x + i * bw, -1616 - bh, bw - 8, bh); } c.fillStyle = '#C9A06A'; c.fillRect(x + w / 2 - 8, -2584, 16, 968); }
  c.fillStyle = '#C9A06A'; rr(c, -560, -2900, 1120, 230, 26); c.fill(); c.fillStyle = '#2E1219'; rr(c, -540, -2880, 1080, 190, 20); c.fill(); fitTxt(c, 'LA ROSA', 0, -2785, 120, '#F2C14E', 1000);
  for (let i = 0; i < 26; i++) { const x = BX0 + 100 + i * 180, y = -2350 + Math.sin(i * 0.9) * 60; const g = c.createRadialGradient(x, y, 2, x, y, 60); g.addColorStop(0, 'rgba(255,220,140,.9)'); g.addColorStop(1, 'rgba(255,220,140,0)'); c.fillStyle = g; c.fillRect(x - 60, y - 60, 120, 120); }   // string lights
  for (const [x, s] of [[-1700, 1], [1750, 1.1]]) { c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(x, -700, 300 * s, 110, 0, 0, TAU); c.fill(); c.fillRect(x - 12, -700, 24, 450); c.fillStyle = 'rgba(255,200,110,.5)'; c.beginPath(); c.arc(x, -770, 40, 0, TAU); c.fill(); }
  c.fillStyle = '#4A7A4A'; for (let i = 0; i < 7; i++) { c.beginPath(); c.ellipse(-2150 + i * 40, -1000 - i * 70, 70, 190, -0.6 + i * 0.2, 0, TAU); c.fill(); } c.fillStyle = '#8A5A3A'; rr(c, -2220, -420, 260, 230, 20); c.fill();
  c.fillStyle = '#5A3428'; c.fillRect(BX0, -200, BW, 1600); c.fillStyle = 'rgba(0,0,0,.12)'; for (let x = BX0; x < BX0 + BW; x += 240) c.fillRect(x, -200, 8, 1600);
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawRest);
function chair(c, x) { c.fillStyle = '#3A1A12'; rr(c, x - 160, -1080, 320, 600, 50); c.fill(); c.fillStyle = '#8A2F3A'; rr(c, x - 130, -1050, 260, 540, 40); c.fill(); c.fillStyle = 'rgba(255,255,255,.08)'; rr(c, x - 110, -1030, 90, 500, 30); c.fill(); }

// ---------------- what lies on the table at time t
const SW = (L, k) => ev(L, k);
function tableState(t, L) {
  const s = { her: [], date: [], menus: true, sticks: 5 };
  const land = a => clamp((t - a) / 0.3);
  if (L === 'A1' && t > SW('A1', 'swap')) { s.date.push({ k: 'burger', a: land(SW('A1', 'swap')) }); s.her.push({ k: 'salad', a: land(SW('A1', 'swap') + 0.15) }); }
  if (L === 'A2' && t > SW('A2', 'salads')) { s.her.push({ k: 'salad', a: land(SW('A2', 'salads')), dx: -100 }); if (t > SW('A2', 'small')) s.her.push({ k: 'tiny', a: land(SW('A2', 'small')), dx: 140 }); }
  if (L === 'B2') s.sticks = t > SW('B2', 'grab') + 0.2 ? 4 : 5;
  if (L === 'C2' && t > SW('C2', 'take')) s.menus = false;
  if (L === 'C2' && t > SW('C2', 'plates')) { s.her.push({ k: 'huge', a: land(SW('C2', 'plates')), dx: 50 }); s.date.push({ k: 'sad', a: land(SW('C2', 'plates') + 0.12) }); }
  return s; }
function food(c, x, it) { const a = it.a, y = TOP - 30 - (1 - eOut(a)) * 500, sq = a >= 1 ? 1 : 1 + 0.1 * Math.sin(a * Math.PI); c.save(); c.translate(x + (it.dx || 0), TOP - 30);
  if (a > 0.6) plateDraw(c, it.k === 'tiny' ? 0.55 : it.k === 'huge' ? 1.2 : 1); c.translate(0, y - (TOP - 30)); c.scale(1 / sq, sq);
  if (it.k === 'burger') burgerDraw(c, 0.9); if (it.k === 'salad') saladDraw(c, 0.9); if (it.k === 'tiny') saladDraw(c, 0.4); if (it.k === 'sad') saladDraw(c, 0.6, true);
  if (it.k === 'huge') burgerDraw(c, 1.6);   // huge, but its top stays below her chin
  c.restore(); }
function tableFront(c, t, L) { const st = tableState(t, L);
  c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(-780, -20, 1560, 40);
  paint(c, q => { q.m(-720, TOP); q.l(720, TOP); q.l(750, -10); q.l(-750, -10); q.z(); }, '#FFFDF8', { sd: 6, hd: 3, lw: 4, inner: k => { k.strokeStyle = 'rgba(150,120,110,.22)'; k.lineWidth = 4; for (let x = -680; x < 720; x += 70) { k.beginPath(); k.moveTo(x, TOP + 30); k.quadraticCurveTo(x + 10, TOP + 260, x + 4, -20); k.stroke(); } } });
  c.fillStyle = '#B0284F'; c.fillRect(-120, TOP, 240, 400); c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(-120, TOP + 360, 240, 40);
  paint(c, q => { q.m(-760, TOP - 40); q.l(760, TOP - 40); q.l(730, TOP + 12); q.l(-730, TOP + 12); q.z(); }, '#F4EAD8', { sd: 4, hd: 2, lw: 4 });   // table top
  if (st.menus) { menuClosed(c, HX - 230, TOP - 14, -0.05); menuClosed(c, MX + 230, TOP - 14, 0.05); }
  sticksGlass(c, -110, TOP - 20, st.sticks); candle(c, 70, TOP - 20, t);
  for (const it of st.her) food(c, HX, it); for (const it of st.date) food(c, MX, it);
  K.mark(c, 'plates', 0, TOP - 100, 420); }

// ---------------- characters
const gest = (st, g, who, t, side, base) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20, { planar: true }); } };
const hang = (g, s) => reach(g, s, s * g.sw * 0.8, g.ySh + 330);
const onTable = (g, s) => reach(g, s, s * g.sw * 0.7, g.ySh + 335, { planar: true });
const toW = (g, s, x0, wx, wy, o = {}) => reach(g, s, wx - x0, wy - SEAT, o);   // seated: world target -> body-local target
const seated = (g, t) => ({ t, mood: 'neutral', turn: 0, look: 0, legPose: 'sit', drop: SEAT, legs: false, armL: onTable(g, -1), armR: onTable(g, 1), items: {} });
const MENU_Y = TOP - 230;   // held open menu (world y of its centre)
const holdsMenu = (t, L) => L === 'hook' || (L === 'C2' && t < ev('C2', 'take'));
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { ...seated(g, t), talk: talk('her', t), mood: 'neutral', turn: 0.3, look: 0.7 };
  if (holdsMenu(t, L)) { st.armL = toW(g, -1, HX, HX - 150, MENU_Y + 90, { planar: true }); st.armR = toW(g, 1, HX, HX + 150, MENU_Y + 90, { planar: true }); }
  if (L === 'hook') { st.mood = 'happy'; st.turn = 0.15; st.look = 0.3; if (t > hev('stun') - 0.05) { st.mood = 'shock'; st.blink = 0; st.turn = 0.35; st.look = 0.9; } if (t > hev('cover')) { st.mood = 'annoyed'; } }
  if (L === 'A1') { st.mood = 'happy'; if (speaking('a1_h', t, 0.05, 0.3)) { st.mood = 'shock'; st.armR = reach(g, 1, g.sw * 1.6, g.ySh - 200 + Math.sin(t * 12) * 20, { planar: true }); st.armL = reach(g, -1, -g.sw * 0.4, g.ySh + 230, { planar: true }); st.look = 0.5; }
    if (t > SP.a1_w.t) { st.mood = 'worried'; st.look = 0.9; } if (t > e('swap') + 0.2) { st.mood = 'shock'; st.blink = 0; st.turn = 0.1; st.look = 0.2; st.lookY = 0.5; } }
  if (L === 'A2') { st.mood = 'happy'; if (speaking('a2_h', t, 0.05, 0.3)) { st.mood = 'annoyed'; gest(st, g, 'her', t, 1, 160); } if (speaking('a2_m', t)) { st.mood = 'surprised'; } if (t > e('salads')) { st.mood = 'shock'; st.blink = 0; st.lookY = 0.5; st.look = 0.3; } if (t > e('small') + 0.4) { st.mood = 'annoyed'; } }
  if (L === 'B1') { st.mood = 'happy'; if (speaking('b1_h', t, 0.05, 0.3)) { st.mood = 'happy'; gest(st, g, 'her', t, 1, 160); st.look = 0.2; } if (t > SP.b1_m.t + 0.3) { st.mood = 'shock'; st.blink = 0; st.look = 0.8; } if (t > e('leave') + 0.3) { st.mood = 'annoyed'; st.look = 1; } }
  if (L === 'B2') { st.mood = 'neutral'; if (speaking('b2_h', t, 0.05, 0.3)) { st.mood = 'annoyed'; gest(st, g, 'her', t, 1, 160); } if (t > e('stick')) { st.mood = 'annoyed'; st.talk = 0; st.blink = Math.floor((t - e('stick')) * 2) % 3 === 2 ? 1 : 0; st.look = 0.9; } }
  if (L === 'C1') { st.mood = 'neutral'; if (speaking('c1_h', t, 0.05, 0.3)) { st.mood = 'happy'; gest(st, g, 'her', t, 1, 160); } if (t > SP.c1_m.t) st.mood = 'happy'; if (t > e('menu')) { st.mood = 'happy'; st.blink = 1; } }
  if (L === 'C2') { st.mood = 'smug'; st.turn = 0.05; st.look = -0.1; st.lookY = -0.5;
    if (speaking('c2_h', t, 0.05, 0.1)) { st.mood = 'smug'; st.talk = talk('her', t); }
    if (t > endOf('c2_h') + 0.1) { st.mood = 'happy'; st.blink = 1; st.lookY = -0.3; }
    if (t > e('take')) { st.armL = onTable(g, -1); st.armR = onTable(g, 1); st.lookY = 0; }
    if (t > e('plates')) { st.mood = 'happy'; st.laugh = true; st.blink = 1; st.look = 0.2; st.lookY = 0.3; }
    if (t > SP.c2_m.t - 0.1) { st.laugh = false; st.blink = 0; st.mood = 'smug'; st.turn = 0.3; st.look = 0.8; st.lookY = 0; }
    if (t > e('chew')) { st.mood = 'happy'; st.blink = 1; st.armR = toW(g, 1, HX, HX + 60, TOP - 220, { planar: true }); st.items = { R: ctx => { ctx.save(); ctx.rotate(-0.4); ctx.fillStyle = '#C9CED6'; ctx.fillRect(-4, -120, 8, 130); ctx.restore(); } }; } }
  return st; }
function markState(t, L) { const g = G.date, e = k => ev(L, k), st = { ...seated(g, t), talk: talk('date', t), mood: 'smug', turn: -0.3, look: -0.7 };
  if (L === 'hook') { st.mood = 'smug'; st.turn = -0.2; st.look = -0.4; st.lookY = -0.5;
    st.items = { L: ctx => { ctx.save(); ctx.translate(-120, -60); menuOpen(ctx, 'salad', 0.62); ctx.restore(); } }; st.armL = toW(g, -1, MX, MX - 230, MENU_Y - 40, { planar: true }); st.armR = toW(g, 1, MX, MX - 40, MENU_Y - 110 + Math.sin(t * 3) * 8, { planar: true });
    if (t > hev('stun')) { st.mood = 'happy'; st.blink = 1; st.lookY = 0; } }
  if (L === 'A1') { st.mood = 'smug'; if (speaking('a1_h', t, 0.05, 0.3)) { st.mood = 'surprised'; st.look = -0.9; } if (speaking('a1_w', t, 0.05, 0.1)) { st.mood = 'neutral'; st.lookY = -0.5; st.look = -0.3; }
    if (t > e('nod') && t < e('nod') + 0.8) { st.mood = 'happy'; st.blink = 1; st.headY = Math.abs(Math.sin((t - e('nod')) * 8)) * 26; st.lookY = -0.4; st.look = -0.3; }
    if (t > e('swap')) { st.mood = 'happy'; st.look = 0.2; st.lookY = 0.5; st.armR = toW(g, 1, MX, MX + 120, TOP - 150, { planar: true }); st.items = { R: forkItem }; } }
  if (L === 'A2') { st.mood = 'smug'; if (speaking('a2_h', t, 0.05, 0.3)) { st.mood = 'surprised'; } if (speaking('a2_m', t, 0.05, 0.2)) { st.mood = 'happy'; st.armL = toW(g, -1, MX, lerp(MX - 260, HX + 260, clamp((t - SP.a2_m.t) / SP.a2_m.d)), -950, { planar: true }); } if (t > endOf('a2_m') + 0.2) { st.mood = 'happy'; st.blink = 1; } }
  if (L === 'B1') { st.mood = 'neutral'; if (speaking('b1_h', t, 0.05, 0.3)) st.mood = 'surprised'; if (speaking('b1_m', t, 0.05, 0.3)) { st.mood = 'happy'; st.laugh = true; st.turn = -0.15; st.look = -0.3; st.lookY = -0.4; st.armL = toW(g, -1, MX, MX - 300, -1000, { planar: true }); } if (t > e('leave')) { st.mood = 'smug'; st.laugh = false; } }
  if (L === 'B2') { st.mood = 'neutral'; if (speaking('b2_h', t, 0.05, 0.3)) st.mood = 'surprised';
    const a = e('grab'), b = e('stick'); if (t > a && t < b + 0.35) { st.mood = 'happy'; const k = eIO(clamp((t - a) / Math.max(0.3, b - a))); st.armL = toW(g, -1, MX, lerp(-110, HX + 300, k), lerp(TOP - 260, -955, k), { planar: true }); st.items = { L: ctx => { if (t < b) { ctx.save(); ctx.rotate(Math.PI); stickDraw(ctx, 200); ctx.restore(); } } }; }
    if (t > b + 0.35) { st.mood = 'happy'; st.blink = 1; st.armL = onTable(g, -1); } }
  if (L === 'C1') { st.mood = 'neutral'; if (speaking('c1_h', t, 0.05, 0.3)) { st.mood = 'worried'; st.look = -0.8; } if (speaking('c1_m', t, 0.05, 0.3)) { st.mood = 'worried'; st.lookY = 0.3; st.armL = reach(g, -1, -g.sw * 1.9, g.ySh + 170, { planar: true }); st.armR = reach(g, 1, g.sw * 1.9, g.ySh + 170, { planar: true }); }
    if (t > e('menu')) { st.mood = 'happy'; st.armL = toW(g, -1, MX, HX + 320, TOP - 330, { planar: true }); st.items = { L: ctx => { ctx.save(); ctx.translate(-60, -10); ctx.rotate(-0.15); ctx.fillStyle = '#2F5A46'; rr(ctx, -110, -150, 220, 300, 10); ctx.fill(); ctx.fillStyle = '#C9A13A'; ctx.fillRect(-70, -60, 140, 6); fitTxt(ctx, 'MENU', 0, -100, 34, '#F2C14E', 180); ctx.restore(); } }; } }
  if (L === 'C2') { st.mood = 'smug'; if (speaking('c2_h', t, 0.05, 0.1)) { st.mood = 'smug'; st.look = -0.9; st.armL = toW(g, -1, MX, MX - 200, -1150, { planar: true }); st.armR = onTable(g, 1); }
    if (t > endOf('c2_h') - 2.0) { st.mood = 'surprised'; st.blink = 0; st.armL = onTable(g, -1); }
    if (t > e('plates')) { st.mood = 'sad'; st.blink = 0; st.look = -0.3; st.lookY = 0.5; }
    if (speaking('c2_m', t, 0.05, 0.2)) { st.mood = 'sad'; st.look = -0.8; st.lookY = 0; st.talk *= 0.6; st.armL = toW(g, -1, MX, MX - 170, -1030, { planar: true }); }
    if (t > e('chew')) { st.mood = 'sad'; st.look = 0; st.lookY = 0.2; st.talk = 0.25 + 0.25 * Math.abs(Math.sin(t * 9)); st.armL = reach(g, -1, -g.hw * 0.35, g.headY + g.hh * 1.25, { planar: true }); st.headFirst = true; st.items = { L: ctx => { ctx.save(); ctx.rotate(-0.3); paint(ctx, q => q.e(30, -40, 46, 22), '#6DBE6A', { sd: 3, hd: 2, lw: 3 }); ctx.restore(); } }; } }
  return st; }
const forkItem = ctx => { ctx.save(); ctx.rotate(0.3); ctx.strokeStyle = '#C9CED6'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -110); ctx.stroke(); for (const dx of [-12, 0, 12]) { ctx.beginPath(); ctx.moveTo(dx, -110); ctx.lineTo(dx, -150); ctx.stroke(); } ctx.restore(); };
const padItem = ctx => { ctx.save(); ctx.rotate(-0.15); ctx.fillStyle = '#FFFDF8'; rr(ctx, -55, -150, 110, 150, 6); ctx.fill(); ctx.strokeStyle = '#8A8480'; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = '#C23C4A'; ctx.fillRect(-55, -150, 110, 16); ctx.fillStyle = 'rgba(40,40,60,.5)'; for (let k = 0; k < 4; k++) ctx.fillRect(-40, -116 + k * 24, 80 - (k % 2) * 24, 5); ctx.restore(); };
const penItem = ctx => { ctx.save(); ctx.rotate(-0.5); ctx.fillStyle = '#2B2F3A'; rr(ctx, -5, -90, 10, 90, 4); ctx.fill(); ctx.restore(); };
const menusItem = ctx => { ctx.save(); ctx.rotate(-0.1); for (let k = 0; k < 2; k++) { ctx.fillStyle = k ? '#2F5A46' : '#244A39'; rr(ctx, -110 + k * 10, -40 - k * 14, 220, 30, 6); ctx.fill(); } ctx.restore(); };
function wtrX(t, L) { const lv = (L === 'A1' || L === 'B1') ? ev(L, 'leave') : L === 'C2' ? ev('C2', 'take') + 0.35 : 1e9; return t < lv ? WX : lerp(WX, 1700, eIn(clamp((t - lv) / 0.9))); }
const wtrHere = (t, L) => (L === 'hook' || L === 'A1' || L === 'B1' || L === 'C2') && wtrX(t, L) < 1650;
function wtrState(t, L) { const g = G.waiter, e = k => ev(L, k), st = { t, talk: talk('waiter', t), mood: 'neutral', turn: -0.1, look: 0.4, lookY: 0.1, armL: reach(g, -1, -g.sw * 0.5, g.ySh + 230, { planar: true }), armR: reach(g, 1, -g.sw * 0.1, g.ySh + 220 + Math.sin(t * 9) * 6, { planar: true }), items: { L: padItem, R: penItem }, afterTorso: cc => waistcoat(cc, g) };
  const walking = wtrX(t, L) > WX + 1; if (walking) { st.legPose = 'walk'; st.turn = 0.5; st.look = 0.9; st.lookY = 0; }
  if (L === 'hook') { st.mood = 'neutral'; st.look = 0.7; st.turn = 0.25; if (t > hev('stun')) { st.mood = 'skeptical'; st.look = -0.6; st.turn = -0.25; } }
  if (L === 'A1') { st.look = -0.6; st.turn = -0.2; if (speaking('a1_h', t, 0.05, 0.3)) { st.mood = 'surprised'; } if (speaking('a1_w', t, 0.05, 0.3)) { st.mood = 'neutral'; st.look = 0.7; st.turn = 0.25; } if (t > e('nod')) { st.mood = 'happy'; st.look = 0.7; } }
  if (L === 'B1') { st.look = -0.6; st.turn = -0.2; if (speaking('b1_w', t, 0.05, 0.3)) { st.mood = 'happy'; st.blink = 1; } if (speaking('b1_m', t, 0.05, 0.3)) { st.mood = 'surprised'; st.look = 0.7; st.turn = 0.25; } }
  if (L === 'C2') { st.look = -0.6; st.turn = -0.2; st.mood = 'happy'; if (t > e('beam')) { st.mood = 'happy'; st.laugh = true; st.blink = 1; st.armR = reach(g, 1, g.sw * 1.8, g.ySh - 200, { planar: true }); st.items = { L: padItem }; }
    if (t > e('take')) { st.laugh = false; st.blink = 0; st.items = { R: menusItem }; st.armR = reach(g, 1, g.sw * 1.2, g.ySh + 200, { planar: true }); st.armL = hang(g, -1); } }
  return st; }

// ---------------- the world + which characters a shot draws (clean singles: only the tagged character)
const DRAW = { wide: ['her', 'date', 'waiter'], card: ['her', 'date', 'waiter'], two: ['her', 'date', 'waiter'], cover: ['her', 'date', 'waiter'], her: ['her'], date: ['date'], waiter: ['waiter'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGR, BX0, BY0, BW, BH);
  if (who.includes('waiter') && wtrHere(t, L)) heads.waiter = K.put(c, WTR, wtrState(t, L), wtrX(t, L), WY, WS);
  chair(c, HX); chair(c, MX);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), HX, 0);
  if (who.includes('date')) heads.date = K.put(c, MARK, markState(t, L), MX, 0);
  tableFront(c, t, L);
  if (who.includes('her') && holdsMenu(t, L)) { c.save(); c.translate(HX + 10, MENU_Y); c.rotate(0.03); menuOpen(c, 'burger', 0.78); c.restore(); }
  if (who.includes('her') && L === 'B2' && t > ev('B2', 'stick')) { const hd = heads.her; c.save(); c.translate(hd.x + hd.hh * 0.12, hd.y + hd.hh * 0.58); c.rotate(0.35); stickDraw(c, 190); c.restore(); }
  if (!heads.date) heads.date = OFF; if (!heads.waiter) heads.waiter = OFF; if (!heads.her) heads.her = OFFL;
  return heads; }

// ---------------- shots (world coordinates; face of a single at ~900 px)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const hHY = G.her.headY + SEAT, mHY = G.date.headY + SEAT, wHY = WY + G.waiter.headY * WS;
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(0, fy(wHY, 0.72, 800), 0.72, 'cover'), WIDE: S(0, fy(wHY, 0.56, 760), 0.56, 'wide'), CARD: S(0, fy(hHY, 0.6, 1060), 0.6, 'card'), TWO: S(0, fy(hHY, 0.74, 1000), 0.74, 'two'),
  HER: S(HX + 20, fy(hHY, 1.0), 1.0, 'her'), HER_CU: S(HX + 20, fy(hHY, 1.3, 860), 1.3, 'her'), HER_R: S(HX + 20, fy(hHY, 1.0, 1000), 1.0, 'her'),
  MARK: S(MX - 20, fy(mHY, 1.0), 1.0, 'date'), MARK_CU: S(MX - 40, fy(mHY, 1.35, 940), 1.35, 'date'), WTR: S(WX, fy(wHY, 1.0), 1.0, 'waiter'),
  MENU: U('menu', 1) };
const C2Z = [1.0, 1.15, 1.3, 1.45].map(z => S(HX + 20, fy(hHY, z, 900), z, 'her'));
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  const sp = id => speaking(id, t, 0.1, 0.15);
  if (L === 'hook') { if (t < hev('cu')) return SH.COVER; if (t < hev('mark')) return f(SH.HER_CU); if (t < hev('stun')) return f(SH.MARK); if (t < hev('cover')) return f(SH.HER_CU);
    const h = t - hev('cover'); if (h < 2.2) return f(SH.COVER); if (h < 3.5) return f(SH.MENU); if (h < 5.6) return f(SH.COVER); if (h < 6.9) return f(SH.MARK_CU); if (h < 8.9) return f(SH.COVER); return f(SH.WTR); }
  const u = t - sc.s, l = L.toLowerCase(), nar = SP[l + '_nar'];
  if (u < 1.15) return f(SH.WIDE);
  if (nar && t >= nar.t - 0.1) return f(SH.CARD);
  if (L === 'A1' && t > e('nod') - 0.05) return f(SH.TWO);
  if (L === 'A2' && t > e('salads') - 0.1) return f(SH.TWO);
  if (L === 'B1' && t > e('leave') - 0.05) return f(SH.WIDE);
  if (L === 'B2' && t > e('grab') - 0.1 && t < e('stick') + 0.5) return f(SH.TWO);
  if (L === 'B2' && t >= e('stick') + 0.5) return f(SH.HER_R);
  if (L === 'C1' && t > e('menu') - 0.05) return f(SH.TWO);
  if (L === 'C2') { if (sp('c2_h')) { const ch = (TL.cfg.chunks || {}).c2_h, p = SP.c2_h, w = p.words || [], cnt = ch.map(([en]) => en.trim().split(/\s+/).length), tot = cnt.reduce((a, b) => a + b, 0); let wi = 0, i = 0;
      ch.forEach((q, k) => { const a = w.length === tot ? p.t + w[wi][1] : p.t + p.d * k / ch.length; if (t >= a - 0.05) i = k; wi += cnt[k]; }); return f(C2Z[i] || SH.HER); }
    if (t > endOf('c2_h') && t < e('take') - 0.05) return f(SH.WTR);
    if (t >= e('take') - 0.05 && t < e('plates') - 0.05) return f(SH.WIDE);
    if (t >= e('plates') - 0.05 && t < SP.c2_m.t - 0.1) return f(SH.TWO);
    if (sp('c2_m')) return f(SH.MARK); if (sp('c2_h2')) return f(SH.HER);
    if (t > e('chew') - 0.05) return f(SH.TWO); }
  const cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.1 && t < s.t + s.d + 0.25);
  const single = who => who === 'her' ? SH.HER : who === 'date' ? SH.MARK : SH.WTR;
  if (cur) return f(single(cur.who));
  const next = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.6 && t < s.t);
  if (next) return f(single(next.who));
  return SH.TWO; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- full-screen menu insert (hook): her open menu, the burger page, on a solid backdrop
function menuView(c, t) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, '#3A1620'); g.addColorStop(1, '#1E0B12'); c.fillStyle = g; c.fillRect(0, 0, W, HH); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'menu' });
  const k = eBack(clamp((t - hev('cover') - 2.2) / 0.3), 1.6); c.save(); c.translate(540, 1010); c.rotate(-0.03); c.scale(1.9 * k, 1.9 * k); menuOpen(c, 'burger', 1); c.restore();
  for (let i = 0; i < 4; i++) { const a = t * 3 + i * 1.6; c.fillStyle = C.gold; UI.star(c, 280 + Math.cos(a) * 60 + i * 30, 640 + Math.sin(a) * 40, 26); } }

// ---------------- overlays: title ribbon (big pink line), cover badge, salad counter
function title(c, t) { const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.translate(540, 450); c.rotate(-0.05); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -175 + 14, 980, 350, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -175, 980, 350, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 74, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -112);
  UI.textFit(c, 'Unb9', 150, lines[1][0], 900); UI.strokeText(c, lines[1][0], 0, 4, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 66, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 122); c.restore(); }
function coverBadge(c, t) { const p = 1 + 0.04 * Math.sin(t * 8); c.save(); c.translate(540, 1745); c.scale(p, p); c.rotate(-0.03); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -340 + 6, -60 + 10, 680, 120, 60); c.fill(); c.fillStyle = '#FFE15A'; rr(c, -340, -60, 680, 120, 60); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; rr(c, -340, -60, 680, 120, 60); c.stroke();
  fitTxt(c, 'SALAD. NO DRESSING.', 0, 4, 52, '#E0474C', 620); c.restore(); }
function saladIcon(c, x, y, s) { c.save(); c.translate(x, y + 26); saladDraw(c, s * 0.42); c.restore(); }
function burgerIcon(c, x, y, s) { c.save(); c.translate(x, y + 30); burgerDraw(c, s * 0.3); c.restore(); }
// salads put in front of her (cumulative): A1 +1, A2 +2; C2: the burger is hers
function saladCount(t, L) { let n = 0, ch = -1; const add = (lv, k, d) => { const a = ev(lv, k); if (idx(L) > idx(lv) || (L === lv && t >= a)) { n += d; if (L === lv && t >= a) ch = a; } };
  add('A1', 'swap', 1); add('A2', 'salads', 1); add('A2', 'small', 1); return { n, ch }; }
const bubbleOn = t => TL.speech.some(s => s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.1 && t < s.t + s.d + 0.35);
function counter(c, t, sc) { const L = sc.id; if (L === 'outro' || L === 'hook') return; const nar = SP[L.toLowerCase() + '_nar'], u = t - sc.s;
  if (u < 1.2 || (nar && t > nar.t - 0.2)) return;
  const burger = L === 'C2' && t > ev('C2', 'plates'); const { n, ch: ch0 } = saladCount(t, L), ch = burger ? ev('C2', 'plates') : ch0;
  const since = t - ch, bump = since > 0 && since < 0.4 ? 1 + 0.3 * Math.sin(since / 0.4 * Math.PI) : 1, label = since > 0.1 && since < 2.2 && !bubbleOn(t);
  const k = eBack(P(u, 1.2, 1.5), 1.6) * bump; const w = label ? 360 : 170, h = label ? 128 : 84;
  c.save(); c.translate(70, 1530); c.scale(k, k);
  c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, 6, 8, w, h, 22); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 5; rr(c, 0, 0, w, h, 22); c.fill(); c.stroke();
  const iy = label ? 84 : 42;
  if (burger) { burgerIcon(c, 50, iy, 1); UI.font(c, 'Unb9', 46); c.fillStyle = C.green; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText('1', 98, iy + 2); }
  else { saladIcon(c, 50, iy, 1); UI.font(c, 'Unb9', 50); c.fillStyle = n ? '#C23C4A' : C.oliveD; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(String(n), 98, iy + 2); }
  if (label) { const s = burger ? 'БУРГЕР У ТЕБЯ!' : 'САЛАТОВ ТЕБЕ'; UI.textFit(c, 'Unb9', 32, s, w - 40); c.fillStyle = burger ? C.green : C.oliveD; c.textAlign = 'left'; c.fillText(s, 22, 34); }
  c.restore(); }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { const rows = [['A1', 'No! Burger! Me!'], ['B1', "I'd like to order for myself."], ['B2', "Don't put words in my mouth."], ['C1', "I'd rather choose my own food."]];
    K.outro(c, t, { q: ['ОН ЗАКАЗЫВАЕТ ЗА ТЕБЯ:', 'МИЛО ИЛИ НЕТ?'], qSize: 50, rows, cta: ['ОТПРАВЬ ПОДРУГЕ', 'ПЕРЕД СВИДАНИЕМ'], heroX: 190, heroS: 0.42,
      hero: (cc, tt) => { const g = G.her, gd = G.date; K.put(cc, MARK, { t: tt, mood: 'sad', turn: -0.2, look: -0.4, talk: 0.25 + 0.25 * Math.abs(Math.sin(tt * 9)), headFirst: true, armL: reach(gd, -1, -gd.hw * 0.35, gd.headY + gd.hh * 1.25, { planar: true }), armR: hang(gd, 1), items: { L: ctx => { ctx.save(); ctx.rotate(-0.3); paint(ctx, q => q.e(30, -40, 46, 22), '#6DBE6A', { sd: 3, hd: 2, lw: 3 }); ctx.restore(); } } }, 1500, 60);
        K.put(cc, HER, { t: tt, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(tt * 8) * 30, { planar: true }), armR: reach(g, 1, g.sw * 1.4, g.ySh + 150, { planar: true }), items: { R: ctx => { ctx.save(); ctx.translate(40, 0); burgerDraw(ctx, 0.9); ctx.restore(); } } }, 0, 0); } });
    const u = t - SC.outro.s, kk = P(u, 1.35, 1.7); if (kk > 0) { const bh = 140 + rows.length * 115, y = 740 - bh / 2 + 150; UI.textFit(c, 'Nun9', 46, rows[0][1], 740); const wd = c.measureText(rows[0][1]).width;
      c.save(); c.globalAlpha = 0.55 * kk; c.fillStyle = C.white; c.fillRect(214, y - 34, wd + 16, 68); c.restore(); c.strokeStyle = C.red; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(212, y + 2); c.lineTo(212 + (wd + 16) * eOut(kk), y + 2); c.stroke(); }
    Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag.startsWith('ui:')) { menuView(c, t); heads = { her: OFFL, date: OFF, waiter: OFF }; proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26); }
  const names = { date: ['MARK', '#2F3E5C'], waiter: ['WAITER', '#8A1C2E'] };
  if (L === 'hook') { const cover = tag === 'cover'; if (cover) { title(c, t); if (t < SP.hook_m.t) coverBadge(c, t); }
    const hookProj = p => { const q = proj(p); return q.x < 0 || q.x > W ? { x: q.x < 0 ? 60 : W - 60, y: 560 } : q; };
    if (!tag.startsWith('ui:')) K.bubbles(c, t, { id: 'hook' }, heads, hookProj, { cleanChunks: true, names, hold: { hook_m: 0.05 } }); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); UI.captions(c, t);
    Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names, hold: { a1_h: 0.05, a1_w: 0.05, a2_h: 0.05, a2_m: 0.1, b1_h: 0.05, b1_w: 0.05, b1_m: 0.1, b2_h: 0.05, b2_m: 0.05, c1_h: 0.05, c1_m: 0.1, c2_h: 0.05, c2_m: 0.05, c2_h2: 0.05 } });
  counter(c, t, sc);
  K.hud(c, t, sc);
}
E.run('orderforme', NF, renderFrame);
