// "Your Tip Wasn't Extra (DoorDash)" — episode 8 (1080x1920, 30 fps), Bold Editorial Collage + 2.5D.
// One machine, the money is the hero: the customer's phone (yellow $1 bricks) and DoorDash's safe (red $1 bricks) both feed one
// glass column, "DRIVER PAY", that stands on a pedestal with the driver's total. Old pay system (2017–2019), illustrative $10 guarantee.
// Hook: TIP $9 -> 9 yellow bricks push 9 red ones out -> they fly back into the safe (SAVED $9) -> the driver still has $10 (+$0).
// The three examples fill the same column (no tip / $3 / $9), each result drops a pay card; "Ten. Ten. Ten." slams the 3 cards over the
// driver; the key moment: 9 yellow bricks REPLACE 9 red ones (DoorDash pays $10 -> $1); a short history card (changed in 2019,
// 2025 New York settlement, no voice); the finale repeats the tap: the expected $19 (ghost bricks) collapses into $10, DoorDash pays $10 -> $1, −$9.
// Usage: node episode.js video out.mp4 | still t1,t2,... out.png | cues
const K = require('../tests/mcd_collage/kit');
const EN = require('../mcd_ep1/engine');
const { text } = require('../rent_ep4/rentkit');
const DK = require('./ddkit');
const { C, F, clamp, lerp, seg, E, spring, hash, rr, cut, flat, tag } = K;
const { BLUE, BLUED, brick, COL, COLH, slotY, columnBack, columnFront, tipPhone, pointer, vault, card, payCard, driver } = DK;
const { W, H, A } = EN;
const p = (t, a, b) => seg(t, a, b);

// ---------- voice-over (Chris) ----------
const ST = { d01: 0.25, d02: 2.95, d03: 5.15, d04: 5.95, d05: 7.65, d06: 8.7, d07: 13.0, d08: 13.75, d09: 15.35, d10: 16.25, d11: 17.55, d12: 18.45,
  d13: 20.0, d14: 20.85, d15: 22.95, d16: 24.25, d17: 27.4, d18: 31.5, d19: 34.5 };
// real end of speech per line (silencedetect; the alignment stretches the last word over the trailing silence)
const SPEECH_END = { d01: 2.38, d02: 1.84, d03: 0.70, d04: 1.21, d05: 0.79, d06: 3.89, d07: 0.56, d08: 1.19, d09: 0.73, d10: 0.89, d11: 0.74, d12: 1.15,
  d13: 0.64, d14: 1.66, d15: 1.05, d16: 1.96, d17: 2.16, d18: 2.72, d19: 2.30 };
const V = EN.voice(`${__dirname}/vo`, ST), at = V.at, T = 37.4;
const w = { tipped: at('d01', 'tipped'), driver: at('d01', 'driver'), nine: at('d01', 'nine'), saved: at('d02', 'saved'), nine2: at('d02', 'nine'), your: at('d03', 'your'),
  cent: at('d04', 'cent'), old: at('d06', 'old'), imagine: at('d06', 'imagine'), guaranteed: at('d06', 'guaranteed'), ten: at('d06', 'ten'),
  ten1: at('d14', 'ten', 0), ten2: at('d14', 'ten', 1), ten3: at('d14', 'ten', 2), disappear: at('d15', 'disappear'), replaced: at('d16', 'replaced'),
  would: at('d16', 'would'), changed: at('d17', 'changed'), y2019: at('d17', '2019'), thought: at('d18', 'thought'), adding: at('d18', 'adding'), pay: at('d18', 'pay'),
  subtracting: at('d19', 'subtracting'), nine3: at('d19', 'nine'), from: at('d19', 'from'), dd: at('d19', 'doordash'), bill: at('d19', 'bill') };
const Q = [ST.d07, ST.d09, ST.d11], ANS = [ST.d08, ST.d10, ST.d12], TIPS = [0, 3, 9];

// ---------- world layout (world units; the home shot is cam {0, -100, 0.92}) ----------
const PH = [-300, -300], PHS = 0.62, BTN = [PH[0], PH[1] + 80 * PHS];                 // the phone and its TIP button
const VA = [300, -170], VAS = 0.8, MOUTH = [VA[0] - 10, VA[1] - 134 * VAS];           // DoorDash's safe and its opening
const CB = 80, FLOOR = 360, DRV = [-335, FLOOR], DRS = 0.95;                          // column base, floor, the driver
const PLATE = [0, 210];
const CHIP_C = [-300, -562], CHIP_D = [300, -562];
const RES = [[320, -95], [320, 60], [320, 215]];                                        // pay cards of the three examples
const S = i => [0, CB + slotY(i)];
const HOV = i => [-290, CB + slotY(i) - 90];                                           // the key moment: the tip hovers left of the column
const bez = (a, c, b, u) => [(1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1]];

