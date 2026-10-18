// Pilot "Zombie Outbreak: 30 Days Trapped on a Cruise Ship" - scenes. Each draw(ctx, t) gets global time t.
const L = require('./lib');
const { clamp, lerp, ease, hash, fillR, stroke, circle, hero, zombie, tape, pill, stat, cross, check } = L;
const TL = require('./timeline.json');
const W = 1920, H = 1080;

// time of the first word in line `id` matching `re` (or line start)
function at(id, re) {
  const Ln = TL.lines.find(l => l.id === id); if (!re) return Ln.t0;
  const w = Ln.words.find(w => re.test(w.w)); return w ? w.t0 : Ln.t0;
}
const sc = id => TL.scenes.find(s => s.id === id);
const pop = (t, t0, d = 0.35) => clamp((t - t0) / d);
const blink = t => (t % 3.7) < 0.12;
function cam(ctx, t, s, z0 = 1, z1 = 1.08, cx = W / 2, cy = H / 2) {
  const u = clamp((t - s.t0) / (s.t1 - s.t0)), z = lerp(z0, z1, ease.inOut(u));
  ctx.translate(cx, cy); ctx.scale(z, z); ctx.translate(-cx, -cy);
}
function shake(ctx, t, amp) { if (amp > 0) ctx.translate((hash(Math.floor(t * 30)) - 0.5) * amp, (hash(Math.floor(t * 30) + 7) - 0.5) * amp); }

