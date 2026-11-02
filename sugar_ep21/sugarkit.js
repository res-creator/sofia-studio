// Episode 21 "Sugar paid scientists" (USA, 1965–67, revealed 2016) — props and sets on howitsrun_style (people, sets, plates from the
// style reference lawnchair_ep17 / emu_ep12). Generic re-enactment: no logos, no portraits, no copy of the real journal's cover.
// World space: floor at y = 0, up is negative. Props are centred unless noted.
const K = require('../tests/mcd_collage/kit');
const R = require('../hirkit/rig');
const CL = require('../hirkit/collage');
const LT = require('../hirkit/light');
const ST = require('../howitsrun_style/style');
const SE = require('../howitsrun_style/sets');
const { C, F, clamp, lerp, E, rr, hash } = K;
const { INK, fillStroke, ell, px, tube, shade } = R;
const { txt, fitTxt, PAL } = ST;
const CS = require('./cast');
const KRAFT = '#D9B57A', BRICK = '#B4573E';

// ---------- a sugar cube (pseudo-3D: top + two sides), size a ----------
function cube(ctx, a = 40, rot = 0) {
  ctx.save(); ctx.rotate(rot); const h = a * 0.32;
  SE.poly(ctx, [[-a / 2, -a / 2], [a / 2, -a / 2], [a / 2, a / 2], [-a / 2, a / 2]], '#FFFFFF', 3.5);
  SE.poly(ctx, [[-a / 2, -a / 2], [-a / 2 + h, -a / 2 - h], [a / 2 + h, -a / 2 - h], [a / 2, -a / 2]], '#F1F3F6', 3.5);
  SE.poly(ctx, [[a / 2, -a / 2], [a / 2 + h, -a / 2 - h], [a / 2 + h, a / 2 - h], [a / 2, a / 2]], '#D6DCE3', 3.5);
  ctx.fillStyle = 'rgba(150,165,185,0.55)'; for (let i = 0; i < 5; i++) ctx.fillRect(-a / 2 + 4 + hash(i * 7 + a) * (a - 10), -a / 2 + 4 + hash(i * 3 + a) * (a - 10), 3, 3);
  ctx.restore();
}
// falling / bouncing cubes from (x0, y0) to the floor at y = 0 (world), loop period p, n cubes
function cubeRain(ctx, t, x0, y0, n = 8, o = {}) {
  const p = o.p || 1.2, a = o.a || 34;
  for (let i = 0; i < n; i++) { const ph = ((t + i * p / n) % p) / p, vx = (hash(i * 13) - 0.3) * 220 * (o.dir || 1), g = -y0;
    const u = ph, x = x0 + vx * u, y = y0 + g * u * u; if (y > 0) continue; ctx.save(); ctx.translate(x, Math.min(0, y) - a / 2); cube(ctx, a, u * 6 + i); ctx.restore(); }
  // the little pile on the floor
  for (let i = 0; i < (o.pile ?? 7); i++) { ctx.save(); ctx.translate(x0 + (hash(i + 40) - 0.5) * 160 + 40 * (o.dir || 1), -a / 2 - (i > 4 ? a : 0)); cube(ctx, a, (hash(i) - 0.5) * 0.6); ctx.restore(); }
}
// ---------- the money envelope (kraft paper, '$' on it), centred; open 0..1 lifts the flap; cubes peek out ----------
function envelope(ctx, s = 1, o = {}) {
  ctx.save(); ctx.scale(s, s); ctx.rotate(o.rot || 0);
  if (o.cubes !== false) for (let i = 0; i < 4; i++) { ctx.save(); ctx.translate(-70 + i * 46, -86 - (i % 2) * 14); cube(ctx, 42, (hash(i) - 0.5) * 0.5); ctx.restore(); }
  CL.cutout(ctx, () => rr(ctx, -140, -90, 280, 180, 10), o.col || KRAFT, { elev: o.elev ?? 1.4 });
  ctx.strokeStyle = 'rgba(90,60,30,0.55)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-140, 90); ctx.lineTo(0, 0); ctx.lineTo(140, 90); ctx.stroke();
  // the flap (open: up)
  const op = clamp(o.open ?? 1); ctx.beginPath(); ctx.moveTo(-140, -90); ctx.lineTo(0, -90 + lerp(90, -70, op)); ctx.lineTo(140, -90); ctx.closePath(); fillStroke(ctx, shade(o.col || KRAFT, -0.08), 4);
  if (o.mark !== false) { ell(ctx, 0, 30, 40, 40); fillStroke(ctx, C.yellow, 4); txt(ctx, '$', 0, 52, 58, INK); }
  if (o.text) fitTxt(ctx, o.text, 0, 70, 26, INK, 240, 'center', ST.FONT.type);
  ctx.restore();
}
// ---------- sugar bowl with a lid, base at 0 (~200 tall at s = 1), label SUGAR ----------
function sugarBowl(ctx, s = 1, o = {}) {
  ctx.save(); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-120, -150); ctx.bezierCurveTo(-130, -40, -80, 0, -50, 0); ctx.lineTo(50, 0); ctx.bezierCurveTo(80, 0, 130, -40, 120, -150); ctx.closePath(); fillStroke(ctx, '#FFFDF8', 5);
  ctx.save(); ctx.clip(); ell(ctx, -110, -60, 40, 110); ctx.fillStyle = 'rgba(80,110,160,0.15)'; ctx.fill(); ctx.restore();
  ctx.fillStyle = PAL.blue; ctx.fillRect(-112, -122, 224, 10);
  fitTxt(ctx, 'SUGAR', 0, -58, 44, PAL.navy, 200);
  if (o.lid !== false) { ell(ctx, 0, -158, 132, 22); fillStroke(ctx, '#F1F3F6', 5); ell(ctx, 0, -184, 18, 14); fillStroke(ctx, '#FFFDF8', 4);
    for (let i = 0; i < 3; i++) { ctx.save(); ctx.translate(-50 + i * 40, -188 - (i % 2) * 18); cube(ctx, 30, (hash(i + 9) - 0.5)); ctx.restore(); } }
  ctx.restore();
}
// ---------- a stick of butter on its wrapper (base at 0), label FAT ----------
function butter(ctx, s = 1) {
  ctx.save(); ctx.scale(s, s);
  CL.cutout(ctx, () => rr(ctx, -170, -40, 340, 40, 8), '#FFFDF8', { elev: 1 });
  SE.poly(ctx, [[-150, -40], [130, -40], [150, -120], [-130, -120]], '#F9DC6E', 5);
  SE.poly(ctx, [[130, -40], [170, -60], [190, -140], [150, -120]], '#E8C24E', 5);
  SE.poly(ctx, [[-130, -120], [150, -120], [190, -140], [-90, -140]], '#FCE79A', 5);
  fitTxt(ctx, 'FAT', 0, -66, 46, '#8A5A1A', 200);
  ctx.restore();
}
// ---------- a target (rings), radius r ----------
function target(ctx, r = 120) { for (let i = 0; i < 4; i++) { ell(ctx, 0, 0, r * (1 - i * 0.24), r * (1 - i * 0.24)); fillStroke(ctx, i % 2 ? '#FFFDF8' : C.red, 5); } }
// ---------- a paper heart with a question mark (centred, ~260 wide at s = 1) ----------
function heart(ctx, s = 1, q = '?') {
  ctx.save(); ctx.scale(s, s);
  CL.cutout(ctx, () => { ctx.beginPath(); ctx.moveTo(0, 110); ctx.bezierCurveTo(-170, -10, -130, -150, -40, -130); ctx.quadraticCurveTo(-10, -122, 0, -90); ctx.quadraticCurveTo(10, -122, 40, -130); ctx.bezierCurveTo(130, -150, 170, -10, 0, 110); ctx.closePath(); }, C.red, { elev: 1.6 });
  if (q) txt(ctx, q, 0, 20, 130, PAL.cream);
  ctx.restore();
}
// ---------- a journal (magazine) lying flat / standing: cover with title (generic, not the real journal's design) ----------
function journal(ctx, s = 1, o = {}) {
  ctx.save(); ctx.scale(s, s); ctx.rotate(o.rot || 0); const w = 520, h = 700;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 10), '#FBF6EA', { elev: o.elev ?? 1.8 });
  ctx.save(); rr(ctx, -w / 2, -h / 2, w, h, 10); ctx.clip(); ctx.fillStyle = o.band || '#2E3A59'; ctx.fillRect(-w / 2, -h / 2, w, 150); ctx.restore();
  fitTxt(ctx, o.title || 'MEDICAL JOURNAL', 0, -h / 2 + 70, 52, PAL.cream, w - 60); fitTxt(ctx, o.year || '1967', 0, -h / 2 + 126, 36, C.yellow, w - 60);
  fitTxt(ctx, o.head || 'REVIEW', 0, -h / 2 + 230, 58, INK, w - 70, 'center', ST.FONT.type);
  if (o.sub !== false) { fitTxt(ctx, o.sub || 'DIET & HEART DISEASE', 0, -h / 2 + 290, 34, '#4A4A48', w - 70, 'center', ST.FONT.type); }
  ctx.fillStyle = 'rgba(23,23,23,0.22)'; for (let i = 0; i < (o.lines ?? 7); i++) ctx.fillRect(-w / 2 + 50, -h / 2 + 350 + i * 40, (w - 100) * (0.6 + 0.4 * hash(i + 3)), 12);
  if (o.footer) { ctx.fillStyle = '#E9E1CE'; ctx.fillRect(-w / 2 + 30, h / 2 - 100, w - 60, 70); fitTxt(ctx, o.footer, 0, h / 2 - 54, 34, INK, w - 90, 'center', ST.FONT.type); }
  ctx.restore();
}
// open journal spread (two pages), centred, ~1000 x 640; draws page contents via o.left / o.right
function spread(ctx, o = {}) {
  const w = 980, h = 640;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 12), '#FBF6EA', { elev: 2 });
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, -h / 2 + 10); ctx.lineTo(0, h / 2 - 10); ctx.stroke();
  for (const sx of [-1, 1]) { ctx.fillStyle = 'rgba(23,23,23,0.16)'; for (let i = 0; i < 3; i++) ctx.fillRect(sx < 0 ? -w / 2 + 40 : 40, -h / 2 + 40 + i * 30, (w / 2 - 80) * (0.7 + 0.3 * hash(i + sx)), 10); }
  if (o.left) { ctx.save(); ctx.translate(-w / 4, 60); o.left(ctx); ctx.restore(); }
  if (o.right) { ctx.save(); ctx.translate(w / 4, 60); o.right(ctx); ctx.restore(); }
}
// a stack of journals (base at 0), n high, ~420 wide
function stack(ctx, n = 10, seed = 0) {
  const cols = ['#2E3A59', '#B4573E', '#3E8C6E', '#C9A06A', '#5B8DD6', '#8A5A6A'];
  for (let i = 0; i < n; i++) { const w = 380 + hash(i + seed) * 60, x = (hash(i * 3 + seed) - 0.5) * 40; rr(ctx, x - w / 2, -(i + 1) * 34, w, 32, 5); fillStroke(ctx, cols[(i + seed) % cols.length], 4);
    ctx.fillStyle = '#FBF6EA'; ctx.fillRect(x - w / 2 + 10, -(i + 1) * 34 + 8, w - 60, 16); }
}
// ---------- a study sheet on a board (centred, 220 x 280) ----------
function study(ctx, s = 1, title = 'STUDY') {
  ctx.save(); ctx.scale(s, s); CL.cutout(ctx, () => rr(ctx, -110, -140, 220, 280, 6), '#FFFDF8', { elev: 1 });
  fitTxt(ctx, title, 0, -90, 38, INK, 190, 'center', ST.FONT.type); ctx.fillStyle = 'rgba(23,23,23,0.2)'; for (let i = 0; i < 5; i++) ctx.fillRect(-80, -50 + i * 30, 160 * (0.6 + 0.4 * hash(i + s * 10)), 10);
  ell(ctx, 0, -128, 12, 12); fillStroke(ctx, C.red, 3); ctx.restore();
}
// ---------- the typed letter (centred, 760 x 980): typewriter lines, the quote typed up to n characters ----------
function letter(ctx, o = {}) {
  const w = 760, h = 980; ctx.save(); ctx.rotate(o.rot ?? -0.02);
  CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 6), '#FBF6EA', { elev: 2 });
  fitTxt(ctx, o.head || 'HARVARD · 1965', w / 2 - 50, -h / 2 + 80, 30, '#6A6A68', 360, 'right', ST.FONT.type);
  txt(ctx, 'Dear Sir,', -w / 2 + 60, -h / 2 + 170, 36, INK, 'left', ST.FONT.type);
  ctx.fillStyle = 'rgba(23,23,23,0.18)'; for (let i = 0; i < 3; i++) ctx.fillRect(-w / 2 + 60, -h / 2 + 220 + i * 44, (w - 120) * (0.7 + 0.3 * hash(i + 20)), 12);
  const Q = o.quote || []; let left = o.n ?? 1e9;   // lines of the quote, typed progressively
  ctx.save(); ctx.translate(0, -h / 2 + 400);
  if (o.hl > 0) { ctx.fillStyle = `rgba(255,200,87,${0.75 * clamp(o.hl)})`; ctx.fillRect(-w / 2 + 44, -54, (w - 88) * clamp(o.hl * 1.4), Q.length * 70 + 20); }
  Q.forEach((L, i) => { const s = L.slice(0, Math.max(0, left)); left -= L.length; txt(ctx, s, -w / 2 + 60, i * 70, 44, INK, 'left', ST.FONT.type); });
  ctx.restore();
  ctx.fillStyle = 'rgba(23,23,23,0.18)'; for (let i = 0; i < 4; i++) ctx.fillRect(-w / 2 + 60, h / 2 - 330 + i * 44, (w - 120) * (0.5 + 0.5 * hash(i + 30)), 12);
  txt(ctx, 'Sincerely,', -w / 2 + 60, h / 2 - 110, 34, INK, 'left', ST.FONT.type);
  ctx.strokeStyle = PAL.navy; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-w / 2 + 70, h / 2 - 50); ctx.bezierCurveTo(-w / 2 + 120, h / 2 - 90, -w / 2 + 160, h / 2 - 10, -w / 2 + 220, h / 2 - 60); ctx.bezierCurveTo(-w / 2 + 250, h / 2 - 80, -w / 2 + 270, h / 2 - 30, -w / 2 + 320, h / 2 - 55); ctx.stroke();
  ctx.restore();
}
// ---------- a typewriter (base on the desk at 0) ----------
function typewriter(ctx, s = 1, t = 0, typing = 0) {
  ctx.save(); ctx.scale(s, s);
  rr(ctx, -170, -110, 340, 110, 16); fillStroke(ctx, '#3A4A48', 5); rr(ctx, -190, -150, 380, 44, 18); fillStroke(ctx, '#2A3634', 5);
  ctx.save(); ctx.translate(Math.sin(t * 4) * 20 * typing, 0); rr(ctx, -120, -260, 240, 120, 4); fillStroke(ctx, '#FBF6EA', 4); ctx.fillStyle = 'rgba(23,23,23,0.3)'; for (let i = 0; i < 3; i++) ctx.fillRect(-100, -240 + i * 22, 180 * hash(i + 2), 7); ctx.restore();
  for (let r = 0; r < 3; r++) for (let i = 0; i < 8; i++) { const down = typing && hash(Math.floor(t * 12) * 31 + i + r * 8) > 0.85 ? 4 : 0; ell(ctx, -130 + i * 37 + r * 10, -78 + r * 24 + down, 12, 9); fillStroke(ctx, '#E9E1CE', 2.5); }
  ctx.restore();
}
// ---------- archive box (base at 0, 260 x 180) with a typed label ----------
function archiveBox(ctx, s = 1, lab = '1965', o = {}) {
  ctx.save(); ctx.scale(s, s);
  rr(ctx, -130, -180, 260, 180, 6); fillStroke(ctx, '#C9A06A', 5); rr(ctx, -140, -196, 280, 34, 6); fillStroke(ctx, '#B88E58', 5);
  if (o.lidOpen) { ctx.save(); ctx.translate(-140, -196); ctx.rotate(-1.0 * o.lidOpen); rr(ctx, 0, 0, 280, 34, 6); fillStroke(ctx, '#B88E58', 5); ctx.restore(); }
  rr(ctx, -70, -130, 140, 56, 4); fillStroke(ctx, '#FBF6EA', 3); fitTxt(ctx, lab, 0, -92, 30, INK, 120, 'center', ST.FONT.type);
  ell(ctx, 0, -40, 26, 12); ctx.fillStyle = '#7A5A30'; ctx.fill();
  ctx.restore();
}
// archive shelves (floor y = 0), boxes on 4 levels, x0..x1
function shelves(ctx, x0, x1, seed = 0) {
  for (let lv = 0; lv < 4; lv++) { const y = -60 - lv * 330; rr(ctx, x0, y - 16, x1 - x0, 22, 4); fillStroke(ctx, '#8E959E', 4);
    for (let x = x0 + 30; x < x1 - 260; x += 300) { ctx.save(); ctx.translate(x + 130, y - 16); archiveBox(ctx, 0.9, ['1963', '1964', '1965', '1966', '1967', 'SRF'][(Math.floor(x / 300) + lv + seed + 60) % 6]); ctx.restore(); } }
  for (const x of [x0, x1]) { rr(ctx, x - 10, -1400, 20, 1400, 4); fillStroke(ctx, '#6E747C', 4); }
}
// ---------- price tag on a string (hangs from (0,0), centred card below) ----------
function priceTag(ctx, s, txt1, swing = 0) {
  ctx.save(); ctx.rotate(swing); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 4); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 110); ctx.stroke();
  ctx.translate(0, 110); ctx.scale(s, s);
  CL.cutout(ctx, () => { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(70, 50); ctx.lineTo(70, 320); ctx.lineTo(-70, 320); ctx.lineTo(-70, 50); ctx.closePath(); }, C.yellow, { elev: 1.4 });
  ell(ctx, 0, 40, 12, 12); fillStroke(ctx, '#FFFDF8', 3);
  ctx.save(); ctx.translate(0, 190); ctx.rotate(-Math.PI / 2); fitTxt(ctx, txt1, 0, 22, 70, INK, 240); ctx.restore();
  ctx.restore();
}
// ---------- the brick campus building (floor y = 0, centred, ~1900 wide): brick walls, white trim, columns, cupola ----------
function campus(ctx, t) {
  SE.sky(ctx, t, { clouds: 3, hills: false, sunX: -900, sunY: -1900 });
  // far trees
  for (let i = 0; i < 16; i++) { const x = -2600 + i * 340; ell(ctx, x, -560 - hash(i) * 80, 190, 170); ctx.fillStyle = i % 2 ? '#6FA46E' : '#7FB27A'; ctx.fill(); }
  ctx.save(); ctx.translate(0, -60);
  // wings
  for (const sx of [-1, 1]) { rr(ctx, sx > 0 ? 420 : -1400, -900, 980, 900, 4); fillStroke(ctx, BRICK, 5);
    ctx.save(); rr(ctx, sx > 0 ? 420 : -1400, -900, 980, 900, 4); ctx.clip(); ctx.strokeStyle = 'rgba(80,30,20,0.25)'; ctx.lineWidth = 2; for (let y = -900; y < 0; y += 34) { ctx.beginPath(); ctx.moveTo(-1500, y); ctx.lineTo(1500, y); ctx.stroke(); } ctx.restore();
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { const x = (sx > 0 ? 480 : -1340) + c * 240; rr(ctx, x, -820 + r * 270, 120, 190, 4); fillStroke(ctx, '#FFFDF8', 4); rr(ctx, x + 12, -808 + r * 270, 96, 166, 2); fillStroke(ctx, '#BFD8EE', 3); ctx.strokeStyle = '#FFFDF8'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x + 60, -808 + r * 270); ctx.lineTo(x + 60, -642 + r * 270); ctx.stroke(); }
    rr(ctx, sx > 0 ? 410 : -1410, -930, 1000, 40, 4); fillStroke(ctx, '#FFFDF8', 4); }
  // centre block with columns + pediment + cupola
  rr(ctx, -440, -1100, 880, 1100, 4); fillStroke(ctx, shade(BRICK, 0.05), 5);
  SE.poly(ctx, [[-480, -1100], [0, -1330], [480, -1100]], '#FFFDF8', 5);
  rr(ctx, -120, -1500, 240, 220, 6); fillStroke(ctx, '#FFFDF8', 5); SE.poly(ctx, [[-140, -1500], [0, -1640], [140, -1500]], '#5E7A6E', 5); rr(ctx, -50, -1460, 100, 130, 40); fillStroke(ctx, '#BFD8EE', 4);
  rr(ctx, -460, -1110, 920, 50, 4); fillStroke(ctx, '#FFFDF8', 4);
  for (let i = 0; i < 5; i++) { const x = -360 + i * 180; rr(ctx, x - 34, -1060, 68, 1000, 6); fillStroke(ctx, '#FFFDF8', 5); ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(x + 6, -1050, 20, 980); }
  rr(ctx, -110, -360, 220, 300, 8); fillStroke(ctx, '#6A4024', 5);
  rr(ctx, -480, -60, 960, 60, 4); fillStroke(ctx, '#E9E1CE', 4);
  ctx.restore();
  // lawn + path
  ctx.fillStyle = '#7CC27A'; ctx.fillRect(-4000, 0, 8000, 1800); ctx.fillStyle = '#E9E1CE'; ctx.beginPath(); ctx.moveTo(-180, 0); ctx.lineTo(180, 0); ctx.lineTo(520, 1800); ctx.lineTo(-520, 1800); ctx.closePath(); ctx.fill();
}
// ---------- a 1960s office (floor y = 0): wood panel wall, window, framed diploma ----------
function office(ctx, t, o = {}) {
  SE.room(ctx, t, { wall: o.wall || '#E8DCC4', floor: 'wood', window: o.window ?? 650, frame: o.frame === false ? undefined : { x: o.frameX ?? -500, y: -1050, draw: g => { fitTxt(g, 'DIPLOMA', 0, -20, 34, INK, 220, 'center', ST.FONT.type); ell(g, 0, 40, 26, 26); fillStroke(g, C.red, 3); } } });
  ctx.fillStyle = 'rgba(138,90,52,0.22)'; ctx.fillRect(-3000, -560, 6000, 500); ctx.strokeStyle = 'rgba(70,40,20,0.3)'; ctx.lineWidth = 3; for (let x = -3000; x < 3000; x += 220) { ctx.beginPath(); ctx.moveTo(x, -560); ctx.lineTo(x, -60); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-3000, -560); ctx.lineTo(3000, -560); ctx.stroke();
}
// a corkboard (centred, 1000 x 640)
function board(ctx) { CL.cutout(ctx, () => rr(ctx, -500, -320, 1000, 640, 14), '#C99A64', { elev: 1.6 }); ctx.fillStyle = 'rgba(90,50,20,0.15)'; for (let i = 0; i < 300; i++) ctx.fillRect(-490 + hash(i) * 980, -310 + hash(i + 999) * 620, 4, 4); rr(ctx, -500, -320, 1000, 640, 14); ctx.lineWidth = px(ctx, 12); ctx.strokeStyle = '#8A5A34'; ctx.stroke(); }
// a living room armchair (base at 0, facing +x)
function armchair(ctx, col = '#7A3A3A') { rr(ctx, -160, -520, 110, 520, 30); fillStroke(ctx, col, 5); rr(ctx, -150, -250, 330, 120, 30); fillStroke(ctx, shade(col, 0.08), 5); rr(ctx, 100, -320, 80, 200, 30); fillStroke(ctx, shade(col, -0.1), 5); tube(ctx, [[-130, -130], [-130, 0]], 16, '#3A2A22', 4); tube(ctx, [[150, -130], [150, 0]], 16, '#3A2A22', 4); }
// a floor lamp (base at 0)
function lamp(ctx) { tube(ctx, [[0, 0], [0, -900]], 10, '#3A2A22', 4); SE.poly(ctx, [[-110, -880], [110, -880], [70, -1040], [-70, -1040]], '#F2D59A', 5); LT.glow(ctx, 0, -860, 260, 'rgba(255,230,160,1)', 0.3); }

module.exports = { CS, KRAFT, BRICK, cube, cubeRain, envelope, sugarBowl, butter, target, heart, journal, spread, stack, study, letter, typewriter, archiveBox, shelves, priceTag, campus, office, board, armchair, lamp };
