// DAY 3 — supplies, infected pigeon + rat, Mr. Whiskers chooses violence, the duck saves the day, out of the apartment, GARY WAS HERE :)
const C = require('../lib/core'), K = require('../lib/cast'), SE = require('../lib/sets'), A = require('../lib/act');
const { clamp, lerp, kf, ease, back, cam, shake, win, hash } = C, F = SE.FLOOR, R = K.R, P = K.P, S = K.D2;
const PACK = 1300, SOFA = 2650, SEAT = 712;
function draw(ctx, t, TL) {
  const s = TL.s, B = TL.blocks.day3;
  if (t >= s('d3_card')) { C.dayCard(ctx, t, s('d3_card'), B.t1, 'DAY 3 — SURVIVED', 'APARTMENT LOST'); return { noCaps: true }; }
  if (t >= s('d3_11') - 0.3) return hall(ctx, t, TL);
  return room(ctx, t, TL);
}
function parab(a, b, h, u) { return [lerp(a[0], b[0], u), lerp(a[1], b[1], u) - Math.sin(u * Math.PI) * h]; }
function room(ctx, t, TL) {
  const s = TL.s, e = TL.e, w = TL.w, t0 = TL.blocks.day3.t0;
  const tMeow = s('d3_meow'), t4 = s('d3_04'), t5 = s('d3_05'), t6 = s('d3_06'), t7 = s('d3_07'), tPo = s('d3_pounce'), t8 = s('d3_08'), tSq = s('d3_squeak'), t9 = s('d3_09'), tTh = s('d3_throw'), t10 = s('d3_10');
  // ---- hero blocking: sits at 1600 (facing right) -> walks to the sofa crouched -> stumbles back and falls -> throws -> grabs pack, runs to the door
  let hx, pose, flip = true, ex, grips = {}, holdF = null, runOut = t > t10 + 1.0;
  const tWalk0 = t4 + 0.3, tWalk1 = t5 + 1.0;
  const duckRest = [1730, F - 30];
  // duck flight: squeak in hand -> thrown right -> bounce off the far wall -> lands in the open backpack
  const tThrow = tTh + 0.35, tBounce = tThrow + 0.55, tLand = tBounce + 0.85;
  let duckP = duckRest, duckRot = 0, duckSq = 0, duckVis = true;
  if (t < t8) { // sitting / walking to the cat
    if (t < tWalk0) { hx = 1600; pose = A.sitPose(hx, F, { lean: 0.05, tilt: t > w('d3_02', 'worse') && t < tMeow ? -0.25 : 0 }); pose.footN = [hx - 175, F - 12]; pose.footF = [hx - 150, F - 12]; }
    else { const wp = A.walkPath(t, [[tWalk0, 1640], [tWalk1, 2250]], 80); hx = wp.x; pose = { x: hx, ground: F, walk: wp.walk, crouch: 0.4, lean: 0.25 };
      if (t > t5) { const J0 = R.solve(K.HERO.S, pose); grips.near = [J0.shN[0] - 150, J0.shN[1] + 40]; } }
  } else { // stumble back and fall, then sit and fight with the duck
    const tFall = t8 + 0.9; const sx = kf([[t8, 2250], [tFall, 1650]], t, C.eout);
    hx = sx; const fall = clamp((t - tFall + 0.25) / 0.3);
    if (t < tFall) pose = { x: hx, ground: F, walk: { w: 1, u: (hx - 2250) / 90, stride: 90 }, lean: -0.25, crouch: 0.2 };
    else pose = A.sitPose(hx, F, { lean: lerp(-0.25, 0.02, clamp((t - tFall) / 0.5)), hop: lerp(60, 150, ease(fall)) });
    if (runOut) { const wp = A.walkPath(t, [[t10 + 1.0, 1480], [t10 + 2.4, 520]], 190); hx = wp.x; pose = { x: hx, ground: F, walk: wp.walk, lean: 0.36, crouch: 0.18 }; flip = false; }
    else if (t > t10 + 0.3) { hx = kf([[t10 + 0.3, 1650], [t10 + 0.6, 1480]], t); pose = { x: hx, ground: F, crouch: 0.35, lean: 0.3 }; flip = false; if (t > t10 + 0.6) grips.near = [PACK + 60, F - 150]; }
  }
  const J0 = R.solve(K.HERO.S, pose);
  // hand on the duck (squeak), raise and throw
  if (t > tSq - 0.4 && t < tThrow) { const dp = t < t9 - 0.2 ? duckRest : C.A(duckRest, [2 * hx - (J0.shN[0] - 110), J0.shN[1] + 20], ease((t - t9 + 0.2) / 0.5));
    if (t > tTh) { const u = clamp((t - tTh) / 0.35); duckP = [lerp(dp[0], 2 * hx - (J0.shN[0] + 60), 0), dp[1] - 0]; duckP = C.A(dp, [J0.shN[0] + 80 - 2 * (J0.shN[0] - hx) + 0, J0.shN[1] - 140], 0); }
    else duckP = dp; grips.near = [2 * hx - duckP[0] + 26, duckP[1] + 20]; }
  if (t >= tThrow) { const wall = [3150, F - 420];
    const hand0 = [2 * hx - (J0.shN[0] - 110), J0.shN[1] + 20];
    if (t < tBounce) { const u = (t - tThrow) / (tBounce - tThrow); duckP = parab(hand0, wall, 160, u); duckRot = u * 8; }
    else if (t < tLand) { const u = (t - tBounce) / (tLand - tBounce); duckP = parab(wall, [PACK, F - 170], 420, u); duckRot = 8 + u * 10; duckSq = t < tBounce + 0.08 ? 1 : 0; }
    else duckVis = false; }
  if (t > tSq && t < tSq + 0.25) duckSq = 1 - (t - tSq) / 0.25;
  // ---- cat blocking
  let cat = { x: SOFA + 10, g: SEAT, pose: 'sit', o: { eye: '#9be35a', blink: true }, flip: false, s: 0.62 };
  if (t >= t6 - 0.2) cat.o = { eye: '#ff3b30', glow: true, angry: true };
  if (t >= t7) Object.assign(cat, { pose: 'hiss', o: { eye: '#ff3b30', glow: true, angry: true, mouth: 'hiss', puff: clamp((t - t7) / 0.4) } });
  if (t >= tPo) { const u = clamp((t - tPo) / 0.5); const p = parab([SOFA - 40, SEAT], [2060, F], 260, ease(u)); Object.assign(cat, { x: p[0], g: p[1], pose: u < 1 ? 'pounce' : 'hiss', o: { eye: '#ff3b30', glow: true, angry: true, mouth: 'hiss', puff: 0.6 } }); }
  if (t >= t8 + 0.5) { const cx = kf([[t8 + 0.5, 2060], [tSq, 1930]], t); Object.assign(cat, { x: cx, g: F, pose: 'stalk', o: { eye: '#ff3b30', glow: true, angry: true, mouth: t < tSq ? 'hiss' : 'closed', u: (2060 - cx) / 120 } }); }
  if (t >= tSq) { cat.o.headTilt = kf([[tSq, 0], [tSq + 0.6, 0], [tSq + 1.0, -0.35]], t); cat.o.wide = true; cat.o.look = [-1, 0]; cat.o.angry = t < tSq + 0.5; }
  if (t >= tThrow) { const cx = kf([[tThrow, 1930], [tThrow + 0.75, 2950], [tLand, 2980]], t); Object.assign(cat, { x: cx, pose: t < tThrow + 0.75 ? 'run' : 'sit', flip: t < tLand - 0.1, o: { eye: '#ff3b30', glow: true, u: (cx - 1930) / 200, headTilt: t > tThrow + 0.8 ? 0.3 : 0 } }); }
  if (t >= t10 + 1.0) { const cx = kf([[t10 + 1.0, 2980], [t10 + 2.6, 900]], t); Object.assign(cat, { x: cx, pose: 'run', flip: false, o: { eye: '#ff3b30', glow: true, angry: true, mouth: 'hiss', u: (2980 - cx) / 200 } }); }
  // ---- expressions
  if (t < s('d3_02')) ex = { eyes: 'half', brow: t > w('d3_01', 'neighbors') && t < w('d3_01', 'sugar', true) + 0.5 ? 'skeptic' : 'flat', mouth: 'flat', look: t > w('d3_01', 'neighbors') && t < w('d3_01', 'sugar', true) + 0.5 ? [-0.9, 0] : [0.6, 0.5] };
  else if (t < tMeow) ex = { eyes: 'open', brow: 'worried', mouth: 'frown', look: t > w('d3_03', 'Rats') ? [0.9, 0.3] : [-0.6, -0.8] };
  else if (t < t6) ex = C.talk(TL, ['d3_04', 'd3_05'], t, { eyes: 'open', brow: 'up', mouth: 'smile', look: [-0.9, 0] });
  else if (t < tPo) ex = { eyes: 'open', brow: 'worried', mouth: 'flat', look: [-0.9, 0.1], sweat: t > t7 };
  else if (t < tSq) ex = { eyes: 'tiny', brow: 'worried', mouth: 'wide', open: 1, look: [-0.9, 0], sweat: 1, hairUp: 1 };
  else if (t < t9) ex = { eyes: 'wide', brow: 'up', mouth: 'o', look: [0.4, 0.8] };
  else if (t < tTh) ex = { eyes: 'half', brow: 'skeptic', mouth: 'smirk', look: [-0.9, 0] };
  else if (t < t10 + 1.0) ex = { eyes: 'wide', brow: 'up', mouth: 'grin', look: [-0.9, -0.3] };
  else ex = { eyes: 'wide', brow: 'worried', mouth: 'wide', open: 0.6, look: [-1, 0], sweat: 1 };
  // ---- camera
  const catHead = [cat.x - 80 * cat.s, cat.g - 200 * cat.s];
  const keys = [[t0, 1700, 560, 1.0], [t0 + 0.5, 1650, 600, 1.25, 'm', 6], [s('d3_02'), 1500, 430, 1.4, 'm', 3.5], [w('d3_03', 'Rats') - 0.05, 1130, 820, 2.6, 's'], [w('d3_03', 'Pigeons') - 0.05, 1500, 400, 2.8, 's'],
    [w('d3_03', 'adorable'), 1900, 560, 1.3, 'm', 1.2], [tMeow + 0.15, SOFA + 10, 600, 1.9, 'w'], [t4, 1700, 520, 1.6, 's'], [t5, 2350, 560, 1.3, 'm', 1.5], [t6, catHead[0] - 10, catHead[1] + 10, 3.2, 'm', 1.3], [t7, catHead[0], catHead[1], 3.6, 's'],
    [tPo, 2200, 560, 1.3, 's'], [t8 + 0.6, 1850, 600, 1.15, 'm', 0.6], [tSq, 1560, 820, 2.6, 's'], [tSq + 0.5, 1930, 780, 2.6, 'w'], [t9, 1700, 560, 2.0, 's'], [tTh, 2200, 520, 0.95, 's'], [tBounce, 2300, 520, 0.92, 'm', 0.8],
    [t10, 1500, 600, 1.5, 's'], [t10 + 1.0, 1300, 560, 1.15, 'm', 1.6]];
  ctx.save(); cam(ctx, t, keys);
  if (win(t, tPo + 0.35, tPo + 0.8)) shake(ctx, t, 16); else if (win(t, t8, t8 + 2.6)) shake(ctx, t, 4);
  SE.apartment(ctx, t, { peepCover: true, pigeon: c => { if (t > s('d3_02') + 1.0) K.pigeon(c, 1440 + kf([[s('d3_02') + 1.0, 200], [s('d3_02') + 1.8, 0]], t), 466, 0.75, t); } });
  P.drawChair(ctx, S, P.chair(596, F, -0.17)); SE.chain(ctx, [592, 469]);
  // rat by the fridge
  if (t > w('d3_03', 'Rats') - 0.3 && t < tMeow) { const rx = kf([[w('d3_03', 'Rats') - 0.3, 1050], [w('d3_03', 'Rats') + 0.5, 1180]], t); K.rat(ctx, rx, F, 0.8, t, { u: rx / 60 }); }
  // supplies on the floor + open backpack
  SE.ITEMS.can(ctx, 1830, F, 0.9); SE.ITEMS.water(ctx, 1900, F, 0.7); SE.ITEMS.battery(ctx, 1970, F, 0.6);
  A.packFloor(ctx, PACK, F, { open: t < t10 + 0.5, radio: false });
  if (t < t10 + 0.9) P.drawBat(ctx, S, P.bat([1380, F - 10], -0.05, 240));
  // cat (drawn after the floor props)
  K.flip(ctx, cat.x, cat.flip, () => K.cat(ctx, cat.x, cat.g, cat.s, t, cat.pose, cat.o));
  // hero
  A.hero(ctx, { pose, flip, grips, e: C.blink(ex, t, 0.2), t, pack: runOut, bat: runOut ? 'hang' : null });
  if (duckVis && t < tLand) K.duck(ctx, duckP[0], duckP[1], 0.62, duckRot, S, { squash: duckSq });
  ctx.restore();
  if (t > tSq && t < tSq + 0.7) C.sfxWord(ctx, t, tSq, 'SQUEAK!', 640, 300, { size: 120 });
  if (t > tBounce && t < tBounce + 0.6) C.sfxWord(ctx, t, tBounce, 'BOING!', 1500, 260, { size: 100, col: '#ff8a3a' });
  if (t > tMeow && t < tMeow + 0.8) C.sfxWord(ctx, t, tMeow, 'MEOW.', 1300, 260, { size: 110, col: '#f4efe4', rot: 0.05 });
  if (t > tPo + 0.3 && t < tPo + 0.6) C.speedLines(ctx, t, 0.6);
  A.tag(ctx, t, t0 + 0.2, t0 + 3, 'DAY 3');
  return {};
}
// hallway: hero against the outside of his door, the cat thumping inside, GARY WAS HERE :) above him
function hall(ctx, t, TL) {
  const s = TL.s, w = TL.w, t11 = s('d3_11'), t12 = s('d3_12'), tS2 = s('d3_squeak2'), tRv = s('d3_reveal');
  const slide = clamp((t - t11) / 1.0), thump = Math.floor((t - t11) * 1.4) % 3 === 0 && t < tS2 ? Math.sin(t * 60) * 4 : 0;
  const pose = slide < 1 ? { x: 1010, ground: F, crouch: lerp(0, 0.6, ease(slide)), lean: -0.1 } : A.sitPose(1010, F, { lean: -0.12, footN: [1010 - 175, F - 12], footF: [1010 - 150, F - 12] });
  const keys = [[t11 - 0.3, 980, 720, 1.9], [t11, 990, 730, 2.0, 'm', 4], [tS2, 1040, 740, 2.4, 's'], [tRv, 960, 480, 1.2, 'm', 1.4]];
  ctx.save(); cam(ctx, t, keys); ctx.translate(thump, 0);
  SE.hallway(ctx, t, { heroDoor: true }); SE.graffiti(ctx, 960, 330, 1, 0.95);
  ctx.translate(-thump, 0);
  let ex;
  if (t < t12) ex = { eyes: 'closed', brow: 'worried', mouth: 'wide', open: 0.4 + 0.2 * Math.sin(t * 8), sweat: 1 };
  else if (t < tS2) ex = C.talk(TL, 'd3_12', t, { eyes: 'half', brow: 'up', mouth: 'smile', look: [0.4, 0.4] });
  else if (t < tRv + 0.4) ex = { eyes: 'open', brow: 'up', mouth: 'smile', look: [0.6, 0.9] };
  else ex = { eyes: 'tiny', brow: 'worried', mouth: 'frown', look: [0.2, -1], sweat: 1 };
  A.hero(ctx, { pose: Object.assign(pose, { tilt: t > tRv + 0.4 ? -0.3 : 0 }), e: C.blink(ex, t, 0.9), t, pack: true });
  ctx.restore();
  if (t > tS2 && t < tS2 + 0.7) C.sfxWord(ctx, t, tS2, 'squeak.', 1300, 820, { size: 70, col: '#ffd23f' });
  return {};
}
const capTop = (t, TL) => (t > TL.s('d3_squeak') - 0.2 && t < TL.s('d3_10')) || (t > TL.s('d3_squeak2') && t < TL.s('d3_card'));
const cues = TL => { const s = TL.s, w = TL.w, tTh = s('d3_throw'); return [['../sfx/drone', s('d3_02'), 0.25], ['../ep01/sfx/pigeon', s('d3_02') + 1.0, 0.5], ['../ep01/sfx/rat', w('d3_03', 'Rats') - 0.2, 0.6],
  ['sfx/meow', s('d3_meow') + 0.05, 0.9], ['sfx/riser', s('d3_06'), 0.4], ['../ep01/sfx/hiss', s('d3_07') + 0.1, 0.9], ['sfx/hit', s('d3_pounce') + 0.35, 0.6], ['../ep01/sfx/whoosh', s('d3_pounce'), 0.5],
  ['sfx/thud', s('d3_08') + 0.9, 0.6], ['../ep01/sfx/squeak', s('d3_squeak'), 0.95], ['../ep01/sfx/squeak', tTh + 0.1, 0.8], ['../ep01/sfx/whoosh', tTh + 0.35, 0.4], ['sfx/boing', tTh + 0.9, 0.8],
  ['../ep01/sfx/squeak', tTh + 1.75, 0.5], ['sfx/zip', s('d3_10') + 0.4, 0.6], ['../ep01/sfx/run', s('d3_10') + 1.0, 0.6], ['sfx/slamdoor', s('d3_11') - 0.3, 0.8], ['../ep01/sfx/hiss', s('d3_11') + 0.4, 0.4],
  ['sfx/thud', s('d3_11') + 1.2, 0.5], ['../ep01/sfx/squeak', s('d3_squeak2'), 0.45], ['sfx/sting', s('d3_reveal') + 0.3, 0.55], ['sfx/slamdoor', s('d3_card'), 0.55]]; };
const music = TL => [['../ep01/sfx/music', TL.s('d3_01'), TL.s('d3_meow'), 0.2], ['sfx/music4', TL.s('d3_pounce') + 0.3, TL.s('d3_11') - 0.3, 0.26]];
module.exports = { draw, capTop, cues, music };
