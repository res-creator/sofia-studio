// "Официант не видит тебя 20 минут — как позвать" — rubric «Полезное» (scene + 4 answers, worst -> best), hard_cut camera: node waiter.js start end out.mp4 | --png=f1,f2
// A London café: the heroine sits at a table with her CLOSED menu; a bird has built a nest on it and hatched three chicks (absurd detail);
// the wall clock shows a red 20-minute wedge; Charlie the waiter (white shirt, long black apron) keeps rushing past from the kitchen door.
// High on the wall right above her head hangs a sign «ORDER AT THE COUNTER ->» (the twist), the counter is at the far right.
// o1 «В ЛОБ»: "Hey! You! Food!" waving the menu like a flag (the nest hangs on) -> "Food is in the kitchen, madam." he walks off into the kitchen.
// o2 «ВЕЖЛИВО»: her timid line drowns in the clatter of his plate tower -> "Be right with you!" he whizzes past; his wind slaps her napkin onto her face.
// o3 «КАК НОСИТЕЛЬ»: she catches his eye -> he skids to a stop: "Of course! Sorry, it's mad today." insert: the pencil scribbles at lightning speed; tip.
// o4 «КОРОЛЕВСКИЙ ОТВЕТ»: the sweet line; through the window the seasons change (autumn leaves, then snow); he blushes: "...Dessert's on the house"
//    -> a giant cake slice; the chicks dive into the cream, the mother bird steals the cherry.
// Twist (music silent): he looks up with an open palm; tilt up to the sign; "Ah... madam... you order at the counter." she hides behind the menu; moral; end screen.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, hash, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/waiter/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];
// handovers: a negative per-line hold (bubble gone BEFORE the line ends) — ui_v2 clamps hold to >= 0.05, so shorten the bubble's span instead
{ const _bub = UI.bubble; UI.bubble = (ctx, sp, t, an, side, name) => _bub(ctx, sp.hold < 0.05 ? { ...sp, d: sp.d + sp.hold - 0.05 } : sp, t, an, side, name); }

// ---------------- cast
const HER = { ...BASE.her_restaurant, top: { type: 'longsleeve', col: '#3F7FBF' } };
const CHARLIE = { ...BASE.oliver, seed: 44, skin: '#C98E66', iris: '#2A1A10', jaw: 1.1, hair: { style: 'short', col: '#1A1210' }, brow: '#1A1210', watch: null,
  top: { type: 'longsleeve', col: '#FFFFFF' }, bottom: { type: 'trousers', col: '#1E1E24' }, shoes: { col: '#1A1210', acc: null } };
const G = { her: geom(HER), ch: geom(CHARLIE) };
const SEAT = 330, TOP = -500;                 // seated upper body dropped by SEAT; table top at y = TOP
const HX = -260, WX = 560, MX = -20, NS = 1.25;  // her seat x, Charlie's spot x, the menu (with the nest) on the table, nest scale
const TX0 = -760, TX1 = 480;                  // table ends
const CLX = 170, CLY = -1560, CLR = 125;      // wall clock
const SGX = HX + 20, SGY = -2750;             // «ORDER AT THE COUNTER» sign, right above her head
const DX0 = 960, DX1 = 1320, DH = 1480;       // kitchen door
const WN0 = -1080, WN1 = -480, WNY0 = -1960, WNY1 = -1260;   // window behind her (the seasons gag)
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function apron(cc, g) { const sw = g.sw, y0 = g.ySh;
  paint(cc, q => { q.m(-sw * 0.8, y0 + 440); q.l(sw * 0.8, y0 + 440); q.l(sw * 0.92, -300); q.l(-sw * 0.92, -300); q.z(); }, '#1E1E24', { sd: 10, hd: 4, lw: 4 });
  cc.fillStyle = '#1E1E24'; cc.fillRect(-sw * 0.95, y0 + 420, sw * 1.9, 40);
  cc.fillStyle = '#34343E'; rr(cc, -sw * 0.45, y0 + 560, sw * 0.9, 150, 12); cc.fill();   // pocket
  cc.fillStyle = '#F2C14E'; cc.fillRect(sw * 0.15, y0 + 520, 18, 80);                    // pencil in the pocket
  cc.fillStyle = '#1E1E24'; cc.beginPath(); cc.moveTo(0, y0 + 6); cc.lineTo(-44, y0 - 16); cc.lineTo(-44, y0 + 28); cc.closePath(); cc.fill(); cc.beginPath(); cc.moveTo(0, y0 + 6); cc.lineTo(44, y0 - 16); cc.lineTo(44, y0 + 28); cc.closePath(); cc.fill(); }
function blushOn(c, head, k) { if (k <= 0) return; c.save(); c.globalAlpha = 0.6 * k; c.fillStyle = '#FF5A7A'; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(head.x + s * head.hh * 0.48, head.y + head.hh * 0.18, head.hh * 0.2, head.hh * 0.11, 0, 0, TAU); c.fill(); } c.restore(); }

// ---------------- the nest on the menu: birds
const NAV = '#4C8FD0', YEL = '#F7D54A';
function chick(c, x, y, s, o = {}) { c.save(); c.translate(x, y); c.scale(s, s); c.rotate(o.rot || 0);
  paint(c, q => q.e(0, 0, 34, 32), YEL, { sd: 5, hd: 3, lw: 3 });
  c.fillStyle = '#F2B33D'; for (const dx of [-14, 0, 14]) { c.beginPath(); c.ellipse(dx, -32, 4, 10, dx * 0.03, 0, TAU); c.fill(); }   // fluff tuft
  const open = o.open ?? 0, bx = 0, by = 8;
  c.fillStyle = '#F08A2A'; c.beginPath(); c.moveTo(bx - 14, by - 4); c.lineTo(bx + 14, by - 4); c.lineTo(bx, by - 4 - 10 - open * 8); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(bx - 12, by); c.lineTo(bx + 12, by); c.lineTo(bx, by + 10 + open * 10); c.closePath(); c.fill();
  if (open > 0.2) { c.fillStyle = '#C0392B'; c.beginPath(); c.moveTo(bx - 8, by - 3); c.lineTo(bx + 8, by - 3); c.lineTo(bx, by + 5 + open * 6); c.closePath(); c.fill(); }
  const lk = o.look || 0;
  for (const s_ of [-1, 1]) { const ex = s_ * 14, ey = -8;
    if (o.dizzy) { c.strokeStyle = '#2B1A14'; c.lineWidth = 3; c.beginPath(); c.moveTo(ex - 5, ey - 5); c.lineTo(ex + 5, ey + 5); c.moveTo(ex + 5, ey - 5); c.lineTo(ex - 5, ey + 5); c.stroke(); continue; }
    if (o.blink) { c.strokeStyle = '#2B1A14'; c.lineWidth = 3; c.beginPath(); c.moveTo(ex - 6, ey); c.lineTo(ex + 6, ey); c.stroke(); continue; }
    c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(ex, ey, 8, 0, TAU); c.fill(); c.fillStyle = '#1A1014'; c.beginPath(); c.arc(ex + lk * 3, ey, 4.5, 0, TAU); c.fill(); }
  if (o.cream) { c.fillStyle = '#FFFDF8'; c.beginPath(); c.ellipse(-6, -24, 22, 12, -0.3, 0, TAU); c.fill(); c.beginPath(); c.ellipse(16, 18, 12, 8, 0.4, 0, TAU); c.fill(); }
  if (o.fluff) { c.fillStyle = YEL; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; c.beginPath(); c.ellipse(Math.cos(a) * 36, Math.sin(a) * 34, 10, 5, a, 0, TAU); c.fill(); } }
  c.restore(); }
function mumBird(c, x, y, s, o = {}) { c.save(); c.translate(x, y); c.scale((o.flip ? -1 : 1) * s, s); c.rotate(o.rot || 0);
  paint(c, q => { q.m(30, 10); q.l(90, 30); q.l(80, 44); q.l(26, 30); q.z(); }, '#3A6FA8', { sd: 3, hd: 2, lw: 3 });   // tail
  paint(c, q => q.e(0, 10, 46, 38), YEL, { sd: 5, hd: 3, lw: 3 });                                                     // belly
  paint(c, q => { q.m(-6, -8); q.b(30, -20, 52, 10, 40, 34); q.b(20, 40, 0, 24, -6, -8); q.z(); }, NAV, { sd: 4, hd: 2, lw: 3 });   // wing
  const wf = o.flap ? Math.sin((o.t || 0) * 30) * 0.8 : 0; if (o.flap) { c.save(); c.translate(10, 0); c.rotate(-0.9 + wf); paint(c, q => { q.m(0, 0); q.b(30, -50, 70, -50, 80, -30); q.b(50, -10, 20, 0, 0, 0); q.z(); }, NAV, { sd: 3, hd: 2, lw: 3 }); c.restore(); }
  paint(c, q => q.e(-30, -30, 30, 28), NAV, { sd: 4, hd: 2, lw: 3 });                                                  // head
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.ellipse(-36, -24, 18, 12, 0, 0, TAU); c.fill();                            // cheek
  c.fillStyle = '#2B2F3A'; c.fillRect(-58, -34, 40, 6);                                                                // eye stripe
  c.fillStyle = '#1A1014'; c.beginPath(); c.arc(-40, -36, 5, 0, TAU); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(-42, -38, 2, 0, TAU); c.fill();
  c.fillStyle = '#2B2F3A'; c.beginPath(); c.moveTo(-58, -30); c.lineTo(-76, -26); c.lineTo(-58, -22); c.closePath(); c.fill();   // beak
  if (o.cherry) { c.fillStyle = '#D0213A'; c.beginPath(); c.arc(-78, -14, 15, 0, TAU); c.fill(); c.strokeStyle = '#3E7A4A'; c.lineWidth = 3; c.beginPath(); c.moveTo(-78, -28); c.quadraticCurveTo(-74, -46, -62, -50); c.stroke(); }
  if (o.angry) { c.strokeStyle = '#1A1014'; c.lineWidth = 4; c.beginPath(); c.moveTo(-52, -50); c.lineTo(-30, -44); c.stroke(); }
  c.strokeStyle = '#E08A2A'; c.lineWidth = 4; c.beginPath(); c.moveTo(-6, 46); c.lineTo(-10, 60); c.moveTo(10, 46); c.lineTo(12, 60); c.stroke();
  c.restore(); }
