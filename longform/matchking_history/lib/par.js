// 2.5D parallax engine for "The Match King" (grown from the approved style test, tests/style_tests/style_tests.js · parallax).
// A scene = flat painted layers at depth z (1 = the focus plane, < 1 = closer to the lens, > 1 = further). The camera {x, y, zoom, f}
// shifts every layer by 1/z and scales it by 1 + (zoom - 1)/z; layers away from the focus depth f are blurred (depth of field).
// Atmosphere helpers: light beams, dust, smoke, rain, flame, colour grade, vignette, grain. Drawing only — no AI images.
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const W = 1920, H = 1080;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, u) => a + (b - a) * u;
const ss = u => { u = clamp(u); return u * u * (3 - 2 * u); }, eo = u => 1 - Math.pow(1 - clamp(u), 3), ei = u => Math.pow(clamp(u), 3);
const back = u => { u = clamp(u); if (u <= 0) return 0; if (u >= 1) return 1; const c = 1.70158; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const F = '"Inter Display", Inter, "DejaVu Sans", sans-serif', SERIF = '"DejaVu Serif", Georgia, serif';
const PAL = { ink: '#1b1410', paper: '#f3ead6', match: '#f2c230', matchRed: '#b8231b', gold: '#e3a83a', night: '#141a2c', blood: '#7a1c1c' };
// ---- layers ----
const LAY = createCanvas(W, H), LX = LAY.getContext('2d');
function layer(ctx, cam, z, draw, o = {}) { LX.setTransform(1, 0, 0, 1, 0, 0); LX.clearRect(0, 0, W, H); LX.save();
  const s = 1 + (cam.zoom - 1) / z; LX.translate(W / 2, H / 2); LX.scale(s, s); LX.translate(-W / 2 - cam.x / z, -H / 2 - cam.y / z); draw(LX); LX.restore();
  const blur = o.sharp ? 0 : Math.min(16, Math.abs(Math.log(z / (cam.f || 1))) * (o.dof ?? 9)); ctx.save(); if (o.alpha != null) ctx.globalAlpha = o.alpha; if (blur > 0.6) ctx.filter = `blur(${blur.toFixed(1)}px)`; ctx.drawImage(LAY, 0, 0); ctx.restore(); }
// camera keys: [t, x, y, zoom, focusDepth]; eased between keys
function camAt(g, keys) { let i = keys.findLastIndex(k => g >= k[0]); if (i < 0) i = 0; const a = keys[i], b = keys[Math.min(keys.length - 1, i + 1)], u = b === a ? 0 : ss((g - a[0]) / (b[0] - a[0]));
  return { x: lerp(a[1], b[1], u), y: lerp(a[2], b[2], u), zoom: lerp(a[3], b[3], u), f: lerp(a[4] ?? 1, b[4] ?? 1, u) }; }
// ---- shading helpers (painterly flat style: base fill + soft top light + bottom shade + optional rim light) ----
function fillShade(ctx, path, col, o = {}) { path(ctx); ctx.fillStyle = col; ctx.fill(); ctx.save(); path(ctx); ctx.clip();
  const y0 = o.y0 ?? -300, y1 = o.y1 ?? 300, g = ctx.createLinearGradient(o.x0 ?? 0, y0, o.x1 ?? 0, y1);
  g.addColorStop(0, `rgba(255,236,200,${o.hi ?? 0.16})`); g.addColorStop(0.55, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(10,5,20,${o.lo ?? 0.28})`); ctx.fillStyle = g; ctx.fillRect(-4000, -4000, 8000, 8000);
  if (o.rim) { path(ctx); ctx.strokeStyle = o.rim; ctx.lineWidth = o.rimW || 6; ctx.globalCompositeOperation = 'lighter'; ctx.stroke(); }
  ctx.restore(); if (o.line) { path(ctx); ctx.strokeStyle = o.line; ctx.lineWidth = o.lw || 2; ctx.stroke(); } }
function rect(x, y, w, h) { return c => { c.beginPath(); c.rect(x, y, w, h); }; }
function poly(pts) { return c => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); }; }
function blob(ctx, cx, cy, r, seed, sx = 1, n = 24) { ctx.beginPath(); for (let i = 0; i <= n; i++) { const a = i / n * 6.283, k = 0.72 + 0.4 * hash(seed + i % n) + 0.12 * Math.sin(a * 3 + seed); const x = cx + Math.cos(a) * r * k * sx, y = cy + Math.sin(a) * r * k; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); }
// ---- atmosphere ----
function sky(ctx, stops) { const g = ctx.createLinearGradient(0, 0, 0, H); stops.forEach(([p, c]) => g.addColorStop(p, c)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
function beams(ctx, x, a, col = '255,214,150') { if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) { const g = ctx.createLinearGradient(x, 0, x - 500, H); g.addColorStop(0, `rgba(${col},${0.14 * a})`); g.addColorStop(1, `rgba(${col},0)`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x + i * 120, 0); ctx.lineTo(x + 70 + i * 120, 0); ctx.lineTo(x - 400 + i * 160, H); ctx.lineTo(x - 560 + i * 160, H); ctx.fill(); } ctx.restore(); }
function dust(ctx, g, n = 60, col = '255,236,200') { ctx.save(); for (let i = 0; i < n; i++) { const h = hash(i * 3.7), x = (h * W + g * 18 * (0.4 + h)) % W, y = (hash(i * 9.1) * H - g * 10 * (0.3 + h) + H * 10) % H;
  ctx.fillStyle = `rgba(${col},${0.2 + 0.4 * h})`; ctx.beginPath(); ctx.arc(x, y, 1 + h * 2.5, 0, 7); ctx.fill(); } ctx.restore(); }
function smoke(ctx, x, y, g, o = {}) { const n = o.n || 9, sc = o.s || 1; for (let i = 0; i < n; i++) { const u = ((g * (o.speed || 0.22) + i / n) % 1);
  ctx.fillStyle = `rgba(${o.col || '205,195,185'},${(o.a || 0.35) * (1 - u)})`; ctx.beginPath(); ctx.arc(x + (u * 140 + Math.sin(u * 6 + i) * 20) * sc, y - u * 320 * sc, (20 + u * 70) * sc, 0, 7); ctx.fill(); } }
function rain(ctx, g, a = 1, n = 260) { if (a <= 0) return; ctx.save(); ctx.strokeStyle = `rgba(200,215,235,${0.35 * a})`; ctx.lineWidth = 1.6; ctx.beginPath();
  for (let i = 0; i < n; i++) { const h = hash(i * 7.3), x = (h * W * 1.2 + g * 120) % (W * 1.2) - 100, y = (hash(i * 2.1) * H + g * 1600 * (0.7 + h * 0.5)) % (H + 80) - 40; ctx.moveTo(x, y); ctx.lineTo(x - 10, y + 36); } ctx.stroke(); ctx.restore(); }
function flame(ctx, x, y, s, g, a = 1) { if (a <= 0) return; const f = 1 + Math.sin(g * 37) * 0.08 + Math.sin(g * 23) * 0.06; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = a;
  const gl = ctx.createRadialGradient(0, -30, 0, 0, -30, 120); gl.addColorStop(0, 'rgba(255,190,90,0.5)'); gl.addColorStop(1, 'rgba(255,150,60,0)'); ctx.fillStyle = gl; ctx.globalCompositeOperation = 'lighter'; ctx.beginPath(); ctx.arc(0, -30, 120, 0, 7); ctx.fill();
  ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#ff9a2a'; ctx.beginPath(); ctx.moveTo(0, -70 * f); ctx.bezierCurveTo(22, -40, 18, 0, 0, 4); ctx.bezierCurveTo(-18, 0, -22, -40, 0, -70 * f); ctx.fill();
  ctx.fillStyle = '#fff1b0'; ctx.beginPath(); ctx.moveTo(0, -44 * f); ctx.bezierCurveTo(10, -26, 8, -4, 0, 0); ctx.bezierCurveTo(-8, -4, -10, -26, 0, -44 * f); ctx.fill(); ctx.fillStyle = 'rgba(60,90,255,0.6)'; ctx.beginPath(); ctx.ellipse(0, -2, 6, 5, 0, 0, 7); ctx.fill(); ctx.restore(); }
function glow(ctx, x, y, r, col, a) { if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore(); }
const GRADE = { warm: ['rgba(255,170,80,0.10)', 'overlay'], cold: ['rgba(60,110,200,0.16)', 'overlay'], grey: ['rgba(120,130,140,0.22)', 'saturation'], night: ['rgba(30,50,120,0.18)', 'multiply'] };
function grade(ctx, kind, a = 1) { const g = GRADE[kind]; if (!g || a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = g[1]; ctx.fillStyle = g[0]; ctx.fillRect(0, 0, W, H); ctx.restore(); }
function vignette(ctx, a = 0.32) { const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 1.05); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${a})`); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H); }
const GRAIN = (() => { const c = createCanvas(512, 512), x = c.getContext('2d'), d = x.createImageData(512, 512); for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } x.putImageData(d, 0, 0); return c; })();
function grain(ctx, g, a = 0.045) { ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'overlay'; const ox = Math.floor(hash(Math.floor(g * 24)) * 512), oy = Math.floor(hash(Math.floor(g * 24) + 9) * 512);
  for (let y = -oy; y < H; y += 512) for (let x = -ox; x < W; x += 512) ctx.drawImage(GRAIN, x, y); ctx.restore(); }
