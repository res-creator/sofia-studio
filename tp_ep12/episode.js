// Episode 12 "The Toilet Paper Panic of 1973" (How It's Run) — Dec 1973: a congressman's "may face a shortage" warning, a late-night joke
// without the "may", empty shelves, limits and price hikes, and the twist: every shopper made the smart move, and that WAS the shortage.
// Story world: the living-room TV -> the emptying shelf -> the aisle -> the calendar -> the gas line -> the headline -> the shopper ->
// the press release -> the scissors -> the studio -> a wall of TVs -> the carts -> the limit sign -> the price tag -> the shopper's look ->
// the equation -> a sea of carts -> THE SHORTAGE stamp -> the paper mill -> the studio again -> restocked/gone -> everyone at once -> the TV.
// Built on hirkit (rig, light, collage, edit). Shots cut on voice-over words. 1080x1920, 30 fps.
// Usage: node episode.js video out.mp4 | still t1,t2,... out.png | frame t out.png | cues | srt out.srt | shots
const { createCanvas } = require('@napi-rs/canvas');
const { spawn } = require('child_process');
const fs = require('fs');
const K = require('../tests/mcd_collage/kit');
const EN = require('../mcd_ep1/engine');            // voice timings + subtitle drawing only (read-only use)
const R = require('../hirkit/rig');
const LT = require('../hirkit/light');
const CL = require('../hirkit/collage');
const { makeEdit } = require('../hirkit/edit');
const S = require('./tpkit');
const { C, F, clamp, lerp, seg, E, rr } = K;
const { INK, ell } = R;
const { W, H, layer, txt, fitTxt, SHOP, HOST, EXTRAS } = S;
const FPS = 30;
const k = (t, a, b, e = E.inOut) => e(seg(t, a, b));

// ---------- voice timeline (natural speed; real speech start/end from vo/speech.json, gaps only) ----------
const LINES = JSON.parse(fs.readFileSync(`${__dirname}/script.json`));
const SP = JSON.parse(fs.readFileSync(`${__dirname}/vo/speech.json`));
const GAP = { s01: 0.3, s02: 0.3, s03: 0.3, s04: 0.35, s05: 0.3, s06: 0.3, s07: 0.35, s08: 0.3, s09: 0.3, s10: 0.4, s11: 0.35, s12: 1.1 };
const ST = {}; let T = 0.15; for (const L of LINES) { ST[L.id] = +(T - SP[L.id][0]).toFixed(3); T += SP[L.id][1] - SP[L.id][0] + GAP[L.id]; } T = +T.toFixed(2);
const V = EN.voice(`${__dirname}/vo`, ST), at = (id, w, n = 0) => V.at(id, w, n), end = id => ST[id] + SP[id][1];

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
// a paper label (names, places)
function label(ctx, s, x, y, u, o = {}) {
  if (u <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.03); ctx.scale(u, u); const size = o.size || 56;
  ctx.font = `${size}px ${F.black}`; const w = ctx.measureText(s).width + 50;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -size * 0.85, w, size * 1.35, 12), o.col || '#FFFDF8', { elev: 1.4 }); txt(ctx, s, 0, size * 0.28, size, o.fg || INK);
  ctx.restore();
}
// a red rubber-stamp impression (screen space), lands with u (0..1)
function stampMark(ctx, s, x, y, u, o = {}) {
  if (u <= 0) return; const size = o.size || 96, sc = lerp(1.8, 1, E.out(clamp(u))), rot = o.rot ?? -0.1;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(u * 3);
  ctx.font = `${size}px ${F.black}`; const w = ctx.measureText(s).width + 70, h = size * 1.45;
  ctx.fillStyle = 'rgba(255,253,246,0.88)'; rr(ctx, -w / 2, -h / 2, w, h, 16); ctx.fill();
  ctx.strokeStyle = C.red; ctx.lineWidth = 12; rr(ctx, -w / 2, -h / 2, w, h, 16); ctx.stroke(); ctx.lineWidth = 4; rr(ctx, -w / 2 + 16, -h / 2 + 16, w - 32, h - 32, 10); ctx.stroke();
  txt(ctx, s, 0, size * 0.36, size, C.red); ctx.restore();
}
// shopper close-up (front bust) over a background
function shopBust(ctx, lt, bg, o) {
  bg(ctx);
  const push = 1 + lt * (o.push ?? 0.03), nx = o.x ?? 540, ny = o.ny ?? 1450;
  ctx.save(); ctx.translate(nx, ny); ctx.scale(push, push); ctx.translate(-nx, -ny);
  const draw = c => R.bust(c, nx, ny, o.s ?? 2.7, o.L || SHOP, { face: o.face, hands: o.hands || [], headTilt: o.tilt || 0, lean: o.lean || 0 });
  LT.lit(ctx, draw, { rim: o.rim ?? RIM, tint: { x0: nx, y0: 0, x1: nx + 540, y1: 0, color: 'rgb(214,205,226)', a: 1 } }); ctx.restore();
}
// the store: a front-view shelf on a tiled floor (world: shelf base at y = 0, centred)
function storeWall(ctx, stock, o = {}) {
  ctx.fillStyle = '#EFE8D8'; ctx.fillRect(-3000, -3000, 6000, 3000);
  ctx.fillStyle = '#E9E3D3'; ctx.fillRect(-3000, 0, 6000, 3000); for (let i = -12; i < 12; i++) for (let j = 0; j < 6; j++) if ((i + j) % 2) { ctx.fillStyle = '#D6CDB9'; ctx.fillRect(i * 240, j * 240, 240, 240); }
  for (const dx of o.wide ? [-1300, 1300] : []) { ctx.save(); ctx.translate(dx, 0); S.shelf(ctx, 1200, { n: 4, stock: stock, price: o.price }); ctx.restore(); }
  S.shelf(ctx, 1200, { n: 4, stock, sign: o.sign ?? 'BATH TISSUE', price: o.price });
}
const stockFrac = f => (r, i) => (K.hash(r * 31 + i * 7 + 3) < f ? 1 : 0); // keep a fraction f of the slots
const tvScreenStudio = (t, o = {}) => (g, w, h) => S.studio(g, w, h, t, o);

