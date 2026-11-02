// "Friend won't pay back the 5000" renderer (hard_cut camera): node debt.js start end out.mp4 | node debt.js 0 0 --png=f1,f2
// New short format (owner's «Правки» doc): A1 / B1 / C1 only, the story never stops, a lesson card pops over the running scene for 3 s,
// Sarah speaks only the outro, cheat sheet ~8 s. Same cafe, heroine and Emma as late.js; the waiter is the splitbill waiter (no lines).
// Running gag: the debt counter (ДОЛГ: 5000 -> 5420 -> 0) and the bag's price tag 4900 (seen in the hook, pays off in C1).
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/debt/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C, LVCOL } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const rnd = (i, k = 0) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
const LV3 = ['A1', 'B1', 'C1'];

// ---------------- cast (approved looks: heroine and Emma exactly as in late.js, waiter as in splitbill.js, two regulars from cast_v2)
const HER = { ...BASE.her_lift, top: { type: 'sweater', col: '#7FB0D8' }, bottom: { type: 'jeans', col: '#4A5A7A' }, shoes: { col: '#F4EFE6', acc: '#C98B5A' } };
const EMM = { ...BASE.chloe, top: { type: 'cardigan', col: '#F2C14E', col2: '#FFF6F0' }, bottom: { type: 'skirt', col: '#E8A91C' }, shoes: { col: '#E0474C', acc: null } };
const WTR = { ...BASE.oliver, top: { type: 'tee', col: '#FFFDF8' }, bottom: { type: 'trousers', col: '#2B2F3A' } };
const PT1 = { ...BASE.tom, top: { type: 'sweater', col: '#8CB369' }, bottom: { type: 'jeans', col: '#4A5A7A' } };
const PT2 = { ...BASE.linda, top: { type: 'cardigan', col: '#EE5E9A', col2: '#FFF6F0' }, bottom: { type: 'skirt', col: '#5E6B2F' } };
const G = { her: geom(HER), emma: geom(EMM), wtr: geom(WTR), p1: geom(PT1), p2: geom(PT2) };
const HX = -430, EX = 430, CT = -610;                       // her / Emma x, table top
const TL0 = -850, TR0 = 560;                                 // table cloth left / right edge
const BAGX = 760, BINX = 990;                                // bag on the floor next to Emma, bin far right
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- props
const big = (f, k = 1.5) => ctx => { ctx.scale(k, k); f(ctx); };
const napkinDraw = (txt = true, sign = 1) => ctx => { ctx.save(); ctx.rotate(-0.08); ctx.fillStyle = 'rgba(0,0,0,.15)'; rr(ctx, -86, -176, 180, 170, 8); ctx.fill(); ctx.fillStyle = '#FFFDF8'; rr(ctx, -92, -184, 180, 170, 8); ctx.fill(); ctx.strokeStyle = '#C9CED6'; ctx.lineWidth = 3; ctx.stroke();
  ctx.strokeStyle = 'rgba(200,200,210,.6)'; ctx.lineWidth = 2; for (let y = -160; y < -20; y += 22) { ctx.beginPath(); ctx.moveTo(-80, y); ctx.lineTo(76, y); ctx.stroke(); }
  if (txt) { fitTxt(ctx, 'I.O.U.', -2, -150, 34, '#2B4FA8', 150, 'Cav7'); fitTxt(ctx, '5000', -2, -104, 46, '#2B4FA8', 150, 'Cav7');
    if (sign > 0) { ctx.save(); ctx.beginPath(); ctx.rect(-80, -80, 160 * clamp(sign), 60); ctx.clip(); fitTxt(ctx, 'Emma ♥', -2, -56, 32, '#2B4FA8', 150, 'Cav7'); ctx.restore(); } }
  ctx.restore(); };
const napkinItem = (sign) => big(napkinDraw(true, sign), 1.15);
const penItem = ctx => { ctx.save(); ctx.rotate(0.5); ctx.fillStyle = '#2B4FA8'; rr(ctx, -9, -150, 18, 140, 6); ctx.fill(); ctx.fillStyle = '#C9CED6'; ctx.beginPath(); ctx.moveTo(-9, -10); ctx.lineTo(9, -10); ctx.lineTo(0, 14); ctx.fill(); ctx.restore(); };
const forkItem = (bite) => Hq.items.fork(bite);
const cardItem = ctx => { ctx.save(); ctx.rotate(-0.2); ctx.fillStyle = '#4C7BD9'; rr(ctx, -70, -120, 140, 90, 10); ctx.fill(); ctx.strokeStyle = '#2B3F7A'; ctx.lineWidth = 4; ctx.stroke(); ctx.fillStyle = '#F2C14E'; rr(ctx, -50, -96, 32, 24, 4); ctx.fill(); ctx.restore(); };
const billItem = ctx => { ctx.save(); ctx.rotate(0.1); ctx.fillStyle = '#2B2F3A'; rr(ctx, -80, -210, 160, 200, 10); ctx.fill(); ctx.fillStyle = '#FFFDF8'; rr(ctx, -62, -196, 124, 170, 6); ctx.fill();
  fitTxt(ctx, 'BILL', 0, -170, 28, '#2B2F3A', 110); ctx.fillStyle = '#C9CED6'; for (let k = 0; k < 3; k++) ctx.fillRect(-48, -140 + k * 22, 60, 8); fitTxt(ctx, '420', 0, -56, 40, '#E0474C', 110); ctx.restore(); };
const phoneDraw = (ok) => ctx => { ctx.save(); ctx.rotate(-0.08); ctx.fillStyle = '#1B1E26'; rr(ctx, -80, -250, 160, 270, 20); ctx.fill(); ctx.fillStyle = ok ? '#DFF5E6' : '#EEF3FA'; rr(ctx, -68, -236, 136, 242, 12); ctx.fill();
  if (ok) { ctx.fillStyle = '#4CAF6A'; ctx.beginPath(); ctx.arc(0, -160, 34, 0, TAU); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-15, -160); ctx.lineTo(-3, -146); ctx.lineTo(18, -176); ctx.stroke(); fitTxt(ctx, '5420', 0, -82, 40, '#1F2A44', 120); }
  else { ctx.fillStyle = '#C9D6E8'; for (let k = 0; k < 4; k++) rr(ctx, -54, -210 + k * 50, 108, 34, 8), ctx.fill(); }
  ctx.restore(); };
const phoneItem = ok => big(phoneDraw(ok), 1.25);

