// "Fifty-fifty?" (rubric «A1 vs C2», compact form) renderer, hard_cut camera: node halves.js start end out.mp4 | --png=f1,f2
// Candle-lit restaurant (orderforme layout), a table for two: her seated left (date dress) with a small salad, Mark seated right with an
// EMPTY giant lobster plate. The bill in a leather folder is the running gag: its receipt strip hangs over the table edge and grows
// (A2 + DESSERT, B1 + ½ TIP), the amount she owes changes on the BILL close-ups (full-screen insert on a solid backdrop, tag 'ui:bill').
// Reggie the waiter (silent) only brings the dessert in A2. Short level intros (0.6 s): a small level-colour circle that shrinks into the bar.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/halves/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C, LVCOL } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];

// ---------------- cast
const HER = { ...BASE.her_lift, necklace: true, top: { type: 'sweater', col: '#B0284F' }, bottom: { type: 'skirt', col: '#B0284F' }, shoes: { col: '#2B1A22', acc: null } };
const MARK = BASE.mark;
const WTR = { ...BASE.reggie, top: { type: 'longsleeve', col: '#FFFFFF' }, bottom: { type: 'trousers', col: '#1E1E24' } };
const SEAT = 330, TOP = -500;
const HX = -330, MX = 330, WX = -10, WS = 0.92, WY = -40;
const G = { her: geom(HER), date2: geom(MARK), waiter: geom(WTR) };
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function waistcoat(cc, g) { const sw = g.sw, y0 = g.ySh;
  paint(cc, q => { q.m(-sw * 0.92, y0 + 14); q.l(-sw * 0.3, y0 + 14); q.l(0, y0 + 260); q.l(sw * 0.3, y0 + 14); q.l(sw * 0.92, y0 + 14); q.l(sw * 0.84, y0 + 600); q.l(-sw * 0.84, y0 + 600); q.z(); }, '#1E1E24', { sd: 10, hd: 4, lw: 4 });
  cc.fillStyle = '#C9A13A'; for (const y of [y0 + 320, y0 + 410, y0 + 500]) { cc.beginPath(); cc.arc(0, y, 9, 0, TAU); cc.fill(); }
  cc.fillStyle = '#FFFFFF'; rr(cc, sw * 0.38, y0 + 120, 70, 16, 4); cc.fill();
  cc.fillStyle = '#1E1E24'; cc.beginPath(); cc.moveTo(0, y0 + 4); cc.lineTo(-62, y0 - 26); cc.lineTo(-62, y0 + 36); cc.closePath(); cc.fill(); cc.beginPath(); cc.moveTo(0, y0 + 4); cc.lineTo(62, y0 - 26); cc.lineTo(62, y0 + 36); cc.closePath(); cc.fill();
  cc.beginPath(); cc.arc(0, y0 + 4, 14, 0, TAU); cc.fill(); }

// ---------------- food + props (local coords: (0,0) = bottom centre)
function plateDraw(c, s = 1) { c.save(); c.scale(s, s); c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.ellipse(0, 6, 160, 30, 0, 0, TAU); c.fill(); c.fillStyle = '#F4F6FA'; c.beginPath(); c.ellipse(0, 0, 150, 28, 0, 0, TAU); c.fill(); c.strokeStyle = '#C9D0DA'; c.lineWidth = 4; c.stroke(); c.beginPath(); c.ellipse(0, -2, 96, 16, 0, 0, TAU); c.stroke(); c.restore(); }
function saladDraw(c, s = 1) { c.save(); c.scale(s, s);
  paint(c, q => { q.m(-110, -60); q.l(110, -60); q.q(100, 0, 0, 0); q.q(-100, 0, -110, -60); q.z(); }, '#F4F6FA', { sd: 6, hd: 3, lw: 4 });
  for (const [x, y, r, col] of [[-60, -70, 40, '#5FAE5C'], [-10, -86, 46, '#6DBE6A'], [44, -72, 40, '#4E9E4E'], [10, -62, 36, '#7CCB6E']]) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, Math.PI, TAU); c.fill(); }
  c.fillStyle = '#E0474C'; for (const [x, y] of [[-30, -96], [40, -90], [0, -74]]) { c.beginPath(); c.arc(x, y, 12, 0, TAU); c.fill(); }
  c.restore(); }
