// "Bazaar: «For you — special price»" (rubric «A1 vs C2», compact form, as taxi/halves) renderer, hard_cut camera: node bazaar.js start end out.mp4 | --png=f1,f2
// A sunny seaside market: the sea and the sun behind, a scarf stall with a striped awning; her on the promenade (left), Callum the seller
// behind the counter (right). He holds the red scarf with the price tag — the running prop: €80 (hook, A1, A2 + TOP QUALITY sticker),
// €70 after "Seventy" (B1), €25 + FREE BRACELET (C1), €20 when he runs after her (C2).
// Gags: A1 he hands her a plastic bag; B1 crocodile tears; B2 he tugs the scarf to show it's strong; C1 she turns to go -> "Wait!" + bracelet;
// C2 she walks away (silent beat), he runs after her: "Twenty! Twenty!". Insert: the TAG close-up on a solid backdrop.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/bazaar/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C, LVCOL } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];

// ---------------- cast
const HER = { ...BASE.her_market, top: { type: 'tee', col: '#FF8C82' }, bottom: { type: 'shorts', col: '#6F93C8' } };
const SELLER = { ...BASE.del, h: 1640, seed: 52, hair: { style: 'short', col: '#3A2A20' }, mustache: undefined, stubble: '#3A2A20', bigNose: false, build: { shoulder: 1.1, hip: 1.05, belly: 0.45, arm: 1.1 },
  cap: { col: '#F2C14E' }, top: { type: 'polo', col: '#2FA4A9', col2: '#FFFDF8' }, bottom: { type: 'trousers', col: '#E9E2C8' } };
const HX = -330, DX = 520;
const G = { her: geom(HER), seller: geom(SELLER) };
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- the price tag: value over time
const QUAL = ev('A2', 'qual'), F70 = ev('B1', 'flip'), F25 = ev('C1', 'flip'), F20 = ev('C2', 'flip');
function price(t) { if (t >= F20) return 20; if (t >= F25) return 25; if (t >= F70) return 70; return 80; }
const prevPrice = { 70: 80, 25: 70, 20: 25 };
const lastChange = t => t >= F20 ? F20 : t >= F25 ? F25 : t >= F70 ? F70 : -9;
// small tag hanging on a string (local origin = top of the string)
function tagSmall(c, t, sc = 1, sw = 0) { c.save(); c.scale(sc, sc); c.rotate(sw);
  c.strokeStyle = '#7A5A3A'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 46); c.stroke();
  c.save(); c.translate(0, 46); c.rotate(0.06); c.fillStyle = 'rgba(0,0,0,.18)'; rr(c, -64, 6, 136, 94, 14); c.fill();
  c.fillStyle = '#F6E7C4'; c.beginPath(); c.moveTo(-28, 0); c.lineTo(28, 0); c.lineTo(66, 26); c.lineTo(66, 96); c.lineTo(-66, 96); c.lineTo(-66, 26); c.closePath(); c.fill(); c.strokeStyle = '#9C7A4A'; c.lineWidth = 4; c.stroke();
  c.fillStyle = '#9C7A4A'; c.beginPath(); c.arc(0, 14, 7, 0, TAU); c.fill();
  const v = price(t), u = t - lastChange(t), sy = u >= 0 && u < 0.14 ? Math.max(0.1, u / 0.14) : 1;
  c.save(); c.translate(0, 60); c.scale(1, sy); fitTxt(c, '€' + v, 0, 0, 50, '#D7263D', 120); c.restore();
  if (t >= QUAL && t < F70) { c.fillStyle = C.gold; c.beginPath(); c.arc(54, 30, 18, 0, TAU); c.fill(); c.strokeStyle = '#B8862A'; c.lineWidth = 3; c.stroke(); }
  c.restore(); c.restore(); }
// the red scarf hanging from his hand (item drawn under the hand; ctx at the wrist, character-local units)
function scarfHang(c, t, len = 230) { const sw = Math.sin(t * 2.2) * 0.05;
  c.save(); c.rotate(sw); c.scale(1.25, 1.25);
  paint(c, q => { q.m(-46, -10); q.l(46, -10); q.q(56, len * 0.5, 40, len); q.l(-40, len); q.q(-56, len * 0.5, -46, -10); q.z(); }, '#D7263D', { sd: 8, hd: 4, lw: 4 });
  c.fillStyle = '#F2C14E'; for (let y = 20; y < len - 20; y += 46) { c.fillRect(-42, y, 84, 8); }
  c.strokeStyle = '#F2C14E'; c.lineWidth = 5; for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(k * 12, len); c.lineTo(k * 13, len + 34); c.stroke(); }
  c.translate(30, len - 30); tagSmall(c, t, 1, -sw * 2); c.restore(); }
// the scarf stretched between his two hands (B2 tug): (dx, dy) = right hand relative to the left one
function scarfTaut(c, t, dx, dy) { const L = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
  c.save(); c.rotate(a);
  paint(c, q => { q.m(0, -36); q.q(L * 0.5, -26, L, -36); q.l(L, 36); q.q(L * 0.5, 26, 0, 36); q.z(); }, '#D7263D', { sd: 8, hd: 4, lw: 4 });
  c.fillStyle = '#F2C14E'; for (let x = 24; x < L - 20; x += 46) c.fillRect(x, -32, 8, 64);
  c.strokeStyle = C.white; c.lineWidth = 6; c.lineCap = 'round'; const j = Math.abs(Math.sin(t * 14));
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(L * 0.5 - 60, s * (70 + j * 14)); c.lineTo(L * 0.5 + 60, s * (70 + j * 14)); c.stroke(); }
  c.translate(L * 0.5, 30); tagSmall(c, t, 1, Math.sin(t * 9) * 0.25); c.restore(); }
