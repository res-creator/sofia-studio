// Collage-documentary style kit (reusable): palette, easing, paper cutouts, paper texture,
// tags, camera, and editorial props (restaurant, land slab, burger<->bill morph, coins, bills, pins, map, HQ).
// Canvas 2D via @napi-rs/canvas. All props are drawn in local units around a base point.
const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
const IF = '/usr/share/fonts/opentype/inter/';
try { GlobalFonts.registerFromPath(IF + 'InterDisplay-Black.otf', 'DocBlack'); GlobalFonts.registerFromPath(IF + 'InterDisplay-ExtraBold.otf', 'DocXB'); } catch (e) {}
require('../../lib/fonts'); // fallback fonts (Nunito)
const F = { black: 'DocBlack, NunitoL', xb: 'DocXB, NunitoL' };

const C = {
  paper: '#F7F5F0', ink: '#171717', red: '#E63946', redD: '#C42D3A', yellow: '#FFC857', yellowD: '#E9A93A',
  green: '#26A69A', greenD: '#1C8A80', soil: '#C98E5F', soilD: '#A76E46', soilDD: '#7E5034', cream: '#ECE5D6',
  bill: '#CFE9D4', billD: '#3D8C6A', bun: '#F2A64C', bunD: '#D98629', patty: '#6A3D2D', grey: '#D8D2C6', greyD: '#B9B1A3', rim: '#FFFDF8',
};

// ---------- math / easing ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, u) => a + (b - a) * u;
const seg = (t, t0, t1) => clamp((t - t0) / (t1 - t0));
const E = {
  in: u => u * u * u, out: u => 1 - Math.pow(1 - u, 3), inOut: u => u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2,
  out5: u => 1 - Math.pow(1 - u, 5), inOut5: u => u < 0.5 ? 16 * u ** 5 : 1 - Math.pow(-2 * u + 2, 5) / 2,
  back: (u, s = 1.7) => 1 + (s + 1) * Math.pow(u - 1, 3) + s * Math.pow(u - 1, 2),
  elastic: u => u <= 0 ? 0 : u >= 1 ? 1 : Math.pow(2, -10 * u) * Math.sin((u * 10 - 0.75) * (2 * Math.PI) / 3) + 1,
};
// damped spring 0->1 (overshoot), time in seconds since start
const spring = (dt, f = 3.2, d = 7) => dt <= 0 ? 0 : 1 - Math.exp(-d * dt) * Math.cos(2 * Math.PI * f * dt);
const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
function lerpCol(a, b, u) {
  const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b);
  return '#' + A.map((v, i) => Math.round(lerp(v, B[i], u)).toString(16).padStart(2, '0')).join('');
}

// ---------- paths ----------
function rr(ctx, x, y, w, h, r) {
  const [ra, rb, rc, rd] = Array.isArray(r) ? (r.length === 2 ? [r[0], r[0], r[1], r[1]] : r) : [r, r, r, r];
  const c = Math.min(rc, w / 2, h / 2), d = Math.min(rd, w / 2, h / 2), a = Math.min(ra, w / 2, h - d), b = Math.min(rb, w / 2, h - c);
  ctx.beginPath(); ctx.moveTo(x + a, y); ctx.lineTo(x + w - b, y); ctx.quadraticCurveTo(x + w, y, x + w, y + b);
  ctx.lineTo(x + w, y + h - c); ctx.quadraticCurveTo(x + w, y + h, x + w - c, y + h); ctx.lineTo(x + d, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - d); ctx.lineTo(x, y + a); ctx.quadraticCurveTo(x, y, x + a, y); ctx.closePath();
}
// smooth closed blob through points (midpoint quadratic)
function blob(ctx, pts) {
  ctx.beginPath(); const n = pts.length; const mid = (i, j) => [(pts[i][0] + pts[j][0]) / 2, (pts[i][1] + pts[j][1]) / 2];
  let m = mid(n - 1, 0); ctx.moveTo(m[0], m[1]);
  for (let i = 0; i < n; i++) { const q = mid(i, (i + 1) % n); ctx.quadraticCurveTo(pts[i][0], pts[i][1], q[0], q[1]); }
  ctx.closePath();
}