// the EMPTY giant lobster: cracked-open red shell, two big empty claws, fanned tail, lemon wedge, a nutcracker
function lobsterDraw(c, s = 1) { c.save(); c.scale(s, s);
  const R = '#D9472F', RD = '#A8311F', IN = '#F6E3D2';
  c.save(); c.translate(-10, -40); c.rotate(-0.08);
  for (let i = 0; i < 4; i++) { c.save(); c.translate(-120 - i * 34, 6 + i * 2); c.rotate(-0.15 * i); paint(c, q => q.e(0, 0, 26, 20), R, { sd: 4, hd: 2, lw: 3 }); c.restore(); }   // tail segments
  paint(c, q => { q.m(-250, -10); q.l(-300, -46); q.l(-296, 26); q.z(); }, R, { sd: 4, hd: 2, lw: 3 });   // tail fan
  paint(c, q => { q.m(-250, -10); q.l(-292, 4); q.l(-270, 40); q.z(); }, RD, { sd: 0, hd: 0, lw: 3 });
  paint(c, q => q.e(0, 0, 110, 46), R, { sd: 6, hd: 3, lw: 4 });   // carapace, split open
  c.fillStyle = IN; c.beginPath(); c.ellipse(4, -6, 86, 22, 0, 0, TAU); c.fill(); c.strokeStyle = RD; c.lineWidth = 4; c.beginPath(); c.moveTo(-80, -6); c.lineTo(88, -6); c.stroke();
  c.strokeStyle = RD; c.lineWidth = 5; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(-50 + k * 34, 36); c.lineTo(-70 + k * 34, 70); c.stroke(); }   // legs
  c.strokeStyle = R; c.lineWidth = 5; c.beginPath(); c.moveTo(100, -20); c.quadraticCurveTo(200, -140, 260, -110); c.stroke(); c.beginPath(); c.moveTo(104, -10); c.quadraticCurveTo(220, -90, 280, -40); c.stroke();   // antennae
  c.fillStyle = '#2B1A22'; c.beginPath(); c.arc(96, -24, 6, 0, TAU); c.fill(); c.beginPath(); c.arc(100, 2, 6, 0, TAU); c.fill();
  c.restore();
  for (const [x, y, r, f] of [[130, -96, -0.5, 1], [-60, -112, 0.35, -1]]) { c.save(); c.translate(x, y); c.rotate(r); c.scale(f, 1);   // claws, cracked open and empty
    paint(c, q => { q.m(-40, 0); q.q(-20, -60, 60, -56); q.q(110, -50, 120, -10); q.l(60, -18); q.q(30, -10, -40, 0); q.z(); }, R, { sd: 5, hd: 2, lw: 4 });
    paint(c, q => { q.m(-30, 4); q.q(30, 40, 110, 14); q.l(60, -4); q.q(20, 8, -30, 4); q.z(); }, RD, { sd: 3, hd: 1, lw: 4 });
    c.fillStyle = IN; c.beginPath(); c.ellipse(36, -24, 26, 10, -0.1, 0, TAU); c.fill(); c.restore(); }
  c.save(); c.translate(150, -24); paint(c, q => { q.m(-30, 0); q.q(0, -40, 30, 0); q.z(); }, '#F2D43B', { sd: 3, hd: 1, lw: 3 }); c.restore();   // lemon
  c.save(); c.translate(-150, -20); c.rotate(0.25); c.fillStyle = '#B8BEC8'; rr(c, -70, -6, 140, 12, 6); c.fill(); rr(c, -70, -24, 120, 10, 5); c.fill(); c.restore();   // nutcracker
  c.restore(); }
function dessertDraw(c, s = 1) { c.save(); c.scale(s, s);
  paint(c, q => { q.m(-70, -120); q.l(70, -120); q.q(60, -60, 12, -50); q.l(12, -14); q.l(50, 0); q.l(-50, 0); q.l(-12, -14); q.l(-12, -50); q.q(-60, -60, -70, -120); q.z(); }, 'rgba(225,240,250,.9)', { sd: 4, hd: 2, lw: 4 });
  for (const [x, y, r, col] of [[-36, -138, 40, '#F7B6CF'], [34, -140, 40, '#FFF4D6'], [0, -176, 42, '#8A5A3A']]) { paint(c, q => q.e(x, y, r, r * 0.9), col, { sd: 3, hd: 2, lw: 3 }); }
  c.fillStyle = '#FFFDF8'; c.beginPath(); c.ellipse(0, -214, 30, 16, 0, 0, TAU); c.fill();   // cream
  paint(c, q => q.e(4, -236, 16, 16), '#D61E3A', { sd: 2, hd: 1, lw: 3 }); c.strokeStyle = '#3A5A2A'; c.lineWidth = 4; c.beginPath(); c.moveTo(6, -250); c.quadraticCurveTo(16, -280, 30, -286); c.stroke();
  c.save(); c.translate(46, -190); c.rotate(0.4); c.fillStyle = '#E9B45E'; rr(c, -10, -60, 20, 70, 4); c.fill(); c.restore();   // wafer
  c.restore(); }
function candle(c, x, y, t) { c.fillStyle = '#C9A13A'; rr(c, x - 34, y - 14, 68, 16, 6); c.fill(); c.fillStyle = '#F7F2E8'; c.fillRect(x - 14, y - 150, 28, 138); const f = 1 + 0.12 * Math.sin(t * 17 + x);
  const gl = c.createRadialGradient(x, y - 170, 4, x, y - 170, 170); gl.addColorStop(0, 'rgba(255,210,120,.55)'); gl.addColorStop(1, 'rgba(255,210,120,0)'); c.fillStyle = gl; c.fillRect(x - 170, y - 340, 340, 340);
  paint(c, q => { q.m(x, y - 200 * f); q.q(x + 18, y - 166, x, y - 152); q.q(x - 18, y - 166, x, y - 200 * f); q.z(); }, '#F2A03B', { sd: 0, hd: 0, lw: 2 }); c.fillStyle = '#FFE7A0'; c.beginPath(); c.ellipse(x, y - 164, 6, 10, 0, 0, TAU); c.fill(); }
function purseDraw(c, x, y) { c.save(); c.translate(x, y); paint(c, q => { q.m(-70, 0); q.l(70, 0); q.l(62, -62); q.l(-62, -62); q.z(); }, '#EE5E9A', { sd: 5, hd: 2, lw: 4 }); paint(c, q => { q.m(-62, -62); q.l(62, -62); q.l(0, -26); q.z(); }, '#C23C76', { sd: 0, hd: 0, lw: 4 }); c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(0, -30, 9, 0, TAU); c.fill(); c.restore(); }
// open empty wallet facing the camera, centred at (0,0)
function walletDraw(c, s = 1) { c.save(); c.scale(s, s);
  paint(c, q => { q.m(-130, -70); q.l(0, -62); q.l(130, -70); q.l(126, 70); q.l(0, 62); q.l(-126, 70); q.z(); }, '#6A3A22', { sd: 5, hd: 3, lw: 4 });
  c.fillStyle = '#8A5A3A'; for (const sx of [-1, 1]) { rr(c, sx > 0 ? 14 : -116, -46, 102, 92, 8); c.fill(); }
  c.strokeStyle = '#5A2E18'; c.lineWidth = 3; for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(sx > 0 ? 22 : -108, -20 + k * 26); c.lineTo(sx > 0 ? 108 : -22, -20 + k * 26); c.stroke(); }
  c.fillStyle = '#4A2614'; c.fillRect(-3, -62, 6, 124); c.restore(); }
