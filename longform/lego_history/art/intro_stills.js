// LEGO film: cold-open check shots built ONLY from batch-1 Figma assets + figmakit/lib/scene.js + art/integrate.js.
//   A  (0–5 s)   the toy town: organic layout with real depth (far / mid / near), a building "in progress" from loose bricks in front
//   B  (5–13 s)  the problem grows: clean town -> first one-off pieces bolted on -> they spread over the table -> overloaded
//   C  (13–18 s) macro in the warehouse: one-off piece clicked onto a classic brick, background out of focus
// Run (after python3 art/prepare.py):  node art/intro_stills.js frame <t> out.png   |  still t1,t2,... sheet.png
const S = require('../../figmakit/lib/scene.js');
const I = require('./integrate.js');
const { loadImage } = require('@napi-rs/canvas');
const path = require('path'), fs = require('fs');
const ART = __dirname, P = {}, BG = {};
async function img(kind, name) { const c = path.join(ART, 'cache', kind, name + '.png'), o = path.join(ART, kind, name + '.png');
  const im = await loadImage(fs.existsSync(c) ? c : o); im.pre = fs.existsSync(c) ? (kind === 'props' ? 1.5 : 1) : 1; return im; }
const PROPS = fs.readdirSync(path.join(ART, 'props')).filter(f => f.endsWith('.png')).map(f => f.slice(0, -4));
async function load() { for (const n of PROPS) P[n] = await img('props', n); for (const n of ['p5_tabletop', 'p9_warehouse']) BG[n] = await img('backgrounds', n); }
const size = (n, s) => [P[n].width / P[n].pre * s, P[n].height / P[n].pre * s];

// ---- table (P5) perspective: vanishing point (722, 200); half-width of the table = 1.83 * (y - 200); far edge y = 321
const VX = 722, VY = 200, tx = (u, y) => VX + u * 1.83 * (y - VY), sc = (y, k = 1) => 0.0018 * (y - VY) * k, dep = y => S.clamp((y - 300) / 420);
const onTable = (x, y) => y > 330 && Math.abs(x - VX) < 1.83 * (y - VY) * 0.97;
// camera view rectangle in plate pixels -> keep big objects fully inside the frame
const view = (cam, m = 12) => ({ x0: cam.x - 768 / cam.z + m, x1: cam.x + 768 / cam.z - m, y0: cam.y - 432 / cam.z + m, y1: cam.y + 432 / cam.z - m });
const inside = (v, x, y, w, h) => x - w / 2 > v.x0 && x + w / 2 < v.x1 && y - h > v.y0 && y < v.y1;

// ---- the town: organic, three depth bands, varied sizes, a street running from the front to the back
const TOWN = [
  ['town_lighthouse', -0.62, 342, 1.0], ['town_house_red', -0.22, 348, 0.85], ['town_tree', 0.06, 344, 0.75], ['town_house_yellow', 0.36, 352, 0.9], ['town_tree', 0.60, 357, 0.7],
  ['town_tree', -0.72, 402, 0.8], ['town_shop', -0.44, 414, 1, 1], ['town_police', -0.02, 425, 1], ['town_tree', 0.24, 418, 0.75], ['town_firestation', 0.52, 442, 1],
  ['town_house_yellow', -0.60, 500, 1, 1], ['town_tree', -0.34, 488, 0.8], ['town_tree', 0.40, 503, 0.85], ['town_house_red', 0.68, 516, 1],
];
function town(list, extra = []) {   // returns draw items sorted by base y (= correct overlap)
  const it = TOWN.map(([n, u, y, k, fl]) => ({ y, d: ctx => I.place(ctx, P[n], tx(u, y), y, sc(y, k), { depth: dep(y), flip: !!fl }) }));
  return it.concat(list, extra);
}
// a small building in progress from the classic bricks (the "system": same bricks -> houses)
function bricksInProgress(u0, y0) { const x0 = tx(u0, y0), k = 0.30, s = sc(y0, k); const [, hb] = size('brick_red_2x4', s);
  return [{ y: y0, d: ctx => {
    I.place(ctx, P.brick_red_2x4, x0, y0, s, { depth: dep(y0) });
    I.place(ctx, P.brick_white_2x4, x0 + 4, y0 - hb * 0.40, s, { depth: dep(y0), noShadow: 1 });
    I.place(ctx, P.brick_blue_2x4, x0 - 2, y0 - hb * 0.80, s, { depth: dep(y0), noShadow: 1 }); } },
    { y: y0 + 22, d: ctx => I.place(ctx, P.brick_yellow_2x2, tx(u0 + 0.20, y0 + 22), y0 + 22, sc(y0 + 22, k), { depth: dep(y0 + 22), r: 0.05 }) },
    { y: y0 - 18, d: ctx => I.place(ctx, P.brick_black_2x2, tx(u0 + 0.30, y0 - 18), y0 - 18, sc(y0 - 18, k), { depth: dep(y0 - 18), r: -0.04 }) },
    { y: y0 + 34, d: ctx => I.place(ctx, P.brick_green_1x4, tx(u0 - 0.22, y0 + 34), y0 + 34, sc(y0 + 34, k), { depth: dep(y0 + 34), r: -0.06 }) }]; }