// the nest: (0,0) = the bottom of the nest. ch: per-chick options (null = not in the nest)
function nest(c, s, o) { c.save(); c.scale(s, s); const t = o.t || 0;
  paint(c, q => q.e(0, -30, 120, 40), '#8A5A2E', { sd: 6, hd: 3, lw: 4 });
  c.fillStyle = '#5A3A1E'; c.beginPath(); c.ellipse(0, -44, 92, 20, 0, 0, TAU); c.fill();
  (o.chicks || []).forEach((ch, i) => { if (!ch) return; const x = (i - 1) * 54, bob = Math.sin(t * 9 + i * 2) * (ch.open > 0.3 ? 4 : 1.5); chick(c, x, -64 - bob, 0.9, ch); });
  c.strokeStyle = '#6B4320'; c.lineWidth = 5; c.lineCap = 'round';
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI, x0 = -118 + i * 15; c.beginPath(); c.moveTo(x0, -30 + Math.sin(i * 2.1) * 10); c.quadraticCurveTo(x0 + 30, -6 + Math.cos(i) * 8, x0 + 58, -26 + Math.sin(i * 1.3) * 10); c.stroke(); }
  c.strokeStyle = '#A9773E'; c.lineWidth = 4; for (let i = 0; i < 10; i++) { const x0 = -110 + i * 22; c.beginPath(); c.moveTo(x0, -48); c.quadraticCurveTo(x0 + 18, -30, x0 + 40, -44 + Math.sin(i) * 6); c.stroke(); }
  if (o.mum) mumBird(c, -140, -80, 0.85, o.mum);
  if (o.dizzy) for (let i = 0; i < 3; i++) { const a = t * 5 + i / 3 * TAU; c.save(); c.translate(Math.cos(a) * 110, -150 + Math.sin(a) * 20); c.fillStyle = C.gold; UI.star(c, 0, 0, 16, a); c.restore(); }
  if (o.feathers) for (let i = 0; i < 6; i++) { const u = ((o.feathers + i * 0.17) % 1); c.save(); c.globalAlpha = 1 - u; c.translate((hash(i) - 0.5) * 300 + Math.sin(u * 9 + i) * 30, -100 - u * 180); c.rotate(u * 4 + i); c.fillStyle = i % 2 ? YEL : '#FFFFFF'; c.beginPath(); c.ellipse(0, 0, 18, 6, 0, 0, TAU); c.fill(); c.restore(); }
  c.restore(); }
// default bird state for time t / scene L
function birdState(t, L) { const blink = i => Math.sin(t * 1.7 + i * 2.3) > 0.985 ? 1 : 0, chirp = i => Math.max(0, Math.sin(t * 7 + i * 1.9)) * (Math.sin(t * 0.9 + i) > 0.2 ? 1 : 0);
  const o = { t, chicks: [0, 1, 2].map(i => ({ open: chirp(i), blink: blink(i), look: 0 })), mum: { t, flip: false } };
  const tw = TL.sfx.filter(x => x.n === 'tweet' && t >= x.t && t < x.t + 0.7); if (tw.length) o.chicks.forEach((ch, i) => { ch.open = 0.6 + 0.4 * Math.abs(Math.sin(t * 20 + i)); });
  if (L === 'o1') { const d = ev('o1', 'drop'); if (t > d && t < d + 2.2) { o.dizzy = true; o.chicks.forEach(ch => { ch.dizzy = true; ch.open = 0; }); }
    if (t > ev('o1', 'peck') && t < ev('o1', 'peck') + 0.6) o.mum.angry = true; }
  if (L === 'o2') { const w = ev('o2', 'wind'); if (t > w) { o.chicks.forEach(ch => { ch.fluff = true; }); if (t < w + 1.6) o.feathers = (t - w) * 0.8; o.mum.rot = t < w + 0.6 ? -0.4 : 0; } }
  if (L === 'o3' && t > ev('o3', 'skid') - 0.1 && t < ev('o3', 'back')) o.chicks.forEach(ch => { ch.look = 1; ch.open = 0; });
  if (L === 'o4') { if (t > ev('o4', 'dive')) o.chicks = [null, null, null]; if (t > ev('o4', 'cherry')) o.mum = null; }
  if (L === 'end') { o.chicks = [null, null, null]; o.mum = null; }
  return o; }
// the closed menu lying on the table: (0,0) = front bottom centre
function menuFlat(c, s) { c.save(); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(0, 4, 190, 16, 0, 0, TAU); c.fill();
  paint(c, q => { q.m(-180, -24); q.l(180, -24); q.l(180, 0); q.l(-180, 0); q.z(); }, '#F4EAD8', { sd: 3, hd: 2, lw: 3 });          // pages edge
  paint(c, q => { q.m(-150, -78); q.l(150, -78); q.l(184, -24); q.l(-184, -24); q.z(); }, '#7A1F3D', { sd: 4, hd: 3, lw: 4 });       // cover (top)
  c.strokeStyle = '#E0B24A'; c.lineWidth = 3; c.beginPath(); c.moveTo(-138, -70); c.lineTo(138, -70); c.lineTo(166, -30); c.lineTo(-166, -30); c.closePath(); c.stroke();
  c.restore(); }
// the menu standing upright (in her hand or in front of her face): (0,0) = centre
function menuUp(c, s, rot = 0) { c.save(); c.rotate(rot); c.scale(s, s);
  paint(c, q => { q.m(-150, -210); q.l(150, -210); q.l(150, 210); q.l(-150, 210); q.z(); }, '#7A1F3D', { sd: 6, hd: 3, lw: 4 });
  c.strokeStyle = '#E0B24A'; c.lineWidth = 5; rr(c, -126, -186, 252, 372, 14); c.stroke();
  fitTxt(c, 'MENU', 0, -60, 64, '#E0B24A', 220);
  c.strokeStyle = '#E0B24A'; c.lineWidth = 4; c.beginPath(); c.moveTo(-60, 10); c.lineTo(60, 10); c.stroke();
  c.restore(); }
// where the menu + nest is at time t: { mode: 'table' | 'hand' | 'face', x, y, rot }
function menuPose(t, L) {
  if (L === 'o1') { const a = SP.o1_h.t - 0.15, b = ev('o1', 'drop'); if (t > a && t < b) { const u = t - a, up = eOut(clamp(u / 0.3)) * (1 - eIO(clamp((t - b + 0.4) / 0.4)));
      return { mode: 'hand', up, wave: t < endOf('o1_h') + 0.1 ? Math.sin(u * 9) * 0.45 : 0 }; } }
  if (L === 'end' && t > ev('end', 'hide')) return { mode: 'face', up: eIO(clamp((t - ev('end', 'hide')) / 0.6)) };
  return { mode: 'table' };
}
function menuNestTable(c, t, L) { const b = birdState(t, L); c.save(); c.translate(MX, TOP - 6); menuFlat(c, NS); c.translate(0, -52 * NS); nest(c, NS * 0.95, b); c.restore(); K.mark(c, 'nest', MX, TOP - 150, 200); }

