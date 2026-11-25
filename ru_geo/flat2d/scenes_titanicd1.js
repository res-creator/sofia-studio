// Вариант 1: «реконструкция»: тёмно-синий фон, фото в рамке слева, шкала времени и схема справа.
import { W, H, g, clamp, lerp, ease, SCENES, CREDITS, setCaptionStyle } from './engine.js';
import { MONO, win, photoCover, credit, vignette, plate } from './doc_common.js';
setCaptionStyle('strip');
const PH = [[0.5, 9.4, 'wireless'], [10.3, 19.6, 'cal'], [19.6, 25.3, 'wireless'], [25.5, 29.3, 'iceberg'], [29.3, 32.6, 'iceberg2']];
const NODES = [[0.7, 'в течение дня', 'ледовые предупреждения'], [13.2, '≈ 23:30', '«Калифорниан»: радист выключает аппарат'], [25.5, '23:40', 'вперёдсмотрящий замечает айсберг'], [27.7, '< 1 минуты', 'скользящий удар']];
function map(t) { const x = 1270, y = 700, w = 560, h = 260; plate(x, y, w, h, '#3FA7D6'); g.save(); g.beginPath(); g.rect(x + 5, y, w - 5, h); g.clip();
  g.strokeStyle = 'rgba(120,170,220,.12)'; g.lineWidth = 1; for (let i = 0; i < 12; i++) { g.beginPath(); g.moveTo(x + 5 + i * 50, y); g.lineTo(x + 5 + i * 50, y + h); g.stroke(); } for (let j = 0; j < 6; j++) { g.beginPath(); g.moveTo(x, y + j * 50); g.lineTo(x + w, y + j * 50); g.stroke(); }
  const sx = x + 120 + clamp((t - 0.5) / 31) * 200, sy = y + 150; g.fillStyle = '#F4F6F8'; g.beginPath(); g.arc(sx, sy, 9, 0, 6.2832); g.fill(); g.fillStyle = '#9AA3AD'; g.font = `700 18px ${MONO}`; g.fillText('«Титаник»', sx - 40, sy + 34);
  g.strokeStyle = 'rgba(244,246,248,.55)'; g.lineWidth = 2; g.setLineDash([8, 8]); g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + 160, sy); g.stroke(); g.setLineDash([]);
  const a = win(t, 10.8, 32, 0.5); if (a > 0) { g.globalAlpha = a; const cx = x + 400, cy = y + 80; g.fillStyle = '#FFB000'; g.beginPath(); g.arc(cx, cy, 8, 0, 6.2832); g.fill(); g.fillStyle = '#FFB000'; g.fillText('«Калифорниан»', cx - 70, cy - 18); g.strokeStyle = 'rgba(255,176,0,.6)'; g.setLineDash([4, 6]); g.beginPath(); g.moveTo(sx, sy); g.lineTo(cx, cy); g.stroke(); g.setLineDash([]); g.fillStyle = '#9AA3AD'; g.font = `500 16px ${MONO}`; g.fillText('расстояние: предмет спора', cx - 210, cy + 120); g.globalAlpha = 1; }
  const b = win(t, 25.5, 32.6, 0.4); if (b > 0) { g.globalAlpha = b; const ix = sx + 130, iy = sy; g.fillStyle = '#9fd4ff'; g.beginPath(); g.moveTo(ix - 18, iy + 14); g.lineTo(ix, iy - 22); g.lineTo(ix + 18, iy + 14); g.closePath(); g.fill(); g.globalAlpha = 1; }
  g.restore(); }
SCENES.docv1 = {
  bg(st) {
    const t = st.t; g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0a1624'); gr.addColorStop(1, '#10263a'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(120,170,220,.06)'; g.lineWidth = 1; for (let i = 0; i < W; i += 60) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, H); g.stroke(); } for (let j = 0; j < H; j += 60) { g.beginPath(); g.moveTo(0, j); g.lineTo(W, j); g.stroke(); }
    const X = 80, Y = 100, PW = 1100, PHh = 700; for (const [a, b, key] of PH) { const al = win(t, a, b, 0.5); if (al <= 0) continue; g.globalAlpha = al; photoCover(key, X, Y, PW, PHh, clamp((t - a) / (b - a)), { px: 40, py: 20 }); g.fillStyle = 'rgba(18,60,100,.16)'; g.fillRect(X, Y, PW, PHh); g.globalAlpha = 1; g.font = `500 20px ${MONO}`; g.fillStyle = '#9AA3AD'; g.globalAlpha = al; g.fillText(credit(key), X, Y + PHh + 36); g.globalAlpha = 1; }
    g.strokeStyle = '#3FA7D6'; g.lineWidth = 2; g.strokeRect(X, Y, PW, PHh); for (const [cx, cy, dx, dy] of [[X, Y, 1, 1], [X + PW, Y, -1, 1], [X, Y + PHh, 1, -1], [X + PW, Y + PHh, -1, -1]]) { g.lineWidth = 5; g.beginPath(); g.moveTo(cx, cy + dy * 34); g.lineTo(cx, cy); g.lineTo(cx + dx * 34, cy); g.stroke(); }
    g.fillStyle = '#F4F6F8'; g.font = `700 34px ${MONO}`; g.fillText('14 АПРЕЛЯ 1912', 1260, 140); g.fillStyle = '#3FA7D6'; g.fillRect(1260, 160, 560, 3);
    let y = 230; g.strokeStyle = 'rgba(63,167,214,.5)'; g.lineWidth = 3; g.beginPath(); g.moveTo(1285, 210); g.lineTo(1285, 640); g.stroke();
    for (const [a, time, text] of NODES) { const k = ease((t - a) / 0.5); if (k <= 0) { y += 105; continue; } g.save(); g.globalAlpha = k; g.fillStyle = '#FF5A1F'; g.beginPath(); g.arc(1285, y - 10, 10, 0, 6.2832); g.fill(); g.fillStyle = '#F4F6F8'; g.font = `700 36px ${MONO}`; g.fillText(time, 1320, y); g.fillStyle = '#9AA3AD'; g.font = `500 22px ${MONO}`; const words = text.split(' '); let line = '', yy = y + 32; for (const w of words) { const tt = (line + ' ' + w).trim(); if (g.measureText(tt).width > 480 && line) { g.fillText(line, 1320, yy); yy += 28; line = w; } else line = tt; } g.fillText(line, 1320, yy); g.restore(); y += 105; }
    map(t); vignette(0.35); g.restore();
  },
};
