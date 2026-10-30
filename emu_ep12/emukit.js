// Episode 12 "The Great Emu War" sets, props and cast (on hirkit): the emu (side + front close-up, crowds), soldiers in slouch hats,
// the Major, the wheat farmer, the Lewis gun, a 1930s army truck, the Western Australian wheatbelt (sky, hills, windmill, farmhouse,
// fence, wheat that can be eaten), the dam, the map of Australia, calendar cards, the Major's report, the ammo crate, the bounty poster,
// claim slips, pound notes and the pay envelope. Australia used pounds in 1932-34: money is drawn as £ notes, no amounts.
const { GlobalFonts } = require('@napi-rs/canvas');
const K = require('../tests/mcd_collage/kit');
const R = require('../hirkit/rig');
const CL = require('../hirkit/collage');
const { C, F, clamp, lerp, seg, E, rr, hash } = K;
const { INK, shade, fillStroke, ell, px, tube, ik } = R;
try { GlobalFonts.registerFromPath('/usr/share/fonts/truetype/freefont/FreeMonoBold.ttf', 'TypeW'); } catch (e) {}
const TYPE = 'TypeW, monospace';

const W = 1080, H = 1920;
const txt = (ctx, s, x, y, size, col, align = 'center', font = F.black) => { ctx.font = `${size}px ${font}`; ctx.textAlign = align; ctx.fillStyle = col; ctx.fillText(s, x, y); };
function fitTxt(ctx, s, x, y, size, col, maxW, align = 'center', font = F.black) { ctx.font = `${size}px ${font}`; const w = ctx.measureText(s).width; if (w > maxW) size *= maxW / w; txt(ctx, s, x, y, size, col, align, font); return size; }

// ---------- palette ----------
const SKY0 = '#F6D9A0', SKY1 = '#F9EBCB', DIRT = '#C98E5F', DIRTD = '#A76E46', WHEAT = '#E8C25A', WHEATD = '#C79A36', HILL = '#B9A27A';
const KHAKI = '#8E7F52', KHAKID = '#76683F', FEATH = '#5E4B3C', FEATHL = '#8A7461', EMUSKIN = '#8FB0CE', ARMY = '#66764A';

// ---------- cast ----------
const SOL = { skin: '#E3B08C', hair: '#5A3A24', hairStyle: 'short', top: KHAKI, cuff: KHAKID, pants: '#7A6B44', shoes: '#4A3424', sole: '#2E2018', iris: '#4E6B3C', brow: '#3A2416' };
const SOL2 = { ...SOL, skin: '#D9A07A', hair: '#2E2018', iris: '#3A2414' };
const MAJOR = { ...SOL, skin: '#E8B898', hair: '#8A8A88', top: '#7E7048', cuff: '#5E5234', iris: '#3E5A7A', brow: '#6A6A68', stache: '#7A7A78' };
const FARMER = { skin: '#E0A47C', hair: '#7A4A2A', hairStyle: 'short', top: '#E7DCC4', shirt: '#F4EEDF', cuff: '#D3C6A8', pants: '#4D5F86', shoes: '#5A3A22', sole: '#2E2018', iris: '#4A6A8A', brow: '#5A3418', beard: 0 };
const HAT_ARMY = { col: '#7A6A46', band: '#3E3222', badge: 1 }, HAT_FARM = { col: '#C4A66A', band: '#6A4A2A' };

// slouch hat on a side head (head-local, R = 78, facing +x)
function hatSide(ctx, h) {
  ctx.save();
  ctx.beginPath(); ctx.moveTo(-70, -62); ctx.bezierCurveTo(-74, -150, 70, -158, 72, -62); ctx.closePath(); fillStroke(ctx, h.col, 5);
  ctx.save(); ctx.beginPath(); ctx.moveTo(-70, -62); ctx.bezierCurveTo(-74, -150, 70, -158, 72, -62); ctx.closePath(); ctx.clip();
  ctx.fillStyle = h.band; ctx.fillRect(-90, -84, 180, 22); ctx.fillStyle = 'rgba(255,255,255,0.18)'; ell(ctx, 10, -128, 40, 12); ctx.fill(); ctx.restore();
  ctx.beginPath(); ctx.moveTo(-136, -58); ctx.quadraticCurveTo(0, -80, 140, -54); ctx.quadraticCurveTo(150, -46, 136, -42); ctx.quadraticCurveTo(0, -60, -132, -46); ctx.quadraticCurveTo(-146, -50, -136, -58); ctx.closePath(); fillStroke(ctx, shade(h.col, -0.08), 5);
  ctx.restore();
}
// slouch hat on a front head (head-local, R = 78); the army one has the left side pinned up with a rising-sun badge
function hatFront(ctx, h) {
  ctx.save();
  ctx.beginPath(); ctx.moveTo(-74, -58); ctx.bezierCurveTo(-80, -160, 80, -160, 74, -58); ctx.closePath(); fillStroke(ctx, h.col, 5);
  ctx.save(); ctx.beginPath(); ctx.moveTo(-74, -58); ctx.bezierCurveTo(-80, -160, 80, -160, 74, -58); ctx.closePath(); ctx.clip();
  ctx.fillStyle = h.band; ctx.fillRect(-90, -84, 180, 24); ctx.strokeStyle = shade(h.col, -0.25); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, -150); ctx.quadraticCurveTo(-6, -120, 0, -86); ctx.stroke(); ctx.restore();
  if (h.badge) { // brim pinned up on the wearer's left (viewer's right)
    ctx.beginPath(); ctx.moveTo(-150, -56); ctx.quadraticCurveTo(-70, -78, 66, -66); ctx.lineTo(70, -46); ctx.quadraticCurveTo(-70, -48, -150, -40); ctx.quadraticCurveTo(-162, -48, -150, -56); ctx.closePath(); fillStroke(ctx, shade(h.col, -0.06), 5);
    ctx.beginPath(); ctx.moveTo(62, -48); ctx.quadraticCurveTo(100, -60, 104, -150); ctx.quadraticCurveTo(84, -150, 66, -132); ctx.lineTo(60, -62); ctx.closePath(); fillStroke(ctx, shade(h.col, 0.06), 5);
    ctx.save(); ctx.translate(84, -96); ctx.beginPath(); ctx.arc(0, 4, 13, Math.PI, 0); ctx.closePath(); fillStroke(ctx, C.yellow, 3); ctx.strokeStyle = C.yellowD; ctx.lineWidth = 2; for (let i = 0; i < 5; i++) { const a = Math.PI + (i + 0.5) / 5 * Math.PI; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 14, 4 + Math.sin(a) * 14); ctx.lineTo(Math.cos(a) * 22, 4 + Math.sin(a) * 22); ctx.stroke(); } ctx.restore();
  } else { ctx.beginPath(); ctx.ellipse(0, -52, 150, 26, 0, 0, Math.PI * 2); fillStroke(ctx, shade(h.col, -0.06), 5); ctx.beginPath(); ctx.moveTo(-74, -58); ctx.bezierCurveTo(-80, -160, 80, -160, 74, -58); ctx.closePath(); fillStroke(ctx, h.col, 5);
    ctx.save(); ctx.clip(); ctx.fillStyle = h.band; ctx.fillRect(-90, -84, 180, 24); ctx.restore(); }
  ctx.restore();
}
// full figure + hat (+ the Major's moustache)
function person(ctx, x, y, s, facing, L, P, hat) {
  const r = R.figure(ctx, x, y, s, facing, L, P);
  ctx.save(); ctx.translate(x, y); ctx.scale(s * facing, s); ctx.translate(r.hd[0], r.hd[1]); ctx.rotate((P.headTilt || 0) + (P.lean || 0) * 0.3);
  if (L.stache) { ctx.beginPath(); ctx.moveTo(52, 30); ctx.quadraticCurveTo(80, 18, 100, 34); ctx.quadraticCurveTo(80, 44, 52, 38); ctx.closePath(); fillStroke(ctx, L.stache, 4); }
  if (hat) hatSide(ctx, hat); ctx.restore(); return r;
}
function personBust(ctx, x, y, s, L, P, hat) {
  R.bust(ctx, x, y, s, L, P);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(P.lean || 0); ctx.translate(0, -112); ctx.rotate(P.headTilt || 0);
  if (L.stache) { ctx.beginPath(); ctx.moveTo(-6, 26); ctx.quadraticCurveTo(-40, 16, -58, 40); ctx.quadraticCurveTo(-30, 44, -4, 36); ctx.quadraticCurveTo(0, 30, 4, 36); ctx.quadraticCurveTo(30, 44, 58, 40); ctx.quadraticCurveTo(40, 16, 6, 26); ctx.closePath(); fillStroke(ctx, L.stache, 4); }
  if (hat) hatFront(ctx, hat); ctx.restore();
}

