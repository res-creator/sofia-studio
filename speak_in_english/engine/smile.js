// "Cheer up, love!" (London supermarket checkout) episode renderer (hard_cut camera): node smile.js start end out.mp4 | --png=f1,f2
// Checkout: conveyor belt + till, Linda (supermarket uniform, LINDA badge) behind the counter on the right, her at the belt on the left,
// a queue (tom, priya, greg with baskets) behind her, security guard Ben (SECURITY vest + cap, no lines) by the exit.
// Comfort-gift pile on the belt in front of her: A1 chocolate + tissue, A2 another chocolate, B1 a flower. Gift counter bottom-left.
// B2: Linda and the guard look up at the ceiling for the cloud. C2: the sign above the till lights up CHOCOLATE 70% OFF -> everyone beams. No black card.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/smile/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];
const ORDER = ['hook', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'outro'], idx = L => ORDER.indexOf(L);
const reached = (t, L, lvl, k) => idx(L) > idx(lvl) || (L === lvl && t >= ev(lvl, k));

// ---------------- cast: heroine in a mustard jumper + jeans; Linda in the supermarket uniform; guard Ben; the queue
const HER = { ...BASE.her_lift, top: { type: 'sweater', col: '#E2A73A' }, bottom: { type: 'jeans', col: '#4A5A7A' }, shoes: { col: '#F4EFE6', acc: '#C98B5A' } };
const LIN = { ...BASE.linda, top: { type: 'polo', col: '#2E7D5B', col2: '#F3EDDF' } };
const GRD = { ...BASE.ben, top: { type: 'longsleeve', col: '#F7F9FC' }, bottom: { type: 'trousers', col: '#22252E' }, shoes: { col: '#1E1612', acc: null } };
const QS = 0.93, QUEUE = [['greg', -1130], ['priya', -935], ['tom', -745]].map(([k, x]) => ({ k, x, cfg: BASE[k], g: geom(BASE[k]) }));
const G = { her: geom(HER), cashier: geom(LIN), guard: geom(GRD) };
const HX = -380, LX = 470, GX = 1270, CT = -760, TX0 = -170, TX1 = 1000, TILLX = 820, SIGNX = 580, SIGNY = -2180, PILEX = 70, BAGX = -95;
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function heartPath(c, x, y, r) { c.beginPath(); c.moveTo(x, y + r * 0.9); c.bezierCurveTo(x - r * 1.4, y - r * 0.1, x - r * 0.7, y - r * 1.2, x, y - r * 0.45); c.bezierCurveTo(x + r * 0.7, y - r * 1.2, x + r * 1.4, y - r * 0.1, x, y + r * 0.9); c.closePath(); }
// uniform details: Linda's LINDA name badge; the guard's SECURITY vest and cap
function badge(cc, g) { const sw = g.sw, y0 = g.ySh; cc.save(); cc.translate(-sw * 0.42, y0 + 150); cc.rotate(-0.04); cc.fillStyle = 'rgba(0,0,0,.18)'; rr(cc, -62 + 4, -26 + 5, 124, 52, 9); cc.fill(); cc.fillStyle = '#FFFDF8'; rr(cc, -62, -26, 124, 52, 9); cc.fill(); cc.strokeStyle = '#1F5A40'; cc.lineWidth = 3; cc.stroke(); fitTxt(cc, 'LINDA', 0, 1, 28, '#1F5A40', 108); cc.restore(); }
function vest(cc, g) { const sw = g.sw, y0 = g.ySh;
  paint(cc, q => { q.m(-sw * 0.95, y0 + 10); q.l(-sw * 0.25, y0 + 10); q.l(0, y0 + 190); q.l(sw * 0.25, y0 + 10); q.l(sw * 0.95, y0 + 10); q.l(sw * 0.86, y0 + 560); q.l(-sw * 0.86, y0 + 560); q.z(); }, '#22252E', { sd: 10, hd: 4, lw: 4 });
  cc.fillStyle = '#F2C14E'; rr(cc, -sw * 0.84, y0 + 260, sw * 1.68, 64, 10); cc.fill(); fitTxt(cc, 'SECURITY', 0, y0 + 293, 34, '#22252E', sw * 1.55); }
function capOn(cc, a, g) { const { hw, hh } = g; cc.save(); cc.translate(a.head.x, a.head.y - hh * 0.8);
  paint(cc, q => { q.m(-hw * 1.05, 10); q.q(-hw * 1.2, -hh * 0.55, 0, -hh * 0.62); q.q(hw * 1.2, -hh * 0.55, hw * 1.05, 10); q.z(); }, '#22252E', { sd: 8, hd: 4, lw: 4 });
  cc.fillStyle = '#F2C14E'; cc.fillRect(-hw * 1.02, -16, hw * 2.04, 18); cc.fillStyle = '#14161C'; cc.beginPath(); cc.ellipse(-hw * 0.2, 14, hw * 1.15, 22, 0, 0, Math.PI); cc.fill(); cc.restore(); }

// ---------------- props (hand-local coords: y up = negative)
function chocDraw(c, s = 1, rot = 0) { c.save(); c.scale(s, s); c.rotate(rot); c.fillStyle = 'rgba(0,0,0,.15)'; rr(c, -96, -30, 196, 40, 8); c.fill();
  paint(c, q => { q.m(-95, -40); q.l(95, -40); q.l(95, 0); q.l(-95, 0); q.z(); }, '#6B3FA0', { sd: 6, hd: 3, lw: 3 });
  c.fillStyle = '#C9A13A'; c.fillRect(-95, -40, 26, 40); c.fillRect(69, -40, 26, 40); fitTxt(c, 'CHOC', 0, -19, 24, '#F2C14E', 120); c.restore(); }
