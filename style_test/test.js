// STYLE TEST (not an episode): "The Pepsi Fighter Jet" in a cinematic cartoon 2D style — expressive characters with real faces
// (eyes with lids and highlights, thick brows, nose, mouth shapes, hair, hands), soft key light + coloured rim light, depth of field,
// bloom, vignette, grain. 15 s, silent, 1080x1920, 30 fps. Self-contained: it does not use hirkit and is not a reusable engine.
// Usage: node test.js video out.mp4 | sheet out.png | emotions out.png | frame t out.png
const { createCanvas } = require('@napi-rs/canvas');
const { spawn } = require('child_process');
const fs = require('fs');
const K = require('../tests/mcd_collage/kit'); // fonts only
const F = K.F.black;
const W = 1080, H = 1920, FPS = 30, T = 15;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), lerp = (a, b, u) => a + (b - a) * u, seg = (t, a, b) => clamp((t - a) / (b - a));
const ease = u => u * u * (3 - 2 * u), easeOut = u => 1 - Math.pow(1 - u, 3), back = (u, s = 1.8) => 1 + (s + 1) * Math.pow(u - 1, 3) + s * Math.pow(u - 1, 2);
const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const mixc = (a, b, u) => { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)), A = p(a), B = p(b); return '#' + A.map((x, i) => Math.round(lerp(x, B[i], u)).toString(16).padStart(2, '0')).join(''); };
const mk = (w = W, h = H) => { const c = createCanvas(w, h); return [c, c.getContext('2d')]; };

