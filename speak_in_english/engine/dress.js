// "Подруга в таком же платье" — rubric «Как ответить, когда…» (scene + 4 answers, worst -> best), hard_cut camera: node dress.js start end out.mp4 | --png=f1,f2
// Her birthday party at home (mint living room, balloons, bunting). Chloe (left) arrives in the SAME red dress with a white bow as the heroine (right).
// The birthday cake with candles stands on a tall table between them; three guests in party hats (Linda, Jay, Priya) on the right.
// o1 «В ЛОБ»: Chloe grabs the cake and marches out of the door, door slam. o2 «ВЕЖЛИВО»: Chloe twirls, smug; the heroine's smile twitches.
// o3 «КАК НОСИТЕЛЬ»: both laugh, high five (open palms). o4 «КОРОЛЕВСКИЙ ОТВЕТ»: guests rush in, group photo (phone insert 3-2-1, flash, polaroid).
// Twist (silent): the door opens, her mum walks in in the same red dress; freeze; everyone laughs; a new photo with mum. End screen: 1 / 2 / 3 / 4, СОХРАНИ, ПОДПИСАТЬСЯ (cursor).
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/dress/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];
const ORDER = ['hook', 'o1', 'o2', 'o3', 'o4', 'tw', 'outro'];

// ---------------- cast: the same red party dress (sleeveless top + skirt + white sash with a bow) on the heroine, Chloe and mum
const RED = '#D8303E', DRESS = { top: { type: 'tank', col: RED }, bottom: { type: 'skirt', col: RED }, shoes: { col: RED, acc: null } };
const HER = { ...BASE.her_lift, ...DRESS, necklace: true };
const CHL = { ...BASE.chloe, ...DRESS, hairTie: '#FFFDF8' };
const MUM = { ...BASE.margot, ...DRESS, necklace: true };
const GUESTS = [['linda', BASE.linda, '#4CAF6A', '#F2C14E'], ['jay', BASE.jay, '#3C8CE0', '#EE5E9A'], ['priya', { ...BASE.priya, top: { type: 'sweater', col: '#F2B33D' }, bottom: { type: 'trousers', col: '#3B4050' } }, '#8E78C8', '#7CF29A']];
const G = { her: geom(HER), chl: geom(CHL), mum: geom(MUM) }; for (const [k, cfg] of GUESTS) G[k] = geom(cfg);
const HX = 140, CX = -560, TX = -210, TTOP = -940, DX = -1250, DW = 440, DTOP = -2150, GS = 0.92, GY = -30;
const GX0 = [640, 940, 1240], GX1 = [470, 760, 1050], MUMX = -1000;
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
const reached = (t, L, sc, k) => ORDER.indexOf(L) > ORDER.indexOf(sc) || (L === sc && t >= ev(sc, k));

// dress details drawn after the torso (character-local coords): flared skirt while twirling, white sash + bow
function dressExtras(flare = 0) { return (c, g) => { const h = g.h, sw = g.sw, hipW = sw * 0.8, yW = -h * 0.56, yHip = -h * 0.47;
  if (flare > 0) { const w0 = hipW * 1.02, w1 = hipW * (1.25 + 0.9 * flare), yb = -h * 0.27 + 30 * flare;
    paint(c, q => { q.m(-w0, yHip - 30); q.l(w0, yHip - 30); q.q(w1 * 0.9, (yHip + yb) / 2, w1, yb); for (let i = 0; i < 6; i++) { const xa = w1 - (i + 0.5) * 2 * w1 / 6, xb = w1 - (i + 1) * 2 * w1 / 6; q.q(xa, yb + 26, xb, yb); } q.q(-w1 * 0.9, (yHip + yb) / 2, -w0, yHip - 30); q.z(); }, RED, { sd: 11, hd: 5, lw: 4 }); }
  const ww = sw * 0.7; c.fillStyle = '#FFFDF8'; rr(c, -ww, yW - 22, ww * 2, 40, 14); c.fill(); c.strokeStyle = 'rgba(120,20,30,.45)'; c.lineWidth = 3; c.stroke();
  const bx = sw * 0.28, by = yW - 2; c.fillStyle = '#FFFDF8'; c.strokeStyle = 'rgba(120,20,30,.5)'; c.lineWidth = 3;
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(bx, by); c.quadraticCurveTo(bx + s * 70, by - 52, bx + s * 64, by + 4); c.quadraticCurveTo(bx + s * 40, by + 24, bx, by); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(bx + s * 6, by + 8); c.lineTo(bx + s * 30, by + 70); c.lineTo(bx + s * 12, by + 64); c.closePath(); c.fill(); c.stroke(); }
  c.beginPath(); c.arc(bx, by, 13, 0, TAU); c.fill(); c.stroke(); }; }

// ---------------- props
function partyHat(c, hd, col, col2, tilt = 0) { c.save(); c.translate(hd.x, hd.y - hd.hh * 0.78); c.rotate(tilt); const s = hd.hh / 120;
  c.scale(s, s); paint(c, q => { q.m(-62, 0); q.l(0, -190); q.l(62, 0); q.q(0, 16, -62, 0); q.z(); }, col, { sd: 6, hd: 3, lw: 4 });
  c.save(); c.beginPath(); c.moveTo(-62, 0); c.lineTo(0, -190); c.lineTo(62, 0); c.closePath(); c.clip(); c.fillStyle = col2; for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(-20 + (i % 2) * 34, -30 - i * 40, 11, 0, TAU); c.fill(); } c.restore();
  c.fillStyle = '#FFFDF8'; c.beginPath(); c.arc(0, -196, 18, 0, TAU); c.fill(); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 3; c.stroke(); c.restore(); }
// birthday cake with 5 lit candles; (0,0) = bottom centre
function cakeDraw(c, t, s = 1, lit = true) { c.save(); c.scale(s, s);
  c.fillStyle = '#F4F0EA'; c.beginPath(); c.ellipse(0, 0, 200, 26, 0, 0, TAU); c.fill(); c.strokeStyle = '#C9C0B4'; c.lineWidth = 4; c.stroke();
  const tier = (y0, w, h, col) => { paint(c, q => { q.m(-w, y0); q.l(w, y0); q.l(w, y0 - h); q.l(-w, y0 - h); q.z(); }, col, { sd: 8, hd: 4, lw: 4 });
    c.fillStyle = '#FFFDF8'; c.beginPath(); c.moveTo(-w - 6, y0 - h - 4); c.lineTo(w + 6, y0 - h - 4); c.lineTo(w + 6, y0 - h + 16);
    for (let i = 0; i <= 7; i++) { const x = w + 6 - i * (2 * w + 12) / 7; c.quadraticCurveTo(x - (w + 6) / 7, y0 - h + 42 + (i % 2) * 8, x - (2 * w + 12) / 7, y0 - h + 16); } c.closePath(); c.fill(); };
  tier(-8, 165, 120, '#F49AB8'); tier(-128, 118, 95, '#F7B6CF');
  for (let i = 0; i < 9; i++) { c.fillStyle = ['#E0474C', '#F2C14E', '#3C8CE0'][i % 3]; c.beginPath(); c.arc(-140 + i * 35, -50, 7, 0, TAU); c.fill(); }
  for (let i = 0; i < 5; i++) { const x = -80 + i * 40; c.fillStyle = ['#3C8CE0', '#F2C14E', '#4CAF6A', '#EE5E9A', '#8E78C8'][i]; c.fillRect(x - 7, -293, 14, 70); c.fillStyle = 'rgba(255,255,255,.6)'; for (let k = 0; k < 3; k++) c.fillRect(x - 7, -285 + k * 22, 14, 6);
    if (lit) { const f = 1 + 0.15 * Math.sin(t * 23 + i * 2); const g = c.createRadialGradient(x, -310, 2, x, -310, 40); g.addColorStop(0, 'rgba(255,220,120,.6)'); g.addColorStop(1, 'rgba(255,220,120,0)'); c.fillStyle = g; c.fillRect(x - 40, -350, 80, 80);
      c.fillStyle = '#FFB12E'; c.beginPath(); c.ellipse(x, -310, 9 * f, 18 * f, 0, 0, TAU); c.fill(); c.fillStyle = '#FFF4B0'; c.beginPath(); c.ellipse(x, -306, 4, 9, 0, 0, TAU); c.fill(); } }
  c.restore(); }
