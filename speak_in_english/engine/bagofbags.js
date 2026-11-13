// "Британец нашёл пакет с пакетами" — rubric «Наше за границей» (scene + 4 answers, worst -> best), hard_cut camera: node bagofbags.js start end out.mp4 | --png=f1,f2
// A London flat kitchen: the heroine (pink jumper) and her British flatmate Oliver (green jumper), who has just pulled the HUGE bag of bags
// out from under the sink (cupboard open, a few bags spilled on the floor). Absurd detail: matryoshka bags poke out of the big bag —
// a smaller one, a smaller one, and the tiniest with a tag DO NOT TOUCH.
// Hook insert: the bags nest out of each other one by one.
// o1 «В ЛОБ»: "Bags. Inside bags. Normal." — the bag breathes by itself; "It's breathing!" — it puffs up huge, he holds it at arm's length; it sighs.
// o2 «ВЕЖЛИВО»: "It is for... future bags." — "Do they come from the future?" — he peeks in; insert: a blue time vortex inside; back: he is blown, lit blue.
// o3 «КАК НОСИТЕЛЬ»: "We never throw them away. Waste not, want not." — "That's actually quite clever." — he folds a bag into a neat triangle; tip.
// o4 «КОРОЛЕВСКИЙ ОТВЕТ»: the grand line — three bags of three generations fan out in her hand, the folded triangle, the tiny bag shown like a jewel;
//   "...Can I be adopted?" — happy tears.
// Twist (music silent): a week later — he opens his own cupboard: a little bag with seven bags. "My mum's very worried." Insert: Mum's texts. She is proud.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/bagofbags/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];
// handovers: a negative per-line hold (bubble gone BEFORE the line ends) — ui_v2 clamps hold to >= 0.05, so shorten the bubble's span instead
{ const _bub = UI.bubble; UI.bubble = (ctx, sp, t, an, side, name) => _bub(ctx, sp.hold < 0.05 ? { ...sp, d: sp.d + sp.hold - 0.05 } : sp, t, an, side, name); }

// ---------------- cast
const HER = { ...BASE.her_lift };
const OLI = { ...BASE.oliver, top: { type: 'sweater', col: '#4E9A6E' }, bottom: { type: 'jeans', col: '#4A5A7A' }, shoes: { col: '#FFFFFF', acc: '#4E9A6E' }, watch: null };
const G = { her: geom(HER), flat1: geom(OLI) };
const X = { her: -130, oli: 470 };
const XE = { her: 640, oli: 1280 };                                  // twist (a week later): he stands at his own cupboard, she comes in
const CT = -900;                                                     // worktop height
const SINK0 = 620, SINK1 = 1080;                                     // under-sink cupboard (open)
const MYC0 = 1320, MYC1 = 1660, MYCY0 = -2150, MYCY1 = -1500;        // his own upper cupboard (twist)
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- props: plastic bags
const BAGCOL = ['#F2C14E', '#EF7FAA', '#7FB8E0', '#8CCB7A', '#F29A5A', '#B79AE0', '#FFFFFF'];
// a crumpled bag corner poking out (for the stuffing)
function poke(c, x, y, r, col, rot) { c.save(); c.translate(x, y); c.rotate(rot); paint(c, q => { q.m(-r, 10); q.q(-r * 0.8, -r * 0.9, -r * 0.1, -r * 1.1); q.q(r * 0.5, -r * 0.7, r * 0.3, -r * 0.2); q.q(r * 0.9, -r * 0.6, r, 10); q.z(); }, col, { sd: 3, hd: 1, lw: 4 });
  c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 3; c.beginPath(); c.moveTo(-r * 0.4, -r * 0.5); c.lineTo(-r * 0.1, -0); c.moveTo(r * 0.2, -r * 0.4); c.lineTo(r * 0.4, 0); c.stroke(); c.restore(); }
// a simple bag (body + two handle loops); (0,0) = middle of the opening; w, h = body size
function simpleBag(c, w, h, col, stripe, o = {}) {
  const hl = o.hl || { x: -w * 0.28, y: -h * 0.42 }, hr = o.hr || { x: w * 0.28, y: -h * 0.42 };
  c.strokeStyle = col === '#FFFFFF' ? '#C9CED6' : col; c.lineWidth = Math.max(8, w * 0.05); c.lineCap = 'round';
  for (const [hx, hp] of [[-w * 0.3, hl], [w * 0.3, hr]]) { c.beginPath(); c.moveTo(hx - w * 0.1, 4); c.quadraticCurveTo(hp.x - w * 0.12, hp.y, hp.x, hp.y); c.quadraticCurveTo(hp.x + w * 0.12, hp.y, hx + w * 0.1, 4); c.stroke(); }
  paint(c, q => { q.m(-w * 0.46, 0); q.q(-w * 0.2, 14, 0, 4); q.q(w * 0.2, 14, w * 0.46, 0); q.q(w * 0.56, h * 0.5, w * 0.48, h * 0.92); q.q(0, h * 1.04, -w * 0.48, h * 0.92); q.q(-w * 0.56, h * 0.5, -w * 0.46, 0); q.z(); }, col, { sd: 6, hd: 3, lw: 4 });
  if (stripe) { c.save(); c.beginPath(); c.moveTo(-w * 0.46, 0); c.quadraticCurveTo(-w * 0.56, h * 0.5, -w * 0.48, h * 0.92); c.quadraticCurveTo(0, h * 1.04, w * 0.48, h * 0.92); c.quadraticCurveTo(w * 0.56, h * 0.5, w * 0.46, 0); c.closePath(); c.clip();
    c.fillStyle = stripe; for (const yy of [0.3, 0.55]) c.fillRect(-w, h * yy, w * 2, h * 0.08); c.restore(); }
  c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 4; c.beginPath(); c.moveTo(-w * 0.2, h * 0.15); c.quadraticCurveTo(-w * 0.1, h * 0.5, -w * 0.25, h * 0.8); c.moveTo(w * 0.18, h * 0.2); c.quadraticCurveTo(w * 0.28, h * 0.45, w * 0.12, h * 0.75); c.stroke(); }
// the tag on the tiniest bag
function tag(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.rotate(-0.12); c.strokeStyle = '#8A6A4A'; c.lineWidth = 4; c.beginPath(); c.moveTo(70, -30); c.lineTo(0, 0); c.stroke();
  c.fillStyle = '#FFFDF2'; c.strokeStyle = '#3E471E'; c.lineWidth = 5; c.beginPath(); c.moveTo(0, -38); c.lineTo(-250, -38); c.lineTo(-250, 38); c.lineTo(0, 38); c.lineTo(22, 0); c.closePath(); c.fill(); c.stroke();
  fitTxt(c, 'DO NOT TOUCH', -118, 2, 40, '#D23A3A', 220); c.restore(); }
// the matryoshka of bags; (0,0) = bottom of the medium bag; n = how many are out (0..3, fractional pops)
function nest(c, n = 3, s = 1) { c.save(); c.scale(s, s);
  const k1 = eBack(clamp(n), 2), k2 = eBack(clamp(n - 1), 2), k3 = eBack(clamp(n - 2), 2);
  if (k1 > 0) { c.save(); c.scale(k1, k1); c.translate(0, -200); simpleBag(c, 210, 200, '#EF7FAA', '#FFFFFF');
    if (k2 > 0) { c.save(); c.translate(-10, 20); c.scale(k2, k2); c.translate(0, -120); simpleBag(c, 130, 120, '#F2C14E', null);
      if (k3 > 0) { c.save(); c.translate(6, 12); c.scale(k3, k3); c.translate(0, -70); simpleBag(c, 76, 70, '#8CCB7A', null); tag(c, -40, 40, 0.9 * k3); c.restore(); }
      c.restore(); }
    c.restore(); }
  c.restore(); }
