// Chapter 3 — "The One-Dollar Deal" (b1–b7): two lawyers from Chattanooga want to bottle it; Candler sells the bottling rights for $1 (reportedly never collected);
// local businessmen pay for plants, trucks and salesmen; the company sells syrup; copycats; 1915: a bottle you can recognize in the dark — the contour bottle.
const L = require('../../../kit/look'), P = require('../../../kit/props'), { toon, LOOKS } = require('../../../kit/toon'), EN = require('../../../kit/engine');
const K = require('./atlantakit'), { PEOPLE } = K;
const { W, H, INK, CREAM, RED, YELLOW, BLUE, ERA, ink, rr, ell, poly, clamp, lerp, seg, E, hash } = L;
const TL = EN.timeline(__dirname, { start: 3.0, gap: 0.55 }), at = TL.at, begin = TL.begin;
const pop = (t, t0, d = 0.35) => clamp((t - t0) / d);
const CAND = LOOKS.candler, LA = LOOKS.lawyerA, LB = LOOKS.lawyerB;

// ---------- local props ----------
function dollar(ctx, x, y, s = 1, rot = 0, o = {}) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.save(); ctx.translate(6, 8); ctx.globalAlpha = 0.25; rr(ctx, -150, -66, 300, 132, 8); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();
  rr(ctx, -150, -66, 300, 132, 8); ink(ctx, o.dusty ? '#B9C4A0' : '#A8D49A', 5); rr(ctx, -136, -52, 272, 104, 6); ink(ctx, null, 2.5, { stroke: '#3E6A3A' }); ell(ctx, 0, 0, 38, 44); ink(ctx, '#86B878', 3.5);
  L.fitText(ctx, '1', 0, 3, 54, '#2E5A2A', 60); for (const sx of [-1, 1]) for (const sy of [-1, 1]) L.fitText(ctx, '1', sx * 112, sy * 34, 26, '#2E5A2A', 30); L.fitText(ctx, 'ONE DOLLAR', 0, 40, 14, '#2E5A2A', 120, { font: L.F.type });
  if (o.dusty) { ctx.save(); ctx.globalAlpha = o.dusty * 0.55; for (let i = 0; i < 60; i++) { ctx.beginPath(); ctx.arc(-140 + hash(i) * 280, -60 + hash(i * 2.3) * 120, 2 + hash(i * 5) * 4, 0, 6.27); ctx.fillStyle = '#8A8070'; ctx.fill(); } ctx.restore(); }
  ctx.restore(); }
function typewriter(ctx, x, y, s = 1, t = 0, typing = 0) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(ctx, -170, -110, 340, 110, 18); ink(ctx, '#2A2628', 6); for (let r = 0; r < 3; r++) for (let k = 0; k < 9; k++) { const dn = typing && hash(k * 7 + r + Math.floor(t * 14)) > 0.85 ? 4 : 0; ctx.beginPath(); ctx.arc(-128 + k * 32 + r * 8, -78 + r * 24 + dn, 11, 0, 6.27); ink(ctx, CREAM, 3); }
  rr(ctx, -190, -160, 380, 40, 18); ink(ctx, '#3A3438', 5); ctx.restore(); }
// contour bottle broken into lengthwise pieces lying on the ground (still recognizable)
function brokenBottle(ctx, x, y, s, u, t) { const cuts = [-40, -88, -140, -185]; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (let i = 0; i <= cuts.length; i++) { const top = i < cuts.length ? cuts[i] : -260, bot = i ? cuts[i - 1] : 20; const jag = yy => { const pts = []; for (let k = 0; k <= 8; k++) pts.push([-50 + k * 12.5, yy + (hash(yy * 3 + k) - 0.5) * 16]); return pts; };
    ctx.save(); ctx.translate(-i * 14 * u + i * 6, (i % 2 ? 8 : -6) * u); ctx.rotate(((hash(i * 9) - 0.5) * 0.35) * u); ctx.rotate(-Math.PI / 2); ctx.translate(0, 120);
    ctx.save(); const pa = [...jag(bot), ...jag(top).reverse()]; poly(ctx, i ? pa : [[-60, 30], [60, 30], ...jag(top).reverse()]); ctx.clip(); P.bottle(ctx, 0, 0, 1, { kind: 'contour', fill: 0, label: '', open: true }); ctx.restore(); ctx.restore(); }
  ctx.restore(); }
function glassFurnace(ctx, x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(-300, 0); ctx.lineTo(-300, -300); ctx.bezierCurveTo(-300, -560, 300, -560, 300, -300); ctx.lineTo(300, 0); ctx.closePath(); ctx.save(); ctx.clip(); L.bricks(ctx, -320, -600, 640, 620, '#8E4E3A', { bw: 50, bh: 20 }); ctx.restore();
  ctx.beginPath(); ctx.moveTo(-300, 0); ctx.lineTo(-300, -300); ctx.bezierCurveTo(-300, -560, 300, -560, 300, -300); ctx.lineTo(300, 0); ctx.closePath(); ink(ctx, null, 7);
  for (const gx of [-150, 0, 150]) { ctx.beginPath(); ctx.arc(gx, -230, 52, Math.PI, 0); ctx.lineTo(gx + 52, -150); ctx.lineTo(gx - 52, -150); ctx.closePath(); const fl = 0.85 + Math.sin(t * 13 + gx) * 0.15; ink(ctx, `rgb(255,${Math.round(150 * fl)},40)`, 5); L.glow(ctx, gx, -200, 200, '#FF9A3A', 0.45 * fl); }
  rr(ctx, -60, -660, 120, 160, 4); ink(ctx, '#5A3A2E', 6); K.smoke(ctx, 0, -680, t, { n: 6, rate: 0.4, drift: 180, rise: 300, s: 0.5, col: '#9A9088' }); ctx.restore(); }
function shelfRow(ctx, x0, x1, y, labels, o = {}) { rr(ctx, x0 - 20, y, x1 - x0 + 40, 26, 4); ink(ctx, '#8A5A33', 5); const n = labels.length; labels.forEach((lab, i) => { const bx = lerp(x0 + 40, x1 - 40, n > 1 ? i / (n - 1) : 0.5), u = o.u ? o.u(i) : 1; if (u <= 0) return;
    ctx.save(); ctx.translate(bx, y); const k = E.back(clamp(u), 2.4); ctx.scale(k, k); ctx.save(); ctx.rotate((o.wob ? Math.sin(o.t * 6 + i) * 0.03 : 0)); P.bottle(ctx, 0, 0, o.s || 0.9, { kind: 'straight', label: lab }); ctx.restore();
    rr(ctx, -95, 34, 190, 50, 6); ink(ctx, CREAM, 4); L.fitText(ctx, lab, 0, 60, 32, RED, 172); ctx.restore(); }); }

