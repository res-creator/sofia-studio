// HQ illustrated character library: shaded humans, animals, props.
const { createCanvas, Path2D, GlobalFonts } = require('@napi-rs/canvas');
const F = __dirname + '/node_modules/@expo-google-fonts/';
GlobalFonts.registerFromPath(F + 'unbounded/900Black/Unbounded_900Black.ttf', 'Unb9');
GlobalFonts.registerFromPath(F + 'unbounded/700Bold/Unbounded_700Bold.ttf', 'Unb7');
GlobalFonts.registerFromPath(F + 'nunito/900Black/Nunito_900Black.ttf', 'Nun9');
GlobalFonts.registerFromPath(F + 'nunito/800ExtraBold/Nunito_800ExtraBold.ttf', 'Nun8');
GlobalFonts.registerFromPath(F + 'nunito/700Bold/Nunito_700Bold.ttf', 'Nun7');
GlobalFonts.registerFromPath(F + 'caveat/700Bold/Caveat_700Bold.ttf', 'Cav7');

// ---------- math
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const P = (t, a, b) => clamp((t - a) / (b - a));
const eOut = t => 1 - Math.pow(1 - clamp(t), 3);
const eIn = t => Math.pow(clamp(t), 3);
const eIO = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const eBack = (t, s = 1.9) => { t = clamp(t); const c3 = s + 1; return 1 + c3 * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2); };
function hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function noise1(t) { const i = Math.floor(t), f = t - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; }

// ---------- colour
function h2r(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function r2h(r, g, b) { return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join(''); }
function mix(a, b, t) { const A = h2r(a), B = h2r(b); return r2h(lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t)); }
function shade(h, f) { const [r, g, b] = h2r(h); return r2h(r * f, g * f, b * f); }
function rgba(h, a) { const [r, g, b] = h2r(h); return `rgba(${r},${g},${b},${a})`; }
const SHADOW = '#5B3C6E', WARM = '#FFF4DC', INK = '#2C1E24';
const dark = (c, k = 0.24) => mix(shade(c, 0.86), SHADOW, k);
const hiCol = (c, k = 0.3) => mix(c, WARM, k);
const lineOf = c => mix(shade(c, 0.5), INK, 0.45);
// Character drawing style: 'v1' (published look, default) or 'v2' (cleaner legs/shoes). Per character: cfg.style; globally: env CHAR_STYLE.
const STYLE = process.env.CHAR_STYLE || 'v1';
const styleOf = cfg => cfg.style || STYLE;

// ---------- path builder with offset (for cel shading crescents)
function pen(p, dx, dy) {
  return {
    m: (x, y) => p.moveTo(x + dx, y + dy), l: (x, y) => p.lineTo(x + dx, y + dy),
    b: (a, b, c, d, e, f) => p.bezierCurveTo(a + dx, b + dy, c + dx, d + dy, e + dx, f + dy),
    q: (a, b, c, d) => p.quadraticCurveTo(a + dx, b + dy, c + dx, d + dy),
    e: (x, y, rx, ry, r = 0, a0 = 0, a1 = Math.PI * 2, ccw = false) => p.ellipse(x + dx, y + dy, Math.max(.1, rx), Math.max(.1, ry), r, a0, a1, ccw),
    a: (x, y, r, a0 = 0, a1 = Math.PI * 2, ccw = false) => p.arc(x + dx, y + dy, Math.max(.1, r), a0, a1, ccw),
    z: () => p.closePath(),
  };
}
function mk(fn, dx = 0, dy = 0) { const p = new Path2D(); fn(pen(p, dx, dy)); return p; }
function crescent(fn, dx, dy) { const p = new Path2D(); p.rect(-1e5, -1e5, 2e5, 2e5); fn(pen(p, dx, dy)); return p; }
// paint a shape: gradient base, cel shadow (lower-right), rim light (upper-left), outline
function paint(ctx, fn, base, o = {}) {
  const p = mk(fn);
  const bx = o.box;
  if (bx) { const g = ctx.createLinearGradient(bx[0], bx[1], bx[2], bx[3]); g.addColorStop(0, hiCol(base, o.hk ?? 0.18)); g.addColorStop(0.5, base); g.addColorStop(1, shade(base, o.gk ?? 0.92)); ctx.fillStyle = g; }
  else ctx.fillStyle = base;
  ctx.fill(p);
  const sd = o.sd ?? 14, hd = o.hd ?? 7;
  if (sd > 0 || hd > 0) {
    ctx.save(); ctx.clip(p);
    if (sd > 0) { ctx.fillStyle = o.shadow || dark(base, o.sk ?? 0.24); ctx.globalAlpha = o.sa ?? 0.85; ctx.fill(crescent(fn, -sd * 0.8, -sd * 0.55), 'evenodd'); }
    if (hd > 0) { ctx.fillStyle = o.hi || hiCol(base, 0.55); ctx.globalAlpha = o.ha ?? 0.55; ctx.fill(crescent(fn, hd * 0.7, hd * 0.75), 'evenodd'); }
    if (o.inner) o.inner(ctx);
    ctx.restore();
  }
  if (o.lw !== 0) { ctx.lineWidth = o.lw ?? 4.5; ctx.strokeStyle = o.line || lineOf(base); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(p); }
  return p;
}
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function capsule(x1, y1, r1, x2, y2, r2) {
  return q => { const a = Math.atan2(y2 - y1, x2 - x1), n = a + Math.PI / 2;
    q.m(x1 + Math.cos(n) * r1, y1 + Math.sin(n) * r1); q.l(x2 + Math.cos(n) * r2, y2 + Math.sin(n) * r2);
    q.a(x2, y2, r2, n, n - Math.PI, true); q.l(x1 - Math.cos(n) * r1, y1 - Math.sin(n) * r1); q.a(x1, y1, r1, n + Math.PI, n, true); q.z(); };
}
function limb(pts) {
  return q => {
    const n = pts.length, L = [], R = [], th = [];
    for (let i = 0; i < n; i++) { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)]; const ang = Math.atan2(b.y - a.y, b.x - a.x); th.push(ang); const nx = -Math.sin(ang), ny = Math.cos(ang); L.push([pts[i].x + nx * pts[i].r, pts[i].y + ny * pts[i].r]); R.push([pts[i].x - nx * pts[i].r, pts[i].y - ny * pts[i].r]); }
    q.m(L[0][0], L[0][1]);
    for (let i = 1; i < n - 1; i++) q.q(L[i][0], L[i][1], (L[i][0] + L[i + 1][0]) / 2, (L[i][1] + L[i + 1][1]) / 2);
    q.l(L[n - 1][0], L[n - 1][1]);
    q.a(pts[n - 1].x, pts[n - 1].y, pts[n - 1].r, th[n - 1] + Math.PI / 2, th[n - 1] - Math.PI / 2, true);
    for (let i = n - 2; i > 0; i--) q.q(R[i][0], R[i][1], (R[i][0] + R[i - 1][0]) / 2, (R[i][1] + R[i - 1][1]) / 2);
    q.l(R[0][0], R[0][1]);
    q.a(pts[0].x, pts[0].y, pts[0].r, th[0] - Math.PI / 2, th[0] + Math.PI / 2, true); q.z();
  };
}
const midp = (a, b, k, r) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), r });
function softShadow(ctx, x, y, rx, ry, a = 0.28) { const g = ctx.createRadialGradient(x, y, 0, x, y, rx); g.addColorStop(0, `rgba(40,25,40,${a})`); g.addColorStop(1, 'rgba(40,25,40,0)'); ctx.save(); ctx.translate(x, y); ctx.scale(1, ry / rx); ctx.translate(-x, -y); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rx, 0, 7); ctx.fill(); ctx.restore(); }

// ======================================================================
// HUMAN
// cfg: static look; st: dynamic pose
function human(ctx, cfg, st = {}) {
  const t = st.t || 0;
  const h = cfg.h || 1500, B = Object.assign({ shoulder: 1, hip: 1, arm: 1, leg: 1, belly: 0, chest: 0, muscle: 0, neck: 1 }, cfg.build || {});
  const headH = h * 0.165 * (cfg.headScale || 1.14), hw = headH * 0.43 * (cfg.headW || 1), hh = headH * 0.5;
  const breathe = Math.sin(t * 2.1 + (cfg.seed || 0)) * 3 * (st.breathe ?? 1);
  const drop = st.drop || 0; // lower whole upper body (squats/sitting)
  const yNeck = -h + headH * 1.03 + drop, ySh = yNeck + 16 + breathe * 0.3;
  const sw = hw * 1.75 * B.shoulder, ww = sw * (0.66 - B.muscle * 0.1 + B.belly * 0.25), hipW = sw * 0.8 * B.hip;
  const yWaist = -h * 0.56 + drop, yHip = -h * 0.47 + drop, yCrotch = -h * 0.42 + drop;
  const skin = cfg.skin || '#F3C9A8';
  const lean = st.lean || 0;
  ctx.save();
  if (st.flip) ctx.scale(-1, 1);
  // shadow on floor
  if (st.floorShadow !== false) softShadow(ctx, 0, 0, sw * 1.5, 34, 0.25);
  const items = st.items || {};
  // ---- back hair (long hair behind body)
  const head = { x: lean * 40 + (st.headX || 0), y: -h + hh + drop + breathe * 0.4 + (st.headY || 0) };
  // ---- back hair goes BEHIND neck and body (long hair must not cut across the neck/shoulders)
  { const hair = cfg.hair || { style: 'short', col: '#3A2820' }; ctx.save(); ctx.translate(head.x, head.y); ctx.rotate(st.tilt || 0); hairBack(ctx, cfg, hair, hw, hh, t, st); ctx.restore(); }
  // ---- legs
  if (st.legs !== false) legs(ctx, cfg, st, { h, hipW, yHip, yCrotch, drop, skin, B });
  // ---- torso
  ctx.save(); ctx.translate(lean * 20, 0);
  torso(ctx, cfg, st, { h, sw, ww, hipW, yNeck, ySh, yWaist, yHip, yCrotch, hw, skin, B, breathe });
  ctx.restore();
  if (st.afterTorso) st.afterTorso(ctx, { head, ySh, sw, h });
  // ---- arms (behind head, over torso)
  const shL = { x: -sw * 0.84 + lean * 20, y: ySh + 46 }, shR = { x: sw * 0.84 + lean * 20, y: ySh + 46 };
  const armBack = st.armsBehind || {};
  const drawArm = (side) => arm(ctx, cfg, st, side, side < 0 ? shL : shR, { h, B, skin, t });
  // neck + head
  const drawHead = () => { ctx.save(); ctx.translate(head.x, head.y); ctx.rotate(st.tilt || 0); headFn(ctx, cfg, st, { hw, hh, skin, t }); ctx.restore(); };
  const drawArms = () => { if (!st.noArms) { if (!st.noArmL) drawArm(-1); if (!st.noArmR) drawArm(1); } };
  if (st.armsFirst) { drawArms(); neck(ctx, cfg, { hw, yNeck, head, skin, B }); drawHead(); }
  else { neck(ctx, cfg, { hw, yNeck, head, skin, B }); if (st.headFirst) { drawHead(); drawArms(); } else { drawArms(); drawHead(); } }
  if (st.front) st.front(ctx, { head, ySh, sw, h });
  ctx.restore();
  return { head, ySh, sw, h, hw, hh };
}