// THE bag of bags: (0,0) = middle of the opening; hl/hr = handle tops (same coords); puff = inflation (1 normal); glow = time vortex light
const BW0 = 560, BH0 = 600;
function bigBag(c, o = {}) { const puff = o.puff || 1, w = BW0 * (o.s || 1) * (1 + (puff - 1) * 1.1), h = BH0 * (o.s || 1) * puff;
  // stuffing behind the rim
  const stuff = [[-0.33, 0.9, 0], [-0.15, 1.0, 1], [0.05, 1.1, 2], [0.24, 0.95, 3], [0.38, 0.85, 4], [-0.05, 0.75, 5], [0.15, 0.8, 6]];
  for (const [fx, fr, i] of stuff) poke(c, fx * w, 10, 62 * fr * (o.s || 1), BAGCOL[i], (i - 3) * 0.25 + Math.sin((o.t || 0) * 3 + i) * 0.05 * (puff > 1.05 ? 3 : 1));
  if (o.nest !== false) { c.save(); c.translate(-w * 0.3, 20); nest(c, o.nestN ?? 3, (o.s || 1) * 1.2); c.restore(); }
  if (o.glow > 0) { c.save(); c.globalAlpha = o.glow; const g = c.createRadialGradient(0, 0, 10, 0, -150, 420); g.addColorStop(0, 'rgba(140,220,255,.95)'); g.addColorStop(1, 'rgba(140,220,255,0)'); c.fillStyle = g; c.beginPath(); c.ellipse(0, -120, 420, 320, 0, 0, TAU); c.fill(); c.restore(); }
  simpleBag(c, w, h, '#FFFFFF', '#5A9AD8', { hl: o.hl, hr: o.hr });
  // a bag hand-label on the side (bags drawn on it: a pictogram, no text)
  c.save(); c.translate(w * 0.05, h * 0.55); c.scale(0.5 * (o.s || 1), 0.5 * (o.s || 1)); simpleBag(c, 120, 110, '#EF7FAA', null); c.restore();
  K.mark(c, 'bag', 0, h * 0.45, Math.max(w, h) * 0.55); }
// a small loose bag lying on the floor
function floorBag(c, x, col, r) { c.save(); c.translate(x, 0); c.rotate(r); paint(c, q => { q.m(-80, 0); q.q(-90, -50, -40, -70); q.q(0, -40, 30, -80); q.q(90, -60, 80, 0); q.z(); }, col, { sd: 3, hd: 1, lw: 4 }); c.restore(); }
// the neat folded triangle
function triangle(c, s = 1, col = '#7FB8E0') { c.save(); c.scale(s, s); paint(c, q => { q.m(-60, 40); q.l(60, 40); q.l(0, -60); q.z(); }, col, { sd: 3, hd: 1, lw: 4 });
  c.strokeStyle = 'rgba(0,0,0,.2)'; c.lineWidth = 3; c.beginPath(); c.moveTo(-30, 40); c.lineTo(15, -35); c.moveTo(30, 40); c.lineTo(-15, -35); c.stroke(); c.restore(); }
function sparkle(c, x, y, r, k = 1) { if (k <= 0) return; c.save(); c.translate(x, y); c.scale(k, k); c.fillStyle = '#FFE15A'; c.strokeStyle = '#B8902A'; c.lineWidth = 3; c.beginPath();
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, rr_ = i % 2 ? r * 0.35 : r; c.lineTo(Math.cos(a) * rr_, Math.sin(a) * rr_); } c.closePath(); c.fill(); c.stroke(); c.restore(); }
function tears(c, hd, t, k) { if (k <= 0) return; c.save(); c.globalAlpha = k; for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const u = ((t * 1.6 + i * 0.33) % 1), x = hd.x + s * hd.hh * 0.42, y = hd.y + hd.hh * 0.1 + u * hd.hh * 0.9;
  c.fillStyle = '#7CC7F2'; c.strokeStyle = '#2E7AB0'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - hd.hh * 0.12); c.quadraticCurveTo(x + hd.hh * 0.07, y, x, y + hd.hh * 0.05); c.quadraticCurveTo(x - hd.hh * 0.07, y, x, y - hd.hh * 0.12); c.fill(); c.stroke(); } c.restore(); }