function mothDraw(c, x, y, t, s = 1.7) { const f = Math.abs(Math.sin(t * 26)); c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#B8AD98'; c.strokeStyle = '#6E6452'; c.lineWidth = 3;
  for (const sx of [-1, 1]) { c.beginPath(); c.ellipse(sx * 26, -6, 30, 18 * (0.35 + 0.65 * f), sx * 0.3, 0, TAU); c.fill(); c.stroke(); }
  c.fillStyle = '#7A6E5A'; c.beginPath(); c.ellipse(0, 0, 8, 20, 0, 0, TAU); c.fill(); c.strokeStyle = '#6E6452'; c.lineWidth = 2; c.beginPath(); c.moveTo(-3, -18); c.lineTo(-12, -34); c.moveTo(3, -18); c.lineTo(12, -34); c.stroke(); c.restore(); }
// Italian menu held open facing the camera, centred at (0,0)
function menuIt(c, s = 1) { c.save(); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -200 + 8, -150 + 12, 400, 300, 14); c.fill(); c.fillStyle = '#2F5A46'; rr(c, -200, -150, 400, 300, 14); c.fill();
  c.fillStyle = '#FFF8E8'; rr(c, -186, -138, 372, 276, 8); c.fill();
  c.fillStyle = '#3C8D4F'; c.fillRect(-186, -138, 124, 26); c.fillStyle = '#FFFFFF'; c.fillRect(-62, -138, 124, 26); c.fillStyle = '#D23B3B'; c.fillRect(62, -138, 124, 26);
  fitTxt(c, 'MENU', 0, -70, 54, '#2F5A46', 330); fitTxt(c, 'ITALIANO', 0, -14, 44, '#D23B3B', 330, 'Nun9');
  c.fillStyle = 'rgba(47,90,70,.45)'; for (let k = 0; k < 4; k++) c.fillRect(-120, 30 + k * 26, 240 - (k % 2) * 60, 8);
  c.restore(); }

// ---------------- the bill: state over time (cumulative), the folder on the table, the full-screen close-up
const BILL_DES = ev('A2', 'bill'), BILL_TIP = ev('B1', 'write');
function billX(t, L) { if (L === 'hook') return lerp(240, 40, eOut(clamp(t / 0.45))); if (L === 'C2' || L === 'outro') return lerp(40, 205, eIO(clamp((t - ev('C2', 'slide')) / 0.5))); return 40; }
const stripLen = t => 110 + 80 * eOut(clamp((t - BILL_DES) / 0.4)) + 70 * eOut(clamp((t - BILL_TIP) / 0.4));
function billFolder(c, x, t) { c.save(); c.translate(x, TOP - 4);
  const L = stripLen(t); c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(-30, 18, 76, L + 4);   // receipt strip hanging over the table edge (the running gag)
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(-36, 10); c.lineTo(36, 10); c.lineTo(36, 10 + L); for (let k = 0; k <= 6; k++) c.lineTo(36 - k * 12, 10 + L + (k % 2 ? 8 : 0)); c.lineTo(-36, 10); c.fill();
  c.fillStyle = 'rgba(60,60,70,.45)'; for (let y = 30; y < L; y += 22) c.fillRect(-26, y, 30 + ((y / 22) % 3) * 8, 5);
  paint(c, q => { q.m(-120, 0); q.l(120, 0); q.l(104, -40); q.l(-104, -40); q.z(); }, '#4A2A1A', { sd: 5, hd: 2, lw: 4 });   // leather folder
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(-70, -40); c.lineTo(70, -40); c.lineTo(66, -52); c.lineTo(-66, -52); c.fill();
  c.fillStyle = '#C9A13A'; c.fillRect(-60, -24, 120, 5); c.restore(); }
