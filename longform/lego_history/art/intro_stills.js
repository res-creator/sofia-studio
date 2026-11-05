// LEGO film — batch-1 check: three stills of the cold open built ONLY from the batch-1 Figma assets + figmakit/lib/scene.js.
// Not a final shot file: it proves that the plates and sprites work together (perspective, scale, light, layering).
// Run (after python3 art/prepare.py):  node art/intro_stills.js frame 3.5 a.png   |  still 3.5,8.5,13.5 sheet.png
const S = require('../../figmakit/lib/scene.js');
const { loadImage } = require('@napi-rs/canvas');
const path = require('path'), fs = require('fs');
const ART = __dirname;
const P = {}, BG = {};
async function img(kind, name) { const c = path.join(ART, 'cache', kind, name + '.png'), o = path.join(ART, kind, name + '.png');
  const im = await loadImage(fs.existsSync(c) ? c : o); im.pre = fs.existsSync(c) ? (kind === 'props' ? 1.5 : 1) : 1; return im; }
const PROPS = fs.readdirSync(path.join(ART, 'props')).filter(f => f.endsWith('.png')).map(f => f.slice(0, -4));
async function load() { for (const n of PROPS) P[n] = await img('props', n); for (const n of ['p5_tabletop', 'p9_warehouse']) BG[n] = await img('backgrounds', n); }

// ---- table perspective (P5): vanishing point (722, 200); table half-width = 1.83 * (y - 200) ----
let MATCH = 'saturate(0.86) sepia(0.12) brightness(0.97)';
const VX = 722, VY = 200, tableX = (u, y) => VX + u * 1.83 * (y - VY), depthS = y => 0.0018 * (y - VY);
// soft contact shadow; light comes from the windows on the RIGHT, so shadows fall to the left
function shadow(ctx, x, y, w, a = 0.42) { ctx.save(); ctx.filter = `blur(${Math.max(2, w * 0.03)}px)`; ctx.globalAlpha = a; ctx.fillStyle = '#2a1405';
  ctx.beginPath(); ctx.ellipse(x - w * 0.16, y - w * 0.015, w * 0.55, w * 0.11, -0.05, 0, 6.28); ctx.fill(); ctx.restore(); }
function put(ctx, name, u, y, k = 1, o = {}) { const im = P[name], s = depthS(y) * k, x = tableX(u, y), w = im.width / im.pre * s;
  if (!o.noShadow) shadow(ctx, x, y, w, o.sa ?? 0.42);
  ctx.save(); ctx.filter = (o.blur ? `blur(${o.blur}px) ` : '') + MATCH;   // colour-match the sprite to the plate's warm light
  S.sprite(ctx, im, x, y, s, { pre: im.pre, r: o.r || 0, ay: o.ay ?? 0.96, flip: o.flip });
  ctx.restore(); return { x, y, w, h: im.height / im.pre * s }; }

// the toy town: a few model types repeated (state "clean"); y = base line on the table, u = across the table (-1..1)
const TOWN = [
  ['town_lighthouse', -0.52, 365, 1.0], ['town_house_yellow', -0.22, 372, 1], ['town_police', 0.12, 370, 1], ['town_house_red', 0.42, 368, 1], ['town_tree', 0.66, 375, 1],
  ['town_tree', -0.70, 430, 1], ['town_house_red', -0.45, 440, 1], ['town_shop', -0.08, 445, 1], ['town_firestation', 0.30, 440, 1], ['town_house_yellow', 0.62, 438, 1],
  ['town_house_red', -0.62, 530, 1, { flip: 1 }], ['town_tree', -0.32, 525, 0.9], ['town_racecar', 0.05, 575, 0.5], ['town_tree', 0.48, 530, 0.9], ['town_shop', 0.70, 525, 1, { flip: 1 }],
];
// the few classic piece types the whole town is built from: a small heap in front, at the same stud scale as the models
const LOOSE = [['brick_red_2x4', -0.10, 655, 0.30, -0.25], ['brick_blue_2x4', 0.02, 668, 0.30, 0.2], ['brick_yellow_2x2', 0.13, 652, 0.30, 0.0],
  ['brick_white_2x4', -0.03, 690, 0.30, 0.35], ['brick_red_2x4', 0.12, 700, 0.30, 0.1], ['brick_green_1x4', -0.17, 695, 0.30, -0.3], ['brick_black_2x2', 0.24, 676, 0.30, 0.2]];
const ODD = PROPS.filter(n => n.startsWith('odd_'));