// ---------- the emu, side view (faces +x, feet on y = 0, ~640 tall) ----------
// o: { phase (rad), stride (0 = standing .. 1 = running), peck 0..1, look [x,y], lid 0..1, blink, tilt, eat (beak full) }
function emu(ctx, o = {}) {
  const ph = o.phase || 0, st = o.stride || 0, run = st > 0.6;
  const bob = st * 14 * Math.abs(Math.sin(ph)), lean = st * 0.12;
  const hip = [-10, -272 - bob];
  const foot = p => { if (st <= 0) return [p > 0 ? 26 : -30, 0]; const sw = Math.sin(p); return [sw * (60 + 90 * st), -Math.max(0, Math.cos(p)) * (24 + 50 * st)]; };
  const leg = (p, far) => {
    const f = foot(p), [k] = ik(hip, f, 150, 146, (a, b) => (a[0] < b[0] ? a : b));
    const col = far ? '#4A4642' : '#64605A';
    tube(ctx, [hip, k, f], 18, col, 4.5);
    ctx.save(); ctx.translate(f[0], f[1]); ctx.strokeStyle = INK; ctx.lineCap = 'round';
    for (const a of [-0.25, 0, 0.3]) { ctx.lineWidth = px(ctx, 13); ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(Math.cos(a) * 44, -4 + Math.sin(a) * 12); ctx.stroke(); ctx.lineWidth = px(ctx, 6); ctx.strokeStyle = col; ctx.stroke(); ctx.strokeStyle = INK; }
    ctx.restore();
  };
  ctx.save();
  K.contact(ctx, 0, 0, 170, 22, 0.35);
  leg(ph + Math.PI, true);
  // body: a shaggy mop of feathers, rear lower
  ctx.save(); ctx.translate(-20, -372 - bob); ctx.rotate(0.12 + lean);
  const body = () => { ctx.beginPath(); ctx.moveTo(150, -20); ctx.bezierCurveTo(150, -110, -60, -128, -150, -60);
    for (let i = 0; i <= 12; i++) { const u = i / 12, x = lerp(-170, 140, u), y = 60 + Math.sin(u * Math.PI) * 50; ctx.lineTo(x - 12, y - 8 + (i % 2) * 34 + Math.sin(ph * 2 + i) * 4 * st); }
    ctx.bezierCurveTo(170, 60, 160, 20, 150, -20); ctx.closePath(); };
  body(); fillStroke(ctx, FEATH, 5);
  ctx.save(); body(); ctx.clip(); ctx.strokeStyle = FEATHL; ctx.lineWidth = 6; ctx.lineCap = 'round';
  for (let i = 0; i < 22; i++) { const x = -150 + hash(i) * 290, y = -80 + hash(i + 9) * 140; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x - 12, y + 22, x - 26, y + 44); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,240,210,0.16)'; ell(ctx, 10, -70, 120, 34); ctx.fill(); ctx.restore();
  ctx.restore();
  // neck + head
  const pk = E.inOut(clamp(o.peck || 0));
  const n0 = [100, -420 - bob], hp = [lerp(170 + lean * 200, 300, pk), lerp(-650 - bob, -60, pk)], cp = [lerp(210, 330, pk), lerp(-470, -330, pk)];
  const pts = []; for (let i = 0; i <= 10; i++) { const u = i / 10; pts.push([(1 - u) * (1 - u) * n0[0] + 2 * u * (1 - u) * cp[0] + u * u * hp[0], (1 - u) * (1 - u) * n0[1] + 2 * u * (1 - u) * cp[1] + u * u * hp[1]]); }
  tube(ctx, pts, 50, FEATH, 5); tube(ctx, pts.slice(5), 38, EMUSKIN, 0);
  ctx.strokeStyle = shade(EMUSKIN, -0.15); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(pts[6][0] + 8, pts[6][1]); ctx.lineTo(pts[9][0] + 8, pts[9][1]); ctx.stroke();
  // shaggy fringe where the feathers stop
  ctx.fillStyle = FEATH; for (let i = 0; i < 4; i++) { const p = pts[4 + (i > 1 ? 1 : 0)]; ell(ctx, p[0] + (i - 1.5) * 10, p[1] + 6, 20, 26, 0.3); ctx.fill(); }
  const ang = Math.atan2(hp[1] - pts[8][1], hp[0] - pts[8][0]) + Math.PI / 2 + (o.tilt || 0);
  ctx.save(); ctx.translate(hp[0], hp[1]); ctx.rotate(lerp(0, ang, pk) * 0.6 + (o.tilt || 0));
  emuHeadSide(ctx, o); ctx.restore();
  leg(ph, false);
  ctx.restore();
}
function emuHeadSide(ctx, o) {
  // beak
  ctx.beginPath(); ctx.moveTo(22, -8); ctx.quadraticCurveTo(70, -6, 82, 8); ctx.quadraticCurveTo(60, 20, 20, 18); ctx.closePath(); fillStroke(ctx, '#4A4440', 4.5);
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 3); ctx.beginPath(); ctx.moveTo(26, 8); ctx.lineTo(76, 9); ctx.stroke();
  if (o.eat) { ctx.strokeStyle = WHEATD; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(60, 10); ctx.lineTo(96, 34); ctx.moveTo(56, 12); ctx.lineTo(84, 44); ctx.stroke(); ell(ctx, 100, 38, 12, 6, 0.6); ctx.fillStyle = WHEAT; ctx.fill(); }
  // head (dark feathered cap, blue face skin)
  ctx.beginPath(); ctx.moveTo(-36, 18); ctx.bezierCurveTo(-48, -40, 30, -50, 36, 0); ctx.quadraticCurveTo(30, 26, -36, 18); ctx.closePath(); fillStroke(ctx, EMUSKIN, 5);
  ctx.save(); ctx.clip(); ctx.fillStyle = '#3C3631'; ell(ctx, -18, -26, 50, 24, -0.2); ctx.fill(); for (let i = 0; i < 6; i++) { ell(ctx, -40 + i * 12, -10 + (i % 2) * 4, 8, 10); ctx.fill(); } ctx.restore();
  emuEye(ctx, 6, -2, 13, o);
}
function emuEye(ctx, x, y, r, o) {
  const lid = clamp(Math.max(o.lid || 0, o.blink || 0)), lk = o.look || [0.3, 0];
  ell(ctx, x, y, r, r); fillStroke(ctx, '#FFF8EC', 3.5);
  ell(ctx, x + lk[0] * r * 0.35, y + lk[1] * r * 0.35, r * 0.62, r * 0.62); ctx.fillStyle = '#B9692A'; ctx.fill();
  ell(ctx, x + lk[0] * r * 0.4, y + lk[1] * r * 0.4, r * 0.32, r * 0.32); ctx.fillStyle = '#141210'; ctx.fill();
  ell(ctx, x + lk[0] * r * 0.4 - r * 0.15, y + lk[1] * r * 0.4 - r * 0.18, r * 0.12, r * 0.12); ctx.fillStyle = '#fff'; ctx.fill();
  if (lid > 0) { ctx.save(); ell(ctx, x, y, r, r); ctx.clip(); ctx.fillStyle = '#3C3631'; ctx.fillRect(x - r, y - r, r * 2, r * 2 * lid); ctx.restore();
    ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 4); ctx.beginPath(); const yy = y - r + r * 2 * lid; const hw = Math.sqrt(Math.max(0, r * r - (yy - y) ** 2)); ctx.moveTo(x - hw, yy); ctx.lineTo(x + hw, yy); ctx.stroke(); }
  ell(ctx, x, y, r, r); ctx.lineWidth = px(ctx, 3.5); ctx.strokeStyle = INK; ctx.stroke();
}
// the emu close-up, front view: head centre at (0, 0), ~ 200 wide; o: { lid [l, r] or number, look, blink, tilt, chew }
function emuFace(ctx, o = {}) {
  ctx.save(); ctx.rotate(o.tilt || 0);
  // neck going down out of frame
  ctx.beginPath(); ctx.moveTo(-58, 40); ctx.bezierCurveTo(-70, 260, -90, 480, -150, 900); ctx.lineTo(150, 900); ctx.bezierCurveTo(90, 480, 70, 260, 58, 40); ctx.closePath(); fillStroke(ctx, EMUSKIN, 5);
  ctx.save(); ctx.clip(); const g = ctx.createLinearGradient(0, 300, 0, 520); g.addColorStop(0, 'rgba(94,75,60,0)'); g.addColorStop(1, FEATH); ctx.fillStyle = g; ctx.fillRect(-200, 300, 400, 620);
  ctx.strokeStyle = shade(EMUSKIN, -0.18); ctx.lineWidth = 5; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-40 + i * 26, 120); ctx.quadraticCurveTo(-46 + i * 30, 220, -54 + i * 34, 320); ctx.stroke(); }
  ctx.fillStyle = FEATH; for (let i = 0; i < 9; i++) { ell(ctx, -150 + i * 38, 470 + (i % 2) * 24, 34, 60, (i - 4) * 0.08); ctx.fill(); } ctx.restore();
  // head: fuzzy dark cap, blue cheeks
  const head = () => { ctx.beginPath(); for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 2, rr0 = 1 + (i % 2 ? 0.05 : 0) * (Math.sin(a) < 0.2 ? 1 : 0); ctx.lineTo(Math.cos(a) * 108 * rr0, Math.sin(a) * 92 * rr0 - 4); } ctx.closePath(); };
  head(); fillStroke(ctx, EMUSKIN, 5);
  ctx.save(); head(); ctx.clip(); ctx.fillStyle = '#3C3631'; ell(ctx, 0, -70, 120, 66); ctx.fill(); for (let i = 0; i < 9; i++) { ell(ctx, -100 + i * 25, -14 + (i % 2) * 10, 14, 18); ctx.fill(); }
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; ell(ctx, -30, -60, 50, 18, -0.3); ctx.fill(); ctx.restore();
  const lids = Array.isArray(o.lid) ? o.lid : [o.lid || 0, o.lid || 0];
  emuEye(ctx, -54, 2, 27, { lid: Math.max(lids[0], o.blink || 0), look: o.look });
  emuEye(ctx, 54, 2, 27, { lid: Math.max(lids[1], o.blink || 0), look: o.look });
  // beak, pointing at us
  const ch = o.chew ? Math.abs(Math.sin(o.chew * 9)) * 8 : 0;
  ctx.beginPath(); ctx.moveTo(-34, 30); ctx.quadraticCurveTo(0, 18, 34, 30); ctx.quadraticCurveTo(28, 76 + ch, 0, 92 + ch); ctx.quadraticCurveTo(-28, 76 + ch, -34, 30); ctx.closePath(); fillStroke(ctx, '#4A4440', 5);
  ctx.fillStyle = INK; ell(ctx, -10, 46, 4, 6); ctx.fill(); ell(ctx, 10, 46, 4, 6); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-18, 34); ctx.quadraticCurveTo(-20, 60, -8, 80); ctx.stroke();
  ctx.restore();
}