// ---------------- the café (prerendered, softly blurred); the window, clock, sign, door and table are live
const BX0 = -3400, BY0 = -3800, BW = 7400, BH = 5400, BS = 0.5;
function drawRoom(c) {
  c.fillStyle = '#F3E6CF'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = 'rgba(62,122,106,.10)'; for (let x = BX0; x < BX0 + BW; x += 200) c.fillRect(x, BY0, 90, BH);
  c.fillStyle = '#2F5A48'; c.fillRect(BX0, -1100, BW, 850); c.strokeStyle = 'rgba(0,0,0,.14)'; c.lineWidth = 6; for (let x = BX0; x < BX0 + BW; x += 220) { c.beginPath(); c.moveTo(x, -1100); c.lineTo(x, -250); c.stroke(); }
  c.fillStyle = '#C9A06A'; c.fillRect(BX0, -1122, BW, 30);
  // framed pictures (left), a shelf with teapots
  for (const [x, y, col] of [[-2600, -2100, '#E0A08A'], [-1900, -2250, '#9FC8E0']]) { c.fillStyle = '#8A5A36'; rr(c, x - 170, y - 220, 340, 440, 12); c.fill(); c.fillStyle = col; c.fillRect(x - 140, y - 190, 280, 380); c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.arc(x, y - 40, 70, 0, TAU); c.fill(); }
  c.fillStyle = '#8A5A36'; c.fillRect(1400, -2280, 700, 26); for (let i = 0; i < 4; i++) { const x = 1460 + i * 170; c.fillStyle = ['#E0474C', '#F2C14E', '#4C8FD0', '#4CAF6A'][i]; c.beginPath(); c.ellipse(x + 50, -2330, 55, 48, 0, 0, TAU); c.fill(); c.fillRect(x + 90, -2350, 40, 12); c.beginPath(); c.arc(x + 50, -2382, 12, 0, TAU); c.fill(); }
  // the counter (far right): cake stand, till, coffee machine
  c.fillStyle = '#8A5A36'; c.fillRect(1500, -1000, 1500, 1000); c.fillStyle = '#A9744A'; c.fillRect(1480, -1040, 1540, 60); c.fillStyle = 'rgba(0,0,0,.08)'; for (let x = 1560; x < 3000; x += 180) c.fillRect(x, -950, 120, 900);
  c.fillStyle = '#B8C2CC'; rr(c, 1600, -1400, 300, 360, 30); c.fill(); c.fillStyle = '#2B2F3A'; c.fillRect(1640, -1360, 220, 120); c.fillStyle = '#E0474C'; c.beginPath(); c.arc(1750, -1190, 30, 0, TAU); c.fill();   // coffee machine
  c.fillStyle = '#2B2F3A'; rr(c, 2050, -1240, 260, 200, 16); c.fill(); c.fillStyle = '#7CC7F2'; c.fillRect(2080, -1220, 200, 90);   // till
  c.fillStyle = 'rgba(220,235,245,.7)'; c.beginPath(); c.ellipse(2550, -1160, 160, 140, 0, Math.PI, TAU); c.fill(); c.fillStyle = '#F2A0B8'; rr(c, 2440, -1170, 220, 110, 20); c.fill(); c.fillStyle = '#FFFDF8'; c.fillRect(2440, -1140, 220, 18);   // cake dome
  // far tables + chairs (left)
  for (const x of [-2500]) { c.fillStyle = '#FFFDF8'; rr(c, x - 330, -640, 660, 40, 12); c.fill(); c.fillStyle = '#E8D9C0'; c.fillRect(x - 300, -600, 600, 330); c.fillStyle = '#7A4E2E'; rr(c, x - 420, -1000, 120, 760, 30); c.fill(); rr(c, x + 300, -1000, 120, 760, 30); c.fill(); }
  // floor
  c.fillStyle = '#D9C6A4'; c.fillRect(BX0, -250, BW, BY0 + BH + 250); c.fillStyle = 'rgba(0,0,0,.07)'; for (let y = -250; y < BY0 + BH; y += 160) for (let x = BX0 + ((Math.round((y + 250) / 160)) % 2) * 160; x < BX0 + BW; x += 320) c.fillRect(x, y, 160, 160);
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGK = mkBG(drawRoom);

// the window: a London street (brick houses, a tree); season 0 = summer, 1 = autumn, 2 = winter
function seasonAt(t, L) { if (L !== 'o4') return { k: 0, snow: 0 }; const a = ev('o4', 'autumn'), b = ev('o4', 'snow'); return { k: clamp((t - a) / 0.5), snow: clamp((t - b + 0.2) / 0.5), ta: t - a, tb: t - b }; }
function windowView(c, t, L) { const s = seasonAt(t, L), w = WN1 - WN0, h = WNY1 - WNY0;
  c.fillStyle = '#FFFDF8'; rr(c, WN0 - 26, WNY0 - 26, w + 52, h + 52, 16); c.fill();
  c.save(); c.beginPath(); c.rect(WN0, WNY0, w, h); c.clip();
  const sky = c.createLinearGradient(0, WNY0, 0, WNY1); sky.addColorStop(0, s.snow > 0.5 ? '#C9D3DC' : '#9FD6F0'); sky.addColorStop(1, s.snow > 0.5 ? '#E8EDF2' : '#DCEFF8'); c.fillStyle = sky; c.fillRect(WN0, WNY0, w, h);
  c.fillStyle = '#B5523A'; c.fillRect(WN0, WNY0 + 180, 250, h); c.fillStyle = '#9A4430'; c.fillRect(WN0 + 360, WNY0 + 120, 300, h);
  c.fillStyle = 'rgba(255,255,255,.55)'; for (const [x, y] of [[WN0 + 40, WNY0 + 240], [WN0 + 140, WNY0 + 240], [WN0 + 40, WNY0 + 400], [WN0 + 140, WNY0 + 400], [WN0 + 420, WNY0 + 180], [WN0 + 540, WNY0 + 180], [WN0 + 420, WNY0 + 340], [WN0 + 540, WNY0 + 340]]) c.fillRect(x, y, 70, 100);
  c.fillStyle = '#9A9490'; c.fillRect(WN0, WNY1 - 90, w, 90);   // pavement
  // the tree
  const tx = WN0 + 300, ty = WNY1 - 90; c.fillStyle = '#6B4320'; c.fillRect(tx - 18, ty - 300, 36, 300);
  const col = s.k < 1 ? (s.k > 0 ? '#D9A030' : '#5AAE5A') : '#E07A2A', leaves = s.snow > 0.6 ? 0.25 : 1;
  c.save(); c.globalAlpha = leaves; c.fillStyle = col; for (const [x, y, r] of [[0, -360, 120], [-90, -300, 90], [90, -300, 90], [-40, -430, 80], [60, -420, 80]]) { c.beginPath(); c.arc(tx + x, ty + y, r, 0, TAU); c.fill(); } c.restore();
  if (s.snow > 0) { c.fillStyle = `rgba(255,255,255,${0.9 * s.snow})`; for (const [x, y, r] of [[0, -440, 100], [-80, -380, 60], [80, -380, 60]]) { c.beginPath(); c.ellipse(tx + x, ty + y, r, r * 0.35, 0, Math.PI, TAU); c.fill(); } c.fillRect(WN0, WNY1 - 100, w, 20); }
  if (s.ta > 0 && s.snow < 1) for (let i = 0; i < 14; i++) { const u = ((s.ta * 0.5 + hash(i)) % 1); c.save(); c.translate(WN0 + hash(i * 3) * w + Math.sin(u * 8 + i) * 40, WNY0 + u * h); c.rotate(u * 6 + i); c.fillStyle = i % 2 ? '#E07A2A' : '#D9A030'; c.beginPath(); c.ellipse(0, 0, 18, 9, 0, 0, TAU); c.fill(); c.restore(); }
  if (s.snow > 0) for (let i = 0; i < 40; i++) { const u = ((s.tb * 0.35 + hash(i * 5)) % 1); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(WN0 + hash(i * 7) * w + Math.sin(u * 6 + i) * 20, WNY0 + u * h, 7 + hash(i) * 5, 0, TAU); c.fill(); }
  c.restore();
  c.fillStyle = '#FFFDF8'; c.fillRect(WN0 + w / 2 - 12, WNY0, 24, h); c.fillRect(WN0, WNY0 + h / 2 - 12, w, 24);
  K.mark(c, 'window', (WN0 + WN1) / 2, (WNY0 + WNY1) / 2, 330); }
// the wall clock with the red «20 minutes» wedge; sweep (0..1) animates the wedge growing
function clock(c, t, x = CLX, y = CLY, r = CLR, sweep = 1) { c.save(); c.translate(x, y);
  c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.arc(10, 14, r + 14, 0, TAU); c.fill();
  c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(0, 0, r + 14, 0, TAU); c.fill(); c.fillStyle = '#FFFDF8'; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill();
  const a0 = -Math.PI / 2, a1 = a0 + (20 / 60) * TAU * sweep;
  c.fillStyle = 'rgba(224,71,76,.55)'; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, r * 0.92, a0, a1); c.closePath(); c.fill();
  c.strokeStyle = '#2B2F3A'; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; c.lineWidth = i % 3 ? r * 0.03 : r * 0.06; c.beginPath(); c.moveTo(Math.cos(a) * r * 0.8, Math.sin(a) * r * 0.8); c.lineTo(Math.cos(a) * r * 0.93, Math.sin(a) * r * 0.93); c.stroke(); }
  c.lineCap = 'round'; c.lineWidth = r * 0.08; const ha = -Math.PI / 2 + TAU * (1.6 / 12) + (20 / 720) * TAU * sweep; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(ha) * r * 0.5, Math.sin(ha) * r * 0.5); c.stroke();
  c.lineWidth = r * 0.05; c.strokeStyle = '#E0474C'; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a1) * r * 0.82, Math.sin(a1) * r * 0.82); c.stroke();
  c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(0, 0, r * 0.07, 0, TAU); c.fill();
  c.restore(); K.mark(c, 'clock', x, y, r + 14); }