// ---------------- kitchen (prerendered, softly blurred)
const BX0 = -3600, BY0 = -4600, BWW = 7600, BHH = 7000, BS = 0.5;
function drawKitchen(c) {
  c.fillStyle = '#F3E6D2'; c.fillRect(BX0, BY0, BWW, BHH);
  c.fillStyle = '#EBD9BE'; c.fillRect(BX0, BY0, BWW, 700);                                       // cornice band
  c.fillStyle = '#D7ECE6'; c.fillRect(-1300, -1500, 3600, 600);                                  // tiled splashback
  c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 5; for (let y = -1500; y < CT; y += 75) { c.beginPath(); c.moveTo(-1300, y); c.lineTo(2300, y); c.stroke(); } for (let x = -1300; x < 2300; x += 75) { c.beginPath(); c.moveTo(x, -1500); c.lineTo(x, CT); c.stroke(); }
  // window above the sink: London roofs, grey sky, a chimney
  c.fillStyle = '#FFFDF8'; rr(c, SINK0 - 40, -2450, SINK1 - SINK0 + 80, 980, 16); c.fill();
  const g = c.createLinearGradient(0, -2410, 0, -1520); g.addColorStop(0, '#B9C7D6'); g.addColorStop(1, '#DCE4EC'); c.fillStyle = g; c.fillRect(SINK0, -2410, SINK1 - SINK0, 890);
  c.fillStyle = '#9A6A55'; c.beginPath(); c.moveTo(SINK0, -1700); c.lineTo(SINK0 + 120, -1800); c.lineTo(SINK0 + 260, -1720); c.lineTo(SINK0 + 360, -1830); c.lineTo(SINK1, -1740); c.lineTo(SINK1, -1520); c.lineTo(SINK0, -1520); c.fill();
  c.fillStyle = '#7A5040'; c.fillRect(SINK0 + 300, -1960, 60, 160); c.fillStyle = '#C96A4A'; for (const dx of [306, 336]) c.fillRect(SINK0 + dx, -1990, 20, 40);
  c.fillStyle = '#FFFDF8'; c.fillRect((SINK0 + SINK1) / 2 - 12, -2410, 24, 890); c.fillRect(SINK0, -1980, SINK1 - SINK0, 22);
  c.fillStyle = '#7FB8A0'; for (const dx of [-80, 0, 80]) { c.beginPath(); c.arc(SINK0 + 120 + dx, -1550, 34, 0, TAU); c.fill(); } c.fillStyle = '#C9824A'; rr(c, SINK0 + 30, -1550, 180, 50, 10); c.fill();   // herb pot on the sill
  // upper cupboards (left of the window, and his own on the right)
  for (const [x0, x1] of [[-1250, -650], [-640, -40], [-30, 520], [MYC1 + 10, 2280]]) { paint(c, q => { q.m(x0, -2300); q.l(x1, -2300); q.l(x1, -1620); q.l(x0, -1620); q.z(); }, '#A9CEC5', { sd: 8, hd: 4, lw: 4 }); c.fillStyle = '#C9A13A'; rr(c, x1 - 60, -1800, 18, 100, 9); c.fill(); }
  // a clock and a tea towel
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(-2000, -2100, 120, 0, TAU); c.fill(); c.strokeStyle = '#3E471E'; c.lineWidth = 12; c.stroke(); c.beginPath(); c.moveTo(-2000, -2100); c.lineTo(-2000, -2180); c.moveTo(-2000, -2100); c.lineTo(-1945, -2075); c.stroke();
  // the kitchen door on the far left (hallway)
  c.fillStyle = '#FFFDF8'; rr(c, -3000, -2400, 700, 2400, 10); c.fill(); c.fillStyle = '#B8A88E'; rr(c, -2950, -2350, 600, 2350, 6); c.fill(); c.fillStyle = '#A3937A'; c.fillRect(-2950, -400, 600, 400);
  // fridge on the right (magnets, no text)
  paint(c, q => { q.m(2350, -2350); q.l(3100, -2350); q.l(3100, 0); q.l(2350, 0); q.z(); }, '#E6ECF2', { sd: 8, hd: 4, lw: 4 }); c.fillStyle = '#C9D2DA'; c.fillRect(2350, -1500, 750, 14); c.fillRect(2400, -1400, 20, 300); c.fillRect(2400, -2200, 20, 300);
  for (const [x, y, col] of [[2600, -2000, '#E0474C'], [2800, -1900, '#F2C14E'], [2700, -1700, '#4CAF6A'], [2900, -1150, '#7FB8E0']]) { c.fillStyle = col; c.beginPath(); c.arc(x, y, 34, 0, TAU); c.fill(); }
  c.fillStyle = '#FFFFFF'; c.fillRect(2650, -1300, 200, 240); c.fillStyle = '#E5B2C4'; c.fillRect(2670, -1280, 160, 120);   // a drawing on the fridge
  // left wall: a shelf with jars
  c.fillStyle = '#C9A06A'; c.fillRect(-2200, -1600, 700, 30); for (const [x, col] of [[-2120, '#F2C14E'], [-1980, '#E0474C'], [-1840, '#8CCB7A'], [-1700, '#B79AE0']]) { c.fillStyle = col; rr(c, x - 45, -1760, 90, 160, 14); c.fill(); c.fillStyle = '#FFFDF8'; rr(c, x - 50, -1785, 100, 30, 8); c.fill(); }
  // floor
  c.fillStyle = '#D8C3A0'; c.fillRect(BX0, -10, BWW, BY0 + BHH + 10); c.fillStyle = 'rgba(0,0,0,.07)'; for (let y = -10; y < BY0 + BHH; y += 160) for (let x = BX0 + ((Math.round(y / 160)) % 2) * 160; x < BX0 + BWW; x += 320) c.fillRect(x, y, 160, 160);
}
const mkBG = fn => { const a = createCanvas(Math.round(BWW * BS), Math.round(BHH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawKitchen);

// live set pieces: base units (the under-sink cupboard open), worktop, sink, kettle; his own cupboard (opens in the twist)
const sinkOpen = L => L !== 'end';
const myOpen = (t, L) => L === 'end' ? eOut(clamp((t - ev('end', 'open')) / 0.35)) : 0;
function units(c, t, L) {
  paint(c, q => { q.m(-1300, CT); q.l(2300, CT); q.l(2300, 0); q.l(-1300, 0); q.z(); }, '#7FA8A0', { sd: 10, hd: 4, lw: 4 });
  for (const [x0, x1] of [[-1250, -700], [-680, -140], [-120, 600], [SINK0, SINK1], [SINK1 + 20, 1700], [1720, 2280]]) { const open = x0 === SINK0 && sinkOpen(L);
    if (open) { c.fillStyle = '#3A3028'; c.fillRect(x0 + 10, CT + 60, x1 - x0 - 20, -CT - 100); c.fillStyle = '#5A4A3C'; c.fillRect(x0 + 10, CT + 420, x1 - x0 - 20, 16);
      c.strokeStyle = '#8A93A2'; c.lineWidth = 26; c.beginPath(); c.moveTo((x0 + x1) / 2, CT + 60); c.lineTo((x0 + x1) / 2, CT + 260); c.quadraticCurveTo((x0 + x1) / 2, CT + 340, (x0 + x1) / 2 + 80, CT + 340); c.stroke();   // the pipe
      for (let i = 0; i < 4; i++) poke(c, x0 + 90 + i * 95, CT + 760, 50, BAGCOL[(i + 2) % 7], (i - 1.5) * 0.3);   // more bags still inside
      paint(c, q => { q.m(x0 - 150, CT + 90); q.l(x0 + 10, CT + 60); q.l(x0 + 10, -40); q.l(x0 - 150, -10); q.z(); }, '#9CC3BA', { sd: 6, hd: 3, lw: 3 }); continue; }
    paint(c, q => { q.m(x0 + 12, CT + 60); q.l(x1 - 12, CT + 60); q.l(x1 - 12, -40); q.l(x0 + 12, -40); q.z(); }, '#9CC3BA', { sd: 6, hd: 3, lw: 3 }); c.fillStyle = '#C9A13A'; rr(c, (x0 + x1) / 2 - 50, CT + 110, 100, 18, 9); c.fill(); }
  c.fillStyle = '#E6DCC8'; c.fillRect(-1320, CT - 30, 3640, 44);
  // sink + tap, kettle, mugs
  c.fillStyle = '#C9D2DA'; rr(c, SINK0 + 40, CT - 40, SINK1 - SINK0 - 80, 22, 8); c.fill(); c.strokeStyle = '#A8B2BC'; c.lineWidth = 22; c.lineCap = 'round'; c.beginPath(); c.moveTo((SINK0 + SINK1) / 2, CT - 30); c.lineTo((SINK0 + SINK1) / 2, CT - 220); c.quadraticCurveTo((SINK0 + SINK1) / 2, CT - 280, (SINK0 + SINK1) / 2 + 80, CT - 260); c.stroke();
  paint(c, q => { q.m(-560, CT - 30); q.l(-320, CT - 30); q.l(-350, CT - 270); q.q(-440, CT - 310, -530, CT - 270); q.z(); }, '#E0474C', { sd: 5, hd: 2, lw: 4 }); c.strokeStyle = '#2B2F3A'; c.lineWidth = 14; c.beginPath(); c.moveTo(-520, CT - 280); c.quadraticCurveTo(-440, CT - 360, -360, CT - 280); c.stroke();
  for (const [x, col] of [[-1000, '#F2C14E'], [-870, '#7FB8E0']]) { c.fillStyle = col; rr(c, x - 50, CT - 150, 100, 120, 16); c.fill(); c.strokeStyle = col; c.lineWidth = 12; c.beginPath(); c.arc(x + 58, CT - 95, 30, -1.2, 1.2); c.stroke(); }
  // his own upper cupboard: shut until the twist; inside: the little bag with seven bags
  const k = myOpen(t, L);
  c.fillStyle = '#4A3A30'; c.fillRect(MYC0, MYCY0, MYC1 - MYC0, MYCY1 - MYCY0);
  if (k > 0) { c.fillStyle = '#6A5444'; c.fillRect(MYC0, MYCY1 - 40, MYC1 - MYC0, 20);
    c.save(); c.translate((MYC0 + MYC1) / 2, MYCY1 - 330); simpleBag(c, 220, 260, '#7FB8E0', null); for (let i = 0; i < 7; i++) poke(c, -80 + i * 27, 8, 26, BAGCOL[i], (i - 3) * 0.28); c.restore();
    K.mark(c, 'mybag', (MYC0 + MYC1) / 2, MYCY1 - 200, 160); }
  const dw = (MYC1 - MYC0) * (1 - 0.8 * k);   // the door swings out to the right (foreshortened)
  paint(c, q => { q.m(MYC1 - dw, MYCY0 - 30 * k); q.l(MYC1 + (k > 0 ? 40 * k : 0), MYCY0); q.l(MYC1 + (k > 0 ? 40 * k : 0), MYCY1); q.l(MYC1 - dw, MYCY1 + 30 * k); q.z(); }, '#A9CEC5', { sd: 8, hd: 4, lw: 4 });
  if (k < 0.5) { c.fillStyle = '#C9A13A'; rr(c, MYC0 + 40, MYCY1 - 180, 18, 100, 9); c.fill(); }
  // bags already spilled on the floor around the open cupboard
  if (sinkOpen(L)) { floorBag(c, SINK0 + 60, '#F2C14E', 0.1); floorBag(c, SINK1 - 40, '#EF7FAA', -0.15); floorBag(c, 1250, '#8CCB7A', 0.05); } }

// ---------------- characters
const down = (g, s, drop = 0) => reach(g, s, s * g.sw * 1.08, g.ySh + drop + 540, { planar: true });
const open = (g, s, k = 1.7, dy = 90) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const hold = (g, s, dy = 330, k = 0.75) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const gestR = (g, t, id, dy = 150, k = 1.5) => { const u = (t - SP[id].t) * 4.5; return reach(g, 1, g.sw * (k + 0.15 * Math.sin(u)), g.ySh + dy + Math.cos(u) * 20, { planar: true }); };
const base = (g, t, who) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, armL: down(g, -1), armR: down(g, 1), items: {} });
// her items
const fanItem = n => (ctx, s) => { for (let i = 0; i < 3; i++) { const k = eBack(clamp(n - i), 2); if (k <= 0) continue; ctx.save(); ctx.rotate((i - 1) * 0.45); ctx.translate(0, -60); ctx.scale(k, k); ctx.translate(0, -150); simpleBag(ctx, 150, 160, ['#C9B89A', '#7FB8E0', '#EF7FAA'][i], ['#A8946E', '#FFFFFF', '#FFFFFF'][i], { hl: { x: -20, y: -40 }, hr: { x: 20, y: -40 } }); ctx.restore(); } };
const triItem = (s = 1) => ctx => { ctx.save(); ctx.translate(0, -50); triangle(ctx, s); ctx.restore(); };
const tinyItem = ctx => { ctx.save(); ctx.translate(0, -70); simpleBag(ctx, 76, 70, '#8CCB7A', null); ctx.restore(); };
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { ...base(g, t, 'her'), mood: 'neutral', turn: 0.3, look: 0.7 };
  if (L === 'hook') { st.mood = 'worried'; st.tilt = 0.05; st.armL = open(g, -1, 1.9, 70); st.armR = open(g, 1, 1.9, 70);
    if (t > hev('nar')) { st.mood = 'smug'; st.blink = 1; st.tilt = 0; st.armL = down(g, -1); st.armR = down(g, 1); }
    if (t > hev('wide')) { st.mood = 'happy'; st.blink = 0; } }
  if (L === 'o1') { st.mood = 'neutral';
    if (speaking('o1_h', t, 0.05, 0.1)) { st.mood = 'bored'; st.armR = gestR(g, t, 'o1_h', 200, 1.6); }
    if (t > e('breathe') + 0.3) { st.mood = 'surprised'; st.blink = 0; }
    if (t > e('puff')) { st.mood = 'shock'; st.breathe = 0; st.armL = open(g, -1, 1.6, 120); st.armR = open(g, 1, 1.6, 120); }
    if (t > e('sigh') + 0.2) { st.mood = 'worried'; st.armL = down(g, -1); st.armR = down(g, 1); } }
  if (L === 'o2') {
    if (speaking('o2_h', t, 0.05, 0.15)) { st.mood = 'worried'; st.tilt = 0.06; st.lookY = 0.15; st.armL = hold(g, -1, 300, 0.25); st.armR = hold(g, 1, 300, 0.25); }
    if (t > SP.o2_f.t) { st.mood = 'surprised'; st.tilt = 0; st.lookY = 0; }
    if (t > e('vortex')) { st.mood = 'shock'; st.blink = 0; st.armL = open(g, -1, 1.6, 120); st.armR = open(g, 1, 1.6, 120); } }
  if (L === 'o3') { st.mood = 'happy';
    if (speaking('o3_h', t, 0.05, 0.15)) { st.mood = 'smug'; st.armR = gestR(g, t, 'o3_h', 120, 1.55); st.blink = t > SP.o3_h.t + 1.6 ? 1 : 0; }
    if (t > SP.o3_f.t) { st.mood = 'happy'; st.blink = 0; }
    if (t > e('folded')) { st.laugh = true; } }
  if (L === 'o4') { st.mood = 'smug'; st.turn = 0.3; st.look = 0.6;
    const c1 = SP.o4_h.t + 2.31, c2 = SP.o4_h.t + 4.48, c3 = SP.o4_h.t + 6.15, c4 = SP.o4_h.t + 8.33;
    if (speaking('o4_h', t, 0.05, 0.1)) { st.mood = 'smug'; st.turn = 0.15; st.look = 0.3;
      if (t < c1) { st.armR = gestR(g, t, 'o4_h', 180, 1.6); }
      else if (t < c2) { st.mood = 'happy'; st.armR = reach(g, 1, g.sw * 1.35, g.ySh + 140, { planar: true }); st.items = { R: fanItem((t - e('gens')) / 0.18 + 1) }; }
      else if (t < c3) { st.mood = 'happy'; st.armR = reach(g, 1, g.sw * 1.3, g.ySh + 150, { planar: true }); st.items = { R: triItem(1.2) }; }
      else if (t < c4) { st.mood = 'smug'; st.blink = 1; st.armL = reach(g, -1, -g.sw * 0.2, g.ySh + 300, { planar: true }); st.armR = reach(g, 1, g.sw * 1.25, g.ySh + 120, { planar: true }); st.items = { R: tinyItem }; }
      else { st.mood = 'happy'; st.blink = 0; st.armR = reach(g, 1, g.sw * 1.45, g.ySh + 20, { planar: true }); st.armL = open(g, -1, 1.6, 120); st.items = { R: tinyItem }; } }
    if (t > endOf('o4_h') + 0.1) { st.mood = 'happy'; st.items = { R: tinyItem }; st.armR = hold(g, 1, 300, 0.7); st.turn = 0.3; st.look = 0.8; } }
  if (L === 'end') { st.mood = 'surprised'; st.turn = 0.35; st.look = 0.8;
    if (t > ev('end', 'proud')) { st.mood = 'happy'; st.laugh = true; const u = Math.abs(Math.sin((t - ev('end', 'proud')) * 9));
      st.armL = reach(g, -1, -g.sw * (0.25 + 0.25 * u), g.ySh + 260, { planar: true }); st.armR = reach(g, 1, g.sw * (0.25 + 0.25 * u), g.ySh + 260, { planar: true }); }
    if (t > ev('end', 'moral')) { st.laugh = false; st.mood = 'happy'; st.armL = down(g, -1); st.armR = down(g, 1); } }
  return st; }
