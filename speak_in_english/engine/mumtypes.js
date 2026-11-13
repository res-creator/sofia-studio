// "4 типа мам, когда ты не звонишь" — rubric «4 типа» (hook + 4 chapters + twist), hard_cut camera: node mumtypes.js start end out.mp4 | --png=f1,f2
// The heroine's London flat: her phone in a little stand on the kitchen table buzzes so hard it crawls to the edge (MUM · 27); the cat (absurd detail)
// walks up to every call, puts its paw on the phone and sighs like a tired secretary — that is how each call gets answered.
// Each chapter = a video call with mum (full-screen call view on the phone's screen):
// 01 SHOULD (МАМА-СОВЕТНИЦА): sweet, a pot boils behind her; she pushes a jar of jam at the camera — it bonks against the glass; the pot boils over.
// 02 MUST (МАМА-ГЕНЕРАЛ): a ladle as a pointer, the wall chart «SUNDAY — CALL MUM» circled three times; three taps + a fourth circle; the heroine stands to attention.
// 03 HAVE TO (МАМА-ЛОГИСТ): a table buried in lists, three pairs of glasses round her neck; she stacks two pairs on her nose, the pile slides off; insert: the top sheet.
// 04 HAD BETTER (МАМА-ШПИОН): dark room, sunglasses, she leans in to the camera; insert: her phone — the heroine's photo, green ONLINE; the heroine hides behind a cushion.
// Twist (music silent): the heroine calls herself — "Hi, Mum!" — mum on a yoga mat among other mums: "Can't talk now..." — beeps; she stares at the phone, the cat stares at her.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/mumtypes/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];
const CH = ['t1', 't2', 't3', 't4'];
// handovers: a negative per-line hold (bubble gone BEFORE the line ends) — ui_v2 clamps hold to >= 0.05, so shorten the bubble's span instead
{ const _bub = UI.bubble; UI.bubble = (ctx, sp, t, an, side, name) => _bub(ctx, sp.hold < 0.05 ? { ...sp, d: sp.d + sp.hold - 0.05 } : sp, t, an, side, name); }

// ---------------- cast
const HER = { ...BASE.her_lift };
const MUM = { ...BASE.linda, hair: { style: 'bob', col: '#8A4A2E' }, age: 0.5, top: { type: 'cardigan', col: '#D9708A', col2: '#F7E6EC' }, bottom: { type: 'skirt', col: '#5A4A6A' } };
const MUM_G = { ...MUM, top: { type: 'sweater', col: '#4E5A3A' } };                                            // 02: the general (khaki jumper)
const MUM_L = { ...MUM, top: { type: 'cardigan', col: '#7FB0D8', col2: '#EAF2F8' } };                          // 03: the logistician
const MUM_S = { ...MUM, top: { type: 'longsleeve', col: '#2B2F3A' }, bottom: { type: 'trousers', col: '#22252E' }, earrings: null }; // 04: the spy
const MUM_Y = { ...MUM, top: { type: 'gymtop', col: '#8E5BD6', col2: '#FFFFFF' }, bottom: { type: 'leggings', col: '#3B3550' }, shoes: { col: '#FFFFFF', acc: '#8E5BD6' }, headband: '#F2C14E', earrings: null, necklace: false };
const Y1 = { ...BASE.rose, glasses: null, top: { type: 'tracksuit', col: '#4CAF6A' }, bottom: { type: 'leggings', col: '#2E5A3E' } };
const Y2 = { ...BASE.priya, top: { type: 'gymtop', col: '#F2B33D', col2: '#FFFFFF' }, bottom: { type: 'leggings', col: '#5A4030' } };
const G = { her: geom(HER), mum: geom(MUM), y1: geom(Y1), y2: geom(Y2) };
const HX = -330, CT = -780, TX0 = -120, TX1 = 820;           // her feet x, table top, table ends
const PXA = 230, PXB = 40;                                   // phone stand: crawls from PXA to PXB in the hook
const CX0 = 560, CXP = 250, CS = 0.55;                       // cat: start x, at its post by the phone, scale
const COLS = { t1: '#4CAF6A', t2: '#E0474C', t3: '#F2B33D', t4: '#3A3F5C' };
const LABEL = { t1: ['01', 'SHOULD', 'МАМА-СОВЕТНИЦА'], t2: ['02', 'MUST', 'МАМА-ГЕНЕРАЛ'], t3: ['03', 'HAVE TO', 'МАМА-ЛОГИСТ'], t4: ['04', 'HAD BETTER', 'МАМА-ШПИОН'] };
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- small drawn icons (no emoji in the fonts)
function heart(c, x, y, s, col) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.beginPath(); c.moveTo(0, 30); c.bezierCurveTo(-60, -10, -40, -60, 0, -30); c.bezierCurveTo(40, -60, 60, -10, 0, 30); c.fill(); c.restore(); }
function handset(c, x, y, s, col, rot = 0) { c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); c.fillStyle = col; c.beginPath(); c.moveTo(-34, -20); c.quadraticCurveTo(0, -36, 34, -20); c.lineTo(30, -6); c.lineTo(14, -10); c.lineTo(12, 0); c.lineTo(-12, 0); c.lineTo(-14, -10); c.lineTo(-30, -6); c.closePath(); c.fill(); c.restore(); }
// the heroine's avatar (round): dark bob, pink jumper
function herAvatar(c, x, y, r) { c.save(); c.translate(x, y); c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fillStyle = '#FCE7EF'; c.fill(); c.clip();
  c.fillStyle = '#3A2820'; c.beginPath(); c.ellipse(0, -r * 0.02, r * 0.6, r * 0.66, 0, 0, TAU); c.fill(); c.fillRect(-r * 0.6, -r * 0.05, r * 1.2, r * 0.55); c.fillStyle = '#F6D2B6'; c.beginPath(); c.ellipse(0, r * 0.1, r * 0.42, r * 0.5, 0, 0, TAU); c.fill();
  c.fillStyle = '#3A2820'; c.beginPath(); c.ellipse(-r * 0.1, -r * 0.36, r * 0.5, r * 0.2, -0.2, 0, TAU); c.fill(); c.fillStyle = '#EF7FAA'; c.beginPath(); c.ellipse(0, r * 1.05, r * 0.85, r * 0.45, 0, 0, TAU); c.fill();
  c.fillStyle = '#2B2F3A'; for (const s of [-1, 1]) { c.beginPath(); c.arc(s * r * 0.16, r * 0.08, r * 0.06, 0, TAU); c.fill(); } c.strokeStyle = '#D9607A'; c.lineWidth = r * 0.06; c.beginPath(); c.arc(0, r * 0.25, r * 0.14, 0.3, Math.PI - 0.3); c.stroke();
  c.fillStyle = 'rgba(240,124,140,.45)'; for (const s of [-1, 1]) { c.beginPath(); c.arc(s * r * 0.27, r * 0.24, r * 0.08, 0, TAU); c.fill(); } c.restore(); }
// mum's avatar (round): a tiny face with her bob
function avatar(c, x, y, r) { c.save(); c.translate(x, y); c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fillStyle = '#F7D9E3'; c.fill(); c.clip();
  c.fillStyle = '#8A4A2E'; c.beginPath(); c.ellipse(0, -r * 0.05, r * 0.62, r * 0.7, 0, 0, TAU); c.fill(); c.fillStyle = '#F4D0B8'; c.beginPath(); c.ellipse(0, r * 0.08, r * 0.45, r * 0.52, 0, 0, TAU); c.fill();
  c.fillStyle = '#8A4A2E'; c.beginPath(); c.ellipse(0, -r * 0.38, r * 0.5, r * 0.22, 0, 0, TAU); c.fill(); c.fillStyle = '#D9708A'; c.beginPath(); c.ellipse(0, r * 1.05, r * 0.8, r * 0.45, 0, 0, TAU); c.fill();
  c.fillStyle = '#2B2F3A'; for (const s of [-1, 1]) { c.beginPath(); c.arc(s * r * 0.17, r * 0.05, r * 0.06, 0, TAU); c.fill(); } c.strokeStyle = '#B8405A'; c.lineWidth = r * 0.06; c.beginPath(); c.arc(0, r * 0.22, r * 0.14, 0.3, Math.PI - 0.3); c.stroke(); c.restore(); }

