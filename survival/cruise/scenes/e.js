// S12–S13: two survivors (days 13–29), day 30 — the bridge.
const C = require('../lib/core'), K = require('../lib/cast'), SH = require('../lib/ship'), A = require('../lib/act'), PR = require('../lib/props');
const { clamp, lerp, kf, ease, eout, cam, shake, win } = C, F = SH.FLOOR, R = K.R, S = K.D2, E = SH.ENG;
const W8 = K.WAITER, ROSA = K.ROSA, CW = 700;
const mir = (x, p) => [2 * x - p[0], p[1]];
const crate = (ctx, x) => SH.rr(ctx, x - 70, CW - 110, 150, 110, 6, '#5a5040');
const PA = [1660, 150];
function paSpeaker(ctx, t, live) { R.paint(ctx, S, c => { c.moveTo(PA[0] - 40, PA[1] - 30); c.lineTo(PA[0] + 30, PA[1] - 50); c.lineTo(PA[0] + 30, PA[1] + 50); c.lineTo(PA[0] - 40, PA[1] + 30); c.closePath(); }, '#9aa3ab'); SH.rr(ctx, PA[0] - 70, PA[1] - 28, 34, 56, 6, '#6a727a');
  if (live) C.glow(ctx, PA[0], PA[1], 160, `rgba(255,220,170,${0.18 + 0.08 * Math.sin(t * 3)})`); }
// a seated pair on crates by the stove corner of the console (the "home" composition)
function pair(ctx, t, TL, o) {
  const HX = o.hx ?? 1500, RX = o.rx ?? 1760;
  crate(ctx, HX); crate(ctx, RX + 40);
  const rp = o.rStand ? { x: RX, ground: CW, lean: o.rLean ?? 0.02 } : A.sitPose(RX + 40, CW, { hop: 125, lean: o.rLean ?? 0.12, tilt: o.rTilt || 0 });
  K.person(ctx, ROSA, { pose: rp, grips: o.rGrips || {}, e: C.blink(C.talk(TL, o.lines || [], t, o.re), t, 0.6), t, lampOn: o.lamp ?? true, holdNear: o.rHold }, 'rosa e');
  const hp = o.hStand ? { x: HX, ground: CW, lean: o.hLean ?? 0.03 } : A.sitPose(HX, CW, { hop: 125, lean: o.hLean ?? 0.1, tilt: o.hTilt || 0 });
  K.person(ctx, W8, { pose: hp, flip: true, grips: o.hGrips || {}, nearHand: o.hHold ? 'fist' : 'open', e: C.blink(o.he, t, 0.2), t, holdNear: o.hHold }, 'waiter e');
}

