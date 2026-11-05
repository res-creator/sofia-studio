// CHAPTER 4 · The Year Without a Movie (2003–2004), lines y1–y6.
const L = require('../../film/lib.js'), { S, cam, place, plate, actor, rest, stat, small, card, town, townLights, prop, size, tx, sc, dep, clamp, lerp, ss, ease, hash, Puppet } = L;
const BOARD = [[0, 470], [380, 380], [1200, 380], [1536, 470], [1536, 864], [0, 864]];
const ODD = ['odd_dish_orange', 'odd_wing_magenta', 'odd_arch_lime', 'odd_claw_purple', 'odd_dome_turquoise', 'odd_pipe_pink', 'odd_gear_grey', 'odd_baseplate_sand'];
L.chapter(module, __dirname, ({ at, L: LS, T, fx, music }) => {
  const y1 = LS.y1, y2 = LS.y2, y3 = LS.y3, y4 = LS.y4, y5 = LS.y5, y6 = LS.y6;
  const nostar = at('y1', 'Star'), nohp = at('y1', 'Harry');
  const fell = at('y2', 'fell'), quarter = at('y2', 'quarter'), us = at('y2', 'United'), third = at('y2', 'third'), half = at('y2', 'half'), stores = at('y2', 'stores'), less = at('y2', 'less');
  const hidden = at('y3', 'hidden'), every = at('y3', 'Every'), molds = at('y3', 'molds'), paid = at('y3', 'paid'), whether = at('y3', 'whether');
  const jan = at('y4', 'January'), record = at('y4', 'record'), point = at('y4', 'record') + 0.9, tax = at('y4', 'tax'), left = at('y4', 'turnaround'), kjeld = at('y4', 'Kjeld'), himself = at('y4', 'himself');
  const finance = at('y5', 'finance'), product = at('y5', 'product'), worse = at('y5', 'worse'), sixty = at('y5', 'sixty'), all = at('y5', 'all'), else_ = at('y5', 'Everything'), losing = at('y5', 'losing'), destroying = at('y5', 'destroying');
  const y04 = at('y6', '2004'), real = at('y6', 'real'), survive = at('y6', 'survive');
  music.push([0, 'dark'], [y3 - 0.4, 'tension'], [y5 - 0.3, 'dark'], [y6 - 0.3, 'dark']);
  fx('thump', 0.6, 0.5); fx('click', 0.95, 0.7); fx('wind', y1, 0.4); fx('power', nostar - 0.2, 0.0); fx('buzz', nostar + 0.3, 0.35); fx('buzz', nohp + 0.2, 0.35);
  fx('slidedown', fell, 0.6); fx('stamp', quarter, 0.5); fx('stamp', third, 0.5); fx('paper', stores, 0.5); fx('tear', less, 0.5);
  fx('factory', hidden, 0.45); fx('machine', every, 0.4); fx('coins', paid, 0.45); fx('coins', whether, 0.35);
  fx('whoosh', y4 - 0.2, 0.4); fx('stamp', record, 0.7); fx('steps', left, 0.4); fx('slam', left + 1.2, 0.4); fx('thump', himself, 0.5);
  fx('paper', finance, 0.5); fx('flip', product, 0.4); fx('power', sixty, 0.4); fx('buzz', else_ + 0.2, 0.3); fx('gasp', destroying, 0.3);
  fx('heartbeat', y6, 0.6); fx('heartbeat', real, 0.6); fx('power', survive, 0.0); fx('wind', survive, 0.5);
  const KJ = Puppet.acting({ expr: [[0, 'worried'], [kjeld, 'neutral'], [himself, 'worried']], blinks: [y4 + 1.2, kjeld + 1], tilt: [[kjeld, 0.03], [himself, -0.04]], nods: [himself] });
  const KJ5 = Puppet.acting({ expr: [[0, 'neutral'], [sixty, 'worried'], [losing, 'sad'], [destroying, 'worried']], blinks: [y5 + 1.5, sixty + 1.2, losing + 1.4], tilt: [[sixty, -0.05], [losing, 0.04]] });
  return [
    { t0: 0, draw(ctx, t, lt) { card(ctx, t, lt, 'p13_cinema', 4, 'The Year Without a Movie', '2003 – 2004'); } },
    // 1 · 2003: the marquee goes dark
    { t0: y1 - 0.2, in: 'black', draw(ctx, t, lt) { const g = lt + y1 - 0.2, off = ss((g - nostar) / 0.4), c_ = cam([[0, 760, 420, 1.1], [y2 - y1, 760, 360, 1.35]], lt);
        S.world(ctx, c_, 1, c => { plate(c, 'p13_cinema', { filter: `brightness(${1 - 0.6 * off}) saturate(${1 - 0.5 * off})` }); });
        S.grade(ctx, 0.02, 0.5 + 0.2 * off); stat(ctx, '2003', S.W / 2, 160, ss((g - y1) / 0.3), 110, '#FFF4DC', { pop: 1 });
        small(ctx, 'NO NEW SPACE SAGA', S.W / 2, 900, ss((g - nostar) / 0.3), 46, '#FFB4A0'); small(ctx, 'NO NEW BOY WIZARD', S.W / 2, 965, ss((g - nohp) / 0.3), 46, '#FFB4A0'); } },
    // 2 · sales fall, stores order less (the buyer crosses her arms)
    { t0: y2 - 0.2, in: 'whip', draw(ctx, t, lt) { const g = lt + y2 - 0.2, c_ = cam([[0, 768, 470, 1.15], [stores - y2, 900, 520, 1.35]], lt);
        S.world(ctx, c_, 1, c => { plate(c, 'p6_superstore', { filter: 'saturate(0.7) brightness(0.9)' });
          // boxes slide off the shelf and fall away (fewer and fewer)
          for (let i = 0; i < 10; i++) { const u = clamp((g - fell - i * 0.2) / 0.8); if (u <= 0 || u >= 1) continue; const side = i % 2 ? 1 : -1;
            place(c, 'thing_set_box', 768 + side * (300 + i * 20), 450 + ease.in(u) * 500, 0.2, { look: 'store', depth: 1, noShadow: 1, r: u * 2 * side, a: 1 - u * 0.3 }); }
          const b = ss((g - stores) / 0.4); if (b > 0) place(c, 'buyer_crossed', 1180, 900, 0.68, { look: 'store', depth: 1, a: b }); });
        S.grade(ctx, 0.0, 0.45);
        stat(ctx, 'SALES −26%', 620, 220, ss((g - quarter + 0.3) / 0.3), 100, '#FFB4A0', { pop: 1 }); small(ctx, 'USA ≈ −35%', 620, 330, ss((g - third + 0.2) / 0.3), 52, '#FFB4A0');
        small(ctx, 'MORE THAN HALF: MOVIE SETS', 620, 410, ss((g - half) / 0.3), 40, '#F2C14E'); } },
    // 3 · the hidden cost: machines keep running into bins that never empty
    { t0: y3 - 0.2, in: 'cut', draw(ctx, t, lt) { const g = lt + y3 - 0.2, c_ = cam([[0, 768, 470, 1.25], [paid - y3, 768, 440, 1.05]], lt);
        S.world(ctx, c_, 1, c => { plate(c, 'p10_factory_modern');
          // pieces travelling on the conveyor (lower left, receding toward the vanishing point)
          for (let i = 0; i < 14; i++) { const u = ((t * 0.18 + i / 14) % 1), x = lerp(60, 720, u), y = lerp(760, 470, u), s = lerp(0.2, 0.03, u);
            S.sprite(c, prop(ODD[i % 8]), x, y, s, { pre: 1.5, r: i }); }
          // coins leave with every batch
          if (g > paid) for (let i = 0; i < 16; i++) { const h = hash(i * 7.3), u = ((g - paid) * 0.6 + h) % 1; S.sprite(c, prop('biz_coins'), 900 + h * 400 + u * 200, 480 + u * 380, 0.06, { pre: 1.5, a: 1 - u, r: u * 4 }); } });
        S.grade(ctx, 0.0, 0.45); small(ctx, 'THE HIDDEN COST', S.W / 2, 160, ss((g - hidden) / 0.3), 60, '#FFF4DC');
        small(ctx, 'MOLDS · BINS · PRODUCTION RUNS', S.W / 2, 240, ss((g - molds) / 0.3), 40, '#F2C14E'); small(ctx, 'PAID FOR — SOLD OR NOT', S.W / 2, 1000, ss((g - whether) / 0.3), 46, '#FFB4A0'); } },
    // 4 · January 2004: record loss · the manager leaves · Kjeld takes the chair
    { t0: y4 - 0.2, in: 'whip', draw(ctx, t, lt) { const g = lt + y4 - 0.2, c_ = cam([[0, 768, 380, 1.12], [kjeld - y4, 700, 360, 1.3]], lt);
        S.world(ctx, c_, 1, c => { plate(c, 'p7_boardroom', { filter: 'saturate(0.7) hue-rotate(-8deg) brightness(0.88)' });
          const k = ss((g - kjeld) / 0.6); actor(c, 'owner', 700, 262 + (1 - k) * 30, 0.4, KJ(g), t, { look: 'board', a: k, wall: 50 });
          S.reveal(c, L.A.plate.p7_boardroom, BOARD);
          const lv = clamp((g - left) / 2.4); if (g < kjeld + 0.5) place(c, 'manager_leaving', lerp(1100, 1750, ease.in(lv)), 860, 0.62, { look: 'board', depth: 0.9 }); });
        S.grade(ctx, 0.0, 0.5); stat(ctx, '−DKK 1.4 BILLION', S.W / 2, 180, ss((g - point) / 0.3) * (1 - ss((g - left) / 0.3)), 100, '#FFB4A0', { pop: 1 });
        small(ctx, 'RECORD LOSS 2003 · BEFORE TAX', S.W / 2, 280, ss((g - tax) / 0.3) * (1 - ss((g - left) / 0.3)), 40, '#F2C14E'); small(ctx, 'JANUARY 2004', 260, 120, ss((g - jan) / 0.3), 48, '#F2C14E'); } },
    // 5 · product by product: 60 % of sales make all the profit; the rest loses money
    { t0: y5 - 0.2, in: 'cut', draw(ctx, t, lt) { const g = lt + y5 - 0.2, split = ss((g - sixty) / 0.8), dark = ss((g - else_) / 0.8), c_ = cam([[0, 760, 380, 1.4], [sixty - y5, 745, 440, 1.12], [T, 745, 440, 1.16]], lt);
        if (g < sixty - 0.3) { S.world(ctx, c_, 1, c => { plate(c, 'p7_boardroom', { filter: 'saturate(0.7) brightness(0.88)' }); actor(c, 'owner', 560, 262, 0.4, KJ5(g), t, { look: 'board' });
            S.reveal(c, L.A.plate.p7_boardroom, BOARD); place(c, 'finance_report', 1080, 860, 0.62, { look: 'board', depth: 0.9 }); });
          S.grade(ctx, 0.0, 0.5); small(ctx, 'PRODUCT BY PRODUCT', 1340, 980, ss((g - product) / 0.3), 40, '#F2C14E'); return; }
        S.world(ctx, c_, 1, c => { plate(c, 'p5_tabletop'); town(c, lt, {});
          // right 40 % of the town falls into shadow (losing money)
          if (dark > 0) { c.save(); c.globalCompositeOperation = 'multiply'; const gr = c.createLinearGradient(820, 0, 900, 0); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, `rgba(${255 - 190 * dark | 0},${255 - 195 * dark | 0},${255 - 170 * dark | 0},1)`);
            c.fillStyle = gr; c.fillRect(0, 0, 1536, 864); c.restore(); }
          if (split > 0) { c.save(); c.strokeStyle = `rgba(255,240,200,${0.8 * split})`; c.lineWidth = 3; c.setLineDash([12, 10]); c.beginPath(); c.moveTo(860, 300); c.lineTo(900, 864); c.stroke(); c.restore(); } });
        S.grade(ctx, 0.03, 0.45);
        stat(ctx, '60% OF SALES', 640, 200, ss((g - sixty) / 0.3), 84, '#9EE09E', { pop: 1 }); small(ctx, '= 100% OF THE PROFIT', 640, 290, ss((g - all) / 0.3), 44, '#9EE09E');
        stat(ctx, 'THE REST', 1450, 200, ss((g - else_) / 0.3), 84, '#FFB4A0', { pop: 1 }); small(ctx, 'LOSING MONEY', 1450, 290, ss((g - losing) / 0.3), 44, '#FFB4A0');
        small(ctx, '"DESTROYING VALUE SINCE 1993"', S.W / 2, 1000, ss((g - destroying) / 0.3), 44, '#FFF4DC'); } },
    // 6 · 2004 is worse: the town's lights go out one by one
    { t0: y6 - 0.2, in: 'black', draw(ctx, t, lt) { const g = lt + y6 - 0.2, d = ss((g - y04) / 3.5), c_ = cam([[0, 745, 440, 1.12], [T - y6, 745, 450, 1.28]], lt);
        S.world(ctx, c_, 1, c => { plate(c, 'p5_tabletop', { filter: `brightness(${1 - 0.65 * d}) saturate(${1 - 0.5 * d})` }); town(c, lt, { skip: d > 0.8 ? [3, 8] : [] }); townLights(c, t, 1 - d);
          c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = `rgba(${255 - 160 * d | 0},${255 - 150 * d | 0},${255 - 110 * d | 0},1)`; c.fillRect(0, 0, 1536, 864); c.restore(); });
        S.grade(ctx, 0.0, 0.5 + 0.3 * d); stat(ctx, '2004', S.W / 2, 170, ss((g - y04) / 0.3), 100, '#FFF4DC'); small(ctx, 'WILL LEGO SURVIVE?', S.W / 2, 1000, ss((g - survive + 0.2) / 0.4), 52, '#FFB4A0'); } },
  ];
});
