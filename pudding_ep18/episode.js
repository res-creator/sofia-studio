// Episode 18 "The Pudding Guy" (How It's Run) — 1999: engineer David Phillips buys over 12,000 cups of Healthy Choice pudding (25¢ each)
// for the barcodes (10 barcodes = 500 miles, doubled if mailed early), Salvation Army volunteers peel them, the pudding goes to people in need,
// ~$3,140 turns into 1,253,000 miles. Money twist: he wasn't buying dessert, he was buying a million miles — and gave the pudding to charity.
// Story world: the pudding mountain (frame 0) -> the barcode -> the flyer -> the equation -> the store aisle (crosshair) -> 25¢ -> the shelf
// empties into the cart -> the manager's cases -> the cup-filled living room + deadline -> the volunteers' table -> the donation van -> the check
// -> the miles counter -> TAX WRITE-OFF -> the marquee -> the balance -> David's look at the camera -> the question card over frame 0.
// Built on hirkit (rig, light, collage, edit). Shots cut on voice-over words. 1080x1920, 30 fps.
const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
const { spawn } = require('child_process');
const fs = require('fs');
const K = require('../tests/mcd_collage/kit');
const EN = require('../mcd_ep1/engine');            // voice timings + subtitle drawing only (read-only use)
const R = require('../hirkit/rig');
const LT = require('../hirkit/light');
const CL = require('../hirkit/collage');
const { makeEdit } = require('../hirkit/edit');
const S = require('./pudkit');
const M = require('../icecream_ep13/mcfkit');   // clock
const TP = require('../tp_ep12/tpkit');          // scissors
const { C, F, clamp, lerp, seg, E, rr } = K;
const { INK } = R;
const { W, H, layer, txt, fitTxt, DAVID, VOLS, MANAGER } = S;
try { GlobalFonts.registerFromPath('/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf', 'Emoji'); } catch (e) {}
const FPS = 30;

// ---------- voice timeline (natural speed; real speech start/end from vo/speech.json, gaps only) ----------
const LINES = JSON.parse(fs.readFileSync(`${__dirname}/script.json`));
const SP = JSON.parse(fs.readFileSync(`${__dirname}/vo/speech.json`));
const GAP = { s01: 0.3, s02: 0.3, s03: 0.3, s04: 0.3, s05: 0.3, s06: 0.3, s07: 0.3, s08: 0.3, s09: 0.3, s10: 0.35, s11: 0.2 };
const ST = {}; let T = 0.05; for (const L of LINES) { ST[L.id] = +(T - SP[L.id][0]).toFixed(3); T += SP[L.id][1] - SP[L.id][0] + GAP[L.id]; }
const V = EN.voice(`${__dirname}/vo`, ST), at = (id, w, n = 0) => V.at(id, w, n), end = id => ST[id] + SP[id][1];
const tEnd = +(end('s11') + 0.15).toFixed(2);   // the end card (question to the viewer) holds 2 s+
T = +(tEnd + 2.2).toFixed(2);

