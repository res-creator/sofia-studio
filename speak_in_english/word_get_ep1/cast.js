// Our cast (heroine + Tom) drawn in the hand-drawn "Shusha & Kesha" style: brush outlines, potato shapes, watercolor, paper.
const K = require('./hand_kit');
const { draw, stroke, curve, spot, potato, rr, tube, handF, rng } = K;
const PAL = {
  a: { skin: '#ffd0ae', skinS: '#f2a27c', hair: '#3a2620', hairS: '#22150f', hairL: '#6b4a3c', card: '#ffc21f', cardS: '#e39a00', blouse: '#fff3e2', blouseS: '#ecd9bf', dots: '#f58fb0',
       jeans: '#7fb4ea', jeansS: '#5a8fd0', shoe: '#fbfbf8', shoeS: '#cfd6dc', lips: '#d9566b', ear: '#ffcf2e', iris: '#6b3b22', brow: '#3a2620', blush: 'rgba(255,90,120,0.42)' },
  t: { skin: '#ffc79c', skinS: '#ea9a6c', hair: '#8a4a22', hairS: '#653213', jumper: '#3d82ee', jumperS: '#2763cc', jeans: '#3a4866', jeansS: '#27324a', shoe: '#4a3428', shoeS: '#2f2018',
       iris: '#3aa36b', brow: '#6a3a1a', blush: 'rgba(255,90,110,0.35)' } };
const ease = v => { v = Math.max(0, Math.min(1, v)); return v * v * (3 - 2 * v); };
// arm poses: [elbow, hand] for left and right arm, relative to centre x and shoulder line sy
function POSES(x, sy) { return {
  down:    [[[x - 122, sy + 115], [x - 118, sy + 228]], [[x + 122, sy + 115], [x + 118, sy + 228]]],
  hips:    [[[x - 170, sy + 95], [x - 110, sy + 178]], [[x + 170, sy + 95], [x + 110, sy + 178]]],
  up:      [[[x - 172, sy - 115], [x - 150, sy - 265]], [[x + 172, sy - 115], [x + 150, sy - 265]]],
  pointL:  [[[x - 190, sy - 20], [x - 282, sy - 93]], [[x + 122, sy + 115], [x + 118, sy + 228]]],
  pointR:  [[[x - 122, sy + 115], [x - 118, sy + 228]], [[x + 190, sy - 20], [x + 282, sy - 93]]],
  cross:   [[[x - 70, sy + 110], [x + 62, sy + 75]], [[x + 70, sy + 110], [x - 62, sy + 75]]],
  shrug:   [[[x - 175, sy + 60], [x - 230, sy - 20]], [[x + 175, sy + 60], [x + 230, sy - 20]]],
  head:    [[[x - 180, sy - 40], [x - 120, sy - 170]], [[x + 180, sy - 40], [x + 120, sy - 170]]],
  cheer:   [[[x - 195, sy - 50], [x - 285, sy - 175]], [[x + 195, sy - 50], [x + 285, sy - 175]]],
  presentL:[[[x - 165, sy + 90], [x - 250, sy + 40]], [[x + 122, sy + 115], [x + 118, sy + 228]]],
  presentR:[[[x - 122, sy + 115], [x - 118, sy + 228]], [[x + 165, sy + 90], [x + 250, sy + 40]]],
  hold:    [[[x - 150, sy + 150], [x - 46, sy + 150]], [[x + 150, sy + 150], [x + 46, sy + 150]]] }; }
const HT = { down: ['open', 'open'], hips: ['fist', 'fist'], up: ['open', 'open'], pointL: ['point', 'open'], pointR: ['open', 'point'], cross: ['fist', 'fist'],
  shrug: ['open', 'open'], cheer: ['open', 'open'], head: ['open', 'open'], presentL: ['open', 'open'], presentR: ['open', 'open'], hold: ['fist', 'fist'] };
