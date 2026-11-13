// "Мама кормит иностранного парня: «Ешь ещё!»" — rubric «Наше за границей» (scene + 4 answers, worst -> best), hard_cut camera: node eatmore.js start end out.mp4 | --png=f1,f2
// Her parents' dining room: her mum (standing, apron, ladle + enamel pot) has just put the FIFTH plate in front of Callum — a dumpling tower taller than
// his head; four empty plates are stacked beside him. Absurd detail: grandpa sleeps at the table, never lets go of his fork and chews in his sleep (Z z z).
// hook: Callum whispers "Babe, help. That's my fifth plate."
// o1 «В ЛОБ»: "Eat. Or she cries." — mum's lip trembles, a tear -> "...Pass the dumplings." -> he eats with two forks at once; mum beams; she covers her eyes.
// o2 «ВЕЖЛИВО»: "Maybe say no, but politely?" -> "I did. She heard 'more, please'." -> mum ladles more, the tower grows over his face.
// o3 «КАК НОСИТЕЛЬ»: "Feeding you is how she says she loves you..." -> he pats his belly, hand on heart, mum melts (hearts)
//    -> "It worked! She's... packing me leftovers." -> mum hands him a bag with a tower of containers; he staggers; tip "I'm stuffed."
// o4 «КОРОЛЕВСКИЙ ОТВЕТ»: "...Leave one dumpling. It's a white flag." -> close-up: one dumpling with a tiny white flag -> "...One dumpling. For peace."
//    -> mum nods with respect, hand on heart; grandpa salutes with his fork in his sleep.
// Twist (music silent): «ГОД СПУСТЯ» — Callum's mum's sitting room in England: he puts a second (then a third) plate in front of his mum:
//    "Callum, love... what have they done to you?" — he proudly raises the ladle. Moral. End screen 1/2/3/4 + СОХРАНИ + ПОДПИСАТЬСЯ, then the comment question.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/eatmore/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];
// handovers: a per-line hold below 0.05 shortens the bubble itself, so it is fully gone before the cut to the next speaker
{ const _bub = UI.bubble; UI.bubble = (ctx, sp, t, an, side, name) => _bub(ctx, sp.hold < 0.05 ? { ...sp, d: sp.d + sp.hold - 0.05, hold: 0.05 } : sp, t, an, side, name); }

// ---------------- cast
const HER = { ...BASE.her_lift };
const CAL = { ...BASE.tom, hair: { style: 'curly', col: '#C8642E' }, brow: '#9A4A20', top: { type: 'sweater', col: '#3E8A5A' }, bottom: { type: 'jeans', col: '#3B4A6A' }, shoes: { col: '#FFFFFF', acc: '#3E8A5A' } };
const MUM = { ...BASE.linda, age: 0.6, hair: { style: 'bouffant', col: '#9A3A2A' }, earrings: '#F2C14E', necklace: true,
  build: { shoulder: 0.95, hip: 1.12, arm: 0.95, belly: 0.25 }, top: { type: 'cardigan', col: '#C2416A', col2: '#F7E6EC' }, bottom: { type: 'skirt', col: '#5A3A4A' }, shoes: { col: '#6A2A3A', acc: null } };
const GP = { ...BASE.joe, top: { type: 'cardigan', col: '#8A6A4A', col2: '#E9E0D0' } };
const HMUM = { ...BASE.margot, age: 0.7, hair: { style: 'bob', col: '#D9C2A0' }, glasses: { col: '#5A3A8A', shape: 'round' }, top: { type: 'cardigan', col: '#8E7BC8', col2: '#F4F0FA' }, bottom: { type: 'skirt', col: '#4A4A6A' } };
const G = { her: geom(HER), cal: geom(CAL), mum: geom(MUM), gp: geom(GP), hmum: geom(HMUM) };
const SEAT = 330, TOP = -500;                        // seated upper body dropped by SEAT; dining-table top at y = TOP
const MUMX = -1030, TWX = -590, CALX = -330, STX = -80, HERX = 240, HPX = 220, GPX = 720, GPPX = 640;
const TX0 = -760, TX1 = 1020;                        // table front (left .. right)
// twist room (Callum's mum's house): she sits at a small table, he stands left of it
const HMX = 260, CAL2X = -330, TOP2 = -470, T2X0 = -60, T2X1 = 640;
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function star(c, x, y, r, a = 1, col = '#FFF6C8') { c.save(); c.globalAlpha *= a; c.translate(x, y); c.fillStyle = col; c.beginPath(); for (let i = 0; i < 8; i++) { const rr_ = i % 2 ? r * 0.28 : r, an = i * Math.PI / 4; c.lineTo(Math.cos(an) * rr_, Math.sin(an) * rr_); } c.closePath(); c.fill(); c.restore(); }
function heart(c, x, y, r, col = '#EE5E9A') { c.save(); c.translate(x, y); c.scale(r / 50, r / 50); c.fillStyle = col; c.strokeStyle = '#8A2A50'; c.lineWidth = 5; c.beginPath(); c.moveTo(0, 34); c.bezierCurveTo(-70, -10, -40, -66, 0, -30); c.bezierCurveTo(40, -66, 70, -10, 0, 34); c.closePath(); c.fill(); c.stroke(); c.restore(); }
function zz(c, x, y, s, a) { if (a <= 0) return; c.save(); c.globalAlpha *= a; c.translate(x, y); c.scale(s, s); c.strokeStyle = '#5A6AA8'; c.lineWidth = 9; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(-22, -22); c.lineTo(22, -22); c.lineTo(-22, 22); c.lineTo(22, 22); c.stroke(); c.restore(); }

// ---------------- props (paths only)
function dumpling(c, x, y, s = 1, r = 0) { c.save(); c.translate(x, y); c.rotate(r); c.scale(s, s);
  paint(c, q => { q.m(-40, 8); q.q(-42, -40, 0, -44); q.q(42, -40, 40, 8); q.q(0, 18, -40, 8); q.z(); }, '#F8F0DE', { sd: 6, hd: 3, lw: 3 });
  c.strokeStyle = 'rgba(170,140,90,.55)'; c.lineWidth = 3; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * 13, -36 + Math.abs(i) * 5); c.lineTo(i * 15, -24 + Math.abs(i) * 4); c.stroke(); }
  c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.ellipse(-14, -22, 10, 6, -0.4, 0, TAU); c.fill(); c.restore(); }
// a plate seen slightly from above, at table height
function plateBase(c, x, y = TOP - 14, s = 1, rim = '#E0474C') { c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(0, 10, 200, 40, 0, 0, TAU); c.fill();
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.ellipse(0, 0, 195, 38, 0, 0, TAU); c.fill(); c.strokeStyle = '#7A8496'; c.lineWidth = 4; c.stroke();
  c.strokeStyle = rim; c.lineWidth = 6; c.beginPath(); c.ellipse(0, 0, 160, 28, 0, 0, TAU); c.stroke(); c.restore(); }
// the dumpling tower: rows from the plate up; extra = rows added by mum's ladle; wide = wider pile
function tower(c, x, rows, wide = 0, t = 0) { plateBase(c, x, TOP - 14);
  for (let r = 0; r < rows; r++) { const n = Math.max(1, 6 + wide - Math.floor(r / 2)), y = TOP - 30 - r * 66, w = 64;
    for (let i = 0; i < n; i++) { const dx = (i - (n - 1) / 2) * w + (r % 2 ? 10 : -10); dumpling(c, x + dx, y, 0.95, (hash(r * 7 + i) - 0.5) * 0.5); } }
  const top = TOP - 30 - rows * 66;
  c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 12; c.lineCap = 'round';
  for (const dx of [-30, 20]) { c.beginPath(); const u = (t * 0.7 + dx * 0.01) % 1; c.globalAlpha = 0.8 * (1 - u); c.moveTo(x + dx, top - 10 - u * 60); c.bezierCurveTo(x + dx - 30, top - 70 - u * 60, x + dx + 30, top - 110 - u * 60, x + dx, top - 160 - u * 60); c.stroke(); }
  c.globalAlpha = 1; K.mark(c, 'tower', x, (TOP + top) / 2, 260); return top; }