// ---------------- the phone screen: 'call' (incoming, MUM + 27 missed) / 'dial' (CALLING MUM) / 'video' (mum on video) / 'ended' / 'dark'
function screen(c, w, h, mode, t) {
  if (mode === 'dark') { c.fillStyle = '#1E2230'; c.fillRect(0, 0, w, h); return; }
  if (mode === 'video') { c.fillStyle = '#DCE6EE'; c.fillRect(0, 0, w, h); avatar(c, w / 2, h * 0.45, w * 0.34); return; }
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, mode === 'ended' ? '#3A2A30' : '#1F3B4A'); g.addColorStop(1, mode === 'ended' ? '#1E1418' : '#14222E'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  const pulse = mode === 'call' || mode === 'dial' ? 1 + 0.08 * Math.sin(t * 9) : 1;
  c.save(); c.globalAlpha = 0.25; c.fillStyle = '#7CF29A'; c.beginPath(); c.arc(w / 2, h * 0.3, w * 0.3 * pulse, 0, TAU); c.fill(); c.restore();
  avatar(c, w / 2, h * 0.3, w * 0.22);
  fitTxt(c, 'MUM', w / 2, h * 0.52, w * 0.2, '#FFFFFF', w * 0.8);
  if (mode === 'call') { fitTxt(c, '27 missed calls', w / 2, h * 0.62, w * 0.075, '#FF6A6F', w * 0.86, 'Nun9');
    for (const [x, col, r] of [[0.28, '#E0474C', 2.3], [0.72, '#4CAF6A', 0]]) { c.fillStyle = col; c.beginPath(); c.arc(w * x, h * 0.84, w * 0.11, 0, TAU); c.fill(); handset(c, w * x, h * 0.84 + w * 0.02, w / 260, '#FFFFFF', r); } }
  if (mode === 'dial') { fitTxt(c, 'calling...', w / 2, h * 0.62, w * 0.08, '#CFE3EE', w * 0.86, 'Nun9'); c.fillStyle = '#E0474C'; c.beginPath(); c.arc(w / 2, h * 0.84, w * 0.11, 0, TAU); c.fill(); handset(c, w / 2, h * 0.84 + w * 0.02, w / 260, '#FFFFFF', 2.3); }
  if (mode === 'ended') fitTxt(c, 'CALL ENDED', w / 2, h * 0.64, w * 0.1, '#FF6A6F', w * 0.86); }
function phoneShape(c, s, mode, t) { c.save(); c.scale(s, s); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -62 + 6, -250 + 8, 124, 250, 20); c.fill(); c.fillStyle = '#2B2F3A'; rr(c, -62, -250, 124, 250, 20); c.fill();
  c.save(); c.beginPath(); rr(c, -54, -240, 108, 228, 14); c.clip(); c.translate(-54, -240); screen(c, 108, 228, mode, t); c.restore(); c.restore(); }
const phoneItem = (t, mode, s = 1.0) => ctx => { ctx.save(); ctx.translate(0, 40); phoneShape(ctx, s, mode, t); ctx.restore(); };
// red «27» badge (world), drawn next to the buzzing phone
function badge(c, x, y, r, n = '27') { c.save(); c.translate(x, y); c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.arc(5, 7, r, 0, TAU); c.fill(); c.fillStyle = '#E0474C'; c.strokeStyle = '#FFFFFF'; c.lineWidth = r * 0.14; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill(); c.stroke(); fitTxt(c, n, 0, 3, r * 1.05, '#FFFFFF', r * 1.6); c.restore(); }
// buzz lines around a vibrating object
function buzzLines(c, x, y, s, t, k = 1) { if (k <= 0) return; c.save(); c.strokeStyle = 'rgba(62,71,30,.75)'; c.lineWidth = 7 * s; c.lineCap = 'round'; c.globalAlpha = k * (0.6 + 0.4 * Math.sin(t * 30));
  for (const sd of [-1, 1]) for (let i = 0; i < 2; i++) { const xx = x + sd * (95 + i * 30) * s; c.beginPath(); c.moveTo(xx, y - 60 * s + i * 10 * s); c.quadraticCurveTo(xx + sd * 14 * s, y, xx, y + 60 * s - i * 10 * s); c.stroke(); } c.restore(); }

// ---------------- the flat (prerendered, softly blurred): wallpaper, window onto a London street (terraced houses, red post box), shelf, clock
const BX0 = -3400, BY0 = -3800, BW = 6800, BH = 5600, BS = 0.5;
function drawFlat(c) {
  c.fillStyle = '#F4E6D2'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = 'rgba(217,112,138,.10)'; for (let x = BX0; x < BX0 + BW; x += 240) for (let y = BY0; y < -300; y += 240) { c.beginPath(); c.arc(x + ((y / 240) % 2 ? 120 : 0), y, 26, 0, TAU); c.fill(); }
  // wainscot + skirting
  c.fillStyle = '#E3CFB4'; c.fillRect(BX0, -1000, BW, 740); c.fillStyle = '#C9A57A'; c.fillRect(BX0, -1020, BW, 26); c.fillStyle = '#FFFDF8'; c.fillRect(BX0, -300, BW, 40);
  // big sash window (centre-right): a London street outside
  const wx = -700, wy = -2900, ww = 1700, wh = 1700;
  c.fillStyle = '#FFFDF8'; rr(c, wx - 50, wy - 50, ww + 100, wh + 100, 16); c.fill();
  const g = c.createLinearGradient(0, wy, 0, wy + wh); g.addColorStop(0, '#BFE3F5'); g.addColorStop(1, '#EAF4F8'); c.fillStyle = g; c.fillRect(wx, wy, ww, wh);
  // terraced houses across the street
  const houses = ['#B5654A', '#C98A5A', '#A85A44', '#B87850']; for (let i = 0; i < 5; i++) { const hx = wx + i * 360 - 40; c.fillStyle = houses[i % 4]; c.fillRect(hx, wy + 420, 360, wh - 420);
    c.fillStyle = 'rgba(0,0,0,.12)'; for (let yy = wy + 440; yy < wy + wh; yy += 40) c.fillRect(hx, yy, 360, 4);
    c.fillStyle = '#FFFDF8'; for (const [ox, oy] of [[60, 520], [210, 520], [60, 880], [210, 880]]) { c.fillRect(hx + ox, wy + oy, 100, 160); c.fillStyle = '#7FA6C0'; c.fillRect(hx + ox + 10, wy + oy + 10, 80, 140); c.fillStyle = '#FFFDF8'; }
    c.fillStyle = ['#2B3A6A', '#2E6B5A', '#8A2A4A', '#2B2F3A'][i % 4]; c.fillRect(hx + 130, wy + 1240, 100, 220); c.fillStyle = '#5A6070'; c.beginPath(); c.moveTo(hx - 10, wy + 420); c.lineTo(hx + 180, wy + 300); c.lineTo(hx + 370, wy + 420); c.fill(); }
  c.fillStyle = '#9AA3AE'; c.fillRect(wx, wy + wh - 120, ww, 120);   // pavement
  // red post box on the pavement
  c.fillStyle = '#D0262E'; rr(c, wx + 1180, wy + wh - 420, 150, 330, 30); c.fill(); c.fillStyle = '#A81C24'; c.fillRect(wx + 1170, wy + wh - 380, 170, 26); c.fillStyle = '#2B2F3A'; c.fillRect(wx + 1215, wy + wh - 320, 80, 14); c.fillStyle = '#F2C14E'; c.fillRect(wx + 1225, wy + wh - 280, 60, 30);
  // sash frame + curtains
  c.fillStyle = '#FFFDF8'; c.fillRect(wx, wy + wh / 2 - 20, ww, 40); c.fillRect(wx + ww / 2 - 18, wy, 36, wh);
  c.fillStyle = '#E58AAA'; for (const s of [-1, 1]) { const x0 = s < 0 ? wx - 260 : wx + ww + 40; paint(c, q => { q.m(x0, wy - 140); q.l(x0 + 220, wy - 140); q.q(x0 + 180, wy + 800, x0 + 240, wy + wh + 150); q.l(x0, wy + wh + 150); q.z(); }, '#E58AAA', { sd: 6, hd: 3, lw: 4 }); }
  c.fillStyle = '#8A5A36'; c.fillRect(wx - 320, wy - 170, ww + 640, 30);
  // shelf with plants and a framed photo (left)
  c.fillStyle = '#8A5A36'; c.fillRect(-2700, -1900, 1100, 34); c.fillStyle = '#7CC45A'; for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(-2560 + i * 320, -1990, 90, 70, 0, 0, TAU); c.fill(); } c.fillStyle = '#D9764A'; for (let i = 0; i < 3; i++) c.fillRect(-2620 + i * 320, -1960, 120, 60);
  c.fillStyle = '#C9A04A'; rr(c, -2550, -2500, 360, 440, 12); c.fill(); c.fillStyle = '#F7E6EC'; c.fillRect(-2520, -2470, 300, 380); c.save(); c.translate(-2370, -2290); avatar(c, 0, 0, 120); c.restore();
  // wall clock (right)
  c.fillStyle = '#FFFDF8'; c.strokeStyle = '#3E471E'; c.lineWidth = 16; c.beginPath(); c.arc(1750, -2300, 200, 0, TAU); c.fill(); c.stroke(); c.lineWidth = 12; c.beginPath(); c.moveTo(1750, -2300); c.lineTo(1750, -2440); c.moveTo(1750, -2300); c.lineTo(1850, -2260); c.stroke();
  // floor
  c.fillStyle = '#C9A57A'; c.fillRect(BX0, -260, BW, BY0 + BH + 260); c.fillStyle = 'rgba(0,0,0,.07)'; for (let x = BX0; x < BX0 + BW; x += 200) c.fillRect(x, -260, 8, BY0 + BH + 260);
}
const mkBG = (fn, x0, y0, w, h, s, blur = 1.4) => { const a = createCanvas(Math.round(w * s), Math.round(h * s)); const c = a.getContext('2d'); c.scale(s, s); c.translate(-x0, -y0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = `blur(${blur}px)`; d.drawImage(a, 0, 0); return b; };
const BGK = mkBG(drawFlat, BX0, BY0, BW, BH, BS);

// ---------------- the table (live): phone stand, phone, badge
const phoneX = (t, L) => L === 'hook' ? lerp(PXA, PXB, eIO(clamp(t / 3.4))) + Math.sin(t * 60) * 5 * (t < 3.4 ? 1 : 0) : PXB;
const phoneTaken = (t, L) => L === 'end' && t > ev('end', 'beat') + 0.3;
function ringing(t, L) { if (L === 'hook') return t < hev('cat') + 0.6; if (CH.includes(L)) return t < ev(L, 'paw') + 0.05; return false; }
function tableBack(c, t, L) {
  // the table top + front apron + legs
  c.fillStyle = '#9C6238'; for (const x of [TX0 + 40, TX1 - 80]) c.fillRect(x, CT + 40, 40, -CT - 40);
  paint(c, q => { q.m(TX0, CT); q.l(TX1, CT); q.l(TX1, CT + 60); q.l(TX0, CT + 60); q.z(); }, '#C98B5A', { sd: 6, hd: 3, lw: 4 });
  c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(TX0 + 20, CT + 8, TX1 - TX0 - 40, 8);
  // a mug and a fruit bowl
  c.fillStyle = '#7FB0D8'; rr(c, 560, CT - 110, 90, 110, 14); c.fill(); c.strokeStyle = '#7FB0D8'; c.lineWidth = 14; c.beginPath(); c.arc(660, CT - 60, 28, -1.2, 1.2); c.stroke();
  c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(730, CT - 40, 36, 0, TAU); c.fill(); c.fillStyle = '#E0474C'; c.beginPath(); c.arc(770, CT - 30, 30, 0, TAU); c.fill();
  // phone stand + phone
  if (!phoneTaken(t, L)) { const x = phoneX(t, L), rg = ringing(t, L), jit = rg ? Math.sin(t * 70) * 4 : 0;
    c.fillStyle = '#8A5A36'; rr(c, x - 70, CT - 26, 140, 26, 8); c.fill(); c.fillRect(x - 40, CT - 110, 18, 90);
    c.save(); c.translate(x + jit, CT - 18); c.rotate(-0.06); phoneShape(c, 1.0, rg ? 'call' : 'dark', t); c.restore();
    buzzLines(c, x, CT - 140, 1, t, rg ? 1 : 0);
    if (L === 'hook' || (CH.includes(L) && t < ev(L, 'paw') + 0.1)) badge(c, x + 80, CT - 280, 62, '27');
    K.mark(c, 'phone', x, CT - 140, 150); } }

// ---------------- the cat (absurd detail): walks to every call, paw on the phone, sighs like a tired secretary
function catReach(s, X, Y) { const L1 = 170, L2 = 150, d = Math.min(L1 + L2 - 1, Math.hypot(X, Y)), th = Math.atan2(X, Y), al = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1)), a = th + al;
  const a2 = Math.atan2(X - Math.sin(a) * L1, Y - Math.cos(a) * L1); return { a, b: a - a2 }; }