// ---------- scene times ----------
const W_ = (id, w, n) => at(id, w, n);
const s1 = 0, s2 = at('b1', 'two') - 0.12, s3 = at('b1', 'tennessee') + 0.4, s4 = at('b1', 'benjamin') - 0.12, s5 = at('b1', 'put') - 0.12,
  s6 = begin('b2') - 0.15, s7 = at('b2', 'and') - 0.12, s8 = at('b2', 'but') - 0.12,
  s9 = begin('b3') - 0.15, s10 = at('b3', 'states') + 0.3, s11 = at('b3', 'and', 0) - 0.12,
  s12 = begin('b4') - 0.12, s13 = at('b4', 'thomas') - 0.12, s14 = at('b4', 'they') - 0.12, s15 = at('b4', 'their', 1) - 0.12,
  s16 = begin('b5') - 0.12, s17 = at('b5', 'the', 1) - 0.12,
  s18 = begin('b6') - 0.12, s19 = at('b6', 'soon') - 0.12,
  s20 = begin('b7') - 0.12, s21 = at('b7', 'asked') - 0.12, s22 = at('b7', 'recognize') - 0.12, s23 = at('b7', 'or') - 0.12, s24 = at('b7', 'a', 2) - 0.12, s25 = at('b7', 'came') - 0.12, s26 = at('b7', 'the', 3) - 0.12;
const tDark = W_('b7', 'dark');