// where Oliver's hands (and the bag handles) are, in his local coords; the bag hangs from them
function oliHands(t, L) { const g = G.flat1, y = g.ySh + 300;
  let hl = { x: -150, y }, hr = { x: 40, y };
  if (L === 'hook' && t < 0.5) { const k = eOut(clamp(t / 0.5)); hl.y = hr.y = y + 120 * (1 - k); }
  if (L === 'o1' && t > ev('o1', 'puff')) { const k = eOut(clamp((t - ev('o1', 'puff')) / 0.3)), b = 1 - eIO(clamp((t - ev('o1', 'sigh')) / 0.5)) * 0.7; hl = { x: lerp(-150, -560, k * b), y: lerp(y, y - 120, k * b) }; hr = { x: lerp(40, -330, k * b), y: lerp(y, y - 120, k * b) }; }
  if (L === 'o2' && t > ev('o2', 'lean') - 0.2) { const k = eIO(clamp((t - ev('o2', 'lean') + 0.2) / 0.4)); hl = { x: lerp(-150, -260, k), y: y - 60 * k }; hr = { x: lerp(40, -60, k), y: y - 60 * k }; }
  return { hl, hr }; }
const bagOnFloor = (t, L) => L === 'o3' || L === 'o4' || L === 'end';
const puffK = (t, L) => { if (L !== 'o1') return 1; const b0 = ev('o1', 'breathe'), p = ev('o1', 'puff'), s = ev('o1', 'sigh');
  let v = 1; if (t > b0) v += 0.07 * (1 - Math.cos((t - b0) * 5.2)) * (t > SP.o1_f.t ? 1.4 : 1);
  if (t > p) v = lerp(v, 1.45 + 0.04 * Math.sin(t * 9), eBack(clamp((t - p) / 0.35), 1.6)); if (t > s) v = lerp(1.45, 0.9, eOut(clamp((t - s) / 0.4))); return v; };
