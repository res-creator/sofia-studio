// Стиль «Archive Light Table» (по описанию из lemo-opuscar), на нашем движке: светлый стол, настоящие архивные объекты,
// лупа, оранжевые выноски, тёмные плашки с показаниями. Всё считается от абсолютного времени фильма.
import { W, H, g, clamp, lerp, ease, SCENES, PHOTOS, CREDITS, setCaptionStyle } from './engine.js';
setCaptionStyle('strip');
const SIG = '#FF5A1F', INKC = '#15171A', MONO = '"DejaVu Sans Mono", "Liberation Mono", monospace';
const OBJ = {
  A: { k: 'town86', s: 0.5, x: 0, y: 0, r: -0.02 }, B: { k: 'blocks', s: 0.45, x: 1180, y: -60, r: 0.017 },
  C: { k: 'pool', s: 0.45, x: 1180, y: 640, r: -0.014 }, D: { k: 'wheel', s: 0.5, x: -80, y: 760, r: 0.02 },
  E: { k: 'plantmap', s: 0.6, x: -1180, y: 330, r: -0.017, paper: true },
};
const KEYS = [[0, 100, 250, 0.55], [0.5, 100, 250, 0.55], [2.0, 0, 0, 1.0], [2.5, 0, 0, 1.0], [3.6, -30, -30, 1.9], [6.0, -30, -30, 1.95],
  [7.0, 600, -40, 0.8], [7.4, 1180, -60, 1.0], [7.8, 1180, -60, 1.0], [8.9, 1180, -90, 1.75], [11.6, 1180, -90, 1.8], [12.3, 1180, 300, 0.8], [12.9, 1180, 640, 1.0],
  [13.2, 1180, 640, 1.0], [14.3, 1180, 640, 1.8], [16.0, 1180, 640, 1.85], [17.2, 100, 250, 0.55], [21.0, 100, 250, 0.55], [22.0, -80, 760, 1.0], [22.5, -80, 760, 1.0],
  [23.6, -60, 780, 1.8], [26.4, -60, 780, 1.85], [27.6, 100, 250, 0.6], [28.2, 1180, -60, 1.0], [28.7, 1180, -60, 1.0], [29.8, 1100, -20, 1.8], [38.9, 1050, -10, 2.0],
  [39.8, 100, 250, 0.55], [40.8, -1180, 330, 1.0], [41.2, -1180, 330, 1.0], [42.3, -1180, 330, 1.75], [45.0, -1180, 330, 1.8], [46.7, -500, 300, 0.6]];
const LOUPES = [{ t0: 2.0, t1: 3.6, o: 'A', u: 0.45, v: 0.42 }, { t0: 7.2, t1: 8.9, o: 'B', u: 0.55, v: 0.5 }, { t0: 12.7, t1: 14.3, o: 'C', u: 0.5, v: 0.55 },
  { t0: 22.0, t1: 23.6, o: 'D', u: 0.62, v: 0.55 }, { t0: 28.2, t1: 29.8, o: 'B', u: 0.5, v: 0.48 }, { t0: 40.7, t1: 42.3, o: 'E', u: 0.5, v: 0.4 }];
const READS = [[3.0, 6.0, 'ПРИПЯТЬ', '16 лет', 'город основан в 1970 году', 110], [6.9, 12.0, 'НАСЕЛЕНИЕ, 1986', '≈ 50 000', 'жителей', 110],
  [16.2, 20.4, 'ПО ВОСПОМИНАНИЯМ ЖИТЕЛЕЙ', 'снабжение лучше среднего', '', 54], [22.3, 26.6, 'ОТКРЫТИЕ КОЛЕСА ОБОЗРЕНИЯ', '1 мая 1986', 'фото сделано позже', 100],
  [28.0, 33.0, 'ЖИЛОЙ ДОМ', '5-й этаж', 'герой вымышленный', 100], [41.6, 43.7, 'ГЕРОЙ', 'вымышленный', '', 80], [43.9, 46.2, 'ОТЦЫ НА СТАНЦИИ', 'тысячи', 'в городе', 100]];
