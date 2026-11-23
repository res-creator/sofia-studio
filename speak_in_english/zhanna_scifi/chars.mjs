// chars.mjs — «Тётя Жанна» cast redrawn in the Sci-Fi Sitcom Toon grammar (thick boiling ink, flat fills, hard shadow
// shapes, big touching white eyes with tiny pupils, elastic mouths). Origin at the feet, y down. face=1 → looks right.
// Engine: lib/toon.mjs (MIT, Lemo-Opuscar). Characters, props and portal are our own designs.
import { lerp, TAU } from './lib/lib.mjs';
import { push, pop, translate, scale, rotate, shape, fillOnly, stroke, ell, arc, spline, rr, rect, noodle, quad, dot, text } from './lib/toon.mjs';

export const P = {
  skinZ: '#f3c29b', skinZs: '#d99b74', hair: '#f6d35b', hairS: '#d9a929', hairL: '#fff0a8',
  coat: '#e9a94a', coatS: '#c07f2a', spot: '#4a2a1c', fur: '#fbe9d0', furS: '#e0c6a3',
  legs: '#2a2232', heel: '#f2b928', lips: '#e0234f', lipsS: '#a8143a', shadow: '#4fc8de', nail: '#ff3fa4', gold: '#ffc830', goldS: '#d89a10',
  skinK: '#c98c62', skinKs: '#a56b45', hairK: '#3a2418', hoodie: '#7fd6b4', hoodieS: '#52b08f', jeans: '#5a78c8', jeansS: '#3f5aa0', sneaker: '#ffffff',
  skinP: '#e8b896', skinPs: '#c99272', track: '#2c3f8f', trackS: '#1f2d6a', stripe: '#f4f1ea', fringe: '#b8b0a8', chair: '#9b3b4a', chairS: '#74283a', paper: '#efe9d8',
  mouthIn: '#4a1a2a', tongue: '#e8637a', white: '#ffffff',
  portal: '#ff3fa4', portalA: '#ffd23f', portalB: '#b03cff', portalCore: '#fff4fb',
};