function giftDraw(c, s = 1) { c.save(); c.scale(s, s); paint(c, q => { q.m(-80, 0); q.l(80, 0); q.l(80, -120); q.l(-80, -120); q.z(); }, '#8E78C8', { sd: 6, hd: 3, lw: 4 }); c.fillStyle = '#F2C14E'; c.fillRect(-12, -120, 24, 120); paint(c, q => { q.m(-90, -120); q.l(90, -120); q.l(90, -150); q.l(-90, -150); q.z(); }, '#A58FE0', { sd: 4, hd: 2, lw: 4 }); c.fillStyle = '#F2C14E'; c.fillRect(-12, -150, 24, 30);
  for (const s2 of [-1, 1]) { c.beginPath(); c.ellipse(s2 * 30, -168, 32, 18, s2 * 0.5, 0, TAU); c.fill(); } c.restore(); }
const phoneBack = ctx => { ctx.save(); ctx.rotate(-0.15); ctx.fillStyle = '#20232E'; rr(ctx, -42, -150, 84, 150, 14); ctx.fill(); ctx.fillStyle = '#3A3F55'; ctx.beginPath(); ctx.arc(-20, -128, 8, 0, TAU); ctx.arc(0, -128, 8, 0, TAU); ctx.fill(); ctx.restore(); };
function balloon(c, x, y, r, col, t, ax, ay) { const bx = x + Math.sin(t * 1.3 + x) * 10, by = y + Math.sin(t * 1.7 + y) * 8;
  c.strokeStyle = 'rgba(80,80,90,.5)'; c.lineWidth = 3; c.beginPath(); c.moveTo(bx, by + r * 1.15); c.quadraticCurveTo((bx + ax) / 2 + 20, (by + ay) / 2, ax, ay); c.stroke();
  paint(c, q => { q.e(bx, by, r * 0.86, r); }, col, { sd: 8, hd: 5, lw: 4 }); c.fillStyle = col; c.beginPath(); c.moveTo(bx - 10, by + r + 14); c.lineTo(bx + 10, by + r + 14); c.lineTo(bx, by + r - 4); c.fill();
  c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(bx - r * 0.35, by - r * 0.4, r * 0.15, r * 0.25, -0.5, 0, TAU); c.fill(); }

