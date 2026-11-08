// "Он хочет, чтобы ты готовила как мама" — rubric «Ответ на вопрос из комментариев» (live scene + 4 answers), hard_cut camera: node mumcook.js start end out.mp4 | --png=f1,f2
// Their kitchen, dinner for two: she (ponytail, apron) seated on the left, Daniel seated on the right; plates with her cutlets + mash; his phone lies between them.
// hook: he pokes her cutlet with a fork and sniffs it: "It's good… but my mum's is better." — she freezes; comment plate.
// 1 · ХОЛОДНО: "Then go to mum." -> "Great idea! She's free on Sunday." -> he already dials: phone insert CALLING MUM.
// 2 · С ЮМОРОМ: socks + "my little sunshine" -> "Yes, please!" -> he happily holds a pair of socks out across the table.
// 3 · КАК НОСИТЕЛЬ: "...I'll be the judge." (judge paddle) -> "…Toast counts as cooking, right?" (burnt smoking toast) -> paddle: 2/10 + Bella tip.
// 4 · КОРОЛЕВСКИЙ ОТВЕТ: "...and a critic." -> "…Your cutlets are lovely. Very lovely." while he shovels everything in -> spotless plate.
// Twist (music silent): his phone buzzes: MUM -> she taps speaker -> mum: "Darling, how was the cutlet? She used my recipe — I sent it this morning!"
// -> she holds up the recipe card MUM'S CUTLETS, he chokes; moral. End screen 1/2/3/4.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/mumcook/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];
// handovers: a per-line hold below 0.05 shortens the bubble itself, so it is fully gone before the cut to the next speaker
{ const _bub = UI.bubble; UI.bubble = (ctx, sp, t, an, side, name) => _bub(ctx, sp.hold < 0.05 ? { ...sp, d: sp.d + sp.hold - 0.05, hold: 0.05 } : sp, t, an, side, name); }

// ---------------- cast
const HER = { ...BASE.her_lift, hair: { style: 'bun', col: '#5A3222' }, top: { type: 'sweater', col: '#F28C6A' }, bottom: { type: 'jeans', col: '#4A5A7C' }, shoes: { col: '#F4EFE6', acc: '#C98B5A' } };
const BF = { ...BASE.tom, hair: { style: 'curly', col: '#3A2418' }, brow: '#2A1A10', top: { type: 'polo', col: '#4E8FB8' }, bottom: { type: 'jeans', col: '#3B4A6A' }, shoes: { col: '#FFFFFF', acc: '#4E8FB8' } };
const MUM = { ...BASE.linda, age: 0.7, hair: { style: 'bouffant', col: '#CFC6BC' }, glasses: { col: '#8A2A50', shape: 'cat' }, necklace: true, earrings: '#F7F2E8',
  build: { shoulder: 0.9, hip: 1.1, arm: 0.92, belly: 0.15 }, top: { type: 'cardigan', col: '#D2557F', col2: '#F7E6EC' }, bottom: { type: 'skirt', col: '#4A3A5A' }, shoes: { col: '#6A2A3A', acc: null } };
const G = { her: geom(HER), bf: geom(BF), mum: geom(MUM) };
const SEAT = 330, TOP = -500;               // seated upper body dropped by SEAT; table top at y = TOP
const HX = -330, MX = 330, PHX = 0;         // her / his seat x; his phone lies in the middle of the table
const HPX = HX + 70, MPX = MX - 70;         // her / his plate centre x
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function star(c, x, y, r, a = 1, col = '#FFF6C8') { c.save(); c.globalAlpha *= a; c.translate(x, y); c.fillStyle = col; c.beginPath(); for (let i = 0; i < 8; i++) { const rr_ = i % 2 ? r * 0.28 : r, an = i * Math.PI / 4; c.lineTo(Math.cos(an) * rr_, Math.sin(an) * rr_); } c.closePath(); c.fill(); c.restore(); }

// ---------------- props (paths only; English only on the props)
function cutlet(c, x, y, s = 1, bite = 0) { c.save(); c.translate(x, y); c.scale(s, s);
  paint(c, q => { q.m(-62, 6); q.b(-70, -30, -30, -44, 4, -42); q.b(50, -42, 72, -22, 64, 8); q.b(58, 30, -54, 32, -62, 6); q.z(); }, '#B8692E', { sd: 8, hd: 4, lw: 4, inner: k => { k.fillStyle = 'rgba(255,220,150,.35)'; for (let i = 0; i < 9; i++) { k.beginPath(); k.arc(-44 + hash(i * 5) * 90, -26 + hash(i * 9) * 40, 4 + hash(i) * 4, 0, TAU); k.fill(); } } });
  if (bite > 0) { c.fillStyle = '#FFFDF6'; c.beginPath(); c.arc(60, -16, 26 * bite, 0, TAU); c.fill(); }
  c.restore(); }
function mash(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); paint(c, q => { q.m(-58, 10); q.q(-60, -30, -24, -36); q.q(0, -56, 26, -36); q.q(62, -30, 56, 10); q.q(0, 24, -58, 10); q.z(); }, '#F6E2A8', { sd: 6, hd: 3, lw: 4 });
  c.fillStyle = '#F2C14E'; rr(c, -12, -34, 24, 14, 4); c.fill(); c.restore(); }
// a plate seen slightly from above; amt 1 = full (2 cutlets + mash + peas), 0 = spotless
function plate(c, x, amt = 1, mine = false, t = 0) { c.save(); c.translate(x, TOP - 14);
  c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(0, 10, 190, 40, 0, 0, TAU); c.fill();
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.ellipse(0, 0, 185, 38, 0, 0, TAU); c.fill(); c.strokeStyle = '#7A8496'; c.lineWidth = 4; c.stroke();
  c.strokeStyle = '#8EC9F0'; c.lineWidth = 5; c.beginPath(); c.ellipse(0, 0, 150, 28, 0, 0, TAU); c.stroke();
  if (amt > 0.66) mash(c, -70, -10, 0.9); else if (amt > 0.33) mash(c, -70, -6, 0.55);
  if (amt > 0.2) { c.fillStyle = '#6DBE6A'; for (let i = 0; i < Math.round(7 * amt); i++) { c.beginPath(); c.arc(20 + (i % 4) * 22, -2 - Math.floor(i / 4) * 16, 9, 0, TAU); c.fill(); } }
  if (mine) { cutlet(c, 40, -24, 0.95); }
  else { if (amt > 0.5) cutlet(c, 70, -36, 0.95, amt < 0.75 ? 0.8 : 0); if (amt > 0.12) cutlet(c, 10, -16, 0.95, amt < 0.3 ? 1 : 0); }
  c.restore(); }
