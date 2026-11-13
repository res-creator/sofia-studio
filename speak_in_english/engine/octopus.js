// "Заказала суп — принесли осьминога" — rubric «Полезное» (scene + 4 answers, worst -> best), hard_cut camera: node octopus.js start end out.mp4 | --png=f1,f2
// A bright lunch bistro: the heroine sits at a table; Theo the waiter (white shirt, black waistcoat, bow tie) has just served "the soup":
// a soup bowl with a WHOLE live octopus in it, one tentacle hanging over the table edge. Absurd detail: the framed «EMPLOYEE OF THE MONTH» photo
// on the wall shows the very same octopus. The chef calls from the kitchen hatch at the back.
// o1 «В ЛОБ»: "No! This not soup! Take!" -> "Not soup? He's swimming, isn't he?" Theo tops the bowl up with water; insert: the octopus swims; it squirts her.
// o2 «ВЕЖЛИВО»: "Excuse me, I'm not sure this is mine." -> "Well, he's not mine either." the octopus wraps her fork; insert: tug of war; it wins the fork.
// o3 «КАК НОСИТЕЛЬ»: "I think there's been a mix-up..." -> "Oh no, table six! Swapping it now." the octopus waves bye, clings to the table, lets go; insert: tomato soup; tip.
// o4 «КОРОЛЕВСКИЙ ОТВЕТ»: "He's very handsome, Theo, but..." (the octopus blushes) -> "...I'll take him. He likes me." it climbs onto Theo's shoulder, kisses him.
// Twist (music silent): her tomato soup arrives; the octopus on Theo's shoulder takes a spoon and quietly eats it; chef: "Don't worry, he works here. He's our taster."
// -> close-up of the Employee of the month photo; moral; end screen.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, hash, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/octopus/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];
// handovers: a negative per-line hold (bubble gone BEFORE the line ends) — ui_v2 clamps hold to >= 0.05, so shorten the bubble's span instead
{ const _bub = UI.bubble; UI.bubble = (ctx, sp, t, an, side, name) => _bub(ctx, sp.hold < 0.05 ? { ...sp, d: sp.d + sp.hold - 0.05 } : sp, t, an, side, name); }

// ---------------- cast
const HER = { ...BASE.her_restaurant };
const THEO = { ...BASE.oliver, watch: null, top: { type: 'longsleeve', col: '#FFFFFF' }, bottom: { type: 'trousers', col: '#1E1E24' } };
const CHEF = { ...BASE.del, top: { type: 'longsleeve', col: '#FFFDF8' }, bottom: { type: 'trousers', col: '#2B2F3A' } };
const G = { her: geom(HER), theo: geom(THEO), chef: geom(CHEF) };
const SEAT = 330, TOP = -500;                 // seated upper body dropped by SEAT; table top at y = TOP
const HX = -260, WX = 560, BWX = 150, OS = 1.4, BS_ = 1.3;   // + octopus / bowl scale in the world         // her seat x, Theo's feet x, the bowl on the table
const TX0 = -760, TX1 = 480;                  // table ends
const PHX = -300, PHY = -1690;                // EMPLOYEE OF THE MONTH frame (centre)
const KX0 = 1180, KX1 = 1720, KY0 = -2020, KY1 = -1330, CHX = 1450, CHY = -120, CHS = 0.9;   // kitchen hatch + chef behind it
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function waistcoat(cc, g) { const sw = g.sw, y0 = g.ySh;
  paint(cc, q => { q.m(-sw * 0.92, y0 + 14); q.l(-sw * 0.3, y0 + 14); q.l(0, y0 + 260); q.l(sw * 0.3, y0 + 14); q.l(sw * 0.92, y0 + 14); q.l(sw * 0.84, y0 + 600); q.l(-sw * 0.84, y0 + 600); q.z(); }, '#1E1E24', { sd: 10, hd: 4, lw: 4 });
  cc.fillStyle = '#C9A13A'; for (const y of [y0 + 320, y0 + 410, y0 + 500]) { cc.beginPath(); cc.arc(0, y, 9, 0, TAU); cc.fill(); }
  cc.fillStyle = '#FFFFFF'; rr(cc, sw * 0.38, y0 + 120, 70, 16, 4); cc.fill();
  cc.fillStyle = '#B0284F'; cc.beginPath(); cc.moveTo(0, y0 + 4); cc.lineTo(-58, y0 - 24); cc.lineTo(-58, y0 + 34); cc.closePath(); cc.fill(); cc.beginPath(); cc.moveTo(0, y0 + 4); cc.lineTo(58, y0 - 24); cc.lineTo(58, y0 + 34); cc.closePath(); cc.fill();
  cc.beginPath(); cc.arc(0, y0 + 4, 13, 0, TAU); cc.fill(); }
function chefCoat(cc, g) { const sw = g.sw, y0 = g.ySh; cc.fillStyle = '#E3DCCF'; for (const y of [y0 + 120, y0 + 220, y0 + 320]) for (const x of [-sw * 0.25, sw * 0.25]) { cc.beginPath(); cc.arc(x, y, 11, 0, TAU); cc.fill(); }
  cc.fillStyle = '#E0474C'; cc.beginPath(); cc.moveTo(-60, y0 + 10); cc.lineTo(60, y0 + 10); cc.lineTo(0, y0 + 80); cc.closePath(); cc.fill(); }
function chefHat(c, g, head) { const x = head.x, y = head.y - g.hh * 0.62, hw = g.hw; paint(c, q => { q.m(x - hw * 0.95, y); q.b(x - hw * 1.5, y - 170, x - hw * 0.6, y - 300, x - hw * 0.2, y - 230); q.b(x + hw * 0.1, y - 340, x + hw * 0.9, y - 280, x + hw * 0.55, y - 200); q.b(x + hw * 1.4, y - 150, x + hw * 1.0, y - 20, x + hw * 0.95, y); q.z(); }, '#FFFDF8', { sd: 8, hd: 5 }); c.fillStyle = '#EDE6DA'; c.fillRect(x - hw * 0.97, y - 30, hw * 1.94, 40); }

// ---------------- the octopus. (0,0) = body centre, R = body radius. arms: 8 specs {c1, c2, e: [x, y] relative to the base, out: drawn over the bowl front, w}
const OC = '#F07A5A', OCD = '#B9482E', OCL = '#FFC7AE';
function tent(c, p0, p1, p2, p3, w0, s = 1) {
  const N = 26, pts = [], nrm = [];
  for (let i = 0; i <= N; i++) { const u = i / N, v = 1 - u;
    const x = v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0], y = v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1];
    const dx = 3 * v * v * (p1[0] - p0[0]) + 6 * v * u * (p2[0] - p1[0]) + 3 * u * u * (p3[0] - p2[0]), dy = 3 * v * v * (p1[1] - p0[1]) + 6 * v * u * (p2[1] - p1[1]) + 3 * u * u * (p3[1] - p2[1]), l = Math.hypot(dx, dy) || 1;
    pts.push([x, y, w0 * (1 - 0.82 * u) + 2]); nrm.push([-dy / l, dx / l]); }
  c.beginPath(); pts.forEach(([x, y, w], i) => { const n = nrm[i]; i ? c.lineTo(x + n[0] * w, y + n[1] * w) : c.moveTo(x + n[0] * w, y + n[1] * w); });
  for (let i = N; i >= 0; i--) { const [x, y, w] = pts[i], n = nrm[i]; c.lineTo(x - n[0] * w, y - n[1] * w); } c.closePath();
  c.fillStyle = OC; c.fill(); c.strokeStyle = OCD; c.lineWidth = 4 * s; c.lineJoin = 'round'; c.stroke();
  const [ex, ey, ew] = pts[N]; c.fillStyle = OC; c.beginPath(); c.arc(ex, ey, ew + 1, 0, TAU); c.fill();
  c.fillStyle = OCL; for (let i = 4; i < N - 2; i += 3) { const [x, y, w] = pts[i], n = nrm[i]; c.beginPath(); c.ellipse(x - n[0] * w * 0.45, y - n[1] * w * 0.45, w * 0.32, w * 0.26, Math.atan2(n[1], n[0]), 0, TAU); c.fill(); } }
const armBase = (i, R) => [((i - 3.5) / 3.5) * R * 0.72, R * 0.62];
function octoArms(c, o, out) { const R = o.R; for (let i = 0; i < 8; i++) { const a = o.arms[i]; if (!a || !!a.out !== out) continue; const b = armBase(i, R);
  tent(c, b, [b[0] + a.c1[0], b[1] + a.c1[1]], [b[0] + a.c2[0], b[1] + a.c2[1]], [b[0] + a.e[0], b[1] + a.e[1]], (a.w || 0.2) * R, o.s || 1); if (a.item) { c.save(); c.translate(b[0] + a.e[0], b[1] + a.e[1]); a.item(c); c.restore(); } } }
