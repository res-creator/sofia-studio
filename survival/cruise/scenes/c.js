// S07–S09: the last bottle (ice machine run + Coast Guard), the speakers, the light.
const C = require('../lib/core'), K = require('../lib/cast'), SH = require('../lib/ship'), A = require('../lib/act'), PR = require('../lib/props');
const { clamp, lerp, kf, ease, eout, cam, shake, win, hash } = C, F = SH.FLOOR, R = K.R, S = K.D2, G = SH.GAL;
const W8 = K.WAITER, ZS = [K.ZC.steward, K.ZC.tourist, K.ZC.robe];
const mir = (x, p) => [2 * x - p[0], p[1]];
const bottle = (c, x, y, a = 0, full = 1) => { c.save(); c.translate(x, y); c.rotate(a); SH.rr(c, -14, -70, 28, 100, 8, '#9fd6ff'); if (full < 1) { c.fillStyle = 'rgba(60,70,90,0.55)'; c.fillRect(-12, -66, 24, 92 * (1 - full)); } SH.rect(c, -5, -84, 12, 14, '#3f62b0'); c.restore(); };
// a standing infected seen from behind, in the POV corridor (screen space)
function backSil(ctx, p, side, t, seed) { if (p.d < 40) return; const s = p.s, x = p.x + side * 560 * s, y = p.y + 520 * s, sw = Math.sin(t * 1.2 + seed) * 8 * s;
  ctx.save(); ctx.fillStyle = '#0b0a0e'; ctx.beginPath(); ctx.ellipse(x + sw, y - 470 * s, 44 * s, 52 * s, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.roundRect(x - 70 * s + sw * 0.6, y - 420 * s, 140 * s, 250 * s, 30 * s); ctx.fill();
  ctx.fillRect(x - 58 * s, y - 190 * s, 50 * s, 190 * s); ctx.fillRect(x + 8 * s, y - 190 * s, 50 * s, 190 * s); ctx.fillRect(x - 96 * s + sw, y - 400 * s, 30 * s, 210 * s); ctx.fillRect(x + 66 * s + sw, y - 400 * s, 30 * s, 210 * s); ctx.restore(); }

// ------------------------------------------------------------------ S07 day 9: the last bottle, the ice machine, the Coast Guard
function s07(ctx, t, TL) {
  const s = TL.s, w = TL.w, t0 = TL.blocks.s07.t0, t2 = s('s07_2'), tW = s('s07_walk'), tM = s('s07_mess'), t3 = s('s07_3'), tI = s('s07_ice'), tB = s('s07_back'), t4 = s('s07_4');
  const tForty = w('s07_2', 'forty'), pass0 = tW + 3.0, pass1 = tW + 5.0, press = tI, force = w('s07_4', 'force');
  let ret = { vig: 0.5 };
  if (t < tForty) {   // galley: the last bottle; he slides the cart away from the door without a sound
    const lastCU = t < t2 + 0.6, cartX = kf([[t2 + 1.0, 160], [tForty - 0.1, 520]], t, ease);
    ctx.save(); cam(ctx, t, [[t0, 2050, 620, 1.9], [t0 + 0.1, 2040, 610, 2.1, 'm', 2.4], [t2 + 0.6, 600, 560, 1.15, 'cut'], [t2 + 0.7, 560, 540, 1.3, 'm', tForty - t2]], { drift: 0.005 });
    SH.galley(ctx, t, { tally: 9, stock: 0.45, water: 0, cart: cartX });
    if (lastCU) { const pose = { x: 2160, ground: F, crouch: 0.55, lean: 0.3 }, J0 = R.solve(W8.S, pose), up = clamp((t - t0 - 0.3) / 0.5);
      K.person(ctx, W8, { pose, grips: { near: [J0.shN[0] - 110, lerp(F - 60, J0.shN[1] + 40, up)] }, nearHand: 'fist', e: C.blink({ eyes: 'half', brow: 'worried', mouth: 'flat', look: [-0.8, 0.3] }, t, 0.2), t, holdNear: (c, J) => bottle(c, J.wN[0], J.wN[1] + 20, Math.sin(t * 6) * 0.15 * up, 0.15) }, 'waiter s07a'); }
    else { const HX = cartX + 360, pose = { x: HX, ground: F, crouch: 0.3, lean: 0.25, walk: { w: 1, u: (cartX - 160) / 70, stride: 70 } };
      K.person(ctx, W8, { pose, flip: true, grips: { near: mir(HX, [cartX + 300, 650]), far: mir(HX, [cartX + 296, 660]) }, e: C.blink({ eyes: 'squint', brow: 'worried', mouth: 'closed', look: [-0.9, 0] }, t, 0.2), t }, 'waiter s07b'); }
    SH.darkness(ctx, 0.35, [{ x: 2000, y: 700, r: 600 }, { x: 300, y: 500, r: 700 }]);
    ctx.restore(); A.dayMark(ctx, t, t0 + 0.1, t0 + 2.2, 'DAY 9'); return ret; }
  if (t < pass0 || (t > pass1 && t < tM)) {   // POV: forty steps down the dark corridor, past the ones standing still
    const z = (t - tForty) * 260, bob = Math.sin(t * 5) * 10, sway = Math.sin(t * 2.5) * 14;
    SH.pov(ctx, t, z, 'corridor', { bob, sway, dark: 0.66, lights: [{ x: C.W / 2, y: C.H / 2, r: 620, a: 0.8 }],
      things: (c, at) => { [[900, -1], [1500, 1], [2300, -1], [2900, 1]].forEach(([d, side], i) => backSil(c, at(d), side, t, i)); } });
    if (t > tW + 1.0 && t < pass0) { const u = clamp((t - tW - 1.0) / 1.2); ctx.save(); ctx.globalAlpha = 0.25 * Math.sin(u * Math.PI); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, C.W, C.H); ctx.restore(); }
    return { vig: 0.8 }; }
  if (t < tM) {   // locked frame on a motionless infected while he tiptoes past behind it
    const u = clamp((t - pass0) / (pass1 - pass0));
    ctx.save(); cam(ctx, t, [[pass0, 1520, 500, 1.25], [pass0 + 0.1, 1540, 500, 1.32, 'm', pass1 - pass0]]);
    SH.corridor(ctx, t, { emergency: true });
    ctx.save(); ctx.translate(0, F - 60); ctx.scale(0.8, 0.8); ctx.translate(0, -(F - 60)); const hx = lerp(1000, 2050, u), pose = { x: hx, ground: F, crouch: 0.2, lean: 0.1, walk: { w: 1, u: (hx - 1000) / 60, stride: 60 } };
    K.person(ctx, W8, { pose, flip: true, e: { eyes: 'squint', brow: 'worried', mouth: 'closed', look: [-0.9, 0] }, t }, 'waiter s07c'); ctx.restore();
    ctx.save(); ctx.translate(1560, F + 120); ctx.scale(1.2, 1.2); ctx.translate(-1560, -(F + 120)); const zp = K.zombiePose(ZS[0], 1560, F + 120, t, { still: true, seed: 2 }); zp.lean = 0.1; K.person(ctx, ZS[0], { pose: zp, flip: true, e: K.ZFACE(t, 2, { look: [-0.9, 0.3] }), t, seed: 2 }, 'z s07'); ctx.restore();
    SH.corridorLight(ctx, t, { dark: 0.6 }); ctx.restore(); return { vig: 0.7 }; }
  if (t < tB) {   // crew mess: the ice machine; the roar; fast cuts; grabs the VHF
    const roar = t > press, cut = Math.floor((t - press) / 0.55);
    const HX = 1990, wp = A.walkPath(t, [[tM, 600], [t3 - 0.2, 1990]], 70);
    if (roar && cut === 1) {   // cut: the corridor — heads snap toward the sound
      ctx.save(); cam(ctx, t, [[press + 0.55, 1300, 400, 1.6]]); SH.corridor(ctx, t, { emergency: true });
      ZS.forEach((ch, i) => { const zp = K.zombiePose(ch, 1000 + i * 380, F, t, { still: true, seed: i }); zp.tilt = 0.4; zp.lean = 0.45; K.person(ctx, ch, { pose: zp, flip: true, e: K.ZFACE(t, i, { eyes: 'wide', look: [-0.9, 0] }), t, seed: i }, 'z s07b'); });
      SH.corridorLight(ctx, t, { dark: 0.6 }); ctx.restore(); shake(ctx, t, 4); return { vig: 0.7 }; }
    const grab = roar && cut >= 2, run = roar && cut >= 3;
    const keys = [[tM, 900, 560, 0.85], [tM + 0.1, 1400, 560, 0.95, 'm', 2.4], [t3, 1850, 520, 1.4, 'cut'], [t3 + 0.1, 1820, 540, 1.6, 'm', press - t3],
      [press, 1810, 600, 2.6, 's'], [press + 1.1, 1280, 420, 2.2, 'cut'], [press + 1.65, 1300, 560, 0.9, 'cut']];
    ctx.save(); cam(ctx, t, keys); if (roar && cut === 0) shake(ctx, t, 7);
    SH.crewMess(ctx, t, { iceOn: roar && !run, radioTaken: grab && t > press + 1.4 });
    let pose, grips = {}, hold = null, flip = false, x = run ? lerp(1420, 300, clamp((t - press - 1.65) / 1.2)) : grab ? 1420 : roar ? HX : wp.x;
    if (!roar) { pose = { x, ground: F, walk: t < t3 - 0.2 ? wp.walk : null, lean: 0.08, crouch: 0.15 }; flip = true; const J0 = R.solve(W8.S, pose);
      grips = t > t3 + 0.3 ? { near: mir(x, [1835 + Math.sin(t * 9) * 2, 700]) } : { near: mir(x, [J0.shN[0] - 60, J0.shN[1] + 120]) }; hold = (c, J) => bottle(c, J.wN[0], J.wN[1] + 40, 0, 0); }
    else if (!grab) { pose = { x, ground: F, crouch: 0.2, lean: 0.12 }; flip = true; grips = { near: mir(x, [1810, 720]) }; hold = (c, J) => bottle(c, J.wN[0], J.wN[1] + 40, 0, clamp((t - press) / 1.0)); }
    else if (!run) { pose = { x, ground: F, lean: 0.05 }; grips = { near: [1285, 440] }; if (t > press + 1.4) hold = (c, J) => PR.drawVHF(c, J.wN[0], J.wN[1] + 30, 0.7); }
    else { pose = { x, ground: F, walk: { w: 1, u: (1420 - x) / 150, stride: 150 }, lean: 0.4, crouch: 0.12 }; const J0 = R.solve(W8.S, pose); grips = { near: [J0.shN[0] - 40, J0.shN[1] + 60] }; hold = (c, J) => PR.drawVHF(c, J.wN[0], J.wN[1] + 30, 0.7); }
    const ex = !roar ? { eyes: 'open', brow: 'worried', mouth: 'flat', look: [-0.9, 0.2] } : { eyes: 'wide', brow: 'worried', mouth: 'o', look: [-0.9, 0], sweat: 1 };
    K.person(ctx, W8, { pose, flip, grips, nearHand: 'fist', e: C.blink(ex, t, 0.3), t, holdNear: hold }, 'waiter s07d');
    SH.darkness(ctx, 0.5, [{ x: 1810, y: 560, r: 600 }, { x: 1280, y: 420, r: 400, a: 0.7 }]); ctx.restore(); return { vig: 0.6 }; }
  if (t < t4) {   // run back down the corridor, they lurch after him; slam the cart
    const u = clamp((t - tB) / (t4 - tB - 0.4)), hx = lerp(2600, 400, u);
    ctx.save(); cam(ctx, t, [[tB, 2300, 520, 1.0], [tB + 0.1, 900, 520, 1.05, 'm', t4 - tB - 0.3]]);
    SH.corridor(ctx, t, { emergency: true });
    ZS.forEach((ch, i) => { const zx = hx + 700 + i * 260 - u * 120; K.person(ctx, ch, { pose: K.zombiePose(ch, zx, F, t + i, { u: zx / 70, seed: i, lunge: 0.6 }), e: K.ZFACE(t, i, { eyes: 'wide' }), t, seed: i }, 'z s07c'); });
    const pose = { x: hx, ground: F, walk: { w: 1, u: (2600 - hx) / 160, stride: 160 }, lean: 0.42, crouch: 0.12 }, J0 = R.solve(W8.S, pose);
    K.person(ctx, W8, { pose, grips: { near: [J0.shN[0] - 40, J0.shN[1] + 60] }, nearHand: 'fist', e: { eyes: 'wide', brow: 'worried', mouth: 'o', look: [-0.9, 0], sweat: 1 }, t, holdNear: (c, J) => PR.drawVHF(c, J.wN[0], J.wN[1] + 30, 0.7) }, 'waiter s07e');
    SH.corridorLight(ctx, t, { dark: 0.55 }); ctx.restore(); C.speedLines?.(ctx, t, 0.5); return { vig: 0.6 }; }
  // galley, the cart back in place; the radio crackles: the Coast Guard
  const keys = [[t4, 700, 560, 0.85], [t4 + 0.1, 640, 600, 0.95, 'm', 1.8], [t4 + 2.2, 650, 700, 2.4, 'cut'], [t4 + 2.3, 660, 710, 2.8, 'm', 3.0], [force - 1.6, 600, 450, 2.4, 'cut'], [force + 0.8, 1560, 390, 2.2, 'cut'], [force + 1.0, 1560, 400, 2.6, 'm', 2.0]];
  ctx.save(); cam(ctx, t, keys, { drift: 0.005 }); if (win(t, t4, t4 + 0.3)) shake(ctx, t, 8);
  SH.galley(ctx, t, { tally: 9, stock: 0.45, water: 0.3, cart: 160, doorShake: win(t, t4, t4 + 0.25) ? Math.sin(t * 90) * 8 : 0, porthole: c => { SH.sea(c, 400, 'night', t); } });
  const HX = 560, pose = A.sitPose(HX, F, { hop: 95, lean: 0.1 }), J0 = R.solve(W8.S, pose);
  const ex = t < force - 1.6 ? { eyes: 'open', brow: 'worried', mouth: 'o', open: 0.2, look: [-0.6, 0.6], sweat: 1 } : { eyes: 'wide', brow: 'worried', mouth: 'flat', look: [-0.9, 0.3] };
  K.person(ctx, W8, { pose, flip: true, grips: { near: mir(HX, [HX - 110, F - 160]) }, nearHand: 'fist', e: C.blink(ex, t, 0.3), t, holdNear: (c, J) => { c.save(); c.translate(J.wN[0], J.wN[1]); c.scale(-1, 1); PR.drawVHF(c, 0, 20, 0.9, 1, t); c.restore(); } }, 'waiter s07f');
  SH.darkness(ctx, 0.5, [{ x: 450, y: 700, r: 520 }, { x: G.porthole[0], y: G.porthole[1], r: 200 }, { x: 300, y: 360, r: 260, a: 0.7 }]);
  ctx.restore();
  return { vig: 0.55 };
}