// ---------------- living room (prerendered, softly blurred)
const BX0 = -2900, BY0 = -4700, BW = 5800, BH = 6000, BS = 0.5;
function drawRoom(c) {
  c.fillStyle = '#CDEBE4'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = 'rgba(255,255,255,.35)'; for (let x = BX0; x < BX0 + BW; x += 150) c.fillRect(x, BY0, 50, 3000);
  c.fillStyle = '#F7F2E8'; c.fillRect(BX0, -900, BW, 34); c.fillStyle = '#B6DDD3'; c.fillRect(BX0, -866, BW, 700);
  c.fillStyle = 'rgba(0,0,0,.05)'; for (let x = BX0; x < BX0 + BW; x += 300) { rr(c, x + 30, -800, 240, 560, 16); c.fill(); }
  // window with an evening sky (right, behind the guests)
  c.fillStyle = '#F7F2E8'; rr(c, 560, -2450, 900, 1150, 18); c.fill(); const g = c.createLinearGradient(0, -2420, 0, -1330); g.addColorStop(0, '#3A4A8A'); g.addColorStop(1, '#F0A27A'); c.fillStyle = g; rr(c, 590, -2420, 840, 1090, 10); c.fill();
  c.fillStyle = '#F7F2E8'; c.fillRect(1000, -2420, 20, 1090); c.fillRect(590, -1890, 840, 20);
  c.fillStyle = '#EE5E9A'; rr(c, 440, -2520, 150, 1300, 30); c.fill(); rr(c, 1430, -2520, 150, 1300, 30); c.fill();
  // framed pictures
  for (const [x, y, w, h, bg] of [[-700, -2350, 300, 360, '#F7D9E4'], [-300, -2250, 220, 280, '#FCEBC4'], [1700, -2300, 300, 340, '#DDEFD0']]) {
    c.fillStyle = '#C98B5A'; rr(c, x - 16, y - 16, w + 32, h + 32, 10); c.fill(); c.fillStyle = bg; c.fillRect(x, y, w, h);
    c.fillStyle = 'rgba(80,60,60,.3)'; c.beginPath(); c.arc(x + w / 2, y + h * 0.42, w * 0.16, 0, TAU); c.fill(); c.fillRect(x + w * 0.3, y + h * 0.6, w * 0.4, h * 0.3); }
  // sideboard (far right) + plant (far left)
  c.fillStyle = '#C98B5A'; rr(c, 1650, -1050, 800, 880, 20); c.fill(); c.fillStyle = '#DDA26E'; for (const x of [1690, 2060]) { rr(c, x, -990, 350, 780, 14); c.fill(); }
  c.fillStyle = '#6A9E5A'; for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(-2250 + i * 30, -1300 - i * 60, 60, 170, -0.6 + i * 0.22, 0, TAU); c.fill(); } c.fillStyle = '#E8A26A'; rr(c, -2330, -500, 220, 300, 20); c.fill();
  c.fillStyle = '#B98A5E'; c.fillRect(BX0, -170, BW, 1500); c.fillStyle = 'rgba(0,0,0,.08)'; for (let x = BX0; x < BX0 + BW; x += 220) c.fillRect(x, -170, 8, 1500);
  c.fillStyle = 'rgba(238,94,154,.25)'; c.beginPath(); c.ellipse(-100, 120, 1500, 160, 0, 0, TAU); c.fill();   // rug
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawRoom);
function bunting(c, t) { const cols = ['#EE5E9A', '#F2C14E', '#3C8CE0', '#4CAF6A', '#8E78C8'];
  for (const [x0, x1, y0, sag] of [[-1000, 500, -2130, 150], [500, 1700, -2560, 110]]) { const n = Math.round((x1 - x0) / 95);
    c.strokeStyle = '#7A6A5A'; c.lineWidth = 4; c.beginPath(); for (let i = 0; i <= 40; i++) { const u = i / 40, x = lerp(x0, x1, u), y = y0 + sag * 4 * u * (1 - u); i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
    for (let i = 0; i < n; i++) { const u = (i + 0.5) / n, x = lerp(x0, x1, u), y = y0 + sag * 4 * u * (1 - u), sw = Math.sin(t * 2 + i) * 4; c.fillStyle = cols[i % 5]; c.beginPath(); c.moveTo(x - 38, y); c.lineTo(x + 38, y); c.lineTo(x + sw, y + 92); c.closePath(); c.fill(); } } }
// door: k = 0 closed .. 1 open (panel swings to the hinge side, left)
function doorDraw(c, k, behind) { const x0 = DX - DW / 2, x1 = DX + DW / 2;
  if (behind) { c.fillStyle = '#E8DCC8'; rr(c, x0 - 40, DTOP - 40, DW + 80, -DTOP + 40, 10); c.fill(); c.fillStyle = '#4A3A52'; c.fillRect(x0, DTOP, DW, -DTOP); c.fillStyle = 'rgba(255,220,160,.25)'; c.fillRect(x0 + 40, DTOP + 60, DW - 80, -DTOP - 60); return; }
  const pw = DW * (1 - 0.82 * k); if (pw < 4) return;
  paint(c, q => { q.m(x0, DTOP); q.l(x0 + pw, DTOP + 40 * k); q.l(x0 + pw, -40 * k); q.l(x0, 0); q.z(); }, '#F7F2E8', { sd: 8, hd: 4, lw: 4 });
  if (k < 0.5) { c.strokeStyle = 'rgba(0,0,0,.08)'; c.lineWidth = 6; rr(c, x0 + pw * 0.15, DTOP + 120, pw * 0.7, 800, 10); c.stroke(); rr(c, x0 + pw * 0.15, DTOP + 1080, pw * 0.7, 900, 10); c.stroke(); c.fillStyle = '#E2B13A'; c.beginPath(); c.arc(x0 + pw * 0.86, -1000, 18, 0, TAU); c.fill(); } }
function doorK(t, L) { if (L === 'o1') { const a = ev('o1', 'march') + 0.5, b = ev('o1', 'slam'); return t < a ? 0 : t < a + 0.25 ? eOut(P(t, a, a + 0.25)) : t < b - 0.12 ? 1 : 1 - eIn(P(t, b - 0.12, b)); }
  if (L === 'tw') return eOut(P(t, ev('tw', 'door'), ev('tw', 'door') + 0.3)); return 0; }
function tableDraw(c, t, L) {
  c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(TX, 0, 300, 30, 0, 0, TAU); c.fill();
  paint(c, q => { q.m(TX - 250, TTOP); q.l(TX + 250, TTOP); q.l(TX + 300, -10); q.q(TX, 20, TX - 300, -10); q.z(); }, '#F7B6CF', { sd: 8, hd: 4, lw: 4, inner: k => { k.strokeStyle = 'rgba(194,60,118,.25)'; k.lineWidth = 6; for (let x = -220; x <= 220; x += 88) { k.beginPath(); k.moveTo(TX + x, TTOP + 20); k.quadraticCurveTo(TX + x * 1.1, TTOP + 400, TX + x * 1.2, -20); k.stroke(); } } });
  c.fillStyle = '#FFFDF8'; for (let i = 0; i < 11; i++) { c.beginPath(); c.arc(TX - 250 + i * 50, TTOP + 30, 22, 0, Math.PI); c.fill(); }
  paint(c, q => { q.e(TX, TTOP, 270, 34); }, '#FCE3EC', { sd: 4, hd: 2, lw: 4 });
  if (cakeOnTable(t, L)) { c.save(); c.translate(TX, TTOP + 6); cakeDraw(c, t, 0.95); c.restore(); K.mark(c, 'cake', TX, TTOP - 160, 190); }
  else { c.fillStyle = '#F49AB8'; for (const [dx, dy] of [[-40, -4], [10, 2], [60, -6], [-90, 4]]) { c.beginPath(); c.arc(TX + dx, TTOP + dy, 8, 0, TAU); c.fill(); } } }
const cakeOnTable = (t, L) => !(L === 'o1' && t > ev('o1', 'grab') + 0.25);

// ---------------- pose helpers
const hang = (g, s) => reach(g, s, s * g.sw * 1.0, g.ySh + 470);
const hip = (g, s) => reach(g, s, s * g.sw * 1.2, g.ySh + 300, { planar: true });
const open = (g, s, k = 1.8, dy = 160) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const up = (g, s, k = 1.6, dy = -260) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const front = (g, s, dy = 250, k = 0.5) => reach(g, s, s * g.sw * k, g.ySh + dy);
function gest(st, g, t, side, base = 160) { const u = t * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.55 + Math.sin(u) * 18), g.ySh + base + Math.cos(u) * 18, { planar: true }); }
const base = (g, who, t, extra) => ({ t, talk: talk(who, t), mood: 'happy', turn: 0, look: 0, armL: hang(g, -1), armR: hang(g, 1), items: {}, afterTorso: dressExtras(0), ...extra });
// twins pose for the photos: inner arm up (open palm), outer hand on the hip
// arms out to the side, open palm, hand at shoulder height (owner rule: never a hand near/behind the head)
const tada = (g, s, w = 0) => reach(g, s, s * g.sw * 2.2, g.ySh - 30 + w, { planar: true });
const twins = (st, g, inner) => { st[inner < 0 ? 'armR' : 'armL'] = tada(g, -inner); st[inner < 0 ? 'armL' : 'armR'] = hip(g, inner); };

// positions
function chlPos(t, L) { let x = CX, s = 1, y = 0, walk = false, hidden = false;
  if (L === 'o1') { const g0 = ev('o1', 'grab'), m = ev('o1', 'march'), o = ev('o1', 'out'), sl = ev('o1', 'slam');
    if (t > g0) x = lerp(CX, TX - 170, eIO(P(t, g0, g0 + 0.3)));
    if (t > m) { x = lerp(TX - 170, DX, P(t, m, o)); walk = t < o; }
    if (t > o) { const u = P(t, o, sl); s = lerp(1, 0.88, u); y = lerp(0, -45, u); }
    if (t > sl) hidden = true; }
  if ((L === 'o4' && t > ev('o4', 'hug')) || L === 'tw') x = CX + 120 * eIO(L === 'o4' ? P(t, ev('o4', 'hug'), ev('o4', 'hug') + 0.35) : 1);
  return { x, s, y, walk, hidden }; }
function herPos(t, L) { let x = HX; if ((L === 'o4' && t > ev('o4', 'hug')) || L === 'tw') x = HX - 120 * eIO(L === 'o4' ? P(t, ev('o4', 'hug'), ev('o4', 'hug') + 0.35) : 1); return { x }; }
function guestPos(t, L, i) { const r = ev('o4', 'rush'); if (L === 'o4' && t > r) { const u = P(t, r + i * 0.08, r + 0.6 + i * 0.08); return { x: lerp(GX0[i], GX1[i], eIO(u)), walk: u > 0 && u < 1 }; } if (L === 'tw') return { x: GX1[i], walk: false }; return { x: GX0[i], walk: false }; }
function mumPos(t) { const w = ev('tw', 'walk'), s = ev('tw', 'stop'); if (t < w) return null; const u = eOut(P(t, w, s)); return { x: lerp(DX, MUMX, u), s: lerp(0.9, 1, u), y: lerp(-40, 0, u), walk: t < s }; }