// —— face parts ——
export function eye(cx, cy, rx, ry, { lid = 0, look = [0, 0], pupil = 5, lidCol = P.skinZ, lash = 0, closed = false, lw = 6, jit = 0, lower = 0, bag = 0 } = {}) {
  if (closed) { stroke(arc(cx, cy + ry * .1, rx * .8, ry * .45, Math.PI * .08, Math.PI * .92, 14), lw); return; }
  shape(ell(cx, cy, rx, ry, 36), {
    fill: P.white, lw, shade: () => {
      dot(cx + look[0] * rx * .55 + jit, cy + look[1] * ry * .5, pupil);
      if (lid > 0) {
        const yl = cy - ry + lid * 2 * ry;
        fillOnly([[cx - rx * 1.3, cy - ry * 1.5], [cx + rx * 1.3, cy - ry * 1.5], [cx + rx * 1.3, yl], [cx - rx * 1.3, yl + ry * .1]], lidCol, { boil: .5 });
        stroke([[cx - rx * 1.2, yl + ry * .1], [cx + rx * 1.2, yl]], lw);
      }
      if (lower > 0) { const yb = cy + ry - lower * 2 * ry; fillOnly(rect(cx - rx * 1.3, yb, rx * 2.6, ry * 2), P.skinZ, { boil: .5 }); stroke([[cx - rx * 1.2, yb], [cx + rx * 1.2, yb]], lw * .8); }
    }
  });
  if (lash) for (let i = 0; i < 3; i++) { const a = -Math.PI * (.62 + i * .13) * (lash > 0 ? 1 : 1), yl = cy - ry + lid * 2 * ry; const x0 = cx + Math.cos(a) * rx * 1.02 * lash; stroke([[x0, yl + ry * .05 * i], [x0 + 12 * lash, yl - 14 - i * 3]], lw * .7); }
  if (bag) stroke(arc(cx, cy + ry * .9, rx * .7, ry * .35, Math.PI * .15, Math.PI * .85, 10), lw * .55);
}
// Glam mouth: red lips. o open 0..1, w width, sm smile(+)/frown(−), skew lopsided smirk
export function lipsMouth(cx, cy, mw, { o = 0, w = 1, sm = 0, skew = 0, lw = 6, lip = P.lips } = {}) {
  const hw = mw * w / 2, k = mw * .24, lc = [cx - hw, cy - sm * k + skew * k], rc = [cx + hw, cy - sm * k - skew * k];
  if (o < .07) {
    const top = quad(lc, [cx, cy - 7 + sm * k * .9], rc, 14), bot = quad(rc, [cx, cy + 12 + sm * k * 1.3], lc, 14);
    shape([...top, ...bot], { fill: lip, lw: lw * .8, shade: () => fillOnly(quad(rc, [cx, cy + 14 + sm * k * 1.3], lc, 14).concat([[cx, cy + 4 + sm * k]]), P.lipsS, { boil: .3 }) });
    stroke(quad(lc, [cx, cy + 2 + sm * k * 1.1], rc, 12), lw * .7);
    return;
  }
  const h = o * mw * .62;
  const up = quad(lc, [cx, cy - h * .25 + sm * k * .4 - 8], rc, 12), dn = quad(rc, [cx, cy + h + sm * k * .6 + 8], lc, 14);
  shape([...up, ...dn], {
    fill: lip, lw: lw * .8, shade: () => {
      const iu = quad([lc[0] + 8, lc[1]], [cx, cy - h * .25 + sm * k * .4], [rc[0] - 8, rc[1]], 12), idn = quad([rc[0] - 8, rc[1]], [cx, cy + h + sm * k * .6], [lc[0] + 8, lc[1]], 14);
      shape([...iu, ...idn], { fill: P.mouthIn, lw: lw * .6, shade: () => {
        if (o > .22) fillOnly(rect(cx - hw, cy - h, hw * 2, h * .42 + 4), P.white, { boil: .3 });
        fillOnly(ell(cx + hw * .1, cy + h * .9, hw * .55, h * .42, 20), P.tongue, { boil: .3 });
      } });
    }
  });
}
export function plainMouth(cx, cy, mw, { o = 0, w = 1, sm = 0, skew = 0, lw = 6 } = {}) {
  const hw = mw * w / 2, k = mw * .22, lc = [cx - hw, cy - sm * k + skew * k], rc = [cx + hw, cy - sm * k - skew * k];
  if (o < .07) { stroke(quad(lc, [cx, cy + sm * k * 1.2], rc, 12), lw); return; }
  const h = o * mw * .62, up = quad(lc, [cx, cy - h * .25 + sm * k * .4], rc, 12), dn = quad(rc, [cx, cy + h + sm * k * .6], lc, 14);
  shape([...up, ...dn], { fill: P.mouthIn, lw, shade: () => {
    if (o > .22) fillOnly(rect(cx - hw * 1.2, cy - h, hw * 2.4, h * .38 + 6), P.white, { boil: .3 });
    fillOnly(ell(cx + hw * .15, cy + h * .95, hw * .6, h * .45, 20), P.tongue, { boil: .3 });
  } });
}
// Hand with long glam nails. open hand or point (index out). ang = direction the fingers go
export function hand(x, y, ang, r = 20, col = P.skinZ, { pose = 'open', nails = null, lw = 6 } = {}) {
  push(); translate(x, y); rotate(ang);
  let pts, tips;
  if (pose === 'point') { pts = spline([[-r * .6, -r * .8], [r * .6, -r * .55], [r * 1.9, -r * .45], [r * 2.05, -r * .1], [r * 1.0, 0], [r * .9, r * .7], [-r * .5, r * .85], [-r * .9, 0]]); tips = [[r * 1.95, -r * .28, 0]]; }
  else if (pose === 'fist') { pts = spline([[-r * .6, -r * .8], [r * .7, -r * .9], [r * 1.1, -r * .1], [r * .8, r * .8], [-r * .5, r * .9], [-r * .9, 0]]); tips = []; }
  else { pts = spline([[-r * .5, -r * .85], [r * .5, -r * 1.05], [r * 1.35, -r * .75], [r * 1.05, -r * .3], [r * 1.5, -r * .1], [r * 1.1, r * .3], [r * 1.35, r * .7], [r * .6, r * .95], [-r * .6, r * .8], [-r * .95, 0]]); tips = [[r * 1.3, -r * .72, -.3], [r * 1.45, -r * .1, 0], [r * 1.3, r * .66, .3]]; }
  shape(pts, { fill: col, lw });
  if (nails) for (const [a, b, rot] of tips) { push(); translate(a, b); rotate(rot); shape(ell(r * .12, 0, r * .26, r * .14, 12), { fill: nails, lw: lw * .55 }); pop(); }
  pop();
}
const sparkle = (x, y, s, col = P.white) => shape([[x, y - s], [x + s * .25, y - s * .25], [x + s, y], [x + s * .25, y + s * .25], [x, y + s], [x - s * .25, y + s * .25], [x - s, y], [x - s * .25, y - s * .25]], { fill: col, lw: 4 });
export const sweat = (x, y, s = 1) => shape(spline([[x, y - 16 * s], [x + 9 * s, y + 4 * s], [x, y + 12 * s], [x - 9 * s, y + 4 * s]]), { fill: '#bfe9ff', lw: 5 });