// the sign above her head; glow (0..1) in the twist
function sign(c, t, glow = 0) { c.save(); c.translate(SGX, SGY);
  if (glow > 0) { c.save(); c.globalAlpha = 0.45 * glow * (0.8 + 0.2 * Math.sin(t * 10)); c.fillStyle = '#FFF2A8'; rr(c, -440, -150, 880, 300, 60); c.fill(); c.restore(); }
  c.strokeStyle = '#5A4632'; c.lineWidth = 6; c.beginPath(); c.moveTo(-250, -100); c.lineTo(-200, -190); c.moveTo(250, -100); c.lineTo(200, -190); c.stroke();
  c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -380 + 10, -100 + 14, 760, 200, 20); c.fill(); c.fillStyle = '#2B2F3A'; rr(c, -380, -100, 760, 200, 20); c.fill(); c.strokeStyle = '#F2C14E'; c.lineWidth = 6; rr(c, -362, -82, 724, 164, 14); c.stroke();
  fitTxt(c, 'ORDER AT', -40, -34, 64, '#FFFDF8', 520); fitTxt(c, 'THE COUNTER', -40, 40, 64, '#F2C14E', 560);
  c.fillStyle = '#F2C14E'; c.beginPath(); c.moveTo(265, -40); c.lineTo(320, 0); c.lineTo(265, 40); c.lineTo(265, 18); c.lineTo(222, 18); c.lineTo(222, -18); c.lineTo(265, -18); c.closePath(); c.fill();   // arrow to the counter
  c.restore(); K.mark(c, 'sign', SGX, SGY, 380); }
// the kitchen door: swing (-1..1) shows the door flapping
function door(c, t, sw = 0) { const w = DX1 - DX0, cx = (DX0 + DX1) / 2;
  c.fillStyle = '#5A3A22'; c.fillRect(DX0 - 30, -DH - 30, w + 60, DH + 30);
  c.fillStyle = '#2B2F3A'; c.fillRect(DX0, -DH, w, DH);
  const k = Math.cos(sw * 1.2); c.save(); c.translate(DX0, 0); c.scale(Math.max(0.15, Math.abs(k)), 1);
  c.fillStyle = '#C9A06A'; c.fillRect(0, -DH, w, DH); c.fillStyle = '#B08A56'; c.fillRect(30, -DH + 40, w - 60, DH - 80);
  c.fillStyle = '#9FD6F0'; c.beginPath(); c.arc(w / 2, -DH + 330, 90, 0, TAU); c.fill(); c.strokeStyle = '#8A6A3A'; c.lineWidth = 14; c.stroke();
  c.fillStyle = '#C9CED6'; c.fillRect(w - 80, -760, 40, 160); c.restore();
  c.fillStyle = '#2B2F3A'; rr(c, cx - 210, -DH - 170, 420, 110, 16); c.fill(); fitTxt(c, 'KITCHEN', cx, -DH - 114, 58, '#F2C14E', 360); }
const doorSwing = (t, L) => { const ts = []; if (L === 'o1') ts.push(ev('o1', 'door')); if (L === 'o2') ts.push(ev('o2', 'pass1') - 0.1, ev('o2', 'pass2') + 1.2); if (L === 'o3') ts.push(ev('o3', 'skid') - 0.75, ev('o3', 'run') + 0.55); if (L === 'hook') ts.push(-0.6);
  let a = 0; for (const t0 of ts) { const u = t - t0; if (u > 0 && u < 1.6) a += Math.sin(u * 9) * Math.exp(-u * 2.5) * 1.1; } return a; };

// ---------------- props in hands / on the table
const trayItem = ctx => { ctx.save(); ctx.translate(0, -10); paint(ctx, q => q.e(0, 0, 170, 22), '#C9CED6', { sd: 6, hd: 3, lw: 3 });
  for (const [x, col] of [[-90, '#FFFDF8'], [0, '#F7F2E8'], [90, '#FFFDF8']]) { ctx.fillStyle = col; rr(ctx, x - 34, -90, 68, 80, 10); ctx.fill(); ctx.strokeStyle = '#9AA6B4'; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = '#7A4E2E'; ctx.fillRect(x - 28, -84, 56, 12); }
  ctx.restore(); };
