// Episode 17 "The Man Who Flew in a Lawn Chair" (How It's Run) — the story told through the hero's actions, no cards: two airline pilots spot a man in a lawn chair at 16,000 ft;
// in 1982 Larry Walters tied 42 helium balloons to a chair in his California backyard; instead of a gentle ride he shot nearly three miles up; he popped balloons with a pellet gun,
// dropped the gun, dumped water ballast to control the landing, the ropes snagged power lines, he made it down alive, the FAA fined him $1,500; the chair is now in the Smithsonian.
// Built on hirkit (rig, light, collage, edit). Re-enactment with generic figures (no likenesses, no invented quotes); shots cut on voice-over words. 1080x1920, 30 fps.
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
const LK = require('./lawnkit');
const { C, F, clamp, lerp, seg, E, rr, hash } = K;
const { INK } = R;
const { W, H, layer, txt, fitTxt } = LK;
const FPS = 30;
const k = (t, a, b, e = E.inOut) => e(seg(t, a, b));

// ---------- voice timeline (natural speed; real speech start/end from vo/speech.json, gaps only) ----------
const LINES = JSON.parse(fs.readFileSync(`${__dirname}/script.json`));
const SP = JSON.parse(fs.readFileSync(`${__dirname}/vo/speech.json`));
const GAP = { s01: 0.25, s02: 0.3, s03: 0.3, s04: 0.2, s05: 0.3, s06: 0.25, s07: 0.25, s08: 0.3, s09: 0.3, s10: 0.25, s11: 0.3, s12: 0.5, s13: 1.9 };
const ST = {}; let T = 0.15; for (const L of LINES) { ST[L.id] = +(T - SP[L.id][0]).toFixed(3); T += SP[L.id][1] - SP[L.id][0] + GAP[L.id]; } T = +T.toFixed(2);
const V = EN.voice(`${__dirname}/vo`, ST), at = (id, w, n = 0) => V.at(id, w, n), end = id => ST[id] + SP[id][1];

// ---------- helpers ----------
function cam(keys, lt) {
  let c; if (lt <= keys[0][0]) c = keys[0]; else if (lt >= keys[keys.length - 1][0]) c = keys[keys.length - 1];
  else for (let i = 1; i < keys.length; i++) if (lt < keys[i][0]) { const a = keys[i - 1], b = keys[i], u = E.inOut(seg(lt, a[0], b[0])); c = [lt, lerp(a[1], b[1], u), lerp(a[2], b[2], u), Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), u)), lerp(a[4] || 0, b[4] || 0, u)]; break; }
  return { x: c[1] + Math.sin(lt * 0.9) * 4 / c[3], y: c[2] + Math.cos(lt * 0.7) * 3 / c[3], z: c[3], r: (c[4] || 0) + Math.sin(lt * 0.6) * 0.003 };
}
const shake = (t, t0, a = 14) => (t > t0 && t < t0 + 0.35) ? Math.sin((t - t0) * 70) * a * (1 - seg(t, t0, t0 + 0.35)) : 0;
const blink = (t, p = 3.3, o = 0) => ((t + o) % p) > p - 0.11 ? 1 : 0;
const pop = (t, t0, d = 0.3, s = 2.2) => t < t0 ? 0 : E.back(seg(t, t0, t0 + d), s);
const RIM_DAY = { dir: [-1, -0.4], color: '#FFF6E0', w: 8, a: 0.9 };
const bg = (c, col) => { c.fillStyle = col; c.fillRect(0, 0, W, H); };
function label(ctx, s, x, y, u, o = {}) {
  if (u <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.03); ctx.scale(u, u); const size = o.size || 56;
  ctx.font = `${size}px ${F.black}`; const w = Math.min(ctx.measureText(s).width + 50, o.maxW || 980);
  CL.cutout(ctx, () => rr(ctx, -w / 2, -size * 0.85, w, size * 1.35, 12), o.col || '#FFFDF8', { elev: 1.4 }); fitTxt(ctx, s, 0, size * 0.28, size, o.fg || INK, w - 40);
  if (o.arrow) { ctx.fillStyle = o.col || '#FFFDF8'; const ax = o.arrowX || 0; ctx.beginPath(); ctx.moveTo(ax - 22, size * 0.5); ctx.lineTo(ax + 22, size * 0.5); ctx.lineTo(ax + o.arrow * 30, size * 1.25); ctx.closePath(); ctx.fill(); ctx.lineWidth = R.px(ctx, 4); ctx.strokeStyle = INK; ctx.stroke(); }
  ctx.restore();
}
function stampLabel(ctx) { // honesty label, small, top of the 3:4 crop, always on
  ctx.save(); ctx.translate(W / 2, 262); ctx.font = `28px ${F.black}`; const s = 'REAL STORY · RE-ENACTMENT', w = ctx.measureText(s).width + 40;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -26, w, 50, 10), '#171717', { elev: 0.8, tex: 0 }); txt(ctx, s, 0, 10, 28, C.yellow); ctx.restore();
}

// ---------- key words ----------
const tImp = at('s01', 'impossible'), tSix = at('s01', 'sixteen'), tMan = at('s02', 'man'), tLawn = at('s02', 'lawn');
const tTied = at('s03', 'tied'), tForty = at('s03', 'forty'), tBack = at('s03', 'california');
const tGentle = at('s04', 'gentle'), tInstead = at('s05', 'instead'), tShot = at('s05', 'shot'), tThree = at('s05', 'three');
const tPellet = at('s06', 'pellet'), tPopW = at('s06', 'pop'), tDown = at('s06', 'down');
const tShooting = at('s07', 'shooting'), tDropped = at('s07', 'dropped');
const tDesc = at('s08', 'descended'), tDumped = at('s08', 'dumped'), tBallast = at('s08', 'ballast'), tLanding = at('s08', 'landing');
const tRopes = at('s09', 'ropes'), tSnag = at('s09', 'snagged'), tAlive = at('s10', 'alive');
const tFaa = at('s11', 'faa'), tFifteen = at('s11', 'fifteen'), tDollars = at('s11', 'dollars'), tWild = at('s12', 'wildest'), tSmith = at('s13', 'smithsonian');
// balloons that burst, in order (index in the 42), as absolute times: the pellet gun pops them one by one
const POP = { 27: tPopW + 0.2, 15: tDown - 0.3, 33: ST.s07 + 0.12, 8: ST.s07 + 0.44, 22: ST.s07 + 0.74 };
const FLASH = Object.values(POP).map(x => x - 0.05);

