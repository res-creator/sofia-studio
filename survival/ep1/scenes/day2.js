// DAY 2 — 3:12 AM knock, peephole Gary (approved test staging), home security montage, "I can hear you breathing", "Tomorrow?!"
const C = require('../lib/core'), K = require('../lib/cast'), SE = require('../lib/sets'), A = require('../lib/act');
const { clamp, lerp, kf, ease, back, cam, shake, win, hash } = C, F = SE.FLOOR, R = K.R, P = K.P, S = K.D2;
const chairAt = (t, t0) => { const u = ease((t - t0) / 0.8); return P.chair(lerp(650, 596, u), F, lerp(0, -0.17, u)); };
function draw(ctx, t, TL) {
  const s = TL.s, e = TL.e, w = TL.w, B = TL.blocks.day2;
  if (t >= s('d2_card')) { C.dayCard(ctx, t, s('d2_card'), B.t1, 'DAY 2 — SURVIVED', 'TRUST IN NEIGHBORS: 0%'); return { noCaps: true }; }
  if (t < s('d2_02')) return wake(ctx, t, TL);
  if ((t >= s('d2_03') && t < s('d2_pause')) ) return peep(ctx, t, TL);
  return door(ctx, t, TL);
}
// clock 3:12 -> hero asleep on the sofa -> knock -> one eye opens
function wake(ctx, t, TL) {
  const s = TL.s, w = TL.w, t0 = TL.blocks.day2.t0, kn = w('d2_01', 'knocking');
  const keys = [[t0, 2650, 260, 3.2], [s('d2_01') + 0.2, 2620, 520, 1.6, 'm', 2.2], [w('d2_01', 'streets'), 1490, 330, 2.2, 'w'], [w('d2_01', 'And') - 0.1, 2600, 520, 1.5, 'w'], [kn + 0.15, 2580, 420, 3.6, 's']];
  ctx.save(); cam(ctx, t, keys); if (win(t, kn, kn + 0.4)) shake(ctx, t, 10);
  SE.apartment(ctx, t, { night: true, clock: [3, 12], doorShake: win(t, kn, kn + 0.5) ? Math.sin(t * 90) * 5 : 0, tv: (c, tt, x, y, w2, h) => SE.tvStatic(c, tt, x, y, w2, h) });
  const sx = 2640, pose = { x: sx, ground: F, hop: 56, footN: [sx - 120, F - 12], footF: [sx - 90, F - 12], lean: -0.15, tilt: t < kn ? 0.3 + Math.sin(t * 1.2) * 0.03 : 0.05 };
  const J0 = R.solve(K.HERO.S, pose); const awake = t > kn + 0.15;
  A.hero(ctx, { pose, grips: { near: [J0.hip[0] - 70, J0.hip[1] - 60], far: [J0.hip[0] - 40, J0.hip[1] - 50] }, e: awake ? { eyes: 'wide', brow: 'up', mouth: 'flat', look: [-1, 0], twitch: 1 } : { eyes: 'closed', mouth: 'o', open: 0.2 }, t,
    holdNear: c => { if (t < kn) { /* phone on the chest: no signal */ const p = [J0.hip[0] - 60, J0.hip[1] - 90]; SE.rr(c, p[0] - 30, p[1] - 50, 60, 100, 10, '#222'); c.fillStyle = '#5a7090'; c.fillRect(p[0] - 22, p[1] - 40, 44, 80); C.outlined(c, '✕', p[0], p[1], 30, '#ff5a4a', { lw: 4, shadow: false }); } } });
  if (!awake) { ctx.save(); ctx.globalAlpha = 0.8; for (let i = 0; i < 3; i++) { const u = ((t * 0.6 + i / 3) % 1); C.outlined(ctx, 'z', J0.head[0] + 60 + u * 80, J0.head[1] - 100 - u * 120, 40 + u * 30, '#dfe6ff', { lw: 6, shadow: false }); } ctx.restore(); }
  SE.aptNight(ctx, {});
  ctx.restore();
  if (t > kn) A.knockFx(ctx, t, kn, 520, 220);
  A.tag(ctx, t, t0 + 0.2, s('d2_01') + 2.5, 'DAY 2 · 3:12 AM');
  return { fade: t < t0 + 0.4 ? 1 - (t - t0) / 0.4 : 0 };
}
// the hero at the door (walk in with the bat, Nope, security montage, breathing, scratching, Tomorrow?!)
function door(ctx, t, TL) {
  const s = TL.s, e = TL.e, w = TL.w;
  const t2 = s('d2_02'), tN = s('d2_06'), t7 = s('d2_07'), wChain = w('d2_07', 'locked'), wBat = w('d2_07', 'baseball'), wChair = w('d2_07', 'chair'), wPill = w('d2_07', 'three'), tPr = s('d2_proud'), t8 = s('d2_08'), t9 = s('d2_09'), tSc = s('d2_scratch'), t10 = s('d2_10'), tSt = s('d2_steps'), t11 = s('d2_11');
  // hero walks from the sofa to the door (low angle on the feet), stands at 830
  const wp = A.walkPath(t, [[t2, 1900], [t2 + 3.0, 830], [s('d2_06') + 0.7, 830], [s('d2_06') + 1.1, 570], [w('d2_07', 'locked') + 0.5, 600], [w('d2_07', 'locked') + 0.9, 830]], 100);
  const proud = t > wPill + 0.4, back2 = t > tPr + 0.2;
  const x = t < wPill + 0.4 ? wp.x : kf([[wPill + 0.4, 830], [wPill + 0.9, 890]], t);
  const panic = t > t11 - 0.05, hop = win(t, t11, t11 + 0.32) ? -Math.sin((t - t11) / 0.32 * Math.PI) * 40 : 0;
  const pose = { x, ground: F, hop, walk: t < wPill ? wp.walk : { w: 1, u: (830 - x) / 60 + wp.walk.u, stride: 60 },
    crouch: kf([[t7, 0.05], [wChair, 0.05], [wChair + 0.2, 0.35], [wChair + 1.0, 0.35], [wPill + 0.4, 0.05], [t11, 0.05], [t11 + 0.2, 0.3]], t),
    lean: kf([[t2, 0.25], [t2 + 3.0, 0.12], [wChain - 0.2, 0.12], [wChain, 0.3], [wChair + 1.0, 0.3], [wPill + 0.4, -0.04], [t8 + 0.5, -0.04], [t8 + 1.5, 0.12], [t11, 0.12], [t11 + 0.15, -0.12]], t), tilt: 0 };
  const J0 = R.solve(K.HERO.S, pose);
  // bat: guard (walking in) -> hanging -> on the shoulder (proud) -> guard (panic)
  const guard = { K: [J0.shN[0] - 26, J0.shN[1] + 80], a: -2.15 }, hang = { K: [J0.shF[0] + 10, J0.shF[1] + K.HERO.S.ua + K.HERO.S.fa - 60], a: 1.62 }, shoulder = { K: [J0.shF[0] - 40, J0.shF[1] + 50], a: -0.8 };
  const mixB = (p, q, u) => ({ K: C.A(p.K, q.K, u), a: lerp(p.a, q.a, u) });
  let bs = guard; if (t > t2 + 3.0) bs = mixB(guard, hang, ease((t - t2 - 3.0) / 0.4)); if (t > wBat) bs = mixB(hang, shoulder, back(clamp((t - wBat) / 0.3))); if (t > t8 + 0.5) bs = mixB(shoulder, hang, ease((t - t8 - 0.5) / 0.6)); if (panic) bs = mixB(hang, guard, back(clamp((t - t11) / 0.18)));
  const b = P.bat(bs.K, bs.a, 250), both = t < t2 + 3.0 || panic;
  const knob = kf([[wChain - 0.3, [645, 469]], [wChain + 0.4, [592, 469]]], t), ch = chairAt(t, wChair);
  let near = null, bendNear;
  if (t > tN + 1.15 && t < wChain - 0.85) near = [465, 360];                         // tape over the peephole
  else if (t > wChain - 0.35 && t < wChain + 0.5) near = knob;
  else if (t > wChair && t < wChair + 1.0) near = ch.rail;
  else if (proud && t < t8 + 0.4) { near = [J0.hip[0] - 40, J0.hip[1] - 30]; bendNear = 1; }
  else if (both) near = b.high;
  const taped = t > tN + 1.4;
  // camera
  const keys = [[t2, 1700, 800, 1.6], [t2 + 0.5, 1200, 760, 1.7, 'm', 2.4], [t2 + 2.9, 900, 560, 1.4, 'm', 0.8],
    [tN - 0.45, 930, 430, 3.0, 'cut'], [tN + 1.0, 600, 470, 1.6, 's'], [wChain - 0.2, 640, 470, 2.2, 's'], [wBat, 850, 450, 2.0, 's'], [wChair, 700, 620, 1.7, 's'], [wPill, 800, 560, 1.3, 's'], [tPr, 820, 560, 1.4],
    [t8 - 0.2, 930, 430, 2.0, 'cut'], [t8 + 0.3, 930, 420, 3.2, 'm', 2.4], [tSc, 520, 760, 2.0, 's'], [tSc + 1.2, 560, 770, 2.4, 'm', 1.4], [t10, 760, 520, 1.3, 's'], [t11, 930, 470, 2.0, 's']];
  ctx.save(); cam(ctx, t, keys, { drift: 0.008 });
  if (win(t, t11, t11 + 0.4)) shake(ctx, t, 12);
  const scratching = win(t, tSc, t10 + 0.6);
  SE.apartment(ctx, t, { night: true, clock: [3, 14], feet: t < tSt + 0.4, peepCover: taped, doorShake: scratching ? Math.sin(t * 4) * 1.5 : 0 });
  // shadow of Gary's feet shifts under the door while he scratches, then leaves
  if (t > tSt && t < tSt + 1.0) { ctx.fillStyle = '#ffd98a'; ctx.fillRect(262, F - 4, 406, 6); ctx.fillStyle = '#1a1410'; const u = (t - tSt) / 1.0; ctx.fillRect(380 + u * 500, F - 4, 56 * (1 - u), 6); }
  if (scratching) { ctx.save(); ctx.strokeStyle = 'rgba(60,30,20,0.35)'; ctx.lineWidth = 3; const n = Math.floor((t - tSc) * 3); for (let i = 0; i < Math.min(n, 9); i++) { ctx.beginPath(); ctx.moveTo(330 + i * 30, 700); ctx.lineTo(320 + i * 30, 840); ctx.stroke(); } ctx.restore(); }
  SE.chain(ctx, t > wChain ? knob : [645, 469]); if (t > wChair - 0.3) P.drawChair(ctx, S, ch); else P.drawChair(ctx, S, P.chair(1180, F, 0));
  // expressions
  let ex;
  if (t < tN - 0.5) ex = { eyes: 'wide', brow: 'worried', mouth: 'frown', look: [-0.8, -0.1], sweat: 1 };
  else if (t < t7) ex = C.talk(TL, 'd2_06', t, { eyes: 'squint', brow: 'flat', mouth: 'flat', look: [0.15, 0] });
  else if (t < wPill + 0.4) ex = { eyes: 'open', brow: 'angry', mouth: 'flat', look: [-0.7, 0.2] };
  else if (t < t8 + 0.6) ex = { eyes: (t > tPr && t < tPr + 0.6) ? 'happy' : 'half', brow: 'skeptic', mouth: 'biggrin', look: [0.6, 0.1] };
  else if (t < t9) ex = { eyes: 'open', brow: 'up', mouth: t < t8 + 1.4 ? 'smile' : 'flat', look: [-0.7, 0] };
  else if (t < tSc) ex = C.talk(TL, 'd2_09', t, { eyes: 'wide', brow: 'worried', mouth: 'flat', look: [-0.9, 0] });
  else if (t < t11) ex = { eyes: 'wide', brow: 'worried', mouth: 'frown', look: [-1, 0.2], sweat: 1 };
  else ex = C.talk(TL, 'd2_11', t, { eyes: 'tiny', brow: 'worried', mouth: 'wide', open: 1, look: [0.9, 0], sweat: 1, hairUp: 1 });
  const hs = win(t, t11, t11 + 0.3) ? 1 + 0.2 * (1 - (t - t11) / 0.3) : 1;
  const J = R.solveGrip(K.HERO.S, Object.assign(pose, { bendNear }), { near, far: b.low }, 'hero d2');
  if (both) R.drawChar(ctx, K.HERO.S, K.HERO.C, J, C.blink(ex, t, 0.5), { farFront: true, hold: c => P.drawBat(c, S, b), t, headScale: hs });
  else R.drawChar(ctx, K.HERO.S, K.HERO.C, J, C.blink(ex, t, 0.5), { underFar: c => P.drawBat(c, S, b), t, headScale: hs });
  SE.aptNight(ctx, {});
  ctx.restore();
  if (t > tPr && t < t8) C.stamp(ctx, t, tPr, 'HOME SECURITY: MAXIMUM', 1260, 230, { col: '#3fae63', size: 62, t1: t8 - 0.1 });
  return {};
}
// peephole POV (approved staging): Gary waves, raises the mug, shakes it on "sugar", twitching eye
function peep(ctx, t, TL) {
  const s = TL.s, w = TL.w, t3 = s('d2_03'), t4 = s('d2_04'), t5 = s('d2_05'), raise = w('d2_03', 'borrow') - 0.5, sugar = w('d2_03', /sugar/i);
  const g = K.GARY, R0 = g.S.headR, wv = t < raise - 0.4 ? clamp((t - t3) / 0.2) * clamp((raise - 0.4 - t) / 0.25) : 0;
  const pose = { x: 1000, ground: F, lean: 0.1, crouch: 0.08 + wv * 0.07 * Math.sin(t * 13), tilt: (t > t4 ? kf([[t4, 0], [t4 + 1.6, -0.16]], t) : 0) + wv * 0.1 * Math.sin(t * 6.5) };
  const J0 = R.solve(g.S, pose), reach = g.S.ua + g.S.fa, ms = 1.35;
  const low = [J0.shN[0] - reach * 0.6, J0.shN[1] + reach * 0.16], high = [J0.head[0] - R0 * 1.0 - 64 * ms, J0.head[1] + R0 * 0.62];
  let M = C.A(low, high, back(clamp((t - raise) / 0.35)));
  if ((t > sugar && t < sugar + 0.7) || (t > s('d2_05') && t < s('d2_05') + 0.6)) M = [M[0] + Math.sin(t * 30) * 7, M[1] + Math.cos(t * 30) * 3];
  const m = P.mug(M, ms);
  const wave = [J0.head[0] + R0 * 1.4 + Math.sin(t * 13) * R0 * 0.25, J0.head[1] - R0 * 0.85 + Math.abs(Math.cos(t * 13)) * R0 * 0.1];
  const farT = C.A([J0.shF[0] + 6, J0.shF[1] + reach - 26], wave, wv);
  const eyeShot = t >= t4 && t < t5, flick = eyeShot ? (hash(Math.floor(t * 12)) > 0.75 ? 0.25 : 1) : 1;
  ctx.save(); ctx.beginPath(); ctx.arc(960, 540, 500, 0, 7); ctx.clip();
  const hx = J0.head[0], hy = J0.head[1], mx = M[0], k = 1;
  cam(ctx, t, eyeShot ? [[t4, (hx + mx) / 2 + 10, hy + R0 * 0.48, 2.25 * k, 0, 0, 0.07], [t4 + 0.9, (hx + mx) / 2 + 5, hy + R0 * 0.36, 2.7 * k, 's', 0, 0.07]]
    : t < t4 ? [[t3, hx - R0 * 0.24, hy + R0 * 1.07, 1.7 * k], [raise, hx - R0 * 0.9, hy + R0 * 0.84, 2.05 * k, 's']] : [[t5, hx - R0 * 0.9, hy + R0 * 0.7, 2.3]]);
  SE.hallway(ctx, t, { flick });
  const J = R.solveGrip(g.S, Object.assign(pose, { bendFar: -1 }), { near: m.grip, far: wv > 0.02 ? farT : null }, 'gary peep');
  const ex = Object.assign({ eyes: eyeShot ? 'wide' : 'open', brow: 'up', mouth: 'biggrin', open: 0, look: eyeShot ? [0, 0] : [-0.2, 0.15], blood: 1, twitch: eyeShot && (Math.floor(t * 7) % 5 === 0) }, C.viseme(TL, ['d2_03', 'd2_05'], t) || {});
  R.drawChar(ctx, g.S, g.C, J, C.blink(ex, t, 1.3), { farFront: wv <= 0.02, farHand: wv > 0.02 ? 'wave' : 'fist', holdNear: c => P.drawMug(c, S, m), t, front: c => K.biteMark(c, J.neck[0] + 22, J.neck[1] - 6, 0.9, 0.4) });
  if (flick < 1) { ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(-500, -500, C.W + 1000, C.H + 1000); }
  ctx.restore();
  const vg = ctx.createRadialGradient(960, 540, 260, 960, 540, 500); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.92)'); ctx.fillStyle = vg; ctx.beginPath(); ctx.arc(960, 540, 501, 0, 7); ctx.fill();
  ctx.lineWidth = 10; ctx.strokeStyle = '#0a0a0a'; ctx.stroke();
  return {};
}
const capTop = (t, TL) => (t > TL.s('d2_06') - 0.5 && t < TL.s('d2_08') - 0.2) || (t > TL.s('d2_scratch') && t < TL.s('d2_10'));
const cues = TL => { const s = TL.s, w = TL.w; return [['sfx/tick', s('d2_clock'), 0.5], ['../ep01/sfx/knock', w('d2_01', 'knocking') - 0.05, 0.9], ['sfx/creak', s('d2_02') + 0.6, 0.6], ['sfx/creak', s('d2_02') + 2.2, 0.5],
  ['../sfx/boom', w('d2_03', /sugar/i), 0.35], ['sfx/riser', s('d2_04') - 0.1, 0.3], ['../ep01/sfx/pop', s('d2_06') + 1.2, 0.5], ['../ep01/sfx/chain', w('d2_07', 'locked') - 0.1, 0.8], ['../ep01/sfx/whoosh', w('d2_07', 'baseball'), 0.4],
  ['../ep01/sfx/pop', w('d2_07', 'chair') + 0.3, 0.5], ['sfx/stamp', s('d2_proud'), 0.6], ['sfx/ding', s('d2_proud') + 0.05, 0.4], ['sfx/heartbeat', s('d2_08') + 0.5, 0.5], ['sfx/scratch', s('d2_scratch'), 0.8],
  ['sfx/stepsaway', s('d2_steps') - 0.2, 0.7], ['../sfx/boom', s('d2_11'), 0.5], ['sfx/slamdoor', s('d2_card'), 0.55]]; };
const music = TL => [['../ep01/sfx/music2', TL.s('d2_01'), TL.s('d2_proud') + 1.2, 0.25]];
module.exports = { draw, capTop, cues, music };
