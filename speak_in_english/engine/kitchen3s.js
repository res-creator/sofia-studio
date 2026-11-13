// "Успей за 3 секунды: кухня" — rubric quick3s (USA, American English), hard_cut camera: node kitchen3s.js start end out.mp4 | --png=f1,f2
// An American kitchen: the fridge on the left with a cactus in a chef's hat on top (absurd detail — it sweats harder on every timer), the heroine
// in an apron, the kitchen table with the cat on a chair, the counter with the stove/oven and the upper cupboards on the right.
// Each round: the Russian word card + a 3-second ring timer (ticks, no voice) -> the tip voice says the English word (pink plate) -> a silent gag:
// r1 colander (she drains pasta through the colander on her head -> pasta wig), r2 grater (giant carrot -> pencil carrot), r3 ladle (soup for the
// cat in a bib with a spoon), r4 rolling pin (the dough slides off and covers the cat like a blanket), r5 oven mitt (the crocodile mitt snaps the
// tray of pies and won't give it back), r6 frying pan (the pancake sticks to the ceiling), bonus lid (a lid avalanche — knee-deep in lids),
// twist "Every lid... except the one I need.", score scale card, end screen (СКОЛЬКО ИЗ 6? 0–2 / 3–4 / 5–6, СОХРАНИ, ПОДПИСАТЬСЯ by the cursor).
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas, catChar, hash } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/kitchen3s/timeline.json', 'utf8'));
for (const s of TL.speech) if (s.who === 'tip') s.who = 'tipq';   // the tip voice is shown as our own pink answer plate, not as UI.captions / a bubble
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];
const ORDER = ['hook', 'r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'bonus', 'end', 'outro'], idx = L => ORDER.indexOf(L);
const after = (t, L, L0, k) => idx(L) > idx(L0) || (L === L0 && t > ev(L0, k));          // has the event k of scene L0 already happened?
{ const _bub = UI.bubble; UI.bubble = (ctx, sp, t, an, side, name) => _bub(ctx, sp.hold < 0.05 ? { ...sp, d: sp.d + sp.hold - 0.05 } : sp, t, an, side, name); }

// ---------------- cast
const HER = { ...BASE.her_lift };
const G = { her: geom(HER) }, g0 = G.her;
const HX = -250, HXT = 20, HXO = 900, HXB = 1100;               // her feet x: quiz spot / at the table / at the oven / under the lid cupboard
const FX0 = -1150, FX1 = -620, FT = -1900, CAX = -885;             // fridge + the cactus on top
const TX0 = 150, TX1 = 650, TT = -760, CATX = 745, SEAT = -470;    // table, the cat on a chair at its right end
const BOWLX = 585, POTX = 300;
const CX0 = 900, CX1 = 1900, CT = -820, TRAYX = 1380;              // counter + hob, tray of pies
const UY0 = -2250, UY1 = -1500, DOORS = [[950, 1250], [1250, 1550], [1550, 1850]];
const CEIL = -2750, PANX = -150;
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function apron(cc, g) { paint(cc, q => { q.m(-g.sw * 0.72, g.ySh + 40); q.l(g.sw * 0.72, g.ySh + 40); q.l(g.sw * 0.98, g.ySh + 600); q.l(-g.sw * 0.98, g.ySh + 600); q.z(); }, '#FFFDF8', { sd: 6, hd: 3, lw: 4 });
  cc.fillStyle = '#E0474C'; for (let i = 0; i < 4; i++) cc.fillRect(-g.sw * 0.72 - i * 8, g.ySh + 120 + i * 140, g.sw * 1.44 + i * 16, 14);
  cc.fillStyle = '#F2C14E'; rr(cc, -80, g.ySh + 300, 160, 100, 14); cc.fill(); }
const herCfg = HER;

// ---------------- props (local coords; items are drawn at the wrist, unrotated)
function colander(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s);   // (x,y) = rim centre, dome upwards
  paint(c, q => { q.m(-150, 0); q.q(-150, -150, 0, -155); q.q(150, -150, 150, 0); q.z(); }, '#C9D2DA', { sd: 6, hd: 3, lw: 5 });
  c.fillStyle = '#5A606E'; for (let r = 0; r < 3; r++) for (let i = -3 + r; i <= 3 - r; i++) { c.beginPath(); c.arc(i * 36, -30 - r * 38, 7, 0, TAU); c.fill(); }
  c.fillStyle = '#AEB8C2'; rr(c, -168, -12, 336, 22, 10); c.fill(); for (const sd of [-1, 1]) { c.fillStyle = '#8C96A2'; rr(c, sd * 168 + (sd < 0 ? -40 : 0), -20, 40, 18, 8); c.fill(); }
  c.restore(); }
// pasta wig: strands hanging from the colander rim along both sides of her face (never over the eyes)
function pastaWig(c, hd, t, k) { if (k <= 0) return; c.save(); c.strokeStyle = '#F2D06A'; c.lineCap = 'round'; c.lineWidth = 11;
  for (let i = 0; i < 16; i++) { const sd = i < 8 ? -1 : 1, j = i % 8, x0 = hd.x + sd * (hd.hw * 0.75 + j * 9), y0 = hd.y - hd.hh * 0.85, L = (hd.hh * (1.4 + 0.5 * hash(i))) * k;
    c.beginPath(); c.moveTo(x0, y0); for (let u = 0; u <= 1.001; u += 0.1) c.lineTo(x0 + sd * (hd.hw * 0.28 * u + Math.sin(u * 14 + i + t * 2) * 10), y0 + L * u); c.stroke(); }
  for (let i = 0; i < 7; i++) { const x0 = hd.x + (i - 3) * hd.hw * 0.24; c.beginPath(); c.moveTo(x0, hd.y - hd.hh * 0.9); c.quadraticCurveTo(x0 + 14, hd.y - hd.hh * 0.72, x0 - 6, hd.y - hd.hh * (0.58 + 0.06 * (i % 2))); c.stroke(); }
  c.restore(); }