function heartP(c, x, y, s, col) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.beginPath(); c.moveTo(0, 30); c.bezierCurveTo(-60, -10, -40, -60, 0, -30); c.bezierCurveTo(40, -60, 60, -10, 0, 30); c.fill(); c.restore(); }
function octoHead(c, o) { const R = o.R, m = o.mood || 'happy', lk = o.look || 0, lkY = o.lookY || 0;
  paint(c, q => { q.m(-R * 0.98, R * 0.2); q.b(-R * 1.15, -R * 1.5, R * 1.15, -R * 1.5, R * 0.98, R * 0.2); q.b(R * 0.9, R * 0.85, -R * 0.9, R * 0.85, -R * 0.98, R * 0.2); q.z(); }, OC, { sd: 8, hd: 5, lw: 4 });
  c.fillStyle = 'rgba(185,72,46,.45)'; for (const [x, y, r] of [[-0.45, -0.75, 0.13], [0.15, -0.95, 0.1], [0.55, -0.6, 0.12], [-0.1, -0.55, 0.07]]) { c.beginPath(); c.arc(x * R, y * R, r * R, 0, TAU); c.fill(); }
  c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(-R * 0.4, -R * 0.85, R * 0.22, R * 0.12, -0.5, 0, TAU); c.fill();
  const ey = R * 0.02, ex = R * 0.38;
  for (const s of [-1, 1]) { const x = s * ex;
    if (m === 'happy' || m === 'love' && o.blink) { c.strokeStyle = '#2B1A14'; c.lineWidth = R * 0.08; c.lineCap = 'round'; c.beginPath(); c.arc(x, ey + R * 0.08, R * 0.17, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); continue; }
    if (o.blink) { c.strokeStyle = '#2B1A14'; c.lineWidth = R * 0.07; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - R * 0.18, ey); c.quadraticCurveTo(x, ey + R * 0.08, x + R * 0.18, ey); c.stroke(); continue; }
    const big = m === 'shock' ? 1.18 : 1; c.fillStyle = '#FFFFFF'; c.strokeStyle = '#2B1A14'; c.lineWidth = R * 0.05; c.beginPath(); c.ellipse(x, ey, R * 0.25 * big, R * 0.3 * big, 0, 0, TAU); c.fill(); c.stroke();
    const px = x + lk * R * 0.1, py = ey + lkY * R * 0.1;
    if (m === 'love') heartP(c, px, py + R * 0.04, R * 0.006, '#E0474C');
    else { c.fillStyle = '#1A1014'; c.beginPath(); c.arc(px, py, R * (m === 'shock' ? 0.09 : 0.15), 0, TAU); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(px - R * 0.05, py - R * 0.07, R * 0.05, 0, TAU); c.fill(); }
    if (m === 'smug') { c.fillStyle = OC; c.fillRect(x - R * 0.3, ey - R * 0.34, R * 0.6, R * 0.24); c.strokeStyle = '#2B1A14'; c.lineWidth = R * 0.05; c.beginPath(); c.moveTo(x - R * 0.26, ey - R * 0.1); c.lineTo(x + R * 0.26, ey - R * 0.1); c.stroke(); } }
  if (o.blush > 0) { c.save(); c.globalAlpha = o.blush; c.fillStyle = '#FF5A8A'; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(s * R * 0.62, R * 0.32, R * 0.2, R * 0.11, 0, 0, TAU); c.fill(); } c.restore(); }
  c.strokeStyle = '#2B1A14'; c.lineWidth = R * 0.06; c.lineCap = 'round'; const my = R * 0.42;
  if (m === 'shock' || o.mouth === 'o') { c.fillStyle = '#7A2A20'; c.beginPath(); c.ellipse(0, my + R * 0.04, R * 0.1, R * 0.13, 0, 0, TAU); c.fill(); c.stroke(); }
  else if (o.mouth === 'kiss') { c.beginPath(); c.arc(-R * 0.05, my, R * 0.06, -1.2, 1.2); c.stroke(); c.beginPath(); c.arc(-R * 0.05, my + R * 0.11, R * 0.06, -1.2, 1.2); c.stroke(); }
  else if (o.mouth === 'chew') { const k = 0.5 + 0.5 * Math.sin((o.t || 0) * 14); c.fillStyle = '#7A2A20'; c.beginPath(); c.ellipse(0, my, R * 0.14, R * (0.03 + 0.06 * k), 0, 0, TAU); c.fill(); }
  else { c.beginPath(); c.arc(0, my - R * 0.1, R * 0.17, 0.35, Math.PI - 0.35); c.stroke(); } }
// default arms. mode 'bowl': six arms inside the bowl, two draped over the rim (+ overrides)
function bowlArms(t, R, ph = 0) { const A = [];
  for (let i = 0; i < 8; i++) { const sx = (i - 3.5) / 3.5, w = Math.sin(t * 2.2 + i * 1.3 + ph);
    A.push({ c1: [sx * R * 0.4, R * 0.6], c2: [sx * R * 0.9, R * 0.9], e: [sx * R * 1.1 + w * 10, R * 1.2], w: 0.2 }); }
  A[0] = { c1: [-R * 0.5, -R * 0.2], c2: [-R * 1.6, -R * 0.2 + Math.sin(t * 2) * 8], e: [-R * 1.9, R * 0.75 + Math.sin(t * 2) * 10], w: 0.2, out: true };
  A[1] = { c1: [-R * 0.3, -R * 0.05], c2: [-R * 1.0, R * 0.1], e: [-R * 1.35, R * 0.55 + Math.sin(t * 2.6) * 8], w: 0.19, out: true };
  return A; }
// free-standing (on a shoulder / swimming): arms hang and wiggle
function freeArms(t, R, sp = 1) { const A = []; for (let i = 0; i < 8; i++) { const sx = (i - 3.5) / 3.5, w = Math.sin(t * 3 * sp + i * 1.1);
  A.push({ c1: [sx * R * 0.5, R * 0.7], c2: [sx * R * 1.2 + w * 20, R * 1.2], e: [sx * R * 1.4 + w * 30, R * 1.6 + Math.cos(t * 3 * sp + i) * 15], w: 0.2, out: true }); } return A; }
function octo(c, x, y, s, o, part = 'all') { c.save(); c.translate(x, y); c.scale(s, s); o.R = o.R || 90; o.s = s;
  if (part === 'all' || part === 'in') { octoArms(c, o, false); c.save(); c.rotate(o.rot || 0); octoHead(c, o); c.restore(); }
  if (part === 'all' || part === 'out') octoArms(c, o, true);
  c.restore(); }

// ---------------- the bowl: (0,0) = base centre on the table. fill: 'broth' | 'tomato' | 'water' (level 0..1)
const BH_ = 118, BR = 175;
function bowlBack(c, x, y, s, fill, level = 0) { c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(0, 4, 120, 18, 0, 0, TAU); c.fill();
  c.fillStyle = '#E7ECF2'; c.beginPath(); c.ellipse(0, -BH_, BR, 36, 0, 0, TAU); c.fill(); c.strokeStyle = '#9AA6B4'; c.lineWidth = 4; c.stroke();
  const ly = -BH_ + 12 - level * 8, col = fill === 'tomato' ? '#E0503A' : fill === 'water' ? '#7FC8EC' : '#E9C16A';
  c.fillStyle = col; c.beginPath(); c.ellipse(0, ly, BR * 0.9, 26, 0, 0, TAU); c.fill();
  if (fill === 'tomato') { c.fillStyle = '#FFF4E0'; c.beginPath(); c.ellipse(-30, ly - 2, 46, 9, 0.2, 0, TAU); c.fill(); c.fillStyle = '#4E9E4E'; c.beginPath(); c.ellipse(40, ly - 4, 26, 10, -0.5, 0, TAU); c.fill(); }
  if (fill === 'water') { c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 4; for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(0, ly, 40 + i * 40, 8 + i * 5, 0, 0.2, 2.6); c.stroke(); } }
  c.restore(); }
function bowlFront(c, x, y, s, fill, level = 0) { c.save(); c.translate(x, y); c.scale(s, s);
  paint(c, q => { q.m(-BR, -BH_); q.b(-BR, -BH_ * 0.2, -90, 0, -70, 0); q.l(70, 0); q.b(90, 0, BR, -BH_ * 0.2, BR, -BH_); q.b(BR * 0.6, -BH_ + 36, -BR * 0.6, -BH_ + 36, -BR, -BH_); q.z(); }, '#F7F9FC', { sd: 8, hd: 4, lw: 4 });
  c.strokeStyle = '#4C8FD0'; c.lineWidth = 7; c.beginPath(); c.moveTo(-BR * 0.93, -BH_ + 30); c.bezierCurveTo(-BR * 0.6, -BH_ + 64, BR * 0.6, -BH_ + 64, BR * 0.93, -BH_ + 30); c.stroke();
  if (fill === 'water' && level > 0.95) { c.fillStyle = 'rgba(127,200,236,.85)'; for (const dx of [-150, 150]) { c.beginPath(); c.ellipse(dx, -BH_ + 40, 14, 40, 0, 0, TAU); c.fill(); } }
  c.restore(); }
