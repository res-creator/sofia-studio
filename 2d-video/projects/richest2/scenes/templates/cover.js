// cover.js — обложка (рендерится отдельным проектом richest2_cover)
import { E } from '/engine/core.js';
import { tpl } from './_registry.js';
import * as T from '../toon.js';
import { person, tag, hand, light, finish, C, OL, goldBar } from '../toon.js';
import * as CA from '../cast.js';
import { SETS } from './sets.js';
tpl('cover', 'Thumbnail', { draw(g, t, info) {
  SETS.podium(g, 0, { title: '' });
  for (let i = 0; i < 17; i++) for (let j = -1; j <= 1; j++) goldBar(g, 430 + j * 74 + (i % 2) * 37 - 18, 1080 - i * 34, 90);
  light(g, 430, 400, 500, '#ffe08a', 0.5);
  person(g, { ...CA.MUSA, x: 430, y: 1080 - 17 * 34 + 10, s: 1.0, t: 1.3, pose: 'cheer', expr: 'grin' });
  g.save(); g.translate(1350, 930); T.box(g, -170, -230, 340, 230, '#c9a14a', { r: 8 }); hand(g, '1', 0, -110, { size: 170, color: '#fff' }); g.restore();
  person(g, { ...CA.MODERN, skin: '#1e1a26', col: '#1e1a26', col2: '#1e1a26', hair: { s: 'short', c: '#1e1a26' }, x: 1350, y: 700, s: 1.25, t: 0.5, expr: 'neutral' });
  hand(g, '?', 1350, 260, { size: 300, color: '#ffd43b' });
  tag(g, '$400 млрд', 470, 95, 1, { size: 84, bg: '#ffd43b', noPop: true }); T.line(g, [[290, 130], [650, 60]], 14, C.red);
  g.save(); g.lineWidth = 18; g.strokeStyle = OL; g.lineJoin = 'round'; g.font = `700 150px "${T.HAND}"`; g.textAlign = 'center'; g.strokeText('Кто богаче всех?', 1240, 1000); g.fillStyle = '#fff'; g.fillText('Кто богаче всех?', 1240, 1000); g.restore();
  finish(g, { vig: 0.3, grain: 0.04 });
} });