// ---------- the paper cutout ----------
// One light from top-left. Shadow size follows the real on-screen scale and the plane's elevation
// (LIGHT.elev: 0.4 far, 1 hero, 3 foreground) -> higher layers cast wider, softer, lighter shadows.
const LIGHT = { elev: 1 };
function shadowOn(ctx, o) {
  const m = ctx.getTransform(), el = o.el ?? LIGHT.elev, sc = Math.hypot(m.a, m.b) * el;
  ctx.shadowColor = o.sc || `rgba(60,40,20,${(0.22 / Math.sqrt(Math.max(1, el))).toFixed(3)})`;
  ctx.shadowBlur = (o.sb ?? 22) * sc; ctx.shadowOffsetY = (o.sy ?? 10) * sc; ctx.shadowOffsetX = (o.sy ?? 10) * 0.45 * sc;
}
// soft lifted shadow + white paper rim + flat fill + neat ink outline
function cut(ctx, build, fill, o = {}) {
  ctx.save();
  if (o.shadow !== false) shadowOn(ctx, o);
  build(); ctx.fillStyle = C.rim; ctx.fill();
  if (o.edgeW !== 0) { ctx.lineWidth = o.edgeW ?? 13; ctx.strokeStyle = C.rim; ctx.lineJoin = 'round'; ctx.stroke(); }
  ctx.restore();
  build(); ctx.fillStyle = fill; ctx.fill();
  if (o.lw !== 0) { ctx.lineWidth = o.lw ?? 3.5; ctx.strokeStyle = o.stroke || C.ink; ctx.lineJoin = 'round'; ctx.stroke(); }
}
// soft contact shadow (ellipse) on the surface under an object
function contact(ctx, x, y, w, h, a = 0.22) {
  if (a <= 0.005 || w <= 1) return; ctx.save(); ctx.translate(x, y); ctx.scale(1, h / w);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, w); g.addColorStop(0, `rgba(50,30,15,${a})`); g.addColorStop(1, 'rgba(50,30,15,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, w, 0, 7); ctx.fill(); ctx.restore();
}
// cached sprite (optionally pre-blurred = depth of field) for foreground / background pieces
const SPR = {};
function sprite(key, w, h, draw, blur = 0, elev = 3) {
  if (SPR[key]) return SPR[key];
  const pad = 90, c = createCanvas(w + pad * 2, h + pad * 2), x = c.getContext('2d');
  const e0 = LIGHT.elev; LIGHT.elev = elev; x.translate(pad + w / 2, pad + h / 2); draw(x); LIGHT.elev = e0;
  let out = c; if (blur) { out = createCanvas(c.width, c.height); const y = out.getContext('2d'); y.filter = `blur(${blur}px)`; y.drawImage(c, 0, 0); }
  return (SPR[key] = out);
}
function flat(ctx, build, fill, lw = 0) { build(); ctx.fillStyle = fill; ctx.fill(); if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = C.ink; ctx.lineJoin = 'round'; ctx.stroke(); } }

