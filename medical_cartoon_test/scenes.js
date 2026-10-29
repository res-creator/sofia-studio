// "YOUR BODY AT 3 AM" – 15 s choreography. frame(ctx, t) draws everything for time t (seconds).
const A = require('./art'); const S = require('./sets'); const C = require('./characters');
const { TAU, INK, clamp, lerp, ease, kf, pulse, fillInk, ell, rrect, text } = A;
const W = 1920, H = 1080;
const FLOOR = 930;
const T = { bedEnd: 3.0, slam: 4.3, shotMB: 4.05, shotMH: 7.0, shotMS: 9.0, shotCU: 11.0, shotRX: 13.3, fade0: 14.5 };

// ---------- speech bubbles ----------
function popScale(t, t0) { const u = (t - t0) / 0.28; return u <= 0 ? 0 : u >= 1 ? 1 : ease.back(u); }
function bubble(ctx, o, t) {
  const sc = popScale(t, o.t0); if (sc <= 0 || t > o.t1) return;
  const wob = Math.sin((t - o.t0) * (o.wob || 9)) * (o.wobAmt || 0.02);
  ctx.save(); ctx.translate(o.cx, o.cy); ctx.rotate((o.rot || 0) + wob); ctx.scale(sc, sc * (1 + Math.sin((t - o.t0) * 7) * 0.015));
  let p = new Path2D();
  if (o.type === 'burst') p = A.burst(ctx, 0, 0, o.rx, o.ry, 14, o.t0 * 3, 0.1);
  else if (o.type === 'cloud') { const n = 11; for (let i = 0; i < n; i++) { const a = i / n * TAU, x = Math.cos(a) * o.rx * 0.86, y = Math.sin(a) * o.ry * 0.82; p.moveTo(x + o.rx * 0.2, y); p.arc(x, y, o.rx * 0.2 + o.ry * 0.12, 0, TAU); } p.ellipse(0, 0, o.rx * 0.9, o.ry * 0.85, 0, 0, TAU); }
  else p.roundRect(-o.rx, -o.ry, o.rx * 2, o.ry * 2, o.ry * 0.7);
  if (o.tail) { const tp = new Path2D(); const [tx, ty] = [o.tail[0] - o.cx, o.tail[1] - o.cy]; const ang = Math.atan2(ty, tx), bx = Math.cos(ang) * o.rx * 0.55, by = Math.sin(ang) * o.ry * 0.7; tp.moveTo(bx - Math.sin(ang) * 36, by + Math.cos(ang) * 36); tp.lineTo(tx, ty); tp.lineTo(bx + Math.sin(ang) * 36, by - Math.cos(ang) * 36); tp.closePath(); fillInk(ctx, tp, o.fill, 8); }
  ctx.lineWidth = 18; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.fillStyle = o.fill; ctx.stroke(p); ctx.fill(p);
  if (o.tail) { // hide seam where the tail meets the body
    const [tx, ty] = [o.tail[0] - o.cx, o.tail[1] - o.cy]; const ang = Math.atan2(ty, tx), bx = Math.cos(ang) * o.rx * 0.55, by = Math.sin(ang) * o.ry * 0.7;
    ctx.fillStyle = o.fill; ctx.beginPath(); ctx.moveTo(bx - Math.sin(ang) * 30, by + Math.cos(ang) * 30); ctx.lineTo(bx * 1.25 + Math.cos(ang) * 6, by * 1.25 + Math.sin(ang) * 6); ctx.lineTo(bx + Math.sin(ang) * 30, by - Math.cos(ang) * 30); ctx.closePath(); ctx.fill();
  }
  const n = o.lines.length; o.lines.forEach((ln, i) => text(ctx, ln, 0, (i - (n - 1) / 2) * o.size * 1.02, o.size, o.col, { stroke: o.strokeW === undefined ? o.size * 0.14 : o.strokeW, strokeCol: o.strokeCol || INK }));
  ctx.restore();
}

