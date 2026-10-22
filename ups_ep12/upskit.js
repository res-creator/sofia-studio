// Episode 12 "The Shortest Route Isn't Always the Cheapest" (UPS) — sets, vehicles, props and cast on hirkit.
// Mike (example driver, brown uniform + cap), the brown step van (side / front / rear / top), cars (side / front / rear / top),
// the city from above (blocks, roofs, crosswalks, signals, trees, map style), a suburb from above, the street at eye level
// (storefront facades, sidewalk, lamps, signals), a one-point perspective street (low road camera and the driver's POV),
// the cab, the dashboard cluster, the handheld route device, MythBusters props (clapperboard, test truck, fuel jars),
// the paper road and scissors, the NO LEFT TURN sign, the stoop and the package. Generic places, no logos: brands are plain text.
const K = require('../tests/mcd_collage/kit');
const R = require('../hirkit/rig');
const LT = require('../hirkit/light');
const CL = require('../hirkit/collage');
const { C, F, clamp, lerp, seg, E, rr, hash } = K;
const { INK, shade, fillStroke, ell, px } = R;

const W = 1080, H = 1920;
function layer(ctx, c, d, fn) { ctx.save(); ctx.translate(W / 2 + (c.shx || 0) * d, H / 2 + (c.shy || 0) * d); ctx.rotate((c.r || 0) * d); const z = Math.pow(c.z, d); ctx.scale(z, z); ctx.translate(-c.x * d, -c.y * d); fn(ctx); ctx.restore(); }
const txt = (ctx, s, x, y, size, col, align = 'center', font = F.black) => { ctx.font = `${size}px ${font}`; ctx.textAlign = align; ctx.fillStyle = col; ctx.fillText(s, x, y); };
function fitTxt(ctx, s, x, y, size, col, maxW, align = 'center') { ctx.font = `${size}px ${F.black}`; const w = ctx.measureText(s).width; if (w > maxW) size *= maxW / w; txt(ctx, s, x, y, size, col, align); return size; }
const h2 = (a, b) => hash(a * 31.7 + b * 17.3 + 5.1);

const BROWN = '#5E3F25', BROWNL = '#7B5536', BROWND = '#3F2A18', GLASS = '#2C3A4E', TIRE = '#232325', AMBER = '#FFB020', AMBER0 = '#9A6A2A';
const ASPH = '#4C5058', SIDEW = '#CFC8BA', CURB = '#E4DED2';
const CARCOL = ['#E63946', '#4D8DFF', '#F2F2EE', '#3A3F48', '#FFC857', '#8FA3B5', '#2E7D5B', '#C9CED6'];

// ---------- cast: Mike (fictional example driver) ----------
const MIKE = { skin: '#B97A56', hair: '#2A1C14', hairStyle: 'short', top: '#6B4A2B', cuff: '#573A20', shirt: '#E9DCC7', collar: '#5A3C22', pants: '#5A3E25',
  shoes: '#1E1A17', sole: '#3B3B3B', iris: '#3A2414', brow: '#20150F' };
const CAP = '#4F341D';
// cap over a front head (headFront space: centre 0,0, radius r)
function capFront(ctx, r, col = CAP) {
  ctx.beginPath(); ctx.moveTo(-r * 1.0, -r * 0.42); ctx.bezierCurveTo(-r * 1.02, -r * 1.32, r * 1.02, -r * 1.32, r * 1.0, -r * 0.42); ctx.quadraticCurveTo(0, -r * 0.55, -r * 1.0, -r * 0.42); ctx.closePath(); fillStroke(ctx, col, 5);
  ctx.strokeStyle = shade(col, 0.2); ctx.lineWidth = r * 0.04; ctx.beginPath(); ctx.moveTo(0, -r * 1.18); ctx.lineTo(0, -r * 0.55); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-r * 1.02, -r * 0.44); ctx.quadraticCurveTo(0, -r * 0.62, r * 1.02, -r * 0.44); ctx.quadraticCurveTo(r * 0.9, -r * 0.18, 0, -r * 0.2); ctx.quadraticCurveTo(-r * 0.9, -r * 0.18, -r * 1.02, -r * 0.44); ctx.closePath(); fillStroke(ctx, shade(col, -0.25), 5);
  ell(ctx, 0, -r * 1.2, r * 0.08, r * 0.05); ctx.fillStyle = shade(col, -0.3); ctx.fill();
}
// cap over a side head (head() space: centre 0,0, facing +x)
function capSide(ctx, r, col = CAP) {
  ctx.beginPath(); ctx.moveTo(-r * 0.98, -r * 0.3); ctx.bezierCurveTo(-r * 1.05, -r * 1.3, r * 0.95, -r * 1.32, r * 0.98, -r * 0.42); ctx.lineTo(-r * 0.98, -r * 0.3); ctx.closePath(); fillStroke(ctx, col, 5);
  ctx.beginPath(); ctx.moveTo(r * 0.6, -r * 0.5); ctx.quadraticCurveTo(r * 1.35, -r * 0.5, r * 1.55, -r * 0.3); ctx.quadraticCurveTo(r * 1.1, -r * 0.22, r * 0.62, -r * 0.3); ctx.closePath(); fillStroke(ctx, shade(col, -0.25), 5);
}
// Mike front bust with the cap (same params as R.bust)
function mikeBust(ctx, x, y, s, P = {}) {
  R.bust(ctx, x, y, s, MIKE, P);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(P.lean || 0); ctx.translate(0, -112); ctx.rotate(P.headTilt || 0); capFront(ctx, 78); ctx.restore();
}
// Mike full figure with the cap (same params as R.figure)
function mikeFigure(ctx, x, y, s, facing, P = {}) {
  const r = R.figure(ctx, x, y, s, facing, MIKE, P);
  ctx.save(); ctx.translate(x, y); ctx.scale(s * facing, s); ctx.translate(r.hd[0], r.hd[1]); ctx.rotate((P.headTilt || 0) + (P.lean || 0) * 0.3); capSide(ctx, 78); ctx.restore();
  return r;
}
// small side head of Mike (for the truck's open door)
function mikeHeadSide(ctx, x, y, r, face) { R.head(ctx, x, y, r, MIKE, face); ctx.save(); ctx.translate(x, y); ctx.rotate(face.tilt || 0); capSide(ctx, r); ctx.restore(); }

// ---------- paths (filleted polylines) with a speed profile ----------
function makePath(pts, rad = 120) {
  const S = []; const push = p => S.push(p);
  push(pts[0]);
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i];
    if (i < pts.length - 1) {
      const a = pts[i - 1], b = pts[i + 1], la = Math.hypot(p[0] - a[0], p[1] - a[1]), lb = Math.hypot(b[0] - p[0], b[1] - p[1]);
      const r = Math.min(rad, la / 2, lb / 2), s0 = [p[0] - (p[0] - a[0]) / la * r, p[1] - (p[1] - a[1]) / la * r], s1 = [p[0] + (b[0] - p[0]) / lb * r, p[1] + (b[1] - p[1]) / lb * r];
      line(S[S.length - 1], s0, S); for (let k = 1; k <= 16; k++) { const u = k / 16; S.push([lerp(lerp(s0[0], p[0], u), lerp(p[0], s1[0], u), u), lerp(lerp(s0[1], p[1], u), lerp(p[1], s1[1], u), u)]); }
    } else line(S[S.length - 1], p, S);
  }
  function line(a, b, out) { const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 12)); for (let k = 1; k <= n; k++) out.push([lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)]); }
  const L = [0]; for (let i = 1; i < S.length; i++) L.push(L[i - 1] + Math.hypot(S[i][0] - S[i - 1][0], S[i][1] - S[i - 1][1]));
  const ang = i => { const a = S[Math.max(0, i - 2)], b = S[Math.min(S.length - 1, i + 2)]; return Math.atan2(b[1] - a[1], b[0] - a[0]); };
  function at(d) { d = clamp(d, 0, L[L.length - 1]); let lo = 0, hi = L.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (L[m] < d) lo = m; else hi = m; }
    const u = (d - L[lo]) / ((L[hi] - L[lo]) || 1); return [lerp(S[lo][0], S[hi][0], u), lerp(S[lo][1], S[hi][1], u), ang(lo)]; }
  // time table: slower in the bends (curvature), vmax units/s
  function timing(vmax, slow = 0.5) { const T = [0]; for (let i = 1; i < S.length; i++) { let da = Math.abs(ang(i) - ang(i - 1)); if (da > Math.PI) da = 2 * Math.PI - da;
      const v = vmax * (1 - slow * clamp(da / 0.08)); T.push(T[i - 1] + (L[i] - L[i - 1]) / Math.max(v, vmax * 0.2)); }
    return t => { if (t <= 0) return 0; if (t >= T[T.length - 1]) return L[L.length - 1]; let lo = 0, hi = T.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (T[m] < t) lo = m; else hi = m; } return lerp(L[lo], L[hi], (t - T[lo]) / ((T[hi] - T[lo]) || 1)); }; }
  function draw(ctx, d0, d1) { ctx.beginPath(); let first = true; for (let i = 0; i < S.length; i++) { if (L[i] < d0 || L[i] > d1) continue; first ? ctx.moveTo(...S[i]) : ctx.lineTo(...S[i]); first = false; } const e = at(d1); if (!first) ctx.lineTo(e[0], e[1]); }
  return { S, L, len: L[L.length - 1], at, timing, draw };
}

