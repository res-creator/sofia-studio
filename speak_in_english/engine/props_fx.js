// Props and comedy effects for new episodes: a pointing hand, falling/bouncing objects, shards, splashes,
// speed lines and reaction rings (the last two follow fx2d.speedLines / rings from the make-2d-video kit).
// Deterministic: everything is a function of time (no Math.random), so any frame can be rendered on its own.
const H = require('./hq');
const { clamp, lerp, paint, rgba, hash, INK, dark } = H;

// index finger over a fist: use as an hq item (items.R = finger(cfg)) together with armR.fist = true
function finger(cfg) {
  const r = (cfg.h || 1500) * 0.0225, skin = cfg.skin || '#F3C9A8';
  return (ctx, a, side) => { ctx.save(); ctx.rotate(a - Math.PI / 2); ctx.scale(side < 0 ? -1 : 1, 1);
    paint(ctx, q => { q.m(-r * 0.55, r * 0.6); q.l(-r * 0.62, r * 2.05); q.q(-r * 0.4, r * 2.35, -r * 0.18, r * 2.05); q.l(-r * 0.1, r * 0.6); q.z(); }, skin, { sd: 4, hd: 2, lw: 3.5 });
    ctx.strokeStyle = rgba(dark(skin, .3), .5); ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(-r * 0.58, r * 1.35); ctx.quadraticCurveTo(-r * 0.36, r * 1.42, -r * 0.16, r * 1.35); ctx.stroke();
    ctx.restore(); };
}

// ballistic fall with floor bounces. p = { t0, x, y, vx, vy, rot, spin, floor, g, bounce, stopAfter }
// returns { x, y, rot, hits: [t of each floor contact], landed }
function fall(p, t) {
  const g = p.g ?? 5200, e = p.bounce ?? 0.28, maxB = p.stopAfter ?? 2;
  let x = p.x, y = p.y, vx = p.vx || 0, vy = p.vy || 0, rot = p.rot || 0, spin = p.spin || 0, tt = p.t0; const hits = [];
  if (t <= p.t0) return { x, y, rot, hits, landed: false };
  for (let b = 0; b <= maxB; b++) {
    const A = 0.5 * g, B = vy, C = y - p.floor, disc = B * B - 4 * A * C, th = (-B + Math.sqrt(Math.max(0, disc))) / (2 * A);   // time to reach the floor
    if (t < tt + th) { const d = t - tt; return { x: x + vx * d, y: y + vy * d + 0.5 * g * d * d, rot: rot + spin * d, hits, landed: hits.length > 0 }; }
    x += vx * th; rot += spin * th; tt += th; y = p.floor; hits.push(tt); vy = -(vy + g * th) * e; vx *= 0.55; spin *= -0.5;
    if (b === maxB || Math.abs(vy) < 120) return { x, y, rot: p.restRot ?? rot, hits, landed: true };
  }
  return { x, y, rot, hits, landed: true };
}