// ------------------------------------------------------------------ S12 days 13–29: two survivors
function s12(ctx, t, TL) {
  const s = TL.s, w = TL.w, t0 = TL.blocks.s12.t0, t2 = s('s12_2'), tD = s('s12_days'), t3 = s('s12_3'), t4 = s('s12_4');
  const tEng = w('s12_1', 'engine'), tFed = w('s12_2', 'you');
  if (t < tEng) {   // one kitchen: he cooks on the camping stove
    ctx.save(); cam(ctx, t, [[t0, 3250, 600, 1.55], [t0 + 0.1, 3230, 590, 1.7, 'm', tEng - t0]]);
    SH.engineRoom(ctx, t, { running: true, hatchOpen: true, stove: true, tally: 14, fuel: 0.5 });
    const HX = 3305, pose = { x: HX, ground: F, crouch: 0.5, lean: 0.2 };
    PR.drawPan(ctx, PR.pan([3262, 784], Math.PI, 150));
    K.person(ctx, W8, { pose, grips: { near: [3252, 778] }, nearHand: 'fist', e: C.blink({ eyes: 'half', brow: 'flat', mouth: 'smile', look: [-0.8, 0.4] }, t, 0.2), t }, 'waiter s12a');
    for (let i = 0; i < 4; i++) { const u = ((t * 0.6 + i / 4) % 1); ctx.fillStyle = `rgba(230,230,230,${0.25 * (1 - u)})`; ctx.beginPath(); ctx.arc(3150 + Math.sin(u * 6 + i) * 20, 760 - u * 200, 18 + u * 20, 0, 7); ctx.fill(); }
    SH.darkness(ctx, 0.45, [{ x: 3180, y: 780, r: 480 }]); ctx.restore(); return { vig: 0.5 }; }
  const days = [[16, 0.42, 'eat'], [21, 0.31, 'sleep'], [25, 0.2, 'eat'], [28, 0.12, 'watch']];
  let di = -1; if (t >= tD) di = Math.min(3, Math.floor((t - tD) / ((t3 - tD) / 4)));
  const fuel = t < tD ? 0.5 : t < t3 ? days[di][1] : lerp(0.1, 0.06, clamp((t - t3) / 2));
  const tally = t < tD ? 14 : t < t3 ? days[di][0] : 29;
  ctx.save();
  if (t < tD) {   // she keeps the ship alive (hand on the console); you keep her fed (plate)
    cam(ctx, t, [[tEng, 2050, 520, 1.3], [tEng + 0.1, 1980, 520, 1.25, 'm', tD - tEng]]);
    SH.engineRoom(ctx, t, { running: true, hatchOpen: true, stove: true, tally, fuel });
    const give = t > tFed; const RX = 2150, rp = { x: RX, ground: CW, lean: 0.03 };
    K.person(ctx, ROSA, { pose: rp, grips: give ? { near: [RX - 150, R.solve(ROSA.S, rp).shN[1] + 70] } : { near: [2045, 495] }, e: C.blink(give ? { eyes: 'half', brow: 'up', mouth: 'smile', look: [-0.9, 0] } : { eyes: 'half', brow: 'flat', mouth: 'flat', look: [0.3, 0.2] }, t, 0.5), t, lampOn: true, holdNear: give && t > tFed + 0.6 ? (c, J) => PR.drawPlate(c, J.wN[0] - 10, J.wN[1] - 4, 0.9) : null }, 'rosa s12');
    const HX = give ? 1860 : 1700, hp = { x: HX, ground: CW, lean: 0.04 };
    K.person(ctx, W8, { pose: hp, flip: true, grips: give && t < tFed + 0.6 ? { near: mir(HX, [RX - 170, R.solve(W8.S, hp).shN[1] + 70]) } : { near: mir(HX, [HX + 90, R.solve(W8.S, hp).shN[1] + 90]) }, nearHand: 'fist', e: C.blink({ eyes: 'open', brow: 'up', mouth: 'smile', look: [-0.9, 0] }, t, 0.2), t, holdNear: !give || t < tFed + 0.6 ? (c, J) => PR.drawPlate(c, J.wN[0] + 10, J.wN[1] - 4, 0.9) : null }, 'waiter s12b');
    SH.darkness(ctx, 0.35, [{ x: 1750, y: 520, r: 700 }]);
  } else if (t < t3) {   // the same frame, different days: tally up, fuel down
    cam(ctx, t, [[tD, 1880, 520, 0.95]]);
    SH.engineRoom(ctx, t, { running: true, hatchOpen: true, stove: true, tally, fuel });
    const k = days[di][2];
    pair(ctx, t, TL, { hx: 1400, rx: 1800, re: k === 'sleep' ? { eyes: 'closed', brow: 'flat', mouth: 'flat' } : { eyes: 'half', brow: 'flat', mouth: k === 'eat' ? 'smile' : 'flat', look: [-0.9, 0.2] }, rTilt: k === 'sleep' ? 0.35 : 0, lamp: k !== 'sleep',
      he: k === 'watch' ? { eyes: 'open', brow: 'worried', mouth: 'flat', look: [-0.6, 0.6] } : { eyes: 'half', brow: 'flat', mouth: 'smile', look: [-0.9, 0] },
      hHold: k === 'eat' ? (c, J) => PR.drawPlate(c, J.wN[0], J.wN[1] - 4, 0.8) : null, hGrips: k === 'eat' ? { near: mir(1400, [1480, CW - 150]) } : {} });
    SH.darkness(ctx, 0.4, [{ x: 1700, y: 520, r: 700 }, { x: 3180, y: 800, r: 300 }]);
    ctx.restore(); ctx.save(); ctx.globalAlpha = 0.85; ctx.fillStyle = '#e8e2d0'; ctx.font = '44px Anton'; ctx.fillText('DAY ' + days[di][0], 96, 960); ctx.restore(); return { vig: 0.5 };
  } else {   // DAY 29: tilt down to the fuel gauge; then Rosa: tomorrow we pick a direction
    const talkS = t >= t4 - 0.3;
    cam(ctx, t, talkS ? [[t4 - 0.3, 1640, 470, 1.5], [t4 - 0.2, 1700, 440, 1.8, 'm', 3.2]] : [[t3, 2140, 420, 2.0], [t3 + 0.1, 2140, 640, 3.0, 'm', 1.6]]);
    SH.engineRoom(ctx, t, { running: true, hatchOpen: true, stove: true, tally, fuel });
    pair(ctx, t, TL, { hx: 1400, rx: 1800, lines: ['s12_4'], re: { eyes: 'half', brow: 'worried', mouth: 'flat', look: [-0.9, 0.1] }, he: { eyes: 'open', brow: 'worried', mouth: 'flat', look: [-0.9, 0] } });
    SH.darkness(ctx, 0.45, [{ x: 1700, y: 520, r: 600 }, { x: E.fuel[0], y: E.fuel[1], r: 260 }]);
  }
  ctx.restore();
  A.dayMark(ctx, t, t3, t3 + 2.4, 'DAY 29');
  return { vig: 0.5 };
}

