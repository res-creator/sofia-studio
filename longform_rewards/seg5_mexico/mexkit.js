// Long-form "When Paying People Backfired", chapter 5 (Mexico City, 1989, "Hoy No Circula") — props, sets and cast in howitsrun_style.
// World space like howitsrun_style/sets.js: floor at y = 0, up is negative, x centred on 0 (draw inside ST.layer). Wide 16:9 framing.
// Cars in side view (face +x, wheels on y = 0, ~560 long at s = 1), license plates (generic: "MEXICO" + letters/digits, no official design),
// the smoggy skyline with two faint volcanoes, a street, the used-car lot (plain-text sign), the air monitoring station, the Mon–Fri
// "no driving day" cards (plate digit pairs), the air-quality chart, the chapter card. People: generic Mexican townspeople, normal proportions.
const K = require('../../tests/mcd_collage/kit');
const R = require('../../hirkit/rig');
const CL = require('../../hirkit/collage');
const ST = require('../../howitsrun_style/style');
const P = require('../../howitsrun_style/people');
const { C, F, clamp, lerp, seg, E, rr, hash } = K;
const { INK, shade, fillStroke, ell, px } = R;
const { PAL, txt, fitTxt } = ST;

// ---------- cast (generic townspeople of Mexico City, 1989) ----------
const LK = {
  dad: { skin: '#C98E66', hair: '#241A14', hairStyle: 'short', top: '#7FA7C9', cuff: '#6A90B2', shirt: '#F4F1E8', pants: '#3E4A5E', shoes: '#4A3424', sole: '#2E2018', iris: '#2E1E14', brow: '#1E1410' },
  mom: { skin: '#D9A27E', hair: '#1E1612', hairStyle: 'long', top: '#D9785A', cuff: '#C2654A', pants: '#4A4060', shoes: '#6A3A2A', sole: '#2E2018', iris: '#2E1E14', brow: '#1E1410' },
  kid: { skin: '#C98E66', hair: '#241A14', hairStyle: 'short', top: '#F2C14E', cuff: '#E0AE3A', pants: '#3E6A8A', shoes: '#F4F1E8', sole: '#C9C1B1', iris: '#2E1E14', brow: '#1E1410' },
  clerk: { skin: '#B98060', hair: '#2A1E16', hairStyle: 'short', top: '#F4F1E8', cuff: '#E4DED0', shirt: '#FFFDF8', pants: '#4A4F57', shoes: '#171717', iris: '#2E1E14', brow: '#1E1410' },
  walker: { skin: '#D9A27E', hair: '#3A2A1E', hairStyle: 'bun', top: '#5E9C7A', cuff: '#4E8A6A', pants: '#5A4A3E', shoes: '#3A2A1E', sole: '#2E2018', iris: '#2E1E14', brow: '#2A1A10' },
  seller: { skin: '#B98060', hair: '#5A5A58', hairStyle: 'short', top: '#C9B27A', cuff: '#B39C66', shirt: '#F4EEDF', pants: '#5A4A3E', shoes: '#3A2A1E', sole: '#2E2018', iris: '#2E1E14', brow: '#4A4A48' },
};
const person = (ctx, x, y, s, f, L, Pz = {}, acc = {}) => P.person(ctx, x, y, s, f, L, Pz, acc);
// a briefcase held at the hand (hanging)
const briefcase = g => { g.save(); g.translate(-10, 6); rr(g, -46, 0, 92, 66, 8); fillStroke(g, '#6A4A2E', 4); g.beginPath(); g.moveTo(-14, 0); g.lineTo(-14, -12); g.lineTo(14, -12); g.lineTo(14, 0); g.lineWidth = px(g, 5); g.strokeStyle = INK; g.stroke(); g.restore(); };

