// «Давай замуж!» series v5 — per-episode shot list + acting (gestures, moods, props, grooms, cat) on the voiced timeline.
// Follows the approved storyboard_series.png. Shots: [start, kind, who, opts]. Every window is [who, from, to, value].
module.exports = function plan(EP, C) {
  const {BY, TL, STAND, DTOP, T} = C;
  const s0 = id => BY[id].at - .08, at = (id, u) => BY[id].at + (BY[id].end - BY[id].at) * u, en = id => BY[id].end, ev = k => Array.isArray(TL[k]) ? TL[k][0] : TL[k];
  const HOOK = {1: 'УМНЫЙ, БОГАТЫЙ, ДОБРЫЙ — ВЫБЕРИ ДВА', 2: 'ВЕГАН СЪЕЛ ЦВЕТЫ ВЕДУЩЕЙ', 3: 'НЕВЕСТА ВЫБРАЛА ЖЕНАТОГО'}[EP];
  const walkIn = (t, t0, x1 = STAND[0], y = STAND[1], d = .5) => t < t0 ? {s: 'off'} : t < t0 + d ? {s: 'walk', x: x1, y, sc: .32, wp: T.walkPose(t, t0, d, [x1 - 330, y], [x1, y], .32, .32)} : {s: 'stand', x: x1, y, sc: .32};
  const walkOut = (t, t0, x0, y, d = 1.6) => t < t0 ? null : t < t0 + d ? {s: 'walk', x: x0, y, sc: .32, wp: T.walkPose(t, t0, d, [x0, y], [x0 - 420, y], .32, .32)} : {s: 'off'};
  const catPath = (t, t0, d, A, B, s) => { const u = Math.max(0, Math.min(1, (t - t0) / d)); return {a: 'catWalk', x: A[0] + (B[0] - A[0]) * u, y: A[1] + (B[1] - A[1]) * u, s, ph: (t * 1.8) % 1, money: false}; };
  const SOFA3 = {m: {s: 'seat'}, j: {s: 'seat', x: 800}, r: {s: 'seat', x: 960}};
  let P;
  if (EP === 1) P = {
    shots: [[0, 'CU', 'b'], [s0('A2'), 'PUSH', 'z', {x: s0('A2') + .2}], [s0('A3'), 'CU', 'b'], [s0('A4'), 'CU', 'z'], [ev('LAUGH1'), 'HOSTS'], [ev('CARD'), 'SB_INS', null, {ins: 'exCat'}],
      [s0('A7'), 'SB_INS', null, {ins: 'tarotCat'}], [s0('A8'), 'CU', 'z'], [s0('A9'), 'MCU', 'e'], [ev('JUMP'), 'WALK', 'm'], [s0('A11'), 'PUSH', 'z', {x: at('A11', .35)}], [ev('LAUGH2'), 'WALK', 'm'],
      [s0('A13'), 'MCU', 'e'], [s0('A14'), 'CU', 'm'], [ev('LAMP'), 'INTERRO'], [s0('A16'), 'PUSH', 'z', {x: at('A16', .3)}], [ev('DETECT'), 'HOSTS'], [s0('A17'), 'SB_INS', null, {ins: 'startup'}],
      [s0('A18'), 'CU', 'z'], [s0('A19'), 'CU', 'b'], [s0('A20'), 'SB_INS', null, {ins: 'ballCat'}], [s0('A21'), 'CU', 'm'], [s0('A22'), 'PUSH', 'z', {x: at('A22', .4)}], [s0('A23'), 'CU', 'b'],
      [s0('A24'), 'WIDE'], [ev('CATIN'), 'CUSTOM', null, {cam: {z: 1.75, x: 470, y: 1120}}], [s0('A25'), 'MCU', 'e']],
    gest: [['z', s0('A4'), en('A4') + .2, 'tear'], ['e', s0('A5') - .2, en('A5'), 'write'], ['e', ev('DETECT'), ev('DETECT') + 1.0, 'write']],
    mood: [['b', ev('CATIN'), ev('CATIN') + 1.6, 'shocked'], ['e', ev('DETECT'), ev('DETECT') + 2.2, 'smug'], ['z', ev('LAUGH1'), ev('LAUGH1') + .9, 'cryinglaugh'], ['z', ev('LAUGH2'), ev('LAUGH2') + .6, 'laugh'], ['z', ev('LAUGH4'), ev('LAUGH4') + .6, 'laugh'], ['m', ev('LAUGH2'), en('A12'), 'angry']],
    look: [['z', s0('A19'), en('A19'), -.9], ['e', s0('A19'), en('A19'), -.9], ['s', s0('A19'), en('A19'), -.9], ['e', s0('A25'), en('A25') + 1, 0]],
    grooms: t => ({m: walkIn(t, ev('JUMP')), j: {s: 'off'}, r: {s: 'off'}}),
    world: [[s0('A5') - .2, en('A5') + .3, {a: 'form', x: 360, y: DTOP + 20, layer: 'desk'}],
      [ev('DETECT'), s0('A17'), t => ({a: 'detector', x: 330, y: 975, s: .42, layer: 'desk', strip: Math.max(0, Math.min(1, (t - ev('DETECT') - .3) / 1.3))})],
      [ev('CATWALK') + .4, ev('CATIN') + .2, t => ({...catPath(t, ev('CATWALK') + .4, ev('CATIN') - ev('CATWALK') - .2, [-80, 1440], [440, 1440], .28), money: true})],
      [ev('CATIN') + .2, 99, {a: 'catSit', x: 440, y: 1440, s: .28}], [ev('CATIN') + .3, 99, {a: 'money', x: 520, y: 1000, s: .3, layer: 'desk'}]],
    plates: [[0, en('A1'), 'БРИТТАНИ', 'невеста'], [s0('A5'), en('A5') + .3, 'ЭЛЬВИРА', 'ведущая'], [s0('A7'), en('A7'), 'ЗВЕЗДАНА', 'астролог'], [s0('A8'), en('A8'), 'ЖАННА', 'сваха с Брайтона'], [ev('JUMP') + .4, en('A10'), 'МАЙК', 'жених №1, фрилансер']],
    gloss: [['A2', 'выбери', 'smart · rich · kind', 'умный · богатый · добрый'], ['A6', 'left', 'left me', 'бросил меня'], ['A10', 'boss', 'my own boss', 'сам себе начальник'], ['A15', 'depends', 'it depends', 'смотря как'],
      ['A21', 'borrow', 'borrow', 'занять'], ['A25', 'rich', 'rich или kind?', 'пишите в комментариях']],
    spl: {A1: [['Smart, rich and kind.', 'Умный, богатый и добрый.']], A3: [['Rich… and rich.', 'Богатый… и богатый.']], A6: [['My ex left me… for his cat.', 'Бывший бросил меня… ради своего кота.']],
      A10: [["Hi! I'm Mike. I'm my own boss!", 'Привет! Я Майк. Я сам себе начальник!']], A12: [['Hey!', 'Эй!']], A14: [['Well…', 'Ну…']], A15: [['It depends.', 'Смотря как.']],
      A17: [['But I have a startup!', 'Но у меня стартап!'], ['A taxi… for cats!', 'Такси… для котов!']], A19: [["My ex's cat would pay! He's rich.", 'Кот бывшего заплатил бы! Он богатый.']],
      A21: [['Can I borrow money… from the cat?', 'Можно занять денег… у кота?']], A23: [['So… smart, rich and kind?', 'Так… умный, богатый и добрый?']]},
    mp: {A1: 'dreamy', A2: 'smugside', A3: 'flirty', A4: 'kind', A5: 'flat', A6: 'sad', A7: 'dreamy', A8: 'smug', A9: 'proud', A10: 'grin', A11: 'smugside', A12: 'angry', A13: 'flat', A14: 'worried', A15: 'worried', A16: 'smug',
      A17: 'grin', A18: 'smugside', A19: 'dreamy', A20: 'dreamy', A21: 'worried', A22: 'smug', A23: 'flirty', A24: 'smugside', A25: 'proud'}};
  if (EP === 2) {
    const VASE = [190, 1290], NEAR = [395, 1580];
    P = {
      shots: [[0, 'CUSTOM', null, {cam: {z: 2.0, x: 290, y: 990}, layer: {hosts: 1, fg: 1, aud: 0, bride: 0, plant: 0}}], [s0('B3'), 'CUSTOM', null, {cam: {z: 1.55, x: 290, y: 1250}, layer: {hosts: 1, fg: 1, aud: 0, plant: 0}}],
        [s0('B4'), 'PUSH', 'z', {x: at('B4', .4)}], [ev('LAUGH1'), 'CUSTOM', null, {cam: {z: 1.55, x: 290, y: 1250}, layer: {hosts: 1, fg: 1, aud: 0, plant: 0}}], [s0('B6'), 'CU', 'j'], [s0('B7'), 'CU', 's'],
        [s0('B8'), 'CUSTOM', null, {cam: {z: 2.0, x: 290, y: 990}, layer: {hosts: 1, fg: 1, aud: 0, bride: 0, plant: 0}}], [s0('B9'), 'CU', 'z'], [s0('B10'), 'WIDE'], [s0('B11'), 'CU', 'z'], [ev('ENTER_R'), 'WALK', 'r'],
        [s0('B13'), 'CU', 'z'], [s0('B14'), 'EZ'], [s0('B15'), 'CU', 'z'], [s0('B16'), 'CU', 'r'], [ev('NEWS'), 'SB_INS', null, {ins: 'coin'}], [s0('B17'), 'CU', 'r'],
        [s0('B19'), 'PUSH', 'z', {x: at('B19', .5)}], [s0('B20'), 'CU', 's'], [s0('B21'), 'MCU', 'e'], [ev('TURBAN'), 'CUSTOM', null, {cam: {z: 2.3, x: 700, y: 830}, layer: {fg: 0}}], [s0('B23'), 'CU', 'r'],
        [s0('B25'), 'PUSH', 'z', {x: at('B25', .4)}], [ev('LAUGH4'), 'HOSTS'], [at('B26', .45), 'MCU', 'e'], [s0('B27'), 'CU', 'b'], [s0('B28'), 'CU', 'z'], [en('B28') - .25, 'WIDE']],
      gest: [['e', s0('B8') + .3, en('B9') + .3, 'grabHair'], ['z', s0('B11'), en('B11') + .2, 'lipstick'], ['s', ev('TURBAN') - .1, en('B22'), 'turbanUp'], ['s', s0('B7') - .1, en('B7') + .3, 'hug']],
      mood: [['e', 0, en('B1') + .4, 'angry'], ['b', s0('B3'), en('B3') + .5, 'surprised'], ['b', s0('B5'), en('B5'), 'worried'], ['e', s0('B8'), en('B9') + .3, 'shocked'], ['z', ev('LAUGH3'), ev('LAUGH3') + .8, 'laugh'],
        ['e', ev('TURBAN'), ev('TURBAN') + 1.4, 'shocked'], ['z', ev('LAUGH1'), ev('LAUGH1') + .6, 'laugh'], ['r', ev('NEWS'), en('B18'), 'shocked'], ['b', s0('B27'), en('B28'), 'worried'], ['s', ev('TURBAN'), en('B22'), 'flat']],
      look: [['j', 0, en('B2'), .9], ['e', 0, en('B1'), -.7], ['j', s0('B8'), en('B9'), .9], ['e', s0('B8'), en('B8'), -.7], ['j', s0('B3'), en('B5'), -.9]],
      lean: [['j', s0('B5'), en('B5'), -.12], ['z', s0('B13'), en('B13'), .06]],
      grooms: t => {
        let j; if (t < s0('B3')) j = {s: 'stand', x: VASE[0], y: VASE[1], sc: .32, gest: 'flowerUp'}; else if (t < s0('B8')) j = {s: 'stand', x: NEAR[0], y: NEAR[1], sc: .32, gest: t < ev('GIVE') ? 'kaleL' : 'standDown', lean: t >= s0('B5') && t < en('B5') ? -.12 : 0};
        else { j = walkOut(t, s0('B10') + .3, VASE[0], VASE[1], 1.5) || {s: 'stand', x: VASE[0], y: VASE[1], sc: .32, gest: 'standDown'}; }
        return {m: {s: 'off'}, j, r: walkIn(t, ev('ENTER_R'))}; },
      kale: t => t >= ev('GIVE'),
      ficus: [s0('B7') - .1, en('B7') + .3],
      defx: [['s', ev('TURBAN') + .35, 999, {curlers: true}]],
      world: [[0, ev('ENTER_R'), {a: 'vase', x: 300, y: 965, layer: 'desk'}], [0, s0('B3'), {a: 'flower', x: 258, y: 985, layer: 'top'}],
        [s0('B3'), ev('GIVE'), {a: 'kale', x: 300, y: 1330, s: .32, layer: 'top'}], [s0('B5'), en('B5'), {a: 'sniff', x: 325, y: 1255, layer: 'top'}],
        [s0('B11'), en('B11') + .2, {a: 'lipstick', hand: ['z', 1], dx: 0, dy: -10, s: .55, rot: -.25, layer: 'top'}],
        [ev('TURBAN') + .35, en('B22'), t => ({a: 'turban', hand: ['s', 0], dy: -25, s: .27, layer: 'top'})], [en('B22'), 999, {a: 'turban', x: 760, y: 935, s: .16, layer: 'desk'}]],
      plates: [[0, en('B1') + .4, 'ЭЛЬВИРА', 'ведущая'], [s0('B3'), en('B3') + .3, 'БРИТТАНИ', 'невеста'], [s0('B4'), en('B4'), 'ЖАННА', 'сваха с Брайтона'], [s0('B7'), en('B7') + .2, 'ЗВЕЗДАНА', 'астролог'],
        [s0('B2'), en('B2'), 'ДЖОШ', 'жених №2, веган'], [ev('ENTER_R') + .4, en('B12'), 'РАЙАН', 'жених №3, миллионер']],
      gloss: [['B2', 'vegan', 'vegan', 'веган'], ['B3', 'kale', 'kale', 'капуста кейл'], ['B6', 'plants', 'only plants', 'только растения'], ['B16', 'paper', 'on paper', 'на бумаге'],
        ['BLEEP', '', 'Oh shoot!', 'приличное «блин»'], ['B23', 'back', 'pay back', 'вернуть долг'], ['B27', 'nobody', 'nobody', 'никто']],
      spl: {B2: [["Sorry. I'm vegan.", 'Простите. Я веган.']], B3: [['I brought you kale!', 'Принёс тебе кейл!']], B6: [['Only plants.', 'Только растения.']], B8: [['Is that… broccoli?', 'Это что… брокколи?']],
        B12: [["I'm Ryan. I'm a millionaire!", 'Я Райан. Я миллионер!']], B16: [['Well… on paper.', 'Ну… на бумаге.']], B17: [['Oh— *', '']], B18: [['Okay… I WAS a millionaire.', 'Ладно… я БЫЛ миллионером.']],
        B23: [["I'll pay you back! In flowers!", 'Я верну долг! Цветами!']], B24: [['Yum!', 'Ням!']], B27: [['Can I choose… nobody?', 'А можно выбрать… никого?']]},
      mp: {B1: 'angry', B2: 'grin', B3: 'grin', B4: 'smugside', B5: 'smug', B6: 'kind', B7: 'angry', B8: 'surprised', B9: 'laugh', B10: 'angry', B11: 'flat', B12: 'proud', B13: 'flirty', B14: 'angry', B15: 'surprised',
        B16: 'smug', B17: 'shocked', B18: 'sad', B19: 'smugside', B20: 'worried', B21: 'surprised', B22: 'flat', B23: 'grin', B24: 'grin', B25: 'smug', B26: 'flat', B27: 'worried', B28: 'kind'}};
  }
  if (EP === 3) P = {
    shots: [[0, 'CU', 'b'], [s0('C2'), 'SB_INS', null, {ins: 'petroRev'}], [ev('REWIND'), 'GROOMS', null, {rewind: [ev('REWIND'), ev('REWIND') + 1.0], layer: {hosts: 0, fg: 1, aud: 0}}], [at('C3', .5), 'MCU', 'e'], [s0('C4'), 'CU', 'z'], [s0('C5'), 'CU', 'b'], [s0('C6'), 'CU', 'm'],
      [s0('C7'), 'CU', 'j'], [s0('C8'), 'GROOMS', null, {layer: {hosts: 0, fg: 1, aud: 0}}], [s0('C9'), 'MCU', 'z'], [at('C9', .5), 'PUSH', 'z', {x: at('C9', .55)}], [s0('C10'), 'ASTRO', 'zero'], [s0('C11'), 'CU', 'b'], [s0('C12'), 'MCU', 'z'], [s0('C13'), 'PUSH', 'z', {x: s0('C13') + .1}],
      [ev('BEAT') - .1, 'SB_INS', null, {ins: 'petroRev'}], [en('C14') + .45, 'HOSTS'], [s0('C15'), 'CU', 'b'], [s0('C16'), 'INS_tarot', 'married'], [s0('C17'), 'CU', 'b'], [s0('C18'), 'CU', 'z'],
      [s0('C19'), 'MCU', 'e'], [s0('C20'), 'CU', 'z'], [s0('C21'), 'CU', 'b'], [ev('PAPER'), 'SB_INS', null, {ins: 'petroRev2'}], [s0('C23'), 'CU', 'b'], [at('C23', .56), 'WIDE'], [s0('C24'), 'SB_INS', null, {ins: 'ball100'}],
      [s0('C25'), 'CU', 'z'], [s0('C26'), 'SB_INS', null, {ins: 'petroRev'}], [ev('MEOW'), 'CUSTOM', null, {cam: {z: 1.95, x: 280, y: 1450}, layer: {hosts: 1, fg: 1, aud: 0, plant: 1}}], [s0('C28'), 'CUSTOM', null, {cam: {z: 2.25, x: 300, y: 1420}, layer: {hosts: 1, fg: 1, aud: 0, plant: 1}}], [s0('C29'), 'MCU', 'e']],
    gest: [['b', s0('C1'), en('C1') + .3, 'pointHall'], ['j', s0('C7'), en('C7') + .2, 'kaleOut'], ['b', s0('C11'), en('C11'), 'tear'], ['z', s0('C18'), at('C18', .8), 'earring'], ['z', s0('C20'), at('C20', .8), 'earringL'],
      ['z', s0('C25'), at('C25', .4), 'earring'], ['z', at('C25', .45), at('C25', .9), 'earringL'], ['s', s0('C16') - .3, en('C16') + .2, 'card']],
    mood: [['b', s0('C11'), en('C11'), 'sad'], ['b', s0('C15'), en('C15'), 'flirty'], ['z', ev('LAUGH1'), ev('LAUGH1') + 1.2, 'laugh'], ['z', s0('C15'), en('C17') + .7, 'angry'], ['e', s0('C18'), en('C19'), 'shocked'],
      ['m', s0('C3'), en('C8') + .5, 'worried'], ['b', ev('MEOW'), 99, 'happy']],
    look: [['e', s0('C29'), 99, 0], ['b', s0('C21'), en('C21'), .6]],
    lean: [['b', s0('C21'), en('C21'), .06]],
    grooms: t => SOFA3,
    bride: t => t >= ev('MEOW') - .05 ? 'off' : 'seat',
    defx: [['z', at('C18', .6), at('C25', .4), {ears: [-1]}], ['z', at('C20', .6), at('C25', .4), {ears: []}], ['z', at('C25', .4), at('C25', .85), {ears: [1]}]],
    world: [[s0('C7'), en('C7') + .2, {a: 'kale', hand: ['j', 1], dx: 0, dy: -10, s: .3, layer: 'front'}],
      [s0('C18') + .35, at('C18', .8), {a: 'earring', hand: ['z', 1], dx: 6, dy: -18, s: .55, layer: 'top'}], [s0('C20') + .35, at('C20', .8), {a: 'earring', hand: ['z', -1], dx: -6, dy: -18, s: .55, layer: 'top'}],
      [s0('C25') + .35, at('C25', .4), {a: 'earring', hand: ['z', 1], dx: 6, dy: -18, s: .55, layer: 'top'}], [at('C25', .45) + .35, at('C25', .9), {a: 'earring', hand: ['z', -1], dx: -6, dy: -18, s: .55, layer: 'top'}],
      [at('C23', .5), s0('C24'), t => catPath(t, at('C23', .5), BY.C24.at - at('C23', .5), [-80, 1440], [300, 1440], .28)],
      [ev('MEOW'), 99, t => ({a: 'catSit', x: 190, y: 1440, s: .42, meow: t > ev('MEOW') + .6 && t < ev('MEOW') + 1.3})],
      [ev('MEOW'), 99, t => ({a: 'brideStand', x: 390, y: 1580, s: .36, mood: t > BY.C28.at ? 'laugh' : 'happy', look: -.8})],
      [s0('C28') + .4, 99, {a: 'money', x: 300, y: 1420, s: .32}]],
    plates: [[0, en('C1') + .3, 'БРИТТАНИ', 'невеста'], [s0('C2'), en('C2') + .6, 'ПЕТРОВИЧ', 'муж Жанны. Говорит только «Угу»'], [at('C23', .6), BY.C24.at - .1, 'КОТ', 'ради него бывший бросил Бриттани', 420]],
    gloss: [['C6', 'split', 'split', 'пополам'], ['C10', 'compatibility', 'compatibility', 'совместимость'], ['C15', 'single', 'single', 'не женат'], ['C17', 'trained', 'trained', 'дрессированный'],
      ['C24', 'match', 'perfect match', 'идеальная пара'], ['C29', 'husband', 'the husband или the cat?', 'пишите в комментариях']],
    spl: {C1: [['I choose… HIM.', 'Я выбираю… ЕГО.']], C5: [['I choose the one who pays for dinner.', 'Выбираю того, кто платит за ужин.']], C6: [['Can we split it?', 'А можно пополам?']],
      C7: [['I can pay… with kale!', 'Могу заплатить… кейлом!']], C8: [['Do you take coins?', 'А монетками можно?']], C10: [['The stars say… compatibility zero.', 'Звёзды говорят… совместимость ноль.']],
      C11: [['So… nobody pays?', 'Значит… никто не платит?']], C15: [['Is he… single?', 'Он… не женат?']], C16: [["He's married.", 'Он женат.']], C17: [['Married? Good.', 'Женат? Отлично.'], ["So he's trained.", 'Значит, дрессированный.']],
      C21: [['Hi, Petrovich…', 'Привет, Петрович…'], ['I choose you.', 'Я выбираю тебя.']], C23: [['Okay. Plan B…', 'Ладно. План Б…'], ['the cat!', 'кот!']]},
    mp: {C1: 'flirty', C2: 'neutral', C3: 'flat', C4: 'smugside', C5: 'proud', C6: 'worried', C7: 'grin', C8: 'grin', C9: 'proud', C10: 'dreamy', C11: 'sad', C12: 'kind', C13: 'grin', C15: 'flirty', C16: 'dreamy',
      C17: 'smug', C18: 'angry', C19: 'shocked', C20: 'angry', C21: 'flirty', C23: 'grin', C24: 'dreamy', C25: 'kind', C28: 'proud', C29: 'proud'}};
  P.hook = HOOK; return P;
};