const plateTower = (t, wob = 1) => ctx => { ctx.save(); ctx.translate(0, -20); for (let i = 0; i < 9; i++) { const dx = Math.sin(t * 11 + i * 0.8) * i * 5 * wob; paint(ctx, q => q.e(dx, -i * 34, 150, 20), '#FFFDF8', { sd: 3, hd: 2, lw: 3 }); ctx.strokeStyle = '#4C8FD0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(dx, -i * 34 + 6, 140, 12, 0, 0.2, Math.PI - 0.2); ctx.stroke(); } ctx.restore(); };
const padItem = ctx => { ctx.save(); ctx.rotate(-0.2); ctx.fillStyle = '#FFFDF8'; rr(ctx, -60, -150, 120, 160, 8); ctx.fill(); ctx.strokeStyle = '#9AA6B4'; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = '#E0474C'; ctx.fillRect(-60, -150, 120, 20); ctx.strokeStyle = '#9AA6B4'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-44, -105 + i * 22); ctx.lineTo(44, -105 + i * 22); ctx.stroke(); } ctx.restore(); };
const pencilItem = ctx => { ctx.save(); ctx.rotate(0.5); ctx.fillStyle = '#F2C14E'; ctx.fillRect(-9, -130, 18, 120); ctx.fillStyle = '#F6D2B6'; ctx.beginPath(); ctx.moveTo(-9, -130); ctx.lineTo(9, -130); ctx.lineTo(0, -160); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#E0474C'; ctx.fillRect(-9, -14, 18, 14); ctx.restore(); };
function cake(c, x, y, s, o = {}) { c.save(); c.translate(x, y); c.scale(s, s);
  paint(c, q => q.e(0, 0, 200, 30), '#FFFDF8', { sd: 4, hd: 2, lw: 3 });
  paint(c, q => { q.m(-150, -10); q.l(150, -10); q.l(110, -200); q.l(-110, -200); q.z(); }, '#F7E0B0', { sd: 6, hd: 3, lw: 4 });
  c.fillStyle = '#F2A0B8'; c.fillRect(-140, -80, 280, 30); c.fillRect(-122, -150, 244, 26);
  paint(c, q => { q.m(-120, -196); q.b(-120, -260, 120, -260, 120, -196); q.z(); }, '#FFFDF8', { sd: 4, hd: 2, lw: 4 });
  if (o.cherry !== false) { c.fillStyle = '#D0213A'; c.beginPath(); c.arc(0, -262, 26, 0, TAU); c.fill(); c.strokeStyle = '#3E7A4A'; c.lineWidth = 5; c.beginPath(); c.moveTo(0, -286); c.quadraticCurveTo(10, -320, 34, -330); c.stroke(); }
  if (o.bite) { c.fillStyle = '#F3E6CF'; c.beginPath(); c.arc(150, -110, 46, 0, TAU); c.fill(); }
  c.restore(); }

// ---------------- characters
const toW = (g, s, x0, wx, wy, drop, o = { planar: true }) => reach(g, s, wx - x0, wy - drop, o);
const onTableArm = (g, s) => reach(g, s, s * g.sw * 0.75, g.ySh + 335, { planar: true });
const hang = (g, s) => reach(g, s, s * g.sw * 0.8, g.ySh + 330);
const open = (g, s, k = 1.7, dy = 90) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const gest = (st, g, who, t, side, base_) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base_ + Math.cos(u) * 20, { planar: true }); } };
// where Charlie is (world x) and whether he is moving/visible
function chPath(t, L) {
  const run = (t0, t1, x0, x1) => t >= t0 && t <= t1 ? { x: lerp(x0, x1, clamp((t - t0) / (t1 - t0))), walk: true, dir: Math.sign(x1 - x0) } : null;
  if (L === 'hook') return run(-0.1, 1.4, 700, -330) || run(1.4, hev('gone') + 0.25, -330, -1500) || { x: -1e5, hide: true };
  if (L === 'o1') { const s = SC.o1.s; let r = run(s - 0.1, s + 0.55, 1150, WX); if (r) return r; r = run(ev('o1', 'walk'), ev('o1', 'door') + 0.05, WX, 1140); if (r) return { ...r, dir: 1 }; if (t > ev('o1', 'door')) return { x: 1e5, hide: true }; return { x: WX }; }
  if (L === 'o2') { const p1 = ev('o2', 'pass1'), p2 = ev('o2', 'pass2'); let r = run(p1, p1 + 1.9, 1150, -1600); if (r) return r; r = run(p2, p2 + 1.5, -1600, 1150); if (r) return r; return { x: 1e5, hide: true }; }
  if (L === 'o3') { const sk = ev('o3', 'skid'); let r = run(sk - 0.65, sk, 1150, WX); if (r) return r; if (t < sk - 0.65) return { x: 1e5, hide: true }; r = run(ev('o3', 'run'), ev('o3', 'run') + 0.6, WX, 1140); if (r) return { ...r, dir: 1 }; if (t > ev('o3', 'run') + 0.6) return { x: 1e5, hide: true }; return { x: WX }; }
  return { x: WX };
}
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { t, talk: talk('her', t), mood: 'neutral', turn: 0.3, look: 0.7, legPose: 'sit', drop: SEAT, legs: false, armL: onTableArm(g, -1), armR: onTableArm(g, 1), items: {} };
  const chin = () => { st.headFirst = false; st.armR = reach(g, 1, g.hw * 0.35, g.headY + g.hh * 1.05, { planar: true }); };   // chin on the palm (hand under the chin, never behind the head)
  if (L === 'hook') { st.mood = 'bored'; st.look = 0.9; st.lookY = 0; chin();
    if (t < hev('gone')) { st.mood = 'surprised'; st.look = 0.9; st.blink = 0; st.armR = open(g, 1, 1.4, 160); }
    if (t > hev('wide')) { st.mood = 'tired'; } }
  if (L === 'o1') { st.mood = 'angry'; st.look = 0.9;
    const mp = menuPose(t, L); if (mp.mode === 'hand') { const k = mp.up; st.armR = reach(g, 1, g.sw * (1.2 + 0.7 * k) + mp.wave * 50, lerp(g.ySh + 300, g.ySh + 30, k), { planar: true }); st.armL = open(g, -1, 1.5, 120);
      st.items = { R: ctx => { ctx.save(); ctx.rotate(mp.wave * 0.5); ctx.translate(0, -120); menuUp(ctx, 0.85); ctx.translate(0, -175); nest(ctx, 1.0, birdState(t, L)); ctx.restore(); } }; }
    if (t > SP.o1_w.t) { st.mood = 'surprised'; st.blink = 0; st.armL = onTableArm(g, -1); }
    if (t > e('walk')) { st.mood = 'shock'; st.look = 1; }
    if (t > e('drop')) { st.mood = 'tired'; st.look = 0.5; st.armR = onTableArm(g, 1); }
    if (t > e('peck')) { st.mood = 'annoyed'; } }
  if (L === 'o2') { st.mood = 'worried'; st.look = 0.8;
    if (t > SP.o2_h.t - 0.1 && t < endOf('o2_h') + 0.2) { st.mood = 'worried'; st.tilt = 0.06; st.armR = reach(g, 1, g.sw * 1.15, g.ySh + 40, { planar: true }); st.look = 0.9; }
    if (t > e('pass2') - 0.1) { st.mood = 'surprised'; st.blink = 0; st.tilt = 0; st.look = 1; }
    if (t > e('wind')) { st.mood = 'shock'; st.tilt = -0.06; st.armL = open(g, -1, 1.8, 60); st.armR = open(g, 1, 1.8, 60); }
    if (t > e('napkin') + 0.3) { st.mood = 'tired'; st.armL = onTableArm(g, -1); st.armR = onTableArm(g, 1); }
    if (t > e('pull')) { const k = eOut(clamp((t - e('pull')) / 0.4)); st.mood = 'tired'; st.blink = 1; st.armR = reach(g, 1, g.sw * (0.6 + 0.9 * k), lerp(g.headY + g.hh * 0.5, g.ySh + 120, k), { planar: true }); st.items = { R: napkinItem }; } }
  if (L === 'o3') { st.mood = 'happy'; st.look = 0.9;
    if (speaking('o3_h', t, 0.05, 0.1)) { st.mood = 'happy'; st.armR = open(g, 1, 1.5, 190); }
    if (t > SP.o3_w.t) { st.mood = 'happy'; st.armR = onTableArm(g, 1); }
    if (t > e('back')) { st.mood = 'happy'; st.blink = 1; }
    if (t > e('run')) { st.mood = 'smug'; st.blink = 0; st.look = 0.4; } }
  if (L === 'o4') { st.mood = 'happy';
    if (speaking('o4_h', t, 0.05, 0.1)) { st.mood = 'happy'; st.tilt = 0.05 * Math.sin(t * 2); gest(st, g, 'her', t, 1, 200); }
    if (t > endOf('o4_h') + 0.05) { st.mood = 'smug'; st.blink = 1; }
    if (t > e('cake')) { st.mood = 'surprised'; st.blink = 0; st.lookY = 0.3; }
    if (t > e('dive')) { st.mood = 'happy'; st.laugh = true; st.lookY = 0.2; }
    if (t > e('bite')) { st.laugh = false; st.mood = 'happy'; st.blink = 1; st.armR = reach(g, 1, g.sw * 0.4, g.headY + g.hh * 0.9, { planar: true }); st.items = { R: forkCake }; st.headFirst = false; } }
  if (L === 'end') { const e2 = k => ev('end', k); st.mood = 'happy'; st.look = 0.8;
    if (t > e2('point')) { st.mood = 'surprised'; st.look = 0.9; st.lookY = 0; }
    if (t > e2('sign')) { st.mood = 'surprised'; st.lookY = -0.9; st.look = 0.2; }
    if (t > SP.end_w.t) { st.mood = 'surprised'; st.look = 0.9; st.lookY = 0; }
    if (t > e2('shock')) { st.mood = 'shock'; st.blink = 0; st.armL = open(g, -1, 1.8, 40); st.armR = open(g, 1, 1.8, 40); }
    const mp = menuPose(t, L); if (mp.mode === 'face') { const k = mp.up; st.mood = 'worried'; st.headFirst = true; st.armL = reach(g, -1, -lerp(g.sw * 1.8, g.sw * 0.95, k), lerp(g.ySh + 40, g.headY + g.hh * 0.9, k), { planar: true }); st.armR = reach(g, 1, lerp(g.sw * 1.8, g.sw * 0.95, k), lerp(g.ySh + 40, g.headY + g.hh * 0.9, k), { planar: true }); }
    if (t > e2('moral')) { st.mood = 'happy'; st.blink = 1; } }
  return st; }
const napkinItem = ctx => { ctx.save(); ctx.rotate(0.3); paint(ctx, q => { q.m(-10, -10); q.l(110, -40); q.l(90, 80); q.l(-20, 90); q.z(); }, '#FFFFFF', { sd: 4, hd: 2, lw: 3 }); ctx.restore(); };
const forkCake = ctx => { ctx.save(); ctx.rotate(-0.4); ctx.strokeStyle = '#C9CED6'; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 20); ctx.lineTo(0, -100); ctx.stroke(); ctx.fillStyle = '#F7E0B0'; ctx.beginPath(); ctx.arc(0, -120, 22, 0, TAU); ctx.fill(); ctx.fillStyle = '#F2A0B8'; ctx.fillRect(-20, -124, 40, 8); ctx.restore(); };
function chState(t, L) { const g = G.ch, e = k => ev(L, k), pth = chPath(t, L), st = { t, talk: talk('waiter4', t), mood: 'happy', turn: -0.3, look: -0.8, armL: hang(g, -1), armR: hang(g, 1), items: {}, afterTorso: cc => apron(cc, g) };
  if (pth.walk) { st.legPose = 'walk'; st.turn = 0.5 * pth.dir; st.look = 0.9 * pth.dir; st.headY = -Math.abs(Math.sin(t * 8)) * 14; }
  const carry = (it, s = 1) => { st.armR = reach(g, s, s * g.sw * 1.05, g.ySh - 40, { planar: true }); st.items = s > 0 ? { R: it } : { L: it }; };
  if (L === 'hook') { st.mood = 'happy'; carry(trayItem, 1); st.armL = open(g, -1, 1.7, 160 + Math.sin(t * 9) * 20); }
  if (L === 'o1') { st.mood = 'neutral';
    if (t < SC.o1.s + 0.6) carry(trayItem, 1);
    if (t > SC.o1.s + 0.55) { st.mood = 'skeptical'; st.blink = 0; st.look = -0.9; st.lookY = 0.2; }
    if (speaking('o1_w', t, 0.05, 0.1)) { st.mood = 'annoyed'; st.armR = reach(g, 1, g.sw * 1.9, g.ySh + 80, { planar: true }); st.look = -0.6; }   // open palm toward the kitchen door
    if (t > e('walk')) { st.mood = 'smug'; st.blink = 1; st.armL = hang(g, -1); st.armR = hang(g, 1); } }
  if (L === 'o2') { st.mood = 'happy'; carry(plateTower(t), pth.dir > 0 ? 1 : 1); st.armL = open(g, -1, 1.2, 60); }
  if (L === 'o3') { st.mood = 'happy';
    if (pth.walk && t < ev('o3', 'skid')) carry(trayItem, 1);
    if (t > ev('o3', 'skid')) { st.mood = 'surprised'; st.blink = 0; st.legPose = 'wide'; }
    if (t > ev('o3', 'skid') + 0.35) { st.legPose = undefined; st.mood = 'happy'; }
    if (speaking('o3_w', t, 0.05, 0.1)) { st.mood = 'worried'; gest(st, g, 'waiter4', t, -1, 170); }
    if (t > e('pad')) { st.mood = 'happy'; st.armR = reach(g, 1, g.sw * 0.6, g.ySh + 230, { planar: true }); st.items = { R: padItem }; st.armL = reach(g, -1, g.sw * 0.1, g.ySh + 200, { planar: true }); st.items.L = pencilItem; st.lookY = 0.5; }
    if (t > e('tear')) { st.lookY = 0; st.mood = 'happy'; st.blink = 1; st.armL = open(g, -1, 1.8, 30); }
    if (t > e('run')) { st.armL = hang(g, -1); st.armR = reach(g, 1, g.sw * 1.0, g.ySh + 200, { planar: true }); } }
  if (L === 'o4') { st.mood = 'neutral'; st.items = { R: padItem }; st.armR = reach(g, 1, g.sw * 0.6, g.ySh + 230, { planar: true });
    if (speaking('o4_h', t, 0.05, 0.1)) { st.mood = t > ev('o4', 'snow') ? 'surprised' : 'neutral'; st.blink = 0; }
    if (t > e('blush')) { st.mood = 'worried'; st.look = -0.6; st.lookY = 0.4; st.headY = 8; }
    if (t > e('cake') - 0.3) { st.headY = 0; st.items = {}; st.armL = toWch(g, -1, MX + 220, TOP - 140); st.armR = hang(g, 1); }
    if (t > e('cake') + 0.6) { st.armL = hang(g, -1); st.mood = 'happy'; st.blink = 1; } }
  if (L === 'end') { const e2 = k => ev('end', k); st.mood = 'worried'; st.look = -0.6;
    if (t > e2('point')) { st.mood = 'worried'; st.lookY = -0.7; st.look = -0.3; st.armL = reach(g, -1, -g.sw * 1.6, g.headY - g.hh * 0.4, { planar: true }); }   // open palm up toward the sign (beside the head, not behind it)
    if (t > SP.end_w.t) { st.lookY = 0; st.look = -0.8; st.headY = 6; }
    if (t > e2('shock')) { st.armL = hang(g, -1); st.mood = 'worried'; st.blink = 1; }
    if (t > e2('moral')) { st.mood = 'happy'; st.blink = 0; } }
  return st; }
