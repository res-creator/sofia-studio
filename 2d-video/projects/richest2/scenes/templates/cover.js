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
