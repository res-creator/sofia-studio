// Full pilot: shared timing, camera, light and set helpers for the new scenes (screen space 1920x1080).
const L = require('./lib'), P = require('./scenes_pilot');
const { createCanvas } = require('@napi-rs/canvas');
const { clamp, lerp, ease, hash, fillR, stroke, circle, OL } = L;
const TL = require('./timeline.json'), W = 1920, H = 1080;
const at = (id, re) => { const l = TL.lines.find(l => l.id === id); if (!re) return l.t0; const w = l.words.find(w => re.test(w.w)); return w ? w.t0 : l.t0; };
const end = id => TL.lines.find(l => l.id === id).t1;
const sc = id => TL.scenes.find(s => s.id === id);
const pop = (t, t0, d = 0.35) => clamp((t - t0) / d);
const blink = (t, k = 0) => ((t + k) % 3.7) < 0.12;
const win = (t, a, b) => t >= a && t < b;
const sm = u => ease.inOut(clamp(u));
// camera: keys [t, x, y, z, mode ('cut' | 'm' smooth over dur | 's' snap 0.2 s), dur]; (x, y) is centred on screen at zoom z
function shot(ctx, t, keys) {
  let cur = keys[0].slice(1, 4);
  for (let i = 1; i < keys.length; i++) { const k = keys[i]; if (t < k[0]) break;
    const d = k[4] === 'm' ? (k[5] || 1) : k[4] === 's' ? 0.2 : 0, u = d ? sm((t - k[0]) / d) : 1, prev = cur.slice();
    cur = [lerp(prev[0], k[1], u), lerp(prev[1], k[2], u), lerp(prev[2], k[3], u)]; }
  if (cur[2] >= 1 && !keys.free) { const hw = W / 2 / cur[2], hh = H / 2 / cur[2]; cur[0] = clamp(cur[0], hw, W - hw); cur[1] = clamp(cur[1], hh, H - hh); }   // never show past the set
  ctx.translate(W / 2, H / 2); ctx.scale(cur[2], cur[2]); ctx.translate(-cur[0], -cur[1]);
}
const shake = (ctx, t, a) => { if (a > 0) ctx.translate((hash(Math.floor(t * 30)) - 0.5) * a, (hash(Math.floor(t * 30) + 7) - 0.5) * a); };
// darkness overlay with light holes (in the current transform): lights [{x,y,r,a}] or {cone:[x,y,ang,spread,len], a}
let LAYER = null;
function dark(ctx, alpha, lights = [], col = '6,9,18') {
  LAYER = LAYER || createCanvas(W, H); const l = LAYER.getContext('2d'), m = ctx.getTransform();
  l.setTransform(1, 0, 0, 1, 0, 0); l.globalCompositeOperation = 'source-over'; l.clearRect(0, 0, W, H); l.fillStyle = `rgba(${col},${alpha})`; l.fillRect(0, 0, W, H);
  l.setTransform(m); l.globalCompositeOperation = 'destination-out';
  for (const Lt of lights) {
    if (Lt.cone) { const [x, y, a, sp, len] = Lt.cone, g = l.createRadialGradient(x, y, 0, x, y, len); g.addColorStop(0, `rgba(0,0,0,${Lt.a ?? 1})`); g.addColorStop(1, 'rgba(0,0,0,0)'); l.fillStyle = g;
      l.beginPath(); l.moveTo(x, y); l.lineTo(x + Math.cos(a - sp) * len, y + Math.sin(a - sp) * len); l.lineTo(x + Math.cos(a + sp) * len, y + Math.sin(a + sp) * len); l.closePath(); l.fill(); }
    else { const g = l.createRadialGradient(Lt.x, Lt.y, 0, Lt.x, Lt.y, Lt.r); g.addColorStop(0, `rgba(0,0,0,${Lt.a ?? 1})`); g.addColorStop(1, 'rgba(0,0,0,0)'); l.fillStyle = g; l.fillRect(Lt.x - Lt.r, Lt.y - Lt.r, Lt.r * 2, Lt.r * 2); }
  }
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(LAYER, 0, 0); ctx.restore();
}
const tint = (ctx, col) => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); ctx.restore(); };
const glow = (ctx, x, y, r, col) => { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); };
// "DAY n" tape top-left with tally marks, like the pilot
function day(ctx, t, t0, n, sub) { const u = pop(t, t0); if (u <= 0) return; const marks = n ? Array.from({ length: Math.ceil(n / 5) }, (_, i) => '|'.repeat(Math.min(5, n - i * 5))).join('  ') : null; L.tape(ctx, 250, 140, typeof n === 'number' ? 'DAY ' + n : n, sub || marks, u); }
function fade(ctx, a) { if (a <= 0) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = `rgba(0,0,0,${clamp(a)})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
// sound burst lines around a point (BANG / ring / roar)
function burst(ctx, x, y, r, n = 6, col = '#fff', w = 10) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (i - (n - 1) / 2) * 0.42; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); ctx.lineTo(x + Math.cos(a) * r * 1.3, y + Math.sin(a) * r * 1.3); ctx.stroke(); } ctx.restore(); }
function waves(ctx, x, y, t, r0 = 40, col = 'rgba(255,255,255,0.8)', side = 0) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 8; ctx.lineCap = 'round'; for (let j = 0; j < 3; j++) { const r = r0 + j * 30 + ((t * 60) % 30); ctx.globalAlpha = 1 - j / 3; for (const k of side ? [side] : [-1, 1]) { ctx.beginPath(); ctx.arc(x, y, r, k > 0 ? -0.6 : Math.PI - 0.6, k > 0 ? 0.6 : Math.PI + 0.6); ctx.stroke(); } } ctx.restore(); }

// ---------------------------------------------------------------- sets (screen space, floor line 760, people stand at ~900)
const FLOOR = 900;
const COLD = { x: 790, w: 230, y: 250 }, TALLY = [150, 410];   // cold room door; tally sheet on the wall above the counter   // cold room door in the galley
function galley(ctx, t, o = {}) {
  P.kitchen(ctx, t, o.rattle || 0);
  // cold room door between the counter and the steel door
  const { x, w, y } = COLD;
  fillR(ctx, x - 14, y - 14, w + 28, 760 - y + 14, 10, '#c3ccd3'); ctx.fillStyle = '#2a2e34'; ctx.font = '30px Anton'; ctx.textAlign = 'center'; ctx.fillText('COLD ROOM', x + w / 2, y + 30);
  if (o.coldOpen) { fillR(ctx, x, y + 46, w, 760 - y - 46, 4, '#14202a'); ctx.fillStyle = 'rgba(160,210,255,0.08)'; ctx.fillRect(x, y + 46, w, 760 - y - 46);
    fillR(ctx, x + 20, y + 190, w - 40, 12, 2, '#7d8892'); for (let i = 0; i < Math.round(4 * (o.bread ?? 1)); i++) L.bread(ctx, x + 50 + i * 50, y + 176, 0.38);
    fillR(ctx, x + w - 110, 620, 96, 140, 4, o.hatchOpen ? '#05070a' : '#5d6b78'); ctx.fillStyle = '#ffd23f'; ctx.font = '18px Anton'; ctx.fillText('ENG ACCESS', x + w - 62, 610); }
  else { fillR(ctx, x, y + 46, w, 760 - y - 46, 4, '#e6ecef'); fillR(ctx, x + w - 40, 470, 18, 80, 6, '#8a959f');
    if (o.print) { ctx.fillStyle = 'rgba(20,16,12,0.85)'; ctx.beginPath(); ctx.ellipse(x + w - 30, 520, 14, 18, 0.2, 0, 7); ctx.fill(); for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(x + w - 41 + i * 8, 492, 4, 10, 0.1, 0, 7); ctx.fill(); } } }
  ctx.textAlign = 'left';
  // tally sheet on the wall
  if (o.tally != null) { fillR(ctx, TALLY[0], TALLY[1], 220, 110, 6, '#efe6cf'); for (let i = 0; i < o.tally; i++) { const g = Math.floor(i / 5), k = i % 5, x0 = TALLY[0] + 20 + (g % 5) * 40, y0 = TALLY[1] + 14 + Math.floor(g / 5) * 46; if (k < 4) stroke(ctx, [[x0 + k * 7, y0], [x0 + k * 7, y0 + 32]], 4, '#1e2026'); else stroke(ctx, [[x0 - 4, y0 + 26], [x0 + 28, y0 + 6]], 4, '#c93a32'); } }
  // porthole view in the steel door
  if (o.porthole) { ctx.save(); ctx.beginPath(); ctx.arc(1570, 330, 56, 0, 7); ctx.clip(); o.porthole(ctx); ctx.restore(); }
  // the barricade cart against the door
  if (o.cart != null) P.cart(ctx, o.cart, FLOOR, 1.25);
}
function engine(ctx, t, o = {}) {
  ctx.fillStyle = '#3c4a48'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = 'rgba(0,0,0,0.12)'; for (let x = 0; x < W; x += 80) ctx.fillRect(x, 0, 3, 760);
  // pipes
  for (const [y, c] of [[70, '#8a6a45'], [120, '#5a6a7a'], [160, '#7a3a34']]) { fillR(ctx, -20, y, W + 40, 26, 12, c); for (let x = 100; x < W; x += 420) fillR(ctx, x, y - 6, 22, 38, 4, '#2b3138'); }
  // engines
  for (const ex of [40, 420]) { fillR(ctx, ex, 330, 330, 430, 30, '#6a7a6a'); for (let i = 0; i < 4; i++) fillR(ctx, ex + 22 + i * 76, 270, 60, 90, 10, '#5a6a5a');
    if (o.running) for (let i = 0; i < 4; i++) { ctx.fillStyle = `rgba(255,120,60,${0.35 + 0.25 * Math.sin(t * 22 + i)})`; ctx.fillRect(ex + 36 + i * 76, 300, 32, 8); }
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(ex + 20, 360, 18, 380); }
  // tunnel hatch high on the wall
  fillR(ctx, 820, 200, 150, 120, 8, '#5d6b78'); fillR(ctx, 832, 212, 126, 96, 6, o.hatchOpen ? '#05070a' : '#7f8c97'); ctx.fillStyle = '#ffd23f'; ctx.font = '18px Anton'; ctx.textAlign = 'center'; ctx.fillText('SVC TUNNEL', 895, 190);
  // ladder under the hatch
  for (const lx of [850, 940]) stroke(ctx, [[lx, 320], [lx, 760]], 8, '#c9a030'); for (let y = 350; y < 760; y += 50) stroke(ctx, [[850, y], [940, y]], 6, '#c9a030');
  // CCTV monitor + console
  fillR(ctx, 1150, 210, 300, 210, 12, '#16181c'); ctx.save(); ctx.beginPath(); ctx.rect(1164, 224, 272, 170); ctx.clip(); (o.cctv || cctvStatic)(ctx, t, 1164, 224, 272, 170); ctx.restore();
  ctx.fillStyle = '#9aa3ab'; ctx.font = '18px Anton'; ctx.fillText('CAM 01 - BRIDGE', 1300, 445);
  fillR(ctx, 1040, 480, 520, 280, 14, '#2e3238'); fillR(ctx, 1066, 500, 290, 110, 8, '#0e1a14');
  const ovr = o.override; ctx.fillStyle = '#7ad0a0'; ctx.font = '24px Anton'; ctx.fillText('STEERING', 1211, 538);
  ctx.font = ovr ? '30px Anton' : '34px Anton'; ctx.fillStyle = ovr ? (Math.floor(t * 4) % 2 ? '#ff5a3a' : '#ffb0a0') : '#9ff0c0'; ctx.fillText(ovr ? 'BRIDGE OVERRIDE' : 'ENGINE CONTROL', 1211, 584);
  // rudder + fuel gauges
  const R = [1440, 560]; ctx.beginPath(); ctx.arc(R[0], R[1], 56, Math.PI, 0); ctx.fillStyle = '#1a1e24'; ctx.fill(); stroke(ctx, [R, [R[0] + Math.sin(o.rudder || 0) * 48, R[1] - Math.cos(o.rudder || 0) * 48]], 6, '#ffd23f'); ctx.fillStyle = '#9aa3ab'; ctx.font = '18px Anton'; ctx.fillText('RUDDER', R[0], R[1] + 26);
  const Fu = [1440, 680], fv = o.fuel ?? 0.5; circle(ctx, Fu[0], Fu[1], 50, '#1a1e24'); const fa = -Math.PI * 0.75 + fv * Math.PI * 1.5; stroke(ctx, [Fu, [Fu[0] + Math.sin(fa) * 40, Fu[1] - Math.cos(fa) * 40]], 5, fv < 0.15 ? '#ff5a3a' : '#e8e2d0'); ctx.fillText('FUEL', Fu[0], Fu[1] + 70);
  // throttle lever + main breaker
  fillR(ctx, 1110, 650, 40, 90, 6, '#1a1e24'); fillR(ctx, 1100, 640 + (o.throttle || 0) * 50, 60, 22, 8, '#d6413a');
  fillR(ctx, 1240, 640, 90, 110, 8, '#c9a030'); ctx.fillStyle = '#1e2026'; ctx.font = '16px Anton'; ctx.fillText('MAIN', 1285, 668); fillR(ctx, 1270, 680 + (o.breaker ? 30 : 0), 30, 40, 6, '#1e2026');
  // storeroom door (right)
  fillR(ctx, 1640, 280, 240, 480, 8, '#5d6b78'); fillR(ctx, 1656, 296, 208, 464, 6, o.storeOpen ? '#0a0c10' : '#7f8c97'); ctx.fillStyle = '#ffd23f'; ctx.font = '22px Anton'; ctx.fillText('STORES', 1760, 270); if (!o.storeOpen) fillR(ctx, 1672, 500, 18, 70, 6, '#3d4650');
  ctx.textAlign = 'left';
  // floor + VHF set + stove corner
  ctx.fillStyle = '#2a3030'; ctx.fillRect(0, 760, W, H - 760); ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 3; for (let x = -400; x < W + 400; x += 120) { ctx.beginPath(); ctx.moveTo(x, 760); ctx.lineTo(x + (x - W / 2) * 0.6, H); ctx.stroke(); }
  if (o.tally) { fillR(ctx, 990, 330, 40, 400, 6, '#7f8c97'); for (let i = 0; i < o.tally; i++) stroke(ctx, [[996 + (i % 5) * 7, 350 + Math.floor(i / 5) * 46], [996 + (i % 5) * 7, 380 + Math.floor(i / 5) * 46]], 3, '#efe6cf'); }
}
function cctvStatic(ctx, t, x, y, w, h) { ctx.fillStyle = '#222'; ctx.fillRect(x, y, w, h); for (let i = 0; i < 220; i++) { ctx.fillStyle = hash(i + Math.floor(t * 24) * 7) > 0.5 ? '#bbb' : '#444'; ctx.fillRect(x + hash(i * 3 + Math.floor(t * 24)) * w, y + hash(i * 5 + Math.floor(t * 24)) * h, 12, 4); } }
// the bridge on CCTV: dark wheelhouse, a figure in a captain's coat at the wheel, back to camera; turn 0..1
function cctvBridge(ctx, t, x, y, w, h, turn = 0) {
  ctx.fillStyle = '#0c1410'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#16241c'; for (let i = 0; i < 4; i++) ctx.fillRect(x + 8 + i * (w / 4), y + h * 0.14, w / 4 - 14, h * 0.32);
  ctx.fillStyle = '#1e3a2a'; ctx.fillRect(x, y + h * 0.72, w, h * 0.28); ctx.fillStyle = '#9ff0c0'; for (let i = 0; i < 6; i++) ctx.fillRect(x + 16 + i * w / 7, y + h * 0.76, 8, 4);
  const k = h / 170, fx = x + w * 0.5, fy = y + h;
  ctx.fillStyle = '#05080a'; ctx.beginPath(); ctx.moveTo(fx - 34 * k, fy); ctx.lineTo(fx - 28 * k, fy - 78 * k); ctx.quadraticCurveTo(fx, fy - 90 * k, fx + 28 * k, fy - 78 * k); ctx.lineTo(fx + 34 * k, fy); ctx.fill();
  ctx.beginPath(); ctx.arc(fx + turn * 7 * k, fy - 100 * k, 17 * k, 0, 7); ctx.fill(); ctx.fillRect(fx - 21 * k, fy - 118 * k, 42 * k, 8 * k); ctx.fillStyle = '#c9b060'; ctx.fillRect(fx - 12 * k, fy - 117 * k, 24 * k, 3 * k);
  ctx.strokeStyle = '#0a0e10'; ctx.lineWidth = 4 * k; ctx.beginPath(); ctx.arc(fx + 26 * k, fy - 52 * k, 20 * k, 0, 7); ctx.stroke(); ctx.fillStyle = '#e9e4dc'; ctx.fillRect(fx + 22 * k, fy - 60 * k, 12 * k, 12 * k);   // bandaged hand on the wheel
  if (turn > 0.3) { ctx.fillStyle = `rgba(230,230,220,${clamp((turn - 0.3) * 1.4)})`; ctx.fillRect(fx + 10 * k, fy - 104 * k, 5 * k, 4 * k); }
  ctx.fillStyle = 'rgba(160,255,190,0.07)'; for (let i = 0; i < h; i += 3) ctx.fillRect(x, y + i, w, 1);
  ctx.fillStyle = '#ff4b3a'; ctx.font = `${Math.round(14 * k)}px Anton`; ctx.textAlign = 'right'; ctx.fillText('REC', x + w - 22 * k, y + 18 * k); circle(ctx, x + w - 12 * k, y + 13 * k, 4 * k, '#ff4b3a'); ctx.textAlign = 'left';
}
function mess(ctx, t, o = {}) {
  ctx.fillStyle = '#7d8f82'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#d8d3c8'; ctx.fillRect(0, 90, W, 26);
  for (const tx of [120, 620]) { fillR(ctx, tx, 600, 420, 26, 6, '#c9c0ae'); stroke(ctx, [[tx + 40, 626], [tx + 40, 760]], 12, '#6a747c'); stroke(ctx, [[tx + 380, 626], [tx + 380, 760]], 12, '#6a747c'); }
  // lifeboat kit with the radio
  fillR(ctx, 1080, 290, 240, 170, 10, '#e8792f'); ctx.fillStyle = '#fff'; ctx.font = '24px Anton'; ctx.textAlign = 'center'; ctx.fillText('LIFEBOAT KIT', 1200, 322); if (!o.radioTaken) L.radio(ctx, [1200, 420]);
  // ice machine
  fillR(ctx, 1450, 330, 330, 430, 12, '#c9d1d8'); fillR(ctx, 1490, 370, 250, 110, 8, '#2a2e34'); ctx.fillStyle = '#9fd6ff'; ctx.font = '50px Anton'; ctx.fillText('ICE', 1615, 444); fillR(ctx, 1540, 540, 150, 130, 8, '#3a424a');
  if (o.iceOn) for (let i = 0; i < 14; i++) { ctx.fillStyle = '#e6f6ff'; ctx.fillRect(1560 + hash(i + Math.floor(t * 20)) * 110, 560 + hash(i * 3 + Math.floor(t * 20)) * 100, 16, 16); }
  ctx.textAlign = 'left';
  ctx.fillStyle = '#3d4a44'; ctx.fillRect(0, 760, W, H - 760); ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 3; for (let x = -400; x < W + 400; x += 120) { ctx.beginPath(); ctx.moveTo(x, 760); ctx.lineTo(x + (x - W / 2) * 0.6, H); ctx.stroke(); }
}
// side-view crew corridor (for the run): wall with doors, floor; scroll = world offset
function hall(ctx, t, scroll = 0, o = {}) {
  ctx.fillStyle = '#c9bfa8'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#8a6a45'; ctx.fillRect(0, 430, W, 14);
  for (let i = -2; i < 8; i++) { const dx = ((i * 520 - scroll) % 3640 + 3640) % 3640 - 400; fillR(ctx, dx, 230, 220, 530, 6, '#7b5a40'); circle(ctx, dx + 190, 500, 9, '#e0b45a'); fillR(ctx, dx + 60, 180, 100, 36, 6, '#2b2f3c'); ctx.fillStyle = '#e8d9a8'; ctx.font = '24px Anton'; ctx.textAlign = 'center'; ctx.fillText(String(1100 + ((i % 7) + 7) % 7 * 2), dx + 110, 206); }
  ctx.textAlign = 'left'; ctx.fillStyle = '#5a2a3a'; ctx.fillRect(0, 760, W, H - 760); for (let x = 0; x < W + 60; x += 60) { ctx.fillStyle = Math.floor(t * 2 + (x + scroll) / 60) % 2 ? '#ff5a3a' : '#7a2a1a'; ctx.fillRect(((x - scroll) % (W + 60) + W + 60) % (W + 60) - 30, 754, 30, 6); }
}
// exterior: sky (night | dawn), sea, the liner (pilot drawing), optional lighthouse / cutter
function outside(ctx, t, o = {}) {
  const g = ctx.createLinearGradient(0, 0, 0, 640), P0 = { night: ['#04060d', '#0c1430', '#18223c'], dawn: ['#23305a', '#8a6a8a', '#f0a77a'], dusk: ['#2c2f4a', '#c9604e', '#f2a65e'] }[o.sky || 'night'];
  g.addColorStop(0, P0[0]); g.addColorStop(0.6, P0[1]); g.addColorStop(1, P0[2]); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 660);
  if ((o.sky || 'night') === 'night') { ctx.fillStyle = 'rgba(255,255,255,0.75)'; for (let i = 0; i < 90; i++) ctx.fillRect(hash(i) * W, hash(i + 1) * 560, 3, 3); }
  P.sea(ctx, 640, t, o.sky === 'dawn' ? '#3a4a70' : '#0f2232', o.sky === 'dawn' ? '#1a2440' : '#050b12');
}
function lighthouse(ctx, x, y, t, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#05070c'; ctx.beginPath(); ctx.moveTo(-400, 0); ctx.quadraticCurveTo(-100, -60, 0, -50); ctx.quadraticCurveTo(200, -40, 500, 0); ctx.fill(); ctx.fillRect(-14, -170, 28, 130);
  const a = t * 1.6, on = Math.cos(a) > 0.5; if (on) glow(ctx, 0, -175, 160, 'rgba(255,240,180,0.8)'); ctx.fillStyle = on ? '#fff6c8' : '#6a6040'; ctx.fillRect(-10, -184, 20, 16);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,240,180,0.16)'; ctx.beginPath(); ctx.moveTo(0, -176); const d = Math.sin(a) * 900; ctx.lineTo(d, -230); ctx.lineTo(d, -120); ctx.closePath(); ctx.fill(); ctx.restore(); ctx.restore(); }
function cutter(ctx, x, y, s, t, beamA = null) { ctx.save(); ctx.translate(x, y + Math.sin(t) * 3); ctx.scale(s, s);
  ctx.fillStyle = '#7f8a94'; ctx.beginPath(); ctx.moveTo(-300, -40); ctx.lineTo(320, -40); ctx.lineTo(260, 40); ctx.lineTo(-280, 40); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#d6413a'; ctx.fillRect(140, -36, 20, 72); ctx.fillStyle = '#5d6b78'; fillR(ctx, -120, -130, 220, 92, 8, '#9aa6b1'); fillR(ctx, -60, -190, 80, 62, 6, '#9aa6b1'); stroke(ctx, [[-20, -190], [-20, -260]], 6, '#5d6b78');
  ctx.fillStyle = '#ffd98a'; for (let i = 0; i < 6; i++) ctx.fillRect(-100 + i * 32, -110, 18, 14);
  if (beamA != null) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(40, -170, 4, 40, -170, 1400); g.addColorStop(0, 'rgba(255,250,220,0.55)'); g.addColorStop(1, 'rgba(255,250,220,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(40, -170); ctx.lineTo(40 + Math.cos(beamA - 0.05) * 1400, -170 + Math.sin(beamA - 0.05) * 1400); ctx.lineTo(40 + Math.cos(beamA + 0.05) * 1400, -170 + Math.sin(beamA + 0.05) * 1400); ctx.closePath(); ctx.fill(); ctx.restore(); circle(ctx, 40, -170, 12, '#fffbe0'); }
  ctx.restore(); }
// liner seen at night with windows lit fraction `lit` (0 = blacked out, deck by deck); dir -1 mirrors (heading left)
function liner(ctx, x, y, s, t, o = {}) { ctx.save(); ctx.translate(x, y); if (o.flip) ctx.scale(-1, 1); P.cruiseShip(ctx, 0, 0, s, t);
  if (o.dark != null) { ctx.save(); ctx.scale(s, s); ctx.globalCompositeOperation = 'multiply'; const tiers = [[-430, 380, -230], [-470, 470, -170], [-520, 560, -110], [-640, 720, -50]];
    tiers.forEach(([a, b, yy], i) => { const off = clamp(o.dark * 4 - (3 - i)); if (off > 0) { ctx.fillStyle = `rgba(20,24,40,${0.85 * off})`; ctx.fillRect(a, yy, b - a, 64); } }); ctx.restore(); }
  ctx.restore(); }

module.exports = { L, P, TL, W, H, FLOOR, COLD, TALLY, at, end, sc, pop, blink, win, sm, shot, shake, dark, tint, glow, day, fade, burst, waves, galley, engine, cctvStatic, cctvBridge, mess, hall, outside, lighthouse, cutter, liner };
