// Episode 13 "Why the McDonald's ice cream machine is always broken" — sets, props and cast (on hirkit):
// a generic soft-serve machine (front view, display, levers, spout, padlock, OUT OF ORDER note, steam/frost), the fast-food counter
// (no logos: generic menu boards), the dessert cup, thermometer, wall clock, cycle bar, error display, phone ticket, tear-off calendar,
// the exemption document, wrench, the night window. Brand names appear as plain text only; the machine is a generic drawing.
const K = require('../tests/mcd_collage/kit');
const R = require('../hirkit/rig');
const LT = require('../hirkit/light');
const CL = require('../hirkit/collage');
const { C, F, clamp, lerp, seg, E, rr } = K;
const { INK, shade, fillStroke, ell, px } = R;

const W = 1080, H = 1920;
function layer(ctx, c, d, fn) { ctx.save(); ctx.translate(W / 2 + (c.shx || 0) * d, H / 2 + (c.shy || 0) * d); ctx.rotate((c.r || 0) * d); const z = Math.pow(c.z, d); ctx.scale(z, z); ctx.translate(-c.x * d, -c.y * d); fn(ctx); ctx.restore(); }
const txt = (ctx, s, x, y, size, col, align = 'center', font = F.black) => { ctx.font = `${size}px ${font}`; ctx.textAlign = align; ctx.fillStyle = col; ctx.fillText(s, x, y); };
function fitTxt(ctx, s, x, y, size, col, maxW, align = 'center', font = F.black) { ctx.font = `${size}px ${font}`; const w = ctx.measureText(s).width; if (w > maxW) size *= maxW / w; txt(ctx, s, x, y, size, col, align, font); return size; }
const MONO = 'DejaVu Sans Mono, monospace';

// ---------- cast ----------
// "you": the customer (hoodie), the crew member at the counter, the technician
const CUST = { skin: '#E8B48F', hair: '#3A2416', hairStyle: 'short', top: '#4D8DFF', zip: 1, pants: '#2E3A59', shoes: '#2A2A2A', iris: '#4E6B3C', brow: '#2A1A10' };
const CREW = { skin: '#8D5A3C', hair: '#1E1612', hairStyle: 'bun', top: '#E63946', apron: '#3A3A44', pants: '#2A2A2A', shoes: '#1E1E1E', iris: '#3A2414', brow: '#1E1612', lashes: 1, lips: '#7A3434' };
const TECH = { skin: '#F0C7A6', hair: '#6E6A66', hairStyle: 'short', top: '#2E4A6B', zip: 1, pants: '#2E4A6B', shoes: '#2A2A2A', iris: '#3E6A8A', brow: '#4A4440', beard: 1 };
// a strong "annoyed" face for the hook (built from the rig's face parameters)
const ANGRY = { mouth: 'frown', lid: [0.32, 0.32], low: [0.3, 0.3], brow: [-0.75, -0.75], bang: [0.75, 0.75] };
// a little name badge on a bust (bust space: call with the same x, y, s as R.bust)
function badge(ctx, x, y, s, label = 'CREW') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.save(); ctx.translate(-70, 150); ctx.rotate(-0.04); CL.cutout(ctx, () => rr(ctx, -48, -20, 96, 40, 8), '#FFFDF8', { elev: 0.6, tex: 0 }); txt(ctx, label, 0, 9, 22, INK); ctx.restore();
  ctx.restore();
}