// ======================= CHARACTER =======================
const SKIN = '#F1B896', SKIN_D = '#C98667', SKIN_L = '#FFD9BF', HAIR = '#3A2415', JACKET = '#D39636', JACKET_D = '#9C6A1C', CREAM = '#FFF6E4', INK = '#2A1710';
const EMO = {
  neutral:   { by: [0, 0],    ba: [0, 0],        lid: 0.14, wide: 1.0,  m: { w: 32, open: 0,  curve: 3,  sk: 0 },  blush: 0.08, look: [0, 0] },
  confident: { by: [-4, -13], ba: [0.07, -0.08], lid: 0.30, wide: 1.0,  m: { w: 38, open: 0,  curve: 15, sk: 8 },  blush: 0.18, look: [0, 0] },
  surprised: { by: [-30, -30], ba: [-0.1, -0.1], lid: 0.0,  wide: 1.3,  m: { w: 21, open: 46, curve: 0,  sk: 0 },  blush: 0.05, look: [0, 0] },
  excited:   { by: [-16, -16], ba: [-0.04, -0.04], lid: 0.12, wide: 1.12, m: { w: 48, open: 28, curve: 28, sk: 0 }, blush: 0.28, look: [0, 0] },
  thinking:  { by: [-18, 2],  ba: [-0.12, 0.14], lid: 0.30, wide: 1.0,  m: { w: 24, open: 0,  curve: -3, sk: -7 }, blush: 0.05, look: [-0.6, -0.8] },
  worried:   { by: [-7, -7],  ba: [-0.32, -0.32], lid: 0.16, wide: 1.05, m: { w: 30, open: 0,  curve: -15, sk: 0 }, blush: 0.04, look: [0, 0.2] },
};
function emo(a, b = a, u = 0) { // blend two emotions (numbers, arrays, mouth); look is overridden by the caller when needed
  const A = typeof a === 'string' ? EMO[a] : a, B = typeof b === 'string' ? EMO[b] : b, o = {};
  for (const k of Object.keys(A)) o[k] = Array.isArray(A[k]) ? A[k].map((x, i) => lerp(x, B[k][i], u)) : typeof A[k] === 'object' ? Object.fromEntries(Object.keys(A[k]).map(q => [q, lerp(A[k][q], B[k][q], u)])) : lerp(A[k], B[k], u);
  return o;
}
function brow(ctx, cx, cy, side, y, a) { // tapered thick brow; side -1 = screen left (inner end to the right)
  const hw = 36, dy = Math.sin(a) * hw; ctx.save(); ctx.translate(cx, cy + y);
  const ix = -side * hw, ox = side * hw; // inner end is towards the nose (x = 0)
  ctx.beginPath(); ctx.moveTo(ox, -4 - dy * 0.0 - dy); ctx.quadraticCurveTo((ix + ox) / 2, -17 - dy * 0.0, ix, 0 + dy - 2); ctx.lineTo(ix, 13 + dy); ctx.quadraticCurveTo((ix + ox) / 2, 2, ox, 6 - dy); ctx.closePath();
  ctx.fillStyle = HAIR; ctx.fill(); ctx.restore();
}
function eye(ctx, cx, cy, side, e, glint, tint) {
  const rx = 27 * e.wide, ry = 23 * e.wide + (e.wide > 1.1 ? 3 : 0), lx = e.look[0] * 8, ly = e.look[1] * 6;
  ctx.save(); ctx.translate(cx, cy);
  ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, 7); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.clip();
  const sh = ctx.createLinearGradient(0, -ry, 0, ry); sh.addColorStop(0, 'rgba(120,70,60,0.35)'); sh.addColorStop(0.4, 'rgba(120,70,60,0)'); ctx.fillStyle = sh; ctx.fillRect(-rx, -ry, 2 * rx, 2 * ry);
  const ir = 15.5 * (e.wide > 1.1 ? 0.95 : 1), ix = lx * 1.2, iy = ly * 1.2;
  const g = ctx.createRadialGradient(ix, iy, 2, ix, iy, ir); g.addColorStop(0, '#6B3E1F'); g.addColorStop(0.7, '#3E2210'); g.addColorStop(1, '#1D0F07'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ix, iy, ir, 0, 7); ctx.fill();
  ctx.fillStyle = '#0B0604'; ctx.beginPath(); ctx.arc(ix, iy, ir * 0.48 * (e.wide > 1.1 ? 0.8 : 1), 0, 7); ctx.fill();
  if (tint) { ctx.fillStyle = tint; ctx.fillRect(ix - 8, iy - 7, 16, 10); } // a reflected screen
  ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.beginPath(); ctx.arc(ix - 6 + (glint || 0), iy - 6, 5.2, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(ix + 6, iy + 6, 2.4, 0, 7); ctx.fill();
  // upper lid (skin) covers the top part
  const lid = clamp(e.lid + e.blink * 1.1, 0, 1.1), edge = -ry + lid * 2 * ry;
  ctx.fillStyle = SKIN; ctx.beginPath(); ctx.rect(-rx - 4, -ry - 12, 2 * rx + 8, edge + ry + 12 + 1); ctx.fill();
  ctx.fillStyle = 'rgba(120,70,50,0.28)'; ctx.fillRect(-rx - 4, edge - 6, 2 * rx + 8, 6);
  ctx.restore();
  ctx.save(); ctx.translate(cx, cy); ctx.strokeStyle = INK; ctx.lineCap = 'round';
  ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, Math.PI * 1.07, Math.PI * 1.93); ctx.save(); ctx.translate(0, 0); ctx.stroke(); ctx.restore();
  ctx.lineWidth = 2.6; ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.ellipse(0, -5 - 5 * e.wide, rx * 0.95, ry * 0.9, 0, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); // crease
  ctx.restore();
}
function mouth(ctx, cx, cy, m) {
  ctx.save(); ctx.translate(cx, cy); const w = m.w, c = m.curve, o = m.open, sk = m.sk;
  const L = [-w, -c * 0.45 + sk * 0.5], Rr = [w, -c * 0.45 - sk * 0.5];
  ctx.beginPath(); ctx.moveTo(L[0], L[1]); ctx.quadraticCurveTo(0, c * 0.35 - o * 0.1, Rr[0], Rr[1]);
  if (o > 3) { ctx.quadraticCurveTo(0, c * 0.5 + o * 1.7, L[0], L[1]); ctx.closePath(); ctx.fillStyle = '#5B1B22'; ctx.fill();
    ctx.save(); ctx.clip(); const tg = ctx.createLinearGradient(0, 0, 0, o * 0.9); tg.addColorStop(0, '#FFFFFF'); tg.addColorStop(1, '#E8DCD2'); ctx.fillStyle = tg; ctx.fillRect(-w, -c, 2 * w, Math.min(o * 0.5, 15) + c * 0.2);
    ctx.fillStyle = '#C45A62'; ctx.beginPath(); ctx.ellipse(0, o * 1.0 + c * 0.2, w * 0.45, o * 0.3, 0, 0, 7); ctx.fill(); ctx.restore();
    ctx.strokeStyle = '#7A2E34'; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(L[0], L[1]); ctx.quadraticCurveTo(0, c * 0.35 - o * 0.1, Rr[0], Rr[1]); ctx.quadraticCurveTo(0, c * 0.5 + o * 1.7, L[0], L[1]); ctx.stroke(); }
  else { ctx.strokeStyle = '#8A3A3A'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.stroke();
    if (c > 8) { ctx.strokeStyle = 'rgba(160,90,70,0.5)'; ctx.lineWidth = 3; for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * (w + 6), -c * 0.2 - sk * 0.5 * s, 9, s > 0 ? -1.2 : 1.9 - Math.PI * 0.35, s > 0 ? 1.2 : 1.9 + Math.PI * 0.4); ctx.stroke(); } } }
  ctx.restore();
}
// draws the man (bust) with the neck base at (0,0); world units ~ head radius 100. o: { e (emotion), blink, tilt, yaw, hair (bool), body (bool), back (bool), tint }
function man(ctx, o = {}) {
  const e = { ...(o.e || EMO.neutral), blink: o.blink || 0 }, yaw = o.yaw || 0; ctx.save(); ctx.rotate(o.tilt || 0);
  // body
  if (o.body !== false) {
    ctx.beginPath(); ctx.moveTo(-250, 360); ctx.bezierCurveTo(-250, 110, -180, 30, -75, 14); ctx.lineTo(75, 14); ctx.bezierCurveTo(180, 30, 250, 110, 250, 360); ctx.closePath();
    const g = ctx.createLinearGradient(-250, 0, 250, 0); g.addColorStop(0, '#E3A94A'); g.addColorStop(0.55, JACKET); g.addColorStop(1, JACKET_D); ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(70,40,10,0.55)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-120, 36); ctx.quadraticCurveTo(-150, 200, -140, 360); ctx.moveTo(120, 36); ctx.quadraticCurveTo(150, 200, 140, 360); ctx.stroke();
    // shirt + collar
    if (!o.back) { ctx.beginPath(); ctx.moveTo(-62, 10); ctx.lineTo(0, 120); ctx.lineTo(62, 10); ctx.closePath(); ctx.fillStyle = CREAM; ctx.fill();
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 14, 100); ctx.lineTo(s * 86, 20); ctx.lineTo(s * 108, 70); ctx.lineTo(s * 40, 150); ctx.closePath(); ctx.fillStyle = mixc(JACKET, '#FFFFFF', 0.12); ctx.fill(); ctx.strokeStyle = 'rgba(70,40,10,0.5)'; ctx.stroke(); } }
  }
  // neck
  ctx.beginPath(); ctx.moveTo(-40, -40); ctx.lineTo(-44, 30); ctx.quadraticCurveTo(0, 62, 44, 30); ctx.lineTo(40, -40); ctx.closePath(); ctx.fillStyle = SKIN_D; ctx.fill();
  // ears
  ctx.save(); ctx.translate(yaw * 14, 0); for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 106, -102, 17, 30, s * 0.1, 0, 7); ctx.fillStyle = SKIN_D; ctx.fill(); ctx.beginPath(); ctx.ellipse(s * 106, -100, 8, 17, s * 0.1, 0, 7); ctx.fillStyle = '#B46F57'; ctx.fill(); } ctx.restore();
  // head
  const head = () => { ctx.beginPath(); ctx.moveTo(0, -236); ctx.bezierCurveTo(88, -236, 114, -170, 110, -100); ctx.bezierCurveTo(106, -34, 62, 24, 0, 24); ctx.bezierCurveTo(-62, 24, -106, -34, -110, -100); ctx.bezierCurveTo(-114, -170, -88, -236, 0, -236); ctx.closePath(); };
  head(); const hg = ctx.createLinearGradient(-110, -120, 110, -60); hg.addColorStop(0, SKIN_L); hg.addColorStop(0.5, SKIN); hg.addColorStop(1, SKIN_D); ctx.fillStyle = hg; ctx.fill();
  ctx.save(); head(); ctx.clip();
  if (o.back) { ctx.fillStyle = HAIR; ctx.fillRect(-130, -250, 260, 300); ctx.restore(); ctx.restore(); return; }
  // soft shading: jaw/chin, temple, under hair
  let sg = ctx.createRadialGradient(-30, -110, 40, 0, -80, 150); sg.addColorStop(0, 'rgba(255,230,210,0)'); sg.addColorStop(1, 'rgba(150,80,60,0.28)'); ctx.fillStyle = sg; ctx.fillRect(-130, -250, 260, 300);
  ctx.fillStyle = 'rgba(130,60,50,' + (0.10 + 0.18 * (e.blush || 0)) + ')'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 64 + yaw * 14, -50, 32, 20, 0, 0, 7); ctx.fill(); }
  const fx = yaw * 14; // facial features shift with the head turn
  for (const [s, i] of [[-1, 0], [1, 1]]) { eye(ctx, s * 44 + fx, -112, s, e, i ? 0 : 0, o.eyeTint); }
  brow(ctx, -44 + fx, -150, -1, e.by[0], e.ba[0]); brow(ctx, 44 + fx, -150, 1, e.by[1], e.ba[1]);
  // nose
  ctx.fillStyle = 'rgba(150,80,60,0.38)'; ctx.beginPath(); ctx.moveTo(fx + 6, -96); ctx.quadraticCurveTo(fx + 20, -62, fx + 16, -54); ctx.quadraticCurveTo(fx, -46, fx - 16, -54); ctx.quadraticCurveTo(fx - 8, -64, fx - 6, -96); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,235,220,0.55)'; ctx.beginPath(); ctx.ellipse(fx - 6, -66, 7, 11, 0.2, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(90,40,30,0.5)'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(fx + s * 9, -53, 5, 3.4, 0, 0, 7); ctx.fill(); }
  mouth(ctx, fx, -10, e.m);
  ctx.restore();
  // hair
  if (o.hair !== false) {
    ctx.beginPath(); ctx.moveTo(-116, -112); ctx.bezierCurveTo(-134, -262, -30, -302, 62, -276); ctx.bezierCurveTo(124, -256, 134, -176, 114, -108); ctx.bezierCurveTo(104, -168, 66, -204, 8, -198); ctx.bezierCurveTo(-44, -196, -90, -176, -116, -112); ctx.closePath();
    const hgr = ctx.createLinearGradient(-110, -290, 110, -150); hgr.addColorStop(0, '#6A4224'); hgr.addColorStop(0.4, HAIR); hgr.addColorStop(1, '#22130B'); ctx.fillStyle = hgr; ctx.fill();
    ctx.strokeStyle = 'rgba(255,220,170,0.35)'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-70, -246); ctx.quadraticCurveTo(-10, -276, 50, -262); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-10, -200); ctx.bezierCurveTo(30, -214, 78, -214, 98, -170); ctx.strokeStyle = 'rgba(20,10,5,0.5)'; ctx.lineWidth = 5; ctx.stroke();
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 113, -160); ctx.quadraticCurveTo(s * 112, -110, s * 104, -88); ctx.quadraticCurveTo(s * 100, -110, s * 98, -150); ctx.closePath(); ctx.fillStyle = HAIR; ctx.fill(); }
  }
  ctx.restore();
}
function hand(ctx, x, y, rot, s, o = {}) { // a hand seen from the back, fingers wrapped over an edge
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s * (o.flip ? -1 : 1), s);
  const sk = o.skin || SKIN, dk = mixc(sk, '#8A4A38', 0.4);
  ctx.beginPath(); ctx.ellipse(0, 40, 62, 74, 0, 0, 7); const g = ctx.createLinearGradient(-60, 0, 60, 0); g.addColorStop(0, SKIN_L); g.addColorStop(1, dk); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(80,40,25,0.55)'; ctx.lineWidth = 4; ctx.stroke();
  for (let i = 0; i < 4; i++) { const fx = -42 + i * 28, fl = 70 + (i === 1 || i === 2 ? 12 : 0) - (i === 3 ? 10 : 0); ctx.beginPath(); ctx.moveTo(fx - 13, -2); ctx.lineTo(fx - 13, -fl); ctx.arc(fx, -fl, 13, Math.PI, 0); ctx.lineTo(fx + 13, -2); ctx.closePath(); ctx.fillStyle = sk; ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,225,205,0.7)'; ctx.beginPath(); ctx.ellipse(fx - 3, -fl + 4, 5, 8, 0, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(120,60,45,0.5)'; ctx.beginPath(); ctx.moveTo(fx - 9, -fl * 0.45); ctx.lineTo(fx + 9, -fl * 0.45); ctx.stroke(); ctx.strokeStyle = 'rgba(80,40,25,0.55)'; }
  ctx.beginPath(); ctx.ellipse(-68, 24, 18, 44, -0.5, 0, 7); ctx.fillStyle = sk; ctx.fill(); ctx.stroke();
  ctx.restore();
}

