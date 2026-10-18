// S04–S06: the galley — barricade and the timer, the rhythm and the handprint, the night visitor.
const C = require('../lib/core'), K = require('../lib/cast'), SH = require('../lib/ship'), A = require('../lib/act'), PR = require('../lib/props');
const { clamp, lerp, kf, ease, eout, cam, shake, win } = C, F = SH.FLOOR, R = K.R, S = K.D2, G = SH.GAL;
const W8 = K.WAITER;
const mir = (x, p) => [2 * x - p[0], p[1]];   // grips for a flipped (right-facing) character are given mirrored
// the visitor stays a silhouette until S11: Rosa's body in near-black, headlamp lit
const SIL = { S: K.ROSA.S, C: Object.assign({}, K.ROSA.C, { skin: '#0c0e13', top: '#0c0e13', top2: '#0a0b10', pants: '#0b0c11', shoe: '#050608', sole: '#050608', wrap: '#0c0e13', tired: false }) };
// foreground copy of the prep counter, so a crouching hero hides behind it
function counterFront(ctx) { SH.rr(ctx, 900, 560, 820, 40, 6, '#c9cfd6'); SH.rect(ctx, 920, 600, 780, F - 600, '#a7b0b8'); for (let i = 0; i < 4; i++) SH.rr(ctx, 940 + i * 190, 630, 170, 240, 4, '#9aa3ab'); }
// the door porthole: corridor light, a head passing behind it
const portFace = (t, a) => c => { if (a <= 0) return; c.save(); c.beginPath(); c.arc(300, 360, 36, 0, 7); c.clip(); c.fillStyle = `rgba(8,10,8,${a})`; c.beginPath(); c.ellipse(300 + Math.sin(t * 1.3) * 16, 372, 30, 36, 0, 0, 7); c.fill(); c.restore(); };
const lightPort = (ctx, alpha) => { ctx.save(); ctx.globalAlpha = alpha; C.glow(ctx, 300, 360, 160, 'rgba(255,200,140,0.35)'); ctx.restore(); };

