// Chapter 2 — "The Salesman" (a1–a6): Asa Candler buys up the pieces, gives the drink away with free-glass tickets, puts the name on everything,
// sells it in every state, the cocaine is taken out of the extract, and two visitors knock on his door.
const L = require('../../../kit/look'), P = require('../../../kit/props'), { toon, LOOKS } = require('../../../kit/toon'), EN = require('../../../kit/engine');
const K = require('./atlantakit'), { PEOPLE } = K;
const { W, H, INK, CREAM, RED, YELLOW, BLUE, ERA, ink, rr, ell, poly, clamp, lerp, seg, E, hash } = L;
const TL = EN.timeline(__dirname, { start: 3.0, gap: 0.55 }), at = TL.at, begin = TL.begin;
const pop = (t, t0, d = 0.35) => clamp((t - t0) / d);
const CAND = LOOKS.candler;

// ---------- the torn deed (4 pieces that fit together) ----------
const DW = 360, DH = 460;
const vcut = [], hcut = []; for (let y = -DH / 2 - 6; y <= DH / 2 + 6; y += 28) vcut.push([(hash(y * 0.37) * 2 - 1) * 14, y]); for (let x = -DW / 2 - 6; x <= DW / 2 + 6; x += 28) hcut.push([x, (hash(x * 0.53 + 9) * 2 - 1) * 14]);
function qPoly(q) { const vt = vcut.filter(p => p[1] < 0), vb = vcut.filter(p => p[1] > 0), hl = hcut.filter(p => p[0] < 0), hr = hcut.filter(p => p[0] > 0), a = DW / 2 + 6, b = DH / 2 + 6;
  if (q === 0) return [[-a, -b], ...vt, [0, 0], ...hl.slice().reverse()];
  if (q === 1) return [[a, -b], ...vt, [0, 0], ...hr];
  if (q === 2) return [[-a, b], ...hl, [0, 0], ...vb];
  return [[a, b], ...vb.slice().reverse(), [0, 0], ...hr]; }
function deed(ctx) { K.doc(ctx, 0, 0, DW, DH, { title: 'COCA-COLA', lines: 8, draw: g => { g.beginPath(); g.arc(DW * 0.28, DH * 0.33, 40, 0, 6.27); ink(g, RED, 4); L.fitText(g, 'SEAL', DW * 0.28, DH * 0.33, 20, CREAM, 60); } }); }
const qc = q => [q % 2 ? DW / 4 : -DW / 4, q < 2 ? -DH / 4 : DH / 4];
function piece(ctx, x, y, q, s = 1, rot = 0) { const c = qc(q); ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.translate(-c[0], -c[1]);
  ctx.save(); poly(ctx, qPoly(q)); ctx.clip(); deed(ctx); ctx.restore(); ctx.save(); poly(ctx, qPoly(q)); ctx.clip(); poly(ctx, qPoly(q)); ink(ctx, null, 7); ctx.restore(); ctx.restore(); }

// ---------- small local helpers ----------
function house(ctx, x, y, doorOpen, t) { // wooden house front with a door that can slam (doorOpen 0..1)
  L.planks(ctx, x - 700, y - 640, 1400, 640, '#C9B48A', { pw: 30 }); ctx.beginPath(); ctx.rect(x - 700, y - 640, 1400, 640); ink(ctx, null, 6);
  for (const wx of [-560, 260]) { rr(ctx, x + wx, y - 520, 260, 220, 6); ink(ctx, '#9CC7D8', 5); ctx.beginPath(); ctx.moveTo(x + wx + 130, y - 520); ctx.lineTo(x + wx + 130, y - 300); ctx.moveTo(x + wx, y - 410); ctx.lineTo(x + wx + 260, y - 410); ink(ctx, null, 4); rr(ctx, x + wx - 40, y - 530, 40, 240, 4); ink(ctx, '#2E5A3E', 4); rr(ctx, x + wx + 260, y - 530, 40, 240, 4); ink(ctx, '#2E5A3E', 4); }
  rr(ctx, x - 140, y - 430, 280, 430, 6); ink(ctx, '#2A1E18', 6); // dark doorway
  const dw = 260 * (1 - doorOpen * 0.82); rr(ctx, x - 130, y - 420, dw, 420, 4); ink(ctx, '#7A3A2A', 5); if (dw > 80) { rr(ctx, x - 130 + dw * 0.15, y - 380, dw * 0.7, 150, 4); ink(ctx, '#8E4A38', 3); rr(ctx, x - 130 + dw * 0.15, y - 200, dw * 0.7, 150, 4); ink(ctx, '#8E4A38', 3); } ctx.beginPath(); ctx.arc(x - 130 + dw - 22, y - 210, 9, 0, 6.27); ink(ctx, '#D8B04A', 3);
  poly(ctx, [[x - 760, y - 640], [x + 760, y - 640], [x + 600, y - 780], [x - 600, y - 780]]); ink(ctx, '#6A3A2A', 6); rr(ctx, x - 760, y - 20, 1520, 40, 6); ink(ctx, '#9A8A70', 5); }
function stageRow(ctx, t, lit, only) { // nine people on a little stage; only one lit
  const looks = [PEOPLE.gent, PEOPLE.lady, PEOPLE.gent2, PEOPLE.kid, LOOKS.woman, PEOPLE.gent3, PEOPLE.lady2, PEOPLE.mailman, LOOKS.shopper];
  looks.forEach((lk, i) => { const x = -840 + i * 210, me = i === 4; if (me !== !!only) return; toon(ctx, x, 300, 1.0, lk, me && lit > 0.5 ? 'drink' : (i % 3 === 0 ? 'arms' : 'stand'), me && lit > 0.5 ? 'happy' : 'neutral', { t: t + i, seed: i, itemR: me && lit > 0.5 ? g => { g.rotate(2.8); P.glassCup(g, 0, 30, 0.42, { fill: 0.6 }); } : null });
    L.fitText(ctx, String(i + 1), x, -40, 50, me ? YELLOW : '#CFC6B4', 80, { outline: 8 }); }); }