// ======================= FINISHING =======================
const CB = mk(), RB = mk(), BL = mk(W / 4, H / 4), NZ = mk(W / 3, H / 3);
(() => { const id = NZ[1].createImageData(NZ[0].width, NZ[0].height); for (let i = 0; i < id.data.length; i += 4) { const v = Math.floor(hash(i * 0.37) * 255); id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } NZ[1].putImageData(id, 0, 0); })();
// draw a figure on its own layer, add a coloured rim light and an ambient tint, then composite on ctx. fn(c) draws the figure.
function figure(ctx, fn, o = {}) {
  const [cb, c] = CB; c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.clearRect(0, 0, W, H); c.save(); fn(c); c.restore();
  if (o.tint) { c.globalCompositeOperation = 'source-atop'; const g = c.createLinearGradient(o.tint.x0, o.tint.y0, o.tint.x1, o.tint.y1); g.addColorStop(0, o.tint.c0); g.addColorStop(1, o.tint.c1); c.fillStyle = g; c.fillRect(0, 0, W, H); c.globalCompositeOperation = 'source-over'; }
  if (o.shadow) { ctx.save(); ctx.filter = 'blur(22px)'; ctx.globalAlpha = o.shadow; ctx.drawImage(cb, 18, 26); ctx.restore(); }
  ctx.drawImage(cb, 0, 0);
  if (o.rim) { const [rb, r] = RB; r.setTransform(1, 0, 0, 1, 0, 0); r.globalCompositeOperation = 'source-over'; r.clearRect(0, 0, W, H); r.drawImage(cb, 0, 0); r.globalCompositeOperation = 'destination-out'; r.drawImage(cb, o.rim.dx, o.rim.dy);
    r.globalCompositeOperation = 'source-in'; r.fillStyle = o.rim.color; r.fillRect(0, 0, W, H); ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = o.rim.a ?? 0.9; ctx.drawImage(rb, 0, 0); ctx.restore(); }
}
function bokeh(ctx, seed, n, cols, rmin, rmax, a) { for (let i = 0; i < n; i++) { const x = hash(seed + i) * W, y = hash(seed + i * 3.1) * H, r = lerp(rmin, rmax, hash(seed + i * 7.7)); const g = ctx.createRadialGradient(x, y, 0, x, y, r); const c = cols[i % cols.length]; g.addColorStop(0, c.replace('A', a)); g.addColorStop(1, c.replace('A', 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); } }
function vignette(ctx, a = 0.55) { const g = ctx.createRadialGradient(W / 2, H / 2, 500, W / 2, H / 2, 1250); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(8,4,12,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
function post(ctx, f, o = {}) { // bloom + vignette + grain
  const [bc, b] = BL; b.setTransform(1, 0, 0, 1, 0, 0); b.clearRect(0, 0, bc.width, bc.height); b.filter = 'blur(10px) brightness(1.15)'; b.drawImage(ctx.canvas, 0, 0, bc.width, bc.height); b.filter = 'none';
  ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = o.bloom ?? 0.32; ctx.drawImage(bc, 0, 0, W, H); ctx.restore(); vignette(ctx, o.vig ?? 0.5);
  ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = 0.16; const ox = (f * 37) % 120, oy = (f * 53) % 160; ctx.drawImage(NZ[0], -ox, -oy, W + 120, H + 160); ctx.restore();
}
function title(ctx, lines, y, u, o = {}) { // big plain on-screen text with a dark shadow (no paper cards)
  if (u <= 0) return; ctx.save(); ctx.translate(W / 2, y); const s = o.size || 112; ctx.scale(lerp(0.85, 1, clamp(u)), lerp(0.85, 1, clamp(u))); ctx.globalAlpha = clamp(u * 1.5); ctx.textAlign = 'center'; ctx.lineJoin = 'round';
  lines.forEach((ln, i) => { ctx.font = `${s}px ${F}`; let sz = s; const w = ctx.measureText(ln.t).width; if (w > 960) { sz = s * 960 / w; ctx.font = `${sz}px ${F}`; } const yy = i * s * 1.02;
    ctx.lineWidth = sz * 0.16; ctx.strokeStyle = 'rgba(10,6,16,0.85)'; ctx.strokeText(ln.t, 0, yy); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 24; ctx.fillStyle = ln.c || '#FFFFFF'; ctx.fillText(ln.t, 0, yy); ctx.shadowBlur = 0; }); ctx.restore();
}

// ======================= PROPS =======================
function jet(ctx, t, o = {}) { // a shaded Harrier, side view, ~1300 wide; noz 0..1 down
  ctx.save(); const noz = o.noz ?? 1;
  const flame = (x, y) => { ctx.save(); ctx.translate(x, y); ctx.rotate(-noz * Math.PI / 2); const L = 170 * (0.9 + 0.1 * Math.sin(t * 40 + x)); const g = ctx.createLinearGradient(-70, 0, -70 - L, 0); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.3, 'rgba(255,210,120,0.95)'); g.addColorStop(1, 'rgba(255,110,40,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-60, -26); ctx.lineTo(-70 - L, 0); ctx.lineTo(-60, 26); ctx.closePath(); ctx.fill(); ctx.restore(); };
  const noz2 = (x, y) => { ctx.save(); ctx.translate(x, y); ctx.rotate(-noz * Math.PI / 2); ctx.fillStyle = '#3A4252'; ctx.beginPath(); ctx.roundRect(-70, -28, 110, 56, 16); ctx.fill(); ctx.fillStyle = '#1A1F28'; ctx.beginPath(); ctx.ellipse(-70, 0, 10, 24, 0, 0, 7); ctx.fill(); ctx.restore(); };
  // tail fin + stabiliser
  const fin = ctx.createLinearGradient(0, -400, 0, -100); fin.addColorStop(0, '#AEB9CC'); fin.addColorStop(1, '#6F7B90'); ctx.fillStyle = fin; ctx.beginPath(); ctx.moveTo(-390, -100); ctx.lineTo(-540, -380); ctx.lineTo(-440, -386); ctx.lineTo(-240, -118); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#7F8BA0'; ctx.beginPath(); ctx.moveTo(-500, -70); ctx.lineTo(-620, -30); ctx.lineTo(-450, -18); ctx.lineTo(-360, -56); ctx.closePath(); ctx.fill();
  noz2(-225, 58); noz2(30, 70); flame(-265, 58); flame(-10, 70);
  ctx.fillStyle = '#5E6A80'; ctx.beginPath(); ctx.moveTo(130, 4); ctx.lineTo(-110, 10); ctx.lineTo(-270, 110); ctx.lineTo(-170, 118); ctx.closePath(); ctx.fill();
  // fuselage
  const body = () => { ctx.beginPath(); ctx.moveTo(610, -22); ctx.bezierCurveTo(520, -58, 410, -80, 320, -90); ctx.lineTo(-70, -114); ctx.bezierCurveTo(-210, -114, -350, -110, -470, -98); ctx.lineTo(-510, -36); ctx.bezierCurveTo(-350, 10, -220, 46, -90, 72); ctx.bezierCurveTo(60, 86, 210, 70, 320, 40); ctx.bezierCurveTo(430, 14, 530, -6, 610, -22); ctx.closePath(); };
  body(); const bg = ctx.createLinearGradient(0, -120, 0, 90); bg.addColorStop(0, '#D4DCEA'); bg.addColorStop(0.35, '#97A3BA'); bg.addColorStop(0.75, '#5B677D'); bg.addColorStop(1, '#3A4252'); ctx.fillStyle = bg; ctx.fill();
  ctx.save(); body(); ctx.clip(); ctx.strokeStyle = 'rgba(30,40,60,0.35)'; ctx.lineWidth = 3; for (const x of [-300, -120, 90, 240]) { ctx.beginPath(); ctx.moveTo(x, -120); ctx.lineTo(x - 30, 90); ctx.stroke(); }
  ctx.fillStyle = '#E8B33A'; ctx.fillRect(-520, -80, 90, 14); ctx.fillStyle = '#C94A4A'; ctx.fillRect(-520, -64, 90, 14);
  const sh = ctx.createLinearGradient(-200, 0, 500, 0); sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(0.5, 'rgba(255,255,255,0.22)'); sh.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = sh; ctx.fillRect(-520, -120, 1200, 70); ctx.restore();
  // canopy, intake, near wing
  ctx.beginPath(); ctx.moveTo(350, -86); ctx.bezierCurveTo(320, -190, 190, -204, 100, -112); ctx.lineTo(150, -100); ctx.closePath(); const cg = ctx.createLinearGradient(100, -200, 340, -90); cg.addColorStop(0, '#E6F6FF'); cg.addColorStop(0.5, '#6FB1E6'); cg.addColorStop(1, '#2C5C94'); ctx.fillStyle = cg; ctx.fill(); ctx.strokeStyle = 'rgba(20,30,50,0.7)'; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.moveTo(300, -116); ctx.quadraticCurveTo(250, -170, 200, -156); ctx.lineTo(236, -118); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2A303C'; ctx.beginPath(); ctx.roundRect(50, -78, 140, 104, 40); ctx.fill(); ctx.fillStyle = '#12151C'; ctx.beginPath(); ctx.roundRect(66, -64, 108, 76, 32); ctx.fill();
  const wg = ctx.createLinearGradient(0, 0, 0, 130); wg.addColorStop(0, '#A9B5CA'); wg.addColorStop(1, '#68748A'); ctx.fillStyle = wg; ctx.beginPath(); ctx.moveTo(190, 10); ctx.lineTo(-130, 14); ctx.lineTo(-340, 134); ctx.lineTo(-210, 142); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(20,30,50,0.55)'; ctx.stroke();
  if (o.plate) { ctx.save(); ctx.translate(-120, -18); ctx.fillStyle = '#FFF6E4'; ctx.beginPath(); ctx.roundRect(-250, -26, 500, 52, 8); ctx.fill(); ctx.font = `38px ${F}`; ctx.textAlign = 'center'; ctx.fillStyle = '#C93440'; ctx.fillText(o.plate, 0, 14); ctx.restore(); }
  ctx.restore();
}
function schoolBack(ctx, o = {}) { // dusk sky, far trees, glowing school (static layers drawn in 1080x1920 with horizon at ~y 1200)
  const g = ctx.createLinearGradient(0, 0, 0, 1250); g.addColorStop(0, '#2C3A78'); g.addColorStop(0.45, '#C8667A'); g.addColorStop(0.8, '#F6B36A'); g.addColorStop(1, '#FFD9A0'); ctx.fillStyle = g; ctx.fillRect(0, -700, W, 1950 + 700);
  ctx.save(); ctx.globalAlpha = 0.9; for (const [x, y, s] of [[200, 380, 1.5], [800, 250, 1.1], [520, 640, 1.9], [900, 780, 1.3]]) { ctx.fillStyle = 'rgba(255,210,190,0.45)'; for (const [dx, dy, r] of [[-110, 10, 70], [-30, -20, 95], [60, -6, 80], [130, 16, 60], [10, 28, 100]]) { ctx.beginPath(); ctx.ellipse(x + dx * s, y + dy * s * 0.6, r * s, r * s * 0.5, 0, 0, 7); ctx.fill(); } } ctx.restore();
  LT_glow(ctx, 760, 1180, 800, 'rgba(255,210,140,1)', 0.5);
}
function LT_glow(ctx, x, y, r, c, a) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, c.replace('1)', a + ')')); g.addColorStop(1, c.replace('1)', '0)')); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
function schoolMid(ctx, t, o = {}) { // trees and the school building (y: ground line at 1260)
  ctx.fillStyle = '#3A2C52'; for (let i = 0; i < 9; i++) { const x = i * 150 - 40, h = 150 + hash(i) * 110; ctx.beginPath(); ctx.ellipse(x, 1120 - h * 0.2, 95, h, 0, 0, 7); ctx.fill(); }
  ctx.save(); ctx.translate(140, 0);
  const bw = 820, bx = 0, by = 1260; const bg = ctx.createLinearGradient(0, by - 330, 0, by); bg.addColorStop(0, '#B9584A'); bg.addColorStop(1, '#7E3A3A'); ctx.fillStyle = bg; ctx.fillRect(bx, by - 330, bw, 330);
  ctx.fillStyle = 'rgba(40,20,30,0.28)'; for (let y = by - 326; y < by; y += 22) ctx.fillRect(bx, y, bw, 3); ctx.fillStyle = '#5C2A30'; ctx.fillRect(bx - 12, by - 350, bw + 24, 28);
  for (let c = 0; c < 6; c++) for (let r = 0; r < 2; r++) { const x = 40 + c * 130, y = by - 290 + r * 130; ctx.fillStyle = '#FFE3A4'; ctx.fillRect(x, y, 78, 90); ctx.fillStyle = 'rgba(80,40,30,0.9)'; ctx.fillRect(x + 37, y, 4, 90); ctx.fillRect(x, y + 43, 78, 4); LT_glow(ctx, x + 39, y + 45, 90, 'rgba(255,220,140,1)', 0.35); }
  ctx.fillStyle = '#D9B98A'; ctx.beginPath(); ctx.moveTo(bw / 2 - 150, by - 330); ctx.lineTo(bw / 2, by - 430); ctx.lineTo(bw / 2 + 150, by - 330); ctx.closePath(); ctx.fill(); ctx.fillRect(bw / 2 - 150, by - 330, 300, 330); ctx.fillStyle = '#3A3F66'; ctx.fillRect(bw / 2 - 52, by - 150, 104, 150); ctx.restore();
  // flag pole
  ctx.strokeStyle = '#2A2238'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(1010, 1260); ctx.lineTo(1010, 760); ctx.stroke();
  const fw = Math.sin(t * 7) * 10; for (let i = 0; i < 7; i++) { ctx.fillStyle = i % 2 ? '#FFF4E4' : '#C93A48'; ctx.beginPath(); ctx.moveTo(1012, 770 + i * 12); ctx.lineTo(1100, 770 + i * 12 + fw); ctx.lineTo(1100, 782 + i * 12 + fw); ctx.lineTo(1012, 782 + i * 12); ctx.fill(); }
}
function lawn(ctx, t, o = {}) { const g = ctx.createLinearGradient(0, 1260, 0, 1950); g.addColorStop(0, '#6E9A52'); g.addColorStop(1, '#2E5A34'); ctx.fillStyle = g; ctx.fillRect(-100, 1260, W + 200, 800); ctx.fillStyle = '#D9C9A8'; ctx.fillRect(-100, 1260, W + 200, 40); ctx.fillStyle = 'rgba(20,50,30,0.25)'; for (let i = 0; i < 40; i++) ctx.fillRect(hash(i) * 1100 - 20, 1330 + hash(i + 9) * 540, 70 + hash(i) * 60, 6); }
function kid(ctx, x, y, s, col, t, i) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const arm = Math.sin(t * 4 + i) * 0.1; ctx.strokeStyle = '#1B1626'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.fillStyle = col;
  ctx.beginPath(); ctx.roundRect(-26, -150, 52, 100, 16); ctx.fill(); ctx.beginPath(); ctx.moveTo(-14, -50); ctx.lineTo(-18, 0); ctx.moveTo(14, -50); ctx.lineTo(18, 0); ctx.strokeStyle = '#2A2238'; ctx.stroke();
  ctx.strokeStyle = SKIN_D; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(-24, -135); ctx.lineTo(-52, -200 + arm * 60); ctx.moveTo(24, -135); ctx.lineTo(52, -200 - arm * 60); ctx.stroke(); ctx.fillStyle = SKIN_D; ctx.beginPath(); ctx.arc(0, -178, 26, 0, 7); ctx.fill(); ctx.fillStyle = '#1B1626'; ctx.beginPath(); ctx.arc(0, -190, 27, Math.PI, 0); ctx.fill(); ctx.restore(); }

// ======================= SHOTS =======================
const tri = (t, c, w) => clamp(1 - Math.abs(t - c) / w);
const blinkAt = (t, list) => Math.max(0, ...list.map(c => tri(t, c, 0.07)));
const push = (c, cx, cy, z, r = 0) => { c.translate(cx, cy); c.scale(z, z); c.rotate(r); c.translate(-cx, -cy); };
const cache = {};
const once = (k, fn) => cache[k] || (cache[k] = fn());
function checkArt(c, w, h, t, shine) {
  c.save(); c.shadowColor = 'rgba(0,0,0,0.45)'; c.shadowBlur = 40; c.shadowOffsetY = 24; c.beginPath(); c.roundRect(-w / 2, -h / 2, w, h, 22); const g = c.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); g.addColorStop(0, '#F2FAEA'); g.addColorStop(1, '#C4E2C8'); c.fillStyle = g; c.fill(); c.restore();
  c.save(); c.beginPath(); c.roundRect(-w / 2, -h / 2, w, h, 22); c.clip();
  c.strokeStyle = 'rgba(60,140,100,0.22)'; c.lineWidth = 2; for (let k = 0; k < 16; k++) { c.beginPath(); for (let x = -w / 2; x <= w / 2; x += 20) c.lineTo(x, -h / 2 + 24 + k * 22 + Math.sin(x / 55 + k * 0.6) * 8); c.stroke(); }
  c.strokeStyle = '#2F7A58'; c.lineWidth = 5; c.beginPath(); c.roundRect(-w / 2 + 16, -h / 2 + 16, w - 32, h - 32, 14); c.stroke();
  c.textAlign = 'left'; c.fillStyle = '#2F7A58'; c.font = `34px ${F}`; c.fillText('PAY TO: PEPSI', -w / 2 + 44, -h / 2 + 76); c.font = `26px ${F}`; c.fillStyle = 'rgba(47,122,88,0.7)'; c.fillText('CHECK', w / 2 - 190, -h / 2 + 70);
  c.textAlign = 'center'; c.font = `96px ${F}`; c.fillStyle = '#1D4D38'; c.shadowColor = 'rgba(255,255,255,0.8)'; c.shadowBlur = 0; c.fillText('$700,008.50', -6, 36);
  c.strokeStyle = '#243B6B'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); for (let i = 0; i <= 40; i++) { const u = i / 40; c.lineTo(w / 2 - 330 + u * 250, h / 2 - 66 - Math.sin(u * 15) * 26 * (1 - u * 0.4)); } c.stroke();
  c.fillStyle = 'rgba(47,122,88,0.5)'; c.fillRect(-w / 2 + 44, h / 2 - 50, 340, 4);
  if (shine > 0 && shine < 1) { const x = lerp(-w * 0.8, w * 0.8, shine), sg = c.createLinearGradient(x - 120, 0, x + 120, 0); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,255,255,0.55)'); sg.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = sg; c.save(); c.rotate(0.3); c.fillRect(x - 120, -h, 240, 2 * h); c.restore(); }
  c.restore();
}
function lampWall(ctx, a = 1) { // warm study wall at night (cached by callers)
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1C2A34'); g.addColorStop(0.55, '#2E3A3C'); g.addColorStop(1, '#3A2A1E'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,0.03)'; for (let x = 0; x < W; x += 90) ctx.fillRect(x, 0, 36, H);
  ctx.fillStyle = '#16202A'; ctx.fillRect(40, 380, 330, 14); ctx.fillRect(40, 640, 330, 14); for (let i = 0; i < 9; i++) { ctx.fillStyle = ['#7A3A3A', '#3A5A7A', '#B28A3A', '#4A7A5A'][i % 4]; ctx.fillRect(56 + i * 34, 300 + (i % 3) * 8, 26, 80 - (i % 3) * 8); ctx.fillRect(56 + i * 34, 570 + (i % 2) * 6, 26, 70 - (i % 2) * 6); }
  LT_glow(ctx, 900, 560, 900, 'rgba(255,200,120,1)', 0.45 * a); LT_glow(ctx, 900, 560, 380, 'rgba(255,230,170,1)', 0.5 * a);
}
// ---- shot 1: the check
function shot1(ctx, t) {
  const bgc = once('bg1', () => { const [c, x] = mk(); x.fillStyle = '#26181A'; x.fillRect(0, 0, W, H); const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#6A3E22'); g.addColorStop(1, '#1E1220'); x.fillStyle = g; x.fillRect(0, 0, W, H); bokeh(x, 3, 22, ['rgba(255,190,110,A)', 'rgba(255,230,170,A)', 'rgba(240,140,90,A)'], 60, 190, 0.55); LT_glow(x, 160, 700, 900, 'rgba(255,200,130,1)', 0.5); const [c2, x2] = mk(); x2.filter = 'blur(26px)'; x2.drawImage(c, 0, 0); return c2; });
  ctx.drawImage(bgc, 0, 0);
  const z = 1 + t * 0.03, u = ease(seg(t, 0.2, 1.0)), v = ease(seg(t, 1.7, 2.4)), e = emo(emo('neutral', 'confident', u), 'excited', v * 0.35), bl = blinkAt(t, [1.45, 2.65]);
  e.look = [lerp(0.2, 0, u), lerp(0.5, 0, u)];
  figure(ctx, c => { push(c, 540, 1300, z); c.translate(540, 1330); c.scale(3.0, 3.0); man(c, { e, blink: bl, tilt: Math.sin(t * 1.1) * 0.012 - 0.01, yaw: -0.05 }); },
    { rim: { dx: -12, dy: -9, color: '#FFC27A', a: 0.9 }, tint: { x0: 0, y0: 0, x1: W, y1: 0, c0: 'rgba(255,170,90,0.10)', c1: 'rgba(40,10,40,0.30)' }, shadow: 0.3 });
  ctx.save(); push(ctx, 540, 1300, z); const sway = Math.sin(t * 1.9) * 0.012, rise = 1 - easeOut(seg(t, 0, 0.5)); ctx.translate(540, 1650 + rise * 260); ctx.rotate(-0.045 + sway); checkArt(ctx, 900, 430, t, seg(t, 1.1, 2.0)); ctx.restore();
  ctx.save(); push(ctx, 540, 1300, z); const hs = easeOut(seg(t, 0, 0.5)); hand(ctx, 130, 1670 + (1 - hs) * 260, Math.PI / 2 - 0.1, 1.15, { skin: SKIN }); hand(ctx, 950, 1640 + (1 - hs) * 260, -Math.PI / 2 - 0.0, 1.15, { flip: true }); ctx.restore();
  title(ctx, [{ t: 'HE WANTED' }, { t: 'A FIGHTER JET.', c: '#FFD34D' }], 345, easeOut(seg(t, 0.35, 0.8)), { size: 96 });
}
// ---- shot 2: the jet by the school (tilt up from the kids to the jet)
function shot2(ctx, t) {
  const u = ease(seg(t, 0.15, 2.5)), oy = lerp(-440, 220, u), ox = lerp(-30, 30, u), L = (p, fn) => { ctx.save(); ctx.translate(ox * p, oy * p); fn(); ctx.restore(); };
  const [hc, hxx] = once('half2', () => mk(W / 2, H / 2)); hxx.setTransform(0.5, 0, 0, 0.5, 0, 0); hxx.clearRect(0, 0, W, H); hxx.save(); hxx.translate(ox * 0.25, oy * 0.25); schoolBack(hxx); hxx.restore(); hxx.save(); hxx.translate(ox * 0.6, oy * 0.6); schoolMid(hxx, t); hxx.restore();
  ctx.save(); ctx.filter = 'blur(3px)'; ctx.drawImage(hc, 0, 0, W, H); ctx.restore();
  L(1, () => {
    lawn(ctx, t);
    const jy = 640 + Math.sin(t * 2.2) * 9, jx = 500 + Math.sin(t * 1.1) * 12;
    // jet shadow + dust rings on the lawn
    ctx.fillStyle = 'rgba(10,20,10,0.4)'; ctx.beginPath(); ctx.ellipse(jx - 20, 1640, 520, 60, 0, 0, 7); ctx.fill();
    for (let i = 0; i < 3; i++) { const ph = ((t * 0.9 + i / 3) % 1), r = lerp(80, 560, ph); ctx.strokeStyle = `rgba(235,215,170,${0.45 * (1 - ph)})`; ctx.lineWidth = 14 * (1 - ph) + 3; ctx.beginPath(); ctx.ellipse(jx - 20, 1650, r, r * 0.12, 0, 0, 7); ctx.stroke(); }
    for (let i = 0; i < 26; i++) { const ph = (t * 0.7 + hash(i)) % 1, a = hash(i + 4) * 6.28; ctx.fillStyle = `rgba(220,200,160,${0.35 * (1 - ph)})`; ctx.beginPath(); ctx.ellipse(jx - 20 + Math.cos(a) * ph * 640, 1650 - ph * 70 + Math.sin(a) * 10, 22 + ph * 40, 12 + ph * 20, 0, 0, 7); ctx.fill(); }
    for (let i = 0; i < 3; i++) kid(ctx, 190 + i * 150, 1640 + i * 14, 1.05 - i * 0.04, ['#E35A5A', '#4D8DFF', '#3FB58F'][i], t, i);
    ctx.save(); ctx.translate(jx, jy); ctx.rotate(-0.02 + Math.sin(t * 1.3) * 0.012); ctx.scale(1.12, 1.12); jet(ctx, t, { noz: 1, plate: '7,000,000 PEPSI POINTS' }); ctx.restore();
    LT_glow(ctx, jx - 20, 1640, 700, 'rgba(255,200,120,1)', 0.25);
  });
  // heat/light shafts + foreground grass silhouettes (move faster = depth)
  ctx.save(); ctx.globalCompositeOperation = 'screen'; for (let i = 0; i < 5; i++) { const g = ctx.createLinearGradient(0, 0, 0, 1400); g.addColorStop(0, 'rgba(255,220,160,0.14)'); g.addColorStop(1, 'rgba(255,220,160,0)'); ctx.fillStyle = g; ctx.beginPath(); const x0 = 80 + i * 230 + Math.sin(t + i) * 20; ctx.moveTo(x0, 0); ctx.lineTo(x0 + 90, 0); ctx.lineTo(x0 - 280, 1400); ctx.lineTo(x0 - 380, 1400); ctx.fill(); } ctx.restore();
  L(1.6, () => { ctx.fillStyle = '#10261A'; for (let i = 0; i < 40; i++) { const x = i * 30 - 20, h = 90 + hash(i) * 120; ctx.beginPath(); ctx.moveTo(x, 2050); ctx.quadraticCurveTo(x + 6 + Math.sin(t * 3 + i) * 8, 2050 - h * 0.6, x + 18 + Math.sin(t * 3 + i) * 16, 2050 - h - 20); ctx.quadraticCurveTo(x + 22, 2050 - h * 0.5, x + 30, 2050); ctx.fill(); } });
}
// ---- shot 3a: over his shoulder at the TV; the ad plays and the banner pops in
function adScreen(c, w, h, t, banner) {
  c.save(); c.beginPath(); c.rect(0, 0, w, h); c.clip(); const s = w / W; c.scale(s, s); c.translate(0, -260);
  schoolBack(c); schoolMid(c, t); lawn(c, t); c.save(); c.translate(520, 760 + Math.sin(t * 2.2) * 9); c.scale(0.98, 0.98); jet(c, t, { noz: 1 }); c.restore(); c.restore();
  if (banner > 0) { c.save(); c.translate(w / 2, h * 0.84); const sc = 0.5 + 0.5 * back(clamp(banner)); c.scale(sc, sc); c.fillStyle = '#C93440'; c.beginPath(); c.roundRect(-w * 0.46, -h * 0.1, w * 0.92, h * 0.2, 10); c.fill(); c.strokeStyle = '#FFD34D'; c.lineWidth = 5; c.stroke(); c.textAlign = 'center'; c.font = `${h * 0.115}px ${F}`; c.fillStyle = '#FFE08A'; c.fillText('7,000,000 PEPSI POINTS', 0, h * 0.04); c.restore(); }
}
function room3(ctx, t) {
  const bgc = once('bg3', () => { const [c, x] = mk(); const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#10101C'); g.addColorStop(1, '#1E1626'); x.fillStyle = g; x.fillRect(0, 0, W, H); x.fillStyle = 'rgba(255,255,255,0.025)'; for (let i = 0; i < W; i += 80) x.fillRect(i, 0, 30, H); x.fillStyle = '#0A0A12'; x.fillRect(780, 420, 200, 700); x.beginPath(); x.arc(880, 400, 70, 0, 7); x.fill(); x.fillRect(60, 300, 240, 16); x.fillRect(60, 560, 240, 16); return c; });
  ctx.drawImage(bgc, 0, 0);
}
function shot3a(ctx, t) {
  room3(ctx, t); const z = 1 + t * 0.05, tw = 860, th = 540, tx = 620, ty = 640, ban = seg(t, 0.55, 1.0);
  ctx.save(); push(ctx, tx, ty, z); LT_glow(ctx, tx, ty, 1100, 'rgba(150,190,255,1)', 0.42 + 0.04 * Math.sin(t * 30));
  ctx.save(); ctx.translate(tx, ty); ctx.fillStyle = '#0C0C14'; ctx.beginPath(); ctx.roundRect(-tw / 2 - 40, -th / 2 - 40, tw + 80, th + 80, 36); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 4; ctx.stroke(); ctx.translate(-tw / 2, -th / 2); adScreen(ctx, tw, th, t, ban); ctx.globalAlpha = 0.12; ctx.fillStyle = '#fff'; for (let y = 0; y < th; y += 6) ctx.fillRect(0, y, tw, 2); ctx.restore();
  ctx.fillStyle = '#0A0A12'; ctx.fillRect(tx - 80, ty + th / 2 + 40, 160, 250); ctx.beginPath(); ctx.roundRect(tx - 340, ty + th / 2 + 270, 680, 40, 12); ctx.fill(); ctx.restore();
  figure(ctx, c => { push(c, tx, ty, z); c.translate(230, 1860); c.scale(3.3, 3.3); man(c, { back: true, tilt: -0.05, yaw: 0, e: EMO.neutral }); },
    { rim: { dx: 16, dy: -4, color: '#BFD9FF', a: 1 }, tint: { x0: 0, y0: 0, x1: W, y1: 0, c0: 'rgba(8,10,28,0.62)', c1: 'rgba(60,90,150,0.25)' } });
}
// ---- shot 3b: close on his face: the TV light, the eyes go wide
function shot3b(ctx, t) {
  const bgc = once('bg3b', () => { const [c, x] = mk(); const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0C0E1C'); g.addColorStop(1, '#1A1626'); x.fillStyle = g; x.fillRect(0, 0, W, H); bokeh(x, 21, 10, ['rgba(140,180,255,A)', 'rgba(200,220,255,A)'], 80, 220, 0.4); LT_glow(x, 1000, 500, 900, 'rgba(150,190,255,1)', 0.5); const [c2, x2] = mk(); x2.filter = 'blur(24px)'; x2.drawImage(c, 0, 0); return c2; });
  ctx.drawImage(bgc, 0, 0); const k = ease(seg(t, 0.25, 0.65)), z = 1 + t * 0.07 + 0.04 * k, sk = t > 0.25 && t < 0.6 ? Math.sin((t - 0.25) * 90) * 8 * (1 - seg(t, 0.25, 0.6)) : 0;
  const e = emo('neutral', 'surprised', k); e.look = [0.35, -0.2];
  figure(ctx, c => { push(c, 540, 1100, z); c.translate(540 + sk, 1180); c.scale(3.5, 3.5); man(c, { e, blink: blinkAt(t, [0.12]), yaw: 0.12, tilt: lerp(0.03, -0.02, k), eyeTint: 'rgba(255,215,90,0.55)' }); },
    { rim: { dx: 14, dy: -8, color: '#CFE2FF', a: 1 }, tint: { x0: W, y0: 0, x1: 0, y1: 0, c0: 'rgba(150,190,255,0.40)', c1: 'rgba(10,12,40,0.38)' } });
}
// ---- shot 4: the rules
function page(c, w, h, t, o = {}) {
  c.save(); c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 40; c.shadowOffsetY = 20; c.fillStyle = '#FFF8E8'; c.beginPath(); c.roundRect(-w / 2, -h / 2, w, h, 10); c.fill(); c.restore();
  c.save(); c.beginPath(); c.roundRect(-w / 2, -h / 2, w, h, 10); c.clip(); c.fillStyle = '#2C5DB8'; c.fillRect(-w / 2, -h / 2, w, h * 0.12); c.textAlign = 'left'; c.fillStyle = '#FFF6E4'; c.font = `${h * 0.065}px ${F}`; c.fillText('PROMOTION RULES', -w / 2 + 34, -h / 2 + h * 0.085);
  const rows = 11, y0 = -h / 2 + h * 0.2, dy = h * 0.075; for (let i = 0; i < rows; i++) { const y = y0 + i * dy; if (i === 6) continue; c.fillStyle = 'rgba(50,50,70,0.28)'; c.fillRect(-w / 2 + 34, y, (w - 100) * (0.55 + 0.4 * hash(i * 3 + 1)), h * 0.014); c.fillRect(-w / 2 + 34, y + h * 0.026, (w - 100) * (0.4 + 0.5 * hash(i * 5 + 2)), h * 0.014); }
  const y = y0 + 6 * dy; const hl = clamp(o.hl || 0); if (hl > 0) { c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = '#FFD34D'; c.beginPath(); c.roundRect(-w / 2 + 20, y - h * 0.03, (w - 40) * hl, h * 0.115, 8); c.fill(); c.restore(); }
  c.fillStyle = '#1B1B28'; c.font = `${h * 0.062}px ${F}`; c.fillText('BUY EXTRA POINTS', -w / 2 + 40, y + h * 0.034); c.fillText('— $0.10 EACH', -w / 2 + 40, y + h * 0.034 + h * 0.07);
  c.restore();
}
function desk4(ctx, t) { const bgc = once('bg4', () => { const [c, x] = mk(); lampWall(x, 1); const g = x.createLinearGradient(0, 1250, 0, H); g.addColorStop(0, '#6A4528'); g.addColorStop(1, '#2A1A10'); x.fillStyle = g; x.fillRect(0, 1250, W, 700); x.fillStyle = 'rgba(0,0,0,0.3)'; x.fillRect(0, 1250, W, 8); const [c2, x2] = mk(); x2.filter = 'blur(14px)'; x2.drawImage(c, 0, 0); return c2; }); ctx.drawImage(bgc, 0, 0); }
function pen(c, x, y, rot) { c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = '#FFD34D'; c.beginPath(); c.roundRect(-30, -230, 60, 330, 18); c.fill(); c.strokeStyle = 'rgba(70,50,10,0.6)'; c.lineWidth = 4; c.stroke(); c.fillStyle = '#E8B820'; c.beginPath(); c.moveTo(-26, 100); c.lineTo(26, 100); c.lineTo(14, 150); c.lineTo(-14, 150); c.closePath(); c.fill(); c.stroke(); c.restore(); }
function shot4a(ctx, t) {
  desk4(ctx, t); const z = 1 + t * 0.035, rd = ease(seg(t, 0.2, 1.6)), sur = ease(seg(t, 1.6, 2.1)), e = emo('neutral', 'thinking', 0.5 * (1 - sur)); const e2 = emo(e, 'surprised', sur * 0.65); e2.look = [lerp(0.4 + Math.sin(t * 2.4) * 0.35, 0.5, sur), 0.85];
  figure(ctx, c => { push(c, 540, 1000, z); c.translate(400, 900); c.scale(3.0, 3.0); man(c, { e: e2, blink: blinkAt(t, [1.0]), yaw: -0.35, tilt: lerp(0.07, 0.02, sur) }); },
    { rim: { dx: 14, dy: -8, color: '#FFC27A', a: 0.9 }, tint: { x0: W, y0: 0, x1: 0, y1: 0, c0: 'rgba(255,190,110,0.25)', c1: 'rgba(10,10,30,0.35)' }, shadow: 0.3 });
  ctx.save(); push(ctx, 540, 1000, z); ctx.translate(580, 1560); ctx.rotate(-0.07); page(ctx, 920, 660, t, { hl: seg(t, 1.9, 2.4) }); ctx.restore();
  ctx.save(); push(ctx, 540, 1000, z); const px_ = lerp(250, 500, rd) + Math.sin(t * 3) * 6, py_ = 1500; pen(ctx, px_ + 90, py_ - 70, -0.5); hand(ctx, px_ + 100, py_ - 50, -0.5 + Math.PI / 2 + 0.2, 0.9, {}); ctx.restore();
}
function shot4b(ctx, t) {
  const bgc = once('bg4b', () => { const [c, x] = mk(); lampWall(x, 1); const [c2, x2] = mk(); x2.filter = 'blur(20px)'; x2.drawImage(c, 0, 0); x2.fillStyle = '#6A4528'; x2.globalAlpha = 0.6; x2.fillRect(0, 0, W, H); return c2; }); ctx.drawImage(bgc, 0, 0);
  const z = 1.0 + t * 0.06; ctx.save(); ctx.translate(540, 980); ctx.scale(1.18 * z, 1.18 * z); ctx.rotate(-0.04); page(ctx, 940, 1130, t, { hl: seg(t, 0.15, 0.7) }); ctx.restore();
  LT_glow(ctx, 880, 300, 900, 'rgba(255,215,140,1)', 0.35); ctx.save(); ctx.translate(540, 980); ctx.scale(1.18 * z, 1.18 * z); ctx.rotate(-0.04); pen(ctx, lerp(-420, 330, easeOut(seg(t, 0, 0.7))), 90 - 20, 0.0 - 0.45); ctx.restore();
  vignette(ctx, 0.3);
}
function shot4c(ctx, t) {
  const bgc = once('bg4c', () => { const [c, x] = mk(); lampWall(x, 1); const [c2, x2] = mk(); x2.filter = 'blur(22px)'; x2.drawImage(c, 0, 0); return c2; }); ctx.drawImage(bgc, 0, 0);
  const z = 1 + t * 0.05, a = ease(seg(t, 0.15, 0.9)), b = ease(seg(t, 0.8, 1.35)), e = emo(emo('neutral', 'confident', a), 'excited', b * 0.7); e.look = [lerp(0.4, 0, a), lerp(0.3, 0, a)];
  figure(ctx, c => { push(c, 540, 1100, z); c.translate(540, 1230); c.scale(3.15, 3.15); man(c, { e, blink: blinkAt(t, [0.9]), yaw: -0.08, tilt: lerp(0.03, -0.02, a) }); },
    { rim: { dx: -14, dy: -9, color: '#FFC27A', a: 0.95 }, tint: { x0: W, y0: 0, x1: 0, y1: 0, c0: 'rgba(255,190,110,0.28)', c1: 'rgba(10,10,30,0.32)' }, shadow: 0.25 });
  title(ctx, [{ t: 'HE FOUND' }, { t: 'A WAY.', c: '#FFD34D' }], 1560, easeOut(seg(t, 0.35, 0.8)), { size: 124 });
}
const SHOTS = [[0, 3, shot1], [3, 6, shot2], [6, 8.2, shot3a], [8.2, 10, shot3b], [10, 12.4, shot4a], [12.4, 13.5, shot4b], [13.5, 15, shot4c]];
function frame(ctx, gt) {
  const f = Math.round(gt * FPS), i = SHOTS.findIndex(s => gt >= s[0] && gt < s[1]), s = SHOTS[i < 0 ? SHOTS.length - 1 : i], lt = gt - s[0];
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none'; ctx.clearRect(0, 0, W, H);
  const sh = lt < 0.2 ? Math.sin(lt * 120) * 10 * (1 - lt / 0.2) : 0; ctx.save(); ctx.translate(sh, sh * 0.6); s[2](ctx, lt); ctx.restore();
  post(ctx, f, { bloom: 0.3, vig: 0.5 });
  ctx.save(); ctx.textAlign = 'center'; ctx.font = `26px ${F}`; ctx.fillStyle = 'rgba(255,246,228,0.85)'; ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 8; ctx.fillText('STYLE TEST · RE-ENACTMENT', W / 2, 262); ctx.restore();
}

// ======================= CLI =======================
const [mode, a1, a2] = process.argv.slice(2);
if (mode === 'video') (async () => {
  const [cv, ctx] = mk(); const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', a1], { stdio: ['pipe', 'inherit', 'inherit'] });
  const N = T * FPS, T0 = Date.now();
  for (let f = 0; f < N; f++) { frame(ctx, f / FPS); const buf = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); if (f % 90 === 0) process.stderr.write(`${f}/${N} ${((Date.now() - T0) / 1000).toFixed(0)}s\n`); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
})();
else if (mode === 'frame') { const [cv, ctx] = mk(); frame(ctx, +a1); fs.writeFileSync(a2, cv.toBuffer('image/png')); }
else if (mode === 'sheet') { // contact sheet of key frames
  const ts = (process.argv[5] || '0.4,1.6,2.8,3.3,4.6,5.8,6.9,7.8,8.5,9.6,10.8,11.9,12.9,13.9,14.9').split(',').map(Number), cols = 5, tw = 288, th = 512, rows = Math.ceil(ts.length / cols);
  const [sc, s] = mk(tw * cols, th * rows), [cv, ctx] = mk(); s.fillStyle = '#111'; s.fillRect(0, 0, sc.width, sc.height);
  ts.forEach((t, i) => { frame(ctx, t); s.drawImage(cv, (i % cols) * tw, Math.floor(i / cols) * th, tw, th); s.fillStyle = '#FFD34D'; s.font = '20px sans-serif'; s.fillText(t.toFixed(1) + ' s', (i % cols) * tw + 8, Math.floor(i / cols) * th + 52); });
  fs.writeFileSync(a1, sc.toBuffer('image/png'));
} else if (mode === 'emotions') {
  const names = [['neutral', 'NEUTRAL'], ['confident', 'CONFIDENT'], ['surprised', 'SURPRISED'], ['excited', 'EXCITED'], ['thinking', 'THINKING'], ['worried', 'WORRIED']], cw = 520, ch = 640, [sc, s] = mk(cw * 3, ch * 2 + 90), [cv, ctx] = mk();
  const bg = s.createLinearGradient(0, 0, cw * 3, ch * 2); bg.addColorStop(0, '#2A1E2E'); bg.addColorStop(1, '#4A2E24'); s.fillStyle = bg; s.fillRect(0, 0, sc.width, sc.height);
  names.forEach(([k, nm], i) => { ctx.clearRect(0, 0, W, H); ctx.fillStyle = '#3A2A34'; ctx.fillRect(0, 0, W, H); LT_glow(ctx, 900, 500, 900, 'rgba(255,200,130,1)', 0.35);
    figure(ctx, c => { c.translate(540, 1000); c.scale(3.0, 3.0); const e = { ...EMO[k] }; man(c, { e, yaw: k === 'thinking' ? -0.3 : 0.0, tilt: k === 'worried' ? 0.04 : 0 }); }, { rim: { dx: -12, dy: -8, color: '#FFC27A', a: 0.9 }, shadow: 0.2 });
    s.save(); s.beginPath(); s.rect((i % 3) * cw, Math.floor(i / 3) * ch + 90, cw, ch); s.clip(); s.drawImage(cv, 60, 360, 960, 1180, (i % 3) * cw, Math.floor(i / 3) * ch + 90, cw, ch); s.restore();
    s.fillStyle = '#FFE08A'; s.font = '34px sans-serif'; s.textAlign = 'center'; s.fillText(nm, (i % 3) * cw + cw / 2, Math.floor(i / 3) * ch + 90 + ch - 26); });
  s.fillStyle = '#FFFFFF'; s.font = '40px sans-serif'; s.textAlign = 'center'; s.fillText('STYLE TEST · main character in 6 emotions (generic figure, no likeness)', sc.width / 2, 58);
  fs.writeFileSync(a1, sc.toBuffer('image/png'));
}