// ---------- the Lewis gun, side view (faces +x), pivot of the bipod at (0, 0), ~ 640 long ----------
// o: { bipod (leg length, 0 = none), flash 0..1, smoke 0..1, t }
function lewisGun(ctx, o = {}) {
  ctx.save();
  if (o.bipod) { ctx.strokeStyle = INK; ctx.lineCap = 'round'; for (const [dx, col] of [[-40, '#3A3D3A'], [40, '#2A2D2A']]) { ctx.lineWidth = px(ctx, 16); ctx.beginPath(); ctx.moveTo(150, 20); ctx.lineTo(150 + dx, o.bipod); ctx.stroke(); ctx.lineWidth = px(ctx, 8); ctx.strokeStyle = col; ctx.stroke(); ctx.strokeStyle = INK; } }
  // butt stock + grip
  ctx.beginPath(); ctx.moveTo(-200, -10); ctx.lineTo(-340, 6); ctx.quadraticCurveTo(-352, 40, -340, 70); ctx.lineTo(-300, 64); ctx.lineTo(-180, 28); ctx.closePath(); fillStroke(ctx, '#8B5A3C', 5);
  ctx.beginPath(); ctx.moveTo(-150, 22); ctx.lineTo(-136, 96); ctx.quadraticCurveTo(-120, 104, -106, 96); ctx.lineTo(-112, 22); ctx.closePath(); fillStroke(ctx, '#7A4C30', 5);
  ctx.beginPath(); ctx.arc(-92, 30, 20, 0, Math.PI); ctx.lineWidth = px(ctx, 6); ctx.strokeStyle = INK; ctx.stroke();
  // receiver
  rr(ctx, -210, -28, 230, 60, 10); fillStroke(ctx, '#3A3D3A', 5);
  // the fat cooling shroud
  rr(ctx, 10, -38, 270, 76, 30); fillStroke(ctx, '#2E322F', 5);
  ctx.save(); rr(ctx, 10, -38, 270, 76, 30); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.fillRect(10, -30, 270, 16); ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 3; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(40 + i * 28, -38); ctx.lineTo(40 + i * 28, 38); ctx.stroke(); } ctx.restore();
  ctx.beginPath(); ctx.moveTo(278, -24); ctx.lineTo(330, -10); ctx.lineTo(330, 10); ctx.lineTo(278, 24); ctx.closePath(); fillStroke(ctx, '#3A3D3A', 5);
  rr(ctx, 330, -7, 40, 14, 4); fillStroke(ctx, '#2A2D2A', 4);
  // the flat pan magazine on top
  rr(ctx, -190, -66, 190, 34, 16); fillStroke(ctx, '#4A4E4A', 5); ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 3; for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.moveTo(-170 + i * 26, -62); ctx.lineTo(-170 + i * 26, -36); ctx.stroke(); }
  rr(ctx, -110, -76, 30, 14, 4); fillStroke(ctx, '#3A3D3A', 3.5);
  // sights
  ctx.beginPath(); ctx.moveTo(260, -38); ctx.lineTo(266, -58); ctx.lineTo(274, -38); fillStroke(ctx, '#2A2D2A', 3.5);
  if (o.flash > 0) { ctx.save(); ctx.translate(372, 0); const s = o.flash; ctx.scale(s, s);
    ctx.beginPath(); for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, r = i % 2 ? 34 : (i % 4 ? 70 : 110); ctx.lineTo(Math.cos(a) * r * (Math.abs(Math.cos(a)) * 0.6 + 0.6), Math.sin(a) * r * 0.6); } ctx.closePath();
    ctx.fillStyle = C.yellow; ctx.fill(); ctx.lineWidth = px(ctx, 4); ctx.strokeStyle = INK; ctx.stroke(); ell(ctx, 10, 0, 34, 20); ctx.fillStyle = '#FFF6D8'; ctx.fill(); ctx.restore(); }
  if (o.smoke > 0) { const u = o.smoke; ctx.save(); ctx.globalAlpha *= 1 - u; for (let i = 0; i < 6; i++) { const a = i * 1.3; ell(ctx, -60 + Math.cos(a) * 30 * u + i * 14, -90 - u * 160 - i * 18, 26 + u * 40, 22 + u * 34); ctx.fillStyle = 'rgba(235,232,225,0.95)'; ctx.fill(); ctx.lineWidth = px(ctx, 3); ctx.strokeStyle = 'rgba(23,23,23,0.5)'; ctx.stroke(); } ctx.restore(); }
  ctx.restore();
}