// his phone lying flat on the table (perspective); ring = 0..1 buzzing; speaker = speaker mode on
function phoneFlat(c, t, ring = 0, speaker = false) { const j = ring > 0 ? Math.sin(t * 90) * 5 * ring : 0; c.save(); c.translate(PHX + j, TOP - 8); c.scale(1.35, 1.35);
  c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(0, 8, 120, 22, 0, 0, TAU); c.fill();
  c.fillStyle = '#2B2F3A'; c.beginPath(); c.moveTo(-100, 14); c.lineTo(100, 14); c.lineTo(80, -24); c.lineTo(-80, -24); c.closePath(); c.fill();
  const lit = ring > 0 || speaker; c.fillStyle = lit ? '#7FD0F5' : '#3A4252'; c.beginPath(); c.moveTo(-88, 8); c.lineTo(88, 8); c.lineTo(72, -19); c.lineTo(-72, -19); c.closePath(); c.fill();
  if (lit) { fitTxt(c, 'MUM', 0, -5, 22, '#1E2030', 120); }
  if (ring > 0) { c.strokeStyle = '#3E6FA8'; c.lineWidth = 7; for (const s of [-1, 1]) for (let k = 0; k < 2; k++) { const r = 40 + k * 28 + (t * 60) % 28; c.beginPath(); c.arc(s * 120, -10, r * 0.6, s > 0 ? -0.7 : Math.PI - 0.7, s > 0 ? 0.7 : Math.PI + 0.7); c.stroke(); } }
  if (speaker) { c.strokeStyle = '#3E6FA8'; c.lineWidth = 6; for (let k = 0; k < 3; k++) { const r = 30 + k * 26 + (t * 50) % 26; c.globalAlpha = 1 - k * 0.28; c.beginPath(); c.arc(0, -30, r, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); } c.globalAlpha = 1; }
  c.restore(); }
// upright phone in a hand (small, screen towards the camera); call = show MUM
function phoneHand(c, call = true) { c.save(); c.translate(0, -60); c.fillStyle = '#2B2F3A'; rr(c, -34, -64, 68, 128, 12); c.fill(); c.fillStyle = call ? '#7FD0F5' : '#3A4252'; rr(c, -28, -56, 56, 112, 8); c.fill();
  if (call) { c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(0, -22, 14, 0, TAU); c.fill(); fitTxt(c, 'MUM', 0, 8, 16, '#1E2030', 50); c.fillStyle = '#4CAF6A'; c.beginPath(); c.arc(0, 38, 9, 0, TAU); c.fill(); } c.restore(); }
const forkUp = ctx => { ctx.save(); ctx.rotate(0.25); ctx.strokeStyle = '#C9CED6'; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(0, -100); ctx.stroke(); for (const dx of [-12, 0, 12]) { ctx.beginPath(); ctx.moveTo(dx, -100); ctx.lineTo(dx, -136); ctx.stroke(); } ctx.restore(); };
const forkPiece = ctx => { forkUp(ctx); ctx.save(); ctx.rotate(0.25); cutlet(ctx, 0, -150, 0.42); ctx.restore(); };
const forkDown = ctx => { ctx.save(); ctx.rotate(Math.PI - 0.35); ctx.strokeStyle = '#C9CED6'; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(0, -100); ctx.stroke(); for (const dx of [-12, 0, 12]) { ctx.beginPath(); ctx.moveTo(dx, -100); ctx.lineTo(dx, -136); ctx.stroke(); } ctx.restore(); };
function sock(c, col, stripe) { paint(c, q => { q.m(-26, -150); q.l(26, -150); q.l(26, -10); q.q(26, 30, 70, 34); q.q(96, 40, 92, 62); q.q(86, 84, 40, 80); q.q(-30, 76, -26, 20); q.z(); }, col, { sd: 6, hd: 3, lw: 4, inner: k => { k.fillStyle = stripe; for (const y of [-120, -80]) k.fillRect(-30, y, 60, 14); k.fillRect(-30, -150, 60, 18); } }); }
const socksItem = ctx => { ctx.save(); ctx.translate(-10, 150); sock(ctx, '#F2F2F2', '#E0474C'); ctx.translate(46, 18); ctx.rotate(0.08); sock(ctx, '#F2F2F2', '#E0474C'); ctx.restore(); };
function toast(c, t, smoke = 1) { paint(c, q => { q.m(-70, 60); q.l(-70, -40); q.q(-80, -96, -30, -96); q.q(0, -120, 30, -96); q.q(80, -96, 70, -40); q.l(70, 60); q.z(); }, '#4A2A1A', { sd: 6, hd: 3, lw: 4, inner: k => { k.fillStyle = '#2A1810'; k.beginPath(); k.ellipse(0, -10, 48, 50, 0, 0, TAU); k.fill(); } });
  if (smoke > 0) { c.fillStyle = 'rgba(120,120,130,.55)'; for (let i = 0; i < 6; i++) { const u = (t * 0.9 + i / 6) % 1; c.globalAlpha = smoke * (1 - u) * 0.9; c.beginPath(); c.arc(Math.sin(u * 6 + i) * 30, -120 - u * 260, 24 + u * 40, 0, TAU); c.fill(); } c.globalAlpha = 1; } }
const toastItem = t => ctx => { ctx.save(); ctx.translate(10, -90); toast(ctx, t); ctx.restore(); };
// judge paddle: label JUDGE, then the score "2/10"
function paddle(c, score) { c.fillStyle = '#8A5A3A'; rr(c, -12, -10, 24, 150, 8); c.fill(); paint(c, q => q.a(0, -110, 110), '#FFFDF6', { sd: 8, hd: 4, lw: 6 });
  if (score) { fitTxt(c, '2', -28, -112, 120, '#E0474C', 90); fitTxt(c, '/10', 44, -84, 38, '#2B2F3A', 66); } else fitTxt(c, 'JUDGE', 0, -110, 50, '#2B2F3A', 180); }
const paddleItem = score => ctx => { ctx.save(); ctx.translate(0, -40); paddle(ctx, score); ctx.restore(); };
function recipeCard(c) { c.save(); c.rotate(-0.06); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -150 + 8, -110 + 10, 300, 220, 14); c.fill(); c.fillStyle = '#FFF6D8'; rr(c, -150, -110, 300, 220, 14); c.fill(); c.strokeStyle = '#C98B5A'; c.lineWidth = 4; c.stroke();
  c.fillStyle = '#E0474C'; c.fillRect(-150, -110, 300, 18); fitTxt(c, "MUM'S", 0, -62, 40, '#7A2430', 260, 'Unb9'); fitTxt(c, 'CUTLETS', 0, -18, 44, '#7A2430', 260, 'Unb9');
  c.fillStyle = 'rgba(60,60,80,.45)'; for (let k = 0; k < 3; k++) rr(c, -110, 22 + k * 26, 220 - k * 40, 8, 4), c.fill(); c.restore(); }
