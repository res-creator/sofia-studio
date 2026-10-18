// S10–S11: the service tunnel, the standoff in engine control.
const C = require('../lib/core'), K = require('../lib/cast'), SH = require('../lib/ship'), A = require('../lib/act'), PR = require('../lib/props');
const { clamp, lerp, kf, ease, eout, cam, shake, win } = C, F = SH.FLOOR, R = K.R, S = K.D2, G = SH.GAL, E = SH.ENG;
const W8 = K.WAITER, ROSA = K.ROSA, CW = 700;   // CW = catwalk level in the engine room
const mir = (x, p) => [2 * x - p[0], p[1]];
// a crawling infected in the tunnel POV (screen space), d = depth, side = sideways drift into the duct
function crawler(ctx, p, t, side = 0, lit = 0) { if (p.d < 30) return; const s = p.s, x = p.x + side * 520 * s, y = p.y + 380 * s, k = Math.sin(t * 5);
  ctx.save(); ctx.fillStyle = lit ? '#4a5844' : '#0a0b0d'; ctx.beginPath(); ctx.ellipse(x, y - 60 * s, 150 * s, 70 * s, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(x, y - 150 * s, 70 * s, 64 * s, 0, 0, 7); ctx.fill();
  ctx.lineWidth = 34 * s; ctx.lineCap = 'round'; ctx.strokeStyle = ctx.fillStyle; for (const q of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + q * 90 * s, y - 80 * s); ctx.lineTo(x + q * (190 + 30 * k * q) * s, y - 10 * s); ctx.stroke(); }
  if (lit) { ctx.fillStyle = 'rgba(220,40,30,0.9)'; for (const q of [-1, 1]) { ctx.beginPath(); ctx.arc(x + q * 24 * s, y - 160 * s, 7 * s, 0, 7); ctx.fill(); } } ctx.restore(); }
// close-up insert of a prop on the steel counter, a hand placing it (packing)
function insert(ctx, t, t0, draw, label) { const u = eout(clamp((t - t0) / 0.25));
  ctx.fillStyle = '#7d8890'; ctx.fillRect(0, 0, C.W, C.H); ctx.fillStyle = '#a7b0b8'; ctx.fillRect(0, 640, C.W, 440); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(0, 640, C.W, 8);
  ctx.save(); ctx.translate(C.W / 2 - 80, 620 - (1 - u) * 160); ctx.scale(2.3, 2.3); draw(ctx); ctx.restore();
  ctx.save(); ctx.translate(C.W / 2 + 300 - u * 60, 560 - (1 - u) * 160); ctx.rotate(-0.25); R.paint(ctx, S, c => c.roundRect(60, -70, 700, 150, 50), W8.C.top); R.paint(ctx, S, c => c.roundRect(40, -76, 70, 162, 20), '#f6f3ea'); R.paint(ctx, S, c => { c.ellipse(-10, 0, 100, 70, 0, 0, 7); }, W8.C.skin); for (let k = 0; k < 3; k++) R.paint(ctx, S, c => c.ellipse(-100, -40 + k * 34, 34, 15, 0, 0, 7), W8.C.skin); ctx.restore();
  C.glow(ctx, C.W / 2, 560, 600, 'rgba(255,240,210,0.08)'); }