// a stack of n empty plates (side view)
function plateStack(c, x, n) { for (let i = 0; i < n; i++) { const y = TOP - 14 - i * 22; c.fillStyle = 'rgba(0,0,0,.12)'; c.beginPath(); c.ellipse(x, y + 8, 170, 30, 0, 0, TAU); c.fill();
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.ellipse(x, y, 165, 30, 0, 0, TAU); c.fill(); c.strokeStyle = '#7A8496'; c.lineWidth = 4; c.stroke(); c.strokeStyle = '#E0474C'; c.lineWidth = 4; c.beginPath(); c.ellipse(x, y, 132, 22, 0, Math.PI * 0.05, Math.PI * 0.95); c.stroke(); } }
// enamel pot with red flowers (held by a handle at the top centre)
function pot(c) { paint(c, q => { q.m(-120, 40); q.l(120, 40); q.l(110, 210); q.q(0, 230, -110, 210); q.z(); }, '#F4F1EC', { sd: 8, hd: 4, lw: 4 });
  for (const [x, y] of [[-55, 110], [10, 150], [65, 95]]) { c.fillStyle = '#E0474C'; for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; c.beginPath(); c.arc(x + Math.cos(a) * 13, y + Math.sin(a) * 13, 11, 0, TAU); c.fill(); } c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(x, y, 8, 0, TAU); c.fill(); }
  c.fillStyle = '#2B2F3A'; rr(c, -130, 30, 260, 20, 10); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 10; c.beginPath(); c.arc(0, 30, 70, Math.PI, TAU); c.stroke();
  c.strokeStyle = 'rgba(255,255,255,.65)'; c.lineWidth = 10; c.lineCap = 'round'; for (const dx of [-40, 30]) { c.beginPath(); c.moveTo(dx, 10); c.quadraticCurveTo(dx - 25, -40, dx, -90); c.stroke(); } }
const potItem = ctx => { ctx.save(); ctx.translate(0, -20); pot(ctx); ctx.restore(); };
// ladle: handle from the hand, bowl at the end (a = angle of the handle; full = dumpling in the bowl)
const ladleItem = (a = 0.5, full = false) => ctx => { ctx.save(); ctx.rotate(a); ctx.strokeStyle = '#B8C0CA'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(0, 190); ctx.stroke();
  paint(ctx, q => { q.m(-48, 190); q.q(-50, 250, 0, 252); q.q(50, 250, 48, 190); q.z(); }, '#C9D0D8', { sd: 4, hd: 2, lw: 4 }); if (full) dumpling(ctx, 0, 196, 0.8); ctx.restore(); };
const forkUp = ctx => { ctx.save(); ctx.scale(1.5, 1.5); ctx.rotate(0.25); ctx.strokeStyle = '#C9CED6'; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(0, -100); ctx.stroke(); for (const dx of [-12, 0, 12]) { ctx.beginPath(); ctx.moveTo(dx, -100); ctx.lineTo(dx, -136); ctx.stroke(); } ctx.restore(); };
const forkMirror = ctx => { ctx.save(); ctx.scale(-1, 1); forkUp(ctx); ctx.restore(); };
const forkPiece = (mir = false) => ctx => { ctx.save(); if (mir) ctx.scale(-1, 1); forkUp(ctx); ctx.scale(1.5, 1.5); ctx.rotate(0.25); dumpling(ctx, 0, -134, 0.55); ctx.restore(); };
// carrier bag with a tower of food containers
function bagTower(c) { for (let i = 0; i < 6; i++) { const y = -60 - i * 78, w = 150 - (i % 2) * 10; paint(c, q => { q.m(-w, y); q.l(w, y); q.l(w - 10, y - 66); q.l(-w + 10, y - 66); q.z(); }, 'rgba(236,244,250,.95)', { sd: 3, hd: 1, lw: 3 });
    c.fillStyle = ['#E0474C', '#4CAF6A', '#3E73B8', '#F2B33D'][i % 4]; rr(c, -w + 4, y - 78, 2 * w - 8, 18, 8); c.fill();
    c.fillStyle = ['#C98B5A', '#F6E2A8', '#E8889E', '#B8692E'][(i + 1) % 4]; rr(c, -w + 24, y - 54, 2 * w - 48, 34, 10); c.fill(); }
  paint(c, q => { q.m(-180, -150); q.l(180, -150); q.l(170, 120); q.l(-170, 120); q.z(); }, '#F2D94E', { sd: 6, hd: 3, lw: 4 });
  c.strokeStyle = '#B89A20'; c.lineWidth = 10; c.beginPath(); c.moveTo(-120, -150); c.quadraticCurveTo(-130, -230, -70, -240); c.moveTo(120, -150); c.quadraticCurveTo(130, -230, 70, -240); c.stroke(); }
const bagItem = ctx => { ctx.save(); ctx.translate(0, 120); ctx.scale(0.9, 0.9); bagTower(ctx); ctx.restore(); };
// the white flag on a toothpick, stuck into one dumpling
function flagDumpling(c, x, y, s, k, t) { dumpling(c, x, y, s); if (k <= 0) return; c.save(); c.translate(x + 4 * s, y - 30 * s); c.scale(s * k, s * k);
  c.strokeStyle = '#C98B5A'; c.lineWidth = 5; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -130); c.stroke();
  const wv = Math.sin(t * 6) * 6; c.fillStyle = '#FFFFFF'; c.strokeStyle = '#7A8496'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -128); c.quadraticCurveTo(40, -138 + wv, 80, -126); c.lineTo(80, -84); c.quadraticCurveTo(40, -96 + wv, 0, -86); c.closePath(); c.fill(); c.stroke(); c.restore(); }
// apron over mum's cardigan
function apron(c, g) { const sw = g.sw, y0 = g.ySh; paint(c, q => { q.m(-sw * 0.55, y0 + 70); q.l(sw * 0.55, y0 + 70); q.l(sw * 0.75, y0 + 640); q.l(-sw * 0.75, y0 + 640); q.z(); }, '#FFFDF6', { sd: 8, hd: 4, lw: 4, inner: k => { k.fillStyle = '#7DBA4A'; for (let i = 0; i < 12; i++) { k.beginPath(); k.arc(-sw * 0.5 + (i % 4) * sw * 0.34, y0 + 150 + Math.floor(i / 4) * 150, 11, 0, TAU); k.fill(); } } });
  c.strokeStyle = '#FFFDF6'; c.lineWidth = 10; c.beginPath(); c.moveTo(-sw * 0.5, y0 + 74); c.lineTo(-sw * 0.25, y0 - 30); c.moveTo(sw * 0.5, y0 + 74); c.lineTo(sw * 0.25, y0 - 30); c.stroke(); }
function sweat(c, hd, t, k) { if (k <= 0) return; c.save(); c.globalAlpha = k; for (let i = 0; i < 3; i++) { const u = ((t * 1.4 + i * 0.33) % 1), x = hd.x + (i - 1) * hd.hh * 0.9 + (i === 1 ? hd.hh * 1.3 : 0), y = hd.y - hd.hh * 0.9 + u * hd.hh * 0.9;
  c.fillStyle = '#7CC7F2'; c.strokeStyle = '#2E7AB0'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - hd.hh * 0.16); c.quadraticCurveTo(x + hd.hh * 0.09, y, x, y + hd.hh * 0.06); c.quadraticCurveTo(x - hd.hh * 0.09, y, x, y - hd.hh * 0.16); c.fill(); c.stroke(); } c.restore(); }
function tears(c, hd, t, k) { if (k <= 0) return; c.save(); c.globalAlpha = k; for (const s of [-1, 1]) { const u = (t * 1.2 + (s > 0 ? 0.5 : 0)) % 1, x = hd.x + s * hd.hh * 0.42, y = hd.y + hd.hh * 0.05 + u * hd.hh * 0.8;
  c.fillStyle = '#9CD8F7'; c.strokeStyle = '#2E7AB0'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - hd.hh * 0.14); c.quadraticCurveTo(x + hd.hh * 0.09, y, x, y + hd.hh * 0.07); c.quadraticCurveTo(x - hd.hh * 0.09, y, x, y - hd.hh * 0.14); c.fill(); c.stroke(); } c.restore(); }

