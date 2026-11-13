// "4 типа гостей у таза салата" — rubric types4 («4 типа …»), UK, hard_cut camera: node saladguests.js start end out.mp4 | --png=f1,f2
// A British dining room, festive table. In the middle an enamel basin of salad the size of a wheel sits on ITS OWN CHAIR (absurd detail: a napkin tied
// round its "neck" and a paper party hat), a spoon stands upright in it. The hostess (heroine) with a ladle: "Who wants more salad?"
// 01 · ANOTHER  — Theo holds up an empty plate; behind him a tower of spotless plates that grows on every «ещё одну».
// 02 · ENOUGH   — Priscilla covers her plate with her palm; the hostess calmly ladles the salad right onto her palm.
// 03 · TOO MUCH — Greg leans back (the chair creaks), pushes the plate away... and pulls it back: "Oh, go on then, one more spoonful."
// 04 · A LITTLE — Mrs Higgins shows a tiny crumb; the hostess builds a mound higher than her hairdo; «полтаза» -> the basin is half empty.
// Twist (music silent): night, kitchen, light only from the open fridge: the four guests eat from the basin with ONE spoon in turns;
// the hostess in her dressing gown in the doorway; Theo, without turning round: "Nobody saw anything."
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/saladguests/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];
// handovers: a negative per-line hold (bubble gone BEFORE the line ends) — ui_v2 clamps hold to >= 0.05, so shorten the bubble's span instead
{ const _bub = UI.bubble; UI.bubble = (ctx, sp, t, an, side, name) => _bub(ctx, sp.hold < 0.05 ? { ...sp, d: sp.d + sp.hold - 0.05 } : sp, t, an, side, name); }
const rnd = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------------- cast
const HER = { ...BASE.her_dinner };
const HER_N = { ...BASE.her_dinner, earrings: null, necklace: false, top: { type: 'coat', col: '#F49CC0', col2: '#FFF1F6' }, bottom: { type: 'trousers', col: '#F49CC0' }, shoes: { col: '#FFFFFF', acc: null } };
const THEO = { ...BASE.tom, top: { type: 'sweater', col: '#4E7FB8' } };
const PRISC = { ...BASE.margot, top: { type: 'cardigan', col: '#2E5A6E', col2: '#F5EBDD' }, bottom: { type: 'skirt', col: '#2B2733' } };
const GREG = { ...BASE.greg };
const HIGG = { ...BASE.agnes };
const CFG = { theo3: THEO, prisc1: PRISC, gregs1: GREG, higg1: HIGG };
const G = { her: geom(HER), theo3: geom(THEO), prisc1: geom(PRISC), gregs1: geom(GREG), higg1: geom(HIGG) };
const SEAT = 330, TOP = -500;                                     // seated upper body dropped by SEAT; table top y
const GX = { theo3: -1150, prisc1: -620, gregs1: 700, higg1: 1250 };  // guests' seats
const BAX = -60;                                                  // the basin's own chair
const HPOS = { wide: 330, t1: -1530, t2: -300, t3: 1080, t4: 1610 }; // hostess: at the basin (wide shots) / next to the guest (two-shots)
const TWX = GX.theo3 + 175;                                       // Theo's plate tower (behind him)
const NX = 12000;                                                 // the night kitchen (same world, far right)
const NG = { prisc1: NX - 430, higg1: NX - 150, gregs1: NX + 520, theo3: NX + 870 }, NBX = NX + 190, NDX = NX + 1520;
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- props
// salad (Olivier-style): a dome with peas, carrot and ham cubes; (x, y) = base centre
function salad(c, x, y, w, h, seed = 1) { if (w <= 2 || h <= 1) return;
  c.save(); c.translate(x, y);
  paint(c, q => { q.m(-w / 2, 0); q.b(-w / 2, -h * 0.75, -w * 0.28, -h, 0, -h); q.b(w * 0.28, -h, w / 2, -h * 0.75, w / 2, 0); q.z(); }, '#F1E0A0', { sd: 5, hd: 2, lw: 4 });
  const n = Math.max(3, Math.round(w * h / 1400));
  for (let i = 0; i < n; i++) { const u = rnd(seed * 31 + i) * 2 - 1, v = rnd(seed * 17 + i * 3); const px = u * w * 0.4, top = -h * (1 - Math.pow(Math.abs(u * 0.9), 2)), py = top * (0.15 + 0.75 * v); const k = i % 4, r = Math.max(4, Math.min(13, w / 26));
    c.fillStyle = ['#5DAA45', '#E8843A', '#E89AA4', '#FFFFFF'][k]; if (k === 0) { c.beginPath(); c.arc(px, py, r, 0, TAU); c.fill(); } else c.fillRect(px - r, py - r, r * 2, r * 1.8); }
  c.restore(); }
function plate(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = 'rgba(0,0,0,.15)'; c.beginPath(); c.ellipse(6, 8, 128, 30, 0, 0, TAU); c.fill();
  c.fillStyle = '#FFFFFF'; c.strokeStyle = '#9AA8B8'; c.lineWidth = 4; c.beginPath(); c.ellipse(0, 0, 125, 30, 0, 0, TAU); c.fill(); c.stroke();
  c.strokeStyle = '#4A78C0'; c.lineWidth = 4; c.beginPath(); c.ellipse(0, -2, 100, 21, 0, 0, TAU); c.stroke(); c.restore(); }
function sparkle(c, x, y, s, a = 1) { if (a <= 0) return; c.save(); c.translate(x, y); c.scale(s, s); c.globalAlpha = a; c.fillStyle = '#FFFFFF'; c.strokeStyle = '#7FB0D8'; c.lineWidth = 3;
  c.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? 9 : 30, an = i / 8 * TAU; c.lineTo(Math.cos(an) * r, Math.sin(an) * r); } c.closePath(); c.fill(); c.stroke(); c.restore(); }
// a plate in a hand (seen from the front), optional salad on it
const plateItem = (fill = 0, glow = 0, t = 0) => ctx => { ctx.save(); ctx.translate(0, -24); plate(ctx, 0, 0, 0.85); if (fill > 0) salad(ctx, 0, -6, 170 * Math.min(1, 0.6 + fill * 0.4), 110 * fill, 5); ctx.restore();
  if (glow > 0) { sparkle(ctx, -60, -60, 1.1 + 0.2 * Math.sin(t * 12), glow); sparkle(ctx, 70, -40, 0.8, glow); } };
const ladleItem = (full, up = 0) => ctx => { ctx.save(); ctx.rotate(-0.25 + up);
  ctx.strokeStyle = '#B8C0CA'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, -70); ctx.lineTo(0, 170); ctx.stroke();
  paint(ctx, q => { q.m(-70, 160); q.b(-70, 260, 70, 260, 70, 160); q.z(); }, '#C9D0D8', { sd: 4, hd: 2, lw: 4 });
  if (full) salad(ctx, 0, 166, 130, 60, 9); ctx.restore(); };
const spoonItem = (load = 0) => ctx => { ctx.save(); ctx.rotate(-0.5); ctx.strokeStyle = '#C9D0D8'; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 40); ctx.lineTo(0, -150); ctx.stroke();
  c2fill(ctx); if (load) salad(ctx, 0, -168, 60, 26, 3); ctx.restore(); };