// ---------- choreography ----------
const BR = { x: 640, s: 1.3 }, HE = { x: 1130, s: 1.3 }, ST = { x: 1530, s: 1.15 };
const blinkAt = (t, list) => { for (const b of list) { const u = (t - b) / 0.16; if (u > 0 && u < 1) return Math.sin(u * Math.PI); } return 0; };

function brainPose(t) {
  const p = { x: BR.x, y: FLOOR, s: BR.s, t, mouth: { open: 0, curve: -0.25, w: 70 }, armL: { x: -120, y: -10, pose: 'flat', bend: 0.3 }, armR: { x: 180, y: -2, pose: 'flat', bend: -0.3 } };
  p.blink = blinkAt(t, [3.0, 5.4, 8.2, 13.9]);
  p.lid = kf(t, [[3.2, 0.32], [3.3, 0, 'out'], [6.6, 0], [7.0, 0.3], [13.0, 0.3], [13.3, 0]]);
  p.lookX = kf(t, [[3.0, -0.2], [3.25, -0.2, 'hold'], [3.32, 0.4, 'out'], [6.7, 0.4, 'hold'], [7.0, 1, 'out'], [13.3, 1]]);
  p.lookY = kf(t, [[3.0, 0.7], [3.25, 0.7, 'hold'], [3.32, -0.9, 'out'], [4.2, -0.9], [4.3, 0.4], [4.6, -0.5], [6.6, -0.3], [7.0, 0.1]]);
  p.pupil = kf(t, [[3.25, 1], [3.34, 0.6, 'out'], [3.9, 0.6], [4.3, 1]]);
  p.angry = kf(t, [[3.3, 0], [3.34, -0.3, 'out'], [3.7, -0.3], [4.15, 0.9], [6.6, 0.9], [7.0, 0.55], [13.0, 0.55], [13.3, 0.2]]);
  p.browY = kf(t, [[3.25, 0], [3.34, -1, 'out'], [3.8, -0.8], [4.1, 0.5], [6.6, 0.3], [7.0, 0]]);
  p.sweat = kf(t, [[3.3, 0], [3.6, 1, 'out'], [9, 1]]);
  p.zap = Math.max(pulse(t, 3.3, 0.5), pulse(t, 4.3, 0.5), pulse(t, 5.6, 0.4) * 0.7);
  // body
  p.lean = kf(t, [[3.25, 0], [3.34, -0.1, 'out'], [3.5, -0.03], [3.9, -0.06], [4.28, -0.14], [4.34, 0.1, 'in'], [4.6, 0.02], [6.6, 0.02], [7, 0], [13.3, 0.0], [13.5, 0.12], [14.3, 0.14]]);
  p.sy = kf(t, [[3.25, 1], [3.34, 1.1, 'out'], [3.6, 1], [4.1, 1.06], [4.3, 1.1], [4.36, 0.88, 'out'], [4.6, 1], [13.4, 1], [13.5, 0.9, 'out'], [14.3, 0.93]]);
  p.sx = 1 / Math.sqrt(p.sy);
  p.bob = Math.sin(t * 2.4) * 3 + pulse(t, 4.3, 0.35) * 14 + pulse(t, 13.4, 0.5) * 12;
  const sh = (t > 5.0 && t < 6.5) ? Math.sin(t * 22) * 6 : 0; // frustrated tremble
  // arms
  const ex = ease.in(clamp((t - 4.06) / 0.24)); // slam descent
  let L = { x: -120, y: -10, pose: 'flat', bend: 0.3 }, R = { x: 180, y: -2, pose: 'flat', bend: -0.3 };
  if (t > 3.3 && t < 3.45) { L = { x: lerp(-120, -140, ease.out((t - 3.3) / 0.15)), y: lerp(-10, -90, ease.out((t - 3.3) / 0.15)), pose: 'fist', bend: 0.5 }; }
  if (t >= 3.45 && t < 3.8) { const u = (t - 3.45) / 0.35; L = { x: -134, y: kf(t, [[3.45, -50], [3.52, -2, 'in'], [3.62, -6], [3.8, -70, 'out']]), pose: 'fist', bend: 0.4 }; }
  if (t >= 3.8 && t < 4.3) L = { x: lerp(-134, -200, ease.io((t - 3.8) / 0.4)), y: lerp(-70, -150, ease.io((t - 3.8) / 0.4)), pose: 'fist', bend: 0.5 };
  if (t >= 4.3) L = { x: kf(t, [[4.3, -200], [4.9, -230], [5.7, -190], [6.2, -240], [6.6, -260], [7.0, -200]]), y: kf(t, [[4.3, -150], [4.8, -230], [5.2, -140], [5.7, -300], [6.1, -150], [6.4, -330], [6.7, -90], [7.0, -20]]) + sh, pose: t < 5.7 ? 'open' : t < 6.5 ? 'claw' : 'open', bend: 0.45 };
  if (t > 3.8 && t < 4.3) { R = { x: lerp(180, 200, ex), y: kf(t, [[3.8, -2], [4.06, -340, 'out'], [4.28, -2, 'in']]), pose: 'fist', bend: -0.5 }; }
  if (t >= 4.3 && t < 4.7) R = { x: 195, y: kf(t, [[4.3, 0], [4.45, -4, 'hold'], [4.7, -40]]), pose: 'fist', bend: -0.4 };
  if (t >= 4.7) R = { x: kf(t, [[4.7, 195], [5.0, 280], [5.7, 270], [6.2, 200], [6.6, 230], [7, 190]]), y: kf(t, [[4.7, -40], [5.0, -300], [5.5, -290], [5.8, -250], [6.2, -330], [6.6, -80], [7, -10]]) + sh, pose: t < 5.7 ? 'point' : t < 6.5 ? 'claw' : 'open', bend: -0.5 };
  if (t >= 7.0) { L = { x: -140, y: -50 + Math.sin(t * 2) * 6, pose: 'fist', bend: 0.5 }; R = { x: 150, y: -60 + Math.sin(t * 2 + 1) * 6, pose: 'fist', bend: -0.5 }; }
  if (t >= 13.2) { const u = ease.out(clamp((t - 13.3) / 0.16)); const d = clamp((t - 13.6) / 0.9) * 8; L = { x: lerp(-140, -52, u), y: lerp(-50, -110 + d, u), pose: 'flat', bend: 0.9 }; R = { x: lerp(150, 52, u), y: lerp(-60, -110 + d, u), pose: 'flat', bend: -0.9 }; }
  p.armL = L; p.armR = R;
  // mouth
  const shout = t > 4.35 && t < 6.5;
  p.mouth = shout ? { open: 0.35 + 0.45 * Math.abs(Math.sin(t * 13)), curve: -0.5, w: 84, teeth: true } : kf(t, [[3.3, 0]]) || {};
  if (!shout) p.mouth = t > 3.32 && t < 4.3 ? { open: 0.5, curve: -0.3, w: 60, teeth: true } : t >= 6.5 && t < 13.3 ? { open: 0, curve: -0.6, w: 70, wob: 0 } : t >= 13.3 ? { open: 0.25, curve: -0.7, w: 56 } : { open: 0, curve: -0.25, w: 70 };
  return p;
}