// —— ZHANNA: glam émigrée, ~55. Absurd costume idea: a leopard fur coat with a towering bouffant and a rhinestone
// clutch that opens portals. Deadpan troll: heavy turquoise lids, tiny pupils, lopsided red smirk.
// e = { lid, look, o, w, sm, skew, brow (−1 angry … +1 raised), browL/browR override, arm: 'hips'|'point'|'clutch'|'wave', blush, jit }
export function zhanna(x, y, s = 1, face = 1, e = {}) {
  const { lid = .42, look = [.35, .05], o = 0, w = 1, sm = .35, skew = .5, brow = .2, arm = 'hips', clutch = true, jit = 0, bag = 1, lash = 1, mouthOff = 0 } = e;
  push(); translate(x, y); scale(s * face, s);
  // legs
  for (const lx of [-34, 30]) {
    shape(noodle([lx, -175], [lx * 1.1, -22], lx < 0 ? 6 : -6, 30, 22), { fill: P.legs });
    shape(spline([[lx * 1.1 - 18, -24], [lx * 1.1 + 26, -26], [lx * 1.1 + 34, -6], [lx * 1.1 + 22, 0], [lx * 1.1 - 22, 0]]), { fill: P.heel });
    stroke([[lx * 1.1 - 16, -2], [lx * 1.1 - 18, 14]], 6);
  }
  // back arm (behind coat)
  const armBack = () => { shape(noodle([-62, -390], [-112, -250], -10, 40, 34), { fill: P.coat }); hand(-114, -226, Math.PI * .55, 20, P.skinZ, { nails: P.nail }); };
  if (arm !== 'wave2') armBack();
  // coat: bell shape
  const coat = spline([[-70, -420], [70, -420], [104, -300], [120, -170], [96, -150], [-96, -150], [-120, -170], [-104, -300]]);
  shape(coat, { fill: P.coat, shade: () => {
    fillOnly(spline([[40, -420], [140, -420], [140, -140], [70, -150], [86, -300]]), P.coatS, { boil: .5 });
    const sp = [[-70, -360], [-30, -320], [10, -380], [50, -340], [-80, -260], [-40, -230], [20, -270], [70, -250], [-60, -190], [0, -185], [60, -195], [-20, -400], [90, -390]];
    for (const [a, b] of sp) { shape(spline([[a - 10, b - 6], [a + 9, b - 8], [a + 12, b + 5], [a - 4, b + 9], [a - 12, b + 3]]), { fill: P.spot, lw: 0, line: null, boil: .6 }); }
  } });
  stroke([[0, -400], [4, -160]], 5);   // coat opening
  // fur collar (lumpy)
  const col = []; for (let i = 0; i <= 12; i++) { const a = Math.PI * (1.05 + i / 12 * .9); const r = i % 2 ? 84 : 96; col.push([Math.cos(a) * r, -405 + Math.sin(a) * 34 + (i % 2 ? 6 : -4)]); }
  col.push([78, -392], [40, -378], [0, -372], [-40, -378], [-78, -392]);
  shape(spline(col), { fill: P.fur, shade: () => fillOnly(rect(-110, -400, 220, 40), P.furS, { boil: .4 }) });
  // neck + head
  shape(rr(-20, -460, 40, 60, 14), { fill: P.skinZ });
  push(); translate(0, -560);
  // hair back mass (bouffant)
  const hb = spline([[0, -215], [104, -196], [156, -124], [154, -24], [140, 46], [172, 92], [120, 100], [92, 54], [0, 30], [-92, 54], [-120, 100], [-172, 92], [-140, 46], [-154, -24], [-156, -124], [-104, -196]]);
  shape(hb, { fill: P.hair, shade: () => { fillOnly(spline([[40, -220], [170, -150], [180, 110], [100, 110], [110, -20]]), P.hairS, { boil: .5 }); } });
  for (const q of [[[-120, -150], [-140, -60], [-128, 30]], [[118, -150], [138, -60], [126, 30]], [[-40, -196], [-90, -170]], [[60, -196], [100, -170]]]) stroke(spline(q, false), 4);
  // face
  const fc = spline([[-62, -70], [58, -78], [84, -10], [76, 60], [40, 104], [-10, 112], [-56, 88], [-80, 30], [-82, -30]]);
  shape(fc, { fill: P.skinZ, shade: () => fillOnly(spline([[40, -90], [100, -40], [96, 80], [30, 120], [64, 30]]), P.skinZs, { boil: .5 }) });
  // ear + gold hoop (far side hidden)
  shape(ell(-80, 14, 14, 22, 16), { fill: P.skinZ });
  shape(ell(-82, 58, 18, 22, 22), { fill: null, lw: 9, line: P.gold, stroke: true });
  stroke(ell(-82, 58, 18, 22, 22).concat([[-82 + 18, 58]]), 3);
  // fringe: one big side-swept swoop with a curl (not a rim)
  shape(spline([[-100, -6], [-108, -92], [-46, -156], [58, -158], [116, -94], [100, -54], [62, -92], [10, -96], [-36, -70], [-70, -30]]), { fill: P.hair, shade: () => fillOnly(spline([[-60, -150], [10, -160], [-10, -120], [-60, -110]]), P.hairL, { boil: .5 }) });
  stroke(spline([[-80, -40], [-60, -110], [0, -138]], false), 4); stroke(spline([[30, -112], [80, -116], [100, -76]], false), 4);
  // sunglasses pushed up into the hair
  shape(rr(-74, -196, 64, 36, 16), { fill: '#2a2232' }); shape(rr(0, -196, 64, 36, 16), { fill: '#2a2232' }); stroke([[-10, -182], [0, -182]], 6);
  fillOnly(rr(-64, -190, 16, 8, 4), '#8f86a3', { boil: .3 }); fillOnly(rr(10, -190, 16, 8, 4), '#8f86a3', { boil: .3 });
  // eyes (touching), turquoise lids, lashes
  const bl = e.browL ?? brow, br = e.browR ?? brow;
  eye(-24, 0, 30, 34, { lid, look, pupil: 5, lidCol: P.shadow, lash: 0, jit, bag });
  eye(36, -2, 30, 34, { lid, look, pupil: 5, lidCol: P.shadow, lash: 0, jit, bag });
  if (lash) for (const [ex, sgn] of [[-24, -1], [36, 1]]) { const yl = -34 + lid * 68; stroke([[ex + sgn * 26, yl + 2], [ex + sgn * 40, yl - 10]], 5); stroke([[ex + sgn * 18, yl - 2], [ex + sgn * 28, yl - 16]], 5); }
  // pencilled brows
  stroke(quad([-52, -46 - bl * 10], [-26, -60 - bl * 16], [-2, -50 - bl * 4], 10), 6);
  stroke(quad([14, -50 - br * 4], [40, -62 - br * 16], [66, -48 - br * 10], 10), 6);
  // nose + mole + blush
  stroke(spline([[8, 22], [20, 46], [6, 52]], false), 5);
  dot(54, 74, 4); fillOnly(ell(-46, 50, 16, 9, 14), '#f49aa0', { boil: .3 }); fillOnly(ell(64, 44, 13, 8, 14), '#f49aa0', { boil: .3 });
  lipsMouth(10 + mouthOff, 80, 64, { o, w, sm, skew, lw: 6 });
  pop();
  // front arm
  if (arm === 'hips') { shape(noodle([62, -390], [118, -270], 18, 40, 34), { fill: P.coat }); shape(noodle([118, -270], [84, -214], 10, 34, 28), { fill: P.coat }); hand(80, -206, Math.PI * .95, 20, P.skinZ, { pose: 'fist' }); }
  else if (arm === 'point') { shape(noodle([62, -390], [150, -330], 12, 40, 32), { fill: P.coat }); shape(noodle([150, -330], [218, -400], 8, 32, 26), { fill: P.coat }); hand(226, -410, -Math.PI * .28, 21, P.skinZ, { pose: 'point', nails: P.nail }); }
  else if (arm === 'clutch' || arm === 'wave') { shape(noodle([62, -390], [130, -290], 14, 40, 34), { fill: P.coat }); shape(noodle([130, -290], [176, -330], 10, 34, 28), { fill: P.coat }); hand(184, -316, -Math.PI * .05, 20, P.skinZ, { nails: P.nail }); if (clutch) clutchBag(206, -352, 1, e.glow ?? 0); }
  pop();
}
// The rhinestone clutch = Zhanna's portal remote. Glow is the portal colour (only the travel device glows).
export function clutchBag(x, y, s = 1, glow = 0) {
  push(); translate(x, y); scale(s);
  if (glow > 0) for (const [r, a] of [[90, .18], [60, .28]]) shape(ell(0, 0, r, r * .8, 30), { fill: P.portal, alpha: a * glow, line: null, boil: .4 });
  shape(spline([[-52, -30], [52, -30], [60, 30], [-60, 30]]), { fill: P.gold, shade: () => fillOnly(rect(10, -40, 70, 80), P.goldS, { boil: .4 }) });
  shape(quad([-52, -30], [0, 18], [52, -30], 14).concat([[52, -34], [-52, -34]]), { fill: P.portal, lw: 5 });
  for (const [a, b] of [[-36, 10], [-14, 20], [14, 20], [36, 10], [-24, -6], [24, -6]]) dot(a, b, 3.6, P.white);
  shape(ell(0, 6, 9, 9, 14), { fill: P.portalCore, lw: 5 });
  pop();
}