// ---------- the soft-serve machine (front view, base centre at 0, ~520 wide x 800 tall) ----------
// o: screen(g, w, h) draws into the display; led (colour); lock (0 closed .. 1 open, undefined = none); sign (OUT OF ORDER note, 0..1);
//    steam (t) puffs; frost 0..1; heat 0..1 (warm tint); pull 0..1 (centre lever)
function machine(ctx, o = {}) {
  ctx.save();
  // hopper lids on top
  for (const sx of [-1, 1]) { rr(ctx, sx * 130 - 95, -812, 190, 60, 14); fillStroke(ctx, '#C9CDD2', 5); rr(ctx, sx * 130 - 30, -830, 60, 22, 8); fillStroke(ctx, '#9AA0A8', 4); }
  // body
  rr(ctx, -260, -770, 520, 770, 26);
  let g = ctx.createLinearGradient(-260, 0, 260, 0); g.addColorStop(0, '#B7BCC2'); g.addColorStop(0.3, '#E9ECEF'); g.addColorStop(0.55, '#D5D9DE'); g.addColorStop(1, '#9EA4AB');
  ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = px(ctx, 6); ctx.strokeStyle = INK; ctx.stroke();
  if (o.heat) { ctx.save(); rr(ctx, -260, -770, 520, 770, 26); ctx.clip(); ctx.fillStyle = `rgba(230,57,70,${0.28 * o.heat})`; ctx.fillRect(-300, -800, 600, 800); ctx.restore(); }
  if (o.frost) { ctx.save(); rr(ctx, -260, -770, 520, 770, 26); ctx.clip(); ctx.fillStyle = `rgba(190,225,255,${0.4 * o.frost})`; ctx.fillRect(-300, -800, 600, 800);
    ctx.strokeStyle = `rgba(255,255,255,${0.8 * o.frost})`; ctx.lineWidth = px(ctx, 3); for (let i = 0; i < 14; i++) { const x = -240 + K.hash(i) * 480, y = -760 + K.hash(i + 30) * 740, r = 10 + K.hash(i + 7) * 18; for (let a = 0; a < 3; a++) { ctx.beginPath(); ctx.moveTo(x - Math.cos(a * 1.05) * r, y - Math.sin(a * 1.05) * r); ctx.lineTo(x + Math.cos(a * 1.05) * r, y + Math.sin(a * 1.05) * r); ctx.stroke(); } } ctx.restore(); }
  // panel seams + vents
  ctx.strokeStyle = 'rgba(23,23,23,0.35)'; ctx.lineWidth = px(ctx, 3); ctx.beginPath(); ctx.moveTo(-260, -500); ctx.lineTo(260, -500); ctx.moveTo(-260, -150); ctx.lineTo(260, -150); ctx.stroke();
  for (let i = 0; i < 6; i++) { rr(ctx, -180 + i * 64, -100, 40, 70, 8); ctx.fillStyle = 'rgba(40,44,50,0.55)'; ctx.fill(); }
  // display
  rr(ctx, -210, -730, 420, 190, 18); fillStroke(ctx, '#2A2E36', 5);
  ctx.save(); ctx.translate(-190, -712); rr(ctx, 0, 0, 380, 154, 10); ctx.fillStyle = '#10261C'; ctx.fill(); ctx.clip();
  if (o.screen) o.screen(ctx, 380, 154); ctx.restore();
  // status LED
  const led = o.led || '#2FD27E'; ell(ctx, 230, -745, 12, 12); fillStroke(ctx, led, 3); LT.glow(ctx, 230, -745, 50, led, 0.5);
  // face plate with the three draw levers and the star spout
  rr(ctx, -200, -470, 400, 200, 22); fillStroke(ctx, '#C3C8CE', 5);
  for (let i = -1; i <= 1; i++) { const pull = i === 0 ? (o.pull || 0) : 0, x = i * 120;
    ell(ctx, x, -330, 34, 20); fillStroke(ctx, '#9AA0A8', 4);
    ctx.beginPath(); for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2, r = k % 2 ? 9 : 18; ctx.lineTo(x + Math.cos(a) * r, -296 + Math.sin(a) * r * 0.6); } ctx.closePath(); fillStroke(ctx, '#7C828A', 3);
    ctx.save(); ctx.translate(x, -340); ctx.rotate(-0.05 + 0.5 * pull); rr(ctx, -11, -110, 22, 112, 10); fillStroke(ctx, '#5A6068', 4); ell(ctx, 0, -112, 20, 20); fillStroke(ctx, C.red, 4); ctx.restore(); }
  // drip tray
  rr(ctx, -230, -205, 460, 46, 12); fillStroke(ctx, '#8C939B', 5); ctx.fillStyle = 'rgba(23,23,23,0.35)'; for (let i = 0; i < 10; i++) ctx.fillRect(-200 + i * 42, -192, 22, 18);
  // OUT OF ORDER note, taped
  if (o.sign) { const u = o.sign; ctx.save(); ctx.translate(0, -390); ctx.rotate(0.06 - (1 - u) * 0.4); ctx.scale(u, u);
    CL.cutout(ctx, () => rr(ctx, -190, -80, 380, 160, 6), '#FFFDF6', { elev: 1.4 }); txt(ctx, 'OUT OF', 0, -12, 64, C.red); txt(ctx, 'ORDER', 0, 56, 64, C.red);
    CL.tape(ctx, -150, -82, 110, -0.3); CL.tape(ctx, 150, -82, 110, 0.3); ctx.restore(); }
  // padlock over the display
  if (o.lock !== undefined) { const u = clamp(o.lock); ctx.save(); ctx.translate(0, -620);
    ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 30); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-60, 10); ctx.lineTo(-60, -50 - 70 * E.out(u)); ctx.arc(0, -50 - 70 * E.out(u), 60, Math.PI, 0); ctx.lineTo(60, -50 - 70 * E.out(u) + (u > 0.05 ? -10 : 60)); ctx.stroke();
    ctx.strokeStyle = '#B9BEC4'; ctx.lineWidth = px(ctx, 18); ctx.stroke();
    ctx.rotate(-0.05 * E.out(u)); CL.cutout(ctx, () => rr(ctx, -110, -10, 220, 170, 26), u > 0.5 ? '#2FA37E' : C.yellow, { elev: 1.6 });
    ell(ctx, 0, 60, 20, 20); ctx.fillStyle = INK; ctx.fill(); ctx.fillRect(-8, 60, 16, 50); ctx.restore(); }
  if (o.steam !== undefined) for (let i = 0; i < 6; i++) { const ph = (o.steam * 0.6 + i / 6) % 1; ctx.save(); ctx.globalAlpha *= Math.sin(ph * Math.PI) * 0.75;
    ell(ctx, -200 + i * 80 + Math.sin(ph * 6 + i) * 20, -830 - ph * 320, 40 + ph * 50, 30 + ph * 40); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.restore(); }
  ctx.restore();
}
// display contents
const scr = {
  text: (lines, col = '#7CFFB2', size = 44) => (g, w, h) => { g.textBaseline = 'alphabetic'; lines.forEach((s, i) => fitTxt(g, s, w / 2, h / 2 + 16 + (i - (lines.length - 1) / 2) * size * 1.15, size, col, w - 30, 'center', MONO)); },
  heat: (u, label = 'HEAT MODE') => (g, w, h) => { fitTxt(g, label, w / 2, 52, 40, '#FFC857', w - 30, 'center', MONO); rr(g, 30, 84, w - 60, 34, 8); g.strokeStyle = '#7CFFB2'; g.lineWidth = 3; g.stroke(); rr(g, 34, 88, Math.max(0, (w - 68) * clamp(u)), 26, 6); g.fillStyle = '#7CFFB2'; g.fill(); },
};

