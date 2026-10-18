// Cruise Ship sets (D2 ink + cel shade, serious low-key lighting). Side views, floor line = FLOOR.
const K = require('./cast'), { R, D2 } = K, { paint, line, shade } = R;
const C = require('./core'), { W, H, hash, clamp, lerp, glow } = C;
const { createCanvas } = require('../../node_modules/@napi-rs/canvas');
const FLOOR = 900, S = D2;
const rect = (ctx, x, y, w, h, col, o) => paint(ctx, S, c => c.rect(x, y, w, h), col, o);
const rr = (ctx, x, y, w, h, r, col, o) => paint(ctx, S, c => c.roundRect(x, y, w, h, r), col, o);
const txt = (ctx, s, x, y, size, col, o = {}) => { ctx.save(); ctx.font = `${size}px ${o.font || 'Anton'}`; ctx.fillStyle = col; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; if (o.rot) { ctx.translate(x, y); ctx.rotate(o.rot); ctx.fillText(s, 0, 0); } else ctx.fillText(s, x, y); ctx.restore(); };

// ---------------------------------------------------------------- lighting: darkness layer with light holes
// lights: [{x, y, r, a}] in world coords (current ctx transform), or cones {cone: [x, y, ang, spread, len]}
let LAYER = null;
function darkness(ctx, alpha, lights = [], col = '6,9,16') {
  LAYER = LAYER || createCanvas(W, H); const l = LAYER.getContext('2d'); const m = ctx.getTransform();
  l.setTransform(1, 0, 0, 1, 0, 0); l.globalCompositeOperation = 'source-over'; l.clearRect(0, 0, W, H); l.fillStyle = `rgba(${col},${alpha})`; l.fillRect(0, 0, W, H);
  l.setTransform(m); l.globalCompositeOperation = 'destination-out';
  for (const L of lights) {
    if (L.cone) { const [x, y, a, sp, len] = L.cone, g = l.createRadialGradient(x, y, 0, x, y, len); g.addColorStop(0, `rgba(0,0,0,${L.a ?? 1})`); g.addColorStop(1, 'rgba(0,0,0,0)'); l.fillStyle = g;
      l.beginPath(); l.moveTo(x, y); l.lineTo(x + Math.cos(a - sp) * len, y + Math.sin(a - sp) * len); l.lineTo(x + Math.cos(a + sp) * len, y + Math.sin(a + sp) * len); l.closePath(); l.fill(); }
    else { const g = l.createRadialGradient(L.x, L.y, 0, L.x, L.y, L.r); g.addColorStop(0, `rgba(0,0,0,${L.a ?? 1})`); g.addColorStop(1, 'rgba(0,0,0,0)'); l.fillStyle = g; l.fillRect(L.x - L.r, L.y - L.r, L.r * 2, L.r * 2); }
  }
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(LAYER, 0, 0); ctx.restore();
}
function tint(ctx, col, mode = 'multiply') { ctx.save(); ctx.globalCompositeOperation = mode; ctx.fillStyle = col; ctx.fillRect(-4000, -4000, 12000, 12000); ctx.restore(); }