// ---- shared props ----------------------------------------------------------
function cruiseShip(ctx, x, y, s, t) {
  ctx.save(); ctx.translate(x, y + Math.sin(t * 0.9) * 4); ctx.rotate(Math.sin(t * 0.7) * 0.006); ctx.scale(s, s);
  // funnel
  ctx.fillStyle = '#c8473b'; ctx.beginPath(); ctx.moveTo(150, -330); ctx.lineTo(260, -330); ctx.lineTo(250, -230); ctx.lineTo(140, -230); ctx.fill();
  ctx.fillStyle = '#1d1f26'; ctx.fillRect(147, -345, 116, 30);
  // superstructure tiers
  const tiers = [[-430, 380, -230], [-470, 470, -170], [-520, 560, -110]];
  for (const [a, b, yy] of tiers) { fillR(ctx, a, yy, b - a, 64, 10, '#f3efe6'); ctx.fillStyle = '#d9d3c4'; ctx.fillRect(a, yy + 50, b - a, 14);
    for (let wx = a + 26; wx < b - 20; wx += 34) fillR(ctx, wx, yy + 18, 20, 18, 4, (hash(wx + yy) > 0.75) ? '#ffd27a' : '#3b4a63'); }
  // bridge windows
  ctx.fillStyle = '#26314a'; ctx.fillRect(300, -222, 70, 22);
  // hull
  ctx.beginPath(); ctx.moveTo(-640, -50); ctx.lineTo(720, -50); ctx.lineTo(620, 90); ctx.lineTo(-600, 90); ctx.closePath(); ctx.fillStyle = '#f7f4ec'; ctx.fill();
  ctx.save(); ctx.clip(); ctx.fillStyle = '#1f2b44'; ctx.fillRect(-700, 40, 1500, 60); ctx.fillStyle = '#c8473b'; ctx.fillRect(-700, 32, 1500, 9);
  for (let wx = -590; wx < 640; wx += 30) circle(ctx, wx, -16, 7, '#3b4a63');
  ctx.restore();
  ctx.restore();
}
function sea(ctx, y0, t, top = '#1f4f5f', bot = '#0f2832') {
  const g = ctx.createLinearGradient(0, y0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bot); ctx.fillStyle = g; ctx.fillRect(0, y0, W, H - y0);
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let i = 0; i < 26; i++) { const yy = y0 + 20 + (i * 37) % (H - y0), xx = ((hash(i) * W + t * (20 + i * 3)) % (W + 300)) - 150, w = 60 + hash(i + 3) * 120;
    ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx + w, yy); ctx.stroke(); }
}
function kitchen(ctx, t, dark = 0) {
  // tiled steel wall
  ctx.fillStyle = '#5d6b78'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 3;
  for (let y = 0; y < 760; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 760); ctx.stroke(); }
  // shelves with cans and water
  for (const [sx, sy] of [[90, 210], [90, 380], [620, 210], [620, 380]]) {
    ctx.fillStyle = '#9aa6b1'; ctx.fillRect(sx, sy, 440, 16); ctx.fillStyle = '#7d8892'; ctx.fillRect(sx, sy + 16, 440, 6);
    for (let i = 0; i < 9; i++) { const water = sx > 500 && sy > 300; const cx = sx + 20 + i * 47, rat = (dark > 0.5 ? Math.sin(t * 40 + i) * dark * 2 : 0);
      if (water) { fillR(ctx, cx, sy - 92 + rat, 38, 92, 8, '#6fb4d8'); fillR(ctx, cx + 12, sy - 104 + rat, 14, 14, 3, '#2f6f96'); }
      else { const c = ['#c8473b', '#e0a530', '#4f9d69', '#d9d3c4'][i % 4]; fillR(ctx, cx, sy - 62 + rat, 38, 62, 5, c); ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.fillRect(cx, sy - 44 + rat, 38, 18); } }
  }
  // steel door (right)
  fillR(ctx, 1380, 150, 380, 610, 14, '#7f8c97'); fillR(ctx, 1400, 170, 340, 590, 10, '#97a3ad');
  circle(ctx, 1570, 330, 70, '#5d6b78'); circle(ctx, 1570, 330, 56, '#1c2836'); ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.arc(1570, 330, 56, 3.6, 4.6); ctx.lineTo(1570, 330); ctx.fill();
  fillR(ctx, 1420, 470, 26, 90, 8, '#4a5560');
  for (const [rx, ry] of [[1415, 185], [1725, 185], [1415, 740], [1725, 740]]) circle(ctx, rx, ry, 7, '#5d6b78');
  // floor
  ctx.fillStyle = '#3d4650'; ctx.fillRect(0, 760, W, H - 760);
  ctx.strokeStyle = 'rgba(255,255,255,0.05)'; for (let x = -400; x < W + 400; x += 120) { ctx.beginPath(); ctx.moveTo(x, 760); ctx.lineTo(x + (x - W / 2) * 0.6, H); ctx.stroke(); }
  // counter (left)
  fillR(ctx, 40, 600, 700, 40, 6, '#c9d1d8'); fillR(ctx, 60, 640, 660, 140, 4, '#a7b1ba');
  ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(80, 660, 300, 8);
  // pots
  fillR(ctx, 120, 540, 120, 60, 10, '#808b95'); fillR(ctx, 300, 556, 90, 44, 8, '#6f7a84');
  // hanging lamp
}
function lamp(ctx, x, t, swing, on = 1) {
  const a = Math.sin(t * 2.2) * swing; ctx.save(); ctx.translate(x, 0); ctx.rotate(a);
  stroke(ctx, [[0, 0], [0, 120]], 5, '#222'); ctx.fillStyle = '#2b3138'; ctx.beginPath(); ctx.moveTo(-60, 170); ctx.lineTo(60, 170); ctx.lineTo(24, 120); ctx.lineTo(-24, 120); ctx.fill();
  if (on > 0) { ctx.globalAlpha = 0.16 * on; ctx.fillStyle = '#ffe2a0'; ctx.beginPath(); ctx.moveTo(-60, 170); ctx.lineTo(60, 170); ctx.lineTo(330, 900); ctx.lineTo(-330, 900); ctx.fill(); ctx.globalAlpha = 1; circle(ctx, 0, 172, 16, '#ffe6ad'); }
  ctx.restore();
}
function cart(ctx, x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  fillR(ctx, -130, -200, 260, 20, 4, '#b9c3cc'); fillR(ctx, -130, -90, 260, 20, 4, '#b9c3cc');
  for (const k of [-1, 1]) stroke(ctx, [[k * 120, -200], [k * 120, -30]], 12, '#8a959f');
  stroke(ctx, [[-120, -200], [-160, -250]], 12, '#8a959f');
  fillR(ctx, -100, -150, 70, 60, 6, '#e0a530'); fillR(ctx, -20, -140, 60, 50, 6, '#c8473b'); fillR(ctx, 50, -160, 60, 70, 6, '#6fb4d8');
  for (const k of [-1, 1]) circle(ctx, k * 105, -16, 16, '#1d1f26');
  ctx.restore();
}

