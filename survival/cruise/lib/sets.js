// Ep1 sets in the D2 look (bold ink, cel shade, saturated TV-cartoon palette). All side views, floor line = FLOOR.
const K = require('./cast'), { R, D2 } = K, { paint, cap, line, shade } = R;
const { W, H, hash, clamp, lerp, glow, outlined } = require('./core');
const FLOOR = 900;
const PAL = { wall: '#7e64a8', stripe: 'rgba(0,0,0,0.08)', floor: '#3f7d70', trim: '#efe0c0', door: '#e07a4f', door2: '#c9663e', metal: '#f2d36b', lamp: '#ffe08a', sofa: '#c4573f', hall: '#b99a62', hallFloor: '#6b5236' };
const S = D2;
const rect = (ctx, x, y, w, h, col, o) => paint(ctx, S, c => c.rect(x, y, w, h), col, o);
const rr = (ctx, x, y, w, h, r, col, o) => paint(ctx, S, c => c.roundRect(x, y, w, h, r), col, o);

// ---------------------------------------------------------------- apartment (world x -400..3400)
// door 230-700 | fridge 820-1110 | window 1300-1680 | TV 1860-2260 | sofa 2380-2920 | lamp 3060
const APT = { door: 465, fridge: 965, window: 1490, tv: 2060, sofa: 2650, sofaSeat: 2650, lamp: 3060 };
function apartment(ctx, t, o = {}) {
  ctx.fillStyle = PAL.wall; ctx.fillRect(-600, -400, 4600, FLOOR + 400);
  ctx.fillStyle = PAL.stripe; for (let x = -600; x < 4000; x += 120) ctx.fillRect(x, -400, 60, FLOOR + 400);
  paint(ctx, S, c => c.rect(-600, FLOOR, 4600, 600), PAL.floor, { k: 0.92 });
  paint(ctx, S, c => c.rect(-600, FLOOR - 16, 4600, 18), PAL.trim);
  // window (day: blue sky + smoke; night: moon)
  rr(ctx, 1300, 170, 380, 300, 8, PAL.trim);
  ctx.save(); ctx.beginPath(); ctx.rect(1320, 190, 340, 260); ctx.clip();
  if (o.night) { ctx.fillStyle = '#121a33'; ctx.fillRect(1320, 190, 340, 260); ctx.fillStyle = '#f3efd8'; ctx.beginPath(); ctx.arc(1590, 250, 34, 0, 7); ctx.fill(); ctx.fillStyle = '#0b1124'; }
  else { const g = ctx.createLinearGradient(0, 190, 0, 450); g.addColorStop(0, '#8fc4e8'); g.addColorStop(1, '#f2c79a'); ctx.fillStyle = g; ctx.fillRect(1320, 190, 340, 260);
    ctx.fillStyle = 'rgba(70,60,60,0.55)'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(1400 + i * 18 + Math.sin(t + i) * 6, 330 - i * 34 - (t * 8 % 30), 26 + i * 6, 0, 7); ctx.fill(); } ctx.fillStyle = '#5a6a86'; }
  for (let i = 0; i < 6; i++) ctx.fillRect(1320 + i * 60, 450 - 60 - hash(i) * 120, 50, 200);
  if (o.pigeon) o.pigeon(ctx);
  ctx.restore();
  paint(ctx, S, c => { c.rect(1484, 190, 12, 260); c.rect(1320, 314, 340, 12); }, PAL.trim);
  rr(ctx, 1290, 466, 400, 22, 6, shade(PAL.trim, 0.95));   // sill
  // fridge + counter
  rr(ctx, 1110, 640, 170, 260, 6, '#d9b98a'); rr(ctx, 1100, 620, 190, 30, 6, '#f2e6cc');
  if (!o.fridgeOpen) { rr(ctx, 820, 330, 290, 570, 22, '#e9eef2'); line(ctx, [[830, 520], [1100, 520]], 7, S.ink); rr(ctx, 840, 400, 16, 90, 6, '#9aa3ab'); rr(ctx, 840, 560, 16, 120, 6, '#9aa3ab');
    // magnets + a note
    paint(ctx, S, c => c.rect(960, 560, 90, 70), '#fff7c8'); ctx.save(); ctx.fillStyle = '#c33'; ctx.font = '20px Anton'; ctx.fillText('MILK?', 975, 600); ctx.restore(); }
  else { rr(ctx, 820, 330, 290, 570, 22, '#bcc5cc'); ctx.fillStyle = '#fffbe6'; ctx.fillRect(840, 350, 250, 530); }
  // clock above the sofa
  const ck = o.clock; paint(ctx, S, c => c.arc(2650, 260, 64, 0, 7), '#f6f1e4'); ctx.save(); ctx.translate(2650, 260); const hh = ck ? ck[0] : 10 + t / 600, mm = ck ? ck[1] : (t * 2) % 60;
  line(ctx, [[0, 0], [Math.sin(hh / 12 * Math.PI * 2) * 34, -Math.cos(hh / 12 * Math.PI * 2) * 34]], 8, S.ink); line(ctx, [[0, 0], [Math.sin(mm / 60 * Math.PI * 2) * 50, -Math.cos(mm / 60 * Math.PI * 2) * 50]], 5, S.ink); ctx.restore();
  // TV on a low cabinet
  rr(ctx, 1830, 700, 460, 200, 10, '#8a5a3a'); rr(ctx, 1860, 760, 180, 110, 6, '#7a4e32', { k: 0.95 }); rr(ctx, 2080, 760, 180, 110, 6, '#7a4e32', { k: 0.95 });
  rr(ctx, 1860, 410, 400, 260, 14, '#22252b'); rect(ctx, 2040, 670, 40, 30, '#22252b');
  ctx.save(); ctx.beginPath(); ctx.rect(1880, 430, 360, 220); ctx.clip(); (o.tv || tvNews)(ctx, t, 1880, 430, 360, 220); ctx.restore();
  // sofa (front view, against the wall) + floor lamp
  rr(ctx, 2400, 600, 500, 190, 34, PAL.sofa); rr(ctx, 2370, 700, 560, 190, 30, shade(PAL.sofa, 1.1)); rr(ctx, 2340, 650, 80, 240, 30, shade(PAL.sofa, 0.9)); rr(ctx, 2880, 650, 80, 240, 30, shade(PAL.sofa, 0.9));
  rr(ctx, 3052, 560, 16, FLOOR - 560, 6, '#3a3a40'); paint(ctx, S, c => { c.moveTo(2990, 560); c.lineTo(3130, 560); c.lineTo(3100, 470); c.lineTo(3020, 470); c.closePath(); }, PAL.lamp);
  // front door (same geometry as the approved peephole test)
  paint(ctx, S, c => c.rect(230, 160, 470, FLOOR - 150), PAL.trim);
  ctx.save(); ctx.translate(o.doorShake || 0, 0);
  paint(ctx, S, c => c.rect(260, 190, 410, FLOOR - 190), PAL.door);
  paint(ctx, S, c => { c.roundRect(300, 240, 330, 250, 8); c.roundRect(300, 540, 330, 300, 8); }, PAL.door2, { k: 0.95 });
  paint(ctx, S, c => c.ellipse(612, 560, 17, 17, 0, 0, 7), PAL.metal); paint(ctx, S, c => c.roundRect(560, 552, 52, 14, 6), PAL.metal);
  paint(ctx, S, c => c.ellipse(465, 360, 11, 11, 0, 0, 7), '#222');
  if (o.peepCover) paint(ctx, S, c => c.roundRect(436, 336, 58, 48, 6), '#d9c27a');   // tape over the peephole
  paint(ctx, S, c => c.roundRect(684, 455, 14, 34, 4), PAL.metal); paint(ctx, S, c => c.roundRect(560, 462, 92, 14, 6), PAL.metal);
  ctx.restore();
  ctx.fillStyle = '#ffd98a'; ctx.fillRect(262, FLOOR - 4, 406, 6);
  if (o.feet) { ctx.fillStyle = '#1a1410'; ctx.fillRect(380, FLOOR - 4, 56, 6); ctx.fillRect(500, FLOOR - 4, 56, 6); }
  // coat hooks + a framed poster
  rr(ctx, 760, 300, 30, 12, 4, PAL.metal); rr(ctx, 1730, 230, 90, 120, 6, '#4f8fd0');
}
function chain(ctx, knob) { const a = [691, 470]; ctx.save(); ctx.strokeStyle = '#c9cfd6'; ctx.lineWidth = 6; ctx.setLineDash([10, 5]);
  ctx.beginPath(); ctx.moveTo(...a); ctx.quadraticCurveTo((a[0] + knob[0]) / 2, Math.max(a[1], knob[1]) + 30 - Math.min(30, Math.abs(a[0] - knob[0]) * 0.2), knob[0], knob[1]); ctx.stroke(); ctx.restore();
  paint(ctx, S, c => c.ellipse(knob[0], knob[1], 9, 9, 0, 0, 7), '#c9cfd6'); }
