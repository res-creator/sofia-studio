// Общие помощники обложек v4 (стиль «сцена-история»): огромный курсивный текст, бирка, красный круг,
// частицы, большие глянцевые глаза поверх toon-рига (person() из toon.js), капли пота, слеза.
import { E, registerShot } from '/engine/core.js';

export const W = 1920, H = 1080;
const OL = '#2a2321';
const FONT = (s) => `700 ${s}px "OswC", "OswL", sans-serif`;
const rng = (seed) => { let s = seed * 9301 + 49297; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); };
const rr = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
const el = (g, x, y, rx, ry, fill, lw = 0, ol = OL) => { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.lineWidth = lw; g.strokeStyle = ol; g.stroke(); } };

// огромный текст: курсив (skew), тень, тонкий тёмный контур
export function BIG(g, s, x, y, size, col, o = {}) {
  const skew = o.skew ?? -0.2, rot = o.rot ?? -0.04;
  g.save(); g.font = FONT(size); g.textBaseline = 'alphabetic'; g.textAlign = o.align || 'left';
  const w = g.measureText(s).width + Math.abs(skew) * size * 0.75, k = o.maxW && w > o.maxW ? o.maxW / w : 1;
  g.translate(x, y); g.rotate(rot); g.scale(k, 1); g.transform(1, 0, skew, 1, 0, 0); g.lineJoin = 'round';
  g.shadowColor = 'rgba(0,0,0,.8)'; g.shadowBlur = size * 0.12; g.shadowOffsetX = size * 0.03; g.shadowOffsetY = size * 0.06;
  g.fillStyle = '#08080c'; g.fillText(s, 0, 0); g.shadowColor = 'transparent';
  g.lineWidth = Math.max(7, size * 0.08); g.strokeStyle = '#0b0b12'; g.strokeText(s, 0, 0); g.fillStyle = col; g.fillText(s, 0, 0); g.restore();
}
export function TAG(g, s, x, y, size, bg, col = '#ffffff', o = {}) {
  g.save(); g.font = FONT(size); const w = g.measureText(s).width + size * 0.7, h = size * 1.32;
  g.translate(o.align === 'right' ? x - w : x, y); g.rotate(o.rot ?? -0.04);
  g.fillStyle = 'rgba(0,0,0,.5)'; rr(g, 8, 10, w, h, 10); g.fill(); rr(g, 0, 0, w, h, 10); g.fillStyle = bg; g.fill(); g.lineWidth = 5; g.strokeStyle = '#0b0b12'; g.stroke();
  g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s, w / 2, h / 2 + size * 0.06); g.restore();
}
export function redCircle(g, x, y, rx, ry, rot = -0.12) { g.save(); g.translate(x, y); g.rotate(rot); g.beginPath(); for (let a = 0; a <= Math.PI * 2.25; a += 0.05) { const r = 1 + 0.05 * Math.sin(a * 3); const px = Math.cos(a - 1.2) * rx * r, py = Math.sin(a - 1.2) * ry * r * (1 + (a > Math.PI * 2 ? 0.08 : 0)); a ? g.lineTo(px, py) : g.moveTo(px, py); } g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = 22; g.strokeStyle = '#0b0b12'; g.stroke(); g.lineWidth = 13; g.strokeStyle = '#ff2a2a'; g.stroke(); g.restore(); }
export function particles(g, n, seed, col = '255,255,255', box = [0, 0, W, H], rmax = 4, amax = 0.55) { const R = rng(seed); const [x0, y0, x1, y1] = box; for (let i = 0; i < n; i++) { const x = x0 + R() * (x1 - x0), y = y0 + R() * (y1 - y0), r = 1 + R() * rmax; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = `rgba(${col},${(0.15 + R() * amax).toFixed(2)})`; g.fill(); } }
export function glow(g, x, y, r, col, a) { g.save(); g.globalCompositeOperation = 'screen'; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.restore(); }
export function darken(g, a, col = '0,0,8') { const v = g.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.7); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(${col},${a})`); g.fillStyle = v; g.fillRect(0, 0, W, H); }
export function tint(g, rgba, mode = 'multiply', box = [0, 0, W, H]) { g.save(); g.globalCompositeOperation = mode; g.fillStyle = rgba; g.fillRect(...box); g.restore(); }
export function topShade(g, h = 380, a = 0.65, box = [0, 0, W]) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, `rgba(0,0,6,${a})`); gr.addColorStop(1, 'rgba(0,0,6,0)'); g.fillStyle = gr; g.fillRect(box[0], box[1], box[2], h); }

// перенос в систему координат головы person() (toon.js): центр головы (0,0), радиус ~64×66
function headSpace(g, o, fn) {
  const s = o.s ?? 1, f = o.face ?? 1, t = o.t ?? 0, seed = o.seed ?? 1;
  const walk = o.walk !== undefined && o.walk !== false ? o.walk : null;
  const bob = walk !== null ? Math.abs(Math.sin(walk)) * -8 : Math.sin(t * 2.2 + seed) * 2.2;
  g.save(); g.translate(o.x, o.y); g.scale(s * f, s); g.translate(0, bob + (o.sit ? 40 : 0)); g.translate(0, -240 + (o.headDY || 0)); g.rotate(o.tilt || 0); fn(g); g.restore();
}
// большие глянцевые глаза, опц. мокрые, слеза, капли пота
export function bigEyes(g, o, opt = {}) {
  headSpace(g, o, (g) => {
    const lk = (o.look ?? 0.25) * 10, ly = (opt.lookY ?? 0) * 4, rx = opt.rx ?? 13, ry = opt.ry ?? 15.5;
    [[-22 + lk, 4], [24 + lk, 4]].forEach(([cx, cy]) => {
      el(g, cx, cy, rx, ry, '#fbf8f1');
      g.save(); g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.clip();
      const ix = cx + (opt.irisDX ?? (o.look ?? 0) * 3), iy = cy + 1.5 + ly;
      el(g, ix, iy, opt.shrink ? 5.5 : 8.5, opt.shrink ? 6.5 : 9.8, '#2a1c14'); el(g, ix, iy, opt.shrink ? 3 : 5, opt.shrink ? 3.6 : 5.8, '#0a0806');
      el(g, ix - 3, iy - 4, 2.9, 2.9, '#ffffff'); el(g, ix + 3, iy + 3.5, 1.3, 1.3, 'rgba(255,255,255,.9)');
      if (opt.wet) el(g, cx, cy + ry * 0.78, rx * 0.85, ry * 0.26, 'rgba(160,215,255,.6)');
      g.restore(); el(g, cx, cy, rx, ry, null, 3.5);
    });
    if (opt.tear) { const tx = -22 + lk - 3, ty = 22; g.save(); g.globalAlpha = 0.55; g.beginPath(); g.moveTo(tx, ty - 4); g.quadraticCurveTo(tx - 3, ty + 10, tx - 1, ty + 18); g.lineWidth = 4; g.strokeStyle = '#cdeeff'; g.lineCap = 'round'; g.stroke(); g.restore(); const dx = tx - 1, dy = ty + 28; g.beginPath(); g.moveTo(dx, dy - 12); g.quadraticCurveTo(dx + 8, dy + 1, dx, dy + 7); g.quadraticCurveTo(dx - 8, dy + 1, dx, dy - 12); g.fillStyle = '#bfe6ff'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = OL; g.stroke(); el(g, dx - 2, dy, 1.8, 2.8, '#fff'); }
    if (opt.sweat) for (const [sx, sy, k] of [[62, -26, 1], [-64, -6, 0.75], [54, 20, 0.6]].slice(0, opt.sweat)) { g.beginPath(); g.moveTo(sx, sy - 13 * k); g.quadraticCurveTo(sx + 9 * k, sy + 2 * k, sx, sy + 8 * k); g.quadraticCurveTo(sx - 9 * k, sy + 2 * k, sx, sy - 13 * k); g.fillStyle = '#bfe6ff'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = OL; g.stroke(); el(g, sx - 2 * k, sy, 1.6, 2.6, '#fff'); }
  });
}
export const reg = (K) => { for (const s of E.shots || []) { const f = K[(s.params || {}).k]; if (f) registerShot(s.id, { draw: (g, t, info) => f(g, t, info) }); } };
export const fakeInfo = (id) => ({ shot: { id, start: 0, end: 3 }, dur: 3, p: 0.5 });