const catX = (t, L) => L === 'hook' ? lerp(CX0, CXP, eIO(clamp((t - hev('cat') + 0.05) / 0.45))) : CXP;
const headset = ctx => { ctx.strokeStyle = '#2B2F3A'; ctx.lineWidth = 22; ctx.beginPath(); ctx.arc(0, -40, 260, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke(); ctx.fillStyle = '#2B2F3A'; ctx.beginPath(); ctx.ellipse(-250, 10, 50, 75, 0, 0, TAU); ctx.fill(); ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(-240, 60); ctx.quadraticCurveTo(-200, 160, -60, 150); ctx.stroke(); ctx.fillStyle = '#E0474C'; ctx.beginPath(); ctx.arc(-55, 150, 22, 0, TAU); ctx.fill(); };
function catState(t, L) { const st = { t, talk: 0, mood: 'bored', turn: 0, look: 0, armL: { a: 0.35, b: 0.5 }, armR: { a: 0.35, b: 0.5 } };
  const pawT = L === 'hook' ? hev('cat') + 0.4 : CH.includes(L) ? ev(L, 'paw') : 1e9;
  if (t > pawT - 0.25 && t < pawT + 1.1) { const k = eOut(clamp((t - pawT + 0.25) / 0.25)); const tgt = catReach(1, (CXP - 150 * CS - (PXB + 30)) / CS, (CT - 300 - (CT - 500 * CS)) / CS); st.armL = { a: lerp(0.35, tgt.a, k), b: lerp(0.5, tgt.b, k) }; st.look = -1; st.turn = -0.2; }
  if (t > pawT + 0.1 && t < pawT + 1.0) { st.tilt = -0.08 * Math.sin(clamp((t - pawT - 0.1) / 0.9) * Math.PI); st.mood = 'bored'; }
  if (L === 't2' && t > pawT - 0.3 && t < pawT + 0.5) st.mood = 'annoyed';
  if (L === 't3' || L === 't4' || L === 'end') st.hat = headset;
  if (L === 't2' && t > ev('t2', 'react') - 0.05 && t < ev('t2', 'nar')) { st.mood = 'shock'; st.armL = { a: 0.05, b: 0.02 }; st.armR = { a: 0.05, b: 0.02 }; st.tilt = 0; }   // to attention
  if (L === 'end') { st.mood = 'bored'; st.look = -0.6;
    if (t > ev('end', 'catlook') - 0.05) { st.turn = -0.6; st.look = -1; st.mood = 'shock'; }
    if (t > ev('end', 'pat')) { st.mood = 'bored'; st.armL = catReach(1, 260, -40); st.armR = catReach(1, 260, -40); } }
  if (L === 'hook' && t < hev('cat') - 0.1) { st.look = -0.8; st.mood = 'bored'; }
  return { st, pawT }; }
function sighPuff(c, x, y, t, pawT) { const u = t - pawT - 0.15; if (u < 0 || u > 0.9) return; c.save(); for (let i = 0; i < 3; i++) { const v = clamp(u / 0.9 - i * 0.12); if (v <= 0) continue; c.globalAlpha = (1 - v) * 0.85; c.fillStyle = '#FFFFFF'; c.strokeStyle = 'rgba(62,71,30,.5)'; c.lineWidth = 4; c.beginPath(); c.ellipse(x - 30 - v * 160 - i * 25, y + 20 - v * 60, 26 + v * 30, 18 + v * 18, 0, 0, TAU); c.fill(); c.stroke(); } c.restore(); }
function drawCat(c, t, L) { const x = catX(t, L), { st, pawT } = catState(t, L); c.save(); c.translate(x, CT); c.scale(CS, CS); Hq.catChar(c, st); c.restore(); sighPuff(c, x - 50, CT - 700 * CS - 40, t, pawT); K.mark(c, 'cat', x, CT - 400 * CS, 300 * CS);
  return { x: x, y: CT - 760 * CS, hh: 210 * CS }; }

// ---------------- the heroine
const down = (g, s, drop = 0) => reach(g, s, s * g.sw * 1.08, g.ySh + drop + 540, { planar: true });
const open = (g, s, k = 1.7, dy = 90) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const hold = (g, s, dy = 330, k = 0.75) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const forehead = (g, s = 1) => reach(g, s, s * g.hw * 0.25, g.headY - g.hh * 0.35, { planar: true });
const cheek = (g, s) => reach(g, s, s * g.hw * 0.75, g.headY + g.hh * 0.35, { planar: true });
const base = (g, t, who) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, armL: down(g, -1), armR: down(g, 1), items: {} });
const gest = (st, g, who, t, side, base_) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base_ + Math.cos(u) * 20, { planar: true }); } };
const cushion = ctx => { ctx.save(); ctx.translate(-150, -200); ctx.rotate(0.05); paint(ctx, q => { q.m(-160, -130); q.q(0, -150, 160, -130); q.q(180, 0, 160, 130); q.q(0, 150, -160, 130); q.q(-180, 0, -160, -130); q.z(); }, '#EE5E9A', { sd: 6, hd: 3, lw: 4 }); ctx.fillStyle = '#F7B6CF'; for (const [x, y] of [[-90, -60], [60, -40], [-20, 50], [100, 70]]) { ctx.beginPath(); ctx.arc(x, y, 18, 0, TAU); ctx.fill(); } ctx.restore(); };
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { ...base(g, t, 'her'), mood: 'tired', turn: 0.25, look: 0.7 };
  if (L === 'hook') { st.mood = 'tired';
    if (t < SP.hook_h.t + 1.6) { st.headFirst = true; st.armL = forehead(g, -1); st.blink = t > 0.6 && t < 1.4 ? 1 : 0; st.tilt = -0.06; }
    else if (t < endOf('hook_h') + 0.2) { st.mood = 'worried'; st.armR = open(g, 1, 1.8, 120); st.armL = hold(g, -1, 320, 0.5); }
    else { st.mood = 'tired'; st.armL = hold(g, -1, 330, 0.4); st.look = 0.9; }
    if (t > hev('cat') + 0.3) { st.mood = 'surprised'; st.blink = 0; st.look = 1; } }
  if (CH.includes(L)) { st.look = 0.9; st.mood = { t1: 'neutral', t2: 'worried', t3: 'worried', t4: 'shock' }[L]; st.armL = hold(g, -1, 330, 0.45);
    if (t > e('react') - 0.05) {
      if (L === 't1') { const k = eOut(clamp((t - e('react')) / 0.25)); st.mood = 'happy'; st.blink = 0; st.look = 1; st.armR = reach(g, 1, g.sw * lerp(1.2, 2.5, k), g.ySh + lerp(300, 160, k), { planar: true }); st.lean = 0.3 * k; if (t > e('nar') - 0.3) { st.mood = 'surprised'; st.lean = 0; st.armR = down(g, 1); } }
      if (L === 't2') { st.mood = 'shock'; st.blink = 0; st.look = 0; st.turn = 0; st.armL = down(g, -1, -40); st.armR = down(g, 1, -40); st.breathe = 0; st.headY = -6; }
      if (L === 't3') { const sh_ = Math.sin(t * 14) * 15; st.mood = 'shock'; st.blink = 0; st.look = 0; st.turn = 0; st.armL = open(g, -1, 2.0, 60 + sh_); st.armR = open(g, 1, 2.0, 60 - sh_); st.lean = -0.15; }
      if (L === 't4') { const k = eOut(clamp((t - e('react')) / 0.3)); st.mood = 'shock'; st.blink = 0; st.look = 0.3; st.turn = 0.1; st.armL = reach(g, -1, -g.sw * 0.5, g.ySh + lerp(330, 120, k), { planar: true }); st.armR = reach(g, 1, g.sw * 0.5, g.ySh + lerp(330, 120, k), { planar: true }); st.items = { R: cushion }; } } }
  if (L === 'end') { const s0 = ev('end', 'beat');
    st.mood = 'neutral'; st.look = 0.9;
    if (t > s0 + 0.05 && t < s0 + 0.3) st.armR = reach(g, 1, PXB - HX - 60, CT + 20, { planar: true });
    if (t > s0 + 0.3) { st.armR = reach(g, 1, g.sw * 1.25, g.ySh + 250, { planar: true }); st.items = { R: phoneItem(t, t > ev('end', 'hang') ? 'ended' : t > ev('end', 'yoga') - 0.2 ? 'video' : 'dial', 1.15) }; st.look = 0.4; st.mood = 'happy'; }
    if (speaking('end_h', t, 0.05, 0.25)) { st.mood = 'happy'; st.laugh = true; st.armL = open(g, -1, 1.9, -30 + Math.sin(t * 9) * 25); }
    if (t > ev('end', 'hang')) { st.mood = 'tired'; st.laugh = false; st.blink = Math.sin(t * 3) > 0.6 ? 1 : 0; st.look = 0.4; st.lookY = 0.3; st.armL = hold(g, -1, 330, 0.45); } }
  return st; }

