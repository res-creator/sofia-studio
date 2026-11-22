// Раскадровка «Чернобыль»: для каждого абзаца озвучки сцена, герои и камера. m = начало абзаца. pt = секунды от начала абзаца.
import { g, INK, TAU, ease, lerp, R, P, E, C, line, CARD_BG } from './engine.js';

const boy = (o = {}) => ({ who: 'boy', x: 930, y: 900, s: 1.15, emo: 'flat', pose: { L: 'belly', R: 'belly' }, ...o });
const mom = (o = {}) => ({ who: 'mom', x: 235, y: 800, s: 1.0, emo: 'sad', ...o });
const txt = (s, x, y, size = 72, fill = '#fff') => { g.save(); g.font = `900 ${size}px Nunito`; g.textAlign = 'center'; g.lineJoin = 'round'; g.lineWidth = size * 0.22; g.strokeStyle = INK; g.fillStyle = fill; g.strokeText(s, x, y); g.fillText(s, x, y); g.restore(); };
const sleeper = (o = {}) => boy({ x: 706, y: 588, s: 0.85, rot: -Math.PI / 2, emo: 'sleep', pose: { L: 'hang', R: 'hang' }, still: true, tilt: 0, ...o });
const blanket = () => { R(500, 556, 226, 106, '#3d86d6', 20, 6); line([[560, 560], [560, 656]], 4); line([[640, 560], [640, 656]], 4); };
const NIGHT = { night: true };