function c2fill(ctx) { ctx.fillStyle = '#C9D0D8'; ctx.beginPath(); ctx.ellipse(0, -175, 30, 40, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#8A949E'; ctx.lineWidth = 3; ctx.stroke(); }
const lumpItem = (k = 1) => ctx => { salad(ctx, 0, -10, 150 * k, 90 * k, 7); };
const crumbItem = t => ctx => { ctx.save(); ctx.translate(0, -50); ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 40 + 4 * Math.sin(t * 8), 0, TAU); ctx.stroke(); ctx.fillStyle = '#5DAA45'; ctx.beginPath(); ctx.arc(0, 0, 10, 0, TAU); ctx.fill(); ctx.restore(); };

// the basin: white enamel with a blue rim and a red rose, sits on its own chair, napkin bib, paper party hat, a spoon standing upright in the salad
function basin(c, x, yb, level, t, o = {}) { const rw = 330, bw = 250, hgt = 240, yr = yb - hgt;
  c.save(); c.translate(x, 0);
  // back of the rim (inside)
  c.fillStyle = '#DCE3EA'; c.beginPath(); c.ellipse(0, yr, rw, 52, 0, Math.PI, TAU); c.fill();
  // salad dome (sinks into the basin as the level drops)
  const dh = 230 * level, dw = rw * 2 * (0.75 + 0.2 * Math.min(1, level));
  if (level > 0.02) salad(c, 0, yr + 22 * (1 - Math.min(1, level)), dw, dh, 2);
  // the spoon standing upright
  if (!o.noSpoon) { const sy = yr - dh * 0.8 + 30; c.strokeStyle = '#C9D0D8'; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(120, sy); c.lineTo(132, sy - 330); c.stroke(); c.strokeStyle = '#8A949E'; c.lineWidth = 3; c.beginPath(); c.moveTo(126, sy - 20); c.lineTo(136, sy - 320); c.stroke(); }
  // body
  paint(c, q => { q.m(-rw, yr); q.l(rw, yr); q.l(bw, yb); q.l(-bw, yb); q.z(); }, '#F4F7FA', { sd: 8, hd: 3, lw: 5 });
  c.fillStyle = '#2E5FA8'; c.beginPath(); c.ellipse(0, yr, rw + 8, 30, 0, 0, Math.PI); c.lineTo(-rw - 8, yr); c.fill(); c.beginPath(); c.ellipse(0, yr, rw + 8, 22, 0, Math.PI, TAU); c.lineWidth = 12; c.strokeStyle = '#2E5FA8'; c.stroke();
  c.fillStyle = '#2B2F3A'; c.beginPath(); c.ellipse(-205, yr + 120, 14, 9, 0.3, 0, TAU); c.fill();   // enamel chip
  // napkin tied round its "neck": knot ears at the rim + a bib hanging over the front
  const sw = Math.sin(t * 2.2) * 0.04;
  paint(c, q => { q.m(-210, yr + 22); q.l(210, yr + 22); q.l(0, yr + 205); q.z(); }, '#FFFFFF', { sd: 4, hd: 2, lw: 4 });
  c.strokeStyle = '#E58AAA'; c.lineWidth = 5; c.beginPath(); c.moveTo(-170, yr + 40); c.lineTo(170, yr + 40); c.stroke();
  c.save(); c.translate(rw - 10, yr + 6); c.rotate(sw); paint(c, q => { q.m(0, 0); q.l(70, -50); q.l(60, 20); q.z(); }, '#FFFFFF', { sd: 3, hd: 1, lw: 4 }); paint(c, q => { q.m(0, 0); q.l(80, 10); q.l(40, 50); q.z(); }, '#FFFFFF', { sd: 3, hd: 1, lw: 4 }); c.restore();
  // red rose decal (peeks under the bib)
  c.fillStyle = '#E0474C'; for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; c.beginPath(); c.arc(150 + Math.cos(a) * 14, yr + 150 + Math.sin(a) * 14, 13, 0, TAU); c.fill(); } c.fillStyle = '#5DAA45'; c.beginPath(); c.ellipse(130, yr + 182, 20, 9, 0.5, 0, TAU); c.fill();
  // party hat on the salad
  if (!o.noHat) { const hy = yr - Math.max(10, dh * 0.92) + 6; c.save(); c.translate(-70, hy); c.rotate(-0.12 + sw);
    c.strokeStyle = '#2B2F3A'; c.lineWidth = 3; c.beginPath(); c.moveTo(-70, 0); c.quadraticCurveTo(0, 40, 70, 0); c.stroke();
    paint(c, q => { q.m(-75, 0); q.l(75, 0); q.l(0, -260); q.z(); }, '#EE5E9A', { sd: 5, hd: 2, lw: 4 });
    c.save(); c.beginPath(); c.moveTo(-75, 0); c.lineTo(75, 0); c.lineTo(0, -260); c.closePath(); c.clip(); c.fillStyle = '#F2C14E'; for (let i = 0; i < 5; i++) { c.save(); c.translate(0, -40 - i * 55); c.rotate(-0.35); c.fillRect(-120, -10, 240, 20); c.restore(); } c.restore();
    c.fillStyle = '#7FB0D8'; for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; c.beginPath(); c.arc(Math.cos(a) * 16, -268 + Math.sin(a) * 16, 13, 0, TAU); c.fill(); } c.restore(); }
  c.restore(); K.mark(c, 'basin', x, yr - 80, 340); }
function chair(c, x, col = '#7A4E2E', seat = '#B0505A') { c.fillStyle = col; rr(c, x - 160, -1080, 320, 640, 50); c.fill(); c.fillStyle = seat; rr(c, x - 130, -1050, 260, 560, 40); c.fill(); c.fillStyle = 'rgba(255,255,255,.1)'; rr(c, x - 110, -1030, 80, 520, 30); c.fill(); }
// Theo's tower of spotless plates (grows)
function tower(c, x, yb, n, t, wob = 0) { c.save(); c.translate(x, yb);
  for (let i = 0; i < n; i++) { const y = -i * 30, dx = Math.sin(i * 0.9 + t * 3) * wob * i * 0.6; c.fillStyle = '#FFFFFF'; c.strokeStyle = '#8A98A8'; c.lineWidth = 3; c.beginPath(); c.ellipse(dx, y, 115, 20, 0, 0, TAU); c.fill(); c.stroke(); c.strokeStyle = '#4A78C0'; c.beginPath(); c.ellipse(dx, y - 1, 92, 14, 0, Math.PI * 0.05, Math.PI * 0.95); c.stroke(); }
  sparkle(c, -70, -n * 30 + 10, 0.9 + 0.2 * Math.sin(t * 7), 0.9); sparkle(c, 80, -n * 18, 0.7 + 0.2 * Math.sin(t * 9 + 1), 0.8);
  c.restore(); K.mark(c, 'tower', x, yb - n * 15, n * 16); }
const towerN = (t, L) => { const base = 22; if (L === 'hook') return base; if (L !== 't1') return base + 4; let n = base; if (t > ev('t1', 'stack') + 0.2) n++; for (const g of ev('t1', 'grow')) if (t > g) n++; return n; };
const basinLevel = (t, L) => ({ hook: 1, t1: 0.94, t2: 0.88, t3: 0.82 })[L] ?? (L === 't4' ? (t > ev('t4', 'half') ? 0.42 : t > ev('t4', 'serve') ? 0.62 : 0.78) : L === 'end' ? lerp(0.32, 0.12, clamp((t - ev('end', 'beat')) / 4)) : 0.8);