// ---------------- her parents' dining room (prerendered, softly blurred): wallpaper, sideboard with crystal, window with tulle, wall clock
const BX0 = -3200, BY0 = -4400, BW = 6600, BH = 6600, BS = 0.5;
function drawRoom(c) {
  c.fillStyle = '#F3DDB8'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = 'rgba(190,120,70,.16)'; for (let x = BX0; x < BX0 + BW; x += 160) for (let y = BY0; y < -900; y += 200) { const o = ((y / 200) % 2) * 80; c.beginPath(); c.moveTo(x + o, y); c.lineTo(x + o + 26, y + 40); c.lineTo(x + o, y + 80); c.lineTo(x + o - 26, y + 40); c.closePath(); c.fill(); }
  c.fillStyle = '#C99A6A'; c.fillRect(BX0, -980, BW, 60);   // dado rail
  c.fillStyle = '#E6C9A0'; c.fillRect(BX0, -920, BW, 920);
  // window with tulle + curtains (centre-right, behind her)
  const g = c.createLinearGradient(0, -2900, 0, -1300); g.addColorStop(0, '#8EC9F0'); g.addColorStop(1, '#E2F2FA');
  c.fillStyle = '#FFFDF6'; rr(c, -240, -2950, 1100, 1700, 18); c.fill(); c.fillStyle = g; rr(c, -210, -2920, 1040, 1640, 10); c.fill(); c.fillStyle = '#FFFDF6'; c.fillRect(301, -2920, 18, 1640); c.fillRect(-210, -2150, 1040, 18);
  c.fillStyle = 'rgba(255,255,255,.55)'; for (let x = -210; x < 830; x += 70) { c.beginPath(); c.moveTo(x, -2920); c.quadraticCurveTo(x + 35, -2100, x, -1280); c.lineTo(x + 40, -1280); c.quadraticCurveTo(x + 75, -2100, x + 40, -2920); c.fill(); }
  c.fillStyle = '#B8434E'; rr(c, -420, -3060, 230, 1900, 30); c.fill(); rr(c, 810, -3060, 230, 1900, 30); c.fill(); c.fillStyle = '#8A6A4A'; c.fillRect(-500, -3090, 1620, 30);
  // sideboard with crystal glasses (left)
  c.fillStyle = '#8A5A3A'; c.fillRect(-2700, -2900, 1500, 2900); c.fillStyle = '#6A4A2E'; c.fillRect(-2660, -2860, 1420, 60);
  c.fillStyle = 'rgba(200,230,245,.55)'; c.fillRect(-2640, -2760, 1380, 1300); c.strokeStyle = '#6A4A2E'; c.lineWidth = 16; c.strokeRect(-2640, -2760, 1380, 1300); c.beginPath(); c.moveTo(-1950, -2760); c.lineTo(-1950, -1460); c.stroke();
  c.fillStyle = '#6A4A2E'; c.fillRect(-2640, -2130, 1380, 16);
  for (const sy of [-2150, -1480]) for (let i = 0; i < 9; i++) { const x = -2560 + i * 150; c.fillStyle = 'rgba(255,255,255,.75)'; c.beginPath(); c.moveTo(x - 30, sy); c.lineTo(x + 30, sy); c.lineTo(x + 22, sy - 120); c.lineTo(x - 22, sy - 120); c.closePath(); c.fill(); c.strokeStyle = 'rgba(120,160,190,.8)'; c.lineWidth = 4; c.stroke(); c.beginPath(); c.moveTo(x - 18, sy - 40); c.lineTo(x + 18, sy - 90); c.stroke(); }
  c.fillStyle = '#7A4E30'; for (let i = 0; i < 3; i++) { c.fillRect(-2640 + i * 470, -1380, 440, 1300); } c.fillStyle = '#F2C14E'; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(-2420 + i * 470, -730, 18, 0, TAU); c.fill(); }
  // wall clock + framed photo
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(-800, -2500, 150, 0, TAU); c.fill(); c.strokeStyle = '#8A6A4A'; c.lineWidth = 16; c.stroke(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 10; c.beginPath(); c.moveTo(-800, -2500); c.lineTo(-800, -2600); c.moveTo(-800, -2500); c.lineTo(-730, -2470); c.stroke();
  c.fillStyle = '#C99A3A'; rr(c, 1500, -2700, 500, 600, 14); c.fill(); c.fillStyle = '#9CCBE4'; rr(c, 1540, -2660, 420, 520, 8); c.fill(); c.fillStyle = '#7DBA4A'; c.beginPath(); c.moveTo(1540, -2140); c.lineTo(1700, -2400); c.lineTo(1820, -2250); c.lineTo(1960, -2450); c.lineTo(1960, -2140); c.fill();
  // fridge-ish cupboard on the far right + a rubber plant
  c.fillStyle = '#E9E2D4'; rr(c, 2300, -2600, 700, 2600, 30); c.fill(); c.strokeStyle = '#B8AE9C'; c.lineWidth = 8; c.beginPath(); c.moveTo(2650, -2600); c.lineTo(2650, 0); c.stroke();
  c.fillStyle = '#C98B5A'; rr(c, 1700, -500, 300, 500, 30); c.fill(); c.fillStyle = '#4C9A5A'; for (let i = 0; i < 7; i++) { c.save(); c.translate(1850, -500); c.rotate(-1.2 + i * 0.4); c.beginPath(); c.ellipse(0, -260, 60, 200, 0, 0, TAU); c.fill(); c.restore(); }
  // floor
  c.fillStyle = '#B8875A'; c.fillRect(BX0, 0, BW, BY0 + BH); c.fillStyle = 'rgba(0,0,0,.07)'; for (let x = BX0; x < BX0 + BW; x += 220) c.fillRect(x, 0, 8, BY0 + BH);
}
// Callum's mum's sitting room (twist): striped wallpaper, rainy window, teapot shelf
function drawRoom2(c) {
  c.fillStyle = '#DCE8D6'; c.fillRect(BX0, BY0, BW, BH); c.fillStyle = 'rgba(80,130,90,.18)'; for (let x = BX0; x < BX0 + BW; x += 180) c.fillRect(x, BY0, 70, BH);
  c.fillStyle = '#FFFFFF'; c.fillRect(BX0, -900, BW, 900); c.fillStyle = '#C9D6C4'; c.fillRect(BX0, -940, BW, 50);
  const g = c.createLinearGradient(0, -2900, 0, -1400); g.addColorStop(0, '#7E8A98'); g.addColorStop(1, '#B8C2CC');
  c.fillStyle = '#FFFFFF'; rr(c, -1500, -2900, 1000, 1500, 14); c.fill(); c.fillStyle = g; rr(c, -1470, -2870, 940, 1440, 8); c.fill(); c.fillStyle = '#FFFFFF'; c.fillRect(-1009, -2870, 18, 1440); c.fillRect(-1470, -2160, 940, 18);
  c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 5; for (let i = 0; i < 40; i++) { const x = -1450 + hash(i * 3) * 900, y = -2850 + hash(i * 5) * 1380; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 14, y + 60); c.stroke(); }
  c.fillStyle = '#8A6A4A'; c.fillRect(700, -2300, 1300, 40); for (let i = 0; i < 4; i++) { const x = 800 + i * 320; c.fillStyle = ['#E8889E', '#7FB5A8', '#F2C14E', '#9CCBE4'][i]; c.beginPath(); c.ellipse(x, -2380, 90, 70, 0, 0, TAU); c.fill(); c.fillRect(x - 30, -2470, 60, 30); c.strokeStyle = c.fillStyle; c.lineWidth = 14; c.beginPath(); c.moveTo(x + 80, -2390); c.quadraticCurveTo(x + 150, -2420, x + 150, -2470); c.stroke(); }
  c.fillStyle = '#C99A3A'; rr(c, 900, -1900, 420, 520, 14); c.fill(); c.fillStyle = '#F4EFE6'; rr(c, 935, -1865, 350, 450, 8); c.fill(); c.fillStyle = '#C8642E'; c.beginPath(); c.arc(1110, -1700, 70, 0, TAU); c.fill(); c.fillStyle = '#F3C9A8'; c.beginPath(); c.arc(1110, -1660, 60, 0, TAU); c.fill(); c.fillStyle = '#3E8A5A'; c.fillRect(1030, -1590, 160, 170);
  c.fillStyle = '#7A6A8A'; c.fillRect(BX0, 0, BW, BY0 + BH); c.fillStyle = 'rgba(255,255,255,.08)'; for (let y = 60; y < 2200; y += 140) c.fillRect(BX0, y, BW, 30);
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawRoom), BGR2 = mkBG(drawRoom2);
function chair(c, x, col = '#6A4A34', pad = '#E8B86A') { c.fillStyle = col; rr(c, x - 170, -1120, 340, 640, 40); c.fill(); c.fillStyle = pad; rr(c, x - 140, -1090, 280, 580, 34); c.fill(); c.fillStyle = 'rgba(255,255,255,.12)'; rr(c, x - 120, -1070, 90, 540, 30); c.fill(); }
function cloth(c, x0, x1, top, col = '#FFFFFF', check = 'rgba(224,71,76,.5)') {
  c.fillStyle = 'rgba(0,0,0,.22)'; c.fillRect(x0 - 40, -20, x1 - x0 + 80, 40);
  paint(c, q => { q.m(x0, top); q.l(x1, top); q.l(x1 + 40, -60); q.l(x0 - 40, -60); q.z(); }, col, { sd: 6, hd: 3, lw: 4, inner: k => { k.fillStyle = check; for (let x = x0 - 40; x < x1 + 40; x += 120) k.fillRect(x, top, 60, 600); for (let y = top + 30; y < -60; y += 120) k.fillRect(x0 - 40, y, x1 - x0 + 80, 60); } });
  paint(c, q => { q.m(x0 - 30, top - 40); q.l(x1 + 30, top - 40); q.l(x1, top + 12); q.l(x0, top + 12); q.z(); }, '#FFF8F0', { sd: 4, hd: 2, lw: 4 }); }