function town(ctx, t, sprawl = 0) {
  const items = [];
  TOWN.forEach(([n, u, y, k, o]) => items.push({ y, f: () => put(ctx, n, u, y, k, o || {}) }));
  LOOSE.forEach(([n, u, y, k, r]) => items.push({ y, f: () => put(ctx, n, u, y, k, { r, sa: 0.3 }) }));
  if (sprawl) {
    // hundreds of one-off pieces: every one still has studs (they still fit), but each is a new type — the table fills up
    for (let i = 0; i < 260; i++) { const h1 = S.hash(i * 3.1), h2 = S.hash(i * 7.7), h3 = S.hash(i * 1.9);
      const y = 330 + Math.pow(h1, 0.9) * 470, u = (h2 * 2 - 1) * 1.05, n = ODD[i % ODD.length];
      if (Math.abs(tableX(u, y) - VX) > 1.83 * (y - VY) * 1.02) continue;
      items.push({ y: y + 0.5, f: () => put(ctx, n, u, y, 0.17 + h3 * 0.12, { r: (h3 - 0.5) * 0.9, flip: h2 > 0.5, sa: 0.28 }) }); }
    // odd pieces bolted onto the buildings (things the town didn't need)
    const ON = [['odd_dish_orange', 0.12, 300, 0.45], ['odd_wing_magenta', -0.08, 380, 0.45], ['odd_claw_purple', 0.30, 372, 0.4], ['odd_dome_turquoise', -0.45, 470, 0.5], ['odd_pipe_pink', 0.62, 380, 0.45]];
    ON.forEach(([n, u, y, k]) => items.push({ y: y + 140, f: () => put(ctx, n, u, y, k, { noShadow: 1, r: 0.1 }) }));
  }
  items.sort((a, b) => a.y - b.y).forEach(i => i.f());
}

const shots = [
  // A · the town (state "clean": a few model types, repeated). Wide on the table, slow push.
  { t0: 0, draw(ctx, t, lt) { MATCH = 'saturate(0.86) sepia(0.12) brightness(0.97)'; const cam = S.camKeys([[0, 760, 430, 1.04], [5, 760, 445, 1.10]], lt);
      S.world(ctx, cam, 1, c => { S.plate(c, BG.p5_tabletop); town(c, t, 0); });
      S.world(ctx, cam, 1, c => { S.beams(c, t, 1350, 60, 2.55, 3, 0.07, 1300); S.dust(c, t, 300, 150, 1100, 600, 50); });
      S.grade(ctx, 0.08, 0.42); } },
  // B · the sprawl: same plate, same town, plus hundreds of one-off pieces. Closer, cooler, busier.
  { t0: 5, in: 'flash', draw(ctx, t, lt) { MATCH = 'saturate(0.86) sepia(0.12) brightness(0.97)'; const cam = S.camKeys([[0, 760, 470, 1.22], [5, 755, 480, 1.30]], lt);
      S.world(ctx, cam, 1, c => { S.plate(c, BG.p5_tabletop); town(c, t, 1); });
      S.world(ctx, cam, 1, c => { S.dust(c, t, 300, 200, 1100, 600, 70); });
      ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = 'rgba(60,90,140,0.22)'; ctx.fillRect(0, 0, S.W, S.H); ctx.restore();
      S.grade(ctx, 0.03, 0.55); } },
  // C · depth: warehouse plate (depth 1) · pile + hero piece on the floor (depth 1) · big out-of-focus pieces in front (depth 1.35) · beams, dust
  { t0: 10, in: 'whip', draw(ctx, t, lt) { const cam = S.camKeys([[0, 770, 470, 1.06], [5, 770, 480, 1.14]], lt); MATCH = 'saturate(0.9) brightness(0.96)';
      S.world(ctx, cam, 1, c => { S.plate(c, BG.p9_warehouse);
        S.beams(c, t, 768, 70, Math.PI / 2, 2, 0.06, 700);
        // one-off pieces dropped along the aisle (floor y 640-800); scale follows the aisle perspective (vanishing point y = 470)
        c.save(); c.filter = MATCH;
        for (let i = 0; i < 22; i++) { const h1 = S.hash(i * 5.3), h2 = S.hash(i * 2.1), n = ODD[i % ODD.length], y = 640 + h2 * 160, k = (y - 470) / 330;
          const x = 770 + (h1 - 0.5) * 2 * (y - 470) * 1.5; if (Math.abs(x - 775) < 150 && y > 700) continue;
          shadow(c, x, y, 90 * k, 0.3); S.sprite(c, P[n], x, y, 0.16 * k, { pre: P[n].pre, r: (h1 - 0.5) * 1.2, ay: 0.95 }); }
        // hero: a one-off dish piece clicked onto a classic red brick: it fits, and it will be used in exactly one set
        shadow(c, 775, 790, 170, 0.45);
        S.sprite(c, P.brick_red_2x4, 775, 792, 0.46, { pre: P.brick_red_2x4.pre, ay: 0.98 });
        S.sprite(c, P.odd_dish_orange, 786, 731, 0.40, { pre: P.odd_dish_orange.pre, ay: 0.98 });
        c.restore();
        S.glow(c, 780, 660, 200, 'rgba(255,200,120,1)', 0.18); S.sparkle(c, 840, 590, 22, 0.9);
        S.dust(c, t, 420, 300, 700, 500, 60); });
      S.world(ctx, cam, 1.35, c => { // foreground layer, out of focus
        c.save(); c.filter = 'blur(9px)';
        S.sprite(c, P.odd_claw_purple, 170, 920, 1.05, { pre: P.odd_claw_purple.pre, r: -0.4 });
        S.sprite(c, P.odd_wing_magenta, 1400, 940, 1.1, { pre: P.odd_wing_magenta.pre, r: 0.3, flip: 1 });
        S.sprite(c, P.brick_yellow_2x2, 1160, 990, 0.9, { pre: P.brick_yellow_2x2.pre, r: 0.2 });
        c.restore(); });
      S.tag(ctx, 'USED IN 1 SET', 1260, 360, 1, 40);
      S.grade(ctx, 0.05, 0.5); } },
];
S.run({ module, T: 15, shots, load });
