// Episode 25 "More Doctors Smoke Camels" (USA, 1946) — the cast in the channel style (howitsrun_style/): the doctor (white coat +
// stethoscope, head mirror), the ad-agency man (1940s suit + fedora), a few doctor variations, and the sealed props (plain pack, carton).
// Generic re-enactment people (no likenesses). NO smoking, no lit cigarettes, no smoke: only sealed packs / cartons without logos.
const K = require('../tests/mcd_collage/kit'); const R = require('../hirkit/rig'); const CL = require('../hirkit/collage');
const ST = require('../howitsrun_style/style'); const P = require('../howitsrun_style/people');
const { C, rr } = K; const { fillStroke, ell, tube, INK, shade } = R;

// ---------- looks ----------
const DOCTOR = { skin: '#F0C3A2', hair: '#9A9A98', hairStyle: 'short', top: '#F7F7F2', cuff: '#E2E2DA', shirt: '#BFD4F2', pants: '#4A4F57', shoes: '#171717', iris: '#3A5A7A', brow: '#7A7A78', glasses: 1 };
const AGENT = { skin: '#E8B48F', hair: '#2A1E16', hairStyle: 'short', top: '#6B5A48', cuff: '#594A3A', shirt: '#FFFDF8', pants: '#5E4F3F', shoes: '#3A2416', sole: '#1E140C', iris: '#3A2414', brow: '#2A1A10' };
// doctor variations (clothes / hair only): the crowd at the convention
const DOCS = [DOCTOR,
  { ...DOCTOR, skin: '#C98E66', hair: '#2A1A10', glasses: 0, iris: '#3A2414', brow: '#2A1A10', pants: '#3E4F78' },
  { ...DOCTOR, skin: '#E8B48F', hair: '#7A4A2A', glasses: 0, shirt: '#E9D36A', pants: '#4A4A50' },
  { ...DOCTOR, skin: '#F0C3A2', hair: '#D9B26A', hairStyle: 'bun', glasses: 0, lashes: 1, lips: '#B2524A', brow: '#9A7A4A' },
  { ...DOCTOR, skin: '#8D5A3C', hair: '#1E1612', glasses: 1, pants: '#2E3A59', brow: '#1E1612' }];

// ---------- accessories (drawn after the figure, in figure space) ----------
function stethoscope(ctx, r, lean = 0) {   // draped round the neck, chest piece on the front of the coat
  ctx.save(); ctx.translate(r.neck[0], r.neck[1]); ctx.rotate(lean);
  ctx.lineCap = 'round'; ctx.lineWidth = 9; ctx.strokeStyle = INK; const path = () => { ctx.beginPath(); ctx.moveTo(-18, -6); ctx.bezierCurveTo(-30, 60, 10, 70, 24, 40); ctx.moveTo(30, -10); ctx.bezierCurveTo(56, 40, 40, 90, 34, 118); };
  path(); ctx.stroke(); ctx.lineWidth = 5; ctx.strokeStyle = '#3A3A44'; path(); ctx.stroke();
  ell(ctx, 34, 128, 13, 13); fillStroke(ctx, '#C9CED6', 4);
  ctx.restore();
}
function headMirror(ctx, r, P0 = {}) {   // the 1940s doctor's head mirror on a band
  ctx.save(); ctx.translate(r.hd[0], r.hd[1]); ctx.rotate((P0.headTilt || 0) + (P0.lean || 0) * 0.3);
  ctx.lineWidth = 9; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(-74, -40); ctx.quadraticCurveTo(0, -78, 72, -56); ctx.stroke(); ctx.lineWidth = 5; ctx.strokeStyle = '#4A4F57'; ctx.stroke();
  ctx.save(); ctx.translate(46, -66); ctx.rotate(0.5); ell(ctx, 0, 0, 13, 24); fillStroke(ctx, '#DDE6EE', 4); ell(ctx, -2, -6, 4, 9); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.restore();
  ctx.restore();
}
function fedora(ctx, r, P0 = {}, col = '#4A3A2C', band = '#1E140C') {   // the ad man's hat, side view
  ctx.save(); ctx.translate(r.hd[0], r.hd[1]); ctx.rotate((P0.headTilt || 0) + (P0.lean || 0) * 0.3);
  const crown = () => { ctx.beginPath(); ctx.moveTo(-64, -62); ctx.bezierCurveTo(-66, -112, -30, -122, 0, -108); ctx.quadraticCurveTo(26, -124, 58, -110); ctx.bezierCurveTo(68, -96, 68, -78, 66, -60); ctx.closePath(); };
  crown(); fillStroke(ctx, col, 5); ctx.save(); crown(); ctx.clip(); ctx.fillStyle = band; ctx.fillRect(-90, -80, 180, 18); ctx.restore();
  ctx.beginPath(); ctx.moveTo(-96, -56); ctx.quadraticCurveTo(0, -74, 104, -66); ctx.quadraticCurveTo(112, -58, 100, -52); ctx.quadraticCurveTo(0, -56, -90, -46); ctx.quadraticCurveTo(-104, -48, -96, -56); ctx.closePath(); fillStroke(ctx, shade(col, -0.1), 5);
  ctx.restore();
}
// the doctor: P.person + stethoscope (+ head mirror for the main doctor)
function doctor(ctx, x, y, s, facing, L, Pz = {}, o = {}) {
  const r = P.person(ctx, x, y, s, facing, L, Pz, {});
  ctx.save(); ctx.translate(x, y); ctx.scale(s * facing, s); stethoscope(ctx, r, Pz.lean || 0); if (o.mirror) headMirror(ctx, r, Pz); ctx.restore(); return r;
}
// the ad-agency man: P.person + tie + fedora
function adman(ctx, x, y, s, facing, L, Pz = {}, o = {}) {
  const r = P.person(ctx, x, y, s, facing, L || AGENT, Pz, { tie: o.tie || C.yellow });
  ctx.save(); ctx.translate(x, y); ctx.scale(s * facing, s); if (o.hat !== false) fedora(ctx, r, Pz); ctx.restore(); return r;
}

