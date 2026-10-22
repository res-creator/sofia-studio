// Episode 11 "The $440 Scratch" sets, props and cast (on hirkit): Patrick and the review agent, the rental car (side + front),
// the alloy wheel, the inspection arch (front + side) and its camera pods, the airport (outside, return garage, terminal hall,
// gate lounge), the phone and its app screens, the receipt strip, the discount coupon, the chat bot, the day path and the review desk.
// Generic places, no logos: brand names appear as plain text only.
const K = require('../tests/mcd_collage/kit');
const R = require('../hirkit/rig');
const LT = require('../hirkit/light');
const CL = require('../hirkit/collage');
const { C, F, clamp, lerp, seg, E, rr } = K;
const { INK, shade, fillStroke, ell, px } = R;

const W = 1080, H = 1920;
// 2.5D layer around the camera (world origin = scene centre); d = depth factor (1 = hero plane)
function layer(ctx, c, d, fn) { ctx.save(); ctx.translate(W / 2 + (c.shx || 0) * d, H / 2 + (c.shy || 0) * d); ctx.rotate((c.r || 0) * d); const z = Math.pow(c.z, d); ctx.scale(z, z); ctx.translate(-c.x * d, -c.y * d); fn(ctx); ctx.restore(); }
const txt = (ctx, s, x, y, size, col, align = 'center', font = F.black) => { ctx.font = `${size}px ${font}`; ctx.textAlign = align; ctx.fillStyle = col; ctx.fillText(s, x, y); };
function fitTxt(ctx, s, x, y, size, col, maxW, align = 'center') { ctx.font = `${size}px ${F.black}`; const w = ctx.measureText(s).width; if (w > maxW) size *= maxW / w; txt(ctx, s, x, y, size, col, align); return size; }
const BLUE = '#4D8DFF', CAR = '#9DB0C4', CARD = '#6F8499', GLASS = '#2C3A4E', TIRE = '#262629', CONC = '#C9C2B4', CONCD = '#A89F8F';

// ---------- cast ----------
const PAT = { skin: '#E8B48F', hair: '#4A3222', hairStyle: 'short', top: BLUE, cuff: '#3A72D9', shirt: '#FFFDF8', zip: 1, pants: '#2E3A59', shoes: '#F7F5F0', sole: '#C9C1B1', iris: '#4E6B3C', brow: '#3A2416' };
const AGENT = { skin: '#8D5A3C', hair: '#1E1612', hairStyle: 'bun', top: '#2FA37E', collar: '#FFFDF8', pants: '#2E3A59', shoes: '#3A2A22', iris: '#3A2414', lashes: 1, lips: '#7A3434' };

// ---------- the wheel (alloy, 5 spokes) ----------
// r = tyre radius; rot = rim rotation; o.scuff (0..1 visibility), o.flat (no texture), o.scan (0..1 red box lock)
function wheel(ctx, r, rot = 0, o = {}) {
  ell(ctx, 0, 0, r, r); fillStroke(ctx, TIRE, 5);
  ctx.strokeStyle = '#3A3A3E'; ctx.lineWidth = r * 0.03; for (let i = 0; i < 28; i++) { const a = rot + i / 28 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 0.9, Math.sin(a) * r * 0.9); ctx.lineTo(Math.cos(a) * r * 0.98, Math.sin(a) * r * 0.98); ctx.stroke(); }
  const rr0 = r * 0.7;
  ell(ctx, 0, 0, rr0, rr0); fillStroke(ctx, '#D9DEE4', 4.5); // rim lip
  ell(ctx, 0, 0, rr0 * 0.9, rr0 * 0.9); ctx.fillStyle = '#4A4F57'; ctx.fill(); // dark barrel
  ctx.save(); ctx.rotate(rot);
  for (let i = 0; i < 5; i++) { ctx.save(); ctx.rotate(i / 5 * Math.PI * 2); ctx.beginPath(); ctx.moveTo(-rr0 * 0.1, -rr0 * 0.2); ctx.lineTo(-rr0 * 0.2, -rr0 * 0.9); ctx.quadraticCurveTo(0, -rr0 * 0.96, rr0 * 0.2, -rr0 * 0.9); ctx.lineTo(rr0 * 0.1, -rr0 * 0.2); ctx.closePath(); fillStroke(ctx, '#C4CBD3', 3.5);
    ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.moveTo(-rr0 * 0.06, -rr0 * 0.25); ctx.lineTo(-rr0 * 0.13, -rr0 * 0.85); ctx.lineTo(-rr0 * 0.04, -rr0 * 0.86); ctx.lineTo(0, -rr0 * 0.25); ctx.closePath(); ctx.fill(); ctx.restore(); }
  ctx.restore();
  ell(ctx, 0, 0, rr0 * 0.24, rr0 * 0.24); fillStroke(ctx, '#B8C0C9', 3.5);
  for (let i = 0; i < 5; i++) { const a = rot + (i + 0.5) / 5 * Math.PI * 2; ell(ctx, Math.cos(a) * rr0 * 0.14, Math.sin(a) * rr0 * 0.14, rr0 * 0.03, rr0 * 0.03); ctx.fillStyle = '#5A6068'; ctx.fill(); }
  ell(ctx, 0, 0, rr0 * 0.08, rr0 * 0.08); ctx.fillStyle = '#7C848E'; ctx.fill();
  // light sweep on the lip
  ctx.save(); ell(ctx, 0, 0, rr0, rr0); ell(ctx, 0, 0, rr0 * 0.9, rr0 * 0.9); ctx.clip('evenodd'); ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = rr0 * 0.05; ctx.beginPath(); ctx.arc(0, 0, rr0 * 0.95, -2.6, -1.6); ctx.stroke(); ctx.restore();
  if (o.scuff > 0) scuffMark(ctx, rr0, o.scuff);
}
// the 1-inch scuff on the rim lip (fixed at the lower-right of the lip, it does not turn with the spokes)
const SCUFF = [0.62, 0.42]; // in rim radii
function scuffMark(ctx, rr0, a = 1) {
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(SCUFF[0] * rr0, SCUFF[1] * rr0); ctx.rotate(-0.95);
  ctx.lineCap = 'round'; ctx.fillStyle = 'rgba(120,112,100,0.55)'; ell(ctx, 0, 0, rr0 * 0.1, rr0 * 0.035); ctx.fill();
  for (let i = 0; i < 5; i++) { ctx.strokeStyle = i % 2 ? '#6E737A' : '#F4F6F8'; ctx.lineWidth = rr0 * (0.012 + 0.006 * (i % 2)); ctx.beginPath(); ctx.moveTo(-rr0 * 0.08, -rr0 * 0.012 + i * rr0 * 0.007); ctx.lineTo(rr0 * 0.08 - i * rr0 * 0.01, -rr0 * 0.02 + i * rr0 * 0.009); ctx.stroke(); }
  ctx.restore();
}
// the scanner's red detection box + label around the scuff (rim-space)
function detectBox(ctx, rr0, u, label = '≈ 1 INCH', ls = 1, bs = 1) {
  if (u <= 0) return; const x = SCUFF[0] * rr0, y = SCUFF[1] * rr0, s = lerp(2.6, 1, E.out(clamp(u * 1.4))), b = rr0 * 0.16 * s * bs, lb = b * ls;
  ctx.save(); ctx.translate(x, y); ctx.strokeStyle = C.red; ctx.lineWidth = Math.max(px(ctx, 6), 3); ctx.lineCap = 'square';
  for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { ctx.beginPath(); ctx.moveTo(sx * b, sy * b * 0.6); ctx.lineTo(sx * b, sy * b); ctx.lineTo(sx * b * 0.6, sy * b); ctx.stroke(); }
  if (u > 0.6) { const a = seg(u, 0.6, 1); ctx.globalAlpha *= a; ctx.lineWidth = Math.max(px(ctx, 4), 2); ctx.beginPath(); ctx.moveTo(b, -b); ctx.lineTo(b * 2.2, -b * 2.4); ctx.lineTo(b * 4.6, -b * 2.4); ctx.stroke();
    ctx.font = `${lb * 0.9}px ${F.black}`; const w = ctx.measureText(label).width + lb * 0.6; ctx.fillStyle = C.red; rr(ctx, b * 4.6, -b * 2.4 - lb * 0.65, w, lb * 1.3, lb * 0.25); ctx.fill(); txt(ctx, label, b * 4.6 + w / 2, -b * 2.4 + lb * 0.33, lb * 0.9, '#FFFDF8'); }
  ctx.restore();
}

