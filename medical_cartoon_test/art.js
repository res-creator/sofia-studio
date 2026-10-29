// Shared drawing + animation helpers for the "medical cartoon" style test.
// Style: deep-purple ink outline, flat cel colours, one crescent shadow, one glossy highlight.
const path = require('path');
const { GlobalFonts, Path2D } = require('@napi-rs/canvas'); global.Path2D = Path2D;
const F = path.join(__dirname, '..', 'node_modules', '@fontsource', 'fredoka', 'files');
for (const w of [500, 600, 700]) GlobalFonts.registerFromPath(path.join(F, `fredoka-latin-${w}-normal.woff2`), 'Fredoka');

const TAU = Math.PI * 2;
const INK = '#2b1840';
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = {
  lin: u => u, io: u => u * u * (3 - 2 * u), out: u => 1 - (1 - u) * (1 - u), in: u => u * u,
  back: u => { const c = 1.9; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); },
  elastic: u => u <= 0 ? 0 : u >= 1 ? 1 : Math.pow(2, -9 * u) * Math.sin((u * 10 - 0.75) * (TAU / 3)) + 1,
};
// keyframes: [[t, v, easeName?], ...]  – easeName applies to the segment ending at that key
function kf(t, keys) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1], [t1, v1, e] = keys[i];
      if (e === 'hold') return v0;
      return lerp(v0, v1, (ease[e || 'io'])(clamp((t - t0) / (t1 - t0))));
    }
  }
  return keys[keys.length - 1][1];
}
// pulse 0..1..0 starting at t0 lasting d
const pulse = (t, t0, d) => { const u = (t - t0) / d; return u < 0 || u > 1 ? 0 : Math.sin(u * Math.PI); };

function fillInk(ctx, p, fill, lw = 7) {
  if (fill) { ctx.fillStyle = fill; ctx.fill(p); }
  ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(p);
}
// cel-shaded body: base, crescent shadow (offset), optional highlight blob, then ink outline
function cel(ctx, p, base, dark, o = {}) {
  const { dx = 0.07, dy = 0.1, w = 300, h = 300, lw = 7 } = o;
  ctx.save(); ctx.fillStyle = base; ctx.fill(p);
  ctx.save(); ctx.clip(p); ctx.fillStyle = dark; ctx.fillRect(-2000, -2000, 4000, 4000);
  ctx.translate(-dx * w, -dy * h); ctx.fillStyle = base; ctx.fill(p); ctx.restore();
  if (o.hl) { ctx.save(); ctx.clip(p); ctx.fillStyle = o.hl; ctx.globalAlpha = 0.75; ctx.beginPath(); ctx.ellipse(o.hx, o.hy, o.hw, o.hh, o.ha || -0.6, 0, TAU); ctx.fill(); ctx.restore(); }
  ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.stroke(p); ctx.restore();
}
function ell(cx, cy, rx, ry, rot = 0) { const p = new Path2D(); p.ellipse(cx, cy, rx, ry, rot, 0, TAU); return p; }
function rrect(x, y, w, h, r) { const p = new Path2D(); p.roundRect(x, y, w, h, r); return p; }

// ---- rubber-hose arm + glove hand ------------------------------------------------
function hose(ctx, a, b, bend, w, col, dark) {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1];
  const cx = mx - dy * bend * 0.4, cy = my + dx * bend * 0.4;
  const p = new Path2D(); p.moveTo(a[0], a[1]); p.quadraticCurveTo(cx, cy, b[0], b[1]);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = INK; ctx.lineWidth = w + 11; ctx.stroke(p);
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke(p);
  ctx.strokeStyle = dark; ctx.lineWidth = w * 0.32; ctx.globalAlpha = 0.55;
  const q = new Path2D(); q.moveTo(a[0] + 3, a[1] + 4); q.quadraticCurveTo(cx + 3, cy + 5, b[0] + 3, b[1] + 4); ctx.stroke(q); ctx.globalAlpha = 1;
  return Math.atan2(b[1] - cy, b[0] - cx);
}
function hand(ctx, x, y, ang, pose, sc = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(sc, sc);
  const W = '#FFFFFF', S = '#D9D4EA';
  const finger = (fx, fy, fa, l = 15) => { const p = ell(fx, fy, l, 7.5, fa); fillInk(ctx, p, W, 4.5); };
  if (pose === 'open') {
    for (const a of [-0.75, -0.28, 0.2, 0.68]) finger(Math.cos(a) * 20 + 10, Math.sin(a) * 20, a, 14);
    fillInk(ctx, ell(0, 0, 19, 17), W, 5); finger(2, 17, 1.7, 12);
  } else if (pose === 'fist') {
    fillInk(ctx, ell(4, 0, 21, 19), W, 5);
    ctx.strokeStyle = INK; ctx.lineWidth = 3.5; ctx.beginPath(); for (const k of [-8, 0, 8]) { ctx.moveTo(12, k); ctx.lineTo(23, k); } ctx.stroke();
  } else if (pose === 'point') {
    fillInk(ctx, ell(2, 0, 19, 17), W, 5); finger(26, -3, 0, 18);
  } else if (pose === 'flat') {
    fillInk(ctx, rrect(-4, -17, 46, 34, 14), W, 5);
    ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); for (const k of [-6, 3, 11]) { ctx.moveTo(26, k); ctx.lineTo(41, k); } ctx.stroke();
  } else if (pose === 'claw') {
    for (const a of [-0.8, -0.3, 0.2, 0.7]) finger(Math.cos(a) * 22 + 10, Math.sin(a) * 22, a, 12);
    fillInk(ctx, ell(0, 0, 17, 16), W, 5);
  }
  ctx.restore();
}