// price tag on a string (x, y = where the string is tied); k = size
function priceTag(c, x, y, k = 1, sway = 0) { c.save(); c.translate(x, y); c.rotate(0.25 + sway); c.strokeStyle = '#7A4E2E'; c.lineWidth = 3 / k * k; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 46 * k); c.stroke();
  c.translate(0, 46 * k); c.scale(k, k); c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.moveTo(-34 + 4, 6); c.lineTo(34 + 4, 6); c.lineTo(34 + 4, 70); c.lineTo(-34 + 4, 70); c.fill();
  c.fillStyle = '#FFFDF8'; c.beginPath(); c.moveTo(0, -6); c.lineTo(34, 14); c.lineTo(34, 66); c.lineTo(-34, 66); c.lineTo(-34, 14); c.closePath(); c.fill(); c.strokeStyle = '#9C6238'; c.lineWidth = 2.5; c.stroke();
  c.fillStyle = '#9C6238'; c.beginPath(); c.arc(0, 6, 4, 0, TAU); c.fill(); fitTxt(c, '4900', 0, 42, 22, '#E0474C', 60); c.restore(); }
// the new bag (pink, glossy) standing on the floor; returns the tag anchor
function bag(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(0, 4, 150, 18, 0, 0, TAU); c.fill();
  c.strokeStyle = '#B23A6E'; c.lineWidth = 14; c.beginPath(); c.arc(0, -200, 78, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
  paint(c, q => { q.m(-140, -200); q.l(140, -200); q.l(120, 0); q.l(-120, 0); q.z(); }, '#EE5E9A', { sd: 12, hd: 6, lw: 4 });
  c.fillStyle = 'rgba(255,255,255,.35)'; rr(c, -110, -186, 40, 150, 18); c.fill(); c.fillStyle = '#F2C14E'; rr(c, -26, -150, 52, 30, 8); c.fill();
  c.restore(); return { x: x + 64 * s, y: y - 262 * s }; }
function cakePlate(c, x, y, bites = 0) { c.save(); c.translate(x, y);
  c.fillStyle = 'rgba(0,0,0,.14)'; c.beginPath(); c.ellipse(4, 6, 130, 22, 0, 0, TAU); c.fill(); c.fillStyle = '#FFFDF8'; c.beginPath(); c.ellipse(0, 0, 124, 22, 0, 0, TAU); c.fill(); c.strokeStyle = '#C9CED6'; c.lineWidth = 4; c.stroke();
  const w = 120 * (1 - 0.6 * bites); if (w > 8) { paint(c, q => { q.m(-60, -6); q.l(-60 + w, -6); q.l(-60 + w, -96); q.l(-60, -96); q.z(); }, '#8A4A2A', { sd: 6, hd: 3, lw: 3 });
    c.fillStyle = '#FFF0D8'; c.fillRect(-58, -64, w - 4, 10); c.fillRect(-58, -34, w - 4, 10); c.fillStyle = '#FFFDF8'; rr(c, -64, -110, w + 8, 20, 8); c.fill(); c.fillStyle = '#E0474C'; c.beginPath(); c.arc(-60 + w / 2, -116, 14, 0, TAU); c.fill(); }
  c.restore(); }

// ---------------- cafe (same set as late.js; prerendered, softly blurred)
const BX0 = -2200, BY0 = -3400, BW = 4400, BH = 4800, BS = 0.5;
function drawCafe(c) {
  c.fillStyle = '#F2E2C8'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = '#E8D3B0'; for (let x = BX0; x < BX0 + BW; x += 300) c.fillRect(x, -2900, 150, 2640);
  c.fillStyle = '#5E8C7B'; c.fillRect(BX0, -1050, BW, 790); c.fillStyle = '#4A7566'; c.fillRect(BX0, -1070, BW, 34);
  c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 5; for (let x = BX0; x < BX0 + BW; x += 330) { c.beginPath(); c.moveTo(x, -1036); c.lineTo(x, -260); c.stroke(); }
  c.fillStyle = '#B07A4A'; c.fillRect(BX0, -260, BW, 1700); c.strokeStyle = 'rgba(0,0,0,.14)'; c.lineWidth = 4; for (let y = -260; y < 1400; y += 120) { c.beginPath(); c.moveTo(BX0, y); c.lineTo(BX0 + BW, y); c.stroke(); } for (let y = -260, r = 0; y < 1400; y += 120, r++) for (let x = BX0 + (r % 2) * 260; x < BX0 + BW; x += 520) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 120); c.stroke(); }
  c.fillStyle = '#7A4E2E'; c.fillRect(BX0, -290, BW, 40);
  c.fillStyle = '#7A4E2E'; rr(c, 120, -2420, 1100, 1560, 24); c.fill(); c.fillStyle = '#BFE3F7'; rr(c, 160, -2380, 1020, 1480, 14); c.fill();
  c.fillStyle = '#9FB4C8'; for (const [x, w, h] of [[200, 200, 700], [440, 260, 900], [740, 220, 600], [980, 160, 800]]) c.fillRect(x, -900 - h, w, h);
  c.fillStyle = '#FFFFFF'; c.globalAlpha = .7; for (const [x, y] of [[300, -2200], [800, -2100]]) { c.beginPath(); c.ellipse(x, y, 140, 50, 0, 0, TAU); c.fill(); } c.globalAlpha = 1;
  c.strokeStyle = '#7A4E2E'; c.lineWidth = 22; c.beginPath(); c.moveTo(670, -2380); c.lineTo(670, -900); c.moveTo(160, -1650); c.lineTo(1180, -1650); c.stroke();
  c.fillStyle = '#1F5A7A'; rr(c, 330, -2580, 760, 150, 26); c.fill(); fitTxt(c, 'BLUE CUP CAFÉ', 710, -2506, 92, '#FFF6DC', 700);
  c.fillStyle = '#7A4E2E'; rr(c, -1230, -2420, 640, 900, 18); c.fill(); c.fillStyle = '#2E3A38'; rr(c, -1204, -2394, 588, 848, 10); c.fill();
  fitTxt(c, 'TODAY', -910, -2290, 76, '#F7F2E8', 520); ['COFFEE', 'TEA', 'CAKE', 'LATTE'].forEach((t, i) => { fitTxt(c, t, -1090, -2130 + i * 130, 62, '#FFE15A', 300, 'Cav7', 'left'); fitTxt(c, ['£3', '£2', '£4', '£4'][i], -690, -2130 + i * 130, 62, '#F7F2E8', 120, 'Cav7', 'right'); });
  for (const x of [-820, -130, 560]) { c.strokeStyle = '#4A4F5C'; c.lineWidth = 7; c.beginPath(); c.moveTo(x, -3000); c.lineTo(x, -2780); c.stroke(); c.fillStyle = '#F2C14E'; c.beginPath(); c.moveTo(x - 90, -2630); c.lineTo(x + 90, -2630); c.lineTo(x + 40, -2780); c.lineTo(x - 40, -2780); c.closePath(); c.fill(); }
  c.fillStyle = '#B4694A'; rr(c, 1380, -520, 190, 260, 18); c.fill(); c.fillStyle = '#3E8E55'; for (let i = 0; i < 7; i++) { c.beginPath(); c.ellipse(1475 + (i - 3) * 38, -700 - (i % 3) * 60, 40, 160, (i - 3) * 0.3, 0, TAU); c.fill(); }
  // back tables for the regulars
  for (const x of [-1000, 900]) { c.fillStyle = '#7A4E2E'; rr(c, x - 200, -700, 400, 34, 10); c.fill(); c.fillRect(x - 12, -670, 24, 410); c.fillStyle = '#FFFDF8'; rr(c, x - 60, -770, 60, 70, 8); c.fill(); }
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGK = mkBG(drawCafe);

