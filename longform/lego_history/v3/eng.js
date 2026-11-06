// LEGO film v3 — code-drawn 2.5D/3D documentary engine (no AI art). Small software 3D renderer on @napi-rs/canvas:
//   camera (position/target/fov) · meshes (box, cylinder, extruded prism, LEGO-style brick with studs, odd pieces) · flat + key/fill/rim
//   shading · depth fog · painter sorting · inked edges · 2D layers (type, maps, photos, particles) · post (grade, vignette, grain).
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const W = 1920, H = 1080, FPS = 30;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, u) => a + (b - a) * u, ss = u => { u = clamp(u); return u * u * (3 - 2 * u); };
const ease = { out: u => 1 - Math.pow(1 - clamp(u), 3), in: u => Math.pow(clamp(u), 3), inOut: u => { u = clamp(u); return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; },
  back: u => { u = clamp(u); const c = 1.6; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); }, expo: u => (u = clamp(u)) >= 1 ? 1 : 1 - Math.pow(2, -10 * u) };
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
// keyframes [[t, v], ...] with easing
const key = (ks, t, e = ease.inOut) => { if (t <= ks[0][0]) return ks[0][1]; for (let i = 1; i < ks.length; i++) if (t < ks[i][0]) { const [t0, a] = ks[i - 1], [t1, b] = ks[i], u = e((t - t0) / (t1 - t0));
  return Array.isArray(a) ? a.map((v, k) => lerp(v, b[k], u)) : lerp(a, b, u); } return ks[ks.length - 1][1]; };

// ---------- vectors ----------
const V = { add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], mul: (a, k) => [a[0] * k, a[1] * k, a[2] * k],
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  norm: a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; } };
// transform: position + yaw (around y) + pitch (x) + roll (z) + uniform scale
function xf(p, T) { if (!T) return p; let [x, y, z] = p; const s = T.s ?? 1; x *= s; y *= s; z *= s;
  if (T.roll) { const c = Math.cos(T.roll), n = Math.sin(T.roll); [x, y] = [x * c - y * n, x * n + y * c]; }
  if (T.pitch) { const c = Math.cos(T.pitch), n = Math.sin(T.pitch); [y, z] = [y * c - z * n, y * n + z * c]; }
  if (T.yaw) { const c = Math.cos(T.yaw), n = Math.sin(T.yaw); [x, z] = [x * c + z * n, -x * n + z * c]; }
  return [x + (T.x || 0), y + (T.y || 0), z + (T.z || 0)]; }

