// How It's Run character rig (extended from tests/coffee_scene/rig.js).
// Adds: constant on-screen outline width (LINE), per-eye lids / squint / asymmetric brows + expression presets (EXPR, expr, exprMix),
// a front-view head (headFront) and a front-view bust for close-ups (bust).
// Local space: feet on y = 0, up is -y, the figure faces +x (flip with facing = -1). Height ≈ 600 units at s = 1.
// Jointed arms and legs (2-bone IK), torso with lean, big head with eyes, lids, brows, mouth shapes, hands with fingers.
const K = require('../tests/mcd_collage/kit');
const { C, clamp, lerp, rr } = K;
const INK = '#171717';

function shade(hex, k) { // k < 0 darker, k > 0 lighter
  const p = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
  return '#' + p.map(v => Math.round(clamp(k < 0 ? v * (1 + k) : v + (255 - v) * k, 0, 255)).toString(16).padStart(2, '0')).join('');
}
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const rot = (p, a) => [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a)];
const mix = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];

// ---------- constant on-screen outline ----------
// Outline widths are given in local units (5 = nominal). px() converts them so the stroke has the same device width at any zoom
// (LINE.px at nominal); very small figures (scale < 0.6) thin out a little so wide shots don't turn into ink blobs.
// LINE.dev = device scale of the target canvas (0.5 for half-res passes).
const LINE = { px: 4.2, dev: 1 };
function px(ctx, w = 5) {
  const m = ctx.getTransform(), scDev = Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)) || 1, scW = scDev / LINE.dev;
  return (w / 5) * LINE.px * clamp(scW / 0.6, 0.55, 1) * LINE.dev / scDev;
}

// 2-bone IK: joint between a and b; pick = function(j1, j2) -> chosen joint
function ik(a, b, L1, L2, pick) {
  const dx = b[0] - a[0], dy = b[1] - a[1]; let d = Math.hypot(dx, dy);
  d = clamp(d, Math.abs(L1 - L2) + 0.01, L1 + L2 - 0.01);
  const base = Math.atan2(dy, dx), off = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  const j1 = [a[0] + Math.cos(base + off) * L1, a[1] + Math.sin(base + off) * L1], j2 = [a[0] + Math.cos(base - off) * L1, a[1] + Math.sin(base - off) * L1];
  const j = pick(j1, j2), r = Math.hypot(b[0] - j[0], b[1] - j[1]), e = Math.atan2(b[1] - j[1], b[0] - j[0]);
  return [j, [j[0] + Math.cos(e) * Math.min(r, L2), j[1] + Math.sin(e) * Math.min(r, L2)]];
}

// outlined tube through points (limbs): ink stroke under a colour stroke, round joints
function tube(ctx, pts, w, col, lw = 5) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(...pts[0]); for (let i = 1; i < pts.length; i++) ctx.lineTo(...pts[i]);
  ctx.strokeStyle = INK; ctx.lineWidth = w + px(ctx, lw) * 2; ctx.stroke(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke();
}
function fillStroke(ctx, col, lw = 5) { ctx.fillStyle = col; ctx.fill(); if (lw) { ctx.lineJoin = 'round'; ctx.lineWidth = px(ctx, lw); ctx.strokeStyle = INK; ctx.stroke(); } }
function ell(ctx, x, y, rx, ry, r = 0) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), r, 0, Math.PI * 2); }

// ---------- hands ----------
// drawn at the wrist, rotated along the forearm (a = forearm angle). grip: open | relax | fist | point | hold | pinch | wave
function hand(ctx, w, a, skin, grip = 'relax', o = {}) {
  ctx.save(); ctx.translate(w[0], w[1]); ctx.rotate(a); const sc = o.size || 1; ctx.scale(sc, sc * (o.mirror ? -1 : 1));
  const sk = skin, dk = shade(skin, -0.18), lw = 4.5;
  const finger = (x0, y0, ang, len, wd = 11) => { const x1 = x0 + Math.cos(ang) * len, y1 = y0 + Math.sin(ang) * len; tube(ctx, [[x0, y0], [x1, y1]], wd, sk, lw); };
  if (o.under) o.under(ctx); // the held object, under the fingers
  if (grip === 'fist' || grip === 'hold' || grip === 'pinch' || grip === 'point') {
    if (grip === 'point') finger(14, -4, -0.1, 34, 11);
    ell(ctx, 12, 0, 21, 19); fillStroke(ctx, sk, lw);
    if (grip === 'hold') { // fingers wrapped around a cup: four little bands in front
      for (let i = 0; i < 3; i++) { ell(ctx, 26 + i * 2, -12 + i * 12, 9, 6.5, 0.2); fillStroke(ctx, sk, 3.5); }
    } else { ctx.strokeStyle = dk; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(24, -8); ctx.quadraticCurveTo(30, 0, 24, 9); ctx.stroke(); }
    // thumb over the top
    tube(ctx, [[4, -14], [grip === 'pinch' ? 26 : 20, grip === 'pinch' ? -18 : -16]], 11, sk, lw);
  } else {
    const spread = grip === 'open' || grip === 'wave' ? 0.22 : 0.1, len = grip === 'relax' ? 24 : 30;
    for (let i = 0; i < 4; i++) finger(20, -10 + i * 7, (i - 1.5) * spread + (grip === 'relax' ? 0.35 : 0), len - Math.abs(i - 1.2) * 3, 10.5);
    ell(ctx, 10, 0, 20, 17); fillStroke(ctx, sk, lw);
    ell(ctx, 13, 0, 15, 12); ctx.fillStyle = sk; ctx.fill(); // hide the finger roots
    tube(ctx, [[6, -12], [18, -26]], 11, sk, lw); // thumb
  }
  if (o.over) o.over(ctx);
  ctx.restore();
}

