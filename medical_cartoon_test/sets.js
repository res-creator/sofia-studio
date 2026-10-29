// Two sets: the night bedroom (0–3 s) and the organ control room (3–15 s). World = 1920x1080.
const A = require('./art');
const { TAU, INK, clamp, lerp, ease, kf, pulse, fillInk, cel, ell, rrect, text, eye, brow, mouth } = A;

// ------------------------------------------------------------------ CONTROL ROOM
function pipe(ctx, x0, y0, x1, y1, w, col, dark) {
  const p = new Path2D(); p.moveTo(x0, y0); p.lineTo(x1, y1); ctx.lineCap = 'butt';
  ctx.strokeStyle = INK; ctx.lineWidth = w + 12; ctx.stroke(p); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke(p);
  ctx.strokeStyle = dark; ctx.lineWidth = w * 0.28; ctx.globalAlpha = 0.5; const o = w * 0.22, vert = Math.abs(x1 - x0) < 1;
  const q = new Path2D(); q.moveTo(x0 + (vert ? o : 0), y0 + (vert ? 0 : o)); q.lineTo(x1 + (vert ? o : 0), y1 + (vert ? 0 : o)); ctx.stroke(q); ctx.globalAlpha = 1;
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = w * 0.12; const h = new Path2D(); h.moveTo(x0 - (vert ? o : 0), y0 - (vert ? 0 : o)); h.lineTo(x1 - (vert ? o : 0), y1 - (vert ? 0 : o)); ctx.stroke(h);
}
function ring(ctx, x, y, w, h, vert) { const p = vert ? rrect(x - w / 2 - 7, y - 11, w + 14, 22, 6) : rrect(x - 11, y - w / 2 - 7, 22, w + 14, 6); fillInk(ctx, p, '#8c9bd6', 5); }