// ------------------------------------------------------------------ S10 the service tunnel
function s10(ctx, t, TL) {
  const s = TL.s, w = TL.w, t0 = TL.blocks.s10.t0, t2 = s('s10_2'), tH = s('s10_hatch'), tC = s('s10_crawl'), tBh = s('s10_behind'), tT = s('s10_timer'), t3 = s('s10_3'), tD = s('s10_drop');
  const tBlind = w('s10_1', 'blind');
  if (t < t2) {   // the galley: safe, fed... and blind
    ctx.save(); cam(ctx, t, [[t0, 1400, 480, 0.7], [t0 + 0.1, 900, 560, 0.85, 'm', tBlind - t0], [tBlind, 600, 420, 2.4, 's']], { drift: 0.004 });
    SH.galley(ctx, t, { tally: 12, stock: 0.4, water: 0.45, cart: 160, swing: 0.07 });
    const HX = 560, pose = A.sitPose(HX, F, { hop: 95, lean: 0.1 });
    K.person(ctx, W8, { pose, flip: true, e: C.blink(t < tBlind ? { eyes: 'half', brow: 'flat', mouth: 'flat', look: [-0.9, 0.1] } : { eyes: 'open', brow: 'angry', mouth: 'flat', look: [-0.9, 0] }, t, 0.2), t }, 'waiter s10a');
    SH.darkness(ctx, 0.55, [{ x: 560, y: 650, r: 520 }, { x: G.porthole[0], y: G.porthole[1], r: 260 }]); ctx.restore(); return { vig: 0.55 }; }
  if (t < tH) {   // packing: every object an earlier setup — fast inserts
    const i = Math.min(3, Math.floor((t - t2) / ((tH - t2) / 4))), st = t2 + i * (tH - t2) / 4;
    const P = [c => PR.drawFlashlight(c, PR.flashlight([-60, 0], 0), false), c => PR.drawPan(c, PR.pan([-200, 0], 0, 170)), c => PR.drawTimer(c, 0, 10, 1.0), c => PR.drawWristband(c, 0, 0, 1.2)];
    insert(ctx, t, st, P[i]);
    return { vig: 0.5 }; }
  if (t < tC) {   // the hatch in the cold room: the key tag, the panel slides
    ctx.save(); cam(ctx, t, [[tH, 3020, 720, 1.9], [tH + 0.1, 3040, 740, 2.1, 'm', tC - tH]]);
    SH.galley(ctx, t, { tally: 12, stock: 0.4, water: 0.45, cart: 160, coldOpen: true, bread: 0.2, hatchOpen: t > tH + 0.7 });
    const HX = 2860, pose = { x: HX, ground: F, crouch: 0.55, lean: 0.35 };
    K.person(ctx, W8, { pose, flip: true, grips: { near: mir(HX, [2995, 770]) }, nearHand: 'fist', e: { eyes: 'open', brow: 'worried', mouth: 'closed', look: [-0.9, 0.2] }, t, holdNear: (c, J) => { c.save(); c.translate(J.wN[0], J.wN[1]); c.scale(-1, 1); PR.drawWristband(c, -40, 0, 0.8); c.restore(); } }, 'waiter s10b');
    SH.darkness(ctx, 0.5, [{ x: 3000, y: 760, r: 500 }]); ctx.restore(); return { vig: 0.6 }; }
  if (t < tT || t >= t3) {   // tunnel POV with the flashlight; the look back; after the decoy, silence
    const back = t >= tBh && t < tT, after = t >= t3;
    if (back) { const d = lerp(800, 160, clamp((t - tBh) / (tT - tBh))), turnLit = t > tBh + 1.4;
      SH.pov(ctx, t, 0, 'tunnel', { dark: 0.8, lights: turnLit ? [{ cone: [C.W / 2 + 200, C.H, -Math.PI / 2 - 0.12, 0.3, 1100], a: 0.9 }] : [{ x: C.W / 2, y: C.H / 2, r: 300, a: 0.3 }], things: (c, at) => crawler(c, at(d), t, 0, turnLit) });
      if (turnLit) { ctx.save(); ctx.globalAlpha = 0.8; crawler(ctx, { s: 1 / (1 + d / 300), x: C.W / 2, y: C.H / 2, d }, t, 0, 1); ctx.restore(); }
      return { vig: 0.8 }; }
    const z = after ? 0 : (t - tC) * 150, bob = Math.sin(t * 4) * 12;
    SH.pov(ctx, t, z, 'tunnel', { bob, sway: Math.sin(t * 2) * 10, dark: 0.88, lights: [{ cone: [C.W / 2 - 160, C.H + 40, -Math.PI / 2 + 0.08 + Math.sin(t * 1.5) * 0.06, 0.32, 1300], a: 0.95 }],
      things: after ? (c, at) => { const u = clamp((t - t3) / 1.2); crawler(c, at(900), t, 0.8 + u * 0.8); } : null });
    if (after) { const u = clamp((t - t3 - 0.6) / 0.6); if (u > 0) { ctx.save(); ctx.globalAlpha = u; ctx.fillStyle = '#05060a'; ctx.fillRect(0, 0, C.W, C.H); ctx.restore(); } }
    if (after && t > t3 + 1.2) {   // his face in the flashlight bounce, one breath out
      ctx.fillStyle = '#05060a'; ctx.fillRect(0, 0, C.W, C.H); ctx.save(); cam(ctx, t, [[t3 + 1.2, 980, 560, 2.4]]); SH.rect(ctx, 0, 0, 2000, 1000, '#2a2e34'); const pose = { x: 1000, ground: F, crouch: 0.6, lean: 0.5 };
      K.person(ctx, W8, { pose, e: { eyes: 'half', brow: 'worried', mouth: 'o', open: 0.25, look: [-0.9, 0] }, t }, 'waiter s10c'); SH.darkness(ctx, 0.75, [{ x: 940, y: 600, r: 380 }]); ctx.restore(); }
    return { vig: 0.8 }; }
  if (t < t3) {   // the decoy: wind the timer (insert), slide it into a side duct (insert), the shape turns after the ring
    const a = tT, b = tT + 0.9;
    if (t < b) { ctx.fillStyle = '#16191e'; ctx.fillRect(0, 0, C.W, C.H); C.glow(ctx, C.W / 2, C.H / 2, 700, 'rgba(255,240,200,0.2)');
      ctx.save(); ctx.translate(C.W / 2, C.H / 2 + 120); ctx.rotate(-(t - a) * 6); PR.drawTimer(ctx, 0, 0, 3.2, 0, t); ctx.restore();
      R.paint(ctx, S, c => c.ellipse(C.W / 2 + 230, C.H / 2 - 40, 120, 80, 0.4, 0, 7), W8.C.skin); return { vig: 0.6 }; }
    if (t < b + 0.8) { const u = clamp((t - b) / 0.5); ctx.fillStyle = '#2a2e34'; ctx.fillRect(0, 0, C.W, C.H); ctx.fillStyle = '#05060a'; ctx.fillRect(C.W / 2 - 300, C.H / 2 - 160, 600, 320); SH.rr(ctx, C.W / 2 - 330, C.H / 2 - 190, 660, 380, 10, 'rgba(0,0,0,0)');
      PR.drawTimer(ctx, lerp(C.W / 2 + 500, C.W / 2 - 100, u), C.H / 2 + 120 - u * 60, 2.2 * (1 - u * 0.5), 1, t); SH.darkness(ctx, 0.5, [{ x: C.W / 2 + 200, y: C.H / 2 + 100, r: 600 }]); return { vig: 0.6 }; }
    SH.pov(ctx, t, 0, 'tunnel', { dark: 0.9, lights: [{ cone: [C.W / 2 + 200, C.H, -Math.PI / 2 - 0.12, 0.3, 1100], a: 0.7 }], things: (c, at) => crawler(c, at(900), t, clamp((t - b - 0.8) / 1.2) * 1.2, 1) });
    return { vig: 0.8 }; }
}
function s10drop(ctx, t, TL) {   // drawn as part of s10: drop into the engine room; a flare gun in his face
  const s = TL.s, tD = s('s10_drop'), land = tD + 0.45;
  const fall = clamp((t - tD) / 0.45), HX = 1310, y = lerp(300, CW, fall * fall);
  ctx.save(); cam(ctx, t, [[tD, 1500, 450, 0.9], [land, 1480, 520, 1.0, 's'], [land + 0.5, 1360, 420, 2.4, 'cut']]); if (win(t, land, land + 0.2)) shake(ctx, t, 8);
  SH.engineRoom(ctx, t, { running: true, hatchOpen: true, rudder: 0.1, fuel: 0.55 });
  const pose = { x: HX, ground: y, crouch: t < land ? 0.25 : 0.5 * (1 - clamp((t - land - 0.3) / 0.4)), lean: 0.1 };
  K.person(ctx, W8, { pose, flip: true, e: { eyes: 'wide', brow: 'worried', mouth: 'o', look: [-0.9, 0] }, t }, 'waiter drop');
  if (t > land + 0.5) { const f = PR.flareGun([1600, 400], 0); ctx.save(); R.paint(ctx, S, c => c.roundRect(1600, 380, 500, 90, 30), ROSA.C.top); R.paint(ctx, S, c => c.ellipse(1600, 420, 40, 34, 0, 0, 7), ROSA.C.skin); PR.drawFlareGun(ctx, f); ctx.restore(); }
  SH.tint(ctx, 'rgba(255,150,140,1)'); SH.darkness(ctx, 0.45, [{ x: 1400, y: 450, r: 700 }]);
  ctx.restore(); return { vig: 0.6 };
}
function s10main(ctx, t, TL) { return t >= TL.s('s10_drop') ? s10drop(ctx, t, TL) : s10(ctx, t, TL); }