const scarfItem = t => ({ under: c => scarfHang(c, t) });
const bagItem = { over: c => { c.save(); c.translate(0, 18);
  c.strokeStyle = 'rgba(200,205,210,.95)'; c.lineWidth = 9; c.beginPath(); c.arc(-24, 10, 26, Math.PI, TAU); c.stroke(); c.beginPath(); c.arc(24, 10, 26, Math.PI, TAU); c.stroke();
  c.fillStyle = 'rgba(245,247,250,.92)'; c.beginPath(); c.moveTo(-80, 10); c.lineTo(80, 10); c.lineTo(96, 250); c.quadraticCurveTo(0, 270, -96, 250); c.closePath(); c.fill(); c.strokeStyle = '#B7BDC6'; c.lineWidth = 4; c.stroke();
  c.strokeStyle = 'rgba(160,168,180,.6)'; c.lineWidth = 3; c.beginPath(); c.moveTo(-40, 40); c.lineTo(-50, 230); c.moveTo(36, 60); c.lineTo(52, 226); c.stroke();
  fitTxt(c, 'THANK', 0, 120, 34, '#D7263D', 140); fitTxt(c, 'YOU', 0, 160, 34, '#D7263D', 140); c.restore(); } };
const braceletItem = { over: c => { c.save(); c.translate(0, -30); for (let k = 0; k < 14; k++) { const a = k / 14 * TAU; c.fillStyle = ['#2FA4A9', '#F2C14E', '#EE5E9A'][k % 3]; c.beginPath(); c.arc(Math.cos(a) * 44, Math.sin(a) * 44, 12, 0, TAU); c.fill(); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 2; c.stroke(); } c.restore(); } };
const noteItem = { over: c => { c.save(); c.rotate(-0.25); c.translate(0, -40); c.fillStyle = '#7FB77E'; rr(c, -70, -40, 140, 80, 8); c.fill(); c.strokeStyle = '#3E6B3D'; c.lineWidth = 4; c.stroke(); fitTxt(c, '€20', 0, 2, 40, '#22401F', 120); c.restore(); } };

// ---------------- TAG close-up (insert on a solid backdrop)
function tagView(c, t) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, '#FFD98A'); g.addColorStop(1, '#F29E5C'); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'tag' });
  c.save(); c.globalAlpha = 0.18; c.fillStyle = C.white; for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(140 + i * 110, 300 + (i % 3) * 520, 46 + (i % 4) * 12, 0, TAU); c.fill(); } c.restore();
  const st = CAM_AT(t), k0 = eBack(clamp((t - st) / 0.25), 1.6), v = price(t), lc = lastChange(t), u = t - lc;
  // the red scarf across the top of the frame, the tag hangs from it
  c.save(); c.translate(540, 340); c.rotate(-0.04);
  paint(c, q => { q.m(-700, -110); q.q(0, -60, 700, -110); q.l(700, 90); q.q(0, 140, -700, 90); q.z(); }, '#D7263D', { sd: 12, hd: 6, lw: 6 });
  c.fillStyle = '#F2C14E'; for (let x = -640; x < 700; x += 90) c.fillRect(x, -96, 16, 200); c.restore();
  const sw = Math.sin(t * 2.4) * 0.03;
  c.save(); c.translate(540, 420); c.rotate(sw); c.scale(lerp(0.9, 1, k0), lerp(0.9, 1, k0));
  c.strokeStyle = '#7A5A3A'; c.lineWidth = 10; c.beginPath(); c.moveTo(0, -40); c.lineTo(0, 120); c.stroke();
  c.translate(0, 120); c.rotate(0.05);
  c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -300, 40, 640, 690, 50); c.fill();
  c.fillStyle = '#F6E7C4'; c.beginPath(); c.moveTo(-130, 0); c.lineTo(130, 0); c.lineTo(310, 130); c.lineTo(310, 700); c.lineTo(-310, 700); c.lineTo(-310, 130); c.closePath(); c.fill(); c.strokeStyle = '#9C7A4A'; c.lineWidth = 10; c.stroke();
  c.fillStyle = '#9C7A4A'; c.beginPath(); c.arc(0, 70, 28, 0, TAU); c.fill(); c.fillStyle = '#E9D3A8'; c.beginPath(); c.arc(0, 70, 14, 0, TAU); c.fill();
  fitTxt(c, 'PRICE', 0, 175, 50, '#9C7A4A', 400);
  const old = prevPrice[v];
  if (old && t >= lc) { const sk = eOut(P(u, 0.3, 0.6)); fitTxt(c, '€' + old, 0, 290, 110, '#9A8A6A', 400); if (sk > 0) { c.strokeStyle = '#D7263D'; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(-140, 300); c.lineTo(-140 + 280 * sk, 280); c.stroke(); } }
  const sy = u >= 0 && u < 0.16 ? Math.max(0.1, u / 0.16) : 1, pk = u >= 0 && u < 0.5 ? 1 + 0.08 * Math.sin(u / 0.5 * Math.PI) : 1;
  c.save(); c.translate(0, old ? 500 : 430); c.scale(pk, sy * pk); fitTxt(c, '€' + v, 0, 0, old ? 230 : 270, '#D7263D', 560); c.restore();
  if (!old) fitTxt(c, 'SPECIAL PRICE', 0, 640, 46, '#5A4632', 520);
  c.restore();
  // A2: TOP QUALITY rosette slapped on the tag
  if (t >= QUAL && t < F70) { const q = eBack(P(t, QUAL + 0.1, QUAL + 0.35), 2.6); if (q > 0) { c.save(); c.translate(810, 1130); c.rotate(0.22); c.scale(q, q);
    c.fillStyle = '#C8102E'; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 30, 60); c.lineTo(s * 80, 230); c.lineTo(s * 40, 200); c.lineTo(s * 10, 240); c.closePath(); c.fill(); }
    c.fillStyle = C.gold; c.beginPath(); for (let k = 0; k < 24; k++) { const a = k / 24 * TAU, r = k % 2 ? 150 : 172; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); c.strokeStyle = '#B8862A'; c.lineWidth = 8; c.stroke();
    c.fillStyle = '#FFE8A0'; c.beginPath(); c.arc(0, 0, 118, 0, TAU); c.fill(); fitTxt(c, 'TOP', 0, -34, 64, '#8A5A10', 200); fitTxt(c, 'QUALITY', 0, 36, 44, '#8A5A10', 210); c.restore(); } }
  // C1: + FREE BRACELET
  if (v === 25) { const q = eBack(P(u, 0.55, 0.85), 2.2); if (q > 0) { c.save(); c.translate(540, 1300); c.rotate(-0.03); c.scale(q, q); c.fillStyle = 'rgba(0,0,0,.18)'; rr(c, -330, -64, 680, 140, 40); c.fill();
    c.fillStyle = C.green; rr(c, -340, -76, 680, 140, 40); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke();
    c.save(); c.translate(-250, -6); c.scale(0.7, 0.7); braceletItem.over(c); c.restore(); fitTxt(c, '+ FREE BRACELET', 50, -4, 54, C.white, 470); c.restore(); } }
}