// ---------- vehicle parts ----------
function tire(ctx, r, rot = 0) {
  ell(ctx, 0, 0, r, r); fillStroke(ctx, TIRE, 5);
  ctx.strokeStyle = '#3E3E42'; ctx.lineWidth = r * 0.06; for (let i = 0; i < 12; i++) { const a = rot + i / 12 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 0.8, Math.sin(a) * r * 0.8); ctx.lineTo(Math.cos(a) * r * 0.95, Math.sin(a) * r * 0.95); ctx.stroke(); }
  ell(ctx, 0, 0, r * 0.6, r * 0.6); fillStroke(ctx, '#9A9CA2', 4);
  ctx.save(); ctx.rotate(rot); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; ell(ctx, Math.cos(a) * r * 0.38, Math.sin(a) * r * 0.38, r * 0.06, r * 0.06); ctx.fillStyle = '#55575D'; ctx.fill(); }
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = r * 0.05; ctx.beginPath(); ctx.arc(0, 0, r * 0.5, -0.5, 0.6); ctx.stroke(); ctx.restore();
  ell(ctx, 0, 0, r * 0.2, r * 0.2); fillStroke(ctx, '#C9CBD0', 3.5);
}
const glowAt = (ctx, x, y, r, col, a) => LT.glow(ctx, x, y, r, col, a);
const blinkOn = (t, hz = 1.5) => ((t * hz) % 1) < 0.55;

