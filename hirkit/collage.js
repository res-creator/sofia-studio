// How It's Run paper collage (the hidden world): paper cutouts with a white paper edge, lifted shadow and light fibre texture,
// tape, torn edges, cardboard gears, paper money, a rubber stamp, and the torn-paper reveal used as a transition.
// Outlines use the rig's constant on-screen width.
const { createCanvas } = require('@napi-rs/canvas');
const K = require('../tests/mcd_collage/kit');
const R = require('./rig');
const { C, F, clamp, lerp, rr } = K;
const { INK, px, shade } = R;

// small tileable paper-fibre texture used as a pattern inside cutouts
let TEXP = null;
function texPattern(ctx) {
  if (!TEXP) {
    const c = createCanvas(256, 256), x = c.getContext('2d'); let r = 7;
    const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
    const id = x.createImageData(256, 256); for (let i = 0; i < 256 * 256; i++) { const v = 255 - Math.floor(rnd() * rnd() * 40); id.data[i * 4] = v; id.data[i * 4 + 1] = v - 2; id.data[i * 4 + 2] = v - 6; id.data[i * 4 + 3] = 255; }
    x.putImageData(id, 0, 0); x.lineCap = 'round';
    for (let i = 0; i < 120; i++) { const a = rnd() * 6.3, l = 6 + rnd() * 20, px0 = rnd() * 256, py0 = rnd() * 256; x.strokeStyle = `rgba(110,90,70,${0.06 + rnd() * 0.08})`; x.lineWidth = 0.8 + rnd();
      x.beginPath(); x.moveTo(px0, py0); x.lineTo(px0 + Math.cos(a) * l, py0 + Math.sin(a) * l); x.stroke(); }
    TEXP = c;
  }
  return ctx.createPattern(TEXP, 'repeat');
}
// paper cutout: lifted soft shadow (elev 0..3), white paper edge, flat fill, light texture, constant-width ink outline
function cutout(ctx, build, fill, o = {}) {
  const el = o.elev ?? 1, m = ctx.getTransform(), sc = Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)) || 1;
  ctx.save(); ctx.shadowColor = `rgba(60,40,20,${(0.26 / Math.sqrt(Math.max(1, el))).toFixed(3)})`; ctx.shadowBlur = 14 * el * sc; ctx.shadowOffsetY = 8 * el * sc; ctx.shadowOffsetX = 4 * el * sc;
  build(); ctx.fillStyle = '#FFFDF8'; ctx.fill(); if (o.edge !== 0) { ctx.lineJoin = 'round'; ctx.lineWidth = px(ctx, o.edge ?? 5) * 2.6; ctx.strokeStyle = '#FFFDF8'; ctx.stroke(); }
  ctx.restore();
  build(); ctx.fillStyle = fill; ctx.fill();
  if (o.tex !== false) { ctx.save(); build(); ctx.clip(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = o.tex ?? 0.75; ctx.fillStyle = texPattern(ctx); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore(); }
  if (o.lw !== 0) { build(); ctx.lineJoin = 'round'; ctx.lineWidth = px(ctx, o.lw ?? 5); ctx.strokeStyle = INK; ctx.stroke(); }
}
// jagged closed path around (cx, cy), radius r (deterministic)
function tornPath(ctx, cx, cy, r, seed = 1, jag = 0.12, n = 46) {
  ctx.beginPath();
  for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2, j = 1 + (K.hash(seed * 13 + i) - 0.5) * 2 * jag + Math.sin(a * 3 + seed) * jag * 0.4;
    const x = cx + Math.cos(a) * r * j, y = cy + Math.sin(a) * r * j * 1.05; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.closePath();
}
// torn horizontal strip edge (for sheets): fills the area below a ragged line y(x)
function tornSheet(ctx, x0, x1, y, h, fill, seed = 3) {
  const b = () => { ctx.beginPath(); ctx.moveTo(x0, y + h); for (let x = x0, i = 0; x <= x1; x += 26, i++) ctx.lineTo(x, y + (K.hash(seed + i) - 0.5) * 22); ctx.lineTo(x1, y + h); ctx.closePath(); };
  cutout(ctx, b, fill, { lw: 0, elev: 1.2 });
}
function tape(ctx, x, y, w = 120, rot = 0, a = 0.75) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha *= a; ctx.fillStyle = '#F3E9C8';
  ctx.beginPath(); ctx.moveTo(-w / 2, -18); for (let i = 0; i <= 6; i++) ctx.lineTo(w / 2 + (i % 2 ? 5 : -2), -18 + i * 6); ctx.lineTo(-w / 2, 18);
  for (let i = 6; i >= 0; i--) ctx.lineTo(-w / 2 + (i % 2 ? -5 : 2), -18 + i * 6); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(-w / 2 + 6, -12, w - 12, 6); ctx.restore();
}
// cardboard gear (cutout). a = rotation
function gear(ctx, r, n, a, col, hub = C.yellow) {
  ctx.save(); ctx.rotate(a);
  const b = () => { ctx.beginPath(); for (let i = 0; i < n; i++) { const a0 = i / n * Math.PI * 2, w = Math.PI / n * 0.55;
    ctx.lineTo(Math.cos(a0 - w * 1.25) * r * 0.84, Math.sin(a0 - w * 1.25) * r * 0.84); ctx.lineTo(Math.cos(a0 - w * 0.7) * r, Math.sin(a0 - w * 0.7) * r);
    ctx.lineTo(Math.cos(a0 + w * 0.7) * r, Math.sin(a0 + w * 0.7) * r); ctx.lineTo(Math.cos(a0 + w * 1.25) * r * 0.84, Math.sin(a0 + w * 1.25) * r * 0.84); } ctx.closePath(); };
  cutout(ctx, b, col, { elev: 1.4 });
  for (let i = 0; i < 5; i++) { const aa = i / 5 * Math.PI * 2; R.ell(ctx, Math.cos(aa) * r * 0.52, Math.sin(aa) * r * 0.52, r * 0.12, r * 0.12); ctx.fillStyle = shade(col, -0.35); ctx.fill(); }
  ctx.restore();
  ctx.save(); cutout(ctx, () => R.ell(ctx, 0, 0, r * 0.22, r * 0.22), hub, { elev: 0.6 }); R.ell(ctx, 0, 0, r * 0.07, r * 0.07); ctx.fillStyle = INK; ctx.fill(); ctx.restore();
}
// paper $5 bill (cutout). stamp 0..1 shows a red PAID stamp
function bill(ctx, s = 1, o = {}) {
  ctx.save(); ctx.scale(s, s);
  cutout(ctx, () => rr(ctx, -150, -72, 300, 144, 10), '#D7EBD0', { elev: o.elev ?? 1.5 });
  ctx.lineWidth = px(ctx, 3); ctx.strokeStyle = '#3D8C6A'; rr(ctx, -134, -58, 268, 116, 8); ctx.stroke();
  R.ell(ctx, 0, 0, 40, 46); ctx.fillStyle = '#BFDDB6'; ctx.fill(); ctx.stroke();
  ctx.font = `64px ${F.black}`; ctx.textAlign = 'center'; ctx.fillStyle = '#2F7A58'; ctx.fillText('5', -100, 22); ctx.fillText('5', 100, 22);
  ctx.font = `30px ${F.black}`; ctx.fillText('$', 0, 12);
  if (o.stamp > 0) { ctx.save(); ctx.globalAlpha = clamp(o.stamp) * 0.9; ctx.rotate(-0.18); ctx.strokeStyle = C.red; ctx.lineWidth = 7; rr(ctx, -92, -34, 184, 68, 10); ctx.stroke();
    ctx.font = `50px ${F.black}`; ctx.fillStyle = C.red; ctx.fillText('PAID', 0, 18); ctx.restore(); }
  ctx.restore();
}
function coin(ctx, r = 50) {
  cutout(ctx, () => R.ell(ctx, 0, 0, r, r), '#F4B73A', { elev: 1 });
  R.ell(ctx, 0, 0, r * 0.76, r * 0.76); ctx.lineWidth = px(ctx, 3); ctx.strokeStyle = '#C98A1E'; ctx.stroke();
  ctx.font = `${r * 1.05}px ${F.black}`; ctx.textAlign = 'center'; ctx.fillStyle = C.red; ctx.fillText('$', 0, r * 0.36);
}
// rubber stamp: handle + base (base bottom at 0)
function stamp(ctx) {
  cutout(ctx, () => { ctx.beginPath(); ctx.moveTo(-34, -170); ctx.lineTo(34, -170); ctx.lineTo(24, -70); ctx.lineTo(-24, -70); ctx.closePath(); }, '#8B5A3C');
  cutout(ctx, () => R.ell(ctx, 0, -190, 58, 40), C.red);
  cutout(ctx, () => rr(ctx, -110, -76, 220, 60, 10), '#3A3A3A');
  cutout(ctx, () => rr(ctx, -100, -22, 200, 22, 4), C.red, { elev: 0.4 });
}

// torn-paper reveal transition: under = new shot (canvas), over = old shot (canvas); hole grows at (cx, cy) with radius r (device px)
function tornReveal(ctx, overCv, underCv, cx, cy, r, seed = 5) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(overCv, 0, 0);
  if (r > 1) {
    // white torn paper edge + shadow inside the hole
    ctx.save(); tornPath(ctx, cx, cy, r * 1.06, seed, 0.13); ctx.fillStyle = '#FFFDF8'; ctx.shadowColor = 'rgba(40,25,10,0.45)'; ctx.shadowBlur = 30; ctx.fill(); ctx.restore();
    ctx.save(); tornPath(ctx, cx, cy, r, seed + 1, 0.12); ctx.clip(); ctx.drawImage(underCv, 0, 0);
    // inner shadow along the torn rim
    tornPath(ctx, cx, cy, r, seed + 1, 0.12); ctx.lineWidth = 40; ctx.strokeStyle = 'rgba(40,25,10,0.22)'; ctx.filter = 'blur(10px)'; ctx.stroke(); ctx.filter = 'none';
    ctx.restore();
  }
  ctx.restore();
}

module.exports = { texPattern, cutout, tornPath, tornSheet, tape, gear, bill, coin, stamp, tornReveal };