// ---------------- character states
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = base(g, 'her', t, { turn: -0.25, look: -0.7 });
  if (L === 'hook') { st.armL = open(g, -1, 1.9, 120); st.armR = open(g, 1, 1.9, 120);
    if (t > hev('oh') - 0.05) { st.mood = 'surprised'; st.lookY = 0.6; st.armL = hang(g, -1); st.armR = hang(g, 1); }
    if (t > hev('freeze')) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; st.lookY = 0.1; st.look = -0.9; }
    if (t > hev('nar') + 1.0) { st.mood = 'worried'; st.blink = undefined; } }
  if (L === 'o1') { st.mood = 'annoyed';
    if (speaking('o1_h', t, 0.1, 0.25)) { st.mood = 'angry'; st.armL = reach(g, -1, -g.sw * 2.7, g.ySh + 60, { planar: true }); st.armR = hip(g, 1); }
    if (t > endOf('o1_h') + 0.25) { st.mood = 'angry'; st.armL = hip(g, -1); st.armR = hip(g, 1); }
    if (t > e('grab')) { st.mood = 'shock'; st.blink = 0; st.armL = hang(g, -1); st.armR = hang(g, 1); st.look = -0.9; }
    if (t > e('slam')) { st.mood = 'sad'; st.blink = undefined; st.look = -0.5; st.lookY = 0.3; st.turn = -0.1; } }
  if (L === 'o2') { st.mood = 'neutral';
    if (speaking('o2_h', t, 0.1, 0.25)) { st.mood = 'happy'; st.armL = front(g, -1, 230, 0.2); st.armR = front(g, 1, 230, 0.2); }
    if (t > SP.o2_f.t + 0.3) { st.mood = 'worried'; st.blink = undefined; }
    if (t > e('twirl')) { st.mood = 'annoyed'; st.lookY = 0.3; }
    if (t > e('twitch')) { const u = t - e('twitch'); st.mood = 'happy'; st.turn = 0; st.look = -0.2; st.lookY = 0; st.blink = Math.floor(u * 9) % 2 ? 0.6 : 0; st.headX = Math.sin(u * 60) * 4 * (u < 0.6 ? 1 : 0.3); st.armL = front(g, -1, 240, 0.2); st.armR = front(g, 1, 240, 0.2); } }
  if (L === 'o3') { st.mood = 'happy';
    if (speaking('o3_h', t, 0.1, 0.25)) { st.laugh = true; st.armL = open(g, -1, 1.9, 60 + Math.sin(t * 5) * 15); st.armR = open(g, 1, 1.9, 60 + Math.cos(t * 5) * 15); }
    const f = e('five'), cl = e('clap'); if (t > f) { const k = eIO(P(t, f, cl)); const mx = (CX + HX) / 2 - HX; st.armL = reach(g, -1, lerp(-g.sw * 1.8, mx + 40, k), lerp(g.ySh - 150, g.ySh - 330, k), { planar: true }); st.lean = -0.25 * k; st.look = -0.6; }
    if (t > cl + 0.25) { st.laugh = true; st.blink = 1; st.lean = 0; st.armL = open(g, -1, 1.6, 120); }
    if (t > SP.o3_nar.t + 0.5) { st.laugh = false; st.blink = undefined; } }
  if (L === 'o4') { st.mood = 'smug';
    if (speaking('o4_h', t, 0.1, 0.1)) { st.armL = up(g, -1, 2.0, -40 + Math.sin(t * 3) * 20); st.armR = up(g, 1, 2.0, -40 + Math.cos(t * 3) * 20); st.turn = -0.1; st.look = -0.3; }
    if (t > e('rush') - 0.1) { st.mood = 'happy'; st.armR = tada(g, 1); }
    if (t > e('hug')) { st.mood = 'happy'; st.look = -0.5; twins(st, g, -1); }
    if (t > e('phone')) { st.mood = 'happy'; st.look = 0; st.turn = 0; st.lookY = -0.2; st.armR = tada(g, 1, -60); st.items = { R: phoneBack }; st.armL = hip(g, -1); }
    if (t > e('flash') + 0.1) { st.items = {}; twins(st, g, -1); } }
  if (L === 'tw') { twins(st, g, -1); st.mood = 'happy'; st.look = 0;
    if (t > e('door') + 0.2) { st.mood = 'surprised'; st.look = -0.9; st.turn = -0.3; st.armL = hang(g, -1); st.armR = hang(g, 1); }
    if (t > e('freeze')) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; }
    if (t > e('laugh')) { st.mood = 'happy'; st.laugh = true; st.blink = 1; st.breathe = 1; st.armL = open(g, -1, 1.5, 300); st.armR = open(g, 1, 1.5, 300); st.look = -0.3; }
    if (t > e('flash') - 0.6) { st.laugh = false; st.blink = undefined; twins(st, g, -1); st.look = 0; st.turn = 0; } }
  return st; }
