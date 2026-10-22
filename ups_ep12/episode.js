// Episode 12 "The Shortest Route Isn't Always the Cheapest" (How It's Run) — why UPS route planning avoids unnecessary left turns.
// Mike is a fictional example driver. Story world: the three-rights loop from above -> Mike in the cab -> the city street -> the packages ->
// the route device -> EARLIER: the shortcut (POV) -> the left blinker -> waiting while oncoming cars keep coming (road camera, from above,
// the exhaust, the cab) -> inside the route software: the 20-second penalty in the math (not for the driver) -> the race -> MythBusters'
// delivery-truck test (two routes, distance, fuel) -> one mile per driver per day = up to $50M a year (UPS, 2013) -> NOT banned: a left on
// an empty street -> the third right, on purpose -> the delivery -> the block again. Built on hirkit (rig, light, collage, edit). 1080x1920, 30 fps.
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
const S = require('./upskit');
const { C, F, clamp, lerp, seg, E, rr, hash } = K;
const { INK, ell } = R;
const { W, H, layer, txt, fitTxt, MIKE } = S;
const FPS = 30;
const k = (t, a, b, e = E.inOut) => e(seg(t, a, b));

// ---------- voice timeline (natural speed; real speech start/end from vo/speech.json, gaps only) ----------
const LINES = JSON.parse(fs.readFileSync(`${__dirname}/script.json`));
const SP = JSON.parse(fs.readFileSync(`${__dirname}/vo/speech.json`));
const GAP = { s01: 0.3, s02: 0.25, s03: 0.25, s04: 0.3, s05: 0.2, s06: 0.3, s07: 0.35, s08: 0.2, s09: 0.2, s10: 0.2, s11: 0.45, s12: 0.25, s13: 0.3,
  s14: 0.3, s15: 0.5, s16: 0.25, s17: 0.25, s18: 0.2, s19: 0.5, s20: 0.45, s21: 0.25, s22: 0.4, s23: 0.25, s24: 0.3, s25: 0.2, s26: 1.4 };
const ST = {}; let T = 0.15; for (const L of LINES) { ST[L.id] = +(T - SP[L.id][0]).toFixed(3); T += SP[L.id][1] - SP[L.id][0] + GAP[L.id]; } T = +T.toFixed(2);
const V = EN.voice(`${__dirname}/vo`, ST), at = (id, w, n = 0) => V.at(id, w, n), end = id => ST[id] + SP[id][1];

// ---------- helpers ----------
const shake = (t, t0, a = 14) => (t > t0 && t < t0 + 0.35) ? Math.sin((t - t0) * 70) * a * (1 - seg(t, t0, t0 + 0.35)) : 0;
const HALF = createCanvas(W / 2, H / 2), hx = HALF.getContext('2d');
function halfPass(ctx, blur, draw) { // a softer (half-res, blurred) background plane
  hx.setTransform(1, 0, 0, 1, 0, 0); hx.clearRect(0, 0, W / 2, H / 2); hx.setTransform(0.5, 0, 0, 0.5, 0, 0);
  R.LINE.dev = 0.5; draw(hx); R.LINE.dev = 1;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); if (blur > 0.3) ctx.filter = `blur(${blur.toFixed(1)}px)`; ctx.drawImage(HALF, 0, 0, W, H); ctx.restore();
}
const blink = (t, p = 3.3, o = 0) => ((t + o) % p) > p - 0.11 ? 1 : 0;
const RIM = { dir: [-1, -0.35], color: '#FFF3D8', w: 8, a: 0.9 }, RIM_GOLD = { dir: [-1, -0.3], color: '#FFD9A0', w: 9, a: 0.9 };
const pop = (t, t0, d = 0.3, s = 2.2) => t < t0 ? 0 : E.back(seg(t, t0, t0 + d), s);
const on = (t, hz = 1.5) => S.blinkOn(t, hz);
function label(ctx, s, x, y, u, o = {}) { // paper label (names, places, notes)
  if (u <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.03); ctx.scale(u, u); const size = o.size || 56;
  ctx.font = `${size}px ${F.black}`; const w = Math.min(ctx.measureText(s).width + 50, o.maxW || 960);
  CL.cutout(ctx, () => rr(ctx, -w / 2, -size * 0.85, w, size * 1.35, 12), o.col || '#FFFDF8', { elev: 1.4 }); fitTxt(ctx, s, 0, size * 0.28, size, o.fg || INK, w - 40);
  if (o.arrow) { ctx.fillStyle = o.col || '#FFFDF8'; ctx.beginPath(); ctx.moveTo(o.arrow * 20 - 22, size * 0.5); ctx.lineTo(o.arrow * 20 + 22, size * 0.5); ctx.lineTo(o.arrow * 60, size * 1.2); ctx.closePath(); ctx.fill(); ctx.lineWidth = R.px(ctx, 4); ctx.strokeStyle = INK; ctx.stroke(); }
  ctx.restore();
}
function stampBox(ctx, s, x, y, u, col = C.red, size = 72, rot = -0.08) { // rubber-stamp text (hit)
  if (u <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(u, u); ctx.font = `${size}px ${F.black}`; const w = ctx.measureText(s).width + 60;
  ctx.fillStyle = 'rgba(255,253,248,0.9)'; rr(ctx, -w / 2, -size * 0.8, w, size * 1.3, 14); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 9; rr(ctx, -w / 2, -size * 0.8, w, size * 1.3, 14); ctx.stroke();
  txt(ctx, s, 0, size * 0.3, size, col); ctx.restore();
}
const camBounds = c => { const r = Math.hypot(W, H) / 2 / c.z + 200; return [c.x - r, c.y - r, c.x + r, c.y + r]; };

// ================= THE CITY FROM ABOVE: routes, traffic, pedestrians =================
const B = S.B, LN = S.LANE;
const LOOP = S.makePath([[LN, 300], [LN, -B + LN], [B - LN, -B + LN], [B - LN, -LN], [-600, -LN]], 110);   // three rights (around the NE block)
const SHORT = S.makePath([[LN, 300], [LN, -LN], [-600, -LN]], 170);                                      // one left (across oncoming traffic)
const DEST = [-470, -LN - 190];                                                                          // the next delivery (west of the intersection)
const cornerD = [1, 2, 3].map(i => { let best = 0, bd = 1e9; const c = [[LN, -B + LN], [B - LN, -B + LN], [B - LN, -LN]][i - 1]; LOOP.S.forEach((p, j) => { const d = Math.hypot(p[0] - c[0], p[1] - c[1]); if (d < bd) { bd = d; best = LOOP.L[j]; } }); return best; });
// background traffic: loops along lanes that never cross the truck's lanes at the wrong time
const lanePath = (dir, c, a, b) => dir === 'N' ? S.makePath([[c + LN, b], [c + LN, a]], 1) : dir === 'S' ? S.makePath([[c - LN, a], [c - LN, b]], 1) : dir === 'E' ? S.makePath([[a, c + LN], [b, c + LN]], 1) : S.makePath([[b, c - LN], [a, c - LN]], 1);
const TRAFFIC = [];
[['N', -B, 0.2], ['S', -B, 0.55], ['N', B, 0.1], ['S', 2 * B, 0.7], ['E', B, 0.3], ['W', B, 0.8], ['E', -2 * B, 0.15], ['W', -2 * B, 0.6], ['W', -B, 0.35], ['S', 0, 0.52], ['E', 0, 0.62], ['N', -2 * B, 0.4], ['E', 2 * B, 0.05]]
  .forEach(([dir, c, off], i) => { const p = lanePath(dir, c, -3200, 2600); for (let m = 0; m < 3; m++) TRAFFIC.push({ p, v: 520 + hash(i * 3 + m) * 260, off: (off + m * 0.33) * p.len, col: S.CARCOL[(i * 3 + m) % S.CARCOL.length], taxi: (i + m) % 5 === 0 }); });
function drawTraffic(ctx, t, skip, avoid) { for (const c of TRAFFIC) { if (skip && skip(c)) continue; const d = ((c.off + c.v * t) % c.p.len + c.p.len) % c.p.len, [x, y, a] = c.p.at(d); if (avoid && Math.hypot(x - avoid[0], y - avoid[1]) < (avoid[2] || 330)) continue; ctx.save(); ctx.translate(x, y); ctx.rotate(a); S.carTop(ctx, c.col, { taxi: c.taxi }); ctx.restore(); } }
const PEDS = Array.from({ length: 26 }, (_, i) => ({ bi: Math.floor(hash(i * 1.3) * 5) - 2, bj: Math.floor(hash(i * 2.9) * 5) - 3, s0: hash(i * 7.7), v: 0.012 + hash(i) * 0.01, dir: hash(i * 5.1) > 0.5 ? 1 : -1, col: ['#E63946', '#4D8DFF', '#FFC857', '#2E7D5B', '#F2F2EE', '#8B5E3C'][i % 6] }));
function drawPeds(ctx, t) { for (const p of PEDS) { const bx = p.bi * B + S.RH + 24, by = p.bj * B + S.RH + 24, side = B - 2 * S.RH - 48, u = ((p.s0 + p.dir * p.v * t) % 1 + 1) % 1, s = u * 4, e = Math.floor(s), f = s - e;
  const pts = [[bx, by], [bx + side, by], [bx + side, by + side], [bx, by + side], [bx, by]], a = pts[e], b = pts[e + 1], x = lerp(a[0], b[0], f), y = lerp(a[1], b[1], f), ang = Math.atan2(b[1] - a[1], b[0] - a[0]) + (p.dir < 0 ? Math.PI : 0);
  S.pedTop(ctx, x, y, ang, p.col, t * 9 + p.s0 * 10); } }
function aerial(ctx, t, c, o = {}) {
  ctx.fillStyle = S.ASPH; ctx.fillRect(0, 0, W, H);
  layer(ctx, c, 1, w => { S.cityTop(w, t, { bounds: camBounds(c), map: o.map }); if (!o.map) { drawTraffic(w, t, o.skip, o.avoid); drawPeds(w, t); } if (o.world) o.world(w); });
}
// route ribbon (dashed plan or solid driven)
function ribbon(ctx, P, d0, d1, col, w = 30, dash = null, a = 1) { if (d1 <= d0) return; ctx.save(); ctx.globalAlpha *= a; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; if (dash) ctx.setLineDash(dash);
  P.draw(ctx, d0, d1); ctx.strokeStyle = 'rgba(23,23,23,0.55)'; ctx.lineWidth = w + 10; ctx.stroke(); P.draw(ctx, d0, d1); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke(); ctx.restore(); }
function arrowHead(ctx, P, d, col, s = 1) { const [x, y, a] = P.at(d); ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(46, 0); ctx.lineTo(-22, -40); ctx.lineTo(-22, 40); ctx.closePath(); R.fillStroke(ctx, col, 5); ctx.restore(); }
function numBadge(ctx, x, y, n, u, col = C.yellow) { if (u <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(u, u); CL.cutout(ctx, () => ell(ctx, 0, 0, 58, 58), col, { elev: 1.4 }); txt(ctx, String(n), 0, 22, 66, INK); ctx.restore(); }
function bigX(ctx, x, y, u, s = 1) { if (u <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(u * s, u * s); ctx.lineCap = 'round'; for (const [w, c] of [[44, '#FFFDF8'], [26, C.red]]) { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(-60, -60); ctx.lineTo(60, 60); ctx.moveTo(60, -60); ctx.lineTo(-60, 60); ctx.stroke(); } ctx.restore(); }
function pin(ctx, x, y, s, label2) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-40, -60, -70, -90, -70, -130); ctx.arc(0, -130, 70, Math.PI, 0); ctx.bezierCurveTo(70, -90, 40, -60, 0, 0); ctx.closePath(); R.fillStroke(ctx, C.red, 5);
  ctx.save(); ctx.translate(0, -112); S.packageBox(ctx, 0.42); ctx.restore(); if (label2) label(ctx, label2, 0, -260, 1, { size: 44, col: '#FFFDF8' }); ctx.restore(); }

// ---------- overlays: frame-0 headline, the EXAMPLE stamp ----------
function headline(ctx, t, l1, l2, a = 1, y = 330) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2, y);
  CL.cutout(ctx, () => rr(ctx, -440, -78, 880, 112, 16), '#FFFDF8', { elev: 1.6 }); fitTxt(ctx, l1, 0, 4, 80, INK, 820);
  ctx.translate(0, 124); ctx.rotate(-0.02); CL.cutout(ctx, () => rr(ctx, -330, -74, 660, 108, 14), C.red, { elev: 1.6 }); fitTxt(ctx, l2, 0, 8, 80, '#FFFDF8', 600);
  ctx.restore();
}
function exampleStamp(ctx, t) { // small and always honest: Mike and his route are an illustration
  const show = (t >= 0 && t < ST.s16 - 0.12) || (t > ST.s21 - 0.12); if (!show) return;
  ctx.save(); ctx.translate(W / 2, 222); ctx.font = `28px ${F.black}`; const s = 'ILLUSTRATIVE EXAMPLE · MIKE IS FICTIONAL', w = ctx.measureText(s).width + 40;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -26, w, 50, 10), '#171717', { elev: 0.8, tex: 0 }); txt(ctx, s, 0, 10, 28, C.yellow); ctx.restore();
}

