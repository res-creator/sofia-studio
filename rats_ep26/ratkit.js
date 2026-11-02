// Episode 26 "Paid per rat tail" (Hanoi, 1902) — props and sets on howitsrun_style (style reference lawnchair_ep17 / emu_ep12).
// Cartoon rats (never gory: a cut tail is just a clean pink noodle, no blood), the Hanoi street, the street section with the new sewers,
// the old postcard, the bounty table, coins, baskets of tails, the rat farm shed, the balance. World space: floor y = 0, up is negative.
const K = require('../tests/mcd_collage/kit');
const R = require('../hirkit/rig');
const CL = require('../hirkit/collage');
const ST = require('../howitsrun_style/style');
const SE = require('../howitsrun_style/sets');
const { C, F, clamp, lerp, E, rr, hash } = K;
const { INK, fillStroke, ell, px, tube, shade } = R;
const { txt, fitTxt, PAL } = ST;
const CS = require('./cast');

const FUR = '#8E8A96', FURD = '#6E6A78', BELLY = '#C9C3CC', PINK = '#EFA3A6', PINKD = '#D9868A', COPPER = '#C9874A';

// ---------- the cartoon rat (side view, facing +x, feet on y = 0, ~260 long with the tail at s = 1) ----------
// o: s, phase (running), run 0..1, tail (true | false | 'stub'), look [x,y], blush, mood ('happy' | 'shock' | 'sly'), up (stands up 0..1)
function rat(ctx, o = {}) {
  const s = o.s || 1, ph = o.phase || 0, run = o.run || 0, bob = run * 6 * Math.abs(Math.sin(ph * 2));
  ctx.save(); ctx.scale(s, s); K.contact(ctx, 0, 0, 90, 12, 0.3);
  ctx.translate(0, -bob); ctx.rotate(-(o.up || 0) * 0.5);
  // tail (behind)
  if (o.tail !== false && o.tail !== 'stub') { const w = Math.sin(ph * 1.5 + 1) * 14 * (0.4 + run);
    const pts = []; for (let i = 0; i <= 12; i++) { const u = i / 12; pts.push([-80 - u * 170, -34 + Math.sin(u * 3.2) * 18 - u * 40 + Math.sin(u * 6 + ph) * w * u]); }
    tube(ctx, pts.slice(0, 7), 14, PINK, 4); tube(ctx, pts.slice(6), 9, PINK, 3.5); }
  if (o.tail === 'stub') { tube(ctx, [[-78, -36], [-96, -32]], 13, PINK, 4); }
  // far legs
  const leg = (x, p, col) => { const lift = run * Math.max(0, Math.sin(p)) * 14, dx = run * Math.cos(p) * 14; ell(ctx, x + dx, -6 - lift, 16, 9); fillStroke(ctx, col, 3.5); };
  leg(-50, ph + Math.PI, PINKD); leg(40, ph, PINKD);
  // body
  ell(ctx, -8, -52, 88, 50, -0.05); fillStroke(ctx, FUR, 5);
  ctx.save(); ell(ctx, -8, -52, 88, 50, -0.05); ctx.clip(); ctx.fillStyle = BELLY; ell(ctx, 10, -14, 70, 26); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.14)'; ell(ctx, -20, -84, 60, 16); ctx.fill(); ctx.restore();
  leg(-34, ph, PINK); leg(56, ph + Math.PI, PINK);
  // head
  ctx.save(); ctx.translate(66, -74); ctx.rotate((o.up || 0) * 0.3);
  ctx.beginPath(); ctx.moveTo(-40, -30); ctx.bezierCurveTo(-10, -52, 40, -30, 74, 8); ctx.quadraticCurveTo(40, 30, -20, 32); ctx.bezierCurveTo(-52, 26, -56, -14, -40, -30); ctx.closePath(); fillStroke(ctx, FUR, 5);
  ell(ctx, 76, 8, 10, 9); fillStroke(ctx, PINKD, 3.5);   // nose
  ell(ctx, -16, -42, 26, 28, -0.3); fillStroke(ctx, FUR, 4.5); ell(ctx, -15, -41, 15, 17, -0.3); ctx.fillStyle = PINK; ctx.fill();   // ear
  // eye
  const lk = o.look || [0.4, 0], big = o.mood === 'shock' ? 1.25 : 1; ell(ctx, 22, -10, 13 * big, 14 * big); fillStroke(ctx, '#FFFDF8', 3.5);
  ell(ctx, 22 + lk[0] * 4, -10 + lk[1] * 4, 7 * big, 8 * big); ctx.fillStyle = '#141214'; ctx.fill(); ell(ctx, 20 + lk[0] * 4, -13 + lk[1] * 4, 2.6, 2.6); ctx.fillStyle = '#fff'; ctx.fill();
  if (o.mood === 'sly') { ctx.fillStyle = FUR; ctx.fillRect(6, -26, 32, 13); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 3.5); ctx.beginPath(); ctx.moveTo(6, -13); ctx.lineTo(38, -13); ctx.stroke(); }
  if (o.blush) { ctx.fillStyle = 'rgba(240,110,120,0.55)'; ell(ctx, 30, 12, 13, 7); ctx.fill(); }
  // mouth
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 3.5); ctx.beginPath();
  if (o.mood === 'shock') { ell(ctx, 50, 22, 7, 8); ctx.fillStyle = '#5A2A2A'; ctx.fill(); ctx.stroke(); } else { ctx.moveTo(44, 18); ctx.quadraticCurveTo(54, 26, 64, 18); ctx.stroke(); }
  // whiskers
  ctx.lineWidth = px(ctx, 2.2); for (const a of [-0.25, 0, 0.25]) { ctx.beginPath(); ctx.moveTo(70, 12); ctx.lineTo(70 + Math.cos(a) * 46, 12 + Math.sin(a) * 30); ctx.stroke(); }
  ctx.restore();
  ctx.restore();
}
// a rat seen from the front, peeking up over an edge (head + paws), centre of the head at (0,0)
function ratPeek(ctx, s = 1, o = {}) {
  ctx.save(); ctx.scale(s, s);
  for (const sx of [-1, 1]) { ell(ctx, sx * 58, -62, 34, 36); fillStroke(ctx, FUR, 5); ell(ctx, sx * 58, -60, 20, 22); ctx.fillStyle = PINK; ctx.fill(); }
  ctx.beginPath(); ctx.moveTo(-70, 30); ctx.bezierCurveTo(-80, -60, 80, -60, 70, 30); ctx.quadraticCurveTo(0, 80, -70, 30); ctx.closePath(); fillStroke(ctx, FUR, 5);
  ctx.fillStyle = BELLY; ell(ctx, 0, 40, 34, 22); ctx.fill();
  const lk = o.look || [0, 0];
  for (const sx of [-1, 1]) { ell(ctx, sx * 26, -6, 15, 17); fillStroke(ctx, '#FFFDF8', 3.5); ell(ctx, sx * 26 + lk[0] * 5, -4 + lk[1] * 5, 8, 9); ctx.fillStyle = '#141214'; ctx.fill(); ell(ctx, sx * 26 + lk[0] * 5 - 2, -8 + lk[1] * 5, 2.6, 2.6); ctx.fillStyle = '#fff'; ctx.fill(); }
  ell(ctx, 0, 36, 11, 9); fillStroke(ctx, PINKD, 3.5);
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 2.2); for (const sx of [-1, 1]) for (const a of [-0.2, 0.1]) { ctx.beginPath(); ctx.moveTo(sx * 16, 42); ctx.lineTo(sx * (16 + Math.cos(a) * 60), 42 + Math.sin(a) * 40); ctx.stroke(); }
  if (o.paws !== false) for (const sx of [-1, 1]) { ell(ctx, sx * 46, 78, 18, 12); fillStroke(ctx, PINK, 3.5); }
  ctx.restore();
}
// a loose rat tail (pink noodle) from (0,0) hanging down, length len, wiggle w
function tail(ctx, len = 220, w = 0, width = 12) {
  const pts = []; for (let i = 0; i <= 10; i++) { const u = i / 10; pts.push([Math.sin(u * 4 + w) * 18 * u, u * len]); }
  tube(ctx, pts.slice(0, 6), width, PINK, 3.5); tube(ctx, pts.slice(5), width * 0.65, PINK, 3);
}
// a tail lying flat (for piles), centred
function tailFlat(ctx, len, rot, seed) { ctx.save(); ctx.rotate(rot); const pts = []; for (let i = 0; i <= 8; i++) { const u = i / 8; pts.push([-len / 2 + u * len, Math.sin(u * 5 + seed) * 10]); } tube(ctx, pts, 9, PINK, 3); ctx.restore(); }