// ---------- Larry in flight: balloons above, ropes, jugs; hip at (hx, hy) ----------
const ROPE = [10, -560];
function flyer(ctx, t, hx, hy, o = {}) {
  const ax = hx - 4 + ROPE[0], ay = hy + 34 + ROPE[1];
  LK.balloons(ctx, ax, ay, { t, s: o.bs ?? 0.62, n: o.n ?? 42, pop: o.nopop ? {} : POP });
  LK.larrySeated(ctx, hx, hy, { t, ropes: ROPE, dangle: o.dangle ?? 1, face: o.face, lean: o.lean ?? -0.04, jugs: o.jugs ?? 13, armN: o.armN, armF: o.armF, tilt: o.tilt, farFront: o.farFront, sw: o.sw ?? 1, rim: o.rim });
}
const FACE = (name, look = [1, 0], t = 0) => R.expr(name, { look, blink: blink(t, 3.4) });
// the pellet gun in his hand: aims at `ang` (rad, up = negative), recoil on the burst times, a small muzzle flash
function gunArm(t, hand, ang, flashes = FLASH, o = {}) {
  const kick = flashes.reduce((a, f) => a + (t > f && t < f + 0.25 ? Math.exp(-(t - f) * 18) * 0.12 : 0), 0);
  return { hand: [hand[0], hand[1] + kick * 60], grip: 'fist', item: c => { c.save(); c.rotate(ang + kick); LK.gun(c, o.gs ?? 0.85);
    for (const f of flashes) if (t > f && t < f + 0.09) { c.translate(240 * (o.gs ?? 0.85), -14); const u = (t - f) / 0.09; c.globalAlpha = 1 - u; LK.poly(c, [[0, 0], [40, -34], [26, 0], [52, 24], [8, 12]], C.yellow, 3.5); }
    c.restore(); } };
}

// ================= SHOTS =================
const SH = []; const shot = (id, t0, t1, draw, out) => SH.push({ id, t0, t1, draw, out });
const B = [0, tSix - 0.12, ST.s02 - 0.06, ST.s03 - 0.06, tForty - 0.12, ST.s04 - 0.06, ST.s05 - 0.06, tThree - 0.12, ST.s06 - 0.06, tPopW - 0.1, ST.s07 - 0.06, tDropped - 0.12, ST.s08 - 0.06, tDumped - 0.1, ST.s09 - 0.06, ST.s10 - 0.06, ST.s11 - 0.06, tDollars - 0.05, ST.s13 - 0.1, T + 0.01];
const skyBack = (c, t, o = {}) => { LK.sky(c, t, o); };

// A1 (s01 "Two airline pilots spotted something impossible"): the cockpit; in the big side window a lawn chair under a huge bunch of balloons drifts in; both pilots lean in, the captain points
shot('A1 cockpit', B[0], B[1], (ctx, t, lt) => {
  const u = k(t, 0.0, 1.9, E.out), pt = k(t, 0.85, 1.2), sh = k(t, 0.3, 0.6);
  const bob = Math.sin(t * 1.6) * 10;
  LK.cockpitBack(ctx, t, { sky: c => {
    LK.skyFill(c, '#5FA3EE', '#CFE6FF', -520, 520);
    for (let i = 0; i < 5; i++) { const x = ((hash(i) * 1600 - 800 - t * (90 + 40 * hash(i + 4)) + 4000) % 1600) - 800; LK.cloud(c, x, -300 + hash(i + 3) * 700, 0.7 + hash(i + 8) * 0.5, 0.92); }
    c.save(); c.translate(lerp(250, 70, u), 90 + bob - u * 20); c.scale(lerp(0.3, 0.44, u), lerp(0.3, 0.44, u)); c.rotate(Math.sin(t * 1.3) * 0.03); flyer(c, t, 0, 0, { nopop: true, face: FACE('smile', [1, 0.2], t), sw: 1 }); c.restore(); } });
  const lean = 0.06 + 0.12 * sh;
  LK.pilotSeated(ctx, 130, 1330, LK.FIRST, { s: 1.12, lean: lean, face: R.exprMix(FACE('neutral', [1, -0.1], t), FACE('shocked', [1, -0.4], t), sh), cap: true });
  LK.pilotSeated(ctx, 300, 1400, LK.CAPTAIN, { s: 1.22, lean: lean + 0.02, face: R.exprMix(FACE('neutral', [1, -0.1], t), FACE('surprised', [1, -0.4], t), sh),
    armN: { hand: [lerp(110, 255, pt), lerp(-128, -300, pt)], grip: pt > 0.3 ? 'point' : 'fist', elbowUp: false }, armF: { hand: [96, -126], grip: 'fist' } });
  LT.grade(ctx, 'office', { vignette: 0.22 });
});
// A2 ("...at sixteen thousand feet."): out of the window: the chair and the balloons in the open sky; 16,000 FEET lands; a far-away airliner passes (never close)
shot('A2 sky', B[1], B[2], (ctx, t, lt) => {
  const c = cam([[0, 0, -400, 0.72], [2.0, 0, -360, 0.88]], lt), hy = Math.sin(t * 1.4) * 12;
  layer(ctx, c, 0.4, w => skyBack(w, t, { n: 8 }));
  layer(ctx, c, 0.55, w => { w.save(); w.translate(lerp(-1500, 1700, k(t, 0, T / 4, x => x)), -1750); LK.airliner(w, 0.42, { rot: -0.02 }); w.restore(); });
  layer(ctx, c, 1, w => flyer(w, t, 0, hy, { nopop: true, face: FACE('smile', [1, 0.1], t) }));
  label(ctx, '16,000 FEET', 540, 640, pop(t, tSix, 0.32, 2.4), { size: 104, col: C.yellow, rot: -0.04 });
  LT.grade(ctx, 'day', { vignette: 0.2 });
});
// A3 (s02 "A man. Sitting in a lawn chair."): push in on Larry on "man", then pull back to the whole lawn chair on "lawn chair"
shot('A3 man', B[2], B[3], (ctx, t, lt) => {
  const c = cam([[0, 20, -250, 1.9], [tLawn - B[2] - 0.25, 20, -250, 1.7], [tLawn - B[2] + 0.15, 0, -110, 0.88]], lt), hy = Math.sin(t * 1.4) * 8;
  layer(ctx, c, 0.4, w => skyBack(w, t, { n: 8 }));
  layer(ctx, c, 1, w => flyer(w, t, 0, hy, { nopop: true, face: R.exprMix(FACE('neutral', [1, 0], t), FACE('smile', [1, 0.3], t), k(t, tMan, tMan + 0.5)), sw: 1.4 }));
  label(ctx, 'LAWN CHAIR', 330, 1130, pop(t, tLawn + 0.1, 0.3, 2.4), { size: 56, col: '#171717', fg: C.yellow, arrow: 1, arrowX: 90, rot: -0.04 });
  LT.grade(ctx, 'day', { vignette: 0.2 });
});

