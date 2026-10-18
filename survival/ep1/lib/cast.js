// Episode 1 cast on the approved D2 rig (rig.js is not modified: new characters are new cast entries + drawing hooks).
// Everyone faces left by default; flip(ctx, x, fn) mirrors a character around its own x so it faces right.
const R = require('../../test_style/rig'), P = require('../../test_style/props');
const { paint, cap, line, shade, lerp, clamp, add } = R;
const D2 = Object.assign({}, R.SKINS.D2, { garyVar: '20' });
const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const INK = D2.ink;

// ---- cast entries ----
const HERO = R.who(D2, 'hero'), GARY = R.who(D2, 'gary');
const SARAH = { S: Object.assign({}, D2, { headR: 80, neck: 14, torso: 158, thigh: 104, shin: 98, ua: 94, fa: 90, shW: 24, limbW: 1.12, foot: 70 }),
  C: { skin: '#c98e66', top: '#3fa7a0', top2: '#2f8a84', pants: '#2c2f45', shoe: '#e0523e', sole: '#9a3a2c', hair: '#3a1c12', bald: true, lady: true } };
// infected neighbours: grey-green skin, torn clothes, red eyes
const ZB = {
  office: { S: Object.assign({}, D2, { headR: 80, neck: 12, torso: 172, thigh: 108, shin: 100, ua: 100, fa: 96, shW: 28, limbW: 1.18, foot: 76 }),
    C: { skin: '#a3b08c', top: '#e8e4d8', top2: '#cfc8b4', pants: '#3a3f52', shoe: '#2a2622', sole: '#1a1612', hair: '#3a3128', tie: '#b8403a', torn: 1 } },
  jogger: { S: Object.assign({}, D2, { headR: 78, neck: 14, torso: 160, thigh: 110, shin: 104, ua: 96, fa: 92, shW: 24, limbW: 1.1, foot: 74 }),
    C: { skin: '#97a88a', top: '#c8463c', top2: '#a3352d', pants: '#2e3240', shoe: '#e8e6e0', sole: '#a8a49c', hair: '#c9a24a', torn: 1 } },
  big: { S: Object.assign({}, D2, { headR: 84, neck: 6, torso: 160, thigh: 98, shin: 90, ua: 96, fa: 92, shW: 30, limbW: 1.36, foot: 82 }),
    C: { skin: '#8fa088', top: '#4f6f9a', top2: '#3d587d', pants: '#5a4a3a', shoe: '#3a3028', sole: '#221a14', hair: '#2a2a2a', bald: true, belly: 1.3, wide: 1.35, torn: 1 } },
};

// ---- helpers ----
function flip(ctx, x, on, fn) { if (!on) return fn(); ctx.save(); ctx.translate(x, 0); ctx.scale(-1, 1); ctx.translate(-x, 0); fn(); ctx.restore(); }
// head-space transform used by the rig's head(): lets hooks draw on the head (hair, bite marks, lashes)
function onHead(ctx, ch, J, o, fn) { ctx.save(); ctx.translate(...J.head); ctx.rotate(-J.ht + (o.headRot || 0)); if (o.headScale) ctx.scale(1 / o.headScale, o.headScale); fn(ch.S.headR); ctx.restore(); }
// torso frame (origin at hip, y up the spine)
function onTorso(ctx, J, fn) { const T = Math.hypot(J.neck[0] - J.hip[0], J.neck[1] - J.hip[1]), a = Math.atan2(J.neck[1] - J.hip[1], J.neck[0] - J.hip[0]) + Math.PI / 2; ctx.save(); ctx.translate(...J.hip); ctx.rotate(a); fn(T); ctx.restore(); }

// Sarah's hair (drawn over the bald rig head): bob with a ponytail, lashes
function sarahHairBack(ctx, ch, J, o) { onHead(ctx, ch, J, o, Rr => { const sw = Math.sin((o.t || 0) * 5) * 0.06 + (o.hairSwing || 0);
  paint(ctx, ch.S, c => { c.moveTo(Rr * 0.7, -Rr * 0.5); c.quadraticCurveTo(Rr * 1.5, -Rr * 0.6, Rr * (1.5 + sw), Rr * 0.5); c.quadraticCurveTo(Rr * (1.55 + sw), Rr * 1.05, Rr * (1.2 + sw), Rr * 1.25); c.quadraticCurveTo(Rr * 1.15, Rr * 0.6, Rr * 0.6, Rr * 0.05); c.closePath(); }, ch.C.hair, { k: 0.7 }); }); }