// ---------- head / face ----------
// f: { look:[x,y] -1..1, blink 0..1, happy 0..1 (eye arcs), brow -1..1 (raise), browAng, mouth: smile|grin|talk|o|flat|sip, talk 0..1, blush }
function head(ctx, cx, cy, R, L, f = {}) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(f.tilt || 0);
  const sk = L.skin, hair = L.hair;
  // hair behind (bun / long)
  if (L.hairStyle === 'bun') { ell(ctx, -R * 0.55, -R * 0.78, R * 0.42, R * 0.4); fillStroke(ctx, hair); ell(ctx, -R * 0.3, -R * 0.55, R * 0.16, R * 0.08, -0.6); fillStroke(ctx, C.red, 4); }
  if (L.hairStyle === 'long') { ctx.beginPath(); ctx.moveTo(-R * 1.0, -R * 0.2); ctx.quadraticCurveTo(-R * 1.25, R * 0.9, -R * 0.55, R * 1.15); ctx.lineTo(R * 0.2, R * 0.6); ctx.lineTo(R * 0.1, -R * 0.6); ctx.closePath(); fillStroke(ctx, hair); }
  // ear (behind face, near the back of the head)
  ell(ctx, -R * 0.12, R * 0.08, R * 0.2, R * 0.25); fillStroke(ctx, sk);
  // skull + cheek/jaw toward the facing side
  ctx.beginPath(); ctx.moveTo(-R * 0.9, -R * 0.3);
  ctx.bezierCurveTo(-R * 0.95, -R * 1.25, R * 0.95, -R * 1.25, R * 0.98, -R * 0.15);
  ctx.bezierCurveTo(R * 1.02, R * 0.3, R * 0.85, R * 0.88, R * 0.25, R * 0.92);
  ctx.bezierCurveTo(-R * 0.3, R * 0.95, -R * 0.82, R * 0.6, -R * 0.9, -R * 0.3); ctx.closePath();
  fillStroke(ctx, sk);
  // soft shade on the back side
  ctx.save(); ctx.clip(); ell(ctx, -R * 1.05, R * 0.1, R * 0.5, R * 1.2); ctx.fillStyle = shade(sk, -0.12); ctx.fill(); ctx.restore();
  ell(ctx, -R * 0.12, R * 0.08, R * 0.11, R * 0.15); ctx.fillStyle = shade(sk, -0.2); ctx.fill();
  // nose
  ctx.beginPath(); ctx.moveTo(R * 0.92, -R * 0.02); ctx.quadraticCurveTo(R * 1.22, R * 0.2, R * 0.93, R * 0.3); ctx.fillStyle = sk; ctx.fill();
  ctx.lineWidth = px(ctx, 4.5); ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.stroke();
  // cheeks
  if ((f.blush ?? 0.5) > 0) { ell(ctx, R * 0.42, R * 0.4, R * 0.17, R * 0.1); ctx.fillStyle = `rgba(230,57,70,${0.28 * (f.blush ?? 0.5) * 2})`; ctx.fill(); }
  // eyes, brows, mouth (shared feature system; the far eye is narrower)
  const eyes = [[R * 0.3, -R * 0.12, 1], [R * 0.74, -R * 0.12, 0.78]];
  features(ctx, R, L, f, eyes, [R * 0.55, R * 0.5], false);
  // hair on top
  ctx.fillStyle = hair;
  if (L.hairStyle === 'curly') {
    const blobs = [[-0.75, -0.55, 0.32], [-0.5, -0.85, 0.34], [-0.1, -1.0, 0.36], [0.3, -0.98, 0.33], [0.65, -0.78, 0.28], [-0.85, -0.15, 0.25], [0.85, -0.5, 0.2]];
    ctx.beginPath(); for (const [x, y, r] of blobs) { ctx.moveTo(x * R + r * R, y * R); ctx.arc(x * R, y * R, r * R, 0, 7); }
    ctx.lineWidth = px(ctx, 5) * 2; ctx.strokeStyle = INK; ctx.stroke(); ctx.fill();
    ctx.beginPath(); ctx.arc(-0.05 * R, -0.62 * R, 0.62 * R, 0, 7); ctx.fill();
    ctx.strokeStyle = shade(hair, 0.25); ctx.lineWidth = 3.5;
    for (const [x, y, r] of blobs.slice(0, 5)) { ctx.beginPath(); ctx.arc(x * R + 4, y * R + 2, r * R * 0.5, 3.6, 5.2); ctx.stroke(); }
  } else if (L.hairStyle === 'bun' || L.hairStyle === 'long') {
    ctx.beginPath(); ctx.moveTo(-R * 0.95, R * 0.1); ctx.bezierCurveTo(-R * 1.05, -R * 1.25, R * 0.9, -R * 1.3, R * 0.95, -R * 0.4);
    ctx.quadraticCurveTo(R * 0.5, -R * 0.75, R * 0.05, -R * 0.55); ctx.quadraticCurveTo(-R * 0.4, -R * 0.4, -R * 0.55, R * 0.05); ctx.closePath(); fillStroke(ctx, hair);
    ctx.strokeStyle = shade(hair, 0.25); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-R * 0.5, -R * 0.75); ctx.quadraticCurveTo(R * 0.1, -R * 1.0, R * 0.6, -R * 0.8); ctx.stroke();
  } else if (L.hairStyle === 'short') {
    ctx.beginPath(); ctx.moveTo(-R * 0.92, -R * 0.05); ctx.bezierCurveTo(-R * 1.0, -R * 1.2, R * 0.9, -R * 1.25, R * 0.92, -R * 0.45);
    ctx.quadraticCurveTo(R * 0.4, -R * 0.62, -R * 0.2, -R * 0.5); ctx.quadraticCurveTo(-R * 0.5, -R * 0.3, -R * 0.6, R * 0.0); ctx.closePath(); fillStroke(ctx, hair);
  }
  if (L.beard) { ctx.beginPath(); ctx.moveTo(-R * 0.4, R * 0.2); ctx.quadraticCurveTo(-R * 0.2, R * 1.1, R * 0.45, R * 0.95); ctx.quadraticCurveTo(R * 0.9, R * 0.75, R * 0.9, R * 0.35);
    ctx.quadraticCurveTo(R * 0.55, R * 0.7, R * 0.2, R * 0.45); ctx.closePath(); fillStroke(ctx, L.hair); }
  if (L.glasses) { ctx.lineWidth = px(ctx, 5); ctx.strokeStyle = INK; for (const [ex, ey, k] of eyes) { ell(ctx, ex, ey, R * 0.21 * k, R * 0.2); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(eyes[0][0] + R * 0.21, eyes[0][1]); ctx.lineTo(eyes[1][0] - R * 0.16, eyes[1][1]); ctx.moveTo(eyes[0][0] - R * 0.21, eyes[0][1]); ctx.lineTo(-R * 0.15, -R * 0.05); ctx.stroke(); }
  ctx.restore();
}