// B1 (s03 "In 1982, Larry Walters tied forty-two helium balloons..."): the California backyard; he ties the ropes to the chair and the balloons rise one by one
const HIP0 = -215; // chair standing on the lawn: hip height
const ORDER = null;
shot('B1 backyard', B[3], B[4], (ctx, t, lt) => {
  const c = cam([[0, -120, -560, 0.82], [B[4] - B[3], -80, -600, 0.74]], lt), n = 42 * k(t, ST.s03 + 0.55, tForty - 0.05, E.in);
  layer(ctx, c, 0.55, w => LK.backyard(w, t));
  layer(ctx, c, 1, w => {
    const ax = -4 + ROPE[0], ay = HIP0 + 34 + ROPE[1]; LK.balloons(w, ax, ay, { t, s: 0.62, n });
    LK.larrySeated(w, 0, HIP0, { t, ropes: ROPE, dangle: 0, jugs: 13, face: FACE('neutral'), lean: 0, armN: { hand: [60, -80], grip: 'relax' }, noFigure: true });
  });
  // Larry stands beside the chair and ties on: one arm up to the rope
  layer(ctx, c, 1, w => {
    const reach = 0.5 + 0.5 * Math.sin(t * 3.2), tie = k(t, ST.s03 + 0.2, ST.s03 + 0.6);
    LT.castShadow(w, g => R.figure(g, -380, 0, 1, 1, LK.LARRY, {}), { x: -380, floorY: 0, a: 0.2, blur: 3 });
    LT.lit(w, g => R.figure(g, -380, 0, 1, 1, LK.LARRY, { lean: 0.06, armN: { hand: [lerp(40, 150, tie), lerp(-70, -460 + reach * 14, tie)], grip: 'pinch' }, armF: { hand: [-14, -64] }, face: R.expr('smile', { look: [0.7, -0.9], blink: blink(t, 3.3) }) }), { rim: RIM_DAY });
  });
  label(ctx, 'CALIFORNIA · 1982', 300, 350, pop(t, ST.s03 + 0.1, 0.3), { size: 34, col: '#171717', fg: C.yellow, rot: -0.02 });
  LT.grade(ctx, 'day', { vignette: 0.2 });
});
// B2 ("...forty-two helium balloons to a chair in his California backyard."): wide; all 42 are up; he steps back, hands on hips, looks up at them
shot('B2 forty-two', B[4], B[5], (ctx, t, lt) => {
  const c = cam([[0, -40, -700, 0.56], [B[5] - B[4], -40, -740, 0.52]], lt);
  layer(ctx, c, 0.55, w => LK.backyard(w, t));
  layer(ctx, c, 1, w => {
    const ax = -4 + ROPE[0], ay = HIP0 + 34 + ROPE[1]; LK.balloons(w, ax, ay, { t, s: 0.62, n: 42 });
    LK.larrySeated(w, 0, HIP0, { t, ropes: ROPE, dangle: 0, jugs: 13, noFigure: true });
    const st = k(t, tForty - 0.2, tForty + 0.6, E.out);
    LT.castShadow(w, g => R.figure(g, lerp(-380, -520, st), 0, 1, 1, LK.LARRY, {}), { x: lerp(-380, -520, st), floorY: 0, a: 0.2, blur: 3 });
    LT.lit(w, g => R.figure(g, lerp(-380, -520, st), 0, 1, 1, LK.LARRY, { lean: -0.04, armN: { hand: [62, -270], grip: 'fist', elbowUp: true }, armF: { hand: [-62, -262], grip: 'fist', elbowUp: true }, face: R.expr('smile', { look: [0.7, -1], blink: blink(t, 3.3) }), headTilt: -0.12 }), { rim: RIM_DAY });
  });
  const n = Math.floor(42 * k(t, tForty - 0.05, tForty + 0.45, E.out));
  label(ctx, '42 BALLOONS', 540, 520, pop(t, tForty - 0.05, 0.3, 2.4), { size: 98, col: C.yellow, rot: -0.04 });
  LT.grade(ctx, 'day', { vignette: 0.2 });
});
// C (s04 "He expected a gentle ride."): sitting in the chair on the lawn, relaxed; the chair lifts a little, he leans back, smiling
shot('C gentle', B[5], B[6], (ctx, t, lt) => {
  const lift = 34 * k(t, tGentle - 0.1, B[6] - 0.1, E.out), c = cam([[0, 0, -430, 0.84], [B[6] - B[5], 10, -470, 0.9]], lt);
  layer(ctx, c, 0.55, w => LK.backyard(w, t));
  layer(ctx, c, 1, w => flyer(w, t, 0, HIP0 - lift, { dangle: k(t, tGentle, B[6]), lean: -0.1, nopop: true, face: R.exprMix(FACE('smile', [1, -0.3], t), FACE('grin', [1, -0.5], t), k(t, tGentle, tGentle + 0.6)), sw: 0.6,
    armN: { hand: [96, -152], grip: 'relax' }, armF: { hand: [78, -150], grip: 'relax' } }));
  LT.grade(ctx, 'golden', { vignette: 0.2 });
});

