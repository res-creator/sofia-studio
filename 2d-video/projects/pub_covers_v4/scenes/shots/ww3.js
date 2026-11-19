// Обложка v4 «Третья мировая»: бункер 1983 года в тревоге, дежурный офицер (PETROV из фильма) крупно,
// на стене-карте 5 отметок «ракет» в красном круге, рука над красной кнопкой.
import { person, box, ell, line, light, hand, C } from '/projects/ww3toon/scenes/toon.js';
import * as CA from '/projects/ww3toon/scenes/cast.js';
import { SETS } from '/projects/ww3toon/scenes/templates/sets.js';
import '/projects/ww3toon/scenes/templates/ww3sets.js';
import { BIG, TAG, redCircle, particles, glow, darken, tint, topShade, bigEyes, reg, fakeInfo } from '../_lib.js';

function ww3(g) {
  const t = 1.0, info = fakeInfo('ww3');
  SETS.bunker(g, t, { lamp: false, mapO: { land: '#1f5a36' } }, info);
  tint(g, 'rgba(125,140,200,1)');
  // 5 отметок над США, хвосты к северу
  const blips = [[625, 470], [672, 432], [720, 462], [768, 424], [812, 455]];
  blips.forEach(([x, y], i) => { line(g, [[x, y], [x + 26, y - 46]], 6, 'rgba(255,80,60,.55)'); glow(g, x, y, 46, '255,60,40', 0.8); ell(g, x, y, 14, 14, '#ff4a3a', 4); ell(g, x, y, 5, 5, '#fff', 0); });
  const cx = blips.reduce((a, b) => a + b[0], 0) / 5, cy = blips.reduce((a, b) => a + b[1], 0) / 5;
  // тревога: красный свет с потолка
  glow(g, 1000, 0, 900, '255,40,30', 0.35);
  // большая красная кнопка на пульте (тёплый фокус)
  const bx = 880, by = 690; glow(g, bx, by - 20, 420, '255,120,60', 0.55);
  box(g, bx - 110, by - 6, 220, 46, '#3a3a40', { r: 10, lw: 5 }); ell(g, bx, by - 6, 92, 34, '#7a1410', 5); g.save(); g.beginPath(); g.ellipse(bx, by - 26, 80, 46, 0, Math.PI, 0); g.closePath(); const gr = g.createLinearGradient(0, by - 72, 0, by - 20); gr.addColorStop(0, '#ff6a50'); gr.addColorStop(1, '#c81e14'); g.fillStyle = gr; g.fill(); g.lineWidth = 5; g.strokeStyle = '#2a2321'; g.stroke(); g.restore(); ell(g, bx - 26, by - 52, 18, 8, 'rgba(255,255,255,.55)', 0);
  // офицер
  const o = { ...CA.PETROV, x: 330, y: 1500, s: 3.6, t, expr: 'shock', look: 0.55, sweat: false, pose: { l: [0.18, 0.15], r: [2.05, 0.35] } };
  person(g, o); bigEyes(g, o, { sweat: 3, lookY: 0.3 });
  glow(g, 560, 700, 380, '255,90,60', 0.25);
  redCircle(g, cx + 6, cy - 10, 150, 88, -0.08);
  particles(g, 70, 4, '255,200,180', [0, 0, 1920, 1080], 3, 0.35);
  darken(g, 0.4);
  topShade(g, 560, 0.6);
  TAG(g, '3 МИРОВАЯ', 1870, 30, 88, '#e2283a', '#ffffff', { align: 'right' });
  BIG(g, '5 РАКЕТ.', 1860, 345, 225, '#ffffff', { align: 'right', maxW: 900 });
  BIG(g, 'НЕ ВЕРЬ ЭКРАНУ', 1860, 495, 128, '#ffd43b', { align: 'right', maxW: 960 });
}
reg({ ww3 });
