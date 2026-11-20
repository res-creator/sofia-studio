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
// ---------------- anatomical body: torso with shoulders, waist, hips; arms (elbow at the waist, wrist at the hip); legs with knees; shoes ----------------
// arm poses for our cast: [elbow, hand, hand angle, flip, hand mode] per side, sw = half shoulder width
function POSE(x, y, sw) { const L = (e, h, ang, flip, mode) => ({ e, h, ang, flip, mode });
  return {
    down:  { L: L([x - sw - 36, y + 560], [x - sw - 30, y + 780], 1.62, 1, 'open'), R: L([x + sw + 36, y + 560], [x + sw + 30, y + 780], Math.PI - 1.62, -1, 'open') },
    hips:  { L: L([x - sw - 95, y + 500], [x - sw + 24, y + 640], 0.55, 1, 'hold'), R: L([x + sw + 95, y + 500], [x + sw - 24, y + 640], Math.PI - 0.55, -1, 'hold') },
    point: { L: L([x - sw - 36, y + 560], [x - sw - 30, y + 780], 1.62, 1, 'open'), R: L([x + sw + 95, y + 430], [x + sw + 230, y + 330], -0.65, 1, 'open') },
    pointL:{ L: L([x - sw - 95, y + 430], [x - sw - 230, y + 330], Math.PI + 0.65, -1, 'open'), R: L([x + sw + 36, y + 560], [x + sw + 30, y + 780], Math.PI - 1.62, -1, 'open') },
    spread:{ L: L([x - sw - 70, y + 540], [x - sw - 200, y + 470], Math.PI + 0.45, -1, 'open'), R: L([x + sw + 70, y + 540], [x + sw + 200, y + 470], -0.45, 1, 'open') },
    wave:  { L: L([x - sw - 36, y + 560], [x - sw - 30, y + 780], 1.62, 1, 'open'), R: L([x + sw + 110, y + 330], [x + sw + 150, y + 140], -1.4, 1, 'open') } }; }
function arms(x, y, st, sw, sleeve, w0, w1, ring) {   // sleeves now (behind the torso), returns a function that draws the hands on top
  const PS = POSE(x, y, sw), A = PS[st.armA || 'down'], B = PS[st.armB || st.armA || 'down'], k = ease(st.armK ?? 1), arm = {};
  for (const side of ['L', 'R']) { const a = A[side], b = B[side], e = lerp2(a.e, b.e, k), h = lerp2(a.h, b.h, k), sg = side === 'L' ? -1 : 1;
    arm[side] = { e, h, ang: a.ang + (b.ang - a.ang) * k, mode: k < .5 ? a.mode : b.mode, flip: k < .5 ? a.flip : b.flip };
    const sh = [x + sg * (sw - 30), y + 350], d = Math.hypot(e[0] - h[0], e[1] - h[1]) || 1, wr = [h[0] + (e[0] - h[0]) / d * 36, h[1] + (e[1] - h[1]) / d * 36];
    shape(tubePts([sh, e, wr], w0, w1), sleeve); }
  return () => { hand(arm.L.h[0], arm.L.h[1], arm.L.ang, arm.L.mode, arm.L.flip, null, ring); hand(arm.R.h[0], arm.R.h[1], arm.R.ang, arm.R.mode, arm.R.flip, null, false); }; }
function legs(x, y, hipX, w0, w1, jeans, shoe, shoeTop) {
  for (const s of [-1, 1]) { const hip = [x + s * hipX, y + 700], knee = [x + s * (hipX + 4), y + 1020], ank = [x + s * (hipX - 2), y + 1300];
    shape(tubePts([hip, knee, ank], w0, w1), jeans); line([[knee[0] - s * 18, knee[1] - 30], [knee[0] - s * 6, knee[1] - 6]], 2.5);
    const fx = ank[0] + s * 10, fy = ank[1] + 22;
    shape([[fx - s * 44, fy - 30], [fx + s * 30, fy - 34], [fx + s * 70, fy + 4], [fx + s * 66, fy + 26], [fx - s * 50, fy + 28], [fx - s * 54, fy - 4]], shoe);
    if (shoeTop) line([[fx - s * 46, fy + 14], [fx + s * 66, fy + 14]], 3); } }