// ---------------- the seaside market (prerendered, softly blurred)
const BX0 = -3200, BY0 = -4300, BW = 6400, BH = 6200, BS = 0.5, HOR = -1250;
function awning(c, x0, x1, y, cols, sc = 1) { const n = Math.max(4, Math.round((x1 - x0) / (110 * sc))), w = (x1 - x0) / n;
  for (let i = 0; i < n; i++) { c.fillStyle = cols[i % 2]; c.beginPath(); c.moveTo(x0 + i * w, y); c.lineTo(x0 + (i + 1) * w, y); c.lineTo(x0 + (i + 1) * w, y + 150 * sc); c.quadraticCurveTo(x0 + (i + 0.5) * w, y + 210 * sc, x0 + i * w, y + 150 * sc); c.closePath(); c.fill(); }
  c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(x0, y, x1 - x0, 14 * sc); }
function farStall(c, x, s, cols, sign) { c.save(); c.translate(x, -40); c.scale(s, s);
  c.fillStyle = '#8A6A4A'; c.fillRect(-330, -1900, 24, 1900); c.fillRect(306, -1900, 24, 1900);
  awning(c, -360, 360, -2000, cols); c.fillStyle = '#C98B5A'; c.fillRect(-340, -820, 680, 820); c.fillStyle = '#9C6238'; c.fillRect(-340, -820, 680, 40);
  for (let i = 0; i < 6; i++) { c.fillStyle = ['#7FB7E0', '#F2C14E', '#EE5E9A', '#7CC48A', '#B48AD6', '#F08A5D'][(i + Math.round(x)) % 6]; c.fillRect(-300 + i * 100, -1820, 60, 360 + (i % 3) * 60); }
  if (sign) { c.fillStyle = '#FFFDF8'; rr(c, -230, -620, 460, 130, 20); c.fill(); UI.font(c, 'Unb9', 70); c.fillStyle = '#2B2F3A'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(sign, 0, -553); }
  c.restore(); }
function palm(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.strokeStyle = '#8A6A3A'; c.lineWidth = 60; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(60, -900, -40, -1700); c.stroke();
  c.fillStyle = '#3E9A5A'; for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * 0.48; c.save(); c.translate(-40, -1700); c.rotate(a + Math.PI / 2); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(160, -60, 520, 120); c.quadraticCurveTo(200, 40, 0, 30); c.fill(); c.restore(); } c.restore(); }
function drawMarket(c) {
  const g = c.createLinearGradient(0, BY0, 0, HOR); g.addColorStop(0, '#5FB4EA'); g.addColorStop(1, '#CDEFFF'); c.fillStyle = g; c.fillRect(BX0, BY0, BW, HOR - BY0);
  const sg = c.createRadialGradient(1700, -3300, 40, 1700, -3300, 900); sg.addColorStop(0, 'rgba(255,248,200,1)'); sg.addColorStop(0.25, 'rgba(255,236,150,.9)'); sg.addColorStop(1, 'rgba(255,236,150,0)'); c.fillStyle = sg; c.fillRect(800, -4200, 1800, 1800);
  c.fillStyle = '#FFF4B8'; c.beginPath(); c.arc(1700, -3300, 210, 0, TAU); c.fill();
  c.fillStyle = 'rgba(255,255,255,.92)'; for (const [x, y, s] of [[-2400, -3400, 1.2], [-900, -3800, 0.9], [300, -2900, 0.8], [2500, -2500, 1.0], [-1800, -2300, 0.7]]) { for (const [dx, dy, r] of [[0, 0, 120], [120, -40, 150], [260, 0, 110], [130, 50, 120]]) { c.beginPath(); c.arc(x + dx * s, y + dy * s, r * s, 0, TAU); c.fill(); } }
  c.strokeStyle = '#3A4A5A'; c.lineWidth = 9; c.lineCap = 'round'; for (const [x, y] of [[-1300, -2900], [-1050, -3050], [600, -3500], [-200, -2600]]) { c.beginPath(); c.moveTo(x - 50, y); c.quadraticCurveTo(x - 25, y - 30, x, y); c.quadraticCurveTo(x + 25, y - 30, x + 50, y); c.stroke(); }
  // sea
  const sea = c.createLinearGradient(0, HOR, 0, -650); sea.addColorStop(0, '#2E86C1'); sea.addColorStop(1, '#5CC3D8'); c.fillStyle = sea; c.fillRect(BX0, HOR, BW, 620);
  c.fillStyle = 'rgba(255,255,255,.55)'; for (let i = 0; i < 120; i++) { const x = BX0 + hash(i * 3 + 5) * BW, y = HOR + 20 + hash(i * 7 + 1) * 560; c.fillRect(x, y, 40 + hash(i) * 90, 6); }
  c.fillStyle = 'rgba(255,250,210,.6)'; for (let i = 0; i < 40; i++) { const y = HOR + 10 + i * 14; c.fillRect(1700 - 60 - i * 6 + hash(i) * 30, y, 120 + i * 10, 5); }
  // a sailboat
  c.fillStyle = '#FFFDF8'; c.beginPath(); c.moveTo(-1500, HOR + 90); c.lineTo(-1500, HOR - 260); c.lineTo(-1330, HOR + 70); c.closePath(); c.fill(); c.fillStyle = '#E0474C'; c.beginPath(); c.moveTo(-1620, HOR + 90); c.lineTo(-1310, HOR + 90); c.lineTo(-1360, HOR + 140); c.lineTo(-1580, HOR + 140); c.closePath(); c.fill();
  // beach + promenade wall
  c.fillStyle = '#F2D8A0'; c.fillRect(BX0, -650, BW, 300); c.fillStyle = '#E6C483'; for (let i = 0; i < 60; i++) c.fillRect(BX0 + hash(i * 11) * BW, -640 + hash(i * 5) * 280, 30, 8);
  c.fillStyle = '#E9E2D2'; c.fillRect(BX0, -350, BW, 300); c.fillStyle = '#D6CCB6'; for (let x = BX0; x < BX0 + BW; x += 160) c.fillRect(x, -350, 10, 300); c.fillStyle = '#C9BEA6'; c.fillRect(BX0, -80, BW, 40);
  palm(c, -2350, -340, 1.15); palm(c, 2050, -340, 1.3); palm(c, -900, -340, 0.85);
  // promenade (her side)
  c.fillStyle = '#E7D3B2'; c.fillRect(BX0, -40, BW, BH + BY0 + 40); c.strokeStyle = 'rgba(150,110,70,.22)'; c.lineWidth = 6;
  for (let y = 120; y < 1900; y += 220) { c.beginPath(); c.moveTo(BX0, y); c.lineTo(BX0 + BW, y); c.stroke(); }
  for (let x = BX0; x < BX0 + BW; x += 300) { c.beginPath(); c.moveTo(x, -40); c.lineTo(x - 260, 1900); c.stroke(); }
  // other stalls down the row (left), smaller = further away
  farStall(c, -1650, 0.62, ['#4C9BE0', '#FFFDF8'], 'SCARVES'); farStall(c, -2700, 0.5, ['#7CC48A', '#FFFDF8'], 'HATS'); farStall(c, 2350, 0.55, ['#F2C14E', '#FFFDF8'], 'ICE CREAM');
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.2px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawMarket);