// ================= SHOTS =================
const SH = []; const shot = (id, t0, t1, draw, out) => SH.push({ id, t0, t1, draw, out });

// ---------- A1 (s01): from above — the brown truck makes three right turns around the block instead of one left ----------
const tThree = at('s01', 'three'), tOne = at('s01', 'one'), tLeft1 = at('s01', 'left');
const driveA = LOOP.timing(1450, 0.5), A1END = ST.s02 - 0.12;
const loopD = t => driveA(t + 0.05);
function blockScene(w, t, d, o = {}) { // routes + badges + the truck, in world space
  ribbon(w, LOOP, 0, LOOP.len, '#FFC857', 30, [40, 26], 0.75);
  ribbon(w, LOOP, 0, d, o.loopCol || '#5BE37A', 34);
  arrowHead(w, LOOP, LOOP.len - 20, o.loopCol || '#5BE37A', 1.2);
  ribbon(w, SHORT, 120, 640, C.red, 30, null, o.shortA ?? 1); arrowHead(w, SHORT, 650, C.red, 1.2);
  const [x, y, a] = LOOP.at(d), nextC = cornerD.find(c => c > d - 30), blinkR = nextC !== undefined && nextC - d < 520 && nextC - d > -60;
  w.save(); w.translate(x, y); w.rotate(a); S.truckTop(w, { blinkR: blinkR && on(t, 2) }); w.restore();
}
shot('A1 three rights', 0, A1END, (ctx, t, lt) => {
  const c = { x: 150, y: -470, z: lerp(0.6, 0.64, seg(t, 0, A1END)), r: 0 }, d = loopD(t);
  aerial(ctx, t, c, { avoid: LOOP.at(d), world: w => {
    blockScene(w, t, d);
    cornerD.forEach((cd, i) => { const [x, y] = LOOP.at(cd); numBadge(w, x + (i === 0 ? -120 : i === 1 ? 120 : 120), y + (i === 2 ? 120 : -120), i + 1, pop(t, driveA.inv ? 0 : timeAtD(cd) - 0.1, 0.3) * 1.5); });
    { const q = SHORT.at(380); bigX(w, q[0], q[1], pop(t, tOne - 0.05, 0.3, 2.4), 1.1); }
  } });
  headline(ctx, t, '3 RIGHT TURNS', 'TO AVOID 1 LEFT', 1, 360);
  LT.grade(ctx, 'day', { vignette: 0.14 });
});
function timeAtD(dd) { let lo = 0, hi = 8; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (loopD(m) < dd) lo = m; else hi = m; } return lo; }

// ---------- the cab (Mike front bust), used by several shots ----------
const CAB = createCanvas(W, H);
function cabBg(ctx, t, o = {}) {
  const g = ctx.createLinearGradient(0, 0, W, 0); g.addColorStop(0, '#2B2420'); g.addColorStop(1, '#4A3F36'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // the open door (screen left) shows the street
  ctx.save(); ctx.beginPath(); ctx.rect(0, 260, 360, 1400); ctx.clip();
  const sx = o.move ? t * 620 : 0;
  halfPass(ctx, o.blur ?? 5, g2 => { g2.fillStyle = '#9CC9F0'; g2.fillRect(0, 0, W * 2, H * 2); layer(g2, { x: -300 + sx, y: -500, z: 0.62 }, 1, w => { S.streetSide(w, t, { x0: -1200 + sx, x1: 1600 + sx, evening: o.evening }); if (o.outside) o.outside(w); }); });
  if (o.light) LT.grade(ctx, o.light, { vignette: 0 });
  ctx.restore();
  CL.cutout(ctx, () => { ctx.beginPath(); ctx.rect(346, 220, 40, 1500); }, '#5E3F25', { elev: 1, tex: 0.3 });
  ctx.fillStyle = '#3A2A1C'; ctx.fillRect(0, 200, 400, 70);
  // the shelves of packages behind him (bulkhead opening, right)
  ctx.save(); ctx.globalAlpha = 0.85; ctx.fillStyle = '#5A4A3C'; ctx.fillRect(760, 380, 320, 1100); ctx.strokeStyle = '#3A2E24'; ctx.lineWidth = 10; for (const y of [700, 1000, 1300]) { ctx.beginPath(); ctx.moveTo(760, y); ctx.lineTo(1080, y); ctx.stroke(); }
  for (let i = 0; i < 9; i++) { const y = [700, 1000, 1300][i % 3], x = 780 + Math.floor(i / 3) * 100; rr(ctx, x, y - 100 - (i % 2) * 30, 86, 100 + (i % 2) * 30, 4); R.fillStroke(ctx, ['#C9A06A', '#B98D55', '#D8B27C'][i % 3], 3); } ctx.restore();
}
function steering(ctx, o = {}) { ctx.save(); ell(ctx, 560, 1900, 460, 190); ctx.lineWidth = 54; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 40; ctx.strokeStyle = '#2F3136'; ctx.stroke(); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.ellipse(560, 1890, 450, 182, 0, Math.PI * 1.1, Math.PI * 1.6); ctx.stroke(); ctx.restore();
  if (o.hand) { const [hx2, hy2] = o.hand; R.tube(ctx, [[hx2 + 140, 2060], [hx2 + 40, hy2 + 60]], 120, MIKE.top, 5); R.hand(ctx, [hx2, hy2], o.handA ?? -2.3, MIKE.skin, o.grip || 'relax', { size: 3 }); } }
function mikeCab(ctx, t, lt, o = {}) {
  cabBg(ctx, t, o);
  const push = 1 + lt * (o.push ?? 0.03), nx = o.x ?? 600, ny = o.ny ?? 1520;
  ctx.save(); ctx.translate(nx, ny); ctx.scale(push, push); ctx.translate(-nx, -ny);
  const draw = c => S.mikeBust(c, nx, ny, o.s ?? 2.5, { face: o.face, hands: o.hands || [], headTilt: o.tilt || 0, lean: o.lean || 0 });
  const lo = { rim: o.rim ?? { dir: [-1, -0.2], color: '#FFF1D2', w: 9, a: 0.9 }, tint: { x0: nx - 100, y0: 0, x1: nx + 540, y1: 0, color: 'rgb(190,170,160)', a: 1 } };
  LT.lit(ctx, draw, lo); ctx.restore();
  if (o.wheel !== false) steering(ctx, o);
  if (o.over) o.over(ctx);
}

// ---------- A2 (s02 "Sounds ridiculous, right?"): Mike in the cab, deadpan at us, one eyebrow up ----------
shot('A2 ridiculous', A1END, ST.s03 - 0.12, (ctx, t, lt) => {
  const tR = at('s02', 'right');
  mikeCab(ctx, t, lt, { move: true, face: R.exprMix(R.expr('neutral', { look: [-0.6, 0], blink: blink(lt, 2) }), R.expr('skeptical', { look: [0, 0.05] }), k(t, at('s02', 'ridiculous'), tR)), tilt: lerp(0, 0.06, k(t, tR - 0.2, tR + 0.2)),
    hand: [800, 1745], grip: 'relax', handA: -2.2 });
  LT.grade(ctx, 'day', { vignette: 0.2 });
});

// ---------- B1 (s03 + "Meet Mike."): the street — wide on the city, the camera finds the truck and pushes in to Mike at the open door ----------
const tMike = at('s04', 'mike'), tHes = at('s04', "he's"), tFull = at('s04', 'full'), tComp = at('s04', 'computer-planned');
const truckX = t => -900 + (t - ST.s03) * 560;
function streetBg(ctx, c, t, o = {}) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, o.skyTop || '#8EC3EE'); g.addColorStop(1, o.skyBot || '#F6E6C6'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  layer(ctx, { ...c, y: c.y - 200 }, 0.35, w => S.skyline(w, c.x * 0.35 - 3000, c.x * 0.35 + 3000, -400, '#B4C6D8'));
  LT.haze(ctx, 'day', 0.12);
}
shot('B1 street', ST.s03 - 0.12, tHes - 0.12, (ctx, t, lt) => {
  const tx = truckX(t), u = k(t, at('s03', 'reason') - 0.1, tMike + 0.1), c = { x: lerp(tx + 120, tx + 340, u), y: lerp(-760, -380, u), z: lerp(0.4, 0.95, u), r: 0 };
  streetBg(ctx, c, t);
  layer(ctx, c, 1, w => {
    S.streetSide(w, t, { x0: c.x - 1500 / c.z, x1: c.x + 1500 / c.z, cross: [-1500, 2600] });
    // pedestrians on the sidewalk
    for (let i = 0; i < 7; i++) { const px0 = -1800 + i * 600 + ((t * (40 + i * 9)) % 600) * (i % 2 ? 1 : -1), P = R.walk(t * 6 + i, { stride: 50, lift: 26, bob: 8 });
      R.figure(w, px0, -30, 0.42, i % 2 ? 1 : -1, { skin: ['#E8B48F', '#8D5A3C', '#C98B62', '#F0C9A6'][i % 4], hair: '#2A1C14', hairStyle: ['short', 'bun', 'curly', 'long'][i % 4], top: S.CARCOL[i % 8], pants: '#2E3A59', shoes: '#F7F5F0' }, P); }
    // far lane traffic behind, the truck, near lane traffic in front
    for (let i = 0; i < 3; i++) { w.save(); w.translate(((-2600 + i * 1700 + t * 380) % 5200) - 1600, 190); w.scale(-0.9, 0.9); S.carSide(w, S.CARCOL[(i + 2) % 8], { rot: t * 6, taxi: i === 1 }); w.restore(); }
    w.save(); w.translate(tx, 300); LT.lit(w, g => S.truckSide(g, { rot: -t * 6.5, driver: g2 => S.mikeHeadSide(g2, 384, -420, 58, { ...R.expr(t > tMike ? 'smile' : 'neutral', { look: [t > tMike ? -0.2 : 1, 0], blink: blink(lt, 2.4) }) }) }), { rim: RIM }); w.restore();
    for (let i = 0; i < 2; i++) { const x = tx + 2600 - ((t - ST.s03) * 900 + i * 2100) % 4200; w.save(); w.translate(x, 640); S.carSide(w, S.CARCOL[i * 3 % 8], { rot: -t * 9 }); w.restore(); }
  });
  label(ctx, 'MIKE', 640, 620, pop(t, tMike), { arrow: 1, size: 78, col: C.yellow });
  label(ctx, 'EXAMPLE DRIVER', 640, 760, pop(t, tMike + 0.15), { size: 40, rot: 0.03 });
  LT.grade(ctx, 'day', { vignette: 0.14 });
});
// ---------- B2 ("He's got a truck full of packages"): side view, the box turns see-through ----------
shot('B2 packages', tHes - 0.12, tComp - 0.12, (ctx, t, lt) => {
  const tx = truckX(t), c = { x: tx - 60, y: -330, z: 0.82, r: 0 };
  streetBg(ctx, c, t);
  layer(ctx, c, 1, w => { S.streetSide(w, t, { x0: c.x - 1500, x1: c.x + 1500, cross: [-1500, 2600] });
    w.save(); w.translate(tx, 300); LT.lit(w, g => S.truckSide(g, { rot: -t * 6.5, xray: k(t, tFull - 0.2, tFull + 0.3), driver: g2 => S.mikeHeadSide(g2, 384, -420, 58, R.expr('smile', { look: [1, 0] })) }), { rim: RIM }); w.restore(); });
  label(ctx, 'PACKAGES', 400, 560, pop(t, at('s04', 'packages') - 0.05), { size: 64, col: '#FFFDF8' });
  LT.grade(ctx, 'day', { vignette: 0.14 });
});
// the route device screen: a flat map with numbered stops and the planned line drawing itself
function routeScreen(ctx, w, h, u, o = {}) {
  ctx.fillStyle = '#FFFDF8'; ctx.fillRect(0, 0, w, h);
  ctx.save(); ctx.translate(w / 2, h / 2 + 10); ctx.scale(o.z ?? 0.13, o.z ?? 0.13); ctx.translate(-200, 200);
  S.cityTop(ctx, 0, { bounds: [-1600, -1600, 1600, 1400], map: true, noPark: true });
  ribbon(ctx, LOOP, 0, LOOP.len * u, '#2E7D5B', 70);
  if (o.short) ribbon(ctx, SHORT, 0, SHORT.len * o.short, C.red, 70, [90, 60]);
  const stops = [[LN, 300], [B - LN, -B], [-760, -LN], [-B, 800], [B + 300, 600]]; stops.forEach(([x, y], i) => { ell(ctx, x, y, 90, 90); R.fillStroke(ctx, C.yellow, 5); txt(ctx, String(i + 1), x, y + 34, 100, INK); });
  ctx.restore();
  ctx.fillStyle = '#2E3A59'; ctx.fillRect(0, 0, w, 44); fitTxt(ctx, o.title || 'TODAY\'S ROUTE', w / 2, 31, 22, '#FFFDF8', w - 20);
}
// ---------- B3 ("and a computer-planned route."): the handheld device on the dash — the planned route draws itself ----------
shot('B3 route', tComp - 0.12, ST.s05 - 0.12, (ctx, t, lt) => {
  cabBg(ctx, t, { move: true, blur: 10 }); ctx.fillStyle = 'rgba(30,24,20,0.35)'; ctx.fillRect(0, 0, W, H);
  const z = 1 + lt * 0.05; ctx.save(); ctx.translate(540, 900); ctx.scale(z, z); ctx.rotate(-0.04);
  S.device(ctx, (p, w, h) => routeScreen(p, w, h, k(t, tComp - 0.1, ST.s05 - 0.2, E.out)), 2.2); ctx.restore();
  LT.lit(ctx, c => { R.tube(c, [[960, 2000], [860, 1500]], 150, MIKE.top, 5); R.hand(c, [800, 1390], -2.0, MIKE.skin, 'hold', { size: 3.2 }); }, { rim: RIM });
  label(ctx, 'COMPUTER-PLANNED ROUTE', 540, 330, pop(t, tComp), { size: 52, col: C.yellow });
  LT.grade(ctx, 'office', { vignette: 0.2 });
});

