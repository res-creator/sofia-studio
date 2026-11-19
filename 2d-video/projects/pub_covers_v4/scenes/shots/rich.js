// Обложка v4 «Самый богатый человек в истории»: ночное хранилище, открытая круглая дверь сейфа, внутри светится золото;
// на вершине кучи — тёмный силуэт рыцаря (ALAN, Алан Рыжий из фильма) в красном круге; KID из фильма крупно, в шоке.
import { person, box, ell, line, goldBar, coin, C } from '/projects/richest2/scenes/toon.js';
import * as CA from '/projects/richest2/scenes/cast.js';
import { BIG, particles, glow, darken, topShade, bigEyes, redCircle, reg } from '../_lib.js';

const SIL = '#15121c';
function rich(g) {
  const t = 1.0;
  let gr = g.createLinearGradient(0, 0, 0, 1080); gr.addColorStop(0, '#070b1a'); gr.addColorStop(1, '#141c38'); g.fillStyle = gr; g.fillRect(0, 0, 1920, 1080);
  // стальные панели стены
  for (let i = 0; i < 8; i++) box(g, -40 + i * 260, 120, 240, 760, '#1a2240', { r: 6, lw: 4, sh: 0.2 });
  for (let i = 0; i < 8; i++) for (let j = 0; j < 4; j++) ell(g, -10 + i * 260, 150 + j * 230, 6, 6, '#2a3458', 2);
  g.fillStyle = '#0d1226'; g.fillRect(0, 880, 1920, 200); line(g, [[0, 880], [1920, 880]], 5);
  // проём сейфа
  const vx = 1270, vy = 690, R = 330;
  ell(g, vx, vy, R + 46, R + 46, '#3a4466', 8);
  g.save(); g.beginPath(); g.arc(vx, vy, R, 0, Math.PI * 2); g.clip();
  gr = g.createRadialGradient(vx, vy - 60, 20, vx, vy, R); gr.addColorStop(0, '#fff2b0'); gr.addColorStop(0.5, '#f2b83a'); gr.addColorStop(1, '#8a4a10'); g.fillStyle = gr; g.fillRect(vx - R, vy - R, R * 2, R * 2);
  for (let row = 0; row < 9; row++) { const n = 9 - row; for (let k = 0; k < n; k++) goldBar(g, vx - (n - 1) * 46 + k * 92, vy + R - 10 - row * 34, 96); }
  for (let i = 0; i < 18; i++) coin(g, vx - 250 + ((i * 137) % 500), vy + 120 + ((i * 53) % 160), 20);
  g.restore();
  g.beginPath(); g.arc(vx, vy, R, 0, Math.PI * 2); g.lineWidth = 10; g.strokeStyle = '#2a2321'; g.stroke();
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; ell(g, vx + Math.cos(a) * (R + 24), vy + Math.sin(a) * (R + 24), 9, 9, '#8a92b0', 3); }
  // открытая створка двери сейфа (слева, в перспективе)
  g.save(); g.translate(vx - R - 120, vy); g.scale(0.32, 1); ell(g, 0, 0, R + 30, R + 30, '#5a6488', 8); ell(g, 0, 0, R - 40, R - 40, '#4a5478', 6); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; line(g, [[0, 0], [Math.cos(a) * 150, Math.sin(a) * 150]], 16, '#8a92b0'); } ell(g, 0, 0, 60, 60, '#9aa2c0', 6); g.restore();
  glow(g, vx, vy, 900, '255,190,80', 0.5); glow(g, vx, vy - 40, 380, '255,230,160', 0.5);
  // силуэт рыцаря на вершине золота
  person(g, { ...CA.ALAN, skin: SIL, col: SIL, col2: SIL, beardCol: SIL, hair: { s: 'none', c: SIL }, shoe: SIL, x: vx, y: vy + R - 10 - 9 * 34 + 14, s: 0.92, t: 0.4, expr: 'neutral', pose: 'hips' });
  redCircle(g, vx + 4, vy - 40, 150, 210, -0.06);
  particles(g, 90, 9, '255,220,140', [900, 300, 1700, 1050], 4, 0.6);
  // ребёнок из фильма
  const o = { ...CA.KID, x: 380, y: 660 + 240 * 3.7, s: 3.7, t, expr: 'shock', look: 0.8 };
  person(g, o); bigEyes(g, o, { sweat: 3, lookY: -0.1 });
  glow(g, 620, 640, 420, '255,180,80', 0.3);
  darken(g, 0.45);
  topShade(g, 420, 0.55);
  BIG(g, 'БОГАЧЕ МАСКА?', 1880, 210, 190, '#ffffff', { align: 'right', maxW: 1300 });
  BIG(g, 'ЖИЛ 900 ЛЕТ НАЗАД', 1880, 345, 112, '#ffd43b', { align: 'right', maxW: 1100 });
}
reg({ rich });