// —— KAYLEE: 20-ish American student, the nervous one. Absurd idea: a hoodie with an enormous hood ring + a phone always up.
export function kaylee(x, y, s = 1, face = 1, e = {}) {
  const { lid = 0, look = [-.3, 0], o = .1, w = .8, sm = -.3, skew = 0, brow = .8, jit = 0, sweatOn = true, phone = true } = e;
  push(); translate(x, y); scale(s * face, s);
  for (const lx of [-26, 24]) { shape(noodle([lx, -150], [lx, -20], 0, 32, 28), { fill: P.jeans, shade: () => fillOnly(rect(lx + 4, -160, 30, 150), P.jeansS, { boil: .4 }) }); shape(rr(lx - 22, -24, 48, 26, 12), { fill: P.sneaker }); }
  shape(spline([[-64, -330], [64, -330], [84, -230], [76, -140], [-76, -140], [-84, -230]]), { fill: P.hoodie, shade: () => fillOnly(spline([[30, -340], [110, -330], [100, -120], [50, -140], [60, -240]]), P.hoodieS, { boil: .4 }) });
  shape(rr(-40, -230, 80, 44, 16), { fill: P.hoodieS, lw: 5 });   // pocket
  stroke([[-14, -330], [-18, -280]], 4); stroke([[14, -330], [18, -280]], 4);   // strings
  // arms: both up holding phone in front of chest
  shape(noodle([-56, -318], [-40, -240], -14, 30, 26), { fill: P.hoodie }); shape(noodle([56, -318], [44, -240], 14, 30, 26), { fill: P.hoodie });
  if (phone) { shape(rr(-30, -280, 60, 92, 10), { fill: '#2a2232', shade: () => fillOnly(rr(-24, -274, 48, 78, 6), '#8fd3ff', { boil: .3 }) }); }
  hand(-36, -236, -Math.PI * .1, 15, P.skinK); hand(36, -236, Math.PI * 1.1, 15, P.skinK);
  push(); translate(0, -420);
  shape(spline([[-80, -20], [-40, -110], [50, -112], [90, -30], [96, 40], [60, 60], [-70, 56], [-96, 20]]), { fill: P.hairK });   // hair back
  shape(spline([[86, -60], [150, -40], [170, 30], [140, 60], [120, 0]]), { fill: P.hairK });   // ponytail
  shape(spline([[-62, -60], [56, -66], [76, 0], [60, 66], [10, 92], [-44, 78], [-70, 20]]), { fill: P.skinK, shade: () => fillOnly(spline([[34, -80], [90, -30], [80, 70], [30, 100], [56, 20]]), P.skinKs, { boil: .5 }) });
  shape(spline([[-74, -10], [-60, -78], [10, -98], [74, -60], [70, -20], [20, -54], [-30, -40]]), { fill: P.hairK });   // fringe
  eye(-18, 6, 30, 36, { lid, look, pupil: 4.5, lidCol: P.skinK, jit });
  eye(40, 4, 30, 36, { lid, look, pupil: 4.5, lidCol: P.skinK, jit });
  stroke(quad([-44, -40 - brow * 8], [-22, -48 - brow * 12], [-2, -44 + brow * 6], 10), 6); stroke(quad([18, -44 + brow * 6], [40, -50 - brow * 12], [64, -42 - brow * 8], 10), 6);
  for (const [a, b] of [[-36, 52], [-26, 58], [56, 50], [66, 56]]) dot(a, b, 2.6, P.skinKs);
  stroke(spline([[12, 30], [22, 48], [10, 52]], false), 5);
  plainMouth(14, 74, 46, { o, w, sm, skew, lw: 6 });
  if (sweatOn) sweat(84, -20, 1);
  pop(); pop();
}

