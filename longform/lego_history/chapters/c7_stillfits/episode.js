// CHAPTER 7 · It Still Fits (after 2008), lines a1–a6 + end card.
const L = require('../../film/lib.js'), { S, cam, place, plate, actor, rest, stat, small, card, town, townLights, prop, size, tx, sc, dep, clamp, lerp, ss, ease, hash, Puppet } = L;
const ODD = ['odd_dish_orange', 'odd_wing_magenta', 'odd_arch_lime', 'odd_claw_purple', 'odd_dome_turquoise', 'odd_pipe_pink', 'odd_gear_grey', 'odd_baseplate_sand'];
L.chapter(module, __dirname, ({ at, L: LS, T, fx, music, CU }) => {
  const a1 = LS.a1, a2 = LS.a2, a3 = LS.a3, a4 = LS.a4, a5 = LS.a5, a6 = LS.a6;
  const quarter = at('a1', 'quarter');
  const movie = at('a2', 'movie'), half = at('a2', 'half'), passed = at('a2', 'passed'), biggest = at('a2', 'biggest');
  const what = at('a3', 'what'), notone = at('a3', 'Not'), market = at('a3', 'changing'), doing = at('a3', 'Doing'), filled = at('a3', 'filled'), hid = at('a3', 'movies'), stopped = at('a3', 'stopped'), left = at('a3', 'left');
  const wayout = at('a4', 'way'), oldest = at('a4', 'oldest'), fewer = at('a4', 'Fewer'), again = at('a4', 'again');
  const through = at('a5', 'through'), never = at('a5', 'never'), today = at('a5', 'today'), clicks = at('a5', 'clicks'), y58 = at('a5', '1958');
  const bricks = at('a6', 'bricks'), company = at('a6', 'company');
  const END = T - 5.2;
  music.push([0, 'triumph'], [a3 - 0.3, 'mystery'], [a4 - 0.2, 'warm'], [a5 - 0.2, 'finale'], [END, 'outro']);
  fx('thump', 0.6, 0.5); fx('click', 0.95, 0.7); for (let i = 0; i < 5; i++) fx('rise', a1 + 0.3 + i * 0.5, 0.25);
  fx('rev', movie - 0.4, 0.3); fx('crowdcheer', movie + 0.3, 0.3); fx('kaching', half, 0.4); fx('rise', passed - 0.2, 0.5); fx('stamp', biggest, 0.6); fx('applause', biggest + 0.2, 0.3);
  fx('whoosh', a3 - 0.2, 0.4); [market, doing, filled, hid, stopped].forEach((t, i) => fx(['whoosh', 'pop', 'slidedown', 'rev', 'power'][i], t, 0.4)); fx('heartbeat', left, 0.4);
  fx('whoosh', a4 - 0.2, 0.3); for (let i = 0; i < 6; i++) fx('click', fewer + i * 0.3, 0.4); fx('sparkle', again, 0.4);
  fx('wind', through, 0.3); fx('click', clicks + 0.15, 1.0); fx('sparkle', clicks + 0.2, 0.4); fx('thump', company + 0.5, 0.3);
  return [
    { t0: 0, draw(ctx, t, lt) { card(ctx, t, lt, 'p5_tabletop', 7, 'It Still Fits', 'After 2008'); } },
    // 1 · growth: the town grows in clean repeats
    { t0: a1 - 0.2, in: 'black', draw(ctx, t, lt) { const g = lt + a1 - 0.2, c_ = cam([[0, 745, 470, 1.4], [a2 - a1, 745, 440, 1.15]], lt), n = 6 + clamp((g - a1) / 3.5) * 8;
        S.world(ctx, c_, 1, c => { plate(c, 'p5_tabletop'); town(c, lt, { n }); townLights(c, t, 0.4); S.beams(c, t, 1350, 60, 2.55, 3, 0.07, 1300); S.dust(c, t, 300, 150, 1100, 600, 40); });
        S.grade(ctx, 0.08, 0.42); stat(ctx, '≈ +25% A YEAR', S.W / 2, 180, ss((g - quarter + 0.2) / 0.3), 96, '#9EE09E', { pop: 1 }); small(ctx, 'FOR FIVE YEARS', S.W / 2, 280, ss((g - quarter) / 0.3), 40); } },
    // 2 · 2014: a movie made of bricks · the biggest toy company
    { t0: a2 - 0.2, in: 'whip', draw(ctx, t, lt) { const g = lt + a2 - 0.2;
        if (g < passed - 0.3) { const c_ = cam([[0, 768, 440, 1.05], [passed - a2, 760, 380, 1.3]], lt);
          S.world(ctx, c_, 1, c => { plate(c, 'p13_cinema', { filter: 'brightness(1.08) saturate(1.1)' }); small(c, 'THE MOVIE · 2014', 780, 175, ss((g - movie) / 0.3), 50, '#3A2210'); });
          S.grade(ctx, 0.05, 0.4); small(ctx, '≈ $468 MILLION AT THE BOX OFFICE', S.W / 2, 1000, ss((g - half) / 0.3), 46, '#F2C14E'); return; }
        // two towers: a classic-brick tower outgrows a plain rival tower
        const c_ = cam([[0, 745, 440, 1.25], [a3 - passed, 745, 420, 1.1]], lt), up = ss((g - passed) / 2.2), items = [];
        const yb = 560, s = sc(yb, 0.38), NB = ['brick_red_2x4', 'brick_yellow_2x2', 'brick_blue_2x4', 'brick_white_2x4', 'brick_red_2x4', 'brick_black_2x2', 'brick_blue_2x4', 'brick_yellow_2x2', 'brick_red_2x4', 'brick_white_2x4', 'brick_red_2x4'];
        const [, hb] = size(prop('brick_red_2x4'), s), nL = Math.floor(lerp(5, 11, up)), nR = 8;
        for (let i = 0; i < nL; i++) items.push({ y: yb + i * 0.01, d: c => place(c, NB[i], tx(-0.22, yb), yb - i * hb * 0.40, s, { depth: dep(yb), noShadow: i > 0 }) });
        for (let i = 0; i < nR; i++) items.push({ y: yb + 0.5 + i * 0.01, d: c => place(c, 'brick_white_2x4', tx(0.25, yb), yb - i * hb * 0.40, s, { depth: dep(yb), noShadow: i > 0, extra: 'grayscale(1) brightness(0.8)' }) });
        S.world(ctx, c_, 1, c => { plate(c, 'p5_tabletop'); town(c, lt, { n: 0, items }); });
        S.grade(ctx, 0.07, 0.42); small(ctx, 'LEGO', 740, 980, 1, 40, '#F2C14E'); small(ctx, 'MATTEL', 1180, 980, 1, 40, '#D0D0D0');
        stat(ctx, 'No. 1 TOY COMPANY', S.W / 2, 170, ss((g - biggest) / 0.3), 90, '#FFF4DC', { pop: 1 }); small(ctx, 'FIRST HALF OF 2014', S.W / 2, 260, ss((g - biggest - 0.2) / 0.3), 40, '#F2C14E'); } },
    // 3 · the recap: the whole story replayed on the table
    { t0: a3 - 0.2, in: 'cut', draw(ctx, t, lt) { const g = lt + a3 - 0.2, c_ = cam([[0, 745, 440, 1.12], [a4 - a3, 745, 450, 1.25]], lt);
        const sprawl = ss((g - doing) / 1.5) * (1 - ss((g - left) / 1.2)), reels = ss((g - hid) / 0.5) * (1 - ss((g - stopped) / 0.6)), dark = ss((g - stopped) / 1.2);
        const items = [];
        for (let i = 0; i < 70; i++) { if (hash(i * 9) > sprawl) continue; const y = 455 + hash(i * 3.1) * 260, u = (hash(i * 7.7) * 2 - 1) * 0.9;
          items.push({ y, d: c => place(c, ODD[i % 8], tx(u, y), y, sc(y, 0.22 + hash(i) * 0.06), { depth: dep(y), r: (hash(i * 1.9) - 0.5) * 0.18, flip: hash(i * 7.7) > 0.5 }) }); }
        if (reels > 0) items.push({ y: 600, d: c => { place(c, 'biz_film_reel', tx(-0.12, 600), 600, sc(600, 0.5), { depth: dep(600), a: reels }); place(c, 'biz_film_reel', tx(0.2, 605), 605, sc(605, 0.5), { depth: dep(605), a: reels }); } });
        S.world(ctx, c_, 1, c => { plate(c, 'p5_tabletop', { filter: `brightness(${1 - 0.5 * dark})` }); town(c, lt, { items });
          if (dark > 0) { c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = `rgba(${255 - 140 * dark | 0},${255 - 130 * dark | 0},${255 - 100 * dark | 0},1)`; c.fillRect(0, 0, 1536, 864); c.restore(); } });
        S.grade(ctx, 0.05 - 0.05 * dark, 0.42 + 0.2 * dark);
        [['A CHANGING MARKET', market, doing], ['→ DO MORE', doing, filled], ['→ PIECES USED ONCE', filled, hid], ['→ THE MOVIES HID THE COST', hid, stopped], ['→ ONLY THE COST WAS LEFT', stopped, a4]].forEach(([s, t0, t1]) =>
          small(ctx, s, S.W / 2, 170, ss((g - t0) / 0.25) * (1 - ss((g - t1 + 0.1) / 0.2)), 52, '#FFF4DC')); } },
    // 4 · the way out: the oldest idea · fewer pieces, used again and again
    { t0: a4 - 0.2, in: 'flash', draw(ctx, t, lt) { const g = lt + a4 - 0.2, c_ = cam([[0, 745, 470, 1.5], [a5 - a4, 745, 450, 1.35]], lt);
        const NB = ['brick_red_2x4', 'brick_blue_2x4', 'brick_yellow_2x2', 'brick_white_2x4', 'brick_red_2x4', 'brick_black_2x2'];
        const items = NB.map((n, i) => { const yb = 560, s = sc(yb, 0.34), [, hb] = size(prop(n), s), u = clamp((g - fewer - i * 0.3) / 0.3); if (u <= 0) return null;
          return { y: yb + i * 0.01, d: c => place(c, n, tx(0, yb), yb - i * hb * 0.40 - (1 - ease.out(u)) * 80, s, { depth: dep(yb), noShadow: i > 0 }) }; }).filter(Boolean);
        S.world(ctx, c_, 1, c => { plate(c, 'p5_tabletop'); town(c, lt, { items }); townLights(c, t, 0.6); S.beams(c, t, 1350, 60, 2.55, 3, 0.07, 1300); S.dust(c, t, 300, 150, 1100, 600, 40); });
        S.grade(ctx, 0.08, 0.42); small(ctx, 'THE OLDEST IDEA', S.W / 2, 170, ss((g - oldest) / 0.3), 56, '#F2C14E'); small(ctx, 'FEWER PIECES · USED AGAIN AND AGAIN', S.W / 2, 250, ss((g - again + 0.3) / 0.3), 42, '#FFF4DC'); } },
    // 5 · the finale: Ole Kirk's bench, golden hour · a new brick clicks onto a worn 1958 brick
    { t0: a5 - 0.2, in: 'black', draw(ctx, t, lt) { const g = lt + a5 - 0.2, c_ = cam([[0, 900, 500, 1.15], [clicks - a5 - 0.6, 760, 600, 1.9], [a6 - a5, 760, 600, 2.0], [END - a5, 760, 560, 1.4]], lt);
        S.world(ctx, c_, 1, c => { plate(c, 'p1_workshop', { filter: 'sepia(0.15) saturate(1.05)' });
          const bx = 760, by = 660, s = 0.3, [, hb] = size(prop('brick_1958_worn'), s);
          place(c, 'brick_1958_worn', bx, by, s, { look: 'workshop', depth: 1, sa: 0.45 });
          const u = clamp((g - clicks + 0.25) / 0.4); place(c, 'brick_red_2x4', bx + 2, lerp(by - hb * 0.40 - 220, by - hb * 0.40, ease.in(u)), s, { look: 'workshop', depth: 1, noShadow: 1, a: g > today - 0.3 ? 1 : 0 });
          if (u >= 1) { S.sparkle(c, bx + 60, by - hb * 1.3, 18, 1 - clamp((g - clicks - 0.15) / 0.9)); S.glow(c, bx, by - hb * 0.6, 160, 'rgba(255,210,140,1)', 0.25); }
          S.beams(c, t, 1500, 120, 2.6, 3, 0.1, 1200); S.dust(c, t, 400, 300, 800, 400, 45); });
        S.grade(ctx, 0.1, 0.45); small(ctx, 'TODAY', 800, 330, ss((g - today) / 0.3) * (1 - ss((g - bricks) / 0.3)), 40, '#FFF4DC'); small(ctx, '1958', 800, 820, ss((g - y58) / 0.3) * (1 - ss((g - bricks) / 0.3)), 44, '#F2C14E'); } },
    // end card
    { t0: END, in: 'black', draw(ctx, t, lt) { const c_ = { x: 768, y: 432, z: 1.06 + lt * 0.01 }; S.world(ctx, c_, 1, c => plate(c, 'p5_tabletop', { blur: 6, filter: 'brightness(0.4)' }));
        stat(ctx, 'What toy did YOU grow up with?', S.W / 2, 470, ss((lt - 0.3) / 0.5), 84, '#FFF4DC');
        const a = ss((lt - 0.9) / 0.4); ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = '#F2C14E'; ctx.lineWidth = 10; ctx.lineCap = 'round'; const y = 600 + Math.sin(lt * 4) * 10;
        ctx.beginPath(); ctx.moveTo(S.W / 2, y); ctx.lineTo(S.W / 2, y + 140); ctx.moveTo(S.W / 2 - 40, y + 100); ctx.lineTo(S.W / 2, y + 140); ctx.lineTo(S.W / 2 + 40, y + 100); ctx.stroke(); ctx.restore(); } },
  ];
});