// ---------------- the dining room (prerendered, softly blurred)
const BX0 = -2400, BY0 = -4600, BW = 4800, BH = 5400, BS = 0.5;
function drawRoom(c) {
  c.fillStyle = '#F3E6D2'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = 'rgba(122,154,106,.22)'; for (let x = BX0; x < BX0 + BW; x += 200) for (let y = BY0; y < -900; y += 200) { c.beginPath(); c.arc(x + ((y / 200) % 2) * 100, y, 22, 0, TAU); c.fill(); }   // wallpaper dots
  c.fillStyle = '#9A6A4A'; c.fillRect(BX0, -980, BW, 40); c.fillStyle = '#E8D6BC'; c.fillRect(BX0, -940, BW, 940);                     // dado rail + panelling
  c.strokeStyle = 'rgba(0,0,0,.07)'; c.lineWidth = 5; for (let x = BX0; x < BX0 + BW; x += 300) { c.strokeRect(x + 30, -900, 240, 820); }
  // window with rain (London), net curtains
  c.fillStyle = '#9A6A4A'; rr(c, -1950, -2700, 900, 1300, 16); c.fill(); const g = c.createLinearGradient(0, -2660, 0, -1440); g.addColorStop(0, '#9FB4C6'); g.addColorStop(1, '#C9D6E0'); c.fillStyle = g; c.fillRect(-1910, -2660, 820, 1220);
  c.fillStyle = '#7A8A9A'; for (let i = 0; i < 6; i++) c.fillRect(-1900 + i * 140, -1800 - (i % 3) * 120, 110, 360 + (i % 3) * 120);
  c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 3; for (let i = 0; i < 40; i++) { const x = -1900 + rnd(i) * 800, y = -2650 + rnd(i + 50) * 1150; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 12, y + 50); c.stroke(); }
  c.fillStyle = '#9A6A4A'; c.fillRect(-1520, -2660, 24, 1220); c.fillRect(-1910, -2060, 820, 24);
  c.fillStyle = 'rgba(255,255,255,.55)'; rr(c, -2000, -2740, 260, 1400, 30); c.fill(); rr(c, -1260, -2740, 260, 1400, 30); c.fill();
  // bunting across the wall
  c.strokeStyle = '#7A4E2E'; c.lineWidth = 6; c.beginPath(); c.moveTo(-2400, -2900); c.quadraticCurveTo(0, -2500, 2400, -2900); c.stroke();
  for (let i = 0; i < 22; i++) { const x = -2300 + i * 220, u = (x + 2400) / 4800, y = (1 - u) * (1 - u) * -2900 + 2 * u * (1 - u) * -2500 + u * u * -2900; c.fillStyle = ['#EE5E9A', '#F2C14E', '#7FB0D8', '#7CC45A', '#B9A2E6'][i % 5]; c.beginPath(); c.moveTo(x - 70, y); c.lineTo(x + 70, y); c.lineTo(x, y + 150); c.fill(); }
  // framed pictures + a wall clock
  c.fillStyle = '#9A6A4A'; rr(c, -560, -2300, 420, 520, 12); c.fill(); c.fillStyle = '#CFE0C8'; c.fillRect(-530, -2270, 360, 460); c.fillStyle = '#7CA06A'; c.beginPath(); c.moveTo(-530, -1810); c.lineTo(-400, -2050); c.lineTo(-300, -1930); c.lineTo(-170, -2100); c.lineTo(-170, -1810); c.fill();
  c.fillStyle = '#9A6A4A'; rr(c, 260, -2350, 380, 380, 190); c.fill(); c.fillStyle = '#FFFDF8'; c.beginPath(); c.arc(450, -2160, 160, 0, TAU); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(450, -2160); c.lineTo(450, -2270); c.moveTo(450, -2160); c.lineTo(520, -2130); c.stroke();
  c.fillStyle = '#9A6A4A'; rr(c, 1000, -2400, 700, 480, 12); c.fill(); c.fillStyle = '#F6D9A8'; c.fillRect(1030, -2370, 640, 420); fitTxt(c, 'HOME', 1350, -2230, 110, '#B0505A', 560, 'Cav7'); fitTxt(c, 'SWEET HOME', 1350, -2080, 80, '#B0505A', 560, 'Cav7');
  // sideboard with a teapot (right)
  c.fillStyle = '#7A4E2E'; c.fillRect(1500, -1300, 800, 60); c.fillRect(1540, -1240, 720, 600); c.fillStyle = '#F4F7FA'; c.beginPath(); c.ellipse(1900, -1400, 120, 100, 0, 0, TAU); c.fill(); c.fillRect(1990, -1440, 120, 26);
  // floor (carpet)
  c.fillStyle = '#B0505A'; c.fillRect(BX0, 0, BW, BY0 + BH); c.fillStyle = 'rgba(255,255,255,.07)'; for (let x = BX0; x < BX0 + BW; x += 120) c.fillRect(x, 0, 50, BY0 + BH);
  c.fillStyle = '#8A6A4A'; c.fillRect(BX0, -60, BW, 60);
}
// the night kitchen (prerendered; darkened live by the fridge-light overlay)
const KX0 = NX - 2200, KY0 = -4400, KW = 4400, KH = 5200;
function drawKitchen(c) {
  c.fillStyle = '#CFE0DA'; c.fillRect(KX0, KY0, KW, KH);
  c.strokeStyle = 'rgba(0,0,0,.06)'; c.lineWidth = 4; for (let x = KX0; x < KX0 + KW; x += 120) { c.beginPath(); c.moveTo(x, -1600); c.lineTo(x, -900); c.stroke(); } for (let y = -1600; y < -900; y += 120) { c.beginPath(); c.moveTo(KX0, y); c.lineTo(KX0 + KW, y); c.stroke(); }
  // wall cupboards + worktop (back)
  c.fillStyle = '#7FA6A0'; for (let i = 0; i < 4; i++) rr(c, NX - 500 + i * 420, -2700, 380, 700, 14), c.fill();
  c.fillStyle = '#DCCBB0'; c.fillRect(NX - 600, -900, 1900, 60); c.fillStyle = '#7FA6A0'; c.fillRect(NX - 580, -840, 1860, 840);
  // window with the moon
  c.fillStyle = '#5A6A7A'; rr(c, NX - 300, -1900, 700, 560, 12); c.fill(); c.fillStyle = '#1E2A44'; c.fillRect(NX - 270, -1870, 640, 500); c.fillStyle = '#F7F2C8'; c.beginPath(); c.arc(NX + 230, -1750, 60, 0, TAU); c.fill(); c.fillStyle = '#1E2A44'; c.beginPath(); c.arc(NX + 205, -1765, 52, 0, TAU); c.fill();
  // doorway (right) — the hallway light is drawn live
  c.fillStyle = '#5A4030'; c.fillRect(NDX - 320, -2350, 640, 2350); c.fillStyle = '#2A2420'; c.fillRect(NDX - 270, -2300, 540, 2300);
  // floor tiles
  c.fillStyle = '#B9B2A8'; c.fillRect(KX0, 0, KW, KY0 + KH); c.fillStyle = 'rgba(0,0,0,.08)'; for (let y = 0; y < KY0 + KH; y += 150) for (let x = KX0 + ((y / 150) % 2) * 150; x < KX0 + KW; x += 300) c.fillRect(x, y, 150, 150);
}
const mkBG = (fn, x0, y0, w, h) => { const a = createCanvas(Math.round(w * BS), Math.round(h * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-x0, -y0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawRoom, BX0, BY0, BW, BH), BGK = mkBG(drawKitchen, KX0, KY0, KW, KH);

// ---------------- characters
const down = (g, s, drop = 0) => reach(g, s, s * g.sw * 1.08, g.ySh + drop + 540, { planar: true });
const hang = (g, s) => reach(g, s, s * g.sw * 0.8, g.ySh + 330);
const hold = (g, s, dy = 330, k = 0.75) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const open = (g, s, k = 1.7, dy = 90) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const onTable = (g, s) => reach(g, s, s * g.sw * 0.7, g.ySh + 335, { planar: true });
const toW = (g, s, x0, wx, wy, seated = true) => reach(g, s, wx - x0, wy - (seated ? SEAT : 0), { planar: true });   // world target -> body-local target
const gest = (st, g, who, t, side, base_) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base_ + Math.cos(u) * 20, { planar: true }); } };
const seated = (g, who, t) => ({ t, talk: talk(who, t), mood: 'happy', turn: 0, look: 0, legPose: 'sit', drop: SEAT, legs: false, armL: onTable(g, -1), armR: onTable(g, 1), items: {} });
const standing = (g, who, t) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, armL: down(g, -1), armR: down(g, 1), items: {} });
const hostX = (L, tag) => (tag && tag.startsWith('two') && HPOS[L] !== undefined) ? HPOS[L] : HPOS.wide;
// a serving stroke: the hand with the ladle goes to (wx, wy) and back; k = 0..1..0 over [a, a + d]
const stroke = (t, a, d = 0.6) => { const u = (t - a) / d; return u < 0 || u > 1 ? 0 : Math.sin(u * Math.PI); };
function herState(t, L, tag) { const g = G.her, hx = hostX(L, tag), e = k => ev(L, k), st = { ...standing(g, 'her', t), mood: 'happy', look: 0.2 };
  const tgt = { t1: GX.theo3 - 220, t2: GX.prisc1 + 30, t3: GX.gregs1, t4: GX.higg1 }[L];
  const side = tgt !== undefined && tag && tag.startsWith('two') ? (tgt < hx ? -1 : 1) : -1;   // hand on the guest's side holds the ladle
  const other = -side, armK = side < 0 ? 'armL' : 'armR', oK = other < 0 ? 'armL' : 'armR', it = side < 0 ? 'L' : 'R';
  st[armK] = hold(g, side, 230, 0.9); st.items = { [it]: ladleItem(true) }; st[oK] = reach(g, other, other * g.sw * 0.55, g.ySh + 420, { planar: true });   // other hand on the hip
  st.turn = side * 0.2; st.look = side * 0.6;
  if (L === 'hook') { if (speaking('hook_h', t, 0.05, 0.1)) { st.mood = 'happy'; st.armL = reach(g, -1, -g.sw * 1.4, g.ySh - 140 + Math.sin(t * 8) * 20, { planar: true }); st.armR = open(g, 1, 1.6, 40 + Math.sin(t * 6) * 15); st.look = 0; st.turn = 0; }
    if (t > hev('guests')) { st.laugh = true; st.look = 0; } }
  const serveAt = (wx, wy, a, d = 0.6, fullAfter = false) => { const k = stroke(t, a, d); if (k > 0) { st[armK] = reach(g, side, lerp(side * g.sw * 0.9, wx - hx, k), lerp(g.ySh + 230, wy - 0, k), { planar: true }); st.items = { [it]: ladleItem(t < a + d * 0.5 || fullAfter, k * 1.2 * -side) }; st.mood = 'happy'; st.blink = 0; } else if (t > a + d && t < a + d + 0.6 && !fullAfter) st.items = { [it]: ladleItem(false) }; };
  if (tag && tag.startsWith('two')) {
    if (L === 't1') { serveAt(GX.theo3 - 210, -1010, e('serve'), 0.55); if (t > e('gulp')) { st.mood = 'surprised'; st.blink = 0; } if (t > e('plate2')) { st.mood = 'smug'; } }
    if (L === 't2') { serveAt(GX.prisc1 + 10, -860, e('serve'), 0.75); serveAt(GX.prisc1 + 10, -860, e('again'), 0.6); st.mood = 'happy'; st.blink = t > e('serve') + 0.8 && t < e('again') ? 1 : 0; }
    if (L === 't3') { serveAt(GX.gregs1 + 60, -820, e('spoon'), 0.6); if (speaking('t3_greg', t, 0, 0) && t < e('spoon')) st.mood = 'skeptical'; }
    if (L === 't4') { for (const h of e('heap')) serveAt(GX.higg1, -900 - (h - e('heap')[0]) * 400, h, 0.45, true); if (t > e('peek')) { st.mood = 'smug'; st.blink = 1; } } }
  return st; }