function floorShadow(x, y, rx) { const G = g(), cy = y + 1352, gr = G.createRadialGradient(x, cy, 0, x, cy, rx); gr.addColorStop(0, 'rgba(60,20,70,0.22)'); gr.addColorStop(1, 'rgba(60,20,70,0)'); G.save(); G.translate(x, cy); G.scale(1, .18); G.translate(-x, -cy); G.fillStyle = gr; G.fillRect(x - rx, cy - rx, rx * 2, rx * 2); G.restore(); }
// ---------------- heroine: dark bob with a side parting, yellow cardigan over a polka-dot blouse, jeans, white sneakers ----------------
const HER_F = [[-158, -60, 0], [-138, -150, 0], [-70, -190, 0], [70, -190, 0], [138, -150, 0], [158, -60, 0], [154, 40, .05], [118, 126, .35], [52, 182, .8], [0, 194, 1], [-52, 182, .8], [-118, 126, .35], [-154, 40, .05]];
function heroine(st) { const x = st.x ?? 540, y = 1000 + (st.by || 0), G = g(); setPal(PAL.her); const T = st.time || 0, sw = 196;
  floorShadow(x, y - (st.by || 0), 240);
  shape([[x - 196, y + 150], [x - 218, y + 20], [x - 214, y - 112], [x - 168, y - 216], [x - 80, y - 270], [x + 52, y - 278], [x + 160, y - 228], [x + 212, y - 120], [x + 220, y + 20], [x + 198, y + 150], [x + 150, y + 172], [x - 150, y + 172]], C.hairP);
  legs(x, y, 70, 118, 72, '#7fa7d9', '#fbfbf8', true);
  shape([[x - 180, y + 600], [x + 180, y + 600], [x + 188, y + 700], [x + 150, y + 762], [x + 26, y + 772], [x, y + 744], [x - 26, y + 772], [x - 150, y + 762], [x - 188, y + 700]], '#7fa7d9');
  line([[x, y + 640], [x, y + 742]], 2.5);
  shape([[x - 56, y + 150], [x + 56, y + 150], [x + 62, y + 240], [x - 62, y + 240]], C.skin);
  const hands = arms(x, y, st, sw, C.top, 78, 60, true);
  const blouse = [[x - 160, y + 560], [x - 176, y + 440], [x - 198, y + 372], [x - 194, y + 300], [x - 150, y + 262], [x - 66, y + 246], [x, y + 296], [x + 66, y + 246], [x + 150, y + 262], [x + 194, y + 300], [x + 198, y + 372], [x + 176, y + 440], [x + 160, y + 560], [x + 170, y + 650], [x + 172, y + 690], [x, y + 694], [x - 172, y + 690], [x - 170, y + 650]];
  shape([[x - 70, y + 230], [x + 70, y + 230], [x, y + 320]], C.skin, 0); shape(blouse, C.top2);
  G.save(); crPath(blouse); G.clip(); G.fillStyle = C.dot; for (let i = 0; i < 12; i++) for (let k = 0; k < 12; k++) { G.beginPath(); G.arc(x - 260 + i * 46 + (k % 2) * 23, y + 260 + k * 44, 7, 0, 7); G.fill(); } G.restore(); shadeOver(blouse); crPath(blouse); G.strokeStyle = C.ink; G.lineWidth = K.LW; G.stroke();
  for (const s of [-1, 1]) shape([[x + s * 182, y + 730], [x + s * 168, y + 560], [x + s * 184, y + 440], [x + s * 206, y + 376], [x + s * 200, y + 298], [x + s * 156, y + 260], [x + s * 112, y + 252], [x + s * 58, y + 390], [x + s * 60, y + 600], [x + s * 64, y + 736]], C.top);
  for (let q = 0; q < 4; q++) oval(x - 64, y + 430 + q * 70, 10, 10, '#fff4cf', 3);
  for (const s of [-1, 1]) line([[x + s * 160, y + 268], [x + s * 194, y + 324], [x + s * 198, y + 400]], 2.5);
  hands();
  face(x, y, { F: HER_F, cx: 96, cy: 84, ck: [38, 28], ex: 64, ey: 10, ew: 46, eh: 25, ir: 25, lid: 5.5, lashes: true, browT: 4, ny: 34, my: 130, mw: 34, lt: 12, lb: 22 }, st);
  for (const s of [-1, 1]) { const a = 0.2 * Math.sin(T * 2.6 + s) * (0.3 + (st.talk || 0) * .7); G.save(); G.translate(x + s * 160, y + 120); G.rotate(a); oval(0, 0, 9, 9, C.gold, 3); shape([[0, 8], [10, 28], [0, 40], [-10, 28]], C.gold, 3); G.restore(); }
  const sway = (pts) => pts.map(([px, py]) => [px + clamp((py - (y - 60)) / 220) * 4 * Math.sin(T * 1.1 + .6), py]);
  shape(sway([[x + 40, y - 270], [x - 60, y - 256], [x - 160, y - 206], [x - 198, y - 104], [x - 204, y + 20], [x - 188, y + 136], [x - 164, y + 162], [x - 150, y + 100], [x - 156, y - 10], [x - 150, y - 104], [x - 88, y - 156], [x - 6, y - 176], [x + 34, y - 206]]), C.hairP);
  shape(sway([[x + 40, y - 270], [x + 152, y - 230], [x + 204, y - 124], [x + 212, y + 20], [x + 194, y + 150], [x + 162, y + 132], [x + 166, y + 0], [x + 168, y - 92], [x + 120, y - 164], [x + 70, y - 204]]), C.hairP);
  for (const p of [[[x + 30, y - 262], [x - 70, y - 236], [x - 150, y - 176], [x - 184, y - 70], [x - 180, y + 70]], [[x + 40, y - 262], [x + 130, y - 224], [x + 188, y - 116], [x + 196, y + 40]], [[x + 22, y - 240], [x - 56, y - 210], [x - 120, y - 160], [x - 148, y - 96]], [[x + 18, y - 222], [x - 40, y - 190], [x - 96, y - 150]], [[x + 60, y - 236], [x + 130, y - 196], [x + 166, y - 120]], [[x + 40, y - 270], [x + 34, y - 230]]]) line(sway(p), 2.6);
}
// ---------------- Tom: short brown hair with a fringe, blue jumper, dark jeans, dark sneakers ----------------
const TOM_F = [[-156, -70, 0], [-142, -160, 0], [-72, -206, 0], [72, -206, 0], [142, -160, 0], [156, -70, 0], [156, 40, .05], [142, 136, .35], [84, 196, .8], [0, 210, 1], [-84, 196, .8], [-142, 136, .35], [-156, 40, .05]];
function tom(st) { const x = st.x ?? 540, y = 990 + (st.by || 0), G = g(); setPal(PAL.tom); const sw = 222;
  floorShadow(x, y + 10 - (st.by || 0), 270);
  legs(x, y + 10, 80, 136, 84, '#3a4866', '#3a2f2a', true);
  shape([[x - 200, y + 640], [x + 200, y + 640], [x + 206, y + 740], [x + 160, y + 792], [x + 26, y + 802], [x, y + 772], [x - 26, y + 802], [x - 160, y + 792], [x - 206, y + 740]], '#3a4866');
  shape([[x - 66, y + 168], [x + 66, y + 168], [x + 74, y + 256], [x - 74, y + 256]], C.skin);
  const hands = arms(x, y, st, sw, C.top, 92, 72, false);
  shape([[x - 206, y + 600], [x - 220, y + 440], [x - 236, y + 386], [x - 228, y + 312], [x - 172, y + 268], [x - 84, y + 248], [x, y + 262], [x + 84, y + 248], [x + 172, y + 268], [x + 228, y + 312], [x + 236, y + 386], [x + 220, y + 440], [x + 206, y + 600], [x + 210, y + 680], [x + 213, y + 740], [x + 214, y + 768], [x + 110, y + 770], [x, y + 771], [x - 110, y + 770], [x - 214, y + 768], [x - 213, y + 740], [x - 210, y + 680]], C.top);
  shape([[x - 214, y + 704], [x - 110, y + 705], [x, y + 706], [x + 110, y + 705], [x + 214, y + 704], [x + 215, y + 720], [x + 215, y + 752], [x + 214, y + 768], [x + 110, y + 771], [x, y + 772], [x - 110, y + 771], [x - 214, y + 768], [x - 215, y + 752], [x - 215, y + 720]], C.top2, 4);
  shape([[x - 86, y + 246], [x + 86, y + 246], [x + 72, y + 286], [x, y + 298], [x - 72, y + 286]], C.top2, 4);
  for (let q = -3; q <= 3; q++) line([[x + q * 20, y + 252], [x + q * 18, y + 288]], 2);
  for (const s of [-1, 1]) line([[x + s * 192, y + 280], [x + s * 226, y + 340], [x + s * 230, y + 420]], 2.5);
  hands();
  for (const s of [-1, 1]) { oval(x + s * 158, y + 14, 24, 38, C.skin); line([[x + s * 154, y - 2], [x + s * 164, y + 18], [x + s * 154, y + 34]], 2.5); }
  face(x, y, { F: TOM_F, cx: 92, cy: 92, ck: [34, 24], ex: 62, ey: 4, ew: 42, eh: 22, ir: 22, lid: 4.5, lashes: false, browT: 11, ny: 30, my: 140, mw: 38, lt: 9, lb: 18 }, st);
  shape([[x - 162, y - 40], [x - 172, y - 130], [x - 136, y - 216], [x - 54, y - 270], [x + 56, y - 274], [x + 146, y - 228], [x + 176, y - 140], [x + 168, y - 40], [x + 150, y - 112], [x + 108, y - 162], [x + 36, y - 180], [x - 36, y - 172], [x - 100, y - 152], [x - 144, y - 102]], C.hairP);
  shape([[x - 146, y - 150], [x - 118, y - 112], [x - 96, y - 152], [x - 64, y - 118], [x - 40, y - 160], [x - 6, y - 124], [x + 22, y - 166], [x + 58, y - 132], [x + 90, y - 170], [x + 124, y - 146], [x + 146, y - 186], [x + 120, y - 238], [x + 30, y - 264], [x - 72, y - 254], [x - 132, y - 214]], C.hairP);
  for (const p of [[[x - 110, y - 222], [x - 80, y - 168]], [[x - 60, y - 236], [x - 46, y - 176]], [[x - 4, y - 244], [x + 4, y - 180]], [[x + 50, y - 240], [x + 60, y - 180]], [[x + 100, y - 222], [x + 112, y - 186]], [[x - 150, y - 120], [x - 166, y - 60]], [[x + 150, y - 120], [x + 162, y - 60]]]) line(p, 2.6);
}
module.exports = { heroine, tom, VIS, PAL };