// full-screen BILL close-up: the receipt in the open leather folder
function billView(c, t) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, '#3A1620'); g.addColorStop(1, '#1E0B12'); c.fillStyle = g; c.fillRect(0, 0, W, HH); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'bill' });
  const L = sceneAt(t).id, st = CAM_AT(t), k0 = eBack(clamp((t - st) / 0.25), 1.6);
  c.save(); c.translate(540, 1010); c.rotate(-0.025); c.scale(lerp(0.9, 1, k0), lerp(0.9, 1, k0)); c.translate(-540, -1010);
  c.fillStyle = 'rgba(0,0,0,.35)'; rr(c, 175, 600, 760, 840, 30); c.fill(); c.fillStyle = '#4A2A1A'; rr(c, 160, 585, 760, 840, 30); c.fill(); c.strokeStyle = '#2E180E'; c.lineWidth = 6; c.stroke();
  c.strokeStyle = '#C9A13A'; c.lineWidth = 3; rr(c, 182, 607, 716, 796, 22); c.stroke();
  const px = 250, pw = 580, py = 620; c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(px, py); c.lineTo(px + pw, py); c.lineTo(px + pw, 1370); for (let i = 0; i <= 20; i++) c.lineTo(px + pw - i * pw / 20, 1370 + (i % 2 ? 14 : 0)); c.closePath(); c.fill();
  fitTxt(c, 'LA ROSA', 540, 690, 64, '#2E1219', 500); fitTxt(c, 'TABLE 7  ·  2 GUESTS', 540, 748, 30, '#7A6E68', 500, 'Nun9');
  const dash = y => { c.strokeStyle = '#9A928C'; c.lineWidth = 3; c.setLineDash([12, 10]); c.beginPath(); c.moveTo(px + 30, y); c.lineTo(px + pw - 30, y); c.stroke(); c.setLineDash([]); };
  dash(790);
  const row = (name, price, y, hi) => { if (hi > 0) { c.save(); c.globalAlpha = 0.85 * hi; c.fillStyle = '#FFE15A'; rr(c, px + 18, y - 32, pw - 36, 64, 12); c.fill(); c.restore(); }
    UI.textFit(c, 'Nun9', 46, name, 330); c.fillStyle = '#2B2F3A'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(name, px + 40, y); c.textAlign = 'right'; c.fillText(price, px + pw - 40, y); };
  const hiD = t >= BILL_DES ? 1 - clamp((t - BILL_DES - 0.9) / 0.4) : 0, hiT = t >= BILL_TIP ? 1 - clamp((t - BILL_TIP - 1.2) / 0.4) : 0;
  row('LOBSTER', '£48', 850, 0); row('SALAD', '£9', 920, 0);
  if (t >= BILL_DES) { const k = eBack(clamp((t - BILL_DES) / 0.3), 2.2); c.save(); c.translate(540, 990); c.scale(k, k); c.translate(-540, -990); row('DESSERT', '£12', 990, hiD); c.restore(); }
  // handwritten "+ ½ TIP £3.50" (B1): revealed left to right by Mark's pen
  if (t >= BILL_TIP) { const r = clamp((t - BILL_TIP) / 0.7), y = 1062; c.save(); c.beginPath(); c.rect(px, y - 50, 40 + (pw - 40) * r, 100); c.clip(); if (hiT > 0) { c.globalAlpha = 0.85 * hiT; c.fillStyle = '#FFE15A'; rr(c, px + 18, y - 34, pw - 36, 68, 12); c.fill(); c.globalAlpha = 1; }
    UI.font(c, 'Cav7', 64); c.fillStyle = '#C8102E'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText('+ ½ TIP', px + 40, y); c.textAlign = 'right'; c.fillText('£3.50', px + pw - 40, y); c.restore();
    if (r < 1) { const pxx = px + 40 + (pw - 80) * r; c.save(); c.translate(pxx, y + 10); c.rotate(0.55); c.fillStyle = '#2B2F3A'; rr(c, -9, -170, 18, 170, 6); c.fill(); c.fillStyle = '#C9A13A'; c.fillRect(-9, -150, 18, 14); c.fillStyle = '#C8C8C8'; c.beginPath(); c.moveTo(-9, 0); c.lineTo(9, 0); c.lineTo(0, 22); c.fill(); c.restore(); } }
  dash(1112);
  const tot = t >= BILL_DES ? '£69' : '£57'; c.save(); UI.font(c, 'Unb9', 50); c.fillStyle = '#2B2F3A'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText('TOTAL', px + 40, 1172); c.textAlign = 'right'; c.fillText(tot, px + pw - 40, 1172); c.restore();
  // what SHE owes (Mark's red handwriting): £28.50 -> £34.50 -> £38.00
  const pays = [[0, '£28.50'], [BILL_DES + 0.15, '£34.50'], [BILL_TIP + 0.8, '£38.00']]; let cur = 0; pays.forEach((p, i) => { if (t >= p[0]) cur = i; });
  const since = t - pays[cur][0], prev = cur > 0 ? pays[cur - 1][1] : null;
  c.save(); c.translate(540, 1290); c.rotate(-0.04); UI.font(c, 'Cav7', 70); c.fillStyle = '#C8102E'; c.textAlign = 'center'; c.textBaseline = 'middle';
  const lbl = 'YOU PAY:', lw = c.measureText(lbl).width + 40, val = pays[cur][1], vw = c.measureText(val).width, x0 = -(lw + vw) / 2;
  c.textAlign = 'left'; c.fillText(lbl, x0, 0);
  if (prev && since < 0.35) { c.fillText(prev, x0 + lw, 0); c.strokeStyle = '#C8102E'; c.lineWidth = 7; c.beginPath(); c.moveTo(x0 + lw - 6, 4); c.lineTo(x0 + lw + (vw + 12) * eOut(since / 0.3), 4); c.stroke(); }
  else { const kk = prev ? eBack(clamp((since - 0.35) / 0.25), 2.4) : 1; c.save(); c.translate(x0 + lw + vw / 2, 0); c.scale(kk, kk); c.textAlign = 'center'; c.fillText(val, 0, 0); c.restore();
    c.strokeStyle = '#C8102E'; c.lineWidth = 5; c.beginPath(); c.ellipse(x0 + lw + vw / 2, 2, vw / 2 + 26, 50, -0.04, 0, TAU * eOut(clamp((since - (prev ? 0.55 : 0.1)) / 0.4))); c.stroke(); }
  c.restore(); c.restore(); }

// ---------------- restaurant (prerendered, softly blurred) — same room as "He ordered for me"
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
  for (let i = 0; i < 26; i++) { const x = BX0 + 100 + i * 180, y = -2350 + Math.sin(i * 0.9) * 60; const g = c.createRadialGradient(x, y, 2, x, y, 60); g.addColorStop(0, 'rgba(255,220,140,.9)'); g.addColorStop(1, 'rgba(255,220,140,0)'); c.fillStyle = g; c.fillRect(x - 60, y - 60, 120, 120); }
  for (const [x, s] of [[-1700, 1], [1750, 1.1]]) { c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(x, -700, 300 * s, 110, 0, 0, TAU); c.fill(); c.fillRect(x - 12, -700, 24, 450); c.fillStyle = 'rgba(255,200,110,.5)'; c.beginPath(); c.arc(x, -770, 40, 0, TAU); c.fill(); }
  c.fillStyle = '#4A7A4A'; for (let i = 0; i < 7; i++) { c.beginPath(); c.ellipse(-2150 + i * 40, -1000 - i * 70, 70, 190, -0.6 + i * 0.2, 0, TAU); c.fill(); } c.fillStyle = '#8A5A3A'; rr(c, -2220, -420, 260, 230, 20); c.fill();
  c.fillStyle = '#5A3428'; c.fillRect(BX0, -200, BW, 1600); c.fillStyle = 'rgba(0,0,0,.12)'; for (let x = BX0; x < BX0 + BW; x += 240) c.fillRect(x, -200, 8, 1600);
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawRest);
function chair(c, x) { c.fillStyle = '#3A1A12'; rr(c, x - 160, -1080, 320, 600, 50); c.fill(); c.fillStyle = '#8A2F3A'; rr(c, x - 130, -1050, 260, 540, 40); c.fill(); c.fillStyle = 'rgba(255,255,255,.08)'; rr(c, x - 110, -1030, 90, 500, 30); c.fill(); }

