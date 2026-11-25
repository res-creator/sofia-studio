import { sil, stamp, frame } from './scenes_titanicd3.js';
const op = (o = {}) => sil({ who: 'sailor', x: 1130, y: 780, s: 1.15, emo: 'flat', pose: { L: 'hold', R: 'hold' }, still: true, ...o });
const both = (...fs) => (st) => fs.forEach((f) => f(st));
export const SB = [
  { m: 'Предупреждения о льдах', scene: 'radioRoom', sp: { night: true, papers: true }, cams: ['w'], actors: [op({ item: 'paper' })], hud: both(stamp('ДЕНЬ', 'ледовые предупреждения', 0.3), frame('wireless', 1560, 360, 420, 0.04, 0.6, 'радиорубка «Титаника»')) },
  { m: 'Где-то поблизости', seq: [
    { to: 5.3, scene: 'seaNight', sp: { californian: true, shipX: 560, moon: false }, cams: [[960, 540, 1.0, 1.1]], actors: [], hud: both(stamp('≈ 23:30', '«Калифорниан» неподалёку', 0.3), frame('cal', 1560, 360, 420, -0.03, 0.6, '«Калифорниан»')) },
    { to: 99, scene: 'radioRoom', sp: { night: true, on: false }, cams: ['w'], actors: [op({ flip: -1, pose: { L: 'hip', R: 'up' } })], hud: both(stamp('≈ 23:30', 'радист выключает аппарат', 0.1)) }] },
  { m: 'Вперёдсмотрящий замечает', seq: [
    { to: 99, scene: 'seaNight', sp: { moon: false, iceberg: true, shipX: 560 }, cams: [[960, 540, 1.0, 1.12]], actors: [sil({ who: 'sailor', x: 1000, y: 940, s: 1.5, emo: 'surprised', pose: { L: 'point', R: 'hold' }, flip: -1 })], hud: both(stamp('23:40', 'айсберг впереди', 0.1), frame('iceberg', 1560, 380, 420, 0.03, 1.0, 'айсберг, 1912')) }] },
];