const glowK = (t, L) => L === 'o2' ? clamp((t - ev('o2', 'lean') - 0.2) / 0.5) * (1 - clamp((t - ev('o2', 'blown') - 0.6) / 0.6)) : 0;
function oliState(t, L) { const g = G.flat1, e = k => ev(L, k), st = { ...base(g, t, 'flat1'), mood: 'neutral', turn: -0.3, look: -0.7 };
  const { hl, hr } = oliHands(t, L);
  if (!bagOnFloor(t, L)) { st.armL = reach(g, -1, hl.x, hl.y); st.armR = reach(g, 1, hr.x, hr.y);
    st.front = (cc, a) => { cc.save(); cc.translate((hl.x + hr.x) / 2, hl.y + 120); bigBag(cc, { t, puff: puffK(t, L), glow: glowK(t, L), hl: { x: hl.x - (hl.x + hr.x) / 2, y: -120 }, hr: { x: hr.x - (hl.x + hr.x) / 2, y: -120 } }); cc.restore(); }; }
  if (L === 'hook') { st.mood = 'shock'; st.blink = 0;
    if (speaking('hook_f', t, 0.1, 0.1)) { st.mood = t < SP.hook_f.t + 1.6 ? 'shock' : 'surprised'; st.turn = -0.35; st.look = -0.8; st.tilt = 0.05 * Math.sin(t * 2); }
    if (t > hev('nar') + 0.3) { st.mood = 'skeptical'; } }
  if (L === 'o1') { st.mood = 'surprised';
    if (t > e('breathe') + 0.2) { st.mood = 'worried'; st.look = 0.2; st.lookY = 0.4; }
    if (speaking('o1_f', t, 0.05, 0.1)) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; st.look = -0.4; }
    if (t > e('puff')) { st.mood = 'shock'; st.headY = 6; st.tilt = 0.12; st.lean = 0.4; st.look = -1; }
    if (t > e('sigh') + 0.3) { st.mood = 'worried'; st.tilt = 0.06; st.lean = 0.2; } }
  if (L === 'o2') { st.mood = 'surprised';
    if (speaking('o2_f', t, 0.05, 0.1)) { st.mood = 'surprised'; st.blink = 0; }
    if (t > e('lean') - 0.2) { const k = eIO(clamp((t - e('lean') + 0.2) / 0.4)); st.lean = -0.9 * k; st.tilt = -0.15 * k; st.lookY = 0.7 * k; st.look = -0.5; st.mood = 'surprised'; }
    if (t > e('blown')) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; st.lean = 0.5; st.tilt = 0.1; st.lookY = 0; st.look = 0; st.hairSway = 0.6; }
    if (t > SP.o2_nar.t + 0.4) { st.mood = 'surprised'; st.lean = 0.2; st.hairSway = 0.2; } }
  if (L === 'o3') { st.mood = 'neutral';
    if (speaking('o3_h', t, 0.1, 0.1)) { st.mood = 'surprised'; }
    if (t > SP.o3_f.t - 0.05) { st.mood = 'happy'; st.headY = 6 * Math.abs(Math.sin((t - SP.o3_f.t) * 5)); }
    if (bagOnFloor(t, L)) { const u = t - e('fold'), k = eIO(clamp(u / 0.6));
      st.armL = reach(g, -1, -g.sw * 0.55, g.ySh + 320, { planar: true }); st.armR = reach(g, 1, g.sw * 0.55, g.ySh + 320 + Math.sin(u * 12) * 20 * (1 - clamp((t - e('folded')) / 0.2)), { planar: true });
      st.items = { R: (ctx, s) => { ctx.save(); ctx.translate(-30, -40); if (t < e('folded')) { ctx.rotate(Math.sin(u * 10) * 0.2); poke(ctx, 0, 30, 60 * (1 - 0.4 * k), '#7FB8E0', 0); } else triangle(ctx, 1.0); ctx.restore(); } };
      st.look = 0; st.lookY = 0.6; st.mood = 'happy';
      if (t > e('folded')) { const kk = eBack(clamp((t - e('folded')) / 0.3), 1.8); st.armR = reach(g, 1, g.sw * lerp(0.55, 1.4, kk), g.ySh + lerp(320, 60, kk), { planar: true }); st.lookY = 0; st.look = -0.7; st.mood = 'smug'; st.blink = 1; } } }
  if (L === 'o4') { st.mood = 'happy'; st.turn = -0.3; st.look = -0.8; st.armL = down(g, -1); st.armR = down(g, 1);
    if (speaking('o4_h', t, 0, 0)) { st.mood = t > ev('o4', 'jewel') ? 'surprised' : 'neutral'; }
    if (t > e('moved')) { st.mood = 'worried'; st.blink = 0; st.armL = reach(g, -1, -g.sw * 0.15, g.ySh + 250, { planar: true }); st.armR = reach(g, 1, g.sw * 0.15, g.ySh + 250, { planar: true }); st.tilt = 0.06; }
    if (t > endOf('o4_f')) { st.mood = 'happy'; st.blink = 1; } }
  if (L === 'end') { st.mood = 'happy'; st.turn = 0.1; st.look = -0.2;
    if (t < ev('end', 'open')) { st.turn = 0.5; st.look = 1; }
    if (t > ev('end', 'open') - 0.1) { st.armR = reach(g, 1, g.sw * 2.1, g.ySh - 60, { planar: true }); st.turn = -0.1; st.look = -0.5; }
    if (speaking('end_f', t, 0.05, 0)) { st.mood = 'smug'; st.blink = 0; st.armR = reach(g, 1, g.sw * 2.0, g.ySh + 80, { planar: true }); st.armL = down(g, -1); if (t > SP.end_f.t + 1.4) { st.mood = 'worried'; st.tilt = 0.08; } }
    if (t > endOf('end_f')) { st.mood = 'happy'; st.blink = 1; st.armL = down(g, -1); st.armR = down(g, 1); } }
  return st; }

