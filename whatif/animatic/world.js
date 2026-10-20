// Reusable painters for the Jupiter animatic: space, planet, cloud decks, particles.
const { paint, hash, clamp, lerp } = require('../../lib/draw');
const INK = '#1a1622';
const BANDS = ['#F3E3C6', '#D9A877', '#F6EBD6', '#C07A4E', '#EAD2AE', '#B8693F', '#F1DFC0', '#CF9566', '#F5E6CB', '#A85E3A', '#E9CDA6'];
function space(ctx, W, H, t, drift = 0) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#070A1C'); g.addColorStop(1, '#1A1240'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 160; i++) { const z = 0.3 + hash(i * 3) * 0.7, y = ((hash(i * 7) * H - drift * z) % H + H) % H; ctx.globalAlpha = (0.5 + 0.5 * Math.sin(t * 2 + i)) * z; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(hash(i) * W, y, 0.8 + z * 2.2, 0, 7); ctx.fill(); }
  ctx.globalAlpha = 1;
}
// banded planet in world space; detail grows with R so it holds up in close-ups
function jupiter(ctx, cx, cy, R, t) {
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.clip();
  const n = BANDS.length, step = Math.max(R / 40, 8);
  for (let i = 0; i < n; i++) {
    const y0 = cy - R + 2 * R * i / n, h = 2 * R / n;
    ctx.fillStyle = BANDS[i]; ctx.beginPath(); ctx.moveTo(cx - R, y0);
    for (let x = -R; x <= R; x += step) ctx.lineTo(cx + x, y0 + Math.sin(x / R * 9 + i * 1.7 + t * 0.5) * h * 0.12 + Math.sin(x / R * 31 + i) * h * 0.04);
    ctx.lineTo(cx + R, y0 + h * 1.3); ctx.lineTo(cx - R, y0 + h * 1.3); ctx.closePath(); ctx.fill();
  }
  ctx.save(); ctx.translate(cx + R * 0.3, cy + R * 0.38); ctx.fillStyle = '#C8553D'; ctx.beginPath(); ctx.ellipse(0, 0, R * 0.2, R * 0.1, -0.05, 0, 7); ctx.fill();
  ctx.fillStyle = '#E0784F'; ctx.beginPath(); ctx.ellipse(-R * 0.02, 0, R * 0.12, R * 0.05, -0.05, 0, 7); ctx.fill(); ctx.restore();
  const g = ctx.createRadialGradient(cx - R * 0.4, cy - R * 0.45, R * 0.1, cx, cy, R); g.addColorStop(0, 'rgba(255,255,255,0.15)'); g.addColorStop(0.75, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(25,8,40,0.35)');
  ctx.fillStyle = g; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R); ctx.restore();
  ctx.save(); ctx.globalAlpha = 0.35; ctx.lineWidth = Math.min(R * 0.025, 34); ctx.strokeStyle = '#FFD9A0'; ctx.beginPath(); ctx.arc(cx, cy, R + R * 0.015, 0, 7); ctx.stroke(); ctx.restore();
}
function puff(ctx, x, y, s, col, sh) {
  const B = [[-90, 10, 60], [-30, -25, 75], [50, -10, 66], [110, 18, 48], [10, 25, 64]];
  ctx.fillStyle = sh; for (const [dx, dy, r] of B) { ctx.beginPath(); ctx.arc(x + dx * s, y + (dy + 14) * s, r * s, 0, 7); ctx.fill(); }
  ctx.fillStyle = col; for (const [dx, dy, r] of B) { ctx.beginPath(); ctx.arc(x + dx * s, y + dy * s, r * s * 0.93, 0, 7); ctx.fill(); }
}
// horizontal cloud band with a wavy top edge, scrolling sideways at `vx`
function band(ctx, W, y, h, vx, t, col, seed) {
  const off = t * vx; ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-50, y + h);
  for (let x = -50; x <= W + 50; x += 24) ctx.lineTo(x, y + Math.sin((x + off) / 90 + seed) * 26 + Math.sin((x + off) / 37 + seed * 2) * 10);
  ctx.lineTo(W + 50, y + h); ctx.closePath(); ctx.fill();
}
// particles streaming past; dir = screen velocity [vx, vy]
function streaks(ctx, W, H, t, n, v, col, len, seed = 0, w = 4) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const sp = 0.6 + hash(i * 5 + seed) * 0.8, x = ((hash(i + seed) * (W + 400) + t * v[0] * sp) % (W + 400) + W + 400) % (W + 400) - 200;
    const y = ((hash(i * 3 + seed) * (H + 400) + t * v[1] * sp) % (H + 400) + H + 400) % (H + 400) - 200;
    const m = Math.hypot(v[0], v[1]) || 1; ctx.lineWidth = w * (0.5 + hash(i * 9 + seed));
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - v[0] / m * len * sp, y - v[1] / m * len * sp); ctx.stroke();
  }
  ctx.restore();
}
function vignette(ctx, W, H, inner, col = 'rgba(0,0,0,0.85)') {
  const g = ctx.createRadialGradient(W / 2, H / 2, inner, W / 2, H / 2, Math.max(inner + 200, H * 0.75)); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, col); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
module.exports = { INK, BANDS, space, jupiter, puff, band, streaks, vignette };