// ---- scenes ----------------------------------------------------------------
const S = {};
S.open = { draw(ctx, t) {
  const s = sc('open'); ctx.save(); cam(ctx, t, s, 1, 1.1, 960, 520);
  const g = ctx.createLinearGradient(0, 0, 0, 640); g.addColorStop(0, '#2c2f4a'); g.addColorStop(0.55, '#c9604e'); g.addColorStop(1, '#f2a65e'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 640);
  circle(ctx, 1450, 600, 110, '#ffd08a');
  ctx.fillStyle = 'rgba(255,255,255,0.08)'; for (let i = 0; i < 5; i++) { const cx = (i * 430 + t * 12) % (W + 400) - 200; ctx.beginPath(); ctx.ellipse(cx, 160 + i * 50, 170, 22, 0, 0, 7); ctx.fill(); }
  sea(ctx, 620, t, '#2a5566', '#0e2530');
  ctx.fillStyle = 'rgba(255,208,138,0.25)'; ctx.fillRect(1400, 630, 100, 400);
  cruiseShip(ctx, 1010 + t * 12, 700, 0.82, t);
  ctx.restore();
  tape(ctx, 250, 140, 'DAY 1', '07:40 · AT SEA', pop(t, at('l01', /Day/)));
  // "you" portrait
  const up = pop(t, at('l01', /waiter/i), 0.4);
  if (up > 0) { ctx.save(); ctx.translate(1660, 250); const k = ease.back(up) * 0.8; ctx.scale(k, k);
    circle(ctx, 0, 0, 175, '#1c1e24'); circle(ctx, 0, 0, 165, '#3c4b5e'); ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 165, 0, 7); ctx.clip();
    hero(ctx, 0, 470, 1.15, { blink: blink(t), look: -0.4 }); ctx.restore(); ctx.restore();
    pill(ctx, 1660, 420, 'YOU · WAITER', '#e0a530', up); }
  stat(ctx, 330, 470, '3,000', 'PASSENGERS', pop(t, at('l01', /Three/)));
  stat(ctx, 330, 690, '7', 'DAYS AT SEA', pop(t, at('l01', /Seven/)));
} };