// ---------- license plate (generic), centred; o: { hl (circle the last char, 0..1), top, col } ----------
function plate(ctx, s, sc = 1, o = {}) {
  ctx.save(); ctx.scale(sc, sc); ctx.rotate(o.rot || 0);
  const w = o.w || 300, h = 150;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 16), o.col || '#F4F6F2', { elev: o.elev ?? 1.4 });
  ctx.lineWidth = px(ctx, 4); ctx.strokeStyle = '#2E3A59'; rr(ctx, -w / 2 + 10, -h / 2 + 10, w - 20, h - 20, 10); ctx.stroke();
  txt(ctx, o.top || 'MEXICO', 0, -h / 2 + 38, 24, '#2E3A59', 'center', F.black);
  for (const sx of [-1, 1]) { ell(ctx, sx * (w / 2 - 26), -h / 2 + 30, 6, 6); fillStroke(ctx, '#B9BEC2', 2.5); }
  ctx.font = `76px ${F.black}`; const tw = ctx.measureText(s).width, k = Math.min(1, (w - 40) / tw), size = 76 * k;
  txt(ctx, s, 0, 46, size, INK, 'center', F.black);
  if (o.hl > 0) { ctx.font = `${size}px ${F.black}`; const full = ctx.measureText(s).width, last = ctx.measureText(s.slice(-1)).width, cx = full / 2 - last / 2;
    ctx.save(); ctx.translate(cx, 18); ctx.strokeStyle = C.red; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.ellipse(0, 0, last * 0.9, size * 0.62, -0.1, -Math.PI * 0.5, -Math.PI * 0.5 + 6.27 * E.out(clamp(o.hl))); ctx.stroke(); ctx.restore(); }
  ctx.restore();
}