// ---------- 1930s army truck, side view (faces +x), wheels on y = 0, ~ 960 long ----------
// o: { rot, bed(ctx) drawn on the flat bed (origin at the bed floor centre) }
function truck(ctx, o = {}) {
  const rot = o.rot || 0;
  K.contact(ctx, 0, 0, 520, 30, 0.4);
  ctx.save();
  // chassis
  rr(ctx, -470, -104, 930, 26, 6); fillStroke(ctx, '#2A2A28', 5);
  // bed (low slatted sides) — the cargo goes on before the front rail
  if (o.bed) { ctx.save(); ctx.translate(-220, -150); o.bed(ctx); ctx.restore(); }
  rr(ctx, -480, -168, 500, 66, 6); fillStroke(ctx, ARMY, 5); ctx.strokeStyle = shade(ARMY, -0.3); ctx.lineWidth = 4; for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-480 + i * 84, -164); ctx.lineTo(-480 + i * 84, -106); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-480, -140); ctx.lineTo(20, -140); ctx.stroke();
  // cab
  ctx.beginPath(); ctx.moveTo(30, -100); ctx.lineTo(30, -360); ctx.quadraticCurveTo(36, -380, 60, -382); ctx.lineTo(176, -382); ctx.quadraticCurveTo(196, -378, 200, -350); ctx.lineTo(214, -220); ctx.lineTo(214, -100); ctx.closePath(); fillStroke(ctx, ARMY, 5);
  ctx.beginPath(); ctx.moveTo(70, -230); ctx.lineTo(70, -346); ctx.lineTo(172, -346); ctx.lineTo(186, -230); ctx.closePath(); fillStroke(ctx, '#BFD8E4', 4.5);
  if (o.driver) { ctx.save(); ctx.beginPath(); ctx.moveTo(70, -230); ctx.lineTo(70, -346); ctx.lineTo(172, -346); ctx.lineTo(186, -230); ctx.closePath(); ctx.clip(); o.driver(ctx); ctx.restore(); }
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.moveTo(140, -346); ctx.lineTo(166, -346); ctx.lineTo(110, -230); ctx.lineTo(84, -230); ctx.closePath(); ctx.fill();
  // hood + radiator
  ctx.beginPath(); ctx.moveTo(210, -250); ctx.lineTo(430, -238); ctx.quadraticCurveTo(452, -236, 454, -210); ctx.lineTo(456, -100); ctx.lineTo(210, -100); ctx.closePath(); fillStroke(ctx, shade(ARMY, 0.05), 5);
  ctx.strokeStyle = shade(ARMY, -0.3); ctx.lineWidth = 4; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(280 + i * 22, -220); ctx.lineTo(280 + i * 22, -170); ctx.stroke(); }
  rr(ctx, 448, -236, 22, 136, 6); fillStroke(ctx, '#3A3A36', 4);
  ell(ctx, 440, -196, 26, 22); fillStroke(ctx, '#F4E7B8', 4); // headlamp
  // fenders
  for (const wx of [300, -310]) { ctx.beginPath(); ctx.moveTo(wx - 120, -82); ctx.quadraticCurveTo(wx - 110, -190, wx, -192); ctx.quadraticCurveTo(wx + 110, -190, wx + 124, -82); ctx.lineTo(wx + 100, -82); ctx.quadraticCurveTo(wx + 90, -160, wx, -162); ctx.quadraticCurveTo(wx - 90, -160, wx - 96, -82); ctx.closePath(); fillStroke(ctx, shade(ARMY, -0.12), 5); }
  // running board, stencil
  rr(ctx, 20, -96, 200, 16, 4); fillStroke(ctx, '#2A2A28', 4);
  txt(ctx, 'ARMY', 122, -150, 34, '#F4ECD6');
  // spoked wheels
  for (const wx of [300, -310]) { ctx.save(); ctx.translate(wx, -76); ell(ctx, 0, 0, 78, 78); fillStroke(ctx, '#262624', 5); ell(ctx, 0, 0, 52, 52); fillStroke(ctx, '#8C7A52', 4);
    ctx.rotate(rot); ctx.strokeStyle = '#5E4E30'; ctx.lineWidth = 7; for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 12, Math.sin(a) * 12); ctx.lineTo(Math.cos(a) * 50, Math.sin(a) * 50); ctx.stroke(); }
    ell(ctx, 0, 0, 14, 14); fillStroke(ctx, '#3A3A36', 3.5); ctx.restore(); }
  ctx.restore();
}