// ---------------- world + which characters each shot draws
const DRAW = { wide: ['her', 'cat'], cover: ['her', 'cat'], two: ['her', 'cat'], her: ['her'], cat: ['cat'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGK, BX0, BY0, BW, BH);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), HX, 0);
  tableBack(c, t, L);
  if (who.includes('cat')) drawCat(c, t, L);
  if (!heads.her) heads.her = OFFL;
  return heads; }

// ---------------- mum's video-call sets (local coords: mum's feet at (0,0)); variant k = 1..4 | 'yoga'
function mumSetBack(c, k, t) {
  if (k === 1) { c.fillStyle = '#F7F2E6'; c.fillRect(-2000, -3000, 4000, 3200); c.strokeStyle = 'rgba(160,180,190,.45)'; c.lineWidth = 4; for (let x = -2000; x < 2000; x += 120) { c.beginPath(); c.moveTo(x, -3000); c.lineTo(x, 200); c.stroke(); } for (let y = -3000; y < 200; y += 120) { c.beginPath(); c.moveTo(-2000, y); c.lineTo(2000, y); c.stroke(); }
    // window with lace curtains (left)
    c.fillStyle = '#FFFDF8'; rr(c, -1150, -2050, 620, 700, 12); c.fill(); c.fillStyle = '#CFE8F4'; c.fillRect(-1110, -2010, 540, 620); c.fillStyle = 'rgba(255,255,255,.8)'; for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(-1080 + i * 60, -2010, 34, 0, Math.PI); c.fill(); }
    // shelf with jam jars
    c.fillStyle = '#9C6238'; c.fillRect(-1150, -1180, 640, 26); for (let i = 0; i < 4; i++) jamJar(c, -1080 + i * 150, -1180, 0.45);
    // hob + the pot (right)
    c.fillStyle = '#E9E4DA'; c.fillRect(260, -900, 900, 900); c.fillStyle = '#2B2F3A'; c.fillRect(260, -930, 900, 40); }
  if (k === 2) { c.fillStyle = '#E8E2D0'; c.fillRect(-2000, -3000, 4000, 3200); c.fillStyle = '#C9C0A8'; c.fillRect(-2000, -900, 4000, 1100);
    // the chart on the wall (right): one line, circled three times
    c.fillStyle = '#FFFDF8'; c.strokeStyle = '#3E471E'; c.lineWidth = 10; rr(c, 250, -1850, 700, 620, 16); c.fill(); c.stroke(); c.fillStyle = '#E0474C'; c.fillRect(250, -1850, 700, 90);
    for (let i = 0; i < 4; i++) { c.strokeStyle = 'rgba(62,71,30,.25)'; c.lineWidth = 6; c.beginPath(); c.moveTo(290, -1680 + i * 120); c.lineTo(910, -1680 + i * 120); c.stroke(); } }
  if (k === 3) { c.fillStyle = '#EAF0E4'; c.fillRect(-2000, -3000, 4000, 3200); c.fillStyle = 'rgba(76,175,106,.12)'; for (let x = -2000; x < 2000; x += 200) c.fillRect(x, -3000, 100, 3200);
    // pinboard full of notes (right)
    c.fillStyle = '#C9A57A'; rr(c, 420, -2300, 760, 640, 14); c.fill(); for (let i = 0; i < 9; i++) { c.save(); c.translate(500 + (i % 3) * 230, -2200 + Math.floor(i / 3) * 190); c.rotate((i % 2 ? 1 : -1) * 0.08); c.fillStyle = ['#FFF2A8', '#FFFFFF', '#F7B6CF'][i % 3]; c.fillRect(0, 0, 170, 150); c.fillStyle = 'rgba(62,71,30,.35)'; for (let j = 0; j < 4; j++) c.fillRect(18, 30 + j * 28, 130 - j * 14, 8); c.fillStyle = '#E0474C'; c.beginPath(); c.arc(85, 10, 10, 0, TAU); c.fill(); c.restore(); } }
  if (k === 4) { c.fillStyle = '#20232E'; c.fillRect(-2000, -3000, 4000, 3200);
    // blinds with streaks of light
    c.fillStyle = '#2E3344'; rr(c, -1300, -2500, 900, 1100, 10); c.fill(); for (let i = 0; i < 14; i++) { c.fillStyle = i % 2 ? 'rgba(242,193,78,.18)' : 'rgba(242,193,78,.07)'; c.fillRect(-1280, -2480 + i * 76, 860, 40); } }
  if (k === 'yoga') { c.fillStyle = '#F4EDE2'; c.fillRect(-3000, -3200, 6000, 3400);
    c.fillStyle = '#FFFDF8'; rr(c, -1900, -2600, 3800, 1300, 20); c.fill(); const g = c.createLinearGradient(0, -2560, 0, -1340); g.addColorStop(0, '#BFE3F5'); g.addColorStop(1, '#E6F3E6'); c.fillStyle = g; c.fillRect(-1860, -2560, 3720, 1220);
    c.fillStyle = '#FFFDF8'; for (let x = -1860; x < 1860; x += 620) c.fillRect(x, -2560, 24, 1220);
    for (const x of [-2300, 2300]) { c.fillStyle = '#D9764A'; c.fillRect(x - 90, -320, 180, 220); c.fillStyle = '#5AAE5A'; for (let i = 0; i < 5; i++) { c.save(); c.translate(x, -320); c.rotate(-1 + i * 0.5); c.beginPath(); c.ellipse(0, -200, 50, 200, 0, 0, TAU); c.fill(); c.restore(); } }
    c.fillStyle = '#D8B88A'; c.fillRect(-3000, -100, 6000, 400); c.fillStyle = 'rgba(0,0,0,.06)'; for (let x = -3000; x < 3000; x += 220) c.fillRect(x, -100, 8, 400); }
}
function jamJar(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s);
  paint(c, q => { q.m(-110, 0); q.l(110, 0); q.q(130, -10, 130, -40); q.l(130, -250); q.q(130, -280, 100, -290); q.l(-100, -290); q.q(-130, -280, -130, -250); q.l(-130, -40); q.q(-130, -10, -110, 0); q.z(); }, '#B8263A', { sd: 6, hd: 3, lw: 5 });
  c.fillStyle = 'rgba(255,255,255,.35)'; rr(c, -100, -260, 30, 200, 15); c.fill();
  paint(c, q => { q.m(-120, -290); q.l(120, -290); q.l(120, -350); q.l(-120, -350); q.z(); }, '#F7F2E6', { sd: 3, hd: 2, lw: 4 }); c.fillStyle = '#E0474C'; for (let i = -100; i < 120; i += 40) { c.beginPath(); c.arc(i, -320, 12, 0, TAU); c.fill(); }
  c.fillStyle = '#FFFDF8'; rr(c, -80, -210, 160, 110, 12); c.fill(); heart(c, 0, -150, 0.9, '#E0474C'); c.restore(); }
