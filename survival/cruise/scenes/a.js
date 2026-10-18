// S01–S03: the message on the pool deck, Deck Five, rule number one.
const C = require('../lib/core'), K = require('../lib/cast'), SH = require('../lib/ship'), A = require('../lib/act'), PR = require('../lib/props');
const { clamp, lerp, kf, ease, eout, back, cam, shake, win, hash } = C, F = SH.FLOOR, R = K.R, S = K.D2;
const W8 = K.WAITER;
// passengers: existing bodies with holiday colors
const PAXC = [['#f2c79a', '#3f8fd0', '#e9e4dc', '#5a3418'], ['#c98e66', '#d65a8a', '#2c2f45', '#2a1a14'], ['#e8b48a', '#f0aa22', '#3a3f52', '#c9a24a'], ['#a0704a', '#3fae63', '#e9e4dc', '#1c1412'], ['#f0c8a0', '#e9e4dc', '#3f62b0', '#7a4a2a']];
const PAXS = [K.ZB.office.S, K.SARAH.S, K.ZB.jogger.S, K.ZB.office.S, K.SARAH.S];
const pax = i => ({ S: PAXS[i % 5], C: { skin: PAXC[i % 5][0], top: PAXC[i % 5][1], top2: R.shade(PAXC[i % 5][1], 0.85), pants: PAXC[i % 5][2], shoe: '#3a3028', sole: '#1a1612', hair: PAXC[i % 5][3], lady: i % 5 === 1 || i % 5 === 4 } });
function phoneCU(ctx, t, lit) {   // extreme close-up: a phone lights up in a guest's hand
  ctx.fillStyle = '#05060a'; ctx.fillRect(0, 0, C.W, C.H);
  ctx.save(); ctx.translate(C.W / 2, C.H / 2 + 40); ctx.rotate(-0.08);
  R.paint(ctx, S, c => c.ellipse(-30, 250, 260, 150, 0, 0, 7), '#c98e66'); SH.rr(ctx, -150, -300, 300, 560, 36, '#16181c');
  if (lit > 0) { ctx.globalAlpha = lit; ctx.fillStyle = '#c8302a'; ctx.fillRect(-130, -270, 260, 500); ctx.fillStyle = '#fff'; ctx.font = '40px Anton'; ctx.textAlign = 'center'; ctx.fillText('EMERGENCY', 0, -150); ctx.fillText('ALERT', 0, -100);
    ctx.font = '30px Anton'; ctx.fillText('STAY IN YOUR', 0, 40); ctx.fillText('CABINS', 0, 80); C.glow(ctx, 0, -20, 520, `rgba(255,60,40,${0.35 * lit})`); ctx.globalAlpha = 1; }
  R.paint(ctx, S, c => c.ellipse(140, 120, 50, 90, -0.3, 0, 7), '#c98e66'); ctx.restore();
}
// ------------------------------------------------------------------ S01 pool deck
function s01(ctx, t, TL) {
  const s = TL.s, w = TL.w, t0 = TL.blocks.s01.t0;
  const tSw = s('s01_swarm'), t2 = s('s01_2'), tCh = s('s01_chime'), t3 = s('s01_3'), tCut = s('s01_cut'), t4 = s('s01_4'), tDr = s('s01_drop'), scream = tCut + 1.1;
  if (t < s('s01_1')) { phoneCU(ctx, t, clamp((t - t0 - 0.15) / 0.1)); return { vig: 0.7 }; }
  if (t >= t2 && t < t2 + 1.6) { phoneCU(ctx, t, 1); return { vig: 0.6 }; }   // insert: the alert text
  // hero walks with a tray through the passengers, stops to read a guest's phone
  const wp = A.walkPath(t, [[s('s01_1'), 2300], [tSw + 0.2, 1700]], 100), hx = wp.x;
  const pose = { x: hx, ground: F, walk: wp.walk, lean: 0.03 };
  const J0 = R.solve(W8.S, pose);
  const drop = clamp((t - tDr) / 0.5), trayA = t > t4 + 0.6 ? lerp(0, 0.42, ease(clamp((t - t4 - 0.6) / 0.4))) : 0;
  const tr = PR.tray([J0.shN[0] - 150, J0.shN[1] + 40], trayA);
  // passengers: stand / sit; raise phones on the swarm; look up at the speaker on the chime; run after the scream
  const P = [[400, 0, 0.4], [1050, 1, 0], [1350, 2, 0.1], [1950, 3, 0], [2500, 4, 0.3]];
  const keys = [[s('s01_1'), 1700, 520, 0.62], [s('s01_1') + 0.2, 1650, 540, 0.72, 'm', 4.5], [tSw, 1250, 560, 1.05, 's'], [t2 + 1.6, hx - 80, 420, 1.9, 'cut'],
    [tCh, 1100, 540, 0.7, 'cut'], [t3 + 0.8, 300, 420, 1.2, 'm', tCut - t3 - 0.8], [tCut, 120, 340, 2.3, 's'], [scream, -170, 520, 1.6, 's'], [t4, hx - 90, 420, 2.2, 'cut'], [tDr, hx - 150, 520, 1.25, 's']];
  ctx.save(); cam(ctx, t, keys, { drift: 0.006 }); if (win(t, tDr, tDr + 0.5)) shake(ctx, t, 8);
  SH.poolDeck(ctx, t, { speakerGlow: win(t, tCh, tCut) ? 1 : 0 });
  P.forEach(([px, i, sit], k) => { const ch = pax(i), up = t > tCh && t < scream, run = t > scream + 0.4 + k * 0.12;
    const lit = clamp((t - tSw - k * 0.12) / 0.08) * (t < tDr + 1 ? 1 : 0);
    let pose2 = sit ? A.sitPose(px, F, { hop: 70, footN: [px - 130, F - 12], footF: [px - 100, F - 12] }) : { x: px, ground: F, lean: 0.02, tilt: up ? -0.35 : lit ? 0.25 : 0 };
    let flip = k % 2 === 1; if (run) { const rx = px + (t - scream - 0.4 - k * 0.12) * 520 * (k % 2 ? 1 : -1); pose2 = { x: rx, ground: F, walk: { w: 1, u: Math.abs(rx - px) / 180, stride: 180 }, lean: 0.35, crouch: 0.15 }; flip = k % 2 === 1; }
    const J1 = R.solve(ch.S, pose2), ph = [J1.shN[0] - 70, J1.shN[1] + 60];
    K.person(ctx, ch, { pose: pose2, flip, grips: lit && !run ? { near: ph } : {}, e: { eyes: run ? 'wide' : up ? 'open' : 'half', brow: up || run ? 'worried' : 'neutral', mouth: run ? 'o' : 'flat', look: up ? [-0.3, -0.8] : [-0.5, 0.6], sweat: run }, t,
      holdNear: lit && !run ? c => { SH.rr(c, ph[0] - 16, ph[1] - 26, 32, 52, 6, '#16181c'); c.fillStyle = '#ff5a4a'; c.fillRect(ph[0] - 12, ph[1] - 22, 24, 44); C.glow(c, ph[0], ph[1], 90, 'rgba(255,80,60,0.45)'); } : null }, 'pax'); });
  // hero
  let ex; if (t < tSw) ex = { eyes: 'open', brow: 'neutral', mouth: 'smile', look: [-0.8, 0] };
  else if (t < tCh) ex = { eyes: 'open', brow: 'worried', mouth: 'flat', look: [-0.6, 0.5] };
  else if (t < scream) ex = { eyes: 'open', brow: 'worried', mouth: 'flat', look: [-0.6, -0.7] };
  else if (t < tDr) ex = { eyes: 'wide', brow: 'worried', mouth: 'o', look: [-0.9, 0.1], sweat: 1 };
  else ex = { eyes: 'wide', brow: 'worried', mouth: 'frown', look: [-0.9, 0.3], sweat: 1 };
  const backStep = t > tDr ? kf([[tDr, 0], [tDr + 0.6, 90]], t) : 0;
  pose.x = hx + backStep; if (t > tDr) pose.walk = { w: 1, u: wp.walk.u - backStep / 100, stride: 100 };
  K.person(ctx, W8, { pose, grips: t < tDr + 0.2 ? { near: tr.grip } : {}, e: C.blink(ex, t, 0.3), t, holdNear: t < tDr + 0.2 ? c => PR.drawTray(c, tr, { lost: t > t4 + 0.9 ? 4 : 0 }) : null }, 'waiter');
  if (t >= tDr + 0.2) { const u = clamp((t - tDr - 0.2) / 0.35); PR.drawTray(ctx, PR.tray([tr.c[0] - 40 * u, lerp(tr.c[1], F - 6, u * u)], lerp(0.42, 0.05, u), 0)); }
  if (t > t4 + 0.9) { ctx.save(); ctx.translate(tr.c[0] - 60, tr.c[1] - 40); ctx.scale(1.8, 1.8); PR.shards(ctx, 0, 0, clamp((t - t4 - 0.9) / 0.6), 3); ctx.restore(); }
  if (t > scream) SH.tint(ctx, `rgba(150,140,190,${0.5 * clamp((t - scream) / 2)})`);
  ctx.restore();
  A.dayMark(ctx, t, s('s01_1') + 0.3, tSw - 0.1, 'DAY 1');
  return {};
}
// ------------------------------------------------------------------ S02 Deck Five corridor
const Z3 = [K.ZC.tourist, K.ZC.robe, K.ZC.steward];
function roomCart(ctx, x, plates) { SH.rr(ctx, x, 640, 330, 26, 6, '#e9e4dc'); SH.rect(ctx, x + 10, 666, 310, 160, '#d8d0c0'); for (const wx of [x + 30, x + 300]) R.paint(ctx, S, c => c.arc(wx, F - 14, 14, 0, 7), '#333');
  for (let i = 0; i < plates; i++) { PR.drawPlate(ctx, x + 70 + i * 90, 634, 0.9); R.paint(ctx, S, c => c.arc(x + 70 + i * 90, 618, 26, Math.PI, 0), '#c9cfd6'); } }