// D1 (s05 "Instead, he shot..."): low shot from the lawn: the chair rockets up past the house and the palm tree, he grips the armrests
const hyD = t => HIP0 - 2900 * E.in(seg(t, tInstead - 0.1, tShot + 0.62));
shot('D1 launch', B[6], B[7], (ctx, t, lt) => {
  const hy = hyD(t), cy = -640 + (hy - HIP0) * 0.72, c = { x: 0, y: cy, z: 0.62, r: shake(t, tInstead + 0.1, 0.01) * 0.2 };
  layer(ctx, c, 0.55, w => LK.backyard(w, t));
  layer(ctx, c, 1, w => { if (hy > -3200) flyer(w, t, 0, hy, { dangle: 1, lean: -0.08, nopop: true, face: FACE('shocked', [0.8, 0.2], t), sw: 2.5,
    armN: { hand: [96, -150], grip: 'fist' }, armF: { hand: [78, -148], grip: 'fist' } }); });
  const sp = k(t, tInstead + 0.1, tShot + 0.3); // speed streaks
  if (sp > 0) { ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 8; ctx.lineCap = 'round'; for (let i = 0; i < 14; i++) { const x = 40 + hash(i) * 1000, y0 = ((hash(i + 9) * 2200 + t * 3600) % 2400) - 200; ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y0 + 160 * sp); ctx.stroke(); } ctx.restore(); }
  LT.grade(ctx, 'day', { vignette: 0.26 });
});
// D2 (s05 "...nearly three miles into the sky."): high above the clouds; far below, a patch of town; he looks down; NEARLY 3 MILES UP
shot('D2 high', B[7], B[8], (ctx, t, lt) => {
  const c = cam([[0, 30, -170, 1.12], [B[8] - B[7], 20, -240, 0.92]], lt), hy = Math.sin(t * 1.4) * 10;
  layer(ctx, c, 0.4, w => skyBack(w, t, { n: 4, y0: -2200, deck: 330, gap: [-760, 520], town: { y: 470, s: 0.5, haze: 0.4 } }));
  layer(ctx, c, 1, w => flyer(w, t, 0, hy, { nopop: true, face: R.exprMix(FACE('surprised', [0.7, 0.9], t), FACE('worried', [0.6, 1], t), k(t, tThree, tThree + 0.7)), sw: 1.8, lean: 0.05 }));
  label(ctx, 'NEARLY 3 MILES UP', 540, 640, pop(t, tThree, 0.3, 2.4), { size: 82, col: C.yellow, rot: -0.03 });
  LT.grade(ctx, 'day', { vignette: 0.24 });
});

