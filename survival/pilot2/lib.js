// Full pilot: the flat drawing kit of ../lib.js (fonts, labels, ship, zombies) plus a posable person:
// legs and arms solved with 2-bone IK so feet stay on the floor/seat and hands land exactly on props.
// Coordinates are the person's local units (feet at 0,0; y up is negative; scale s applied by the caller).
const B = require('../lib');
const { clamp, lerp, ease, hash, OL, fillR, stroke, circle, mix } = B;
const QA = [];

// 2-bone IK: joint between a and b with segment lengths l1, l2; pick(j1, j2) chooses the bend side
function ik(a, b, l1, l2, pick, tag) {
  let dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1e-6;
  if (d > l1 + l2 - 0.5) { if (tag && d - (l1 + l2) > 6) QA.push(`${tag}: ${Math.round(d - l1 - l2)}px out of reach`); const k = (l1 + l2 - 0.5) / d; dx *= k; dy *= k; d = l1 + l2 - 0.5; }
  const end = [a[0] + dx, a[1] + dy], c = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1), al = Math.acos(c), base = Math.atan2(dy, dx);
  const j1 = [a[0] + Math.cos(base + al) * l1, a[1] + Math.sin(base + al) * l1], j2 = [a[0] + Math.cos(base - al) * l1, a[1] + Math.sin(base - al) * l1];
  return { j: pick(j1, j2), end };
}
const ARM = [72, 68], LEG = [78, 78];