// ---------------- our stall: back (poles, awning, hanging scarves) and the counter in front of him
const CT = { x0: 40, x1: 960, y: -830 };
function stallBack(c) {
  c.fillStyle = '#8A6A4A'; c.fillRect(CT.x0, -2350, 34, 2350); c.fillRect(CT.x1 - 34, -2350, 34, 2350);
  c.fillStyle = '#F3E9D6'; c.fillRect(CT.x0 + 34, -2200, CT.x1 - CT.x0 - 68, 200);
  awning(c, CT.x0 - 60, CT.x1 + 60, -2400, ['#E0474C', '#FFFDF8']);
  c.strokeStyle = '#6A4A2A'; c.lineWidth = 12; c.beginPath(); c.moveTo(CT.x0, -2040); c.lineTo(CT.x1, -2040); c.stroke();
  const cols = ['#4C9BE0', '#F2C14E', '#EE5E9A', '#7CC48A', '#B48AD6', '#F08A5D', '#2FA4A9', '#FFFDF8'];
  for (let i = 0; i < 9; i++) { const x = CT.x0 + 60 + i * 100, L = 230 + (i % 3) * 40; paint(c, q => { q.m(x - 34, -2040); q.l(x + 34, -2040); q.l(x + 38, -2040 + L); q.l(x - 38, -2040 + L); q.z(); }, cols[i % cols.length], { sd: 6, hd: 3, lw: 3 });
    c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 6; c.beginPath(); c.moveTo(x - 30, -2040 + L * 0.5); c.lineTo(x + 30, -2040 + L * 0.5); c.stroke(); }
  // side rack of scarves (right edge, beside him)
  for (let i = 0; i < 4; i++) paint(c, q => { q.m(CT.x1 - 20, -1900 + i * 140); q.l(CT.x1 + 160, -1880 + i * 140); q.l(CT.x1 + 150, -1500 + i * 120); q.l(CT.x1 - 10, -1520 + i * 120); q.z(); }, cols[(i + 3) % 8], { sd: 6, hd: 3, lw: 3 });
}
function stallFront(c) {
  c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse((CT.x0 + CT.x1) / 2, 0, (CT.x1 - CT.x0) / 2 + 60, 40, 0, 0, TAU); c.fill();
  paint(c, q => { q.m(CT.x0, CT.y); q.l(CT.x1, CT.y); q.l(CT.x1, -10); q.l(CT.x0, -10); q.z(); }, '#C98B5A', { sd: 10, hd: 5, lw: 5 });
  c.fillStyle = '#B07646'; for (let x = CT.x0 + 90; x < CT.x1; x += 120) c.fillRect(x, CT.y + 40, 8, 780);
  // cloth over the counter (striped)
  c.fillStyle = '#2FA4A9'; c.beginPath(); c.moveTo(CT.x0 - 20, CT.y - 20); c.lineTo(CT.x1 + 20, CT.y - 20); c.lineTo(CT.x1 + 20, CT.y + 160); for (let x = CT.x1 + 20; x > CT.x0 - 20; x -= 60) c.quadraticCurveTo(x - 30, CT.y + 200, x - 60, CT.y + 160); c.closePath(); c.fill();
  c.fillStyle = '#FFFDF8'; for (let x = CT.x0; x < CT.x1; x += 120) c.fillRect(x, CT.y - 20, 40, 180);
  // folded scarves on the counter
  const cols = ['#F2C14E', '#EE5E9A', '#7CC48A', '#B48AD6', '#4C9BE0', '#F08A5D'];
  for (let i = 0; i < 4; i++) { const x = CT.x0 + 400 + i * 130; for (let k = 0; k < 3; k++) { c.fillStyle = cols[(i + k * 2) % 6]; rr(c, x - 52, CT.y - 40 - k * 34, 104, 34, 10); c.fill(); c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 3; c.stroke(); } }
  // painted sign on the front
  c.fillStyle = '#FFFDF8'; rr(c, CT.x0 + 180, CT.y + 300, 560, 160, 30); c.fill(); c.strokeStyle = '#9C6238'; c.lineWidth = 8; c.stroke(); fitTxt(c, 'SCARVES', CT.x0 + 460, CT.y + 382, 96, '#D7263D', 500);
}