function theoState(t, L, tag) { const g = G.theo3, x0 = GX.theo3, e = k => ev(L, k), st = { ...seated(g, 'theo3', t), turn: -0.15, look: -0.3 };
  if (L === 'hook') { st.armR = hold(g, 1, 260, 0.6); if (t > hev('guests')) { st.armL = toW(g, -1, x0, x0 - 220, -900); st.items = { L: plateItem(0) }; st.look = 0; st.turn = 0; } }
  if (L === 't1') { st.mood = 'happy'; st.blink = 0; const pl = toW(g, -1, x0, x0 - 210, -870); st.armL = pl; st.items = { L: plateItem(0) };
    if (speaking('t1_theo', t, 0.05, 0.1)) { st.mood = 'happy'; st.armL = toW(g, -1, x0, x0 - 220, -900 + Math.sin(t * 7) * 15); st.armR = onTable(g, 1); st.look = -0.6; }
    if (t > e('serve') + 0.3) st.items = { L: plateItem(1) };
    if (t > e('gulp') - 0.05 && t < e('gulp') + 0.4) { st.armL = toW(g, -1, x0, x0 - 60, -960); st.items = { L: plateItem(t < e('gulp') + 0.2 ? 0.6 : 0) }; st.mood = 'happy'; st.laugh = true; st.blink = 1; st.headFirst = true; }
    if (t > e('gulp') + 0.4) { st.items = { L: plateItem(0, clamp(1 - (t - e('gulp') - 0.4) / 0.6), t) }; st.mood = 'happy'; st.laugh = false; }
    if (t > e('stack') - 0.1 && t < e('plate2')) { st.armL = onTable(g, -1); st.armR = toW(g, 1, x0, TWX - 20, -500 - towerN(t, L) * 30 + 10); st.items = { R: plateItem(0) }; st.look = 0.6; st.turn = 0.2; if (t > e('stack') + 0.2) st.items = {}; }
    if (t > e('plate2')) { const k = eBack(P(t, e('plate2'), e('plate2') + 0.3), 2); st.armL = toW(g, -1, x0, x0 - 200, lerp(-780, -930, k) + Math.sin(t * 5) * 10); st.items = { L: plateItem(0, 0.6, t) }; st.mood = 'happy'; st.look = -0.4; st.turn = -0.15; st.blink = 0; } }
  if (L === 't2' || L === 't3' || L === 't4') { st.mood = 'happy'; st.look = 0.5; st.turn = 0.15; st.armL = toW(g, -1, x0, x0 - 190, -860); st.items = { L: plateItem(0, 0.5, t) }; }
  return st; }
function priscState(t, L, tag) { const g = G.prisc1, x0 = GX.prisc1, e = k => ev(L, k), st = { ...seated(g, 'prisc1', t), mood: 'neutral', turn: -0.05, look: -0.2 };
  if (L === 'hook' && t > hev('guests')) { st.armR = toW(g, 1, x0, x0 + 200, -880); st.items = { R: plateItem(0) }; st.mood = 'happy'; }
  if (L === 't1') { st.mood = 'skeptical'; st.look = -0.8; }
  if (L === 't2') { st.turn = 0.15; st.look = 0.4; st.mood = 'neutral';
    if (t > e('cover')) { st.armR = toW(g, 1, x0, x0 + 10, -585); st.mood = 'skeptical'; }   // palm flat over the plate
    if (speaking('t2_prisc', t, 0.05, 0.1)) { st.mood = 'happy'; st.blink = 0; st.armL = reach(g, -1, -g.sw * 1.3, g.ySh + 160, { planar: true }); }
    if (t > e('serve') + 0.38) { st.items = { R: lumpItem(t > e('again') + 0.3 ? 1.35 : 0.9) }; st.mood = 'surprised'; st.blink = 0; st.look = 0.1; st.lookY = 0.6; }
    if (t > e('shock')) { st.mood = 'shock'; st.lookY = 0.3; st.look = 0; st.turn = 0; st.armL = reach(g, -1, -g.sw * 1.4, g.ySh + 60, { planar: true }); }
    if (t > SP.t2_nar.t + 0.3) { st.mood = 'annoyed'; st.armL = onTable(g, -1); } }
  if (L === 't3' || L === 't4') { st.items = { R: lumpItem(1.35) }; st.armR = toW(g, 1, x0, x0 + 10, -585); st.mood = 'annoyed'; st.look = 0.4; }
  return st; }