// E1 (s06 "He'd brought a pellet gun..."): he reaches down beside the seat and lifts the pellet gun into view
shot('E1 gun', B[8], B[9], (ctx, t, lt) => {
  const c = cam([[0, 70, -140, 1.05], [B[9] - B[8], 90, -150, 1.12]], lt), up = k(t, B[8] + 0.1, tPellet + 0.1, E.out), hy = Math.sin(t * 1.4) * 8;
  layer(ctx, c, 0.4, w => skyBack(w, t, { n: 4, y0: -2200, deck: 330, gap: [-760, 520], town: { y: 470, s: 0.5, haze: 0.4 } }));
  layer(ctx, c, 1, w => flyer(w, t, 0, hy, { nopop: true, lean: 0.06, face: R.exprMix(FACE('worried', [0.8, 0.5], t), FACE('thinking', [1, -0.3], t), up),
    armN: { hand: [lerp(70, 128, up), lerp(-60, -214, up)], grip: 'fist', item: cc => { cc.save(); cc.rotate(lerp(0.2, -0.45, up)); LK.gun(cc, 0.85); cc.restore(); } } }));
  label(ctx, 'PELLET GUN', 760, 1040, pop(t, tPellet, 0.3, 2.4), { size: 54, col: '#171717', fg: C.yellow, arrow: 1, arrowX: -120, rot: 0.04 });
  LT.grade(ctx, 'day', { vignette: 0.24 });
});
// E2 ("...to pop balloons and come back down."): he aims up and pops one balloon, then another; the chair starts to sink
const sinkY = t => 70 * k(t, tPopW, ST.s07 + 1.2, E.out);
shot('E2 pop', B[9], B[10], (ctx, t, lt) => {
  const c = cam([[0, 30, -330, 0.92], [B[10] - B[9], 30, -340, 0.95]], lt), hy = sinkY(t) + Math.sin(t * 1.4) * 6;
  layer(ctx, c, 0.4, w => skyBack(w, t, { n: 4, y0: -2200, deck: 330, gap: [-760, 520], town: { y: 470, s: 0.5, haze: 0.4 } }));
  layer(ctx, c, 1, w => flyer(w, t, 0, hy, { lean: 0.02, face: FACE('squint', [0.8, -0.9], t), armN: gunArm(t, [112, -250], -1.05) }));
  LT.grade(ctx, 'day', { vignette: 0.24 });
});
// F1 (s07 "But after shooting a few..."): more pops, recoil; the cluster gets thinner on one side
shot('F1 shooting', B[10], B[11], (ctx, t, lt) => {
  const c = cam([[0, 30, -340, 0.95], [B[11] - B[10], 30, -330, 0.98]], lt), hy = sinkY(t) + Math.sin(t * 1.4) * 6;
  layer(ctx, c, 0.4, w => skyBack(w, t, { n: 4, y0: -2200, deck: 330, gap: [-760, 520], town: { y: 470, s: 0.5, haze: 0.4 } }));
  layer(ctx, c, 1, w => flyer(w, t, 0, hy, { lean: 0.02, face: FACE('squint', [0.8, -0.9], t), armN: gunArm(t, [112, -250], -1.05) }));
  const sk = FLASH.reduce((a, f) => a + shake(t, f, 6), 0); if (sk) { ctx.save(); ctx.translate(sk, sk * 0.6); ctx.restore(); }
  LT.grade(ctx, 'day', { vignette: 0.24 });
});
// F2 (s07 "...he dropped the gun."): close on the hand: the gun slips and tumbles away, his hand closes on air, he watches it fall
const gunFall = t => { const dt = Math.max(0, t - tDropped); return { y: 0.5 * 2400 * dt * dt, rot: dt * 7 }; };
shot('F2 dropped', B[11], B[12], (ctx, t, lt) => {
  const c = cam([[0, 110, -60, 1.75], [B[12] - B[11], 90, -20, 1.45]], lt), hy = sinkY(t), g = gunFall(t), held = t < tDropped;
  layer(ctx, c, 0.4, w => skyBack(w, t, { n: 4, y0: -2200, deck: 330, gap: [-760, 520], town: { y: 470, s: 0.5, haze: 0.4 } }));
  layer(ctx, c, 1, w => {
    flyer(w, t, 0, hy, { lean: 0.03, face: held ? FACE('squint', [0.8, -0.8], t) : R.exprMix(FACE('surprised', [0.8, 0.6], t), FACE('shocked', [0.5, 1], t), k(t, tDropped, tDropped + 0.35)),
      armN: held ? gunArm(t, [112, -250], lerp(-1.05, -0.6, k(t, tDropped - 0.3, tDropped)), [], {}) : { hand: [118 + 8 * k(t, tDropped, tDropped + 0.15), -226], grip: 'fist' } });
    if (!held) { w.save(); w.translate(138, hy + 96 - 226 + g.y); w.rotate(-0.6 + g.rot); LK.gun(w, 0.85); w.restore(); }
  });
  LT.grade(ctx, 'day', { vignette: 0.26 });
});

// G1 (s08 "As the chair descended..."): sinking out of the cloud into clear air; the town grows below him; he leans over to look
shot('G1 descend', B[12], B[13], (ctx, t, lt) => {
  const u = seg(t, B[12], B[13]), c = cam([[0, 20, -180, 1.0], [B[13] - B[12], 20, -150, 0.96]], lt);
  layer(ctx, c, 0.4, w => { LK.skyFill(w, '#8CC0F4', '#E3F3FF', -7000, 900); LK.townBelow(w, lerp(1300, 560, E.inOut(u)), lerp(0.55, 1.2, u), 0.35); LK.ceiling(w, t, lerp(120, -1400, E.inOut(u))); });
  layer(ctx, c, 1, w => flyer(w, t, 0, Math.sin(t * 1.4) * 8 + 30, { lean: 0.1, face: R.exprMix(FACE('worried', [0.7, 1], t), FACE('squint', [0.8, 1], t), u), sw: 1.2 }));
  LT.grade(ctx, 'day', { vignette: 0.22 });
});
// G2 ("...he dumped water ballast to control his landing."): he tips a jug over the side; water streams down; the houses and streets are close now
shot('G2 ballast', B[13], B[14], (ctx, t, lt) => {
  const u = seg(t, B[13], B[14]), c = cam([[0, 60, -110, 1.05], [B[14] - B[13], 60, -100, 1.1]], lt), tip = k(t, tDumped - 0.05, tDumped + 0.35, E.out), flow = k(t, tDumped + 0.2, tDumped + 0.45);
  layer(ctx, c, 0.4, w => { LK.skyFill(w, '#8CC0F4', '#E3F3FF', -7000, 900); LK.townBelow(w, lerp(520, 330, u), lerp(1.2, 1.8, u), 0.2); });
  layer(ctx, c, 1, w => flyer(w, t, 0, 40 + Math.sin(t * 1.4) * 6, { lean: 0.16, face: FACE('squint', [0.9, 1], t), jugs: 12,
    armN: { hand: [lerp(80, 150, tip), lerp(-80, -60, tip)], grip: 'fist', item: cc => { cc.save(); cc.rotate(lerp(0, 1.9, tip)); LK.jug(cc, 0, 0, 1.0, lerp(1, 0.25, k(t, tDumped + 0.2, tDumped + 1.2))); cc.restore();
      if (flow > 0) { cc.save(); cc.translate(52, 20); for (let i = 0; i < 22; i++) { const ph = ((t * 2.2 + i * 0.047) % 1), y = ph * 1100 * flow, x = Math.sin(i * 2.1) * 8 * ph; cc.fillStyle = i % 3 ? '#6AB0FF' : '#BFE0FA'; cc.beginPath(); cc.ellipse(x, y, 7, 22, 0, 0, 7); cc.fill(); } cc.restore(); } } } }));
  label(ctx, 'WATER BALLAST', 780, 1050, pop(t, tBallast, 0.3, 2.4), { size: 52, col: '#171717', fg: C.yellow, rot: 0.04 });
  LT.grade(ctx, 'day', { vignette: 0.22 });
});