// ---------------- table (one long cloth table, both women sit behind it), cake, napkin, bin
const bitesAt = (t, L) => { if (L === 'hook') return 0.1 + 0.1 * clamp(t / 1.7); if (L === 'A1') return 0.25 + 0.25 * clamp((t - SP.a1_e2.t) / 2); if (L === 'PAY') return t > ev('PAY', 'plate') + 0.6 ? 0.75 : 0.6; return 0.6; };
const napkinOnTable = (t, L) => L === 'B1' && t > endOf('b1_e2') + 0.05 && t < ev('B1', 'wipe');
function table(c, t, L) {
  c.fillStyle = 'rgba(0,0,0,.16)'; c.beginPath(); c.ellipse((TL0 + TR0) / 2, 16, (TR0 - TL0) / 2, 30, 0, 0, TAU); c.fill();
  paint(c, q => { q.m(TL0 + 30, CT + 40); q.l(TR0 - 30, CT + 40); q.l(TR0 - 60, 0); q.l(TL0 + 60, 0); q.z(); }, '#E0474C', { sd: 8, hd: 3, lw: 4 });
  c.save(); c.beginPath(); c.moveTo(TL0 + 30, CT + 40); c.lineTo(TR0 - 30, CT + 40); c.lineTo(TR0 - 60, 0); c.lineTo(TL0 + 60, 0); c.closePath(); c.clip(); c.fillStyle = 'rgba(255,255,255,.55)'; for (let x = TL0; x < TR0; x += 90) c.fillRect(x, CT, 45, 700); for (let y = CT + 40; y < 0; y += 90) c.fillRect(TL0, y, TR0 - TL0, 45); c.restore();
  paint(c, q => { q.m(TL0, CT); q.l(TR0, CT); q.l(TR0 - 20, CT + 46); q.l(TL0 + 20, CT + 46); q.z(); }, '#F7F2E8', { sd: 8, hd: 3, lw: 4 });
  // her coffee + Emma's cake
  c.save(); c.translate(-560, CT + 8); c.scale(1.2, 1.2); Hq.items.coffee()(c, 0); c.restore();
  let px = 260; if (L === 'PAY') px = lerp(260, -200, eIO(P(t, ev('PAY', 'plate'), ev('PAY', 'plate') + 0.5)));
  cakePlate(c, px, CT + 10, bitesAt(t, L));
  if (napkinOnTable(t, L)) { c.save(); c.translate(40, CT + 4); c.scale(1.0, 0.6); napkinDraw(true, 1)(c); c.restore(); }
  // the bill on the table (A1, after the waiter leaves it) -> gone once paid
}
function bin(c) { c.save(); c.translate(BINX, 0); paint(c, q => { q.m(-80, -230); q.l(80, -230); q.l(64, 0); q.l(-64, 0); q.z(); }, '#9AA3B2', { sd: 8, hd: 4, lw: 4 }); c.fillStyle = '#6F7886'; rr(c, -90, -250, 180, 30, 10); c.fill(); c.restore(); }
// napkin flight into the bin
function napkinFly(c, t) { const b = ev('B1', 'bin'), a = b - 0.55; if (t < a || t > b + 0.1) return; const u = clamp((t - a) / 0.55); const x = lerp(260, BINX, u), y = lerp(-1050, -250, u) - Math.sin(u * Math.PI) * 300;
  c.save(); c.translate(x, y); c.rotate(u * 6); c.scale(0.7 * (1 - u * 0.4), 0.7 * (1 - u * 0.4)); napkinDraw(true, 1)(c); c.restore(); }