// ---------- scene ----------
class Scene {
  constructor() { this.faces = []; this.lines = []; }
  // face: points (world), colour [r,g,b], opts {a, emissive, edge, noCull}
  face(pts, col, o = {}) { this.faces.push({ pts, col, o }); }
  quad(a, b, c, d, col, o) { this.face([a, b, c, d], col, o); }
  box(T, sx, sy, sz, col, o = {}) { // box from (0,0,0) to (sx,sy,sz) in local space, then transform
    o = Object.assign({ c: xf([sx / 2, sy / 2, sz / 2], T) }, o);
    const P = (x, y, z) => xf([x, y, z], T), p = [P(0, 0, 0), P(sx, 0, 0), P(sx, 0, sz), P(0, 0, sz), P(0, sy, 0), P(sx, sy, 0), P(sx, sy, sz), P(0, sy, sz)];
    const f = [[4, 5, 6, 7], [3, 2, 1, 0], [0, 1, 5, 4], [2, 3, 7, 6], [1, 2, 6, 5], [3, 0, 4, 7]];
    for (const q of f) this.face(q.map(i => p[i]), col, o); }
  cyl(T, cx, cy, cz, r, h, col, seg = 14, o = {}) { o = Object.assign({}, o, { c: xf([cx, cy + h / 2, cz], T) }); const ring = (y) => Array.from({ length: seg }, (_, i) => xf([cx + r * Math.cos(-i / seg * 6.2832), y, cz + r * Math.sin(-i / seg * 6.2832)], T));
    const b = ring(cy), t = ring(cy + h); for (let i = 0; i < seg; i++) { const j = (i + 1) % seg; this.face([b[i], b[j], t[j], t[i]], col, Object.assign({ edge: 0 }, o)); }
    this.face(t.slice(), col, o); this.face(b.slice().reverse(), col, o); }
  // extruded prism: 2D polygon in local xz (counter-clockwise seen from above), from y0 to y0+h
  prism(T, poly, y0, h, col, o = {}) { const cx0 = poly.reduce((a, p) => a + p[0], 0) / poly.length, cz0 = poly.reduce((a, p) => a + p[1], 0) / poly.length;
    o = Object.assign({}, o, { c: xf([cx0, y0 + h / 2, cz0], T), conc: true }); const b = poly.map(([x, z]) => xf([x, y0, z], T)), t = poly.map(([x, z]) => xf([x, y0 + h, z], T)), n = poly.length;
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; this.face([b[j], b[i], t[i], t[j]], col, o); } this.face(t.slice().reverse(), col, o); this.face(b.slice(), col, o); }
  shadow(x, y, z, r, a = 0.45) { (this.shadows = this.shadows || []).push({ x, y, z, r, a }); }
  line(a, b, col, w = 2, alpha = 1) { this.lines.push({ a, b, col, w, alpha }); }
}
// LEGO-style dimensions (mm): stud pitch 8, brick height 9.6, plate 3.2, stud r 2.4 h 1.8
const U = 8, BH = 9.6, PL = 3.2;
function studs(sc, T, nx, nz, y, col, seg = 14) { for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) sc.cyl(T, U / 2 + i * U, y, U / 2 + k * U, 2.4, 1.8, col, seg); }
// brick nx x nz studs, height in plates (3 = brick). T places its corner; use T.ox/oz to centre
function brick(sc, T, nx, nz, col, o = {}) { const h = (o.plates ?? 3) * PL, C = Object.assign({}, T); const cx = nx * U / 2, cz = nz * U / 2;
  const TT = { x: 0, y: 0, z: 0 }; const W2 = p => xf([p[0] - cx, p[1], p[2] - cz], C);
  const loc = { s: 1 }; const wrap = { __proto__: null };
  // local -> world with centre pivot
  const LT = { ...C }; const tr = (x, y, z) => W2([x, y, z]);
  const P = (x, y, z) => tr(x, y, z), p = [P(0, 0, 0), P(nx * U, 0, 0), P(nx * U, 0, nz * U), P(0, 0, nz * U), P(0, h, 0), P(nx * U, h, 0), P(nx * U, h, nz * U), P(0, h, nz * U)];
  const ob = Object.assign({}, o, { c: tr(nx * U / 2, h / 2, nz * U / 2) });
  for (const q of [[4, 5, 6, 7], [3, 2, 1, 0], [0, 1, 5, 4], [2, 3, 7, 6], [1, 2, 6, 5], [3, 0, 4, 7]]) sc.face(q.map(i => p[i]), col, ob);
  if (o.studs !== false) { const seg = o.seg ?? 14; for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) { const ring = (y) => Array.from({ length: seg }, (_, s) => tr(U / 2 + i * U + 2.4 * Math.cos(-s / seg * 6.2832), y, U / 2 + k * U + 2.4 * Math.sin(-s / seg * 6.2832)));
      const so = Object.assign({}, o, { c: tr(U / 2 + i * U, h + 0.9, U / 2 + k * U) });
      const b = ring(h), t = ring(h + 1.8); for (let s = 0; s < seg; s++) { const j = (s + 1) % seg; sc.face([b[s], b[j], t[j], t[s]], col, Object.assign({}, so, { edge: 0 })); } sc.face(t, col, so); } } }