// ---------- scene times (cut on stressed words) ----------
const s1 = 0, s2 = at('a1', 'asa') - 0.12, s3 = at('a1', 'by') - 0.12, s4 = at('a1', 'total') - 0.12,
  s5 = begin('a2') - 0.2, s6 = at('a2', 'salesman') - 0.15, s7 = at('a2', 'nobody') - 0.12,
  s8 = begin('a3') - 0.15, s9 = at('a3', 'mailed') - 0.12, s10 = at('a3', 'by') - 0.12, s11 = at('a3', 'about') - 0.12,
  s12 = begin('a4') - 0.15, s13 = at('a4', 'clocks') - 0.15, s14 = at('a4', 'anything') - 0.12,
  s15 = begin('a5') - 0.15, s16 = at('a5', 'and') - 0.12, s17 = begin('a6') - 0.15, s18 = at('a6', 'now') - 0.12;
const W_ = (id, w, n) => at(id, w, n);

const scenes = [
  { name: 'Atlanta street: the buyers hold the pieces', t0: s1, era: 'sepia', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -120, -80, 1.0], [3, -60, -60, 1.08], [s2 - s1, 40, -40, 1.14]], lt);
      const fly = i => clamp((lt - (3.3 + i * 0.55)) / 0.5);
      EN.layers(ctx, c, [[0.3, x => { K.sky(x, ERA.sepia.sky, lt, { sun: [700, -560] }); K.skyline(x, 120, '#D9B894', 1); }],
        [0.7, x => { K.streetRow(x, -1900, 220, { seed: 2, shops: [['DRY GOODS', '#A65A3E', ['#2E5A3E', CREAM]], ['DRUGS', '#B8714C', [RED, CREAM]], ['OFFICES', '#8E5A3E', null], ['HATS', '#9A6A4A', [YELLOW, '#5A3420']], ['BANK', '#7E5A48', null], ['FEED & SEED', '#A65A3E', ['#2E5A3E', CREAM]]] }); }],
        [1, x => { P.street(x, -2000, 200, 4000, 700, { col: '#A08A68' }); P.lamppost(x, 980, 230, 1);
          const cx = Math.min(-560, -1000 + lt * 300); toon(x, cx, 330, 1.12, CAND, lt < 1.45 ? 'walk' : fly(2) > 0.9 ? 'cheer' : 'present', fly(0) > 0 ? 'grin' : 'smug', { t: lt });
          [[-130, PEOPLE.gent, 0], [250, PEOPLE.gent2, 1], [630, PEOPLE.gent3, 2]].forEach(([bx, lk, i]) => { const f = fly(i); const hnd = toon(x, bx, 330, 1.05, lk, f > 0 ? 'shrug' : 'present', f > 0 ? 'happy' : 'neutral', { t: lt + i, seed: i, flip: true }).hand;
            const tx = cx + (i - 1) * 70, ty = -230 - i * 8, u = E.inOut(f); const px = lerp(hnd[0] - 30, tx, u), py = lerp(hnd[1] - 60, ty, u) - Math.sin(u * Math.PI) * 220; piece(x, px, py, i + 1, 0.6, lerp(0.3 - i * 0.2, 0, u) + Math.sin(lt * 3 + i) * 0.05 * (1 - u)); if (f > 0 && f < 1) P.speedLines(x, px - 100, py - 40, 200, 80, lt, 1, 0.3); });
          piece(x, cx - 70, -232, 0, 0.6, -0.05); }],
        [1.3, x => { P.crate(x, -1250, 560, 1.2, { n: 4, kind: 'straight' }); }]]);
      L.word(ctx, 'THE BUYERS', 960, 140, pop(lt, W_('a1', 'buyers') - s1), { size: 80, col: CREAM });
    } },
  { name: 'meet Asa Candler', t0: s2, era: 'sepia', out: { type: 'whip', dur: 0.28, dir: 1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -120, 1.35], [s3 - s2, 0, -150, 1.55]], lt);
      EN.layers(ctx, c, [[0.6, x => K.office(x, lt, { winX: -1000, bookX: 500 })],
        [1, x => { toon(x, 0, 120, 1.3, CAND, lt < 0.6 ? 'arms' : 'think', 'smug', { t: lt, look: [0.3, 0] }); K.desk(x, 0, 120, 1300); K.lamp(x, -420, 96, 1.1); K.inkwell(x, 380, 96); P.bills(x, 200, 80, 0.7, 3); if (lt > 0.7) P.sparkles(x, -40, -330, 50, lt, 4, '#FFFFFF'); }]]);
      L.plate(ctx, 'ASA CANDLER', 960, 930, pop(lt, 0.1), { size: 74, bg: CREAM });
    } },
  { name: '1891: the pieces snap into one', t0: s3, era: 'sepia', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -100, 1.1], [s4 - s3, 0, -130, 1.22]], lt), sn = W_('a1', 'whole') - s3, sh = EN.shake(lt, [sn + 0.3], 10);
      EN.layers(ctx, { ...c, x: c.x + sh.x, y: c.y + sh.y }, [[0.6, x => K.office(x, lt, { winX: 300, picX: -700, bookX: -1500 })],
        [1, x => { toon(x, -480, 160, 1.15, CAND, lt > sn + 0.3 ? 'cheer' : 'hold', lt > sn + 0.3 ? 'laugh' : 'determined', { t: lt }); K.desk(x, 0, 160, 1400);
          for (let q = 0; q < 4; q++) { const u = E.inOut(clamp((lt - 0.4 - q * 0.35) / (sn + 0.3 - 0.4 - q * 0.35))), from = [[-900, -700], [900, -700], [-900, 500], [900, 500]][q], c0 = qc(q);
            piece(x, lerp(from[0], 250 + c0[0] * 0.95, u), lerp(from[1], -90 + c0[1] * 0.95, u), q, 0.95, (1 - u) * (q % 2 ? 1 : -1) * 1.2); }
          P.burst(x, 250, -90, 340, clamp((lt - sn - 0.3) / 0.5), CREAM); if (lt > sn + 0.3) P.sparkles(x, 250, -90, 260, lt, 8); }]]);
      L.dateCard(ctx, '1891', 1620, 150, pop(lt, W_('a1', '1891') - s3));
      L.word(ctx, 'THE WHOLE THING', 960, 960, pop(lt, sn), { size: 92, col: YELLOW });
    } },
  { name: 'the price: about $2,300', t0: s4, era: 'sepia', out: { type: 'whip', dur: 0.3, dir: 1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -60, 1.25], [s5 - s4, 80, -80, 1.38]], lt), tw = W_('a1', 'two') - s4, n = Math.floor(clamp((lt - 0.3) / (tw)) * 23);
      EN.layers(ctx, c, [[0.6, x => K.office(x, lt, { winX: -1200, picX: 600, bookX: 1000, clock: [-200, -560] })],
        [1, x => { toon(x, -480, 140, 1.15, CAND, lt < tw ? 'point' : 'present', lt < tw ? 'think' : 'smug', { t: lt, look: [0.6, 0.2] }); K.desk(x, 0, 140, 1500); K.lamp(x, 640, 116, 1.0);
          for (let i = 0; i < n; i++) { const col = i % 5, row = Math.floor(i / 5), k = clamp((lt - 0.3 - i * tw / 23) / 0.25); x.save(); x.translate(-120 + row * 170, 110 - col * 12 - (1 - E.out(k)) * 200); x.globalAlpha = k; P.bills(x, 0, 0, 0.7, 1); x.restore(); }
          for (let i = 0; i < 6; i++) P.coin(x, 560 - i * 4, 106 - i * 11, 30, 0, '$'); }]]);
      L.plate(ctx, 'ABOUT $2,300', 960, 170, pop(lt, tw), { size: 110, bg: RED, fg: CREAM });
      L.plate(ctx, 'BY THE USUAL COUNT', 960, 300, pop(lt, W_('a1', 'usual') - s4), { size: 44, rot: 0.02 });
    } },
  { name: 'not a chemist', t0: s5, era: 'sepia', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -80, -100, 1.2], [s6 - s5, 40, -120, 1.3]], lt), tc = W_('a2', 'chemist') - s5, boom = clamp((lt - tc + 0.25) / 0.6);
      EN.layers(ctx, c, [[0.6, x => { L.wallpaper(x, -2000, -1200, 4000, 1400, '#6E7B6A', '#7E8B78'); P.shelves(x, -1300, -700, 900, 600, { rows: 4, seed: 5 }); P.shelves(x, 500, -700, 900, 600, { rows: 4, seed: 8 }); L.planks(x, -2000, 200, 4000, 900, '#8A5A33'); }],
        [1, x => { rr(x, -700, 60, 1400, 40, 8); ink(x, '#5A3420', 6); rr(x, -660, 100, 1320, 200, 6); ink(x, '#7A4A2A', 6);
          for (let i = 0; i < 5; i++) { const fx = -560 + i * 120; x.beginPath(); x.moveTo(fx - 16, -40); x.lineTo(fx - 16, 0); x.lineTo(fx - 44, 58); x.lineTo(fx + 44, 58); x.lineTo(fx + 16, 0); x.lineTo(fx + 16, -40); x.closePath(); ink(x, ['#B7E0A0', '#F2B8C6', '#A0C8F0', '#F7D27A', '#C9A0E8'][i], 5);
            for (let b = 0; b < 3; b++) { const ph = (lt * 1.2 + b / 3 + i * 0.2) % 1; x.beginPath(); x.arc(fx + Math.sin(ph * 9 + i) * 8, -40 - ph * 80, 6 * (1 - ph) + 2, 0, 6.27); ink(x, 'rgba(255,255,255,0.7)', 2); } }
          toon(x, 220, 330, 1.2, CAND, boom > 0 ? 'shock' : 'hold', boom > 0 ? 'shock' : 'worried', { t: lt, itemR: boom > 0 ? null : g => { g.beginPath(); g.moveTo(-14, -60); g.lineTo(-14, -20); g.lineTo(-40, 30); g.lineTo(40, 30); g.lineTo(14, -20); g.lineTo(14, -60); g.closePath(); ink(g, '#9AE07A', 5); } });
          P.puff(x, 240, -120, boom, 2.6, '#8A8478'); if (boom >= 1) for (let i = 0; i < 5; i++) { x.save(); x.globalAlpha = 0.5; L.cloud(x, 180 + i * 40 + Math.sin(lt * 2 + i) * 10, -220 - i * 30 - (lt - tc) * 40, 0.4, '#9A948A'); x.restore(); } }]]);
      L.word(ctx, 'CHEMIST?', 760, 170, pop(lt, tc - 0.4), { size: 100, col: CREAM }); K.stampMark(ctx, 'NO', 1180, 170, pop(lt, tc + 0.25, 0.25), { size: 80 });
    } },
  { name: 'a salesman', t0: s6, era: 'sepia', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -60, 1.35], [s7 - s6, -60, -90, 1.15]], lt), tb = W_('a2', 'understood') - s6;
      EN.layers(ctx, c, [[0.3, x => { K.sky(x, ERA.sepia.sky, lt, { sun: [-600, -600] }); K.skyline(x, 140, '#D9B894', 7); }],
        [0.7, x => K.streetRow(x, -2100, 220, { seed: 5 })],
        [1, x => { P.street(x, -2000, 200, 4000, 700); rr(x, -200, 190, 400, 120, 8); ink(x, '#8A6A4A', 5); L.planks(x, -196, 194, 392, 112, '#A8743F'); L.fitText(x, 'SOAP', 0, 250, 40, '#5A3420', 300);
          P.crowd(x, -900, -400, 470, 0.9, 3, lt, { react: 'cheer', seed: 3, hats: ['bowler', 'boater', null] }); P.crowd(x, 400, 900, 470, 0.9, 3, lt, { react: 'cheer', seed: 8, hats: ['bowler', null] });
          toon(x, 0, 190 - Math.abs(Math.sin(lt * 4)) * 10, 1.2, CAND, lt < tb ? 'wave' : 'cheer', 'grin', { t: lt, talk: 0.7, itemL: g => { rr(g, -50, -10, 100, 70, 8); ink(g, '#7A3A2A', 4); } });
          K.bulb(x, 0, -330, 0.9, pop(lt, tb, 0.4)); }]]);
      L.word(ctx, 'SALESMAN', 960, 140, pop(lt, 0.15), { size: 120, col: YELLOW });
    } },
  { name: 'nobody buys what they never tasted: door slam', t0: s7, era: 'sepia', out: { type: 'cut' }, draw(ctx, t, lt) {
      const ts = W_('a2', 'tasted') - s7, open = 1 - E.in(clamp((lt - ts) / 0.18)), c0 = EN.cam([[0, 0, -100, 1.15], [ts, 60, -110, 1.3], [ts + 1, 60, -110, 1.34]], lt), sh = EN.shake(lt, [ts + 0.18], 18), c = { ...c0, x: c0.x + sh.x, y: c0.y + sh.y };
      EN.layers(ctx, c, [[0.4, x => { K.sky(x, ERA.sepia.sky, lt); K.trees(x, 180, 14, '#7FA36A', 3); }],
        [1, x => { x.fillStyle = '#B9A47A'; x.fillRect(-2000, 200, 4000, 800); house(x, 0, 220, open, lt);
          if (open > 0.3) toon(x, -20, 220, 1.0, LOOKS.woman, 'arms', 'disgust', { t: lt, look: [-0.5, 0] });
          toon(x, -400, 360, 1.15, PEOPLE.gent, open > 0.5 ? 'present' : 'shock', open > 0.5 ? 'happy' : 'shock', { t: lt, talk: open > 0.5 ? 0.6 : 0, itemR: g => P.glassCup(g, 0, 20, 0.5, { fill: 0.8, fizz: lt }) });
          if (open > 0.3) P.bubble(x, 230, -420, 300, 150, "NEVER TASTED IT", { size: 30, tail: -90, tailDir: -1 });
          P.puff(x, 0, 0, clamp((lt - ts - 0.15) / 0.6), 1.6); if (lt > ts + 0.2) L.fitText(x, 'SLAM!', 280, -300, 90, RED, 400, { outline: 14 }); }]]);
      L.word(ctx, 'NOBODY BUYS IT', 560, 150, pop(lt, W_('a2', 'nobody') - s7 + 0.1), { size: 70, col: CREAM });
    } },
  { name: 'so he gave it away: FREE tickets', t0: s8, era: 'gaslight', out: { type: 'whip', dur: 0.3, dir: 1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -150, 1.3], [s9 - s8, 0, -110, 1.08]], lt), ta = W_('a3', 'away') - s8;
      EN.layers(ctx, c, [[0.6, x => K.fountainRoom(x, lt)],
        [1, x => { toon(x, 0, 80, 1.15, CAND, lt < ta ? 'hold' : 'cheer', lt < ta ? 'smug' : 'laugh', { t: lt }); P.fountain(x, 0, 200, 0.8, { w: 1900, taps: 3 });
          for (let i = 0; i < 30; i++) { const ph = lt - ta - hash(i) * 0.4; if (ph <= 0) continue; const vx = (hash(i * 3.3) - 0.5) * 1600, vy = -900 - hash(i * 5.1) * 500, tt = Math.min(ph, 3);
            K.miniTicket(x, vx * tt * 0.6, -200 + vy * tt + 520 * tt * tt, 0.75, hash(i) * 6 + tt * (2 + hash(i * 7) * 3)); } }]]);
      ctx.save(); ctx.translate(1480, 300); ctx.rotate(0.08 + Math.sin(lt * 2) * 0.04); P.ticket(ctx, 0, 0, 1.25 * E.back(pop(lt, ta - 0.1, 0.4), 2), 'FREE', 'ONE GLASS · ANY FOUNTAIN'); ctx.restore();
    } },
  { name: 'the mail carrier buried in tickets', t0: s9, era: 'sepia', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -60, 1.0], [s10 - s9, 0, -20, 1.12]], lt), pile = clamp(lt / (s10 - s9 - 0.3));
      EN.layers(ctx, c, [[0.6, x => { L.wallpaper(x, -2000, -1200, 4000, 1400, '#6B7A8A', '#7A8A9A'); rr(x, -1200, -760, 2400, 640, 8); ink(x, '#5A3420', 7);
          for (let r = 0; r < 7; r++) for (let q = 0; q < 26; q++) { const bx = -1180 + q * 91, by = -740 + r * 88; rr(x, bx, by, 84, 80, 3); ink(x, '#3A2418', 3); if (hash(r * 31 + q) > 0.35) { rr(x, bx + 10, by + 30, 64, 44, 3); ink(x, '#F4ECD8', 2.5); } }
          rr(x, -440, -930, 880, 120, 8); ink(x, CREAM, 6); L.fitText(x, 'POST OFFICE', 0, -870, 70, INK, 800); L.planks(x, -2000, 200, 4000, 900, '#8A6A4A'); }],
        [1, x => { rr(x, -1600, 0, 900, 40, 6); ink(x, '#5A3420', 6); rr(x, -1560, 40, 820, 200, 6); ink(x, '#7A4A2A', 6); for (let i = 0; i < 4; i++) P.bills(x, -1400 + i * 150, -10, 0.5, 1);
          const sack = 1 - pile; toon(x, 120, 330, 1.15, PEOPLE.mailman, pile < 0.75 ? 'shock' : 'wave', pile < 0.4 ? 'worried' : 'shock', { t: lt });
          // pouring chute
          rr(x, 40, -1000, 160, 300, 10); ink(x, '#8A8F96', 6); for (let i = 0; i < 24; i++) { const ph = (lt * 1.5 + i / 24) % 1, xx = 120 + (hash(i * 3) - 0.5) * 220, yy = -700 + ph * 900 * (1 - pile * 0.55); (i % 3 ? K.envelope : K.miniTicket)(x, xx, yy, 0.55, ph * 6 + i); }
          // the pile grows over him
          const ph = 120 + pile * 560; for (let i = 0; i < 140 * pile + 6; i++) { const u = hash(i * 1.37), v = hash(i * 2.71); const r = Math.sqrt(v); const px = 120 + (u - 0.5) * 2 * (360 + pile * 260) * (1 - r * 0.5), py = 380 - r * ph * (1 - Math.abs(u - 0.5) * 1.3);
            (i % 2 ? K.envelope : K.miniTicket)(x, px, py, 0.6, (hash(i * 9) - 0.5) * 1.6); }
          if (pile > 0.8) { x.save(); x.translate(260, -170 - Math.sin(lt * 10) * 6); x.rotate(Math.sin(lt * 8) * 0.4); x.beginPath(); x.arc(0, 0, 26, 0, 6.27); ink(x, PEOPLE.mailman.skin, 5); x.restore(); } }]]);
      L.word(ctx, 'MAILED', 960, 150, pop(lt, 0.05), { size: 100, col: YELLOW });
    } },
  { name: 'queues with tickets: 1894-1913', t0: s10, era: 'sepia', out: { type: 'whip', dur: 0.3, dir: 1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -500, 40, 1.25], [s11 - s10, 300, 30, 1.16]], lt), y1 = W_('a3', '1894') - s10, y2 = W_('a3', '1913') - s10;
      EN.layers(ctx, c, [[0.3, x => { K.sky(x, ERA.sepia.sky, lt); K.skyline(x, 100, '#D9B894', 3); }],
        [0.75, x => { K.streetRow(x, -2200, 220, { seed: 9, shops: [['BARBER', '#8E5A3E', [RED, CREAM]], ['GROCERY', '#A65A3E', ['#2E5A3E', CREAM]], ['SODA FOUNTAIN', '#B8714C', [RED, CREAM]], ['BAKERY', '#9A6A4A', [YELLOW, '#5A3420']], ['TAILOR', '#7E5A48', null]] }); }],
        [1, x => { P.street(x, -2400, 200, 4800, 700);
          const looks = [PEOPLE.gent, PEOPLE.lady, PEOPLE.gent2, PEOPLE.kid, LOOKS.woman, PEOPLE.gent3, PEOPLE.lady2, LOOKS.shopper, PEOPLE.worker, PEOPLE.gent, PEOPLE.lady, PEOPLE.gent2];
          looks.forEach((lk, i) => { const step = (lt * 0.8 + i * 0.13) % 1, xx = 880 - i * 175 + Math.min(step, 0.3) * 60 - 60; toon(x, xx, 340 + (i % 2) * 18, 0.95, lk, step < 0.3 ? 'walk' : 'hold', i % 4 === 0 ? 'happy' : i % 4 === 1 ? 'think' : 'neutral', { t: lt * 2 + i, seed: i, flip: true, ph: step * 20, itemR: g => K.miniTicket(g, 0, -20, 0.38, -0.2) }); });
          P.lamppost(x, -1500, 230, 1); P.lamppost(x, 1250, 230, 1); }],
        [1.3, x => { P.lamppost(x, -300, 700, 1.3); P.lamppost(x, 1900, 700, 1.3); }]]);
      L.dateCard(ctx, lt < y2 ? '1894' : '1894 – 1913', 960, 150, pop(lt, y1));
      L.plate(ctx, "THE COMPANY'S OWN LATER ESTIMATE", 960, 270, pop(lt, W_('a3', 'estimate') - s10), { size: 40, rot: 0.01 });
    } },
  { name: '1 in 9 Americans', t0: s11, era: 'gaslight', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -20, 1.3], [s12 - s11, 0, 0, 1.05]], lt), tf = W_('a3', 'free') - s11, lit = clamp((lt - 0.4) / 0.4);
      EN.layers(ctx, c, [[0.5, x => { L.stripes(x, -2000, -1300, 4000, 1600, '#7A2E2A', '#6A2622', 70); for (let i = 0; i < 18; i++) { x.beginPath(); x.arc(-1700 + i * 200, -620, 14, 0, 6.27); ink(x, '#FFD58A', 4); } L.planks(x, -2000, 280, 4000, 900, '#7A4A2A'); }],
        [1, x => { rr(x, -1050, 280, 2100, 60, 6); ink(x, '#5A3420', 6); stageRow(x, lt, lit, 0);
          x.save(); x.globalAlpha = 0.6 * lit; x.fillStyle = '#120C10'; x.fillRect(-2000, -1300, 4000, 2600); x.restore();
          K.spotlight(x, 0, -800, 330, 200, 0.5 * lit); stageRow(x, lt, lit, 1); if (lt > tf) P.sparkles(x, 0, -100, 170, lt, 7); }]]);
      L.plate(ctx, '1 IN 9 AMERICANS', 960, 940, pop(lt, W_('a3', 'one') - s11), { size: 84, bg: YELLOW });
      L.word(ctx, 'FREE GLASS', 1450, 330, pop(lt, tf), { size: 90, col: CREAM, rot: 0.08 });
    } },
  { name: 'sign painter: the name goes up', t0: s12, era: 'sepia', out: { type: 'whip', dur: 0.3, dir: 1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 260, -170, 1.22], [s13 - s12, -60, -140, 1.1]], lt), u = clamp((lt - 0.3) / 2.2);
      EN.layers(ctx, c, [[0.3, x => { K.sky(x, ERA.sepia.sky, lt, { sun: [800, -600] }); K.skyline(x, 120, '#D9B894', 11); }],
        [0.7, x => K.streetRow(x, -2300, 220, { seed: 13 })],
        [1, x => { L.bricks(x, -880, -760, 1760, 980, '#B8714C', { bw: 60, bh: 24 }); x.beginPath(); x.rect(-880, -760, 1760, 980); ink(x, null, 6); rr(x, -900, -790, 1800, 40, 6); ink(x, '#7E4634', 5);
          for (const wx of [-700, 520]) { rr(x, wx, -70, 180, 220, 6); ink(x, '#9CC7D8', 5); }
          P.street(x, -2400, 200, 4800, 700);
          x.save(); x.beginPath(); x.rect(-650, -560, 1300 * u, 420); x.clip(); K.wallSign(x, 0, -340, 1300, 360, 'COCA-COLA', 1, { sub: 'DELICIOUS · REFRESHING', bg: RED }); x.restore();
          const px = -620 + 1300 * u; for (const lx of [px - 110, px + 30]) { x.beginPath(); x.moveTo(lx, 240); x.lineTo(lx + 40, -330); ink(x, '#8A5A33', 14); } for (let r = 0; r < 8; r++) { x.beginPath(); x.moveTo(px - 108 + r * 5, 200 - r * 68); x.lineTo(px + 32 + r * 5, 200 - r * 68); ink(x, '#8A5A33', 8); }
          toon(x, px - 30, -60, 0.9, PEOPLE.worker2, { la: [0.6, -0.8], ra: [2.4 + Math.sin(lt * 9) * 0.3, -0.4] }, 'happy', { t: lt, itemR: g => { rr(g, -8, -60, 16, 60, 4); ink(g, '#8A5A33', 3); rr(g, -14, -84, 28, 28, 4); ink(g, RED, 3); } });
          rr(x, px + 50, -150, 60, 60, 8); ink(x, '#C9CDD2', 5);
          toon(x, 700 - lt * 140, 250, 0.9, PEOPLE.lady, 'walk', 'happy', { t: lt, flip: true, look: [0, -0.8] }); }],
        [1.3, x => { P.lamppost(x, -1250, 420, 1.4); }]]);
      L.word(ctx, "DON'T FORGET THE NAME", 960, 970, pop(lt, W_('a4', 'forget') - s12), { size: 72, col: YELLOW });
    } },
  { name: 'clocks, calendars, trays, fans', t0: s13, era: 'sepia', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -520, -170, 1.18], [1.4, -170, -170, 1.18], [2.4, 170, -170, 1.18], [s14 - s13, 480, -160, 1.12]], lt);
      const tc = [W_('a4', 'clocks'), W_('a4', 'calendars'), W_('a4', 'serving'), W_('a4', 'paper')].map(v => v - s13);
      EN.layers(ctx, c, [[0.9, x => { L.wallpaper(x, -2000, -1200, 4000, 1400, '#2F5A4A', '#3A6A58', 56); L.planks(x, -2000, 0, 4000, 200, '#6B4123', { vertical: true, pw: 60 }); rr(x, -2000, -12, 4000, 22, 4); ink(x, '#4A2E1E', 4);
          const k = i => E.back(pop(lt, tc[i], 0.35), 2.4);
          x.save(); x.translate(-640, -330); x.scale(k(0), k(0)); P.clock(x, 0, 0, 120, lt * 2, { text: 'COCA-COLA', rim: RED }); x.restore();
          x.save(); x.translate(-180, -320); x.scale(k(1), k(1)); P.calendar(x, 0, 0, 1.2, 'COCA-COLA', 'JUNE', '12'); x.restore();
          x.save(); x.translate(250, -330); x.scale(k(2), k(2)); K.tray(x, 0, 0, 120, { rot: Math.sin(lt * 2) * 0.05 }); x.restore();
          x.save(); x.translate(660, -260); x.scale(k(3), k(3)); K.fan(x, 0, 0, 150, { rot: Math.sin(lt * 5) * 0.15 }); x.restore();
          for (let i = 0; i < 4; i++) P.burst(x, [-640, -180, 250, 660][i], -330, 190, clamp((lt - tc[i]) / 0.45), CREAM);
          L.planks(x, -2000, 200, 4000, 900, '#8A5A33'); const hx = lerp(-860, 860, clamp((lt - tc[0] + 0.3) / (tc[3] - tc[0] + 0.9))); toon(x, hx, 250, 1.0, PEOPLE.clerk, Math.sin(lt * 5) > 0 ? 'cheer' : 'wave', 'grin', { t: lt }); }],
        [1.3, x => { P.crate(x, -900, 640, 1.3, { n: 4, kind: 'straight' }); P.crate(x, 1100, 640, 1.3, { n: 3, kind: 'straight' }); }]]);
    } },
  { name: 'he turns around: the name is on everything', t0: s14, era: 'sepia', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -40, 1.25], [s15 - s14, 0, -80, 1.0]], lt), tw = W_('a4', 'wall') - s14, tcn = W_('a4', 'counter') - s14, turned = lt > tw - 0.3;
      EN.layers(ctx, c, [[0.6, x => { L.wallpaper(x, -2000, -1200, 4000, 1400, '#7A5A3A', '#8A6A48', 50); P.shelves(x, -1500, -760, 1000, 600, { rows: 4, seed: 11 }); P.shelves(x, 500, -760, 1000, 600, { rows: 4, seed: 13 });
          [[-1000, -880, 0], [0, -700, 0.1], [1000, -880, 0.2], [-1680, -300, 0.3], [1680, -300, 0.35], [0, -380, 0.15]].forEach(([sx, sy, d], i) => K.wallSign(x, sx, sy, i === 5 ? 520 : 420, i === 5 ? 150 : 120, 'COCA-COLA', pop(lt, tw + d, 0.3), { rot: (hash(i) - 0.5) * 0.1, bg: i % 2 ? '#B82E2A' : RED }));
          L.planks(x, -2000, 200, 4000, 900, '#8A5A33'); }],
        [1, x => { rr(x, -1100, 40, 2200, 36, 8); ink(x, '#5A3420', 6); rr(x, -1060, 76, 2120, 200, 6); ink(x, '#7A4A2A', 6); K.wallSign(x, 0, 176, 900, 130, 'COCA-COLA', pop(lt, tcn, 0.3), { bg: RED });
          P.clock(x, -700, -60, 60, lt * 3, { text: 'COCA-COLA' }); K.tray(x, 700, -40, 70); P.bottle(x, 380, 40, 0.6, { kind: 'straight' }); P.bottle(x, 450, 40, 0.6, { kind: 'straight' });
          toon(x, -200, 360, 1.2, PEOPLE.gent, turned ? 'shock' : 'stand', turned ? 'shock' : 'neutral', { t: lt, flip: !turned, look: turned ? [0, -0.3] : [-0.7, 0] });
          if (turned) { x.save(); x.translate(-200, -105); K.wallSign(x, 0, 0, 160, 34, 'COCA-COLA', pop(lt, tcn + 0.2, 0.3), { bg: RED }); x.restore(); } }]]);
      L.word(ctx, 'ANYTHING!', 1460, 940, pop(lt, 0.2), { size: 90, col: YELLOW });
    } },
  { name: '1895: every state', t0: s15, era: 'sepia', out: { type: 'whip', dur: 0.3, dir: 1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 260, 100, 1.5], [s16 - s15, 0, 20, 1.02]], lt), te = W_('a5', 'state') - s15, u = clamp((lt - 0.4) / (te - 0.4)), k = 26, cx = 0, cy = 40, [ax, ay] = K.usPt(cx, cy, k, 'atlanta');
      EN.layers(ctx, c, [[0.5, x => K.mapSea(x, lt)],
        [1, x => { K.usMap(x, cx, cy, k, { cell: (lon, lat, i) => { const d = Math.hypot(lon + 84.4, (lat - 33.75) * 1.3) / 42 + hash(i) * 0.12; return d < u ? (u - d < 0.06 ? '#F7C548' : '#E46A5A') : null; } });
          x.beginPath(); x.arc(ax, ay, 12, 0, 6.27); ink(x, INK, 3); L.fitText(x, 'ATLANTA', ax + 10, ay + 34, 26, INK, 200, { font: L.F.type });
          for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28 + lt, r = 30 + ((lt * 120 + i * 40) % 300); x.save(); x.globalAlpha = 0.5 * (1 - r / 330); P.bottle(x, ax + Math.cos(a) * r, ay + Math.sin(a) * r * 0.6, 0.18, { kind: 'straight', label: '' }); x.restore(); } }]]);
      L.dateCard(ctx, '1895', 260, 150, pop(lt, W_('a5', '1895') - s15));
      L.word(ctx, 'SOLD IN EVERY STATE', 960, 960, pop(lt, W_('a5', 'every') - s15), { size: 84, col: YELLOW });
    } },
  { name: 'early 1900s: cocaine removed from the extract', t0: s16, era: 'sepia', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -120, -40, 1.12], [s17 - s16, 60, -60, 1.24]], lt), tr = W_('a5', 'out') - s16;
      EN.layers(ctx, c, [[0.6, x => { L.tiles(x, -2000, -1200, 4000, 1400, '#E8E2D2', '#DCD3C0', 64); P.shelves(x, -1400, -760, 800, 600, { rows: 4, seed: 21 }); rr(x, 300, -760, 700, 500, 8); ink(x, '#5A3420', 6); rr(x, 330, -730, 640, 440, 4); ink(x, '#F4ECD8', 4);
          L.fitText(x, 'LABORATORY', 650, -680, 44, INK, 560, { font: L.F.type }); for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(380, -600 + i * 50); x.lineTo(920 - hash(i) * 200, -600 + i * 50); ink(x, null, 3); } L.planks(x, -2000, 200, 4000, 900, '#8A6A4A'); }],
        [1, x => { rr(x, -900, 40, 1500, 40, 8); ink(x, '#5A3420', 6); rr(x, -860, 80, 1420, 200, 6); ink(x, '#7A4A2A', 6);
          toon(x, -480, 330, 1.15, PEOPLE.chemist, lt < tr ? 'think' : 'present', lt < tr ? 'think' : 'happy', { t: lt });
          rr(x, -230, -220, 220, 260, 14); ink(x, '#9AC79A', 6); rr(x, -250, -250, 260, 40, 8); ink(x, '#5A3420', 5); rr(x, -210, -150, 180, 110, 6); ink(x, CREAM, 4); L.fitText(x, 'COCA LEAF', -120, -118, 30, INK, 160); L.fitText(x, 'EXTRACT', -120, -78, 30, INK, 160);
          for (let i = 0; i < 4; i++) { x.save(); x.translate(-160 + i * 40, -10 - i * 30); x.rotate(i * 0.7 + Math.sin(lt + i) * 0.1); ell(x, 0, 0, 22, 10); ink(x, '#5F8F5F', 3); x.restore(); }
          K.doc(x, 300, -120, 360, 300, { title: 'CONTENTS', lines: 0, rot: 0.03, draw: (g, w, h) => { L.fitText(g, 'COCA LEAF', 0, -40, 32, INK, 300, { font: L.F.type }); L.fitText(g, 'COCAINE', 0, 20, 36, INK, 300, { font: L.F.type });
            if (lt > tr) { g.beginPath(); g.moveTo(-110, 20); g.lineTo(-110 + 220 * clamp((lt - tr) / 0.3), 20); ink(g, null, 6, { stroke: RED }); } L.fitText(g, 'KOLA NUT', 0, 80, 32, INK, 300, { font: L.F.type }); } });
          K.stampMark(x, 'REMOVED', 330, -100, pop(lt, tr + 0.2, 0.3), { size: 56, rot: -0.15 }); }]]);
      L.dateCard(ctx, 'EARLY 1900s', 420, 150, pop(lt, W_('a5', 'early') - s16), { size: 74 });
    } },
  { name: 'a hit at the soda fountain', t0: s17, era: 'gaslight', out: { type: 'whip', dur: 0.3, dir: 1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -200, -60, 1.05], [s18 - s17, 100, -80, 1.18]], lt), th = W_('a6', 'hit') - s17;
      EN.layers(ctx, c, [[0.6, x => K.fountainRoom(x, lt, { sign: 'COCA-COLA · 5¢' })],
        [1, x => { toon(x, 120, 80, 1.05, PEOPLE.clerk, 'pour', 'happy', { t: lt }); toon(x, -520, 90, 1.1, CAND, lt > th ? 'cheer' : 'arms', lt > th ? 'laugh' : 'smug', { t: lt });
          P.fountain(x, 0, 200, 0.8, { w: 2300, taps: 3, stools: false });
          for (let i = 0; i < 6; i++) { const gx = -900 + ((lt * 420 + i * 330) % 1800); P.glassCup(x, gx, 0, 0.6, { fill: 0.8, fizz: lt + i }); }
          P.crowd(x, -1000, 1000, 470, 0.95, 7, lt, { react: lt > th ? 'cheer' : null, pose: lt > th ? null : 'drink', expr: 'happy', seed: 12, hats: ['bowler', 'boater', null, null] }); }]]);
      if (lt > th) P.burst(ctx, 1500, 160, 260, clamp((lt - th) / 0.5)); L.word(ctx, 'A HIT!', 1500, 160, pop(lt, th), { size: 110, col: YELLOW, rot: 0.06 });
    } },
  { name: 'night: two bowler hats at the door', t0: s18, era: 'gaslight', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -160, -60, 1.08], [TL.T - s18, 160, -90, 1.26]], lt), kn = W_('a6', 'deals') - s18, sil = clamp((lt - 1.0) / 0.8);
      EN.layers(ctx, c, [[0.6, x => { K.office(x, lt, { night: true, winX: -1300, picX: -500, bookX: 1300, wall: '#3E4A3A' }); x.fillStyle = 'rgba(14,10,24,0.5)'; x.fillRect(-2400, -1400, 4800, 2800);
          rr(x, 330, -600, 560, 800, 8); ink(x, '#3A2418', 7); rr(x, 380, -550, 460, 400, 6); ink(x, '#E8D9A8', 5); x.save(); rr(x, 380, -550, 460, 400, 6); x.clip();
          L.glow(x, 610, -350, 300, '#FFF0C0', 0.45); x.globalAlpha = 0.8 * sil; x.fillStyle = '#2A2028';
          for (const [hx, d] of [[520, 0], [720, 0.2]]) { const yy = -230 + (1 - E.out(clamp(sil * 1.3 - d))) * 320; x.beginPath(); x.arc(hx, yy - 120, 60, 0, 6.27); x.fill(); ell(x, hx, yy - 165, 92, 15); x.fill(); x.beginPath(); x.moveTo(hx - 58, yy - 165); x.bezierCurveTo(hx - 60, yy - 250, hx + 60, yy - 250, hx + 58, yy - 165); x.fill(); rr(x, hx - 105, yy - 60, 210, 300, 60); x.fill(); }
          x.restore(); L.fitText(x, 'A. G. CANDLER', 610, -490, 40, '#4A2E1E', 400, { font: L.F.type }); rr(x, 380, -120, 460, 300, 6); ink(x, '#4A2A1A', 5); x.beginPath(); x.arc(800, -40, 12, 0, 6.27); ink(x, '#D8B04A', 3);
          for (const kk of [kn, kn + 0.25]) if (lt > kk && lt < kk + 0.45) L.fitText(x, 'KNOCK', 610 + (kk - kn) * 260 - 130, -660 - (kk - kn) * 80, 64, CREAM, 300, { outline: 12 }); }],
        [1, x => { toon(x, -350, 180, 1.15, CAND, lt > kn ? 'shock' : 'think', lt > kn ? 'shock' : 'smug', { t: lt, look: lt > kn ? [0.8, 0] : [0, 0.4] }); K.desk(x, -350, 180, 1100); K.lamp(x, -700, 156, 1.1, true); K.doc(x, -300, 140, 260, 110, { lines: 3, rot: 0.04 }); K.inkwell(x, -60, 156); }]]);
      L.word(ctx, '?', 760, 260, pop(lt, kn + 0.2), { size: 200, col: YELLOW });
    } },
];
EN.run({ module, dir: __dirname, TL, scenes, card: { n: 'CHAPTER 2', title: 'The Salesman', sub: '1888–1913', era: 'sepia' },
  cues: () => [['steps', 0.4, 0.4], ['whoosh', 3.4, 0.4], ['whoosh', 3.95, 0.4], ['whoosh', 4.5, 0.4], ['whoosh', s2 - 0.12, 0.5], ['ding', s2 + 0.1, 0.5], ['whoosh', s3 - 0.12, 0.5], ['stamp', at('a1', 'whole') + 0.3, 0.7],
    ['whoosh', s4 - 0.12, 0.5], ['coins', s4 + 0.4, 0.4], ['kaching', at('a1', 'two'), 0.7], ['puff', at('a2', 'chemist') - 0.25, 0.6], ['stamp', at('a2', 'chemist') + 0.25, 0.6], ['whoosh', s6 - 0.12, 0.5], ['crowdcheer', s6 + 0.1, 0.4], ['ding', at('a2', 'understood'), 0.5],
    ['slam', at('a2', 'tasted'), 0.9], ['pop', at('a3', 'away') - 0.1, 0.8], ['paper', at('a3', 'away'), 0.6], ['flutter', at('a3', 'away') + 0.3, 0.5], ['whoosh', s9 - 0.12, 0.5], ['paper', s9 + 0.3, 0.6], ['paper', s9 + 1.2, 0.6], ['whoosh', s10 - 0.12, 0.5], ['murmur', s10 + 0.2, 0.4],
    ['tick', at('a3', '1894'), 0.5], ['tick', at('a3', '1913'), 0.5], ['whoosh', s11 - 0.12, 0.5], ['power', s11 + 0.4, 0.5], ['sparkle', at('a3', 'free'), 0.5], ['whoosh', s12 - 0.12, 0.5], ['scratch', s12 + 0.4, 0.3],
    ['pop', at('a4', 'clocks'), 0.6], ['pop', at('a4', 'calendars'), 0.6], ['pop', at('a4', 'serving'), 0.6], ['pop', at('a4', 'paper'), 0.6], ['pop', at('a4', 'wall'), 0.5], ['pop', at('a4', 'wall') + 0.15, 0.5], ['pop', at('a4', 'wall') + 0.3, 0.5], ['gasp', at('a4', 'wall') - 0.3, 0.5], ['pop', at('a4', 'counter'), 0.6],
    ['whoosh', s15 - 0.12, 0.5], ['sparkle', s15 + 0.6, 0.5], ['ding', at('a5', 'state'), 0.5], ['whoosh', s16 - 0.12, 0.5], ['stamp', at('a5', 'out') + 0.2, 0.6], ['whoosh', s17 - 0.12, 0.5], ['crowdcheer', at('a6', 'hit'), 0.5],
    ['tap', at('a6', 'deals'), 0.9], ['tap', at('a6', 'deals') + 0.25, 0.9], ['heartbeat', at('a6', 'history'), 0.5]],
  music: [[0, 'ragtime'], [s16, 'calm'], [s17, 'ragtime'], [s18, 'tension']] });