// ---------- paper texture (overlay, multiply) ----------
function paperTexture(W, H, seed = 3) {
  const c = createCanvas(W, H), x = c.getContext('2d');
  const sw = W >> 1, sh = H >> 1, s = createCanvas(sw, sh), sx = s.getContext('2d'), id = sx.createImageData(sw, sh);
  let r = seed * 9301 + 49297; const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < sw * sh; i++) { const v = 255 - Math.floor(rnd() * rnd() * 34); id.data[i * 4] = v; id.data[i * 4 + 1] = v - 1; id.data[i * 4 + 2] = v - 4; id.data[i * 4 + 3] = 255; }
  sx.putImageData(id, 0, 0); x.drawImage(s, 0, 0, W, H);
  x.lineCap = 'round';
  for (let i = 0; i < 700; i++) { // paper fibers
    const px = rnd() * W, py = rnd() * H, a = rnd() * 6.28, l = 6 + rnd() * 26;
    x.strokeStyle = `rgba(120,100,80,${0.05 + rnd() * 0.07})`; x.lineWidth = 0.8 + rnd();
    x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(a + 0.6) * l * 0.5, py + Math.sin(a + 0.6) * l * 0.5, px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke();
  }
  for (let i = 0; i < 9; i++) { // mottling
    const g = x.createRadialGradient(rnd() * W, rnd() * H, 0, rnd() * W, rnd() * H, 300 + rnd() * 500);
    g.addColorStop(0, 'rgba(200,180,150,0.10)'); g.addColorStop(1, 'rgba(200,180,150,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  }
  const v = x.createRadialGradient(W / 2, H * 0.45, H * 0.35, W / 2, H * 0.45, H * 0.85);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(110,80,50,0.22)'); x.fillStyle = v; x.fillRect(0, 0, W, H);
  return c;
}

// ---------- camera ----------
// screen = anchor + (world - cam) * z, rotated by r
function applyCam(ctx, cam, A, par = 1) {
  const z = Math.pow(cam.z, par);
  ctx.translate(A[0] + (cam.shx || 0), A[1] + (cam.shy || 0)); ctx.rotate((cam.r || 0) * par); ctx.scale(z, z); ctx.translate(-cam.x * par, -cam.y * par);
}

// ---------- text tag (paper label with tape) ----------
function tag(ctx, text, x, y, o = {}) {
  const u = o.u ?? 1; if (u <= 0) return;
  const size = o.size || 44, padX = size * 0.5, padY = size * 0.32;
  ctx.save(); ctx.translate(x, y); ctx.rotate((o.rot || 0) + (1 - E.back(u)) * -0.25); const s = lerp(0.4, 1, E.back(clamp(u * 1.4), 2.4)); ctx.scale(s, s);
  ctx.globalAlpha *= clamp(u * 3);
  ctx.font = `${size}px ${o.font || F.black}`; const tw = ctx.measureText(text).width, w = tw + padX * 2, h = size + padY * 2;
  cut(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 6), o.bg || C.ink, { lw: 0, sb: 16, sy: 8, edgeW: 10 });
  ctx.fillStyle = o.fg || '#FFFFFF'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, size * 0.04);
  if (o.tape !== false) { ctx.save(); ctx.translate(-w / 2 + 14, -h / 2 + 2); ctx.rotate(-0.6); ctx.fillStyle = 'rgba(255,240,200,0.75)'; ctx.fillRect(-30, -11, 60, 22); ctx.restore(); }
  ctx.restore();
}

// ---------- props ----------
function arches(ctx, x, y, s, col, lw = 13) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(-38, 34); ctx.bezierCurveTo(-38, -46, -6, -46, 0, 6); ctx.bezierCurveTo(6, -46, 38, -46, 38, 34);
  ctx.lineWidth = lw; ctx.strokeStyle = col; ctx.lineCap = 'butt'; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore();
}

// Restaurant. (x,y) = ground point, local size ~424 x 500. o: lift, sx, sy (squash), rot, glow(0..1)
function restaurant(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y - (o.lift || 0) * s); ctx.rotate(o.rot || 0); ctx.scale(s * (o.sx || 1), s * (o.sy || 1));
  if (o.glow) { const g = ctx.createRadialGradient(176, -440, 10, 176, -440, 190); g.addColorStop(0, `rgba(255,200,87,${0.8 * o.glow})`); g.addColorStop(1, 'rgba(255,200,87,0)'); ctx.fillStyle = g; ctx.fillRect(-20, -640, 400, 400); }
  cut(ctx, () => rr(ctx, 168, -400, 16, 400, 4), '#3B3B3B', { edgeW: 8, sb: 12 });
  cut(ctx, () => rr(ctx, 114, -500, 124, 116, 22), C.red, { sb: 18 });
  arches(ctx, 176, -436, 1, C.yellow, 13);
  cut(ctx, () => rr(ctx, -190, -236, 380, 236, [8, 8, 0, 0]), C.red);
  // facade panel shading
  ctx.save(); rr(ctx, -190, -236, 380, 236, [8, 8, 0, 0]); ctx.clip(); ctx.fillStyle = 'rgba(0,0,0,0.07)'; ctx.fillRect(60, -236, 140, 236); ctx.restore();
  // awning
  const aw = () => { ctx.beginPath(); ctx.moveTo(-200, -224); ctx.lineTo(200, -224); ctx.lineTo(200, -202); for (let i = 0; i < 20; i++) { const xa = 200 - i * 20; ctx.arc(xa - 10, -202, 10, 0, Math.PI); } ctx.closePath(); };
  cut(ctx, aw, C.rim, { sb: 10, sy: 6, edgeW: 0, lw: 0 });
  ctx.save(); aw(); ctx.clip(); ctx.fillStyle = C.redD; for (let i = -200; i < 200; i += 40) ctx.fillRect(i, -230, 20, 50); ctx.restore();
  aw(); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
  for (const wx of [-168, 52]) {
    cut(ctx, () => rr(ctx, wx, -178, 116, 104, 8), '#FFF1CF', { shadow: false, edgeW: 0, lw: 3.5 });
    ctx.save(); rr(ctx, wx, -178, 116, 104, 8); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.beginPath(); ctx.moveTo(wx + 20, -178); ctx.lineTo(wx + 52, -178); ctx.lineTo(wx + 12, -74); ctx.lineTo(wx - 20, -74); ctx.fill(); ctx.restore();
    ctx.fillStyle = C.ink; ctx.fillRect(wx + 56, -178, 4, 104);
  }
  cut(ctx, () => rr(ctx, -36, -170, 72, 170, [8, 8, 0, 0]), '#2B2B2B', { shadow: false, edgeW: 0 });
  flat(ctx, () => rr(ctx, -26, -158, 52, 96, 5), '#FFE3A0'); ctx.fillStyle = C.yellow; ctx.fillRect(16, -60, 6, 22);
  cut(ctx, () => rr(ctx, -212, -296, 424, 64, 14), C.yellow, { sb: 14 });
  arches(ctx, 0, -266, 0.62, C.red, 11);
  cut(ctx, () => rr(ctx, -198, -16, 396, 16, [0, 0, 4, 4]), '#2E2E2E', { shadow: false, edgeW: 0, lw: 0 });
  ctx.restore();
}