function s02(ctx, t, TL) {
  const s = TL.s, w = TL.w, t0 = TL.blocks.s02.t0, tHide = s('s02_hide'), t2 = s('s02_2'), tPl = s('s02_plate'), t3 = s('s02_3'), tSh = s('s02_shadow');
  const clatter = tPl + 0.3, flick = tPl + 1.5, land = flick + 0.5;
  const HX = 520, CART = 640;
  // the infected shamble left towards the cart; after the fork lands they turn and follow it to the right
  const zs = Z3.map((ch, i) => { const startX = 2400 + i * 260; let x = kf([[t0, startX], [clatter, 1500 + i * 230]], t, v => v), flip = false;
    if (t > clatter) x = 1500 + i * 230 - clamp((t - clatter) / 1.0) * 120;   // lurch towards the clatter
    if (t > land + 0.2 + i * 0.15) { flip = true; x = 1380 + i * 230 + (t - land - 0.2 - i * 0.15) * 160; }
    const pose = K.zombiePose(ch, x, F, t + i, { u: Math.abs(startX - x) / 70, seed: i }); if (t > clatter && t < land + 0.2) { pose.lean = 0.42; pose.tilt = -0.2; }
    return { ch, pose, flip, i }; });
  const keys = [[t0, 1500, 520, 0.68], [t0 + 0.2, 1350, 520, 0.72, 'm', 3.5], [tHide, HX - 60, 520, 2.2, 's'], [t2, 900, 540, 1.1, 's'], [clatter, 1520, 420, 1.9, 's'], [clatter + 0.9, HX - 40, 520, 2.0, 's'],
    [flick, 1400, 560, 0.85, 's'], [t3, HX - 50, 500, 2.0, 's'], [tSh, 3200, 500, 0.9, 'm', 1.2]];
  ctx.save(); cam(ctx, t, keys, { drift: 0.006 });
  SH.corridor(ctx, t, { emergency: true });
  // the shadow attack at the far end (shadows on the wall only)
  if (t > tSh - 0.2) { const u = clamp((t - tSh) / 1.2); ctx.save(); ctx.fillStyle = 'rgba(10,6,8,0.6)'; ctx.translate(3700, 0);
    ctx.beginPath(); ctx.ellipse(0, 300, 60, 70, 0, 0, 7); ctx.fill(); ctx.fillRect(-60, 360, 120, 300); ctx.beginPath(); ctx.ellipse(130 - u * 90, 320 - u * 30, 60, 70, 0, 0, 7); ctx.fill(); ctx.fillRect(70 - u * 90, 380 - u * 30, 120, 300); ctx.restore(); }
  roomCart(ctx, CART, t < clatter ? 3 : 2);
  if (t > tPl) { const u = clamp((t - tPl) / 0.3); PR.drawPlate(ctx, lerp(CART + 250, CART + 380, u), lerp(634, F - 8, u * u), 0.9, u * 3); }
  // the fork flies and skitters down the corridor
  if (t > flick && t < land + 1.6) { const u = clamp((t - flick) / 0.5), fx = lerp(HX + 40, 2900, u) + (t > land ? (t - land) * 200 : 0), fy = t < land ? lerp(560, F - 6, u) - Math.sin(u * Math.PI) * 260 : F - 6; PR.drawFork(ctx, fx, fy, u * 12); }
  for (const z of zs) K.person(ctx, z.ch, { pose: z.pose, flip: z.flip, e: K.ZFACE(t, z.i, { eyes: t > clatter && t < land + 0.4 ? 'wide' : 'half' }), t, seed: z.i }, 'z corridor');
  // hero crouched behind the cart; bumps the plate, flicks the fork, exhales
  const flickArm = t > flick - 0.4 && t < flick + 0.15;
  const pose = { x: HX, ground: F, crouch: 0.62, lean: 0.38, tilt: t > t3 ? 0.1 : 0 };
  const J0 = R.solve(W8.S, pose);
  const grips = flickArm ? { near: [J0.shN[0] - 60 + (t - flick + 0.4) * 400, J0.shN[1] - 90] } : t < tPl + 0.1 && t > tPl - 0.4 ? { near: [CART + 40, 620] } : { near: [CART + 10, 650] };
  let ex = t < tPl ? { eyes: 'open', brow: 'worried', mouth: 'flat', look: [-0.9, 0] } : t < flick ? { eyes: 'tiny', brow: 'worried', mouth: 'closed', look: [-0.9, 0], sweat: 1 } : t < t3 ? { eyes: 'squint', brow: 'angry', mouth: 'closed', look: [-0.9, -0.2] } : { eyes: 'half', brow: 'worried', mouth: 'o', open: 0.2, look: [-0.9, 0.2] };
  K.person(ctx, W8, { pose, flip: true, grips: { near: [2 * HX - grips.near[0], grips.near[1]] }, e: C.blink(ex, t, 0.5), t, holdNear: flickArm && t < flick ? (c, J) => PR.drawFork(c, J.wN[0], J.wN[1], -0.6) : null }, 'waiter s02');
  SH.corridorLight(ctx, t, { extra: [{ x: HX, y: 600, r: 380, a: 0.6 }] });
  ctx.restore();
  return {};
}
// ------------------------------------------------------------------ S03 lobby map → lifeboats → crew door
function s03(ctx, t, TL) {
  const s = TL.s, t0 = TL.blocks.s03.t0, t1 = s('s03_1'), tCh = s('s03_chaos'), t2 = s('s03_2'), tD = s('s03_door');
  if (t >= t1 + 0.2 && t < t2) {   // snap zoom out to the lifeboat deck
    ctx.save(); cam(ctx, t, [[t1 + 0.2, 1500, 560, 1.6], [t1 + 0.3, 1500, 600, 0.52, 's'], [tCh - 0.5, 1900, 600, 1.2, 'cut', 0, 0.05], [tCh - 0.4, 1900, 610, 1.45, 'm', 2.2, -0.03]], { drift: 0.006 }); SH.lifeboats(ctx, t); ctx.restore(); return {}; }
  const wp = A.walkPath(t, [[t2, 980], [t2 + 1.6, 60], [tD + 0.3, 60], [tD + 0.9, -40]], 100);
  const HX = t < t2 ? 980 : wp.x;
  const pose = { x: HX, ground: F, walk: t < t2 ? null : wp.walk, lean: 0.04 };
  const fingerT = clamp((t - t0 - 0.2) / 0.8), finger = t < t2 ? C.A([830, 570], [770, 600], ease((t - t0 - 0.4) / 0.7)) : null;
  const pushDoor = t > tD - 0.2 && t < tD + 0.6;
  const keys = [[t0, 760, 470, 1.25], [t0 + 0.2, 720, 500, 1.4, 'm', 1.2], [t2, 500, 520, 1.0, 'cut'], [t2 + 0.2, 300, 540, 1.15, 'm', 1.6], [tD, 40, 380, 2.2, 's']];
  ctx.save(); cam(ctx, t, keys, { drift: 0.006 });
  SH.lobby(ctx, t, { crewOpen: t > tD - 0.1 && t < tD + 1.1 });
  // running legs on the stairs (silhouettes)
  for (let i = 0; i < 6; i++) { const u = ((t * 0.8 + i / 6) % 1), x = 1560 + u * 620, y = F - u * 600; ctx.fillStyle = 'rgba(25,22,30,0.8)'; ctx.fillRect(x, y - 160, 50, 160); ctx.beginPath(); ctx.arc(x + 25, y - 180, 26, 0, 7); ctx.fill(); }
  if (!(t > tD + 0.9)) K.person(ctx, W8, { pose, grips: finger ? { near: finger } : pushDoor ? { near: [150, 600] } : {}, nearHand: finger ? 'open' : 'fist', e: C.blink(t < t2 ? { eyes: 'open', brow: 'worried', mouth: 'flat', look: [-0.9, -0.1] } : { eyes: 'open', brow: 'angry', mouth: 'flat', look: [-0.9, 0] }, t, 0.2), t }, 'waiter s03');
  SH.tint(ctx, '#e0b0a8');
  ctx.restore();
  if (t > tD + 0.9) C.fade(ctx, clamp((t - tD - 0.9) / 0.3));
  return {};
}
const cues = TL => { const s = TL.s; return [
  ['sfx/phones', s('s01_buzz1') + 0.1, 0.35, 0.7], ['sfx/gulls', s('s01_1'), 0.45], ['sfx/phones', s('s01_swarm'), 0.7], ['sfx/pachime', s('s01_chime'), 0.7], ['sfx/paclick', s('s01_cut') - 0.05, 0.6, 0.6], ['sfx/scream', s('s01_cut') + 1.1, 0.6],
  ['sfx/glass', s('s01_4') + 1.1, 0.8], ['../ep1/sfx/crowd', s('s01_drop'), 0.5], ['../ep01/sfx/run', s('s01_drop') + 0.3, 0.5],
  ['sfx/steps', s('s02_1'), 0.5], ['../ep1/sfx/growl', s('s02_1') + 1.5, 0.35], ['../ep1/sfx/heartbeat', s('s02_hide'), 0.45], ['sfx/plate', s('s02_plate') + 0.3, 0.9], ['../ep1/sfx/growl', s('s02_plate') + 0.6, 0.5],
  ['sfx/fork', s('s02_plate') + 2.0, 0.8], ['sfx/steps', s('s02_3'), 0.4], ['sfx/scream', s('s02_shadow') + 0.3, 0.35], ['../ep1/sfx/crowd', s('s02_shadow') + 0.4, 0.3],
  ['../sfx/horn', s('s03_1') + 0.2, 0.5], ['../ep1/sfx/crowd', s('s03_1') + 0.2, 0.6], ['../ep1/sfx/metaldoor', s('s03_door') + 0.9, 0.6]]; };
const music = TL => [['../ep1/sfx/music3', TL.s('s02_1'), TL.s('s02_plate'), 0.18]];
module.exports = { s01, s02, s03, cues, music };