const recipeItem = ctx => { ctx.save(); ctx.translate(0, -120); recipeCard(ctx); ctx.restore(); };
// apron over her sweater (drawn after the torso)
function apron(c, g) { const sw = g.sw, y0 = g.ySh; paint(c, q => { q.m(-sw * 0.55, y0 + 60); q.l(sw * 0.55, y0 + 60); q.l(sw * 0.7, y0 + 620); q.l(-sw * 0.7, y0 + 620); q.z(); }, '#FFFDF6', { sd: 8, hd: 4, lw: 4, inner: k => { k.fillStyle = '#EE5E9A'; for (let i = 0; i < 12; i++) { k.beginPath(); k.arc(-sw * 0.5 + (i % 4) * sw * 0.34, y0 + 140 + Math.floor(i / 4) * 150, 10, 0, TAU); k.fill(); } } });
  c.strokeStyle = '#FFFDF6'; c.lineWidth = 10; c.beginPath(); c.moveTo(-sw * 0.5, y0 + 64); c.lineTo(-sw * 0.25, y0 - 30); c.moveTo(sw * 0.5, y0 + 64); c.lineTo(sw * 0.25, y0 - 30); c.stroke(); }

// ---------------- their kitchen (prerendered, softly blurred): window + curtains centre, cabinets, stove with a pot on the left, fridge on the right
const BX0 = -2600, BY0 = -3400, BW = 5200, BH = 5000, BS = 0.5;
function drawKitchen(c) {
  c.fillStyle = '#F6E7C8'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = 'rgba(210,160,90,.10)'; for (let x = BX0; x < BX0 + BW; x += 150) c.fillRect(x, BY0, 50, 3400);
  // tiled backsplash band
  c.fillStyle = '#DDEFE8'; c.fillRect(BX0, -1700, BW, 700); c.strokeStyle = 'rgba(90,140,130,.25)'; c.lineWidth = 4; for (let x = BX0; x < BX0 + BW; x += 100) { c.beginPath(); c.moveTo(x, -1700); c.lineTo(x, -1000); c.stroke(); } for (let y = -1700; y <= -1000; y += 100) { c.beginPath(); c.moveTo(BX0, y); c.lineTo(BX0 + BW, y); c.stroke(); }
  // window with curtains (centre, behind the table)
  const g = c.createLinearGradient(0, -2700, 0, -1750); g.addColorStop(0, '#8EC9F0'); g.addColorStop(1, '#E2F2FA');
  c.fillStyle = '#FFFDF6'; rr(c, -560, -2760, 1120, 1060, 18); c.fill(); c.fillStyle = g; rr(c, -530, -2730, 1060, 1000, 10); c.fill(); c.fillStyle = '#FFFDF6'; c.fillRect(-9, -2730, 18, 1000); c.fillRect(-530, -2250, 1060, 18);
  c.fillStyle = '#9CCB7A'; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(-420 + i * 210, -1800, 120, Math.PI, 0); c.fill(); }
  c.fillStyle = '#E8889E'; rr(c, -720, -2860, 200, 1240, 30); c.fill(); rr(c, 520, -2860, 200, 1240, 30); c.fill(); c.fillStyle = '#8A6A4A'; c.fillRect(-800, -2890, 1600, 26);
  // upper cabinets left/right
  for (const [x0, x1] of [[-2500, -900], [900, 2500]]) { c.fillStyle = '#7FB5A8'; c.fillRect(x0, -3000, x1 - x0, 900); c.strokeStyle = '#5E9488'; c.lineWidth = 10; for (let x = x0; x < x1; x += 400) { c.strokeRect(x + 20, -2980, 360, 860); c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(x + 200, -2160, 14, 0, TAU); c.fill(); } }
  // counter + lower cabinets
  c.fillStyle = '#7FB5A8'; c.fillRect(BX0, -1000, BW, 1000); c.fillStyle = '#E8D9C0'; c.fillRect(BX0, -1040, BW, 60);
  c.strokeStyle = '#5E9488'; c.lineWidth = 10; for (let x = BX0; x < BX0 + BW; x += 400) c.strokeRect(x + 20, -950, 360, 880);
  // stove + pot (left), steam
  c.fillStyle = '#3A3F4A'; c.fillRect(-1900, -1050, 700, 30); c.fillStyle = '#C9CED6'; rr(c, -1800, -1260, 500, 220, 30); c.fill(); c.fillStyle = '#9AA2AE'; c.fillRect(-1830, -1270, 560, 30);
  c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 16; c.lineCap = 'round'; for (const x of [-1660, -1550, -1440]) { c.beginPath(); c.moveTo(x, -1320); c.bezierCurveTo(x - 50, -1420, x + 50, -1480, x, -1580); c.stroke(); }
  // fridge (right) with a drawing + magnets
  c.fillStyle = '#EEF4F8'; rr(c, 1500, -2300, 620, 2300, 40); c.fill(); c.strokeStyle = '#B8C4D0'; c.lineWidth = 8; c.beginPath(); c.moveTo(1500, -1500); c.lineTo(2120, -1500); c.stroke(); c.fillStyle = '#B8C4D0'; c.fillRect(1560, -1800, 24, 220); c.fillRect(1560, -1300, 24, 260);
  c.fillStyle = '#FFFFFF'; c.save(); c.translate(1830, -1950); c.rotate(0.05); c.fillRect(-120, -150, 240, 300); c.restore(); c.fillStyle = '#EE5E9A'; c.beginPath(); c.arc(1830, -2090, 16, 0, TAU); c.fill();
  // wall clock (left of the window)
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(-1200, -2500, 150, 0, TAU); c.fill(); c.strokeStyle = '#8A6A4A'; c.lineWidth = 14; c.stroke(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 10; c.beginPath(); c.moveTo(-1200, -2500); c.lineTo(-1200, -2600); c.moveTo(-1200, -2500); c.lineTo(-1130, -2470); c.stroke();
  // floor
  c.fillStyle = '#C99A6A'; c.fillRect(BX0, 0, BW, 1600); c.fillStyle = 'rgba(0,0,0,.06)'; for (let x = BX0; x < BX0 + BW; x += 200) c.fillRect(x, 0, 8, 1600);
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawKitchen);
function chair(c, x) { c.fillStyle = '#6A4A34'; rr(c, x - 170, -1100, 340, 620, 40); c.fill(); c.fillStyle = '#E8B86A'; rr(c, x - 140, -1070, 280, 560, 34); c.fill(); c.fillStyle = 'rgba(255,255,255,.12)'; rr(c, x - 120, -1050, 90, 520, 30); c.fill(); }
function tableFront(c, t, L) {
  c.fillStyle = 'rgba(0,0,0,.22)'; c.fillRect(-800, -20, 1600, 40);
  // checked table cloth
  paint(c, q => { q.m(-760, TOP); q.l(760, TOP); q.l(800, -40); q.l(-800, -40); q.z(); }, '#FFFFFF', { sd: 6, hd: 3, lw: 4, inner: k => { k.fillStyle = 'rgba(224,71,76,.55)'; for (let x = -800; x < 800; x += 120) k.fillRect(x, TOP, 60, 500); for (let y = TOP + 30; y < -40; y += 120) k.fillRect(-800, y, 1600, 60); } });
  paint(c, q => { q.m(-790, TOP - 40); q.l(790, TOP - 40); q.l(760, TOP + 12); q.l(-760, TOP + 12); q.z(); }, '#FFF4EC', { sd: 4, hd: 2, lw: 4 });
  // salt + pepper, bread basket
  c.fillStyle = '#FFFFFF'; rr(c, 150, TOP - 110, 44, 80, 12); c.fill(); c.fillStyle = '#5A6070'; rr(c, 205, TOP - 104, 40, 74, 12); c.fill();
  plate(c, HPX, 1, true, t); plate(c, MPX, plateAmt(t, L), false, t);
  // her fork + knife resting by her plate
  c.strokeStyle = '#C9CED6'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(HPX - 230, TOP - 10); c.lineTo(HPX - 210, TOP - 70); c.stroke();
  const ring = L === 'end' && t > ev('end', 'buzz') && t < ev('end', 'tap') ? 1 : 0, spk = L === 'end' && t >= ev('end', 'tap');
  if (!(L === 'o1' && t > ev('o1', 'grab'))) phoneFlat(c, t, ring, spk);
  K.mark(c, 'plates', 0, TOP - 60, 460); }
