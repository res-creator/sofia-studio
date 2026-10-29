// BRAIN / HEART / STOMACH – original characters, one shared style (ink outline, crescent shadow, glossy highlight).
// Local origin = floor point under the character. Pose fields (all optional):
//  x,y(floor),s,flip, sx,sy (squash), lean, bob, lookX,lookY, blink, lid, angry(+)/worried(-) eye+brow tilt, browY,
//  mouth:{open,curve,w,teeth,wob}, armL/armR:{x,y,pose,bend} (hand target in body-group coords), step (leg phase), amp (leg lift), t (time)
const A = require('./art');
const { TAU, INK, cel, ell, fillInk, hose, hand, eye, brow, mouth, sweat, shadow, leg } = A;

const defaults = { x: 0, y: 0, s: 1, flip: 1, sx: 1, sy: 1, lean: 0, bob: 0, lookX: 0, lookY: 0, blink: 0, lid: 0, angry: 0, browY: 0, step: 0, amp: 0, t: 0, legSpread: 38, hurt: 0 };
const mk = p => Object.assign({}, defaults, p, { mouth: Object.assign({ open: 0, curve: 0, w: 70 }, p.mouth), armL: Object.assign({ x: -190, y: -60, pose: 'open', bend: 0.5 }, p.armL), armR: Object.assign({ x: 190, y: -60, pose: 'open', bend: -0.5 }, p.armR) });

function legs(ctx, p, hipY, spread, col, shoeCol, sole, w = 20) {
  for (const sd of [-1, 1]) {
    const ph = p.step + (sd > 0 ? Math.PI : 0), lift = p.amp * Math.max(0, Math.sin(ph));
    leg(ctx, sd * spread * 0.55, hipY - 6, sd * spread, -lift, w, col, p.flip, shoeCol, sole);
  }
}
function arms(ctx, p, sh, col, dark, w = 20) { // sh: shoulder anchors in group coords
  for (const [side, arm, s] of [[-1, p.armL, sh[0]], [1, p.armR, sh[1]]]) {
    const ang = hose(ctx, s, [arm.x, arm.y], arm.bend, w, col, dark);
    if (arm.hold) { ctx.save(); ctx.translate(arm.x, arm.y); arm.hold(ctx); ctx.restore(); }
    hand(ctx, arm.x, arm.y, ang, arm.pose, 1.05);
  }
}
function face(ctx, p, cfg) {
  const { ex, ey, rw, rh, lidCol, my, browDy, bw } = cfg;
  const tilt = p.angry;
  for (const sd of [-1, 1]) {
    const bl = Math.max(p.blink, 0);
    eye(ctx, sd * ex, ey, rw, rh, { lx: p.lookX, ly: p.lookY, lid: Math.max(p.lid, 0), blink: bl, tilt: sd < 0 ? tilt : -tilt, lidCol, pr: cfg.pr || 0.42, reflect: cfg.reflect, pupilScale: p.pupil || 1 });
    brow(ctx, sd * (ex + (cfg.bx || 0)), ey - rh - browDy + p.browY * 18 - (p.browSide ? p.browSide[sd < 0 ? 0 : 1] * 14 : 0), bw, { ang: (sd < 0 ? 1 : -1) * tilt * 0.55, arch: 6 + Math.abs(p.browY) * 3, th: cfg.bth || 11 });
  }
  mouth(ctx, cfg.mx || 0, my, p.mouth.w, Object.assign({ tt: p.t }, p.mouth));
}