// ---------- money ----------
function coin(ctx, r = 60, label = '1¢', o = {}) {
  ctx.save(); if (o.spin !== undefined) ctx.scale(Math.max(0.08, Math.abs(Math.cos(o.spin))), 1);
  ell(ctx, 0, 0, r, r); fillStroke(ctx, COPPER, 5); ell(ctx, 0, 0, r * 0.78, r * 0.78); ctx.strokeStyle = shade(COPPER, -0.25); ctx.lineWidth = px(ctx, 3); ctx.stroke();
  ctx.fillStyle = 'rgba(255,240,200,0.35)'; ell(ctx, -r * 0.3, -r * 0.35, r * 0.25, r * 0.14, -0.6); ctx.fill();
  if (label) fitTxt(ctx, label, 0, r * 0.3, r * 0.85, '#5A3418', r * 1.4);
  ctx.restore();
}
function sack(ctx, s = 1) { // coin sack, base at 0
  ctx.save(); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-60, -170); ctx.quadraticCurveTo(-150, -60, -120, -10); ctx.quadraticCurveTo(0, 14, 120, -10); ctx.quadraticCurveTo(150, -60, 60, -170); ctx.closePath(); fillStroke(ctx, '#C9A86A', 5);
  ctx.beginPath(); ctx.moveTo(-60, -170); ctx.lineTo(-80, -210); ctx.lineTo(80, -210); ctx.lineTo(60, -170); ctx.closePath(); fillStroke(ctx, '#B8955A', 5);
  tube(ctx, [[-66, -176], [66, -176]], 12, '#8A5A34', 3.5); fitTxt(ctx, '¢', 0, -50, 110, '#6A4A24', 160);
  ctx.restore();
}