// ---------- helpers ----------
function cam(keys, lt) {
  let c; if (lt <= keys[0][0]) c = keys[0]; else if (lt >= keys[keys.length - 1][0]) c = keys[keys.length - 1];
  else for (let i = 1; i < keys.length; i++) if (lt < keys[i][0]) { const a = keys[i - 1], b = keys[i], u = E.inOut(seg(lt, a[0], b[0])); c = [lt, lerp(a[1], b[1], u), lerp(a[2], b[2], u), Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), u)), lerp(a[4] || 0, b[4] || 0, u)]; break; }
  return { x: c[1] + Math.sin(lt * 0.9) * 4 / c[3], y: c[2] + Math.cos(lt * 0.7) * 3 / c[3], z: c[3], r: (c[4] || 0) + Math.sin(lt * 0.6) * 0.003 };
}
const shake = (t, t0, a = 14) => (t > t0 && t < t0 + 0.35) ? Math.sin((t - t0) * 70) * a * (1 - seg(t, t0, t0 + 0.35)) : 0;
const HALF = createCanvas(W / 2, H / 2), hx = HALF.getContext('2d');
function halfPass(ctx, blur, draw) { // a softer (half-res, blurred) background plane
  hx.setTransform(1, 0, 0, 1, 0, 0); hx.clearRect(0, 0, W / 2, H / 2); hx.setTransform(0.5, 0, 0, 0.5, 0, 0);
  R.LINE.dev = 0.5; draw(hx); R.LINE.dev = 1;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); if (blur > 0.3) ctx.filter = `blur(${blur.toFixed(1)}px)`; ctx.drawImage(HALF, 0, 0, W, H); ctx.restore();
}
const blink = (t, p = 3.3, o = 0) => ((t + o) % p) > p - 0.11 ? 1 : 0;
const RIM = { dir: [-1, -0.35], color: '#FFF3D8', w: 8, a: 0.9 }, RIM_COOL = { dir: [1, -0.4], color: '#D8F0FF', w: 8, a: 0.85 };
const pop = (t, t0, d = 0.3, s = 2.2) => t < t0 ? 0 : E.back(seg(t, t0, t0 + d), s);
function label(ctx, s, x, y, u, o = {}) {
  if (u <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.03); ctx.scale(u, u); const size = o.size || 56;
  ctx.font = `${size}px ${F.black}`; const w = Math.min(ctx.measureText(s).width, o.maxW || 940) + 50;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -size * 0.85, w, size * 1.35, 12), o.col || '#FFFDF8', { elev: 1.4 }); fitTxt(ctx, s, 0, size * 0.28, size, o.fg || INK, w - 50);
  ctx.restore();
}
function stampMark(ctx, s, x, y, u, o = {}) {
  if (u <= 0) return; const size = o.size || 96, sc = lerp(o.from ?? 1.8, 1, E.out(clamp(u))), rot = o.rot ?? -0.1, col = o.col || C.red;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(u * 3);
  ctx.font = `${size}px ${F.black}`; const w = ctx.measureText(s).width + 70, h = size * 1.45;
  ctx.fillStyle = 'rgba(255,253,246,0.9)'; rr(ctx, -w / 2, -h / 2, w, h, 16); ctx.fill();
  ctx.strokeStyle = col; ctx.lineWidth = 12; rr(ctx, -w / 2, -h / 2, w, h, 16); ctx.stroke(); ctx.lineWidth = 4; rr(ctx, -w / 2 + 16, -h / 2 + 16, w - 32, h - 32, 10); ctx.stroke();
  txt(ctx, s, 0, size * 0.36, size, col); ctx.restore();
}
function footnote(ctx, s, y = 1400, a = 1) { // a small source / company-position note
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.font = `30px ${F.xb}`; const w = Math.min(ctx.measureText(s).width, 900) + 40;
  ctx.fillStyle = 'rgba(23,23,23,0.78)'; rr(ctx, 540 - w / 2, y - 30, w, 46, 10); ctx.fill(); fitTxt(ctx, s, 540, y + 2, 30, '#FFFDF8', 900, 'center', F.xb); ctx.restore();
}
// a cartoon anger mark (four red arcs), pulsing
function angerMark(ctx, x, y, r, t) {
  const p = 1 + 0.12 * Math.sin(t * 14); ctx.save(); ctx.translate(x, y); ctx.scale(p, p); ctx.lineCap = 'round';
  for (const [w, col] of [[r * 0.34, INK], [r * 0.22, C.red]]) { ctx.lineWidth = w; ctx.strokeStyle = col;
    for (let i = 0; i < 4; i++) { ctx.save(); ctx.rotate(i * Math.PI / 2); ctx.beginPath(); ctx.moveTo(r * 0.25, -r); ctx.quadraticCurveTo(r * 0.25, -r * 0.25, r, -r * 0.25); ctx.stroke(); ctx.restore(); } }
  ctx.restore();
}
// a person's front bust over a background, slow push
function bust(ctx, lt, bg, L, o) {
  if (bg) bg(ctx);
  const push = 1 + lt * (o.push ?? 0.03), nx = o.x ?? 540, ny = o.ny ?? 1450, s = o.s ?? 2.7;
  ctx.save(); ctx.translate(nx, ny); ctx.scale(push, push); ctx.translate(-nx, -ny);
  LT.lit(ctx, c => R.bust(c, nx, ny, s, L, { face: o.face, hands: o.hands || [], headTilt: o.tilt || 0, lean: o.lean || 0 }),
    { rim: o.rim ?? RIM, tint: { x0: nx, y0: 0, x1: nx + 540, y1: 0, color: 'rgb(214,205,226)', a: 1 } });
  ctx.restore();
}
const wallBg = (col = '#EFE3CB') => c => { c.fillStyle = col; c.fillRect(0, 0, W, H); c.fillStyle = 'rgba(160,120,80,0.10)'; for (let x = 0; x < W; x += 90) c.fillRect(x, 0, 6, H); };
const storeBg = (blur = 8) => c => { c.fillStyle = '#EFE8D8'; c.fillRect(0, 0, W, H); halfPass(c, blur, g => layer(g, { x: 0, y: -620, z: 0.9 }, 1, w => { for (const dx of [-1100, 0, 1100]) { w.save(); w.translate(dx, 0); S.shelf(w, 1000, { sign: dx ? '' : 'DESSERTS' }); w.restore(); } })); };
// cups raining down (screen space), deterministic per index
function rain(ctx, t, n = 14, o = {}) {
  for (let i = 0; i < n; i++) { const ph = (t * (0.55 + K.hash(i) * 0.4) + K.hash(i + 9)) % 1, x0 = 60 + K.hash(i + 3) * 960, x = o.avoid && x0 > 260 && x0 < 820 ? (x0 < 540 ? x0 - 220 : x0 + 220) : x0, y = lerp(-150, o.floor ?? 1250, ph);
    ctx.save(); ctx.translate(x, y); ctx.rotate(ph * 6 * (K.hash(i + 5) - 0.5)); S.cup(ctx, o.s ?? 0.9, { seed: i }); ctx.restore(); }
}
// the pudding mountain with David buried to the chest (frame 0 and the end card)
function mountain(ctx, t, lt, face) {
  wallBg('#F1E3C8')(ctx);
  halfPass(ctx, 3, g => { g.save(); g.translate(540, 1180); S.cupPile(g, 9, 1.05, { wide: 2 }); g.restore(); });
  rain(ctx, t, 10, { floor: 1500, s: 0.85, avoid: true });
  for (const [x, s, f] of [[150, 0.75, -1], [930, 0.75, 1]]) { ctx.save(); ctx.translate(x, 1560); ctx.scale(f * s, s); S.cart(ctx, 1, { load: 1 }); ctx.restore(); }
  bust(ctx, lt, null, DAVID, { face, ny: 1430, s: 2.55, push: 0.01, hands: [{ side: 1, hand: [210, -110], grip: 'hold', item: g => { g.save(); g.rotate(1.57); g.translate(0, 50); S.cup(g, 0.9); g.restore(); } }] });
  ctx.save(); ctx.translate(540, 1920); S.cupPile(ctx, 5, 1.25, { wide: 4 }); ctx.restore();
}

// ---------- overlays ----------
const tJust = at('s01', 'just'), tBar = at('s01', 'barcodes');
function headline(ctx, t) {
  const a = 1 - seg(t, ST.s02 - 0.3, ST.s02 - 0.05); if (a <= 0 || t >= tEnd) return;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2 + shake(t, 0.02, 12), 330);
  const land = 0.88 + 0.12 * E.back(seg(t, 0, 0.3), 3); ctx.rotate(-0.03); ctx.scale(land, land);
  ctx.font = `92px ${F.black}`; const a1 = '1 MAN', vs = ' vs. ', b1 = '12,000 PUDDINGS', w1 = ctx.measureText(a1).width, wv = ctx.measureText(vs).width, w2 = ctx.measureText(b1).width;
  const tot = w1 + wv + w2 + 110, sc = Math.min(1, 1000 / tot); ctx.scale(sc, sc);
  CL.cutout(ctx, () => rr(ctx, -tot / 2, -78, tot, 124, 16), '#FFFDF8', { elev: 1.6 });
  txt(ctx, a1 + vs, -tot / 2 + 30, 12, 92, INK, 'left');
  ctx.save(); ctx.translate(tot / 2 - 30 - w2 / 2 - 10, -16); ctx.rotate(0.02); CL.cutout(ctx, () => rr(ctx, -w2 / 2 - 22, -58, w2 + 44, 104, 12), C.red, { elev: 1 }); txt(ctx, b1, 0, 28, 92, '#FFFDF8'); ctx.restore();
  ctx.restore();
  // small place/date stamp
  ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2, 455); ctx.font = `30px ${F.black}`; const s = 'USA · 1999', w = ctx.measureText(s).width + 44;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -28, w, 54, 10), '#171717', { elev: 0.8, tex: 0 }); txt(ctx, s, 0, 11, 30, C.yellow); ctx.restore();
}
function endCard(ctx, t) {
  if (t < tEnd) return; const u = E.back(seg(t, tEnd, tEnd + 0.35), 2);
  ctx.save(); ctx.translate(W / 2, 520); ctx.rotate(-0.02); ctx.scale(u, u);
  CL.cutout(ctx, () => rr(ctx, -480, -270, 960, 540, 30), '#FFFDF8', { elev: 2.2 });
  txt(ctx, 'WOULD YOU BUY', 0, -150, 76, INK); fitTxt(ctx, '12,000 PUDDINGS', 0, -60, 80, INK, 880);
  ctx.save(); ctx.translate(0, 50); ctx.rotate(0.02); CL.cutout(ctx, () => rr(ctx, -400, -70, 800, 124, 16), C.red, { elev: 1.4 }); fitTxt(ctx, 'FOR FREE FLIGHTS?', 0, 22, 80, '#FFFDF8', 740); ctx.restore();
  const b = Math.sin(t * 7) * 10; ctx.font = '110px Emoji'; ctx.textAlign = 'center'; ctx.fillText('👇', 0, 230 + b);
  ctx.restore();
}

