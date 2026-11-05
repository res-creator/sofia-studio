// CHAPTER 3 · Beyond the Brick (1998–2002), lines b1–b9.
const L = require('../../film/lib.js'), { S, cam, place, plate, actor, rest, stat, small, card, town, townLights, roof, TOWN, prop, size, tx, sc, dep, clamp, lerp, ss, ease, hash, Puppet } = L;
const BOARD = [[0, 470], [380, 380], [1200, 380], [1536, 470], [1536, 864], [0, 864]];
const ODD = ['odd_dish_orange', 'odd_wing_magenta', 'odd_arch_lime', 'odd_claw_purple', 'odd_dome_turquoise', 'odd_pipe_pink', 'odd_gear_grey', 'odd_baseplate_sand'];
L.chapter(module, __dirname, ({ at, L: LS, T, fx, music }) => {
  const b1 = LS.b1, b2 = LS.b2, b3 = LS.b3, b4 = LS.b4, b5 = LS.b5, b6 = LS.b6, b7 = LS.b7, b8 = LS.b8, b9 = LS.b9;
  const plougmann = at('b1', 'Poul'), diag = at('b1', 'diagnosis'), children = at('b1', 'children'), maybe = at('b1', 'Maybe');
  const setout = at('b2', 'set'), parks = at('b2', 'Theme'), cloth = at('b2', 'Clothing'), video = at('b2', 'Video'), tv = at('b2', 'Television'), other = at('b2', 'other'), sw = at('b2', 'Star'), hp = at('b2', 'Harry');
  const brill = at('b3', 'brilliant'), sold = at('b3', 'sold'), bion = at('b3', 'Bionicle'), hit = at('b3', 'hit');
  const y01 = at('b4', '2001'), mck = at('b4', 'McKinsey'), name = at('b4', 'name'), watching = at('b4', 'watching');
  const nobody = at('b5', 'nobody'), free = at('b5', 'free'), newp = at('b5', 'new'), special = at('b5', 'special'), color = at('b5', 'color');
  const mold = at('b6', 'mold'), bin = at('b6', 'bin'), sched = at('b6', 'schedule'), six = at('b6', 'six'), twelve = at('b6', 'twelve'), nine = at('b6', 'nine');
  const clicked = at('b7', 'clicked'), never = at('b7', 'never'), needed = at('b7', 'needed'), molded = at('b7', 'molded'), stored = at('b7', 'stored'), tracked = at('b7', 'tracked');
  const hardly = at('b8', 'hardly'), explore = at('b8', 'Explore'), jack = at('b8', 'Jack'), galidor = at('b8', 'Galidor'), flopped = at('b8', 'flopped');
  const scream = at('b9', 'scream'), movies = at('b9', 'movies'), y99 = at('b9', '1999'), hp2 = at('b9', 'Harry'), each = at('b9', 'Each'), cracks = at('b9', 'cracks');
  music.push([0, 'hope'], [nobody - 0.5, 'mystery'], [hardly - 0.3, 'comic'], [scream - 0.3, 'tension']);
  fx('thump', 0.6, 0.5); fx('click', 0.95, 0.7); fx('steps', b1, 0.3); fx('unfold', plougmann + 0.3, 0.6); fx('tvon', children + 0.2, 0.4);
  [parks, cloth, video, tv].forEach((t, i) => { fx('thump', t, 0.6); fx('pop', t + 0.05, 0.4); }); fx('rev', sw - 0.3, 0.3); fx('whoosh', sw, 0.5); fx('whoosh', hp, 0.5);
  fx('kaching', sold, 0.5); fx('coins', sold + 0.3, 0.4); fx('sparkle', bion + 0.3, 0.5); fx('stamp', hit, 0.5);
  fx('whoosh', b4 - 0.2, 0.5); fx('type', b4 + 0.5, 0.3); fx('paper', watching, 0.4);
  fx('whoosh', b5 - 0.2, 0.4); fx('sparkle', newp, 0.5); fx('pop', special, 0.5); fx('pop', color, 0.5);
  fx('clank', mold, 0.6); fx('slidedown', bin, 0.4); fx('print', sched, 0.4); for (let i = 0; i < 20; i++) fx('tick', twelve - 0.8 + i * 0.09, 0.25); fx('stamp', nine + 0.4, 0.5);
  fx('click', clicked + 0.1, 0.9); fx('ding', never, 0.3); fx('clank', molded, 0.5); fx('slidedown', stored, 0.4); fx('paper', tracked, 0.5); fx('flutter', tracked + 0.4, 0.4);
  fx('boing', explore, 0.4); fx('snap', jack, 0.5); fx('tvon', galidor + 0.4, 0.4); fx('fall', flopped - 0.4, 0.5); fx('thump', flopped, 0.6);
  fx('rev', movies - 0.3, 0.4); fx('kaching', each, 0.4); fx('rumble', cracks, 0.5);
  const PL = Puppet.acting({ expr: [[0, 'neutral'], [diag, 'worried'], [maybe, 'sad']], blinks: [b1 + 1.4, maybe + 0.8], tilt: [[diag, -0.05], [maybe, 0.05]] });
  const JK = Puppet.acting({ expr: [[0, 'neutral'], [name, 'talk'], [name + 1.2, 'skeptical'], [watching, 'determined']], blinks: [b4 + 1.3, watching + 0.9], tilt: [[name, 0.04], [watching, -0.04]], nods: [watching] });
  return [
    { t0: 0, draw(ctx, t, lt) { card(ctx, t, lt, 'p7_boardroom', 3, 'Beyond the Brick', '1998 – 2002'); } },
    // 1 · the turnaround manager unrolls his plan; the owner listens
    { t0: b1 - 0.2, in: 'black', draw(ctx, t, lt) { const g = lt + b1 - 0.2, c_ = cam([[0, 820, 380, 1.15], [children - b1, 760, 360, 1.3], [b2 - b1, 700, 360, 1.4]], lt);
        S.world(ctx, c_, 1, c => { plate(c, 'p7_boardroom', { filter: 'sepia(0.2)' });
          actor(c, 'owner', 470, 262, 0.4, PL(g), t, { look: 'board', wall: 50 });
          S.reveal(c, L.A.plate.p7_boardroom, BOARD);
          place(c, 'manager_plan', 1090 + (1 - ss((g - b1) / 0.8)) * 400, 860, 0.62, { look: 'board', depth: 0.9 }); });
        S.grade(ctx, 0.05, 0.42); small(ctx, 'TURNAROUND MANAGER', 1430, 980, ss((g - plougmann) / 0.3) * (1 - ss((g - children) / 0.3)), 34, '#F2C14E');
        stat(ctx, 'BEYOND THE BRICK', 1360, 360, ss((g - maybe) / 0.3), 64, '#FFF4DC'); } },
    // 2 · everything bolts onto the town: parks, clothes, games, TV, other people's worlds
    { t0: setout - 0.2, in: 'whip', draw(ctx, t, lt) { const g = lt + setout - 0.2, c_ = cam([[0, 745, 440, 1.12], [sw - setout, 745, 430, 1.18]], lt);
        const adds = [['thing_carousel', -0.55, 560, 0.42, parks], ['thing_tshirt', 0.62, 590, 0.40, cloth], ['thing_tv_game', -0.12, 620, 0.42, video], ['thing_tv_game', 0.32, 640, 0.46, tv]];
        const items = adds.map(([n, u, y, k, t0]) => { const v = clamp((g - t0) / 0.35); if (v <= 0) return null; return { y, d: c => place(c, n, tx(u, y), y - (1 - ease.out(v)) * 140, sc(y, k), { depth: dep(y), noShadow: v < 1 }) }; }).filter(Boolean);
        S.world(ctx, c_, 1, c => { plate(c, 'p5_tabletop'); town(c, lt, { items }); S.beams(c, t, 1350, 60, 2.55, 3, 0.06, 1300); });
        S.grade(ctx, 0.06, 0.42);
        [['PARKS', parks], ['CLOTHES', cloth], ['GAMES', video], ['TV', tv]].forEach(([s, t0], i) => small(ctx, s, 380 + i * 390, 1000, ss((g - t0) / 0.25) * (1 - ss((g - other) / 0.3)), 44, '#F2C14E'));
        small(ctx, "OTHER PEOPLE'S WORLDS", S.W / 2, 170, ss((g - other) / 0.3), 52, '#FFF4DC');
        small(ctx, 'SPACE SAGA · 1999', 640, 250, ss((g - sw) / 0.3), 40, '#F2C14E'); small(ctx, 'BOY WIZARD · 2001', 1280, 250, ss((g - hp) / 0.3), 40, '#F2C14E'); } },
    // 3 · at first it looked brilliant: shelves empty out, the warrior figure is a hit
    { t0: b3 - 0.2, in: 'cut', draw(ctx, t, lt) { const g = lt + b3 - 0.2, c_ = cam([[0, 768, 470, 1.25], [bion - b3, 768, 470, 1.1], [b4 - b3, 768, 480, 1.3]], lt);
        S.world(ctx, c_, 1, c => { plate(c, 'p6_superstore');
          for (let i = 0; i < 14; i++) { const u = clamp((g - sold - i * 0.12) / 0.6); if (u <= 0 || u >= 1) continue; const side = i % 2 ? 1 : -1;
            place(c, 'thing_set_box', 768 + side * (180 + u * 900), 600 - Math.sin(u * Math.PI) * 220, 0.22, { look: 'store', depth: 1, noShadow: 1, r: u * 3 * side }); }
          const v = ss((g - bion + 0.1) / 0.4); if (v > 0) { place(c, 'toy_warrior', 768, 820, 0.62 * (0.8 + 0.2 * ease.back(v)), { look: 'store', depth: 1, a: v }); S.sparkle(c, 860, 500, 30, v * (0.6 + 0.4 * Math.sin(t * 6))); } });
        S.grade(ctx, 0.02, 0.38); stat(ctx, 'HIT', 1500, 300, ss((g - hit) / 0.25), 120, '#F2C14E', { pop: 1 }); } },
    // 4 · 2001: a young economist joins the strategy department
    { t0: b4 - 0.2, in: 'whip', draw(ctx, t, lt) { const g = lt + b4 - 0.2, c_ = cam([[0, 760, 470, 1.08], [name - b4, 760, 400, 1.3], [b5 - b4, 760, 390, 1.4]], lt);
        S.world(ctx, c_, 1, c => { plate(c, 'p14_office2001'); actor(c, 'outsider', 760, 300, 0.62, JK(g), t, { look: 'office01', wall: 80 });
          S.reveal(c, L.A.plate.p14_office2001, [[0, 657], [1536, 645], [1536, 864], [0, 864]]); S.reveal(c, L.A.plate.p14_office2001, [[1168, 418], [1300, 405], [1536, 430], [1536, 864], [1150, 864]]);
          S.beams(c, t, 1500, 60, 2.7, 2, 0.05, 1000); });
        S.grade(ctx, 0.07, 0.42); small(ctx, '2001', 230, 120, ss((g - y01) / 0.3), 60, '#F2C14E');
        small(ctx, 'JØRGEN VIG KNUDSTORP', 760, 960, ss((g - name) / 0.3), 42, '#F2C14E'); small(ctx, 'EX-McKINSEY · STRATEGY DEPARTMENT', 760, 1012, ss((g - name - 0.2) / 0.3), 30); } },
    // 5 · inside: designers invent new pieces
    { t0: b5 - 0.2, in: 'cut', draw(ctx, t, lt) { const g = lt + b5 - 0.2, c_ = cam([[0, 768, 430, 1.1], [special - b5, 860, 470, 1.35]], lt);
        S.world(ctx, c_, 1, c => { plate(c, 'p8_studio');
          place(c, 'designer_excited', 880, 900, 0.62, { look: 'studio', depth: 0.9 });
          ODD.slice(0, 6).forEach((n, i) => { const t0 = newp + i * 0.45, u = clamp((g - t0) / 0.4); if (u <= 0) return; const x = 420 + i * 150, y = 600 + (i % 2) * 30;
            place(c, n, x, y - (1 - ease.out(u)) * 120 + Math.sin(t * 2 + i) * 3, 0.16, { look: 'studio', depth: 0.9, r: (hash(i) - 0.5) * 0.4, noShadow: u < 1 });
            if (u > 0.8 && g - t0 < 1.2) S.sparkle(c, x + 30, y - 60, 18, 1 - (g - t0) / 1.2); }); });
        S.grade(ctx, 0.05, 0.4); } },
    // 6 · every new piece: a mold, a bin, a line in the schedule · 6,000 -> 12,000+ · nine in ten used once
    { t0: mold - 0.6, in: 'whip', draw(ctx, t, lt) { const g = lt + mold - 0.6, c_ = cam([[0, 768, 470, 1.3], [bin - mold + 0.6, 768, 420, 1.1], [twelve - mold + 0.6, 768, 440, 1.02], [b7 - mold + 0.6, 768, 440, 1.05]], lt);
        S.world(ctx, c_, 1, c => { plate(c, 'p9_warehouse', { filter: `brightness(${0.85 + 0.15 * ss((g - bin) / 0.5)})` });
          // the mold stack in front
          for (let j = 0; j < 5; j++) { const u = clamp((g - mold - j * 0.35) / 0.3); if (u <= 0) continue; place(c, 'biz_mold', 360 + (j % 2) * 30, 830 - j * 60 - (1 - ease.out(u)) * 100, 0.32, { look: 'warehouse', depth: 1, noShadow: j > 0 }); }
          // the ledger (schedule)
          const lu = ss((g - sched) / 0.4); if (lu > 0) place(c, 'biz_ledger', 1170, 840, 0.42, { look: 'warehouse', depth: 1, a: lu });
          // nine of ten new pieces: tagged "1 SET"
          if (g > nine) for (let i = 0; i < 10; i++) { const u = clamp((g - nine - i * 0.12) / 0.3); if (u <= 0) continue; const x = 560 + (i % 5) * 105, y = 620 + Math.floor(i / 5) * 110;
            place(c, ODD[i % 8], x, y, 0.13, { look: 'warehouse', depth: 0.95, a: u }); small(c, i === 9 ? 'MANY' : '1 SET', x, y + 24, u, 18, i === 9 ? '#9EE09E' : '#FFB4A0'); } });
        S.grade(ctx, 0.04, 0.5);
        const cu = clamp((g - six) / (twelve - six + 0.6)), nshow = Math.round(lerp(6000, 12000, ease.inOut(cu)) / 100) * 100;
        if (g > six - 0.2 && g < nine) { stat(ctx, (g > twelve + 0.4 ? 'MORE THAN ' : '') + nshow.toLocaleString('en-US'), S.W / 2, 220, ss((g - six + 0.2) / 0.3), 110, '#FFF4DC'); small(ctx, 'DIFFERENT ELEMENTS', S.W / 2, 320, ss((g - six) / 0.3), 40, '#F2C14E'); }
        stat(ctx, '9 IN 10 NEW PIECES: ONE SET', S.W / 2, 170, ss((g - nine - 0.3) / 0.3), 70, '#FFB4A0'); } },
    // 7 · it still clicks on (compatibility was never the problem) · but each needs a mold, a bin, a line
    { t0: b7 - 0.2, in: 'cut', draw(ctx, t, lt) { const g = lt + b7 - 0.2, c_ = cam([[0, 768, 560, 1.8], [never - b7, 768, 560, 1.85], [needed - b7, 768, 480, 1.2], [b8 - b7, 768, 440, 1.02]], lt);
        S.world(ctx, c_, 1, c => { plate(c, 'p9_warehouse', { blur: 2.2, filter: 'brightness(0.85)' });
          const hx = 768, hy = 760, s = 0.42, [, hb] = size(prop('brick_1958_worn'), s);
          place(c, 'brick_1958_worn', hx, hy, s, { look: 'warehouse', depth: 1, sa: 0.4 });
          const u = clamp((g - clicked + 0.2) / 0.3); place(c, 'odd_claw_purple', hx + 10, lerp(hy - hb * 0.35 - 200, hy - hb * 0.35, ease.in(u)), 0.36, { look: 'warehouse', depth: 1, noShadow: 1 });
          if (u >= 1) S.sparkle(c, hx + 80, hy - hb * 1.3, 22, 1 - clamp((g - clicked - 0.1) / 0.8));
          // the cost of one piece: a mold, a bin, a ledger line — then the same for hundreds
          [['biz_mold', 420, 800, 0.3, molded], ['biz_bin_one_piece', 1120, 800, 0.34, stored], ['biz_ledger', 1300, 690, 0.26, tracked]].forEach(([n, x, y, k, t0]) => { const v = ss((g - t0 + 0.1) / 0.3); if (v > 0) place(c, n, x, y + (1 - v) * 60, k, { look: 'warehouse', depth: 1, a: v }); });
          if (g > tracked + 0.6) for (let i = 0; i < 60; i++) { const h = hash(i * 1.7), u2 = clamp((g - tracked - 0.6 - h * 1.2) / 0.5); if (u2 <= 0) continue;
            S.sprite(c, prop(['biz_mold', 'biz_bin_one_piece', 'biz_ledger'][i % 3]), 150 + hash(i * 3.1) * 1240, 140 + hash(i * 5.3) * 380, 0.07, { pre: 1.5, a: u2 * 0.9 }); } });
        S.grade(ctx, 0.04, 0.5); stat(ctx, 'IT STILL FITS', S.W / 2, 200, ss((g - clicked - 0.1) / 0.3) * (1 - ss((g - needed) / 0.3)), 90, '#9EE09E', { pop: 1 });
        stat(ctx, 'NEEDED JUST ONCE', S.W / 2, 200, ss((g - needed) / 0.3) * (1 - ss((g - molded - 0.4) / 0.3)), 90, '#FFB4A0', { pop: 1 });
        [['MOLD', 560, molded], ['STORE', 1500, stored], ['TRACK', 1720, tracked]].forEach(([s, x, t0]) => small(ctx, s, x, 1040, ss((g - t0) / 0.25), 38, '#F2C14E')); } },
    // 8 · toys that hardly needed building · Galidor flops
    { t0: b8 - 0.2, in: 'whip', draw(ctx, t, lt) { const g = lt + b8 - 0.2, c_ = cam([[0, 745, 460, 1.3], [galidor - b8, 760, 470, 1.45], [b9 - b8, 760, 470, 1.5]], lt);
        const items = [];
        const e = ss((g - explore) / 0.3); if (e > 0) items.push({ y: 600, d: c => place(c, 'toy_toddler', tx(-0.4, 600), 600 - (1 - ease.out(e)) * 100, sc(600, 0.5), { depth: dep(600) }) });
        const jk = ss((g - jack) / 0.3); if (jk > 0) items.push({ y: 610, d: c => place(c, 'toy_peg_figure', tx(0.05, 610), 610 - (1 - ease.out(jk)) * 100, sc(610, 0.5), { depth: dep(610) }) });
        const gl = ss((g - galidor) / 0.3), fall = ss((g - flopped + 0.5) / 0.6);
        if (gl > 0) items.push({ y: 620, d: c => { place(c, 'toy_hero', tx(0.45, 620) + fall * 40, 620, sc(620, 0.5), { depth: dep(620), r: fall * 1.35, ay: 0.97 });
          place(c, 'thing_tv_game', tx(0.75, 600), 600, sc(600, 0.34), { depth: dep(600), a: gl * (1 - fall * 0.5) }); } });
        S.world(ctx, c_, 1, c => { plate(c, 'p5_tabletop'); town(c, lt, { items }); });
        S.grade(ctx, 0.05, 0.42); [['EXPLORE', 420, explore], ['JACK STONE', 960, jack], ['GALIDOR', 1500, galidor]].forEach(([s, x, t0]) => small(ctx, s, x, 980, ss((g - t0) / 0.3), 40, '#F2C14E'));
        stat(ctx, 'FLOPPED', 1500, 300, ss((g - flopped) / 0.25), 100, '#FFB4A0', { pop: 1 }); } },
    // 9 · the movies hid the cracks: film reels prop up a cracking wall
    { t0: b9 - 0.2, in: 'cut', draw(ctx, t, lt) { const g = lt + b9 - 0.2, night = g < each;
        if (night) { const c_ = cam([[0, 768, 460, 1.05], [each - b9, 760, 400, 1.25]], lt);
          S.world(ctx, c_, 1, c => { plate(c, 'p13_cinema'); [[y99, '1999'], [y99 + 0.6, '2001'], [y99 + 1.2, '2002'], [hp2 + 0.3, '2002']].forEach(([t0, s], i) => small(c, s, 780 + (i - 1.5) * 150, 165, ss((g - t0) / 0.25), 44, '#3A2210')); });
          S.grade(ctx, 0.04, 0.45); small(ctx, 'NEW MOVIES', S.W / 2, 1000, ss((g - movies) / 0.3), 46, '#F2C14E'); return; }
        const c_ = cam([[0, 745, 450, 1.2], [T - each, 745, 440, 1.3]], lt);
        const items = [{ y: 600, d: c => { place(c, 'biz_film_reel', tx(-0.12, 600), 600, sc(600, 0.5), { depth: dep(600), r: -0.15 }); place(c, 'biz_film_reel', tx(0.2, 605), 605, sc(605, 0.5), { depth: dep(605), r: 0.12 }); } }];
        S.world(ctx, c_, 1, c => { plate(c, 'p5_tabletop', { filter: 'saturate(0.85)' }); town(c, lt, { items });
          // cracks spreading across the table
          const k = ss((g - cracks + 0.4) / 0.8); if (k > 0) { c.save(); c.strokeStyle = 'rgba(30,14,4,0.75)'; c.lineWidth = 3; c.lineCap = 'round';
            for (let i = 0; i < 7; i++) { let x = 720 + (i - 3) * 30, y = 600; c.beginPath(); c.moveTo(x, y); for (let j = 0; j < 8 * k; j++) { x += (hash(i * 9 + j) - 0.5) * 70; y += 14 + hash(i + j * 3) * 22; c.lineTo(x, y); } c.stroke(); } c.restore(); } });
        S.grade(ctx, 0.04, 0.45); small(ctx, 'THE MOVIES HID THE COST', S.W / 2, 170, ss((g - cracks + 0.5) / 0.4), 52, '#FFF4DC'); } },
  ];
});