// ---------------- characters
const gest = (st, g, who, t, side, base) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } };
const hang = (g, s) => reach(g, s, s * g.sw * 0.8, g.ySh + 330);
const chest = (g, s, k = 0.6) => reach(g, s, s * g.sw * k, g.ySh + 230);
const cross = g => ({ armL: reach(g, -1, g.sw * 0.5, g.ySh + 240), armR: reach(g, 1, -g.sw * 0.5, g.ySh + 270) });
const hand2head = (g, s, k = 0.5) => reach(g, s, s * g.hw * k, g.headY + g.hh * 0.8);
const onTable = (g, s, dx = 1.3) => reach(g, s, s * g.sw * dx, CT + 30, { planar: true });
const sobbing = t => (t > ev('A1', 'sob') + 0.05 && t < SP.a1_e2.t + SP.a1_e2.d) ;
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { t, talk: talk('her', t), mood: 'neutral', turn: 0.3, look: 0.7, armL: hang(g, -1), armR: onTable(g, 1, 1.1), items: {} };
  if (L === 'hook') { st.mood = 'annoyed'; Object.assign(st, cross(g)); st.lookY = 0.25; }
  if (L === 'A1') { st.mood = 'angry';
    if (t < SP.a1_h.t + SP.a1_h.d + 0.2) { const s = eOut(P(t, e('slap') - 0.12, e('slap'))); st.armR = reach(g, 1, g.sw * 1.6, lerp(g.ySh - 200, CT + 30 + 2, s), { planar: true }); st.tilt = 0.05; }
    if (t > SP.a1_e.t + 0.3) { st.mood = 'shock'; st.blink = 0; st.armR = onTable(g, 1, 1.1); }
    if (t > e('turn') + 0.2) { st.mood = 'worried'; st.look = -0.3; st.lookY = -0.1; }
    if (t > e('bill') - 0.2) { st.mood = 'tired'; st.look = 0.6; if (t < e('paid') + 0.3) { st.items = { R: cardItem }; st.armR = reach(g, 1, g.sw * 2.1, g.ySh - 40, { planar: true }); } }
    if (t > e('cnt')) { st.mood = 'bored'; Object.assign(st, cross(g)); st.look = 0.2; }
    if (speaking('a1_e2', t, 0, 0.5)) { st.mood = 'annoyed'; st.look = 0.8; } }
  if (L === 'B1') { st.mood = 'neutral';
    if (speaking('b1_h', t, 0.05, 0.2)) { st.mood = 'worried'; gest(st, g, 'her', t, -1, 150); }
    if (speaking('b1_e', t, 0, 0.1)) { st.mood = 'skeptical'; st.blink = 0; }
    if (t > SP.b1_e2.t) { st.mood = 'skeptical'; }
    if (t > e('wipe') - 0.1) { st.mood = 'surprised'; st.blink = 0; st.look = 0.9; }
    if (t > e('bin') - 0.3) { st.mood = 'bored'; st.look = 1; st.lookY = 0.5; }
    if (t > e('bin') + 0.6) { st.mood = 'bored'; st.turn = 0; st.look = 0; st.lookY = 0; Object.assign(st, cross(g)); } }   // deadpan look at camera
  if (L === 'C1') { st.mood = 'neutral'; st.armR = onTable(g, 1, 1.1); st.armL = onTable(g, -1, 0.6);
    if (speaking('c1_h', t, 0.05, 0.2)) { st.mood = 'neutral'; gest(st, g, 'her', t, -1, 160); }
    if (speaking('c1_e', t, 0, 0.1)) { st.mood = 'skeptical'; st.blink = 0; }
    if (speaking('c1_h2', t, 0.05, 0.3)) { st.mood = 'happy'; st.armL = reach(g, -1, g.sw * 0.2, g.ySh + 200); }
    if (t > e('freeze')) { st.mood = 'smug'; st.look = 0.9; } }
  if (L === 'PAY') { st.mood = 'neutral'; st.look = 0.8;
    if (t > ev('PAY', 'ping')) { st.mood = 'happy'; }
    if (speaking('pay_h', t, 0.05, 0.4)) { st.mood = 'happy'; st.laugh = false; }
    if (t > ev('PAY', 'plate')) { const u = t - ev('PAY', 'plate'); st.mood = 'happy'; st.laugh = u > 0.6; st.armR = u < 0.6 ? reach(g, 1, lerp(g.sw * 2.6, g.sw * 1.0, eIO(clamp(u / 0.5))), CT + 20, { planar: true }) : reach(g, 1, g.sw * 0.3, g.headY + g.hh * 0.7);
      if (u > 0.6) st.items = { R: forkItem(u < 1.2) }; } }
  return st; }
function emmaState(t, L) { const g = G.emma, e = k => ev(L, k), st = { t, talk: talk('emma', t), mood: 'happy', turn: -0.35, look: -0.8, armL: onTable(g, -1, 1.0), armR: hang(g, 1), items: {}, headX: 0 };
  const eat = (u0) => { const u = (t - u0) * 1.6 % 1; st.items = { L: forkItem(u < 0.55) }; st.armL = u < 0.55 ? reach(g, -1, -g.hw * 0.25, g.headY + g.hh * 0.72) : reach(g, -1, -g.sw * 1.0, CT + 10, { planar: true }); };
  if (L === 'hook') { st.mood = 'happy'; st.look = 0.2; eat(0); st.squint = true; }
  if (L === 'A1') { st.mood = 'happy'; eat(0);
    if (t > e('slap') + 0.05) { st.mood = 'shock'; st.blink = 0; st.items = { L: forkItem(false) }; st.armL = onTable(g, -1, 1.0); }
    if (sobbing(t)) { st.mood = 'sad'; st.blink = 0; st.armR = hand2head(g, 1, 0.7); st.armL = chest(g, -1, 0.3); st.items = {}; st.tilt = 0.06 * Math.sin(t * 9); st.lookY = -0.4; }
    if (t > e('waiter') && t < SP.a1_e2.t) { st.mood = 'sad'; st.armR = chest(g, 1, 0.3); st.tilt = 0.04 * Math.sin(t * 7); }
    if (t > SP.a1_e2.t - 0.3) { st.mood = 'sad'; eat(SP.a1_e2.t); st.lookY = 0.2; } }
  if (L === 'B1') { st.mood = 'happy';
    if (speaking('b1_h', t, 0, 0.2)) { st.mood = 'worried'; }
    if (speaking('b1_e', t, 0, 0.1)) { st.mood = 'happy'; gest(st, g, 'emma', t, -1, 120); }
    if (t > e('write') - 0.1 && t < e('sign') + 0.4) { const w = Math.sin(t * 16) * 14; st.items = { L: penItem }; st.armL = reach(g, -1, -g.sw * 1.2 + w, CT - 20, { planar: true }); st.armR = onTable(g, 1, 0.6); st.lookY = 0.6; }
    if (t > e('sign') + 0.4 && t < endOf('b1_e2') + 0.05) { st.mood = 'smug'; st.items = { L: napkinItem(1) }; st.armL = reach(g, -1, -g.sw * 1.4, g.ySh - 140, { planar: true }); st.lookY = 0; }
    if (t > endOf('b1_e2') + 0.05) { st.mood = 'smug'; Object.assign(st, { armR: hang(g, 1) }); st.armL = onTable(g, -1, 1.0); }
    if (t > e('wipe')) { st.mood = 'surprised'; st.blink = 0; }
    if (t > e('bin') + 0.2) { st.mood = 'happy'; st.look = 0.1; } }       // shrugs it off
  if (L === 'C1') { st.mood = 'happy';
    if (speaking('c1_h', t, 0, 0.2)) { st.mood = t > SP.c1_h.t + SP.c1_h.d * 0.55 ? 'worried' : 'happy'; }
    if (speaking('c1_e', t, 0, 0.2)) { st.mood = 'worried'; st.armL = chest(g, -1, 0.4); st.armR = chest(g, 1, 0.4); st.look = -0.5; if (t > e('push') - 0.3) { st.look = 0.6; st.lookY = 0.7; } }
    if (speaking('c1_h2', t, 0, 0)) { st.mood = 'worried'; st.blink = 0; }
    if (t > e('tag') - 0.1) { st.mood = 'shock'; st.blink = 0; st.armL = chest(g, -1, 0.35); st.armR = chest(g, 1, 0.35); }
    if (t > e('freeze')) { st.mood = 'shock'; st.blink = 0; st.tilt = 0; } }
  if (L === 'PAY') { st.mood = 'sad'; st.look = -0.5;
    if (t > ev('PAY', 'phone') - 0.1) { st.items = { L: phoneItem(t > ev('PAY', 'ping') - 0.05) }; st.armL = reach(g, -1, -g.sw * 1.0, g.ySh - 60 + (t < ev('PAY', 'ping') ? 40 : 0), { planar: true }); st.lookY = 0.5; }
    if (t > ev('PAY', 'cnt') + 0.4) { st.items = {}; st.armL = onTable(g, -1, 1.0); st.lookY = 0; }
    if (speaking('pay_e', t, 0.05, 0.3)) { st.mood = 'sad'; st.look = -0.8; }
    if (t > SP.pay_h.t + 0.2) { st.mood = 'worried'; }
    if (t > ev('PAY', 'plate') + 0.2) { st.mood = 'sad'; st.lookY = 0.5; st.look = -0.4; } }
  return st; }