// ---------- baskets of tails ----------
function basket(ctx, s = 1, n = 14, seed = 0) { // base at 0
  ctx.save(); ctx.scale(s, s);
  for (let i = 0; i < n; i++) { ctx.save(); ctx.translate(-70 + hash(i + seed) * 140, -110); ctx.rotate(-0.6 + hash(i * 3 + seed) * 1.2); tail(ctx, -90 - hash(i + 7) * 60, i, 10); ctx.restore(); }
  ctx.beginPath(); ctx.moveTo(-110, -120); ctx.lineTo(110, -120); ctx.lineTo(84, 0); ctx.lineTo(-84, 0); ctx.closePath(); fillStroke(ctx, '#C49A5A', 5);
  ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(90,60,30,0.45)'; ctx.lineWidth = 4; for (let y = -105; y < 0; y += 22) { ctx.beginPath(); ctx.moveTo(-120, y); ctx.lineTo(120, y); ctx.stroke(); } for (let x = -100; x < 110; x += 26) { ctx.beginPath(); ctx.moveTo(x, -120); ctx.lineTo(x * 0.8, 0); ctx.stroke(); } ctx.restore();
  rr(ctx, -118, -132, 236, 22, 10); fillStroke(ctx, '#A87E44', 4.5);
  ctx.restore();
}
// a heap of tails on the ground (n tails), width w
function tailHeap(ctx, n, w = 600, h = 260) {
  for (let i = 0; i < n; i++) { const u = i / Math.max(1, n), x = (hash(i) - 0.5) * w * (1 - u * 0.6), y = -h * u * (1 - Math.abs(x) / w) * 1.4;
    ctx.save(); ctx.translate(x, y); tailFlat(ctx, 120 + hash(i + 3) * 70, (hash(i + 5) - 0.5) * 2.4, i); ctx.restore(); }
}