function grater(c, s = 1) { c.save(); c.scale(s, s);   // (0,0) = handle (top), body downwards
  c.strokeStyle = '#5A606E'; c.lineWidth = 12; c.beginPath(); c.moveTo(-34, 30); c.quadraticCurveTo(0, -40, 34, 30); c.stroke();
  paint(c, q => { q.m(-45, 30); q.l(45, 30); q.l(70, 320); q.l(-70, 320); q.z(); }, '#C9D2DA', { sd: 5, hd: 2, lw: 4 });
  c.strokeStyle = '#6E7884'; c.lineWidth = 4; for (let r = 0; r < 7; r++) for (let i = -2; i <= 2; i++) { const y = 70 + r * 36, x = i * (18 + r * 1.5); c.beginPath(); c.arc(x, y, 7, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
  c.restore(); }
function carrot(c, len) { c.save();   // (0,0) = her hand, carrot points to screen-left (towards the grater)
  c.fillStyle = '#4FA04A'; for (const a of [-0.5, 0, 0.5]) { c.save(); c.translate(20, -4); c.rotate(a - 0.2); c.beginPath(); c.ellipse(40, 0, 44, 13, 0, 0, TAU); c.fill(); c.restore(); }
  paint(c, q => { q.m(10, -34); q.q(-len * 0.6, -26, -len, 0); q.q(-len * 0.6, 26, 10, 34); q.z(); }, '#F08A2C', { sd: 4, hd: 2, lw: 4 });
  c.strokeStyle = 'rgba(150,70,20,.5)'; c.lineWidth = 4; for (let x = -24; x > -len + 30; x -= 48) { c.beginPath(); c.moveTo(x, -18); c.lineTo(x - 12, -6); c.stroke(); }
  c.restore(); }
function ladle(c, rot = 0, soup = 0) { c.save(); c.rotate(rot);   // (0,0) = hand, handle down to the bowl
  c.strokeStyle = '#8C96A2'; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, -30); c.lineTo(70, 190); c.stroke();
  paint(c, q => { q.m(20, 190); q.q(70, 290, 130, 190); q.z(); }, '#B8C0CA', { sd: 4, hd: 2, lw: 4 }); if (soup > 0) { c.fillStyle = '#E8913A'; c.beginPath(); c.ellipse(75, 192, 52, 10, 0, 0, TAU); c.fill(); }
  c.restore(); }
function rollingPin(c, x0, x1) { c.save(); c.lineCap = 'round';   // horizontal pin from x0 to x1 (hands at both ends)
  c.strokeStyle = '#7A4E2E'; c.lineWidth = 22; c.beginPath(); c.moveTo(x0 - 40, 0); c.lineTo(x1 + 40, 0); c.stroke();
  paint(c, q => { q.m(x0 + 20, -34); q.l(x1 - 20, -34); q.q(x1, -34, x1, 0); q.q(x1, 34, x1 - 20, 34); q.l(x0 + 20, 34); q.q(x0, 34, x0, 0); q.q(x0, -34, x0 + 20, -34); q.z(); }, '#E2B47A', { sd: 5, hd: 2, lw: 4 }); c.restore(); }
function pan(c, cake) { c.save();   // (0,0) = hand on the handle, pan to the right
  c.strokeStyle = '#2B2F3A'; c.lineWidth = 22; c.lineCap = 'round'; c.beginPath(); c.moveTo(-10, 0); c.lineTo(130, -10); c.stroke();
  c.fillStyle = '#3A3F4C'; c.beginPath(); c.ellipse(270, -16, 150, 40, 0, 0, TAU); c.fill(); c.fillStyle = '#4C5260'; c.beginPath(); c.ellipse(270, -24, 128, 28, 0, 0, TAU); c.fill();
  if (cake) { c.fillStyle = '#F2C26A'; c.beginPath(); c.ellipse(270, -30, 100, 20, 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(180,110,40,.5)'; for (const [x, y] of [[240, -32], [290, -26], [310, -36]]) { c.beginPath(); c.ellipse(x, y, 12, 4, 0, 0, TAU); c.fill(); } }
  c.restore(); }
function pot(c, s = 1, lid = false, soup = false) { c.save(); c.scale(s, s);   // (0,0) = bottom centre
  paint(c, q => { q.m(-130, -200); q.l(130, -200); q.l(120, -10); q.q(120, 0, 100, 0); q.l(-100, 0); q.q(-120, 0, -120, -10); q.z(); }, '#C23C4A', { sd: 8, hd: 3, lw: 5 });
  c.fillStyle = '#9A2E3A'; rr(c, -150, -214, 300, 28, 12); c.fill(); for (const sd of [-1, 1]) { c.fillStyle = '#2B2F3A'; rr(c, sd * 150 + (sd < 0 ? -40 : 0), -180, 40, 20, 8); c.fill(); }
  if (soup) { c.fillStyle = '#E8913A'; c.beginPath(); c.ellipse(0, -200, 124, 14, 0, 0, TAU); c.fill(); }
  if (lid) { c.fillStyle = '#B8C0CA'; c.beginPath(); c.ellipse(0, -214, 150, 30, 0, Math.PI, TAU); c.fill(); c.fillStyle = '#2B2F3A'; rr(c, -24, -260, 48, 22, 8); c.fill(); }
  c.restore(); }
// a saucepan in her hand (bonus / end): handle from the hand, the pot to the right; never a lid
const saucepanItem = (ctx) => { ctx.save(); ctx.strokeStyle = '#2B2F3A'; ctx.lineWidth = 20; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(110, 10); ctx.stroke(); ctx.translate(250, 120); pot(ctx, 0.75); ctx.restore(); };
// the crocodile oven mitt: covers the hand, snout to the right; jaw 0..1 open; carries the tray when grab
function mitt(c, t, jaw, awake, grab, shake = 0) { c.save(); c.rotate(shake);
  if (grab) { c.save(); c.translate(250, 40); tray(c, 0.85); c.restore(); }
  const ja = jaw * 0.45;
  c.save(); c.rotate(ja * 0.35); paint(c, q => { q.m(-50, -10); q.q(-30, -70, 90, -62); q.l(250, -30); q.q(270, -18, 250, -6); q.l(40, 0); q.z(); }, '#5AAE5A', { sd: 5, hd: 2, lw: 4 });
  c.fillStyle = '#FFFFFF'; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(70 + i * 30, -6); c.lineTo(85 + i * 30, 14); c.lineTo(100 + i * 30, -6); c.fill(); }
  for (const ex of [40, 95]) { c.fillStyle = '#5AAE5A'; c.beginPath(); c.arc(ex, -66, 24, 0, TAU); c.fill(); c.strokeStyle = '#2E6B3A'; c.lineWidth = 4; c.stroke(); c.fillStyle = awake ? '#FFFFFF' : '#5AAE5A'; c.beginPath(); c.arc(ex, -68, 15, 0, TAU); c.fill();
    if (awake) { c.fillStyle = '#1A1014'; c.beginPath(); c.arc(ex + 4, -66, 7, 0, TAU); c.fill(); } else { c.strokeStyle = '#2E6B3A'; c.lineWidth = 5; c.beginPath(); c.moveTo(ex - 13, -66); c.quadraticCurveTo(ex, -58, ex + 13, -66); c.stroke(); } }
  c.restore();
  c.save(); c.rotate(-ja * 0.65); paint(c, q => { q.m(-50, 10); q.l(40, 10); q.l(240, 16); q.q(262, 26, 240, 44); q.q(90, 66, -30, 70); q.z(); }, '#4C9A4C', { sd: 5, hd: 2, lw: 4 });
  c.fillStyle = '#FFFFFF'; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(70 + i * 30, 16); c.lineTo(85 + i * 30, -2); c.lineTo(100 + i * 30, 16); c.fill(); } c.restore();
  c.fillStyle = '#F2C14E'; rr(c, -70, -30, 40, 110, 10); c.fill();   // cuff
  c.restore(); }
function tray(c, s = 1) { c.save(); c.scale(s, s); c.fillStyle = '#8C96A2'; rr(c, -170, -10, 340, 22, 6); c.fill();
  for (let i = 0; i < 5; i++) { c.fillStyle = '#E2A04A'; c.beginPath(); c.ellipse(-130 + i * 65, -12, 30, 26, 0, Math.PI, TAU); c.fill(); c.strokeStyle = '#B06A2A'; c.lineWidth = 3; c.stroke(); c.fillStyle = '#F2C26A'; c.beginPath(); c.ellipse(-136 + i * 65, -26, 10, 5, -0.3, 0, TAU); c.fill(); }
  c.restore(); }
function steam(c, t, x, y, k = 1, n = 3, sp = 40) { if (k <= 0) return; c.save(); c.lineWidth = 10; c.lineCap = 'round'; for (let i = 0; i < n; i++) { const u = (t * 0.8 + i / n) % 1; c.strokeStyle = `rgba(255,255,255,${0.75 * (1 - u) * k})`; c.beginPath(); c.moveTo(x + (i - (n - 1) / 2) * sp, y - u * 140); c.quadraticCurveTo(x + (i - (n - 1) / 2) * sp + 24 * Math.sin(t * 3 + i), y - u * 140 - 40, x + (i - (n - 1) / 2) * sp, y - u * 140 - 80); c.stroke(); } c.restore(); }
function heart(c, x, y, s, col) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.beginPath(); c.moveTo(0, 30); c.bezierCurveTo(-60, -10, -40, -60, 0, -30); c.bezierCurveTo(40, -60, 60, -10, 0, 30); c.fill(); c.restore(); }
function chefHat(c, x, y, s = 1, col = '#FFFFFF') { c.save(); c.translate(x, y); c.scale(s, s);
  paint(c, q => { q.m(-70, 0); q.l(70, 0); q.l(70, -60); q.q(120, -70, 110, -120); q.q(100, -170, 40, -150); q.q(20, -200, -20, -180); q.q(-60, -190, -80, -150); q.q(-130, -150, -120, -100); q.q(-110, -70, -70, -60); q.z(); }, col, { sd: 4, hd: 2, lw: 4 });
  c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 4; for (const dx of [-35, 0, 35]) { c.beginPath(); c.moveTo(dx, -6); c.lineTo(dx, -56); c.stroke(); } c.restore(); }

