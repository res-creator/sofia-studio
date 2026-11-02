// Episode 23 "Who said breakfast matters?" — props and sets on howitsrun_style (people, sets, plates from the style reference
// lawnchair_ep17 / emu_ep12). Generic re-enactment: no logos (names as plain text only), no portraits. World: floor y = 0, up negative.
const K = require('../tests/mcd_collage/kit');
const R = require('../hirkit/rig');
const CL = require('../hirkit/collage');
const LT = require('../hirkit/light');
const ST = require('../howitsrun_style/style');
const SE = require('../howitsrun_style/sets');
const { C, clamp, lerp, E, rr, hash } = K;
const { INK, fillStroke, ell, px, tube, shade } = R;
const { txt, fitTxt, PAL } = ST;
const CS = require('./cast');
const BAC = '#C8574A', FAT = '#F6E3D0';

// ---------- small food props ----------
function flake(ctx, x, y, r, seed) { ctx.save(); ctx.translate(x, y); ctx.rotate(hash(seed) * 6); ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, k = r * (0.7 + hash(seed * 7 + i) * 0.5); ctx.lineTo(Math.cos(a) * k, Math.sin(a) * k * 0.7); } ctx.closePath(); fillStroke(ctx, '#F0B848', 3); ctx.restore(); }
function bowl(ctx, s = 1, full = 1) { // cereal bowl, base at 0, ~110 tall, 300 wide
  ctx.save(); ctx.scale(s, s);
  if (full > 0) for (let i = 0; i < 14; i++) flake(ctx, -110 + (i % 7) * 37 + (hash(i) - 0.5) * 12, -96 - Math.floor(i / 7) * 16 - hash(i + 3) * 10, 22, i);
  ctx.beginPath(); ctx.moveTo(-150, -96); ctx.quadraticCurveTo(-140, 0, 0, 0); ctx.quadraticCurveTo(140, 0, 150, -96); ctx.closePath(); fillStroke(ctx, '#FFFDF8', 5);
  ctx.fillStyle = PAL.blue; ctx.fillRect(-138, -70, 276, 12); ctx.beginPath(); ctx.moveTo(-150, -96); ctx.quadraticCurveTo(-140, 0, 0, 0); ctx.quadraticCurveTo(140, 0, 150, -96); ctx.closePath(); ctx.lineWidth = px(ctx, 5); ctx.strokeStyle = INK; ctx.stroke();
  ctx.restore();
}
const spoon = g => { tube(g, [[0, 40], [0, -60]], 12, '#B9BEC2', 3.5); ell(g, 0, -78, 20, 26); fillStroke(g, '#C9CED6', 3.5); };
function baconStrip(ctx, x, y, s = 1, rot = 0, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const path = (o) => { ctx.beginPath(); for (let i = 0; i <= 12; i++) { const u = i / 12, xx = -120 + u * 240, yy = Math.sin(u * 9 + t) * 10 - 22 + o; ctx.lineTo(xx, yy); } for (let i = 12; i >= 0; i--) { const u = i / 12, xx = -120 + u * 240, yy = Math.sin(u * 9 + t) * 10 + 22 + o; ctx.lineTo(xx, yy); } ctx.closePath(); };
  path(0); fillStroke(ctx, BAC, 4.5);
  ctx.strokeStyle = FAT; ctx.lineWidth = 7; ctx.beginPath(); for (let i = 0; i <= 12; i++) { const u = i / 12; ctx.lineTo(-114 + u * 228, Math.sin(u * 9 + t) * 10 - 4); } ctx.stroke();
  ctx.restore();
}
function egg(ctx, x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, k = 80 + Math.sin(i * 2.7) * 12; ctx.lineTo(Math.cos(a) * k, Math.sin(a) * k * 0.62); } ctx.closePath(); fillStroke(ctx, '#FFFDF8', 4.5); ell(ctx, 8, -4, 32, 28); fillStroke(ctx, '#FFC23A', 4); ell(ctx, 0, -14, 10, 7); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fill(); ctx.restore(); }
function toast(ctx, x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(-70, 60); ctx.lineTo(-70, -30); ctx.quadraticCurveTo(-90, -90, -30, -90); ctx.quadraticCurveTo(0, -110, 30, -90); ctx.quadraticCurveTo(90, -90, 70, -30); ctx.lineTo(70, 60); ctx.closePath(); fillStroke(ctx, '#B9783E', 5); rr(ctx, -54, -66, 108, 112, 18); ctx.fillStyle = '#EBC88A'; ctx.fill(); ctx.restore(); }
function plate(ctx, s = 1) { ctx.save(); ctx.scale(s, s); ell(ctx, 0, 0, 190, 44); fillStroke(ctx, '#FFFDF8', 5); ell(ctx, 0, -4, 130, 28); ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 4; ctx.stroke(); ctx.restore(); }
// the "heavy breakfast" mountain on a plate (base at 0)
function mountain(ctx, s = 1, u = 1) {
  ctx.save(); ctx.scale(s, s); plate(ctx, 1.25);
  const k = E.back(clamp(u), 1.8); ctx.scale(1, k);
  for (let i = 0; i < 4; i++) { rr(ctx, -150 + i * 10, -60 - i * 36, 300 - i * 20, 40, 18); fillStroke(ctx, '#E2A55A', 4.5); }     // pancakes
  egg(ctx, -60, -220, 0.8); egg(ctx, 70, -236, 0.75);
  baconStrip(ctx, 0, -290, 0.9, -0.1); baconStrip(ctx, 10, -330, 0.85, 0.12);
  for (const [x, y] of [[-110, -380], [-30, -400], [60, -392]]) { ctx.save(); ctx.translate(x, y); ctx.rotate(0.4); rr(ctx, -60, -18, 120, 36, 18); fillStroke(ctx, '#A8553A', 4); ctx.restore(); } // sausages
  ell(ctx, 120, -400, 50, 40); fillStroke(ctx, '#E8C88A', 4); // a muffin
  ctx.restore();
}
function lightPlate(ctx, s = 1) { ctx.save(); ctx.scale(s, s); plate(ctx, 0.9); toast(ctx, 0, -60, 0.7); ctx.restore(); }