function tissueDraw(c, s = 1) { c.save(); c.scale(s, s); paint(c, q => { q.m(-60, 0); q.l(60, 0); q.l(52, -46); q.l(-52, -46); q.z(); }, '#F7B6CF', { sd: 6, hd: 3, lw: 3 });
  paint(c, q => { q.m(-24, -44); q.q(-30, -100, 0, -96); q.q(34, -104, 22, -44); q.z(); }, '#FFFFFF', { sd: 4, hd: 2, lw: 3 }); c.restore(); }
function flowerDraw(c, s = 1, rot = 0) { c.save(); c.scale(s, s); c.rotate(rot); c.strokeStyle = '#3E8E4A'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(10, -80, 0, -170); c.stroke();
  c.fillStyle = '#5EA65A'; c.beginPath(); c.ellipse(16, -80, 28, 12, -0.5, 0, TAU); c.fill();
  for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; c.fillStyle = '#F37BA8'; c.beginPath(); c.ellipse(Math.cos(a) * 30, -190 + Math.sin(a) * 30, 24, 16, a, 0, TAU); c.fill(); }
  c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(0, -190, 20, 0, TAU); c.fill(); c.restore(); }
function smileyDraw(c, r) { c.fillStyle = '#FFD93B'; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill(); c.strokeStyle = '#3E471E'; c.lineWidth = r * 0.08; c.stroke();
  c.fillStyle = '#3E471E'; c.beginPath(); c.ellipse(-r * 0.33, -r * 0.22, r * 0.1, r * 0.17, 0, 0, TAU); c.ellipse(r * 0.33, -r * 0.22, r * 0.1, r * 0.17, 0, 0, TAU); c.fill();
  c.lineWidth = r * 0.1; c.lineCap = 'round'; c.beginPath(); c.arc(0, r * 0.05, r * 0.55, 0.35, Math.PI - 0.35); c.stroke(); }
// her shopping bag (canvas tote); stuck = smiley sticker on it (k = slap-in scale)
function bagDraw(c, s = 1, stuck = 1) { c.save(); c.scale(s, s);
  c.strokeStyle = '#8A6A4A'; c.lineWidth = 10; c.beginPath(); c.moveTo(-60, -200); c.quadraticCurveTo(-50, -290, 0, -290); c.quadraticCurveTo(50, -290, 60, -200); c.stroke();
  paint(c, q => { q.m(-115, -210); q.l(115, -210); q.l(125, 0); q.l(-125, 0); q.z(); }, '#EDE3CF', { sd: 8, hd: 4, lw: 4 });
  c.fillStyle = '#5E9E6E'; c.beginPath(); c.moveTo(-80, -40); c.quadraticCurveTo(0, -70, 80, -40); c.lineTo(80, -30); c.quadraticCurveTo(0, -60, -80, -30); c.fill();
  c.fillStyle = '#3FA7A0'; c.beginPath(); c.arc(-60, -230, 18, 0, TAU); c.arc(-30, -240, 20, 0, TAU); c.fill(); c.fillStyle = '#E0474C'; c.beginPath(); c.arc(40, -232, 22, 0, TAU); c.fill();   // groceries peeking out
  if (stuck > 0) { c.save(); c.translate(0, -112); c.rotate(-0.15); c.scale(stuck, stuck); smileyDraw(c, 62); c.restore(); }
  c.restore(); }
function basketDraw(c, s = 1) { c.save(); c.scale(s, s); c.strokeStyle = '#B03A3A'; c.lineWidth = 8; c.beginPath(); c.moveTo(-80, -110); c.quadraticCurveTo(0, -200, 80, -110); c.stroke();
  c.fillStyle = '#4FA36A'; c.beginPath(); c.arc(-30, -112, 26, 0, TAU); c.fill(); c.fillStyle = '#F2C14E'; rr(c, 10, -150, 50, 50, 8); c.fill();
  paint(c, q => { q.m(-110, -110); q.l(110, -110); q.l(90, 0); q.l(-90, 0); q.z(); }, '#D94A4A', { sd: 6, hd: 3, lw: 3 });
  c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 5; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(k * 36, -100); c.lineTo(k * 30, -10); c.stroke(); } c.restore(); }
const basketItem = ctx => { ctx.save(); ctx.translate(0, 150); basketDraw(ctx, 0.9); ctx.restore(); };
const bagItem = k => ctx => { ctx.save(); ctx.translate(0, 280); bagDraw(ctx, 0.95, k); ctx.restore(); };
const chocItem = ctx => { ctx.save(); ctx.translate(0, 20); chocDraw(ctx, 0.8, -0.3); ctx.restore(); };
const flowerItem = ctx => { ctx.save(); ctx.translate(0, 40); flowerDraw(ctx, 0.9, -0.5); ctx.restore(); };