const toWch = (g, s, wx, wy) => reach(g, s, wx - WX, wy, { planar: true });

// ---------------- world + which characters each shot draws
const DRAW = { wide: ['her', 'ch'], cover: ['her', 'ch'], two: ['her', 'ch'], her: ['her', 'ch'], herb: ['her'], ch: ['ch'], nest: [], sign: ['her'], widec: ['her', 'ch'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGK, BX0, BY0, BW, BH);
  windowView(c, t, L); clock(c, t);
  if (!(tag === 'cover' || /^o[1-4]$/.test(L))) sign(c, t, L === 'end' && t > ev('end', 'sign') - 0.1 && t < ev('end', 'moral') + 1 ? clamp((t - ev('end', 'sign') + 0.1) / 0.3) : 0);
  door(c, t, doorSwing(t, L));
  // chair
  c.fillStyle = '#7A4E2E'; rr(c, HX - 170, -1050, 340, 600, 50); c.fill(); c.fillStyle = '#3E7A6A'; rr(c, HX - 140, -1020, 280, 540, 40); c.fill();
  const pth = chPath(t, L);
  if (who.includes('ch') && !pth.hide) heads.waiter4 = K.put(c, CHARLIE, chState(t, L), pth.x, 0);
  if (heads.waiter4 && L === 'o4' && t > ev('o4', 'blush')) blushOn(c, heads.waiter4, clamp((t - ev('o4', 'blush')) / 0.3));
  if (heads.waiter4 && L === 'end') blushOn(c, heads.waiter4, 0.7);
  const mp = menuPose(t, L);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), HX, 0);
  // table
  c.fillStyle = 'rgba(0,0,0,.22)'; c.fillRect(TX0 - 20, -20, TX1 - TX0 + 40, 40);
  paint(c, q => { q.m(TX0 + 30, TOP); q.l(TX1 - 30, TOP); q.l(TX1, -10); q.l(TX0, -10); q.z(); }, '#FFFDF8', { sd: 6, hd: 3, lw: 4, inner: k => { k.fillStyle = 'rgba(62,122,106,.55)'; for (let x = TX0; x < TX1; x += 100) for (let y = TOP + 20; y < -10; y += 100) if (((x - TX0) / 100 + (y - TOP - 20) / 100) % 2 < 1) k.fillRect(x, y, 100, 100); } });
  paint(c, q => { q.m(TX0 - 10, TOP - 40); q.l(TX1 + 10, TOP - 40); q.l(TX1 - 20, TOP + 12); q.l(TX0 + 20, TOP + 12); q.z(); }, '#F4EAD8', { sd: 4, hd: 2, lw: 4 });
  // water glass + salt; her napkin (unless it flew)
  c.fillStyle = 'rgba(220,235,245,.6)'; rr(c, TX0 + 110, TOP - 150, 80, 130, 10); c.fill(); c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 3; c.stroke(); c.fillStyle = 'rgba(127,200,236,.55)'; c.fillRect(TX0 + 116, TOP - 90, 68, 64);
  const napFly = L === 'o2' && t > ev('o2', 'wind');
  if (!napFly) { c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(TX0 + 230, TOP - 12); c.lineTo(TX0 + 330, TOP - 12); c.lineTo(TX0 + 310, TOP - 36); c.lineTo(TX0 + 250, TOP - 36); c.closePath(); c.fill(); }
  // the menu + nest (on the table / in her hand / in front of her face)
  if (mp.mode === 'table') menuNestTable(c, t, L);
  if (mp.mode === 'face' && heads.her) { const hx = heads.her.x, hy = heads.her.y, k = mp.up; c.save(); c.translate(hx, lerp(TOP - 200, hy + 60, k)); menuUp(c, 0.95); c.translate(0, -200); nest(c, 0.9, { t, chicks: [{ look: -0.5, open: 0 }, { look: 0, open: 0 }, { look: 0.5, open: 0 }], mum: { t } }); c.restore(); K.mark(c, 'nest', hx, hy - 200, 200); }
  // o2: the napkin flies off the table onto her face, then she pulls it off
  if (napFly && heads.her) { const w0 = ev('o2', 'wind'), nk = ev('o2', 'napkin'), pl = ev('o2', 'pull');
    if (t < nk + 0.3) { const u = eIO(clamp((t - w0) / (nk + 0.3 - w0))); c.save(); c.translate(lerp(TX0 + 280, heads.her.x - 20, u), lerp(TOP - 30, heads.her.y, u) - Math.sin(u * Math.PI) * 260); c.rotate(u * 6); napkinItem(c); c.restore(); }
    else if (t < pl) { c.save(); c.translate(heads.her.x - 60, heads.her.y - 60); c.scale(1.6, 1.6); napkinItem(c); c.restore(); } }
  // o2: wind lines behind the whizzing waiter
  if (L === 'o2' && pth.walk && heads.waiter4) { c.save(); c.strokeStyle = 'rgba(62,71,30,.35)'; c.lineWidth = 12; c.lineCap = 'round'; for (let i = 0; i < 4; i++) { const y = -1500 + i * 280, x = pth.x - pth.dir * 300; c.beginPath(); c.moveTo(x, y); c.lineTo(x - pth.dir * 360, y); c.stroke(); } c.restore(); }
  // o3: skid marks + eye contact sparkle
  if (L === 'o3') { const sk = ev('o3', 'skid'); if (t > sk - 0.05 && t < sk + 0.6) { c.save(); c.globalAlpha = 1 - clamp((t - sk) / 0.6); c.strokeStyle = 'rgba(62,71,30,.5)'; c.lineWidth = 14; c.lineCap = 'round'; for (const dy of [-30, 10]) { c.beginPath(); c.moveTo(WX + 80, dy); c.lineTo(WX + 420, dy); c.stroke(); } c.restore(); }
    if (heads.her && heads.waiter4 && t > sk - 0.3 && t < sk + 0.7) { const u = clamp((t - sk + 0.3) / 0.3); c.save(); c.globalAlpha = 1 - clamp((t - sk - 0.4) / 0.3); c.strokeStyle = C.gold; c.lineWidth = 10; c.setLineDash([30, 24]); c.beginPath(); c.moveTo(heads.her.x + 60, heads.her.y - 20); c.lineTo(lerp(heads.her.x + 60, heads.waiter4.x - 40, u), lerp(heads.her.y - 20, heads.waiter4.y - 20, u)); c.stroke(); c.setLineDash([]); c.restore(); }
    if (t > ev('o3', 'tear') && t < ev('o3', 'run') + 0.7 && heads.waiter4) { const u = t - ev('o3', 'tear'); c.save(); c.translate(heads.waiter4.x + 220, heads.waiter4.y + 420 - u * 60); c.rotate(u * 3); c.fillStyle = '#FFFDF8'; rr(c, -50, -60, 100, 120, 6); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 3; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-36, -36 + i * 24); for (let x = -36; x < 36; x += 12) c.lineTo(x + 6, -36 + i * 24 + (x % 24 ? -6 : 6)); c.stroke(); } c.restore(); } }
  // o4: the cake; the chicks dive into the cream, the mother bird steals the cherry
  if ((L === 'o4' && t > ev('o4', 'cake')) || L === 'end') { const ck = ev('o4', 'cake'), k = L === 'end' ? 1 : eOut(clamp((t - ck) / 0.3)), cx = MX + 230, cy = lerp(TOP - 500, TOP - 6, k);
    cake(c, cx, cy, 0.8, { cherry: L === 'o4' && t < ev('o4', 'cherry'), bite: (L === 'o4' && t > ev('o4', 'bite') + 0.2) || L === 'end' });
    const dive = ev('o4', 'dive');
    if (L === 'end' || t > dive) { const u = L === 'end' ? 1 : eOut(clamp((t - dive) / 0.45)); [[-60, -150], [10, -170], [70, -140]].forEach(([dx, dy], i) => { const sx = MX + (i - 1) * 54 * NS * 0.95, sy = TOP - 6 - 52 * NS - 64 * NS * 0.95;
      chick(c, lerp(sx, cx + dx * 0.8, u), lerp(sy, cy + dy * 0.8, u) - Math.sin(u * Math.PI) * 200, 0.9 * NS * 0.95, { cream: u > 0.95, open: L === 'end' ? 0 : Math.max(0, Math.sin(t * 12 + i)), blink: L === 'end' && t > ev('end', 'hide') ? 0 : (Math.sin(t * 2 + i) > 0.97 ? 1 : 0), look: L === 'end' ? -0.6 : 0 }); }); }
    if (L === 'o4' && t > ev('o4', 'cherry')) { const u = eIO(clamp((t - ev('o4', 'cherry')) / 0.6)); mumBird(c, lerp(cx + 40, cx - 340, u), lerp(cy - 330, cy - 520, u), 0.9 * NS * 0.95, { t, flap: true, cherry: true }); } }
  K.mark(c, 'clock', CLX, CLY, CLR);
  if (!heads.her) heads.her = OFFL; if (!heads.waiter4) heads.waiter4 = OFF;
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const hHY = G.her.headY + SEAT, cHY = G.ch.headY;
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(160, fy(hHY, 0.72, 1230), 0.72, 'cover'), WIDE: S(240, fy(hHY, 0.55, 1150), 0.55, 'wide'), WIDEC: S(850, fy(hHY, 0.42, 1120), 0.42, 'widec'),
  TWO: S(200, fy(hHY, 0.7, 960), 0.7, 'two'),
  HER: S(HX + 60, fy(hHY, 0.95, 900), 0.95, 'her'), HER_R: S(HX + 120, fy(hHY, 0.95, 820), 0.95, 'her'), HER_CU: S(HX + 20, fy(hHY, 1.3, 900), 1.3, 'herb'), HERB: S(-420, fy(hHY, 0.86, 860), 0.86, 'herb'),
  CH: S(WX - 40, fy(cHY, 0.92, 800), 0.92, 'ch'), CH_CU: S(WX - 20, fy(cHY, 1.25, 860), 1.25, 'ch'),
  NEST: S(MX, TOP - 170, 2.0, 'nest'), SIGN_LO: S(HX + 40, fy(hHY, 1.0, 1000), 1.0, 'sign'), SIGN: S(SGX + 20, SGY + 280, 0.95, 'sign'),
  CLOCK: U('clock', 1), PAD: U('pad', 2) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < hev('her') - 0.02) return SH.COVER; if (t < hev('clock') - 0.03) return f(SH.HER_CU); if (t < hev('nest') - 0.03) return f(SH.CLOCK); if (t < hev('wide') - 0.03) return f(SH.NEST); return f(SH.WIDE); }
  if (L === 'o1') { if (t < SP.o1_h.t - 0.1) return f(SH.WIDE); if (t < SP.o1_w.t - 0.1) return f(SH.HER); if (t < e('walk') - 0.02) return f(SH.CH); if (t < e('drop') - 0.02) return f(SH.WIDE); return f(SH.HER_R); }
  if (L === 'o2') { if (t < SP.o2_h.t - 0.1) return f(SH.WIDE); if (t < e('pass2') - 0.05) return f(SH.HER); if (t < e('wind') - 0.02) return f(SH.WIDE); return f(SH.HER_R); }
  if (L === 'o3') { if (t < SP.o3_h.t - 0.1) return f(SH.WIDE); if (t < e('skid') - 0.05) return f(SH.HER); if (t < SP.o3_w.t - 0.1) return f(SH.TWO); if (t < e('write') - 0.02) return f(SH.CH); if (t < e('back') - 0.02) return f(SH.PAD); return f(SH.TWO); }
  if (L === 'o4') { if (t < SP.o4_h.t - 0.1) return f(SH.WIDE); if (t < SP.o4_w.t - 0.1) return f(SH.HERB); if (t < e('cake') - 0.02) return f(SH.CH_CU); return f(SH.TWO); }
  if (L === 'end') { if (t < e('sign') - 0.02) return f(SH.TWO); if (t < e('sign') + 0.05) return f(SH.SIGN_LO); if (t < SP.end_w.t - 0.1) return { ...SH.SIGN, move: true }; if (t < e('shock') - 0.02) return f(SH.CH); if (t < e('wide') - 0.02) return f(SH.HER_CU); return f(SH.WIDEC); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 90, c: 19 });