// ---------- the press-conference podium (base at 0), microphones, flash bulbs ----------
function podium(ctx, s = 1) {
  ctx.save(); ctx.scale(s, s);
  SE.poly(ctx, [[-200, 0], [200, 0], [230, -380], [-230, -380]], '#6A4024', 5);
  rr(ctx, -260, -410, 520, 44, 10); fillStroke(ctx, '#8A5A34', 5);
  ell(ctx, 0, -200, 86, 86); fillStroke(ctx, '#C9A06A', 5); ell(ctx, 0, -200, 62, 62); fillStroke(ctx, '#E9D9B0', 4); txt(ctx, '★', 0, -180, 70, '#6A4024');
  ctx.restore();
}
function mics(ctx, s = 1) { // a cluster of 3 old microphones on stalks, standing on the podium top (y = 0)
  ctx.save(); ctx.scale(s, s);
  for (const [x, a, col] of [[-90, -0.25, '#3A3A40'], [0, 0, '#5A606B'], [90, 0.25, '#3A3A40']]) { ctx.save(); ctx.translate(x, 0); ctx.rotate(a); tube(ctx, [[0, 0], [0, -110]], 10, '#2A2A30', 3.5); rr(ctx, -26, -170, 52, 70, 22); fillStroke(ctx, col, 4); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 3; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-18, -152 + i * 16); ctx.lineTo(18, -152 + i * 16); ctx.stroke(); } ctx.restore(); }
  ctx.restore();
}
function flash(ctx, x, y, r, u) { // a camera flash burst, u 0..1 (fades)
  if (u <= 0 || u >= 1) return; const a = Math.sin(u * Math.PI); ctx.save(); ctx.translate(x, y); ctx.globalAlpha *= a;
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 2.2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.3, 'rgba(255,250,220,0.7)'); g.addColorStop(1, 'rgba(255,250,220,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r * 2.2, 0, 7); ctx.fill();
  ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); for (let i = 0; i < 16; i++) { const aa = i / 16 * Math.PI * 2, k = i % 2 ? r * 0.35 : r; ctx.lineTo(Math.cos(aa) * k, Math.sin(aa) * k); } ctx.closePath(); ctx.fill(); ctx.restore();
}
const pressCam = g => { rr(g, -50, -40, 100, 76, 8); fillStroke(g, '#2A2A30', 4); ell(g, 20, 0, 22, 22); fillStroke(g, '#5A606B', 3.5); tube(g, [[-30, -40], [-30, -90]], 6, '#8A8F98', 3); ell(g, -30, -104, 30, 22); fillStroke(g, '#C9CED6', 3.5); };
// the press room (floor y = 0): curtain wall, banner
function pressRoom(ctx, t) {
  SE.room(ctx, t, { wall: '#3E4F78', floor: 'carpet', carpet: '#7A3A3A' });
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; for (let x = -3000; x < 3000; x += 120) ctx.fillRect(x, -2400, 50, 2340);   // curtain folds
  LT.glow(ctx, 0, -700, 900, 'rgba(255,240,200,1)', 0.35);
}