// ---------- expressions ----------
// per-eye arrays are [eye nearer the viewer's left, other eye]. lid = upper lid closure 0..1, low = squint from below 0..1,
// brow = raise -1..1, bang = brow angle (+ = inner end down: suspicious / angry, - = inner end up: worried), pupil = size.
const EXPR = {
  neutral: { mouth: 'smile0' },
  smile: { mouth: 'smile', low: [0.25, 0.25], brow: [0.15, 0.15] },
  happy: { mouth: 'smile', happy: 1, brow: [0.3, 0.3] },
  grin: { mouth: 'grin', happy: 1, brow: [0.45, 0.45] },
  surprised: { mouth: 'o', lid: [0, 0], wide: 1, pupil: 0.75, brow: [0.95, 0.95] },
  shocked: { mouth: 'wow', lid: [0, 0], wide: 1, pupil: 0.55, brow: [1.1, 1.1], bang: [-0.3, -0.3] },
  skeptical: { mouth: 'smirk', lid: [0.5, 0.14], low: [0.3, 0], brow: [-0.4, 0.9], bang: [0.4, -0.15] },
  squint: { mouth: 'flat', lid: [0.5, 0.5], low: [0.4, 0.4], brow: [-0.35, -0.35], bang: [0.45, 0.45] },
  worried: { mouth: 'frown', lid: [0.1, 0.1], brow: [0.55, 0.55], bang: [-0.6, -0.6] },
  tired: { mouth: 'flat', lid: [0.58, 0.58], brow: [-0.1, -0.1] },
  smug: { mouth: 'smirk', lid: [0.42, 0.42], low: [0.2, 0.2], brow: [0.25, -0.1], bang: [0, 0.2] },
  thinking: { mouth: 'flat', lid: [0.25, 0.25], brow: [0.65, -0.2], bang: [-0.2, 0.3], look: [0.5, -0.8] },
};
const expr = (name, extra = {}) => ({ ...EXPR[name], ...extra });
// blend two expressions (numbers and per-eye arrays are interpolated, the mouth switches halfway)
function exprMix(a, b, u) {
  const A = typeof a === 'string' ? EXPR[a] : a, B = typeof b === 'string' ? EXPR[b] : b, o = {}, D = { lid: [0.12, 0.12], low: [0, 0], brow: [0, 0], bang: [0, 0], look: [0.4, 0], pupil: 1, happy: 0, wide: 0, talk: 0, blush: 0.5 };
  for (const k of new Set([...Object.keys(D), ...Object.keys(A), ...Object.keys(B)])) {
    const x = A[k] ?? D[k], y = B[k] ?? D[k];
    o[k] = Array.isArray(x) ? x.map((v, i) => lerp(v, y[i], u)) : typeof x === 'number' ? lerp(x, y, u) : (u < 0.5 ? x : y);
  }
  return o;
}
// normalise old single-value fields (brow, browAng, blink) into per-eye arrays
function faceParams(f) {
  const two = (v, d) => Array.isArray(v) ? v : [v ?? d, v ?? d];
  const lid = two(f.lid, 0.12).map(v => Math.max(v, clamp(f.blink || 0)));
  return { lid, low: two(f.low, 0), brow: two(f.brow, 0), bang: two(f.bang ?? f.browAng, 0), look: f.look || [0.4, 0], pupil: f.pupil ?? 1, happy: clamp(f.happy || 0), wide: f.wide || 0 };
}
function eye(ctx, ex, ey, rx, ry, lid, low, F, L, sk, outer = 1) {
  if (F.happy > 0.5) { ctx.beginPath(); ctx.arc(ex, ey + ry * 0.35, rx * 1.05, Math.PI * 1.1, Math.PI * 1.9); ctx.lineWidth = Math.max(px(ctx, 5.5), ry * 0.28); ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.stroke(); return; }
  ell(ctx, ex, ey, rx, ry); ctx.fillStyle = '#FFFFFF'; ctx.fill();
  ctx.save(); ell(ctx, ex, ey, rx, ry); ctx.clip();
  const lk = F.look, pr = F.pupil, ppx = ex + lk[0] * rx * 0.45, ppy = ey + lk[1] * ry * 0.42 + ry * 0.06;
  ell(ctx, ppx, ppy, rx * 0.68 * pr, ry * 0.62 * pr); ctx.fillStyle = L.iris || '#5A3A22'; ctx.fill();
  ell(ctx, ppx, ppy, rx * 0.38 * pr, ry * 0.36 * pr); ctx.fillStyle = INK; ctx.fill();
  ell(ctx, ppx + rx * 0.22, ppy - ry * 0.26, rx * 0.2, ry * 0.15); ctx.fillStyle = '#FFFFFF'; ctx.fill();
  const ly = ey - ry + 2 * ry * lid, by = ey + ry - 1.4 * ry * low;
  ctx.fillStyle = shade(sk, -0.06);
  ctx.beginPath(); ctx.moveTo(ex - rx * 1.4, ey - ry * 1.4); ctx.lineTo(ex + rx * 1.4, ey - ry * 1.4); ctx.lineTo(ex + rx * 1.4, ly); ctx.quadraticCurveTo(ex, ly + ry * 0.22, ex - rx * 1.4, ly); ctx.fill();
  ctx.fillStyle = sk; ctx.beginPath(); ctx.moveTo(ex - rx * 1.4, ey + ry * 1.4); ctx.lineTo(ex + rx * 1.4, ey + ry * 1.4); ctx.lineTo(ex + rx * 1.4, by); ctx.quadraticCurveTo(ex, by - ry * 0.25, ex - rx * 1.4, by); ctx.fill();
  ctx.restore();
  // eye outline only where the eye is open (no ghost oval above a lowered lid)
  ctx.save(); ctx.beginPath(); ctx.rect(ex - rx * 1.5, ly, rx * 3, Math.max(0, by - ly) + 1); ctx.clip(); ell(ctx, ex, ey, rx, ry); ctx.lineWidth = px(ctx, 3.5); ctx.strokeStyle = INK; ctx.stroke(); ctx.restore();
  ctx.lineCap = 'round'; ctx.strokeStyle = INK;
  if (lid > 0.06) { ctx.lineWidth = px(ctx, 6.5); ctx.beginPath(); ctx.moveTo(ex - rx * 1.05, ly + ry * 0.02); ctx.quadraticCurveTo(ex, ly + ry * 0.22, ex + rx * 1.05, ly + ry * 0.02); ctx.stroke(); }
  if (low > 0.1) { ctx.lineWidth = px(ctx, 3.5); ctx.beginPath(); ctx.moveTo(ex - rx * 0.9, by); ctx.quadraticCurveTo(ex, by - ry * 0.22, ex + rx * 0.9, by); ctx.stroke(); }
  if (L.lashes) { // two lash flicks at the outer corner, riding on the upper lid
    const lyy = Math.max(ly, ey - ry) + ry * 0.05; ctx.lineWidth = Math.max(px(ctx, 3.5), rx * 0.16); ctx.beginPath();
    ctx.moveTo(ex + outer * rx * 0.75, lyy + ry * 0.05); ctx.quadraticCurveTo(ex + outer * rx * 1.15, lyy - ry * 0.05, ex + outer * rx * 1.35, lyy - ry * 0.32);
    ctx.moveTo(ex + outer * rx * 0.95, lyy + ry * 0.12); ctx.quadraticCurveTo(ex + outer * rx * 1.3, lyy + ry * 0.1, ex + outer * rx * 1.5, lyy - ry * 0.08); ctx.stroke();
  }
}
function mouthShape(ctx, mx, my, R, m, tk, wk = 1, lips = null) {
  ctx.lineWidth = Math.max(px(ctx, 5), R * 0.055); ctx.strokeStyle = lips || INK; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const w = R * 0.22 * wk;
  if ((m === 'smile' || m === 'smile0') && tk < 0.05) { const d = m === 'smile0' ? 0.07 : 0.16; ctx.beginPath(); ctx.moveTo(mx - w, my - R * 0.06); ctx.quadraticCurveTo(mx, my + R * d, mx + w, my - R * 0.08); ctx.stroke(); return; }
  if (m === 'flat') { ctx.beginPath(); ctx.moveTo(mx - w * 0.7, my); ctx.lineTo(mx + w * 0.7, my - R * 0.02); ctx.stroke(); return; }
  if (m === 'smirk') { ctx.beginPath(); ctx.moveTo(mx - w * 0.8, my + R * 0.02); ctx.quadraticCurveTo(mx + w * 0.2, my + R * 0.07, mx + w, my - R * 0.1); ctx.stroke(); return; }
  if (m === 'frown') { ctx.beginPath(); ctx.moveTo(mx - w * 0.75, my + R * 0.06); ctx.quadraticCurveTo(mx, my - R * 0.08, mx + w * 0.75, my + R * 0.06); ctx.stroke(); return; }
  if (m === 'sip') { ell(ctx, mx + R * 0.05, my, R * 0.07, R * 0.06); fillStroke(ctx, '#6B2A2A', 4); return; }
  const open = m === 'grin' ? 0.55 + tk * 0.2 : m === 'o' ? 0.6 : m === 'wow' ? 1.0 : 0.15 + tk * 0.55, wdt = m === 'o' ? 0.13 * wk : m === 'wow' ? 0.17 * wk : 0.24 * wk;
  ctx.beginPath(); ctx.moveTo(mx - R * wdt, my - R * 0.06);
  ctx.quadraticCurveTo(mx, my - R * (m === 'grin' ? 0.0 : 0.08), mx + R * wdt, my - R * 0.08);
  ctx.quadraticCurveTo(mx + R * wdt * 0.8, my + R * 0.32 * open + R * 0.04, mx, my + R * 0.34 * open + R * 0.04);
  ctx.quadraticCurveTo(mx - R * wdt * 0.8, my + R * 0.3 * open, mx - R * wdt, my - R * 0.06); ctx.closePath();
  ctx.fillStyle = '#6B2A2A'; ctx.fill();
  ctx.save(); ctx.clip(); ell(ctx, mx, my + R * 0.36 * open, R * 0.16 * wk, R * 0.1); ctx.fillStyle = '#E86A6A'; ctx.fill();
  if (m === 'grin') { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(mx - R * 0.3, my - R * 0.12, R * 0.6, R * 0.1); } ctx.restore();
  ctx.lineWidth = px(ctx, 4.5); ctx.stroke();
}
// eyes [[x, y, k]...] left to right, mouth position [x, y]
function features(ctx, R, L, f, eyes, mp, front) {
  const F = faceParams(f), sk = L.skin;
  eyes.forEach(([ex, ey, k], i) => eye(ctx, ex, ey, R * (front ? 0.16 : 0.15) * k, R * 0.2 * (F.wide ? 1.12 : 1), F.lid[i], F.low[i], F, L, sk, front ? (i === 0 ? -1 : 1) : 1));
  ctx.strokeStyle = L.brow || shade(L.hair, -0.2); ctx.lineCap = 'round'; ctx.lineWidth = R * 0.09;
  eyes.forEach(([ex, ey, k], i) => { const inner = i === 0 ? 1 : -1, hw = R * 0.15 * k, by = ey - R * 0.37 - F.brow[i] * R * 0.12, ba = F.bang[i];
    const xi = ex + inner * hw, xo = ex - inner * hw, yi = by + ba * R * 0.09, yo = by - ba * R * 0.03;
    ctx.beginPath(); ctx.moveTo(xo, yo); ctx.quadraticCurveTo(ex, Math.min(yi, yo) - R * 0.06, xi, yi); ctx.stroke(); });
  mouthShape(ctx, mp[0], mp[1], R, f.mouth || 'smile', clamp(f.talk || 0), front ? 1.1 : 1, L.lips);
}