// ------------------------------------------------------------------ S11 engine control: standoff → alliance
function s11(ctx, t, TL) {
  const s = TL.s, w = TL.w, t0 = TL.blocks.s11.t0, tBd = s('s11_band'), t2 = s('s11_2'), tBr = s('s11_bread'), t3 = s('s11_3'), t4 = s('s11_4'), t5 = s('s11_5'), t6 = s('s11_6'), t7 = s('s11_7');
  const tHands = w('s11_1', 'hands'), tBoth = w('s11_1', 'both'), tEng = w('s11_6', 'engines'), tLower = w('s11_3', 'hums');
  const HX = 1250, RX = 1760, sit = t > t7 + 0.4;
  const keys = [[t0, 1500, 450, 1.2], [tBd, 1240, 380, 2.4, 'cut'], [t2, 1750, 330, 2.5, 'cut'], [tBr, 1340, 470, 2.4, 'cut'], [t3, 1500, 450, 1.25, 'cut'], [t4, 1250, 340, 2.4, 'cut'],
    [t5, 1560, 420, 1.35, 'cut'], [t5 + 0.1, 1740, 350, 1.9, 'm', 5.0], [tEng - 0.4, 1990, 500, 2.3, 'cut'], [tEng + 1.6, 1980, 380, 1.8, 'cut'], [t7, 1650, 480, 0.85, 'cut'], [t7 + 0.1, 1650, 470, 0.95, 'm', 3.6]];
  ctx.save(); cam(ctx, t, keys, { drift: 0.004 });
  SH.engineRoom(ctx, t, { running: true, hatchOpen: true, rudder: 0.1 + 0.05 * Math.sin(t * 0.5), fuel: 0.55 });
  // Rosa: flare gun up; lowers it on "hums"; points up for the bridge; hand on the console for the engines; sits for the last line
  const lower = clamp((t - tLower) / 0.6), up = win(t, t5 + 0.6, t5 + 2.6), cons = t > tEng - 0.4 && t < tEng + 1.6;
  const rPose = sit ? A.sitPose(RX + 120, CW, { hop: 125, lean: 0.12 }) : { x: cons ? 2160 : RX, ground: CW, lean: 0.02 + lower * 0.04 };
  const J0 = R.solve(ROSA.S, rPose), f = PR.flareGun([lerp(J0.shN[0] - 170, J0.shN[0] - 60, lower), lerp(J0.shN[1] + 30, J0.shN[1] + 190, lower)], lower * 1.1);
  let rGrips = { near: f.G, far: lower < 0.5 ? [f.G[0] + 18, f.G[1] + 12] : undefined }, rHold = c => PR.drawFlareGun(c, f);
  if (up) rGrips.far = [J0.shN[0] - 60, J0.shN[1] - 160];
  if (cons) { rGrips = { near: [2045, 495] }; rHold = null; }
  if (sit) { rGrips = { near: [J0.shN[0] - 80, J0.shN[1] + 30] }; rHold = (c, J) => PR.drawBread(c, J.wN[0] - 10, J.wN[1] - 10, 0.5, -0.3); }
  const lines = ['s11_1', 's11_2', 's11_3', 's11_5', 's11_6'];
  const rE = t < t3 ? { eyes: 'squint', brow: 'angry', mouth: 'flat', look: [-0.9, 0] } : t < t5 ? { eyes: 'half', brow: 'skeptic', mouth: 'smirk', look: [-0.9, 0] } : t < t7 ? { eyes: 'open', brow: 'worried', mouth: 'flat', look: up ? [-0.3, -0.9] : [-0.8, 0] } : { eyes: 'half', brow: 'flat', mouth: 'flat', look: [-0.5, 0.3] };
  if (sit) for (const x of [HX, RX + 120]) SH.rr(ctx, x - 70, CW - 110, 150, 110, 6, '#5a5040');
  K.person(ctx, ROSA, { pose: rPose, grips: rGrips, farFront: !!rHold && lower < 0.5, e: C.blink(C.talk(TL, lines, t, rE), t, 0.6), t, lampOn: true, holdNear: rHold }, 'rosa s11');
  // the hero: hands up, shows the wristband, offers the bread
  const hPose = sit ? A.sitPose(HX, CW, { hop: 125, lean: 0.1 }) : { x: HX, ground: CW, lean: -0.03 };
  const JH = R.solve(W8.S, hPose), hands = t > tHands && t < t3 + 1.0, both = t > tBoth && t < tBr, band = t > tBd && t < tBr, bread = t > tBr && t < t3 + 1.0;
  let hG = {}, hHold = null;
  if (sit) hG = {};
  else if (bread) { hG = { near: mir(HX, [HX + 150, JH.shN[1] + 40]) }; hHold = (c, J) => PR.drawBread(c, J.wN[0] - 30, J.wN[1] - 10, 1.0); }
  else if (hands) { hG = { near: mir(HX, [HX + (band ? 150 : 110), JH.shN[1] - (band ? 40 : 120)]), far: both ? mir(HX, [HX + 80, JH.shN[1] - 140]) : undefined }; if (band) hHold = (c, J) => { c.save(); c.translate(J.wN[0], J.wN[1] + 6); c.scale(-1, 1); PR.drawWristband(c, -70, 0, 0.9); c.restore(); }; }
  const hE = t < t3 ? { eyes: 'wide', brow: 'worried', mouth: 'flat', look: [-0.9, 0], sweat: 1 } : t < t5 ? { eyes: 'half', brow: 'up', mouth: 'smile', look: [-0.9, 0] } : { eyes: 'open', brow: 'worried', mouth: 'flat', look: [-0.9, up ? -0.6 : 0] };
  K.person(ctx, W8, { pose: hPose, flip: true, farFront: both, grips: hG, nearHand: hHold ? 'fist' : 'open', farHand: 'open', e: C.blink(hE, t, 0.2), t, holdNear: hHold }, 'waiter s11');
  // red emergency light, warmer after the alliance
  const warm = clamp((t - t5) / 3);
  SH.tint(ctx, warm ? `rgb(255,${Math.round(150 + warm * 60)},${Math.round(140 + warm * 40)})` : 'rgb(255,150,140)');
  SH.darkness(ctx, 0.45, [{ x: 1520, y: 450, r: 700 }, { x: 1930, y: 480, r: 300 }]);
  ctx.restore();
  if (t > t7 + 3.2) C.fade(ctx, clamp((t - t7 - 3.2) / 0.5));
  return { vig: 0.55 };
}

