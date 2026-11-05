// Chapter 5 — "The Rival" (1898–1985): Pepsi born in North Carolina, bankrupt twice, Coke passes on buying it, 12 oz for a nickel in the Depression,
// the 1971 hilltop song, the 1975 Pepsi Challenge, and the dangerous question. Running gag: the two drinks as cartoon boxers (ROUND 1/2/3) and racers.
const L = require('../../../kit/look'), P = require('../../../kit/props'), { toon, LOOKS } = require('../../../kit/toon'), EN = require('../../../kit/engine');
const K = require('./pepsikit');
const { W, H, INK, CREAM, RED, YELLOW, BLUE, ERA, ink, rr, ell, poly, clamp, lerp, seg, E, hash, fitText } = L;
const TL = EN.timeline(__dirname, { start: 3.0, gap: 0.55, gaps: { r3b: 0.8, r4: 0.7, r5: 0.8 } }), at = TL.at, begin = TL.begin, end = TL.end;
const pop = (t, t0, d = 0.35) => clamp((t - t0) / d);
const PB = K.PBLUE;
const rel = (t0, id, w, n = 0) => at(id, w, n) - t0;
const grass = (x, y = 200, col = '#9CBF6A') => { x.fillStyle = col; x.fillRect(-2400, y, 4800, 1100); for (let i = 0; i < 90; i++) { const gx = -2300 + hash(i) * 4600, gy = y + 30 + hash(i * 3) * 700; x.beginPath(); x.moveTo(gx, gy); x.lineTo(gx + 6, gy - 22); x.moveTo(gx + 10, gy); x.lineTo(gx + 18, gy - 18); x.lineWidth = 4; x.strokeStyle = '#7A9E4E'; x.stroke(); } };
const counterTop = (x, y = 200) => { L.planks(x, -2400, y, 4800, 1100, '#8A5A33'); rr(x, -2400, y - 30, 4800, 50, 6); ink(x, '#5A3420', 6); };
const shopWall = x => { L.wallpaper(x, -2400, -1400, 4800, 1600, '#D9C49A', '#CBB488', 50); P.shelves(x, -1500, -820, 900, 560, { rows: 3, seed: 5 }); P.shelves(x, 600, -820, 900, 560, { rows: 3, seed: 11 }); P.clock(x, 0, -680, 70, 0, { rim: '#6B4123' }); };

// ---------- scene times ----------
const t1 = 0, t2 = at('r1', 'Pepsi-Cola') - 0.15, t3 = at('r1', 'and') - 0.1, t4 = begin('r2') - 0.2, t5 = at('r2', 'Coca-Cola') - 0.15, t6 = at('r2', 'It') - 0.12,
  t7 = begin('r3') - 0.2, t8 = at('r3', 'During') - 0.12, t9 = at('r3', 'sold') - 0.12, t10 = at('r3', 'the', 1) - 0.12, t11 = begin('r3b') - 0.25, t12 = at('r3b', 'In') - 0.12,
  t13 = at('r3b', 'on') - 0.1, t14 = at('r3b', 'singing') - 0.12, t15 = at('r3b', 'version') - 0.3, t16 = begin('r4') - 0.25, t17 = at('r4', 'In') - 0.12, t18 = at('r4', 'people') - 0.12,
  t19 = at('r4', 'and') - 0.1, t20 = begin('r5') - 0.25, t21 = at('r5', 'And') - 0.1, t22 = at('r5', 'what') - 0.12;

const ringScene = (n, word, draw) => (ctx, t, lt, t0) => {
  const c = EN.cam([[0, 0, -120, 1.15], [3, 0, -100, 1.0]], lt);
  EN.layers(ctx, c, [[0.4, x => K.arena(x, lt)], [1, x => { K.ring(x, false); draw(x, lt); }], [1.15, x => K.ring(x, true)]]);
  K.roundCard(ctx, 960, 190, n, word, pop(lt, 0.15, 0.4));
};
const studioTable = (x, lt, o = {}) => { rr(x, -420, 40, 840, 50, 10); ink(x, '#F4F0E6', 6); rr(x, -380, 90, 760, 220, 6); ink(x, PB, 6); fitText(x, 'TASTE TEST', 0, 200, 60, '#FFFFFF', 640);
  if (o.screen === false) return; if (o.reveal) { P.bottle(x, 200, 40, 0.62, { kind: 'contour' }); P.bottle(x, 320, 40, 0.62, { kind: 'pepsi' }); }
  x.save(); x.translate(0, -(o.reveal || 0) * 300); rr(x, 110, -170, 300, 210, 8); ink(x, '#C9CDD2', 6); fitText(x, '?', 260, -65, 90, '#8A8F96', 120); x.restore(); };