// ---------- overlays ----------
// frame-0 hook: ONE JOKE -> EMPTY SHELVES with the date stamp; returns on the last line (loop)
const tEmptied = at('s01', 'emptied'), tTime = at('s12', 'time');
function headline(ctx, t) {
  const a = Math.max(1 - seg(t, ST.s02 - 0.3, ST.s02 - 0.05), seg(t, tLoop - 0.05, tLoop + 0.25)); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2, 330);
  const flip = t >= tEmptied - 0.05 || t > tLoop - 0.2, p = flip ? (t > tLoop - 0.2 ? 1 : E.back(seg(t, tEmptied - 0.05, tEmptied + 0.25), 2.4)) : 1;
  ctx.font = `76px ${F.black}`; const left = 'ONE JOKE', right = flip ? 'EMPTY SHELVES' : ' ? ', wl = ctx.measureText(left + '  →  ').width, wr = ctx.measureText(right).width + 40;
  const fit = Math.min(1, 980 / (ctx.measureText(left + '  →  ').width + ctx.measureText('EMPTY SHELVES').width + 100)); ctx.scale(fit, fit);
  CL.cutout(ctx, () => rr(ctx, -(wl + wr) / 2 - 30, -74, wl + wr + 60, 110, 16), '#FFFDF8', { elev: 1.4 });
  txt(ctx, left + '  →', -(wl + wr) / 2 + 6, 8, 76, INK, 'left');
  ctx.save(); ctx.translate((wl + wr) / 2 - wr / 2 - 10, -18); ctx.scale(p, p); CL.cutout(ctx, () => rr(ctx, -wr / 2, -50, wr, 92, 12), C.red, { elev: 1 }); txt(ctx, right, 0, 26, 76, '#FFFDF8'); ctx.restore();
  ctx.restore();
}
function stampDate(ctx, t) { // the historical label, small, top of the 3:4 crop
  ctx.save(); ctx.translate(W / 2, t < ST.s02 - 0.1 || t > tLoop - 0.1 ? 445 : 262);
  ctx.font = `30px ${F.black}`; const s = 'USA · DEC 1973', w = ctx.measureText(s).width + 44;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -28, w, 54, 10), '#171717', { elev: 0.8, tex: 0 }); txt(ctx, s, 0, 11, 30, C.yellow); ctx.restore();
}

// ================= SHOTS =================
const SH = []; const shot = (id, t0, t1, draw, out) => SH.push({ id, t0, t1, draw, out });

// A1 (s01 "One joke on late-night TV"): the living-room TV, the host grins, the audience laughs; slow push into the screen
const tJoke = at('s01', 'joke');
shot('A1 tv', 0, tEmptied - 0.1, (ctx, t, lt) => {
  const z = 1.02 + lt * 0.05;
  ctx.save(); ctx.translate(540, 1000); ctx.scale(z, z); ctx.translate(-540, -1000);
  S.livingRoom(ctx, -200, -200, 1500, 2400, t);
  ctx.fillStyle = '#7A5230'; ctx.fillRect(-200, 1500, 1500, 600); ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(-200, 1500, 1500, 18);
  ctx.save(); ctx.translate(1000, 1560); S.lamp(ctx); ctx.restore();
  ctx.save(); ctx.translate(500, 1010); S.tvSet(ctx, 800, 620, tvScreenStudio(t, { laugh: seg(t, tJoke + 0.1, tJoke + 0.6), face: R.expr('grin', { look: [0, 0.1], blink: blink(t, 2.6) }) })); ctx.restore();
  LT.glow(ctx, 500, 1010, 700, 'rgba(150,180,255,1)', 0.18);
  ctx.restore();
  LT.grade(ctx, 'evening', { vignette: 0.25 });
}, { type: 'tear', dur: 0.36, at: () => [500, 1010] });

// A2 (s01 "emptied store shelves"): the full shelf; the packs pop off it one after another
const tAcross = at('s01', 'across');
shot('A2 shelf', tEmptied - 0.1, tAcross - 0.1, (ctx, t, lt) => {
  const c = cam([[0, 0, -560, 1.05], [1.2, 0, -540, 1.0]], lt), f = 1 - seg(t, tEmptied, tAcross - 0.25);
  layer(ctx, c, 1, w => storeWall(w, (r, i) => { const th = K.hash(r * 13 + i * 5 + 1); return f > th ? 1 : clamp((f - th + 0.06) / 0.06); }));
  LT.grade(ctx, 'office', { vignette: 0.2 });
});
// A3 (s01 "across America... for a shortage that didn't exist"): the long aisle, empty; NO REAL SHORTAGE stamp on "didn't"
const tDidnt = at('s01', 'didn'), tShort1 = at('s01', 'shortage');
shot('A3 aisle', tAcross - 0.1, ST.s02 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -300, 0.9], [2.6, 0, -380, 0.78]], lt);
  layer(ctx, c, 1, w => S.aisle(w, { stock: 0.05 * (1 - seg(lt, 0, 0.8)) }));
  // a lone shopper with an empty cart far down the aisle
  layer(ctx, c, 1, w => { w.save(); w.translate(-120, 380); w.scale(0.55, 0.55); S.cart(w, 1, { load: 0 }); R.figure(w, -380, 0, 1.2, 1, SHOP, { armN: { hand: [80, -440], grip: 'fist' }, armF: { hand: [60, -430], grip: 'fist' }, face: R.expr('worried', { look: [-0.6, 0] }) }); w.restore(); });
  stampMark(ctx, 'NO REAL SHORTAGE', 540, 1020, seg(t, tDidnt - 0.05, tDidnt + 0.2), { size: 84, rot: -0.08 });
  LT.grade(ctx, 'office', { vignette: 0.22 });
});