function plateAmt(t, L) { if (L === 'o4') { const a = ev('o4', 'eat'), b = SP.o4_b.t + SP.o4_b.d - 0.1; return 1 - clamp((t - a) / (b - a)); } if (L === 'end') return 0; return 1; }

// ---------------- characters (seated)
const onTable = (g, s) => reach(g, s, s * g.sw * 0.7, g.ySh + 335, { planar: true });
const toW = (g, s, x0, wx, wy, o = {}) => reach(g, s, wx - x0, wy - SEAT, { planar: true, ...o });   // seated: world target -> body-local target
const seated = (g, t, who) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, legPose: 'sit', drop: SEAT, legs: false, armL: onTable(g, -1), armR: onTable(g, 1), items: {} });
const gest = (st, g, who, t, side, b) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.45 + Math.sin(u) * 20), g.ySh + b + Math.cos(u) * 20, { planar: true }); } };
const crossArms = (g, st) => { st.armL = reach(g, -1, g.sw * 0.55, g.ySh + 250, { planar: true }); st.armR = reach(g, 1, -g.sw * 0.55, g.ySh + 230, { planar: true }); };
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { ...seated(g, t, 'her'), mood: 'happy', turn: 0.3, look: 0.7, afterTorso: (cc, gg) => apron(cc, gg) };
  if (L === 'hook') { st.mood = 'happy'; st.armL = toW(g, -1, HX, HX - 40, TOP - 60); st.armR = toW(g, 1, HX, HX + 120, TOP - 60);
    if (t > hev('freeze') - 0.05) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; }
    if (t > hev('how')) { st.mood = 'annoyed'; st.blink = 0; crossArms(g, st); st.look = 0.9; } }
  if (L === 'o1') { st.mood = 'annoyed'; crossArms(g, st); st.look = 0.8; if (speaking('o1_h', t, 0.1, 0.1)) { st.mood = 'annoyed'; st.turn = 0.35; }
    if (t > e('idea')) { st.mood = 'surprised'; st.blink = 0; } if (t > e('back')) { st.mood = 'tired'; st.blink = 1; st.look = 0.9; } }
  if (L === 'o2') { st.mood = 'smug'; if (speaking('o2_h', t, 0.1, 0.1)) { st.mood = 'smug'; gest(st, g, 'her', t, -1, 120); }
    if (t > SP.o2_b.t) { st.mood = 'surprised'; st.blink = 0; } if (t > e('offer')) { st.mood = 'bored'; st.blink = 0; st.lean = -0.08; st.look = 0.9; crossArms(g, st); } }
  if (L === 'o3') { st.mood = 'happy'; st.tilt = 0.04;
    if (speaking('o3_h', t, 0.1, 0.1)) { gest(st, g, 'her', t, -1, 140); }
    const pk = eBack(clamp((t - e('paddle')) / 0.3), 1.6); if (t > e('paddle')) { st.mood = 'smug'; st.armR = reach(g, 1, g.sw * 1.35, g.ySh + lerp(300, -60, pk), { planar: true }); st.items = { R: paddleItem(t > e('score')) }; }
    if (t > SP.o3_b.t) { st.mood = 'skeptical'; st.tilt = 0; st.look = 0.9; } if (t > e('score')) { st.mood = 'smug'; st.blink = 1; st.look = 0.4; } }
  if (L === 'o4') { st.mood = 'happy'; st.look = 0.6;
    if (speaking('o4_h', t, 0.1, 0.1)) { const u = t - SP.o4_h.t; st.mood = u > 4.4 ? 'smug' : 'happy'; gest(st, g, 'her', t, -1, 130); if (u > 5.9) { st.mood = 'smug'; st.blink = 1; } }
    if (t > endOf('o4_h') + 0.05) { st.mood = 'smug'; st.blink = 0; st.look = 0.9; crossArms(g, st); } }
  if (L === 'end') { st.mood = 'neutral'; st.look = 0.6; st.lookY = 0.3;
    if (t > ev('end', 'buzz') + 0.3) { st.mood = 'surprised'; st.look = 0.3; st.lookY = 0.6; }
    if (t > ev('end', 'tap') - 0.45 && t < ev('end', 'tap') + 0.3) { const k = eIO(clamp((t - (ev('end', 'tap') - 0.45)) / 0.4)); st.armR = toW(g, 1, HX, lerp(HX + 140, PHX - 40, k), lerp(TOP - 60, TOP - 40, k)); st.lean = 0.12 * k; st.mood = 'smug'; }
    if (t > ev('end', 'recipe') - 0.1) { st.mood = 'smug'; st.lean = 0; st.look = 0.4; st.lookY = 0; st.armR = reach(g, 1, g.sw * 1.3, g.ySh + 40, { planar: true }); st.items = { R: recipeItem }; }
    if (t > ev('end', 'wink')) { st.mood = 'happy'; st.blink = 1; st.laugh = true; st.look = 0.1; } }
  return st; }