// waiter: walks in from the right behind the table (A1: bill + terminal; B1: wipes the table with the napkin, bins it)
function waiterPos(t, L) { if (L === 'A1') { const a = ev('A1', 'waiter'), b = ev('A1', 'paid') + 0.7; if (t < a || t > b + 0.9) return null; const x = t < b ? lerp(1500, -40, eOut(clamp((t - a) / 0.8))) : lerp(-40, 1500, eIn(clamp((t - b) / 0.9))); return x; }
  if (L === 'B1') { const a = ev('B1', 'wipe') - 0.8, b = ev('B1', 'bin') + 0.4; if (t < a || t > b + 1.0) return null; return t < b ? lerp(1500, 180, eOut(clamp((t - a) / 0.75))) : lerp(180, 1500, eIn(clamp((t - b) / 1.0))); } return null; }
function waiterState(t, L, x) { const g = G.wtr, st = { t, talk: 0, mood: 'neutral', turn: -0.4, look: -0.8, armL: hang(g, -1), armR: hang(g, 1), items: {}, headX: 0 };
  const walking = (L === 'A1' && (t < ev('A1', 'waiter') + 0.8 || t > ev('A1', 'paid') + 0.7)) || (L === 'B1' && (t < ev('B1', 'wipe') - 0.05 || t > ev('B1', 'bin') + 0.4)); if (walking) st.tilt = 0.03 * Math.sin(t * 14);
  if (L === 'A1') { if (t < ev('A1', 'paid') + 0.2) { st.items = { L: billItem }; st.armL = reach(g, -1, -g.sw * 1.9, g.ySh - 20, { planar: true }); } st.mood = 'smug'; }
  if (L === 'B1') { st.mood = 'neutral'; const w = ev('B1', 'wipe'), b = ev('B1', 'bin');
    if (t > w && t < b - 0.55) { const u = t - w; st.items = { L: big(napkinDraw(true, 1), 0.8) }; st.armL = reach(g, -1, -g.sw * 1.5 + Math.sin(u * 11) * 80, CT + 10, { planar: true }); st.lookY = 0.6; }
    if (t > b - 0.55 && t < b - 0.1) { st.armL = reach(g, -1, g.sw * 1.6, g.ySh - 200, { planar: true }); st.armR = reach(g, 1, g.sw * 1.8, g.ySh - 120, { planar: true }); st.turn = 0.3; } }
  return st; }
function regulars(c, t, L) {   // two regulars at back tables turn round when Emma starts sobbing (A1), and again at the tag (C1)
  const look = (L === 'A1' && t > ev('A1', 'turn') && t < ev('A1', 'paid')) || (L === 'C1' && t > ev('C1', 'tag') + 0.2);
  const k = look ? 1 : 0;
  const s1 = { t, talk: 0, mood: look ? 'surprised' : 'happy', turn: lerp(-0.7, 0.6, k), look: lerp(-0.8, 0.9, k), armL: hang(G.p1, -1), armR: reach(G.p1, 1, G.p1.sw * 1.0, G.p1.ySh + 120), items: {}, blink: look ? 0 : undefined };
  const s2 = { t, talk: 0, mood: look ? 'shock' : 'happy', turn: lerp(0.7, -0.6, k), look: lerp(0.8, -0.9, k), armL: reach(G.p2, -1, -G.p2.sw * 1.0, G.p2.ySh + 120), armR: hang(G.p2, 1), items: {}, blink: look ? 0 : undefined };
  K.put(c, PT1, s1, -1000, -260, 0.55); K.put(c, PT2, s2, 900, -260, 0.55); }

// ---------------- the world (clean singles: only the tagged character)
const DRAW = { wide: ['her', 'emma', 'wtr'], two: ['her', 'emma', 'wtr'], her: ['her', 'wtr'], emma: ['emma', 'wtr'], cover: ['her', 'emma'], prop: ['her', 'emma', 'wtr'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function tears(c, h, t) { if (!h) return; c.save(); c.fillStyle = '#7FC4F0'; for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { const u = ((t * 1.7 + k / 3 + (s > 0 ? 0.5 : 0)) % 1); const x = h.x + s * h.hh * 0.22 + s * u * 40, y = h.y + h.hh * 0.05 + u * h.hh * 0.9; c.globalAlpha = 1 - u * 0.6; c.beginPath(); c.moveTo(x, y - 18); c.quadraticCurveTo(x + 12, y + 4, x, y + 12); c.quadraticCurveTo(x - 12, y + 4, x, y - 18); c.fill(); } c.restore(); }
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGK, BX0, BY0, BW, BH); if (!['her', 'emma', 'prop'].includes(tag)) regulars(c, t, L);
  const wx = waiterPos(t, L); if (wx !== null && who.includes('wtr')) K.put(c, WTR, waiterState(t, L, wx), wx, -40);
  // bag on the floor next to Emma (C1: pushed under the cloth; the tag stays out)
  const pu = L === 'C1' ? eIO(P(t, ev('C1', 'push') - 0.1, ev('C1', 'push') + 0.5)) : (L === 'PAY' || L === 'outro' ? 1 : 0), bx = lerp(BAGX, 330, pu);
  const tagA = bag(c, bx, 0, 0.95);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), HX, 0);
  if (who.includes('emma')) heads.emma = K.put(c, EMM, emmaState(t, L), EX, 0);
  table(c, t, L); bin(c);
  if (pu > 0.98) { const sw = 0.12 * Math.sin(t * 3); priceTag(c, TR0 - 70, -70, 1.15, sw); }      // the tag peeks out from under the cloth
  else priceTag(c, tagA.x, tagA.y, 1.15, 0.05 * Math.sin(t * 2));
  if (L === 'C1' && pu > 0 && pu < 1) { c.save(); c.translate(lerp(BAGX + 150, 470, pu), -10); c.fillStyle = '#E0474C'; rr(c, -60, -36, 130, 40, 18); c.fill(); c.strokeStyle = '#8A1C2E'; c.lineWidth = 4; c.stroke(); c.restore(); }   // Emma's red shoe pushing the bag
  if (L === 'A1' && sobbing(t) && heads.emma) tears(c, heads.emma, t);
  if (L === 'B1') napkinFly(c, t);
  if (!heads.emma) heads.emma = OFF; if (!heads.her) heads.her = OFFL;
  return heads; }