// B1 (s02 "December 1973."): the tear-off calendar: NOVEMBER flips up, DECEMBER 1973
const tDec = at('s02', 'december'), tGas = at('s02', 'gas'), tOil = at('s02', 'oil'), tEvery = at('s02', 'everyone');
shot('B1 calendar', ST.s02 - 0.12, tGas - 0.12, (ctx, t, lt) => {
  ctx.fillStyle = '#E8C98E'; ctx.fillRect(0, 0, W, H); halfPass(ctx, 7, g => S.livingRoom(g, 0, 0, W, H));
  const z = 1.25 + lt * 0.04; ctx.save(); ctx.translate(540, 960); ctx.scale(z, z);
  S.calendar(ctx, 'DECEMBER', '1973');
  const u = seg(t, tDec - 0.25, tDec + 0.3); if (u < 1) { ctx.save(); ctx.translate(0, -330); ctx.rotate(-E.in(u) * 0.5); ctx.translate(E.in(u) * -300, -E.in(u) * 900); ctx.translate(0, 330); S.calendar(ctx, 'NOVEMBER', '1973'); ctx.restore(); }
  ctx.restore();
  LT.grade(ctx, 'golden', { vignette: 0.2 });
});
// B2 (s02 "Gas lines."): a line of 1970s sedans tracking past the SORRY NO GAS sign
shot('B2 gas', tGas - 0.12, tOil - 0.12, (ctx, t, lt) => {
  const c = cam([[0, -300, -520, 0.75], [1.3, 200, -520, 0.75]], lt);
  let g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#9FC3E8'); g.addColorStop(0.55, '#F2D9A8'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  layer(ctx, c, 1, w => {
    w.fillStyle = '#B9B1A1'; w.fillRect(-3000, 0, 7000, 2000); w.fillStyle = '#FFFDF6'; for (let x = -3000; x < 4000; x += 300) w.fillRect(x, 230, 160, 18);
    w.save(); w.translate(1000, 0); S.pump(w); w.translate(-460, 0); S.noGasSign(w); w.restore();
    const cols = [S.RUST, S.AVO, S.MUST, S.TEAL, '#8B6A9E', S.RUST];
    for (let i = 0; i < 6; i++) { w.save(); w.translate(400 - i * 820 + Math.sin(t * 3 + i) * 2, 120); S.sedan(w, cols[i]); w.restore(); }
  });
  label(ctx, 'GAS LINES', 540, 560, pop(t, tGas - 0.05), { size: 64, col: C.yellow });
  LT.grade(ctx, 'golden', { vignette: 0.18 });
});
// B3 (s02 "Oil crisis."): the front page slaps in
shot('B3 paper', tOil - 0.12, tEvery - 0.12, (ctx, t, lt) => {
  ctx.fillStyle = '#3A3F48'; ctx.fillRect(0, 0, W, H); for (let i = 0; i < 6; i++) { ctx.save(); ctx.translate(K.hash(i) * W, 400 + K.hash(i + 9) * 1200); ctx.rotate(K.hash(i + 3) - 0.5); ctx.globalAlpha = 0.25; S.newspaper(ctx, 'ENERGY', null, { elev: 0 }); ctx.restore(); }
  const u = E.back(seg(t, tOil - 0.1, tOil + 0.25), 1.6), sh = shake(t, tOil + 0.15, 10);
  ctx.save(); ctx.translate(540 + sh, 960); ctx.rotate(lerp(-0.6, -0.04, u)); ctx.scale(lerp(0.2, 1, u) * (1 + lt * 0.03), lerp(0.2, 1, u) * (1 + lt * 0.03)); S.newspaper(ctx, 'OIL CRISIS', 'GAS LINES ACROSS THE NATION'); ctx.restore();
  LT.grade(ctx, 'evening', { vignette: 0.25 });
});
// B4 (s02 "Everyone's already on edge."): the shopper at home, worried, eyes darting
shot('B4 edge', tEvery - 0.12, ST.s03 - 0.12, (ctx, t, lt) => {
  const look = Math.sin(lt * 3.2) > 0 ? [0.8, 0] : [-0.8, 0];
  shopBust(ctx, lt, c => { c.fillStyle = '#E8C98E'; c.fillRect(0, 0, W, H); halfPass(c, 9, g => { S.livingRoom(g, 0, 0, W, H); g.save(); g.translate(880, 1300); S.lamp(g); g.restore(); }); },
    { face: R.expr('worried', { look, blink: blink(lt, 2.4) }), hands: [{ side: 1, hand: [60, 170], grip: 'hold', elbow: [150, 420] }], tilt: -0.04 });
  LT.grade(ctx, 'golden', { vignette: 0.25 });
});

// C1 (s03 "A congressman warns the U.S. MAY face a toilet paper shortage... in a few months."): the press release types itself; MAY lights up
const tMay = at('s03', 'may'), QT = [at('s03', 'u.s.'), tMay, at('s03', 'face'), at('s03', 'toilet'), at('s03', 'paper'), at('s03', 'few'), at('s03', 'months')];
const typedAt = t => { let n = 0; QT.forEach(q => { if (t >= q - 0.05) n++; }); return n / QT.length; };
const desk = (ctx) => { ctx.fillStyle = '#5E7A8C'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = 'rgba(255,255,255,0.06)'; for (let i = 0; i < 20; i++) ctx.fillRect(0, i * 100, W, 40); };
shot('C1 release', ST.s03 - 0.12, ST.s04 - 0.15, (ctx, t, lt) => {
  desk(ctx);
  const z = 1.02 + lt * 0.025; ctx.save(); ctx.translate(540, 960); ctx.scale(z * 0.9, z * 0.9); ctx.rotate(-0.02); S.pressRelease(ctx, { typed: Math.max(1e-3, typedAt(t)) }); ctx.restore();
  label(ctx, 'CONGRESSMAN · WISCONSIN', 540, 470, pop(t, at('s03', 'congressman') - 0.05), { size: 46, col: C.yellow });
  LT.grade(ctx, 'office', { vignette: 0.22 });
});
// C2 (s04 "The Tonight Show drops the 'may.'"): the scissors snip MAY out of the release; it falls away
const tTonight = at('s04', 'tonight'), tDrops = at('s04', 'drops'), tMay2 = at('s04', 'may');
shot('C2 snip', ST.s04 - 0.15, ST.s05 - 0.12, (ctx, t, lt) => {
  desk(ctx);
  const cut = seg(t, tDrops - 0.1, tMay2 + 0.6), z = 1.0; ctx.save(); ctx.translate(540, 990); ctx.scale(z, z); ctx.rotate(-0.02);
  const [mx, my] = S.pressRelease(ctx, { cut });
  // scissors travel in from the left and snip around the word
  const su = seg(t, tDrops - 0.35, tMay2 + 0.35), sx = lerp(mx - 560, mx - 230, E.out(su)), sy = my + Math.sin(su * Math.PI * 2) * 30;
  if (t < tMay2 + 0.6) { ctx.save(); ctx.translate(sx, sy); ctx.rotate(0.1); S.scissors(ctx, 0.7, 0.5 + 0.5 * Math.sin(t * 22)); ctx.restore(); }
  ctx.restore();
  label(ctx, 'THE TONIGHT SHOW', 540, 470, pop(t, tTonight - 0.05), { size: 60, col: C.red, fg: '#FFFDF8' });
  LT.grade(ctx, 'office', { vignette: 0.22 });
});