function sarahHair(ctx, ch, J, o) { onHead(ctx, ch, J, o, Rr => {
  paint(ctx, ch.S, c => { c.moveTo(-Rr * 0.95, -Rr * 0.1); c.quadraticCurveTo(-Rr * 1.08, -Rr * 1.2, Rr * 0.1, -Rr * 1.16); c.quadraticCurveTo(Rr * 1.08, -Rr * 1.1, Rr * 0.98, Rr * 0.05); c.lineTo(Rr * 0.7, Rr * 0.12);
    c.quadraticCurveTo(Rr * 0.66, -Rr * 0.5, Rr * 0.1, -Rr * 0.72); c.quadraticCurveTo(-Rr * 0.5, -Rr * 0.66, -Rr * 0.8, -Rr * 0.42); c.quadraticCurveTo(-Rr * 0.9, -Rr * 0.3, -Rr * 0.95, -Rr * 0.1); c.closePath(); }, ch.C.hair, { k: 0.7 });
  paint(ctx, ch.S, c => c.roundRect(Rr * 0.9, -Rr * 0.62, Rr * 0.24, Rr * 0.3, 6), '#ffd23f');   // hair tie
  if (!['closed', 'happy'].includes((o.e || {}).eyes)) for (const [ex, sc] of [[ch.S.eyeNear, 1], [ch.S.eyeFar, 0.78]]) { const x = ex * Rr - ch.S.eyeR * Rr * sc, y = ch.S.eyeY * Rr - ch.S.eyeR * Rr * 0.7;
    line(ctx, [[x + 4, y + 4], [x - 10, y - 6]], 5, INK); } }); }