// ---------------- characters
const gest = (st, g, who, t, side, base) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20, { planar: true }); } };
const hang = (g, s) => reach(g, s, s * g.sw * 0.8, g.ySh + 330);
const frac = (id, t) => (t - SP[id].t) / SP[id].d;
const hips = (g, s) => reach(g, s, s * g.sw * 1.15, g.ySh + 300, { planar: true });
// her x position over time (C1 a step away, C2 she walks away)
const STEP = ev('C1', 'step'), WALK = ev('C2', 'walk'), RUN = ev('C2', 'run');
const HER_END = HX - 600, SEL_END = HER_END + 480;
function herX(t, L) { if (L === 'C1') return HX - 110 * eIO(P(t, STEP, STEP + 0.45)); if (L === 'C2') return lerp(HX, HER_END, P(t, WALK, WALK + 1.55)); return HX; }
function selX(t, L) { if (L === 'C2') return lerp(DX, SEL_END, eOut(P(t, RUN, RUN + 1.35))); return DX; }
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { t, talk: talk('her', t), mood: 'neutral', turn: 0.35, look: 0.8, armL: hang(g, -1), armR: hang(g, 1), items: {} };
  if (L === 'hook') { st.mood = 'shock'; st.blink = 0; st.lookY = 0.1; if (t > hev('back')) { st.mood = 'skeptical'; st.blink = undefined; } }
  if (L === 'A1') { st.mood = 'annoyed';
    if (speaking('a1_h', t, 0.05, 0.2)) { st.mood = 'shock'; const f = frac('a1_h', t); st.armR = reach(g, 1, g.sw * (f > 0.55 ? 2.3 : 1.7), g.ySh + (f > 0.55 ? 60 : 160) + Math.sin(t * 9) * 10, { planar: true }); }
    if (t > endOf('a1_s')) { st.mood = 'annoyed'; st.look = 0.2; st.lookY = 0.35; st.armR = reach(g, 1, g.sw * 1.6, g.ySh + 120, { planar: true }); st.items = { R: bagItem }; } }
  if (L === 'A2') { st.mood = 'annoyed'; if (speaking('a2_h', t, 0.05, 0.2)) gest(st, g, 'her', t, 1, 160); if (t > SP.a2_s.t + 0.6) st.mood = 'skeptical'; }
  if (L === 'B1') { st.mood = 'happy'; if (speaking('b1_h', t, 0.05, 0.2)) { st.armR = reach(g, 1, g.sw * 1.9, g.ySh + 150 + Math.sin(t * 5) * 12, { planar: true }); }
    if (t > e('cry')) st.mood = 'skeptical'; if (t > e('flip') - 0.1) st.mood = 'happy'; }
  if (L === 'B2') { st.mood = 'skeptical'; st.armL = hips(g, -1); st.armR = hips(g, 1);
    if (speaking('b2_h', t, 0.05, 0.2)) { st.armR = reach(g, 1, g.sw * 1.8, g.ySh + 140 + Math.sin(t * 6) * 12, { planar: true }); }
    if (t > e('tug') - 0.05) { st.mood = 'shock'; st.blink = 0; } if (t > endOf('b2_s') + 0.2) { st.mood = 'skeptical'; st.blink = undefined; } }
  if (L === 'C1') { st.mood = 'smug';
    if (t > e('point') && t < STEP + 0.2) { st.look = -0.9; st.turn = 0.0; st.armL = reach(g, -1, -g.sw * 2.4, g.ySh + 30, { planar: true }); }
    if (t > STEP) { st.turn = -0.35; st.look = -0.6; st.legPose = t < STEP + 0.45 ? 'walk' : 'stand'; }
    if (t > SP.c1_s.t - 0.1) { st.turn = -0.1; st.look = 0.9; st.mood = 'smug'; }
    if (t > e('flip')) { st.mood = 'happy'; st.turn = 0.3; } }
  if (L === 'C2') { st.mood = 'happy';
    if (speaking('c2_h', t, 0.05, 0.1)) { const f = frac('c2_h', t); st.mood = f < 0.4 ? 'happy' : 'smug';
      if (f > 0.4 && f < 0.72) st.armR = reach(g, 1, g.sw * 2.1, g.ySh + 110, { planar: true });
      if (f >= 0.72) st.armR = reach(g, 1, g.sw * 0.5, g.ySh + 150, { planar: true }); }
    if (t > WALK - 0.05) { st.mood = 'smug'; st.turn = -0.55; st.look = -0.9; st.blink = 1; st.legPose = t < WALK + 1.55 ? 'walk' : 'stand'; if (st.legPose === 'walk') st.headY = -Math.abs(Math.sin(t * 8)) * 8; }
    if (t > SP.c2_s.t + 0.9) { st.turn = 0.3; st.look = 0.9; st.blink = undefined; st.mood = 'smug'; }
    if (t > SP.c2_nar.t - 0.1) { st.mood = 'happy'; st.armR = reach(g, 1, g.sw * 1.7, g.ySh + 140, { planar: true }); st.items = { R: noteItem }; } }
  return st; }