// ------------------------------------------------------------------ S08 night 10: the ceiling speaker clicks on
const SPK = [1300, 40];
function s08(ctx, t, TL) {
  const s = TL.s, w = TL.w, t0 = TL.blocks.s08.t0, t1 = s('s08_1'), tBr = s('s08_breath'), t2 = s('s08_2'), on = t1 + 2.5, off = w('s08_2', 'off') + 0.25;
  const live = t > on && t < off;
  const keys = [[t0, 900, 420, 0.75], [t1, SPK[0], SPK[1] + 60, 2.0, 'cut'], [t1 + 0.1, SPK[0], SPK[1] + 50, 2.5, 'm', on - t1], [tBr, 560, 600, 2.6, 'cut'], [tBr + 1.6, 760, 790, 2.6, 'cut'], [t2, SPK[0], SPK[1] + 50, 2.6, 'cut'], [t2 + 0.1, SPK[0], SPK[1] + 40, 3.1, 'm', off - t2], [off + 0.2, 560, 600, 1.9, 'cut']];
  ctx.save(); cam(ctx, t, keys, { drift: 0.004 });
  SH.galley(ctx, t, { tally: 10, stock: 0.45, water: 0.3, cart: 160 });
  // ceiling PA speaker
  SH.rr(ctx, SPK[0] - 70, SPK[1] - 10, 140, 70, 10, '#c9cfd6'); ctx.fillStyle = '#2a2e34'; for (let i = 0; i < 6; i++) ctx.fillRect(SPK[0] - 54 + i * 19, SPK[1] + 4, 10, 42);
  if (live) C.glow(ctx, SPK[0], SPK[1] + 30, 130, `rgba(255,220,180,${0.12 + 0.1 * Math.sin(t * 2.4)})`); ctx.fillStyle = live ? '#ff4b3a' : '#4a2a28'; ctx.beginPath(); ctx.arc(SPK[0] + 56, SPK[1] + 50, 8, 0, 7); ctx.fill(); if (live) C.glow(ctx, SPK[0] + 56, SPK[1] + 50, 40, 'rgba(255,60,40,0.5)');
  // the frying pan on the floor by his mat; his hand creeps to it
  const reach = clamp((t - tBr - 1.6) / 1.4), HX = 560, pose = A.sitPose(HX, F, { hop: 95, lean: 0.08 + reach * 0.4, tilt: t > on ? -0.15 : 0 });
  K.person(ctx, W8, { pose, flip: true, grips: { near: mir(HX, [lerp(660, 680, reach), lerp(F - 140, F - 45, reach)]) }, nearHand: reach > 0.9 ? 'fist' : 'open', e: C.blink(t < on ? { eyes: 'half', brow: 'flat', mouth: 'flat', look: [-0.7, 0.2] } : { eyes: 'wide', brow: 'worried', mouth: 'closed', look: [0.4, -0.9] }, t, t > on ? 0 : 0.3), t }, 'waiter s08');
  PR.drawPan(ctx, PR.pan([680, F - 16], 0.05, 170));
  SH.darkness(ctx, 0.84, [{ x: SPK[0], y: SPK[1] + 30, r: 300, a: live ? 0.7 : 0.35 }, { x: 560, y: 680, r: 420, a: 0.5 }, { x: 300, y: 360, r: 200, a: 0.6 }]);
  ctx.restore();
  return { vig: 0.75 };
}