// ---------- the car, side view (faces +x, wheels on y = 0, ~980 long) ----------
// o: { rot (wheel rotation), driver: fn(ctx) drawn inside the front window, scuff, scanT (0..1 mesh lines), tag }
function carSide(ctx, o = {}) {
  const r = 92;
  // body
  const body = () => { ctx.beginPath(); ctx.moveTo(-470, -70); ctx.lineTo(-480, -190); ctx.quadraticCurveTo(-478, -250, -440, -262); ctx.lineTo(-360, -282);
    ctx.quadraticCurveTo(-300, -420, -190, -430); ctx.lineTo(120, -430); ctx.quadraticCurveTo(190, -428, 250, -330); ctx.lineTo(300, -282); ctx.quadraticCurveTo(450, -262, 480, -220);
    ctx.quadraticCurveTo(500, -180, 498, -120); ctx.lineTo(490, -70); ctx.closePath(); };
  K.contact(ctx, 0, 0, 560, 34, 0.45);
  body(); fillStroke(ctx, CAR, 5);
  ctx.save(); body(); ctx.clip();
  let g = ctx.createLinearGradient(0, -430, 0, -60); g.addColorStop(0, 'rgba(255,255,255,0.35)'); g.addColorStop(0.45, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(20,30,50,0.25)'); ctx.fillStyle = g; ctx.fillRect(-520, -440, 1040, 400);
  ctx.fillStyle = CARD; ctx.fillRect(-520, -132, 1040, 16); // rocker line
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-440, -238); ctx.lineTo(470, -228); ctx.stroke(); // shoulder highlight
  ctx.restore();
  // windows
  const winF = () => { ctx.beginPath(); ctx.moveTo(-20, -290); ctx.lineTo(-20, -410); ctx.lineTo(115, -410); ctx.quadraticCurveTo(170, -408, 222, -318); ctx.lineTo(236, -290); ctx.closePath(); };
  const winR = () => { ctx.beginPath(); ctx.moveTo(-50, -290); ctx.lineTo(-50, -410); ctx.lineTo(-185, -410); ctx.quadraticCurveTo(-270, -400, -320, -290); ctx.closePath(); };
  for (const w of [winR, winF]) { w(); fillStroke(ctx, GLASS, 4.5); }
  if (o.driver) { ctx.save(); winF(); ctx.clip(); o.driver(ctx); ctx.restore(); }
  for (const w of [winR, winF]) { ctx.save(); w(); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.moveTo(-300, -420); ctx.lineTo(-200, -420); ctx.lineTo(-330, -280); ctx.lineTo(-430, -280); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(60, -420); ctx.lineTo(110, -420); ctx.lineTo(-10, -280); ctx.lineTo(-60, -280); ctx.closePath(); ctx.fill(); ctx.restore(); w(); ctx.lineWidth = px(ctx, 4.5); ctx.strokeStyle = INK; ctx.stroke(); }
  ctx.fillStyle = INK; ctx.fillRect(-42, -412, 16, 124); // B pillar
  // doors, handles, mirror, lights
  ctx.strokeStyle = shade(CAR, -0.35); ctx.lineWidth = px(ctx, 3.5); ctx.beginPath(); ctx.moveTo(-34, -286); ctx.lineTo(-34, -96); ctx.moveTo(246, -286); ctx.quadraticCurveTo(262, -190, 236, -96); ctx.moveTo(-330, -282); ctx.lineTo(-300, -100); ctx.stroke();
  for (const x of [40, -250]) { rr(ctx, x, -262, 60, 14, 7); fillStroke(ctx, shade(CAR, -0.25), 3); }
  ctx.beginPath(); ctx.moveTo(230, -300); ctx.lineTo(282, -312); ctx.lineTo(292, -278); ctx.lineTo(240, -270); ctx.closePath(); fillStroke(ctx, CARD, 4);
  rr(ctx, 440, -232, 52, 34, 12); fillStroke(ctx, '#FFF6D6', 4); rr(ctx, -486, -230, 30, 46, 8); fillStroke(ctx, C.red, 4);
  ctx.fillStyle = '#3A3F48'; rr(ctx, 380, -104, 118, 30, 10); ctx.fill(); rr(ctx, -486, -104, 100, 30, 10); ctx.fill(); // bumpers
  // wheel arches + wheels
  for (const x of [-300, 300]) { ctx.beginPath(); ctx.arc(x, -r + 6, r * 1.22, Math.PI, 0); ctx.closePath(); ctx.fillStyle = '#1D1F24'; ctx.fill();
    ctx.save(); ctx.translate(x, -r); wheel(ctx, r, (o.rot || 0), { scuff: x < 0 ? (o.scuff ?? 0) : 0 }); ctx.restore(); }
  if (o.tag) { ctx.save(); ctx.translate(60, -170); ctx.font = `34px ${F.black}`; const w = ctx.measureText(o.tag).width + 30; CL.cutout(ctx, () => rr(ctx, -w / 2, -26, w, 50, 8), '#FFFDF8', { elev: 0.6, tex: 0.3 }); txt(ctx, o.tag, 0, 12, 34, INK); ctx.restore(); }
  if (o.scanT > 0) scanMesh(ctx, body, o.scanT);
}
// AI mesh lines over a shape (scanning): a bright band sweeps along x, leaving a fading wire grid
function scanMesh(ctx, build, u, x0 = -520, x1 = 520) {
  const xs = lerp(x0, x1, u);
  ctx.save(); build(); ctx.clip();
  ctx.strokeStyle = 'rgba(120,220,255,0.55)'; ctx.lineWidth = px(ctx, 2.2);
  for (let x = x0; x < xs; x += 46) { ctx.globalAlpha = clamp(1 - (xs - x) / 700) * 0.9; ctx.beginPath(); ctx.moveTo(x, -460); ctx.lineTo(x, 0); ctx.stroke(); }
  ctx.globalAlpha = 0.5; for (let y = -440; y < 0; y += 46) { ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(xs, y); ctx.stroke(); }
  ctx.globalAlpha = 1; const g = ctx.createLinearGradient(xs - 80, 0, xs + 10, 0); g.addColorStop(0, 'rgba(150,230,255,0)'); g.addColorStop(1, 'rgba(230,250,255,0.95)'); ctx.fillStyle = g; ctx.fillRect(xs - 80, -470, 90, 480);
  ctx.restore();
}

// ---------- the car, front view (centred, wheels on y = 0, ~900 wide) ----------
function carFront(ctx, o = {}) {
  K.contact(ctx, 0, 0, 520, 40, 0.5);
  for (const x of [-330, 330]) { rr(ctx, x - 62, -190, 124, 190, 26); fillStroke(ctx, TIRE, 5); }
  const body = () => { ctx.beginPath(); ctx.moveTo(-440, -80); ctx.lineTo(-450, -250); ctx.quadraticCurveTo(-440, -300, -380, -320); ctx.lineTo(-300, -350); ctx.quadraticCurveTo(-250, -520, -170, -540);
    ctx.lineTo(170, -540); ctx.quadraticCurveTo(250, -520, 300, -350); ctx.lineTo(380, -320); ctx.quadraticCurveTo(440, -300, 450, -250); ctx.lineTo(440, -80); ctx.closePath(); };
  body(); fillStroke(ctx, CAR, 5);
  ctx.save(); body(); ctx.clip(); const g = ctx.createLinearGradient(0, -540, 0, -80); g.addColorStop(0, 'rgba(255,255,255,0.3)'); g.addColorStop(1, 'rgba(20,30,50,0.25)'); ctx.fillStyle = g; ctx.fillRect(-460, -560, 920, 500); ctx.restore();
  ctx.beginPath(); ctx.moveTo(-270, -360); ctx.quadraticCurveTo(-230, -505, -160, -515); ctx.lineTo(160, -515); ctx.quadraticCurveTo(230, -505, 270, -360); ctx.closePath(); fillStroke(ctx, GLASS, 4.5);
  if (o.driver) { ctx.save(); ctx.beginPath(); ctx.moveTo(-270, -360); ctx.quadraticCurveTo(-230, -505, -160, -515); ctx.lineTo(160, -515); ctx.quadraticCurveTo(230, -505, 270, -360); ctx.closePath(); ctx.clip(); o.driver(ctx); ctx.restore(); }
  ctx.fillStyle = 'rgba(255,255,255,0.16)'; ctx.beginPath(); ctx.moveTo(-120, -512); ctx.lineTo(-40, -512); ctx.lineTo(-170, -365); ctx.lineTo(-250, -365); ctx.closePath(); ctx.fill();
  for (const sx of [-1, 1]) { ctx.save(); ctx.scale(sx, 1); ctx.beginPath(); ctx.moveTo(240, -300); ctx.lineTo(400, -290); ctx.lineTo(410, -240); ctx.lineTo(250, -250); ctx.closePath(); fillStroke(ctx, '#FFF6D6', 4);
    if (o.lights) LT.glow(ctx, 330, -270, 160, 'rgba(255,240,200,1)', 0.5 * o.lights); ctx.beginPath(); ctx.moveTo(300, -360); ctx.lineTo(370, -380); ctx.lineTo(380, -340); ctx.lineTo(310, -335); ctx.closePath(); fillStroke(ctx, CARD, 4); ctx.restore(); }
  rr(ctx, -170, -270, 340, 70, 16); fillStroke(ctx, '#2A2E36', 4); ctx.strokeStyle = '#4A505A'; ctx.lineWidth = 4; for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-160, -270 + i * 17); ctx.lineTo(160, -270 + i * 17); ctx.stroke(); }
  rr(ctx, -110, -180, 220, 60, 8); fillStroke(ctx, '#FFFDF8', 4); txt(ctx, 'RENTAL', 0, -136, 40, INK);
  rr(ctx, -440, -110, 880, 40, 14); fillStroke(ctx, '#3A3F48', 4);
}