function chlState(t, L) { const g = G.chl, e = k => ev(L, k), st = base(g, 'friend2', t, { turn: 0.25, look: 0.7 });
  if (L === 'hook') { st.armL = front(g, -1, 210, 0.5); st.armR = front(g, 1, 210, 0.5); st.front = (c, gg) => { c.save(); c.translate(0, gg.ySh + 330); giftDraw(c, 1.1); c.restore(); };
    if (speaking('hook_f', t, 0, 0) && t < hev('oh')) st.mood = 'happy';
    if (t > hev('oh') - 0.05) { st.mood = 'surprised'; st.lookY = 0.6; }
    if (t > hev('freeze')) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; st.lookY = 0.1; }
    if (t > hev('nar') + 1.0) { st.mood = 'worried'; st.blink = undefined; } }
  if (L === 'o1') { st.mood = 'neutral';
    if (speaking('o1_h', t, 0, 0.1)) { st.mood = 'surprised'; }
    if (t > endOf('o1_h')) { st.mood = 'shock'; st.blink = 0; }
    if (speaking('o1_f', t, 0.05, 0.1)) { st.mood = 'angry'; st.blink = undefined; st.armL = hip(g, -1); st.armR = hip(g, 1); st.turn = 0.35; st.look = 0.9; }
    const g0 = e('grab'), m = e('march');
    if (t > g0) { st.mood = 'angry'; st.look = 0.6; st.turn = 0.3; const k = eIO(P(t, g0, g0 + 0.3)); st.armL = reach(g, -1, lerp(-g.sw, g.sw * 0.6, k), lerp(g.ySh + 300, g.ySh + 220, k)); st.armR = reach(g, 1, lerp(g.sw, g.sw * 1.6, k), lerp(g.ySh + 300, g.ySh + 220, k), { planar: true }); }
    if (t > g0 + 0.25) { st.armL = front(g, -1, 230, 0.55); st.armR = front(g, 1, 230, 0.55); st.front = (c, gg) => { c.save(); c.translate(0, gg.ySh + 330); cakeDraw(c, t, 0.62); c.restore(); }; }
    if (t > m) { st.turn = -0.4; st.look = -0.9; st.mood = 'angry'; st.legPose = 'walk'; st.t = t * 1.4; }
    if (t > e('out')) st.legPose = 'stand'; }
  if (L === 'o2') { st.mood = 'neutral';
    if (speaking('o2_h', t, 0, 0.1)) st.mood = 'skeptical';
    if (speaking('o2_f', t, 0.05, 0.1)) { st.mood = 'smug'; st.armL = hip(g, -1); st.armR = hip(g, 1); }
    if (t > e('twirl')) { st.mood = 'smug'; st.blink = 1; st.armL = tada(g, -1); st.armR = tada(g, 1); }
    if (t > e('twirl') + 1.05) { st.blink = undefined; st.armL = hip(g, -1); st.armR = tada(g, 1); st.look = 0.4; } }
  if (L === 'o3') { st.mood = 'neutral';
    if (speaking('o3_h', t, 0, 0.1)) st.mood = 'surprised';
    if (speaking('o3_f', t, 0.05, 0.2)) { st.mood = 'happy'; gest(st, g, t, 1, 160); }
    const f = e('five'), cl = e('clap'); if (t > f) { const k = eIO(P(t, f, cl)); const mx = (CX + HX) / 2 - CX; st.armR = reach(g, 1, lerp(g.sw * 1.8, mx - 40, k), lerp(g.ySh - 150, g.ySh - 330, k), { planar: true }); st.lean = 0.25 * k; st.mood = 'happy'; }
    if (t > cl + 0.25) { st.laugh = true; st.blink = 1; st.lean = 0; st.armR = open(g, 1, 1.6, 120); }
    if (t > SP.o3_nar.t + 0.5) { st.laugh = false; st.blink = undefined; } }
  if (L === 'o4') { st.mood = 'surprised';
    if (t > SP.o4_h.t + 3.0) st.mood = 'happy';
    if (t > e('hug')) { st.mood = 'happy'; twins(st, g, 1); if (speaking('o4_f', t, 0, 0)) st.laugh = st.talk < 0.15; }
    if (t > e('phone')) { st.look = 0; st.turn = 0; st.lookY = -0.2; st.laugh = false; } }
  if (L === 'tw') { twins(st, g, 1); st.mood = 'happy'; st.look = 0; st.turn = 0;
    if (t > e('door') + 0.2) { st.mood = 'surprised'; st.look = -0.9; st.turn = -0.3; st.armL = hang(g, -1); st.armR = hang(g, 1); }
    if (t > e('freeze')) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; }
    if (t > e('laugh')) { st.mood = 'happy'; st.laugh = true; st.blink = 1; st.breathe = 1; st.armL = open(g, -1, 1.5, 300); st.armR = open(g, 1, 1.5, 300); st.look = -0.3; }
    if (t > e('flash') - 0.6) { st.laugh = false; st.blink = undefined; twins(st, g, 1); st.look = 0; } }
  return st; }
function guestState(t, L, i) { const [who] = GUESTS[i], g = G[who], e = k => ev(L, k), st = { t, talk: 0, mood: 'happy', turn: -0.2, look: -0.7, armL: hang(g, -1), armR: hang(g, 1), items: {} };
  const cheeks = () => { st.headFirst = true; st.armL = reach(g, -1, -g.hw * 1.05, g.headY + g.hh * 0.5, { planar: true }); st.armR = reach(g, 1, g.hw * 1.05, g.headY + g.hh * 0.5, { planar: true }); };
  if (L === 'hook') { if (t > hev('oh') + 0.1 * i) st.mood = 'surprised'; if (t > hev('freeze')) { st.mood = 'shock'; st.blink = 0; if (i === 1) cheeks(); } if (t > hev('wide')) { st.blink = undefined; } }
  if (L === 'o1') { st.mood = 'neutral'; if (t > e('gasp') - 0.1 + i * 0.05) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; if (i !== 1) cheeks(); }
    if (t > e('grab')) { st.mood = 'surprised'; st.look = -0.9; st.blink = undefined; } if (t > e('slam')) { st.mood = 'shock'; st.blink = 0; } if (t > e('slam') + 0.6) { st.mood = 'worried'; st.blink = undefined; st.look = -0.5; } }
  if (L === 'o2') { st.mood = 'neutral'; if (t > e('twirl')) { st.mood = i === 1 ? 'skeptical' : 'bored'; st.look = -0.9; } }
  if (L === 'o3') { st.mood = 'neutral'; if (t > e('clap')) { st.mood = 'happy'; st.laugh = true; st.blink = 1; st.armL = open(g, -1, 1.5, 120); st.armR = open(g, 1, 1.5, 120); } if (t > SP.o3_nar.t + 0.8) { st.laugh = false; st.blink = undefined; st.armL = hang(g, -1); st.armR = hang(g, 1); } }
  if (L === 'o4') { st.mood = 'neutral'; if (t > e('rush') - 0.2) { st.mood = 'happy'; } const p = guestPos(t, L, i); if (p.walk) { st.legPose = 'walk'; st.t = t * 1.3; st.look = -0.9; st.turn = -0.3; }
    if (t > e('hug')) { st.armL = open(g, -1, 1.7, 60); st.armR = open(g, 1, 1.7, 60); st.look = -0.3; } if (t > e('phone')) { st.look = 0; st.turn = 0; } }
  if (L === 'tw') { st.mood = 'happy'; st.look = 0; st.turn = 0; st.armL = open(g, -1, 1.7, 60); st.armR = open(g, 1, 1.7, 60);
    if (t > e('door') + 0.2 + i * 0.05) { st.mood = 'surprised'; st.look = -0.9; st.turn = -0.3; st.armL = hang(g, -1); st.armR = hang(g, 1); }
    if (t > e('freeze')) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; }
    if (t > e('laugh') + i * 0.08) { st.mood = 'happy'; st.laugh = true; st.blink = 1; st.breathe = 1; st.armL = open(g, -1, 1.4, 300); st.armR = open(g, 1, 1.4, 300); }
    if (t > e('flash') - 0.6) { st.laugh = false; st.blink = undefined; st.armL = open(g, -1, 1.7, 60); st.armR = open(g, 1, 1.7, 60); st.look = 0; } }
  return st; }
function mumState(t) { const g = G.mum, e = k => ev('tw', k), st = base(g, 'mum', t, { mood: 'happy', turn: 0.3, look: 0.6 });
  const p = mumPos(t); if (p && p.walk) { st.legPose = 'walk'; st.t = t * 1.3; }
  st.armL = hip(g, -1); st.armR = tada(g, 1, Math.sin(t * 9) * 25);   // open-palm wave
  if (t > e('stop')) { st.mood = 'smug'; st.armR = tada(g, 1); }
  if (t > e('mum')) { st.mood = 'happy'; st.blink = (t - e('mum')) % 1.2 < 0.4 ? 1 : 0; st.look = 0.3; st.turn = 0.1; }
  if (t > e('laugh')) { st.laugh = true; st.blink = 1; st.armL = hip(g, -1); st.armR = open(g, 1, 1.5, 120); }
  if (t > e('flash') - 0.6) { st.laugh = false; st.blink = undefined; st.armR = tada(g, 1); st.look = 0.2; }
  return st; }