// ---- face parts ------------------------------------------------------------------
// lid: 0 open … 1 shut. tilt: >0 outer-up/inner-low (angry), <0 sad droop.
function eye(ctx, x, y, rw, rh, o = {}) {
  const { lx = 0, ly = 0, lid = 0, blink = 0, tilt = 0, pr = 0.42, lidCol = '#ff9eb8', iris = '#2b1840', glint = true, lowLid = 0, side = 1 } = o;
  ctx.save(); ctx.translate(x, y);
  const sc = ell(0, 0, rw, rh);
  ctx.fillStyle = '#fff'; ctx.fill(sc);
  ctx.save(); ctx.clip(sc);
  const px = lx * rw * 0.45, py = ly * rh * 0.45, pRad = Math.min(rw, rh) * pr * (o.pupilScale || 1) * 1.15;
  ctx.fillStyle = iris; ctx.beginPath(); ctx.ellipse(px, py, pRad, pRad * 1.12, 0, 0, TAU); ctx.fill();
  if (o.irisRing) { ctx.strokeStyle = o.irisRing; ctx.lineWidth = pRad * 0.28; ctx.beginPath(); ctx.arc(px, py, pRad * 0.72, 0, TAU); ctx.stroke(); }
  if (glint) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(px - pRad * 0.32, py - pRad * 0.38, pRad * 0.34, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(px + pRad * 0.38, py + pRad * 0.4, pRad * 0.16, 0, TAU); ctx.fill(); }
  if (o.reflect) { ctx.fillStyle = o.reflect; ctx.fillRect(px - pRad * 0.5, py - pRad * 0.5, pRad, pRad * 0.8); }
  // eyelids
  const cover = clamp(Math.max(lid, blink));
  const yTop = -rh + cover * rh * 2 + Math.max(tilt, 0) * rh * 0.5 * (1 - blink);
  const tk = tilt > 0 ? tilt : tilt * 0.3, tl = -tk * rh * 0.75 * (1 - blink), tr = tk * rh * 0.75 * (1 - blink); // inner side lower for tilt>0
  const iL = side > 0 ? tl : tr, iR = side > 0 ? tr : tl; // side: +1 left eye(inner is right) handled by caller via tilt sign
  if (cover > 0.001 || Math.abs(tilt) > 0.001) {
    ctx.fillStyle = lidCol; ctx.beginPath(); ctx.moveTo(-rw - 6, -rh - 8); ctx.lineTo(rw + 6, -rh - 8); ctx.lineTo(rw + 6, yTop + tr); ctx.lineTo(-rw - 6, yTop + tl); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 5.5; ctx.beginPath(); ctx.moveTo(-rw - 6, yTop + tl); ctx.lineTo(rw + 6, yTop + tr); ctx.stroke();
  }
  if (lowLid > 0) { ctx.fillStyle = lidCol; ctx.fillRect(-rw - 6, rh - lowLid * rh * 2, rw * 2 + 12, rh * 2); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-rw - 6, rh - lowLid * rh * 2); ctx.lineTo(rw + 6, rh - lowLid * rh * 2); ctx.stroke(); }
  ctx.restore();
  ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke(sc);
  ctx.restore();
}
function brow(ctx, x, y, w, o = {}) { // y raise (px, negative=up), ang rad (positive = outer end up → "sad/worried" depends on side)
  const { ang = 0, arch = 8, th = 10, col = INK } = o;
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  ctx.strokeStyle = col; ctx.lineWidth = th; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.quadraticCurveTo(0, -arch * 2, w / 2, 0); ctx.stroke(); ctx.restore();
}
// general mouth: w width, open 0..1 (height h), curve -1 frown … +1 smile
function mouth(ctx, x, y, w, o = {}) {
  const { open = 0, curve = 0, h = 46, teeth = false, tongue = true, th = 6, wob = 0, tt = 0 } = o;
  ctx.save(); ctx.translate(x, y); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const cy = -curve * w * 0.16;
  if (open < 0.03) {
    ctx.strokeStyle = INK; ctx.lineWidth = th + 1.5; ctx.beginPath();
    if (wob) { for (let i = 0; i <= 12; i++) { const u = i / 12; const px = (u - 0.5) * w, py = Math.sin(u * TAU * 2 + tt * 18) * wob; i ? ctx.lineTo(px, py + (1 - Math.pow(2 * u - 1, 2)) * cy) : ctx.moveTo(px, py + cy * 0); } }
    else { ctx.moveTo(-w / 2, -cy * 0.0); ctx.quadraticCurveTo(0, cy * 2 - 0, w / 2, 0); }
    ctx.stroke(); ctx.restore(); return;
  }
  const hh = open * h;
  const p = new Path2D(); p.moveTo(-w / 2, 0); p.quadraticCurveTo(0, cy * 2 - hh * 0.15, w / 2, 0); p.bezierCurveTo(w * 0.42, hh * 1.25, -w * 0.42, hh * 1.25, -w / 2, 0); p.closePath();
  ctx.fillStyle = '#5b1330'; ctx.fill(p);
  ctx.save(); ctx.clip(p);
  if (tongue) { ctx.fillStyle = '#ff6f8f'; ctx.beginPath(); ctx.ellipse(0, hh * 1.0, w * 0.32, hh * 0.5, 0, 0, TAU); ctx.fill(); }
  if (teeth) { ctx.fillStyle = '#fff'; ctx.fillRect(-w / 2, -6 + cy * 0.0, w, Math.min(hh * 0.38, 20) + 6); ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.beginPath(); for (let i = 1; i < 4; i++) { ctx.moveTo(-w / 2 + w * i / 4, -4); ctx.lineTo(-w / 2 + w * i / 4, Math.min(hh * 0.38, 20) + 2); } ctx.stroke(); }
  ctx.restore();
  ctx.strokeStyle = INK; ctx.lineWidth = th + 1; ctx.stroke(p); ctx.restore();
}
function sweat(ctx, x, y, s = 1, a = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = a;
  const p = new Path2D(); p.moveTo(0, -22); p.bezierCurveTo(16, 0, 16, 16, 0, 16); p.bezierCurveTo(-16, 16, -16, 0, 0, -22);
  fillInk(ctx, p, '#9fe3ff', 4.5); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(-5, 3, 3, 5, 0.3, 0, TAU); ctx.fill(); ctx.restore();
}
function shadow(ctx, x, y, w, a = 0.35) { ctx.save(); ctx.fillStyle = `rgba(10,5,30,${a})`; ctx.beginPath(); ctx.ellipse(x, y, w, w * 0.16, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.restore(); }
function shoe(ctx, x, y, dir, col = '#fff', sole = '#ffd24a') { // sneaker, dir = ±1 toe direction
  ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
  const p = new Path2D(); p.moveTo(-14, -16); p.quadraticCurveTo(-18, 6, -10, 8); p.lineTo(30, 8); p.quadraticCurveTo(40, 6, 34, -6); p.quadraticCurveTo(22, -10, 12, -18); p.closePath();
  fillInk(ctx, p, col, 5.5); ctx.fillStyle = sole; ctx.fillRect(-12, 3, 44, 6); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.strokeRect(-12, 3, 44, 6);
  ctx.restore();
}
function leg(ctx, hx, hy, fx, fy, w, col, shoeDir, shoeCol, sole) {
  const p = new Path2D(); p.moveTo(hx, hy); p.lineTo(fx, fy - 10);
  ctx.lineCap = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = w + 11; ctx.stroke(p); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke(p);
  shoe(ctx, fx, fy, shoeDir, shoeCol, sole);
}

// ---- text bubbles -----------------------------------------------------------------
function burst(ctx, cx, cy, rx, ry, spikes, jitter = 0, rot = 0) {
  const p = new Path2D();
  for (let i = 0; i < spikes * 2; i++) { const a = rot + i / (spikes * 2) * TAU, r = i % 2 ? 0.8 : 1.0, j = 1 + Math.sin(i * 7.3 + jitter) * 0.04; const x = cx + Math.cos(a) * rx * r * j, y = cy + Math.sin(a) * ry * r * j; i ? p.lineTo(x, y) : p.moveTo(x, y); }
  p.closePath(); return p;
}
function text(ctx, str, x, y, size, fill, o = {}) {
  ctx.save(); ctx.font = `700 ${size}px Fredoka`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  if (o.stroke !== 0) { ctx.strokeStyle = o.strokeCol || INK; ctx.lineWidth = o.stroke || size * 0.18; ctx.strokeText(str, x, y); }
  ctx.fillStyle = fill; ctx.fillText(str, x, y); ctx.restore();
}

module.exports = { TAU, INK, clamp, lerp, ease, kf, pulse, fillInk, cel, ell, rrect, hose, hand, eye, brow, mouth, sweat, shadow, shoe, leg, burst, text };