// ---------- Hanoi street: a row of shophouses (narrow tile-roofed fronts with shutters and balconies) ----------
const FRONTS = ['#E8D2A0', '#EFE3CB', '#D9B68A', '#E6C9A6', '#F0DDB4', '#DCC59A'];
function shophouses(ctx, x0 = -2200, n = 9, o = {}) {
  for (let i = 0; i < n; i++) { const x = x0 + i * 400, h = 520 + hash(i + (o.seed || 0)) * 160, col = FRONTS[i % FRONTS.length];
    rr(ctx, x, -h, 380, h, 4); fillStroke(ctx, col, 5);
    SE.poly(ctx, [[x - 20, -h], [x + 30, -h - 90], [x + 350, -h - 90], [x + 400, -h]], '#A8553A', 5);   // tiled roof
    ctx.strokeStyle = 'rgba(70,30,20,0.35)'; ctx.lineWidth = 3; for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.moveTo(x - 20 + k * 12, -h - k * 22); ctx.lineTo(x + 400 - k * 12, -h - k * 22); ctx.stroke(); }
    for (const wx of [x + 50, x + 210]) { rr(ctx, wx, -h + 70, 120, 140, 6); fillStroke(ctx, '#5C7A5A', 4); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 3); ctx.beginPath(); ctx.moveTo(wx + 60, -h + 70); ctx.lineTo(wx + 60, -h + 210); ctx.stroke(); }
    rr(ctx, x + 20, -h + 225, 340, 16, 4); fillStroke(ctx, '#8A5A34', 3.5);   // balcony rail
    rr(ctx, x + 70, -300, 240, 300, 6); fillStroke(ctx, '#9A7650', 4.5);      // shop opening
    ctx.strokeStyle = 'rgba(30,15,5,0.4)'; ctx.lineWidth = 3; for (let k = 1; k < 6; k++) { ctx.beginPath(); ctx.moveTo(x + 70 + k * 40, -300); ctx.lineTo(x + 70 + k * 40, 0); ctx.stroke(); }
  }
}
function tree(ctx, x, s = 1) { ctx.save(); ctx.translate(x, 0); ctx.scale(s, s); tube(ctx, [[0, 0], [10, -420]], 40, '#7A5A3A', 4.5);
  for (const [dx, dy, r] of [[-90, -470, 110], [80, -500, 120], [0, -600, 130], [-30, -420, 90], [110, -400, 80]]) { ell(ctx, dx, dy, r, r * 0.85); fillStroke(ctx, '#6FA36A', 4.5); }
  ctx.restore(); }
// the warm street set (sky + shophouses + trees + dirt road)
function street(ctx, t, o = {}) {
  SE.sky(ctx, t, { warm: true, clouds: 2, hills: false, sunX: 900, sunY: -1500 });
  shophouses(ctx, o.x0 ?? -2200, o.n ?? 12, o);
  if (o.trees !== false) for (const x of [-1500, -300, 1100]) tree(ctx, x + (o.treeX || 0), 1.05);
  const g = ctx.createLinearGradient(0, 0, 0, 1300); g.addColorStop(0, '#D9B57A'); g.addColorStop(1, '#C49668'); ctx.fillStyle = g; ctx.fillRect(-4000, 0, 8000, 1600);
  ctx.fillStyle = 'rgba(120,80,40,0.12)'; for (let i = 0; i < 40; i++) { ell(ctx, (hash(i) - 0.5) * 3000, 60 + hash(i + 1) * 500, 30, 6); ctx.fill(); }
}
// the bounty table (wooden table, ledger, coin box), centre x, top at y = -300
function bountyTable(ctx, x, o = {}) {
  ctx.save(); ctx.translate(x, 0);
  rr(ctx, -300, -300, 600, 34, 8); fillStroke(ctx, '#8A5A34', 5); for (const lx of [-260, 240]) { rr(ctx, lx, -268, 26, 268, 6); fillStroke(ctx, '#6E4528', 4.5); }
  ctx.save(); ctx.translate(-150, -300); ctx.rotate(-0.04); rr(ctx, -110, -26, 220, 26, 4); fillStroke(ctx, '#FBF6EA', 4); ctx.fillStyle = '#2E3A59'; ctx.fillRect(-110, -26, 12, 26); ctx.restore();   // ledger
  rr(ctx, 70, -360, 170, 60, 8); fillStroke(ctx, '#6A4024', 4.5); for (let i = 0; i < 4; i++) { ell(ctx, 100 + i * 36, -364, 16, 6); fillStroke(ctx, COPPER, 3); }   // coin box
  if (o.sign) { tube(ctx, [[-280, -300], [-280, -620]], 12, '#6E4528', 4); ctx.save(); ctx.translate(-280, -650); ctx.rotate(-0.04); CL.cutout(ctx, () => rr(ctx, -150, -60, 300, 110, 10), '#FBF6EA', { elev: 1 }); fitTxt(ctx, o.sign, 0, 14, 56, C.red, 260); ctx.restore(); }
  ctx.restore();
}