// odd one-off pieces: a few families of shapes, all with studs on top (they still fit)
function oddPiece(sc, T, kind, col, o = {}) { const C = T; const tr = (p) => xf(p, C);
  const pr = (poly, y0, h) => sc.prism({ ...C }, poly, y0, h, col, o);
  const st = (pts, y) => { for (const [x, z] of pts) sc.cyl(C, x, y, z, 2.4, 1.8, col, 10, Object.assign({}, o)); };
  switch (kind % 8) {
    case 0: pr([[-12, -8], [12, -8], [12, 8], [-12, 8]], 0, PL); pr([[-12, -8], [4, -8], [4, 8], [-12, 8]], PL, BH * 1.2); st([[-8, -4], [-8, 4], [0, -4], [0, 4]], PL + BH * 1.2); break;   // step
    case 1: pr([[-16, -4], [16, -4], [16, 4], [-16, 4]], 0, PL); pr([[-16, -4], [-8, -4], [-8, 4], [-16, 4]], PL, 14); pr([[8, -4], [16, -4], [16, 4], [8, 4]], PL, 14); st([[-12, 0], [12, 0]], PL + 14); break;   // arch-ish
    case 2: { const poly = Array.from({ length: 12 }, (_, i) => [10 * Math.cos(i / 12 * 6.283), 10 * Math.sin(i / 12 * 6.283)]); pr(poly, 0, PL * 2); st([[0, 0]], PL * 2); break; } // round plate
    case 3: pr([[-12, -8], [12, -8], [12, 8], [-12, 8]], 0, PL); pr([[-12, -8], [-4, -8], [12, 0], [-4, 8], [-12, 8]], PL, PL); st([[-8, 0]], PL * 2); break;   // wing
    case 4: pr([[-4, -4], [4, -4], [4, 4], [-4, 4]], 0, 26); sc.cyl(C, 0, 26, 0, 6, 3, col, 12, o); st([[0, 0]], 29); break;   // antenna/pole
    case 5: pr([[-8, -8], [8, -8], [8, 8], [-8, 8]], 0, BH); sc.cyl(C, 0, BH, 0, 9, 9, col, 14, o); break;   // dome-ish
    case 6: pr([[-16, -8], [0, -8], [0, 0], [16, 0], [16, 8], [-16, 8]], 0, PL); st([[-12, -4], [-4, -4], [-12, 4], [-4, 4], [4, 4], [12, 4]], PL); break;   // L plate
    case 7: pr([[-12, -8], [12, -8], [12, 8], [-12, 8]], 0, PL); pr([[-12, -8], [12, -8], [12, -2], [-12, -2]], PL, BH); pr([[-12, -2], [12, -2], [12, 8], [-12, 8]], PL, PL * 1.5); st([[-8, -5], [0, -5], [8, -5]], PL + BH); break;  // slope-ish
  } }

// ---------- camera + render ----------
function camera(pos, target, fov = 40, roll = 0) { const f = V.norm(V.sub(target, pos)); let r = V.norm(V.cross(f, [0, 1, 0])); let u = V.cross(r, f);
  if (roll) { const c = Math.cos(roll), s = Math.sin(roll); [r, u] = [V.add(V.mul(r, c), V.mul(u, s)), V.add(V.mul(u, c), V.mul(r, -s))]; }
  return { pos, f, r, u, F: (H / 2) / Math.tan(fov * Math.PI / 360) }; }
const LIGHT = V.norm([0.55, 0.85, 0.35]), FILL = V.norm([-0.7, 0.25, -0.2]);
function shade(col, n, pDist, R, faceO) {
  const d = Math.max(0, V.dot(n, R.light || LIGHT)), f = Math.max(0, V.dot(n, R.fill || FILL)), up = Math.max(0, n[1]);
  let k = (R.amb ?? 0.30) + d * (R.key ?? 0.80) + f * 0.14 + up * 0.06; if (faceO.emissive) k = Math.max(k, faceO.emissive);
  let c = col.map(v => v * k + (R.tint ? 0 : 0)); if (R.warm) c = [c[0] * (1 + R.warm), c[1], c[2] * (1 - R.warm * 0.6)];
  const fg = clamp((pDist - (R.fogNear ?? 400)) / ((R.fogFar ?? 3000) - (R.fogNear ?? 400))) * (R.fog ?? 0.85), fc = R.fogCol || [14, 16, 22];
  return c.map((v, i) => Math.round(clamp(lerp(v, fc[i], fg), 0, 255))); }
