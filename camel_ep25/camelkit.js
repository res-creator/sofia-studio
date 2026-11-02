// Episode 25 "More Doctors Smoke Camels" (USA, 1946) — props and sets on howitsrun_style (style reference lawnchair_ep17 / emu_ep12).
// Generic re-enactment: brand names only as plain text, no logos, no portraits. NO smoking, no lit cigarettes, no smoke — sealed packs only.
// World space: floor at y = 0, up is negative.
const { createCanvas } = require('@napi-rs/canvas');
const K = require('../tests/mcd_collage/kit');
const R = require('../hirkit/rig');
const CL = require('../hirkit/collage');
const ST = require('../howitsrun_style/style');
const P = require('../howitsrun_style/people');
const SE = require('../howitsrun_style/sets');
const { C, F, clamp, lerp, E, rr, hash } = K;
const { INK, fillStroke, ell, px, tube, shade } = R;
const { txt, fitTxt, PAL } = ST;
const CS = require('./cast');
const SLOGAN = ['MORE DOCTORS', 'SMOKE CAMELS', 'THAN ANY OTHER', 'CIGARETTE'];

// ---------- the ad art: the doctor (front bust) holding up a sealed pack; centred at the bust base (0, 0) ----------
function adDoctor(ctx, s = 1, face = R.expr('smile', { look: [0, 0] })) {
  ctx.save(); ctx.scale(s, s);
  P.personBust(ctx, 0, 0, 1, CS.DOCTOR, { face });
  // stethoscope on the bust
  ctx.lineCap = 'round'; ctx.lineWidth = 9; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(-50, -10); ctx.bezierCurveTo(-60, 120, 60, 120, 50, -10); ctx.stroke(); ctx.lineWidth = 5; ctx.strokeStyle = '#3A3A44'; ctx.stroke();
  ctx.lineWidth = 9; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(0, 96); ctx.lineTo(0, 170); ctx.stroke(); ctx.lineWidth = 5; ctx.strokeStyle = '#3A3A44'; ctx.stroke(); ell(ctx, 0, 182, 18, 18); fillStroke(ctx, '#C9CED6', 4);
  // head mirror
  ctx.save(); ctx.translate(0, -112); ctx.lineWidth = 9; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(-76, -40); ctx.quadraticCurveTo(0, -70, 76, -40); ctx.stroke(); ctx.lineWidth = 5; ctx.strokeStyle = '#4A4F57'; ctx.stroke(); ell(ctx, 0, -66, 26, 26); fillStroke(ctx, '#DDE6EE', 4); ell(ctx, -6, -72, 8, 8); ctx.fillStyle = '#FFF'; ctx.fill(); ctx.restore();
  // the hand holding the sealed pack up beside the face
  ctx.save(); ctx.translate(150, -80); CS.pack(ctx, 1.25, 0.08); ctx.restore();
  R.hand(ctx, [130, -20], -1.45, CS.DOCTOR.skin, 'hold', { size: 1.3 });
  tube(ctx, [[150, 160], [132, 10]], 44, '#F7F7F2', 5);
  ctx.restore();
}
// ---------- the street billboard (posts on the floor, panel ~1000 x 640 at s = 1, centre-bottom at (0, 0)) ----------
function billboard(ctx, t, s = 1, o = {}) {
  ctx.save(); ctx.scale(s, s);
  for (const x of [-360, 360]) { rr(ctx, x - 16, -560, 32, 560, 6); fillStroke(ctx, '#8A5A34', 5); }
  ctx.save(); ctx.translate(0, -870);
  CL.cutout(ctx, () => rr(ctx, -520, -330, 1040, 640, 10), '#FFF3D6', { elev: 2 });
  ctx.save(); rr(ctx, -520, -330, 1040, 640, 10); ctx.clip();
  ctx.fillStyle = '#F3D9A0'; ctx.fillRect(-520, -330, 1040, 640); LT_glow(ctx, -230, -40, 380);
  ctx.save(); ctx.translate(-330, 250); adDoctor(ctx, 2.05, o.face); ctx.restore();
  ctx.restore();
  // slogan block on the right, plain text
  SLOGAN.forEach((l, i) => fitTxt(ctx, l, 290, -190 + i * 92, i === 1 ? 78 : 62, i === 1 ? C.red : INK, 400));
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 6); rr(ctx, -520, -330, 1040, 640, 10); ctx.stroke();
  fitTxt(ctx, '*ACCORDING TO A NATIONWIDE SURVEY', 290, 230, 24, '#6A5A40', 400, 'center', ST.FONT.type);
  ctx.restore(); ctx.restore();
}
function LT_glow(ctx, x, y, r) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(255,255,240,0.9)'); g.addColorStop(1, 'rgba(255,255,240,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
// ---------- a 1940s street (sky, road, simple brick buildings), floor y = 0 ----------
function street(ctx, t) {
  SE.sky(ctx, t, { clouds: 3, hills: false });
  for (let i = 0; i < 8; i++) { const x = -2200 + i * 560, h = 700 + hash(i + 3) * 400; rr(ctx, x, -h, 500, h, 4); fillStroke(ctx, ['#C9876A', '#B7A58A', '#9E7A64', '#D2B48C'][i % 4], 5);
    for (let r = 0; r < Math.floor(h / 170) - 1; r++) for (let c = 0; c < 3; c++) { rr(ctx, x + 50 + c * 150, -h + 70 + r * 170, 90, 110, 4); fillStroke(ctx, '#BFD8EA', 3.5); } }
  SE.ground(ctx, 'road');
}
// ---------- the 1946 newspaper spread (centred, 960 x 1300 at s = 1); w = which slogan words are visible (0..4) ----------
function newspaper(ctx, t, o = {}) {
  const w = 960, h = 1300;
  ctx.save(); ctx.rotate(o.rot ?? -0.015);
  CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 6), '#F1EADA', { elev: 2 });
  fitTxt(ctx, 'THE DAILY HERALD', 0, -h / 2 + 110, 92, INK, w - 80, 'center', 'serif');
  ctx.fillStyle = INK; ctx.fillRect(-w / 2 + 40, -h / 2 + 140, w - 80, 6); ctx.fillRect(-w / 2 + 40, -h / 2 + 200, w - 80, 3);
  fitTxt(ctx, 'USA · 1946 · FIVE CENTS', 0, -h / 2 + 182, 30, '#4A4A48', w - 80, 'center', ST.FONT.type);
  // columns of grey text
  ctx.fillStyle = 'rgba(40,40,40,0.25)'; for (let c = 0; c < 2; c++) for (let i = 0; i < 26; i++) ctx.fillRect(-w / 2 + 40 + c * 200, -h / 2 + 240 + i * 38, 170 - (hash(i + c * 30) * 50), 10);
  // the ad box
  ctx.save(); ctx.translate(140, 60); const aw = 560, ah = 1040;
  rr(ctx, -aw / 2, -ah / 2, aw, ah, 4); fillStroke(ctx, '#FBF4E2', 5); ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.strokeRect(-aw / 2 + 14, -ah / 2 + 14, aw - 28, ah - 28);
  ctx.save(); rr(ctx, -aw / 2 + 16, -ah / 2 + 16, aw - 32, ah - 32, 2); ctx.clip(); ctx.translate(-90, 420); adDoctor(ctx, 2.1, o.face); ctx.restore();
  const n = o.words ?? 4; const k = o.wordsU || [1, 1, 1, 1];
  for (let i = 0; i < Math.min(n, 4); i++) { const u = k[i]; if (u <= 0) continue; ctx.save(); ctx.translate(0, -ah / 2 + 100 + i * 78); const sc = E.back(clamp(u), 2); ctx.scale(sc, sc);
    ctx.font = `${i === 1 ? 64 : 54}px ${F.black}`; const tw = Math.min(ctx.measureText(SLOGAN[i]).width + 30, aw - 30); ctx.fillStyle = '#FBF4E2'; ctx.fillRect(-tw / 2, -50, tw, 66);
    fitTxt(ctx, SLOGAN[i], 0, 0, i === 1 ? 64 : 54, i === 1 ? C.red : INK, aw - 60); ctx.restore(); }
  if (o.foot) { ctx.fillStyle = '#FBF4E2'; ctx.fillRect(-aw / 2 + 20, ah / 2 - 80, aw - 40, 60); fitTxt(ctx, '*SURVEY OF 113,597 DOCTORS', 0, ah / 2 - 40, 34, '#4A3A20', aw - 60, 'center', ST.FONT.type); }
  ctx.restore();
  ctx.restore();
}
// ---------- magnifying glass (lens centre at 0, 0) ----------
function magnifier(ctx, r = 150) {
  tube(ctx, [[r * 0.7, r * 0.7], [r * 1.6, r * 1.6]], 36, '#6A4024', 5);
  ell(ctx, 0, 0, r, r); ctx.fillStyle = 'rgba(200,230,255,0.25)'; ctx.fill(); ctx.lineWidth = px(ctx, 22); ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = px(ctx, 12); ctx.strokeStyle = '#9AA0A8'; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(0, 0, r * 0.75, 3.6, 4.3); ctx.stroke();
}
// ---------- a cached tiny doctor (for the 113,597 crowd grid) ----------
const SPR = {};
function docSprite(i) {
  if (SPR[i]) return SPR[i]; const cv = createCanvas(260, 660), c = cv.getContext('2d');
  CS.doctor(c, 130, 640, 1, i % 2 ? -1 : 1, CS.DOCS[i % 5], { face: R.expr(['smile', 'neutral', 'smile', 'skeptical', 'grin'][i % 5], { look: [1, 0] }) });
  return (SPR[i] = cv);
}
// ---------- a hallway door with a frosted glass window and a name on the glass (centre-bottom at 0, 0) ----------
function glassDoor(ctx, name, sub, o = {}) {
  rr(ctx, -200, -720, 400, 720, 8); fillStroke(ctx, o.col || '#8A5A34', 5);
  rr(ctx, -160, -670, 320, 300, 6); fillStroke(ctx, '#DCE6EE', 5);
  fitTxt(ctx, name, 0, -545, 56, INK, 290); if (sub) fitTxt(ctx, sub, 0, -470, 30, '#4A4A48', 290, 'center', ST.FONT.type);
  rr(ctx, -160, -330, 320, 270, 6); fillStroke(ctx, shade(o.col || '#8A5A34', -0.1), 4);
  ell(ctx, 160, -330, 16, 16); fillStroke(ctx, C.yellow, 3);
}
// ---------- the convention hall (floor y = 0): banner, flags, booth with cartons ----------
function hall(ctx, t, o = {}) {
  SE.room(ctx, t, { wall: '#E6DCC6', floor: 'tile' });
  for (let i = -3; i <= 3; i++) { ctx.fillStyle = i % 2 ? '#4D8DFF' : C.red; ctx.beginPath(); ctx.moveTo(i * 420 - 60, -1300); ctx.lineTo(i * 420 + 60, -1300); ctx.lineTo(i * 420, -1180); ctx.closePath(); ctx.fill(); ctx.lineWidth = px(ctx, 4); ctx.strokeStyle = INK; ctx.stroke(); }
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 4); ctx.beginPath(); ctx.moveTo(-1600, -1300); ctx.lineTo(1600, -1300); ctx.stroke();
  if (o.banner !== false) { CL.cutout(ctx, () => rr(ctx, -560, -1100, 1120, 190, 14), PAL.navy, { elev: 1.4 }); fitTxt(ctx, 'MEDICAL CONVENTION', 0, -978, 90, PAL.cream, 1040); }
}
// the booth: a table with stacked sealed cartons and a "FREE" sign; centre-bottom at (0, 0)
function booth(ctx, n = 6, sign = 1) {
  rr(ctx, -330, -300, 660, 40, 8); fillStroke(ctx, '#8A5A34', 5); rr(ctx, -310, -260, 620, 260, 6); fillStroke(ctx, '#F4EEDF', 5);
  ctx.fillStyle = C.red; ctx.fillRect(-310, -240, 620, 30); ctx.lineWidth = px(ctx, 4); ctx.strokeStyle = INK; ctx.strokeRect(-310, -240, 620, 30);
  for (let i = 0; i < n; i++) { ctx.save(); ctx.translate(-150 + (i % 2) * 300 * 0.0 + (i % 2 ? 140 : -60), -330 - Math.floor(i / 2) * 64); CS.carton(ctx, 0.62, { elev: 0.6 }); ctx.restore(); }
  if (sign > 0) { ctx.save(); ctx.translate(0, -160); ctx.scale(sign, sign); CL.cutout(ctx, () => rr(ctx, -150, -54, 300, 96, 10), C.yellow, { elev: 1 }); txt(ctx, 'FREE', 0, 26, 76, INK); ctx.restore(); }
}
// ---------- a doctor's office corridor (floor y = 0) ----------
function office(ctx, t) { SE.room(ctx, t, { wall: '#DCE6EE', floor: 'wood', window: -700 }); }
// ---------- the medical journal (spine at x = 0, cover w x h); open 0 (closed) .. 1 (spread); bills 0..1 poke out of the pages ----------
function journal(ctx, o = {}) {
  const w = o.w || 520, h = o.h || 720, u = clamp(o.open || 0), title = o.title || 'MEDICAL JOURNAL', sub = o.sub || 'FOR PHYSICIANS · 1948', col = o.col || '#2E6E8E';
  const page = (side) => { ctx.save(); ctx.scale(side, 1); rr(ctx, 0, -h / 2, w, h, 6); fillStroke(ctx, '#FBF6EA', 4); ctx.restore(); };
  const cover = () => { CL.cutout(ctx, () => rr(ctx, 0, -h / 2, w, h, 8), col, { elev: 1.6, tex: 0.4 }); rr(ctx, 30, -h / 2 + 40, w - 60, 150, 6); fillStroke(ctx, PAL.cream, 4);
    fitTxt(ctx, title, w / 2, -h / 2 + 118, title.length < 6 ? 110 : 56, INK, w - 100); fitTxt(ctx, sub, w / 2, -h / 2 + 172, 24, '#4A4A48', w - 100, 'center', ST.FONT.type);
    ctx.save(); ctx.translate(w / 2, 60); ctx.fillStyle = PAL.cream; ctx.fillRect(-30, -110, 60, 220); ctx.fillRect(-110, -30, 220, 60); ctx.restore();
    if (o.cover2) fitTxt(ctx, o.cover2, w / 2, h / 2 - 50, 30, PAL.cream, w - 80, 'center', ST.FONT.type); };
  const spreadL = () => { ctx.save(); ctx.scale(-1, 1); rr(ctx, 0, -h / 2, w, h, 6); fillStroke(ctx, '#FBF6EA', 4); ctx.restore();
    ctx.fillStyle = 'rgba(40,40,40,0.25)'; for (let i = 0; i < 18; i++) ctx.fillRect(-w + 40, -h / 2 + 60 + i * 34, w - 90 - hash(i) * 60, 10); };
  const adPage = () => { rr(ctx, 0, -h / 2, w, h, 6); fillStroke(ctx, '#FBF6EA', 4); rr(ctx, 30, -h / 2 + 30, w - 60, h - 60, 4); fillStroke(ctx, '#F3D9A0', 3);
    fitTxt(ctx, 'ADVERTISEMENT', w / 2, -h / 2 + 80, 30, '#6A5A40', w - 100, 'center', ST.FONT.type);
    ctx.save(); ctx.translate(w / 2, -20); for (let i = 0; i < 3; i++) { ctx.save(); ctx.translate((i - 1) * 110, 0); CS.pack(ctx, 1.5, (i - 1) * 0.1); ctx.restore(); } ctx.restore();
    fitTxt(ctx, 'CIGARETTE AD', w / 2, h / 2 - 110, 44, C.red, w - 100); };
  if (u < 0.5) { adPage(); ctx.save(); ctx.scale(1 - 2 * u, 1); cover(); ctx.restore(); }
  else { adPage(); ctx.save(); ctx.scale(2 * u - 1, 1); spreadL(); ctx.restore(); }
  if (o.bills > 0) for (let i = 0; i < 5; i++) { const b = clamp(o.bills * 1.6 - i * 0.15); if (b <= 0) continue; ctx.save(); ctx.translate(lerp(0, 40 + (i % 3) * 30, b), -h / 2 + 120 + i * 120); ctx.rotate(-0.5 + i * 0.22 + (1 - b) * 0.2); ctx.translate(lerp(0, 160, E.out(b)), 0); CL.bill(ctx, 0.6, { elev: 1 }); ctx.restore(); }
  // spine
  ctx.fillStyle = shade(col, -0.3); ctx.fillRect(-6, -h / 2, 12, h);
}
// ---------- coat rack with the white coat, stethoscope and bills in the pocket (floor at 0); money 0..1 ----------
function coatRack(ctx, money = 0, t = 0) {
  tube(ctx, [[0, 0], [0, -1250]], 30, '#6A4024', 5); ell(ctx, 0, -10, 170, 26); fillStroke(ctx, '#6A4024', 5);
  tube(ctx, [[0, -1200], [90, -1260]], 14, '#6A4024', 4); tube(ctx, [[0, -1200], [-90, -1260]], 14, '#6A4024', 4);
  ctx.save(); ctx.translate(0, -1170); ctx.rotate(Math.sin(t * 1.3) * 0.015);
  // hanger
  ctx.lineWidth = px(ctx, 8); ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(-170, 60); ctx.lineTo(0, 0); ctx.lineTo(170, 60); ctx.closePath(); ctx.stroke();
  // the coat
  const coat = () => { ctx.beginPath(); ctx.moveTo(-60, 10); ctx.lineTo(-190, 70); ctx.lineTo(-240, 640); ctx.lineTo(-170, 660); ctx.lineTo(-150, 330); ctx.lineTo(-170, 760); ctx.lineTo(170, 760); ctx.lineTo(150, 330); ctx.lineTo(170, 660); ctx.lineTo(240, 640); ctx.lineTo(190, 70); ctx.lineTo(60, 10); ctx.lineTo(0, 200); ctx.closePath(); };
  coat(); fillStroke(ctx, '#F7F7F2', 6); ctx.save(); coat(); ctx.clip(); ctx.fillStyle = 'rgba(0,0,0,0.07)'; ctx.fillRect(-260, 0, 120, 800); ctx.restore();
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 4); ctx.beginPath(); ctx.moveTo(0, 200); ctx.lineTo(0, 760); ctx.moveTo(-60, 10); ctx.lineTo(-10, 300); ctx.moveTo(60, 10); ctx.lineTo(10, 300); ctx.stroke();
  for (const y of [360, 470, 580]) { ell(ctx, 18, y, 9, 9); fillStroke(ctx, '#C9CED6', 3); }
  // stethoscope over the shoulder
  ctx.lineCap = 'round'; ctx.lineWidth = 10; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(-100, 40); ctx.bezierCurveTo(-140, 220, -60, 260, -40, 160); ctx.moveTo(-100, 40); ctx.bezierCurveTo(-110, 160, -130, 260, -120, 330); ctx.stroke(); ctx.lineWidth = 6; ctx.strokeStyle = '#3A3A44'; ctx.stroke(); ell(ctx, -120, 344, 18, 18); fillStroke(ctx, '#C9CED6', 4);
  // bills from the pocket (drawn behind the pocket front)
  for (let i = 0; i < 4; i++) { const b = clamp(money * 1.5 - i * 0.15); if (b <= 0) continue; ctx.save(); ctx.translate(110 + (i - 1.5) * 24, 540 - E.back(b, 1.6) * (110 + i * 18)); ctx.rotate(-0.35 + i * 0.22); CL.bill(ctx, 0.5, { elev: 0.8 }); ctx.restore(); }
  rr(ctx, 40, 520, 140, 120, 8); fillStroke(ctx, '#ECECE4', 5);
  ctx.restore();
}
// ---------- the big counter plate (centred): value shown with commas ----------
function counter(ctx, v, u = 1, o = {}) {
  if (u <= 0) return; ctx.save(); const s = E.back(clamp(u), 2); ctx.scale(s, s); ctx.rotate(o.rot ?? -0.02);
  const str = Math.round(v).toLocaleString('en-US'); CL.cutout(ctx, () => rr(ctx, -400, -110, 800, 200, 22), C.red, { elev: 2 }); fitTxt(ctx, str, 0, 40, 140, PAL.cream, 740);
  ctx.restore();
}

module.exports = { CS, SLOGAN, adDoctor, billboard, street, newspaper, magnifier, docSprite, glassDoor, hall, booth, office, journal, coatRack, counter };