// ================= SHOTS =================
const SH = []; const shot = (id, t0, t1, draw, out) => SH.push({ id, t0, t1, draw, out });
const tPud1 = at('s01', 'pudding');
// A1 (s01 "In 1999, an engineer bought over twelve thousand cups of chocolate pudding..."): David buried in a pudding mountain, cups raining
shot('A1 mountain', 0, tJust - 0.1, (ctx, t, lt) => {
  const z = 1.0 + E.out(seg(lt, 0, 1.4)) * 0.07; ctx.save(); ctx.translate(540, 1100); ctx.scale(z, z); ctx.translate(-540, -1100);
  mountain(ctx, t, lt, R.expr(t > tPud1 ? 'grin' : 'shocked', { look: [0, 0.05], blink: blink(t, 2.9) }));
  ctx.restore(); LT.grade(ctx, 'golden', { vignette: 0.22 });
}, { type: 'cut' });
// A2 (s01 "just for the BARCODES."): extreme close-up of a cup's barcode; a red scanner line sweeps it
shot('A2 barcode', tJust - 0.1, ST.s02 - 0.12, (ctx, t, lt) => {
  wallBg('#F1E3C8')(ctx); halfPass(ctx, 8, g => { g.save(); g.translate(540, 1500); S.cupPile(g, 6, 1.3, { wide: 3 }); g.restore(); });
  const z = 1 + lt * 0.05; ctx.save(); ctx.translate(540, 1150); ctx.scale(z, z); ctx.rotate(-0.04);
  ctx.save(); ctx.translate(-200, 330); S.cup(ctx, 6.4); ctx.restore();
  ctx.restore();
  if (t > tBar - 0.15) { const y = lerp(1000, 1250, (Math.sin((t - tBar) * 6) + 1) / 2); LT.glow(ctx, 640, y, 220, 'rgba(255,60,60,1)', 0.3); ctx.fillStyle = 'rgba(230,57,70,0.9)'; ctx.fillRect(470, y - 5, 340, 10); }
  label(ctx, 'JUST FOR THE BARCODES', 540, 640, pop(t, tBar - 0.05), { size: 72, col: C.yellow });
  LT.grade(ctx, 'golden', { vignette: 0.25 });
});

// B1 (s02 "David Phillips spotted a Healthy Choice deal: mail in barcodes, get free airline miles."): the flyer; David looks up at it; a plane flies over
const tDavid = at('s02', 'david'), tFree = at('s02', 'free');
shot('B1 flyer', ST.s02 - 0.12, ST.s03 - 0.12, (ctx, t, lt) => {
  wallBg('#DCE8EE')(ctx);
  const u = E.back(seg(t, ST.s02 - 0.1, ST.s02 + 0.3), 1.4); ctx.save(); ctx.translate(690, lerp(1500, 860, u)); ctx.rotate(0.05 - lt * 0.01); ctx.scale(0.78 + lt * 0.01, 0.78 + lt * 0.01); S.flyer(ctx); ctx.restore();
  bust(ctx, lt, null, DAVID, { face: R.expr(t > tFree ? 'grin' : 'surprised', { look: [0.8, -0.3], blink: blink(t, 2.6) }), x: 230, ny: 1330, s: 1.55, push: 0.02 });
  if (t > tFree - 0.1) { const p = seg(t, tFree - 0.1, tFree + 1.6); ctx.save(); ctx.translate(lerp(-300, 1400, p), 330 - p * 80); ctx.rotate(-0.08); S.plane(ctx, 0.55); ctx.restore(); }
  label(ctx, 'DAVID PHILLIPS · ENGINEER', 540, 400, pop(t, tDavid - 0.05), { size: 48, col: '#FFFDF8' });
  LT.grade(ctx, 'day', { vignette: 0.18 });
});
// B2 (s03 "Ten barcodes, five hundred miles. Mail them early, and the miles DOUBLED."): the equation; ×2 stamp; 500 -> 1,000
const tTen = at('s03', 'ten'), tFive = at('s03', 'five'), tEarly = at('s03', 'early'), tDoubled = at('s03', 'doubled');
shot('B2 math', ST.s03 - 0.12, ST.s04 - 0.12, (ctx, t, lt) => {
  ctx.fillStyle = '#F7F5F0'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = 'rgba(77,141,255,0.12)'; for (let i = 0; i < 30; i++) ctx.fillRect(0, i * 70, W, 3);
  const u1 = pop(t, ST.s03 - 0.12), u2 = pop(t, tFive - 0.1), dbl = t > tDoubled - 0.05;
  if (u1 > 0) { ctx.save(); ctx.translate(540, 640); ctx.rotate(-0.03); ctx.scale(u1, u1); CL.cutout(ctx, () => rr(ctx, -380, -170, 760, 340, 22), '#FFFDF8', { elev: 1.8 });
    for (let i = 0; i < 10; i++) { ctx.save(); ctx.translate(-300 + (i % 5) * 150, -90 + Math.floor(i / 5) * 90); ctx.rotate((K.hash(i) - 0.5) * 0.2); S.barcode(ctx, 120, 70, { digits: false, seed: i }); ctx.restore(); }
    txt(ctx, '10 BARCODES', 0, 140, 58, INK); ctx.restore(); }
  if (u2 > 0) { txt(ctx, '=', 540, 920, 120, INK);
    ctx.save(); ctx.translate(540 + shake(t, tDoubled, 12), 1130); ctx.rotate(0.02); const f = dbl ? E.back(seg(t, tDoubled - 0.05, tDoubled + 0.3), 2) : 1; ctx.scale(u2 * (dbl ? 0.85 + 0.15 * f : 1), u2 * (dbl ? 0.85 + 0.15 * f : 1));
      CL.cutout(ctx, () => rr(ctx, -380, -110, 760, 200, 22), dbl ? C.red : C.yellow, { elev: 2 }); fitTxt(ctx, dbl ? '1,000 MILES' : '500 MILES', 0, 36, 120, dbl ? '#FFFDF8' : INK, 700); ctx.restore(); }
  stampMark(ctx, 'MAIL EARLY ×2', 760, 1330, seg(t, tEarly - 0.05, tEarly + 0.15), { size: 64, rot: 0.08, col: '#2FA37E' });
  LT.grade(ctx, 'day', { vignette: 0.15 });
});