// ---------- C1 (s05 "He spots a shortcut."): EARLIER — rewind; Mike's eyes go to the side street ----------
shot('C1 spots', ST.s05 - 0.12, ST.s06 - 0.12, (ctx, t, lt) => {
  const tSp = at('s05', 'shortcut');
  mikeCab(ctx, t, lt, { s: 2.9, ny: 1640, push: 0.08, face: R.exprMix(R.expr('neutral', { look: [0, 0] }), R.expr('squint', { look: [1, -0.1] }), k(t, ST.s05, tSp)), tilt: -0.04, wheel: true });
  // rewind sticker
  const u = pop(t, ST.s05 - 0.1, 0.25); label(ctx, '◀◀  EARLIER', 540, 330, u, { size: 70, col: '#171717', fg: C.yellow, rot: -0.04 });
  if (lt < 0.25) { ctx.fillStyle = `rgba(255,255,255,${0.35 * (1 - lt / 0.25)})`; for (let y = 0; y < H; y += 60) ctx.fillRect(0, y + (lt * 900) % 60, W, 8); }
  LT.grade(ctx, 'day', { vignette: 0.22 });
});

// ---------- perspective street shared settings ----------
// the driver's POV: we are in our lane (X = +1.75), the intersection at Z 16..23, the next delivery down the cross street to the left
const POV = S.persp({ vx: 540, vy: 860, f: 700, camH: 2.3, camX: 1.75, zc0: 16, zc1: 23 });
function windshield(ctx, t, o = {}) {
  ctx.save(); ctx.fillStyle = '#1F1A16';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W, 0); ctx.lineTo(W, 300); ctx.lineTo(980, 230); ctx.lineTo(100, 230); ctx.lineTo(0, 300); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(0, 300); ctx.lineTo(100, 230); ctx.lineTo(170, 1320); ctx.lineTo(0, 1340); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(W, 300); ctx.lineTo(980, 230); ctx.lineTo(910, 1320); ctx.lineTo(W, 1340); ctx.closePath(); ctx.fill();
  CL.cutout(ctx, () => { ctx.beginPath(); ctx.moveTo(-20, 1300); ctx.quadraticCurveTo(540, 1240, 1100, 1300); ctx.lineTo(1100, 1960); ctx.lineTo(-20, 1960); ctx.closePath(); }, '#3A332D', { elev: 1.4, tex: 0.3 });
  rr(ctx, 460, 236, 160, 54, 12); R.fillStroke(ctx, '#2A2E33', 4); ctx.fillStyle = 'rgba(160,200,240,0.5)'; rr(ctx, 470, 244, 140, 38, 8); ctx.fill(); // mirror
  ctx.restore();
  // the device on the dash + the cluster
  ctx.save(); ctx.translate(860, 1330); ctx.rotate(0.06); S.device(ctx, (p, w, h) => routeScreen(p, w, h, 1, { short: o.short || 0, title: 'NEXT STOP' }), 0.62); ctx.restore();
  ctx.save(); ctx.translate(360, 1420); ctx.scale(0.5, 0.5); S.cluster(ctx, { blinkL: o.blinkL, fuel: o.fuel ?? 0.7 }); ctx.restore();
  // wheel + hands
  ctx.save(); ell(ctx, 360, 1760, 330, 150); ctx.lineWidth = 44; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 32; ctx.strokeStyle = '#2F3136'; ctx.stroke(); ctx.restore();
  for (const [hx2, a] of [[110, -1.3], [610, -1.85]]) { R.tube(ctx, [[hx2 + (hx2 < 300 ? -60 : 60), 2050], [hx2, 1690]], 110, MIKE.top, 5); R.hand(ctx, [hx2, 1640], a, MIKE.skin, 'fist', { size: 2.6 }); }
}
// a painted arrow on the ground plane (perspective), points [[X, Z], ...]
function groundArrow(ctx, PV, pts, col, wM = 1.1, u = 1) {
  const n = pts.length, m = Math.max(2, Math.floor(n * u)); ctx.save(); ctx.fillStyle = col;
  for (let i = 0; i < m - 1; i++) { const [x0, z0] = pts[i], [x1, z1] = pts[i + 1], dx = x1 - x0, dz = z1 - z0, l = Math.hypot(dx, dz) || 1, nx = -dz / l * wM / 2, nz = dx / l * wM / 2;
    PV.quad(ctx, [[x0 + nx, 0.02, z0 + nz], [x1 + nx, 0.02, z1 + nz], [x1 - nx, 0.02, z1 - nz], [x0 - nx, 0.02, z0 - nz]]); ctx.fill(); }
  const [xa, za] = pts[m - 2], [xb, zb] = pts[m - 1], dx = xb - xa, dz = zb - za, l = Math.hypot(dx, dz) || 1, ux = dx / l, uz = dz / l;
  PV.quad(ctx, [[xb - uz * wM * 1.2, 0.02, zb + ux * wM * 1.2], [xb + ux * wM * 1.8, 0.02, zb + uz * wM * 1.8], [xb + uz * wM * 1.2, 0.02, zb - ux * wM * 1.2]]); ctx.fill(); ctx.restore();
}
const ARROW_LEFT = (() => { const p = []; for (let i = 0; i <= 40; i++) { const u = i / 40; if (u < 0.35) p.push([1.75, lerp(6, 16.5, u / 0.35)]); else { const a = (u - 0.35) / 0.65 * Math.PI / 2; p.push([1.75 - 6.2 * (1 - Math.cos(a)), 16.5 + 4.75 * Math.sin(a)]); } } return p; })();
// oncoming cars (lane X = -1.75), Z decreasing; spacing and speed in metres
const ONC = Array.from({ length: 14 }, (_, i) => ({ z0: 30 + i * 11 + hash(i) * 4, v: 12 + hash(i * 3) * 2, col: S.CARCOL[(i * 5 + 1) % S.CARCOL.length], taxi: i % 4 === 1 }));
const oncZ = (c, t, t0) => c.z0 - c.v * (t - t0);

// ---------- C2 (s06 "One left turn. Straight to the next delivery."): POV through the windshield ----------
const tLeftTurn = at('s06', 'left'), tDeliv = at('s06', 'delivery');
shot('C2 POV', ST.s06 - 0.12, ST.s07 - 0.12, (ctx, t, lt) => {
  POV.ground(ctx, t); POV.buildings(ctx, t, 1.2); POV.signal(ctx, '#5BE37A');
  groundArrow(ctx, POV, ARROW_LEFT, 'rgba(255,200,87,0.95)', 1.6, k(t, tLeftTurn - 0.2, tLeftTurn + 0.5, E.out));
  // a couple of far oncoming cars only (it looks easy)
  for (const [z, col] of [[70, '#8FA3B5'], [95, '#E63946']]) POV.place(ctx, -1.75, z - lt * 4, 1.8, 180, g => S.carFront(g, col));
  const pu = pop(t, tDeliv - 0.1, 0.35); if (pu > 0) { const p = POV.P(-5.5, 8.5, 26.2); pin(ctx, p[0], p[1], 0.9 * pu, null); label(ctx, 'NEXT DELIVERY', p[0] + 40, p[1] + 70, pu, { size: 44, col: '#FFFDF8' }); }
  label(ctx, 'SHORTCUT: 1 LEFT', 540, 340, pop(t, tLeftTurn), { size: 58, col: C.yellow, rot: 0.02 });
  windshield(ctx, t, { short: k(t, tLeftTurn, tLeftTurn + 0.8) });
  LT.grade(ctx, 'day', { vignette: 0.18 });
});
// ---------- C3 (s07 "Easy."): grin, the stalk goes down — the left blinker starts ticking ----------
shot('C3 easy', ST.s07 - 0.12, ST.s08 - 0.12, (ctx, t, lt) => {
  const tE = ST.s07, flick = k(t, tE - 0.05, tE + 0.15);
  mikeCab(ctx, t, lt, { x: 470, face: R.expr('grin', { look: [0.2, 0.1] }), tilt: 0.05, wheel: true, hand: [lerp(840, 860, flick), lerp(1640, 1740, flick)], grip: 'fist', handA: -2.0,
    over: c => { c.save(); c.translate(790, 1060); c.scale(0.55, 0.55); S.cluster(c, { blinkL: t > tE + 0.1 && on(t - tE, 1.6), fuel: 0.7 }); c.restore(); } });
  LT.grade(ctx, 'day', { vignette: 0.2 });
});

