// Episode 10 V2 "The $5 Coffee That Cost $40" (copy of episode.js): the fee section is now physical (two machines stamp, tags fly into fee bins),
// the court part is two action shots (a customer buried in fees, the appeals storm and the gavel), tighter pauses. Script lines w19 removed, w21/w22 shortened.
// Episode 10 "The $5 Coffee That Cost $40" (Wells Fargo, California, 2000s) — first full episode on hirkit.
// Real world (cafe, food truck, gas station, supermarket, living room) -> torn paper through the bank app -> the paper posting machine
// -> court record -> back to the cafe. Shots cut on voice-over words. 1080x1920, 30 fps.
// Usage: node episode_v2.js video out.mp4 | still t1,t2,... out.png | cues
const { createCanvas } = require('@napi-rs/canvas');
const { spawn } = require('child_process');
const fs = require('fs');
const K = require('../tests/mcd_collage/kit');
const EN = require('../mcd_ep1/engine');            // voice timings + subtitle drawing only (read-only use)
const R = require('../hirkit/rig');
const LT = require('../hirkit/light');
const CL = require('../hirkit/collage');
const { makeEdit } = require('../hirkit/edit');
const CF = require('../tests/coffee_scene_v2/cafe2');
const WF = require('./wfkit');
const { C, F, clamp, lerp, seg, E, rr } = K;
const { INK, fillStroke, ell } = R;
const { W, H, layer, txt, fitTxt, MAYA } = WF;
const FPS = 30;
const k = (t, a, b, e = E.inOut) => e(seg(t, a, b));

// ---------- voice timeline (natural speed; gaps only) ----------
const LINES = JSON.parse(fs.readFileSync(`${__dirname}/script_v2.json`));
const GAP = { w01: 0.2, w02: 0.12, w03: 0.3, w04: 0.15, w05: 0.2, w06: 0.2, w07: 0.25, w08: 0.4, w09: 0.25, w10: 0.12, w11: 0.2, w12: 0.15, w13: 0.25, w14: 0.22,
  w15: 0.3, w17: 0.2, w18: 0.3, w20: 0.35, w21b: 0.3, w22b: 0.3, w23: 0.25, w24: 0.2, w25: 0 };
const SPEECH = {}; for (const L of LINES) { const a = JSON.parse(fs.readFileSync(`${__dirname}/vo_v2/${L.id}.align.json`)); SPEECH[L.id] = a.character_end_times_seconds.slice(-1)[0]; }
const ST = {}; { let t = 0.15; for (const L of LINES) { ST[L.id] = +t.toFixed(3); t += SPEECH[L.id] + GAP[L.id]; } }
const T = +(ST.w25 + SPEECH.w25 + 0.85).toFixed(2);
const V = EN.voice(`${__dirname}/vo_v2`, ST), at = (id, w, n = 0) => V.at(id, w, n), end = id => ST[id] + SPEECH[id];

// ---------- camera helper ----------
function cam(keys, lt) {
  let c; if (lt <= keys[0][0]) c = keys[0]; else if (lt >= keys[keys.length - 1][0]) c = keys[keys.length - 1];
  else for (let i = 1; i < keys.length; i++) if (lt < keys[i][0]) { const a = keys[i - 1], b = keys[i], u = E.inOut(seg(lt, a[0], b[0])); c = [lt, lerp(a[1], b[1], u), lerp(a[2], b[2], u), Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), u)), lerp(a[4] || 0, b[4] || 0, u)]; break; }
  return { x: c[1] + Math.sin(lt * 0.9) * 4 / c[3], y: c[2] + Math.cos(lt * 0.7) * 3 / c[3], z: c[3], r: (c[4] || 0) + Math.sin(lt * 0.6) * 0.003 };
}
const shake = (t, t0, a = 14) => (t > t0 && t < t0 + 0.35) ? Math.sin((t - t0) * 70) * a * (1 - seg(t, t0, t0 + 0.35)) : 0;
const HALF = createCanvas(W / 2, H / 2), hx = HALF.getContext('2d');
function halfPass(ctx, blur, draw) {
  hx.setTransform(1, 0, 0, 1, 0, 0); hx.clearRect(0, 0, W / 2, H / 2); hx.setTransform(0.5, 0, 0, 0.5, 0, 0);
  R.LINE.dev = 0.5; draw(hx); R.LINE.dev = 1;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); if (blur > 0.3) ctx.filter = `blur(${blur.toFixed(1)}px)`; ctx.drawImage(HALF, 0, 0, W, H); ctx.restore();
}
const blink = (t, p = 3.3, o = 0) => ((t + o) % p) > p - 0.11 ? 1 : 0;
const DAY_RIM = { dir: [-1, -0.35], color: '#FFF3D8', w: 8, a: 0.9 };

// ---------- the cafe (cafe2 set; the heroine replaces the old customer) ----------
function cafeBack(ctx, tl, c, blur) { ctx.fillStyle = '#F6E7CC'; ctx.fillRect(0, 0, W, H); halfPass(ctx, blur, g => { CF.drawCafe(g, tl, c, 'back', W, H); CF.drawCafe(g, tl, c, 'hero', W, H, { noCust: true, flat: true }); }); }
function cafeMedium(ctx, tl, c, heroine) {
  ctx.fillStyle = '#F6E7CC'; ctx.fillRect(0, 0, W, H);
  halfPass(ctx, clamp((c.z - 0.62) / 1.4) * 4, g => CF.drawCafe(g, tl, c, 'back', W, H)); LT.haze(ctx, 'day', 0.1);
  CF.drawCafe(ctx, tl, c, 'hero', W, H, { noCust: true, sun: 1.8, rimW: 7 });
  CF.layer(ctx, c, 1, g => { LT.castShadow(g, heroine, { x: 300, floorY: 0, skew: 0.45, squash: 0.2, a: 0.3, blur: 3 }); LT.lit(g, heroine, { rim: DAY_RIM }); }, W, H);
}
// bust close-up helper: background fn, then the heroine lit; o: {face, hands, tilt, lean, glow, s, ny, push}
function bustShot(ctx, lt, bg, o) {
  bg(ctx);
  const push = 1 + lt * (o.push ?? 0.03), nx = 540, ny = o.ny ?? 1470;
  ctx.save(); ctx.translate(nx, ny); ctx.scale(push, push); ctx.translate(-nx, -ny);
  const draw = c => R.bust(c, nx, ny, o.s ?? 3.0, MAYA, { face: o.face, hands: o.hands || [], headTilt: o.tilt || 0, lean: o.lean || 0 });
  const lo = { rim: o.rim ?? DAY_RIM, tint: { x0: 540, y0: 0, x1: 1080, y1: 0, color: o.shadeCol || 'rgb(205,200,228)', a: 1 } };
  if (o.glow) lo.glow = o.glow;
  LT.lit(ctx, draw, lo);
  ctx.restore();
}

// ---------- overlays ----------
function histStamp(ctx, a = 1, y = 268) { // the historical label: on screen through the whole example
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2, y);
  ctx.font = `30px ${F.black}`; const s = 'CALIFORNIA · 2000s · ILLUSTRATIVE EXAMPLE', w = ctx.measureText(s).width + 50;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -30, w, 58, 10), '#171717', { elev: 0.8, tex: 0 }); txt(ctx, s, 0, 11, 30, C.yellow); ctx.restore();
}
function headline(ctx, t) { // frame-0 hook title
  const a = 1 - seg(t, end('w03') - 0.2, end('w03') + 0.1); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2, 410);
  const flip = t >= at('w01', 'forty'), p = flip ? E.back(seg(t, at('w01', 'forty'), at('w01', 'forty') + 0.3), 2.4) : 1;
  ctx.font = `96px ${F.black}`; const left = '$5 COFFEE', right = flip ? '$40' : ' ? ', wl = ctx.measureText(left + '  →  ').width, wr = ctx.measureText(right).width + 40;
  CL.cutout(ctx, () => rr(ctx, -(wl + wr) / 2 - 30, -84, wl + wr + 60, 130, 16), '#FFFDF8', { elev: 1.4 });
  txt(ctx, left + '  →', -(wl + wr) / 2 + 10, 12, 96, INK, 'left');
  ctx.save(); ctx.translate((wl + wr) / 2 - wr / 2 - 10, -20); ctx.scale(p, p); CL.cutout(ctx, () => rr(ctx, -wr / 2, -60, wr, 112, 12), C.red, { elev: 1 }); txt(ctx, right, 0, 32, 96, '#FFFDF8'); ctx.restore();
  ctx.restore();
}