// ---------------- the kitchen (prerendered, softly blurred); fridge, cactus, table, cat, counter, cupboard door, props, people are live
const BX0 = -2600, BY0 = -4300, BW = 5800, BH = 4900, BS = 0.5;
function drawKitchen(c) {
  c.fillStyle = '#FBEFD9'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = 'rgba(242,193,78,.18)'; for (let x = BX0; x < BX0 + BW; x += 240) c.fillRect(x, CEIL, 110, -CEIL);   // wallpaper stripes
  // ceiling (everything above CEIL), cornice + a pendant lamp
  c.fillStyle = '#F4F1EC'; c.fillRect(BX0, BY0, BW, CEIL - BY0); c.fillStyle = 'rgba(0,0,0,.05)'; for (let y = CEIL - 300; y > BY0; y -= 300) c.fillRect(BX0, y, BW, 8);
  c.fillStyle = '#E9DCC6'; c.fillRect(BX0, CEIL - 10, BW, 50);
  c.strokeStyle = '#5A606E'; c.lineWidth = 8; c.beginPath(); c.moveTo(420, CEIL + 40); c.lineTo(420, -2380); c.stroke(); c.fillStyle = '#2E8A7A'; c.beginPath(); c.moveTo(300, -2240); c.quadraticCurveTo(420, -2460, 540, -2240); c.closePath(); c.fill(); c.fillStyle = '#FFF4C8'; c.beginPath(); c.ellipse(420, -2240, 70, 18, 0, 0, TAU); c.fill();
  // window (behind her and the table): a US street — a yellow school bus and a fire hydrant
  c.fillStyle = '#FFFFFF'; rr(c, -400, -2170, 840, 880, 16); c.fill(); const gg = c.createLinearGradient(0, -2140, 0, -1320); gg.addColorStop(0, '#BFE3F5'); gg.addColorStop(1, '#E4F2F8'); c.fillStyle = gg; c.fillRect(-370, -2140, 780, 820);
  c.fillStyle = '#C9D2DA'; c.fillRect(-370, -1560, 780, 240); c.fillStyle = '#A8B4C0'; for (let x = -340; x < 400; x += 200) c.fillRect(x, -1900, 140, 340);
  c.fillStyle = '#F2B33D'; rr(c, -300, -1520, 460, 150, 18); c.fill(); c.fillStyle = '#2B2F3A'; for (let x = -270; x < 130; x += 90) c.fillRect(x, -1500, 60, 50); c.fillStyle = '#2B2F3A'; for (const x of [-220, 80]) { c.beginPath(); c.arc(x, -1370, 26, 0, TAU); c.fill(); }
  c.fillStyle = '#E0474C'; rr(c, 300, -1440, 50, 110, 10); c.fill(); rr(c, 285, -1450, 80, 26, 8); c.fill();
  c.fillStyle = '#FFFFFF'; c.fillRect(10, -2140, 20, 820); c.fillRect(-370, -1740, 780, 20); c.fillStyle = '#F4D7E0'; rr(c, -440, -2200, 120, 940, 20); c.fill(); rr(c, 360, -2200, 120, 940, 20); c.fill();
  c.fillStyle = '#E9DCC6'; c.fillRect(-430, -1300, 900, 40);
  // a wall clock + a framed recipe card (left of the window)
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(-540, -2380, 90, 0, TAU); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 10; c.stroke(); c.lineWidth = 8; c.beginPath(); c.moveTo(-540, -2380); c.lineTo(-540, -2440); c.moveTo(-540, -2380); c.lineTo(-500, -2380); c.stroke();
  // splashback tiles + upper cupboards (the doors are live)
  c.fillStyle = '#CFE3E0'; c.fillRect(CX0 - 20, UY1, CX1 - CX0 + 1200, CT - UY1); c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 5; for (let y = UY1; y < CT; y += 70) { c.beginPath(); c.moveTo(CX0 - 20, y); c.lineTo(CX1 + 1200, y); c.stroke(); } for (let x = CX0 - 20; x < CX1 + 1200; x += 70) { c.beginPath(); c.moveTo(x, UY1); c.lineTo(x, CT); c.stroke(); }
  c.fillStyle = '#5E8FB0'; c.fillRect(CX0 + 30, UY0 - 30, CX1 - CX0 + 1100, 30);
  // range hood over the hob
  c.fillStyle = '#B8C0CA'; c.beginPath(); c.moveTo(1880 + 80, UY0); c.lineTo(2120 + 80, UY0); c.lineTo(2240 + 80, -1420); c.lineTo(1760 + 80, -1420); c.fill();
  // floor (checkerboard)
  c.fillStyle = '#E9DCC6'; c.fillRect(BX0, -40, BW, BY0 + BH + 40); c.fillStyle = 'rgba(94,143,176,.18)'; for (let y = -40; y < BY0 + BH; y += 140) for (let x = BX0 + (((y + 40) / 140) % 2) * 140; x < BX0 + BW; x += 280) c.fillRect(x, y, 140, 140);
  c.fillStyle = '#C9B896'; c.fillRect(BX0, -60, BW, 30);
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGK = mkBG(drawKitchen);

// ---------------- live props
const lvl = (t, L) => L === 'hook' ? 0.4 : L === 'bonus' || L === 'end' || L === 'outro' ? 7 : +L.slice(1);
const timerOn = (t, L) => t >= ev(L, 'tm0') && t < ev(L, 'tm1');
function fridge(c, t) {
  paint(c, q => { q.m(FX0, 0); q.l(FX1, 0); q.l(FX1, FT); q.l(FX0, FT); q.z(); }, '#E9EEF2', { sd: 8, hd: 3, lw: 5 });
  c.strokeStyle = '#9AA6B2'; c.lineWidth = 6; c.beginPath(); c.moveTo(FX0, -1250); c.lineTo(FX1, -1250); c.stroke();
  c.fillStyle = '#8C96A2'; rr(c, FX1 - 70, -1700, 26, 360, 12); c.fill(); rr(c, FX1 - 70, -1150, 26, 420, 12); c.fill();
  // magnets: a star, a heart, a kid's drawing, a list "MILK / EGGS"
  heart(c, -1030, -1640, 1.0, '#EE5E9A'); UI.star(c, -940, -1720, 34, 0.2); c.fillStyle = C.gold; c.fill();
  c.fillStyle = '#FFFFFF'; c.save(); c.translate(-960, -1020); c.rotate(-0.06); rr(c, -110, -140, 220, 280, 8); c.fill(); fitTxt(c, 'MILK', 0, -80, 44, '#2B2F3A', 180, 'Cav7'); fitTxt(c, 'EGGS', 0, -20, 44, '#2B2F3A', 180, 'Cav7'); fitTxt(c, 'LID ?!', 0, 40, 44, '#E0474C', 180, 'Cav7'); c.restore();
  c.fillStyle = '#E0474C'; c.beginPath(); c.arc(-960, -1160, 14, 0, TAU); c.fill();
  c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(FX0 + 10, -20, FX1 - FX0 - 20, 20); }
// the cactus in a chef's hat (on the fridge); it sweats harder with every round, most during the timer
function cactus(c, t, L) { const lv = lvl(t, L), on = timerOn(t, L), nerv = clamp(lv / 7) * (on ? 1 : 0.45), sh = on ? Math.sin(t * 40) * 3 * nerv : 0;
  c.save(); c.translate(CAX + sh, FT);
  // the puddle grows round by round
  if (lv >= 1) { c.fillStyle = 'rgba(124,199,242,.6)'; c.beginPath(); c.ellipse(60, -4, 40 + lv * 26, 9 + lv * 1.5, 0, 0, TAU); c.fill(); }
  paint(c, q => { q.m(-85, 0); q.l(85, 0); q.l(105, -150); q.l(-105, -150); q.z(); }, '#D9764A', { sd: 5, hd: 2, lw: 4 }); c.fillStyle = '#C0623A'; rr(c, -115, -172, 230, 36, 10); c.fill();
  paint(c, q => { q.m(-60, -165); q.q(-70, -470, 0, -480); q.q(70, -470, 60, -165); q.z(); }, '#5AAE5A', { sd: 5, hd: 2, lw: 4 });
  paint(c, q => { q.m(-50, -290); q.q(-130, -290, -120, -390); q.q(-110, -420, -88, -390); q.q(-88, -330, -50, -330); q.z(); }, '#5AAE5A', { sd: 3, hd: 1, lw: 4 });
  paint(c, q => { q.m(50, -320); q.q(130, -320, 122, -410); q.q(110, -440, 88, -410); q.q(88, -360, 50, -360); q.z(); }, '#5AAE5A', { sd: 3, hd: 1, lw: 4 });
  c.strokeStyle = 'rgba(40,90,40,.55)'; c.lineWidth = 3; for (const [x, y] of [[-30, -230], [25, -260], [-35, -200], [30, -205], [-100, -370], [100, -390], [0, -200]]) { c.beginPath(); c.moveTo(x - 7, y - 7); c.lineTo(x + 7, y + 7); c.moveTo(x + 7, y - 7); c.lineTo(x - 7, y + 7); c.stroke(); }
  // face: worried eyes + brows (more worried the more it sweats)
  for (const sd of [-1, 1]) { c.fillStyle = '#FFFFFF'; c.beginPath(); c.ellipse(sd * 24, -380, 15, 18, 0, 0, TAU); c.fill(); c.fillStyle = '#1A1014'; c.beginPath(); c.arc(sd * 24 + (on ? Math.sin(t * 6) * 4 : 0), -376, 8, 0, TAU); c.fill();
    c.strokeStyle = '#2E5A2E'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(sd * 10, -404 - 10 * nerv); c.lineTo(sd * 40, -408 + 8 * nerv); c.stroke(); }
  c.strokeStyle = '#2E5A2E'; c.lineWidth = 5; c.beginPath(); if (nerv > 0.4) { c.moveTo(-14, -340); c.quadraticCurveTo(0, -352, 14, -340); } else { c.moveTo(-14, -346); c.quadraticCurveTo(0, -336, 14, -346); } c.stroke();
  chefHat(c, 0, -470, 0.85);
  // sweat: drops running down + flying off during the timer
  const nd = Math.round(1 + lv * 1.3);
  for (let i = 0; i < nd; i++) { const sp = 0.6 + hash(i * 7.3) * 0.5, u = (t * sp * (on ? 1.8 : 0.8) + hash(i * 3.1)) % 1, sd = i % 2 ? 1 : -1, x = sd * (40 + hash(i) * 30), y = -440 + u * 300;
    c.fillStyle = '#7CC7F2'; c.strokeStyle = '#2E7AB0'; c.lineWidth = 3; c.globalAlpha = 1 - u * 0.6; c.beginPath(); c.moveTo(x, y - 18); c.quadraticCurveTo(x + 11, y, x, y + 8); c.quadraticCurveTo(x - 11, y, x, y - 18); c.fill(); c.stroke(); }
  if (on) for (let i = 0; i < Math.round(lv * 1.5); i++) { const u = (t * 2.2 + i / (lv * 1.5)) % 1, a = -Math.PI / 2 + (i % 2 ? 1 : -1) * (0.6 + hash(i) * 0.6), r = 80 + u * 160; c.globalAlpha = 1 - u; c.fillStyle = '#7CC7F2'; c.beginPath(); c.arc(Math.cos(a) * r, -400 + Math.sin(a) * r * 0.6 + u * u * 140, 9, 0, TAU); c.fill(); }
  c.globalAlpha = 1; c.restore(); K.mark(c, 'cactus', CAX, FT - 300, 230); }
// table + the soup pot / dough / grated carrot on it
function doughState(t, L) { // returns {w, x, slide} : slide 0..1 = sliding off the right edge onto the cat
  if (idx(L) < idx('r4')) return null; if (L === 'r4' && t < ev('r4', 'gag')) return { w: 220, x: 360, slide: 0 };
  if (L !== 'r4') return { slide: 1 }; const u = t - ev('r4', 'gag'); return { w: lerp(220, 520, eOut(clamp(u / 1.0))), x: 360, slide: eIn(clamp((u - 1.0) / 0.4)) }; }
function table(c, t, L) {
  c.fillStyle = '#A0703E'; for (const x of [TX0 + 40, TX1 - 60]) c.fillRect(x, TT, 26, -TT);
  paint(c, q => { q.m(TX0 - 20, TT); q.l(TX1 + 20, TT); q.l(TX1 + 20, TT + 40); q.l(TX0 - 20, TT + 40); q.z(); }, '#C08A50', { sd: 5, hd: 2, lw: 4 });
  c.fillStyle = 'rgba(224,71,76,.85)'; for (let i = 0; i < 6; i++) c.fillRect(TX0 - 20 + i * 90, TT - 4, 45, 8);
  // the cat's bowl
  c.fillStyle = '#7FB0D8'; c.beginPath(); c.moveTo(BOWLX - 70, TT - 50); c.lineTo(BOWLX + 70, TT - 50); c.quadraticCurveTo(BOWLX + 60, TT, BOWLX, TT); c.quadraticCurveTo(BOWLX - 60, TT, BOWLX - 70, TT - 50); c.fill();
  const full = L === 'r3' ? clamp((t - ev('r3', 'gag') - 0.35) / 0.6) * (1 - clamp((t - ev('r3', 'gag') - 1.3) / 0.6)) : 0;
  if (full > 0) { c.fillStyle = '#E8913A'; c.beginPath(); c.ellipse(BOWLX, TT - 50, 66 * full, 10, 0, 0, TAU); c.fill(); }
  // grated carrot bowl (r2 gag only)
  if (L === 'r2' && t > ev('r2', 'gag')) { const k = clamp((t - ev('r2', 'gag') - 0.1) / 1.4); c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(150, TT - 60); c.lineTo(330, TT - 60); c.quadraticCurveTo(310, TT, 240, TT); c.quadraticCurveTo(170, TT, 150, TT - 60); c.fill(); c.strokeStyle = '#C9C3B6'; c.lineWidth = 3; c.stroke();
    c.fillStyle = '#F08A2C'; c.beginPath(); c.ellipse(240, TT - 62, 86, 10 + 70 * k, 0, Math.PI, TAU); c.fill(); }
  // the soup pot (r3)
  if (L === 'r3') { c.save(); c.translate(POTX, TT); pot(c, 0.75, false, true); c.restore(); steam(c, t, POTX, TT - 190, 1); }
  const d = doughState(t, L); if (d && d.slide < 1) { c.save(); c.translate(d.x + d.slide * 200, TT - 8); c.rotate(d.slide * 0.5); c.fillStyle = '#F7E3B0'; c.strokeStyle = '#D9B870'; c.lineWidth = 4; c.beginPath(); c.ellipse(0, 0, d.w / 2, 16, 0, 0, TAU); c.fill(); c.stroke(); c.restore(); } }
function chair(c) { c.fillStyle = '#7A4E2E'; c.fillRect(CATX - 120, SEAT, 20, -SEAT); c.fillRect(CATX + 100, SEAT, 20, -SEAT); c.fillRect(CATX + 100, SEAT - 520, 22, 520); c.fillRect(CATX + 30, SEAT - 520, 92, 22);
  paint(c, q => { q.m(CATX - 140, SEAT); q.l(CATX + 140, SEAT); q.l(CATX + 140, SEAT + 34); q.l(CATX - 140, SEAT + 34); q.z(); }, '#A0703E', { sd: 4, hd: 2, lw: 4 }); }
// the cat (catChar, small) on the chair at the table end: bored -> bib + spoon (r3) -> eats -> covered by the dough blanket (r4 ->)
function cat(c, t, L, heads) { const S = 0.4, bib = idx(L) >= idx('r3'), cov = after(t, L, 'r4', 'gag') && (L !== 'r4' || t > ev('r4', 'gag') + 1.35);
  const st = { t, mood: 'bored', turn: -0.5, look: -0.9, armL: { a: 0.5, b: 1.6 }, armR: { a: 0.3, b: 0.5 }, items: {} };
  if (L === 'hook' || L === 'r1' || L === 'r2') { st.mood = 'bored'; if (L === 'r2' && t > ev('r2', 'gag') + 1.5) st.mood = 'shock'; }
  if (bib) { st.outfit = (cc, br) => { paint(cc, q => { q.m(-120, -560 + br); q.l(120, -560 + br); q.q(150, -340, 0, -300); q.q(-150, -340, -120, -560 + br); q.z(); }, '#FFFFFF', { sd: 6, hd: 3, inner: k => { k.fillStyle = '#EE5E9A'; for (let i = 0; i < 5; i++) { k.beginPath(); k.arc(-60 + i * 30, -420 + (i % 2) * 40, 9, 0, TAU); k.fill(); } } }); };
    st.items = { R: cc => { cc.save(); cc.rotate(-0.4); cc.fillStyle = '#C9D2DA'; cc.fillRect(-8, -150, 16, 170); cc.beginPath(); cc.ellipse(0, -170, 26, 40, 0, 0, TAU); cc.fill(); cc.restore(); } };
    st.armR = { a: 2.4, b: 1.2 }; st.mood = 'happy'; }
  if (L === 'r3' && t > ev('r3', 'gag') + 1.2) { st.mood = 'happy'; st.armR = { a: 2.0 + Math.sin(t * 14) * 0.25, b: 1.6 }; }
  if (L === 'r4' && !cov) st.mood = t > ev('r4', 'gag') + 0.9 ? 'shock' : 'happy';
  c.save(); c.translate(CATX, SEAT); c.scale(S, S); catChar(c, st); c.restore();
  heads.cat = { x: CATX, y: SEAT - 760 * S, hh: 210 * S };
  if (cov) { // the dough blanket over the cat: ears + eyes peek out
    const u = L === 'r4' ? clamp((t - ev('r4', 'gag') - 1.35) / 0.25) : 1; c.save(); c.translate(CATX, SEAT); c.scale(1, lerp(0.6, 1, eOut(u)));
    paint(c, q => { q.m(-170, 10); q.q(-190, -230, -110, -300); q.q(-60, -330, -40, -300); q.q(0, -330, 40, -300); q.q(60, -330, 110, -300); q.q(190, -230, 170, 10); q.q(0, 40, -170, 10); q.z(); }, '#F7E3B0', { sd: 6, hd: 3, lw: 4 });
    c.fillStyle = '#E9CF8E'; for (const [x, y] of [[-80, -120], [40, -180], [90, -60], [-30, -40]]) { c.beginPath(); c.ellipse(x, y, 14, 8, 0.4, 0, TAU); c.fill(); }
    // eyes peeking from the gap
    c.fillStyle = '#3A2E2A'; rr(c, -80, -270, 160, 40, 20); c.fill(); const sleepy = L !== 'r4' || t > ev('r4', 'gag') + 2.0;
    for (const sd of [-1, 1]) { if (sleepy) { c.strokeStyle = '#F4FA9A'; c.lineWidth = 5; c.beginPath(); c.moveTo(sd * 36 - 14, -250); c.quadraticCurveTo(sd * 36, -242, sd * 36 + 14, -250); c.stroke(); } else { c.fillStyle = '#F4FA9A'; c.beginPath(); c.arc(sd * 36, -250, 13, 0, TAU); c.fill(); c.fillStyle = '#1A1014'; c.beginPath(); c.arc(sd * 36, -250, 5, 0, TAU); c.fill(); } }
    c.restore(); }
  K.mark(c, 'cat', CATX, SEAT - 250, 170); }
function counter(c, t, L) {
  paint(c, q => { q.m(CX0, CT); q.l(CX1 + 1100, CT); q.l(CX1 + 1100, -40); q.l(CX0, -40); q.z(); }, '#5E8FB0', { sd: 8, hd: 3, lw: 4 });
  c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 5; for (const x of [CX0 + 300, 1700, 2300, 2700]) { c.beginPath(); c.moveTo(x, CT + 50); c.lineTo(x, -40); c.stroke(); }
  c.fillStyle = '#E9DCC6'; rr(c, CX0 - 20, CT - 10, CX1 - CX0 + 1140, 60, 10); c.fill();
  // oven (with the window + a dial in Fahrenheit) under the hob
  c.fillStyle = '#2B2F3A'; rr(c, 1180, CT + 90, 440, 600, 18); c.fill(); c.fillStyle = '#4C5260'; rr(c, 1220, CT + 220, 360, 300, 14); c.fill(); c.fillStyle = 'rgba(242,161,78,.45)'; rr(c, 1240, CT + 240, 320, 260, 10); c.fill();
  c.fillStyle = '#C9D2DA'; rr(c, 1230, CT + 140, 340, 24, 10); c.fill(); c.fillStyle = '#F7F2E8'; rr(c, 1420, CT + 60, 150, 50, 10); c.fill(); fitTxt(c, '350°F', 1495, CT + 86, 30, '#E0474C', 130);
  // hob: two burners
  for (const x of [1270, 1530]) { c.fillStyle = '#2B2F3A'; c.beginPath(); c.ellipse(x, CT - 12, 100, 16, 0, 0, TAU); c.fill(); }
  // the tray of pies (on the hob until the crocodile mitt takes it)
  if (!after(t, L, 'r5', 'gag') || (L === 'r5' && t < ev('r5', 'gag') + 0.45)) { c.save(); c.translate(TRAYX, CT - 22); tray(c, 1); c.restore(); steam(c, t, TRAYX, CT - 80, 0.8, 4, 70); }
  // utensil pot + a knife block on the counter
  c.fillStyle = '#F2C14E'; rr(c, 960, CT - 160, 110, 160, 14); c.fill(); c.strokeStyle = '#8C96A2'; c.lineWidth = 12; c.lineCap = 'round'; for (const [a, b] of [[985, -1130], [1015, -1150], [1045, -1110]]) { c.beginPath(); c.moveTo(a, CT - 150); c.lineTo(a + (a - 985) * 0.3, b); c.stroke(); }
}
// upper cupboards: the lid cupboard (left door) bursts open in the bonus
function cupboards(c, t, L) { const op = after(t, L, 'bonus', 'open') ? eOut(clamp((t - (L === 'bonus' ? ev('bonus', 'open') : -9)) / 0.25)) : 0;
  DOORS.forEach(([a, b], i) => { if (i === 0 && op > 0) { c.fillStyle = '#3A3F4C'; c.fillRect(a, UY0, b - a, UY1 - UY0);
      // remaining lids stacked inside (fewer as they fall)
      const left = L === 'bonus' ? 1 - clamp((t - ev('bonus', 'fall')) / 1.0) : 0; for (let k = 0; k < Math.round(8 * left); k++) { c.fillStyle = ['#B8C0CA', '#E0474C', '#7FB0D8', '#F2C14E'][k % 4]; c.beginPath(); c.ellipse((a + b) / 2, UY1 - 40 - k * 80, 120, 26, 0, 0, TAU); c.fill(); }
      const dw = (b - a) * (1 - op * 0.82); c.save(); paint(c, q => { q.m(a, UY0 - 10); q.l(a - dw * 0.15, UY0 - 30); q.l(a - dw * 0.15, UY1 + 30); q.l(a, UY1 + 10); q.z(); }, '#F7F2E8', { sd: 4, hd: 2, lw: 4 }); c.restore(); return; }
    paint(c, q => { q.m(a + 8, UY0); q.l(b - 8, UY0); q.l(b - 8, UY1); q.l(a + 8, UY1); q.z(); }, '#F7F2E8', { sd: 5, hd: 2, lw: 4 });
    c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 5; rr(c, a + 40, UY0 + 40, b - a - 80, UY1 - UY0 - 80, 12); c.stroke(); c.fillStyle = '#8C96A2'; rr(c, i === 0 ? b - 60 : a + 40, UY1 - 150, 18, 90, 8); c.fill();
    if (i === 0 && L === 'bonus' && t > ev('bonus', 'tm1') && t < ev('bonus', 'open')) { const w = Math.sin(t * 50) * 4; c.save(); c.translate(w, 0); c.restore(); } });
  // the door rattles while she reaches for it
  if (L === 'bonus' && t < ev('bonus', 'open') && t > ev('bonus', 'tip')) { c.strokeStyle = '#2B2F3A'; c.lineWidth = 6; for (let i = 0; i < 3; i++) { const y = UY0 + 200 + i * 180, x = DOORS[0][1] + 30 + Math.sin(t * 40 + i) * 6; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 40, y - 10); c.stroke(); } } }
