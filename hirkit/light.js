// How It's Run lighting: per-scene light setups (no automatic darkening), rim light, screen glow on characters,
// cast shadows, atmospheric haze and a light colour grade. Works on any canvas (full or half res) through offscreen buffers.
const { createCanvas } = require('@napi-rs/canvas');
const K = require('../tests/mcd_collage/kit');
const { clamp } = K;

// lighting presets: key colour/temperature, ambient grade, haze colour. Pick per scene from the story, not by default.
const LIGHTS = {
  day: { key: '#FFF1D2', rim: '#FFF6E0', grade: 'rgba(255,214,150,0.16)', haze: 'rgba(255,248,232,', shadow: 'rgba(70,45,25,' },
  golden: { key: '#FFD08A', rim: '#FFDCA0', grade: 'rgba(255,170,90,0.28)', haze: 'rgba(255,226,180,', shadow: 'rgba(80,40,20,' },
  evening: { key: '#FFC27A', rim: '#FFB070', grade: 'rgba(120,90,200,0.22)', haze: 'rgba(120,110,170,', shadow: 'rgba(30,20,50,' },
  office: { key: '#F2F6FF', rim: '#E6F0FF', grade: 'rgba(160,200,255,0.14)', haze: 'rgba(235,242,255,', shadow: 'rgba(30,40,60,' },
  dark: { key: '#BFD4FF', rim: '#9FC0FF', grade: 'rgba(40,60,120,0.3)', haze: 'rgba(40,50,90,', shadow: 'rgba(0,0,10,' },
};

const BUF = {};
function buf(name, w, h) { const b = BUF[name]; if (b && b.width === w && b.height === h) return b; return (BUF[name] = createCanvas(w, h)); }
const clear = (c) => { const x = c.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; x.filter = 'none'; x.clearRect(0, 0, c.width, c.height); return x; };

// draw(ctx) is drawn into a buffer with the same transform as ctx, then composited with optional
//   rim: { dir: [dx, dy] toward the light (screen), color, w (px), a }  -> bright edge on the lit side of the silhouette
//   glow: { x, y, r, color, a } in device px                          -> light (screen, terminal) that falls only on this character
//   tint: { color, a, x0, y0, x1, y1 }                                -> multiply gradient (white -> color) only on this character (form shade)
function lit(ctx, draw, o = {}) {
  const W = ctx.canvas.width, H = ctx.canvas.height, A = buf('litA', W, H), ax = clear(A);
  ax.setTransform(ctx.getTransform()); draw(ax); ax.setTransform(1, 0, 0, 1, 0, 0);
  ax.globalCompositeOperation = 'source-over';
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(A, 0, 0);
  // light effects are masked to this character: form shade multiplies, screen glow adds
  const masked = (fill, op, a) => { const G = buf('litG', W, H), gx = clear(G); gx.drawImage(A, 0, 0); gx.globalCompositeOperation = 'source-in'; gx.fillStyle = fill; gx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = op; ctx.globalAlpha = a; ctx.drawImage(G, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; };
  if (o.tint) { const t = o.tint, g = ctx.createLinearGradient(t.x0, t.y0, t.x1, t.y1); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, t.color); masked(g, 'multiply', t.a ?? 1); }
  if (o.glow) { const g0 = o.glow, g = ctx.createRadialGradient(g0.x, g0.y, 0, g0.x, g0.y, g0.r); g.addColorStop(0, g0.color); g.addColorStop(1, 'rgba(0,0,0,1)'); masked(g, 'lighter', g0.a ?? 0.5); }
  if (o.rim) {
    const r = o.rim, B = buf('litB', W, H), bx = clear(B), n = Math.hypot(r.dir[0], r.dir[1]) || 1, w = r.w ?? 5;
    bx.drawImage(A, 0, 0); bx.globalCompositeOperation = 'source-in'; bx.fillStyle = r.color; bx.fillRect(0, 0, W, H);
    bx.globalCompositeOperation = 'destination-out'; bx.drawImage(A, -r.dir[0] / n * w, -r.dir[1] / n * w);
    ctx.globalAlpha = r.a ?? 0.9; ctx.drawImage(B, 0, 0);
  }
  ctx.restore();
}

