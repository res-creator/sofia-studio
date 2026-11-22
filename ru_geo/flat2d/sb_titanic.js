// Раскадровка «Титаник»: для каждого абзаца озвучки сцена, герои и камера. pt = секунды от начала абзаца.
import { g, INK, TAU, ease, lerp, clamp, R, P, E, C, line, CARD_BG } from './engine.js';

const shon = (o = {}) => ({ who: 'shon', x: 960, y: 900, s: 1.15, emo: 'flat', pose: { L: 'hang', R: 'hang' }, ...o });
const smom = (o = {}) => ({ who: 'smom', x: 1250, y: 900, s: 1.1, emo: 'flat', pose: { L: 'hang', R: 'hang' }, ...o });
const sboy = (o = {}) => ({ who: 'sboy', x: 1120, y: 900, s: 0.75, emo: 'grin', pose: { L: 'hang', R: 'hang' }, ...o });
const txt = (s, x, y, size = 72, fill = '#fff') => { g.save(); g.font = `900 ${size}px Nunito`; g.textAlign = 'center'; g.lineJoin = 'round'; g.lineWidth = size * 0.22; g.strokeStyle = INK; g.fillStyle = fill; g.strokeText(s, x, y); g.fillText(s, x, y); g.restore(); };
const sleeper = (o = {}) => shon({ x: 544, y: 628, s: 0.85, rot: -Math.PI / 2, emo: 'sleep', still: true, tilt: 0, ...o });
const bigClock = (label, sub) => (st) => { };
const N = { night: true };