function legs(ctx, cfg, st, g) {
  const { h, hipW, yHip, yCrotch, drop, skin, B } = g;
  const pose = st.legPose || 'stand';
  const bottom = cfg.bottom || { type: 'trousers', col: '#38425A' };
  const lr = hipW * 0.46 * B.leg, cr = lr * 0.62, v2 = styleOf(cfg) === 'v2';
  const legDraw = (s) => {
    let hx = s * hipW * 0.5, hy = yHip + 20, kx, ky, ax, ay = -40;
    if (pose === 'stand') { kx = s * hipW * 0.5; ky = -h * 0.24; ax = s * hipW * 0.48; }
    if (pose === 'wide') { kx = s * hipW * 0.75; ky = -h * 0.24; ax = s * hipW * 0.9; }
    if (pose === 'squat') { const d = clamp(drop / (h * 0.3)); kx = s * hipW * (0.62 + d * 0.75); ky = lerp(-h * 0.24, (yHip - 40) * 0.5, d * 0.8); ax = s * hipW * 0.72; }
    if (pose === 'sit') { kx = s * hipW * 0.78; ky = yHip + 90; ax = s * hipW * 0.74; ay = -40; hy = yHip + 10; }
    if (pose === 'walk') { const ph = Math.sin((st.t || 0) * 8 + (s > 0 ? Math.PI : 0)); kx = s * hipW * 0.5; ky = -h * 0.24 - Math.max(0, ph) * 40; ax = s * hipW * 0.48; ay = -40 - Math.max(0, ph) * 70; }
    const isPants = ['trousers', 'leggings', 'joggers', 'jeans'].includes(bottom.type);
    const Hp = { x: hx, y: hy, r: lr }, K = { x: kx, y: ky, r: lr * 0.66 }, An = { x: ax, y: ay, r: cr * 0.72 };
    const pts = [Hp, midp(Hp, K, 0.45, lr * 0.9), K, midp(K, An, 0.35, lr * 0.72), An];
    const lbox = [hx - lr, hy, hx + lr, ay];
    if (v2) { legV2(ctx, cfg, st, s, { pts, lbox, isPants, bottom, skin, hx, hy, kx, ky, ax, ay, lr, cr, An, K, Hp }); return; }
    if (isPants) { const flare = bottom.type === 'trousers' || bottom.type === 'jeans' ? 1.35 : bottom.type === 'joggers' ? 1.05 : 1.0; const pp = pts.map((p, i) => ({ ...p, r: i < 2 ? p.r * 1.05 : i === 4 ? p.r * flare * 1.1 : p.r * 1.06 }));
      paint(ctx, limb(pp), bottom.col, { box: lbox, sd: 12, hd: 6, inner: c => { c.strokeStyle = rgba(dark(bottom.col, .4), .35); c.lineWidth = 3.5; c.beginPath(); c.moveTo(kx - 18, ky - 10); c.quadraticCurveTo(kx, ky + 6, kx + 18, ky - 8); c.moveTo(kx - 12, ky + 14); c.quadraticCurveTo(kx, ky + 26, kx + 14, ky + 12); c.stroke(); if (bottom.dots) { c.fillStyle = bottom.dots; for (let i = 0; i < 40; i++) { const yy = lerp(hy, ay, (i % 10) / 10 + 0.04), xx = lerp(hx, ax, (i % 10) / 10) + ((Math.floor(i / 10) - 1.5) * lr * 0.55) + ((i % 2) * lr * 0.2); c.beginPath(); c.arc(xx, yy, 10, 0, 7); c.fill(); } } if (bottom.type === 'jeans') { c.strokeStyle = rgba('#F2C14E', .5); c.lineWidth = 2.5; c.setLineDash([6, 6]); c.beginPath(); c.moveTo(hx + s * lr * 0.7, hy); c.lineTo(ax + s * cr * 0.8, ay); c.stroke(); c.setLineDash([]); } } }); }
    else {
      paint(ctx, limb(pts), skin, { box: lbox, sd: 12, hd: 6 });
      if (cfg.socks) paint(ctx, limb([midp(K, An, 0.4, lr * 0.74), { ...An, r: An.r * 1.12 }]), cfg.socks, { sd: 6, hd: 4, inner: c => { c.strokeStyle = cfg.sockStripe || '#E04848'; c.lineWidth = 8; const sy = lerp(ky, ay, 0.5); c.beginPath(); c.moveTo(ax - 60, sy); c.lineTo(ax + 60, sy); c.stroke(); } });
      if (bottom.type === 'shorts') paint(ctx, limb([{ ...Hp, y: hy - 10, r: lr * 1.12 }, midp(Hp, K, 0.55, lr * 1.0)]), bottom.col, { sd: 10, hd: 5 });
    }
    // shoe
    shoe(ctx, cfg, ax + s * 8, ay + 22, s);
  };
  legDraw(-1); legDraw(1);
  if (bottom.type === 'skirt') paint(ctx, q => { q.m(-hipW * 1.02, yHip - 30); q.l(hipW * 1.02, yHip - 30); q.l(hipW * 1.25, -h * 0.27); q.q(0, -h * 0.25, -hipW * 1.25, -h * 0.27); q.z(); }, bottom.col, { box: [-hipW, yHip, hipW, -h * 0.27], sd: 18 });
  // hips/pelvis band
  if (bottom.type !== 'skirt') paint(ctx, q => { q.m(-hipW * 1.0, yHip - 40); q.l(hipW * 1.0, yHip - 40); q.q(hipW * 1.08, yHip + 30, hipW * 0.8, yCrotch + 40); q.q(0, yCrotch + 60, -hipW * 0.8, yCrotch + 40); q.q(-hipW * 1.08, yHip + 30, -hipW, yHip - 40); q.z(); }, bottom.col, { box: [-hipW, yHip, hipW, yCrotch], sd: 14, lw: bottom.type === 'shorts' ? 4.5 : 0 });
}
// v2 leg end: the shoe sits with its sole on the ankle's floor line (y = ay + 40), is scaled to the leg,
// and trousers end in a straight hem that falls over the top of the shoe instead of a round cap under the floor.
function legV2(ctx, cfg, st, s, L) {
  const { pts, lbox, isPants, bottom, skin, hx, hy, kx, ky, ax, ay, lr, cr, An } = L;
  const pantsFlare = isPants ? (bottom.type === 'trousers' || bottom.type === 'jeans' ? 1.12 : bottom.type === 'joggers' ? 1.0 : 0.95) : 0;
  const hemR = isPants ? An.r * pantsFlare * 1.08 : An.r;
  const fs = clamp(Math.max(lr / 58, hemR * 2 / 80), 1.0, 1.7);   // shoe scale: from leg thickness, never narrower than the trouser hem
  const sole = ay + 40;                                  // floor contact (0 when standing)
  const lift = clamp((-40 - ay) / 70);                   // walk: foot raised -> heel up a little
  const sx = ax + s * 8 * fs;
  const drawShoe = () => shoeV2(ctx, cfg, sx, sole, s, fs, lift);
  if (isPants) {
    const flare = pantsFlare;
    const pp = pts.map((p, i) => ({ ...p, r: i < 2 ? p.r * 1.05 : i === 4 ? p.r * flare * 1.08 : p.r * 1.06 }));
    pp[4] = { ...pp[4], y: pp[4].y + 30 };                // extend past the hem so the clip gives a straight edge
    const hem = sole - 50 * fs;                          // hem rests on the top of the shoe; most of the shoe stays visible
    drawShoe();
    ctx.save(); ctx.beginPath(); ctx.rect(-1e4, -1e4, 2e4, hem + 1e4); ctx.clip();
    paint(ctx, limb(pp), bottom.col, { box: lbox, sd: 12, hd: 6, inner: c => { c.strokeStyle = rgba(dark(bottom.col, .4), .35); c.lineWidth = 3.5; c.beginPath(); c.moveTo(kx - 18, ky - 10); c.quadraticCurveTo(kx, ky + 6, kx + 18, ky - 8); c.moveTo(kx - 12, ky + 14); c.quadraticCurveTo(kx, ky + 26, kx + 14, ky + 12); c.stroke(); if (bottom.dots) { c.fillStyle = bottom.dots; for (let i = 0; i < 40; i++) { const yy = lerp(hy, ay, (i % 10) / 10 + 0.04), xx = lerp(hx, ax, (i % 10) / 10) + ((Math.floor(i / 10) - 1.5) * lr * 0.55) + ((i % 2) * lr * 0.2); c.beginPath(); c.arc(xx, yy, 10, 0, 7); c.fill(); } } if (bottom.type === 'jeans') { c.strokeStyle = rgba('#F2C14E', .5); c.lineWidth = 2.5; c.setLineDash([6, 6]); c.beginPath(); c.moveTo(hx + s * lr * 0.7, hy); c.lineTo(ax + s * cr * 0.8, ay); c.stroke(); c.setLineDash([]); } } });
    ctx.restore();
    // hem: outline + soft fold shadow on the shoe
    // leg centre and half-width where the hem cuts it (shin may be slanted in squat/sit)
    const p3 = pp[3], p4 = { ...pts[4], r: pp[4].r }, u = clamp((hem - p3.y) / ((p4.y - p3.y) || 1)), hx2 = lerp(p3.x, p4.x, u), hr = lerp(p3.r, p4.r, u) * 0.96;
    ctx.strokeStyle = lineOf(bottom.col); ctx.lineWidth = 4.5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(hx2 - hr, hem); ctx.quadraticCurveTo(hx2, hem + 6, hx2 + hr, hem); ctx.stroke();
    ctx.fillStyle = 'rgba(40,25,40,.16)'; ctx.beginPath(); ctx.ellipse(hx2, hem + 6, hr * 0.85, 7, 0, 0, Math.PI); ctx.fill();
  } else {
    paint(ctx, limb(pts), skin, { box: lbox, sd: 12, hd: 6 });
    if (cfg.socks) paint(ctx, limb([midp(L.K, An, 0.4, lr * 0.74), { ...An, r: An.r * 1.12 }]), cfg.socks, { sd: 6, hd: 4, inner: c => { c.strokeStyle = cfg.sockStripe || '#E04848'; c.lineWidth = 8; const sy = lerp(ky, ay, 0.5); c.beginPath(); c.moveTo(ax - 60, sy); c.lineTo(ax + 60, sy); c.stroke(); } });
    if (bottom.type === 'shorts') paint(ctx, limb([{ ...L.Hp, y: hy - 10, r: lr * 1.12 }, midp(L.Hp, L.K, 0.55, lr * 1.0)]), bottom.col, { sd: 10, hd: 5 });
    drawShoe();
  }
}
function shoeV2(ctx, cfg, x, sole, s, fs, lift = 0) {
  const sh = cfg.shoes || { col: '#FFFFFF', acc: '#EE5E9A' };
  ctx.save(); ctx.translate(x, sole);
  if (lift > 0) { ctx.translate(-s * 30 * fs, 0); ctx.rotate(-s * 0.18 * lift); ctx.translate(s * 30 * fs, 0); }
  ctx.scale(s * fs, fs);
  if (lift < 0.05) { ctx.fillStyle = 'rgba(40,25,40,.30)'; ctx.beginPath(); ctx.ellipse(16, 0, 66, 9, 0, 0, Math.PI * 2); ctx.fill(); }   // contact shadow
  paint(ctx, q => { q.m(-34, -30); q.b(-30, -60, 20, -62, 40, -38); q.b(70, -32, 78, -12, 70, -6); q.l(-38, -6); q.q(-46, -16, -34, -30); q.z(); }, sh.col, { box: [-40, -62, 70, -6], sd: 8, hd: 4, inner: c => { if (sh.acc) { c.strokeStyle = sh.acc; c.lineWidth = 9; c.beginPath(); c.moveTo(-14, -26); c.quadraticCurveTo(20, -16, 52, -32); c.stroke(); } } });
  ctx.fillStyle = sh.sole || '#E8E2DA'; rr(ctx, -42, -12, 116, 12, 6); ctx.fill(); ctx.strokeStyle = lineOf(sh.col); ctx.lineWidth = 3 / fs; ctx.stroke();
  ctx.restore();
}
function shoe(ctx, cfg, x, y, s) {
  const sh = cfg.shoes || { col: '#FFFFFF', acc: '#EE5E9A' };
  ctx.save(); ctx.translate(x, y); ctx.scale(s, 1);
  paint(ctx, q => { q.m(-34, -18); q.b(-30, -48, 20, -50, 40, -26); q.b(70, -20, 78, 0, 70, 6); q.l(-38, 6); q.q(-46, -4, -34, -18); q.z(); }, sh.col, { box: [-40, -50, 70, 6], sd: 8, hd: 4, inner: c => { if (sh.acc) { c.strokeStyle = sh.acc; c.lineWidth = 9; c.beginPath(); c.moveTo(-14, -14); c.quadraticCurveTo(20, -4, 52, -20); c.stroke(); } } });
  ctx.fillStyle = sh.sole || '#E8E2DA'; rr(ctx, -42, 0, 116, 12, 6); ctx.fill(); ctx.strokeStyle = lineOf(sh.col); ctx.lineWidth = 3; ctx.stroke();
  ctx.restore();
}

