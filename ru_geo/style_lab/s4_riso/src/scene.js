// Scene: «Почему Гренландия кажется размером с Африку?» — printed in three riso inks.
// Every frame is drawn as plate densities (R = Blue, G = Yellow, B = Pink) and printed by riso.js.
(() => {
const W = 1920, H = 1080, DUR = 14.6;
const INKS = ['#0078BF', '#FFE800', '#FF48B0'], PAPER = '#F3EDE1';
const plate = document.createElement('canvas'); plate.width = W; plate.height = H;
const c = plate.getContext('2d');
RISO.init(document.getElementById('out'));
const G = window.GEO;

// ---------- maths ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ioC = (x) => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const ioQ = (x) => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
const ioS = (x) => -(Math.cos(Math.PI * x) - 1) / 2;
const oC = (x) => 1 - Math.pow(1 - x, 3);
const oB = (x, s = 1.6) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
const oE = (x) => x >= 1 ? 1 : 1 - Math.pow(2, -10 * x);
const mercY = (lat) => Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360));
const D2R = Math.PI / 180;

// rigid rotation of the sphere that carries Greenland's centroid to (lonT, latT), north kept up
function moveGeom(geom, lonT, latT) {
  const [lon0, lat0] = G.gc, a = (lat0 - latT) * D2R, ca = Math.cos(a), sa = Math.sin(a);
  const f = ([lo, la]) => {
    const l = (lo - lon0) * D2R, p = la * D2R;
    let x = Math.cos(p) * Math.cos(l), y = Math.cos(p) * Math.sin(l), z = Math.sin(p);
    const x2 = x * ca + z * sa, z2 = -x * sa + z * ca;
    return [Math.atan2(y, x2) / D2R + lonT, Math.asin(clamp(z2, -1, 1)) / D2R];
  };
  return { type: 'MultiPolygon', coordinates: geom.coordinates.map(P => P.map(r => r.map(f))) };
}
const STAMPS = G.cells.map(([lo, la]) => moveGeom(G.greenland, lo, la));
const GRAT = d3.geoGraticule().step([15, 15]).extent([[-180, -60], [180.0001, 84.0001]])();

// ---------- timeline ----------
const T = {
  sweepB: [0.05, 0.95], sweepY: [0.85, 1.35], sweepP: [1.30, 1.75],
  titleIn: 1.6, titleOut: 3.0,
  push: [4.45, 5.35], tags: 3.1, bars: 3.45,
  lift: 5.15, slide: [5.6, 8.5], land: 8.6, cam2: [5.45, 9.0],
  ghostTag: 9.0, realTag: 9.05, card: 9.15, stamps0: 9.85, stampDt: 0.19, pull: [12.3, 13.75],
};
const STAMP_T = STAMPS.map((_, i) => i === 0 ? T.land : T.stamps0 + (i - 1) * T.stampDt);
const FINAL = STAMP_T[STAMP_T.length - 1];
window.SCENE_EVENTS = { T, STAMP_T, FINAL, DUR };

// camera: centre (merc x, merc y) and scale px/rad
const K0 = { x: 0.0, y: 0.86, s: 222 }, K0b = { x: -0.06, y: 0.92, s: 250 }, K1 = { x: -0.66, y: 2.02, s: 530 }, K3 = { x: 0.934, y: 0.26, s: 410 }, K4 = { x: 0.32, y: 0.95, s: 262 };
function camera(t) {
  const mix = (A, B, u) => ({ x: lerp(A.x, B.x, u), y: lerp(A.y, B.y, u), s: Math.exp(lerp(Math.log(A.s), Math.log(B.s), u)) });
  let k;
  if (t < T.push[0]) k = mix(K0, K0b, ioS(seg(t, 0.3, T.push[0])));
  else if (t < T.cam2[0]) k = mix(K0b, K1, ioC(seg(t, T.push[0], T.push[1])));
  else if (t < T.pull[0]) { k = mix(K1, K3, ioC(seg(t, T.cam2[0], T.cam2[1]))); const h = ioS(seg(t, T.cam2[1], T.pull[0])); k.s *= 1 + 0.02 * h; }
  else { const K3b = { ...K3, s: K3.s * 1.02 }; k = mix(K3b, K4, ioC(seg(t, T.pull[0], T.pull[1]))); k.s *= 1 + 0.012 * ioS(seg(t, T.pull[1], DUR)); }
  k.s *= 1 + 0.008 * ioS(seg(t, T.push[1], T.cam2[0]));
  return k;
}