function heartPose(t) {
  const p = { x: HE.x, y: FLOOR, s: HE.s, t, mouth: { open: 0.3, curve: -0.2, w: 54 } };
  p.blink = blinkAt(t, [3.6, 6.1, 9.7]);
  const panic = clamp((t - 6.9) / 0.35) * (1 - clamp((t - 10.5) / 1.2) * 0.5);
  const horror = clamp((t - 13.3) / 0.12);
  p.angry = kf(t, [[3, -0.4], [4.3, -0.7], [7, -0.9], [13.3, -0.9]]);
  p.browY = kf(t, [[3, -0.3], [4.3, -0.9], [13.3, -1.2]]);
  p.sweat = 1;
  p.pupil = kf(t, [[3, 1], [4.28, 1], [4.34, 0.62, 'out'], [5, 0.85], [6.9, 0.85], [7.0, 0.6], [13.3, 0.6], [13.4, 0.48, 'out']]);
  p.lookX = kf(t, [[3, 0.2], [3.3, 0.2], [3.4, 0.1], [4.3, 0.1], [4.4, -1, 'out'], [6.4, -1], [6.6, -0.9], [13.3, 0.2], [13.5, 0.75]]);
  p.lookY = kf(t, [[3, -0.3], [3.3, -0.6], [4.3, -0.2], [6.0, 0], [13.3, 0.1]]);
  const bp = (t > 4.3 ? 9 : 5) * t;
  p.beat = Math.pow(Math.abs(Math.sin(bp)), 6) * (0.5 + 0.5 * panic) + horror * 0.2;
  const jump = pulse(t, 3.3, 0.4) * 26 + pulse(t, 4.3, 0.5) * 48;
  const flail = panic * Math.abs(Math.sin(t * 9)) * 36;
  p.bob = -jump - flail + Math.sin(t * 3) * 2;
  p.step = panic * t * 18; p.amp = panic * 22 + (jump > 3 ? 14 : 0);
  p.lean = Math.sin(t * 24) * 0.012 * (1 + panic * 2) + kf(t, [[6.3, 0], [7.0, -0.08, 'out'], [9, 0.05], [13.3, 0.04]]);
  p.sx = kf(t, [[6.3, 1], [6.9, 0.88, 'out'], [7.4, 1], [13.3, 1]]);
  p.sy = 1 + pulse(t, 4.3, 0.2) * 0.1 - pulse(t, 7.1, 0.15) * 0.08;
  // arms
  const sh = Math.sin(t * 40) * 3;
  let L, R;
  if (t < 4.3) { const wr = Math.sin(t * 9) * 8; L = { x: -62 + wr, y: -122 + sh, pose: 'claw', bend: 0.5 }; R = { x: 62 - wr, y: -124 - sh, pose: 'claw', bend: -0.5 }; const j = pulse(t, 3.3, 0.4); L.y -= j * 120; L.x -= j * 90; R.y -= j * 120; R.x += j * 90; L.pose = R.pose = j > 0.3 ? 'open' : 'claw'; }
  else if (t < 7.0) { const j = pulse(t, 4.3, 0.55); L = { x: -62 - j * 140 + Math.sin(t * 9) * 6, y: -122 - j * 130 + sh, pose: 'open', bend: 0.5 }; R = { x: 62 + j * 140 - Math.sin(t * 9) * 6, y: -124 - j * 130 - sh, pose: 'open', bend: -0.5 }; if (t > 6.6) { R.x = 120; R.y = -150; R.pose = 'point'; } }
  else if (t < 13.3) { const k = panic, a = Math.sin(t * 11), b = Math.sin(t * 11 + 2.2); L = { x: lerp(-62, -215, k) + a * 26, y: lerp(-122, -270, k) + b * 50, pose: 'open', bend: 0.6 }; R = { x: lerp(62, 215, k) - b * 26, y: lerp(-124, -270, k) + a * 50, pose: 'open', bend: -0.6 }; }
  else { const u = ease.out(clamp((t - 13.3) / 0.2)); const tr = Math.sin(t * 38) * 2.5; L = { x: lerp(-215, -100, u) + tr, y: lerp(-250, -78, u), pose: 'open', bend: 0.7 }; R = { x: lerp(215, 100, u) - tr, y: lerp(-250, -78, u), pose: 'open', bend: -0.7 }; }
  p.armL = L; p.armR = R;
  p.mouth = t < 4.3 ? { open: 0.25 + Math.sin(t * 9) * 0.06, curve: -0.5, w: 50, wob: 0 } : t < 4.4 ? { open: 0.9, curve: 0, w: 44 } : t < 6.9 ? { open: 0.0, curve: -0.6, w: 50, wob: 3 } : t < 9.6 ? { open: 0.55 + 0.4 * Math.abs(Math.sin(t * 12)), curve: -0.2, w: 76, teeth: true } : t < 13.3 ? { open: 0.35, curve: -0.5, w: 60, wob: 0 } : { open: 0.95, curve: -0.1, w: 70, teeth: true };
  if (t >= 9.6 && t < 13.3) p.mouth = { open: 0.12, curve: -0.6, w: 50, wob: 3 };
  return p;
}