// D1 (s05 "Johnny Carson tells"): the studio, ON AIR, the host at the desk (generic host, no likeness)
const t20 = at('s05', '20'), tTheres = at('s05', 'there'), tShort5 = at('s05', 'shortage');
shot('D1 studio', ST.s05 - 0.12, t20 - 0.12, (ctx, t, lt) => {
  const z = 1.0 + lt * 0.06; ctx.save(); ctx.translate(540, 1000); ctx.scale(z, z); ctx.translate(-540, -1000);
  ctx.fillStyle = '#1E2A50'; ctx.fillRect(0, 0, W, H);
  S.studio(ctx, 1080, 1920, t, { hs: 2.6, face: R.expr('smile', { look: [0.2, 0.1], blink: blink(t, 2.9) }), hands: [{ side: 1, hand: [190, 40], grip: 'open' }] });
  ctx.restore();
  ctx.save(); ctx.translate(540, 560); S.onAir(ctx, Math.floor(t * 2) % 2 || lt < 0.3 ? 1 : 1); ctx.restore();
  label(ctx, 'LATE-NIGHT HOST', 540, 1380, pop(t, at('s05', 'johnny') - 0.05), { size: 50, col: '#FFFDF8' });
  LT.grade(ctx, 'evening', { vignette: 0.25 });
});
// D2 (s05 "about 20 million viewers"): a wall of TVs, all showing the same desk; the camera pulls back
shot('D2 tvwall', t20 - 0.12, tTheres - 0.12, (ctx, t, lt) => {
  ctx.fillStyle = '#2A2E3A'; ctx.fillRect(0, 0, W, H);
  const z = lerp(1.0, 0.42, E.inOut(seg(lt, 0, 1.3))); ctx.save(); ctx.translate(540, 1000); ctx.scale(z, z);
  for (let j = -4; j <= 4; j++) for (let i = -4; i <= 4; i++) { const far = Math.max(Math.abs(i), Math.abs(j)); if (far > 0 && lt < 0.15 * far) continue;
    ctx.save(); ctx.translate(i * 820, j * 760); ctx.scale(0.55, 0.55); S.tvSet(ctx, 900, 680, (g, w, h) => S.studio(g, w, h, t + i, { laugh: 0, face: R.expr('grin', { look: [0, 0.1] }) }), { ears: (i + j) % 2 === 0 }); ctx.restore(); }
  ctx.restore();
  ctx.save(); ctx.translate(540, 1060); const u = pop(t, t20 - 0.05, 0.35);
  ctx.scale(u, u); CL.cutout(ctx, () => rr(ctx, -440, -120, 880, 220, 20), C.yellow, { elev: 2 }); txt(ctx, '≈ 20,000,000', 0, 30, 120, INK); txt(ctx, 'VIEWERS', 0, 150, 60, '#FFFDF8'); ctx.restore();
  LT.grade(ctx, 'evening', { vignette: 0.25 });
});
// D3 (s05 "there's a toilet paper shortage."): close on the host; his cue card reads SHORTAGE (no MAY); the audience laughs
shot('D3 joke', tTheres - 0.12, ST.s06 - 0.12, (ctx, t, lt) => {
  const z = 1.25 + lt * 0.05; ctx.save(); ctx.translate(540, 1060); ctx.scale(z, z); ctx.translate(-540, -900);
  S.studio(ctx, 1080, 1920, t, { hs: 2.6, laugh: seg(t, tShort5 + 0.1, tShort5 + 0.6), face: R.expr(t > tShort5 + 0.1 ? 'grin' : 'smug', { look: [0.3, 0.1], blink: blink(t, 2.4) }), hands: [{ side: 1, hand: [210, -30], grip: 'point' }] });
  ctx.restore();
  // the cue card held up from below the frame
  const u = E.back(seg(t, tTheres - 0.05, tTheres + 0.3), 1.6); ctx.save(); ctx.translate(540, lerp(1900, 470, u)); ctx.scale(0.9, 0.9); ctx.rotate(0.03);
  CL.cutout(ctx, () => rr(ctx, -400, -150, 800, 300, 18), '#FFFDF6', { elev: 2 }); fitTxt(ctx, 'TOILET PAPER', 0, -20, 90, INK, 720); fitTxt(ctx, 'SHORTAGE!', 0, 100, 110, C.red, 720); ctx.restore();
  LT.grade(ctx, 'evening', { vignette: 0.25 });
});

