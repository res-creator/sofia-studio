// LEGO film: draw a keyed sprite INTO a painted plate instead of on top of it (film-local helper; figmakit is unchanged).
//   1. cast shadow: the sprite's own silhouette laid on the floor/table, pushed away from the light (window light from the RIGHT)
//   2. contact shadow: a tight dark band where the object touches the surface
//   3. light: warm light on the right side, shade on the left side (same direction as the plate)
//   4. colour match: saturation/contrast pulled toward the plate, a little warmth, a hair of softness (painted, not "3D render")
//   5. atmosphere: far objects get haze in the plate's air colour and a little blur
// Usage: const I = require('./integrate'); I.place(ctx, im, x, y, s, { depth: 0..1 (0 = far, 1 = near), r, flip, look })
const { createCanvas } = require('@napi-rs/canvas');
const LOOKS = {   // per-plate light + air (one value per plate keeps every shot consistent)
  table:     { warm: 'rgba(255,196,120,0.16)', shade: 'rgba(60,30,10,0.30)', haze: '226,178,120', filter: 'saturate(0.84) sepia(0.12) contrast(0.95)', shadow: 'rgba(52,24,6,', skew: 1.10, lay: -0.06 },
  warehouse: { warm: 'rgba(255,214,160,0.12)', shade: 'rgba(20,24,40,0.30)', haze: '170,180,200', filter: 'saturate(0.85) contrast(0.93)', shadow: 'rgba(16,14,20,', skew: 0.35, lay: -0.05 },
};
let TMP = null;
const tmp = (w, h) => { if (!TMP || TMP.width < w || TMP.height < h) TMP = createCanvas(Math.max(w, TMP ? TMP.width : 0), Math.max(h, TMP ? TMP.height : 0)); const c = TMP.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.filter = 'none'; c.clearRect(0, 0, w, h); return c; };

// Cached: the lit / colour-matched / blurred sprite and its two shadows are baked once per (image, size, flip, look, depth, extra)
// and re-used every frame (only position, rotation and alpha change per frame) -> ~10x faster renders.
let IDS = 0; const CACHE = new Map();
function bake(im, w, h, o, L, depth, flip) {
  im.__id = im.__id || ++IDS; const q = v => Math.round(v);
  const key = [im.__id, q(w), q(h), flip ? 1 : 0, o.look || 'table', Math.round(depth * 10), o.extra || '', o.haze ?? '', o.noShadow ? 1 : 0].join('|');
  let e = CACHE.get(key); if (e) return e;
  if (CACHE.size > 900) CACHE.delete(CACHE.keys().next().value);
  const PW = Math.ceil(w) + 4, PH = Math.ceil(h) + 4, pad = Math.ceil(Math.max(6, w * 0.08));
  // lit sprite (flip baked in)
  let c = tmp(PW, PH); c.save(); if (flip) { c.translate(PW, 0); c.scale(-1, 1); } c.drawImage(im, 2, 2, w, h); c.restore(); c.globalCompositeOperation = 'source-atop';
  const g = c.createLinearGradient(0, 0, PW, 0); g.addColorStop(0, L.shade); g.addColorStop(0.55, 'rgba(0,0,0,0)'); g.addColorStop(1, L.warm); c.fillStyle = g; c.fillRect(0, 0, PW, PH);
  const hz = (1 - depth) * (o.haze ?? 0.26); if (hz > 0) { c.fillStyle = `rgba(${L.haze},${hz})`; c.fillRect(0, 0, PW, PH); }
  const lit = createCanvas(PW + 2 * pad, PH + 2 * pad), lc = lit.getContext('2d');
  lc.filter = `${L.filter} ${o.extra || ''} blur(${(0.3 + (1 - depth) * 0.6).toFixed(2)}px)`; lc.drawImage(TMP, 0, 0, PW, PH, pad, pad, PW, PH);
  e = { lit, pad, PW, PH };
  if (!o.noShadow) {
    // silhouette of the (flipped) sprite
    const sil = createCanvas(PW, PH), sc = sil.getContext('2d'); sc.save(); if (flip) { sc.translate(PW, 0); sc.scale(-1, 1); } sc.drawImage(im, 2, 2, w, h); sc.restore();
    sc.globalCompositeOperation = 'source-in'; sc.fillStyle = '#000'; sc.fillRect(0, 0, PW, PH);
    // cast shadow: skewed + squashed, blurred, baked into its own canvas; origin = the sprite's base point
    const bx = Math.abs(L.skew) * h + PW + 4 * pad, by = Math.abs(L.lay) * PW + h * 0.2 + 4 * pad, cast = createCanvas(Math.ceil(bx * 2), Math.ceil(by * 2)), cc = cast.getContext('2d');
    cc.translate(bx, by); cc.filter = `blur(${Math.max(1.5, w * 0.035)}px)`; cc.transform(1, 0, L.skew, L.lay, 0, 0); cc.drawImage(sil, -w * 0.5 - 2, -h * (o.ay ?? 0.97) - 2);
    // contact: the footprint
    const kx = PW + 2 * pad, ky = PH * 0.3 + 2 * pad, cont = createCanvas(Math.ceil(kx * 2), Math.ceil(ky * 2)), kc = cont.getContext('2d');
    kc.translate(kx, ky); kc.filter = `blur(${Math.max(1, w * 0.012)}px)`; kc.scale(1.02, 0.30); kc.drawImage(sil, -w * 0.5 - 2, -h - 2);
    Object.assign(e, { cast, bx, by, cont, kx, ky });
  }
  CACHE.set(key, e); return e;
}
function place(ctx, im, x, y, s, o = {}) {
  const L = LOOKS[o.look || 'table'], pre = im.pre || 1, w = im.width / pre * s, h = im.height / pre * s, depth = o.depth ?? 0.6, ay = o.ay ?? 0.97;
  if (w < 1 || h < 1) return { x, y, w, h };
  const e = bake(im, w, h, o, L, depth, !!o.flip), a = o.a ?? 1;
  if (!o.noShadow && e.cast) {
    ctx.save(); ctx.globalAlpha *= Math.min(1, (o.sa ?? 0.30) * 1.45) * a; ctx.drawImage(e.cast, x - e.bx, y - e.by); ctx.restore();
    ctx.save(); ctx.globalAlpha *= Math.min(1, (o.ca ?? 0.5) * 1.5) * a; ctx.drawImage(e.cont, x - e.kx, y + h * (1 - ay) - e.ky); ctx.restore();
  }
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.r || 0); ctx.globalAlpha *= a;
  ctx.drawImage(e.lit, -w * 0.5 - 2 - e.pad, -h * ay - 2 - e.pad); ctx.restore();
  return { x, y, w, h };
}
module.exports = { place, LOOKS };