// ---------------- shots (world coordinates). fy(): world y that puts a head at screen y = sy
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const hHY = G.her.headY, eHY = G.emma.headY;
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(140, -1180, 0.72, 'cover'), WIDE: S(20, -1000, 0.5, 'wide'), TWO: S(20, fy(eHY, 0.75, 820), 0.75, 'two'), TWO_H: S(20, fy(eHY, 0.7, 1180), 0.7, 'two'),
  HER: S(HX + 40, fy(hHY, 1.0), 1.0, 'her'), HER_CU: S(HX + 30, fy(hHY, 1.6, 960), 1.6, 'her'), HER_H: S(HX + 40, fy(hHY, 1.0, 1250), 1.0, 'her'),
  EM: S(EX - 20, fy(eHY, 1.0), 1.0, 'emma'), EM_H: S(EX - 20, fy(eHY, 1.0, 1250), 1.0, 'emma'), EM_CU: S(EX - 20, fy(eHY, 1.6, 960), 1.6, 'emma'),
  NAPKIN: S(EX - 260, CT - 120, 1.45, 'prop'), BAG: S(560, -330, 1.0, 'prop'), TAG: S(TR0 - 70, -20, 2.4, 'prop'), PAYW: S(-200, fy(eHY, 0.62, 900), 0.62, 'wide'), CAKE: S(-40, fy(hHY, 0.85, 860), 0.85, 'two') };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  const sp = id => speaking(id, t, 0.1, 0.15);
  if (L === 'hook') return SH.COVER;
  if (L === 'A1') { if (t < e('slap') + 0.5) return f(SH.HER_CU); if (sp('a1_h')) return f(SH.HER);
    if (t < e('sob') - 0.1) return f(SH.EM_CU); if (t < e('turn')) return f(SH.EM); if (t < e('waiter')) return f(SH.WIDE); if (t < e('cnt') + 0.4) return f(SH.TWO); if (t < SP.a1_e2.t - 0.15) return f(SH.HER_CU);
    if (t < endOf('a1_e2') + 0.2) return f(SH.EM_H); return f(SH.TWO_H); }
  if (L === 'B1') { if (sp('b1_h')) return f(SH.HER); if (t < e('write') - 0.2) return f(SH.EM); if (t < e('sign') + 0.4) return f(SH.TWO); if (t < endOf('b1_e2') + 0.2) return f(SH.EM);
    if (t < e('bin') + 0.5) return f(SH.WIDE); return f(SH.HER_H); }
  if (L === 'C1') { if (sp('c1_h')) { const p = SP.c1_h, k = (t - p.t) / p.d; return f(k < 0.62 ? SH.HER : SH.HER_CU); }
    if (t < e('push') - 0.35) return f(SH.EM); if (t < e('push') + 0.8) return f(SH.BAG); if (t < SP.c1_h2.t - 0.1) return f(SH.EM_CU);
    if (t < e('tag') - 0.05) return f(SH.HER); if (t < e('freeze')) return f(SH.TAG); return f(SH.EM_H); }
  if (L === 'PAY') { if (t < ev('PAY', 'cnt') + 0.6) return f(SH.TWO); if (t < SP.pay_h.t - 0.15) return f(SH.EM); if (t < endOf('pay_h') + 0.1) return f(SH.HER); return f(SH.CAKE); }
  return SH.TWO; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'thud', 'impact_soft']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- HUD: 3-level bar (only the levels this video really has), debt counter, lesson card, phone insert
function debtValue(t) { const a = ev('A1', 'cnt'), z = ev('PAY', 'cnt'); if (t < a) return 5000; if (t < z) return Math.round(lerp(5000, 5420, eOut(clamp((t - a) / 0.35)))); return Math.round(lerp(5420, 0, eOut(clamp((t - z) / 0.6)))); }
function hudBar(c, t, L) { const cur = LV3.indexOf(L), y = 196, ph = 64, pw = 120, gap = 14, x0 = 70;
  c.fillStyle = 'rgba(243,237,223,.86)'; rr(c, x0 - 18, y - 14, 3 * pw + 2 * gap + 36, ph + 28, (ph + 28) / 2); c.fill();
  LV3.forEach((lv, i) => { const x = x0 + i * (pw + gap), isCur = i === cur, done = cur >= 0 ? i < cur : (L === 'PAY' || L === 'outro'); const p = isCur ? 1.1 + 0.04 * Math.sin(t * 6) : 1;
    c.save(); c.translate(x + pw / 2, y + ph / 2); c.scale(p, p); c.fillStyle = 'rgba(0,0,0,.15)'; rr(c, -pw / 2 + 4, -ph / 2 + 6, pw, ph, ph / 2); c.fill();
    c.fillStyle = isCur ? LVCOL[lv] : done ? C.olive : C.white; rr(c, -pw / 2, -ph / 2, pw, ph, ph / 2); c.fill(); c.lineWidth = 5; c.strokeStyle = C.oliveD; c.stroke();
    UI.font(c, 'Unb9', 30); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = isCur || done ? C.white : C.oliveD; c.fillText(lv, 0, 2); if (done) UI.check(c, pw / 2 - 10, -ph / 2 + 6, 15, C.gold); c.restore(); });
  // debt counter (right, kept left of the TikTok buttons)
  const v = debtValue(t), z = v === 0, pulse = [ev('A1', 'cnt'), ev('PAY', 'cnt')].reduce((a, q) => Math.max(a, 1 - clamp(Math.abs(t - q - 0.15) / 0.35)), 0);
  c.save(); c.translate(722, y + ph / 2); c.scale(1 + 0.12 * pulse, 1 + 0.12 * pulse); c.rotate(-0.03); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -186 + 6, -44 + 8, 372, 88, 44); c.fill();
  c.fillStyle = z ? C.green : C.red; rr(c, -186, -44, 372, 88, 44); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke();
  fitTxt(c, 'ДОЛГ: ' + v, 0, 3, 42, C.white, 330); c.restore(); }