// E1 (s06 "Within days, carts are FULL of rolls."): the shopper fills her cart from the shelf; the shelf drains as the pile rises
const tCarts = at('s06', 'carts'), tFull = at('s06', 'full'), tRolls = at('s06', 'rolls');
shot('E1 carts', ST.s06 - 0.12, ST.s07 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 60, -560, 0.82], [2.4, 120, -520, 0.88]], lt), load = 12 * k(t, tCarts - 0.2, tRolls + 0.4, E.out);
  layer(ctx, c, 1, w => {
    storeWall(w, (r, i) => (K.hash(r * 11 + i * 3) * 12 > load ? 1 : 0));
    w.save(); w.translate(150, 380); S.cart(w, 1.05, { load }); w.restore();
    LT.lit(w, g => R.figure(g, -330, 380, 1.45, 1, SHOP, { lean: 0.1, armN: { hand: [175, -505], grip: 'fist' }, armF: { hand: [150, -500], grip: 'fist' }, face: R.expr(t > tFull ? 'grin' : 'smile', { look: [0.8, 0.1], blink: blink(t, 2.2) }) }), { rim: RIM });
  });
  label(ctx, 'WITHIN DAYS', 540, 560, pop(t, ST.s06 - 0.05), { size: 64, col: C.yellow });
  LT.grade(ctx, 'office', { vignette: 0.2 });
});
// E2 (s07 "Stores set limits."): the LIMIT 2 ROLLS sign swings down over the half-empty shelf
const tLimits = at('s07', 'limits'), tOne = at('s07', 'one'), t39 = at('s07', '39'), t69 = at('s07', '69'), tShelves = at('s07', 'shelves');
shot('E2 limit', ST.s07 - 0.12, tOne - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -700, 1.0], [2, 0, -680, 1.05]], lt);
  layer(ctx, c, 1, w => storeWall(w, stockFrac(0.3), { sign: '' }));
  const u = seg(t, tLimits - 0.3, tLimits + 0.2), sw = Math.sin((t - tLimits) * 6) * 0.08 * (1 - seg(t, tLimits, tLimits + 1.5));
  ctx.save(); ctx.translate(540, lerp(-300, 640, E.out(u))); ctx.rotate(t > tLimits ? sw : 0); S.limitSign(ctx, 1.25); ctx.restore();
  LT.grade(ctx, 'office', { vignette: 0.2 });
});
// E3 (s07 "One raises the price from 39 to 69 cents a roll."): the shelf tag: 39¢ gets crossed out, 69¢ drops on top
shot('E3 price', tOne - 0.12, tShelves - 0.12, (ctx, t, lt) => {
  const c = cam([[0, -300, -560, 1.9], [3, -260, -560, 2.05]], lt);
  halfPass(ctx, 8, g => layer(g, c, 1, w => storeWall(w, stockFrac(0.15))));
  ctx.save(); ctx.translate(540, 840); ctx.rotate(-0.03); const u39 = pop(t, t39 - 0.15, 0.3); ctx.scale(u39 * 1.3, u39 * 1.3); S.priceCard(ctx, '39¢', { strike: seg(t, t69 - 0.25, t69 + 0.05) }); ctx.restore();
  if (t > t69 - 0.05) { const u = E.back(seg(t, t69 - 0.05, t69 + 0.25), 2); ctx.save(); ctx.translate(560 + shake(t, t69 + 0.2, 8), lerp(400, 1130, u)); ctx.rotate(0.05); ctx.scale(1.3, 1.3); S.priceCard(ctx, '69¢', { col: C.red, fg: '#FFFDF8' }); ctx.restore(); }
  label(ctx, 'ONE STORE', 540, 560, pop(t, tOne - 0.05), { size: 56, col: '#FFFDF8' });
  LT.grade(ctx, 'office', { vignette: 0.2 });
});
// E4 (s07 "Shelves are still empty."): wide: the empty shelf, the shopper with her full cart looks at it, a last pack is snatched
shot('E4 still empty', tShelves - 0.12, ST.s08 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -640, 0.62], [1.4, 0, -600, 0.68]], lt), last = t < at('s07', 'empty') ? 1 : 0;
  layer(ctx, c, 1, w => { storeWall(w, (r, i) => (r === 1 && i === 2 ? last : 0), { wide: true, price: '69¢' });
    if (!last) { const u = seg(t, at('s07', 'empty'), at('s07', 'empty') + 0.4); w.save(); w.translate(lerp(150, 900, E.in(u)), -320 - u * 200); S.pack(w, 0.9, 1); w.restore(); } });
  LT.grade(ctx, 'office', { vignette: 0.22 });
});