function render(ctx, sc, cam, R = {}) {
  const P = p => { const v = V.sub(p, cam.pos), z = V.dot(v, cam.f); return [W / 2 + V.dot(v, cam.r) / z * cam.F, H / 2 - V.dot(v, cam.u) / z * cam.F, z]; };
  const list = [];
  for (const fc of sc.faces) { const p = fc.pts; if (p.length < 3) continue;
    let n = V.norm(V.cross(V.sub(p[1], p[0]), V.sub(p[2], p[0])));
    if (fc.o.c) { let m = [0, 0, 0]; for (const q of p) m = V.add(m, q); m = V.mul(m, 1 / p.length); if (V.dot(n, V.sub(m, fc.o.c)) < 0) n = V.mul(n, -1); }
    const toCam = V.sub(cam.pos, p[0]); if (!fc.o.noCull && V.dot(n, toCam) <= 0) continue;
    const sp = p.map(P); if (sp.some(q => q[2] < 2)) continue; let z = 0, mx = 0; for (const q of sp) { z += q[2]; mx = Math.max(mx, q[2]); } z /= sp.length;
    if (sp.every(q => q[0] < -200 || q[0] > W + 200) || sp.every(q => q[1] < -200 || q[1] > H + 200)) continue;
    list.push({ sp, z: z * 0.85 + mx * 0.15, n, d: Math.hypot(...toCam), fc }); }
  list.sort((a, b) => b.z - a.z);
  ctx.lineJoin = 'round';
  // soft contact shadows on the ground plane (y = R.groundY), before faces
  for (const sh of sc.shadows || []) { const c0 = P([sh.x, sh.y, sh.z]); if (c0[2] < 2) continue; const ex = P([sh.x + sh.r, sh.y, sh.z]), ez = P([sh.x, sh.y, sh.z + sh.r]);
    const rx = Math.hypot(ex[0] - c0[0], ex[1] - c0[1]), ry = Math.max(2, Math.hypot(ez[0] - c0[0], ez[1] - c0[1]));
    ctx.save(); ctx.translate(c0[0], c0[1]); ctx.scale(1, ry / rx); const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx); g.addColorStop(0, `rgba(0,0,0,${sh.a ?? 0.45})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rx, 0, 6.2832); ctx.fill(); ctx.restore(); }
  for (const it of list) { const c = shade(it.fc.col, it.n, it.d, R, it.fc.o), a = it.fc.o.a ?? 1;
    ctx.beginPath(); it.sp.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath();
    // soft light across the face: lighter at the top of the face on screen, darker at the bottom (+ a specular sheen on near-up faces)
    let y0 = 1e9, y1 = -1e9; for (const q of it.sp) { y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); }
    const sp = Math.pow(Math.max(0, V.dot(V.norm(V.add(R.light || LIGHT, V.norm(V.sub(cam.pos, it.fc.pts[0])))), it.n)), 18) * (R.gloss ?? 0.55);
    const lit = v => Math.round(clamp(v * 1.12 + sp * 255 * 0.5, 0, 255)), drk = v => Math.round(v * 0.86);
    if (y1 - y0 > 3) { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, `rgba(${lit(c[0])},${lit(c[1])},${lit(c[2])},${a})`); g.addColorStop(1, `rgba(${drk(c[0])},${drk(c[1])},${drk(c[2])},${a})`); ctx.fillStyle = g; }
    else ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a})`;
    ctx.fill();
    const e = it.fc.o.edge ?? R.edge ?? 1; if (e > 0) { ctx.strokeStyle = `rgba(${c[0] * 0.4 | 0},${c[1] * 0.4 | 0},${c[2] * 0.4 | 0},${a * 0.85})`; ctx.lineWidth = e * clamp(900 / it.z, 0.5, 2.0); ctx.stroke();
      if (it.n[1] > 0.6) { ctx.strokeStyle = `rgba(255,255,255,${0.22 * a})`; ctx.lineWidth = clamp(600 / it.z, 0.4, 1.4); ctx.stroke(); } }
    else { ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${a})`; ctx.lineWidth = 0.8; ctx.stroke(); } }
  for (const l of sc.lines) { const a = P(l.a), b = P(l.b); if (a[2] < 2 || b[2] < 2) continue; ctx.strokeStyle = l.col; ctx.globalAlpha = l.alpha; ctx.lineWidth = l.w; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.globalAlpha = 1; }
  return P; }

// ---------- 2D helpers ----------
const F = '"Inter Display", Inter, sans-serif';
function bg(ctx, top, bot) { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bot); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
function glow(ctx, x, y, r, col, a) { if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore(); }
function bokeh(ctx, t, n = 26, col = '255,190,120', a = 0.12, seed = 1) { ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) { const h = hash(i * 7.1 + seed), x = (hash(i * 3.3 + seed) * W + t * (8 + h * 20)) % (W + 200) - 100, y = hash(i * 5.9 + seed) * H, r = 20 + h * 70;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${col},${a * (0.5 + h)})`); g.addColorStop(0.7, `rgba(${col},${a * 0.4 * (0.5 + h)})`); g.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
  ctx.restore(); }
