// CHAPTER 1 · The System (1932–1960), lines c1–c6.
const L = require('../../film/lib.js'), { S, cam, place, plate, actor, rest, stat, small, card, town, prop, size, tx, sc, dep, clamp, lerp, ss, ease, hash, Puppet } = L;
const { loadImage } = require('@napi-rs/canvas'); let CONTRACT = null;
loadImage(require('path').join(__dirname, '../../../figmakit/assets/props/contract.png')).then(i => { CONTRACT = i; CONTRACT.pre = 1; });
const BENCH = [[0, 590], [1536, 548], [1536, 864], [0, 864]], DESK50 = [[0, 598], [1536, 598], [1536, 864], [0, 864]];
L.chapter(module, __dirname, ({ at, L: LS, T, fx, music }) => {
  const c1 = LS.c1, c2 = LS.c2, c3 = LS.c3, c4 = LS.c4, c5 = LS.c5, c6 = LS.c6;
  const dep_ = at('c1', 'Depression'), name = at('c1', 'name'), leg = at('c1', 'godt') - 0.3, play = at('c1', 'Play');
  const bought = at('c2', 'bought'), mach = at('c2', 'machine'), twice = at('c2', 'twice'), y49 = at('c2', 'By'), bricks = at('c2', 'bricks');
  const y54 = at('c3', '1954'), compl = at('c3', 'complain'), noth = at('c3', 'Nothing'), built = at('c3', 'So'), town_ = at('c3', 'town'), adds = at('c3', 'adds'), launched = at('c3', 'launched');
  const prob = at('c4', 'problem'), hold = at('c4', 'hold'), tubes = at('c4', 'tubes'), y58 = at('c4', '1958'), patent = at('c4', 'patent'), locked = at('c4', 'locked');
  const fire = at('c5', 'fire'), rebuild = at('c5', 'rebuild'), focused = at('c5', 'focused');
  const keep = at('c6', 'Keep'), same = at('c6', 'same'), setafter = at('c6', 'after'), less = at('c6', 'less'), four = at('c6', 'Four'), forget = at('c6', 'forget');
  music.push([0, 'warm'], [fire - 0.6, 'dark'], [focused - 0.2, 'warm'], [four - 0.3, 'mystery']);
  fx('thump', 0.6, 0.5); fx('click', 0.95, 0.7);
  fx('steps', c1 + 0.3, 0.3); fx('wah', name, 0.15); fx('pop', leg, 0.5); fx('ding', play, 0.4);
  fx('whoosh', c2 - 0.2, 0.6); fx('machine', mach, 0.55); fx('puff', mach + 0.4, 0.5); fx('coins', twice, 0.5); fx('clank', y49 + 0.2, 0.5);
  for (let i = 0; i < 6; i++) fx('click', bricks + i * 0.22, 0.4);
  fx('whoosh', c3 - 0.2, 0.5); fx('murmur', compl - 0.3, 0.3); fx('boing', noth, 0.3); fx('whoosh', built - 0.15, 0.5);
  for (let i = 0; i < 14; i++) fx('click', built + 0.35 + i * (launched - built - 0.6) / 14, 0.45);
  fx('stamp', launched + 0.2, 0.6);
  fx('slidedown', hold, 0.5); fx('flip', tubes - 0.1, 0.5); fx('sparkle', tubes + 0.3, 0.4); fx('paper', y58 - 0.2, 0.6); fx('stamp', patent, 0.7); fx('click', locked, 0.9); fx('thump', locked + 0.5, 0.4);
  fx('rumble', c5 - 0.3, 0.6); fx('boom', fire, 0.6); fx('wind', fire + 0.5, 0.5); fx('rumble2', fire + 1.5, 0.5); fx('wind', focused - 0.4, 0.3);
  for (let i = 0; i < 6; i++) fx('click', focused + 0.1 + i * 0.25, 0.45);
  fx('whoosh', c6 - 0.2, 0.4); for (let i = 0; i < 5; i++) fx('click', same + 0.1 + i * 0.3, 0.4); fx('slideup', setafter, 0.4); fx('puff', less, 0.4); fx('heartbeat', four, 0.5); fx('wind', forget, 0.4);
  const OKac = Puppet.acting({ expr: [[0, 'neutral'], [c1 + 0.4, 'smile'], [name, 'talk'], [play - 0.1, 'smile']], blinks: [c1 + 1.4, c1 + 5.2, c1 + 9.1], tilt: [[c1 + 0.4, 0.04], [name, -0.03], [play, 0.05]], nods: [play],
    gestures: { R: [[name + 0.2, play + 1.5, 'palm']], L: [[leg - 0.1, play + 1.5, 'palm']] } });
  const OK2 = Puppet.acting({ expr: [[0, 'neutral'], [mach - 0.1, 'surprised'], [twice, 'worried'], [y49 - 0.2, 'smile']], blinks: [c2 + 1.2, twice + 1.3], tilt: [[mach, -0.06], [twice, 0.04], [y49, 0.02]], shrugs: [[twice + 0.1, 0.7]],
    gestures: { R: [[y49 + 0.1, 99, 'brick']] } });
  const GO1 = Puppet.acting({ expr: [[0, 'neutral'], [compl, 'worried'], [noth + 0.6, 'thinking'], [built - 0.2, 'smile']], blinks: [c3 + 1.0, noth + 0.5], tilt: [[compl, -0.05], [noth + 0.5, 0.07], [built, 0]], nods: [built],
    gestures: { R: [[built - 0.35, 99, 'point']] } });
  const GOn = Puppet.acting({ expr: [[0, 'worried']], blinks: [fire + 1.5, fire + 4], tilt: [[fire, -0.04]] });
  const BRK = (c, x, y, s, o = {}) => place(c, 'brick_red_2x4', x, y, s, o);
  return [
    { t0: 0, draw(ctx, t, lt) { card(ctx, t, lt, 'p1_workshop', 1, 'The System', '1932 – 1960'); } },
    // 1 · the carpenter's workshop: wooden toys, the name
    { t0: c1 - 0.25, in: 'black', draw(ctx, t, lt) { const g = lt + c1 - 0.25, c_ = cam([[0, 700, 430, 1.12], [name - c1, 760, 400, 1.35], [play - c1 + 1.5, 760, 395, 1.42]], lt);
        S.world(ctx, c_, 1, c => { plate(c, 'p1_workshop', { filter: g > dep_ && g < name ? `saturate(${1 - 0.35 * ss((g - dep_) / 0.6)})` : '' });
          actor(c, 'olekirk', 760, 322, 0.66, OKac(g), t, { look: 'workshop', wall: 70 });
          S.reveal(c, L.A.plate.p1_workshop, BENCH);
          const u = clamp((g - c1 - 0.8) / 2.2), dx = lerp(-120, 260, ease.inOut(u));
          place(c, 'toy_duck', 520 + dx, 640, 0.42, { look: 'workshop', depth: 0.9, r: Math.sin(t * 8) * 0.03 * (u > 0 && u < 1) });
          place(c, 'toy_truck', 1060, 655, 0.44, { look: 'workshop', depth: 0.9 });
          S.beams(c, t, 1500, 120, 2.6, 3, 0.07, 1200); S.dust(c, t, 300, 150, 1000, 500, 45); });
        S.grade(ctx, 0.08, 0.42); small(ctx, 'BILLUND, DENMARK · 1932', S.W / 2, 1000, ss((g - c1 - 0.3) / 0.4) * (1 - ss((g - dep_ - 0.8) / 0.4)), 34);
        stat(ctx, '"LEG GODT"', S.W / 2, 180, ss((g - leg) / 0.3), 110); small(ctx, '= PLAY WELL', S.W / 2, 290, ss((g - play) / 0.3), 54, '#F2C14E'); } },
    // 2 · 1947: the machine bet
    { t0: c2 - 0.2, in: 'whip', draw(ctx, t, lt) { const g = lt + c2 - 0.2, c_ = cam([[0, 520, 400, 1.85], [mach - c2, 520, 400, 1.85], [mach - c2 + 1.2, 1090, 420, 1.3], [twice - c2, 700, 520, 1.3], [y49 - c2, 1060, 520, 1.5], [c3 - c2, 1080, 540, 1.6]], lt);
        const [sx, sy] = S.shake(g, mach + 0.1, 6, 0.6);
        S.world(ctx, c_, 1, c => { c.save(); c.translate(sx, sy); plate(c, 'p2_factory1947'); c.restore();
          actor(c, 'olekirk', 330, 420, 0.62, OK2(g), t, { look: 'factory47', wall: 60 });
          if (g > mach) S.smoke(c, t, 1180, 150, 1.2, 5, 6);
          // the bet: one stack = last year's profit, a stack more than twice as tall = the machine
          const k = ss((g - twice + 0.2) / 0.5) * (1 - ss((g - y49 + 0.3) / 0.4));
          if (k > 0) { c.save(); c.globalAlpha = k; place(c, 'biz_coins', 560, 780, 0.38, { look: 'factory47', depth: 0.9 });
            for (let j = 0; j < 3; j++) { const u = clamp((g - twice - j * 0.25) / 0.3); if (u > 0) place(c, 'biz_coins', 760, 780 - j * 150 * ease.out(u), 0.38, { look: 'factory47', depth: 0.9, noShadow: j > 0 }); } c.restore(); }
          // 1949: little bricks drop out of the chute into the tray
          for (let i = 0; i < 6; i++) { const u = clamp((g - bricks - i * 0.22) / 0.35); if (u <= 0) continue; const nm = ['brick_red_2x4', 'brick_yellow_2x2', 'brick_blue_2x4', 'brick_white_2x4', 'brick_red_2x4', 'brick_green_1x4'][i];
            place(c, nm, 1090 + (i % 3) * 40 - 30, lerp(560, 690 + Math.floor(i / 3) * 10, ease.in(u)), 0.09, { look: 'factory47', depth: 0.95, r: (hash(i) - 0.5) * 0.6, noShadow: u < 1 }); }
          S.beams(c, t, 1500, 60, 2.5, 3, 0.07, 1200); S.dust(c, t, 300, 100, 1100, 600, 45); });
        S.grade(ctx, 0.07, 0.42); small(ctx, '1947', 260, 120, ss((g - c2) / 0.3) * (1 - ss((g - mach - 1) / 0.3)), 60, '#F2C14E');
        const k = ss((g - twice + 0.2) / 0.5) * (1 - ss((g - y49 + 0.3) / 0.4)); small(ctx, 'PROFIT 1946', 640, 300, k, 40); small(ctx, 'THE MACHINE', 1040, 300, k, 40, '#F2C14E');
        small(ctx, '1949', S.W - 260, 120, ss((g - y49) / 0.3), 60, '#F2C14E'); } },
    // 3 · 1954: "toys have no system" (Godtfred and a toy buyer)
    { t0: c3 - 0.2, in: 'whip', draw(ctx, t, lt) { const g = lt + c3 - 0.2, c_ = cam([[0, 820, 400, 1.15], [noth - c3, 700, 420, 1.35], [built - c3, 560, 380, 1.6]], lt);
        S.world(ctx, c_, 1, c => { plate(c, 'p3_office1950s');
          place(c, 'buyer54_shrug', 1180, 1010, 0.82, { look: 'office50', depth: 0.8, noShadow: 1 });
          actor(c, 'godtfred', 470, 330, 0.55, GO1(g), t, { look: 'office50', wall: 70 });
          S.reveal(c, L.A.plate.p3_office1950s, DESK50);
          // toys that don't connect to anything
          const tg = ss((g - noth + 0.3) / 0.4); if (tg > 0) { [['toy_duck', 250, 700, 0.3], ['toy_truck', 410, 715, 0.3], ['toy_peg_figure', 1330, 700, 0.22]].forEach(([n, x, y, s], i) =>
            place(c, n, x, y + (1 - tg) * 30, s, { look: 'office50', depth: 0.9, a: tg, r: Math.sin(t * 2 + i) * 0.04 })); }
          S.glow(c, 1130, 360, 260, 'rgba(255,200,120,1)', 0.12); S.dust(c, t, 300, 150, 1000, 500, 30); });
        S.grade(ctx, 0.07, 0.45); small(ctx, '1954', 230, 120, ss((g - y54 + 0.2) / 0.3), 60, '#F2C14E');
        if (g > noth && g < built) { ['?', '?', '?'].forEach((q, i) => stat(ctx, q, [430, 690, 1640][i], 650 + Math.sin(t * 3 + i) * 8, ss((g - noth - i * 0.15) / 0.3), 70, '#FFE3C2')); } } },
    // 4 · the system: a town where every new set adds to the last
    { t0: built - 0.1, in: 'flash', draw(ctx, t, lt) { const g = lt + built - 0.1, c_ = cam([[0, 745, 440, 1.38], [launched - built, 745, 430, 1.14]], lt);
        const n = clamp((g - built - 0.35) / (launched - built - 0.6)) * 14;
        S.world(ctx, c_, 1, c => { plate(c, 'p5_tabletop'); town(c, lt, { n }); S.beams(c, t, 1350, 60, 2.55, 3, 0.06, 1300); S.dust(c, t, 300, 150, 1100, 600, 40); });
        S.grade(ctx, 0.07, 0.42); stat(ctx, '1955', S.W / 2, 170, ss((g - launched - 0.1) / 0.3), 120, '#FFF4DC', { pop: 1 }); small(ctx, 'THE SYSTEM OF PLAY', S.W / 2, 270, ss((g - launched - 0.3) / 0.3), 40, '#F2C14E'); } },
    // 5 · the clutch: tubes under the brick, the 1958 patent
    { t0: c4 - 0.2, in: 'whip', draw(ctx, t, lt) { const g = lt + c4 - 0.2, c_ = cam([[0, 900, 560, 1.5], [y58 - c4, 900, 560, 1.6], [c5 - c4, 900, 570, 1.75]], lt);
        S.world(ctx, c_, 1, c => { plate(c, 'p3_office1950s', { blur: 1.5 });
          const bx = 900, by = 700, s = 0.34, [, hb] = size(prop('brick_red_2x4'), s);
          if (g < tubes) { BRK(c, bx, by, s, { look: 'office50', depth: 1 });
            const slide = ss((g - hold) / 0.8); place(c, 'brick_white_2x4', bx + 4 + slide * 160, by - hb * 0.40 + slide * 40, s, { look: 'office50', depth: 1, noShadow: slide < 0.9, r: slide * 0.5 }); }
          else if (g < y58) { const u = ss((g - tubes) / 0.35); place(c, 'brick_underside_tubes', bx, by, s * 1.05, { look: 'office50', depth: 1, a: u });
            S.glow(c, bx, by - hb * 0.5, 140, 'rgba(255,230,160,1)', 0.25 * u); }
          else { { const u = ss((g - y58 + 0.2) / 0.5); L.patentSheet(c, 640, 640 + (1 - u) * 300, 330, u); }
            BRK(c, bx + 160, by, s, { look: 'office50', depth: 1 });
            const u = clamp((g - locked + 0.35) / 0.35); place(c, 'brick_white_2x4', bx + 164, lerp(by - hb * 0.40 - 160, by - hb * 0.40, ease.in(u)), s, { look: 'office50', depth: 1, noShadow: 1, a: u > 0 ? 1 : 0 });
            if (u >= 1) S.sparkle(c, bx + 250, by - hb * 1.2, 20, 1 - clamp((g - locked) / 0.7)); } });
        S.grade(ctx, 0.07, 0.48); stat(ctx, '1958', 520, 300, ss((g - y58) / 0.3), 110, '#FFF4DC', { pop: 1 }); small(ctx, 'PATENT FILED', 520, 400, ss((g - patent) / 0.3), 40, '#F2C14E'); } },
    // 6 · 1960: fire in the wooden-toy warehouse
    { t0: c5 - 0.25, in: 'black', draw(ctx, t, lt) { const g = lt + c5 - 0.25, f = ss((g - fire + 0.6) / 1.2), c_ = cam([[0, 760, 430, 1.05], [focused - c5 - 0.6, 700, 400, 1.25]], lt);
        S.world(ctx, c_, 1, c => { plate(c, 'p4_warehouse1960_night');
          if (f > 0) { const fl = 0.85 + 0.15 * Math.sin(t * 17) * Math.sin(t * 7.3);
            c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = `rgba(255,170,110,${0.5 * f})`; c.fillRect(0, 0, 1536, 864); c.restore();   // the whole yard lit orange
            [[740, 395], [905, 395], [740, 560], [905, 560]].forEach(([wx, wy], i) => S.glow(c, wx, wy, 70, 'rgba(255,170,60,1)', 0.7 * f * (0.8 + 0.2 * Math.sin(t * 11 + i))));
            L.fireFX(c, t, f, 560, 1060, 360, 300); L.fireFX(c, t + 3, f * 0.9, 680, 960, 210, 200); }
          actor(c, 'godtfred', 1220, 560, 0.72, GOn(g), t, { look: 'night', extra: `brightness(${0.75 + 0.35 * f})` });
          S.glow(c, 1150, 520, 200, 'rgba(255,140,50,1)', 0.18 * f); });
        S.grade(ctx, 0.0, 0.55); small(ctx, '1960', 230, 120, ss((g - c5) / 0.3), 60, '#F2C14E'); } },
    // 6b · the morning after: only bricks are left on the bench
    { t0: focused - 0.5, in: 'flash', draw(ctx, t, lt) { const g = lt + focused - 0.5, c_ = cam([[0, 760, 560, 1.6], [c6 - focused + 0.5, 760, 540, 1.45]], lt);
        S.world(ctx, c_, 1, c => { plate(c, 'p1_workshop');
          ['brick_red_2x4', 'brick_yellow_2x2', 'brick_blue_2x4', 'brick_white_2x4', 'brick_black_2x2', 'brick_green_1x4'].forEach((n, i) => { const u = clamp((g - focused - 0.1 - i * 0.25) / 0.3); if (u <= 0) return;
            place(c, n, 520 + i * 105, lerp(560, 640, ease.out(u)) + (i % 2) * 8, 0.16, { look: 'workshop', depth: 0.95, noShadow: u < 1, r: (hash(i) - 0.5) * 0.2 }); });
          S.beams(c, t, 1500, 120, 2.6, 3, 0.09, 1200); S.dust(c, t, 300, 200, 1000, 500, 50); });
        S.grade(ctx, 0.09, 0.42); } },
    // 7 · the two ideas: the same pieces come back set after set · doing less -> forty years later...
    { t0: c6 - 0.2, in: 'whip', draw(ctx, t, lt) { const g = lt + c6 - 0.2, cool = ss((g - four) / 2.5), c_ = cam([[0, 745, 470, 1.55], [four - c6, 745, 450, 1.35], [T - c6, 745, 430, 1.12]], lt);
        S.world(ctx, c_, 1, c => { plate(c, 'p5_tabletop', { filter: cool > 0 ? `saturate(${1 - 0.5 * cool}) brightness(${1 - 0.35 * cool})` : '' });
          // the same six bricks: a tower, then a wall, then a tower again (set after set)
          const ph = g < setafter ? 0 : g < less ? ss((g - setafter) / 0.6) : 1 - ss((g - less) / 0.6);
          const NB = ['brick_red_2x4', 'brick_blue_2x4', 'brick_yellow_2x2', 'brick_white_2x4', 'brick_red_2x4', 'brick_black_2x2'];
          const items = NB.map((n, i) => { const yb = 560, s = sc(yb, 0.34), [, hb] = size(prop(n), s), tower = [tx(0, yb), yb - i * hb * 0.40], wall = [tx(-0.36 + i * 0.145, yb + (i % 2) * 6), yb + (i % 2) * 6];
            const u = clamp((g - same - 0.1 - i * 0.3) / 0.3); if (u <= 0) return null; const x = lerp(tower[0], wall[0], ph), y = lerp(tower[1], wall[1], ph);
            return { y: yb + i * 0.01 + ph * 10, d: c2 => place(c2, n, x, y - (1 - ease.out(u)) * 80, s, { depth: dep(yb), noShadow: ph < 0.5 && i > 0 }) }; }).filter(Boolean);
          town(c, lt, { n: 0, items });
          // forty years later: odd pieces creep in at the edges
          if (cool > 0) ['odd_wing_magenta', 'odd_claw_purple', 'odd_dish_orange', 'odd_pipe_pink'].forEach((n, i) => { const yy = 470 + i * 40, x = i % 2 ? tx(0.9, yy) : tx(-0.9, yy);
            place(c, n, x + (i % 2 ? 1 : -1) * (1 - cool) * 200, yy, sc(yy, 0.3), { depth: dep(yy), a: cool }); });
          S.dust(c, t, 300, 150, 1100, 600, 40); });
        S.grade(ctx, 0.07 - 0.07 * cool, 0.42 + 0.25 * cool); small(ctx, '40 YEARS LATER…', S.W / 2, 160, ss((g - four) / 0.4), 46, '#F2C14E'); } },
  ];
});