// ---------- D1 (s08 "Except... the traffic doesn't stop."): low road camera behind the truck — oncoming cars keep coming ----------
const ROAD = S.persp({ vx: 520, vy: 980, f: 820, camH: 1.05, camX: 0.7, zc0: 11, zc1: 18 });
shot('D1 road', ST.s08 - 0.12, ST.s09 - 0.12, (ctx, t, lt) => {
  ROAD.ground(ctx, t); ROAD.buildings(ctx, t, 1); ROAD.signal(ctx, '#5BE37A');
  const TZ = 11.6, cars = ONC.map(c => ({ ...c, z: oncZ(c, t, ST.s08 - 2.6) })).filter(c => c.z > 0.5 && c.z < 140);
  const drawCar = c => ROAD.place(ctx, -1.75, c.z, 1.85, 184, g => S.carFront(g, c.col, { taxi: c.taxi, lights: false }));
  cars.filter(c => c.z > TZ).sort((a, b) => b.z - a.z).forEach(drawCar);
  ROAD.place(ctx, 1.1, TZ, 2.5, 536, g => { g.rotate(-0.03); S.truckRear(g, { blinkL: on(t, 1.6) }); });
  cars.filter(c => c.z <= TZ).sort((a, b) => b.z - a.z).forEach(drawCar);
  label(ctx, 'ONCOMING TRAFFIC', 330, 520, pop(t, at('s08', 'traffic')), { size: 52, col: '#FFFDF8', arrow: -1 });
  LT.grade(ctx, 'day', { vignette: 0.2 });
});
// ---------- D2 (s09 "Cars keep coming."): from above — the truck waits in the intersection, the southbound stream keeps passing ----------
shot('D2 stream', ST.s09 - 0.12, ST.s10 - 0.12, (ctx, t, lt) => {
  const c = { x: 0, y: -40, z: lerp(1.05, 1.12, lt / 1.2), r: 0 };
  aerial(ctx, t, c, { skip: cc => true, world: w => {
    for (let i = 0; i < 8; i++) { const y = -1400 + ((t * 700 + i * 330) % 2700); w.save(); w.translate(-LN, y); w.rotate(Math.PI / 2); S.carTop(w, S.CARCOL[(i * 3) % 8], { taxi: i % 3 === 0 }); w.restore(); }
    for (let i = 0; i < 3; i++) { w.save(); w.translate(-RH2 - 300 - i * 230, LN); S.carTop(w, S.CARCOL[(i + 4) % 8], { brake: 1 }); w.restore(); }
    w.save(); w.translate(LN + 20, -30); w.rotate(-Math.PI / 2 - 0.12); S.truckTop(w, { blinkL: on(t, 1.6) }); w.restore();
    w.save(); w.setLineDash([22, 16]); w.strokeStyle = 'rgba(255,200,87,0.9)'; w.lineWidth = 14; w.beginPath(); w.moveTo(40, -190); w.quadraticCurveTo(10, -LN, -400, -LN); w.stroke(); w.restore();
  } });
  label(ctx, 'WAITING…', 540, 470, pop(t, ST.s09), { size: 70, col: C.yellow });
  LT.grade(ctx, 'day', { vignette: 0.16 });
});
const RH2 = S.RH;
// ---------- D3 (s10 "His engine keeps running."): close on the tailpipe — puffs; the fuel needle dips ----------
shot('D3 engine', ST.s10 - 0.12, ST.s11 - 0.12, (ctx, t, lt) => {
  ROAD.ground(ctx, t); halfPass(ctx, 3, g => ROAD.buildings(g, t, 1));
  ctx.save(); ctx.translate(820 + lt * 10, 1480); ctx.scale(2.9, 2.9); S.truckRear(ctx, { blinkL: on(t, 1.6) }); ctx.restore();
  for (let i = 0; i < 7; i++) { const ph = ((t * 1.4 + i / 7) % 1), x = 820 + (-200) * 2.9 - ph * 380 + Math.sin(ph * 6 + i) * 20, y = 1480 - 70 * 2.9 - ph * 260; ell(ctx, x, y, 40 + ph * 120, 34 + ph * 100); ctx.fillStyle = `rgba(200,200,205,${0.55 * (1 - ph)})`; ctx.fill(); }
  ctx.save(); ctx.translate(300, 560); ctx.scale(0.75, 0.75); S.cluster(ctx, { blinkL: on(t, 1.6), fuel: lerp(0.62, 0.55, seg(t, ST.s10, ST.s11)), mph: 0 }); ctx.restore();
  label(ctx, '0 MPH · ENGINE ON', 300, 330, pop(t, at('s10', 'running') - 0.2), { size: 48, col: '#FFFDF8' });
  LT.grade(ctx, 'day', { vignette: 0.22 });
});
// ---------- D4 (s11 "And Mike? He's going nowhere."): fingers drum on the wheel; outside, a lady with a walker passes him ----------
shot('D4 nowhere', ST.s11 - 0.12, ST.s12 - 0.12, (ctx, t, lt) => {
  const tN = at('s11', 'nowhere'), drum = Math.sin(t * 22) * 0.12;
  mikeCab(ctx, t, lt, { move: false, blur: 4, face: R.exprMix(R.expr('tired', { look: [-1, 0.1] }), R.expr('tired', { look: [0, 0.05], blink: blink(lt, 1.7) }), k(t, tN - 0.4, tN)), tilt: -0.03,
    hand: [800, 1745], grip: 'relax', handA: -2.2 + drum,
    outside: w => { const gx = -1120 + (t - ST.s11) * 150; R.figure(w, gx, -30, 0.95, 1, { skin: '#F0C9A6', hair: '#D9D9DE', hairStyle: 'bun', top: '#B06AB3', pants: '#5A5A6E', shoes: '#F7F5F0', glasses: 1 },
      { ...R.walk(t * 3, { stride: 22, lift: 10, bob: 3 }), lean: 0.22, armN: { hand: [120, -250], grip: 'fist' }, armF: { hand: [110, -250], grip: 'fist' }, face: R.expr('smile', { look: [1, 0] }) });
      w.strokeStyle = '#B9BEC6'; w.lineWidth = 14; w.strokeRect(gx + 76, -320, 130, 290); } });
  LT.grade(ctx, 'day', { vignette: 0.22 });
});

// ================= INSIDE THE ROUTE SOFTWARE (flat map) =================
const MAPC = { x: 60, y: -380, z: 0.58, r: 0 };
function mapWorld(ctx, t, c, draw) { ctx.fillStyle = '#FFFDF8'; ctx.fillRect(0, 0, W, H); layer(ctx, c, 1, w => { S.cityTop(w, t, { bounds: camBounds(c), map: true, noPark: true }); draw(w); });
  ctx.save(); ctx.globalAlpha = 0.07; ctx.strokeStyle = '#2E3A59'; ctx.lineWidth = 2; for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); } ctx.restore(); }
function chip(ctx, s, x, y, u, col) { label(ctx, s, x, y, u, { size: 44, col, rot: 0 }); }
// ---------- E1 (s12): dive into the device; the map is calculating — stops, traffic, left turns ----------
const tFactors = at('s12', 'factors'), tLT = at('s12', 'left'), tCalc = at('s12', 'calculations'), tDive = ST.s12 + 0.55;
shot('E1 software', ST.s12 - 0.12, ST.s13 - 0.12, (ctx, t, lt) => {
  if (t < tDive) { // the device in close-up, pushing in
    cabBg(ctx, t, { blur: 10 }); ctx.fillStyle = 'rgba(30,24,20,0.4)'; ctx.fillRect(0, 0, W, H);
    const z = lerp(2.2, 7.5, E.in(seg(t, ST.s12 - 0.12, tDive))); ctx.save(); ctx.translate(540, lerp(900, 1120, seg(t, ST.s12 - 0.12, tDive))); ctx.scale(z / 2.2, z / 2.2); S.device(ctx, (p, w, h) => routeScreen(p, w, h, 1, { title: 'ROUTE SOFTWARE' }), 2.2); ctx.restore();
    LT.grade(ctx, 'office', { vignette: 0.2 }); return; }
  mapWorld(ctx, t, { ...MAPC, z: MAPC.z + lt * 0.01 }, w => {
    // candidate routes flicker as the software compares them
    for (let i = 0; i < 5; i++) { const ph = (t * 1.8 + i * 0.37) % 1; const P = i % 2 ? LOOP : SHORT; ribbon(w, P, 0, P.len * ph, ['#4D8DFF', '#9AA0A8', '#E9A93A', '#4D8DFF', '#9AA0A8'][i], 18, [26, 18], 0.5 * (1 - ph)); }
    const hl = k(t, tLT - 0.1, tLT + 0.3); if (hl > 0) { ribbon(w, SHORT, SHORT.len * 0.25, SHORT.len * 0.75, C.red, 36, null, hl); }
    ell(w, LN, 300, 70, 70); R.fillStroke(w, C.yellow, 5); txt(w, 'A', LN, 326, 76, INK); pin(w, DEST[0], DEST[1] + 120, 1.6, null);
  });
  const sp = (t * 3) % 1; ctx.save(); ctx.translate(900, 420); ctx.rotate(t * 5); for (let i = 0; i < 8; i++) { ctx.rotate(Math.PI / 4); ctx.fillStyle = `rgba(46,58,89,${0.2 + 0.1 * i})`; rr(ctx, -8, -60, 16, 30, 6); ctx.fill(); } ctx.restore();
  chip(ctx, 'STOPS', 230, 1180, pop(t, tFactors - 0.1), '#FFFDF8'); chip(ctx, 'TRAFFIC', 530, 1250, pop(t, tFactors + 0.15), '#FFFDF8'); chip(ctx, 'LEFT TURNS', 800, 1180, pop(t, tLT), C.red);
  label(ctx, 'ROUTE CALCULATIONS', 540, 360, pop(t, tCalc - 0.05), { size: 56, col: '#2E3A59', fg: '#FFFDF8' });
  LT.grade(ctx, 'office', { vignette: 0.12 });
});
// stopwatch-shaped penalty ticket
function ticket(ctx, u = 1, s = 1) { if (u <= 0) return; ctx.save(); ctx.scale(u * s, u * s);
  CL.cutout(ctx, () => { ctx.beginPath(); ctx.moveTo(-170, -80); ctx.lineTo(170, -80); ctx.lineTo(170, 80); for (let x = 170; x > -170; x -= 34) ctx.lineTo(x - 17, 92), ctx.lineTo(x - 34, 80); ctx.closePath(); }, '#FFE3A0', { elev: 1.8 });
  ell(ctx, -110, -4, 46, 46); R.fillStroke(ctx, '#FFFDF8', 5); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-110, -4); ctx.lineTo(-110, -36); ctx.moveTo(-110, -4); ctx.lineTo(-88, 8); ctx.stroke(); rr(ctx, -122, -66, 24, 14, 4); R.fillStroke(ctx, INK, 3);
  txt(ctx, '+20', 50, 18, 92, C.red); fitTxt(ctx, 'SECONDS', 50, 62, 30, INK, 200); fitTxt(ctx, 'ROUTE PENALTY', 0, -50, 26, '#5A5450', 300); ctx.restore(); }