function bfState(t, L) { const g = G.bf, e = k => ev(L, k), st = { ...seated(g, t, 'bf10'), mood: 'happy', turn: -0.3, look: -0.7 };
  st.armR = toW(g, 1, MX, MPX + 60, TOP - 50); st.items = { R: forkDown };
  if (L === 'hook') { st.mood = 'skeptical'; st.lookY = 0.5; st.look = -0.2; const poke = Math.abs(Math.sin(t * 7)) * 50;
    st.armR = toW(g, 1, MX, MPX + 40, TOP - 60 - poke);
    if (speaking('hook_b', t, 0, 0)) { const u = t - SP.hook_b.t; st.mood = u < 0.7 ? 'neutral' : 'smug'; if (u > 0.5) { st.armR = toW(g, 1, MX, MX + g.hw * 1.0, G.bf.headY + SEAT + g.hh * 1.25); st.items = { R: forkPiece }; st.headFirst = true; st.lookY = 0.3; st.blink = u < 1.2 ? 1 : 0; } }
    if (t > hev('freeze')) { st.mood = 'smug'; st.blink = 0; st.lookY = 0; st.look = -0.4; st.armR = toW(g, 1, MX, MX + 150, TOP - 250); st.items = { R: forkPiece }; st.headFirst = false; }
    if (t > hev('says')) { const u = t - hev('says'); st.mood = 'smug'; st.blink = 1; st.headY = Math.sin(u * 5) * 6; st.armR = reach(g, 1, g.sw * 1.4 + Math.sin(u * 4) * 30, g.ySh + 60, { planar: true }); st.items = { R: forkPiece }; st.talk = 0.15 + 0.15 * Math.abs(Math.sin(u * 9)); } }
  if (L === 'o1') { st.mood = 'neutral'; st.look = -0.7;
    if (t > e('idea')) { st.mood = 'happy'; st.blink = 0; st.headY = -6; }
    if (t > e('grab')) { const k = eIO(clamp((t - e('grab')) / 0.4)); st.armL = toW(g, -1, MX, lerp(PHX + 40, MX - 140, k), lerp(TOP - 30, TOP - 380, k)); st.items = { R: forkDown, L: ctx => phoneHand(ctx, t > e('dial')) }; }
    if (t > e('dial')) { const u = t - e('dial'); st.armR = toW(g, 1, MX, MX - 90 + Math.sin(u * 22) * 10, TOP - 420); st.items = { L: ctx => phoneHand(ctx, true) }; }
    if (t > e('back')) { st.mood = 'happy'; st.laugh = true; st.blink = 1; st.headFirst = true; st.armL = reach(g, -1, -g.hw * 0.95, g.headY + g.hh * 0.25, { planar: true }); st.items = { L: ctx => { ctx.save(); ctx.translate(0, 10); phoneHand(ctx, true); ctx.restore(); } }; st.armR = onTable(g, 1); } }
  if (L === 'o2') { st.mood = 'happy'; st.look = -0.7;
    if (speaking('o2_h', t, 0, 0.1)) { const u = t - SP.o2_h.t; st.mood = u > 2.8 ? 'surprised' : 'neutral'; }
    if (speaking('o2_b', t, 0.05, 0.05)) { st.mood = 'happy'; st.laugh = false; }
    if (t > e('socks')) { const k = eBack(clamp((t - e('socks')) / 0.35), 1.4); st.armL = toW(g, -1, MX, lerp(MX - 120, MX - 230, k), lerp(TOP - 200, TOP - 520, k)); st.items = { L: socksItem, R: forkDown }; }
    if (t > e('offer')) { const k = eIO(clamp((t - e('offer')) / 0.4)); st.lean = -0.18 * k; st.armL = toW(g, -1, MX, lerp(MX - 230, MX - 420, k), TOP - 520 + Math.sin(t * 6) * 10); st.laugh = true; st.blink = 1; } }
  if (L === 'o3') { st.mood = 'happy'; st.look = -0.7;
    if (speaking('o3_h', t, 0, 0.1)) { st.mood = t > e('paddle') ? 'worried' : 'surprised'; }
    if (t > SP.o3_b.t - 0.15) { st.mood = 'worried'; const k = eBack(clamp((t - e('toast')) / 0.3), 1.5); st.armL = toW(g, -1, MX, MX - 300, lerp(TOP - 150, TOP - 400, k)); st.items = { L: toastItem(t), R: forkDown }; st.headY = speaking('o3_b', t) ? Math.abs(Math.sin((t - SP.o3_b.t) * 6)) * 8 : 0; }
    if (t > endOf('o3_b') + 0.1) { st.mood = 'sad'; st.blink = 0; }
    if (t > e('score')) { st.mood = 'sad'; st.headY = 10; } }
  if (L === 'o4') { st.mood = 'happy'; st.look = -0.7;
    if (speaking('o4_h', t, 0, 0)) { const u = t - SP.o4_h.t; st.mood = u > 2.4 ? 'worried' : 'happy'; if (u > 6.0) { st.mood = 'shock'; st.blink = 0; } }
    if (t > e('gulp')) { st.mood = 'worried'; st.blink = 0; }
    if (t > e('eat')) { const u = t - e('eat'), ph = (u / 0.24) % 1, up = Math.sin(ph * Math.PI); st.mood = 'worried'; st.lookY = 0.35; st.look = -0.3;
      if (t < SP.o4_b.t + SP.o4_b.d) { st.armR = toW(g, 1, MX, lerp(MPX + 40, MX + 20, up), lerp(TOP - 50, G.bf.headY + SEAT + g.hh * 0.7, up)); st.items = { R: up > 0.5 ? forkPiece : forkUp }; st.headFirst = up > 0.3; }
      else { st.armR = onTable(g, 1); st.items = { R: forkUp }; st.mood = 'happy'; st.lookY = 0; st.look = -0.6; st.blink = 1; st.headFirst = false; } } }
  if (L === 'end') { st.mood = 'happy'; st.look = -0.4; st.armR = onTable(g, 1); st.items = { R: forkUp };
    if (t > ev('end', 'buzz')) { st.mood = 'surprised'; st.lookY = 0.6; st.look = -0.2; }
    if (t > ev('end', 'tap')) { st.mood = 'worried'; st.lookY = 0.5; }
    if (t > ev('end', 'recipe') + 0.25) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; st.lookY = 0; st.look = -0.7; st.headFirst = true; st.armL = reach(g, -1, -g.sw * 0.2, g.ySh + 90, { planar: true }); st.headY = Math.sin(t * 30) * 3 * (t < ev('end', 'recipe') + 1.3 ? 1 : 0); }
    if (t > ev('end', 'face')) { st.mood = 'sad'; st.headFirst = false; st.armL = onTable(g, -1); st.headY = 10; st.lookY = 0.3; }
    if (t > ev('end', 'wink')) { st.mood = 'worried'; st.headY = 6; } }
  return st; }

