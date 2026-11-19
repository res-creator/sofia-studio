import { E } from '/engine/core.js';
import { tpl } from './_registry.js';
import * as T from '../toon.js';
import * as CA from '../cast.js';
tpl('lineup', 'test', { draw(g, t, info) {
  T.wallRoom(g, { wall: '#efe3c8', floor: '#a8784a', boards: true });
  const L = [[CA.MUSA, 'grin', 'cheer'], [CA.SULTAN, 'neutral', 'idle'], [CA.GUARD, 'angry', 'cross'], [CA.MERCHANT('#6a8a3a', 1), 'smile', 'give'], [CA.UMARI, 'neutral', 'writing'], [CA.KID, 'shock', 'shrug'], [CA.CRASSUS, 'smirk', 'point'], [CA.FUGGER, 'neutral', 'hold'], [CA.ROCKEFELLER, 'smile', 'wave']];
  L.forEach(([c, e, p], i) => T.person(g, { ...c, x: 120 + i * 210, y: 900, s: 0.85, t, expr: e, pose: p, talk: i === 1 }));
  T.camel(g, 300, 600, 0.8, t * 3, {}); T.chest(g, 800, 600, 1, 1, 1); T.barPile(g, 1100, 600, 9); T.sack(g, 1350, 600, 1, undefined, '$'); T.tag(g, '1324 год', 1650, 300, 1, { bg: '#ffd43b' });
  T.finish(g);
} });