// seller local coords: world = (selX, 0) + local
const HOLD = (g, t, wob = 0) => reach(g, -1, -g.sw * 1.65, g.ySh - 100 + wob, { planar: true });
function selState(t, L) { const g = G.seller, e = k => ev(L, k), st = { t, talk: talk('seller', t), mood: 'happy', turn: -0.35, look: -0.8, legs: true, armL: HOLD(g, t), armR: reach(g, 1, g.sw * 1.2, g.ySh + 470, { planar: true }), items: { L: scarfItem(t) } };
  if (L === 'hook') { st.armL = HOLD(g, t, Math.sin(t * 5) * 18); st.mood = 'happy'; if (speaking('hook_s', t, 0, 0) && frac('hook_s', t) > 0.55) st.armR = reach(g, 1, g.sw * 1.9, g.ySh + 60, { planar: true }); if (t > hev('stun')) { st.mood = 'smug'; } }
  if (L === 'A1') { if (speaking('a1_h', t, 0.05, 0.2)) st.mood = 'surprised';
    if (speaking('a1_s', t, 0.05, 0.1)) { st.mood = 'happy'; st.blink = frac('a1_s', t) > 0.5 ? 1 : undefined; if (t > e('bag') - 0.5) { st.armR = reach(g, 1, g.sw * 1.0, g.ySh + 60, { planar: true }); st.items = { L: scarfItem(t), R: bagItem }; } }
    if (t > endOf('a1_s') + 0.1) { st.mood = 'happy'; st.blink = 1; } }
  if (L === 'A2') { if (speaking('a2_h', t, 0.05, 0.2)) st.mood = 'surprised'; if (speaking('a2_s', t, 0.05, 0.3)) { st.mood = 'happy'; st.armR = reach(g, 1, g.sw * 1.9, g.ySh - 20 + Math.sin(t * 6) * 16, { planar: true }); } }
  if (L === 'B1') { if (speaking('b1_h', t, 0.05, 0.2)) st.mood = 'surprised';
    if (t > e('cry') - 0.1 && t < e('flip') - 0.6) { st.mood = 'sad'; st.blink = 1; st.headFirst = true; st.lookY = 0.3; st.armR = reach(g, 1, g.sw * 0.55, g.headY + g.hh * 0.45 + Math.sin(t * 10) * 8, { planar: true }); }
    if (t > e('flip') - 0.6) { st.mood = 'smug'; st.blink = undefined; } }
  if (L === 'B2') { if (speaking('b2_h', t, 0.05, 0.2)) st.mood = 'surprised';
    if (t > e('tug') - 0.1 && t < endOf('b2_s') + 0.3) { const u = t - e('tug'), j = Math.abs(Math.sin(u * 9)) * 40; st.mood = 'happy';
      const lx = -g.sw * 1.55 - j, rx = g.sw * 1.55 + j, y = g.ySh + 200; st.armL = reach(g, -1, lx, y, { planar: true }); st.armR = reach(g, 1, rx, y, { planar: true });
      st.items = { L: { under: c => scarfTaut(c, t, rx - lx, 0) } }; } }
  if (L === 'C1') { st.mood = 'smug'; if (speaking('c1_h', t, 0.05, 0.1)) st.mood = frac('c1_h', t) < 0.4 ? 'smug' : 'worried';
    if (t > STEP - 0.1) { st.mood = 'shock'; st.blink = 0; }
    if (t > SP.c1_s.t - 0.1) { st.mood = 'worried'; st.blink = undefined; st.armL = HOLD(g, t, -40); st.lean = -0.4; }
    if (t > e('brac') - 0.1) { st.mood = 'happy'; st.armR = reach(g, 1, g.sw * 0.6, g.ySh + 40, { planar: true }); st.items = { L: scarfItem(t), R: braceletItem }; } }
  if (L === 'C2') { st.mood = 'smug'; if (speaking('c2_h', t, 0.05, 0.1)) { const f = frac('c2_h', t); st.mood = f < 0.35 ? 'happy' : f < 0.7 ? 'surprised' : 'worried'; }
    if (t > endOf('c2_h')) { st.mood = 'shock'; st.blink = 0; st.look = -0.9; }
    if (t > RUN) { const run = t < RUN + 1.35; st.mood = 'worried'; st.blink = undefined; st.turn = -0.6; st.look = -0.9; st.legPose = run ? 'walk' : 'stand'; if (run) { st.headY = -Math.abs(Math.sin(t * 12)) * 14; st.lean = -0.6; }
      st.armL = HOLD(g, t, -120 + Math.sin(t * 8) * 30); st.armR = reach(g, 1, g.sw * 1.6, g.ySh + 120 + Math.sin(t * 8 + 1) * 30, { planar: true }); }
    if (t > SP.c2_nar.t - 0.1) { st.mood = 'happy'; st.lean = 0; st.armL = HOLD(g, t, 40); st.armR = hang(g, 1); } }
  return st; }
// tears (B1) next to his face, in world coords
function tears(c, hd, t) { if (!(t > ev('B1', 'cry') && t < ev('B1', 'flip') - 0.6)) return; for (const s of [-1, 1]) for (let k = 0; k < 2; k++) { const u = ((t * 1.6 + k * 0.5 + (s > 0 ? 0.25 : 0)) % 1);
  const x = hd.x + s * hd.hh * 0.55 - 18, y = hd.y + hd.hh * 0.15 + u * hd.hh * 1.1; c.globalAlpha = 1 - u * 0.6; c.fillStyle = '#7FD3F5'; c.beginPath(); c.moveTo(x, y - 22); c.quadraticCurveTo(x + 15, y, x, y + 10); c.quadraticCurveTo(x - 15, y, x, y - 22); c.fill(); c.globalAlpha = 1; } }

// ---------------- the world + which characters a shot draws (clean singles: only the tagged character)
const DRAW = { wide: ['her', 'seller'], card: ['her', 'seller'], two: ['her', 'seller'], cover: ['her', 'seller'], her: ['her'], seller: ['seller'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGR, BX0, BY0, BW, BH);
  stallBack(c);
  const sx = selX(t, L), out = sx < CT.x0 - 120;
  if (who.includes('seller') && !out) { heads.seller = K.put(c, SELLER, selState(t, L), sx, 0); tears(c, heads.seller, t); }
  stallFront(c);
  if (who.includes('seller') && out) heads.seller = K.put(c, SELLER, selState(t, L), sx, 0);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), herX(t, L), 0);
  K.mark(c, 'tag', sx - 380, -1000, 110);
  if (!heads.seller) heads.seller = OFF; if (!heads.her) heads.her = OFFL;
  return heads; }