const gregPlateX = (t, L) => { if (L !== 't3') return 0; const a = ev('t3', 'push'), b = ev('t3', 'pull'); return 240 * eOut(P(t, a, a + 0.3)) * (1 - eIO(P(t, b, b + 0.3))); };
const gregFill = (t, L) => L === 't3' ? (t > ev('t3', 'spoon') + 0.35 ? 1.1 : 0.9) - (t > ev('t3', 'spoon2') + 0.2 ? 0.15 : 0) : L === 't4' ? 0.95 : L === 'hook' || L === 't1' || L === 't2' ? 0.9 : 0.9;
const gregTilt = (t, L) => { if (L !== 't3') return 0; const a = SP.t3_greg.t, b = ev('t3', 'pull'); let k = 0.07 * eOut(P(t, a, a + 0.5)) * (1 - eIO(P(t, b, b + 0.3))); const u = t - ev('t3', 'creak'); if (u > 0 && u < 1.0) k += Math.sin(u * 30) * 0.03 * (1 - u); return k; };
function gregState(t, L, tag) { const g = G.gregs1, x0 = GX.gregs1, e = k => ev(L, k), st = { ...seated(g, 'gregs1', t), turn: -0.1, look: -0.3, items: { R: spoonItem(0) } };
  st.armR = hold(g, 1, 300, 0.75);
  if (L === 'hook' && t > hev('guests')) { st.armL = toW(g, -1, x0, x0 - 260, -960); st.items = { R: spoonItem(0), L: plateItem(0) }; st.mood = 'happy'; }
  if (L === 't3') { st.mood = 'happy';
    if (speaking('t3_greg', t, 0.05, 0.1)) { st.mood = 'tired'; st.blink = t < e('push') ? 1 : 0; st.armL = reach(g, -1, -g.sw * 0.35, g.ySh + 330, { planar: true }); st.armR = reach(g, 1, g.sw * 0.35, g.ySh + 330, { planar: true }); st.items = {}; st.headY = -6; }   // hands on the belly
    if (t > e('push') - 0.05 && t < e('push') + 0.45) { st.armL = toW(g, -1, x0, x0 + gregPlateX(t, L) - 70, -560); st.mood = 'skeptical'; }
    if (t > e('push') + 0.45 && t < e('pull') - 0.1) { st.mood = 'worried'; st.look = 0.7; st.turn = 0.25; }   // looks longingly at the plate
    if (t > e('pull') - 0.1 && t < e('pull') + 0.45) { st.armL = toW(g, -1, x0, x0 + gregPlateX(t, L) + 60, -560); st.armR = toW(g, 1, x0, x0 + gregPlateX(t, L) + 160, -560); st.items = {}; st.mood = 'happy'; st.look = 0.2; }
    if (t > e('pull') + 0.45) { st.mood = 'happy'; st.look = 0.1; st.turn = 0; }
    if (t > endOf('t3_greg') + 0.05) { st.items = { R: spoonItem(0) }; st.armR = hold(g, 1, 300, 0.75); st.armL = onTable(g, -1); st.mood = 'happy'; st.laugh = t > e('creak') && t < e('creak') + 0.8 ? false : st.laugh; }
    if (t > e('creak') && t < e('creak') + 0.9) { st.mood = 'shock'; st.blink = 0; }
    const s2 = e('spoon2'); if (t > s2 - 0.1 && t < s2 + 0.7) { st.items = { R: spoonItem(t < s2 + 0.25) }; st.armR = toW(g, 1, x0, x0 + 90, -1060); st.mood = 'happy'; st.blink = 1; st.headFirst = true; }
    if (t > s2 + 0.7) { st.mood = 'happy'; st.laugh = true; st.blink = 1; } }
  if (L === 't4') { st.mood = 'surprised'; st.look = 0.5; st.turn = 0.15; }
  return st; }
const higgHeap = (t, L) => { if (L === 'end' || L === 'outro') return 3; if (L !== 't4') return 0; let n = 0; for (const h of ev('t4', 'heap')) if (t > h + 0.3) n++; return n; };
function higgState(t, L, tag) { const g = G.higg1, x0 = GX.higg1, e = k => ev(L, k), st = { ...seated(g, 'higg1', t), mood: 'happy', turn: -0.15, look: -0.4 };
  if (L === 'hook' && t > hev('guests')) { st.armL = toW(g, -1, x0, x0 - 190, -700); st.items = { L: plateItem(0) }; }
  if (L === 't4') { st.mood = 'happy'; st.blink = 0; st.look = -0.3;
    if (speaking('t4_higg', t, 0.1, 0.35) && t < e('heap')[0]) { st.armR = reach(g, 1, g.sw * 1.15, g.ySh - 20, { planar: true, fist: true }); st.items = { R: crumbItem(t) }; st.headFirst = true; st.mood = 'happy'; }
    const n = higgHeap(t, L); if (n >= 1) { st.mood = 'surprised'; st.lookY = -0.5; st.look = 0; }
    if (n >= 2) { st.mood = 'shock'; }
    if (t > e('peek')) { st.headX = 175; st.tilt = 0.14; st.mood = 'worried'; st.lookY = 0; st.look = -0.6; st.armR = toW(g, 1, x0, x0 + 260, -720); } }
  return st; }
const STATE = { theo3: theoState, prisc1: priscState, gregs1: gregState, higg1: higgState };