export const SB = [
  // ===== ХОЛОДНЫЙ СТАРТ =====
  { m: 'Два часа сорок минут.', photos: [{ from: 0.3, to: 3.8, src: 'leave' }], shotLen: 3.2, seq: [
    { to: 3.6, scene: 'seaNight', sp: { californian: false, far: true }, cams: ['w'], actors: [] },
    { to: 99, scene: 'info', sp: { bg: '#e8d8f0', items: [{ big: '2 ч 40 мин', label: 'до конца корабля', at: 0.2 }] }, cams: ['w'], actors: [] }] },
  { m: 'Один пассажир третьего класса', shotLen: 3.0, seq: [
    { to: 4.5, scene: 'cabin', sp: { ...N, scrape: true, bulb: 0 }, cams: [[430, 600, 1.9, 2.1], 'w'], actors: [sleeper()] },
    { to: 99, scene: 'cabin', sp: { ...N, water: (pt) => clamp((pt - 4.5) / 4), bulb: 0 }, cams: [[1620, 700, 2.4, 2.6], 'w'], actors: [sleeper()] }] },
  { m: 'Тебя зовут Шон', shotLen: 3.4, seq: [
    { to: 7.5, scene: 'promenade', sp: { people: false }, cams: ['c0', 'a0'], actors: [shon({ emo: 'grin', looks: [[0, 0.2]] })] },
    { to: 99, scene: 'info', sp: { bg: '#bfe6f6', items: [{ big: '1 из 7', label: 'шансы мужчины в третьем классе', at: 0.3 }] }, cams: ['w'], actors: [] }] },
  { m: 'Ты придуман.', scene: 'tender', sp: {}, cams: ['w', 'a0'], shotLen: 3.4, actors: [shon({ x: 560, y: 790, s: 1.0, emo: 'flat', item: 'case', pose: { L: 'hang', R: 'hang' } })] },

  // ===== ОДИННАДЦАТОГО АПРЕЛЯ =====
  { m: 'Около полудня маленький катер', photos: [{ from: 9.0, to: 14.2, src: 'tender' }], scene: 'tender', cams: ['w', 'a0', 'w', 'a0'], shotLen: 3.6, actors: [shon({ x: 560, y: 790, s: 1.0, emo: 'flat', item: 'case', looks: [[0, 0.8]] })] },
  { m: 'Борт уходит вверх', shotLen: 3.2, seq: [
    { to: 6, scene: 'tender', cams: [[560, 520, 1.5, 1.7], 'a0'], actors: [shon({ x: 560, y: 790, s: 1.0, emo: 'surprised', item: 'case', lookY: -1.6, looks: [[0, 0.9]] })],
      fg: (st) => { const k = st.pt - 2.0; if (k > 0 && k < 3) { g.save(); g.translate(520 + k * 40, 600 + k * k * 90); g.rotate(k * 3); E(0, 0, 36, 12, '#6a5a46', 5); g.restore(); } } },
    { to: 99, scene: 'info', sp: { bg: '#bfe6f6', items: [{ big: '≈ 1 000', label: 'мест в третьем классе', at: 0.4 }, { big: '≈ 710', label: 'человек плыло в третьем классе', at: 4.5 }] }, cams: ['w'], actors: [] }] },
  { m: 'Ты находишь свою койку', photos: [{ from: 0.2, to: 3.4, src: 'cabin', actors: [{ who: 'shon', x: 1480, y: 930, s: 1.15, emo: 'grin', pose: { L: 'hang', R: 'hang' } }] }], scene: 'cabin', sp: { bulb: (pt) => (pt > 3.6 && pt < 4.2) || (pt > 5.2 && pt < 5.8) || pt > 7 ? 1 : 0 }, cams: ['a0', [1100, 300, 2.0, 2.2], 'w'], shotLen: 3.4, actors: [shon({ x: 760, y: 900, emo: 'grin', pose: { L: 'hang', R: 'up' }, looks: [[0, 0.9]] })] },
  { m: 'Кормят три раза в день', shotLen: 3.0, seq: [
    { to: 5, scene: 'dining', cams: ['w', 'a0'], actors: [shon({ x: 960, y: 900, s: 1.1, emo: 'grin', pose: { L: 'hold', R: 'hold' } }), { who: 'steward', x: 1420, y: 900, s: 1.1, emo: 'flat', pose: { L: 'hold', R: 'hang' } }] },
    { to: 99, scene: 'baths', sp: { crowd: 10 }, cams: ['w', [1600, 560, 1.7, 1.8]], actors: [shon({ x: 1160, y: 900, s: 1.1, emo: 'worry' })] }] },
  { m: 'Запомни дорогу от койки', scene: 'corridor', sp: { speed: 140 }, cams: ['a0', 'w'], shotLen: 3.0, actors: [shon({ emo: 'flat', walk: [0, 6], pose: { L: 'hang', R: 'hang' }, still: true })] },

  // ===== ТРИ ДНЯ НА БОРТУ =====
  { m: 'Двенадцатого и тринадцатого', photos: [{ from: 3.4, to: 7.6, src: 'promen', actors: [{ who: 'shon', x: 1300, y: 930, s: 1.15, emo: 'grin', pose: { L: 'hang', R: 'hang' } }] }], shotLen: 3.2, seq: [
    { to: 3, scene: 'dining', cams: ['w'], actors: [shon({ x: 960, y: 900, s: 1.1, emo: 'grin' })] },
    { to: 7, scene: 'promenade', cams: ['w', 'a0'], actors: [shon({ x: 960, y: 900, emo: 'grin', looks: [[0, 0.8]] })] },
    { to: 99, scene: 'generalRoom', sp: { notes: true }, cams: ['w'], actors: [shon({ x: 700, y: 900, emo: 'grin' })] }] },
  { m: 'За эти дни ты узнаёшь', scene: 'promenade', sp: { people: false }, cams: ['w', 'a0', 'a1', 'w'], shotLen: 3.2,
    actors: [shon({ x: 780, y: 900, emo: 'grin', poses: [[0, 'hang', 'hold'], [4, 'hang', 'wave']], looks: [[0, 0.7]] }), sboy({ x: 1010, y: 900, s: 0.8, emo: 'grin', poses: [[0, 'hold', 'hang'], [3, 'wave', 'wave']], looks: [[0, -0.7]] }), smom({ x: 1300, y: 900, emo: 'grin', flip: -1, pose: { L: 'hang', R: 'cheek' } })] },
  { m: 'Корабль огромный, тёплый', scene: 'seaNight', sp: { moon: false, californian: false }, dim: 0, cams: ['w'], actors: [] },

  // ===== ЧЕТЫРНАДЦАТОГО АПРЕЛЯ =====
  { m: 'Предупреждения о льдах', photos: [{ from: 0.2, to: 5.2, src: 'wireless' }], scene: 'radioRoom', sp: { papers: true }, cams: ['w', 'a0', 'w'], shotLen: 3.0, actors: [{ who: 'sailor', x: 1130, y: 780, s: 0.9, emo: 'flat', pose: { L: 'hold', R: 'hold' }, item: 'paper', still: true }] },
  { m: 'Где-то поблизости стоит пароход', photos: [{ from: 0.2, to: 5.8, src: 'cal' }], shotLen: 3.2, seq: [
    { to: 6.5, scene: 'seaNight', sp: { californian: true, shipX: 560 }, cams: ['w'], actors: [] },
    { to: 99, scene: 'radioRoom', sp: { night: true, on: (false) }, cams: ['a0', 'w'], actors: [{ who: 'sailor', x: 1130, y: 780, s: 0.9, emo: 'flat', pose: { L: 'hip', R: 'up' }, flip: -1, emos: [[0, 'flat']] }] }] },
  { m: 'А ты вечером в общей комнате', scene: 'generalRoom', sp: { night: true, notes: true }, cams: ['w', 'a0', 'a1', 'a2'], shotLen: 3.2,
    actors: [shon({ x: 700, y: 900, emo: 'grin', pose: { L: 'hold', R: 'hang' }, looks: [[0, 0.8]] }), sboy({ x: 960, y: 900, s: 0.8, emo: 'grin', pose: { L: 'hang', R: 'hang' }, looks: [[0, -0.8]] }), smom({ x: 1700, y: 900, emo: 'grin', flip: -1, pose: { L: 'hang', R: 'hang' } })] },
  { m: 'Ты ложишься спать.', shotLen: 2.8, seq: [
    { to: 2.8, scene: 'cabin', sp: { ...N, bulb: 0 }, cams: [[430, 600, 1.8, 2.0]], actors: [sleeper()] },
    { to: 5.3, scene: 'generalRoom', sp: { night: true }, cams: ['w', 'a1'], actors: [smom({ x: 900, y: 900, emo: 'sad', pose: { L: 'hold', R: 'hold' }, flip: 1 }), sboy({ x: 1080, y: 900, s: 0.75, emo: 'sleep', still: true, tilt: 0 })] },
    { to: 99, scene: 'radioRoom', sp: { night: true, on: false }, cams: ['a0'], actors: [{ who: 'sailor', x: 450, y: 616, s: 0.9, emo: 'sleep', still: true, tilt: 0, rot: -Math.PI / 2 }] }] },

  // ===== ДВАДЦАТЬ МИНУТ ДО ПОЛУНОЧИ =====
  { m: 'Вперёдсмотрящий замечает айсберг', photos: [{ from: 3.9, to: 6.4, src: 'iceberg', cap: 'Айсберг рядом с местом гибели, 1912' }], shotLen: 3.2, seq: [
    { to: 3.0, scene: 'seaNight', sp: { moon: false }, cams: [[1000, 420, 1.6, 1.8]], actors: [{ who: 'sailor', x: 1250, y: 940, s: 1.4, emo: 'surprised', pose: { L: 'point', R: 'hold' }, flip: -1, sweatAt: [0, 3] }] },
    { to: 99, scene: 'seaNight', sp: { iceberg: true, hitAt: 3.2 - 3.0, moon: false, shipX: 560 }, cams: ['w'], punch: 3.4, actors: [] }] },
  { m: 'По данным обследования обломков', scene: 'compartments', sp: {}, cams: ['w'], actors: [] },
  { m: 'Твоя каюта у носа', scene: 'cabin', sp: { ...N, water: (pt) => clamp(pt / 4), bulb: 0 }, cams: [[1620, 700, 1.7, 1.9], 'w'], actors: [sleeper()] },
  { m: 'Под дверью темнеет', scene: 'cabin', sp: { ...N, water: 0.55, bulb: 0 }, cams: [[1630, 740, 2.8, 3.1]], actors: [] },
  { m: 'Потом по коридору идёт стюард', scene: 'corridor', sp: { night: true, speed: 120, lines: true }, cams: ['a0', 'w'], shotLen: 2.6, actors: [{ who: 'steward', x: 900, y: 900, s: 1.15, emo: 'worry', walk: [0, 5], pose: { L: 'hang', R: 'up' }, still: true }] },

  // ===== ПУТЬ НАВЕРХ =====
  { m: 'Чемодан под койкой. Сапоги, хлеб.', scene: 'cabin', sp: { ...N, bulb: 1 }, cams: ['a0', [360, 840, 2.4, 2.6], 'w'], shotLen: 3.2, actors: [shon({ x: 1380, y: 900, emo: 'worry', looks: [[0, -0.9]], pose: { L: 'hang', R: 'hang' } })] },
  { m: 'Ты оставляешь чемодан', scene: 'cabin', sp: { ...N, bulb: 1 }, cams: ['a0', 'w'], shotLen: 3.6, actors: [shon({ x: 1380, y: 900, emo: 'sad', item: 'paper', pose: { L: 'hang', R: 'hold' }, move: [[0, 1380, 900], [5, 1380, 900], [8, 1560, 900]], walk: [5, 8] })] },
  { m: 'Осталось два часа.', scene: 'info', sp: { bg: '#e8d8f0', items: [{ big: '2:00', label: 'осталось', at: 0.1 }] }, cams: ['w'], actors: [] },
  { m: 'В коридоре ты встречаешь', scene: 'corridor', sp: { night: true, speed: 0 }, cams: ['w', 'a1', 'a0'], shotLen: 3.2,
    actors: [shon({ x: 700, y: 900, emo: 'worry', flip: 1, looks: [[0, 0.8]] }), { who: 'steward', x: 1700, y: 900, s: 1.1, emo: 'worry', talk: [0, 5], pose: { L: 'hang', R: 'point' }, flip: -1 }, smom({ x: 1300, y: 900, emo: 'worry', flip: -1, pose: { L: 'hang', R: 'hang' } }), sboy({ x: 1130, y: 900, s: 0.75, emo: 'sad', looks: [[0, 0.5]] })] },
  { m: 'Вы идёте.', shotLen: 3.2, seq: [
    { to: 6.5, scene: 'corridor', sp: { night: true, speed: 220 }, cams: ['a0', 'w'], actors: [shon({ x: 960, y: 900, emo: 'worry', walk: [0, 8], pose: { L: 'hang', R: 'hold' }, still: true }), sboy({ x: 1130, y: 900, s: 0.75, emo: 'sad', walk: [0, 8], still: true })] },
    { to: 99, scene: 'stairs', cams: ['w', 'a0'], actors: [shon({ x: 640, y: 800, emo: 'worry', walk: [0, 8], pose: { L: 'hang', R: 'hold' }, move: [[0, 640, 800], [6, 1300, 150]] }), sboy({ x: 800, y: 740, s: 0.75, emo: 'sad', walk: [0, 8], move: [[0, 800, 740], [6, 1440, 90]] })] }] },
  { m: 'Между палубами стояли ворота.', shotLen: 3.4, seq: [
    { to: 9, scene: 'gate', sp: { open: 0 }, cams: ['w', 'a0'], actors: [shon({ x: 560, y: 900, emo: 'worry', pose: { L: 'hang', R: 'hold' }, looks: [[0, 0.8]] }), sboy({ x: 720, y: 900, s: 0.75, emo: 'sad' }), smom({ x: 380, y: 900, emo: 'worry' })] },
    { to: 99, scene: 'info', sp: { bg: '#e8d8f0', items: [{ big: 'нет приказа', label: 'запереть третий класс: ни в британском, ни в американском расследовании', at: 0.5 }, { big: 'калитка', label: 'по рассказу пассажира: заперли, замок сломал пассажир', at: 7 }, { big: 'спор', label: 'идёт больше ста лет', at: 14 }] }, cams: ['w'], actors: [] }] },
  { m: 'Путь занимает больше времени', scene: 'stairs', cams: ['w'], actors: [shon({ x: 700, y: 800, emo: 'worry', walk: [0, 3], pose: { L: 'hang', R: 'hold' }, move: [[0, 700, 800], [3, 1250, 190]] })] },

  // ===== ШЛЮПКИ =====
  { m: 'Вы выходите на палубу.', photos: [{ from: 4.4, to: 8.9, src: 'boatdeck', actors: [{ who: 'shon', x: 1350, y: 930, s: 1.15, emo: 'worry', pose: { L: 'hang', R: 'hang' } }] }], scene: 'boatDeck', sp: { ice: true }, cams: ['w', 'a1', 'a0'], shotLen: 3.0,
    actors: [shon({ x: 800, y: 920, emo: 'surprised', pose: { L: 'hang', R: 'hold' }, looks: [[0, 0.8]] }), { who: 'officer', x: 1300, y: 920, s: 1.15, emo: 'flat', talk: [0, 3], pose: { L: 'hip', R: 'out' }, flip: -1 }, sboy({ x: 640, y: 920, s: 0.75, emo: 'sad' })] },
  { m: 'На корабле двадцать шлюпок.', shotLen: 4, seq: [
    { to: 99, scene: 'info', sp: { bg: '#bfe6f6', items: [{ big: '20', label: 'шлюпок', at: 0.3 }, { big: '≈ 1 170', label: 'мест в шлюпках', at: 6 }, { big: '≈ 2 200', label: 'человек на борту', at: 10.5 }] }, cams: ['w'], actors: [] }] },
  { m: 'Многие первые шлюпки', photos: [{ from: 6.8, to: 13.4, src: 'boatD' }], scene: 'boatDeck', sp: { lowering: true, lowerAt: 1.5, boatIdx: 1, people: 3 }, cams: ['w', 'a0', 'a1'], shotLen: 3.2,
    actors: [{ who: 'officer', x: 700, y: 920, s: 1.15, emo: 'flat', talk: [0, 6], pose: { L: 'hip', R: 'point' } }, { who: 'officer', x: 1500, y: 920, s: 1.15, emo: 'flat', flip: -1, pose: { L: 'hip', R: 'out' } }, shon({ x: 1100, y: 920, emo: 'worry', looks: [[0, 0.7]] })] },
  { m: 'Остаётся час двадцать.', scene: 'boatDeck', sp: { lowering: true, lowerAt: 6.5, boatIdx: 1, people: 2 }, cams: ['w', 'a0', 'a1'], shotLen: 2.9,
    actors: [shon({ x: 780, y: 920, emo: 'sad', pose: { L: 'hang', R: 'out' } }), sboy({ x: 960, y: 920, s: 0.75, emo: 'grin', poses: [[0, 'hang', 'hang'], [4.5, 'hang', 'wave']], flip: 1, move: [[0, 960, 920], [3, 960, 920], [4.5, 900, 800]] }), smom({ x: 1100, y: 920, emo: 'worry', flip: -1, pose: { L: 'hang', R: 'cheek' }, move: [[0, 1100, 920], [3, 1100, 920], [4.5, 1000, 790]] })] },
  { m: 'Ты хочешь сесть следом.', scene: 'boatDeck', sp: { lowering: true, lowerAt: 0.5, boatIdx: 1, people: 4 }, cams: ['a0', 'a1', 'w'], shotLen: 3.2,
    actors: [shon({ x: 960, y: 920, emo: 'sad', pose: { L: 'hang', R: 'reach' }, looks: [[0, 0.8]] }), { who: 'officer', x: 1330, y: 920, s: 1.2, emo: 'angry', flip: -1, pose: { L: 'hip', R: 'out' } }] },
  { m: 'Осталось сорок минут.', scene: 'info', sp: { bg: '#e8d8f0', items: [{ big: '0:40', label: 'осталось', at: 0.1 }] }, cams: ['w'], actors: [] },
  { m: 'Над кораблём одна за другой', scene: 'boatDeck', sp: { rockets: true }, cams: ['w'], shotLen: 3.6, actors: [shon({ x: 960, y: 920, emo: 'worry', lookY: -1.6, pose: { L: 'hang', R: 'hang' } })] },
  { m: 'Последняя складная шлюпка', shotLen: 3.6, seq: [
    { to: 8.6, scene: 'boatDeck', sp: { sliding: true, boatsGone: 4 }, tilt: (pt) => ease(pt / 8) * 0.34, cams: ['w', 'a0'], actors: [shon({ x: 960, y: 920, emo: 'worry', pose: { L: 'hang', R: 'hang' } })] },
    { to: 99, scene: 'seaNight', sp: { sink: true, sink0: 0, sinkLen: 5, moon: false, shipX: 760 }, cams: ['w'], actors: [] }] },

  // ===== ОГНИ НА ГОРИЗОНТЕ =====
  { m: 'Что стало с Шоном', scene: 'seaNight', sp: { ship: false, boats: 4, cap: true, moon: false, far: true }, cams: ['w', [1000, 760, 2.0, 2.2]], actors: [] },
  { m: 'Реальный свидетель', photos: [{ from: 0.3, to: 8.4, src: 'boatD2' }], scene: 'seaNight', sp: { ship: false, boats: 2, moon: false }, cams: [[700, 740, 1.8, 2.0], 'w'], actors: [] },
  { m: 'Под утро в шлюпках видят огни.', photos: [{ from: 2.1, to: 6.9, src: 'carp' }, { from: 7.0, to: 10.1, src: 'rostron' }, { from: 14.6, to: 17.7, src: 'boatsC' }, { from: 26.5, to: 30.4, src: 'boatsC2' }], shotLen: 4, seq: [
    { to: 2.1, scene: 'carpathia', sp: { dur: 8, boats: 3 }, cams: ['w'], actors: [] },
    { to: 14.5, scene: 'carpathia', sp: { dur: 8, boats: 3 }, cams: ['w', 'a0'], actors: [] },
    { to: 17.8, scene: 'carpathia', sp: { dur: 4, boats: 6 }, cams: ['w'], actors: [] },
    { to: 24.5, scene: 'info', sp: { bg: '#ffd98a', items: [{ big: '≈ 58 миль', label: 'за три с половиной часа', at: 18.0 }, { big: '14 → 17,5', label: 'узлов: обычный ход и рекорд «Карпатии»', at: 21.0 }] }, cams: ['w'], actors: [] },
    { to: 99, scene: 'carpathia', sp: { dur: 4, boats: 6 }, cams: ['w'], actors: [] }] },
  { m: 'Полные списки люди узнали', photos: [{ from: 1.9, to: 6.4, src: 'ny' }, { from: 10.8, to: 14.2, src: 'news', cap: 'Итальянская газета Il Secolo, 17 апреля 1912' }], shotLen: 3.4, seq: [
    { to: 6, scene: 'carpathia', sp: { dur: 6, boats: 0 }, cams: ['w'], actors: [] },
    { to: 99, scene: 'newsstand', cams: ['w', 'a0'], actors: [{ who: 'brother', x: 960, y: 920, s: 1.2, emo: 'worry', item: 'paper', pose: { L: 'hold', R: 'hold' }, looks: [[0, 0.3]] }] }] },

  // ===== ТВОИ ШАНСЫ =====
  { m: 'Погибло около полутора тысяч', scene: 'info', sp: { bg: '#e8d8f0', items: [{ big: '≈ 1 500', label: 'погибло', at: 0.4 }, { big: 'экипаж', label: 'больше всего погибших', at: 3.0 }, { big: '3 класс', label: 'второе место', at: 5.2 }] }, cams: ['w'], actors: [] },
  { m: 'По спискам 1912 года', shotLen: 4, scene: 'info', sp: { bg: '#bfe6f6', items: [{ big: '2/3', label: 'спаслись в первом классе', at: 0.4 }, { big: '1/4', label: 'спаслись в третьем классе', at: 4.0 }, { big: '1 из 7', label: 'мужчины третьего класса', at: 9.0 }, { big: '1 из 3', label: 'дети третьего класса', at: 14.5 }] }, cams: ['w'], actors: [] },
  { m: 'Среди тех, кто выжил', scene: 'info', sp: { bg: '#ffd98a', items: [{ big: '2 месяца', label: 'Милвина Дин, третий класс', at: 0.4 }, { big: '2009', label: 'дожила до этого года, последней из всех', at: 6.0 }] }, cams: ['w'], actors: [] },
  { m: 'Так почему же так мало?', shotLen: 4, scene: 'info', sp: { bg: '#e8d8f0', items: [{ big: 'дорога', label: 'дольше и труднее добираться до шлюпок', at: 0.4 }, { big: 'время', label: 'не сразу поверили, что корабль тонет', at: 10.0 }, { big: 'правило', label: 'женщины и дети первыми: по-разному на бортах', at: 17.0 }] }, cams: ['w'], actors: [] },

  // ===== ПОСЛЕ =====
  { m: 'Британия и США провели расследования', photos: [{ from: 0.3, to: 4.4, src: 'senate' }, { from: 9.4, to: 15.6, src: 'cartoon' }], shotLen: 4, scene: 'info', sp: { bg: '#bfe6f6', items: [{ big: '1912', label: 'два расследования', at: 0.4 }, { big: 'места для всех', label: 'в шлюпках', at: 4.6 }, { big: 'радио', label: 'без перерывов', at: 8.2 }, { big: '1914', label: 'ледовый патруль', at: 12.2 }] }, cams: ['w'], actors: [] },
  { m: 'Правила стали меняться', scene: 'boatDeck', sp: { day: true }, cams: ['w'], shotLen: 2.9, actors: [shon({ x: 960, y: 920, s: 1.15, emo: 'flat' })] },
  { m: 'Время в ту ночь было общим', scene: 'boatDeck', sp: { ice: true }, cams: ['w'], actors: [shon({ x: 960, y: 920, s: 1.15, emo: 'flat', pose: { L: 'hang', R: 'hang' } })] },
  { m: 'Что бы ты хотел знать', scene: 'boatDeck', sp: { ice: true }, cams: ['c0', 'a0'], shotLen: 1.8, actors: [shon({ x: 960, y: 920, s: 1.15, emo: 'sad', looks: [[0, 0]] })] },
];

export const CARDS = { 'ОДИННАДЦАТОГО АПРЕЛЯ': 'leave2', 'ТРИ ДНЯ НА БОРТУ': 'promen', 'ЧЕТЫРНАДЦАТОГО АПРЕЛЯ': 'boatdeck', 'ДВАДЦАТЬ МИНУТ ДО ПОЛУНОЧИ': 'iceberg2', 'ПУТЬ НАВЕРХ': 'cabin', 'ШЛЮПКИ': 'boatsC2', 'ОГНИ НА ГОРИЗОНТЕ': 'boatsC', 'ТВОИ ШАНСЫ': 'ny2', 'ПОСЛЕ': 'senate' };
Object.assign(CARD_BG, CARDS);