// —— PETROVICH: Zhanna's husband. Face NEVER shown: always from behind, in his armchair, behind a newspaper.
export function petrovich(x, y, s = 1, e = {}) {
  const { paper = true, rustle = 0 } = e;
  push(); translate(x, y); scale(s);
  // armchair back (we see the back of the chair from behind? no — we see him from behind, chair back is lower)
  if (paper) { push(); translate(0, -500 + rustle * 3); rotate(rustle * .02);
    shape(rect(-170, -110, 340, 210), { fill: P.paper, shade: () => fillOnly(rect(-4, -120, 180, 230), '#ddd5bf', { boil: .3 }) });
    stroke([[0, -110], [0, 100]], 5);
    text('BRIGHTON POST', -84, -78, { font: '800 17px Bungee', fill: '#2a2232' }); text('КУРС ДОЛЛАРА', 84, -78, { font: '900 16px NBC', fill: '#2a2232' });
    for (let i = 0; i < 5; i++) { stroke([[-150, -40 + i * 26], [-20, -40 + i * 26]], 4, { boil: .3 }); stroke([[20, -40 + i * 26], [150, -40 + i * 26]], 4, { boil: .3 }); }
    pop(); }
  // body from behind
  shape(spline([[-120, -300], [120, -300], [150, -150], [140, -40], [-140, -40], [-150, -150]]), { fill: P.track, shade: () => fillOnly(spline([[40, -310], [170, -300], [160, -30], [80, -40], [100, -170]]), P.trackS, { boil: .4 }) });
  for (const sx of [-1, 1]) { stroke([[sx * 116, -290], [sx * 146, -120]], 8, { line: P.stripe }); stroke([[sx * 102, -292], [sx * 132, -122]], 8, { line: P.stripe }); }
  // head from behind: bald crown with grey horseshoe fringe, two ears
  push(); translate(0, -360);
  shape(ell(-74, 10, 18, 26, 16), { fill: P.skinP }); shape(ell(74, 10, 18, 26, 16), { fill: P.skinP });
  shape(ell(0, 0, 76, 82, 40), { fill: P.skinP, shade: () => { fillOnly(ell(40, 10, 60, 90, 30), P.skinPs, { boil: .4 }); fillOnly(spline([[-80, 26], [-40, 18], [0, 30], [40, 18], [80, 26], [80, 90], [-80, 90]]), P.fringe, { boil: .5 }); } });
  for (let i = -3; i <= 3; i++) stroke([[i * 20, 32 + Math.abs(i) * -2], [i * 21, 60]], 3);
  stroke(arc(-20, -30, 30, 14, Math.PI * 1.1, Math.PI * 1.6, 8), 4);
  pop();
  // armchair: side arms in front of him
  shape(rr(-200, -150, 60, 150, 24), { fill: P.chair, shade: () => fillOnly(rect(-170, -160, 40, 170), P.chairS, { boil: .3 }) });
  shape(rr(140, -150, 60, 150, 24), { fill: P.chair, shade: () => fillOnly(rect(170, -160, 40, 170), P.chairS, { boil: .3 }) });
  shape(rr(-150, -60, 300, 60, 16), { fill: P.chair });
  pop();
}