// ------------------------------------------------------------------ S13 day 30: the bridge takes the helm
function title(ctx, t, t0) { const a = clamp((t - t0) / 0.8);
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(0, C.H / 2 - 150, C.W, 300); ctx.textAlign = 'center'; ctx.fillStyle = '#f4efe4'; ctx.font = '96px Anton'; ctx.fillText('30 DAYS TRAPPED', C.W / 2, C.H / 2 + 6);
  ctx.font = '54px Anton'; ctx.fillStyle = '#d6413a'; ctx.fillText('ON A CRUISE SHIP', C.W / 2, C.H / 2 + 86); ctx.font = '34px Anton'; ctx.fillStyle = '#c9c2b0'; ctx.fillText('ZOMBIE OUTBREAK', C.W / 2, C.H / 2 - 92); ctx.restore(); }
function s13(ctx, t, TL) {
  const s = TL.s, w = TL.w, t0 = TL.blocks.s13.t0, tSw = s('s13_switch'), t1 = s('s13_1'), t2 = s('s13_2'), tCc = s('s13_cctv'), tCl = s('s13_click'), t3 = s('s13_3'), t4 = s('s13_4'), t5 = s('s13_5'), tE = s('s13_engines'), t6 = s('s13_6'), t7 = s('s13_7'), tEnd = s('s13_end');
  const flip = tSw + 0.25, live = t > tCl + 0.4 && t < t4 + 3.2, staticT = tCc + 4.9;
  if (t >= t6 - 0.2) {   // snap out of the ship: the liner at dawn, turning toward an unknown horizon
    const k = [[t6 - 0.2, 1300, 400, 3.0], [t6, 1300, 420, 0.45, 's'], [t6 + 0.2, 1300, 420, 0.47, 'm', 9.0]];
    ctx.save(); cam(ctx, t, k); SH.sky(ctx, 'dawn', t); SH.sea(ctx, 560, 'dawn', t);
    ctx.save(); ctx.translate(1500 + (t - t6) * 50, 600); ctx.rotate(-0.01 * (t - t6)); ctx.scale(-0.8, 0.8); SH.liner(ctx, -1300, 300, t, { wake: 0.9, lit: 0.05, bridgeLit: true }); ctx.restore();
    C.glow(ctx, 3400, 560, 600, 'rgba(255,200,140,0.35)'); ctx.restore();
    if (t > tEnd - 0.4) title(ctx, t, tEnd - 0.4);
    if (t > tEnd + 3.2) C.fade(ctx, clamp((t - tEnd - 3.2) / 0.7));
    return { vig: 0.45 }; }
  if (t >= tCc && t < staticT + 0.6) {   // the bridge on CCTV: slow push; the head starts to turn; static
    const u = clamp((t - tCc) / (staticT - tCc)), z = lerp(1.0, 1.9, ease(u));
    ctx.fillStyle = '#0a0b0d'; ctx.fillRect(0, 0, C.W, C.H); ctx.save(); ctx.translate(C.W / 2, C.H / 2); ctx.scale(z, z); ctx.translate(-C.W / 2, -C.H / 2);
    SH.rr(ctx, 360, 160, 1200, 760, 24, '#16181c');
    if (t < staticT) SH.cctvBridge(ctx, t, 400, 200, 1120, 680, { turn: clamp((t - staticT + 1.6) / 1.6) }); else SH.cctvStatic(ctx, t, 400, 200, 1120, 680);
    ctx.restore(); ctx.save(); ctx.globalAlpha = 0.12; ctx.fillStyle = '#000'; for (let y = 0; y < C.H; y += 4) ctx.fillRect(0, y, C.W, 2); ctx.restore();
    return { vig: 0.75 }; }
  // engine room. Shots: console flip → rudder snap → Rosa → two-shot → (cctv) → both look up at the PA → faces → engines
  const keys = [[t0, 1750, 470, 0.9], [t0 + 0.1, 1800, 480, 1.0, 'm', 1.6], [tSw, 1930, 470, 2.8, 'cut'], [flip + 0.5, E.rudder[0], E.rudder[1] + 110, 4.0, 's'],
    [t1, 1780, 330, 2.6, 'cut', 0, 0.05], [t2, 1700, 470, 1.4, 'cut'], [t2 + 0.1, 1830, 450, 1.7, 'm', 3.6, -0.03],
    [staticT + 0.6, 1660, 330, 1.1, 'cut'], [tCl, 1660, 330, 1.05, 'm', 0.5], [t3, 1640, 380, 1.1, 'cut', 0, 0.04], [t4, 1640, 380, 1.15, 'm', 3.0, 0.06], [t4 + 3.0, 1500, 330, 2.6, 'cut'],
    [t5, 1780, 330, 2.6, 'cut'], [tE, 1650, 450, 1.0, 'cut'], [tE + 0.5, 1650, 450, 1.25, 'm', 0.9, -0.05]];
  ctx.save(); cam(ctx, t, keys, { drift: 0.005 });
  if (t > tE) shake(ctx, t, 4 * clamp((t - tE) / 0.6)); else if (win(t, flip, flip + 0.25)) shake(ctx, t, 3);
  const ovr = t > flip, rud = ovr ? ease(clamp((t - flip - 0.4) / 2.5)) * 0.9 + (t > tE ? Math.sin((t - tE) * 2) * 0.1 : 0) : 0;
  SH.engineRoom(ctx, t, { running: true, hatchOpen: true, stove: true, tally: 30, fuel: 0.06, override: ovr, rudder: rud, cctv: t > staticT ? SH.cctvStatic : (c, tt, x, y, ww, h) => SH.cctvBridge(c, tt, x, y, ww, h) });
  paSpeaker(ctx, t, live);
  // Rosa: at the console, slams the controls, then steps back; the hero gets up and takes the frying pan
  const RX = t < t2 ? 2270 : 2060, slam = win(t, t2 + 0.8, t2 + 2.4) ? Math.abs(Math.sin((t - t2) * 9)) : 0;
  const rp = { x: RX, ground: CW, lean: 0.06 + slam * 0.05, tilt: t > tCl ? -0.3 : 0 };
  const rLook = t > tCl && t < t5 ? [0.3, -0.9] : t > tE ? [-0.9, 0] : [-0.9, 0.1];
  const rE = t < flip ? { eyes: 'half', brow: 'flat', mouth: 'flat', look: [-0.9, 0.3] } : t < t1 ? { eyes: 'wide', brow: 'up', mouth: 'o', look: [-0.9, 0.2] } : { eyes: 'wide', brow: 'worried', mouth: 'flat', look: rLook, sweat: t > t5 ? 1 : 0 };
  K.person(ctx, ROSA, { pose: rp, grips: t > t2 && t < tCl ? { near: [2030, 500 + slam * 30] } : {}, e: C.blink(C.talk(TL, ['s13_1', 's13_2', 's13_5'], t, rE), t, 0.6), t, lampOn: true }, 'rosa s13');
  const HX = t < t2 ? 1500 : 1640, up = t > t2 - 0.5, pan = t > tCl;
  const hp = up ? { x: HX, ground: CW, lean: 0.03, tilt: t > tCl && t < t5 ? -0.35 : 0, crouch: pan ? 0.1 : 0 } : A.sitPose(HX, CW, { hop: 125, lean: 0.1 });
  if (!up) crate(ctx, HX);
  const JH = R.solve(W8.S, hp);
  const hE = t < flip ? { eyes: 'half', brow: 'flat', mouth: 'flat', look: [-0.6, 0.2] } : t < tCl ? { eyes: 'wide', brow: 'worried', mouth: 'o', look: [-0.9, 0] } : t < t5 ? { eyes: 'wide', brow: 'worried', mouth: 'closed', look: [0.4, -0.9], sweat: 1 } : t < tE ? { eyes: 'wide', brow: 'worried', mouth: 'flat', look: [-0.9, 0] } : { eyes: 'open', brow: 'angry', mouth: 'flat', look: [0.3, -0.9] };
  K.person(ctx, W8, { pose: hp, flip: true, grips: pan ? { near: mir(HX, [HX + 40, JH.shN[1] + 130]) } : {}, nearHand: pan ? 'fist' : 'open', e: C.blink(hE, t, 0.2), t, holdNear: pan ? (c, J) => PR.drawPan(c, PR.pan([J.wN[0], J.wN[1]], -2.5, 150)) : null }, 'waiter s13');
  const red = ovr ? 0.5 + 0.5 * Math.max(0, Math.sin(t * 4)) : 0;
  SH.darkness(ctx, 0.55, [{ x: 1930, y: 480, r: 520, a: 0.9 }, { x: PA[0], y: PA[1], r: live ? 360 : 140, a: live ? 0.8 : 0.4 }, { x: 1750, y: 500, r: 480, a: 0.6 }]);
  if (red) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; C.glow(ctx, 1930, 480, 520, `rgba(255,40,30,${0.18 * red})`); ctx.restore(); }
  ctx.restore();
  A.dayMark(ctx, t, t0 + 0.1, tSw, 'DAY 30');
  return { vig: 0.6 };
}