// ---------- the inspection arch ----------
// front view: portal centred at x = 0, floor y = 0, inner width 1260, height 1200. o: { on (0..1 light), pods [angles], flash (0..1), scanY (0..1 light bar sweep), sign }
const ARCH = { w: 1260, h: 1200, p: 150 };
function archFront(ctx, o = {}) {
  const { w, h, p } = ARCH, on = o.on ?? 1, x0 = -w / 2 - p, x1 = w / 2;
  // floor scanner plate
  ctx.save(); ctx.transform(1, 0, 0, 0.25, 0, 0); rr(ctx, -w / 2 + 40, -80, w - 80, 160, 30); fillStroke(ctx, '#2C2F36', 5); ctx.restore();
  ctx.fillStyle = `rgba(150,230,255,${0.35 + 0.6 * on})`; ctx.fillRect(-w / 2 + 80, -6, w - 160, 8);
  // pillars
  for (const sx of [-1, 1]) { const x = sx < 0 ? x0 : x1;
    CL.cutout(ctx, () => rr(ctx, x, -h, p, h, 18), '#E9E7E2', { elev: 1.2, tex: 0.4 });
    ctx.fillStyle = shade('#E9E7E2', -0.18); ctx.fillRect(sx < 0 ? x + p - 26 : x, -h + 18, 26, h - 18);
    rr(ctx, x + 40, -h + 120, p - 80, h - 300, 16); fillStroke(ctx, '#20232A', 4); // light bar housing
    ctx.save(); rr(ctx, x + 50, -h + 130, p - 100, h - 320, 12); ctx.clip(); const g = ctx.createLinearGradient(0, -h, 0, 0); g.addColorStop(0, `rgba(235,250,255,${0.25 + 0.75 * on})`); g.addColorStop(1, `rgba(150,220,255,${0.2 + 0.7 * on})`);
    ctx.fillStyle = g; ctx.fillRect(x, -h, p, h);
    if (o.scanY != null) { const yy = lerp(-h + 130, -200, o.scanY); ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.fillRect(x, yy - 14, p, 28); } ctx.restore();
    if (on > 0.3) LT.glow(ctx, x + p / 2, -h / 2, 340, 'rgba(170,225,255,1)', 0.25 * on);
    // hazard base
    ctx.save(); rr(ctx, x - 10, -150, p + 20, 150, 10); ctx.clip(); ctx.fillStyle = C.yellow; ctx.fillRect(x - 20, -160, p + 40, 170); ctx.fillStyle = INK; for (let i = -4; i < 8; i++) { ctx.beginPath(); ctx.moveTo(x + i * 50, 0); ctx.lineTo(x + i * 50 + 25, 0); ctx.lineTo(x + i * 50 + 85, -150); ctx.lineTo(x + i * 50 + 60, -150); ctx.closePath(); ctx.fill(); } ctx.restore();
    rr(ctx, x - 10, -150, p + 20, 150, 10); ctx.lineWidth = px(ctx, 5); ctx.strokeStyle = INK; ctx.stroke(); }
  // top beam with sign + camera pods
  CL.cutout(ctx, () => rr(ctx, x0 - 30, -h - 190, w + 2 * p + 60, 200, 22), '#E9E7E2', { elev: 1.4, tex: 0.4 });
  rr(ctx, -330, -h - 160, 660, 92, 14); fillStroke(ctx, '#20232A', 4); fitTxt(ctx, o.sign || 'VEHICLE INSPECTION · 5 MPH', 0, -h - 100, 44, `rgba(190,240,255,${0.55 + 0.45 * on})`, 600);
  const pods = o.pods || [0, 0, 0, 0];
  [-520, -400, 400, 520].forEach((x, i) => { ctx.save(); ctx.translate(x, -h + 30); ctx.rotate(pods[i] || 0); cameraPod(ctx, 0.9, { flash: o.flash || 0, on }); ctx.restore(); });
  [-1, 1].forEach(sx => { [-0.75, -0.45].forEach((fy, j) => { ctx.save(); ctx.translate(sx < 0 ? x0 + p + 6 : x1 - 6, h * fy); ctx.scale(-sx, 1); ctx.rotate(0.15 * (pods[j] || 0)); cameraPod(ctx, 0.7, { flash: o.flash || 0, on, side: 1 }); ctx.restore(); }); });
}
// small camera pod (housing pointing down by default; side: pointing sideways)
function cameraPod(ctx, s = 1, o = {}) {
  ctx.save(); ctx.scale(s, s); if (o.side) ctx.rotate(-Math.PI / 2);
  rr(ctx, -46, -30, 92, 90, 16); fillStroke(ctx, '#3A3F48', 4.5);
  ell(ctx, 0, 60, 34, 22); fillStroke(ctx, '#1B1D24', 4); ell(ctx, 0, 62, 18, 12); ctx.fillStyle = '#4C6FA8'; ctx.fill(); ell(ctx, 6, 58, 6, 4); ctx.fillStyle = '#FFFFFF'; ctx.fill();
  ell(ctx, 30, -10, 7, 7); ctx.fillStyle = (o.on ?? 1) > 0.5 ? '#7CF2A0' : '#3A5A44'; ctx.fill();
  if (o.flash > 0) LT.glow(ctx, 0, 70, 120, 'rgba(255,255,255,1)', o.flash);
  ctx.restore();
}
// big lens close-up (the camera that "never blinked"); o: { iris 0..1 open, look [x,y] reflection shift, led }
function lensClose(ctx, r, o = {}) {
  CL.cutout(ctx, () => rr(ctx, -r * 1.45, -r * 1.45, r * 2.9, r * 2.9, r * 0.4), '#3A3F48', { elev: 2, tex: 0.25 });
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; rr(ctx, -r * 1.35, -r * 1.35, r * 2.7, r * 0.5, r * 0.3); ctx.fill();
  ell(ctx, 0, 0, r * 1.1, r * 1.1); fillStroke(ctx, '#20232A', 5);
  ell(ctx, 0, 0, r * 0.98, r * 0.98); fillStroke(ctx, '#2A3446', 4);
  ctx.strokeStyle = '#4A5568'; ctx.lineWidth = r * 0.02; for (let i = 1; i < 4; i++) { ell(ctx, 0, 0, r * (0.98 - i * 0.12), r * (0.98 - i * 0.12)); ctx.stroke(); }
  const io = o.iris ?? 1, ir = r * lerp(0.18, 0.5, io);
  // aperture blades
  ctx.save(); ell(ctx, 0, 0, r * 0.62, r * 0.62); ctx.clip(); ctx.fillStyle = '#151820'; ctx.fillRect(-r, -r, 2 * r, 2 * r);
  ctx.strokeStyle = '#2E3644'; ctx.lineWidth = r * 0.015; for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2 + io; ctx.beginPath(); ctx.moveTo(Math.cos(a) * ir, Math.sin(a) * ir); ctx.lineTo(Math.cos(a + 1.2) * r * 0.7, Math.sin(a + 1.2) * r * 0.7); ctx.stroke(); }
  const g = ctx.createRadialGradient(-r * 0.1, -r * 0.1, 0, 0, 0, ir); g.addColorStop(0, '#5A86C8'); g.addColorStop(0.6, '#24406E'); g.addColorStop(1, '#0E1626'); ell(ctx, 0, 0, ir, ir); ctx.fillStyle = g; ctx.fill();
  // reflection: a tiny car shape and window light
  const lk = o.look || [0, 0]; ctx.save(); ctx.translate(lk[0] * r * 0.1, lk[1] * r * 0.1); ctx.fillStyle = 'rgba(255,255,255,0.75)'; ell(ctx, -r * 0.18, -r * 0.2, r * 0.1, r * 0.07, -0.5); ctx.fill();
  ctx.fillStyle = 'rgba(200,225,255,0.35)'; ctx.beginPath(); ctx.moveTo(-r * 0.22, r * 0.18); ctx.lineTo(r * 0.24, r * 0.18); ctx.lineTo(r * 0.16, r * 0.08); ctx.lineTo(-r * 0.12, r * 0.08); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = r * 0.04; ctx.beginPath(); ctx.arc(0, 0, r * 0.88, -2.5, -1.7); ctx.stroke();
  // status LED ring segment
  const led = o.led ?? 1; ell(ctx, r * 1.1, -r * 1.1, r * 0.09, r * 0.09); ctx.fillStyle = led > 0.5 ? '#7CF2A0' : '#355A42'; ctx.fill(); if (led > 0.5) LT.glow(ctx, r * 1.1, -r * 1.1, r * 0.4, 'rgba(124,242,160,1)', 0.5);
}
// side view of the arch around a passing car (back pillar drawn first, front pillar after the car): part 'back' | 'front'
function archSide(ctx, part, o = {}) {
  const h = 1200, on = o.on ?? 1;
  if (part === 'back') {
    ctx.fillStyle = '#2C2F36'; ctx.fillRect(-300, -14, 600, 14); // floor plate
    CL.cutout(ctx, () => rr(ctx, -110, -h, 220, h, 16), shade('#E9E7E2', -0.12), { elev: 0.8, tex: 0.3 });
    CL.cutout(ctx, () => rr(ctx, -300, -h - 150, 600, 160, 18), '#E9E7E2', { elev: 1, tex: 0.3 });
    // light curtain between the pillars (a sheet of light the car passes through)
    if (on > 0) { const g = ctx.createLinearGradient(-60, 0, 60, 0); g.addColorStop(0, 'rgba(170,230,255,0)'); g.addColorStop(0.5, `rgba(220,248,255,${0.5 * on})`); g.addColorStop(1, 'rgba(170,230,255,0)'); ctx.fillStyle = g; ctx.fillRect(-60, -h, 120, h); }
    [-180, 180].forEach(x => { ctx.save(); ctx.translate(x, -h + 10); cameraPod(ctx, 0.9, { on, flash: o.flash || 0 }); ctx.restore(); });
  } else {
    CL.cutout(ctx, () => rr(ctx, -95, -h + 40, 190, h - 40, 16), '#E9E7E2', { elev: 1.6, tex: 0.4 });
    rr(ctx, -45, -h + 160, 90, h - 380, 14); fillStroke(ctx, '#20232A', 4);
    ctx.save(); rr(ctx, -36, -h + 170, 72, h - 400, 10); ctx.clip(); ctx.fillStyle = `rgba(215,245,255,${0.3 + 0.7 * on})`; ctx.fillRect(-60, -h, 120, h);
    if (o.scanY != null) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-60, lerp(-h + 170, -230, o.scanY) - 12, 120, 24); } ctx.restore();
    ctx.save(); rr(ctx, -105, -150, 210, 150, 10); ctx.clip(); ctx.fillStyle = C.yellow; ctx.fillRect(-120, -160, 240, 170); ctx.fillStyle = INK; for (let i = -4; i < 6; i++) { ctx.beginPath(); ctx.moveTo(i * 50, 0); ctx.lineTo(i * 50 + 25, 0); ctx.lineTo(i * 50 + 85, -150); ctx.lineTo(i * 50 + 60, -150); ctx.closePath(); ctx.fill(); } ctx.restore();
    rr(ctx, -105, -150, 210, 150, 10); ctx.lineWidth = px(ctx, 5); ctx.strokeStyle = INK; ctx.stroke();
    if (on > 0.3) LT.glow(ctx, 0, -h / 2, 320, 'rgba(170,225,255,1)', 0.22 * on);
  }
}