// ------------------------------------------------------------------ S09 day 12: the lighthouse, the engines, the ship turns away
function portView(t, rot) { return c => { const [px, py] = G.porthole;
  c.save(); c.fillStyle = '#05070f'; c.fillRect(px - 60, py - 60, 120, 120); c.fillStyle = '#0b1426'; c.fillRect(px - 60, py + 8, 120, 60);
  SH.lighthouse(c, px - 10 + rot * 170, py + 14, t, 0.32); c.restore(); }; }
function s09(ctx, t, TL) {
  const s = TL.s, w = TL.w, t0 = TL.blocks.s09.t0, tT = s('s09_torch'), t2 = s('s09_2'), tTu = s('s09_turn'), t3 = s('s09_3'), tS = s('s09_ship'), t4 = s('s09_4');
  const tLight = w('s09_1', 'light'), tLand = w('s09_1', 'ship'), engine = w('s09_2', 'engines'), rot = ease(clamp((t - tTu) / (t3 + 1.6 - tTu)));
  if (t >= tS) {   // snap out: the whole ship at night, turning away from the lighthouse
    ctx.save(); const k = [[tS, 1700, 300, 2.4], [tS + 0.15, 1300, 420, 0.42, 's'], [t4 + 0.2, 1300, 420, 0.46, 'm', 3.4]]; cam(ctx, t, k);
    SH.sky(ctx, 'night', t); SH.sea(ctx, 520, 'night', t); SH.lighthouse(ctx, -500, 540, t, 1.6);
    ctx.save(); ctx.translate(1700 + (t - tS) * 60, 560); ctx.rotate(0.02 * Math.sin(t)); ctx.scale(-0.8, 0.8); SH.liner(ctx, -1300, 300, t, { wake: 0.6 + (t - tS) * 0.1, lit: 0.04 }); ctx.restore();
    ctx.restore(); if (t > t4 + 2.6) C.fade(ctx, clamp((t - t4 - 2.6) / 0.8)); return { vig: 0.6 }; }
  const keys = [[t0, G.porthole[0], G.porthole[1], 3.4], [t0 + 0.1, G.porthole[0], G.porthole[1], 3.7, 'm', tLight - t0], [tLight + 0.6, 1640, 420, 2.2, 'cut'], [tLand, 1620, 470, 1.9, 'm', 1.6],
    [tT, 1620, 560, 2.6, 'cut'], [t2, 1300, 480, 0.85, 'cut'], [engine, 1300, 300, 1.2, 'm', 1.6], [tTu, G.porthole[0], G.porthole[1], 3.4, 'cut'], [t3, 1660, 400, 2.4, 'cut'], [t3 + 0.1, 1670, 400, 2.7, 'm', tS - t3]];
  ctx.save(); cam(ctx, t, keys, { drift: 0.004 }); if (t > engine && t < engine + 1.4) shake(ctx, t, 3 * (1 - (t - engine) / 1.4)); else if (t > engine) shake(ctx, t, 0.8);
  const swing = t > engine ? 0.07 * clamp((t - engine) / 1.5) : 0;
  SH.galley(ctx, t, { tally: 12, stock: 0.4, water: 0.45, cart: 160, swing, porthole: portView(t, rot) });
  // hero at the porthole; grabs the flashlight; thumb on the switch; lowers it
  const HX = 1790, pose = { x: HX, ground: F, lean: -0.02, tilt: t > engine && t < tTu ? 0.25 : 0 };
  const J0 = R.solve(W8.S, pose), hes = t > tT && t < t2 + 0.6, fl = PR.flashlight([J0.shN[0] - 110, J0.shN[1] + (hes ? -10 : 120)], hes ? Math.PI + 0.25 : Math.PI / 2 + 0.3);
  const lit = Math.cos(t * 1.6) > 0.6 && rot < 0.6 ? 1 : 0;
  const ex = t < tLand ? { eyes: 'open', brow: 'up', mouth: 'o', open: 0.2, look: [-0.9, -0.3] } : t < tT ? { eyes: 'open', brow: 'up', mouth: 'smile', look: [-0.9, -0.3] } : t < engine ? { eyes: 'half', brow: 'worried', mouth: 'flat', look: [-0.7, 0.3] } : t < tTu ? { eyes: 'wide', brow: 'worried', mouth: 'o', look: [0.2, 0.9] } : { eyes: 'open', brow: 'worried', mouth: 'flat', look: [-0.9, -0.3] };
  K.person(ctx, W8, { pose, grips: { near: fl.G }, nearHand: 'fist', e: C.blink(ex, t, 0.3), t, holdNear: c => PR.drawFlashlight(c, fl, false) }, 'waiter s09');
  const lights = [{ x: G.porthole[0], y: G.porthole[1], r: 260, a: 0.85 }]; if (lit) lights.push({ x: G.porthole[0] + 60, y: G.porthole[1] + 30, r: 380, a: 0.7 });
  SH.darkness(ctx, 0.82, lights);
  if (lit) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; C.glow(ctx, G.porthole[0] + 40, G.porthole[1] + 20, 260, 'rgba(255,240,180,0.18)'); ctx.restore(); }
  ctx.restore();
  A.dayMark(ctx, t, t0 + 0.2, t0 + 2.4, 'DAY 12');
  return { vig: 0.7 };
}