// ---------- the money: every $1 brick is a track of bezier hops ----------
// track: { k: 'y'|'r', show, hide, segs: [{t0, t1, a, c, b, s0, s1, e}], fall: [t0], ghostTill, inCol: [tIn, tOut] (counts toward the driver's pay) }
const TR = [];
function addTrack(k, show, segs, o = {}) { const tr = { k, show, segs, hide: o.hide ?? 1e9, fall: o.fall, ghostTill: o.ghostTill ?? -1, inCol: o.inCol, glow: o.glow, slot: o.slot }; TR.push(tr); return tr; }
const hop = (t0, d, a, b, c, s0 = 1, s1 = 1, e = 'inOut') => ({ t0, t1: t0 + d, a, b, c: c || [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 220], s0, s1, e });
const fromLeft = (b, dx = 360) => [b[0] - dx, b[1]];                                   // control point: arrive horizontally from the left
const toSafe = a => [a[0] + 440, a[1] + 10];                                            // control point: leave to the right, then up into the safe
// 1) hook: the column starts full of red; TIP $9 -> yellow i pushes red i out (i = 0..8); everything drains at "Here's how"
const DRAIN0 = 7.95;
const HOOK_Y = i => 0.62 + i * 0.12;
for (let i = 0; i < 10; i++) {
  const tPush = HOOK_Y(i) + 0.47;
  if (i < 9) addTrack('r', 0, [hop(tPush, 0.75, S(i), MOUTH, toSafe(S(i)), 1, 0.7, 'inOut')], { hide: tPush + 0.75, inCol: [0, HOOK_Y(i) + 0.5] });
  else addTrack('r', 0, [], { fall: DRAIN0 + 0.1, inCol: [0, DRAIN0 + 0.1] });
  if (i < 9) addTrack('y', HOOK_Y(i), [hop(HOOK_Y(i), 0.55, BTN, S(i), fromLeft(S(i)), 0.45, 1, 'out')], { fall: DRAIN0 + i * 0.015, inCol: [HOOK_Y(i) + 0.5, DRAIN0] });
}
// 2) the three examples: the tip first (yellow from the phone), then DoorDash tops up to $10 (red from the safe); drained before the next one
const FILL_DONE = [];
for (let k = 0; k < 3; k++) {
  const n = TIPS[k], flush = k < 2 ? Q[k + 1] - 0.25 : null; let last = 0;
  for (let i = 0; i < n; i++) { const t0 = Q[k] + 0.3 + i * 0.07; addTrack('y', t0, [hop(t0, 0.5, BTN, S(i), fromLeft(S(i)), 0.45, 1, 'out')], { fall: flush ? flush + i * 0.012 : null, hide: k === 2 ? 22.6 : 1e9, inCol: [t0 + 0.45, flush ?? 22.6] }); last = Math.max(last, t0 + 0.5); }
  for (let j = 0; j < 10 - n; j++) { const i = n + j, t0 = ANS[k] + 0.15 + j * 0.065; addTrack('r', t0, [hop(t0, 0.5, MOUTH, S(i), [MOUTH[0] - 40, MOUTH[1] - 200], 0.7, 1, 'out')], { fall: flush ? flush + i * 0.012 : null, hide: k === 2 ? 22.6 : 1e9, inCol: [t0 + 0.45, flush ?? 22.6] }); last = Math.max(last, t0 + 0.5); }
  FILL_DONE.push(last);
}
// 3) the key moment: 10 red in the column, the 9-dollar tip hovers on the left; on "REPLACED" yellow i slides in, red i flies back into the safe
const KEY0 = 22.6, KEYPUSH = i => w.replaced + 0.05 + i * 0.12, FIN0 = 31.3;
for (let i = 0; i < 10; i++) {
  if (i < 9) { const tp = KEYPUSH(i); addTrack('r', KEY0, [hop(tp + 0.32, 0.8, S(i), MOUTH, toSafe(S(i)), 1, 0.7, 'inOut')], { hide: tp + 1.12, inCol: [KEY0, tp + 0.4] });
    addTrack('y', KEY0, [hop(tp, 0.42, HOV(i), S(i), [lerp(HOV(i)[0], S(i)[0], 0.5), HOV(i)[1] - 30], 1, 1, 'inOut')], { hide: FIN0, inCol: [tp + 0.4, FIN0], glow: [ST.d15, ST.d15 + 1.6] }); }
  else addTrack('r', KEY0, [], { hide: FIN0, inCol: [KEY0, FIN0] });
}
// 4) the finale: 10 red again; the tap sends 9 ghost bricks ON TOP (the expected $19); on "SUBTRACTING" they drop in and push 9 red out
const FTAP = w.thought + 0.05, FGHOST = i => FTAP + 0.2 + i * 0.08, FSUB = i => w.subtracting + 0.02 + i * 0.055;
for (let i = 0; i < 10; i++) {
  if (i < 9) { const ts = FSUB(i), top = S(10 + i);
    addTrack('y', FGHOST(i), [hop(FGHOST(i), 0.5, BTN, top, fromLeft(top), 0.45, 1, 'out'), hop(ts, 0.4, top, S(i), [-470, lerp(top[1], S(i)[1], 0.5)], 1, 1, 'inOut')], { ghostTill: ts, inCol: [ts + 0.38, 1e9] });
    addTrack('r', FIN0, [hop(ts + 0.3, 0.6, S(i), MOUTH, toSafe(S(i)), 1, 0.7, 'inOut')], { hide: ts + 0.9, inCol: [FIN0, ts + 0.38] }); }
  else addTrack('r', FIN0, [], { inCol: [FIN0, 1e9] });
}
function trackPos(tr, t) {
  if (t < tr.show || t >= tr.hide) return null;
  let pos = null, s = 1, rot = 0, a = 1;
  if (!tr.segs.length) return fallen(tr, t, { x: S(9)[0], y: S(9)[1], s: 1, rot: 0, a: 1 });
  const s0 = tr.segs[0];
  if (t < s0.t0) { pos = s0.a; s = s0.s0; }
  for (const g of tr.segs) { if (t >= g.t0 && t < g.t1) { const u = (E[g.e] || E.inOut)(p(t, g.t0, g.t1)); pos = bez(g.a, g.c, g.b, u); s = lerp(g.s0, g.s1, u); rot = Math.sin(u * Math.PI) * 0.35 * (g.b[0] > g.a[0] ? 1 : -1); }
    else if (t >= g.t1) { pos = g.b; s = g.s1; } }
  return fallen(tr, t, { x: pos[0], y: pos[1], s, rot, a });
}
function fallen(tr, t, o) { if (tr.fall == null || t < tr.fall) return o; const u = t - tr.fall; if (u > 0.55) return null; return { ...o, y: o.y + 1500 * u * u, rot: (hash(o.y) - 0.5) * u * 2, a: 1 - p(u, 0.35, 0.55) }; }
const inCol = (t, k) => TR.filter(tr => tr.inCol && t >= tr.inCol[0] && t < tr.inCol[1] && (!k || tr.k === k)).length;
const isGhost = (tr, t) => t < tr.ghostTill;