const shake = E.makeShake(TL, ['impact', 'thud', 'stamp']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- inserts on a solid backdrop
function backdrop(c, t, a, b) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.08)'; for (let i = -12; i < 12; i++) c.fillRect(-1600, i * 160 + (t * 40) % 160, 3200, 60); c.restore(); }
const pop = (t, t0) => eBack(clamp((t - t0 + 0.05) / 0.3), 1.6);
// hook: the clock, the red wedge sweeps 20 minutes
function clockView(c, t) { backdrop(c, t, '#FFE0D6', '#E0705A'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'clock' });
  const t0 = hev('clock'), k = pop(t, t0), sw = eIO(clamp((t - t0 - 0.1) / 0.95)); c.save(); c.translate(540, 900); c.scale(k, k); clock(c, t, 0, 0, 380, sw); c.restore(); }
// o3: the notepad, the pencil scribbling at lightning speed
function padView(c, t) { backdrop(c, t, '#E2F4E6', '#4CAF6A'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'pad' });
  const t0 = ev('o3', 'write'), u = t - t0, k = pop(t, t0); c.save(); c.translate(540, 940); c.scale(k * 2.3, k * 2.3); c.rotate(-0.06);
  c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -170 + 8, -230 + 12, 340, 460, 14); c.fill(); c.fillStyle = '#FFFDF8'; rr(c, -170, -230, 340, 460, 14); c.fill(); c.fillStyle = '#E0474C'; rr(c, -170, -230, 340, 50, 14); c.fill();
  c.strokeStyle = '#9FC8E0'; c.lineWidth = 2; for (let i = 0; i < 9; i++) { c.beginPath(); c.moveTo(-150, -140 + i * 40); c.lineTo(150, -140 + i * 40); c.stroke(); }
  const prog = clamp(u / 1.6) * 6; let px = -140, py = -150;
  c.strokeStyle = '#2B2F3A'; c.lineWidth = 4; c.lineCap = 'round';
  for (let r = 0; r < 6; r++) { const p = clamp(prog - r); if (p <= 0) break; c.beginPath(); const y = -150 + r * 40; c.moveTo(-140, y); let x = -140; while (x < -140 + 270 * p) { x += 9; c.lineTo(x, y + Math.sin(x * 0.4 + r) * 9 - (Math.floor(x / 40) % 2 ? 8 : 0)); } c.stroke(); px = x; py = y; }
  c.save(); c.translate(px + 8, py - 6 + Math.sin(t * 60) * 4); pencilItem(c); c.restore();
  if (u > 0.1 && u < 1.8) for (let i = 0; i < 5; i++) { const v = ((u * 2 + i / 5) % 1); c.save(); c.globalAlpha = (1 - v) * 0.7; c.fillStyle = '#B8C2CC'; c.beginPath(); c.arc(px + 30 + v * 60, py - 40 - v * 90, 14 + v * 20, 0, TAU); c.fill(); c.restore(); }
  c.restore(); }

// ---------------- overlays
function title(c, t) { const a = 1 - P(t, hev('clock') - 0.22, hev('clock') - 0.03); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 300); c.rotate(-0.04); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.fillStyle = C.olive; rr(c, -440, -205, 300, 64, 32); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 5; rr(c, -440, -205, 300, 64, 32); c.stroke(); fitTxt(c, 'ПОЛЕЗНОЕ', -290, -172, 32, C.white, 250);
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -98);
  UI.textFit(c, 'Unb9', 120, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 10, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 64, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 116); c.restore();
  if (global.__QA) global.__QA.ui(c, 'card', { x: 50, y: 95, w: 980, h: 370, k: a, id: 'title' }); }