const scenes = [
  { name: '1899: a steam train', t0: s1, era: 'sepia', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -260, -100, 1.08], [s2 - s1, 120, -120, 1.18]], lt), tx = -800 + lt * 260;
      EN.layers(ctx, c, [[0.2, x => K.sky(x, ERA.sepia.sky, lt, { sun: [900, -620] })], [0.35, x => { K.hills(x, 40, '#B9A878', 70, 1); }],
        [0.6, x => { K.hills(x, 140, '#9DAE72', 50, 3); K.trees(x, 150, 18, '#6F8F52', 2); }],
        [1, x => { x.fillStyle = '#A8B26A'; x.fillRect(-2600, 200, 5200, 900); K.rails(x, 260); for (let i = 0; i < 7; i++) { rr(x, -2000 + i * 700, 120, 10, 140, 3); ink(x, '#6B4123', 3); }
          K.railcar(x, tx - 820, 260, 0.9, lt, { faces: true, seed: 2 }); K.locomotive(x, tx, 260, 0.95, lt, { driver: true, num: '1899', lamp: true }); K.smoke(x, tx + 200, -320, lt, { n: 10, rate: 1.1, drift: 900, rise: 300, s: 0.55 }); }],
        [1.35, x => { K.trees(x, 760, 5, '#5A7A44', 9, -1800, 1800); }]]);
      L.dateCard(ctx, '1899', 300, 150, pop(lt, W_('b1', '1899') - s1));
    } },
  { name: 'two lawyers from Chattanooga', t0: s2, era: 'sepia', out: { type: 'whip', dur: 0.3, dir: 1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 100, -120, 1.2], [s3 - s2, -60, -100, 1.08]], lt);
      EN.layers(ctx, c, [[0.3, x => { K.sky(x, ERA.sepia.sky, lt); K.hills(x, 100, '#B9A878', 60, 4); }],
        [0.7, x => { K.station(x, -300, 200, 1.05, 'CHATTANOOGA'); K.locomotive(x, 1100, 230, 0.8, lt * 0.1, { num: '1899' }); K.smoke(x, 1260, -50, lt, { n: 7, rate: 0.6, drift: 300, rise: 300, s: 0.4 }); }],
        [1, x => { L.planks(x, -2400, 200, 4800, 140, '#B98A55'); rr(x, -2400, 330, 4800, 600, 0); ink(x, '#8C7458', 0);
          toon(x, -260, 330, 1.15, LA, 'wave', 'happy', { t: lt, itemL: g => { rr(g, -40, -10, 80, 60, 8); ink(g, '#5A3420', 4); } });
          toon(x, 120, 330, 1.15, LB, 'hold', 'grin', { t: lt + 1, itemR: g => P.bottle(g, 0, 20, 0.5, { kind: 'straight' }) }); P.sparkles(x, 160, -170, 50, lt, 4); }],
        [1.3, x => { P.crate(x, 1200, 620, 1.3, { n: 4, kind: 'straight' }); }]]);
      L.plate(ctx, 'CHATTANOOGA, TENNESSEE', 960, 960, pop(lt, W_('b1', 'chattanooga') - s2), { size: 60 });
      L.word(ctx, 'TWO LAWYERS', 960, 150, pop(lt, 0.1), { size: 84, col: CREAM });
    } },
  { name: 'they came to see him', t0: s3, era: 'sepia', out: { type: 'whip', dur: 0.28, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -100, 1.08], [s4 - s3, -260, -110, 1.16]], lt);
      EN.layers(ctx, c, [[0.3, x => { K.sky(x, ERA.sepia.sky, lt); K.skyline(x, 120, '#D9B894', 2); }],
        [1, x => { P.street(x, -2400, 200, 4800, 700); P.storefront(x, -1500, 210, { w: 600, h: 560, col: '#9A6A4A', sign: 'BANK', upper: 3 }); P.storefront(x, -840, 210, { w: 820, h: 660, col: '#B8714C', sign: 'THE COCA-COLA CO.', signCol: '#7A1E1A', signFg: CREAM, awning: [RED, CREAM], upper: 3 });
          P.storefront(x, 40, 210, { w: 600, h: 580, col: '#8E5A3E', sign: 'TELEGRAPH', awning: [BLUE, CREAM], upper: 2 });
          const wx = Math.max(-560, 300 - lt * 560); toon(x, wx + 200, 330, 1.05, LB, wx > -560 ? 'walk' : 'hold', 'happy', { t: lt, flip: true, itemR: g => P.bottle(g, 0, 20, 0.45, { kind: 'straight' }) }); toon(x, wx + 440, 330, 1.05, LA, wx > -560 ? 'walk' : 'stand', 'smug', { t: lt + 0.4, flip: true });
          P.lamppost(x, 800, 230, 1); }],
        [1.3, x => { P.lamppost(x, -1500, 500, 1.3); }]]);
    } },
  { name: 'Benjamin Thomas and Joseph Whitehead: an idea', t0: s4, era: 'sepia', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -80, -60, 1.12], [s5 - s4, 20, -80, 1.2]], lt), tb = W_('b1', 'benjamin') - s4, tj = W_('b1', 'joseph') - s4, ti = W_('b1', 'idea') - s4;
      EN.layers(ctx, c, [[0.6, x => K.office(x, lt, { winX: 250, picX: -700, bookX: -1500, clock: [-150, -560] })],
        [1, x => { toon(x, 430, 150, 1.1, CAND, 'arms', 'think', { t: lt, look: [-0.6, 0] }); K.desk(x, 430, 150, 700);
          toon(x, -560, 330, 1.12, LA, lt > tb && lt < tj ? 'present' : lt > ti ? 'point' : 'stand', lt > ti ? 'grin' : 'happy', { t: lt, talk: lt > tb && lt < tj ? 0.7 : 0 });
          toon(x, -180, 330, 1.12, LB, lt > tj && lt < ti ? 'present' : lt > ti ? 'cheer' : 'stand', lt > ti ? 'laugh' : 'happy', { t: lt + 1, talk: lt > tj && lt < ti ? 0.7 : 0 });
          K.bulb(x, -370, -360, 0.9, pop(lt, ti, 0.4)); }]]);
      L.plate(ctx, 'BENJAMIN THOMAS', 420, 960, pop(lt, tb), { size: 46 }); L.plate(ctx, 'JOSEPH WHITEHEAD', 1060, 900, pop(lt, tj), { size: 46, rot: 0.03 });
    } },
  { name: 'put it in bottles', t0: s5, era: 'sepia', out: { type: 'whip', dur: 0.3, dir: 1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, 0, 1.45], [s6 - s5, 40, 10, 1.6]], lt), tb = W_('b1', 'bottles') - s5, u = E.out(clamp((lt - 0.1) / (tb - 0.1)));
      EN.layers(ctx, c, [[0.6, x => K.office(x, lt, { winX: -1300, picX: 300, bookX: 900 })],
        [1, x => { toon(x, 520, 180, 1.2, CAND, 'stand', lt > tb ? 'smug' : 'think', { t: lt, look: [-0.8, 0.4] }); K.desk(x, 0, 180, 1700); K.lamp(x, 760, 156, 1.0);
          for (let i = 0; i < 3; i++) P.glassCup(x, -560 + i * 90, 156, 0.55, { fill: 0.8, fizz: lt });
          x.save(); x.translate(lerp(-900, 100, u), 156); x.rotate(Math.sin(lt * 18) * 0.04 * (1 - u)); P.bottle(x, 0, 0, 0.95, { kind: 'straight' }); x.restore(); if (u < 1) P.speedLines(x, lerp(-1100, -100, u), -60, 400, 160, lt, -1, 0.4); if (lt > tb) P.sparkles(x, 100, -110, 120, lt, 6); }]]);
      L.word(ctx, 'IN BOTTLES', 960, 160, pop(lt, tb), { size: 110, col: YELLOW });
    } },
  { name: 'Candler not impressed; the bottle foams over', t0: s6, era: 'sepia', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 160, -40, 1.2], [s7 - s6, -60, -40, 1.1]], lt), tm = W_('b2', 'messy') - s6, f = clamp((lt - tm + 0.5) / 0.5);
      EN.layers(ctx, c, [[0.6, x => K.office(x, lt, { winX: -1500, picX: -200, bookX: 600 })],
        [1, x => { toon(x, 300, 150, 1.2, CAND, f > 0.5 ? 'shock' : 'arms', f > 0.5 ? 'disgust' : 'smug', { t: lt, look: [-0.6, 0.3] }); K.desk(x, 100, 150, 1300);
          toon(x, -780, 270, 1.0, LA, f > 0.5 ? 'facepalm' : 'present', 'worried', { t: lt }); toon(x, -520, 270, 1.0, LB, f > 0.5 ? 'shock' : 'hold', 'worried', { t: lt + 1 });
          x.save(); x.translate(-60, 126); x.rotate(Math.sin(lt * 40) * 0.05 * f); P.bottle(x, 0, 0, 0.8, { kind: 'straight', open: f > 0.1 }); x.restore();
          if (f > 0) { for (let i = 0; i < 26; i++) { const ph = ((lt - tm + 0.5) * 1.6 + i / 26) % 1, a = -Math.PI / 2 + (hash(i) - 0.5) * 1.6; x.beginPath(); x.arc(-60 + Math.cos(a) * ph * 520, -60 + Math.sin(a) * ph * 520 + ph * ph * 500, 14 * (1 - ph) + 4, 0, 6.27); ink(x, 'rgba(232,210,180,0.9)', 3); }
            x.save(); x.globalAlpha = clamp(f * 2); ell(x, 40, 140, 300 * f, 20); ink(x, '#5A2E18', 4); x.restore(); P.burst(x, -60, -60, 200, clamp((lt - tm + 0.5) / 0.6), CREAM); } }]]);
      L.word(ctx, 'MESSY', 1450, 170, pop(lt, tm), { size: 120, col: YELLOW, rot: 0.08 });
    } },
  { name: 'his drink belongs at the soda fountain', t0: s7, era: 'gaslight', out: { type: 'whip', dur: 0.3, dir: 1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -200, -110, 1.4], [s8 - s7, -60, -90, 1.25]], lt), tf = W_('b2', 'fountain') - s7;
      EN.layers(ctx, c, [[0.6, x => K.fountainRoom(x, lt, { sign: 'SODA FOUNTAIN' })],
        [1, x => { toon(x, -200, 90, 1.12, CAND, lt > tf ? 'hold' : 'present', 'laugh', { t: lt }); P.fountain(x, 0, 200, 0.85, { w: 2000, taps: 3 }); P.glassCup(x, 260, 0, 0.7, { fill: 0.85, fizz: lt }); P.glassCup(x, 360, 0, 0.7, { fill: 0.85, fizz: lt + 1 });
          for (let i = 0; i < 4; i++) { const ph = (lt * 0.6 + i / 4) % 1; x.save(); x.globalAlpha = Math.sin(ph * Math.PI); x.translate(-200 + Math.sin(i * 2 + lt * 2) * 140, -260 - ph * 300); x.scale(1 + ph * 0.4, 1 + ph * 0.4);
            x.beginPath(); x.moveTo(0, 18); x.bezierCurveTo(-40, -10, -20, -40, 0, -18); x.bezierCurveTo(20, -40, 40, -10, 0, 18); ink(x, RED, 4); x.restore(); } P.sparkles(x, 0, -60, 420, lt, 8); }]]);
      L.word(ctx, 'MADE FOR THE SODA FOUNTAIN', 960, 960, pop(lt, tf - 0.3), { size: 70, col: CREAM });
    } },
  { name: 'but if they want the risk... fine', t0: s8, era: 'sepia', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 100, -80, 1.15], [s9 - s8, 200, -100, 1.35]], lt), tf = W_('b2', 'fine') - s8, tr = W_('b2', 'risk') - s8;
      EN.layers(ctx, c, [[0.6, x => K.office(x, lt, { winX: -1300, picX: 600, bookX: 1100 })],
        [1, x => { toon(x, 260, 160, 1.2, CAND, lt > tf ? 'present' : 'shrug', lt > tf ? 'sleepy' : 'think', { t: lt, look: [-0.6, 0] }); K.desk(x, 260, 160, 1000);
          toon(x, -480, 270, 1.0, LA, lt > tf ? 'cheer' : 'hold', lt > tf ? 'laugh' : 'worried', { t: lt }); toon(x, -240, 270, 1.0, LB, lt > tf ? 'cheer' : 'hold', lt > tf ? 'laugh' : 'worried', { t: lt + 1 });
          if (lt > tr && lt < tf) L.fitText(x, 'RISK?', -440, -260, 60, RED, 300, { outline: 10 }); }]]);
      K.stampMark(ctx, 'FINE.', 1300, 200, pop(lt, tf, 0.25), { size: 110, rot: -0.1 });
    } },
  { name: 'the bottling rights: most of the United States', t0: s9, era: 'sepia', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -20, 1.35], [s10 - s9, 0, -40, 1.1]], lt), tm = W_('b3', 'most') - s9, u = clamp((lt - tm + 0.6) / 1.4), sg = clamp((lt - 0.4) / 1.6);
      EN.layers(ctx, c, [[0.6, x => { L.planks(x, -2400, -1400, 4800, 2800, '#7A4A2A', { pw: 70 }); }],
        [1, x => { K.doc(x, 0, 0, 1100, 760, { title: 'BOTTLING RIGHTS — COCA-COLA', lines: 0, sign: sg, draw: g => { K.usMap(g, 0, 0, 13, { cell: (lon, lat) => lon > -73.5 && lat > 41 ? null : (Math.hypot(lon + 84.4, lat - 33.75) / 45 < u ? '#E46A5A' : null) }); } });
          x.save(); x.translate(-330 + 24 * 11 * sg * 1.8, 330 - Math.abs(Math.sin(lt * 14)) * 10); x.rotate(-0.6); rr(x, -8, -170, 16, 170, 6); ink(x, '#2A2628', 4); poly(x, [[-8, 0], [8, 0], [0, 26]]); ink(x, '#D8B04A', 3); x.restore(); }],
        [1.3, x => { x.save(); x.translate(-1150, 400); x.rotate(0.2); P.bottle(x, 0, 0, 1.2, { kind: 'straight' }); x.restore(); K.inkwell(x, 1100, 380); }]]);
      L.word(ctx, 'MOST OF THE UNITED STATES', 960, 140, pop(lt, tm), { size: 74, col: YELLOW });
    } },
  { name: 'for one dollar', t0: s10, era: 'sepia', out: { type: 'whip', dur: 0.3, dir: 1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -100, 1.2], [s11 - s10, 0, -60, 1.35]], lt), td = W_('b3', 'dollar') - s10, f = E.out(clamp((lt - 0.1) / (td - 0.1)));
      EN.layers(ctx, c, [[0.6, x => K.office(x, lt, { winX: -1400, picX: -600, bookX: 600 })],
        [1, x => { toon(x, 520, 170, 1.15, CAND, lt > td ? 'present' : 'stand', 'smug', { t: lt }); toon(x, -520, 170, 1.15, LA, lt > td ? 'shock' : 'stand', lt > td ? 'grin' : 'neutral', { t: lt }); K.desk(x, 0, 170, 1800);
          dollar(x, Math.sin(lt * 5) * 120 * (1 - f), lerp(-560, 120, f), 0.95, Math.sin(lt * 6) * 0.4 * (1 - f)); if (lt > td) P.sparkles(x, 0, 120, 200, lt, 7); }]]);
      L.plate(ctx, '$1', 960, 170, pop(lt, td), { size: 150, bg: YELLOW });
    } },
  { name: 'reportedly never collected: the drawer', t0: s11, era: 'sepia', out: { type: 'tear', dur: 0.4 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -40, 1.0], [s12 - s11, 0, 0, 1.2]], lt), d = clamp((lt - 0.8) / 2.0);
      EN.layers(ctx, c, [[0.7, x => { L.planks(x, -2400, -1400, 4800, 2800, '#6B4123', { vertical: true, pw: 80 }); }],
        [1, x => { rr(x, -700, -340, 1400, 640, 10); ink(x, '#3A2418', 7); rr(x, -660, -300, 1320, 560, 6); ink(x, '#5A3420', 5); L.planks(x, -640, -280, 1280, 520, '#7A4A2A', { pw: 46 });
          dollar(x, -40, 40, 1.4, 0.06, { dusty: d }); K.cobweb(x, -660, -300, 300, d, 1); K.cobweb(x, 660, -300, 260, clamp(d * 1.3 - 0.2), -1); K.spider(x, 420, -40 + Math.sin(lt * 2) * 30, 1, lt);
          rr(x, -760, 300, 1520, 90, 8); ink(x, '#7A4A2A', 6); rr(x, -100, 330, 200, 30, 10); ink(x, '#D8B04A', 4); K.dust(x, -700, -340, 1400, 640, lt * 8, 0.6); }]]);
      L.plate(ctx, 'REPORTEDLY NEVER COLLECTED', 960, 150, pop(lt, W_('b3', 'reportedly') - s11), { size: 62, bg: CREAM });
      L.plate(ctx, 'YEARS LATER…', 1600, 930, pop(lt, 1.6), { size: 50, bg: CREAM });
    } },
  { name: 'that dollar built the empire', t0: s12, era: 'industry', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, 160, 1.5], [s13 - s12, 0, -100, 0.95]], lt), g = clamp((lt - 0.2) / 1.6);
      EN.layers(ctx, c, [[0.3, x => { K.sky(x, ERA.industry.sky, lt); K.hills(x, 260, '#A8A88A', 40, 5); }],
        [1, x => { x.fillStyle = '#8C8A6A'; x.fillRect(-2600, 300, 5200, 900); dollar(x, 0, 380, 4.2, 0);
          for (const [n, yy, sc, x0, dx, d0] of [[4, 150, 0.5, -540, 360, 0.5], [5, 290, 0.62, -720, 360, 0]]) for (let i = 0; i < n; i++) { const k = E.back(clamp(g * 1.6 - d0 - Math.abs(i - (n - 1) / 2) * 0.15), 1.6); if (k <= 0) continue; x.save(); x.translate(x0 + i * dx, yy); x.scale(k * sc, k * sc); K.plant(x, 0, 0, 1, lt + i, { sign: 'BOTTLING', smoke: true }); x.restore(); }
          if (g > 0.5) P.sparkles(x, 0, -200, 600, lt, 10); }]]);
      L.word(ctx, 'THE EMPIRE', 960, 150, pop(lt, W_('b4', 'empire') - s12), { size: 110, col: YELLOW });
    } },
  { name: "the lawyers didn't build every plant themselves", t0: s13, era: 'industry', out: { type: 'whip', dur: 0.3, dir: 1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -300, -60, 1.2], [s14 - s13, 200, -80, 1.05]], lt), tn = W_('b4', "didn't") - s13;
      EN.layers(ctx, c, [[0.3, x => { K.sky(x, ERA.industry.sky, lt); K.skyline(x, 120, '#B8A898', 5); }],
        [0.7, x => { x.fillStyle = '#9A9070'; x.fillRect(-2600, 100, 5200, 900); for (let i = 0; i < 9; i++) { const px = -1700 + i * 420, py = 150 + (i % 2) * 40; rr(x, px - 6, py - 120, 12, 120, 3); ink(x, '#6B4123', 3); rr(x, px - 90, py - 190, 180, 80, 6); ink(x, CREAM, 4); L.fitText(x, 'PLANT HERE?', px, py - 150, 26, INK, 160, { font: L.F.type }); } }],
        [1, x => { x.fillStyle = '#8C8A6A'; x.fillRect(-2600, 260, 5200, 900); rr(x, -500, 120, 1000, 30, 6); ink(x, '#6B4123', 5); rr(x, -460, 150, 20, 160, 4); ink(x, '#6B4123', 4); rr(x, 440, 150, 20, 160, 4); ink(x, '#6B4123', 4);
          K.doc(x, 0, 80, 700, 120, { lines: 0, rot: 0.02, bg: '#BFD8EE', draw: g => { for (let i = 0; i < 9; i++) { rr(g, -320 + i * 72, -40, 50, 50, 3); ink(g, null, 2.5, { stroke: '#2F4A7A' }); } } });
          toon(x, -280, 400, 1.15, LA, lt > tn ? 'shrug' : 'think', lt > tn ? 'worried' : 'think', { t: lt }); toon(x, 280, 400, 1.15, LB, lt > tn ? 'shrug' : 'point', lt > tn ? 'worried' : 'happy', { t: lt + 1, flip: true }); }]]);
      if (lt > tn) L.word(ctx, 'ALL OF THEM? NO.', 960, 150, pop(lt, tn), { size: 80, col: CREAM });
    } },
  { name: 'local businessmen pay for their own plants', t0: s14, era: 'industry', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -120, -100, 1.08], [s15 - s14, 260, -120, 1.15]], lt), tp = W_('b4', 'paid') - s14, tpl = W_('b4', 'plants') - s14;
      EN.layers(ctx, c, [[0.3, x => { K.sky(x, ERA.industry.sky, lt); K.hills(x, 160, '#A8A88A', 40, 2); }],
        [0.7, x => { K.plant(x, 700, 200, 1.2 * E.back(pop(lt, tpl, 0.5), 1.6) + 0.001, lt, { sign: 'BOTTLING WORKS' }); }],
        [1, x => { x.fillStyle = '#8C8A6A'; x.fillRect(-2600, 200, 5200, 900); rr(x, -760, 40, 560, 34, 6); ink(x, '#6B4123', 5); K.doc(x, -480, 10, 300, 90, { lines: 2, sign: clamp(lt / 1.2) }); rr(x, -740, 74, 20, 200, 4); ink(x, '#6B4123', 4); rr(x, -240, 74, 20, 200, 4); ink(x, '#6B4123', 4);
          toon(x, -900, 330, 1.05, LA, 'present', 'happy', { t: lt });
          [PEOPLE.gent, PEOPLE.gent2, PEOPLE.gent3, PEOPLE.gent].forEach((lk, i) => { const xx = -380 + i * 230 - Math.min(lt * 60, 120); toon(x, xx, 340 + (i % 2) * 14, 1.0, lk, lt > tp ? 'carry' : 'stand', lt > tp ? 'determined' : 'happy', { t: lt + i, seed: i, flip: true, itemR: lt > tp ? null : g => P.moneyBag(g, 0, 60, 0.45) });
            if (lt > tp) { const u = clamp((lt - tp - i * 0.2) / 0.7); x.save(); x.translate(lerp(xx - 40, 520, E.inOut(u)), lerp(150, 20, u) - Math.sin(u * Math.PI) * 240); P.moneyBag(x, 0, 0, 0.55); x.restore(); } }); }]]);
      L.plate(ctx, 'THEIR OWN MONEY', 960, 960, pop(lt, W_('b4', 'own') - s14), { size: 60, bg: YELLOW });
      L.word(ctx, 'LOCAL BUSINESSMEN', 960, 140, pop(lt, W_('b4', 'local') - s14), { size: 80, col: CREAM });
    } },
  { name: 'their own trucks and their own salesmen', t0: s15, era: 'industry', out: { type: 'whip', dur: 0.3, dir: 1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 200, -80, 1.15], [s16 - s15, -200, -60, 1.05]], lt), tt = W_('b4', 'trucks') - s15, ts = W_('b4', 'salesmen') - s15;
      EN.layers(ctx, c, [[0.3, x => { K.sky(x, ERA.industry.sky, lt); K.skyline(x, 140, '#B8A898', 6); }],
        [0.7, x => { K.plant(x, 500, 200, 1.3, lt, { sign: 'BOTTLING WORKS' }); }],
        [1, x => { P.street(x, -2600, 200, 5200, 700, { col: '#9A8A6A' }); for (let i = 0; i < 2; i++) { const u = lt - tt - i * 0.6; if (u > 0) P.truck(x, 200 - u * 520 - i * 80, 340 + i * 60, 0.9, { era: 1910, t: lt, flip: true, col: i ? '#2E5A3E' : RED }); }
          toon(x, 640, 340, 1.05, PEOPLE.worker, 'carry', 'happy', { t: lt, itemR: g => P.crate(g, 0, 40, 0.5, { n: 3 }) });
          const sx = lt > ts ? -300 - (lt - ts) * 200 : 300; toon(x, sx, 360, 1.05, PEOPLE.gent2, lt > ts ? 'walk' : 'wave', 'grin', { t: lt, flip: lt > ts, itemL: g => { rr(g, -50, -10, 100, 70, 8); ink(g, '#7A3A2A', 4); } }); }]]);
      L.plate(ctx, 'OWN TRUCKS', 600, 170, pop(lt, tt), { size: 56, bg: CREAM }); L.plate(ctx, 'OWN SALESMEN', 1320, 170, pop(lt, ts), { size: 56, bg: CREAM, rot: 0.03 });
    } },
  { name: 'town after town: bottlers on the map', t0: s16, era: 'sepia', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 300, 120, 1.6], [s17 - s16, 0, 20, 1.02]], lt), k = 26, cx = 0, cy = 40;
      const towns = ['chattanooga', 'atlanta', 'birmingham', 'nashville', 'memphis', 'louisville', 'charlotte', 'richmond', 'savannah', 'jacksonville', 'neworleans', 'stlouis', 'dallas', 'kansascity', 'chicago', 'indianapolis', 'cleveland', 'pittsburgh', 'philadelphia', 'baltimore', 'detroit', 'oklahoma', 'houston', 'sanantonio', 'omaha', 'minneapolis', 'denver', 'elpaso', 'phoenix', 'saltlake', 'losangeles', 'sanfrancisco', 'portland', 'seattle'];
      const tm = W_('b5', 'money') - s16;
      EN.layers(ctx, c, [[0.5, x => K.mapSea(x, lt)],
        [1, x => { K.usMap(x, cx, cy, k, {}); towns.forEach((n, i) => { const [px, py] = K.usPt(cx, cy, k, n), u = pop(lt, 0.2 + i * 0.12, 0.3); K.pinPlant(x, px, py, u, lt + i, 0.9); if (lt > tm && u > 0) { const b = clamp((lt - tm - i * 0.03) / 0.5); if (b > 0) { x.save(); x.globalAlpha = 1 - b; P.moneyBag(x, px, py - 70 - b * 60, 0.25); x.restore(); } } }); }]]);
      L.word(ctx, 'TOWN AFTER TOWN', 960, 150, pop(lt, 0.15), { size: 90, col: YELLOW });
      L.plate(ctx, 'THEIR OWN MONEY ON THE LINE', 960, 970, pop(lt, tm), { size: 54 });
    } },
  { name: 'the company sells syrup, the bottlers do the rest', t0: s17, era: 'sepia', out: { type: 'whip', dur: 0.3, dir: 1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -500, -40, 1.25], [1.6, -80, -40, 1.1], [s18 - s17, 280, -40, 1.1]], lt), tsy = W_('b5', 'syrup') - s17, tr = W_('b5', 'rest') - s17;
      EN.layers(ctx, c, [[0.3, x => { K.sky(x, ERA.sepia.sky, lt); K.hills(x, 120, '#B9A878', 50, 6); }],
        [1, x => { P.street(x, -2600, 200, 5200, 700, { col: '#A08A68' });
          P.storefront(x, -1500, 210, { w: 640, h: 600, col: '#B8714C', sign: 'THE COCA-COLA CO.', signCol: '#7A1E1A', signFg: CREAM, upper: 3 }); K.barrel(x, -960, 250, 0.9, 'SYRUP');
          for (let i = 0; i < 4; i++) { const u = ((lt * 0.35 + i / 4) % 1), bx = lerp(-860, 40, u); K.barrel(x, bx, 250, 0.55, 'SYRUP', u * 12); }
          K.plant(x, 300, 220, 1.0, lt, { sign: 'BOTTLER' }); P.storefront(x, 1250, 210, { w: 560, h: 540, col: '#9A6A4A', sign: 'GROCERY', awning: [YELLOW, '#5A3420'], upper: 2 });
          if (lt > tr - 0.4) { const u = lt - tr + 0.4; P.truck(x, 560 + u * 300, 360, 0.75, { era: 1910, t: lt }); }
          toon(x, 900, 360, 0.95, PEOPLE.gent2, 'wave', 'grin', { t: lt, itemL: g => { rr(g, -50, -10, 100, 70, 8); ink(g, '#7A3A2A', 4); } }); }]]);
      L.plate(ctx, 'COMPANY → SYRUP', 560, 150, pop(lt, tsy - 0.3), { size: 56, bg: RED, fg: CREAM });
      L.plate(ctx, 'BOTTLERS → EVERYTHING ELSE', 1300, 260, pop(lt, tr - 0.5), { size: 50, bg: YELLOW, rot: 0.03 });
    } },
  { name: 'success attracts copycats', t0: s18, era: 'sepia', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -120, 0.98], [s19 - s18, 0, -100, 1.08]], lt), tc = W_('b6', 'copycats') - s18;
      const rows = [['COCA-NOLA', 'KOLA-KOKA', 'KOKE-OLA', 'COKA-COLO', 'CO-CA-CO'], ['KOKO-KOLA', 'COLA-COCA', 'COCA-COLE', 'KOCA-KOLA', 'COKE-KOLA']];
      EN.layers(ctx, c, [[0.6, x => { L.wallpaper(x, -2400, -1400, 4800, 1700, '#5A6A4A', '#6A7A58'); L.planks(x, -2400, 200, 4800, 900, '#8A5A33'); }],
        [1, x => { rr(x, -1000, -700, 2000, 900, 8); ink(x, '#5A3420', 8); L.planks(x, -980, -680, 1960, 860, '#6B4123', { vertical: true, pw: 60 });
          rows.forEach((r, j) => shelfRow(x, -900, 900, -330 + j * 400, r, { u: i => pop(lt, tc - 0.6 + (i + j * 5) * 0.08, 0.3), t: lt, wob: 1, s: 1.0 }));
          rr(x, -1100, 200, 2200, 40, 8); ink(x, '#5A3420', 6); }]]);
      L.word(ctx, 'COPYCATS', 960, 140, pop(lt, tc), { size: 120, col: YELLOW });
    } },
  { name: 'almost the same name, almost the same bottle', t0: s19, era: 'sepia', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -60, 1.0], [s20 - s19, 120, -20, 1.15]], lt), tn = W_('b6', 'name') - s19, tb = W_('b6', 'bottle') - s19;
      const lab = ['KOKE-OLA', 'COCA-NOLA', 'COCA-COLA', 'KOLA-KOKA', 'COCA-COLE', 'KOCA-KOLA'];
      EN.layers(ctx, c, [[0.6, x => { L.wallpaper(x, -2400, -1400, 4800, 1700, '#5A6A4A', '#6A7A58'); L.planks(x, -2400, 200, 4800, 900, '#8A5A33'); P.shelves(x, -2000, -760, 800, 600, { rows: 4, seed: 31 }); P.shelves(x, 1200, -760, 800, 600, { rows: 4, seed: 33 }); }],
        [1, x => { rr(x, -1000, -480, 2000, 640, 8); ink(x, '#5A3420', 8); L.planks(x, -980, -460, 1960, 600, '#6B4123', { vertical: true, pw: 60 }); shelfRow(x, -880, 880, -90, lab, { t: lt, s: 1.1 });
          const look = [Math.sin(lt * 3.5) * 0.9, -0.3]; toon(x, 0, 470, 1.35, LOOKS.shopper, lt > tb ? 'shrug' : 'think', lt > tb ? 'worried' : 'think', { t: lt, look });
          for (let i = 0; i < 3; i++) { const ph = (lt * 0.8 + i / 3) % 1; x.save(); x.globalAlpha = Math.sin(ph * Math.PI); L.fitText(x, '?', -120 + i * 120, -140 - ph * 120, 80 + i * 10, YELLOW, 100, { outline: 12 }); x.restore(); } }]]);
      L.plate(ctx, 'ALMOST THE SAME NAME', 420, 960, pop(lt, tn), { size: 50 }); L.plate(ctx, 'ALMOST THE SAME BOTTLE', 1500, 960, pop(lt, tb), { size: 50, rot: 0.03 });
    } },
  { name: '1915: the bottlers want a bottle of their own', t0: s20, era: 'sepia', out: { type: 'whip', dur: 0.3, dir: 1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -60, 1.05], [s21 - s20, 0, -80, 1.18]], lt), tbang = 0.9, sh = EN.shake(lt, [tbang, tbang + 0.35], 8);
      EN.layers(ctx, { ...c, x: c.x + sh.x, y: c.y + sh.y }, [[0.6, x => { K.office(x, lt, { winX: -1400, picX: 700, bookX: 1300, wall: '#6A4A3A' }); rr(x, -520, -720, 1040, 120, 8); ink(x, CREAM, 6); L.fitText(x, "BOTTLERS' MEETING", 0, -660, 64, INK, 980); }],
        [1, x => { rr(x, -900, 120, 1800, 40, 8); ink(x, '#5A3420', 6); [[-700, PEOPLE.gent, 'fist'], [-350, PEOPLE.gent3, 'point'], [350, PEOPLE.gent2, 'arms'], [700, PEOPLE.gent, 'fist']].forEach(([px, lk, ps], i) => toon(x, px, 140, 1.05, lk, lt > tbang ? ps : 'stand', lt > tbang ? 'angry' : 'neutral', { t: lt + i, seed: i, flip: px > 0, talk: lt > tbang ? 0.5 : 0 }));
          rr(x, -900, 160, 1800, 160, 6); ink(x, '#7A4A2A', 6); for (let i = 0; i < 5; i++) P.bottle(x, -200 + i * 100, 130, 0.55, { kind: 'straight', label: ['KOKE-OLA', 'COCA-NOLA', 'KOLA-KOKA', 'COCA-COLE', 'KOCA-KOLA'][i], rot: Math.sin(lt * 30 + i) * 0.06 * (lt > tbang && lt < tbang + 0.6 ? 1 : 0) }); }]]);
      L.dateCard(ctx, '1915', 300, 160, pop(lt, W_('b7', '1915') - s20));
    } },
  { name: 'a letter to the glass makers', t0: s21, era: 'sepia', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, 0, 1.25], [s22 - s21, 0, -40, 1.38]], lt), lines = ['TO: GLASS MAKERS', 'WANTED: A BOTTLE YOU CAN', 'RECOGNIZE IN THE DARK...', '...OR EVEN BROKEN.'], typ = clamp(lt / (s23 - s21 - 0.2)) * 4;
      EN.layers(ctx, c, [[0.6, x => { L.planks(x, -2400, -1400, 4800, 2800, '#6B4123', { pw: 70 }); K.lamp(x, -760, -60, 1.4); }],
        [1, x => { K.doc(x, 0, -140, 760, 520, { lines: 0, rot: 0, draw: g => { lines.forEach((s, i) => { const n = Math.floor(clamp(typ - i) * s.length); if (n > 0) L.fitText(g, s.slice(0, n), -330, -170 + i * 90, 44, INK, 700, { font: L.F.type, align: 'left' }); }); } });
          typewriter(x, 0, 330, 1.7, lt, typ < 4); }]]);
    } },
  { name: 'lights out: find it in the dark', t0: s22, era: 'tense', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -60, 1.15], [s23 - s22, 0, -80, 1.3]], lt), td = tDark - s22, dark = clamp((lt - td + 0.1) / 0.12), reach = clamp((lt - td - 0.1) / 0.6);
      EN.layers(ctx, c, [[0.6, x => { L.wallpaper(x, -2400, -1400, 4800, 1700, '#5A6A4A', '#6A7A58'); L.planks(x, -2400, 200, 4800, 900, '#8A5A33'); x.beginPath(); x.moveTo(0, -1400); x.lineTo(0, -560); ink(x, null, 4); ell(x, 0, -540, 60, 34); ink(x, dark < 1 ? '#F7D27A' : '#4A4A40', 5); if (dark < 1) L.glow(x, 0, -500, 500, '#FFD58A', 0.5 * (1 - dark)); }],
        [1, x => { rr(x, -900, 100, 1800, 40, 8); ink(x, '#5A3420', 6); rr(x, -860, 140, 1720, 200, 6); ink(x, '#7A4A2A', 6); for (let i = 0; i < 7; i++) { if (i === 4) continue; P.bottle(x, -600 + i * 200, 100, 0.95, { kind: 'straight', label: '' }); }
          x.save(); x.translate(200, 100); P.bottle(x, 0, 0, 0.95, { kind: 'contour', label: '' }); x.restore(); }]]);
      if (dark > 0) { ctx.save(); ctx.globalAlpha = 0.93 * dark; ctx.fillStyle = '#05060C'; ctx.fillRect(0, 0, W, H); ctx.restore();
        const bx = 960 + 200 * 1.3, by = 540 + 180; ctx.save(); ctx.translate(bx, by); ctx.scale(1.25, 1.25); ctx.globalAlpha = 0.25 + reach * 0.75; ctx.shadowColor = '#FFE7A0'; ctx.shadowBlur = 30 * reach; P.bottle(ctx, 0, 0, 0.95, { kind: 'contour', label: '', fill: 0 }); ctx.restore();
        K.arm(ctx, lerp(2300, bx + 70, E.out(reach)), by - 120, Math.PI, 900, {}); if (reach >= 1) P.sparkles(ctx, bx, by - 120, 160, lt, 6, '#FFE7A0'); }
      L.word(ctx, 'IN THE DARK', 960, 150, pop(lt, td + 0.2), { size: 90, col: CREAM });
    } },
  { name: 'or even broken on the ground', t0: s23, era: 'sepia', out: { type: 'whip', dur: 0.3, dir: 1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 100, 200, 1.7], [s24 - s23, 0, 100, 1.3]], lt), tb = W_('b7', 'broken') - s23, u = clamp((lt - tb + 0.1) / 0.3);
      EN.layers(ctx, c, [[0.6, x => { L.bricks(x, -2400, -1400, 4800, 1600, '#A65A44', { bw: 60, bh: 24 }); }],
        [1, x => { P.street(x, -2600, 200, 5200, 900, { col: '#8C7458' }); brokenBottle(x, 60, 360, 2.1, u, lt); if (u > 0 && u < 1) P.burst(x, 0, 300, 260, u, CREAM);
          toon(x, -620, 330, 1.05, PEOPLE.worker, lt > tb + 0.3 ? 'point' : 'stand', lt > tb + 0.3 ? 'grin' : 'neutral', { t: lt, look: [0.7, 0.6] }); }]]);
      L.word(ctx, 'STILL RECOGNIZABLE', 960, 150, pop(lt, tb + 0.4), { size: 80, col: YELLOW });
    } },
  { name: 'Terre Haute, Indiana: a glass company', t0: s24, era: 'industry', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -200, -100, 1.15], [s25 - s24, 120, -120, 1.05]], lt);
      EN.layers(ctx, c, [[0.6, x => { L.bricks(x, -2400, -1400, 4800, 1600, '#7E4634', { bw: 64, bh: 26 }); for (let i = 0; i < 5; i++) { rr(x, -1700 + i * 760, -900, 300, 360, 8); ink(x, '#C9D8DC', 6); } L.planks(x, -2400, 200, 4800, 900, '#6E6458'); glassFurnace(x, -300, 230, 1.2, lt);
          for (let r = 0; r < 3; r++) { rr(x, 520, -420 + r * 180, 760, 14, 4); ink(x, '#8A8F96', 4); for (let i = 0; i < 9; i++) P.bottle(x, 560 + i * 82, -422 + r * 180, 0.42, { kind: 'straight', label: '', fill: 0, open: true }); } }],
        [1, x => { toon(x, 260, 340, 1.1, PEOPLE.worker2, { la: [1.0, -0.6], ra: [1.3, -0.3] }, 'determined', { t: lt }); x.beginPath(); x.moveTo(330, 120); x.lineTo(-60, 40); ink(x, '#2A2628', 10); const gl = 0.8 + Math.sin(lt * 9) * 0.2; x.beginPath(); x.arc(-80, 34 + Math.sin(lt * 3) * 4, 34, 0, 6.27); ink(x, `rgb(255,${Math.round(170 * gl)},60)`, 4); L.glow(x, -80, 34, 140, '#FFB060', 0.5);
          toon(x, 860, 340, 1.05, PEOPLE.worker, 'carry', 'happy', { t: lt + 2, itemR: g => P.crate(g, 0, 40, 0.5, { n: 3, bottles: true }) }); }],
        [1.3, x => { K.barrel(x, -1150, 640, 1.3, 'SAND'); }]]);
      L.plate(ctx, 'TERRE HAUTE, INDIANA', 960, 960, pop(lt, W_('b7', 'terre') - s24), { size: 64, bg: YELLOW }); L.word(ctx, 'GLASS COMPANY', 960, 140, pop(lt, 0.1), { size: 80, col: CREAM });
    } },
  { name: 'came back with a curvy design', t0: s25, era: 'industry', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -60, 1.08], [s26 - s25, 60, -60, 1.22]], lt), tc = W_('b7', 'curvy') - s25, d = clamp((lt - 0.2) / (tc + 0.2));
      EN.layers(ctx, c, [[0.6, x => { L.bricks(x, -2400, -1400, 4800, 1600, '#7E4634', { bw: 64, bh: 26 }); L.planks(x, -2400, 200, 4800, 900, '#6E6458'); rr(x, -1500, -700, 300, 360, 8); ink(x, '#C9D8DC', 6); }],
        [1, x => { x.save(); x.translate(160, -120); x.rotate(-0.08); rr(x, -340, -320, 680, 560, 10); ink(x, '#7A4A2A', 7); rr(x, -310, -290, 620, 500, 4); ink(x, '#DCE8F0', 4);
            x.save(); x.strokeStyle = 'rgba(47,109,181,0.25)'; x.lineWidth = 2; for (let i = -6; i <= 6; i++) { x.beginPath(); x.moveTo(i * 50, -290); x.lineTo(i * 50, 210); x.stroke(); x.beginPath(); x.moveTo(-310, i * 40 - 40); x.lineTo(310, i * 40 - 40); x.stroke(); } x.restore();
            x.save(); rr(x, -310, 200 - 500 * d, 620, 500 * d + 10, 4); x.clip(); P.bottle(x, 0, 180, 1.85, { kind: 'contour', label: '', fill: 0, open: true }); x.restore(); x.restore();
          rr(x, 140, 230, 40, 130, 6); ink(x, '#5A3420', 4); rr(x, -100, 330, 520, 30, 6); ink(x, '#5A3420', 4);
          toon(x, -460, 300, 1.15, PEOPLE.chemist, lt > tc ? 'present' : 'think', lt > tc ? 'grin' : 'think', { t: lt }); }]]);
      L.word(ctx, 'CURVY!', 1560, 300, pop(lt, tc), { size: 100, col: YELLOW, rot: 0.1 });
    } },
  { name: 'the contour bottle: spotlight', t0: s26, era: 'gaslight', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -40, 1.0], [TL.T - s26, 0, -60, 1.1]], lt), tr = W_('b7', 'contour') - s26, u = pop(lt, 0.05, 0.5);
      EN.layers(ctx, c, [[0.5, x => { L.stripes(x, -2400, -1400, 4800, 1700, '#5A1E1E', '#4A1818', 80); L.planks(x, -2400, 260, 4800, 900, '#5A3420'); }],
        [1, x => { x.fillStyle = 'rgba(5,6,12,0.5)'; x.fillRect(-2400, -1400, 4800, 2800); K.spotlight(x, 0, -900, 330, 330, 0.55 * u); K.pedestal(x, 0, 330, 1.1, '1915');
          x.save(); x.translate(0, -30); const k = 0.4 + E.back(u, 1.6) * 0.95; x.scale(k, k); x.rotate(Math.sin(lt * 1.5) * 0.03); P.bottle(x, 0, 0, 1.1, { kind: 'contour' }); x.restore(); P.sparkles(x, 0, -200, 230, lt, 9);
          P.crowd(x, -1100, -500, 560, 0.9, 3, lt, { react: 'cheer', seed: 41, hats: ['bowler', 'boater'] }); P.crowd(x, 500, 1100, 560, 0.9, 3, lt, { react: 'cheer', seed: 47, hats: ['bowler', null] }); }]]);
      L.word(ctx, 'THE CONTOUR BOTTLE', 960, 100, pop(lt, tr - 0.1), { size: 80, col: YELLOW });
    } },
];
EN.run({ module, dir: __dirname, TL, scenes, card: { n: 'CHAPTER 3', title: 'The One-Dollar Deal', sub: '1899–1915', era: 'sepia' },
  cues: () => [['engine', 0.5, 0.35], ['horn', 2.75, 0.45], ['whoosh', s2 - 0.12, 0.5], ['whoosh', s3 - 0.12, 0.5], ['steps', s3 + 0.2, 0.4], ['tap', s4 - 0.3, 0.7], ['tap', s4 - 0.1, 0.7], ['ding', at('b1', 'idea'), 0.6],
    ['whoosh', s5 - 0.12, 0.5], ['clink', at('b1', 'bottles'), 0.7], ['wah', s6 + 0.3, 0.4], ['pop', at('b2', 'messy') - 0.5, 0.8], ['fizz', at('b2', 'messy') - 0.45, 0.9], ['splash', at('b2', 'messy') - 0.1, 0.5], ['whoosh', s7 - 0.12, 0.5], ['sparkle', s7 + 0.3, 0.5],
    ['stamp', at('b2', 'fine'), 0.8], ['whoosh', s9 - 0.12, 0.5], ['scratch', s9 + 0.5, 0.4], ['whoosh', s10 - 0.12, 0.5], ['kaching', at('b3', 'dollar'), 0.7], ['tear', s11, 0.5], ['wind', s11 + 0.3, 0.4], ['tick', s11 + 1.3, 0.4], ['tick', s11 + 2.0, 0.4],
    ['whoosh', s12 - 0.12, 0.5], ['rise', s12 + 0.2, 0.5], ['whoosh', s13 - 0.12, 0.5], ['boing', at('b4', "didn't"), 0.4], ['whoosh', s14 - 0.12, 0.5], ['coins', at('b4', 'paid') + 0.4, 0.6], ['pop', at('b4', 'plants'), 0.6],
    ['whoosh', s15 - 0.12, 0.5], ['engine', at('b4', 'trucks'), 0.4], ['horn', at('b4', 'trucks') + 0.3, 0.35], ['whoosh', s16 - 0.12, 0.5], ...Array.from({ length: 8 }, (_, i) => ['blip', s16 + 0.2 + i * 0.48, 0.35]), ['coins', at('b5', 'money'), 0.5],
    ['whoosh', s17 - 0.12, 0.5], ['clank', at('b5', 'syrup'), 0.5], ['engine', at('b5', 'rest') - 0.4, 0.35], ['pop', at('b6', 'copycats') - 0.6, 0.5], ['pop', at('b6', 'copycats') - 0.2, 0.5], ['pop', at('b6', 'copycats') + 0.2, 0.5], ['whoosh', s19 - 0.12, 0.5], ['boop', at('b6', 'name'), 0.4], ['boop', at('b6', 'bottle'), 0.4],
    ['whoosh', s20 - 0.12, 0.5], ['thump', s20 + 0.9, 0.7], ['thump', s20 + 1.25, 0.7], ['whoosh', s21 - 0.12, 0.5], ['typewriter', s21 + 0.1, 0.5], ['click', tDark, 0.8], ['sparkle', tDark + 0.7, 0.5],
    ['snap', at('b7', 'broken'), 0.8], ['whoosh', s24 - 0.12, 0.5], ['factory', s24 + 0.2, 0.3], ['scratch', s25 + 0.2, 0.4], ['drumroll', s26 - 0.6, 0.4], ['cymbal', at('b7', 'contour'), 0.6], ['crowdcheer', at('b7', 'contour') + 0.2, 0.5]],
  music: [[0, 'ragtime'], [s11, 'light'], [s12, 'build'], [s16, 'up'], [s18, 'ragminor'], [s22, 'tension'], [s24, 'build'], [s26, 'up']] });