// ---------- camera ----------
const HOME = { x: 0, y: 0, z: 1.0 };
const KEYS = [
  { t: 0, x: -300, y: -190, z: 2.05 }, { t: 0.62, x: -292, y: -185, z: 2.12 },                                                   // TIP $9 (close)
  { t: 1.45, x: -60, y: -220, z: 1.22, e: 'inOut' }, { t: 1.95, x: -10, y: -200, z: 1.26 },                                      // follow the tip into the column
  { t: 2.7, x: 250, y: -200, z: 1.5, e: 'inOut' }, { t: 4.8, x: 262, y: -192, z: 1.6 },                                          // the safe: SAVED $9
  { t: 5.35, x: -170, y: 0, z: 1.36, e: 'inOut5' }, { t: 7.55, x: -160, y: -5, z: 1.44 },                                       // the driver: still $10
  { t: 8.55, ...HOME, e: 'inOut' }, { t: 12.9, x: 0, y: 0, z: 1.02 },                                                             // the machine
  { t: 13.4, x: -30, y: -30, z: 1.05, e: 'inOut' }, { t: 15.2, x: 20, y: 10, z: 1.02 }, { t: 15.7, x: -30, y: -25, z: 1.06 }, { t: 17.4, x: 20, y: 5, z: 1.03 },
  { t: 17.9, x: -25, y: -20, z: 1.07 }, { t: 19.8, x: 10, y: 0, z: 1.03 },
  { t: 20.55, x: -335, y: -132, z: 1.9, e: 'inOut5' }, { t: 22.7, x: -328, y: -140, z: 1.98 },                                  // the driver (Ten. Ten. Ten.)
  { t: 23.3, x: -120, y: -200, z: 1.05, e: 'inOut5' }, { t: 26.9, x: -100, y: -205, z: 1.1 },                                   // the key moment
  { t: 31.2, x: -20, y: -60, z: 1.0 },                                                                                            // (behind the history cards)
  { t: 31.3, x: -300, y: -190, z: 2.0, e: 'inOut5' }, { t: 31.9, x: -292, y: -185, z: 2.08 },                                    // the tap again
  { t: 32.7, x: 0, y: -310, z: 0.79, e: 'inOut' }, { t: 34.7, x: 5, y: -305, z: 0.81 },                                        // the expected $19
  { t: 35.25, x: 55, y: -40, z: 0.95, e: 'inOut' }, { t: T, x: 60, y: -35, z: 1.0 },                                             // the real result
];
const cam = EN.camera(KEYS, { breath: t => (t > 35.5 ? 0.4 : 1), shakes: [[HOOK_Y(0) + 0.5, 5], [w.saved + 0.05, 10], [w.cent, 6], [w.ten1, 9], [w.ten2, 11], [w.ten3, 15], [w.replaced + 0.6, 4], [w.nine3 + 0.02, 16]] });

// ---------- background (wall + floor, parallax) ----------
function background(ctx) { ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H); }
function layer(ctx, c, f, draw) { ctx.save(); ctx.translate(c.x * (1 - f), c.y * (1 - f)); draw(); ctx.restore(); }
function backdrop(ctx, t, c) {
  layer(ctx, c, 0.35, () => {                                                                         // far: big colour fields + paper strips
    for (let i = 0; i < 16; i++) { ctx.save(); ctx.translate(-1400 + hash(i * 3) * 2800, -1300 + hash(i * 9) * 2200); ctx.rotate(-0.22 + hash(i) * 0.2);
      ctx.fillStyle = ['rgba(230,57,70,0.08)', 'rgba(77,141,255,0.10)', 'rgba(255,200,87,0.20)'][i % 3]; ctx.fillRect(-190, -28, 380, 56); ctx.restore(); }
    ctx.strokeStyle = 'rgba(23,23,23,0.06)'; ctx.lineWidth = 3; for (let i = -12; i < 12; i++) { ctx.beginPath(); ctx.moveTo(i * 160, -1600); ctx.lineTo(i * 160, 900); ctx.stroke(); } });
  layer(ctx, c, 0.7, () => {                                                                          // mid: halos behind the three players
    for (const [x, y, r, col] of [[PH[0] - 40, PH[1] + 20, 300, 'rgba(255,200,87,0.30)'], [VA[0] + 30, VA[1] - 160, 290, 'rgba(230,57,70,0.13)'], [DRV[0], DRV[1] - 260, 260, 'rgba(77,141,255,0.14)']]) {
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); } });
  flat(ctx, () => rr(ctx, -2600, FLOOR - 6, 5200, 12, 0), '#CFC5B2'); flat(ctx, () => rr(ctx, -2600, FLOOR + 6, 5200, 1400, 0), '#E8DFCC');
  ctx.strokeStyle = 'rgba(23,23,23,0.07)'; ctx.lineWidth = 4; for (let i = -14; i < 14; i++) { ctx.beginPath(); ctx.moveTo(i * 200, FLOOR + 6); ctx.lineTo(i * 290, FLOOR + 700); ctx.stroke(); }
}

