// Информационный разбор «Сколько протянешь на необитаемом острове»: нарисованный остров, шкалы и правило трёх.
import { W, H, g, clamp, lerp, ease, SCENES, setCaptionStyle } from './engine.js';
import { MONO, win, plate } from './doc_common.js';
setCaptionStyle('strip');
const ACC = '#FF5A1F';
function sky(t) { const gr = g.createLinearGradient(0, 0, 0, 640); gr.addColorStop(0, '#16273a'); gr.addColorStop(0.55, '#476b80'); gr.addColorStop(1, '#d9b98a'); g.fillStyle = gr; g.fillRect(0, 0, W, 640);
  const sy = 560 - ease(clamp(t / 40)) * 120; g.fillStyle = 'rgba(255,224,160,.25)'; g.beginPath(); g.arc(1500, sy, 150, 0, 6.2832); g.fill(); g.fillStyle = '#f2d391'; g.beginPath(); g.arc(1500, sy, 62, 0, 6.2832); g.fill(); }
function sea(t) { const gr = g.createLinearGradient(0, 560, 0, H); gr.addColorStop(0, '#2d5568'); gr.addColorStop(1, '#14303f'); g.fillStyle = gr; g.fillRect(0, 560, W, H - 560);
  g.strokeStyle = 'rgba(210,235,245,.16)'; g.lineWidth = 3; for (let r = 0; r < 7; r++) { const y = 600 + r * 55; g.beginPath(); for (let x = -40; x < W + 40; x += 24) { const yy = y + Math.sin(x * 0.02 + t * 1.2 + r) * (3 + r); x === -40 ? g.moveTo(x, yy) : g.lineTo(x, yy); } g.stroke(); } }
function island() { g.fillStyle = '#b79f74'; g.beginPath(); g.moveTo(180, 800); g.bezierCurveTo(420, 690, 900, 660, 1180, 700); g.bezierCurveTo(1500, 740, 1700, 770, 1800, 820); g.lineTo(1800, 1080); g.lineTo(180, 1080); g.closePath(); g.fill();
  g.fillStyle = '#cdb68a'; g.beginPath(); g.moveTo(180, 830); g.bezierCurveTo(460, 730, 900, 700, 1180, 740); g.bezierCurveTo(1500, 775, 1700, 800, 1800, 850); g.lineTo(1800, 1080); g.lineTo(180, 1080); g.closePath(); g.fill();
  const palm = (x, y, s, lean) => { g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = '#4a3b2a'; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(lean * 0.6, -150, lean, -280); g.stroke(); g.fillStyle = '#2f5d4a';
    for (let i = 0; i < 7; i++) { const a = -2.9 + i * 0.5; g.save(); g.translate(lean, -280); g.rotate(a); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(70, -26, 150, 12); g.quadraticCurveTo(70, 8, 0, 0); g.fill(); g.restore(); } g.restore(); };
  palm(1280, 760, 1.15, 60); palm(1420, 790, 0.9, -40); palm(300, 860, 1.0, 40); }
function person(x, y, lying, k = 1) { g.save(); g.translate(x, y); g.scale(k, k); if (lying) g.rotate(-Math.PI / 2 + 0.05); g.fillStyle = '#161c23'; g.strokeStyle = '#161c23'; g.lineCap = 'round'; g.lineWidth = 15;
  g.beginPath(); g.arc(0, -150, 22, 0, 6.2832); g.fill(); g.beginPath(); g.roundRect(-22, -125, 44, 80, 16); g.fill(); g.beginPath(); g.moveTo(-10, -48); g.lineTo(-14, 0); g.moveTo(10, -48); g.lineTo(14, 0); g.moveTo(-22, -112); g.lineTo(-34, -60); g.moveTo(22, -112); g.lineTo(34, -60); g.stroke(); g.restore(); }