function steam(c, t, x, y, k = 1, sp = 60) { if (k <= 0) return; c.save(); c.lineWidth = 12; c.lineCap = 'round'; for (let i = 0; i < 3; i++) { const u = (t * 0.8 + i / 3) % 1; c.strokeStyle = `rgba(255,255,255,${0.75 * k * (1 - u)})`; c.beginPath(); c.moveTo(x + (i - 1) * sp, y - u * 160); c.quadraticCurveTo(x + (i - 1) * sp + 30 * Math.sin(t * 3 + i), y - u * 160 - 50, x + (i - 1) * sp, y - u * 160 - 100); c.stroke(); } c.restore(); }

// ---------------- props in hands
const forkItem = ctx => { ctx.save(); ctx.rotate(0.5); ctx.strokeStyle = '#C9CED6'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 20); ctx.lineTo(0, -120); ctx.stroke(); ctx.lineWidth = 6; for (const dx of [-14, 0, 14]) { ctx.beginPath(); ctx.moveTo(dx, -120); ctx.lineTo(dx, -170); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(-14, -120); ctx.lineTo(14, -120); ctx.stroke(); ctx.restore(); };
const spoonItem = (rot = 0.4) => ctx => { ctx.save(); ctx.rotate(rot); ctx.strokeStyle = '#C9CED6'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 20); ctx.lineTo(0, -110); ctx.stroke(); ctx.fillStyle = '#D9DEE6'; ctx.beginPath(); ctx.ellipse(0, -140, 22, 32, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#9AA6B4'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); };
const carafeItem = (tilt = 0) => ctx => { ctx.save(); ctx.rotate(tilt); ctx.translate(0, -30);
  ctx.fillStyle = 'rgba(200,232,248,.75)'; ctx.strokeStyle = '#7FA8C8'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-28, -120); ctx.lineTo(28, -120); ctx.lineTo(30, -80); ctx.bezierCurveTo(80, -40, 80, 60, 50, 80); ctx.lineTo(-50, 80); ctx.bezierCurveTo(-80, 60, -80, -40, -30, -80); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(127,200,236,.8)'; ctx.beginPath(); ctx.moveTo(-62, 0); ctx.bezierCurveTo(-60, 70, 60, 70, 62, 0); ctx.closePath(); ctx.fill(); ctx.restore(); };
const trayItem = ctx => { ctx.save(); ctx.translate(0, -10); paint(ctx, q => q.e(0, 0, 170, 22), '#C9CED6', { sd: 6, hd: 3, lw: 3 }); ctx.restore(); };

// ---------------- the bistro (prerendered, softly blurred); the table, bowl, photo, hatch are live
const BX0 = -3200, BY0 = -3800, BW = 6600, BH = 5400, BS = 0.5;
function drawRoom(c) {
  c.fillStyle = '#F6E7CF'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = 'rgba(232,140,110,.18)'; for (let x = BX0; x < BX0 + BW; x += 240) c.fillRect(x, BY0, 110, BH);   // wallpaper stripes
  c.fillStyle = '#3F7A6A'; c.fillRect(BX0, -1150, BW, 900); c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 6; for (let x = BX0; x < BX0 + BW; x += 230) { c.beginPath(); c.moveTo(x, -1150); c.lineTo(x, -250); c.stroke(); }
  c.fillStyle = '#C9A06A'; c.fillRect(BX0, -1172, BW, 30);
  // windows (left) with a harbour view
  for (const x of [-2900, -1900]) { c.fillStyle = '#FFFDF8'; rr(c, x - 20, -2720, 760, 1300, 20); c.fill(); const g = c.createLinearGradient(0, -2700, 0, -1440); g.addColorStop(0, '#9FD6F0'); g.addColorStop(1, '#DCEFF8'); c.fillStyle = g; c.fillRect(x, -2700, 720, 1260);
    c.fillStyle = '#4C8FD0'; c.fillRect(x, -1800, 720, 360); c.fillStyle = 'rgba(255,255,255,.5)'; for (let i = 0; i < 6; i++) c.fillRect(x + 40 + i * 110, -1760 + (i % 2) * 60, 60, 8);
    c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(x + 420, -1800); c.lineTo(x + 520, -2050); c.lineTo(x + 520, -1800); c.fill(); c.fillStyle = '#E0474C'; c.fillRect(x + 380, -1800, 180, 30);
    c.fillStyle = '#FFFDF8'; c.fillRect(x + 345, -2700, 30, 1260); c.fillRect(x, -2080, 720, 30); }
  // chalkboard: today's soup
  c.fillStyle = '#8A5A36'; rr(c, 380, -2800, 760, 640, 18); c.fill(); c.fillStyle = '#25302A'; rr(c, 410, -2770, 700, 580, 10); c.fill();
  fitTxt(c, 'SOUP OF THE DAY', 760, -2660, 64, '#F7F2E8', 640); fitTxt(c, 'TOMATO', 760, -2520, 96, '#F2A08A', 640); c.strokeStyle = '#F7F2E8'; c.lineWidth = 5; c.beginPath(); c.moveTo(500, -2440); c.lineTo(1020, -2440); c.stroke();
  fitTxt(c, 'FISH & CHIPS', 760, -2360, 54, '#F7F2E8', 640, 'Cav7'); fitTxt(c, 'SALAD', 760, -2270, 54, '#F7F2E8', 640, 'Cav7');
  // shelf + plants
  c.fillStyle = '#8A5A36'; c.fillRect(-1050, -2140, 560, 30); for (let i = 0; i < 3; i++) { c.fillStyle = '#D9764A'; rr(c, -1010 + i * 180, -2260, 110, 120, 14); c.fill(); c.fillStyle = '#5AAE5A'; for (let k = 0; k < 5; k++) { c.beginPath(); c.ellipse(-955 + i * 180 + (k - 2) * 22, -2310 - (k % 2) * 30, 22, 60, (k - 2) * 0.35, 0, TAU); c.fill(); } }
  // far tables
  for (const x of [-2600, 2300]) { c.fillStyle = '#FFFDF8'; rr(c, x - 330, -640, 660, 40, 12); c.fill(); c.fillStyle = '#E8D9C0'; c.fillRect(x - 300, -600, 600, 330); c.fillStyle = '#8A5A36'; rr(c, x - 420, -1000, 120, 760, 30); c.fill(); rr(c, x + 300, -1000, 120, 760, 30); c.fill(); }
  // life ring decoration (seaside bistro)
  c.lineWidth = 60; for (let i = 0; i < 8; i++) { c.strokeStyle = i % 2 ? '#FFFFFF' : '#E0474C'; c.beginPath(); c.arc(2450, -2200, 190, i / 8 * TAU, (i + 1) / 8 * TAU); c.stroke(); }
  // floor
  c.fillStyle = '#D9C6A4'; c.fillRect(BX0, -250, BW, BY0 + BH + 250); c.fillStyle = 'rgba(0,0,0,.06)'; for (let y = -250; y < BY0 + BH; y += 160) for (let x = BX0 + ((Math.round((y + 250) / 160)) % 2) * 160; x < BX0 + BW; x += 320) c.fillRect(x, y, 160, 160);
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGK = mkBG(drawRoom);

// the framed «EMPLOYEE OF THE MONTH» photo — the same octopus, wearing a tiny bow tie
function photo(c, t, x = PHX, y = PHY, s = 1) { c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -180 + 12, -215 + 16, 360, 430, 14); c.fill(); c.fillStyle = '#C9A13A'; rr(c, -180, -215, 360, 430, 14); c.fill(); c.strokeStyle = '#8A6A1A'; c.lineWidth = 5; c.stroke();
  c.fillStyle = '#FFFDF8'; c.fillRect(-150, -185, 300, 300); const g = c.createLinearGradient(0, -170, 0, 100); g.addColorStop(0, '#9FD6F0'); g.addColorStop(1, '#5FA8D8'); c.fillStyle = g; c.fillRect(-140, -175, 280, 280);
  c.save(); c.beginPath(); c.rect(-140, -175, 280, 280); c.clip(); octo(c, 0, -20, 0.95, { mood: 'happy', arms: freeArms(0.4, 90, 0), t });
  c.fillStyle = '#B0284F'; c.beginPath(); c.moveTo(0, 62); c.lineTo(-34, 44); c.lineTo(-34, 80); c.closePath(); c.fill(); c.beginPath(); c.moveTo(0, 62); c.lineTo(34, 44); c.lineTo(34, 80); c.closePath(); c.fill(); c.beginPath(); c.arc(0, 62, 9, 0, TAU); c.fill(); c.restore();
  c.fillStyle = '#2B2F3A'; rr(c, -160, 125, 320, 80, 10); c.fill(); fitTxt(c, 'EMPLOYEE', 0, 148, 30, '#F2C14E', 290); fitTxt(c, 'OF THE MONTH', 0, 182, 30, '#F2C14E', 290);
  // star badge (canvas path)
  c.save(); c.translate(140, -175); c.rotate(t * 0.5); c.fillStyle = '#F2C14E'; c.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 22 : 50, a = i / 10 * TAU - Math.PI / 2; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); c.strokeStyle = '#8A6A1A'; c.lineWidth = 4; c.stroke(); c.restore();
  c.restore(); K.mark(c, 'photo', x, y, 220 * s); }