// ---------- the counter (world: counter top at y = 0, centred; machine behind on the right) ----------
function counter(ctx, t = 0, o = {}) {
  // back wall: warm tiles + generic menu boards (no logos)
  ctx.fillStyle = '#F1E3C8'; ctx.fillRect(-1600, -1800, 3200, 1800);
  ctx.fillStyle = 'rgba(180,140,90,0.18)'; for (let x = -1600; x < 1600; x += 120) ctx.fillRect(x, -1800, 4, 1800); for (let y = -1800; y < 0; y += 120) ctx.fillRect(-1600, y, 3200, 4);
  ctx.fillStyle = C.red; ctx.fillRect(-1600, -1800, 3200, 120);
  for (let i = -2; i <= 1; i++) { ctx.save(); ctx.translate(i * 640 + 320, -1560); CL.cutout(ctx, () => rr(ctx, -290, 0, 580, 360, 14), '#2A2A30', { elev: 1, tex: 0.3 });
    for (let r = 0; r < 5; r++) { ctx.fillStyle = 'rgba(255,253,248,0.75)'; ctx.fillRect(-250, 50 + r * 60, 300 - K.hash(i * 9 + r) * 120, 18); ctx.fillStyle = C.yellow; ctx.fillRect(170, 50 + r * 60, 70, 18); } ctx.restore(); }
  // the machine behind the counter
  if (o.machine !== false) { ctx.save(); ctx.translate(o.mx ?? 420, 0); ctx.scale(o.ms ?? 1, o.ms ?? 1); machine(ctx, o.machineO || {}); ctx.restore(); }
  // counter front
  ctx.fillStyle = '#E2DCCF'; ctx.fillRect(-1600, -30, 3200, 46); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 5); ctx.strokeRect(-1600, -30, 3200, 46);
  ctx.fillStyle = C.red; ctx.fillRect(-1600, 16, 3200, 900); ctx.fillStyle = 'rgba(0,0,0,0.12)'; for (let x = -1600; x < 1600; x += 200) ctx.fillRect(x, 16, 8, 900);
  ctx.fillStyle = C.yellow; ctx.fillRect(-1600, 90, 3200, 26);
}