const cues = TL => { const s = TL.s, w = TL.w, press = s('s07_ice'), on = s('s08_1') + 2.5;
  return [
    ['sfx/scrape', s('s07_2') + 1.0, 0.18, 1.5], ['../ep1/sfx/breath', w('s07_2', 'forty'), 0.45], ['sfx/steps', w('s07_2', 'forty') + 0.2, 0.25, 4.5], ['sfx/drip', s('s07_walk') + 1.4, 0.35], ['sfx/drip', s('s07_walk') + 4.0, 0.3],
    ['sfx/icemachine', press, 1.0, 1.7], ['../ep1/sfx/growl', press + 0.55, 0.7], ['../ep1/sfx/growl', press + 0.9, 0.5], ['../ep1/sfx/crowd', press + 0.6, 0.4], ['sfx/steps', press + 1.65, 0.6, 3.0],
    ['../ep1/sfx/slamdoor', s('s07_4') - 0.05, 0.9], ['sfx/bangmetal', s('s07_4') + 0.5, 0.6], ['../ep1/sfx/radio', s('s07_4') + 0.3, 0.35, 1.0],
    ['sfx/paclick', on, 0.8], ['sfx/pabreath', on + 0.4, 0.6, 3.6], ['sfx/paclick', w('s08_2', 'off') + 0.25, 0.8],
    ['sfx/enginestart', w('s09_2', 'engines') - 0.3, 0.9], ['../ep1/sfx/creak', s('s09_turn') + 0.2, 0.5]];
};
const music = TL => [['../ep1/sfx/music3', TL.s('s09_3'), TL.blocks.s09.t1, 0.16]];
module.exports = { s07, s08, s09, cues, music };