// ---------- the world ----------
function world(ctx, t, c) {
  backdrop(ctx, t, c);
  // DoorDash's safe on its shelf
  const doorOpen = Math.max(p(t, 1.0, 1.3) * (1 - p(t, w.saved - 0.25, w.saved)), ...ANS.map((a, k) => p(t, a - 0.25, a + 0.05) * (1 - p(t, FILL_DONE[k] + 0.05, FILL_DONE[k] + 0.35))),
    p(t, KEYPUSH(0) + 0.1, KEYPUSH(0) + 0.4) * (1 - p(t, KEYPUSH(8) + 1.15, KEYPUSH(8) + 1.4)), p(t, FSUB(0) + 0.1, FSUB(0) + 0.35) * (1 - p(t, FSUB(8) + 0.95, FSUB(8) + 1.2)));
  flat(ctx, () => rr(ctx, VA[0] - 190, VA[1] + 2, 380, 26, 6), '#5A6070', 3); for (const g of [-1, 1]) flat(ctx, () => { ctx.beginPath(); ctx.moveTo(VA[0] + g * 140, VA[1] + 26); ctx.lineTo(VA[0] + g * 140, VA[1] + 110); ctx.lineTo(VA[0] + g * 100, VA[1] + 26); ctx.closePath(); }, '#5A6070', 3);
  ctx.save(); ctx.translate(VA[0], VA[1]); ctx.scale(VAS, VAS); vault(ctx, { door: doorOpen, stock: 6, dial: t * 0.4 + (t > w.saved ? 2 : 0) }); ctx.restore();
  // the column + its pedestal (drawn after the bricks so drained bricks fall into it)
  ctx.save(); ctx.translate(0, CB); columnBack(ctx, { guar: E.out(p(t, w.guaranteed - 0.1, w.guaranteed + 0.3)) || (t > 20 ? 1 : 0) }); ctx.restore();
  ghostSlots(ctx, t);
  const ghostExt = E.out(p(t, FGHOST(0) - 0.1, FGHOST(0) + 0.25)) * (1 - p(t, FSUB(0) + 0.1, FSUB(0) + 0.45));
  if (ghostExt > 0) { ctx.save(); ctx.globalAlpha *= ghostExt; ctx.setLineDash([20, 14]); ctx.lineWidth = 6; ctx.strokeStyle = C.yellowD; rr(ctx, -COL.w / 2, CB + slotY(18) - 38, COL.w, slotY(9) - slotY(18) + 10, 18); ctx.stroke(); ctx.restore(); }
  drawBricks(ctx, t, true);
  ctx.save(); ctx.translate(0, CB); columnFront(ctx); ctx.restore();
  pedestal(ctx, t);
  // result cards of the three examples
  for (let k = 0; k < 3; k++) { const t0 = FILL_DONE[k] + 0.1, u = E.out(p(t, t0, t0 + 0.45)); if (u <= 0 || t > 20.6) continue;
    const x = lerp(PLATE[0], RES[k][0], u), y = lerp(PLATE[1], RES[k][1], u) - Math.sin(u * Math.PI) * 160, s = lerp(0.2, 0.45, E.back(p(t, t0, t0 + 0.45), 1.6));
    ctx.save(); ctx.translate(x, y); ctx.rotate([-0.05, 0.04, -0.03][k]); ctx.scale(s, s); payCard(ctx, TIPS[k]); ctx.restore(); }
  chips(ctx, t);
  // the phone (+ the tapping hand)
  const phAway = E.inOut(p(t, 22.6, 22.61)) * (1 - E.inOut(p(t, 27.3, 27.31)));
  if (phAway < 1) { ctx.save(); ctx.translate(PH[0], PH[1]); ctx.scale(PHS, PHS); tipPhone(ctx, { tip: phoneTip(t), press: tapPress(t), flash: tapFlash(t) }); ctx.restore(); }
  hand(ctx, t);
  // the driver
  ctx.save(); driver(ctx, DRV[0], DRV[1], DRS, driverPose(t)); ctx.restore();
  drawBricks(ctx, t, false);                                                                       // flying bricks pass in front of everything
  worldTags(ctx, t);
}
function ghostSlots(ctx, t) {                                                                       // the $10 guarantee as dashed slots (d06 .. the examples)
  const g = t > 8.4 && t < 20.4; if (!g) return;
  for (let i = 0; i < 10; i++) { const u = E.back(p(t, w.guaranteed + i * 0.05, w.guaranteed + 0.25 + i * 0.05), 2); if (u <= 0) continue;
    ctx.save(); ctx.translate(...S(i)); ctx.scale(u, u); ctx.globalAlpha *= 0.75; brick(ctx, 'r', { ghost: true }); ctx.restore(); }
}
function drawBricks(ctx, t, settled) {
  for (const tr of TR) { const b = trackPos(tr, t); if (!b) continue;
    const flying = tr.segs.some(g => t >= g.t0 && t < g.t1); if (flying === settled) continue;
    ctx.save(); ctx.globalAlpha *= b.a; ctx.translate(b.x, b.y); ctx.rotate(b.rot); ctx.scale(b.s, b.s);
    const gl = tr.glow ? Math.sin(clamp(p(t, tr.glow[0], tr.glow[1])) * Math.PI) * (0.6 + 0.4 * Math.sin(t * 14)) : 0;
    brick(ctx, tr.k, { ghost: isGhost(tr, t), glow: gl }); ctx.restore(); }
}
function pedestal(ctx, t) {
  cut(ctx, () => rr(ctx, -200, CB + 22, 400, FLOOR - CB - 22, [10, 10, 0, 0]), '#E3DACA', { sb: 24, sy: 12, lw: 4 });
  flat(ctx, () => rr(ctx, -200, CB + 22, 400, 24, [10, 10, 0, 0]), '#CFC5B2', 3);
  const fin = t > w.subtracting + 0.4, exp = t > w.adding - 0.1 && !fin && t > FIN0, v = plateValue(t);
  const pulse = 1 + 0.06 * Math.sin(clamp(p(t, v.t || 0, (v.t || 0) + 0.35)) * Math.PI);
  ctx.save(); ctx.translate(PLATE[0], PLATE[1]); ctx.scale(pulse, pulse);
  card(ctx, fin ? 'DRIVER TOTAL' : 'DRIVER GETS', v.s, BLUE, { w: 360, h: 196, as: 120, ac: exp ? C.yellowD : C.ink });
  ctx.restore();
}
function plateValue(t) {
  if (t > FIN0 && t > w.adding - 0.1 && t < w.subtracting + 0.4) return { s: '$19?', t: w.adding - 0.1 };
  if (t > w.subtracting + 0.4) return { s: '$10', t: w.subtracting + 0.4 };
  if (t > DRAIN0 - 0.1 && t < 8.3) return { s: '$10', t: 0 };
  const n = inCol(t); return { s: '$' + n, t: 0 };
}
function chips(ctx, t) {
  const on = (t > 8.3 && t < 20.6) || (t > 22.7 && t < 27.4) || false, u = E.back(clamp(p(t, 8.3, 8.6) + (t > 20 ? 1 : 0)), 1.8);
  if (!on) return;
  const y = inCol(t, 'y'), r = inCol(t, 'r'), key = t > 22.7 && t < 27.4;
  if (!key) { ctx.save(); ctx.translate(...CHIP_C); ctx.scale(0.8 * u, 0.8 * u); card(ctx, 'CUSTOMER', '$' + y, C.yellow, { w: 300, h: 170, hc: C.ink, as: 92, ay: 22 }); ctx.restore(); }
  ctx.save(); ctx.translate(...CHIP_D); ctx.scale(0.8 * u, 0.8 * u); card(ctx, key ? 'DOORDASH PAYS' : 'DOORDASH', '$' + r, C.red, { w: 300, h: 170, as: 92, ay: 22, ac: key && r < 10 ? C.red : C.ink }); ctx.restore();
}
function phoneTip(t) { if (t < 12.8) return '$9'; if (t < Q[1]) return '$0'; if (t < Q[2]) return '$3'; return '$9'; }
const TAPS = [0.5, Q[0] + 0.1, Q[1] + 0.12, Q[2] + 0.12, FTAP];
function tapPress(t) { let v = 0; for (const a of TAPS) v = Math.max(v, Math.sin(clamp(p(t, a - 0.05, a + 0.2)) * Math.PI)); return v; }
function tapFlash(t) { let v = 0; for (const a of TAPS) if (t > a) v = Math.max(v, 1 - p(t, a, a + 0.45)); return v; }
function hand(ctx, t) {
  for (const a of TAPS) { const u = p(t, a - 0.45, a) * (1 - p(t, a + 0.25, a + 0.6)); if (u <= 0) continue;
    const press = Math.sin(clamp(p(t, a - 0.05, a + 0.2)) * Math.PI), tip = [BTN[0] + 10, BTN[1] + 6 + press * 6];
    ctx.save(); ctx.translate(tip[0] - (1 - E.out(u)) * 260, tip[1] + (1 - E.out(u)) * 420); ctx.scale(PHS * 0.9, PHS * 0.9); pointer(ctx, 0.5); ctx.restore(); }
}
function driverPose(t) {
  if (t < 5.2) return { look: 1, mood: 'smile', eyes: 1, arms: 'down' };
  if (t < 7.6) return { look: 0.6, mood: t > w.cent ? 'flat' : 'o', eyes: t > w.cent ? 1 : 1.3, arms: t > w.cent - 0.1 ? 'shrug' : 'down', sweat: p(t, w.cent + 0.2, w.cent + 0.6) };
  if (t < 20.3) return { look: 0.8, mood: 'neutral', eyes: 1, arms: 'hips' };
  if (t < 22.75) { // Ten. Ten. Ten. — more stunned with every card
    if (t < w.ten1 - 0.05) return { look: 0.2, mood: 'neutral', eyes: 1.1, arms: 'down' };
    if (t < w.ten2 - 0.05) return { look: -0.7, mood: 'o', eyes: 1.35, arms: 'down', squash: Math.exp(-(t - w.ten1) * 8) };
    if (t < w.ten3 - 0.05) return { look: 0.1, mood: 'o', eyes: 1.65, arms: 'down', squash: Math.exp(-(t - w.ten2) * 8) };
    const s = t - w.ten3; return s < 0.45 ? { look: 0.8, mood: 'o', eyes: 1.95, arms: 'shrug', squash: Math.exp(-s * 6) * 1.4 } : { look: 0, mood: 'flat', eyes: 1, arms: 'shrug', sweat: p(s, 0.45, 0.8), tilt: -0.1 };
  }
  if (t < FIN0) return { look: 0.9, mood: t > w.replaced + 0.6 ? 'flat' : 'neutral', eyes: 1, arms: 'hips', sweat: p(t, w.would, w.would + 0.4) * 0.8 };
  if (t < w.subtracting + 0.3) { const dream = t > w.adding; return { look: 0.9, mood: dream ? 'grin' : 'neutral', eyes: 1, arms: t > w.pay - 0.2 ? 'cheer' : 'down', squash: dream ? Math.exp(-(t - w.pay) * 6) * (t > w.pay ? 1 : 0) : 0 }; }
  return { look: 0.9, mood: 'flat', eyes: 1, arms: 'down', sweat: p(t, w.subtracting + 0.5, w.subtracting + 0.9) };
}
function worldTags(ctx, t) {
  // hook
  tag(ctx, 'SAVED $9', VA[0], VA[1] - 330, { u: p(t, w.saved - 0.05, w.saved + 0.2) * (1 - p(t, 5.0, 5.3)), size: 64, bg: C.red, rot: -0.05 });
  tag(ctx, '+$0', PLATE[0] + 150, PLATE[1] - 140, { u: p(t, w.cent - 0.05, w.cent + 0.2) * (1 - p(t, 7.6, 7.9)), size: 72, bg: C.ink, rot: 0.08 });
  // d06: the guarantee + "EXAMPLE"
  tag(ctx, 'GUARANTEED $10', 0, CB - COLH - 60, { u: p(t, w.ten - 0.1, w.ten + 0.15) * (1 - p(t, 20.3, 20.5)), size: 36, bg: BLUE, rot: -0.02 });
  tag(ctx, 'EXAMPLE', PLATE[0] - 150, PLATE[1] - 105, { u: p(t, w.imagine - 0.05, w.imagine + 0.2) * (1 - p(t, 20.3, 20.5)), size: 30, bg: '#5A5A5A', rot: -0.06, tape: false });
  // the key moment
  tag(ctx, 'YOUR $9 TIP', HOV(8)[0], HOV(8)[1] - 80, { u: p(t, ST.d15 - 0.1, ST.d15 + 0.15) * (1 - p(t, w.replaced - 0.1, w.replaced + 0.15)), size: 50, bg: C.yellow, fg: C.ink, rot: -0.04 });
  if (t > ST.d15 && t < w.replaced) { const u = p(t, w.disappear - 0.1, w.disappear + 0.2); if (u > 0) { ctx.save(); ctx.globalAlpha *= u; ctx.strokeStyle = C.ink; ctx.lineWidth = 9; ctx.lineCap = 'round';
    const x0 = HOV(0)[0], y0 = HOV(0)[1] + 50; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + 0, y0 + 60 * E.out(u)); ctx.stroke(); ctx.restore(); } }
  tag(ctx, 'REPLACED', -40, CB + slotY(4), { u: p(t, KEYPUSH(8) + 0.45, KEYPUSH(8) + 0.7) * (1 - p(t, 27.25, 27.45)), size: 70, bg: C.ink, rot: -0.1 });
  // the finale: the expected $19
  tag(ctx, 'EXPECTED: $19', 0, CB + slotY(18) - 110, { u: p(t, w.adding - 0.05, w.adding + 0.2) * (1 - p(t, FSUB(0), FSUB(0) + 0.2)), size: 56, bg: C.yellow, fg: C.ink, rot: -0.03 });
  // DoorDash's bill: $10 -> $1, and the giant −$9 above it
  const bu = E.back(p(t, w.subtracting + 0.2, w.subtracting + 0.5), 1.8);
  if (bu > 0) { ctx.save(); ctx.translate(VA[0] + 10, 70); ctx.rotate(0.03); ctx.scale(0.95 * bu, 0.95 * bu);
    cut(ctx, () => rr(ctx, -180, -120, 360, 240, 20), '#FFFDF8', { sb: 24, sy: 12, lw: 4 }); flat(ctx, () => rr(ctx, -180, -120, 360, 62, [20, 20, 0, 0]), C.red);
    text(ctx, 'DOORDASH PAYS', 0, -76, 36, '#FFFFFF', F.black, 'center', 330);
    const sk = E.out(p(t, w.nine3 + 0.1, w.nine3 + 0.35)), one = E.back(p(t, w.dd - 0.1, w.dd + 0.2), 2);
    text(ctx, '$10', one > 0 ? -88 : 0, 66, 92, one > 0 ? '#9A9A9A' : C.ink, F.black, 'center', one > 0 ? 160 : 300);
    if (sk > 0) { ctx.strokeStyle = C.red; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo((one > 0 ? -88 : 0) - 85, 36); ctx.lineTo((one > 0 ? -88 : 0) - 85 + 170 * sk, 30); ctx.stroke(); }
    if (one > 0) { text(ctx, '→', 22, 60, 60, C.ink, F.black, 'center'); ctx.save(); ctx.translate(110, 40); ctx.scale(one, one); text(ctx, '$1', 0, 34, 120, C.red, F.black, 'center'); ctx.restore(); }
    ctx.restore(); }
  const mu = p(t, w.nine3 - 0.08, w.nine3 + 0.12);
  if (mu > 0) { const k = lerp(2.6, 1, E.out5(mu)) * (1 + 0.04 * Math.sin(Math.max(0, t - w.nine3) * 5)); ctx.save(); ctx.translate(VA[0] - 25, -230); ctx.rotate(-0.06); ctx.scale(k, k); ctx.globalAlpha *= clamp(mu * 3);
    ctx.font = `210px ${F.black}`; ctx.textAlign = 'center'; ctx.lineJoin = 'round'; ctx.lineWidth = 30; ctx.strokeStyle = '#FFFDF8'; ctx.shadowColor = 'rgba(60,40,20,0.3)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 14;
    ctx.strokeText('−$9', 0, 70); ctx.shadowColor = 'transparent'; ctx.fillStyle = C.red; ctx.fillText('−$9', 0, 70); ctx.lineWidth = 6; ctx.strokeStyle = C.ink; ctx.strokeText('−$9', 0, 70); ctx.restore(); }
}