// ---------------- supermarket (prerendered, softly blurred); counter, sign, pile, people drawn live
const BX0 = -2200, BY0 = -3400, BW = 4400, BH = 4800, BS = 0.5;
function drawShop(c) {
  c.fillStyle = '#EEF1EC'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = '#DDE4DC'; c.fillRect(BX0, BY0, BW, 900);   // ceiling band
  for (const x of [-1500, -400, 700, 1700]) { c.fillStyle = '#B8BFC6'; c.fillRect(x - 6, -2700, 12, 230); c.fillStyle = '#FFFDF2'; rr(c, x - 330, -2480, 660, 60, 20); c.fill(); c.strokeStyle = '#9AA2AA'; c.lineWidth = 6; c.stroke(); }
  // shelves along the back wall with colourful goods
  const cols = ['#E0474C', '#F2C14E', '#3C8FE0', '#5E9E6E', '#EF7FAA', '#E9A23B', '#8E5BD6', '#3FB6A8'];
  for (let r = 0; r < 4; r++) { const y = -1900 + r * 300; c.fillStyle = '#A9B2BA'; c.fillRect(BX0, y + 220, BW, 26);
    for (let x = BX0 + 20, k = r * 3; x < BX0 + BW - 100; k++) { const w = 70 + ((k * 37) % 60), h = 120 + ((k * 53) % 90); c.fillStyle = cols[k % cols.length]; rr(c, x, y + 220 - h, w, h, 8); c.fill(); c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(x + 10, y + 220 - h + 20, w - 20, 14); x += w + 12; } }
  c.fillStyle = '#2E7D5B'; rr(c, -1900, -2350, 1300, 170, 20); c.fill(); fitTxt(c, 'FRESH FOOD', -1250, -2265, 90, '#FFFDF8', 1200);
  c.fillStyle = '#C9D2D8'; c.fillRect(BX0, -700, BW, 440);
  // sliding exit doors behind the guard
  c.fillStyle = '#9AA6B0'; rr(c, 1080, -2150, 900, 1900, 12); c.fill(); c.fillStyle = '#CFE6F2'; rr(c, 1110, -2120, 410, 1860, 8); c.fill(); rr(c, 1540, -2120, 410, 1860, 8); c.fill();
  c.fillStyle = '#2E9E4A'; rr(c, 1360, -2380, 340, 110, 14); c.fill(); fitTxt(c, 'EXIT', 1530, -2325, 70, '#FFFDF8', 300);
  // floor
  c.fillStyle = '#D9D6CC'; c.fillRect(BX0, -260, BW, 1700); c.fillStyle = 'rgba(0,0,0,.05)'; for (let y = -260; y < 1400; y += 160) for (let x = BX0 + ((y / 160) % 2) * 160; x < BX0 + BW; x += 320) c.fillRect(x, y, 160, 160);
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGK = mkBG(drawShop);

// the sign above the till: dark until C2, then CHOCOLATE 70% OFF lights up (with a short flicker)
function signDraw(c, t, L) { c.save(); c.translate(SIGNX * 0.2, SIGNY * 0.2); c.scale(0.8, 0.8); signBody(c, t, L); c.restore(); }
function signBody(c, t, L) { const on = reached(t, L, 'C2', 'sign'), u = t - ev('C2', 'sign'), fl = L === 'C2' && u < 0.35 ? (Math.floor(u * 20) % 2) : 1, lit = on && fl;
  c.strokeStyle = '#7A828A'; c.lineWidth = 8; c.beginPath(); c.moveTo(SIGNX - 250, SIGNY - 110); c.lineTo(SIGNX - 250, -2700); c.moveTo(SIGNX + 250, SIGNY - 110); c.lineTo(SIGNX + 250, -2700); c.stroke();
  if (lit) { const g = c.createRadialGradient(SIGNX, SIGNY, 50, SIGNX, SIGNY, 560); g.addColorStop(0, 'rgba(255,230,90,.55)'); g.addColorStop(1, 'rgba(255,230,90,0)'); c.fillStyle = g; c.fillRect(SIGNX - 600, SIGNY - 600, 1200, 1200); }
  c.fillStyle = '#1F2228'; rr(c, SIGNX - 340, SIGNY - 115, 680, 230, 22); c.fill();
  c.fillStyle = lit ? '#FFE15A' : '#2B2F3A'; rr(c, SIGNX - 320, SIGNY - 95, 640, 190, 14); c.fill();
  if (lit) { fitTxt(c, 'CHOCOLATE', SIGNX, SIGNY - 42, 76, '#C8283E', 590); fitTxt(c, '70% OFF', SIGNX, SIGNY + 42, 84, '#C8283E', 590);
    for (let k = 0; k < 14; k++) { const a = k / 14 * TAU; c.fillStyle = (Math.floor(t * 6) + k) % 2 ? '#FFFDF2' : '#F2C14E'; c.beginPath(); c.arc(SIGNX + Math.cos(a) * 330 * 1.03, SIGNY + Math.sin(a) * 118, 9, 0, TAU); c.fill(); } }
  else { c.strokeStyle = 'rgba(255,255,255,.08)'; c.lineWidth = 4; rr(c, SIGNX - 300, SIGNY - 75, 600, 150, 10); c.stroke(); } }

// ---------------- counter: belt with her groceries, the gift pile, the till, her bag with the sticker
function giftsAt(t, L) { return { choc1: reached(t, L, 'A1', 'gift'), tissue: reached(t, L, 'A1', 'gift') && (L !== 'A1' || t > ev('A1', 'gift') + 0.25), choc2: reached(t, L, 'A2', 'choc'), flower: reached(t, L, 'B1', 'flower') }; }
const popK = (t, at) => t < at + 0.3 ? eBack(clamp((t - at) / 0.3), 2) : 1;
function counter(c, t, L) {
  // top slab + belt
  paint(c, q => { q.m(TX0, CT - 40); q.l(TX1, CT - 40); q.l(TX1, CT + 30); q.l(TX0, CT + 30); q.z(); }, '#C9CFD6', { sd: 6, hd: 3, lw: 4 });
  c.fillStyle = '#2B2F3A'; rr(c, TX0 + 20, CT - 56, 640, 30, 12); c.fill(); c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 4; for (let x = TX0 + 40; x < TX0 + 650; x += 46) { const xx = x + ((t * 60) % 46) * (L === 'hook' ? 1 : 0); c.beginPath(); c.moveTo(xx, CT - 54); c.lineTo(xx, CT - 28); c.stroke(); }
  // front panel
  paint(c, q => { q.m(TX0 + 15, CT + 30); q.l(TX1 - 15, CT + 30); q.l(TX1 - 15, 0); q.l(TX0 + 15, 0); q.z(); }, '#2E7D5B', { sd: 10, hd: 4, lw: 4 });
  c.fillStyle = '#F2C14E'; c.fillRect(TX0 + 15, CT + 110, TX1 - TX0 - 30, 18); fitTxt(c, 'CHECKOUT 3', (TX0 + TX1) / 2, CT + 240, 64, '#FFFDF8', 600);
  // her groceries further along the belt
  c.save(); c.translate(420, CT - 56); paint(c, q => { q.m(-40, 0); q.l(40, 0); q.l(40, -150); q.l(0, -185); q.l(-40, -150); q.z(); }, '#FFFDF8', { sd: 6, hd: 3, lw: 3 }); c.fillStyle = '#3C8FE0'; c.fillRect(-40, -110, 80, 40); fitTxt(c, 'MILK', 0, -90, 26, '#FFFDF8', 70);
  c.translate(130, 0); paint(c, q => { q.m(-80, 0); q.q(-90, -90, 0, -95); q.q(90, -90, 80, 0); q.z(); }, '#D99A55', { sd: 6, hd: 3, lw: 3 }); c.strokeStyle = 'rgba(120,70,30,.5)'; c.lineWidth = 5; for (const x of [-40, 0, 40]) { c.beginPath(); c.moveTo(x - 14, -78); c.lineTo(x + 14, -50); c.stroke(); }
  c.translate(110, 0); for (const [x, y] of [[-20, -28], [24, -28], [2, -66]]) { c.fillStyle = '#5EA65A'; c.beginPath(); c.arc(x, y, 30, 0, TAU); c.fill(); } c.restore();
  // the till with its screen
  c.save(); c.translate(TILLX, CT - 40); c.fillStyle = '#3A3F4B'; rr(c, -110, -90, 220, 90, 12); c.fill(); c.fillStyle = '#596070'; rr(c, -12, -230, 24, 140, 6); c.fill();
  c.fillStyle = '#2B2F3A'; rr(c, -120, -360, 240, 150, 14); c.fill(); c.fillStyle = '#9CC8F0'; rr(c, -104, -346, 208, 122, 8); c.fill(); fitTxt(c, '£12.40', 0, -285, 44, '#1F2A44', 190);
  c.fillStyle = '#E0474C'; c.beginPath(); c.arc(-70, -45, 12, 0, TAU); c.fill(); c.restore();
  // her bag at the near end of the counter (with the sticker), once the hook is over
  if (L !== 'hook') { c.save(); c.translate(BAGX, CT - 40); bagDraw(c, 0.7, 1); c.restore(); }
  // comfort-gift pile
  const g = giftsAt(t, L);
  if (g.flower) { const k = L === 'B1' ? popK(t, ev('B1', 'flower')) : 1; c.save(); c.translate(PILEX + 170, CT - 70); c.scale(k, k); c.rotate(1.2); flowerDraw(c, 1.15); c.restore(); }
  if (g.choc1) { const k = L === 'A1' ? popK(t, ev('A1', 'gift')) : 1; c.save(); c.translate(PILEX, CT - 56); c.scale(k, k); chocDraw(c, 1.3); c.restore(); }
  if (g.tissue) { const k = L === 'A1' ? popK(t, ev('A1', 'gift') + 0.25) : 1; c.save(); c.translate(PILEX + 230, CT - 56); c.scale(k, k); tissueDraw(c, 1.3); c.restore(); }
  if (g.choc2) { const k = L === 'A2' ? popK(t, ev('A2', 'choc')) : 1; c.save(); c.translate(PILEX + 15, CT - 110); c.scale(k, k); chocDraw(c, 1.3, 0.1); c.restore(); }
}
const giftCount = (t, L) => { const g = giftsAt(t, L); return (g.choc1 ? 1 : 0) + (g.tissue ? 1 : 0) + (g.choc2 ? 1 : 0) + (g.flower ? 1 : 0); };
function lastGift(t, L) { let ch = -1; for (const [l, k, d] of [['A1', 'gift', 0.25], ['A2', 'choc', 0], ['B1', 'flower', 0]]) if (reached(t, L, l, k) && L === l) ch = ev(l, k) + d; return ch; }

// ---------------- characters
const gest = (st, g, who, t, side, base) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } };
const hang = (g, s) => reach(g, s, s * g.sw * 0.8, g.ySh + 330);
const chest = (g, s, k = 0.6) => reach(g, s, s * g.sw * k, g.ySh + 230);
const open = (g, s, k = 1.7) => reach(g, s, s * g.sw * k, g.ySh + 90, { planar: true });
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { t, talk: talk('her', t), mood: 'bored', turn: 0.3, look: 0.7, armL: hang(g, -1), armR: hang(g, 1), items: {} };
  if (L === 'hook') { st.armR = chest(g, 1, 0.75); st.items = { R: bagItem(t < hev('sticker') ? 0 : eBack(clamp((t - hev('sticker')) / 0.2), 2.4)) }; st.armL = hang(g, -1); }
  if (L === 'A1') { if (speaking('a1_h', t, 0.05, 0.3)) { gest(st, g, 'her', t, 1, 140); st.armL = open(g, -1, 1.4); } if (t > e('gift')) { st.lookY = 0.3; st.look = 0.9; } if (t > e('pat')) { st.lookY = 0; st.look = -0.4; st.turn = 0; } }
  if (L === 'A2') { if (speaking('a2_h', t, 0.05, 0.3)) { gest(st, g, 'her', t, 1, 120); } if (t > e('choc')) { st.lookY = 0.35; } }
  if (L === 'B1') { st.mood = 'neutral'; if (speaking('b1_h', t, 0.05, 0.3)) gest(st, g, 'her', t, 1, 140); if (t > endOf('b1_l')) st.mood = 'bored'; if (t > e('flower')) st.lookY = 0.35; }
  if (L === 'B2') { st.mood = 'neutral'; if (speaking('b2_h', t, 0.05, 0.3)) { st.armL = chest(g, -1, 0.25); st.armR = chest(g, 1, 0.25); } if (t > e('look')) { st.mood = 'bored'; st.blink = 1; } }
  if (L === 'C1') { st.mood = 'neutral'; if (speaking('c1_h', t, 0.05, 0.3)) gest(st, g, 'her', t, 1, 140); if (t > endOf('c1_h') + 0.3) st.mood = 'bored'; }
  if (L === 'C2') { st.turn = 0.4; st.look = 0.6;
    if (speaking('c2_h', t, 0.05, 0.1)) { st.mood = 'smug'; st.armL = chest(g, -1, 0.3); st.armR = reach(g, 1, g.sw * 1.6, g.ySh + 60 + Math.sin(t * 2) * 30); }
    if (t > endOf('c2_h') + 0.1) { st.mood = 'bored'; st.blink = 0; }
    if (t > e('sign') + 0.1) { st.mood = 'surprised'; st.lookY = -0.7; st.look = 0.9; }
    if (t > e('smile')) { st.mood = 'happy'; st.laugh = true; st.lookY = 0; st.look = 0.6; st.armL = open(g, -1, 2.0); st.armR = open(g, 1, 2.0); } }
  return st; }