// ---------------- world (which characters each shot draws: clean singles show only the tagged character)
const DRAW = { her: ['her'], chl: ['chl'], mum: ['mum'], rel: ['g0', 'g1', 'g2'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const who = DRAW[tag] || ['g0', 'g1', 'g2', 'mum', 'chl', 'her'], heads = {};
  c.drawImage(BGR, BX0, BY0, BW, BH); bunting(c, t);
  for (const [x, y, r, col] of [[-880, -2300, 120, '#EE5E9A'], [-760, -2450, 110, '#F2C14E'], [-1000, -2480, 105, '#3C8CE0'], [-650, -2280, 100, '#8E78C8']]) balloon(c, x, y, r, col, t, -820, -1500);
  for (const [x, y, r, col] of [[1520, -2050, 115, '#4CAF6A'], [1660, -2200, 105, '#EE5E9A'], [1400, -2230, 100, '#F2C14E']]) balloon(c, x, y, r, col, t, 1560, -1100);
  c.fillStyle = '#C98B5A'; c.fillRect(-830, -1520, 20, 30); c.fillRect(1550, -1120, 20, 30);
  const dk = doorK(t, L); doorDraw(c, dk, true);
  // mum comes through the doorway (twist)
  const mp = L === 'tw' ? mumPos(t) : null;
  if (mp && who.includes('mum')) heads.mum = K.put(c, MUM, { ...mumState(t), afterTorso: dressExtras(0) }, mp.x, mp.y, mp.s);
  // Chloe leaving through the door (o1): drawn before the door panel so the closing door hides her
  const cp = chlPos(t, L), exiting = L === 'o1' && t > ev('o1', 'out');
  if (exiting && !cp.hidden && who.includes('chl')) heads.friend2 = K.put(c, CHL, chlState(t, L), cp.x, cp.y, cp.s);
  doorDraw(c, dk, false);
  // guests (a little further back) + party hats
  for (let i = 0; i < 3; i++) if (who.includes('g' + i)) { const [k, cfg, h1, h2] = GUESTS[i], p = guestPos(t, L, i); const hd = K.put(c, cfg, guestState(t, L, i), p.x, GY, GS); partyHat(c, hd, h1, h2, (i - 1) * 0.12); heads['g' + i] = hd; }
  tableDraw(c, t, L);
  if (!exiting && who.includes('chl')) { const st = chlState(t, L); const tw0 = L === 'o2' ? P(t, ev('o2', 'twirl'), ev('o2', 'twirl') + 1.0) : 0;
    if (tw0 > 0 && tw0 < 1) { const a = eIO(tw0) * TAU * 2, sx = Math.cos(a); st.afterTorso = dressExtras(Math.sin(tw0 * Math.PI)); c.save(); c.translate(cp.x, 0); c.scale(Math.abs(sx) < 0.08 ? 0.08 * Math.sign(sx || 1) : sx, 1); heads.friend2 = K.put(c, CHL, st, 0, 0); c.restore(); heads.friend2 = { ...heads.friend2, x: cp.x }; }
    else heads.friend2 = K.put(c, CHL, st, cp.x, cp.y, cp.s); }
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), herPos(t, L).x, 0);
  // o2 twitch: stress marks by her eye
  if (heads.her && L === 'o2' && t > ev('o2', 'twitch') && t < ev('o2', 'twitch') + 0.9) { const hd = heads.her, a = Math.floor((t - ev('o2', 'twitch')) * 10) % 2; c.save(); c.strokeStyle = '#3E471E'; c.lineWidth = 7; c.lineCap = 'round'; for (let k = 0; k < 3; k++) { const an = -0.9 + k * 0.45; const r0 = hd.hh * (1.05 + a * 0.05); c.beginPath(); c.moveTo(hd.x + hd.hh * 0.75 + Math.cos(an) * r0 * 0.4, hd.y - hd.hh * 0.2 + Math.sin(an) * r0 * 0.4); c.lineTo(hd.x + hd.hh * 0.75 + Math.cos(an) * r0 * 0.7, hd.y - hd.hh * 0.2 + Math.sin(an) * r0 * 0.7); c.stroke(); } c.restore(); }
  // o2 twirl sparkles around Chloe
  if (heads.friend2 && L === 'o2') { const u = t - ev('o2', 'twirl'); if (u > 0 && u < 1.3) { c.save(); c.globalAlpha = clamp(1.3 - u); c.fillStyle = C.gold; for (let i = 0; i < 8; i++) { const a = u * 5 + i * TAU / 8; UI.star(c, cp.x + Math.cos(a) * 330, -900 + Math.sin(a) * 120 - u * 100, 22, u * 4); } c.restore(); } }
  // o3 high five: burst at the meeting palms
  if (L === 'o3') { const u = t - ev('o3', 'clap'); if (u > 0 && u < 0.6) { const mx = (CX + HX) / 2, my = G.her.ySh - 330 - 10; c.save(); c.globalAlpha = 1 - u / 0.6; c.strokeStyle = C.gold; c.lineWidth = 12; c.lineCap = 'round'; for (let i = 0; i < 10; i++) { const a = i * TAU / 10, r0 = 60 + u * 260, r1 = r0 + 80; c.beginPath(); c.moveTo(mx + Math.cos(a) * r0, my + Math.sin(a) * r0); c.lineTo(mx + Math.cos(a) * r1, my + Math.sin(a) * r1); c.stroke(); } c.restore(); } }
  if (!heads.her) heads.her = OFF; if (!heads.friend2) heads.friend2 = OFFL;
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const HY = k => G[k].headY, fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(TX, fy(HY('her'), 0.78, 1010), 0.78, 'two'), TWO: S(TX, fy(HY('her'), 0.78, 960), 0.78, 'two'), TWO4: S(TX + 40, fy(HY('her'), 0.7, 940), 0.7, 'two'),
  WIDE: S(-80, -1974, 0.385, 'wide'), WIDE2: S(-200, -1960, 0.375, 'wide'),
  HER: S(HX - 20, fy(HY('her'), 1.0, 900), 1.0, 'her'), HER_CU: S(HX - 10, fy(HY('her'), 1.45, 920), 1.45, 'her'), HER4: S(HX - 40, fy(HY('her'), 0.95, 920), 0.95, 'her'),
  CHL: S(CX + 20, fy(HY('chl'), 1.0, 900), 1.0, 'chl'), CHL_CU: S(CX + 140, fy(HY('chl'), 1.45, 920), 1.45, 'chl'),
  MUM_CU: S(MUMX + 10, fy(HY('mum'), 1.4, 920), 1.4, 'mum'), REL: S(GX0[1], fy(HY('jay') * GS + GY, 0.62, 1000), 0.62, 'rel'),
  DOOR: S(-760, fy(HY('her'), 0.6, 1030), 0.6, 'door'), PHONE: U('phone', 1), PH1: U('photo1', 2), PH2: U('photo2', 3) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  const sp = (id, pre = 0.1, post = 0.27) => speaking(id, t, pre, post);
  if (L === 'hook') { if (t < hev('freeze') - 0.02) return SH.COVER; if (t < hev('nar') + 0.9) return f(SH.HER_CU); if (t < hev('guests') - 0.05) return f(SH.TWO); if (t < hev('wide') - 0.05) return f(SH.REL); return f(SH.WIDE); }
  if (L === 'o1') { if (t < SP.o1_h.t - 0.1) return f(SH.WIDE); if (sp('o1_h')) return f(SH.HER); if (t < SP.o1_f.t - 0.1) return f(SH.REL); if (sp('o1_f')) return f(SH.CHL); if (t < e('march')) return f(SH.TWO); if (t < e('slam') + 0.15) return f(SH.WIDE); if (t < SP.o1_nar.t + 1.0) return f(SH.HER_CU); return f(SH.TWO); }
  if (L === 'o2') { if (t < SP.o2_h.t - 0.1) return f(SH.WIDE); if (sp('o2_h')) return f(SH.HER); if (t < e('twitch') - 0.02) return f(SH.CHL); if (t < SP.o2_nar.t + 0.8) return f(SH.HER_CU); return f(SH.TWO); }
  if (L === 'o3') { if (t < SP.o3_h.t - 0.1) return f(SH.WIDE); if (sp('o3_h')) return f(SH.HER); if (t < e('five') - 0.02) return f(SH.CHL); return f(SH.TWO); }
  if (L === 'o4') { if (t < SP.o4_h.t - 0.1) return f(SH.WIDE); if (t < e('rush') - 0.35) return f(SH.HER4); if (t < SP.o4_f.t - 0.1) return f(SH.WIDE); if (t < e('phone') - 0.02) return f(SH.TWO4); if (t < e('photo')) return f(SH.PHONE); return f(SH.PH1); }
  if (L === 'tw') { if (t < e('her') - 0.02) return f(SH.DOOR); if (t < e('chl') - 0.02) return f(SH.HER_CU); if (t < e('mum') - 0.02) return f(SH.CHL_CU); if (t < e('laugh') - 0.02) return f(SH.MUM_CU); if (t < e('photo')) return f(SH.WIDE2); return f(SH.PH2); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- inserts on a solid backdrop: the phone camera (3-2-1) and the polaroid photos
function backdrop(c, t, c1, c2) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, c1); g.addColorStop(1, c2); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.22)'; for (let i = -12; i < 12; i++) c.fillRect(-1600, i * 160 + (t * 40) % 160, 3200, 60); c.restore(); }
function viewWorld(cc, t, L, cx, cy, z, w, h) { cc.save(); cc.beginPath(); cc.rect(0, 0, w, h); cc.clip(); cc.translate(w / 2, h / 2); cc.scale(z, z); cc.translate(-cx, -cy); world(cc, t, L, 'wide'); cc.restore(); }
function phoneView(c, t) { backdrop(c, t, '#F7D9E4', '#E9A9BF'); const p0 = ev('o4', 'phone'), k = eBack(P(t, p0, p0 + 0.3), 1.6);
  K.phone(c, 540, 1060, 1.7 * k, (cc, w, h) => { viewWorld(cc, t, 'o4', 120, -950, 0.205, w, h);
    cc.strokeStyle = 'rgba(255,255,255,.6)'; cc.lineWidth = 2; for (const f of [1 / 3, 2 / 3]) { cc.beginPath(); cc.moveTo(w * f, 0); cc.lineTo(w * f, h); cc.moveTo(0, h * f); cc.lineTo(w, h * f); cc.stroke(); }
    cc.fillStyle = 'rgba(0,0,0,.35)'; cc.fillRect(0, h - 110, w, 110); cc.fillStyle = '#FFFFFF'; cc.beginPath(); cc.arc(w / 2, h - 55, 36, 0, TAU); cc.fill(); cc.strokeStyle = '#FFFFFF'; cc.lineWidth = 5; cc.beginPath(); cc.arc(w / 2, h - 55, 46, 0, TAU); cc.stroke();
    const ticks = TL.sfx.filter(s => s.n === 'tick' && s.t > p0 && s.t < p0 + 2); ticks.forEach((s, i) => { const u = t - s.t; if (u >= 0 && u < 0.4) { const kk = eBack(P(u, 0, 0.15), 2) * (1 - P(u, 0.3, 0.4)); cc.save(); cc.translate(w / 2, h * 0.42); cc.scale(kk, kk); UI.font(cc, 'Unb9', 170); cc.textAlign = 'center'; cc.textBaseline = 'middle'; UI.strokeText(cc, String(3 - i), 0, 0, '#FFFFFF', 'rgba(0,0,0,.55)', 12); cc.restore(); } }); });
  K.mark(c, 'phone', 540, 1060, 300); }