function ladle(ctx, ang = 0) { ctx.save(); ctx.rotate(ang); ctx.strokeStyle = '#B8BEC8'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 20); ctx.lineTo(0, -380); ctx.stroke(); ctx.fillStyle = '#B8BEC8'; ctx.strokeStyle = '#6A707C'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, -430, 70, 0, Math.PI); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }
function specs(c, x, y, s, col, dark = false) { c.save(); c.translate(x, y); c.scale(s, s); c.strokeStyle = col; c.lineWidth = 8; c.fillStyle = dark ? '#14161C' : 'rgba(200,230,255,.3)'; for (const sd of [-1, 1]) { c.beginPath(); dark ? c.ellipse(sd * 46, 0, 42, 32, 0, 0, TAU) : c.arc(sd * 46, 0, 34, 0, TAU); c.fill(); c.stroke(); } c.beginPath(); c.moveTo(-12, -4); c.quadraticCurveTo(0, -14, 12, -4); c.stroke();
  if (dark) { c.fillStyle = 'rgba(255,255,255,.45)'; for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(sd * 46 - 14, -12, 12, 6, -0.4, 0, TAU); c.fill(); } } c.restore(); }
// the pot on the hob (k=1): lid rattles, boils over at «Пока ещё мягкий»
function pot(c, t) { const bo = clamp((t - ev('t1', 'boil')) / 0.5), rat = Math.sin(t * 40) * (4 + 14 * bo);
  c.save(); c.translate(560, -930); paint(c, q => { q.m(-230, 0); q.l(230, 0); q.l(210, -300); q.l(-210, -300); q.z(); }, '#7FB0D8', { sd: 6, hd: 3, lw: 5 }); c.fillStyle = '#2B2F3A'; c.fillRect(-300, -250, 80, 26); c.fillRect(220, -250, 80, 26);
  if (bo > 0) { c.fillStyle = '#FFFDF8'; c.strokeStyle = '#B9B2A8'; c.lineWidth = 4; for (let i = -4; i <= 4; i++) { const yy = -300 + Math.abs(i) * 4, dr = bo * (60 + 40 * Math.sin(i * 1.7)); c.beginPath(); c.ellipse(i * 55, yy + dr * 0.6, 50, 30 + dr * 0.5, 0, 0, TAU); c.fill(); c.stroke(); } }
  c.save(); c.translate(0, -310 - Math.abs(rat) - bo * 60); c.rotate(rat * 0.004); paint(c, q => { q.m(-230, 0); q.q(0, -70, 230, 0); q.z(); }, '#6A9AC0', { sd: 3, hd: 2, lw: 4 }); c.fillStyle = '#2B2F3A'; rr(c, -30, -70, 60, 30, 10); c.fill(); c.restore();
  c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 16; c.lineCap = 'round'; for (let i = 0; i < 3; i++) { const u = (t * 0.9 + i / 3) % 1; c.globalAlpha = 1 - u; c.beginPath(); c.moveTo((i - 1) * 90, -380 - u * 260); c.quadraticCurveTo((i - 1) * 90 + 40 * Math.sin(t * 3 + i), -430 - u * 260, (i - 1) * 90, -480 - u * 260); c.stroke(); } c.globalAlpha = 1; c.restore(); }
// the chart text + circles (k=2); circles drawn in, the 4th appears in the gag
function chart(c, t) { fitTxt(c, 'SUNDAY —', 600, -1550, 80, '#2B2F3A', 600); fitTxt(c, 'CALL MUM', 600, -1450, 80, '#2B2F3A', 600);
  const n = t > ev('t2', 'gag') + 0.75 ? 4 : 3, pulse = t > ev('t2', 'gag') && t < ev('t2', 'react') ? 1 + 0.05 * Math.sin(t * 20) : 1;
  c.save(); c.translate(600, -1500); c.scale(pulse, pulse); c.strokeStyle = '#E0474C'; c.lineCap = 'round'; for (let i = 0; i < n; i++) { const k = i < 3 ? 1 : eOut(clamp((t - ev('t2', 'gag') - 0.75) / 0.3)); c.lineWidth = 10; c.beginPath(); c.ellipse(0, 0, 290 + i * 18, 130 + i * 14, (i - 1.5) * 0.03, -1.4, -1.4 + Math.max(0.01, TAU * 0.995 * k)); c.stroke(); } c.restore(); }
// the list pile (k=3): stacks of paper on the table, the top sheet readable; slides off in the gag
function listTable(c, t) { const sl = clamp((t - ev('t3', 'gag') - 0.6) / 0.5), slid = t > ev('t3', 'gag') + 0.6 && t < ev('t3', 'nar') + 99;
  paint(c, q => { q.m(-900, -760); q.l(900, -760); q.l(900, -700); q.l(-900, -700); q.z(); }, '#C98B5A', { sd: 6, hd: 3, lw: 4 }); c.fillStyle = '#9C6238'; c.fillRect(-900, -700, 1800, 700);
  for (let i = 0; i < 3; i++) { const x = -620 + i * 520; for (let j = 0; j < 8; j++) { c.fillStyle = j % 2 ? '#FFFDF8' : '#F2EEE4'; c.save(); c.translate(x + Math.sin(i * 3 + j) * 12, -770 - j * 22); c.rotate(Math.sin(i + j * 2) * 0.03); c.fillRect(-170, -10, 340, 20); c.restore(); } }
  // the top sheet on the middle pile, slides off to the right
  c.save(); c.translate(-100 + 900 * eIn(sl), -980 + 700 * sl * sl); c.rotate(-0.04 + sl * 1.2); c.fillStyle = '#FFFDF8'; c.strokeStyle = '#B9B2A8'; c.lineWidth = 3; c.fillRect(-190, -150, 380, 260); c.strokeRect(-190, -150, 380, 260);
  fitTxt(c, "COUSIN'S WEDDING", 0, -100, 34, '#2B2F3A', 340, 'Cav7'); fitTxt(c, 'SATURDAY', 0, -40, 40, '#E0474C', 340, 'Cav7'); fitTxt(c, 'BRING SALAD', 0, 20, 34, '#2B2F3A', 340, 'Cav7'); c.restore();
  if (slid) for (let i = 0; i < 6; i++) { const u = clamp((t - ev('t3', 'gag') - 0.6 - i * 0.05) / 0.9); if (u <= 0) continue; c.save(); c.translate(-300 + i * 160 + u * 200 * (i % 2 ? 1 : -1), -1000 + u * 900 - Math.sin(u * Math.PI) * 300); c.rotate(u * (2 + i)); c.fillStyle = '#FFFDF8'; c.strokeStyle = '#B9B2A8'; c.lineWidth = 3; c.fillRect(-90, -60, 180, 120); c.strokeRect(-90, -60, 180, 120); c.restore(); } }
// three pairs of glasses hanging round her neck on cords (k=3); after the gag, two of them sit on her nose
function neckSpecs(cc, gg, t) { const on = t > ev('t3', 'gag') + 0.1 ? (t > ev('t3', 'gag') + 0.35 ? 2 : 1) : 0;
  const cols = ['#B03A6A', '#2B2F3A', '#C9A04A']; for (let i = on; i < 3; i++) { const y = gg.ySh + 80 + i * 70; cc.strokeStyle = 'rgba(62,71,30,.6)'; cc.lineWidth = 3; cc.beginPath(); cc.moveTo(-gg.sw * 0.4, gg.ySh); cc.quadraticCurveTo(0, y + 30, gg.sw * 0.4, gg.ySh); cc.stroke(); specs(cc, 0, y, 0.9, cols[i]); } }
