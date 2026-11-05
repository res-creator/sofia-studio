// Chapter 4 — "Everywhere" (1919–1945): the 1919 sale, Robert Woodruff and "an arm's reach of desire", cartons/coolers/vending machines/ads,
// the 1931 Santa paintings (and the red-Santa myth), the WWII 5-cent promise, 64 bottling plants, going global behind the army.
const L = require('../../../kit/look'), P = require('../../../kit/props'), { toon, LOOKS } = require('../../../kit/toon'), EN = require('../../../kit/engine');
const K = require('./woodkit');
const { W, H, INK, CREAM, RED, YELLOW, BLUE, ERA, ink, rr, ell, poly, clamp, lerp, seg, E, hash, fitText } = L;
const TL = EN.timeline(__dirname, { start: 3.0, gap: 0.55 }), at = TL.at, begin = TL.begin, end = TL.end;
const pop = (t, t0, d = 0.35) => clamp((t - t0) / d);
const W0 = LOOKS.woodruff, SOLDIER = LOOKS.soldier;
const SOLDIERS = [SOLDIER, { ...SOLDIER, skin: '#F2C9A0', hair: { style: 'short', col: '#D9B25A' } }, { ...SOLDIER, skin: '#8E5A36', hair: { style: 'short', col: '#151313' } }, { ...SOLDIER, skin: '#E8B58A', hair: { style: 'short', col: '#A4462A' }, stache: 1 }];
const bot = (o = {}) => g => { g.rotate(o.rot || 0); P.bottle(g, 0, o.y ?? 40, o.s || 0.4, { kind: 'contour', open: o.open, fill: o.fill ?? 1 }); };

function globe(ctx, x, y, r, t) { ctx.save(); ctx.translate(x, y); ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.27); ink(ctx, '#3F8FD8', 7); ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.27); ctx.clip();
  const lands = [[-0.5, -0.35, 0.32, 0.22], [-0.35, 0.25, 0.18, 0.3], [0.15, -0.3, 0.38, 0.2], [0.2, 0.15, 0.2, 0.28], [0.6, 0.35, 0.18, 0.12], [-0.85, -0.05, 0.12, 0.2]];
  for (const [lx, ly, rx, ry] of lands) { const xx = ((lx + t * 0.05 + 1.5) % 2 - 1) * r; ell(ctx, xx, ly * r, rx * r, ry * r, 0.3); ink(ctx, '#7CC36A', 5); }
  ctx.globalAlpha = 0.25; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(r * 0.35, r * 0.2, r * 1.05, 0, 6.27); ctx.fill(); ctx.restore(); ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.27); ink(ctx, null, 7); ctx.restore(); }
function bottleWalker(ctx, x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const ph = t * 7;
  for (const sd of [-1, 1]) { const a = Math.sin(ph) * 0.45 * sd; ctx.save(); ctx.translate(sd * 14, -40); ctx.rotate(a); rr(ctx, -7, 0, 14, 44, 6); ink(ctx, INK, 0); ell(ctx, 6, 46, 14, 8); ink(ctx, INK, 0); ctx.restore(); }
  P.bottle(ctx, 0, -36 - Math.abs(Math.cos(ph)) * 6, 0.6, { kind: 'contour' }); ctx.save(); ctx.translate(0, -120 - Math.abs(Math.cos(ph)) * 6); ell(ctx, -9, 0, 6, 8); ink(ctx, '#FFF', 3); ell(ctx, 9, 0, 6, 8); ink(ctx, '#FFF', 3); ctx.beginPath(); ctx.arc(-8, 1, 2.5, 0, 6.28); ctx.arc(10, 1, 2.5, 0, 6.28); ctx.fillStyle = INK; ctx.fill(); ctx.restore();
  ctx.restore(); }
function paperFly(ctx, x0, y0, lt, n, seed = 0) { for (let i = 0; i < n; i++) { const ph = (lt * 0.9 + hash(i + seed)) % 1, a = hash(i * 3 + seed) * 2 - 1; ctx.save(); ctx.translate(x0 + a * 500 * ph, y0 - Math.sin(ph * Math.PI) * 300 + ph * 200); ctx.rotate(ph * 6 * a); ctx.globalAlpha = 1 - ph * ph; rr(ctx, -30, -38, 60, 76, 3); ink(ctx, '#F4F0E6', 3); for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-20, -24 + k * 14); ctx.lineTo(20, -24 + k * 14); ink(ctx, null, 2); } ctx.restore(); } }
function confetti(ctx, x0, x1, y0, lt, n = 60) { const cols = [RED, YELLOW, BLUE, '#2F8A6A', CREAM]; for (let i = 0; i < n; i++) { const x = lerp(x0, x1, hash(i * 1.3)) + Math.sin(lt * 2 + i) * 30, y = y0 + ((hash(i * 2.9) * 1200 + lt * (180 + hash(i) * 120)) % 1200); ctx.save(); ctx.translate(x, y); ctx.rotate(lt * 3 + i); ctx.fillStyle = cols[i % 5]; ctx.fillRect(-8, -5, 16, 10); ctx.restore(); } }
function brickRow(ctx) { L.bricks(ctx, -2200, -1200, 4400, 1420, '#A65A3E'); }

// ---------- scene times (cut on stressed words) ----------
const tS2 = at('w1', 'sold') - 0.15, tS3 = at('w1', 'banker') - 0.12, tS4 = at('w1', 'the', 1) - 0.12, tS5 = begin('w2') - 0.25, tS6 = at('w2', 'and') - 0.1, tS7 = at('w2', 'His', 1) - 0.15,
  tS8 = at('w2', 'put') - 0.12, tS9 = begin('w3') - 0.25, tS10 = at('w3', 'Coolers') - 0.12, tS11 = at('w3', 'Vending') - 0.12, tS12 = at('w3', 'And') - 0.1, tS13 = at('w3', 'Christmas') - 0.15,
  tS14 = begin('w4') - 0.2, tS15 = at('w4', 'He') - 0.12, tS16 = at('w4', 'But') - 0.12, tS17 = begin('w5') - 0.25, tS18 = at('w5', 'In') - 0.12, tS19 = at('w5', 'every') - 0.12,
  tS20 = at('w5', 'wherever') - 0.12, tS21 = at('w5', 'and') - 0.12, tS22 = begin('w6') - 0.2, tS23 = at('w6', 'overseas') - 0.12, tS24 = at('w6', 'During') - 0.12, tS25 = at('w6', 'as') - 0.12,
  tS26 = begin('w7') - 0.2, tS27 = at('w7', 'And') - 0.1, tS28 = at('w7', 'Coca-Cola') - 0.12;
const rel = (t0, id, w, n = 0) => at(id, w, n) - t0;

// 64 plant pins: lon/lat boxes near the WWII fronts (deterministic)
const PIN_BOX = [[-6, 2, 50, 54], [-2, 20, 43, 52], [8, 18, 38, 46], [-8, 30, 30, 36], [30, 50, 25, 35], [72, 90, 15, 28], [115, 150, -35, -20], [120, 126, 7, 17], [135, 150, -9, -3], [150, 170, -18, -8], [140, 146, 12, 20], [-40, -35, -8, -4], [5, 35, -5, 10]];
const PINS = Array.from({ length: 64 }, (_, i) => { const b = PIN_BOX[i % PIN_BOX.length]; return [lerp(b[0], b[1], hash(i * 4.1)), lerp(b[2], b[3], hash(i * 7.7))]; }).sort((a, b) => hash(a[0] * 3 + a[1]) - hash(b[0] * 3 + b[1]));
// dozens of countries after the war (bottle icons spreading)
const SPREAD = [[-100, 40], [-80, 40], [-95, 22], [-75, 5], [-55, -15], [-65, -35], [-3, 40], [2, 47], [10, 51], [-2, 53], [12, 43], [20, 52], [15, 60], [25, 40], [5, 35], [30, 30], [35, 0], [25, -28], [10, 8], [45, 25], [55, 33], [78, 22], [100, 15], [121, 13], [139, 36], [127, 37], [145, -30], [118, -28], [174, -40], [-70, 18], [-58, 5], [32, -15], [-8, 15], [105, 0], [114, 23], [70, 32]];