// the lid avalanche: lids fall from the cupboard and pile up around her (knee-deep); the pile is drawn in front of her
const LIDS = Array.from({ length: 64 }, (_, i) => { const tx = HXB + (hash(i * 3.7) - 0.5) * 760 * (0.4 + 0.6 * hash(i * 1.3)), d = Math.abs(tx - HXB) / 380, top = 700 * Math.exp(-d * d * 1.1);
  return { i, tx, ty: -top * (0.3 + 0.7 * hash(i * 5.1)), t0: 0.0 + i * 0.019 + hash(i * 9.1) * 0.25, r: 70 + hash(i * 2.2) * 70, rot: (hash(i * 4.4) - 0.5) * 0.9, col: ['#B8C0CA', '#E0474C', '#7FB0D8', '#F2C14E', '#C9D2DA', '#4CAF6A', '#2B2F3A'][i % 7], x0: 1000 + hash(i * 6.6) * 200, y0: UY1 - 100 - hash(i) * 400 }; }).sort((a, b) => a.ty - b.ty < 0 ? 1 : -1);
function lid(c, x, y, r, rot, col) { c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = col; c.beginPath(); c.ellipse(0, 0, r, r * 0.3, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 4; c.stroke();
  c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(-r * 0.3, -r * 0.08, r * 0.35, r * 0.07, 0, 0, TAU); c.fill(); c.fillStyle = '#2B2F3A'; rr(c, -18, -r * 0.3 - 18, 36, 22, 8); c.fill(); c.restore(); }
function lidPile(c, t, L) { if (!after(t, L, 'bonus', 'fall')) return; const u = L === 'bonus' ? t - ev('bonus', 'fall') : 99;
  for (const d of LIDS) { const v = u - d.t0; if (v < 0) continue; const T = 0.42, k = clamp(v / T);
    const x = lerp(d.x0, d.tx, k), y = lerp(d.y0, d.ty, k * k) - (k >= 1 ? Math.max(0, Math.sin(clamp((v - T) / 0.2) * Math.PI)) * 40 : 0); lid(c, x, y, d.r, d.rot + (1 - k) * 3 * (d.i % 2 ? 1 : -1), d.col); } }
// the pancake on the ceiling (r6 ->)
function pancakeCeil(c, t, L) { if (!after(t, L, 'r6', 'gag') || (L === 'r6' && t < ev('r6', 'gag') + 0.75)) return; const sw = Math.sin(t * 1.6) * 0.04;
  c.save(); c.translate(PANX + 270, CEIL + 34); c.rotate(sw); c.strokeStyle = 'rgba(201,139,58,.6)'; c.lineWidth = 8; for (const a of [-2.6, -2.2, -0.9, -0.5]) { c.beginPath(); c.moveTo(Math.cos(a) * 190, -6); c.lineTo(Math.cos(a) * 250, -16); c.stroke(); } c.fillStyle = '#F2C26A'; c.beginPath(); c.ellipse(0, 0, 175, 40, 0, 0, TAU); c.fill(); c.strokeStyle = '#C98B3A'; c.lineWidth = 4; c.stroke();
  c.fillStyle = 'rgba(180,110,40,.5)'; for (const [x, y] of [[-40, 4], [20, 8], [60, -2]]) { c.beginPath(); c.ellipse(x, y, 14, 5, 0, 0, TAU); c.fill(); } c.restore(); }
function flyingPancake(c, t, L) { if (L !== 'r6') return; const u = t - ev('r6', 'gag') - 0.25; if (u < 0 || u > 0.5) return; const k = eOut(clamp(u / 0.5)), x = PANX + 270, y = lerp(-1180, CEIL + 30, k);
  c.save(); c.translate(x, y); c.rotate(u * 18); c.fillStyle = '#F2C26A'; c.beginPath(); c.ellipse(0, 0, 100, 22 + 50 * Math.abs(Math.sin(u * 18)), 0, 0, TAU); c.fill(); c.restore();
  c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 8; for (const dx of [-60, 0, 60]) { c.beginPath(); c.moveTo(x + dx, y + 80); c.lineTo(x + dx, y + 200); c.stroke(); } }

// ---------------- the heroine
const down = (g, s, drop = 0) => reach(g, s, s * g.sw * 1.08, g.ySh + drop + 540, { planar: true });
const open = (g, s, k = 1.7, dy = 90) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const hold = (g, s, dy = 330, k = 0.75) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const at = (g, s, x, y) => reach(g, s, x, y, { planar: true });
const quizPhase = (t, L) => t < ev(L, 'gag');
const herX = (t, L) => { if (L === 'bonus' || L === 'end') return HXB; if (quizPhase(t, L) || L === 'hook') return HX; return { r2: HXT, r3: HXT, r4: HXT, r5: HXO }[L] ?? HX; };
const colanderOn = (t, L) => L === 'hook' || L === 'r1';
function herState(t, L) { const g = g0, e = k => ev(L, k), st = { t, talk: talk('her', t), mood: 'happy', turn: 0, look: 0, armL: down(g, -1), armR: down(g, 1), items: {}, afterTorso: cc => apron(cc, g) };
  const tmOn = timerOn(t, L), tipped = t > e('tip') - 0.05;
  const think = () => { st.mood = 'worried'; st.look = 0.4; st.lookY = -0.3; st.blink = 0; };   // during the timer: she waits for YOUR answer
  if (colanderOn(t, L)) st.front = (cc, o) => { colander(cc, o.head.x, o.head.y - g.hh * 0.82, 1.05); if (L === 'r1') pastaWig(cc, { x: o.head.x, y: o.head.y, hw: g.hw, hh: g.hh }, t, t > e('gag') + 0.9 ? eOut(clamp((t - e('gag') - 0.9) / 0.4)) : 0); };
  if (L === 'hook') { st.mood = 'happy'; st.armR = open(g, 1, 1.9, -60 + Math.sin(t * 5) * 15); st.armL = hold(g, -1, 380, 0.6);
    if (speaking('hook_h', t)) { st.mood = 'happy'; st.armR = open(g, 1, 1.9, -90 + Math.sin(t * 7) * 20); st.armL = open(g, -1, 1.6, 160 + Math.sin(t * 6) * 20); }
    if (t > hev('back')) { st.laugh = true; st.armL = open(g, -1, 1.8, 40 + Math.sin(t * 7) * 20); st.armR = open(g, 1, 1.8, 40 + Math.sin(t * 7 + 1) * 20); } }
  if (L === 'r1') { st.armR = open(g, 1, 1.9, -60); st.armL = hold(g, -1, 380, 0.6); if (tmOn) think();
    if (tipped) { st.mood = 'happy'; st.laugh = true; st.blink = 0; }
    if (t > e('gag') - 0.02) { const u = t - e('gag'); st.headFirst = true; st.laugh = false;
      if (u < 1.0) { st.mood = 'surprised'; st.lookY = -0.6; st.armL = at(g, -1, -150, g.headY - g.hh - 230); st.armR = at(g, 1, 150, g.headY - g.hh - 250); }
      else { st.mood = u > 1.5 ? 'smug' : 'shock'; st.lookY = 0; st.blink = u > 1.5 ? 1 : 0; st.armL = open(g, -1, 1.7, 120); st.armR = open(g, 1, 1.7, 120); } } }
  if (L === 'r2') { const len = quizPhase(t, L) ? 1 : 1 - eIn(clamp((t - e('gag') - 0.1) / 1.4)) * 0.9, u = t - e('gag');
    st.armL = at(g, -1, -110, g.ySh + 120); const ry = quizPhase(t, L) ? g.ySh + 300 : g.ySh + 330 + Math.sin(u * 18) * 80 * (u < 1.5 ? 1 : 0); const L_ = 360 * len + 30;
    st.armR = at(g, 1, -110 + 60 + L_, ry); st.items = { L: cc => { cc.save(); cc.translate(0, -10); grater(cc, 1); cc.restore(); }, R: cc => carrot(cc, L_) };
    if (tmOn) think(); if (tipped) { st.mood = 'happy'; st.blink = 0; }
    if (!quizPhase(t, L)) { st.mood = 'neutral'; st.lookY = 0.5; st.look = -0.2; if (u > 1.5) { st.mood = 'shock'; st.lookY = 0; st.look = 0; st.armR = at(g, 1, 300, g.ySh + 80); st.armL = hold(g, -1, 360, 0.5); st.items = { R: cc => carrot(cc, L_) }; } } }
  if (L === 'r3') { st.armR = open(g, 1, 1.6, 40); st.items = { R: cc => ladle(cc, -0.3) }; st.armL = hold(g, -1, 380, 0.6); if (tmOn) think(); if (tipped) { st.mood = 'happy'; st.blink = 0; }
    if (!quizPhase(t, L)) { const u = t - e('gag'), lx = POTX - HXT - 70, bx = BOWLX - HXT - 110; st.look = 0.8; st.turn = 0.3; st.mood = 'happy';
      const k = eIO(clamp((u - 0.05) / 0.3)); st.armR = at(g, 1, lerp(lx, bx, k), lerp(TT - 260, TT - 300, k)); st.items = { R: cc => ladle(cc, u > 0.35 ? -0.9 : -0.1, u < 0.35 ? 1 : 0) };
      if (u > 1.1) { st.armR = hold(g, 1, 360, 0.6); st.items = { R: cc => ladle(cc, -0.2) }; st.armL = reach(g, -1, -g.sw * 0.3, g.ySh + 220, { planar: true }); st.mood = 'happy'; st.blink = 1; } } }
  if (L === 'r4') { const u = t - e('gag'), cx = quizPhase(t, L) ? 0 : 360 - HXT + Math.sin(u * 9) * 90 * (u < 1.0 ? 1 : 0);
    if (quizPhase(t, L)) { st.armL = at(g, -1, -170, g.ySh + 260); st.armR = at(g, 1, 170, g.ySh + 260); st.items = { R: cc => { cc.save(); cc.translate(-170, 0); rollingPin(cc, -170, 170); cc.restore(); } }; if (tmOn) think(); if (tipped) { st.mood = 'happy'; st.blink = 0; } }
    else { st.armL = at(g, -1, cx - 150, TT - 60); st.armR = at(g, 1, cx + 150, TT - 60); st.items = { R: cc => { cc.save(); cc.translate(-150, 0); rollingPin(cc, -150, 150); cc.restore(); } }; st.look = 0.6; st.lookY = 0.5; st.mood = 'happy';
      if (u > 1.0) { st.mood = 'shock'; st.lookY = 0.2; st.look = 0.9; st.turn = 0.3; } if (u > 2.0) { st.mood = 'worried'; st.armR = open(g, 1, 1.8, 60); st.items = {}; st.armL = hold(g, -1, 330, 0.5); } } }
  if (L === 'r5') { const u = t - e('gag');
    if (quizPhase(t, L)) { st.armR = open(g, 1, 1.5, 60); st.items = { R: cc => mitt(cc, t, 0, tipped, false) }; st.armL = hold(g, -1, 380, 0.6); if (tmOn) think(); if (tipped) { st.mood = 'happy'; st.blink = 0; } }
    else { const tx = TRAYX - HXO - 200, ty = CT - 40; st.look = 0.7; st.turn = 0.3;
      if (u < 0.45) { st.mood = 'happy'; st.armR = at(g, 1, lerp(g.sw * 1.5, tx, eIO(clamp(u / 0.4))), lerp(g.ySh + 150, ty, eIO(clamp(u / 0.4)))); st.items = { R: cc => mitt(cc, t, clamp(u / 0.3), true, false) }; }
      else { const v = u - 0.45, up = eOut(clamp(v / 0.3)), shake = u > 1.3 && u < 2.1 ? Math.sin(u * 30) * 0.18 : 0; st.mood = u > 0.9 ? 'angry' : 'surprised';
        st.armR = at(g, 1, lerp(tx, g.sw * 2.1, up), lerp(ty, g.ySh - 120, up)); st.items = { R: cc => mitt(cc, t, u > 1.3 && u < 2.1 ? 0.15 : 0.1, true, true, shake) };
        if (u > 0.85) st.armL = at(g, -1, g.sw * 1.2, g.ySh + 20 + Math.sin(u * 20) * 20); } } }
  if (L === 'r6') { const u = t - e('gag');
    if (quizPhase(t, L)) { st.armR = at(g, 1, g.sw * 1.3, g.ySh + 300); st.items = { R: cc => pan(cc, true) }; st.armL = hold(g, -1, 380, 0.6); if (tmOn) think(); if (tipped) { st.mood = 'happy'; st.blink = 0; } }
    else { const flick = u > 0.15 && u < 0.4 ? -120 * Math.sin((u - 0.15) / 0.25 * Math.PI) : 0; st.armR = at(g, 1, g.sw * 1.3, g.ySh + 300 + flick); st.items = { R: cc => pan(cc, u < 0.25) }; st.mood = 'happy';
      if (u > 0.4) { st.mood = 'surprised'; st.lookY = -1; st.blink = 0; } if (u > 1.3) { st.mood = 'shock'; } if (u > 2.0) { st.mood = 'smug'; st.lookY = -0.6; } } }
  if (L === 'bonus') { st.armR = at(g, 1, g.sw * 1.0, g.ySh + 330); st.items = { R: saucepanItem }; st.mood = 'worried'; st.look = 0.4;
    if (t < e('card')) { st.armL = at(g, -1, -g.sw * 1.5, g.ySh + 80 + Math.sin(t * 6) * 30); st.lookY = -0.4; }
    if (tmOn) think(); if (t > e('tip') - 0.05 && t < e('open')) { st.mood = 'happy'; st.blink = 0; st.armL = at(g, -1, DOORS[0][1] - 60 - HXB, UY1 - 60); st.lookY = -0.6; }
    if (t > e('open')) { st.mood = 'shock'; st.lookY = -0.7; st.blink = 0; st.armL = open(g, -1, 1.9, -40); st.headFirst = true; }
    if (t > e('fall') + 1.2) { st.mood = 'shock'; st.lookY = 0; st.armL = open(g, -1, 1.6, 140); } }
  if (L === 'end') { st.armR = at(g, 1, g.sw * 1.0, g.ySh + 330); st.items = { R: saucepanItem }; st.mood = 'tired'; st.blink = 1;
    if (speaking('end_h', t, 0, 0)) { st.mood = 'sad'; st.blink = t - SP.end_h.t < 1.2 ? 1 : 0; st.armL = open(g, -1, 1.7, 130 + Math.sin(t * 4) * 15); st.look = 0.2; }
    if (t > endOf('end_h')) { st.mood = 'happy'; st.blink = 0; st.laugh = t > ev('end', 's0'); st.armL = open(g, -1, 1.8, 60 + Math.sin(t * 5) * 20); } }
  return st; }
// r1 gag: the pasta pot above her head, pouring into the colander
function pastaPot(c, t, L, hx) { if (L !== 'r1') return; const u = t - ev('r1', 'gag'); if (u < 0 || u > 1.0) return; const tilt = eOut(clamp((u - 0.1) / 0.3)) * 1.0;
  const px = hx + 0, py = g0.headY - g0.hh - 250; c.save(); c.translate(px, py); c.rotate(-tilt * 0.9); c.translate(0, 100); pot(c, 0.75); c.restore();
  if (u > 0.3 && u < 0.95) { c.strokeStyle = '#F2D06A'; c.lineWidth = 10; c.lineCap = 'round'; for (let i = 0; i < 6; i++) { const x = px - 110 + i * 12, ph = (u * 3 + i * 0.2) % 1; c.beginPath(); c.moveTo(x, py - 20); c.quadraticCurveTo(x + Math.sin(i + u * 20) * 20, py + 60, x + 20, g0.headY - g0.hh * 1.6 + ph * 20); c.stroke(); }
    c.fillStyle = 'rgba(124,199,242,.75)'; for (let i = 0; i < 10; i++) { const v = (u * 2.5 + i / 10) % 1; c.beginPath(); c.arc(hx + (i - 5) * 26, g0.headY - g0.hh * 0.9 + v * 700, 8, 0, TAU); c.fill(); } } }
// r2: carrot shreds flying into the bowl; r3: the soup stream
function shreds(c, t, L, hx) { if (L !== 'r2') return; const u = t - ev('r2', 'gag'); if (u < 0.05 || u > 1.6) return; c.fillStyle = '#F08A2C';
  for (let i = 0; i < 14; i++) { const v = (u * 2.2 + i / 14) % 1, x0 = hx - 110 + (hash(i) - 0.5) * 50; c.save(); c.translate(lerp(x0, 220 + (hash(i * 2) - 0.5) * 80, v), lerp(g0.ySh + 420, TT - 70, v) - Math.sin(v * Math.PI) * 120); c.rotate(i + u * 10); c.fillRect(-14, -3, 28, 6); c.restore(); } }
function soupStream(c, t, L) { if (L !== 'r3') return; const u = t - ev('r3', 'gag'); if (u < 0.35 || u > 1.05) return; c.strokeStyle = '#E8913A'; c.lineWidth = 16; c.lineCap = 'round'; const x = BOWLX - 20;
  c.beginPath(); c.moveTo(x - 10, TT - 230); c.quadraticCurveTo(x + 10, TT - 150, x, TT - 60); c.stroke(); }

// ---------------- world
function world(c, t, L, tag) { const heads = {};
  c.drawImage(BGK, BX0, BY0, BW, BH);
  cupboards(c, t, L); pancakeCeil(c, t, L);
  fridge(c, t); cactus(c, t, L);
  chair(c); cat(c, t, L, heads); table(c, t, L);
  counter(c, t, L);
  const hx = herX(t, L); const r = K.put(c, herCfg, herState(t, L), hx, 0); heads.her = r;
  pastaPot(c, t, L, hx); shreds(c, t, L, hx); soupStream(c, t, L); flyingPancake(c, t, L);
  if (L === 'r3' && t > ev('r3', 'gag') + 1.4 && t < ev('r3', 'gag') + 2.9) { const u = t - ev('r3', 'gag') - 1.4; for (let i = 0; i < 3; i++) { const v = (u * 0.8 + i / 3) % 1; c.save(); c.globalAlpha = 1 - v; heart(c, CATX + (i - 1) * 60, heads.cat.y - 120 - v * 200, 0.9, '#EE5E9A'); c.restore(); } }
  lidPile(c, t, L);
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const SH = { QUIZ: S(-175, -1569, 0.51, 'quiz'), WIDE: S(200, -1600, 0.4, 'wide'), CACT: S(CAX, -2160, 1.35, 'cact'), MED: S(-250, -1273, 0.85, 'med'),
  TABLE: S(330, -947, 0.75, 'table'), OVEN: S(1120, -1250, 0.8, 'oven'), CEIL: S(-200, -2132, 0.55, 'ceil'),
  BWIDE: S(900, -1550, 0.45, 'bwide'), BQ: S(1050, -1569, 0.51, 'bq'), BW: S(1100, -1500, 0.6, 'bw'), HEND: S(1100, -1257, 0.95, 'hend'), SCORE: S(1100, -1405, 0.62, 'score') };
const GAGSHOT = { r1: 'MED', r2: 'TABLE', r3: 'TABLE', r4: 'TABLE', r5: 'OVEN', r6: 'CEIL' };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < hev('wide') + 0.1) return SH.QUIZ; if (t < hev('cactus') - 0.03) return f(SH.WIDE); if (t < hev('back') - 0.03) return f(SH.CACT); return f(SH.MED); }
  if (GAGSHOT[L]) { if (t < e('gag') - 0.02) return f(SH.QUIZ); return f(SH[GAGSHOT[L]]); }
  if (L === 'bonus') { if (t < e('card') - 0.02) return f(SH.BWIDE); if (t < e('open') - 0.02) return f(SH.BQ); return f(SH.BW); }
  if (L === 'end') { if (t < SP.end_h.t - 0.1) return f(SH.BW); if (t < e('score') - 0.05) return f(SH.HEND); return f(SH.SCORE); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'thud', 'clank']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- overlays