// ---------------- world + which characters each shot draws (clean singles: only the tagged character)
const DRAW = { wide: ['her', 'bf'], cover: ['her', 'bf'], two: ['her', 'bf'], twolo: ['her', 'bf'], her: ['her'], bf: ['bf'], plate: ['bf'], endw: ['her', 'bf'] };
const OFF = { x: 1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGR, BX0, BY0, BW, BH);
  chair(c, HX); chair(c, MX);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), HX, 0);
  if (who.includes('bf')) heads.bf10 = K.put(c, BF, bfState(t, L), MX, 0);
  tableFront(c, t, L);
  // the phone on the table is mum's "head" on the speakerphone (bubble anchor) in the twist
  if (L === 'end' && t > ev('end', 'tap')) heads.hismum2 = { x: PHX, y: TOP - 60, hh: 40 };
  // o4: spotless plate sparkles; crumbs fly while he shovels
  if (L === 'o4' && t > ev('o4', 'eat') && t < ev('o4', 'clean')) { for (let i = 0; i < 6; i++) { const u = ((t - ev('o4', 'eat')) * 2.2 + i / 6) % 1; c.fillStyle = '#C9813E'; c.beginPath(); c.arc(MPX + 40 + (hash(i) - 0.5) * 200 * u, TOP - 80 - Math.sin(u * Math.PI) * 220, 9, 0, TAU); c.fill(); } }
  if ((L === 'o4' && t > ev('o4', 'clean')) || L === 'end') { const u = L === 'o4' ? t - ev('o4', 'clean') : 2, k = eBack(clamp(u / 0.3), 2) * (0.8 + 0.2 * Math.sin(t * 7)); star(c, MPX - 90, TOP - 40, 60 * k); star(c, MPX + 100, TOP - 30, 36 * k, 0.9); star(c, MPX + 10, TOP - 60, 26 * k, 0.8); }
  // o2: sparkle on the socks
  if (L === 'o2' && heads.bf10 && t > ev('o2', 'socks') && t < ev('o2', 'socks') + 1.2) { const k = eBack(clamp((t - ev('o2', 'socks')) / 0.3), 2) * (1 - clamp((t - ev('o2', 'socks') - 0.9) / 0.3)); star(c, MX - 300, TOP - 640, 50 * k); }
  if (!heads.bf10) heads.bf10 = OFF; if (!heads.her) heads.her = { x: -1e5, y: -3000, hh: 100 };
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const hHY = G.her.headY + SEAT, mHY = G.bf.headY + SEAT;
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(0, fy(mHY, 0.72, 990), 0.72, 'cover'), WIDE: S(0, fy(mHY, 0.62, 800), 0.62, 'wide'), TWO: S(0, fy(mHY, 0.74, 800), 0.74, 'two'), TWO_LO: S(0, fy(mHY, 0.72, 1000), 0.72, 'twolo'),
  HER: S(HX + 30, fy(hHY, 1.0, 860), 1.0, 'her'), HER_CU: S(HX + 20, fy(hHY, 1.3, 860), 1.3, 'her'), HER_CN: S(HX + 30, fy(hHY, 1.15, 740), 1.15, 'her'), HER_R: S(HX + 40, fy(hHY, 1.0, 780), 1.0, 'her'), HER_W: S(HX + 120, fy(hHY, 0.85, 760), 0.85, 'her'),
  BF: S(MX - 30, fy(mHY, 0.95, 820), 0.95, 'bf'), BF_CU: S(MX - 20, fy(mHY, 1.25, 860), 1.25, 'bf'), BF_LOW: S(MX - 30, fy(mHY, 1.15, 1120), 1.15, 'bf'), BF_N: S(MX - 30, fy(mHY, 0.9, 760), 0.9, 'bf'), BF_W: S(MX - 120, fy(mHY, 0.82, 700), 0.82, 'bf'),
  PLATE: S(MPX, TOP - 120, 1.5, 'plate'), ENDW: S(0, fy(mHY, 0.66, 700), 0.66, 'endw'), PHONE: U('phone', 1), TABLE: S(PHX, TOP - 330, 1.05, 'two') };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < SP.hook_b.t + 0.85) return SH.COVER; if (t < hev('freeze') - 0.02) return f(SH.BF_LOW); if (t < hev('says') - 0.02) return f(SH.HER_CN); if (t < hev('how') - 0.02) return f(SH.BF_N); if (t < hev('wide') - 0.02) return f(SH.HER_R); return f(SH.WIDE); }
  if (L === 'o1') { if (t < SP.o1_h.t - 0.12) return f(SH.WIDE); if (t < SP.o1_b.t - 0.12) return f(SH.HER); if (t < e('insert') - 0.02) return f(SH.BF_W); if (t < e('back') - 0.02) return f(SH.PHONE); return f(SH.TWO); }
  if (L === 'o2') { if (t < SP.o2_h.t - 0.12) return f(SH.WIDE); if (t < SP.o2_b.t - 0.12) return f(SH.HER); if (t < e('offer') + 0.5) return f(SH.BF_W); return f(SH.TWO); }
  if (L === 'o3') { if (t < SP.o3_h.t - 0.12) return f(SH.WIDE); if (t < SP.o3_b.t - 0.12) return f(SH.HER_W); if (t < e('score') - 0.02) return f(SH.BF_W); if (t < SP.o3_nar.t + 1.2) return f(SH.HER_R); return f(SH.TWO); }
  if (L === 'o4') { if (t < SP.o4_h.t - 0.12) return f(SH.WIDE); if (t < SP.o4_b.t - 0.12) return f(SH.HER); if (t < e('clean') - 0.02) return f(SH.BF); return f(SH.PLATE); }
  if (L === 'end') { if (t < e('tap') - 0.5) return f(SH.TABLE); if (t < e('insert') - 0.02) return f(SH.TWO); if (t < e('recipe') - 0.02) return f(SH.PHONE); if (t < e('face') - 0.02) return f(SH.TWO_LO); if (t < e('wink') - 0.02) return f(SH.BF_CU); if (t < SP.moral.t - 0.02) return f(SH.HER_CU); return f(SH.ENDW); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'thud', 'stamp']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- insert: his phone on a solid backdrop (o1: CALLING MUM; twist: MUM on the speaker)