function tvNews(ctx, t, x, y, w, h, o = {}) {
  ctx.fillStyle = '#1d3d7a'; ctx.fillRect(x, y, w, h);
  // anchor silhouette + map with red spread
  ctx.fillStyle = '#d2453b'; ctx.beginPath(); ctx.arc(x + w * 0.7, y + h * 0.42, 60 + (t * 6 % 20), 0, 7); ctx.fill();
  ctx.fillStyle = '#2b2f3a'; ctx.beginPath(); ctx.arc(x + w * 0.28, y + h * 0.38, 30, 0, 7); ctx.fill(); ctx.fillRect(x + w * 0.28 - 50, y + h * 0.52, 100, 80);
  ctx.fillStyle = '#d6413a'; ctx.fillRect(x, y + h - 62, w, 34); ctx.fillStyle = '#fff'; ctx.font = '26px Anton'; ctx.textBaseline = 'middle'; ctx.fillText(o.title || 'BREAKING NEWS', x + 10, y + h - 45);
  ctx.fillStyle = '#ffd23f'; ctx.fillRect(x, y + h - 28, w, 28); ctx.fillStyle = '#111'; ctx.font = '20px Anton'; const msg = o.crawl || 'STAY INDOORS  •  DO NOT APPROACH THE INFECTED  •  STAY INDOORS  •  ';
  ctx.fillText(msg + msg, x + 10 - (t * 90) % ctx.measureText(msg).width, y + h - 14);
  ctx.fillStyle = `rgba(255,255,255,${0.04 + 0.04 * Math.sin(t * 50)})`; for (let i = 0; i < h; i += 4) ctx.fillRect(x, y + i, w, 2);
}
function tvStatic(ctx, t, x, y, w, h) { for (let i = 0; i < 300; i++) { ctx.fillStyle = hash(i + Math.floor(t * 30) * 7) > 0.5 ? '#ddd' : '#333'; ctx.fillRect(x + hash(i * 3 + Math.floor(t * 30)) * w, y + hash(i * 5 + Math.floor(t * 30)) * h, 14, 6); } }
// night grade + practicals for the apartment
function aptNight(ctx, o = {}) {
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = '#a3a3d8'; ctx.fillRect(-1000, -1000, 6000, 3000); ctx.restore();
  glow(ctx, 3060, 520, 700, 'rgba(255,190,110,0.30)'); glow(ctx, 465, FLOOR + 10, 300, 'rgba(255,200,120,0.25)'); glow(ctx, 1500, 320, 380, 'rgba(120,150,255,0.12)');
  if (o.tv) glow(ctx, 2060, 540, 600, 'rgba(120,170,255,0.18)');
}
// fridge interior (POV from inside, looking out) — ketchup + half a lemon
function fridgeInside(ctx, t) {
  ctx.fillStyle = '#eaf3f6'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#d6e4ea'; for (const y of [300, 640]) { ctx.fillRect(0, y, W, 22); }
  glow(ctx, W / 2, 0, 900, 'rgba(255,255,240,0.5)');
  // ketchup bottle
  paint(ctx, S, c => { c.moveTo(800, 640); c.lineTo(800, 470); c.quadraticCurveTo(800, 420, 840, 410); c.lineTo(840, 370); c.lineTo(880, 370); c.lineTo(880, 410); c.quadraticCurveTo(920, 420, 920, 470); c.lineTo(920, 640); c.closePath(); }, '#d6413a');
  rr(ctx, 832, 340, 56, 34, 6, '#f2f2f2'); paint(ctx, S, c => c.rect(812, 500, 96, 60), '#f6efe0'); ctx.fillStyle = '#d6413a'; ctx.font = '22px Anton'; ctx.textAlign = 'center'; ctx.fillText('KETCHUP', 860, 538); ctx.textAlign = 'left';
  // half lemon
  paint(ctx, S, c => { c.moveTo(1040, 640); c.arc(1110, 640, 70, Math.PI, 0); c.closePath(); }, '#ffd23f'); paint(ctx, S, c => { c.moveTo(1052, 640); c.arc(1110, 640, 58, Math.PI, 0); c.closePath(); }, '#fff2a0');
  for (let i = 1; i < 6; i++) line(ctx, [[1110, 638], [1110 + Math.cos(Math.PI + i * Math.PI / 6) * 54, 638 + Math.sin(Math.PI + i * Math.PI / 6) * 54]], 3, '#e6c23a');
  // frame of the open fridge (dark kitchen outside)
  ctx.fillStyle = 'rgba(30,26,40,0.0)';
}
// apartment hallway (outside the hero's door); door centred at x 960
function hallway(ctx, t, o = {}) {
  ctx.fillStyle = PAL.hall; ctx.fillRect(-1200, -400, 4400, FLOOR + 400);
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; for (let x = -1200; x < 3200; x += 160) ctx.fillRect(x, -400, 80, FLOOR + 400);
  paint(ctx, S, c => c.rect(-1200, FLOOR, 4400, 600), PAL.hallFloor);
  for (const dx of [-300, 1560, 2600]) paint(ctx, S, c => c.rect(dx, 150, 300, FLOOR - 150), shade(PAL.door, 0.8));
  paint(ctx, S, c => c.roundRect(860, 120, 200, 40, 10), '#fff4d0');
  if (o.heroDoor) { paint(ctx, S, c => c.rect(730, 150, 460, FLOOR - 140), PAL.trim); paint(ctx, S, c => c.rect(760, 180, 400, FLOOR - 180), PAL.door);
    paint(ctx, S, c => c.ellipse(800, 560, 17, 17, 0, 0, 7), PAL.metal); paint(ctx, S, c => c.roundRect(940, 220, 80, 40, 6), PAL.metal); ctx.save(); ctx.fillStyle = '#222'; ctx.font = '32px Anton'; ctx.textAlign = 'center'; ctx.fillText('4A', 980, 252); ctx.restore();
    paint(ctx, S, c => c.ellipse(960, 360, 11, 11, 0, 0, 7), '#222');
    if (o.graffiti != null) graffiti(ctx, 960, 560, o.graffiti, 1); }
  const f = o.flick ?? 1; glow(ctx, 960, 160, 900, `rgba(255,240,200,${0.3 * f})`);
}
// "GARY WAS HERE :)" spray paint, revealed 0..1
function graffiti(ctx, x, y, u, s = 1, rot = -0.06) {
  const txt = 'GARY WAS HERE :)'; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.font = '84px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width; ctx.beginPath(); ctx.rect(-w / 2 - 10, -80, (w + 20) * clamp(u), 200); ctx.clip();
  ctx.shadowColor = 'rgba(200,20,30,0.6)'; ctx.shadowBlur = 10; ctx.fillStyle = '#c8202c'; ctx.fillText(txt, 0, 0); ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#c8202c'; for (let i = 0; i < 9; i++) { const dx = -w / 2 + hash(i) * w, len = 20 + hash(i + 4) * 60; ctx.fillRect(dx, 30, 5, len); ctx.beginPath(); ctx.arc(dx + 2.5, 30 + len, 5, 0, 7); ctx.fill(); }
  ctx.restore();
}