// ================= SHOTS =================
const S = []; const shot = (id, t0, t1, draw, out) => S.push({ id, t0, t1, draw, out });
const tF = at('w01', 'forty');
// H1: the cup and its price tag (cafe insert)
shot('H1 cup', 0, tF + 0.45, (ctx, t, lt) => {
  cafeBack(ctx, 6.2, { x: 700, y: -560, z: 1.7 }, 10);
  const z = 1 + lt * 0.05, sh = shake(t, tF, 16); ctx.save(); ctx.translate(W / 2 + sh, 1150); ctx.scale(z, z);
  // counter edge + her hand around the cup
  CL.cutout(ctx, () => rr(ctx, -900, 260, 1800, 900, 0), '#9C6B45', { elev: 0.5, tex: 0.3 }); ctx.fillStyle = '#B98457'; ctx.fillRect(-900, 260, 1800, 18);
  K.contact(ctx, 0, 290, 260, 40, 0.4);
  LT.lit(ctx, c => { c.save(); c.translate(0, 290); c.scale(3.2, 3.2); R.cup(c, 1, { steam: t }); c.restore();
    R.hand(c, [-210, 90], -0.15, MAYA.skin, 'hold', { size: 3.4 }); }, { rim: DAY_RIM });
  // price tag on a string, flips $5 -> $40
  const flip = t >= tF, sp = flip ? E.back(seg(t, tF, tF + 0.35), 2.6) : 1;
  ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(60, -90); ctx.quadraticCurveTo(170, -40, 230, -10); ctx.stroke();
  ctx.save(); ctx.translate(330, 0); ctx.rotate(Math.sin(t * 2) * 0.05 + (flip ? Math.sin((t - tF) * 18) * 0.15 * (1 - seg(t, tF, tF + 0.6)) : 0)); ctx.scale(sp * 1.6, sp * 1.6);
  WF.priceTag(ctx, flip ? '$40' : '$5', flip ? C.red : '#FFFDF8', flip ? '#FFFDF8' : INK); ctx.restore();
  ctx.restore(); LT.grade(ctx, 'day', { vignette: 0.18 });
});
// H2: her face: what?!
shot('H2 shock', tF + 0.45, ST.w02 + 0.05, (ctx, t, lt) => bustShot(ctx, lt, c => cafeBack(c, 6.2, { x: -700, y: -980, z: 1.25 }, 11), {
  face: R.exprMix(R.expr('surprised', { look: [0.2, 0.5] }), R.expr('shocked', { look: [0, 0.3] }), k(lt, 0.05, 0.25)), tilt: -0.04,
  hands: [{ side: 1, hand: [70, 112], elbow: [170, 430], grip: 'hold', item: c => { c.save(); c.translate(-4, 62); R.cup(c, 1.0); c.restore(); } }] }));
// H3: not the cafe — the barista shrugs it off, she looks at her cup
shot('H3 cafe', ST.w02 + 0.05, ST.w03, (ctx, t, lt) => {
  const c = cam([[0, 520, -470, 1.15, 0.015], [2, 500, -480, 1.25, 0.01]], lt);
  cafeMedium(ctx, 6.4 + lt, c, g => R.figure(g, 300, 0, 1, 1, MAYA, { lean: 0.02, farFront: 1, armF: { hand: [70, -330], grip: 'hold', item: x => { x.save(); x.translate(-6, 56); R.cup(x, 0.75); x.restore(); } },
    armN: { hand: [40, -235], grip: 'relax' }, face: R.expr('skeptical', { look: [1, 0.3], blink: blink(lt) }), headTilt: 0.04 }));
  LT.grade(ctx, 'day', { vignette: 0.14 });
});
// H4: because of your bank — she holds up her debit card, eyes narrowing
shot('H4 card', ST.w03, end('w03') + GAP.w03, (ctx, t, lt) => bustShot(ctx, lt, c => cafeBack(c, 6.6, { x: -560, y: -900, z: 1.3 }, 11), {
  face: R.exprMix('neutral', R.expr('squint', { look: [0.5, 0.1] }), k(lt, 0.15, 0.6)), tilt: 0.03,
  hands: [{ side: -1, hand: [-60, 30], elbow: [-120, 420], grip: 'pinch', itemOver: c => { c.save(); c.translate(36, -24); c.rotate(-0.4); R.card(c, 1.05); c.restore(); } }] }));

// D1: imagine $100 — morning street, phone balance, light from the screen
shot('D1 $100', ST.w04, at('w05', 'coffee') - 0.15, (ctx, t, lt) => bustShot(ctx, lt, c => { c.fillStyle = '#CFE3FF'; c.fillRect(0, 0, W, H); halfPass(c, 10, g => WF.streetNoon(g, { x: 0, y: -700, z: 1.1, r: 0 }, t)); }, {
  face: R.expr('smile', { look: [0.3, 0.75], blink: blink(lt, 2.4) }), tilt: 0.05,
  hands: [{ side: 1, hand: [90, 190], elbow: [200, 460], grip: 'hold', item: c => { c.save(); c.translate(10, -40); c.rotate(-0.12); WF.phone(c, (p, w, h) => WF.bankApp(p, w, h, { balance: '$100.00' }), 0.5); c.restore(); } }],
  glow: { x: 560, y: 1500, r: 700, color: 'rgb(150,175,220)', a: 0.35 } }));