// ---------- the car, side view: faces +x, wheels on y = 0, length ~560 ----------
// o: { col, kind: 'sedan' | 'bug' | 'old', plate: 'ABC 123', rot (wheel angle), smoke 0..∞ (time for puffs), lift 0..1, shine, tag (windshield tag text) }
function car(ctx, o = {}) {
  const col = o.col || '#C94F3D', kind = o.kind || 'sedan', dk = shade(col, -0.2), rot = o.rot || 0;
  ctx.save();
  if (!o.lift) K.contact(ctx, 0, 0, 300, 22, 0.35);
  // exhaust puffs (behind the car, cartoon grey, never dark)
  if (o.smoke !== undefined) for (let i = 0; i < 6; i++) { const p = ((o.smoke * 0.9 + i / 6) % 1); ctx.save(); ctx.globalAlpha *= (1 - p) * 0.95;
    const r = 20 + p * 70; ell(ctx, -300 - p * 260, -40 - p * 120 + Math.sin(i * 2 + p * 6) * 10, r, r * 0.8); ctx.fillStyle = '#C9C4BA'; ctx.fill(); ctx.lineWidth = px(ctx, 3.5); ctx.strokeStyle = 'rgba(23,23,23,0.55)'; ctx.stroke(); ctx.restore(); }
  if (kind === 'bug') {
    ctx.beginPath(); ctx.moveTo(-270, -70); ctx.bezierCurveTo(-280, -200, -170, -300, -20, -300); ctx.bezierCurveTo(140, -300, 250, -210, 270, -90); ctx.quadraticCurveTo(272, -60, 250, -60); ctx.lineTo(-250, -60); ctx.quadraticCurveTo(-272, -60, -270, -70); ctx.closePath(); fillStroke(ctx, col, 5);
    ctx.save(); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,0.18)'; ell(ctx, -40, -270, 160, 30); ctx.fill(); ctx.fillStyle = dk; ctx.fillRect(-300, -110, 600, 60); ctx.restore();
    ctx.beginPath(); ctx.moveTo(-150, -190); ctx.bezierCurveTo(-130, -260, -60, -276, -10, -276); ctx.lineTo(-10, -190); ctx.closePath(); fillStroke(ctx, '#BFD8E4', 4.5);
    ctx.beginPath(); ctx.moveTo(10, -190); ctx.lineTo(10, -276); ctx.bezierCurveTo(80, -274, 140, -240, 160, -190); ctx.closePath(); fillStroke(ctx, '#BFD8E4', 4.5);
  } else {
    const old = kind === 'old';
    rr(ctx, -280, -180, 560, 118, old ? 10 : 26); fillStroke(ctx, col, 5);
    ctx.beginPath(); ctx.moveTo(-190, -178); ctx.lineTo(old ? -160 : -130, -282); ctx.lineTo(old ? 110 : 80, -282); ctx.lineTo(old ? 160 : 170, -178); ctx.closePath(); fillStroke(ctx, col, 5);
    ctx.beginPath(); ctx.moveTo(-166, -190); ctx.lineTo(old ? -142 : -116, -268); ctx.lineTo(-30, -268); ctx.lineTo(-30, -190); ctx.closePath(); fillStroke(ctx, '#BFD8E4', 4.5);
    ctx.beginPath(); ctx.moveTo(-10, -190); ctx.lineTo(-10, -268); ctx.lineTo(old ? 100 : 72, -268); ctx.lineTo(old ? 140 : 146, -190); ctx.closePath(); fillStroke(ctx, '#BFD8E4', 4.5);
    ctx.save(); rr(ctx, -280, -180, 560, 118, old ? 10 : 26); ctx.clip(); ctx.fillStyle = dk; ctx.fillRect(-300, -110, 600, 60); ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(-270, -172, 540, 12); ctx.restore();
    if (old) { // rust patches, a dent line, chrome bumpers, exhaust pipe
      ctx.fillStyle = '#9A5A34'; for (const [x, y, r] of [[-200, -96, 26], [150, -130, 18], [40, -84, 14], [-120, -150, 12]]) { ell(ctx, x, y, r, r * 0.7, 0.4); ctx.fill(); }
      ctx.strokeStyle = shade(col, -0.35); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-40, -150); ctx.lineTo(-20, -128); ctx.lineTo(4, -146); ctx.stroke();
    }
    rr(ctx, -296, -96, 40, 30, 8); fillStroke(ctx, '#C9CCCC', 4); rr(ctx, 256, -96, 40, 30, 8); fillStroke(ctx, '#C9CCCC', 4);
    ell(ctx, 262, -150, 16, 14); fillStroke(ctx, '#F4E7B8', 3.5); rr(ctx, -282, -160, 16, 26, 4); fillStroke(ctx, C.red, 3);
    // door line + handle
    ctx.strokeStyle = shade(col, -0.35); ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(-20, -180); ctx.lineTo(-20, -70); ctx.stroke(); rr(ctx, 10, -150, 34, 10, 4); fillStroke(ctx, '#C9CCCC', 2.5);
  }
  if (kind === 'old' || o.pipe) { rr(ctx, -312, -74, 40, 14, 5); fillStroke(ctx, '#7A7A78', 3.5); }
  // wheels
  for (const wx of [-170, 170]) { ctx.save(); ctx.translate(wx, -50); ell(ctx, 0, 0, 52, 52); fillStroke(ctx, '#262624', 5); ell(ctx, 0, 0, 28, 28); fillStroke(ctx, '#B9BEC2', 4);
    ctx.rotate(rot); ctx.strokeStyle = '#6A6E72'; ctx.lineWidth = 5; for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 24, Math.sin(a) * 24); ctx.stroke(); } ctx.restore(); }
  // rear plate (cartoon convention: on the rear panel, facing us)
  if (o.plate) { ctx.save(); ctx.translate(kind === 'bug' ? -205 : -205, kind === 'bug' ? -100 : -122); plate(ctx, o.plate, 0.36, { elev: 0.4, hl: o.plateHl || 0 }); ctx.restore(); }
  if (o.tag) { ctx.save(); ctx.translate(kind === 'bug' ? 60 : 50, -236); ctx.rotate(0.05); rr(ctx, -50, -24, 100, 48, 6); fillStroke(ctx, o.tagCol || C.yellow, 3.5); fitTxt(ctx, o.tag, 0, 10, 28, INK, 84); ctx.restore(); }
  ctx.restore();
}