// ---------- E2 (s13): the 20-second penalty stamps onto the unnecessary left — inside the estimated route time ----------
const tUnnec = at('s13', 'unnecessary'), t20 = at('s13', 'twenty-second'), tPen = at('s13', 'penalty'), tMath = at('s13', 'math');
const LEFTPT = [LN - 70, -LN - 40];
shot('E2 penalty', ST.s13 - 0.12, ST.s14 - 0.12, (ctx, t, lt) => {
  const c = { x: lerp(MAPC.x, 10, k(t, ST.s13, tUnnec + 0.4)), y: lerp(MAPC.y, -120, k(t, ST.s13, tUnnec + 0.4)), z: lerp(MAPC.z, 1.05, k(t, ST.s13, tUnnec + 0.4)), r: 0 }, sh = shake(t, t20 + 0.12, 12);
  mapWorld(ctx, t, { ...c, shx: sh }, w => { ribbon(w, SHORT, 0, SHORT.len, C.red, 40, [50, 30]); arrowHead(w, SHORT, SHORT.len - 20, C.red, 1.6); ribbon(w, LOOP, 0, LOOP.len, '#9AA0A8', 22, [30, 20], 0.5);
    for (let i = 0; i < 6; i++) { const y = -1300 + ((t * 520 + i * 420) % 2600); if (Math.abs(y + LN) < 160) continue; w.save(); w.translate(-LN, y); w.rotate(Math.PI / 2); w.globalAlpha = 0.85; S.carTop(w, '#9AA0A8'); w.restore(); }
    w.save(); w.translate(LN, 150); w.rotate(-Math.PI / 2); S.truckTop(w, { blinkL: on(t, 1.6) }); w.restore();
    w.save(); w.translate(...LEFTPT); w.rotate(-0.12); ticket(w, pop(t, t20 - 0.08, 0.3, 2.6), 1.1); w.restore(); });
  label(ctx, 'UNNECESSARY LEFT', 540, 380, pop(t, tUnnec + 0.1), { size: 60, col: C.red, fg: '#FFFDF8' });
  // the sum strip: estimated route time + 20 s (in the math)
  const su = pop(t, tMath - 0.2, 0.3); if (su > 0) { ctx.save(); ctx.translate(540, 1300); ctx.scale(su, su); CL.cutout(ctx, () => rr(ctx, -420, -70, 840, 130, 16), '#2E3A59', { elev: 1.6 }); fitTxt(ctx, 'ESTIMATED ROUTE TIME  +20 s', 0, 16, 54, '#FFFDF8', 780); ctx.restore(); }
  LT.grade(ctx, 'office', { vignette: 0.12 });
});
// ---------- E3 (s14 "Not for the driver."): the ticket flies at Mike — he flinches — it swerves away ----------
const tFor2 = at('s14', 'for', 1);
shot('E3 not driver', ST.s14 - 0.12, tFor2 - 0.12, (ctx, t, lt) => {
  const u = seg(t, ST.s14 - 0.12, tFor2 - 0.12), tx2 = lerp(1250, 600, E.out(clamp(u * 1.8))) + E.in(seg(u, 0.55, 1)) * 900, ty = lerp(600, 1000, clamp(u * 1.8)) - E.in(seg(u, 0.55, 1)) * 800;
  mikeCab(ctx, t, lt, { x: 470, face: R.exprMix(R.expr('surprised', { look: [1, -0.3] }), R.expr('worried', { look: [1, -0.6] }), seg(u, 0.3, 0.6)), lean: -0.06, tilt: -0.08, wheel: true,
    hands: [{ side: 1, hand: [130, -150], grip: 'open' }] });
  ctx.save(); ctx.translate(tx2, ty); ctx.rotate(Math.sin(t * 9) * 0.25 + u * 2); ticket(ctx, 1, 1.1); ctx.restore();
  bigX(ctx, 820, 560, pop(t, at('s14', 'driver') - 0.05), 1);
  label(ctx, 'NOT FOR THE DRIVER', 540, 360, pop(t, at('s14', 'not')), { size: 60, col: '#FFFDF8' });
  LT.grade(ctx, 'day', { vignette: 0.2 });
});
// ---------- E3b (s14 "For the route."): the ticket lands on the route line and sticks ----------
shot('E3b for route', tFor2 - 0.12, ST.s15 - 0.12, (ctx, t, lt) => {
  const c = { x: 10, y: -120, z: 1.05, r: 0 }, land = k(t, tFor2 - 0.1, tFor2 + 0.25, E.out);
  mapWorld(ctx, t, c, w => { ribbon(w, SHORT, 0, SHORT.len, C.red, 40, [50, 30]); arrowHead(w, SHORT, SHORT.len - 20, C.red, 1.6);
    w.save(); w.translate(lerp(LEFTPT[0] + 500, LEFTPT[0], land), lerp(LEFTPT[1] - 700, LEFTPT[1], land)); w.rotate(lerp(1.2, -0.12, land)); ticket(w, 1, lerp(1.6, 1.1, land)); w.restore();
    if (land > 0.95) { CL.tape(w, LEFTPT[0] - 150, LEFTPT[1] - 80, 120, -0.5); CL.tape(w, LEFTPT[0] + 160, LEFTPT[1] + 70, 120, -0.5); } });
  label(ctx, 'FOR THE ROUTE', 540, 380, pop(t, tFor2 + 0.1), { size: 64, col: '#2E7D5B', fg: '#FFFDF8' });
  LT.grade(ctx, 'office', { vignette: 0.12 });
});
// ---------- E4 (s15 "So sometimes, three right turns beat one left."): the race on the map ----------
const tBeat = at('s15', 'beat'), RACE0 = ST.s15 - 0.12, RACE1 = ST.s16 - 0.12;
shot('E4 race', RACE0, RACE1, (ctx, t, lt) => {
  const c = { x: 60, y: -380, z: 0.6, r: 0 }, u = seg(t, RACE0 + 0.15, tBeat + 0.25);
  // loop truck: steady; left truck: drives to the turn, waits (20 s penalty + the gap), then goes late
  const dLoop = LOOP.len * u, waitD = SHORT.len * 0.32, dShort = u < 0.2 ? SHORT.len * 0.32 * u / 0.2 : u < 0.93 ? waitD : waitD + (u - 0.93) / 0.07 * SHORT.len * 0.2;
  mapWorld(ctx, t, c, w => {
    ribbon(w, SHORT, 0, SHORT.len, 'rgba(230,57,70,0.8)', 30, [40, 26]); ribbon(w, LOOP, 0, LOOP.len, 'rgba(46,125,91,0.55)', 30, [40, 26]); ribbon(w, LOOP, 0, dLoop, '#2E7D5B', 34);
    pin(w, DEST[0], DEST[1] + 120, 1.5, null);
    for (const [P, d, blk] of [[SHORT, dShort, 'L'], [LOOP, dLoop, 'R']]) { const [x, y, a] = P.at(d); w.save(); w.translate(x, y); w.rotate(a); S.truckTop(w, { blinkL: blk === 'L' && on(t, 2), blinkR: false, col: blk === 'L' ? '#8C5A3A' : S.BROWN }); w.restore(); }
    if (u > 0.2 && u < 0.95) { const [x, y] = SHORT.at(waitD); w.save(); w.translate(x - 230, y - 80); w.scale(1.3, 1.3); ell(w, 0, 0, 60, 60); R.fillStroke(w, '#FFFDF8', 5); w.strokeStyle = C.red; w.lineWidth = 10; w.beginPath(); w.moveTo(0, 0); w.lineTo(Math.cos(t * 7) * 44, Math.sin(t * 7) * 44); w.stroke(); w.restore(); }
  });
  label(ctx, '1 LEFT + WAIT + 20 s', 300, 1240, pop(t, at('s15', 'one') - 0.1), { size: 46, col: C.red, fg: '#FFFDF8' });
  label(ctx, '3 RIGHTS', 790, 1240, pop(t, at('s15', 'three') - 0.05), { size: 46, col: '#2E7D5B', fg: '#FFFDF8' });
  if (t > tBeat + 0.25) stampBox(ctx, '✓ 3 RIGHTS WIN', 540, 440, pop(t, tBeat + 0.25, 0.3), '#2E7D5B', 70);
  label(ctx, 'SOMETIMES', 540, 300, pop(t, at('s15', 'sometimes')), { size: 50, col: C.yellow });
  LT.grade(ctx, 'office', { vignette: 0.12 });
}, { type: 'tear', dur: 0.4, at: () => [540, 900] });

// ================= MYTHBUSTERS =================
// ---------- F1 (s16 "And here's the crazy part."): the clapperboard snaps ----------
const tCrazy = at('s16', 'crazy');
function studioBg(ctx, t) { const g = ctx.createRadialGradient(540, 800, 100, 540, 900, 1300); g.addColorStop(0, '#FFE3A0'); g.addColorStop(1, '#E9A93A'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalAlpha = 0.12; ctx.fillStyle = '#171717'; for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.moveTo(540, 900); ctx.arc(540, 900, 1600, i * Math.PI / 6 + t * 0.1, i * Math.PI / 6 + Math.PI / 12 + t * 0.1); ctx.closePath(); ctx.fill(); } ctx.restore(); }
shot('F1 clapper', ST.s16 - 0.12, ST.s17 - 0.12, (ctx, t, lt) => {
  studioBg(ctx, t); const shut = k(t, tCrazy - 0.15, tCrazy + 0.02, E.in), sh = shake(t, tCrazy + 0.02, 14);
  ctx.save(); ctx.translate(540 + sh, 900); ctx.scale(1.5, 1.5); ctx.rotate(-0.05); S.clapper(ctx, 1 - shut, ['MYTHBUSTERS', 'DELIVERY TRUCK TEST']); ctx.restore();
  LT.grade(ctx, 'golden', { vignette: 0.2 });
});
// ---------- F2 (s17 "MythBusters actually tested this with a delivery truck."): San Francisco hills; a white test truck rolls past the cones ----------
function hills(ctx, t) { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#BFD8EC'); g.addColorStop(1, '#F1E6D2'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; for (let i = 0; i < 4; i++) { ell(ctx, (i * 400 + t * 30) % 1500 - 200, 520 + i * 40, 320, 60); ctx.fill(); }
  ctx.save(); ctx.fillStyle = '#9DB59A'; ctx.beginPath(); ctx.moveTo(0, 1000); ctx.quadraticCurveTo(300, 700, 600, 860); ctx.quadraticCurveTo(850, 980, 1080, 760); ctx.lineTo(1080, 1300); ctx.lineTo(0, 1300); ctx.closePath(); ctx.fill(); ctx.restore();
  for (let i = 0; i < 14; i++) { const x = i * 80 - 20, y = 980 - Math.sin(i * 0.5) * 120 - i * 8; ctx.fillStyle = ['#F2D1C9', '#CFE3F2', '#F7E7B4', '#D9EBD3', '#E8D3EA'][i % 5]; ctx.fillRect(x, y - 140, 74, 200); ctx.beginPath(); ctx.moveTo(x - 4, y - 140); ctx.lineTo(x + 37, y - 190); ctx.lineTo(x + 78, y - 140); ctx.closePath(); ctx.fill(); ctx.fillStyle = 'rgba(46,58,89,0.5)'; ctx.fillRect(x + 14, y - 110, 18, 26); ctx.fillRect(x + 44, y - 110, 18, 26); } }