// ===================================== BRAIN =====================================
function brainPath(rx, ry) {
  const p = new Path2D(), n = 11;
  for (let i = 0; i <= 200; i++) {
    const a = i / 200 * TAU, bump = Math.abs(Math.sin(a * n / 2)), flat = Math.sin(a) > 0.75 ? 0.9 : 1; // slightly flat bottom
    const r = (1 + 0.075 * bump) * flat * (1 - 0.06 * Math.max(0, Math.sin(a)));
    const x = Math.cos(a) * rx * r, y = Math.sin(a) * ry * r;
    i ? p.lineTo(x, y) : p.moveTo(x, y);
  }
  p.closePath(); return p;
}
function drawBrain(ctx, o) {
  const p = mk(o); ctx.save(); ctx.translate(p.x, p.y); ctx.scale(p.s * p.flip, p.s);
  shadow(ctx, 0, 4, 120);
  legs(ctx, p, -65, p.legSpread, '#ffc9d9', '#ffffff', '#35c4c0');
  ctx.translate(0, -65 + p.bob); ctx.rotate(p.lean); ctx.scale(p.sx, p.sy);
  // zap antenna
  const z = 0.5 + 0.5 * Math.sin(p.t * 9), ant = new Path2D(); ant.moveTo(0, -230); ant.bezierCurveTo(-18, -255, 22, -270, 6, -296 - (p.zap || 0) * 10);
  ctx.strokeStyle = INK; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.stroke(ant); ctx.strokeStyle = '#ff7aa5'; ctx.lineWidth = 5; ctx.stroke(ant);
  ctx.save(); ctx.translate(6, -300 - (p.zap || 0) * 10); ctx.rotate(Math.sin(p.t * 6) * 0.2);
  const sp = new Path2D(); sp.moveTo(0, -20); sp.lineTo(8, -4); sp.lineTo(20, -6); sp.lineTo(10, 6); sp.lineTo(14, 22); sp.lineTo(0, 12); sp.lineTo(-14, 22); sp.lineTo(-10, 6); sp.lineTo(-20, -6); sp.lineTo(-8, -4); sp.closePath();
  ctx.scale(1 + (p.zap || 0) * 0.5 + z * 0.1, 1 + (p.zap || 0) * 0.5 + z * 0.1); fillInk(ctx, sp, (p.zap || 0) > 0.3 ? '#fff6a8' : '#ffe14d', 4.5); ctx.restore();
  // body
  ctx.save(); ctx.translate(0, -125);
  const body = brainPath(150, 125);
  cel(ctx, body, '#ff93b6', '#e5608e', { w: 300, h: 250, dx: 0.05, dy: 0.1, hl: '#ffc6da', hx: -75, hy: -78, hw: 52, hh: 22, ha: -0.5 });
  // folds
  ctx.save(); ctx.clip(body); ctx.strokeStyle = '#c9477a'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const fold = (pts) => { ctx.beginPath(); ctx.moveTo(pts[0], pts[1]); for (let i = 2; i + 3 < pts.length; i += 4) ctx.quadraticCurveTo(pts[i], pts[i + 1], pts[i + 2], pts[i + 3]); ctx.stroke(); };
  fold([0, -128, -22, -104, 4, -84, -10, -56]); fold([-98, -96, -76, -118, -56, -92, -36, -104]);
  fold([98, -96, 76, -118, 56, -92, 36, -104]); fold([-132, -40, -110, -64, -90, -36, -68, -52]); fold([132, -40, 110, -64, 90, -36, 68, -52]);
  fold([-62, -122, -48, -136, -32, -118, -16, -134]); fold([62, -122, 48, -136, 32, -118, 16, -134]);
  ctx.restore();
  // face (glasses)
  face(ctx, p, { ex: 56, ey: 4, rw: 36, rh: 42, lidCol: '#ff93b6', my: 84, browDy: 36, bw: 64, bx: 4, pr: 0.4, reflect: p.reflect });
  ctx.lineWidth = 9; ctx.strokeStyle = '#1e7f8c'; ctx.lineCap = 'round';
  for (const sd of [-1, 1]) { const g = ell(sd * 56, 4, 52, 56); ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 15; ctx.stroke(g); ctx.strokeStyle = '#2bb7c9'; ctx.lineWidth = 9; ctx.stroke(g); ctx.fillStyle = 'rgba(190,240,255,0.18)'; ctx.fill(g); ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(sd * 56, 4, 42, 3.6, 4.3); ctx.stroke(); ctx.restore(); }
  ctx.strokeStyle = INK; ctx.lineWidth = 13; ctx.beginPath(); ctx.moveTo(-6, 0); ctx.quadraticCurveTo(0, -8, 6, 0); ctx.stroke(); ctx.strokeStyle = '#2bb7c9'; ctx.lineWidth = 6; ctx.stroke();
  // bags
  ctx.strokeStyle = '#b73a6b'; ctx.lineWidth = 4; ctx.lineCap = 'round'; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.arc(sd * 56, 14, 38, 0.35, 1.1); ctx.stroke(); }
  if (p.sweat) { sweat(ctx, -128, -60 + p.sweat * 10, 0.9, Math.min(1, p.sweat)); }
  ctx.restore();
  arms(ctx, p, [[-146, -125], [146, -125]], '#ffc9d9', '#e8a0b8');
  ctx.restore();
}