// ---------------- table
const DES_AT = ev('A2', 'dessert');
function tableFront(c, t, L) {
  c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(-780, -20, 1560, 40);
  paint(c, q => { q.m(-720, TOP); q.l(720, TOP); q.l(750, -10); q.l(-750, -10); q.z(); }, '#FFFDF8', { sd: 6, hd: 3, lw: 4, inner: k => { k.strokeStyle = 'rgba(150,120,110,.22)'; k.lineWidth = 4; for (let x = -680; x < 720; x += 70) { k.beginPath(); k.moveTo(x, TOP + 30); k.quadraticCurveTo(x + 10, TOP + 260, x + 4, -20); k.stroke(); } } });
  c.fillStyle = '#B0284F'; c.fillRect(-470, TOP, 180, 400); c.fillRect(470 - 180, TOP, 180, 400); c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(-470, TOP + 360, 180, 40); c.fillRect(290, TOP + 360, 180, 40);
  paint(c, q => { q.m(-760, TOP - 40); q.l(760, TOP - 40); q.l(730, TOP + 12); q.l(-730, TOP + 12); q.z(); }, '#F4EAD8', { sd: 4, hd: 2, lw: 4 });
  candle(c, -40, TOP - 26, t);
  purseDraw(c, -150, TOP - 10);
  c.save(); c.translate(HX + 10, TOP - 30); plateDraw(c, 0.7); c.translate(0, -2); saladDraw(c, 0.62); c.restore();   // her small salad
  c.save(); c.translate(MX + 10, TOP - 28); plateDraw(c, 1.6); lobsterDraw(c, 1.0); c.restore();   // his EMPTY giant lobster
  if (t > DES_AT && L !== 'hook' && L !== 'A1') { const a = clamp((t - DES_AT) / 0.25); c.save(); c.translate(MX + 260, TOP - 24 - (1 - eOut(a)) * 40); plateDraw(c, 0.5); dessertDraw(c, 0.75); c.restore(); }
  billFolder(c, billX(t, L), t);
  K.mark(c, 'bill', billX(t, L), TOP - 30, 140); K.mark(c, 'lobster', MX, TOP - 100, 220); }

// ---------------- characters
const gest = (st, g, who, t, side, base) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20, { planar: true }); } };
const hang = (g, s) => reach(g, s, s * g.sw * 0.8, g.ySh + 330);
const onTable = (g, s) => reach(g, s, s * g.sw * 0.7, g.ySh + 335, { planar: true });
const toW = (g, s, x0, wx, wy, o = {}) => reach(g, s, wx - x0, wy - SEAT, o);
const seated = (g, t) => ({ t, mood: 'neutral', turn: 0, look: 0, legPose: 'sit', drop: SEAT, legs: false, armL: onTable(g, -1), armR: onTable(g, 1), items: {} });
const frac = (id, t) => (t - SP[id].t) / SP[id].d;
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { ...seated(g, t), talk: talk('her', t), mood: 'neutral', turn: 0.3, look: 0.7 };
  if (L === 'hook') { st.mood = 'shock'; st.blink = 0; st.look = 0.8; st.turn = 0.3; st.lookY = 0.2; if (t > hev('stun')) { st.lookY = 0; st.look = 0.9; } if (t > hev('back')) st.mood = 'annoyed'; }
  if (L === 'A1') { st.mood = 'annoyed'; if (speaking('a1_h', t, 0.05, 0.2)) { st.mood = 'shock'; const f = frac('a1_h', t);
      if (f < 0.55) st.armR = reach(g, 1, g.sw * 2.1, g.ySh + 60 + Math.sin(t * 10) * 14, { planar: true }); else st.armR = reach(g, 1, g.sw * 0.25, g.ySh + 150, { planar: true }); }
    if (t > e('point')) { st.mood = 'worried'; st.lookY = 0.4; st.look = 0.6; } if (t > e('wallet')) { st.mood = 'shock'; st.blink = 0; st.lookY = 0.5; st.look = 0.1; st.armL = toW(g, -1, HX, -190, TOP - 40, { planar: true }); } }
  if (L === 'A2') { st.mood = 'annoyed'; if (speaking('a2_h', t, 0.05, 0.2)) { st.mood = 'annoyed'; gest(st, g, 'her', t, 1, 160); } if (speaking('a2_m', t)) st.mood = 'skeptical';
    if (t > e('dessert') - 0.1) { st.mood = 'shock'; st.blink = 0; st.look = 1; st.lookY = 0.3; } }
  if (L === 'B1') { st.mood = 'happy'; if (speaking('b1_h', t, 0.05, 0.2)) { st.mood = 'happy'; gest(st, g, 'her', t, 1, 160); st.look = 0.4; } if (t > SP.b1_m.t + 0.4) { st.mood = 'shock'; st.blink = 0; st.look = 0.8; } }
  if (L === 'B2') { st.mood = 'annoyed'; if (speaking('b2_h', t, 0.05, 0.2)) { st.mood = 'annoyed'; st.armR = reach(g, 1, g.sw * 2.0, g.ySh + 120, { planar: true }); } if (t > SP.b2_m.t + 0.3) { st.mood = 'skeptical'; st.look = 0.9; } }
  if (L === 'C1') { st.mood = 'neutral'; if (speaking('c1_h', t, 0.05, 0.2)) { st.mood = 'happy'; gest(st, g, 'her', t, 1, 160); st.look = 0.5; } if (t > e('nod')) { st.mood = 'happy'; st.look = 0.8; } }
  if (L === 'C2') { st.mood = 'smug'; st.turn = 0.2; st.look = 0.5;
    if (speaking('c2_h', t, 0.05, 0.1)) { st.talk = talk('her', t); gest(st, g, 'her', t, 1, 140); }
    const a = e('slide'); if (t > a - 0.25 && t < a + 0.75) { const k = eIO(clamp((t - a + 0.25) / 0.75)); st.mood = 'smug'; st.blink = 1; st.armR = toW(g, 1, HX, billX(t, L) - 120, TOP - 40, { planar: true }); }
    if (t > a + 0.75) { st.mood = 'happy'; st.blink = 0; st.look = 0.9; st.lookY = 0; }
    if (t > e('wallet') + 0.3) { st.mood = 'happy'; st.laugh = false; st.look = 0.9; } }
  return st; }