function torso(ctx, cfg, st, g) {
  const { h, sw, ww, hipW, yNeck, ySh, yWaist, yHip, hw, skin, B } = g;
  const top = cfg.top || { type: 'tee', col: '#7FA6D8' };
  const body = q => {
    q.m(-hw * 0.42, yNeck); q.q(-sw * 0.55, ySh - 6, -sw, ySh + 22);
    q.b(-sw * 1.12, ySh + 70, -sw * (1.0 + B.muscle * 0.1), ySh + 150, -sw * (0.9 + B.chest * 0.1), ySh + 210);
    q.b(-ww * 1.05, yWaist - 120, -ww, yWaist - 20, -ww, yWaist);
    q.q(-hipW * 1.05, yHip - 40, -hipW, yHip + 10); q.l(hipW, yHip + 10); q.q(hipW * 1.05, yHip - 40, ww, yWaist);
    q.b(ww, yWaist - 20, ww * 1.05, yWaist - 120, sw * (0.9 + B.chest * 0.1), ySh + 210);
    q.b(sw * (1.0 + B.muscle * 0.1), ySh + 150, sw * 1.12, ySh + 70, sw, ySh + 22);
    q.q(sw * 0.55, ySh - 6, hw * 0.42, yNeck); q.z();
  };
  const box = [-sw, ySh, sw, yHip];
  const bellyFn = q => { q.e(0, yWaist - 40, ww * 1.05, (yHip - ySh) * 0.42 * B.belly + 1); };
  if (top.type === 'tank') {
    paint(ctx, body, skin, { box, sd: 18 });
    // muscle definition
    ctx.strokeStyle = rgba(dark(skin), 0.6); ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(-sw * 0.62, ySh + 40); ctx.quadraticCurveTo(-sw * 0.4, ySh + 140, -sw * 0.1, ySh + 150); ctx.moveTo(sw * 0.62, ySh + 40); ctx.quadraticCurveTo(sw * 0.4, ySh + 140, sw * 0.1, ySh + 150); ctx.stroke();
    paint(ctx, q => { q.m(-sw * 0.42, ySh - 4); q.l(-sw * 0.24, ySh - 4); q.q(0, ySh + 90, sw * 0.24, ySh - 4); q.l(sw * 0.42, ySh - 4); q.q(sw * 0.6, ySh + 120, sw * 0.72, ySh + 230); q.b(ww * 1.05, yWaist - 120, ww, yWaist - 20, ww, yWaist); q.q(hipW * 1.05, yHip - 40, hipW, yHip + 10); q.l(-hipW, yHip + 10); q.q(-hipW * 1.05, yHip - 40, -ww, yWaist); q.b(-ww, yWaist - 20, -ww * 1.05, yWaist - 120, -sw * 0.72, ySh + 230); q.q(-sw * 0.6, ySh + 120, -sw * 0.42, ySh - 4); q.z(); }, top.col, { box, sd: 20 });
  } else {
    paint(ctx, body, top.col, { box, sd: 20, hd: 8 });
  }
  if (B.belly > 0) paint(ctx, bellyFn, top.col, { sd: 16, hd: 10, lw: 0, sa: 0.5, ha: 0.35 });
  if (top.dots) { ctx.save(); ctx.clip(mk(body)); ctx.fillStyle = top.dots; for (let i = 0; i < 70; i++) { const x = -sw * 1.1 + (i % 7) * sw * 0.36 + ((Math.floor(i / 7) % 2) * sw * 0.18), y = ySh - 10 + Math.floor(i / 7) * 62; ctx.beginPath(); ctx.arc(x, y, 11, 0, 7); ctx.fill(); } ctx.restore(); ctx.strokeStyle = lineOf(top.col); ctx.lineWidth = 4.5; ctx.stroke(mk(body)); }
  const fold = (pts, a = 0.35) => { ctx.strokeStyle = rgba(dark(top.col, 0.4), a); ctx.lineWidth = 4; ctx.beginPath(); pts.forEach(([x1, y1, cx, cy, x2, y2]) => { ctx.moveTo(x1, y1); ctx.quadraticCurveTo(cx, cy, x2, y2); }); ctx.stroke(); };
  const T = top.type;
  if (T === 'tee' || T === 'longsleeve' || T === 'sweater' || T === 'polo' || T === 'tank' || T === 'kidtee') {
    // collar
    if (T === 'polo') { paint(ctx, q => { q.m(-hw * 0.5, yNeck - 6); q.l(0, yNeck + 60); q.l(-hw * 0.2, yNeck + 70); q.l(-hw * 0.75, yNeck + 26); q.z(); }, top.col2 || top.col, { sd: 6, hd: 3 }); paint(ctx, q => { q.m(hw * 0.5, yNeck - 6); q.l(0, yNeck + 60); q.l(hw * 0.2, yNeck + 70); q.l(hw * 0.75, yNeck + 26); q.z(); }, top.col2 || top.col, { sd: 6, hd: 3 }); }
    else if (T !== 'tank') { ctx.strokeStyle = shade(top.col, 0.8); ctx.lineWidth = 12; ctx.beginPath(); ctx.ellipse(0, yNeck + 4, hw * 0.48, 26, 0, 0.1, Math.PI - 0.1); ctx.stroke(); }
    if (T === 'kidtee') { ctx.save(); ctx.clip(mk(body)); ctx.fillStyle = top.col2 || '#FFFFFF'; for (let y = ySh + 40; y < yHip; y += 70) ctx.fillRect(-sw * 1.2, y, sw * 2.4, 28); ctx.restore(); ctx.strokeStyle = lineOf(top.col); ctx.lineWidth = 4.5; ctx.stroke(mk(body)); }
    fold([[-ww * 0.7, yWaist - 30, -ww * 0.3, yWaist - 10, -ww * 0.1, yWaist + 30], [ww * 0.6, yWaist - 70, ww * 0.3, yWaist - 40, ww * 0.2, yWaist]]);
  }
  if (T === 'hoodie' || T === 'gymtop') {
    if (T === 'hoodie') paint(ctx, q => { q.m(-hw * 0.95, yNeck - 30); q.q(0, yNeck + 70, hw * 0.95, yNeck - 30); q.q(hw * 1.1, yNeck + 40, 0, yNeck + 80); q.q(-hw * 1.1, yNeck + 40, -hw * 0.95, yNeck - 30); q.z(); }, top.col, { sd: 10, hd: 6 });
    // zipper + stripes
    ctx.strokeStyle = shade(top.col, 0.7); ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, yNeck + 40); ctx.lineTo(0, yHip); ctx.stroke();
    ctx.fillStyle = '#D9D9D9'; rr(ctx, -8, yNeck + 44, 16, 30, 4); ctx.fill();
    if (T === 'gymtop') { ctx.save(); ctx.clip(mk(body)); ctx.fillStyle = top.col2 || '#FFFFFF'; ctx.fillRect(-sw * 1.3, ySh + 20, sw * 0.42, 16); ctx.fillRect(sw * 0.88, ySh + 20, sw * 0.42, 16); ctx.restore(); }
    fold([[-ww * 0.8, yWaist - 60, -ww * 0.4, yWaist - 20, -ww * 0.3, yWaist + 30], [ww * 0.7, yWaist - 90, ww * 0.4, yWaist - 50, ww * 0.25, yWaist]]);
  }
  if (T === 'tracksuit') {
    ctx.strokeStyle = '#EDEDED'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, yNeck + 10); ctx.lineTo(0, yHip); ctx.stroke();
    paint(ctx, q => { q.m(-hw * 0.6, yNeck - 14); q.l(hw * 0.6, yNeck - 14); q.l(hw * 0.55, yNeck + 22); q.q(0, yNeck + 40, -hw * 0.55, yNeck + 22); q.z(); }, top.col, { sd: 6, hd: 4 });
    ctx.save(); ctx.clip(mk(body)); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-sw * 1.12, ySh + 10, 18, yHip - ySh); ctx.fillRect(sw * 1.12 - 18, ySh + 10, 18, yHip - ySh); ctx.restore();
  }
  if (T === 'blazer' || T === 'coat') {
    // shirt V + tie / fur collar
    if (T === 'blazer') {
      paint(ctx, q => { q.m(-hw * 0.55, yNeck - 6); q.l(hw * 0.55, yNeck - 6); q.l(hw * 0.25, ySh + 230); q.l(-hw * 0.25, ySh + 230); q.z(); }, top.shirt || '#FFFFFF', { sd: 8, hd: 3 });
      paint(ctx, q => { q.m(-16, yNeck + 26); q.l(16, yNeck + 26); q.l(24, ySh + 190); q.l(0, ySh + 220); q.l(-24, ySh + 190); q.z(); }, top.tie || '#C23C4A', { sd: 6, hd: 3 });
      paint(ctx, q => { q.m(-hw * 0.6, yNeck - 8); q.l(-hw * 0.18, ySh + 240); q.l(-hw * 0.5, ySh + 120); q.l(-hw * 0.95, ySh + 60); q.z(); }, shade(top.col, 1.08), { sd: 6, hd: 4 });
      paint(ctx, q => { q.m(hw * 0.6, yNeck - 8); q.l(hw * 0.18, ySh + 240); q.l(hw * 0.5, ySh + 120); q.l(hw * 0.95, ySh + 60); q.z(); }, shade(top.col, 1.08), { sd: 6, hd: 4 });
      ctx.fillStyle = shade(top.col, 0.6); for (const y of [ySh + 290, ySh + 380]) { ctx.beginPath(); ctx.arc(hw * 0.12, y, 9, 0, 7); ctx.fill(); }
    } else {
      paint(ctx, q => { q.m(-hw * 1.2, yNeck - 30); q.b(-hw * 1.4, yNeck + 80, -hw * 0.6, ySh + 200, 0, ySh + 160); q.b(hw * 0.6, ySh + 200, hw * 1.4, yNeck + 80, hw * 1.2, yNeck - 30); q.q(0, yNeck + 40, -hw * 1.2, yNeck - 30); q.z(); }, top.col2 || '#F5EBDD', { sd: 10, hd: 8, inner: c => { c.strokeStyle = rgba('#B8A48A', .5); c.lineWidth = 3; for (let i = 0; i < 40; i++) { const a = hash(i) * 6.28, x = (hash(i * 3) - .5) * hw * 2.2, y = yNeck + hash(i * 7) * 200; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 14, y + Math.sin(a) * 14); c.stroke(); } } });
      ctx.fillStyle = '#FBF7EE'; for (let i = 0; i < 11; i++) { const a = Math.PI * (0.15 + i * 0.07); ctx.beginPath(); ctx.arc(Math.cos(a) * hw * 0.5, yNeck + 10 + Math.sin(a) * 60, 9, 0, 7); ctx.fill(); ctx.strokeStyle = '#C9BBA8'; ctx.lineWidth = 2; ctx.stroke(); }
    }
  }
  if (T === 'cardigan') {
    paint(ctx, q => { q.m(-hw * 0.5, yNeck - 4); q.l(hw * 0.5, yNeck - 4); q.l(hw * 0.2, yHip); q.l(-hw * 0.2, yHip); q.z(); }, top.col2 || '#F4E1E8', { sd: 8, hd: 3, inner: c => { c.fillStyle = rgba('#E57C9C', .7); for (let i = 0; i < 18; i++) { c.beginPath(); c.arc((hash(i) - .5) * hw * 0.6, yNeck + hash(i * 3) * (yHip - yNeck), 8, 0, 7); c.fill(); } } });
    ctx.fillStyle = '#FFF2D0'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(-hw * 0.28, ySh + 80 + i * 90, 10, 0, 7); ctx.fill(); ctx.strokeStyle = '#B79A5A'; ctx.lineWidth = 2; ctx.stroke(); }
  }
  if (top.text) {
    ctx.save(); ctx.translate(0, top.textY ?? ySh + 150); ctx.rotate(-0.02);
    ctx.font = `${top.textSize || 44}px Unb9`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = top.textCol || '#FFFFFF'; ctx.globalAlpha = 0.92; (top.text.split('\n')).forEach((ln, i, a) => ctx.fillText(ln, 0, (i - (a.length - 1) / 2) * (top.textSize || 44) * 1.05));
    ctx.restore();
  }
  if (cfg.necklace) { ctx.strokeStyle = '#F7F2E8'; ctx.lineWidth = 3; for (let i = 0; i < 13; i++) { const a = Math.PI * (0.18 + i * 0.05); ctx.fillStyle = '#FBF8F2'; ctx.beginPath(); ctx.arc(Math.cos(a) * hw * 0.55, yNeck + 6 + Math.sin(a) * 50, 7, 0, 7); ctx.fill(); ctx.strokeStyle = '#BDB2A0'; ctx.stroke(); } }
  if (cfg.whistle) { ctx.strokeStyle = cfg.whistle; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-hw * 0.4, yNeck); ctx.quadraticCurveTo(0, ySh + 150, hw * 0.4, yNeck); ctx.stroke(); }
}

function neck(ctx, cfg, g) {
  const { hw, yNeck, head, skin, B } = g; const nw = hw * 0.4 * B.neck;
  paint(ctx, q => { q.m(head.x - nw, head.y + 40); q.l(head.x - nw * 1.05, yNeck + 12); q.q(0, yNeck + 34, nw * 1.05, yNeck + 12); q.l(head.x + nw, head.y + 40); q.z(); }, dark(skin, 0.12), { sd: 8, hd: 0 });
}