// registration: fixed offsets, settling arrivals, kicks on accents, drift through the slide
const BASE = [[0.0, 0.0], [2.2, -1.4], [-1.6, 2.0]];
const DIRS = [[-0.8, 0.6], [0.9, 0.3], [0.2, -1.0]];
const KICKS = [
  { t: T.sweepY[0] + .25, a: 7 }, { t: T.sweepP[0] + .25, a: 8 }, { t: T.titleIn + .32, a: 6 },
  { t: T.lift, a: 5 }, { t: T.land + .02, a: 13 }, { t: T.card + .4, a: 6 },
  ...STAMP_T.slice(1).map(s => ({ t: s, a: 3.5, p: [2] })), { t: FINAL + .05, a: 9 },
];
function registration(t) {
  const off = BASE.map(b => [...b]);
  const arrive = [T.sweepB[0], T.sweepY[0], T.sweepP[0]];
  for (let i = 0; i < 3; i++) {
    const u = t - arrive[i];
    if (u > 0) { const e = 12 * Math.exp(-u / 0.35) * Math.cos(u * 9); off[i][0] += DIRS[i][0] * e; off[i][1] += DIRS[i][1] * e; }
  }
  for (const k of KICKS) {
    const u = t - k.t; if (u < 0 || u > 1.2) continue;
    const e = k.a * Math.exp(-u / 0.11) * Math.cos(u * 26);
    for (let i = 0; i < 3; i++) if (!k.p || k.p.includes(i)) { off[i][0] += DIRS[i][0] * e; off[i][1] += DIRS[i][1] * e; }
  }
  // drift through the slide, snapping back on landing
  const dr = t < T.land ? ioS(seg(t, T.slide[0], T.slide[1])) : 0;
  off[2][0] += 5.5 * dr; off[2][1] -= 3.5 * dr; off[0][0] -= 2.5 * dr;
  return off;
}