const LABELS = [[2.9, 6.0, 'A', 0.38, 0.28, 'Припять, 1980-е'], [9.4, 11.4, 'B', 0.58, 0.5, 'пятиэтажки (позднее фото)'], [13.9, 16.0, 'C', 0.5, 0.55, 'бассейн «Лазурный» (позднее фото)'],
  [23.7, 26.2, 'D', 0.7, 0.5, 'колесо обозрения (позднее фото)'], [29.2, 33.0, 'B', 0.45, 0.45, 'пятиэтажный дом'], [42.0, 45.8, 'E', 0.45, 0.3, 'план станции, июль 1986']];

const cam = (t) => { let i = 0; while (i < KEYS.length - 2 && t >= KEYS[i + 1][0]) i++; const a = KEYS[i], b = KEYS[i + 1], u = ease((t - a[0]) / (b[0] - a[0] || 1)); return { cx: lerp(a[1], b[1], u), cy: lerp(a[2], b[2], u), z: lerp(a[3], b[3], u) }; };
const dim = (o) => { const im = PHOTOS[o.k]; return im ? [im.width * o.s, im.height * o.s] : [800, 500]; };
const objPt = (o, u, v) => { const [w, h] = dim(o), c = Math.cos(o.r), s = Math.sin(o.r), px = (u - 0.5) * w, py = (v - 0.5) * h; return [o.x + px * c - py * s, o.y + px * s + py * c]; };
const table = () => { const gr = g.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 1250); gr.addColorStop(0, '#F8FAFC'); gr.addColorStop(1, '#DCE2E9'); g.fillStyle = gr; g.fillRect(0, 0, W, H); };
function objects() {
  for (const id of Object.keys(OBJ)) { const o = OBJ[id], im = PHOTOS[o.k], [w, h] = dim(o); if (!im) continue;
    g.save(); g.translate(o.x, o.y); g.rotate(o.r);
    if (o.paper) { g.fillStyle = 'rgba(255,238,200,.6)'; g.fillRect(-w / 2 - 14, -h / 2 - 14, w + 28, h + 28); }
    g.shadowColor = 'rgba(20,28,40,.38)'; g.shadowBlur = 40; g.shadowOffsetY = 14; g.fillStyle = '#fff'; g.fillRect(-w / 2 - 3, -h / 2 - 3, w + 6, h + 6); g.shadowColor = 'transparent';
    g.drawImage(im, -w / 2, -h / 2, w, h); g.strokeStyle = 'rgba(20,24,30,.55)'; g.lineWidth = 2; g.strokeRect(-w / 2, -h / 2, w, h); g.restore(); }
}
const toScreen = (c, wx, wy) => [W / 2 + (wx - c.cx) * c.z, H / 2 + (wy - c.cy) * c.z];
function plate(x, y, w, h) { g.save(); g.fillStyle = 'rgba(14,15,17,.80)'; g.beginPath(); g.roundRect(x, y, w, h, 8); g.fill(); g.fillStyle = SIG; g.fillRect(x, y, 4, h); g.restore(); }
function reading(t, [t0, t1, lab, big, src, size]) {
  const a = Math.min(ease((t - t0) / 0.4), 1 - ease((t - (t1 - 0.4)) / 0.4)); if (a <= 0) return;
  g.save(); g.globalAlpha = a; g.textBaseline = 'alphabetic'; g.font = `700 ${size}px ${MONO}`; const bw = g.measureText(big).width; g.font = `700 22px ${MONO}`; const lw = g.measureText(lab).width;
  const w = Math.max(bw, lw, 300) + 90, h = size + 118 + (src ? 34 : 0), x = 70, y = 70 + (1 - a) * 10; plate(x, y, w, h, 1);
  g.fillStyle = '#9AA3AD'; g.font = `700 22px ${MONO}`; g.fillText(lab, x + 34, y + 44); g.fillStyle = '#F4F6F8'; g.font = `700 ${size}px ${MONO}`; g.fillText(big, x + 34, y + 52 + size);
  if (src) { g.fillStyle = '#9AA3AD'; g.font = `500 22px ${MONO}`; g.fillText(src, x + 34, y + 52 + size + 40); } g.restore();
}
function label(t, c, [t0, t1, id, u, v, text]) {
  const a = Math.min(ease((t - t0) / 0.5), 1 - ease((t - (t1 - 0.4)) / 0.4)); if (a <= 0) return; const o = OBJ[id], [wx, wy] = objPt(o, u, v), [sx, sy] = toScreen(c, wx, wy);
  const dy = 170, k = ease((t - t0) / 0.5); g.save(); g.globalAlpha = a; g.strokeStyle = SIG; g.lineWidth = 3; g.beginPath(); g.arc(sx, sy, 15, 0, 6.2832); g.stroke();
  g.beginPath(); g.moveTo(sx, sy - 15); g.lineTo(sx, sy - 15 - (dy - 15) * k); g.stroke();
  g.font = `700 36px ${MONO}`; const tw = g.measureText(text).width + 50, cr = CREDITS[o.k], sub = cr ? `${cr.author}, ${cr.license}` : ''; g.font = `500 22px ${MONO}`; const sw = sub ? g.measureText(sub).width + 50 : 0, pw = Math.max(tw, sw), ph = sub ? 104 : 70;
  const px = clamp(sx - pw / 2, 30, W - pw - 30), py = sy - dy - ph; plate(px, py, pw, ph, 1); g.fillStyle = '#F4F6F8'; g.font = `700 36px ${MONO}`; g.fillText(text, px + 26, py + 46); if (sub) { g.fillStyle = '#9AA3AD'; g.font = `500 22px ${MONO}`; g.fillText(sub, px + 26, py + 84); } g.restore();
}
function loupe(t, c, L) {
  if (t < L.t0 || t > L.t1 + 0.1) return; const land = ease((t - L.t0) / 0.4), lift = ease((L.t1 - t) / 0.5), p = Math.min(land, lift); if (p <= 0) return;
  const o = OBJ[L.o], [tx, ty] = objPt(o, L.u, L.v), [sx, sy] = toScreen(c, tx, ty), R = 250, sc = 1 + 0.3 * (1 - p), mag = 2.4;
  g.save(); g.globalAlpha = p; g.translate(sx, sy); g.scale(sc, sc); g.translate(-sx, -sy);
  g.save(); g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 50; g.shadowOffsetY = 30; g.fillStyle = '#000'; g.beginPath(); g.arc(sx, sy, R + 26, 0, 6.2832); g.fill(); g.restore();
  g.save(); g.beginPath(); g.arc(sx, sy, R, 0, 6.2832); g.clip(); g.save(); g.translate(sx, sy); g.scale(c.z * mag, c.z * mag); g.translate(-tx, -ty); table(); g.restore();
  g.save(); g.translate(sx, sy); g.scale(c.z * mag, c.z * mag); g.translate(-tx, -ty); objects(); g.restore(); g.restore();
  g.strokeStyle = '#0b0c0e'; g.lineWidth = 26; g.beginPath(); g.arc(sx, sy, R + 13, 0, 6.2832); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 3; g.beginPath(); g.arc(sx, sy, R + 20, 3.5, 4.8); g.stroke();
  g.strokeStyle = 'rgba(190,225,255,.28)'; g.lineWidth = 22; g.beginPath(); g.arc(sx, sy, R + 38, 0, 6.2832); g.stroke(); g.restore();
}
SCENES.table = {
  bg(st) {
    const t = st.t; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); table(); const c = cam(t);
    g.save(); g.translate(W / 2, H / 2); g.scale(c.z, c.z); g.translate(-c.cx, -c.cy); objects(); g.restore();
    LABELS.forEach((l) => label(t, c, l)); LOUPES.forEach((l) => loupe(t, c, l)); READS.forEach((r) => reading(t, r));
    const vg = g.createRadialGradient(W / 2, H / 2, 480, W / 2, H / 2, 1250); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(10,14,20,.38)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
    g.restore();
  },
};