// C1 (s04 "Then he found the cheapest barcode in the store:"): the aisle; a crosshair hops over price tags, lands on the pudding
const tCheap = at('s04', 'cheapest'), tStore4 = at('s04', 'store'), tPud4 = at('s04', 'pudding'), tTwenty = at('s04', 'twenty');
const ITEMS = [['FROZEN MEAL', '$2.00', '#4D8DFF'], ['SOUP', '90¢', '#2FA37E'], ['PUDDING', '25¢', C.red]];
function item(ctx, k) {
  if (k === 2) { S.cup(ctx, 1.9); return; }
  if (k === 0) { CL.cutout(ctx, () => rr(ctx, -150, -200, 300, 200, 12), '#4D8DFF', { elev: 1.2 }); txt(ctx, 'FROZEN', 0, -120, 46, '#FFFDF8'); txt(ctx, 'MEAL', 0, -66, 46, '#FFFDF8'); return; }
  R.fillStroke && (rr(ctx, -95, -230, 190, 230, 18), R.fillStroke(ctx, '#C9CED6', 5)); ctx.fillStyle = '#2FA37E'; ctx.fillRect(-93, -180, 186, 120); txt(ctx, 'SOUP', 0, -105, 54, '#FFFDF8');
}
shot('C1 aisle', ST.s04 - 0.12, tPud4 - 0.12, (ctx, t, lt) => {
  storeBg(9)(ctx); ctx.fillStyle = 'rgba(255,253,246,0.35)'; ctx.fillRect(0, 0, W, H);
  ITEMS.forEach(([n, p], k) => { const x = 200 + k * 340; ctx.save(); ctx.translate(x, 1000); item(ctx, k); ctx.restore(); ctx.save(); ctx.translate(x + 20, 1120); ctx.scale(0.7, 0.7); S.priceTag(ctx, p, { col: k === 2 ? C.yellow : '#FFFDF8' }); ctx.restore(); });
  const hop = [[200, tCheap - 0.1], [540, tStore4 - 0.2], [880, tPud4 - 0.3]]; let cx = 200; for (let i = 1; i < hop.length; i++) cx = lerp(cx, hop[i][0], E.inOut(seg(t, hop[i][1] - 0.25, hop[i][1])));
  ctx.save(); ctx.translate(cx, 900); ctx.strokeStyle = C.red; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(0, 0, 140, 0, 7); ctx.moveTo(-190, 0); ctx.lineTo(-90, 0); ctx.moveTo(90, 0); ctx.lineTo(190, 0); ctx.moveTo(0, -190); ctx.lineTo(0, -90); ctx.moveTo(0, 90); ctx.lineTo(0, 190); ctx.stroke(); ctx.restore();
  label(ctx, 'THE CHEAPEST BARCODE?', 540, 560, pop(t, tCheap - 0.05), { size: 64, col: C.yellow });
  LT.grade(ctx, 'office', { vignette: 0.2 });
});
// C2 (s04 "pudding. Twenty-five cents a cup."): the cup, big; the 25¢ tag slaps on
shot('C2 25c', tPud4 - 0.12, ST.s05 - 0.12, (ctx, t, lt) => {
  storeBg(10)(ctx); LT.glow(ctx, 540, 950, 520, 'rgba(255,248,220,1)', 0.4);
  const z = 1 + lt * 0.05; ctx.save(); ctx.translate(500, 1300); ctx.scale(z * 4, z * 4); LT.lit(ctx, g => S.cup(g, 1), { rim: RIM }); ctx.restore();
  const u = E.back(seg(t, tTwenty - 0.1, tTwenty + 0.2), 2); if (u > 0) { ctx.save(); ctx.translate(760 + shake(t, tTwenty + 0.15, 10), lerp(200, 640, u)); ctx.rotate(0.12); ctx.scale(1.5, 1.5); S.priceTag(ctx, '25¢'); ctx.restore(); }
  label(ctx, 'A CUP', 360, 640, pop(t, at('s04', 'cup') - 0.05), { size: 70, col: '#FFFDF8' });
  LT.grade(ctx, 'office', { vignette: 0.2 });
});

// D1 (s05 "He cleared out store after store..."): the shelf empties into David's cart; the store number ticks up
const tAnd5 = at('s05', 'and'), tManager = at('s05', 'manager'), tCases = at('s05', 'cases');
shot('D1 clear', ST.s05 - 0.12, tAnd5 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 60, -560, 0.82], [2, 120, -540, 0.86]], lt), f = seg(t, ST.s05, tAnd5 - 0.2), load = clamp(0.3 + f);
  ctx.fillStyle = '#EFE8D8'; ctx.fillRect(0, 0, W, H);
  layer(ctx, c, 1, w => { w.fillStyle = '#E9E3D3'; w.fillRect(-3000, 0, 6000, 3000);
    S.shelf(w, 1100, { sign: 'DESSERTS', stock: (r, i) => (K.hash(r * 11 + i * 3) > f ? 1 : 0) });
    w.save(); w.translate(170, 380); S.cart(w, 1.05, { load }); w.restore();
    LT.lit(w, g => R.figure(g, -330, 380, 1.45, 1, DAVID, { lean: 0.1, armN: { hand: [175, -505], grip: 'fist' }, armF: { hand: [150, -500], grip: 'fist' }, face: R.expr('grin', { look: [0.8, 0.1], blink: blink(t, 2.2) }) }), { rim: RIM }); });
  const n = 1 + Math.floor(f * 3.99); label(ctx, `STORE #${n}`, 540, 560, 1, { size: 70, col: C.yellow, rot: n % 2 ? -0.04 : 0.03 });
  LT.grade(ctx, 'office', { vignette: 0.2 });
});
// D2 (s05 "and had a manager order more cases."): the manager on the phone; a hand truck of cases rolls in
shot('D2 cases', tAnd5 - 0.12, ST.s06 - 0.12, (ctx, t, lt) => {
  bust(ctx, lt, storeBg(10), MANAGER, { face: R.expr('surprised', { look: [0.5, 0], blink: blink(t, 2.5) }), x: 380, ny: 1500, s: 2.3,
    hands: [{ side: -1, hand: [-60, -230], grip: 'hold', elbow: [-200, 120], item: g => { g.save(); g.rotate(1.2); rr(g, -18, -70, 36, 140, 10); R.fillStroke(g, '#2A2A30', 4); g.restore(); } }] });
  const u = E.out(seg(t, tManager - 0.2, tCases + 0.2)); ctx.save(); ctx.translate(lerp(1300, 820, u), 1560); ctx.scale(0.95, 0.95); S.handTruck(ctx, 4); ctx.restore();
  label(ctx, '+ MORE CASES', 540, 560, pop(t, tCases - 0.05), { size: 72, col: C.red, fg: '#FFFDF8' });
  LT.grade(ctx, 'office', { vignette: 0.2 });
});

