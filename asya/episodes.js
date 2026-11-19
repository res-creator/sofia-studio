// Episodes of «Ася и взрослая жизнь». Each shot: dur (s), kind, cam, st(lt) -> state, cap.
const {SCREENS, FACE, clamp, ease} = require('./engine');
const blink = (lt, at, base) => (at.some(a => lt > a && lt < a + 0.13) ? 'blink' : base);
const thumbCycle = (lt, cyc = .8) => { const f = (lt % cyc) / cyc; return f < .4 ? ease(f / .4) : Math.max(0, 1 - (f - .4) / .25); };

const EP = {};

// 1. Зарплата
const ep1Cart = [
  {name: 'Свечка «Уют»', price: 890, c: '#f3b44a', icon: '✦'},
  {name: 'Пижама с котиками', price: 2490, c: '#ee7d98', icon: '♥'},
  {name: 'Лампа-луна', price: 1990, c: '#8a7be0', icon: '☾'},
  {name: 'Корм для Бублика', price: 1200, c: '#4fbf9f', icon: '♣'},
  {name: 'Ещё одна кружка', price: 790, c: '#e0412a', icon: '☕'},
  {name: 'Робот-пылесос', price: 18990, c: '#555b66', icon: '●'},
  {name: 'Плед (третий)', price: 3290, c: '#d9a02a', icon: '▦'},
];
EP.ep1 = {title: 'Зарплата', shots: [
  {dur: 3.0, kind: 'phone', st: lt => ({thumb: 0, screen: SCREENS.bank({balance: 1240 + ease(lt / 1.2 - .3) * 45000,
    ops: [{name: 'Зарплата', sum: '+45 000 ₽', c: '#4fbf9f', a: clamp(lt * 2 - .6)}, {name: 'Кофе', sum: '−240 ₽', c: '#d9a02a'}, {name: 'Метро', sum: '−62 ₽', c: '#8a7be0'}]})}),
    cap: ['ПРИШЛА ЗАРПЛАТА!']},
  {dur: 2.8, kind: 'wide', st: lt => ({eyes: blink(lt, [1.6], 'happy'), mouth: 'grin', cat: 'idle', steam: true}), cap: ['ВСЁ, С ЭТОГО МЕСЯЦА', 'ЖИВУ ЭКОНОМНО']},
  {dur: 3.8, kind: 'phone', st: lt => ({thumb: thumbCycle(lt, .55), screen: SCREENS.list({title: 'Корзина', items: ep1Cart, shown: lt * 2.2})}), cap: ['ТОЛЬКО САМОЕ', 'НЕОБХОДИМОЕ']},
  {dur: 2.6, kind: 'phone', st: lt => ({thumb: 0, screen: SCREENS.bank({balance: 3200, ops: [{name: 'Маркетплейс', sum: '−29 640 ₽', c: '#ee7d98'}, {name: 'Доставка еды', sum: '−8 980 ₽', c: '#e0412a'}, {name: 'Такси', sum: '−4 420 ₽', c: '#d9a02a'}]})}), cap: ['ЧЕРЕЗ ДВА ДНЯ']},
  {dur: 3.4, kind: 'wide', cam: FACE, st: lt => ({eyes: 'wide', cat: lt < 1.2 ? 'wide' : 'judge', steam: false}), cap: lt => (lt < 1.4 ? ['…'] : ['БУБЛИК,', 'МЫ НА ГРЕЧКЕ'])},
]};