S.alert = { draw(ctx, t) {
  const s = sc('alert'), t3 = at('l03'), u3 = clamp((t - t3 + 0.25) / 0.3);
  // dining room backdrop
  ctx.fillStyle = '#3a2f36'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#4a3b42'; for (let x = 60; x < W; x += 260) fillR(ctx, x, 120, 150, 360, 70, '#4d3e46');
  ctx.fillStyle = '#2b2328'; ctx.fillRect(0, 700, W, 380);
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.ellipse(200 + i * 380, 760, 150, 40, 0, 0, 7); ctx.fillStyle = '#d9d3c4'; ctx.fill(); ctx.fillStyle = '#b9b2a2'; ctx.fillRect(60 + i * 380, 760, 280, 120); }
  ctx.fillStyle = 'rgba(10,8,12,0.45)'; ctx.fillRect(0, 0, W, H);
  if (u3 < 1) {
    ctx.save(); ctx.globalAlpha = 1 - u3; cam(ctx, t, { t0: s.t0, t1: t3 }, 1, 1.06);
    const tb = at('l02', /buzzes/), bz = t > tb && t < tb + 1.4; if (bz) shake(ctx, t, 18);
    // hand + phone
    ctx.save(); ctx.translate(960, 560); ctx.rotate(-0.06);
    fillR(ctx, -60, 260, 120, 400, 40, '#e0a530'); fillR(ctx, -95, 120, 190, 220, 70, '#f2c9a0');
    fillR(ctx, -190, -380, 380, 720, 44, '#16181d'); fillR(ctx, -172, -360, 344, 684, 32, '#c93a32');
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
    ctx.beginPath(); ctx.moveTo(0, -290); ctx.lineTo(62, -180); ctx.lineTo(-62, -180); ctx.closePath(); ctx.lineWidth = 12; ctx.strokeStyle = '#fff'; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.font = '900 70px Nunito'; ctx.fillText('!', 0, -195);
    ctx.font = '900 30px Nunito'; ctx.fillText('EMERGENCY ALERT', 0, -110);
    ctx.font = '74px Anton'; ctx.fillText('STAY IN', 0, 10); ctx.fillText('YOUR', 0, 95); ctx.fillText('CABINS', 0, 180);
    fillR(ctx, -140, 230, 280, 56, 28, 'rgba(255,255,255,0.2)'); ctx.font = '800 24px Nunito'; ctx.fillText('Do not use the stairs', 0, 266);
    // thumb
    fillR(ctx, -205, 40, 70, 150, 34, '#f2c9a0');
    ctx.restore();
    if (bz) { ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 8; ctx.lineCap = 'round'; for (const k of [-1, 1]) for (let j = 0; j < 3; j++) { ctx.beginPath(); ctx.moveTo(960 + k * (250 + j * 34), 360 + j * 40); ctx.lineTo(960 + k * (250 + j * 34), 440 + j * 40); ctx.stroke(); } }
    ctx.restore();
  }
  if (u3 > 0) {
    ctx.save(); ctx.globalAlpha = u3; cam(ctx, t, { t0: t3, t1: s.t1 }, 1.0, 1.12, 960, 300);
    ctx.fillStyle = '#20232b'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#2a2e38'; ctx.fillRect(0, 0, W, 220);
    // ceiling speaker
    circle(ctx, 960, 220, 150, '#3b404c'); circle(ctx, 960, 220, 120, '#545a68'); ctx.fillStyle = '#2a2e38';
    for (let i = -4; i <= 4; i++) for (let j = 0; j < 5; j++) circle(ctx, 960 + i * 24, 140 + j * 24 + 30, 6, '#2a2e38');
    const cut = at('l03', /mid/); const talking = t < at('l03', /stops/) + 0.2;
    if (talking) { ctx.strokeStyle = '#e8e3d6'; ctx.lineWidth = 10; ctx.lineCap = 'round'; for (let j = 0; j < 3; j++) { const r = 190 + j * 50 + ((t * 120) % 50); ctx.globalAlpha = u3 * (1 - j / 3); for (const k of [-1, 1]) { ctx.beginPath(); ctx.arc(960, 220, r, k > 0 ? -0.5 : Math.PI - 0.5 + 1, k > 0 ? 0.5 : Math.PI + 0.5 + 0); ctx.stroke(); } } ctx.globalAlpha = u3; }
    // captain bubble
    const full = '"Ladies and gentlemen, please remain calm. The situation on Deck Five is—"';
    const n = Math.floor(clamp((t - t3) / Math.max(0.5, (at('l03', /stops/) + 0.2 - t3))) * full.length);
    fillR(ctx, 360, 470, 1200, 200, 28, '#efe6cf'); ctx.fillStyle = '#efe6cf'; ctx.beginPath(); ctx.moveTo(900, 470); ctx.lineTo(960, 400); ctx.lineTo(1000, 470); ctx.fill();
    ctx.fillStyle = '#1e2026'; ctx.font = '800 44px Nunito'; ctx.textAlign = 'left';
    const txt = full.slice(0, n); const words = txt.split(' '); let line = '', y = 545;
    for (const w of words) { if (ctx.measureText(line + w).width > 1100) { ctx.fillText(line, 410, y); line = ''; y += 60; } line += w + ' '; } ctx.fillText(line, 410, y);
    pill(ctx, 960, 760, 'CAPTAIN · LIVE', '#c93a32', pop(t, t3), '#fff');
    if (t > cut) { cross(ctx, 1560, 470, 46, pop(t, cut)); }
    ctx.restore();
  }
} };