// D2-D5: four purchases
const P = [at('w05', 'coffee') - 0.15, at('w05', 'lunch') - 0.15, at('w05', 'gas') - 0.15, at('w05', 'groceries') - 0.15, ST.w06];
const PRICE = [at('w05', 'five'), at('w05', 'twelve'), at('w05', 'twenty-eight'), at('w05', 'ninety')];
function tally(ctx, t) { // the day's receipts collecting in the top corner
  const items = [['COFFEE', '$5'], ['LUNCH', '$12'], ['GAS', '$28'], ['GROCERIES', '$90']];
  items.forEach(([n, a], i) => { if (t < PRICE[i]) return; const u = E.back(seg(t, PRICE[i], PRICE[i] + 0.3), 2);
    ctx.save(); ctx.translate(150 + i * 70, 470 + i * 24); ctx.rotate(-0.08 + i * 0.05); ctx.scale(0.36 * u, 0.36 * u); WF.receipt(ctx, n, a, { w: 300, h: 380 }); ctx.restore(); });
}
function priceSticker(ctx, t, i, x, y) { if (t < PRICE[i]) return; const u = E.back(seg(t, PRICE[i], PRICE[i] + 0.3), 2.6); ctx.save(); ctx.translate(x, y); ctx.scale(1.5 * u, 1.5 * u); WF.priceTag(ctx, ['$5', '$12', '$28', '$90'][i], C.yellow, INK, 1, -0.08); ctx.restore(); }
shot('D2 coffee', P[0], P[1], (ctx, t, lt) => {
  const c = cam([[0, 470, -470, 1.35, 0.01], [1.4, 450, -480, 1.5, 0.005]], lt), tl = 4.0 + lt * 0.9; // barista hands over the cup
  const reach = k(tl, 4.35, 4.8) * (1 - k(tl, 4.95, 5.3)), hw = R.toLocal(300, 0, 1, 1, [535, -440]), holds = tl >= 4.82;
  cafeMedium(ctx, tl, c, g => R.figure(g, 300, 0, 1, 1, MAYA, { farFront: 1, lean: 0.03 + 0.1 * reach,
    armF: { hand: holds ? R.mix([70, -330], hw, reach) : R.mix([-14, -74], hw, reach), grip: holds ? 'hold' : 'open', item: holds ? x => { x.save(); x.translate(-6, 56); R.cup(x, 0.75, { steam: t }); x.restore(); } : null },
    armN: { hand: [60, -240], grip: 'pinch', itemOver: x => { x.save(); x.translate(36, -16); x.rotate(0.35); R.card(x, 0.62); x.restore(); } }, face: R.expr(holds ? 'happy' : 'smile', { look: [1, 0.1] }) }));
  priceSticker(ctx, t, 0, 820, 760); tally(ctx, t); LT.grade(ctx, 'day', { vignette: 0.14 });
});
shot('D3 lunch', P[1], P[2], (ctx, t, lt) => {
  const c = cam([[0, 160, -520, 1.12, -0.01], [1.4, 140, -530, 1.24, 0]], lt), hand = k(lt, 0.1, 0.55), take = k(lt, 0.55, 0.9);
  WF.streetNoon(ctx, c, t);
  layer(ctx, c, 1, g => {
    const bagW = R.mix([150, -420], [-20, -380], take); // the bag travels from the window into her hand
    WF.foodTruck(g, t, { hip: [0, -256], lean: 0.15, armN: { hand: R.mix([60, -250], R.toLocal(380, -60, 0.95, -1, bagW), hand), grip: take < 0.5 ? 'hold' : 'open' }, armF: { hand: [120, -260], grip: 'open' }, face: R.expr('grin', { look: [0.8, 0.2] }) });
    const her = x => R.figure(x, -150, 0, 1, 1, MAYA, { lean: 0.06, armN: { hand: R.mix([40, -240], R.toLocal(-150, 0, 1, 1, bagW), Math.max(hand * 0.8, take)), grip: take > 0.4 ? 'hold' : 'open' },
      armF: { hand: [70, -300], grip: 'pinch', itemOver: y => { y.save(); y.translate(36, -16); y.rotate(0.35); R.card(y, 0.62); y.restore(); } }, farFront: 1, face: R.expr(take > 0.5 ? 'happy' : 'smile', { look: [1, -0.1] }) });
    LT.castShadow(g, her, { x: -150, floorY: 0, skew: -0.25, squash: 0.18, a: 0.35, blur: 2 }); LT.lit(g, her, { rim: { dir: [0.3, -1], color: '#FFF8E6', w: 7, a: 0.9 } });
    g.save(); g.translate(bagW[0], bagW[1] + 120); WF.paperBag(g, 0.7, 'lunch'); g.restore();
  });
  priceSticker(ctx, t, 1, 800, 700); tally(ctx, t); LT.grade(ctx, 'day', { vignette: 0.12 });
});
shot('D4 gas', P[2], P[3], (ctx, t, lt) => {
  const c = cam([[0, 40, -560, 1.05, 0.02], [1.6, 60, -540, 1.16, 0.01]], lt), amt = Math.min(28, 28 * k(lt, 0.1, 1.2, E.out));
  WF.gasStation(ctx, c, t);
  layer(ctx, c, 1, g => {
    g.save(); g.translate(560, 0); WF.pump(g, t, '$' + amt.toFixed(2)); g.restore();
    g.save(); g.translate(-330, 0); WF.car(g, t); g.restore();
    // hose from the pump to the nozzle in her hand
    const noz = [40, -440]; g.strokeStyle = INK; g.lineWidth = R.px(g, 5) * 2 + 22; g.lineCap = 'round'; g.beginPath(); g.moveTo(470, -520); g.bezierCurveTo(420, -100, 120, -120, noz[0] + 30, noz[1] + 20); g.stroke();
    g.strokeStyle = '#2B2B2B'; g.lineWidth = 22; g.stroke();
    const her = x => R.figure(x, 250, 0, 1, -1, MAYA, { lean: 0.04, armN: { hand: R.toLocal(250, 0, 1, -1, [noz[0] + 40, noz[1] + 10]), grip: 'hold', item: y => { y.save(); y.translate(-30, -30); y.rotate(-0.5); CL.cutout(y, () => rr(y, -60, -22, 120, 44, 12), '#3A3A3A', { elev: 0.5, tex: 0 }); y.restore(); } },
      armF: { hand: [-10, -80], grip: 'relax' }, face: R.expr('tired', { look: [0.5, -0.2], blink: blink(lt, 2.2) }), headTilt: 0.04 });
    LT.castShadow(g, her, { x: 250, floorY: 0, skew: -0.7, squash: 0.25, a: 0.32, blur: 3 }); LT.lit(g, her, { rim: { dir: [1, -0.4], color: '#FFD08A', w: 9, a: 1 } });
  });
  priceSticker(ctx, t, 2, 300, 760); tally(ctx, t); LT.grade(ctx, 'golden', { vignette: 0.16 });
});
shot('D5 groceries', P[3], P[4], (ctx, t, lt) => {
  const c = cam([[0, 120, -560, 1.08, -0.012], [2.2, 130, -570, 1.2, 0]], lt), lift = k(lt, 0.15, 0.7, E.out);
  WF.market(ctx, c, t);
  layer(ctx, c, 1, g => {
    R.figure(g, 640, -60, 1, -1, WF.CASHIER, { lean: 0.1, armN: { hand: [150, -280], grip: 'open' }, armF: { hand: [130, -290], grip: 'open' }, face: R.expr('smile', { look: [0.9, 0.1], blink: blink(lt, 2.8) }), noShadow: true });
    WF.checkout(g, t, t * 120);
    const bag = R.mix([300, -372], [120, -420], lift);
    const her = x => R.figure(x, -60, 0, 1, 1, MAYA, { lean: 0.05 - 0.05 * lift, farFront: 1, armF: { hand: R.toLocal(-60, 0, 1, 1, [bag[0] - 40, bag[1] - 150]), grip: 'hold' },
      armN: { hand: R.toLocal(-60, 0, 1, 1, [bag[0] + 40, bag[1] - 150]), grip: 'hold' }, face: R.expr(lift > 0.6 ? 'happy' : 'smile', { look: [0.9, 0.5] }) });
    LT.castShadow(g, her, { x: -60, floorY: 0, skew: 0.2, squash: 0.15, a: 0.25, blur: 4 }); LT.lit(g, her, { rim: { dir: [0, -1], color: '#EEF6FF', w: 6, a: 0.8 } });
    g.save(); g.translate(bag[0], bag[1]); WF.paperBag(g, 0.85); g.restore();
  });
  priceSticker(ctx, t, 3, 760, 640); tally(ctx, t); LT.grade(ctx, 'office', { vignette: 0.14 });
});
// D6: that's $35 more than you have — evening, sofa, receipts in hand
shot('D6 short', ST.w06, ST.w07 - 0.1, (ctx, t, lt) => {
  bustShot(ctx, lt, c => { c.fillStyle = '#3B3F78'; c.fillRect(0, 0, W, H); halfPass(c, 10, g => WF.livingRoom(g, { x: -400, y: -900, z: 1.15, r: 0 }, t, { bags: true })); }, {
    face: R.exprMix('neutral', R.expr('worried', { look: [0.3, 0.7] }), k(lt, 0.4, 0.9)), tilt: 0.06, ny: 1520,
    rim: { dir: [-1, -0.3], color: '#FFC27A', w: 9, a: 0.9 }, shadeCol: 'rgb(185,175,215)' });
  // the day's receipts, fanned in front of her
  ['COFFEE', 'LUNCH', 'GAS', 'GROCERIES'].forEach((n, i) => { ctx.save(); ctx.translate(700 + i * 50, 1330 - i * 10); ctx.rotate(-0.3 + i * 0.18); ctx.scale(0.5, 0.5); WF.receipt(ctx, n, ['$5', '$12', '$28', '$90'][i]); ctx.restore(); });
  R.hand(ctx, [760, 1500], -1.9, MAYA.skin, 'pinch', { size: 3 });
  // the math, once: pinned paper note
  const u = E.back(seg(t, at('w06', 'thirty-five') - 0.1, at('w06', 'thirty-five') + 0.25), 2);
  if (u > 0) { ctx.save(); ctx.translate(540, 560); ctx.rotate(-0.03); ctx.scale(u, u); CL.cutout(ctx, () => rr(ctx, -360, -95, 720, 190, 14), '#FFFDF8', { elev: 1.6 });
    txt(ctx, '$135 − $100 =', -40, 30, 66, INK); txt(ctx, '−$35', 250, 30, 76, C.red); CL.tape(ctx, -330, -90, 120, -0.4); CL.tape(ctx, 330, -90, 120, 0.4); ctx.restore(); }
  LT.grade(ctx, 'evening', { vignette: 0.2 });
});
// D7: in order -> only the last one overdraws (top-down coffee table, her pencil)
const ORDER = [['COFFEE', '$5', '$95'], ['LUNCH', '$12', '$83'], ['GAS', '$28', '$55'], ['GROCERIES', '$90', '−$35']];
shot('D7 table', ST.w07 - 0.1, ST.w08, (ctx, t, lt) => {
  ctx.fillStyle = '#8B5A3C'; ctx.fillRect(0, 0, W, H);
  const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, 'rgba(255,200,120,0.35)'); g.addColorStop(1, 'rgba(40,20,40,0.25)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(60,35,20,0.3)'; ctx.lineWidth = 6; for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.moveTo(0, 120 + i * 160); ctx.bezierCurveTo(300, 100 + i * 160, 700, 150 + i * 160, 1080, 110 + i * 160); ctx.stroke(); }
  LT.glow(ctx, 200, 300, 900, 'rgba(255,200,120,1)', 0.3);
  const z = 1 + lt * 0.02; ctx.save(); ctx.translate(540, 900); ctx.scale(z, z); ctx.translate(-540, -900);
  const tw = [at('w07', 'process'), at('w07', 'purchases'), at('w07', 'in'), at('w07', 'order')], tLast = at('w07', 'last'), tOD = at('w07', 'overdraft');
  ORDER.forEach(([n, a, b], i) => { const x = 170 + (i % 2) * 380, y = 640 + Math.floor(i / 2) * 560, u = E.out(seg(t, tw[i] - 0.15, tw[i] + 0.2));
    if (u <= 0) return; ctx.save(); ctx.translate(x + 180, y + (1 - u) * -200); ctx.rotate(-0.04 + i * 0.03); ctx.globalAlpha = u; ctx.scale(0.82, 0.82);
    WF.receipt(ctx, n, a, { stamp: i === 3 ? k(t, tOD, tOD + 0.12) : 0, w: 320, h: 400 });
    const wr = k(t, tw[i] + 0.15, tw[i] + 0.45); // pencil-written running balance under it
    if (wr > 0) { ctx.save(); ctx.beginPath(); ctx.rect(-170, 210, 340 * wr, 120); ctx.clip(); txt(ctx, b, 0, 300, 86, i === 3 ? C.red : '#2E3A59', 'center', F.xb); ctx.restore(); }
    if (i === 3 && t > tLast) { ctx.strokeStyle = C.red; ctx.lineWidth = 10; ctx.beginPath(); ctx.ellipse(0, 270, 170, 80, -0.05, 0, Math.PI * 2 * k(t, tLast, tLast + 0.5)); ctx.stroke(); }
    ctx.restore(); });
  // her hand with a pencil, following the writing
  let hi = 0; for (let i = 0; i < 4; i++) if (t > tw[i]) hi = i; const hx0 = 170 + (hi % 2) * 380 + 180 + 120 * seg(t, tw[hi] + 0.15, tw[hi] + 0.45), hy0 = 640 + Math.floor(hi / 2) * 560 + 220;
  const hp = [lerp(hx0, 900, k(t, tLast, tLast + 0.6)), lerp(hy0, 1700, k(t, tLast, tLast + 0.6))];
  ctx.save(); ctx.translate(hp[0] + 40, hp[1] + 20); ctx.rotate(-0.6); CL.cutout(ctx, () => rr(ctx, -12, -10, 24, 260, 6), C.yellow, { elev: 1.5 }); ctx.beginPath(); ctx.moveTo(-12, -10); ctx.lineTo(12, -10); ctx.lineTo(0, -46); ctx.closePath(); fillStroke(ctx, '#E9C9A0'); ctx.restore();
  R.tube(ctx, [[hp[0] + 420, hp[1] + 560], [hp[0] + 60, hp[1] + 90]], 120, C.yellow); R.hand(ctx, [hp[0] + 40, hp[1] + 60], -2.2, MAYA.skin, 'pinch', { size: 2.6 });
  ctx.restore();
  // ONE overdraft
  if (t > tOD) { const u = E.back(seg(t, tOD, tOD + 0.3), 2.4); ctx.save(); ctx.translate(540, 330); ctx.scale(u, u); CL.cutout(ctx, () => rr(ctx, -300, -70, 600, 140, 16), '#FFFDF8', { elev: 1.4 }); txt(ctx, '1 OVERDRAFT', 0, 26, 74, C.red); ctx.restore(); }
});
// D8: the bank app in the evening — the screen lights her face; push into the phone
const tTear = end('w08') + 0.1;
shot('D8 app', ST.w08, ST.w08 + 1.5, (ctx, t, lt) => bustShot(ctx, lt, c => { c.fillStyle = '#3B3F78'; c.fillRect(0, 0, W, H); halfPass(c, 10, g => WF.livingRoom(g, { x: -200, y: -900, z: 1.2, r: 0 }, t)); }, {
  face: R.exprMix(R.expr('neutral', { look: [0.1, 0.8] }), R.expr('skeptical', { look: [0.1, 0.8] }), k(lt, 0.5, 1.0)), tilt: 0.06,
  hands: [{ side: 1, hand: [80, 200], elbow: [200, 470], grip: 'hold', item: c => { c.save(); c.translate(10, -40); c.rotate(-0.1); WF.phone(c, (p, w, h) => WF.bankApp(p, w, h, { balance: '$100.00', items: [['COFFEE', '−$5'], ['LUNCH', '−$12'], ['GAS', '−$28'], ['GROCERIES', '−$90']], note: 'Posting overnight…' }), 0.5); c.restore(); } }],
  glow: { x: 700, y: 1750, r: 900, color: 'rgb(140,160,230)', a: 0.6 }, rim: { dir: [-1, -0.4], color: '#FFC27A', w: 8, a: 0.8 }, shadeCol: 'rgb(180,170,215)' }));