// ---------- 1950s kitchen (floor y = 0) ----------
function kitchen(ctx, t) {
  SE.room(ctx, t, { wall: '#CFE8DC', floor: 'tile', window: -520 });
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; for (let y = -700; y > -1500; y -= 60) ctx.fillRect(-3000, y, 6000, 4);       // wall tiles band
  // fridge (rounded, 1950s)
  ctx.save(); ctx.translate(820, 0); rr(ctx, -170, -980, 340, 980, 60); fillStroke(ctx, '#F4F1E8', 5); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 4); ctx.beginPath(); ctx.moveTo(-170, -620); ctx.lineTo(170, -620); ctx.stroke(); rr(ctx, -150, -760, 22, 110, 8); fillStroke(ctx, '#C9CED6', 3); rr(ctx, -150, -560, 22, 140, 8); fillStroke(ctx, '#C9CED6', 3); ctx.restore();
}
function table(ctx, x, w = 640, top = -300, col = '#E9474F') { // chrome-leg diner table, top at y = top
  ctx.save(); ctx.translate(x, 0); for (const sx of [-1, 1]) tube(ctx, [[sx * (w / 2 - 60), top + 20], [sx * (w / 2 - 60), 0]], 16, '#B9BEC2', 4);
  rr(ctx, -w / 2, top, w, 34, 10); fillStroke(ctx, col, 5); ctx.fillStyle = '#C9CED6'; ctx.fillRect(-w / 2 + 6, top + 26, w - 12, 8); ctx.restore();
}
function milk(ctx, s = 1) { ctx.save(); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(-40, -150); ctx.quadraticCurveTo(-40, -180, -24, -200); ctx.lineTo(-24, -230); ctx.lineTo(24, -230); ctx.lineTo(24, -200); ctx.quadraticCurveTo(40, -180, 40, -150); ctx.lineTo(40, 0); ctx.closePath(); fillStroke(ctx, '#FFFFFF', 4.5); rr(ctx, -28, -248, 56, 20, 6); fillStroke(ctx, C.red, 3.5); ctx.restore(); }
// framed sampler with the slogan (centred), lines of text
function sampler(ctx, lines, w = 760, h = 330, o = {}) {
  rr(ctx, -w / 2, -h / 2, w, h, 10); fillStroke(ctx, '#8A5A34', 6); CL.cutout(ctx, () => rr(ctx, -w / 2 + 26, -h / 2 + 26, w - 52, h - 52, 6), '#FBF6EA', { elev: 0.4, tex: 0.6 });
  const n = lines.length, lh = (h - 90) / n; lines.forEach((s, i) => fitTxt(ctx, s, 0, -h / 2 + 60 + lh * (i + 0.72), Math.min(64, lh * 0.8), i === o.hl ? C.red : INK, w - 110));
}