function linState(t, L) { const g = G.cashier, e = k => ev(L, k), st = { t, talk: talk('cashier', t), mood: 'happy', turn: -0.35, look: -0.8, armL: hang(g, -1), armR: hang(g, 1), items: {}, afterTorso: cc => badge(cc, g) };
  const give = (at, item) => { const u = t - at; if (u > -0.3 && u < 0.35) { st.armL = reach(g, -1, PILEX - LX + 40, CT - 70); if (u < 0 && item) st.items.L = item; st.lookY = 0.3; } };
  if (L === 'hook') { st.lean = -0.6; st.tilt = -0.1; st.laugh = speaking('hook_l', t); st.armL = reach(g, -1, -g.sw * 2.0, g.ySh + 260); st.armR = hang(g, 1);
    const u = t - hev('sticker'); if (u > -0.3 && u < 0.3) st.armL = reach(g, -1, -g.sw * 2.4, g.ySh + 200); }
  if (L === 'A1') { if (speaking('a1_l', t, 0.05, 0.2)) { st.mood = 'worried'; st.armR = chest(g, 1, 0.2); } if (t > endOf('a1_l')) st.mood = 'worried'; give(e('gift'), chocItem); give(e('gift') + 0.25, null); }
  if (L === 'A2') { if (speaking('a2_l', t, 0.05, 0.2)) { st.mood = 'sad'; st.armL = chest(g, -1, 0.2); st.armR = chest(g, 1, 0.2); } if (t > endOf('a2_l')) st.mood = 'worried'; give(e('choc'), chocItem); }
  if (L === 'B1') { if (speaking('b1_l', t, 0.05, 0.2)) { st.laugh = true; gest(st, g, 'cashier', t, -1, 120); } give(e('flower'), flowerItem); }
  if (L === 'B2') { st.mood = 'neutral'; if (t > e('look')) { st.mood = 'surprised'; st.lookY = -1; st.look = 0.2; st.turn = 0.1; st.headY = -14; st.tilt = -0.14; st.armR = chest(g, 1, 0.3); } }
  if (L === 'C1') { st.mood = 'happy'; if (speaking('c1_l', t, 0.05, 0.6) || t > e('hope')) { st.mood = 'happy'; st.armL = chest(g, -1, 0.15); st.armR = chest(g, 1, 0.15); st.lookY = -0.15; } }
  if (L === 'C2') { st.mood = 'neutral'; if (speaking('c2_l', t, 0.05, 0.2)) { st.mood = 'surprised'; gest(st, g, 'cashier', t, -1, 120); }
    if (t > e('wait')) { st.mood = 'neutral'; st.blink = 0; st.armL = chest(g, -1, 0.3); st.armR = chest(g, 1, 0.3); }
    if (t > e('sign') + 0.1) { st.mood = 'surprised'; st.lookY = -0.9; st.turn = 0.2; st.look = 0.4; }
    if (t > e('smile') + 0.2) { st.mood = 'skeptical'; st.lookY = 0; st.turn = -0.35; st.look = -0.8; }
    if (t > endOf('c2_l2') + 0.1) { st.mood = 'happy'; st.armL = hang(g, -1); st.armR = hang(g, 1); } }
  return st; }