S.deck = { draw(ctx, t) {
  const s = sc('deck'), lt = t - s.t0; ctx.save(); cam(ctx, t, s, 1, 1.1, 900, 470);
  const vx = 900, vy = 450, fl = (hash(Math.floor(t * 12)) > 0.93) ? 0.55 : 1;
  ctx.fillStyle = '#3c4152'; ctx.fillRect(0, 0, W, H);
  // ceiling, floor, walls (one-point perspective)
  const poly = (pts, c) => { ctx.beginPath(); ctx.moveTo(...pts[0]); pts.slice(1).forEach(p => ctx.lineTo(...p)); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); };
  const bx = 160, by = 95, bw = 160, bh = 190; // back wall rect around vanishing point
  poly([[0, 0], [W, 0], [vx + bw, vy - by - 60], [vx - bw, vy - by - 60]], '#e6dfcf');
  poly([[0, H], [W, H], [vx + bw, vy + bh], [vx - bw, vy + bh]], '#8d2f36');
  poly([[0, 0], [vx - bw, vy - by - 60], [vx - bw, vy + bh], [0, H]], '#d8cdb5');
  poly([[W, 0], [vx + bw, vy - by - 60], [vx + bw, vy + bh], [W, H]], '#cfc3a9');
  ctx.fillStyle = '#2a2420'; ctx.fillRect(vx - bw, vy - by - 60, bw * 2, by + 60 + bh);
  // carpet pattern
  ctx.strokeStyle = 'rgba(240,190,120,0.25)'; ctx.lineWidth = 4;
  for (let i = 1; i < 9; i++) { const u = Math.pow(i / 9, 1.8), y = lerp(vy + bh, H, u), hw = lerp(bw, W / 2 + 200, u); ctx.beginPath(); ctx.moveTo(vx - hw, y); ctx.lineTo(vx + hw, y); ctx.stroke(); }
  // doors both sides
  for (let i = 0; i < 5; i++) { const u0 = Math.pow((i + 0.2) / 5.2, 1.6), u1 = Math.pow((i + 0.65) / 5.2, 1.6);
    for (const k of [-1, 1]) { const x0 = lerp(vx + k * bw, k > 0 ? W : 0, u0), x1 = lerp(vx + k * bw, k > 0 ? W : 0, u1);
      const t0 = lerp(vy - by + 10, 0 + 120, u0), t1 = lerp(vy - by + 10, 120, u1), b0 = lerp(vy + bh, H, u0), b1 = lerp(vy + bh, H, u1);
      poly([[x0, t0], [x1, t1], [x1, b1], [x0, b0]], '#7b5a40'); ctx.fillStyle = '#e0a530'; circle(ctx, x1 - k * (x1 - x0) * 0.15 * -1 + (x0 - x1) * 0.15, lerp(t1, b1, 0.55), Math.max(3, (x1 - x0) * 0.05 * k), '#e0b45a'); } }
  // ceiling lights
  for (let i = 0; i < 5; i++) { const u = Math.pow((i + 0.4) / 5.2, 1.6), y = lerp(vy - by - 60, 0, u) + 30 * u, w = lerp(30, 220, u); fillR(ctx, vx - w / 2, y, w, 10 + 20 * u, 6, fl < 1 && i % 2 ? '#8a8576' : '#fff4d0'); }
  // zombies coming from the back
  const prog = clamp(lt / (s.t1 - s.t0));
  for (let i = 0; i < 5; i++) { const d = 1 - (0.15 + prog * 0.35) - i * 0.07, sc2 = lerp(0.95, 0.12, Math.pow(d, 1.1)), fy = lerp(H + 40, vy + bh, Math.pow(d, 1.1));
    zombie(ctx, vx + (i - 2) * 60 * sc2 * 2.2, fy, sc2, i + 1, { walk: t * 3 + i, t, dir: i % 2 ? 1 : -1 }); }
  ctx.fillStyle = `rgba(0,0,0,${1 - fl})`; ctx.fillRect(0, 0, W, H);
  ctx.restore();
  // hero foreground right, scared at "coming"
  const sc3 = t > at('l04', /coming/);
  ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.0)'; hero(ctx, 1640, 1230, 1.7, { dir: -1, look: -1, scared: sc3, sweat: sc3, blink: !sc3 && blink(t), arms: sc3 ? 'scared' : 'down' }); ctx.restore();
  pill(ctx, 300, 120, 'DECK 5', '#efe6cf', pop(t, s.t0 + 0.2));
} };