// ---------- airport, outside (golden morning) ----------
function sky(ctx, top, bot, x0 = -4000, x1 = 4000, y0 = -4000, y1 = 400) { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, top); g.addColorStop(1, bot); ctx.fillStyle = g; ctx.fillRect(x0, y0, x1 - x0, y1 - y0); }
function plane(ctx, s = 1, o = {}) { // side view airliner, nose to +x
  ctx.save(); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-300, -40); ctx.lineTo(-360, -150); ctx.lineTo(-310, -150); ctx.lineTo(-220, -50); ctx.closePath(); fillStroke(ctx, o.tail || BLUE, 4);
  ctx.beginPath(); ctx.moveTo(-330, -10); ctx.quadraticCurveTo(-340, -50, -280, -52); ctx.lineTo(260, -52); ctx.quadraticCurveTo(340, -48, 360, -10); ctx.quadraticCurveTo(340, 26, 250, 30); ctx.lineTo(-260, 30); ctx.quadraticCurveTo(-320, 26, -330, -10); ctx.closePath(); fillStroke(ctx, '#F4F2EC', 4);
  ctx.fillStyle = '#5A6B85'; for (let i = 0; i < 14; i++) { ell(ctx, -200 + i * 32, -18, 7, 9); ctx.fill(); }
  ctx.beginPath(); ctx.moveTo(290, -36); ctx.lineTo(330, -36); ctx.lineTo(345, -14); ctx.lineTo(296, -14); ctx.closePath(); ctx.fillStyle = GLASS; ctx.fill();
  ctx.beginPath(); ctx.moveTo(-40, 6); ctx.lineTo(-130, 70); ctx.lineTo(-90, 74); ctx.lineTo(60, 14); ctx.closePath(); fillStroke(ctx, '#D9D6CE', 4);
  rr(ctx, -70, 22, 90, 34, 16); fillStroke(ctx, '#B9B6AE', 4);
  ctx.restore();
}
function terminalExt(ctx, t, o = {}) {
  sky(ctx, '#8FB9E8', '#FFD9A0', -3000, 3000, -2600, 0);
  LT.glow(ctx, 700, -1400, 700, 'rgba(255,220,150,1)', 0.5); ell(ctx, 700, -1400, 90, 90); ctx.fillStyle = '#FFF1C8'; ctx.fill();
  // clouds
  for (let i = 0; i < 5; i++) { const x = -1600 + i * 800 + Math.sin(t * 0.2 + i) * 20, y = -1900 + K.hash(i) * 500; ctx.fillStyle = 'rgba(255,250,240,0.85)'; for (const [dx, dy, r] of [[0, 0, 90], [80, 20, 70], [-80, 25, 60], [140, 40, 50]]) { ell(ctx, x + dx, y + dy, r * 1.6, r); ctx.fill(); } }
  // plane climbing
  const pu = ((t * 0.08 + (o.planePhase || 0)) % 1); ctx.save(); ctx.translate(lerp(-1500, 1600, pu), lerp(-1100, -2100, pu)); ctx.rotate(-0.28); plane(ctx, 0.9); ctx.restore();
  // control tower
  ctx.save(); ctx.translate(-760, -620);
  CL.cutout(ctx, () => { ctx.beginPath(); ctx.moveTo(-60, 0); ctx.lineTo(-40, -760); ctx.lineTo(40, -760); ctx.lineTo(60, 0); ctx.closePath(); }, '#E3DDD0', { elev: 0.6, tex: 0.3 });
  CL.cutout(ctx, () => { ctx.beginPath(); ctx.moveTo(-150, -760); ctx.lineTo(150, -760); ctx.lineTo(120, -900); ctx.lineTo(-120, -900); ctx.closePath(); }, '#2E3A59', { elev: 0.6, tex: 0.2 });
  ctx.fillStyle = 'rgba(140,200,255,0.8)'; ctx.fillRect(-110, -880, 220, 60); rr(ctx, -130, -960, 260, 60, 10); fillStroke(ctx, '#E3DDD0', 4);
  ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, -960); ctx.lineTo(0, -1040); ctx.stroke(); ell(ctx, 0, -1044, 10, 10); ctx.fillStyle = C.red; ctx.fill();
  ctx.restore();
  // terminal building: long curved roof, glass facade
  CL.cutout(ctx, () => { ctx.beginPath(); ctx.moveTo(-1700, 0); ctx.lineTo(-1700, -560); ctx.quadraticCurveTo(0, -860, 1700, -560); ctx.lineTo(1700, 0); ctx.closePath(); }, '#EDEAE3', { elev: 1, tex: 0.35 });
  ctx.save(); ctx.beginPath(); ctx.moveTo(-1600, -60); ctx.lineTo(-1600, -500); ctx.quadraticCurveTo(0, -760, 1600, -500); ctx.lineTo(1600, -60); ctx.closePath(); ctx.clip();
  const g = ctx.createLinearGradient(0, -760, 0, -60); g.addColorStop(0, '#9CC4EA'); g.addColorStop(0.6, '#5F8BB8'); g.addColorStop(1, '#F4C98A'); ctx.fillStyle = g; ctx.fillRect(-1700, -800, 3400, 800);
  ctx.strokeStyle = '#E9E5DC'; ctx.lineWidth = 12; for (let x = -1600; x <= 1600; x += 130) { ctx.beginPath(); ctx.moveTo(x, -900); ctx.lineTo(x, 0); ctx.stroke(); }
  ctx.lineWidth = 8; for (let y = -600; y < 0; y += 140) { ctx.beginPath(); ctx.moveTo(-1700, y); ctx.lineTo(1700, y); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,255,255,0.22)'; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-1500 + i * 560, -800); ctx.lineTo(-1380 + i * 560, -800); ctx.lineTo(-1600 + i * 560, 0); ctx.lineTo(-1720 + i * 560, 0); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 5); ctx.beginPath(); ctx.moveTo(-1700, -560); ctx.quadraticCurveTo(0, -860, 1700, -560); ctx.stroke();
  // big lettering on the roof edge (airport code only)
  txt(ctx, 'ATL', 0, -720, 120, '#2E3A59');
  // road + overhead sign
  ctx.fillStyle = '#5A5D66'; ctx.fillRect(-3000, 0, 6000, 1400); ctx.fillStyle = '#FFFDF8'; for (let x = -3000; x < 3000; x += 260) ctx.fillRect(x + ((t * 600) % 260), 330, 140, 16);
  ctx.fillStyle = '#8E8A80'; ctx.fillRect(-3000, 0, 6000, 40);
  for (const x of [-520, 520]) { ctx.fillStyle = '#6C717C'; ctx.fillRect(x - 14, -420, 28, 440); }
  CL.cutout(ctx, () => rr(ctx, -560, -560, 1120, 170, 14), '#1F6E4E', { elev: 1.2, tex: 0.25 });
  ctx.strokeStyle = '#FFFDF8'; ctx.lineWidth = 5; rr(ctx, -545, -545, 1090, 140, 10); ctx.stroke();
  txt(ctx, 'RENTAL CAR RETURN', -40, -458, 68, '#FFFDF8');
  ctx.save(); ctx.translate(440, -476); ctx.fillStyle = '#FFFDF8'; ctx.beginPath(); ctx.moveTo(-40, -16); ctx.lineTo(10, -16); ctx.lineTo(10, -38); ctx.lineTo(50, 0); ctx.lineTo(10, 38); ctx.lineTo(10, 16); ctx.lineTo(-40, 16); ctx.closePath(); ctx.fill(); ctx.restore();
  // palms / trees in front of the terminal
  for (const [x, s] of [[-1200, 1], [-900, 0.8], [1000, 0.9], [1300, 1.1]]) tree(ctx, x, 0, s);
}
function tree(ctx, x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#5A3A22'; ctx.fillRect(-16, -300, 32, 300); for (const [dx, dy, r] of [[0, -360, 120], [-90, -300, 90], [90, -300, 95], [0, -470, 90]]) { ell(ctx, dx, dy, r, r); fillStroke(ctx, '#3E9E6A', 5); } ctx.restore(); }

// ---------- rental return garage (concrete deck, lane, hanging sign) ----------
function garage(ctx, t, o = {}) {
  ctx.fillStyle = '#D9D3C6'; ctx.fillRect(-3000, -2400, 6000, 2400);
  // ceiling slab + beams + lights
  ctx.fillStyle = '#BDB6A7'; ctx.fillRect(-3000, -2400, 6000, 900);
  for (let x = -2800; x < 2800; x += 700) { ctx.fillStyle = '#AFA796'; ctx.fillRect(x, -1520, 120, 1520); ctx.fillStyle = '#C8C1B2'; ctx.fillRect(x + 120, -1520, 30, 1520);
    ctx.fillStyle = C.yellow; ctx.fillRect(x, -260, 120, 60); ctx.fillStyle = INK; ctx.fillRect(x, -200, 120, 14); }
  for (let x = -2600; x < 2800; x += 700) { rr(ctx, x, -1520, 260, 30, 8); ctx.fillStyle = '#FFFBEA'; ctx.fill(); LT.glow(ctx, x + 130, -1480, 340, 'rgba(255,250,225,1)', 0.35); }
  // back wall with return bays
  ctx.fillStyle = '#E6E0D3'; ctx.fillRect(-3000, -1500, 6000, 1500);
  for (let i = 0; i < 8; i++) { const x = -2700 + i * 700; txt(ctx, `${i + 11}`, x + 350, -900, 90, 'rgba(60,60,70,0.35)'); }
  // floor
  ctx.fillStyle = '#B4AEA2'; ctx.fillRect(-3000, 0, 6000, 1600);
  ctx.fillStyle = '#FFFDF8'; for (let x = -3000; x < 3000; x += 340) ctx.fillRect(x, 180, 200, 14);
  ctx.fillStyle = C.yellow; ctx.fillRect(-3000, 40, 6000, 10);
  if (o.sign !== false) hangSign(ctx, o.signX ?? 0, -1430, t, o.tag ?? 1);
}
function hangSign(ctx, x, y, t, tagU = 1) {
  ctx.save(); ctx.translate(x, y);
  ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-300, -80); ctx.lineTo(-300, 0); ctx.moveTo(300, -80); ctx.lineTo(300, 0); ctx.stroke();
  CL.cutout(ctx, () => rr(ctx, -440, 0, 880, 230, 18), '#FFFDF8', { elev: 1.4, tex: 0.3 });
  txt(ctx, 'THRIFTY', 0, 110, 112, INK); txt(ctx, 'RENTAL RETURN  →', 0, 186, 46, '#5A5450');
  // paper tag hanging from the sign: OWNED BY HERTZ
  if (tagU > 0) { const sw = Math.sin(t * 3.1) * 0.12 * (1 - 0.6 * seg(t, 0, 3)), drop = E.back(clamp(tagU), 1.8);
    ctx.save(); ctx.translate(300, 230); ctx.rotate(sw); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 70 * drop); ctx.stroke();
    ctx.translate(0, 70 * drop); ctx.rotate(-0.06); CL.cutout(ctx, () => { ctx.beginPath(); ctx.moveTo(-170, 20); ctx.lineTo(-140, 0); ctx.lineTo(170, 0); ctx.lineTo(170, 110); ctx.lineTo(-140, 110); ctx.lineTo(-170, 90); ctx.closePath(); }, C.yellow, { elev: 1.6 });
    ell(ctx, -128, 55, 9, 9); ctx.fillStyle = 'rgba(40,25,10,0.5)'; ctx.fill(); txt(ctx, 'OWNED BY', 20, 46, 36, INK); txt(ctx, 'HERTZ', 20, 94, 50, INK); ctx.restore(); }
  ctx.restore();
}