// tower size by scene/time (each answer starts from the same fifth plate)
const ROWS = 14;
function towerRows(t, L) { if (L === 'o2') { const a = ev('o2', 'ladle'); return ROWS + Math.min(4, Math.floor(clamp((t - a - 0.25) / 1.3) * 4.99)); } return ROWS; }
const towerWide = (t, L) => L === 'o2' && t > ev('o2', 'ladle') + 0.9 ? 1 : 0;
const oneLeft = (t, L) => L === 'o4' && t > ev('o4', 'place');
// order: cloth -> tower -> Callum (clipped above the cloth, so his forks and hands are in front of the tower) -> the other plates
function tableFront(c, t, L, drawCal) {
  cloth(c, TX0, TX1, TOP);
  if (oneLeft(t, L)) { plateBase(c, TWX); flagDumpling(c, TWX, TOP - 26, 0.95, eBack(clamp((t - ev('o4', 'flag')) / 0.3), 2), t); }
  else tower(c, TWX, towerRows(t, L), towerWide(t, L), t);
  if (drawCal) { c.save(); c.beginPath(); c.rect(-5000, -6000, 10000, 6000 + TOP + 12); c.clip(); drawCal(); c.restore(); }
  plateStack(c, STX, 4);
  plateBase(c, HPX); dumpling(c, HPX - 50, TOP - 30, 0.9); dumpling(c, HPX + 40, TOP - 26, 0.9, 0.2);
  plateBase(c, GPPX); dumpling(c, GPPX + 20, TOP - 28, 0.9);
  // bread, sour cream bowl, salt
  c.fillStyle = '#C98B5A'; c.beginPath(); c.ellipse(470, TOP - 30, 90, 30, 0, 0, TAU); c.fill(); c.fillStyle = '#E8B86A'; for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(440 + i * 30, TOP - 60, 40, 22, 0.3, 0, TAU); c.fill(); }
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.ellipse(900, TOP - 30, 80, 26, 0, 0, TAU); c.fill(); c.strokeStyle = '#3E73B8'; c.lineWidth = 6; c.stroke(); c.fillStyle = '#FFFDF6'; c.beginPath(); c.ellipse(900, TOP - 40, 60, 16, 0, 0, TAU); c.fill(); }

// ---------------- characters
const toW = (g, s, x0, wx, wy, o = {}) => reach(g, s, wx - x0, wy - SEAT, { planar: true, ...o });   // seated: world target -> body-local target
const onTable = (g, s) => reach(g, s, s * g.sw * 0.7, g.ySh + 335, { planar: true });
const seated = (g, t, who) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, legPose: 'sit', drop: SEAT, legs: false, armL: onTable(g, -1), armR: onTable(g, 1), items: {} });
const down = (g, s, drop = 0) => reach(g, s, s * g.sw * 1.08, g.ySh + drop + 540, { planar: true });
const open = (g, s, k = 1.7, dy = 90) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const gest = (st, g, who, t, side, b) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.45 + Math.sin(u) * 20), g.ySh + b + Math.cos(u) * 20, { planar: true }); } };
const chest = (g, s, dx = 0.2) => reach(g, s, -s * g.sw * dx, g.ySh + 170, { planar: true });       // hand on heart / clasped at the chest
const belly = (g, s) => reach(g, s, s * g.sw * 0.2, g.ySh + 380, { planar: true });

function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { ...seated(g, t, 'her'), mood: 'happy', turn: -0.3, look: -0.7 };
  if (L === 'hook') { st.mood = 'worried'; st.look = -0.8; if (t > hev('nar')) { st.mood = 'surprised'; } if (t > hev('wide')) { st.mood = 'worried'; st.tilt = 0.05; } }
  if (L === 'o1') { st.mood = 'neutral';
    if (speaking('o1_h', t, 0.05, 0.1)) { st.mood = 'angry'; st.lean = -0.15; const u = (t - SP.o1_h.t) * 6; st.armL = reach(g, -1, -g.sw * (1.6 + 0.1 * Math.sin(u)), g.ySh + 120 + Math.abs(Math.sin(u)) * 40, { planar: true }); st.armR = open(g, 1, 1.3, 200); }
    if (t > e('tear')) { st.mood = 'worried'; st.lean = 0; }
    if (t > e('facepalm')) { st.mood = 'tired'; st.blink = 1; st.headFirst = true; st.armR = reach(g, 1, g.hw * 0.15, g.headY - g.hh * 0.05, { planar: true }); st.tilt = 0.08; st.look = -0.3; } }
  if (L === 'o2') { st.mood = 'neutral';
    if (speaking('o2_h', t, 0.05, 0.1)) { st.mood = 'worried'; st.tilt = -0.05; gest(st, g, 'her', t, -1, 160); }
    if (t > SP.o2_b.t) { st.mood = 'surprised'; st.tilt = 0; }
    if (t > e('ladle') + 0.3) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; st.armL = open(g, -1, 1.4, 120); st.armR = open(g, 1, 1.4, 120); } }
  if (L === 'o3') { st.mood = 'happy';
    if (speaking('o3_h', t, 0.05, 0.1)) { const u = t - SP.o3_h.t; st.mood = u > 2.8 ? 'smug' : 'happy'; st.tilt = 0.04; gest(st, g, 'her', t, -1, 140); if (u < 2.6) st.armR = chest(g, 1, 0.25); }
    if (t > e('pat')) { st.mood = 'happy'; st.look = -0.8; }
    if (t > e('bag')) { st.mood = 'surprised'; st.blink = 0; }
    if (t > e('stagger')) { st.mood = 'happy'; st.laugh = true; st.blink = 1; } }
  if (L === 'o4') { st.mood = 'neutral';
    if (speaking('o4_h', t, 0.05, 0.1)) { const u = t - SP.o4_h.t; st.mood = u > 7.2 ? 'smug' : 'skeptical'; st.lean = -0.1; gest(st, g, 'her', t, -1, 130); if (u > 5.3) st.armL = reach(g, -1, -g.sw * 1.7, g.ySh + 30, { planar: true }); }
    if (t > endOf('o4_h') + 0.05) { st.mood = 'smug'; st.blink = 1; st.lean = 0; }
    if (t > e('nod')) { st.mood = 'happy'; st.blink = 0; } }
  return st; }