// H (s09 "Then his ropes snagged power lines."): a quiet street; the chair comes down between the poles; the rope hooks the wire, the wire sags, the chair jerks and swings
const contactHip = -234, anchorX = 6;
const hyH = t => t < tSnag ? lerp(-1900, contactHip, E.in(seg(t, B[14] + 0.05, tSnag)) * 0.7 + seg(t, B[14] + 0.05, tSnag) * 0.3) : contactHip + 70 * Math.exp(-(t - tSnag) * 4.2) * Math.sin((t - tSnag) * 11);
shot('H lines', B[14], B[15], (ctx, t, lt) => {
  const c = cam([[0, 0, -640, 0.6], [B[15] - B[14], 0, -610, 0.68]], lt), hy = hyH(t) + shake(t, tSnag, 6), hit = t > tSnag, dl = hit ? 54 * Math.exp(-(t - tSnag) * 2.4) * (0.6 + 0.4 * Math.cos((t - tSnag) * 9)) : 0;
  layer(ctx, c, 0.55, w => LK.street(w, t, { dip: (x, kk) => dl * Math.exp(-Math.pow((x - anchorX) / 330, 2)) }));
  layer(ctx, c, 1, w => { const ax = anchorX, ay = hy + 34 + ROPE[1];
    flyer(w, t, 0, hy, { lean: hit ? 0.0 : 0.08, tilt: hit ? Math.sin((t - tSnag) * 9) * 0.05 : 0, face: R.exprMix(FACE('worried', [0.8, 0.8], t), FACE('shocked', [0.3, -0.7], t), k(t, tSnag - 0.1, tSnag + 0.2)), sw: 2, armN: { hand: [96, -150], grip: 'fist' }, armF: { hand: [78, -148], grip: 'fist' } });
    if (hit) { w.save(); w.translate(ax, ay + 4); w.strokeStyle = INK; w.lineWidth = R.px(w, 9); w.lineCap = 'round'; w.beginPath(); w.arc(0, 0, 18, 3.5, 6.1); w.stroke(); w.restore(); } });
  LT.grade(ctx, 'day', { vignette: 0.22 });
});
// I (s10 "He made it down alive."): on the ground by the chair; the balloons still hang in the wires above; he exhales, then a small smile
shot('I alive', B[15], B[16], (ctx, t, lt) => {
  const c = cam([[0, -130, -440, 0.8], [B[16] - B[15], -150, -470, 0.95]], lt), br = Math.sin(t * 2.2) * 6, rel = k(t, tAlive - 0.3, tAlive + 0.4);
  layer(ctx, c, 0.55, w => LK.street(w, t, { dip: (x) => 20 * Math.exp(-Math.pow((x - anchorX) / 330, 2)) }));
  layer(ctx, c, 1, w => {
    const hipY = -200, ax = anchorX, ay = hipY + 34 + ROPE[1];
    LK.balloons(w, ax, ay + 40, { t, s: 0.62, n: 42, pop: POP }); LK.larrySeated(w, 0, hipY, { t, ropes: [ROPE[0], ROPE[1] + 40], dangle: 0, jugs: 12, noFigure: true });
    LT.castShadow(w, g => R.figure(g, -380, 200, 1, 1, LK.LARRY, {}), { x: -380, floorY: 200, a: 0.2, blur: 3 });
    LT.lit(w, g => R.figure(g, -380, 200, 1, 1, LK.LARRY, { lean: lerp(0.18, 0.0, rel) + br * 0.0004, hip: [0, -256 + br * 0.4], armN: { hand: [lerp(40, 14, rel), lerp(-120, -64, rel)], grip: 'relax' }, armF: { hand: [-14, -64] }, face: R.exprMix(FACE('tired', [0.3, 0.3], t), FACE('smile', [0.6, -0.4], t), rel), headTilt: lerp(0.08, -0.04, rel) }), { rim: RIM_DAY });
  });
  LT.grade(ctx, 'golden', { vignette: 0.22 });
});

// J1 (s11 "The FAA fined him fifteen hundred dollars."): a gloved... no: a plain hand slides the notice across the desk; a red stamp lands: $1,500 FINE
const woodTop = (c) => { bg(c, '#8A5A34'); c.save(); c.strokeStyle = 'rgba(60,30,10,0.18)'; c.lineWidth = 3; for (let y = -40; y < H + 80; y += 90) { c.beginPath(); c.moveTo(0, y); for (let x = 0; x <= W; x += 60) c.lineTo(x, y + Math.sin(x / 130 + y) * 8); c.stroke(); } c.restore();
  const g = c.createRadialGradient(W / 2, H * 0.5, 200, W / 2, H * 0.5, 1300); g.addColorStop(0, 'rgba(255,225,160,0.2)'); g.addColorStop(1, 'rgba(40,20,5,0.35)'); c.fillStyle = g; c.fillRect(0, 0, W, H); };