// kinetic type: letters rise in with a mask, tracking
function type(ctx, s, x, y, t, o = {}) { const size = o.size || 96, col = o.col || '#F4EFE6', tr = o.track ?? 0.02, a = o.a ?? 1, dur = o.dur ?? 0.5, stag = o.stag ?? 0.025;
  if (a <= 0 || t <= 0) return; ctx.save(); ctx.font = `${o.weight || 900} ${size}px ${F}`; ctx.textBaseline = 'alphabetic';
  const ws = [...s].map(ch => ctx.measureText(ch).width + size * tr), tw = ws.reduce((p, q) => p + q, 0); let cx = o.align === 'left' ? x : o.align === 'right' ? x - tw : x - tw / 2;
  ctx.beginPath(); ctx.rect(cx - 40, y - size * 1.05, tw + 80, size * 1.35); ctx.clip();
  [...s].forEach((ch, i) => { const u = ease.out((t - i * stag) / dur); if (u > 0) { ctx.globalAlpha = a * clamp(u * 1.4); ctx.fillStyle = col; ctx.fillText(ch, cx, y + (1 - u) * size * 0.9); } cx += ws[i]; });
  ctx.restore(); return tw; }
function label(ctx, s, x, y, a, o = {}) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.font = `${o.weight || 700} ${o.size || 26}px ${F}`; ctx.textAlign = o.align || 'left'; ctx.textBaseline = 'middle';
  if (o.letter) { ctx.letterSpacing = `${o.letter}px`; } ctx.fillStyle = o.col || 'rgba(244,239,230,0.85)'; ctx.fillText(s, x, y); ctx.restore(); }
// thin tick-line label (documentary caption)
function caption(ctx, s, x, y, a, o = {}) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = o.col || '#E3B341'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y - 26); ctx.lineTo(x, y + 26); ctx.stroke();
  ctx.font = `800 ${o.size || 28}px ${F}`; ctx.fillStyle = '#F4EFE6'; ctx.textBaseline = 'middle'; ctx.fillText(s, x + 18, y - (o.sub ? 12 : 0)); if (o.sub) { ctx.font = `600 ${(o.size || 28) * 0.72}px ${F}`; ctx.fillStyle = 'rgba(244,239,230,0.7)'; ctx.fillText(o.sub, x + 18, y + 18); } ctx.restore(); }
// ---------- post ----------
let GR = null;
function grain(ctx, t, a = 0.06) { if (!GR) { GR = []; for (let k = 0; k < 4; k++) { const c = createCanvas(480, 270), g = c.getContext('2d'), d = g.createImageData(480, 270);
      for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } g.putImageData(d, 0, 0); GR.push(c); } }
  ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = a; ctx.drawImage(GR[Math.floor(t * 24) % 4], 0, 0, W, H); ctx.restore(); }
function vignette(ctx, a = 0.55) { const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 1.05); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
function sepia(ctx, a) { if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'color'; ctx.globalAlpha = a; ctx.fillStyle = '#8a6a42'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
// colours
const C = { red: [201, 26, 20], yellow: [245, 196, 32], blue: [0, 87, 168], white: [236, 234, 228], black: [38, 38, 42], green: [35, 120, 65], orange: [228, 112, 28], lime: [150, 196, 40],
  purple: [110, 70, 160], teal: [0, 150, 160], pink: [225, 120, 170], tan: [222, 196, 140], grey: [140, 146, 150], dkgrey: [90, 94, 100], wood: [176, 122, 70], woodDk: [120, 78, 42] };
const PAL = [C.red, C.yellow, C.blue, C.white, C.green, C.orange, C.lime, C.purple, C.teal, C.pink, C.tan, C.grey, C.black];
module.exports = { bokeh, W, H, FPS, clamp, lerp, ss, ease, hash, key, V, xf, Scene, U, BH, PL, studs, brick, oddPiece, camera, render, bg, glow, type, label, caption, grain, vignette, sepia, C, PAL, F, createCanvas, loadImage };