const scenes = [
  { name: 'w1 1919: the vault, Candler family', t0: 0, era: 'jazz', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -110, 1.0], [3.2, 0, -120, 1.06], [5.6, -60, -150, 1.25]], lt), open = E.inOut(seg(lt, 3.7, 5.0));
      EN.layers(ctx, c, [[0.5, x => K.vaultWall(x, lt)],
        [0.8, x => { K.depositBoxes(x, -1560, -600, 6, 9); K.depositBoxes(x, 960, -600, 6, 9); K.frame(x, -660, -400, 230, 270, '#9CB0A0', (g, fx, fy) => toon(g, fx, fy + 250, 0.78, LOOKS.candler, 'stand', 'smug', { t: lt, noShadow: true })); K.nameplate(x, -660, -230, 0.7, 'A. G. CANDLER'); }],
        [1, x => { K.marble(x, 200); K.vaultDoor(x, 0, -130, 300, open, lt * 1.6 * (1 - open)); if (open > 0.3) P.sparkles(x, 0, -150, 260, lt, 8);
          HEIRS(x, lt); }],
        [1.25, x => { rr(x, 820, -900, 90, 1400, 4); ink(x, '#5E666C', 6); for (let i = 0; i < 9; i++) { x.beginPath(); x.arc(865, -860 + i * 150, 8, 0, 6.28); ink(x, '#B9C0C5', 3); } }]]);
      L.dateCard(ctx, '1919', 300, 170, pop(lt, rel(0, 'w1', '1919')));
    } },
  { name: 'w1 sold to a group of investors', t0: tS2, era: 'jazz', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -160, -90, 1.15], [2.8, 140, -80, 1.2]], lt), u = E.inOut(seg(lt, 0.25, 1.3)), grab = lt > 1.3;
      EN.layers(ctx, c, [[0.6, x => K.office(x, lt, { wx: -700, fx: 260 })],
        [1, x => { K.HEIR.forEach((lk, i) => toon(x, -640 + i * 150, 190, 0.95, lk, i === 1 ? 'present' : 'stand', grab ? 'happy' : 'neutral', { t: lt + i, seed: i }));
          K.INVESTORS.forEach((lk, i) => toon(x, 330 + i * 160, 190, 0.95, lk, grab ? (i === 1 ? 'cheer' : 'fist') : 'stand', grab ? 'grin' : 'smug', { t: lt + i, seed: i + 3, flip: true }));
          K.desk(x, 0, 330, 1600); x.save(); x.translate(lerp(-260, 300, u), 108 - Math.sin(u * Math.PI) * 40); x.rotate(lerp(-0.2, 0.15, u)); rr(x, -110, -70, 220, 140, 4); ink(x, '#F4E8C8', 5); fitText(x, 'THE COMPANY', 0, -34, 26, RED, 190); for (let k = 0; k < 3; k++) { x.beginPath(); x.moveTo(-80, 0 + k * 18); x.lineTo(80, 0 + k * 18); ink(x, null, 2); } x.restore(); }]]);
      K.stamp(ctx, 'SOLD', 960, 210, pop(lt, 0.35, 0.25), { size: 120 });
    } },
  { name: 'w1 led by banker Ernest Woodruff', t0: tS3, era: 'jazz', out: { type: 'whip', dur: 0.3, dir: 1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -60, 1.0], [2.2, 0, -110, 1.22]], lt);
      EN.layers(ctx, c, [[0.55, x => K.bankHall(x, lt)], [0.85, x => { K.marble(x, 160); K.INVESTORS.forEach((lk, i) => toon(x, -520 + i * 520 + (i === 1 ? 0 : 0), 250, 0.8, lk, 'stand', 'smug', { t: lt + i, seed: i, flip: i === 2 })); }],
        [1, x => { toon(x, 0, 330, 1.25, K.ERNEST, lt > 0.5 ? 'wave' : 'stand', 'smug', { t: lt, itemL: g => P.moneyBag(g, 0, 70, 0.6, '$') }); P.sparkles(x, 0, -120, 260, lt, 6); }]]);
      L.plate(ctx, 'ERNEST WOODRUFF', 1400, 900, pop(lt, rel(tS3, 'w1', 'Ernest') - 0.1), { size: 64 });
      L.plate(ctx, 'BANKER', 1400, 790, pop(lt, 0.05), { size: 40, bg: YELLOW, rot: 0.03 });
    } },
  { name: 'w1 $25,000,000: armored truck', t0: tS4, era: 'jazz', out: { type: 'tear', dur: 0.5 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 160, -120, 1.05], [1.2, 60, -120, 1.0], [3.3, -40, -140, 1.08]], lt), tx = lerp(1500, 420, E.out(seg(lt, 0, 1.0)));
      const uN = E.inOut(seg(lt, rel(tS4, 'w1', 'twenty') - 0.3, rel(tS4, 'w1', 'dollars') + 0.2)), n = Math.round(25e6 * uN / 1000) * 1000;
      EN.layers(ctx, c, [[0.3, x => { L.skyGrad(x, -2000, -1200, 4000, 1500, ERA.jazz.sky); L.cloud(x, -800 + lt * 12, -620, 1.2); L.cloud(x, 600 + lt * 9, -700, 0.9); for (let i = 0; i < 8; i++) { const h = 380 + hash(i * 5) * 360; rr(x, -1900 + i * 500, 200 - h, 400, h, 4); ink(x, ['#C9B79A', '#B9A88E', '#D8C9A6'][i % 3], 4); } }],
        [0.8, x => { rr(x, -1200, -620, 1400, 830, 4); ink(x, '#EDE6D6', 6); poly(x, [[-1260, -620], [-500, -900], [260, -620]]); ink(x, '#E2D9C4', 6); fitText(x, 'BANK', -500, -700, 90, '#5A3A1A', 400); K.columns(x, [-1100, -880, -120, 100], -560, 140);
          rr(x, -700, -260, 400, 400, 8); ink(x, '#5A3420', 6); for (let i = 0; i < 4; i++) { rr(x, -1240 + i * 40, 140 + i * 22, 1480 - i * 80, 24, 4); ink(x, '#DCD3C0', 4); } }],
        [1, x => { K.road(x, 200); K.armored(x, tx, 330, 1.05, lt * (lt < 1 ? 1 : 0.02));
          toon(x, -560, 330, 1.0, { ...LOOKS.worker, top: '#4A5A6A', hat: 'cap', hatCol: '#2E3A4A' }, uN > 0.1 ? 'hold' : 'stand', uN > 0.5 ? 'shock' : 'neutral', { t: lt });
          for (let i = 0; i < 14; i++) { const ph = seg(lt, 1.05 + i * 0.16, 1.65 + i * 0.16); if (ph > 0 && ph < 1) P.moneyBag(x, lerp(tx - 160, -330, ph), lerp(150, 300, ph) - Math.sin(ph * Math.PI) * 320, 0.55, '$'); }
          for (let k = 0; k < Math.min(6, Math.floor((lt - 1.55) / 0.3)); k++) P.moneyBag(x, -360 + (k % 3) * 70 - (k > 2 ? -35 : 0), 340 - (k > 2 ? 60 : 0), 0.5, '$'); }]]);
      L.plate(ctx, '$' + n.toLocaleString('en-US'), 960, 170, uN > 0 ? 1 : 0, { size: 104, bg: uN >= 1 ? RED : CREAM, fg: uN >= 1 ? CREAM : INK });
    } },
  { name: 'w2 a few years later: Robert takes the big chair', t0: tS5, era: 'jazz', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -220, -60, 1.05], [2.4, 80, -90, 1.12], [3.1, 120, -100, 1.22]], lt), jump = seg(lt, rel(tS5, 'w2', 'took') - 0.25, rel(tS5, 'w2', 'took') + 0.25), wx = lerp(-1000, 150, E.inOut(seg(lt, 0.1, 2.1)));
      EN.layers(ctx, c, [[0.6, x => { K.office(x, lt, { wx: -650, fx: 1100 }); for (let i = 0; i < 6; i++) { const ph = seg(lt, i * 0.2, i * 0.2 + 1.2); if (ph > 0 && ph < 1) { x.save(); x.translate(560 + ph * 300 * (i % 2 ? 1 : -1), -430 + ph * 500); x.rotate(ph * 5); x.globalAlpha = 1 - ph; P.calendar(x, 0, 0, 0.6, 'YEAR', ['JAN', 'APR', 'JUL', 'OCT', 'JAN', 'JUN'][i], String(1 + i * 5)); x.restore(); } }
          P.calendar(x, 560, -430, 0.6, 'YEAR', 'MAY', '1'); K.frame(x, -180, -520, 200, 240, '#9CB0A0', (g, fx, fy) => P.bottle(g, fx, fy + 90, 0.7, { kind: 'contour' })); }],
        [1, x => { K.bigChair(x, 150, 300, 0.95); x.save(); x.globalAlpha = 1; const sat = jump >= 1;
          if (sat) toon(x, 150, 205 + Math.sin(clamp(lt - rel(tS5, 'w2', 'took') - 0.25) * 18) * 8 * Math.exp(-(lt - rel(tS5, 'w2', 'took')) * 4), 1.1, W0, 'sit', 'smug', { t: lt, noShadow: true });
          else if (jump > 0) toon(x, lerp(wx, 150, jump), lerp(330, 205, jump) - Math.sin(jump * Math.PI) * 160, 1.1, W0, 'cheer', 'grin', { t: lt });
          else toon(x, wx, 330, 1.1, W0, lt < 2.1 ? 'walk' : 'stand', 'determined', { t: lt }); x.restore();
          K.plant(x, -820, 300, 1.1); }]]);
      L.plate(ctx, 'A FEW YEARS LATER', 330, 120, pop(lt, 0.2), { size: 44, bg: YELLOW });
      L.plate(ctx, 'ROBERT WOODRUFF', 960, 950, pop(lt, rel(tS5, 'w2', 'Robert') - 0.05), { size: 66 });
    } },
  { name: 'w2 ran it for decades (time-lapse window)', t0: tS6, era: 'jazz', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -90, 1.2], [2.6, 0, -60, 1.08]], lt), day = 0.5 + 0.5 * Math.sin(lt * 7), stampHit = Math.floor(lt * 3.2) % 2 === 0;
      const view = (g, x, y, w, h) => { const a = ['#16203A', '#2D4A7A'], b = ERA.jazz.sky; g.fillStyle = b[0]; g.fillRect(x, y, w, h); g.globalAlpha = 1 - day; L.skyGrad(g, x, y, w, h, a); g.globalAlpha = 1;
        const sx = x + ((lt * 260) % (w + 120)) - 60; g.beginPath(); g.arc(sx, y + 80 + Math.sin(lt * 3) * 20, 34, 0, 6.28); ink(g, day > 0.5 ? '#FFE07A' : '#F4F0E6', 3);
        for (let i = 0; i < 5; i++) { rr(g, x + i * 90 - 10, y + h - 120 - hash(i) * 160 - Math.min(140, lt * 30) * hash(i * 2), 80, 500, 3); ink(g, day > 0.5 ? '#B9A88E' : '#3A3A58', 3); if (day < 0.5) for (let k = 0; k < 4; k++) { g.fillStyle = '#F7D27A'; g.fillRect(x + i * 90 + 6 + (k % 2) * 34, y + h - 90 - hash(i) * 160 + Math.floor(k / 2) * 40, 18, 14); } } };
      EN.layers(ctx, c, [[0.6, x => { K.office(x, lt, { wx: -560, fx: 1100, view }); P.clock(x, 120, -700, 70, lt * 40, { rim: '#6B4123' }); }],
        [1, x => { K.bigChair(x, 0, 330, 0.85); toon(x, 0, 190, 1.1, W0, stampHit ? 'fist' : 'hold', 'determined', { t: lt, noShadow: true, itemR: g => { rr(g, -16, -10, 32, 50, 6); ink(g, '#5A3420', 4); rr(g, -26, 34, 52, 16, 4); ink(g, '#3A2A1E', 4); } });
          K.desk(x, 0, 330, 980, { plate: 'R. W. WOODRUFF' }); for (let i = 0; i < 6; i++) { rr(x, -420 + i * 6, 96 - i * 14, 200, 14, 3); ink(x, '#F4F0E6', 3); } paperFly(x, 260, 60, lt, 7, 2); }]]);
      L.word(ctx, 'FOR DECADES', 960, 150, pop(lt, rel(tS6, 'w2', 'decades') - 0.1), { size: 100, col: YELLOW });
    } },
  { name: 'w2 easy to say, hard to do (chalkboard)', t0: tS7, era: 'jazz', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 120, -160, 1.05], [3.2, 60, -140, 1.15]], lt), uE = seg(lt, rel(tS7, 'w2', 'easy') - 0.1, rel(tS7, 'w2', 'easy') + 0.5), uH = seg(lt, rel(tS7, 'w2', 'hard') - 0.1, rel(tS7, 'w2', 'hard') + 0.5);
      EN.layers(ctx, c, [[0.6, x => { L.wallpaper(x, -2000, -1200, 4000, 1400, '#CBB48A', '#BCA478', 54); K.floorBoards(x, '#7A4A2A'); K.window(x, -1250, -420, 300, 380, (g, a, b, w, h) => L.skyGrad(g, a, b, w, h, ERA.jazz.sky)); }],
        [1, x => { K.chalkboard(x, 250, -310, 1100, 560); x.save(); x.font = `52px ${L.F.black}`; fitText(x, 'THE GOAL', 250, -520, 52, '#F4F0E6', 500);
          const wr = (s, xx, yy, u, col) => { x.save(); x.beginPath(); x.rect(xx - 260, yy - 50, 520 * u, 100); x.clip(); fitText(x, s, xx, yy, 54, col, 480); x.restore(); };
          wr('EASY TO SAY', -20, -380, uE, '#F4F0E6'); if (uE >= 1) { x.beginPath(); x.moveTo(-200, -320); x.quadraticCurveTo(-20, -300, 160, -330); x.lineWidth = 5; x.strokeStyle = '#F4F0E6'; x.stroke(); }
          wr('HARD TO DO', 530, -380, uH, '#F7C548'); if (uH > 0.3) { x.save(); x.globalAlpha = uH; poly(x, [[380, -110], [530, -300], [680, -110]]); x.lineWidth = 5; x.strokeStyle = '#F4F0E6'; x.stroke(); const cl = clamp((lt - rel(tS7, 'w2', 'hard')) / 2); x.beginPath(); x.arc(lerp(400, 525, cl), lerp(-130, -290, cl), 9, 0, 6.28); x.fillStyle = '#F4F0E6'; x.fill(); x.restore(); }
          x.restore();
          toon(x, -560, 330, 1.15, W0, lt > rel(tS7, 'w2', 'easy') - 0.2 ? 'point' : 'present', uH > 0 ? 'determined' : 'smug', { t: lt, talk: 0.6 });
          toon(x, 520, 400, 0.95, K.INVESTORS[0], 'stand', uH > 0 ? 'worried' : 'neutral', { t: lt, flip: true, seed: 2 }); toon(x, 730, 410, 0.95, K.ACCOUNTANT, uH > 0 ? 'shock' : 'stand', uH > 0 ? 'shock' : 'think', { t: lt + 1, flip: true, seed: 5 }); }]]);
    } },
  { name: 'w2 within an arm\'s reach of desire (stretchy arm)', t0: tS8, era: 'jazz', out: { type: 'whip', dur: 0.3, dir: 1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -800, -60, 1.0], [1.2, -150, -60, 1.0], [2.9, 650, -60, 1.0]], lt);
      const TG = [[-900, 0.75], [0, 1.65], [900, 2.55]], who = [[{ ...LOOKS.worker, top: '#C98E5A', hat: 'boater', hatCol: '#E8D6A6' }, 'farmer'], [LOOKS.exec80s, 'clerk'], [LOOKS.kid, 'kid']];
      const reach = (tg) => lt >= tg[1];
      EN.layers(ctx, c, [[0.35, x => { L.skyGrad(x, -2600, -1200, 5200, 1500, ERA.jazz.sky); L.glow(x, -1300, -600, 400, '#FFE07A', 0.6); x.beginPath(); x.arc(-1300, -600, 90, 0, 6.28); ink(x, '#FFE07A', 5); L.cloud(x, 200 + lt * 10, -650, 1.1); L.cloud(x, 1500, -560, 0.8); }],
        [1, x => { // three little worlds side by side: wheat field / office corner / beach
          x.fillStyle = '#D9B25A'; x.fillRect(-1700, 120, 1150, 900); for (let i = 0; i < 60; i++) { const wx = -1680 + i * 19; x.beginPath(); x.moveTo(wx, 140); x.lineTo(wx + Math.sin(lt * 3 + i) * 8, 40 + hash(i) * 30); x.lineWidth = 5; x.strokeStyle = '#B8902E'; x.stroke(); }
          x.fillStyle = '#E2C394'; x.fillRect(-450, -700, 900, 820); L.wallpaper(x, -450, -700, 900, 820, '#DCC8A2', '#CDB68C', 50); x.beginPath(); x.rect(-450, -700, 900, 820); ink(x, null, 6); L.planks(x, -450, 120, 900, 900, '#8A5A33'); K.desk(x, 120, 330, 420); P.clock(x, 260, -420, 50, lt * 3, { rim: '#6B4123' });
          x.fillStyle = '#4FA0D8'; x.fillRect(450, -40, 1400, 200); x.fillStyle = '#F1DDA8'; x.fillRect(450, 120, 1400, 900); for (let i = 0; i < 8; i++) { x.beginPath(); x.moveTo(470 + i * 170 + Math.sin(lt * 2 + i) * 20, 40); x.quadraticCurveTo(510 + i * 170, 26, 550 + i * 170, 40); x.lineWidth = 5; x.strokeStyle = '#BFE3F0'; x.stroke(); }
          x.save(); x.translate(1180, 300); poly(x, [[-10, 0], [10, 0], [6, -380], [-6, -380]]); ink(x, '#F4F0E6', 4); x.beginPath(); x.moveTo(-220, -300); x.quadraticCurveTo(0, -500, 220, -300); x.closePath(); ink(x, RED, 5); x.restore();
          TG.forEach(([tx, tt], i) => toon(x, tx, 330, 1.0, who[i][0], reach(TG[i]) ? 'cheer' : (i === 1 ? 'sit' : 'stand'), reach(TG[i]) ? 'laugh' : (i === 0 ? 'worried' : 'sad'), { t: lt + i, seed: i, flip: i === 2, itemR: reach(TG[i]) ? bot({ s: 0.36, open: true }) : null }));
          // the arm
          let pts = [[-2300, -320]], k = TG.findIndex(g => lt < g[1]); if (k < 0) k = 3; for (let i = 0; i < k; i++) pts.push([TG[i][0] - 120, -320]);
          const prevT = k === 0 ? 0 : TG[k - 1][1]; let tip; if (k < 3) { const u = E.inOut(seg(lt, prevT, TG[k][1])); const from = pts[pts.length - 1]; tip = [lerp(from[0], TG[k][0] + 50, u), lerp(from[1], 150, Math.sin(u * Math.PI / 2) ** 3)]; pts.push(tip); } else { tip = [2400, -320 - (lt - 2.55) * 300]; pts.push(tip); }
          x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) { const [a, b] = pts[i - 1], [p, q] = pts[i]; x.bezierCurveTo(a + (p - a) * 0.5, b - 60, a + (p - a) * 0.5, q - 60, p, q); }
          x.lineCap = 'round'; x.lineJoin = 'round'; x.lineWidth = 50; x.strokeStyle = INK; x.stroke(); x.lineWidth = 38; x.strokeStyle = W0.top; x.stroke();
          if (k < 3) { x.save(); x.translate(tip[0], tip[1]); P.bottle(x, 0, 70, 0.42, { kind: 'contour' }); const pv = pts[pts.length - 2], an = Math.atan2(tip[1] - pv[1], tip[0] - pv[0]); x.save(); x.rotate(an); rr(x, -50, -26, 30, 52, 8); ink(x, '#F4F0E6', 5); x.restore(); x.beginPath(); x.arc(0, 0, 30, 0, 6.28); ink(x, W0.skin, 5); x.restore(); } }]]);
      L.plate(ctx, "WITHIN AN ARM'S REACH OF DESIRE", 960, 110, pop(lt, rel(tS8, 'w2', 'within') - 0.1), { size: 56 });
    } },
  { name: 'w3 cartons carried six bottles home', t0: tS9, era: 'jazz', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const wx = lerp(-700, 420, E.inOut(seg(lt, 0.1, 3.2))), c = EN.cam([[0, -500, -120, 1.12], [3.3, 380, -110, 1.18]], lt), carX = lerp(-2400, 2600, seg(lt, 2.3, 3.4));
      EN.layers(ctx, c, [[0.3, x => { L.skyGrad(x, -2200, -1300, 4400, 1500, ERA.jazz.sky); L.cloud(x, -500 + lt * 14, -720, 1.1); }],
        [0.85, x => { K.cityRow(x, lt, { signs: ['GROCERY', 'DRUGS', 'BAKERY', 'HARDWARE', 'DINER', 'BARBER'], display0: (g, dx, dy, dw, dh) => { for (let i = 0; i < 3; i++) P.carton(g, dx + 70 + i * 120, dy + dh - 6, 0.55); } }); P.street(x, -2200, 200, 4400, 800, { col: '#A8A090', cobble: false }); }],
        [1, x => { toon(x, wx - 230, 340, 0.75, LOOKS.kid, 'walk', 'happy', { t: lt + 0.3 }); toon(x, wx, 340, 1.1, { ...LOOKS.woman, hat: 'boater', hatCol: '#F4C7C0', top: '#D9A0A0' }, 'walk', 'happy', { t: lt, itemR: g => P.carton(g, 10, 80, 0.95) }); }],
        [1.25, x => { P.lamppost(x, 900, 300, 1.2); K.car(x, carX, 380, 1.1, '#2F8A6A', lt); }]]);
      L.word(ctx, 'CARTONS', 960, 150, pop(lt, rel(tS9, 'w3', 'cartons') - 0.1), { size: 100 });
      L.plate(ctx, '6 BOTTLES HOME', 1500, 950, pop(lt, rel(tS9, 'w3', 'six') - 0.05), { size: 50, bg: YELLOW });
    } },
  { name: 'w3 coolers at gas stations', t0: tS10, era: 'jazz', out: { type: 'whip', dur: 0.28, dir: 1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -300, -120, 1.0], [2.1, 60, -140, 1.15]], lt), cx = lerp(-1900, -560, E.out(seg(lt, 0, 0.8))), lid = E.out(seg(lt, 0.9, 1.25)), took = lt > 1.3;
      EN.layers(ctx, c, [[0.35, x => K.countryside(x, lt)],
        [1, x => { K.road(x, 200); K.gasStation(x, lt); K.pump(x, -500, 230, 0.95); K.pump(x, -150, 230, 0.95, '#2F6DB5'); K.car(x, cx, 400, 1.05, '#8A2E2E', lt * (lt < 0.8 ? 1 : 0), { flip: false });
          K.cooler(x, 250, 340, 1.0, lid, lt); toon(x, 600, 360, 1.1, { ...LOOKS.lawyerB, hat: 'cap', hatCol: '#5A3A22' }, took ? 'drink' : 'point', took ? 'laugh' : 'happy', { t: lt, flip: true, itemR: took ? bot({ rot: 2.7, open: true, fill: 0.6 }) : null }); L.glow(x, -900, -700, 500, '#FFE07A', 0.4); }]]);
      L.word(ctx, 'COOLERS', 420, 160, pop(lt, rel(tS10, 'w3', 'Coolers') - 0.1), { size: 96 });
    } },
  { name: 'w3 vending machines', t0: tS11, era: 'jazz', out: { type: 'whip', dur: 0.28, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 40, -170, 1.25], [1.7, 80, -150, 1.12]], lt), coinU = seg(lt, 0.15, 0.5), drop = seg(lt, 0.75, 1.0), sh = EN.shake(lt, [0.55, 0.95], 6);
      EN.layers(ctx, c, [[0.6, x => { L.tiles(x, -2000, -1200, 4000, 1400, '#E6EEE9', '#D3DED8', 70); x.fillStyle = '#2F6A5A'; x.fillRect(-2000, -120, 4000, 30); P.clock(x, -280, -560, 70, lt * 3, { rim: '#2F6A5A' });
          rr(x, 480, -600, 420, 300, 8); ink(x, '#C8954F', 6); for (let i = 0; i < 5; i++) { x.save(); x.translate(530 + (i % 3) * 120, -560 + Math.floor(i / 3) * 130); x.rotate((hash(i) - 0.5) * 0.2); rr(x, 0, 0, 100, 110, 3); ink(x, ['#F4F0E6', '#F7C548', '#9CC7D8'][i % 3], 3); x.restore(); }
          K.window(x, -760, -420, 300, 380, (g, a, b, w, h) => { L.skyGrad(g, a, b, w, h, ERA.jazz.sky); L.cloud(g, a + 100 + lt * 20, b + 120, 0.6); }); K.plant(x, -1000, 230, 1.0); L.planks(x, -2000, 200, 4000, 900, '#9A8A70'); }],
        [1, x => { x.save(); x.translate(sh.x, 0); P.vending(x, 180, 330, 1.25, { text: 'COCA-COLA' }); if (drop > 0) P.bottle(x, 160 + 0, lerp(80, 270, E.in(drop)), 0.42, { kind: 'contour', rot: drop >= 1 ? 1.4 : 0 }); x.restore();
          toon(x, -300, 340, 1.15, { ...LOOKS.robinson, hair: { style: 'short', col: '#151313' }, skin: '#B97A4E', stache: 0 }, coinU > 0 && coinU < 1 ? 'point' : (drop >= 1 ? 'cheer' : 'stand'), drop >= 1 ? 'grin' : 'think', { t: lt });
          if (coinU > 0 && coinU < 1) P.coin(x, lerp(-150, 240, coinU), lerp(-60, -100, coinU) - Math.sin(coinU * Math.PI) * 120, 22, lt * 20); }]]);
      if (drop >= 1) P.bubble(ctx, 1380, 330, 260, 110, 'CLUNK!', { size: 50, tail: -80 });
      L.word(ctx, 'VENDING MACHINES', 960, 140, pop(lt, rel(tS11, 'w3', 'Vending') - 0.1), { size: 86 });
    } },
  { name: 'w3 ads everywhere', t0: tS12, era: 'jazz', out: { type: 'whip', dur: 0.3, dir: 1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -200, 1.15], [2.0, 0, -160, 0.98]], lt), ap = i => E.back(clamp((lt - 0.15 - i * 0.24) / 0.3), 2.2);
      EN.layers(ctx, c, [[0.3, x => { L.skyGrad(x, -2200, -1300, 4400, 1500, ERA.jazz.sky); L.cloud(x, -300 + lt * 20, -800, 1.2); }],
        [0.85, x => { K.cityRow(x, lt, { signs: ['GROCERY', 'DRUGS', 'BAKERY', 'NEWS', 'DINER', 'HOTEL'] }); P.street(x, -2200, 200, 4400, 800, { col: '#A8A090', cobble: false });
          const sign = (i, fn) => { const k = ap(i); if (k <= 0) return; x.save(); fn(k); x.restore(); };
          sign(0, k => { x.translate(-860, -560); x.scale(k, k); rr(x, -260, -90, 520, 180, 8); ink(x, RED, 6); fitText(x, 'DRINK COCA-COLA', 0, 0, 52, CREAM, 480); });
          sign(1, k => { x.translate(-1000, -300); x.scale(k, k); x.beginPath(); x.arc(0, 0, 80, 0, 6.28); ink(x, CREAM, 6); fitText(x, 'COCA-COLA', 0, 30, 18, RED, 110); x.beginPath(); x.moveTo(0, 0); x.lineTo(30, -40); x.moveTo(0, 0); x.lineTo(-10, 50); ink(x, null, 5); });
          sign(2, k => { x.translate(420, -600); x.scale(0.8 * k, 0.8 * k); rr(x, -330, -120, 660, 240, 6); ink(x, CREAM, 6); P.bottle(x, -220, 100, 0.85, { kind: 'contour', label: '' }); fitText(x, 'COCA-COLA', 60, -30, 64, RED, 400); fitText(x, 'DELICIOUS · REFRESHING', 60, 50, 26, INK, 400, { font: L.F.type }); });
          sign(3, k => { x.translate(860, -260); x.scale(k * 0.8, k * 0.8); rr(x, -60, -200, 120, 400, 30); ink(x, RED, 6); fitText(x, 'COCA', 0, -140, 30, CREAM, 100); fitText(x, 'COLA', 0, -105, 30, CREAM, 100); rr(x, -12, -60, 24, 220, 12); ink(x, '#F4F0E6', 4); rr(x, -6, 40, 12, 120, 6); ink(x, RED, 0); });
          sign(4, k => { x.translate(-260, 40); x.scale(k, k); ell(x, 0, 0, 80, 60); ink(x, RED, 5); ell(x, 0, 0, 62, 44); ink(x, CREAM, 3); P.bottle(x, 0, 36, 0.3, { kind: 'contour', label: '' }); }); }],
        [1, x => { const lookL = Math.floor(lt * 2.4) % 2 === 0; toon(x, 60, 360, 1.15, LOOKS.shopper, 'shock', 'shock', { t: lt, flip: lookL, look: lookL ? [-0.8, -0.6] : [0.8, -0.6] });
          P.truck(x, lerp(-2400, 2400, seg(lt, 0.9, 2.2)), 420, 0.9, { era: 1930, text: 'COCA-COLA', t: lt, load: true }); }]]);
      L.word(ctx, 'EVERYWHERE', 960, 940, pop(lt, rel(tS12, 'w3', 'everywhere') - 0.1), { size: 110 });
    } },
  { name: 'w3 the Santa paintings, 1931 (artist studio)', t0: tS13, era: 'jazz', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -220, -170, 1.0], [2.6, 0, -200, 1.12], [4.6, 120, -230, 1.3]], lt), rev = E.inOut(seg(lt, 0.4, 3.0)), wink = lt > 3.9 && lt < 4.4;
      EN.layers(ctx, c, [[0.6, x => K.studio(x, lt)],
        [1, x => { x.save(); x.translate(-900, 120); for (let i = 0; i < 5; i++) { rr(x, i * 70, -60 - (i % 2) * 20, 56, 60 + (i % 2) * 20, 6); ink(x, [RED, YELLOW, BLUE, '#F4F0E6', '#3E8E4A'][i], 4); } x.restore();
          K.easel(x, 220, 300, 1.0, (g, ex, ey, w, h) => { g.fillStyle = '#2F5A3E'; g.fillRect(ex - w / 2, ey - h / 2, w, h); for (let i = 0; i < 20; i++) { g.beginPath(); g.arc(ex - w / 2 + hash(i) * w, ey - h / 2 + hash(i * 3) * h * 0.5, 4, 0, 6.28); g.fillStyle = '#F4F0E6'; g.fill(); }
            g.save(); g.beginPath(); g.rect(ex - w / 2, ey + h / 2 - h * rev, w, h * rev); g.clip(); toon(g, ex, ey + 330, 1.25, K.SANTA, rev > 0.9 ? 'hold' : 'stand', wink ? 'wink' : 'laugh', { t: lt, noShadow: true, blink: false, itemR: rev > 0.9 ? bot({ s: 0.42, open: true }) : null }); g.restore();
            if (rev < 1) { g.beginPath(); g.moveTo(ex - w / 2, ey + h / 2 - h * rev); g.lineTo(ex + w / 2, ey + h / 2 - h * rev); g.lineWidth = 8; g.strokeStyle = RED; g.stroke(); } });
          const bx = Math.sin(lt * 9) * 0.25; toon(x, -330, 340, 1.15, K.PAINTER, { la: [0.45, -0.5], ra: [1.6 + bx, -0.4] }, rev >= 1 ? 'grin' : 'think', { t: lt, look: [0.8, -0.2], itemR: K.brush, itemL: K.palette }); }],
        [1.3, x => { rr(x, 900, 100, 400, 800, 8); ink(x, '#7A4A2A', 6); }]]);
      L.plate(ctx, 'CHRISTMAS ADS', 380, 140, pop(lt, rel(tS13, 'w3', 'paintings') - 0.1), { size: 52 });
      L.dateCard(ctx, '1931', 1560, 170, pop(lt, rel(tS13, 'w3', '1931') - 0.05));
    } },
  { name: 'w4 MYTH: invented the red Santa?', t0: tS14, era: 'jazz', out: { type: 'tear', dur: 0.5 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 40, -140, 1.12], [3.3, 40, -140, 1.25]], lt), uS = pop(lt, rel(tS14, 'w4', 'no') + 0.05, 0.22), shr = lt > rel(tS14, 'w4', 'invent') - 0.2;
      EN.layers(ctx, c, [[0.6, x => { L.wallpaper(x, -2000, -1200, 4000, 1400, '#7A2E2E', '#8A3A36', 60); L.planks(x, -2000, 220, 4000, 900, '#5A3420'); for (const lx of [-460, 460]) L.glow(x, lx, -700, 380, '#FFE3A0', 0.35); }],
        [1, x => { K.frame(x, -280, -170, 640, 720, '#2F5A3E', (g, fx, fy) => toon(g, fx, fy + 380, 1.4, K.SANTA, shr ? 'shrug' : 'hold', shr ? 'worried' : 'laugh', { t: lt, noShadow: true, itemR: shr ? null : bot({ s: 0.45, open: true }) }));
          rr(x, 160, -170, 620, 200, 10); ink(x, CREAM, 5); fitText(x, 'INVENTED', 470, -120, 54, INK, 560); fitText(x, 'THE RED SANTA?', 470, -50, 54, RED, 560);
          toon(x, 560, 360, 0.95, LOOKS.woman, 'think', uS > 0 ? 'shock' : 'think', { t: lt, flip: true }); }]]);
      K.stamp(ctx, 'MYTH', 1330, 760, uS, { size: 130, rot: -0.14 });
    } },
  { name: 'w4 red long before that (old magazine)', t0: tS15, era: 'sepia', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 100, -60, 1.0], [2.5, 0, -90, 1.15]], lt);
      EN.layers(ctx, c, [[0.6, x => { L.planks(x, -2000, -1200, 4000, 2400, '#8A5A33', { pw: 60 }); for (let i = 0; i < 30; i++) { const ph = (lt * 0.1 + hash(i)) % 1; x.save(); x.globalAlpha = 0.5 * Math.sin(ph * Math.PI); x.beginPath(); x.arc(-1200 + hash(i * 3) * 2400, 600 - ph * 1400, 4, 0, 6.28); x.fillStyle = '#FFF0C8'; x.fill(); x.restore(); } }],
        [1, x => { x.save(); x.translate(-200, -60); x.rotate(-0.06); rr(x, -330, -440, 660, 880, 6); ink(x, '#EFE2C2', 6); rr(x, -330, -440, 660, 130, 6); ink(x, '#7A4A2A', 6); fitText(x, 'CHRISTMAS ISSUE', 0, -375, 60, '#F4E8C8', 600);
            x.save(); rr(x, -290, -290, 580, 680, 4); x.clip(); x.fillStyle = '#E2C394'; x.fillRect(-300, -300, 600, 700); for (let i = 0; i < 40; i++) { x.beginPath(); x.moveTo(-300 + i * 16, -300); x.lineTo(-300 + i * 16 - 200, 400); x.lineWidth = 2; x.strokeStyle = 'rgba(90,52,32,0.18)'; x.stroke(); }
            toon(x, 0, 380, 1.45, { ...K.SANTA, build: 'thin', hat: null, hair: { style: 'short', col: '#E9E6E0' } }, 'carry', 'happy', { t: lt, noShadow: true, itemR: g => { x.save(); ell(g, -60, -40, 90, 70); ink(g, '#8A6A3A', 5); x.restore(); } }); x.restore();
            fitText(x, '10¢', 250, 360, 40, INK, 100); x.restore();
          x.save(); x.translate(460, 160); x.rotate(0.12); rr(x, -200, -140, 400, 280, 6); ink(x, '#F4E8C8', 5); x.save(); rr(x, -180, -120, 360, 240, 4); x.clip(); x.fillStyle = '#9CB0A0'; x.fillRect(-200, -140, 400, 280); toon(x, -40, 240, 0.85, { ...K.SANTA, build: 'thin' }, 'wave', 'happy', { t: lt + 1, noShadow: true }); x.restore(); fitText(x, 'SEASON\'S GREETINGS', 60, -90, 22, RED, 220, { font: L.F.type }); x.restore();
          x.save(); x.translate(lerp(380, 120, seg(lt, 0, 2.3)), lerp(-330, -160, seg(lt, 0, 2.3))); x.beginPath(); x.arc(0, 0, 110, 0, 6.28); ink(x, 'rgba(220,240,255,0.25)', 9); rr(x, 70, 70, 34, 170, 12); x.rotate(0); ink(x, '#5A3420', 5); x.restore(); }]]);
      L.plate(ctx, 'LONG BEFORE 1931', 1420, 150, pop(lt, rel(tS15, 'w4', 'long') - 0.1), { size: 60, bg: YELLOW });
    } },
  { name: 'w4 the warm, jolly Santa most people picture', t0: tS16, era: 'jazz', out: { type: 'whip', dur: 0.32, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -330, 1.7], [1.6, 0, -300, 1.45], [3.4, 0, -140, 0.95], [4.7, 0, -130, 0.92]], lt), tm = rel(tS16, 'w4', 'most') - 0.15;
      EN.layers(ctx, c, [[0.4, x => { L.skyGrad(x, -2200, -1400, 4400, 1700, ['#1E2A4A', '#5A6E9E']); for (let i = 0; i < 50; i++) { const sx = -2000 + hash(i) * 4000, sy = -1300 + ((hash(i * 3) * 1500 + lt * 60) % 1500); x.beginPath(); x.arc(sx, sy, 4, 0, 6.28); x.fillStyle = '#FFFFFF'; x.fill(); } }],
        [0.8, x => { L.bricks(x, -1400, -900, 2800, 1100, '#A65A3E'); x.beginPath(); x.rect(-1400, -900, 2800, 1100); ink(x, null, 6); for (const lx of [-900, 900]) { P.lamppost(x, lx, 210, 1.3, true); }
          rr(x, -420, -760, 840, 620, 10); ink(x, CREAM, 8); x.save(); rr(x, -400, -740, 800, 580, 6); x.clip(); x.fillStyle = '#2F5A3E'; x.fillRect(-400, -740, 800, 580); L.glow(x, 0, -450, 420, '#FFD58A', 0.55); toon(x, -60, -120, 1.35, K.SANTA, 'hold', lt > 1.2 ? 'laugh' : 'happy', { t: lt, noShadow: true, itemR: bot({ s: 0.45, open: true }) }); x.restore();
          fitText(x, 'COCA-COLA', 250, -230, 46, CREAM, 260); P.sparkles(x, 0, -450, 420, lt, 8, '#FFE3A0'); x.fillStyle = '#E9E3D6'; x.fillRect(-1400, 200, 2800, 900); }],
        [1, x => { P.crowd(x, -1150, 1150, 420, 0.9, 7, lt, { react: lt > tm ? 'cheer' : null, expr: 'happy', seed: 8 });
          for (let i = 0; i < 7; i++) { const u = pop(lt, tm + i * 0.1, 0.3); if (u <= 0) continue; const bx = lerp(-1150, 1150, i / 6) + (hash(i * 7.7 + 8) - 0.5) * 30; x.save(); x.translate(bx, -60); x.scale(E.back(u, 2), E.back(u, 2));
            for (const [dx, dy, r] of [[-20, 120, 10], [-8, 90, 16]]) { x.beginPath(); x.arc(dx, dy, r, 0, 6.28); ink(x, '#FFFFFF', 4); } ell(x, 0, 0, 100, 76); ink(x, '#FFFFFF', 5); x.save(); ell(x, 0, 0, 96, 72); x.clip(); toon(x, 0, 180, 0.62, K.SANTA, 'stand', 'laugh', { t: lt, noShadow: true }); x.restore(); x.restore(); } }]]);
      L.word(ctx, 'WARM, JOLLY SANTA', 960, 130, pop(lt, rel(tS16, 'w4', 'warm') - 0.1), { size: 84, col: CREAM });
    } },
  { name: 'w5 World War Two', t0: tS17, era: 'war', out: { type: 'whip', dur: 0.3, dir: 1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -200, -120, 1.12], [2.3, 100, -150, 1.0]], lt);
      EN.layers(ctx, c, [[0.3, x => { L.skyGrad(x, -2200, -1300, 4400, 1600, ['#4E5A60', '#A9A48A']); for (let i = 0; i < 3; i++) { x.save(); x.translate(-900 + i * 900, 300); x.rotate(Math.sin(lt * 0.8 + i * 2) * 0.35); x.globalAlpha = 0.18; x.fillStyle = '#FFF8D0'; poly(x, [[-30, 0], [30, 0], [220, -1500], [-220, -1500]]); x.fill(); x.restore(); } K.smokeFar(x, lt, 4); }],
        [0.6, x => { for (let i = 0; i < 10; i++) { const h = 200 + hash(i * 9) * 300, bx = -2000 + i * 420; rr(x, bx, 200 - h, 380, h + 100, 4); ink(x, '#4A5048', 4); for (let r = 0; r < h / 70 - 1; r++) for (let k = 0; k < 4; k++) { x.fillStyle = hash(i * 31 + r * 7 + k) > 0.7 ? '#E9C873' : '#3A403A'; x.fillRect(bx + 30 + k * 88, 240 - h + r * 70, 40, 34); } } for (let i = 0; i < 5; i++) K.plane(x, lerp(-1900, 1900, ((lt * 0.22 + i * 0.11) % 1.2) - 0.1) - i * 160, -560 + (i % 2) * 90 - i * 20, 0.8); }],
        [1, x => { x.fillStyle = '#7E7656'; x.fillRect(-2200, 200, 4400, 900); for (let i = 0; i < 7; i++) toon(x, -1200 + i * 330 + lt * 80, 360, 0.95, SOLDIERS[i % 4], 'walk', 'determined', { t: lt, ph: lt * 6 + (i % 2) * 0.1, seed: i }); }]]);
      L.word(ctx, 'WORLD WAR II', 960, 150, pop(lt, rel(tS17, 'w5', 'World') - 0.1), { size: 110, col: CREAM });
    } },
  { name: 'w5 1941: Woodruff makes a promise (telegram)', t0: tS18, era: 'war', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -120, -120, 1.05], [3.2, 0, -120, 1.12]], lt), uT = seg(lt, 0.5, 3.1);
      EN.layers(ctx, c, [[0.6, x => { K.office(x, lt, { wx: -450, fx: 1200, view: (g, a, b, w, h) => { L.skyGrad(g, a, b, w, h, ['#4E5A60', '#A9A48A']); for (let i = 0; i < 3; i++) K.plane(g, a + ((lt * 120 + i * 140) % (w + 200)) - 100, b + 80 + i * 60, 0.3); } });
          rr(x, 150, -600, 380, 440, 6); ink(x, '#E9DCC0', 5); x.save(); x.translate(340, -400); x.rotate(-0.02); fitText(x, 'BUY', 0, -150, 50, RED, 300); fitText(x, 'WAR', 0, -90, 50, RED, 300); fitText(x, 'BONDS', 0, -30, 50, RED, 300); for (let k = 0; k < 5; k++) { x.beginPath(); x.arc(-100 + k * 50, 80, 14, 0, 6.28); ink(x, k % 2 ? BLUE : RED, 3); } x.restore(); }],
        [1, x => { K.bigChair(x, -420, 330, 0.8); toon(x, -420, 200, 1.1, W0, lt > 1.4 ? 'fist' : 'think', 'determined', { t: lt, noShadow: true, talk: lt > 1.2 ? 0.7 : 0 }); K.desk(x, -420, 330, 760, { plate: 'R. W. WOODRUFF' });
          K.telegram(x, 430, -110, 760, 470, ['EVERY MAN IN UNIFORM', 'GETS A COKE FOR 5¢', 'WHEREVER HE IS', 'WHATEVER IT COSTS.'], uT, { head: 'PROMISE' }); }]]);
      L.dateCard(ctx, '1941', 300, 160, pop(lt, rel(tS18, 'w5', '1941') - 0.05));
    } },
  { name: 'w5 every man in uniform: a bottle for 5 cents', t0: tS19, era: 'war', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -260, -100, 1.08], [3.9, 160, -110, 1.14]], lt), tf = rel(tS19, 'w5', 'five');
      EN.layers(ctx, c, [[0.35, x => { L.skyGrad(x, -2200, -1300, 4400, 1500, ERA.war.sky); L.cloud(x, -600 + lt * 10, -650, 1.3, '#E9E6DA'); x.fillStyle = '#8A8F5C'; x.fillRect(-2200, 0, 4400, 900); K.tent(x, -1200, 120, 0.7); K.tent(x, 1200, 120, 0.6); }],
        [1, x => { x.fillStyle = '#8E8460'; x.fillRect(-2200, 200, 4400, 900); K.tent(x, 300, 240, 1.1, { sign: 'CANTEEN' }); toon(x, 300, 150, 0.95, K.NAVY, 'present', 'happy', { t: lt });
          rr(x, -60, 60, 760, 60, 6); ink(x, '#8A6A3A', 5); rr(x, -40, 120, 720, 150, 4); ink(x, '#7A5A30', 5); for (let i = 0; i < 6; i++) P.bottle(x, 0 + i * 60, 60, 0.3, { kind: 'contour', label: '' });
          for (let i = 0; i < 4; i++) { const xx = -300 - i * 230 + Math.min(lt, 3.6) * 60, got = i === 0 && lt > 0.8 || i === 1 && lt > 2.0; toon(x, xx, 360, 1.0, SOLDIERS[i], got ? 'cheer' : 'stand', got ? 'laugh' : 'happy', { t: lt + i, seed: i, itemR: got ? bot({ s: 0.36, open: true }) : null }); }
          if (lt > tf - 0.3) { const u = clamp((lt - tf + 0.3) / 0.6); P.coin(x, lerp(-260, 60, u), 40 - Math.sin(u * Math.PI) * 160, 30, lt * 14); } }]]);
      L.plate(ctx, 'EVERY MAN IN UNIFORM', 960, 120, pop(lt, rel(tS19, 'w5', 'uniform') - 0.1), { size: 56 });
      L.plate(ctx, '5¢', 1640, 300, pop(lt, tf - 0.05), { size: 120, bg: YELLOW, rot: 0.06 });
    } },
  { name: 'w5 wherever he was (jungle / desert / snow)', t0: tS20, era: 'war', out: { type: 'cut' }, draw(ctx, t, lt) {
      const PAN = [['#3E8E4A', '#2E6A3A', 'jungle'], ['#E9C27A', '#D9A85A', 'desert'], ['#E9F0F6', '#C9D6E2', 'snow']];
      PAN.forEach(([a, b, kind], i) => { const u = E.out(clamp((lt + 0.15 - i * 0.28) / 0.35)); if (u <= 0) return; const px = i * 640, off = (1 - u) * 1100;
        ctx.save(); ctx.translate(0, off); ctx.beginPath(); ctx.rect(px + 6, 0, 628, H); ctx.clip(); L.skyGrad(ctx, px, 0, 640, H, kind === 'snow' ? ['#9AB0C8', '#DDE6EE'] : kind === 'desert' ? ['#7FC3E8', '#F3D9A6'] : ['#6FA86A', '#B9D89A']);
        ctx.fillStyle = a; ctx.fillRect(px, 720, 640, 400); ctx.fillStyle = b; ctx.fillRect(px, 720, 640, 24);
        if (kind === 'jungle') for (let k = 0; k < 6; k++) { ctx.save(); ctx.translate(px + 40 + k * 110, 760); for (let j = 0; j < 5; j++) { ctx.save(); ctx.rotate(-1 + j * 0.5 + Math.sin(lt * 2 + k) * 0.05); ell(ctx, 0, -150, 26, 120); ink(ctx, j % 2 ? '#2E6A3A' : '#3E8E4A', 4); ctx.restore(); } ctx.restore(); }
        if (kind === 'desert') { for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(px - 100 + k * 300, 740); ctx.quadraticCurveTo(px + 60 + k * 300, 560, px + 240 + k * 300, 740); ink(ctx, '#E2B46A', 4); } ctx.beginPath(); ctx.arc(px + 520, 160, 60, 0, 6.28); ink(ctx, '#FFE07A', 4); }
        if (kind === 'snow') { for (let k = 0; k < 3; k++) { poly(ctx, [[px + 40 + k * 220, 740], [px + 140 + k * 220, 470], [px + 240 + k * 220, 740]]); ink(ctx, '#2E5A3E', 4); } for (let k = 0; k < 40; k++) { ctx.beginPath(); ctx.arc(px + hash(k) * 640, (hash(k * 3) * H + lt * 120) % H, 4, 0, 6.28); ctx.fillStyle = '#FFF'; ctx.fill(); } }
        toon(ctx, px + 320 + Math.sin(lt * 0.8 + i) * 20, 900, 1.25, { ...SOLDIERS[i], hat: kind === 'snow' ? 'cap' : 'helmet', hatCol: '#5E6640', top: kind === 'snow' ? '#E9E6DA' : '#6E7650' }, 'cheer', 'laugh', { t: lt + i, seed: i, itemR: bot({ s: 0.42, open: true }) });
        ctx.restore(); ctx.beginPath(); ctx.rect(px + 6, off + 6, 628, H - 12); ink(ctx, null, 12, { stroke: INK }); });
      L.word(ctx, 'WHEREVER HE WAS', 960, 160, pop(lt, 0.25), { size: 96, col: CREAM });
    } },
  { name: 'w5 whatever it cost the company', t0: tS21, era: 'war', out: { type: 'whip', dur: 0.3, dir: 1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -120, 1.15], [2.1, 60, -60, 1.0]], lt), tape = E.out(seg(lt, 0.1, 1.9)), uS = pop(lt, rel(tS21, 'w5', 'company') - 0.05, 0.22);
      EN.layers(ctx, c, [[0.6, x => K.office(x, lt, { wx: -700, fx: 1200 })],
        [1, x => { toon(x, -260, 190, 1.05, K.ACCOUNTANT, tape > 0.5 ? 'shock' : 'hold', tape > 0.4 ? 'shock' : 'worried', { t: lt, noShadow: true }); K.desk(x, -260, 330, 760);
          rr(x, -200, 20, 180, 100, 10); ink(x, '#5C6470', 5); for (let i = 0; i < 8; i++) { rr(x, -185 + (i % 4) * 40, 34 + Math.floor(i / 4) * 34, 30, 26, 5); ink(x, '#E9E3D6', 3); }
          x.beginPath(); x.moveTo(-110, 20); x.bezierCurveTo(-110, -200 * tape, 300 * tape, -120, 360 * tape + 60, 380 * tape); x.bezierCurveTo(600 * tape, 420, 900 * tape, 400, 1100 * tape, 420); x.lineWidth = 46; x.strokeStyle = INK; x.stroke(); x.lineWidth = 36; x.strokeStyle = '#F4F0E6'; x.stroke();
          for (let i = 0; i < 12; i++) { const p = i / 12; if (p > tape) break; fitText(x, ['$', '$$', '$$$'][i % 3], lerp(0, 1100 * tape, p), lerp(-60, 410, Math.min(1, p * 1.6)), 22, '#2E5A2A', 60); }
          toon(x, 600, 330, 1.05, W0, uS > 0 ? 'fist' : 'arms', 'smug', { t: lt, flip: true }); }]]);
      L.word(ctx, 'WHATEVER IT COST', 960, 150, pop(lt, 0.2), { size: 96 });
      K.stamp(ctx, 'APPROVED', 1460, 330, uS, { size: 70, col: '#2F8A6A', rot: 0.12 });
    } },
  { name: 'w6 shipping bottling equipment overseas (dock + crane)', t0: tS22, era: 'war', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -500, -260, 1.0], [3.8, 200, -220, 0.92]], lt), hook = lerp(-760, -380, E.inOut(seg(lt, 0.3, 2.6)));
      EN.layers(ctx, c, [[0.3, x => { L.skyGrad(x, -2400, -1400, 4800, 1700, ERA.war.sky); L.cloud(x, -800 + lt * 12, -800, 1.4, '#E9E6DA'); L.cloud(x, 900, -880, 1.0, '#E9E6DA'); for (let i = 0; i < 4; i++) { const ph = (lt * 0.4 + i * 0.25) % 1; x.beginPath(); x.moveTo(-1200 + ph * 2400, -700 + Math.sin(i) * 80); x.quadraticCurveTo(-1180 + ph * 2400, -720 + Math.sin(lt * 8 + i) * 12, -1160 + ph * 2400, -700 + Math.sin(i) * 80); x.quadraticCurveTo(-1140 + ph * 2400, -720 - Math.sin(lt * 8 + i) * 12, -1120 + ph * 2400, -700 + Math.sin(i) * 80); x.lineWidth = 5; x.strokeStyle = INK; x.stroke(); } }],
        [0.7, x => { K.sea(x, 40, lt); K.ship(x, 650, 120, 0.85, lt, { cargo: g => { K.equipCrate(g, -350, -150, 280, 200); K.equipCrate(g, -60, -150, 240, 170, 'BOTTLING EQUIPMENT', 'FRAGILE'); } }); }],
        [1, x => { K.dock(x, 220); K.warehouse(x); K.crane(x, -700, 230, 1.0, lt, hook, g => K.equipCrate(g, 0, 200, 300, 200)); P.crate(x, -1100, 300, 1.1, { n: 4, kind: 'contour', text: 'BOTTLES' });
          toon(x, -200, 380, 1.0, K.NAVY, 'wave', 'happy', { t: lt }); toon(x, 80, 390, 1.0, { ...K.NAVY, skin: '#F2C9A0', hair: { style: 'short', col: '#D9B25A' } }, 'point', 'determined', { t: lt + 1, flip: true }); }]]);
      L.plate(ctx, 'BOTTLING EQUIPMENT', 960, 950, pop(lt, rel(tS22, 'w6', 'bottling') - 0.1), { size: 60 });
    } },
  { name: 'w6 ...overseas (ship at sea)', t0: tS23, era: 'war', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -200, -150, 1.0], [1.5, 100, -150, 1.06]], lt);
      EN.layers(ctx, c, [[0.3, x => { L.skyGrad(x, -2400, -1400, 4800, 1500, ['#7FA3B8', '#D8D2B8']); L.cloud(x, -300 - lt * 30, -700, 1.3, '#F0EEE6'); L.cloud(x, 900 - lt * 20, -800, 1.0, '#F0EEE6'); }],
        [0.6, x => { K.sea(x, 0, lt, '#4E7088'); }],
        [1, x => { K.ship(x, -100 + lt * 120, 230, 0.95, lt, { cargo: g => { K.equipCrate(g, -380, -150, 280, 200); K.equipCrate(g, -80, -150, 240, 170); K.equipCrate(g, 170, -150, 160, 140, 'BOTTLES', 'HANDLE WITH CARE'); } }); K.sea(x, 290, lt * 1.6, '#3E6078'); }]]);
      L.word(ctx, 'OVERSEAS', 960, 150, pop(lt, rel(tS23, 'w6', 'overseas') - 0.05), { size: 110, col: CREAM });
    } },
  { name: 'w6 64 bottling plants (war-room map)', t0: tS24, era: 'war', out: { type: 'whip', dur: 0.3, dir: 1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -60, 0.95], [3.6, 120, -40, 1.12]], lt), tp = rel(tS24, 'w6', 'plants'), n = Math.round(64 * clamp((lt - 0.5) / (tp - 0.5)));
      EN.layers(ctx, c, [[0.6, x => { L.planks(x, -2200, -1300, 4400, 2600, '#6B5A40', { vertical: true, pw: 80 }); for (const lx of [-900, 900]) { x.beginPath(); x.moveTo(lx, -1300); x.lineTo(lx, -720); ink(x, null, 4); ell(x, lx, -700, 60, 30); ink(x, '#5E6640', 5); L.glow(x, lx, -680, 400, '#FFE3A0', 0.35); } }],
        [1, x => { K.worldMap(x, -860, -560, 1720, 760, { land: '#D8CFA6', sea: '#9AB8C0', after: g => { for (let i = 0; i < n; i++) { const [px, py] = K.mapXY(-860, -560, 1720, 760, PINS[i][0], PINS[i][1]); K.pin(g, px, py, clamp((lt - 0.5 - i * (tp - 0.5) / 64) / 0.25), RED, 0.9); } } });
          toon(x, -980, 380, 1.1, { ...SOLDIERS[0], hat: 'army', top2: null }, 'point', 'determined', { t: lt, look: [0.8, -0.6] }); x.beginPath(); x.moveTo(-900, 180); x.lineTo(-560 + Math.sin(lt * 2) * 30, -160); x.lineWidth = 8; x.strokeStyle = '#8A5A33'; x.stroke(); }]]);
      L.plate(ctx, `${n} BOTTLING PLANTS`, 960, 960, n > 0 ? 1 : 0, { size: 76, bg: n >= 64 ? RED : CREAM, fg: n >= 64 ? CREAM : INK });
      L.plate(ctx, 'DURING THE WAR', 300, 120, pop(lt, 0.1), { size: 40, bg: YELLOW });
    } },
  { name: 'w6 as close to the fighting as possible (tent plant)', t0: tS25, era: 'war', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -160, -140, 1.1], [2.4, 80, -120, 1.0]], lt), fl = [0.6, 1.7].map(h => clamp(1 - Math.abs(lt - h) / 0.2));
      EN.layers(ctx, c, [[0.3, x => { L.skyGrad(x, -2200, -1300, 4400, 1600, ['#6E6A60', '#C9B890']); for (const [k, f] of fl.entries()) if (f > 0) L.glow(x, -1100 + k * 1700, 60, 500, '#FFB070', f * 0.8); K.smokeFar(x, lt, 5); for (let i = 0; i < 3; i++) K.plane(x, lerp(1900, -1900, ((lt * 0.3 + i * 0.3) % 1)), -650 + i * 70, 0.5); }],
        [0.7, x => { x.fillStyle = '#7A7050'; x.fillRect(-2200, 60, 4400, 900); for (let i = 0; i < 5; i++) { x.beginPath(); x.moveTo(-1900 + i * 800, 120); for (let k = 0; k < 8; k++) x.lineTo(-1900 + i * 800 + k * 60, 120 + (k % 2) * 30); ink(x, null, 4); } }],
        [1, x => { x.fillStyle = '#8A7A56'; x.fillRect(-2200, 200, 4400, 900); for (let i = 0; i < 14; i++) { ell(x, -1800 + i * 280, 520 + hash(i) * 200, 90, 18); ink(x, '#6A5A3E', 0); }
          K.tent(x, 0, 300, 1.25, { sign: 'BOTTLING PLANT', inside: g => { g.fillStyle = '#3A3428'; g.fillRect(-200, -300, 400, 300); K.bottler(g, 0, -10, 0.55, lt); } });
          toon(x, -720, 380, 1.0, SOLDIERS[1], 'carry', 'determined', { t: lt, itemR: g => P.crate(g, 0, 60, 0.55, { n: 3, kind: 'contour' }) }); toon(x, 700, 390, 1.0, SOLDIERS[2], 'cheer', 'laugh', { t: lt + 1, flip: true, itemR: bot({ s: 0.36, open: true }) });
          P.crate(x, 460, 400, 0.9, { n: 4, kind: 'contour' }); P.crate(x, 520, 330, 0.8, { n: 3, kind: 'contour' }); }],
        [1.3, x => { for (let i = 0; i < 6; i++) { ell(x, -1500 + i * 600, 760, 220, 70); ink(x, '#B8A878', 5); } }]]);
      L.plate(ctx, 'AS CLOSE TO THE FIGHTING AS POSSIBLE', 960, 120, pop(lt, rel(tS25, 'w6', 'close') - 0.1), { size: 50 });
    } },
  { name: 'w7 millions of soldiers came home loving the drink', t0: tS26, era: 'pop', out: { type: 'whip', dur: 0.3, dir: 1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -180, 1.2], [3.6, 0, -120, 0.98]], lt);
      EN.layers(ctx, c, [[0.3, x => { L.skyGrad(x, -2200, -1300, 4400, 1500, ERA.pop.sky); L.cloud(x, -700 + lt * 20, -750, 1.3); L.cloud(x, 800, -820, 1.0); }],
        [0.55, x => { K.sea(x, -20, lt, '#3F7FB0'); K.ship(x, 300, 60, 0.8, lt, { hull: '#7E868C' }); x.save(); x.translate(300, -440); for (let i = 0; i < 9; i++) { x.save(); x.rotate(-0.5 + i * 0.12); rr(x, -6, -260, 12, 200, 3); ink(x, [RED, CREAM, BLUE][i % 3], 0); x.restore(); } x.restore(); }],
        [0.85, x => { L.planks(x, -2400, 160, 4800, 900, '#8A7050', { vertical: true, pw: 60 }); P.crowd(x, -1500, 1500, 300, 0.72, 13, lt, { react: 'cheer', seed: 21 }); }],
        [1, x => { for (let i = 0; i < 4; i++) toon(x, -560 + i * 380, 470 + (i % 2) * 20, 1.05, SOLDIERS[i], i % 2 ? 'cheer' : 'wave', 'laugh', { t: lt + i, seed: i, itemR: i % 2 ? bot({ s: 0.38, open: true }) : null, itemL: i % 2 ? null : g => P.bottle(g, 0, 40, 0.38, { kind: 'contour' }) }); confetti(x, -1500, 1500, -1000, lt, 80); }]]);
      L.word(ctx, 'MILLIONS', 960, 150, pop(lt, rel(tS26, 'w7', 'Millions') - 0.05), { size: 110 });
      L.plate(ctx, 'LOVING THE DRINK', 960, 950, pop(lt, rel(tS26, 'w7', 'loving') - 0.1), { size: 56, bg: RED, fg: CREAM });
    } },
  { name: 'w7 a head start in dozens of countries', t0: tS27, era: 'pop', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -200, -80, 1.25], [4.6, 0, -40, 0.96]], lt);
      EN.layers(ctx, c, [[0.4, x => { L.skyGrad(x, -2200, -1300, 4400, 2600, ['#2F4A7A', '#5A7AB0']); for (let i = 0; i < 60; i++) { x.beginPath(); x.arc(-2000 + hash(i) * 4000, -1200 + hash(i * 2.3) * 2400, 2 + hash(i * 5) * 3, 0, 6.28); x.fillStyle = '#F6EBD3'; x.fill(); } }],
        [1, x => { K.worldMap(x, -900, -440, 1800, 800, { land: '#E9D6A6', sea: '#7FB8D8', frame: '#3A2A1E', after: g => {
            SPREAD.forEach(([lo, la], i) => { const u = clamp((lt - 0.4 - i * 0.09) / 0.3); if (u <= 0) return; const [px, py] = K.mapXY(-900, -440, 1800, 800, lo, la); g.save(); g.translate(px, py); const k = E.back(u, 2.4); g.scale(k, k); g.beginPath(); g.arc(0, 0, 26, 0, 6.28); ink(g, RED, 3); P.bottle(g, 0, 18, 0.15, { kind: 'contour', label: '' }); g.restore(); });
            const sx = lerp(-860, 860, E.inOut(seg(lt, rel(tS27, 'w7', 'head') - 0.4, 4.3))); g.save(); g.globalAlpha = 0.25; g.fillStyle = '#FFF8D0'; g.fillRect(sx - 30, -440, 60, 800); g.restore(); } }); }]]);
      L.word(ctx, 'HEAD START', 960, 130, pop(lt, rel(tS27, 'w7', 'head') - 0.1), { size: 96 });
      L.plate(ctx, 'DOZENS OF COUNTRIES', 960, 960, pop(lt, rel(tS27, 'w7', 'dozens') - 0.1), { size: 64, bg: RED, fg: CREAM });
    } },
  { name: 'w7 went global by following the army', t0: tS28, era: 'pop', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -40, 1.45], [3.7, 0, 20, 1.1]], lt);
      EN.layers(ctx, c, [[0.3, x => { L.skyGrad(x, -2200, -1300, 4400, 2600, ['#0E1A3A', '#2B3B70']); for (let i = 0; i < 90; i++) { x.beginPath(); x.arc(-2000 + hash(i) * 4000, -1200 + hash(i * 2.3) * 2400, 2 + hash(i * 5) * 3, 0, 6.28); x.fillStyle = '#F6EBD3'; x.fill(); } }],
        [1, x => { globe(x, 0, 380, 520, lt * 2); for (let i = 0; i < 6; i++) { const a = -2.25 + i * 0.17 + lt * 0.09, rx = Math.cos(a) * 520, ry = 380 + Math.sin(a) * 520; x.save(); x.translate(rx, ry); x.rotate(a + Math.PI / 2);
            if (i < 5) toon(x, 0, 0, 0.55, SOLDIERS[i % 4], 'walk', 'determined', { t: lt, ph: lt * 7, seed: i, noShadow: true }); else bottleWalker(x, 0, 0, 0.9, lt); x.restore(); }
          P.sparkles(x, 0, 380, 600, lt, 10); }]]);
      L.plate(ctx, 'WENT GLOBAL', 960, 850, pop(lt, rel(tS28, 'w7', 'global') - 0.1), { size: 80, bg: RED, fg: CREAM });
      L.plate(ctx, 'BY FOLLOWING THE ARMY', 960, 970, pop(lt, rel(tS28, 'w7', 'following') - 0.1), { size: 54 });
    } },
];
// Candler family walking in to the vault (scene 1)
function HEIRS(x, lt) { K.HEIR.forEach((lk, i) => { const u = E.out(seg(lt, 2.7 + i * 0.2, 4.4 + i * 0.2)); if (u <= 0) return; const xx = lerp(-1500, -600 + i * 150, u); toon(x, xx + i * 30 - 30, 340, 0.95, lk, u < 1 ? 'walk' : 'shock', lt > 4.3 ? 'shock' : 'neutral', { t: lt + i, seed: i, look: [0.8, -0.3] }); }); }