// ---------- 1917 health magazine (centred, 560 x 760) ----------
function magazine(ctx, s = 1) {
  ctx.save(); ctx.scale(s, s); const w = 560, h = 760;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 8), '#F3E7CC', { elev: 2 });
  ctx.save(); rr(ctx, -w / 2, -h / 2, w, h, 8); ctx.clip(); ctx.fillStyle = '#2F6E5A'; ctx.fillRect(-w / 2, -h / 2, w, 170); ctx.restore();
  fitTxt(ctx, 'GOOD HEALTH', 0, -h / 2 + 100, 76, '#FFFDF8', w - 60, 'center', ST.FONT.type); fitTxt(ctx, 'BATTLE CREEK, MICH. · 1917', 0, -h / 2 + 148, 28, '#E9D9B0', w - 60, 'center', ST.FONT.type);
  ctx.save(); ctx.translate(0, -60); LT.glow(ctx, 0, -40, 150, 'rgba(255,200,87,1)', 0.6); ell(ctx, 0, -50, 70, 70); fillStroke(ctx, C.yellow, 4); ctx.translate(0, 70); bowl(ctx, 0.75); ctx.restore();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 3; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-w / 2 + 50, 120 + i * 30); ctx.lineTo(w / 2 - 50 - (i === 3 ? 160 : 0), 120 + i * 30); ctx.stroke(); }
  ctx.save(); ctx.translate(0, 300); ctx.rotate(-0.02); CL.cutout(ctx, () => rr(ctx, -250, -50, 500, 92, 8), C.yellow, { elev: 0.8, tex: 0.4 }); fitTxt(ctx, '"...THE MOST IMPORTANT', 0, -12, 32, INK, 470, 'center', ST.FONT.type); fitTxt(ctx, 'MEAL OF THE DAY"', 0, 26, 32, INK, 470, 'center', ST.FONT.type); ctx.restore();
  ctx.restore();
}
// a wooden desk top seen from the front-high angle (screen-space fill, y0 = top line)
function deskTop(ctx, y0) { ctx.fillStyle = '#9A6A40'; ctx.fillRect(0, y0, 1080, 1920 - y0); ctx.strokeStyle = 'rgba(60,30,10,0.25)'; ctx.lineWidth = 4; for (let y = y0 + 60; y < 1920; y += 90) { ctx.beginPath(); ctx.moveTo(0, y); ctx.bezierCurveTo(300, y + 10, 700, y - 12, 1080, y + 4); ctx.stroke(); } }