function drawRoomBack(ctx, t, st) {
  // wall
  let g = ctx.createLinearGradient(0, 0, 0, 880); g.addColorStop(0, '#1b2b62'); g.addColorStop(1, '#2f3c86'); ctx.fillStyle = g; ctx.fillRect(-100, -100, 2120, 1000);
  ctx.fillStyle = 'rgba(255,255,255,0.045)'; for (let i = 0; i < 9; i++) { ctx.fillRect(i * 240 - 10, 0, 120, 880); }
  ctx.strokeStyle = 'rgba(8,10,40,0.35)'; ctx.lineWidth = 4; for (let i = 0; i <= 8; i++) { ctx.beginPath(); ctx.moveTo(i * 240 - 10, 0); ctx.lineTo(i * 240 - 10, 880); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; for (let i = 0; i <= 8; i++) for (const y of [90, 800]) { ctx.beginPath(); ctx.arc(i * 240 + 4, y, 5, 0, TAU); ctx.fill(); }
  // wainscot
  ctx.fillStyle = '#232d6b'; ctx.fillRect(-100, 700, 2120, 180); ctx.fillStyle = '#35d1c8'; ctx.fillRect(-100, 694, 2120, 8); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.strokeRect(-100, 694, 2120, 8);
  // floor
  g = ctx.createLinearGradient(0, 880, 0, 1080); g.addColorStop(0, '#53306e'); g.addColorStop(1, '#2b1a47'); ctx.fillStyle = g; ctx.fillRect(-100, 878, 2120, 300);
  ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.lineWidth = 3;
  for (let i = -10; i <= 10; i++) { ctx.beginPath(); ctx.moveTo(960 + i * 200, 880); ctx.lineTo(960 + i * 420, 1200); ctx.stroke(); }
  for (const y of [905, 945, 1000, 1075]) { ctx.beginPath(); ctx.moveTo(-100, y); ctx.lineTo(2020, y); ctx.stroke(); }
  ctx.fillStyle = INK; ctx.fillRect(-100, 874, 2120, 8);
  // ceiling pipes (arteries / veins)
  ctx.fillStyle = '#141d4a'; ctx.fillRect(-100, -100, 2120, 150); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-100, 50); ctx.lineTo(2020, 50); ctx.stroke();
  pipe(ctx, -100, 22, 2020, 22, 30, '#ea4560', '#9c1d3a'); pipe(ctx, -100, 70, 2020, 70, 22, '#5b86e0', '#2f55a8');
  for (const x of [150, 560, 1010, 1420, 1800]) { ring(ctx, x, 22, 30, 0, false); ring(ctx, x + 40, 70, 22, 0, false); }
  // wall pipes (left red, right blue) running to the floor
  pipe(ctx, 48, 40, 48, 880, 46, '#ea4560', '#9c1d3a'); pipe(ctx, 1872, 40, 1872, 880, 46, '#5b86e0', '#2f55a8');
  for (const y of [200, 420, 640]) { ring(ctx, 48, y, 46, 0, true); ring(ctx, 1872, y, 46, 0, true); }
  // plaque
    // main screen
  const shake = st.screenFlash || 0;
  fillInk(ctx, rrect(430, 100, 1060, 350, 36), '#120f2e', 10);
  ctx.save(); ctx.clip(rrect(450, 120, 1020, 310, 24));
  g = ctx.createLinearGradient(0, 120, 0, 430); g.addColorStop(0, '#0d2a4a'); g.addColorStop(1, '#09152c'); ctx.fillStyle = g; ctx.fillRect(440, 110, 1040, 330);
  ctx.fillStyle = 'rgba(80,220,255,0.06)'; for (let y = 120; y < 430; y += 8) ctx.fillRect(450, y, 1020, 3);
  const fl = 0.75 + 0.25 * Math.sin(t * 24) * (st.alarm || 0);
  text(ctx, 'SLEEP STATUS:', 960, 178, 60, '#7ff0e6', { stroke: 0 });
  ctx.save(); ctx.shadowColor = '#ff2d4a'; ctx.shadowBlur = 40 * fl; text(ctx, '0%', 960, 300, 190, '#ff4d63', { stroke: 12 }); ctx.restore();
  fillInk(ctx, rrect(640, 385, 640, 34, 10), '#0a1226', 5); ctx.fillStyle = '#ff4d63'; ctx.fillRect(648, 391, 6 + ((t * 3) % 1 < 0.5 ? 0 : 4), 22);
  // warning triangles
  for (const sx of [-1, 1]) { ctx.save(); ctx.translate(960 + sx * 400, 290); ctx.globalAlpha = (st.alarm || 0) ? 0.35 + 0.65 * (Math.sin(t * 12) > 0 ? 1 : 0.2) : 0.5; const tri = new Path2D(); tri.moveTo(0, -60); tri.lineTo(56, 44); tri.lineTo(-56, 44); tri.closePath(); fillInk(ctx, tri, '#ffd23f', 7); text(ctx, '!', 0, 8, 64, INK, { stroke: 0 }); ctx.restore(); }
  ctx.fillStyle = `rgba(255,50,80,${0.16 * (st.alarm || 0) * (0.5 + 0.5 * Math.sin(t * 11))})`; ctx.fillRect(440, 110, 1040, 330);
  ctx.restore();
  // side monitors
  fillInk(ctx, rrect(120, 140, 270, 220, 22), '#120f2e', 8); ctx.save(); ctx.clip(rrect(134, 154, 242, 192, 14)); ctx.fillStyle = '#08241f'; ctx.fillRect(120, 140, 270, 220);
  ctx.strokeStyle = '#4dff9a'; ctx.lineWidth = 5; ctx.beginPath(); const spd = 1 + 1.2 * (st.alarm || 0);
  for (let x = 0; x <= 242; x += 3) { const ph = ((x / 242) * 2 + t * spd) % 1, y = ph < 0.1 ? -Math.sin(ph / 0.1 * Math.PI) * 60 : ph < 0.16 ? 25 * Math.sin((ph - 0.1) / 0.06 * Math.PI) : 0; x ? ctx.lineTo(134 + x, 290 + y) : ctx.moveTo(134 + x, 290 + y); } ctx.stroke();
  text(ctx, (st.alarm ? 'BPM 138' : 'BPM 72'), 255, 190, 40, '#4dff9a', { stroke: 0 }); ctx.restore();
  fillInk(ctx, rrect(1530, 140, 270, 220, 22), '#120f2e', 8); ctx.save(); ctx.clip(rrect(1544, 154, 242, 192, 14)); ctx.fillStyle = '#2a1a0a'; ctx.fillRect(1530, 140, 270, 220);
  text(ctx, 'FUEL', 1665, 190, 40, '#ffb347', { stroke: 0 });
  ctx.strokeStyle = '#ffb347'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(1665, 320, 80, Math.PI, TAU); ctx.stroke(); ctx.strokeStyle = '#ff4d63'; ctx.beginPath(); ctx.arc(1665, 320, 80, Math.PI, Math.PI * 1.22); ctx.stroke();
  const na = Math.PI * 1.1 + Math.sin(t * 2) * 0.03; ctx.strokeStyle = '#fff'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(1665, 320); ctx.lineTo(1665 + Math.cos(na) * 70, 320 + Math.sin(na) * 70); ctx.stroke(); ctx.restore();
  // sirens
  for (const sx of [330, 1590]) {
    const on = st.alarm || 0, a0 = t * 7 + (sx > 900 ? 2 : 0);
    ctx.save(); ctx.translate(sx, 150);
    if (on > 0) { ctx.globalCompositeOperation = 'lighter'; for (const k of [0, Math.PI]) { const aa = a0 + k, gr = ctx.createRadialGradient(0, 0, 10, Math.cos(aa) * 420, Math.sin(aa) * 160, 380); gr.addColorStop(0, `rgba(255,60,70,${0.5 * on})`); gr.addColorStop(1, 'rgba(255,60,70,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 560, aa - 0.28, aa + 0.28); ctx.fill(); } ctx.globalCompositeOperation = 'source-over'; }
    fillInk(ctx, rrect(-34, 0, 68, 18, 5), '#6b7cc4', 5);
    const dome = new Path2D(); dome.moveTo(-28, 2); dome.bezierCurveTo(-28, -50, 28, -50, 28, 2); dome.closePath(); fillInk(ctx, dome, on > 0 ? '#ff4b5c' : '#8a2a45', 6);
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.ellipse(-10, -24, 5, 11, 0.4, 0, TAU); ctx.fill(); ctx.restore();
  }
}
// things in front of the characters
function drawRoomFront(ctx, t, st) {
  const slam = st.slam || 0, press = st.press || 0;
  // console desk
  const top = new Path2D(); top.moveTo(150, 876); top.lineTo(205, 838); top.lineTo(1020, 838); top.lineTo(1080, 876); top.closePath();
  fillInk(ctx, top, '#58d6d0', 7);
  fillInk(ctx, rrect(160, 876, 910, 220, 14), '#2c7f96', 7); ctx.fillStyle = 'rgba(0,0,40,0.25)'; ctx.fillRect(166, 1020, 898, 70);
  for (let i = 0; i < 6; i++) fillInk(ctx, rrect(200 + i * 148, 906, 128, 90, 12), '#246b82', 5);
  // top-surface buttons + sliders
  const cols = ['#ffd23f', '#4dff9a', '#6fa2ff', '#ff8fd0', '#ffd23f', '#4dff9a', '#6fa2ff', '#ff8fd0'];
  for (let i = 0; i < 8; i++) { if (i === 2) continue; const bx = 280 + i * 100 + (i > 2 ? 40 : 0); const lit = Math.sin(t * 3 + i * 1.7) > 0.3 ? 1 : 0.55; fillInk(ctx, ell(bx, 861, 18, 8), cols[i], 4.5); ctx.fillStyle = `rgba(255,255,255,${0.5 * lit})`; ctx.beginPath(); ctx.ellipse(bx - 4, 859, 6, 2.5, 0, 0, TAU); ctx.fill(); }
  // panel gadgets on the front
  ctx.save(); ctx.clip(rrect(160, 876, 910, 220, 14));
  fillInk(ctx, rrect(212, 918, 104, 66, 8), '#08241f', 4); ctx.strokeStyle = '#4dff9a'; ctx.lineWidth = 3; ctx.beginPath(); for (let x = 0; x <= 90; x += 3) { const y = Math.sin(x * 0.25 + t * 6) * 10; x ? ctx.lineTo(220 + x, 951 + y) : ctx.moveTo(220, 951 + y); } ctx.stroke();
  for (const [kx, ky] of [[400, 950], [460, 950], [520, 950]]) { fillInk(ctx, ell(kx, ky, 22, 22), '#cfd6ff', 5); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(kx, ky); ctx.lineTo(kx + Math.cos(kx * 0.1 + t) * 16, ky + Math.sin(kx * 0.1 + t) * 16); ctx.stroke(); }
  for (let i = 0; i < 7; i++) { fillInk(ctx, rrect(660 + i * 52, 930 + (i % 2) * 8, 34, 8, 4), '#17445a', 3.5); }
  fillInk(ctx, rrect(660, 960, 180, 22, 8), '#17445a', 4); ctx.fillStyle = '#ff4d63'; ctx.fillRect(668, 965, 40 + 70 * (0.5 + 0.5 * Math.sin(t * 2.2)), 12);
  ctx.restore();
  // big red button with hinged guard
  const bx = 470, by = 842 + press * 6;
  fillInk(ctx, ell(bx, 848, 52, 16), '#8c9bd6', 5); fillInk(ctx, rrect(bx - 36, by - 28 - (1 - press) * 0, 72, 30, 16), '#ff3d54', 6); ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.ellipse(bx - 12, by - 20, 14, 4, 0, 0, TAU); ctx.fill();
  // props: mug (jumps on slam), papers
  const mj = -slam * 46, mx = 905;
  ctx.save(); ctx.translate(mx, 838 + mj);
  fillInk(ctx, rrect(-34, -74, 68, 74, 12), '#fff6e0', 6); fillInk(ctx, new Path2D('M34 -58 q 34 4 28 28 q -6 20 -28 14'), null, 8); ctx.fillStyle = '#6b3b1f'; ctx.fillRect(-28, -68, 56, 10);
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 5; ctx.lineCap = 'round'; for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.moveTo(-8 + i * 18, -84); ctx.bezierCurveTo(-18 + i * 18, -104, 2 + i * 18, -112, -6 + i * 18, -136 + Math.sin(t * 4 + i) * 6); ctx.stroke(); }
  ctx.restore();
  if (slam > 0.02) { ctx.fillStyle = '#6b3b1f'; for (let i = 0; i < 5; i++) { const u = (1 - slam), dx = (i - 2) * 22 * (0.6 + u), dy = -slam * 90 * (1 + i % 2 * 0.4) + u * 30; ctx.beginPath(); ctx.ellipse(mx + dx, 800 + dy, 6, 9, 0, 0, TAU); ctx.fill(); } }
  fillInk(ctx, rrect(280, 800, 150, 38, 4), '#f3efe4', 5); fillInk(ctx, rrect(290, 770, 140, 34, 4), '#e7e1d0', 5); ctx.strokeStyle = '#8aa'; ctx.lineWidth = 3; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(300, 780 + i * 8); ctx.lineTo(400, 780 + i * 8); ctx.stroke(); }
}
// beanbag chair + pizza box (behind the stomach)
function drawBeanbag(ctx) {
  ctx.save(); ctx.translate(-40, 0);
  const p = new Path2D(); p.moveTo(1290, 930); p.bezierCurveTo(1270, 830, 1320, 690, 1470, 650); p.bezierCurveTo(1590, 625, 1760, 650, 1810, 770); p.bezierCurveTo(1850, 860, 1840, 920, 1800, 940); p.bezierCurveTo(1650, 965, 1450, 965, 1290, 930); p.closePath();
  cel(ctx, p, '#7b5cc4', '#5a3fa0', { w: 560, h: 320, dx: 0.05, dy: 0.1, hl: '#a98cf0', hx: 1450, hy: 720, hw: 90, hh: 24, ha: -0.4, lw: 8 });
  ctx.save(); ctx.clip(p); ctx.strokeStyle = 'rgba(40,20,90,0.55)'; ctx.lineWidth = 5; ctx.setLineDash([16, 12]); ctx.beginPath(); ctx.moveTo(1370, 700); ctx.bezierCurveTo(1430, 820, 1440, 880, 1420, 950); ctx.stroke(); ctx.beginPath(); ctx.moveTo(1750, 690); ctx.bezierCurveTo(1710, 800, 1720, 880, 1740, 950); ctx.stroke(); ctx.restore(); ctx.restore();
}
function drawPizzaBox(ctx, open) { // flat box on the floor, left of the beanbag; lid open
  ctx.save(); ctx.translate(1290, 926);
  const base = new Path2D(); base.moveTo(-110, 0); base.lineTo(110, 0); base.lineTo(84, -40); base.lineTo(-84, -40); base.closePath(); fillInk(ctx, base, '#f2d9a8', 6);
  ctx.fillStyle = '#e9a43a'; ctx.beginPath(); ctx.ellipse(0, -22, 62, 11, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#e03c3c'; for (const [x, y] of [[-24, -24], [14, -20], [30, -26], [-4, -16]]) { ctx.beginPath(); ctx.ellipse(x, y, 7, 3, 0, 0, TAU); ctx.fill(); }
  const lid = new Path2D(); lid.moveTo(-84, -40); lid.lineTo(84, -40); lid.lineTo(94, -92); lid.lineTo(-94, -92); lid.closePath(); fillInk(ctx, lid, '#ffffff', 6);
  text(ctx, 'PIZZA', 0, -66, 36, '#e03c3c', { stroke: 0 });
  ctx.restore();
}

// ------------------------------------------------------------------ BEDROOM (night)
function drawBedroom(ctx, t, st) {
  let g = ctx.createLinearGradient(0, 0, 0, 1080); g.addColorStop(0, '#1a2250'); g.addColorStop(1, '#0f1236'); ctx.fillStyle = g; ctx.fillRect(-400, -400, 2800, 1900);
  ctx.fillStyle = 'rgba(160,180,255,0.07)'; for (let i = 0; i < 40; i++) { ctx.beginPath(); ctx.arc((i * 211) % 2100 - 100, (i * 137) % 900, 4 + (i % 3) * 2, 0, TAU); ctx.fill(); }
  // window with moon (left)
  fillInk(ctx, rrect(60, 130, 330, 470, 22), '#0b1a44', 9);
  ctx.save(); ctx.clip(rrect(72, 142, 306, 446, 14)); g = ctx.createLinearGradient(0, 142, 0, 588); g.addColorStop(0, '#0b1a44'); g.addColorStop(1, '#1d3a7a'); ctx.fillStyle = g; ctx.fillRect(60, 130, 330, 470);
  ctx.fillStyle = '#fff6c8'; ctx.beginPath(); ctx.arc(250, 270, 66, 0, TAU); ctx.fill(); ctx.fillStyle = '#1a2d66'; ctx.beginPath(); ctx.arc(278, 252, 58, 0, TAU); ctx.fill();
  ctx.fillStyle = '#fff'; for (const [x, y, r] of [[130, 220, 4], [180, 400, 3], [310, 420, 4], [110, 340, 3], [330, 190, 3]]) { ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 3 + x); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); } ctx.globalAlpha = 1;
  ctx.restore(); ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(225, 142); ctx.lineTo(225, 588); ctx.moveTo(72, 365); ctx.lineTo(378, 365); ctx.stroke();
  const cur = new Path2D(); cur.moveTo(30, 100); cur.lineTo(150, 100); cur.bezierCurveTo(120, 300, 170, 450, 130, 640); cur.lineTo(30, 640); cur.closePath(); fillInk(ctx, cur, '#5b3a8a', 8);
  // headboard + pillow
  fillInk(ctx, rrect(330, 180, 960, 760, 90), '#3a2250', 9);
  fillInk(ctx, rrect(380, 250, 800, 600, 130), '#7f93d6', 9);
  ctx.save(); ctx.clip(rrect(380, 250, 800, 600, 130)); ctx.fillStyle = '#5f72b8'; ctx.beginPath(); ctx.ellipse(1150, 620, 220, 420, 0, 0, TAU); ctx.fill(); ctx.restore(); ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.stroke(rrect(380, 250, 800, 600, 130));
  // nightstand + alarm clock (glows – drawn bright)
  fillInk(ctx, rrect(1190, 690, 500, 420, 18), '#4a2a62', 9); fillInk(ctx, rrect(1170, 666, 540, 40, 12), '#6a3c86', 8);
  fillInk(ctx, rrect(1560, 610, 90, 56, 10), '#bfeaff', 5);
  st.clock = { x: 1210, y: 440, w: 340, h: 190 };
}
function drawClock(ctx, t, c) {
  ctx.save(); ctx.translate(c.x, c.y);
  fillInk(ctx, rrect(0, 0, c.w, c.h, 36), '#241a3a', 10);
  ctx.save(); ctx.shadowColor = '#ff5a2a'; ctx.shadowBlur = 60; fillInk(ctx, rrect(24, 24, c.w - 48, c.h - 48, 20), '#2a0d10', 5); ctx.restore();
  ctx.save(); ctx.shadowColor = '#ff5a2a'; ctx.shadowBlur = 40; text(ctx, '3:00', c.w / 2 - 34, c.h / 2 + 4, 98, '#ff6a3a', { stroke: 0 }); text(ctx, 'AM', c.w - 62, c.h / 2 + 28, 36, '#ff6a3a', { stroke: 0 }); ctx.restore();
  fillInk(ctx, rrect(40, -26, 70, 30, 12), '#6a3c86', 6); fillInk(ctx, rrect(c.w - 110, -26, 70, 30, 12), '#6a3c86', 6);
  ctx.restore();
}
// the sleepless human (centre ≈ 780,470). st.look etc. drive the face.
function drawSleeper(ctx, t, s) {
  const skin = '#f2b48a', skinD = '#d98f6a';
  ctx.save(); ctx.translate(780, 480); ctx.rotate(s.tilt || 0);
  // hair back
  const hb = new Path2D(); hb.ellipse(0, -30, 200, 215, 0, 0, TAU); fillInk(ctx, hb, '#3a2a52', 8);
  // pyjama shoulders & neck
  fillInk(ctx, rrect(-250, 150, 500, 300, 110), '#5a67d8', 8); fillInk(ctx, rrect(-60, 150, 120, 100, 30), skin, 7);
  // head
  const head = new Path2D(); head.ellipse(0, 20, 176, 206, 0, 0, TAU); cel(ctx, head, skin, skinD, { w: 352, h: 412, dx: 0.06, dy: 0.05, lw: 8, hl: '#ffd2b0', hx: -80, hy: -80, hw: 40, hh: 16 });
  for (const sd of [-1, 1]) { fillInk(ctx, ell(sd * 178, 40, 28, 46), skin, 7); }
  // cheeks tint & blush from the screen glow
  ctx.fillStyle = 'rgba(255,120,120,0.28)'; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sd * 108, 96, 34, 18, 0, 0, TAU); ctx.fill(); }
  // eyes
  const L = s.look || [0, 0];
  for (const sd of [-1, 1]) {
    eye(ctx, sd * 74, 30, 46, 44, { lx: L[0], ly: L[1], lid: s.lid, blink: s.blink, tilt: 0, lidCol: skin, pr: 0.46, reflect: s.reflect });
    ctx.strokeStyle = '#b3604f'; ctx.globalAlpha = 0.65; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(sd * 74, 52, 48, 0.4, 2.7); ctx.stroke(); ctx.globalAlpha = 1;
    brow(ctx, sd * 76, -42 + (s.brow || 0) * 22 - (sd > 0 ? (s.browR || 0) * 12 : 0), 80, { ang: sd * -0.08 + (s.browAng || 0) * sd, arch: 8, th: 13, col: '#2b1840' });
  }
  // nose + mouth
  ctx.strokeStyle = '#c4775a'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-14, 84); ctx.quadraticCurveTo(0, 100, 16, 84); ctx.stroke();
  mouth(ctx, 0, 140, 56, { open: s.mouth || 0, curve: s.smile || -0.1, h: 30, teeth: false, th: 5.5 });
  // fringe + messy hair
  const hf = new Path2D(); hf.moveTo(-182, -20); hf.bezierCurveTo(-200, -150, -120, -230, -10, -228); hf.bezierCurveTo(100, -236, 190, -170, 182, -20); hf.bezierCurveTo(150, -80, 110, -110, 60, -112); hf.lineTo(40, -90); hf.lineTo(20, -122); hf.lineTo(-10, -92); hf.lineTo(-40, -126); hf.lineTo(-70, -92); hf.bezierCurveTo(-120, -106, -160, -70, -182, -20); hf.closePath();
  cel(ctx, hf, '#3f2d5c', '#2b1e44', { w: 380, h: 240, hl: '#6a5390', hx: -60, hy: -190, hw: 60, hh: 14, lw: 8 });
  for (const [x, y, a] of [[-30, -230, -0.5], [30, -232, 0.4], [-90, -210, -0.9]]) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); fillInk(ctx, ell(0, -18, 12, 30), '#3f2d5c', 6); ctx.restore(); }
  ctx.restore();
}
function drawBlanketAndPhone(ctx, t, s) {
  // blanket
  const b = new Path2D(); b.moveTo(-100, 1200); b.lineTo(-100, 900); b.bezierCurveTo(200, 790, 420, 820, 560, 780); b.bezierCurveTo(700, 740, 880, 760, 1000, 790); b.bezierCurveTo(1150, 830, 1300, 800, 1500, 900); b.lineTo(1500, 1200); b.closePath();
  cel(ctx, b, '#8e5fd0', '#6c40aa', { w: 1600, h: 400, dx: 0.02, dy: 0.1, lw: 9, hl: '#b894f2', hx: 520, hy: 800, hw: 300, hh: 18, ha: 0.05 });
  ctx.save(); ctx.clip(b); ctx.fillStyle = 'rgba(255,230,140,0.55)'; for (const [x, y, r] of [[160, 960, 22], [440, 1020, 18], [760, 1010, 24], [1100, 1000, 20], [1300, 950, 16], [300, 880, 12], [980, 880, 14]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.fillStyle = '#8e5fd0'; ctx.beginPath(); ctx.arc(x + r * 0.45, y - r * 0.2, r * 0.8, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,230,140,0.55)'; } ctx.restore();
  // phone (we see its back) + fingers
  ctx.save(); ctx.translate(820, 1020); ctx.rotate(-0.06 + (s.phoneTilt || 0));
  ctx.save(); ctx.shadowColor = s.glow; ctx.shadowBlur = 70; fillInk(ctx, rrect(-170, -250, 340, 560, 48), '#1c1b2e', 9); ctx.restore();
  ctx.strokeStyle = s.glow; ctx.lineWidth = 6; ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.moveTo(-130, -249); ctx.lineTo(130, -249); ctx.stroke(); ctx.globalAlpha = 1;
  fillInk(ctx, rrect(-140, -220, 130, 130, 30), '#2b2a44', 6); for (const [x, y] of [[-100, -190], [-100, -130], [-50, -160]]) { fillInk(ctx, ell(x, y, 22, 22), '#0d0c1a', 5); ctx.fillStyle = 'rgba(160,200,255,0.5)'; ctx.beginPath(); ctx.arc(x - 6, y - 7, 5, 0, TAU); ctx.fill(); }
  const sw = s.swipe || 0; // thumbs wrap over the top edge
  for (const [sd, off] of [[-1, 0], [1, 1]]) { const dy = -sw * (off ? 1 : 0.4) * 30; for (let i = 0; i < 3; i++) fillInk(ctx, ell(sd * 176 + sd * 6, -60 + i * 70 + (i ? 0 : dy * 0.3), 24, 34, 0.2 * sd), '#f2b48a', 6); fillInk(ctx, ell(sd * 130, -262 + dy, 28, 44, sd * 0.35), '#f2b48a', 6.5); }
  ctx.restore();
}
module.exports = { drawRoomBack, drawRoomFront, drawBeanbag, drawPizzaBox, drawBedroom, drawClock, drawSleeper, drawBlanketAndPhone };