// ---------- the brown step van, side view (faces +x, wheels on y = 0, ~1030 long) ----------
// o: { rot, blinkL (bool, lamp lit), driver(ctx) drawn in the open door, col, xray (0..1 packages inside), label, test (white box truck) }
function truckSide(ctx, o = {}) {
  const col = o.col || BROWN, dk = shade(col, -0.3), lt = shade(col, 0.18), r = 86;
  K.contact(ctx, 0, 0, 600, 36, 0.45);
  const body = () => { ctx.beginPath(); ctx.moveTo(-505, -118); ctx.lineTo(-505, -548); ctx.quadraticCurveTo(-505, -566, -487, -566); ctx.lineTo(402, -566); ctx.quadraticCurveTo(418, -566, 422, -552);
    ctx.lineTo(468, -356); ctx.quadraticCurveTo(472, -340, 490, -338); ctx.lineTo(506, -336); ctx.quadraticCurveTo(520, -334, 520, -318); ctx.lineTo(520, -132); ctx.lineTo(-505, -118); ctx.closePath(); };
  body(); fillStroke(ctx, col, 5);
  ctx.save(); body(); ctx.clip();
  let g = ctx.createLinearGradient(0, -566, 0, -118); g.addColorStop(0, 'rgba(255,255,255,0.22)'); g.addColorStop(0.35, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(20,10,0,0.25)'); ctx.fillStyle = g; ctx.fillRect(-520, -570, 1050, 460);
  ctx.fillStyle = dk; ctx.fillRect(-520, -178, 1050, 60); // skirt
  ctx.fillStyle = lt; ctx.fillRect(-520, -566, 1050, 16); // roof band
  ctx.strokeStyle = 'rgba(0,0,0,0.22)'; ctx.lineWidth = 4; for (const x of [-500, 310]) { ctx.beginPath(); ctx.moveTo(x, -550); ctx.lineTo(x, -178); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-500, -300); ctx.lineTo(300, -300); ctx.stroke();
  if (o.xray > 0) { // the box turns transparent: shelves full of packages
    ctx.save(); ctx.globalAlpha = clamp(o.xray); ctx.fillStyle = '#E9DCC4'; ctx.fillRect(-490, -545, 790, 360);
    ctx.strokeStyle = '#8A7350'; ctx.lineWidth = 8; for (const y of [-430, -310]) { ctx.beginPath(); ctx.moveTo(-490, y); ctx.lineTo(300, y); ctx.stroke(); }
    let k = 0; for (const [y0, hh] of [[-540, 105], [-425, 110], [-305, 120]]) { let x = -480; while (x < 280) { const w = 70 + hash(k * 3.3) * 80, h = hh * (0.6 + hash(k * 7.1) * 0.38); rr(ctx, x, y0 + hh - h, w - 8, h, 4);
        fillStroke(ctx, ['#C9A06A', '#B98D55', '#D8B27C'][k % 3], 3); ctx.strokeStyle = 'rgba(120,80,40,0.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + (w - 8) / 2, y0 + hh - h); ctx.lineTo(x + (w - 8) / 2, y0 + hh); ctx.stroke(); x += w; k++; } }
    ctx.setLineDash([16, 12]); ctx.strokeStyle = '#FFFDF8'; ctx.lineWidth = 6; ctx.strokeRect(-492, -547, 794, 364); ctx.setLineDash([]); ctx.restore(); }
  if (o.label) fitTxt(ctx, o.label, -100, -330, 92, o.test ? '#2E3A59' : '#E9D9B8', 700);
  else if (!o.test) txt(ctx, '1042', 250, -470, 34, 'rgba(233,217,184,0.85)');
  ctx.restore();
  // open door with the driver
  const door = () => { ctx.beginPath(); ctx.rect(328, -528, 88, 370); };
  door(); fillStroke(ctx, '#24190F', 4.5);
  if (o.driver) { ctx.save(); door(); ctx.clip(); o.driver(ctx); ctx.restore(); }
  ctx.save(); door(); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(328, -528, 30, 370); ctx.restore();
  rr(ctx, 336, -230, 70, 14, 4); fillStroke(ctx, '#6E6E72', 3); // step
  // windshield
  ctx.beginPath(); ctx.moveTo(424, -546); ctx.lineTo(466, -360); ctx.lineTo(450, -360); ctx.lineTo(414, -540); ctx.closePath(); fillStroke(ctx, GLASS, 4);
  // lamps
  rr(ctx, -511, -350, 14, 96, 4); fillStroke(ctx, '#C42D3A', 3.5);
  rr(ctx, -511, -246, 14, 44, 4); fillStroke(ctx, o.blinkL ? AMBER : AMBER0, 3.5);
  ell(ctx, 516, -250, 12, 22); fillStroke(ctx, '#FFF6DA', 3.5);
  rr(ctx, 506, -312, 18, 30, 4); fillStroke(ctx, o.blinkL ? AMBER : AMBER0, 3.5);
  rr(ctx, 470, -160, 66, 40, 8); fillStroke(ctx, '#3A3A3E', 4); // bumper
  R.tube(ctx, [[432, -470], [530, -486]], 9, '#2A2A2E', 3.5); rr(ctx, 524, -540, 20, 86, 6); fillStroke(ctx, '#2A2A2E', 3.5); // mirror
  // wheel wells + wheels
  for (const wx of [-300, 360]) { ell(ctx, wx, -r, r + 16, r + 16); ctx.fillStyle = '#1B130C'; ctx.fill(); ctx.save(); ctx.translate(wx, -r); tire(ctx, r, o.rot || 0); ctx.restore(); }
  if (o.blinkL) { glowAt(ctx, -505, -224, 90, 'rgba(255,170,40,1)', 0.55); glowAt(ctx, 515, -297, 80, 'rgba(255,170,40,1)', 0.55); }
}

// ---------- step van, front view (centre bottom at 0,0, ~540 wide). Driver's side (truck's left) = viewer's right ----------
function truckFront(ctx, o = {}) {
  const col = o.col || BROWN;
  K.contact(ctx, 0, 0, 330, 26, 0.45);
  rr(ctx, -248, -112, 92, 112, 14); fillStroke(ctx, TIRE, 4.5); rr(ctx, 156, -112, 92, 112, 14); fillStroke(ctx, TIRE, 4.5);
  CL.cutout(ctx, () => rr(ctx, -268, -572, 536, 466, 26), col, { elev: 0.3, tex: 0.25 });
  ctx.save(); rr(ctx, -268, -572, 536, 466, 26); ctx.clip(); const g = ctx.createLinearGradient(-268, 0, 268, 0); g.addColorStop(0, 'rgba(0,0,0,0.18)'); g.addColorStop(0.5, 'rgba(255,255,255,0.08)'); g.addColorStop(1, 'rgba(0,0,0,0.18)'); ctx.fillStyle = g; ctx.fillRect(-270, -580, 540, 480); ctx.restore();
  const pane = sx => () => rr(ctx, sx < 0 ? -238 : 10, -548, 228, 206, 16);
  for (const sx of [-1, 1]) { pane(sx)(); fillStroke(ctx, GLASS, 4.5); }
  if (o.driver) { ctx.save(); pane(1)(); ctx.clip(); o.driver(ctx); ctx.restore(); }
  for (const sx of [-1, 1]) { ctx.save(); pane(sx)(); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,0.16)'; ctx.beginPath(); ctx.moveTo(sx * 30, -548); ctx.lineTo(sx * 110, -548); ctx.lineTo(sx * 10, -342); ctx.lineTo(sx * -70, -342); ctx.closePath(); ctx.fill(); ctx.restore(); }
  for (let i = -1; i <= 1; i++) { ell(ctx, i * 70, -560, 12, 7); fillStroke(ctx, AMBER, 3); }
  rr(ctx, -125, -300, 250, 92, 12); fillStroke(ctx, '#2A2A2E', 4); ctx.strokeStyle = '#4A4A50'; ctx.lineWidth = 6; for (let y = -284; y < -212; y += 18) { ctx.beginPath(); ctx.moveTo(-112, y); ctx.lineTo(112, y); ctx.stroke(); }
  for (const sx of [-1, 1]) { ell(ctx, sx * 192, -254, 36, 36); fillStroke(ctx, '#FFF6DA', 4.5); ell(ctx, sx * 192, -254, 18, 18); ctx.fillStyle = '#FFFFFF'; ctx.fill(); }
  const onL = !!o.blinkL, onR = !!o.blinkR; // truck's left = +x
  rr(ctx, 200, -334, 46, 26, 6); fillStroke(ctx, onL ? AMBER : AMBER0, 3.5); rr(ctx, -246, -334, 46, 26, 6); fillStroke(ctx, onR ? AMBER : AMBER0, 3.5);
  rr(ctx, -284, -166, 568, 54, 12); fillStroke(ctx, '#3A3A3E', 4.5);
  for (const sx of [-1, 1]) { R.tube(ctx, [[sx * 262, -470], [sx * 330, -476]], 10, '#2A2A2E', 3.5); rr(ctx, sx * 330 - 15, -548, 30, 116, 8); fillStroke(ctx, '#2A2A2E', 3.5); }
  if (o.lights) for (const sx of [-1, 1]) glowAt(ctx, sx * 192, -254, 160, 'rgba(255,240,200,1)', 0.35);
  if (onL) glowAt(ctx, 223, -321, 110, 'rgba(255,170,40,1)', 0.7); if (onR) glowAt(ctx, -223, -321, 110, 'rgba(255,170,40,1)', 0.7);
}

// ---------- step van, rear view (centre bottom at 0,0). Truck's left = viewer's left ----------
function truckRear(ctx, o = {}) {
  const col = o.col || BROWN;
  K.contact(ctx, 0, 0, 330, 26, 0.45);
  rr(ctx, -256, -96, 120, 96, 12); fillStroke(ctx, TIRE, 4.5); rr(ctx, 136, -96, 120, 96, 12); fillStroke(ctx, TIRE, 4.5);
  CL.cutout(ctx, () => rr(ctx, -268, -572, 536, 448, 18), col, { elev: 0.3, tex: 0.25 });
  rr(ctx, -214, -540, 428, 380, 8); fillStroke(ctx, shade(col, 0.1), 4);
  ctx.strokeStyle = shade(col, -0.3); ctx.lineWidth = 4; for (let y = -500; y < -170; y += 38) { ctx.beginPath(); ctx.moveTo(-206, y); ctx.lineTo(206, y); ctx.stroke(); }
  rr(ctx, -36, -200, 72, 18, 6); fillStroke(ctx, '#C9CBD0', 3);
  for (const sx of [-1, 1]) { rr(ctx, sx * 246 - 16, -330, 32, 76, 6); fillStroke(ctx, '#C42D3A', 3.5); }
  const onL = !!o.blinkL, onR = !!o.blinkR;
  rr(ctx, -262, -244, 32, 40, 6); fillStroke(ctx, onL ? AMBER : AMBER0, 3.5); rr(ctx, 230, -244, 32, 40, 6); fillStroke(ctx, onR ? AMBER : AMBER0, 3.5);
  rr(ctx, -284, -142, 568, 44, 10); fillStroke(ctx, '#3A3A3E', 4.5);
  R.tube(ctx, [[-170, -92], [-200, -70]], 22, '#6E6E72', 3.5); // tailpipe
  if (onL) glowAt(ctx, -246, -224, 130, 'rgba(255,170,40,1)', 0.75); if (onR) glowAt(ctx, 246, -224, 130, 'rgba(255,170,40,1)', 0.75);
}

// ---------- step van from above (heading +x, centre at 0,0, 300 x 112). Left side = -y ----------
function truckTop(ctx, o = {}) {
  const col = o.col || BROWN;
  ctx.save(); ctx.translate(14, 18); rr(ctx, -150, -56, 300, 112, 12); ctx.fillStyle = 'rgba(30,20,10,0.32)'; ctx.fill(); ctx.restore();
  rr(ctx, -150, -56, 300, 112, 12); fillStroke(ctx, col, 4.5);
  rr(ctx, -142, -48, 214, 96, 8); fillStroke(ctx, shade(col, 0.14), 3);
  ctx.fillStyle = 'rgba(255,253,240,0.35)'; for (const x of [-120, -60, 0]) rr(ctx, x, -30, 40, 60, 5), ctx.fill();
  rr(ctx, 80, -50, 52, 100, 10); fillStroke(ctx, shade(col, -0.18), 3);
  rr(ctx, 132, -46, 14, 92, 5); fillStroke(ctx, GLASS, 3);
  rr(ctx, 112, -70, 16, 14, 3); fillStroke(ctx, '#2A2A2E', 2.5); rr(ctx, 112, 56, 16, 14, 3); fillStroke(ctx, '#2A2A2E', 2.5);
  if (o.label) { ctx.save(); ctx.rotate(0); fitTxt(ctx, o.label, -36, 14, 40, '#2E3A59', 190); ctx.restore(); }
  const L = !!o.blinkL, Rr = !!o.blinkR;
  for (const [x, y, on] of [[140, -56, L], [-150, -56, L], [140, 46, Rr], [-150, 46, Rr]]) { rr(ctx, x, y, 12, 12, 3); fillStroke(ctx, on ? AMBER : AMBER0, 2.5); if (on) glowAt(ctx, x + 6, y + 6, 60, 'rgba(255,170,40,1)', 0.8); }
  rr(ctx, -152, -38, 6, 14, 2); ctx.fillStyle = o.brake ? '#FF3B3B' : '#9A2A2A'; ctx.fill(); rr(ctx, -152, 24, 6, 14, 2); ctx.fill();
}

// ---------- cars ----------
function carTop(ctx, col, o = {}) { // heading +x, 190 x 90
  ctx.save(); ctx.translate(10, 14); rr(ctx, -95, -45, 190, 90, 26); ctx.fillStyle = 'rgba(30,20,10,0.3)'; ctx.fill(); ctx.restore();
  rr(ctx, -95, -45, 190, 90, 26); fillStroke(ctx, col, 4);
  rr(ctx, 26, -36, 30, 72, 10); fillStroke(ctx, GLASS, 3); rr(ctx, -66, -34, 22, 68, 8); fillStroke(ctx, GLASS, 3);
  rr(ctx, -42, -38, 66, 76, 10); fillStroke(ctx, shade(col, 0.16), 3);
  if (o.taxi) { rr(ctx, -16, -12, 22, 24, 4); fillStroke(ctx, '#FFFDF8', 2.5); }
  ctx.fillStyle = '#FFF6DA'; rr(ctx, 86, -36, 8, 14, 3); ctx.fill(); rr(ctx, 86, 22, 8, 14, 3); ctx.fill();
  ctx.fillStyle = o.brake ? '#FF3B3B' : '#9A2A2A'; rr(ctx, -96, -36, 6, 14, 2); ctx.fill(); rr(ctx, -96, 22, 6, 14, 2); ctx.fill();
  if (o.brake) { glowAt(ctx, -96, -29, 40, 'rgba(255,60,60,1)', 0.6); glowAt(ctx, -96, 29, 40, 'rgba(255,60,60,1)', 0.6); }
}
function carFront(ctx, col, o = {}) { // centre bottom 0,0, 180 wide
  K.contact(ctx, 0, 0, 110, 14, 0.4);
  rr(ctx, -84, -26, 32, 26, 8); fillStroke(ctx, TIRE, 4); rr(ctx, 52, -26, 32, 26, 8); fillStroke(ctx, TIRE, 4);
  ctx.beginPath(); ctx.moveTo(-66, -84); ctx.lineTo(-52, -136); ctx.quadraticCurveTo(0, -146, 52, -136); ctx.lineTo(66, -84); ctx.closePath(); fillStroke(ctx, shade(col, -0.08), 4);
  ctx.beginPath(); ctx.moveTo(-56, -88); ctx.lineTo(-44, -128); ctx.quadraticCurveTo(0, -136, 44, -128); ctx.lineTo(56, -88); ctx.closePath(); fillStroke(ctx, GLASS, 3.5);
  rr(ctx, -92, -92, 184, 70, 20); fillStroke(ctx, col, 4.5);
  for (const sx of [-1, 1]) { ell(ctx, sx * 60, -64, 18, 11); fillStroke(ctx, '#FFF6DA', 3.5); }
  rr(ctx, -36, -66, 72, 22, 6); fillStroke(ctx, '#2A2A2E', 3);
  rr(ctx, -94, -40, 188, 16, 6); fillStroke(ctx, shade(col, -0.35), 3);
  if (o.taxi) { rr(ctx, -24, -158, 48, 18, 4); fillStroke(ctx, '#FFFDF8', 3); fitTxt(ctx, 'TAXI', 0, -144, 14, INK, 40); }
  if (o.lights) for (const sx of [-1, 1]) glowAt(ctx, sx * 60, -64, 90, 'rgba(255,240,200,1)', 0.45);
}
function carRear(ctx, col, o = {}) {
  K.contact(ctx, 0, 0, 110, 14, 0.4);
  rr(ctx, -84, -26, 32, 26, 8); fillStroke(ctx, TIRE, 4); rr(ctx, 52, -26, 32, 26, 8); fillStroke(ctx, TIRE, 4);
  ctx.beginPath(); ctx.moveTo(-66, -84); ctx.lineTo(-50, -134); ctx.quadraticCurveTo(0, -144, 50, -134); ctx.lineTo(66, -84); ctx.closePath(); fillStroke(ctx, shade(col, -0.08), 4);
  ctx.beginPath(); ctx.moveTo(-52, -90); ctx.lineTo(-42, -126); ctx.quadraticCurveTo(0, -133, 42, -126); ctx.lineTo(52, -90); ctx.closePath(); fillStroke(ctx, GLASS, 3.5);
  rr(ctx, -92, -92, 184, 70, 20); fillStroke(ctx, col, 4.5);
  for (const sx of [-1, 1]) { rr(ctx, sx * 62 - 20, -78, 40, 18, 5); fillStroke(ctx, o.brake ? '#FF3B3B' : '#B52A2A', 3); }
  rr(ctx, -30, -66, 60, 18, 4); fillStroke(ctx, '#F2EFE6', 2.5);
}
function carSide(ctx, col, o = {}) { // faces +x, ~640 long, wheels on y = 0
  const r = 60;
  K.contact(ctx, 0, 0, 360, 24, 0.4);
  const body = () => { ctx.beginPath(); ctx.moveTo(-318, -64); ctx.lineTo(-322, -150); ctx.quadraticCurveTo(-318, -176, -290, -180); ctx.lineTo(-200, -188); ctx.quadraticCurveTo(-150, -268, -96, -274);
    ctx.lineTo(96, -274); ctx.quadraticCurveTo(150, -268, 200, -192); ctx.lineTo(292, -176); ctx.quadraticCurveTo(326, -168, 328, -132); ctx.lineTo(324, -64); ctx.closePath(); };
  body(); fillStroke(ctx, col, 4.5);
  ctx.save(); body(); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(-330, -274, 660, 70); ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(-330, -110, 660, 50); ctx.restore();
  for (const w of [() => { ctx.beginPath(); ctx.moveTo(-180, -192); ctx.quadraticCurveTo(-140, -256, -100, -258); ctx.lineTo(-10, -258); ctx.lineTo(-10, -192); ctx.closePath(); },
    () => { ctx.beginPath(); ctx.moveTo(10, -192); ctx.lineTo(10, -258); ctx.lineTo(92, -258); ctx.quadraticCurveTo(136, -254, 176, -194); ctx.closePath(); }]) { w(); fillStroke(ctx, GLASS, 3.5); }
  if (o.taxi) { rr(ctx, -50, -300, 100, 26, 6); fillStroke(ctx, '#FFFDF8', 3); fitTxt(ctx, 'TAXI', 0, -280, 20, INK, 90); }
  ell(ctx, 318, -140, 10, 14); fillStroke(ctx, '#FFF6DA', 3); rr(ctx, -326, -150, 10, 30, 3); fillStroke(ctx, '#B52A2A', 3);
  for (const wx of [-200, 200]) { ell(ctx, wx, -r, r + 10, r + 10); ctx.fillStyle = '#1B1B1E'; ctx.fill(); ctx.save(); ctx.translate(wx, -r); tire(ctx, r, o.rot || 0); ctx.restore(); }
}

// ---------- pedestrians from above ----------
function pedTop(ctx, x, y, a, col, ph = 0, hair = '#2A1C14') {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  const st = Math.sin(ph) * 9; ctx.fillStyle = '#2E3A59'; ell(ctx, st, -7, 7, 5); ctx.fill(); ell(ctx, -st, 7, 7, 5); ctx.fill();
  ell(ctx, 0, 0, 11, 20); fillStroke(ctx, col, 3); ell(ctx, 1, 0, 10, 10); fillStroke(ctx, hair, 3); ctx.restore();
}

// ---------- the city from above ----------
// grid: roads on x = i*B and y = j*B, road half-width RH, sidewalks SW. Lanes: heading north x = iB + 75, south iB - 75, east y = jB + 75, west jB - 75.
const B = 900, RH = 150, SW = 60, LANE = 75;
const ROOFS = ['#C9B79C', '#B8A98F', '#D7CBB4', '#A9907A', '#9DA6AE', '#C4A27F', '#B5B0A6', '#D1BFA0'];
function signalPhase(t, i, j) { const u = ((t + h2(i, j) * 9) % 14); return u < 6 ? 'NS' : u < 7 ? 'NSy' : u < 13 ? 'EW' : 'EWy'; }
function cityTop(ctx, t, o = {}) {
  const [x0, y0, x1, y1] = o.bounds || [-2000, -2000, 2000, 2000], map = !!o.map;
  ctx.fillStyle = map ? '#FFFDF8' : ASPH; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  const i0 = Math.floor(x0 / B) - 1, i1 = Math.ceil(x1 / B), j0 = Math.floor(y0 / B) - 1, j1 = Math.ceil(y1 / B);
  // road texture + markings
  if (!map) for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
    const cx = i * B, cy = j * B;
    ctx.fillStyle = '#FFFDF8';
    for (const s of [-1, 1]) { // crosswalks (zebra) on the four arms
      for (let k = -RH + 18; k < RH - 18; k += 34) { ctx.fillRect(cx + k, cy + s * (RH + 8) - (s < 0 ? 44 : 0), 18, 44); ctx.fillRect(cx + s * (RH + 8) - (s < 0 ? 44 : 0), cy + k, 44, 18); }
    }
    ctx.fillStyle = '#F2E4B8'; // stop lines on the right-hand lanes
    ctx.fillRect(cx + 4, cy + RH + 60, RH - 10, 8); ctx.fillRect(cx - RH + 6, cy - RH - 68, RH - 10, 8); ctx.fillRect(cx - RH - 68, cy + 4, 8, RH - 10); ctx.fillRect(cx + RH + 60, cy - RH + 6, 8, RH - 10);
    ctx.fillStyle = '#F2C94C'; // double yellow centre lines between intersections
    ctx.fillRect(cx - 6, cy + RH + 70, 4, B - 2 * RH - 140); ctx.fillRect(cx + 2, cy + RH + 70, 4, B - 2 * RH - 140);
    ctx.fillRect(cx + RH + 70, cy - 6, B - 2 * RH - 140, 4); ctx.fillRect(cx + RH + 70, cy + 2, B - 2 * RH - 140, 4);
    ctx.fillStyle = 'rgba(0,0,0,0.06)'; ctx.fillRect(cx - 40, cy + RH + 70, 20, B - 2 * RH - 140); ctx.fillRect(cx + RH + 70, cy + 30, B - 2 * RH - 140, 26);
  }
  for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
    const bx = i * B + RH, by = j * B + RH, bw = B - 2 * RH;
    if (bx > x1 || by > y1 || bx + bw < x0 || by + bw < y0) continue;
    rr(ctx, bx, by, bw, bw, 30); ctx.fillStyle = map ? '#EDE6D6' : SIDEW; ctx.fill(); ctx.lineWidth = px(ctx, map ? 2 : 4); ctx.strokeStyle = map ? '#C9C0AE' : '#9C9486'; ctx.stroke();
    const lx = bx + SW, ly = by + SW, lw = bw - 2 * SW, park = h2(i, j) < 0.12 && !o.noPark;
    if (park) { rr(ctx, lx, ly, lw, lw, 12); fillStroke(ctx, map ? '#CFE3C0' : '#86B86E', map ? 2 : 4);
      ctx.strokeStyle = map ? '#E8F0DC' : '#D8CBAA'; ctx.lineWidth = 22; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + lw, ly + lw); ctx.moveTo(lx + lw, ly); ctx.lineTo(lx, ly + lw); ctx.stroke();
      if (!map) for (let k = 0; k < 9; k++) tree(ctx, lx + 50 + hash(i * 9 + j * 3 + k) * (lw - 100), ly + 50 + hash(i * 5 + j * 7 + k * 2.3) * (lw - 100), 40 + hash(k + i) * 20);
      continue; }
    // buildings: split the lot
    const pat = Math.floor(h2(i + 3, j) * 4), rects = [];
    if (pat === 0) rects.push([0, 0, 1, 0.5], [0, 0.5, 1, 0.5]); else if (pat === 1) rects.push([0, 0, 0.5, 1], [0.5, 0, 0.5, 0.55], [0.5, 0.55, 0.5, 0.45]);
    else if (pat === 2) rects.push([0, 0, 0.5, 0.5], [0.5, 0, 0.5, 0.5], [0, 0.5, 0.5, 0.5], [0.5, 0.5, 0.5, 0.5]); else rects.push([0, 0, 1, 1]);
    rects.forEach((q, k) => {
      const x = lx + q[0] * lw + 4, y = ly + q[1] * lw + 4, w = q[2] * lw - 8, hh = q[3] * lw - 8, sd = h2(i * 7 + k, j * 3 + k), hgt = 20 + sd * 70, col = ROOFS[Math.floor(sd * 97) % ROOFS.length];
      if (!map) { ctx.fillStyle = 'rgba(25,20,30,0.34)'; ctx.beginPath(); ctx.moveTo(x + w, y); ctx.lineTo(x + w + hgt * 0.6, y + hgt * 0.8); ctx.lineTo(x + w + hgt * 0.6, y + hh + hgt * 0.8); ctx.lineTo(x + hgt * 0.6, y + hh + hgt * 0.8); ctx.lineTo(x, y + hh); ctx.lineTo(x + w, y + hh); ctx.closePath(); ctx.fill(); }
      rr(ctx, x, y, w, hh, 4); fillStroke(ctx, map ? shade('#E2D8C3', -sd * 0.08) : col, map ? 2 : 4);
      if (map) return;
      ctx.strokeStyle = shade(col, -0.18); ctx.lineWidth = px(ctx, 3); ctx.strokeRect(x + 12, y + 12, w - 24, hh - 24);
      // rooftop kit
      const n = 1 + Math.floor(sd * 3); for (let m = 0; m < n; m++) { const ax = x + 30 + hash(sd * 50 + m) * (w - 90), ay = y + 30 + hash(sd * 70 + m * 3) * (hh - 90); rr(ctx, ax, ay, 40, 30, 4); fillStroke(ctx, '#D9DCE0', 3); ctx.fillStyle = '#9AA0A8'; ctx.fillRect(ax + 6, ay + 8, 28, 4); }
      if (sd > 0.7) { ell(ctx, x + w - 60, y + 60, 30, 30); fillStroke(ctx, '#8A6A4A', 3.5); ell(ctx, x + w - 60, y + 60, 16, 16); fillStroke(ctx, '#6E5238', 3); }
      if (sd < 0.25) { ctx.fillStyle = 'rgba(150,200,240,0.6)'; for (let m = 0; m < 3; m++) rr(ctx, x + 24 + m * 46, y + hh - 70, 34, 44, 4), ctx.fill(); }
    });
    // street trees on the sidewalk
    if (!map) for (let k = 0; k < 3; k++) { const u = 0.22 + k * 0.28; tree(ctx, bx + u * bw, by + 28, 30); tree(ctx, bx + u * bw, by + bw - 28, 30); tree(ctx, bx + 28, by + u * bw, 30); tree(ctx, bx + bw - 28, by + u * bw, 30); }
  }
  // traffic signals at the corners
  if (!map && !o.noSignals) for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
    const cx = i * B, cy = j * B, ph = signalPhase(t, i, j);
    const ns = ph === 'NS' ? '#5BE37A' : ph === 'NSy' ? '#FFC857' : '#FF4D4D', ew = ph === 'EW' ? '#5BE37A' : ph === 'EWy' ? '#FFC857' : '#FF4D4D';
    for (const [sx, sy] of [[1, 1], [-1, -1], [-1, 1], [1, -1]]) { const x = cx + sx * (RH + 22), y = cy + sy * (RH + 22);
      ell(ctx, x, y, 9, 9); fillStroke(ctx, '#2A2A2E', 2.5);
      const c1 = (sx * sy > 0) ? ns : ew; ell(ctx, x, y, 5, 5); ctx.fillStyle = c1; ctx.fill(); glowAt(ctx, x, y, 26, c1, 0.5); }
  }
}
function tree(ctx, x, y, r) { ell(ctx, x + r * 0.35, y + r * 0.45, r, r); ctx.fillStyle = 'rgba(20,30,10,0.3)'; ctx.fill(); ell(ctx, x, y, r, r); fillStroke(ctx, '#4E9A5C', 3.5); ell(ctx, x - r * 0.28, y - r * 0.3, r * 0.45, r * 0.4); ctx.fillStyle = '#6CB878'; ctx.fill(); }