const CHEW = t => 0.15 + 0.2 * Math.abs(Math.sin(t * 5.5));
function calState(t, L) { const g = G.cal, e = k => ev(L, k), st = { ...seated(g, t, 'bf14'), mood: 'worried', turn: 0.3, look: 0.7 };
  st.armL = toW(g, -1, CALX, TWX + 130, TOP - 60); st.armR = onTable(g, 1);
  if (L === 'hook') { st.mood = 'worried'; st.blink = 0;
    if (speaking('hook_b', t, 0.3, 0.1)) { st.lean = 0.18; st.turn = 0.4; st.look = 0.9; st.headFirst = true; st.armR = reach(g, 1, g.hw * 1.15, g.headY + g.hh * 0.55, { planar: true }); }
    if (t > hev('nar')) { st.lean = 0; st.turn = -0.15; st.look = -0.5; st.lookY = -0.4; st.mood = 'worried'; }
    if (t > hev('cu')) { st.mood = 'shock'; st.breathe = 0; st.lookY = -0.6; }
    if (t > hev('wide')) { st.mood = 'worried'; st.lookY = -0.3; } }
  if (L === 'o1') {
    if (speaking('o1_h', t, 0.05, 0.1)) { st.mood = 'surprised'; }
    if (t > e('tear')) { st.mood = 'shock'; st.blink = 0; st.look = -0.6; st.turn = -0.2; }
    if (speaking('o1_b', t, 0.1, 0)) { st.mood = 'worried'; st.look = -0.4; st.armL = open(g, -1, 1.3, 220); }
    if (t > e('forks')) { const u = t - e('forks'), ph = (u / 0.22) % 2, upL = Math.max(0, Math.sin(ph * Math.PI)), upR = Math.max(0, -Math.sin(ph * Math.PI));
      st.mood = 'worried'; st.blink = 0; st.lookY = 0.2; st.look = -0.3; st.turn = -0.1; st.headFirst = true; st.talk = CHEW(t) + 0.2;
      st.armL = toW(g, -1, CALX, lerp(TWX + 120, CALX - 40, upL), lerp(TOP - 380, G.cal.headY + SEAT + g.hh * 0.75, upL)); st.armR = toW(g, 1, CALX, lerp(CALX + 200, CALX + 40, upR), lerp(TOP - 120, G.cal.headY + SEAT + g.hh * 0.75, upR));
      st.items = { L: upL > 0.4 ? forkPiece(true) : forkMirror, R: upR > 0.4 ? forkPiece() : forkUp }; } }
  if (L === 'o2') {
    if (speaking('o2_h', t, 0.05, 0.1)) { st.mood = 'worried'; st.look = 0.8; }
    if (speaking('o2_b', t, 0.1, 0.05)) { st.mood = 'sad'; st.look = 0.6; st.turn = 0.25; const u = t - SP.o2_b.t; st.armL = open(g, -1, 1.5, 140 + Math.sin(u * 4) * 20); st.armR = open(g, 1, 1.5, 140 + Math.sin(u * 4 + 1) * 20); }
    if (t > e('ladle')) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; st.look = -0.6; st.lookY = -0.6; st.turn = -0.2; st.armL = onTable(g, -1); st.armR = onTable(g, 1); }
    if (t > e('hidden')) { st.mood = 'sad'; st.drop = SEAT + 90 * eOut(clamp((t - e('hidden')) / 0.3)); st.lookY = -0.2; } }
  if (L === 'o3') { st.mood = 'neutral';
    if (speaking('o3_h', t, 0.05, 0.1)) { const u = t - SP.o3_h.t; st.mood = u > 2.8 ? 'surprised' : 'neutral'; }
    if (t > e('pat')) { const k = eOut(clamp((t - e('pat')) / 0.25)); st.mood = 'happy'; st.blink = 1; st.turn = -0.35; st.look = -0.9; st.armL = belly(g, -1); st.armR = chest(g, 1, 0.3 * k); st.headY = 8 * Math.sin(clamp((t - e('pat')) / 0.6) * Math.PI); }
    if (t > SP.o3_b.t - 0.05) { st.mood = 'surprised'; st.blink = 0; st.turn = 0.3; st.look = 0.8; st.armL = open(g, -1, 1.5, 120); st.armR = open(g, 1, 1.5, 120); }
    if (t > e('bag') + 0.25) { const u = t - e('bag'); st.mood = 'happy'; st.turn = -0.1; st.look = -0.3; st.armL = reach(g, -1, -g.sw * 0.5, g.ySh + 300, { planar: true }); st.armR = reach(g, 1, g.sw * 0.5, g.ySh + 300, { planar: true }); st.items = { R: bagItem }; st.armsFirst = false;
      if (t > e('stagger')) { st.mood = 'worried'; st.blink = 0; st.headX = 14 * Math.sin((t - e('stagger')) * 9) * Math.exp(-(t - e('stagger')) * 1.2); st.tilt = 0.05 * Math.sin((t - e('stagger')) * 9); } } }
  if (L === 'o4') { st.mood = 'neutral';
    if (speaking('o4_h', t, 0.05, 0.1)) { const u = t - SP.o4_h.t; st.mood = u > 5.3 ? 'surprised' : 'worried'; }
    if (t > e('place')) { st.mood = 'happy'; st.blink = 1; st.armL = onTable(g, -1); st.armR = chest(g, 1, 0.25); st.turn = -0.1; st.look = -0.4; st.lookY = 0.3; }
    if (speaking('o4_b', t, 0.05, 0.05)) { st.mood = 'neutral'; st.blink = 0; st.lookY = 0; st.look = 0.3; st.turn = 0.2; }
    if (t > e('nod')) { st.mood = 'happy'; st.blink = 1; st.armR = chest(g, 1, 0.25); } }
  return st; }

function mumState(t, L) { const g = G.mum, e = k => ev(L, k), st = { t, talk: 0, mood: 'happy', turn: 0.35, look: 0.7, armL: reach(g, -1, -g.sw * 0.7, g.ySh + 330, { planar: true }), armR: reach(g, 1, g.sw * 0.8, g.ySh + 300, { planar: true }), items: { L: potItem, R: ladleItem(0.4) }, afterTorso: (cc, gg) => apron(cc, gg) };
  const toTower = (dy = 0) => reach(g, 1, TWX - MUMX - 20, TOP - 30 - ROWS * 66 - 140 + dy, { planar: true });
  if (L === 'hook') { st.mood = 'happy'; st.blink = 0;
    const k = eIO(clamp(t / 0.45)); st.armR = reach(g, 1, lerp(TWX - MUMX - 60, g.sw * 0.9, k), lerp(TOP - 120, g.ySh + 280, k), { planar: true }); st.armL = reach(g, -1, lerp(TWX - MUMX - 260, -g.sw * 0.7, k), lerp(TOP - 120, g.ySh + 330, k), { planar: true }); st.items = k < 0.6 ? {} : st.items;
    if (t > hev('mum')) { st.mood = 'happy'; st.laugh = true; st.blink = 1; const u = t - hev('mum'); st.armR = reach(g, 1, g.sw * 1.5, g.ySh - 40 + Math.sin(u * 6) * 20, { planar: true }); st.items = { L: potItem, R: ladleItem(2.6) }; st.headY = -Math.abs(Math.sin(u * 5)) * 6; }
    if (t > hev('cu')) { st.laugh = false; st.blink = 0; st.armR = reach(g, 1, g.sw * 0.8, g.ySh + 300, { planar: true }); st.items = { L: potItem, R: ladleItem(0.4) }; } }
  if (L === 'o1') { st.mood = 'happy';
    if (t > SP.o1_h.t + 0.6) { st.mood = 'worried'; st.blink = 0; }
    if (t > e('tear')) { st.mood = 'sad'; st.blink = 0; st.tilt = -0.06; st.headY = 6 * Math.sin(t * 30); st.armL = chest(g, -1, 0.1); st.items = { R: ladleItem(0.4) }; }
    if (t > e('beam')) { st.mood = 'happy'; st.laugh = true; st.tilt = 0; st.headY = 0; st.blink = 1; st.armL = reach(g, -1, -g.sw * 0.7, g.ySh + 330, { planar: true }); st.items = { L: potItem, R: ladleItem(0.4) }; } }
  if (L === 'o2') {
    if (t > SP.o2_b.t + 1.2) { st.mood = 'happy'; st.laugh = true; }
    if (t > e('ladle')) { const u = t - e('ladle'), ph = (u / 0.32) % 1; st.mood = 'happy'; st.laugh = true; st.blink = 1; st.armR = toTower(-60 * Math.sin(ph * Math.PI) - Math.min(4, u / 0.32) * 66); st.items = { L: potItem, R: ladleItem(0.1 + 0.9 * Math.sin(ph * Math.PI), ph < 0.5) }; }
    if (t > e('hidden') + 0.1) { st.armR = reach(g, 1, g.sw * 1.4, g.ySh - 20, { planar: true }); st.items = { L: potItem, R: ladleItem(2.6) }; } }
  if (L === 'o3') { st.mood = 'happy';
    if (t > e('melt') - 0.3) { st.mood = 'happy'; st.blink = 1; st.laugh = false; st.tilt = 0.08; st.armL = chest(g, -1, 0.15); st.armR = chest(g, 1, 0.15); st.items = {}; }
    if (t > SP.o3_b.t + 0.6) { st.tilt = 0; st.blink = 0; st.mood = 'happy'; const k = eOut(clamp((t - (SP.o3_b.t + 0.6)) / 0.4)); st.armL = reach(g, -1, -g.sw * 0.4, g.ySh + 300, { planar: true }); st.armR = reach(g, 1, lerp(g.sw * 0.6, TWX - MUMX + 200, k), g.ySh + 300 - 40 * k, { planar: true }); st.items = t < e('bag') + 0.25 ? { R: bagItem } : {}; }
    if (t > e('bag') + 0.25) { st.mood = 'happy'; st.laugh = true; st.blink = 1; st.armR = chest(g, 1, 0.15); st.armL = chest(g, -1, 0.15); } }
  if (L === 'o4') { st.mood = 'neutral';
    if (t > e('place') + 0.4) { st.mood = 'surprised'; st.blink = 0; st.lookY = 0.3; }
    if (t > e('nod')) { const k = eIO(clamp((t - e('nod')) / 0.4)); st.mood = 'happy'; st.blink = 1; st.lookY = 0; st.headY = 24 * k; st.tilt = -0.05 * k; st.armL = chest(g, -1, 0.15); st.items = { R: ladleItem(0.4) }; } }
  return st; }