// ---------- front-view head (close-ups) ----------
// f: expression fields + turn (-1..1, features slide sideways), tilt, shadeSide (+1 = right side in shadow), shade (0..1)
function headFront(ctx, cx, cy, R, L, f = {}) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(f.tilt || 0);
  const sk = L.skin, hair = L.hair, tx = (f.turn || 0) * R * 0.16;
  if (L.hairStyle === 'bun') { ell(ctx, 0, -R * 1.08, R * 0.36, R * 0.3); fillStroke(ctx, hair); }
  if (L.hairStyle === 'long') { ctx.beginPath(); ctx.moveTo(-R * 1.02, -R * 0.35); ctx.bezierCurveTo(-R * 1.22, R * 0.45, -R * 1.18, R * 1.1, -R * 0.82, R * 1.42);
    ctx.quadraticCurveTo(-R * 0.62, R * 1.2, -R * 0.5, R * 0.7); ctx.lineTo(R * 0.5, R * 0.7); ctx.quadraticCurveTo(R * 0.62, R * 1.2, R * 0.82, R * 1.42);
    ctx.bezierCurveTo(R * 1.18, R * 1.1, R * 1.22, R * 0.45, R * 1.02, -R * 0.35); ctx.closePath(); fillStroke(ctx, hair);
    ctx.strokeStyle = shade(hair, 0.18); ctx.lineWidth = R * 0.035; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * R * 0.98, R * 0.2); ctx.quadraticCurveTo(sx * R * 1.08, R * 0.8, sx * R * 0.85, R * 1.25); ctx.stroke(); } }
  for (const sx of [-1, 1]) { ell(ctx, sx * R * 0.93 + tx * 0.3, R * 0.1, R * 0.16, R * 0.23); fillStroke(ctx, sk); ell(ctx, sx * R * 0.95 + tx * 0.3, R * 0.1, R * 0.07, R * 0.12); ctx.fillStyle = shade(sk, -0.2); ctx.fill(); }
  const face = () => { ctx.beginPath(); ctx.moveTo(-R * 0.92, -R * 0.1); ctx.bezierCurveTo(-R * 0.96, -R * 1.18, R * 0.96, -R * 1.18, R * 0.92, -R * 0.1);
    ctx.bezierCurveTo(R * 0.9, R * 0.55, R * 0.48, R * 0.98, 0, R * 1.0); ctx.bezierCurveTo(-R * 0.48, R * 0.98, -R * 0.9, R * 0.55, -R * 0.92, -R * 0.1); ctx.closePath(); };
  face(); fillStroke(ctx, sk);
  // soft form shade on the side away from the key light
  const side = f.shadeSide ?? 1, sa = f.shade ?? 0.6;
  ctx.save(); face(); ctx.clip(); const g = ctx.createLinearGradient(side * R * 0.15, 0, side * R * 1.0, 0);
  g.addColorStop(0, 'rgba(70,35,30,0)'); g.addColorStop(1, `rgba(70,35,30,${0.28 * sa})`); ctx.fillStyle = g; ctx.fillRect(-R * 1.2, -R * 1.3, R * 2.4, R * 2.5);
  ell(ctx, 0, R * 1.12, R * 0.62, R * 0.2); ctx.fillStyle = `rgba(70,35,30,${0.12 * sa})`; ctx.fill(); ctx.restore();
  if ((f.blush ?? 0.5) > 0) for (const sx of [-1, 1]) { ell(ctx, tx + sx * R * 0.5, R * 0.36, R * 0.16, R * 0.1); ctx.fillStyle = `rgba(230,57,70,${0.28 * (f.blush ?? 0.5) * 2})`; ctx.fill(); }
  // nose
  ctx.beginPath(); ctx.moveTo(tx * 1.3 - R * 0.02, R * 0.04); ctx.quadraticCurveTo(tx * 1.3 + R * 0.12, R * 0.26, tx * 1.3 - R * 0.06, R * 0.3);
  ctx.lineWidth = px(ctx, 4.5); ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.stroke();
  const k0 = 1 - Math.max(0, f.turn || 0) * 0.15, k1 = 1 + Math.min(0, f.turn || 0) * 0.15;
  const eyes = [[tx - R * 0.37, -R * 0.08, k0], [tx + R * 0.37, -R * 0.08, k1]];
  features(ctx, R, L, f, eyes, [tx * 1.1, R * 0.55], true);
  // hair in front
  ctx.fillStyle = hair;
  if (L.hairStyle === 'curly') {
    const blobs = []; for (let i = 0; i <= 8; i++) { const a = Math.PI * (1.02 + i * 0.12); blobs.push([Math.cos(a) * R * 0.88, -R * 0.28 + Math.sin(a) * R * 0.78, R * (0.26 + (i % 2) * 0.05)]); }
    ctx.beginPath(); for (const [x, y, r] of blobs) { ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, 7); }
    ctx.lineWidth = px(ctx, 5) * 2; ctx.strokeStyle = INK; ctx.stroke(); ctx.fill();
    ell(ctx, 0, -R * 0.66, R * 0.86, R * 0.42); ctx.fill();
    ctx.strokeStyle = shade(hair, 0.25); ctx.lineWidth = R * 0.04; for (const [x, y, r] of blobs) { ctx.beginPath(); ctx.arc(x + 3, y + 2, r * 0.5, 3.6, 5.2); ctx.stroke(); }
  } else if (L.hairStyle === 'bun' || L.hairStyle === 'long' || L.hairStyle === 'short') {
    const sh = L.hairStyle === 'short' ? 0.0 : 0.25;
    ctx.beginPath(); ctx.moveTo(-R * 0.98, R * sh); ctx.bezierCurveTo(-R * 1.08, -R * 1.25, R * 1.08, -R * 1.25, R * 0.98, R * sh);
    ctx.quadraticCurveTo(R * 0.85, -R * 0.45, R * 0.15, -R * 0.62); ctx.quadraticCurveTo(-R * 0.55, -R * 0.55, -R * 0.82, -R * 0.15); ctx.quadraticCurveTo(-R * 0.86, R * 0.05, -R * 0.98, R * sh); ctx.closePath(); fillStroke(ctx, hair);
    ctx.strokeStyle = shade(hair, 0.25); ctx.lineWidth = R * 0.05; ctx.beginPath(); ctx.moveTo(-R * 0.5, -R * 0.8); ctx.quadraticCurveTo(0, -R * 1.0, R * 0.55, -R * 0.82); ctx.stroke();
    if (L.hairStyle === 'bun') { ell(ctx, -R * 0.2, -R * 0.92, R * 0.18, R * 0.07, 0.2); fillStroke(ctx, C.red, 4); }
    if (L.hairStyle === 'long') for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * R * 0.96, -R * 0.2); ctx.quadraticCurveTo(sx * R * 1.06, R * 0.45, sx * R * 0.86, R * 0.98);
      ctx.quadraticCurveTo(sx * R * 0.8, R * 0.4, sx * R * 0.7, -R * 0.3); ctx.closePath(); fillStroke(ctx, hair); }
  }
  if (L.glasses) { ctx.lineWidth = px(ctx, 5); ctx.strokeStyle = INK; for (const [ex, ey] of eyes) { ell(ctx, ex, ey, R * 0.24, R * 0.22); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(eyes[0][0] + R * 0.24, eyes[0][1]); ctx.lineTo(eyes[1][0] - R * 0.24, eyes[1][1]); ctx.stroke(); }
  ctx.restore();
}