// ---- type on screen: caption plates (phone-readable) that wipe open ----
function plate(ctx, s, x, y, a, o = {}) { if (a <= 0) return; const size = o.size || 52; ctx.save(); ctx.font = `${o.weight || 900} ${size}px ${o.font || F}`; ctx.textBaseline = 'middle';
  const w = ctx.measureText(s).width, al = o.align || 'left', x0 = al === 'center' ? x - w / 2 : al === 'right' ? x - w : x, pad = size * 0.38, e = eo(a), bw = w + 2 * pad;
  ctx.globalAlpha = clamp(a * 2); ctx.beginPath(); const cw = bw * e; ctx.rect(al === 'center' ? x0 - pad + (bw - cw) / 2 : al === 'right' ? x0 - pad + bw - cw : x0 - pad, y - size, cw, size * 2); ctx.clip();
  if (o.bg !== 'none') { ctx.fillStyle = o.bg || 'rgba(20,14,10,0.78)'; ctx.fillRect(x0 - pad, y - size * 0.72, bw, size * 1.44); }
  if (o.bar) { ctx.fillStyle = o.bar; ctx.fillRect(x0 - pad, y - size * 0.72, 8, size * 1.44); }
  ctx.fillStyle = o.col || '#f6ecd8'; ctx.fillText(s, x0 + (o.bar ? 6 : 0), y + 2 + (1 - e) * size * 0.5); ctx.restore(); return w; }
function source(ctx, s, a = 1) { plate(ctx, s, 70, H - 52, a, { size: 22, weight: 700, bg: 'rgba(0,0,0,0.5)' }); }
module.exports = { createCanvas, loadImage, W, H, clamp, lerp, ss, eo, ei, back, hash, F, SERIF, PAL, layer, camAt, fillShade, rect, poly, blob, sky, beams, dust, smoke, rain, flame, glow, grade, vignette, grain, plate, source };