// F1 (s08 "But here's the thing... nobody was being dumb."): the shopper turns to us, deadpan, a pack under her arm
const tNobody = at('s08', 'nobody'), tDumb = at('s08', 'dumb');
shot('F1 look', ST.s08 - 0.12, ST.s09 - 0.12, (ctx, t, lt) => {
  const face = t < tNobody ? R.expr('skeptical', { look: [0, 0.1], blink: blink(lt, 2.6) }) : R.expr('smug', { look: [0, 0.05], blink: blink(lt, 3.1, 0.8) });
  shopBust(ctx, lt, c => { c.fillStyle = '#EFE8D8'; c.fillRect(0, 0, W, H); halfPass(c, 10, g => layer(g, { x: 0, y: -700, z: 0.9 }, 1, w => storeWall(w, () => 0))); },
    { face, push: 0.02, tilt: t > tNobody ? 0.06 : -0.03, hands: [{ side: -1, hand: [-150, 230], grip: 'hold', item: g => { g.save(); g.rotate(-0.15); S.pack(g, 0.7, 2); g.restore(); } }] });
  LT.grade(ctx, 'office', { vignette: 0.22 });
});
// F2 (s09 "If you hear about a shortage, and the shelf is empty... buying extra is the SMART move."): the equation builds on the words
const tHear = at('s09', 'hear'), tShelf9 = at('s09', 'shelf'), tBuying = at('s09', 'buying'), tSmart = at('s09', 'smart');
function card(ctx, x, y, u, w, h, draw, rot = 0) { if (u <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(u, u); CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 20), '#FFFDF6', { elev: 1.8 }); draw(ctx); ctx.restore(); }
shot('F2 math', ST.s09 - 0.12, ST.s10 - 0.12, (ctx, t, lt) => {
  ctx.fillStyle = '#F7F5F0'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = 'rgba(77,141,255,0.12)'; for (let i = 0; i < 30; i++) ctx.fillRect(0, i * 70, W, 3);
  // 1) the news: a small TV saying SHORTAGE
  card(ctx, 290, 560, pop(t, Math.min(tHear - 0.1, ST.s09 + 0.05)), 420, 380, g => { g.save(); g.scale(0.34, 0.34); S.tvSet(g, 820, 620, (s, w, h) => { s.fillStyle = '#1E2A50'; s.fillRect(0, 0, w, h); fitTxt(s, 'SHORTAGE!', w / 2, h / 2 + 40, 130, C.yellow, w - 60); }, { ears: false }); g.restore(); txt(g, 'YOU HEAR IT', 0, 168, 40, INK); }, -0.04);
  if (t > tShelf9 - 0.2) txt(ctx, '+', 540, 590, 120, INK);
  // 2) the empty shelf
  card(ctx, 790, 560, pop(t, tShelf9 - 0.1), 420, 380, g => { g.save(); g.translate(0, 110); g.scale(0.3, 0.3); S.shelf(g, 1000, { n: 4, rows: 3, stock: () => 0 }); g.restore(); txt(g, 'YOU SEE IT', 0, 168, 40, INK); }, 0.04);
  // 3) = one more pack in the cart
  if (t > tBuying - 0.2) txt(ctx, '=', 540, 880, 130, INK);
  card(ctx, 540, 1080, pop(t, tBuying - 0.1), 640, 360, g => { g.save(); g.translate(-110, 90); g.scale(0.42, 0.42); S.cart(g, 1, { load: 5 }); g.restore(); txt(g, '+ EXTRA', 170, 20, 70, C.red); }, -0.02);
  if (t > tSmart - 0.1) { const u = pop(t, tSmart - 0.1, 0.3); ctx.save(); ctx.translate(540, 1330); ctx.scale(u, u); CL.cutout(ctx, () => rr(ctx, -300, -60, 600, 110, 16), '#2FA37E', { elev: 1.6 }); txt(ctx, 'SMART MOVE', 70, 22, 64, '#FFFDF8'); ctx.translate(-220, -6); S.check(ctx, 50, '#FFFDF8'); ctx.restore(); }
  LT.grade(ctx, 'day', { vignette: 0.15 });
});
// G1 (s10 "Everyone made the smart move."): the camera rises over the store: rows of shoppers, every cart full
const tThat = at('s10', 'that');
shot('G1 everyone', ST.s10 - 0.12, tThat - 0.12, (ctx, t, lt) => {
  const z = lerp(0.85, 0.42, E.inOut(seg(lt, 0, 1.3)));
  ctx.fillStyle = '#E9E3D3'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.translate(540, 1100); ctx.scale(z, z);
  for (let j = -4; j <= 3; j++) for (let i = -3; i <= 3; i++) { const x = i * 900 + (j % 2) * 450, y = j * 760, L = [SHOP, ...EXTRAS][(i * 3 + j * 5 + 40) % 5];
    ctx.save(); ctx.translate(x + 140, y); S.cart(ctx, 1, { load: 9 }); ctx.restore();
    R.figure(ctx, x - 230, y, 1.4, 1, L, { lean: 0.1, armN: { hand: [175, -505], grip: 'fist' }, armF: { hand: [150, -500], grip: 'fist' }, face: R.expr('smile', { look: [0.8, 0.1] }) }); }
  ctx.restore();
  LT.grade(ctx, 'office', { vignette: 0.25 });
});
// G2 (s10 "And THAT was the shortage."): the empty shelf, THE SHORTAGE stamped on it
shot('G2 stamp', tThat - 0.12, ST.s11 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -700, 0.95], [2, 0, -680, 1.0]], lt);
  layer(ctx, c, 1, w => storeWall(w, () => 0, { price: '69¢' }));
  const u = seg(t, tThat - 0.05, tThat + 0.15), sh = shake(t, tThat + 0.12, 12);
  ctx.save(); ctx.translate(sh, 0); stampMark(ctx, 'THE SHORTAGE', 540, 900, u, { size: 110, rot: -0.1 }); ctx.restore();
  LT.grade(ctx, 'office', { vignette: 0.22 });
});

// H1 (s11 "The factories never stopped."): the paper mill keeps running, rolls stream down the belt
const tCarson = at('s11', 'carson'), tLater = at('s11', 'later'), tThere = at('s11', 'there');
shot('H1 mill', ST.s11 - 0.12, tCarson - 0.12, (ctx, t, lt) => {
  const c = cam([[0, -60, -380, 0.6], [2, 60, -360, 0.64]], lt);
  ctx.fillStyle = '#D6D2C6'; ctx.fillRect(0, 0, W, H);
  layer(ctx, c, 1, w => { w.fillStyle = '#C2BBAA'; w.fillRect(-2000, -2000, 5000, 1300); for (let x = -1800; x < 3000; x += 420) { w.fillStyle = '#AFC8DC'; w.fillRect(x, -1900, 260, 520); w.strokeStyle = INK; w.lineWidth = 5; w.strokeRect(x, -1900, 260, 520); }
    w.fillStyle = '#A89F8F'; w.fillRect(-2000, 260, 5000, 1500); S.mill(w, t, { len: 1700 }); });
  label(ctx, 'THE FACTORIES: STILL RUNNING', 540, 560, pop(t, at('s11', 'factories') - 0.05), { size: 50, col: '#8EF0A8' });
  LT.grade(ctx, 'day', { vignette: 0.2 });
});
// H2 (s11 "Carson later told viewers: there is no shortage."): back at the desk, calm; the card now reads THERE IS NO SHORTAGE
shot('H2 no shortage', tCarson - 0.12, ST.s12 - 0.12, (ctx, t, lt) => {
  const z = 1.1 + lt * 0.03; ctx.save(); ctx.translate(540, 1060); ctx.scale(z, z); ctx.translate(-540, -900);
  S.studio(ctx, 1080, 1920, t, { hs: 2.6, face: R.expr(t > tThere ? 'smile' : 'neutral', { look: [0, 0.05], blink: blink(t, 3.0) }), hands: [{ side: 1, hand: [170, 30], grip: 'open' }, { side: -1, hand: [-170, 30], grip: 'open' }] });
  ctx.restore();
  label(ctx, 'LATER, ON AIR', 540, 1340, pop(t, tLater - 0.05), { size: 52, col: C.yellow });
  const u = E.back(seg(t, tThere - 0.1, tThere + 0.25), 1.6); if (u > 0) { ctx.save(); ctx.translate(540, lerp(1900, 500, u)); ctx.scale(0.9, 0.9); ctx.rotate(-0.02);
    CL.cutout(ctx, () => rr(ctx, -420, -150, 840, 300, 18), '#FFFDF6', { elev: 2 }); fitTxt(ctx, 'THERE IS', 0, -20, 90, INK, 740); fitTxt(ctx, 'NO SHORTAGE', 0, 100, 110, '#2FA37E', 740); ctx.restore(); }
  LT.grade(ctx, 'evening', { vignette: 0.25 });
});