// bite mark (neck for Gary, forearm for the hero)
function biteMark(ctx, x, y, s = 1, fresh = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = `rgba(150,30,35,${0.55 * fresh + 0.25})`; ctx.beginPath(); ctx.ellipse(0, 0, 22, 14, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#7a1418'; for (let i = 0; i < 6; i++) { const a = Math.PI * (0.15 + i * 0.14); ctx.beginPath(); ctx.ellipse(Math.cos(a) * 18, -Math.sin(a) * 10 + 2, 3.2, 4, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(Math.cos(a) * 18, Math.sin(a) * 10 - 2, 3.2, 4, 0, 0, 7); ctx.fill(); }
  ctx.restore();
}
// torn shirt: jagged dark rips + blood stains in the torso frame
function tears(ctx, ch, J, seed = 0) { onTorso(ctx, J, T => { const sw = (ch.S.shW + 18) * (ch.C.wide || 1);
  ctx.fillStyle = shade(ch.C.top, 0.45); for (let k = 0; k < 3; k++) { const x0 = -sw * 0.9 + hash(seed + k) * sw * 1.4, y0 = -T * (0.2 + hash(seed + k + 5) * 0.6);
    ctx.beginPath(); ctx.moveTo(x0, y0); for (let i = 1; i <= 5; i++) ctx.lineTo(x0 + i * 7 * (i % 2 ? 1 : -0.4), y0 + i * 9); ctx.lineTo(x0 + 6, y0 + 50); ctx.lineTo(x0 - 6, y0 + 20); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = 'rgba(130,25,30,0.55)'; ctx.beginPath(); ctx.ellipse(-sw * 0.5, -T * 0.82, 26, 18, 0.5, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(sw * 0.3, -T * 0.5, 14, 22, 0, 0, 7); ctx.fill();
  ctx.fillStyle = shade(ch.C.top, 0.6); ctx.beginPath(); ctx.moveTo(-sw, 18); for (let i = 0; i <= 8; i++) ctx.lineTo(-sw + i * sw / 4, 18 - (i % 2) * 22); ctx.lineTo(sw, 30); ctx.lineTo(-sw, 30); ctx.fill(); }); }
function tie(ctx, ch, J) { onTorso(ctx, J, T => { paint(ctx, ch.S, c => { c.moveTo(-ch.S.shW * 0.9 - 8, -T + 6); c.lineTo(-ch.S.shW * 0.9 + 8, -T + 6); c.lineTo(-ch.S.shW * 0.9 + 12, -T * 0.45); c.lineTo(-ch.S.shW * 0.9, -T * 0.36); c.lineTo(-ch.S.shW * 0.9 - 10, -T * 0.5); c.closePath(); }, ch.C.tie); }); }

// ---- backpack (worn on the back = +x for a left-facing body) + walkie radio on the strap ----
function packBack(ctx, ch, J, o = {}) { onTorso(ctx, J, T => { const sw = (ch.S.shW + 18);
  paint(ctx, ch.S, c => c.roundRect(sw * 0.55, -T * 0.92, sw * 1.35, T * 0.82, 26), '#5b7d3a');
  paint(ctx, ch.S, c => c.roundRect(sw * 1.1, -T * 0.55, sw * 0.95, T * 0.38, 16), '#4c6a30');
  if (o.duck) { ctx.save(); ctx.translate(sw * 1.6, -T * 0.95); duck(ctx, 0, 0, 0.55, -0.3, ch.S); ctx.restore(); } }); }
function packStrap(ctx, ch, J, o = {}) { onTorso(ctx, J, T => { const sw = ch.S.shW + 18;
  ctx.save(); ctx.lineCap = 'round'; ctx.lineWidth = 16 + ch.S.lw * 2; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(-sw * 0.2, -T - 4); ctx.quadraticCurveTo(-sw * 0.85, -T * 0.6, -sw * 0.35, -T * 0.25); ctx.stroke(); ctx.lineWidth = 16; ctx.strokeStyle = '#4c6a30'; ctx.stroke(); ctx.restore();
  if (o.radio) { const x = -sw * 0.62, y = -T * 0.62, led = o.radioOn && Math.floor((o.t || 0) * 8) % 2;
    paint(ctx, ch.S, c => c.rect(x + 4, y - 50, 7, 30), '#222'); paint(ctx, ch.S, c => c.roundRect(x - 18, y - 24, 38, 56, 7), '#2f3136');
    ctx.fillStyle = led ? '#ff4b3a' : '#5a2a28'; ctx.beginPath(); ctx.arc(x + 10, y - 13, 4.5, 0, 7); ctx.fill(); ctx.fillStyle = '#6e737c'; for (let i = 0; i < 3; i++) ctx.fillRect(x - 10, y + i * 8, 22, 3); } }); }

// ---- the people ----
// h = { pose, e, grips:{near,far}, hold, holdBoth, flip, pack, packDuck, radio, radioOn, bite, biteFresh, sleeve, t, headScale, headRot, farHand, nearHand, gray }
function person(ctx, ch, h, tag) {
  const J = h.J || R.solveGrip(ch.S, h.pose, h.grips || {}, tag);
  let C = ch.C;
  if (h.gray) { const g = h.gray; C = Object.assign({}, C, { skin: mix(C.skin, '#9fae8e', g) }); }
  const o = { t: h.t, headScale: h.headScale, headRot: h.headRot, farHand: h.farHand, nearHand: h.nearHand, farFront: h.farFront, e: h.e };
  const lady = C.lady, z = C.torn;
  o.behind = c => { if (lady) sarahHairBack(c, ch, J, o); if (h.pack) packBack(c, ch, J, { duck: h.packDuck }); if (h.behind) h.behind(c, J); };
  o.underFar = h.underFar && (c => h.underFar(c, J));
  o.hold = h.hold && (c => h.hold(c, J));
  o.holdNear = h.holdNear && (c => h.holdNear(c, J));
  o.front = c => {
    if (lady) sarahHair(c, ch, J, o);
    if (C.tie) tie(c, ch, J);
    if (z) tears(c, ch, J, h.seed || 0);
    if (h.pack) packStrap(c, ch, J, { radio: h.radio, radioOn: h.radioOn, t: h.t });
    if (h.neckBite) biteMark(c, J.neck[0] + 22, J.neck[1] - 6, 0.9, 0.4);
    if (h.bite) { const p = [lerp(J.eN[0], J.wN[0], 0.55), lerp(J.eN[1], J.wN[1], 0.55)]; if (h.sleeve) sleeve(c, ch, J); else biteMark(c, p[0], p[1], 0.8, h.biteFresh ?? 1); }
    if (z) onHead(c, ch, J, o, Rr => { c.fillStyle = 'rgba(120,20,25,0.7)'; c.beginPath(); c.ellipse(ch.S.mouthX * Rr + 6, ch.S.mouthY * Rr + 16, 16, 9, 0.2, 0, 7); c.fill(); });
    if (h.front) h.front(c, J);
  };
  if (h.drawFirst) h.drawFirst(ctx, J);
  flip(ctx, h.pose.x, h.flip, () => R.drawChar(ctx, ch.S, C, J, h.e || {}, o));
  return J;
}
// sleeve pulled down over the bitten forearm
function sleeve(ctx, ch, J) { const k = ch.S.limbW, armW = 20 * k; paint(ctx, ch.S, c => cap(c, J.eN, [lerp(J.eN[0], J.wN[0], 0.85), lerp(J.eN[1], J.wN[1], 0.85)], armW * 1.05, armW * 0.95), ch.C.top); }
function mix(a, b, u) { const p = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)); const A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * u).toString(16).padStart(2, '0')).join(''); }