S.map = { draw(ctx, t) {
  const s = sc('map'); ctx.save(); cam(ctx, t, s, 1, 1.06);
  ctx.fillStyle = '#16304a'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 2; for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  // ship outline (top view)
  const ship = () => { ctx.beginPath(); ctx.moveTo(260, 330); ctx.lineTo(1450, 330); ctx.quadraticCurveTo(1760, 340, 1800, 540); ctx.quadraticCurveTo(1760, 740, 1450, 750); ctx.lineTo(260, 750); ctx.quadraticCurveTo(200, 750, 200, 690); ctx.lineTo(200, 390); ctx.quadraticCurveTo(200, 330, 260, 330); ctx.closePath(); };
  ship(); ctx.fillStyle = '#e8e3d6'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = '#1e2026'; ctx.stroke();
  ctx.save(); ship(); ctx.clip();
  ctx.fillStyle = '#d4cdbd'; for (let x = 300; x < 1500; x += 200) ctx.fillRect(x, 360, 160, 140), ctx.fillRect(x, 580, 160, 140);
  ctx.fillStyle = '#6fb4d8'; fillR(ctx, 900, 470, 240, 140, 30, '#6fb4d8');
  ctx.restore();
  // lifeboats
  const lb = []; for (let i = 0; i < 6; i++) lb.push([420 + i * 180, 300], [420 + i * 180, 780]);
  for (const [x, y] of lb) fillR(ctx, x - 55, y - 20, 110, 40, 20, '#e8792f');
  // crowd running to lifeboats
  const t1 = at('l05'), rush = clamp((t - t1 + 0.6) / 4);
  for (let i = 0; i < 70; i++) { const [tx, ty] = lb[i % lb.length], sx = 350 + hash(i) * 1200, sy = 400 + hash(i + 50) * 280;
    const u = ease.inOut(clamp(rush * (0.7 + hash(i + 9) * 0.6))); circle(ctx, lerp(sx, tx + (hash(i + 2) - 0.5) * 90, u), lerp(sy, ty + (hash(i + 4) - 0.5) * 30, u), 11, '#2f3a4c'); }
  pill(ctx, 960, 230, 'LIFEBOATS', '#e8792f', pop(t, at('l05', /lifeboats/)), '#fff');
  const tx = at('l05', /Don't/); cross(ctx, 700, 230, 44, pop(t, tx)); cross(ctx, 1220, 230, 44, pop(t, tx + 0.15));
  // your path down to the galley
  const t6 = at('l06'), gal = at('l06', /galley/i);
  const path = [[1300, 540], [1300, 650], [520, 650], [430, 600]], pu = clamp((t - t6) / Math.max(0.5, gal - t6));
  if (t > t6) { ctx.setLineDash([18, 16]); ctx.lineDashOffset = -t * 40; ctx.lineWidth = 8; ctx.strokeStyle = '#e0a530'; ctx.beginPath(); ctx.moveTo(...path[0]);
    let tot = 0; const segs = []; for (let i = 1; i < path.length; i++) { const d = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]); segs.push(d); tot += d; }
    let left = tot * pu; let px = path[0][0], py = path[0][1];
    for (let i = 1; i < path.length && left > 0; i++) { const f = Math.min(1, left / segs[i - 1]); px = lerp(path[i - 1][0], path[i][0], f); py = lerp(path[i - 1][1], path[i][1], f); ctx.lineTo(px, py); left -= segs[i - 1]; }
    ctx.stroke(); ctx.setLineDash([]);
    circle(ctx, px, py, 22, '#1e2026'); circle(ctx, px, py, 16, '#e0a530'); }
  else { circle(ctx, 1300, 540, 22, '#1e2026'); circle(ctx, 1300, 540, 16, '#e0a530'); }
  pill(ctx, 1300, 470, 'YOU', '#e0a530', pop(t, s.t0 + 0.3), '#1e2026', 28);
  const gu = pop(t, gal); if (gu > 0) { ctx.save(); ctx.globalAlpha = gu; fillR(ctx, 300, 560, 260, 130, 14, 'rgba(63,174,99,0.35)'); ctx.restore(); pill(ctx, 430, 520, 'GALLEY · DECK 1', '#3fae63', gu, '#fff', 30); check(ctx, 600, 620, 34, pop(t, gal + 0.2)); }
  pill(ctx, 1500, 130, 'NOBODY THINKS ABOUT IT', '#efe6cf', pop(t, at('l06', /nobody/i)), '#1e2026', 30);
  ctx.restore();
  tape(ctx, 230, 120, 'RULE #1', null, pop(t, at('l05', /Rule/)));
} };

