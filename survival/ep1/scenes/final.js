// FINALE — the stair-house: Sarah finds the bite, Gary knocks (cold-open callback), "You got bitten too?" / "...Too?" / "Yeah. Day one.", the keyhole, the turn, the radio, DAY 6.
const C = require('../lib/core'), K = require('../lib/cast'), SE = require('../lib/sets'), A = require('../lib/act');
const { clamp, lerp, kf, ease, back, cam, shake, win, hash } = C, F = SE.FLOOR, R = K.R, P = K.P, S = K.D2;
const HX0 = 1150, SX0 = 760;
function draw(ctx, t, TL) {
  const s = TL.s, B = TL.blocks.final;
  if (t >= s('f_black')) return black(ctx, t, TL);
  if (t >= s('f_20') + 0.6 && t < s('f_turn')) return keyhole(ctx, t, TL);
  return room(ctx, t, TL);
}
function room(ctx, t, TL) {
  const s = TL.s, e = TL.e, w = TL.w, t0 = TL.blocks.final.t0;
  const L = id => s(id), tK = L('f_knock'), tTurn = L('f_turn');
  // ---- Sarah: on the floor facing the hero; stands and backs away to the wall on "You were bitten?!"
  const sUp = clamp((t - L('f_08')) / 0.5), sx = kf([[L('f_07') + 1.5, SX0], [L('f_07') + 4.5, SX0 - 120], [L('f_08'), SX0 - 120], [L('f_08') + 0.8, 120], [L('f_18') + 2, 120], [L('f_18') + 3.5, -40]], t);
  const sPose = t < L('f_08') ? A.sitPose(sx, F, { lean: -0.05, footN: [sx - 175, F - 12], footF: [sx - 150, F - 12] })
    : { x: sx, ground: F, walk: { w: 1, u: (SX0 - sx) / 90, stride: 90 }, lean: -0.15, crouch: lerp(0.6, 0.1, sUp) };
  const sAt = t < tK ? [0.9, 0] : [0.95, -0.1];
  let sex;
  if (t < L('f_02')) sex = C.talk(TL, 'f_01', t, { eyes: 'half', brow: 'worried', mouth: 'smile', look: [0.9, 0], sweat: 1 });
  else if (t < L('f_08')) sex = C.talk(TL, ['f_03', 'f_05'], t, { eyes: t > L('f_05') - 0.3 ? 'squint' : 'open', brow: t > L('f_05') - 0.3 ? 'skeptic' : 'neutral', mouth: 'flat', look: t > L('f_03') && t < L('f_05') + 1.2 ? [0.9, 0.6] : [0.9, 0] });
  else if (t < tK) sex = C.talk(TL, ['f_08', 'f_10'], t, { eyes: 'wide', brow: 'worried', mouth: 'wide', open: 0.5, look: [0.9, 0], sweat: 1 });
  else if (t < tTurn) sex = C.talk(TL, 'f_13', t, { eyes: 'wide', brow: 'worried', mouth: 'frown', look: t > L('f_13') && t < L('f_14') + 1 ? [0.9, 0] : sAt, sweat: 1 });
  else sex = { eyes: 'tiny', brow: 'worried', mouth: 'wide', open: 0.4, look: [0.9, 0], sweat: 1 };
  // ---- hero: on the floor -> hands up "It was a cat!" -> stands, walks to the door, crouches at the keyhole -> turns
  const hUp = L('f_19') - 0.3, hx = kf([[hUp, HX0], [hUp + 1.6, 1500]], t);
  let hPose, hFlip = false, grips = {}, ex;
  if (t < hUp) { hPose = A.sitPose(HX0, F, { lean: -0.08, footN: [HX0 - 175, F - 12], footF: [HX0 - 150, F - 12], tilt: t > tK ? -0.15 : 0 });
    const J0 = R.solve(K.HERO.S, hPose);
    if (t > L('f_09') - 0.1 && t < L('f_knock')) grips = { near: [J0.head[0] - 130, J0.head[1] + 40], far: [J0.head[0] - 60, J0.head[1] + 20] };   // hands up
    else if (t > L('f_04') - 0.1 && t < L('f_04') + 0.6) grips = { near: [J0.shN[0] - 120, J0.shN[1] + 100], far: [J0.shN[0] - 90, J0.shN[1] + 110] }; }
  else if (t < tTurn) { hPose = { x: hx, ground: F, walk: { w: 1, u: (hx - HX0) / 100, stride: 100 }, lean: 0.05, crouch: t > hUp + 1.6 ? clamp((t - hUp - 1.6) / 0.4) * 0.45 : 0 }; hFlip = true; }
  else { hPose = { x: 1500, ground: F, crouch: lerp(0.45, 0.0, clamp((t - tTurn) / 0.8)), lean: lerp(0.3, 0.0, clamp((t - tTurn) / 0.8)), tilt: 0 }; hFlip = t < L('f_23') + 1.5; }
  const look2door = t > tK ? [0.95, -0.1] : [-0.9, 0];
  if (t < L('f_02')) ex = { eyes: 'closed', brow: 'worried', mouth: 'wide', open: 0.3 + 0.2 * Math.sin(t * 8), sweat: 1 };
  else if (t < L('f_03')) ex = C.talk(TL, 'f_02', t, { eyes: 'half', brow: 'up', mouth: 'smile', look: [-0.9, 0] });
  else if (t < L('f_04')) ex = { eyes: 'open', brow: 'up', mouth: 'flat', look: [-0.6, 0.6] };
  else if (t < L('f_06')) ex = C.talk(TL, 'f_04', t, { eyes: 'wide', brow: 'up', mouth: 'flat', look: [-0.9, 0], sweat: 1 });
  else if (t < L('f_08')) ex = C.talk(TL, 'f_06', t, { eyes: 'half', brow: 'skeptic', mouth: 'smile', look: [0.9, 0] });
  else if (t < tK) ex = C.talk(TL, 'f_09', t, { eyes: 'wide', brow: 'worried', mouth: 'wide', open: 0.4, look: [-0.9, 0], sweat: 1 });
  else if (t < L('f_12')) ex = { eyes: 'wide', brow: 'up', mouth: 'o', look: look2door };
  else if (t < L('f_13')) ex = C.talk(TL, 'f_12', t, { eyes: 'half', brow: 'flat', mouth: 'frown', look: [0.6, 0] });
  else if (t < L('f_16')) ex = C.talk(TL, 'f_14', t, { eyes: 'half', brow: 'flat', mouth: 'flat', look: t > L('f_14') ? [-0.9, 0] : look2door });
  else if (t < L('f_17')) ex = C.talk(TL, 'f_16', t, { eyes: 'wide', brow: 'up', mouth: 'flat', look: look2door });
  else if (t < hUp) ex = { eyes: 'tiny', brow: 'worried', mouth: 'frown', look: t < L('f_18') + 2 ? look2door : [-0.6, 0.7], sweat: 1 };
  else if (t < tTurn) ex = C.talk(TL, 'f_19', t, { eyes: 'open', brow: 'worried', mouth: 'flat', look: [-0.9, 0.2] });
  else { const u = clamp((t - tTurn) / 2.0); ex = { eyes: u > 0.6 ? 'wide' : 'half', brow: u > 0.5 ? 'angry' : 'worried', mouth: u > 0.7 ? 'smirk' : 'flat', look: [0.9, 0], blood: u > 0.3 ? 1 : 0 }; }
  const gray = t > tTurn ? 0.15 + clamp((t - tTurn) / 2.0) * 0.55 : 0.15, red = t > tTurn ? clamp((t - tTurn - 0.6) / 1.2) : 0;
  const sleeveDown = !(t > L('f_03') - 0.3 && t < L('f_04'));
  // ---- camera
  const hc = (z, dx = 0, dy = 0) => { const J = R.solve(K.HERO.S, hPose); return [J.head[0] + dx, J.head[1] + dy, z]; };
  const keys = [[t0, 960, 620, 1.2], [t0 + 0.2, 960, 640, 1.35, 'm', 4], [L('f_02'), HX0 - 40, 640, 2.4, 's'], [L('f_03'), SX0 + 40, 620, 2.2, 's'], [L('f_03') + 1.2, HX0 - 160, 780, 2.6, 's'],
    [L('f_04'), HX0 - 40, 640, 2.6, 's'], [L('f_05'), SX0 + 40, 620, 2.6, 's'], [L('f_06'), HX0 - 30, 620, 3.0, 's'], [L('f_07'), 960, 620, 1.3, 's'], [L('f_08'), 700, 600, 1.15, 's'], [L('f_09'), HX0 - 40, 640, 2.3, 's'], [L('f_10'), 300, 560, 2.2, 'w'],
    [tK, 1300, 560, 1.15, 'w'], [tK + 0.2, 1540, 560, 1.4, 'm', 3.0], [L('f_12'), HX0 - 30, 630, 2.6, 's'], [L('f_13'), 250, 580, 2.2, 's'], [L('f_14'), HX0 - 30, 630, 2.6, 's'], [L('f_15'), 1540, 600, 1.6, 's'],
    [L('f_16'), HX0 - 30, 620, 3.4, 's'], [L('f_17'), 1540, 600, 1.7, 's'], [L('f_18'), 900, 600, 1.1, 's'], [L('f_18') + 0.3, 950, 620, 1.3, 'm', 5],
    [hUp, 1300, 600, 1.3, 's'], [hUp + 1.7, 1580, 560, 1.9, 'm', 1.0], [tTurn, 1560, 420, 3.0, 'cut'], [tTurn + 0.2, 1560, 410, 3.6, 'm', 2.0], [L('f_23'), 800, 560, 0.95, 's'], [L('f_23') + 0.4, 850, 560, 1.05, 'm', 6], [L('f_24'), 1820, 820, 2.8, 's']];
  ctx.save(); cam(ctx, t, keys);
  const knocking = win(t, tK, tK + 0.6) || win(t, L('f_11') - 0.1, L('f_11') + 0.3), dsh = knocking ? Math.sin(t * 90) * 6 : 0;
  if (win(t, tK, tK + 0.4)) shake(ctx, t, 10);
  SE.techRoom(ctx, t, { bolt: true, doorShake: dsh, feet: t > tK, flick: (hash(Math.floor(t * 10)) > 0.9 ? 0.5 : 1) });
  A.packFloor(ctx, 1820, F, { radio: true, radioOn: t > L('f_24') - 0.2, t });
  K.person(ctx, K.SARAH, { pose: sPose, flip: true, e: C.blink(sex, t, 0.4), t }, 'sarah fin');
  A.hero(ctx, { pose: hPose, flip: hFlip, grips, e: C.blink(ex, t, 0.9), t, bite: true, sleeve: sleeveDown, gray, redEyes: red,
    front: !sleeveDown ? (c, J) => { const p = [lerp(J.eN[0], J.wN[0], 0.55), lerp(J.eN[1], J.wN[1], 0.55)]; SE.bandaid(c, p[0], p[1], 0.32, Math.atan2(J.wN[1] - J.eN[1], J.wN[0] - J.eN[0])); } : null });
  SE.techGrade(ctx, { col: t > tTurn ? '#b8a8b8' : '#b8bccc' });
  if (t > tTurn) { ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgba(200,120,130,${0.5 * clamp((t - tTurn) / 2)})`; ctx.fillRect(-1000, -1000, 5000, 4000); ctx.restore(); }
  ctx.restore();
  if (t > tK && t < tK + 0.8) A.knockFx(ctx, t, tK + 0.15, 1300, 230);
  if (t > L('f_24') - 0.1) { ctx.save(); ctx.globalAlpha = 0.1 * Math.abs(Math.sin(t * 20)); ctx.fillStyle = '#b9f27c'; ctx.fillRect(0, 0, C.W, C.H); ctx.restore(); }
  return {};
}
// keyhole POV: Gary's eye fills the keyhole
function keyhole(ctx, t, TL) {
  const s = TL.s, t20 = s('f_20') + 0.6, lt = t - t20, z = 1 + lt * 0.03;
  ctx.fillStyle = '#5a3a26'; ctx.fillRect(0, 0, C.W, C.H); ctx.fillStyle = 'rgba(0,0,0,0.12)'; for (let x = 0; x < C.W; x += 40) ctx.fillRect(x + Math.sin(x) * 6, 0, 3, C.H);
  ctx.save(); ctx.translate(C.W / 2, C.H / 2 - 40); ctx.scale(z, z);
  const hole = c => { c.arc(0, -120, 210, 0, 7); c.moveTo(-120, 0); c.lineTo(-210, 420); c.lineTo(210, 420); c.lineTo(120, 0); c.closePath(); };
  ctx.save(); ctx.beginPath(); hole(ctx); ctx.clip();
  ctx.fillStyle = '#c2c99a'; ctx.fillRect(-400, -500, 800, 1000);   // Gary's grey-green skin
  ctx.fillStyle = 'rgba(70,80,50,0.35)'; for (let i = 0; i < 40; i++) { ctx.beginPath(); ctx.arc(-300 + hash(i) * 600, -300 + hash(i + 3) * 700, 4, 0, 7); ctx.fill(); }
  // eye
  const blinkK = (lt % 3.1) < 0.12 ? 0.1 : 1, dart = [Math.sin(lt * 1.3) * 30 + (hash(Math.floor(lt * 2)) - 0.5) * 30, Math.cos(lt) * 10];
  ctx.save(); ctx.translate(0, -100); ctx.scale(1, blinkK);
  ctx.fillStyle = '#f6efe0'; ctx.beginPath(); ctx.ellipse(0, 0, 230, 150, 0, 0, 7); ctx.fill(); ctx.lineWidth = 12; ctx.strokeStyle = S.ink; ctx.stroke();
  ctx.save(); ctx.clip(); ctx.strokeStyle = '#d0453c'; ctx.lineWidth = 4; for (let i = 0; i < 14; i++) { const a = i * 0.9; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 240, Math.sin(a) * 160); ctx.quadraticCurveTo(Math.cos(a + 0.3) * 160, Math.sin(a + 0.3) * 100, Math.cos(a) * 100, Math.sin(a) * 60); ctx.stroke(); }
  ctx.fillStyle = '#c9b52a'; ctx.beginPath(); ctx.arc(dart[0], dart[1], 95, 0, 7); ctx.fill(); ctx.fillStyle = '#7a8a2a'; ctx.beginPath(); ctx.arc(dart[0], dart[1], 95, 0, 7); ctx.lineWidth = 8; ctx.strokeStyle = '#6a5a1a'; ctx.stroke();
  ctx.fillStyle = '#111'; ctx.beginPath(); ctx.ellipse(dart[0], dart[1], 18 + (s('f_22') < t ? 20 : 0), 60, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(dart[0] + 30, dart[1] - 34, 16, 0, 7); ctx.fill(); ctx.restore();
  ctx.restore();
  // brow (wrinkles move with the words)
  const v = C.viseme(TL, ['f_20', 'f_21', 'f_22'], t); R.line(ctx, [[-240, -300 - (v ? v.open * 30 : 0)], [0, -330], [240, -300]], 22, '#8a9070');
  ctx.restore();
  ctx.lineWidth = 16; ctx.strokeStyle = '#111'; ctx.beginPath(); hole(ctx); ctx.stroke();
  ctx.restore();
  const vg = ctx.createRadialGradient(C.W / 2, C.H / 2, 200, C.W / 2, C.H / 2, 1000); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.85)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, C.W, C.H);
  return { vig: 0.6 };
}
function black(ctx, t, TL) {
  const s = TL.s, t0 = s('f_black'), lt = t - t0;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, C.W, C.H);
  if (lt > 0.5) { const k = 1 + (1 - back(clamp((lt - 0.5) / 0.3))) * 0.6; ctx.save(); ctx.translate(C.W / 2, C.H / 2 - 60); ctx.scale(k, k); C.outlined(ctx, 'DAY 6', 0, 0, 180, '#f4efe4', { lw: 18 }); ctx.restore(); }
  if (lt > 1.1) { const txt = 'SOMETHING IS WRONG.', n = Math.floor(clamp((lt - 1.1) / 0.8) * txt.length); C.outlined(ctx, txt.slice(0, n), C.W / 2, C.H / 2 + 110, 70, '#d6413a', { lw: 10 }); }
  return { noCaps: true, vig: 0 };
}
const capTop = (t, TL) => t > TL.s('f_24') - 0.2;
const cues = TL => { const s = TL.s; return [['sfx/breath', s('f_01'), 0.5], ['../ep01/sfx/pop', s('f_04'), 0.4], ['sfx/sting', s('f_06') + 0.1, 0.35], ['../sfx/boom', s('f_10'), 0.4],
  ['../ep01/sfx/knock', s('f_knock'), 0.95], ['../sfx/drone', s('f_knock') + 0.3, 0.45], ['sfx/riser', s('f_16') - 0.2, 0.4], ['sfx/hit', s('f_17') + 1.1, 0.5], ['sfx/heartbeat', s('f_18') + 1, 0.4],
  ['sfx/creak', s('f_19') - 0.2, 0.5], ['sfx/riser', s('f_22'), 0.4], ['sfx/heartbeat', s('f_turn'), 0.7], ['sfx/growl', s('f_turn') + 1.2, 0.35], ['sfx/radio', s('f_24') - 0.3, 0.8],
  ['sfx/hit', s('f_black'), 0.7], ['sfx/stamp', s('f_black') + 0.5, 0.6], ['../ep01/sfx/squeak', s('f_black') + 2.4, 0.8]]; };
const music = TL => [['../ep01/sfx/music', TL.s('f_02'), TL.s('f_knock'), 0.16], ['sfx/musicbox', TL.s('f_18'), TL.s('f_22'), 0.16], ['sfx/music3', TL.s('f_turn'), TL.s('f_black'), 0.3]];
module.exports = { draw, capTop, cues, music };