const SCREEN = [540, 860];
shot('D9 screen', ST.w08 + 1.5, tTear + 0.2, (ctx, t, lt) => {
  ctx.fillStyle = '#2B2E55'; ctx.fillRect(0, 0, W, H); halfPass(ctx, 14, g => WF.livingRoom(g, { x: 400, y: -500, z: 1.6, r: 0 }, t));
  const z = 2.3 + lt * 1.4; ctx.save(); ctx.translate(SCREEN[0], SCREEN[1]); ctx.scale(z, z); ctx.rotate(-0.03);
  LT.glow(ctx, 0, 0, 400, 'rgba(160,180,255,1)', 0.4);
  WF.phone(ctx, (p, w, h) => WF.bankApp(p, w, h, { balance: '$100.00', items: [['COFFEE', '−$5'], ['LUNCH', '−$12'], ['GAS', '−$28'], ['GROCERIES', '−$90']], note: 'Posting overnight…' }), 1);
  ctx.restore(); LT.grade(ctx, 'evening', { vignette: 0.25 });
}, { type: 'tear', dur: 0.62, at: () => [SCREEN[0], SCREEN[1] + 40] });

// ================= the hidden world: the paper posting machine =================
// world coords: belt y 300 from x -900 to 700; intake (machine mouth) at x 700; meter at x 1150; fee rail at y -560 over the belt
const RC = { COFFEE: '$5', LUNCH: '$12', GAS: '$28', GROCERIES: '$90' };
const NAMES = ['COFFEE', 'LUNCH', 'GAS', 'GROCERIES'], AMT = { COFFEE: 5, LUNCH: 12, GAS: 28, GROCERIES: 90 };
const BIG = ['GROCERIES', 'GAS', 'LUNCH', 'COFFEE'];
const tSort0 = ST.w09 + 0.35, tSort1 = end('w09') + 0.15;                        // the arm reorders while "biggest purchases first" is said
const STAMP = { GAS: at('w12', 'overdraft') - 0.05, LUNCH: at('w13', 'another') - 0.05, COFFEE: at('w15', 'one') + 0.02 };
// each receipt is charged under the press (slot 0), stamped if the balance goes below zero, then swallowed by the intake
const DED = { GROCERIES: at('w10', 'ninety') - 0.1, GAS: STAMP.GAS - 0.3, LUNCH: STAMP.LUNCH - 0.3, COFFEE: STAMP.COFFEE - 0.25 };
const IN = { GROCERIES: end('w11') - 0.1, GAS: STAMP.GAS + 0.35, LUNCH: STAMP.LUNCH + 0.35, COFFEE: STAMP.COFFEE + 0.45 };
function slotX(i) { return 560 - i * 360; } // queue positions on the belt (0 = next to the intake)
function receiptState(name, t) { // position of each receipt on the belt
  const iOld = 3 - NAMES.indexOf(name), iNew = BIG.indexOf(name); // before: COFFEE furthest from... purchase order: coffee first in line
  const sortU = k(t, tSort0 + iNew * 0.25, tSort0 + iNew * 0.25 + 0.6);
  let x = lerp(slotX(3 - iOld), slotX(iNew), sortU), y = 160 - Math.sin(sortU * Math.PI) * 380, r = Math.sin(sortU * Math.PI) * 0.3;
  // queue moves up as earlier ones go in; the receipt itself slides into the intake at IN[name]
  const gone = BIG.filter(n => IN[n] < t && n !== name && BIG.indexOf(n) < iNew).length;
  if (t > tSort1) { x = slotX(iNew - gone) + 0; }
  const inU = k(t, IN[name], IN[name] + 0.45, E.in);
  if (inU > 0) { x = lerp(slotX(0), 840, inU); }
  return { x, y, r, inU };
}
function balanceAt(t) { let b = 100; for (const n of BIG) { const u = k(t, DED[n], DED[n] + 0.35, E.out); b -= AMT[n] * u; } return b; }
function fees(t) { return ['GAS', 'LUNCH', 'COFFEE'].filter(n => t > STAMP[n]).length; }
function feeBin(g, x, y, hits, t, from, o = {}) { // cardboard bin + counter; tags fly from `from` into it after each hit
  const landed = hits.filter(h => t > h + 0.45).length, bump = hits.reduce((m, h) => Math.max(m, t > h + 0.45 && t < h + 0.75 ? Math.sin((t - h - 0.45) / 0.3 * Math.PI) : 0), 0);
  for (let i = 0; i < landed; i++) { g.save(); g.translate(x - 50 + i * 50, y - 40 - i * 8); g.rotate(-0.3 + i * 0.3); g.scale(0.9, 0.9); WF.feeTag(g); g.restore(); }
  g.save(); g.translate(x, y + bump * 10);
  CL.cutout(g, () => { g.beginPath(); g.moveTo(-170, -40); g.lineTo(170, -40); g.lineTo(150, 200); g.lineTo(-150, 200); g.closePath(); }, '#C9A27E', { elev: 1.6 });
  CL.cutout(g, () => rr(g, -130, 20, 260, 76, 12), '#171717', { elev: 0.4, tex: 0 }); txt(g, '$' + landed * 35, 0, 78, 62, landed ? '#FF6B75' : '#8E8E96');
  txt(g, o.label || 'BANK FEES', 0, 158, 38, '#5A3F2A'); g.restore();
  hits.forEach(h => { const u = seg(t, h + 0.05, h + 0.45); if (u <= 0 || u >= 1) return; const px = lerp(from[0], x, u), py = lerp(from[1], y - 60, u) - Math.sin(u * Math.PI) * 300;
    g.save(); g.translate(px, py); g.rotate(u * 6); g.scale(1.3 - 0.4 * u, 1.3 - 0.4 * u); WF.feeTag(g); g.restore(); });
}
function machineWorld(ctx, t, c, o = {}) {
  WF.kraft(ctx, 3);
  layer(ctx, c, 0.5, g => { CL.cutout(g, () => { g.beginPath(); g.moveTo(-2600, -3000); g.lineTo(3400, -3000); for (let x = 3400, i = 0; x >= -2600; x -= 40, i++) g.lineTo(x, -1350 + (K.hash(i) - 0.5) * 26 + Math.sin(x / 300) * 40); g.closePath(); }, '#2E3A59', { lw: 0, elev: 1.2 });
    CL.tape(g, -600, -1370, 180, 0.3); CL.tape(g, 1500, -1350, 160, -0.2);
    for (let i = 0; i < 9; i++) { g.save(); g.translate(-2000 + i * 560, -1900 + (i % 2) * 260); CL.gear(g, 150 + (i % 3) * 40, 12, t * (i % 2 ? -0.4 : 0.4), '#3E4C6E', '#4D8DFF'); g.restore(); } });
  layer(ctx, c, 0.75, g => { CL.cutout(g, () => { g.beginPath(); g.moveTo(-2600, 3000); g.lineTo(3400, 3000); for (let x = 3400, i = 0; x >= -2600; x -= 40, i++) g.lineTo(x, 900 + (K.hash(i + 99) - 0.5) * 26 + Math.sin(x / 260) * 30); g.closePath(); }, C.yellow, { lw: 0, elev: 1.4 }); });
  layer(ctx, c, 1, g => {
    LT.glow(g, 200, -600, 1500, 'rgba(255,240,205,1)', 0.22);
    // the bank's fee bin: every OVERDRAFT hit kicks a $35 tag out of her account into it (counter = what the bank collected)
    feeBin(g, 300, -470, ['GAS', 'LUNCH', 'COFFEE'].map(n => STAMP[n]), t, [slotX(0), 200]);
    // machine body with the intake mouth + BIGGEST FIRST sign
    g.save(); g.translate(700, 0);
    CL.cutout(g, () => { g.beginPath(); g.moveTo(0, -520); g.lineTo(380, -560); g.lineTo(400, 470); g.lineTo(-10, 470); g.closePath(); }, '#C9A27E', { elev: 1.8 });
    CL.cutout(g, () => rr(g, -20, 120, 120, 200, 12), '#171717', { elev: 0.3, tex: 0 });
    g.save(); g.translate(230, -260); CL.gear(g, 120, 11, t * (0.6 + 2 * k(t, tSort1, tSort1 + 0.3)), C.red); g.restore();
    g.save(); g.translate(190, 120); CL.gear(g, 80, 9, -t * 1.5, '#4D8DFF'); g.restore();
    const signU = E.back(seg(t, at('w09', 'biggest') - 0.1, at('w09', 'biggest') + 0.3), 2);
    if (signU > 0) { g.save(); g.translate(150, -700 + (1 - signU) * -300); g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(-120, -110); g.lineTo(-120, -300); g.moveTo(120, -110); g.lineTo(120, -300); g.stroke();
      CL.cutout(g, () => rr(g, -260, -120, 520, 150, 14), C.red, { elev: 1.4 }); txt(g, 'BIGGEST FIRST', 0, -22, 66, '#FFFDF8'); g.restore(); }
    g.restore();
    // belt + receipts; the head of the queue (next into the machine) is marked
    WF.belt(g, -950, 760, 300, t, t > tSort1 ? 1 : 0);
    g.save(); g.translate(slotX(0), 10); CL.cutout(g, () => rr(g, -120, -40, 240, 80, 12), '#171717', { elev: 0.6, tex: 0 }); txt(g, 'NEXT ▶', 0, 16, 44, C.yellow); g.restore();
    NAMES.forEach(n => { const s = receiptState(n, t); if (s.inU >= 1) return; g.save(); g.translate(s.x, s.y + 100); g.rotate(s.r); g.scale(0.9, 0.9);
      WF.receipt(g, n, RC[n], { stamp: STAMP[n] ? k(t, STAMP[n], STAMP[n] + 0.1) : 0, red: n !== 'GROCERIES' && t > STAMP[n] }); g.restore(); });
    // the robot arm (sorting, then idle above the belt)
    const tgtName = BIG.find((n, i) => t < tSort0 + i * 0.25 + 0.6) || null, s = tgtName ? receiptState(tgtName, t) : { x: 300, y: -200 };
    WF.arm(g, -700, -1150, s.x, (tgtName ? s.y - 110 : -260) + Math.sin(t * 2) * 10, tgtName ? 0.1 : 0.5);
    // the OVERDRAFT stamp press above the queue head
    const hits = ['GAS', 'LUNCH', 'COFFEE'].map(n => STAMP[n]); let down = 0; for (const h of hits) down = Math.max(down, t < h ? E.in(seg(t, h - 0.14, h)) : 1 - E.out(seg(t, h + 0.08, h + 0.32)));
    g.save(); g.lineWidth = R.px(g, 9); g.strokeStyle = INK; g.beginPath(); g.moveTo(slotX(0), -760); g.lineTo(slotX(0), lerp(-420, -110, down)); g.stroke(); g.restore();
    g.save(); g.translate(slotX(0), lerp(-230, 90, down)); g.scale(1.3, 1.3); CL.stamp(g); g.restore();
    // the balance meter
    g.save(); g.translate(1150, 280); g.scale(0.85, 0.85); WF.meter(g, balanceAt(t), t); g.restore();
  });
}
const MC = (t) => { // machine camera: wide for the sort, then close on the action
  const keys = [[0, 150, -300, 0.72, 0], [1.2, 150, -320, 0.76, 0]];
  return keys;
};
shot('M1 sort', tTear + 0.2, ST.w10, (ctx, t, lt) => { const c = cam([[0, 140, -80, 0.74, 0.01], [2.6, 220, -60, 0.8, 0]], lt); c.y += shake(t, tSort1, 8); machineWorld(ctx, t, c); histStamp(ctx, 1, 150); });
shot('M2 groceries', ST.w10, ST.w12 - 0.05, (ctx, t, lt) => { const c = cam([[0, 820, -60, 0.95, -0.01], [2.6, 880, -40, 1.05, 0]], lt); machineWorld(ctx, t, c); histStamp(ctx, 1, 150); });
shot('M3 gas', ST.w12 - 0.05, ST.w13 - 0.05, (ctx, t, lt) => { const c = cam([[0, 740, -140, 0.9, 0.01], [1.5, 760, -130, 0.96, 0]], lt); c.y += shake(t, STAMP.GAS, 18); machineWorld(ctx, t, c); histStamp(ctx, 1, 150); });
shot('M4 lunch', ST.w13 - 0.05, ST.w14 - 0.05, (ctx, t, lt) => { const c = cam([[0, 780, -150, 0.9, -0.01], [1.6, 740, -150, 0.96, 0]], lt); c.y += shake(t, STAMP.LUNCH, 18); machineWorld(ctx, t, c); histStamp(ctx, 1, 150); });
shot('M5 coffee?', ST.w14 - 0.05, ST.w15 - 0.05, (ctx, t, lt) => { const c = cam([[0, 560, 200, 1.6, 0.02], [1.7, 560, 220, 1.95, 0.03]], lt); c.x += Math.sin(t * 40) * 3; machineWorld(ctx, t, c); histStamp(ctx, 1, 150); });
shot('M6 one more', ST.w15 - 0.05, end('w15') + 0.12, (ctx, t, lt) => { const c = cam([[0, 760, -220, 0.86, 0], [1.1, 760, -230, 0.9, 0]], lt); c.y += shake(t, STAMP.COFFEE, 26); machineWorld(ctx, t, c); histStamp(ctx, 1, 150); });

