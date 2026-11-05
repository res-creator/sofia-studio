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

function place(ctx, im, x, y, s, o = {}) {
  const L = LOOKS[o.look || 'table'], pre = im.pre || 1, w = im.width / pre * s, h = im.height / pre * s, depth = o.depth ?? 0.6;
  const ay = o.ay ?? 0.97, fx = o.flip ? -1 : 1, PW = Math.ceil(w) + 4, PH = Math.ceil(h) + 4;
  // --- 1 + 2: shadows (skipped for pieces resting ON another object: o.noShadow)
  if (!o.noShadow) {
    // silhouette
    let c = tmp(PW, PH); c.drawImage(im, 2, 2, w, h); c.globalCompositeOperation = 'source-in'; c.fillStyle = '#000'; c.fillRect(0, 0, PW, PH);
    ctx.save(); ctx.translate(x, y); ctx.globalAlpha *= (o.sa ?? 0.30) * (o.a ?? 1); ctx.filter = `blur(${Math.max(1.5, w * 0.035)}px)`;
    ctx.transform(1, 0, L.skew, L.lay, 0, 0); ctx.scale(fx, 1);
    ctx.drawImage(TMP, 0, 0, PW, PH, -w * 0.5 - 2, -h * ay - 2, PW, PH); ctx.restore();
    // contact: the object's own footprint (its silhouette squashed onto the surface), dark and tight
    ctx.save(); ctx.translate(x, y + h * (1 - ay)); ctx.globalAlpha *= (o.ca ?? 0.5) * (o.a ?? 1); ctx.filter = `blur(${Math.max(1, w * 0.012)}px)`;
    ctx.scale(fx * 1.02, 0.30); ctx.drawImage(TMP, 0, 0, PW, PH, -w * 0.5 - 2, -h - 2, PW, PH); ctx.restore();
  }
  // --- 3 + 4 + 5: lit, matched, hazed sprite
  let c = tmp(PW, PH); c.drawImage(im, 2, 2, w, h); c.globalCompositeOperation = 'source-atop';
  const g = c.createLinearGradient(o.flip ? PW : 0, 0, o.flip ? 0 : PW, 0);   // gradient in screen space: shade on the left, light on the right
  g.addColorStop(0, L.shade); g.addColorStop(0.55, 'rgba(0,0,0,0)'); g.addColorStop(1, L.warm); c.fillStyle = g; c.fillRect(0, 0, PW, PH);
  const hz = (1 - depth) * (o.haze ?? 0.26); if (hz > 0) { c.fillStyle = `rgba(${L.haze},${hz})`; c.fillRect(0, 0, PW, PH); }
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.r || 0); ctx.scale(fx, 1); ctx.globalAlpha *= o.a ?? 1;
  ctx.filter = `${L.filter} blur(${(0.3 + (1 - depth) * 0.6).toFixed(2)}px)`;
  ctx.drawImage(TMP, 0, 0, PW, PH, -w * 0.5 - 2, -h * ay - 2, PW, PH); ctx.restore();
  return { x, y, w, h };
}
module.exports = { place, LOOKS };