// ------------------------------------------------------------------ S04 the galley: inventory, barricade, bangs, timer, engines stop
function s04(ctx, t, TL) {
  const s = TL.s, w = TL.w, t0 = TL.blocks.s04.t0, r = t - t0;
  const t2 = s('s04_2'), tB = s('s04_bang'), tT = s('s04_timer'), t3 = s('s04_3'), tN = s('s04_night'), t4 = s('s04_4'), tS = s('s04_stop');
  const bangs = [tB + 0.25, tB + 0.85, tB + 1.55, tB + 1.9], scrape = tB + 2.3, ring = tT + 0.15, smother = ring + 0.75;
  const tDoor = w('s04_1', 'steel') ?? (t0 + 2.6), tStop = w('s04_4', 'stop') ?? (t4 + 1.4);
  // where the hero is
  const cartX = kf([[t2 + 0.3, 900], [t2 + 2.2, 160]], t, ease);
  const wp = A.walkPath(t, [[t0, 2480], [t0 + 2.4, 1900], [tDoor - 0.05, 1900], [tDoor, 1300], [t2 + 0.3, 1260], [t2 + 2.2, 520], [tB + 0.2, 520], [tB + 0.7, 600]], 100);
  const sitting = t > tT + 1.4, crouch = t > tB + 0.2 && !sitting;
  let HX = wp.x, lunge = 0;
  if (t > ring && t < ring + 1.5) { lunge = ease(clamp((t - ring - 0.1) / 0.45)); HX = lerp(600, 630, lunge); }
  if (t >= ring + 1.5) HX = 630;
  if (sitting) HX = 560;
  const dark = t < tB ? 0 : t < tN ? 0.55 : 0.72;
  const swing = t < tStop ? 0.07 : 0.07 * Math.max(0, 1 - (t - tStop) / 1.6);
  const keys = [[t0, 2350, 470, 1.15], [t0 + 0.1, 2000, 560, 1.3, 'm', 2.4], [tDoor, 380, 500, 1.15, 'cut'], [tDoor + 0.1, 330, 470, 1.35, 'm', 1.2],
    [t2, 900, 560, 0.95, 'cut'], [t2 + 0.2, 640, 560, 1.05, 'm', 2.4], [tB, 760, 520, 0.68, 'cut'],   // locked wide during the bangs
    [ring, 820, 470, 2.6, 'cut'], [ring + 0.1, 790, 480, 2.75, 'm', 0.9], [smother + 0.5, 600, 400, 2.3, 'cut'],
    [t3, 600, 560, 0.85, 'cut'], [t3 + 0.1, 560, 600, 1.25, 'm', 2.6], [tN, 1250, 300, 1.3, 'cut'], [t4 + 0.6, 1300, 260, 1.45, 'm', 3.2], [tStop + 0.6, 560, 560, 1.6, 'cut'], [tS, 900, 520, 0.72, 'cut'], [tS + 0.1, 900, 520, 0.68, 'm', 1.8]];
  ctx.save(); cam(ctx, t, keys, { drift: 0.006 });
  let doorShake = 0; for (const b of bangs) if (t > b && t < b + 0.25) doorShake = Math.sin((t - b) * 90) * 10 * (1 - (t - b) / 0.25);
  if (t > scrape && t < scrape + 1.1) doorShake = Math.sin(t * 30) * 1.5;
  const faceA = t > tB - 0.3 && t < tT + 1.2 ? 0.9 : t > t3 && t < t3 + 1.8 ? 0.9 * (1 - (t - t3) / 1.8) : 0;
  SH.galley(ctx, t, { doorShake, doorFace: portFace(t, faceA), swing, stock: 1, water: 1, cart: cartX });
  if (bangs.some(b => win(t, b, b + 0.15))) shake(ctx, t, 6);
  // the timer on the oven top
  const ringing = t > ring && t < smother;
  if (t < smother) PR.drawTimer(ctx, 820, 520, 0.9, ringing ? 1 : 0, t);
  // hero
  let pose, grips = {}, holdNear = null, flip = false, e;
  if (sitting) { pose = A.sitPose(HX, F, { hop: 95, footN: [HX - 175, F - 12], footF: [HX - 150, F - 12], lean: 0.05 }); grips = { near: [HX - 110, F - 120] }; flip = true;
    holdNear = (c, J) => PR.drawTowel(c, J.wN[0] - 10, J.wN[1] + 10, 0.55); }
  else if (t > ring) { pose = { x: HX, ground: F, crouch: 0.35 - lunge * 0.1, lean: 0.25 + lunge * 0.2 }; grips = { near: mir(HX, t < smother ? [lerp(680, 815, lunge), lerp(700, 500, lunge)] : [820, 492]) };
    if (t < smother + 0.1) holdNear = (c, J) => PR.drawTowel(c, J.wN[0], J.wN[1], 0.6); flip = true; }
  else if (t > t2 && t < tB + 0.2) { pose = { x: HX, ground: F, walk: wp.walk, lean: 0.3, crouch: 0.1 }; grips = { near: [cartX + 300, 650] }; }
  else if (crouch) { pose = { x: HX, ground: F, crouch: 0.55, lean: 0.2 }; }
  else { pose = { x: HX, ground: F, walk: wp.walk, lean: 0.04 }; if (t < tDoor) { const J0 = R.solve(W8.S, pose); grips = { near: [J0.shN[0] - 130, J0.shN[1] + 60 + Math.sin(r * 5) * 40] }; } }
    if (!sitting && t > ring && t > smother) { /* towel pressed on the timer: draw the bundle */ PR.drawTowel(ctx, 840, 500, 0.75); }
  e = t < tB ? { eyes: 'open', brow: 'worried', mouth: 'flat', look: [-0.9, 0.1] } : t < ring ? { eyes: 'wide', brow: 'worried', mouth: 'closed', look: [-0.9, -0.1], sweat: 1 }
    : t < t3 ? { eyes: 'squint', brow: 'worried', mouth: 'closed', look: [-0.6, -0.2], sweat: 1 } : t < tN ? { eyes: 'half', brow: 'worried', mouth: 'flat', look: [-0.9, 0.2] } : { eyes: 'open', brow: 'up', mouth: 'flat', look: [0.2, -0.9] };
  K.person(ctx, W8, { pose, flip, grips, nearHand: holdNear ? 'fist' : 'open', e: C.blink(e, t, 0.3), t, holdNear }, 'waiter s04');
  // light: kitchen strip lights off after the barricade; the porthole and the oven clock are all that's left
  if (dark > 0) { SH.darkness(ctx, dark, [{ x: 300, y: 360, r: 420, a: 0.9 }, { x: 300, y: 700, r: 520, a: 0.6 }, { x: 820, y: 500, r: 200, a: 0.5 }]); lightPort(ctx, 1); }
  ctx.restore();
  if (t > tS + 1.2) C.fade(ctx, clamp((t - tS - 1.2) / 0.5));
  return { vig: 0.3 + dark * 0.4 };
}