// ---------- dessert cup (base at 0, ~200 wide x 330 tall incl. swirl) ----------
function cup(ctx, s = 1, o = {}) {
  ctx.save(); ctx.scale(s, s);
  // swirl
  if (o.fill !== 0) { const f = o.fill ?? 1; ctx.save(); ctx.translate(0, -250); ctx.scale(1, f);
    for (let i = 0; i < 3; i++) { ell(ctx, 0, -i * 46, 92 - i * 24, 34); fillStroke(ctx, '#FFFBF0', 4.5); }
    ctx.beginPath(); ctx.moveTo(-14, -120); ctx.quadraticCurveTo(0, -170, 10, -136); fillStroke(ctx, '#FFFBF0', 4);
    ctx.fillStyle = '#6B4A2E'; for (let i = 0; i < 9; i++) { ell(ctx, -60 + K.hash(i) * 120, -10 - K.hash(i + 4) * 70, 7, 4, K.hash(i + 2) * 3); ctx.fill(); }
    ctx.restore(); }
  // spoon
  if (o.spoon !== false) { ctx.save(); ctx.translate(40, -270); ctx.rotate(0.35); rr(ctx, -10, -170, 20, 190, 8); fillStroke(ctx, '#FFFDF8', 4); ctx.restore(); }
  ctx.beginPath(); ctx.moveTo(-100, -260); ctx.lineTo(100, -260); ctx.lineTo(76, 0); ctx.lineTo(-76, 0); ctx.closePath(); fillStroke(ctx, '#FFFDF8', 5);
  ctx.save(); ctx.clip(); ctx.fillStyle = C.blue; ctx.fillRect(-120, -190, 240, 70); ctx.fillStyle = C.yellow; ctx.fillRect(-120, -110, 240, 18); ctx.restore();
  ell(ctx, 0, -260, 100, 16); ctx.lineWidth = px(ctx, 5); ctx.strokeStyle = INK; ctx.stroke();
  ctx.restore();
}