// kitchen hatch with the chef behind it
function hatch(c, t, L, drawChef) {
  c.fillStyle = '#2B2F3A'; rr(c, KX0 + 60, KY0 - 170, KX1 - KX0 - 120, 110, 16); c.fill(); fitTxt(c, 'KITCHEN', (KX0 + KX1) / 2, KY0 - 114, 60, '#F2C14E', 380);
  c.fillStyle = '#8A5A36'; rr(c, KX0 - 30, KY0 - 30, KX1 - KX0 + 60, KY1 - KY0 + 60, 14); c.fill();
  c.save(); c.beginPath(); c.rect(KX0, KY0, KX1 - KX0, KY1 - KY0); c.clip();
  c.fillStyle = '#E9EEF2'; c.fillRect(KX0, KY0, KX1 - KX0, KY1 - KY0); c.strokeStyle = 'rgba(120,140,160,.35)'; c.lineWidth = 4; for (let y = KY0; y < KY1; y += 70) { c.beginPath(); c.moveTo(KX0, y); c.lineTo(KX1, y); c.stroke(); } for (let x = KX0; x < KX1; x += 70) { c.beginPath(); c.moveTo(x, KY0); c.lineTo(x, KY1); c.stroke(); }
  c.fillStyle = '#9AA6B4'; for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(KX0 + 80 + i * 130, KY0 + 90, 34, 0, TAU); c.fill(); }
  steam(c, t, KX0 + 120, KY1 - 40, 0.8, 50);
  if (drawChef) { const st = chefState(t, L); var hd = K.put(c, CHEF, st, CHX, CHY, CHS); }
  c.restore();
  c.fillStyle = '#C9A06A'; c.fillRect(KX0 - 40, KY1 - 10, KX1 - KX0 + 80, 40);
  c.fillStyle = '#C9A13A'; c.beginPath(); c.arc(KX1 - 90, KY1 - 30, 34, Math.PI, TAU); c.fill(); c.fillRect(KX1 - 130, KY1 - 32, 80, 10);
  return hd; }
function chefState(t, L) { const g = G.chef, st = { t, talk: talk('chef1', t), mood: 'happy', turn: -0.2, look: -0.7, armL: reach(g, -1, -g.sw * 1.1, g.ySh + 420, { planar: true }), armR: reach(g, 1, g.sw * 1.1, g.ySh + 420, { planar: true }), items: {}, afterTorso: cc => chefCoat(cc, g), front: (cc, gg) => chefHat(cc, g, gg.head) };
  if (speaking('end_c', t, 0.05, 0.2)) { const u = (t - SP.end_c.t) * 4.5; st.armL = reach(g, -1, -g.sw * 1.7 + Math.sin(u) * 20, g.ySh + 120 + Math.cos(u) * 20, { planar: true }); st.mood = 'happy'; }
  if (t > endOf('end_c') + 0.1) { st.mood = 'happy'; st.blink = 1; }
  return st; }

// ---------------- the table and what is on it
function chair(c, x) { c.fillStyle = '#7A4E2E'; rr(c, x - 170, -1100, 340, 620, 50); c.fill(); c.fillStyle = '#E8B04A'; rr(c, x - 140, -1070, 280, 560, 40); c.fill(); c.fillStyle = 'rgba(255,255,255,.12)'; rr(c, x - 120, -1050, 90, 520, 30); c.fill(); }
function tableFront(c) {
  c.fillStyle = 'rgba(0,0,0,.22)'; c.fillRect(TX0 - 20, -20, TX1 - TX0 + 40, 40);
  paint(c, q => { q.m(TX0 + 30, TOP); q.l(TX1 - 30, TOP); q.l(TX1, -10); q.l(TX0, -10); q.z(); }, '#FFFDF8', { sd: 6, hd: 3, lw: 4, inner: k => { k.fillStyle = 'rgba(224,71,76,.75)'; for (let x = TX0; x < TX1; x += 100) for (let y = TOP + 20; y < -10; y += 100) if (((x - TX0) / 100 + (y - TOP - 20) / 100) % 2 < 1) k.fillRect(x, y, 100, 100); } });
  paint(c, q => { q.m(TX0 - 10, TOP - 40); q.l(TX1 + 10, TOP - 40); q.l(TX1 - 20, TOP + 12); q.l(TX0 + 20, TOP + 12); q.z(); }, '#F4EAD8', { sd: 4, hd: 2, lw: 4 }); }
// water glass + napkin + salt on the table (her side)
function tableProps(c) { c.fillStyle = 'rgba(220,235,245,.6)'; rr(c, TX0 + 130, TOP - 150, 80, 130, 10); c.fill(); c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 3; c.stroke(); c.fillStyle = 'rgba(127,200,236,.55)'; c.fillRect(TX0 + 136, TOP - 90, 68, 64);
  c.fillStyle = '#FFFFFF'; rr(c, TX0 + 260, TOP - 60, 30, 46, 8); c.fill(); c.fillStyle = '#9AA6B4'; c.fillRect(TX0 + 262, TOP - 66, 26, 10); }

// what's in the bowl at time t
function bowlState(t, L) {
  const st = { fill: 'broth', level: 0, octo: true, x: BWX, y: TOP - 14, s: BS_ };
  if (L === 'o1' && t > ev('o1', 'pour')) { st.fill = 'water'; st.level = clamp((t - ev('o1', 'pour')) / 1.0); }
  if (L === 'o3') { const a = ev('o3', 'lift'), b = ev('o3', 'let'); if (t > a) { const k = eIO(clamp((t - a) / 0.5)); st.x = lerp(BWX, WX - 260, k); st.y = lerp(TOP - 14, -1000, k); }
    if (t > b) { const k = eIn(clamp((t - b) / 0.5)); st.x = lerp(WX - 260, 1900, k); }
    if (t > ev('o3', 'soup') - 0.05) { st.x = BWX; st.y = TOP - 14; st.fill = 'tomato'; st.octo = false; } }
  if (L === 'o4' && t > ev('o4', 'climb')) st.octo = false;
  if (L === 'end') { st.octo = false; st.fill = 'tomato'; st.level = 0; if (t < ev('end', 'soup') + 0.3) { const k = eOut(clamp((t - ev('end', 'soup')) / 0.3)); st.y = lerp(TOP - 300, TOP - 14, k); }
    if (t > ev('end', 'slurp') + 0.8) st.level = -1.5; }
  return st; }