function arms(st, x, sy, sleeve, sleeveS, skin, skinS, seed, w0 = 40, w1 = 32) {
  const PS = POSES(x, sy), A = PS[st.prevPose || 'down'], B = PS[st.pose || 'down'], kk = st.poseK ?? 1, mix = (p, q) => [p[0] + (q[0] - p[0]) * kk, p[1] + (q[1] - p[1]) * kk];
  const P = [0, 1].map(k => [mix(A[k][0], B[k][0]), mix(A[k][1], B[k][1])]), sh = [[x - 90, sy + 8], [x + 90, sy + 8]];
  for (let k = 0; k < 2; k++) { const [e, h] = P[k]; draw(tube([sh[k], e, h], w0, w1), { fill: sleeve, shade: sleeveS, seed: seed + k, lw: 7 });
    handF(h[0], h[1], Math.atan2(h[1] - e[1], h[0] - e[0]), (kk < .5 ? HT[st.prevPose || 'down'] : HT[st.pose || 'down'])[k], skin, skinS, seed + 300 + k * 50, k ? -1 : 1); } }
function legs(x, y0, y1, col, colS, shoe, shoeS, seed, w = 46) {
  for (const s of [-1, 1]) { const lx = x + s * 44; draw(tube([[lx, y0], [lx + s * 4, y1]], w, w - 6), { fill: col, shade: colS, seed: seed + s, lw: 6 });
    draw(potato(lx + s * 16, y1 + 10, 50, 26, seed + 4 + s, .12), { fill: shoe, shade: shoeS, seed: seed + 6 + s, lw: 7 }); } }
function eyes(hx, ey, st, o) {   // o: {dx, rx, ry, iris, lashes, brow}
  for (const s of [-1, 1]) { const ex = hx + s * o.dx;
    const browY = ey - o.ry - 26 - (st.mood === 'surprised' ? 14 : 0);
    if (st.mood === 'sad') stroke([[ex - 34 * -s, browY + 14], [ex, browY + 2], [ex + 34 * -s, browY - 8]], 8, 20 + s);
    else if (st.mood === 'angry') stroke([[ex - 34 * -s, browY - 6], [ex, browY + 2], [ex + 34 * -s, browY + 16]], 9, 20 + s);
    else draw([[ex - 32, browY + 6], [ex, browY - 6], [ex + 32, browY + 4]], { closed: false, lw: o.browW || 7, seed: 22 + s, col: o.brow });
    if (st.blink || st.mood === 'happy') { curve([ex - 28, ey + 6], [ex, ey - 14], [ex + 28, ey + 6], 7, 24 + s); if (o.lashes) stroke([[ex + s * 28, ey + 2], [ex + s * 42, ey - 10]], 5, 26 + s); continue; }
    const big = st.mood === 'surprised' ? 1.15 : 1;
    draw(potato(ex, ey, o.rx * big, o.ry * big, 30 + s, .1), { fill: '#fffdf8', seed: 32 + s, lw: 6 });
    const px = st.look === 'left' ? -9 : st.look === 'right' ? 9 : 0;
    draw(potato(ex + px, ey + 5, o.rx * .52, o.ry * .5, 34 + s), { fill: o.iris, line: false, seed: 36 + s });
    draw(potato(ex + px, ey + 6, o.rx * .28, o.ry * .28, 38 + s), { fill: K.C.ink, line: false, seed: 40 + s });
    spot(ex + px - 5, ey - 2, 5, 5, 'rgba(255,255,255,0.95)');
    if (st.mood === 'smug' || st.mood === 'sleepy') { draw([[ex - o.rx - 4, ey - o.ry - 6], [ex + o.rx + 4, ey - o.ry - 6], [ex + o.rx + 4, ey - 2], [ex - o.rx - 4, ey - 2]], { fill: o.skin, line: false, seed: 42 + s, amp: 0, offset: 0 }); stroke([[ex - o.rx, ey - 2], [ex + o.rx, ey - 2]], 7, 44 + s); }
    else curve([ex - o.rx, ey - o.ry * .6], [ex, ey - o.ry * 1.25], [ex + o.rx, ey - o.ry * .6], o.lashes ? 9 : 6, 46 + s);
    if (o.lashes) stroke([[ex + s * (o.rx - 2), ey - o.ry * .55], [ex + s * (o.rx + 16), ey - o.ry * 1.0]], 6, 48 + s); } }
