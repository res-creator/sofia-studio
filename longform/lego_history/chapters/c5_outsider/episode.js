// CHAPTER 5 · The Outsider (2004–2005), lines o1–o8.
const L = require('../../film/lib.js'), { S, cam, place, plate, actor, rest, stat, small, card, town, townLights, prop, size, tx, sc, dep, clamp, lerp, ss, ease, hash, Puppet } = L;
const BOARD = [[0, 470], [380, 380], [1200, 380], [1536, 470], [1536, 864], [0, 864]], DESK01 = [[0, 657], [1536, 645], [1536, 864], [0, 864]], MON = [[1168, 418], [1300, 405], [1536, 430], [1536, 864], [1150, 864]];
const ODD = ['odd_dish_orange', 'odd_wing_magenta', 'odd_arch_lime', 'odd_claw_purple', 'odd_dome_turquoise', 'odd_pipe_pink', 'odd_gear_grey', 'odd_baseplate_sand'];
L.chapter(module, __dirname, ({ at, L: LS, T, fx, music }) => {
  const o1 = LS.o1, o2 = LS.o2, o3 = LS.o3, o4 = LS.o4, o5 = LS.o5, o6 = LS.o6, o7 = LS.o7, o8 = LS.o8;
  const stepped = at('o1', 'stepped'), handed = at('o1', 'handed'), outside = at('o1', 'outside'), young = at('o1', 'young'), name = at('o1', 'Knudstorp'), thirty = at('o1', 'thirty');
  const three = at('o2', 'three'), goal = at('o2', 'goal'), surv = at('o2', 'survival'), cash = at('o2', 'cash'), cut = at('o2', 'cut');
  const backed = at('o3', 'backed'), legoland = at('o3', 'Legoland'), y68 = at('o3', '1968'), sold = at('o3', 'sold'), seventy = at('o3', 'seventy'), blackstone = at('o3', 'Blackstone'), euros = at('o3', 'euros');
  const pieces = at('o4', 'pieces'), existed = at('o4', 'existed'), half = at('o4', 'half'), seven = at('o4', 'seven');
  const fewer = at('o5', 'fewer'), police = at('o5', 'police'), fire = at('o5', 'fire'), race = at('o5', 'race');
  const retail = at('o6', 'retailers'), unfocused = at('o6', 'unfocused'), planned = at('o6', 'planned');
  const fans = at('o7', 'fans'), adults = at('o7', 'adults'), y98 = at('o7', '1998'), student = at('o7', 'student'), robot = at('o7', 'robot'), sue = at('o7', 'sue'), y05 = at('o7', '2005'), convention = at('o7', 'convention');
  const worked = at('o8', 'worked'), profit = at('o8', 'profit'), five = at('o8', 'five');
  music.push([0, 'tension'], [o2 - 0.3, 'drive'], [o3 + 1, 'tension'], [o4 - 0.3, 'drive'], [o7 - 0.3, 'warm'], [o8 - 0.3, 'triumph']);
  fx('thump', 0.6, 0.5); fx('click', 0.95, 0.7); fx('steps', o1 + 0.5, 0.3); fx('squeak', stepped + 0.2, 0.3); fx('steps', young - 0.6, 0.4); fx('ding', name, 0.4);
  fx('flip', three, 0.4); fx('stamp', surv, 0.6); fx('kaching', cash, 0.4); fx('snip', cut, 0.6); fx('snip', cut + 0.35, 0.5);
  fx('whoosh', legoland - 0.3, 0.5); fx('wind', y68, 0.3); fx('tag', sold, 0.6); fx('stamp', seventy, 0.6); fx('coins', euros, 0.4);
  fx('whoosh', o4 - 0.2, 0.4); fx('boing', existed - 0.4, 0.3); fx('slidedown', half, 0.6); fx('rumble', half + 0.2, 0.3);
  for (let i = 0; i < 12; i++) fx('click', fewer + 0.2 + i * 0.32, 0.4);
  fx('whoosh', o6 - 0.2, 0.4); fx('paper', planned, 0.4); fx('ding', planned + 0.6, 0.3);
  fx('murmur', o7, 0.4); fx('scan', robot, 0.4); fx('pop', sue + 0.2, 0.3); fx('applause', convention, 0.5);
  fx('rise', worked, 0.4); fx('kaching', profit, 0.6); fx('sparkle', five, 0.5); fx('crowdcheer', five + 0.4, 0.25);
  const KJ1 = Puppet.acting({ expr: [[0, 'worried'], [handed - 0.2, 'neutral'], [young, 'smile']], blinks: [o1 + 1.3, handed + 1], tilt: [[stepped, -0.04], [young, 0.04]], nods: [handed],
    gestures: { R: [[handed - 0.1, 99, 'offer']] } });
  const JK1 = Puppet.acting({ expr: [[0, 'neutral'], [name - 0.4, 'determined']], blinks: [name + 0.8, thirty + 1], tilt: [[name, 0.03]], nods: [thirty] });
  const JK2 = Puppet.acting({ expr: [[0, 'determined'], [goal, 'talk'], [surv, 'determined'], [cash, 'talk'], [cut - 0.2, 'determined']], blinks: [o2 + 1.2, cash + 1.2], tilt: [[goal, -0.04], [surv, 0.05], [cut, -0.03]], nods: [surv, cut],
    gestures: { R: [[surv - 0.2, cut + 1, 'point', { wag: 1, wagUntil: surv + 0.8 }]], L: [[cash - 0.1, cut, 'palm']] } });
  const KJ3 = Puppet.acting({ expr: [[0, 'neutral'], [backed - 0.2, 'smile'], [legoland, 'sad']], blinks: [o3 + 1, legoland + 1.2], tilt: [[backed, 0.05], [legoland, -0.06]], nods: [backed] });
  const JK7 = Puppet.acting({ expr: [[0, 'smile']], blinks: [convention + 1], tilt: [[convention, 0.05]], nods: [convention + 0.3], gestures: { R: [[convention - 0.3, 99, 'palm']] } });
  return [
    { t0: 0, draw(ctx, t, lt) { card(ctx, t, lt, 'p7_boardroom', 5, 'The Outsider', '2004 – 2005'); } },
    // 1 · October 2004: Kjeld offers the chair to the outsider
    { t0: o1 - 0.2, in: 'black', draw(ctx, t, lt) { const g = lt + o1 - 0.2, c_ = cam([[0, 760, 380, 1.12], [young - o1, 900, 360, 1.3], [o2 - o1, 980, 340, 1.5]], lt);
        S.world(ctx, c_, 1, c => { plate(c, 'p7_boardroom', { filter: 'sepia(0.15) brightness(1.03)' });
          actor(c, 'owner', 560, 262, 0.4, KJ1(g), t, { look: 'board', wall: 50 });
          const w = clamp((g - young + 0.8) / 1.2); actor(c, 'outsider', lerp(1500, 1000, ease.out(w)), 268 + Math.abs(Math.sin(w * Math.PI * 4)) * -4 * (w < 1), 0.4, JK1(g), t, { look: 'board', wall: 50 });
          S.reveal(c, L.A.plate.p7_boardroom, BOARD); });
        S.grade(ctx, 0.07, 0.42); small(ctx, 'OCTOBER 2004', 260, 120, ss((g - o1) / 0.3), 48, '#F2C14E');
        small(ctx, 'FIRST CEO FROM OUTSIDE THE FAMILY', S.W / 2, 980, ss((g - outside) / 0.3) * (1 - ss((g - name) / 0.3)), 42, '#F2C14E'); stat(ctx, 'AGE 35', 1500, 860, ss((g - thirty) / 0.3), 80, '#FFF4DC', { pop: 1 }); } },
    // 2 · survival first: cash, cuts
    { t0: o2 - 0.2, in: 'whip', draw(ctx, t, lt) { const g = lt + o2 - 0.2, c_ = cam([[0, 760, 400, 1.3], [surv - o2, 680, 380, 1.45], [o3 - o2, 680, 380, 1.5]], lt);
        S.world(ctx, c_, 1, c => { plate(c, 'p14_office2001'); actor(c, 'outsider', 700, 300, 0.62, JK2(g), t, { look: 'office01', wall: 80 }); S.reveal(c, L.A.plate.p14_office2001, DESK01); S.reveal(c, L.A.plate.p14_office2001, MON);
          const sc_ = ss((g - cut) / 0.3); if (sc_ > 0) { place(c, 'thing_scissors', 300, 760, 0.42, { look: 'office01', depth: 1, r: Math.sin((g - cut) * 9) * 0.25 * (g < cut + 0.8), noShadow: 1 }); } });
        S.grade(ctx, 0.07, 0.42); stat(ctx, 'NOT GROWTH.', 1430, 300, ss((g - goal) / 0.3), 76, '#FFB4A0'); stat(ctx, 'SURVIVAL.', 1430, 400, ss((g - surv) / 0.3), 96, '#9EE09E', { pop: 1 });
        small(ctx, 'CONTROL THE CASH · CUT THE REST', 1430, 500, ss((g - cash) / 0.3), 38, '#F2C14E'); } },
    // 3 · the family backs him · even Legoland is sold (70 % to Blackstone)
    { t0: o3 - 0.2, in: 'cut', draw(ctx, t, lt) { const g = lt + o3 - 0.2;
        if (g < legoland - 0.1) { const c_ = cam([[0, 560, 330, 1.5], [legoland - o3, 540, 320, 1.6]], lt);
          S.world(ctx, c_, 1, c => { plate(c, 'p7_boardroom', { filter: 'sepia(0.1)' }); actor(c, 'owner', 560, 262, 0.4, KJ3(g), t, { look: 'board' }); S.reveal(c, L.A.plate.p7_boardroom, BOARD); });
          S.grade(ctx, 0.07, 0.42); small(ctx, 'THE FAMILY STAYS · AND BACKS HIM', S.W / 2, 980, ss((g - backed) / 0.3), 42, '#F2C14E'); return; }
        const c_ = cam([[0, 768, 380, 1.05], [sold - legoland, 768, 360, 1.25], [o4 - legoland, 768, 360, 1.32]], lt), dim = ss((g - sold) / 1.2);
        S.world(ctx, c_, 1, c => { plate(c, 'p11_parkgate', { filter: `saturate(${1 - 0.45 * dim}) brightness(${1 - 0.25 * dim})` });
          const tg = ss((g - seventy + 0.2) / 0.4); if (tg > 0) { c.save(); c.translate(768, 210); c.rotate(Math.sin(t * 2.4) * 0.12 * tg); place(c, 'thing_tag', 0, 140 * tg + 40, 0.75, { look: 'park', depth: 1, noShadow: 1, ay: 0.1 }); small(c, 'SOLD 70%', 0, 140 * tg + 150, tg, 44, '#5A2A10'); c.restore(); } });
        S.grade(ctx, 0.06, 0.42); small(ctx, 'LEGOLAND · BILLUND · OPENED 1968', S.W / 2, 140, ss((g - legoland) / 0.3) * (1 - ss((g - sold) / 0.3)), 44, '#F2C14E');
        small(ctx, '2005 · BLACKSTONE · €375 MILLION', S.W / 2, 1000, ss((g - blackstone) / 0.3), 46, '#FFF4DC'); } },
    // 4 · the pieces: designers get existing ones · half the bins slide away
    { t0: o4 - 0.2, in: 'whip', draw(ctx, t, lt) { const g = lt + o4 - 0.2;
        if (g < half - 0.4) { const c_ = cam([[0, 860, 470, 1.25], [half - o4, 860, 470, 1.35]], lt);
          S.world(ctx, c_, 1, c => { plate(c, 'p8_studio'); place(c, 'designer_offer', 900, 900, 0.62, { look: 'studio', depth: 0.9 });
            const u = ss((g - existed + 0.6) / 0.5); place(c, 'odd_wing_magenta', 600, 600 - u * 300, 0.16, { look: 'studio', depth: 0.9, a: 1 - u, r: u * 2 });
            place(c, 'brick_red_2x4', 640, 620, 0.12 * ss((g - existed) / 0.3) + 0.0001, { look: 'studio', depth: 0.9 }); });
          S.grade(ctx, 0.05, 0.4); small(ctx, 'USE WHAT ALREADY EXISTS', S.W / 2, 160, ss((g - existed) / 0.3), 50, '#9EE09E'); return; }
        const c_ = cam([[0, 768, 440, 1.05], [T, 768, 440, 1.12]], lt), sl = ss((g - half) / 1.2);
        S.world(ctx, c_, 1, c => { plate(c, 'p9_warehouse');
          // a curtain of darkness slides over the outer half of the racks (bins retired)
          c.save(); c.fillStyle = `rgba(12,10,14,${0.82 * sl})`; c.fillRect(0, 0, 420 * sl, 864); c.fillRect(1536 - 420 * sl, 0, 420 * sl, 864); c.restore();
          for (let i = 0; i < 18; i++) { const u = clamp((g - half - hash(i) * 0.8) / 0.7); if (u <= 0 || u >= 1) continue; const side = i % 2 ? 1 : -1;
            S.sprite(c, prop('biz_bin_one_piece'), 768 + side * (300 + hash(i * 3) * 300) + side * u * 500, 200 + hash(i * 5) * 400, 0.12, { pre: 1.5, a: 1 - u }); } });
        S.grade(ctx, 0.04, 0.45);
        const n = Math.round(lerp(12900, 7000, ss((g - half) / 1.6)) / 100) * 100; stat(ctx, (g > seven ? '≈ ' : '') + n.toLocaleString('en-US'), S.W / 2, 220, ss((g - half + 0.2) / 0.3), 120, '#FFF4DC'); small(ctx, 'DIFFERENT ELEMENTS · CUT ROUGHLY IN HALF', S.W / 2, 330, ss((g - half) / 0.3), 40, '#9EE09E'); } },
    // 5 · fewer pieces, used again and again: police station, fire truck, race car
    { t0: o5 - 0.2, in: 'cut', draw(ctx, t, lt) { const g = lt + o5 - 0.2, c_ = cam([[0, 745, 450, 1.3], [o6 - o5, 745, 440, 1.16]], lt);
        const n = clamp((g - fewer) / 3.6) * 14;
        S.world(ctx, c_, 1, c => { plate(c, 'p5_tabletop'); town(c, lt, { n }); S.beams(c, t, 1350, 60, 2.55, 3, 0.06, 1300); S.dust(c, t, 300, 150, 1100, 600, 40); });
        S.grade(ctx, 0.07, 0.42); [['POLICE STATIONS', police], ['FIRE TRUCKS', fire], ['RACE CARS', race]].forEach(([s, t0], i) => small(ctx, s, 420 + i * 540, 990, ss((g - t0) / 0.3), 42, '#F2C14E')); } },
    // 6 · back to the big retailers
    { t0: o6 - 0.2, in: 'whip', draw(ctx, t, lt) { const g = lt + o6 - 0.2, c_ = cam([[0, 768, 470, 1.15], [o7 - o6, 900, 500, 1.3]], lt), wel = g > planned;
        S.world(ctx, c_, 1, c => { plate(c, 'p6_superstore'); place(c, wel ? 'buyer_welcome' : 'buyer_crossed', 1100, 900, 0.68, { look: 'store', depth: 1 }); });
        S.grade(ctx, 0.02, 0.4); small(ctx, '"UNFOCUSED · SELF-CENTERED"', 640, 220, ss((g - unfocused) / 0.3) * (1 - ss((g - planned) / 0.3)), 46, '#FFB4A0');
        small(ctx, 'PLANNING THE YEAR AROUND THE RETAILERS', 640, 220, ss((g - planned - 0.2) / 0.3), 40, '#9EE09E'); } },
    // 7 · adult fans: 1998 robot brick cracked open, not sued · 2005 convention
    { t0: o7 - 0.2, in: 'cut', draw(ctx, t, lt) { const g = lt + o7 - 0.2;
        if (g > y98 - 0.3 && g < y05 - 0.2) { const c_ = cam([[0, 768, 500, 1.6], [y05 - y98, 768, 480, 1.75]], lt);
          S.world(ctx, c_, 1, c => { plate(c, 'p14_office2001', { blur: 4, filter: 'brightness(0.55) sepia(0.4)' });
            const op = ss((g - robot) / 0.5); place(c, 'toy_robot_brick', 768, 700, 0.5, { look: 'office01', depth: 1 }); if (op > 0) S.glow(c, 768, 560, 200, 'rgba(120,200,255,1)', 0.35 * op);
            if (g > sue) { c.save(); c.strokeStyle = '#9EE09E'; c.lineWidth = 8; c.globalAlpha = ss((g - sue) / 0.3); c.beginPath(); c.arc(1150, 420, 70, 0, 6.28); c.stroke(); c.beginPath(); c.moveTo(1110, 420); c.lineTo(1140, 450); c.lineTo(1195, 390); c.stroke(); c.restore(); } });
          S.grade(ctx, 0.04, 0.55); small(ctx, '1998', 260, 120, 1, 60, '#F2C14E'); small(ctx, 'A STUDENT CRACKS THE ROBOT BRICK', S.W / 2, 980, ss((g - student) / 0.3), 44); stat(ctx, 'NOT SUED', 1380, 230, ss((g - sue) / 0.3), 80, '#9EE09E', { pop: 1 }); return; }
        const c_ = cam([[0, 768, 470, 1.1], [y98 - o7, 760, 460, 1.25], [y05 - o7, 900, 420, 1.15], [o8 - o7, 1000, 400, 1.35]], lt);
        S.world(ctx, c_, 1, c => { plate(c, 'p12_convention');
          place(c, 'fan_model', 330, 900, 0.62, { look: 'hall', depth: 0.9 }); place(c, g > convention ? 'fan_handshake' : 'fan_model', 1180, 1010, 0.78, { look: 'hall', depth: 0.95, flip: true });
          if (g > y05) actor(c, 'outsider', 820, 600, 0.6, JK7(g), t, { look: 'hall' }); });
        S.grade(ctx, 0.06, 0.42); small(ctx, 'ADULT FANS', S.W / 2, 160, ss((g - adults) / 0.3) * (1 - ss((g - y98 + 0.3) / 0.3)), 56, '#F2C14E'); small(ctx, '2005 · FAN CONVENTION', S.W / 2, 160, ss((g - convention) / 0.3), 48, '#F2C14E'); } },
    // 8 · back in profit: the lights come back on
    { t0: o8 - 0.2, in: 'flash', draw(ctx, t, lt) { const g = lt + o8 - 0.2, on = ss((g - worked) / 2.2), c_ = cam([[0, 745, 450, 1.3], [T - o8, 745, 440, 1.14]], lt);
        S.world(ctx, c_, 1, c => { plate(c, 'p5_tabletop', { filter: `brightness(${0.55 + 0.45 * on})` }); town(c, lt, {}); townLights(c, t, on); S.beams(c, t, 1350, 60, 2.55, 3, 0.07 * on, 1300); });
        S.grade(ctx, 0.08 * on, 0.5 - 0.1 * on); stat(ctx, '2005: BACK IN PROFIT', S.W / 2, 180, ss((g - profit) / 0.3), 90, '#9EE09E', { pop: 1 }); small(ctx, '≈ DKK 500 MILLION', S.W / 2, 280, ss((g - five) / 0.3), 52, '#FFF4DC'); } },
  ];
});