// octopus pose in / out of the bowl
function octoState(t, L, heads) {
  const o = { mood: 'happy', look: 0, lookY: 0, blush: 0, t, R: 88, arms: bowlArms(t, 88), blink: Math.sin(t * 1.3) > 0.985 ? 1 : 0, mouth: null };
  const A = o.arms, R = 88, bs = bowlState(t, L), cx = bs.x, cy = bs.y - BH_ * bs.s - 46 * OS;
  o.x = cx; o.y = cy + Math.sin(t * 2.5) * 4; o.s = OS;
  // the tentacle hanging over the table edge toward the camera (always, while in the bowl on the table)
  const onTable = bs.y > TOP - 60 && Math.abs(bs.x - BWX) < 5;
  if (onTable) A[7] = { c1: [R * 0.9, R * 0.9], c2: [R * 1.4, R * 2.0], e: [R * 1.6 + Math.sin(t * 1.8) * 14, (-60 - o.y) / OS - R * 0.62 + Math.sin(t * 2.2) * 10], w: 0.2, out: true };
  if (L === 'hook') { o.mood = 'happy'; o.look = -0.8;
    if (t > hev('wave') && t < hev('wave') + 1.1) { const u = t - hev('wave'); A[6] = { c1: [R * 0.5, -R * 0.6], c2: [R * 0.9, -R * 1.4], e: [R * 0.6 + Math.sin(u * 14) * 40, -R * 2.0], w: 0.18, out: true }; }
    if (t > hev('octo') - 0.05) { o.mood = 'love'; o.look = -0.5; A[6] = { c1: [R * 0.5, -R * 0.6], c2: [R * 0.9, -R * 1.4], e: [R * 0.6 + Math.sin(t * 12) * 40, -R * 2.0], w: 0.18, out: true }; }
    if (t > hev('wide')) { o.mood = 'happy'; } }
  if (L === 'o1') { o.look = -0.8; o.mood = 'happy';
    if (speaking('o1_h', t, 0, 0.1)) { o.mood = 'shock'; o.look = -0.9; }
    if (t > SP.o1_w.t) { o.mood = 'smug'; }
    if (t > ev('o1', 'pour')) { const k = clamp((t - ev('o1', 'pour')) / 1.0); o.y -= 18 * k; o.mood = 'happy'; A[2] = { c1: [-R * 0.2, -R * 0.5], c2: [-R * 0.5, -R * 1.2], e: [-R * 0.2 + Math.sin(t * 9) * 30, -R * 1.6], w: 0.18, out: true }; A[5] = { c1: [R * 0.2, -R * 0.5], c2: [R * 0.5, -R * 1.2], e: [R * 0.2 + Math.sin(t * 9 + 2) * 30, -R * 1.6], w: 0.18, out: true }; }
    if (t > ev('o1', 'squirt') - 0.15) { o.mood = 'smug'; o.mouth = 'o'; o.look = -1; } }
  if (L === 'o2') { o.look = -0.8;
    if (speaking('o2_h', t, 0, 0.1)) { o.mood = 'smug'; o.lookY = -0.3; }
    if (t > ev('o2', 'grab') && heads && heads.fork) { const f = heads.fork, tug = t > ev('o2', 'back') ? 1 : 0;
      const fx = (f.x - cx) / OS, fy_ = (f.y - o.y) / OS; A[1] = { c1: [-R * 0.6, -R * 0.3], c2: [fx * 0.6, fy_ * 0.6 - 60], e: [fx - armBase(1, R)[0], fy_ - armBase(1, R)[1]], w: 0.2, out: true };
      o.mood = tug ? 'happy' : 'smug'; }
    if (t > ev('o2', 'yank')) o.mood = 'happy'; }
  if (L === 'o3') { o.look = -0.8;
    if (speaking('o3_h', t, 0, 0.1)) { o.mood = 'shock'; }
    if (t > SP.o3_w.t) o.mood = 'sad';
    if (t > ev('o3', 'bye')) { o.mood = 'sad'; o.look = -1; A[6] = { c1: [R * 0.5, -R * 0.6], c2: [R * 0.9, -R * 1.4], e: [R * 0.5 + Math.sin(t * 12) * 40, -R * 2.0], w: 0.18, out: true }; }
    if (t > ev('o3', 'cling') && t < ev('o3', 'let')) { o.mood = 'shock'; const ex = (TX1 - 60 - cx) / OS, ey = (TOP - 6 - o.y) / OS; A[0] = { c1: [-R * 0.8, R * 0.4], c2: [ex * 0.7, ey * 0.7], e: [ex - armBase(0, R)[0], ey - armBase(0, R)[1]], w: 0.16, out: true }; }
    if (t > ev('o3', 'let')) { o.mood = 'happy'; } }
  if (L === 'o4') { o.look = -0.8; o.mood = 'happy';
    if (t > ev('o4', 'blush') - 0.05) { o.mood = 'love'; o.blush = clamp((t - ev('o4', 'blush')) / 0.3); }
    if (t > endOf('o4_h')) { o.look = 0.8; }
    if (t > ev('o4', 'climb') && heads && heads.theo) { const k = eIO(clamp((t - ev('o4', 'climb')) / 1.1)), sx = heads.theo.x - 240, sy = heads.theo.y + 250;
      o.x = lerp(cx, sx, k); o.y = lerp(cy, sy, k) - Math.sin(k * Math.PI) * 160; o.s = lerp(OS, 0.9, k); o.arms = freeArms(t, R, 2.5); o.look = 0.8; o.mood = 'love'; o.blush = 1;
      if (k >= 1) { o.arms = shoulderArms(t, R); } }
    if (t > ev('o4', 'kiss') && heads && heads.theo) { o.mouth = 'kiss'; o.mood = 'love'; o.rot = 0.15; } }
  if (L === 'end' && heads && heads.theo) { o.x = heads.theo.x - 240; o.y = heads.theo.y + 250; o.s = 0.9; o.arms = shoulderArms(t, R); o.look = -0.6; o.mood = 'happy'; o.blush = 0.6;
    const e = k => ev('end', k), soup = heads.soup;
    if (t > e('spoon') && t < e('pat') && soup) { const u = t - e('spoon'), dip = t > e('slurp') ? (Math.sin((t - e('slurp')) * 7) > 0 ? 1 : 0) : 0;
      const tx = (soup.x - o.x) / o.s, ty = (soup.y - 40 - o.y) / o.s, mx = -R * 0.2, my = R * 0.5, k = eOut(clamp(u / 0.4));
      const ex = dip ? lerp(mx, tx, 0.05) : lerp(mx, tx, k), ey = dip ? my : lerp(my, ty, k);
      o.arms[1] = { c1: [-R * 1.2, R * 0.6], c2: [ex * 0.6 - 60, ey * 0.6], e: [ex - armBase(1, R)[0], ey - armBase(1, R)[1]], w: 0.18, out: true, item: spoonItem(dip ? 2.6 : 3.3) };
      o.look = -1; o.lookY = 0.8; o.mood = 'smug'; if (dip) { o.mouth = 'chew'; o.mood = 'happy'; o.lookY = 0; } }
    if (t > e('pat')) { o.mood = 'happy'; o.mouth = null; o.arms[3] = { c1: [-R * 0.5, -R * 0.2], c2: [-R * 0.4, -R * 0.4 + Math.sin(t * 10) * 10], e: [-R * 0.2, -R * 0.4 + Math.sin(t * 10) * 15], w: 0.18, out: true }; }
    if (t > e('photo')) { o.blink = 1; } }
  return o; }
// on Theo's shoulder: two arms around his neck, the rest dangling over his chest/back
function shoulderArms(t, R) { const A = freeArms(t, R, 1.2); A[6] = { c1: [R * 0.8, -R * 0.1], c2: [R * 1.8, -R * 0.2], e: [R * 2.2, R * 0.3], w: 0.18, out: true }; A[7] = { c1: [R * 0.9, R * 0.4], c2: [R * 1.9, R * 0.6], e: [R * 2.3, R * 1.0], w: 0.18, out: true }; return A; }

// ---------------- characters
const toW = (g, s, x0, wx, wy, drop, o = { planar: true }) => reach(g, s, wx - x0, wy - drop, o);
const onTableArm = (g, s) => reach(g, s, s * g.sw * 0.75, g.ySh + 335, { planar: true });
const hang = (g, s) => reach(g, s, s * g.sw * 0.8, g.ySh + 330);
const open = (g, s, k = 1.7, dy = 90) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const forehead = (g, s = 1) => reach(g, s, s * g.hw * 0.25, g.headY - g.hh * 0.35, { planar: true });
const gest = (st, g, who, t, side, base_) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base_ + Math.cos(u) * 20, { planar: true }); } };
// her fork: world position of the hand (o2/o4) so the tentacle can wrap it
function herFork(t, L) {
  if (L === 'o2') { const e = k => ev('o2', k); if (t < e('grab') - 0.6) return null;
    let x = BWX - 260, y = -760; if (t > e('grab') - 0.6 && t < e('grab')) { const k = eOut(clamp((t - e('grab') + 0.6) / 0.4)); x = lerp(HX + 120, BWX - 260, k); y = lerp(-640, -760, k); }
    if (t > e('back')) { const u = t - e('back'); x = BWX - 320 - 60 * Math.abs(Math.sin(u * 8)) * (t < e('yank') ? 1 : 0); }
    return { x, y, held: t < e('yank') }; }
  if (L === 'o4') { if (t > ev('o4', 'climb') - 0.2) return null; const k = t > ev('o4', 'fork') - 0.1 ? 1 : 0; return { x: BWX - 280 - 40 * k * Math.abs(Math.sin(t * 6)), y: -770, held: true }; }
  return null; }
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { t, talk: talk('her', t), mood: 'neutral', turn: 0.3, look: 0.7, legPose: 'sit', drop: SEAT, legs: false, armL: onTableArm(g, -1), armR: onTableArm(g, 1), items: {} };
  const fk = herFork(t, L); if (fk && fk.held) st.armR = toW(g, 1, HX, fk.x, fk.y + 20, SEAT);
  if (L === 'hook') { st.mood = 'shock'; st.blink = 0; st.look = 0.8; st.lookY = 0.4; st.armL = open(g, -1, 1.5, 220); st.armR = open(g, 1, 1.3, 260);
    if (t > hev('her') - 0.05) { st.mood = 'shock'; st.headFirst = true; st.armL = reach(g, -1, -g.hw * 0.9, g.headY + g.hh * 0.6, { planar: true }); st.armR = reach(g, 1, g.hw * 0.9, g.headY + g.hh * 0.6, { planar: true }); }
    if (t > hev('wide')) { st.headFirst = false; st.mood = 'worried'; st.armL = onTableArm(g, -1); st.armR = open(g, 1, 1.5, 230); } }
  if (L === 'o1') { st.mood = 'neutral';
    if (speaking('o1_h', t, 0.05, 0.15)) { st.mood = 'angry'; const u = t - SP.o1_h.t; st.armR = toW(g, 1, HX, BWX - 150 + Math.sin(u * 6) * 30, -760, SEAT); st.armL = open(g, -1, 1.6, 120 + Math.sin(u * 6) * 20); st.look = 0.9; }
    if (t > SP.o1_w.t) { st.mood = 'surprised'; st.blink = 0; st.armL = onTableArm(g, -1); st.armR = onTableArm(g, 1); }
    if (t > e('pour') + 0.3) { st.mood = 'shock'; st.lookY = 0.4; }
    if (t > e('squirt')) { st.mood = 'tired'; st.blink = 1; st.lookY = 0; st.look = 0.3; st.armL = open(g, -1, 1.6, 150); st.armR = open(g, 1, 1.6, 150); } }
  if (L === 'o2') { st.mood = 'neutral';
    if (speaking('o2_h', t, 0.05, 0.15)) { st.mood = 'worried'; st.tilt = 0.06; st.armL = open(g, -1, 1.3, 230); }
    if (t > SP.o2_w.t) { st.mood = 'surprised'; st.tilt = 0; }
    if (t > e('grab')) { st.mood = 'shock'; st.blink = 0; st.lookY = 0.3; }
    if (t > e('back')) { st.mood = 'angry'; st.armL = toW(g, -1, HX, (fk ? fk.x : BWX) - 120, -740, SEAT); st.lookY = 0.2; }
    if (t > e('yank')) { st.mood = 'shock'; st.armL = open(g, -1, 1.8, 40); st.armR = open(g, 1, 1.8, 40); st.tilt = -0.08; } }
  if (L === 'o3') { st.mood = 'neutral';
    if (speaking('o3_h', t, 0.05, 0.15)) { st.mood = 'happy'; gest(st, g, 'her', t, -1, 150); }
    if (t > SP.o3_w.t) { st.mood = 'happy'; }
    if (t > e('cling')) { st.mood = 'surprised'; st.blink = 0; st.look = 1; }
    if (t > e('back') - 0.1) { st.mood = 'happy'; st.laugh = true; st.blink = 1; st.armR = toW(g, 1, HX, BWX - 140, -720, SEAT); st.items = { R: spoonItem(0.9) }; st.armL = open(g, -1, 1.6, 120); } }
  if (L === 'o4') { st.mood = 'happy';
    if (speaking('o4_h', t, 0.05, 0.1)) { st.mood = 'happy'; st.tilt = 0.05 * Math.sin(t * 2); st.armL = open(g, -1, 1.5, 200 + Math.sin(t * 4) * 20); }
    if (t > endOf('o4_h') + 0.05) { st.mood = 'smug'; st.blink = 1; }
    if (t > e('climb')) { st.mood = 'surprised'; st.blink = 0; st.look = 1; st.armR = onTableArm(g, 1); }
    if (t > e('kiss')) { st.mood = 'happy'; st.laugh = true; st.blink = 1; } }
  if (L === 'end') { const e2 = k => ev('end', k); st.mood = 'happy'; st.armR = toW(g, 1, HX, BWX - 150, -720, SEAT); st.items = { R: spoonItem(0.9) };
    if (t > e2('spoon') + 0.2) { st.mood = 'surprised'; st.blink = 0; st.look = 0.6; st.lookY = 0.3; }
    if (t > e2('shock')) { st.mood = 'shock'; st.lookY = 0; st.look = 0.9; st.armL = open(g, -1, 1.8, 60); }
    if (t > SP.end_c.t) { st.mood = 'surprised'; st.look = 1; st.lookY = -0.4; }
    if (t > e2('wide')) { st.mood = 'happy'; st.laugh = true; st.armL = open(g, -1, 1.9, 0 + Math.sin(t * 8) * 25); st.armR = open(g, 1, 1.9, 0 + Math.sin(t * 8 + 1) * 25); st.items = {}; }
    if (t > e2('moral')) { st.laugh = false; } }
  return st; }