// ---------- terminal hall (inside): windows on the apron, departure board, ceiling ----------
function terminalIn(ctx, t, o = {}) {
  const light = o.light || 'day';
  ctx.fillStyle = '#E9E2D2'; ctx.fillRect(-3200, -2600, 6400, 2600);
  // big windows with the apron
  ctx.save(); ctx.beginPath(); ctx.rect(-3200, -1500, 6400, 1300); ctx.clip();
  sky(ctx, light === 'evening' ? '#6F7FC0' : '#9CC9F0', light === 'evening' ? '#FFB783' : '#FCE6C2', -3200, 3200, -1500, -200);
  ctx.fillStyle = '#8D97A3'; ctx.fillRect(-3200, -420, 6400, 220);
  for (const [x, s, ph] of [[-1500, 1.1, 0], [900, 1.4, 1]]) { ctx.save(); ctx.translate(x + Math.sin(t * 0.1 + ph) * 10, -470); plane(ctx, s, { tail: ph ? C.red : BLUE }); ctx.restore(); }
  ctx.restore();
  ctx.strokeStyle = '#3A3F48'; ctx.lineWidth = 22; for (let x = -3200; x <= 3200; x += 400) { ctx.beginPath(); ctx.moveTo(x, -1500); ctx.lineTo(x, -200); ctx.stroke(); }
  ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(-3200, -860); ctx.lineTo(3200, -860); ctx.stroke(); ctx.fillStyle = '#3A3F48'; ctx.fillRect(-3200, -1520, 6400, 40); ctx.fillRect(-3200, -220, 6400, 40);
  // ceiling truss
  ctx.fillStyle = '#F2EEE6'; ctx.fillRect(-3200, -2600, 6400, 1080); ctx.strokeStyle = '#C9C2B4'; ctx.lineWidth = 10;
  for (let x = -3200; x < 3200; x += 200) { ctx.beginPath(); ctx.moveTo(x, -1560); ctx.lineTo(x + 100, -1700); ctx.lineTo(x + 200, -1560); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-3200, -1700); ctx.lineTo(3200, -1700); ctx.moveTo(-3200, -1560); ctx.lineTo(3200, -1560); ctx.stroke();
  for (let x = -3000; x < 3200; x += 600) { ell(ctx, x, -1520, 60, 16); ctx.fillStyle = '#FFFBEA'; ctx.fill(); LT.glow(ctx, x, -1500, 300, 'rgba(255,250,230,1)', 0.25); }
  // departures board (hanging)
  if (o.board !== false) { const bx = o.boardX ?? 600; ctx.save(); ctx.translate(bx, -1460);
    ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-300, -100); ctx.lineTo(-300, 0); ctx.moveTo(300, -100); ctx.lineTo(300, 0); ctx.stroke();
    CL.cutout(ctx, () => rr(ctx, -420, 0, 840, 420, 16), '#1B1D24', { elev: 1.2, tex: 0 });
    txt(ctx, 'DEPARTURES', -380, 64, 44, C.yellow, 'left');
    const rows = [['08:40', 'NEW YORK', 'ON TIME'], ['09:05', 'CHICAGO', 'BOARDING'], ['09:30', 'DALLAS', 'ON TIME'], ['10:15', 'DENVER', 'ON TIME'], ['10:50', 'MIAMI', 'DELAYED']];
    rows.forEach((r, i) => { const y = 124 + i * 60; txt(ctx, r[0], -380, y, 34, '#FFFDF8', 'left'); txt(ctx, r[1], -230, y, 34, '#FFFDF8', 'left'); txt(ctx, r[2], 380, y, 30, r[2] === 'DELAYED' ? C.red : r[2] === 'BOARDING' ? '#7CF2A0' : C.yellow, 'right'); });
    ctx.restore(); }
  // floor with reflections + carpet line
  const g = ctx.createLinearGradient(0, -200, 0, 900); g.addColorStop(0, '#CFC6B4'); g.addColorStop(1, '#B8AE9B'); ctx.fillStyle = g; ctx.fillRect(-3200, -200, 6400, 2200);
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; for (let x = -3200; x < 3200; x += 400) ctx.fillRect(x - 10, -180, 22, 600);
  ctx.strokeStyle = 'rgba(90,80,70,0.22)'; ctx.lineWidth = 3; for (let y = -100; y < 900; y += 120) { ctx.beginPath(); ctx.moveTo(-3200, y); ctx.lineTo(3200, y); ctx.stroke(); }
  // far travellers (flat silhouettes walking)
  if (o.crowd !== false) for (let i = 0; i < 9; i++) { const sp = (K.hash(i) - 0.5) * 120, x = ((-2800 + i * 640 + t * sp) % 5600 + 5600) % 5600 - 2800, s = 0.42 + K.hash(i + 9) * 0.1;
    ctx.save(); ctx.translate(x, -200); ctx.scale(s, s); ctx.fillStyle = ['#8C93A8', '#A89A8C', '#9AA79B', '#B49AA0'][i % 4]; rr(ctx, -40, -460, 80, 300, 30); ctx.fill(); ell(ctx, 0, -520, 44, 48); ctx.fill();
    const ph = t * 5 + i; ctx.fillRect(-30 + Math.sin(ph) * 14, -170, 22, 170); ctx.fillRect(8 - Math.sin(ph) * 14, -170, 22, 170);
    if (i % 3 === 0) { rr(ctx, 50, -230, 90, 140, 14); ctx.fill(); } ctx.restore(); }
  if (o.gate) { ctx.save(); ctx.translate(o.gate[0], o.gate[1]); CL.cutout(ctx, () => rr(ctx, -150, -60, 300, 120, 14), '#1B1D24', { elev: 1, tex: 0 }); txt(ctx, 'GATE B12', 0, 18, 52, C.yellow); ctx.restore(); }
}
// gate lounge seats row (world, floor y = 0, centred)
function seats(ctx, x, n = 4, o = {}) {
  for (let i = 0; i < n; i++) { const sx = x + i * 190; rr(ctx, sx - 80, -230, 160, 160, 26); fillStroke(ctx, o.col || '#2E3A59', 4.5); rr(ctx, sx - 86, -96, 172, 40, 14); fillStroke(ctx, shade(o.col || '#2E3A59', 0.12), 4.5); }
  ctx.fillStyle = '#5A5D66'; ctx.fillRect(x - 90, -60, (n - 1) * 190 + 180, 16); for (let i = 0; i <= 1; i++) { ctx.fillRect(x - 40 + i * (n - 1) * 190, -50, 20, 50); }
}
function suitcase(ctx, s = 1, col = C.red) { // rolling suitcase, base at 0, handle up
  ctx.save(); ctx.scale(s, s); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 5); ctx.beginPath(); ctx.moveTo(-30, -300); ctx.lineTo(-30, -400); ctx.lineTo(30, -400); ctx.lineTo(30, -300); ctx.stroke();
  ctx.strokeStyle = '#8A8F96'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(-30, -300); ctx.lineTo(-30, -395); ctx.moveTo(30, -300); ctx.lineTo(30, -395); ctx.stroke();
  rr(ctx, -110, -300, 220, 280, 26); fillStroke(ctx, col, 5); ctx.strokeStyle = shade(col, -0.3); ctx.lineWidth = 5; for (const x of [-50, 0, 50]) { ctx.beginPath(); ctx.moveTo(x, -285); ctx.lineTo(x, -35); ctx.stroke(); }
  for (const x of [-80, 80]) { ell(ctx, x, -10, 18, 18); fillStroke(ctx, TIRE, 4); }
  ctx.restore();
}