function lessonCard(c, t, L) { const cd = (TL.cfg.cards || {})[L], t0 = ev(L, 'card'); if (!cd || t < t0 - 0.05 || t > t0 + 3.1) return;
  const k = eBack(P(t, t0, t0 + 0.32), 1.7), out = eIn(P(t, t0 + 2.75, t0 + 3.05)); const x = 70, w = 940, y = 300 - out * 700, h = 250;
  c.save(); c.globalAlpha = clamp((t - t0) / 0.12); c.translate(540, y + h / 2); c.rotate((1 - k) * -0.08); c.scale(lerp(0.85, 1, k), lerp(0.85, 1, k)); c.translate(-540, -(y + h / 2));
  c.fillStyle = 'rgba(62,71,30,.28)'; rr(c, x + 12, y + 18, w, h, 44); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 8; rr(c, x, y, w, h, 44); c.fill(); c.stroke();
  c.fillStyle = LVCOL[L]; rr(c, x + 40, y - 34, 250, 68, 34); c.fill(); c.stroke(); UI.font(c, 'Unb9', 30); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(L + ' • ФРАЗА', x + 165, y + 2);
  const bad = L === 'A1'; if (bad) UI.cross(c, x + w - 70, y + 4, 34); else UI.check(c, x + w - 70, y + 4, 34);
  UI.textFit(c, 'Nun9', 62, cd.en, w - 90); c.fillStyle = bad ? C.red : C.oliveD; c.textAlign = 'center'; c.fillText(cd.en, 540, y + 84);
  if (bad) { const tw = c.measureText(cd.en).width; c.strokeStyle = 'rgba(224,71,76,.0)'; }
  UI.textFit(c, 'Nun9', 46, cd.ru, w - 90); c.fillStyle = C.pinkD; c.fillText(cd.ru, 540, y + 150);
  UI.textFit(c, 'Nun7', 34, cd.note, w - 120); c.fillStyle = bad ? C.red : C.olive; c.fillText(cd.note, 540, y + 205);
  c.restore(); }
function napkinInsert(c, t) { const a = ev('B1', 'write') - 0.15, b = ev('B1', 'sign') + 0.45; if (t < a || t > b) return; const k = eBack(P(t, a, a + 0.3), 1.8) * (1 - eIn(P(t, b - 0.25, b)));
  if (k <= 0) return; const prog = clamp((t - ev('B1', 'write')) / (ev('B1', 'sign') - ev('B1', 'write'))), sg = clamp((t - ev('B1', 'sign')) / 0.35);
  c.save(); c.translate(560, 1420); c.scale(k * 2.3, k * 2.3); c.rotate(-0.05); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -86, -176, 180, 170, 8); c.fill(); c.fillStyle = '#FFFDF8'; rr(c, -92, -184, 180, 170, 8); c.fill(); c.strokeStyle = '#C9CED6'; c.lineWidth = 2; c.stroke();
  c.save(); c.beginPath(); c.rect(-92, -184, 180, 50 + prog * 100); c.clip(); fitTxt(c, 'I.O.U.', -2, -150, 34, '#2B4FA8', 150, 'Cav7'); fitTxt(c, '5000', -2, -104, 46, '#2B4FA8', 150, 'Cav7'); c.restore();
  if (sg > 0) { c.save(); c.beginPath(); c.rect(-80, -80, 160 * sg, 60); c.clip(); fitTxt(c, 'Emma ♥', -2, -56, 32, '#2B4FA8', 150, 'Cav7'); c.restore(); }
  const px = sg > 0 ? -60 + sg * 120 : -50 + Math.sin(t * 16) * 30, py = sg > 0 ? -56 : -150 + prog * 90; c.save(); c.translate(px, py); penItem(c); c.restore(); c.restore(); }
function phoneInsert(c, t) { const a = ev('PAY', 'ping') - 0.35, b = ev('PAY', 'cnt') + 0.55; if (t < a || t > b) return; const k = eBack(P(t, a, a + 0.3), 1.8) * (1 - eIn(P(t, b - 0.25, b)));
  if (k <= 0) return; c.save(); c.translate(540, 1080); c.scale(k, k); c.translate(-540, -1080);
  K.phone(c, 540, 1080, 0.95, (q, w, h) => { const ok = t > ev('PAY', 'ping'); q.fillStyle = ok ? '#E6F6EC' : '#F4F1EC'; q.fillRect(0, 0, w, h); fitTxt(q, 'MY BANK', w / 2, 70, 34, '#3E471E', w - 60);
    if (ok) { q.fillStyle = '#4CAF6A'; q.beginPath(); q.arc(w / 2, 250, 80, 0, TAU); q.fill(); q.strokeStyle = '#fff'; q.lineWidth = 18; q.lineCap = 'round'; q.beginPath(); q.moveTo(w / 2 - 36, 252); q.lineTo(w / 2 - 8, 282); q.lineTo(w / 2 + 40, 216); q.stroke();
      fitTxt(q, 'Transfer sent', w / 2, 400, 40, '#3E471E', w - 60); fitTxt(q, '5420', w / 2, 480, 96, '#2E8A50', w - 60); fitTxt(q, 'for: debt + cake', w / 2, 570, 32, '#6A707A', w - 60, 'Nun9'); }
    else { fitTxt(q, 'Sending…', w / 2, 300, 44, '#6A707A', w - 60, 'Nun9'); } }); c.restore(); }

// ---------------- cover badge (frame 0) + cheat sheet outro
function coverBadge(c, t) { const p = 1 + 0.04 * Math.sin(t * 8); c.save(); c.translate(540, 1640); c.scale(p, p); c.rotate(-0.03); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -330 + 6, -62 + 10, 660, 124, 62); c.fill(); c.fillStyle = '#FFE15A'; rr(c, -330, -62, 660, 124, 62); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; rr(c, -330, -62, 660, 124, 62); c.stroke();
  fitTxt(c, 'GIVE ME MY MONEY!', 0, 4, 56, '#E0474C', 600); c.restore(); }