function gpState(t, L) { const g = G.gp, st = { ...seated(g, t, 'gp'), mood: 'happy', blink: 1, turn: -0.1, look: -0.2, tilt: 0.12 + 0.03 * Math.sin(t * 1.3), talk: CHEW(t), headY: 10 + 4 * Math.sin(t * 1.3) };
  st.armR = toW(g, 1, GPX, GPX + 150, TOP - 140); st.items = { R: forkUp };
  if (L === 'o4' && t > ev('o4', 'salute')) { const k = eOut(clamp((t - ev('o4', 'salute')) / 0.3)); st.armR = reach(g, 1, lerp(g.sw * 0.9, g.sw * 1.5, k), lerp(g.ySh + 200, g.ySh - 230, k), { planar: true }); st.tilt = 0.04; st.talk = 0.1; }   // raises his fork like a flag-bearer, still asleep
  return st; }
// twist: Callum standing, his mum seated
function cal2State(t) { const g = G.cal, e = k => ev('end', k), st = { t, talk: talk('bf14', t), mood: 'happy', turn: 0.35, look: 0.8, armL: down(g, -1), armR: down(g, 1), items: {} };
  const pl = ctx => { ctx.save(); ctx.translate(0, 0); plateBase(ctx, 0, -10, 0.7); for (const [x, y] of [[-50, -26], [30, -24], [-10, -52]]) dumpling(ctx, x, y, 0.75); ctx.restore(); };
  const k = eIO(clamp((t - e('place')) / 0.4));
  if (t < e('place') + 0.4) { st.armL = reach(g, -1, lerp(g.sw * 0.6, g.sw * 1.0, k), g.ySh + 330, { planar: true }); st.armR = reach(g, 1, lerp(g.sw * 0.9, g.sw * 2.1, k), g.ySh + lerp(330, 380, k), { planar: true }); st.items = { R: pl }; }
  if (t > SP.end_m.t) { st.mood = 'happy'; st.blink = 0; st.look = 0.9; }
  if (t > e('proud')) { st.mood = 'smug'; st.blink = 1; st.armL = reach(g, -1, -g.sw * 0.3, g.ySh + 380, { planar: true }); st.armR = reach(g, 1, g.sw * 1.4, g.ySh - 60, { planar: true }); st.items = { R: ladleItem(2.7) }; }
  if (t > e('third') - 0.3 && t < e('third') + 0.3) { const k2 = eIO(clamp((t - e('third') + 0.3) / 0.3)); st.armL = reach(g, -1, lerp(-g.sw * 0.3, g.sw * 1.6, k2), g.ySh + 380, { planar: true }); st.items = { R: ladleItem(2.7), L: pl }; }
  if (t > e('third') + 0.3) { st.mood = 'happy'; st.laugh = true; st.blink = 1; }
  return st; }
function hmumState(t) { const g = G.hmum, e = k => ev('end', k), st = { ...seated(g, t, 'hismum3'), mood: 'neutral', turn: -0.3, look: -0.7 };
  if (t > e('place') + 0.3) { st.mood = 'surprised'; st.lookY = 0.4; st.look = -0.2; st.blink = 0; }
  if (speaking('end_m', t, 0.05, 0.1)) { const u = t - SP.end_m.t; st.mood = 'worried'; st.lookY = 0; st.look = -0.8; st.armL = open(g, -1, 1.4, 160 + 20 * Math.sin(u * 3)); st.armR = chest(g, 1, 0.2); st.tilt = -0.05; }
  if (t > endOf('end_m') + 0.1) { st.mood = 'worried'; st.armL = onTable(g, -1); st.armR = onTable(g, 1); }
  if (t > e('third') + 0.1) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; st.lookY = 0.4; st.armL = open(g, -1, 1.3, 150); st.armR = open(g, 1, 1.3, 150); }
  return st; }
const plates2 = (t) => 1 + (t > ev('end', 'place') + 0.35 ? 1 : 0) + (t > ev('end', 'third') ? 1 : 0);

// ---------------- world + which characters each shot draws (clean singles: only the tagged character)
const DRAW = { wide: ['mum', 'cal', 'her', 'gp'], cover: ['mum', 'cal', 'her', 'gp'], two: ['cal', 'her'], mumcal: ['mum', 'cal'], her: ['her'], cal: ['cal'], mum: ['mum'], gp: ['gp'], plate: [], endw: ['cal2', 'hmum'], cal2: ['cal2'], hmum: ['hmum'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  if (L === 'end') { c.drawImage(BGR2, BX0, BY0, BW, BH);
    if (who.includes('hmum')) { chair(c, HMX, '#5A4A6A', '#B8A8D8'); heads.hismum3 = K.put(c, HMUM, hmumState(t), HMX, 0); }
    cloth(c, T2X0, T2X1, TOP2, '#FFFFFF', 'rgba(62,115,184,.35)');
    const n = plates2(t); for (let i = 0; i < n; i++) { const x = [140, 380, 260][i], y = TOP2 - 14 - (i === 2 ? 24 : 0); plateBase(c, x, y, 0.85, '#3E73B8'); for (const [dx, dy] of [[-50, -14], [30, -12], [-10, -40]]) dumpling(c, x + dx, y + dy, 0.8); }
    c.fillStyle = '#F4EFE6'; c.beginPath(); c.ellipse(560, TOP2 - 40, 50, 60, 0, 0, TAU); c.fill(); c.fillStyle = '#E8889E'; c.fillRect(520, TOP2 - 70, 80, 20);   // a teacup
    K.mark(c, 'plates2', 260, TOP2 - 40, 260);
    if (who.includes('cal2')) heads.bf14 = K.put(c, CAL, cal2State(t), CAL2X, 0);
    if (L === 'end' && t > ev('end', 'proud') && heads.bf14) { const u = t - ev('end', 'proud'), k = eBack(clamp(u / 0.3), 2) * (1 - clamp((u - 1.0) / 0.3)); if (k > 0) star(c, CAL2X + G.cal.sw * 1.5, G.cal.ySh - 300, 60 * k); }
    if (!heads.bf14) heads.bf14 = OFFL; if (!heads.hismum3) heads.hismum3 = OFF; return heads; }
  c.drawImage(BGR, BX0, BY0, BW, BH);
  if (who.includes('cal')) chair(c, CALX); if (who.includes('her')) chair(c, HERX); if (who.includes('gp')) chair(c, GPX);
  if (who.includes('gp')) { const hd = K.put(c, GP, gpState(t, L), GPX, 0); zzz(c, t, hd); }
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), HERX, 0);
  tableFront(c, t, L, who.includes('cal') ? () => { heads.bf14 = K.put(c, CAL, calState(t, L), CALX, 0); } : null);
  if (who.includes('mum')) heads.mum = K.put(c, MUM, mumState(t, L), MUMX, 0);
  // gags on top
  if (heads.bf14) { const hk = L === 'hook' ? clamp((t - hev('nar')) / 0.3) : L === 'o1' ? clamp((t - ev('o1', 'forks')) / 0.3) : L === 'o2' ? clamp((t - ev('o2', 'ladle')) / 0.3) : L === 'o3' ? clamp((t - ev('o3', 'stagger')) / 0.3) : 0; sweat(c, heads.bf14, t, hk); }
  if (heads.mum && L === 'o1') tears(c, heads.mum, t, clamp((t - ev('o1', 'tear')) / 0.2) * (1 - clamp((t - ev('o1', 'beam')) / 0.2)));
  if (heads.mum && L === 'o3' && t > ev('o3', 'melt')) { const u = t - ev('o3', 'melt'); for (let i = 0; i < 3; i++) { const v = (u * 0.8 + i / 3) % 1, a = clamp(u / 0.3) * (1 - v); heart(c, heads.mum.x + (i - 1) * 110 + Math.sin(v * 6 + i) * 20, heads.mum.y - heads.mum.hh * 1.6 - v * 260, 36 + 10 * i, '#EE5E9A'); c.globalAlpha = 1; void a; } }
  if (L === 'o1' && heads.mum && t > ev('o1', 'beam')) { const k = eBack(clamp((t - ev('o1', 'beam')) / 0.3), 2) * (1 - clamp((t - ev('o1', 'beam') - 1.0) / 0.3)); if (k > 0) { star(c, heads.mum.x - 160, heads.mum.y - 120, 50 * k); star(c, heads.mum.x + 170, heads.mum.y - 60, 36 * k); } }
  if (L === 'o4' && t > ev('o4', 'flag')) { const k = eBack(clamp((t - ev('o4', 'flag')) / 0.3), 2) * (1 - clamp((t - ev('o4', 'flag') - 1.2) / 0.3)); if (k > 0) { star(c, TWX - 150, TOP - 140, 44 * k); star(c, TWX + 160, TOP - 100, 30 * k); } }
  if (!heads.bf14) heads.bf14 = OFF; if (!heads.her) heads.her = OFF;
  return heads; }
