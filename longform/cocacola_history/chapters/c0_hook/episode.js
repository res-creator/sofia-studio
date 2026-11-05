// Chapter 0 — cold open: 2.2 billion servings a day vs. nine glasses a day in 1886; three teasers ($1 deal, New Coke, war plants); the question.
// Reference chapter for the long-form kit (longform/kit): scenes with parallax layers + camera keys, cuts on stressed words, plates for numbers.
const L = require('../../../kit/look'), P = require('../../../kit/props'), { toon, LOOKS } = require('../../../kit/toon'), EN = require('../../../kit/engine');
const { W, H, INK, CREAM, RED, YELLOW, BLUE, ERA, ink, rr, ell, poly, clamp, lerp, seg, E } = L;
const TL = EN.timeline(__dirname, { start: 0.25, gap: 0.5 }), at = TL.at, end = TL.end, begin = TL.begin;
const pop = (t, t0, d = 0.35) => clamp((t - t0) / d);

// ---------- local sets ----------
function cafeStreet(ctx, t) { // modern street corner (wide): sky, glass towers far, shopfronts mid, sidewalk
  L.skyGrad(ctx, -1400, -900, 2800, 1100, ERA.modern.sky); L.cloud(ctx, -600 + t * 6, -520, 1.2); L.cloud(ctx, 500 + t * 4, -600, 0.9); }
function towers(ctx) { for (let i = 0; i < 9; i++) { const x = -1300 + i * 300, h = 500 + L.hash(i * 3) * 380; rr(ctx, x, 200 - h, 220, h, 6); ink(ctx, ['#9CC3E0', '#B9D4E8', '#86AFCF'][i % 3], 5); for (let r = 0; r < h / 60 - 1; r++) for (let c = 0; c < 3; c++) { rr(ctx, x + 20 + c * 66, 200 - h + 30 + r * 60, 46, 34, 4); ink(ctx, '#E3F1FA', 2.5); } } }
function sidewalk(ctx) { ctx.fillStyle = '#CFC8BC'; ctx.fillRect(-1500, 200, 3000, 600); for (let i = 0; i < 20; i++) { ctx.beginPath(); ctx.moveTo(-1500 + i * 160, 200); ctx.lineTo(-1560 + i * 160, 800); ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 3; ctx.stroke(); } ctx.fillStyle = '#9A958C'; ctx.fillRect(-1500, 190, 3000, 14); }
function globe(ctx, x, y, r, t) { ctx.save(); ctx.translate(x, y); ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.27); ink(ctx, '#3F8FD8', 7); ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.27); ctx.clip();
  const lands = [[-0.5, -0.35, 0.32, 0.22], [-0.35, 0.25, 0.18, 0.3], [0.15, -0.3, 0.38, 0.2], [0.2, 0.15, 0.2, 0.28], [0.6, 0.35, 0.18, 0.12], [-0.85, -0.05, 0.12, 0.2]];
  for (const [lx, ly, rx, ry] of lands) { const xx = ((lx + t * 0.04 + 1.5) % 2 - 1) * r; ell(ctx, xx, ly * r, rx * r, ry * r, 0.3); ink(ctx, '#7CC36A', 5); }
  ctx.globalAlpha = 0.25; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(r * 0.35, r * 0.2, r * 1.05, 0, 6.27); ctx.fill(); ctx.restore(); ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.27); ink(ctx, null, 7); ctx.restore(); }
function pharmacyInterior(ctx, t) { const P0 = ERA.gaslight; L.wallpaper(ctx, -1400, -800, 2800, 1000, '#7A3F2E', '#8E4E38'); P.shelves(ctx, -1100, -620, 900, 560, { rows: 4, seed: 2 }); P.shelves(ctx, 250, -620, 900, 560, { rows: 4, seed: 9 });
  for (const lx of [-600, 600]) { ctx.beginPath(); ctx.moveTo(lx, -800); ctx.lineTo(lx, -560); ink(ctx, null, 4); ell(ctx, lx, -540, 40, 26); ink(ctx, '#F7D27A', 5); L.glow(ctx, lx, -530, 260, '#FFD58A', 0.35); }
  L.planks(ctx, -1400, 200, 2800, 600, P0.floor); }

