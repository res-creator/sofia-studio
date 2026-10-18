// Test scene "Gary wants sugar" (~16 s). Same timing, poses and camera for both skins; only drawing differs.
const R = require('./rig'), P = require('./props');
const { lerp, clamp } = R;
const W = 1920, H = 1080, FLOOR = 900;
const A = (p, q, u) => [lerp(p[0], q[0], u), lerp(p[1], q[1], u)];
const ease = u => { u = clamp(u); return u * u * (3 - 2 * u); };
const back = u => { u = clamp(u); const c = 1.7; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
// keyframes: [[t, value], ...] -> eased value at time t (numbers or [x,y])
function kf(list, t) {
  if (t <= list[0][0]) return list[0][1];
  for (let i = 1; i < list.length; i++) if (t < list[i][0]) { const [t0, a] = list[i - 1], [t1, b] = list[i], u = ease((t - t0) / (t1 - t0)); return Array.isArray(a) ? A(a, b, u) : lerp(a, b, u); }
  return list[list.length - 1][1];
}

// ---- timing (seconds) ----
const VO = { d2b: 2.5, d2c: 9.25, d2d: 11.3 };
const SH = { s1: 0, s2: 2.3, s3: 9.0, s4: 11.1, s5: 12.6, end: 16.2 };
const ALIGN = {}; for (const id of Object.keys(VO)) ALIGN[id] = require(`./vo/${id}.align.json`);
// mouth from the spoken letters (visemes): returns { mouth, open }
function viseme(id, t) {
  const a = ALIGN[id], lt = t - VO[id]; if (lt < 0) return null;
  const st = a.character_start_times_seconds, en = a.character_end_times_seconds, ch = a.characters;
  if (lt > en[en.length - 1]) return null;
  let depth = 0;
  for (let i = 0; i < ch.length; i++) {
    if (ch[i] === '[') depth++; if (ch[i] === ']') { depth--; continue; } if (depth) continue;
    if (lt >= st[i] && lt < en[i]) { const c = ch[i].toLowerCase(); const jit = 0.85 + 0.15 * Math.sin(t * 40);
      if ('aeiy'.includes(c)) return { mouth: 'wide', open: 0.75 * jit }; if ('ou'.includes(c)) return { mouth: 'o', open: 0.55 };
      if ('mbp'.includes(c)) return { mouth: 'closed', open: 0 }; if (/[a-z]/.test(c)) return { mouth: 'small', open: 0.3 * jit }; return { mouth: 'closed', open: 0 }; }
  }
  return null;
}

// ---- camera ----
function shot(ctx, t, list, dutch = 0) {
  let i = 0; list.forEach((f, j) => { if (t >= f[0]) i = j; });
  let [t0, x, y, z, snap] = list[i];
  if (snap && i > 0) { const p = list[i - 1], u = 1 - Math.pow(1 - clamp((t - t0) / 0.18), 3); x = lerp(p[1], x, u); y = lerp(p[2], y, u); z = lerp(p[3], z, u); }
  z *= 1 + (t - t0) * 0.012;
  ctx.translate(W / 2, H / 2); ctx.rotate(dutch); ctx.scale(z, z); ctx.translate(-x, -y);
}
function shake(ctx, t, a) { if (a > 0) ctx.translate((hash(Math.floor(t * 30)) - 0.5) * a, (hash(Math.floor(t * 30) + 9) - 0.5) * a); }

// ---- sets (palette per skin) ----
const PAL = {
  A: { wall: '#4f6178', stripe: 'rgba(255,255,255,0.035)', floor: '#5d4a3c', trim: '#cfc6b4', door: '#8a5a3a', door2: '#7a4e32', metal: '#d8c08a', lamp: '#e8d39a', sofa: '#7d4a40', frame: '#3b4d63', hall: '#6e6250', hallFloor: '#4d4034' },
  D: { wall: '#7e64a8', stripe: 'rgba(0,0,0,0.08)', floor: '#3f7d70', trim: '#efe0c0', door: '#e07a4f', door2: '#c9663e', metal: '#f2d36b', lamp: '#ffe08a', sofa: '#c4573f', frame: '#4f8fd0', hall: '#b99a62', hallFloor: '#6b5236' },
};
function room(ctx, S, t, o = {}) {
  const C = PAL[S.name];
  ctx.fillStyle = C.wall; ctx.fillRect(-400, -200, W + 800, FLOOR + 200);
  ctx.fillStyle = C.stripe; for (let x = -400; x < W + 400; x += 120) ctx.fillRect(x, -200, 60, FLOOR + 200);
  R.paint(ctx, S, c => c.rect(-400, FLOOR, W + 800, 400), C.floor, { k: 0.92 });
  R.paint(ctx, S, c => c.rect(-400, FLOOR - 16, W + 800, 18), C.trim);
  // window with moon
  R.paint(ctx, S, c => c.roundRect(1300, 170, 380, 300, 8), C.trim);
  ctx.fillStyle = '#121a33'; ctx.fillRect(1320, 190, 340, 260);
  ctx.fillStyle = '#f3efd8'; ctx.beginPath(); ctx.arc(1590, 250, 34, 0, 7); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.rect(1320, 190, 340, 260); ctx.clip(); ctx.fillStyle = '#0b1124'; for (let i = 0; i < 6; i++) ctx.fillRect(1320 + i * 60, 450 - 60 - hash(i) * 120, 50, 200); ctx.restore();
  R.paint(ctx, S, c => { c.rect(1484, 190, 12, 260); c.rect(1320, 314, 340, 12); }, C.trim);
  // floor lamp + sofa (right side, depth)
  R.paint(ctx, S, c => c.roundRect(1760, 560, 16, FLOOR - 560, 6), '#3a3a40');
  R.paint(ctx, S, c => { c.moveTo(1700, 560); c.lineTo(1836, 560); c.lineTo(1806, 470); c.lineTo(1730, 470); c.closePath(); }, C.lamp);
  R.paint(ctx, S, c => c.roundRect(1430, 660, 300, 160, 30), C.sofa); R.paint(ctx, S, c => c.roundRect(1410, 740, 340, 150, 26), R.shade(C.sofa, 1.1));
  // door (we see its face), chain plate on the frame, light under the door
  R.paint(ctx, S, c => c.rect(230, 160, 470, FLOOR - 150), C.trim);
  R.paint(ctx, S, c => c.rect(260, 190, 410, FLOOR - 190), C.door);
  R.paint(ctx, S, c => { c.roundRect(300, 240, 330, 250, 8); c.roundRect(300, 540, 330, 300, 8); }, C.door2, { k: 0.95 });
  R.paint(ctx, S, c => c.ellipse(612, 560, 17, 17, 0, 0, 7), C.metal); R.paint(ctx, S, c => c.roundRect(560, 552, 52, 14, 6), C.metal);
  R.paint(ctx, S, c => c.ellipse(465, 360, 11, 11, 0, 0, 7), '#222');
  R.paint(ctx, S, c => c.roundRect(684, 455, 14, 34, 4), C.metal);   // chain plate on frame
  R.paint(ctx, S, c => c.roundRect(560, 462, 92, 14, 6), C.metal);   // chain track on the door
  ctx.fillStyle = '#ffd98a'; ctx.fillRect(262, FLOOR - 4, 406, 6);
  if (o.feet) { ctx.fillStyle = '#1a1410'; ctx.fillRect(380, FLOOR - 4, 56, 6); ctx.fillRect(500, FLOOR - 4, 56, 6); }
}
function chain(ctx, S, knob) { // chain from the frame plate to the knob in the track
  const a = [691, 470]; ctx.save(); ctx.strokeStyle = '#c9cfd6'; ctx.lineWidth = 6; ctx.setLineDash([10, 5]);
  ctx.beginPath(); ctx.moveTo(...a); ctx.quadraticCurveTo((a[0] + knob[0]) / 2, Math.max(a[1], knob[1]) + 30 - Math.min(30, Math.abs(a[0] - knob[0]) * 0.2), knob[0], knob[1]); ctx.stroke(); ctx.restore();
  R.paint(ctx, S, c => c.ellipse(knob[0], knob[1], 9, 9, 0, 0, 7), '#c9cfd6');
}
// night grade + practical lights, drawn over a whole set
function night(ctx, S, t, o = {}) {
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = S.name === 'D' ? '#a3a3d8' : '#8f99c8'; ctx.fillRect(-500, -300, W + 1000, H + 600); ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const glow = (x, y, r, col) => { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); };
  glow(1768, 520, 700, 'rgba(255,190,110,0.32)'); glow(1000, 520, 700, 'rgba(255,200,140,0.10)');
  glow(465, FLOOR + 10, 300, 'rgba(255,200,120,0.25)');
  glow(1500, 320, 380, 'rgba(120,150,255,0.12)');
  ctx.restore();
}
function hallway(ctx, S, t, flick) { // the other side of the door, seen through the peephole
  const C = PAL[S.name];
  ctx.fillStyle = C.hall; ctx.fillRect(-600, -400, W + 1200, FLOOR + 400);
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; for (let x = -600; x < W + 600; x += 160) ctx.fillRect(x, -400, 80, FLOOR + 400);
  R.paint(ctx, S, c => c.rect(-600, FLOOR, W + 1200, 500), C.hallFloor);
  for (const dx of [-300, 1560]) R.paint(ctx, S, c => c.rect(dx, 150, 300, FLOOR - 150), R.shade(C.door, 0.8));
  R.paint(ctx, S, c => c.roundRect(860, 120, 200, 40, 10), '#fff4d0');
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(960, 160, 0, 960, 160, 900); g.addColorStop(0, `rgba(255,240,200,${0.35 * flick})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, -400, W, FLOOR + 600); ctx.restore();
}

// ---- characters at time t ----
function heroAt(S, t) {
  const sk = S.name, dk = sk === 'D';
  if (t < SH.s2) { // shot 1: startled by the knock, then sneaks to the door with the bat ready
    const hop = t > 0.25 && t < 0.75 ? -Math.sin((t - 0.25) / 0.5 * Math.PI) * 34 : 0;
    const x = kf([[0, 1420], [0.85, 1420], [2.25, 1010]], t), walking = t > 0.85 && t < 2.25;
    const pose = { x, ground: FLOOR, crouch: kf([[0, 0.05], [0.8, 0.45]], t), lean: kf([[0, 0.02], [0.8, 0.22]], t), hop, walk: { w: walking ? 1 : 0, u: (t - 0.85) / 0.75, stride: 120 } };
    const J0 = R.solve(S, pose);
    const b = P.bat([J0.shN[0] - 30, J0.shN[1] + (dk ? 70 : 110)], kf([[0, -1.9], [0.3, -2.25], [0.9, -2.05]], t) + Math.sin(t * 9) * 0.03, dk ? 250 : 300);
    const J = R.solveGrip(S, pose, { near: b.high, far: b.low }, `${sk} hero s1`);
    const scared = t > 0.25;
    return { J, bat: b, batHeld: 'both', e: { eyes: scared ? 'wide' : 'open', brow: scared ? 'worried' : 'neutral', mouth: t > 0.25 && t < 0.9 ? 'o' : 'frown', look: [-0.8, -0.1], sweat: t > 0.6 } };
  }
  // shots 4-5: at the door
  const x = kf([[SH.s4, 830], [15.0, 830], [15.5, 900]], t), walking = t > 15.0 && t < 15.5;
  const pose = { x, ground: FLOOR, crouch: kf([[SH.s4, 0.1], [13.4, 0.1], [13.6, 0.35], [14.6, 0.35], [15.0, 0.05]], t), lean: kf([[SH.s4, 0.05], [12.8, 0.18], [13.3, 0.18], [13.6, 0.3], [14.6, 0.3], [15.0, 0.02]], t),
    walk: { w: walking ? 1 : 0, u: (t - 13.55) / 0.7, stride: 70 }, tilt: t > 15.4 ? 0.12 : 0 };
  const J0 = R.solve(S, pose);
  // far hand: bat hangs down from the hand
  const farG = [J0.shF[0] + 8, J0.shF[1] + S.ua + S.fa - 30];
  const b = P.bat([farG[0] + 2, farG[1] - 30], 1.62, dk ? 250 : 300);
  // near hand: chain knob, then chair rail, then rests
  let near = null, knob = kf([[SH.s4, [645, 469]], [12.85, [645, 469]], [13.3, [592, 469]]], t), ch = chairAt(t);
  if (t > 12.7 && t < 13.4) near = knob; else if (t >= 13.45 && t < 14.65) near = ch.rail;
  const J = R.solveGrip(S, pose, { near, far: b.low }, `${sk} hero s5`);
  const v = viseme('d2d', t);
  let e;
  if (t < 12.6) e = Object.assign({ eyes: 'squint', brow: 'flat', mouth: 'flat', look: [0.15, 0] }, v || {});
  else if (t < 15.0) e = { eyes: 'open', brow: 'angry', mouth: 'flat', look: [-0.7, 0.2] };
  else e = { eyes: 'half', brow: 'skeptic', mouth: 'smirk', look: [0.5, 0.1] };
  return { J, bat: b, batHeld: 'far', knob, chair: ch, e };
}
function chairAt(t) { const u = ease((t - 13.7) / 0.8); return P.chair(lerp(650, 596, u), FLOOR, lerp(0, -0.17, u)); }
function garyAt(S, t) {
  const sk = S.name, dk = sk === 'D';
  const pose = { x: 990, ground: FLOOR, lean: 0.06, tilt: t > SH.s3 ? kf([[SH.s3, 0], [11.0, -0.16]], t) : Math.sin(t * 1.3) * 0.03 };
  const J0 = R.solve(S, pose);
  const up = clamp((t - 6.2) / 0.5);
  const m = P.mug(A([J0.shN[0] - 70, J0.shN[1] + (dk ? 180 : 210)], [J0.shN[0] - 120, J0.shN[1] + 20], ease(up)), dk ? 1.05 : 1);
  const waving = t < 5.0;
  const reach = S.ua + S.fa, farT = waving ? [J0.shF[0] - reach * 0.5, J0.shF[1] - reach * 0.72 + Math.sin(t * 14) * 10] : [J0.shF[0] + 4, J0.shF[1] + S.ua + S.fa - 24];
  const J = R.solveGrip(S, pose, { near: m.grip, far: waving ? farT : null }, `${sk} gary`);
  const v = viseme('d2b', t);
  const e = Object.assign({ eyes: t > SH.s3 ? 'wide' : 'open', brow: t > SH.s3 ? 'up' : 'up', mouth: 'grin', open: 0, look: [-0.2, 0.15], blood: 1, twitch: t > SH.s3 && (Math.floor(t * 7) % 5 === 0) }, v || {});
  return { J, mug: m, waving, e };
}

// ---- shots ----
function drawHero(ctx, S, h, t) {
  const C = R.CAST.hero[S.name];
  if (h.batHeld === 'both') R.drawChar(ctx, S, C, h.J, h.e, { farFront: true, hold: c => P.drawBat(c, S, h.bat), t });
  else R.drawChar(ctx, S, C, h.J, h.e, { underFar: c => P.drawBat(c, S, h.bat), t });
}
function frame(ctx, S, t) {
  ctx.save(); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  if (t < SH.s2) {
    ctx.save(); shot(ctx, t, [[0, 1250, 560, 1.3], [0.25, 1400, 450, 1.75, true], [0.8, 1220, 560, 1.3]]); if (t > 0.1 && t < 0.6) shake(ctx, t, 10);
    room(ctx, S, t, { feet: true }); chain(ctx, S, [645, 469]); P.drawChair(ctx, S, chairAt(0)); drawHero(ctx, S, heroAt(S, t), t); night(ctx, S, t); ctx.restore();
  } else if (t < SH.s4) {
    // peephole POV
    const s3 = t >= SH.s3, flick = s3 ? (hash(Math.floor(t * 12)) > 0.75 ? 0.25 : 1) : 1;
    ctx.save(); ctx.beginPath(); ctx.arc(960, 540, 500, 0, 7); ctx.clip();
    const g = garyAt(S, t), hy = g.J.head[1], hx = g.J.head[0];
    shot(ctx, t, s3 ? [[SH.s3, hx - 10, hy + 40, 3.0], [SH.s3 + 0.9, hx - 20, hy + 10, 3.6, true]] : [[SH.s2, hx - 40, hy + 120, 1.85], [6.2, hx - 60, hy + 110, 2.3, true]], s3 ? 0.07 : 0);
    hallway(ctx, S, t, flick);
    R.drawChar(ctx, S, R.CAST.gary[S.name], g.J, g.e, { farFront: !g.waving, farHand: g.waving ? 'wave' : 'fist', holdNear: c => P.drawMug(c, S, g.mug), t });
    if (flick < 1) { ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(-500, -500, W + 1000, H + 1000); }
    ctx.restore();
    const vg = ctx.createRadialGradient(960, 540, 260, 960, 540, 500); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.92)'); ctx.fillStyle = vg; ctx.beginPath(); ctx.arc(960, 540, 501, 0, 7); ctx.fill();
    ctx.lineWidth = 10; ctx.strokeStyle = '#0a0a0a'; ctx.stroke();
  } else {
    const h = heroAt(S, t);
    ctx.save();
    if (t < SH.s5) shot(ctx, t, [[SH.s4, h.J.head[0] + 30, h.J.head[1] + 30, 3.0], [11.75, h.J.head[0] + 25, h.J.head[1] + 15, 3.5, true]]);
    else shot(ctx, t, [[SH.s5, 800, 570, 1.35], [13.45, 770, 590, 1.42, true], [15.0, 840, 560, 1.4, true]]);
    room(ctx, S, t, { feet: true }); chain(ctx, S, h.knob); P.drawChair(ctx, S, h.chair); drawHero(ctx, S, h, t); night(ctx, S, t);
    ctx.restore();
  }
  ctx.restore();
}
module.exports = { frame, SH, VO, W, H };