// ---------- the smoggy city (world space, floor y = 0): sky, volcanoes, towers, smog ----------
function sky(ctx, t, o = {}) {
  const smog = o.smog ?? 1;
  const g = ctx.createLinearGradient(0, -2200, 0, 0); g.addColorStop(0, K.lerpCol('#8FB8DE', '#B9AC92', smog)); g.addColorStop(1, K.lerpCol('#DDEBF5', '#E6D7B8', smog)); ctx.fillStyle = g; ctx.fillRect(-6000, -3000, 12000, 3000);
  ctx.save(); ctx.globalAlpha = 0.85; ell(ctx, o.sunX ?? 700, -1000, 80, 80); ctx.fillStyle = K.lerpCol('#FFF4D8', '#F2E3C0', smog); ctx.fill(); ctx.restore();
  // two volcanoes far away, half-hidden by the haze
  ctx.save(); ctx.globalAlpha = 1 - 0.55 * smog;
  for (const [x, w, h] of [[-1300, 900, 620], [-500, 700, 520]]) { ctx.beginPath(); ctx.moveTo(x - w, -120); ctx.lineTo(x - 70, -120 - h); ctx.lineTo(x + 70, -120 - h + 10); ctx.lineTo(x + w, -120); ctx.closePath(); ctx.fillStyle = '#9C9AA6'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(x - 160, -120 - h + 140); ctx.lineTo(x - 70, -120 - h); ctx.lineTo(x + 70, -120 - h + 10); ctx.lineTo(x + 170, -120 - h + 150); ctx.quadraticCurveTo(x, -120 - h + 110, x - 160, -120 - h + 140); ctx.fillStyle = '#EDEFF2'; ctx.fill(); }
  ctx.restore();
}
function towers(ctx, t, o = {}) {
  const x0 = o.x0 ?? -2600, n = o.n ?? 26, cols = ['#E8DCC4', '#D9CBB0', '#E2D6C6', '#CFC6B8', '#E6D2BC'];
  for (let i = 0; i < n; i++) { const w = 150 + hash(i * 3) * 120, h = 260 + hash(i * 7) * 420 + (i === 11 ? 420 : 0), x = x0 + i * 200 + hash(i) * 30;
    rr(ctx, x, -h, w, h, 4); fillStroke(ctx, cols[i % 5], 4);
    if (i === 11) { rr(ctx, x + w / 2 - 8, -h - 120, 16, 120, 3); fillStroke(ctx, '#B9BEC2', 3); }
    ctx.fillStyle = 'rgba(70,90,110,0.35)'; for (let r = 0; r < Math.floor((h - 50) / 56); r++) for (let c = 0; c < Math.floor((w - 30) / 40); c++) ctx.fillRect(x + 20 + c * 40, -h + 30 + r * 56, 20, 28); }
}
function smog(ctx, a = 1, y0 = -1500) {
  if (a <= 0) return; const g = ctx.createLinearGradient(0, y0, 0, 0); g.addColorStop(0, 'rgba(186,160,120,0)'); g.addColorStop(0.55, `rgba(186,160,120,${0.45 * a})`); g.addColorStop(1, `rgba(170,150,120,${0.6 * a})`);
  ctx.fillStyle = g; ctx.fillRect(-6000, y0, 12000, -y0 + 40);
}
// the city wide (skyline on the horizon y = 0 world) + ground
function city(ctx, t, o = {}) {
  sky(ctx, t, o); towers(ctx, t, o); smog(ctx, o.smog ?? 1, -1200);
  ctx.fillStyle = '#A9A08C'; ctx.fillRect(-6000, 0, 12000, 2000);
}
// a street: building fronts behind, sidewalk, road (cars drive on y = roadY)
function street(ctx, t, o = {}) {
  sky(ctx, t, { smog: o.smog ?? 1 });
  if (o.far !== false) { ctx.save(); ctx.translate(0, -380); ctx.scale(0.6, 0.6); towers(ctx, t, { x0: -4200, n: 42 }); ctx.restore(); smog(ctx, (o.smog ?? 1) * 0.8, -1400); }
  const cols = ['#E9C8A0', '#D7A68A', '#E8D9B0', '#B9C9C0', '#E6B9A0', '#D9C2E0'];
  for (let i = 0; i < 18; i++) { const x = -3600 + i * 400, h = 420 + hash(i * 5) * 200, w = 400;
    rr(ctx, x, -h, w, h, 3); fillStroke(ctx, cols[i % 6], 4.5);
    ctx.fillStyle = shade(cols[i % 6], -0.12); ctx.fillRect(x + 4, -h + 4, w - 8, 26);
    for (let c = 0; c < 3; c++) { rr(ctx, x + 50 + c * 115, -h + 70, 70, 100, 4); fillStroke(ctx, '#BFD8E4', 3.5); ctx.fillStyle = shade(cols[i % 6], -0.25); ctx.fillRect(x + 44 + c * 115, -h + 172, 82, 10); }
    rr(ctx, x + 150, -170, 100, 170, 4); fillStroke(ctx, '#8A5A34', 4); }
  ctx.fillStyle = '#CFC6B4'; ctx.fillRect(-6000, 0, 12000, 70); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 4); ctx.beginPath(); ctx.moveTo(-6000, 0); ctx.lineTo(6000, 0); ctx.moveTo(-6000, 70); ctx.lineTo(6000, 70); ctx.stroke();
  ctx.fillStyle = '#6A6E76'; ctx.fillRect(-6000, 70, 12000, 1600); ctx.fillStyle = '#E9D36A'; for (let x = -6000; x < 6000; x += 260) ctx.fillRect(x - ((o.dash || 0) % 260), 300, 140, 12);
}
// the used-car lot: bunting, sign "USED CARS", a small office with a window
function carLot(ctx, t, o = {}) {
  sky(ctx, t, { smog: 0.85 });
  ctx.save(); ctx.translate(0, -300); ctx.scale(0.55, 0.55); towers(ctx, t, { x0: -4600, n: 46 }); ctx.restore(); smog(ctx, 0.7, -1300);
  ctx.fillStyle = '#C9BCA2'; ctx.fillRect(-6000, -60, 12000, 2000); ctx.fillStyle = '#B9AC92'; for (let i = -20; i < 20; i++) ctx.fillRect(i * 300, 160, 6, 1000);
  // office booth
  ctx.save(); ctx.translate(o.office ?? 900, -60); rr(ctx, -260, -460, 520, 460, 6); fillStroke(ctx, '#EADDC2', 5); CL.cutout(ctx, () => rr(ctx, -320, -540, 640, 110, 10), C.red, { elev: 1.2 }); fitTxt(ctx, 'USED CARS', 0, -462, 76, '#FFFDF8', 580);
  rr(ctx, -200, -380, 220, 160, 6); fillStroke(ctx, '#BFD8E4', 4.5); rr(ctx, 70, -300, 130, 300, 6); fillStroke(ctx, '#8A5A34', 4.5); ctx.restore();
  // sign on two posts
  if (o.sign !== undefined) { ctx.save(); ctx.translate(o.sign, -60); for (const sx of [-330, 330]) { rr(ctx, sx - 10, -760, 20, 760, 3); fillStroke(ctx, '#7A7A78', 4); }
  CL.cutout(ctx, () => rr(ctx, -400, -860, 800, 170, 12), '#FFFDF8', { elev: 1.4 }); ctx.fillStyle = C.red; ctx.fillRect(-380, -840, 760, 130); fitTxt(ctx, 'USED CARS', 0, -748, 100, '#FFFDF8', 720);
  ctx.restore(); }
  // bunting
  ctx.strokeStyle = '#4A4A48'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-2400, -720); for (let x = -2400; x <= 2400; x += 40) ctx.lineTo(x, -720 + Math.sin((x + 2400) / 1600 * Math.PI) * 0 + 60 * Math.abs(Math.sin((x + 2400) / 800 * Math.PI))); ctx.stroke();
  const flags = [C.red, C.yellow, '#4D8DFF', '#2FA37E', '#FFFDF8'];
  for (let i = 0; i < 60; i++) { const x = -2380 + i * 80, y = -720 + 60 * Math.abs(Math.sin((x + 2400) / 800 * Math.PI)), sw = Math.sin(t * 3 + i) * 0.12;
    ctx.save(); ctx.translate(x, y); ctx.rotate(sw); ctx.beginPath(); ctx.moveTo(-22, 0); ctx.lineTo(22, 0); ctx.lineTo(0, 50); ctx.closePath(); fillStroke(ctx, flags[i % 5], 3); ctx.restore(); }
}
// a price/sale tag on a stick
function priceTag(ctx, s, sc = 1) { ctx.save(); ctx.scale(sc, sc); rr(ctx, -6, 0, 12, 200, 3); fillStroke(ctx, '#7A7A78', 3); CL.cutout(ctx, () => rr(ctx, -110, -80, 220, 100, 10), C.yellow, { elev: 1 }); fitTxt(ctx, s, 0, -14, 52, INK, 190); ctx.restore(); }