// ---------- the street section: French villas above, the new sewer pipes below ----------
function villa(ctx, x, s = 1) {
  ctx.save(); ctx.translate(x, 0); ctx.scale(s, s);
  rr(ctx, -300, -620, 600, 620, 6); fillStroke(ctx, '#F2D27A', 5);
  SE.poly(ctx, [[-340, -620], [0, -800], [340, -620]], '#B8553A', 5);
  for (const [wx, wy] of [[-200, -520], [60, -520], [-200, -280], [60, -280]]) { rr(ctx, wx, wy, 140, 170, 8); fillStroke(ctx, '#BFE0FA', 4); for (const sx of [-1, 1]) { rr(ctx, wx + (sx < 0 ? -44 : 140), wy, 44, 170, 4); fillStroke(ctx, '#3E7A5A', 4); } }
  rr(ctx, -330, -360, 660, 20, 6); fillStroke(ctx, '#FFFDF8', 4);
  ctx.restore();
}
// pipes: the main sewer at depth y = 330 (radius 90) + drains from each villa; o.shine 0..1 makes them "shiny new"
function sewers(ctx, t, xs, o = {}) {
  const g = ctx.createLinearGradient(0, 0, 0, 1400); g.addColorStop(0, '#9A7A58'); g.addColorStop(1, '#6E5440'); ctx.fillStyle = g; ctx.fillRect(-4000, 0, 8000, 1600);
  ctx.fillStyle = 'rgba(50,30,15,0.18)'; for (let i = 0; i < 60; i++) { ell(ctx, (hash(i) - 0.5) * 3600, 60 + hash(i + 2) * 1100, 10 + hash(i + 4) * 16, 7); ctx.fill(); }
  ctx.fillStyle = '#B9B1A3'; ctx.fillRect(-4000, -10, 8000, 30); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 4); ctx.beginPath(); ctx.moveTo(-4000, 20); ctx.lineTo(4000, 20); ctx.stroke();
  const PIPE = '#C8C0B0';
  for (const x of xs) tube(ctx, [[x, 20], [x, 300]], 60, PIPE, 5);
  rr(ctx, -3000, 240, 6000, 180, 90); fillStroke(ctx, PIPE, 5);
  ctx.save(); rr(ctx, -3000, 240, 6000, 180, 90); ctx.clip(); ctx.fillStyle = '#4A4038'; ctx.fillRect(-3000, 268, 6000, 124);
  if (o.inside) o.inside(ctx); ctx.restore();
  rr(ctx, -3000, 240, 6000, 180, 90); ctx.lineWidth = px(ctx, 5); ctx.strokeStyle = INK; ctx.stroke();
  ctx.fillStyle = PIPE; ctx.fillRect(-3000, 240, 6000, 26); ctx.fillRect(-3000, 394, 6000, 26); ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(-3000, 266); ctx.lineTo(3000, 266); ctx.moveTo(-3000, 394); ctx.lineTo(3000, 394); ctx.stroke();
  for (let x = -2900; x < 3000; x += 360) { rr(ctx, x, 236, 26, 188, 6); fillStroke(ctx, shade(PIPE, -0.12), 4); }
  if (o.shine) { ctx.save(); ctx.globalAlpha = o.shine; for (let i = 0; i < 5; i++) { const x = -800 + i * 420 + ((t * 300) % 420); ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.moveTo(x, 244); ctx.lineTo(x + 60, 244); ctx.lineTo(x + 20, 264); ctx.lineTo(x - 40, 264); ctx.closePath(); ctx.fill(); } ctx.restore(); }
}