// o: colours (HERO/ROSA/ZCOL) + dir, look, blink, scared, squint, flat, grin, talk, chew, brow, sweat, glasses, bow, zombie, t
//    pose: 'stand' | 'sit' | 'crouch';  crouch: 0..1;  seat: seat height (local units, default 100);  walk: phase;  stride
//    lean: upper body tilt toward the facing side (rad);  hands: { near:[fwd,y], far:[fwd,y] } in body units (fwd along facing)
//    prop(ctx, hn, hf): drawn in front of the torso, under the near hand;  propBack(ctx, hn, hf): behind the back arm
//    wrap/lamp/bags/belt: Rosa's head wrap, headlamp, tired eyes, tool belt;  tag: name for QA messages
function person(ctx, x, fy, s, o) {
  if (o.green) o = Object.assign({}, o, { skin: mix(o.skin, '#a7b58f', o.green) });
  const dir = o.dir || 1, ph = o.walk, zb = o.zombie, tag = o.tag || 'person', pose = o.pose || 'stand';
  const cr = pose === 'crouch' ? clamp(o.crouch ?? 0.5) : 0, seat = o.seat ?? 100;
  ctx.save(); ctx.translate(x, fy); ctx.scale(s, s);
  const bob = ph != null && pose === 'stand' ? -Math.abs(Math.sin(ph)) * 8 : 0;
  const hipY = pose === 'sit' ? -seat : -150 + cr * 62 + bob, drop = hipY + 150;
  // shadow
  ctx.save(); ctx.globalAlpha = 0.25; ctx.beginPath(); ctx.ellipse(pose === 'sit' ? dir * 50 : 0, 4, pose === 'sit' ? 100 : 70, 12, 0, 0, 7); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();
  // legs (back leg first): feet on the floor, knees bend toward the facing side
  for (const k of (dir > 0 ? [-1, 1] : [1, -1])) {
    const hip = [k * 14, hipY]; let foot;
    if (pose === 'sit') foot = [dir * (o.feet ?? 100) + k * 10, 0];
    else if (ph != null) { const sw = Math.sin(ph + (k > 0 ? 0 : Math.PI)), st = (o.stride ?? (zb ? 34 : 52)) * (1 - cr * 0.4); foot = [k * 14 + dir * sw * st, -Math.max(0, Math.cos(ph + (k > 0 ? 0 : Math.PI))) * 22]; }
    else foot = [k * 16 + dir * cr * 30, 0];
    const L = ik(hip, foot, LEG[0], LEG[1], (a, b) => (a[0] * dir > b[0] * dir ? a : b), null), knee = L.j, f = L.end;
    const col = k * dir < 0 ? mix(o.pants, '#000000', 0.18) : o.pants;
    stroke(ctx, [hip, knee, f], 26, OL); stroke(ctx, [hip, knee, f], 19, col);
    ctx.beginPath(); ctx.ellipse(f[0] + dir * 10, f[1] - 2, 21, 10, 0, 0, 7); ctx.fillStyle = '#1b1c20'; ctx.fill();
  }
  // upper body
  ctx.translate(0, drop); ctx.translate(0, -150); ctx.rotate((o.lean || 0) * dir + (o.tilt || 0)); ctx.translate(0, 150);
  const shB = [-dir * 44, -284], shN = [dir * 44, -284], hd = o.hands || {};
  const down = (sh, k) => [sh[0] + (ph != null ? Math.sin(ph) * 22 * k * dir : 0) + dir * 6, -158];
  const tgtN = hd.near ? [dir * hd.near[0], hd.near[1]] : down(shN, 1), tgtF = hd.far ? [dir * hd.far[0], hd.far[1]] : down(shB, -1);
  const lowElbow = (a, b) => (a[1] > b[1] ? a : b);
  const aN = ik(shN, tgtN, ARM[0], ARM[1], lowElbow, hd.near && `${tag} near hand`), aF = ik(shB, tgtF, ARM[0], ARM[1], lowElbow, hd.far && `${tag} far hand`);
  const arm = (sh, A, col) => { stroke(ctx, [sh, A.j, A.end], 25, OL); stroke(ctx, [sh, A.j, A.end], 18, col); circle(ctx, A.end[0], A.end[1], 13, OL); circle(ctx, A.end[0], A.end[1], 10.5, o.skin); };
  if (o.propBack) o.propBack(ctx, aN.end, aF.end);
  arm(shB, aF, o.shirt2);
  // torso
  ctx.beginPath(); ctx.moveTo(-48, -296); ctx.lineTo(48, -296); ctx.quadraticCurveTo(56, -296, 54, -280); ctx.lineTo(44, -150); ctx.quadraticCurveTo(43, -138, 30, -138); ctx.lineTo(-30, -138); ctx.quadraticCurveTo(-43, -138, -44, -150); ctx.lineTo(-54, -280); ctx.quadraticCurveTo(-56, -296, -48, -296); ctx.closePath();
  ctx.fillStyle = o.shirt; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = OL; ctx.stroke();
  ctx.save(); ctx.clip(); ctx.fillStyle = o.shirt2; ctx.fillRect(-dir * 60 - 30, -300, 40, 170); ctx.fillRect(-60, -160, 120, 30);
  if (zb) { ctx.fillStyle = 'rgba(70,30,30,0.45)'; ctx.beginPath(); ctx.moveTo(-20, -230); ctx.lineTo(10, -250); ctx.lineTo(25, -210); ctx.lineTo(0, -195); ctx.fill(); }
  if (o.coverall) { stroke(ctx, [[dir * 6, -296], [dir * 6, -150]], 4, mix(o.shirt, '#000000', 0.3)); fillR(ctx, dir * 14, -262, 34, 22, 3, '#efe6cf'); ctx.fillStyle = '#c93a32'; ctx.fillRect(dir * 14 + 4, -255, 26, 4); }
  ctx.restore();
  if (o.belt) { fillR(ctx, -48, -160, 96, 16, 3, '#3a2e24'); fillR(ctx, dir * 18, -164, 22, 30, 4, '#6a5a44'); }
  if (o.bow) { ctx.fillStyle = OL; ctx.beginPath(); ctx.moveTo(0, -288); ctx.lineTo(-16, -298); ctx.lineTo(-16, -278); ctx.closePath(); ctx.moveTo(0, -288); ctx.lineTo(16, -298); ctx.lineTo(16, -278); ctx.closePath(); ctx.fill(); circle(ctx, 0, -288, 4, OL);
    fillR(ctx, dir * 14 - 11, -250, 22, 12, 2, '#f4f1e8'); }
  // neck + head
  ctx.fillStyle = o.skin; ctx.fillRect(-9, -312, 18, 18);
  const hx = dir * 4, hy = -362 + (zb ? 6 : 0);
  ctx.save(); ctx.translate(hx, hy); if (zb) ctx.rotate(dir * 0.18 + Math.sin((o.t || 0) * 1.7 + x) * 0.06); if (o.headTilt) ctx.rotate(o.headTilt);
  circle(ctx, 0, 0, 62, OL); circle(ctx, 0, 0, 58, o.skin);
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 58, 0, 7); ctx.clip(); ctx.fillStyle = o.hair;
  if (o.wrap) { ctx.fillStyle = o.wrap; ctx.beginPath(); ctx.moveTo(-64, -6); ctx.quadraticCurveTo(-60, -72, 0, -70); ctx.quadraticCurveTo(60, -72, 64, -8); ctx.quadraticCurveTo(0, -26, -64, -6); ctx.fill(); ctx.fillStyle = mix(o.wrap, '#000000', 0.25); ctx.fillRect(-64, -20, 128, 8); }
  else if (zb) { ctx.beginPath(); ctx.ellipse(-dir * 10, -52, 56, 26, 0, 0, 7); ctx.fill(); }
  else if (o.hair) { ctx.beginPath(); ctx.moveTo(-62, -18); ctx.quadraticCurveTo(-58, -66, 0, -64); ctx.quadraticCurveTo(58, -66, 62, -20); ctx.lineTo(40, -38); ctx.lineTo(30, -28); ctx.lineTo(14, -42); ctx.lineTo(-6, -30); ctx.lineTo(-20, -44); ctx.lineTo(-40, -32); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  if (o.wrap) { ctx.beginPath(); ctx.ellipse(-dir * 58, -24, 22, 18, 0, 0, 7); ctx.fillStyle = o.wrap; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = OL; ctx.stroke();   // knot at the back
    fillR(ctx, dir * 18 - 14, -54, 28, 18, 5, '#3a3d44'); circle(ctx, dir * 18 + dir * 10, -45, 6, o.lamp ? '#fff6c8' : '#777');   // headlamp
    if (o.lamp) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(dir * 28, -45, 2, dir * 28, -45, 60); g.addColorStop(0, 'rgba(255,240,190,0.6)'); g.addColorStop(1, 'rgba(255,240,190,0)'); ctx.fillStyle = g; ctx.fillRect(dir * 28 - 60, -105, 120, 120); ctx.restore(); } }
  else if (!zb && o.hair) { ctx.fillStyle = o.hair; for (const [a, b] of [[-30, -60], [-8, -68], [16, -64]]) { ctx.beginPath(); ctx.moveTo(a, b + 10); ctx.quadraticCurveTo(a + 8, b - 16, a + 22, b - 6); ctx.lineTo(a + 16, b + 12); ctx.fill(); } }
  // face
  const lk = (o.look || 0) * 12 + dir * 6, ey = -2 + (o.lookUp ? -6 : 0);
  if (zb) {
    for (const k of [-1, 1]) { circle(ctx, lk + k * 20, ey, 10, '#f3f1e4'); circle(ctx, lk + k * 20, ey, 3, o.redEyes ? '#d6413a' : '#9aa08e'); }
    stroke(ctx, [[lk - 16, 30], [lk - 8, 24], [lk, 31], [lk + 8, 24], [lk + 16, 30]], 4, '#3a2b2b');
    ctx.fillStyle = 'rgba(90,40,40,0.35)'; ctx.beginPath(); ctx.ellipse(lk + 28, 18, 9, 6, 0.4, 0, 7); ctx.fill();
  } else {
    const wide = o.scared ? 1.35 : 1;
    if (o.brow) for (const k of [-1, 1]) { const by = ey - 23, tl = { worried: -7, angry: 8, up: -2, flat: 0 }[o.brow] * k; stroke(ctx, [[lk + k * 20 - 11, by + tl * 0.5 - (o.brow === 'up' ? 8 : 0)], [lk + k * 20 + 11, by - tl * 0.5 - (o.brow === 'up' ? 8 : 0)]], 5, OL); }
    for (const k of [-1, 1]) {
      if (o.blink) stroke(ctx, [[lk + k * 20 - 6, ey], [lk + k * 20 + 6, ey]], 4, OL);
      else if (o.squint) stroke(ctx, [[lk + k * 20 - 7, ey + 1], [lk + k * 20 + 7, ey - 1]], 5, OL);
      else { circle(ctx, lk + k * 20 + (o.lookUp ? 0 : 0), ey + (o.lookUp ? -3 : 0), 5.5 * wide, OL); if (o.scared) circle(ctx, lk + k * 20 + 1.5, ey - 1.5, 1.6, '#fff'); }
      if (o.bags) stroke(ctx, [[lk + k * 20 - 9, ey + 12], [lk + k * 20, ey + 15], [lk + k * 20 + 9, ey + 12]], 2.5, 'rgba(40,20,14,0.6)');
    }
    if (o.glasses) { ctx.lineWidth = 4.5; ctx.strokeStyle = OL; for (const k of [-1, 1]) { ctx.beginPath(); ctx.arc(lk + k * 20, ey, 15, 0, 7); ctx.stroke(); } stroke(ctx, [[lk - 5, ey - 2], [lk + 5, ey - 2]], 4, OL); }
    if (o.talk > 0.05) { ctx.beginPath(); ctx.ellipse(lk, 31, 9 + o.talk * 4, 2 + o.talk * 11, 0, 0, 7); ctx.fillStyle = '#5a1f1f'; ctx.fill(); ctx.lineWidth = 3.5; ctx.strokeStyle = OL; ctx.stroke(); }
    else if (o.chew) { ctx.beginPath(); ctx.ellipse(lk + 2, 30, 11, 5 + Math.abs(Math.sin((o.t || 0) * 9)) * 4, 0, 0, 7); ctx.fillStyle = OL; ctx.fill(); }
    else if (o.grin) { ctx.beginPath(); ctx.arc(lk, 22, 16, 0.25, Math.PI - 0.25); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = OL; ctx.stroke(); }
    else if (o.smile) { ctx.beginPath(); ctx.arc(lk, 20, 13, 0.4, Math.PI - 0.4); ctx.lineWidth = 4.5; ctx.strokeStyle = OL; ctx.stroke(); }
    else if (o.scared) { ctx.beginPath(); ctx.ellipse(lk, 32, 7, 9, 0, 0, 7); ctx.fillStyle = OL; ctx.fill(); }
    else if (o.shut) stroke(ctx, [[lk - 7, 31], [lk + 7, 31]], 5, OL);
    else stroke(ctx, [[lk - 10, 30], [lk + 10, 30]], 4, OL);
    if (o.sweat) { ctx.fillStyle = '#9fd3ff'; ctx.beginPath(); ctx.moveTo(-dir * 46, -30); ctx.quadraticCurveTo(-dir * 54, -12, -dir * 46, -8); ctx.quadraticCurveTo(-dir * 38, -12, -dir * 46, -30); ctx.fill(); }
  }
  ctx.restore();
  if (o.prop) o.prop(ctx, aN.end, aF.end);
  arm(shN, aN, o.shirt);
  ctx.restore();
}
const HERO = B.HERO;
const ROSA = { skin: '#7a4c34', shirt: '#d4692e', shirt2: '#b3561f', pants: '#bf5e29', hair: null, wrap: '#2f6f66', bags: true, belt: true, coverall: true };
const hero = (ctx, x, fy, s, o = {}) => person(ctx, x, fy, s, Object.assign({ tag: 'hero' }, HERO, o));
const rosa = (ctx, x, fy, s, o = {}) => person(ctx, x, fy, s, Object.assign({ tag: 'rosa' }, ROSA, o));
const ZCOL = [{ skin: '#9fb08f', shirt: '#6f7f9a', shirt2: '#56647d', pants: '#3b3f4a', hair: '#3d3a33' }, { skin: '#a9b596', shirt: '#b7746a', shirt2: '#97594f', pants: '#2f3542', hair: '#5a4630' },
  { skin: '#98a98d', shirt: '#e9e4d6', shirt2: '#c7c0ad', pants: '#2b2f38', hair: '#222' }, { skin: '#a3b294', shirt: '#4f7d6c', shirt2: '#3c6354', pants: '#454036', hair: '#7a6a55' }];