// E1 (s06 "The problem? Twelve thousand barcodes to peel off. By hand. Before the deadline."): the living room full of cups; worried David; the clock
const tTwelve6 = at('s06', 'twelve'), tHand = at('s06', 'hand'), tDead = at('s06', 'deadline');
shot('E1 problem', ST.s06 - 0.12, ST.s07 - 0.12, (ctx, t, lt) => {
  ctx.fillStyle = '#E8D6B8'; ctx.fillRect(0, 0, W, H);
  halfPass(ctx, 5, g => { for (const [x, y] of [[220, 1500], [860, 1500], [540, 1700]]) { g.save(); g.translate(x, y); S.cupPile(g, 9, 0.95, { wide: 1 }); g.restore(); } });
  bust(ctx, lt, null, DAVID, { face: R.expr(t > tHand ? 'worried' : 'thinking', { look: [0.3, 0.4], blink: blink(t, 2.3) }), ny: 1520, s: 2.4, push: 0.03,
    hands: [{ side: 1, hand: [120, -40], grip: 'hold', item: g => { g.save(); g.rotate(1.57); g.translate(0, 60); S.cup(g, 1); g.restore(); } }, { side: -1, hand: [-40, -40], grip: 'pinch' }] });
  label(ctx, '12,000 BARCODES', 540, 520, pop(t, tTwelve6 - 0.05), { size: 80, col: C.yellow });
  label(ctx, 'BY HAND', 300, 680, pop(t, tHand - 0.05), { size: 60, col: '#FFFDF8', rot: -0.06 });
  const cu = pop(t, tDead - 0.3, 0.3); if (cu > 0) { ctx.save(); ctx.translate(840, 760); ctx.scale(cu, cu); M.clock(ctx, 120, t * 3, null); ctx.restore(); }
  stampMark(ctx, 'DEADLINE', 760, 960, seg(t, tDead - 0.05, tDead + 0.15), { size: 70, rot: 0.1 });
  LT.grade(ctx, 'evening', { vignette: 0.25 });
});

// F1 (s07 "His fix: the Salvation Army. Volunteers peeled the barcodes..."): volunteers at a table snip barcodes into a mail sack
const tSalv = at('s07', 'salvation'), tVol = at('s07', 'volunteers'), tAnd7 = at('s07', 'and'), tNeed = at('s07', 'need');
shot('F1 volunteers', ST.s07 - 0.12, tAnd7 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -420, 0.82], [2.5, 0, -440, 0.88]], lt);
  ctx.fillStyle = '#E8E0CC'; ctx.fillRect(0, 0, W, H);
  layer(ctx, c, 1, w => {
    w.fillStyle = '#D9CDB4'; w.fillRect(-2000, 0, 4000, 2000);
    VOLS.forEach((L, i) => { const x = -420 + i * 420; LT.lit(w, g => R.figure(g, x, 60, 1.45, i === 2 ? -1 : 1, L, { armN: { hand: [120 + Math.sin(t * 9 + i) * 10, -330], grip: 'pinch' }, armF: { hand: [80, -320], grip: 'hold' },
      face: R.expr(i === 1 ? 'smile' : 'happy', { look: [0, 0.6], blink: blink(t, 2.4, i) }) }), { rim: RIM }); });
    w.save(); w.translate(0, -340); S.table(w, 1500);
    for (let i = 0; i < 7; i++) { w.save(); w.translate(-560 + i * 170, -10); w.rotate((K.hash(i) - 0.5) * 0.3); S.cup(w, 0.8, { peeled: (t - tVol) * 3 > i }); w.restore(); }
    w.save(); w.translate(560, -10); S.sack(w, 0.9, clamp(0.4 + (t - tVol) * 0.3)); w.restore();
    w.restore();
    for (let i = 0; i < 6; i++) { const ph = ((t - tVol) * 1.3 + i / 6) % 1; if (t < tVol) break; w.save(); w.translate(lerp(-400 + i * 120, 560, ph), -560 - Math.sin(ph * Math.PI) * 260); w.rotate(ph * 5); S.barcode(w, 80, 50, { digits: false, seed: i }); w.restore(); }
    w.save(); w.translate(-120, -380); w.rotate(-0.4); TP.scissors(w, 0.6, 0.5 + 0.5 * Math.sin(t * 20)); w.restore();
  });
  label(ctx, 'SALVATION ARMY VOLUNTEERS', 540, 520, pop(t, tSalv - 0.05), { size: 54, col: C.red, fg: '#FFFDF8' });
  LT.grade(ctx, 'day', { vignette: 0.2 });
});
// F2 (s07 "and the pudding went to people in need."): the donation van, loaded with cups, drives off
shot('F2 van', tAnd7 - 0.12, ST.s08 - 0.12, (ctx, t, lt) => {
  let g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#9FC3E8'); g.addColorStop(0.6, '#F2E6C8'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#B9B1A1'; ctx.fillRect(0, 1250, W, 700); ctx.fillStyle = '#FFFDF6'; for (let x = -200; x < W; x += 300) ctx.fillRect(x - (t * 200) % 300, 1420, 160, 18);
  const u = E.inOut(seg(t, tAnd7, tNeed + 0.6)); ctx.save(); ctx.translate(lerp(560, 1100, Math.max(0, u - 0.25) / 0.75), 1330); ctx.scale(1.1, 1.1);
  ctx.save(); ctx.translate(-120, -360); S.cupPile(ctx, 2, 0.8, { wide: 2 }); ctx.restore(); S.van(ctx); ctx.restore();
  label(ctx, 'DONATED', 540, 560, pop(t, at('s07', 'pudding', 0) - 0.05), { size: 80, col: '#2FA37E', fg: '#FFFDF8' });
  label(ctx, 'TO PEOPLE IN NEED', 540, 690, pop(t, tNeed - 0.2), { size: 56, col: '#FFFDF8' });
  LT.grade(ctx, 'day', { vignette: 0.18 });
});

