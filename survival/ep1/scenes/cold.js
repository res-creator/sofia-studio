// COLD OPEN — Day 5, 7:58 AM, roof stair-house. Bite, reflection in the metal panel, Gary knocks. -> "5 DAYS EARLIER"
const C = require('../lib/core'), K = require('../lib/cast'), SE = require('../lib/sets'), A = require('../lib/act');
const { clamp, lerp, kf, ease, back, cam, shake, win } = C, F = SE.FLOOR;
const HX = 1060;   // hero sits against the wall under the bulb
function heroSit(ctx, t, TL, o = {}) {
  const look = o.look || 0, raise = o.raise || 0;
  const pose = A.sitPose(HX, F, { lean: lerp(-0.12, 0.05, o.up ?? 1), tilt: lerp(0.35, 0, o.up ?? 1) + (o.tilt || 0) });
  const J0 = K.R.solve(K.HERO.S, pose);
  const near = raise > 0 ? [lerp(J0.hip[0] - 150, J0.head[0] - 170, raise), lerp(J0.hip[1] - 20, J0.head[1] + 130, raise)] : [J0.hip[0] - 150, J0.hip[1] - 20];
  const far = [J0.hip[0] - 120, J0.hip[1] - 10];
  return A.hero(ctx, { pose, grips: { near, far }, e: o.e || {}, bite: true, biteFresh: 1, t, nearHand: raise > 0.5 ? 'open' : 'fist', gray: o.gray || 0.15, front: o.front });
}
function flashShot(ctx, t, kind) {
  ctx.save();
  if (kind === 'riot') { cam(ctx, t, [[0, 1100, 560, 1.25]]); SE.market(ctx, t); SE.crowd(ctx, t, 300, 2200, 9, 3, 0.85); }
  else if (kind === 'inf') { cam(ctx, t, [[0, 820, 520, 1.5]]); SE.stairwell(ctx, t, { dark: true }); const ch = K.ZB.office, p = K.zombiePose(ch, 900, F, t, { still: true, lunge: 1 }); p.lean = 0.45; K.person(ctx, ch, { pose: p, e: K.ZFACE(t, 0, { eyes: 'wide' }), t }, 'flash z'); }
  else { cam(ctx, t, [[0, 970, 330, 2.0]]); SE.hallway(ctx, t, {}); const P = K.P, J0 = K.R.solve(K.GARY.S, { x: 1000, ground: F, lean: 0.1 }), m = P.mug([J0.head[0] - 160, J0.head[1] + 60], 1.35);
    A.gary(ctx, { pose: { x: 1000, ground: F, lean: 0.1, tilt: -0.12 }, grips: { near: m.grip }, holdNear: c => P.drawMug(c, K.D2, m), e: { eyes: 'wide', brow: 'up', mouth: 'biggrin', blood: 1, look: [0, 0] }, t }); }
  ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = '#d88a80'; ctx.fillRect(0, 0, C.W, C.H); ctx.restore();
}
function draw(ctx, t, TL) {
  const s = TL.s, e = TL.e, w = TL.w, B = TL.blocks.cold;
  const tKnock = s('co_knock'), tCard = s('co_card');
  if (t >= tCard) { C.dayCard(ctx, t, tCard, B.t1, '5 DAYS EARLIER', null); return { noCaps: true, noFinish: false }; }
  if (t >= s('co12') - 0.05) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, C.W, C.H); return { vig: 0 }; }
  // flashes on "riots" / "infected" / "Gary"
  const fl = [[w('co02', 'riots'), 'riot'], [w('co03', 'infected'), 'inf'], [w('co04', 'Gary'), 'gary']].find(([a]) => t >= a - 0.05 && t < a + 0.5);
  if (fl) { flashShot(ctx, t, fl[1]); C.flash(ctx, 1 - (t - fl[0] + 0.05) / 0.12); return {}; }
  const bit = s('co07'), refl = s('co08');
  // camera plan
  const keys = [[0, 1000, 520, 1.0], [s('co01'), 1000, 560, 1.05, 'm', 2.5], [s('co05'), HX - 70, 580, 1.55, 's'], [s('co06'), HX - 80, 600, 1.6, 'm', 1.6],
    [bit, HX - 200, 640, 3.0, 's'], [refl, 950, 450, 2.1, 's'], [tKnock, 1530, 520, 1.25, 'w'], [s('co09'), 1530, 560, 1.45, 's'], [s('co10'), 1560, 600, 1.7, 'm', 2.2], [s('co11'), HX - 80, 600, 2.4, 's']];
  ctx.save(); const cm = cam(ctx, t, keys, { drift: 0.012 });
  if (win(t, tKnock, tKnock + 0.4)) shake(ctx, t, 12);
  const knock = win(t, tKnock, tKnock + 0.5), dsh = knock ? Math.sin(t * 90) * 6 : 0;
  SE.techRoom(ctx, t, { doorShake: dsh, feet: t > tKnock, flick: (C.hash(Math.floor(t * 10)) > 0.85 ? 0.4 : 1) });
  A.packFloor(ctx, HX + 210, F, { radio: true, t });
  // reflection in the metal panel (hero leans to look at himself)
  const [px, py, pw, ph] = SE.TR.panel;
  if (t > refl - 0.3) { ctx.save(); ctx.beginPath(); ctx.rect(px, py, pw, ph); ctx.clip(); ctx.globalAlpha = 0.55; const red = clamp((t - refl - 0.8) / 2.2);
    ctx.translate(px + pw * 0.5, 0); ctx.scale(-1, 1); A.headCU(ctx, K.HERO, [0, py + ph * 0.55], 0.05, { eyes: red > 0.5 ? 'wide' : 'open', brow: 'worried', mouth: 'frown', look: [0.3, 0], blood: red > 0.2 ? 1 : 0 }, { gray: 0.3 + red * 0.3, t });
    if (red > 0) { ctx.globalAlpha = red * 0.8; ctx.fillStyle = '#ff2a20'; const R0 = K.HERO.S.headR; ctx.beginPath(); ctx.arc(K.HERO.S.eyeNear * R0, py + ph * 0.55 + K.HERO.S.eyeY * R0, 7 + red * 4, 0, 7); ctx.fill(); }
    ctx.restore(); }
  // hero
  const up = clamp((t - s('co05')) / 0.5), raise = t >= bit - 0.1 && t < refl ? back(clamp((t - bit + 0.1) / 0.3)) : 0;
  const lookUp = t > s('co05') ? 1 : kf([[0, 0], [s('co01'), 0], [s('co04'), 0.4]], t);
  let ex; if (t < s('co05')) ex = { eyes: 'half', brow: 'flat', mouth: 'flat', look: [0, 0.4] };
  else if (t < bit) ex = { eyes: 'half', brow: 'skeptic', mouth: 'flat', look: [0.9, 0] };   // deadpan to camera
  else if (t < refl) ex = { eyes: 'wide', brow: 'worried', mouth: 'frown', look: [-0.6, 0.5], sweat: 1 };
  else if (t < tKnock) ex = C.talk(TL, 'co08', t, { eyes: 'half', brow: 'worried', mouth: 'frown', look: [-0.8, -0.2] });
  else if (t < s('co11')) ex = { eyes: 'wide', brow: 'up', mouth: 'o', look: [0.9, -0.1], hairUp: t < tKnock + 0.6 ? 1 : 0 };
  else ex = { eyes: 'tiny', brow: 'worried', mouth: 'wide', open: 0.4, look: [0.9, 0], sweat: 1 };
  heroSit(ctx, t, TL, { up: lookUp, raise, e: C.blink(ex, t, 0.7), tilt: t > refl && t < tKnock ? -0.1 : 0 });
  SE.techGrade(ctx, { col: '#b0b4c8' });
  ctx.restore();
  if (t > tKnock + 0.2) A.knockFx(ctx, t, tKnock + 0.2, 1350, 260);
  A.tag(ctx, t, s('co01'), w('co02', 'riots') - 0.1, 'DAY 5 · 7:58 AM');
  return { fade: t < s('co01') ? 1 - clamp((t - s('co01') + 0.6) / 1.4) * 0.999 : 0 };
}
const capTop = (t, TL) => t > TL.s('co07') && t < TL.s('co08');
const cues = TL => [['sfx/breath', 0.1, 0.6], ['sfx/heartbeat', TL.s('co06') - 0.5, 0.5], ['sfx/hit', TL.s('co07') - 0.05, 0.6], ['../ep01/sfx/whoosh', TL.w('co02', 'riots') - 0.1, 0.4],
  ['../ep01/sfx/whoosh', TL.w('co03', 'infected') - 0.1, 0.4], ['../ep01/sfx/whoosh', TL.w('co04', 'Gary') - 0.1, 0.4], ['sfx/growl', TL.w('co03', 'infected'), 0.4],
  ['../sfx/drone', TL.s('co08'), 0.5], ['sfx/riser', TL.s('co08') + 0.6, 0.35], ['../ep01/sfx/knock', TL.s('co_knock'), 0.95], ['sfx/hit', TL.s('co12') - 0.05, 0.5], ['sfx/slamdoor', TL.s('co_card'), 0.6]];
const music = TL => [['sfx/music3', TL.s('co01'), TL.s('co_knock'), 0.28]];
module.exports = { draw, capTop, cues, music };