// ---------------------------------------------------------------- sea / sky / the liner
function sky(ctx, kind, t) {
  const g = ctx.createLinearGradient(0, -1400, 0, FLOOR);
  const P = { sunset: ['#2b2f5a', '#c8603a', '#f2a65a'], night: ['#05070f', '#0e1630', '#1a2240'], dawn: ['#23305a', '#7a6a8a', '#e8a07a'] }[kind];
  g.addColorStop(0, P[0]); g.addColorStop(0.65, P[1]); g.addColorStop(1, P[2]); ctx.fillStyle = g; ctx.fillRect(-4000, -2000, 12000, FLOOR + 2200);
  if (kind === 'sunset') { glow(ctx, 2600, 560, 420, 'rgba(255,190,110,0.55)'); paint(ctx, S, c => c.arc(2600, 600, 90, 0, 7), '#ffd08a', { noInk: true, flat: true }); }
  if (kind === 'night') { ctx.fillStyle = 'rgba(255,255,255,0.75)'; for (let i = 0; i < 120; i++) ctx.fillRect(-2000 + hash(i) * 7000, -1300 + hash(i + 1) * 1700, 3, 3); }
}
function sea(ctx, y0, kind, t) {
  const g = ctx.createLinearGradient(0, y0, 0, y0 + 900); const P = { sunset: ['#3a3a6a', '#1a2040'], night: ['#0b1426', '#04070e'], dawn: ['#3a4a70', '#1a2440'] }[kind];
  g.addColorStop(0, P[0]); g.addColorStop(1, P[1]); ctx.fillStyle = g; ctx.fillRect(-4000, y0, 12000, 3000);
  ctx.strokeStyle = kind === 'sunset' ? 'rgba(255,190,130,0.35)' : 'rgba(150,180,230,0.18)'; ctx.lineWidth = 3;
  for (let i = 0; i < 60; i++) { const yy = y0 + 10 + (i * 37) % 600, xx = -2000 + (hash(i) * 7000 + t * 20 * (1 + (i % 3))) % 7000; ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx + 60 + hash(i + 2) * 80, yy); ctx.stroke(); }
}
// the whole liner, side view; x0 = bow, length ~2600; lit windows; o.turn adds a wake curve
function liner(ctx, x0, y, t, o = {}) {
  const L = 2600, lit = o.lit ?? 0.35;
  paint(ctx, S, c => { c.moveTo(x0, y - 260); c.lineTo(x0 + L, y - 260); c.lineTo(x0 + L - 60, y); c.lineTo(x0 + 140, y); c.quadraticCurveTo(x0 + 20, y - 80, x0, y - 260); c.closePath(); }, '#e9e6e0');
  paint(ctx, S, c => { c.moveTo(x0 + 120, y - 40); c.lineTo(x0 + L - 70, y - 40); c.lineTo(x0 + L - 60, y); c.lineTo(x0 + 140, y); c.closePath(); }, '#2b3a5a');
  for (let d = 0; d < 5; d++) rect(ctx, x0 + 300 + d * 40, y - 260 - (d + 1) * 70, L - 600 - d * 120, 70, d % 2 ? '#f2efe8' : '#e3dfd6');
  paint(ctx, S, c => c.roundRect(x0 + L - 900, y - 760, 220, 240, 20), '#c8402e');   // funnel
  for (let d = 0; d < 6; d++) for (let i = 0; i < 40; i++) { const wx = x0 + 340 + i * 52, wy = y - 230 + (d < 1 ? 0 : -(d) * 70); if (wx > x0 + L - 300 - d * 100) continue; ctx.fillStyle = hash(i * 7 + d) < lit ? '#ffd98a' : '#3a4256'; ctx.fillRect(wx, wy + 20, 30, 18); }
  // bridge windows (fore)
  ctx.fillStyle = o.bridgeLit ? '#ffd98a' : '#22283a'; ctx.fillRect(x0 + 300, y - 600, 260, 30);
  if (o.wake) { ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x0 + L - 60, y - 10); ctx.quadraticCurveTo(x0 + L + 600, y + 40 + o.wake * 80, x0 + L + 1400, y + 140 * o.wake); ctx.stroke(); }
}
function lighthouse(ctx, x, y, t, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#05070c'; ctx.beginPath(); ctx.moveTo(-400, 0); ctx.quadraticCurveTo(-100, -60, 0, -50); ctx.quadraticCurveTo(200, -40, 500, 0); ctx.fill(); ctx.fillRect(-14, -170, 28, 130);
  const a = t * 1.6, on = Math.cos(a) > 0.6; if (on) { glow(ctx, 0, -175, 160, 'rgba(255,240,180,0.8)'); } ctx.fillStyle = on ? '#fff6c8' : '#6a6040'; ctx.fillRect(-10, -184, 20, 16);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,240,180,0.18)'; ctx.beginPath(); ctx.moveTo(0, -176); const d = Math.sin(a) * 900; ctx.lineTo(d, -230); ctx.lineTo(d, -120); ctx.closePath(); ctx.fill(); ctx.restore(); ctx.restore(); }