export const SB = [
  // ===== ХОЛОДНЫЙ СТАРТ =====
  { m: 'Тебе одиннадцать.', scene: 'room', shotLen: 2.7, cams: ['c0', 'a0', 'w', 'a1'], punch: 8.4,
    sp: { door: (pt) => pt < 4.4 ? 0 : pt < 4.8 ? (pt - 4.4) / 0.4 : pt < 13 ? 1 : 1 },
    actors: [boy({ item: 'teddy', emos: [[0, 'flat'], [1.8, 'sad'], [8.4, 'surprised']], looks: [[0, 0.2], [4.5, -0.6]], sweatAt: [8.6, 9.6] }), mom({ fade: [4.2, 4.7, 0, 1], talk: [5.0, 9.2], emos: [[0, 'flat'], [8.2, 'sad']], poses: [[0, 'hang', 'hang'], [5.2, 'hang', 'up'], [6.8, 'hip', 'wave'], [8.2, 'hip', 'point']] })] },
  { m: 'На столе остаётся книга', scene: 'room', shotLen: 2.2, cams: [[1690, 630, 2.7, 3.1], 'a0', 'w'], dim: (pt) => pt > 4.6 ? ease((pt - 4.6) / 1.1) * 0.45 : 0,
    sp: { door: (pt) => pt < 4.3 ? 1 : Math.max(0, 1 - ease((pt - 4.3) / 0.9)) },
    actors: [boy({ item: 'teddy', emo: 'sad', move: [[0, 930, 900, 1.15], [2.6, 930, 900, 1.15], [5.0, 280, 900, 0.95]], flipAt: [[0, 1], [2.7, -1]], walk: [2.7, 5.0], looks: [[0, 0.8]] }), mom({ move: [[0, 235, 800, 1.0], [3.0, 235, 800, 1.0], [4.4, 150, 800, 0.85]], fade: [3.4, 4.5, 1, 0] })] },
  { m: 'А всего полтора дня назад', shotLen: 2.8, seq: [
    { to: 4.6, scene: 'room', sp: { ...NIGHT, glow: true, teddyBed: false, book: true }, cams: [[520, 600, 1.9, 2.1], 'w'], actors: [sleeper()], fg: blanket },
    { to: 10.4, scene: 'plant', sp: { fire: true }, cams: ['w', [800, 480, 1.9, 2.1]], actors: [] },
    { to: 99, scene: 'room', sp: { door: 0 }, cams: ['a0', 'w'], actors: [boy({ emo: 'sad', looks: [[0, 0.1]] })] }] },
  { m: 'Ты придуман. Но город', seq: [
    { to: 2.3, scene: 'town', sp: {}, cams: ['c0'], actors: [boy({ x: 640, y: 1010, s: 1.2, emo: 'flat' })] },
    { to: 99, scene: 'street', sp: { buses: 3, moving: true }, cams: ['w', [960, 700, 1.6, 1.7]], actors: [] }] },

  // ===== ГОРОД ДЛЯ МОЛОДЫХ =====
  { m: 'Припять построили ради одной станции', photos: [{ from: 0.2, to: 5.4, src: 'town86', cap: 'Припять' }], scene: 'town', sp: { title: 'ПРИПЯТЬ, 1986', wheelX: 1120 }, cams: ['w', [1500, 520, 1.5, 1.6]], actors: [] },
  { m: 'Здесь живёт почти пятьдесят тысяч', photos: [{ from: 2.9, to: 5.4, src: 'blocks', cap: 'Жилые дома Припяти (позднее фото)' }, { from: 5.5, to: 9.3, src: 'pool', cap: 'Бассейн «Лазурный» (позднее фото)' }], shotLen: 3.2, seq: [
    { to: 2.8, scene: 'info', sp: { bg: '#ffd98a', items: [{ big: '≈ 50 000', label: 'жителей', at: 0.3 }] }, cams: ['w'], actors: [] },
    { to: 9.4, scene: 'info', sp: { bg: '#bfe6f6', items: [{ big: 'бассейн', label: '', at: 5.6 }, { big: 'стадион', label: '', at: 6.0 }, { big: 'Дворец культуры', label: '', at: 7.2 }, { big: 'кино', label: '', at: 8.0 }] }, cams: ['w'], actors: [] },
    { to: 99, scene: 'yard', sp: {}, cams: ['w', 'a0'], actors: [mom({ x: 700, y: 960, s: 1.1, emo: 'grin', look: 0.3 }), { who: 'kid2', x: 980, y: 960, s: 0.7, emo: 'grin' }] }] },
  { m: 'К Первому мая в парке', photos: [{ from: 0.3, to: 5.4, src: 'wheel', cap: 'Колесо обозрения Припяти (позднее фото)', actors: [{ who: 'boy', x: 1500, y: 940, s: 1.1, emo: 'flat', pose: { L: 'belly', R: 'belly' } }] }], scene: 'town', sp: { title: 'К 1 МАЯ', wheelX: 1120 }, cams: [[1120, 520, 1.9, 2.1], 'w'], actors: [{ who: 'worker', x: 700, y: 1010, s: 1.1, emo: 'grin', pose: { L: 'hip', R: 'point' } }] },
  { m: 'Ты живёшь на пятом этаже', scene: 'room', sp: { door: 0 }, cams: ['a0', [960, 300, 2.3, 2.5], 'w'], shotLen: 3.6, actors: [boy({ x: 980, y: 900, looks: [[0, 0.3], [4, 0.9]], emo: 'flat' })] },
  { m: 'Твой отец работает на станции', photos: [{ from: 0.2, to: 2.3, src: 'plantmodel', cap: 'Модель станции' }], scene: 'plant', sp: { day: true, fire: false }, cams: ['w', 'a0'], actors: [{ who: 'dad', x: 880, y: 960, s: 1.2, emo: 'flat', pose: { L: 'hang', R: 'hip' }, item: 'case' }, { who: 'worker', x: 1150, y: 960, s: 1.1, emo: 'grin' }, { who: 'worker', x: 600, y: 960, s: 1.1, emo: 'flat' }] },
  { m: 'В пятницу вечером он уходит', scene: 'room', sp: { ...NIGHT, door: 1 }, cams: ['w', [520, 600, 1.8, 2.0], 'a1'], shotLen: 2.6,
    actors: [sleeper(), { who: 'dad', x: 820, y: 800, s: 1.05, emo: 'grin', tilt: -14, flip: -1, move: [[0, 820, 800, 1.05], [3.5, 820, 800, 1.05], [5.5, 235, 800, 1.0]], walk: [3.5, 5.5], item: 'case', fade: [5.2, 6.4, 1, 0] }], fg: blanket },
  { m: 'Это последняя обычная ночь', scene: 'town', sp: { night: true }, cams: ['w'], actors: [] },

  // ===== ОДИН ЧАС ДВАДЦАТЬ ТРИ МИНУТЫ =====
  { m: 'В ту ночь на станции должны были проверить', photos: [{ from: 0.3, to: 5.9, src: 'plantmap' }], scene: 'plant', sp: { fire: false }, cams: ['w', 'a0'], actors: [{ who: 'worker', x: 760, y: 960, s: 1.15, emo: 'flat', pose: { L: 'hip', R: 'point' } }] },
  { m: 'Проверку собирались сделать днём', scene: 'info', sp: { bg: '#ffd98a', items: [{ big: '14:00', label: 'проверку отложили', at: 0.5 }, { big: '≈ 9 часов', label: 'ждали', at: 3.6 }, { big: 'ночь', label: 'досталась ночной смене', at: 6.4 }] }, cams: ['w'], actors: [] },
  { m: 'При подготовке к проверке', scene: 'info', sp: { bg: '#e8d8f0', items: [{ big: '', icon: 'down', label: 'мощность реактора упала', at: 0.3 }, { big: '', icon: 'up', label: 'потом её подняли', at: 3.6 }, { big: '?', label: 'в режиме, к которому реактор был плохо приспособлен', at: 7.0 }] }, cams: ['w'], actors: [] },
  { m: 'В час двадцать три минуты ночи', scene: 'plant', sp: { fire: true }, cams: ['w', [800, 470, 1.8, 2.0]], punch: 2.6, shotLen: 2.4, actors: [],
    fg: (st) => { const k = st.pt - 2.4; if (k > 0 && k < 0.5) { g.fillStyle = `rgba(255,255,255,${0.9 * (1 - k / 0.5)})`; g.fillRect(-1200, -400, 4400, 1800); } } },
  { m: 'Это не была атомная бомба', scene: 'plant', sp: { fire: true }, cams: [[800, 480, 1.4, 1.5], 'w'], actors: [] },
  { m: 'В первые часы погибли двое', scene: 'plant', sp: { fire: true }, cams: ['w', 'a0'], dim: 0.15, actors: [{ who: 'worker', x: 820, y: 960, s: 1.1, emo: 'sad', pose: { L: 'hang', R: 'hang' } }, { who: 'worker', x: 1040, y: 960, s: 1.1, emo: 'sad', pose: { L: 'hang', R: 'hang' } }] },
  { m: 'А ты спишь.', scene: 'room', sp: { ...NIGHT, glow: true }, cams: [[520, 600, 1.9, 2.1], 'w'], actors: [sleeper()], fg: blanket },

  // ===== ПЯТЬ МИНУТ =====
  { m: 'Через пять минут к станции', scene: 'plant', sp: { fire: true, trucks: 3, siren: true }, cams: ['w', 'a0', 'w'], shotLen: 3.0, actors: [{ who: 'lieut', x: 1500, y: 980, s: 1.1, emo: 'angry', pose: { L: 'hip', R: 'point' }, flip: -1 }] },
  { m: 'На них обычная боевая одежда', shotLen: 2.8, seq: [
    { to: 7.5, scene: 'plant', sp: { fire: true }, cams: ['a0', 'c0'], actors: [{ who: 'fireman', x: 960, y: 980, s: 1.25, emo: 'worry', pose: { L: 'hang', R: 'hold' }, item: 'dosi' }] },
    { to: 15, scene: 'info', sp: { bg: '#d9d9e8', items: [{ big: 'MAX', label: 'приборы на станции дошли до предела шкалы', at: 0.4 }, { big: 'во много раз', label: 'выше — реальные уровни у блока', at: 4.2 }] }, cams: ['w'], actors: [] },
    { to: 99, scene: 'plant', sp: { fire: true }, cams: ['w'], actors: [{ who: 'fireman', x: 800, y: 980, s: 1.1, emo: 'worry' }, { who: 'fireman', x: 1050, y: 980, s: 1.1, emo: 'flat' }] }] },
  { m: 'К утру огонь на крышах', scene: 'plant', sp: { day: true, fire: false }, cams: ['w', 'a0'], actors: [{ who: 'fireman', x: 900, y: 980, s: 1.2, emo: 'flat', pose: { L: 'hang', R: 'hang' }, sweatAt: [0, 9] }] },
  { m: 'А теперь о цене.', scene: 'info', shotLen: 4, sp: { bg: '#ffd98a', items: [{ big: '≈ 600', label: 'человек было на станции в ту ночь', at: 0.3 }, { big: '134', label: 'острая лучевая болезнь', at: 6.0 }, { big: '28', label: 'умерли за три месяца', at: 12.2 }] }, cams: ['w'], actors: [] },
  { m: 'Тех, кому стало плохо', seq: [
    { to: 4.8, scene: 'sky', sp: {}, cams: ['w'], actors: [] },
    { to: 99, scene: 'room', sp: { ...NIGHT }, cams: [[520, 600, 1.9, 2.1]], actors: [sleeper()], fg: blanket }] },

  // ===== СУББОТА =====
  { m: 'Утром ты просыпаешься', shotLen: 2.8, seq: [
    { to: 3.5, scene: 'room', sp: { door: 0 }, cams: ['c0', 'a0'], actors: [boy({ emo: 'flat', pose: { L: 'hang', R: 'hang' }, looks: [[0, 0.3]] })] },
    { to: 99, scene: 'yard', sp: { helis: true }, cams: ['w', 'a0', 'w'], actors: [boy({ x: 700, y: 960, s: 1.15, emo: 'surprised', lookY: -1.5, looks: [[0, 0.4]], pose: { L: 'hang', R: 'hang' }, move: [[0, 500, 960], [8, 1000, 960]], walk: [0, 8] })] }] },
  { m: 'Ты ждёшь отца.', scene: 'room', sp: { door: 1 }, cams: ['a0', 'w'], shotLen: 3.2, actors: [boy({ x: 520, y: 900, emo: 'sad', pose: { L: 'hang', R: 'hang' }, looks: [[0, -0.8]] })] },
  { m: 'Мама ходит от окна к окну', shotLen: 3.0, seq: [
    { to: 10.6, scene: 'kitchen', sp: {}, cams: ['w'], actors: [boy({ x: 1400, y: 960, s: 1.05, emo: 'sad', pose: { L: 'hang', R: 'hang' } }), mom({ x: 600, y: 900, emo: 'worry', move: [[0, 400, 900], [3, 1100, 900], [6, 480, 900], [9, 1000, 900]], walk: [0, 10], flipAt: [[0, 1], [3, -1], [6, 1], [9, -1]] })] },
    { to: 99, scene: 'kitchen', sp: { phone: true }, cams: ['w'], actors: [boy({ x: 1400, y: 960, s: 1.05, emo: 'sad', pose: { L: 'hang', R: 'hang' } }), mom({ x: 1000, y: 900, emo: 'worry', poses: [[0, 'hang', 'hang'], [1.0, 'hang', 'up']], flip: -1 })] }] },
  { m: 'Кто-то из взрослых слышал слухи', scene: 'yard', sp: { helis: false }, cams: ['w', 'a0', 'a1'], shotLen: 2.8, actors: [{ who: 'granny', x: 800, y: 980, s: 1.1, emo: 'worry', flip: 1, pose: { L: 'hang', R: 'cheek' } }, { who: 'dad', x: 1050, y: 980, s: 1.1, emo: 'worry', flip: -1, pose: { L: 'hip', R: 'hang' } }, boy({ x: 1400, y: 990, s: 1.0, emo: 'sad', looks: [[0, -0.8]], pose: { L: 'hang', R: 'hang' } })] },
  { m: 'Позже по радио просят закрыть окна', shotLen: 3.0, seq: [
    { to: 8.5, scene: 'kitchen', sp: { radio: true }, cams: ['w'], actors: [mom({ x: 1050, y: 900, emo: 'worry', pose: { L: 'hang', R: 'up' }, flip: -1 }), boy({ x: 1400, y: 960, s: 1.0, emo: 'sad', pose: { L: 'hang', R: 'hang' } })] },
    { to: 99, scene: 'street', sp: { buses: 0 }, cams: ['w', 'a0'], actors: [{ who: 'militia', x: 900, y: 1000, s: 1.2, emo: 'flat', pose: { L: 'hang', R: 'hold' }, item: 'dosi' }, { who: 'militia', x: 1300, y: 1000, s: 1.2, emo: 'flat', flip: -1 }] }] },
  { m: 'Почему не эвакуируют сразу?', shotLen: 4, scene: 'info', sp: { bg: '#e8d8f0', items: [{ big: '?', label: 'почему не эвакуируют сразу', at: 0.3 }, { big: 'нет приказа', label: 'комиссия приезжает только вечером', at: 3.6 }, { big: 'когда решили?', label: 'историки называют по-разному', at: 9.0 }] }, cams: ['w'], actors: [] },
  { m: 'Ночью из Киева и из области', scene: 'street', sp: { buses: 3, moving: true }, dim: 0.5, cams: ['w', [960, 780, 1.5, 1.6]], actors: [] },
  { m: 'А в воскресенье утром', scene: 'room', sp: { door: 0, knock: true }, cams: ['w', 'a0'], shotLen: 1.7, actors: [boy({ x: 700, y: 900, emo: 'surprised', pose: { L: 'hang', R: 'hang' }, looks: [[0, -0.8]] })] },

  // ===== ТРИ ДНЯ =====
  { m: 'Воскресенье. По радио объявляют', shotLen: 2.8, seq: [
    { to: 3.0, scene: 'kitchen', sp: { radio: true }, cams: ['w'], actors: [mom({ x: 1000, y: 900, emo: 'flat', flip: -1 }), boy({ x: 1480, y: 960, s: 1.05, emo: 'sad', pose: { L: 'hang', R: 'hang' } })] },
    { to: 99, scene: 'street', sp: { buses: 3 }, cams: ['w'], actors: [], hud: () => txt('14:00', 960, 150, 120, '#ffd24a') }] },
  { m: 'Как вспоминают жители', scene: 'room', sp: { door: 1 }, cams: ['w', 'a1', 'a0'], shotLen: 3.2, actors: [{ who: 'lieut', x: 235, y: 800, s: 1.0, emo: 'flat', talk: [0, 9.5], poses: [[0, 'hang', 'hold'], [3, 'hang', 'out'], [6, 'hip', 'point']] }, boy({ item: 'teddy', emo: 'sad', looks: [[0, -0.7]] })] },
  { m: 'Теперь вопрос к тебе.', scene: 'bag', sp: {}, cams: ['w'], actors: [] },
  { m: 'Ты выбираешь.', shotLen: 3.0, seq: [
    { to: 9.4, scene: 'room', sp: { door: 1 }, cams: ['a0', 'w'], actors: [boy({ item: 'bag', emo: 'sad', pose: { L: 'hang', R: 'hold' }, looks: [[0, 0.5]] }), mom({ emo: 'worry' })] },
    { to: 99, scene: 'room', sp: { door: 0 }, cams: [[300, 520, 1.9, 2.1], 'w'], actors: [mom({ x: 470, y: 800, item: 'paper', poses: [[0, 'hang', 'hold']], emo: 'sad', flip: -1 })],
      fg: (st) => { if (st.pt > 14.8) { g.save(); g.translate(225, 440); g.rotate(-0.06); R(-80, -50, 160, 100, '#fffdf0', 8, 6); g.font = '900 28px Nunito'; g.fillStyle = INK; g.textAlign = 'center'; g.fillText('Мы живы.', 0, -6); g.fillText('Ищи нас', 0, 30); g.restore(); } } }] },
  { m: 'Окна в доме закрываются', scene: 'facade', sp: {}, cams: ['w'], actors: [] },
  { m: 'Автобусов больше тысячи.', photos: [{ from: 3.5, to: 6.0, src: 'bus' }], scene: 'street', sp: { buses: 4, moving: true }, cams: ['w', [960, 800, 1.5, 1.6]], actors: [] },
  { m: 'Когда автобус отъезжает', scene: 'busIn', sp: { wheel: true }, cams: ['a0', 'c0', 'w'], shotLen: 2.4, actors: [boy({ x: 770, y: 1000, s: 1.15, emo: 'sad', flip: -1, bust: true, bustCut: 130, item: 'teddy', looks: [[0, -0.9]] }), mom({ x: 1450, y: 1000, s: 1.1, emo: 'sad', bust: true, bustCut: 130 })] },
  { m: 'Автобус везёт вас в село', scene: 'busIn', sp: {}, cams: ['w', 'a0', 'a1', 'w'], shotLen: 3.0, actors: [boy({ x: 770, y: 1000, s: 1.15, emo: 'sad', bust: true, bustCut: 130, item: 'teddy', looks: [[0, 0.5]] }), mom({ x: 1450, y: 1000, s: 1.1, emo: 'sad', bust: true, bustCut: 130, flip: -1 }), { who: 'granny', x: 330, y: 1000, s: 1.1, emo: 'sad', bust: true, bustCut: 130 }] },

  // ===== ПОНЕДЕЛЬНИК =====
  { m: 'В понедельник утром', photos: [{ from: 0.3, to: 5.2, src: 'forsmark' }], scene: 'forsmark', sp: { alarm: true }, cams: ['w', 'a0'], shotLen: 3.2, actors: [{ who: 'swede', x: 940, y: 980, s: 1.2, emo: 'surprised', pose: { L: 'hang', R: 'hold' }, item: 'dosi', sweatAt: [4, 11] }] },
  { m: 'Сначала шведы решают', shotLen: 3.0, seq: [
    { to: 6.2, scene: 'forsmark', sp: { alarm: true }, cams: ['w', 'a0'], actors: [{ who: 'swede', x: 600, y: 980, s: 1.1, emo: 'surprised', walk: [0, 6], move: [[0, 600, 980], [6, 1300, 980]] }, { who: 'swede', x: 400, y: 980, s: 1.1, emo: 'worry', walk: [0, 6], move: [[0, 400, 980], [6, 1500, 980]] }, { who: 'swede', x: 200, y: 980, s: 1.1, emo: 'surprised', walk: [0, 6], move: [[0, 200, 980], [6, 1700, 980]] }] },
    { to: 99, scene: 'map', sp: { arrow: true, t0: 0.3 }, cams: ['w'], actors: [] }] },
  { m: 'Швеция спрашивает Москву', scene: 'map', sp: { moscow: true, q: true, ring: true }, cams: ['w'], actors: [] },
  { m: 'Вечером в программе', scene: 'tv', sp: { talk: true }, cams: ['w', [960, 480, 1.7, 1.8]], actors: [] },
  { m: 'Так мир узнаёт об аварии', scene: 'forsmark', sp: { alarm: true }, cams: ['a0', 'w'], actors: [{ who: 'swede', x: 940, y: 980, s: 1.2, emo: 'surprised', pose: { L: 'hang', R: 'hold' }, item: 'dosi', sweatAt: [0, 5] }] },
  { m: 'Ты в чужой деревенской избе', scene: 'village', sp: { tv: 'static' }, cams: ['w', 'a0', 'a1'], shotLen: 3.6, actors: [boy({ x: 960, y: 920, s: 1.05, emo: 'sad', pose: { L: 'hang', R: 'hang' }, looks: [[0, 0.9]] }), mom({ x: 1200, y: 920, s: 1.05, emo: 'sad', flip: -1, pose: { L: 'hang', R: 'cheek' } }), { who: 'granny', x: 640, y: 920, s: 1.05, emo: 'sad' }] },

  // ===== ЧТО ОСТАЛОСЬ =====
  { m: 'Среда проходит', photos: [{ from: 4.6, to: 8.0, src: 'school', cap: 'Заброшенная школа в Припяти (позднее фото)', actors: [{ who: 'boy', x: 1000, y: 930, s: 1.15, emo: 'sad', pose: { L: 'belly', R: 'belly' } }] }], shotLen: 3.0, seq: [
    { to: 4.2, scene: 'info', sp: { bg: '#ffd98a', items: [{ big: 'среда', label: 'проходит', at: 0.3 }, { big: 'ещё одна', label: '', at: 2.0 }] }, cams: ['w'], actors: [] },
    { to: 99, scene: 'school', sp: {}, cams: ['w', 'a1', 'a0'], actors: [{ who: 'teacher', x: 1500, y: 900, s: 1.2, emo: 'flat', talk: [0, 2], pose: { L: 'hang', R: 'point' }, flip: -1 }, boy({ x: 700, y: 960, s: 1.1, emo: 'sad', pose: { L: 'hang', R: 'hang' }, looks: [[0, 0.7]] })] }] },
  { m: 'Первого мая в Киеве', photos: [{ from: 0.2, to: 3.8, src: 'pass' }], shotLen: 3.0, seq: [
    { to: 7.5, scene: 'street', sp: { buses: 0, crowd: 16 }, cams: ['w'], actors: [], fg: () => { for (let i = 0; i < 6; i++) { const x = 300 + i * 260; line([[x, 900], [x, 700]], 8); P([[x, 700], [x + 110, 725], [x, 760]], '#e0443a', 5); } } },
    { to: 99, scene: 'street', sp: { buses: 3, moving: true }, cams: ['w', 'a0'], actors: [{ who: 'kid2', x: 700, y: 1010, s: 0.9, emo: 'grin', pose: { L: 'wave', R: 'hang' } }, { who: 'boy', x: 1100, y: 1010, s: 0.9, emo: 'flat', pose: { L: 'hang', R: 'wave' } }] }] },
  { m: 'К концу года над четвёртым блоком', photos: [{ from: 0.3, to: 6.6, src: 'sarc' }, { from: 7.4, to: 12.2, src: 'slav' }, { from: 12.6, to: 17.0, src: 'liquid' }], shotLen: 3.2, seq: [
    { to: 7, scene: 'arch', sp: { sarc: true, year: '1986' }, cams: ['w'], actors: [] },
    { to: 12.5, scene: 'town', sp: { title: 'новый город', wheel: false }, cams: ['w'], actors: [{ who: 'worker', x: 900, y: 1010, s: 1.1, emo: 'grin' }] },
    { to: 22, scene: 'info', sp: { bg: '#bfe6f6', title: 'на очистке работали сотни тысяч', items: [{ big: 'военные', label: '', at: 0.4 }, { big: 'шахтёры', label: '', at: 1.7 }, { big: 'водители', label: '', at: 3.0 }, { big: 'строители', label: '', at: 4.3 }] }, cams: ['w'], actors: [] },
    { to: 99, scene: 'plant', sp: { day: true, fire: false }, cams: ['w'], actors: [{ who: 'worker', x: 800, y: 980, s: 1.1, emo: 'flat' }, { who: 'worker', x: 1050, y: 980, s: 1.1, emo: 'flat' }] }] },
  { m: 'Сильнее всего пострадали Украина', scene: 'map', sp: {}, cams: ['w'], actors: [], fg: () => { txt('БЕЛАРУСЬ', 900, 590, 44); txt('РОССИЯ', 1650, 520, 44); } },
  { m: 'Через тридцать лет, в две тысячи шестнадцатом', photos: [{ from: 0.3, to: 8.2, src: 'arch' }, { from: 9.0, to: 12.5, src: 'archbuild' }], shotLen: 3.4, seq: [
    { to: 9, scene: 'arch', sp: { arch: true, year: '2016' }, cams: ['w'], actors: [] },
    { to: 20, scene: 'arch', sp: { arch: true, drone: true, t0: 0.5, year: '2025' }, cams: ['w'], actors: [] },
    { to: 99, scene: 'arch', sp: { arch: true }, cams: ['w'], actors: [] }] },
  { m: 'В саму Припять люди так и не вернулись', photos: [{ from: 0, to: 2.8, src: 'sign' }], shotLen: 3.2, seq: [
    { to: 2.8, scene: 'zone', sp: {}, cams: ['w'], actors: [] },
    { to: 99, scene: 'room', sp: { old: true, door: 1 }, cams: [[1690, 630, 2.4, 2.8], 'w'], actors: [] }] },

  // ===== ЧТО МЫ ЗНАЕМ =====
  { m: 'Сколько людей погибло', scene: 'info', sp: { bg: '#e8d8f0', items: [{ big: '?', label: 'единого числа нет', at: 0.5 }] }, cams: ['w'], actors: [] },
  { m: 'Подтверждены смерти нескольких десятков', shotLen: 5, scene: 'info', sp: { bg: '#ffd98a', items: [{ big: 'десятки', label: 'смерти подтверждены', at: 0.5 }, { big: 'до 4 000', label: 'прогноз Чернобыльского форума, 2005', at: 8.5 }, { big: 'до 16 000', label: 'расчёт для Европы до 2065', at: 18 }, { big: '?', label: 'учёные спорят', at: 25 }] }, cams: ['w'], actors: [] },
  { m: 'Лучше всего изучено одно последствие', scene: 'milk', sp: {}, cams: ['w'], actors: [] },
  { m: 'По докладу комитета ООН', shotLen: 5, scene: 'info', sp: { bg: '#bfe6f6', items: [{ big: '≈ 20 000', label: 'случаев рака щитовидной железы к 2015 году', at: 1.0 }, { big: '1 из 4', label: 'вероятно связан с облучением', at: 13 }, { big: 'большинство', label: 'излечимо', at: 21 }] }, cams: ['w'], actors: [] },
  { m: 'Ты был бы в этой группе.', shotLen: 4, seq: [
    { to: 8, scene: 'milk', sp: { all: true }, cams: ['w'], actors: [] },
    { to: 99, scene: 'info', sp: { bg: '#e8d8f0', title: 'главная проблема здоровья', items: [{ big: 'тревога', label: '', at: 0.6 }, { big: 'потеря дома', label: '', at: 3.2 }, { big: 'неизвестность', label: '', at: 6 }] }, cams: ['w'], actors: [] }] },

  // ===== ПОЧЕМУ ЭТО СЛУЧИЛОСЬ =====
  { m: 'Помнишь, я обещал сказать', scene: 'info', sp: { bg: '#ffd98a', items: [{ big: '?', label: 'что решила конструкция, а что люди', at: 0.4 }] }, cams: ['w'], actors: [] },
  { m: 'В восемьдесят шестом советский доклад', shotLen: 5, scene: 'info', sp: { bg: '#e8d8f0', items: [{ big: '1986', label: 'доклад: виноват персонал', at: 0.5 }, { big: '1992', label: 'МАГАТЭ: главное в конструкции и культуре безопасности', at: 8.5 }, { big: 'кнопка', label: 'могла не остановить реактор, а разогнать', at: 17 }] }, cams: ['w'], actors: [] },
  { m: 'Что стало с отцом героя', photos: [{ from: 0, to: 3.2, src: 'flat' }], scene: 'room', sp: { old: true, door: 0 }, cams: [[300, 520, 1.9, 2.1], 'w'], actors: [],
    fg: () => { g.save(); g.translate(225, 440); g.rotate(-0.06); R(-80, -50, 160, 100, '#efe6c8', 8, 6); g.font = '900 28px Nunito'; g.fillStyle = INK; g.textAlign = 'center'; g.fillText('Мы живы.', 0, -6); g.fillText('Ищи нас', 0, 30); g.restore(); } },
  { m: 'Какую вещь ты не смог бы оставить', scene: 'bag', sp: {}, cams: ['w'], actors: [] },
  { m: 'Вернёмся в комнату.', scene: 'room', sp: { old: false, door: 0 }, cams: ['w', [1690, 630, 2.4, 2.8]], shotLen: 2.6, actors: [] },
];

export const CARDS = { 'ГОРОД ДЛЯ МОЛОДЫХ': 'blocks', 'ОДИН ЧАС ДВАДЦАТЬ ТРИ МИНУТЫ': 'plantmodel', 'ПЯТЬ МИНУТ': 'liquid', 'СУББОТА': 'town86', 'ТРИ ДНЯ': 'bus', 'ПОНЕДЕЛЬНИК': 'forsmark', 'ЧТО ОСТАЛОСЬ': 'arch', 'ЧТО МЫ ЗНАЕМ': 'sign', 'ПОЧЕМУ ЭТО СЛУЧИЛОСЬ': 'plantmap' };
Object.assign(CARD_BG, CARDS);