// ---------- the wheatbelt (screen space): sky, sun, hills, windmill, farmhouse, fence, paddock, wheat rows ----------
// o: { hy (horizon y), px (camera pan, px), eaten 0..1, windmill, house, fence, dam: {x, y, w}, sun, wheat (rows), dusk, t }
function land(ctx, t, o = {}) {
  const hy = o.hy ?? 900, pxn = o.px || 0;
  let g = ctx.createLinearGradient(0, hy - 1100, 0, hy); g.addColorStop(0, o.dusk ? '#E9B07A' : '#F2CF8E'); g.addColorStop(1, SKY1); ctx.fillStyle = g; ctx.fillRect(0, 0, W, hy + 2);
  if (o.sun !== false) { const sx = 780 - pxn * 0.05, sy = hy - 360; LT_glow(ctx, sx, sy, 300, 'rgba(255,236,190,1)', 0.5); ell(ctx, sx, sy, 70, 70); ctx.fillStyle = '#FFF4D8'; ctx.fill(); }
  // clouds
  for (let i = 0; i < 4; i++) { const cx = ((i * 380 + t * 8 - pxn * 0.1) % 1500 + 1500) % 1500 - 200, cy = hy - 700 + (i % 2) * 140; ctx.fillStyle = 'rgba(255,252,242,0.85)'; for (let j = 0; j < 4; j++) { ell(ctx, cx + j * 50, cy - (j % 2) * 20, 70, 34); ctx.fill(); } }
  // far hills (parallax)
  ctx.save(); ctx.translate(-pxn * 0.15, 0); ctx.fillStyle = HILL; ctx.beginPath(); ctx.moveTo(-400, hy);
  for (let x = -400; x <= W + 600; x += 60) ctx.lineTo(x, hy - 40 - 30 * Math.sin(x * 0.004) - 18 * Math.sin(x * 0.011 + 1)); ctx.lineTo(W + 600, hy); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#9F9068'; for (let i = 0; i < 14; i++) { const x = -300 + i * 120 + hash(i) * 60; ell(ctx, x, hy - 30, 26 + hash(i + 3) * 18, 18); ctx.fill(); } // scrub
  ctx.restore();
  // ground
  g = ctx.createLinearGradient(0, hy, 0, H); g.addColorStop(0, '#D9B57A'); g.addColorStop(1, DIRT); ctx.fillStyle = g; ctx.fillRect(0, hy, W, H - hy);
  ctx.save(); ctx.translate(-pxn * 0.4, 0);
  if (o.house) farmhouse(ctx, o.house.x, hy + 10, o.house.s || 0.55);
  if (o.windmill) windmill(ctx, o.windmill.x, hy + 16, o.windmill.s || 0.6, t);
  ctx.restore();
  if (o.dam) dam(ctx, o.dam.x - pxn * 0.6, o.dam.y, o.dam.w);
  if (o.fence) { ctx.save(); ctx.translate(-pxn * 0.6, 0); const fy = hy + (o.fence.dy ?? 60); ctx.strokeStyle = '#6A4A2A'; ctx.lineWidth = 3; for (const dy of [-34, -16]) { ctx.beginPath(); ctx.moveTo(-200, fy + dy); ctx.lineTo(W + 600, fy + dy); ctx.stroke(); }
    for (let x = -200; x < W + 600; x += 120) { rr(ctx, x, fy - 50, 10, 54, 2); fillStroke(ctx, '#8A6440', 3); } ctx.restore(); }
  if (o.wheat !== false) wheat(ctx, t, hy + (o.wheatDy ?? 30), o.eaten || 0, pxn, o.rows || 9, o.wheatTop);
}
const LT_glow = (ctx, x, y, r, color, a) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.restore(); };
// rows of wheat from the horizon (y0) to the bottom; eaten: share of stalks bitten off (deterministic)
function wheat(ctx, t, y0, eaten, pxn, rows = 9, top = null) {
  for (let r = 0; r < rows; r++) {
    const d = r / (rows - 1), y = lerp(y0, H + 40, Math.pow(d, 1.6)), s = lerp(0.25, 1.8, d), par = lerp(0.6, 1.2, d);
    if (top && y < top) continue;
    const step = 34 * s, off = ((-pxn * par) % step + step) % step;
    ctx.lineCap = 'round';
    for (let x = -step + off, i = 0; x < W + step; x += step, i++) {
      const id = Math.floor((x + pxn * par) / step) * 31 + r * 977, gone = hash(id) < eaten, h = (110 + hash(id + 5) * 40) * s, sw = Math.sin(t * 1.4 + x * 0.01 + r) * 6 * s;
      ctx.strokeStyle = WHEATD; ctx.lineWidth = 4 * s; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + sw * 0.3, y - h * 0.5, x + (gone ? sw * 0.2 : sw), y - (gone ? h * 0.35 : h)); ctx.stroke();
      if (!gone) { ctx.save(); ctx.translate(x + sw, y - h); ctx.rotate(sw * 0.02); ell(ctx, 0, -14 * s, 9 * s, 24 * s); ctx.fillStyle = WHEAT; ctx.fill(); ctx.lineWidth = Math.max(1, 2.5 * s); ctx.strokeStyle = 'rgba(120,80,20,0.7)'; ctx.stroke();
        ctx.strokeStyle = WHEATD; ctx.lineWidth = 1.5 * s; ctx.beginPath(); ctx.moveTo(0, -36 * s); ctx.lineTo(0, -54 * s); ctx.stroke(); ctx.restore(); }
    }
  }
}
function windmill(ctx, x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = '#5A5A58'; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(-60, 0); ctx.lineTo(-10, -420); ctx.moveTo(60, 0); ctx.lineTo(10, -420); for (let i = 1; i < 6; i++) { const yy = -i * 70, w0 = lerp(60, 10, i / 6); ctx.moveTo(-w0, yy); ctx.lineTo(w0, yy); } ctx.stroke();
  ctx.translate(0, -440); ctx.save(); ctx.rotate(t * 1.2); for (let i = 0; i < 12; i++) { ctx.rotate(Math.PI / 6); ctx.beginPath(); ctx.moveTo(12, -8); ctx.lineTo(120, -18); ctx.lineTo(120, 18); ctx.lineTo(12, 8); ctx.closePath(); fillStroke(ctx, '#C9CCCC', 3); } ctx.restore();
  ell(ctx, 0, 0, 18, 18); fillStroke(ctx, '#7A7A78', 3); ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(-150, 0); ctx.lineTo(-170, -50); ctx.lineTo(-170, 50); ctx.lineTo(-150, 0); fillStroke(ctx, '#C9CCCC', 3);
  ctx.restore();
}
function farmhouse(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rr(ctx, -200, -220, 400, 220, 4); fillStroke(ctx, '#EADDC2', 5);
  ctx.beginPath(); ctx.moveTo(-240, -200); ctx.lineTo(0, -330); ctx.lineTo(240, -200); ctx.closePath(); fillStroke(ctx, '#B9BEC2', 5); // corrugated iron
  ctx.strokeStyle = 'rgba(80,90,100,0.4)'; ctx.lineWidth = 3; for (let i = -10; i <= 10; i++) { ctx.beginPath(); ctx.moveTo(i * 22, -200 - (10 - Math.abs(i)) * 0); ctx.lineTo(i * 6, -320 + Math.abs(i) * 2); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-230, -110); ctx.lineTo(230, -110); ctx.lineTo(250, -80); ctx.lineTo(-250, -80); ctx.closePath(); fillStroke(ctx, '#B9BEC2', 4); // veranda roof
  for (const px0 of [-230, -80, 80, 230]) { rr(ctx, px0 - 6, -84, 12, 84, 2); fillStroke(ctx, '#8A6440', 3); }
  rr(ctx, -150, -190, 70, 64, 3); fillStroke(ctx, '#4A6A7A', 4); rr(ctx, 80, -190, 70, 64, 3); fillStroke(ctx, '#4A6A7A', 4);
  ctx.restore();
}
function dam(ctx, x, y, w) { // a farm dam: earth bank + water
  ctx.save(); ctx.translate(x, y);
  ell(ctx, 0, 0, w * 0.6, w * 0.13); ctx.fillStyle = '#B7865A'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(23,23,23,0.5)'; ctx.stroke();
  ell(ctx, 0, 4, w * 0.5, w * 0.09); const g = ctx.createLinearGradient(0, -w * 0.09, 0, w * 0.09); g.addColorStop(0, '#7FA9B8'); g.addColorStop(1, '#5D8899'); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 4; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-w * 0.3 + i * w * 0.15, -w * 0.02 + (i % 2) * 14); ctx.lineTo(-w * 0.22 + i * w * 0.15, -w * 0.02 + (i % 2) * 14); ctx.stroke(); }
  ctx.restore();
}
// a crowd of emus (depth-sorted): list of {x, y (feet), s, phase, stride, peck, face (-1|1)}
function emuCrowd(ctx, list, base = {}) {
  [...list].sort((a, b) => a.y - b.y).forEach(e => { ctx.save(); ctx.translate(e.x, e.y); ctx.scale(e.s * (e.face || 1), e.s); emu(ctx, { ...base, ...e }); ctx.restore(); });
}