function grdState(t, L) { const g = G.guard, e = k => ev(L, k), st = { t, talk: 0, mood: 'neutral', turn: -0.3, look: -0.6, armL: chest(g, -1, 0.35), armR: chest(g, 1, 0.35), items: {}, afterTorso: cc => vest(cc, g), front: (cc, a) => capOn(cc, a, g) };
  if (L === 'hook' || L === 'A1' && t > e('gift')) { st.mood = 'worried'; }
  if (L === 'B2' && t > e('look') + 0.25) { st.mood = 'surprised'; st.lookY = -1; st.look = -0.2; st.turn = -0.1; st.headY = -14; st.tilt = 0.14; st.armL = hang(g, -1); st.armR = hang(g, 1); }
  if (L === 'C2' && t > e('smile')) { st.mood = 'happy'; st.laugh = true; }
  return st; }
function queueState(t, L, i, q) { const g = q.g, e = k => ev(L, k), st = { t, mood: 'neutral', turn: 0.3, look: 0.6, armL: hang(g, -1), armR: hang(g, 1), items: { L: basketItem } };
  if (L === 'hook') { st.mood = 'surprised'; }
  if ((L === 'A1' && t > e('gift')) || L === 'A2') { st.mood = 'worried'; }
  if (L === 'A1' && q.k === 'tom' && t > e('pat') - 0.1 && t < e('pat') + 1.6) { const tx = (HX - G.her.sw * 0.7 - q.x) / QS, ty = (G.her.ySh + 30) / QS + Math.sin(t * 14) * 8; st.armR = reach(g, 1, tx, ty); st.mood = 'worried'; st.turn = 0.4; }
  if (L === 'A1' && q.k === 'priya' && t > e('pat') + 0.2) { st.armR = chest(g, 1, 0.25); }
  if (L === 'B2' && t > e('look') + 0.4) { st.lookY = -1; st.look = 0.2; st.mood = 'surprised'; }
  if (L === 'C2' && t > e('sign') + 0.1) { st.lookY = -0.6; st.mood = 'surprised'; }
  if (L === 'C2' && t > e('smile') - 0.05) { st.mood = 'happy'; st.laugh = true; st.lookY = 0; st.armR = open(g, 1, 1.8); }
  return st; }