function markState(t, L) { const g = G.date2, e = k => ev(L, k), st = { ...seated(g, t), talk: talk('date2', t), mood: 'smug', turn: -0.3, look: -0.7 };
  if (L === 'hook') { st.mood = 'happy'; st.look = -0.8; const bx = billX(t, L); if (t < 1.1) st.armL = toW(g, -1, MX, bx + 100, TOP - 40, { planar: true }); if (t > hev('stun')) { st.mood = 'smug'; st.blink = 1; } }
  if (L === 'A1') { st.mood = 'smug'; if (speaking('a1_h', t, 0.05, 0.2)) { st.mood = 'surprised'; st.look = -0.9; }
    if (speaking('a1_m', t, 0.05, 0.1)) { st.mood = 'happy'; st.headY = frac('a1_m', t) < 0.25 ? Math.abs(Math.sin((t - SP.a1_m.t) * 9)) * 18 : 0; }
    if (t > e('point') - 0.1 && t < e('wallet') - 0.1) { st.mood = 'happy'; st.look = -0.2; st.lookY = 0.4; st.armL = toW(g, -1, MX, MX - 70, TOP - 170, { planar: true }); }
    if (t >= e('wallet') - 0.1) { st.mood = 'happy'; st.blink = t > endOf('a1_m') ? 1 : 0; st.look = -0.9; st.lookY = 0.3; st.armL = toW(g, -1, MX, -150, TOP - 90, { planar: true }); } }
  if (L === 'A2') { st.mood = 'smug'; if (speaking('a2_h', t, 0.05, 0.2)) { st.mood = 'surprised'; }
    if (speaking('a2_m', t, 0.05, 0.1)) { st.mood = 'neutral'; st.lookY = -0.3; if (t > e('waiter') - 0.3) { st.mood = 'happy'; st.look = 0.6; st.turn = 0.1; st.armR = reach(g, 1, g.sw * 1.5, g.ySh - 230 + Math.sin(t * 8) * 12, { planar: true }); } }
    if (t > e('dessert')) { st.mood = 'happy'; st.blink = 1; st.look = 0.3; st.lookY = 0.4; st.armR = toW(g, 1, MX, MX + 200, TOP - 140, { planar: true }); st.items = { R: spoonItem }; } }
  if (L === 'B1') { st.mood = 'neutral'; if (speaking('b1_h', t, 0.05, 0.2)) st.mood = 'surprised'; if (speaking('b1_m', t, 0.05, 0.2)) { st.mood = 'happy'; st.blink = frac('b1_m', t) > 0.4 ? 1 : 0; } if (t > endOf('b1_m') + 0.2) { st.mood = 'smug'; } }
  if (L === 'B2') { st.mood = 'neutral'; if (speaking('b2_h', t, 0.05, 0.2)) st.mood = 'surprised';
    if (t > e('menu')) { st.mood = 'worried'; st.blink = 0; st.look = Math.sin((t - e('menu')) * 3) * 0.6 - 0.2; st.lookY = 0.3; st.armL = reach(g, -1, -150, g.ySh + 250, { planar: true }); st.armR = reach(g, 1, 150, g.ySh + 250, { planar: true }); } }
  if (L === 'C1') { st.mood = 'neutral'; if (speaking('c1_h', t, 0.05, 0.2)) { st.mood = 'worried'; st.look = -0.8; }
    if (t > e('nod')) { const u = t - e('nod'); st.mood = 'sad'; st.blink = 0; st.look = -0.5; st.lookY = 0.4; st.headY = u < 0.9 ? Math.abs(Math.sin(u * 7)) * 30 : 22; st.armL = hang(g, -1); st.armR = hang(g, 1); } }
  if (L === 'C2') { st.mood = 'smug'; if (speaking('c2_h', t, 0.05, 0.1)) { st.mood = frac('c2_h', t) < 0.35 ? 'happy' : frac('c2_h', t) < 0.7 ? 'surprised' : 'worried'; st.look = -0.9; }
    if (t > endOf('c2_h') + 0.1) { st.mood = 'shock'; st.blink = 0; st.look = -0.6; st.lookY = 0.4; }
    if (t > e('slide') + 0.5) { st.mood = 'shock'; st.look = 0; st.lookY = 0.6; }
    if (t > SP.c2_m.t - 0.15) { st.mood = 'sad'; st.look = -0.6; st.lookY = 0; st.talk *= 0.7; st.armL = reach(g, -1, -130, g.ySh + 230, { planar: true }); st.armR = reach(g, 1, 130, g.ySh + 230, { planar: true }); } }
  return st; }
const spoonItem = ctx => { ctx.save(); ctx.rotate(0.3); ctx.strokeStyle = '#C9CED6'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -110); ctx.stroke(); ctx.fillStyle = '#C9CED6'; ctx.beginPath(); ctx.ellipse(0, -126, 14, 20, 0, 0, TAU); ctx.fill(); ctx.restore(); };
function wtrX(t, L) { if (L !== 'A2') return 1e5; const a = ev('A2', 'waiter'), b = ev('A2', 'dessert') - 0.35, lv = ev('A2', 'a2_nar') + 0.6;
  if (t < b) return lerp(1700, WX, eOut(clamp((t - a) / Math.max(0.4, b - a)))); return t < lv ? WX : lerp(WX, 1700, eIn(clamp((t - lv) / 0.9))); }