const scenes = [
  { name: 'r1 a rival was growing (sprout)', t0: t1, era: 'sepia', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -120, -150, 1.12], [3.0, 40, -150, 1.12], [5.4, 220, -130, 1.28]], lt), g = E.out(seg(lt, 2.4, 5.0)), noticed = lt > 4.3;
      EN.layers(ctx, c, [[0.35, x => K.town1898(x, lt)], [1, x => { grass(x);
          rr(x, -560, 60, 420, 200, 8); ink(x, '#D8B04A', 6); fitText(x, 'No. 1', -350, 160, 80, '#5A3A1A', 360); K.bottleGuy(x, -350, 70, 2.0, 'contour', noticed ? 'worried' : 'smug', { t: lt, arms: noticed ? [0.3, 0.3] : [0.4, 2.6], itemR: noticed ? null : g2 => { ell(g2, 0, -10, 18, 12); ink(g2, '#F4F0E6', 3); } });
          // the sprout grows into a little blue bottle
          poly(x, [[300, 240], [520, 240], [490, 340], [330, 340]]); ink(x, '#C46A4A', 5); const h = 40 + g * 330; x.beginPath(); x.moveTo(410, 240); x.bezierCurveTo(380, 240 - h * 0.3, 450, 240 - h * 0.7, 410, 240 - h); x.lineWidth = 12; x.strokeStyle = INK; x.stroke(); x.lineWidth = 6; x.strokeStyle = '#4FA35A'; x.stroke();
          for (const [k, sd] of [[0.35, -1], [0.6, 1]]) if (g > k) { x.save(); x.translate(410 + sd * 6, 240 - h * k); x.rotate(sd * 0.9); ell(x, sd * 30, 0, 34, 14); ink(x, '#4FA35A', 4); x.restore(); }
          if (g > 0.2) { const s2 = 0.35 + g * 0.75; K.bottleGuy(x, 410, 240 - h + 10, s2, 'pepsi', g > 0.9 ? 'smug' : 'happy', { t: lt, arms: [0.3, g > 0.8 ? 2.4 : 0.4] }); } P.sparkles(x, 410, 240 - h - 120, 90, lt, 5); }]]);
      L.word(ctx, 'A RIVAL', 1380, 160, pop(lt, rel(0, 'r1', 'rival') - 0.1), { size: 110, col: YELLOW });
    } },
  { name: 'r1 Pepsi-Cola: North Carolina, 1898', t0: t2, era: 'sepia', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -200, 0.92], [4.3, 0, -20, 1.08]], lt), up = lt > 0.5;
      EN.layers(ctx, c, [[0.35, x => K.town1898(x, lt)], [0.8, x => { P.storefront(x, -1700, 210, { w: 560, h: 560, col: '#B8714C', sign: 'DRY GOODS', awning: ['#2E5A3E', CREAM] }); P.storefront(x, 1120, 210, { w: 560, h: 520, col: '#9A5B44', sign: 'BAKERY', awning: [YELLOW, '#5A3420'] }); }],
        [1, x => { P.street(x, -2400, 200, 4800, 900, { col: '#B8A07A' }); P.storefront(x, -520, 210, { w: 1040, h: 700, col: '#E2C394', brick: false, sign: 'PHARMACY', signCol: '#2A3A6A', signFg: CREAM, awning: [PB, CREAM], upper: 3, display: (g, dx, dy, dw, dh) => { for (let i = 0; i < 6; i++) P.bottle(g, dx + 60 + i * 90, dy + dh - 10, 0.5, { kind: 'pepsi' }); } });
          P.crowd(x, -900, -560, 380, 0.9, 2, lt, { react: up ? 'shock' : null, seed: 3 }); P.crowd(x, 560, 900, 380, 0.9, 2, lt, { react: up ? 'cheer' : null, seed: 12 });
          toon(x, 0, 380, 1.2, LOOKS.pharmacist, up ? 'cheer' : 'stand', up ? 'laugh' : 'happy', { t: lt, itemR: g => P.bottle(g, 0, 20, 0.5, { kind: 'pepsi' }) }); if (up) P.sparkles(x, 110, -200, 140, lt, 6, '#BFE3FF'); P.lamppost(x, -700, 220, 1.1); }]]);
      L.plate(ctx, 'NORTH CAROLINA', 960, 150, pop(lt, rel(t2, 'r1', 'North') - 0.1), { size: 62 });
      L.dateCard(ctx, '1898', 300, 160, pop(lt, rel(t2, 'r1', '1898') - 0.05));
      L.plate(ctx, 'PEPSI-COLA', 1620, 160, pop(lt, 0.15), { size: 56, bg: PB, fg: '#FFFFFF' });
    } },
  { name: 'r1 bankrupt, more than once', t0: t3, era: 'sepia', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -160, 1.05], [2.6, 0, -170, 1.18]], lt), s1 = rel(t3, 'r1', 'bankrupt'), s2 = rel(t3, 'r1', 'once'), sh = EN.shake(lt, [s1, s2], 12), fall = E.in(seg(lt, s2 + 0.1, s2 + 0.5));
      EN.layers(ctx, { ...c, x: c.x + sh.x, y: c.y + sh.y }, [[0.4, x => { L.skyGrad(x, -2200, -1300, 4400, 1500, ['#9A9A92', '#D8CDB0']); }],
        [1, x => { P.street(x, -2400, 200, 4800, 900, { col: '#A8987A' }); P.storefront(x, -520, 210, { w: 1040, h: 700, col: '#C9B48A', brick: false, signCol: '#2A3A6A', awning: ['#7E7A70', CREAM], upper: 3 });
          x.save(); x.translate(0, -300 + fall * 520); x.rotate(fall * 0.5); rr(x, -500, -32, 1000, 64, 6); ink(x, '#2A3A6A', 5); fitText(x, 'PHARMACY', 0, 0, 36, CREAM, 900); x.restore();
          K.bottleGuy(x, 0, 380, 2.1, 'pepsi', lt > s1 ? 'sad' : 'worried', { t: lt, arms: [0.2, 0.2] }); K.rainCloud(x, 0, -250, 1.1, lt); }]]);
      K.stamp(ctx, 'BANKRUPT', 620, 300, pop(lt, s1, 0.22), { size: 100, rot: -0.18 });
      K.stamp(ctx, 'BANKRUPT', 1330, 620, pop(lt, s2, 0.22), { size: 100, rot: 0.14 });
    } },
  { name: 'r2 in those hard years (for sale)', t0: t4, era: 'sepia', out: { type: 'whip', dur: 0.3, dir: 1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -60, 1.25], [1.6, 0, -80, 1.15]], lt);
      EN.layers(ctx, c, [[0.5, x => { L.skyGrad(x, -2200, -1300, 4400, 1500, ['#6E747A', '#A9A49C']); L.bricks(x, -2200, -900, 4400, 1110, '#8A6A5A'); K.rainFx(x, -1400, -900, 2800, 1200, lt, 0.4); }],
        [1, x => { x.fillStyle = '#7E7A70'; x.fillRect(-2400, 200, 4800, 900); ell(x, 260, 330, 220, 30); ink(x, '#9AB0C0', 0); rr(x, -2400, 180, 4800, 40, 4); ink(x, '#A9A49C', 5);
          K.bottleGuy(x, 0, 230, 1.8, 'pepsi', 'sad', { t: lt, arms: [0.25, 0.25], itemR: g => { g.save(); g.rotate(-0.08); rr(g, -150, 6, 240, 110, 6); ink(g, CREAM, 5); fitText(g, 'FOR SALE', -30, 62, 44, RED, 210); g.restore(); } }); K.rainFx(x, -1000, -700, 2000, 1200, lt + 3, 0.6); }]]);
      L.plate(ctx, 'HARD YEARS', 960, 140, pop(lt, rel(t4, 'r2', 'hard') - 0.1), { size: 60, bg: '#C9C4BA' });
    } },
  { name: 'r2 Coca-Cola reportedly had chances to buy Pepsi', t0: t5, era: 'jazz', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 160, -160, 1.15], [3.3, -40, -140, 1.05]], lt);
      EN.layers(ctx, c, [[0.6, x => K.boardroom(x, lt)],
        [1, x => { [-560, -320].forEach((px, i) => toon(x, px, 180, 0.95, K.EXECS[i === 0 ? 0 : 2], 'arms', 'smug', { t: lt + i, seed: i })); toon(x, -80, 180, 1.05, K.EXECS[1], 'think', 'think', { t: lt });
          K.longTable(x, 260, 1500); for (let i = 0; i < 4; i++) P.bottle(x, -560 + i * 220, 240, 0.4, { kind: 'contour' });
          toon(x, 620, 300, 1.05, K.EXECS[3], 'present', 'happy', { t: lt, flip: true, talk: 0.6 }); x.save(); x.translate(330, -150 + Math.sin(lt * 3) * 8); x.rotate(-0.05); rr(x, -170, -150, 340, 300, 6); ink(x, CREAM, 6); K.bottleGuy(x, -60, 120, 0.85, 'pepsi', 'worried', { t: lt }); fitText(x, 'FOR', 70, -60, 50, RED, 180); fitText(x, 'SALE', 70, 0, 50, RED, 180); x.restore(); }]]);
      L.plate(ctx, 'REPORTEDLY', 960, 130, pop(lt, rel(t5, 'r2', 'reportedly') - 0.1), { size: 64, bg: YELLOW });
    } },
  { name: 'r2 it passed every time', t0: t6, era: 'jazz', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -80, -150, 1.2], [1.9, -40, -150, 1.28]], lt), N = [0.15, 0.6, 1.05];
      EN.layers(ctx, c, [[0.6, x => K.boardroom(x, lt)],
        [1, x => { toon(x, -80, 180, 1.05, K.EXECS[1], { la: [0.2, 0.1], ra: [1.9 + Math.sin(lt * 18) * 0.4, -0.6] }, 'smug', { t: lt, look: [0.6, 0] }); K.longTable(x, 260, 1500);
          rr(x, 420, 120, 200, 200, 10); ink(x, '#8A8F96', 6); for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(440 + i * 50, 130); x.lineTo(440 + i * 50, 310); ink(x, null, 3); }
          N.forEach((n0, i) => { const u = seg(lt, n0, n0 + 0.5); if (u <= 0) return; if (u < 1) { x.save(); x.translate(lerp(60, 520, u), lerp(-80, 120, u) - Math.sin(u * Math.PI) * 260); x.rotate(u * 7); rr(x, -70, -55, 140, 110, 4); ink(x, CREAM, 4); fitText(x, 'PEPSI', 0, 0, 30, PB, 120); x.restore(); } else { x.save(); x.translate(520 - i * 30, 110 - i * 14); x.rotate(0.4 * (i - 1)); rr(x, -60, -40, 120, 80, 4); ink(x, CREAM, 4); x.restore(); } }); }]]);
      N.forEach((n0, i) => { if (lt > n0 + 0.05) P.bubble(ctx, 560 + i * 130, 330 - i * 80, 200, 90, ['NO.', 'NOPE.', 'PASS.'][i], { size: 44, tail: 40 }); });
      if (lt > N[2] + 0.4) L.plate(ctx, 'EVERY TIME', 1420, 900, pop(lt, N[2] + 0.4), { size: 60, bg: RED, fg: CREAM });
    } },
  { name: 'r3 ROUND 1: PRICE (boxing-ring metaphor)', t0: t7, era: 'pop', out: { type: 'whip', dur: 0.3, dir: 1 }, draw(ctx, t, lt) {
      ringScene(1, 'PRICE', (x, lt) => { const b = Math.abs(Math.sin(lt * 7)) * 14; K.bottleGuy(x, -420, 300 - b, 2.1, 'pepsi', 'determined', { t: lt, gloves: true, arms: [1.6 + Math.sin(lt * 7) * 0.3, 2.0 - Math.sin(lt * 7) * 0.3] });
        K.bottleGuy(x, 460, 300, 2.1, 'contour', 'smug', { t: lt, gloves: true, flip: true, arms: [0.4, 0.4] });
        x.save(); x.translate(-420, -330 - b); x.rotate(-0.08); rr(x, -90, -50, 180, 100, 10); ink(x, YELLOW, 5); fitText(x, '5¢', 0, 2, 70, INK, 150); x.restore(); })(ctx, t, lt);
    } },
  { name: 'r3 during the Great Depression', t0: t8, era: 'industry', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -400, -140, 1.1], [1.5, -100, -140, 1.06]], lt);
      EN.layers(ctx, c, [[0.3, x => K.depression(x, lt)], [0.85, x => { K.shutters(x); P.street(x, -2400, 200, 4800, 900, { col: '#8E887C' }); }],
        [1, x => { for (let i = 0; i < 7; i++) toon(x, -1300 + i * 230, 380 + (i % 2) * 10, 0.95, { skin: L.SKIN[i % 7], hair: { style: 'short', col: '#3A2A1E' }, top: ['#5A5450', '#6E665A', '#4A4F5C'][i % 3], pants: '#3A3A48', hat: i % 2 ? 'cap' : 'bowler', hatCol: '#4A4440' }, i === 4 ? 'shrug' : 'stand', i === 4 ? 'sad' : 'worried', { t: lt + i, seed: i, flip: true });
          P.lamppost(x, 520, 220, 1.1); }]]);
      L.plate(ctx, 'THE GREAT DEPRESSION', 960, 140, pop(lt, rel(t8, 'r3', 'Great') - 0.1), { size: 70, bg: '#C9C4BA' });
    } },
  { name: 'r3 a 12-ounce bottle for a nickel', t0: t9, era: 'jazz', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 100, -110, 1.1], [2.5, 60, -140, 1.02]], lt), tw = rel(t9, 'r3', 'twelve-ounce'), tn = rel(t9, 'r3', 'nickel'), grow = E.back(clamp((lt - tw + 0.1) / 0.5), 2);
      EN.layers(ctx, c, [[0.6, x => shopWall(x)], [1, x => { counterTop(x, 200);
          K.bottleGuy(x, 200, 190, 2.0, 'pepsi', 'grin', { t: lt, sy: lerp(1.0, 1.65, grow), arms: [0.4, 2.3] }); x.save(); x.translate(430, 120); x.rotate(0.1); rr(x, -70, -40, 140, 80, 8); ink(x, YELLOW, 5); fitText(x, '5¢', 0, 2, 52, INK, 120); x.restore();
          toon(x, -440, 360, 1.05, LOOKS.shopper, lt > tw ? 'shock' : 'point', lt > tw ? 'shock' : 'happy', { t: lt });
          if (lt > tn - 0.3) { const u = clamp((lt - tn + 0.3) / 0.5); P.coin(x, lerp(-300, 380, u), 150 - Math.sin(u * Math.PI) * 220, 30, lt * 15); } }]]);
      L.plate(ctx, '12 OZ', 1500, 230, pop(lt, tw - 0.05), { size: 96, bg: PB, fg: '#FFFFFF' });
      L.plate(ctx, 'FOR A NICKEL', 1500, 380, pop(lt, tn - 0.1), { size: 54 });
    } },
  { name: 'r3 same price as Coke\'s 6.5 oz', t0: t10, era: 'jazz', out: { type: 'whip', dur: 0.32, dir: 1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -220, 1.0], [3.6, 0, -230, 1.08]], lt), tc = rel(t10, 'r3', 'six-and-a-half-ounce'), grab = lt > tc + 1.0;
      EN.layers(ctx, c, [[0.6, x => shopWall(x)], [1, x => { counterTop(x, 200);
          K.bottleGuy(x, -300, 190, 2.0, 'pepsi', 'grin', { t: lt, sy: 1.65, arms: [2.4 + Math.sin(lt * 6) * 0.2, 2.4 - Math.sin(lt * 6) * 0.2] }); K.bottleGuy(x, 300, 190, 2.0, 'contour', lt > tc ? 'worried' : 'neutral', { t: lt, arms: [0.3, 0.3] });
          // a measuring ruler between them
          rr(x, -40, -630, 50, 820, 6); ink(x, '#F7E3A0', 5); for (let i = 0; i < 16; i++) { x.beginPath(); x.moveTo(-40, 180 - i * 50); x.lineTo(-40 + (i % 2 ? 18 : 30), 180 - i * 50); ink(x, null, 3); }
          for (const [bx, top, col] of [[-300, -620, PB], [300, -300, RED]]) { x.setLineDash([16, 12]); x.beginPath(); x.moveTo(bx + 90 * Math.sign(bx) * -1, top); x.lineTo(-15, top); ink(x, null, 4, { stroke: col }); x.setLineDash([]); }
          if (grab) { const u = E.out(clamp((lt - tc - 1.0) / 0.4)); x.save(); x.translate(lerp(-1100, -560, u), 0); toon(x, 0, 420, 1.15, LOOKS.shopper, 'point', 'grin', { t: lt }); x.restore(); } }]]);
      L.plate(ctx, '12 OZ', 640, 120, 1, { size: 70, bg: PB, fg: '#FFFFFF' });
      L.plate(ctx, '6.5 OZ', 1290, 400, pop(lt, tc - 0.05), { size: 70, bg: RED, fg: CREAM });
      L.plate(ctx, '5¢ = 5¢', 960, 960, pop(lt, rel(t10, 'r3', 'same') - 0.1), { size: 90, bg: YELLOW });
    } },
  { name: 'r3b ROUND 2: FEELINGS', t0: t11, era: 'pop', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      ringScene(2, 'FEELINGS', (x, lt) => { K.bottleGuy(x, -420, 300, 2.1, 'pepsi', 'worried', { t: lt, gloves: true, arms: [1.2, 1.2] });
        K.bottleGuy(x, 460, 300, 2.1, 'contour', 'love', { t: lt, flip: true, arms: [0.5, 1.9], itemR: g => { for (let i = 0; i < 5; i++) { g.save(); g.rotate(-0.6 + i * 0.3); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -80); g.lineWidth = 5; g.strokeStyle = '#3E8E4A'; g.stroke(); g.beginPath(); g.arc(0, -86, 16, 0, 6.28); ink(g, [RED, YELLOW, '#E8607A', '#F4F0E6', RED][i], 3); g.restore(); } } });
        for (let i = 0; i < 9; i++) { const ph = (lt * 0.5 + i / 9) % 1; x.save(); x.globalAlpha = Math.sin(ph * Math.PI); K.heart(x, 300 - hash(i) * 900, 0 - ph * 600, 22 + hash(i * 3) * 18, i % 3 ? RED : '#E8607A'); x.restore(); } })(ctx, t, lt);
    } },
  { name: 'r3b 1971: a film crew on a hilltop', t0: t12, era: 'pop', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -500, -180, 1.15], [3.9, -150, -180, 1.05]], lt);
      EN.layers(ctx, c, [[0.3, x => K.hills(x, lt)], [1, x => { K.hilltop(x, 220); K.YOUNG.forEach((lk, i) => toon(x, -200 + i * 170, 210 - Math.abs(i - 4) * -8 + 40, 0.8, lk, 'stand', 'happy', { t: lt + i, seed: i, itemR: g => P.bottle(g, 0, 40, 0.3, { kind: 'contour' }) }));
          K.filmCamera(x, -800, 400, 1.0, lt); toon(x, -1050, 430, 1.1, { skin: '#E8B58A', hair: { style: 'long', col: '#5A3A22' }, stache: 1, top: '#8A5A33', pants: '#2F6DB5', hat: 'cap', hatCol: '#2F8A6A' }, 'hold', 'determined', { t: lt, look: [0.8, -0.2] }); }],
        [1.3, x => { for (let i = 0; i < 5; i++) { x.beginPath(); x.arc(-1500 + i * 150, 620 + (i % 2) * 40, 60, 0, 6.28); ink(x, '#6FAF4A', 5); } }]]);
      L.dateCard(ctx, '1971', 300, 160, pop(lt, rel(t12, 'r3b', '1971') - 0.05));
      L.plate(ctx, 'YOUNG PEOPLE FROM AROUND THE WORLD', 1100, 960, pop(lt, rel(t12, 'r3b', 'young') - 0.1), { size: 50 });
    } },
  { name: 'r3b ...on a hilltop in Italy', t0: t13, era: 'pop', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -40, 0.95], [2.0, 120, -60, 1.02]], lt);
      EN.layers(ctx, c, [[0.3, x => K.hills(x, lt)], [1, x => { K.hilltop(x, 220); K.YOUNG.concat(K.YOUNG.slice(0, 4)).forEach((lk, i) => toon(x, -1250 + i * 200, 250 + Math.abs(i - 6) * 9, 0.75, lk, i % 3 ? 'stand' : 'wave', 'happy', { t: lt + i, seed: i, itemR: i % 3 ? g => P.bottle(g, 0, 40, 0.3, { kind: 'contour' }) : null })); }]]);
      L.plate(ctx, 'ITALY', 960, 150, pop(lt, rel(t13, 'r3b', 'Italy') - 0.1), { size: 96, bg: '#2F8A6A', fg: CREAM });
    } },
  { name: 'r3b singing about buying the world a Coke', t0: t14, era: 'pop', out: { type: 'whip', dur: 0.3, dir: 1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, 40, 1.15], [2.9, 0, 0, 1.05]], lt), gl = E.back(clamp((lt - rel(t14, 'r3b', 'world', 1) + 0.2) / 0.5), 2);
      EN.layers(ctx, c, [[0.3, x => K.hills(x, lt)], [1, x => { K.hilltop(x, 260); K.YOUNG.slice(2, 7).forEach((lk, i) => toon(x, -560 + i * 280, 400 + Math.abs(i - 2) * 10, 1.0, lk, i % 2 ? 'hold' : 'stand', 'happy', { t: lt + i, seed: i, talk: 0.9, itemR: g => P.bottle(g, 0, 40, 0.36, { kind: 'contour' }) }));
          K.notes(x, 0, 60, lt, 12, 1200); if (gl > 0) { x.save(); x.translate(0, -300); x.scale(gl, gl); L.cloud(x, 0, 0, 2.2, '#FFFFFF'); x.beginPath(); x.arc(-30, 10, 70, 0, 6.28); ink(x, '#3F8FD8', 5); ell(x, -50, -5, 30, 22); ink(x, '#7CC36A', 3); ell(x, -5, 30, 22, 18); ink(x, '#7CC36A', 3); P.bottle(x, 80, 80, 0.5, { kind: 'contour' }); x.restore(); } }]]);
      L.word(ctx, 'SINGING', 960, 130, pop(lt, 0.15), { size: 96, col: CREAM });
    } },
  { name: 'r3b a hit on the radio (1970s living room)', t0: t15, era: 'pop', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 300, -40, 1.2], [3.3, 0, -20, 1.0]], lt), hit = rel(t15, 'r3b', 'hit');
      EN.layers(ctx, c, [[0.6, x => K.room70s(x, lt)], [1, x => { rr(x, 300, 0, 520, 240, 8); ink(x, '#8A5A33', 6); K.radio(x, 560, 0, 0.95, lt); K.notes(x, 560, -250, lt, 9, 400);
          K.sofa(x, -380, 300, 1.0); const d = lt > hit - 0.3; [[-640, LOOKS.woman], [-360, { ...LOOKS.exec80s, glasses: null, top: '#8A5A33', top2: '#F4E8C8', tie: null }], [-100, LOOKS.kid]].forEach(([px, lk], i) => toon(x, px, 400 + (d ? -Math.abs(Math.sin(lt * 6 + i)) * 26 : 0), i === 2 ? 0.8 : 1.05, lk, d ? (Math.floor(lt * 3 + i) % 2 ? 'cheer' : 'wave') : 'stand', d ? 'laugh' : 'happy', { t: lt + i, seed: i })); }]]);
      L.word(ctx, 'A HIT ON THE RADIO', 960, 940, pop(lt, hit - 0.1), { size: 90 });
    } },
  { name: 'r4 ROUND 3: TASTE', t0: t16, era: 'pop', out: { type: 'whip', dur: 0.3, dir: 1 }, draw(ctx, t, lt) {
      ringScene(3, 'TASTE', (x, lt) => { const b = Math.abs(Math.sin(lt * 6)) * 10; K.bottleGuy(x, -420, 300 - b, 2.1, 'pepsi', 'grin', { t: lt, arms: [1.5, 1.5], itemL: g => K.cup(g, 0, 40, 0.5, { mark: '?' }), itemR: g => K.cup(g, 0, 40, 0.5, { mark: '?' }) });
        K.bottleGuy(x, 460, 300, 2.1, 'contour', 'worried', { t: lt, gloves: true, flip: true, arms: [0.3, 0.3] }); })(ctx, t, lt);
    } },
  { name: 'r4 the Pepsi Challenge, 1975 (TV set)', t0: t17, era: 'pop', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -120, 0.92], [3.3, 80, -60, 1.04]], lt);
      EN.layers(ctx, c, [[0.35, x => K.tvStudio(x, lt)], [0.7, x => { x.save(); x.translate(0, 230); K.backdrop(x, lt); x.restore(); P.crowd(x, -1700, -1050, 280, 0.7, 4, lt, { seed: 4 }); P.crowd(x, 1050, 1700, 280, 0.7, 4, lt, { seed: 9 }); }],
        [1, x => { x.fillStyle = '#3A3458'; x.fillRect(-2400, 260, 4800, 900); studioTable(x, lt); K.cup(x, -330, 40, 0.7, { mark: '?' }); K.cup(x, -110, 40, 0.7, { mark: '?' });
          toon(x, -620, 380, 1.1, { skin: '#E8B58A', hair: { style: 'side', col: '#2B1E16' }, top: '#E07A3A', top2: '#F4E8C8', tie: '#8A5A33', pants: '#5A4A3A' }, 'present', 'grin', { t: lt, talk: 0.6, itemL: g => { rr(g, -8, -60, 16, 60, 6); ink(g, '#3A3438', 3); g.beginPath(); g.arc(0, -66, 14, 0, 6.28); ink(g, '#8A8F96', 3); } }); }],
        [1.25, x => K.tvCam(x, 1100 - lt * 60, 560, 1.1, lt)]]);
      L.dateCard(ctx, '1975', 300, 160, pop(lt, rel(t17, 'r4', '1975') - 0.05));
      if (Math.floor(lt * 2) % 2 === 0) { rr(ctx, 1600, 60, 240, 70, 12); ink(ctx, RED, 5); fitText(ctx, 'ON AIR', 1720, 96, 40, '#FFFFFF', 200); }
    } },
  { name: 'r4 a sip from two unmarked cups', t0: t18, era: 'pop', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -60, -100, 1.35], [3.0, 60, -110, 1.45]], lt), side = lt < 1.5 ? -1 : 1, sip = Math.sin(clamp(((lt % 1.5) - 0.2) / 1.0) * Math.PI);
      EN.layers(ctx, c, [[0.6, x => { K.tvStudio(x, lt); x.save(); x.translate(0, 230); K.backdrop(x, lt); x.restore(); }],
        [1, x => { x.fillStyle = '#3A3458'; x.fillRect(-2400, 260, 4800, 900); toon(x, -220 + side * 80, 180, 1.15, { skin: '#D39A6A', hair: { style: 'curly', col: '#151313' }, top: '#F7C548', pants: '#2F6DB5' }, sip > 0.2 ? 'drink' : 'stand', sip > 0.5 ? 'think' : 'happy', { t: lt, look: [side * 0.6, 0.2], itemR: sip > 0.2 ? g => { g.rotate(2.6); K.cup(g, 0, 60, 0.55); } : null });
          studioTable(x, lt); if (!(side < 0 && sip > 0.2)) K.cup(x, -330, 40, 0.7, { mark: '?', fill: 0.6 }); if (!(side > 0 && sip > 0.2)) K.cup(x, -110, 40, 0.7, { mark: '?' }); if (side < 0 && sip > 0.2) { /* left cup lifted */ } }]]);
      L.plate(ctx, 'TWO UNMARKED CUPS', 960, 960, pop(lt, rel(t18, 'r4', 'unmarked') - 0.1), { size: 64 });
      if (lt > 1.0) P.bubble(ctx, 1500, 260, 240, 100, 'HMM...', { size: 46, tail: -60 });
    } },
  { name: 'r4 on camera, a lot of them picked Pepsi', t0: t19, era: 'pop', out: { type: 'whip', dur: 0.3, dir: 1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -60, -120, 1.05], [3.0, 60, -110, 1.22]], lt), tp = rel(t19, 'r4', 'picked'), rv = E.out(seg(lt, tp - 0.1, tp + 0.4)), nB = Math.min(12, Math.floor(clamp((lt - 0.6) / 2.2) * 12));
      EN.layers(ctx, c, [[0.35, x => K.tvStudio(x, lt)], [0.7, x => { x.save(); x.translate(0, 230); K.backdrop(x, lt); x.restore(); P.crowd(x, -1700, -1050, 280, 0.7, 4, lt, { react: rv > 0.5 ? 'cheer' : null, seed: 4 }); P.crowd(x, 1050, 1700, 280, 0.7, 4, lt, { react: rv > 0.5 ? 'cheer' : null, seed: 9 }); }],
        [1, x => { x.fillStyle = '#3A3458'; x.fillRect(-2400, 260, 4800, 900); toon(x, -220, 180, 1.1, { skin: '#D39A6A', hair: { style: 'curly', col: '#151313' }, top: '#F7C548', pants: '#2F6DB5' }, lt > 0.4 ? 'point' : 'think', rv > 0.5 ? 'laugh' : 'determined', { t: lt });
          studioTable(x, lt, { reveal: rv }); K.cup(x, -330, 40, 0.7, { mark: '?' }); K.cup(x, -110, 40, 0.7, { mark: '?' }); if (rv > 0.3) P.sparkles(x, 320, -80, 120, lt, 8, '#BFE3FF');
          K.tally(x, 600, -170, 3, nB); }],
        [1.25, x => K.tvCam(x, -1150 + lt * 50, 560, 1.1, lt, 'CAM 2')]]);
      if (Math.floor(lt * 2) % 2 === 0) { rr(ctx, 1600, 60, 240, 70, 12); ink(ctx, RED, 5); fitText(ctx, 'ON AIR', 1720, 96, 40, '#FFFFFF', 200); }
      L.plate(ctx, 'ON CAMERA', 330, 140, pop(lt, rel(t19, 'r4', 'camera') - 0.1), { size: 56, bg: YELLOW });
      L.plate(ctx, 'A LOT PICKED PEPSI', 960, 960, pop(lt, tp + 0.1), { size: 64, bg: PB, fg: '#FFFFFF' });
    } },
  { name: 'r5 still bigger, but losing ground (the race)', t0: t20, era: 'pop', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const D = t21 - t20, u = clamp(lt / D), c = EN.cam([[0, 0, 70, 0.95], [D, 120, 60, 1.0]], lt), cokeX = 420 + Math.sin(lt * 1.3) * 20, pepX = lerp(-900, 140, E.inOut(u));
      EN.layers(ctx, c, [[0.4, x => K.stands(x, lt)], [1, x => { K.track(x, lt); P.speedLines(x, -1400, -200, 2800, 900, lt, 1, 0.35);
          K.bottleGuy(x, pepX, 560, 2.2, 'pepsi', 'determined', { t: lt, legs: lt * 16, arms: [0.9 + Math.sin(lt * 16) * 0.6, 0.9 - Math.sin(lt * 16) * 0.6] });
          K.bottleGuy(x, cokeX, 380, 2.6, 'contour', lt > rel(t20, 'r5', 'losing') ? 'worried' : 'smug', { t: lt, legs: lt * 13, flip: lt > rel(t20, 'r5', 'losing'), arms: [0.9 - Math.sin(lt * 13) * 0.6, 0.9 + Math.sin(lt * 13) * 0.6] });
          for (let i = 0; i < 3; i++) P.puff(x, pepX - 160 - i * 60, 540, ((lt * 2 + i / 3) % 1), 0.7, '#E9C9A6'); }]]);
      L.plate(ctx, 'STILL BIGGER', 1420, 150, pop(lt, rel(t20, 'r5', 'bigger') - 0.1), { size: 60, bg: RED, fg: CREAM });
      L.plate(ctx, 'LOSING GROUND', 520, 150, pop(lt, rel(t20, 'r5', 'losing') - 0.1), { size: 60, bg: YELLOW });
    } },
  { name: 'r5 inside the company: a dangerous question', t0: t21, era: 'tense', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -60, 1.25], [3.9, 0, -90, 1.42]], lt), fl = clamp(1 - Math.abs(lt - rel(t21, 'r5', 'dangerous') - 0.05) / 0.25), stand = lt > rel(t21, 'r5', 'someone') - 0.1;
      EN.layers(ctx, c, [[0.6, x => { K.boardroom(x, lt, { wood: '#3A2A22' }); for (const wx of [-850, 850]) { rr(x, wx - 200, -820, 400, 700, 8); ink(x, '#3A2A22', 7); x.save(); rr(x, wx - 180, -800, 360, 660, 4); x.clip(); L.skyGrad(x, wx - 180, -800, 360, 660, ['#141A30', '#2E3A5A']); if (fl > 0) { x.fillStyle = `rgba(230,240,255,${fl * 0.8})`; x.fillRect(wx - 180, -800, 360, 660); K.lightning(x, wx, -800, 600, 3); } K.rainFx(x, wx - 180, -800, 360, 660, lt, 0.6); x.restore(); } }],
        [1, x => { [-620, -360, 360, 620].forEach((px, i) => toon(x, px, 180, 0.95, K.EXECS[i], 'arms', fl > 0.2 || stand ? 'worried' : 'neutral', { t: lt + i, seed: i, look: [px < 0 ? 0.7 : -0.7, 0] }));
          toon(x, 0, stand ? 260 : 180, 1.05, K.EXECS[0], stand ? 'wave' : 'think', stand ? 'determined' : 'think', { t: lt, talk: stand ? 0.6 : 0 }); K.longTable(x, 260, 1700); for (let i = 0; i < 5; i++) P.bottle(x, -600 + i * 300, 240, 0.4, { kind: 'contour' }); }]]);
      if (fl > 0) { ctx.save(); ctx.globalAlpha = fl * 0.35; ctx.fillStyle = '#E8F0FF'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
      L.word(ctx, 'A DANGEROUS QUESTION', 960, 140, pop(lt, rel(t21, 'r5', 'dangerous') - 0.05), { size: 80, col: CREAM });
    } },
  { name: 'r5 "what if we change the taste?"', t0: t22, era: 'tense', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -40, 1.4], [2.4, 0, -60, 1.55]], lt), fl = Math.max(clamp(1 - Math.abs(lt - 0.1) / 0.2), clamp(1 - Math.abs(lt - 1.2) / 0.2)), tilt = E.in(seg(lt, 1.0, 1.9));
      EN.layers(ctx, c, [[0.6, x => { K.boardroom(x, lt, { wood: '#3A2A22' }); x.save(); x.translate(-560, -520 + tilt * 120); x.rotate(tilt * 0.6); x.restore(); }],
        [1, x => { toon(x, -560, 180, 0.95, K.EXECS[2], 'shock', 'shock', { t: lt, seed: 2 }); toon(x, 560, 180, 0.95, K.EXECS[3], 'shock', 'shock', { t: lt, seed: 3, flip: true }); toon(x, 0, 260, 1.05, K.EXECS[0], 'wave', 'determined', { t: lt, talk: 0.8 }); K.longTable(x, 260, 1700); }]]);
      if (fl > 0) { ctx.save(); ctx.globalAlpha = fl * 0.5; ctx.fillStyle = '#E8F0FF'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
      L.word(ctx, 'WHAT IF WE CHANGE', 960, 840, pop(lt, rel(t22, 'r5', 'what') - 0.05), { size: 96, col: CREAM });
      L.word(ctx, 'THE TASTE?', 960, 975, pop(lt, rel(t22, 'r5', 'taste') - 0.1), { size: 120, col: RED });
    } },
];