function mumAvatar(c, t, x, y, r) { c.save(); c.beginPath(); c.arc(x, y, r, 0, TAU); c.clip(); c.fillStyle = '#F7D9E4'; c.fillRect(x - r, y - r, 2 * r, 2 * r);
  const s = r / (G.mum.hh * 1.6), tk = talk('hismum2', t); K.put(c, MUM, { t, talk: tk, mood: 'happy', turn: 0, look: 0, armL: reach(G.mum, -1, -G.mum.sw * 1.0, G.mum.ySh + 400), armR: reach(G.mum, 1, G.mum.sw * 1.0, G.mum.ySh + 400), items: {} }, x, y - G.mum.headY * s + r * 0.15, s);
  c.restore(); c.strokeStyle = '#FFFFFF'; c.lineWidth = 8; c.beginPath(); c.arc(x, y, r, 0, TAU); c.stroke(); }
function speakerIcon(c, x, y, on) { c.save(); c.translate(x, y); c.fillStyle = on ? '#FFFFFF' : 'rgba(255,255,255,.25)'; c.beginPath(); c.arc(0, 0, 46, 0, TAU); c.fill();
  c.fillStyle = on ? '#3E6FA8' : '#FFFFFF'; c.beginPath(); c.moveTo(-22, -10); c.lineTo(-8, -10); c.lineTo(8, -24); c.lineTo(8, 24); c.lineTo(-8, 10); c.lineTo(-22, 10); c.closePath(); c.fill();
  c.strokeStyle = on ? '#3E6FA8' : '#FFFFFF'; c.lineWidth = 4; c.beginPath(); c.arc(10, 0, 14, -0.9, 0.9); c.stroke(); c.beginPath(); c.arc(10, 0, 24, -0.9, 0.9); c.stroke(); c.restore(); }
function phoneView(c, t, L) { const twist = L === 'end', a = twist ? ev('end', 'insert') : ev('o1', 'insert'), u = t - a, spk = twist && t > ev('end', 'tap');
  const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, '#3E6FA8'); g.addColorStop(1, '#25466E'); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  c.fillStyle = 'rgba(255,255,255,.05)'; for (let k = 0; k < 12; k++) c.fillRect(0, k * 180, W, 70);
  const k = eBack(clamp(u / 0.3), 1.6), jig = !twist ? 0 : 0;
  const px = 540 + jig, py = 1000;
  K.phone(c, px, py, 1.0 * (0.9 + 0.1 * k), (q, w, h) => {
    q.fillStyle = '#1E2A3C'; q.fillRect(0, 0, w, h);
    fitTxt(q, twist ? (spk ? 'SPEAKER' : 'INCOMING CALL') : 'CALLING...', w / 2, 80, 34, 'rgba(255,255,255,.75)', w - 60, 'Nun9');
    const pulse = 1 + 0.05 * Math.sin(t * 8); q.save(); q.translate(w / 2, 250); q.scale(pulse, pulse); mumAvatar(q, t, 0, 0, 120); q.restore();
    if (spk || !twist) { q.strokeStyle = 'rgba(255,255,255,.35)'; q.lineWidth = 5; for (let i = 0; i < 2; i++) { const rr_ = 140 + ((t * 70 + i * 40) % 80); q.globalAlpha = 1 - ((t * 70 + i * 40) % 80) / 80; q.beginPath(); q.arc(w / 2, 250, rr_, 0, TAU); q.stroke(); } q.globalAlpha = 1; }
    fitTxt(q, 'MUM', w / 2, 440, 64, '#FFFFFF', w - 60, 'Unb9');
    fitTxt(q, twist ? (spk ? '00:0' + Math.min(9, Math.floor(t - ev('end', 'tap'))) : 'mobile') : 'ringing...', w / 2, 500, 32, 'rgba(255,255,255,.7)', w - 60, 'Nun9');
    speakerIcon(q, w / 2 - 110, 620, spk); q.fillStyle = '#E0474C'; q.beginPath(); q.arc(w / 2 + 110, 620, 46, 0, TAU); q.fill();
    q.save(); q.translate(w / 2 + 110, 620); q.rotate(2.35); q.fillStyle = '#FFFFFF'; rr(q, -26, -9, 52, 18, 9); q.fill(); q.restore(); });
  return { x: px, y: py - 300 }; }

// ---------------- overlays: title, comment plate, option plates
function title(c, t) { const a = 1 - P(t, hev('title_out') - 0.25, hev('title_out')); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 300); c.rotate(-0.04); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -102);
  UI.textFit(c, 'Unb9', 120, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 6, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 64, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 112); c.restore();
  if (global.__QA) global.__QA.ui(c, 'card', { x: 50, y: 135, w: 980, h: 330, k: a, id: 'title' }); }
function commentPlate(c, t) { const a = hev('plate'), k = eBack(P(t, a, a + 0.3), 1.8) * (1 - P(t, SC.hook.e - 0.25, SC.hook.e - 0.05)); if (k <= 0) return;
  c.save(); c.translate(540, 360); c.rotate(-0.025); c.scale(k, k);
  c.fillStyle = 'rgba(0,0,0,.28)'; rr(c, -440 + 8, -130 + 12, 880, 260, 34); c.fill(); c.fillStyle = '#FFFFFF'; rr(c, -440, -130, 880, 260, 34); c.fill();
  c.fillStyle = '#EE5E9A'; c.beginPath(); c.moveTo(-330, 125); c.lineTo(-290, 173); c.lineTo(-270, 125); c.fill();
  c.fillStyle = '#EE5E9A'; rr(c, -440, -130, 880, 70, [34, 34, 0, 0]); c.fill(); c.fillStyle = '#FFFFFF'; rr(c, -400, -113, 46, 34, 10); c.fill(); c.beginPath(); c.moveTo(-392, -83); c.lineTo(-396, -67); c.lineTo(-376, -81); c.fill();
  fitTxt(c, 'Вопрос из комментариев:', -335, -95, 36, '#FFFFFF', 700, 'Nun9', 'left');
  fitTxt(c, 'он всё время: «А у мамы вкуснее».', 0, -4, 48, '#1E2030', 820, 'Unb9'); fitTxt(c, 'Как ответить, чтобы перестал?', 0, 66, 48, '#1E2030', 820, 'Unb9');
  c.restore(); if (global.__QA) global.__QA.ui(c, 'card', { x: 100, y: 230, w: 880, h: 260, k, id: 'comment' }); }
const PLATES = { o1: ['1', 'ХОЛОДНО', '#E0474C'], o2: ['2', 'С ЮМОРОМ', '#F2B33D'], o3: ['3', 'КАК НОСИТЕЛЬ', '#4CAF6A'], o4: ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', '#8E5BD8'] };
function optPlate(c, t, sc) { const p = PLATES[sc.id]; if (!p) return; const u = t - sc.s, out = P(t, sc.e - 0.15, sc.e);
  const k = eBack(P(u, 0, 0.25), 2.2) * (1 - eIn(out)), big = 1 - eIO(P(u, 0.3, 0.5)); if (k <= 0) return;
  c.save(); UI.font(c, 'Unb9', 54); const tw = c.measureText(p[1]).width, w = tw + 200, h = 100, s = k * Math.min(lerp(1, 1.4, big), 900 / w), y = 215;
  c.translate(540, y); c.scale(s, s); c.rotate(-0.025);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -h / 2 + 9, w, h, 50); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 50); c.fill(); c.stroke();
  c.fillStyle = p[2]; c.beginPath(); c.arc(-w / 2 + 50, 0, 50, 0, TAU); c.fill(); c.stroke(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p[0], -w / 2 + 50, 4);
  c.fillStyle = C.oliveD; c.textAlign = 'left'; c.fillText(p[1], -w / 2 + 120, 4); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w * s / 2, y: y - 50 * s, w: w * s, h: 100 * s, k, id: 'plate_' + sc.id }); }