// ---------- the map of Australia (lon/lat outline), WA highlight and a pin ----------
const AUS = [[114.1,-21.8],[116.7,-20.6],[121.0,-19.5],[122.2,-17.9],[123.6,-16.4],[125.5,-14.5],[126.9,-13.9],[128.2,-15.0],[129.6,-14.9],[130.3,-12.7],[132.6,-11.5],[135.9,-12.0],[136.9,-12.3],[135.9,-13.4],[135.5,-14.9],[137.3,-16.2],[139.3,-17.4],[140.8,-17.4],[141.6,-15.0],[141.5,-12.6],[142.5,-10.7],[143.5,-12.8],[143.7,-14.4],[145.4,-14.9],[145.9,-17.0],[146.3,-19.0],[148.8,-20.4],[150.5,-22.6],[153.1,-25.3],[153.6,-28.6],[152.9,-31.4],[151.3,-33.9],[150.1,-36.2],[149.9,-37.5],[147.0,-38.0],[144.9,-37.9],[143.0,-38.8],[140.6,-38.0],[139.7,-37.1],[138.9,-35.6],[138.1,-34.2],[137.5,-33.3],[135.9,-34.8],[135.0,-33.6],[134.2,-32.6],[132.0,-32.0],[129.0,-31.6],[126.0,-32.3],[124.0,-33.6],[121.9,-33.8],[119.9,-34.3],[117.9,-35.1],[115.0,-34.3],[115.7,-33.3],[115.7,-31.7],[115.0,-30.0],[114.6,-28.5],[113.2,-26.2],[113.6,-24.5],[113.7,-22.6]];
const TAS = [[144.6,-40.7],[148.3,-40.9],[148.0,-43.2],[146.0,-43.6],[144.7,-41.5]];
const MK = 21, mp = (lon, lat) => [(lon - 133.5) * MK, (-lat - 26) * MK];
const CAMPION = mp(118.4, -31.0);
function ausMap(ctx, hl = 0, o = {}) {
  const path = pts => { ctx.beginPath(); pts.forEach(([a, b], i) => { const [x, y] = mp(a, b); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); };
  CL.cutout(ctx, () => path(AUS), '#E9D9B4', { elev: 1.6 }); CL.cutout(ctx, () => path(TAS), '#E9D9B4', { elev: 1.2 });
  if (hl > 0) { ctx.save(); path(AUS); ctx.clip(); const x1 = mp(129, 0)[0]; ctx.fillStyle = C.red; ctx.globalAlpha = hl; ctx.fillRect(-2000, -2000, x1 + 2000, 4000); ctx.restore();
    ctx.save(); ctx.globalAlpha = hl; ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 5); ctx.setLineDash([16, 10]); ctx.beginPath(); ctx.moveTo(mp(129, -14.9)[0], mp(129, -14.9)[1]); ctx.lineTo(mp(129, -31.6)[0], mp(129, -31.6)[1]); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.globalAlpha = hl; const [lx, ly] = mp(121.6, -22.6); fitTxt(ctx, 'WESTERN', lx, ly - 20, 36, '#FFFDF8', 230); fitTxt(ctx, 'AUSTRALIA', lx, ly + 22, 36, '#FFFDF8', 230); ctx.restore(); }
}
function pin(ctx, x, y, u) { if (u <= 0) return; ctx.save(); ctx.translate(x, y - (1 - E.out(clamp(u))) * 300); ell(ctx, 0, 6, 16, 6); ctx.fillStyle = 'rgba(40,20,10,0.35)'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-40, -60, -44, -110, 0, -112); ctx.bezierCurveTo(44, -110, 40, -60, 0, 0); ctx.closePath(); fillStroke(ctx, C.yellow, 5); ell(ctx, 0, -76, 16, 16); fillStroke(ctx, '#FFFDF8', 4); ctx.restore(); }