const MZ = { 1: [0.95, 160], 2: [0.95, 380], 3: [0.95, 60], 4: [0.95, 0], yoga: [0.62, 0] };
function mumState(t, k) { const g = G.mum, st = { ...base(g, t, 'mumt1'), mood: 'happy', armL: hold(g, -1, 330, 0.55), armR: hold(g, 1, 330, 0.55) }, L = sceneAt(t).id, e = n => ev(L, n);
  if (k === 1) { st.mood = 'happy'; st.blink = Math.sin(t * 2.2) > 0.96 ? 1 : 0; gest(st, g, 'mumt1', t, -1, 160);
    if (t > e('gag') - 0.05 && t < e('react')) { const u = eOut(clamp((t - e('gag')) / 0.3)); st.armR = reach(g, 1, g.sw * lerp(0.8, 1.6, u), g.ySh + lerp(330, 120, u), { planar: true }); st.lean = 0.2 * u; st.mood = 'happy'; st.laugh = true; }
    if (t > e('nar')) { st.armR = open(g, 1, 1.7, 80 + Math.sin(t * 8) * 30); st.laugh = false; }
    if (t > e('boil')) { st.mood = 'surprised'; st.look = 0.8; st.turn = 0.3; } }
  if (k === 2) { st.mood = 'angry'; st.turn = 0.1; const ang = speaking('t2_mum', t) ? -0.9 + 0.15 * Math.sin(t * 6) : -1.0; st.armR = reach(g, 1, g.sw * 2.0, g.ySh + 170, { planar: true }); st.items = { R: ctx => ladle(ctx, ang + 1.9) };
    if (t > e('gag') && t < e('react')) { const tap = Math.abs(Math.sin((t - e('gag')) * Math.PI / 0.3)); st.armR = reach(g, 1, g.sw * (2.0 + 0.35 * tap), g.ySh + 140, { planar: true }); st.items = { R: ctx => ladle(ctx, 0.9) }; st.look = 0.6; }
    if (t > e('nar')) { st.mood = 'smug'; st.armR = reach(g, 1, g.sw * 1.3, g.ySh + 200, { planar: true }); st.items = { R: ctx => ladle(ctx, -0.3) }; }
    if (t > e('slam') - 0.1 && t < e('slam') + 0.6) { const u = clamp((t - e('slam') + 0.1) / 0.12); st.mood = 'angry'; st.armR = reach(g, 1, g.sw * 1.5, g.ySh + lerp(-80, 330, u), { planar: true }); st.items = { R: ctx => ladle(ctx, lerp(-2.4, -1.6, u)) }; } }
  if (k === 3) { st.mood = 'worried'; gest(st, g, 'mumt1', t, -1, 120); st.armR = hold(g, 1, 300, 0.7);
    if (t > e('gag') && t < e('gag') + 0.6) { st.headFirst = true; st.armR = reach(g, 1, g.hw * 0.7, g.headY + g.hh * 0.1, { planar: true }); st.mood = 'skeptical'; }
    if (t > e('gag') + 0.6) { st.mood = 'shock'; st.blink = 0; st.armR = open(g, 1, 1.8, 120); st.armL = open(g, -1, 1.8, 120); }
    if (t > e('shrug') - 0.05) { st.mood = 'smug'; st.blink = 1; st.armL = open(g, -1, 2.0, 40); st.armR = open(g, 1, 2.0, 40); st.tilt = 0.08; } }
  if (k === 4) { st.mood = 'skeptical'; st.blink = 0; st.armR = hold(g, 1, 260, 0.35); st.armL = hold(g, -1, 330, 0.45); st.items = { R: phoneItem(t, 'video', 0.8) };
    if (t > e('peek') - 0.05) st.mood = 'angry'; }
  if (k === 'yoga') { const gy = geom(MUM_Y); st.mood = 'happy'; st.blink = 0; st.look = 0.3; const sw = Math.sin(t * 1.5) * 15; st.armL = reach(gy, -1, -gy.sw * 1.6, gy.headY - gy.hh * 1.6 + sw, { planar: true }); st.armR = reach(gy, 1, gy.sw * 1.6, gy.headY - gy.hh * 1.6 - sw, { planar: true }); st.legPose = 'wide'; if (speaking('end_mum', t)) { st.mood = 'worried'; st.talk = talk('mumt1', t); } }
  return st; }
// the leaning-in factor for the spy (k=4): grows over her line, holds big for the narrator
const spyS = t => { const L = sceneAt(t).id; if (L !== 't4') return 1; return 1 + 0.55 * eIO(clamp((t - SP.t4_mum.t) / (SP.t4_mum.d + 0.2))); };
function callScene(c, t, k, w, h, tile = false) {   // draws mum's call into a w x h box at the current origin; returns mum's head (box coords)
  const [z0, cx] = MZ[k], g = G.mum, zz = z0 * (tile ? w / W : 1) * (k === 4 ? spyS(t) : 1), cy = g.headY - (h * (tile ? 0.5 : 0.47) - h / 2) / zz;
  c.save(); c.translate(w / 2, h / 2); c.scale(zz, zz); c.translate(-cx, -(k === 4 ? g.headY + 40 : cy));
  mumSetBack(c, k, t);
  let hd;
  if (k === 1) pot(c, t);
  if (k === 2) chart(c, t);
  const st = mumState(t, k);
  if (k === 3) st.afterTorso = cc => neckSpecs(cc, g, t);
  if (k === 'yoga') { for (const [cfg, x, gg] of [[Y1, -640, G.y1], [Y2, 640, G.y2]]) { c.save(); c.translate(x, -160); c.scale(0.72, 0.72); paint(c, q => { q.m(-300, 0); q.l(300, 0); q.l(330, 60); q.l(-330, 60); q.z(); }, x < 0 ? '#7CC45A' : '#7FB0D8', { sd: 3, hd: 2, lw: 3 }); Hq.human(c, cfg, { t, mood: 'happy', blink: 1, armL: reach(gg, -1, -gg.sw * 1.6, gg.headY - gg.hh * 1.6, { planar: true }), armR: reach(gg, 1, gg.sw * 1.6, gg.headY - gg.hh * 1.6, { planar: true }) }); c.restore(); }
    paint(c, q => { q.m(-360, 0); q.l(360, 0); q.l(400, 70); q.l(-400, 70); q.z(); }, '#EE5E9A', { sd: 3, hd: 2, lw: 3 }); }
  const cfg = { 1: MUM, 2: MUM_G, 3: MUM_L, 4: MUM_S, yoga: MUM_Y }[k];
  hd = K.put(c, cfg, st, 0, 0);
  if (k === 3) { listTable(c, t); const on = t > ev('t3', 'gag') + 0.1 ? (t > ev('t3', 'gag') + 0.35 ? 2 : 1) : 0; if (on >= 1) specs(c, hd.x, hd.y + hd.hh * 0.06, 1.05, '#B03A6A'); if (on >= 2) specs(c, hd.x, hd.y - hd.hh * 0.18, 1.0, '#2B2F3A'); }
  if (k === 4) { const lo = clamp((t - ev('t4', 'peek')) / 0.6) * hd.hh * 0.32; specs(c, hd.x, hd.y + hd.hh * 0.06 + lo, 1.25, '#14161C', true);
    const gl = 0.25 + 0.1 * Math.sin(t * 5); const gr = c.createRadialGradient(hd.x, hd.y + hd.hh * 1.6, 10, hd.x, hd.y + hd.hh * 1.6, hd.hh * 2.4); gr.addColorStop(0, `rgba(91,224,138,${gl})`); gr.addColorStop(1, 'rgba(91,224,138,0)'); c.fillStyle = gr; c.fillRect(hd.x - hd.hh * 3, hd.y - hd.hh * 2, hd.hh * 6, hd.hh * 6); }
  if (k === 'yoga') { for (let i = 0; i < 3; i++) { const u = (t * 1.2 + i / 3) % 1; c.save(); c.globalAlpha = 1 - u; c.fillStyle = '#7CC7F2'; c.beginPath(); c.ellipse(hd.x + (i - 1) * hd.hh * 0.9, hd.y - hd.hh * 0.8 + u * hd.hh, 9, 15, 0, 0, TAU); c.fill(); c.restore(); } }
  const M = c.getTransform(); c.restore(); return hd; }
