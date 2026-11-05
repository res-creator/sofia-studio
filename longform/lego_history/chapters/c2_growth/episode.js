// CHAPTER 2 · Too Successful (1978–1998), lines g1–g4.
const L = require('../../film/lib.js'), { S, cam, place, plate, actor, rest, stat, small, card, town, townLights, roof, prop, size, tx, sc, dep, clamp, lerp, ss, ease, hash, Puppet } = L;
L.chapter(module, __dirname, ({ at, L: LS, T, fx, music }) => {
  const g1 = LS.g1, g2 = LS.g2, g3 = LS.g3, g4 = LS.g4;
  const y78 = at('g1', '1978'), figs = at('g1', 'figures'), story = at('g1', 'story'), fifteen = at('g1', 'fifteen'), doubled = at('g1', 'doubled'), grandson = at('g1', 'grandson'), kjeld = at('g1', 'Kjeld');
  const ground = at('g2', 'ground'), patents = at('g2', 'patents'), cheaper = at('g2', 'cheaper'), kids = at('g2', 'Kids'), games = at('g2', 'video'), chains = at('g2', 'chains'), walmart = at('g2', 'Walmart');
  const more = at('g3', 'more'), y93 = at('g3', '1993'), tripled = at('g3', 'tripled'), salesd = at('g3', 'Sales'), costs = at('g3', 'Costs');
  const y98 = at('g4', '1998'), lostm = at('g4', 'lost'), thousand = at('g4', 'thousand'), looking = at('g4', 'looking');
  music.push([0, 'warm'], [ground - 0.4, 'tension'], [g4 - 0.4, 'dark']);
  fx('thump', 0.6, 0.5); fx('click', 0.95, 0.7); fx('whoosh', g1 - 0.2, 0.5);
  for (let i = 0; i < 5; i++) fx('pop', figs + i * 0.25, 0.4); fx('sparkle', story, 0.4); for (let i = 0; i < 3; i++) fx('rise', doubled + i * 0.9, 0.3); fx('ding', kjeld, 0.4);
  fx('rumble', ground, 0.5); fx('stamp', patents, 0.4); for (let i = 0; i < 4; i++) fx('thump', cheaper + i * 0.3, 0.4); fx('tvon', games - 0.1, 0.6); fx('blip', games + 0.5, 0.4); fx('whoosh', chains - 0.3, 0.6); fx('squeak', chains + 0.3, 0.4);
  fx('whoosh', g3 - 0.2, 0.5); for (let i = 0; i < 16; i++) fx('tick', tripled - 0.6 + i * 0.12, 0.3); fx('slideup', costs, 0.4);
  fx('whoosh', g4 - 0.3, 0.5); fx('stamp', lostm, 0.7); fx('heartbeat', thousand, 0.5); fx('steps', looking, 0.3);
  const KJ1 = Puppet.acting({ expr: [[0, 'neutral'], [kjeld - 0.2, 'smile']], blinks: [kjeld + 1.2], tilt: [[kjeld, 0.05]], nods: [kjeld + 0.2], gestures: { L: [[kjeld + 0.1, 99, 'palm']] } });
  const KJ4 = Puppet.acting({ expr: [[0, 'worried'], [lostm, 'sad'], [looking, 'worried']], blinks: [g4 + 1.5, thousand + 0.8], tilt: [[lostm, -0.06], [looking, 0.04]], nods: [lostm + 0.2] });
  return [
    { t0: 0, draw(ctx, t, lt) { card(ctx, t, lt, 'p5_tabletop', 2, 'Too Successful', '1978 – 1998'); } },
    // 1 · the town gets little people: every set becomes a story
    { t0: g1 - 0.2, in: 'black', draw(ctx, t, lt) { const g = lt + g1 - 0.2, c_ = cam([[0, 745, 470, 1.5], [fifteen - g1, 745, 450, 1.28], [kjeld - g1, 745, 440, 1.14]], lt);
        const items = []; for (let i = 0; i < 6; i++) { const u = clamp((g - figs - i * 0.25) / 0.3); if (u <= 0) continue; const y = [470, 455, 540, 525, 600, 580][i], uu = [-0.18, 0.18, -0.08, 0.30, 0.04, -0.40][i];
          items.push({ y, d: c => place(c, 'toy_peg_figure', tx(uu, y), y - (1 - ease.out(u)) * 60 - Math.abs(Math.sin(t * 5 + i)) * 4, sc(y, 0.14), { depth: dep(y) }) }); }
        const n = 8 + 6 * ss((g - doubled) / 2.5);
        S.world(ctx, c_, 1, c => { plate(c, 'p5_tabletop'); town(c, lt, { n, items }); S.beams(c, t, 1350, 60, 2.55, 3, 0.06, 1300); S.dust(c, t, 300, 150, 1100, 600, 40); });
        S.grade(ctx, 0.07, 0.42); small(ctx, '1978', 230, 120, ss((g - y78) / 0.3), 60, '#F2C14E');
        const k = ss((g - doubled) / 0.3) * (1 - ss((g - grandson + 0.2) / 0.3)); ['×2', '×2', '×2'].forEach((s, i) => stat(ctx, s, 760 + i * 200, 200, k * ss((g - doubled - i * 0.9) / 0.3), 90, '#F2C14E', { pop: 1 })); } },
    // 1b · the founder's grandson takes over
    { t0: grandson - 0.4, in: 'whip', draw(ctx, t, lt) { const g = lt + grandson - 0.4, c_ = cam([[0, 620, 330, 1.5], [g2 - grandson, 640, 320, 1.6]], lt);
        S.world(ctx, c_, 1, c => { plate(c, 'p7_boardroom', { filter: 'sepia(0.35) saturate(0.85)' }); actor(c, 'owner', 640, 270, 0.42, KJ1(g), t, { look: 'board', wall: 60 });
          S.reveal(c, L.A.plate.p7_boardroom, [[0, 470], [380, 380], [1200, 380], [1536, 470], [1536, 864], [0, 864]]); });
        S.grade(ctx, 0.07, 0.42); small(ctx, 'KJELD KIRK KRISTIANSEN', 760, 960, ss((g - kjeld) / 0.3), 40, '#F2C14E'); small(ctx, "THE FOUNDER'S GRANDSON", 760, 1010, ss((g - kjeld - 0.2) / 0.3), 30); } },
    // 2 · the ground moves: copies, video games, giant chains
    { t0: g2 - 0.2, in: 'cut', draw(ctx, t, lt) { const g = lt + g2 - 0.2, c_ = cam([[0, 745, 440, 1.2], [kids - g2, 745, 450, 1.3]], lt), [sx, sy] = S.shake(g, ground, 8, 0.8);
        const items = [];
        for (let i = 0; i < 7; i++) { const u = clamp((g - cheaper - i * 0.3) / 0.4); if (u <= 0) continue; const y = 560 + (i % 3) * 30, uu = -0.85 + i * 0.12;
          items.push({ y, d: c => place(c, 'brick_white_2x4', tx(uu, y) - (1 - ease.out(u)) * 300, y, sc(y, 0.32), { depth: dep(y), r: (hash(i) - 0.5) * 0.3, extra: 'grayscale(1)' }) }); }
        const tvu = ss((g - games + 0.2) / 0.4); if (tvu > 0) items.push({ y: 620, d: c => { place(c, 'thing_tv_game', tx(0.55, 620), 620, sc(620, 0.55), { depth: dep(620), a: tvu }); S.glow(c, tx(0.5, 620), 520, 160, 'rgba(120,180,255,1)', 0.35 * tvu); } });
        const ku = ss((g - kids) / 0.5); if (ku > 0) items.push({ y: 640, d: c => place(c, ku < 1 ? 'child_sitting' : 'child_turning', tx(0.15, 640), 640, sc(640, 0.33), { depth: dep(640) }) });
        if (ku <= 0) items.push({ y: 640, d: c => place(c, 'child_sitting', tx(0.15, 640), 640, sc(640, 0.33), { depth: dep(640) }) });
        S.world(ctx, c_, 1, c => { c.save(); c.translate(sx, sy); plate(c, 'p5_tabletop'); town(c, lt, { items }); c.restore(); S.dust(c, t, 300, 150, 1100, 600, 40); });
        S.grade(ctx, 0.05, 0.45); small(ctx, 'PATENTS EXPIRE', 420, 180, ss((g - patents) / 0.3) * (1 - ss((g - kids) / 0.3)), 44, '#F2C14E'); small(ctx, 'COPIES', 420, 240, ss((g - cheaper) / 0.3) * (1 - ss((g - kids) / 0.3)), 40); } },
    // 2b · the toy business is decided by giant chains
    { t0: chains - 0.4, in: 'whip', draw(ctx, t, lt) { const g = lt + chains - 0.4, c_ = cam([[0, 768, 470, 1.05], [g3 - chains, 768, 430, 1.35]], lt);
        S.world(ctx, c_, 1, c => { plate(c, 'p6_superstore');
          const u = clamp((g - chains) / 2.6); place(c, 'thing_cart', lerp(-200, 1700, ease.inOut(u)), 840, 1.6, { look: 'store', depth: 1 });
          place(c, 'thing_set_box', 640, 450, 0.12, { look: 'store', depth: 0.5, noShadow: 1 }); });
        S.grade(ctx, 0.0, 0.35); small(ctx, 'GIANT CHAINS DECIDE', S.W / 2, 160, ss((g - walmart) / 0.3), 48, '#F2C14E'); } },
    // 3 · LEGO's answer was more: boxes multiply, sales flat, costs up
    { t0: g3 - 0.2, in: 'cut', draw(ctx, t, lt) { const g = lt + g3 - 0.2, c_ = cam([[0, 768, 500, 1.3], [costs - g3, 768, 480, 1.12]], lt);
        S.world(ctx, c_, 1, c => { plate(c, 'p6_superstore');
          // new boxes pile up in the aisle, more and more
          const n = Math.floor(clamp((g - tripled + 0.6) / 2.2) * 24);
          for (let i = 0; i < 24; i++) { if (i >= n) break; const row = Math.floor(i / 6), col = i % 6, u = clamp((g - tripled + 0.6 - i * 2.2 / 24) / 0.25);
            const [bw, bh] = size(prop('thing_set_box'), 0.32), x = 768 + (col - 2.5) * bw * 0.98 + (row % 2) * bw * 0.4, y = 860 - row * bh * 0.82; place(c, 'thing_set_box', x, y - (1 - ease.out(u)) * 160, 0.32, { look: 'store', depth: 1, noShadow: row > 0 }); }
        });
        S.grade(ctx, 0.0, 0.4);
        // two lines only: sales flat, costs rising
        const k = ss((g - salesd + 0.2) / 0.4); if (k > 0) { ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = 'rgba(20,14,10,0.55)'; ctx.fillRect(80, 560, 720, 300);
          const p = clamp((g - salesd) / 1.2), q = clamp((g - costs) / 1.2); ctx.lineWidth = 10; ctx.lineCap = 'round';
          ctx.strokeStyle = '#7FC97F'; ctx.beginPath(); ctx.moveTo(120, 760); ctx.lineTo(120 + 640 * p, 760); ctx.stroke();
          ctx.strokeStyle = '#E8513E'; ctx.beginPath(); ctx.moveTo(120, 780); ctx.lineTo(120 + 640 * q, 780 - 160 * q); ctx.stroke(); ctx.restore();
          small(ctx, 'SALES', 680, 730, k * p, 34, '#7FC97F'); small(ctx, 'COSTS', 690, 580, ss((g - costs) / 0.3), 34, '#E8513E'); }
        stat(ctx, '×3 NEW TOYS', S.W / 2, 170, ss((g - tripled) / 0.3) * (1 - ss((g - salesd) / 0.3)), 90, '#FFF4DC', { pop: 1 }); small(ctx, 'FROM 1993', S.W / 2, 260, ss((g - y93) / 0.3) * (1 - ss((g - salesd) / 0.3)), 40, '#F2C14E'); } },
    // 4 · 1998: the first loss
    { t0: g4 - 0.3, in: 'black', draw(ctx, t, lt) { const g = lt + g4 - 0.3, c_ = cam([[0, 760, 360, 1.25], [T - g4, 760, 350, 1.45]], lt);
        S.world(ctx, c_, 1, c => { plate(c, 'p7_boardroom', { filter: `sepia(0.3) saturate(0.8) brightness(${1 - 0.15 * ss((g - lostm) / 1)})` });
          actor(c, 'owner', 760, 262, 0.42, KJ4(g), t, { look: 'board', wall: 60 });
          S.reveal(c, L.A.plate.p7_boardroom, [[0, 470], [380, 380], [1200, 380], [1536, 470], [1536, 864], [0, 864]]);
          if (g > looking) S.glow(c, 1450, 300, 300, 'rgba(255,240,210,1)', 0.25 * ss((g - looking) / 1)); });
        S.grade(ctx, 0.02, 0.55); stat(ctx, '1998: FIRST LOSS', S.W / 2, 180, ss((g - lostm) / 0.3), 96, '#FFB4A0', { pop: 1 }); small(ctx, '≈ 1,000 JOBS CUT', S.W / 2, 280, ss((g - thousand) / 0.3), 42); } },
  ];
});