// ---------- phone + app screens ----------
function phone(ctx, screen, s = 1, o = {}) { // portrait, centred; screen(ctx, w, h) in local coords (0,0 top-left)
  ctx.save(); ctx.scale(s, s); if (o.buzz) ctx.translate(Math.sin(o.buzz * 90) * 6 * (o.buzzA ?? 1), 0);
  CL.cutout(ctx, () => rr(ctx, -120, -240, 240, 480, 34), '#1B1D24', { elev: 1.2, tex: 0 });
  ctx.save(); rr(ctx, -106, -222, 212, 444, 22); ctx.clip(); ctx.translate(-106, -222); screen(ctx, 212, 444); ctx.restore();
  rr(ctx, -30, -232, 60, 10, 5); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();
}
const APP = '#2E3A59';
function appHeader(ctx, w, title) { ctx.fillStyle = APP; ctx.fillRect(0, 0, w, 64); fitTxt(ctx, title, w / 2, 42, 24, '#FFFDF8', w - 30); }
// notification banner on a lock screen
function appNotify(ctx, w, h, u) {
  const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#3E5C8A'); g.addColorStop(1, '#8AA6CF'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  txt(ctx, '9:41', w / 2, 120, 64, 'rgba(255,255,255,0.92)');
  const y = lerp(-110, 170, E.back(clamp(u), 1.4)); ctx.fillStyle = 'rgba(255,253,248,0.96)'; rr(ctx, 12, y, w - 24, 100, 18); ctx.fill();
  rr(ctx, 24, y + 14, 36, 36, 8); ctx.fillStyle = C.red; ctx.fill(); txt(ctx, '!', 42, y + 42, 28, '#FFFDF8');
  txt(ctx, 'DAMAGE REPORT', 70, y + 40, 19, INK, 'left'); txt(ctx, 'Your rental return', 24, y + 72, 16, '#5A5450', 'left'); txt(ctx, 'scan found damage', 24, y + 92, 16, '#5A5450', 'left');
}
// the damage photo: the rear wheel, zooming onto the scuff with the red box
function appPhoto(ctx, w, h, u, boxU) {
  appHeader(ctx, w, 'DAMAGE REPORT'); ctx.fillStyle = '#F7F5F0'; ctx.fillRect(0, 64, w, h - 64);
  txt(ctx, 'REAR WHEEL · DRIVER SIDE', w / 2, 92, 15, '#5A5450');
  ctx.save(); ctx.beginPath(); ctx.rect(0, 104, w, 300); ctx.clip(); ctx.fillStyle = '#7D8794'; ctx.fillRect(0, 104, w, 300);
  const e = E.inOut(clamp(u)), z = lerp(0.55, 1.6, e), cx = lerp(w / 2, w / 2 - 70 * 1.6, e), cy = lerp(254, 254 - 50 * 1.6, e);
  ctx.translate(cx, cy); ctx.scale(z, z); ctx.fillStyle = CAR; ctx.fillRect(-300, -300, 600, 170); ctx.beginPath(); ctx.arc(0, -10, 130, Math.PI, 0); ctx.fillStyle = '#1D1F24'; ctx.fill();
  wheel(ctx, 110, 0.3, { scuff: 1 }); detectBox(ctx, 77, boxU, '≈ 1 INCH', 1.4); ctx.restore();
  ctx.fillStyle = '#E9E2D2'; rr(ctx, 14, 418, w - 28, 16, 8); ctx.fill();
}
// chat window: the bot's bubble lines are UI, no invented dialogue (buttons only)
function appChat(ctx, w, h, o = {}) {
  appHeader(ctx, w, 'CLAIM HELP'); ctx.fillStyle = '#F7F5F0'; ctx.fillRect(0, 64, w, h - 64);
  const btn = (y, label, col, pressed) => { ctx.fillStyle = pressed ? shade(col, -0.25) : col; rr(ctx, 20, y, w - 40, 58, 29); ctx.fill(); fitTxt(ctx, label, w / 2, y + 38, 22, '#FFFDF8', w - 70); };
  btn(h - 210, 'TALK TO A HUMAN', o.humanCol || BLUE, o.pressed); btn(h - 140, 'FLAG MY CLAIM', '#5A5450', o.flagPressed);
}