const cues = TL => { const s = TL.s, w = TL.w, tT = s('s10_timer');
  return [
    ['sfx/hatch', s('s10_hatch') + 0.5, 0.6], ['sfx/crawl', s('s10_crawl') + 0.1, 0.55, 3.8], ['../ep1/sfx/breath', s('s10_crawl') + 0.5, 0.35],
    ['sfx/crawl', s('s10_behind') + 0.2, 0.35, 3.0], ['../ep1/sfx/growl', s('s10_behind') + 2.3, 0.35], ['../ep1/sfx/heartbeat', s('s10_behind') + 0.6, 0.45],
    ['../ep1/sfx/tick', tT, 0.6, 0.9], ['sfx/timer', tT + 1.0, 0.7, 1.4], ['sfx/timer', tT + 2.4, 0.3, 1.6], ['sfx/timer', s('s10_3') + 1.0, 0.12, 1.2],
    ['sfx/enginestart', s('s10_drop') - 0.1, 0.5], ['../ep1/sfx/thud', s('s10_drop') + 0.45, 0.8],
    ['sfx/beep', s('s11_5') + 0.2, 0.25], ['sfx/beep', w('s11_6', 'engines'), 0.4]];
};
const music = TL => [['sfx/warm', TL.s('s11_7') - 0.3, TL.blocks.s11.t1, 0.22], ['sfx/hullbed', TL.blocks.s10.t0, TL.s('s10_drop'), 0.3], ['sfx/enginebed', TL.s('s10_drop') + 0.3, TL.blocks.s11.t1, 0.35]];
module.exports = { s10: s10main, s11, cues, music };
