import { g, ease, clamp, INK } from './engine.js';
import { MONO } from './doc_common.js';
const e = (m, scene) => ({ m, scene, cams: [[960, 540, 1, 1]], noDrift: true, sp: {}, actors: [] });
// термометр: жара растёт на солнце и падает в тени (pt от начала абзаца)
const gauge = (st) => { const pt = st.pt, k = clamp((pt - 5.0) / 1.0), heat = 0.92 - 0.55 * ease((pt - 6.0) / 1.0); const a = ease((pt - 4.95) / 0.3) * (1 - ease((pt - 8.0) / 0.2)); if (a <= 0) return; g.save(); g.globalAlpha = a; g.fillStyle = '#fffdf0'; g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.roundRect(90, 130, 70, 460, 35); g.fill(); g.stroke();
  const hh = 380 * heat; g.fillStyle = heat > 0.6 ? '#e0443a' : '#3d86d6'; g.beginPath(); g.roundRect(104, 560 - hh, 42, hh + 20, 20); g.fill(); g.beginPath(); g.arc(125, 580, 42, 0, 6.2832); g.fill(); g.stroke();
  g.fillStyle = '#fff'; g.font = '900 46px Nunito'; g.lineWidth = 9; g.strokeStyle = INK; g.strokeText('жара', 190, 200); g.fillText('жара', 190, 200); const w = ease((pt - 7.2) / 0.4); if (w > 0) { g.globalAlpha = a * w; g.strokeText('вода + тень', 190, 280); g.fillText('вода + тень', 190, 280); } g.restore(); };
export const SB = [e('Ты просыпаешься', 'stockV1'), e('У выживальщиков', 'ruleScheme'),
  { m: 'Это не точные', seq: [
    { to: 4.89, scene: 'textCard', cams: [[960, 540, 1, 1]], noDrift: true, sp: {}, actors: [] },
    { to: 8.08, scene: 'shadeCartoon', cams: [[960, 540, 1, 1]], noDrift: true, sp: {}, hud: gauge, actors: [{ who: 'boy', x: 600, y: 930, s: 1.3, emos: [[0, 'worry'], [6.2, 'flat']], sweatAt: [4.9, 6.2], pose: { L: 'hang', R: 'hang' }, move: [[0, 600, 930, 1.3], [5.2, 600, 930, 1.3], [6.3, 1100, 930, 1.3]], walk: [5.2, 6.3], looks: [[0, 0.5]] }] },
    { to: 99, scene: 'stockV2', cams: [[960, 540, 1, 1]], noDrift: true, sp: {}, actors: [] }] },
];