// ---------------- the world + which characters a shot draws (clean singles: only the tagged character)
const ALL = ['her', 'cashier', 'queue', 'guard'];
const DRAW = { wide: ALL, card: ALL, two: ALL, cover: ALL, all: ALL, her: ['her'], cashier: ['cashier'], queue: ['queue'], staff: ['cashier', 'guard'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const who = DRAW[tag] || ALL, heads = {};
  c.drawImage(BGK, BX0, BY0, BW, BH);
  if (tag !== 'card') signDraw(c, t, L);   // on the lesson-card shot the sign would only peek out next to the card
  if (who.includes('guard')) K.put(c, GRD, grdState(t, L), GX, 0);
  if (who.includes('cashier')) heads.cashier = K.put(c, LIN, linState(t, L), LX, 0);
  counter(c, t, L);
  const patting = L === 'A1' && t > ev('A1', 'pat') - 0.1 && t < ev('A1', 'pat') + 1.6;
  if (who.includes('queue')) for (const [i, q] of QUEUE.entries()) if (!(patting && q.k === 'tom')) K.put(c, q.cfg, queueState(t, L, i, q), q.x, 0, QS);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), HX, 0);
  if (who.includes('queue') && patting) { const q = QUEUE[2]; K.put(c, q.cfg, queueState(t, L, 2, q), q.x, 0, QS); }
  // hook: Linda's hand slaps the sticker on the bag (her close-up, Linda herself is off frame)
  if (L === 'hook' && tag === 'her') { const u = t - hev('sticker'); if (u > -0.25 && u < 0.35) { const hx = HX + G.her.sw * 0.75 + 30 + Math.max(0, -u) * 1400, hy = G.her.ySh + 230 + 280 * 0.95 - 112 * 0.95;
      c.save(); c.translate(hx, hy); c.fillStyle = '#2E7D5B'; rr(c, 60, -46, 420, 92, 40); c.fill(); paint(c, q => q.e(20, 0, 70, 58), '#F4D0B8', { sd: 8, hd: 4, lw: 4 }); c.restore(); } }
  K.mark(c, 'gifts', PILEX + 60, CT - 100, 140);
  if (!heads.cashier) heads.cashier = OFF; if (!heads.her) heads.her = OFFL;
  return heads; }
// B1 insert: Linda's phone with photos of her grandkids (English UI only), on a solid backdrop
function kid(c, x, y, s, hair, shirt, skin) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = shirt; rr(c, -60, 40, 120, 110, 40); c.fill(); c.fillStyle = skin; c.beginPath(); c.arc(0, 0, 52, 0, TAU); c.fill();
  c.fillStyle = hair; c.beginPath(); c.arc(0, -14, 54, Math.PI * 1.05, Math.PI * 1.95); c.fill(); c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(-18, 2, 6, 0, TAU); c.arc(18, 2, 6, 0, TAU); c.fill();
  c.strokeStyle = '#8A2E3E'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.arc(0, 16, 18, 0.3, Math.PI - 0.3); c.stroke(); c.restore(); }
function insert(c, t, view) { c.fillStyle = '#2E5A48'; c.fillRect(0, 0, W, HH); c.fillStyle = 'rgba(255,255,255,.06)'; for (let k = 0; k < 12; k++) c.fillRect(0, k * 180, W, 70);
  if (view === 'phone') { for (let k = 0; k < 5; k++) { const a = t * 2 + k * 1.3; c.fillStyle = '#F37BA8'; heartPath(c, 540 + Math.cos(a) * 470, 1000 + Math.sin(a * 1.3) * 700, 22 + 6 * Math.sin(a * 3)); c.fill(); }
    const u = t - ev('B1', 'phone'), k = eBack(clamp(u / 0.3), 1.8), sw = clamp((u - 0.8) / 0.25);
    K.phone(c, 540, 1000, 1.55 * k, (p, w, h) => { p.fillStyle = '#FFFFFF'; p.fillRect(0, 0, w, h); p.fillStyle = '#2E7D5B'; p.fillRect(0, 0, w, 90); fitTxt(p, 'Photos', w / 2, 52, 34, '#FFFFFF', 300);
      p.save(); p.translate(-sw * w, 0);
      for (const [pg, bg, a, b] of [[0, '#BFE3F5', ['#C8642E', '#F2C14E', '#F6D6BE'], ['#3A2820', '#3C8FE0', '#E8B896']], [1, '#F7D9E4', ['#1A1210', '#EF7FAA', '#B07A56'], ['#E8C27A', '#5E9E6E', '#F8DCC8']]]) {
        p.save(); p.translate(pg * w, 0); p.fillStyle = bg; rr(p, 24, 120, w - 48, 470, 20); p.fill(); p.fillStyle = '#8CC07A'; rr(p, 24, 470, w - 48, 120, 0); p.fill();
        p.fillStyle = '#FFF4B0'; p.beginPath(); p.arc(w - 90, 190, 40, 0, TAU); p.fill();
        kid(p, w / 2 - 80, 380, 1.15, a[0], a[1], a[2]); kid(p, w / 2 + 85, 400, 1.0, b[0], b[1], b[2]); p.restore(); }
      p.restore();
      p.fillStyle = '#E0474C'; heartPath(p, 70, 650, 26); p.fill(); fitTxt(p, 'My grandkids', w / 2 + 30, 650, 34, '#2B2F3A', 280);
      for (let i = 0; i < 2; i++) { p.fillStyle = i === (sw > 0.5 ? 1 : 0) ? '#2E7D5B' : '#C9CFD8'; p.beginPath(); p.arc(w / 2 - 14 + i * 28, 712, 8, 0, TAU); p.fill(); } }, -0.04);
  }
}