// ---------- screen-space overlays ----------
function strip(ctx, txt, x, y, size, bg, fg, u, rot = -0.02) { if (u <= 0) return; const k = lerp(1.6, 1, E.out5(clamp(u))); ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k); ctx.globalAlpha *= clamp(u * 3);
  ctx.font = `${size}px ${F.black}`; const tw = Math.min(900, ctx.measureText(txt).width + size * 0.7); cut(ctx, () => rr(ctx, -tw / 2, -size * 0.78, tw, size * 1.12, 10), bg, { lw: 0, sb: 24, sy: 12, edgeW: 12 }); text(ctx, txt, 0, size * 0.18, size, fg, F.black, 'center', tw - size * 0.5); ctx.restore(); }
const TENC = [[250, 430, -0.07], [520, 540, 0.03], [780, 450, 0.08]];
function overlay(ctx, t) {
  // hook: TIP $9 headline over the close-up of the phone
  strip(ctx, 'OLD PAY SYSTEM', A[0], 1290, 84, C.ink, '#FFFFFF', p(t, w.old - 0.1, w.old + 0.15) * (1 - p(t, 12.6, 12.9)));
  // Ten. Ten. Ten. — the three pay cards slam over the driver
  if (t > w.ten1 - 0.2 && t < 23.0) for (let k = 0; k < 3; k++) { const tk = [w.ten1, w.ten2, w.ten3][k] - 0.08, u = p(t, tk, tk + 0.22); if (u <= 0) continue;
    const out = E.in(p(t, 22.55 + k * 0.05, 22.85 + k * 0.05)), s = lerp(2.2, 1.12, E.out5(u)) * (1 + 0.05 * (1 - spring(t - tk - 0.22, 3, 8)) * (u >= 1 ? 1 : 0));
    ctx.save(); ctx.globalAlpha *= clamp(u * 4); ctx.translate(TENC[k][0], TENC[k][1] - out * 1100); ctx.rotate(TENC[k][2]); ctx.scale(s, s); payCard(ctx, TIPS[k]); ctx.restore(); }
  // history (no extra voice for the settlement)
  const h1 = p(t, 27.35, 27.6) * (1 - p(t, 31.05, 31.3));
  if (h1 > 0) {
    const back = E.inOut(p(t, 29.55, 29.95)), y1 = lerp(700, 470, back), s1 = lerp(1, 0.86, back);
    ctx.save(); ctx.globalAlpha *= clamp(h1 * 3); ctx.translate(A[0], y1 + (1 - E.out(clamp(h1 * 2))) * 200); ctx.rotate(-0.02); ctx.scale(s1, s1); history(ctx, t); ctx.restore();
    const sv = E.back(p(t, 29.65, 30.0), 1.5);
    if (sv > 0) { ctx.save(); ctx.globalAlpha *= clamp(sv * 3) * clamp(h1 * 3); ctx.translate(lerp(1300, A[0] + 20, clamp(sv)), 900); ctx.rotate(0.03); settlement(ctx, t); ctx.restore(); }
  }
  // cut back into the world through a paper wipe
  const wp = p(t, 31.15, 31.5); if (wp > 0 && wp < 1) { ctx.save(); ctx.fillStyle = C.yellow; const x = lerp(-W * 1.2, W * 1.2, E.inOut(wp)); ctx.translate(x, 0); ctx.rotate(0.08); ctx.fillRect(-W * 0.45, -300, W * 0.9, H + 600); ctx.restore(); }
}
function history(ctx, t) {
  cut(ctx, () => rr(ctx, -420, -230, 840, 460, 26), '#FFFDF8', { sb: 34, sy: 16, lw: 4 });
  flat(ctx, () => rr(ctx, -420, -230, 840, 100, [26, 26, 0, 0]), C.ink); text(ctx, 'OLD PAY SYSTEM', 0, -158, 60, '#FFFFFF', F.black, 'center', 760);
  const X = y => -300 + (y - 2017) * 200, ly = 30;
  ctx.strokeStyle = C.ink; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-360, ly); ctx.lineTo(360, ly); ctx.stroke();
  for (let y = 2017; y <= 2020; y++) { ctx.beginPath(); ctx.moveTo(X(y), ly - 18); ctx.lineTo(X(y), ly + 18); ctx.stroke(); text(ctx, String(y), X(y), ly + 66, 40, y === 2020 ? '#9A9A9A' : C.ink, F.black, 'center'); }
  const bar = E.inOut(p(t, 27.55, 28.15)); if (bar > 0) { ctx.strokeStyle = C.red; ctx.lineWidth = 30; ctx.beginPath(); ctx.moveTo(X(2017), ly - 46); ctx.lineTo(lerp(X(2017), X(2019), bar), ly - 46); ctx.stroke(); }
  if (bar > 0.6) text(ctx, '2017–2019', -100, -42, 54, C.red, F.black, 'center');
  const st = p(t, w.changed - 0.05, w.changed + 0.15); if (st > 0) { const k = lerp(1.8, 1, E.out5(st)); ctx.save(); ctx.translate(X(2019) - 10, ly + 150); ctx.rotate(-0.05); ctx.scale(k, k); ctx.globalAlpha *= clamp(st * 3);
    ctx.font = `46px ${F.black}`; const tw = ctx.measureText('CHANGED IN 2019').width + 40; cut(ctx, () => rr(ctx, -tw / 2, -40, tw, 76, 10), BLUE, { sb: 14, sy: 7, lw: 0, edgeW: 10 }); text(ctx, 'CHANGED IN 2019', 0, 16, 46, '#FFFFFF', F.black, 'center'); ctx.restore(); }
}
function settlement(ctx) {
  cut(ctx, () => rr(ctx, -380, -200, 760, 400, 24), '#FFFDF8', { sb: 34, sy: 16, lw: 4 });
  flat(ctx, () => rr(ctx, -380, -200, 760, 150, [24, 24, 0, 0]), C.red);
  text(ctx, '2025 NEW YORK', 0, -128, 60, '#FFFFFF', F.black, 'center', 700); text(ctx, 'SETTLEMENT', 0, -70, 54, '#FFFFFF', F.black, 'center', 700);
  text(ctx, '$16.75', 0, 92, 150, C.ink, F.black, 'center', 700); text(ctx, 'MILLION', 0, 160, 56, C.ink, F.black, 'center', 700);
  ctx.save(); ctx.translate(-300, -190); ctx.rotate(-0.6); ctx.fillStyle = 'rgba(255,240,200,0.8)'; ctx.fillRect(-50, -14, 100, 28); ctx.restore();
}

