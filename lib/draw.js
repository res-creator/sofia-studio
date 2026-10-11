// Shared drawing helpers: outlined cel-shaded shapes, limbs, easing.
const OL = '#3a221d';

function paint(ctx, pathFn, fill, o = {}) {
  const lw = o.lw ?? 6;
  ctx.save();
  ctx.beginPath(); pathFn(ctx);
  ctx.fillStyle = fill; ctx.fill(o.rule || 'nonzero');
  if (o.shade) {
    // cel shade: shade colour on the whole shape, then base colour shifted away from the light
    ctx.save(); ctx.clip(o.rule || 'nonzero');
    ctx.fillStyle = o.shade; ctx.beginPath(); pathFn(ctx); ctx.fill();
    ctx.translate(-(o.sx ?? 12), -(o.sy ?? 10));
    ctx.fillStyle = fill; ctx.beginPath(); pathFn(ctx); ctx.fill();
    ctx.restore();
  }
  if (o.hi) {
    ctx.save(); ctx.beginPath(); pathFn(ctx); ctx.clip();
    ctx.globalAlpha = o.hiA ?? 0.35; ctx.fillStyle = o.hi; ctx.beginPath(); o.hiFn(ctx); ctx.fill();
    ctx.restore();
  }
  if (lw > 0) { ctx.beginPath(); pathFn(ctx); ctx.lineWidth = lw; ctx.strokeStyle = o.ol || OL; ctx.lineJoin = 'round'; ctx.stroke(); }
  ctx.restore();
}

function line(ctx, pts, w, col, cap = 'round') {
  ctx.save(); ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.lineWidth = w; ctx.strokeStyle = col; ctx.lineCap = cap; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore();
}
function curve(ctx, a, c, b, w, col) {
  ctx.save(); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(c[0], c[1], b[0], b[1]);
  ctx.lineWidth = w; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore();
}
// thick outlined limb along a polyline
function limb(ctx, pts, w, col, shade) {
  line(ctx, pts, w + 12, OL);
  line(ctx, pts, w, col);
  if (shade) { ctx.save(); ctx.globalAlpha = 0.5; const s = pts.map(p => [p[0] + w * 0.22, p[1] + w * 0.12]); line(ctx, s, w * 0.38, shade); ctx.restore(); }
}
// 2-bone IK, elbow bends to the outside/down (natural), never backwards
function ik(sh, target, L1, L2, side) {
  let dx = target[0] - sh[0], dy = target[1] - sh[1];
  let d = Math.hypot(dx, dy); const max = L1 + L2 - 0.5;
  if (d > max) { dx *= max / d; dy *= max / d; d = max; }
  if (d < 20) d = 20;
  const a = Math.atan2(dy, dx);
  const cosA = (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d);
  const off = Math.acos(Math.max(-1, Math.min(1, cosA)));
  // pick the elbow solution that lies further outward (side=-1 left, +1 right) and lower
  const c1 = [sh[0] + Math.cos(a + off) * L1, sh[1] + Math.sin(a + off) * L1];
  const c2 = [sh[0] + Math.cos(a - off) * L1, sh[1] + Math.sin(a - off) * L1];
  const score = c => c[0] * side + c[1] * 0.35;
  const el = score(c1) > score(c2) ? c1 : c2;
  return { el, hand: [sh[0] + dx, sh[1] + dy] };
}

const ease = {
  lin: t => t,
  inOut: t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  out: t => 1 - Math.pow(1 - t, 3),
  in: t => t * t * t,
  back: t => { const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
  elastic: t => t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1,
};
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a)); // 0..1 progress of t in [a,b]
// deterministic noise
function hash(n) { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); }
function noise1(x) { const i = Math.floor(x), f = x - i; const u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; }

function roundRect(ctx, x, y, w, h, r) {
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

module.exports = { OL, paint, line, curve, limb, ik, ease, clamp, lerp, seg, hash, noise1, roundRect };