// infected shamble: forward lean, arms reaching, uneven gait, head lolling.  x moves by walking (no foot slide: u = dist/stride)
function zombiePose(ch, x, ground, t, o = {}) {
  const st = o.stride || 70, u = o.u ?? 0, seed = o.seed || 0, S = ch.S, reach = S.ua + S.fa;
  const pose = { x, ground, lean: 0.26 + Math.sin(t * 2 + seed) * 0.04, crouch: 0.12, tilt: 0.25 * Math.sin(t * 1.3 + seed) - 0.1, walk: o.still ? null : { w: 1, u, stride: st } };
  const J0 = R.solve(S, pose), lunge = o.lunge || 0;
  const arm = (sh, k) => [sh[0] - reach * (0.82 + 0.15 * lunge) + Math.sin(t * 3 + k + seed) * 10, sh[1] + 18 - lunge * 30 + Math.cos(t * 2.4 + k + seed) * 12];
  pose.near = arm(J0.shN, 0); pose.far = arm(J0.shF, 1.7);
  return pose;
}
const ZFACE = (t, seed = 0, o = {}) => ({ eyes: o.eyes || 'open', brow: 'angry', mouth: 'teeth', open: 0.3 + 0.3 * Math.max(0, Math.sin(t * 5 + seed)), look: o.look || [-0.6, 0.1], blood: 1 });