const atmos = (c, t) => { S.beams(c, t, 1350, 60, 2.55, 3, 0.06, 1300); S.dust(c, t, 300, 150, 1100, 600, 45); };
const drop = (lt, t0) => { const u = S.clamp((lt - t0) / 0.35); return u <= 0 ? null : { dy: -(1 - S.ease.out(u)) * 90, a: 1 }; };

// ---- B: what lands on the table, and when (deterministic)
const ODD = PROPS.filter(n => n.startsWith('odd_'));
const CAMB = { x: 740, y: 436, z: 1.36 };
const ON_ROOFS = [ // [piece, u, y(base of building), lift above base (fraction of building height), k, t]
  ['odd_dish_orange', -0.02, 425, 0.78, 0.56, 1.0], ['odd_wing_magenta', -0.44, 414, 0.70, 0.42, 1.7],
  ['odd_claw_purple', 0.52, 442, 0.78, 0.36, 3.4], ['odd_dome_turquoise', -0.60, 500, 0.70, 0.40, 4.0], ['odd_pipe_pink', 0.68, 516, 0.62, 0.38, 5.2],
  ['odd_gear_grey', -0.22, 348, 0.72, 0.42, 5.8], ['odd_arch_lime', 0.36, 352, 0.78, 0.40, 6.3]];
const BH = { town_police: 428, town_shop: 325, town_firestation: 432, town_house_yellow: 429, town_house_red: 396 };
let SCATTER = null; const makeScatter = () => { const v = view(CAMB, 30), out = []; let i = 0;
  while (out.length < 70 && i < 2000) { i++; const h1 = S.hash(i * 3.1), h2 = S.hash(i * 7.7), h3 = S.hash(i * 1.9);
    const y = 450 + Math.pow(h1, 1.1) * 265, u = (h2 * 2 - 1) * 0.95, x = tx(u, y), n = ODD[i % ODD.length], k = 0.20 + h3 * 0.08;
    const [w, h] = size(n, sc(y, k)); if (!onTable(x, y) || !inside(v, x, y, w, h)) continue;
    if (Math.abs(u - 0.08) < 0.16 && y > 540 && y < 640) continue;                       // keep the street + tower spot clear
    out.push({ n, x, y, k, r: (h3 - 0.5) * 0.18, flip: h2 > 0.5, t: 3.4 + out.length * 0.06 }); }
  return out; };
const TOWER = ['odd_baseplate_sand', 'odd_gear_grey', 'odd_dish_orange', 'odd_claw_purple', 'odd_dome_turquoise', 'odd_wing_magenta', 'odd_pipe_pink', 'odd_arch_lime'];