shot('J1 fine', B[16], B[17], (ctx, t, lt) => {
  woodTop(ctx); const sl = k(t, ST.s11 + 0.0, ST.s11 + 0.55, E.out), st = E.in(seg(t, tFifteen - 0.18, tFifteen + 0.0)), sk = shake(t, tFifteen, 14);
  ctx.save(); ctx.translate(lerp(1600, 540, sl) + sk, 900 + sk * 0.5); ctx.rotate(lerp(0.2, -0.02, sl)); ctx.scale(2.0, 2.0); LK.notice(ctx, 400, 540, {}); ctx.restore();
  LT.lit(ctx, c => { const hp = [lerp(1980, 930, sl), 1180 + (1 - sl) * 40]; R.tube(c, [[1700, 1800], [hp[0] + 140, hp[1] + 120], hp], 120, LK.OFFICIAL.top, 5); R.hand(c, hp, Math.PI + 0.25, LK.OFFICIAL.skin, 'relax', { size: 3.0 }); }, { rim: RIM_DAY });
  if (t > tFifteen - 0.18) { ctx.save(); ctx.translate(560 + sk, lerp(260, 1040, st)); ctx.scale(lerp(2.6, 1.0, st), lerp(2.6, 1.0, st)); ctx.globalAlpha = clamp(st * 1.6); LK.stampMark(ctx, '$1,500 FINE', { size: 104, rot: -0.12 }); ctx.restore(); }
  LT.grade(ctx, 'office', { vignette: 0.25 });
});
// J2 (s11 "...dollars." + s12 "And the wildest part?"): Larry's deadpan look with the notice in his hand; one eyebrow goes up
shot('J2 deadpan', B[17], B[18], (ctx, t, lt) => {
  const sm = k(t, tWild - 0.1, tWild + 0.5), push = 1 + lt * 0.03;
  bg(ctx, '#CFDDEB'); const g = ctx.createRadialGradient(540, 700, 100, 540, 900, 1200); g.addColorStop(0, 'rgba(255,255,255,0.7)'); g.addColorStop(1, 'rgba(120,150,190,0.25)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.translate(540, 1500); ctx.scale(push, push); ctx.translate(-540, -1500);
  LT.lit(ctx, c => R.bust(c, 540, 1500, 2.6, LK.LARRY, { face: R.exprMix(R.expr('tired', { look: [0, 0.2], blink: blink(lt, 3.1) }), R.expr('skeptical', { look: [0.5, -0.3] }), sm), headTilt: lerp(0, -0.06, sm),
    hands: [{ side: 1, hand: [110, 70], elbow: [190, 262], grip: 'hold', item: c2 => { c2.save(); c2.translate(30, -170); c2.rotate(0.06); c2.scale(0.42, 0.42); LK.notice(c2, 400, 540, {}); c2.translate(0, 60); c2.rotate(-0.1); LK.stampMark(c2, '$1,500', { size: 100, rot: 0 }); c2.restore(); } }] }), { rim: RIM_DAY });
  ctx.restore();
  LT.grade(ctx, 'office', { vignette: 0.24 });
}, { type: 'tear', dur: 0.45, at: () => [W / 2, H * 0.45] });
// K (s13 "That same lawn chair is now in the Smithsonian."): the museum hall; the chair on its plinth in a spotlight, the big window with sky behind; THE SMITHSONIAN
shot('K museum', B[18], T + 0.01, (ctx, t, lt) => {
  const c = cam([[0, 0, -600, 0.95], [T - B[18], 0, -520, 1.28]], lt);
  layer(ctx, c, 1, w => {
    LK.museum(w, t, {});
    w.save(); w.translate(0, -470); LK.chair(w, { jugs: 13, jugsFloor: true, slack: 0.9, t, sway: 0 }); w.restore();
    LK.plinth(w, t, {}); LK.stanchions(w, -520, 520);
  });
  label(ctx, 'THE SMITHSONIAN', 540, 470, pop(t, tSmith - 0.05, 0.32, 2.4), { size: 86, col: C.yellow, rot: -0.03 });
  LT.grade(ctx, 'golden', { vignette: 0.24 });
});

// ---------- edit, global overlays, subtitles ----------
SH.sort((a, b) => a.t0 - b.t0);
const ED = makeEdit(SH, W, H);
function headline(ctx, t) { // frame 0: the title in big words, gone by the time 16,000 FEET lands
  const a = 1 - seg(t, tSix - 0.4, tSix - 0.12); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2, 400);
  CL.cutout(ctx, () => rr(ctx, -440, -70, 880, 118, 16), '#FFFDF8', { elev: 1.4 }); txt(ctx, 'THE MAN WHO FLEW', 0, 14, 70, INK);
  ctx.translate(0, 124); ctx.rotate(0.025); CL.cutout(ctx, () => rr(ctx, -400, -62, 800, 110, 14), C.red, { elev: 1.2 }); txt(ctx, 'IN A LAWN CHAIR', 0, 24, 78, '#FFFDF8');
  ctx.restore();
}
const SPLIT = { s01: [5, 5], s02: [2, 5], s03: [4, 4, 5, 2], s04: [5], s05: [3, 6], s06: [5, 3, 4], s07: [5, 4], s08: [4, 4, 4], s09: [3, 3], s10: [5], s11: [3, 4], s12: [4], s13: [4, 5] };
function subs() {
  const G = [];
  Object.keys(ST).forEach(id => { const ws = V.words(id); let k0 = 0; SPLIT[id].forEach(n => { G.push({ id, words: ws.slice(k0, k0 + n) }); k0 += n; }); if (k0 !== ws.length) throw new Error(`subtitle split ${id}: ${k0} vs ${ws.length}`); });
  G.forEach((g, i) => { const nx = G[i + 1], e0 = Math.min(g.words[g.words.length - 1].t1, end(g.id)) + 0.4; g.t0 = g.words[0].t0 - 0.05;
    g.t1 = nx ? (nx.id === g.id ? nx.words[0].t0 - 0.05 : Math.min(e0, nx.words[0].t0 - 0.05)) : Math.min(T, e0 + 0.6);
    g.text = g.words.map(x => x.w).join(' '); });
  return G;
}
const SUBS = subs();
const TEX = K.paperTexture(W, H);
function frame(ctx, t) {
  ED.frame(ctx, t);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  headline(ctx, t); stampLabel(ctx);
  ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.26; ctx.drawImage(TEX, 0, 0); ctx.restore();
  EN.drawSubtitles(ctx, t, SUBS, { y: 1565, size: 62, maxW: 820, x: 540, highlight: ['sixteen', 'thousand', 'feet.', 'man.', 'lawn', 'forty-two', 'fortytwo', 'balloons', 'gentle', 'three', 'miles', 'pellet', 'dropped', 'ballast', 'power', 'snagged', 'alive.', 'fifteen', 'faa', 'smithsonian.', 'wildest'] });
}