// ---- animals (side view, facing left; ink + cel shade like the people) ----
const CATC = { fur: '#e58f3c', dark: '#b8662a', belly: '#f6d2a6' };
// pose: sit | stalk | pounce | run | hiss ; o: { eye:'#..', glow, mouth:'closed'|'hiss', look, blink, u (run phase), tailK, turn (head turns to camera 0..1), puff }
function cat(ctx, x, ground, s, t, pose = 'sit', o = {}) {
  const S = D2; ctx.save(); ctx.translate(x, ground); ctx.scale(s, s);
  const fur = o.gray ? mix(CATC.fur, '#9aa087', o.gray) : CATC.fur, dark = shade(fur, 0.78), puff = o.puff || 0;
  // shadow
  ctx.save(); ctx.globalAlpha = 0.25; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(0, 4, 120, 14, 0, 0, 7); ctx.fill(); ctx.restore();
  const u = o.u || 0, ru = Math.sin(u * Math.PI * 2);
  let body, headP, legs, tail;
  if (pose === 'sit') { body = { x: 20, y: -95, rx: 70, ry: 88, a: 0.25 }; headP = [-34, -205]; legs = [[[-30, -40], [-36, 0]], [[-6, -40], [-10, 0]]]; tail = [[70, -20], [150, 0], [140, -60]]; }
  else if (pose === 'pounce') { body = { x: 0, y: -90, rx: 135, ry: 52, a: 0.12 }; headP = [-140, -125]; legs = [[[-90, -70], [-190, -40]], [[-70, -70], [-170, -20]], [[90, -80], [190, -60]], [[70, -80], [170, -40]]]; tail = [[120, -100], [220, -150], [270, -120]]; }
  else if (pose === 'hiss') { body = { x: 0, y: -110 - puff * 10, rx: 120, ry: 64 + puff * 10, a: 0 }; headP = [-118, -125]; legs = [[[-70, -70], [-80, 0]], [[-50, -70], [-50, 0]], [[60, -70], [70, 0]], [[80, -70], [96, 0]]]; tail = [[110, -120], [170, -220], [150, -300]]; }
  else { // stalk / run
    const run = pose === 'run', sp = run ? 1 : 0.4;
    body = { x: 0, y: run ? -95 + Math.abs(ru) * 8 : -80, rx: 125, ry: 55, a: run ? ru * 0.06 : 0 }; headP = [-125, run ? -120 : -100];
    const lg = (bx, ph) => { const p = Math.sin((u + ph) * Math.PI * 2) * 45 * sp, lift = Math.max(0, Math.cos((u + ph) * Math.PI * 2)) * 22 * sp; return [[bx, -60], [bx + p, -lift]]; };
    legs = [lg(-70, 0), lg(-50, 0.5), lg(60, 0.25), lg(84, 0.75)]; tail = [[115, -100], [200, -130 - Math.sin(t * 3) * 20], [240, run ? -110 : -170]];
  }
  const tw = Math.sin(t * 3.2) * 18 * (o.tailK ?? 1);
  // far legs, tail
  legs.forEach((L, i) => { if (i % 2) paint(ctx, S, c => cap(c, L[0], L[1], 17, 14), dark); });
  paint(ctx, S, c => { c.moveTo(...tail[0]); c.quadraticCurveTo(tail[1][0], tail[1][1] + tw, tail[2][0] + tw, tail[2][1]); c.lineTo(tail[2][0] + tw + 1, tail[2][1] + 1); c.quadraticCurveTo(tail[1][0] - 20, tail[1][1] + tw + 30, tail[0][0] - 10, tail[0][1] + 25); c.closePath(); }, fur);
  ctx.save(); ctx.lineCap = 'round'; ctx.lineWidth = 26 + puff * 14 + S.lw * 2; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(...tail[0]); ctx.quadraticCurveTo(tail[1][0], tail[1][1] + tw, tail[2][0] + tw, tail[2][1]); ctx.stroke(); ctx.lineWidth = 26 + puff * 14; ctx.strokeStyle = fur; ctx.stroke(); ctx.restore();
  // body (+ fur spikes when puffed)
  if (puff > 0.05) { ctx.save(); ctx.translate(body.x, body.y); ctx.rotate(body.a); for (let i = -4; i <= 4; i++) paint(ctx, S, c => { c.moveTo(i * 26 - 13, -body.ry * 0.8); c.lineTo(i * 26 + (hash(i) - 0.5) * 8, -body.ry - 26 * puff - hash(i + 3) * 14); c.lineTo(i * 26 + 13, -body.ry * 0.8); c.closePath(); }, fur); ctx.restore(); }
  paint(ctx, S, c => c.ellipse(body.x, body.y, body.rx, body.ry, body.a, 0, 7), fur);
  ctx.save(); ctx.beginPath(); ctx.ellipse(body.x, body.y, body.rx, body.ry, body.a, 0, 7); ctx.clip(); ctx.fillStyle = dark;
  for (const k of [-0.4, 0, 0.4]) { ctx.beginPath(); ctx.ellipse(body.x + k * body.rx, body.y - body.ry * 0.9, 12, body.ry * 0.55, 0.2, 0, 7); ctx.fill(); } ctx.restore();
  legs.forEach((L, i) => { if (!(i % 2)) { paint(ctx, S, c => cap(c, L[0], L[1], 18, 15), fur); paint(ctx, S, c => c.ellipse(L[1][0] - 6, L[1][1] - 4, 20, 12, 0, 0, 7), fur); } });
  // head
  ctx.save(); ctx.translate(...headP); ctx.rotate(o.headTilt || 0); const tn = o.turn || 0, HR = 62;
  for (const k of [-1, 1]) { const ex = (k < 0 ? -30 : 26) * (1 - tn * 0.2) + tn * k * 14; paint(ctx, S, c => { c.moveTo(ex - 22, -38); c.lineTo(ex - 6 + k * 6, -98 - (o.earsBack ? -30 : 0)); c.lineTo(ex + 22, -34); c.closePath(); }, k < 0 ? fur : dark);
    ctx.fillStyle = '#f2a7a0'; ctx.beginPath(); ctx.moveTo(ex - 12, -42); ctx.lineTo(ex - 5 + k * 5, -80 - (o.earsBack ? -24 : 0)); ctx.lineTo(ex + 12, -40); ctx.fill(); }
  paint(ctx, S, c => c.ellipse(0, 0, HR * 1.05, HR * 0.92, 0, 0, 7), fur);
  ctx.fillStyle = dark; for (const k of [-1, 0, 1]) { ctx.beginPath(); ctx.moveTo(k * 16 - 6, -HR * 0.9); ctx.lineTo(k * 16 - 2, -HR * 0.45); ctx.lineTo(k * 16 + 6, -HR * 0.9); ctx.fill(); }
  // muzzle shifts left (profile) unless turned to camera
  const mx = lerp(-34, 0, tn);
  paint(ctx, S, c => c.ellipse(mx, 22, 30, 20, 0, 0, 7), CATC.belly, { k: 0.92 });
  const ec = o.eye || '#9be35a', ey = -6, eh = o.blink ? 2 : (o.squint ? 6 : 15);
  for (const k of (tn > 0.5 ? [-1, 1] : [-1, 0.6])) { const exx = mx + k * 26, ew = k === 0.6 ? 11 : 16;
    if (o.glow) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(exx, ey, 0, exx, ey, 40); g.addColorStop(0, 'rgba(255,40,30,0.6)'); g.addColorStop(1, 'rgba(255,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(exx - 40, ey - 40, 80, 80); ctx.restore(); }
    ctx.beginPath(); ctx.ellipse(exx, ey, ew, eh, 0, 0, 7); ctx.fillStyle = ec; ctx.fill(); ctx.lineWidth = 4.5; ctx.strokeStyle = INK; ctx.stroke();
    if (eh > 3) { ctx.beginPath(); ctx.ellipse(exx + (o.look ? o.look[0] * 5 : -3), ey, o.wide ? 7 : 3.5, eh * 0.85, 0, 0, 7); ctx.fillStyle = INK; ctx.fill(); }
    if (o.angry) { ctx.fillStyle = fur; ctx.beginPath(); ctx.moveTo(exx - ew - 3, ey - eh - 4); ctx.lineTo(exx + ew + 3, ey - eh - 4); ctx.lineTo(exx + k * ew, ey - eh * 0.2); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(exx - ew, ey - eh * (k > 0 ? 0.9 : 0.2)); ctx.lineTo(exx + ew, ey - eh * (k > 0 ? 0.2 : 0.9)); ctx.lineWidth = 4; ctx.stroke(); } }
  ctx.fillStyle = '#e46f86'; ctx.beginPath(); ctx.moveTo(mx - 8, 10); ctx.lineTo(mx + 8, 10); ctx.lineTo(mx, 19); ctx.fill();
  if (o.mouth === 'hiss') { ctx.beginPath(); ctx.ellipse(mx, 36, 20, 14, 0, 0, 7); ctx.fillStyle = '#5a1f1f'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); ctx.fillStyle = '#fff'; for (const k of [-1, 1]) { ctx.beginPath(); ctx.moveTo(mx + k * 10 - 4, 24); ctx.lineTo(mx + k * 10, 38); ctx.lineTo(mx + k * 10 + 4, 24); ctx.fill(); } }
  else if (o.mouth === 'meow') { ctx.beginPath(); ctx.ellipse(mx, 33, 9, 9, 0, 0, 7); ctx.fillStyle = '#5a1f1f'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); }
  else { line(ctx, [[mx, 19], [mx - 9, 27]], 4, INK); line(ctx, [[mx, 19], [mx + 9, 27]], 4, INK); }
  for (const k of [-1, 1]) for (const d of [-6, 5]) line(ctx, [[mx + k * 22, 22 + d], [mx + k * 70, 14 + d * 1.8]], 2.5, INK);
  if (o.blood) { ctx.fillStyle = 'rgba(140,20,25,0.8)'; ctx.beginPath(); ctx.ellipse(mx + 6, 38, 10, 5, 0, 0, 7); ctx.fill(); }
  ctx.restore();
  ctx.restore();
}
function rat(ctx, x, ground, s, t, o = {}) {
  const S = D2; ctx.save(); ctx.translate(x, ground); ctx.scale(s, s); const u = o.u || 0;
  ctx.save(); ctx.lineCap = 'round'; ctx.lineWidth = 9 + S.lw * 2; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(70, -30); ctx.quadraticCurveTo(150, -10 + Math.sin(t * 6) * 18, 200, -40); ctx.stroke(); ctx.lineWidth = 9; ctx.strokeStyle = '#e39aa0'; ctx.stroke(); ctx.restore();
  for (const [bx, ph] of [[-40, 0], [40, 0.5]]) { const p = Math.sin((u + ph) * Math.PI * 2) * 14; paint(ctx, S, c => cap(c, [bx, -26], [bx + p, -2], 8, 7), '#5d606b'); }
  paint(ctx, S, c => c.ellipse(0, -40, 85, 40, 0, 0, 7), '#7c7f8a');
  paint(ctx, S, c => { c.moveTo(-50, -66); c.quadraticCurveTo(-140, -50, -150, -26); c.quadraticCurveTo(-110, -6, -50, -16); c.closePath(); }, '#8a8d98');
  paint(ctx, S, c => c.ellipse(-60, -72, 20, 22, 0, 0, 7), '#7c7f8a'); ctx.fillStyle = '#e39aa0'; ctx.beginPath(); ctx.ellipse(-60, -72, 12, 14, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#e46f86'; ctx.beginPath(); ctx.arc(-150, -28, 7, 0, 7); ctx.fill();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(-100, -44, 0, -100, -44, 26); g.addColorStop(0, 'rgba(255,40,30,0.7)'); g.addColorStop(1, 'rgba(255,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(-130, -74, 60, 60); ctx.restore();
  ctx.fillStyle = '#ff3b30'; ctx.beginPath(); ctx.arc(-100, -44, 8, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-102, -46, 2.5, 0, 7); ctx.fill();
  for (const k of [-1, 1]) line(ctx, [[-140, -26], [-190, -30 + k * 12]], 2.5, INK);
  ctx.restore();
}
function pigeon(ctx, x, ground, s, t, o = {}) {
  const S = D2; ctx.save(); ctx.translate(x, ground); ctx.scale(s, s); const bob = Math.max(0, Math.sin(t * 5)) * 12 * (o.bob ?? 1);
  line(ctx, [[-6, -46], [-10, 0]], 7, '#e46f86'); line(ctx, [[20, -46], [22, 0]], 7, '#e46f86');
  paint(ctx, S, c => { c.moveTo(60, -80); c.lineTo(140, -60); c.lineTo(120, -40); c.closePath(); }, '#5f6575');
  paint(ctx, S, c => c.ellipse(10, -80, 80, 50, -0.12, 0, 7), '#8d93a3');
  paint(ctx, S, c => c.ellipse(36, -88, 54, 28, -0.3, 0, 7), '#767c8c');
  ctx.save(); ctx.translate(-56 - bob, -130); paint(ctx, S, c => c.ellipse(16, 22, 30, 34, -0.3, 0, 7), '#6b8f84');
  paint(ctx, S, c => c.arc(0, 0, 34, 0, 7), '#8d93a3'); paint(ctx, S, c => { c.moveTo(-30, -4); c.lineTo(-58, 6); c.lineTo(-30, 12); c.closePath(); }, '#e0a530');
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(-10, -6, 0, -10, -6, 26); g.addColorStop(0, 'rgba(255,50,30,0.7)'); g.addColorStop(1, 'rgba(255,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(-40, -36, 60, 60); ctx.restore();
  ctx.fillStyle = '#ff5a2a'; ctx.beginPath(); ctx.arc(-10, -6, 10, 0, 7); ctx.fill(); ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(-10, -6, 4.5, 0, 7); ctx.fill(); ctx.restore();
  ctx.restore();
}
// rubber duck (centre x,y; s scale; rot)
function duck(ctx, x, y, s = 1, rot = 0, S = D2, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s * (o.squash ? 1 + o.squash * 0.2 : 1), s * (o.squash ? 1 - o.squash * 0.25 : 1));
  paint(ctx, S, c => { c.moveTo(-60, -10); c.quadraticCurveTo(-70, 40, 0, 40); c.quadraticCurveTo(58, 40, 56, 0); c.quadraticCurveTo(40, -24, 0, -14); c.quadraticCurveTo(-40, -30, -60, -10); c.closePath(); }, '#ffd23f');
  paint(ctx, S, c => c.arc(-16, -42, 30, 0, 7), '#ffd23f');
  paint(ctx, S, c => { c.moveTo(-40, -42); c.quadraticCurveTo(-74, -44, -70, -30); c.quadraticCurveTo(-56, -24, -40, -30); c.closePath(); }, '#f08a24');
  ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(-24, -50, 5, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-22.5, -51.5, 1.6, 0, 7); ctx.fill();
  ctx.fillStyle = '#efbf2c'; ctx.beginPath(); ctx.ellipse(16, 4, 24, 12, -0.3, 0, 7); ctx.fill();
  ctx.restore();
}
module.exports = { D2, HERO, GARY, SARAH, ZB, person, flip, onHead, onTorso, biteMark, zombiePose, ZFACE, cat, rat, pigeon, duck, mix, hash, P, R };