// ---------------- shots (world coordinates; face of a single at ~900 px)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const hHY = G.her.headY, sHY = G.seller.headY;
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(130, fy(hHY, 0.68, 1320), 0.68, 'cover'), WIDE: S(-60, -1350, 0.5, 'wide'), SEA: S(-420, -1750, 0.42, 'wide'), CARD: S(110, fy(sHY, 0.6, 960), 0.6, 'card'), TWO: S(95, fy(hHY, 0.72, 1020), 0.72, 'two'),
  HER: S(HX + 20, fy(hHY, 1.0), 1.0, 'her'), HER_CU: S(HX + 10, fy(hHY, 1.3, 960), 1.3, 'her'), HER_L: S(HX - 120, fy(hHY, 1.0), 1.0, 'her'),
  SEL: S(DX - 90, fy(sHY, 1.0), 1.0, 'seller'), SEL_CU: S(DX - 60, fy(sHY, 1.3, 900), 1.3, 'seller'),
  WIDE2: S(-170, -1350, 0.5, 'wide'), CARD2: S((HER_END + SEL_END) / 2 + 10, fy(sHY, 0.6, 960), 0.6, 'card'),
  TAG: U('tag', 1) };
const C2Z = [SH.HER, S(HX + 10, fy(hHY, 1.15, 900), 1.15, 'her'), S(HX + 10, fy(hHY, 1.35, 900), 1.35, 'her')];
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  const sp = id => speaking(id, t, 0.1, 0.15);
  if (L === 'hook') { const st = hev('stun'); if (t < st) return SH.COVER; if (t < st + 0.58) return f(SH.HER_CU); if (t < hev('tag')) return f(SH.SEA); if (t < hev('back')) return f(SH.TAG); return f(SH.TWO); }
  const u = t - sc.s, l = L.toLowerCase(), nar = SP[l + '_nar'];
  if (L === 'C2' && t >= nar.t - 0.1) return f(SH.CARD2);
  if (nar && t >= nar.t - 0.1) return f(SH.CARD);
  if (u < 0.35) return f(SH.WIDE);
  if ((L === 'B1' || L === 'C1') && t > e('flip') - 0.05) return f(SH.TAG);
  if (L === 'A2' && t > e('qual') - 0.05) return f(SH.TAG);
  if (L === 'A1' && t > endOf('a1_s') + 0.2) return f(SH.TWO);
  if (L === 'C2') { if (sp('c2_h')) { const ch = (TL.cfg.chunks || {}).c2_h, p = SP.c2_h, w = p.words || [], cnt = ch.map(([en]) => en.trim().split(/\s+/).length), tot = cnt.reduce((a, b) => a + b, 0); let wi = 0, i = 0;
      ch.forEach((q, k) => { const a = w.length === tot ? p.t + w[wi][1] : p.t + p.d * k / ch.length; if (t >= a - 0.05) i = k; wi += cnt[k]; }); return f(C2Z[i] || SH.HER); }
    if (t < endOf('c2_h') + 0.25) return f(C2Z[2]);
    return f(SH.WIDE2); }
  // the latest line that has started wins: the cut to the next speaker comes 0.1 s before his line, never after (no off-screen bubble over the current shot)
  const cur = TL.speech.filter(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.1 && t < s.t + s.d + 0.25).pop();
  const single = who => who === 'her' ? (L === 'C1' ? SH.HER_L : SH.HER) : SH.SEL;
  if (cur) return f(single(cur.who));
  if (nar && t >= nar.t - 0.75) return f(SH.CARD);
  const next = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.6 && t < s.t);
  if (next) return f(single(next.who));
  return SH.TWO; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
function CAM_AT(t) { let fr = Math.min(CAM.length - 1, Math.round(t * FPS)); const tag = CAM[fr].tag; while (fr > 0 && CAM[fr - 1].tag === tag) fr--; return fr / FPS; }
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- overlays
function title(c, t) { const lines = TL.cfg.hook_title, a = 1 - clamp((t - 2.3) / 0.2); if (a <= 0) return; const rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 440); c.rotate(-0.05); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -170 + 14, 980, 340, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -170, 980, 340, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 74, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -108);
  UI.textFit(c, 'Unb9', 120, lines[1][0], 900); UI.strokeText(c, lines[1][0], 0, 4, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 66, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 116); c.restore();
  if (global.__QA) global.__QA.ui(c, 'title', { x: 50, y: 270, w: 980, h: 340, k: a, id: 'title' }); }
function miniIntro(c, t, sc) { const u = t - sc.s; if (u > 0.45 || u < 0) return; const L = sc.id, i = UI.LV.indexOf(L); if (i < 0) return;
  const pw = 128, gap = 14, x0 = (W - (6 * pw + 5 * gap)) / 2, px = x0 + i * (pw + gap) + pw / 2, py = 253;
  const k = eIO(P(u, 0.04, 0.4)), cx = lerp(540, px, k), cy = lerp(960, py, k), R = lerp(330, 34, k);
  c.save(); c.globalAlpha = 1 - P(u, 0.36, 0.45); c.fillStyle = LVCOL[L]; c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 8; c.stroke();
  c.translate(cx, cy); const s = lerp(1, 0.2, k); c.scale(s, s); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.font(c, 'Unb9', 230); UI.strokeText(c, L, 0, 10, C.white, C.oliveD, 18); c.restore(); }