// ---------- the suburb from above (golden hour): lawns, gable roofs, driveways, quiet roads ----------
const SB = 1000, SRH = 115;
function suburbTop(ctx, t, o = {}) {
  const [x0, y0, x1, y1] = o.bounds || [-2000, -2000, 2000, 2000];
  ctx.fillStyle = '#585C63'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  const i0 = Math.floor(x0 / SB) - 1, i1 = Math.ceil(x1 / SB), j0 = Math.floor(y0 / SB) - 1, j1 = Math.ceil(y1 / SB);
  for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
    const bx = i * SB + SRH, by = j * SB + SRH, bw = SB - 2 * SRH;
    rr(ctx, bx, by, bw, bw, 40); ctx.fillStyle = '#DCD6C6'; ctx.fill(); ctx.lineWidth = px(ctx, 3); ctx.strokeStyle = '#A8A090'; ctx.stroke();
    rr(ctx, bx + 26, by + 26, bw - 52, bw - 52, 26); fillStroke(ctx, '#93BF72', 3.5);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 18; for (let k = 0; k < 8; k++) { ctx.beginPath(); ctx.moveTo(bx + 30, by + 60 + k * 90); ctx.lineTo(bx + bw - 30, by + 60 + k * 90); ctx.stroke(); }
    for (let q = 0; q < 4; q++) { // four houses facing the four streets
      const sd = h2(i * 4 + q, j), cx = bx + bw / 2, cy = by + bw / 2, ang = q * Math.PI / 2, rc = ['#B9563F', '#6E7F96', '#8B6A4E', '#A9A398', '#5E6E5A'][Math.floor(sd * 5)];
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang); ctx.translate(0, bw * 0.24);
      ctx.fillStyle = '#B9B3A5'; ctx.fillRect(130, 60, 70, bw * 0.26 - 40); // driveway
      ctx.fillStyle = 'rgba(30,25,20,0.3)'; ctx.fillRect(-150 + 20, -100 + 26, 280, 190);
      ctx.beginPath(); ctx.rect(-150, -100, 280, 180); ctx.fillStyle = shade(rc, 0.1); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-150, -100); ctx.lineTo(130, -100); ctx.lineTo(130, -10); ctx.lineTo(-150, -10); ctx.closePath(); fillStroke(ctx, shade(rc, -0.12), 3.5);
      ctx.beginPath(); ctx.rect(-150, -100, 280, 180); ctx.lineWidth = px(ctx, 4); ctx.strokeStyle = INK; ctx.stroke();
      ctx.strokeStyle = shade(rc, -0.35); ctx.lineWidth = px(ctx, 3); ctx.beginPath(); ctx.moveTo(-150, -10); ctx.lineTo(130, -10); ctx.stroke();
      ctx.restore();
      tree(ctx, cx + Math.cos(ang + 0.8) * bw * 0.36, cy + Math.sin(ang + 0.8) * bw * 0.36, 46 + sd * 20);
    }
  }
}