// ---------- scenes ----------
const tA = 0, tB = at('h1', 'and'), tB2 = at('h1', 'and', 1), tC = at('h1', 'every'), tD = begin('h2') - 0.25, tD2 = at('h2', 'in', 1) - 0.1,
  tE = begin('h3') - 0.2, tF = at('h3', 'changed') - 0.12, tG = at('h3', 'shipped') - 0.12, tH = begin('h4') - 0.25, tI = at('h4', 'it') - 0.12;
const scenes = [
  { name: 'pop: a bottle opens (frame 0)', t0: tA, era: 'modern', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -60, -110, 1.6], [1.2, -40, -60, 1.3], [3.2, 0, -40, 1.12]], lt);
      EN.layers(ctx, c, [[0.3, x => cafeStreet(x, lt)], [0.5, towers], [0.85, x => { P.storefront(x, -1250, 210, { w: 520, h: 560, col: '#E9E3D6', brick: false, sign: 'CAFÉ', signCol: '#2F6DB5', signFg: CREAM, awning: ['#2F6DB5', CREAM], upper: 2 }); P.storefront(x, 480, 210, { w: 560, h: 600, col: '#C96A4B', sign: 'BOOKS', awning: [YELLOW, CREAM] }); }],
        [1, x => { sidewalk(x); rr(x, -330, 40, 660, 24, 8); ink(x, '#E9E3D6', 5); rr(x, -18, 64, 36, 150, 6); ink(x, '#B8B2A8', 4);
          toon(x, -330, 300, 1.15, LOOKS.woman, lt < 0.9 ? 'hold' : 'cheer', lt < 0.6 ? 'think' : 'laugh', { t: lt });
          const pu = clamp((lt - 0.35) / 0.3); P.bottle(x, 0, 40, 1.15, { kind: 'contour', open: pu > 0.5, rot: Math.sin(lt * 20) * 0.05 * (1 - pu) });
          if (pu > 0.5) { x.save(); x.translate(18, -230); x.rotate(-pu * 6); rr(x, -15, -8, 30, 16, 4); ink(x, '#D8B04A', 4); x.restore(); }
          P.burst(x, 0, -230, 180, clamp((lt - 0.38) / 0.5), CREAM); for (let i = 0; i < 12; i++) { const ph = clamp((lt - 0.45 - i * 0.04) / 0.8); if (ph > 0 && ph < 1) { x.beginPath(); x.arc(Math.sin(i * 2.1) * 90 * ph, -240 - ph * 260, 9 * (1 - ph) + 2, 0, 6.27); ink(x, 'rgba(255,248,235,0.9)', 3); } } }]]);
      L.word(ctx, 'RIGHT NOW', 960, 160, pop(lt, 0.05), { size: 96, col: CREAM });
    } },
  { name: 'and someone else: office', t0: tB, era: 'modern', out: { type: 'whip', dur: 0.28, dir: 1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -80, -60, 1.25], [2, 40, -40, 1.12]], lt);
      EN.layers(ctx, c, [[0.6, x => { L.wallpaper(x, -1400, -900, 2800, 1100, '#DDE6EE', '#CCD8E2', 60); rr(x, -700, -560, 560, 360, 10); ink(x, '#9CC7E8', 6); x.beginPath(); x.moveTo(-420, -560); x.lineTo(-420, -200); x.moveTo(-700, -380); x.lineTo(-140, -380); ink(x, null, 5); P.clock(x, 420, -470, 70, lt * 3, { rim: '#4A4F5C' }); }],
        [1, x => { L.planks(x, -1400, 200, 2800, 600, '#B9A88E'); rr(x, -380, 0, 760, 40, 8); ink(x, '#8A6A4A', 5); rr(x, -340, 40, 30, 170, 6); ink(x, '#6A4A2A', 4); rr(x, 310, 40, 30, 170, 6); ink(x, '#6A4A2A', 4);
          rr(x, -260, -190, 300, 190, 10); ink(x, '#2A2E36', 5); rr(x, -245, -175, 270, 150, 6); ink(x, '#7FB2E5', 3);
          toon(x, 260, 300, 1.05, LOOKS.exec80s, lt < 0.5 ? 'stand' : 'drink', 'happy', { t: lt, itemR: g => { g.rotate(2.8); P.bottle(g, 0, 40, 0.42, { open: true, fill: 0.7 }); } }); }]]);
    } },
  { name: 'and someone else: stadium', t0: tB2, era: 'pop', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -40, 1.0], [2, 0, -10, 1.06]], lt);
      EN.layers(ctx, c, [[0.4, x => { L.skyGrad(x, -1400, -900, 2800, 1000, ['#FF9A5A', '#FFD58A']); for (let r = 0; r < 4; r++) P.crowd(x, -1300, 1300, -260 + r * 110, 0.32, 22, lt + r, { react: 'cheer', seed: r * 9 }); }],
        [1, x => { rr(x, -1400, 120, 2800, 700, 0); ink(x, '#3E8E4A', 0); rr(x, -1400, 100, 2800, 40, 0); ink(x, '#E9E3D6', 5);
          toon(x, -120, 330, 1.1, LOOKS.kid, 'cheer', 'laugh', { t: lt, itemR: g => P.bottle(g, 0, 20, 0.38, { open: true }) }); toon(x, 240, 330, 1.1, LOOKS.shopper, 'drink', 'grin', { t: lt, itemR: g => { g.rotate(2.6); P.bottle(g, 0, 40, 0.42, { open: true, fill: 0.5 }); } }); }]]);
      L.word(ctx, 'AND SOMEONE ELSE', 960, 150, pop(lt, 0.05), { size: 84, col: CREAM });
    } },
  { name: 'the planet: 2.2 billion a day', t0: tC, era: 'pop', out: { type: 'whip', dur: 0.35, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, 0, 1.6], [2.5, 0, 40, 1.0], [7, 0, 40, 0.94]], lt);
      EN.layers(ctx, c, [[0.2, x => { L.skyGrad(x, -1600, -1000, 3200, 2000, ['#0E1A3A', '#22305E']); for (let i = 0; i < 90; i++) { x.beginPath(); x.arc(-1500 + L.hash(i) * 3000, -900 + L.hash(i * 2.3) * 1800, 2 + L.hash(i * 5) * 3, 0, 6.27); x.fillStyle = '#F6EBD3'; x.fill(); } }],
        [1, x => { globe(x, 0, 60, 330, lt); for (let i = 0; i < 46; i++) { const a = L.hash(i * 1.7) * 6.28, rr2 = 340 + L.hash(i * 3.9) * 60, ph = ((lt * 0.8 + L.hash(i * 7.3)) % 1); const k = Math.sin(ph * Math.PI);
            if (k > 0.1) { x.save(); x.translate(Math.cos(a) * rr2, 60 + Math.sin(a) * rr2 * 0.9); x.rotate(a + Math.PI / 2); x.scale(k, k); P.bottle(x, 0, 0, 0.22, { label: '' }); x.restore(); } } }]]);
      L.plate(ctx, '2.2 BILLION', 960, 860, pop(lt, at('h1', 'two') - tC), { size: 110, bg: RED, fg: CREAM });
      L.plate(ctx, 'SERVINGS EVERY DAY', 960, 980, pop(lt, at('h1', 'servings') - tC), { size: 50 });
    } },
  { name: '1886: nine glasses a day', t0: tD, era: 'gaslight', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -80, 1.25], [4, 0, -40, 1.1]], lt);
      const n9 = Math.min(9, Math.floor(clamp((lt - (at('h2', 'nine') - tD) + 0.2) / 1.2) * 9));
      EN.layers(ctx, c, [[0.6, x => pharmacyInterior(x, lt)], [1, x => {
          toon(x, 60, 150, 1.3, LOOKS.pemberton, n9 > 0 ? 'present' : 'stand', n9 >= 9 ? 'happy' : 'neutral', { t: lt }); P.fountain(x, 0, 200, 0.7, { w: 1800, taps: 3 });
          for (let i = 0; i < 9; i++) { const u = clamp((n9 - i)); if (u > 0) P.glassCup(x, -600 + i * 66, 22, 0.55, { fill: 0.8, fizz: lt }); } }]]);
      L.dateCard(ctx, '1886', 300, 170, pop(lt, at('h2', '1886') - tD));
      L.plate(ctx, `${n9} GLASSES A DAY`, 1460, 170, n9 > 0 ? 1 : 0, { size: 60 });
    } },
  { name: 'reveal: in a pharmacy', t0: tD2, era: 'gaslight', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 120, -120, 1.5], [1.4, 0, -180, 0.85]], lt);
      EN.layers(ctx, c, [[0.3, x => { L.skyGrad(x, -1600, -1000, 3200, 1000, ERA.gaslight.sky); }], [1, x => { P.street(x, -1600, 200, 3200, 600, { col: '#8C7458' });
          P.storefront(x, -1500, 210, { w: 620, h: 560, col: '#A65A3E', sign: 'DRY GOODS', awning: ['#2E5A3E', CREAM], night: true });
          P.storefront(x, -330, 210, { w: 660, h: 640, col: '#B8714C', sign: 'PHARMACY', signCol: '#3A1E14', awning: [RED, CREAM], night: true, display: (g, dx, dy, dw, dh) => { for (let i = 0; i < 4; i++) P.jug(g, dx + 60 + i * 80, dy + dh - 10, 0.35); } });
          P.storefront(x, 880, 210, { w: 560, h: 520, col: '#8E5A3E', sign: 'HATS', awning: [YELLOW, '#5A3420'], night: true }); P.lamppost(x, -420, 220, 1, true); P.lamppost(x, 820, 220, 1, true); }]]);
      L.word(ctx, 'IN A PHARMACY', 960, 160, pop(lt, at('h2', 'pharmacy') - tD2), { size: 92, col: YELLOW });
    } },
  { name: '$1 handshake', t0: tE, era: 'sepia', out: { type: 'whip', dur: 0.3, dir: 1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -20, 1.45], [4, 0, -10, 1.3]], lt), u = pop(lt, at('h3', 'dollar') - tE, 0.5);
      EN.layers(ctx, c, [[0.6, x => { L.wallpaper(x, -1400, -900, 2800, 1100, '#5E6B4E', '#6E7B5C'); rr(x, -260, -620, 520, 330, 10); ink(x, '#C9A777', 6); rr(x, -230, -590, 460, 270, 6); ink(x, '#E9DCC0', 4); L.fitText(x, 'CONTRACT', 0, -540, 44, INK, 400, { font: L.F.type }); }],
        [1, x => { L.planks(x, -1400, 200, 2800, 600, '#7A5A3A'); toon(x, -230, 300, 1.15, LOOKS.candler, 'present', 'smug', { t: lt }); toon(x, 230, 300, 1.15, LOOKS.lawyerA, 'present', 'happy', { t: lt, flip: true });
          x.save(); x.translate(0, -170 - u * 120); x.rotate(Math.sin(lt * 3) * 0.2); x.scale(1 + u * 0.5, 1 + u * 0.5); P.bills(x, 0, 0, 0.8, 1); x.restore(); P.sparkles(x, 0, -300, 140, lt, 6); }]]);
      L.plate(ctx, '$1', 960, 160, u, { size: 130, bg: YELLOW });
    } },
  { name: 'angry country', t0: tF, era: 'tense', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -40, 1.0], [3, 0, -60, 1.12]], lt), sh = EN.shake(lt, [0.3, 1.1, 1.9], 8);
      EN.layers(ctx, { ...c, x: c.x + sh.x, y: c.y + sh.y }, [[0.5, x => { L.skyGrad(x, -1400, -900, 2800, 1100, ERA.tense.sky); towers(x); }],
        [1, x => { x.fillStyle = '#4A4F5C'; x.fillRect(-1500, 200, 3000, 700); rr(x, -240, -60, 480, 260, 10); ink(x, '#8A5A33', 6); toon(x, 0, -60, 1.05, LOOKS.exec80s, 'shock', 'worried', { t: lt });
          for (const [px, txt] of [[-700, 'BRING IT BACK!'], [650, 'WE WANT THE OLD ONE']]) { x.save(); x.translate(px, -260 + Math.sin(lt * 9 + px) * 10); x.rotate(Math.sin(lt * 5 + px) * 0.08); P.poster(x, 0, 0, 520, 200, { title: txt, bg: CREAM }); rr(x, -8, 80, 16, 220, 4); ink(x, '#8A5A33', 4); x.restore(); }
          P.crowd(x, -1150, 1150, 420, 0.95, 9, lt, { react: 'angry', seed: 4 }); }]]);
      L.dateCard(ctx, '1985', 1700, 140, pop(lt, 0.1), { bg: RED });
    } },
  { name: 'bottling plants to war', t0: tG, era: 'war', out: { type: 'whip', dur: 0.3, dir: 1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -200, -40, 1.05], [4, 120, -40, 1.12]], lt);
      EN.layers(ctx, c, [[0.3, x => { L.skyGrad(x, -1600, -900, 3200, 1100, ERA.war.sky); L.cloud(x, -500, -520, 1.4, '#E9E6DA'); L.cloud(x, 700, -600, 1.1, '#E9E6DA'); }],
        [0.7, x => { x.fillStyle = '#5E7C8E'; x.fillRect(-1600, 80, 3200, 900); for (let i = 0; i < 18; i++) { x.beginPath(); x.moveTo(-1600 + i * 190 + Math.sin(lt * 2 + i) * 20, 120 + (i % 3) * 60); x.lineTo(-1520 + i * 190 + Math.sin(lt * 2 + i) * 20, 120 + (i % 3) * 60); x.strokeStyle = '#8FB0C2'; x.lineWidth = 5; x.stroke(); } }],
        [1, x => { const bx = -300 + lt * 40, by = 140 + Math.sin(lt * 1.6) * 8; x.save(); x.translate(bx, by); x.rotate(Math.sin(lt * 1.6) * 0.015);
          poly(x, [[-700, -60], [620, -60], [520, 90], [-640, 90]]); ink(x, '#6E7650', 6); rr(x, -500, -150, 300, 90, 6); ink(x, '#8A9068', 5); rr(x, -460, -260, 70, 110, 4); ink(x, '#5E6640', 5);
          rr(x, -60, -330, 520, 270, 8); ink(x, '#C8954F', 6); L.planks(x, -54, -324, 508, 258, '#C8954F', { pw: 28 }); rr(x, -60, -330, 520, 270, 8); ink(x, null, 6); L.fitText(x, 'BOTTLING PLANT', 200, -250, 46, '#7A2E1E', 480); L.fitText(x, 'THIS SIDE UP ↑', 200, -170, 30, '#7A2E1E', 480, { font: L.F.type });
          toon(x, -330, -150, 0.7, LOOKS.soldier, 'wave', 'happy', { t: lt }); toon(x, -200, -60, 0.7, LOOKS.soldier, 'hold', 'grin', { t: lt + 1, itemR: g => P.bottle(g, 0, 10, 0.35, { open: true }) }); x.restore(); }]]);
      L.word(ctx, 'TO A WORLD WAR', 960, 150, pop(lt, at('h3', 'world') - tG), { size: 88, col: CREAM });
    } },
  { name: 'nine glasses vs the planet', t0: tH, era: 'pop', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, 0, 1.0], [5, 0, -20, 1.06]], lt), u = pop(lt, at('h4', 'planet') - tH, 0.6);
      EN.layers(ctx, c, [[0.3, x => { L.skyGrad(x, -1600, -1000, 3200, 2000, ['#0E1A3A', '#2B3B70']); }], [1, x => { globe(x, 380, 80, 330 + u * 20, lt);
          x.save(); x.translate(380, -250 - (1 - u) * 600); x.rotate(0.05); P.bottle(x, 0, 0, 1.0 * u + 0.01, { kind: 'contour' }); x.restore(); P.burst(x, 380, -250, 200, clamp((lt - (at('h4', 'planet') - tH) - 0.3) / 0.5));
          P.glassCup(x, -520, 260, 0.9, { fill: 0.8, fizz: lt }); L.fitText(x, '9 A DAY', -520, 330, 52, CREAM, 300); }]]);
      L.word(ctx, '?', 960, 200, pop(lt, at('h4', 'planet') - tH + 0.3), { size: 200, col: YELLOW });
    } },
  { name: 'a wounded soldier and a jug of syrup', t0: tI, era: 'gaslight', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -300, -120, 1.1], [5, 100, -120, 1.15]], lt);
      EN.layers(ctx, c, [[0.3, x => { L.skyGrad(x, -1700, -1000, 3400, 1100, ['#2E2440', '#C86A4A']); L.glow(x, 300, 60, 600, '#FFB070', 0.4); }],
        [0.6, x => { for (let i = 0; i < 8; i++) { const h = 300 + L.hash(i * 4) * 260; rr(x, -1700 + i * 420, 300 - h, 380, h + 200, 4); ink(x, '#3A2638', 0); } }],
        [1, x => { P.street(x, -1700, 200, 3400, 600, { col: '#5A4638', curb: '#7A6A58' }); P.lamppost(x, -700, 220, 1, true); P.lamppost(x, 700, 220, 1, true);
          toon(x, -350 + lt * 95, 330, 1.1, LOOKS.pemberton, 'walk', 'determined', { t: lt, itemR: g => P.jug(g, 0, 70, 0.55) }); }]]);
      ctx.save(); ctx.globalAlpha = clamp((lt - 1.2) / 0.6); rr(ctx, 360, 840, 1200, 150, 18); ink(ctx, 'rgba(28,26,31,0.82)', 0); L.fitText(ctx, 'HOW COCA-COLA TOOK OVER THE WORLD', 960, 915, 66, CREAM, 1140); ctx.restore();
    } },
];
EN.run({ module, dir: __dirname, TL, scenes, card: null,
  cues: () => [['pop', 0.0, 1.6], ['fizz', 0.38, 1.0], ['whoosh', tB - 0.15, 0.6], ['clink', tB + 0.6, 0.6], ['whoosh', tB2 - 0.15, 0.6], ['crowdcheer', tB2, 0.7], ['whoosh', tC - 0.15, 0.6], ['sparkle', tC + 0.5, 0.6], ['stamp', at('h1', 'two'), 0.8],
    ['tape', tD, 0.7], ['tick', at('h2', 'nine'), 0.5], ['tick', at('h2', 'nine') + 0.15, 0.5], ['tick', at('h2', 'nine') + 0.3, 0.5], ['whoosh', tD2, 0.5], ['ding', at('h2', 'pharmacy'), 0.6],
    ['kaching', at('h3', 'dollar'), 0.7], ['crowdboo', tF + 0.1, 0.8], ['horn', tG + 0.2, 0.6], ['boom', at('h4', 'planet') + 0.3, 0.6], ['steps', tI + 0.2, 0.5]],
  music: [[0, 'up'], [tD, 'gaslight'], [tF, 'tension'], [tG, 'march'], [tH, 'build']] });