// I1 (s12 "A shortage doesn't need missing toilet paper."): restocked -> gone, again and again (the shelf loop)
const tLoop = end('s12') - 0.05, tIt = at('s12', 'it'), tMissing = at('s12', 'missing'), tSame = at('s12', 'same');
shot('I1 restock', ST.s12 - 0.12, tIt - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -700, 0.95], [3, 0, -660, 1.0]], lt), cyc = (lt * 1.1) % 1;
  layer(ctx, c, 1, w => storeWall(w, (r, i) => { const d = K.hash(r * 7 + i * 13) * 0.25; const f = cyc < 0.45 ? clamp((cyc - d) / 0.12) : 1 - clamp((cyc - 0.55 - d * 0.6) / 0.08); return f; }, { price: '69¢' }));
  const n = Math.floor(lt * 1.1) + 1; label(ctx, cyc < 0.5 ? 'RESTOCKED' : 'GONE', 540, 1340, 1, { size: 70, col: cyc < 0.5 ? '#8EF0A8' : C.red, fg: cyc < 0.5 ? INK : '#FFFDF8', rot: cyc < 0.5 ? -0.04 : 0.04 });
  label(ctx, `× ${n}`, 860, 1250, 1, { size: 44, col: '#FFFDF8' });
  LT.grade(ctx, 'office', { vignette: 0.2 });
});
// I2 (s12 "It just needs everyone to believe in it... at the same time."): a crowd; on "same" every head gets the same bubble at once
shot('I2 believe', tIt - 0.12, tLoop, (ctx, t, lt) => {
  ctx.fillStyle = '#EFE8D8'; ctx.fillRect(0, 0, W, H);
  const z = lerp(0.72, 0.68, lt / 3); ctx.save(); ctx.translate(540, 700); ctx.scale(z, z);
  const all = t > tSame - 0.1, ppl = [[-560, -120], [0, -180], [560, -120], [-300, 420], [300, 420]];
  ppl.forEach(([x, y], i) => {
    const L = [SHOP, ...EXTRAS][i % 5], u = all ? pop(t, tSame - 0.1 + i * 0.015, 0.3) : (i === 1 ? pop(t, at('s12', 'believe') - 0.1, 0.3) : 0);
    LT.lit(ctx, g => R.bust(g, x, y + 300, 1.3, L, { face: R.expr(u > 0 ? 'worried' : 'neutral', { look: [0, -0.6], blink: blink(t, 2.5, i) }) }), { rim: RIM });
    if (u > 0) { ctx.save(); ctx.translate(x * 0.75, y - 330); ctx.scale(u * 0.8, u * 0.8); S.bubble(ctx, 360, 220, g => { g.save(); g.translate(0, 60); g.scale(0.16, 0.16); S.shelf(g, 1000, { n: 4, rows: 3, stock: () => 0 }); g.restore(); }, [-0.6, 1]); ctx.restore(); }
  });
  ctx.restore();
  LT.grade(ctx, 'day', { vignette: 0.2 });
});
// I3 (s12 "...time." to the end): loop: back to the living-room TV of frame 0, the host still grinning; the headline returns
shot('I3 loop', tLoop, T + 0.01, (ctx, t, lt) => {
  const z = 1.07 - lt * 0.02; ctx.save(); ctx.translate(540, 1000); ctx.scale(z, z); ctx.translate(-540, -1000);
  S.livingRoom(ctx, -200, -200, 1500, 2400, t);
  ctx.fillStyle = '#7A5230'; ctx.fillRect(-200, 1500, 1500, 600); ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(-200, 1500, 1500, 18);
  ctx.save(); ctx.translate(1000, 1560); S.lamp(ctx); ctx.restore();
  ctx.save(); ctx.translate(500, 1010); S.tvSet(ctx, 800, 620, tvScreenStudio(t, { laugh: 1, face: R.expr('grin', { look: [0, 0.1], blink: blink(t, 2.6) }) })); ctx.restore();
  LT.glow(ctx, 500, 1010, 700, 'rgba(150,180,255,1)', 0.18);
  ctx.restore();
  LT.grade(ctx, 'evening', { vignette: 0.25 });
});

// ---------- edit, global overlays, subtitles ----------
SH.sort((a, b) => a.t0 - b.t0);
const ED = makeEdit(SH, W, H);
const SPLIT = { s01: [5, 5, 6], s02: [2, 4, 4], s03: [6, 5, 4], s04: [6], s05: [7, 5], s06: [2, 5], s07: [3, 6, 5, 4], s08: [4, 4], s09: [6, 5, 6], s10: [5, 5], s11: [4, 4, 4], s12: [7, 8, 4] };
const REPL = [[/39/, '39¢'], [/69 cents/, '69¢']];
function subs() {
  const G = [];
  Object.keys(ST).forEach(id => { const ws = V.words(id); let k0 = 0; SPLIT[id].forEach(n => { G.push({ id, words: ws.slice(k0, k0 + n) }); k0 += n; }); if (k0 !== ws.length) throw new Error(`subtitle split ${id}: ${k0} vs ${ws.length}`); });
  G.forEach((g, i) => { const nx = G[i + 1], e0 = Math.min(g.words[g.words.length - 1].t1, end(g.id)) + 0.4; g.t0 = g.words[0].t0 - 0.05;
    g.t1 = nx ? (nx.id === g.id ? nx.words[0].t0 - 0.05 : Math.min(e0, nx.words[0].t0 - 0.05)) : T;
    let s = g.words.map(x => x.w).join(' '); for (const [a, b] of REPL) s = s.replace(a, b); g.text = s; });
  return G;
}
const SUBS = subs();
const TEX = K.paperTexture(W, H);
function frame(ctx, t) {
  ED.frame(ctx, t);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  headline(ctx, t); stampDate(ctx, t);
  ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.26; ctx.drawImage(TEX, 0, 0); ctx.restore();
  EN.drawSubtitles(ctx, t, SUBS, { y: 1565, size: 62, maxW: 820, x: 540, highlight: ['MAY', 'may', '"may."', '20', 'million', 'FULL', '39¢', '69¢', 'dumb.', 'SMART', 'THAT', 'no', 'same'] });
}