// ------------------------------------------------------------------ S05 days 2–5: tally, footsteps, dragging, the cold room, the handprint
function s05(ctx, t, TL) {
  const s = TL.s, w = TL.w, t0 = TL.blocks.s05.t0, t1 = s('s05_1'), t2 = s('s05_2'), tC = s('s05_cold'), t3 = s('s05_3'), t4 = s('s05_4'), tP = s('s05_print');
  const tDrag = w('s05_2', 'dragging') ?? (t2 + 2.4), tSil = w('s05_2', 'silences') ?? (t2 + 4.6), tInf = w('s05_4', 'infected') ?? (t4 + 1.8), tDoors = w('s05_4', 'doors') ?? (t4 + 3.2);
  let ret = { vig: 0.45 };
  ctx.save();
  if (t < t2) {   // DAY 3 — tally marks on the wall, one more stroke
    cam(ctx, t, [[t0, 2660, 440, 1.45], [t0 + 0.1, 2640, 420, 1.6, 'm', 2.6]]);
    SH.galley(ctx, t, { tally: t > t0 + 1.2 ? 3 : 2, stock: 0.85, water: 0.8, cart: 160 });
    const HX = 2850, pose = { x: HX, ground: F, lean: 0.06 }, st = clamp((t - t0 - 0.6) / 0.6);
    K.person(ctx, W8, { pose, grips: { near: [2660 + st * 6, 440 + st * 26] }, nearHand: 'fist', e: C.blink({ eyes: 'half', brow: 'flat', mouth: 'flat', look: [-0.9, 0.1] }, t, 0.2), t, holdNear: (c, J) => { c.save(); c.translate(J.wN[0], J.wN[1]); c.rotate(-0.9); SH.rr(c, -6, -40, 12, 50, 4, '#1a1a1a'); c.restore(); } }, 'waiter s05a');
    SH.darkness(ctx, 0.35, [{ x: 2600, y: 400, r: 600, a: 0.8 }]);
  } else if (t < tDrag) {   // noon — footsteps above: tilt up from the hero to the ceiling, dust falls
    const u = clamp((t - t2) / (tDrag - t2));
    cam(ctx, t, [[t2, 1500, 560, 1.2], [t2 + 0.1, 1500, 200, 1.35, 'm', tDrag - t2 - 0.2]]);
    SH.galley(ctx, t, { tally: 3, stock: 0.8, water: 0.75, cart: 160, porthole: c => { c.fillStyle = '#9fc6e8'; c.fillRect(1490, 330, 140, 120); } });
    for (let i = 0; i < 4; i++) { const st = t2 + 0.4 + i * 0.55; if (t > st) { const d = t - st; for (let k = 0; k < 6; k++) { ctx.fillStyle = `rgba(230,225,210,${Math.max(0, 0.7 - d * 0.4)})`; ctx.fillRect(1200 + i * 140 + k * 9, -60 + d * 260 + k * 14, 4, 4); } } }
    const HX = 1560, pose = { x: HX, ground: F, lean: -0.05, tilt: -0.3 };
    K.person(ctx, W8, { pose, e: { eyes: 'open', brow: 'worried', mouth: 'flat', look: [0.1, -0.9] }, t }, 'waiter s05b');
    SH.darkness(ctx, 0.2, [{ x: 1560, y: 390, r: 500 }]); if (win(t, t2 + 0.4, t2 + 2.6)) shake(ctx, t, 1.5);
  } else if (t < tSil) {   // midnight — dragging; he lies awake against the cart
    cam(ctx, t, [[tDrag, 560, 600, 1.7], [tDrag + 0.1, 560, 580, 1.9, 'm', tSil - tDrag]]);
    SH.galley(ctx, t, { tally: 4, stock: 0.75, water: 0.7, cart: 160 });
    const HX = 560, pose = A.sitPose(HX, F, { hop: 95, footN: [HX - 175, F - 12], footF: [HX - 150, F - 12], lean: 0.1, tilt: -0.1 });
    K.person(ctx, W8, { pose, flip: true, e: { eyes: 'open', brow: 'worried', mouth: 'closed', look: [0.7, -0.6] }, t }, 'waiter s05c');
    SH.darkness(ctx, 0.82, [{ x: 300, y: 360, r: 260, a: 0.8 }, { x: 520, y: 640, r: 300, a: 0.35 }]);
  } else if (t < t3) {   // long silences; rationing — tape marks on the bottle, one sip
    cam(ctx, t, [[tSil, 1700, 620, 1.6], [tSil + 0.1, 1720, 640, 1.75, 'm', tC - tSil], [tC, 2700, 520, 0.95, 'cut'], [tC + 0.1, 2800, 520, 1.05, 'm', t3 - tC]]);
    SH.galley(ctx, t, { tally: t > tC ? 5 : 4, stock: 0.7, water: 0.6, cart: 160 });
    if (t < tC) { const HX = 1800, pose = { x: HX, ground: F, crouch: 0.2, lean: 0.05 }, sip = win(t, tSil + 1.0, tSil + 2.2);
      const J0 = R.solve(W8.S, pose), bp = sip ? [J0.neck[0] - 40, J0.neck[1] - 30] : [J0.shN[0] - 70, J0.shN[1] + 90];
      K.person(ctx, W8, { pose, grips: { near: bp }, nearHand: 'fist', e: C.blink({ eyes: sip ? 'closed' : 'half', brow: 'flat', mouth: 'flat', look: [-0.9, 0.4] }, t, 0.2), t, holdNear: (c, J) => { c.save(); c.translate(J.wN[0], J.wN[1]); c.rotate(sip ? -2.1 : 0); SH.rr(c, -14, -70, 28, 100, 8, '#9fd6ff'); SH.rect(c, -14, -10, 28, 5, '#d6413a'); SH.rect(c, -14, 10, 28, 5, '#d6413a'); SH.rect(c, -5, -84, 12, 14, '#3f62b0'); c.restore(); } }, 'waiter s05d'); }
    else { const wp = A.walkPath(t, [[tC, 2400], [t3, 2620]], 100); K.person(ctx, W8, { pose: { x: wp.x, ground: F, walk: wp.walk, lean: 0.04 }, flip: true, e: { eyes: 'open', brow: 'flat', mouth: 'flat', look: [-0.9, 0] }, t }, 'waiter s05e'); }
    SH.darkness(ctx, 0.3, [{ x: 1800, y: 500, r: 700 }]);
  } else {   // DAY 5 — the cold room: half the bread gone; the door had been closed; oil handprint
    const open = t < tInf + 0.5, wq = A.walkPath(t, [[t3, 2560], [tInf - 0.1, 2560], [tInf + 0.5, 2930]], 100), HX = wq.x;
    const keys = [[t3, 2700, 520, 0.95], [t3 + 0.1, 2780, 500, 1.15, 'm', 1.6], [t4, 2860, 420, 2.3, 'cut'], [t4 + 0.1, 2850, 410, 2.5, 'm', tInf - t4], [tInf, 2700, 520, 1.1, 'cut'], [tDoors, 3080, 550, 3.0, 's'], [tP + 0.6, HX - 40, 380, 2.4, 'cut']];
    cam(ctx, t, keys);
    SH.galley(ctx, t, { tally: 5, stock: 0.65, water: 0.5, cart: 160, coldOpen: open, bread: t > t3 + 0.2 ? 0.5 : 1, handprint: !open });
    const doorPull = !open && t < tInf + 1.0;
    const pose = { x: HX, ground: F, lean: 0.04, walk: wq.walk };
    const reach = t > tP - 0.1 && t < tP + 0.8;
    K.person(ctx, W8, { pose, flip: true, grips: doorPull ? { near: mir(HX, [3080, 560]) } : reach ? { near: mir(HX, [3070, 560]) } : {}, nearHand: reach ? 'open' : 'fist', e: C.blink(t < tInf ? { eyes: 'open', brow: 'worried', mouth: 'o', open: 0.2, look: [-0.9, 0.2] } : { eyes: 'wide', brow: 'worried', mouth: 'flat', look: [-0.9, 0.3] }, t, 0.3), t }, 'waiter s05f');
    SH.darkness(ctx, 0.3, [{ x: 2900, y: 500, r: 700 }]);
  }
  ctx.restore();
  A.dayMark(ctx, t, t1 + 0.1, t2 - 0.1, 'DAY 3'); A.dayMark(ctx, t, t3, t3 + 2.3, 'DAY 5');
  if (t > tP + 1.2) C.fade(ctx, clamp((t - tP - 1.2) / 0.4));
  return ret;
}

