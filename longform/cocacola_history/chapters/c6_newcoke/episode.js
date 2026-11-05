// Chapter 6 — New Coke (1985): taste lab -> press conference -> hoarding, protests, a drowning hotline -> the warm memory -> July 11 comeback -> "how much people cared".
const L = require('../../../kit/look'), P = require('../../../kit/props'), { toon, LOOKS } = require('../../../kit/toon'), EN = require('../../../kit/engine');
const K = require('./cokekit'), C = K.CAST;
const { W, H, INK, CREAM, RED, YELLOW, BLUE, ERA, ink, rr, ell, poly, clamp, lerp, seg, E, hash, fitText } = L;
const TL = EN.timeline(__dirname, { start: 3.0, gap: 0.55, gaps: { n4: 0.85, n6: 0.8 } }), at = TL.at, begin = TL.begin, end = TL.end;
const pop = (t, t0, d = 0.35) => clamp((t - t0) / d);
const S = (id, w, n = 0) => at(id, w, n) - 0.12;
const TN = ERA.tense;

// ---------- sets ----------
function labRoom(ctx, t) { L.tiles(ctx, -1500, -900, 3000, 1120, '#DCE3EA', '#CDD6E0', 70);
  for (let i = 0; i < 5; i++) { const x = -1350 + i * 640; rr(ctx, x, -860, 300, 26, 6); ink(ctx, '#F4F7FA', 4); L.glow(ctx, x + 150, -800, 300, '#E8F2FF', 0.25); }
  K.blinds(ctx, -1350, -620, 420, 300, '#2B3B70', { down: 0.45 }); P.shelves(ctx, 700, -640, 700, 420, { rows: 3, seed: 21 });
  rr(ctx, -700, -660, 560, 120, 8); ink(ctx, '#2F4A6A', 6); fitText(ctx, 'TASTE TEST LAB', -420, -600, 54, CREAM, 520);
  P.clock(ctx, 300, -560, 60, t * 2, { rim: '#4A4F5C' }); ctx.fillStyle = '#9AA3AE'; ctx.fillRect(-1500, 200, 3000, 700); L.tiles(ctx, -1500, 200, 3000, 700, '#B9C1CB', '#A9B2BD', 90); }
function booth(ctx, x, y, look, t, k) { // tasting booth: partition + small table + taster
  rr(ctx, x - 170, y - 420, 22, 420, 4); ink(ctx, '#F4F7FA', 4); rr(ctx, x + 148, y - 420, 22, 420, 4); ink(ctx, '#F4F7FA', 4); rr(ctx, x - 175, y - 440, 350, 30, 6); ink(ctx, '#2F6DB5', 4);
  fitText(ctx, 'BOOTH ' + k, x, y - 425, 20, CREAM, 300);
  const sip = (t * 0.6 + k * 0.37) % 1 < 0.45; toon(ctx, x, y, 0.82, look, sip ? 'drink' : 'hold', sip ? 'think' : ['happy', 'disgust', 'smug', 'grin'][k % 4], { t: t + k, itemR: g => { if (sip) g.rotate(2.6); P.glassCup(g, 0, 50, 0.4, { fill: 0.6 }); } });
  rr(ctx, x - 130, y - 140, 260, 22, 5); ink(ctx, '#C9A777', 4); rr(ctx, x - 110, y - 118, 16, 118, 3); ink(ctx, '#8A6A4A', 3); rr(ctx, x + 94, y - 118, 16, 118, 3); ink(ctx, '#8A6A4A', 3);
  for (let i = 0; i < 3; i++) P.glassCup(ctx, x - 60 + i * 60, y - 140, 0.32, { fill: 0.5 + i * 0.1 }); }
function flask(ctx, x, y, s, t, label, boil = 0) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const sh = () => { ctx.beginPath(); ctx.moveTo(-26, -220); ctx.lineTo(-26, -140); ctx.lineTo(-110, -10); ctx.quadraticCurveTo(-118, 0, -100, 0); ctx.lineTo(100, 0); ctx.quadraticCurveTo(118, 0, 110, -10); ctx.lineTo(26, -140); ctx.lineTo(26, -220); ctx.closePath(); };
  ctx.save(); sh(); ctx.clip(); ctx.fillStyle = P.COLA; ctx.fillRect(-130, -100 - boil * 30, 260, 110 + boil * 30); for (let i = 0; i < 10; i++) { const ph = (t * 0.9 + i * 0.13) % 1; ctx.beginPath(); ctx.arc(-70 + i * 16, -10 - ph * 90, 5, 0, 6.27); ctx.fillStyle = 'rgba(255,240,220,0.6)'; ctx.fill(); } ctx.restore();
  sh(); ink(ctx, 'rgba(210,240,250,0.35)', 6); rr(ctx, -70, -80, 140, 46, 5); ink(ctx, CREAM, 4); fitText(ctx, label, 0, -56, 30, RED, 124);
  if (boil > 0) for (let i = 0; i < 5; i++) { const ph = (t * 1.2 + i * 0.2) % 1; ctx.save(); ctx.globalAlpha = (1 - ph) * boil; ctx.beginPath(); ctx.arc(Math.sin(i * 2 + t * 3) * 20, -230 - ph * 160, 14 + ph * 20, 0, 6.27); ink(ctx, '#7A3E22', 3); ctx.restore(); }
  ctx.restore(); }
function nightCity(ctx, t) { L.skyGrad(ctx, -1700, -1000, 3400, 1300, TN.sky); for (let i = 0; i < 40; i++) { ctx.beginPath(); ctx.arc(-1600 + hash(i) * 3200, -900 + hash(i * 2.3) * 500, 2.5, 0, 6.27); ctx.fillStyle = 'rgba(246,235,211,0.7)'; ctx.fill(); }
  for (let i = 0; i < 12; i++) { const x = -1700 + i * 300, h = 380 + hash(i * 5) * 420; rr(ctx, x, 260 - h, 260, h, 4); ink(ctx, ['#2E3654', '#3A3360', '#29304A'][i % 3], 4);
    for (let r = 0; r < h / 56 - 1; r++) for (let c = 0; c < 3; c++) if (hash(i * 31 + r * 7 + c) > 0.45) { rr(ctx, x + 26 + c * 76, 260 - h + 24 + r * 56, 46, 30, 3); ink(ctx, '#F7D27A', 0); } } }
function pressRoom(ctx, t) { L.skyGrad(ctx, -1600, -1000, 3200, 1300, ['#1E2A44', '#2F3E66']); L.stripes(ctx, -1500, -900, 3000, 1100, '#2B3A5E', '#26345A', 60);
  rr(ctx, -900, -720, 1800, 120, 10); ink(ctx, '#D93A35', 6); fitText(ctx, 'PRESS CONFERENCE · NEW YORK', 0, -660, 60, CREAM, 1700);
  for (let i = 0; i < 2; i++) { rr(ctx, -1400 + i * 2300, -560, 400, 700, 10); ink(ctx, '#3A4A70', 5); } ctx.fillStyle = '#3A3F4D'; ctx.fillRect(-1600, 200, 3200, 800); }
function chairs(ctx, x0, n, y, s = 1) { for (let i = 0; i < n; i++) { const x = x0 + i * 150 * s; rr(ctx, x - 40 * s, y - 150 * s, 80 * s, 90 * s, 8); ink(ctx, '#C9302C', 4); rr(ctx, x - 46 * s, y - 70 * s, 92 * s, 20 * s, 6); ink(ctx, '#A92420', 4); rr(ctx, x - 40 * s, y - 50 * s, 8 * s, 50 * s, 3); ink(ctx, '#3A3438', 3); rr(ctx, x + 32 * s, y - 50 * s, 8 * s, 50 * s, 3); ink(ctx, '#3A3438', 3); } }
function tvCam(ctx, x, y, s = 1, t = 0) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); for (const a of [-0.35, 0, 0.35]) { ctx.save(); ctx.rotate(a); rr(ctx, -6, -220, 12, 220, 4); ink(ctx, '#3A3438', 4); ctx.restore(); }
  rr(ctx, -110, -330, 200, 110, 14); ink(ctx, '#2A2E36', 5); rr(ctx, 90, -310, 70, 70, 10); ink(ctx, '#4A4F5C', 5); ctx.beginPath(); ctx.arc(160, -275, 26, 0, 6.27); ink(ctx, '#7FB2E5', 4); rr(ctx, -80, -360, 120, 30, 6); ink(ctx, '#4A4F5C', 4); fitText(ctx, 'TV', -20, -275, 40, CREAM, 100);
  if ((t * 2) % 1 < 0.5) { ctx.beginPath(); ctx.arc(-90, -340, 9, 0, 6.27); ink(ctx, '#FF4A3A', 3); } ctx.restore(); }