function mouth(hx, my, st, lips, seed) {
  const m = st.mouth || 0;
  if (m < 0.15) { if (st.mood === 'sad') curve([hx - 28, my + 12], [hx, my - 6], [hx + 28, my + 12], 7, seed);
    else if (st.mood === 'angry') curve([hx - 30, my + 6], [hx, my - 8], [hx + 30, my + 6], 7, seed);
    else if (st.mood === 'smug') draw([[hx - 30, my + 2], [hx + 4, my + 6], [hx + 34, my - 8]], { closed: false, lw: 7, seed, col: lips || K.C.ink });
    else if (st.mood === 'surprised') draw(potato(hx, my + 4, 14, 16, seed, .15), { fill: '#8f2b33', seed: seed + 1, lw: 6 });
    else draw([[hx - 30, my], [hx, my + 13], [hx + 30, my]], { closed: false, lw: 7, seed, col: lips || K.C.ink }); return; }
  const h = m < 0.45 ? 14 : 28; draw(potato(hx, my + 4, 30 + h * .3, h, seed + 2, .12), { fill: '#8f2b33', seed: seed + 3, lw: 6, col: lips || K.C.ink });
  if (h > 20) spot(hx, my + 4 + h * .45, 15, 8, 'rgba(255,130,140,0.9)'); }