// shards flying from a break at (x, y) at time t0; draw(c, k) draws one shard (k = index)
function shards(c, t, t0, x, y, o = {}) {
  if (t < t0) return; const n = o.n || 7, d = t - t0, floor = o.floor ?? y, g = 4200;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI * (0.12 + 0.76 * hash(i * 3 + (o.seed || 0))), v = 420 + 520 * hash(i * 7 + 1), vx = Math.cos(a) * v, vy = Math.sin(a) * v;
    const tl = -2 * vy / g, tt = Math.min(d, tl), slide = d > tl ? Math.min(d - tl, 0.25) * vx * 0.35 : 0;   // flight, then a short slide
    const px = x + vx * tt + slide, py = Math.min(floor, y + vy * tt + 0.5 * g * tt * tt);
    const rot = (hash(i) - 0.5) * 12 * Math.min(d, tl + 0.2) + i;
    c.save(); c.translate(px, py - 6); c.rotate(rot); const s = (o.size || 26) * (0.6 + 0.7 * hash(i * 11));
    paint(c, q => { q.m(-s, -s * 0.3); q.l(s * 0.2, -s * 0.7); q.l(s, s * 0.1); q.l(-s * 0.1, s * 0.5); q.z(); }, o.col || '#FFFDF8', { sd: 2, hd: 1, lw: 3 });
    if (o.band) { c.fillStyle = o.band; c.fillRect(-s * 0.7, -s * 0.1, s * 1.3, s * 0.18); }
    c.restore();
  }
}
// liquid splash + puddle at (x, floor)
function splash(c, t, t0, x, floor, o = {}) {
  if (t < t0) return; const d = t - t0, col = o.col || '#B9773E';
  const pw = (o.w || 150) * clamp(d / 0.35) ** 0.5; c.fillStyle = rgba(col, 0.85); c.beginPath(); c.ellipse(x, floor + 4, pw, pw * 0.16, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(x - pw * 0.3, floor + 1, pw * 0.25, pw * 0.04, 0, 0, Math.PI * 2); c.fill();
  if (d < 0.6) for (let i = 0; i < 10; i++) { const a = -Math.PI * (0.1 + 0.8 * hash(i * 5 + 2)), v = 380 + 360 * hash(i * 9), tt = d;
    const px = x + Math.cos(a) * v * tt, py = floor + Math.sin(a) * v * tt + 0.5 * 4200 * tt * tt; if (py > floor + 6) continue;
    c.fillStyle = rgba(col, 0.9 * (1 - d / 0.6)); c.beginPath(); c.arc(px, py, 7 + 5 * hash(i), 0, Math.PI * 2); c.fill(); }
}
// radial speed lines around a screen point (crash zoom / shock), a = opacity
function speedLines(c, cx, cy, t, o = {}) {
  const n = o.n || 56, inner = o.inner || 300, outer = o.outer || 1400, a = o.a ?? 0.5; c.save(); c.strokeStyle = o.col || '#FFFFFF'; c.lineCap = 'round';
  for (let i = 0; i < n; i++) { const ang = (i / n) * Math.PI * 2 + hash(i) * 0.08, jit = hash(i * 13 + Math.floor(t * 20)) ;
    const r0 = inner + jit * 160, r1 = outer; c.globalAlpha = a * (0.4 + 0.6 * hash(i * 3)); c.lineWidth = 3 + 7 * hash(i * 5);
    c.beginPath(); c.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0); c.lineTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1); c.stroke(); }
  c.restore();
}
// expanding "shock" rings around a point (a realisation, a sudden sound)
function rings(c, x, y, t, t0, o = {}) {
  if (t < t0 || t > t0 + (o.dur || 0.6)) return; const k = (t - t0) / (o.dur || 0.6);
  c.save(); c.strokeStyle = o.col || INK; c.lineWidth = o.w || 5; c.globalAlpha = 1 - k;
  for (let i = 0; i < 3; i++) { const r = (o.r0 || 40) + ((o.r1 || 160) - (o.r0 || 40)) * clamp(k * 1.2 - i * 0.15); if (r <= 0) continue; c.beginPath(); c.arc(x, y, r, -2.6, -0.55); c.stroke(); }
  c.restore();
}
// floating music notes (whistling), from a mouth point
function notes(c, x, y, t, t0, t1, col = INK) {
  if (t < t0 || t > t1 + 0.5) return;
  for (let i = 0; i < 4; i++) { const ph = ((t - t0) * 0.9 + i * 0.27) % 1, a = (t > t1 ? 1 - (t - t1) / 0.5 : 1) * Math.sin(ph * Math.PI);
    if (a <= 0) continue; c.save(); c.globalAlpha = a; c.translate(x + ph * 120 + Math.sin(ph * 8 + i) * 18, y - ph * 170); c.rotate(-0.2);
    c.fillStyle = col; c.beginPath(); c.ellipse(0, 0, 14, 10, -0.4, 0, Math.PI * 2); c.fill(); c.fillRect(10, -46, 5, 46); if (i % 2) c.fillRect(10, -46, 22, 6); c.restore(); }
}
// small dust puff on the floor (sliding objects, feet)
function dust(c, x, y, t, t0, o = {}) {
  if (t < t0 || t > t0 + 0.7) return; const k = (t - t0) / 0.7;
  for (let i = 0; i < 6; i++) { const dx = (hash(i * 3) - 0.5) * 2 * (o.spread || 120) * (0.3 + k), dy = -k * 60 * hash(i * 7);
    c.fillStyle = `rgba(200,185,165,${0.55 * (1 - k)})`; c.beginPath(); c.arc(x + dx, y + dy, (18 + 22 * hash(i)) * (0.6 + k), 0, Math.PI * 2); c.fill(); }
}

module.exports = { finger, fall, shards, splash, speedLines, rings, notes, dust };