const shots = [
  // A · the town
  { t0: 0, draw(ctx, t, lt) { const cam = S.camKeys([[0, 745, 432, 1.18], [5, 745, 438, 1.22]], lt);
      S.world(ctx, cam, 1, c => { S.plate(c, BG.p5_tabletop);
        town(bricksInProgress(-0.06, 600)).concat([{ y: 548, d: c2 => I.place(c2, P.town_racecar, tx(-0.30, 548), 548, sc(548, 0.42), { depth: dep(548), r: 0.02 }) }])
          .sort((a, b) => a.y - b.y).forEach(i => i.d(c));
        atmos(c, t); });
      S.grade(ctx, 0.07, 0.42); } },
  // B · the problem grows
  { t0: 5, in: 'flash', draw(ctx, t, lt) {
      const cam = S.camKeys([[0, 745, 430, 1.22], [0.8, 742, 425, 1.26], [1.7, 716, 345, 1.6], [2.7, 716, 345, 1.62], [3.7, 740, 432, 1.33], [8, CAMB.x, CAMB.y, CAMB.z]], lt), gloom = S.ss((lt - 3.5) / 4);
      S.world(ctx, cam, 1, c => { S.plate(c, BG.p5_tabletop);
        const extra = [];
        // one-off pieces bolted onto the buildings (they still click on: studs on studs)
        for (const [n, u, y, lift, k, t0] of ON_ROOFS) { const dr = drop(lt, t0); if (!dr) continue; const bn = TOWN.find(b => b[1] === u && b[2] === y), bh = (BH[bn[0]] || 400) * sc(y, bn[3]);
          extra.push({ y: y + 0.5, d: c2 => { I.place(c2, P[n], tx(u, y) + 6, y - bh * lift + dr.dy, sc(y, k), { depth: dep(y), noShadow: 1, a: dr.a, r: 0.04 });
            if (n === 'odd_dish_orange' && lt < 3.2) { S.glow(c2, tx(u, y) + 10, y - bh * lift - 30, 70, 'rgba(255,220,150,1)', 0.25 * (1 - S.clamp((lt - 1.4) / 1.6))); S.sparkle(c2, tx(u, y) + 34, y - bh * lift - 52, 16, 1 - S.clamp((lt - 1.4) / 1.6)); } } }); }
        // pieces landing on the table
        SCATTER = SCATTER || makeScatter();
        for (const p of SCATTER) { const dr = drop(lt, p.t); if (!dr) continue;
          extra.push({ y: p.y, d: c2 => I.place(c2, P[p.n], p.x, p.y + dr.dy, sc(p.y, p.k), { depth: dep(p.y), r: p.r, flip: p.flip, a: dr.a, sa: 0.34 * dr.a }) }); }
        // the focal object of the second half: a tower of one-off pieces growing in the street, leaning more and more
        const ty = 590, tx0 = tx(0.08, ty); let base = ty;
        TOWER.forEach((n, j) => { const t0 = 3.0 + j * 0.55, dr = drop(lt, t0); if (!dr) return; const s = sc(ty, 0.34), [, h] = size(n, s), lean = j * j * 0.6 * S.ss((lt - 5.5) / 2.5);
          const yb = base; extra.push({ y: ty + j * 0.01, d: c2 => I.place(c2, P[n], tx0 + lean, yb + dr.dy, s, { depth: dep(ty), noShadow: j > 0, a: dr.a, r: lean * 0.004 }) }); base -= h * 0.55; });
        town([], extra).concat([{ y: 548, d: c2 => I.place(c2, P.town_racecar, tx(-0.30, 548), 548, sc(548, 0.42), { depth: dep(548) }) }])
          .sort((a, b) => a.y - b.y).forEach(i => i.d(c));
        atmos(c, t); });
      if (gloom > 0) { ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = `rgba(60,90,140,${0.28 * gloom})`; ctx.fillRect(0, 0, S.W, S.H); ctx.restore(); }
      S.grade(ctx, 0.07 - 0.04 * gloom, 0.42 + 0.18 * gloom); } },
  // C · macro in the warehouse: the plate is out of focus (we are down on the floor), the hero is sharp
  { t0: 13, in: 'whip', draw(ctx, t, lt) { const cam = S.camKeys([[0, 768, 440, 1.02], [5, 768, 452, 1.08]], lt);
      S.world(ctx, cam, 1, c => { c.save(); c.filter = 'blur(2.6px) brightness(0.92)'; S.plate(c, BG.p9_warehouse); c.restore();
        S.beams(c, t, 768, 70, Math.PI / 2, 2, 0.05, 700);
        const hx = 768, hy = 812, sb = 0.78, [, hb] = size('brick_red_2x4', sb);
        // floor reflection (polished concrete)
        c.save(); c.globalAlpha = 0.16; c.filter = 'blur(3px)'; c.translate(hx, hy + 4); c.scale(1, -0.55); S.sprite(c, P.brick_red_2x4, 0, 0, sb, { pre: P.brick_red_2x4.pre, ay: 0.97 }); c.restore();
        // a few other one-off pieces on the same floor, same macro scale (resting, not floating)
        [['odd_gear_grey', 470, 838, 0.40, -0.06], ['odd_arch_lime', 1075, 846, 0.36, 0.05], ['odd_pipe_pink', 590, 790, 0.24, 0.08], ['odd_claw_purple', 990, 784, 0.24, -0.05]]
          .sort((a, b) => a[2] - b[2]).forEach(([n, x, y, s, r]) => I.place(c, P[n], x, y, s, { look: 'warehouse', depth: y > 820 ? 0.95 : 0.7, r, sa: 0.3, haze: 0.25 }));
        I.place(c, P.brick_red_2x4, hx, hy, sb, { look: 'warehouse', depth: 1, sa: 0.42, ca: 0.7 });
        I.place(c, P.odd_dish_orange, hx + 14, hy - hb * 0.33, 0.66, { look: 'warehouse', depth: 1, noShadow: 1 });
        S.glow(c, hx, hy - hb * 0.9, 260, 'rgba(255,205,140,1)', 0.12);
        S.dust(c, t, 420, 280, 700, 500, 50); });
      S.grade(ctx, 0.05, 0.5); } },
];
S.run({ module, T: 18, shots, load });