const wtrHere = (t, L) => L === 'A2' && t > ev('A2', 'waiter') && wtrX(t, L) < 1650;
function wtrState(t, L) { const g = G.waiter, st = { t, talk: 0, mood: 'happy', turn: -0.1, look: 0.4, lookY: 0.1, armL: hang(g, -1), armR: hang(g, 1), items: {}, afterTorso: cc => waistcoat(cc, g) };
  const walking = Math.abs(wtrX(t + 0.05, L) - wtrX(t, L)) > 1; if (walking) { st.legPose = 'walk'; st.turn = 0.5; st.look = -0.9; }
  if (t < ev('A2', 'dessert')) { st.armR = reach(g, 1, g.sw * 1.3, g.ySh + 120, { planar: true }); st.items = { R: ctx => { ctx.save(); ctx.translate(0, -10); plateDraw(ctx, 0.45); dessertDraw(ctx, 0.62); ctx.restore(); } }; }
  else { st.mood = 'happy'; st.blink = 1; st.look = 0.6; }
  return st; }

// ---------------- the world + which characters a shot draws (clean singles: only the tagged character)
const DRAW = { wide: ['her', 'date2', 'waiter'], card: ['her', 'date2', 'waiter'], two: ['her', 'date2', 'waiter'], cover: ['her', 'date2'], her: ['her'], date2: ['date2'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
const WAL = () => ({ x: MX + 5, y: SEAT + G.date2.ySh + 230 });
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGR, BX0, BY0, BW, BH);
  if (who.includes('waiter') && wtrHere(t, L)) heads.waiter = K.put(c, WTR, wtrState(t, L), wtrX(t, L), WY, WS);
  chair(c, HX); chair(c, MX);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), HX, 0);
  if (who.includes('date2')) heads.date2 = K.put(c, MARK, markState(t, L), MX, 0);
  tableFront(c, t, L);
  if (who.includes('date2') && L === 'B2' && t > ev('B2', 'menu')) { const k = eBack(clamp((t - ev('B2', 'menu')) / 0.25), 1.8); c.save(); c.translate(MX + 5, SEAT + G.date2.ySh + 240); c.rotate(0.04 * Math.sin(t * 3)); c.scale(0.85 * k, 0.85 * k); menuIt(c); c.restore(); }
  if (who.includes('date2') && L === 'C2' && t > SP.c2_m.t - 0.15) { const w = WAL(); c.save(); c.translate(w.x, w.y); walletDraw(c, 0.95); c.restore();
    const a = ev('C2', 'wallet'); if (t > a && t < a + 3.5) { const u = t - a; mothDraw(c, w.x - 120 * u + 50 * Math.sin(u * 7), w.y - 40 - 200 * Math.min(u, 1.6) + 30 * Math.sin(u * 11), t); } }
  if (!heads.date2) heads.date2 = OFF; if (!heads.waiter) heads.waiter = OFF; if (!heads.her) heads.her = OFFL;
  return heads; }

// ---------------- shots (world coordinates; face of a single at ~900 px)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const hHY = G.her.headY + SEAT, mHY = G.date2.headY + SEAT, wHY = WY + G.waiter.headY * WS;
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(20, fy(hHY, 0.8, 1210), 0.8, 'cover'), WIDE: S(0, fy(wHY, 0.56, 760), 0.56, 'wide'), CARD: S(0, fy(hHY, 0.6, 1060), 0.6, 'card'), TWO: S(0, fy(hHY, 0.74, 1000), 0.74, 'two'),
  HER: S(HX + 20, fy(hHY, 1.0), 1.0, 'her'), HER_CU: S(HX + 20, fy(hHY, 1.3, 960), 1.3, 'her'),
  MARK: S(MX - 20, fy(mHY, 1.0), 1.0, 'date2'), MARK_CU: S(MX - 20, fy(mHY, 1.25, 860), 1.25, 'date2'),
  BILL: U('bill', 1) };
const C2Z = [1.0, 1.18, 1.36].map(z => S(HX + 20, fy(hHY, z, 900), z, 'her'));
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  const sp = id => speaking(id, t, 0.1, 0.15);
  if (L === 'hook') { if (t < 2.5) return SH.COVER; if (t < hev('bill') - 0.05) return f(SH.HER_CU); if (t < hev('back')) return f(SH.BILL); return f(SH.TWO); }
  const u = t - sc.s, l = L.toLowerCase(), nar = SP[l + '_nar'];
  if (u < 0.6) return f(SH.WIDE);
  if (nar && t >= nar.t - 0.1) return f(SH.CARD);
  if (L === 'A1' && t > e('point') - 0.2) return f(SH.TWO);
  if (L === 'A2' && t > e('bill') - 0.05) return f(SH.BILL);
  if (L === 'A2' && t > e('waiter') - 0.1) return f(SH.WIDE);
  if (L === 'B1' && t > e('bill') - 0.05) return f(SH.BILL);
  if (L === 'C1' && t > e('nod') - 0.1) return f(SH.TWO);
  if (L === 'C2') { if (sp('c2_h')) { const ch = (TL.cfg.chunks || {}).c2_h, p = SP.c2_h, w = p.words || [], cnt = ch.map(([en]) => en.trim().split(/\s+/).length), tot = cnt.reduce((a, b) => a + b, 0); let wi = 0, i = 0;
      ch.forEach((q, k) => { const a = w.length === tot ? p.t + w[wi][1] : p.t + p.d * k / ch.length; if (t >= a - 0.05) i = k; wi += cnt[k]; }); return f(C2Z[i] || SH.HER); }
    if (t < SP.c2_m.t - 0.1) return f(SH.WIDE);
    if (sp('c2_m')) return f(SH.MARK_CU);
    return f(SH.TWO); }
  const cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.1 && t < s.t + s.d + 0.25);
  const single = who => who === 'her' ? SH.HER : SH.MARK;
  if (cur) return f(single(cur.who));
  const next = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.6 && t < s.t);
  if (next) return f(single(next.who));
  return SH.TWO; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