// A1 lesson card drawn here (the shared 'meter' card has a fixed «ГРАММАТИКА» label): ЦЕНА €80 stays full, ✗ купила пакет
function cardA1(c, t, sc) { const nar = SP.a1_nar, cd = TL.cfg.cards.A1; const u = t - nar.t + 0.15; if (u < 0) return;
  const out = P(t, sc.e - 0.35, sc.e - 0.05), k = eBack(P(u, 0, 0.35), 1.6), x = 90, w = 900, y = 330 + (1 - k) * -80, h = 380, n = t - nar.t;
  c.save(); c.globalAlpha = clamp(u / 0.15) * (1 - out); c.translate(540, y + h / 2); c.rotate((1 - k) * -0.08); c.translate(-540, -(y + h / 2));
  c.fillStyle = 'rgba(62,71,30,.28)'; rr(c, x + 12, y + 18, w, h, 44); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 8; rr(c, x, y, w, h, 44); c.fill(); c.stroke();
  c.fillStyle = LVCOL.A1; rr(c, x + 40, y - 34, 230, 68, 34); c.fill(); c.stroke(); UI.font(c, 'Unb9', 30); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('A1 • УРОК', x + 155, y + 2);
  const cx = x + 60, cy = y + 60; c.textAlign = 'left';
  UI.font(c, 'Unb9', 44); c.fillStyle = C.oliveD; c.fillText(cd.label, cx, cy + 40);
  const g = eIO(P(n, 0.3, 0.9)); UI.font(c, 'Unb9', 44); c.fillStyle = C.red; c.textAlign = 'right'; c.fillText('€80', cx + 780, cy + 40); c.textAlign = 'left';
  c.fillStyle = C.cream2; rr(c, cx, cy + 100, 780, 60, 30); c.fill(); c.fillStyle = C.red; rr(c, cx, cy + 100, Math.max(60, 780 * (1 - 0.02 * g)), 60, 30); c.fill();
  UI.font(c, 'Nun9', 30); c.fillStyle = C.white; c.fillText('СКИДКА 0%', cx + 30, cy + 132);
  const q = eBack(P(n, 0.8, 1.1), 2); if (q > 0) { c.save(); c.translate(cx, cy + 250); c.scale(q, q); UI.cross(c, 34, 0, 34); UI.font(c, 'Nun9', 50); c.fillStyle = C.red; c.fillText(cd.note, 92, 4);
    const tw = c.measureText(cd.note).width; c.save(); c.translate(92 + tw + 70, -10); c.scale(0.42, 0.42); bagItem.over(c); c.restore(); c.restore(); }
  c.restore(); }
function hud(c, t, sc) { if (sc.id === 'A1') cardA1(c, t, sc); else UI.card(c, t, sc); UI.captions(c, t); UI.sparkles(c, t); Hq.grain(c, W, HH, t, 0.04); UI.levelBar(c, t, sc, 1); UI.watermark(c); miniIntro(c, t, sc); UI.levelIntroNext(c, t); }
function liveHeads(heads, proj, t) { const out = { ...heads };
  for (const who of Object.keys(out)) { const q = proj(out[who]); if (q.x >= 0 && q.x <= W) continue; const live = TL.speech.some(s => s.who === who && t >= s.t - 0.1 && t < s.t + s.d); if (!live) delete out[who]; }
  return out; }
const names = { seller: ['CALLUM', '#2FA4A9'] };
const HOLDB = { hook_s: 0.05, a1_h: 0.05, a1_s: 0.05, a2_h: 0.05, a2_s: 0.05, b1_h: 0.05, b1_s: 0.05, b2_h: 0.05, b2_s: 0.05, c1_h: 0.05, c1_s: 0.05, c2_h: 0.05, c2_s: 0.1 };
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { const rows = [['A1', 'No! Expensive! Ten!'], ['B1', 'Could you do it for thirty?'], ['B2', "Come on, that's a rip-off."], ['C1', 'Shall I go and check?']];
    K.outro(c, t, { q: ['ТЫ УМЕЕШЬ', 'ТОРГОВАТЬСЯ?'], qSize: 54, rows, cta: ['ОТПРАВЬ ПОДРУГЕ', 'ПЕРЕД ОТПУСКОМ'], heroX: 95, heroS: 0.34, heroY: [2350, 1985], ctaFit: true,
      hero: (cc, tt) => { const g = G.her, gd = G.seller;
        K.put(cc, SELLER, { t: tt, mood: 'worried', turn: -0.2, look: -0.4, talk: 0, armL: HOLD(gd, tt, Math.sin(tt * 6) * 15), armR: reach(gd, 1, gd.sw * 1.25, gd.ySh + 200 + Math.sin(tt * 6 + 1) * 15, { planar: true }), items: { L: scarfItem(F20 + 1) } }, 620, 0, 0.86);
        K.put(cc, HER, { t: tt, mood: 'happy', laugh: true, turn: 0.2, look: 0.3, armL: hang(g, -1), armR: reach(g, 1, g.sw * 1.55, g.ySh + 100, { planar: true }), items: { R: noteItem } }, 0, 0); } });
    const u = t - SC.outro.s, kk = P(u, 1.35, 1.7); if (kk > 0) { const bh = 140 + rows.length * 115, y = 740 - bh / 2 + 150; UI.textFit(c, 'Nun9', 46, rows[0][1], 740); const wd = c.measureText(rows[0][1]).width;
      c.save(); c.globalAlpha = 0.55 * kk; c.fillStyle = C.white; c.fillRect(214, y - 34, wd + 16, 68); c.restore(); c.strokeStyle = C.red; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(212, y + 2); c.lineTo(212 + (wd + 16) * eOut(kk), y + 2); c.stroke(); }
    Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag.startsWith('ui:')) { tagView(c, t); heads = { her: OFFL, seller: OFF }; proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.22); }
  heads = liveHeads(heads, proj, t);
  if (L === 'hook') { title(c, t);
    K.bubbles(c, t, { id: 'hook' }, heads, proj, { cleanChunks: true, names, hold: HOLDB }); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); UI.captions(c, t);
    Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.watermark(c); UI.levelIntroNext(c, t); return; }
  K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names, hold: HOLDB });
  hud(c, t, sc);
}
E.run('bazaar', NF, renderFrame);