// ---------- street at eye level (side view): storefront facades, sidewalk, road ----------
// world: curb at y = 0; sidewalk -64..0; road 0..700 (far lane wheels at y ~ 260, near lane ~ 600). Building cells of width 560 from x = 0.
const CELL = 560, FLOOR = 300, SHOP = 430;
const SHOPS = ['DELI', 'PIZZA', 'CAFE', 'PHARMACY', 'BOOKS', 'LAUNDRY', 'BAGELS', 'HARDWARE', 'DINER', 'FLOWERS', 'BARBER', 'TACOS'];
const FACADES = [['#B5523B', 'brick'], ['#E6D6B6', 'stone'], ['#7D93A8', 'paint'], ['#8B5E3C', 'brick'], ['#C9B48E', 'stone'], ['#6C8A7A', 'paint'], ['#A14A3A', 'brick'], ['#D9C9A8', 'stone']];
function facade(ctx, x, w, k, t, o = {}) {
  const sd = hash(k * 1.37 + 0.2), [col, kind] = FACADES[Math.floor(sd * 997) % FACADES.length], floors = 3 + Math.floor(hash(k * 2.1) * 4), top = -64 - SHOP - floors * FLOOR;
  CL.cutout(ctx, () => { ctx.beginPath(); ctx.rect(x, top, w, -64 - top); }, col, { elev: 0.5, tex: 0.5, lw: 4 });
  if (kind === 'brick') { ctx.strokeStyle = 'rgba(60,20,10,0.16)'; ctx.lineWidth = 2; for (let y = top + 20; y < -64 - SHOP; y += 26) { ctx.beginPath(); ctx.moveTo(x + 4, y); ctx.lineTo(x + w - 4, y); ctx.stroke(); } }
  // cornice
  rr(ctx, x - 14, top - 10, w + 28, 40, 4); fillStroke(ctx, shade(col, -0.22), 4); ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(x - 10, top - 6, w + 20, 8);
  // windows
  const nc = 3, ww = 104, gap = (w - nc * ww) / (nc + 1);
  for (let f = 0; f < floors; f++) for (let c = 0; c < nc; c++) {
    const wx = x + gap + c * (ww + gap), wy = top + 60 + f * FLOOR, lit = hash(k * 13 + f * 3 + c) < (o.evening ? 0.55 : 0.08);
    rr(ctx, wx - 8, wy - 8, ww + 16, 170 + 16, 4); ctx.fillStyle = shade(col, kind === 'stone' ? -0.15 : 0.18); ctx.fill();
    rr(ctx, wx, wy, ww, 170, 3); fillStroke(ctx, lit ? '#FFD98A' : '#3E4C60', 3.5);
    if (!lit) { ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.moveTo(wx + 10, wy + 170); ctx.lineTo(wx + 40, wy); ctx.lineTo(wx + 62, wy); ctx.lineTo(wx + 32, wy + 170); ctx.closePath(); ctx.fill(); }
    ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 2.5); ctx.beginPath(); ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + 170); ctx.moveTo(wx, wy + 80); ctx.lineTo(wx + ww, wy + 80); ctx.stroke();
    rr(ctx, wx - 12, wy + 172, ww + 24, 12, 2); fillStroke(ctx, shade(col, -0.25), 2.5);
  }
  if (kind === 'brick' && hash(k * 5.5) > 0.4) { // fire escape
    const fx = x + gap - 30, fw = ww * 2 + gap + 60; ctx.strokeStyle = '#1E1E22'; ctx.lineWidth = px(ctx, 4);
    for (let f = 1; f < floors; f++) { const py = top + 60 + f * FLOOR - 26; ctx.strokeRect(fx, py, fw, 4); for (let b = 0; b <= 8; b++) { ctx.beginPath(); ctx.moveTo(fx + b * fw / 8, py); ctx.lineTo(fx + b * fw / 8, py - 40); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(fx, py - 40); ctx.lineTo(fx + fw, py - 40); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(fx + 20, py); ctx.lineTo(fx + fw * 0.45, py - FLOOR + 30); ctx.stroke(); }
  }
  // storefront
  const sy = -64 - SHOP; rr(ctx, x + 10, sy, w - 20, SHOP, 2); fillStroke(ctx, shade(col, -0.3), 4);
  rr(ctx, x + 34, sy + 150, w - 200, SHOP - 170, 4); fillStroke(ctx, o.evening ? '#FFD98A' : '#56708A', 3.5);
  ctx.fillStyle = 'rgba(255,255,255,0.16)'; ctx.beginPath(); ctx.moveTo(x + 60, -84); ctx.lineTo(x + 150, sy + 150); ctx.lineTo(x + 200, sy + 150); ctx.lineTo(x + 110, -84); ctx.closePath(); ctx.fill();
  rr(ctx, x + w - 150, sy + 150, 110, SHOP - 150, 4); fillStroke(ctx, '#3A2A22', 3.5); ell(ctx, x + w - 62, sy + 300, 6, 6); ctx.fillStyle = C.yellow; ctx.fill();
  // awning + sign
  const ac = [C.red, '#2E7D5B', '#2E3A59', '#E9A93A', '#4D8DFF'][Math.floor(hash(k * 4.2) * 5)];
  ctx.beginPath(); ctx.moveTo(x + 14, sy + 70); ctx.lineTo(x + w - 14, sy + 70); ctx.lineTo(x + w + 6, sy + 150); ctx.lineTo(x - 6, sy + 150); ctx.closePath(); fillStroke(ctx, ac, 4);
  ctx.save(); ctx.clip(); ctx.fillStyle = 'rgba(255,253,248,0.85)'; for (let s = x - 6; s < x + w + 6; s += 56) ctx.fillRect(s, sy + 60, 28, 100); ctx.restore();
  ctx.beginPath(); ctx.moveTo(x + 14, sy + 70); ctx.lineTo(x + w - 14, sy + 70); ctx.lineTo(x + w + 6, sy + 150); ctx.lineTo(x - 6, sy + 150); ctx.closePath(); ctx.lineWidth = px(ctx, 4); ctx.strokeStyle = INK; ctx.stroke();
  rr(ctx, x + 40, sy + 6, w - 80, 58, 6); fillStroke(ctx, '#FFFDF8', 3.5); fitTxt(ctx, SHOPS[Math.floor(hash(k * 9.7) * 997) % SHOPS.length], x + w / 2, sy + 50, 44, INK, w - 110);
  if (hash(k * 3.9) > 0.8) { rr(ctx, x + w - 150, top - 170, 90, 150, 10); fillStroke(ctx, '#8A6A4A', 4); ctx.strokeStyle = '#5A4430'; ctx.lineWidth = 4; for (const d of [-30, 30]) { ctx.beginPath(); ctx.moveTo(x + w - 105 + d, top - 20); ctx.lineTo(x + w - 105 + d * 1.3, top - 10); ctx.stroke(); } }
}
function streetLamp(ctx, x, on = false) { R.tube(ctx, [[x, -40], [x, -820], [x + 60, -860], [x + 130, -860]], 14, '#2E3A3A', 3.5); rr(ctx, x + 110, -870, 70, 26, 8); fillStroke(ctx, '#2E3A3A', 3.5); ell(ctx, x + 145, -842, 26, 9); ctx.fillStyle = on ? '#FFE9A8' : '#E8E2D2'; ctx.fill(); if (on) glowAt(ctx, x + 145, -830, 220, 'rgba(255,220,140,1)', 0.4); rr(ctx, x - 18, -60, 36, 24, 4); fillStroke(ctx, '#2E3A3A', 3); }
function sideTree(ctx, x) { R.tube(ctx, [[x, -40], [x, -460]], 26, '#6B4A2B', 4); for (const [dx, dy, r] of [[0, -560, 150], [-110, -470, 100], [110, -480, 110], [0, -680, 110]]) { ell(ctx, x + dx, dy, r, r * 0.9); fillStroke(ctx, '#4E9A5C', 4.5); } ell(ctx, x - 50, -620, 70, 50); ctx.fillStyle = '#6CB878'; ctx.fill(); ell(ctx, x, -40, 60, 10); ctx.fillStyle = '#6E5A44'; ctx.fill(); }
function hydrant(ctx, x) { rr(ctx, x - 20, -130, 40, 90, 8); fillStroke(ctx, C.red, 3.5); ell(ctx, x, -132, 26, 14); fillStroke(ctx, C.redD, 3); rr(ctx, x - 34, -100, 68, 18, 6); fillStroke(ctx, C.red, 3); }
function signalSide(ctx, x, col) { R.tube(ctx, [[x, -40], [x, -900]], 18, '#3A3F48', 3.5); rr(ctx, x - 34, -1080, 68, 190, 12); fillStroke(ctx, '#2A2E33', 4); ['#FF4D4D', '#FFC857', '#5BE37A'].forEach((c, i) => { ell(ctx, x, -1048 + i * 60, 22, 22); ctx.fillStyle = col === c ? c : shade(c, -0.6); ctx.fill(); if (col === c) glowAt(ctx, x, -1048 + i * 60, 90, c, 0.6); }); }
// o: { x0, x1, cross: [x of cross street centres], t, peds, evening }
function streetSide(ctx, t, o = {}) {
  const x0 = o.x0 ?? -3000, x1 = o.x1 ?? 3000, cross = o.cross || [], CW = 640;
  // road + sidewalk
  ctx.fillStyle = ASPH; ctx.fillRect(x0, 0, x1 - x0, 2400); ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(x0, 0, x1 - x0, 40);
  ctx.fillStyle = '#F2C94C'; ctx.fillRect(x0, 392, x1 - x0, 7); ctx.fillRect(x0, 404, x1 - x0, 7);
  ctx.fillStyle = SIDEW; ctx.fillRect(x0, -64, x1 - x0, 64); ctx.fillStyle = CURB; ctx.fillRect(x0, -6, x1 - x0, 14);
  ctx.strokeStyle = 'rgba(80,70,60,0.25)'; ctx.lineWidth = 3; for (let x = Math.floor(x0 / 160) * 160; x < x1; x += 160) { ctx.beginPath(); ctx.moveTo(x, -64); ctx.lineTo(x - 30, 0); ctx.stroke(); }
  const inCross = x => cross.some(c => Math.abs(x - c) < CW / 2);
  // cross streets: the road runs away from us between the buildings
  for (const c of cross) { if (c < x0 - CW || c > x1 + CW) continue;
    ctx.fillStyle = '#9FB2C4'; ctx.fillRect(c - CW / 2, -2400, CW, 2340);
    for (let m = 0; m < 4; m++) { const fx = c - CW / 2 + 40 + m * 150, fh = 600 + hash(c + m) * 900; ctx.fillStyle = shade('#B9C6D2', -hash(m + c) * 0.15); ctx.fillRect(fx, -64 - fh - 500, 130, fh); }
    ctx.fillStyle = ASPH; ctx.beginPath(); ctx.moveTo(c - CW / 2, -64); ctx.lineTo(c + CW / 2, -64); ctx.lineTo(c + 60, -560); ctx.lineTo(c - 60, -560); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FFFDF8'; for (let k = 0; k < 7; k++) ctx.fillRect(c - CW / 2 + 30 + k * 86, 30, 46, 300);
  }
  for (let k = Math.floor(x0 / CELL) - 1; k <= Math.ceil(x1 / CELL); k++) { const x = k * CELL; if (inCross(x + CELL / 2) || inCross(x) || inCross(x + CELL)) continue; facade(ctx, x + 6, CELL - 12, k, t, o); }
  // street furniture
  for (let k = Math.floor(x0 / 1120) - 1; k <= Math.ceil(x1 / 1120); k++) { const lx = k * 1120 + 210; if (!inCross(lx)) streetLamp(ctx, lx, o.evening); const tx = k * 1120 + 770; if (!inCross(tx)) sideTree(ctx, tx); if (!inCross(k * 1120 + 520)) hydrant(ctx, k * 1120 + 520); }
  for (const c of cross) { const ph = signalPhase(t, Math.round(c / 1000), 0); signalSide(ctx, c - CW / 2 - 40, ph === 'EW' ? '#5BE37A' : ph === 'EWy' ? '#FFC857' : '#FF4D4D'); }
}
// background skyline (for parallax layers)
function skyline(ctx, x0, x1, base = 0, col = '#AFC0D0') {
  for (let k = Math.floor(x0 / 260) - 1; k < Math.ceil(x1 / 260) + 1; k++) { const hh = 700 + hash(k * 3.1) * 1500, w = 200 + hash(k * 1.7) * 120, x = k * 260;
    ctx.fillStyle = shade(col, -hash(k) * 0.12); ctx.fillRect(x, base - hh, w, hh); ctx.fillStyle = 'rgba(255,255,255,0.25)'; for (let y = base - hh + 40; y < base - 40; y += 70) for (let c = 20; c < w - 30; c += 50) ctx.fillRect(x + c, y, 22, 30);
    if (hash(k * 7.7) > 0.8) { ctx.fillStyle = shade(col, -0.1); ctx.fillRect(x + w / 2 - 6, base - hh - 200, 12, 200); } }
}