S.galley = { draw(ctx, t) {
  const s = sc('galley'); ctx.save(); cam(ctx, t, s, 1.04, 1.1, 900, 500);
  kitchen(ctx, t); lamp(ctx, 900, t, 0.03);
  hero(ctx, 1000, 900, 1.25, { dir: 1, look: Math.sin(t * 0.8) * 0.8, blink: blink(t) });
  // door highlight
  const du = pop(t, at('l07', /steel/)); if (du > 0) { ctx.save(); ctx.globalAlpha = 0.5 + 0.3 * Math.sin(t * 6); ctx.lineWidth = 12; ctx.strokeStyle = '#ff5a4f'; ctx.strokeRect(1372, 142, 396, 626); ctx.restore(); }
  ctx.restore();
  stat(ctx, 330, 160, '21', 'DAYS OF FOOD', pop(t, at('l07', /Food/)));
  stat(ctx, 720, 160, '9', 'DAYS OF WATER', pop(t, at('l07', /Water/)), '#d6ecf6');
  pill(ctx, 1570, 860, '1 STEEL DOOR', '#ff5a4f', pop(t, at('l07', /steel/)), '#fff');
} };

S.door = { draw(ctx, t) {
  const s = sc('door'), t9 = at('l09'), tw = at('l09', /wait/);
  const bang = [tw + 0.9, tw + 1.6, tw + 2.0].find(b => t > b && t < b + 0.35);
  ctx.save(); cam(ctx, t, s, 1.1, 1.22, 1300, 520); if (bang) shake(ctx, t, 26);
  kitchen(ctx, t); lamp(ctx, 1150, t, bang ? 0.12 : 0.03);
  // cart pushed to the door during l09
  const cu = ease.inOut(clamp((t - t9 - 0.3) / Math.max(0.6, tw - t9 - 0.3)));
  const cx = lerp(820, 1260, cu);
  cart(ctx, cx, 900, 1.25);
  const pushing = t > t9;
  hero(ctx, pushing ? cx - 260 : 1000, 900, 1.25, { dir: 1, walk: pushing && cu < 1 ? t * 7 : null, arms: pushing ? (cu < 1 ? 'push' : (t > tw + 0.9 ? 'scared' : 'push')) : (t > at('l08', /quiet/) ? 'shush' : 'down'),
    shush: !pushing && t > at('l08', /quiet/), scared: t > tw + 0.9, sweat: t > tw + 0.9, blink: blink(t), look: pushing ? 1 : 0.4 });
  if (bang) { ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 10; ctx.lineCap = 'round'; for (let i = 0; i < 6; i++) { const a = -1.2 + i * 0.5; ctx.beginPath(); ctx.moveTo(1570 + Math.cos(a) * 240, 420 + Math.sin(a) * 300); ctx.lineTo(1570 + Math.cos(a) * 300, 420 + Math.sin(a) * 370); ctx.stroke(); } ctx.restore(); }
  ctx.restore();
  tape(ctx, 230, 120, 'RULE #2', null, pop(t, at('l08', /Rule/)));
  // "be quiet" icon: speaker with a cross
  const qu = pop(t, at('l08', /quiet/));
  if (qu > 0 && t < t9 + 0.3) { pill(ctx, 960, 200, 'BE QUIET', '#efe6cf', qu); }
  const fu = pop(t, at('l08', /follow/)); if (fu > 0 && t < t9 + 0.3) pill(ctx, 960, 300, 'THEY FOLLOW SOUND', '#ff5a4f', fu, '#fff', 30);
  if (bang) pill(ctx, 1500, 160, 'BANG!', '#ff5a4f', 1, '#fff', 60);
} };

