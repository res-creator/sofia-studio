// Cruise Ship props (D2 ink + cel shade). Each returns grip points where hands go, like test_style/props.js.
const K = require('./cast'), { R, D2 } = K, { paint, cap, line, shade } = R;
const S = D2, INK = D2.ink;
const rot = (p, c, a) => [c[0] + (p[0] - c[0]) * Math.cos(a) - (p[1] - c[1]) * Math.sin(a), c[1] + (p[0] - c[0]) * Math.sin(a) + (p[1] - c[1]) * Math.cos(a)];

// silver tray with champagne flutes; c = centre of the tray, a = tilt; grip = under the near edge
function tray(c, a = 0, n = 4) { return { c, a, n, grip: rot([c[0] + 70, c[1] + 10], c, a) }; }
function drawTray(ctx, t, o = {}) {
  ctx.save(); ctx.translate(...t.c); ctx.rotate(t.a);
  for (let i = 0; i < t.n; i++) { if (o.lost && o.lost > i) continue; const x = -60 + i * 38;
    ctx.save(); ctx.globalAlpha = 0.85; paint(ctx, S, c => { c.moveTo(x - 9, -78); c.lineTo(x + 9, -78); c.lineTo(x + 5, -36); c.lineTo(x - 5, -36); c.closePath(); }, '#e9f3f6'); ctx.restore();
    ctx.fillStyle = '#f2d27a'; ctx.fillRect(x - 6, -66, 12, 22); line(ctx, [[x, -36], [x, -12]], 4, '#cfd8dc'); line(ctx, [[x - 10, -10], [x + 10, -10]], 4, '#cfd8dc'); }
  paint(ctx, S, c => c.ellipse(0, 0, 100, 13, 0, 0, 7), '#c9cfd6');
  ctx.restore();
}
// flying / broken glass shards
function shards(ctx, x, y, u, seed = 0) { for (let i = 0; i < 9; i++) { const a = -Math.PI * (0.1 + 0.8 * K.hash(seed + i)), v = 120 + K.hash(i + 4) * 160, px = x + Math.cos(a) * v * u, py = y + Math.sin(a) * v * u + 400 * u * u;
  ctx.save(); ctx.translate(px, py); ctx.rotate(u * 9 + i); ctx.fillStyle = '#e9f3f6'; ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-6, -4); ctx.lineTo(7, -2); ctx.lineTo(0, 8); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); } }
// flare gun (orange pistol); grip at handle, muzzle tip returned for aiming
function flareGun(G, a) { return { G, a, muzzle: rot([G[0] - 90, G[1] - 26], G, a) }; }
function drawFlareGun(ctx, f) { ctx.save(); ctx.translate(...f.G); ctx.rotate(f.a);
  paint(ctx, S, c => { c.moveTo(-6, -10); c.lineTo(10, 30); c.lineTo(28, 26); c.lineTo(16, -14); c.closePath(); }, '#e0632a');
  paint(ctx, S, c => c.roundRect(-100, -40, 120, 34, 10), '#f07a2e'); paint(ctx, S, c => c.ellipse(-100, -23, 9, 17, 0, 0, 7), '#3a2a20'); ctx.restore(); }
// flashlight: grip G, direction a; cone lit when on
function flashlight(G, a) { return { G, a, tip: [G[0] + Math.cos(a) * 60, G[1] + Math.sin(a) * 60] }; }
function drawFlashlight(ctx, f, on, len = 900, spread = 0.22) {
  if (on) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(f.tip[0], f.tip[1], 10, f.tip[0], f.tip[1], len); g.addColorStop(0, 'rgba(255,246,210,0.55)'); g.addColorStop(1, 'rgba(255,240,200,0)'); ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(...f.tip); ctx.lineTo(f.tip[0] + Math.cos(f.a - spread) * len, f.tip[1] + Math.sin(f.a - spread) * len); ctx.lineTo(f.tip[0] + Math.cos(f.a + spread) * len, f.tip[1] + Math.sin(f.a + spread) * len); ctx.closePath(); ctx.fill(); ctx.restore(); }
  ctx.save(); ctx.translate(...f.G); ctx.rotate(f.a); paint(ctx, S, c => c.roundRect(-30, -11, 70, 22, 6), '#2e3138'); paint(ctx, S, c => c.roundRect(36, -16, 26, 32, 6), '#3e424a');
  ctx.fillStyle = on ? '#fff6c8' : '#8a8f96'; ctx.fillRect(58, -12, 5, 24); ctx.restore(); }
