// Общие функции документальных вариантов: фото «cover» с медленным наездом, плашки, затемнение.
import { W, H, g, clamp, lerp, ease, PHOTOS, CREDITS } from './engine.js';
export const MONO = '"DejaVu Sans Mono", "Liberation Mono", monospace';
export const win = (t, a, b, f = 0.4) => Math.min(ease((t - a) / f), 1 - ease((t - (b - f)) / f));   // прозрачность окна [a,b]
/** фото, вписанное «cover» в прямоугольник (x,y,w,h), наезд z0→z1 за время окна */
export function photoCover(key, x, y, w, h, k, o = {}) {
  const im = PHOTOS[key]; if (!im) return; const z = lerp(o.z0 ?? 1.04, o.z1 ?? 1.16, k), cs = Math.max(w / im.width, h / im.height) * z, iw = im.width * cs, ih = im.height * cs;
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.filter = o.filter || 'grayscale(1) contrast(1.1) brightness(.92)';
  g.drawImage(im, x + w / 2 - iw / 2 + (o.px ?? 0) * (k - 0.5), y + h / 2 - ih / 2 + (o.py ?? 0) * (k - 0.5), iw, ih); g.filter = 'none'; g.restore();
}
export const credit = (key) => { const c = CREDITS[key]; return c ? `${c.cap || ''} · ${c.author}, ${c.license}` : ''; };
export function vignette(a = 0.55) { const vg = g.createRadialGradient(W / 2, H / 2, 420, W / 2, H / 2, 1250); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(4,8,14,${a})`); g.fillStyle = vg; g.fillRect(0, 0, W, H); }
export function plate(x, y, w, h, edge = '#FF5A1F') { g.save(); g.fillStyle = 'rgba(10,12,16,.82)'; g.beginPath(); g.roundRect(x, y, w, h, 6); g.fill(); g.fillStyle = edge; g.fillRect(x, y, 5, h); g.restore(); }