const cues = TL => { const s = TL.s, w = TL.w, flip = s('s13_switch') + 0.25, cc = s('s13_cctv');
  return [
    ['sfx/stove', TL.blocks.s12.t0, 0.4, 2.6], ['sfx/plate', w('s12_2', 'you') + 0.6, 0.35], ['sfx/stove', s('s12_days'), 0.25, 4.0],
    ['sfx/beep', flip, 0.9], ['sfx/override', flip + 0.05, 0.6], ['sfx/beep', s('s13_2') + 0.9, 0.5], ['sfx/beep', s('s13_2') + 1.4, 0.5], ['sfx/beep', s('s13_2') + 1.9, 0.5],
    ['../ep1/sfx/heartbeat', cc + 0.2, 0.55], ['../ep1/sfx/riser', cc + 2.0, 0.35, 2.9], ['../ep1/sfx/tvnews', cc + 4.9, 0.2, 0.5],
    ['sfx/paclick', s('s13_click') + 0.4, 0.9], ['sfx/pabreath', s('s13_click') + 0.6, 0.35, 0.9], ['sfx/paclick', s('s13_4') + 3.1, 0.7],
    ['sfx/enginestart', s('s13_engines') - 0.2, 1.0], ['../ep1/sfx/sting', s('s13_end') - 0.4, 0.5]];
};
const music = TL => [['sfx/warm', TL.blocks.s12.t0, TL.s('s12_3'), 0.2], ['sfx/enginebed', TL.blocks.s12.t0, TL.s('s13_6') - 0.2, 0.32], ['../ep1/sfx/music4', TL.s('s13_6') - 0.2, TL.blocks.s13.t1, 0.2]];
module.exports = { s12, s13, cues, music };