// ---------- front-view bust (close-ups): neck base at (x, y), shoulders below ----------
// P: { face, hands: [{side: -1|1, hand: [x, y], grip, item, itemOver, size}], lean (rad), headTilt, light: -1|1 (key side) }
// Sloped trapezius, round deltoids, collar, form shading and tapered arms with an elbow bend; arms in front cast a soft shadow on the chest.
function capsule(ctx, a, b, ra, rb) { // tapered segment with round ends
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), n = ang + Math.PI / 2;
  ctx.moveTo(a[0] + Math.cos(n) * ra, a[1] + Math.sin(n) * ra);
  ctx.arc(a[0], a[1], ra, n, n + Math.PI);
  ctx.lineTo(b[0] - Math.cos(n) * rb, b[1] - Math.sin(n) * rb);
  ctx.arc(b[0], b[1], rb, n + Math.PI, n + Math.PI * 2);
  ctx.closePath();
}
function limb(ctx, pts, radii, col, shadeCol) {
  const path = (grow) => { ctx.beginPath(); for (let i = 0; i < pts.length - 1; i++) capsule(ctx, pts[i], pts[i + 1], radii[i] + grow, radii[i + 1] + grow); };
  path(px(ctx, 5)); ctx.fillStyle = INK; ctx.fill();
  path(0); ctx.fillStyle = col; ctx.fill();
  if (shadeCol) { ctx.save(); path(0); ctx.clip(); ctx.strokeStyle = shadeCol; ctx.lineWidth = radii[0] * 0.7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(pts[0][0] + radii[0] * 0.7, pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0] + radii[i] * 0.7, pts[i][1] + radii[i] * 0.3); ctx.stroke(); ctx.restore(); }
}
function bust(ctx, x, y, s, L, P = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(P.lean || 0);
  const top = L.top, topD = shade(top, -0.25), side = P.face?.shadeSide ?? 1;
  const torso = () => { ctx.beginPath(); ctx.moveTo(-34, -16);
    ctx.bezierCurveTo(-72, -6, -112, 6, -140, 28); ctx.bezierCurveTo(-172, 50, -182, 96, -176, 160); ctx.lineTo(-184, 560); ctx.lineTo(184, 560); ctx.lineTo(176, 160);
    ctx.bezierCurveTo(182, 96, 172, 50, 140, 28); ctx.bezierCurveTo(112, 6, 72, -6, 34, -16); ctx.closePath(); };
  ctx.save(); ctx.scale(0.92, 1); // torso a touch narrower than the shoulder line of the old bust
  torso(); fillStroke(ctx, top);
  ctx.save(); torso(); ctx.clip();
  // form shade: the side away from the key, plus the far deltoid
  let g = ctx.createLinearGradient(side * 30, 0, side * 185, 0); g.addColorStop(0, 'rgba(30,10,20,0)'); g.addColorStop(1, 'rgba(30,10,20,0.32)'); ctx.fillStyle = g; ctx.fillRect(-200, -30, 400, 600);
  g = ctx.createLinearGradient(0, -20, 0, 90); g.addColorStop(0, 'rgba(255,255,255,0.16)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(-200, -30, 400, 120); // top light on the shoulders
  // armhole seams (the arms hang inside the sleeves)
  ctx.strokeStyle = topD; ctx.lineWidth = px(ctx, 3.5); ctx.lineCap = 'round';
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * 122, 34); ctx.bezierCurveTo(sx * 104, 120, sx * 112, 240, sx * 124, 560); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sx * 128, 290); ctx.quadraticCurveTo(sx * 148, 300, sx * 168, 292); ctx.stroke(); } // sleeve fold
  if (L.shirt) { ctx.beginPath(); ctx.moveTo(-40, -14); ctx.lineTo(0, 96); ctx.lineTo(40, -14); ctx.closePath(); ctx.fillStyle = L.shirt; ctx.fill(); ctx.lineWidth = px(ctx, 4); ctx.strokeStyle = INK; ctx.stroke();
    ell(ctx, 0, 6, 46, 22); ctx.fillStyle = 'rgba(60,30,20,0.18)'; ctx.fill(); }
  if (L.zip) { ctx.strokeStyle = shade(top, -0.45); ctx.lineWidth = px(ctx, 4.5); ctx.beginPath(); ctx.moveTo(0, 96); ctx.lineTo(0, 570); ctx.stroke();
    rr(ctx, -9, 104, 18, 34, 5); fillStroke(ctx, '#D8D8DC', 3.5);
    ctx.strokeStyle = topD; ctx.lineWidth = px(ctx, 3); for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * 20, 200); ctx.quadraticCurveTo(sx * 70, 214, sx * 98, 196); ctx.stroke(); } } // chest seams
  ctx.restore(); ctx.restore(); ctx.save();
  if (L.apron) { ctx.beginPath(); ctx.moveTo(-82, 90); ctx.lineTo(82, 90); ctx.lineTo(96, 570); ctx.lineTo(-96, 570); ctx.closePath(); fillStroke(ctx, L.apron); ctx.lineWidth = 12; ctx.strokeStyle = L.apron; ctx.beginPath(); ctx.moveTo(-72, 90); ctx.lineTo(-58, -8); ctx.moveTo(72, 90); ctx.lineTo(58, -8); ctx.stroke(); }
  ctx.restore();
  // neck with the jaw shadow, then the stand-up collar around it
  tube(ctx, [[0, 14], [0, -46]], 60, L.skin);
  ctx.save(); ctx.beginPath(); ctx.rect(-40, -60, 80, 80); ctx.clip(); ell(ctx, 0, -46, 36, 26); ctx.fillStyle = 'rgba(60,25,20,0.32)'; ctx.fill(); ctx.restore();
  if (L.zip) for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * 28, -26); ctx.quadraticCurveTo(sx * 40, -34, sx * 56, -30); ctx.quadraticCurveTo(sx * 66, -8, sx * 64, 10); ctx.quadraticCurveTo(sx * 40, 16, sx * 8, 50); ctx.quadraticCurveTo(sx * 22, 0, sx * 28, -26); ctx.closePath(); fillStroke(ctx, sx === side ? topD : shade(top, -0.08)); }
  if (L.collar) { ell(ctx, 0, 0, 70, 20); fillStroke(ctx, L.collar); }
  headFront(ctx, 0, -112, 78, L, { ...(P.face || {}), tilt: P.headTilt || 0 });
  for (const h of P.hands || []) {
    const sh = [h.side * 124, 74];
    // h.elbow pins the elbow (e.g. below the frame for a hand-to-chin close-up); otherwise 2-bone IK
    const [e, w] = h.elbow ? [h.elbow, h.hand] : ik(sh, h.hand, 192, 172, (j1, j2) => h.elbowOut ? (j1[0] * h.side > j2[0] * h.side ? j1 : j2) : (j1[1] > j2[1] ? j1 : j2));
    const a = Math.atan2(w[1] - e[1], w[0] - e[0]), cuff = add(w, [-Math.cos(a) * 14, -Math.sin(a) * 14]);
    // soft shadow of the arm on the chest
    ctx.save(); ctx.translate(14, 16); ctx.beginPath(); capsule(ctx, sh, e, 28, 24); capsule(ctx, e, w, 24, 20); ctx.fillStyle = 'rgba(30,10,20,0.22)'; ctx.fill(); ctx.restore();
    limb(ctx, [sh, e, cuff], [29, 24, 21], top, h.side === side ? 'rgba(30,10,20,0.2)' : null);
    // elbow crease + cuff band
    ctx.strokeStyle = topD; ctx.lineWidth = px(ctx, 3.5); ctx.beginPath(); ctx.arc(e[0], e[1], 15, a - 2.2, a - 1.2); ctx.stroke();
    limb(ctx, [add(cuff, [-Math.cos(a) * 6, -Math.sin(a) * 6]), add(cuff, [Math.cos(a) * 4, Math.sin(a) * 4])], [23, 23], L.cuff || topD);
    if (h.item) { ctx.save(); ctx.translate(w[0] + Math.cos(a) * 22, w[1] + Math.sin(a) * 22); h.item(ctx); ctx.restore(); }
    hand(ctx, add(w, [Math.cos(a) * 2, Math.sin(a) * 2]), a + (h.twist || 0), L.skin, h.grip || 'relax', { over: h.itemOver, mirror: h.side < 0 && h.mirror !== false, size: h.size || 1.25 });
  }
  ctx.restore();
}