// ---------- receipt strip (the bill) ----------
// lines: [[label, amount, highlight]] ; len = visible length (px from the top); grows downward from y = 0; w width
function receiptStrip(ctx, w, len, lines, o = {}) {
  if (len <= 2) return; const lh = o.lh || 150;
  CL.cutout(ctx, () => { ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.lineTo(w / 2, 0); ctx.lineTo(w / 2, len); for (let j = 0; j <= 12; j++) ctx.lineTo(w / 2 - j * w / 12, len - (j % 2) * 18); ctx.closePath(); }, '#FFFDF8', { elev: o.elev ?? 1.4, tex: 0.4 });
  ctx.save(); ctx.beginPath(); ctx.rect(-w / 2, 0, w, len - 14); ctx.clip();
  if (o.title) { fitTxt(ctx, o.title, 0, 80, 54, '#5A5450', w - 80); ctx.fillStyle = 'rgba(90,84,80,0.4)'; ctx.fillRect(-w / 2 + 40, 110, w - 80, 6); }
  lines.forEach(([lab, amt, hl], i) => { const y = (o.top ?? 130) + i * lh;
    if (hl) { ctx.fillStyle = hl === true ? 'rgba(255,200,87,0.55)' : hl; rr(ctx, -w / 2 + 22, y + 8, w - 44, lh - 14, 14); ctx.fill(); }
    fitTxt(ctx, lab, -w / 2 + 50, y + 46, o.labSize || 36, '#5A5450', w - 100, 'left');
    fitTxt(ctx, amt, -w / 2 + 46, y + lh * 0.88, o.amtSize || 96, o.red && i === o.red ? C.red : INK, w - 100, 'left');
    ctx.strokeStyle = 'rgba(90,84,80,0.3)'; ctx.setLineDash([12, 10]); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-w / 2 + 30, y + lh); ctx.lineTo(w / 2 - 30, y + lh); ctx.stroke(); ctx.setLineDash([]); });
  if (o.total) { const y = (o.top ?? 130) + lines.length * lh; ctx.fillStyle = INK; ctx.fillRect(-w / 2 + 30, y + 8, w - 60, 8);
    fitTxt(ctx, 'TOTAL', -w / 2 + 50, y + 58, 40, '#5A5450', 300, 'left'); fitTxt(ctx, o.total, -w / 2 + 44, y + 172, 128, C.red, w - 90, 'left'); }
  ctx.restore();
}

// ---------- discount coupon (paper, zig-zag edge) with a stopwatch ----------
function coupon(ctx, big, small, o = {}) {
  const w = o.w || 560, h = o.h || 300;
  CL.cutout(ctx, () => { ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2); for (let x = -w / 2; x <= w / 2; x += 28) ctx.lineTo(x, -h / 2 + ((x / 28) % 2 ? 10 : 0)); ctx.lineTo(w / 2, h / 2); for (let x = w / 2; x >= -w / 2; x -= 28) ctx.lineTo(x, h / 2 - ((x / 28) % 2 ? 10 : 0)); ctx.closePath(); }, o.col || C.yellow, { elev: o.elev ?? 1.6 });
  ctx.strokeStyle = 'rgba(23,23,23,0.5)'; ctx.setLineDash([16, 12]); ctx.lineWidth = 4; rr(ctx, -w / 2 + 22, -h / 2 + 26, w - 44, h - 52, 16); ctx.stroke(); ctx.setLineDash([]);
  fitTxt(ctx, big, 0, 30, o.bigSize || 140, INK, w - 90); fitTxt(ctx, small, 0, h / 2 - 50, 46, INK, w - 90);
  if (o.burn > 0) { ctx.save(); ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = `rgba(60,40,30,${0.6 * clamp(o.burn)})`; ctx.fillRect(-w, -h, 2 * w, 2 * h); ctx.restore(); }
}
function stopwatch(ctx, r, u, o = {}) { // u = elapsed fraction (red wedge grows)
  rr(ctx, -r * 0.18, -r * 1.32, r * 0.36, r * 0.3, 6); fillStroke(ctx, '#3A3F48', 4);
  ell(ctx, 0, 0, r * 1.08, r * 1.08); fillStroke(ctx, '#3A3F48', 5); ell(ctx, 0, 0, r * 0.92, r * 0.92); fillStroke(ctx, '#FFFDF8', 4);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r * 0.86, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamp(u)); ctx.closePath(); ctx.fillStyle = 'rgba(230,57,70,0.7)'; ctx.fill();
  ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.lineWidth = r * 0.08; const a = -Math.PI / 2 + Math.PI * 2 * u; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * r * 0.72, Math.sin(a) * r * 0.72); ctx.stroke();
  ell(ctx, 0, 0, r * 0.1, r * 0.1); ctx.fillStyle = INK; ctx.fill();
  if (o.label) fitTxt(ctx, o.label, 0, r * 1.5, r * 0.5, INK, r * 3);
}