const ROWS = [['B1', 'Could you pay me back?', 'Можешь вернуть мне долг?'], ['C1', "I don't want to make this awkward, but…", 'Не хочу, чтобы было неловко, но…'], ['C1', 'Can we agree on a date?', 'Давай договоримся о дате?']];
function sheet(c, t) { const s = SC.outro.s, u = t - s; const { textFit, strokeText, font, rr: R } = UI;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH); c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // heroes wave from the bottom
  c.save(); c.translate(190, lerp(2300, 1900, eBack(P(u, 0.4, 0.9), 1.4))); c.scale(0.42, 0.42); const g = G.her, ge = G.emma;
  K.put(c, EMM, { t, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, armL: reach(ge, -1, -ge.sw * 2.0, ge.ySh - 330 + Math.sin(t * 8) * 30, { planar: true }), armR: hang(ge, 1), items: {} }, 1500, 60);
  K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(t * 8) * 30, { planar: true }), armR: hang(g, 1), items: {} }, 0, 0); c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const q = eBack(P(u, 0.15, 0.5), 2.2); c.save(); c.translate(540, 300); c.scale(q, q); font(c, 'Unb9', 58); strokeText(c, 'КАКОЙ ВАРИАНТ', 0, -50, C.oliveD, C.white, 14); strokeText(c, 'ТВОЙ?', 0, 36, C.pink, C.white, 14); c.restore();
  const k = eBack(P(u, 0.45, 0.85), 1.8), n = ROWS.length, rh = 150, bh = 120 + n * rh;
  if (k > 0) { c.save(); c.translate(540, 780); c.scale(k, k); c.fillStyle = 'rgba(0,0,0,.14)'; R(c, -480 + 8, -bh / 2 + 12, 960, bh, 34); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; R(c, -480, -bh / 2, 960, bh, 34); c.fill(); c.stroke();
    font(c, 'Unb9', 38); c.fillStyle = C.pink; c.textAlign = 'left'; c.fillText('ШПАРГАЛКА', -430, -bh / 2 + 48);
    ROWS.forEach(([lv, en, ru], i) => { const y = -bh / 2 + 150 + i * rh, kk = eBack(P(u, 0.75 + i * 0.18, 1.1 + i * 0.18), 2.2); if (kk <= 0) return; c.save(); c.translate(0, y); c.scale(kk, kk);
      c.fillStyle = LVCOL[lv]; R(c, -440, -34, 82, 68, 18); c.fill(); font(c, 'Unb9', 30); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(lv, -399, 3);
      c.textAlign = 'left'; textFit(c, 'Nun9', 46, en, 790); c.fillStyle = C.oliveD; c.fillText(en, -335, -16); textFit(c, 'Nun7', 34, ru, 790); c.fillStyle = C.pinkD; c.fillText(ru, -335, 34); c.restore(); });
    c.restore(); }
  const by = 780 + bh / 2 + 120, bk = eBack(P(u, 1.6, 2.0), 2.2);
  if (bk > 0) { c.save(); c.translate(540, by); c.scale(bk, bk); c.fillStyle = C.gold; R(c, -450, -50, 420, 100, 50); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke(); font(c, 'Unb9', 34); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.fillText('СОХРАНИ', -240, 3);
    c.fillStyle = '#4CAF6A'; R(c, 10, -50, 440, 100, 50); c.fill(); c.strokeStyle = C.oliveD; c.stroke(); c.fillStyle = C.white; font(c, 'Unb9', 26); c.fillText('ОТПРАВЬ', 230, -14); c.fillText('ПОДРУГЕ', 230, 20); c.restore(); }
  const ak = eOut(P(u, 2.2, 2.5)); if (ak > 0) { c.save(); c.globalAlpha = ak; c.translate(600, by + 140 + Math.sin(t * 7) * 8); font(c, 'Unb9', 40); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.fillText('ПИШИ В КОММЕНТЫ', 0, 0); c.fillStyle = C.pink; c.beginPath(); c.moveTo(-34, 40); c.lineTo(34, 40); c.lineTo(0, 84); c.fill(); c.restore(); }
  UI.watermark(c); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { sheet(c, t); Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  const r = drawWorld(c, t, L, cam, tag, sh), heads = r.heads, M = r.M, proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.22);
  const names = { emma: ['EMMA', '#E8A91C'] };
  if (L === 'hook') { coverBadge(c, t); K.titleRibbon(c, t, 540, 470); hudBar(c, t, L); Hq.grain(c, W, HH, t, 0.045); return; }
  const e = k => ev(L, k);
  if (L === 'A1') { if (t > e('turn') && t < e('waiter')) K.pop(c, t, 'ВСЁ КАФЕ СМОТРИТ', e('turn') + 0.1, e('waiter') - 0.1, 540, 1330, C.gold, -0.06, 64);
    if (t > e('paid') && t < SP.a1_e2.t - 0.1) K.pop(c, t, 'ТОРТ? ПЛАТИШЬ ТЫ', e('paid') + 0.05, SP.a1_e2.t - 0.2, 540, 1330, C.gold, -0.06, 62); }
  if (L === 'B1' && t > e('bin') && t < e('card') + 2.4) K.pop(c, t, 'РАСПИСКА — В МУСОР', e('bin') + 0.05, e('card') + 2.3, 540, 1360, C.gold, -0.06, 60);
  if (L === 'C1' && t > e('tag') && t < e('freeze') + 0.6) K.pop(c, t, '4900?!', e('tag') + 0.05, e('freeze') + 0.5, 540, 1330, C.gold, -0.06, 130);
  if (L === 'PAY' && t > ev('PAY', 'cnt') + 0.6 && t < SP.pay_e.t - 0.1) K.pop(c, t, 'ДОЛГ + ТОРТ', ev('PAY', 'cnt') + 0.6, SP.pay_e.t - 0.2, 540, 1330, C.gold, -0.06, 70);
  K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names, hold: { a1_h: 0.1, a1_e: 0.3, a1_e2: 0.3, b1_h: 0.2, b1_e: 0.1, b1_e2: 0.4, c1_h: 0.2, c1_e: 0.3, c1_h2: 0.15, pay_e: 0.4, pay_h: 0.6 } });
  phoneInsert(c, t); napkinInsert(c, t);
  UI.sparkles(c, t); Hq.grain(c, W, HH, t, 0.04); hudBar(c, t, L); lessonCard(c, t, L); UI.watermark(c);
}
E.run('debt', NF, renderFrame);