// ---------- plate drawing helpers ----------
const ink = (b, y, p) => `rgb(${Math.round(b * 255)},${Math.round(y * 255)},${Math.round(p * 255)})`;
const PAPERK = 'rgb(0,0,0)';
function mode(m) { c.globalCompositeOperation = m === 'add' ? 'lighter' : m === 'mul' ? 'multiply' : 'source-over'; }
function rr(x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
function text(s, x, y, font, col, opt = {}) {
  c.font = font; c.textAlign = opt.align || 'left'; c.textBaseline = opt.base || 'alphabetic';
  c.letterSpacing = (opt.ls || 0) + 'px'; mode(opt.mode || 'over'); c.fillStyle = col; c.fillText(s, x, y);
  c.letterSpacing = '0px';
}
const measure = (s, font, ls = 0) => { c.font = font; c.letterSpacing = ls + 'px'; const w = c.measureText(s).width; c.letterSpacing = '0px'; return w; };

// paper tag (cut-out label): knockout rect + text on the blue plate
function tag(x, y, lines, opt = {}) {
  const pad = 16, f1 = '700 30px U', f2 = '500 22px M';
  const w = Math.max(...lines.map((l, i) => measure(l.s, l.f || (i ? f2 : f1), l.ls || 0))) + pad * 2;
  const h = lines.reduce((a, l, i) => a + (l.h || (i ? 30 : 44)), 0) + pad * 1.2;
  const X = opt.right ? x - w : x;
  c.save(); c.globalAlpha = 1;
  if (opt.rot) { c.translate(X + w / 2, y + h / 2); c.rotate(opt.rot); c.translate(-(X + w / 2), -(y + h / 2)); }
  mode('add'); c.fillStyle = ink(0.42, 0, 0); rr(X + 7, y + 8, w, h, 3); c.fill();       // printed shadow
  mode('over'); c.fillStyle = PAPERK; rr(X, y, w, h, 3); c.fill();
  let yy = y + pad * .6;
  lines.forEach((l, i) => { yy += l.h || (i ? 30 : 44); text(l.s, X + pad, yy - (i ? 8 : 10), l.f || (i ? f2 : f1), l.col || ink(1, 0, 0), { ls: l.ls || 0 }); });
  c.restore();
  return { x: X, y, w, h };
}

function crop(x, y, sx, sy, len = 26) {
  c.strokeStyle = ink(1, 1, 1); c.lineWidth = 1.6; mode('over');
  c.beginPath(); c.moveTo(x + sx * 10, y); c.lineTo(x + sx * (10 + len), y); c.moveTo(x, y + sy * 10); c.lineTo(x, y + sy * (10 + len)); c.stroke();
}
function regMark(x, y, r) {
  c.strokeStyle = ink(1, 1, 1); c.lineWidth = 1.6; mode('over');
  c.beginPath(); c.arc(x, y, r, 0, 7); c.moveTo(x - r * 1.6, y); c.lineTo(x + r * 1.6, y); c.moveTo(x, y - r * 1.6); c.lineTo(x, y + r * 1.6); c.stroke();
  c.beginPath(); c.arc(x, y, r * .45, 0, 7); c.fillStyle = ink(1, 1, 1); c.fill();
}

// ---------- frame ----------
function draw(t) {
  c.setTransform(1, 0, 0, 1, 0, 0); mode('over'); c.fillStyle = PAPERK; c.fillRect(0, 0, W, H);
  const k = camera(t), s = k.s, tx = W / 2 - s * k.x, ty = H / 2 + s * k.y;
  const proj = d3.geoMercator().scale(s).translate([tx, ty]).precision(0.4);
  const path = d3.geoPath(proj, c);
  const P = (lo, la) => proj([lo, la]);
  const yTop = ty - s * mercY(84), yBot = ty - s * mercY(-60), xL = tx - Math.PI * s, xR = tx + Math.PI * s;

  // --- sheet chrome (in map space) ---
  const lm = s / 222;
  crop(xL - 18 * lm, yTop - 18 * lm, -1, -1); crop(xR + 18 * lm, yTop - 18 * lm, 1, -1);
  crop(xL - 18 * lm, yBot + 18 * lm, -1, 1); crop(xR + 18 * lm, yBot + 18 * lm, 1, 1);
  regMark(xL - 70 * lm, (yTop + yBot) / 2, 11 * lm); regMark(xR + 70 * lm, (yTop + yBot) / 2, 11 * lm);
  text('МЫСЛЕННЫЙ ЭКСПЕРИМЕНТ', xL, yTop - 26 * lm, `700 ${15 * lm}px M`, ink(1, 0, 0), { ls: 3 * lm });
  text('ЛИСТ 01 · ПРОЕКЦИЯ МЕРКАТОРА · 1569', xR, yTop - 26 * lm, `500 ${15 * lm}px M`, ink(1, 0, 0), { ls: 2 * lm, align: 'right' });
  // colour bar: solids, overprints and tint steps
  const cb = [[1, 0, 0], [0, 1, 0], [0, 0, 1], [1, 1, 0], [1, 0, 1], [0, 1, 1], [1, 1, 1], [.2, 0, 0], [.4, 0, 0], [.6, 0, 0], [0, 0, .3], [0, 0, .6]];
  cb.forEach((v, i) => { mode('over'); c.fillStyle = ink(...v); c.fillRect(xR - (cb.length - i) * 26 * lm, yBot + 14 * lm, 22 * lm, 22 * lm); });

  // --- ocean + graticule + land ---
  mode('over'); c.fillStyle = ink(0.15, 0, 0); c.fillRect(xL, yTop, xR - xL, yBot - yTop);
  c.save(); c.beginPath(); c.rect(xL, yTop, xR - xL, yBot - yTop); c.clip();
  mode('over'); c.fillStyle = ink(1, 0, 0); c.beginPath(); path(G.land); c.fill();
  // Africa on the yellow plate (blue knocked out)
  c.fillStyle = ink(0, 1, 0); c.beginPath(); path(G.africa); c.fill();
  // Greenland at home: pink solid until it peels; then a ghost (pink tint, dashed outline)
  const lifted = t >= T.lift;
  if (!lifted) { c.fillStyle = ink(0, 0, 1); c.beginPath(); path(G.greenland); c.fill(); }
  else {
    c.fillStyle = ink(0, 0, 0.24); c.beginPath(); path(G.greenland); c.fill();
  }
  // graticule (blue, prints over everything: green on Africa, violet on pink)
  mode('add'); c.strokeStyle = ink(1, 0, 0); c.lineWidth = 1.4 * Math.sqrt(lm); c.beginPath(); path(GRAT); c.stroke();
  if (lifted) {
    mode('over'); c.setLineDash([9, 7]); c.lineWidth = 2.6; c.strokeStyle = ink(0, 0, 1); c.beginPath(); path(G.greenland); c.stroke(); c.setLineDash([]);
  }
  c.restore();
  mode('over'); c.strokeStyle = ink(1, 0, 0); c.lineWidth = 2; c.strokeRect(xL, yTop, xR - xL, yBot - yTop);

  // --- stamps (Greenland transplanted to 14 equal-area cells of Africa) ---
  let count = 0;
  for (let i = 1; i < STAMPS.length; i++) {
    const u = t - STAMP_T[i]; if (u < 0) continue; count = i + 1;
    const ce = P(...G.cells[i]), kk = 1 + 0.16 * (1 - oC(clamp(u / 0.13)));
    c.save(); c.translate(ce[0], ce[1]); c.scale(kk, kk); c.translate(-ce[0], -ce[1]);
    mode('add'); c.fillStyle = ink(0, 0, 1); c.beginPath(); path(STAMPS[i]); c.fill(); c.restore();
  }
  if (t >= T.land) count = Math.max(count, 1);

  // --- measure bars (apparent width on the Mercator map) ---
  if (t >= T.bars && t < T.push[0] + .2) {
    const u = oC(seg(t, T.bars, T.bars + .45)), u2 = oC(seg(t, T.bars + .15, T.bars + .6));
    const bar = (lo0, lo1, la, uu, lab) => {
      const a = P(lo0, la), b = P(lo1, la), xe = lerp(a[0], b[0], uu);
      mode('over'); c.lineCap = 'butt'; c.strokeStyle = PAPERK; c.lineWidth = 18;
      c.beginPath(); c.moveTo(a[0] - 4, a[1]); c.lineTo(xe + 4, a[1]); c.stroke();
      c.beginPath(); c.moveTo(a[0], a[1] - 18); c.lineTo(a[0], a[1] + 18); c.moveTo(xe, a[1] - 18); c.lineTo(xe, a[1] + 18); c.lineWidth = 10; c.stroke();
      c.strokeStyle = ink(1, 0, 1); c.lineWidth = 7;
      c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(xe, a[1]); c.moveTo(a[0], a[1] - 14); c.lineTo(a[0], a[1] + 14); c.moveTo(xe, a[1] - 14); c.lineTo(xe, a[1] + 14); c.stroke();
      return b;
    };
    bar(-73.0, -11.3, 56.5, u);
    const b = bar(-17.5, 51.4, 40.5, u2);
    if (t > T.bars + .55) tag(b[0] + 26, b[1] - 34, [{ s: 'на карте —', f: '500 22px M', h: 30 }, { s: 'почти одинаковые', f: '500 22px M', h: 28 }]);
  }

  // --- labels ---
  if (t >= T.tags) {
    const u = oB(seg(t, T.tags, T.tags + .4), 2.0);
    const a = P(-24, 27);
    tag(a[0] + (1 - u) * -40, a[1] - 10, [{ s: 'АФРИКА' }], { right: true, rot: (1 - u) * -0.2 + 0.012 });
  }
  if (t >= T.ghostTag) {
    const a = P(-44, 59.5);
    tag(a[0] + 4, a[1] + 14, [{ s: 'на карте', f: '500 22px M', h: 30, ls: 0.5 }], { rot: -0.02 });
  }

  // --- Greenland cut-out: peel, slide (true shrink), press onto Africa ---
  let piece = null, pieceTag = null;
  if (lifted) {
    const us = ioC(seg(t, T.slide[0], T.slide[1]));
    const ul = ioQ(seg(t, T.slide[0] + .25, T.slide[1]));          // longitude lags: the path arcs
    const [lon0, lat0] = G.gc, [lon1, lat1] = G.cells[0];
    const lonT = lerp(lon0, lon1, ul), latT = lerp(lat0, lat1, us);
    const geom = moveGeom(G.greenland, lonT, latT);
    const liftU = t < T.land - .14 ? oB(seg(t, T.lift, T.lift + .5), 1.3) : 1 - ioQ(seg(t, T.land - .14, T.land));
    const ce = P(lonT, latT);
    const rot = (-3.2 * liftU + 1.2 * Math.sin((t - T.lift) * 2.1) * liftU * (1 - seg(t, T.slide[1] - .5, T.slide[1]))) * D2R;
    const sc = 1 + 0.035 * liftU;
    const stampU = t >= T.land ? 1 + 0.10 * (1 - oC(seg(t, T.land, T.land + .18))) : 1;
    c.save(); c.translate(ce[0], ce[1]); c.rotate(rot); c.scale(sc * stampU, sc * stampU); c.translate(-ce[0], -ce[1]);
    if (t < T.land) {
      // printed shadow (blue tint), then the paper edge of the cut-out, then the pink piece (knocks out what is beneath)
      c.save(); c.translate(16 * liftU, 22 * liftU); mode('add'); c.fillStyle = ink(0.5, 0, 0); c.beginPath(); path(geom); c.fill(); c.restore();
      mode('over'); c.lineJoin = 'round'; c.strokeStyle = PAPERK; c.lineWidth = 12 * liftU + 0.01; c.beginPath(); path(geom); c.stroke();
      c.fillStyle = ink(0, 0, 1); c.beginPath(); path(geom); c.fill();
    } else {
      // pressed onto the sheet: now it overprints (pink x yellow = red-orange)
      mode('add'); c.fillStyle = ink(0, 0, 1); c.beginPath(); path(geom); c.fill();
    }
    c.restore();
    const b = path.bounds(geom);
    piece = { ce, b, geom };
  }

  // stamp numbers (paper knockouts)
  if (t >= STAMP_T[1] - .05) {
    for (let i = 0; i < STAMPS.length; i++) {
      if (t < STAMP_T[i] + .06 || (i === 0 && t < STAMP_T[1])) continue;
      const ce = P(...G.cells[i]);
      text(String(i + 1), ce[0], ce[1] + 9, `700 ${Math.round(s / 15)}px U`, PAPERK, { align: 'center' });
    }
  }

  if (t >= T.tags + .12) {
    const u = oB(seg(t, T.tags + .12, T.tags + .52), 2.0);
    let x, y;
    if (piece) { const dn = ioC(seg(t, T.slide[1] - .6, T.land)); x = piece.b[0][0] - 18 - 60 * dn; y = (piece.b[0][1] + piece.b[1][1]) / 2 - 30 + 70 * dn; }
    else { const b = d3.geoPath(d3.geoMercator().scale(s).translate([tx, ty])).bounds(G.greenland); x = b[0][0] - 18; y = (b[0][1] + b[1][1]) / 2 - 30; }
    const lines = [{ s: 'ГРЕНЛАНДИЯ' }];
    if (t >= T.realTag) lines.push({ s: 'на самом деле', ls: 0.5 });
    tag(x + (1 - u) * -40, y, lines, { right: true, rot: (1 - u) * 0.2 - 0.015 });
  }
  // --- title card (screen space, slides in from the left as a paper cut-out) ---
  if (t >= T.titleIn && t < T.titleOut + .5) {
    const uin = oB(seg(t, T.titleIn, T.titleIn + .55), 1.2), uout = ioC(seg(t, T.titleOut, T.titleOut + .45));
    const f1 = '900 66px U';
    const w = Math.max(measure('ГРЕНЛАНДИЯ', f1), measure('= АФРИКА?', f1)) + 88, h = 252;
    const X = lerp(-w - 40, 64, uin) - uout * (w + 120), Y = 682;
    c.save(); c.translate(X, Y); c.rotate((-0.018 + (1 - uin) * -0.05));
    mode('add'); c.fillStyle = ink(0.45, 0, 0); c.fillRect(10, 12, w, h);
    mode('over'); c.fillStyle = PAPERK; c.fillRect(0, 0, w, h);
    text('ВОПРОС ИЗ ШКОЛЬНОГО АТЛАСА', 44, 52, '700 20px M', ink(1, 0, 0), { ls: 3 });
    text('ГРЕНЛАНДИЯ', 44, 134, f1, ink(1, 0, 0));
    text('= АФРИКА', 44, 212, f1, ink(1, 0, 0));
    const wq = measure('= АФРИКА', f1);
    text('?', 44 + wq + 4, 212, f1, ink(0, 0, 1));
    text('?', 44 + wq + 4 + 7, 212 + 6, f1, ink(1, 0, 0), { mode: 'add' });
    c.restore();
  }

  // --- answer card (screen space, slides in from the right) ---
  if (t >= T.card) {
    const u = oB(seg(t, T.card, T.card + .6), 1.1);
    const w = 660, h = 712, X = lerp(W + 40, 1196, u), Y = 150;
    c.save(); c.translate(X, Y); c.rotate(0.012 + (1 - u) * 0.06);
    mode('add'); c.fillStyle = ink(0.48, 0, 0); c.fillRect(-14, 16, w, h);
    mode('over'); c.fillStyle = PAPERK; c.fillRect(0, 0, w, h);
    text('ПЛОЩАДЬ АФРИКИ', 48, 66, '700 22px M', ink(1, 0, 0), { ls: 3 });
    text('В СРАВНЕНИИ С ГРЕНЛАНДИЕЙ', 48, 98, '500 22px M', ink(1, 0, 0), { ls: 1.5 });
    // the counter: blue plate + pink double-hit
    const n = Math.max(count, 1), big = '900 236px U';
    const fin = t >= FINAL ? oE(seg(t, FINAL, FINAL + .4)) : 0;
    const dx = 9 + 5 * fin;
    text('×' + n, 40 + dx, 330 + dx * .8, big, ink(0, 0, 1), { mode: 'add' });
    text('×' + n, 40, 330, big, ink(1, 0, 0), { mode: 'add' });
    text('РАЗ', 52, 410, '900 58px U', ink(1, 0, 0));
    mode('over'); c.fillStyle = ink(1, 0, 0); c.fillRect(48, 462, w - 96, 3);
    const row = (y, col, name, num) => {
      mode('over'); c.fillStyle = col; c.fillRect(48, y - 40, 46, 46);
      text(name, 116, y - 4, '700 32px U', ink(1, 0, 0));
      text(num, 116, y + 38, '500 26px M', ink(1, 0, 0), { ls: .5 });
    };
    const lu = seg(t, T.card + .35, T.card + .8);
    if (lu > 0) {
      c.save(); c.beginPath(); c.rect(0, 470, w * oC(lu) + 1, 240); c.clip();
      row(560, ink(0, 1, 0), 'АФРИКА', '30,4 млн км²');
      row(668, ink(0, 0, 1), 'ГРЕНЛАНДИЯ', '2,17 млн км²');
      c.restore();
    }
    c.restore();
  }
  return { cam: k };
}

// ---------- print ----------
function frame(t, fps = 30) {
  draw(t);
  const f = Math.round(t * fps);
  const off = registration(t);
  const sw = (a) => t < a[0] ? -400 : lerp(-60, W + 260, ioQ(seg(t, a[0], a[1])));
  RISO.print(plate, {
    off, rot: [0.0004, -0.0003, 0.0005],
    sweep: [sw(T.sweepB), sw(T.sweepY), sw(T.sweepP)],
    seed: Math.floor(f / 2) * 0.731 % 97, sheet: 0.37,
    inks: INKS, paper: PAPER, angles: [15, 0, 75], period: 7.2,
  });
}
window.renderAt = frame;
window.READY = document.fonts.load('900 20px U', 'АБВ×?').then(() => Promise.all([
  document.fonts.load('700 20px U', 'АБВ'), document.fonts.load('500 20px M', 'АБВ²'), document.fonts.load('700 20px M', 'АБВ'),
  document.fonts.load('900 20px U', '0123456789=')])).then(() => { frame(0); return true; });
})();