// ===================================== HEART =====================================
function drawHeart(ctx, o) {
  const p = mk(Object.assign({ legSpread: 34 }, o)); ctx.save(); ctx.translate(p.x, p.y); ctx.scale(p.s * p.flip, p.s);
  shadow(ctx, 0, 4, 100);
  legs(ctx, p, -70, p.legSpread, '#f0556b', '#ffffff', '#ff5d8f', 19);
  const beat = (p.beat || 0); // 0..1 pulse
  ctx.translate(0, -70 + p.bob); ctx.rotate(p.lean); ctx.scale(p.sx * (1 + beat * 0.07), p.sy * (1 + beat * 0.07));
  // vessels behind
  const tube = (a, b, c, w, col, dark) => { const q = new Path2D(); q.moveTo(a[0], a[1]); q.quadraticCurveTo(c[0], c[1], b[0], b[1]); ctx.lineCap = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = w + 11; ctx.stroke(q); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke(q); ctx.strokeStyle = dark; ctx.lineWidth = w * 0.3; ctx.globalAlpha = 0.5; const r = new Path2D(); r.moveTo(a[0] + 5, a[1]); r.quadraticCurveTo(c[0] + 5, c[1], b[0] + 5, b[1]); ctx.stroke(r); ctx.globalAlpha = 1; };
  const cap = (x, y, rx, col) => fillInk(ctx, ell(x, y, rx, rx * 0.45), col, 5);
  tube([-34, -190], [-92, -262], [-40, -330], 36, '#ea4560', '#a81d3c'); cap(-92, -262, 21, '#7a1330');
  tube([34, -196], [44, -296], [40, -250], 30, '#5b86e0', '#2f55a8'); cap(44, -298, 17, '#1f3d85');
  tube([84, -176], [104, -262], [112, -220], 24, '#6f9bf0', '#3a66be'); cap(104, -264, 13, '#1f3d85');
  const h = new Path2D(); h.moveTo(0, 0); h.bezierCurveTo(-34, -22, -138, -86, -132, -156); h.bezierCurveTo(-128, -214, -54, -236, 0, -184); h.bezierCurveTo(54, -238, 130, -214, 132, -156); h.bezierCurveTo(138, -86, 34, -22, 0, 0); h.closePath();
  cel(ctx, h, '#f2465f', '#c02548', { w: 270, h: 240, dx: 0.06, dy: 0.1, hl: '#ff8da0', hx: -78, hy: -190, hw: 40, hh: 18, ha: -0.7 });
  ctx.save(); ctx.clip(h); ctx.strokeStyle = '#a81d3c'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  const br = (pts) => { ctx.beginPath(); ctx.moveTo(pts[0], pts[1]); for (let i = 2; i + 3 < pts.length; i += 4) ctx.quadraticCurveTo(pts[i], pts[i + 1], pts[i + 2], pts[i + 3]); ctx.stroke(); };
  br([-30, -196, -60, -170, -96, -150, -112, -100]); br([-70, -166, -64, -140, -76, -120, -80, -96]); br([40, -196, 72, -176, 100, -148, 112, -112]); br([-26, -20, -36, -50, -16, -66]);
  ctx.fillStyle = 'rgba(255,214,110,0.55)'; for (const [x, y, r] of [[-100, -132, 11], [-90, -108, 8], [100, -140, 10]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
  ctx.restore();
  ctx.save(); ctx.translate(0, -118); face(ctx, p, { ex: 46, ey: 0, rw: 38, rh: 46, lidCol: '#f2465f', my: 66, browDy: 38, bw: 56, pr: 0.46, bth: 10, reflect: p.reflect }); 
  for (const sd of [-1, 1]) { ctx.fillStyle = 'rgba(255,150,170,0.55)'; ctx.beginPath(); ctx.ellipse(sd * 88, 40, 20, 11, 0, 0, TAU); ctx.fill(); }
  if (p.sweat) { sweat(ctx, 104, -62 + (p.sweat * 14) % 14, 1, Math.min(1, p.sweat)); sweat(ctx, -110, -40 + ((p.sweat * 14 + 7) % 14), 0.75, Math.min(1, p.sweat)); }
  ctx.restore();
  arms(ctx, p, [[-122, -110], [122, -110]], '#f77086', '#c02548', 19);
  ctx.restore();
}

// ===================================== STOMACH =====================================
function drawStomach(ctx, o) {
  const p = mk(Object.assign({ legSpread: 46 }, o)); ctx.save(); ctx.translate(p.x, p.y); ctx.scale(p.s * p.flip, p.s);
  shadow(ctx, 0, 4, 130);
  legs(ctx, p, -52, p.legSpread, '#f6c261', '#8be08a', '#6bc56b', 22);
  ctx.translate(0, -52 + p.bob); ctx.rotate(p.lean); ctx.scale(p.sx * (1 + (p.rumble || 0) * 0.04), p.sy * (1 + (p.rumble || 0) * 0.04));
  // oesophagus + duodenum tubes
  const tube = (a, b, c, w) => { const q = new Path2D(); q.moveTo(a[0], a[1]); q.quadraticCurveTo(c[0], c[1], b[0], b[1]); ctx.lineCap = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = w + 11; ctx.stroke(q); ctx.strokeStyle = '#f48aa0'; ctx.lineWidth = w; ctx.stroke(q); ctx.strokeStyle = '#d9607c'; ctx.lineWidth = w * 0.3; ctx.globalAlpha = 0.5; ctx.stroke(q); ctx.globalAlpha = 1; };
  tube([30, -250], [6, -330], [34, -296], 36); fillInk(ctx, ell(6, -332, 20, 9), '#8c2745', 5);
  tube([236, -110], [300, -196], [316, -120], 30); fillInk(ctx, ell(301, -198, 17, 8, 0.6), '#8c2745', 5);
  const b = new Path2D(); b.moveTo(-60, -262); b.bezierCurveTo(10, -285, 90, -262, 112, -205); b.bezierCurveTo(128, -170, 160, -165, 206, -158); b.bezierCurveTo(262, -150, 290, -110, 262, -72); b.bezierCurveTo(232, -34, 170, -14, 100, -6); b.bezierCurveTo(10, 6, -110, 6, -158, -60); b.bezierCurveTo(-206, -125, -172, -232, -60, -262); b.closePath();
  cel(ctx, b, '#f7b53a', '#d8822a', { w: 440, h: 270, dx: 0.05, dy: 0.1, hl: '#ffe29a', hx: -70, hy: -224, hw: 58, hh: 18, ha: -0.3 });
  ctx.save(); ctx.clip(b); ctx.strokeStyle = '#c47320'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  const wv = (x0, y0, x1, y1) => { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.bezierCurveTo(x0 + (x1 - x0) * 0.3, y0 - 14, x0 + (x1 - x0) * 0.6, y0 + 14, x1, y1); ctx.stroke(); };
  wv(150, -150, 250, -118); wv(120, -36, 220, -60); wv(-140, -34, -92, -12); wv(110, -196, 150, -168);
  // belly spots
  ctx.fillStyle = 'rgba(196,115,32,0.35)'; for (const [x, y, r] of [[150, -100, 12], [180, -70, 8], [-140, -80, 9]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
  ctx.restore();
  ctx.save(); ctx.translate(-36, -128);
  face(ctx, p, { ex: 56, ey: -2, rw: 40, rh: 36, lidCol: '#f7b53a', my: 62, browDy: 28, bw: 60, pr: 0.38, bth: 10, reflect: p.reflect });
  ctx.strokeStyle = '#b8601c'; ctx.lineWidth = 5; ctx.lineCap = 'round'; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.arc(sd * 56, 8, 44, 0.4, 1.25); ctx.stroke(); }
  if (p.drool) { const d = new Path2D(); d.moveTo(34, 62); d.lineTo(34, 62 + 22 + p.drool * 26); d.bezierCurveTo(48, 90 + p.drool * 26, 48, 74 + p.drool * 26, 44, 62); fillInk(ctx, d, '#bfeaff', 4); }
  if (p.zzz) { for (let i = 0; i < 3; i++) { const u = ((p.t * 0.5 + i / 3) % 1); A.text(ctx, 'Z', 130 + u * 70 + i * 6, -140 - u * 130, 40 + i * 12, '#dff3ff', { stroke: 7 }); } }
  ctx.restore();
  arms(ctx, p, [[-172, -110], [110, -40]], '#f9cc72', '#d8822a', 22);
  ctx.restore();
}
module.exports = { drawBrain, drawHeart, drawStomach };