// G1 (s08 "He spent about three thousand dollars."): the check slaps down
const tSpent = at('s08', 'spent'), tHealthy8 = at('s08', 'healthy'), tMillion8 = at('s08', 'million');
shot('G1 check', ST.s08 - 0.12, tHealthy8 - 0.12, (ctx, t, lt) => {
  ctx.fillStyle = '#5E7A8C'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = 'rgba(255,255,255,0.06)'; for (let i = 0; i < 20; i++) ctx.fillRect(0, i * 100, W, 40);
  const u = E.back(seg(t, ST.s08 - 0.1, tSpent + 0.2), 1.4); ctx.save(); ctx.translate(540 + shake(t, tSpent + 0.2, 10), lerp(1700, 900, u)); ctx.rotate(lerp(0.4, -0.04, u)); ctx.scale(1.15, 1.15); S.check(ctx, '≈ $3,140'); ctx.restore();
  label(ctx, 'ALL ON PUDDING', 540, 560, pop(t, at('s08', 'dollars') - 0.05), { size: 64, col: C.yellow });
  LT.grade(ctx, 'office', { vignette: 0.2 });
});
// G2 (s08 "Healthy Choice sent him over a MILLION miles."): the miles counter rolls up; a plane crosses behind
shot('G2 miles', tHealthy8 - 0.12, ST.s09 - 0.12, (ctx, t, lt) => {
  let g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#4D8DFF'); g.addColorStop(1, '#BFD8F5'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 5; i++) { ctx.save(); ctx.translate(((K.hash(i) * 1400 - t * 60 * (1 + i * 0.2)) % 1400 + 1400) % 1400 - 160, 300 + i * 260); ctx.globalAlpha = 0.8; for (const [dx, r] of [[0, 70], [70, 90], [150, 60]]) { R.ell(ctx, dx, 0, r, r * 0.6); ctx.fillStyle = '#FFFFFF'; ctx.fill(); } ctx.restore(); }
  const p = seg(t, tHealthy8, tMillion8 + 0.4); ctx.save(); ctx.translate(lerp(-400, 1500, seg(t, tHealthy8 - 0.1, ST.s09 - 0.1)), 1250); ctx.rotate(-0.06); S.plane(ctx, 1.1); ctx.restore();
  ctx.save(); ctx.translate(540 + shake(t, tMillion8 + 0.4, 10), 820); ctx.scale(1.08, 1.08); S.milesCounter(ctx, 1253000 * E.out(p)); ctx.restore();
  label(ctx, 'OVER 1,000,000 MILES', 540, 520, pop(t, tMillion8 + 0.05), { size: 70, col: C.yellow });
  LT.grade(ctx, 'day', { vignette: 0.15 });
});

// H1 (s09 "The donation even got him a tax write-off."): the donation receipt gets the TAX WRITE-OFF stamp
const tTax = at('s09', 'tax'), tAnd9 = at('s09', 'and'), tHolly = at('s09', 'hollywood'), tSandler = at('s09', 'sandler');
shot('H1 tax', ST.s09 - 0.12, tAnd9 - 0.12, (ctx, t, lt) => {
  wallBg('#EFE3CB')(ctx);
  const z = 1 + lt * 0.04; ctx.save(); ctx.translate(540, 900); ctx.rotate(-0.03); ctx.scale(z, z);
  CL.cutout(ctx, () => rr(ctx, -330, -400, 660, 800, 12), '#FFFDF6', { elev: 2 }); txt(ctx, 'DONATION RECEIPT', 0, -310, 50, INK); ctx.fillStyle = INK; ctx.fillRect(-270, -280, 540, 5);
  txt(ctx, 'SALVATION ARMY', 0, -210, 40, C.red); txt(ctx, 'Chocolate pudding', 0, -130, 40, '#3A3A40', 'center', F.xb); txt(ctx, '× 12,000+ cups', 0, -76, 40, '#3A3A40', 'center', F.xb);
  ctx.fillStyle = 'rgba(23,23,23,0.18)'; for (let i = 0; i < 5; i++) ctx.fillRect(-250, 0 + i * 50, 500 - K.hash(i + 3) * 160, 18); ctx.restore();
  ctx.save(); ctx.translate(shake(t, tTax + 0.1, 12), 0); stampMark(ctx, 'TAX WRITE-OFF', 540, 1130, seg(t, tTax - 0.05, tTax + 0.15), { size: 84, rot: -0.1, col: '#2FA37E' }); ctx.restore();
  LT.grade(ctx, 'office', { vignette: 0.2 });
});
// H2 (s09 "And Hollywood put his pudding plan into an Adam Sandler movie."): the cinema marquee lights up
shot('H2 movie', tAnd9 - 0.12, ST.s10 - 0.12, (ctx, t, lt) => {
  ctx.fillStyle = '#1B2236'; ctx.fillRect(0, 0, W, H); for (let i = 0; i < 40; i++) { ctx.fillStyle = `rgba(255,253,240,${0.3 + 0.4 * Math.abs(Math.sin(t * 2 + i))})`; ctx.fillRect(K.hash(i) * W, K.hash(i + 40) * 500, 4, 4); }
  const u = E.back(seg(t, tAnd9 - 0.12, tAnd9 + 0.25), 1.6), z = 1 + lt * 0.04; ctx.save(); ctx.translate(540, 760); ctx.scale(u * z, u * z);
  S.marquee(ctx, t, [['NOW SHOWING', 54], ['PUNCH-DRUNK LOVE', 84, C.red], ['STARRING ADAM SANDLER', 44]]); ctx.restore();
  LT.glow(ctx, 540, 760, 600, 'rgba(255,220,140,1)', 0.25 * u);
  footnote(ctx, 'his story inspired the pudding plan in the film (2002)', 1380, seg(t, tSandler - 0.2, tSandler + 0.1));
  LT.grade(ctx, 'evening', { vignette: 0.25 });
});