// ---------- the comparison, physical: two machines run the same four receipts ----------
// lane 0 = in order (one hit, on the groceries), lane 1 = biggest first (three hits). Each lane: queue -> press -> out; balance window; fee bin.
const tThree = at('w17', 'three'), tOne = at('w17', 'one');
const LN = [
  { y: 690, label: 'NORMAL ORDER', col: '#2FA37E', order: NAMES, pass: [ST.w17 - 0.15, ST.w17 + 0.15, ST.w17 + 0.45, tOne], hit: { GROCERIES: tOne } },
  { y: 1240, label: 'BIGGEST FIRST', col: C.red, order: BIG, pass: [ST.w17 + 0.02, tThree, at('w17', 'overdraft'), at('w17', 'fees')], hit: { GAS: tThree, LUNCH: at('w17', 'overdraft'), COFFEE: at('w17', 'fees') } },
];
const PX = 330; // press position (queue to its right, so the line reads left to right in processing order)
function laneBalance(L, t) { let b = 100; L.order.forEach((n, i) => { if (t > L.pass[i]) b -= AMT[n]; }); return b; }
function lanes(ctx, t, cz) {
  WF.kraft(ctx, 5);
  ctx.save(); ctx.translate(540, 960); ctx.scale(cz.z, cz.z); ctx.translate(-cz.x, -cz.y + shake(t, tThree, 6) + shake(t, at('w17', 'overdraft'), 6) + shake(t, at('w17', 'fees'), 8));
  LT.glow(ctx, 300, 300, 1100, 'rgba(255,240,205,1)', 0.25);
  LN.forEach((L, li) => {
    const inU = E.out(seg(t, ST.w17 - 0.45 + li * 0.1, ST.w17 - 0.1 + li * 0.1)), y = L.y; ctx.save(); ctx.translate((1 - inU) * (li ? 1300 : -1300), 0);
    CL.cutout(ctx, () => rr(ctx, 30, y - 340, 1020, 480, 24), li ? '#F6D9DB' : '#DCEBDD', { elev: 1.4 });
    // title (centre-right), fee counter (top-left), balance (top-right)
    ctx.save(); ctx.translate(660, y - 285); ctx.font = `46px ${F.black}`; const lw = ctx.measureText(L.label).width + 40; CL.cutout(ctx, () => rr(ctx, -lw / 2, -40, lw, 70, 10), L.col, { elev: 0.6 }); txt(ctx, L.label, 0, 12, 46, '#FFFDF8'); ctx.restore();
    const hits = Object.values(L.hit), landed = hits.filter(h => t > h + 0.4).length, bump = hits.reduce((m, h) => Math.max(m, t > h + 0.4 && t < h + 0.7 ? Math.sin((t - h - 0.4) / 0.3 * Math.PI) : 0), 0);
    ctx.save(); ctx.translate(165, y - 280); ctx.scale(1 + bump * 0.15, 1 + bump * 0.15); CL.cutout(ctx, () => rr(ctx, -120, -46, 240, 92, 12), '#171717', { elev: 0.6, tex: 0 });
    txt(ctx, 'FEES', 0, -14, 24, '#8E8E96'); txt(ctx, '$' + landed * 35, 0, 34, 50, landed ? '#FF6B75' : '#8E8E96'); ctx.restore();
    const b = laneBalance(L, t); ctx.save(); ctx.translate(890, y - 170); CL.cutout(ctx, () => rr(ctx, -110, -46, 220, 92, 12), '#171717', { elev: 0.5, tex: 0 });
    txt(ctx, 'BALANCE', 0, -14, 24, '#8E8E96'); txt(ctx, (b < 0 ? '−$' : '$') + Math.abs(b), 0, 34, 50, b < 0 ? '#FF6B75' : '#7CFFB5'); ctx.restore();
    WF.belt(ctx, 60, 1010, y + 50, t, 1);
    // receipts: first in line on the left; they ride left through the press and drop off the end
    L.order.forEach((n, i) => { const x = Math.min(PX + 60 + (i + 1) * 165, PX - (t - L.pass[i]) * 700);
      if (x < -60) return; const hitT = L.hit[n], st = hitT ? k(t, hitT, hitT + 0.08) : 0, off = x < 120 ? (120 - x) : 0;
      ctx.save(); ctx.translate(Math.max(x, 80), y - 30 + off * 0.8); ctx.rotate(-off * 0.004); ctx.scale(0.52, 0.52);
      WF.receipt(ctx, n, RC[n], { stamp: st, red: st > 0.5 }); ctx.restore(); });
    // the press
    let down = 0; for (const h of hits) down = Math.max(down, t < h ? E.in(seg(t, h - 0.12, h)) : 1 - E.out(seg(t, h + 0.06, h + 0.26)));
    ctx.save(); ctx.lineWidth = R.px(ctx, 8); ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(PX, y - 340); ctx.lineTo(PX, lerp(y - 230, y - 140, down)); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.translate(PX, lerp(y - 150, y - 40, down)); ctx.scale(0.8, 0.8); CL.stamp(ctx); ctx.restore();
    // each hit kicks a $35 tag out of the account into the fee counter
    hits.forEach(h => { const u = seg(t, h + 0.04, h + 0.4); if (u <= 0 || u >= 1) return; ctx.save(); ctx.translate(lerp(PX, 165, u), lerp(y - 40, y - 280, u) - Math.sin(u * Math.PI) * 160);
      ctx.rotate(u * 5); ctx.scale(1.2 - 0.5 * u, 1.2 - 0.5 * u); WF.feeTag(ctx); ctx.restore(); });
    ctx.restore();
  });
  ctx.restore();
  histStamp(ctx, 1, 150);
}
shot('M7a same', end('w15') + 0.12, tThree - 0.12, (ctx, t, lt) => lanes(ctx, t, { x: 540, y: 1000, z: 0.98 + lt * 0.03 }));
shot('M7b three', tThree - 0.12, tOne - 0.15, (ctx, t, lt) => lanes(ctx, t, { x: 470, y: 1180, z: 1.42 + lt * 0.05 }));
shot('M7c one', tOne - 0.15, ST.w18 - 0.05, (ctx, t, lt) => lanes(ctx, t, { x: 470, y: 600, z: 1.42 + lt * 0.05 }));
// M7d: the totals are what the bins collected: $35 vs $105 (the bottom bin counts up with the words)
shot('M7d totals', ST.w18 - 0.05, ST.w20 - 0.1, (ctx, t, lt) => {
  lanes(ctx, t, { x: 560, y: 1000, z: 1.0 + lt * 0.02 });
  const tf = [at('w18', 'thirty-five'), at('w18', 'hundred') - 0.25, at('w18', 'five') - 0.05];
  [[640, 'NORMAL ORDER', '#FFFDF8', INK, 1], [1230, 'BIGGEST FIRST', C.red, '#FFFDF8', 3]].forEach(([y, lab, bg, fg, n], ri) => {
    const shown = ri ? tf.filter(x => t > x).length : (t > tf[0] ? 1 : 0); if (!shown) return; const u = E.back(seg(t, tf[0] + ri * 0.1, tf[0] + ri * 0.1 + 0.3), 2.2);
    ctx.save(); ctx.translate(540, y + (ri ? 30 : 0)); ctx.scale(u, u); const s = `${lab}: $${shown * 35} IN FEES`; ctx.font = `54px ${F.black}`; const w = Math.min(980, ctx.measureText(s).width + 60);
    CL.cutout(ctx, () => rr(ctx, -w / 2, -60, w, 110, 16), bg, { elev: 2 }); fitTxt(ctx, s, 0, 18, 54, fg, w - 50); ctx.restore(); });
});
shot('M9 forty', ST.w20 - 0.1, ST.w21b - 0.05, (ctx, t, lt) => {
  WF.kraft(ctx, 9); const tB = at('w20', 'becomes'), tF2 = at('w20', 'forty');
  LT.glow(ctx, 540, 900, 900, 'rgba(255,230,180,1)', 0.3);
  ctx.save(); ctx.translate(540, 1080 + shake(t, tF2, 14)); const z = 1.05 + lt * 0.05; ctx.scale(z, z);
  K.contact(ctx, 0, 300, 300, 50, 0.45); ctx.save(); ctx.translate(0, 300); ctx.scale(3.6, 3.6); R.cup(ctx, 1, { steam: t }); ctx.restore();
  // the arm swings the coffee's $35 fee tag onto the $5 price tag; they fuse into $40
  const m = k(t, ST.w20 - 0.05, tF2 - 0.05), flip = t > tF2;
  if (!flip) { ctx.save(); ctx.translate(-150, -520); ctx.scale(1.7, 1.7); WF.priceTag(ctx, '$5', '#FFFDF8', INK, 1, -0.1); ctx.restore();
    const tg = [lerp(520, 160, m), lerp(-1100, -520, m)]; WF.arm(ctx, 700, -1700, tg[0], tg[1] - 120, 0.1);
    ctx.save(); ctx.translate(tg[0], tg[1]); ctx.scale(1.7, 1.7); WF.feeTag(ctx, 1, 0.1); ctx.restore(); }
  else { const u = E.back(seg(t, tF2, tF2 + 0.35), 2.8); WF.arm(ctx, 700, -1700, 300, -900, 0.6); ctx.save(); ctx.translate(0, -540); ctx.scale(2.4 * u, 2.4 * u); WF.priceTag(ctx, '$40', C.red, '#FFFDF8'); ctx.restore(); }
  ctx.restore(); histStamp(ctx, 1, 160);
});

