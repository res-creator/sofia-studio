// Обложка v4 «Северная Корея»: ночной квартал, все окна тёмные кроме одного; «ты» (YOU_PIONEER) крупно, испуган;
// за столом под лампой чиновник (CLERK) держит серую папку с красным штампом, красный круг вокруг папки.
import { person, box, ell, line, hand, poly } from '/projects/nkorea/scenes/toon.js';
import * as CA from '/projects/nkorea/scenes/cast.js';
import { SETS } from '/projects/nkorea/scenes/templates/sets.js';
import '/projects/nkorea/scenes/templates/nksets.js';
import { BIG, TAG, redCircle, particles, glow, darken, tint, topShade, bigEyes, reg } from '../_lib.js';

function folder(g, x, y, s = 1, rot = -0.06) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  box(g, -150, -130, 110, 40, '#8a8f98', { r: 8 }); box(g, -150, -110, 300, 220, '#9aa0aa', { r: 8 });
  hand(g, 'ДЕЛО', -40, -60, { size: 56, color: '#2a2a33' }); for (let i = 0; i < 2; i++) line(g, [[-110, -10 + i * 34], [100 - i * 40, -10 + i * 34]], 5, 'rgba(40,40,50,.35)');
  g.save(); g.translate(60, 60); g.rotate(-0.2); box(g, -90, -28, 180, 56, null, { r: 6, lw: 6, grad: false }); g.strokeStyle = '#d8281e'; g.lineWidth = 6; g.strokeRect(-90, -28, 180, 56); hand(g, 'СЕКРЕТНО', 0, 2, { size: 40, color: '#d8281e' }); g.restore();
  g.restore();
}
function nk(g) {
  const t = 1.0;
  SETS.nktown(g, t, { night: true, lit: 0, board: false });
  tint(g, 'rgba(80,95,160,1)');
  // одно тусклое окно
  const wx = 1104, wy = 604; box(g, wx, wy, 49, 44, '#c8a050', { r: 2, lw: 3 }); glow(g, wx + 25, wy + 22, 90, '255,190,90', 0.45);
  particles(g, 140, 7, '235,240,255', [0, 0, 1920, 1080], 3.5, 0.55);
  // стол чиновника и лампа (тёплый фокус)
  const lx = 1180, ly = 880;
  glow(g, lx + 120, ly, 620, '255,170,80', 0.6);
  person(g, { ...CA.CLERK, x: 1610, y: 1075, s: 1.75, t, pose: 'hold', expr: 'neutral', look: -0.6, face: -1 });
  box(g, 1120, 930, 820, 60, '#5a3a22', { r: 6 }); box(g, 1140, 990, 780, 140, '#3a2616', { r: 4 });
  // лампа
  line(g, [[lx, 930], [lx + 20, 790], [lx + 90, 760]], 10, '#2a2a2a'); poly(g, [[lx + 50, 730], [lx + 150, 740], [lx + 170, 800], [lx + 40, 790]], '#3a5a3a', 5); glow(g, lx + 110, 820, 260, '255,220,150', 0.8);
  folder(g, 1460, 860, 1.05, -0.08);
  glow(g, 1450, 860, 300, '255,200,120', 0.25);
  redCircle(g, 1460, 858, 215, 160, -0.1);
  // «ты»
  const o = { ...CA.YOU_PIONEER, x: 400, y: 650 + 240 * 3.6, s: 3.6, t, expr: 'worried', look: 0.7 };
  person(g, o); bigEyes(g, o, { wet: true, sweat: 2, shrink: false });
  glow(g, 640, 650, 360, '255,170,90', 0.2);
  darken(g, 0.5);
  topShade(g, 420, 0.6);
  TAG(g, 'СЕВЕРНАЯ КОРЕЯ', 36, 22, 84, '#e2283a', '#ffffff');
  BIG(g, 'НА ТЕБЯ ЕСТЬ ПАПКА', 1880, 240, 140, '#ffffff', { align: 'right', maxW: 1220 });
  BIG(g, 'ТЫ ЕЁ НЕ УВИДИШЬ', 1880, 385, 120, '#ffd43b', { align: 'right', maxW: 1100 });
}
reg({ nk });