// ---------- scenes ----------
const t1 = 0, t2 = S('n1', 'nearly'), t3 = S('n1', 'blind'), t4 = at('n1', 'coke') - 0.1, t5 = begin('n2') - 0.25, t6 = S('n2', 'company'),
  t7 = begin('n3') - 0.2, t8 = S('n3', 'people') - 0.15, t9 = at('n3', 'protest') - 0.35, t10 = S('n3', 'by'), t11 = begin('n4') - 0.25, t12 = S('n4', 'people'), t13 = S('n4', 'they'), t14 = S('n4', 'change'),
  t15 = begin('n5') - 0.25, t16 = S('n5', 'original'), t17 = S('n5', 'in'), t18 = S('n5', 'company'), t19 = begin('n6') - 0.25, t20 = S('n6', 'but');
const L1 = (id, w, t0, n = 0) => at(id, w, n) - t0; // local time of a word

const scenes = [
  { name: 'taste lab: sweeter formula', t0: t1, era: 'tense', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -380, 50, 1.25], [3.2, -60, 40, 1.12], [6, 60, 30, 1.18]], lt), us = pop(lt, L1('n1', 'sweeter', t1), 0.4);
      EN.layers(ctx, c, [[0.6, x => labRoom(x, lt)],
        [0.85, x => { for (let k = 0; k < 4; k++) booth(x, -1150 + k * 420, 230, [C.dad, C.mom, C.teen, C.protester][k], lt, k + 1); }],
        [1, x => { rr(x, 120, 120, 760, 40, 8); ink(x, '#E9EDF2', 5); rr(x, 150, 160, 30, 230, 4); ink(x, '#A9B2BD', 4); rr(x, 820, 160, 30, 230, 4); ink(x, '#A9B2BD', 4);
          flask(x, 300, 120, 0.9, lt, 'OLD'); flask(x, 600, 120, 1.15, lt, 'NEW', us);
          // sugar cubes avalanche into the NEW flask
          for (let i = 0; i < 14; i++) { const ph = clamp((lt - L1('n1', 'sweeter', t1) - i * 0.06) / 0.5); if (ph > 0 && ph < 1) { x.save(); x.translate(600 + (hash(i) - 0.5) * 60, -520 + ph * 420); x.rotate(ph * 6 + i); rr(x, -18, -18, 36, 36, 5); ink(x, '#FFFFFF', 4); x.restore(); } }
          toon(x, -60, 380, 1.05, C.scientist, us > 0 ? 'cheer' : 'pour', us > 0 ? 'grin' : 'think', { t: lt, itemR: us > 0 ? null : g => { g.rotate(-0.4); rr(g, -26, -60, 52, 70, 6); ink(g, '#FFFFFF', 4); fitText(g, 'SUGAR', 0, -26, 14, INK, 46); } }); }],
        [1.3, x => { K.plant(x, -1250, 560, 1.2, lt); }]]);
      L.word(ctx, 'SWEETER', 1350, 200, us, { size: 100, col: YELLOW });
    } },
  { name: 'the endless queue: ~200,000 tasters', t0: t2, era: 'tense', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 200, 30, 1.2], [3, -120, 0, 0.95]], lt), cnt = 200000 * E.out(clamp((lt - L1('n1', 'two', t2) + 0.1) / 1.4));
      EN.layers(ctx, c, [[0.3, x => nightCity(x, lt)],
        [0.55, x => { x.fillStyle = '#3E4352'; x.fillRect(-1800, 120, 3600, 900); x.fillStyle = '#5A6070'; x.fillRect(-1800, 112, 3600, 14); for (let r = 0; r < 3; r++) P.crowd(x, -1700 + r * 150, 500, 170 + r * 60, 0.3 + r * 0.06, 15, lt + r, { seed: r * 5 + 3, react: 'none' }); }],
        [1, x => { x.fillStyle = '#4A4F5C'; x.fillRect(-1700, 160, 3400, 800); x.fillStyle = '#5A6070'; x.fillRect(-1700, 160, 3400, 24);
          rr(x, 260, -560, 820, 740, 8); ink(x, '#C9D1DC', 6); L.bricks(x, 266, -554, 808, 728, '#9AA3AE', { bw: 60, bh: 24 }); rr(x, 260, -560, 820, 740, 8); ink(x, null, 6);
          rr(x, 560, -120, 220, 300, 6); ink(x, '#F7D27A', 5); L.glow(x, 670, 20, 260, '#FFE3A0', 0.4); rr(x, 320, -520, 700, 110, 8); ink(x, '#2F4A6A', 5); fitText(x, 'TASTE TEST TODAY', 670, -465, 52, YELLOW, 660);
          rr(x, 380, -390, 580, 170, 10); ink(x, '#1C1A1F', 5); fitText(x, K.fmt(cnt), 670, -305, 110, '#7CF08A', 540);
          for (let i = 0; i < 9; i++) { const ph = (lt * 0.5 + i / 9) % 1; toon(x, -1400 + i * 200, 380 + Math.sin(i) * 10, 0.9, [C.dad, C.mom, C.teen, C.protester, C.trucker, C.operator, C.grown, C.operator3, C.boy][i], i % 3 ? 'stand' : 'arms', ['neutral', 'sleepy', 'worried', 'happy'][i % 4], { t: lt + i, look: [1, 0] }); }
          toon(x, 470, 380, 1.0, C.scientist2, 'present', 'happy', { t: lt }); }]]);
      L.plate(ctx, '≈ 200,000 PEOPLE', 600, 160, pop(lt, L1('n1', 'consumers', t2)), { size: 70, bg: RED, fg: CREAM });
    } },
  { name: 'blind test: B wins', t0: t3, era: 'tense', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -20, 1.15], [3.0, 0, -50, 1.35]], lt), tb = L1('n1', 'beat', t3), pick = clamp((lt - tb + 0.6) / 0.5), lift = pop(lt, tb, 0.3);
      EN.layers(ctx, c, [[0.6, x => labRoom(x, lt)],
        [1, x => { toon(x, -560, 300, 1.0, C.scientist, 'hold', 'think', { t: lt, itemL: g => { rr(g, -40, -80, 80, 100, 6); ink(g, '#FFFFFF', 4); for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-26, -60 + i * 20); g.lineTo(26, -60 + i * 20); ink(g, null, 2); } } });
          toon(x, 60, 240, 1.25, C.dad, { la: [0.2, 0.1], ra: [lerp(0.4, 1.0, pick), lerp(-0.2, -0.6, pick)] }, lift > 0 ? 'grin' : 'think', { t: lt }); K.blindfold(x, 60, 240, 1.25);
          rr(x, -280, 120, 760, 40, 8); ink(x, '#C9A777', 5); rr(x, -250, 160, 30, 240, 4); ink(x, '#8A6A4A', 4); rr(x, 420, 160, 30, 240, 4); ink(x, '#8A6A4A', 4);
          for (const [cx, lab, win] of [[-110, 'A', 0], [300, 'B', 1]]) { const up = win ? lift : 0; P.glassCup(x, cx, 120 - up * 40, 0.75, { fill: 0.6, fizz: lt }); rr(x, cx - 34, 150, 68, 46, 6); ink(x, CREAM, 4); fitText(x, lab, cx, 174, 34, INK, 60);
            if (win && lift > 0) { L.plate(x, 'NEW', cx, -110, lift, { size: 46, bg: RED, fg: CREAM }); P.burst(x, cx, 40, 170, clamp((lt - tb) / 0.5)); } if (!win && lift > 0) { L.plate(x, 'OLD', cx, -60, lift, { size: 36 }); K.face(x, cx, 70, 1, 'sad'); } } }]]);
      L.word(ctx, 'BLIND TEST', 960, 140, pop(lt, 0.1), { size: 90, col: CREAM });
    } },
  { name: 'podium: new beats old and Pepsi', t0: t4, era: 'tense', out: { type: 'whip', dur: 0.3, dir: 1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -60, 1.3], [1.8, 0, -80, 1.05]], lt), tp = L1('n1', 'pepsi', t4), fall = clamp((lt - tp - 0.15) / 0.45);
      EN.layers(ctx, c, [[0.4, x => { L.skyGrad(x, -1600, -900, 3200, 1200, ['#1A2240', '#3B2C58']); for (let i = 0; i < 3; i++) K.spot(x, -500 + i * 500, -900, 300, 120, 520, 0.18); }],
        [1, x => { x.fillStyle = '#2E3348'; x.fillRect(-1600, 260, 3200, 700); K.confetti(x, -900, 900, -700, 1100, lt, 50);
          for (const [px, h, n] of [[-380, 200, 2], [0, 320, 1], [380, 130, 3]]) { rr(x, px - 170, 260 - h, 340, h, 8); ink(x, n === 1 ? '#F7C548' : n === 2 ? '#C9CDD2' : '#C8954F', 6); fitText(x, String(n), px, 260 - h / 2, 90, INK, 200); }
          K.can(x, 0, -60, 1.25, { label: 'NEW', face: 'smug' }); K.trophy(x, 150, -60, 0.7); x.save(); x.translate(0, -296); rr(x, -60, -14, 120, 22, 8); ink(x, YELLOW, 4); for (let i = 0; i < 5; i++) { poly(x, [[-56 + i * 28, -14], [-42 + i * 28, -54], [-28 + i * 28, -14]]); ink(x, YELLOW, 4); } x.restore();
          P.bottle(x, -380, 60, 1.0, { kind: 'contour' }); K.face(x, -380, -100, 1, 'sad');
          x.save(); x.translate(380 + fall * 260, 130 + fall * fall * 600); x.rotate(fall * 2.2); P.bottle(x, 0, 0, 1.0, { kind: 'pepsi' }); K.face(x, 0, -160, 1, 'shock'); x.restore(); if (lt > tp) K.sweat(x, 440, -150, 1.2, lt); }]]);
      L.word(ctx, 'IT EVEN BEAT PEPSI', 960, 150, pop(lt, tp - 0.4), { size: 84, col: YELLOW });
    } },
  { name: 'APRIL 23, 1985: reporters rush in', t0: t5, era: 'tense', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -200, 30, 1.15], [3.6, 120, 20, 1.0]], lt), ring = clamp((lt - L1('n2', '1985', t5) + 0.2) / 0.9);
      EN.layers(ctx, c, [[0.5, x => pressRoom(x, lt)],
        [0.8, x => { chairs(x, -1300, 18, 330, 1.0); tvCam(x, 900, 300, 1.0, lt); x.save(); x.translate(-700, -300); x.rotate(-0.04); rr(x, -170, -210, 340, 420, 10); ink(x, CREAM, 6); rr(x, -170, -210, 340, 90, 10); ink(x, RED, 6); fitText(x, 'APRIL 1985', 0, -165, 46, CREAM, 300);
            for (let i = 0; i < 28; i++) { const cx = -135 + (i % 7) * 45, cy = -80 + Math.floor(i / 7) * 62; fitText(x, String(i + 1), cx, cy, i === 22 ? 36 : 26, i === 22 ? RED : INK, 40); } K.markerPath(x, K.ringPts(-135 + 1 * 45, -80 + 3 * 62, 34, 28), ring); x.restore(); }],
        [1, x => { for (let i = 0; i < 6; i++) { const xx = 1300 - ((lt * 330 + i * 330) % 2600); toon(x, xx, 330 + (i % 2) * 50, 1.0, [C.grown, C.operator3, C.trucker, C.mom, C.operator2, C.teen][i], 'run', i % 2 ? 'determined' : 'shock', { t: lt + i, flip: true,
              itemR: g => { rr(g, -34, -30, 68, 50, 8); ink(g, '#2A2E36', 4); g.beginPath(); g.arc(0, -5, 15, 0, 6.27); ink(g, '#7FB2E5', 3); } }); } }]]);
      L.dateCard(ctx, 'APRIL 23, 1985', 1300, 180, pop(lt, L1('n2', 'april', t5)), { size: 84 });
    } },
  { name: 'press conference: the old recipe gets the hook', t0: t6, era: 'tense', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -10, 1.05], [4.2, 60, -40, 1.18]], lt), tr = L1('n2', 'replacing', t6), hook = clamp((lt - tr) / 1.3), rise = E.back(clamp((lt - tr - 0.6) / 0.6), 1.6);
      EN.layers(ctx, c, [[0.5, x => { pressRoom(x, lt); rr(x, -650, -560, 1300, 640, 10); ink(x, '#2F6DB5', 6); L.stripes(x, -644, -554, 1288, 628, '#2F6DB5', '#3A78C0', 50); rr(x, -650, -560, 1300, 640, 10); ink(x, null, 6); fitText(x, 'INTRODUCING: THE NEW TASTE', 0, -470, 60, CREAM, 1200); }],
        [1, x => { rr(x, -1500, 200, 3000, 60, 0); ink(x, '#5B4636', 5);
          toon(x, -260, 230, 1.1, C.exec, lt > tr ? 'present' : 'stand', lt > tr ? 'grin' : 'happy', { t: lt, talk: 0.6 }); rr(x, -370, 95, 220, 140, 10); ink(x, '#6B4123', 6); fitText(x, 'PRESS', -260, 165, 40, CREAM, 200);
          for (let i = 0; i < 5; i++) { x.save(); x.translate(-260 + (i - 2) * 26, 95); x.rotate((i - 2) * 0.22); rr(x, -5, -40, 10, 40, 3); ink(x, '#3A3438', 3); ell(x, 0, -48, 11, 14); ink(x, '#2A2E36', 3); x.restore(); }
          // pedestal: the old bottle is yanked off by a vaudeville hook, the new can rises
          K.pedestal(x, 300, 230, 220, 200, 'SINCE 1886'); x.save(); x.translate(300 + E.in(hook) * 1300, 10 - E.out(clamp(hook * 3)) * 40); x.rotate(-hook * 0.6); P.bottle(x, 0, 0, 0.95, { kind: 'contour' }); K.face(x, 0, -150, 1, hook > 0 ? 'shock' : 'happy'); x.restore();
          x.save(); x.translate(300 + E.in(hook) * 1300 + 40, -260 - E.out(clamp(hook * 3)) * 40); x.beginPath(); x.moveTo(0, -800); x.lineTo(0, 0); x.arc(-40, 0, 40, 0, Math.PI * 0.9); x.lineWidth = 22; x.strokeStyle = INK; x.stroke(); x.lineWidth = 12; x.strokeStyle = '#8A6A4A'; x.stroke(); x.restore();
          if (rise > 0) { x.save(); x.translate(300, 10 + (1 - rise) * 220); x.beginPath(); x.rect(-200, -600, 400, 600 - (1 - rise) * 0); x.restore(); K.can(x, 300, 10 + (1 - rise) * 200, 1.1 * clamp(rise + 0.01), { label: 'NEW' }); P.sparkles(x, 300, -100, 150, lt, 6); } }],
        [1.3, x => { for (let i = 0; i < 7; i++) { const fx = -1100 + i * 380, f = (lt * 1.3 + hash(i) * 3) % 1.6 < 0.12; x.save(); x.translate(fx, 480); ell(x, 0, 0, 110, 120); ink(x, '#1C1A24', 0); rr(x, -60, -150, 120, 80, 10); ink(x, '#2A2E36', 4); x.beginPath(); x.arc(0, -110, 26, 0, 6.27); ink(x, '#7FB2E5', 4);
            rr(x, 20, -190, 50, 40, 6); ink(x, '#C9CDD2', 4); if (f) { L.glow(x, 45, -170, 320, '#FFFFFF', 0.9); P.burst(x, 45, -170, 120, 0.3, '#FFFFFF'); } x.restore(); } }]]);
      L.plate(ctx, '99-YEAR-OLD RECIPE', 1380, 960, pop(lt, L1('n2', 'ninety', t6)), { size: 62, bg: CREAM });
    } },
  { name: 'living room: spit-take at the news', t0: t7, era: 'tense', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 100, 0, 1.22], [2.2, 0, 20, 1.08]], lt), tw = L1('n3', 'well', t7) - 0.5, sp = clamp((lt - tw) / 0.9);
      EN.layers(ctx, c, [[0.6, x => { L.wallpaper(x, -1500, -900, 3000, 1120, '#6A5A7A', '#7A6A8A', 56); K.blinds(x, -700, -640, 520, 360, '#1E2A44', { scene: g => nightCity(g, lt), down: 0.25 });
          rr(x, 300, -620, 280, 200, 6); ink(x, '#C8954F', 6); rr(x, 320, -600, 240, 160, 4); ink(x, '#9CC7D8', 4); x.fillStyle = '#5B4636'; x.fillRect(-1500, 220, 3000, 700); L.planks(x, -1500, 220, 3000, 700, '#6B5038'); }],
        [1, x => { K.floorLamp(x, -1100, 260, 1, true); K.couch(x, -300, 300, 640, '#B5793F');
          toon(x, -440, 300, 1.05, C.dad, sp > 0 && sp < 1 ? { la: [0.4, -0.3], ra: [0.8, -2.2], lean: -0.15 } : 'drink', sp > 0 ? 'shock' : 'happy', { t: lt, itemR: g => { g.rotate(2.6); K.can(g, 0, 40, 0.42, { label: 'NEW' }); } });
          toon(x, -160, 300, 1.0, C.mom, sp > 0 ? 'shock' : 'stand', sp > 0 ? 'disgust' : 'neutral', { t: lt }); toon(x, 120, 300, 0.8, C.boy, sp > 0 ? 'facepalm' : 'stand', sp > 0 ? 'shock' : 'happy', { t: lt });
          K.spray(x, -400, -40, sp, 1); K.tv85(x, 760, 330, 1.2, (g, sx, sy, sw, sh) => { g.fillStyle = '#2F6DB5'; g.fillRect(sx, sy, sw, sh); K.can(g, sx + sw / 2, sy + sh - 20, 0.85, { label: 'NEW' }); fitText(g, 'NEWS', sx + 50, sy + 24, 22, YELLOW, 80); });
          K.plant(x, 1150, 300, 1.1, lt); }]]);
      L.word(ctx, 'AMERICA DID NOT TAKE IT WELL', 960, 150, pop(lt, L1('n3', 'not', t7)), { size: 76, col: YELLOW });
    } },
  { name: 'stocking up: the sagging car', t0: t8, era: 'tense', out: { type: 'whip', dur: 0.3, dir: 1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -200, 0, 1.1], [2.2, 100, 40, 0.98]], lt), n = Math.min(7, Math.floor(lt * 4) + 1), sag = Math.min(1, n / 7), dt = (lt * 4) % 1;
      EN.layers(ctx, c, [[0.4, x => { L.skyGrad(x, -1600, -1000, 3200, 1300, ['#3B4A7A', '#C27A6A']); }],
        [0.7, x => { x.fillStyle = '#E9E3D6'; rr(x, -1500, -600, 1900, 800, 4); ink(x, '#D9D2C2', 6); rr(x, -1400, -560, 1700, 120, 8); ink(x, '#2F8A6A', 6); fitText(x, 'SUPERMARKET', -550, -500, 80, CREAM, 1600);
          for (let i = 0; i < 3; i++) { rr(x, -1350 + i * 560, -380, 460, 300, 6); ink(x, '#BFE3F0', 5); for (let r = 0; r < 2; r++) { rr(x, -1330 + i * 560, -300 + r * 120, 420, 10, 3); ink(x, '#C9CDD2', 3); for (let k = 0; k < 9; k++) if (i > 0 || r > 0) P.bottle(x, -1300 + i * 560 + k * 44, -302 + r * 120, 0.3, { kind: 'contour', label: '' }); } } x.save(); x.translate(-850, -230); x.rotate(-0.06); rr(x, -230, -40, 460, 80, 6); ink(x, YELLOW, 5); fitText(x, 'OLD COKE: SOLD OUT', 0, 2, 40, RED, 420); x.restore(); }],
        [1, x => { x.fillStyle = '#4A4F5C'; x.fillRect(-1600, 200, 3200, 700); for (let i = 0; i < 8; i++) { rr(x, -1500 + i * 420, 400, 200, 14, 4); ink(x, '#E9E3D6', 0); }
          // station wagon, rear sags as crates pile in
          x.save(); x.translate(250, 340); x.rotate(sag * 0.07); rr(x, -380, -230, 760, 180, 30); ink(x, '#7FA8C8', 6); rr(x, -330, -310, 520, 110, 20); ink(x, '#7FA8C8', 6); rr(x, -300, -295, 200, 80, 10); ink(x, '#BFE3F0', 4); rr(x, -80, -295, 220, 80, 10); ink(x, '#BFE3F0', 4);
          for (let i = 0; i < n; i++) P.crate(x, 250 + (i % 2) * 14, -230 - i * 36, 0.62, { n: 3, kind: 'contour', text: 'OLD COKE' }); x.restore();
          for (const wx of [-230, 230]) { x.save(); x.translate(250 + wx, 340 + (wx > 0 ? sag * 10 : 0)); x.scale(1 + (wx > 0 ? sag * 0.25 : 0), 1 - (wx > 0 ? sag * 0.2 : 0)); x.beginPath(); x.arc(0, -50, 52, 0, 6.27); ink(x, '#2A2628', 5); x.beginPath(); x.arc(0, -50, 22, 0, 6.27); ink(x, '#B8B2A8', 4); x.restore(); }
          toon(x, 720, 330 - Math.abs(Math.sin(lt * 8)) * 6, 1.05, C.trucker, 'carry', 'determined', { t: lt, itemR: g => { for (let i = 0; i < 4; i++) P.crate(g, -50, -20 - i * 36, 0.55, { n: 3, kind: 'contour' }); } }); K.sweat(x, 780, 0, 1.2, lt);
          toon(x, -700, 330, 1.0, C.mom, 'carry', 'smug', { t: lt + 2, itemR: g => { for (let i = 0; i < 3; i++) P.crate(g, -50, -20 - i * 36, 0.55, { n: 3, kind: 'contour' }); } }); }]]);
      L.word(ctx, 'STOCKING UP', 960, 140, pop(lt, 0.4), { size: 92, col: YELLOW });
    } },
  { name: 'protest groups march', t0: t9, era: 'tense', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 260, 10, 1.12], [2.2, -160, 10, 1.0]], lt), sh = EN.shake(lt, [0.15, 1.1], 8);
      EN.layers(ctx, { ...c, x: c.x + sh.x, y: c.y + sh.y }, [[0.3, x => nightCity(x, lt)],
        [0.7, x => { x.fillStyle = '#3A3F4D'; x.fillRect(-1700, 160, 3400, 800); P.crowd(x, -1500, 1500, 180, 0.6, 16, lt, { react: 'angry', seed: 11 }); }],
        [1, x => { const signs = ['BRING BACK|OLD COKE!', 'WE WANT THE|ORIGINAL', 'HANDS OFF|OUR COKE', 'NO NEW|COKE!'];
          for (let i = 0; i < 4; i++) { const px = -1050 + i * 700, py = -150 + Math.sin(lt * 7 + i) * 14; K.sign(x, px, py, 500, 210, signs[i], { rot: Math.sin(lt * 4 + i) * 0.07, bg: i % 2 ? CREAM : YELLOW }); }
          P.crowd(x, -1300, 1300, 420, 1.0, 7, lt, { react: 'angry', seed: 2 });
          toon(x, 60, 430, 1.1, C.protester, 'fist', 'angry', { t: lt, talk: 0.8, itemL: g => { g.rotate(-1.2); poly(g, [[-10, -14], [40, -40], [40, 40], [-10, 14]]); ink(g, YELLOW, 4); } }); }]]);
      L.word(ctx, 'PROTEST GROUPS', 960, 140, pop(lt, L1('n3', 'groups', t9) - 0.2), { size: 88, col: CREAM });
    } },
  { name: 'the hotline drowns: 1,500 calls a day, a phone melts', t0: t10, era: 'tense', out: { type: 'whip', dur: 0.35, dir: -1 }, draw(ctx, t, lt) {
      const tf = L1('n3', 'fifteen', t10), melt = clamp((lt - tf - 0.6) / 1.6), c = EN.cam([[0, 0, 0, 1.0], [tf, 0, 10, 1.05], [tf + 2.2, 260, 110, 1.6]], lt);
      EN.layers(ctx, c, [[0.6, x => { L.wallpaper(x, -1500, -900, 3000, 1120, '#4A5268', '#545C74', 60); K.callBoard(x, -760, -560, 1520, 380, lt); P.clock(x, 1000, -400, 70, lt * 4, { rim: '#4A4F5C' }); P.poster(x, -1100, -380, 300, 200, { title: 'WE LISTEN!', sub: 'CALL US', bg: CREAM }); x.fillStyle = '#3A3F4D'; x.fillRect(-1500, 220, 3000, 700); }],
        [0.85, x => { for (let i = 0; i < 4; i++) { const dx = -1200 + i * 800; toon(x, dx - 60, 230, 0.8, [C.operator2, C.operator3, C.operator, C.grown][i], i % 2 ? 'shock' : 'facepalm', 'worried', { t: lt + i }); K.headset(x, dx - 60, 230, 0.8); K.desk(x, dx, 250, 380); P.phone(x, dx + 80, 100, 0.6, lt, true); } }],
        [1, x => { toon(x, -110, 400, 1.15, C.operator, 'shock', lt > tf ? 'shock' : 'worried', { t: lt }); K.headset(x, -110, 400, 1.15); K.sweat(x, -40, 60, 1.3, lt); K.desk(x, 0, 420, 700); for (let i = 0; i < 9; i++) { x.save(); x.translate(-300 + (i % 3) * 14, 260 - i * 14); x.rotate((hash(i) - 0.5) * 0.3); rr(x, -70, -10, 140, 18, 3); ink(x, '#FFFFFF', 3); x.restore(); }
          if (melt <= 0) P.phone(x, 160, 270, 0.9, lt, true); else K.meltPhone(x, 160, 270, 0.9, melt, lt);
          for (let i = 0; i < 6; i++) { const ph = (lt * 1.5 + i / 6) % 1; x.save(); x.globalAlpha = 1 - ph; fitText(x, 'RING!', 160 + Math.cos(i * 1.05) * (90 + ph * 180), 170 + Math.sin(i * 1.05) * (50 + ph * 120) - 40, 34, YELLOW, 120, { outline: 6 }); x.restore(); } }]]);
      L.dateCard(ctx, 'BY JUNE', 300, 150, pop(lt, L1('n3', 'june', t10)), { size: 70 });
      L.plate(ctx, '1,500 CALLS A DAY', 1400, 160, pop(lt, tf), { size: 70, bg: RED, fg: CREAM });
    } },
  { name: 'the wrong question', t0: t11, era: 'tense', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, 10, 1.0], [3.2, 0, -10, 1.15]], lt), tw = L1('n4', 'wrong', t11);
      EN.layers(ctx, c, [[0.6, x => { labRoom(x, lt); x.save(); x.globalAlpha = 0.55; x.fillStyle = '#10142A'; x.fillRect(-1600, -1000, 3200, 2000); x.restore(); K.spot(x, 0, -900, 400, 200, 1100, 0.25); }],
        [1, x => { x.save(); x.translate(80, -40); x.rotate(-0.03); rr(x, -380, -330, 760, 560, 14); ink(x, '#8A6A4A', 6); rr(x, -340, -290, 680, 490, 6); ink(x, '#FFFFFF', 4); rr(x, -90, -360, 180, 60, 10); ink(x, '#C9CDD2', 5);
            fitText(x, 'TASTE SURVEY', 0, -230, 50, INK, 600); fitText(x, 'WHICH ONE TASTES BETTER?', 0, -150, 40, INK, 620, { font: L.F.type });
            for (const [i, lab] of [[0, 'A'], [1, 'B']]) { rr(x, -200 + i * 260, -80, 70, 70, 6); ink(x, '#FFF', 5); fitText(x, lab, -100 + i * 260, -45, 50, INK, 60); }
            K.markerPath(x, K.checkPts(-165 + 260, -45, 40), pop(lt, 0.3, 0.5), BLUE, 10); fitText(x, 'DID YOU GROW UP WITH IT?', 0, 100, 34, '#9AA3AE', 620, { font: L.F.type }); x.restore();
          toon(x, -740, 330, 1.1, C.scientist, lt > tw ? 'facepalm' : 'think', lt > tw ? 'shock' : 'think', { t: lt }); }]]);
      K.stamp(ctx, 'WRONG QUESTION', 1000, 520, pop(lt, tw, 0.3), { size: 96 });
    } },
  { name: 'not just a flavor: a sip turns warm', t0: t12, era: 'tense', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -40, 1.1], [2.4, 0, -80, 1.3]], lt), warm = clamp((lt - 0.8) / 1.4);
      EN.layers(ctx, c, [[0.5, x => { labRoom(x, lt); x.save(); x.globalAlpha = warm * 0.65; L.glow(x, 0, -200, 1100, '#FFB070', 1); x.restore(); }],
        [1, x => { toon(x, -120, 330, 1.3, C.grown, lt < 0.9 ? 'drink' : 'hold', lt < 0.9 ? 'think' : 'happy', { t: lt, itemR: g => { if (lt < 0.9) g.rotate(2.6); P.bottle(g, 0, 40, 0.5, { kind: 'contour', open: true, fill: 0.6 }); } });
          if (warm > 0) { x.save(); x.globalAlpha = warm; for (let i = 0; i < 3; i++) { x.beginPath(); x.arc(30 + i * 60, -150 - i * 50, 14 + i * 6, 0, 6.27); ink(x, '#FFFFFF', 4); }
            rr(x, 160, -480, 560, 330, 160); ink(x, '#FFF4E0', 6); x.save(); rr(x, 170, -470, 540, 310, 150); x.clip(); L.skyGrad(x, 160, -480, 560, 330, ERA.sepia.sky); P.fountain(x, 440, -180, 0.42, { w: 900, era: 'sepia' });
              toon(x, 350, -205, 0.4, C.grandpa, 'stand', 'laugh', { t: lt }); toon(x, 530, -205, 0.32, C.boy, 'cheer', 'laugh', { t: lt }); x.restore(); x.restore(); }
          P.sparkles(x, -120, -120, 260, lt, 8 * warm | 0, '#FFD58A'); }]]);
      L.word(ctx, 'NOT JUST A FLAVOR', 960, 160, pop(lt, L1('n4', 'flavor', t12) - 0.3), { size: 88, col: YELLOW });
    } },
  { name: 'flashback: grandpa and the kid at the fountain', t0: t13, era: 'sepia', finish: { vignette: 0.55 }, out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -80, -120, 1.05], [3, 40, -140, 1.2]], lt);
      EN.layers(ctx, c, [[0.6, x => { L.wallpaper(x, -1500, -900, 3000, 1100, '#E2C394', '#D5B07C'); P.shelves(x, -1200, -640, 700, 420, { rows: 3, seed: 3 }); rr(x, -300, -700, 600, 140, 12); ink(x, RED, 6); fitText(x, 'SODA FOUNTAIN', 0, -630, 64, CREAM, 560);
          rr(x, 600, -640, 460, 640, 120); ink(x, '#C9302C', 6); rr(x, 650, -560, 360, 300, 80); ink(x, '#F7D27A', 5); for (let i = 0; i < 5; i++) { x.beginPath(); x.arc(830, -410, 40 + i * 26, Math.PI, 0); ink(x, null, 3); } L.glow(x, 830, -420, 300, '#FFD58A', 0.35); L.planks(x, -1500, 200, 3000, 700, '#B98A55'); }],
        [1, x => { P.fountain(x, 0, 230, 1.0, { w: 1400, era: 'sepia', stools: false });
          for (const sx of [-260, 230]) { rr(x, sx - 8, 230, 16, 160, 4); ink(x, '#8A8F96', 4); ell(x, sx, 230, 70, 18); ink(x, RED, 5); }
          toon(x, -260, 290, 1.1, C.grandpa, { la: [0.2, 0.1], ra: [0.9, -0.9], sit: 0 }, 'laugh', { t: lt });
          toon(x, 230, 290, 0.85, C.boy, 'cheer', lt > 1.4 ? 'laugh' : 'grin', { t: lt });
          P.bottle(x, -10, -30, 0.9, { kind: 'contour', open: true, fill: 0.5 - lt * 0.05 }); for (const [a, b] of [[-0.35, -1], [0.3, 1]]) { x.save(); x.translate(-10, -235); x.rotate(a); rr(x, -5, -110, 10, 130, 4); ink(x, b < 0 ? '#FFFFFF' : '#F7C548', 3); x.restore(); }
          for (let i = 0; i < 18; i++) { const ph = (lt * 0.15 + hash(i)) % 1; x.save(); x.globalAlpha = 0.5 * Math.sin(ph * Math.PI); x.beginPath(); x.arc(-900 + hash(i * 3) * 1800, 300 - ph * 900, 4, 0, 6.27); x.fillStyle = '#FFF4D6'; x.fill(); x.restore(); } }]]);
      // old photo edge
      ctx.save(); ctx.lineWidth = 34; ctx.strokeStyle = '#F4EBD8'; rr(ctx, 17, 17, W - 34, H - 34, 30); ctx.stroke(); ctx.restore();
      L.word(ctx, 'SOMETHING THEY GREW UP WITH', 960, 120, pop(lt, L1('n4', 'grew', t13) - 0.3), { size: 70, col: CREAM });
    } },
  { name: 'it belonged to them: a corporate hand takes the bottle out of the memory', t0: t14, era: 'tense', out: { type: 'tear', dur: 0.45 }, draw(ctx, t, lt) {
      const tc = L1('n4', 'company', t14), grab = clamp((lt - tc + 0.5) / 2.4), reach = E.inOut(clamp(grab / 0.4)), back = clamp((grab - 0.55) / 0.45), c = EN.cam([[0, 150, -130, 1.9], [1.3, 0, -20, 1.0], [5, 0, -40, 1.05]], lt);
      EN.layers(ctx, c, [[0.6, x => { L.wallpaper(x, -1500, -900, 3000, 1120, '#5A6378', '#646D82', 60); K.floorLamp(x, 1100, 220, 1, true); x.fillStyle = '#3A3F4D'; x.fillRect(-1500, 220, 3000, 700); }],
        [1, x => { // the man holds a framed photo of the flashback
          toon(x, -680, 340, 1.15, C.grown, grab > 0.45 ? 'shock' : 'point', grab > 0.45 ? 'shock' : 'happy', { t: lt }); P.clock(x, -1000, -420, 60, lt, { rim: '#8A5A33' }); K.plant(x, 1150, 340, 1.1, lt);
          x.save(); x.translate(150, -130); x.scale(1.2, 1.2); rr(x, -330, -230, 660, 440, 10); ink(x, '#8A5A33', 10); rr(x, -300, -200, 600, 380, 4); x.save(); x.clip(); L.wallpaper(x, -300, -200, 600, 380, '#E2C394', '#D5B07C'); P.fountain(x, 0, 140, 0.45, { w: 1300, era: 'sepia', stools: false });
            toon(x, -140, 170, 0.5, C.grandpa, 'stand', grab > 0.5 ? 'angry' : 'laugh', { t: lt }); toon(x, 130, 170, 0.4, C.boy, grab > 0.5 ? 'shock' : 'cheer', grab > 0.5 ? 'sad' : 'laugh', { t: lt });
            x.save(); x.globalAlpha = 0.25; x.fillStyle = '#C08A40'; x.fillRect(-300, -200, 600, 380); x.restore();
            if (grab < 0.45) P.bottle(x, 0, 30, 0.42, { kind: 'contour', open: true }); x.restore(); x.restore();
          // giant comic hand in a suit sleeve from the top right
          const hx = lerp(950, 190, reach) + E.in(back) * 1300, hy = lerp(-760, -300, reach) - E.in(back) * 900;
          if (grab > 0) { x.save(); x.translate(hx, hy); x.rotate(-0.6); rr(x, -70, -900, 140, 860, 20); ink(x, '#2A3140', 7); rr(x, -78, -70, 156, 50, 10); ink(x, '#F4F0E6', 6); ell(x, 0, -48, 10, 10); ink(x, YELLOW, 3);
            ell(x, 0, 30, 80, 70); ink(x, '#E8B58A', 7); for (let i = 0; i < 3; i++) { rr(x, -54 + i * 40, 60, 30, 70, 14); ink(x, '#E8B58A', 6); } if (grab > 0.45) { x.save(); x.translate(0, 110); x.rotate(0.6); P.bottle(x, 0, 60, 0.6, { kind: 'contour', open: true }); x.restore(); } x.restore(); } }]]);
      L.plate(ctx, 'IT BELONGED TO THEM', 1360, 960, pop(lt, L1('n4', 'belonged', t14)), { size: 66, bg: YELLOW });
    } },
  { name: '79 days of torn calendar pages -> JULY 11, 1985', t0: t15, era: 'tense', out: { type: 'whip', dur: 0.3, dir: 1 }, draw(ctx, t, lt) {
      const ts = L1('n5', 'seventy', t15), d = Math.min(79, Math.floor(clamp((lt - 0.4) / (ts + 0.6)) * 79)), c = EN.cam([[0, 0, 0, 1.15], [3.4, 0, 10, 1.0]], lt);
      EN.layers(ctx, c, [[0.4, x => { const day = Math.sin(lt * 9) > 0; L.skyGrad(x, -1600, -1000, 3200, 1300, day ? ['#5A8AC0', '#C9DCEB'] : TN.sky); }],
        [0.7, x => { L.wallpaper(x, -1500, -900, 3000, 1120, '#4A5268', '#545C74', 60); x.save(); x.beginPath(); x.rect(-1300, -620, 520, 420); x.rect(780, -620, 520, 420); x.clip('evenodd'); x.restore();
          for (const wx of [-1300, 780]) { const day = Math.sin(lt * 9 + wx) > 0; rr(x, wx, -620, 520, 420, 6); ink(x, day ? '#9CC7E8' : '#1E2A44', 6); x.save(); rr(x, wx, -620, 520, 420, 6); x.clip(); if (day) { x.beginPath(); x.arc(wx + 260 + Math.cos(lt * 9) * 160, -380 - Math.abs(Math.sin(lt * 9)) * 120, 50, 0, 6.27); ink(x, YELLOW, 5); } else { x.beginPath(); x.arc(wx + 260, -480, 40, 0, 6.27); ink(x, CREAM, 5); } x.restore();
            x.beginPath(); x.moveTo(wx + 260, -620); x.lineTo(wx + 260, -200); x.moveTo(wx, -410); x.lineTo(wx + 520, -410); ink(x, null, 5); } x.fillStyle = '#3A3F4D'; x.fillRect(-1500, 220, 3000, 700); }],
        [1, x => { const flip = (lt * 6) % 1; K.bigCalendar(x, 0, -120, 2.2, d < 79 ? '1985' : 'JULY 1985', d < 79 ? 'DAY' : 'JULY', d < 79 ? String(d + 1) : '11', d < 79 ? flip : 0, String(Math.max(1, d)));
          for (let i = 0; i < 10; i++) { const ph = (lt * 1.6 + i * 0.1) % 1; if (d < 79 && ph > 0.12) { x.save(); x.translate((180 + ph * 900) * (i % 2 ? 1 : -1), -260 + ph * 600 - Math.sin(ph * 3) * 200); x.rotate(ph * 5 + i); x.globalAlpha = 1 - ph; rr(x, -60, -50, 120, 100, 6); ink(x, CREAM, 3); x.restore(); } }
          toon(x, -640, 330, 1.05, C.grown, d < 79 ? 'arms' : 'cheer', d < 79 ? 'sleepy' : 'laugh', { t: lt }); }]]);
      L.dateCard(ctx, 'JULY 11, 1985', 400, 170, pop(lt, L1('n5', 'july', t15)), { size: 84 });
      L.plate(ctx, `${Math.max(1, d)} DAYS`, 1500, 170, pop(lt, 0.5), { size: 74, bg: d >= 79 ? RED : CREAM, fg: d >= 79 ? CREAM : INK });
    } },
  { name: 'comeback parade: COCA-COLA CLASSIC', t0: t16, era: 'pop', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -300, 40, 1.15], [3.4, 200, 20, 1.0]], lt), tc = L1('n5', 'classic', t16);
      EN.layers(ctx, c, [[0.3, x => { L.skyGrad(x, -1700, -1000, 3400, 1300, ERA.pop.sky); L.cloud(x, -700 + lt * 20, -650, 1.3); L.cloud(x, 600 + lt * 12, -720, 1); }],
        [0.6, x => { for (let i = 0; i < 9; i++) P.storefront(x, -1900 + i * 440, 180, { w: 420, h: 480 + (i % 3) * 60, col: ['#C96A4B', '#D9B25A', '#7FA8C8', '#B86B4B'][i % 4], sign: ['DINER', 'RECORDS', 'HARDWARE', 'BAKERY', 'BARBER', 'MOVIES', 'DRUGS', 'TOYS', 'BANK'][i], awning: [[RED, CREAM], [BLUE, CREAM], [YELLOW, '#5A3420']][i % 3], upper: 2 });
          for (let i = 0; i < 12; i++) { x.save(); x.translate(-1700 + i * 300, -420); x.beginPath(); x.moveTo(0, 0); x.lineTo(300, 0); x.strokeStyle = INK; x.lineWidth = 3; x.stroke(); for (let k = 0; k < 6; k++) { poly(x, [[k * 50, 0], [k * 50 + 40, 0], [k * 50 + 20, 40]]); ink(x, [RED, YELLOW, BLUE][k % 3], 3); } x.restore(); } }],
        [0.85, x => { x.fillStyle = '#8A8F96'; x.fillRect(-1900, 180, 3800, 900); P.crowd(x, -1700, 1700, 230, 0.62, 18, lt, { react: 'cheer', seed: 7 }); }],
        [1, x => { const fx = -500 + lt * 150; x.save(); x.translate(fx, 400); rr(x, -460, -120, 920, 120, 20); ink(x, '#F4F0E6', 6); for (let i = 0; i < 14; i++) { x.beginPath(); x.arc(-440 + i * 68, -120, 34, Math.PI, 0); ink(x, i % 2 ? RED : CREAM, 4); }
            for (const wx of [-300, 300]) { x.beginPath(); x.arc(wx, 0, 46, 0, 6.27); ink(x, '#2A2628', 5); }
            x.save(); x.translate(0, -120); x.rotate(Math.sin(lt * 3) * 0.04); P.bottle(x, 0, 0, 2.5, { kind: 'contour', label: 'CLASSIC' }); x.restore(); P.sparkles(x, 0, -400, 300, lt, 8);
            rr(x, -420, -100, 840, 70, 10); ink(x, RED, 5); fitText(x, 'COCA-COLA CLASSIC', 0, -64, 50, CREAM, 800); x.restore();
          toon(x, fx - 700, 400, 1.0, C.teen, 'cheer', 'laugh', { t: lt }); toon(x, fx + 700, 400, 1.0, C.dad, 'cheer', 'laugh', { t: lt + 1 }); K.confetti(x, -1300, 1300, -700, 1300, lt, 80, 3); }]]);
      L.word(ctx, "IT'S BACK!", 960, 150, pop(lt, tc - 0.3), { size: 110, col: YELLOW });
    } },
  { name: 'newspaper spin: IT IS BACK', t0: t17, era: 'pop', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, 0, 1.0], [2.5, 0, 0, 1.08]], lt), sp = E.out(clamp(lt / 0.8));
      EN.layers(ctx, c, [[0.4, x => { for (let i = 0; i < 24; i++) { x.save(); x.rotate(i / 24 * 6.283 + lt * 0.3); poly(x, [[0, 0], [1800, -120], [1800, 120]]); x.fillStyle = i % 2 ? '#F7C548' : '#F2A65A'; x.fill(); x.restore(); } }],
        [1, x => { x.save(); x.rotate((1 - sp) * 12); x.scale(sp, sp); rr(x, -520, -330, 1040, 660, 6); ink(x, '#F4F0E6', 7); fitText(x, 'THE DAILY NEWS', 0, -270, 54, INK, 900, { font: L.F.type }); x.beginPath(); x.moveTo(-480, -230); x.lineTo(480, -230); ink(x, null, 4);
            fitText(x, 'THE ORIGINAL IS BACK!', 0, -160, 92, INK, 960); P.bottle(x, -280, 260, 1.15, { kind: 'contour', label: 'CLASSIC' }); K.face(x, -280, 80, 1.2, 'happy');
            for (let i = 0; i < 9; i++) { rr(x, -40, -60 + i * 34, 460 - (i % 3) * 60, 14, 4); ink(x, '#C9C1B0', 0); } x.restore(); }]]);
      L.plate(ctx, 'IN 2 DAYS', 1560, 930, pop(lt, L1('n5', 'two', t17)), { size: 64, bg: CREAM });
    } },
  { name: '31,000+ calls: the hotline explodes (happily)', t0: t18, era: 'tense', out: { type: 'whip', dur: 0.35, dir: 1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, 30, 1.15], [3.4, 0, 30, 0.95]], lt), tn = L1('n5', 'thirty', t18), cnt = 31000 * E.out(clamp((lt - tn + 0.3) / 1.3)), lev = clamp(lt / 3.5);
      EN.layers(ctx, c, [[0.6, x => { L.wallpaper(x, -1500, -900, 3000, 1120, '#4A5268', '#545C74', 60); K.callBoard(x, -620, -720, 1240, 330, lt * 2, 'HOTLINE: OLD COKE IS BACK'); x.fillStyle = '#3A3F4D'; x.fillRect(-1500, 220, 3000, 700); }],
        [1, x => { for (let i = 0; i < 3; i++) { const dx = -800 + i * 800; K.desk(x, dx, 330, 420); toon(x, dx - 70, 330, 0.95, [C.operator, C.operator2, C.operator3][i], i === 1 ? 'cheer' : 'shock', i === 1 ? 'laugh' : 'shock', { t: lt + i }); K.headset(x, dx - 70, 330, 0.95); }
          for (let i = 0; i < 16; i++) { const ph = (lt * 0.9 + hash(i * 2.1)) % 1; x.save(); x.translate(-1300 + hash(i * 5) * 2600, 200 - ph * 1100 + 300); x.rotate(ph * 8 + i); P.phone(x, 0, 0, 0.45, lt, true); x.restore(); }
          // rising sea of phone slips
          x.save(); x.beginPath(); x.moveTo(-1600, 700); for (let i = 0; i <= 40; i++) x.lineTo(-1600 + i * 80, 560 - lev * 380 + Math.sin(lt * 4 + i) * 16); x.lineTo(1600, 700); x.closePath(); ink(x, '#F4F0E6', 5); x.clip();
          for (let i = 0; i < 60; i++) { x.save(); x.translate(-1500 + hash(i) * 3000, 560 - lev * 380 + hash(i * 2) * 300); x.rotate(hash(i * 3) * 3); rr(x, -40, -10, 80, 20, 3); ink(x, ['#FFF', '#F7E9B0', '#FFD9D0'][i % 3], 2.5); x.restore(); } x.restore(); }]]);
      L.plate(ctx, `${K.fmt(cnt)}${cnt >= 30999 ? '+' : ''} CALLS`, 960, 170, pop(lt, tn - 0.3), { size: 96, bg: RED, fg: CREAM });
    } },
  { name: 'the museum of marketing mistakes', t0: t19, era: 'tense', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -400, 20, 1.15], [2.4, 0, 20, 1.0], [4.4, 0, 0, 1.1]], lt), tb = L1('n6', 'biggest', t19);
      EN.layers(ctx, c, [[0.5, x => { L.skyGrad(x, -1700, -1000, 3400, 1300, ['#2A2440', '#4A3A5E']); for (let i = 0; i < 7; i++) K.column(x, -1500 + i * 500, 230, 900, 100, '#D9D2C2'); rr(x, -1700, -790, 3400, 120, 0); ink(x, '#C9C1B0', 6);
          fitText(x, 'MUSEUM OF MARKETING MISTAKES', 0, -730, 64, '#5A4A3A', 1800); x.fillStyle = '#8A7A6A'; x.fillRect(-1700, 230, 3400, 700); L.tiles(x, -1700, 230, 3400, 700, '#9A8A78', '#8A7A6A', 90); }],
        [0.8, x => { // made-up silly exhibits (jokes, clearly invented)
          K.pedestal(x, -1050, 230, 200, 180, 'SQUARE WHEEL'); rr(x, -1110, -110, 120, 120, 8); ink(x, '#5A4A3A', 6); x.beginPath(); x.arc(-1050, -50, 12, 0, 6.27); ink(x, '#C9C1B0', 4);
          K.pedestal(x, 1050, 230, 200, 180, 'GLASS HAMMER'); x.save(); x.translate(1050, -80); x.rotate(0.4); rr(x, -12, -20, 24, 130, 6); ink(x, 'rgba(200,235,250,0.6)', 4); rr(x, -60, -50, 120, 44, 8); ink(x, 'rgba(200,235,250,0.6)', 4); x.restore(); }],
        [1, x => { K.spot(x, 0, -900, 230, 160, 700, 0.3); K.pedestal(x, 0, 330, 300, 260, 'NEW COKE · 1985'); K.can(x, 0, 50, 1.1, { label: 'NEW', face: 'sad' }); K.glassCase(x, 0, 70, 280, 360);
          toon(x, -460, 380, 1.1, C.guide, 'point', 'smug', { t: lt, talk: 0.5 }); P.crowd(x, 380, 1150, 390, 0.95, 4, lt, { pose: 'shrug', expr: 'laugh', seed: 31 }); }]]);
      K.stamp(ctx, 'ONE OF THE BIGGEST MARKETING MISTAKES EVER', 960, 180, pop(lt, tb - 0.1, 0.3), { size: 58, maxW: 1700 });
    } },
  { name: 'how much people cared: the chart becomes a heart', t0: t20, era: 'tense', out: { type: 'cut' }, draw(ctx, t, lt) {
      const th = L1('n6', 'how', t20), tt = L1('n6', 'taste', t20), hu = clamp((lt - th + 0.2) / 0.9), c = EN.cam([[0, 0, -40, 1.0], [th, 0, -60, 1.04], [th + 2.5, 0, -100, 1.1]], lt);
      EN.layers(ctx, c, [[0.6, x => { L.wallpaper(x, -1500, -900, 3000, 1120, '#3A4260', '#424A6A', 60); K.blinds(x, 900, -620, 440, 360, '#1E2A44', { scene: g => nightCity(g, lt) }); x.fillStyle = '#3A3F4D'; x.fillRect(-1500, 230, 3000, 700); }],
        [1, x => { rr(x, -640, -620, 1280, 820, 14); ink(x, '#C9CDD2', 7); rr(x, -610, -590, 1220, 760, 6); ink(x, '#FFFFFF', 4);
          x.beginPath(); x.moveTo(-520, -540); x.lineTo(-520, 100); x.lineTo(540, 100); ink(x, null, 5);
          for (const [i, lab, h, col] of [[0, 'OLD', 260, '#8A8F96'], [1, 'NEW', 330, RED], [2, 'PEPSI', 290, BLUE]]) { const g = lt > tt ? 1 - clamp((lt - tt) / 0.6) * 0.6 : 1; rr(x, -420 + i * 300, 100 - h * g, 160, h * g, 6); ink(x, col, 5); fitText(x, lab, -340 + i * 300, 140, 34, INK, 200); }
          fitText(x, 'TASTE SCORE', 0, -540, 44, INK, 600, { font: L.F.type });
          if (hu > 0) { x.save(); x.translate(0, -250); x.scale(1 + E.back(clamp((lt - th - 1.0) / 0.6), 2) * 0.25, 1 + E.back(clamp((lt - th - 1.0) / 0.6), 2) * 0.25); if (hu >= 1) { x.save(); poly(x, K.heartPts(0, 0, 250)); x.globalAlpha = 0.5 + 0.2 * Math.sin(lt * 9); x.fillStyle = RED; x.fill(); x.restore(); } K.markerPath(x, K.heartPts(0, 0, 250), hu, RED, 22); x.restore(); P.sparkles(x, 0, -200, 420, lt, 10, '#FFB0B0'); }
          toon(x, 620, 360, 1.1, C.exec, lt > th ? 'point' : 'shrug', lt > th ? 'happy' : 'worried', { t: lt, flip: true }); }]]);
      L.plate(ctx, 'HOW MUCH PEOPLE CARED', 960, 960, pop(lt, th + 0.4), { size: 76, bg: RED, fg: CREAM });
    } },
];
EN.run({ module, dir: __dirname, TL, scenes, card: { n: 'CHAPTER 6', title: 'New Coke', sub: '1985', era: 'tense' },
  cues: () => [['bell', 0.4, 0.5], ['whoosh', 2.7, 0.5], ['fizz', 3.4, 0.5], ['slidedown', at('n1', 'sweeter'), 0.5], ['boing', at('n1', 'sweeter') + 0.45, 0.5],
    ['murmur', t2 + 0.2, 0.35], ['tick', at('n1', 'two'), 0.5], ['tick', at('n1', 'two') + 0.25, 0.5], ['tick', at('n1', 'two') + 0.5, 0.5], ['ding', at('n1', 'consumers'), 0.5],
    ['drumroll', t3 + 0.3, 0.35], ['ding', at('n1', 'beat'), 0.6], ['crowdcheer', t4 + 0.1, 0.35], ['slidedown', at('n1', 'pepsi') + 0.15, 0.5], ['boing', at('n1', 'pepsi') + 0.6, 0.45],
    ['stamp', at('n2', 'april'), 0.6], ['steps', t5 + 0.3, 0.5], ['shutter', t6 + 0.3, 0.5], ['shutter', t6 + 1.4, 0.5], ['slideup', at('n2', 'replacing'), 0.5], ['shutter', t6 + 2.6, 0.5], ['sparkle', at('n2', 'replacing') + 0.7, 0.5],
    ['gasp', at('n3', 'well') - 0.5, 0.6], ['puff', at('n3', 'well') - 0.45, 0.6], ['clank', t8 + 0.3, 0.4], ['clank', t8 + 0.8, 0.4], ['boing', t8 + 1.6, 0.4],
    ['crowdboo', t9 + 0.1, 0.4], ['ring', t10 + 0.2, 0.4], ['ring', t10 + 1.6, 0.35], ['stamp', at('n3', 'fifteen'), 0.5], ['rumble', at('n3', 'fifteen') + 0.7, 0.4],
    ['stamp', at('n4', 'wrong'), 0.6], ['sparkle', t12 + 0.8, 0.5], ['glassclink', t13 + 0.6, 0.6], ['whoosh', at('n4', 'company') - 0.2, 0.5], ['pop', at('n4', 'taken'), 0.6],
    ['flap', t15 + 0.4, 0.5], ['flap', t15 + 1.5, 0.5], ['ding', at('n5', 'july'), 0.6], ['crowdcheer', t16 + 0.2, 0.5], ['cymbal', at('n5', 'classic'), 0.4], ['whoosh', t17, 0.5], ['paper', t17 + 0.6, 0.8],
    ['ring', t18 + 0.2, 0.4], ['kaching', at('n5', 'thirty'), 0.5], ['ring', t18 + 1.8, 0.35], ['steps', t19 + 0.3, 0.4], ['stamp', at('n6', 'biggest') - 0.1, 0.6], ['boing', at('n6', 'biggest') + 0.7, 0.3],
    ['slidedown', at('n6', 'taste'), 0.4], ['heartbeat', at('n6', 'how') + 0.4, 0.7], ['sparkle', at('n6', 'cared'), 0.5]],
  music: [[0, 'tension'], [t4, 'pop'], [t7, 'tension'], [t12, 'soft'], [t15, 'build'], [t16, 'up'], [t19, 'calm']] });