// ---------- sealed props (no logos, no cigarettes visible) ----------
const PACK = '#E2C68E', PACKD = '#C9A86A';
// a closed, sealed pack (centred, ~70 x 100 at s = 1): plain colour, cellophane shine, red tear strip
function pack(ctx, s = 1, rot = 0) {
  ctx.save(); ctx.rotate(rot); ctx.scale(s, s);
  rr(ctx, -36, -52, 72, 104, 6); fillStroke(ctx, PACK, 4); ctx.fillStyle = PACKD; ctx.fillRect(-36, -52, 72, 22); rr(ctx, -36, -52, 72, 104, 6); ctx.lineWidth = R.px(ctx, 4); ctx.strokeStyle = INK; ctx.stroke();
  ctx.fillStyle = C.red; ctx.fillRect(-36, -36, 72, 5); ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.moveTo(-26, 46); ctx.lineTo(-10, -46); ctx.lineTo(0, -46); ctx.lineTo(-16, 46); ctx.closePath(); ctx.fill();
  ctx.restore();
}
// a sealed carton (10 packs), centred, ~300 x 110 at s = 1; o.tag: a paper tag with a word
function carton(ctx, s = 1, o = {}) {
  ctx.save(); ctx.scale(s, s);
  CL.cutout(ctx, () => rr(ctx, -150, -55, 300, 110, 8), PACK, { elev: o.elev ?? 1.2, tex: 0.4 });
  ctx.fillStyle = PACKD; ctx.fillRect(-150, -55, 300, 28); ctx.fillStyle = C.red; ctx.fillRect(-150, -24, 300, 6);
  ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 3; for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-150 + i * 60, -16); ctx.lineTo(-150 + i * 60, 55); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.moveTo(-120, 50); ctx.lineTo(-90, -50); ctx.lineTo(-74, -50); ctx.lineTo(-104, 50); ctx.closePath(); ctx.fill();
  rr(ctx, -150, -55, 300, 110, 8); ctx.lineWidth = R.px(ctx, 5); ctx.strokeStyle = INK; ctx.stroke();
  if (o.tag) { ctx.save(); ctx.translate(110, -70); ctx.rotate(0.15); CL.cutout(ctx, () => rr(ctx, -60, -26, 120, 52, 8), C.yellow, { elev: 1, tex: 0 }); ST.fitTxt(ctx, o.tag, 0, 14, 36, INK, 100); ctx.restore(); }
  ctx.restore();
}
// a clipboard with the survey form (centred, ~260 x 340 at s = 1); tick 0..1 draws the check mark
function clipboard(ctx, s = 1, tick = 0) {
  ctx.save(); ctx.scale(s, s);
  rr(ctx, -130, -170, 260, 340, 12); fillStroke(ctx, '#B98A5A', 5); rr(ctx, -110, -140, 220, 290, 4); fillStroke(ctx, '#FFFDF8', 3);
  rr(ctx, -46, -186, 92, 40, 8); fillStroke(ctx, '#9AA0A8', 4);
  ST.fitTxt(ctx, 'DOCTOR SURVEY', 0, -100, 26, INK, 190, 'center', ST.FONT.type);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; for (let i = 0; i < 3; i++) ctx.fillRect(-90, -70 + i * 22, 180 - i * 30, 6);
  for (let i = 0; i < 3; i++) { ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.strokeRect(-90, 10 + i * 44, 26, 26); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(-52, 20 + i * 44, 120, 6); }
  if (tick > 0) { ctx.strokeStyle = C.red; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-88, 24); const u = Math.min(1, tick * 2); ctx.lineTo(-88 + 12 * u, 24 + 12 * u); if (tick > 0.5) ctx.lineTo(-76 + 30 * (tick - 0.5) * 2, 36 - 40 * (tick - 0.5) * 2); ctx.stroke(); }
  ctx.restore();
}
module.exports = { DOCTOR, AGENT, DOCS, doctor, adman, stethoscope, headMirror, fedora, pack, carton, clipboard, PACK, PACKD };