// ================= proof: two action shots =================
// C1: a customer in the case: $120 over -> buried in fees (fee tags without amounts: real fees varied; the $506 total is from the opinion)
const CUST2 = { skin: '#C68642', hair: '#1E1612', hairStyle: 'bun', top: '#4D8DFF', pants: '#2E3A59', shoes: '#3A2A22', iris: '#3A2414', lashes: 1, lips: '#8E3B3B', collar: '#FFFDF8' };
const tOver = at('w21b', 'over…'), tSix = at('w21b', 'five');
shot('C1 customer', ST.w21b - 0.05, ST.w22b - 0.05, (ctx, t, lt) => {
  ctx.fillStyle = '#3B3F78'; ctx.fillRect(0, 0, W, H); halfPass(ctx, 11, g => WF.livingRoom(g, { x: 300, y: -800, z: 1.25, r: 0 }, t));
  LT.glow(ctx, 900, 500, 700, 'rgba(255,200,130,1)', 0.35);
  const push = 1 + lt * 0.04, sh = shake(t, tSix, 10); ctx.save(); ctx.translate(540 + sh, 1560); ctx.scale(push, push); ctx.translate(-540, -1560);
  const face = R.exprMix(R.expr('neutral', { look: [0.3, -0.8] }), R.expr(t > tSix ? 'shocked' : 'worried', { look: [0.3, -0.85] }), k(t, tOver - 0.2, tOver + 0.2));
  LT.lit(ctx, c => R.bust(c, 540, 1600, 2.3, CUST2, { face, headTilt: -0.06 }), { rim: { dir: [1, -0.3], color: '#FFC27A', w: 9, a: 0.9 }, tint: { x0: 540, y0: 0, x1: 0, y1: 0, color: 'rgb(190,180,220)', a: 1 } });
  ctx.restore();
  // her statement drops in above her; she looks up at it
  const dIn = E.out(seg(t, ST.w21b - 0.05, ST.w21b + 0.4));
  ctx.save(); ctx.translate(560, lerp(-300, 640, dIn)); ctx.rotate(-0.05 + (1 - dIn) * 0.4); CL.cutout(ctx, () => rr(ctx, -330, -200, 660, 400, 10), '#FFFDF8', { elev: 2.4 });
  txt(ctx, 'ACCOUNT STATEMENT', 0, -120, 42, '#5A5450'); ctx.fillStyle = 'rgba(90,84,80,0.3)'; for (let i = 0; i < 2; i++) ctx.fillRect(-270, -85 + i * 32, 540, 12);
  if (t > tOver - 0.1) { const u = E.back(seg(t, tOver - 0.1, tOver + 0.2), 2.2); ctx.save(); ctx.translate(0, 60); ctx.scale(u, u); txt(ctx, 'OVER BY $120', 0, 26, 84, C.red); ctx.restore(); }
  CL.tape(ctx, -300, -190, 130, -0.5); CL.tape(ctx, 300, -190, 130, 0.5); ctx.restore();
  // fee slips pour in front of her and pile up
  const u2 = seg(t, tSix - 0.9, tSix + 0.5);
  for (let i = 0; i < 26; i++) { const d = clamp((u2 * 26 - i) / 4); if (d <= 0) continue; const side = i % 2 ? 1 : -1, x = 540 + side * (230 + K.hash(i) * 260), yEnd = 1820 - Math.floor(i / 4) * 70 - K.hash(i + 3) * 40, y = lerp(-200, yEnd, E.in(d));
    ctx.save(); ctx.translate(x, y); ctx.rotate((K.hash(i + 9) - 0.5) * 1.2 + (1 - d) * 3); ctx.scale(1.15, 1.15); WF.priceTag(ctx, 'FEE', C.red, '#FFFDF8'); ctx.restore(); }
  if (t > tSix + 0.2) { const u = seg(t, tSix + 0.2, tSix + 0.35), sc = 1 + (1 - E.out(u)) * 0.7; ctx.save(); ctx.translate(560, 900); ctx.rotate(-0.08); ctx.scale(sc, sc); ctx.globalAlpha = Math.min(1, u * 3);
    CL.cutout(ctx, () => rr(ctx, -330, -95, 660, 180, 20), C.red, { elev: 2.6 }); txt(ctx, '$506 IN FEES', 0, 30, 92, '#FFFDF8'); ctx.restore(); }
  ctx.save(); ctx.translate(W / 2, 160); ctx.font = `30px ${F.black}`; const s = 'FROM THE COURT RECORD · GUTIERREZ v. WELLS FARGO', w = ctx.measureText(s).width + 50;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -30, w, 58, 10), '#171717', { elev: 0.8, tex: 0 }); txt(ctx, s, 0, 11, 30, C.yellow); ctx.restore();
  LT.grade(ctx, 'evening', { vignette: 0.22 });
});
// C2: "after years of appeals" — the paperwork storms past; the gavel comes down on the $203 million
const tUp = at('w22b', 'upheld'), tMil = at('w22b', 'two-hundred-and-three-million-dollar');
shot('C2 upheld', ST.w22b - 0.05, ST.w23 - 0.05, (ctx, t, lt) => {
  ctx.fillStyle = '#2B2232'; ctx.fillRect(0, 0, W, H);
  const g0 = ctx.createRadialGradient(540, 1000, 50, 540, 1000, 1100); g0.addColorStop(0, 'rgba(255,214,150,0.55)'); g0.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g0; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.5; ctx.fillStyle = CL.texPattern(ctx); ctx.fillRect(0, 0, W, H); ctx.restore();
  const z = 1 + lt * 0.035; ctx.save(); ctx.translate(540, 1000); ctx.scale(z, z); ctx.translate(-540, -1000 + shake(t, tUp, 16));
  // the money: a tall stack of paper bills drops in on "$203 million"
  const d = E.out(seg(t, tMil - 0.1, tMil + 0.35));
  if (d > 0) { ctx.save(); ctx.translate(540, lerp(-400, 1250, d)); for (let i = 0; i < 9; i++) { ctx.save(); ctx.translate(Math.sin(i * 1.7) * 14, -i * 62); ctx.rotate(Math.sin(i * 2.3) * 0.04); CL.bill(ctx, 1.25, { elev: 1.2 }); ctx.restore(); }
    ctx.translate(0, -640); CL.cutout(ctx, () => rr(ctx, -310, -80, 620, 150, 16), C.yellow, { elev: 2 }); txt(ctx, '$203 MILLION', 0, 26, 86, INK); ctx.restore(); }
  // the gavel
  const tap = t < tUp ? E.in(seg(t, tUp - 0.25, tUp)) : 1 - E.out(seg(t, tUp + 0.05, tUp + 0.4));
  ctx.save(); ctx.translate(930, 420); ctx.rotate(-0.9 + tap * 0.75); CL.cutout(ctx, () => rr(ctx, -22, -10, 44, 420, 16), '#8B5A3C', { elev: 2 }); CL.cutout(ctx, () => rr(ctx, -140, -70, 280, 140, 36), '#6E4630', { elev: 2 }); ctx.restore();
  if (t > tUp) { const u = seg(t, tUp, tUp + 0.15), sc = 1 + (1 - E.out(u)) * 0.8; ctx.save(); ctx.translate(540, 1080); ctx.rotate(-0.1); ctx.scale(sc, sc); ctx.globalAlpha = Math.min(1, u * 3);
    CL.cutout(ctx, () => rr(ctx, -390, -85, 780, 170, 22), '#FFFDF8', { elev: 2 }); ctx.strokeStyle = C.red; ctx.lineWidth = 14; rr(ctx, -380, -76, 760, 152, 20); ctx.stroke(); txt(ctx, 'RESTITUTION · UPHELD', 0, 24, 66, C.red); ctx.restore(); }
  ctx.restore();
  // appeal papers storming past the lens (front layer, blurred, fast) during "after years of appeals"
  const st = seg(t, ST.w22b - 0.1, tMil + 0.2);
  if (st > 0 && st < 1) halfPass(ctx, 3, g => { for (let i = 0; i < 12; i++) { const ph = (st * 1.6 + K.hash(i)) % 1.3, x = lerp(1400, -400, ph), y = 200 + K.hash(i + 5) * 1500;
    g.save(); g.translate(x, y); g.rotate(ph * 4 + i); const sc2 = 0.8 + K.hash(i + 2) * 0.8; g.scale(sc2, sc2); CL.cutout(g, () => rr(g, -170, -220, 340, 440, 6), '#FFFDF8', { elev: 2 });
    g.fillStyle = 'rgba(90,84,80,0.4)'; for (let j = 0; j < 6; j++) g.fillRect(-130, -170 + j * 50, 260, 14); g.strokeStyle = C.red; g.lineWidth = 8; rr(g, -110, 80, 220, 80, 10); g.stroke(); txt(g, 'APPEAL', 0, 140, 46, C.red); g.restore(); } });
});
// P3: the old system — a paper sheet drops over the machine
shot('P3 old system', ST.w23 - 0.05, ST.w24 - 0.05, (ctx, t, lt) => {
  const c = cam([[0, 300, -300, 0.7, 0], [2.4, 300, -320, 0.66, 0]], lt); machineWorld(ctx, 30, c);
  const d = k(t, at('w23', 'old') - 0.3, at('w23', 'system'), E.in);
  ctx.save(); ctx.translate(0, lerp(-1950, 0, d)); CL.cutout(ctx, () => { ctx.beginPath(); ctx.moveTo(-40, -40); ctx.lineTo(1120, -40); ctx.lineTo(1120, 1500); for (let x = 1120, i = 0; x >= -40; x -= 40, i++) ctx.lineTo(x, 1500 + (K.hash(i + 5) - 0.5) * 30); ctx.closePath(); }, '#EDE3D0', { elev: 2.2 });
  CL.tape(ctx, 140, 0, 220, -0.3); CL.tape(ctx, 940, 0, 220, 0.3);
  if (d > 0.9) { const u = E.back(seg(t, at('w23', 'system'), at('w23', 'system') + 0.3), 2.2); ctx.save(); ctx.translate(540, 800); ctx.rotate(-0.06); ctx.scale(u, u);
    ctx.strokeStyle = C.red; ctx.lineWidth = 12; rr(ctx, -380, -120, 760, 240, 20); ctx.stroke(); txt(ctx, 'OLD SYSTEM', 0, 0, 100, C.red); txt(ctx, 'CALIFORNIA · 2000s', 0, 70, 44, C.red); ctx.restore(); }
  ctx.restore();
});