// ---------------- world + which characters each shot draws
const DRAW = { wide: ['her', 'flat1'], cover: ['her', 'flat1'], two: ['her', 'flat1'], her: ['her'], oli: ['flat1'], endw: ['her', 'flat1'], cup: ['flat1'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
const herX = L => L === 'end' ? XE.her : X.her, oliX = L => L === 'end' ? XE.oli : X.oli;
function world(c, t, L, tag) { const who = DRAW[tag] || ['her', 'flat1'], heads = {};
  c.drawImage(BGR, BX0, BY0, BWW, BHH); units(c, t, L);
  if (bagOnFloor(t, L) && L !== 'end') { c.save(); c.translate(SINK1 - 120, CT - 520); bigBag(c, { t, s: 0.85 }); c.restore(); }   // the bag stands on the worktop behind him
  if (who.includes('flat1')) heads.flat1 = K.put(c, OLI, oliState(t, L), oliX(L), 0);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), herX(L), 0);
  // o2: blown by the time vortex — speed lines; o4/o3 sparkles; tears
  if (L === 'o2' && heads.flat1 && t > ev('o2', 'blown') && t < SP.o2_nar.t + 0.4) { const hd = heads.flat1; c.save(); c.strokeStyle = 'rgba(140,220,255,.8)'; c.lineWidth = 10; c.lineCap = 'round'; for (let i = 0; i < 6; i++) { const y = hd.y - hd.hh + i * hd.hh * 0.45, x = hd.x - hd.hh * 1.6 - ((t * 900 + i * 70) % 260); c.beginPath(); c.moveTo(x, y); c.lineTo(x - 140, y); c.stroke(); } c.restore();
    c.save(); c.globalAlpha = 0.25 * (1 - clamp((t - ev('o2', 'blown') - 0.8) / 0.6)); c.fillStyle = '#8CDCFF'; c.beginPath(); c.arc(hd.x, hd.y, hd.hh * 1.4, 0, TAU); c.fill(); c.restore(); }
  if (L === 'o4' && heads.flat1) tears(c, heads.flat1, t, clamp((t - ev('o4', 'moved') - 0.2) / 0.3));
  if (L === 'o4' && heads.her && speaking('o4_h', t)) { const c3 = SP.o4_h.t + 6.15, c4 = SP.o4_h.t + 8.33; if (t > c3) { const g = G.her, x = herX(L) + g.sw * (t < c4 ? 1.25 : 1.45), y = g.ySh + (t < c4 ? 120 : 20) - 110;
    for (let i = 0; i < 4; i++) { const a = t * 2 + i * TAU / 4; sparkle(c, x + Math.cos(a) * 110, y + Math.sin(a) * 90, 26, 0.6 + 0.4 * Math.abs(Math.sin(t * 6 + i))); } } }
  if (L === 'o3' && heads.flat1 && t > ev('o3', 'folded') && t < SP.o3_nar.t) { const g = G.flat1, x = X.oli + g.sw * 1.4 - 30, y = g.ySh + 60 - 100; for (let i = 0; i < 3; i++) sparkle(c, x + [-90, 90, 0][i], y + [-40, -20, -120][i], 24, eBack(clamp((t - ev('o3', 'folded') - i * 0.1) / 0.25), 2)); }
  if (L === 'o3' && heads.her && speaking('o3_h', t) && t > SP.o3_h.t + 1.3) { const g = G.her; for (let i = 0; i < 3; i++) sparkle(c, X.her + g.sw * 1.6 + [-60, 60, 0][i], g.ySh + 30 + [-30, -10, -120][i], 22, eBack(clamp((t - SP.o3_h.t - 1.3 - i * 0.1) / 0.25), 2)); }
  if (!heads.her) heads.her = OFFL; if (!heads.flat1) heads.flat1 = OFF;
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const HY = k => G[k].headY, fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(200, fy(HY('flat1'), 0.58, 1010), 0.58, 'cover'), WIDE: S(240, fy(HY('flat1'), 0.46, 760), 0.46, 'wide'),
  TWO: S((X.her + X.oli) / 2, fy(HY('flat1'), 0.66, 560), 0.66, 'two'),
  HER: S(X.her + 30, fy(HY('her'), 1.0), 1.0, 'her'), HER_W: S(X.her + 120, fy(HY('her'), 0.85, 760), 0.85, 'her'), HER_CU: S(X.her + 90, fy(HY('her'), 1.15, 860), 1.15, 'her'),
  OLI: S(X.oli - 40, fy(HY('flat1'), 0.95, 760), 0.95, 'oli'), OLI_W: S(X.oli - 230, fy(HY('flat1'), 0.78, 700), 0.78, 'oli'), OLI_CU: S(X.oli + 10, fy(HY('flat1'), 1.2, 860), 1.2, 'oli'),
  CUP: S(XE.oli + 60, fy(HY('flat1'), 0.72, 760), 0.72, 'cup'), OLI_E: S(XE.oli + 30, fy(HY('flat1'), 1.0, 800), 1.0, 'cup'),
  ENDW: S((XE.her + XE.oli) / 2 + 60, fy(HY('flat1'), 0.6, 640), 0.6, 'endw'),
  NEST: U('nest', 1), VORTEX: U('vortex', 2), PHONE: U('phone', 3) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < hev('nar') - 0.02) return f(SH.COVER); if (t < hev('nest') - 0.05) return f(SH.TWO); if (t < hev('wide') - 0.05) return f(SH.NEST); return f(SH.WIDE); }
  if (L === 'o1') { if (t < SP.o1_h.t - 0.1) return f(SH.WIDE); if (t < e('breathe')) return f(SH.HER); if (t < SP.o1_f.t - 0.1) return f(SH.TWO); if (t < e('puff') - 0.02) return f(SH.OLI); if (t < SP.o1_nar.t - 0.05) return f(SH.OLI_W); return f(SH.TWO); }
  if (L === 'o2') { if (t < SP.o2_h.t - 0.1) return f(SH.WIDE); if (t < SP.o2_f.t - 0.1) return f(SH.HER); if (t < e('vortex')) return f(SH.OLI); if (t < e('blown') - 0.02) return f(SH.VORTEX); if (t < SP.o2_nar.t - 0.05) return f(SH.OLI_CU); return f(SH.TWO); }
  if (L === 'o3') { if (t < SP.o3_h.t - 0.1) return f(SH.WIDE); if (t < SP.o3_f.t - 0.1) return f(SH.HER); if (t < SP.o3_nar.t - 0.05) return f(SH.OLI); return f(SH.TWO); }
  if (L === 'o4') { if (t < SP.o4_h.t - 0.1) return f(SH.WIDE); const h = SP.o4_h.t; if (t < h + 2.31) return f(SH.HER); if (t < h + 6.15) return f(SH.HER_W); if (t < h + 8.33) return f(SH.HER_CU); if (t < SP.o4_f.t - 0.1) return f(SH.HER_W); return f(SH.OLI_CU); }
  if (L === 'end') { if (t < SP.end_f.t - 0.1) return f(SH.CUP); if (t < e('phone') - 0.02) return f(SH.OLI_E); if (t < e('proud') - 0.02) return f(SH.PHONE); return f(SH.ENDW); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- inserts on a solid backdrop
function backdrop(c, t, a, b) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.08)'; for (let i = -12; i < 12; i++) c.fillRect(-1600, i * 160 + (t * 40) % 160, 3200, 60); c.restore(); }
// the matryoshka of bags pops out one by one (the tiniest: DO NOT TOUCH)
function nestView(c, t) { backdrop(c, t, '#F7E3B0', '#E8B860'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'nest' });
  const u = t - hev('nest'), k = eBack(clamp((u + 0.05) / 0.3), 1.6);
  c.save(); c.translate(540, 1150); c.scale(1.35 * k, 1.35 * k); bigBag(c, { t, nest: false }); c.translate(-90, 20); nest(c, (u - 0.2) / 0.3, 1.25); c.restore(); }