const tTested = at('s17', 'tested'), tDelTruck = at('s17', 'delivery');
shot('F2 test truck', ST.s17 - 0.12, ST.s18 - 0.12, (ctx, t, lt) => {
  hills(ctx, t);
  ctx.fillStyle = S.ASPH; ctx.fillRect(0, 1300, W, 620); ctx.fillStyle = '#F2C94C'; ctx.fillRect(0, 1560, W, 8);
  ctx.fillStyle = S.SIDEW; ctx.fillRect(0, 1240, W, 64);
  for (let i = 0; i < 6; i++) { const x = 80 + i * 190; ctx.save(); ctx.translate(x, 1700); ctx.beginPath(); ctx.moveTo(-34, 0); ctx.lineTo(34, 0); ctx.lineTo(10, -100); ctx.lineTo(-10, -100); ctx.closePath(); R.fillStroke(ctx, '#FF7A30', 4); ctx.fillStyle = '#FFFDF8'; ctx.fillRect(-20, -60, 40, 14); ctx.restore(); }
  const tx = lerp(-800, 440, E.out(seg(t, ST.s17 - 0.12, tDelTruck + 0.5)));
  ctx.save(); ctx.translate(tx, 1540); ctx.scale(0.74, 0.74); LT.lit(ctx, g => S.truckSide(g, { col: '#F2F2EE', test: true, label: 'TEST TRUCK', rot: -t * 7 }), { rim: RIM }); ctx.restore();
  ctx.save(); ctx.translate(880, 1000); ctx.rotate(0.06); ctx.scale(0.5, 0.5); S.clapper(ctx, 0, ['MYTHBUSTERS', 'DELIVERY TRUCK TEST']); ctx.restore();
  label(ctx, 'SAN FRANCISCO', 300, 360, pop(t, ST.s17), { size: 52, col: '#FFFDF8' });
  label(ctx, 'A DELIVERY TRUCK', 540, 1180, pop(t, tDelTruck), { size: 54, col: C.yellow });
  LT.grade(ctx, 'day', { vignette: 0.16 });
});
// ---------- F3 (s18 "Their right-turn route was LONGER."): two routes traced at once on a map; the right-turn one is longer ----------
const tLonger = at('s18', 'longer');
const RA = S.makePath([[LN, 300], [LN, -LN], [-760, -LN]], 170), RB = LOOP; // illustration of the idea (not the real test route)
shot('F3 longer', ST.s18 - 0.12, ST.s19 - 0.12, (ctx, t, lt) => {
  const c = { x: 140, y: -640, z: 0.7, r: 0 }, u = seg(t, ST.s18 - 0.1, tLonger + 0.1);
  mapWorld(ctx, t, c, w => { ribbon(w, RA, 0, RA.len * clamp(u * 2.6), '#E9A93A', 34); ribbon(w, RB, 0, RB.len * u, '#4D8DFF', 34);
    for (const [P, d] of [[RA, RA.len * clamp(u * 2.6)], [RB, RB.len * u]]) { const [x, y, a] = P.at(d); w.save(); w.translate(x, y); w.rotate(a); S.truckTop(w, { col: '#F2F2EE' }); w.restore(); } });
  // distance bars
  ctx.save(); ctx.translate(120, 500); CL.cutout(ctx, () => rr(ctx, -30, -70, 900, 280, 18), '#FFFDF8', { elev: 1 }); txt(ctx, 'WITH LEFTS', 0, -16, 40, INK, 'left'); CL.cutout(ctx, () => rr(ctx, 0, 0, 280 * clamp(u * 2.6), 46, 10), '#E9A93A', { elev: 0.8 });
  txt(ctx, 'RIGHTS ONLY', 0, 110, 40, INK, 'left'); CL.cutout(ctx, () => rr(ctx, 0, 126, Math.max(10, 820 * u), 46, 10), '#4D8DFF', { elev: 0.8 }); ctx.restore();
  if (t > tLonger) stampBox(ctx, 'LONGER', 760, 1020, pop(t, tLonger, 0.3), '#2E3A59', 80, 0.06);
  label(ctx, 'DISTANCE', 540, 330, pop(t, ST.s18), { size: 56, col: '#FFFDF8' }); label(ctx, 'ILLUSTRATION', 870, 820, 1, { size: 26, col: '#171717', fg: '#FFFDF8' });
  LT.grade(ctx, 'office', { vignette: 0.12 });
});
// ---------- F4 (s19 "But it used less fuel."): two fuel jars drain; the right-turn route keeps a little more ----------
const tLess = at('s19', 'less');
shot('F4 less fuel', ST.s19 - 0.12, ST.s20 - 0.12, (ctx, t, lt) => {
  studioBg(ctx, t * 0.2); const u = k(t, ST.s19 - 0.1, tLess + 0.2, E.out);
  ctx.save(); ctx.translate(320, 1330); ctx.scale(1.4, 1.4); S.fuelJar(ctx, lerp(0.95, 0.42, u), 'WITH LEFTS', '#E9A93A'); ctx.restore();
  ctx.save(); ctx.translate(760, 1330); ctx.scale(1.4, 1.4); S.fuelJar(ctx, lerp(0.95, 0.46, u), 'RIGHTS ONLY', '#4D8DFF'); ctx.restore();
  ctx.save(); ctx.setLineDash([14, 10]); ctx.strokeStyle = INK; ctx.lineWidth = 5; const y = 1330 - 14 - 330 * 1.4 * 0.42 * 1; ctx.beginPath(); ctx.moveTo(150, 1330 - 1.4 * (10 + 330 * lerp(0.95, 0.42, u))); ctx.lineTo(930, 1330 - 1.4 * (10 + 330 * lerp(0.95, 0.42, u))); ctx.stroke(); ctx.restore();
  if (t > tLess) stampBox(ctx, 'LESS FUEL', 760, 560, pop(t, tLess, 0.3), '#2E7D5B', 84, -0.06);
  label(ctx, 'FUEL USED', 540, 340, pop(t, ST.s19), { size: 56, col: '#FFFDF8' }); label(ctx, 'ONE TEST', 300, 560, pop(t, tLess + 0.25), { size: 40, col: '#171717', fg: C.yellow });
  LT.grade(ctx, 'golden', { vignette: 0.16 });
}, { type: 'tear', dur: 0.4, at: () => [540, 1000] });

// ================= EVERY MILE COUNTS =================
const tCounts = at('s20', 'counts'), tUPS = at('s20', 'ups'), tCut = at('s20', 'cutting'), tOneMile = at('s20', 'one'), tPer = at('s20', 'per'), tDay = at('s20', 'day'), tSave = at('s20', 'save'), tFifty = at('s20', 'fifty'), tYear = at('s20', 'year');
function paperRoad(ctx, x0, x1, y, o = {}) { // a paper road ribbon seen from above, with mile posts
  CL.cutout(ctx, () => rr(ctx, x0, y - 90, x1 - x0, 180, 16), '#5A5E66', { elev: 1.2, tex: 0.3 });
  ctx.fillStyle = '#FFFDF8'; for (let x = x0 + 30; x < x1 - 40; x += 90) ctx.fillRect(x, y - 5, 50, 10);
  for (let m = 0; m < (o.posts || 0); m++) { const px0 = x0 + 160 + m * (o.gap || 330); ctx.save(); ctx.translate(px0, y - 190); ctx.scale(1.7, 1.7); CL.cutout(ctx, () => rr(ctx, -54, -34, 108, 60, 8), '#2E7D5B', { elev: 0.8 }); fitTxt(ctx, `MILE ${m + 1}`, 0, 8, 26, '#FFFDF8', 96); ctx.restore(); }
}
// ---------- G1 (s20 "And every mile counts."): Mike's truck along a paper road; each mile post ticks ----------
shot('G1 every mile', ST.s20 - 0.12, tUPS - 0.12, (ctx, t, lt) => {
  ctx.fillStyle = '#E9E1CF'; ctx.fillRect(0, 0, W, H); CL.tornSheet(ctx, -40, 1120, 1500, 500, '#D9CFB8', 4);
  const u = seg(t, ST.s20 - 0.1, tUPS - 0.1), z = lerp(1.1, 0.95, u); ctx.save(); ctx.translate(540, 900); ctx.scale(z, z); ctx.translate(-540, -900);
  paperRoad(ctx, -200, 1400, 900, { posts: 5, gap: 330 }); const tx = lerp(-120, 1080, u); ctx.save(); ctx.translate(tx, 940); ctx.scale(1.3, 1.3); S.truckTop(ctx, {}); ctx.restore();
  for (let m = 0; m < 5; m++) { const px0 = -200 + 160 + m * 330; if (tx > px0 + 120) { ctx.save(); ctx.translate(px0 + 60, 680); ctx.scale(pop(t, ST.s20 + (px0 + 120 + 120) / 1200 * (tUPS - ST.s20)), 1); txt(ctx, '✓', 0, 0, 70, '#2E7D5B'); ctx.restore(); } }
  ctx.restore();
  label(ctx, 'EVERY MILE COUNTS', 540, 380, pop(t, tCounts - 0.2), { size: 64, col: C.yellow });
  LT.grade(ctx, 'day', { vignette: 0.14 });
});
// ---------- G2 ("UPS says cutting just one mile"): scissors snip one mile out of the road ----------
const SEGX0 = 300, SEGX1 = 780;
shot('G2 snip', tUPS - 0.12, tPer - 0.12, (ctx, t, lt) => {
  ctx.fillStyle = '#E9E1CF'; ctx.fillRect(0, 0, W, H);
  const c1 = at('s20', 'just'), c2 = tOneMile + 0.2, lift = k(t, at('s20', 'mile', 1) - 0.1, tPer - 0.15, E.out), join = k(t, at('s20', 'mile', 1), tPer - 0.12);
  // left and right road parts slide together after the cut
  ctx.save(); ctx.translate(join * (SEGX1 - SEGX0) / 2, 0); paperRoad(ctx, -200, SEGX0, 960); ctx.restore();
  ctx.save(); ctx.translate(-join * (SEGX1 - SEGX0) / 2, 0); paperRoad(ctx, SEGX1, 1300, 960); ctx.restore();
  ctx.save(); ctx.translate((SEGX0 + SEGX1) / 2, 960 - lift * 420); ctx.rotate(-lift * 0.25); paperRoad(ctx, -(SEGX1 - SEGX0) / 2, (SEGX1 - SEGX0) / 2, 0);
  CL.cutout(ctx, () => rr(ctx, -110, -40, 220, 80, 12), C.yellow, { elev: 1.4 }); txt(ctx, '1 MILE', 0, 18, 50, INK); ctx.restore();
  ctx.save(); ctx.setLineDash([16, 12]); ctx.strokeStyle = C.red; ctx.lineWidth = 6; for (const x of [SEGX0, SEGX1]) { if (lift > 0.05) continue; ctx.beginPath(); ctx.moveTo(x, 840); ctx.lineTo(x, 1080); ctx.stroke(); } ctx.restore();
  // scissors: first cut at SEGX0, then SEGX1
  const sx = t < c1 + 0.35 ? SEGX0 : lerp(SEGX0, SEGX1, k(t, c1 + 0.35, c2 - 0.1)), snip = Math.abs(Math.sin((t - tUPS) * 14)) * 0.5, sa = 1 - seg(t, tPer - 0.4, tPer - 0.12);
  if (sa > 0) { ctx.save(); ctx.globalAlpha = sa; ctx.translate(sx, 960 + 150); ctx.rotate(-Math.PI / 2); S.scissors(ctx, snip, 1.1); ctx.restore(); }
  label(ctx, '1 MILE LESS', 540, 380, pop(t, tCut), { size: 70, col: C.yellow });
  label(ctx, 'UPS SAYS', 540, 260, pop(t, tUPS), { size: 44, col: '#2E3A59', fg: '#FFFDF8' });
  LT.grade(ctx, 'day', { vignette: 0.14 });
});
// ---------- G3 ("per driver, per day,"): pull back — many trucks, many roads; the calendar flips ----------
shot('G3 fleet', tPer - 0.12, tSave - 0.12, (ctx, t, lt) => {
  ctx.fillStyle = '#E9E1CF'; ctx.fillRect(0, 0, W, H);
  const z = lerp(1, 0.55, k(t, tPer - 0.1, tPer + 0.6)); ctx.save(); ctx.translate(540, 980); ctx.scale(z, z); ctx.translate(-540, -980);
  for (let r = -4; r <= 5; r++) { const y = 980 + r * 300; paperRoad(ctx, -1100, 2200, y); for (let q = 0; q < 4; q++) { const x = ((t * 500 + q * 830 + r * 270) % 3300) - 1100; ctx.save(); ctx.translate(x, y + 40); S.truckTop(ctx, {}); ctx.restore();
    const pu = pop(t, tPer + 0.15 + ((r + 4) * 4 + q) * 0.025, 0.25); if (pu > 0) { ctx.save(); ctx.translate(x + 40, y - 120); ctx.scale(pu, pu); CL.cutout(ctx, () => rr(ctx, -80, -30, 160, 56, 10), C.yellow, { elev: 1 }); txt(ctx, '−1 MI', 0, 12, 34, INK); ctx.restore(); } } }
  ctx.restore();
  label(ctx, 'PER DRIVER', 300, 380, pop(t, tPer), { size: 58, col: '#FFFDF8' });
  const du = pop(t, tDay - 0.1); if (du > 0) { ctx.save(); ctx.translate(800, 400); ctx.scale(du, du); CL.cutout(ctx, () => rr(ctx, -130, -110, 260, 240, 18), '#FFFDF8', { elev: 1.6 }); ctx.fillStyle = C.red; rr(ctx, -130, -110, 260, 64, [18, 18, 0, 0]); ctx.fill(); txt(ctx, 'PER DAY', 0, -64, 34, '#FFFDF8');
    const flip = ((t - tDay) * 4) % 1; txt(ctx, String(1 + Math.floor((t - tDay) * 4) % 30), 0, 80, 110, INK); ctx.restore(); }
  LT.grade(ctx, 'day', { vignette: 0.14 });
});
// ---------- G4 ("can save up to fifty million dollars a year."): the money stacks rise; UPS's estimate, 2013 ----------
shot('G4 $50M', tSave - 0.12, ST.s21 - 0.12, (ctx, t, lt) => {
  studioBg(ctx, t * 0.1); const rise = k(t, tSave - 0.1, tFifty + 0.4, E.out), sh = shake(t, tFifty + 0.1, 16);
  ctx.save(); ctx.translate(sh, 0); for (let i = 0; i < 5; i++) { const n = Math.floor(lerp(1, 8 + (i % 3) * 3, rise)); ctx.save(); ctx.translate(140 + i * 200, 1480); S.moneyStack(ctx, n, 0.6); ctx.restore(); } ctx.restore();
  const bu = pop(t, tFifty, 0.35, 2); if (bu > 0) { ctx.save(); ctx.translate(540 + sh, 620); ctx.scale(bu, bu); ctx.rotate(-0.03);
    CL.cutout(ctx, () => rr(ctx, -380, -90, 760, 170, 18), '#FFFDF8', { elev: 1.8 }); fitTxt(ctx, 'UP TO', 0, -42, 40, '#5A5450', 200); fitTxt(ctx, '$50 MILLION', 0, 58, 110, '#2E7D5B', 700);
    ctx.translate(0, 160); CL.cutout(ctx, () => rr(ctx, -200, -50, 400, 90, 14), C.red, { elev: 1.4 }); txt(ctx, 'A YEAR', 0, 16, 56, '#FFFDF8'); ctx.restore(); }
  const su = pop(t, tYear - 0.1, 0.3, 2.6); stampBox(ctx, 'UPS ESTIMATE · 2013', 540, 1060, su, '#2E3A59', 46, 0.04);
  label(ctx, '1 MILE / DRIVER / DAY', 540, 320, pop(t, tSave - 0.1), { size: 48, col: C.yellow });
  LT.grade(ctx, 'golden', { vignette: 0.16 });
}, { type: 'tear', dur: 0.4, at: () => [540, 800] });