// ---------------------------------------------------------------- pool deck at sunset (world x -400..3400)
function poolDeck(ctx, t, o = {}) {
  sky(ctx, 'sunset', t); sea(ctx, 640, 'sunset', t);
  rect(ctx, -600, 620, 4600, 18, '#d8d3c8'); for (let x = -600; x < 4000; x += 70) line(ctx, [[x, 638], [x, 700]], 6, '#bdb7aa'); rect(ctx, -600, 696, 4600, 14, '#d8d3c8');   // rail
  paint(ctx, S, c => c.rect(-600, 710, 4600, 900), '#b98a5a', { k: 0.9 }); ctx.fillStyle = 'rgba(0,0,0,0.08)'; for (let y = 730; y < 1300; y += 34) ctx.fillRect(-600, y, 4600, 3);   // teak deck
  // pool + loungers + bar
  paint(ctx, S, c => c.ellipse(1500, FLOOR + 190, 560, 60, 0, 0, 7), '#3fb0c8'); ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 3; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(1500 + Math.sin(t + i) * 40, FLOOR + 190, 200 + i * 50, 16 + i * 5, 0, 0.2, 1.4); ctx.stroke(); }
  for (const lx of [300, 650, 2350, 2700]) { paint(ctx, S, c => { c.moveTo(lx, FLOOR - 40); c.lineTo(lx + 220, FLOOR - 40); c.lineTo(lx + 260, FLOOR - 110); c.lineTo(lx + 240, FLOOR - 115); c.lineTo(lx + 210, FLOOR - 55); c.lineTo(lx, FLOOR - 55); c.closePath(); }, '#f2efe8'); line(ctx, [[lx + 20, FLOOR - 40], [lx + 20, FLOOR]], 6, '#9aa3ab'); line(ctx, [[lx + 200, FLOOR - 40], [lx + 200, FLOOR]], 6, '#9aa3ab'); }
  rr(ctx, 3050, 520, 420, 380, 10, '#6a4a32'); rect(ctx, 3030, 500, 460, 30, '#8a6a45'); for (let i = 0; i < 6; i++) paint(ctx, S, c => c.roundRect(3080 + i * 60, 440, 20, 60, 4), ['#3fae63', '#c8402e', '#f0aa22'][i % 3]);
  // stairway to the lower decks (left) with a doorway + the PA speaker on its wall
  rr(ctx, -380, 260, 520, 640, 8, '#e3dfd6'); rect(ctx, -300, 420, 260, 480, '#1a1c22'); txt(ctx, 'DECK 5', -170, 380, 40, '#2a3a5a');
  paint(ctx, S, c => { c.moveTo(60, 300); c.lineTo(120, 280); c.lineTo(120, 360); c.lineTo(60, 340); c.closePath(); }, '#9aa3ab'); rr(ctx, 30, 296, 36, 48, 6, '#7a828a');   // PA horn speaker
  if (o.speakerGlow) glow(ctx, 100, 320, 160, `rgba(255,220,160,${0.3 * o.speakerGlow})`);
  // string lights
  for (let i = 0; i < 30; i++) { const x = -300 + i * 130, y = 180 + Math.sin(i * 0.9) * 20; ctx.fillStyle = '#ffe6a0'; ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fill(); }
  line(ctx, Array.from({ length: 30 }, (_, i) => [-300 + i * 130, 180 + Math.sin(i * 0.9) * 20]), 2, '#333');
}
// ---------------------------------------------------------------- Deck 5 cabin corridor (side view, world x -800..4800)
function corridor(ctx, t, o = {}) {
  ctx.fillStyle = '#b8a07a'; ctx.fillRect(-1200, -400, 7000, FLOOR + 400); ctx.fillStyle = 'rgba(0,0,0,0.05)'; for (let x = -1200; x < 5800; x += 24) ctx.fillRect(x, -400, 2, FLOOR + 400);
  rect(ctx, -1200, 420, 7000, 18, '#8a6a45'); rect(ctx, -1200, 120, 7000, 30, '#e8e0cc');
  paint(ctx, S, c => c.rect(-1200, FLOOR, 7000, 600), '#5a2a3a', { k: 0.9 }); ctx.fillStyle = 'rgba(240,200,120,0.12)'; for (let x = -1200; x < 5800; x += 120) { ctx.beginPath(); ctx.arc(x, FLOOR + 60, 26, 0, 7); ctx.fill(); }   // carpet pattern
  for (let i = 0; i < 9; i++) { const dx = -700 + i * 620; rect(ctx, dx, 260, 250, FLOOR - 260, '#e9e2d0'); rect(ctx, dx + 16, 276, 218, FLOOR - 276, '#8a5a3a'); rr(ctx, dx + 180, 560, 30, 14, 4, '#d9b860');
    rr(ctx, dx + 70, 200, 110, 44, 6, '#2b2f3c'); txt(ctx, String(5101 + i * 2), dx + 125, 223, 28, '#e8d9a8'); if (o.doorOpen === i) rect(ctx, dx + 16, 276, 80, FLOOR - 276, '#16141a'); }
  for (let i = 0; i < 9; i++) { const lx = -390 + i * 620; rr(ctx, lx - 30, 300, 60, 40, 8, '#f2e6c8'); }
  // floor emergency strip
  for (let x = -1200; x < 5800; x += 60) { ctx.fillStyle = o.emergency ? (Math.floor(t * 2 + x / 60) % 2 ? '#ff5a3a' : '#7a2a1a') : '#f0d080'; ctx.fillRect(x, FLOOR - 6, 30, 5); }
}
function corridorLight(ctx, t, o = {}) {   // dim, flickering sconces
  const lights = []; for (let i = 0; i < 9; i++) { const f = (hash(i + Math.floor(t * 9)) > 0.93 && i === 3) ? 0.2 : 1; lights.push({ x: -390 + i * 620, y: 320, r: 520, a: 0.9 * f }); }
  if (o.extra) lights.push(...o.extra); darkness(ctx, o.dark ?? 0.62, lights, '10,6,14');
}
// ---------------------------------------------------------------- lobby: deck plan board + CREW ONLY door (world x 0..2400)
function lobby(ctx, t, o = {}) {
  ctx.fillStyle = '#c9c0ae'; ctx.fillRect(-800, -400, 4000, FLOOR + 400); paint(ctx, S, c => c.rect(-800, FLOOR, 4000, 600), '#3a4256', { k: 0.9 });
  rect(ctx, -800, 120, 4000, 30, '#e8e0cc');
  // deck plan board
  rr(ctx, 360, 230, 760, 460, 10, '#1c2436'); txt(ctx, 'DECK PLAN', 740, 270, 40, '#e8d9a8');
  paint(ctx, S, c => { c.moveTo(420, 520); c.lineTo(1000, 520); c.quadraticCurveTo(1080, 470, 1060, 420); c.lineTo(420, 420); c.closePath(); }, '#e8e4da');   // ship outline
  for (let d = 0; d < 5; d++) line(ctx, [[440, 430 + d * 18], [1030, 430 + d * 18]], 2, '#9aa3ab'); ctx.fillStyle = '#c8402e'; ctx.fillRect(560, 486, 60, 14); ctx.fillStyle = '#3fae63'; ctx.fillRect(820, 422, 120, 10);
  txt(ctx, 'LIFEBOATS', 880, 400, 22, '#3fae63'); txt(ctx, 'GALLEY', 590, 545, 22, '#ff6a4a'); txt(ctx, 'YOU ARE HERE', 760, 620, 26, '#ffd23f'); paint(ctx, S, c => c.arc(760, 590, 9, 0, 7), '#ffd23f');
  // up stairs (crowd) right, CREW ONLY door left
  rr(ctx, 1500, 160, 700, 740, 6, '#a89a84'); for (let i = 0; i < 10; i++) rect(ctx, 1520 + i * 60, FLOOR - (i + 1) * 60, 680 - i * 60, 18, '#8a7c66'); txt(ctx, 'TO LIFEBOATS', 1850, 200, 44, '#2a6a3a');
  rect(ctx, -120, 240, 300, FLOOR - 240, '#9aa3ab'); rect(ctx, -100, 260, 260, FLOOR - 260, o.crewOpen ? '#0c0d10' : '#6a7480'); rr(ctx, -90, 330, 240, 60, 6, '#d6413a'); txt(ctx, 'CREW ONLY', 30, 360, 38, '#fff');
}
// lifeboat deck seen from above-ish (wide)
function lifeboats(ctx, t, o = {}) {
  sky(ctx, 'sunset', t); sea(ctx, 980, 'sunset', t);
  paint(ctx, S, c => c.rect(-800, 620, 4400, 400), '#e3dfd6'); paint(ctx, S, c => c.rect(-800, 760, 4400, 260), '#b98a5a');
  for (let i = 0; i < 5; i++) { const bx = -400 + i * 820, jam = i === 2;
    ctx.save(); ctx.translate(bx + 260, 560); if (jam) ctx.rotate(-0.32 + Math.sin(t * 7) * 0.02);
    paint(ctx, S, c => { c.moveTo(-250, -40); c.lineTo(250, -40); c.quadraticCurveTo(270, 40, 200, 60); c.lineTo(-200, 60); c.quadraticCurveTo(-270, 40, -250, -40); c.closePath(); }, '#f07a2e'); rect(ctx, -230, -70, 460, 34, '#e8e4da'); ctx.restore();
    line(ctx, [[bx + 40, 420], [bx + 40, 640]], 14, '#6a7480'); line(ctx, [[bx + 480, 420], [bx + 480, 640]], 14, '#6a7480'); }
  // crowd silhouettes jammed along the rail
  for (let i = 0; i < 60; i++) { const x = -700 + (i * 71) % 4300 + Math.sin(t * 4 + i) * 18, y = 760 + (i % 3) * 30, inf = i % 11 === 4;
    ctx.fillStyle = inf ? 'rgba(70,90,60,0.95)' : `rgba(${30 + (i % 4) * 10},${28 + (i % 3) * 8},${40},0.9)`; ctx.beginPath(); ctx.arc(x, y - 120, 22, 0, 7); ctx.fill(); ctx.beginPath(); ctx.roundRect(x - 22, y - 100, 44, 100, 14); ctx.fill();
    if (i % 5 === 0) { ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y - 90); ctx.lineTo(x + 20, y - 170 - Math.abs(Math.sin(t * 6 + i)) * 20); ctx.stroke(); } }
}
// ---------------------------------------------------------------- the galley (main set, world x -200..3400)
// steel door 120-480 (porthole), prep counter 900-1700, shelves 1800-2500, ovens 600-850, cold room 2700-3150, hatch inside cold room at 3060
const GAL = { door: 300, counter: 1300, shelves: 2150, oven: 720, cold: 2920, hatch: 3060, porthole: [1560, 390] };
function galley(ctx, t, o = {}) {
  ctx.fillStyle = '#9aa6ae'; ctx.fillRect(-800, -400, 4800, FLOOR + 400); ctx.fillStyle = 'rgba(255,255,255,0.08)'; for (let x = -800; x < 4000; x += 80) for (let y = -400; y < FLOOR; y += 80) ctx.fillRect(x + 2, y + 2, 76, 76);   // tiles
  paint(ctx, S, c => c.rect(-800, FLOOR, 4800, 600), '#5a6268', { k: 0.92 }); ctx.fillStyle = 'rgba(0,0,0,0.12)'; for (let x = -800; x < 4000; x += 90) ctx.fillRect(x, FLOOR, 3, 600);
  // steel door with porthole
  rect(ctx, 100, 180, 400, FLOOR - 170, '#5a6268'); ctx.save(); ctx.translate(o.doorShake || 0, 0); rect(ctx, 130, 210, 340, FLOOR - 210, '#8a949c');
  for (const y of [300, 600]) line(ctx, [[150, y], [450, y]], 4, '#6a747c'); paint(ctx, S, c => c.arc(300, 360, 46, 0, 7), '#3a424a'); ctx.fillStyle = o.doorDark ? '#0a0c10' : '#1a2230'; ctx.beginPath(); ctx.arc(300, 360, 36, 0, 7); ctx.fill();
  if (o.doorFace) o.doorFace(ctx); rr(ctx, 430, 520, 22, 70, 6, '#c9cfd6'); ctx.restore();
  // ovens + timer shelf
  rr(ctx, 560, 560, 340, FLOOR - 560, 6, '#c9cfd6'); for (const y of [600, 740]) rr(ctx, 590, y, 280, 110, 6, '#2a2e34'); rr(ctx, 560, 520, 340, 40, 6, '#9aa3ab');
  // hanging rack with ladles (swing angle o.swing)
  line(ctx, [[820, 120], [1780, 120]], 12, '#6a747c'); for (let i = 0; i < 9; i++) { const hx = 870 + i * 110, a = (o.swing || 0) * Math.sin(t * 1.4 + i * 0.4); ctx.save(); ctx.translate(hx, 120); ctx.rotate(a);
    line(ctx, [[0, 0], [0, 150 + (i % 3) * 30]], 6, '#c9cfd6'); paint(ctx, S, c => c.ellipse(0, 170 + (i % 3) * 30, 26, 18, 0, 0, 7), i % 2 ? '#c9cfd6' : '#3a3b40'); ctx.restore(); }
  // prep counter (hiding place)
  rr(ctx, 900, 560, 820, 40, 6, '#c9cfd6'); rect(ctx, 920, 600, 780, FLOOR - 600, '#a7b0b8'); for (let i = 0; i < 4; i++) rr(ctx, 940 + i * 190, 630, 170, 240, 4, '#9aa3ab');
  // shelves with supplies (o.stock 0..1 empties them)
  rect(ctx, 1820, 220, 660, FLOOR - 220, '#7a848c'); const cols = ['#d6413a', '#3f62b0', '#f0aa22', '#3fae63', '#e9e4dc', '#c8a060'];
  for (let r = 0; r < 4; r++) { const y = 300 + r * 150; rect(ctx, 1830, y + 80, 640, 12, '#5a6268'); for (let i = 0; i < 13; i++) { if (hash(i + r * 13) > (o.stock ?? 1)) continue; const ph = 40 + hash(i * 3 + r) * 34; rr(ctx, 1845 + i * 48, y + 80 - ph, 40, ph, 4, cols[(i + r) % 6], { k: 0.85 }); } }
  // water bottles crate on the floor in front of shelves (o.water 0..1)
  for (let i = 0; i < 9; i++) if (i < Math.round((o.water ?? 1) * 9)) { const bx = 1880 + i * 34; rr(ctx, bx, FLOOR - 92, 26, 90, 8, '#9fd6ff'); rect(ctx, bx + 7, FLOOR - 104, 12, 14, '#3f62b0'); }
  // porthole (small, high) — night sea / lighthouse drawn by o.porthole
  paint(ctx, S, c => c.arc(GAL.porthole[0], GAL.porthole[1], 64, 0, 7), '#5a6268'); ctx.save(); ctx.beginPath(); ctx.arc(GAL.porthole[0], GAL.porthole[1], 50, 0, 7); ctx.clip(); ctx.fillStyle = '#0b1426'; ctx.fillRect(GAL.porthole[0] - 60, GAL.porthole[1] - 60, 120, 120); if (o.porthole) o.porthole(ctx); ctx.restore();
  // tally marks on the fridge-side wall (o.tally = count)
  rr(ctx, 2560, 330, 110, 140, 6, '#f2efe8'); for (let i = 0; i < (o.tally || 0); i++) { const g = Math.floor(i / 5), k = i % 5, x0 = 2575 + (g % 3) * 32, y0 = 345 + Math.floor(g / 3) * 40; if (k < 4) line(ctx, [[x0 + k * 6, y0], [x0 + k * 6, y0 + 28]], 3, '#1a1a1a'); else line(ctx, [[x0 - 4, y0 + 22], [x0 + 24, y0 + 4]], 3, '#1a1a1a'); }
  // cold room
  rect(ctx, 2700, 200, 470, FLOOR - 190, '#c9d2d8'); txt(ctx, 'COLD ROOM', 2935, 240, 34, '#3a4256');
  if (o.coldOpen) { rect(ctx, 2730, 280, 410, FLOOR - 280, '#1c2a34'); rect(ctx, 2760, 420, 200, 14, '#7a848c'); for (let i = 0; i < Math.round(4 * (o.bread ?? 1)); i++) paint(ctx, S, c => c.ellipse(2790 + i * 45, 404, 22, 12, 0, 0, 7), '#d9a05a');
    rect(ctx, 3000, FLOOR - 220, 120, 200, o.hatchOpen ? '#08090c' : '#5a646c'); txt(ctx, 'ENG ACCESS', 3060, FLOOR - 240, 22, '#ffd23f'); }
  else { rect(ctx, 2730, 280, 410, FLOOR - 280, '#dde4e8'); rr(ctx, 3090, 520, 24, 90, 6, '#9aa3ab'); if (o.handprint) { ctx.save(); ctx.fillStyle = 'rgba(15,12,10,0.85)'; ctx.beginPath(); ctx.ellipse(3080, 560, 16, 20, 0.2, 0, 7); ctx.fill(); for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(3068 + i * 9, 530, 4, 11, 0.1, 0, 7); ctx.fill(); } ctx.restore(); } }
  // the barricade cart (o.cart: x position)
  if (o.cart != null) { const cx = o.cart; rr(ctx, cx, 640, 300, 30, 6, '#c9cfd6'); rr(ctx, cx, 780, 300, 24, 6, '#c9cfd6'); for (const lx of [cx + 10, cx + 280]) line(ctx, [[lx, 640], [lx, FLOOR - 20]], 10, '#9aa3ab'); for (const wx of [cx + 20, cx + 280]) paint(ctx, S, c => c.arc(wx, FLOOR - 14, 14, 0, 7), '#333'); }
}
// ---------------------------------------------------------------- crew mess (world x 0..2400)
function crewMess(ctx, t, o = {}) {
  ctx.fillStyle = '#8a9a8e'; ctx.fillRect(-800, -400, 4000, FLOOR + 400); paint(ctx, S, c => c.rect(-800, FLOOR, 4000, 600), '#4a5450', { k: 0.92 });
  rect(ctx, -800, 120, 4000, 30, '#d8d3c8');
  for (const tx of [200, 900]) { rr(ctx, tx, 680, 500, 26, 6, '#c9c0ae'); line(ctx, [[tx + 40, 706], [tx + 40, FLOOR]], 10, '#6a747c'); line(ctx, [[tx + 460, 706], [tx + 460, FLOOR]], 10, '#6a747c'); }
  // ice machine (right)
  rr(ctx, 1650, 420, 320, FLOOR - 420, 10, '#c9cfd6'); rr(ctx, 1690, 470, 240, 120, 6, '#2a2e34'); txt(ctx, 'ICE', 1810, 530, 44, '#9fd6ff'); rr(ctx, 1730, 640, 160, 120, 6, '#3a424a');
  if (o.iceOn) { for (let i = 0; i < 12; i++) { ctx.fillStyle = '#e6f6ff'; ctx.fillRect(1760 + hash(i + Math.floor(t * 20)) * 100, 650 + hash(i * 3 + Math.floor(t * 20)) * 90, 14, 14); } }
  // lifeboat kit box on the wall with the VHF radio
  rr(ctx, 1150, 300, 260, 200, 8, '#f07a2e'); txt(ctx, 'LIFEBOAT KIT', 1280, 330, 26, '#fff'); if (!o.radioTaken) { rr(ctx, 1260, 380, 44, 90, 8, '#f0c020'); line(ctx, [[1296, 380], [1296, 340]], 6, '#222'); }
}
// ---------------------------------------------------------------- one-point perspective corridor / tunnel (screen space)
// z = distance travelled; kind 'corridor' | 'tunnel'; returns nothing. Things at depth can be drawn by o.at(depth)->screen
function pov(ctx, t, z, kind, o = {}) {
  const cx = W / 2 + (o.sway || 0), cy = H / 2 + (o.bob || 0), tun = kind === 'tunnel';
  ctx.fillStyle = tun ? '#2a2e34' : '#3a2a2a'; ctx.fillRect(0, 0, W, H);
  const far = (d) => 1 / (1 + d / 300);   // scale at depth d
  // rings (frames) every 200 units
  const step = tun ? 160 : 260, off = z % step;
  for (let i = 14; i >= 0; i--) { const d = i * step - off; if (d < -100) continue; const s = far(Math.max(d, 1)), hw = (tun ? 520 : 900) * s, hh = (tun ? 420 : 520) * s;
    const shadeK = clamp(1 - d / 2800); ctx.strokeStyle = tun ? `rgba(150,160,170,${shadeK})` : `rgba(200,170,120,${shadeK})`; ctx.lineWidth = Math.max(1, 14 * s); ctx.strokeRect(cx - hw, cy - hh, hw * 2, hh * 2);
    if (!tun && i % 2 === 0) { ctx.fillStyle = `rgba(110,70,50,${shadeK})`; ctx.fillRect(cx - hw + 8 * s, cy - hh * 0.6, 140 * s, hh * 1.6); ctx.fillRect(cx + hw - 148 * s, cy - hh * 0.6, 140 * s, hh * 1.6); }
    if (tun) { ctx.fillStyle = `rgba(255,210,60,${shadeK * 0.7})`; if (i === 6) txt(ctx, 'TO ENGINE CONTROL', cx + hw * 0.3, cy - hh * 0.6, 60 * s, `rgba(255,210,60,${shadeK})`); } }
  // floor / ceiling lines to the vanishing point
  ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 4; for (const [x, y] of [[0, 0], [W, 0], [0, H], [W, H]]) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(cx, cy); ctx.stroke(); }
  if (o.things) o.things(ctx, (d) => ({ s: far(Math.max(1, d - z)), x: cx, y: cy, d: d - z }));
  const lights = o.lights || []; darkness(ctx, o.dark ?? (tun ? 0.86 : 0.7), lights, '4,5,10');
}
// ---------------------------------------------------------------- engine room + control console (world x -600..3600)
const ENG = { console: [1900, 560], monitor: [2260, 360], rudder: [1980, 470], fuel: [2140, 640] };
function engineRoom(ctx, t, o = {}) {
  ctx.fillStyle = '#3a3e44'; ctx.fillRect(-1000, -600, 5600, FLOOR + 600); paint(ctx, S, c => c.rect(-1000, FLOOR, 5600, 600), '#2a2c30', { k: 0.92 });
  for (let x = -1000; x < 4600; x += 50) { ctx.fillStyle = 'rgba(255,255,255,0.03)'; ctx.fillRect(x, FLOOR, 25, 600); }
  // engines (big cylinders) + pipes
  for (const ex of [-500, 300]) { rr(ctx, ex, 300, 680, 600, 40, '#6a7a6a'); for (let i = 0; i < 6; i++) rr(ctx, ex + 40 + i * 105, 220, 80, 120, 10, '#5a6a5a'); line(ctx, [[ex + 340, 300], [ex + 340, -200]], 40, '#4a5450');
    if (o.running) for (let i = 0; i < 6; i++) { ctx.fillStyle = `rgba(255,120,60,${0.25 + 0.2 * Math.sin(t * 20 + i)})`; ctx.fillRect(ex + 60 + i * 105, 260, 40, 10); } }
  line(ctx, [[-1000, 100], [4600, 100]], 34, '#2a2c30'); line(ctx, [[-1000, 100], [4600, 100]], 26, '#8a6a45'); line(ctx, [[-1000, 170], [4600, 170]], 22, '#5a6a7a');
  // catwalk + railing
  rect(ctx, 1200, 700, 2400, 22, '#5a5e64'); for (let x = 1220; x < 3600; x += 90) line(ctx, [[x, 700], [x, 600]], 6, '#c9a030'); line(ctx, [[1200, 600], [3600, 600]], 8, '#c9a030');
  // control console (on the catwalk level)
  rr(ctx, 1760, 420, 620, 280, 10, '#2e3238'); rr(ctx, 1780, 440, 300, 100, 6, '#0e1a14');
  const ovr = o.override; txt(ctx, 'STEERING', 1930, 462, 22, '#7ad0a0'); txt(ctx, ovr ? 'BRIDGE OVERRIDE' : 'ENGINE CONTROL', 1930, 500, ovr ? 26 : 30, ovr ? (Math.floor(t * 4) % 2 ? '#ff5a3a' : '#ffb0a0') : '#9ff0c0');
  // rudder indicator
  paint(ctx, S, c => c.arc(ENG.rudder[0], ENG.rudder[1] + 120, 54, Math.PI, 0), '#1a1e24'); line(ctx, [[ENG.rudder[0], ENG.rudder[1] + 120], [ENG.rudder[0] + Math.sin(o.rudder || 0) * 48, ENG.rudder[1] + 120 - Math.cos(o.rudder || 0) * 48]], 5, '#ffd23f'); txt(ctx, 'RUDDER', ENG.rudder[0], ENG.rudder[1] + 140, 18, '#9aa3ab');
  // fuel gauge
  paint(ctx, S, c => c.arc(ENG.fuel[0], ENG.fuel[1], 46, 0, 7), '#1a1e24'); const fa = -Math.PI * 0.75 + (o.fuel ?? 0.5) * Math.PI * 1.5; line(ctx, [[ENG.fuel[0], ENG.fuel[1]], [ENG.fuel[0] + Math.cos(fa - Math.PI / 2) * 38, ENG.fuel[1] + Math.sin(fa - Math.PI / 2) * 38]], 4, (o.fuel ?? 0.5) < 0.15 ? '#ff5a3a' : '#e8e2d0'); txt(ctx, 'FUEL', ENG.fuel[0], ENG.fuel[1] + 60, 18, '#9aa3ab');
  // CCTV monitor
  rr(ctx, 2140, 280, 230, 160, 8, '#16181c'); ctx.save(); ctx.beginPath(); ctx.rect(2152, 292, 206, 136); ctx.clip(); (o.cctv || cctvStatic)(ctx, t, 2152, 292, 206, 136); ctx.restore(); txt(ctx, 'CAM 01 - BRIDGE', 2255, 455, 16, '#9aa3ab');
  // VHF set + stove corner + tally on a pipe
  rr(ctx, 2420, 470, 90, 60, 6, '#f0c020'); if (o.stove) { rr(ctx, 3100, 830, 160, 60, 6, '#3a3d44'); glow(ctx, 3180, 820, 70, 'rgba(90,140,255,0.6)'); }
  if (o.tally) { rr(ctx, 2700, 380, 50, 260, 6, '#7a848c'); for (let i = 0; i < o.tally; i++) line(ctx, [[2708 + (i % 5) * 8, 400 + Math.floor(i / 5) * 40], [2708 + (i % 5) * 8, 430 + Math.floor(i / 5) * 40]], 3, '#e8e2d0'); }
  // tunnel exit hatch high on the left wall
  rect(ctx, 1240, 180, 140, 120, o.hatchOpen ? '#08090c' : '#5a646c');
}
function cctvStatic(ctx, t, x, y, w, h) { for (let i = 0; i < 180; i++) { ctx.fillStyle = hash(i + Math.floor(t * 24) * 7) > 0.5 ? '#bbb' : '#333'; ctx.fillRect(x + hash(i * 3 + Math.floor(t * 24)) * w, y + hash(i * 5 + Math.floor(t * 24)) * h, 10, 4); } }
// the bridge on CCTV: dark wheelhouse, a figure in a captain's coat at the wheel (back to camera), head turn 0..1
function cctvBridge(ctx, t, x, y, w, h, o = {}) {
  ctx.fillStyle = '#0c1410'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#16241c'; ctx.fillRect(x, y + h * 0.15, w, h * 0.35); for (let i = 0; i < 4; i++) ctx.fillRect(x + 10 + i * (w / 4), y + h * 0.17, w / 4 - 14, h * 0.3);
  ctx.fillStyle = '#1e3a2a'; ctx.fillRect(x, y + h * 0.7, w, h * 0.3); ctx.fillStyle = '#9ff0c0'; for (let i = 0; i < 6; i++) ctx.fillRect(x + 20 + i * 30, y + h * 0.74, 8, 4);
  // figure
  const fx = x + w * 0.52, fy = y + h * 0.95, k = h / 136, turn = o.turn || 0;
  ctx.fillStyle = '#05080a'; ctx.beginPath(); ctx.moveTo(fx - 26 * k, fy); ctx.lineTo(fx - 22 * k, fy - 62 * k); ctx.quadraticCurveTo(fx, fy - 72 * k, fx + 22 * k, fy - 62 * k); ctx.lineTo(fx + 26 * k, fy); ctx.fill();
  ctx.beginPath(); ctx.arc(fx + turn * 6 * k, fy - 80 * k, 13 * k, 0, 7); ctx.fill(); ctx.fillRect(fx - 16 * k, fy - 94 * k, 32 * k, 6 * k); ctx.fillStyle = '#c9b060'; ctx.fillRect(fx - 10 * k, fy - 93 * k, 20 * k, 2 * k);   // cap badge
  ctx.fillStyle = '#e9e4dc'; ctx.fillRect(fx + 18 * k, fy - 46 * k, 9 * k, 9 * k);   // bandaged hand on the wheel
  ctx.strokeStyle = '#0a0e10'; ctx.lineWidth = 3 * k; ctx.beginPath(); ctx.arc(fx + 20 * k, fy - 42 * k, 16 * k, 0, 7); ctx.stroke();
  if (turn > 0.3) { ctx.fillStyle = `rgba(230,230,220,${(turn - 0.3) * 1.2})`; ctx.fillRect(fx + 8 * k, fy - 84 * k, 4 * k, 3 * k); }   // a glint as the face starts to turn
  ctx.fillStyle = 'rgba(160,255,190,0.06)'; for (let i = 0; i < h; i += 3) ctx.fillRect(x, y + i, w, 1); txt(ctx, 'REC', x + w - 34, y + 12, 12 * k, '#ff4b3a'); ctx.fillStyle = '#ff4b3a'; ctx.beginPath(); ctx.arc(x + w - 14, y + 8, 4 * k, 0, 7); ctx.fill();
}
module.exports = { FLOOR, rect, rr, txt, darkness, tint, sky, sea, liner, lighthouse, poolDeck, corridor, corridorLight, lobby, lifeboats, GAL, galley, crewMess, pov, ENG, engineRoom, cctvStatic, cctvBridge };