// cast-iron frying pan: grip at the handle end, a = direction to the pan
function pan(G, a, L = 190) { return { G, a, L, high: [G[0] + Math.cos(a) * 40, G[1] + Math.sin(a) * 40] }; }
function drawPan(ctx, p) { ctx.save(); ctx.translate(...p.G); ctx.rotate(p.a); paint(ctx, S, c => c.roundRect(-10, -9, p.L * 0.55, 18, 8), '#2a2a2e');
  paint(ctx, S, c => c.ellipse(p.L * 0.55 + 62, 0, 66, 60, 0, 0, 7), '#3a3b40'); ctx.fillStyle = '#26272b'; ctx.beginPath(); ctx.ellipse(p.L * 0.55 + 62, 0, 50, 45, 0, 0, 7); ctx.fill(); ctx.restore(); }
// kitchen timer (white dome); ringing shakes it
function drawTimer(ctx, x, y, s = 1, ring = 0, t = 0) { ctx.save(); ctx.translate(x + (ring ? Math.sin(t * 80) * 3 : 0), y); ctx.scale(s, s);
  paint(ctx, S, c => { c.moveTo(-34, 0); c.quadraticCurveTo(-34, -46, 0, -48); c.quadraticCurveTo(34, -46, 34, 0); c.closePath(); }, '#f2efe8'); paint(ctx, S, c => c.rect(-36, -4, 72, 12), '#d6413a');
  paint(ctx, S, c => c.roundRect(-6, -60, 12, 14, 3), '#d6413a'); line(ctx, [[0, -30], [12, -38]], 4, INK);
  if (ring) for (const k of [-1, 1]) for (let i = 1; i <= 2; i++) { ctx.beginPath(); ctx.arc(0, -30, 40 + i * 14, k > 0 ? -0.6 : Math.PI - 0.6, k > 0 ? 0.6 : Math.PI + 0.6); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke(); }
  ctx.restore(); }
// engineering wristband / key tag
function drawWristband(ctx, x, y, s = 1, a = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s); paint(ctx, S, c => c.roundRect(-60, -12, 120, 24, 10), '#c8402e');
  ctx.fillStyle = '#fff'; ctx.font = '13px Anton'; ctx.textAlign = 'center'; ctx.fillText('ENGINEERING · R. OKAFOR', 0, 5); paint(ctx, S, c => c.roundRect(52, -18, 26, 36, 5), '#c9cfd6'); ctx.restore(); }
function drawBread(ctx, x, y, s = 1, a = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s); paint(ctx, S, c => c.ellipse(0, 0, 70, 30, 0, 0, 7), '#d9a05a');
  ctx.strokeStyle = shade('#d9a05a', 0.7); ctx.lineWidth = 4; for (const k of [-30, 0, 30]) { ctx.beginPath(); ctx.moveTo(k - 10, -18); ctx.lineTo(k + 10, -6); ctx.stroke(); } ctx.restore(); }
// handheld marine VHF radio
function drawVHF(ctx, x, y, s = 1, on = 0, t = 0) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); paint(ctx, S, c => c.rect(14, -96, 8, 44), '#222'); paint(ctx, S, c => c.roundRect(-26, -60, 52, 96, 9), '#f0c020');
  ctx.fillStyle = '#2b3a3a'; ctx.fillRect(-18, -50, 36, 24); ctx.fillStyle = on ? '#9ff0c0' : '#4a6a5a'; ctx.font = '13px Anton'; ctx.fillText('CH16', -15, -32); ctx.fillStyle = '#333'; for (let i = 0; i < 4; i++) ctx.fillRect(-16, -16 + i * 9, 32, 4);
  ctx.fillStyle = on && Math.floor(t * 6) % 2 ? '#ff4b3a' : '#5a2a28'; ctx.beginPath(); ctx.arc(-14, -58, 4, 0, 7); ctx.fill(); ctx.restore(); }
function drawPlate(ctx, x, y, s = 1, a = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s); paint(ctx, S, c => c.ellipse(0, 0, 50, 12, 0, 0, 7), '#f4f1ea'); ctx.restore(); }
function drawFork(ctx, x, y, a = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); line(ctx, [[-30, 0], [20, 0]], 5, '#c9cfd6'); for (const k of [-5, 0, 5]) line(ctx, [[20, k], [32, k]], 3, '#c9cfd6'); ctx.restore(); }
function drawTowel(ctx, x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); paint(ctx, S, c => { c.moveTo(-50, -20); c.quadraticCurveTo(0, -40, 50, -18); c.lineTo(46, 24); c.quadraticCurveTo(0, 8, -46, 26); c.closePath(); }, '#f2efe8');
  ctx.fillStyle = '#5a8ad0'; ctx.fillRect(-46, 6, 92, 6); ctx.restore(); }
module.exports = { tray, drawTray, shards, flareGun, drawFlareGun, flashlight, drawFlashlight, pan, drawPan, drawTimer, drawWristband, drawBread, drawVHF, drawPlate, drawFork, drawTowel, rot };