function title(c, t) { const a = 1 - P(t, 1.95, 2.2); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 290); c.rotate(-0.04); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.fillStyle = C.olive; rr(c, -440, -205, 300, 64, 32); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 5; rr(c, -440, -205, 300, 64, 32); c.stroke(); fitTxt(c, 'ЧЕЛЛЕНДЖ', -290, -172, 32, C.white, 250);
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -98);
  UI.textFit(c, 'Unb9', 130, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 10, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 58, lines[2][0], 900); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 116); c.restore();
  if (global.__QA) global.__QA.ui(c, 'card', { x: 50, y: 85, w: 980, h: 370, k: a, id: 'title' }); }
const RU = { r1: 'ДУРШЛАГ', r2: 'ТЁРКА', r3: 'ПОЛОВНИК', r4: 'СКАЛКА', r5: 'ПРИХВАТКА', r6: 'СКОВОРОДКА', bonus: 'КРЫШКА' };
const EN = { r1: 'colander', r2: 'grater', r3: 'ladle', r4: 'rolling pin', r5: 'oven mitt', r6: 'frying pan', bonus: 'lid' };
// small chapter label at the top: «01/06» … «БОНУС»
function chapter(c, t, sc) { const L = sc.id; if (!RU[L]) return; const k = eBack(P(t, ev(L, 'card'), ev(L, 'card') + 0.25), 2) * (1 - eIn(P(t, sc.e - 0.15, sc.e))); if (k <= 0) return;
  const s = L === 'bonus' ? 'БОНУС' : '0' + L.slice(1) + '/06'; c.save(); c.translate(540, 112); c.scale(k, k); UI.font(c, 'Unb9', 40); const w = c.measureText(s).width + 70;
  c.fillStyle = L === 'bonus' ? C.pink : C.olive; rr(c, -w / 2, -34, w, 68, 34); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 5; c.stroke(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s, 0, 3); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w / 2 * k, y: 112 - 34 * k, w: w * k, h: 68 * k, k, id: 'chapter_' + L }); }
