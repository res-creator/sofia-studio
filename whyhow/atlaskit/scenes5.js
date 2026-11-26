// atlaskit scenes, set 5: motion-graphics toolkit (After-Effects-style moves done in code).
// mgzoom   - continuous camera dive through a chain of images (space -> region -> city), eased, cross-dissolved.
// blurcard - number / text card over a blurred, slowly drifting photo (instead of a flat navy card).
// mapline  - an animated route drawn over an image, glowing head, label that fades in at the end.
// kin      - kinetic typography overlay: lines rise out of a mask one after another, accent bar draws in.
const K = require('./core');
const { W, H, C, F, clamp, lerp, seg, E, hexA, rr, text, IMG, cover, vignette, fmtNum } = K;
const ease = E.inOut, eout = E.out;

// soft drifting, blurred photo background
function blurBg(ctx, img, t, d, o = {}) {
  ctx.save(); ctx.filter = `blur(${o.blur || 22}px) saturate(1.1)`;
  const z = lerp(1.12, 1.2, ease(clamp(t / Math.max(d, 0.1)))); cover(ctx, img, z, 0.5, 0.5); ctx.restore();
  ctx.fillStyle = `rgba(6,10,20,${o.dark == null ? 0.55 : o.dark})`; ctx.fillRect(0, 0, W, H); vignette(ctx, 0.6);
}

// kinetic lines: o = {lines:[{text,size,color}], x, y, align, at, stagger, bar}
function kin(ctx, t, o) {
  const at = o.at || 0; if (t < at) return; const x = o.x == null ? W / 2 : o.x, align = o.align || 'center'; let y = o.y || H / 2;
  (o.lines || []).forEach((l, i) => {
    const size = l.size || 96, u = eout(clamp(seg(t, at + i * (o.stagger || 0.14), at + i * (o.stagger || 0.14) + 0.7)));
    if (i > 0) y += size * 1.08;
    const lh = size * 1.1; ctx.save(); ctx.beginPath(); ctx.rect(0, y - size * 0.92, W, lh); ctx.clip();
    text(ctx, l.text, x, y + (1 - u) * lh, { size, font: l.font || F.head, align, color: l.color || C.cream, alpha: Math.min(1, u * 1.4), shadow: 18, ls: l.ls });
    ctx.restore();
  });
  if (o.bar) { const u = ease(clamp(seg(t, at + 0.25, at + 1.0))); const bw = (o.barW || 220) * u;
    ctx.fillStyle = o.barColor || C.yellow; const bx = align === 'center' ? x - bw / 2 : align === 'right' ? x - bw : x; rr(ctx, bx, y + 50, bw, 8, 4); ctx.fill(); }
}

// camera dive through images: p.imgs [{img, fx, fy, z:[a,b]}], each gets an equal slice; cross-dissolve of p.xf (fraction)
function mgzoom(ctx, t, d, p) {
  const n = p.imgs.length, sl = d / n, xf = p.xf == null ? 0.28 : p.xf;
  const draw = (k, tt) => { const im = p.imgs[k], u = clamp(tt / sl); const z = im.z || [1, 2.2];
    const zz = z[0] * Math.pow(z[1] / z[0], E.sine(u)); cover(ctx, IMG[im.img], zz, im.fx == null ? 0.5 : im.fx, im.fy == null ? 0.5 : im.fy); };
  const k = Math.min(n - 1, Math.floor(t / sl)), tt = t - k * sl; draw(k, tt);
  if (k + 1 < n && tt > sl * (1 - xf)) { const a = ease(clamp((tt - sl * (1 - xf)) / (sl * xf))); ctx.save(); ctx.globalAlpha = a; draw(k + 1, 0); ctx.restore(); }
  vignette(ctx, 0.45); overlays(ctx, t, d, p); if (p.credit) K.credit(ctx, p.credit);
}