// ------------------------------------------------------------------ S06 day 7: the night visitor
function s06(ctx, t, TL) {
  const s = TL.s, t0 = TL.blocks.s06.t0, t1 = s('s06_1'), tW = s('s06_wait'), tV = s('s06_visitor'), t2 = s('s06_2'), tBd = s('s06_band');
  const hatchUp = tV + 0.3, out1 = tV + 1.2, sweep0 = tV + 2.4, sweep1 = tV + 3.8, back = tV + 4.6, gone = tV + 6.0, drop = back + 0.2;
  const HX = 1560;   // hero crouched behind the counter, facing right (the cold room)
  // the visitor's path: out of the cold room, three careful steps into the galley, back
  const vx = t < out1 ? 3060 : kf([[out1, 3060], [sweep0, 2640], [sweep1, 2640], [back + 0.6, 3000], [gone - 0.4, 3060]], t, ease);
  const beamA = t < sweep0 ? Math.PI + 0.25 : t < sweep1 ? Math.PI + 0.25 - Math.sin(clamp((t - sweep0) / (sweep1 - sweep0)) * Math.PI) * 0.3 : Math.PI + 0.35;
  const visible = t > hatchUp && t < gone;
  const beamOnHero = t > sweep0 + 0.4 && t < sweep1 - 0.3;
  const keys = [[t0, 1480, 520, 1.3], [t0 + 0.1, 1560, 470, 1.9, 'm', tW - t0], [tW, 2200, 520, 0.72, 'cut'], [tW + 0.1, 2250, 520, 0.78, 'm', tV - tW],   // long locked night frame
    [sweep0 + 0.4, HX + 30, 420, 3.2, 'cut'], [sweep1 - 0.3, 2400, 520, 0.85, 'cut'], [t2, 2300, 520, 0.95, 'cut'], [t2 + 0.1, 2950, 620, 1.4, 'm', 2.8], [tBd, 2760, 820, 2.4, 's'], [tBd + 0.8, 2650, 420, 2.2, 'cut']];
  ctx.save(); cam(ctx, t, keys, { drift: 0.005 });
  const coldOpen = t > tV - 0.2 && t < gone + 0.3 || t > t2;
  SH.galley(ctx, t, { tally: 7, stock: 0.6, water: 0.45, cart: 160, coldOpen, bread: t > back ? 0.25 : 0.5, hatchOpen: t > hatchUp && t < gone + 0.2, handprint: !coldOpen });
  if (t > drop && t < tBd + 0.35) PR.drawWristband(ctx, 2745, F - 10, 0.9, 0.05);
  // the visitor (silhouette, headlamp) with a flashlight
  let fl = null;
  if (visible) { const emerge = clamp((t - hatchUp) / 0.8), pose = { x: vx, ground: F + (1 - emerge) * 260, lean: 0.08, walk: t > out1 && t < back + 0.8 ? { w: 1, u: Math.abs(vx - 3060) / 90, stride: 90 } : null, crouch: 0.15 };
    const J0 = R.solve(SIL.S, pose); fl = PR.flashlight([J0.shN[0] - 80, J0.shN[1] + 70], beamA);
    ctx.save(); ctx.beginPath(); ctx.rect(-1000, -1000, 6000, 1000 + F + 2); ctx.clip();
    K.person(ctx, SIL, { pose, grips: { near: fl.G }, t, lampOn: true, e: { eyes: 'closed', brow: 'flat', mouth: 'flat' }, holdNear: c => PR.drawFlashlight(c, fl, false), hold: t > back - 0.4 && t < gone ? (c, J) => PR.drawBread(c, J.wF[0], J.wF[1], 0.5) : null }, 'visitor s06');
    ctx.restore(); }
  // hero behind the counter with a frying pan
  const peek = t < tV + 1.5 || t > sweep1 + 0.2 ? 0.45 : 0.62, pose = { x: HX, ground: F, crouch: t < t2 ? peek : 0.05, lean: 0.12 };
  const J0 = R.solve(W8.S, pose), p = PR.pan(mir(HX, [J0.shN[0] - 40, J0.shN[1] + 30]), -1.3);
  const hx = t < t2 ? HX : A.walkPath(t, [[t2 + 0.2, HX], [tBd - 0.2, 2690]], 100).x, pick = t > tBd, up = t > tBd + 0.8;
  const heroPose = t < t2 ? pose : { x: hx, ground: F, walk: t < tBd ? { w: 1, u: (hx - HX) / 100, stride: 100 } : null, lean: pick && !up ? 0.5 : 0.06, crouch: pick && !up ? 0.7 : 0 };
  const JH = R.solve(W8.S, heroPose);
  const hold = (c, J) => PR.drawPan(c, PR.pan([J.wN[0], J.wN[1]], -1.4));
  const ex = beamOnHero ? { eyes: 'squint', brow: 'worried', mouth: 'closed', look: [-0.9, 0], sweat: 1 } : t < t2 ? { eyes: 'open', brow: 'worried', mouth: 'flat', look: [-0.9, 0.05] } : !pick ? { eyes: 'open', brow: 'flat', mouth: 'flat', look: [-0.9, 0.1] } : up ? { eyes: 'open', brow: 'up', mouth: 'o', open: 0.15, look: [-0.6, 0.3] } : { eyes: 'open', brow: 'worried', mouth: 'flat', look: [-0.7, 0.7] };
  const gN = !pick ? [JH.shN[0] - 50, JH.shN[1] + 60] : !up ? [2 * hx - 2745, F - 30 - clamp((t - tBd - 0.3) / 0.4) * 80 - 70] : [JH.shN[0] - 140, JH.shN[1] + 10];
  K.person(ctx, W8, { pose: heroPose, flip: true, grips: { near: gN }, nearHand: 'fist', e: C.blink(ex, t, 0.3), t, holdNear: !pick ? hold : t > tBd + 0.35 ? (c, J) => { c.save(); c.translate(J.wN[0] - 125, J.wN[1] - 10); c.scale(-1, 1); PR.drawWristband(c, 0, 0, 1.3, 0); c.restore(); } : null }, 'waiter s06');
  if (t < t2) counterFront(ctx);
  // light: near-total dark; the porthole moon, the headlamp, the flashlight cone
  const lights = [{ x: G.porthole[0], y: G.porthole[1], r: 300, a: 0.6 }, { x: 300, y: 360, r: 160, a: 0.5 }];
  if (fl) { lights.push({ cone: [fl.tip[0], fl.tip[1], fl.a, 0.2, 1500], a: 0.95 }); const J1 = R.solve(SIL.S, { x: vx, ground: F }); lights.push({ x: J1.head[0] - 40, y: J1.head[1] - 60, r: 120, a: 0.9 }); }
  if (t > t2) lights.push({ x: 2800, y: 600, r: 750, a: 0.75 });
  SH.darkness(ctx, 0.9, lights);
  if (fl) PR.drawFlashlight(ctx, fl, true, 1500, 0.2);
  ctx.restore();
  if (beamOnHero) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const u = (t - sweep0 - 0.4) / (sweep1 - sweep0 - 0.7), bx = lerp(-200, C.W + 200, u); const g = ctx.createLinearGradient(bx - 260, 0, bx + 260, 0); g.addColorStop(0, 'rgba(255,240,200,0)'); g.addColorStop(0.5, 'rgba(255,240,200,0.45)'); g.addColorStop(1, 'rgba(255,240,200,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, C.W, C.H); ctx.restore(); }
  A.dayMark(ctx, t, t1 + 0.1, t1 + 2.6, 'DAY 7');
  if (t > tBd + 1.2) C.fade(ctx, clamp((t - tBd - 1.2) / 0.4));
  return { vig: 0.75 };
}

const cues = TL => { const s = TL.s, w = TL.w; const tB = s('s04_bang'), ring = s('s04_timer') + 0.15, tV = s('s06_visitor');
  return [
    ['sfx/scrape', s('s04_2') + 0.3, 0.5, 1.9], ['../ep1/sfx/metaldoor', s('s04_2') + 2.2, 0.4],
    ['sfx/bangmetal', tB + 0.25, 0.9], ['sfx/bangmetal', tB + 0.85, 0.8], ['sfx/bangmetal', tB + 1.55, 1.0], ['sfx/bangmetal', tB + 1.9, 0.7], ['sfx/scrape', tB + 2.3, 0.35, 1.1],
    ['sfx/timer', ring, 0.85, 0.8], ['sfx/muffle', ring + 0.75, 0.6], ['../ep1/sfx/heartbeat', ring + 0.9, 0.4],
    ['sfx/enginestop', (w('s04_4', 'stop') ?? s('s04_4') + 1.4) - 0.2, 0.8],
    ['sfx/steps', s('s05_2') + 0.4, 0.45, 2.4], ['sfx/scrape', (w('s05_2', 'dragging') ?? s('s05_2') + 2.4), 0.3, 2.0], ['sfx/drip', (w('s05_2', 'silences') ?? s('s05_2') + 4.6) + 0.4, 0.35],
    ['../ep1/sfx/metaldoor', s('s05_3') + 0.1, 0.35], ['../ep1/sfx/sting', (w('s05_4', 'doors') ?? s('s05_4') + 3.2), 0.5],
    ['sfx/drip', s('s06_wait') + 0.8, 0.3], ['sfx/drip', s('s06_wait') + 2.9, 0.25], ['sfx/hatch', tV + 0.2, 0.6], ['sfx/steps', tV + 1.2, 0.3, 1.2], ['../ep1/sfx/heartbeat', tV + 2.4, 0.5],
    ['sfx/steps', tV + 4.6, 0.3, 1.0], ['sfx/hatch', tV + 6.0, 0.45]];
};
const music = TL => [['../ep1/sfx/music4', TL.s('s05_1'), TL.s('s05_3'), 0.14]];
module.exports = { s04, s05, s06, cues, music };