// ---------- thermometer (base bulb at 0, ~760 tall), u 0..1 fill ----------
function thermo(ctx, u, o = {}) {
  ctx.save(); const col = o.col || C.red;
  rr(ctx, -46, -760, 92, 700, 46); fillStroke(ctx, '#FFFDF8', 6);
  for (let i = 0; i < 9; i++) { ctx.fillStyle = INK; ctx.fillRect(18, -680 + i * 70, 22, 5); }
  const top = lerp(-110, -700, clamp(u)); rr(ctx, -20, top, 40, -60 - top + 10, 20); ctx.fillStyle = col; ctx.fill();
  ell(ctx, 0, -40, 78, 78); fillStroke(ctx, col, 6); ell(ctx, -20, -60, 20, 16); ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fill();
  ctx.restore();
}
// a cartoon germ (r radius), squash 0..1 = popped
function germ(ctx, r, t, popped = 0) {
  if (popped >= 1) return; ctx.save(); ctx.scale(1 + popped * 0.6, 1 - popped * 0.9); ctx.globalAlpha *= 1 - popped;
  ctx.beginPath(); for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2, rr2 = r * (1 + 0.12 * Math.sin(a * 6 + t * 5)); ctx.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2); } ctx.closePath(); fillStroke(ctx, '#8FD46B', 4);
  for (const sx of [-1, 1]) { ell(ctx, sx * r * 0.3, -r * 0.1, r * 0.16, r * 0.2); fillStroke(ctx, '#FFFDF8', 3); ell(ctx, sx * r * 0.3, -r * 0.05, r * 0.07, r * 0.09); ctx.fillStyle = INK; ctx.fill(); }
  ctx.beginPath(); ctx.arc(0, r * 0.25, r * 0.25, 0.1, Math.PI - 0.1); ctx.lineWidth = px(ctx, 4); ctx.strokeStyle = INK; ctx.stroke();
  ctx.restore();
}
function snowflake(ctx, r, col = '#D8F0FF') {
  ctx.save(); ctx.lineCap = 'round';
  for (const [w, c] of [[r * 0.22, INK], [r * 0.13, col]]) { ctx.lineWidth = w; ctx.strokeStyle = c;
    for (let a = 0; a < 6; a++) { ctx.save(); ctx.rotate(a * Math.PI / 3); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -r); ctx.moveTo(0, -r * 0.6); ctx.lineTo(-r * 0.25, -r * 0.8); ctx.moveTo(0, -r * 0.6); ctx.lineTo(r * 0.25, -r * 0.8); ctx.stroke(); ctx.restore(); } }
  ctx.restore();
}
// wall clock (r), hours shown by the hand angle h (0..12), a swept wedge from h0 to h
function clock(ctx, r, h, h0 = null) {
  ctx.save(); ell(ctx, 0, 0, r, r); fillStroke(ctx, '#FFFDF8', 7);
  if (h0 !== null && h > h0) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r * 0.86, -Math.PI / 2 + h0 / 12 * Math.PI * 2, -Math.PI / 2 + h / 12 * Math.PI * 2); ctx.closePath(); ctx.fillStyle = 'rgba(255,200,87,0.75)'; ctx.fill(); }
  for (let i = 0; i < 12; i++) { ctx.save(); ctx.rotate(i / 12 * Math.PI * 2); ctx.fillStyle = INK; ctx.fillRect(-4, -r * 0.92, 8, i % 3 ? r * 0.08 : r * 0.14); ctx.restore(); }
  ctx.lineCap = 'round'; ctx.strokeStyle = INK;
  ctx.save(); ctx.rotate(h / 12 * Math.PI * 2); ctx.lineWidth = r * 0.07; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -r * 0.5); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.rotate(h * Math.PI * 2); ctx.lineWidth = r * 0.045; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -r * 0.75); ctx.stroke(); ctx.restore();
  ell(ctx, 0, 0, r * 0.07, r * 0.07); ctx.fillStyle = C.red; ctx.fill(); ctx.restore();
}
// the night window behind the closed store
function nightWindow(ctx, w, h, t = 0) {
  CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 16), '#16203A', { elev: 1.2, tex: 0.2 });
  ctx.save(); rr(ctx, -w / 2, -h / 2, w, h, 16); ctx.clip();
  for (let i = 0; i < 30; i++) { ctx.fillStyle = `rgba(255,253,240,${0.4 + 0.5 * Math.abs(Math.sin(t * 2 + i))})`; ctx.fillRect(-w / 2 + K.hash(i) * w, -h / 2 + K.hash(i + 50) * h * 0.6, 4, 4); }
  ell(ctx, w * 0.22, -h * 0.22, 60, 60); ctx.fillStyle = '#FFF4C8'; ctx.fill(); ell(ctx, w * 0.22 + 26, -h * 0.22 - 14, 54, 54); ctx.fillStyle = '#16203A'; ctx.fill();
  ctx.fillStyle = '#0D1426'; for (let i = 0; i < 6; i++) ctx.fillRect(-w / 2 + i * w / 6, h / 2 - 120 - K.hash(i + 3) * 160, w / 6 - 10, 400);
  ctx.restore();
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 10); ctx.beginPath(); ctx.moveTo(0, -h / 2); ctx.lineTo(0, h / 2); ctx.moveTo(-w / 2, 0); ctx.lineTo(w / 2, 0); ctx.stroke();
  ctx.strokeStyle = '#FFFDF8'; ctx.lineWidth = px(ctx, 5); ctx.stroke();
}
// a phone ticket (centred, ~520 x 900)
function phone(ctx, draw) {
  CL.cutout(ctx, () => rr(ctx, -260, -450, 520, 900, 60), '#1C1C22', { elev: 2 });
  ctx.save(); rr(ctx, -234, -420, 468, 840, 40); ctx.fillStyle = '#F7F5F0'; ctx.fill(); ctx.clip(); draw(ctx); ctx.restore();
  rr(ctx, -60, -440, 120, 18, 9); ctx.fillStyle = '#1C1C22'; ctx.fill();
}
// tear-off calendar page (centred, ~460 x 520)
function dayPage(ctx, day, n) {
  CL.cutout(ctx, () => rr(ctx, -230, -260, 460, 520, 18), '#FFFDF6', { elev: 1.6 });
  ctx.save(); rr(ctx, -230, -260, 460, 130, 18); ctx.clip(); ctx.fillStyle = C.red; ctx.fillRect(-230, -260, 460, 130); ctx.restore();
  txt(ctx, day, 0, -172, 72, '#FFFDF8'); txt(ctx, String(n), 0, 140, 230, INK);
  for (let i = 0; i < 6; i++) { ell(ctx, -175 + i * 70, -260, 10, 10); ctx.fillStyle = '#5A5A60'; ctx.fill(); }
}
// the exemption document (centred, ~640 x 820)
function doc(ctx, o = {}) {
  CL.cutout(ctx, () => rr(ctx, -320, -410, 640, 820, 10), '#FFFDF6', { elev: 2 });
  ell(ctx, 0, -300, 62, 62); fillStroke(ctx, '#E9E1CC', 5); txt(ctx, '★', 0, -278, 66, '#2E3A59');
  fitTxt(ctx, 'U.S. COPYRIGHT OFFICE', 0, -190, 46, INK, 560); ctx.fillStyle = INK; ctx.fillRect(-260, -168, 520, 5);
  fitTxt(ctx, 'NEW REPAIR EXEMPTION', 0, -105, 38, C.red, 560);
  fitTxt(ctx, 'retail-level commercial', 0, -40, 36, '#3A3A40', 560, 'center', F.xb);
  fitTxt(ctx, 'food preparation equipment', 0, 6, 36, '#3A3A40', 560, 'center', F.xb);
  ctx.fillStyle = 'rgba(23,23,23,0.18)'; for (let i = 0; i < 6; i++) ctx.fillRect(-250, 60 + i * 44, 500 - K.hash(i + 11) * 160, 16);
}
// a wrench (centred, length ~420)
function wrench(ctx, s = 1) {
  ctx.save(); ctx.scale(s, s);
  rr(ctx, -30, -60, 60, 350, 26); fillStroke(ctx, '#B9BEC4', 6);
  ctx.beginPath(); ctx.arc(0, -120, 92, -Math.PI / 2 + 0.45, -Math.PI / 2 - 0.45 + Math.PI * 2); ctx.lineTo(-30, -160); ctx.lineTo(30, -160); ctx.closePath(); fillStroke(ctx, '#B9BEC4', 6);
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(-12, -20, 10, 280);
  ctx.restore();
}
// a red toolbox (base centre at 0)
function toolbox(ctx, s = 1) {
  ctx.save(); ctx.scale(s, s);
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 14); ctx.beginPath(); ctx.moveTo(-60, -150); ctx.lineTo(-60, -200); ctx.lineTo(60, -200); ctx.lineTo(60, -150); ctx.stroke();
  rr(ctx, -170, -160, 340, 160, 14); fillStroke(ctx, C.red, 6); ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(-170, -110, 340, 10);
  rr(ctx, -24, -126, 48, 30, 6); fillStroke(ctx, '#C9CDD2', 4); ctx.restore();
}
// speech/thought bubble
function bubble(ctx, w, h, content, tail = [-0.6, 1]) {
  ctx.beginPath(); ctx.moveTo(tail[0] * w * 0.3 - 30, h / 2 - 10); ctx.lineTo(tail[0] * w * 0.5, h / 2 + 80 * tail[1]); ctx.lineTo(tail[0] * w * 0.3 + 30, h / 2 - 10); ctx.closePath(); fillStroke(ctx, '#FFFDF8', 5);
  CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 40), '#FFFDF8', { elev: 1.4 }); content(ctx);
}

module.exports = { W, H, layer, txt, fitTxt, MONO, CUST, CREW, TECH, ANGRY, badge, machine, scr, counter, cup, thermo, germ, snowflake, clock, nightWindow, phone, dayPage, doc, wrench, toolbox, bubble };