EN.run({ module, dir: __dirname, TL, scenes, card: { n: 'CHAPTER 5', title: 'The Rival', sub: '1898–1985', era: 'sepia' },
  cues: () => [['rise', 3.0, 0.3], ['pop', at('r1', 'rival'), 0.5], ['boing', 5.2, 0.4], ['whoosh', t2 - 0.15, 0.4], ['sparkle', t2 + 0.5, 0.6], ['stamp', at('r1', '1898'), 0.5],
    ['stamp', at('r1', 'bankrupt'), 0.9], ['stamp', at('r1', 'once'), 0.9], ['fall', at('r1', 'once') + 0.15, 0.5], ['thump', at('r1', 'once') + 0.5, 0.6], ['rumble', t4, 0.3], ['wind', t4 + 0.1, 0.3],
    ['murmur', t5 + 0.2, 0.25], ['paper', t5 + 0.4, 0.4], ['flap', t6 + 0.15, 0.4], ['flap', t6 + 0.6, 0.4], ['flap', t6 + 1.05, 0.4], ['thump', t6 + 0.65, 0.4], ['thump', t6 + 1.1, 0.4], ['thump', t6 + 1.55, 0.4],
    ['bell', t7 + 0.15, 0.7], ['crowdcheer', t7 + 0.2, 0.4], ['wind', t8 + 0.1, 0.3], ['slideup', at('r3', 'twelve-ounce') - 0.1, 0.5], ['coins', at('r3', 'nickel') + 0.2, 0.5],
    ['boing', at('r3', 'six-and-a-half-ounce') + 0.1, 0.5], ['kaching', at('r3', 'same') , 0.5], ['bell', t11 + 0.15, 0.7], ['sparkle', t11 + 0.5, 0.4], ['stamp', at('r3b', '1971'), 0.5], ['machine', t12 + 0.6, 0.2],
    ['sparkle', at('r3b', 'world', 1), 0.5], ['tvon', t15 + 0.1, 0.4], ['crowdcheer', at('r3b', 'hit'), 0.35], ['bell', t16 + 0.15, 0.7], ['stamp', at('r4', '1975'), 0.5], ['applause', t17 + 0.3, 0.25],
    ['glassclink', t18 + 0.3, 0.4], ['glassclink', t18 + 1.8, 0.4], ['drumroll', t19 + 0.3, 0.35], ['cymbal', at('r4', 'picked'), 0.5], ['crowdcheer', at('r4', 'picked') + 0.1, 0.5],
    ['whoosh', t20 - 0.15, 0.4], ['steps', t20 + 0.2, 0.5], ['crowdcheer', t20 + 0.4, 0.3], ['slidedown', at('r5', 'losing'), 0.5], ['rumble2', t21 + 0.2, 0.3], ['boom', at('r5', 'dangerous'), 0.5],
    ['heartbeat', t22 + 0.2, 0.5], ['boom', t22 + 1.2, 0.6], ['gasp', at('r5', 'taste'), 0.4]],
  music: [[0, 'ragtime'], [t3, 'ragminor'], [t7, 'pop'], [t8, 'sad'], [t9, 'ragtime'], [t11, 'up'], [t16, 'pop'], [t20, 'build'], [t21, 'tension']] });