// 2. Зарядка
const ep2Cart = [
  {name: 'Плед-облачко', price: 2190, c: '#8fb7ef', icon: '☁'},
  {name: 'Носки ×5', price: 990, c: '#ee7d98', icon: '♥'},
  {name: 'Гирлянда', price: 1490, c: '#f3b44a', icon: '✦'},
  {name: 'Коврик-лягушка', price: 1290, c: '#4fbf9f', icon: '☺'},
  {name: 'Органайзер', price: 870, c: '#8a7be0', icon: '▦'},
  {name: 'Мячик Бублику', price: 290, c: '#e0412a', icon: '●'},
  {name: 'Ещё носки', price: 590, c: '#d9a02a', icon: '♥'},
];
EP.ep2 = {title: 'Зарядка', shots: [
  {dur: 3.0, kind: 'wide', st: lt => ({eyes: blink(lt, [1.8], 'down'), cat: 'idle', steam: true}), cap: ['ЗАЙДУ НА МАРКЕТПЛЕЙС', 'ТОЛЬКО ЗА ЗАРЯДКОЙ']},
  {dur: 3.8, kind: 'phone', st: lt => ({thumb: thumbCycle(lt, .55), screen: SCREENS.list({title: 'Корзина', items: ep2Cart, shown: lt * 2.1})}), cap: lt => (lt < 1.8 ? ['ТАК, ЗАРЯДКА…'] : ['…И ПАРУ МЕЛОЧЕЙ'])},
  {dur: 2.4, kind: 'phone', st: lt => ({thumb: 0, screen: SCREENS.done({title: 'Заказ оформлен!', sub: ['7 товаров · 7 720 ₽', 'Доставим в четверг']})}), cap: ['ГОТОВО!']},
  {dur: 2.6, kind: 'phone', st: lt => ({thumb: 0, bg: '#1c1c24', screen: SCREENS.lowBattery()}), cap: ['ВЕЧЕРОМ']},
  {dur: 3.6, kind: 'wide', cam: FACE, st: lt => ({eyes: 'wide', mouth: lt > 1.6 ? 'o' : 'w', cat: 'judge', q: lt > 1.6 ? (lt - 1.6) / 1.2 : 0}), cap: lt => (lt < 1.6 ? ['А ЗАРЯДКУ', 'Я ЗАКАЗАЛА?'] : ['…НЕТ'])},
]};

// 3. Подписки
const ep3Subs = [
  {name: 'Кино онлайн', price: 399, c: '#e0412a', icon: '▶'},
  {name: 'Музыка', price: 299, c: '#8a7be0', icon: '♪'},
  {name: 'Облако 2 ТБ', price: 349, c: '#8fb7ef', icon: '☁'},
  {name: 'Йога (0 занятий)', price: 990, c: '#4fbf9f', icon: '☺'},
  {name: 'Английский', price: 1490, c: '#f3b44a', icon: 'A'},
  {name: 'Ещё одно кино', price: 449, c: '#555b66', icon: '▶'},
  {name: 'Что это вообще?', price: 199, c: '#ee7d98', icon: '?'},
];
EP.ep3 = {title: 'Подписки', shots: [
  {dur: 3.0, kind: 'wide', st: lt => ({eyes: blink(lt, [1.5], 'down'), mouth: 'flat', cat: 'idle', steam: true}), cap: ['ПОСМОТРЮ, КУДА', 'УХОДЯТ ДЕНЬГИ']},
  {dur: 4.2, kind: 'phone', st: lt => ({thumb: thumbCycle(lt, .6), screen: SCREENS.list({title: 'Подписки', items: ep3Subs, shown: lt * 2, totalLabel: 'В месяц', button: null})}), cap: ['ПОДПИСКИ…']},
  {dur: 2.8, kind: 'wide', cam: FACE, st: lt => ({eyes: 'wide', mouth: 'o', cat: 'wide'}), cap: ['4 175 ₽ В МЕСЯЦ?!', 'Я ИМИ ДАЖЕ НЕ ПОЛЬЗУЮСЬ']},
  {dur: 3.4, kind: 'wide', st: lt => ({eyes: blink(lt, [2.2], 'down'), mouth: 'smile', cat: 'judge'}), cap: ['ЛАДНО,', 'ОТМЕНЮ ЗАВТРА']},
]};

module.exports = EP;