// I1 (s10 "Every twenty-five-cent cup earned about a hundred miles."): the balance tips toward ~100 miles
const tEarned = at('s10', 'earned'), tHundred = at('s10', 'hundred');
shot('I1 balance', ST.s10 - 0.12, ST.s11 - 0.12, (ctx, t, lt) => {
  ctx.fillStyle = '#F7F5F0'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = 'rgba(77,141,255,0.12)'; for (let i = 0; i < 30; i++) ctx.fillRect(0, i * 70, W, 3);
  const tilt = lerp(0, 0.9, E.back(seg(t, tEarned - 0.1, tHundred + 0.2), 1.4));
  ctx.save(); ctx.translate(540, 660); ctx.scale(1.0, 1.0); S.balance(ctx, tilt, c => { S.cup(c, 1.1); c.save(); c.translate(80, -150); c.scale(0.55, 0.55); S.priceTag(c, '25¢'); c.restore(); },
    c => { for (let i = 0; i < 3; i++) { c.save(); c.translate(-60 + i * 60, -30 - i * 50); c.rotate(-0.1); S.plane(c, 0.22); c.restore(); } }); ctx.restore();
  const u = pop(t, tHundred - 0.05); if (u > 0) { ctx.save(); ctx.translate(800, 1320); ctx.rotate(0.04); ctx.scale(u, u); CL.cutout(ctx, () => rr(ctx, -230, -70, 460, 120, 16), C.yellow, { elev: 1.6 }); txt(ctx, '≈ 100 MILES', 0, 20, 64, INK); ctx.restore(); }
  label(ctx, '1 CUP', 250, 1320, pop(t, ST.s10), { size: 64, col: '#FFFDF8' });
  footnote(ctx, 'math: 1,253,000 miles ÷ ~12,150 cups ≈ 100', 1440, seg(t, tHundred, tHundred + 0.3));
  LT.grade(ctx, 'day', { vignette: 0.15 });
});

// J1 (s11 "He wasn't buying dessert. He was buying a MILLION miles... and he gave the pudding to charity."): David looks straight at us
const tDessert = at('s11', 'dessert'), tMillion11 = at('s11', 'million'), tGave = at('s11', 'gave'), tCharity = at('s11', 'charity');
shot('J1 look', ST.s11 - 0.12, tEnd, (ctx, t, lt) => {
  const pass = t > tMillion11 - 0.1;
  bust(ctx, lt, c => { wallBg('#EFE3CB')(c); halfPass(c, 9, g => { g.save(); g.translate(540, 1500); S.cupPile(g, 7, 1.1, { wide: 3 }); g.restore(); }); }, DAVID,
    { face: R.expr(t > tGave ? 'smile' : 'skeptical', { look: [0, 0.05], blink: blink(t, 3.0) }), push: 0.02, tilt: t > tDessert ? 0.05 : 0,
      hands: [{ side: -1, hand: [-170, -40], grip: 'hold', item: g => { g.save(); g.rotate(1.57); g.translate(0, 60); S.cup(g, 1); g.restore(); } },
        ...(pass ? [{ side: 1, hand: [130, -110], grip: 'pinch', item: g => { g.save(); g.rotate(2.4); g.translate(-60, -70); g.scale(0.42, 0.42); S.boardingPass(g); g.restore(); } }] : [])] });
  label(ctx, 'NOT DESSERT', 540, 520, t < tMillion11 - 0.1 ? pop(t, tDessert - 0.1) : 0, { size: 72, col: '#FFFDF8' });
  label(ctx, 'A MILLION MILES', 540, 520, pass ? pop(t, tMillion11 - 0.1) : 0, { size: 76, col: C.yellow });
  label(ctx, 'PUDDING → CHARITY', 540, 650, pop(t, tCharity - 0.1), { size: 60, col: '#2FA37E', fg: '#FFFDF8' });
  LT.grade(ctx, 'office', { vignette: 0.2 });
});
// K (end card, 2 s+): the pudding mountain again (echo of frame 0) + the question
shot('K end', tEnd, T + 0.01, (ctx, t, lt) => {
  const z = 1.06 - lt * 0.02; ctx.save(); ctx.translate(540, 1100); ctx.scale(z, z); ctx.translate(-540, -1100);
  mountain(ctx, t, lt, R.expr('grin', { look: [0, 0.05], blink: blink(t, 2.6) })); ctx.restore();
  LT.grade(ctx, 'golden', { vignette: 0.22 });
}, { type: 'cut' });

// ---------- edit, global overlays, subtitles ----------
SH.sort((a, b) => a.t0 - b.t0);
const ED = makeEdit(SH, W, H);
const SPLIT = { s01: [6, 6, 4], s02: [7, 7], s03: [5, 7], s04: [9, 5], s05: [6, 7], s06: [2, 6, 5], s07: [5, 4, 8], s08: [6, 8], s09: [8, 6, 5], s10: [8], s11: [4, 6, 7] };
const REPL = [[/twelve thousand/i, '12,000'], [/^Ten barcodes/, '10 barcodes'], [/five hundred/, '500'], [/Twenty-five cents/, '25 cents'], [/three thousand dollars/, '$3,000'], [/twenty-five-cent/, '25-cent'], [/a hundred/, '100']];
function subs() {
  const G = [];
  Object.keys(ST).forEach(id => { const ws = V.words(id); let k0 = 0; SPLIT[id].forEach(n => { G.push({ id, words: ws.slice(k0, k0 + n) }); k0 += n; }); if (k0 !== ws.length) throw new Error(`subtitle split ${id}: ${k0} vs ${ws.length}`); });
  G.forEach((g, i) => { const nx = G[i + 1], e0 = Math.min(g.words[g.words.length - 1].t1, end(g.id)) + 0.4; g.t0 = g.words[0].t0 - 0.05;
    g.t1 = nx ? (nx.id === g.id ? nx.words[0].t0 - 0.05 : Math.min(e0, nx.words[0].t0 - 0.05)) : Math.min(e0, tEnd);
    let s = g.words.map(x => x.w).join(' '); for (const [a, b] of REPL) s = s.replace(a, b); g.text = s; });
  return G;
}
const SUBS = subs();
const TEX = K.paperTexture(W, H);
function frame(ctx, t, o = {}) {
  ED.frame(ctx, t);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  headline(ctx, t); endCard(ctx, t);
  ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.26; ctx.drawImage(TEX, 0, 0); ctx.restore();
  if (!o.nosubs) EN.drawSubtitles(ctx, t, SUBS, { y: 1565, size: 62, maxW: 820, x: 540, highlight: ['BARCODES.', '12,000', 'DOUBLED.', '25', 'MILLION', '$3,000', 'tax', 'write-off.', '100', 'charity.'] });
}