// full-screen call view (the phone's screen) with a thin bezel; the jam jar gag is drawn over it
function callView(c, t, k) { const hd = callScene(c, t, k, W, HH); const M0 = c.getTransform();
  if (k === 1) jamGag(c, t);
  // bezel
  c.save(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 36; rr(c, 0, 0, W, HH, 70); c.stroke(); c.restore();
  return hd; }
function jamGag(c, t) { const g0 = ev('t1', 'gag'), u = t - g0; if (u < 0 || t > ev('t1', 'react')) return; const k = eIn(clamp(u / 0.45)), squash = u > 0.45 ? 1 : 0, wob = u > 0.45 ? Math.sin((u - 0.45) * 30) * Math.exp(-(u - 0.45) * 6) * 0.06 : 0;
  c.save(); c.translate(lerp(760, 540, k), lerp(1150, 1250, k)); c.scale(lerp(0.4, 3.4, k) * (1 + squash * 0.12 + wob), lerp(0.4, 3.4, k) * (1 - squash * 0.08 - wob)); jamJar(c, 0, 160, 1); c.restore();
  if (squash) { c.save(); c.globalAlpha = 0.5; c.fillStyle = '#FFFFFF'; c.beginPath(); c.ellipse(420, 700, 60, 200, -0.4, 0, TAU); c.fill(); c.restore(); } }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const HY = k => G[k].headY, fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(130, fy(HY('her'), 0.55, 1070), 0.55, 'cover'), WIDE: S(130, fy(HY('her'), 0.52, 800), 0.52, 'wide'),
  TWO: S(-10, fy(HY('her'), 0.72, 760), 0.72, 'two'),
  HER: S(HX + 40, fy(HY('her'), 1.0), 1.0, 'her'), HER_R: S(HX + 40, fy(HY('her'), 1.0, 1060), 1.0, 'her'),
  CAT: S(150, CT - 260, 1.15, 'cat'),
  PHONE: U('phone', 1), FOUR: U('four', 2), SHEET: U('sheet', 3), ONLINE: U('online', 4), DIAL: U('dial', 5), ENDED: U('ended', 6),
  C1: U('call1', 11), C2: U('call2', 12), C3: U('call3', 13), C4: U('call4', 14), CY: U('callyoga', 15) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < 2.45) return SH.COVER; if (t < hev('phone')) return f(SH.HER); if (t < hev('four') - 0.03) return f(SH.PHONE); if (t < hev('cat') - 0.03) return f(SH.FOUR); return f(SH.WIDE); }
  if (CH.includes(L)) { const CV = { t1: SH.C1, t2: SH.C2, t3: SH.C3, t4: SH.C4 }[L];
    if (t < e('call') - 0.02) return f(SH.CAT);
    if (t < e('gag') - 0.02) return f(CV);
    if (L === 't4' && t < e('react') - 0.02) return f(SH.ONLINE);
    if (t < e('react') - 0.02) return f(CV);
    if (t < e('nar') - 0.02) return f(L === 't2' ? SH.TWO : SH.HER_R);
    if (L === 't3' && t < e('shrug') - 0.02) return f(SH.SHEET);
    return f(CV); }
  if (L === 'end') { if (t < e('dial') - 0.02) return f(SH.WIDE); if (t < SP.end_h.t - 0.1) return f(SH.DIAL); if (t < e('yoga') - 0.02) return f(SH.HER); if (t < e('hang') - 0.02) return f(SH.CY);
    if (t < e('stare') - 0.02) return f(SH.ENDED); if (t < e('catlook') - 0.02) return f(SH.HER); if (t < e('moral') - 0.02) return f(SH.CAT); return f(SH.TWO); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'thud', 'stamp']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- inserts on a solid backdrop
function backdrop(c, t, a, b) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.08)'; for (let i = -12; i < 12; i++) c.fillRect(-1600, i * 160 + (t * 40) % 160, 3200, 60); c.restore(); }
const pop = (t, t0) => eBack(clamp((t - t0 + 0.05) / 0.3), 1.6);
function bigPhone(c, t, x, y, s, draw) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -230 + 14, -420 + 18, 460, 840, 60); c.fill(); c.fillStyle = '#2B2F3A'; rr(c, -230, -420, 460, 840, 60); c.fill();
  c.save(); c.beginPath(); rr(c, -206, -392, 412, 784, 36); c.clip(); c.translate(-206, -392); draw(c, 412, 784); c.restore(); c.fillStyle = '#2B2F3A'; rr(c, -60, -412, 120, 26, 13); c.fill(); c.restore(); }
// hook: the incoming call, MUM · 27 missed calls (buzzing)
function phoneView(c, t) { backdrop(c, t, '#2E3A4A', '#141A22'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'phone' });
  const k = pop(t, hev('phone')), sh = Math.sin(t * 50) * 7; buzzLines(c, 540, 860, 3.2, t, 1); bigPhone(c, t, 540 + sh, 860, k * 1.05, (cc, w, h) => screen(cc, w, h, 'call', t)); badge(c, 540 + 230 * k, 860 - 430 * k, 90 * k, '27'); }
// hook teaser: the four mums on video, 2x2
function fourView(c, t) { c.fillStyle = '#2B2F3A'; c.fillRect(0, 0, W, HH); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'four' });
  const tw = 470, th = 560; [1, 2, 3, 4].forEach((k, i) => { const kk = eBack(clamp((t - hev('four') - i * 0.12) / 0.3), 1.8); if (kk <= 0) return; const x = 285 + (i % 2) * 510, y = 520 + Math.floor(i / 2) * 610;
    c.save(); c.translate(x, y); c.scale(kk, kk); c.fillStyle = COLS['t' + k]; rr(c, -tw / 2 - 14, -th / 2 - 14, tw + 28, th + 28, 40); c.fill(); c.beginPath(); rr(c, -tw / 2, -th / 2, tw, th, 30); c.clip(); c.translate(-tw / 2, -th / 2); callScene(c, k === 4 ? SP.t4_mum.t + 2 : t, k, tw, th, true); c.restore(); }); }
// 03: the top sheet
function sheetView(c, t) { backdrop(c, t, '#F7E3B0', '#E3B860'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'sheet' });
  const k = pop(t, ev('t3', 'sheet')); c.save(); c.translate(540, 900); c.scale(k, k); c.rotate(-0.04); c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(-380 + 14, -480 + 18, 760, 960); c.fillStyle = '#FFFDF8'; c.fillRect(-380, -480, 760, 960);
  c.strokeStyle = 'rgba(127,176,216,.6)'; c.lineWidth = 4; for (let y = -380; y < 460; y += 80) { c.beginPath(); c.moveTo(-380, y); c.lineTo(380, y); c.stroke(); } c.strokeStyle = 'rgba(224,71,76,.6)'; c.beginPath(); c.moveTo(-300, -480); c.lineTo(-300, 480); c.stroke();
  fitTxt(c, "COUSIN'S", 30, -330, 90, '#2B2F3A', 600, 'Cav7'); fitTxt(c, 'WEDDING', 30, -230, 96, '#2B2F3A', 600, 'Cav7'); fitTxt(c, 'SATURDAY', 30, -60, 104, '#E0474C', 620, 'Cav7'); fitTxt(c, 'BRING SALAD', 30, 120, 86, '#2B2F3A', 620, 'Cav7');
  const ul = eOut(clamp((t - ev('t3', 'sheet') - 0.4) / 0.4)); c.strokeStyle = '#E0474C'; c.lineWidth = 10; c.lineCap = 'round'; c.beginPath(); c.moveTo(-220, -10); c.lineTo(-220 + 500 * ul, -14); c.stroke(); if (ul > 0.9) { c.beginPath(); c.moveTo(-220, 8); c.lineTo(280, 4); c.stroke(); }
  for (let i = 0; i < 3; i++) { c.fillStyle = '#E0474C'; c.save(); c.translate(-200 + i * 70, 300); c.rotate(-0.2); c.fillRect(-10, -40, 20, 80); c.restore(); }
  c.restore(); }
// 04: mum's phone — the heroine's photo, green ONLINE
function onlineView(c, t) { backdrop(c, t, '#1E2A22', '#0E1410'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'online' });
  const t0 = ev('t4', 'gag'), k = pop(t, t0), on = Math.sin(t * 8) > -0.4;
  bigPhone(c, t, 540, 860, k * 1.1, (cc, w, h) => { cc.fillStyle = '#F4F1EC'; cc.fillRect(0, 0, w, h);
    herAvatar(cc, w / 2, h * 0.36, w * 0.32);
    cc.strokeStyle = '#5BE08A'; cc.lineWidth = 10; cc.beginPath(); cc.arc(w / 2, h * 0.36, w * 0.32, 0, TAU); cc.stroke();
    cc.fillStyle = on ? '#3CCB6A' : '#2E9A52'; cc.beginPath(); cc.arc(w / 2 + w * 0.24, h * 0.36 + w * 0.24, w * 0.07, 0, TAU); cc.fill(); cc.strokeStyle = '#F4F1EC'; cc.lineWidth = 8; cc.stroke();
    cc.fillStyle = '#3CCB6A'; rr(cc, w * 0.18, h * 0.62, w * 0.64, h * 0.11, h * 0.055); cc.fill(); fitTxt(cc, 'ONLINE', w / 2, h * 0.675 + 3, w * 0.13, '#FFFFFF', w * 0.55); });
  // a magnifying glass sweeps over the screen (spy)
  const u = clamp((t - t0 - 0.5) / 0.8); if (u > 0) { const mx = lerp(300, 780, eIO(u)), my = lerp(720, 560, eIO(u)); c.save(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 22; c.beginPath(); c.arc(mx, my, 110, 0, TAU); c.stroke(); c.fillStyle = 'rgba(200,230,255,.18)'; c.fill(); c.lineCap = 'round'; c.lineWidth = 34; c.beginPath(); c.moveTo(mx + 80, my + 80); c.lineTo(mx + 190, my + 190); c.stroke(); c.restore(); } }
// twist: calling / call ended
function dialView(c, t) { backdrop(c, t, '#2E3A4A', '#141A22'); const k = pop(t, ev('end', 'dial')); bigPhone(c, t, 540, 860, k * 1.05, (cc, w, h) => screen(cc, w, h, 'dial', t)); }
function endedView(c, t) { backdrop(c, t, '#3A2A30', '#1E1418'); const k = pop(t, ev('end', 'hang')); bigPhone(c, t, 540, 860, k * 1.05, (cc, w, h) => screen(cc, w, h, 'ended', t)); }

