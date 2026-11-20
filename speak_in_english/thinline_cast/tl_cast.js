// Our heroine and Tom in the thin-line style (same rig vocabulary as Irina: heavy lids, pink nose blob, bow lips, visemes, two-tone hair, cel shading).
const K = require('./tl_kit');
const { C, shape, line, oval, crPath, shadeOver, tubePts, hand, ARMS, clamp, ease, lerp2 } = K;
const PAL = {
  her: { skin: '#f8d7bb', cheek: '#f6ad9c', nose: '#f2a39a', lip: '#d8405f', mouthIn: '#6a1a2a', tongue: '#f08a96', brow: '#3b2620', shadow: '#c98bb3', hairP: '#3b2620', hairM: '#b5683c',
         iris: '#6a3a22', nail: '#e0457a', gold: '#d8a12a', top: '#f0b532', top2: '#fffaf2', dot: '#f5a0bd' },
  tom: { skin: '#f3c9a6', cheek: '#efa58e', nose: '#e9998c', lip: '#c9706a', mouthIn: '#5a1a22', tongue: '#ec8e94', brow: '#5a321a', shadow: null, hairP: '#7a4224', hairM: '#c47a3e',
         iris: '#3a9a68', nail: '#eab89f', gold: '#d8a12a', top: '#3d82ee', top2: '#2a62c8' } };
const VIS = { X: { open: 0, width: 1, round: 0, smile: 0, press: 0, bite: 0 }, A: { open: .95, width: 1.0, round: 0, smile: .1, press: 0, bite: 0 }, O: { open: .62, width: .72, round: 1, smile: 0, press: 0, bite: 0 },
  U: { open: .32, width: .6, round: 1, smile: 0, press: 0, bite: 0 }, E: { open: .52, width: 1.12, round: 0, smile: .35, press: 0, bite: 0 }, I: { open: .3, width: 1.18, round: 0, smile: .55, press: 0, bite: 0 },
  M: { open: 0, width: .96, round: 0, smile: 0, press: 1, bite: 0 }, F: { open: .1, width: 1.0, round: 0, smile: 0, press: 0, bite: 1 } };