// ---------- one-point perspective street (screen space) ----------
// X right, Y up, Z forward (metres). Camera at (camX, camH, 0) looking +Z. Road |X| < 3.5 (one lane each way, ours X > 0),
// sidewalks to |X| = 6.5, buildings from there; a cross street between Z = zc0 and zc1.
function persp(o = {}) {
  const vx = o.vx ?? 540, vy = o.vy ?? 880, f = o.f ?? 760, camH = o.camH ?? 1.2, camX = o.camX ?? 0, zc0 = o.zc0 ?? 16, zc1 = o.zc1 ?? 23, FAR = 160, L = 6.5;
  const P = (X, Y, Z) => [vx + (X - camX) * f / Z, vy - (Y - camH) * f / Z];
  const quad = (ctx, pts) => { ctx.beginPath(); pts.forEach((p, i) => { const q = P(...p); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.closePath(); };
  function ground(ctx, t) {
    const g = ctx.createLinearGradient(0, 0, 0, vy); g.addColorStop(0, o.skyTop || '#8EC3EE'); g.addColorStop(1, o.skyBot || '#F4E7CF'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, vy + 2);
    ctx.save(); ctx.translate(vx - 600, vy); ctx.scale(0.42, 0.42); skyline(ctx, 0, 2860, 0, o.skyCol || '#B8C8D8'); ctx.restore();
    ctx.fillStyle = SIDEW; ctx.fillRect(0, vy, W, H - vy);
    ctx.fillStyle = ASPH; quad(ctx, [[-3.6, 0, 0.6], [3.6, 0, 0.6], [3.6, 0, FAR], [-3.6, 0, FAR]]); ctx.fill();
    quad(ctx, [[-400, 0, zc0], [400, 0, zc0], [400, 0, zc1], [-400, 0, zc1]]); ctx.fill();
    ctx.fillStyle = CURB; for (const s of [-1, 1]) { quad(ctx, [[s * 3.6, 0, 0.6], [s * 3.9, 0, 0.6], [s * 3.9, 0, zc0], [s * 3.6, 0, zc0]]); ctx.fill(); quad(ctx, [[s * 3.6, 0, zc1], [s * 3.9, 0, zc1], [s * 3.9, 0, FAR], [s * 3.6, 0, FAR]]); ctx.fill(); }
    ctx.fillStyle = '#F2C94C'; for (const [a, b] of [[0.6, zc0 - 3.4], [zc1 + 3, FAR]]) for (const d of [-0.16, 0.06]) { quad(ctx, [[d, 0, a], [d + 0.1, 0, a], [d + 0.1, 0, b], [d, 0, b]]); ctx.fill(); }
    ctx.fillStyle = '#FFFDF8'; for (const z0 of [zc0 - 3, zc1 + 0.2]) for (let x = -3.3; x < 3.3; x += 0.9) { quad(ctx, [[x, 0, z0], [x + 0.45, 0, z0], [x + 0.45, 0, z0 + 2.8], [x, 0, z0 + 2.8]]); ctx.fill(); }
    quad(ctx, [[0.2, 0, zc0 - 3.6], [3.5, 0, zc0 - 3.6], [3.5, 0, zc0 - 3.2], [0.2, 0, zc0 - 3.2]]); ctx.fill();
  }
  // facades along the street (both sides) and the row across the cross street, far to near
  function buildings(ctx, t, zmin = 0.8) {
    const items = [];
    for (const s of [-1, 1]) {
      let z = 0.4, k = s < 0 ? 100 : 200; while (z < FAR) { const len = 8 + hash(k) * 7, za = z, zb = Math.min(z + len, z >= zc1 ? FAR : zc0);
        if (za >= zc0 && za < zc1) { z = zc1; continue; } items.push({ s, za, zb, h: 11 + hash(k * 1.3) * 16, k }); z = zb + 0.01; k++; }
    }
    items.sort((a, b) => b.za - a.za);
    // the row facing us across the intersection
    const far = (s) => { for (let m = 0; m < 5; m++) { const xa = s * (L + m * 9), xb = s * (L + (m + 1) * 9), hh = 12 + hash(m * 3 + s) * 14, col = FACADES[(m * 3 + (s > 0 ? 1 : 4)) % FACADES.length][0];
        ctx.fillStyle = col; quad(ctx, [[xa, 0, zc1 + 3], [xb, 0, zc1 + 3], [xb, hh, zc1 + 3], [xa, hh, zc1 + 3]]); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.stroke();
        ctx.fillStyle = 'rgba(40,55,75,0.8)'; for (let y = 4.5; y < hh - 2; y += 3.4) for (let x = 1; x < 8.4; x += 2.6) { const wa = xa + s * x; quad(ctx, [[wa, y, zc1 + 3], [wa + s * 1.3, y, zc1 + 3], [wa + s * 1.3, y + 1.9, zc1 + 3], [wa, y + 1.9, zc1 + 3]]); ctx.fill(); }
        ctx.fillStyle = shade(col, -0.35); quad(ctx, [[xa, 0, zc1 + 3], [xb, 0, zc1 + 3], [xb, 3.8, zc1 + 3], [xa, 3.8, zc1 + 3]]); ctx.fill(); } };
    let farDone = false;
    for (const b of items) {
      if (!farDone && b.za < zc1 + 3) { far(-1); far(1); farDone = true; }
      if (b.zb < zmin) continue;
      const X = b.s * L, col = FACADES[Math.floor(hash(b.k * 1.37 + 0.2) * 997) % FACADES.length][0], za = Math.max(b.za, zmin);
      ctx.fillStyle = col; quad(ctx, [[X, 0, za], [X, 0, b.zb], [X, b.h, b.zb], [X, b.h, za]]); ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = INK; ctx.stroke();
      ctx.fillStyle = 'rgba(0,0,0,0.12)'; quad(ctx, [[X, b.h - 0.8, za], [X, b.h - 0.8, b.zb], [X, b.h, b.zb], [X, b.h, za]]); ctx.fill();
      if (b.za < 70) { ctx.fillStyle = 'rgba(40,55,75,0.85)'; for (let y = 5; y < b.h - 2; y += 3.4) for (let z = b.za + 1; z < b.zb - 1.6; z += 2.8) { if (z < za) continue; quad(ctx, [[X, y, z], [X, y, z + 1.5], [X, y + 2, z + 1.5], [X, y + 2, z]]); ctx.fill(); } }
      const ac = [C.red, '#2E7D5B', '#2E3A59', '#E9A93A', '#4D8DFF'][b.k % 5];
      ctx.fillStyle = shade(col, -0.35); quad(ctx, [[X, 0, za], [X, 0, b.zb], [X, 3.9, b.zb], [X, 3.9, za]]); ctx.fill();
      ctx.fillStyle = '#56708A'; quad(ctx, [[X, 0.4, za + 0.3], [X, 0.4, b.zb - 0.3], [X, 3, b.zb - 0.3], [X, 3, za + 0.3]]); ctx.fill();
      ctx.fillStyle = ac; quad(ctx, [[X, 3.4, za], [X, 3.4, b.zb], [X - b.s * 1.3, 2.9, b.zb], [X - b.s * 1.3, 2.9, za]]); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.stroke();
    }
    if (!farDone) { far(-1); far(1); }
  }
  // hanging traffic signal over the intersection (far side), lit colour
  function signal(ctx, col = '#5BE37A') {
    const pole = P(L - 0.4, 0, zc1 + 2.6), top = P(L - 0.4, 6.4, zc1 + 2.6), arm = P(-0.6, 6.2, zc1 + 2.6), k = f / (zc1 + 2.6);
    ctx.strokeStyle = '#3A3F48'; ctx.lineCap = 'round'; ctx.lineWidth = 0.28 * k; ctx.beginPath(); ctx.moveTo(...pole); ctx.lineTo(...top); ctx.stroke(); ctx.lineWidth = 0.16 * k; ctx.beginPath(); ctx.moveTo(...top); ctx.lineTo(...arm); ctx.stroke();
    for (const X of [0.6, 3]) { const p = P(X, 6.1, zc1 + 2.6), w = 0.42 * k, hh = 1.15 * k; rr(ctx, p[0] - w / 2, p[1], w, hh, w * 0.2); fillStroke(ctx, '#2A2E33', 3);
      ['#FF4D4D', '#FFC857', '#5BE37A'].forEach((c, i) => { ell(ctx, p[0], p[1] + hh * (0.2 + i * 0.3), w * 0.32, w * 0.32); ctx.fillStyle = col === c ? c : shade(c, -0.6); ctx.fill(); if (col === c) glowAt(ctx, p[0], p[1] + hh * (0.2 + i * 0.3), w * 1.6, c, 0.7); }); }
  }
  // draw a local-unit sprite standing on the ground at (X, Z): worldW metres wide = localW units
  function place(ctx, X, Z, worldW, localW, draw, Y = 0) { if (Z < 0.3) return; const p = P(X, Y, Z), k = f / Z * worldW / localW; ctx.save(); ctx.translate(p[0], p[1]); ctx.scale(k, k); draw(ctx); ctx.restore(); }
  return { P, quad, ground, buildings, signal, place, vx, vy, f, camH, camX, zc0, zc1 };
}

// ---------- cab interior, dashboard cluster, the handheld route device ----------
function cluster(ctx, o = {}) { // centred, ~760 wide
  CL.cutout(ctx, () => rr(ctx, -380, -170, 760, 340, 60), '#24262B', { elev: 1, tex: 0.2 });
  for (const [cx, r, lab, v] of [[-170, 130, 'MPH', o.mph ?? 0], [170, 110, 'FUEL', o.fuel ?? 0.7]]) {
    ell(ctx, cx, 10, r, r); fillStroke(ctx, '#111215', 4); ctx.strokeStyle = '#E9E7E2'; ctx.lineWidth = 5;
    for (let i = 0; i <= 8; i++) { const a = Math.PI * (0.8 + i * 0.175); ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r * 0.78, 10 + Math.sin(a) * r * 0.78); ctx.lineTo(cx + Math.cos(a) * r * 0.92, 10 + Math.sin(a) * r * 0.92); ctx.stroke(); }
    if (lab === 'FUEL') { txt(ctx, 'E', cx - r * 0.62, 10 + r * 0.55, 30, C.red); txt(ctx, 'F', cx + r * 0.62, 10 + r * 0.55, 30, '#E9E7E2'); }
    txt(ctx, lab, cx, 10 + r * 0.55, 24, '#9AA0A8');
    const a = Math.PI * (0.8 + v * 1.4); ctx.strokeStyle = C.red; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx, 10); ctx.lineTo(cx + Math.cos(a) * r * 0.8, 10 + Math.sin(a) * r * 0.8); ctx.stroke(); ell(ctx, cx, 10, 14, 14); ctx.fillStyle = '#E9E7E2'; ctx.fill();
  }
  const on = !!o.blinkL; ctx.save(); ctx.translate(0, -110); ctx.beginPath(); ctx.moveTo(-60, 0); ctx.lineTo(-20, -32); ctx.lineTo(-20, -14); ctx.lineTo(30, -14); ctx.lineTo(30, 14); ctx.lineTo(-20, 14); ctx.lineTo(-20, 32); ctx.closePath();
  ctx.fillStyle = on ? '#5BE37A' : '#2E4A36'; ctx.fill(); ctx.restore(); if (on) glowAt(ctx, -15, -110, 120, 'rgba(90,230,120,1)', 0.8);
}
// rugged handheld route device, centred; screen(ctx, w, h) local 0,0 top-left
function device(ctx, screen, s = 1) {
  ctx.save(); ctx.scale(s, s);
  CL.cutout(ctx, () => rr(ctx, -170, -250, 340, 500, 40), '#2C2F35', { elev: 1.4, tex: 0.2 });
  rr(ctx, -150, -228, 300, 340, 14); ctx.fillStyle = '#0E1116'; ctx.fill();
  ctx.save(); ctx.beginPath(); rr(ctx, -142, -220, 284, 324, 10); ctx.clip(); ctx.translate(-142, -220); screen(ctx, 284, 324); ctx.restore();
  for (let i = 0; i < 9; i++) { rr(ctx, -110 + (i % 3) * 80, 130 + Math.floor(i / 3) * 36, 60, 24, 8); ctx.fillStyle = i === 4 ? C.yellow : '#4A4E56'; ctx.fill(); }
  ctx.restore();
}