// ---------- the old postcard (centred, 900 x 640): a sepia Hanoi street ----------
function postcard(ctx, t, o = {}) {
  const w = 900, h = 640;
  ctx.save(); ctx.rotate(o.rot ?? -0.03);
  CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 10), '#F3E6CC', { elev: 2 });
  ctx.save(); rr(ctx, -w / 2 + 30, -h / 2 + 30, w - 60, h - 140, 6); ctx.clip();
  ctx.save(); ctx.translate(0, 120); ctx.scale(0.36, 0.36);
  SE.skyFill(ctx, '#E9D3A6', '#F6EBD2', -1400, 0); shophouses(ctx, -1500, 8, { seed: 3 }); tree(ctx, -800, 1); tree(ctx, 700, 1.1);
  ctx.fillStyle = '#D6BE92'; ctx.fillRect(-2000, 0, 4000, 800);
  const ppl = [[-600, 'hunter', 1], [-150, 'woman', -1], [300, 'elder', 1], [900, 'youth', -1]];
  for (const [x, who, f] of ppl) CS.cast(ctx, x + Math.sin(t * 0.8 + x) * 20, 180, 0.9, f, who, { face: R.expr('neutral', { look: [1, 0] }), ...R.walk(t * 4 + x) });
  ctx.restore();
  ctx.globalCompositeOperation = 'color'; ctx.fillStyle = 'rgba(150,110,60,0.55)'; ctx.fillRect(-w, -h, w * 2, h * 2); ctx.restore();
  rr(ctx, -w / 2 + 30, -h / 2 + 30, w - 60, h - 140, 6); ctx.lineWidth = px(ctx, 4); ctx.strokeStyle = '#5A4630'; ctx.stroke();
  fitTxt(ctx, o.caption || 'HANOI', -w / 2 + 50, h / 2 - 40, 54, '#4A3420', 500, 'left', ST.FONT.type);
  ctx.save(); ctx.translate(w / 2 - 110, h / 2 - 60); ctx.rotate(0.06); rr(ctx, -60, -40, 120, 80, 4); fillStroke(ctx, '#C9605A', 3); fitTxt(ctx, '1902', 0, 12, 34, PAL.cream, 100); ctx.restore();
  ctx.restore();
}