// ---------- the air monitoring station (on a rooftop), base at 0 ----------
function station(ctx, t, o = {}) {
  ctx.save();
  // the roof
  rr(ctx, -700, 0, 1400, 900, 4); fillStroke(ctx, '#D9CBB0', 5); ctx.fillStyle = 'rgba(70,90,110,0.3)'; for (let r = 0; r < 4; r++) for (let c = 0; c < 9; c++) ctx.fillRect(-640 + c * 150, 60 + r * 160, 70, 90);
  rr(ctx, -720, -24, 1440, 30, 4); fillStroke(ctx, '#B9AC92', 4);
  // the cabin
  rr(ctx, -340, -330, 520, 310, 8); fillStroke(ctx, '#F4F6F2', 5); rr(ctx, -360, -350, 560, 36, 6); fillStroke(ctx, '#B9BEC2', 4);
  rr(ctx, -300, -270, 160, 110, 6); fillStroke(ctx, '#BFD8E4', 4); rr(ctx, 40, -280, 110, 260, 6); fillStroke(ctx, '#B9BEC2', 4);
  CL.cutout(ctx, () => rr(ctx, -310, -140, 320, 92, 8), '#2E3A59', { elev: 0.6 }); fitTxt(ctx, 'AIR', -150, -104, 34, '#FFFDF8', 290); fitTxt(ctx, 'MONITOR', -150, -64, 34, C.yellow, 290);
  // air intake funnels on the roof of the cabin
  for (const x of [-250, -150]) { rr(ctx, x - 8, -440, 16, 92, 3); fillStroke(ctx, '#9A9EA2', 3); ctx.beginPath(); ctx.moveTo(x - 30, -470); ctx.lineTo(x + 30, -470); ctx.lineTo(x + 10, -436); ctx.lineTo(x - 10, -436); ctx.closePath(); fillStroke(ctx, '#C9CCCC', 3); }
  // the mast with an anemometer + vane
  ctx.strokeStyle = '#6A6E72'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(400, 0); ctx.lineTo(400, -760); ctx.stroke();
  ctx.lineWidth = 3; for (let i = 0; i < 10; i++) { ctx.beginPath(); ctx.moveTo(380, -i * 76); ctx.lineTo(420, -i * 76 - 38); ctx.stroke(); }
  ctx.save(); ctx.translate(400, -780); ctx.rotate(t * 5); for (let i = 0; i < 3; i++) { ctx.rotate(Math.PI * 2 / 3); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(60, 0); ctx.stroke(); ell(ctx, 66, 8, 16, 12); fillStroke(ctx, '#E9EDF0', 3); } ctx.restore();
  ell(ctx, 400, -780, 10, 10); fillStroke(ctx, '#7A7A78', 3);
  ctx.save(); ctx.translate(400, -660); ctx.rotate(Math.sin(t * 1.3) * 0.2); ctx.beginPath(); ctx.moveTo(-70, 0); ctx.lineTo(80, 0); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-70, -26); ctx.lineTo(-30, 0); ctx.lineTo(-70, 26); ctx.closePath(); fillStroke(ctx, C.red, 3); ctx.restore();
  // blinking light
  ell(ctx, 180, -360, 12, 12); fillStroke(ctx, Math.floor(t * 2) % 2 ? '#7CFF9A' : '#2FA37E', 3);
  ctx.restore();
}