// --------- arm: angles from straight down; side -1 = screen-left
function arm(ctx, cfg, st, side, sh, g) {
  if (styleOf(cfg) === 'v2') return armV2(ctx, cfg, st, side, sh, g);
  const { h, B, skin } = g;
  const A = (side < 0 ? st.armL : st.armR) || { a: 0.16, b: 0.32 };
  const ua = h * 0.18 * (A.ul ?? 1), fa = h * 0.165 * (A.fl ?? 1), ur = h * 0.019 * B.arm * (1 + B.muscle * 0.35), fr = ur * (0.8 - B.muscle * 0.08);
  const near = 1 + 0.35 * (1 - Math.min(1, A.fl ?? 1)); // foreshortened forearm = hand closer to camera
  const a1 = A.a, a2 = A.a - A.b;
  const el = { x: sh.x + Math.sin(a1) * ua * side, y: sh.y + Math.cos(a1) * ua };
  const wr = { x: el.x + Math.sin(a2) * fa * side, y: el.y + Math.cos(a2) * fa };
  const top = cfg.top || {};
  const sleeve = top.sleeve || ({ tank: 'none', tee: 'short', polo: 'short', kidtee: 'short', longsleeve: 'long', sweater: 'long', hoodie: 'long', gymtop: 'long', tracksuit: 'long', blazer: 'long', coat: 'long', cardigan: 'long' })[top.type] || 'long';
  const sCol = top.sleeveCol || top.col, mu = B.muscle;
  const S0 = { x: sh.x, y: sh.y, r: ur * (1.05 + mu * 0.25) }, E = { x: el.x, y: el.y, r: ur * (0.82 - mu * 0.05) }, Wr = { x: wr.x, y: wr.y, r: fr * 0.82 };
  const pts = [S0, midp(sh, el, 0.5, ur * (1.0 + mu * 0.35)), E, midp(el, wr, 0.4, fr * (1.08 + mu * 0.25) * near), { ...Wr, r: Wr.r * near }];
  const box = [Math.min(sh.x, wr.x) - ur, sh.y, Math.max(sh.x, wr.x) + ur, Math.max(el.y, wr.y)];
  if (sleeve === 'long') { const sp = pts.map(p => ({ ...p, r: p.r * 1.1 })); paint(ctx, limb(sp), sCol, { box, sd: 13, hd: 6 }); }
  else {
    paint(ctx, limb(pts), skin, { box, sd: 12, hd: 6 });
    if (mu > 0.5) { const ang = Math.atan2(el.y - sh.y, el.x - sh.x), mx = lerp(sh.x, el.x, 0.5), my = lerp(sh.y, el.y, 0.5); ctx.strokeStyle = rgba(dark(skin, .45), .55); ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(mx, my, ur * 0.85, ur * 0.75, ang, side > 0 ? 0.2 : Math.PI + 0.2, side > 0 ? 2.4 : Math.PI + 2.4); ctx.stroke(); }
    if (sleeve === 'short') paint(ctx, limb([{ ...S0, r: S0.r * 1.18 }, midp(sh, el, 0.55, ur * 1.15)]), sCol, { sd: 10, hd: 5 });
  }
  if (sleeve === 'long') { ctx.strokeStyle = shade(sCol, 0.72); ctx.lineWidth = 7; const n = Math.atan2(wr.y - el.y, wr.x - el.x) + Math.PI / 2; const cx = lerp(el.x, wr.x, 0.86), cy = lerp(el.y, wr.y, 0.86), rr2 = fr * 1.0; ctx.beginPath(); ctx.moveTo(cx + Math.cos(n) * rr2, cy + Math.sin(n) * rr2); ctx.lineTo(cx - Math.cos(n) * rr2, cy - Math.sin(n) * rr2); ctx.stroke();
    ctx.strokeStyle = rgba(dark(sCol, .4), .4); ctx.lineWidth = 3.5; ctx.beginPath(); const fx = lerp(sh.x, el.x, 0.85), fy = lerp(sh.y, el.y, 0.85); ctx.moveTo(fx - 14, fy - 4); ctx.quadraticCurveTo(fx, fy + 10, fx + 14, fy - 2); ctx.moveTo(fx - 10, fy + 14); ctx.quadraticCurveTo(fx + 2, fy + 22, fx + 12, fy + 12); ctx.stroke(); }
  if (cfg.watch && side > 0) { const cx = lerp(el.x, wr.x, 0.82), cy = lerp(el.y, wr.y, 0.82); ctx.fillStyle = cfg.watch; ctx.beginPath(); ctx.arc(cx, cy, fr * 0.9, 0, 7); ctx.fill(); }
  // hand
  const ha = Math.atan2(wr.y - el.y, wr.x - el.x);
  const itemFn = (st.items || {})[side < 0 ? 'L' : 'R'];
  if (itemFn && itemFn.under) { ctx.save(); ctx.translate(wr.x, wr.y); itemFn.under(ctx, ha, side); ctx.restore(); }
  hand(ctx, wr.x, wr.y, ha, Math.max(fr * 1.35, h * 0.022) * near, skin, side, A.fist);
  const ov = itemFn && (itemFn.over || (typeof itemFn === 'function' ? itemFn : null)); if (ov) { ctx.save(); ctx.translate(wr.x, wr.y); ov(ctx, ha, side); ctx.restore(); }
}
// v2 arm: same joints as v1 (shoulder/elbow/wrist), cleaner sleeves and a one-piece cartoon hand.
function armV2(ctx, cfg, st, side, sh, g) {
  const { h, B, skin } = g;
  const A = (side < 0 ? st.armL : st.armR) || { a: 0.16, b: 0.32 };
  const ua = h * 0.18 * (A.ul ?? 1), fa = h * 0.165 * (A.fl ?? 1), ur = h * 0.019 * B.arm * (1 + B.muscle * 0.35), fr = ur * (0.8 - B.muscle * 0.08);
  const near = 1 + 0.35 * (1 - Math.min(1, A.fl ?? 1));
  const a1 = A.a, a2 = A.a - A.b;
  const el = { x: sh.x + Math.sin(a1) * ua * side, y: sh.y + Math.cos(a1) * ua };
  const wr = { x: el.x + Math.sin(a2) * fa * side, y: el.y + Math.cos(a2) * fa };
  const top = cfg.top || {};
  const sleeve = top.sleeve || ({ tank: 'none', tee: 'short', polo: 'short', kidtee: 'short', longsleeve: 'long', sweater: 'long', hoodie: 'long', gymtop: 'long', tracksuit: 'long', blazer: 'long', coat: 'long', cardigan: 'long' })[top.type] || 'long';
  const sCol = top.sleeveCol || top.col, mu = B.muscle;
  const S0 = { x: sh.x, y: sh.y, r: ur * (1.05 + mu * 0.25) }, E = { x: el.x, y: el.y, r: ur * (0.82 - mu * 0.05) }, Wr = { x: wr.x, y: wr.y, r: fr * 0.82 };
  const pts = [S0, midp(sh, el, 0.5, ur * (1.0 + mu * 0.35)), E, midp(el, wr, 0.4, fr * (1.08 + mu * 0.25) * near), { ...Wr, r: Wr.r * near }];
  const box = [Math.min(sh.x, wr.x) - ur, sh.y, Math.max(sh.x, wr.x) + ur, Math.max(el.y, wr.y)];
  const fdx = wr.x - el.x, fdy = wr.y - el.y, fl = Math.hypot(fdx, fdy) || 1, ux = fdx / fl, uy = fdy / fl;   // forearm direction
  const bend = Math.abs(A.b || 0);
  if (sleeve === 'long') { const sp = pts.map(p => ({ ...p, r: p.r * 1.1 })); paint(ctx, limb(sp), sCol, { box, sd: 13, hd: 6 }); }
  else {
    paint(ctx, limb(pts), skin, { box, sd: 12, hd: 6 });
    if (mu > 0.5) { const ang = Math.atan2(el.y - sh.y, el.x - sh.x), mx = lerp(sh.x, el.x, 0.5), my = lerp(sh.y, el.y, 0.5); ctx.strokeStyle = rgba(dark(skin, .45), .4); ctx.lineWidth = 3.5; ctx.beginPath(); ctx.ellipse(mx, my, ur * 0.85, ur * 0.75, ang, side > 0 ? 0.2 : Math.PI + 0.2, side > 0 ? 2.4 : Math.PI + 2.4); ctx.stroke(); }
    if (sleeve === 'short') paint(ctx, limb([{ ...S0, r: S0.r * 1.18 }, midp(sh, el, 0.55, ur * 1.15)]), sCol, { sd: 10, hd: 5 });
  }
  // one soft fold on the inside of the elbow, only when the arm is bent
  if (sleeve === 'long' && bend > 0.45) { const k = clamp((bend - 0.45) / 0.8); ctx.strokeStyle = rgba(dark(sCol, .4), 0.18 + 0.17 * k); ctx.lineWidth = 3; ctx.lineCap = 'round'; const fx = lerp(sh.x, el.x, 0.9), fy = lerp(sh.y, el.y, 0.9); ctx.beginPath(); ctx.moveTo(fx - 12, fy - 2); ctx.quadraticCurveTo(fx, fy + 8, fx + 12, fy - 2); ctx.stroke(); }
  // hand (one piece), then the cuff/wrist on top so there is no seam
  const ha = Math.atan2(wr.y - el.y, wr.x - el.x);
  const itemFn = (st.items || {})[side < 0 ? 'L' : 'R'];
  if (itemFn && itemFn.under) { ctx.save(); ctx.translate(wr.x, wr.y); itemFn.under(ctx, ha, side); ctx.restore(); }
  const hr = Math.max(fr * 1.32, h * 0.021) * near * (sleeve === 'long' ? 1.06 : 1);
  handV2(ctx, wr.x, wr.y, ha, hr, skin, side, A.fist);
  if (sleeve === 'long') { // flat cuff over the top of the hand (no round cap)
    const cr = Wr.r * near * 1.14; ctx.save(); ctx.translate(wr.x, wr.y); ctx.rotate(ha - Math.PI / 2);
    paint(ctx, q => { q.m(-cr * 0.92, -cr * 1.3); q.l(cr * 0.92, -cr * 1.3); q.l(cr, cr * 0.12); q.q(0, cr * 0.3, -cr, cr * 0.12); q.z(); }, sCol, { sd: 5, hd: 3, lw: 0 });
    ctx.strokeStyle = lineOf(sCol); ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-cr * 0.95, -cr * 0.7); ctx.lineTo(-cr, cr * 0.12); ctx.quadraticCurveTo(0, cr * 0.3, cr, cr * 0.12); ctx.lineTo(cr * 0.95, -cr * 0.7); ctx.stroke();
    ctx.strokeStyle = rgba(dark(sCol, .45), .3); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-cr * 0.9, -cr * 0.32); ctx.quadraticCurveTo(0, -cr * 0.18, cr * 0.9, -cr * 0.32); ctx.stroke();
    ctx.restore();
  } else { // bare wrist: cover the hand's top outline with skin so arm and hand read as one shape
    ctx.save(); ctx.translate(wr.x, wr.y); ctx.rotate(ha - Math.PI / 2); ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(0, -hr * 0.18, Wr.r * near * 0.82, hr * 0.32, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  if (cfg.watch && side > 0) { // strap around the wrist + small face, above the cuff
    const wc = Wr.r * near, d = sleeve === 'long' ? wc * 1.9 : wc * 0.9; ctx.save(); ctx.translate(wr.x - ux * d, wr.y - uy * d); ctx.rotate(ha - Math.PI / 2);
    ctx.fillStyle = shade(cfg.watch, 0.7); rr(ctx, -wc * 1.05, -wc * 0.22, wc * 2.1, wc * 0.44, wc * 0.15); ctx.fill(); paint(ctx, q => q.e(0, 0, wc * 0.42, wc * 0.42), cfg.watch, { sd: 2, hd: 2, lw: 2.5 }); ctx.restore(); }
  const ov = itemFn && (itemFn.over || (typeof itemFn === 'function' ? itemFn : null)); if (ov) { ctx.save(); ctx.translate(wr.x, wr.y); ov(ctx, ha, side); ctx.restore(); }
}
// v2 hand: mitten with the thumb as a soft bump of the same outline (no separate piece); r = hand radius
function handV2(ctx, x, y, a, r, skin, side, fist) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a - Math.PI / 2); ctx.scale(side < 0 ? -1 : 1, 1);   // local: +y = towards the fingertips, thumb on +x
  ctx.strokeStyle = rgba(dark(skin, .3), .5); ctx.lineCap = 'round';
  if (fist) {
    paint(ctx, q => { q.m(-r * 0.62, -r * 0.4); q.b(-r * 0.9, r * 0.1, -r * 0.9, r * 0.85, -r * 0.45, r * 1.0); q.b(0, r * 1.12, r * 0.55, r * 1.05, r * 0.8, r * 0.75); q.b(r * 1.02, r * 0.5, r * 1.0, r * 0.1, r * 0.75, -r * 0.05); q.q(r * 0.68, -r * 0.25, r * 0.62, -r * 0.4); q.q(0, -r * 0.55, -r * 0.62, -r * 0.4); q.z(); }, skin, { sd: 7, hd: 4, lw: 3.5 });
    ctx.lineWidth = 2.2; for (const fx of [-0.42, -0.08, 0.26]) { ctx.beginPath(); ctx.moveTo(fx * r, r * 0.86); ctx.quadraticCurveTo((fx + 0.08) * r, r * 0.98, (fx + 0.16) * r, r * 0.88); ctx.stroke(); }   // knuckles
    ctx.beginPath(); ctx.moveTo(r * 0.72, r * 0.08); ctx.quadraticCurveTo(r * 0.38, r * 0.3, r * 0.2, r * 0.55); ctx.stroke();   // thumb folded over the fingers
  } else {
    paint(ctx, q => { q.m(-r * 0.62, -r * 0.4); q.b(-r * 0.85, r * 0.2, -r * 0.88, r * 0.9, -r * 0.6, r * 1.2); q.b(-r * 0.35, r * 1.45, r * 0.35, r * 1.45, r * 0.62, r * 1.15); q.q(r * 0.78, r * 0.95, r * 0.72, r * 0.72);
      q.b(r * 0.95, r * 0.68, r * 1.08, r * 0.42, r * 0.95, r * 0.2); q.b(r * 0.85, 0, r * 0.7, -r * 0.2, r * 0.62, -r * 0.4); q.q(0, -r * 0.55, -r * 0.62, -r * 0.4); q.z(); }, skin, { sd: 7, hd: 4, lw: 3.5 });
    ctx.lineWidth = 2.2; for (const fx of [-0.28, 0.14]) { ctx.beginPath(); ctx.moveTo(fx * r, r * 1.08); ctx.lineTo(fx * r * 1.05, r * 1.32); ctx.stroke(); }   // two short finger hints
    ctx.beginPath(); ctx.moveTo(r * 0.72, r * 0.72); ctx.quadraticCurveTo(r * 0.55, r * 0.6, r * 0.5, r * 0.42); ctx.stroke();   // where the thumb meets the palm
  }
  ctx.restore();
}
function hand(ctx, x, y, a, r, skin, side, fist) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a - Math.PI / 2);
  paint(ctx, q => { q.m(-r * 0.8, -r * 0.3); q.b(-r * 0.95, r * 0.9, -r * 0.4, r * 1.35, r * 0.15, r * 1.3); q.b(r * 0.8, r * 1.25, r * 0.95, r * 0.6, r * 0.8, -r * 0.3); q.q(0, -r * 0.6, -r * 0.8, -r * 0.3); q.z(); }, skin, { sd: 7, hd: 4, lw: 3.5 });
  // thumb
  paint(ctx, capsule(r * 0.55 * side, r * 0.2, r * 0.32, r * 0.95 * side, r * 0.85, r * 0.26), skin, { sd: 4, hd: 2, lw: 3 });
  if (!fist) { ctx.strokeStyle = rgba(dark(skin, .3), .7); ctx.lineWidth = 2.5; for (const fx of [-0.3, 0.05, 0.38]) { ctx.beginPath(); ctx.moveTo(fx * r, r * 0.9); ctx.lineTo(fx * r * 1.05, r * 1.25); ctx.stroke(); } }
  ctx.restore();
}