// the Russian word card -> flips into the pink English answer plate when the tip voice speaks
const CARDY = 320;
function wordCard(c, t, sc) { const L = sc.id; if (!RU[L]) return; const c0 = ev(L, 'card'), tp = ev(L, 'tip'), end = sc.e;
  const inK = eBack(P(t, c0 + 0.05, c0 + 0.3), 2.2), flip = P(t, tp - 0.1, tp + 0.12), outK = 1 - eIn(P(t, end - 0.15, end));
  if (t < c0 || inK <= 0 || outK <= 0) return;
  const ru = flip < 0.5, sy = Math.abs(Math.cos(flip * Math.PI)), bump = ru ? 1 : 1 + 0.08 * Math.sin(clamp((t - tp - 0.1) / 0.35) * Math.PI);
  c.save(); c.translate(540, CARDY); c.scale(inK * outK * bump, inK * outK * sy * bump); c.rotate(-0.02);
  const txt = ru ? RU[L] : EN[L]; const fs = UI.textFit(c, ru ? 'Unb9' : 'Nun9', ru ? 128 : 136, txt, 820); const w = Math.max(520, c.measureText(txt).width + 140), h = 230;
  c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -w / 2 + 10, -h / 2 + 14, w, h, 46); c.fill();
  c.fillStyle = ru ? C.white : C.pink; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -w / 2, -h / 2, w, h, 46); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; if (ru) { c.fillStyle = C.oliveD; c.fillText(txt, 0, 8); } else { UI.strokeText(c, txt, 0, 4, C.white, null, 0); }
  c.restore(); if (global.__QA) global.__QA.ui(c, 'card', { x: 540 - w / 2, y: CARDY - h / 2, w, h, k: inK, id: 'word_' + L }); }