// ---------- the Mon–Fri cards: day + plate digit pairs; u[i] 0..1 per card ----------
const DAYS = [['MON', '5 · 6'], ['TUE', '7 · 8'], ['WED', '3 · 4'], ['THU', '1 · 2'], ['FRI', '9 · 0']];
function weekCards(ctx, us, o = {}) {
  const w = o.w || 290, h = o.h || 320, gap = o.gap || 40;
  DAYS.forEach(([d, n], i) => { const u = us[i] || 0; if (u <= 0) return; ctx.save(); ctx.translate((i - 2) * (w + gap), 0); const k = E.back(clamp(u), 2); ctx.scale(k, k); ctx.rotate((i % 2 ? 1 : -1) * 0.02);
    ST.calCard(ctx, d, n, { w, h, bigSize: h * 0.3 });
    // small "car stays home" icon under the digits
    ctx.save(); ctx.translate(0, h * 0.4); ctx.scale(0.13, 0.13); car(ctx, { col: '#5A606B' }); ctx.restore();
    ctx.save(); ctx.translate(0, h * 0.4 - 20); ctx.strokeStyle = C.red; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-50, -26); ctx.lineTo(50, 26); ctx.stroke(); ctx.restore();
    if (o.hl === i) { ctx.strokeStyle = C.yellow; ctx.lineWidth = 12; rr(ctx, -w / 2 - 12, -h / 2 - 12, w + 24, h + 24, 24); ctx.stroke(); }
    ctx.restore(); });
}