// Land slab. (x,y) = front edge of the top surface. o: w, depth, top, inset, topCol, alpha of soil layers,
// coins (0..1 buried coins), plot (0..1 dashed plot + stakes), grassLip
function slab(ctx, x, y, s, o = {}) {
  const w = o.w ?? 640, d = o.depth ?? 400, top = o.top ?? 64, ins = o.inset ?? 34;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (d > 2) {
    const n = 14, front = () => { ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.lineTo(w / 2, 0); ctx.lineTo(w / 2, d * 0.8);
      for (let i = 0; i <= n; i++) { const xx = w / 2 - (w * i) / n; ctx.lineTo(xx, d * (0.86 + 0.14 * hash(i + 3)) * (i % 2 ? 1 : 0.95)); }
      ctx.lineTo(-w / 2, d * 0.8); ctx.closePath(); };
    cut(ctx, front, o.soilCol || C.soil, { sb: 30, sy: 18 });
    ctx.save(); front(); ctx.clip();
    for (const [f, col] of [[0.38, o.soilD || C.soilD], [0.7, o.soilDD || C.soilDD]]) {
      ctx.beginPath(); ctx.moveTo(-w / 2, d * f); for (let i = 0; i <= 10; i++) ctx.lineTo(-w / 2 + (w * i) / 10, d * f + Math.sin(i * 1.7 + f * 9) * 9);
      ctx.lineTo(w / 2, d + 40); ctx.lineTo(-w / 2, d + 40); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
    }
    for (let i = 0; i < 16; i++) { // pebbles
      const px = -w / 2 + 20 + hash(i * 7) * (w - 40), py = 20 + hash(i * 13) * d * 0.85, r = 5 + hash(i * 3) * 9;
      ctx.fillStyle = 'rgba(255,240,220,0.28)'; ctx.beginPath(); ctx.ellipse(px, py, r * 1.3, r, hash(i) * 3, 0, 7); ctx.fill();
    }
    if (o.coins) for (let i = 0; i < 9; i++) {
      const px = -w / 2 + 50 + hash(i * 5 + 1) * (w - 100), py = d * (0.42 + hash(i * 11 + 2) * 0.42), a = clamp(o.coins * 2.2 - i * 0.13);
      if (a > 0) { ctx.save(); ctx.globalAlpha = a; coin(ctx, px, py, 22 * E.back(a), hash(i) * 2 - 1, { flat: true }); ctx.restore(); }
    }
    ctx.restore();
    front(); ctx.lineWidth = 3.5; ctx.strokeStyle = C.ink; ctx.stroke();
  }
  const topB = () => { ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.lineTo(w / 2, 0); ctx.lineTo(w / 2 - ins, -top); ctx.lineTo(-w / 2 + ins, -top); ctx.closePath(); };
  cut(ctx, topB, o.topCol || C.green, { shadow: d <= 2, sb: 26, sy: 14 });
  if (o.grassLip !== false && d > 2) flat(ctx, () => rr(ctx, -w / 2 - 4, -6, w + 8, 20, 9), o.lipCol || C.greenD, 3);
  if (o.plot) { // plot boundary + stakes
    const p = o.plot; ctx.save(); ctx.globalAlpha = clamp(p * 3);
    const px = w * 0.3, pt = top * 0.78, pts = [[-px, -top * 0.14], [px, -top * 0.14], [px - ins * 0.6, -pt], [-px + ins * 0.6, -pt]];
    ctx.setLineDash([12, 9]); ctx.lineDashOffset = -p * 60; ctx.lineWidth = 4; ctx.strokeStyle = C.rim; ctx.beginPath(); pts.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); ctx.stroke(); ctx.setLineDash([]);
    pts.forEach((q, i) => { const a = E.back(clamp(p * 2 - i * 0.18)); if (a <= 0) return; ctx.save(); ctx.translate(q[0], q[1]); ctx.scale(a, a);
      flat(ctx, () => rr(ctx, -3, -34, 6, 34, 2), '#5A4030'); flat(ctx, () => { ctx.beginPath(); ctx.moveTo(3, -34); ctx.lineTo(28, -26); ctx.lineTo(3, -18); ctx.closePath(); }, C.yellow, 2.5); ctx.restore(); });
    ctx.restore();
  }
  ctx.restore();
}