S.end = { draw(ctx, t) {
  const s = sc('end'), te = at('l10', /engines/), eng = clamp((t - te) / 0.6), t11 = at('l11');
  ctx.save(); cam(ctx, t, s, 1.0, 1.25, 1000, 520); shake(ctx, t, eng * 7 * (0.6 + 0.4 * Math.sin(t * 30)));
  kitchen(ctx, t, eng);
  // porthole moonlight
  ctx.save(); ctx.beginPath(); ctx.arc(1570, 330, 56, 0, 7); ctx.clip(); ctx.fillStyle = '#0d1a2e'; ctx.fillRect(1500, 260, 140, 140); circle(ctx, 1590, 305, 14, '#f3efd8'); ctx.fillStyle = '#1b3550'; ctx.fillRect(1500, 345, 140, 60); ctx.restore();
  lamp(ctx, 900, t, 0.02 + eng * 0.1, 0);
  hero(ctx, 1000, 900, 1.25, { dir: 1, look: eng > 0 ? -0.3 : 0.2, scared: eng > 0, sweat: t > t11, blink: !eng && blink(t) });
  ctx.restore();
  // night tint + red emergency light once engines start
  ctx.fillStyle = 'rgba(8,14,32,0.55)'; ctx.fillRect(0, 0, W, H);
  if (eng > 0) { ctx.fillStyle = `rgba(200,40,40,${0.18 * eng * (0.6 + 0.4 * Math.sin(t * 5))})`; ctx.fillRect(0, 0, W, H); }
  tape(ctx, 250, 140, 'DAY 12', '| | | |   | | | |   | | | |', pop(t, at('l10', /Day/)));
  if (eng > 0) pill(ctx, 960, 200, 'ENGINES: ON', '#ff5a4f', eng, '#fff', 40);
  // end card
  const ec = clamp((t - (TL.lines[TL.lines.length - 1].t1 + 0.4)) / 0.4);
  if (ec > 0) { ctx.fillStyle = `rgba(10,10,14,${0.9 * ec})`; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.globalAlpha = ec; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = '120px Anton'; ctx.fillText('TO BE CONTINUED', W / 2, 520);
    ctx.font = '900 40px Nunito'; ctx.fillStyle = '#e0a530'; ctx.fillText('DAY 12 OF 30', W / 2, 610); ctx.restore(); }
} };

module.exports = S;