const zombie = (ctx, x, fy, s, i, o = {}) => person(ctx, x, fy, s, Object.assign({ tag: 'zombie' }, ZCOL[i % ZCOL.length], { zombie: true, hands: { near: [120, -258 + Math.sin((o.t || 0) * 2.3 + i) * 8], far: [92, -250] } }, o));

// ---- props (drawn in the holder's local units; G = the grip point, where the hand goes) ----
function can(ctx, G, label = '#c8473b', open = true) { fillR(ctx, G[0] - 20, G[1] - 34, 40, 56, 6, '#c9d1d8'); ctx.fillStyle = label; ctx.fillRect(G[0] - 20, G[1] - 20, 40, 24); if (open) { ctx.beginPath(); ctx.ellipse(G[0], G[1] - 34, 20, 6, 0, 0, 7); ctx.fillStyle = '#e8b45a'; ctx.fill(); } ctx.lineWidth = 3; ctx.strokeStyle = OL; ctx.strokeRect(G[0] - 20, G[1] - 34, 40, 56); }
function spoon(ctx, G, a = -1.2, d = 1) { ctx.save(); ctx.translate(...G); ctx.scale(d, 1); ctx.rotate(a); stroke(ctx, [[0, 0], [52, 0]], 6, '#c9d1d8'); ctx.beginPath(); ctx.ellipse(60, 0, 12, 8, 0, 0, 7); ctx.fillStyle = '#c9d1d8'; ctx.fill(); ctx.restore(); }
function bottle(ctx, G, full = 1, a = 0) { ctx.save(); ctx.translate(...G); ctx.rotate(a); fillR(ctx, -16, -70, 32, 100, 9, '#9fd6ff'); if (full < 1) { ctx.fillStyle = 'rgba(40,60,90,0.5)'; ctx.fillRect(-14, -66, 28, 92 * (1 - full)); } fillR(ctx, -7, -84, 14, 15, 3, '#2f6f96'); ctx.lineWidth = 3; ctx.strokeStyle = OL; ctx.strokeRect(-16, -70, 32, 100); ctx.restore(); }
function radio(ctx, G, on = 0, t = 0) { fillR(ctx, G[0] - 22, G[1] - 50, 44, 84, 9, '#f0c020'); stroke(ctx, [[G[0] + 12, G[1] - 50], [G[0] + 12, G[1] - 92]], 7, '#222'); fillR(ctx, G[0] - 14, G[1] - 40, 28, 18, 3, on ? '#9ff0c0' : '#2b3a3a'); ctx.fillStyle = '#333'; for (let i = 0; i < 3; i++) ctx.fillRect(G[0] - 13, G[1] - 12 + i * 9, 26, 4); if (on && Math.floor(t * 6) % 2) circle(ctx, G[0] - 12, G[1] - 46, 4, '#ff4b3a'); }
function pan(ctx, G, a = -1.2, L = 170, d = 1) { ctx.save(); ctx.translate(...G); ctx.scale(d, 1); ctx.rotate(a); fillR(ctx, -12, -8, L * 0.6, 16, 8, '#2a2a2e'); ctx.beginPath(); ctx.ellipse(L * 0.6 + 50, 0, 54, 48, 0, 0, 7); ctx.fillStyle = '#3a3b40'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = OL; ctx.stroke(); ctx.beginPath(); ctx.ellipse(L * 0.6 + 50, 0, 40, 35, 0, 0, 7); ctx.fillStyle = '#26272b'; ctx.fill(); ctx.restore(); }
function flashlight(ctx, G, a, on = false, len = 700, spread = 0.22) {
  const tip = [G[0] + Math.cos(a) * 50, G[1] + Math.sin(a) * 50];
  if (on) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(tip[0], tip[1], 10, tip[0], tip[1], len); g.addColorStop(0, 'rgba(255,246,210,0.5)'); g.addColorStop(1, 'rgba(255,240,200,0)'); ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(...tip); ctx.lineTo(tip[0] + Math.cos(a - spread) * len, tip[1] + Math.sin(a - spread) * len); ctx.lineTo(tip[0] + Math.cos(a + spread) * len, tip[1] + Math.sin(a + spread) * len); ctx.closePath(); ctx.fill(); ctx.restore(); }
  ctx.save(); ctx.translate(...G); ctx.rotate(a); fillR(ctx, -24, -10, 60, 20, 5, '#2e3138'); fillR(ctx, 30, -14, 24, 28, 5, '#3e424a'); ctx.fillStyle = on ? '#fff6c8' : '#8a8f96'; ctx.fillRect(50, -10, 5, 20); ctx.restore(); return tip; }