// Burger <-> bill-stack morph. Layer specs: [w, h, rTop, rBot, color, rot, x, yBottom]
const BURGER = [
  [340, 60, 10, 30, C.bun, 0, 0, 0], [362, 62, 31, 31, C.patty, 0, 0, 56], [372, 22, 5, 5, C.yellow, 0, 0, 114],
  [384, 24, 12, 12, '#56B870', 0, 0, 132], [344, 26, 13, 13, C.red, 0, 0, 152], [352, 132, 140, 14, C.bun, 0, 0, 172],
];
const BILLS = BURGER.map((_, i) => [400, 196, 12, 12, i % 2 ? '#C3E3CA' : C.bill, [0.05, -0.07, 0.04, -0.03, 0.08, -0.02][i], [-14, 12, -6, 18, -10, 4][i], i * 26]);
function burgerMoney(ctx, x, y, s, u, o = {}) { // u: 0 burger .. 1 bills; o.sx/sy squash, o.stagger
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.sx || 1), s * (o.sy || 1));
  BURGER.forEach((A, i) => {
    const B = BILLS[i], k = E.inOut(clamp(u * 1.6 - i * 0.12)), P = A.map((a, j) => j === 4 ? lerpCol(a, B[4], k) : lerp(a, B[j], k));
    const [w, h, rt, rb, col, rot, lx, yb] = P, pulse = 1 + Math.sin(k * Math.PI) * 0.1;
    ctx.save(); ctx.translate(lx, -yb - h / 2); ctx.rotate(rot); ctx.scale(pulse, pulse);
    const build = () => (i === 3 && k < 0.5) ? lettuce(ctx, w, h) : rr(ctx, -w / 2, -h / 2, w, h, [rt, rt, rb, rb]);
    cut(ctx, build, col, { sb: 14, sy: 7, edgeW: k > 0.5 ? 12 : 9 });
    if (k < 0.5) { // burger details
      ctx.save(); ctx.globalAlpha = 1 - k * 2;
      if (i === 5) for (let j = 0; j < 9; j++) { const sx = -120 + hash(j * 3) * 240, sy = -40 + hash(j * 5) * 34; ctx.fillStyle = '#FFF4DC'; ctx.beginPath(); ctx.ellipse(sx, sy, 9, 5, hash(j) * 2, 0, 7); ctx.fill(); }
      if (i === 5) { ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.ellipse(-80, -38, 48, 14, -0.3, 0, 7); ctx.fill(); }
      if (i === 2) { ctx.fillStyle = C.yellow; ctx.strokeStyle = C.ink; ctx.lineWidth = 3; for (const dx of [-120, 30, 140]) { ctx.beginPath(); ctx.moveTo(dx - 18, 8); ctx.lineTo(dx + 18, 8); ctx.lineTo(dx, 34); ctx.closePath(); ctx.fill(); ctx.stroke(); } }
      ctx.restore();
    } else { // bill details
      ctx.save(); ctx.globalAlpha = (k - 0.5) * 2;
      ctx.strokeStyle = C.billD; ctx.lineWidth = 3; rr(ctx, -w / 2 + 16, -h / 2 + 16, w - 32, h - 32, 6); ctx.stroke();
      ctx.fillStyle = 'rgba(61,140,106,0.18)'; ctx.beginPath(); ctx.arc(0, 0, 54, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.billD; ctx.font = `72px ${F.black}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('$', 0, 4);
      for (const [cx, cy] of [[-150, -62], [150, 62]]) { ctx.beginPath(); ctx.arc(cx, cy, 14, 0, 7); ctx.stroke(); }
      ctx.restore();
    }
    ctx.restore();
  });
  ctx.restore();
}
function lettuce(ctx, w, h) {
  ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2); ctx.lineTo(w / 2, -h / 2);
  for (let i = 0; i <= 12; i++) { const xx = w / 2 - (w * i) / 12; ctx.quadraticCurveTo(xx + w / 24, h / 2 + 12, xx, h / 2 - 2); }
  ctx.closePath();
}

// coin: spin -1..1 (scaleX = cos), o.flat = no shadow
function coin(ctx, x, y, r, spin = 1, o = {}) {
  const sx = Math.max(0.12, Math.abs(Math.cos(spin * 1.4)));
  ctx.save(); ctx.translate(x, y);
  if (!o.flat) { ctx.fillStyle = 'rgba(60,40,20,0.18)'; ctx.beginPath(); ctx.ellipse(4, r * 0.45, r * sx, r, 0, 0, 7); ctx.fill(); }
  ctx.scale(sx, 1);
  ctx.fillStyle = C.yellowD; ctx.beginPath(); ctx.arc(0, r * 0.12, r, 0, 7); ctx.fill();
  ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.lineWidth = Math.max(1.5, r * 0.12); ctx.strokeStyle = C.ink; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, r * 0.66, 0, 7); ctx.strokeStyle = C.yellowD; ctx.lineWidth = r * 0.1; ctx.stroke();
  ctx.fillStyle = o.markCol || C.ink; ctx.font = `${Math.round(r * 1.05)}px ${F.black}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('$', 0, r * 0.06);
  ctx.restore();
}
function bill(ctx, x, y, s, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  cut(ctx, () => rr(ctx, -50, -26, 100, 52, 5), C.bill, { sb: 8, sy: 5, edgeW: 6, lw: 2.5 });
  ctx.strokeStyle = C.billD; ctx.lineWidth = 2; rr(ctx, -42, -18, 84, 36, 3); ctx.stroke();
  ctx.fillStyle = C.billD; ctx.font = `30px ${F.black}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('$', 0, 2);
  ctx.restore();
}
function pin(ctx, x, y, s) { // tip at (x,y)
  if (s <= 0.01) return; ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = 'rgba(60,40,20,0.22)'; ctx.beginPath(); ctx.ellipse(0, 2, 14 * s, 5 * s, 0, 0, 7); ctx.fill();
  ctx.scale(s, s);
  cut(ctx, () => { ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-10, -18, -26, -30, -26, -50); ctx.arc(0, -50, 26, Math.PI, 0); ctx.bezierCurveTo(26, -30, 10, -18, 0, 0); ctx.closePath(); }, C.red, { sb: 10, sy: 6, edgeW: 8, lw: 3 });
  ctx.fillStyle = C.rim; ctx.beginPath(); ctx.arc(0, -50, 16, 0, 7); ctx.fill(); arches(ctx, 0, -50, 0.28, C.red, 14);
  ctx.restore();
}
function sparkle(ctx, x, y, r, col = C.yellow) {
  if (r <= 0.5) return; ctx.save(); ctx.translate(x, y); ctx.fillStyle = col; ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5;
  ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4, rr2 = i % 2 ? r * 0.28 : r; ctx.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2); } ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
}
function puff(ctx, x, y, u, dir = 1) { // dust puff 0..1
  if (u <= 0 || u >= 1) return; ctx.save(); ctx.globalAlpha = (1 - u) * 0.9;
  for (let i = 0; i < 4; i++) { const r = (14 + i * 6) * (0.5 + E.out(u)), px = x + dir * (E.out(u) * (50 + i * 30)), py = y - E.out(u) * (8 + i * 12);
    ctx.fillStyle = C.rim; ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(px, py, r, 0, 7); ctx.fill(); ctx.stroke(); }
  ctx.restore();
}

// HQ tower. (x,y) = ground. o.lit 0..1 windows lit
function hq(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  cut(ctx, () => rr(ctx, -110, -600, 220, 600, [10, 10, 0, 0]), '#2B2D31', { sb: 28, sy: 14 });
  cut(ctx, () => rr(ctx, -80, -660, 160, 70, [10, 10, 0, 0]), C.red, { sb: 14 });
  arches(ctx, 0, -628, 0.62, C.yellow, 13);
  const cols = 4, rows = 10, lit = o.lit || 0;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const k = (rows - 1 - r) * cols + c, on = (k + hash(k) * 3) / (rows * cols + 3) < lit;
    ctx.fillStyle = on ? C.yellow : '#4A4D55'; rr(ctx, -84 + c * 44, -560 + r * 52, 32, 36, 4); ctx.fill();
  }
  flat(ctx, () => rr(ctx, -30, -70, 60, 70, [6, 6, 0, 0]), '#FFE3A0', 3);
  ctx.restore();
}


// fries carton (local ~170 x 260, base at y=100)
function fries(ctx, s = 1) {
  ctx.save(); ctx.scale(s, s);
  for (let i = 0; i < 9; i++) { const x = -60 + i * 15, h = 95 + hash(i + 2) * 55; ctx.save(); ctx.translate(x, -20); ctx.rotate((hash(i + 5) - 0.5) * 0.35);
    cut(ctx, () => rr(ctx, -8, -h, 16, h, 4), i % 2 ? C.yellow : '#FFD877', { sb: 8, sy: 4, edgeW: 5, lw: 2.5 }); ctx.restore(); }
  cut(ctx, () => { ctx.beginPath(); ctx.moveTo(-86, -42); ctx.quadraticCurveTo(0, -8, 86, -42); ctx.lineTo(62, 100); ctx.lineTo(-62, 100); ctx.closePath(); }, C.red);
  arches(ctx, 0, 38, 0.8, C.yellow, 12); ctx.restore();
}
// receipt strip (local 150 x 330)
function receipt(ctx, s = 1) {
  ctx.save(); ctx.scale(s, s);
  cut(ctx, () => { ctx.beginPath(); ctx.moveTo(-75, -165); ctx.lineTo(75, -165); ctx.lineTo(75, 150); for (let i = 0; i <= 10; i++) ctx.lineTo(75 - i * 15, i % 2 ? 165 : 150); ctx.closePath(); }, '#FFFFFF', { lw: 2.5 });
  ctx.fillStyle = 'rgba(23,23,23,0.55)'; for (let i = 0; i < 9; i++) { ctx.fillRect(-55, -130 + i * 26, 60 + hash(i) * 40, 7); ctx.fillRect(30, -130 + i * 26, 25, 7); }
  ctx.fillStyle = C.ink; ctx.font = `30px ${F.black}`; ctx.textAlign = 'left'; ctx.fillText('TOTAL', -55, 125); ctx.fillStyle = C.red; ctx.fillRect(-55, 92, 110, 5);
  ctx.restore();
}
function cloud(ctx, s = 1) {
  ctx.save(); ctx.scale(s, s);
  cut(ctx, () => { ctx.beginPath(); ctx.moveTo(-150, 40); ctx.arc(-95, 10, 55, Math.PI * 0.9, Math.PI * 1.6); ctx.arc(-10, -25, 75, Math.PI * 1.1, Math.PI * 1.9); ctx.arc(85, 5, 60, Math.PI * 1.3, Math.PI * 0.05); ctx.lineTo(150, 40); ctx.closePath(); }, '#FFFFFF', { lw: 3, sb: 26, sy: 14 });
  ctx.restore();
}
// pale paper skyline (back plane). base at y=0, width ~1500
function skyline(ctx, u = 1) {
  const cols = ['#E7DFCD', '#DDE7E2', '#EBD8C6', '#E3DCCD'];
  for (let i = 0; i < 11; i++) {
    const w = 110 + hash(i * 3) * 90, h = (180 + hash(i * 7) * 330) * E.back(clamp(u * 1.6 - i * 0.05), 1.3), x = -760 + i * 140 + hash(i) * 30;
    if (h <= 2) continue;
    cut(ctx, () => rr(ctx, x, -h, w, h + 4, [6, 6, 0, 0]), cols[i % 4], { lw: 2.5, stroke: 'rgba(23,23,23,0.35)', sb: 16, sy: 6, edgeW: 7, el: 0.6 });
    ctx.fillStyle = 'rgba(255,253,248,0.75)';
    for (let r = 0; r < Math.floor((h - 40) / 44); r++) for (let c = 0; c < Math.floor((w - 24) / 34); c++) ctx.fillRect(x + 16 + c * 34, -h + 24 + r * 44, 16, 20);
  }
}

// ---------- world map (lon/lat polygons, simplified) ----------
const LAND = [
  [[-165, 65], [-140, 70], [-110, 72], [-80, 72], [-62, 60], [-55, 50], [-70, 44], [-76, 35], [-81, 25], [-90, 29], [-97, 26], [-97, 18], [-88, 15], [-83, 9], [-79, 8], [-92, 15], [-105, 20], [-112, 29], [-118, 34], [-124, 40], [-125, 49], [-133, 56], [-150, 59], [-165, 59]],
  [[-48, 60], [-22, 70], [-22, 78], [-60, 79], [-70, 77], [-55, 70]],
  [[-79, 9], [-60, 10], [-50, 0], [-35, -7], [-40, -22], [-48, -28], [-57, -37], [-65, -42], [-68, -53], [-74, -50], [-72, -30], [-71, -18], [-81, -5]],
  [[-10, 36], [-9, 43], [-2, 44], [-4, 48], [2, 51], [8, 54], [10, 58], [5, 62], [15, 69], [28, 71], [40, 67], [45, 58], [42, 47], [30, 45], [26, 40], [20, 40], [15, 38], [12, 44], [7, 44], [3, 43], [-2, 37]],
  [[-5, 50], [1, 51], [0, 55], [-3, 58], [-6, 57], [-5, 54]],
  [[-17, 15], [-16, 22], [-10, 30], [-5, 36], [10, 37], [20, 32], [32, 31], [35, 28], [43, 12], [51, 12], [42, -2], [40, -15], [35, -25], [28, -33], [19, -35], [13, -22], [12, -6], [9, 4], [-8, 5], [-14, 9]],
  [[42, 47], [45, 58], [40, 67], [60, 70], [80, 73], [105, 77], [140, 72], [170, 68], [180, 65], [160, 58], [143, 50], [135, 43], [127, 38], [121, 31], [118, 24], [108, 21], [106, 10], [100, 13], [98, 8], [93, 20], [88, 22], [80, 10], [73, 20], [67, 25], [57, 25], [50, 30], [36, 36], [36, 41]],
  [[35, 30], [43, 13], [52, 16], [59, 22], [50, 27], [47, 30]],
  [[130, 32], [135, 34], [140, 36], [142, 40], [141, 44], [138, 38], [132, 34]],
  [[114, -22], [122, -18], [131, -12], [137, -12], [142, -11], [146, -19], [153, -26], [150, -37], [141, -38], [133, -32], [115, -34]],
  [[95, 5], [105, -6], [115, -8], [120, -4], [118, 2], [108, 2]],
];
const MAPW = 920, MAPH = 580;
const ll = (lon, lat) => [-MAPW / 2 + ((lon + 170) / 360) * MAPW, -MAPH + ((82 - lat) / 142) * MAPH]; // relative to card front edge
function continents(ctx, o = {}) { // o.shrink(i) -> scale 0..1
  LAND.forEach((poly, i) => {
    const P = poly.map(p => ll(p[0], p[1])); const cx = P.reduce((a, p) => a + p[0], 0) / P.length, cy = P.reduce((a, p) => a + p[1], 0) / P.length;
    const k = o.shrink ? o.shrink(i) : 1; if (k <= 0.01) return;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k); ctx.translate(-cx, -cy);
    cut(ctx, () => blob(ctx, P), C.green, { sb: 10, sy: 6, edgeW: 9, lw: 3 }); ctx.restore();
  });
}

module.exports = { LIGHT, contact, sprite, fries, receipt, cloud, skyline, C, F, clamp, lerp, seg, E, spring, hash, lerpCol, rr, blob, cut, flat, paperTexture, applyCam, tag, arches, restaurant, slab, burgerMoney, coin, bill, pin, sparkle, puff, hq, continents, ll, MAPW, MAPH };