const theoX = (t, L) => { if (L === 'o3') { const a = ev('o3', 'let'), b = ev('o3', 'soup'); if (t > a && t < b) return lerp(WX, 1900, eIn(clamp((t - a) / 0.5))); } return WX; };
function theoState(t, L) { const g = G.theo, e = k => ev(L, k), st = { t, talk: talk('waiter3', t), mood: 'happy', turn: -0.3, look: -0.8, armL: hang(g, -1), armR: hang(g, 1), items: {}, afterTorso: cc => waistcoat(cc, g) };
  const X = theoX(t, L), tw = (wx, wy) => reach(g, -1, wx - X, wy, { planar: true }), twR = (wx, wy) => reach(g, 1, wx - X, wy, { planar: true });
  if (L === 'hook') { st.mood = 'happy'; st.armL = open(g, -1, 1.9, 200); st.armR = reach(g, 1, g.sw * 1.0, g.ySh + 300, { planar: true }); st.items = { R: trayItem };
    if (speaking('hook_w', t, 0.05, 0.1)) gest(st, g, 'waiter3', t, -1, 200);
    if (t > endOf('hook_w') + 0.1) { st.mood = 'smug'; st.blink = 1; } }
  if (L === 'o1') { st.mood = 'neutral';
    if (speaking('o1_h', t, 0.05, 0.1)) { st.mood = 'surprised'; st.blink = 0; }
    if (speaking('o1_w', t, 0.05, 0.1)) { st.mood = 'happy'; gest(st, g, 'waiter3', t, -1, 180); st.items = { R: carafeItem(0) }; st.armR = reach(g, 1, g.sw * 1.0, g.ySh + 320, { planar: true }); }
    if (t > e('pour') - 0.15) { const tilt = eOut(clamp((t - e('pour') + 0.15) / 0.3)) * (t < e('pour') + 1.05 ? 1 : 0.2); st.mood = 'happy'; st.blink = 1; st.armL = tw(BWX + 150, -1000); st.items = { L: carafeItem(-1.3 * tilt) }; st.armR = hang(g, 1); }
    if (t > e('pour') + 1.1) { st.blink = 0; st.mood = 'smug'; }
    if (t > e('squirt')) { st.mood = 'surprised'; st.armL = hang(g, -1); st.items = {}; } }
  if (L === 'o2') { st.mood = 'neutral';
    if (speaking('o2_h', t, 0.05, 0.1)) { st.mood = 'skeptical'; st.lookY = 0.3; }
    if (speaking('o2_w', t, 0.05, 0.1)) { st.mood = 'neutral'; st.lookY = 0; st.armL = open(g, -1, 1.8, 180); st.armR = open(g, 1, 1.8, 180); }
    if (t > e('grab')) { st.mood = 'smug'; st.blink = 1; st.armL = hang(g, -1); st.armR = hang(g, 1); } }
  if (L === 'o3') { st.mood = 'neutral';
    if (speaking('o3_h', t, 0.05, 0.1)) { st.mood = 'surprised'; st.blink = 0; }
    if (speaking('o3_w', t, 0.05, 0.1)) { st.mood = 'worried'; gest(st, g, 'waiter3', t, 1, 160); }
    if (t > e('lift') - 0.1 && t < e('soup') - 0.05) { const b = bowlState(t, L); st.mood = 'worried'; st.armL = tw(b.x - 120, b.y - 60); st.armR = twR(b.x + 120, b.y - 60); st.look = -0.6; st.lookY = 0.5; }
    if (t > e('cling') && t < e('let')) { st.mood = 'angry'; st.turn = 0.3; }
    if (t > e('let')) { st.mood = 'happy'; st.turn = 0.4; st.legPose = 'walk'; }
    if (t > e('soup')) { st.legPose = undefined; st.turn = -0.3; st.mood = 'happy'; st.armL = hang(g, -1); st.armR = hang(g, 1); } }
  if (L === 'o4') { st.mood = 'neutral';
    if (speaking('o4_h', t, 0.05, 0.1)) { st.mood = t > ev('o4', 'blush') ? 'happy' : 'surprised'; st.blink = 0; }
    if (t > endOf('o4_h') - 0.1) { st.mood = 'happy'; st.blink = 1; st.armR = reach(g, 1, g.sw * 0.25, g.ySh + 210, { planar: true }); st.headY = 8; }
    if (t > e('climb') - 0.1) { st.headY = 0; st.mood = 'happy'; st.blink = 0; st.armL = tw(BWX + 120, -820); st.armR = hang(g, 1); }
    if (t > e('climb') + 1.0) { st.armL = reach(g, -1, -g.sw * 0.6, g.ySh + 120, { planar: true }); st.mood = 'happy'; }
    if (t > e('kiss')) { st.mood = 'happy'; st.laugh = true; st.blink = 1; } }
  if (L === 'end') { const e2 = k => ev('end', k); st.mood = 'happy'; st.armL = reach(g, -1, -g.sw * 0.6, g.ySh + 120, { planar: true });
    if (t < e2('soup') + 0.4) { st.armR = hang(g, 1); st.armL = tw(BWX + 60, TOP - 200); }
    if (t > e2('spoon')) { st.mood = 'neutral'; st.look = -0.9; st.lookY = 0.4; }
    if (t > e2('shock')) { st.mood = 'surprised'; st.blink = 0; }
    if (t > SP.end_c.t) { st.mood = 'happy'; st.look = 0.9; st.turn = 0.3; }
    if (t > e2('wide')) { st.mood = 'happy'; st.laugh = true; st.blink = 1; } }
  return st; }