// ================= NOT BANNED =================
// ---------- H1 (s21 "So UPS doesn't ban left turns."): the NO LEFT TURN sign — its red slash peels off ----------
const tBan = at('s21', 'ban');
shot('H1 not banned', ST.s21 - 0.12, ST.s22 - 0.12, (ctx, t, lt) => {
  ctx.fillStyle = '#9CC9F0'; ctx.fillRect(0, 0, W, H);
  halfPass(ctx, 9, g => { layer(g, { x: 300, y: -500, z: 0.55 }, 1, w => S.streetSide(w, t, { x0: -1800, x1: 2400, cross: [600] })); });
  LT.haze(ctx, 'golden', 0.15);
  const z = 1 + lt * 0.03; ctx.save(); ctx.translate(540, 860); ctx.scale(z * 1.45, z * 1.45); S.noLeftSign(ctx, seg(t, tBan - 0.05, tBan + 0.6)); ctx.restore();
  if (t > tBan + 0.35) stampBox(ctx, 'NOT BANNED', 540, 380, pop(t, tBan + 0.35, 0.3), '#2E7D5B', 84, -0.05);
  LT.grade(ctx, 'golden', { vignette: 0.18 });
});
// ---------- H2 (s22 "If turning left makes more sense, the system can choose it."): a quiet street, nobody coming — the truck turns left ----------
const SLN = 55, SUBP = S.makePath([[SLN, 900], [SLN, -SLN], [-1100, -SLN]], 140), tSys = at('s22', 'system'), tChoose = at('s22', 'choose');
const subD = SUBP.timing(560, 0.4);
shot('H2 left ok', ST.s22 - 0.12, ST.s23 - 0.12, (ctx, t, lt) => {
  const d = subD(t - ST.s22 + 0.5), [x, y, a] = SUBP.at(d), c = { x: x * 0.55 - 60, y: y * 0.55 - 120, z: 1.2, r: 0 };
  ctx.fillStyle = '#585C63'; ctx.fillRect(0, 0, W, H);
  layer(ctx, c, 1, w => { S.suburbTop(w, t, { bounds: camBounds(c) });
    w.save(); w.setLineDash([26, 18]); w.strokeStyle = 'rgba(91,227,122,0.9)'; w.lineWidth = 16; SUBP.draw(w, d, SUBP.len); w.stroke(); w.restore();
    w.save(); w.translate(x, y); w.rotate(a); w.scale(0.72, 0.72); S.truckTop(w, { blinkL: d < SUBP.len * 0.55 && on(t, 1.6) }); w.restore(); });
  const du = pop(t, tSys - 0.1, 0.35); if (du > 0) { ctx.save(); ctx.translate(820, 560); ctx.rotate(0.05); ctx.scale(du, du); S.device(ctx, (p, w, h) => { p.fillStyle = '#FFFDF8'; p.fillRect(0, 0, w, h); p.fillStyle = '#2E3A59'; p.fillRect(0, 0, w, 44); fitTxt(p, 'NEXT TURN', w / 2, 31, 22, '#FFFDF8', w - 20);
    p.save(); p.translate(w / 2, h / 2 + 20); p.strokeStyle = '#2E7D5B'; p.lineWidth = 34; p.beginPath(); p.moveTo(40, 90); p.lineTo(40, -10); p.quadraticCurveTo(40, -50, 0, -50); p.lineTo(-40, -50); p.stroke(); p.fillStyle = '#2E7D5B'; p.beginPath(); p.moveTo(-100, -50); p.lineTo(-40, -100); p.lineTo(-40, 0); p.closePath(); p.fill(); p.restore();
    fitTxt(p, 'LEFT ✓', w / 2, h - 24, 40, '#2E7D5B', w - 30); }, 0.85); ctx.restore(); }
  label(ctx, 'NO ONCOMING TRAFFIC', 400, 380, pop(t, at('s22', 'sense') - 0.2), { size: 50, col: '#FFFDF8' });
  LT.grade(ctx, 'golden', { vignette: 0.16 });
});

// ================= THE ENDING =================
// ---------- I1 (s23 "So Mike wasn't taking the long way by mistake."): chase camera from above through the third right ----------
const tMistake = at('s23', 'mistake'), d3 = cornerD[2];
shot('I1 third right', ST.s23 - 0.12, ST.s24 - 0.12, (ctx, t, lt) => {
  const u = seg(t, ST.s23 - 0.12, ST.s24 - 0.12), d = lerp(d3 - 520, d3 + 380, u), [x, y, a] = LOOP.at(d);
  const c = { x, y, z: 1.25, r: -a - Math.PI / 2 };
  aerial(ctx, t, c, { avoid: [x, y, 420], world: w => { ribbon(w, LOOP, d3 - 1600, d, '#5BE37A', 30); w.save(); w.translate(x, y); w.rotate(a); S.truckTop(w, { blinkR: d < d3 + 40 && on(t, 2) }); w.restore(); } });
  label(ctx, 'RIGHT #3', 540, 380, pop(t, ST.s23 + 0.1), { size: 60, col: C.yellow });
  if (t > tMistake - 0.05) stampBox(ctx, 'ON PURPOSE', 540, 1260, pop(t, tMistake - 0.05, 0.3), '#2E7D5B', 76, -0.04);
  LT.grade(ctx, 'golden', { vignette: 0.16 });
});
// ---------- I2 (s24 "He was taking the smarter way."): Mike, a little smug, taps his temple ----------
shot('I2 smarter', ST.s24 - 0.12, ST.s25 - 0.12, (ctx, t, lt) => {
  const tSm = at('s24', 'smarter'), up = k(t, ST.s24, tSm);
  mikeCab(ctx, t, lt, { move: true, evening: false, light: 'golden', face: R.exprMix(R.expr('smile', { look: [0.3, 0] }), R.expr('smug', { look: [0, 0.05] }), up), tilt: 0.05,
    hands: [{ side: 1, hand: [lerp(150, 120, up), lerp(60, -230, up)], grip: 'point', elbow: [250, 330] }], rim: { dir: [-1, -0.3], color: '#FFD9A0', w: 9, a: 0.9 } });
  LT.grade(ctx, 'golden', { vignette: 0.2 });
});
// ---------- I3 (s25 "Because in delivery..."): at the door — Mike sets the package down and rings ----------
shot('I3 delivery', ST.s25 - 0.12, ST.s26 - 0.12, (ctx, t, lt) => {
  const u = seg(t, ST.s25 - 0.12, ST.s26 - 0.2), c = { x: 0, y: -700, z: 0.82 + lt * 0.03, r: 0 };
  ctx.fillStyle = '#F6E6C6'; ctx.fillRect(0, 0, W, H);
  layer(ctx, c, 1, w => { S.stoop(w, t);
    const mx = lerp(-700, -300, E.out(clamp(u * 1.6))), down = seg(u, 0.55, 0.85), walking = u < 0.62;
    const P = walking ? R.walk(t * 7, { stride: 60, lift: 30, bob: 9 }) : { hip: [0, lerp(-252, -200, down)], lean: down * 0.5, legN: { foot: [30, 0] }, legF: { foot: [-30, 0] } };
    const box = [lerp(130, 170, down), lerp(-320, -60, down)];
    S.mikeFigure(w, mx, -420, 1.05, 1, { ...P, armN: { hand: box, grip: 'hold' }, armF: { hand: [box[0] - 10, box[1] + 10], grip: 'hold' }, face: R.expr('smile', { look: [1, 0.4] }) });
    w.save(); w.translate(mx + box[0] * 1.05 + 40, -420 + box[1] * 1.05 + 70); S.packageBox(w, 1.3); w.restore();
  });
  if (u > 0.8) { const bu = pop(t, ST.s26 - 0.55, 0.3); label(ctx, 'DING-DONG', 760, 560, bu, { size: 48, col: C.yellow, rot: 0.08 }); }
  LT.grade(ctx, 'golden', { vignette: 0.16 });
});
// ---------- I4 (s26 "The shortest route isn't always the cheapest."): the block again (frame 0 echo) ----------
const tShortest = at('s26', 'shortest'), tCheap = at('s26', 'cheapest');
shot('I4 final', ST.s26 - 0.12, T + 0.01, (ctx, t, lt) => {
  const c = { x: 150, y: -470, z: lerp(0.66, 0.62, seg(t, ST.s26, T)), r: 0 };
  aerial(ctx, t, c, { avoid: LOOP.at(LOOP.len - 40), world: w => { blockScene(w, t, LOOP.len - 40, {});
    w.save(); w.translate(-260, 260); label(w, 'SHORTEST', 0, 0, pop(t, tShortest), { size: 70, col: C.red, fg: '#FFFDF8', rot: -0.05 }); w.restore();
    { const q = SHORT.at(380); bigX(w, q[0], q[1], 1, 1.1); } pin(w, DEST[0], DEST[1] + 60, 1.3, null);
    w.save(); w.translate(B - 260, -B / 2 - 60); label(w, 'SMARTER', 0, 0, pop(t, at('s26', 'always') - 0.1), { size: 70, col: '#2E7D5B', fg: '#FFFDF8', rot: 0.04 }); w.restore(); } });
  headline(ctx, t, "SHORTEST ISN'T ALWAYS", 'THE CHEAPEST', pop(t, tCheap - 0.1, 0.35), 360);
  LT.grade(ctx, 'golden', { vignette: 0.14 });
});