// ---------- subtitles (hand-made phrase groups, numbers as digits) ----------
const SPLIT = { d01: [4, 3], d02: [5], d03: [3], d04: [6], d05: [4], d06: [5, 7], d07: [2], d08: [4], d09: [2], d10: [3], d11: [2], d12: [4], d13: [3], d14: [1, 1, 1], d15: [4], d16: [6], d17: [6], d18: [7, 4], d19: [4, 3] };
const REPL = [[/nine dollars/i, '$9'], [/ten bucks/i, '$10'], [/all ten/i, 'all $10'], [/^Three-dollar/i, '$3'], [/^Nine-dollar/i, '$9'], [/paid seven/i, 'paid $7'], [/just ONE/i, 'just $1'], [/SUBTRACTING nine/i, 'subtracting $9'],
  [/SAVED/, 'saved'], [/CENT/, 'cent'], [/REPLACED/, 'replaced'], [/ADDING/, 'adding']];
function manualSubs() {
  const G = [];
  Object.keys(ST).forEach(id => { const ws = V.words(id); let k = 0; SPLIT[id].forEach(n => { G.push({ id, words: ws.slice(k, k + n) }); k += n; }); if (k !== ws.length) throw new Error(`subtitle split ${id}: ${k} vs ${ws.length}`); });
  G.forEach((g, i) => { const nx = G[i + 1], end = Math.min(g.words[g.words.length - 1].t1, ST[g.id] + SPEECH_END[g.id]) + 0.45; g.t0 = g.words[0].t0 - 0.05;
    g.t1 = nx ? (nx.id === g.id ? nx.words[0].t0 - 0.05 : Math.min(end, nx.words[0].t0 - 0.05)) : T;
    let s = g.words.map(x => x.w).join(' '); for (const [a, b] of REPL) s = s.replace(a, b); g.text = s; });
  const tens = G.filter(g => g.id === 'd14'); tens.forEach((g, i) => { g.text = Array(i + 1).fill('$10.').join(' '); });
  return G;
}