// ---------- the chart (Davis): flat AIR QUALITY, rising CARS IN USE; u1 / u2 draw the lines, centred ----------
function chart(ctx, u1, u2, o = {}) {
  const w = o.w || 1300, h = o.h || 620;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 14), '#FBF6EA', { elev: 1.8 });
  ctx.strokeStyle = 'rgba(80,110,160,0.18)'; ctx.lineWidth = 2; for (let x = -w / 2 + 120; x < w / 2 - 40; x += 80) { ctx.beginPath(); ctx.moveTo(x, -h / 2 + 50); ctx.lineTo(x, h / 2 - 90); ctx.stroke(); }
  for (let y = -h / 2 + 50; y < h / 2 - 90; y += 80) { ctx.beginPath(); ctx.moveTo(-w / 2 + 100, y); ctx.lineTo(w / 2 - 40, y); ctx.stroke(); }
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 6); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-w / 2 + 100, -h / 2 + 40); ctx.lineTo(-w / 2 + 100, h / 2 - 90); ctx.lineTo(w / 2 - 40, h / 2 - 90); ctx.stroke();
  const x0 = -w / 2 + 100, x1 = w / 2 - 40, xr = lerp(x0, x1, 0.36);
  // the rule marker
  ctx.save(); ctx.setLineDash([16, 12]); ctx.strokeStyle = C.red; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(xr, -h / 2 + 40); ctx.lineTo(xr, h / 2 - 90); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.translate(xr, -h / 2 + 28); ctx.font = `30px ${F.black}`; { const lw = ctx.measureText('RULE · NOV 1989').width + 30; CL.cutout(ctx, () => rr(ctx, -lw / 2, -26, lw, 44, 8), C.red, { elev: 0.6 }); txt(ctx, 'RULE · NOV 1989', 0, 8, 30, '#FFFDF8'); } ctx.restore();
  fitTxt(ctx, 'BEFORE', lerp(x0, xr, 0.5), h / 2 - 40, 34, '#4A4A48', 220, 'center', ST.FONT.type);
  fitTxt(ctx, 'AFTER', lerp(xr, x1, 0.5), h / 2 - 40, 34, '#4A4A48', 220, 'center', ST.FONT.type);
  const line = (u, f, col, lw) => { if (u <= 0) return; ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.beginPath(); const N = 60, n = Math.floor(N * clamp(u));
    for (let i = 0; i <= n; i++) { const v = i / N, x = lerp(x0 + 20, x1 - 20, v), y = f(v); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.restore();
    return [lerp(x0 + 20, x1 - 20, n / N), f(n / N)]; };
  const fa = v => -40 + Math.sin(v * 37) * 10 + Math.sin(v * 13) * 8, fc = v => 150 - (v < 0.36 ? v * 40 : 14 + (v - 0.36) * 470) + Math.sin(v * 29) * 5;
  const pa = line(u1, fa, '#4D8DFF', 12), pc = line(u2, fc, C.red, 12);
  if (pa && u1 >= 0.9) { const k = E.back(seg(u1, 0.9, 1), 2); ctx.save(); ctx.translate(x1 - 200, pa[1] - 60); ctx.scale(k, k); label2(ctx, 'AIR QUALITY', '#4D8DFF'); ctx.restore(); }
  if (pc && u2 >= 0.9) { const k = E.back(seg(u2, 0.9, 1), 2); ctx.save(); ctx.translate(lerp(x0 + 20, x1 - 20, 0.66) + 60, fc(0.66) + 80); ctx.scale(k, k); label2(ctx, 'CARS IN USE', C.red); ctx.restore(); }
}
function label2(ctx, s, col) { ctx.font = `40px ${F.black}`; const w = ctx.measureText(s).width + 36; CL.cutout(ctx, () => rr(ctx, -w / 2, -34, w, 56, 10), col, { elev: 0.8 }); txt(ctx, s, 0, 8, 40, '#FFFDF8'); }