// ---------- a bathroom wall + the toilet (front view, bowl rim at y = -380), the rat peeks out (u 0..1) ----------
function bathroom(ctx, t) {
  ctx.fillStyle = '#E6EEF0'; ctx.fillRect(-3000, -2400, 6000, 2400);
  for (let y = -1200; y < 0; y += 90) for (let x = -2000; x < 2000; x += 90) { ctx.strokeStyle = 'rgba(80,110,120,0.22)'; ctx.lineWidth = 3; ctx.strokeRect(x, y, 90, 90); }
  ctx.fillStyle = '#5E7A84'; ctx.fillRect(-3000, -1220, 6000, 30);
  ctx.fillStyle = '#D8CDB8'; ctx.fillRect(-3000, 0, 6000, 1600); for (let i = -12; i < 12; i++) for (let j = 0; j < 6; j++) if ((i + j) % 2) { ctx.fillStyle = '#C2B59C'; ctx.fillRect(i * 200, j * 200, 200, 200); }
}
function toilet(ctx, u, t) {
  // high tank + pull chain (1900s)
  rr(ctx, -150, -1180, 300, 170, 12); fillStroke(ctx, '#FFFDF8', 5); tube(ctx, [[0, -1010], [0, -560]], 26, '#C8C0B0', 4.5); tube(ctx, [[120, -1010], [120, -760]], 4, '#8A8F98', 2); ell(ctx, 120, -750, 12, 16); fillStroke(ctx, '#8A5A34', 3);
  // bowl back
  ell(ctx, 0, -380, 210, 60); fillStroke(ctx, '#FFFDF8', 5); ell(ctx, 0, -380, 170, 42); ctx.fillStyle = '#5E7A84'; ctx.fill();
  // the rat climbing out
  if (u > 0) { ctx.save(); ctx.translate(Math.sin(t * 9) * 4 * u, lerp(-300, -450, E.back(u, 1.5))); ratPeek(ctx, 1.05, { look: [0.5, 0.3] }); ctx.restore(); }
  // bowl front + seat
  ctx.beginPath(); ctx.moveTo(-210, -380); ctx.bezierCurveTo(-200, -160, -120, -110, -90, -40); ctx.lineTo(90, -40); ctx.bezierCurveTo(120, -110, 200, -160, 210, -380); ctx.quadraticCurveTo(0, -330, -210, -380); ctx.closePath(); fillStroke(ctx, '#FFFDF8', 5);
  rr(ctx, -120, -40, 240, 40, 10); fillStroke(ctx, '#EDE8DC', 5);
  ctx.lineWidth = 22; ctx.strokeStyle = '#8A5A34'; ell(ctx, 0, -386, 196, 54); ctx.stroke(); ctx.lineWidth = px(ctx, 3.5); ctx.strokeStyle = INK; ell(ctx, 0, -386, 207, 65); ctx.stroke(); ell(ctx, 0, -386, 185, 43); ctx.stroke();
}
// the PLAGUE warning notice (paper), centred, ~520 x 680
function plagueNotice(ctx, o = {}) {
  ctx.save(); ctx.rotate(o.rot ?? 0.03);
  CL.cutout(ctx, () => rr(ctx, -260, -340, 520, 680, 8), '#FBF3DE', { elev: 1.6 });
  ctx.save(); rr(ctx, -260, -340, 520, 680, 8); ctx.clip(); ctx.fillStyle = '#171717'; ctx.fillRect(-260, -340, 520, 150); ctx.restore();
  fitTxt(ctx, 'WARNING', 0, -280, 40, C.yellow, 440); fitTxt(ctx, 'PLAGUE', 0, -210, 92, PAL.cream, 460);
  ctx.save(); ctx.translate(0, 20); ratPeek(ctx, 1.1, { paws: false, look: [0, 0.4] }); ctx.restore();
  fitTxt(ctx, 'SPREADING ACROSS ASIA', 0, 260, 34, INK, 460, 'center', ST.FONT.type);
  ctx.restore();
}
// the bounty notice (paper), centred, ~560 x 720
function bountyNotice(ctx, o = {}) {
  ctx.save(); ctx.rotate(o.rot ?? -0.03);
  CL.cutout(ctx, () => rr(ctx, -280, -360, 560, 720, 8), '#FBF6EA', { elev: 1.8 });
  fitTxt(ctx, 'CITY OF HANOI', 0, -280, 38, '#4A4A48', 480, 'center', ST.FONT.type);
  fitTxt(ctx, 'NOTICE', 0, -200, 80, INK, 480);
  ctx.save(); ctx.translate(-120, 30); tail(ctx, 160, 1, 14); ctx.restore();
  ctx.save(); ctx.translate(90, 90); coin(ctx, 80); ctx.restore();
  fitTxt(ctx, '=', -10, 110, 70, INK, 60);
  fitTxt(ctx, '1¢ PER RAT TAIL', 0, 290, 54, C.red, 480);
  ctx.restore();
}
// magnifying glass (handle at 0,0 going down), lens up
function magnifier(ctx, s = 1) { ctx.save(); ctx.scale(s, s); tube(ctx, [[0, 20], [0, -80]], 22, '#6A4024', 4); ell(ctx, 0, -150, 72, 72); fillStroke(ctx, '#3A3A40', 5); ell(ctx, 0, -150, 56, 56); ctx.fillStyle = 'rgba(200,230,255,0.55)'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 3); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.7)'; ell(ctx, -18, -172, 16, 8, -0.6); ctx.fill(); ctx.restore(); }
// scissors (open 0..1), centred at the pivot, blades to +x
function scissors(ctx, s = 1, open = 0) {
  ctx.save(); ctx.scale(s, s);
  for (const k of [-1, 1]) { ctx.save(); ctx.rotate(k * (0.05 + open * 0.35));
    ctx.beginPath(); ctx.moveTo(-20, -16 * k); ctx.lineTo(170, -2 * k); ctx.lineTo(-20, 12 * k); ctx.closePath(); fillStroke(ctx, '#C9CED6', 4);
    tube(ctx, [[-20, 0], [-50, 12 * k]], 14, INK, 0); ell(ctx, -76, 20 * k, 32, 20); ctx.lineWidth = px(ctx, 14); ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = px(ctx, 8); ctx.strokeStyle = C.red; ctx.stroke(); ctx.restore(); }
  ell(ctx, 0, 0, 8, 8); fillStroke(ctx, '#8A8F98', 3); ctx.restore();
}
// a little cartoon "snip" burst (stars), u 0..1
function snipStar(ctx, u) { if (u <= 0 || u >= 1) return; ctx.save(); ctx.globalAlpha *= 1 - u; ctx.strokeStyle = C.yellow; ctx.lineWidth = px(ctx, 8); ctx.lineCap = 'round';
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r0 = 30 + u * 40, r1 = 60 + u * 70; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); ctx.stroke(); } ctx.restore(); }