// ---------- MythBusters, money, signs, the stoop ----------
function clapper(ctx, open = 0, lines = []) { // centred board 560 x 420
  CL.cutout(ctx, () => rr(ctx, -280, -150, 560, 360, 18), '#1E1E22', { elev: 1.6, tex: 0.2 });
  ctx.strokeStyle = '#FFFDF8'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-260, 40); ctx.lineTo(260, 40); ctx.moveTo(0, 40); ctx.lineTo(0, 190); ctx.stroke();
  lines.forEach((s, i) => fitTxt(ctx, s, 0, -60 + i * 76 - (i ? 0 : 0), i ? 44 : 58, i ? C.yellow : '#FFFDF8', 500));
  txt(ctx, 'TAKE 1', -130, 140, 40, '#FFFDF8'); txt(ctx, 'SCENE 12', 130, 140, 40, '#FFFDF8');
  ctx.save(); ctx.translate(-280, -150); ctx.rotate(-open * 0.5);
  const stripes = () => rr(ctx, 0, -70, 560, 70, 10); CL.cutout(ctx, stripes, '#FFFDF8', { elev: 1, tex: 0.1 }); ctx.save(); stripes(); ctx.clip(); ctx.fillStyle = '#1E1E22'; for (let x = -40; x < 600; x += 90) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 45, 0); ctx.lineTo(x + 85, -70); ctx.lineTo(x + 40, -70); ctx.closePath(); ctx.fill(); } ctx.restore();
  ctx.restore();
}
function fuelJar(ctx, level, label, col = '#E9A93A') { // jar 220 x 360, base at 0
  CL.cutout(ctx, () => rr(ctx, -110, -360, 220, 360, 26), 'rgba(230,240,250,0.9)', { elev: 1.2, tex: 0.1 });
  ctx.save(); rr(ctx, -100, -350, 200, 340, 20); ctx.clip(); const y = -10 - 330 * clamp(level); ctx.fillStyle = col; ctx.fillRect(-110, y, 220, 400); ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(-110, y, 220, 14); ctx.restore();
  rr(ctx, -60, -392, 120, 40, 10); fillStroke(ctx, '#3A3F48', 4);
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(-84, -330, 18, 290);
  if (label) fitTxt(ctx, label, 0, 60, 44, INK, 300);
}
function scissors(ctx, open = 0.3, s = 1) {
  ctx.save(); ctx.scale(s, s);
  for (const sd of [-1, 1]) { ctx.save(); ctx.rotate(sd * open * 0.5);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(240, sd * -10); ctx.lineTo(240, sd * 6); ctx.lineTo(0, sd * 22); ctx.closePath(); fillStroke(ctx, '#D9DCE0', 4);
    ell(ctx, -90, sd * 40, 50, 34); fillStroke(ctx, C.red, 4.5); ell(ctx, -90, sd * 40, 26, 16); ctx.fillStyle = 'rgba(247,245,240,1)'; ctx.fill(); ctx.lineWidth = px(ctx, 3); ctx.strokeStyle = INK; ctx.stroke();
    R.tube(ctx, [[-50, sd * 30], [0, sd * 10]], 18, C.red, 4); ctx.restore(); }
  ell(ctx, 0, 0, 10, 10); fillStroke(ctx, '#8A8F96', 3); ctx.restore();
}
function noLeftSign(ctx, slashOff = 0, s = 1) { // regulatory sign, centred 420 x 520; slashOff 0..1 peels the red slash away
  ctx.save(); ctx.scale(s, s);
  R.tube(ctx, [[0, 240], [0, 900]], 34, '#9AA0A8', 4);
  CL.cutout(ctx, () => rr(ctx, -210, -260, 420, 520, 26), '#FFFDF8', { elev: 1.6, tex: 0.3 });
  rr(ctx, -190, -240, 380, 480, 18); ctx.lineWidth = px(ctx, 6); ctx.strokeStyle = INK; ctx.stroke();
  // left-turn arrow (black)
  ctx.save(); ctx.translate(20, 10); ctx.strokeStyle = INK; ctx.lineWidth = 46; ctx.lineCap = 'butt'; ctx.beginPath(); ctx.moveTo(40, 150); ctx.lineTo(40, -10); ctx.quadraticCurveTo(40, -60, -10, -60); ctx.lineTo(-70, -60); ctx.stroke();
  ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(-150, -60); ctx.lineTo(-70, -130); ctx.lineTo(-70, 10); ctx.closePath(); ctx.fill(); ctx.restore();
  // red circle
  ell(ctx, 0, 0, 170, 170); ctx.lineWidth = 34; ctx.strokeStyle = C.red; ctx.stroke();
  // red slash (peels off)
  ctx.save(); const u = E.in(clamp(slashOff)); ctx.translate(u * 260, u * 520); ctx.rotate(-Math.PI / 4 + u * 1.6); ctx.globalAlpha *= 1 - seg(slashOff, 0.8, 1);
  ctx.fillStyle = C.red; ctx.fillRect(-170, -18, 340, 36); ctx.restore();
  ctx.restore();
}
function moneyStack(ctx, n, s = 1) { // stack of paper bills, base at 0
  ctx.save(); ctx.scale(s, s); for (let i = 0; i < n; i++) { ctx.save(); ctx.translate(Math.sin(i * 1.7) * 6, -i * 22); ctx.scale(1.1, 0.5); CL.cutout(ctx, () => rr(ctx, -150, -72, 300, 144, 10), '#CFE9D4', { elev: 0.6, tex: 0.3, lw: 4 }); ctx.restore(); }
  ctx.restore();
}
function packageBox(ctx, s = 1) { ctx.save(); ctx.scale(s, s); CL.cutout(ctx, () => rr(ctx, -80, -120, 160, 120, 6), '#C9A06A', { elev: 1, tex: 0.5 }); ctx.fillStyle = 'rgba(120,80,40,0.55)'; ctx.fillRect(-12, -120, 24, 120); rr(ctx, 20, -98, 46, 30, 3); ctx.fillStyle = '#FFFDF8'; ctx.fill(); ctx.restore(); }
function stoop(ctx, t) { // brownstone entrance (side-ish front view), ground y = 0, door centred at x = 0
  CL.cutout(ctx, () => { ctx.beginPath(); ctx.rect(-900, -1700, 1800, 1700); }, '#8B5A3C', { elev: 0.4, tex: 0.6 });
  for (const wx of [-620, 420]) { rr(ctx, wx, -1380, 200, 320, 6); fillStroke(ctx, '#3E4C60', 4); rr(ctx, wx - 16, -1060, 232, 18, 3); fillStroke(ctx, '#6E4630', 3); }
  rr(ctx, -170, -1000, 340, 40, 6); fillStroke(ctx, '#6E4630', 4);
  rr(ctx, -130, -960, 260, 560, [120, 120, 4, 4]); fillStroke(ctx, '#2E4A3A', 5); rr(ctx, -100, -920, 90, 230, 8); fillStroke(ctx, '#264034', 3); rr(ctx, 10, -920, 90, 230, 8); fillStroke(ctx, '#264034', 3);
  ell(ctx, 80, -660, 12, 12); fillStroke(ctx, C.yellow, 3); rr(ctx, 150, -760, 40, 60, 6); fillStroke(ctx, '#D9DCE0', 3); ell(ctx, 170, -730, 10, 10); ctx.fillStyle = '#FFC857'; ctx.fill();
  for (let i = 0; i < 4; i++) { rr(ctx, -260 - i * 30, -400 + i * 100, 520 + i * 60, 100, 4); fillStroke(ctx, shade('#9C6B4C', -i * 0.05), 4); }
  ctx.fillStyle = SIDEW; ctx.fillRect(-1200, 0, 2400, 300); ctx.fillStyle = CURB; ctx.fillRect(-1200, 0, 2400, 12);
  R.tube(ctx, [[-300, -400], [-300, -560], [-110, -900]], 10, '#1E1E22', 3); R.tube(ctx, [[300, -400], [300, -560], [110, -900]], 10, '#1E1E22', 3);
}

module.exports = { W, H, layer, txt, fitTxt, h2, MIKE, CAP, capFront, capSide, mikeBust, mikeFigure, mikeHeadSide, makePath, tire, blinkOn,
  BROWN, BROWNL, BROWND, GLASS, AMBER, ASPH, SIDEW, CARCOL, truckSide, truckFront, truckRear, truckTop, carTop, carFront, carRear, carSide, pedTop,
  B, RH, SW, LANE, cityTop, tree, signalPhase, SB, SRH, suburbTop, CELL, FLOOR, SHOP, facade, streetSide, streetLamp, sideTree, signalSide, skyline, persp,
  cluster, device, clapper, fuelJar, scissors, noLeftSign, moneyStack, packageBox, stoop, glowAt };