// ---------------- the world (day) + which characters a shot draws (clean singles: only the tagged character)
const ALL = ['her', 'theo3', 'prisc1', 'gregs1', 'higg1'];
const DRAW = { wide: ALL, basin: [], her: ['her'], theo3: ['theo3'], prisc1: ['prisc1'], gregs1: ['gregs1'], higg1: ['higg1'], two1: ['her', 'theo3'], two2: ['her', 'prisc1'], two3: ['her', 'gregs1'], two4: ['her', 'higg1'], palm: ['prisc1'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function tableFront(c, t, L) {
  paint(c, q => { q.m(-1750, TOP); q.l(1850, TOP); q.l(1850, TOP + 40); q.l(-1750, TOP + 40); q.z(); }, '#FFFDF8', { sd: 6, hd: 3, lw: 4 });
  c.fillStyle = '#FFFDF8'; c.fillRect(-1750, TOP + 40, 3600, 360); c.strokeStyle = 'rgba(0,0,0,.08)'; c.lineWidth = 6; for (let x = -1700; x < 1850; x += 180) { c.beginPath(); c.moveTo(x, TOP + 60); c.quadraticCurveTo(x + 20, TOP + 220, x, TOP + 400); c.stroke(); }
  c.fillStyle = '#E58AAA'; for (let x = -1750; x < 1850; x += 60) { c.beginPath(); c.arc(x + 30, TOP + 400, 30, 0, Math.PI); c.fill(); }   // scalloped lace edge
  c.fillStyle = '#5A3A26'; c.fillRect(-1650, TOP + 420, 60, -TOP - 420); c.fillRect(1700, TOP + 420, 60, -TOP - 420); }
function tableTop(c, t, L, who) {
  // candles + a Victoria sponge + a jug of squash (UK birthday table)
  c.fillStyle = '#F7F2E8'; c.fillRect(-330 - 18, TOP - 210, 36, 200); c.fillRect(250 - 18, TOP - 190, 36, 180); for (const [x, y] of [[-330, TOP - 210], [250, TOP - 190]]) { c.fillStyle = '#F2C14E'; c.beginPath(); c.ellipse(x, y - 30 + Math.sin(t * 9 + x) * 3, 14, 28, 0, 0, TAU); c.fill(); }
  c.fillStyle = '#E9C88A'; rr(c, 1500 - 150, TOP - 130, 300, 60, 10); c.fill(); c.fillStyle = '#FFFFFF'; rr(c, 1500 - 150, TOP - 80, 300, 30, 6); c.fill(); c.fillStyle = '#C8283E'; c.fillRect(1500 - 150, TOP - 85, 300, 12); c.fillStyle = '#E9C88A'; rr(c, 1500 - 150, TOP - 70, 300, 60, 10); c.fill();
  c.fillStyle = 'rgba(242,140,40,.75)'; rr(c, -1640, TOP - 260, 140, 250, 20); c.fill(); c.strokeStyle = '#B9B2A8'; c.lineWidth = 5; rr(c, -1640, TOP - 260, 140, 250, 20); c.stroke();
  // plates
  plate(c, GX.prisc1, TOP - 8); salad(c, GX.prisc1, TOP - 14, 120, 40, 11);
  const gx = GX.gregs1 + gregPlateX(t, L); plate(c, gx, TOP - 8); salad(c, gx, TOP - 14, 190 * gregFill(t, L), 130 * gregFill(t, L), 13);
  plate(c, GX.higg1, TOP - 8); const hn = higgHeap(t, L); if (hn > 0) { const k = eBack(clamp((t - (L === 't4' ? ev('t4', 'heap')[hn - 1] + 0.3 : -9)) / 0.25), 2.2); const H = [0, 260, 470, 700][hn], Wd = [0, 220, 280, 320][hn], Hp = [0, 0, 260, 470][hn], Wp = [0, 0, 220, 280][hn]; salad(c, GX.higg1, TOP - 14, lerp(Wp, Wd, k), lerp(Hp, H, k), 21); }
  K.mark(c, 'plates', 0, TOP - 60, 300); }
function world(c, t, L, tag) { const who = DRAW[tag] || ALL, heads = {};
  c.drawImage(BGR, BX0, BY0, BW, BH);
  for (const k of ['theo3', 'prisc1', 'gregs1', 'higg1']) chair(c, GX[k]); chair(c, BAX, '#7A4E2E', '#F2C14E');
  tower(c, TWX, TOP - 20, towerN(t, L), t, L === 't1' ? 0.4 : 0.15);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L, tag), hostX(L, tag), 0);
  for (const k of ['theo3', 'prisc1', 'higg1']) if (who.includes(k)) heads[k] = K.put(c, CFG[k], STATE[k](t, L, tag), GX[k], 0);
  if (who.includes('gregs1')) { const a = gregTilt(t, L); c.save(); c.translate(GX.gregs1, -420); c.rotate(a); c.translate(-GX.gregs1, 420); const hd = K.put(c, GREG, gregState(t, L, tag), GX.gregs1, 0); c.restore(); heads.gregs1 = { ...hd, x: GX.gregs1 + (hd.x - GX.gregs1) * Math.cos(a) - (hd.y + 420) * Math.sin(a), y: -420 + (hd.x - GX.gregs1) * Math.sin(a) + (hd.y + 420) * Math.cos(a) }; }
  basin(c, BAX, -520, basinLevel(t, L), t);
  tableFront(c, t, L); tableTop(c, t, L, who);
  // Greg's chair complains (creak lines)
  if (L === 't3' && (who.includes('gregs1')) && ((t > SP.t3_greg.t && t < SP.t3_greg.t + 0.8) || (t > ev('t3', 'creak') && t < ev('t3', 'creak') + 0.9))) { c.save(); c.strokeStyle = '#3E471E'; c.lineWidth = 9; c.lineCap = 'round'; for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const x = GX.gregs1 + s * (330 + i * 40), y = -760 + i * 50; c.beginPath(); c.moveTo(x, y); c.lineTo(x + s * 50, y - 20 + Math.sin(t * 40 + i) * 8); c.stroke(); } c.restore(); }
  for (const k of ALL) if (!heads[k]) heads[k] = k === 'her' ? OFFL : OFF;
  return heads; }

// ---------------- the night kitchen (twist)
const passer = t => { const p = ev('end', 'pass'); let i = -1; for (let j = 0; j < p.length; j++) if (t > p[j]) i = j; return i; };   // 0 Greg, 1 Priscilla, 2 Mrs Higgins, 3 Theo
const NORDER = ['gregs1', 'prisc1', 'higg1', 'theo3'];
function nightState(k, t) { const g = G[k], cfg = CFG[k], x0 = NG[k], st = { ...standing(g, k, t), mood: 'happy', blink: 0 };
  const toB = x0 < NBX ? 1 : -1; st.turn = 0.3 * toB; st.look = 0.8 * toB;
  const i = passer(t), mine = NORDER[i] === k, u = t - (ev('end', 'pass')[i] || 0), frz = t > ev('end', 'freeze');
  st.armL = hold(g, -1, 330, 0.5); st.armR = hold(g, 1, 330, 0.5);
  const sideB = toB > 0 ? 1 : -1, aK = sideB > 0 ? 'armR' : 'armL', iK = sideB > 0 ? 'R' : 'L';
  if (mine && !frz) { const dip = u < 0.25, k2 = dip ? eOut(u / 0.25) : 1; st[aK] = dip ? reach(g, sideB, lerp(sideB * g.sw, NBX - x0 - sideB * 80, k2), lerp(g.ySh + 300, -760, k2), { planar: true }) : reach(g, sideB, sideB * g.sw * 0.45, g.ySh - 120, { planar: true }); st.items = { [iK]: spoonItem(dip ? 0 : u < 0.5) }; st.blink = dip ? 0 : 1; st.mood = 'happy'; st.headFirst = !dip; }
  if (frz) { st.mood = 'shock'; st.blink = 0; if (mine) { st[aK] = reach(g, sideB, sideB * g.sw * 0.45, g.ySh - 120, { planar: true }); st.items = { [iK]: spoonItem(0) }; st.headFirst = true; } }
  if (k === 'theo3') { st.turn = -0.35; st.look = -0.9; if (speaking('end_theo', t, 0.05, 0.3)) { st.mood = 'smug'; st.blink = 0; st.headFirst = false; st.armL = hold(g, -1, 300, 0.6); st.items = { L: spoonItem(0) }; st.armR = hold(g, 1, 330, 0.5); } }
  return st; }
function herNight(t) { const g = G.her, st = { ...standing(g, 'her', t), mood: 'skeptical', turn: -0.3, look: -0.8, blink: 0 };
  st.armL = reach(g, -1, g.sw * 0.5, g.ySh + 300, { planar: true }); st.armR = reach(g, 1, -g.sw * 0.5, g.ySh + 330, { planar: true });   // arms crossed
  if (t > ev('end', 'freeze')) { st.mood = 'annoyed'; }
  if (t > ev('end', 'moral') + 1.5) { st.mood = 'happy'; st.armR = open(g, 1, 1.4, 120); }
  return st; }
function fridge(c, t) { const x = NX - 960, op = eOut(clamp((t - ev('end', 'beat')) / 0.35));
  paint(c, q => { q.m(x - 260, 0); q.l(x + 260, 0); q.l(x + 260, -1900); q.l(x - 260, -1900); q.z(); }, '#E8ECEF', { sd: 8, hd: 3, lw: 5 });
  c.fillStyle = '#FFF6D8'; c.fillRect(x - 220, -1860, 440, 1820); c.fillStyle = '#E8DCB0'; for (const y of [-1500, -1100, -700]) c.fillRect(x - 220, y, 440, 16);
  c.fillStyle = '#E0474C'; c.fillRect(x - 160, -1580, 90, 80); c.fillStyle = '#7CC45A'; c.beginPath(); c.arc(x + 80, -1150, 50, 0, TAU); c.fill(); c.fillStyle = '#F7F2E8'; rr(c, x - 150, -1240, 110, 140, 10); c.fill();
  // the door swings open to the left
  const dw = lerp(520, 140, op); paint(c, q => { q.m(x - 260 - dw, 0); q.l(x - 260, 0); q.l(x - 260, -1900); q.l(x - 260 - dw, -1900 + 40 * op); q.z(); }, '#DCE2E6', { sd: 6, hd: 2, lw: 5 }); }