// ---------------- shots (world coordinates; face of a single at ~900 px)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const hHY = G.her.headY, lHY = G.cashier.headY, gHY = G.guard.headY;
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(-170, -1250, 0.6, 'cover'), WIDE: S(40, -1070, 0.42, 'wide'), CARD: S(60, -1400, 0.62, 'card'), TWO: S(60, -1300, 0.66, 'two'), GIFT: S(-200, -1150, 0.6, 'wide'),
  HER: S(HX + 40, fy(hHY, 1.0), 1.0, 'her'), HER_H: S(HX + 60, fy(hHY, 1.1, 720), 1.1, 'her'), STICK: S(HX + 110, fy(hHY, 1.15, 600), 1.15, 'her'),
  LIN: S(LX - 20, fy(lHY, 1.0), 1.0, 'cashier'), LIN_CU: S(LX - 60, fy(lHY, 1.35, 1000), 1.35, 'cashier'),
  QUEUE: S(-935, fy(QUEUE[1].g.headY * QS, 0.72, 980), 0.72, 'queue'), STAFF: S(880, fy((lHY + gHY) / 2, 0.72, 1150), 0.72, 'staff'), SIGN: S(560, -1820, 0.8, 'cashier'), LIN_SIGN: S(525, -1440, 0.75, 'cashier'),   // Linda single under the lit sign: sign top ~310 px, below the level bar and above her bubble
  ALL: S(0, -1000, 0.5, 'all'),
  PHONE: U('phone', 1) };
const C2Z = [1.0, 1.2, 1.4].map(z => S(HX + 40, fy(hHY, z, 940), z, 'her'));
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  const sp = id => speaking(id, t, 0.1, 0.15);
  if (L === 'hook') { if (t < hev('cu')) return SH.COVER; if (t < hev('deadpan') + 0.25) return f(SH.LIN_CU); if (t < hev('cover')) return f(SH.HER_H);
    const h = t - hev('cover'); if (h < 2.2) return f(SH.COVER); if (h < 3.5) return f(SH.QUEUE); if (h < 5.6) return f(SH.COVER); if (h < 6.9) return f(SH.STICK); if (h < 8.2) return f(SH.LIN); return f(SH.COVER); }
  const u = t - sc.s, l = L.toLowerCase(), nar = SP[l + '_nar'];
  if (u < 1.15) return f(SH.WIDE);
  if (nar && t >= nar.t - 0.1) return f(L === 'C2' ? SH.CARD : SH.CARD);
  if (L === 'A1' && t > e('gift') - 0.05) return f(SH.GIFT);
  if (L === 'A2' && t > e('choc') - 0.05) return f(SH.GIFT);
  if (L === 'B1' && t > e('phone') - 0.05 && t < e('flower') - 0.3) return f(SH.PHONE);
  if (L === 'B1' && t >= e('flower') - 0.3) return f(SH.GIFT);
  if (L === 'B2' && t > e('look') + 0.05) return f(SH.STAFF);
  if (L === 'C2') { if (sp('c2_h')) { const ch = (TL.cfg.chunks || {}).c2_h, p = SP.c2_h, w = p.words || [], cnt = ch.map(([en]) => en.trim().split(/\s+/).length), tot = cnt.reduce((a, b) => a + b, 0), chars = ch.map(([en]) => en.length), ctot = chars.reduce((a, b) => a + b, 0); let wi = 0, ci = 0, i = 0;
      ch.forEach((q, k) => { const a = w.length === tot ? p.t + w[wi][1] : p.t + p.d * ci / ctot; if (t >= a - 0.05) i = k; wi += cnt[k]; ci += chars[k]; }); return f(C2Z[i] || SH.HER); }
    if (t > endOf('c2_l') + 0.25 && t < e('sign') - 0.05) return f(SH.HER);
    if (t >= e('sign') - 0.05 && t < e('smile') - 0.05) return f(SH.SIGN);
    if (t >= e('smile') - 0.05 && t < SP.c2_l2.t - 0.1) return f(SH.ALL);
    if (t >= SP.c2_l2.t - 0.1 && t <= endOf('c2_l2') + 0.25) return f(SH.LIN_SIGN);
    if (t > endOf('c2_l2') + 0.25) return f(SH.ALL); }
  const cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.1 && t < s.t + s.d + 0.25);
  const single = who => who === 'her' ? SH.HER : SH.LIN;
  if (cur) return f(single(cur.who));
  const next = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.6 && t < s.t);
  if (next) return f(single(next.who));
  return SH.TWO; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud', 'slap']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- overlays: title ribbon, cover badge, gift counter
function title(c, t) { const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.translate(540, 470); c.rotate(-0.05); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -175 + 14, 980, 350, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -175, 980, 350, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 74, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -112);
  UI.textFit(c, 'Unb9', 150, lines[1][0], 900); UI.strokeText(c, lines[1][0], 0, 4, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 66, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 122); c.restore(); }