// ---------------------------------------------------------------- обложки для A/B теста (ноябрь 2026)
const BIGT = (g, s, x, y, size, fill = '#fff', stroke = OL, rot = -0.03) => { g.save(); g.translate(x, y); g.rotate(rot); g.lineWidth = size * 0.14; g.strokeStyle = stroke; g.lineJoin = 'round'; g.font = `700 ${size}px "${T.HAND}"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.strokeText(s, 0, 0); g.fillStyle = fill; g.fillText(s, 0, 0); g.restore(); };
const rays = (g, x, y, col, a) => { g.save(); g.translate(x, y); g.globalAlpha = a; g.fillStyle = col; for (let i = 0; i < 18; i++) { g.rotate(Math.PI / 9); g.beginPath(); g.moveTo(0, 0); g.lineTo(1600, -90); g.lineTo(1600, 90); g.closePath(); g.fill(); } g.restore(); };
const pile = (g, cx, base, w, h) => { const R = (n) => (Math.sin(n * 12.9898) * 43758.5453) % 1; for (let row = 0; row < h / 30; row++) { const ww = w * (1 - row * 30 / h); for (let x = -ww / 2; x < ww / 2; x += 70) T.goldBar(g, cx + x + (row % 2) * 35, base - row * 30, 86); } for (let i = 0; i < 40; i++) { const k = Math.abs(R(i + 1)); const x = cx + (Math.abs(R(i + 7)) - 0.5) * w * (1 - k), y = base - k * h + 10; T.coin(g, x, y, 22); } };
tpl('coverA', 'Thumb A: king on gold, «БОГАЧЕ МАСКА»', { draw(g) {
  const bg = g.createLinearGradient(0, 0, 0, 1080); bg.addColorStop(0, '#ffb43a'); bg.addColorStop(1, '#d93a2a'); g.fillStyle = bg; g.fillRect(0, 0, 1920, 1080); rays(g, 640, 380, '#fff3b0', 0.18);
  pile(g, 640, 1120, 1400, 420); light(g, 640, 420, 620, '#ffe08a', 0.55);
  person(g, { ...CA.MUSA, x: 640, y: 830, s: 2.05, t: 1.3, pose: 'cheer', expr: 'grin' });
  for (const [x, y, r] of [[200, 220, 30], [1080, 180, 26], [330, 470, 22], [960, 420, 24], [120, 640, 20]]) T.coin(g, x, y, r);
  person(g, { ...CA.MODERN, x: 1460, y: 1040, s: 0.75, t: 0.4, expr: 'shock', look: -1, face: -1 });
  BIGT(g, 'БОГАЧЕ', 1450, 250, 210); BIGT(g, 'МАСКА', 1450, 470, 230, '#ffe14a');
  finish(g, { vig: 0.25, grain: 0.03 });
} });
tpl('coverB', 'Thumb B: small billionaire vs mountain of gold', { draw(g) {
  g.fillStyle = '#f2e6cc'; g.fillRect(0, 0, 1920, 1080); g.strokeStyle = 'rgba(120,90,50,.12)'; g.lineWidth = 3; for (let y = 60; y < 1080; y += 70) { g.beginPath(); g.moveTo(0, y); g.lineTo(1920, y); g.stroke(); }
  g.fillStyle = '#ffd43b'; g.save(); g.translate(960, 130); g.rotate(-0.02); g.fillRect(-760, -95, 1520, 170); g.restore(); BIGT(g, 'ОН БЫЛ БОГАЧЕ ВСЕХ', 960, 125, 150, OL, 'rgba(0,0,0,0)', -0.02);
  T.sack(g, 330, 1000, 1.3, '#7fae5a', '$'); person(g, { ...CA.MODERN, x: 520, y: 1010, s: 0.95, t: 0.4, expr: 'sad', look: 1 });
  tag(g, '$400 млрд', 420, 640, 1, { size: 70, bg: '#ffffff', noPop: true });
  pile(g, 1380, 1120, 900, 470); light(g, 1380, 520, 420, '#ffe08a', 0.5);
  person(g, { ...CA.MUSA, x: 1380, y: 690, s: 1.35, t: 1.1, pose: 'hips', expr: 'smirk' });
  tag(g, '???', 1720, 420, 1, { size: 90, bg: '#ffd43b', noPop: true });
  T.line(g, [[760, 700], [960, 640]], 26, C.red); T.poly(g, [[960, 600], [1030, 630], [965, 690]], C.red, 4);
  finish(g, { vig: 0.2, grain: 0.03 });
} });
tpl('coverC', 'Thumb C: face close-up + gold, «КАК ОН ЭТО СДЕЛАЛ?»', { draw(g) {
  const bg = g.createRadialGradient(1300, 500, 50, 1300, 500, 1200); bg.addColorStop(0, '#2b3f7a'); bg.addColorStop(1, '#0c1430'); g.fillStyle = bg; g.fillRect(0, 0, 1920, 1080);
  rays(g, 1380, 420, '#ffd43b', 0.1); light(g, 1380, 430, 560, '#ffcf4a', 0.6);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 4 - i; j++) T.goldBar(g, 1140 + j * 165 + i * 82, 700 - i * 76, 175);
  for (const [x, y, r] of [[1120, 300, 34], [1650, 260, 30], [1760, 560, 26], [1060, 560, 24]]) T.coin(g, x, y, r);
  person(g, { ...CA.MUSA, x: 470, y: 1640, s: 3.6, t: 1.0, expr: 'shock', look: 0.6 });
  BIGT(g, 'КАК ОН', 1390, 860, 170, '#ffe14a'); BIGT(g, 'ЭТО СДЕЛАЛ?', 1390, 1000, 150, '#ffe14a');
  finish(g, { vig: 0.3, grain: 0.03 });
} });