function timer(ctx, x, y, s = 1, ring = 0, t = 0) { ctx.save(); ctx.translate(x + (ring ? Math.sin(t * 80) * 2 : 0), y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-30, 0); ctx.quadraticCurveTo(-30, -42, 0, -44); ctx.quadraticCurveTo(30, -42, 30, 0); ctx.closePath(); ctx.fillStyle = '#f2efe8'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = OL; ctx.stroke();
  fillR(ctx, -32, -4, 64, 12, 3, '#d6413a'); fillR(ctx, -5, -54, 10, 12, 3, '#d6413a'); stroke(ctx, [[0, -26], [10, -34]], 4, OL);
  if (ring) for (const k of [-1, 1]) for (let i = 1; i <= 2; i++) { ctx.beginPath(); ctx.arc(0, -26, 36 + i * 13, k > 0 ? -0.6 : Math.PI - 0.6, k > 0 ? 0.6 : Math.PI + 0.6); ctx.lineWidth = 4; ctx.strokeStyle = '#fff'; ctx.stroke(); }
  ctx.restore(); }
function band(ctx, x, y, s = 1, a = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s); fillR(ctx, -70, -13, 140, 26, 11, '#c8402e'); ctx.fillStyle = '#fff'; ctx.font = '900 13px Nunito'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('ENGINEERING - R. OKAFOR', -6, 1); fillR(ctx, 56, -18, 26, 36, 5, '#c9cfd6'); ctx.restore(); }
function bread(ctx, x, y, s = 1, a = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s); ctx.beginPath(); ctx.ellipse(0, 0, 60, 26, 0, 0, 7); ctx.fillStyle = '#d9a05a'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = OL; ctx.stroke(); ctx.strokeStyle = '#b07a3a'; for (const k of [-24, 0, 24]) { ctx.beginPath(); ctx.moveTo(k - 8, -16); ctx.lineTo(k + 8, -4); ctx.stroke(); } ctx.restore(); }
function plate(ctx, x, y, s = 1, food = true) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.ellipse(0, 0, 54, 13, 0, 0, 7); ctx.fillStyle = '#f4f1ea'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = OL; ctx.stroke(); if (food) { ctx.beginPath(); ctx.ellipse(-6, -8, 26, 10, 0, Math.PI, 0); ctx.fillStyle = '#e0a530'; ctx.fill(); ctx.beginPath(); ctx.ellipse(18, -6, 12, 7, 0, Math.PI, 0); ctx.fillStyle = '#4f9d69'; ctx.fill(); } ctx.restore(); }
function flareGun(ctx, G, a = 0, d = 1) { ctx.save(); ctx.translate(...G); ctx.scale(d, 1); ctx.rotate(a); fillR(ctx, -8, -6, 22, 46, 6, '#e0632a'); fillR(ctx, -10, -36, 120, 34, 10, '#f07a2e'); ctx.beginPath(); ctx.ellipse(110, -19, 8, 15, 0, 0, 7); ctx.fillStyle = '#3a2a20'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = OL; ctx.strokeRect(-10, -36, 120, 34); ctx.restore(); }
function crate(ctx, x, fy, w = 140, h = 100, c = '#8a6a45') { fillR(ctx, x - w / 2, fy - h, w, h, 6, c); ctx.lineWidth = 4; ctx.strokeStyle = OL; ctx.strokeRect(x - w / 2, fy - h, w, h); ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.moveTo(x - w / 2, fy - h); ctx.lineTo(x + w / 2, fy); ctx.moveTo(x + w / 2, fy - h); ctx.lineTo(x - w / 2, fy); ctx.stroke(); }

// spoken mouth amount for `ids` at time t from the word timings
function talkAmt(TL, ids, t) { for (const id of [].concat(ids)) { const L = TL.lines.find(l => l.id === id); if (!L || t < L.t0 || t > L.t1) continue; const w = L.words.find(w => t >= w.t0 && t <= w.t1 + 0.02); if (w) return 0.35 + 0.65 * Math.abs(Math.sin(t * 17 + w.t0 * 5)); } return 0; }

module.exports = Object.assign({}, B, { QA, ik, person, hero, rosa, zombie, HERO, ROSA, can, spoon, bottle, radio, pan, flashlight, timer, band, bread, plate, flareGun, crate, talkAmt });