// the 3-2-1 ring timer (screen space, right of her head in the quiz shot)
function ringTimer(c, t, sc, x = 868, y = 760, R = 112) { const L = sc.id; if (!RU[L] && L !== 'hook') return; let tm0, tm1, gone;
  if (L === 'hook') { tm0 = hev('cactus'); tm1 = tm0 + 3; gone = hev('back') - 0.03; x = 830; y = 1210; R = 100; } else { tm0 = ev(L, 'tm0'); tm1 = ev(L, 'tm1'); gone = Math.min(ev(L, 'gag'), ev(L, 'open')) - 0.02; }
  const k = eBack(P(t, tm0 - 0.3, tm0), 2); if (k <= 0 || t >= gone) return;
  const rem = clamp(tm1 - t, 0, 3), frac = rem / 3, n = Math.ceil(rem - 1e-6), beat = (tm1 - t) % 1, puls = 1 + 0.08 * Math.max(0, beat - 0.8) * 5;
  c.save(); c.translate(x, y); c.scale(k * puls, k * puls);
  c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.arc(8, 12, R + 14, 0, TAU); c.fill(); c.fillStyle = C.white; c.beginPath(); c.arc(0, 0, R + 14, 0, TAU); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 7; c.stroke();
  c.strokeStyle = '#E9E2D2'; c.lineWidth = 26; c.beginPath(); c.arc(0, 0, R - 12, 0, TAU); c.stroke();
  const col = n >= 3 ? '#4CAF6A' : n === 2 ? '#F2B33D' : '#E0474C';
  if (rem > 0) { c.strokeStyle = col; c.lineCap = 'round'; c.beginPath(); c.arc(0, 0, R - 12, -Math.PI / 2, -Math.PI / 2 + TAU * frac); c.stroke(); UI.font(c, 'Unb9', 120); c.fillStyle = col; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(n), 0, 8); }
  else { c.strokeStyle = '#4CAF6A'; c.lineWidth = 26; c.beginPath(); c.arc(0, 0, R - 12, 0, TAU); c.stroke(); UI.check(c, 0, 0, 60, '#4CAF6A'); }
  c.restore(); if (global.__QA) global.__QA.ui(c, 'label', { x: x - R - 14, y: y - R - 14, w: 2 * R + 28, h: 2 * R + 28, k, id: 'timer_' + L }); }