const g = () => K.g;
function setPal(P) { Object.assign(C, P); K.setShaded(new Set([P.skin, P.hairP, P.hairM, P.top, P.top2])); }
// ---------------- face (eyes, brows, nose, cheeks, mouth) — adapted from Irina's rig ----------------
function face(x, y, o, st) {
  const mo = st.mo || VIS.X, sm = Math.max(st.smile || 0, mo.smile * 0.6), op = mo.open, D = op * 16, G = g();
  shape(o.F.map(([dx, dy, w]) => [x + dx * (1 - w * op * .05), y + dy + w * D]), C.skin);
  const ch = sm * 12 + mo.width * 2 - 2, [crx, cry] = o.ck || [50, 40]; G.save(); G.globalAlpha = .75; oval(x - o.cx, y + o.cy - ch, crx, cry - sm * 4, C.cheek, 0); oval(x + o.cx, y + o.cy - ch, crx, cry - sm * 4, C.cheek, 0); G.restore();
  const br = (st.browUp || 0), lidBase = st.lid || 0, bl = st.blink || 0;
  for (const s of [-1, 1]) {
    const ex = x + s * o.ex, ey = y + o.ey, ew = o.ew, eh = o.eh || 20, lowY = ey + eh - sm * 13; let topY = ey - eh + 2 * eh * lidBase + sm * 4; topY = topY + (lowY - 3 - topY) * bl;
    const eyePath = () => { G.beginPath(); G.moveTo(ex - ew, ey + 1); G.bezierCurveTo(ex - ew * .64, topY - 2, ex + ew * .64, topY - 2, ex + ew, ey + 2); G.bezierCurveTo(ex + ew * .6, lowY + 2, ex - ew * .6, lowY + 2, ex - ew, ey + 1); G.closePath(); };
    if (o.lashes && C.shadow) { const bt = Math.min(topY - 15, ey - 32 + (topY - (ey - 20)) * .9) - br * .3; shape([[ex - ew - 9, ey - 2], [ex - 20, bt], [ex + 22, bt], [ex + ew + 11, ey - 2], [ex + 24, topY - 2], [ex - 20, topY - 2]], C.shadow, 3); }
    if (lowY - topY > 4) { eyePath(); G.fillStyle = '#fff'; G.fill();
      G.save(); eyePath(); G.clip(); const lx = ex + (st.look || 0) * 10; const ir = o.ir || 21; oval(lx, ey + 3, ir, ir, C.iris, 0); oval(lx, ey + 4, ir * .52, ir * .52, C.ink, 0); oval(lx + ir * .33, ey - ir * .25, ir * .28, ir * .28, '#fff', 0); G.restore();
      G.beginPath(); G.moveTo(ex - ew, ey + 1); G.bezierCurveTo(ex - ew * .6, lowY + 2, ex + ew * .6, lowY + 2, ex + ew, ey + 2); G.strokeStyle = C.ink; G.lineWidth = 2.5; G.stroke(); }
    G.beginPath(); G.moveTo(ex - ew - 2, ey + 1); G.bezierCurveTo(ex - ew * .64, topY - 2, ex + ew * .64, topY - 2, ex + ew + 2, ey + 2); G.strokeStyle = C.ink; G.lineWidth = o.lid; G.lineCap = 'round'; G.stroke();
    if (o.lashes) { for (let k = 0; k < 5; k++) { const u = (k + .5) / 5, lx = ex - ew + 4 + u * (ew * 2 - 8), ly = ey + 1 + (topY - 2 - ey) * Math.sin(u * Math.PI) * .98; line([[lx, ly - 1], [lx + s * 3 + (u - .5) * 6, ly - 9 - Math.sin(u * Math.PI) * 3]], 2); }
      line([[ex + s * ew, ey + 1], [ex + s * (ew + 14), ey - 10]], 3); }
    const bY = -br - sm * 4 + (st.frown || 0) * 6, bw = o.browT;
    shape([[ex - 48, ey - 64 + bY], [ex - 10, ey - 80 + bY], [ex + 40, ey - 72 + bY + (st.frown || 0) * 8], [ex + 44, ey - 64 + bY + (st.frown || 0) * 8], [ex - 8, ey - 72 + bY + 12 - bw], [ex - 46, ey - 56 + bY]].map(([px, py]) => [s > 0 ? 2 * ex - px : px, py]), C.brow, 3);
  }
  shape([[x - 8, y + o.ny], [x + 8, y + o.ny], [x + 15 + sm * 2, y + o.ny + 48], [x, y + o.ny + 56 - sm * 2], [x - 15 - sm * 2, y + o.ny + 48]], C.nose, 0);
  const my = y + o.my, Dm = op * 30, w = o.mw * mo.width + sm * 14, rnd = mo.round, pr = mo.press;
  const cy = my + 2 + Dm * .28 - sm * 10 + rnd * 4, upT = my - o.lt - op * 3 - rnd * 3 + pr * 3, upB = my + 3 - op * 2, loT = my + 4 + Dm, loB = my + o.lb + Dm + rnd * 4 - pr * 6 - mo.bite * 8;
  const upper = [[x - w, cy], [x - w * .5, upT], [x, upT + 6 - rnd * 2], [x + w * .5, upT], [x + w, cy], [x + w * .45, upB], [x, upB + 1], [x - w * .45, upB]];
  if (Dm > 3) { const inner = [[x - w + 4 + rnd * 8, cy], [x - w * .45, upB], [x, upB + 1], [x + w * .45, upB], [x + w - 4 - rnd * 8, cy], [x + w * .45, loT], [x, loT + 2], [x - w * .45, loT]];
    shape(inner, C.mouthIn, 3); G.save(); crPath(inner); G.clip(); G.fillStyle = '#fff'; G.fillRect(x - w, upB - 2, w * 2, Math.min(11, Dm * .4) * (1 - rnd * .6)); oval(x, loT + 4, w * .42, Dm * .32 + 2, C.tongue, 0); G.restore(); }
  if (mo.bite > .3) { G.fillStyle = '#fff'; G.fillRect(x - w * .5, upB - 1, w, 8); G.strokeStyle = C.ink; G.lineWidth = 2; G.strokeRect(x - w * .5, upB - 1, w, 8); }
  shape(upper, C.lip, 3.2); shape([[x - w + 2, cy + 1], [x - w * .45, loT], [x, loT + 2], [x + w * .45, loT], [x + w - 2, cy + 1], [x + w * .4, loB], [x, loB + 3], [x - w * .4, loB]], C.lip, 3.2);
  if (Dm <= 3) line([[x - w, cy], [x - w * .4, upB + 1], [x, upB + 2], [x + w * .4, upB + 1], [x + w, cy]], 3);
  if (sm > .3) for (const s of [-1, 1]) line([[x + s * (w + 9), cy - 9], [x + s * (w + 3), cy + 3]], 2.5);
}
// arms: Irina's poses scaled to a slimmer body
function arms(x, y, st, kx, sleeve, w0, w1, shoulderX, ring) {
  const S = p => [x + (p[0] - x) * kx, p[1]], P = pose => { const a = ARMS[pose](x, y); return { L: { ...a.L, e: S(a.L.e), h: S(a.L.h) }, R: { ...a.R, e: S(a.R.e), h: S(a.R.h) } }; };
  const A = P(st.armA || 'hips'), B = P(st.armB || st.armA || 'hips'), k = ease(st.armK ?? 1), arm = {};
  for (const side of ['L', 'R']) { const a = A[side], b = B[side], e = lerp2(a.e, b.e, k), h = lerp2(a.h, b.h, k);
    arm[side] = { e, h, ang: a.ang + (b.ang - a.ang) * k, mode: k < .5 ? a.mode : b.mode, flip: k < .5 ? a.flip : b.flip };
    const sh = [x + (side === 'L' ? -shoulderX : shoulderX), y + 320], d = Math.hypot(e[0] - h[0], e[1] - h[1]) || 1, wr = [h[0] + (e[0] - h[0]) / d * 40, h[1] + (e[1] - h[1]) / d * 40];
    shape(tubePts([sh, e, wr], w0, w1), sleeve); }
  hand(arm.L.h[0], arm.L.h[1], arm.L.ang, arm.L.mode, arm.L.flip, null, ring); hand(arm.R.h[0], arm.R.h[1], arm.R.ang, arm.R.mode, arm.R.flip, null, false); }