function nightWorld(c, t, tag) { const heads = {};
  c.drawImage(BGK, KX0, KY0, KW, KH); fridge(c, t);
  const only = tag === 'ntheo' ? ['theo3'] : ['prisc1', 'higg1', 'gregs1', 'theo3'];
  for (const k of only) heads[k] = K.put(c, CFG[k], nightState(k, t), NG[k], 0);
  chair(c, NBX, '#7A4E2E', '#F2C14E'); basin(c, NBX, -560, basinLevel(t, 'end'), t, { noSpoon: true });
  // darkness: only the fridge lights the room
  const fx = NX - 900, g = c.createRadialGradient(fx, -1000, 150, fx + 400, -900, 2200); g.addColorStop(0, 'rgba(255,236,170,0.08)'); g.addColorStop(0.3, 'rgba(14,20,48,0.38)'); g.addColorStop(0.7, 'rgba(10,14,36,0.72)'); g.addColorStop(1, 'rgba(8,10,28,0.84)');
  c.fillStyle = g; c.fillRect(KX0, KY0, KW, KH);
  // the hallway light behind the hostess
  c.fillStyle = 'rgba(255,214,140,.85)'; c.fillRect(NDX - 270, -2300, 540, 2300); c.fillStyle = 'rgba(255,214,140,.18)'; c.beginPath(); c.moveTo(NDX - 270, 0); c.lineTo(NDX + 270, 0); c.lineTo(NDX + 600, 300); c.lineTo(NDX - 600, 300); c.fill();
  heads.her = K.put(c, HER_N, herNight(t), NDX, 0);
  K.mark(c, 'basin', NBX, -900, 340);
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const sHY = k => G[k].headY + SEAT, fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { WIDE: S(20, fy(G.her.headY, 0.38, 1060), 0.38, 'wide'), BASIN: S(BAX + 20, -890, 1.05, 'basin'), HER: S(HPOS.wide + 20, fy(G.her.headY, 1.0), 1.0, 'her'),
  THEO: S(GX.theo3 - 60, fy(sHY('theo3'), 1.0), 1.0, 'theo3'), THEO_R: S(GX.theo3 - 60, fy(sHY('theo3'), 1.0, 1080), 1.0, 'theo3'), TWO1: S(GX.theo3 - 200, fy(G.her.headY, 0.62, 760), 0.62, 'two1'),
  PRISC: S(GX.prisc1 + 20, fy(sHY('prisc1'), 1.0), 1.0, 'prisc1'), PRISC_R: S(GX.prisc1 + 20, fy(sHY('prisc1'), 1.05, 1000), 1.05, 'prisc1'), TWO2: S((GX.prisc1 + HPOS.t2) / 2, fy(G.her.headY, 0.7, 760), 0.7, 'two2'), PALM: S(GX.prisc1 + 30, -680, 1.7, 'palm'),
  GREG: S(GX.gregs1 + 60, fy(sHY('gregs1'), 0.9), 0.9, 'gregs1'), GREG_W: S(GX.gregs1 + 60, fy(sHY('gregs1'), 0.72, 900), 0.72, 'gregs1'), TWO3: S((GX.gregs1 + HPOS.t3) / 2 - 20, fy(G.her.headY, 0.66, 760), 0.66, 'two3'),
  HIGG: S(GX.higg1 + 40, fy(sHY('higg1'), 1.0), 1.0, 'higg1'), HIGG_R: S(GX.higg1 + 60, fy(sHY('higg1'), 0.8, 1100), 0.8, 'higg1'), TWO4: S((GX.higg1 + HPOS.t4) / 2, fy(G.her.headY, 0.66, 760), 0.66, 'two4'),
  NIGHT: S(NX + 280, fy(G.gregs1.headY, 0.39, 860), 0.39, 'night'), NIGHT_G: S(NX - 60, fy(G.gregs1.headY, 0.47, 860), 0.47, 'night'), DOOR: S(NDX, fy(G.her.headY, 1.0), 1.0, 'night'), THEO_N: S(NG.theo3 - 40, fy(G.theo3.headY, 1.0), 1.0, 'ntheo') };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < hev('basin') - 0.03) return SH.WIDE; if (t < hev('guests') - 0.03) return f(SH.BASIN); return f(SH.WIDE); }
  if (L === 't1') { if (t < SP.t1_theo.t - 0.1) return f(SH.WIDE); if (t < e('serve') - 0.05) return f(SH.THEO); if (t < SP.t1_tip.t - 0.1) return f(SH.TWO1); if (t < SP.t1_nar.t - 0.05) return f(SH.THEO_R); return f(SH.TWO1); }
  if (L === 't2') { if (t < SP.t2_prisc.t - 0.1) return f(SH.WIDE); if (t < e('serve') - 0.05) return f(SH.PRISC); if (t < e('palm') - 0.03) return f(SH.TWO2); if (t < e('shock') - 0.03) return f(SH.PALM); if (t < SP.t2_nar.t - 0.05) return f(SH.PRISC_R); return f(SH.TWO2); }
  if (L === 't3') { if (t < SP.t3_greg.t - 0.1) return f(SH.WIDE); if (t < e('spoon') - 0.1) return f(SH.GREG); if (t < endOf('t3_greg') + 0.1) return f(SH.TWO3); if (t < SP.t3_nar.t - 0.05) return f(SH.GREG_W); return f(SH.GREG); }
  if (L === 't4') { if (t < SP.t4_higg.t - 0.1) return f(SH.WIDE); if (t < e('serve') - 0.05) return f(SH.HIGG); if (t < e('peek') - 0.05) return f(SH.TWO4); if (t < SP.t4_nar.t - 0.05) return f(SH.HIGG_R); if (t < e('half') - 0.03) return f(SH.TWO4); return f(SH.BASIN); }
  if (L === 'end') { if (t < e('door') - 0.03) return f(SH.NIGHT_G); if (t < SP.end_theo.t - 0.1) return f(SH.DOOR); if (t < e('freeze') - 0.03) return f(SH.THEO_N); return f(SH.NIGHT); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y);
  const heads = L === 'end' ? nightWorld(c, t, tag) : world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- overlays
function title(c, t) { const a = 1 - P(t, 2.25, 2.5); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 290); c.rotate(-0.04); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -98);
  UI.textFit(c, 'Unb9', 130, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 10, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 64, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 116); c.restore();
  if (global.__QA) global.__QA.ui(c, 'card', { x: 50, y: 110, w: 980, h: 360, k: a, id: 'title' }); }
const CHAP = { t1: ['01', 'ANOTHER', 'ГОСТЬ «ЕЩЁ ОДНУ»', '#E0474C'], t2: ['02', 'ENOUGH', 'ГОСТЬ «ХВАТИТ»', '#F2B33D'], t3: ['03', 'TOO MUCH', 'ГОСТЬ «ПЕРЕБОР»', '#4CAF6A'], t4: ['04', 'A LITTLE', 'ГОСТЬ «ЧУТЬ-ЧУТЬ»', '#8E5BD0'] };
function chapter(c, t, sc) { const p = CHAP[sc.id]; if (!p) return; const u = t - sc.s, out = P(t, sc.e - 0.15, sc.e);
  const k = eBack(P(u, 0, 0.25), 2.2) * (1 - eIn(out)); if (k <= 0) return; const big = 1 - eIO(P(u, 0.6, 0.85)), s = k * lerp(1, 1.18, big), y = 200;
  UI.font(c, 'Unb9', 76); const tw = c.measureText(p[1]).width, w = Math.min(860, tw + 230), h = 120;
  c.save(); c.translate(540, y); c.scale(s, s); c.rotate(-0.02);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -h / 2 + 9, w, h, 60); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 60); c.fill(); c.stroke();
  c.fillStyle = p[3]; c.beginPath(); c.arc(-w / 2 + 60, 0, 60, 0, TAU); c.fill(); c.stroke(); fitTxt(c, p[0], -w / 2 + 60, 4, 54, C.white, 90);
  fitTxt(c, p[1], -w / 2 + 140, 4, 76, C.oliveD, w - 175, 'Unb9', 'left');
  // small Russian type name under it
  UI.font(c, 'Unb9', 36); const tw2 = c.measureText(p[2]).width + 60; c.fillStyle = p[3]; rr(c, -tw2 / 2, h / 2 + 8, tw2, 56, 28); c.fill(); fitTxt(c, p[2], 0, h / 2 + 37, 36, C.white, tw2 - 40);
  c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w / 2 * s, y: y - 60 * s, w: w * s, h: 190 * s, k, id: 'chap_' + sc.id }); }