// ---------- the chat bot: a friendly little robot (help desk), not a villain ----------
// o: { face: 'smile'|'no'|'busy', arm: [x,y] right hand target, armL, wave, blink }
function bot(ctx, s = 1, o = {}) {
  ctx.save(); ctx.scale(s, s);
  K.contact(ctx, 0, 0, 170, 30, 0.35);
  // wheel base
  rr(ctx, -110, -70, 220, 70, 30); fillStroke(ctx, '#3A3F48', 5); for (const x of [-60, 0, 60]) { ell(ctx, x, -34, 18, 18); fillStroke(ctx, '#20232A', 4); }
  // body
  CL.cutout(ctx, () => rr(ctx, -130, -330, 260, 270, 60), '#F2F0EA', { elev: 1.2, tex: 0.35 });
  rr(ctx, -70, -260, 140, 90, 18); fillStroke(ctx, BLUE, 4); txt(ctx, 'HELP', 0, -202, 40, '#FFFDF8');
  // arms (tubes) with claw hands
  const arm = (sh, hd) => { R.tube(ctx, [sh, [lerp(sh[0], hd[0], 0.5) + (sh[0] < 0 ? -20 : 20), lerp(sh[1], hd[1], 0.5) + 20], hd], 26, '#C4CBD3', 4.5); ell(ctx, hd[0], hd[1], 22, 22); fillStroke(ctx, '#8A939E', 4); };
  arm([-120, -280], o.armL || [-190, -150]); arm([120, -280], o.arm || [190, -150]);
  // neck + head (screen face)
  ctx.fillStyle = '#8A939E'; ctx.fillRect(-20, -370, 40, 50);
  ctx.save(); ctx.translate(0, -470); ctx.rotate(o.tilt || 0);
  CL.cutout(ctx, () => rr(ctx, -150, -110, 300, 210, 50), '#F2F0EA', { elev: 1.2, tex: 0.35 });
  rr(ctx, -120, -82, 240, 154, 34); fillStroke(ctx, '#1B2A3A', 4);
  ctx.strokeStyle = '#7CE3FF'; ctx.fillStyle = '#7CE3FF'; ctx.lineCap = 'round'; ctx.lineWidth = 12;
  const f = o.face || 'smile', bl = o.blink ? 0.15 : 1;
  if (f === 'no') { for (const ex of [-50, 50]) { ctx.beginPath(); ctx.moveTo(ex - 18, -32); ctx.lineTo(ex + 18, 4); ctx.moveTo(ex + 18, -32); ctx.lineTo(ex - 18, 4); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(-34, 44); ctx.quadraticCurveTo(0, 26, 34, 44); ctx.stroke(); }
  else if (f === 'busy') { for (const ex of [-50, 50]) { ctx.beginPath(); ctx.moveTo(ex - 20, -14); ctx.lineTo(ex + 20, -14); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(-30, 40); ctx.lineTo(30, 40); ctx.stroke(); }
  else { for (const ex of [-50, 50]) { ell(ctx, ex, -14, 16, 22 * bl); ctx.fill(); } ctx.beginPath(); ctx.moveTo(-40, 28); ctx.quadraticCurveTo(0, 62, 40, 28); ctx.stroke(); }
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 5); ctx.beginPath(); ctx.moveTo(0, -110); ctx.lineTo(0, -170); ctx.stroke(); ell(ctx, 0, -178, 16, 16); fillStroke(ctx, o.antenna || C.yellow, 4);
  ctx.restore(); ctx.restore();
}
// wall socket labelled HUMAN AGENT and a plug on a cord
function socket(ctx, label = 'HUMAN AGENT') {
  CL.cutout(ctx, () => rr(ctx, -110, -150, 220, 300, 24), '#FFFDF8', { elev: 1.2, tex: 0.3 });
  ell(ctx, 0, -20, 66, 66); fillStroke(ctx, '#E9E2D2', 4); for (const x of [-22, 22]) { rr(ctx, x - 8, -44, 16, 40, 6); ctx.fillStyle = INK; ctx.fill(); }
  fitTxt(ctx, label, 0, 112, 40, INK, 205);
}
function plug(ctx, a = 0) { ctx.save(); ctx.rotate(a); rr(ctx, -40, -30, 80, 90, 16); fillStroke(ctx, '#3A3F48', 4.5); for (const x of [-22, 22]) { ctx.fillStyle = '#C9CED6'; ctx.fillRect(x - 7, -70, 14, 42); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 3); ctx.strokeRect(x - 7, -70, 14, 42); } ctx.restore(); }
// claim folder with a little flag
function claimCard(ctx, s = 1, flagU = 0) {
  ctx.save(); ctx.scale(s, s); CL.cutout(ctx, () => rr(ctx, -120, -80, 240, 160, 12), '#F4D9A8', { elev: 1.3 }); txt(ctx, 'CLAIM', 0, 18, 52, INK);
  if (flagU > 0) { ctx.save(); ctx.translate(90, -80); ctx.scale(1, E.back(clamp(flagU), 2)); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 5); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -130); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -130); ctx.lineTo(90, -105); ctx.lineTo(0, -78); ctx.closePath(); fillStroke(ctx, C.red, 4); ctx.restore(); }
  ctx.restore();
}
// in-tray labelled LATER
function tray(ctx, label = 'LATER') {
  CL.cutout(ctx, () => { ctx.beginPath(); ctx.moveTo(-200, -90); ctx.lineTo(200, -90); ctx.lineTo(170, 40); ctx.lineTo(-170, 40); ctx.closePath(); }, '#8B5A3C', { elev: 1.2 });
  CL.cutout(ctx, () => rr(ctx, -120, -64, 240, 76, 12), '#FFFDF8', { elev: 0.5 }); txt(ctx, label, 0, -10, 52, INK);
}
// paper airplane (email)
function paperPlane(ctx, s = 1) {
  ctx.save(); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(120, 0); ctx.lineTo(-100, -60); ctx.lineTo(-40, 6); ctx.closePath(); fillStroke(ctx, '#FFFDF8', 4.5);
  ctx.beginPath(); ctx.moveTo(120, 0); ctx.lineTo(-40, 6); ctx.lineTo(-70, 60); ctx.closePath(); fillStroke(ctx, '#E9E2D2', 4.5);
  ctx.beginPath(); ctx.moveTo(120, 0); ctx.lineTo(-40, 6); ctx.lineTo(-60, 20); ctx.closePath(); ctx.fillStyle = '#D0C7B6'; ctx.fill(); ctx.restore();
}
// mailbox signpost (the possible reply), with a question mark: a deadline, not an event
function mailbox(ctx, s = 1) {
  ctx.save(); ctx.scale(s, s); ctx.fillStyle = '#5A3A22'; ctx.fillRect(-14, -300, 28, 300);
  CL.cutout(ctx, () => { ctx.beginPath(); ctx.moveTo(-110, -300); ctx.lineTo(-110, -420); ctx.quadraticCurveTo(-110, -480, -50, -480); ctx.lineTo(110, -480); ctx.lineTo(110, -300); ctx.closePath(); }, '#4D8DFF', { elev: 1.2 });
  ctx.fillStyle = shade('#4D8DFF', -0.3); ctx.fillRect(-110, -330, 220, 20);
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 5); ctx.beginPath(); ctx.moveTo(110, -440); ctx.lineTo(150, -440); ctx.lineTo(150, -400); ctx.stroke(); ctx.fillStyle = C.red; ctx.fillRect(150, -470, 40, 34);
  txt(ctx, '?', 0, -362, 110, '#FFFDF8'); ctx.restore();
}
// balloon on a string (the discount)
function balloon(ctx, label, pop = 0, s = 1) {
  ctx.save(); ctx.scale(s, s);
  if (pop <= 0) { ell(ctx, 0, -150, 110, 130); fillStroke(ctx, C.yellow, 5); ctx.fillStyle = 'rgba(255,255,255,0.5)'; ell(ctx, -40, -200, 24, 40, 0.5); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-14, -18); ctx.lineTo(14, -18); ctx.lineTo(0, -4); ctx.closePath(); fillStroke(ctx, C.yellow, 3.5); fitTxt(ctx, label, 0, -128, 58, INK, 190); }
  else { const u = clamp(pop); ctx.globalAlpha *= 1 - u; ctx.strokeStyle = C.yellow; ctx.lineWidth = 12; ctx.lineCap = 'round';
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, r0 = 60 + u * 140, r1 = r0 + 50; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r0, -150 + Math.sin(a) * r0); ctx.lineTo(Math.cos(a) * r1, -150 + Math.sin(a) * r1); ctx.stroke(); }
    ctx.fillStyle = C.yellow; for (let i = 0; i < 7; i++) { const a = i * 0.9 + 0.3, r0 = 40 + u * 220; ctx.save(); ctx.translate(Math.cos(a) * r0, -150 + Math.sin(a) * r0 + u * u * 160); ctx.rotate(a + u * 4); ctx.fillRect(-26, -14, 52, 28); ctx.restore(); } }
  ctx.restore();
}
// day tile path (calendar squares on the floor): n tiles of width tw, starting at x0
function dayTiles(ctx, x0, tw, n, o = {}) {
  for (let i = 0; i < n; i++) { const x = x0 + i * tw, d = i + 1, hl = o.hl && o.hl[d];
    ctx.save(); ctx.translate(x, 0); ctx.transform(1, 0, -0.35, 0.32, 0, 0);
    CL.cutout(ctx, () => rr(ctx, 8, -10, tw - 16, 300, 18), hl || '#FFFDF8', { elev: 0.4, tex: 0.3 }); ctx.restore();
    txt(ctx, `DAY ${d}`, x + tw / 2 - 30, 70, 46, d <= (o.dim ?? 0) ? 'rgba(23,23,23,0.35)' : INK); }
}
function signPost(ctx, lines, col = '#FFFDF8', fg = INK, s = 1) {
  ctx.save(); ctx.scale(s, s); ctx.fillStyle = '#5A3A22'; ctx.fillRect(-12, -380, 24, 380);
  ctx.font = `60px ${F.black}`; const w = Math.max(...lines.map(l => ctx.measureText(l).width)) + 70, h = 40 + lines.length * 70;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -380 - h, w, h, 14), col, { elev: 1.3 });
  lines.forEach((l, i) => txt(ctx, l, 0, -380 - h + 86 + i * 70, 60, fg)); ctx.restore();
}

// ---------- review desk (office) with two monitors ----------
function office(ctx, t) {
  ctx.fillStyle = '#DDE5EE'; ctx.fillRect(-3000, -2400, 6000, 2400);
  ctx.fillStyle = '#C9D3DE'; for (let x = -2800; x < 2800; x += 500) ctx.fillRect(x, -2400, 30, 2400);
  // window blinds with light
  ctx.save(); ctx.translate(-700, -1500); CL.cutout(ctx, () => rr(ctx, -360, -300, 720, 600, 10), '#F3F6FA', { elev: 0.6, tex: 0.2 }); ctx.fillStyle = 'rgba(160,190,220,0.6)'; for (let y = -280; y < 290; y += 40) ctx.fillRect(-340, y, 680, 18); ctx.restore();
  ctx.save(); ctx.translate(800, -1600); ctx.fillStyle = '#3E9E6A'; for (const [dx, dy, r] of [[0, 0, 90], [-70, 60, 70], [70, 50, 80]]) { ell(ctx, dx, dy, r, r); fillStroke(ctx, '#3E9E6A', 5); } ctx.fillStyle = '#8B5A3C'; rr(ctx, -60, 120, 120, 160, 12); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#B9C4D0'; ctx.fillRect(-3000, -60, 6000, 2000);
}
function monitor(ctx, w, h, screen) {
  ctx.fillStyle = '#3A3F48'; ctx.fillRect(-20, h / 2, 40, 90); rr(ctx, -110, h / 2 + 80, 220, 26, 10); fillStroke(ctx, '#3A3F48', 4);
  rr(ctx, -w / 2 - 18, -h / 2 - 18, w + 36, h + 36, 18); fillStroke(ctx, '#20232A', 5);
  ctx.save(); rr(ctx, -w / 2, -h / 2, w, h, 8); ctx.clip(); ctx.translate(-w / 2, -h / 2); screen(ctx, w, h); ctx.restore();
}
// photo of the wheel (BEFORE / AFTER) for the monitors
function wheelPhoto(ctx, w, h, label, scuffU, check = 0) {
  ctx.fillStyle = '#7D8794'; ctx.fillRect(0, 0, w, h); ctx.save(); ctx.translate(w / 2, h / 2 + 30); const s = h / 330; ctx.scale(s, s);
  ctx.fillStyle = CAR; ctx.fillRect(-300, -300, 600, 160); ctx.beginPath(); ctx.arc(0, -10, 140, Math.PI, 0); ctx.fillStyle = '#1D1F24'; ctx.fill(); wheel(ctx, 120, 0.3, { scuff: scuffU });
  if (scuffU > 0 && check > 0) detectBox(ctx, 84, Math.min(1, check * 1.6), 'NEW'); ctx.restore();
  ctx.fillStyle = label === 'AFTER' ? C.red : '#2E3A59'; rr(ctx, 14, 14, 150, 50, 10); ctx.fill(); txt(ctx, label, 89, 50, 30, '#FFFDF8');
}

module.exports = { W, H, layer, txt, fitTxt, BLUE, CAR, PAT, AGENT, wheel, scuffMark, detectBox, SCUFF, carSide, carFront, scanMesh, ARCH, archFront, archSide, cameraPod, lensClose,
  sky, plane, terminalExt, tree, garage, hangSign, terminalIn, seats, suitcase, phone, appHeader, appNotify, appPhoto, appChat, receiptStrip, coupon, stopwatch,
  bot, socket, plug, claimCard, tray, paperPlane, mailbox, balloon, dayTiles, signPost, office, monitor, wheelPhoto };