// ---------- edit, global overlays, subtitles ----------
SH.sort((a, b) => a.t0 - b.t0);
const ED = makeEdit(SH, W, H);
const SPLIT = { s01: [4, 4, 4], s02: [3], s03: [4], s04: [2, 6, 5], s05: [4], s06: [3, 5], s07: [1], s08: [1, 4], s09: [3], s10: [4], s11: [2, 3], s12: [4, 6], s13: [3, 5, 4],
  s14: [4, 3], s15: [2, 6], s16: [5], s17: [4, 4], s18: [5], s19: [5], s20: [4, 6, 4, 4, 5], s21: [6], s22: [6, 5], s23: [4, 5], s24: [6], s25: [3], s26: [3, 4] };
const REPL = [[/three right/i, '3 right'], [/twenty-second/i, '20-second'], [/just one mile/i, 'just 1 mile'], [/fifty million dollars/i, '$50 million'], [/three right turns beat one left/i, '3 right turns beat 1 left']];
function subs() {
  const G = [];
  Object.keys(ST).forEach(id => { const ws = V.words(id); let k0 = 0; SPLIT[id].forEach(n => { G.push({ id, words: ws.slice(k0, k0 + n) }); k0 += n; }); if (k0 !== ws.length) throw new Error(`subtitle split ${id}: ${k0} vs ${ws.length}`); });
  G.forEach((g, i) => { const nx = G[i + 1], e0 = Math.min(g.words[g.words.length - 1].t1, end(g.id)) + 0.4; g.t0 = g.words[0].t0 - 0.05;
    g.t1 = nx ? (nx.id === g.id ? nx.words[0].t0 - 0.05 : Math.min(e0, nx.words[0].t0 - 0.05)) : T;
    let s = g.words.map(x => x.w).join(' '); for (const [a, b] of REPL) s = s.replace(a, b); s = s.replace(/^three /i, '3 ').replace(/ one left/i, ' 1 left'); g.text = s; });
  return G;
}
const SUBS = subs();
const TEX = K.paperTexture(W, H);
function frame(ctx, t) {
  ED.frame(ctx, t);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  exampleStamp(ctx, t);
  ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.26; ctx.drawImage(TEX, 0, 0); ctx.restore();
  EN.drawSubtitles(ctx, t, SUBS, { y: 1565, size: 62, maxW: 820, x: 540, highlight: ['3', 'one', 'left', 'left.', 'longer', 'less', 'fuel', '20-second', 'penalty', '$50', 'million', 'shortest', 'cheapest', 'smarter', 'ban', 'driver', 'route.', 'mile'] });
}

// ---------- sound cues (for mix.py) ----------
function cues() {
  const c = [['engine', 0.0, 0.5], ['whoosh', 0.1, 0.25]];
  cornerD.forEach((cd, i) => { const tt = timeAtD(cd); c.push(['blinker', tt - 0.55, 0.5], ['blinker', tt - 0.2, 0.5], ['tag', tt - 0.05, 0.6]); });
  c.push(['stamp', tOne, 0.7], ['passby', 0.6, 0.35], ['passby', 2.3, 0.35]);
  c.push(['cut', A1END, 0.35], ['street', A1END, 0.5]);
  c.push(['cut', ST.s03 - 0.12, 0.35], ['street', ST.s03, 0.6], ['passby', ST.s03 + 0.4, 0.5], ['engine', ST.s03, 0.35], ['tag', tMike, 0.6], ['tag', tMike + 0.15, 0.4], ['honk', ST.s03 + 0.9, 0.18]);
  c.push(['cut', tHes - 0.12, 0.35], ['xray', tFull - 0.2, 0.6], ['tag', at('s04', 'packages'), 0.5], ['cut', tComp - 0.12, 0.35], ['blip', tComp, 0.5], ['tick', tComp + 0.3, 0.3], ['tick', tComp + 0.5, 0.3]);
  c.push(['rewind', ST.s05 - 0.15, 0.7], ['cut', ST.s06 - 0.12, 0.35], ['street', ST.s06, 0.4], ['paint', tLeftTurn - 0.1, 0.5], ['pop', tDeliv, 0.6]);
  c.push(['cut', ST.s07 - 0.12, 0.3], ['click', ST.s07 + 0.05, 0.7]); for (let i = 0; i < 4; i++) c.push(['blinker', ST.s07 + 0.12 + i / 1.6, 0.55]);
  c.push(['cut', ST.s08 - 0.12, 0.3]); for (let i = 0; i < 4; i++) c.push(['passby', ST.s08 + 0.1 + i * 0.55, 0.6]); for (let i = 0; i < 3; i++) c.push(['blinker', ST.s08 + i / 1.6, 0.35]);
  c.push(['cut', ST.s09 - 0.12, 0.3]); for (let i = 0; i < 3; i++) c.push(['passby', ST.s09 + i * 0.4, 0.45]); c.push(['tag', ST.s09, 0.4]);
  c.push(['cut', ST.s10 - 0.12, 0.3], ['idle', ST.s10 - 0.1, 0.8], ['puff', ST.s10 + 0.2, 0.4], ['puff', ST.s10 + 0.9, 0.4]);
  c.push(['cut', ST.s11 - 0.12, 0.3], ['idle', ST.s11 - 0.1, 0.45]); for (let i = 0; i < 8; i++) c.push(['tap', ST.s11 + 0.2 + i * 0.14, 0.35]); c.push(['honk', ST.s11 + 1.3, 0.25]);
  c.push(['cut', ST.s12 - 0.12, 0.3], ['zoom', ST.s12, 0.5], ['blip', tDive, 0.5], ['pulse', tDive + 0.1, 0.4], ['tag', tFactors - 0.1, 0.5], ['tag', tFactors + 0.15, 0.5], ['tag', tLT, 0.6], ['tick', tCalc, 0.3], ['tick', tCalc + 0.2, 0.3]);
  c.push(['zoom', ST.s13, 0.35], ['tag', tUnnec + 0.1, 0.5], ['stamp', t20 + 0.12, 0.9], ['print', tMath - 0.2, 0.5]);
  c.push(['cut', ST.s14 - 0.12, 0.3], ['flutter', ST.s14, 0.6], ['whoosh', ST.s14 + 0.3, 0.5], ['buzzer', at('s14', 'driver'), 0.35], ['cut', tFor2 - 0.12, 0.3], ['paper', tFor2 + 0.15, 0.6], ['tape', tFor2 + 0.3, 0.5]);
  c.push(['cut', RACE0, 0.3], ['engine', RACE0 + 0.1, 0.25], ['tick', ST.s15 + 0.8, 0.3], ['tick', ST.s15 + 1.2, 0.3], ['tick', ST.s15 + 1.6, 0.3], ['kaching', tBeat + 0.25, 0.4], ['tear', RACE1 - 0.2, 0.5]);
  c.push(['clap', tCrazy + 0.02, 0.9], ['cut', ST.s17 - 0.12, 0.3], ['engine', ST.s17, 0.35], ['tag', tDelTruck, 0.5]);
  c.push(['cut', ST.s18 - 0.12, 0.3], ['rise', ST.s18, 0.4], ['stamp', tLonger, 0.7], ['cut', ST.s19 - 0.12, 0.3], ['pour', ST.s19, 0.5], ['stamp', tLess, 0.7], ['tear', ST.s20 - 0.32, 0.5]);
  for (let m = 0; m < 5; m++) c.push(['tick', ST.s20 + (m * 330 + 280) / 1200 * (tUPS - ST.s20), 0.4]); c.push(['tag', tCounts - 0.2, 0.5]);
  c.push(['cut', tUPS - 0.12, 0.3], ['snip', at('s20', 'just') + 0.05, 0.7], ['snip', tOneMile + 0.15, 0.7], ['paper', at('s20', 'mile', 1), 0.6], ['tag', tOneMile, 0.5]);
  c.push(['cut', tPer - 0.12, 0.3], ['zoom', tPer, 0.4]); for (let i = 0; i < 6; i++) c.push(['pop', tPer + 0.2 + i * 0.12, 0.35]); c.push(['flip', tDay, 0.5], ['flip', tDay + 0.25, 0.4]);
  c.push(['cut', tSave - 0.12, 0.3], ['coins', tSave, 0.6], ['slam', tFifty + 0.1, 0.8], ['kaching', tFifty + 0.12, 0.5], ['stamp', tYear - 0.1, 0.7], ['tear', ST.s21 - 0.32, 0.5]);
  c.push(['peel', tBan - 0.05, 0.7], ['stamp', tBan + 0.35, 0.7]);
  c.push(['cut', ST.s22 - 0.12, 0.3], ['birds', ST.s22, 0.4], ['engine', ST.s22, 0.25], ['blinker', ST.s22 + 0.2, 0.4], ['blinker', ST.s22 + 0.85, 0.4], ['blip', tSys - 0.1, 0.5]);
  c.push(['cut', ST.s23 - 0.12, 0.3], ['engine', ST.s23, 0.4], ['blinker', ST.s23 + 0.2, 0.45], ['blinker', ST.s23 + 0.85, 0.45], ['stamp', tMistake - 0.05, 0.7]);
  c.push(['cut', ST.s24 - 0.12, 0.3], ['tap', at('s24', 'smarter'), 0.6], ['cut', ST.s25 - 0.12, 0.3], ['steps', ST.s25 - 0.1, 0.4], ['thump', ST.s26 - 0.45, 0.4], ['doorbell', ST.s26 - 0.5, 0.45]);
  c.push(['cut', ST.s26 - 0.12, 0.35], ['street', ST.s26, 0.3], ['tag', tShortest, 0.5], ['tag', at('s26', 'always') - 0.1, 0.5], ['slam', tCheap - 0.1, 0.7]);
  return c;
}
const MUSIC = { b0: 0, story: ST.s03, wait: ST.s08, soft: ST.s12, myth: ST.s16, money: ST.s20, ok: ST.s21, fin: ST.s23, hit: tCheap - 0.1, end: T };

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
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); if (f % 150 === 0) process.stderr.write(`${f}/${N} ${((Date.now() - T0) / 1000).toFixed(0)}s\n`); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
})();
module.exports = { T, ST, SH, LOOP, SHORT, cornerD };
