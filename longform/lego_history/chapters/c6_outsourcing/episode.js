// CHAPTER 6 · The Fix That Broke (2006–2008), lines m1–m3.
const L = require('../../film/lib.js'), { S, cam, place, plate, actor, rest, stat, small, card, prop, size, clamp, lerp, ss, ease, hash, Puppet } = L;
const DESK01 = [[0, 657], [1536, 645], [1536, 864], [0, 864]], MON = [[1168, 418], [1300, 405], [1536, 430], [1536, 864], [1150, 864]];
L.chapter(module, __dirname, ({ at, L: LS, T, fx, music }) => {
  const m1 = LS.m1, m2 = LS.m2, m3 = LS.m3;
  const mistakes = at('m1', 'mistakes'), moved = at('m1', 'moved'), flex = at('m1', 'Flextronics'), mexico = at('m1', 'Mexico'), hungary = at('m1', 'Hungary'), czech = at('m1', 'Czech');
  const smooth = at('m2', 'smoothly'), molds = at('m2', 'Molds'), ready = at('m2', 'ready'), short = at('m2', 'short');
  const y08 = at('m3', '2008'), back = at('m3', 'back'), lesson = at('m3', 'lesson'), core = at('m3', 'core'), brick = at('m3', 'brick');
  music.push([0, 'tension'], [m2 - 0.3, 'comic'], [m3 - 0.3, 'hope']);
  fx('thump', 0.6, 0.5); fx('click', 0.95, 0.7); fx('engine', moved, 0.5); fx('horn', flex, 0.3); [mexico, hungary, czech].forEach(t => fx('pop', t, 0.5));
  fx('brake', smooth, 0.4); fx('clank', molds, 0.5); fx('tick', ready, 0.3); fx('error', short, 0.4); fx('buzzer', short + 0.4, 0.3);
  fx('rev', back - 0.3, 0.4); fx('machine', back + 0.6, 0.4); fx('ding', core, 0.4); fx('click', brick, 0.8);
  const JK = Puppet.acting({ expr: [[0, 'neutral'], [lesson, 'talk'], [core, 'determined'], [brick, 'smile']], blinks: [m3 + 1, core + 1.2], tilt: [[lesson, 0.04], [brick, -0.03]], nods: [core, brick],
    gestures: { R: [[core - 0.2, 99, 'point']] } });
  const truck = (c, x, y, s, flip, o = {}) => place(c, 'thing_truck', x, y, s, Object.assign({ look: 'factory', depth: 1, flip }, o));
  return [
    { t0: 0, draw(ctx, t, lt) { card(ctx, t, lt, 'p10_factory_modern', 6, 'The Fix That Broke', '2006 – 2008'); } },
    // 1 · production moves to a contract manufacturer: trucks leave with the molds; map pins
    { t0: m1 - 0.2, in: 'black', draw(ctx, t, lt) { const g = lt + m1 - 0.2, c_ = cam([[0, 768, 440, 1.05], [flex - m1, 768, 460, 1.2]], lt);
        S.world(ctx, c_, 1, c => { plate(c, 'p10_factory_modern', { filter: 'saturate(0.85)' });
          for (let i = 0; i < 3; i++) { const u = clamp((g - moved - i * 0.7) / 3.2); if (u <= 0 || u >= 1) continue; const y = lerp(820, 520, u), s = lerp(0.62, 0.12, ease.inOut(u));
            truck(c, lerp(980, 780, u), y, s, false, { depth: 1 - u * 0.6 }); } });
        S.grade(ctx, 0.0, 0.45); small(ctx, '2006', 260, 120, ss((g - m1) / 0.3), 60, '#F2C14E'); stat(ctx, 'OUTSOURCED', S.W / 2, 180, ss((g - flex + 0.3) / 0.3), 96, '#FFF4DC', { pop: 1 });
        [['MEXICO', mexico], ['HUNGARY', hungary], ['CZECH REPUBLIC', czech]].forEach(([s, t0], i) => small(ctx, s, 420 + i * 540, 990, ss((g - t0) / 0.25), 44, '#F2C14E')); } },
    // 2 · molds wait outside an unfinished hall; parts run short
    { t0: m2 - 0.2, in: 'whip', draw(ctx, t, lt) { const g = lt + m2 - 0.2, c_ = cam([[0, 768, 500, 1.2], [short - m2, 1000, 520, 1.35]], lt);
        S.world(ctx, c_, 1, c => { plate(c, 'p10_factory_modern', { filter: 'saturate(0.7) brightness(0.92)' });
          // scaffolding over the hall (unfinished)
          c.save(); c.strokeStyle = 'rgba(60,60,70,0.85)'; c.lineWidth = 6; for (let x = 120; x < 1500; x += 140) { c.beginPath(); c.moveTo(x, 80); c.lineTo(x, 640); c.stroke(); }
          for (let y = 120; y < 640; y += 130) { c.beginPath(); c.moveTo(80, y); c.lineTo(1480, y); c.stroke(); } c.lineWidth = 4; for (let x = 120; x < 1400; x += 140) { c.beginPath(); c.moveTo(x, 120); c.lineTo(x + 140, 250); c.stroke(); } c.restore();
          // molds queue on the floor
          for (let i = 0; i < 5; i++) { const u = clamp((g - molds - i * 0.25) / 0.35); if (u <= 0) continue; place(c, 'biz_mold', 260 + i * 150, 820 - (1 - ease.out(u)) * 120, 0.26, { look: 'factory', depth: 1 }); }
          const w = ss((g - short + 0.4) / 0.4); if (w > 0) place(c, 'worker_bin', 1180, 880, 0.62, { look: 'factory', depth: 1, a: w }); });
        S.grade(ctx, 0.0, 0.45); small(ctx, 'FACTORIES NOT READY', 640, 180, ss((g - ready) / 0.3), 48, '#FFB4A0'); stat(ctx, 'PARTS MISSING', 1400, 260, ss((g - short) / 0.3), 76, '#FFB4A0', { pop: 1 }); } },
    // 3 · 2008: production comes back · "core competence"
    { t0: m3 - 0.2, in: 'cut', draw(ctx, t, lt) { const g = lt + m3 - 0.2;
        if (g < lesson - 0.2) { const c_ = cam([[0, 768, 470, 1.2], [lesson - m3, 768, 440, 1.05]], lt);
          S.world(ctx, c_, 1, c => { plate(c, 'p10_factory_modern');
            for (let i = 0; i < 3; i++) { const u = clamp((g - back - i * 1.1) / 2.4); if (u <= 0 || u >= 1) continue; const uu = 1 - u; truck(c, lerp(980, 780, uu), lerp(820, 520, uu), lerp(0.62, 0.12, ease.inOut(uu)), true, { depth: 1 - uu * 0.6, a: u < 1 ? 1 : 0 }); }
            const w = ss((g - back - 1.6) / 0.5); if (w > 0) place(c, 'worker_relieved', 1250, 880, 0.62, { look: 'factory', depth: 1, a: w }); });
          S.grade(ctx, 0.05, 0.42); stat(ctx, '2008: BROUGHT BACK', S.W / 2, 180, ss((g - y08) / 0.3), 90, '#9EE09E', { pop: 1 }); return; }
        const c_ = cam([[0, 760, 400, 1.3], [T - lesson, 740, 380, 1.45]], lt);
        S.world(ctx, c_, 1, c => { plate(c, 'p14_office2001'); actor(c, 'outsider', 740, 300, 0.62, JK(g), t, { look: 'office01', wall: 80 }); S.reveal(c, L.A.plate.p14_office2001, DESK01); S.reveal(c, L.A.plate.p14_office2001, MON);
          const b = ss((g - brick) / 0.3); if (b > 0) place(c, 'brick_red_2x4', 420, 740, 0.24, { look: 'office01', depth: 1, a: b }); });
        S.grade(ctx, 0.07, 0.42); small(ctx, '"KNOW YOUR CORE COMPETENCE"', 1380, 300, ss((g - core) / 0.3), 48, '#FFF4DC'); small(ctx, 'MAKING THE BRICK WAS PART OF IT', 1380, 380, ss((g - brick) / 0.3), 40, '#9EE09E'); } },
  ];
});