// ---------------- world + which characters each shot draws
const DRAW = { wide: ['her', 'theo', 'chef'], cover: ['her', 'theo'], two: ['her', 'theo'], her: ['her'], herb: ['her'], theo: ['theo'], octo: [], chef: ['chef'], photo: [] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGK, BX0, BY0, BW, BH);
  const ch = hatch(c, t, L, who.includes('chef')); if (ch) heads.chef1 = ch;
  photo(c, t);
  chair(c, HX);
  let theoHead = null; const theoHere = !(L === 'o3' && theoX(t, L) > 1850);
  // Theo's head position is needed for the octopus even when he is not in the shot
  const thG = G.theo; theoHead = { x: theoX(t, L), y: G.theo.headY, hh: thG.hh };
  if (who.includes('theo') && theoHere) { heads.waiter3 = K.put(c, THEO, theoState(t, L), theoX(t, L), 0); theoHead = heads.waiter3; }
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), HX, 0);
  tableFront(c); tableProps(c);
  const bs = bowlState(t, L), fk = herFork(t, L);
  const os = octoState(t, L, { theo: theoHead, fork: fk, soup: { x: BWX, y: TOP - 14 - BH_ * BS_ } });
  bowlBack(c, bs.x, bs.y, bs.s, bs.fill, bs.level);
  if (bs.octo) octo(c, os.x, os.y, os.s, os, 'in');
  bowlFront(c, bs.x, bs.y, bs.s, bs.fill, bs.level);
  if (bs.fill === 'tomato' && bs.level > -1) steam(c, t, bs.x, bs.y - BH_ * bs.s - 40, 0.8);
  // the fork lying in the tentacle after o2's yank / during the tug
  if (fk) { c.save(); c.translate(fk.x, fk.y); forkItem(c); c.restore(); }
  else if (L === 'o2' && t > ev('o2', 'yank')) { c.save(); c.translate(os.x + 40, os.y - 150); c.rotate(-0.3 + Math.sin(t * 5) * 0.2); forkItem(c); c.restore(); }
  if (bs.octo) octo(c, os.x, os.y, os.s, os, 'out');
  else if (!bs.octo && (L === 'o4' && t > ev('o4', 'climb') || L === 'end')) octo(c, os.x, os.y, os.s, os, 'all');
  K.mark(c, 'octopus', os.x, os.y, 200);
  // o1: the water stream from the carafe + the squirt into her face
  if (L === 'o1') { const p = ev('o1', 'pour'); if (t > p && t < p + 1.05 && heads.waiter3) { c.save(); c.strokeStyle = 'rgba(127,200,236,.9)'; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(BWX + 60, -1080); c.quadraticCurveTo(BWX + 40, -900, BWX + 20, -700); c.stroke(); c.restore(); }
    const sq = ev('o1', 'squirt'); if (t > sq && t < sq + 0.5) { const u = (t - sq) / 0.5, hx = HX + 10, hy = G.her.headY + SEAT + 20; c.save(); c.strokeStyle = 'rgba(127,200,236,.95)'; c.lineWidth = 22; c.lineCap = 'round'; c.beginPath(); c.moveTo(os.x - 20, os.y + 30); c.quadraticCurveTo(lerp(os.x, hx, 0.5), os.y - 300, lerp(os.x, hx, Math.min(1, u * 2)), lerp(os.y, hy, Math.min(1, u * 2))); c.stroke(); c.restore(); }
    if (t > sq + 0.2 && heads.her) drips(c, heads.her, t, 1); }
  if (L === 'o4' && t > ev('o4', 'kiss') && t < ev('o4', 'kiss') + 1.6) { const u = t - ev('o4', 'kiss'); for (let i = 0; i < 3; i++) { const v = (u * 0.8 + i / 3) % 1; c.save(); c.globalAlpha = 1 - v; heartP(c, os.x + 80 + (i - 1) * 70, os.y - 120 - v * 220, 1.2, '#EE5E9A'); c.restore(); } }
  if (L === 'o4' && t > ev('o4', 'blush') && t < ev('o4', 'climb') && bs.octo) { const u = t - ev('o4', 'blush'); for (let i = 0; i < 2; i++) { const v = (u * 0.6 + i / 2) % 1; c.save(); c.globalAlpha = (1 - v) * 0.9; heartP(c, os.x + (i ? 90 : -90), os.y - 130 - v * 160, 0.9, '#EE5E9A'); c.restore(); } }
  if (!heads.her) heads.her = OFFL; if (!heads.waiter3) heads.waiter3 = OFF; if (!heads.chef1) heads.chef1 = OFF;
  return heads; }
function drips(c, hd, t, k) { c.save(); c.globalAlpha = k; for (let i = 0; i < 5; i++) { const u = ((t * 1.2 + i * 0.21) % 1), x = hd.x + (i - 2) * hd.hh * 0.45, y = hd.y - hd.hh * 0.6 + u * hd.hh * 1.6;
  c.fillStyle = '#7CC7F2'; c.strokeStyle = '#2E7AB0'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - 22); c.quadraticCurveTo(x + 14, y + 4, x, y + 10); c.quadraticCurveTo(x - 14, y + 4, x, y - 22); c.fill(); c.stroke(); } c.restore(); }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const hHY = G.her.headY + SEAT, tHY = G.theo.headY, cHY = CHY + G.chef.headY * CHS;
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const OCY = TOP - 14 - BH_ * BS_ - 46 * OS;
const SH = { COVER: S(150, fy(hHY, 0.75, 1200), 0.75, 'cover'), WIDE: S(160, fy(hHY, 0.62, 1000), 0.62, 'wide'),
  TWO: S(160, fy(hHY, 0.72, 900), 0.72, 'two'),
  HER: S(HX + 40, fy(hHY, 1.0, 860), 1.0, 'her'), HER_R: S(HX + 120, fy(hHY, 0.95, 760), 0.95, 'her'), HER_CU: S(HX - 40, fy(hHY, 1.35, 860), 1.35, 'her'), HERB: S(-60, fy(hHY, 0.9, 760), 0.9, 'herb'),
  THEO: S(WX - 60, fy(tHY, 0.95, 820), 0.95, 'theo'), THEO_CU: S(WX - 20, fy(tHY, 1.3, 860), 1.3, 'theo'),
  OCTO: S(BWX, OCY - 40, 1.35, 'octo'), CHEF: S(CHX - 40, fy(cHY, 1.2, 900), 1.2, 'chef'), PHOTO: S(PHX, PHY + 20, 2.3, 'photo'),
  SWIM: U('swim', 1), FORK: U('fork', 2), SOUP: U('soup', 3) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < hev('her') - 0.02) return SH.COVER; if (t < hev('octo') - 0.03) return f(SH.HER_CU); if (t < hev('wide') - 0.03) return f(SH.OCTO); return f(SH.WIDE); }
  if (L === 'o1') { if (t < SP.o1_h.t - 0.1) return f(SH.WIDE); if (t < SP.o1_w.t - 0.1) return f(SH.HER); if (t < e('pour') - 0.05) return f(SH.THEO); if (t < e('swim') - 0.02) return f(SH.TWO); if (t < e('back') - 0.02) return f(SH.SWIM); return f(SH.HER_R); }
  if (L === 'o2') { if (t < SP.o2_h.t - 0.1) return f(SH.WIDE); if (t < SP.o2_w.t - 0.1) return f(SH.HER); if (t < e('grab') - 0.05) return f(SH.THEO); if (t < e('tug') - 0.02) return f(SH.HERB); if (t < e('back') - 0.02) return f(SH.FORK); return f(SH.HERB); }
  if (L === 'o3') { if (t < SP.o3_h.t - 0.1) return f(SH.WIDE); if (t < SP.o3_w.t - 0.1) return f(SH.HER); if (t < e('lift') - 0.05) return f(SH.THEO); if (t < e('soup') - 0.02) return f(SH.TWO); if (t < e('back') - 0.02) return f(SH.SOUP); return f(SH.HER_R); }
  if (L === 'o4') { if (t < SP.o4_h.t - 0.1) return f(SH.WIDE); if (t < endOf('o4_h') + 0.05) return f(SH.HERB); if (t < e('climb') - 0.05) return f(SH.THEO_CU); if (t < e('hug') - 0.02) return f(SH.TWO); return f(SH.THEO); }
  if (L === 'end') { if (t < e('shock') - 0.02) return f(SH.TWO); if (t < SP.end_c.t - 0.1) return f(SH.HER_CU); if (t < e('photo') - 0.02) return f(SH.CHEF); if (t < e('wide') - 0.02) return f(SH.PHOTO); return f(SH.WIDE); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'thud', 'stamp']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- inserts on a solid backdrop