// ---------- the whole figure ----------
// P (pose, local units): hip [x,y], lean (rad, + = forward), headTilt, armN/armF: {hand:[x,y], grip, size, item(ctx), itemOver(ctx)},
// legN/legF: {foot:[x,y], sit:bool}, face {...}
function figure(ctx, x, y, s, facing, L, P) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * facing, s);
  const lw = 5;
  // contact shadow
  if (!P.noShadow) { const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 150); g.addColorStop(0, 'rgba(60,35,20,0.32)'); g.addColorStop(1, 'rgba(60,35,20,0)'); ctx.save(); ctx.scale(1, 0.16); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 150, 0, 7); ctx.fill(); ctx.restore(); }
  const hip = P.hip || [0, -256], lean = P.lean || 0, TL = 175;
  const neck = add(hip, rot([0, -TL], lean));
  const shN = add(neck, rot([8, 18], lean)), shF = add(neck, rot([-10, 16], lean));
  const hipN = add(hip, [6, 0]), hipF = add(hip, [-8, 0]);
  const legPts = (hp, lg) => { const [k, a] = ik(hp, add(lg.foot, [0, -24]), 124, 112, (j1, j2) => (j1[0] > j2[0] ? j1 : j2)); return [hp, k, a]; };
  const armPts = (sh, ar) => { const [e, w] = ik(sh, ar.hand, 102, 96, (j1, j2) => ar.elbowUp ? (j1[1] < j2[1] ? j1 : j2) : (j1[1] > j2[1] ? j1 : j2)); return [sh, e, w]; };
  const legN = legPts(hipN, P.legN || { foot: [14, 0] }), legF = legPts(hipF, P.legF || { foot: [-16, 0] });
  const armN = armPts(shN, P.armN || { hand: [18, -60] }), armF = armPts(shF, P.armF || { hand: [-14, -64] });
  const top = L.top, topD = shade(top, -0.22), pants = L.pants, pantsD = shade(pants, -0.25);
  const shoe = (a, col) => { ctx.save(); ctx.translate(a[0], a[1] + 24); ell(ctx, 22, -12, 44, 19); fillStroke(ctx, col, lw); ctx.fillStyle = L.sole || '#3B3B3B'; ctx.fillRect(-22, -6, 88, 6); ell(ctx, 22, -12, 44, 19); ctx.lineWidth = px(ctx, lw); ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); };
  const leg = (pts, far) => { tube(ctx, pts, 46, far ? pantsD : pants, lw); shoe(pts[2], far ? shade(L.shoes, -0.2) : L.shoes); };
  const arm = (pts, ar, far) => {
    const [sh, e, w] = pts, col = far ? topD : top;
    tube(ctx, [sh, e, w], 40, col, lw);
    // cuff
    const a = Math.atan2(w[1] - e[1], w[0] - e[0]), cuff = add(w, [-Math.cos(a) * 12, -Math.sin(a) * 12]);
    tube(ctx, [cuff, add(cuff, [Math.cos(a) * 3, Math.sin(a) * 3])], 44, far ? shade(L.cuff || top, -0.22) : (L.cuff || top), 4);
    if (ar.item) { ctx.save(); ctx.translate(w[0] + Math.cos(a) * 18, w[1] + Math.sin(a) * 18); ar.item(ctx); ctx.restore(); } // held upright
    hand(ctx, add(w, [Math.cos(a) * 4, Math.sin(a) * 4]), a + (ar.twist || 0), far ? shade(L.skin, -0.1) : L.skin, ar.grip || 'relax', { over: ar.itemOver, size: ar.size || 1, mirror: ar.mirror });
  };
  // back to front (farFront: the far arm reaches across the chest, draw it over the torso)
  if (!P.farFront) arm(armF, P.armF || {}, true);
  leg(legF, true);
  // torso
  ctx.save(); ctx.translate(hip[0], hip[1]); ctx.rotate(lean);
  const tb = () => { ctx.beginPath(); ctx.moveTo(-58, 18); ctx.bezierCurveTo(-66, -60, -70, -130, -50, -TL + 4); ctx.quadraticCurveTo(0, -TL - 22, 52, -TL + 2);
    ctx.bezierCurveTo(72, -130, 70, -60, 60, 18); ctx.quadraticCurveTo(0, 30, -58, 18); ctx.closePath(); };
  // pants seat under the top
  ell(ctx, 0, 6, 62, 30); fillStroke(ctx, pants, lw);
  tb(); fillStroke(ctx, top, lw);
  ctx.save(); tb(); ctx.clip(); ell(ctx, -78, -80, 40, 140); ctx.fillStyle = topD; ctx.fill();
  if (L.shirt) { ctx.beginPath(); ctx.moveTo(20, -TL - 10); ctx.lineTo(44, -TL + 50); ctx.lineTo(64, -TL + 40); ctx.lineTo(64, -TL - 10); ctx.closePath(); ctx.fillStyle = L.shirt; ctx.fill(); ctx.lineWidth = px(ctx, 4); ctx.strokeStyle = INK; ctx.stroke(); }
  if (L.zip) { ctx.strokeStyle = shade(top, -0.4); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(44, -TL + 50); ctx.quadraticCurveTo(58, -60, 56, 14); ctx.stroke(); }
  if (L.stripe) { ctx.fillStyle = L.stripe; ctx.fillRect(-80, -4, 160, 14); }
  ctx.restore();
  if (L.apron) { ctx.beginPath(); ctx.moveTo(8, -TL + 28); ctx.lineTo(56, -TL + 30); ctx.bezierCurveTo(70, -100, 74, -10, 70, 120); ctx.lineTo(-6, 120); ctx.bezierCurveTo(-4, 40, 0, -60, 8, -TL + 28); ctx.closePath(); fillStroke(ctx, L.apron, lw);
    ctx.lineWidth = 6; ctx.strokeStyle = shade(L.apron, -0.35); ctx.beginPath(); ctx.moveTo(-50, -70); ctx.lineTo(14, -70); ctx.stroke();
    // little cup logo on the apron
    ctx.save(); ctx.translate(40, -40); ctx.beginPath(); ctx.moveTo(-12, -12); ctx.lineTo(12, -12); ctx.lineTo(9, 12); ctx.lineTo(-9, 12); ctx.closePath(); fillStroke(ctx, C.red, 3); ctx.restore(); }
  // neck
  ctx.restore();
  const hd = add(neck, rot([12, -92], lean + (P.headTilt || 0) * 0.4));
  tube(ctx, [add(neck, [4, 6]), add(hd, [-8, 30])], 40, shade(L.skin, -0.12), lw);
  if (L.collar) { ctx.save(); ctx.translate(neck[0], neck[1]); ctx.rotate(lean); ell(ctx, 4, 2, 46, 16); fillStroke(ctx, L.collar, lw); ctx.restore(); }
  leg(legN, false);
  if (P.farFront) arm(armF, P.armF || {}, true);
  head(ctx, hd[0], hd[1], 78, L, { ...(P.face || {}), tilt: (P.headTilt || 0) + lean * 0.3 });
  arm(armN, P.armN || {}, false);
  ctx.restore();
  return { hd, neck, armN, armF };
}