// ---------------- overlays
function title(c, t) { const a = 1 - P(t, 2.25, 2.5); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 300); c.rotate(-0.04); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.fillStyle = C.olive; rr(c, -440, -205, 260, 64, 32); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 5; rr(c, -440, -205, 260, 64, 32); c.stroke(); fitTxt(c, '4 ТИПА', -310, -172, 34, C.white, 220);
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 76, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -98);
  UI.textFit(c, 'Unb9', 130, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 10, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 66, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 116); c.restore();
  if (global.__QA) global.__QA.ui(c, 'card', { x: 50, y: 95, w: 980, h: 370, k: a, id: 'title' }); }
// chapter label at the top: «01 · SHOULD» + the Russian type name; pops big, settles at the top
function label(c, t, sc) { const p = LABEL[sc.id]; if (!p) return; const u = t - sc.s, out = P(t, sc.e - 0.15, sc.e);
  const k = eBack(P(u, 0, 0.25), 2.2) * (1 - eIn(out)), big = 1 - eIO(P(u, 0.55, 0.8)); if (k <= 0) return;
  const w = 780, h = 150, s = k * lerp(0.82, 1.12, big), y = lerp(170, 330, big), col = COLS[sc.id];
  c.save(); c.translate(540, y); c.scale(s, s); c.rotate(-0.02);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -h / 2 + 9, w, h, 40); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 40); c.fill(); c.stroke();
  c.fillStyle = col; rr(c, -w / 2, -h / 2, 170, h, [40, 0, 0, 40]); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 40); c.stroke();
  fitTxt(c, p[0], -w / 2 + 85, 4, 80, C.white, 140); fitTxt(c, p[1], 85, -22, 70, C.oliveD, 560); fitTxt(c, p[2], 85, 44, 34, col === '#F2B33D' ? '#B07A10' : col, 560);
  c.restore(); if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w / 2 * s, y: y - h / 2 * s, w: w * s, h: h * s, k, id: 'label_' + sc.id }); }

// ---------------- end screen: КАКАЯ ТВОЯ? 1/2/3/4 (type names), СОХРАНИ, ПОДПИСАТЬСЯ clicked by the cursor, then the comment question (ask)
const wAt = (id, w, fb) => K.wordT(id, w) ?? fb;
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, ask = SP.ask, { textFit, strokeText, font } = UI;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // heroine with her phone + the cat (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34, 2nd character at local x 640)
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her; c.save(); c.translate(640, 0); c.scale(1.05, 1.05); Hq.catChar(c, { t, mood: 'happy', talk: 0, look: -0.5, hat: headset, armL: catReach(1, 250, -80 + Math.sin(t * 6) * 30), armR: catReach(1, 250, -80 + Math.sin(t * 6 + 1) * 30) }); c.restore();
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 160 + Math.sin(t * 8) * 30, { planar: true }), armR: reach(g, 1, g.sw * 1.25, g.ySh + 260, { planar: true }), items: { R: phoneItem(t, 'video', 1.15) } }, 0, 0); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const swap = eIO(P(t, ask.t - 0.15, ask.t + 0.15));
  const q = eBack(P(u, 0.15, 0.5), 2.2) * (1 - swap); if (q > 0) { c.save(); c.translate(540, 330); c.scale(q, q); font(c, 'Unb9', 92); strokeText(c, 'КАКАЯ ТВОЯ?', 0, 0, C.pink, C.white, 16); c.restore(); }
  const q2 = eBack(P(t, ask.t, ask.t + 0.3), 2.2); if (q2 > 0) { c.save(); c.translate(540, 300); c.scale(q2, q2); c.rotate(-0.02);
    c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -480 + 8, -170 + 12, 960, 340, 40); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 8; rr(c, -480, -170, 960, 340, 40); c.fill(); c.stroke();
    textFit(c, 'Unb9', 74, 'КАКАЯ МАМА', 860); c.fillStyle = C.oliveD; c.fillText('КАКАЯ МАМА', 0, -88); textFit(c, 'Unb9', 92, 'У ТЕБЯ?', 860); strokeText(c, 'У ТЕБЯ?', 0, 4, C.pink, C.white, 12);
    textFit(c, 'Unb9', 48, 'НАПИШИ НОМЕР', 700); c.fillStyle = C.oliveD; c.fillText('НАПИШИ НОМЕР', -40, 96); c.fillStyle = C.pink; c.beginPath(); c.moveTo(250, 76); c.lineTo(300, 76); c.lineTo(300, 104); c.lineTo(324, 104); c.lineTo(275, 140); c.lineTo(226, 104); c.lineTo(250, 104); c.closePath(); c.fill(); c.restore(); }
  const aw = ['один', 'два', 'три', 'четыре'].map((w, i) => wAt('ask', w, ask.t + 2.3 + i * 0.5));
  CH.forEach((id, i) => { const p = LABEL[id], t0 = s + 0.35 + i * 0.12, kk = eBack(P(t, t0 - 0.05, t0 + 0.25), 2.2); if (kk <= 0) return; const x = 290 + (i % 2) * 450, y = 650 + Math.floor(i / 2) * 200, bump = 1 + 0.1 * Math.sin(clamp((t - aw[i]) / 0.4) * Math.PI);
    c.save(); c.translate(x, y); c.scale(kk * bump, kk * bump); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -205 + 8, -80 + 12, 410, 160, 36); c.fill(); c.fillStyle = COLS[id]; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -205, -80, 410, 160, 36); c.fill(); c.stroke();
    font(c, 'Unb9', 110); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(String(i + 1), -140, 8);
    const ls = ['МАМА-', p[2].replace('МАМА-', '')]; ls.forEach((s_, j) => { textFit(c, 'Unb9', 38, s_, 280); c.fillStyle = C.white; c.textAlign = 'left'; c.fillText(s_, -85, (j - 0.5) * 46 + 4); }); c.restore(); });
  const svT = sp.t - 0.05, sk = eBack(P(t, svT, svT + 0.3), 2.2), pulse = 1 + 0.06 * Math.sin(clamp((t - svT - 0.3) / 0.5) * Math.PI);
  if (sk > 0) { c.save(); c.translate(540, 1050); c.scale(sk * pulse, sk * pulse); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -260 + 6, -60 + 10, 520, 120, 60); c.fill(); c.fillStyle = C.gold; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -260, -60, 520, 120, 60); c.fill(); c.stroke();
    c.fillStyle = C.oliveD; c.beginPath(); c.moveTo(-190, -32); c.lineTo(-146, -32); c.lineTo(-146, 34); c.lineTo(-168, 16); c.lineTo(-190, 34); c.closePath(); c.fill();   // bookmark icon
    textFit(c, 'Unb9', 50, 'СОХРАНИ', 330); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.fillText('СОХРАНИ', 40, 4); c.restore(); }
  const subT = sp.t + 1.2, bk = eBack(P(t, subT, subT + 0.3), 2), sy = 1230;
  if (bk > 0) { const click = P(t, subT + 0.8, subT + 0.95), pressed = t > subT + 0.9; c.save(); c.translate(560, sy); const ss = bk * (1 - 0.08 * Math.sin(click * Math.PI)); c.scale(ss, ss); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -250 + 6, -58 + 10, 500, 116, 58); c.fill(); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -250, -58, 500, 116, 58); c.fill(); textFit(c, 'Unb9', 42, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 440); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4); c.restore();
    const mv = eIO(P(t, subT + 0.2, subT + 0.8)); UI.tapCursor(c, lerp(900, 620, mv), lerp(sy + 260, sy + 20, mv), 1, P(t, subT + 0.85, subT + 1.4)); }
  if (t < ask.t - 0.1) { c.save(); c.translate(0, -60); UI.captions(c, t); c.restore(); }
  Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj = p => p;
  if (tag.startsWith('ui:call')) { const k = tag === 'ui:callyoga' ? 'yoga' : +tag.slice(7); c.save(); c.translate(sh.x, sh.y); const hd = callView(c, t, k); c.restore(); heads = { her: OFFL, mumt1: hd }; Hq.vignette(c, W, HH, 0.18); }
  else if (tag.startsWith('ui:')) { ({ 'ui:phone': phoneView, 'ui:four': fourView, 'ui:sheet': sheetView, 'ui:online': onlineView, 'ui:dial': dialView, 'ui:ended': endedView })[tag](c, t); heads = null; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.24); }
  if (heads) { const names = { mumt1: ['MUM', '#D9708A'] }, onScr = {}; for (const k in heads) if (Math.abs(heads[k].x) < 1e4) onScr[k] = heads[k];
    K.bubbles(c, t, sc, onScr, proj, { cleanChunks: true, names, hold: { hook_h: -0.05, t1_mum: -0.05, t2_mum: 0.2, t3_mum: 0.15, t4_mum: 0.05, end_h: 0.05, end_mum: 0.15 } }); }
  if (L === 'hook') title(c, t);
  label(c, t, sc);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('mumtypes', NF, renderFrame);