// ---------- the sanitarium (floor y = 0, centred) ----------
function sanitarium(ctx) {
  rr(ctx, -900, -1100, 1800, 1100, 6); fillStroke(ctx, '#EDE3CF', 5);
  rr(ctx, -340, -1300, 680, 220, 6); fillStroke(ctx, '#E6DAC0', 5); SE.poly(ctx, [[-380, -1300], [0, -1460], [380, -1300]], '#B8664A', 5);
  for (let r = 0; r < 5; r++) for (let c = 0; c < 9; c++) { if (r === 4 && c >= 3 && c <= 5) continue; rr(ctx, -840 + c * 190, -1040 + r * 190, 100, 120, 6); fillStroke(ctx, '#BFE0FA', 4); }
  for (let c = 0; c < 3; c++) { rr(ctx, -270 + c * 200, -1240, 80, 110, 6); fillStroke(ctx, '#BFE0FA', 4); }
  rr(ctx, -360, -300, 720, 40, 6); fillStroke(ctx, '#FFFDF8', 5); for (let i = 0; i < 6; i++) { rr(ctx, -330 + i * 128, -262, 30, 262, 4); fillStroke(ctx, '#FFFDF8', 4); }
  rr(ctx, -90, -220, 180, 220, 6); fillStroke(ctx, '#8A5A34', 5);
}
function tree(ctx, x, s = 1) { ctx.save(); ctx.translate(x, 0); ctx.scale(s, s); tube(ctx, [[0, 0], [0, -260]], 40, '#7A4A2A', 5); for (const [dx, dy, r] of [[-70, -330, 110], [70, -340, 110], [0, -440, 130]]) { ell(ctx, dx, dy, r, r * 0.9); fillStroke(ctx, '#5FA36A', 5); } ctx.restore(); }
// a plain cereal box (no face), base centre at 0; pour: tilt angle
function plainBox(ctx, s = 1) { ctx.save(); ctx.scale(s, s); CL.cutout(ctx, () => rr(ctx, -90, -260, 180, 260, 6), '#F2B33D', { elev: 1 }); ctx.save(); rr(ctx, -90, -260, 180, 260, 6); ctx.clip(); ctx.fillStyle = C.red; ctx.fillRect(-90, -260, 180, 70); ctx.restore(); rr(ctx, -90, -260, 180, 260, 6); ctx.lineWidth = px(ctx, 4.5); ctx.strokeStyle = INK; ctx.stroke(); fitTxt(ctx, 'CORN', 0, -228, 34, '#FFFDF8', 150); fitTxt(ctx, 'FLAKES', 0, -196, 30, '#FFFDF8', 150); bowl(ctx, 0.42); ctx.restore(); }