// ---------------------------------------------------------------- supermarket (world x -500..5200)
function shelf(ctx, x, w, seed) {
  rr(ctx, x, 220, w, FLOOR - 220, 6, '#b9c3cc'); const rows = [300, 470, 640, 800];
  const cols = ['#d6413a', '#3f62b0', '#f0aa22', '#3fae63', '#e07a4f', '#7e64a8', '#f2eee2', '#4fb0c6'];
  for (const y of rows) { rect(ctx, x + 10, y + 70, w - 20, 14, '#8d99a5');
    for (let i = 0; i < Math.floor(w / 46); i++) { const h = hash(seed + i * 3 + y); if (h < 0.28) continue; const ph = 40 + hash(seed + i + y) * 30; paint(ctx, S, c => c.roundRect(x + 16 + i * 46, y + 70 - ph, 38, ph, 4), cols[Math.floor(hash(seed * 7 + i + y) * cols.length)], { k: 0.85 }); } }
}
function market(ctx, t, o = {}) {
  ctx.fillStyle = '#e8e2cf'; ctx.fillRect(-1200, -400, 7600, FLOOR + 400);
  ctx.fillStyle = '#d9d2bc'; ctx.fillRect(-1200, -400, 7600, 120);
  for (let x = -1100; x < 6400; x += 420) { paint(ctx, S, c => c.rect(x, -300, 260, 28), '#fffdf2'); glow(ctx, x + 130, -270, 380, 'rgba(255,255,230,0.12)'); }
  paint(ctx, S, c => c.rect(-1200, FLOOR, 7600, 600), '#cfd8d6', { k: 0.94 }); ctx.fillStyle = 'rgba(0,0,0,0.06)'; for (let x = -1200; x < 6400; x += 140) ctx.fillRect(x, FLOOR, 4, 600);
  // aisle signs
  for (const [x, txt] of [[300, 'AISLE 3 · CANNED'], [1900, 'AISLE 4 · TOYS & BATH'], [3500, 'AISLE 5 · BAKING']]) { rr(ctx, x - 150, 60, 300, 70, 8, '#3f62b0'); ctx.save(); ctx.fillStyle = '#fff'; ctx.font = '34px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, x, 96); ctx.restore(); }
  for (let i = 0; i < 6; i++) shelf(ctx, -800 + i * 900, 760, i * 13);
  // sugar section at the far end
  rr(ctx, 4300, 160, 300, 60, 8, '#f2eee2'); ctx.save(); ctx.fillStyle = '#d6413a'; ctx.font = '40px Anton'; ctx.textAlign = 'center'; ctx.fillText('SUGAR', 4450, 205); ctx.restore();
}
// crowd chaos: running silhouettes + flying boxes (layer in front of shelves)
function crowd(ctx, t, x0, x1, n, seed = 0, dark = 0.55) {
  for (let i = 0; i < n; i++) { const sp = 260 + hash(seed + i) * 260, dir = hash(seed + i + 3) > 0.5 ? 1 : -1, span = x1 - x0, x = x0 + (((hash(seed + i + 7) * span + dir * t * sp) % span) + span) % span, s = 0.85 + hash(i + seed) * 0.3, ph = t * 9 + i;
    ctx.save(); ctx.translate(x, FLOOR + 30); ctx.scale(dir * s, s); ctx.fillStyle = `rgba(30,28,40,${dark})`;
    ctx.beginPath(); ctx.arc(0, -330, 44, 0, 7); ctx.fill(); ctx.beginPath(); ctx.roundRect(-40, -290, 80, 150, 30); ctx.fill();
    ctx.lineCap = 'round'; ctx.lineWidth = 30; ctx.strokeStyle = ctx.fillStyle; for (const k of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, -150); ctx.lineTo(k * Math.sin(ph) * 50, -10); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, -270); ctx.lineTo(30 + k * Math.sin(ph) * 40, -170 - (i % 3 === 0 ? 120 : 0)); ctx.stroke(); }
    ctx.restore(); }
}
function cartDraw(ctx, x, ground, items = [], o = {}) {   // shopping cart, handle at the right (x+150, ground-250); returns handle
  ctx.save(); ctx.translate(x, ground); if (o.tilt) ctx.rotate(o.tilt);
  for (const w of [-110, 110]) paint(ctx, S, c => c.arc(w, -20, 20, 0, 7), '#333');
  paint(ctx, S, c => { c.moveTo(-160, -230); c.lineTo(150, -230); c.lineTo(120, -60); c.lineTo(-130, -60); c.closePath(); }, '#c9d2da', { flat: true });
  ctx.save(); ctx.strokeStyle = '#8a96a2'; ctx.lineWidth = 4; for (let i = -140; i < 150; i += 28) { ctx.beginPath(); ctx.moveTo(i, -226); ctx.lineTo(i * 0.92, -64); ctx.stroke(); } for (let y = -200; y > -230; y -= 100) {} ctx.restore();
  line(ctx, [[150, -230], [200, -260]], 10, S.ink); line(ctx, [[150, -230], [200, -260]], 5, '#d6413a');
  line(ctx, [[-130, -60], [-120, -20]], 8, '#8a96a2'); line(ctx, [[120, -60], [110, -20]], 8, '#8a96a2');
  items.forEach((it, i) => it(ctx, -100 + i * 60, -240));
  ctx.restore(); return { handle: [x + 196, ground - 258] };
}
// grocery items (centre-bottom at x,y)
const ITEMS = {
  water: (ctx, x, y, s = 1) => { paint(ctx, S, c => c.roundRect(x - 22 * s, y - 120 * s, 44 * s, 120 * s, 10 * s), '#9fd6ff'); rr(ctx, x - 10 * s, y - 136 * s, 20 * s, 18 * s, 4, '#3f62b0'); paint(ctx, S, c => c.rect(x - 22 * s, y - 80 * s, 44 * s, 30 * s), '#3f62b0'); },
  can: (ctx, x, y, s = 1) => { paint(ctx, S, c => c.roundRect(x - 26 * s, y - 70 * s, 52 * s, 70 * s, 6 * s), '#c9cfd6'); paint(ctx, S, c => c.rect(x - 26 * s, y - 56 * s, 52 * s, 40 * s), '#e07a4f'); },
  battery: (ctx, x, y, s = 1) => { paint(ctx, S, c => c.roundRect(x - 34 * s, y - 70 * s, 68 * s, 70 * s, 6 * s), '#222'); paint(ctx, S, c => c.rect(x - 34 * s, y - 70 * s, 68 * s, 26 * s), '#f0aa22'); ctx.save(); ctx.fillStyle = '#fff'; ctx.font = `${Math.round(18 * s)}px Anton`; ctx.textAlign = 'center'; ctx.fillText('AA', x, y - 20 * s); ctx.restore(); },
  pan: (ctx, x, y, s = 1) => { line(ctx, [[x, y - 40 * s], [x + 90 * s, y - 70 * s]], 14 * s, S.ink); paint(ctx, S, c => c.ellipse(x - 30 * s, y - 30 * s, 60 * s, 30 * s, -0.2, 0, 7), '#3a3d44'); },
  tp: (ctx, x, y, s = 1) => { for (const [a, b] of [[-30, 0], [30, 0], [0, -50]]) paint(ctx, S, c => c.roundRect(x + a * s - 28 * s, y + b * s - 50 * s, 56 * s, 50 * s, 10 * s), '#f4f6f8'); },
};
// ---------------------------------------------------------------- stairwell (side view, zig-zag flights)
// level k landing at y = y0 - k*FH. Flight k: even k rises to the LEFT (xR -> xL), odd k rises to the RIGHT (xL -> xR).
const ST = { rise: 30, run: 46, steps: 10, landW: 360, xL: 400, y0: FLOOR }; ST.fl = ST.steps * ST.run; ST.xR = ST.xL + ST.fl; ST.FH = ST.steps * ST.rise;
const flight = k => ({ x0: k % 2 ? ST.xL : ST.xR, y0: ST.y0 - k * ST.FH, dir: k % 2 ? 1 : -1 });
// stair surface height at distance d along flight k (continuous slope, for the hip)
function stairY(k, d) { return ST.y0 - k * ST.FH - clamp(d / ST.fl) * ST.FH; }
// climbing pose: feet planted on the step treads (each foot moves two steps per cycle), no sliding. Returns { pose, flip }
function climbPose(ch, k, d, o = {}) {
  const F = flight(k), S0 = ch.S, run = ST.run, rise = ST.rise, u = d / (2 * run), bx = F.x0 + F.dir * d;
  const stepPos = s => { s = Math.max(-1, Math.min(ST.steps - 1, s)); return s < 0 ? [F.x0 - F.dir * run * 0.4, F.y0] : [F.x0 + F.dir * (s * run + run * 0.5), F.y0 - (s + 1) * rise]; };
  const foot = (off, base) => { const c = Math.floor(u + off), fu = u + off - c, sp = 2 * c + base;
    if (fu < 0.5) return stepPos(sp); const e = (fu - 0.5) / 0.5, q = e * e * (3 - 2 * e), A0 = stepPos(sp), B0 = stepPos(sp + 2);
    return [lerp(A0[0], B0[0], q), lerp(A0[1], B0[1], q) - Math.sin(e * Math.PI) * 34]; };
  const fN = foot(0, 0), fF = foot(0.5, -1), down = o.down; delete o.down; const flip = down ? F.dir < 0 : F.dir > 0;
  const loc = p => [flip ? 2 * bx - p[0] : p[0], p[1] - S0.ankle];
  const pose = Object.assign({ x: bx, ground: stairY(k, d) + rise * 0.6, lean: 0.18, crouch: 0.05, footN: loc(fN), footF: loc(fF) }, o);
  return { pose, flip, x: bx, y: stairY(k, d) };
}
function stairwell(ctx, t, o = {}) {
  const { xL, xR, landW, FH } = ST;
  ctx.fillStyle = '#8a8fa0'; ctx.fillRect(-1500, -3000, 5000, 4600);
  ctx.fillStyle = 'rgba(0,0,0,0.07)'; for (let y = -3000; y < 1600; y += 60) ctx.fillRect(-1500, y, 5000, 3);
  for (let k = 0; k < 7; k++) {
    const y = ST.y0 - k * FH;
    // doors on the landings (alternate sides), floor numbers
    const fx = k % 2 ? xR + landW * 0.55 : xL - landW * 0.55; paint(ctx, S, c => c.rect(fx - 85, y - 320, 170, 320), '#c9663e'); paint(ctx, S, c => c.ellipse(fx - 55, y - 160, 10, 10, 0, 0, 7), PAL.metal);
    ctx.save(); ctx.fillStyle = '#fff'; ctx.font = '54px Anton'; ctx.textAlign = 'center'; ctx.fillText(String(k + 1), fx, y - 350); ctx.restore();
    if (o.graffiti && o.graffiti[k] != null) graffiti(ctx, fx + (k % 2 ? 230 : -260), y - 200, o.graffiti[k], 0.7, -0.05);
    paint(ctx, S, c => c.rect(xL - landW, y, landW + 10, 46), '#6d7282'); paint(ctx, S, c => c.rect(xR - 10, y, landW + 10, 46), '#6d7282');
    glow(ctx, k % 2 ? xR + 160 : xL - 160, y - 430, 520, 'rgba(255,230,170,0.16)');
  }
  for (let k = 0; k < 6; k++) {
    const F = flight(k);
    paint(ctx, S, c => { c.moveTo(F.x0, F.y0 + 46); c.lineTo(F.x0, F.y0); for (let s = 0; s < ST.steps; s++) { const x = F.x0 + F.dir * s * ST.run; c.lineTo(x, F.y0 - (s + 1) * ST.rise); c.lineTo(x + F.dir * ST.run, F.y0 - (s + 1) * ST.rise); }
      c.lineTo(F.x0 + F.dir * ST.fl, F.y0 - FH + 46); c.closePath(); }, k % 2 ? '#c4bfb2' : '#aaa596');
    const top = F.y0 - FH; line(ctx, [[F.x0, F.y0 - 150], [F.x0 + F.dir * ST.fl, top - 150]], 13, S.ink); line(ctx, [[F.x0, F.y0 - 150], [F.x0 + F.dir * ST.fl, top - 150]], 7, '#d6413a');
    for (let s = 0; s <= ST.steps; s += 2) { const x = F.x0 + F.dir * s * ST.run, y = F.y0 - s * ST.rise; line(ctx, [[x, y - 150], [x, y - (s ? ST.rise * 0.2 : 0)]], 5, '#3a3d44'); }
  }
  if (o.dark) { ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = '#8a86a0'; ctx.fillRect(-2000, -3500, 6000, 6000); ctx.restore(); }
}
// ---------------------------------------------------------------- rooftop (floor y = FLOOR) + city
function sky(ctx, kind, t) {
  const g = ctx.createLinearGradient(0, -1200, 0, FLOOR);
  if (kind === 'night') { g.addColorStop(0, '#0d1230'); g.addColorStop(1, '#3a2c55'); } else if (kind === 'dawn') { g.addColorStop(0, '#5a6fb0'); g.addColorStop(0.7, '#f2a87a'); g.addColorStop(1, '#ffd29a'); } else { g.addColorStop(0, '#6a9fd8'); g.addColorStop(1, '#f0c49a'); }
  ctx.fillStyle = g; ctx.fillRect(-3000, -2000, 9000, FLOOR + 2000);
  if (kind === 'night') { ctx.fillStyle = '#f3efd8'; ctx.beginPath(); ctx.arc(2200, -300, 60, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.7)'; for (let i = 0; i < 80; i++) ctx.fillRect(-2000 + hash(i) * 6000, -1200 + hash(i + 1) * 1200, 3, 3); }
}
function city(ctx, t, kind, o = {}) { // layered skyline with smoke columns and fires; par = parallax offset
  const par = o.par || 0;
  const layer = (n, y, hmin, hmax, col, seed, k) => { for (let i = 0; i < n; i++) { const w = 120 + hash(seed + i) * 160, x = -2200 + i * 230 + par * k, h = hmin + hash(seed + i + 50) * (hmax - hmin);
    ctx.fillStyle = col; ctx.fillRect(x, y - h, w, h + 400); ctx.fillStyle = kind === 'night' ? 'rgba(255,220,140,0.55)' : 'rgba(255,255,255,0.18)'; for (let a = 0; a < h - 40; a += 46) for (let b = 14; b < w - 20; b += 36) if (hash(seed + i + a * 3 + b) > (kind === 'night' ? 0.85 : 0.6)) ctx.fillRect(x + b, y - h + 20 + a, 16, 22); } };
  layer(28, FLOOR - 80, 300, 800, kind === 'night' ? '#2a2645' : '#8a8fb0', 3, 0.2);
  // smoke columns + fires
  for (let i = 0; i < 5; i++) { const x = -1500 + i * 1100 + hash(i) * 300 + par * 0.3; for (let j = 0; j < 9; j++) { const yy = FLOOR - 500 - j * 120 - (t * 30 % 120), r = 60 + j * 22; ctx.fillStyle = `rgba(${kind === 'night' ? '40,36,50' : '70,64,70'},${0.5 - j * 0.04})`; ctx.beginPath(); ctx.arc(x + Math.sin(t * 0.5 + j + i) * 30 + j * 25, yy, r, 0, 7); ctx.fill(); }
    glow(ctx, x, FLOOR - 470, 160, 'rgba(255,120,40,0.5)'); }
  layer(22, FLOOR - 40, 200, 520, kind === 'night' ? '#1c1a30' : '#5d6488', 9, 0.45);
  if (o.heli) { const hx = -800 + (t * 120) % 4000; ctx.fillStyle = '#222'; ctx.beginPath(); ctx.ellipse(hx, -200, 40, 18, 0, 0, 7); ctx.fill(); ctx.fillRect(hx + 30, -204, 60, 6); line(ctx, [[hx - 60, -222], [hx + 60, -222]], 3, '#222'); }
}
const EDGE = -250, STREET = FLOOR + 2500;
function roof(ctx, t, kind = 'day', o = {}) {
  sky(ctx, kind, t); city(ctx, t, kind, o);
  facade(ctx, t, kind);
  paint(ctx, S, c => c.rect(EDGE, FLOOR - 70, 6000, 70), '#8c8a86'); paint(ctx, S, c => c.rect(EDGE, FLOOR - 84, 6000, 18), '#a8a6a0');
  paint(ctx, S, c => c.rect(EDGE, FLOOR, 6000, 46), '#6f6d6a', { k: 0.92 }); ctx.fillStyle = 'rgba(0,0,0,0.1)'; for (let x = EDGE; x < 4000; x += 200) ctx.fillRect(x, FLOOR, 4, 46);
  paint(ctx, S, c => c.rect(EDGE - 24, FLOOR - 50, 30, 96), '#a8a6a0');
  rr(ctx, 1500, FLOOR - 300, 400, 300, 10, '#b7bec6'); for (let y = FLOOR - 270; y < FLOOR - 40; y += 30) line(ctx, [[1530, y], [1870, y]], 5, '#8d96a0');
  ctx.save(); ctx.translate(o.ductShake || 0, 0);
  rr(ctx, 1560, FLOOR - 470, 120, 190, 6, '#a7aeb6'); paint(ctx, S, c => c.ellipse(1620, FLOOR - 470, 60, 18, 0, 0, 7), '#8d96a0');
  rr(ctx, 1580, FLOOR - 430, 80, 70, 4, '#2a2e33');
  if (o.ventEyes) { glow(ctx, 1620, FLOOR - 395, 140, `rgba(255,40,30,${0.9 * o.ventEyes})`); ctx.fillStyle = `rgba(255,70,50,${o.ventEyes})`; for (const ex of [1602, 1638]) { ctx.beginPath(); ctx.ellipse(ex, FLOOR - 395, 12, 8, 0, 0, 7); ctx.fill(); } }
  for (let i = 0; i < 4; i++) line(ctx, [[1588, FLOOR - 420 + i * 16], [1652, FLOOR - 420 + i * 16]], 4, '#5d646c');
  ctx.restore();
  rr(ctx, 2300, FLOOR - 560, 700, 560, 6, '#a39a8c'); paint(ctx, S, c => c.rect(2280, FLOOR - 590, 740, 40), '#7d766c');
  if (o.doorOpen) { ctx.fillStyle = '#1a1a20'; ctx.fillRect(2400, FLOOR - 420, 230, 420); paint(ctx, S, c => { c.moveTo(2400, FLOOR - 420); c.lineTo(2340, FLOOR - 440); c.lineTo(2340, FLOOR + 10); c.lineTo(2400, FLOOR); c.closePath(); }, '#6d7a86'); }
  else { ctx.save(); ctx.translate(o.doorShake || 0, 0); paint(ctx, S, c => c.rect(2400, FLOOR - 420, 230, 420), '#6d7a86'); rr(ctx, 2590, FLOOR - 230, 22, 50, 6, PAL.metal); rr(ctx, 2420, FLOOR - 230, 22, 50, 6, PAL.metal);
    const pr = o.pipeRattle || 0; if (o.pipe) { line(ctx, [[2380, FLOOR - 205 + pr], [2650, FLOOR - 205 - pr]], 20, S.ink); line(ctx, [[2380, FLOOR - 205 + pr], [2650, FLOOR - 205 - pr]], 13, '#7a7d84'); }
    ctx.restore(); }
  rr(ctx, 400, FLOOR - 420, 260, 300, 20, '#7a6a5a'); for (const x of [420, 620]) line(ctx, [[x, FLOOR - 120], [x, FLOOR]], 12, '#4a4038');
}
function facade(ctx, t, kind = 'day') {
  ctx.fillStyle = kind === 'night' ? '#1c1a2a' : '#4a4660'; ctx.fillRect(-4000, FLOOR + 300, EDGE + 4000, STREET - FLOOR);
  paint(ctx, S, c => c.rect(EDGE, FLOOR, 6000, STREET - FLOOR), '#a07d62');
  for (let y = FLOOR + 140; y < STREET - 300; y += 320) for (let x = EDGE + 120; x < 3800; x += 300) { paint(ctx, S, c => c.rect(x, y, 160, 200), '#3a4258'); paint(ctx, S, c => c.rect(x - 10, y + 200, 180, 16), '#d9c7a8'); }
  paint(ctx, S, c => c.rect(-4000, STREET, 8000, 600), '#4a4a50'); ctx.fillStyle = '#d6d0a0'; for (let x = -4000; x < 4000; x += 260) ctx.fillRect(x, STREET + 140, 140, 14);
  paint(ctx, S, c => c.rect(-4000, STREET - 30, 8000, 30), '#8d8a84');
  paint(ctx, S, c => c.roundRect(-1500, STREET - 160, 420, 130, 30), '#d6413a'); paint(ctx, S, c => c.roundRect(-1420, STREET - 230, 250, 90, 24), '#b8352f'); for (const w of [-1410, -1170]) paint(ctx, S, c => c.arc(w, STREET - 30, 40, 0, 7), '#222');
}
// ---------------------------------------------------------------- stair-house interior (tech room)
// metal door to the roof at left (x 260-640), door to the stairs at right (x 1360-1700, with keyhole), metal panel (reflection) centre-left
const TR = { roofDoor: 450, stairDoor: 1530, panel: [760, 300, 380, 300], keyhole: [1640, 560] };
function techRoom(ctx, t, o = {}) {
  ctx.fillStyle = '#5d6a6a'; ctx.fillRect(-800, -400, 3600, FLOOR + 400);
  ctx.fillStyle = 'rgba(0,0,0,0.1)'; for (let y = -400; y < FLOOR; y += 70) ctx.fillRect(-800, y, 3600, 3);
  paint(ctx, S, c => c.rect(-800, FLOOR, 3600, 600), '#4a4e52', { k: 0.92 });
  // pipes
  line(ctx, [[-800, 140], [2800, 140]], 30, S.ink); line(ctx, [[-800, 140], [2800, 140]], 22, '#8a6a45'); line(ctx, [[1200, 140], [1200, FLOOR]], 26, S.ink); line(ctx, [[1200, 140], [1200, FLOOR]], 18, '#7d8a8a');
  // roof door (metal)
  paint(ctx, S, c => c.rect(240, 180, 420, FLOOR - 170), '#3a3f45'); paint(ctx, S, c => c.rect(270, 210, 360, FLOOR - 210), '#7d8a96');
  for (let i = 0; i < 4; i++) line(ctx, [[290, 280 + i * 140], [610, 280 + i * 140]], 4, '#5d6a76'); rr(ctx, 590, 540, 26, 60, 6, PAL.metal);
  ctx.fillStyle = 'rgba(255,240,200,0.8)'; ctx.fillRect(272, FLOOR - 6, 356, 6);
  // metal panel (reflection) — framed brushed steel
  const [px, py, pw, ph] = TR.panel; paint(ctx, S, c => c.rect(px - 14, py - 14, pw + 28, ph + 28), '#3a3f45');
  const g = ctx.createLinearGradient(px, py, px + pw, py + ph); g.addColorStop(0, '#9aa6ae'); g.addColorStop(0.5, '#c9d2d8'); g.addColorStop(1, '#8a949c'); ctx.fillStyle = g; ctx.fillRect(px, py, pw, ph);
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 2; for (let i = 0; i < 30; i++) { ctx.beginPath(); ctx.moveTo(px, py + i * 10); ctx.lineTo(px + pw, py + i * 10 + 4); ctx.stroke(); } ctx.restore();
  line(ctx, [[px + pw * 0.7, py], [px + pw * 0.55, py + ph * 0.45], [px + pw * 0.62, py + ph]], 3, 'rgba(40,40,40,0.7)');   // crack
  ctx.save(); ctx.fillStyle = '#d6413a'; ctx.font = '28px Anton'; ctx.fillText('DANGER · HIGH VOLTAGE', px + 20, py + ph + 50); ctx.restore();
  // door to the stairwell (wood, keyhole)
  paint(ctx, S, c => c.rect(1340, 170, 400, FLOOR - 160), PAL.trim); ctx.save(); ctx.translate(o.doorShake || 0, 0);
  paint(ctx, S, c => c.rect(1370, 200, 340, FLOOR - 200), '#9a6a48'); paint(ctx, S, c => { c.roundRect(1400, 240, 280, 260, 8); c.roundRect(1400, 540, 280, 300, 8); }, '#865a3c', { k: 0.95 });
  paint(ctx, S, c => c.ellipse(1640, 520, 18, 18, 0, 0, 7), PAL.metal); paint(ctx, S, c => { c.arc(1640, 560, 8, 0, 7); c.rect(1636, 560, 8, 18); }, '#1a1a1a');
  if (o.bolt) paint(ctx, S, c => c.rect(1380, 600, 200, 24), '#5a5d63');
  ctx.restore(); ctx.fillStyle = '#ffd98a'; ctx.fillRect(1372, FLOOR - 4, 336, 6);
  if (o.feet) { ctx.fillStyle = '#1a1410'; ctx.fillRect(1460, FLOOR - 4, 56, 6); ctx.fillRect(1580, FLOOR - 4, 56, 6); }
  // boxes, bulb
  rr(ctx, -300, FLOOR - 200, 260, 200, 6, '#b48a5a'); rr(ctx, -250, FLOOR - 340, 180, 140, 6, '#c49a6a');
  line(ctx, [[1000, -400], [1000, 90]], 4, '#222'); paint(ctx, S, c => c.arc(1000, 110, 26, 0, 7), o.bulbOff ? '#777' : '#fff1b0');
  if (!o.bulbOff) glow(ctx, 1000, 110, 900, `rgba(255,220,150,${0.26 * (o.flick ?? 1)})`);
}
function techGrade(ctx, o = {}) { ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = o.col || '#b8b8c8'; ctx.fillRect(-2000, -2000, 6000, 5000); ctx.restore(); }
// first aid kit (open) + unicorn band-aid
function aidKit(ctx, x, y, s = 1, open = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  paint(ctx, S, c => c.roundRect(-150, -90, 300, 180, 16), '#f4f1ea'); paint(ctx, S, c => c.roundRect(-150, -90, 300, 180, 16), '#f4f1ea');
  ctx.fillStyle = '#d6413a'; ctx.fillRect(-20, -60, 40, 120); ctx.fillRect(-60, -20, 120, 40);
  if (open > 0) { paint(ctx, S, c => c.roundRect(-140, -90 - 170 * open, 280, 170 * open, 16), '#e8e3d8'); ctx.fillStyle = '#ddd6c8'; ctx.fillRect(-130, -80, 260, 160); }
  ctx.restore();
}
function bandaid(ctx, x, y, s = 1, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  paint(ctx, S, c => c.roundRect(-110, -34, 220, 68, 34), '#f7c6dc'); paint(ctx, S, c => c.roundRect(-40, -26, 80, 52, 10), '#fbe7f0');
  // tiny unicorn: head + horn + rainbow mane
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(0, 4, 18, 14, 0, 0, 7); ctx.fill(); ctx.strokeStyle = S.ink; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.moveTo(-4, -8); ctx.lineTo(2, -26); ctx.lineTo(6, -8); ctx.fill(); ctx.stroke();
  for (const [c, i] of [['#d6413a', 0], ['#f0aa22', 1], ['#3fae63', 2], ['#3f62b0', 3]]) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(14 + i * 5, -4 + i * 5, 5, 0, 7); ctx.fill(); }
  ctx.fillStyle = S.ink; ctx.beginPath(); ctx.arc(-6, 2, 2.5, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(-14, 12, 6, 0, Math.PI); ctx.stroke();
  for (const sx of [-80, -60, 60, 80]) for (const sy of [-12, 8]) { ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.beginPath(); ctx.arc(sx, sy, 3, 0, 7); ctx.fill(); }
  ctx.restore();
}
module.exports = { FLOOR, PAL, APT, apartment, chain, tvNews, tvStatic, aptNight, fridgeInside, hallway, graffiti, market, shelf, crowd, cartDraw, ITEMS, ST, flight, stairY, climbPose, stairwell, sky, city, roof, facade, STREET, EDGE, TR, techRoom, techGrade, aidKit, bandaid, rect, rr };