// ================= finale: back at the cafe =================
shot('F1 still $5', ST.w24 - 0.05, ST.w25 - 0.05, (ctx, t, lt) => bustShot(ctx, lt, c => cafeBack(c, 6.2, { x: -700, y: -980, z: 1.25 }, 11), {
  face: R.expr('smile', { look: [0.2, 0.6], blink: blink(lt, 1.6) }), tilt: -0.03,
  hands: [{ side: 1, hand: [70, 100], elbow: [170, 430], grip: 'hold', item: c => { c.save(); c.translate(-4, 62); R.cup(c, 1.0, { steam: t }); c.restore();
    c.save(); c.translate(120, -40); c.rotate(0.1); c.scale(0.9, 0.9); WF.priceTag(c, '$5'); c.restore(); } }] }));
const tExp = at('w25', 'expensive'), tOrder = at('w25', 'order');
shot('F2 the order', ST.w25 - 0.05, T + 0.01, (ctx, t, lt) => {
  // counter close-up: her cup, the day's receipts; a paper machine arm reaches in from above, puts the big one first, a $35 tag lands by the cup
  cafeBack(ctx, 6.4, { x: 640, y: -560, z: 1.6 }, 9);
  const z = 1 + lt * 0.03; ctx.save(); ctx.translate(540, 960); ctx.scale(z, z); ctx.translate(-540, -960);
  CL.cutout(ctx, () => rr(ctx, -100, 1110, 1280, 900, 0), '#9C6B45', { elev: 0.5, tex: 0.3 }); ctx.fillStyle = '#B98457'; ctx.fillRect(-100, 1110, 1280, 18);
  // the receipts on the counter: reorder biggest first
  const sw = k(t, tOrder - 0.35, tOrder + 0.35);
  const posOld = i => [330 + i * 210, 1310], order = ['COFFEE', 'LUNCH', 'GAS', 'GROCERIES'];
  order.forEach((n, i) => { const iNew = BIG.indexOf(n), a = posOld(i), b = posOld(iNew), lift = Math.sin(sw * Math.PI) * (n === 'GROCERIES' ? 160 : 0);
    ctx.save(); ctx.translate(lerp(a[0], b[0], sw), lerp(a[1], b[1], sw) - lift); ctx.rotate((i - 1.5) * 0.04); ctx.scale(0.5, 0.5); WF.receipt(ctx, n, RC[n], { stamp: n !== 'GROCERIES' && t > tExp ? 1 : 0, red: n !== 'GROCERIES' && t > tExp }); ctx.restore(); });
  // the paper arm (from the hidden world) reaching into the real scene
  const g0 = posOld(3), g1 = posOld(0), armT = sw < 1 ? [lerp(g0[0], g1[0], sw), lerp(g0[1], g1[1], sw) - 150 - Math.sin(sw * Math.PI) * 160] : [lerp(g1[0], 860, k(t, tOrder + 0.4, tExp)), lerp(g1[1] - 150, 760, k(t, tOrder + 0.4, tExp))];
  WF.arm(ctx, 1100, -500, armT[0], armT[1], sw > 0 && sw < 1 ? 0.1 : 0.6);
  // her cup + the $35 tag dropped next to it
  K.contact(ctx, 560, 1120, 200, 40, 0.4); ctx.save(); ctx.translate(560, 1120); ctx.scale(2.6, 2.6); R.cup(ctx, 1, { steam: t }); ctx.restore();
  ctx.save(); ctx.translate(520, 640); ctx.scale(1.5, 1.5); WF.priceTag(ctx, '$5', '#FFFDF8', INK, 1, -0.1); ctx.restore();
  const drop = E.out(seg(t, tExp - 0.25, tExp + 0.1)); if (drop > 0) { ctx.save(); ctx.translate(lerp(900, 790, drop), lerp(560, 800, drop) + shake(t, tExp + 0.1, 8)); ctx.scale(1.7, 1.7); WF.feeTag(ctx, 1, 0.12); ctx.restore(); }
  ctx.restore();
  // her deadpan look at us, small inset bottom-left would clutter: instead her face peeks in from the left edge
  const peek = k(t, ST.w25 + 0.2, ST.w25 + 0.7);
  ctx.save(); ctx.translate(-330 + 200 * peek, 40);
  LT.lit(ctx, c => R.bust(c, 230, 1110, 2.0, MAYA, { face: R.expr('skeptical', { look: [0.9, 0.1], turn: 0.3 }) }), { rim: DAY_RIM });
  ctx.restore();
  LT.grade(ctx, 'day', { vignette: 0.2 });
  if (t > T - 0.25) { ctx.fillStyle = `rgba(23,23,23,${seg(t, T - 0.25, T) * 0})`; ctx.fillRect(0, 0, W, H); }
});