EN.run({ module, dir: __dirname, TL, scenes, card: { n: 'CHAPTER 4', title: 'Everywhere', sub: '1919–1945', era: 'jazz' },
  cues: () => [['stamp', at('w1', '1919') + 0.05, 0.5], ['clank', 3.75, 0.6], ['rumble', 3.9, 0.4], ['sparkle', 4.6, 0.5], ['whoosh', tS2 - 0.15, 0.4], ['paper', tS2 + 0.3, 0.6], ['stamp', tS2 + 0.35, 0.8],
    ['whoosh', tS3 - 0.15, 0.4], ['ding', tS3 + 0.55, 0.4], ['engine', tS4 + 0.05, 0.5], ['brake', tS4 + 0.85, 0.5], ['coins', at('w1', 'twenty') - 0.1, 0.6], ['kaching', at('w1', 'dollars') + 0.3, 0.7],
    ['tear', tS5 - 0.2, 0.5], ['flip', tS5 + 0.2, 0.4], ['steps', tS5 + 0.4, 0.4], ['boing', at('w2', 'took') + 0.15, 0.6], ['tick', tS6 + 0.2, 0.3], ['stamp', tS6 + 0.6, 0.35], ['stamp', tS6 + 1.2, 0.35], ['stamp', tS6 + 1.8, 0.35],
    ['scratch', at('w2', 'easy') - 0.05, 0.5], ['scratch', at('w2', 'hard') - 0.05, 0.5], ['whoosh', tS8 - 0.15, 0.4], ['slideup', tS8 + 0.2, 0.5], ['pop', tS8 + 0.75, 0.6], ['pop', tS8 + 1.65, 0.6], ['pop', tS8 + 2.55, 0.6],
    ['steps', tS9 + 0.2, 0.4], ['clink', at('w3', 'six'), 0.5], ['horn', tS9 + 2.5, 0.4], ['brake', tS10 + 0.6, 0.5], ['fizz', tS10 + 1.3, 0.6], ['clink', tS11 + 0.45, 0.5], ['clank', tS11 + 0.95, 0.7],
    ['pop', tS12 + 0.2, 0.4], ['pop', tS12 + 0.44, 0.4], ['pop', tS12 + 0.68, 0.4], ['pop', tS12 + 0.92, 0.4], ['pop', tS12 + 1.16, 0.4], ['bell', tS13 + 0.2, 0.3], ['sparkle', at('w3', '1931'), 0.6],
    ['buzzer', at('w4', 'no') + 0.05, 0.5], ['stamp', at('w4', 'no') + 0.05, 0.9], ['tear', tS15 - 0.2, 0.5], ['paper', tS15 + 0.3, 0.4], ['whoosh', tS16 - 0.16, 0.4], ['sparkle', at('w4', 'warm'), 0.5], ['pop', at('w4', 'most') - 0.1, 0.5], ['crowdcheer', at('w4', 'most'), 0.35],
    ['whoosh', tS17 - 0.15, 0.4], ['plane', tS17 + 0.1, 0.5], ['steps', tS17 + 0.5, 0.4], ['stamp', at('w5', '1941'), 0.5], ['typewriter', tS18 + 0.5, 0.4], ['typewriter', tS18 + 1.6, 0.4], ['typewriter', tS18 + 2.5, 0.35],
    ['clink', tS19 + 0.8, 0.5], ['clink', tS19 + 2.0, 0.5], ['kaching', at('w5', 'five') + 0.3, 0.6], ['whoosh', tS20, 0.4], ['whoosh', tS20 + 0.28, 0.4], ['whoosh', tS20 + 0.56, 0.4],
    ['print', tS21 + 0.1, 0.5], ['gasp', tS21 + 0.7, 0.5], ['stamp', at('w5', 'company'), 0.8], ['horn', tS22 + 0.2, 0.5], ['machine', tS22 + 0.5, 0.3], ['thump', tS22 + 2.6, 0.6], ['wind', tS23, 0.4],
    ['tick', tS24 + 0.6, 0.3], ['tick', tS24 + 1.0, 0.3], ['tick', tS24 + 1.4, 0.3], ['tick', tS24 + 1.8, 0.3], ['ding', at('w6', 'plants') + 0.1, 0.6], ['boom', tS25 + 0.6, 0.25], ['factory', tS25 + 0.4, 0.3], ['boom', tS25 + 1.7, 0.2],
    ['horn', tS26 + 0.1, 0.5], ['crowdcheer', tS26 + 0.3, 0.5], ['pop', tS27 + 0.5, 0.35], ['pop', tS27 + 1.2, 0.35], ['pop', tS27 + 1.9, 0.35], ['pop', tS27 + 2.6, 0.35], ['steps', tS28 + 0.2, 0.4], ['sparkle', at('w7', 'global'), 0.6]],
  music: [[0, 'ragtime'], [tS5, 'up'], [tS13, 'light'], [tS17, 'march'], [tS26, 'build']] });