// ---------------- heroine (dark bob, yellow cardigan over a cream polka-dot blouse, jeans) ----------------
function heroine(st) {
  const p = PAL.a, x = st.x, by = (st.by || 0), sy = 1215 + by, hx = x, hy = 960 + by, g = K.g;
  legs(x, 1480, 1690, p.jeans, p.jeansS, p.shoe, p.shoeS, 500);
  const body = [[x - 88, sy - 25], [x + 88, sy - 25], [x + 124, 1500], [x - 122, 1505]];
  draw(body, { fill: p.blouse, shade: p.blouseS, seed: 510, lw: 7 });
  g.save(); K.pathOf(body); g.clip(); const r = rng(511); for (let yy = sy - 10; yy < 1500; yy += 46) for (let xx = x - 120; xx < x + 125; xx += 46) spot(xx + (r() - .5) * 10 + ((yy / 46) % 2) * 23, yy + (r() - .5) * 10, 9, 9, p.dots); g.restore();
  for (const s of [-1, 1]) { const pnl = s < 0 ? [[x - 94, sy - 28], [x - 24, sy - 12], [x - 40, 1510], [x - 134, 1506]] : [[x + 94, sy - 28], [x + 24, sy - 12], [x + 40, 1510], [x + 134, 1506]];
    draw(pnl, { fill: p.card, shade: p.cardS, seed: 512 + s, lw: 7 }); }
  for (let k = 0; k < 3; k++) draw(potato(x - 34, sy + 60 + k * 85, 9, 9, 520 + k), { fill: '#fff4cf', seed: 523 + k, lw: 4 });
  arms(st, x, sy, p.card, p.cardS, p.skin, p.skinS, 530, 40, 33);
  draw(tube([[x, hy + 120], [x, sy - 20]], 46, 52), { fill: p.skinS, seed: 540, lw: 6 });
  // hair back: round dome + two locks down to the jaw, ends curled in
  draw(potato(hx, hy - 34, 196, 182, 541, .05), { fill: p.hair, shade: p.hairS, shadeDir: [14, 10], seed: 541, lw: 8 });
  for (const s of [-1, 1]) draw([[hx + s * 120, hy - 20], [hx + s * 196, hy + 10], [hx + s * 204, hy + 80], [hx + s * 186, hy + 130], [hx + s * 140, hy + 146], [hx + s * 118, hy + 120], [hx + s * 130, hy + 60]],
       { fill: p.hair, shade: p.hairS, shadeDir: [s * 10, 10], seed: 561 + s, lw: 8 });
  draw(potato(hx, hy + 24, 148, 150, 542, .06), { fill: p.skin, shade: p.skinS, shadeDir: [18, 14], seed: 543, lw: 8 });
  for (const s of [-1, 1]) draw(potato(hx + s * 150, hy + 96, 11, 13, 544 + s), { fill: p.ear, shade: '#e0a300', seed: 546 + s, lw: 4 });
  // fringe, side-swept from her right to her left, long on one side
  draw([[hx - 162, hy - 6], [hx - 156, hy - 80], [hx - 118, hy - 140], [hx - 52, hy - 176], [hx + 26, hy - 186], [hx + 100, hy - 168], [hx + 152, hy - 122], [hx + 176, hy - 56], [hx + 172, hy + 16], [hx + 150, hy - 30], [hx + 112, hy - 70], [hx + 56, hy - 96], [hx - 6, hy - 104], [hx - 64, hy - 94], [hx - 112, hy - 64], [hx - 140, hy - 30]],
       { fill: p.hair, shade: p.hairS, shadeDir: [0, 14], seed: 548, lw: 7 });
  draw([[hx - 70, hy - 156], [hx - 6, hy - 170], [hx + 60, hy - 160]], { closed: false, lw: 6, seed: 549, col: p.hairL });
  spot(hx - 104, hy + 80, 38, 22, p.blush); spot(hx + 104, hy + 80, 38, 22, p.blush);
  eyes(hx, hy + 14, st, { dx: 58, rx: 30, ry: 34, iris: p.iris, lashes: true, brow: p.brow, browW: 6, skin: p.skin });
  stroke([[hx + 2, hy + 40], [hx - 10, hy + 70], [hx + 8, hy + 72]], 5, 550);
  mouth(hx, hy + 108, st, p.lips, 551);
}
// ---------------- Tom (short brown hair with a side swoop, blue jumper, dark jeans) ----------------
function tom(st) {
  const p = PAL.t, x = st.x, by = (st.by || 0), sy = 1205 + by, hx = x, hy = 930 + by;
  legs(x, 1470, 1690, p.jeans, p.jeansS, p.shoe, p.shoeS, 600, 50);
  draw([[x - 100, sy - 25], [x + 100, sy - 25], [x + 134, 1495], [x - 132, 1500]], { fill: p.jumper, shade: p.jumperS, seed: 610, lw: 8 });
  draw([[x - 132, 1452], [x + 134, 1448], [x + 136, 1500], [x - 134, 1504]], { fill: p.jumperS, seed: 611, lw: 6 });
  arms(st, x, sy, p.jumper, p.jumperS, p.skin, p.skinS, 630, 44, 36);
  draw(tube([[x, hy + 140], [x, sy - 20]], 56, 62), { fill: p.skinS, seed: 640, lw: 6 });
  draw(potato(x, sy - 22, 62, 20, 641, .1), { fill: p.jumperS, seed: 642, lw: 6 });
  for (const s of [-1, 1]) draw(potato(hx + s * 126, hy + 30, 20, 28, 643 + s, .15), { fill: p.skin, shade: p.skinS, seed: 645 + s, lw: 6 });
  draw(potato(hx, hy + 14, 126, 160, 647, .06), { fill: p.skin, shade: p.skinS, shadeDir: [16, 12], seed: 648, lw: 8 });
  draw([[hx - 130, hy - 10], [hx - 140, hy - 84], [hx - 112, hy - 150], [hx - 52, hy - 192], [hx + 24, hy - 204], [hx + 92, hy - 180], [hx + 134, hy - 128], [hx + 140, hy - 52], [hx + 128, hy - 8], [hx + 112, hy - 62], [hx + 78, hy - 96], [hx + 24, hy - 108], [hx - 40, hy - 100], [hx - 76, hy - 118], [hx - 100, hy - 84], [hx - 116, hy - 46]],
       { fill: p.hair, shade: p.hairS, shadeDir: [0, 12], seed: 649, lw: 8 });
  draw([[hx - 60, hy - 168], [hx + 10, hy - 182], [hx + 70, hy - 166]], { closed: false, lw: 5, seed: 653, col: '#b06a3a' });
  spot(hx - 92, hy + 78, 32, 18, p.blush); spot(hx + 92, hy + 78, 32, 18, p.blush);
  eyes(hx, hy + 6, st, { dx: 50, rx: 27, ry: 31, iris: p.iris, lashes: false, brow: p.brow, browW: 9, skin: p.skin });
  draw(potato(hx + 4, hy + 58, 20, 26, 650, .14), { fill: p.skinS, seed: 651, lw: 6 });
  mouth(hx, hy + 112, st, null, 652);
}
module.exports = { heroine, tom, PAL, ease, arms, legs, eyes, mouth };