function backdrop(c, t, a, b) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.08)'; for (let i = -12; i < 12; i++) c.fillRect(-1600, i * 160 + (t * 40) % 160, 3200, 60); c.restore(); }
const pop = (t, t0) => eBack(clamp((t - t0 + 0.05) / 0.3), 1.6);
// o1: the bowl full to the brim, the octopus doing laps, splashing
function swimView(c, t) { backdrop(c, t, '#BFE6F6', '#5FA8D8'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'swim' });
  const k = pop(t, ev('o1', 'swim')), u = t - ev('o1', 'swim'); c.save(); c.translate(540, 1230); c.scale(2.5 * k, 2.5 * k);
  bowlBack(c, 0, 0, 1, 'water', 1); const o = { mood: 'happy', t, R: 88, arms: freeArms(t, 88, 3), blink: 0 }; o.arms[0] = { c1: [-60, -60], c2: [-140, -160], e: [-150 + Math.sin(t * 10) * 30, -220], w: 0.18, out: true }; o.arms[7] = { c1: [60, -60], c2: [140, -160], e: [150 + Math.sin(t * 10 + 2) * 30, -220], w: 0.18, out: true };
  const sx = Math.sin(u * 3) * 40; octo(c, sx, -BH_ - 40 + Math.sin(t * 6) * 6, 0.62, o, 'in'); bowlFront(c, 0, 0, 1, 'water', 1); octo(c, sx, -BH_ - 40 + Math.sin(t * 6) * 6, 0.62, o, 'out');
  c.restore();
  for (let i = 0; i < 12; i++) { const v = ((u * 1.3 + hash(i) ) % 1), a = -Math.PI / 2 + (hash(i * 7) - 0.5) * 2.2, r = 200 + v * 520; c.save(); c.globalAlpha = (1 - v) * k; c.fillStyle = '#E6F6FF'; c.beginPath(); c.ellipse(540 + Math.cos(a) * r, 830 + Math.sin(a) * r * 0.7 + v * v * 300, 16, 24, a, 0, TAU); c.fill(); c.restore(); } }
// o2: tug of war — her fork vs the tentacle
function forkView(c, t) { backdrop(c, t, '#FFE6A8', '#F2B33D'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'fork' });
  const k = pop(t, ev('o2', 'tug')), u = t - ev('o2', 'tug'), sw = Math.sin(u * 9) * 50 * Math.min(1, u * 2);
  c.save(); c.translate(600 + sw, 900); c.scale(1.2 * k, 1.2 * k);
  // the fork (horizontal), her hand + sleeve on the left
  c.fillStyle = '#C9CED6'; c.strokeStyle = '#8A93A0'; c.lineWidth = 5; rr(c, -560, -26, 520, 52, 26); c.fill(); c.stroke();
  c.fillStyle = '#C9CED6'; rr(c, -60, -70, 70, 140, 20); c.fill(); c.stroke(); for (const dy of [-55, -18, 18, 55]) { rr(c, 0, dy - 12, 260, 24, 12); c.fill(); c.stroke(); }
  c.fillStyle = '#8A2A4A'; rr(c, -900, -110, 300, 220, 30); c.fill(); paint(c, q => { q.m(-620, -95); q.b(-480, -110, -420, -60, -430, 0); q.b(-420, 70, -500, 105, -620, 95); q.z(); }, '#F6D2B6', { sd: 5, hd: 3, lw: 4 });
  c.strokeStyle = '#C98E78'; c.lineWidth = 5; for (const dy of [-45, -10, 25]) { c.beginPath(); c.moveTo(-520, dy); c.quadraticCurveTo(-470, dy + 12, -440, dy + 4); c.stroke(); }
  // the tentacle from the right, coiling three times around the tines
  tent(c, [900, 260], [600, 300], [420, 180], [250, 60], 70, 1);
  for (let i = 0; i < 3; i++) { const x = 200 - i * 70; c.save(); c.translate(x, 0); c.fillStyle = OC; c.strokeStyle = OCD; c.lineWidth = 4; c.beginPath(); c.ellipse(0, 0, 34 - i * 4, 96 - i * 8, 0.25, 0, TAU); c.fill(); c.stroke(); c.fillStyle = OCL; c.beginPath(); c.ellipse(-6, -40, 9, 7, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(-6, 30, 9, 7, 0, 0, TAU); c.fill(); c.restore(); }
  c.restore();
  // strain lines
  c.save(); c.strokeStyle = 'rgba(62,71,30,.6)'; c.lineWidth = 10; c.lineCap = 'round'; for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const y = 900 + s * (170 + i * 40); c.beginPath(); c.moveTo(540 + sw - 120 + i * 40, y); c.lineTo(540 + sw - 40 + i * 40, y + s * 40); c.stroke(); } c.restore(); }
// o3: the right soup arrives
function soupView(c, t) { backdrop(c, t, '#FFD6C8', '#E0705A'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'soup' });
  const t0 = ev('o3', 'soup'), u = t - t0, k = pop(t, t0), drop = (1 - eOut(clamp(u / 0.3))) * -500;
  c.save(); c.globalAlpha = 0.35 + 0.1 * Math.sin(t * 6); c.fillStyle = '#FFF2C8'; c.beginPath(); c.arc(540, 900, 480 * k, 0, TAU); c.fill(); c.restore();
  c.save(); c.translate(540, 1180 + drop); c.scale(2.6, 2.6); bowlBack(c, 0, 0, 1, 'tomato', 0); bowlFront(c, 0, 0, 1, 'tomato', 0); c.restore();
  steam(c, t, 540, 790 + drop, clamp(u / 0.4), 120);
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + t, r = 520 + 30 * Math.sin(t * 8 + i); c.save(); c.globalAlpha = clamp((u - 0.3) / 0.3); c.translate(540 + Math.cos(a) * r * k, 950 + Math.sin(a) * r * 0.8 * k); c.rotate(a); c.fillStyle = C.gold; UI.star(c, 0, 0, 22, 0); c.restore(); } }

// ---------------- overlays
function title(c, t) { const a = 1 - P(t, 1.98, 2.2); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
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
  // heroine + Theo with the octopus on his shoulder (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34, 2nd character at local x 640)
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gt = G.theo; const th = K.put(c, THEO, { t, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, items: {}, afterTorso: cc => waistcoat(cc, gt), armL: reach(gt, -1, -gt.sw * 1.7, gt.ySh + 60 + Math.sin(t * 6) * 15, { planar: true }), armR: reach(gt, 1, gt.sw * 1.7, gt.ySh + 60 + Math.sin(t * 6 + 1) * 15, { planar: true }) }, 760, 250);
    octo(c, th.x - 240, th.y + 250, 0.9, { mood: 'happy', t, R: 88, arms: shoulderArms(t, 88), blush: 0.6 });
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 160 + Math.sin(t * 8) * 30, { planar: true }), armR: reach(g, 1, g.sw * 1.25, g.ySh + 260, { planar: true }), items: { R: spoonItem(0.3) } }, 0, 0); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const swap = eIO(P(t, ask.t - 0.15, ask.t + 0.15));
  const q = eBack(P(u, 0.2, 0.55), 2.2) * (1 - swap); if (q > 0) { c.save(); c.translate(540, 300); c.scale(q, q); font(c, 'Unb9', 64); strokeText(c, 'А ТЫ БЫ', 0, -50, C.oliveD, C.white, 14); strokeText(c, 'ОТВЕТИЛА КАК?', 0, 40, C.pink, C.white, 14); c.restore(); }
  const q2 = eBack(P(t, ask.t, ask.t + 0.3), 2.2); if (q2 > 0) { c.save(); c.translate(540, 290); c.scale(q2, q2); c.rotate(-0.02);
    c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -480 + 8, -190 + 12, 960, 380, 40); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 8; rr(c, -480, -190, 960, 380, 40); c.fill(); c.stroke();
    textFit(c, 'Unb9', 80, 'ТЫ БЫ СЪЕЛА', 620); c.fillStyle = C.oliveD; c.fillText('ТЫ БЫ СЪЕЛА', -100, -70);
    textFit(c, 'Unb9', 92, 'ИЛИ ВЕРНУЛА?', 620); strokeText(c, 'ИЛИ ВЕРНУЛА?', -100, 50, C.pink, C.white, 12);
    octo(c, 370, -30, 0.48, { mood: 'love', t, R: 88, arms: freeArms(t, 88, 2), blush: 0.7 }); c.restore(); }
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
  if (tag.startsWith('ui:')) { ({ 'ui:swim': swimView, 'ui:fork': forkView, 'ui:soup': soupView })[tag](c, t); heads = { her: OFFL, waiter3: OFF }; proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.24); }
  const names = { waiter3: ['THEO', '#1E1E24'], chef1: ['CHEF', '#E0474C'] }, onScr = {}; for (const k in heads) if (Math.abs(heads[k].x) < 1e4) onScr[k] = heads[k];
  if (tag === 'cover' && onScr.waiter3) onScr.waiter3 = { ...onScr.waiter3, y: onScr.waiter3.y + onScr.waiter3.hh * 1.5 };   // cover: Theo's bubble sits below the title card
  // a speaker who is not in the shot never gets a bubble
  if (!tag.startsWith('ui:')) K.bubbles(c, t, sc, onScr, proj, { cleanChunks: true, names, hold: { hook_w: -0.05, o1_h: -0.22, o1_w: -0.1, o2_h: -0.22, o2_w: -0.1, o3_h: -0.22, o3_w: -0.2, o4_h: -0.15, o4_w: 0.2, end_c: -0.15 } });
  if (L === 'hook') title(c, t);
  plate(c, t, sc);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('octopus', NF, renderFrame);