// cast shadow on the floor: draw(ctx) is drawn in world space under a floor projection (feet at floorY, light from the back-left by default),
// flattened into one colour and composited once (no double darkening where limbs overlap)
function castShadow(ctx, draw, o = {}) {
  const W = ctx.canvas.width, H = ctx.canvas.height, A = buf('shadowA', W, H), ax = clear(A);
  const k = o.skew ?? 0.55, sq = o.squash ?? 0.22, fy = o.floorY ?? 0, fx = o.x ?? 0;
  ax.setTransform(ctx.getTransform()); ax.translate(fx, fy); ax.transform(1, 0, -k, -sq, 0, 0); ax.translate(-fx, -fy); draw(ax);
  ax.setTransform(1, 0, 0, 1, 0, 0); ax.globalCompositeOperation = 'source-in'; ax.fillStyle = o.color || 'rgb(70,45,25)'; ax.fillRect(0, 0, W, H);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = o.a ?? 0.22; if (o.blur) ctx.filter = `blur(${o.blur}px)`; ctx.drawImage(A, 0, 0); ctx.restore();
}

// additive light glow (lamps, screens, windows) in the current transform
function glow(ctx, x, y, r, color, a = 0.5) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a; const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.restore();
}
// light shafts from a window: quads from the window down to the floor (current transform)
function shafts(ctx, quads, color, a = 0.12, t = 0) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  quads.forEach((q, i) => { const g = ctx.createLinearGradient(q[0][0], q[0][1], q[3][0], q[3][1]); g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = a * (0.85 + 0.15 * Math.sin(t * 0.7 + i * 1.7)); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(...q[0]); ctx.lineTo(...q[1]); ctx.lineTo(...q[2]); ctx.lineTo(...q[3]); ctx.closePath(); ctx.fill(); });
  ctx.restore();
}
// atmospheric depth: a thin veil of the scene's haze colour over far layers (screen space)
function haze(ctx, preset, a = 0.18, y0 = 0, y1 = null) {
  const W = ctx.canvas.width, H = ctx.canvas.height, P = LIGHTS[preset] || LIGHTS.day, g = ctx.createLinearGradient(0, y0, 0, y1 ?? H);
  g.addColorStop(0, P.haze + a + ')'); g.addColorStop(1, P.haze + a * 0.35 + ')');
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
}
// floating dust in a light beam
function dust(ctx, t, x0, y0, w, h, n = 30, col = 'rgba(255,248,225,') {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) { const hh = K.hash(i * 3.1), x = x0 + K.hash(i) * w + Math.sin(t * 0.5 + i) * 30, y = y0 + ((K.hash(i + 40) * h - t * 18 * (0.4 + hh)) % h + h) % h;
    ctx.fillStyle = col + (0.18 + 0.2 * Math.sin(t * 2 + i)).toFixed(3) + ')'; ctx.beginPath(); ctx.arc(x, y, 2.5 + hh * 4, 0, 7); ctx.fill(); }
  ctx.restore();
}
// final grade: colour temperature (soft-light), gentle vignette. strength stays low on purpose
function grade(ctx, preset, o = {}) {
  const W = ctx.canvas.width, H = ctx.canvas.height, P = LIGHTS[preset] || LIGHTS.day;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = P.grade; ctx.fillRect(0, 0, W, H);
  const v = o.vignette ?? 0.18; if (v > 0) { ctx.globalCompositeOperation = 'multiply'; const g = ctx.createRadialGradient(W / 2, H * 0.46, H * 0.32, W / 2, H * 0.46, H * 0.78);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, `rgba(90,70,60,${v})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
  ctx.restore();
}

module.exports = { LIGHTS, buf, clear, lit, castShadow, glow, shafts, haze, dust, grade };