// ---------- the rat farm: a shed of planks with stacked crates (rats peeking), base at 0 ----------
function crate(ctx, w = 220, h = 150, peek = 0, seed = 0, t = 0) {
  rr(ctx, -w / 2, -h, w, h, 6); fillStroke(ctx, '#B98A5A', 4.5);
  ctx.save(); rr(ctx, -w / 2, -h, w, h, 6); ctx.clip(); ctx.fillStyle = '#3A2A1E'; for (let i = 0; i < 4; i++) ctx.fillRect(-w / 2 + 14 + i * (w - 28) / 4 + 6, -h + 16, (w - 28) / 4 - 12, h - 32);
  if (peek) for (let i = 0; i < 2; i++) { ctx.save(); ctx.translate(-w / 4 + i * w / 2, -h * 0.35 + Math.sin(t * 5 + seed + i * 2) * 6); ratPeek(ctx, 0.45, { paws: false, look: [i ? -0.5 : 0.5, 0] }); ctx.restore(); }
  ctx.restore();
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 4); for (let i = 1; i < 4; i++) { const x = -w / 2 + 14 + i * (w - 28) / 4; ctx.beginPath(); ctx.moveTo(x, -h + 8); ctx.lineTo(x, -8); ctx.stroke(); }
}
function shed(ctx, t, o = {}) {
  SE.poly(ctx, [[-760, -900], [0, -1180], [760, -900]], '#7A4A2E', 5);
  rr(ctx, -700, -900, 1400, 900, 4); fillStroke(ctx, '#A9784A', 5);
  ctx.strokeStyle = 'rgba(60,35,15,0.45)'; ctx.lineWidth = 4; for (let x = -700; x < 700; x += 70) { ctx.beginPath(); ctx.moveTo(x, -900); ctx.lineTo(x, 0); ctx.stroke(); }
  rr(ctx, -640, -840, 1280, 840, 4); fillStroke(ctx, '#4A3424', 4);   // dark inside (open front)
  const rows = [[-540, 0, 5], [-460, -160, 4], [-380, -320, 3]];
  for (const [x0, y, n] of rows) for (let i = 0; i < n; i++) { ctx.save(); ctx.translate(x0 + i * 240 + 110, y); crate(ctx, 220, 150, 1, i * 3 + y, t); ctx.restore(); }
  if (o.rats) for (let i = 0; i < 3; i++) { ctx.save(); ctx.translate(-500 + ((t * 120 + i * 360) % 1000), 0); rat(ctx, { s: 0.6, phase: t * 12 + i, run: 1, tail: 'stub' }); ctx.restore(); }
}

// ---------- the balance (copied from hoover_ep19/hoovkit.js, own colours) ----------
function balance(ctx, tilt, left, right) {
  ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 14); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 520); ctx.stroke(); ctx.strokeStyle = '#C9A06A'; ctx.lineWidth = px(ctx, 8); ctx.stroke();
  rr(ctx, -150, 510, 300, 40, 12); fillStroke(ctx, '#C9A06A', 5);
  const a = tilt * 0.28; ctx.save(); ctx.rotate(a); rr(ctx, -380, -14, 760, 28, 14); fillStroke(ctx, '#C9A06A', 5);
  for (const [sx, draw] of [[-1, left], [1, right]]) { ctx.save(); ctx.translate(sx * 360, 0); ctx.rotate(-a);
    ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 4); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-120, 220); ctx.moveTo(0, 0); ctx.lineTo(120, 220); ctx.stroke();
    ell(ctx, 0, 226, 150, 30); fillStroke(ctx, '#D8D2C2', 5); ctx.save(); ctx.translate(0, 216); draw(ctx); ctx.restore(); ctx.restore(); }
  ctx.restore(); ell(ctx, 0, 0, 24, 24); fillStroke(ctx, C.red, 5); ctx.restore();
}
// a counter plate (big number on red), centred
function bigPlate(ctx, s, size = 120, col = C.red, fg = PAL.cream) { ctx.font = `${size}px ${F.black}`; const w = ctx.measureText(s).width + 80; CL.cutout(ctx, () => rr(ctx, -w / 2, -size * 0.8, w, size * 1.45, 20), col, { elev: 2 }); txt(ctx, s, 0, size * 0.36, size, fg); }

module.exports = { rat, ratPeek, tail, tailFlat, coin, sack, basket, tailHeap, shophouses, tree, street, bountyTable, villa, sewers, postcard, bathroom, toilet, plagueNotice, bountyNotice, magnifier, scissors, snipStar, crate, shed, balance, bigPlate, CS, FUR, PINK, COPPER };