const PLATES = { o1: ['1', 'В ЛОБ', '#E0474C'], o2: ['2', 'ВЕЖЛИВО', '#F2B33D'], o3: ['3', 'КАК НОСИТЕЛЬ', '#4CAF6A'], o4: ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', '#8E5BD0'] };
function plate(c, t, sc) { const p = PLATES[sc.id]; if (!p) return; const u = t - sc.s, out = P(t, sc.e - 0.15, sc.e);
  const k = eBack(P(u, 0, 0.25), 2.2) * (1 - eIn(out)), big = 1 - eIO(P(u, 0.3, 0.5)); if (k <= 0) return;
  UI.font(c, 'Unb9', 54); const tw = c.measureText(p[1]).width, w = tw + 200, h = 100, smax = Math.min(1, 760 / w), s = k * lerp(smax, Math.min(1.4, 880 / w), big), y = 215;
  c.save(); c.translate(540, y); c.scale(s, s); c.rotate(-0.025);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -h / 2 + 9, w, h, 50); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 50); c.fill(); c.stroke();
  c.fillStyle = p[2]; c.beginPath(); c.arc(-w / 2 + 50, 0, 50, 0, TAU); c.fill(); c.stroke(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p[0], -w / 2 + 50, 4);
  c.fillStyle = C.oliveD; c.textAlign = 'left'; c.fillText(p[1], -w / 2 + 120, 4); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w / 2 * s, y: y - 50 * s, w: w * s, h: 100 * s, k, id: 'plate_' + sc.id }); }

// ---------------- end screen: question, 1 / 2 / 3 / 4, СОХРАНИ, ПОДПИСАТЬСЯ clicked by the cursor, then the comment question (ask)
const wAt = (id, w, fb) => K.wordT(id, w) ?? fb;
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, ask = SP.ask, { textFit, strokeText, font } = UI;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // heroine + Charlie (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34, 2nd character at local x 640)
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gc = G.ch;
    K.put(c, CHARLIE, { t, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, items: { R: trayItem }, afterTorso: cc => apron(cc, gc), armL: reach(gc, -1, -gc.sw * 1.7, gc.ySh + 60 + Math.sin(t * 6) * 15, { planar: true }), armR: reach(gc, 1, gc.sw * 1.05, gc.ySh - 40, { planar: true }) }, 640, 0);
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 160 + Math.sin(t * 8) * 30, { planar: true }), armR: reach(g, 1, g.sw * 1.25, g.ySh + 200, { planar: true }), items: {} }, 0, 0);
    }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const swap = eIO(P(t, ask.t - 0.15, ask.t + 0.15));
  const q = eBack(P(u, 0.2, 0.55), 2.2) * (1 - swap); if (q > 0) { c.save(); c.translate(540, 300); c.scale(q, q); font(c, 'Unb9', 64); strokeText(c, 'А ТЫ БЫ', 0, -50, C.oliveD, C.white, 14); strokeText(c, 'ОТВЕТИЛА КАК?', 0, 40, C.pink, C.white, 14); c.restore(); }
  const q2 = eBack(P(t, ask.t, ask.t + 0.3), 2.2); if (q2 > 0) { c.save(); c.translate(540, 290); c.scale(q2, q2); c.rotate(-0.02);
    c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -470 + 8, -200 + 12, 940, 400, 40); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 8; rr(c, -470, -200, 940, 400, 40); c.fill(); c.stroke();
    textFit(c, 'Unb9', 70, 'СКОЛЬКО МИНУТ', 600); c.fillStyle = C.oliveD; c.fillText('СКОЛЬКО МИНУТ', -110, -110);
    textFit(c, 'Unb9', 92, 'ТЫ ЖДЁШЬ,', 600); strokeText(c, 'ТЫ ЖДЁШЬ,', -110, -10, C.pink, C.white, 12);
    textFit(c, 'Unb9', 54, 'ПРЕЖДЕ ЧЕМ ПОЗВАТЬ?', 620); c.fillStyle = C.oliveD; c.fillText('ПРЕЖДЕ ЧЕМ ПОЗВАТЬ?', -110, 100);
    clock(c, t, 335, -10, 105, 0.5 + 0.5 * Math.sin(t * 2)); c.restore(); }
  const tw = [wAt('outro', 'один', sp.t + 1.2), wAt('outro', 'два', sp.t + 1.6), wAt('outro', 'три', sp.t + 1.9), wAt('outro', 'четыре', sp.t + 2.3)];
  const LBL = { o1: ['В ЛОБ'], o2: ['ВЕЖЛИВО'], o3: ['КАК', 'НОСИТЕЛЬ'], o4: ['КОРОЛЕВ-', 'СКИЙ'] };
  ['o1', 'o2', 'o3', 'o4'].forEach((id, i) => { const p = PLATES[id], kk = eBack(P(t, tw[i] - 0.1, tw[i] + 0.2), 2.2); if (kk <= 0) return; const x = 290 + (i % 2) * 420, y = 640 + Math.floor(i / 2) * 200, bump = 1 + 0.06 * Math.sin(clamp((t - tw[i]) / 0.4) * Math.PI);
    c.save(); c.translate(x, y); c.scale(kk * bump, kk * bump); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -195 + 8, -80 + 12, 390, 160, 36); c.fill(); c.fillStyle = p[2]; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -195, -80, 390, 160, 36); c.fill(); c.stroke();
    font(c, 'Unb9', 120); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(p[0], -125, 8);
    const ls = LBL[id]; ls.forEach((s_, j) => { textFit(c, 'Unb9', 34, s_, 230); c.fillStyle = C.white; c.textAlign = 'left'; c.fillText(s_, -60, (j - (ls.length - 1) / 2) * 42 + 4); }); c.restore(); });
  const svT = wAt('outro', 'пиши', sp.t + 3.0) - 0.1, sk = eBack(P(t, svT, svT + 0.3), 2.2), pulse = 1 + 0.05 * Math.sin(clamp((t - svT - 0.4) / 0.5) * Math.PI);
  if (sk > 0) { c.save(); c.translate(540, 1040); c.scale(sk * pulse, sk * pulse); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -260 + 6, -60 + 10, 520, 120, 60); c.fill(); c.fillStyle = C.gold; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -260, -60, 520, 120, 60); c.fill(); c.stroke();
    c.fillStyle = C.oliveD; c.beginPath(); c.moveTo(-190, -32); c.lineTo(-146, -32); c.lineTo(-146, 34); c.lineTo(-168, 16); c.lineTo(-190, 34); c.closePath(); c.fill();   // bookmark icon
    textFit(c, 'Unb9', 50, 'СОХРАНИ', 330); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.fillText('СОХРАНИ', 40, 4); c.restore(); }
  const subT = Math.min(svT + 0.7, sp.t + sp.d - 0.9), bk = eBack(P(t, subT, subT + 0.3), 2), sy = 1230;
  if (bk > 0) { const click = P(t, subT + 0.8, subT + 0.95), pressed = t > subT + 0.9; c.save(); c.translate(560, sy); const ss = bk * (1 - 0.08 * Math.sin(click * Math.PI)); c.scale(ss, ss); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -250 + 6, -58 + 10, 500, 116, 58); c.fill(); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -250, -58, 500, 116, 58); c.fill(); textFit(c, 'Unb9', 42, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 440); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4); c.restore();
    const mv = eIO(P(t, subT + 0.2, subT + 0.8)); UI.tapCursor(c, lerp(900, 620, mv), lerp(sy + 260, sy + 20, mv), 1, P(t, subT + 0.85, subT + 1.4)); }
  if (t < ask.t - 0.1) { c.save(); c.translate(0, -60); UI.captions(c, t); c.restore(); }
  Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag.startsWith('ui:')) { ({ 'ui:clock': clockView, 'ui:pad': padView })[tag](c, t); heads = { her: OFFL, waiter4: OFF }; proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.24); }
  const names = { waiter4: ['CHARLIE', '#1E1E24'] }, onScr = {}; for (const k in heads) if (Math.abs(heads[k].x) < 1e4) onScr[k] = heads[k];
  if (tag === 'cover' && onScr.waiter4) onScr.waiter4 = { ...onScr.waiter4, y: onScr.waiter4.y + onScr.waiter4.hh * 1.3 };   // cover: Charlie's bubble sits below the title card
  // a speaker who is not in the shot never gets a bubble
  if (!tag.startsWith('ui:')) K.bubbles(c, t, sc, onScr, proj, { cleanChunks: true, names, hold: { hook_w: -0.05, o1_h: -0.15, o1_w: -0.1, o2_h: -0.1, o2_w: 0.1, o3_h: -0.15, o3_w: -0.2, o4_h: -0.15, o4_w: -0.1, end_w: -0.1 } });
  if (L === 'hook') title(c, t);
  plate(c, t, sc);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('waiter', NF, renderFrame);
