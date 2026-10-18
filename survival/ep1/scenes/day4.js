// DAY 4 — the stairwell (GARY WAS HERE again), the can, the lunge + cart, run to the roof, the burning city, the edge, supplies, the radio, Gary at the door, the vent at night.
const C = require('../lib/core'), K = require('../lib/cast'), SE = require('../lib/sets'), A = require('../lib/act');
const { clamp, lerp, kf, ease, back, cam, shake, win, hash } = C, F = SE.FLOOR, R = K.R, P = K.P, S = K.D2, ST = SE.ST;
const lvl = k => ST.y0 - k * ST.FH;
// climbing schedule: [t0, t1, flight k] -> hero distance along the flight
function climb(t, plan, ch, o = {}) {
  let cur = null; for (const p of plan) { if (t >= p[0]) cur = p; }
  const [t0, t1, k] = cur, d = clamp((t - t0) / (t1 - t0)) * ST.fl;
  return SE.climbPose(ch, k, d, Object.assign({}, o));
}
function draw(ctx, t, TL) {
  const s = TL.s, B = TL.blocks.day4;
  if (t >= s('d4_card')) { C.dayCard(ctx, t, s('d4_card'), B.t1, 'DAY 4 — SURVIVED', 'EVACUATION: TOMORROW'); return { noCaps: true }; }
  if (t < s('d4_roofdoor')) return stairs(ctx, t, TL);
  return roofScene(ctx, t, TL);
}
// --------------------------------------------------------------- stairwell
function stairs(ctx, t, TL) {
  const s = TL.s, e = TL.e, w = TL.w, t0 = TL.blocks.day4.t0;
  const wCat = w('d4_01', 'cat', true), wStreets = w('d4_01', 'streets'), wGary = w('d4_01', 'building'), t2 = s('d4_02'), t3 = s('d4_03'), tCl = s('d4_clang'), t4 = s('d4_04'), tLu = s('d4_lunge'), t5 = s('d4_05'), t6 = s('d4_06');
  // inserts on "...belongs to the cat" and "...the streets belong to the infected"
  if (t > w('d4_01', 'apartment') - 0.1 && t < wStreets - 0.1) {   // the cat's paw under the apartment door
    ctx.save(); cam(ctx, t, [[w('d4_01', 'apartment') - 0.1, 960, 720, 1.7]]); SE.hallway(ctx, t, { heroDoor: true }); SE.graffiti(ctx, 960, 330, 1, 0.95);
    const u = Math.sin((t - wCat) * 6); ctx.fillStyle = '#111'; ctx.fillRect(762, F - 8, 396, 8); K.flip(ctx, 1000, false, () => { for (const k of [0, 1]) { const uu = Math.sin((t - wCat) * 6 + k * 2); R.paint(ctx, S, c => c.ellipse(930 + k * 110 + uu * 40, F - 6, 52, 20, 0, 0, 7), K.mix('#e58f3c', '#9aa087', 0.3)); for (let i = 0; i < 3; i++) R.line(ctx, [[900 + k * 110 + uu * 40 + i * 14, F - 10], [890 + k * 110 + uu * 40 + i * 14, F + 6]], 4, '#fff'); } });
    ctx.restore(); return {};
  }
  if (t >= wStreets - 0.1 && t < wGary - 0.1) {   // the street from the stairwell window
    ctx.save(); cam(ctx, t, [[0, -900, SE.STREET - 300, 1.0], [wStreets, -950, SE.STREET - 300, 1.05, 'm', 2]]); SE.sky(ctx, 'day', t); SE.facade(ctx, t);
    for (let i = 0; i < 5; i++) { const ch = [K.ZB.office, K.ZB.jogger, K.ZB.big][i % 3], x = -2300 + i * 450 + Math.sin(t * 0.7 + i) * 40; K.person(ctx, ch, { pose: K.zombiePose(ch, x, SE.STREET, t + i, { u: (x + 2000) / 70, seed: i }), e: K.ZFACE(t, i), t, seed: i, flip: i === 3 }, 'street z'); }
    ctx.restore();
    ctx.save(); ctx.lineWidth = 60; ctx.strokeStyle = '#2a2c34'; ctx.strokeRect(0, 0, C.W, C.H); ctx.fillStyle = '#2a2c34'; ctx.fillRect(C.W / 2 - 15, 0, 30, C.H); ctx.fillRect(0, C.H / 2 - 15, C.W, 30); ctx.restore();
    return {};
  }
  // hero: flight 0 -> landing -> flight 1 (d4_01/02), flights 2.. during d4_03; stops on landing 3 for the can
  const plan = [[t0 - 0.5, t0 + 3.2, 0], [t0 + 3.5, t0 + 6.4, 1], [t3, t3 + 3.2, 2], [t3 + 3.6, t3 + 6.8, 3], [tLu + 1.4, tLu + 1.41, 3], [t5, t5 + 1.4, 4], [t5 + 1.6, t5 + 3.0, 5], [t6 + 0.9, t6 + 2.2, 6]];
  let cp = climb(t, plan, K.HERO), hpose = cp.pose, hflip = cp.flip;
  const top4 = lvl(4), landX = ST.xR + 140;   // hero waits on landing 4 (right side) for the can / lunge
  if (t > t3 + 6.8 && t < t5) { const dx = kf([[t3 + 6.8, ST.xR], [t3 + 7.4, landX], [tLu, landX], [tLu + 0.45, landX - 170], [tLu + 0.9, landX + 40]], t);
    hpose = { x: dx, ground: top4, crouch: t > tLu + 0.2 && t < tLu + 0.9 ? 0.45 : 0.05, lean: t > tLu + 0.2 ? 0.25 : 0.05, walk: { w: 1, u: (dx - ST.xR) / 90, stride: 90 } }; hflip = t < tCl + 0.6; }
  // the infected: appears on landing 5 (left), lunges down flight 4 at the hero, the cart is shoved into its legs
  const cartX = kf([[tLu + 0.1, ST.xR - 160], [tLu + 0.45, ST.xR - 330]], t, C.eout), cartTilt = t > tLu + 0.5 ? -0.25 * clamp((t - tLu - 0.5) / 0.2) : 0;
  const zch = K.ZB.office; let zp = null, zflip = false, zrot = 0, zpiv = null;
  const tz0 = tLu - 0.5, tz1 = tLu + 0.45, tHit = tLu + 0.5;
  if (t > tz0 - 0.15 && t < tz0) { zp = K.zombiePose(zch, ST.xL - 60, lvl(5), t, { still: true }); zflip = true; }
  else if (t >= tz0 && t < tHit) { const d = lerp(ST.fl, ST.fl * 0.6, ease((t - tz0) / (tz1 - tz0))); const c = SE.climbPose(zch, 4, d, { down: true }); zp = Object.assign(c.pose, { lean: 0.4 }); const J0 = R.solve(zch.S, zp); zp.near = [J0.shN[0] - 190, J0.shN[1] + 10]; zp.far = [J0.shF[0] - 180, J0.shF[1] - 10]; zflip = c.flip; }
  else if (t >= tHit && t < t5 + 0.2) { const u = clamp((t - tHit) / 0.45); zp = K.zombiePose(zch, cartX + 60, top4, t, { still: true }); zflip = true; zpiv = [cartX + 140, top4]; zrot = ease(u) * 1.25; }
  // second infected chases up during "So can they"
  const jch = K.ZB.jogger; let jp = null, jflip = false;
  if (t > t6 - 0.2) { const c = climb(t, [[t6 - 0.2, t6 + 1.5, 4], [t6 + 1.5, t6 + 2.6, 5]], jch); jp = Object.assign(c.pose, { lean: 0.38 }); const J0 = R.solve(jch.S, jp); jp.near = [J0.shN[0] - 180, J0.shN[1] - 20]; jp.far = [J0.shF[0] - 170, J0.shF[1] - 40]; jflip = c.flip; }
  // the cart on landing 4, shoved left into the bottom of flight 4
  // the can: falls from landing 5 and rolls down flight 4, across landing 4 and down flight 3
  const canP = (() => { const u = t - tCl; if (u < 0) return [ST.xL - 30, lvl(5)]; const d = u * 650;
    if (d < ST.fl) return [ST.xL + d, lvl(5) + d / ST.fl * ST.FH - Math.abs(Math.sin(d / ST.run * Math.PI)) * 22];
    return [ST.xR + Math.min(d - ST.fl, 140) , top4]; })();
  // camera: follows the hero; tilts for the can / shadow / lunge
  const hp = [hpose.x, hpose.ground - 300];
  const follow = (tt, z, dy = 0) => [tt, hp[0], hp[1] + dy, z];
  const keys = [[t0, ST.xR + 100, lvl(0) - 250, 1.3], [t0 + 0.4, ST.xL + 200, lvl(1) - 260, 1.1, 'm', 5.5], [wGary - 0.1, ST.xL - 260, lvl(2) - 260, 1.5, 's'], [wGary + 0.4, ST.xL - 260, lvl(2) - 230, 1.9, 'm', 2],
    [t2, ST.xR - 60, lvl(2) - 320, 2.2, 's'], [t3, ST.xR - 100, lvl(3) - 300, 1.15, 'm', 6.5], [tCl, ST.xR + 150, lvl(4) - 330, 1.6, 's'], [tCl + 0.4, ST.xL + 300, lvl(4) - 170, 1.2, 'm', 1.0],
    [t4, ST.xL - 80, lvl(5) - 300, 1.7, 'm', 1.0], [tLu, ST.xR - 60, lvl(4) - 320, 1.25, 's'], [tHit + 0.35, ST.xR - 100, lvl(4) - 260, 1.25]];
  if (t >= t5) { const mid = jp ? [(hpose.x + jp.x) / 2, (hpose.ground + jp.ground) / 2] : [hpose.x, hpose.ground]; keys.push([t5, mid[0], mid[1] - 260, jp ? 0.8 : 1.15, 'cut']); }
  ctx.save(); cam(ctx, t, keys);
  if (win(t, tHit, tHit + 0.45)) shake(ctx, t, 18);
  SE.stairwell(ctx, t, { graffiti: { 2: 1, 4: 1 } });
  // shadow on the wall above
  if (t > t4 - 0.3 && t < tz0) { ctx.save(); ctx.globalAlpha = 0.45; ctx.translate(ST.xL - 300, lvl(5)); ctx.scale(1.6, 1.4); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(0, -360, 50, 0, 7); ctx.fill(); ctx.fillRect(-45, -320, 90, 200); ctx.lineWidth = 30; ctx.strokeStyle = '#111'; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-30, -290); ctx.lineTo(-150, -280 + Math.sin(t * 4) * 10); ctx.stroke(); ctx.restore(); }
  SE.ITEMS.can(ctx, canP[0], canP[1], 1.3);
  if (t < t5 + 0.2) SE.cartDraw(ctx, cartX, top4, [], { tilt: cartTilt });
  const holdBat = c => {};
  if (zp) { const draw = () => K.person(ctx, zch, { pose: zp, flip: zflip, e: K.ZFACE(t, 2, { eyes: 'wide' }), t, seed: 2 }, 'stair z'); if (zpiv) { ctx.save(); ctx.translate(...zpiv); ctx.rotate(zrot); ctx.translate(-zpiv[0], -zpiv[1]); draw(); ctx.restore(); } else draw(); }
  if (jp) K.person(ctx, jch, { pose: jp, flip: jflip, e: K.ZFACE(t, 4, { eyes: 'wide' }), t, seed: 4 }, 'stair j');
  // hero (pushes the cart with both hands at the lunge)
  let ex, grips = {};
  if (t < wGary) ex = { eyes: 'half', brow: 'flat', mouth: 'flat', look: [-0.8, -0.3] };
  else if (t < t3) ex = C.talk(TL, 'd4_02', t, { eyes: 'half', brow: 'flat', mouth: 'frown', look: [-0.9, -0.2] });
  else if (t < tCl) ex = { eyes: 'open', brow: 'neutral', mouth: 'flat', look: [-0.8, -0.3], sweat: t > w('d4_03', 'cats') };
  else if (t < t4) ex = { eyes: 'wide', brow: 'up', mouth: 'o', look: [0.6, 0.6] };
  else if (t < tLu) ex = { eyes: 'tiny', brow: 'worried', mouth: 'frown', look: [-0.5, -0.9], sweat: 1 };
  else if (t < t5) ex = { eyes: 'wide', brow: 'angry', mouth: 'teeth', look: [-0.9, 0] };
  else ex = { eyes: 'wide', brow: 'worried', mouth: 'wide', open: 0.6, look: [-0.9, -0.3], sweat: 1 };
  if (t > tLu + 0.05 && t < tLu + 0.55) { const J0 = R.solve(K.HERO.S, hpose); const hx = 2 * hpose.x; grips = { near: [cartX + 196, top4 - 258], far: [cartX + 206, top4 - 252] }; }
  const shouldFlip = hflip;
  if (shouldFlip && grips.near) { /* grips are given in local (mirrored) coordinates already */ }
  A.hero(ctx, { pose: hpose, flip: hflip, grips, e: C.blink(ex, t, 0.4), t, pack: true, radio: true, bat: 'hang' });
  ctx.restore();
  if (t > tCl && t < tCl + 0.7) C.sfxWord(ctx, t, tCl, 'CLANG!', 1300, 240, { size: 120 });
  return {};
}
// --------------------------------------------------------------- roof
function roofScene(ctx, t, TL) {
  const s = TL.s, e = TL.e, w = TL.w;
  const tRd = s('d4_roofdoor'), tSi = s('d4_silence'), t7 = s('d4_07'), t8 = s('d4_08'), t9 = s('d4_09'), t10 = s('d4_10'), tCr = s('d4_crackle'), t11 = s('d4_11'), t12 = s('d4_12'), t13 = s('d4_13'), t14 = s('d4_14'), t15 = s('d4_15'), tN = s('d4_night');
  const night = t >= tN;
  // hero blocking
  let hx, pose, flip = false, grips = {}, ex;
  const out = kf([[tRd, 2515], [tRd + 0.5, 2300]], t);
  if (t < t8 - 0.3) { hx = t < tRd + 1.0 ? out : kf([[tRd + 1.0, 2300], [tRd + 1.4, 2470]], t); pose = { x: hx, ground: F, walk: { w: 1, u: Math.abs(hx - 2515) / 110, stride: 110 }, lean: t < tRd + 0.5 ? 0.3 : 0.1 }; flip = t > tRd + 0.6 && t < tSi + 0.3;
    if (t > tRd + 1.35 && t < tSi + 0.2) { grips = { near: [2 * hx - 2540, F - 210], far: [2 * hx - 2480, F - 200] }; } }
  else if (t < t9) { const wp = A.walkPath(t, [[t8 - 0.3, 2470], [t8 + 1.2, -60], [t8 + 2.6, -60], [t8 + 3.0, 60]], 110); hx = wp.x; pose = { x: hx, ground: F, walk: wp.walk, lean: t > t8 + 2.4 ? -0.15 : 0.05 }; flip = t > t8 + 2.6; }
  else if (t < tN) { hx = 900; pose = { x: hx, ground: F, crouch: 0.55, lean: 0.35 }; if (t < tCr) { const J0 = R.solve(K.HERO.S, pose); grips = { near: [J0.shN[0] - 100, F - 160] }; } else { pose.crouch = 0.3; pose.lean = 0.0; pose.tilt = t > tCr && t < t12 + 4 ? 0.25 : 0; } }
  else { hx = 1440; pose = A.sitPose(hx, F, { lean: -0.12, tilt: 0.35 }); }
  if (t < tRd + 0.5) ex = { eyes: 'wide', brow: 'worried', mouth: 'wide', open: 0.6, sweat: 1 };
  else if (t < t7) ex = { eyes: 'closed', brow: 'worried', mouth: 'wide', open: 0.3 + 0.2 * Math.sin(t * 9), sweat: 1 };
  else if (t < t8) ex = { eyes: 'open', brow: 'up', mouth: 'o', look: [-0.8, -0.2] };
  else if (t < t8 + 2.6) ex = { eyes: 'open', brow: 'neutral', mouth: 'flat', look: [-0.9, 0.6] };
  else if (t < t9) ex = { eyes: 'tiny', brow: 'worried', mouth: 'frown', look: [-0.9, 0.8], sweat: 1 };
  else if (t < tCr) ex = C.talk(TL, 'd4_10', t, { eyes: 'half', brow: 'flat', mouth: 'flat', look: t > t10 ? [0.9, 0] : [-0.5, 0.8] });
  else if (t < t12 + 3) ex = { eyes: 'wide', brow: 'up', mouth: 'smile', look: [0.3, 0.6] };
  else if (t < t13) ex = { eyes: 'half', brow: 'worried', mouth: 'frown', look: [0.3, 0.6] };
  else if (t < t14) ex = { eyes: 'open', brow: 'skeptic', mouth: 'flat', look: [0.9, 0], sweat: t > w('d4_13', 'unusual') };
  else if (t < tN) ex = { eyes: t < t15 ? 'wide' : 'half', brow: t < t15 ? 'up' : 'flat', mouth: t < t15 ? 'o' : 'frown', look: [0.9, 0] };
  else ex = { eyes: 'closed', mouth: 'o', open: 0.15 };
  // camera
  const edgeX = SE.EDGE;
  const keys = [[tRd, 2450, 560, 1.25], [tRd + 0.7, 2420, 600, 1.4, 'm', 1.2], [tSi, 2400, 520, 1.9, 's'], [t7, 2400, 520, 1.9], [t7 + 0.25, 1300, 380, 0.42, 'm', 1.6], [t8, 1700, 560, 1.15, 's'], [t8 + 0.2, 0, 560, 1.15, 'm', 1.2], [t8 + 1.5, -350, 1300, 0.75, 'm', 0.8], [t8 + 2.3, -840, SE.STREET - 250, 1.1, 'm', 0.7],
    [t9, 860, 720, 1.7, 'cut'], [t10, 840, 560, 2.3, 's'], [tCr, 900, 600, 1.5, 's'], [t11, 850, 560, 1.9, 'm', 2.5], [t12, 850, 540, 2.4, 'm', 8], [t13, 900, 560, 1.6, 's'], [t14, 2300, 560, 1.15, 'w'], [t15, 1100, 560, 1.4, 's'],
    [tN, 1700, 520, 1.1, 'cut'], [tN + 1.2, 1640, 520, 1.45, 'm', 2.0]];
  ctx.save(); cam(ctx, t, keys);
  const bang = (t > tRd + 1.5 && t < tSi + 0.8 && Math.floor(t * 3) % 2 === 0) || (t > t14 && t < t15 && Math.floor(t * 4) % 3 === 0);
  if (win(t, tRd, tRd + 0.3)) shake(ctx, t, 10);
  const ventEyes = night ? clamp((t - tN - 1.4) / 0.4) * (1 - clamp((t - tN - 2.9) / 0.3)) : 0, clang = night && win(t, tN + 1.0, tN + 1.4);
  SE.roof(ctx, t, night ? 'night' : 'day', { doorOpen: t < tRd + 0.9, pipe: t > tRd + 1.2, doorShake: bang ? Math.sin(t * 80) * 5 : 0, pipeRattle: bang ? Math.sin(t * 70) * 4 : 0, heli: !night && t > t7, ventEyes, ductShake: clang ? Math.sin(t * 90) * 6 : 0, par: t > t7 ? (t - t7) * 20 : 0 });
  // infected on the street; one looks up
  for (let i = 0; i < 5; i++) { const ch = [K.ZB.office, K.ZB.jogger, K.ZB.big][i % 3], x = -2100 + i * 420 + Math.sin(t * 0.6 + i) * 30, lookUp = i === 3 && t > t8 + 2.8;
    K.person(ctx, ch, { pose: Object.assign(K.zombiePose(ch, x, SE.STREET, t + i, { u: (x + 2000) / 70, seed: i, still: lookUp }), lookUp ? { tilt: -0.55, lean: 0.05 } : {}), e: K.ZFACE(t, i, lookUp ? { eyes: 'wide', look: [-0.3, -1] } : {}), t, seed: i, flip: i === 1 }, 'roof street z'); }
  // supplies laid out on the roof
  if (t >= t9 && t < tN) { const pop = k => back(clamp((t - w('d4_09', k) + 0.05) / 0.25));
    ctx.save(); const p1 = pop('One'); if (p1 > 0) { ctx.translate(780, F); ctx.scale(p1, p1); SE.ITEMS.can(ctx, 0, 0, 0.9); } ctx.restore();
    ctx.save(); const p2 = pop('Half'); if (p2 > 0) { ctx.translate(700, F); ctx.scale(p2, p2); SE.ITEMS.water(ctx, 0, 0, 0.8); ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.fillRect(-16, -96, 32, 44); } ctx.restore();
    ctx.save(); const p3 = pop('batteries'); if (p3 > 0) { ctx.translate(620, F); ctx.scale(p3, p3); SE.ITEMS.battery(ctx, 0, 0, 0.7); } ctx.restore();
    if (t > w('d4_09', 'flashlight') && t < t10 + 1) { const u = back(clamp((t - w('d4_09', 'flashlight')) / 0.3)); ctx.save(); ctx.translate(620, F - 330); ctx.scale(u, u); SE.rr(ctx, -110, -70, 220, 140, 40, '#fbf8ee');
      for (const [x, y, r] of [[-30, 90, 14], [-50, 120, 9]]) R.paint(ctx, S, c => c.arc(x, y, r, 0, 7), '#fbf8ee');
      ctx.fillStyle = 'rgba(255,230,120,0.7)'; ctx.beginPath(); ctx.moveTo(40, -16); ctx.lineTo(100, -50); ctx.lineTo(100, 50); ctx.lineTo(40, 16); ctx.fill(); R.paint(ctx, S, c => c.roundRect(-80, -16, 90, 32, 8), '#3f62b0'); R.paint(ctx, S, c => { c.moveTo(10, -20); c.lineTo(42, -30); c.lineTo(42, 30); c.lineTo(10, 20); c.closePath(); }, '#c9cfd6'); R.line(ctx, [[-80, -50], [80, 50]], 12, '#d6413a'); R.line(ctx, [[-80, 50], [80, -50]], 12, '#d6413a'); ctx.restore(); } }
  if (t >= t9 && t < tN) A.packFloor(ctx, 1000, F, { open: true });
  // radio: hero takes the walkie off the strap and holds it up
  const radioOn = (t > tCr && t < t12) || (t > t13 && t < t14);
  let holdR = null;
  if (t > tCr + 0.3 && t < tN) { const J0 = R.solve(K.HERO.S, pose), rp = [J0.head[0] - 140, J0.head[1] + 60]; grips = { near: [rp[0] + 10, rp[1] + 40] };
    holdR = c => { R.paint(c, S, q => q.rect(rp[0] + 4, rp[1] - 70, 8, 40), '#222'); R.paint(c, S, q => q.roundRect(rp[0] - 22, rp[1] - 36, 48, 76, 8), '#2f3136'); c.fillStyle = radioOn && Math.floor(t * 8) % 2 ? '#ff4b3a' : '#5a2a28'; c.beginPath(); c.arc(rp[0] + 12, rp[1] - 22, 6, 0, 7); c.fill(); c.fillStyle = '#6e737c'; for (let i = 0; i < 4; i++) c.fillRect(rp[0] - 12, rp[1] - 6 + i * 9, 30, 4);
      if (radioOn) { c.save(); c.strokeStyle = 'rgba(185,242,124,0.8)'; c.lineWidth = 4; for (let i = 1; i <= 3; i++) { const r = ((t * 2 + i / 3) % 1) * 60 + 20; c.globalAlpha = 1 - r / 80; c.beginPath(); c.arc(rp[0], rp[1] - 10, r, -2.4, -0.8); c.stroke(); } c.restore(); } }; }
  if (t >= t9) P.drawBat(ctx, S, P.bat(t < tN ? [1080, F - 8] : [1250, F - 8], -0.08, 240));
  A.hero(ctx, { pose, flip, grips, e: C.blink(ex, t, 0.8), t, pack: t < t9 || t >= tN, radio: t < tCr, radioOn, holdNear: holdR, bat: t < t9 && !grips.near ? 'hang' : null });
  if (night) { SE.aptNight; ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = '#7f86b8'; ctx.fillRect(-3000, -3000, 9000, 9000); ctx.restore(); }
  ctx.restore();
  if (clang) C.sfxWord(ctx, t, tN + 1.0, 'CLANG.', 1180, 240, { size: 100, col: '#c9d2da' });
  if (t > t14 && t < t14 + 1.0) A.knockFx(ctx, t, t14 + 0.1, 1250, 240, 'BANG BANG');
  return {};
}
const capTop = (t, TL) => (t > TL.w('d4_01', 'apartment') - 0.1 && t < TL.w('d4_01', 'streets') - 0.1) || (t > TL.s('d4_08') + 2.2 && t < TL.s('d4_09')) || (t > TL.s('d4_09') && t < TL.s('d4_10'));
const cues = TL => { const s = TL.s, w = TL.w; return [['../sfx/drone', s('d4_01'), 0.2], ['../ep01/sfx/hiss', w('d4_01', 'cat'), 0.5], ['sfx/growl', w('d4_01', 'streets'), 0.45], ['sfx/spray', w('d4_01', 'building'), 0.5], ['sfx/sting', w('d4_01', 'Gary'), 0.3],
  ['sfx/clang', s('d4_clang'), 0.9], ['sfx/canroll', s('d4_clang') + 0.1, 0.8], ['sfx/riser', s('d4_04') - 0.2, 0.4], ['sfx/growl', s('d4_04') + 0.4, 0.8], ['sfx/growl', s('d4_lunge') + 0.1, 0.9],
  ['../ep01/sfx/whoosh', s('d4_lunge'), 0.5], ['sfx/crash', s('d4_lunge') + 0.45, 0.9], ['sfx/hit', s('d4_lunge') + 0.5, 0.6], ['../ep01/sfx/run', s('d4_05'), 0.6], ['sfx/growl', s('d4_06') + 0.2, 0.7], ['../ep01/sfx/run', s('d4_06') + 0.5, 0.5],
  ['sfx/metaldoor', s('d4_roofdoor') + 0.85, 0.9], ['sfx/breath', s('d4_roofdoor') + 0.9, 0.6], ['../sfx/bang', s('d4_roofdoor') + 1.5, 0.4], ['sfx/wind', s('d4_silence'), 0.5], ['sfx/wind', s('d4_silence') + 9.5, 0.5],
  ['sfx/hit', s('d4_07') + 0.2, 0.4], ['sfx/growl', s('d4_08') + 3.6, 0.4], ['../ep01/sfx/pop', w('d4_09', 'One'), 0.6], ['../ep01/sfx/pop', w('d4_09', 'Half'), 0.6], ['../ep01/sfx/pop', w('d4_09', 'batteries'), 0.6], ['../ep01/sfx/pop', w('d4_09', 'flashlight'), 0.5],
  ['sfx/radio', s('d4_crackle'), 0.8], ['sfx/radio', s('d4_11') + 2.5, 0.35], ['sfx/radio', s('d4_13') - 0.3, 0.6], ['../sfx/bang', s('d4_14'), 0.5], ['../sfx/bang', s('d4_14') + 0.6, 0.4],
  ['sfx/tick', s('d4_night'), 0.2], ['sfx/clang', s('d4_night') + 1.0, 0.9], ['sfx/meow', s('d4_night') + 1.8, 0.35], ['sfx/slamdoor', s('d4_card'), 0.55]]; };
const music = TL => [['sfx/music3', TL.s('d4_01'), TL.s('d4_clang'), 0.18], ['sfx/music4', TL.s('d4_lunge') + 0.4, TL.s('d4_roofdoor') + 0.6, 0.3], ['../ep01/sfx/music', TL.s('d4_09'), TL.s('d4_crackle'), 0.2], ['sfx/musicbox', TL.s('d4_11'), TL.s('d4_14'), 0.18]];
module.exports = { draw, capTop, cues, music };