// ---------- 1920s office (floor y = 0) ----------
function office(ctx, t, o = {}) {
  SE.room(ctx, t, { wall: o.wall || '#E8DCC4', floor: 'wood', window: o.window ?? -700, frame: o.frame });
  ctx.fillStyle = 'rgba(120,80,40,0.10)'; ctx.fillRect(-3000, -460, 6000, 400); ctx.strokeStyle = 'rgba(120,80,40,0.35)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-3000, -460); ctx.lineTo(3000, -460); ctx.stroke(); // wainscot
}
function crate(ctx, s = 1, label = 'BACON') { // wooden crate with bacon slabs on top (base at 0)
  ctx.save(); ctx.scale(s, s);
  for (let i = 0; i < 3; i++) baconStrip(ctx, -80 + i * 80, -236 - i * 6, 0.75, -0.15 + i * 0.12, i);
  rr(ctx, -200, -230, 400, 230, 6); fillStroke(ctx, '#C9A06A', 5); ctx.strokeStyle = 'rgba(90,60,30,0.6)'; ctx.lineWidth = 4; for (const y of [-160, -85]) { ctx.beginPath(); ctx.moveTo(-200, y); ctx.lineTo(200, y); ctx.stroke(); }
  for (const x of [-170, 170]) { rr(ctx, x - 16, -230, 32, 230, 4); fillStroke(ctx, '#B88A52', 4); }
  fitTxt(ctx, label, 0, -100, 70, '#6A2A1E', 300, 'center', ST.FONT.type); ctx.restore();
}
function billboard(ctx, u = 1) { // a newspaper ad page (centred, 520 x 640)
  const w = 520, h = 640; CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 6), '#F4EEDF', { elev: 1.6 });
  fitTxt(ctx, 'ADVERTISEMENT', 0, -h / 2 + 60, 34, '#6A6A68', w - 60, 'center', ST.FONT.type);
  fitTxt(ctx, 'EAT MORE', 0, -h / 2 + 150, 70, INK, w - 60); fitTxt(ctx, 'BACON!', 0, -h / 2 + 235, 92, BAC, w - 60);
  ctx.save(); ctx.translate(0, 120); plate(ctx, 0.9); baconStrip(ctx, -40, -40, 0.7, -0.1); egg(ctx, 60, -40, 0.6); ctx.restore();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 3; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-w / 2 + 40, 220 + i * 26); ctx.lineTo(w / 2 - 40, 220 + i * 26); ctx.stroke(); }
}
// ---------- mail ----------
function envelope(ctx, s = 1, seed = 0) {
  ctx.save(); ctx.scale(s, s); ctx.rotate((hash(seed) - 0.5) * 0.3);
  rr(ctx, -110, -70, 220, 140, 8); fillStroke(ctx, '#F4EEDF', 4); ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-110, -70); ctx.lineTo(0, 10); ctx.lineTo(110, -70); ctx.stroke();
  ctx.fillStyle = C.red; ctx.fillRect(60, -56, 36, 26); ctx.restore();
}
function reply(ctx, s = 1, seed = 0) { // a reply card "YES — HEAVY"
  ctx.save(); ctx.scale(s, s); ctx.rotate((hash(seed + 5) - 0.5) * 0.25); rr(ctx, -120, -80, 240, 160, 6); fillStroke(ctx, '#FBF6EA', 4);
  ctx.strokeStyle = 'rgba(80,110,160,0.35)'; ctx.lineWidth = 3; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-96, -40 + i * 30); ctx.lineTo(96 - (i === 2 ? 60 : 0), -40 + i * 30); ctx.stroke(); }
  ctx.strokeStyle = PAL.green; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(40, 40); ctx.lineTo(62, 62); ctx.lineTo(100, 14); ctx.stroke(); ctx.restore();
}
function mailSack(ctx, s = 1, open = 0) { // burlap sack, base at 0, ~420 tall
  ctx.save(); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-200, -10); ctx.bezierCurveTo(-250, -200, -170, -360, -90 - open * 40, -400); ctx.lineTo(90 + open * 40, -400); ctx.bezierCurveTo(170, -360, 250, -200, 200, -10); ctx.quadraticCurveTo(0, 20, -200, -10); ctx.closePath(); fillStroke(ctx, '#C9A87A', 5);
  ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(90,60,30,0.15)'; ctx.lineWidth = 3; for (let i = -300; i < 300; i += 18) { ctx.beginPath(); ctx.moveTo(i, -420); ctx.lineTo(i + 40, 20); ctx.stroke(); } ctx.restore();
  if (open < 0.5) { tube(ctx, [[-60, -400], [60, -400]], 22, '#8A5A34', 4); }
  fitTxt(ctx, 'U.S. MAIL', 0, -170, 64, '#4A2E1A', 330, 'center', ST.FONT.type);
  ctx.restore();
}
// ---------- newspaper front page (centred, 760 x 980) ----------
function newspaper(ctx, s = 1, l1 = 'DOCTORS URGE', l2 = 'BIG BREAKFAST') {
  ctx.save(); ctx.scale(s, s); const w = 760, h = 980;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 4), '#F4EEDF', { elev: 2 });
  fitTxt(ctx, 'THE DAILY NEWS', 0, -h / 2 + 90, 72, INK, w - 60, 'center', ST.FONT.type);
  ctx.fillStyle = INK; ctx.fillRect(-w / 2 + 30, -h / 2 + 116, w - 60, 6); ctx.fillRect(-w / 2 + 30, -h / 2 + 168, w - 60, 3);
  fitTxt(ctx, 'EXTRA · 1920s', 0, -h / 2 + 152, 28, '#4A4A48', w - 60, 'center', ST.FONT.type);
  fitTxt(ctx, l1, 0, -h / 2 + 280, 104, INK, w - 60); fitTxt(ctx, l2, 0, -h / 2 + 400, 104, C.red, w - 60);
  fitTxt(ctx, '4,500 PHYSICIANS AGREE', 0, -h / 2 + 470, 40, INK, w - 60, 'center', ST.FONT.type);
  ctx.save(); ctx.translate(-150, 140); rr(ctx, -170, -150, 340, 300, 4); fillStroke(ctx, '#DCD3BE', 3); plate(ctx, 0.7); baconStrip(ctx, -30, -30, 0.55, 0); egg(ctx, 60, -30, 0.5); ctx.restore();
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 3; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(40, 0 + i * 32); ctx.lineTo(w / 2 - 40, 0 + i * 32); ctx.stroke(); }
  for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.moveTo(-w / 2 + 40, 330 + i * 32); ctx.lineTo(w / 2 - 40, 330 + i * 32); ctx.stroke(); }
  ctx.restore();
}
const paperItem = g => { g.save(); g.rotate(-0.15); rr(g, -60, -150, 120, 160, 4); fillStroke(g, '#F4EEDF', 4); g.fillStyle = INK; g.fillRect(-48, -136, 96, 14); g.fillStyle = C.red; g.fillRect(-48, -112, 96, 10); g.restore(); };
// ---------- frying pan with bacon & eggs (centred on the pan) ----------
function pan(ctx, s = 1, t = 0) {
  ctx.save(); ctx.scale(s, s);
  tube(ctx, [[260, 0], [520, -40]], 40, '#2A2A30', 5);
  ell(ctx, 0, 0, 290, 160); fillStroke(ctx, '#3A3A40', 6); ell(ctx, 0, -6, 250, 130); fillStroke(ctx, '#55555C', 4);
  baconStrip(ctx, -70, -60, 0.8, -0.2, t * 3); baconStrip(ctx, -50, 10, 0.8, -0.1, t * 3 + 1); baconStrip(ctx, -30, 72, 0.7, 0.05, t * 3 + 2);
  egg(ctx, 120, -36, 0.75); egg(ctx, 120, 70, 0.7);
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 5; ctx.lineCap = 'round';      // sizzle steam
  for (let i = 0; i < 4; i++) { const x = -150 + i * 100, ph = (t * 1.2 + i * 0.27) % 1; ctx.globalAlpha = Math.sin(ph * Math.PI) * 0.8; ctx.beginPath(); ctx.moveTo(x, -140 - ph * 120); ctx.bezierCurveTo(x - 30, -180 - ph * 120, x + 30, -220 - ph * 120, x, -260 - ph * 120); ctx.stroke(); }
  ctx.globalAlpha = 1; ctx.restore();
}
// ---------- menu board on an easel (centred, 640 x 760). items: [[text, u]], o.title ----------
function menuBoard(ctx, items, o = {}) {
  const w = 640, h = 760; tube(ctx, [[-200, h / 2 + 300], [-120, -h / 2]], 16, '#8A5A34', 4); tube(ctx, [[200, h / 2 + 300], [120, -h / 2]], 16, '#8A5A34', 4);
  rr(ctx, -w / 2 - 20, -h / 2 - 20, w + 40, h + 40, 12); fillStroke(ctx, '#8A5A34', 5); rr(ctx, -w / 2, -h / 2, w, h, 6); fillStroke(ctx, '#2F3A34', 4);
  fitTxt(ctx, o.title || 'BREAKFAST MENU', 0, -h / 2 + 90, 60, '#FFFDF8', w - 60);
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-w / 2 + 60, -h / 2 + 125); ctx.lineTo(w / 2 - 60, -h / 2 + 125); ctx.stroke();
  items.forEach(([s, u], i) => { const y = -h / 2 + 230 + i * 130; if (u <= 0) { fitTxt(ctx, '. . . . . . . .', 0, y, 50, 'rgba(255,255,255,0.35)', w - 80); return; }
    ctx.save(); ctx.beginPath(); ctx.rect(-w / 2, y - 70, w * clamp(u), 100); ctx.clip(); fitTxt(ctx, s, 0, y, 64, i === 0 ? C.yellow : '#FFFDF8', w - 80, 'center', ST.FONT.type); ctx.restore(); });
}
const chalk = g => { rr(g, -8, -40, 16, 60, 4); fillStroke(g, '#FFFDF8', 3); };
// ---------- cash register (base at 0), u = drawer open 0..1, sale flag ----------
function register(ctx, s = 1, u = 0) {
  ctx.save(); ctx.scale(s, s);
  rr(ctx, -220, -60 + 50 * u, 440, 60, 6); fillStroke(ctx, '#8A8F98', 5);
  SE.poly(ctx, [[-240, -60], [240, -60], [200, -300], [-200, -300]], '#B8892E', 5);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) { ell(ctx, -130 + c * 65, -110 - r * 50, 20, 18); fillStroke(ctx, '#FFFDF8', 3.5); }
  rr(ctx, -150, -420, 300, 110, 8); fillStroke(ctx, '#2A2A30', 5);
  if (u > 0) { ctx.save(); ctx.translate(0, -420); const k = E.back(clamp(u * 2), 2); ctx.scale(1, k); rr(ctx, -120, -110, 240, 110, 6); fillStroke(ctx, '#FFFDF8', 4); fitTxt(ctx, 'SALE', 0, -36, 64, C.red, 200); ctx.restore(); }
  ctx.restore();
}
// ---------- a rising sales chart (centred, 760 x 560), u 0..1 ----------
function chart(ctx, u, title = 'BACON SALES') {
  const w = 760, h = 560; CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 12), '#FBF6EA', { elev: 1.6 });
  fitTxt(ctx, title, 0, -h / 2 + 70, 56, INK, w - 80);
  ctx.strokeStyle = 'rgba(80,110,160,0.25)'; ctx.lineWidth = 2; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-w / 2 + 70, h / 2 - 60 - i * 80); ctx.lineTo(w / 2 - 50, h / 2 - 60 - i * 80); ctx.stroke(); }
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 6); ctx.beginPath(); ctx.moveTo(-w / 2 + 70, -h / 2 + 110); ctx.lineTo(-w / 2 + 70, h / 2 - 60); ctx.lineTo(w / 2 - 50, h / 2 - 60); ctx.stroke();
  const pts = [[-300, 200], [-200, 180], [-100, 150], [0, 90], [100, 30], [200, -40], [300, -110]], n = Math.max(1, Math.floor(clamp(u) * (pts.length - 1) * 100) / 100);
  ctx.strokeStyle = C.red; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
  let last = pts[0]; ctx.moveTo(...pts[0]); for (let i = 1; i < pts.length; i++) { if (i <= n) { ctx.lineTo(...pts[i]); last = pts[i]; } else { const f = n - (i - 1); if (f > 0) { last = [lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)]; ctx.lineTo(...last); } break; } } ctx.stroke();
  const a = Math.atan2(-70, 100); ctx.save(); ctx.translate(...last); ctx.rotate(a); ctx.fillStyle = C.red; ctx.beginPath(); ctx.moveTo(36, 0); ctx.lineTo(-14, -28); ctx.lineTo(-14, 28); ctx.closePath(); ctx.fill(); ctx.restore();
}
// ---------- a price tag on a string (hangs from (0, 0)), text, swing angle ----------
function priceTag(ctx, s, sw = 0) {
  ctx.save(); ctx.rotate(sw); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 90); ctx.stroke();
  ctx.translate(0, 90); ctx.font = `60px ${K.F.black}`; const w = ctx.measureText(s).width + 70;
  CL.cutout(ctx, () => { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(w / 2, 40); ctx.lineTo(w / 2, 130); ctx.lineTo(-w / 2, 130); ctx.lineTo(-w / 2, 40); ctx.closePath(); }, C.yellow, { elev: 1.2 });
  ell(ctx, 0, 30, 10, 10); fillStroke(ctx, '#FFFDF8', 3); txt(ctx, s, 0, 108, 60, INK); ctx.restore();
}

module.exports = { CS, BAC, flake, bowl, spoon, baconStrip, egg, toast, plate, mountain, lightPlate, podium, mics, flash, pressCam, pressRoom, kitchen, table, milk, sampler,
  magazine, deskTop, sanitarium, tree, plainBox, office, crate, billboard, envelope, reply, mailSack, newspaper, paperItem, pan, menuBoard, chalk, register, chart, priceTag };