// ---------- edit, global overlays, subtitles ----------
S.sort((a, b) => a.t0 - b.t0);
const ED = makeEdit(S, W, H);
const SPLIT = { w01: [3, 5], w02: [5], w03: [4], w04: [6], w05: [5, 3, 3, 4], w06: [4, 3], w07: [5, 8], w08: [4, 4], w09: [6], w10: [3], w11: [3], w12: [2], w13: [2], w14: [4], w15: [2],
  w17: [7], w18: [5, 8], w20: [3], w21b: [5, 6, 7], w22b: [4, 6], w23: [6], w24: [6], w25: [8] };
const REPL = [[/five-dollar coffee/i, '$5 coffee'], [/costing forty/i, 'costing $40'], [/a hundred dollars/i, '$100'], [/coffee for five/i, 'coffee for $5'], [/lunch for twelve/i, 'lunch for $12'],
  [/gas for twenty-eight/i, 'gas for $28'], [/groceries for ninety/i, 'groceries for $90'], [/thirty-five dollars/i, '$35'], [/ninety dollars/i, '$90'], [/Ten dollars/i, '$10'], [/THREE/, 'THREE'],
  [/a hundred and five dollars/i, '$105'], [/thirty-five-dollar fee/i, '$35 fee'], [/Five becomes forty/i, '$5 becomes $40'], [/a hundred and twenty dollars/i, '$120'], [/five hundred and six dollars/i, '$506'],
  [/a two-hundred-and-three-million-dollar/i, 'a $203 million'], [/five dollars/i, '$5'], [/over…/, 'over…']];
function subs() {
  const G = [];
  Object.keys(ST).forEach(id => { const ws = V.words(id); let k0 = 0; SPLIT[id].forEach(n => { G.push({ id, words: ws.slice(k0, k0 + n) }); k0 += n; }); if (k0 !== ws.length) throw new Error(`subtitle split ${id}: ${k0} vs ${ws.length}`); });
  G.forEach((g, i) => { const nx = G[i + 1], e0 = Math.min(g.words[g.words.length - 1].t1, end(g.id)) + 0.4; g.t0 = g.words[0].t0 - 0.05;
    g.t1 = nx ? (nx.id === g.id ? nx.words[0].t0 - 0.05 : Math.min(e0, nx.words[0].t0 - 0.05)) : T;
    let s = g.words.map(x => x.w).join(' ').replace(' —', ''); for (const [a, b] of REPL) s = s.replace(a, b); g.text = s.replace(/^—\s*/, ''); });
  return G.filter(g => g.text.trim() && g.text.trim() !== '—');
}
const SUBS = subs();
const TEX = K.paperTexture(W, H);
function frame(ctx, t) {
  ED.frame(ctx, t);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (t < end('w03') + 0.2) { headline(ctx, t); histStamp(ctx, 1, 268); }
  else if (t < ST.w08) histStamp(ctx, 1, 230);
  ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.28; ctx.drawImage(TEX, 0, 0); ctx.restore();
  EN.drawSubtitles(ctx, t, SUBS, { y: 1565, size: 62, maxW: 820, x: 540, highlight: ['$5', '$40', '$100', 'three', '$35', '$105', '$506', '$203', 'overdraft.', 'biggest', 'order'] });
}

// ---------- sound cues (for mix.py) ----------
function cues() {
  const c = [['pop', 0.05, 0.6], ['tag', tF, 0.9], ['slam', tF + 0.02, 0.5], ['whoosh', tF + 0.4, 0.4], ['cut', ST.w02, 0.4], ['cut', ST.w03, 0.4], ['blip', ST.w04 + 0.3, 0.6]];
  P.slice(0, 4).forEach((p, i) => c.push(['cut', p, 0.45], ['blip', PRICE[i] - 0.05, 0.45], ['tag', PRICE[i], 0.7], ['paper', PRICE[i] + 0.1, 0.5]));
  c.push(['cut', ST.w06, 0.4], ['tag', at('w06', 'thirty-five'), 0.6], ['paper', ST.w07, 0.5]);
  [at('w07', 'process'), at('w07', 'purchases'), at('w07', 'in'), at('w07', 'order')].forEach(x => c.push(['paper', x, 0.5], ['scratch', x + 0.15, 0.6]));
  c.push(['stamp', at('w07', 'overdraft'), 0.6], ['blip', ST.w08 + 0.2, 0.5], ['rise', tTear - 0.3, 0.5], ['tear', tTear - 0.1, 0.9]);
  c.push(['rumble', tSort0, 0.5], ['whoosh', tSort0 + 0.2, 0.4], ['whoosh', tSort0 + 0.7, 0.4], ['slam', at('w09', 'biggest'), 0.5], ['thump', tSort1, 0.4]);
  for (const n of BIG) c.push(['whoosh', IN[n], 0.35], ['fall', IN[n] + 0.3, n === 'GROCERIES' ? 0.6 : 0.3]);
  for (const n of ['GAS', 'LUNCH', 'COFFEE']) c.push(['stamp', STAMP[n], 0.9], ['slam', STAMP[n] + 0.01, 0.6], ['tag', STAMP[n] + 0.15, 0.7]);
  c.push(['tick', ST.w14 + 0.3, 0.5], ['tick', ST.w14 + 0.6, 0.5], ['tick', ST.w14 + 0.9, 0.5]);
  for (const n of ['GAS', 'LUNCH', 'COFFEE']) c.push(['whoosh', STAMP[n] + 0.1, 0.25], ['clink', STAMP[n] + 0.48, 0.8]);
  c.push(['cut', ST.w17 - 0.05, 0.4], ['rumble', ST.w17 - 0.4, 0.4], ['whoosh', ST.w17 - 0.4, 0.4]);
  LN.forEach(L => L.pass.forEach(p => c.push(['tick', p, 0.4])));
  LN.forEach(L => Object.values(L.hit).forEach(h => c.push(['stamp', h, 0.85], ['slam', h + 0.01, 0.5], ['clink', h + 0.48, 0.8])));
  c.push(['cut', ST.w18, 0.3], ['tag', at('w18', 'thirty-five'), 0.6], ['tag', at('w18', 'hundred') - 0.25, 0.6], ['kaching', at('w18', 'five'), 0.45]);
  c.push(['whoosh', ST.w20 - 0.05, 0.4], ['snap', at('w20', 'becomes'), 0.6], ['slam', at('w20', 'forty'), 0.8], ['boom', at('w20', 'forty'), 0.35]);
  c.push(['cut', ST.w21b, 0.4], ['paper', ST.w21b + 0.2, 0.5], ['tag', tOver, 0.6]);
  for (let i = 0; i < 10; i++) c.push(['flutter', tSix - 0.9 + i * 0.12, 0.35]);
  c.push(['stamp', tSix + 0.2, 0.8]);
  c.push(['cut', ST.w22b, 0.4], ['flap', ST.w22b, 0.6], ['whoosh', ST.w22b + 0.3, 0.5], ['whoosh', ST.w22b + 0.9, 0.5], ['thump', tMil + 0.3, 0.7], ['coins', tMil + 0.35, 0.4], ['slam', tUp, 0.9], ['stamp', tUp + 0.02, 0.8], ['boom', tUp, 0.4]);
  c.push(['flutter', at('w23', 'old') - 0.3, 0.8], ['thump', at('w23', 'system'), 0.5], ['stamp', at('w23', 'system') + 0.05, 0.5]);
  c.push(['cut', ST.w24, 0.4], ['cut', ST.w25, 0.4], ['rumble', tOrder - 0.35, 0.4], ['whoosh', tOrder - 0.2, 0.4], ['tag', tExp + 0.1, 0.8], ['slam', tExp + 0.12, 0.5]);
  return c;
}
const MUSIC = { b0: 0, day: ST.w04, night: ST.w08, machine: ST.w09, compare: ST.w17, proof: ST.w21b, fin: ST.w24, hit: tExp + 0.12, end: T };

// ---------- CLI ----------
const [mode, a1, a2] = process.argv.slice(2);
if (mode === 'cues') { fs.writeFileSync(`${__dirname}/cues_v2.json`, JSON.stringify({ T, vo: Object.entries(ST), sfx: cues(), music: MUSIC })); console.log('cues ok, T =', T); }
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
else if (mode === 'video') (async () => {
  const cv = createCanvas(W, H), ctx = cv.getContext('2d');
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', a1], { stdio: ['pipe', 'inherit', 'inherit'] });
  const N = Math.round(T * FPS), T0 = Date.now();
  for (let f = 0; f < N; f++) { frame(ctx, f / FPS); const buf = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); if (f % 150 === 0) process.stderr.write(`${f}/${N} ${((Date.now() - T0) / 1000).toFixed(0)}s\n`); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
})();
module.exports = { T, ST, S };