// ---------- sound cues (for mix.py) ----------
function cues() {
  const c = [['slam', 0.0, 2.5], ['stamp', 0.02, 0.8]]; for (let i = 0; i < 10; i++) c.push(['tap', 0.05 + i * 0.09, 1.2]);
  c.push(['pop', tPud1, 0.4], ['cut', tJust - 0.1, 0.35], ['scan', tBar - 0.1, 0.8], ['blip', tBar + 0.3, 0.6]);
  c.push(['cut', ST.s02 - 0.12, 0.35], ['paper', ST.s02 - 0.05, 0.6], ['pop', tDavid - 0.05, 0.4], ['jet', tFree - 0.1, 0.5]);
  c.push(['cut', ST.s03 - 0.12, 0.35], ['pop', tTen - 0.1, 0.5], ['pop', tFive - 0.1, 0.5], ['stamp', tEarly + 0.05, 0.7], ['kaching', tDoubled, 0.5]);
  c.push(['cut', ST.s04 - 0.12, 0.35], ['boop', tCheap - 0.1, 0.4], ['boop', tStore4 - 0.2, 0.4], ['ding', tPud4 - 0.3, 0.45]);
  c.push(['cut', tPud4 - 0.12, 0.35], ['whoosh', tTwenty - 0.15, 0.4], ['slam', tTwenty + 0.15, 0.5]);
  c.push(['cut', ST.s05 - 0.12, 0.35]); for (let i = 0; i < 10; i++) c.push(['clink', ST.s05 + 0.1 + i * (tAnd5 - ST.s05 - 0.3) / 10, 0.3]);
  c.push(['cut', tAnd5 - 0.12, 0.35], ['ring', tAnd5, 0.3], ['steps', tManager, 0.4], ['thump', tCases + 0.1, 0.5]);
  c.push(['cut', ST.s06 - 0.12, 0.35], ['pop', tTwelve6 - 0.05, 0.4], ['pop', tHand - 0.05, 0.4]); for (let i = 0; i < 6; i++) c.push(['tick', tDead - 0.3 + i * 0.15, 0.5]); c.push(['stamp', tDead + 0.1, 0.8]);
  c.push(['cut', ST.s07 - 0.12, 0.35], ['pop', tSalv - 0.05, 0.4]); for (let i = 0; i < 8; i++) c.push(['snip', tVol + i * 0.22, 0.5]);
  c.push(['cut', tAnd7 - 0.12, 0.35], ['engine', tAnd7, 0.6], ['pop', at('s07', 'pudding') - 0.05, 0.4]);
  c.push(['cut', ST.s08 - 0.12, 0.35], ['paper', ST.s08, 0.5], ['slam', tSpent + 0.2, 0.5], ['cut', tHealthy8 - 0.12, 0.35], ['jet', tHealthy8, 0.4]); for (let i = 0; i < 12; i++) c.push(['tick', tHealthy8 + i * (tMillion8 + 0.4 - tHealthy8) / 12, 0.4]); c.push(['kaching', tMillion8 + 0.4, 0.6]);
  c.push(['cut', ST.s09 - 0.12, 0.35], ['stamp', tTax + 0.1, 0.8], ['cut', tAnd9 - 0.12, 0.35], ['sparkle', tHolly, 0.5], ['applause', tSandler, 0.3]);
  c.push(['cut', ST.s10 - 0.12, 0.35], ['twang', tEarned, 0.4], ['ding', tHundred, 0.45]);
  c.push(['cut', ST.s11 - 0.12, 0.35], ['pop', tDessert - 0.1, 0.35], ['pop', tMillion11 - 0.1, 0.45], ['sparkle', tCharity, 0.4]);
  c.push(['cut', tEnd, 0.4], ['pop', tEnd + 0.05, 0.6], ['blip', tEnd + 0.4, 0.4]);
  return c;
}
const MUSIC = { b0: 0, deal: ST.s02, store: ST.s04, problem: ST.s06, fix: ST.s07, money: ST.s08, twist: ST.s10, hit: tEnd, end: T };
// ---------- CLI ----------
const [mode, a1, a2, a3] = process.argv.slice(2);
if (mode === 'cues') { fs.writeFileSync(`${__dirname}/cues.json`, JSON.stringify({ T, vo: Object.entries(ST), sfx: cues(), music: MUSIC })); console.log('cues ok, T =', T); }
else if (mode === 'srt') {
  const f = s => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  fs.writeFileSync(a1, SUBS.map((g, i) => `${i + 1}\n${f(g.t0)} --> ${f(g.t1)}\n${g.text}\n`).join('\n')); console.log('srt ok', SUBS.length);
}
else if (mode === 'still') {
  const ts = a1.split(',').map(Number), tw = 270, th = 480, cols = Math.min(ts.length, 8), rows = Math.ceil(ts.length / cols);
  const sheet = createCanvas(tw * cols, th * rows), sc = sheet.getContext('2d'), cv = createCanvas(W, H), ctx = cv.getContext('2d');
  ts.forEach((t, i) => { frame(ctx, t); sc.drawImage(cv, (i % cols) * tw, Math.floor(i / cols) * th, tw, th); sc.fillStyle = '#E63946'; sc.font = '20px sans-serif'; sc.fillText(t.toFixed(2), (i % cols) * tw + 6, Math.floor(i / cols) * th + 22); });
  fs.writeFileSync(a2, sheet.toBuffer('image/png'));
} else if (mode === 'frame') { const cv = createCanvas(W, H), ctx = cv.getContext('2d'); frame(ctx, +a1, { nosubs: a3 === 'nosubs' }); fs.writeFileSync(a2, cv.toBuffer('image/png')); }
else if (mode === 'carousel') { // 6 key frames (1080x1920 PNG, no subtitles) for a TikTok photo carousel
  const KEY = [['01_hook', 0.7], ['02_double_miles', tDoubled + 0.3], ['03_25_cents', tTwenty + 0.6], ['04_volunteers', tVol + 1.2], ['05_million_miles', tMillion8 + 1.0], ['06_question', tEnd + 1.0]];
  fs.mkdirSync(a1, { recursive: true }); const cv = createCanvas(W, H), ctx = cv.getContext('2d');
  for (const [n, t] of KEY) { frame(ctx, t, { nosubs: true }); fs.writeFileSync(`${a1}/${n}.png`, cv.toBuffer('image/png')); } console.log('carousel ok', KEY.map(k => k[1].toFixed(2)).join(' '));
}
else if (mode === 'shots') console.log(SH.map(s => `${s.id}\t${s.t0.toFixed(2)}–${s.t1.toFixed(2)}\t${(s.t1 - s.t0).toFixed(2)}s`).join('\n') + `\nT = ${T}`);
else if (mode === 'video') (async () => {
  const cv = createCanvas(W, H), ctx = cv.getContext('2d');
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', a1], { stdio: ['pipe', 'inherit', 'inherit'] });
  const N = Math.round(T * FPS), T0 = Date.now();
  for (let f = 0; f < N; f++) { frame(ctx, f / FPS); const buf = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); if (f % 150 === 0) process.stderr.write(`${f}/${N} ${((Date.now() - T0) / 1000).toFixed(0)}s\n`); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
})();
module.exports = { T, ST, SH };
