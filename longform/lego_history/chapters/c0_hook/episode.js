// COLD OPEN — "One set, one piece" (h1–h4). Shots: macro click in the warehouse · pull-back down the aisle · the money drains ·
// piece and coins tied together · the man at the window · the town builds itself -> "System."
const L = require('../../film/lib.js'), { S, place, plate, actor, rest, stat, small, town, prop, size, tx, sc, dep, clamp, lerp, ss, ease, hash } = L;
L.chapter(module, __dirname, ({ at, T, fx, music }) => {
  const h1 = at('h1', 'By'), inv = at('h1', 'invented'), thou = at('h1', 'thousands'), most = at('h1', 'most'), one = at('h1', 'exactly');
  const h2 = at('h2', 'That'), lost = at('h2', 'lost'), bil = at('h2', 'billion'), dol = at('h2', 'dollars');
  const h3 = at('h3', 'Those'), conn = at('h3', 'connected'), man = at('h3', 'man'), thirty = at('h3', 'thirty'), cons = at('h3', 'consulting');
  const h4 = at('h4', 'To'), box = at('h4', 'box'), word = at('h4', 'word'), sys = at('h4', 'System');
  music.push([0, 'mystery'], [h4 - 0.3, 'warm']);
  const ODD = ['odd_dish_orange', 'odd_wing_magenta', 'odd_arch_lime', 'odd_claw_purple', 'odd_dome_turquoise', 'odd_pipe_pink', 'odd_gear_grey', 'odd_baseplate_sand'];
  fx('click', inv + 0.32, 0.9); fx('sparkle', inv + 0.35, 0.5); fx('rise', thou - 0.2, 0.4); fx('whoosh', most - 0.2, 0.4);
  for (let i = 0; i < 12; i++) fx('tick', most + 0.05 + i * 0.09 * 1.4, 0.25);
  fx('whoosh', h2 - 0.15, 0.6); fx('coins', lost, 0.6); fx('slidedown', lost + 0.2, 0.5); fx('stamp', bil, 0.6); fx('sparkle', h3 - 0.1, 0.4);
  fx('scratch', conn - 0.05, 0.35); fx('cut', man - 0.15, 0.4); fx('wind', man, 0.25); fx('thump', h4 - 0.05, 0.4);
  for (let i = 0; i < 14; i++) fx('click', h4 - 0.1 + 0.2 + (i + 1) * (sys - h4 - 0.4) / 14 - 0.05, 0.5);
  fx('stamp', sys, 0.8);
  return [
    // A · macro on the warehouse floor: an odd piece clicks onto a classic brick
    { t0: 0, draw(ctx, t, lt) { const cam = L.cam([[0, 768, 470, 1.18], [most, 768, 455, 1.32]], lt);
        S.world(ctx, cam, 1, c => { plate(c, 'p9_warehouse', { blur: 3.2, filter: 'brightness(0.8)' });
          S.beams(c, t, 768, 70, Math.PI / 2, 2, 0.05, 700);
          // thousands more pieces fall far behind (out of focus)
          if (lt > thou - 0.2) for (let i = 0; i < 40; i++) { const h = hash(i * 3.3), u = (lt - thou + 0.2 - h * 1.5) / 1.3; if (u <= 0 || u > 1) continue;
            c.save(); c.globalAlpha = 0.8; c.filter = 'blur(3px)'; S.sprite(c, prop(ODD[i % 8]), 300 + hash(i * 7.1) * 940, lerp(-80, 640 + hash(i) * 80, ease.in(u)), 0.09 + h * 0.05, { pre: 1.5, r: u * 6 * (h - 0.5) }); c.restore(); }
          const hx = 768, hy = 805, [, hb] = size(prop('brick_red_2x4'), 0.62);
          c.save(); c.globalAlpha = 0.15; c.filter = 'blur(3px)'; c.translate(hx, hy + 4); c.scale(1, -0.5); S.sprite(c, prop('brick_red_2x4'), 0, 0, 0.62, { pre: 1.5, ay: 0.97 }); c.restore();
          place(c, 'brick_red_2x4', hx, hy, 0.62, { look: 'warehouse', depth: 1, sa: 0.42, ca: 0.7 });
          const u = clamp((lt - inv) / 0.32), py = lerp(hy - hb * 0.33 - 260, hy - hb * 0.33, ease.in(u)) + (u >= 1 ? -Math.sin(clamp((lt - inv - 0.32) / 0.2) * Math.PI) * 6 : 0);
          if (lt > inv - 0.05) place(c, 'odd_dish_orange', hx + 12, py, 0.52, { look: 'warehouse', depth: 1, noShadow: 1, r: (1 - u) * 0.3 });
          if (u >= 1) { S.sparkle(c, hx + 60, hy - hb * 1.05, 24, 1 - clamp((lt - inv - 0.35) / 0.8)); S.glow(c, hx, hy - hb, 220, 'rgba(255,205,140,1)', 0.14); }
          S.dust(c, t, 420, 280, 700, 500, 40); });
        S.grade(ctx, 0.05, 0.55); } },
    // B · pull back down the aisle: each new piece gets its own bin
    { t0: most - 0.15, in: 'cut', draw(ctx, t, lt) { const cam = L.cam([[0, 768, 600, 1.75], [3.6, 768, 440, 1.03]], lt);
        S.world(ctx, cam, 1, c => { plate(c, 'p9_warehouse');
          for (let i = 0; i < 26; i++) { const h = hash(i * 5.7), side = i % 2 ? 1 : -1, row = Math.floor(hash(i * 2.3) * 5), u = clamp((lt - 0.2 - i * 0.09) / 0.45);
            if (u <= 0) continue; const x = 768 + side * (330 + h * 330), y = 120 + row * 125;
            c.save(); c.globalAlpha = 1 - clamp((lt - 0.2 - i * 0.09 - 1.4) / 0.4) * 0.8; S.sprite(c, prop(ODD[i % 8]), x, lerp(y - 140, y, ease.out(u)), 0.17, { pre: 1.5, r: (h - 0.5) * 0.5 }); c.restore();
            if (u >= 1 && lt - 0.2 - i * 0.09 < 0.9) S.glow(c, x, y - 20, 90, 'rgba(255,220,150,1)', 0.4); }
          S.dust(c, t, 300, 200, 900, 500, 50); });
        S.grade(ctx, 0.05, 0.45); } },
    // C · the money: coins drain out, the number lands
    { t0: h2 - 0.1, in: 'whip', draw(ctx, t, lt) { const cam = L.cam([[0, 768, 500, 1.2], [6, 768, 480, 1.32]], lt), g = lt + h2 - 0.1;
        S.world(ctx, cam, 1, c => { plate(c, 'p9_warehouse', { blur: 2.4, filter: 'brightness(0.7) saturate(0.8)' });
          const shrink = ss((g - lost) / 1.6);
          // three coin stacks sink as the money drains away
          [[560, 760, 0.55], [980, 770, 0.6], [770, 820, 0.75]].forEach(([x, y, s], k) => { const k2 = 1 - 0.6 * shrink * (k === 2 ? 1 : 0.85);
            c.save(); c.beginPath(); c.rect(0, 0, 1536, y + 4); c.clip(); const [, h] = size(prop('biz_coins'), s); c.translate(0, h * (1 - k2));
            place(c, 'biz_coins', x, y, s, { look: 'warehouse', depth: 0.9, sa: 0.35 * k2 }); c.restore(); });
          // coins tumbling away and down
          for (let i = 0; i < 30; i++) { const h = hash(i * 9.1), u = (g - lost - h * 1.8) / 1.0; if (u <= 0 || u > 1) continue;
            S.sprite(c, prop('biz_coins'), 520 + h * 520 + (hash(i) - 0.5) * 200 * u, 640 + ease.in(u) * 320, 0.08, { pre: 1.5, r: u * 9 * (h - 0.5) }); } });
        S.grade(ctx, 0.0, 0.6);
        stat(ctx, '−DKK 1.9 BILLION', S.W / 2, 300, ss((g - bil) / 0.3), 104, '#FFE3C2', { pop: 1 }); small(ctx, '≈ $300 MILLION · 2004', S.W / 2, 395, ss((g - dol) / 0.3), 40); } },
    // D · the two facts tied together on the table
    { t0: h3 - 0.1, in: 'flash', draw(ctx, t, lt) { const g = lt + h3 - 0.1, cam = L.cam([[0, 770, 420, 1.55], [man - h3, 770, 410, 1.68]], lt);
        S.world(ctx, cam, 1, c => { plate(c, 'p5_tabletop');
          const ya = 455, xa = tx(-0.32, ya), yb = 465, xb = tx(0.30, yb);
          place(c, 'odd_wing_magenta', xa, ya, sc(ya, 0.42), { depth: dep(ya) }); place(c, 'biz_coins', xb, yb, sc(yb, 0.55), { depth: dep(yb) });
          const u = clamp((g - conn + 0.1) / 0.6); if (u > 0) { c.save(); c.strokeStyle = '#D8322A'; c.lineWidth = 5; c.setLineDash([16, 12]); c.lineDashOffset = -t * 40;
            c.beginPath(); const x0 = xa + 40, y0 = ya - 70, x1 = xb - 30, y1 = yb - 90; c.moveTo(x0, y0); c.quadraticCurveTo((x0 + x1) / 2, Math.min(y0, y1) - 60, lerp(x0, x1, u), lerp(y0, y1, u)); c.stroke(); c.restore(); }
          S.beams(c, t, 1350, 60, 2.55, 3, 0.05, 1300); S.dust(c, t, 400, 200, 800, 400, 30); });
        S.grade(ctx, 0.07, 0.45); } },
    // E · the man who would have to untangle them: a silhouette against the evening window
    { t0: man - 0.15, in: 'cut', draw(ctx, t, lt) { const g = lt + man - 0.15, cam = L.cam([[0, 990, 410, 1.12], [5, 980, 400, 1.26]], lt);
        S.world(ctx, cam, 1, c => { plate(c, 'p14_office2001');
          actor(c, 'outsider', 985, 362, 0.8, rest({ tilt: 0.02 }), t, { look: 'office01', extra: 'brightness(0.22) saturate(0.4)' });
          // rim light from the window
          S.glow(c, 1060, 300, 180, 'rgba(255,190,120,1)', 0.2);
          S.reveal(c, L.A.plate.p14_office2001, [[1168, 418], [1300, 405], [1536, 430], [1536, 864], [1150, 864]]);    // monitor in front
          S.reveal(c, L.A.plate.p14_office2001, [[0, 657], [1536, 645], [1536, 864], [0, 864]]);                          // desk in front
        });
        S.grade(ctx, 0.07, 0.5); small(ctx, 'AGE 35', 470, 860, ss((g - thirty) / 0.3) * (1 - ss((g - cons - 1.4) / 0.3)), 44, '#F2C14E'); } },
    // F · the town builds itself, brick by brick -> "System."
    { t0: h4 - 0.1, in: 'black', draw(ctx, t, lt) { const g = lt + h4 - 0.1, cam = L.cam([[0, 745, 420, 1.3], [sys - h4, 745, 432, 1.16], [T - h4, 745, 436, 1.12]], lt);
        const n = clamp((g - h4 - 0.2) / (sys - h4 - 0.4)) * 14;
        S.world(ctx, cam, 1, c => { plate(c, 'p5_tabletop'); town(c, lt, { n }); S.beams(c, t, 1350, 60, 2.55, 3, 0.06, 1300); S.dust(c, t, 300, 150, 1100, 600, 40); });
        S.grade(ctx, 0.07, 0.42); stat(ctx, 'SYSTEM.', S.W / 2, 190, ss((g - sys) / 0.25), 150, '#FFF4DC', { pop: 1 }); } },
  ];
});