// ---------- head
function headFn(ctx, cfg, st, g) {
  const { hw, hh, skin, t } = g;
  const turn = clamp(st.turn || 0, -1, 1), mood = st.mood || 'neutral';
  const hair = cfg.hair || { style: 'short', col: '#3A2820' };
  const jaw = cfg.jaw || 1;
  const headShape = q => {
    q.m(0, -hh); q.b(hw * 0.64, -hh, hw, -hh * 0.56, hw, -hh * 0.04);
    q.b(hw, hh * 0.34 * jaw, hw * (0.6 + 0.12 * (jaw - 1)), hh * 0.82, turn * hw * 0.08, hh);
    q.b(-hw * (0.6 + 0.12 * (jaw - 1)), hh * 0.82, -hw, hh * 0.34 * jaw, -hw, -hh * 0.04);
    q.b(-hw, -hh * 0.56, -hw * 0.64, -hh, 0, -hh); q.z();
  };
  // back hair is drawn by human() before the body
  // ears
  for (const s of [-1, 1]) { const ex = s * hw * (0.97 - turn * s * 0.08); paint(ctx, q => q.e(ex, hh * 0.06, hw * 0.16, hh * 0.21), skin, { sd: 6, hd: 3, lw: 3.5, inner: c => { c.strokeStyle = rgba(dark(skin, .35), .7); c.lineWidth = 3; c.beginPath(); c.arc(ex, hh * 0.06, hw * 0.08, s > 0 ? -1.2 : 1.9, s > 0 ? 1.2 : 4.3); c.stroke(); } }); if (cfg.earrings) { ctx.fillStyle = cfg.earrings; ctx.beginPath(); ctx.arc(ex, hh * 0.3, 9, 0, 7); ctx.fill(); } }
  // face
  paint(ctx, headShape, skin, { box: [-hw, -hh, hw, hh], sd: 22, hd: 10, hk: 0.12, inner: c => {
    // soft cheek blush
    for (const s of [-1, 1]) { const bx = s * hw * 0.56 + turn * hw * 0.18, by = hh * 0.34; const gg = c.createRadialGradient(bx, by, 0, bx, by, hw * 0.3); gg.addColorStop(0, rgba(cfg.blush || '#F07C8C', cfg.blushA ?? 0.42)); gg.addColorStop(1, rgba(cfg.blush || '#F07C8C', 0)); c.fillStyle = gg; c.fillRect(bx - hw * 0.4, by - hw * 0.4, hw * 0.8, hw * 0.8); }
    // hair shadow on forehead
    const sg = c.createLinearGradient(0, -hh, 0, -hh * 0.2); sg.addColorStop(0, rgba(SHADOW, 0.35)); sg.addColorStop(1, rgba(SHADOW, 0)); c.fillStyle = sg; c.fillRect(-hw, -hh, hw * 2, hh * 0.8);
    if (cfg.freckles) { c.fillStyle = rgba('#B0643E', .45); for (let i = 0; i < 16; i++) { const s = i % 2 ? 1 : -1; c.beginPath(); c.arc(s * hw * (0.25 + hash(i) * 0.4) + turn * hw * 0.18, hh * (0.18 + hash(i * 3) * 0.2), 3.5, 0, 7); c.fill(); } }
    if (cfg.stubble) { c.fillStyle = rgba(cfg.stubble, .35); c.beginPath(); c.moveTo(-hw, hh * 0.2); c.bezierCurveTo(-hw, hh * 0.7, -hw * 0.5, hh, 0, hh); c.bezierCurveTo(hw * 0.5, hh, hw, hh * 0.7, hw, hh * 0.2); c.quadraticCurveTo(hw * 0.4, hh * 0.45, 0, hh * 0.42); c.quadraticCurveTo(-hw * 0.4, hh * 0.45, -hw, hh * 0.2); c.fill(); }
  } });
  // age lines
  const fx = turn * hw * 0.2;
  if (cfg.age) {
    ctx.strokeStyle = rgba(dark(skin, .4), 0.5 * cfg.age + 0.2); ctx.lineWidth = 3.5;
    ctx.beginPath();
    for (const s of [-1, 1]) { ctx.moveTo(fx + s * hw * 0.32, hh * 0.38); ctx.quadraticCurveTo(fx + s * hw * 0.42, hh * 0.58, fx + s * hw * 0.34, hh * 0.72); }
    for (let i = 0; i < 2; i++) { ctx.moveTo(fx - hw * 0.35, -hh * (0.55 - i * 0.12)); ctx.quadraticCurveTo(fx, -hh * (0.6 - i * 0.12), fx + hw * 0.35, -hh * (0.55 - i * 0.12)); }
    for (const s of [-1, 1]) for (let i = 0; i < 2; i++) { ctx.moveTo(fx + s * hw * 0.74, hh * (0.0 + i * 0.1)); ctx.lineTo(fx + s * hw * 0.86, hh * (-0.04 + i * 0.16)); }
    ctx.stroke();
  }
  eyes(ctx, cfg, st, hw, hh, turn, mood, t, skin);
  nose(ctx, cfg, hw, hh, turn, skin);
  mouth(ctx, cfg, st, hw, hh, turn, mood, skin);
  if (cfg.beard) beard(ctx, cfg, hw, hh, turn);
  if (cfg.mustache) paint(ctx, q => { const y = hh * 0.47, x = fx; q.m(x, y - 6); q.b(x + hw * 0.2, y - 22, x + hw * 0.42, y - 4, x + hw * 0.46, y + 22); q.b(x + hw * 0.3, y + 12, x + hw * 0.12, y + 10, x, y + 8); q.b(x - hw * 0.12, y + 10, x - hw * 0.3, y + 12, x - hw * 0.46, y + 22); q.b(x - hw * 0.42, y - 4, x - hw * 0.2, y - 22, x, y - 6); q.z(); }, cfg.mustache, { sd: 6, hd: 4, lw: 3 });
  hairFront(ctx, cfg, hair, hw, hh, turn, t, st);
  if (cfg.headband) paint(ctx, q => { q.m(-hw * 1.02, -hh * 0.42); q.q(0, -hh * 0.72, hw * 1.02, -hh * 0.42); q.l(hw * 1.0, -hh * 0.24); q.q(0, -hh * 0.54, -hw * 1.0, -hh * 0.24); q.z(); }, cfg.headband, { sd: 6, hd: 4, lw: 3.5, inner: c => { c.fillStyle = 'rgba(255,255,255,.85)'; c.fillRect(-hw * 1.1, -hh * 0.47, hw * 2.2, 7); } });
  if (cfg.glasses) glasses(ctx, cfg.glasses, hw, hh, turn);
  if (cfg.cap) capFn(ctx, cfg.cap, hw, hh, turn);
  if (cfg.sleepMask) { const m = cfg.sleepMask, my = -hh * 0.78 + (st.maskDown || 0) * hh * 0.5, tx2 = turn * hw * 0.15;
    ctx.strokeStyle = shade(m, 0.75); ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(-hw * 1.02, my + 10); ctx.quadraticCurveTo(0, my - 30, hw * 1.02, my + 10); ctx.stroke();
    paint(ctx, q => { q.m(tx2 - hw * 0.72, my); q.b(tx2 - hw * 0.75, my - hh * 0.26, tx2 - hw * 0.1, my - hh * 0.3, tx2, my - hh * 0.16); q.b(tx2 + hw * 0.1, my - hh * 0.3, tx2 + hw * 0.75, my - hh * 0.26, tx2 + hw * 0.72, my); q.b(tx2 + hw * 0.7, my + hh * 0.2, tx2 + hw * 0.15, my + hh * 0.22, tx2, my + hh * 0.1); q.b(tx2 - hw * 0.15, my + hh * 0.22, tx2 - hw * 0.7, my + hh * 0.2, tx2 - hw * 0.72, my); q.z(); }, m, { sd: 8, hd: 5, lw: 3.5, inner: k => { k.strokeStyle = 'rgba(255,255,255,.85)'; k.lineWidth = 4; k.lineCap = 'round'; for (const s2 of [-1, 1]) { k.beginPath(); k.arc(tx2 + s2 * hw * 0.36, my - hh * 0.02, hw * 0.16, 0.25, Math.PI - 0.25); k.stroke(); for (let j = 0; j < 3; j++) { const a = 0.6 + j * 0.95; k.beginPath(); k.moveTo(tx2 + s2 * hw * 0.36 + Math.cos(a) * hw * 0.16, my - hh * 0.02 + Math.sin(a) * hw * 0.16); k.lineTo(tx2 + s2 * hw * 0.36 + Math.cos(a) * hw * 0.24, my - hh * 0.02 + Math.sin(a) * hw * 0.24); k.stroke(); } } } }); }
}
function eyes(ctx, cfg, st, hw, hh, turn, mood, t, skin) {
  const blinkP = ((t + (cfg.seed || 0) * 1.37) % (3.1 + (cfg.seed || 0) % 1.3));
  let blink = blinkP < 0.14 ? Math.sin(blinkP / 0.14 * Math.PI) : 0;
  if (st.blink !== undefined) blink = Math.max(blink, st.blink);
  const er = hw * (cfg.eyeSize || 0.215), ey = hh * 0.08;
  const lookX = clamp((st.look ?? turn) , -1, 1), lookY = st.lookY || 0;
  for (const s of [-1, 1]) {
    const far = (turn * s < 0) ? 1 - Math.abs(turn) * 0.18 : 1;
    const ex = s * hw * 0.42 + turn * hw * 0.2, rx = er * far, ry = er * (cfg.eyeShape === 'almond' ? 0.95 : 1.12);
    let open = 1 - blink; let topCut = 0, botCut = 0, big = 1;
    if (mood === 'bored' || mood === 'tired') topCut = 0.45;
    if (mood === 'annoyed' || mood === 'skeptical' && s > 0) { topCut = 0.35; botCut = 0.15; }
    if (mood === 'shock') big = 1.18;
    if (mood === 'happy' && st.talk < 0.1 && st.laugh) open = 0;
    ctx.save(); ctx.translate(ex, ey);
    if (open < 0.08 || (mood === 'happy' && st.squint)) {
      ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath();
      if (mood === 'happy') ctx.arc(0, ry * 0.4, rx * 0.9, Math.PI * 1.15, Math.PI * 1.85); else { ctx.moveTo(-rx, 0); ctx.quadraticCurveTo(0, ry * 0.35, rx, 0); }
      ctx.stroke(); ctx.restore(); continue;
    }
    const RX = rx * big, RY = ry * big * open;
    const eyeP = mk(q => q.e(0, 0, RX, RY));
    ctx.fillStyle = '#FFFDF8'; ctx.fill(eyeP);
    ctx.save(); ctx.clip(eyeP);
    // iris
    const ir = er * (mood === 'shock' ? 0.5 : 0.68), ix = lookX * rx * 0.32, iy = lookY * ry * 0.25 + ry * 0.05;
    const ig = ctx.createRadialGradient(ix, iy - ir * 0.3, ir * 0.1, ix, iy, ir); const ic = cfg.iris || '#5A3B26';
    ig.addColorStop(0, hiCol(ic, 0.25)); ig.addColorStop(0.7, ic); ig.addColorStop(1, shade(ic, 0.55));
    ctx.fillStyle = ig; ctx.beginPath(); ctx.arc(ix, iy, ir, 0, 7); ctx.fill();
    ctx.fillStyle = '#1A1014'; ctx.beginPath(); ctx.arc(ix, iy, ir * 0.48, 0, 7); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(ix - ir * 0.35, iy - ir * 0.38, ir * 0.3, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(ix + ir * 0.35, iy + ir * 0.3, ir * 0.13, 0, 7); ctx.fill();
    // lid shadow
    const lg = ctx.createLinearGradient(0, -RY, 0, -RY * 0.2); lg.addColorStop(0, rgba(SHADOW, .35)); lg.addColorStop(1, rgba(SHADOW, 0)); ctx.fillStyle = lg; ctx.fillRect(-RX, -RY, RX * 2, RY);
    // heavy lids (mood)
    if (topCut > 0) { ctx.fillStyle = dark(skin, 0.08); ctx.fillRect(-RX * 1.2, -RY * 1.2, RX * 2.4, RY * 2 * topCut + RY * 0.2); }
    if (botCut > 0) { ctx.fillStyle = dark(skin, 0.08); ctx.fillRect(-RX * 1.2, RY * (1 - botCut * 2), RX * 2.4, RY); }
    ctx.restore();
    // upper lid line + lashes
    ctx.strokeStyle = INK; ctx.lineCap = 'round';
    const lidY = -RY + (topCut > 0 ? RY * 2 * topCut : 0);
    ctx.lineWidth = cfg.lashes ? 7 : 5.5; ctx.beginPath();
    if (topCut > 0) { ctx.moveTo(-RX * 1.02, lidY + 4); ctx.quadraticCurveTo(0, lidY - 2, RX * 1.02, lidY + 4); }
    else ctx.ellipse(0, 0, RX, RY, 0, Math.PI * 1.08, Math.PI * 1.92);
    ctx.stroke();
    if (cfg.lashes) { const ox = s * RX * 0.98, oy = -RY * 0.25; ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(ox - s * 6, oy - 6); ctx.quadraticCurveTo(ox + s * 14, oy - 10, ox + s * 24, oy - 22); ctx.quadraticCurveTo(ox + s * 12, oy - 2, ox - s * 2, oy + 4); ctx.closePath(); ctx.fill();
      ctx.lineWidth = 3.5; ctx.beginPath(); const lx = s * RX * 0.62, ly = -RY * 0.82; ctx.moveTo(lx, ly); ctx.lineTo(lx + s * 9, ly - 11); ctx.stroke(); }
    ctx.lineWidth = 2.5; ctx.strokeStyle = rgba(INK, .45); ctx.beginPath(); ctx.ellipse(0, 0, RX, RY, 0, Math.PI * 0.2, Math.PI * 0.8); ctx.stroke();
    if (cfg.age) { ctx.strokeStyle = rgba(dark(skin, .4), .5); ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, RY * 0.6, RX * 0.9, RY * 0.6, 0, 0.3, Math.PI - 0.3); ctx.stroke(); }
    ctx.restore();
  }
  // brows
  const bcol = cfg.brow || (cfg.hair && cfg.hair.col) || '#3A2820';
  for (const s of [-1, 1]) {
    const bx = s * hw * 0.42 + turn * hw * 0.2, by = ey - er * 1.75;
    let inner = 0, outer = 0; // +down
    if (mood === 'angry' || mood === 'annoyed') { inner = 16; outer = -6; }
    if (mood === 'shock' || mood === 'surprised') { inner = -18; outer = -14; }
    if (mood === 'worried' || mood === 'sad') { inner = -14; outer = 8; }
    if (mood === 'skeptical') { inner = s > 0 ? -16 : 8; outer = s > 0 ? -12 : 4; }
    if (mood === 'happy') { inner = -4; outer = -4; }
    if (st.browUp) { inner -= st.browUp * 14; outer -= st.browUp * 12; }
    const w = hw * 0.32, th = cfg.browW || 7;
    ctx.save(); ctx.translate(bx, by);
    paint(ctx, q => { q.m(-s * w * 0.15, inner + 2); q.q(s * w * 0.35, Math.min(inner, outer) - 12, s * w * 0.98, outer + 2); q.q(s * w * 1.02, outer + th * 0.6, s * w * 0.9, outer + th * 0.7); q.q(s * w * 0.35, Math.min(inner, outer) - 12 + th, -s * w * 0.12, inner + th + 2); q.q(-s * w * 0.25, inner + th * 0.5, -s * w * 0.15, inner + 2); q.z(); }, bcol, { sd: 0, hd: 0, lw: 2 });
    ctx.restore();
  }
}
function nose(ctx, cfg, hw, hh, turn, skin) {
  const nx = turn * hw * 0.3, ny = hh * 0.3, s = cfg.noseSize || 1;
  ctx.strokeStyle = rgba(dark(skin, .45), .85); ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(nx + hw * 0.04 * s, ny - hh * 0.2 * s); ctx.quadraticCurveTo(nx + hw * 0.12 * s + turn * 10, ny, nx + hw * 0.02, ny + hh * 0.06 * s); ctx.stroke();
  ctx.fillStyle = rgba(dark(skin, .4), .55); for (const k of [-1, 1]) { ctx.beginPath(); ctx.ellipse(nx + k * hw * 0.07 * s, ny + hh * 0.05 * s, 6 * s, 4 * s, 0, 0, 7); ctx.fill(); }
  ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.beginPath(); ctx.ellipse(nx - hw * 0.03, ny - hh * 0.02, 7 * s, 5 * s, 0, 0, 7); ctx.fill();
  if (cfg.bigNose) paint(ctx, q => q.e(nx, ny, hw * 0.16 * s, hh * 0.1 * s), mix(skin, '#E58A7A', .25), { sd: 6, hd: 4, lw: 3 });
}
function mouth(ctx, cfg, st, hw, hh, turn, mood, skin) {
  const mx = turn * hw * 0.22, my = hh * 0.56, w = hw * (cfg.mouthW || 0.34);
  const talk = clamp(st.talk || 0, 0, 1.2);
  const open = talk * hh * 0.22 + (mood === 'shock' ? hh * 0.14 : 0) + (st.laugh ? hh * 0.12 : 0);
  const smile = mood === 'happy' || mood === 'smug' ? 1 : (mood === 'sad' || mood === 'worried' || mood === 'annoyed') ? -1 : (mood === 'angry' ? -0.6 : 0.25);
  const lipCol = cfg.lips || mix(skin, '#C8505E', 0.45);
  ctx.save(); ctx.translate(mx, my);
  if (open < 4) {
    ctx.strokeStyle = mix(lipCol, INK, 0.45); ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath();
    if (mood === 'smug') { ctx.moveTo(-w * 0.8, 2); ctx.quadraticCurveTo(0, 10, w * 0.9, -14); }
    else { ctx.moveTo(-w, -smile * 10); ctx.quadraticCurveTo(0, smile * 16, w, -smile * 10); }
    ctx.stroke();
    if (cfg.lips) { ctx.fillStyle = rgba(cfg.lips, .8); ctx.beginPath(); ctx.ellipse(0, 9 + smile * 4, w * 0.55, 8, 0, 0, Math.PI); ctx.fill(); }
  } else {
    const ow = mood === 'shock' ? w * 0.55 : w * (0.85 + smile * 0.1);
    const mp = mk(q => { q.m(-ow, -smile * 6); q.b(-ow * 0.6, -open * 0.35 - 4, ow * 0.6, -open * 0.35 - 4, ow, -smile * 6); q.b(ow * 0.9, open * 0.9, -ow * 0.9, open * 0.9, -ow, -smile * 6); q.z(); });
    ctx.fillStyle = '#5A1A26'; ctx.fill(mp);
    ctx.save(); ctx.clip(mp);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-ow, -open, ow * 2, open * 0.38 + 4);
    ctx.fillStyle = '#E2707E'; ctx.beginPath(); ctx.ellipse(0, open * 0.62, ow * 0.6, open * 0.32, 0, 0, 7); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = mix(lipCol, INK, 0.35); ctx.lineWidth = 4.5; ctx.stroke(mp);
    if (cfg.lips) { ctx.strokeStyle = rgba(cfg.lips, .85); ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-ow * 0.7, open * 0.62); ctx.quadraticCurveTo(0, open * 0.9, ow * 0.7, open * 0.62); ctx.stroke(); }
  }
  ctx.restore();
}
function beard(ctx, cfg, hw, hh, turn) {
  const c = cfg.beard;
  paint(ctx, q => { q.m(-hw * 0.98, -hh * 0.05); q.b(-hw, hh * 0.6, -hw * 0.55, hh * 1.18, turn * hw * 0.08, hh * 1.2); q.b(hw * 0.55, hh * 1.18, hw, hh * 0.6, hw * 0.98, -hh * 0.05); q.l(hw * 0.86, -hh * 0.02); q.q(hw * 0.7, hh * 0.45, hw * 0.3, hh * 0.46); q.q(turn * hw * 0.2, hh * 0.38, -hw * 0.3, hh * 0.46); q.q(-hw * 0.7, hh * 0.45, -hw * 0.86, -hh * 0.02); q.z(); }, c, { sd: 10, hd: 5, lw: 3.5, inner: cx => { cx.strokeStyle = rgba(shade(c, 0.7), .6); cx.lineWidth = 3; for (let i = 0; i < 26; i++) { const x = (hash(i) - .5) * hw * 1.8, y = hh * (0.5 + hash(i * 3) * 0.6); cx.beginPath(); cx.moveTo(x, y); cx.lineTo(x + 4, y + 16); cx.stroke(); } } });
  // keep mouth visible
  const mx = turn * hw * 0.22, my = hh * 0.56; ctx.fillStyle = '#5A1A26'; ctx.globalAlpha = 0; ctx.globalAlpha = 1;
}
function glasses(ctx, gl, hw, hh, turn) {
  const ey = hh * 0.06, col = gl.col || '#2C1E24';
  ctx.strokeStyle = col; ctx.lineWidth = gl.lw || 6;
  for (const s of [-1, 1]) { const ex = s * hw * 0.42 + turn * hw * 0.2; ctx.fillStyle = 'rgba(200,230,255,.18)'; ctx.beginPath(); if (gl.shape === 'cat') { ctx.moveTo(ex - hw * 0.28, ey - hh * 0.12); ctx.quadraticCurveTo(ex, ey - hh * 0.2, ex + s * hw * 0.34, ey - hh * 0.2); ctx.quadraticCurveTo(ex + hw * 0.2, ey + hh * 0.2, ex, ey + hh * 0.15); ctx.quadraticCurveTo(ex - hw * 0.3, ey + hh * 0.12, ex - hw * 0.28, ey - hh * 0.12); } else ctx.arc(ex, ey, hw * 0.27, 0, 7); ctx.fill(); ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(ex - 8, ey - 8, hw * 0.17, 3.6, 4.4); ctx.stroke(); ctx.strokeStyle = col; ctx.lineWidth = gl.lw || 6; }
  ctx.beginPath(); ctx.moveTo(-hw * 0.15 + turn * hw * 0.2, ey); ctx.quadraticCurveTo(turn * hw * 0.2, ey - 10, hw * 0.15 + turn * hw * 0.2, ey); ctx.stroke();
}
function capFn(ctx, cap, hw, hh, turn) {
  paint(ctx, q => { q.m(-hw * 1.05, -hh * 0.3); q.b(-hw * 1.05, -hh * 1.25, hw * 1.05, -hh * 1.25, hw * 1.05, -hh * 0.3); q.q(0, -hh * 0.4, -hw * 1.05, -hh * 0.3); q.z(); }, cap.col, { box: [-hw, -hh, hw, -hh * 0.3], sd: 12, hd: 6 });
  paint(ctx, q => { q.m(-hw * 1.0 + turn * 30, -hh * 0.36); q.q(turn * 60, -hh * 0.46, hw * 1.0 + turn * 30, -hh * 0.36); q.q(hw * 0.9 + turn * 60, -hh * 0.12, turn * 60, -hh * 0.1); q.q(-hw * 0.9 + turn * 60, -hh * 0.12, -hw * 1.0 + turn * 30, -hh * 0.36); q.z(); }, shade(cap.col, 0.85), { sd: 6, hd: 3 });
  if (cap.text) { ctx.font = '30px Unb9'; ctx.fillStyle = cap.textCol || '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(cap.text, turn * 20, -hh * 0.7); }
}
// ---------- hair
function hairBack(ctx, cfg, hair, hw, hh, t, st) {
  const c = hair.col, S = hair.style;
  const sway = Math.sin(t * 3 + (cfg.seed || 0)) * 0.08 + (st.hairSway || 0);
  if (S === 'bob') paint(ctx, q => { q.m(-hw * 1.18, hh * 0.62); q.b(-hw * 1.35, -hh * 0.4, -hw * 0.9, -hh * 1.25, 0, -hh * 1.22); q.b(hw * 0.9, -hh * 1.25, hw * 1.35, -hh * 0.4, hw * 1.18, hh * 0.62); q.q(hw * 0.9, hh * 0.78, hw * 0.6, hh * 0.62); q.l(-hw * 0.6, hh * 0.62); q.q(-hw * 0.9, hh * 0.78, -hw * 1.18, hh * 0.62); q.z(); }, c, { box: [-hw, -hh, hw, hh], sd: 18, hd: 8 });
  if (S === 'long') { const Ln = hair.len || 1.7; paint(ctx, q => { q.m(-hw * 1.15, hh * Ln); q.b(-hw * 1.45, -hh * 0.4, -hw * 0.9, -hh * 1.25, 0, -hh * 1.2); q.b(hw * 0.9, -hh * 1.25, hw * 1.45, -hh * 0.4, hw * 1.15, hh * Ln); q.q(0, hh * (Ln + 0.2), -hw * 1.15, hh * Ln); q.z(); }, c, { box: [-hw, -hh, hw, hh * Ln], sd: 18, hd: 8, inner: hair.neat ? (k => { k.strokeStyle = 'rgba(255,248,235,.35)'; k.lineWidth = 8; for (const s2 of [-1, 1]) { k.beginPath(); k.moveTo(s2 * hw * 1.1, hh * 0.2); k.quadraticCurveTo(s2 * hw * 1.3, hh * 0.9, s2 * hw * 1.05, hh * (Ln - 0.1)); k.stroke(); } }) : null }); if (hair.neat) { ctx.strokeStyle = rgba(shade(c, 0.6), .7); ctx.lineWidth = 4; for (const s2 of [-1, 1]) { ctx.beginPath(); ctx.arc(s2 * hw * 0.95, hh * (Ln - 0.12), hw * 0.16, s2 > 0 ? 0 : Math.PI, s2 > 0 ? Math.PI * 0.9 : Math.PI * 0.1 + Math.PI, s2 < 0); ctx.stroke(); } } }
  if (S === 'ponytail' || S === 'highpony') {
    ctx.save(); ctx.translate(hw * 0.2, -hh * (S === 'highpony' ? 0.95 : 0.4)); ctx.rotate(0.5 + sway);
    paint(ctx, q => { q.m(-30, 0); q.b(-80, hh * 0.6, -40, hh * 1.3, 40, hh * 1.6); q.b(30, hh * 1.1, 70, hh * 0.5, 40, 0); q.z(); }, c, { box: [-60, 0, 60, hh * 1.6], sd: 14, hd: 6, inner: cx => { cx.strokeStyle = rgba(shade(c, .7), .6); cx.lineWidth = 3; for (let i = 0; i < 5; i++) { cx.beginPath(); cx.moveTo(-20 + i * 12, 20); cx.quadraticCurveTo(-30 + i * 10, hh * 0.8, 10 + i * 6, hh * 1.4); cx.stroke(); } } });
    ctx.restore();
  }
  if (S === 'bouffant') paint(ctx, q => { q.m(-hw * 1.35, hh * 0.5); q.b(-hw * 1.7, -hh * 0.6, -hw * 1.0, -hh * 1.55, 0, -hh * 1.5); q.b(hw * 1.0, -hh * 1.55, hw * 1.7, -hh * 0.6, hw * 1.35, hh * 0.5); q.b(hw * 1.5, hh * 0.9, hw * 0.9, hh * 0.9, hw * 0.8, hh * 0.6); q.l(-hw * 0.8, hh * 0.6); q.b(-hw * 0.9, hh * 0.9, -hw * 1.5, hh * 0.9, -hw * 1.35, hh * 0.5); q.z(); }, c, { box: [-hw, -hh * 1.5, hw, hh], sd: 20, hd: 10, inner: cx => { cx.strokeStyle = rgba(shade(c, .75), .5); cx.lineWidth = 4; for (let i = 0; i < 6; i++) { cx.beginPath(); cx.arc(0, -hh * 0.2, hw * (0.9 + i * 0.12), Math.PI * 1.1, Math.PI * 1.9); cx.stroke(); } } });
  if (S === 'curly') { for (let i = 0; i < 16; i++) { const a = Math.PI * (0.95 + i / 15 * 1.1); paint(ctx, q => q.a(Math.cos(a) * hw * 1.02, -hh * 0.15 + Math.sin(a) * hh * 0.95, hw * 0.3), c, { sd: 8, hd: 4, lw: 3 }); } }
}
function hairFront(ctx, cfg, hair, hw, hh, turn, t, st) {
  const c = hair.col, S = hair.style;
  const strands = (pts, a = 0.5) => { ctx.strokeStyle = rgba(shade(c, 0.62), a); ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.beginPath(); pts.forEach(p => { ctx.moveTo(p[0], p[1]); ctx.quadraticCurveTo(p[2], p[3], p[4], p[5]); }); ctx.stroke(); };
  const shine = (y, w) => { ctx.strokeStyle = 'rgba(255,248,235,.42)'; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(-hw * 0.2, y + hh * 0.9, hw * w, Math.PI * 1.25, Math.PI * 1.55); ctx.stroke(); };
  const tx = turn * hw * 0.15;
  if (S === 'bob') {
    paint(ctx, q => { q.m(-hw * 1.08, hh * 0.15); q.b(-hw * 1.15, -hh * 0.9, -hw * 0.5, -hh * 1.18, tx + hw * 0.1, -hh * 1.15); q.b(hw * 0.8, -hh * 1.12, hw * 1.14, -hh * 0.7, hw * 1.08, hh * 0.15); q.q(hw * 0.95, -hh * 0.4, hw * 0.7, -hh * 0.62); q.b(hw * 0.4, -hh * 0.35, tx - hw * 0.1, -hh * 0.4, tx - hw * 0.35, -hh * 0.62); q.q(-hw * 0.8, -hh * 0.3, -hw * 1.08, hh * 0.15); q.z(); }, c, { box: [-hw, -hh * 1.2, hw, 0], sd: 14, hd: 8 });
    strands([[tx - hw * 0.1, -hh * 1.05, -hw * 0.5, -hh * 0.8, -hw * 0.9, -hh * 0.1], [tx + hw * 0.1, -hh * 1.05, hw * 0.5, -hh * 0.8, hw * 0.85, -hh * 0.2], [tx, -hh * 1.08, tx - hw * 0.15, -hh * 0.8, tx - hw * 0.3, -hh * 0.6]]);
    shine(-hh * 1.0, 0.75);
  }
  if (S === 'long') { paint(ctx, q => { q.m(-hw * 1.05, hh * 0.9); q.b(-hw * 1.2, -hh * 0.9, -hw * 0.4, -hh * 1.18, tx, -hh * 1.12); q.b(hw * 0.4, -hh * 1.18, hw * 1.2, -hh * 0.9, hw * 1.05, hh * 0.9); q.q(hw * 0.95, -hh * 0.2, tx + hw * 0.05, -hh * 0.82); q.q(-hw * 0.95, -hh * 0.2, -hw * 1.05, hh * 0.9); q.z(); }, c, { box: [-hw, -hh * 1.2, hw, hh], sd: 14, hd: 8 }); shine(-hh * 1.0, 0.75); }
  if (S === 'ponytail' || S === 'highpony') {
    paint(ctx, q => { q.m(-hw * 1.04, -hh * 0.05); q.b(-hw * 1.1, -hh * 0.95, -hw * 0.5, -hh * 1.14, tx, -hh * 1.12); q.b(hw * 0.5, -hh * 1.14, hw * 1.1, -hh * 0.95, hw * 1.04, -hh * 0.05); q.q(hw * 0.9, -hh * 0.55, tx + hw * 0.1, -hh * 0.72); q.q(-hw * 0.9, -hh * 0.55, -hw * 1.04, -hh * 0.05); q.z(); }, c, { box: [-hw, -hh * 1.2, hw, 0], sd: 12, hd: 8 });
    strands([[tx, -hh * 1.1, -hw * 0.5, -hh * 0.95, -hw * 0.95, -hh * 0.2], [tx, -hh * 1.1, hw * 0.5, -hh * 0.95, hw * 0.95, -hh * 0.2]]); shine(-hh * 1.0, 0.7);
    ctx.fillStyle = cfg.hairTie || '#EE5E9A'; ctx.beginPath(); ctx.ellipse(hw * 0.25, -hh * (S === 'highpony' ? 0.98 : 0.6), 18, 12, 0.4, 0, 7); ctx.fill();
  }
  if (S === 'bun') {
    paint(ctx, q => q.e(tx * 0.5, -hh * 1.12, hw * 0.42, hh * 0.3), c, { sd: 10, hd: 6, inner: cx => { cx.strokeStyle = rgba(shade(c, .7), .6); cx.lineWidth = 3; cx.beginPath(); cx.arc(tx * 0.5, -hh * 1.12, hw * 0.25, 0, 5); cx.stroke(); } });
    paint(ctx, q => { q.m(-hw * 1.04, 0); q.b(-hw * 1.1, -hh * 0.95, -hw * 0.5, -hh * 1.12, tx, -hh * 1.1); q.b(hw * 0.5, -hh * 1.12, hw * 1.1, -hh * 0.95, hw * 1.04, 0); q.q(hw * 0.9, -hh * 0.62, tx, -hh * 0.7); q.q(-hw * 0.9, -hh * 0.62, -hw * 1.04, 0); q.z(); }, c, { box: [-hw, -hh * 1.2, hw, 0], sd: 12, hd: 8 });
    strands([[tx, -hh * 1.05, -hw * 0.6, -hh * 0.9, -hw * 0.95, -hh * 0.2], [tx, -hh * 1.05, hw * 0.6, -hh * 0.9, hw * 0.95, -hh * 0.2], [tx, -hh * 1.05, -hw * 0.2, -hh * 0.9, -hw * 0.45, -hh * 0.6]]);
  }
  if (S === 'buzz') { ctx.save(); ctx.clip(mk(q => { q.m(-hw * 1.0, -hh * 0.25); q.b(-hw * 1.02, -hh * 1.06, hw * 1.02, -hh * 1.06, hw * 1.0, -hh * 0.25); q.q(0, -hh * 0.62, -hw * 1.0, -hh * 0.25); q.z(); })); ctx.fillStyle = rgba(c, 0.85); ctx.fillRect(-hw * 1.2, -hh * 1.2, hw * 2.4, hh); ctx.fillStyle = rgba(shade(c, .6), .7); for (let i = 0; i < 160; i++) { ctx.beginPath(); ctx.arc((hash(i) - .5) * hw * 2, -hh * (0.3 + hash(i * 3) * 0.8), 2.5, 0, 7); ctx.fill(); } ctx.restore(); }
  if (S === 'baldsides') { for (const s of [-1, 1]) paint(ctx, q => { q.m(s * hw * 0.98, -hh * 0.5); q.b(s * hw * 1.25, -hh * 0.55, s * hw * 1.3, hh * 0.05, s * hw * 1.0, hh * 0.15); q.q(s * hw * 1.05, -hh * 0.15, s * hw * 0.98, -hh * 0.5); q.z(); }, c, { sd: 6, hd: 4, lw: 3, inner: cx => { cx.strokeStyle = rgba(shade(c, .8), .7); cx.lineWidth = 3; for (let i = 0; i < 4; i++) { cx.beginPath(); cx.moveTo(s * hw * 1.0, -hh * (0.4 - i * 0.12)); cx.lineTo(s * hw * 1.2, -hh * (0.35 - i * 0.12)); cx.stroke(); } } }); ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.beginPath(); ctx.ellipse(-hw * 0.3, -hh * 0.78, hw * 0.25, hh * 0.08, -0.4, 0, 7); ctx.fill(); }
  if (S === 'short' || S === 'quiff') {
    paint(ctx, q => { q.m(-hw * 1.04, -hh * 0.1); q.b(-hw * 1.15, -hh * 1.05, -hw * 0.4, -hh * (S === 'quiff' ? 1.4 : 1.22), tx + hw * 0.2, -hh * (S === 'quiff' ? 1.35 : 1.18)); q.b(hw * 0.9, -hh * 1.15, hw * 1.15, -hh * 0.8, hw * 1.04, -hh * 0.1); q.q(hw * 0.92, -hh * 0.55, hw * 0.55, -hh * 0.68); q.q(tx, -hh * 0.62, tx - hw * 0.3, -hh * 0.72); q.q(-hw * 0.85, -hh * 0.6, -hw * 1.04, -hh * 0.1); q.z(); }, c, { box: [-hw, -hh * 1.3, hw, 0], sd: 12, hd: 8 });
    strands([[tx - hw * 0.4, -hh * 1.05, tx, -hh * 1.15, tx + hw * 0.5, -hh * 0.95], [tx - hw * 0.5, -hh * 0.9, tx - hw * 0.1, -hh * 1.0, tx + hw * 0.3, -hh * 0.82]]);
    shine(-hh * 1.05, 0.65);
  }
  if (S === 'bouffant') { paint(ctx, q => { q.m(-hw * 1.1, hh * 0.1); q.b(-hw * 1.3, -hh * 1.0, -hw * 0.6, -hh * 1.45, tx + hw * 0.1, -hh * 1.42); q.b(hw * 0.9, -hh * 1.4, hw * 1.3, -hh * 0.9, hw * 1.1, hh * 0.1); q.b(hw * 0.9, -hh * 0.5, hw * 0.3, -hh * 0.35, tx - hw * 0.2, -hh * 0.8); q.b(-hw * 0.6, -hh * 0.4, -hw * 0.9, -hh * 0.3, -hw * 1.1, hh * 0.1); q.z(); }, c, { box: [-hw, -hh * 1.4, hw, 0], sd: 14, hd: 10 }); shine(-hh * 1.25, 0.8); }
  if (S === 'curly') { for (let i = 0; i < 11; i++) { const a = Math.PI * (1.08 + i / 10 * 0.84); paint(ctx, q => q.a(Math.cos(a) * hw * 0.92, -hh * 0.2 + Math.sin(a) * hh * 0.9, hw * 0.26), c, { sd: 7, hd: 4, lw: 3 }); } }
}

// ======================================================================
// ANIMALS
function catChar(ctx, st = {}) {
  // upright anthropomorphic tabby. origin feet centre. ~1100 tall
  const t = st.t || 0, talk = clamp(st.talk || 0), fur = '#EBA15E', furD = '#C9793A', furL = '#FFF1DE';
  const turn = st.turn || 0, mood = st.mood || 'neutral';
  ctx.save(); if (st.flip) ctx.scale(-1, 1);
  softShadow(ctx, 0, 0, 230, 30, 0.25);
  const br = Math.sin(t * 2.2) * 4;
  const FAT = st.fat || 0, F = 1 + FAT, FV = 1 + FAT * 0.12;
  // tail
  const ts = Math.sin(t * 1.8) * 0.25;
  ctx.save(); ctx.translate(120 * F, -260); ctx.rotate(ts);
  paint(ctx, q => { q.m(0, 0); q.b(160, -40, 220, -260, 120, -420); q.b(110, -400, 100, -380, 100, -360); q.b(170, -250, 120, -60, -10, 30); q.z(); }, fur, { sd: 12, hd: 6, inner: c => { c.strokeStyle = furD; c.lineWidth = 16; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(80 + i * 20, -100 - i * 100); c.lineTo(170 + i * 10, -120 - i * 100); c.stroke(); } } });
  ctx.restore();
  // legs/feet
  for (const s of [-1, 1]) paint(ctx, q => { q.e(s * 70 * (1 + FAT * 0.6), -40, 70, 44); }, fur, { sd: 10, hd: 6 });
  // body
  ctx.save(); ctx.scale(F, FV);
  paint(ctx, q => { q.m(-150, -60); q.b(-190, -300, -150, -560, 0, -580 + br); q.b(150, -560, 190, -300, 150, -60); q.q(0, -20, -150, -60); q.z(); }, fur, { box: [-170, -580, 170, -60], sd: 20, hd: 10, inner: c => {
    c.fillStyle = furL; c.beginPath(); c.ellipse(0, -270, 95, 200, 0, 0, 7); c.fill();
    c.strokeStyle = furD; c.lineWidth = 18; c.lineCap = 'round'; for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(s * 175, -420 + i * 90); c.quadraticCurveTo(s * 140, -400 + i * 90, s * 118, -410 + i * 90); c.stroke(); }
  } });
  if (st.outfit) st.outfit(ctx, br);
  ctx.restore();
  // head
  ctx.save(); ctx.translate(turn * 20, -760 + br); ctx.rotate(st.tilt || 0);
  for (const s of [-1, 1]) { ctx.save(); ctx.translate(s * 140, -140); ctx.rotate(s * (0.25 + (mood === 'annoyed' ? 0.25 : 0))); paint(ctx, q => { q.m(-60, 40); q.l(0, -110); q.l(60, 40); q.z(); }, fur, { sd: 10, hd: 5, inner: c => { c.fillStyle = '#F4B8C0'; c.beginPath(); c.moveTo(-30, 30); c.lineTo(0, -60); c.lineTo(30, 30); c.fill(); } }); ctx.restore(); }
  paint(ctx, q => { q.m(0, -210); q.b(170, -210, 250, -110, 250, 10); q.b(250, 150, 140, 200, 0, 200); q.b(-140, 200, -250, 150, -250, 10); q.b(-250, -110, -170, -210, 0, -210); q.z(); }, fur, { box: [-250, -210, 250, 200], sd: 22, hd: 10, inner: c => {
    c.strokeStyle = furD; c.lineWidth = 20; c.lineCap = 'round'; for (const dx of [-55, 0, 55]) { c.beginPath(); c.moveTo(dx + turn * 30, -205); c.lineTo(dx * 0.8 + turn * 30, -130); c.stroke(); }
    for (const s of [-1, 1]) for (let i = 0; i < 2; i++) { c.beginPath(); c.moveTo(s * 252, -10 + i * 50); c.lineTo(s * 200, 0 + i * 50); c.stroke(); }
    c.fillStyle = furL; c.beginPath(); c.ellipse(turn * 40, 95, 140, 95, 0, 0, 7); c.fill();
  } });
  // eyes
  const blinkP = (t * 1.0 + 0.4) % 3.4; const bl = blinkP < 0.15 ? Math.sin(blinkP / 0.15 * Math.PI) : 0;
  for (const s of [-1, 1]) {
    const ex = s * 95 + turn * 40, ey = -20;
    if (bl > 0.6) { ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(ex - 40, ey); ctx.quadraticCurveTo(ex, ey + 14, ex + 40, ey); ctx.stroke(); continue; }
    const half = mood === 'bored' || mood === 'annoyed' ? 0.45 : 0;
    const ep = mk(q => q.e(ex, ey, 48, 52));
    const eg = ctx.createRadialGradient(ex, ey - 10, 5, ex, ey, 52); eg.addColorStop(0, '#F4FA9A'); eg.addColorStop(1, '#A9C24A');
    ctx.fillStyle = eg; ctx.fill(ep); ctx.save(); ctx.clip(ep);
    ctx.fillStyle = '#1A1014'; ctx.beginPath(); ctx.ellipse(ex + (st.look || 0) * 12, ey, mood === 'shock' ? 26 : 13, 40, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex - 16, ey - 18, 10, 0, 7); ctx.fill();
    if (half) { ctx.fillStyle = fur; ctx.fillRect(ex - 60, ey - 60, 120, 104 * half); }
    ctx.restore(); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.stroke(ep);
    if (half) { ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(ex - 50, ey - 52 + 104 * half); ctx.lineTo(ex + 50, ey - 52 + 104 * half); ctx.stroke(); }
  }
  // nose + mouth + whiskers
  const nx = turn * 45;
  ctx.fillStyle = '#E87A92'; ctx.beginPath(); ctx.moveTo(nx - 20, 50); ctx.lineTo(nx + 20, 50); ctx.lineTo(nx, 72); ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
  if (talk > 0.08) { ctx.fillStyle = '#5A1A26'; ctx.beginPath(); ctx.ellipse(nx, 100 + talk * 10, 34, 10 + talk * 30, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#E2707E'; ctx.beginPath(); ctx.ellipse(nx, 108 + talk * 22, 20, 8 + talk * 10, 0, 0, 7); ctx.fill(); }
  ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(nx, 72); ctx.quadraticCurveTo(nx - 22, 102, nx - 44, 86); ctx.moveTo(nx, 72); ctx.quadraticCurveTo(nx + 22, 102, nx + 44, 86); ctx.stroke();
  ctx.strokeStyle = 'rgba(80,50,30,.8)'; ctx.lineWidth = 3; for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(nx + s * 70, 80 + i * 14); ctx.lineTo(nx + s * 210, 60 + i * 26); ctx.stroke(); }
  if (st.hat) st.hat(ctx);
  ctx.restore();
  // arms
  for (const s of [-1, 1]) { const A = (s < 0 ? st.armL : st.armR) || { a: 0.3, b: 0.4 }; const sx = s * 150 * F, sy = -500 * FV + br; const ex = sx + Math.sin(A.a) * 170 * s, ey = sy + Math.cos(A.a) * 170, a2 = A.a - A.b, wx = ex + Math.sin(a2) * 150 * s, wy = ey + Math.cos(a2) * 150;
    paint(ctx, capsule(sx, sy, 44, ex, ey, 40), fur, { sd: 10, hd: 5 }); paint(ctx, capsule(ex, ey, 40, wx, wy, 36), fur, { sd: 10, hd: 5 }); paint(ctx, q => q.e(wx, wy, 46, 42), furL, { sd: 8, hd: 4 });
    const it = (st.items || {})[s < 0 ? 'L' : 'R']; if (it) { ctx.save(); ctx.translate(wx, wy); it(ctx, s); ctx.restore(); } }
  ctx.restore();
}
function pug(ctx, st = {}) {
  const t = st.t || 0; ctx.save(); if (st.flip) ctx.scale(-1, 1);
  const c = '#E6C49A', d = '#3A2E2A';
  paint(ctx, q => q.e(0, -110, 150, 110), c, { box: [-150, -220, 150, 0], sd: 16, hd: 8 });
  for (const s of [-1, 1]) paint(ctx, q => q.e(s * 90, -20, 40, 34), c, { sd: 6, hd: 4 });
  ctx.save(); ctx.translate(-60, -230); ctx.rotate(Math.sin(t * 1.3) * 0.08 + (st.tilt || 0));
  paint(ctx, q => q.e(0, 0, 130, 115), c, { box: [-130, -115, 130, 115], sd: 16, hd: 8 });
  for (const s of [-1, 1]) paint(ctx, q => { q.m(s * 80, -90); q.q(s * 160, -100, s * 140, -20); q.q(s * 110, -50, s * 70, -70); q.z(); }, d, { sd: 6, hd: 3 });
  paint(ctx, q => q.e(0, 40, 75, 58), d, { sd: 8, hd: 6, lw: 3 });
  ctx.fillStyle = '#111'; ctx.beginPath(); ctx.ellipse(0, 18, 26, 16, 0, 0, 7); ctx.fill();
  for (const s of [-1, 1]) { ctx.fillStyle = '#1A1014'; ctx.beginPath(); ctx.arc(s * 55, -20, 24, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s * 55 - 8, -28, 8, 0, 7); ctx.fill(); }
  ctx.strokeStyle = rgba(d, .6); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-40, -70); ctx.quadraticCurveTo(0, -84, 40, -70); ctx.moveTo(-30, -55); ctx.quadraticCurveTo(0, -66, 30, -55); ctx.stroke();
  if (st.tongue) { ctx.fillStyle = '#E2707E'; ctx.beginPath(); ctx.ellipse(10, 82, 16, 22, 0, 0, 7); ctx.fill(); }
  ctx.restore(); ctx.restore();
}
function poodle(ctx, st = {}) {
  const t = st.t || 0; ctx.save(); if (st.flip) ctx.scale(-1, 1);
  const c = '#F6F1F4';
  const puff = (x, y, r) => paint(ctx, q => { for (let i = 0; i < 7; i++) { const a = i / 7 * 6.28; q.m(x + Math.cos(a) * r * 0.6 + r * 0.4, y + Math.sin(a) * r * 0.6); q.a(x + Math.cos(a) * r * 0.6, y + Math.sin(a) * r * 0.6, r * 0.4); } q.a(x, y, r * 0.6); }, c, { sd: 8, hd: 4, lw: 3 });
  for (const s of [-1, 1]) { paint(ctx, capsule(s * 60, -120, 14, s * 60, -20, 12), '#EAD9E0', { sd: 4, hd: 2, lw: 3 }); puff(s * 60, -20, 34); }
  puff(0, -160, 95); puff(-10, -330, 80);
  paint(ctx, q => q.e(60, -300, 60, 34), '#EAD9E0', { sd: 6, hd: 4, lw: 3 });
  ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(116, -304, 12, 0, 7); ctx.fill();
  for (const s of [-1, 1]) { ctx.fillStyle = '#1A1014'; ctx.beginPath(); ctx.arc(10 + s * 26, -340, 9, 0, 7); ctx.fill(); }
  ctx.fillStyle = '#F2A0C0'; ctx.beginPath(); ctx.moveTo(-40, -420); ctx.lineTo(0, -400); ctx.lineTo(-40, -380); ctx.fill(); ctx.beginPath(); ctx.moveTo(30, -420); ctx.lineTo(-10, -400); ctx.lineTo(30, -380); ctx.fill();
  puff(-120, -230 + Math.sin(t * 6) * 8, 34);
  ctx.restore();
}
function hamster(ctx, st = {}) {
  const t = st.t || 0; const run = st.run ?? 1; const b = Math.abs(Math.sin(t * 18)) * 8 * run;
  ctx.save(); ctx.translate(0, -b);
  paint(ctx, q => q.e(0, -60, 80, 60), '#E8B07A', { sd: 10, hd: 6, inner: c => { c.fillStyle = '#FFF3E2'; c.beginPath(); c.ellipse(20, -40, 50, 36, 0, 0, 7); c.fill(); } });
  for (const s of [-1, 1]) paint(ctx, q => q.a(s * 40 - 10, -112, 18), '#E8B07A', { sd: 4, hd: 2, lw: 3 });
  ctx.fillStyle = '#1A1014'; ctx.beginPath(); ctx.arc(40, -76, 8, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(37, -79, 3, 0, 7); ctx.fill();
  ctx.fillStyle = '#E87A92'; ctx.beginPath(); ctx.arc(76, -60, 6, 0, 7); ctx.fill();
  ctx.fillStyle = '#F2A0B0'; for (let i = 0; i < 2; i++) { const ph = Math.sin(t * 18 + i * Math.PI) * run; ctx.beginPath(); ctx.ellipse(-20 + i * 50 + ph * 16, -6, 14, 8, 0, 0, 7); ctx.fill(); }
  if (st.band) { ctx.fillStyle = st.band; ctx.fillRect(-40, -110, 90, 12); }
  ctx.restore();
}

// ======================================================================
// PROPS (small, held)
const items = {
  phone: (col = '#2B2F3A') => (ctx, a, side) => { ctx.rotate(a - Math.PI / 2); ctx.translate(0, 30); paint(ctx, q => { q.m(-30, -60); q.l(30, -60); q.l(30, 60); q.l(-30, 60); q.z(); }, col, { sd: 6, hd: 3, lw: 3 }); ctx.fillStyle = '#7FD0FF'; rr(ctx, -24, -52, 48, 100, 6); ctx.fill(); },
  bottle: (col = '#5BC0EB') => (ctx, a) => { ctx.rotate(a - Math.PI / 2 + 0.3); paint(ctx, q => { q.m(-24, -80); q.l(24, -80); q.l(26, 70); q.q(0, 80, -26, 70); q.z(); }, col, { sd: 8, hd: 5, lw: 3 }); ctx.fillStyle = '#FFFFFF'; rr(ctx, -16, -100, 32, 24, 6); ctx.fill(); },
  coffee: () => (ctx, a) => { ctx.rotate(0.05); paint(ctx, q => { q.m(-34, -70); q.l(34, -70); q.l(26, 50); q.l(-26, 50); q.z(); }, '#F6EFE4', { sd: 8, hd: 4, lw: 3, inner: c => { c.fillStyle = '#B9774A'; c.fillRect(-40, -20, 80, 40); } }); ctx.fillStyle = '#5A3A2A'; rr(ctx, -38, -84, 76, 18, 6); ctx.fill(); },
  dumbbell: (col = '#3A3F4B') => (ctx, a) => { ctx.rotate(a); paint(ctx, q => { q.m(-70, -9); q.l(70, -9); q.l(70, 9); q.l(-70, 9); q.z(); }, '#9AA3B2', { sd: 4, hd: 2, lw: 3 }); for (const s of [-1, 1]) paint(ctx, q => { q.m(s * 60 - 20, -40); q.l(s * 60 + 20, -40); q.l(s * 60 + 20, 40); q.l(s * 60 - 20, 40); q.z(); }, col, { sd: 6, hd: 4, lw: 3 }); },
  balloon: (col = '#E8485C', t = 0) => ({ under: (ctx) => { ctx.strokeStyle = 'rgba(80,80,80,.8)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(20 + Math.sin(t * 2) * 15, -150, -20, -280, Math.sin(t * 1.5) * 20, -420); ctx.stroke(); ctx.save(); ctx.translate(Math.sin(t * 1.5) * 20, -520); ctx.rotate(Math.sin(t * 1.2) * 0.08); paint(ctx, q => { q.m(0, 100); q.b(-110, 60, -100, -110, 0, -110); q.b(100, -110, 110, 60, 0, 100); q.z(); }, col, { box: [-100, -110, 100, 100], sd: 18, hd: 12, inner: c => { c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(-40, -50, 18, 34, -0.4, 0, 7); c.fill(); } }); ctx.fillStyle = shade(col, .8); ctx.beginPath(); ctx.moveTo(-12, 112); ctx.lineTo(12, 112); ctx.lineTo(0, 98); ctx.fill(); ctx.restore(); } }),
  leash: (col = '#C23C4A', tx = -150, ty = 260) => ({ under: (ctx) => { ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(tx * 0.3, ty * 0.9, tx, ty); ctx.stroke(); } }),
  newspaper: () => (ctx, a) => {},
  scissors: (t = 0, open = null) => (ctx, a, side) => { ctx.rotate(a - Math.PI / 2 + Math.PI * 0.85); const o = open ?? (0.15 + 0.25 * Math.abs(Math.sin(t * 14)));
    for (const s2 of [-1, 1]) { ctx.save(); ctx.rotate(s2 * o); paint(ctx, q => { q.m(-6, 0); q.l(6, 0); q.l(3, 170); q.l(-2, 170); q.z(); }, '#D8DEE6', { sd: 2, hd: 2, lw: 2.5 }); ctx.strokeStyle = '#EE5E9A'; ctx.lineWidth = 9; ctx.beginPath(); ctx.ellipse(s2 * 6, -36, 18, 26, 0, 0, 7); ctx.stroke(); ctx.restore(); }
    ctx.fillStyle = '#6A707A'; ctx.beginPath(); ctx.arc(0, 0, 6, 0, 7); ctx.fill(); },
  comb: (col = '#2B2F3A') => (ctx, a) => { ctx.rotate(a - Math.PI / 2 + 0.5); paint(ctx, q => { q.m(-14, -10); q.l(14, -10); q.l(14, 190); q.l(-14, 190); q.z(); }, col, { sd: 3, hd: 2, lw: 2.5 }); ctx.fillStyle = col; for (let y = 10; y < 186; y += 12) ctx.fillRect(14, y, 18, 6); },
  clippers: (t = 0) => (ctx, a) => { ctx.rotate(a - Math.PI / 2 + Math.PI); ctx.translate(Math.sin(t * 90) * 2, 0); paint(ctx, q => { q.m(-30, -20); q.l(30, -20); q.l(26, 150); q.l(-26, 150); q.z(); }, '#3A3F4B', { sd: 6, hd: 4, lw: 3, inner: k => { k.fillStyle = '#EE5E9A'; k.fillRect(-30, 40, 60, 14); } }); ctx.fillStyle = '#C9CED6'; ctx.fillRect(-28, 150, 56, 22); ctx.fillStyle = '#7A808A'; for (let x = -24; x < 28; x += 8) ctx.fillRect(x, 168, 4, 12); },
  terminal: (amt = '£80.00') => (ctx, a) => { ctx.rotate(0.1); paint(ctx, q => { q.m(-60, -150); q.l(60, -150); q.l(60, 40); q.l(-60, 40); q.z(); }, '#2B2F3A', { sd: 6, hd: 4, lw: 3, inner: k => { k.fillStyle = '#9FE0B8'; k.fillRect(-46, -136, 92, 56); k.fillStyle = '#1A2A1A'; k.font = '24px Unb9'; k.textAlign = 'center'; k.textBaseline = 'middle'; k.fillText(amt, 0, -108); k.fillStyle = '#6A707A'; for (let r = 0; r < 3; r++) for (let cc = 0; cc < 3; cc++) { k.beginPath(); k.arc(-30 + cc * 30, -50 + r * 28, 9, 0, 7); k.fill(); } } }); },
  teacup: () => (ctx, a) => { ctx.translate(0, -26); paint(ctx, q => { q.m(-40, -40); q.l(40, -40); q.q(38, 10, 0, 12); q.q(-38, 10, -40, -40); q.z(); }, '#FFFDF8', { sd: 6, hd: 3, lw: 3, inner: k => { k.fillStyle = '#E57C9C'; k.beginPath(); k.arc(0, -16, 8, 0, 7); k.fill(); } }); ctx.strokeStyle = '#8A7A8A'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(46, -20, 14, -1.2, 1.2); ctx.stroke(); paint(ctx, q => q.e(0, 14, 62, 12), '#FFFDF8', { sd: 3, hd: 2, lw: 3 }); },
  ladle: (food) => (ctx, a, side) => { ctx.rotate(a - Math.PI / 2); ctx.save(); ctx.rotate(-0.35 * side);
    paint(ctx, q => { q.m(-9, -40); q.l(9, -40); q.l(7, 230); q.l(-7, 230); q.z(); }, '#B9BFC8', { sd: 3, hd: 2, lw: 3 });
    paint(ctx, q => { q.m(-70, 230); q.q(-70, 330, 0, 330); q.q(70, 330, 70, 230); q.z(); }, '#C9CED6', { sd: 10, hd: 6, lw: 3.5 });
    if (food) food(ctx, 0, 236); ctx.restore(); },
  fork: (bite) => (ctx, a, side) => { ctx.rotate(a - Math.PI / 2 + Math.PI); ctx.translate(0, -10);
    paint(ctx, q => { q.m(-7, 0); q.l(7, 0); q.l(6, 150); q.l(-6, 150); q.z(); }, '#C9CED6', { sd: 2, hd: 1, lw: 2.5 });
    paint(ctx, q => { q.m(-22, 150); q.l(22, 150); q.l(22, 190); q.l(-22, 190); q.z(); }, '#C9CED6', { sd: 2, hd: 1, lw: 2.5 });
    for (const x of [-18, -6, 6, 18]) { ctx.fillStyle = '#C9CED6'; ctx.fillRect(x - 3, 185, 6, 50); }
    if (bite) paint(ctx, q => q.a(0, 230, 34), '#8A4A2A', { sd: 8, hd: 4, lw: 3, inner: c => { c.fillStyle = 'rgba(200,60,40,.7)'; c.beginPath(); c.arc(-8, 214, 14, 0, 7); c.fill(); } }); },
  wine: (fill = 0.5) => (ctx, a) => { ctx.translate(0, -30);
    ctx.save(); ctx.globalAlpha = 0.55; paint(ctx, q => { q.m(-46, -150); q.q(-50, -40, 0, -30); q.q(50, -40, 46, -150); q.z(); }, '#E8F2F8', { sd: 0, hd: 0, lw: 3, line: '#7A8A9A' }); ctx.restore();
    ctx.fillStyle = 'rgba(150,20,50,.9)'; ctx.beginPath(); ctx.moveTo(-44, -150 + 100 * (1 - fill)); ctx.quadraticCurveTo(-46, -40, 0, -32); ctx.quadraticCurveTo(46, -40, 44, -150 + 100 * (1 - fill)); ctx.fill();
    ctx.strokeStyle = '#7A8A9A'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(0, 40); ctx.stroke(); ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(0, 42, 34, 8, 0, 0, 7); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-30, -130); ctx.quadraticCurveTo(-34, -70, -18, -50); ctx.stroke(); },
};
function box(ctx, x, y, w, h, col = '#C99A64', label) {
  paint(ctx, q => { q.m(x, y); q.l(x + w, y); q.l(x + w, y + h); q.l(x, y + h); q.z(); }, col, { box: [x, y, x + w, y + h], sd: 12, hd: 6, inner: c => { c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x + w * 0.42, y, w * 0.16, h); if (label) { c.fillStyle = '#3A2A1A'; c.font = `${Math.round(h * 0.16)}px Unb9`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(label, x + w / 2, y + h * 0.62); c.font = `${Math.round(h * 0.12)}px Nun9`; c.fillText('THIS SIDE UP', x + w / 2, y + h * 0.85); } } });
}

// ======================================================================
// POST FX
let GRAIN = null;
function grain(ctx, W, H, t, a = 0.06) {
  if (!GRAIN) { GRAIN = []; for (let k = 0; k < 4; k++) { const c = createCanvas(360, 640), x = c.getContext('2d'); const id = x.createImageData(360, 640); for (let i = 0; i < id.data.length; i += 4) { const v = Math.random() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } x.putImageData(id, 0, 0); GRAIN.push(c); } }
  ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'overlay'; ctx.drawImage(GRAIN[Math.floor(t * 8) % 4], 0, 0, W, H); ctx.restore();
}
function vignette(ctx, W, H, a = 0.32, col = '30,18,30') { const g = ctx.createRadialGradient(W / 2, H * 0.47, H * 0.28, W / 2, H / 2, H * 0.68); g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(1, `rgba(${col},${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }

module.exports = { STYLE, styleOf, clamp, lerp, P, eOut, eIn, eIO, eBack, hash, noise1, mix, shade, rgba, dark, hiCol, lineOf, INK, SHADOW, WARM, pen, mk, paint, rr, capsule, limb, softShadow, human, catChar, pug, poodle, hamster, items, box, grain, vignette, createCanvas, Path2D };