function coverBadge(c, t) { const p = 1 + 0.04 * Math.sin(t * 8); c.save(); c.translate(540, 1745); c.scale(p, p); c.rotate(-0.03); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -300 + 6, -60 + 10, 600, 120, 60); c.fill(); c.fillStyle = '#FFE15A'; rr(c, -300, -60, 600, 120, 60); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; rr(c, -300, -60, 600, 120, 60); c.stroke();
  fitTxt(c, 'CHEER UP, LOVE!', 0, 4, 56, '#E0474C', 540); c.restore(); }
function giftIcon(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#EF7FAA'; rr(c, -20, -12, 40, 32, 5); c.fill(); c.fillStyle = '#E0474C'; rr(c, -23, -20, 46, 12, 4); c.fill(); c.fillStyle = '#F2C14E'; c.fillRect(-4, -20, 8, 40);
  c.strokeStyle = '#F2C14E'; c.lineWidth = 5; c.beginPath(); c.ellipse(-9, -25, 9, 6, -0.4, 0, TAU); c.ellipse(9, -25, 9, 6, 0.4, 0, TAU); c.stroke(); c.restore(); }
const bubbleOn = t => TL.speech.some(s => s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.1 && t < s.t + s.d + 0.45);
function giftCounter(c, t, sc, tag) { const L = sc.id; if (L === 'outro' || L === 'hook') return; const nar = SP[L.toLowerCase() + '_nar'], u = t - sc.s;
  if (u < 1.2 || (nar && t > nar.t - 0.2) || tag.startsWith('ui:')) return;
  const n = giftCount(t, L); if (n === 0) return; const ch = lastGift(t, L);
  const since = t - ch, bump = since > 0 && since < 0.4 ? 1 + 0.3 * Math.sin(since / 0.4 * Math.PI) : 1, label = ch > 0 && since > 0.1 && since < 2.1 && !bubbleOn(t);
  const k = eBack(P(u, 1.2, 1.5), 1.6) * bump; const w = label ? 320 : 170, h = label ? 128 : 84;
  c.save(); c.translate(70, 1530); c.scale(k, k);
  c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, 6, 8, w, h, 22); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 5; rr(c, 0, 0, w, h, 22); c.fill(); c.stroke();
  const iy = label ? 88 : 42; giftIcon(c, 46, iy + 2, 1.15); UI.font(c, 'Unb9', 50); c.fillStyle = '#C23C4A'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(String(n), 92, iy + 2);
  if (label) { UI.textFit(c, 'Unb9', 32, 'УТЕШЕНИЯ', w - 40); c.fillStyle = C.oliveD; c.fillText('УТЕШЕНИЯ', 22, 34); }
  c.restore(); }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { const rows = [['A1', 'I okay! Normal face!'], ['A2', "I'm not sad, this is just my face."], ['B2', "I'm on cloud nine."], ['C1', "Where I'm from, people save their smiles for friends."]];
    K.outro(c, t, { q: ['А ТЕБЕ ГОВОРИЛИ', '"УЛЫБНИСЬ"?'], rows, cta: ['ОТПРАВЬ ТОМУ, У КОГО', 'ТОЖЕ СЕРЬЁЗНОЕ ЛИЦО'], heroX: 190, heroS: 0.42,
      hero: (cc, tt) => { const g = G.her, gd = G.cashier; K.put(cc, LIN, { t: tt, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, armL: reach(gd, -1, -gd.sw * 2.0, gd.ySh - 330 + Math.sin(tt * 8) * 30, { planar: true }), armR: hang(gd, 1), items: {}, afterTorso: cc2 => badge(cc2, gd) }, 1500, 60);
        K.put(cc, HER, { t: tt, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(tt * 8) * 30, { planar: true }), armR: hang(g, 1), items: {} }, 0, 0); } });
    // A1 phrase greyed out and struck through
    const u = t - SC.outro.s, kk = P(u, 1.35, 1.7); if (kk > 0) { const bh = 140 + rows.length * 115, y = 740 - bh / 2 + 150; UI.textFit(c, 'Nun9', 46, rows[0][1], 740); const wd = c.measureText(rows[0][1]).width;
      c.save(); c.globalAlpha = 0.55 * kk; c.fillStyle = C.white; c.fillRect(214, y - 34, wd + 16, 68); c.restore(); c.strokeStyle = C.red; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(212, y + 2); c.lineTo(212 + (wd + 16) * eOut(kk), y + 2); c.stroke(); }
    Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag.startsWith('ui:')) { insert(c, t, tag.slice(3)); heads = {}; proj = p => ({ x: -1e5, y: 0 }); Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26); }
  const names = { cashier: ['LINDA', '#2E7D5B'] };
  if (L === 'hook') { const cover = tag === 'cover'; if (cover) { title(c, t); if (t < SP.hook_l.t) coverBadge(c, t); }
    const hookProj = p => { const q = proj(p); return q.x < 0 || q.x > W ? { x: q.x < 0 ? 60 : W - 60, y: 1050 } : q; };
    K.bubbles(c, t, { id: 'hook' }, heads, hookProj, { cleanChunks: true, names, hold: { hook_l: 0.01 } }); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); UI.captions(c, t);
    Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  if (!tag.startsWith('ui:')) K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names, hold: { a1_h: 0.02, a1_l: 0.02, a2_h: 0.02, a2_l: 0.02, b1_h: 0.02, b1_l: 0.02, b2_h: 0.02, c1_h: 0.02, c1_l: 0.3, c2_h: 0.05, c2_l: 0.05, c2_l2: 0.05 } });
  giftCounter(c, t, sc, tag);
  K.hud(c, t, sc);
}
E.run('smile', NF, renderFrame);
