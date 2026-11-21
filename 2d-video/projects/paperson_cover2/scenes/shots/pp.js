// Обложка «Бумажные сыновья» в стиле опубликованных обложек v4: ночной барак на острове, «ты» (мальчик 1925 года) крупно, испуган;
// за столом под лампой инспектор держит бумагу «ОТЕЦ» с силуэтом незнакомого человека, красный круг вокруг бумаги.
import { person, box, ell, line, hand, poly } from '/projects/nkorea/scenes/toon.js';
import { barrack } from '/projects/paperson/scenes/lib/pp_sets.js';
import { BIG, TAG, redCircle, particles, glow, darken, tint, topShade, bigEyes, reg } from '../_lib.js';

const S = { pale: '#f1d3ad', light: '#ecc79b' };
const BOY = { skin: S.light, body: 'tunic', col: '#6a7f94', col2: '#3a4655', hair: { s: 'short', c: '#141414' }, seed: 701 };
const INSPECTOR = { skin: S.pale, body: 'suit', col: '#2a3a5a', col2: '#1c2438', tie: '#8a2a2a', hair: { s: 'side', c: '#3a2a20' }, glasses: true, seed: 702 };

function paper(g, x, y, s = 1, rot = -0.07) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  box(g, -150, -130, 300, 260, '#f2ead6', { r: 6 });
  line(g, [[-110, -90], [110, -90]], 6, 'rgba(40,40,50,.4)'); line(g, [[-110, -60], [60, -60]], 6, 'rgba(40,40,50,.35)');
  ell(g, -70, 10, 38, 38, '#9aa0aa', { lw: 3 }); poly(g, [[-120, 90], [-70, 40], [-20, 90]], '#9aa0aa', 3);   // силуэт незнакомого человека
  hand(g, 'ОТЕЦ', 60, 30, { size: 64, color: '#2a2a33' });
  g.save(); g.translate(50, 85); g.rotate(-0.15); g.strokeStyle = '#d8281e'; g.lineWidth = 6; g.strokeRect(-85, -26, 170, 52); hand(g, 'ПО БУМАГАМ', 0, 2, { size: 30, color: '#d8281e' }); g.restore();
  g.restore();
}
function pp(g) {
  const t = 1.0;
  barrack(g, t, { dim: 0 });
  tint(g, 'rgba(70,86,150,1)');
  particles(g, 140, 7, '235,240,255', [0, 0, 1920, 1080], 3.5, 0.5);
  // стол инспектора и лампа
  const lx = 1180, ly = 880;
  glow(g, lx + 120, ly, 720, '255,170,80', 0.7);
  person(g, { ...INSPECTOR, x: 1610, y: 1075, s: 1.75, t, pose: 'hold', expr: 'neutral', look: -0.6, face: -1 });
  box(g, 1120, 930, 820, 60, '#5a3a22', { r: 6 }); box(g, 1140, 990, 780, 140, '#3a2616', { r: 4 });
  line(g, [[lx, 930], [lx + 20, 790], [lx + 90, 760]], 10, '#2a2a2a'); poly(g, [[lx + 50, 730], [lx + 150, 740], [lx + 170, 800], [lx + 40, 790]], '#3a5a3a', 5); glow(g, lx + 110, 820, 260, '255,220,150', 0.8);
  paper(g, 1460, 860, 1.05, -0.07);
  glow(g, 1450, 860, 300, '255,200,120', 0.25);
  redCircle(g, 1460, 858, 215, 165, -0.1);
  // «ты»
  const o = { ...BOY, x: 400, y: 650 + 240 * 3.6, s: 3.6, t, expr: 'worried', look: 0.7 };
  person(g, o); bigEyes(g, o, { wet: true, sweat: 2, shrink: false });
  glow(g, 640, 650, 420, '255,170,90', 0.28);
  darken(g, 0.26);
  topShade(g, 420, 0.6);
  TAG(g, 'КИТАЙЦЫ В США', 36, 22, 84, '#e2283a', '#ffffff');
  BIG(g, 'ТЕБЕ ВЫДАЛИ ОТЦА', 1880, 240, 140, '#ffffff', { align: 'right', maxW: 1220 });
  BIG(g, 'ПО БУМАГАМ', 1880, 385, 140, '#ffd43b', { align: 'right', maxW: 1100 });
}
reg({ pp });