// ---------- paper props ----------
// a tear-off calendar card: top band text + big text; centre at (0, 0)
function calCard(ctx, top, big, o = {}) {
  const w = o.w || 420, h = o.h || 380;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 18), '#FFFDF8', { elev: o.elev ?? 1.8 });
  ctx.save(); rr(ctx, -w / 2, -h / 2, w, h, 18); ctx.clip(); ctx.fillStyle = C.red; ctx.fillRect(-w / 2, -h / 2, w, h * 0.27); ctx.restore();
  rr(ctx, -w / 2, -h / 2, w, h, 18); ctx.lineWidth = px(ctx, 5); ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2 + h * 0.27); ctx.lineTo(w / 2, -h / 2 + h * 0.27); ctx.stroke();
  for (const sx of [-1, 1]) { rr(ctx, sx * w * 0.28 - 10, -h / 2 - 26, 20, 50, 8); fillStroke(ctx, '#B9BEC2', 4); }
  fitTxt(ctx, top, 0, -h / 2 + h * 0.19, h * 0.15, '#FFFDF8', w - 50);
  fitTxt(ctx, big, 0, h * 0.27, o.bigSize || h * 0.42, INK, w - 50);
}
// ammo crate (side), base at 0; lid 0..1 opens
function crate(ctx, lid = 0, label = '') {
  ctx.save(); K.contact(ctx, 0, 0, 320, 24, 0.4);
  CL.cutout(ctx, () => rr(ctx, -280, -250, 560, 250, 10), '#7E8A56', { elev: 1.4 });
  ctx.strokeStyle = shade('#7E8A56', -0.35); ctx.lineWidth = 5; for (const y of [-180, -90]) { ctx.beginPath(); ctx.moveTo(-280, y); ctx.lineTo(280, y); ctx.stroke(); }
  for (const x of [-230, 230]) { rr(ctx, x - 22, -250, 44, 250, 4); fillStroke(ctx, shade('#7E8A56', -0.15), 4); }
  if (label) fitTxt(ctx, label, 0, -112, 56, '#F4ECD6', 390);
  ctx.save(); ctx.translate(-280, -250); ctx.rotate(-1.9 * E.out(clamp(lid))); rr(ctx, 0, -40, 560, 40, 8); fillStroke(ctx, shade('#7E8A56', 0.08), 5); ctx.restore();
  ctx.restore();
}
// cartridges standing in the crate (drawn above the crate's top edge)
function rounds(ctx, n, u) { for (let i = 0; i < n; i++) { const x = -240 + i * (480 / (n - 1)), up = E.out(clamp(u * 1.6 - i / n * 0.6)) * 60; ctx.save(); ctx.translate(x, -250 - up + 60);
  rr(ctx, -9, -70, 18, 70, 3); fillStroke(ctx, '#D9A43A', 3); ctx.beginPath(); ctx.moveTo(-8, -70); ctx.quadraticCurveTo(0, -100, 8, -70); ctx.closePath(); fillStroke(ctx, '#B8743A', 3); ctx.restore(); } }