const SNAP = {};
function snapshot(id, tt, L, cx, cy, z) { if (SNAP[id]) return SNAP[id]; const a = createCanvas(860, 860); const cc = a.getContext('2d'); viewWorld(cc, tt, L, cx, cy, z, 860, 860); return (SNAP[id] = a); }
function heartPath(c, x, y, r) { c.beginPath(); c.moveTo(x, y + r * 0.9); c.bezierCurveTo(x - r * 1.4, y - r * 0.1, x - r * 0.7, y - r * 1.2, x, y - r * 0.45); c.bezierCurveTo(x + r * 0.7, y - r * 1.2, x + r * 1.4, y - r * 0.1, x, y + r * 0.9); c.closePath(); }
function photoView(c, t, which) { const L = which === 1 ? 'o4' : 'tw', p0 = ev(L, 'photo'), fl = ev(L, 'flash');
  if (which === 1) backdrop(c, t, '#FCE3EC', '#F49AB8'); else backdrop(c, t, '#FFF1C9', '#F2B33D');
  const img = which === 1 ? snapshot('p1', fl + 0.02, 'o4', 120, -960, 0.45) : snapshot('p2', fl + 0.02, 'tw', -260, -980, 0.355);
  const k = eBack(P(t, p0, p0 + 0.35), 1.5), rot = (which === 1 ? -0.05 : 0.05) * (1 - 0.3 * eOut(P(t, p0, p0 + 1.5)));
  c.save(); c.translate(540, 840); c.rotate(rot + (1 - k) * 0.3); c.scale(k, k);
  c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(-470 + 14, -500 + 20, 940, 1060); c.fillStyle = '#FFFDF8'; c.fillRect(-470, -500, 940, 1060);
  c.drawImage(img, -430, -460, 860, 860); c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 3; c.strokeRect(-430, -460, 860, 860);
  for (let i = 0; i < 3; i++) { c.fillStyle = [RED, C.pink, C.gold][i]; heartPath(c, -90 + i * 90, 482, 26); c.fill(); }
  c.restore(); K.mark(c, 'photo', 540, 840, 430); }
function flash(c, t) { for (const L of ['o4', 'tw']) { const u = t - ev(L, 'flash'); if (u >= 0 && u < 0.45) { c.save(); c.globalAlpha = 1 - eOut(u / 0.45); c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, W, HH); c.restore(); } } }

// ---------------- overlays
function title(c, t) { const a = 1 - P(t, 2.45, 2.75); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 360); c.rotate(-0.04); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -102);
  UI.textFit(c, 'Unb9', 120, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 6, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 64, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 112); c.restore(); }