// world position of a local point of a figure (for handing props between characters)
const toWorld = (x, y, s, facing, p) => [x + p[0] * s * facing, y + p[1] * s];
const toLocal = (x, y, s, facing, w) => [(w[0] - x) / (s * facing), (w[1] - y) / s];

// walk cycle: phase in radians, returns pose pieces (local, facing +x)
function walk(phase, o = {}) {
  const st = o.stride || 62, lift = o.lift || 34, bob = o.bob || 10;
  const hip = [0, -250 + bob * Math.abs(Math.cos(phase)) - bob * 0.5];
  const foot = ph => [st * Math.sin(ph), -lift * Math.max(0, Math.cos(ph))];
  const handSw = ph => [-38 * Math.sin(ph) + 10, -40 + 6 * Math.cos(ph * 2)];
  return { hip, lean: 0.06, legN: { foot: foot(phase) }, legF: { foot: foot(phase + Math.PI) }, armN: { hand: add(handSw(phase + Math.PI), [8, 0]), grip: 'relax' }, armF: { hand: handSw(phase), grip: 'relax' } };
}

// ---------- props ----------
function cup(ctx, s = 1, o = {}) { // takeaway cup, base at 0, ~100 tall
  ctx.save(); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-30, -96); ctx.lineTo(30, -96); ctx.lineTo(24, 0); ctx.lineTo(-24, 0); ctx.closePath(); fillStroke(ctx, '#FFFDF8', 4.5);
  ctx.beginPath(); ctx.moveTo(-29, -62); ctx.lineTo(29, -62); ctx.lineTo(27, -30); ctx.lineTo(-27, -30); ctx.closePath(); fillStroke(ctx, C.red, 4);
  ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.arc(0, -46, 8, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-36, -96); ctx.lineTo(36, -96); ctx.lineTo(33, -110); ctx.lineTo(-33, -110); ctx.closePath(); fillStroke(ctx, '#3A2A22', 4.5);
  ctx.fillStyle = '#5A463C'; ctx.fillRect(-20, -116, 40, 8);
  if (o.steam) { ctx.lineCap = 'round'; ctx.lineWidth = 7; for (let i = 0; i < 3; i++) { const ph = o.steam * 2 + i * 2.1, u = (ph % 2) / 2; ctx.strokeStyle = `rgba(255,255,255,${0.7 * Math.sin(u * Math.PI)})`;
    ctx.beginPath(); ctx.moveTo(-14 + i * 14, -124 - u * 60); ctx.bezierCurveTo(-24 + i * 14, -140 - u * 60, -4 + i * 14, -158 - u * 60, -14 + i * 14, -176 - u * 60); ctx.stroke(); } }
  ctx.restore();
}
function card(ctx, s = 1) { // bank card centred, 86 x 54
  ctx.save(); ctx.scale(s, s);
  K.rr(ctx, -43, -27, 86, 54, 7); fillStroke(ctx, C.red, 4);
  ctx.save(); K.rr(ctx, -43, -27, 86, 54, 7); ctx.clip(); ctx.fillStyle = shade(C.red, -0.2); ctx.beginPath(); ctx.arc(46, 32, 46, 0, 7); ctx.fill(); ctx.restore();
  K.rr(ctx, -32, -12, 18, 14, 3); fillStroke(ctx, C.yellow, 2.5);
  ctx.fillStyle = 'rgba(255,255,255,0.85)'; for (let i = 0; i < 4; i++) ctx.fillRect(-32 + i * 15, 10, 11, 4);
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2.5; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(22, -10, 5 + i * 5, -0.7, 0.7); ctx.stroke(); }
  ctx.restore();
}

module.exports = { LINE, px, EXPR, expr, exprMix, features, headFront, bust, INK, shade, ik, tube, fillStroke, ell, hand, head, figure, walk, cup, card, toWorld, toLocal, add, mix, rot };