// the Major's typed report: lines [[label, value, shown 0..1]]
function report(ctx, lines, o = {}) {
  const w = o.w || 820, h = o.h || 900;
  ctx.save(); ctx.rotate(o.rot ?? -0.02);
  CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 8), '#FBF6EA', { elev: 1.8 });
  ctx.strokeStyle = 'rgba(80,110,160,0.2)'; ctx.lineWidth = 2; for (let y = -h / 2 + 200; y < h / 2 - 20; y += 50) { ctx.beginPath(); ctx.moveTo(-w / 2 + 30, y); ctx.lineTo(w / 2 - 30, y); ctx.stroke(); }
  txt(ctx, 'REPORT', 0, -h / 2 + 90, 70, INK, 'center', TYPE);
  fitTxt(ctx, 'MAJOR G.P.W. MEREDITH · DEC 1932', 0, -h / 2 + 150, 34, '#4A4A48', w - 80, 'center', TYPE);
  lines.forEach(([a, b, u], i) => { if (u <= 0) return; const y = -h / 2 + 300 + i * 190; ctx.save(); ctx.globalAlpha *= clamp(u * 3);
    fitTxt(ctx, a, -w / 2 + 50, y, 46, INK, w * 0.55, 'left', TYPE);
    ctx.translate(w / 2 - 170, y - 16); const s = E.back(clamp(u), 2.2); ctx.scale(s, s); ctx.rotate(-0.04);
    ctx.font = `92px ${F.black}`; const ww = ctx.measureText(b).width + 40; CL.cutout(ctx, () => rr(ctx, -ww / 2, -64, ww, 112, 12), i === 0 ? C.red : C.yellow, { elev: 1.2 }); txt(ctx, b, 0, 32, 92, i === 0 ? '#FFFDF8' : INK); ctx.restore(); });
  if (o.note) fitTxt(ctx, o.note, 0, h / 2 - 50, 30, '#6A6A68', w - 80, 'center', TYPE);
  ctx.restore();
}
// a pound note (Australian pound, 1930s), centred; no amount on it
function pound(ctx, s = 1, o = {}) {
  ctx.save(); ctx.scale(s, s); ctx.rotate(o.rot || 0);
  CL.cutout(ctx, () => rr(ctx, -170, -82, 340, 164, 10), '#CFE3C6', { elev: o.elev ?? 1.4 });
  ctx.lineWidth = px(ctx, 3); ctx.strokeStyle = '#3D7A5A'; rr(ctx, -152, -66, 304, 132, 8); ctx.stroke();
  ell(ctx, 60, 0, 44, 52); ctx.fillStyle = '#B9D6AE'; ctx.fill(); ctx.stroke();
  txt(ctx, '£', -70, 30, 96, '#2F6A4A'); txt(ctx, '£', 60, 22, 56, '#2F6A4A');
  ctx.restore();
}
// claim slip ("BOUNTY CLAIM"), centred
function slip(ctx, s = 1, rot = 0, n = 0) {
  ctx.save(); ctx.scale(s, s); ctx.rotate(rot);
  CL.cutout(ctx, () => rr(ctx, -150, -90, 300, 180, 6), n % 3 === 1 ? '#F7EFDA' : '#FFFDF8', { elev: 0.8 });
  txt(ctx, 'BOUNTY CLAIM', 0, -46, 30, INK, 'center', TYPE); ctx.strokeStyle = 'rgba(23,23,23,0.45)'; ctx.lineWidth = 3;
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-120, -6 + i * 34); ctx.lineTo(120 - (i === 2 ? 90 : 0), -6 + i * 34); ctx.stroke(); }
  ctx.restore();
}
// the bounty notice on a fence post board
function poster(ctx, o = {}) {
  CL.cutout(ctx, () => rr(ctx, -300, -380, 600, 760, 8), '#F4E9CC', { elev: 1.6 });
  txt(ctx, 'NOTICE', 0, -270, 56, INK, 'center', TYPE);
  ctx.fillStyle = C.red; ctx.fillRect(-250, -230, 500, 120); fitTxt(ctx, 'EMU BOUNTY', 0, -145, 84, '#FFFDF8', 470);
  fitTxt(ctx, 'CASH PAID', 0, -20, 66, INK, 500); fitTxt(ctx, 'PER BIRD', 0, 60, 66, INK, 500);
  ctx.strokeStyle = 'rgba(23,23,23,0.4)'; ctx.lineWidth = 3; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-220, 140 + i * 44); ctx.lineTo(220 - (i % 2) * 80, 140 + i * 44); ctx.stroke(); }
  for (const [x, y] of [[-270, -350], [270, -350], [-270, 350], [270, 350]]) { ell(ctx, x, y, 9, 9); fillStroke(ctx, '#9A9EA2', 3); }
}
// pay envelope with notes peeking out
function payEnv(ctx, s = 1, notes = 1) {
  ctx.save(); ctx.scale(s, s);
  if (notes > 0) { for (let i = 0; i < 3; i++) { ctx.save(); ctx.translate(-40 + i * 40, -60 - notes * (40 + i * 18)); ctx.rotate(-0.15 + i * 0.12); pound(ctx, 0.8, { elev: 0.6 }); ctx.restore(); } }
  CL.cutout(ctx, () => rr(ctx, -230, -130, 460, 260, 10), '#E9CF98', { elev: 1.8 });
  ctx.beginPath(); ctx.moveTo(-230, -130); ctx.lineTo(0, 10); ctx.lineTo(230, -130); ctx.lineWidth = px(ctx, 4); ctx.strokeStyle = 'rgba(23,23,23,0.6)'; ctx.stroke();
  ctx.fillStyle = C.red; ctx.fillRect(-150, 40, 300, 70); txt(ctx, 'PAY', 0, 96, 64, '#FFFDF8');
  ctx.restore();
}
// red X slapped over something (local units, centre 0,0)
function bigX(ctx, r, u) { if (u <= 0) return; ctx.save(); const s = E.back(clamp(u), 2); ctx.scale(s, s); ctx.lineCap = 'round';
  for (const [a, b] of [[[-r, -r], [r, r]], [[r, -r], [-r, r]]]) { ctx.lineWidth = r * 0.34; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); ctx.lineWidth = r * 0.24; ctx.strokeStyle = C.red; ctx.stroke(); } ctx.restore(); }
// rubber-stamp word (red outline box), centre (0,0)
function stampWord(ctx, s, size, u, col = C.red, rot = -0.12) {
  if (u <= 0) return; ctx.save(); ctx.rotate(rot); const k = lerp(1.8, 1, E.out(clamp(u * 1.6))); ctx.scale(k, k); ctx.globalAlpha *= clamp(u * 3) * 0.95;
  ctx.font = `${size}px ${F.black}`; const w = ctx.measureText(s).width + size * 0.7; ctx.strokeStyle = col; ctx.lineWidth = size * 0.12; rr(ctx, -w / 2, -size * 0.78, w, size * 1.28, size * 0.16); ctx.stroke();
  txt(ctx, s, 0, size * 0.34, size, col); ctx.restore();
}

module.exports = { W, H, txt, fitTxt, TYPE, SOL, SOL2, MAJOR, FARMER, HAT_ARMY, HAT_FARM, KHAKI, WHEAT, WHEATD, DIRT, FEATH, EMUSKIN, ARMY,
  hatSide, hatFront, person, personBust, emu, emuFace, emuEye, lewisGun, truck, land, wheat, windmill, farmhouse, dam, emuCrowd, ausMap, pin, CAMPION, mp,
  calCard, crate, rounds, report, pound, slip, poster, payEnv, bigX, stampWord };