// ---------- the paper "study" note with the economist's name ----------
function studyNote(ctx, o = {}) {
  ctx.save(); ctx.rotate(o.rot ?? 0.03); const w = 560, h = 380;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 8), '#FBF6EA', { elev: 1.6 });
  fitTxt(ctx, 'STUDY', 0, -h / 2 + 70, 54, INK, w - 60, 'center', ST.FONT.type);
  fitTxt(ctx, 'ECONOMIST', 0, -h / 2 + 122, 32, '#4A4A48', w - 60, 'center', ST.FONT.type); fitTxt(ctx, 'LUCAS DAVIS', 0, -h / 2 + 182, 56, INK, w - 60, 'center', F.black);
  ctx.strokeStyle = 'rgba(23,23,23,0.35)'; ctx.lineWidth = 3; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-w / 2 + 50, 50 + i * 44); ctx.lineTo(w / 2 - 50 - (i % 2) * 120, 50 + i * 44); ctx.stroke(); }
  ctx.restore();
}

// ---------- chapter card (0–3 s): paper card, CHAPTER n tab, big title, place · year; icon(ctx) under the title ----------
function chapterCard(ctx, t, n, title, place, icon, o = {}) {
  const { W, H } = ST;
  ST.bg(ctx, o.bg || '#E5DCC8'); ctx.fillStyle = 'rgba(120,90,50,0.07)'; for (let i = 0; i < 30; i++) ctx.fillRect(0, i * 40, W, 3);
  const u = E.back(seg(t, 0.0, 0.45), 1.6), z = 1 + t * 0.02;
  ctx.save(); ctx.translate(W / 2, 470 + (1 - u) * 60); ctx.scale(z * (0.85 + 0.15 * u), z * (0.85 + 0.15 * u)); ctx.globalAlpha *= clamp(u * 2); ctx.rotate(-0.015);
  CL.cutout(ctx, () => rr(ctx, -640, -300, 1280, 600, 26), PAL.cream, { elev: 2.2 });
  ctx.save(); ctx.translate(-430, -300); ctx.rotate(-0.04); CL.cutout(ctx, () => rr(ctx, -150, -44, 300, 88, 12), C.red, { elev: 1.2 }); fitTxt(ctx, n, 0, 18, 46, PAL.cream, 270); ctx.restore();
  fitTxt(ctx, title, 0, -60, 120, INK, 1160);
  ctx.save(); ctx.translate(0, 50); const pu = ST.pop(t, 0.35); ctx.scale(pu, pu); if (pu > 0) { ctx.font = `46px ${F.black}`; const w = ctx.measureText(place).width + 50; CL.cutout(ctx, () => rr(ctx, -w / 2, -40, w, 62, 10), '#171717', { elev: 0.8 }); txt(ctx, place, 0, 8, 46, C.yellow); } ctx.restore();
  ctx.save(); ctx.translate(0, 230); icon(ctx, t); ctx.restore();
  ctx.restore();
}

module.exports = { LK, person, briefcase, plate, car, sky, towers, smog, city, street, carLot, priceTag, station, DAYS, weekCards, chart, studyNote, chapterCard };