// score scale card: 6 из 6 — ШЕФ / 3 — ПОВАРЁНОК / 0 — ДОСТАВКА
function scooter(c, x, y, s, col) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; rr(c, -40, -70, 70, 60, 8); c.fill(); c.fillRect(-50, -12, 110, 16); c.fillRect(40, -70, 10, 60); c.fillRect(30, -78, 34, 10);
  c.beginPath(); c.arc(-34, 14, 18, 0, TAU); c.fill(); c.beginPath(); c.arc(50, 14, 18, 0, TAU); c.fill(); c.restore(); }
function scoreCard(c, t) { const sc = sceneAt(t); if (sc.id !== 'end') return; const t0 = ev('end', 'score'), k = eBack(P(t, t0 - 0.05, t0 + 0.25), 2) * (1 - eIn(P(t, sc.e - 0.15, sc.e))); if (k <= 0) return;
  const y0 = 470, w = 900, h = 520; c.save(); c.translate(540, y0); c.scale(k, k); c.rotate(-0.015);
  c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -w / 2 + 10, -h / 2 + 14, w, h, 40); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -w / 2, -h / 2, w, h, 40); c.fill(); c.stroke();
  const rows = [['6/6', 'ШЕФ', 's6', '#4CAF6A', cc => chefHat(cc, 0, 30, 0.42, '#FFFFFF')], ['3/6', 'ПОВАРЁНОК', 's3', '#F2B33D', cc => { chefHat(cc, 0, 22, 0.28, '#FFFFFF'); }], ['0/6', 'ДОСТАВКА', 's0', '#E0474C', cc => scooter(cc, 0, 0, 0.7, '#FFFFFF')]];
  rows.forEach(([n, lab, key, col, ic], i) => { const y = -170 + i * 170, on = t > ev('end', key) - 0.05, bk = on ? 1 + 0.08 * Math.sin(clamp((t - ev('end', key)) / 0.4) * Math.PI) : 1;
    c.save(); c.translate(0, y); c.scale(bk, bk); c.globalAlpha = on ? 1 : 0.35;
    c.fillStyle = col; rr(c, -410, -66, 820, 132, 66); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke();
    c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.arc(-340, 0, 54, 0, TAU); c.fill(); c.save(); c.translate(-340, 0); ic(c); c.restore();
    fitTxt(c, n, -170, 4, 76, C.white, 170); fitTxt(c, lab, 140, 4, 64, C.white, 420); c.restore(); });
  c.restore(); if (global.__QA) global.__QA.ui(c, 'card', { x: 540 - w / 2, y: y0 - h / 2, w, h, k, id: 'score' }); }

// ---------------- end screen: «СКОЛЬКО ИЗ 6?» 0–2 / 3–4 / 5–6, СОХРАНИ, ПОДПИСАТЬСЯ clicked by the cursor, then the comment question (ask)
const wAt = (id, w, fb) => K.wordT(id, w) ?? fb;
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, ask = SP.ask, { textFit, strokeText, font } = UI;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // heroine with the frying pan + the cat (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34, 2nd character at local x 640)
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = g0; c.save(); c.translate(640, 0); c.scale(0.55, 0.55); catChar(c, { t, mood: 'happy', turn: -0.3, look: -0.6, armL: { a: 2.4 + Math.sin(t * 6) * 0.2, b: 1.2 }, armR: { a: 2.4 + Math.sin(t * 6 + 1) * 0.2, b: 1.2 }, items: {} }); c.restore();
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0, look: 0, afterTorso: cc => apron(cc, g), armL: reach(g, -1, -g.sw * 2.0, g.ySh - 160 + Math.sin(t * 8) * 30, { planar: true }), armR: reach(g, 1, g.sw * 1.3, g.ySh + 300, { planar: true }), items: { R: cc => pan(cc, true) } }, 0, 0); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const swap = eIO(P(t, ask.t - 0.15, ask.t + 0.15));
  const q = eBack(P(u, 0.2, 0.55), 2.2) * (1 - swap); if (q > 0) { c.save(); c.translate(540, 330); c.scale(q, q); font(c, 'Unb9', 70); strokeText(c, 'СКОЛЬКО', 0, -55, C.oliveD, C.white, 14); textFit(c, 'Unb9', 110, 'ИЗ 6?', 800); strokeText(c, 'ИЗ 6?', 0, 50, C.pink, C.white, 14); c.restore(); }
  const q2 = eBack(P(t, ask.t, ask.t + 0.3), 2.2); if (q2 > 0) { c.save(); c.translate(540, 300); c.scale(q2, q2); c.rotate(-0.02);
    c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -460 + 8, -170 + 12, 920, 340, 40); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 8; rr(c, -460, -170, 920, 340, 40); c.fill(); c.stroke();
    textFit(c, 'Unb9', 64, 'СКОЛЬКО ИЗ ШЕСТИ', 840); c.fillStyle = C.oliveD; c.fillText('СКОЛЬКО ИЗ ШЕСТИ', 0, -88); textFit(c, 'Unb9', 84, 'УСПЕЛ?', 840); strokeText(c, 'УСПЕЛ?', 0, 4, C.pink, C.white, 12);
    textFit(c, 'Unb9', 46, 'ПИШИ СЧЁТ В КОММЕНТЫ', 840); c.fillStyle = C.oliveD; c.fillText('ПИШИ СЧЁТ В КОММЕНТЫ', 0, 100); c.restore(); }
  const BTN = [['0–2', 'ДОСТАВКА', '#E0474C'], ['3–4', 'ПОВАРЁНОК', '#F2B33D'], ['5–6', 'ШЕФ', '#4CAF6A']];
  BTN.forEach(([n, lab, col], i) => { const t0 = s + 0.45 + i * 0.22, kk = eBack(P(t, t0 - 0.05, t0 + 0.25), 2.2); if (kk <= 0) return; const x = 210 + i * 330, y = 660, bump = 1 + 0.06 * Math.sin(clamp((t - t0) / 0.4) * Math.PI);
    c.save(); c.translate(x, y); c.scale(kk * bump, kk * bump); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -148 + 8, -95 + 12, 296, 190, 36); c.fill(); c.fillStyle = col; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -148, -95, 296, 190, 36); c.fill(); c.stroke();
    textFit(c, 'Unb9', 84, n, 250); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(n, 0, -22); textFit(c, 'Unb9', 32, lab, 250); c.fillText(lab, 0, 52); c.restore(); });
  const svT = wAt('outro', 'сохран', sp.t) + 0.05, sk = eBack(P(t, svT, svT + 0.3), 2.2), pulse = 1 + 0.05 * Math.sin(clamp((t - svT - 0.4) / 0.5) * Math.PI);
  if (sk > 0) { c.save(); c.translate(540, 890); c.scale(sk * pulse, sk * pulse); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -260 + 6, -60 + 10, 520, 120, 60); c.fill(); c.fillStyle = C.gold; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -260, -60, 520, 120, 60); c.fill(); c.stroke();
    c.fillStyle = C.oliveD; c.beginPath(); c.moveTo(-190, -32); c.lineTo(-146, -32); c.lineTo(-146, 34); c.lineTo(-168, 16); c.lineTo(-190, 34); c.closePath(); c.fill();
    textFit(c, 'Unb9', 50, 'СОХРАНИ', 330); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.fillText('СОХРАНИ', 40, 4); c.restore(); }
  const subT = wAt('outro', 'себя', sp.t + 1.0), bk = eBack(P(t, subT, subT + 0.3), 2), sy = 1070;
  if (bk > 0) { const click = P(t, subT + 0.8, subT + 0.95), pressed = t > subT + 0.9; c.save(); c.translate(540, sy); const ss = bk * (1 - 0.08 * Math.sin(click * Math.PI)); c.scale(ss, ss); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -250 + 6, -58 + 10, 500, 116, 58); c.fill(); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -250, -58, 500, 116, 58); c.fill(); textFit(c, 'Unb9', 42, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 440); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4); c.restore();
    const mv = eIO(P(t, subT + 0.2, subT + 0.8)); UI.tapCursor(c, lerp(880, 600, mv), lerp(sy + 260, sy + 20, mv), 1, P(t, subT + 0.85, subT + 1.4)); }
  if (t < ask.t - 0.1) { c.save(); c.translate(0, -95); UI.captions(c, t); c.restore(); }
  Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

// caption height per shot: below every face and key prop
const CAPY = { wide: 0, bwide: 0, cact: 0, med: 0, quiz: 0, score: 0, bw: 0, hend: 0 };
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  const r = drawWorld(c, t, L, cam, tag, sh), heads = r.heads, M = r.M, proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.22);
  K.bubbles(c, t, sc, { her: heads.her }, proj, { cleanChunks: true, hold: { hook_h: 0.05, end_h: 0.05 } });
  if (L === 'hook') title(c, t);
  chapter(c, t, sc); wordCard(c, t, sc); ringTimer(c, t, sc); scoreCard(c, t);
  c.save(); c.translate(0, CAPY[tag] || 0); UI.captions(c, t); c.restore(); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('kitchen3s', NF, renderFrame);