// start time of the shot that is on screen at t (for the insert's pop-in)
function CAM_AT(t) { let fr = Math.min(CAM.length - 1, Math.round(t * FPS)); const tag = CAM[fr].tag; while (fr > 0 && CAM[fr - 1].tag === tag) fr--; return fr / FPS; }
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- overlays
// title overlay (hook, frame 0 .. 2.5 s): on screen from the first frame (no slide-in), fades out
function title(c, t) { const lines = TL.cfg.hook_title, a = 1 - clamp((t - 2.3) / 0.2); if (a <= 0) return; const rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 450); c.rotate(-0.05); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -175 + 14, 980, 350, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -175, 980, 350, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 74, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -112);
  UI.textFit(c, 'Unb9', 150, lines[1][0], 900); UI.strokeText(c, lines[1][0], 0, 4, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 66, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 122); c.restore();
  if (global.__QA) global.__QA.ui(c, 'title', { x: 50, y: 275, w: 980, h: 350, k: a, id: 'title' }); }
// short level intro (0.6 s): the level-colour circle left by levelIntroNext shrinks into the level pill, with the level name
function miniIntro(c, t, sc) { const u = t - sc.s; if (u > 0.5 || u < 0) return; const L = sc.id, i = UI.LV.indexOf(L); if (i < 0) return;
  const pw = 128, gap = 14, x0 = (W - (6 * pw + 5 * gap)) / 2, px = x0 + i * (pw + gap) + pw / 2, py = 253;
  const k = eIO(P(u, 0.05, 0.45)), cx = lerp(540, px, k), cy = lerp(960, py, k), R = lerp(330, 34, k);
  c.save(); c.globalAlpha = 1 - P(u, 0.4, 0.5); c.fillStyle = LVCOL[L]; c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 8; c.stroke();
  c.translate(cx, cy); const s = lerp(1, 0.2, k); c.scale(s, s); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.font(c, 'Unb9', 230); UI.strokeText(c, L, 0, 10, C.white, C.oliveD, 18); c.restore(); }
function hud(c, t, sc) { UI.card(c, t, sc); UI.captions(c, t); UI.sparkles(c, t); Hq.grain(c, W, HH, t, 0.04); UI.levelBar(c, t, sc, 1); UI.watermark(c); miniIntro(c, t, sc); UI.levelIntroNext(c, t); }
// rule: when the camera cuts away from a speaker whose line is over, the bubble is not carried onto the next shot
function liveHeads(heads, proj, t) { const out = { ...heads };
  for (const who of Object.keys(out)) { const q = proj(out[who]); if (q.x >= 0 && q.x <= W) continue; const live = TL.speech.some(s => s.who === who && t >= s.t - 0.1 && t < s.t + s.d); if (!live) delete out[who]; }
  return out; }
const names = { date2: ['MARK', '#2F3E5C'] };
const HOLD = { hook_m: 0.05, a1_h: 0.05, a1_m: 0.05, a2_h: 0.05, a2_m: 0.05, b1_h: 0.05, b1_m: 0.05, b2_h: 0.05, b2_m: 0.05, c1_h: 0.05, c1_m: 0.05, c2_h: 0.05, c2_m: 0.1 };
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { const rows = [['A1', 'No! Lobster you! Salad me!'], ['A2', 'Why should I pay for your lobster?'], ['B2', "Let's go Dutch."], ['C1', "Let's each pay for what we had."]];
    K.outro(c, t, { q: ['КТО ПЛАТИТ НА ПЕРВОМ', 'СВИДАНИИ?'], qSize: 50, rows, cta: ['ОТПРАВЬ ПОДРУГЕ', 'ПЕРЕД СВИДАНИЕМ'], heroX: 95, heroS: 0.34, heroY: [2350, 1985], ctaFit: true,
      hero: (cc, tt) => { const g = G.her, gd = G.date2;
        K.put(cc, MARK, { t: tt, mood: 'sad', turn: -0.2, look: -0.4, talk: 0, armL: reach(gd, -1, -130, gd.ySh + 230, { planar: true }), armR: reach(gd, 1, 130, gd.ySh + 230, { planar: true }) }, 640, 60);
        cc.save(); cc.translate(645, 60 + gd.ySh + 230); walletDraw(cc, 0.95); cc.restore(); mothDraw(cc, 600 + 70 * Math.sin(tt * 2), 60 + gd.headY - gd.hh * 1.9 + 30 * Math.sin(tt * 3.1), tt);
        K.put(cc, HER, { t: tt, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(tt * 8) * 30, { planar: true }), armR: reach(g, 1, g.sw * 1.4, g.ySh + 150, { planar: true }) }, 0, 0); } });
    const u = t - SC.outro.s, kk = P(u, 1.35, 1.7); if (kk > 0) { const bh = 140 + rows.length * 115, y = 740 - bh / 2 + 150; UI.textFit(c, 'Nun9', 46, rows[0][1], 740); const wd = c.measureText(rows[0][1]).width;
      c.save(); c.globalAlpha = 0.55 * kk; c.fillStyle = C.white; c.fillRect(214, y - 34, wd + 16, 68); c.restore(); c.strokeStyle = C.red; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(212, y + 2); c.lineTo(212 + (wd + 16) * eOut(kk), y + 2); c.stroke(); }
    Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag.startsWith('ui:')) { billView(c, t); heads = { her: OFFL, date2: OFF, waiter: OFF }; proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26); }
  heads = liveHeads(heads, proj, t);
  if (L === 'hook') { title(c, t);
    K.bubbles(c, t, { id: 'hook' }, heads, proj, { cleanChunks: true, names, hold: HOLD }); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); UI.captions(c, t);
    Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names, hold: HOLD });
  hud(c, t, sc);
}
E.run('halves', NF, renderFrame);