const ep = {
  T, cam, background, overlay, world,
  worldBlur: t => Math.max(8 * E.inOut(p(t, 27.3, 27.6)) * (1 - E.inOut(p(t, 31.2, 31.45))), 5 * E.inOut(p(t, w.ten1 - 0.3, w.ten1)) * (1 - E.inOut(p(t, 22.6, 22.9)))),
  fg: [ { k: 'bill', x: 70, y: 380, s: 1.2, rot: 0.4, par: 1.6, blur: 7, t0: 0, t1: T + 1, tr: 8.6, a: 0.85 },
        { k: 'coin', x: 990, y: 1290, s: 1.0, rot: 0, par: 1.7, blur: 8, t0: 0, t1: T + 1, tr: 8.6, a: 0.8 },
        { k: 'bill', x: 1010, y: 230, s: 1.0, rot: -0.3, par: 1.5, blur: 8, t0: 0, t1: T + 1, tr: 8.6, a: 0.75 },
        { k: 'coin', x: 60, y: 1420, s: 0.9, rot: 0, par: 1.8, blur: 9, t0: 0, t1: T + 1, tr: 8.6, a: 0.75 } ],
  subs: manualSubs(),
  subStyle: { y: 1565, size: 62, maxW: 820, highlight: ['saved', 'cent', 'replaced', 'adding', 'subtracting', 'just', '$1', '2019'] },
  vo: Object.entries(ST),
  music: { b0: 0.0, explain: ST.d05, ten: ST.d13, key: ST.d15, hist: 27.35, fin: FIN0, hit: w.nine3, end: T },
  cues() {
    const c = [['pop', 0.48], ['kaching', 0.52, 0.45], ['whoosh', 0.62, 0.6]];
    for (let i = 0; i < 9; i++) { c.push(['tick', HOOK_Y(i) + 0.5, 0.8]); if (i % 3 === 0) c.push(['whoosh', HOOK_Y(i) + 0.48, 0.35]); }
    c.push(['flap', 1.05, 0.6], ['whoosh', 2.0, 0.5], ['coins', 2.4, 0.5], ['slam', w.saved, 0.7], ['stamp', w.saved + 0.02, 0.4], ['whoosh', 4.9, 0.5], ['pop', w.cent], ['wah', w.cent + 0.25, 0.5]);
    c.push(['fall', DRAIN0, 0.5], ['whoosh', 7.9, 0.6], ['tag', w.old], ['pop', w.guaranteed], ['tick', w.guaranteed + 0.1], ['tick', w.guaranteed + 0.25], ['tick', w.guaranteed + 0.4], ['tag', w.ten], ['tag', w.imagine]);
    for (let k = 0; k < 3; k++) { c.push(['pop', TAPS[k + 1]], ['flap', ANS[k] - 0.2, 0.5]); if (TIPS[k] === 0) c.push(['puff', Q[k] + 0.3]);
      for (let i = 0; i < TIPS[k]; i++) c.push(['tick', Q[k] + 0.3 + i * 0.07 + 0.45, 0.7]);
      for (let j = 0; j < 10 - TIPS[k]; j++) c.push(['tick', ANS[k] + 0.15 + j * 0.065 + 0.45, 0.6]);
      c.push(['kaching', FILL_DONE[k] + 0.05, 0.35], ['paper', FILL_DONE[k] + 0.15]); if (k < 2) c.push(['fall', Q[k + 1] - 0.25, 0.35]); }
    c.push(['whoosh', 20.1, 0.7], ['slam', w.ten1, 0.6], ['thump', w.ten1, 0.5], ['slam', w.ten2, 0.65], ['thump', w.ten2, 0.55], ['slam', w.ten3, 0.75], ['boom', w.ten3, 0.3], ['pop', w.ten3 + 0.5], ['whoosh', 22.6, 0.6]);
    c.push(['tag', ST.d15], ['rise', w.disappear - 0.2, 0.5]);
    for (let i = 0; i < 9; i++) c.push(['tick', KEYPUSH(i) + 0.38, 0.9], ['whoosh', KEYPUSH(i) + 0.34, 0.18]);
    c.push(['flap', KEYPUSH(0) + 0.1, 0.5], ['coins', KEYPUSH(4) + 0.9, 0.5], ['stamp', KEYPUSH(8) + 0.5, 0.5], ['slam', KEYPUSH(8) + 1.2, 0.35]);
    c.push(['whoosh', 27.3, 0.7], ['paper', 27.45], ['tape', 27.6], ['scratch', 27.6, 0.6], ['stamp', w.changed, 0.6], ['whoosh', 29.6, 0.6], ['paper', 29.8], ['stamp', 30.0, 0.5]);
    c.push(['cut', 31.2, 0.8], ['pop', FTAP], ['kaching', FTAP + 0.03, 0.4]);
    for (let i = 0; i < 9; i++) c.push(['tick', FGHOST(i) + 0.45, 0.6]);
    c.push(['rise', w.adding - 0.2, 0.6], ['tag', w.adding], ['pop', w.pay]);
    c.push(['fall', w.subtracting, 0.6]); for (let i = 0; i < 9; i++) c.push(['tick', FSUB(i) + 0.38, 0.8]);
    c.push(['pop', w.subtracting + 0.25], ['slam', w.nine3, 0.9], ['boom', w.nine3, 0.75], ['stamp', w.nine3 + 0.02, 0.6], ['tag', w.dd], ['thump', w.bill, 0.45]);
    return c;
  },
};
EN.cli(ep, __dirname);
module.exports = ep;