// looking down into the bag: a blue time vortex, a spinning clock, little bags flying out
function vortexView(c, t) { backdrop(c, t, '#1E2A4A', '#0E1630'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'vortex' });
  const u = t - ev('o2', 'vortex'), k = eBack(clamp((u + 0.05) / 0.3), 1.6);
  c.save(); c.translate(540, 960); c.scale(k, k);
  c.fillStyle = '#FFFFFF'; c.strokeStyle = '#C9CED6'; c.lineWidth = 14; c.beginPath(); c.ellipse(0, 0, 480, 420, 0, 0, TAU); c.fill(); c.stroke();   // the bag's rim
  c.save(); c.beginPath(); c.ellipse(0, 0, 440, 380, 0, 0, TAU); c.clip(); c.fillStyle = '#0B1E3A'; c.fillRect(-500, -500, 1000, 1000);
  for (let i = 0; i < 9; i++) { c.strokeStyle = i % 2 ? 'rgba(140,220,255,.85)' : 'rgba(180,140,255,.7)'; c.lineWidth = 18 - i; c.beginPath(); for (let a = 0; a < 5.5; a += 0.08) { const r = 30 + a * 70 + i * 8, aa = a + i * 0.7 - u * 6; c.lineTo(Math.cos(aa) * r, Math.sin(aa) * r * 0.86); } c.stroke(); }
  // a clock spinning in the middle
  c.save(); c.rotate(-u * 2); c.fillStyle = '#FFFDF2'; c.beginPath(); c.arc(0, 0, 110, 0, TAU); c.fill(); c.strokeStyle = '#3E471E'; c.lineWidth = 10; c.stroke();
  c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(u * 14) * 80, Math.sin(u * 14) * 80); c.moveTo(0, 0); c.lineTo(Math.cos(u * 3) * 55, Math.sin(u * 3) * 55); c.stroke(); c.restore();
  // little bags flying out toward the camera
  for (let i = 0; i < 6; i++) { const v = ((u * 0.9 + i / 6) % 1), a = i * 1.1 + u, r = 60 + v * 420; c.save(); c.translate(Math.cos(a) * r, Math.sin(a) * r * 0.86); c.rotate(a + u * 3); c.scale(0.25 + v * 0.9, 0.25 + v * 0.9); c.translate(0, -50); simpleBag(c, 110, 100, BAGCOL[i], null); c.restore(); }
  c.restore(); c.restore(); }
// Mum's texts (English)
function phoneView(c, t) { backdrop(c, t, '#BFE0F0', '#7FB4D8');
  const u = t - ev('end', 'phone'), k = eBack(clamp((u + 0.05) / 0.3), 1.6);
  K.phone(c, 540, 930, 1.7 * k, (q, w, h) => { q.fillStyle = '#FFFFFF'; q.fillRect(0, 0, w, h); q.fillStyle = '#EDEFF3'; q.fillRect(0, 0, w, 120);
    q.fillStyle = '#E0A07A'; q.beginPath(); q.arc(56, 66, 34, 0, TAU); q.fill(); q.fillStyle = '#7A4A30'; q.beginPath(); q.arc(56, 52, 30, Math.PI, TAU); q.fill();
    q.fillStyle = '#2B2F3A'; UI.font(q, 'Nun9', 34); q.textAlign = 'left'; q.textBaseline = 'middle'; q.fillText('Mum', 104, 66);
    const msgs = [['Oliver, love.', 0.3], ['Why is your cupboard full of BAGS?', 0.75], ['Call me. Now.', 1.2]];
    let y = 170; for (const [m, a] of msgs) { const kk = eBack(clamp((u - a) / 0.22), 2.2); UI.font(q, 'Nun9', 30); const lines = UI.wrap(q, m, 300), bh = 30 + lines.length * 38;
      if (kk > 0) { q.save(); q.translate(24, y); q.scale(kk, kk); q.fillStyle = '#E9ECF1'; rr(q, 0, 0, 340, bh, 24); q.fill(); q.fillStyle = '#2B2F3A'; UI.font(q, 'Nun9', 30); lines.forEach((l, i) => q.fillText(l, 22, 34 + i * 38)); q.restore(); }
      y += bh + 22; }
  }); }

// ---------------- overlays
function title(c, t) { const a = 1 - P(t, 2.25, 2.5); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 300); c.rotate(-0.04); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -102);
  UI.textFit(c, 'Unb9', 120, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 6, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 64, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 112);
  // the rubric label, small, on the plate's top edge
  c.save(); c.translate(0, -165); c.rotate(0.03); UI.font(c, 'Unb9', 30); const rw = c.measureText('НАШЕ ЗА ГРАНИЦЕЙ').width + 60; c.fillStyle = '#4CAF6A'; c.strokeStyle = C.oliveD; c.lineWidth = 5; rr(c, -rw / 2, -26, rw, 52, 26); c.fill(); c.stroke(); c.fillStyle = C.white; c.fillText('НАШЕ ЗА ГРАНИЦЕЙ', 0, 2); c.restore();
  c.restore();
  if (global.__QA) global.__QA.ui(c, 'card', { x: 50, y: 110, w: 980, h: 355, k: a, id: 'title' }); }
// "a week later" label for the twist beat
function weekLabel(c, t) { const s = SC.end.s, k = eBack(P(t, s + 0.05, s + 0.3), 2.2) * (1 - P(t, SP.end_f.t + 0.8, SP.end_f.t + 1.0)); if (k <= 0) return;
  c.save(); c.translate(540, 220); c.rotate(-0.03); c.scale(k, k); UI.font(c, 'Unb9', 54); const w = c.measureText('ЧЕРЕЗ НЕДЕЛЮ').width + 90; c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -50 + 9, w, 100, 50); c.fill(); c.fillStyle = C.oliveD; rr(c, -w / 2, -50, w, 100, 50); c.fill(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ЧЕРЕЗ НЕДЕЛЮ', 0, 4); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - 300, y: 170, w: 600, h: 100, k, id: 'week' }); }
const PLATES = { o1: ['1', 'В ЛОБ', '#E0474C'], o2: ['2', 'ВЕЖЛИВО', '#F2B33D'], o3: ['3', 'КАК НОСИТЕЛЬ', '#4CAF6A'], o4: ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', '#8E5BD0'] };
function plate(c, t, sc) { const p = PLATES[sc.id]; if (!p) return; const u = t - sc.s, out = P(t, sc.e - 0.15, sc.e);
  const k = eBack(P(u, 0, 0.25), 2.2) * (1 - eIn(out)), big = 1 - eIO(P(u, 0.3, 0.5)); if (k <= 0) return;
  UI.font(c, 'Unb9', 54); const tw = c.measureText(p[1]).width, w = tw + 200, h = 100, smax = Math.min(1, 760 / w), s = k * lerp(smax, Math.min(1.4, 880 / w), big), y = 215;
  c.save(); c.translate(540, y); c.scale(s, s); c.rotate(-0.025);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -h / 2 + 9, w, h, 50); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 50); c.fill(); c.stroke();
  c.fillStyle = p[2]; c.beginPath(); c.arc(-w / 2 + 50, 0, 50, 0, TAU); c.fill(); c.stroke(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p[0], -w / 2 + 50, 4);
  c.fillStyle = C.oliveD; c.textAlign = 'left'; c.fillText(p[1], -w / 2 + 120, 4); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w / 2 * s, y: y - 50 * s, w: w * s, h: 100 * s, k, id: 'plate_' + sc.id }); }