const PIZZA = (cheese) => (ctx) => { // slice drawn in the stomach's hand space (tip pointing up-left)
  ctx.save(); ctx.rotate(-0.9); ctx.translate(-8, -12);
  const s = new Path2D(); s.moveTo(0, 0); s.lineTo(-40, -100); s.bezierCurveTo(-10, -118, 30, -118, 60, -100); s.closePath();
  fillInk(ctx, s, '#ffc247', 6);
  fillInk(ctx, new Path2D('M-44 -98 C -10 -128 34 -128 64 -98 C 60 -84 -40 -84 -44 -98 Z'), '#e0953a', 6);
  ctx.fillStyle = '#e8413c'; for (const [x, y] of [[-6, -62], [14, -86], [-18, -90], [18, -44]]) { ctx.beginPath(); ctx.ellipse(x, y, 9, 8, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3.5; ctx.stroke(); }
  ctx.strokeStyle = '#ffe07a'; ctx.lineWidth = 6; ctx.lineCap = 'round'; if (cheese > 0.01) { const L = 30 + cheese * 70; ctx.beginPath(); ctx.moveTo(2, 4); ctx.bezierCurveTo(4, 4 + L * 0.4, -2, L * 0.7, 2, L); ctx.stroke(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.globalAlpha = 0.35; ctx.stroke(); ctx.globalAlpha = 1; }
  ctx.restore();
};
function stomachPose(t) {
  const p = { x: ST.x, y: FLOOR, s: ST.s, t, legSpread: 62, zzz: t < 8.3, mouth: { open: 0, curve: -0.3, w: 84 } };
  const wake = clamp((t - 7.4) / 1.3);
  p.lid = kf(t, [[3, 0.96], [7.3, 0.96], [8.0, 0.7, 'out'], [8.4, 0.62], [9.4, 0.5], [10.2, 0.42], [11.0, 0.5], [11.5, 0.42], [13.3, 0.4]]);
  p.blink = t > 9.0 ? blinkAt(t, [9.5, 10.4, 11.6, 12.9]) * 0.9 : 0;
  p.angry = kf(t, [[3, -0.15], [8, -0.15], [10.8, 0.25], [11.3, 0.3], [13.3, 0.1]]);
  p.browY = kf(t, [[3, 0.4], [8.0, 0.4], [8.6, -0.2], [11, 0.1]]);
  p.lookX = kf(t, [[3, 0], [8.8, 0.1], [9.4, -0.6], [10.2, -0.9], [10.8, -0.9], [11.2, 0], [12.0, -0.6], [12.5, -0.3], [13.3, 0.2]]);
  p.lookY = kf(t, [[3, 0.8], [8, 0.6], [9.2, 0.1], [11, 0.2], [12.1, 0.6], [12.6, -0.2]]);
  p.drool = t < 8.4 ? 0.4 + 0.6 * clamp((t - 3) / 5) : Math.max(0, 1 - (t - 8.4) * 0.8);
  p.lean = kf(t, [[3, 0.16], [7.4, 0.16], [8.3, 0.1], [9.0, 0.06], [9.8, -0.02], [10.8, 0.0], [11.4, -0.04], [13.3, -0.02]]) + Math.sin(t * 1.9) * 0.01;
  p.sy = (t < 8.4 ? 0.93 + Math.sin(t * 1.9) * 0.025 : kf(t, [[8.4, 0.95], [9.0, 1.0], [9.4, 1.0], [9.7, 1.08, 'out'], [10.2, 0.96], [10.5, 1.0]]));
  p.sx = 1 / Math.sqrt(p.sy);
  p.bob = t < 8.4 ? 6 : kf(t, [[8.4, 6], [9.0, 0]]);
  p.rumble = pulse(t, 10.55, 0.5) * (0.5 + 0.5 * Math.sin(t * 40)) + pulse(t, 12.85, 0.3);
  // arms
  let L = { x: -150, y: -40, pose: 'open', bend: 0.5 }, R = { x: 150, y: -10, pose: 'open', bend: -0.5 };
  L = { x: -165 + Math.sin(t * 1.9) * 3, y: -20, pose: 'open', bend: 0.5 }; R = { x: 120, y: -8, pose: 'open', bend: -0.5 };
  if (t > 9.3 && t < 10.3) { const u = Math.sin(clamp((t - 9.3) / 1.0) * Math.PI); L = { x: lerp(-165, -80, u), y: lerp(-20, -130, u) + Math.sin(t * 16) * 4 * u, pose: 'fist', bend: 0.9 }; }
  if (t > 10.4 && t < 11.0) { const u = Math.sin(clamp((t - 10.4) / 0.6) * Math.PI); R = { x: lerp(120, 40, u), y: lerp(-8, -60, u) + Math.sin(t * 30) * 3, pose: 'flat', bend: -0.5 }; }
  if (t >= 11.8) { // reach for the pizza box, haul a slice up to the mouth, bite
    const ur = ease.io(clamp((t - 11.8) / 0.45)), up = ease.out(clamp((t - 12.3) / 0.45)), bite = pulse(t, 12.8, 0.3);
    const rx = lerp(-165, -205, ur), ry = lerp(-20, 22, ur);
    L = { x: lerp(rx, -92, up), y: lerp(ry, -100, up) - bite * 12, pose: up > 0.3 ? 'fist' : 'claw', bend: 0.6, hold: t > 12.25 ? PIZZA(1 - up) : null };
  }
  p.armL = L; p.armR = R;
  p.mouth = t < 8.4 ? { open: 0.05 + 0.02 * Math.sin(t * 1.9), curve: -0.2, w: 70 } : t < 9.3 ? { open: 0, curve: -0.5, w: 80 } : t < 10.2 ? { open: 0.9 * Math.sin(clamp((t - 9.3) / 0.9) * Math.PI), curve: -0.1, w: 70, tongue: true } : t < 11.35 ? { open: 0, curve: -0.6, w: 90 } : t < 12.2 ? { open: 0.2 + 0.3 * Math.abs(Math.sin((t - 11.35) * 8)), curve: -0.1, w: 70 } : t < 12.78 ? { open: 0, curve: -0.2, w: 90 } : t < 13.3 ? { open: 0.6 * Math.abs(Math.sin((t - 12.78) * 10)) + 0.1, curve: 0.2, w: 80, teeth: true } : { open: 0.25 + 0.3 * Math.abs(Math.sin(t * 9)), curve: 0.4, w: 84, teeth: true };
  return p;
}

// ---------- camera ----------
function camera(t) {
  let c;
  if (t < T.shotMB) { const u = clamp((t - 3.0) / 1.05); c = { cx: 960, cy: 560, z: lerp(1.0, 1.07, u) }; }
  else if (t < T.shotMH) { const u = clamp((t - T.shotMB) / 3); c = { cx: 790, cy: 530, z: lerp(1.28, 1.36, u) }; }
  else if (t < T.shotMS) { const u = clamp((t - T.shotMH) / 2); c = { cx: 1190, cy: 540, z: lerp(1.34, 1.28, u) }; }
  else if (t < T.shotCU) { const u = clamp((t - T.shotMS) / 2); c = { cx: lerp(1470, 1500, u), cy: 640, z: lerp(1.85, 1.95, u) }; }
  else if (t < T.shotRX) { const u = clamp((t - T.shotCU) / 2.3); c = { cx: lerp(1500, 1470, u), cy: lerp(700, 690, u), z: lerp(2.35, 2.55, u) }; }
  else { const u = clamp((t - T.shotRX) / 1.2); c = { cx: lerp(880, 930, u), cy: 600, z: lerp(1.28, 1.34, u) }; }
  // punch-in right after a cut
  for (const k of [T.shotMB, T.shotMH, T.shotMS, T.shotCU, T.shotRX]) { const u = (t - k) / 0.22; if (u >= 0 && u < 1) c.z *= 1 + 0.045 * (1 - ease.out(u)); }
  const sk = Math.exp(-Math.max(0, t - T.slam) * 8) * (t >= T.slam ? 1 : 0) * 18 + pulse(t, 10.55, 0.6) * 5 + pulse(t, 3.5, 0.3) * 6;
  c.sx = Math.sin(t * 90) * sk; c.sy = Math.cos(t * 77) * sk * 0.7;
  return c;
}

// ---------- bedroom ----------
function bedroom(ctx, t) {
  const st = {}; S.drawBedroom(ctx, t, st);
  const swipes = [0.5, 1.15, 1.75, 2.3];
  const swipe = Math.max(...swipes.map(s => pulse(t, s, 0.28)));
  const hues = ['#38e6ff', '#ff5ec8', '#ffe066', '#7a8bff', '#4dff9a'];
  const hi = swipes.filter(s => t >= s).length; const glow = hues[hi % hues.length];
  const look = [Math.sin(t * 1.3) * 0.1, kf(t, [[0, -0.6], [0.5, -0.6], [0.7, -0.9], [1.15, -0.5], [1.4, -0.9], [2.3, -0.6], [2.6, -1]])];
  const sl = { look, lid: kf(t, [[0, 0.35], [1.4, 0.3], [1.6, 0.18], [2.4, 0.12]]), blink: blinkAt(t, [1.0, 2.0]), brow: kf(t, [[0, 0.2], [1.15, 0.2], [1.3, -0.5], [1.6, 0], [2.3, 0], [2.45, -0.9], [3, -1]]), mouth: pulse(t, 1.3, 0.5) * 0.3, smile: pulse(t, 1.3, 0.8) * 0.5 - 0.1, reflect: glow, tilt: Math.sin(t * 0.9) * 0.008, glow, swipe, phoneTilt: swipe * 0.015 };
  S.drawSleeper(ctx, t, sl);
  S.drawBlanketAndPhone(ctx, t, sl);
  // phone light on face + room darkness
  ctx.save(); ctx.globalCompositeOperation = 'source-over';
  const vg = ctx.createRadialGradient(800, 640, 200, 800, 640, 1250); vg.addColorStop(0, 'rgba(6,8,30,0)'); vg.addColorStop(1, 'rgba(6,8,30,0.62)'); ctx.fillStyle = vg; ctx.fillRect(-500, -500, 3000, 2200);
  ctx.globalCompositeOperation = 'lighter'; const flick = 0.42 + swipe * 0.22 + 0.04 * Math.sin(t * 31);
  const lg = ctx.createRadialGradient(820, 860, 40, 820, 760, 760); lg.addColorStop(0, glow); lg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.globalAlpha = flick; ctx.fillStyle = lg; ctx.fillRect(-300, -300, 2500, 2000); ctx.restore();
  S.drawClock(ctx, t, st.clock);
}

function room(ctx, t) {
  const st = { alarm: t >= 3.55 ? 1 : 0, slam: t >= T.slam ? Math.exp(-(t - T.slam) * 5) * Math.abs(Math.cos((t - T.slam) * 14)) : 0, press: t >= 3.5 && t < 3.75 ? 1 : 0 };
  S.drawRoomBack(ctx, t, st);
  S.drawBeanbag(ctx); S.drawPizzaBox(ctx, true);
  // soft contact shadow of the desk
  C.drawStomach(ctx, stomachPose(t));
  C.drawBrain(ctx, brainPose(t));
  C.drawHeart(ctx, heartPose(t));
  S.drawRoomFront(ctx, t, st);
  // red alarm wash
  if (st.alarm) { ctx.fillStyle = `rgba(255,40,70,${0.09 + 0.07 * Math.sin(t * 11)})`; ctx.fillRect(-500, -500, 3000, 2200); }
  // speech
  bubble(ctx, { t0: 4.38, t1: 7.0, cx: 410, cy: 330, rx: 290, ry: 180, type: 'burst', fill: '#fff06a', lines: ['WE HAVE A', 'PROBLEM!'], size: 86, col: '#e3203f', rot: -0.06, wobAmt: 0.025, wob: 14 }, t);
  bubble(ctx, { t0: 7.1, t1: 9.0, cx: 1300, cy: 275, rx: 240, ry: 110, type: 'cloud', fill: '#ffffff', lines: ['AGAIN?!'], size: 104, col: '#e3324f', tail: [1140, 420], wobAmt: 0.045, wob: 24 }, t);
  bubble(ctx, { t0: 11.35, t1: 13.4, cx: 1405, cy: 545, rx: 262, ry: 62, type: 'round', fill: '#fff2d6', lines: ['I WANT PIZZA.'], size: 62, col: '#9a5612', tail: [1480, 640], wobAmt: 0.008, wob: 4, strokeW: 0 }, t);
}

function overlays(ctx, t) {
  if (t < 2.4) { const u = clamp((t - 0.15) / 0.5), o = 1 - clamp((t - 2.0) / 0.4); if (o > 0 && u > 0) { ctx.save(); ctx.globalAlpha = o; ctx.translate(W / 2 - 40, 118); const s = ease.back(u); ctx.scale(s, s); ctx.rotate(-0.02); text(ctx, 'YOUR BODY AT 3 AM', 0, 0, 104, '#ffffff', { stroke: 20 }); ctx.restore(); } }
  const f = clamp((t - T.fade0) / 0.5); if (f > 0) { ctx.fillStyle = `rgba(8,4,20,${ease.io(f)})`; ctx.fillRect(0, 0, W, H); }
}

function frame(ctx, t) {
  ctx.save(); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  if (t < T.bedEnd) {
    let z, cx, cy;
    if (t < 2.4) { const u = t / 2.4; z = lerp(1.0, 1.1, ease.io(u)); cx = 800; cy = 540; }
    else { const u = clamp((t - 2.4) / 0.58), e = Math.pow(u, 2.2); z = 1.1 * Math.exp(Math.log(70 / 1.1) * e); cx = lerp(800, 836, ease.io(u)); cy = lerp(540, 512, ease.io(u)); }
    ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-cx, -cy);
    bedroom(ctx, t);
  } else {
    const c = camera(t); ctx.translate(W / 2 + c.sx, H / 2 + c.sy); ctx.scale(c.z, c.z); ctx.translate(-c.cx, -c.cy);
    room(ctx, t);
  }
  ctx.restore();
  if (t < T.bedEnd) { const fl = Math.max(clamp((t - 2.82) / 0.16), 0); if (fl > 0) { ctx.fillStyle = `rgba(255,255,255,${ease.in(fl)})`; ctx.fillRect(0, 0, W, H); } }
  else if (t < 3.3) { ctx.fillStyle = `rgba(255,255,255,${1 - ease.out((t - 3.0) / 0.3)})`; ctx.fillRect(0, 0, W, H); }
  // vignette
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.55, W / 2, H / 2, H * 1.1); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(8,4,24,0.35)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  overlays(ctx, t);
}
module.exports = { frame, W, H, T, camera };