function dayChip(t) { const a = win(t, 1.4, 8.4, 0.4); if (a <= 0) return; g.save(); g.globalAlpha = a; plate(70, 70, 300, 110, ACC); g.fillStyle = '#9AA3AD'; g.font = `700 22px ${MONO}`; g.fillText('ОСТРОВ', 104, 112); g.fillStyle = '#F4F6F8'; g.font = `700 54px ${MONO}`; g.fillText('ДЕНЬ 1', 104, 164); g.restore(); }
const ROWS = [[11.0, 'ВОЗДУХ', '3 МИНУТЫ', 0.06, 'air'], [14.5, 'УКРЫТИЕ', '3 ЧАСА', 0.47, 'roof'], [18.4, 'ВОДА', '3 ДНЯ', 0.79, 'drop'], [20.7, 'ЕДА', '3 НЕДЕЛИ', 1.0, 'fish']];
function icon(kind, x, y) { g.save(); g.translate(x, y); g.strokeStyle = '#F4F6F8'; g.fillStyle = '#F4F6F8'; g.lineWidth = 5; g.lineCap = 'round';
  if (kind === 'air') { for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-26, -14 + i * 14); g.bezierCurveTo(-6, -22 + i * 14, 6, -6 + i * 14, 26, -14 + i * 14); g.stroke(); } }
  if (kind === 'roof') { g.beginPath(); g.moveTo(-28, 10); g.lineTo(0, -22); g.lineTo(28, 10); g.stroke(); g.beginPath(); g.moveTo(-18, 10); g.lineTo(-18, 26); g.moveTo(18, 10); g.lineTo(18, 26); g.stroke(); }
  if (kind === 'drop') { g.beginPath(); g.moveTo(0, -28); g.bezierCurveTo(24, 0, 24, 26, 0, 26); g.bezierCurveTo(-24, 26, -24, 0, 0, -28); g.fill(); }
  if (kind === 'fish') { g.beginPath(); g.ellipse(-2, 0, 24, 13, 0, 0, 6.2832); g.stroke(); g.beginPath(); g.moveTo(20, 0); g.lineTo(34, -12); g.lineTo(34, 12); g.closePath(); g.fill(); }
  g.restore(); }
function rule(t) { const a = win(t, 8.6, 22.9, 0.5); if (a <= 0) return; g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(8,14,20,.62)'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#F4F6F8'; g.font = `700 52px ${MONO}`; g.fillText('ПРАВИЛО ТРЁХ', 160, 190); g.fillStyle = ACC; g.fillRect(160, 212, 360, 4);
  ROWS.forEach(([at, lab, time, frac, ic], i) => { const k = ease((t - at) / 0.5); if (k <= 0) return; const y = 330 + i * 150; g.save(); g.globalAlpha = a * k; icon(ic, 200, y - 10); g.fillStyle = '#9AA3AD'; g.font = `700 26px ${MONO}`; g.fillText(lab, 270, y - 24);
    g.fillStyle = '#F4F6F8'; g.font = `700 52px ${MONO}`; g.fillText(time, 270, y + 28); g.fillStyle = 'rgba(244,246,248,.12)'; g.fillRect(760, y - 18, 1000, 26); g.fillStyle = i < 2 ? '#E4572E' : '#3FA7D6'; g.fillRect(760, y - 18, 1000 * frac * ease((t - at) / 1.2), 26); g.restore(); }); g.restore(); }
function order(t) { const a = win(t, 23.0, 32.5, 0.5); if (a <= 0) return; g.save(); g.globalAlpha = a; plate(70, 70, 760, 110, ACC); g.fillStyle = '#F4F6F8'; g.font = `700 40px ${MONO}`; g.fillText('ОРИЕНТИРЫ, А НЕ ТОЧНЫЕ СРОКИ', 104, 138); g.restore();
  [[28.3, '1  ВОДА'], [29.8, '2  ТЕНЬ'], [31.2, '3  ЕДА']].forEach(([at, txt], i) => { const k = ease((t - at) / 0.4); if (k <= 0) return; g.save(); g.globalAlpha = a * k; plate(70, 210 + i * 96, 360, 76, i === 2 ? '#3FA7D6' : ACC); g.fillStyle = '#F4F6F8'; g.font = `700 40px ${MONO}`; g.fillText(txt, 104, 262 + i * 96); g.restore(); }); }
function clock(t) { const a = win(t, 32.6, 38.2, 0.5); if (a <= 0) return; g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(8,14,20,.55)'; g.fillRect(0, 0, W, H); const cx = 960, cy = 470, r = 190; g.strokeStyle = 'rgba(244,246,248,.25)'; g.lineWidth = 16; g.beginPath(); g.arc(cx, cy, r, 0, 6.2832); g.stroke();
  const k = ease((t - 32.9) / 3.8); g.strokeStyle = ACC; g.beginPath(); g.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + k * 6.2832); g.stroke(); g.fillStyle = '#F4F6F8'; g.textAlign = 'center'; g.font = `700 120px ${MONO}`; g.fillText('12', cx, cy + 30); g.font = `700 40px ${MONO}`; g.fillText('ПЕРВЫХ ЧАСОВ', cx, cy + 90); g.textAlign = 'left'; g.restore(); }
SCENES.island = {
  bg(st) { const t = st.t; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.save(); const z = 1 + 0.06 * clamp(t / 38); g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-W / 2, -H / 2); sky(t); sea(t); island();
    const stand = t > 4.6; person(stand ? 760 : 700, stand ? 880 : 905, !stand, 1.5 + (stand ? 0.1 * ease((t - 4.6) / 1) : 0)); g.restore();
    dayChip(t); rule(t); order(t); clock(t);
    const vg = g.createRadialGradient(W / 2, H / 2, 480, W / 2, H / 2, 1250); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(4,8,14,.5)'); g.fillStyle = vg; g.fillRect(0, 0, W, H); g.restore(); },
};