// ---------------- end screen: question, 1 / 2 / 3 / 4, СОХРАНИ, ПОДПИСАТЬСЯ clicked by the cursor; then the comment question (ask) big above the buttons
const wAt = (id, w, fb) => K.wordT(id, w) ?? fb;
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, { textFit, strokeText, font } = UI, askT = SC.outro.ev.ask;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // heroine with the tiny bag + Oliver with his folded triangle (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34, 2nd character at local x 640)
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gm = G.flat1; K.put(c, OLI, { t, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, armL: reach(gm, -1, -gm.sw * 1.7, gm.ySh + 60 + Math.sin(t * 6) * 15, { planar: true }), armR: reach(gm, 1, gm.sw * 1.3, gm.ySh + 140, { planar: true }), items: { R: triItem(1.3) } }, 640, 0);
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 160 + Math.sin(t * 8) * 30, { planar: true }), armR: hold(g, 1, 300, 0.9), items: { R: tinyItem } }, 0, 0); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  // the question; on the ask line it flips to the comment question
  const q = eBack(P(u, 0.2, 0.55), 2.2) * (1 - eIn(P(t, askT - 0.15, askT))); if (q > 0) { c.save(); c.translate(540, 300); c.scale(q, q); font(c, 'Unb9', 64); strokeText(c, 'А ТЫ БЫ', 0, -50, C.oliveD, C.white, 14); strokeText(c, 'ОТВЕТИЛА КАК?', 0, 40, C.pink, C.white, 14); c.restore(); }
  const qa = eBack(P(t, askT, askT + 0.3), 2.2); if (qa > 0) { const pu = 1 + 0.03 * Math.sin(t * 6); c.save(); c.translate(540, 290); c.scale(qa * pu, qa * pu); c.rotate(-0.02);
    textFit(c, 'Unb9', 74, 'ГДЕ У ВАС ЖИВЁТ', 900); strokeText(c, 'ГДЕ У ВАС ЖИВЁТ', 0, -62, C.oliveD, C.white, 14); textFit(c, 'Unb9', 74, 'ПАКЕТ С ПАКЕТАМИ?', 900); strokeText(c, 'ПАКЕТ С ПАКЕТАМИ?', 0, 42, C.pink, C.white, 14); c.restore();
    if (global.__QA) global.__QA.ui(c, 'card', { x: 70, y: 180, w: 940, h: 220, k: qa, id: 'ask' }); }
  const tw = [wAt('outro', 'один', sp.t + 1.2), wAt('outro', 'два', sp.t + 1.6), wAt('outro', 'три', sp.t + 1.9), wAt('outro', 'четыре', sp.t + 2.3)];
  const LBL = { o1: ['В ЛОБ'], o2: ['ВЕЖЛИВО'], o3: ['КАК', 'НОСИТЕЛЬ'], o4: ['КОРОЛЕВ-', 'СКИЙ'] };
  ['o1', 'o2', 'o3', 'o4'].forEach((id, i) => { const p = PLATES[id], kk = eBack(P(t, tw[i] - 0.1, tw[i] + 0.2), 2.2); if (kk <= 0) return; const x = 290 + (i % 2) * 420, y = 600 + Math.floor(i / 2) * 200, bump = 1 + 0.06 * Math.sin(clamp((t - tw[i]) / 0.4) * Math.PI);
    c.save(); c.translate(x, y); c.scale(kk * bump, kk * bump); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -195 + 8, -80 + 12, 390, 160, 36); c.fill(); c.fillStyle = p[2]; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -195, -80, 390, 160, 36); c.fill(); c.stroke();
    font(c, 'Unb9', 120); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(p[0], -125, 8);
    const ls = LBL[id]; ls.forEach((s_, j) => { textFit(c, 'Unb9', 34, s_, 230); c.fillStyle = C.white; c.textAlign = 'left'; c.fillText(s_, -60, (j - (ls.length - 1) / 2) * 42 + 4); }); c.restore(); });
  const svT = wAt('outro', 'пиши', sp.t + 3.0) - 0.1, sk = eBack(P(t, svT, svT + 0.3), 2.2), pulse = 1 + 0.05 * Math.sin(clamp((t - svT - 0.4) / 0.5) * Math.PI);
  if (sk > 0) { c.save(); c.translate(540, 1000); c.scale(sk * pulse, sk * pulse); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -260 + 6, -60 + 10, 520, 120, 60); c.fill(); c.fillStyle = C.gold; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -260, -60, 520, 120, 60); c.fill(); c.stroke();
    c.fillStyle = C.oliveD; c.beginPath(); c.moveTo(-190, -32); c.lineTo(-146, -32); c.lineTo(-146, 34); c.lineTo(-168, 16); c.lineTo(-190, 34); c.closePath(); c.fill();   // bookmark icon
    textFit(c, 'Unb9', 50, 'СОХРАНИ', 330); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.fillText('СОХРАНИ', 40, 4); c.restore(); }
  const subT = Math.min(svT + 0.7, sp.t + sp.d - 1.0), bk = eBack(P(t, subT, subT + 0.3), 2), sy = 1200;
  if (bk > 0) { const click = P(t, subT + 0.8, subT + 0.95), pressed = t > subT + 0.9; c.save(); c.translate(560, sy); const ss = bk * (1 - 0.08 * Math.sin(click * Math.PI)); c.scale(ss, ss); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -250 + 6, -58 + 10, 500, 116, 58); c.fill(); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -250, -58, 500, 116, 58); c.fill(); textFit(c, 'Unb9', 42, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 440); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4); c.restore();
    const mv = eIO(P(t, subT + 0.2, subT + 0.8)); UI.tapCursor(c, lerp(900, 620, mv), lerp(sy + 260, sy + 20, mv), 1, P(t, subT + 0.85, subT + 1.4)); }
  if (t < askT - 0.1) { c.save(); c.translate(0, -130); UI.captions(c, t); c.restore(); }   // the ask line is shown big at the top instead of a caption
  Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag.startsWith('ui:')) { if (tag === 'ui:nest') nestView(c, t); else if (tag === 'ui:vortex') vortexView(c, t); else phoneView(c, t); heads = { her: OFFL, flat1: OFF }; proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.24); }
  const names = { flat1: ['OLIVER', '#2E7A50'] }, onScr = {}; for (const k in heads) if (Math.abs(heads[k].x) < 1e4) onScr[k] = heads[k];   // a speaker who is not in the shot never gets a bubble
  if (!tag.startsWith('ui:')) K.bubbles(c, t, sc, onScr, proj, { cleanChunks: true, names, hold: { hook_f: -0.2, o1_h: -0.22, o1_f: -0.2, o2_h: -0.22, o2_f: -0.2, o3_h: -0.22, o3_f: -0.2, o4_h: -0.15, o4_f: -0.2, end_f: -0.2 } });
  if (L === 'hook') title(c, t);
  if (L === 'end') weekLabel(c, t);
  plate(c, t, sc);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  // the end screen wipes in from the twist
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('bagofbags', NF, renderFrame);