// ---------- sound cues (for mix.py) ----------
function cues() {
  const c = [['tvon', 0.0, 0.6], ['laugh', tJoke + 0.15, 0.7], ['tear', tEmptied - 0.25, 0.6]];
  for (let i = 0; i < 8; i++) c.push(['pop', tEmptied + i * (tAcross - tEmptied - 0.3) / 8, 0.35]);
  c.push(['cut', tAcross - 0.1, 0.35], ['stamp', tDidnt + 0.05, 0.8]);
  c.push(['cut', ST.s02 - 0.12, 0.35], ['flip', tDec - 0.2, 0.7], ['cut', tGas - 0.12, 0.35], ['engine', tGas - 0.1, 0.4], ['horn', tGas + 0.5, 0.3]);
  c.push(['cut', tOil - 0.12, 0.35], ['whoosh', tOil - 0.12, 0.5], ['slam', tOil + 0.15, 0.6], ['cut', tEvery - 0.12, 0.35], ['tick', tEvery + 0.3, 0.4], ['tick', tEvery + 1.0, 0.4]);
  c.push(['cut', ST.s03 - 0.12, 0.35]); QT.forEach(q => c.push(['type', q - 0.05, 0.6])); c.push(['ding', tMay + 0.05, 0.45]);
  c.push(['cut', ST.s04 - 0.15, 0.35]); for (let i = 0; i < 4; i++) c.push(['snip', tDrops - 0.1 + i * 0.18, 0.6]); c.push(['fall', tMay2 + 0.3, 0.5]);
  c.push(['cut', ST.s05 - 0.12, 0.35], ['applause', ST.s05 - 0.05, 0.4], ['cut', t20 - 0.12, 0.35], ['tvon', t20, 0.3], ['stamp', t20 + 0.1, 0.5]);
  c.push(['cut', tTheres - 0.12, 0.35], ['whoosh', tTheres - 0.05, 0.4], ['laugh', tShort5 + 0.2, 0.9]);
  c.push(['cut', ST.s06 - 0.12, 0.35]); for (let i = 0; i < 12; i++) c.push(['thump', tCarts - 0.1 + i * (tRolls + 0.4 - tCarts) / 12, 0.25]);
  c.push(['cut', ST.s07 - 0.12, 0.35], ['whoosh', tLimits - 0.3, 0.35], ['slam', tLimits + 0.15, 0.5], ['cut', tOne - 0.12, 0.35], ['tag', t39 - 0.1, 0.5], ['scratch', t69 - 0.25, 0.6], ['slam', t69 + 0.2, 0.5], ['kaching', t69 + 0.25, 0.35]);
  c.push(['cut', tShelves - 0.12, 0.35], ['whoosh', at('s07', 'empty'), 0.35]);
  c.push(['cut', ST.s08 - 0.12, 0.35], ['blip', tNobody - 0.05, 0.3]);
  c.push(['cut', ST.s09 - 0.12, 0.35], ['pop', tHear - 0.1, 0.5], ['pop', tShelf9 - 0.1, 0.5], ['pop', tBuying - 0.1, 0.5], ['ding', tSmart, 0.45]);
  c.push(['cut', ST.s10 - 0.12, 0.35], ['rise', ST.s10, 0.4], ['cut', tThat - 0.12, 0.35], ['stamp', tThat + 0.1, 0.9]);
  c.push(['cut', ST.s11 - 0.12, 0.35], ['machine', ST.s11 - 0.1, 0.4], ['cut', tCarson - 0.12, 0.35], ['tag', tLater, 0.4], ['whoosh', tThere - 0.15, 0.4], ['ding', tThere + 0.15, 0.4]);
  c.push(['cut', ST.s12 - 0.12, 0.35]); for (let i = 0; i < 4; i++) c.push(['pop', ST.s12 + i / 1.1 + 0.2, 0.3]);
  c.push(['cut', tIt - 0.12, 0.35], ['pop', at('s12', 'believe'), 0.4]); for (let i = 0; i < 7; i++) c.push(['pop', tSame - 0.1 + i * 0.015, 0.25]);
  c.push(['cut', tLoop, 0.4], ['laugh', tLoop + 0.1, 0.7]);
  return c;
}
const MUSIC = { b0: 0, story: ST.s02, panic: ST.s06, twist: ST.s08, turn: ST.s11, fin: ST.s12, hit: tLoop, end: T };

// ---------- CLI ----------
const [mode, a1, a2] = process.argv.slice(2);
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
} else if (mode === 'frame') { const cv = createCanvas(W, H), ctx = cv.getContext('2d'); frame(ctx, +a1); fs.writeFileSync(a2, cv.toBuffer('image/png')); }
else if (mode === 'shots') console.log(SH.map(s => `${s.id}\t${s.t0.toFixed(2)}–${s.t1.toFixed(2)}\t${(s.t1 - s.t0).toFixed(2)}s`).join('\n'));
else if (mode === 'video') (async () => {
  const cv = createCanvas(W, H), ctx = cv.getContext('2d');
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', a1], { stdio: ['pipe', 'inherit', 'inherit'] });
  const N = Math.round(T * FPS), T0 = Date.now();
  for (let f = 0; f < N; f++) { frame(ctx, f / FPS); const buf = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.on ? ff.stdin.once('drain', r) : r()); if (f % 150 === 0) process.stderr.write(`${f}/${N} ${((Date.now() - T0) / 1000).toFixed(0)}s\n`); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
})();
module.exports = { T, ST, SH };