// number card over blurred photo: p.img, p.head, p.items [{v, from, pre, suf, dec, label, at, color}] or p.lines (kinetic)
function blurcard(ctx, t, d, p) {
  blurBg(ctx, IMG[p.img], t, d, p);
  if (p.head) { const u = eout(clamp(seg(t, 0.05, 0.6))); text(ctx, p.head, W / 2, 230 - (1 - u) * 20, { size: 44, font: F.bold, align: 'center', color: hexA(C.iceL, u), ls: 3 }); }
  const items = p.items || [], n = items.length;
  items.forEach((it, i) => { const at = it.at == null ? 0.25 + i * 0.5 : it.at; if (t < at) return;
    const cx = W * (i + 0.5) / n, u = eout(clamp(seg(t, at, at + 0.9))), v = lerp(it.from == null ? 0 : it.from, it.v, u);
    ctx.save(); ctx.globalAlpha = Math.min(1, u * 1.6);
    text(ctx, (it.pre || '') + fmtNum(v, it.dec || 0) + (it.suf || ''), cx, H / 2 + 40 + (1 - u) * 30, { size: it.size || 170, font: F.head, align: 'center', color: it.color || C.cream, shadow: 24 });
    text(ctx, it.label, cx, H / 2 + 120, { size: 38, font: F.bold, align: 'center', color: C.yellow }); ctx.restore(); });
  if (p.bars) p.bars.forEach((b, i) => { const at = b.at || 0.3 + i * 0.6; const u = ease(clamp(seg(t, at, at + 1.1))); const y = 430 + i * 170, x0 = 260, bw = 1400 * b.v / p.barMax;
    text(ctx, b.label, x0, y - 18, { size: 36, font: F.bold, color: hexA(C.cream, Math.min(1, u * 2)) });
    ctx.fillStyle = hexA(C.cream, 0.12); rr(ctx, x0, y, 1400, 90, 10); ctx.fill(); ctx.fillStyle = b.color || C.yellow; rr(ctx, x0, y, Math.max(2, bw * u), 90, 10); ctx.fill();
    if (u > 0.05) text(ctx, b.text, x0 + Math.max(2, bw * u) + 24, y + 64, { size: 56, font: F.head, color: C.cream, alpha: u }); });
  for (const o of p.kins || []) kin(ctx, t, o);
  if (p.source) text(ctx, p.source, W / 2, H - 50, { size: 22, font: F.reg, align: 'center', color: 'rgba(255,255,255,0.6)' });
  if (p.credit) K.credit(ctx, p.credit);
}

// route drawn over an image: p.img, p.kb, p.pts [[fx,fy]...] (fractions of the frame), p.at, p.dur, p.label {text, at}
function mapline(ctx, t, d, p) {
  K.kenBurns(ctx, IMG[p.img], t, d, p.kb || { z: [1.05, 1.15] }); ctx.fillStyle = 'rgba(6,10,20,0.25)'; ctx.fillRect(0, 0, W, H); vignette(ctx, 0.5);
  const pts = p.pts.map(([x, y]) => [x * W, y * H]); const u = ease(clamp(seg(t, p.at || 0.3, (p.at || 0.3) + (p.dur || 2.2))));
  const L = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(l); tot += l; }
  let rem = tot * u, head = pts[0]; ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const pass of [{ w: 22, c: hexA(p.color || '#4FC3F7', 0.25) }, { w: 8, c: p.color || '#4FC3F7' }]) {
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); let r = rem;
    for (let i = 1; i < pts.length && r > 0; i++) { const f = Math.min(1, r / L[i - 1]); const x = lerp(pts[i - 1][0], pts[i][0], f), y = lerp(pts[i - 1][1], pts[i][1], f); ctx.lineTo(x, y); head = [x, y]; r -= L[i - 1]; }
    ctx.strokeStyle = pass.c; ctx.lineWidth = pass.w; ctx.stroke(); }
  if (u > 0) { const pr = 1 + 0.25 * Math.sin(t * 6); ctx.fillStyle = '#FFFFFF'; ctx.shadowColor = p.color || '#4FC3F7'; ctx.shadowBlur = 30; ctx.beginPath(); ctx.arc(head[0], head[1], 12 * pr, 0, 7); ctx.fill(); }
  ctx.restore();
  for (const lb of p.labels || []) { const a = eout(clamp(seg(t, lb.at, lb.at + 0.6))); if (a <= 0) continue; const [x, y] = [lb.x * W, lb.y * H];
    ctx.save(); ctx.globalAlpha = a; K.chip(ctx, lb.text, x, y + (1 - a) * 12, { size: lb.size || 44, align: lb.align || 'center', bg: lb.bg, color: lb.colorT }); ctx.restore(); }
  overlays(ctx, t, d, p); if (p.credit) K.credit(ctx, p.credit);
}

function overlays(ctx, t, d, p) { const S = require('./scenes'); S.overlays(ctx, t, d, p); }
module.exports = { mgzoom, blurcard, mapline, kin };