function zzz(c, t, hd) { for (let i = 0; i < 3; i++) { const u = (t * 0.45 + i / 3) % 1; zz(c, hd.x + 90 + u * 120 + i * 10, hd.y - hd.hh * 1.2 - u * 240, 0.9 + u * 0.8, Math.sin(Math.PI * u)); } }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const cHY = G.cal.headY + SEAT, hHY = G.her.headY + SEAT, gHY = G.gp.headY + SEAT, mHY = G.mum.headY, c2HY = G.cal.headY, hmHY = G.hmum.headY + SEAT;
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(-180, fy(cHY, 0.48, 1150), 0.48, 'cover'), WIDE: S(-180, fy(cHY, 0.48, 960), 0.48, 'wide'),
  TWO: S(-140, fy(cHY, 0.72, 860), 0.72, 'two'), MUMCAL: S(-720, fy(cHY, 0.62, 1010), 0.62, 'mumcal'),
  HER: S(HERX + 30, fy(hHY, 1.0, 880), 1.0, 'her'), HER_CU: S(HERX + 20, fy(hHY, 1.25, 860), 1.25, 'her'), HER_R: S(HERX + 30, fy(hHY, 1.0, 1080), 1.0, 'her'),
  CAL: S(CALX - 80, fy(cHY, 0.95, 860), 0.95, 'cal'), CAL_CU: S(CALX - 120, fy(cHY, 1.15, 980), 1.15, 'cal'),
  MUM: S(MUMX + 160, fy(mHY, 0.9, 860), 0.9, 'mum'), GP: S(GPX - 20, fy(gHY, 1.1, 920), 1.1, 'gp'), PLATE: S(TWX + 20, TOP - 160, 2.3, 'plate'),
  ENDW: S((CAL2X + HMX) / 2, fy(c2HY, 0.62, 860), 0.62, 'endw'), CAL2: S(CAL2X + 40, fy(c2HY, 0.95, 880), 0.95, 'cal2'), HMUM: S(HMX + 20, fy(hmHY, 1.05, 900), 1.05, 'hmum') };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < hev('nar') - 0.05) return SH.COVER; if (t < hev('cu')) return f(SH.MUM); if (t < hev('wide')) return f(SH.CAL_CU); return f(SH.WIDE); }
  if (L === 'o1') { if (t < SP.o1_h.t - 0.1) return f(SH.WIDE); if (t < e('tear') - 0.02) return f(SH.HER); if (t < SP.o1_b.t - 0.1) return f(SH.MUM); if (t < e('beam') - 0.02) return f(SH.CAL); if (t < e('facepalm') - 0.02) return f(SH.MUMCAL); return f(SH.HER_R); }
  if (L === 'o2') { if (t < SP.o2_h.t - 0.1) return f(SH.WIDE); if (t < SP.o2_b.t - 0.1) return f(SH.HER); if (t < e('ladle')) return f(SH.CAL); return f(SH.MUMCAL); }
  if (L === 'o3') { if (t < SP.o3_h.t - 0.1) return f(SH.WIDE); if (t < SP.o3_h.t + 2.75) return f(SH.HER); if (t < e('pat') - 0.02) return f(SH.HER_CU); if (t < SP.o3_b.t - 0.1) return f(SH.MUMCAL); if (t < e('bag') - 0.05) return f(SH.CAL); return f(SH.MUMCAL); }
  if (L === 'o4') { if (t < SP.o4_h.t - 0.1) return f(SH.WIDE); if (t < SP.o4_h.t + 7.2) return f(SH.HER); if (t < e('place') - 0.02) return f(SH.HER_CU); if (t < SP.o4_b.t - 0.1) return f(SH.PLATE); if (t < e('nod') - 0.02) return f(SH.CAL); if (t < e('salute') - 0.02) return f(SH.MUM); return f(SH.GP); }
  if (L === 'end') { if (t < SP.end_m.t - 0.1) return f(SH.ENDW); if (t < e('proud') - 0.02) return f(SH.HMUM); if (t < e('third') - 0.35) return f(SH.CAL2); return f(SH.ENDW); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'thud', 'stamp']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- overlays: title (+ rubric label), option plates, «ГОД СПУСТЯ» label
function title(c, t) { const a = 1 - P(t, hev('title_out') - 0.25, hev('title_out')); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 300); c.rotate(-0.04); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -102);
  UI.textFit(c, 'Unb9', 120, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 6, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 64, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 112);
  // rubric label hanging off the title card
  c.save(); c.translate(260, -170); c.rotate(0.05); UI.font(c, 'Unb9', 30); const lw = c.measureText('НАШЕ ЗА ГРАНИЦЕЙ').width + 50; c.fillStyle = '#3E73B8'; rr(c, -lw / 2, -26, lw, 52, 26); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 5; c.stroke(); c.fillStyle = C.white; c.fillText('НАШЕ ЗА ГРАНИЦЕЙ', 0, 2); c.restore();
  c.restore();
  if (global.__QA) global.__QA.ui(c, 'card', { x: 50, y: 105, w: 980, h: 360, k: a, id: 'title' }); }
const PLATES = { o1: ['1', 'В ЛОБ', '#E0474C'], o2: ['2', 'ВЕЖЛИВО', '#F2B33D'], o3: ['3', 'КАК НОСИТЕЛЬ', '#4CAF6A'], o4: ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', '#8E5BD0'] };
function optPlate(c, t, sc) { const p = PLATES[sc.id]; if (!p) return; const u = t - sc.s, out = P(t, sc.e - 0.15, sc.e);
  const k = eBack(P(u, 0, 0.25), 2.2) * (1 - eIn(out)), big = 1 - eIO(P(u, 0.3, 0.5)); if (k <= 0) return;
  c.save(); UI.font(c, 'Unb9', 54); const tw = c.measureText(p[1]).width, w = tw + 200, h = 100, s = k * Math.min(lerp(1, 1.4, big), 880 / w), y = 215;
  c.translate(540, y); c.scale(s, s); c.rotate(-0.025);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -h / 2 + 9, w, h, 50); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 50); c.fill(); c.stroke();
  c.fillStyle = p[2]; c.beginPath(); c.arc(-w / 2 + 50, 0, 50, 0, TAU); c.fill(); c.stroke(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p[0], -w / 2 + 50, 4);
  c.fillStyle = C.oliveD; c.textAlign = 'left'; c.fillText(p[1], -w / 2 + 120, 4); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w * s / 2, y: y - 50 * s, w: w * s, h: 100 * s, k, id: 'plate_' + sc.id }); }