// ---------------- heroine: dark bob with a caramel lock, yellow cardigan over a polka-dot blouse ----------------
const HER_F = [[-158, -60, 0], [-138, -150, 0], [-70, -190, 0], [70, -190, 0], [138, -150, 0], [158, -60, 0], [154, 40, .05], [118, 126, .35], [52, 182, .8], [0, 194, 1], [-52, 182, .8], [-118, 126, .35], [-154, 40, .05]];
function heroine(st) { const x = st.x ?? 540, y = 1000 + (st.by || 0), G = g(); setPal(PAL.her); const T = st.time || 0;
  shape([[x - 196, y + 150], [x - 218, y + 20], [x - 214, y - 112], [x - 168, y - 216], [x - 80, y - 270], [x + 52, y - 278], [x + 160, y - 228], [x + 212, y - 120], [x + 220, y + 20], [x + 198, y + 150], [x + 150, y + 172], [x - 150, y + 172]], C.hairP);
  shape([[x - 56, y + 150], [x + 56, y + 150], [x + 62, y + 240], [x - 62, y + 240]], C.skin);
  const blouse = [[x - 212, 2600], [x - 213, y + 1300], [x - 214, y + 800], [x - 214, y + 520], [x - 214, y + 330], [x - 176, y + 272], [x - 66, y + 246], [x, y + 296], [x + 66, y + 246], [x + 176, y + 272], [x + 214, y + 330], [x + 214, y + 520], [x + 214, y + 800], [x + 213, y + 1300], [x + 212, 2600]];
  shape([[x - 70, y + 230], [x + 70, y + 230], [x, y + 320]], C.skin, 0); shape(blouse, C.top2);
  G.save(); crPath(blouse); G.clip(); G.fillStyle = C.dot; for (let i = 0; i < 14; i++) for (let k = 0; k < 18; k++) { G.beginPath(); G.arc(x - 300 + i * 46 + (k % 2) * 23, y + 260 + k * 44, 7, 0, 7); G.fill(); } G.restore(); shadeOver(blouse); crPath(blouse); G.strokeStyle = C.ink; G.lineWidth = K.LW; G.stroke();
  for (const s of [-1, 1]) { const pnl = [[x + s * 220, 2600], [x + s * 222, y + 1300], [x + s * 223, y + 800], [x + s * 224, y + 520], [x + s * 224, y + 330], [x + s * 188, y + 266], [x + s * 112, y + 252], [x + s * 58, y + 390], [x + s * 62, y + 700], [x + s * 66, y + 1300], [x + s * 70, 2600]]; shape(pnl, C.top); }
  for (let q = 0; q < 4; q++) oval(x - 66, y + 430 + q * 70, 10, 10, '#fff4cf', 3);
  arms(x, y, st, 0.8, C.top, 92, 70, 200, true);
  face(x, y, { F: HER_F, cx: 96, cy: 84, ck: [38, 28], ex: 64, ey: 10, ew: 46, eh: 25, ir: 25, lid: 5.5, lashes: true, browT: 4, ny: 34, my: 130, mw: 34, lt: 12, lb: 22 }, st);
  for (const s of [-1, 1]) { const a = 0.2 * Math.sin(T * 2.6 + s) * (0.3 + (st.talk || 0) * .7); G.save(); G.translate(x + s * 160, y + 120); G.rotate(a); oval(0, 0, 9, 9, C.gold, 3); shape([[0, 8], [10, 28], [0, 40], [-10, 28]], C.gold, 3); G.restore(); }
  const sway = (pts) => pts.map(([px, py]) => [px + clamp((py - (y - 60)) / 220) * 4 * Math.sin(T * 1.1 + .6), py]);
  shape(sway([[x + 40, y - 270], [x - 60, y - 256], [x - 160, y - 206], [x - 198, y - 104], [x - 204, y + 20], [x - 188, y + 136], [x - 164, y + 162], [x - 150, y + 100], [x - 156, y - 10], [x - 150, y - 104], [x - 88, y - 156], [x - 6, y - 176], [x + 34, y - 206]]), C.hairP);
  shape(sway([[x + 40, y - 270], [x + 152, y - 230], [x + 204, y - 124], [x + 212, y + 20], [x + 194, y + 150], [x + 162, y + 132], [x + 166, y + 0], [x + 168, y - 92], [x + 120, y - 164], [x + 70, y - 204]]), C.hairP);
  for (const p of [[[x + 30, y - 262], [x - 70, y - 236], [x - 150, y - 176], [x - 184, y - 70], [x - 180, y + 70]], [[x + 40, y - 262], [x + 130, y - 224], [x + 188, y - 116], [x + 196, y + 40]], [[x + 22, y - 240], [x - 56, y - 210], [x - 120, y - 160], [x - 148, y - 96]], [[x + 18, y - 222], [x - 40, y - 190], [x - 96, y - 150]], [[x + 60, y - 236], [x + 130, y - 196], [x + 166, y - 120]], [[x + 40, y - 270], [x + 34, y - 230]]]) line(sway(p), 2.6);
}
// ---------------- Tom: short brown hair with a lighter swoop, blue jumper ----------------
const TOM_F = [[-156, -70, 0], [-142, -160, 0], [-72, -206, 0], [72, -206, 0], [142, -160, 0], [156, -70, 0], [156, 40, .05], [142, 136, .35], [84, 196, .8], [0, 210, 1], [-84, 196, .8], [-142, 136, .35], [-156, 40, .05]];
function tom(st) { const x = st.x ?? 540, y = 990 + (st.by || 0), G = g(); setPal(PAL.tom);
  shape([[x - 66, y + 168], [x + 66, y + 168], [x + 74, y + 256], [x - 74, y + 256]], C.skin);
  const body = [[x - 246, 2600], [x - 248, y + 1300], [x - 250, y + 800], [x - 250, y + 540], [x - 250, y + 340], [x - 200, y + 274], [x - 84, y + 248], [x, y + 262], [x + 84, y + 248], [x + 200, y + 274], [x + 250, y + 340], [x + 250, y + 540], [x + 250, y + 800], [x + 248, y + 1300], [x + 246, 2600]];
  shape(body, C.top); shape([[x - 86, y + 246], [x + 86, y + 246], [x + 72, y + 286], [x, y + 298], [x - 72, y + 286]], C.top2, 4);
  for (let q = -3; q <= 3; q++) line([[x + q * 20, y + 252], [x + q * 18, y + 288]], 2);
  arms(x, y, st, 0.88, C.top, 104, 80, 232, false);
  for (const s of [-1, 1]) { oval(x + s * 158, y + 14, 24, 38, C.skin); line([[x + s * 154, y - 2], [x + s * 164, y + 18], [x + s * 154, y + 34]], 2.5); }
  face(x, y, { F: TOM_F, cx: 92, cy: 92, ck: [34, 24], ex: 62, ey: 4, ew: 42, eh: 22, ir: 22, lid: 4.5, lashes: false, browT: 11, ny: 30, my: 140, mw: 38, lt: 9, lb: 18 }, st);
  shape([[x - 162, y - 40], [x - 172, y - 130], [x - 136, y - 216], [x - 54, y - 270], [x + 56, y - 274], [x + 146, y - 228], [x + 176, y - 140], [x + 168, y - 40], [x + 150, y - 112], [x + 108, y - 162], [x + 36, y - 180], [x - 36, y - 172], [x - 100, y - 152], [x - 144, y - 102]], C.hairP);
  shape([[x - 146, y - 150], [x - 118, y - 112], [x - 96, y - 152], [x - 64, y - 118], [x - 40, y - 160], [x - 6, y - 124], [x + 22, y - 166], [x + 58, y - 132], [x + 90, y - 170], [x + 124, y - 146], [x + 146, y - 186], [x + 120, y - 238], [x + 30, y - 264], [x - 72, y - 254], [x - 132, y - 214]], C.hairP);
  for (const p of [[[x - 110, y - 222], [x - 80, y - 168]], [[x - 60, y - 236], [x - 46, y - 176]], [[x - 4, y - 244], [x + 4, y - 180]], [[x + 50, y - 240], [x + 60, y - 180]], [[x + 100, y - 222], [x + 112, y - 186]], [[x - 150, y - 120], [x - 166, y - 60]], [[x + 150, y - 120], [x + 162, y - 60]]]) line(p, 2.6);
}
module.exports = { heroine, tom, VIS, PAL };
