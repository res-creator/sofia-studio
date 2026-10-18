// DAY 5 — dawn on the roof, Mr. Whiskers came through the vent, the bite, the unicorn band-aid, Sarah in the stairwell, the hesitation, the duck saves the day again.
const C = require('../lib/core'), K = require('../lib/cast'), SE = require('../lib/sets'), A = require('../lib/act');
const { clamp, lerp, kf, ease, back, cam, shake, win, hash } = C, F = SE.FLOOR, R = K.R, P = K.P, S = K.D2, ST = SE.ST;
const lvl = k => ST.y0 - k * ST.FH;
function draw(ctx, t, TL) {
  const s = TL.s, B = TL.blocks.day5;
  if (t >= s('d5_card')) { C.dayCard(ctx, t, s('d5_card'), B.t1, 'DAY 5 — ALMOST SURVIVED', null); return { noCaps: true }; }
  if (t >= s('d5_18')) return tech(ctx, t, TL);
  if (t >= s('d5_12') + 1.0) return well(ctx, t, TL);
  if (t >= s('d5_07') && t < s('d5_after')) return biteInsert(ctx, t, TL);
  return roof(ctx, t, TL);
}
const GRAY = (t, TL) => clamp((t - TL.s('d5_07')) / 40) * 0.12;
// --------------------------------------------------------------- roof
function roof(ctx, t, TL) {
  const s = TL.s, e = TL.e, w = TL.w, t0 = TL.blocks.day5.t0;
  const t1 = s('d5_01'), t2 = s('d5_02'), t3 = s('d5_03'), t4 = s('d5_04'), t5 = s('d5_05'), t6 = s('d5_06'), tL = s('d5_lunge'), tA = s('d5_after'), t8 = s('d5_08'), t9 = s('d5_09'), t10 = s('d5_10'), t11 = s('d5_11'), tSt = s('d5_stamp'), t12 = s('d5_12');
  // evacuation point insert: the parking garage with a green flare
  const wEv = w('d5_01', 'evacuation'), wAll = w('d5_02', 'All');
  if (t >= wEv - 0.1 && t < e('d5_01') + 0.2) { ctx.save(); cam(ctx, t, [[wEv - 0.1, 400, 300, 0.7], [wEv + 0.1, 600, 280, 0.8, 'm', 2.5]]); SE.sky(ctx, 'dawn', t); SE.city(ctx, t, 'dawn');
    SE.rr(ctx, 380, F - 520, 560, 440, 6, '#8d8a84'); for (let y = F - 480; y < F - 100; y += 90) SE.rect(ctx, 400, y, 520, 22, '#6d6a66');
    C.outlined(ctx, 'EVAC', 650, F - 580, 90, '#3fae63', { lw: 14 }); for (let i = 0; i < 8; i++) { const yy = F - 560 - i * 70 - (t * 40 % 70); ctx.fillStyle = `rgba(120,255,140,${0.35 - i * 0.04})`; ctx.beginPath(); ctx.arc(900 + Math.sin(t + i) * 20, yy, 30 + i * 8, 0, 7); ctx.fill(); }
    C.glow(ctx, 900, F - 540, 200, 'rgba(120,255,140,0.5)'); ctx.restore(); return {}; }
  // hero blocking
  let hx, pose, flip = false, grips = {}, ex, batMode = null, near = null;
  const wake = clamp((t - t0 - 0.3) / 0.8);
  if (t < t1 + 1.5) { hx = 1440; pose = A.sitPose(hx, F, { lean: -0.12, tilt: lerp(0.35, 0, wake) }); }
  else if (t < t2 + 0.2) { hx = 1440; pose = { x: hx, ground: F, crouch: 0.05 }; const J0 = R.solve(K.HERO.S, pose); grips.near = [J0.head[0] - 110, J0.head[1] - 20 + (t > w('d5_01', 'food') ? 160 : 0)]; }
  else { const wp = A.walkPath(t, [[t2 + 0.2, 1440], [t2 + 2.6, 2150]], 100); hx = wp.x; pose = { x: hx, ground: F, walk: wp.walk, lean: 0.05 }; flip = t < t3 - 0.3; }
  if (t > t3 - 0.3) { pose.lean = t > t5 ? -0.08 : 0.05; if (t > tL + 0.2) { pose.lean = -0.2; pose.crouch = 0.15; } }
  // bat in both hands (guard) from "We can talk", dropped at the lunge
  const J0 = R.solve(K.HERO.S, pose);
  let bat = null, batFloor = null;
  if (t > t3 && t < tL + 0.1) { bat = P.bat([J0.shN[0] - 26, J0.shN[1] + 80], -2.15 + Math.sin(t * 7) * 0.05, 250); grips = { near: bat.high, far: bat.low }; }
  else if (t >= tL + 0.1) { const u = clamp((t - tL - 0.1) / 0.35); batFloor = { K: [lerp(J0.shN[0] - 26, 1900, u), lerp(J0.shN[1] + 80, F - 12, ease(u))], a: lerp(-2.15, -0.05 + Math.PI, u) }; }
  else if (t > t2 + 0.2) batMode = 'hang';
  // after the bite: arm raised, looking at it; band-aid on it later
  const armUp = t >= tA && t < tSt + 1.4;
  if (armUp && t < t9 + 0.4 || (t > t11 && t < tSt + 1.4)) { grips.near = [J0.head[0] - 150, J0.head[1] + 140]; }
  const kneel = t >= t9 + 0.4 && t < t11; if (kneel) { pose.crouch = 0.6; pose.lean = 0.35; const J1 = R.solve(K.HERO.S, pose); grips = { near: [J1.shN[0] - 140, F - 190], far: [J1.shN[0] - 110, F - 190] }; }
  const band = t > t11 + 1.2;
  // expressions
  if (t < t0 + 0.6) ex = { eyes: 'closed', mouth: 'o', open: 0.15 };
  else if (t < t2) ex = { eyes: 'half', brow: 'flat', mouth: 'flat', look: [-0.6, -0.4] };
  else if (t < t3 - 0.4) ex = { eyes: 'open', brow: 'neutral', mouth: 'smile', look: [0.9, 0] };
  else if (t < t4) ex = C.talk(TL, 'd5_03', t, { eyes: 'wide', brow: 'up', mouth: 'o', look: [-0.9, 0] });
  else if (t < t5) ex = { eyes: 'open', brow: 'worried', mouth: 'frown', look: [-0.9, 0.2], sweat: 1 };
  else if (t < tL) ex = C.talk(TL, 'd5_05', t, { eyes: 'open', brow: 'worried', mouth: 'smile', look: [-0.9, 0.3], sweat: 1 });
  else if (t < t8) ex = { eyes: 'tiny', brow: 'worried', mouth: 'wide', open: 0.7, look: [-0.6, 0.5], sweat: 1 };
  else if (t < t9 + 0.4) ex = { eyes: 'open', brow: 'worried', mouth: 'frown', look: [-0.9, 0.6] };
  else if (t < t10) ex = { eyes: 'open', brow: 'up', mouth: 'flat', look: [-0.8, 0.9] };
  else if (t < t11) ex = C.talk(TL, 'd5_10', t, { eyes: 'half', brow: 'flat', mouth: 'flat', look: [0.9, 0] });
  else if (t < t12) ex = { eyes: 'half', brow: 'skeptic', mouth: 'smirk', look: [-0.8, 0.6] };
  else ex = { eyes: 'wide', brow: 'up', mouth: 'o', look: [0.9, 0] };
  // the cat: steps out from behind the vent unit, stalks, lunges, runs back into the vent
  let cat = null;
  if (t > t2 + 2.0 && t < tA + 0.8) { let cx = kf([[t2 + 2.0, 1960], [t3, 1880], [t6, 1800]], t), cg = F, cp = 'stalk', o = { eye: '#ff3b30', glow: true, angry: true, mouth: t > t4 ? 'hiss' : 'closed', u: cx / 90, gray: 0.35 };
    if (t > t6 + 0.3) { cp = 'hiss'; o.puff = 0.6; }
    if (t > tL) { const u = clamp((t - tL) / 0.45); cx = lerp(1800, J0.wN[0] + 20, u); cg = lerp(F, J0.wN[1] + 80, u) - Math.sin(u * Math.PI) * 120; cp = 'pounce'; }
    if (t > tA - 0.1) { const u = clamp((t - tA + 0.1) / 0.7); cx = lerp(2000, 1700, u); cg = F; cp = 'run'; o.u = u * 4; }
    cat = { x: cx, g: cg, pose: cp, o, flip: t < tA - 0.1 }; }
  // camera
  const keys = [[t0, 1500, 600, 1.4], [t1, 1450, 560, 1.15, 'm', 2], [w('d5_01', 'water') - 0.1, 1350, 420, 2.4, 's'], [w('d5_01', 'food'), 1380, 520, 2.0, 's'],
    [wAll - 0.1, 1700, 560, 1.15], [wAll + 0.4, 2000, 560, 1.2, 'm', 2], [t3 - 0.4, 1900, 650, 1.6, 'w'], [t3 + 0.6, 2120, 430, 2.4, 's'], [t4, 1830, 760, 2.4, 's'], [t5, 2000, 560, 1.4, 's'], [t6, 1800, 720, 2.6, 's'],
    [tL, 2000, 600, 1.5, 's'], [tA, 2050, 560, 1.4], [tA + 0.6, J0.head[0] - 130, J0.head[1] + 140, 3.0, 'm', 0.6], [t9, J0.head[0] - 100, 640, 1.8, 's'], [t9 + 0.5, 1880, 820, 2.8, 'm', 0.6], [t10, J0.head[0] + 20, J0.head[1] + 40, 3.0, 's'],
    [t11, J0.head[0] - 130, J0.head[1] + 140, 3.2, 's'], [tSt, 2100, 560, 1.4, 's'], [t12, 2300, 560, 1.15, 's']];
  ctx.save(); cam(ctx, t, keys);
  SE.roof(ctx, t, 'dawn', { pipe: true });
  if (cat) K.flip(ctx, cat.x, cat.flip, () => K.cat(ctx, cat.x, cat.g, 0.62, t, cat.pose, cat.o));
  if (batFloor) P.drawBat(ctx, S, P.bat(batFloor.K, batFloor.a, 250));
  if (t < t2 + 0.2 && t > t1) { /* empty bottle in the hand, can on the floor */ SE.ITEMS.can(ctx, 1300, F, 0.9); }
  // first aid kit on the floor
  if (t > t9 + 0.3 && t < t12) { SE.aidKit(ctx, 1880, F - 60, 0.6, clamp((t - t9 - 0.4) / 0.4)); if (t < t11 + 0.8) SE.bandaid(ctx, 1880, F - 70, 0.5, 0.1); }
  const bandFront = band ? (c, J) => { const p = [lerp(J.eN[0], J.wN[0], 0.55), lerp(J.eN[1], J.wN[1], 0.55)]; SE.bandaid(c, p[0], p[1], 0.32, Math.atan2(J.wN[1] - J.eN[1], J.wN[0] - J.eN[0])); } : null;
  const holdBottle = t > t1 + 1.5 && t < t2 + 0.2 && t < w('d5_01', 'food') ? (c, J) => { c.save(); c.translate(J.wN[0] - 6, J.wN[1] - 40); c.rotate(-2.6); SE.ITEMS.water(c, 0, 60, 0.8); c.restore(); } : null;
  A.hero(ctx, { pose, flip, grips, e: C.blink(ex, t, 0.3), t, pack: true, radio: true, bat: batMode, bite: t > tA - 0.2, biteFresh: 1, gray: GRAY(t, TL), hold: bat ? (c => P.drawBat(c, S, bat)) : null, farFront: !!bat, front: bandFront, holdNear: holdBottle });
  ctx.restore();
  if (t > tSt) C.stamp(ctx, t, tSt + 0.05, 'INFECTION STATUS: UNKNOWN', C.W / 2, 220, { col: '#d6413a', size: 70, t1: t12 + 0.6 });
  if (t > t2 + 2.0 && t < t3) C.sfxWord(ctx, t, t2 + 2.1, 'clang...', 900, 300, { size: 60, col: '#c9d2da', d: 0.8 });
  A.tag(ctx, t, t0 + 0.5, t1 + 2.2, 'DAY 5 · 6:47 AM');
  return {};
}
// the bite: close insert (arm + cat head), red flash, shake
function biteInsert(ctx, t, TL) {
  const s = TL.s, t7 = s('d5_07'), lt = t - t7;
  ctx.save(); C.shake(ctx, t, lt < 0.6 ? 26 : 8);
  const g = ctx.createLinearGradient(0, 0, 0, C.H); g.addColorStop(0, '#f2a87a'); g.addColorStop(1, '#6f6d6a'); ctx.fillStyle = g; ctx.fillRect(-100, -100, C.W + 200, C.H + 200);
  ctx.save(); ctx.translate(C.W / 2, C.H / 2); ctx.scale(1 + lt * 0.03, 1 + lt * 0.03); ctx.translate(-C.W / 2, -C.H / 2);
  // forearm across the frame
  const k = 3.2; R.paint(ctx, S, c => R.cap(c, [-200, 820], [700, 560], 30 * k, 26 * k), K.HERO.C.top);
  R.paint(ctx, S, c => R.cap(c, [640, 580], [1500, 430], 22 * k, 19 * k), K.HERO.C.skin);
  R.paint(ctx, S, c => c.ellipse(1580, 410, 80, 66, -0.2, 0, 7), K.HERO.C.skin);
  
  // cat clamped on it
  ctx.save(); ctx.translate(1290, 600); ctx.rotate(-0.55); K.cat(ctx, 0, 0, 2.2, t, 'pounce', { eye: '#ff3b30', glow: true, angry: true, mouth: 'hiss', gray: 0.35, earsBack: true }); ctx.restore();
  ctx.restore(); ctx.restore();
  C.flash(ctx, 0.5 - lt * 1.5, '255,40,30'); ctx.save(); C.shake(ctx, t, lt < 0.6 ? 26 : 8); ctx.restore();
  C.sfxWord(ctx, t, t7 + 0.02, 'CHOMP!', 420, 260, { size: 150, col: '#ff5a3a', d: 0.8 });
  return { vig: 0.7 };
}
// --------------------------------------------------------------- stairwell (top landing = level 6, right side)
const HX = ST.xR + 140;
function climbAt(t, plan, ch, o = {}) { let cur = plan[0]; for (const p of plan) if (t >= p[0]) cur = p; const [a, b, k, d0 = 0, d1 = 1] = cur; const d = lerp(d0, d1, clamp((t - a) / (b - a))) * ST.fl; return SE.climbPose(ch, k, d, Object.assign({}, o)); }
function well(ctx, t, TL) {
  const s = TL.s, e = TL.e, w = TL.w;
  const t12 = s('d5_12'), t13 = s('d5_13'), t14 = s('d5_14'), t15 = s('d5_15'), tR = s('d5_race'), t16 = s('d5_16'), t17 = s('d5_17'), tT = s('d5_toss'), t18 = s('d5_18');
  // Sarah: climbs flights 3 and 4, trips on flight 5, back up after the toss
  const sPlan = [[t12, t13 + 1.6, 3], [t13 + 1.6, t13 + 2.2, 3, 1, 1], [t14 + 1.0, t14 + 5.5, 4], [t14 + 5.5, t15 + 1.5, 4, 1, 1], [t15 + 1.5, tR + 0.8, 5, 0, 0.45], [tR + 0.8, tT + 1.4, 5, 0.45, 0.45], [tT + 1.4, t18, 5, 0.45, 1]];
  const sc = climbAt(t, sPlan, K.SARAH); const tripped = t > tR + 0.8 && t < tT + 1.4;
  const spose = Object.assign(sc.pose, tripped ? { crouch: 0.7, lean: -0.25, tilt: -0.2 } : { lean: 0.28 });
  // the infected: one flight behind; turn and follow the duck down after the toss
  const Z = [K.ZB.office, K.ZB.jogger, K.ZB.big].map((ch, i) => { const dl = 1.5 + i * 1.5;
    const plan = [[t12 - 2, t13 + dl, 1], [t13 + dl, t14 + 3 + dl, 2], [t14 + 3 + dl, t15 + dl, 3], [t15 + dl, tT + 0.6, 4, 0, 0.4 - i * 0.2]];
    if (t < tT + 0.6 + i * 0.15) { const c = climbAt(t, plan, ch); const p = Object.assign(c.pose, { lean: 0.3 }); const J0 = R.solve(ch.S, p); p.near = [J0.shN[0] - 170, J0.shN[1] + 10 + Math.sin(t * 3 + i) * 10]; p.far = [J0.shF[0] - 160, J0.shF[1] - 10]; return { ch, pose: p, flip: c.flip, i }; }
    const u = t - tT - 0.6 - i * 0.15, d0 = 0.4 - i * 0.2, dd = d0 - u * 1.3;   // descending fast: flight 4 then 3
    const k = dd >= 0 ? 4 : 3, d = (dd >= 0 ? dd : 1 + dd) * ST.fl; const c = SE.climbPose(ch, k, Math.max(0, d), { down: true }); const p = Object.assign(c.pose, { lean: 0.3 }); const J0 = R.solve(ch.S, p); p.near = [J0.shN[0] - 170, J0.shN[1] + 20]; p.far = [J0.shF[0] - 160, J0.shF[1]];
    return { ch, pose: p, flip: c.flip, i }; });
  // duck: from the hero's hand down the stairwell, bouncing flight by flight (squeak at each hit)
  const hops = [[ST.xL + 230, lvl(5) - 150], [ST.xL + 230, lvl(4) - 150], [ST.xL + 230, lvl(3) - 150], [ST.xL + 230, lvl(2) - 150]];
  let duckP = null, duckR = 0;
  const tThrow = tT + 0.45;
  if (t > tThrow) { const u = (t - tThrow) / 0.45, i = Math.floor(u); if (i < hops.length) { const a = i === 0 ? [HX - 130, lvl(6) - 330] : hops[i - 1], b = hops[i], f = u - i; duckP = [lerp(a[0], b[0], f), lerp(a[1], b[1], f) - Math.sin(f * Math.PI) * 90]; duckR = u * 5; } }
  // hero on the top landing
  let pose = { x: HX, ground: lvl(6), lean: 0.22, crouch: 0.05 }, grips = {}, ex, farHand, holdN = null, sleeve = false;
  const J0 = R.solve(K.HERO.S, pose);
  const lookBite = t > t14 + 2.6 && t < t14 + 4.2, pull = t > t14 + 6.0;
  if (lookBite) grips.near = [J0.head[0] - 150, J0.head[1] + 140];
  if (t > t14 + 6.0 && t < t14 + 7.0) grips = { near: [J0.head[0] - 150, J0.head[1] + 150], far: [J0.head[0] - 110 + (t - t14 - 6.0) * 60, J0.head[1] + 150] };
  if (pull && t > t14 + 6.5) sleeve = true;
  let waving = t > t15 && t < tR;
  if (waving) { grips = { near: [J0.shN[0] - 150, J0.shN[1] + 40], far: [J0.head[0] + 10 + Math.sin(t * 13) * 25, J0.head[1] - 110] }; farHand = 'wave'; }
  if (t > t16 && t < t16 + 2.4) { pose.crouch = 0.55; pose.lean = 0.4; const J1 = R.solve(K.HERO.S, pose); grips = { near: [J1.shN[0] - 110 + Math.sin(t * 12) * 15, lvl(6) - 175], far: [J1.shN[0] - 90, lvl(6) - 175] }; }
  let duckHeld = null;
  if (t >= t16 + 2.4 && t < tThrow) { const up = back(clamp((t - t16 - 2.4) / 0.4)); const dp = t < tT ? [J0.head[0] - 150, lerp(lvl(6) - 150, J0.head[1] + 30, up)] : C.A([J0.head[0] - 150, J0.head[1] + 30], [J0.head[0] + 60, J0.head[1] - 120], ease((t - tT) / 0.45)); duckHeld = dp; grips.near = [dp[0] + 26, dp[1] + 36]; }
  if (t < t14) ex = { eyes: 'wide', brow: 'up', mouth: 'o', look: [-0.6, 0.8] };
  else if (t < t14 + 2.6) ex = { eyes: 'open', brow: 'worried', mouth: 'frown', look: [-0.6, 0.8] };
  else if (t < t14 + 4.2) ex = { eyes: 'open', brow: 'worried', mouth: 'flat', look: [-0.7, 0.9] };
  else if (t < t14 + 6.0) ex = { eyes: 'half', brow: 'worried', mouth: 'frown', look: [-0.6, 0.8] };
  else if (t < t15) ex = { eyes: 'open', brow: 'angry', mouth: 'flat', look: [-0.6, 0.8] };
  else if (t < tR) ex = C.talk(TL, 'd5_15', t, { eyes: 'wide', brow: 'up', mouth: 'wide', open: 0.5, look: [-0.6, 0.8] });
  else if (t < t16) ex = { eyes: 'wide', brow: 'worried', mouth: 'frown', look: [-0.6, 0.9], sweat: 1 };
  else if (t < t16 + 2.4) ex = { eyes: 'open', brow: 'worried', mouth: 'flat', look: [-0.5, 1] };
  else if (t < tT) ex = C.talk(TL, 'd5_17', t, { eyes: 'half', brow: 'skeptic', mouth: 'smirk', look: [-0.9, 0] });
  else ex = { eyes: 'happy', brow: 'up', mouth: 'biggrin' };
  // Sarah's face
  const sex = tripped ? { eyes: 'wide', brow: 'worried', mouth: 'wide', open: 0.6, look: [0.8, 0.6], sweat: 1 } : C.talk(TL, ['d5_12', 'd5_13'], t, { eyes: 'wide', brow: 'worried', mouth: 'frown', look: t > t15 ? [-0.5, -0.9] : [-0.9, -0.2], sweat: 1 });
  // camera: high angle over the railing (dutch + foreground rail) / hero close-ups on the top landing
  const sx = spose.x, sy = spose.ground - 260, hh = [HX - 40, lvl(6) - 470];
  const keys = [[t12 + 1.0, ST.xR - 100, lvl(4) - 80, 0.85, 0, 0, 0.08], [t13, ST.xR - 120, lvl(4) - 120, 0.95, 'm', 2.5, 0.08],
    [t14, hh[0], hh[1], 2.4, 'cut'], [t14 + 2.6, J0.head[0] - 140, J0.head[1] + 150, 2.8, 's'], [t14 + 4.2, ST.xR - 160, lvl(4) - 200, 1.0, 'cut', 0, 0.08], [t14 + 6.0, hh[0] - 20, hh[1] + 60, 2.2, 'cut'], [t14 + 7.8, hh[0], hh[1] - 10, 2.8, 'm', 2.0],
    [t15, ST.xR - 60, lvl(5) - 220, 0.9, 's', 0, 0.05], [tR, ST.xR - 100, lvl(5) - 260, 1.0, 's', 0, 0.08], [t16, hh[0] - 40, hh[1] + 120, 2.2, 'cut'], [t16 + 2.4, hh[0] - 60, hh[1], 2.6, 's'],
    [tT + 0.4, ST.xR - 120, lvl(5) - 150, 0.75, 's', 0, 0.06], [tT + 1.4, ST.xR - 120, lvl(5) - 220, 0.8, 'm', 1.0, 0.04]];
  ctx.save(); const cm = cam(ctx, t, keys, { drift: 0.006 });
  SE.stairwell(ctx, t, { graffiti: { 2: 1, 4: 1 } });
  // tech room door on the top landing (open behind the hero)
  SE.rect(ctx, ST.xR + 250, lvl(6) - 330, 180, 330, '#1a1a20'); SE.rect(ctx, ST.xR + 236, lvl(6) - 344, 14, 344, '#efe0c0');
  const high = (t < t14) || (t >= t14 + 4.2 && t < t14 + 6.0) || (t >= t15 && t < t16) || t >= tT + 0.4;
  if (high) for (const z of Z) K.person(ctx, z.ch, { pose: z.pose, flip: z.flip, e: K.ZFACE(t, z.i, { eyes: 'wide' }), t, seed: z.i }, 'well z' + z.i);
  if (high) K.person(ctx, K.SARAH, { pose: spose, flip: tripped ? !sc.flip : sc.flip, e: C.blink(sex, t, 0.6), t, hairSwing: 0.1 }, 'sarah well');
  if (duckP) K.duck(ctx, duckP[0], duckP[1], 0.55, duckR);
  A.hero(ctx, { pose, grips, farHand, farFront: waving, e: C.blink(ex, t, 0.1), t, pack: !(t > t16 && t < t16 + 2.4), bite: true, sleeve, gray: GRAY(t, TL), holdNear: duckHeld ? (c => K.duck(c, duckHeld[0], duckHeld[1], 0.62, Math.sin(t * 3) * 0.1, S, { squash: t > tT && t < tT + 0.2 ? 1 : 0 })) : null,
    front: (c, J) => { if (!sleeve) { const p = [lerp(J.eN[0], J.wN[0], 0.55), lerp(J.eN[1], J.wN[1], 0.55)]; SE.bandaid(c, p[0], p[1], 0.32, Math.atan2(J.wN[1] - J.eN[1], J.wN[0] - J.eN[0])); } } });
  if (t > t16 && t < t16 + 2.4) A.packFloor(ctx, HX - 150, lvl(6), { open: true });
  ctx.restore();
  // foreground railing for the high-angle shots
  if (high) { ctx.save(); ctx.rotate(-0.06); R.line(ctx, [[-100, 70], [C.W + 100, 30]], 46, '#111'); R.line(ctx, [[-100, 70], [C.W + 100, 30]], 30, '#b8352f'); for (let x = 60; x < C.W; x += 200) R.line(ctx, [[x, 60], [x - 30, -60]], 16, '#222'); ctx.restore();
    const v = ctx.createRadialGradient(C.W / 2, C.H / 2, 300, C.W / 2, C.H / 2, 1100); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.55)'); ctx.fillStyle = v; ctx.fillRect(0, 0, C.W, C.H); }
  if (duckP) for (let i = 0; i < 4; i++) { const tb = tThrow + 0.45 * (i + 1); if (t > tb && t < tb + 0.5) C.sfxWord(ctx, t, tb, 'SQUEAK!', 500 + i * 160, 300 + i * 120, { size: 80 - i * 10, d: 0.5 }); }
  if (t > t16 + 2.4 && t < t16 + 3.4) { C.glow(ctx, 900, 500, 500, `rgba(255,240,170,${0.5 * (1 - (t - t16 - 2.4))})`); }
  return {};
}
// --------------------------------------------------------------- tech room: they burst in, the door slams
function tech(ctx, t, TL) {
  const s = TL.s, t18 = s('d5_18');
  const lt = t - t18, open = lt < 1.6;
  ctx.save(); cam(ctx, t, [[t18, 1200, 560, 1.15], [t18 + 1.7, 1450, 560, 1.35, 's'], [t18 + 2.2, 1100, 600, 1.15, 'm', 1.5]]);
  if (win(t, t18 + 1.6, t18 + 1.9)) shake(ctx, t, 14);
  SE.techRoom(ctx, t, { bolt: lt > 1.9 });
  if (open) { ctx.fillStyle = '#16161a'; ctx.fillRect(1370, 200, 340, F - 200); }
  // Sarah then the hero run in from the stairwell door (moving left); the hero turns and slams it
  const sx = kf([[t18, 1560], [t18 + 1.0, 900], [t18 + 2.2, 760]], t), hx = kf([[t18 + 0.4, 1580], [t18 + 1.2, 1300], [t18 + 2.0, 1300], [t18 + 2.8, 1150]], t);
  const sPose = lt < 2.2 ? { x: sx, ground: F, walk: { w: 1, u: (1560 - sx) / 150, stride: 150 }, lean: 0.3 } : A.sitPose(760, F, { lean: lerp(0.1, -0.1, clamp(lt - 2.2)), hop: lerp(60, 150, clamp((lt - 2.2) / 0.3)) });
  K.person(ctx, K.SARAH, { pose: sPose, e: { eyes: lt > 2.4 ? 'closed' : 'wide', brow: 'worried', mouth: 'wide', open: 0.5, sweat: 1 }, t }, 'sarah tech');
  if (lt > 0.4) { const slamming = lt > 1.2 && lt < 2.0; const hPose = lt < 2.8 ? { x: hx, ground: F, walk: { w: 1, u: Math.abs(1580 - hx) / 140, stride: 140 }, lean: slamming ? -0.1 : 0.3 } : A.sitPose(1150, F, { hop: lerp(60, 150, clamp((lt - 2.8) / 0.3)), lean: -0.1 });
    A.hero(ctx, { pose: hPose, flip: slamming, grips: slamming ? { near: [2 * hx - 1400, 560], far: [2 * hx - 1420, 640] } : {}, e: { eyes: lt > 3 ? 'closed' : 'wide', brow: 'worried', mouth: 'wide', open: 0.5, sweat: 1 }, t, pack: true, sleeve: true, bite: true, gray: GRAY(t, TL) }); }
  SE.techGrade(ctx, { col: '#c0c4d4' });
  ctx.restore();
  if (lt > 1.6 && lt < 2.3) C.sfxWord(ctx, t, t18 + 1.6, 'SLAM!', 1350, 260, { size: 120 });
  return {};
}
const capTop = (t, TL) => (t > TL.s('d5_09') + 0.3 && t < TL.s('d5_12')) || (t > TL.s('d5_12') + 1 && t < TL.s('d5_18') && false);
const cues = TL => { const s = TL.s, w = TL.w, tT = s('d5_toss'); const sq = [0, 1, 2, 3].map(i => ['../ep01/sfx/squeak', tT + 0.45 + 0.45 * (i + 1), 0.8 - i * 0.15]);
  return [['sfx/wind', s('d5_wake'), 0.35], ['sfx/wind', s('d5_wake') + 9.5, 0.35], ['sfx/ding', w('d5_01', 'evacuation'), 0.3], ['sfx/clang', s('d5_02') + 2.0, 0.6], ['sfx/sting', s('d5_03') - 0.3, 0.5], ['../ep01/sfx/hiss', s('d5_04') + 0.3, 0.7],
    ['sfx/growl', s('d5_06'), 0.3], ['../ep01/sfx/whoosh', s('d5_lunge'), 0.5], ['sfx/bite', s('d5_07'), 0.95], ['sfx/hit', s('d5_07'), 0.6], ['../sfx/bang', s('d5_lunge') + 0.4, 0.4], ['../ep01/sfx/run', s('d5_after'), 0.4],
    ['sfx/heartbeat', s('d5_08'), 0.5], ['sfx/zip', s('d5_09') + 0.2, 0.5], ['sfx/ding', s('d5_09') + 2.4, 0.4], ['sfx/stamp', s('d5_stamp') + 0.05, 0.7], ['../ep01/sfx/pop', s('d5_11') + 1.2, 0.5],
    ['sfx/growl', s('d5_12') + 1.0, 0.6], ['sfx/growl', s('d5_14') + 4.2, 0.6], ['sfx/heartbeat', s('d5_14'), 0.45], ['sfx/heartbeat', s('d5_14') + 4, 0.45], ['sfx/growl', s('d5_race'), 0.8], ['sfx/thud', s('d5_race') + 0.8, 0.6],
    ['sfx/zip', s('d5_16') + 0.2, 0.5], ['sfx/ding', s('d5_16') + 2.4, 0.6], ['../ep01/sfx/squeak', tT + 0.1, 0.9], ...sq, ['sfx/growl', tT + 1.0, 0.5], ['../ep01/sfx/run', s('d5_18'), 0.6], ['sfx/slamdoor', s('d5_18') + 1.6, 0.9], ['sfx/breath', s('d5_18') + 2.4, 0.5], ['sfx/slamdoor', s('d5_card'), 0.55]]; };
const music = TL => [['../ep01/sfx/music', TL.s('d5_01'), TL.s('d5_03') - 0.3, 0.18], ['sfx/music3', TL.s('d5_12'), TL.s('d5_toss'), 0.26], ['sfx/music4', TL.s('d5_toss') + 0.2, TL.s('d5_card'), 0.24]];
module.exports = { draw, capTop, cues, music };