function yearLabel(c, t) { const s = SC.end.s, k = eBack(P(t, s + 0.05, s + 0.35), 2) * (1 - P(t, SP.end_m.t - 0.35, SP.end_m.t - 0.12)); if (k <= 0) return;
  c.save(); c.translate(540, 215); c.scale(k, k); c.rotate(-0.025); UI.font(c, 'Unb9', 56); const w = c.measureText('ГОД СПУСТЯ').width + 110;
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -50 + 9, w, 100, 50); c.fill(); c.fillStyle = C.gold; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -w / 2, -50, w, 100, 50); c.fill(); c.stroke();
  c.fillStyle = C.oliveD; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ГОД СПУСТЯ', 0, 4); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w / 2 * k, y: 215 - 50 * k, w: w * k, h: 100 * k, k, id: 'year' }); }

// ---------------- end screen: question, 1 / 2 / 3 / 4, СОХРАНИ, ПОДПИСАТЬСЯ clicked by the cursor; then the comment question (all inside x 60–940)
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, wt = (w, d) => K.wordT('outro', w) ?? (sp.t + d), CX = 500, ask = ev('outro', 'ask');
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // heroine + Callum with his bag of leftovers (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34; 2nd character at local x 640)
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gc = G.cal;
    K.put(c, CAL, { t, mood: 'happy', laugh: true, turn: -0.2, look: -0.5, armL: reach(gc, -1, -gc.sw * 0.5, gc.ySh + 300, { planar: true }), armR: reach(gc, 1, gc.sw * 0.5, gc.ySh + 300, { planar: true }), items: { R: bagItem } }, 640, 0);
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 1.3, g.ySh + 520, { planar: true }), armR: reach(g, 1, g.sw * 1.5, g.ySh - 80 + Math.sin(t * 7) * 20, { planar: true }), items: {} }, 0, 0); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  // top: «А ТЫ БЫ ОТВЕТИЛА КАК?» -> on the ask line it flips to the comment question
  const q = eBack(P(u, 0.15, 0.5), 2.2) * (1 - P(t, ask - 0.2, ask - 0.05)), qa = eBack(P(t, ask - 0.05, ask + 0.25), 2.0);
  if (q > 0) { c.save(); c.translate(CX, 290); c.scale(q, q); UI.font(c, 'Unb9', 76); UI.strokeText(c, 'А ТЫ БЫ', 0, -48, C.oliveD, C.white, 14); UI.strokeText(c, 'ОТВЕТИЛА КАК?', 0, 48, C.pink, C.white, 14); c.restore(); }
  if (qa > 0) { c.save(); c.translate(CX, 280); c.scale(qa, qa); c.rotate(-0.02); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -440 + 8, -150 + 12, 880, 300, 40); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 8; rr(c, -440, -150, 880, 300, 40); c.fill(); c.stroke();
    UI.textFit(c, 'Unb9', 74, 'СКОЛЬКО ТАРЕЛОК', 800); UI.strokeText(c, 'СКОЛЬКО ТАРЕЛОК', 0, -82, C.oliveD, C.white, 10); UI.textFit(c, 'Unb9', 74, 'НАСЫПАЕТ', 800); UI.strokeText(c, 'НАСЫПАЕТ', 0, 4, C.pink, C.white, 10); UI.textFit(c, 'Unb9', 74, 'ТВОЯ МАМА?', 800); UI.strokeText(c, 'ТВОЯ МАМА?', 0, 88, C.oliveD, C.white, 10); c.restore();
    if (global.__QA) global.__QA.ui(c, 'card', { x: CX - 440, y: 130, w: 880, h: 300, k: qa, id: 'ask' }); }
  const rows = [['1', 'В ЛОБ', 'Eat. Or she cries.', '#E0474C', 'один'], ['2', 'ВЕЖЛИВО', 'Maybe say no, but politely?', '#F2B33D', 'два'], ['3', 'КАК НОСИТЕЛЬ', "I'm stuffed. That was delicious.", '#4CAF6A', 'три'], ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', 'Leave one dumpling. A white flag.', '#8E5BD0', 'четыре']];
  rows.forEach(([n, ru, en, col, w], i) => { const a = wt(w, 1.0 + i * 0.35) - 0.1, k = eBack(P(t, a, a + 0.28), 2.0); if (k <= 0) return; const y = 540 + i * 160, pulse = t > ask ? 1 + 0.03 * Math.sin((t - ask) * 6 + i) : 1;
    c.save(); c.translate(CX, y); c.scale(k * pulse, k * pulse); c.fillStyle = 'rgba(0,0,0,.16)'; rr(c, -420 + 8, -66 + 12, 840, 132, 36); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -420, -66, 840, 132, 36); c.fill(); c.stroke();
    c.fillStyle = col; c.beginPath(); c.arc(-340, 0, 50, 0, TAU); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 5; c.stroke(); fitTxt(c, n, -340, 4, 70, C.white, 70);
    fitTxt(c, ru, -265, -24, 40, C.oliveD, 650, 'Unb9', 'left'); fitTxt(c, en, -265, 28, 34, C.pinkD, 650, 'Nun9', 'left'); c.restore(); });
  const bt = wt('пиши', 2.6) - 0.2, bk = eBack(P(t, bt, bt + 0.35), 2.2), by = 1205;
  if (bk > 0) { c.save(); c.translate(CX, by); c.scale(bk, bk); c.fillStyle = C.gold; rr(c, -420, -55, 400, 110, 55); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke();
    c.fillStyle = C.oliveD; c.beginPath(); c.moveTo(-370, -30); c.lineTo(-330, -30); c.lineTo(-330, 32); c.lineTo(-350, 16); c.lineTo(-370, 32); c.closePath(); c.fill(); fitTxt(c, 'СОХРАНИ', -200, 4, 40, C.oliveD, 250);
    const subT = bt + 0.6, click = P(t, subT + 0.55, subT + 0.7), pressed = t > subT + 0.65, ss = 1 - 0.08 * Math.sin(click * Math.PI);
    c.save(); c.translate(220, 0); c.scale(ss, ss); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -200, -55, 400, 110, 55); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke(); fitTxt(c, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4, 40, C.white, 340); c.restore(); c.restore();
    const mv = eIO(P(t, subT, subT + 0.55)); UI.tapCursor(c, lerp(930, CX + 260, mv), lerp(by + 330, by + 10, mv), 1, P(t, subT + 0.6, subT + 1.1)); }
  Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

const HOLD = { hook_b: -0.2, o1_h: -0.2, o1_b: -0.2, o2_h: -0.2, o2_b: -0.2, o3_h: -0.2, o3_b: -0.2, o4_h: -0.2, o4_b: -0.2, end_m: -0.2 };
const NAMES = { bf14: ['CALLUM', '#3E8A5A'], hismum3: ['HIS MUM', '#8E5BD0'] };
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  const r = drawWorld(c, t, L, cam, tag, sh); const M = r.M, proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.24);
  // bubbles only for characters drawn in this shot (an off-screen speaker never gets a bubble over another shot)
  const onScr = {}; for (const k in r.heads) if (Math.abs(r.heads[k].x) < 1e4) onScr[k] = r.heads[k];
  // the cover: Callum's whisper bubble opens to the right (towards her), so it never covers the dumpling tower or mum
  K.bubbles(c, t, sc, onScr, proj, { cleanChunks: true, hold: HOLD, names: NAMES, heroine: tag === 'cover' ? 'bf14' : 'her' });
  if (L === 'hook') title(c, t);
  optPlate(c, t, sc); if (L === 'end') yearLabel(c, t);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  // the end screen wipes in from the twist
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('eatmore', NF, renderFrame);