// ---------------- end screen: «КАКОЙ ОТВЕТ ТВОЙ?», 1 / 2 / 3 / 4, СОХРАНИ, ПОДПИСАТЬСЯ clicked by the cursor (all inside x 60–940)
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, wt = (w, d) => K.wordT('outro', w) ?? (sp.t + d), CX = 500;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // heroine + boyfriend (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34; 2nd character at local x 640)
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gb = G.bf;
    K.put(c, BF, { t, mood: 'worried', turn: -0.2, look: -0.5, armL: reach(gb, -1, -gb.sw * 1.3, gb.ySh + 120, { planar: true }), armR: reach(gb, 1, gb.sw * 0.8, gb.ySh + 520, { planar: true }), items: { L: socksItem } }, 640, 0);
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 1.3, g.ySh + 520, { planar: true }), armR: reach(g, 1, g.sw * 1.3, g.ySh - 60, { planar: true }), items: { R: paddleItem(true) }, afterTorso: (cc, gg) => apron(cc, gg) }, 0, 0); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const q = eBack(P(u, 0.15, 0.5), 2.2);
  if (q > 0) { c.save(); c.translate(CX, 290); c.scale(q, q); UI.font(c, 'Unb9', 76); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, 'КАКОЙ ОТВЕТ', 0, -48, C.oliveD, C.white, 14); UI.strokeText(c, 'ТВОЙ?', 0, 48, C.pink, C.white, 14); c.restore(); }
  const rows = [['1', 'ХОЛОДНО', 'Then go to mum.', '#E0474C', 'один'], ['2', 'С ЮМОРОМ', 'Shall I also iron your socks?', '#F2B33D', 'два'], ['3', 'КАК НОСИТЕЛЬ', "You're welcome to cook tomorrow.", '#4CAF6A', 'три'], ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', 'Thirty years of practice… and a critic.', '#8E5BD8', 'четыре']];
  rows.forEach(([n, ru, en, col, w], i) => { const a = wt(w, 1.3 + i * 0.35) - 0.1, k = eBack(P(t, a, a + 0.28), 2.0); if (k <= 0) return; const y = 520 + i * 160;
    c.save(); c.translate(CX, y); c.scale(k, k); c.fillStyle = 'rgba(0,0,0,.16)'; rr(c, -420 + 8, -66 + 12, 840, 132, 36); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -420, -66, 840, 132, 36); c.fill(); c.stroke();
    c.fillStyle = col; c.beginPath(); c.arc(-340, 0, 50, 0, TAU); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 5; c.stroke(); fitTxt(c, n, -340, 4, 70, C.white, 70);
    fitTxt(c, ru, -265, -24, 40, C.oliveD, 650, 'Unb9', 'left'); fitTxt(c, en, -265, 28, 34, C.pinkD, 650, 'Nun9', 'left'); c.restore(); });
  const bt = wt('пиши', 3.55) - 0.2, bk = eBack(P(t, bt, bt + 0.35), 2.2), by = 1185;
  if (bk > 0) { c.save(); c.translate(CX, by); c.scale(bk, bk); c.fillStyle = C.gold; rr(c, -420, -55, 400, 110, 55); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke();
    c.fillStyle = C.oliveD; c.beginPath(); c.moveTo(-370, -30); c.lineTo(-330, -30); c.lineTo(-330, 32); c.lineTo(-350, 16); c.lineTo(-370, 32); c.closePath(); c.fill(); fitTxt(c, 'СОХРАНИ', -200, 4, 40, C.oliveD, 250);
    const subT = bt + 0.6, click = P(t, subT + 0.55, subT + 0.7), pressed = t > subT + 0.65, ss = 1 - 0.08 * Math.sin(click * Math.PI);
    c.save(); c.translate(220, 0); c.scale(ss, ss); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -200, -55, 400, 110, 55); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke(); fitTxt(c, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4, 40, C.white, 340); c.restore(); c.restore();
    const mv = eIO(P(t, subT, subT + 0.55)); UI.tapCursor(c, lerp(930, CX + 260, mv), lerp(by + 330, by + 10, mv), 1, P(t, subT + 0.6, subT + 1.1)); }
  Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

const HOLD = { hook_b: -0.2, o1_h: -0.2, o1_b: -0.2, o2_h: -0.2, o2_b: 0.3, o3_h: -0.2, o3_b: 0.0, o4_h: -0.2, o4_b: -0.15, end_m: -0.15 };
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  if (tag.startsWith('ui:')) { const an = phoneView(c, t, L); Hq.vignette(c, W, HH, 0.2);
    // mum talks from the phone (twist insert): her bubble comes from the phone's speaker
    if (L === 'end' && t > ev('end', 'tap')) K.bubbles(c, t, sc, { hismum2: { x: an.x, y: an.y + 60, hh: 10 } }, p => p, { cleanChunks: true, hold: HOLD, names: { hismum2: ['MUM', '#D2557F'] } }); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); const M = r.M, proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26);
    // bubbles only for characters drawn in this shot (an off-screen speaker never gets a bubble over another shot)
    const onScr = {}; for (const k in r.heads) if (Math.abs(r.heads[k].x) < 1e4) onScr[k] = r.heads[k];
    // twist two-shot: mum's speakerphone bubble sits at the top of the frame (above both faces), tail down towards the phone on the table
    if (onScr.hismum2) { const ph = proj({ x: PHX, y: TOP }); delete onScr.hismum2; if (tag === 'twolo') K.bubbles(c, t, sc, { hismum2: { x: ph.x + 120, y: 640, hh: 0 } }, p => p, { cleanChunks: true, hold: HOLD, names: { hismum2: ['MUM', '#D2557F'] } }); }
    K.bubbles(c, t, sc, onScr, proj, { cleanChunks: true, hold: HOLD, names: { hismum2: ['MUM', '#D2557F'] } }); }
  if (L === 'hook') { title(c, t); commentPlate(c, t); }
  optPlate(c, t, sc);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  // the end screen wipes in from the twist
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('mumcook', NF, renderFrame);