const PLATES = { o1: ['1', 'В ЛОБ', '#E0474C'], o2: ['2', 'ВЕЖЛИВО', '#F2B33D'], o3: ['3', 'КАК НОСИТЕЛЬ', '#4CAF6A'], o4: ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', '#8E5BD0'] };
// option plate: pops big at the start of the option (<= 0.6 s), then stays as a small label at the top
function plate(c, t, sc) { const p = PLATES[sc.id]; if (!p) return; const u = t - sc.s, out = P(t, sc.e - 0.15, sc.e);
  const k = eBack(P(u, 0, 0.25), 2.2) * (1 - eIn(out)), big = 1 - eIO(P(u, 0.3, 0.5)); if (k <= 0) return;
  UI.font(c, 'Unb9', 54); const tw = c.measureText(p[1]).width, w = tw + 200, h = 100;
  const s = k * Math.min(lerp(1, 1.4, big), 960 / w), y = 215;
  c.save(); c.translate(540, y); c.scale(s, s); c.rotate(-0.025);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -h / 2 + 9, w, h, 50); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 50); c.fill(); c.stroke();
  c.fillStyle = p[2]; c.beginPath(); c.arc(-w / 2 + 50, 0, 50, 0, TAU); c.fill(); c.stroke(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p[0], -w / 2 + 50, 4);
  c.fillStyle = C.oliveD; c.textAlign = 'left'; c.fillText(p[1], -w / 2 + 120, 4); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w / 2 * s, y: y - 50 * s, w: w * s, h: 100 * s, k, id: 'plate_' + sc.id }); }

// ---------------- end screen: question, 1 / 2 / 3 / 4 (2x2), СОХРАНИ, ПОДПИСАТЬСЯ clicked by the cursor
const wAt = (id, w, fb) => K.wordT(id, w) ?? fb;
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, { textFit, strokeText, font } = UI;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // heroine + Chloe in the same dress (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34, 2nd character at local x 640)
  const hy = lerp(2350, 2060, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gc = G.chl; K.put(c, CHL, { t, mood: 'happy', blink: 1, turn: -0.2, look: -0.4, armL: hip(gc, -1), armR: tada(gc, 1), items: {}, afterTorso: dressExtras(0) }, 640, 0);
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0.1, look: 0.3, armL: tada(g, -1, Math.sin(t * 8) * 25), armR: hip(g, 1), items: {}, afterTorso: dressExtras(0) }, 0, 0); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const q = eBack(P(u, 0.2, 0.55), 2.2); c.save(); c.translate(540, 330); c.scale(q, q); font(c, 'Unb9', 64); strokeText(c, 'А ТЫ БЫ', 0, -50, C.oliveD, C.white, 14); strokeText(c, 'ОТВЕТИЛА КАК?', 0, 40, C.pink, C.white, 14); c.restore();
  const tw = [wAt('outro', 'один', sp.t + 1.4), wAt('outro', 'два', sp.t + 1.8), wAt('outro', 'три', sp.t + 2.1), wAt('outro', 'четыре', sp.t + 2.5)];
  ['o1', 'o2', 'o3', 'o4'].forEach((id, i) => { const p = PLATES[id], kk = eBack(P(t, tw[i] - 0.1, tw[i] + 0.2), 2.2); if (kk <= 0) return; const x = i % 2 ? 715 : 285, y = 610 + Math.floor(i / 2) * 225, bump = 1 + 0.06 * Math.sin(clamp((t - tw[i]) / 0.4) * Math.PI);
    c.save(); c.translate(x, y); c.scale(kk * bump, kk * bump); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -205 + 8, -95 + 12, 410, 190, 40); c.fill(); c.fillStyle = p[2]; c.strokeStyle = C.oliveD; c.lineWidth = 8; rr(c, -205, -95, 410, 190, 40); c.fill(); c.stroke();
    font(c, 'Unb9', 110); c.fillStyle = C.white; c.fillText(p[0], -130, 6); const lab = p[1].split(' '); const two = lab.length > 1 && p[1].length > 9;
    if (two) { textFit(c, 'Unb9', 32, lab[0], 230); c.fillText(lab[0], 60, -20); textFit(c, 'Unb9', 32, lab.slice(1).join(' '), 230); c.fillText(lab.slice(1).join(' '), 60, 24); } else { textFit(c, 'Unb9', 34, p[1], 230); c.fillText(p[1], 60, 4); } c.restore(); });
  const svT = wAt('outro', 'пиши', sp.t + 3.25) - 0.1, sk = eBack(P(t, svT, svT + 0.3), 2.2), pulse = 1 + 0.05 * Math.sin(clamp((t - svT - 0.3) / 0.5) * Math.PI);
  if (sk > 0) { c.save(); c.translate(540, 1100); c.scale(sk * pulse, sk * pulse); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -260 + 6, -60 + 10, 520, 120, 60); c.fill(); c.fillStyle = C.gold; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -260, -60, 520, 120, 60); c.fill(); c.stroke();
    c.fillStyle = C.oliveD; c.beginPath(); c.moveTo(-190, -32); c.lineTo(-146, -32); c.lineTo(-146, 34); c.lineTo(-168, 16); c.lineTo(-190, 34); c.closePath(); c.fill();   // bookmark icon drawn with paths
    textFit(c, 'Unb9', 50, 'СОХРАНИ', 330); c.fillStyle = C.oliveD; c.fillText('СОХРАНИ', 40, 4); c.restore(); }
  const subT = svT + 0.5, bk = eBack(P(t, subT, subT + 0.3), 2), sy = 1290;
  if (bk > 0) { const click = P(t, subT + 0.8, subT + 0.95), pressed = t > subT + 0.9; c.save(); c.translate(640, sy); const ss = bk * (1 - 0.08 * Math.sin(click * Math.PI)); c.scale(ss, ss); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -250 + 6, -58 + 10, 500, 116, 58); c.fill(); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -250, -58, 500, 116, 58); c.fill(); textFit(c, 'Unb9', 42, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 430); c.fillStyle = C.white; c.fillText(pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4); c.restore();
    const mv = eIO(P(t, subT + 0.2, subT + 0.8)); UI.tapCursor(c, lerp(900, 700, mv), lerp(sy + 230, sy + 20, mv), 1, P(t, subT + 0.85, subT + 1.4)); }
  UI.captions(c, t); Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag.startsWith('ui:')) { if (tag === 'ui:phone') phoneView(c, t); else photoView(c, t, tag === 'ui:photo1' ? 1 : 2); heads = { her: OFF, friend2: OFFL }; proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.24); }
  const names = { friend2: ['CHLOE', RED] };
  if (!tag.startsWith('ui:')) K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names, hold: { hook_f: -0.22, o1_h: -0.22, o1_f: -0.22, o2_h: -0.2, o2_f: -0.2, o3_h: -0.2, o3_f: -0.15, o4_h: -0.05, o4_f: -0.2 } });
  flash(c, t);
  if (L === 'hook') title(c, t);
  plate(c, t, sc);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  // the end screen wipes in from the twist
  const d = sc.e - t; if (L === 'tw' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('dress', NF, renderFrame);