// ---------------- end screen: КАКОЙ ТЫ ГОСТЬ? 1-4 buttons with the type names, СОХРАНИ, ПОДПИСАТЬСЯ clicked by the cursor, then the comment question (ask)
const wAt = (id, w, fb) => K.wordT(id, w) ?? fb;
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, ask = SP.ask, { textFit, strokeText, font } = UI;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // hostess with the ladle + the basin in its party hat (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34, 2nd at local x 640)
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her; basin(c, 640, 0, 0.9, t, {}); K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0.15, look: 0.3, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 160 + Math.sin(t * 8) * 30, { planar: true }), armR: reach(g, 1, g.sw * 1.1, g.ySh + 200, { planar: true }), items: { R: ladleItem(true) } }, 0, 0); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const swap = eIO(P(t, ask.t - 0.15, ask.t + 0.15));
  const q = eBack(P(u, 0.2, 0.55), 2.2) * (1 - swap); if (q > 0) { c.save(); c.translate(540, 300); c.scale(q, q); font(c, 'Unb9', 70); strokeText(c, 'А ТЫ', 0, -50, C.oliveD, C.white, 14); strokeText(c, 'КАКОЙ ГОСТЬ?', 0, 44, C.pink, C.white, 14); c.restore(); }
  const q2 = eBack(P(t, ask.t, ask.t + 0.3), 2.2); if (q2 > 0) { c.save(); c.translate(540, 290); c.scale(q2, q2); c.rotate(-0.02);
    c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -460 + 8, -170 + 12, 920, 340, 40); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 8; rr(c, -460, -170, 920, 340, 40); c.fill(); c.stroke();
    textFit(c, 'Unb9', 80, 'КАКОЙ ТЫ ГОСТЬ?', 840); c.fillStyle = C.oliveD; c.fillText('КАКОЙ ТЫ ГОСТЬ?', 0, -80); textFit(c, 'Unb9', 96, '1, 2, 3 ИЛИ 4?', 840); strokeText(c, '1, 2, 3 ИЛИ 4?', 0, 20, C.pink, C.white, 12);
    textFit(c, 'Unb9', 44, 'ПИШИ В КОММЕНТЫ', 700); c.fillStyle = C.oliveD; c.fillText('ПИШИ В КОММЕНТЫ', 0, 110); c.restore(); }
  const tw = [0, 1, 2, 3].map(i => s + 0.3 + i * 0.22), bumpT = [wAt('ask', 'один', ask.t + 1.0), wAt('ask', 'два', ask.t + 1.6), wAt('ask', 'три', ask.t + 2.1), wAt('ask', 'четыре', ask.t + 2.7)];
  const LBL = { t1: ['ЕЩЁ ОДНУ', 'another'], t2: ['ХВАТИТ', 'enough'], t3: ['ПЕРЕБОР', 'too much'], t4: ['ЧУТЬ-ЧУТЬ', 'a little'] };
  ['t1', 't2', 't3', 't4'].forEach((id, i) => { const p = CHAP[id], kk = eBack(P(t, tw[i] - 0.1, tw[i] + 0.2), 2.2); if (kk <= 0) return; const x = 290 + (i % 2) * 420, y = 640 + Math.floor(i / 2) * 200, bump = 1 + 0.08 * Math.sin(clamp((t - bumpT[i]) / 0.4) * Math.PI);
    c.save(); c.translate(x, y); c.scale(kk * bump, kk * bump); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -195 + 8, -80 + 12, 390, 160, 36); c.fill(); c.fillStyle = p[3]; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -195, -80, 390, 160, 36); c.fill(); c.stroke();
    font(c, 'Unb9', 110); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(String(i + 1), -128, 8);
    textFit(c, 'Unb9', 36, LBL[id][0], 240); c.fillStyle = C.white; c.textAlign = 'left'; c.fillText(LBL[id][0], -70, -20); textFit(c, 'Nun9', 38, LBL[id][1], 240); c.fillText(LBL[id][1], -70, 30); c.restore(); });
  const svT = s + 0.1, sk = eBack(P(t, svT, svT + 0.3), 2.2), pulse = 1 + 0.05 * Math.sin(clamp((t - svT - 0.4) / 0.5) * Math.PI);
  if (sk > 0) { c.save(); c.translate(540, 1040); c.scale(sk * pulse, sk * pulse); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -260 + 6, -60 + 10, 520, 120, 60); c.fill(); c.fillStyle = C.gold; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -260, -60, 520, 120, 60); c.fill(); c.stroke();
    c.fillStyle = C.oliveD; c.beginPath(); c.moveTo(-190, -32); c.lineTo(-146, -32); c.lineTo(-146, 34); c.lineTo(-168, 16); c.lineTo(-190, 34); c.closePath(); c.fill();   // bookmark icon
    textFit(c, 'Unb9', 50, 'СОХРАНИ', 330); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.fillText('СОХРАНИ', 40, 4); c.restore(); }
  const subT = s + 1.25, bk = eBack(P(t, subT, subT + 0.3), 2), sy = 1230;
  if (bk > 0) { const click = P(t, subT + 0.8, subT + 0.95), pressed = t > subT + 0.9; c.save(); c.translate(560, sy); const ss = bk * (1 - 0.08 * Math.sin(click * Math.PI)); c.scale(ss, ss); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -250 + 6, -58 + 10, 500, 116, 58); c.fill(); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -250, -58, 500, 116, 58); c.fill(); textFit(c, 'Unb9', 42, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 440); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4); c.restore();
    const mv = eIO(P(t, subT + 0.2, subT + 0.8)); UI.tapCursor(c, lerp(900, 620, mv), lerp(sy + 260, sy + 20, mv), 1, P(t, subT + 0.85, subT + 1.4)); }
  if (t < ask.t - 0.1) { c.save(); c.translate(0, -60); UI.captions(c, t); c.restore(); }
  Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  c.fillStyle = L === 'end' ? '#1A2030' : '#F3E6D2'; c.fillRect(0, 0, W, HH);
  const r = drawWorld(c, t, L, cam, tag, sh), heads = r.heads, M = r.M, proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.24);
  const names = { theo3: ['THEO', '#4E7FB8'], prisc1: ['PRISCILLA', '#2E5A6E'], gregs1: ['GREG', '#6A7A3A'], higg1: ['MRS HIGGINS', '#8C7AB0'] }, onScr = {};
  for (const k in heads) { const p = proj(heads[k]); if (Math.abs(heads[k].x) < 1e4 + NX && p.x > -60 && p.x < W + 60) onScr[k] = heads[k]; }   // a speaker who is not in the shot never gets a bubble
  K.bubbles(c, t, sc, onScr, proj, { cleanChunks: true, names, hold: { hook_h: -0.05, t1_theo: -0.05, t2_prisc: -0.05, t3_greg: 0.0, t4_higg: -0.05, end_theo: -0.05 } });
  if (L === 'hook') title(c, t);
  chapter(c, t, sc);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  // the end screen wipes in from the twist
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('saladguests', NF, renderFrame);