// ---------- sound cues (for mix.py) ----------
function cues() {
  const c = [['hum', 0, 0.9], ['wind', 0.2, 0.3], ['rise', 0.2, 0.4], ['cut', B[1], 0.35], ['stamp', tSix, 0.8], ['tag', tSix + 0.05, 0.4], ['jet', B[1] + 0.3, 0.12]];
  c.push(['cut', B[2], 0.35], ['whoosh', tLawn - 0.1, 0.35], ['tag', tLawn + 0.1, 0.45]);
  c.push(['cut', B[3], 0.35], ['room', B[3], 0.4]); for (let i = 0; i < 14; i++) c.push(['balloonpop', ST.s03 + 0.55 + i * 0.12, 0.0]); for (let i = 0; i < 14; i++) c.push(['pop', ST.s03 + 0.6 + i * 0.12, 0.28]);
  c.push(['cut', B[4], 0.35], ['stamp', tForty - 0.05, 0.7], ['sparkle', tForty + 0.1, 0.5]);
  c.push(['cut', B[5], 0.35], ['flutter', tGentle, 0.5]);
  c.push(['cut', B[6], 0.35], ['rev', tInstead - 0.1, 0.55], ['whoosh', tInstead, 0.7], ['fall', tShot, 0.5], ['wind', tInstead, 0.7], ['cut', B[7], 0.35], ['stamp', tThree, 0.7], ['wind', B[7], 0.6]);
  c.push(['cut', B[8], 0.3], ['tick', tPellet, 0.4], ['tag', tPellet, 0.45], ['clank', tPellet + 0.2, 0.35]);
  c.push(['cut', B[9], 0.3]); for (const f of FLASH) c.push(['snap', f, 0.6], ['balloonpop', f + 0.05, 0.9]);
  c.push(['cut', B[11], 0.3], ['grab', tDropped - 0.1, 0.5], ['fall', tDropped + 0.05, 0.6], ['boop', tDropped + 0.6, 0.35]);
  c.push(['cut', B[12], 0.3], ['wind', B[12], 0.5], ['cut', B[13], 0.3], ['water', tDumped + 0.15, 0.9], ['tag', tBallast, 0.4]);
  c.push(['cut', B[14], 0.3], ['wind', B[14], 0.5], ['twang', tSnag, 1.0], ['thump', tSnag, 0.5], ['clank', tSnag + 0.1, 0.5]);
  c.push(['cut', B[15], 0.3], ['puff', tAlive - 0.2, 0.6], ['sparkle', tAlive + 0.3, 0.4]);
  c.push(['cut', B[16], 0.3], ['slide', ST.s11, 0.5], ['stamp', tFifteen, 1.0], ['thump', tFifteen, 0.6]);
  c.push(['cut', B[17], 0.25], ['boop', tWild, 0.4], ['tear', B[18] - 0.2, 0.6], ['room', B[18], 0.5], ['sparkle', tSmith, 0.7], ['stamp', tSmith - 0.05, 0.6]);
  return c;
}
const MUSIC = { b0: 0, hook: B[1], yard: B[3], gentle: B[5], launch: B[6], gun: B[8], descent: B[12], lines: B[14], fine: B[16], end: B[18], hit: tSmith - 0.1, T };

// ---------- CLI ----------
const [mode, a1, a2] = process.argv.slice(2);
if (mode === 'cues') { fs.writeFileSync(`${__dirname}/cues.json`, JSON.stringify({ T, vo: Object.entries(ST), sfx: cues(), music: MUSIC })); console.log('cues ok, T =', T); }
else if (mode === 'srt') {
  const f = s => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  fs.writeFileSync(a1, SUBS.map((g, i) => `${i + 1}\n${f(g.t0)} --> ${f(g.t1)}\n${g.text}\n`).join('\n')); console.log('srt ok', SUBS.length);
}
else if (mode === 'still') {
  const ts = a1.split(',').map(Number), tw = 270, th = 480, cols = Math.min(ts.length, 8), rows = Math.ceil(ts.length / cols);
  const sheetC = createCanvas(tw * cols, th * rows), sc = sheetC.getContext('2d'), cv = createCanvas(W, H), ctx = cv.getContext('2d');
  ts.forEach((t, i) => { frame(ctx, t); sc.drawImage(cv, (i % cols) * tw, Math.floor(i / cols) * th, tw, th); sc.fillStyle = '#E63946'; sc.font = '20px sans-serif'; sc.fillText(t.toFixed(2), (i % cols) * tw + 6, Math.floor(i / cols) * th + 22); });
  fs.writeFileSync(a2, sheetC.toBuffer('image/png'));
} else if (mode === 'frame') { const cv = createCanvas(W, H), ctx = cv.getContext('2d'); frame(ctx, +a1); fs.writeFileSync(a2, cv.toBuffer('image/png')); }
else if (mode === 'shots') console.log(SH.map(s => `${s.id}\t${s.t0.toFixed(2)}–${s.t1.toFixed(2)}\t${(s.t1 - s.t0).toFixed(2)}s`).join('\n'), '\nT', T);
else if (mode === 'video') (async () => {
  const cv = createCanvas(W, H), ctx = cv.getContext('2d');
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', a1], { stdio: ['pipe', 'inherit', 'inherit'] });
  const N = Math.round(T * FPS), T0 = Date.now();
  for (let f = 0; f < N; f++) { frame(ctx, f / FPS); const buf = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); if (f % 150 === 0) process.stderr.write(`${f}/${N} ${((Date.now() - T0) / 1000).toFixed(0)}s\n`); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
})();
module.exports = { T, ST, SH };