// —— The portal: Zhanna's own design — a sequinned magenta-gold vortex (no green, no goo). k = open 0..1
export function portal(x, y, r, t, k = 1) {
  if (k <= 0) return;
  push(); translate(x, y); scale(k * .78, k);
  for (const [rr_, a] of [[r * 1.45, .14], [r * 1.22, .22]]) shape(ell(0, 0, rr_, rr_, 40), { fill: P.portal, alpha: a, line: null, boil: .5 });
  const rim = []; for (let i = 0; i < 20; i++) { const a = i / 20 * TAU; const q = r * (1 + .06 * Math.sin(i * 2.7 + t * 3)); rim.push([Math.cos(a) * q, Math.sin(a) * q]); }
  shape(spline(rim), { fill: P.portal, lw: 8, shade: () => {
    for (let j = 0; j < 6; j++) { const a0 = j / 6 * TAU + t * 4; const arm = []; for (let i = 0; i <= 16; i++) { const u = i / 16; arm.push([Math.cos(a0 + u * 3.2) * r * (1 - u) * .95, Math.sin(a0 + u * 3.2) * r * (1 - u) * .95]); }
      for (let i = 16; i >= 0; i--) { const u = i / 16; arm.push([Math.cos(a0 + u * 3.2 + .35) * r * (1 - u) * .8, Math.sin(a0 + u * 3.2 + .35) * r * (1 - u) * .8]); }
      fillOnly(arm, j % 2 ? P.portalA : P.portalB, { boil: .4 }); }
    fillOnly(ell(0, 0, r * .3, r * .3, 24), P.portalCore, { boil: .4 });
  } });
  pop();
  for (let i = 0; i < 7; i++) { const a = i / 7 * TAU + t * 1.3; sparkle(x + Math.cos(a) * r * 1.05 * k * .78, y + Math.sin(a) * r * 1.05 * k, 9 + 4 * Math.sin(t * 6 + i), i % 2 ? P.portalA : P.white); }
}
