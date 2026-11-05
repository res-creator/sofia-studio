// Chapter 0 — cold open (h1–h4, no chapter card, voice from 0.25 s).
// Frame 0: a tidal wave made of bottles rolls down a modern street toward one tiny café table. Then: cap pop ECU, subway close-up,
// multiplying panel grid, top-down plaza, the planet with a ring of bottles + "2.2 BILLION A DAY" on "two"; 1886 glass ECU,
// Pemberton behind Jacobs' counter counting nine glasses, pull-back to the pharmacy; three teasers ($1 deal from above,
// 1985 recipe + a face-to-crowd pull-back, a whole bottling plant on a crane → a ship to the war); nine glasses vs the planet;
// the wounded soldier and the jug of syrup + title.
const L = require('../../../kit/look'), P = require('../../../kit/props'), { toon, LOOKS } = require('../../../kit/toon'), EN = require('../../../kit/engine');
const K = require('./hookkit');
const { W, H, INK, CREAM, RED, YELLOW, BLUE, ERA, ink, rr, ell, poly, clamp, lerp, seg, E, hash, fitText } = L;
const TL = EN.timeline(__dirname, { start: 0.25, gap: 0.5 }), at = TL.at, begin = TL.begin, end = TL.end;
const pop = (t, t0, d = 0.35) => clamp((t - t0) / d);
const PEM = LOOKS.pemberton, PEM_APRON = { ...PEM, apron: '#F4F0E6' };
const PEM_WAR = { ...PEM, hair: { style: 'side', col: '#6B5A48' }, beardCol: '#7A6650', top: '#7E8288', top2: null, bow: null, pants: '#6E7278', hat: 'cap', hatCol: '#7E8288', buttons: 1 };
const CALM = { skin: L.SKIN[2], hair: { style: 'short', col: '#2B1E16' }, glasses: 'round', top: '#2F8A6A', top2: '#F4F0E6', pants: '#3A3A48' };
const RIDER = { skin: L.SKIN[4], hair: { style: 'short', col: '#151313' }, top: '#E07A3A', pants: '#2F4A6A' };
const SCI = { skin: '#F2C9A0', hair: { style: 'bald', col: '#8A8378' }, glasses: 'round', top: '#FFFFFF', top2: '#9CC3E0', tie: '#2F6DB5', pants: '#4A4F5C' };
const YELL = { eyes: 'open', brows: 'angry', mouth: 'flat', red: 1 };
function shakeCam(c, lt, hits, amp = 16) { const s = EN.shake(lt, hits, amp); c.x += s.x / c.z; c.y += s.y / c.z; return c; }
function flash(ctx, u, col = '#FFFFFF', a = 0.8) { if (u <= 0 || u >= 1) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = (1 - u) * a; ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); ctx.restore(); }
const DRINK = { la: [0.18, 0.1], ra: [2.6, 1.83] }; // hand at the mouth (toon geometry), bottle tipped up
const drink = (g, ang) => { g.rotate(ang - 2.2); P.bottle(g, 0, 70, 0.42, { open: true, fill: 0.6 }); };

// ---------- scene times (cut on the stressed word) ----------
const t1 = 0, t2 = at('h1', 'someone') - 0.1, t3 = at('h1', 'And') - 0.1, t4 = at('h1', 'And', 1) - 0.1, t5 = at('h1', 'Every') - 0.1, t6 = at('h1', 'two') - 0.2,
  t7 = begin('h2') - 0.25, t8 = at('h2', 'with') - 0.12, t9 = at('h2', 'in', 1) - 0.12,
  t10 = begin('h3') - 0.2, t11 = at('h3', 'in') - 0.1, t12 = at('h3', 'dollar') + 0.45, t13 = at('h3', 'got') - 0.05, t14 = at('h3', 'and', 1) - 0.12,
  t16 = begin('h4') - 0.2, t17 = at('h4', 'take') - 0.25, t18 = at('h4', 'It') - 0.1, t19 = at('h4', 'and') - 0.15;
const tTwo = at('h1', 'two'), tOne = at('h3', 'one', 1);

const scenes = [
  // h1 ------------------------------------------------------------------------------------------------
  { name: 'FRAME 0: a tidal wave of bottles rolls down the street toward a tiny café table', t0: t1, era: 'modern', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 60, -95, 0.8, -0.04], [t2 - 0.05, 250, -40, 0.94, -0.02]], lt), wx = -380 + lt * 130;
      const scared = lt > 0.85;
      EN.layers(ctx, c, [
        [0.25, x => { L.skyGrad(x, -2600, -1500, 5200, 1900, ['#5AAEF5', '#CDEBFF']); L.cloud(x, -300 + lt * 14, -520, 1.4); L.cloud(x, 900 + lt * 9, -620, 1.0); L.cloud(x, 1700 + lt * 11, -480, 1.2); }],
        [0.45, x => K.skyline(x, -2600, 2800, 120, 3)],
        [0.75, x => { K.shopRow(x, -2200, 110, [{ sign: 'BAKERY', col: '#E9C9A6', awning: [YELLOW, CREAM] }, { sign: 'PHONES', col: '#C9D1DC', signCol: '#4A4F5C' }, { sign: 'BOOKS', col: '#C96A4B', awning: ['#2F8A6A', CREAM] }, { sign: 'PIZZA', col: '#E9E3D6', signCol: RED, awning: [RED, CREAM] },
            { sign: 'CAFÉ', col: '#F4EDE0', signCol: BLUE, awning: [BLUE, CREAM], w: 520 }, { sign: 'FLOWERS', col: '#E8B5C0', signCol: '#8A3A5A', awning: ['#8A3A5A', CREAM] }, { sign: 'SHOES', col: '#D9D2C2', signCol: '#2E3440' }]);
            x.fillStyle = '#D6CFC2'; x.fillRect(-2600, 110, 5200, 300); }],
        [1, x => { K.road(x, -2600, 120, 5200, 230); K.pavement(x, -2600, 340, 5200, 900);
            for (let i = 0; i < 4; i++) { const rx = 80 + i * 260 + lt * (300 + i * 40); toon(x, rx, 330 + (i % 2) * 20, 0.62, [LOOKS.woman, LOOKS.worker, LOOKS.kid, LOOKS.shopper][i], 'run', 'shock', { t: lt + i * 0.3, look: [-0.8, -0.3] }); }
            K.bottleWave(x, wx, 345, 0.95, lt); K.flyers(x, wx, 345, 0.95, lt + 0.9, 7);
            for (let i = 0; i < 6; i++) { const ph = clamp((lt - 0.1 - i * 0.12) / 2.2); K.bird(x, 120 + i * 90 + ph * 900, -320 - i * 40 - ph * 420, 0.9, lt + i); } }],
        [1.12, x => { K.cafeTable(x, 800, 500, 1.15, lt);
            toon(x, 560, 500, 1.2, CALM, scared ? { la: [1.9, 1.2], ra: [1.9, 1.2], sit: 1, ll: [1.45, -1.45], rl: [1.45, -1.45] } : 'sit', scared ? 'shock' : 'sleepy', { t: lt, look: scared ? [-0.8, -0.7] : [0.6, 0.2], itemR: !scared ? g => { g.rotate(0.2); rr(g, -60, -70, 120, 90, 4); L.ink(g, '#F4F0E6', 4); for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(-44, -50 + k * 18); g.lineTo(44, -50 + k * 18); L.ink(g, null, 3); } } : null });
            if (scared) { x.save(); x.globalAlpha = clamp((lt - 0.85) / 0.2); fitText(x, '!', 650, 60, 110, RED, 90, { outline: 12 }); x.restore(); } }],
        [1.35, x => { K.hydrant(x, 1300, 860, 1.7); P.lamppost(x, -1400, 1000, 1.8, false); }]]);
      L.word(ctx, 'RIGHT NOW', 1490, 150, pop(t, 0.22), { size: 96, col: CREAM });
    } },
  { name: 'ECU: the cap pops off "a Coca-Cola"', t0: t2, era: 'modern', out: { type: 'whip', dur: 0.28, dir: -1 }, draw(ctx, t, lt) {
      const kO = at('h1', 'opening') - t2 + 0.08, kC = at('h1', 'Coca-Cola') - t2, u = clamp((lt - kO) / 0.25);
      const c = shakeCam(EN.cam([[0, -10, 0, 1.0, 0.07], [kO, 0, -30, 1.05, 0.06], [2.3, 20, 0, 1.1, 0.035]], lt), lt, [kO], 14);
      EN.layers(ctx, c, [
        [0.45, x => { L.skyGrad(x, -2000, -1400, 4000, 2600, ['#E9C49A', '#F6E6CF']); rr(x, -1700, -1100, 1000, 900, 20); L.ink(x, '#FFF6E2', 0); K.bokeh(x, -1900, -1100, 3800, 1900, lt, ['#FFD58A', '#FFFFFF', '#F2A65A', '#9CC7E8'], 30, 4); }],
        [0.8, x => { rr(x, -2000, 520, 4000, 900, 0); L.ink(x, '#B48A5E', 0); x.fillStyle = 'rgba(255,255,255,0.25)'; x.fillRect(-2000, 520, 4000, 18); }],
        [1, x => { P.bottle(x, 0, 1000, 5.8, { kind: 'contour', open: lt > kO, rot: 0.05 + (lt < kO ? Math.sin(lt * 30) * 0.008 : 0) });
            const lev = lt < kO ? clamp((lt - kO + 0.5) / 0.5) : 1, v = lt < kO ? 0 : clamp((lt - kO) / 0.4), orot = lt < kO ? -0.12 - lev * 0.2 : -0.32 - v * 0.5, ox = 22 + v * 60, oy = -335 - v * 160;
            K.opener(x, ox, oy, 1.3, orot); const ex = ox + Math.cos(orot) * 470, ey = oy + Math.sin(orot) * 470; K.bigHand(x, ex + Math.cos(orot) * 60, ey + Math.sin(orot) * 60, 1.0, orot, { skin: L.SKIN[1], sleeve: '#2F8A6A' });
            if (lt > kO) { const cu = clamp((lt - kO) / 1.2); K.cap(x, -40 - cu * 620, -360 - Math.sin(cu * Math.PI) * 420 + cu * 500, 1.9, -cu * 14); }
            P.burst(x, 0, -380, 400, u, CREAM); K.fizzSpray(x, 0, -370, clamp((lt - kO) / 1.1), 1.4, 34);
            for (let i = 0; i < 14; i++) { const ph = (lt * 0.9 + hash(i * 3)) % 1; if (lt > kO) { x.save(); x.globalAlpha = 1 - ph; x.beginPath(); x.arc(-30 + hash(i) * 60 + Math.sin(ph * 9 + i) * 10, -360 - ph * 400, 6 + hash(i * 2) * 8, 0, 6.27); L.ink(x, 'rgba(255,248,235,0.9)', 3); x.restore(); } }
            if (lt > kC) P.sparkles(x, 0, 360, 280, lt, 7, CREAM); }]]);
    } },
  { name: 'and someone else: the subway commuter (dutch angle, poles slide past)', t0: t3, era: 'modern', out: { type: 'whip', dur: 0.28, dir: 1 }, draw(ctx, t, lt) {
      const sway = Math.sin(lt * 5) * 6, c = EN.cam([[0, -220, -60, 1.0, 0.05], [1.5, 80, -40, 1.07, 0.035]], lt); c.y += sway;
      EN.layers(ctx, c, [
        [0.8, x => { K.subwayCar(x, lt);
            const sat = [[-1300, 'stand', 'sleepy'], [-900, 'sit', 'neutral'], [-520, 'sit', 'happy'], [-120, 'sit', 'sleepy'], [700, 'sit', 'neutral'], [1100, 'sit', 'happy']];
            sat.forEach(([sx, ps, ex], i) => { const lk = { skin: L.SKIN[(i * 3) % 7], hair: { style: ['side', 'bun', 'curly', 'long', 'short', 'bald'][i], col: ['#2B1E16', '#151313', '#A4462A', '#D9B25A', '#5A3A22', '#A9A49C'][i] }, top: ['#8A5AA8', '#2F6DB5', '#F7C548', '#D93A35', '#4A4F5C', '#2F8A6A'][i], pants: '#3A3A48' };
              toon(x, sx, 340, 1.0, lk, i === 2 ? { ...DRINK, ll: [1.45, -1.45], rl: [1.45, -1.45], sit: 1 } : ps, ex, { t: lt + i, seed: i, itemR: i === 2 ? drink : i === 4 ? g => { rr(g, -20, -40, 40, 70, 8); L.ink(g, '#2A2E36', 4); } : null }); }); }],
        [1, x => { const up = clamp((lt - 0.25) / 0.4); K.toonHead(x, 280, -60, 2.35, RIDER, up > 0 ? DRINK : 'hold', lt > 0.75 ? 'happy' : 'neutral', { t: lt, look: [-0.3, 0], itemR: drink }); }],
        [1.3, x => { for (const px of [-760, -60, 1260]) K.pole(x, px - lt * 60, -1400, 1400); }]]);
    } },
  { name: 'and someone else: the screen splits 1 → 4 → 9 → 25 panels', t0: t4, era: 'pop', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const s1 = at('h1', 'someone', 2) - 0.08, s2 = at('h1', 'else', 1) - 0.06, s3 = s2 + 0.35;
      const n = t < s1 ? 1 : t < s2 ? 2 : t < s3 ? 3 : 5, tn = n === 1 ? t4 : n === 2 ? s1 : n === 3 ? s2 : s3;
      ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(-0.015 + lt * 0.01); const z = 1.04 - lt * 0.03; ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
      const g = 14, pw = (W - g * (n + 1)) / n, ph = (H - g * (n + 1)) / n;
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const k = j * n + i, d = hash(k * 1.7) * 0.18, u = n === 1 ? 1 : E.back(clamp((t - tn - d) / 0.22), 1.6);
        if (u <= 0) continue; const x0 = g + i * (pw + g), y0 = g + j * (ph + g); ctx.save(); ctx.translate(x0 + pw / 2, y0 + ph / 2); ctx.scale(u, u); K.panel(ctx, -pw / 2, -ph / 2, pw, ph, n === 1 ? 6 : k * 7 + n, lt); ctx.restore(); }
      ctx.restore();
    } },
  { name: 'every single day: top-down plaza, caps pop in a ripple, camera rises', t0: t5, era: 'pop', out: { type: 'whip', dur: 0.3, dir: 1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, 0, 2.3, 0.0], [t6 - t5 + 0.1, 0, 0, 0.6, 0.24]], lt, { breath: 0.4 });
      EN.layers(ctx, c, [[1, x => { K.plazaTop(x, -2600, -1700, 5200, 3400, lt); let i = 0;
          for (let gy = -1450; gy <= 1450; gy += 84) for (let gx = -2250; gx <= 2250; gx += 92) { i++; const px = gx + (hash(i * 1.1) - 0.5) * 40 + ((gy / 84) % 2) * 40, py = gy + (hash(i * 2.2) - 0.5) * 30, d = Math.hypot(px, py);
            if (d < 290) continue; if (Math.abs(px) > 1350 && Math.abs(Math.abs(px) - 1500) < 200 && Math.abs(Math.abs(py) - 800) < 200) continue;
            K.topPerson(x, px, py, 0.95, i, lt, 0.25 + d / 1500); }
          }]]);
      L.word(ctx, 'EVERY SINGLE DAY', 960, 150, pop(t, at('h1', 'Every')), { size: 92, col: YELLOW });
    } },
  { name: 'the planet with a ring of bottles: 2.2 BILLION A DAY lands on "two"', t0: t6, era: 'pop', out: { type: 'tear', dur: 0.5 }, draw(ctx, t, lt) {
      const k2 = tTwo - t6, kS = at('h1', 'servings') - t6;
      const c = shakeCam(EN.cam([[0, 160, 70, 1.65, 0.16], [k2 + 0.55, 0, 30, 1.0, 0.0], [3.7, 0, 20, 0.93, -0.03]], lt), lt, [k2], 12);
      EN.layers(ctx, c, [
        [0.2, x => { L.skyGrad(x, -2600, -1600, 5200, 3200, ['#0B1430', '#1E2C5A']); K.stars(x, -2400, -1400, 4800, 2800, lt, 160); x.beginPath(); x.arc(-1050, -380, 70, 0, 6.27); L.ink(x, '#E9E3D6', 5); x.beginPath(); x.arc(-1070, -400, 14, 0, 6.27); L.ink(x, '#C9C1B0', 3); }],
        [1, x => { K.bottleRing(x, 0, -40, 680, 170, -0.18, lt, 'back', 46, 0.3); K.planet(x, 0, -40, 285, lt); K.bottleRing(x, 0, -40, 680, 170, -0.18, lt, 'front', 46, 0.3); }],
        [1.5, x => { for (let i = 0; i < 4; i++) { const ph = (lt * 0.28 + i * 0.25) % 1; K.sb(x, -1500 + ph * 3000, -420 + i * 260, 1.3, ph * 5 + i); } }]]);
      P.burst(ctx, 960, 850, 300, clamp((t - tTwo) / 0.4), YELLOW);
      L.plate(ctx, '2.2 BILLION A DAY', 960, 850, pop(t, tTwo, 0.3), { size: 116, bg: RED, fg: CREAM });
      L.plate(ctx, "SERVINGS OF THE COMPANY'S DRINKS", 960, 975, pop(t, at('h1', 'servings')), { size: 40, rot: 0.02 });
    } },
  // h2 ------------------------------------------------------------------------------------------------
  { name: '1886 ECU: one glass fills at a soda tap', t0: t7, era: 'gaslight', out: { type: 'cut' }, draw(ctx, t, lt) {
      const fill = lerp(0.12, 0.85, E.inOut(clamp((lt - 0.2) / 1.6))), c = EN.cam([[0, -40, -40, 1.25, -0.045], [2.1, 30, -20, 1.36, -0.02]], lt);
      EN.layers(ctx, c, [
        [0.55, x => { K.drugWall(x, lt, { seed: 5 }); x.fillStyle = 'rgba(30,14,10,0.35)'; x.fillRect(-2600, -1300, 5200, 2600); K.bokeh(x, -1800, -900, 3600, 1300, lt, ['#FFC870', '#FFE3A0'], 18, 9); }],
        [1, x => { K.counter(x, -2000, 250, 4000); K.sodaTap(x, -190, 252, 1.6, 1);
            x.beginPath(); x.moveTo(-6, -134); x.bezierCurveTo(-6 + Math.sin(lt * 9) * 4, -60, -2, 0, 0, 250 - 135 * 2.6 * fill); x.lineWidth = 22; x.strokeStyle = INK; x.stroke(); x.lineWidth = 13; x.strokeStyle = '#4A2614'; x.stroke();
            P.glassCup(x, 0, 252, 2.6, { fill, fizz: lt * 1.4 }); K.bigHand(x, 210, 120, 0.6, 0.05, { skin: PEM.skin, sleeve: '#2E2A28', cuff: '#F2EEE4' });
            K.jar(x, -760, 250, 120, 170, '#E3C77D', 'SODA'); K.jar(x, -600, 250, 90, 130, '#B7D7C9', 'ZINC'); K.showGlobe(x, 720, 250, 1.1, '#D93A35', lt); }],
        [1.3, x => { K.jar(x, 1350 - lt * 40, 700, 260, 380, '#9C6AA8', 'TONIC'); }]]);
      L.dateCard(ctx, '1886', 330, 170, pop(t, at('h2', '1886') - 0.05));
    } },
  { name: "Pemberton behind Jacobs' counter: nine glasses a day", t0: t8, era: 'gaslight', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const kN = at('h2', 'nine') - t8, kD = at('h2', 'day') - t8, n = Math.min(9, Math.floor(clamp((lt - kN + 0.35) / (kD - kN + 0.3)) * 9 + (lt > kN - 0.35 ? 1 : 0)));
      const c = EN.cam([[0, -180, -80, 1.25], [kN - 0.3, -60, -60, 1.18], [3.3, 200, -40, 1.14]], lt);
      EN.layers(ctx, c, [
        [0.6, x => { K.drugWall(x, lt, { seed: 3, signs: ['TINCTURES', 'PRESCRIPTIONS', "JACOBS' PHARMACY", 'SODA WATER', 'EXTRACTS'] }); }],
        [1, x => { K.chalkTally(x, 380, -420, 470, 250, n, 'GLASSES TODAY');
            toon(x, -160, 340, 1.75, PEM_APRON, n >= 9 ? 'cheer' : n > 0 ? 'present' : 'wave', n >= 9 ? 'grin' : n > 0 ? 'happy' : 'neutral', { t: lt, look: n > 0 && n < 9 ? [0.7, 0.3] : [0, 0] });
            K.counter(x, -2000, 200, 4000); K.sodaTap(x, -720, 202, 0.95, 0); K.sodaTap(x, -560, 202, 0.95, 0); K.showGlobe(x, -1100, 200, 0.9, '#2F8A6A', lt);
            for (let i = 0; i < 9; i++) { const u = E.back(clamp((n - i) * 1.0), 2.2); if (n > i) { x.save(); x.translate(100 + i * 92, 202); x.scale(1, u); P.glassCup(x, 0, 0, 0.72, { fill: 0.8, fizz: lt + i }); x.restore(); } } }],
        [1.18, x => { toon(x, 1250, 620, 1.45, { skin: '#E8B58A', hair: { style: 'short', col: '#5A3A22' }, stache: 1, top: '#4A5A3A', top2: '#F4F0E6', bow: RED, pants: '#3A3A30', hat: 'bowler', hatCol: '#3A2A24' }, DRINK, 'happy', { t: lt, flip: true, itemR: (g, ang) => { g.rotate(ang - 2.2); P.glassCup(g, 0, 60, 0.5, { fill: 0.5 }); } });
            rr(x, 1180, 620, 24, 400, 6); L.ink(x, '#8A8F96', 4); }]]);
      L.plate(ctx, '9 GLASSES A DAY', 960, 965, pop(t, at('h2', 'day')), { size: 70 });
    } },
  { name: 'pull-back: ...in a pharmacy (Jacobs\' at dusk)', t0: t9, era: 'gaslight', out: { type: 'whip', dur: 0.3, dir: 1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -170, 60, 2.5], [1.15, 0, -170, 0.95, 'out']], lt);
      EN.layers(ctx, c, [
        [0.3, x => { L.skyGrad(x, -2600, -1500, 5200, 1900, ['#2E2440', '#B8606A']); K.stars(x, -2400, -1400, 4800, 900, lt, 50); }],
        [0.6, x => K.oldSkyline(x)],
        [1, x => { P.street(x, -2600, 300, 5200, 900, { col: '#7A6248', curb: '#9A8A70' });
            P.storefront(x, -1500, 310, { w: 620, h: 600, col: '#8E5A3E', sign: 'DRY GOODS', awning: ['#2E5A3E', CREAM], night: true });
            P.storefront(x, -450, 310, { w: 900, h: 760, col: '#B8714C', sign: "JACOBS' PHARMACY", signCol: '#3A1E14', awning: [RED, CREAM], night: true, upper: 3, display: (g, dx, dy, dw, dh) => {
              g.save(); rr(g, dx, dy, dw, dh, 6); g.clip(); L.wallpaper(g, dx, dy, dw, dh, '#7A3F2E', '#8E4E38'); g.fillStyle = 'rgba(255,200,120,0.25)'; g.fillRect(dx, dy, dw, dh);
              toon(g, dx + dw * 0.45, dy + dh + 40, 0.95, PEM_APRON, 'present', 'happy', { t: lt }); rr(g, dx, dy + dh - 110, dw, 120, 4); L.ink(g, '#7A4A2A', 4);
              P.glassCup(g, dx + dw * 0.75, dy + dh - 108, 0.6, { fill: 0.8, fizz: lt }); K.showGlobe(g, dx + 70, dy + dh - 108, 0.55, '#2F8A6A', lt); g.restore(); L.glow(g, dx + dw / 2, dy + dh / 2, 400, '#FFC870', 0.35); } });
            P.storefront(x, 580, 310, { w: 600, h: 560, col: '#9A6A4A', sign: 'HATS', awning: [YELLOW, '#5A3420'], night: true }); P.lamppost(x, -560, 330, 1.1, true); P.lamppost(x, 560, 330, 1.1, true); }],
        [1.25, x => { K.horseBuggy(x, -1500 + lt * 700, 760, 1.1, lt); }]]);
      L.word(ctx, 'IN A PHARMACY', 960, 150, pop(t, at('h2', 'pharmacy')), { size: 96, col: YELLOW });
    } },
  // h3 ------------------------------------------------------------------------------------------------
  { name: '1899: two lawyers bring Candler the bottling idea (it glows)', t0: t10, era: 'sepia', out: { type: 'cut' }, draw(ctx, t, lt) {
      const kV = at('h3', 'valuable') - t10, glow = clamp((lt - kV + 0.2) / 0.5), walk = clamp((lt - 0.1) / 1.4);
      const c = EN.cam([[0, -120, -90, 1.18], [kV, -40, -100, 1.26], [4.3, 20, -110, 1.3]], lt);
      EN.layers(ctx, c, [
        [0.6, x => { L.wallpaper(x, -2400, -1300, 4800, 1600, '#5E6B4E', '#6E7B5C', 50); rr(x, -2400, 120, 4800, 30, 0); L.ink(x, '#4A3420', 4);
            rr(x, 300, -560, 420, 420, 8); L.ink(x, '#5A3420', 8); x.save(); rr(x, 316, -544, 388, 388, 4); x.clip(); L.skyGrad(x, 316, -544, 388, 388, ['#F6E2B8', '#EAB979']); for (let i = 0; i < 5; i++) { rr(x, 320 + i * 80, -330 + hash(i) * 60, 70, 300, 2); L.ink(x, '#C9A07A', 3); } x.restore(); x.beginPath(); x.moveTo(510, -560); x.lineTo(510, -140); x.moveTo(300, -350); x.lineTo(720, -350); x.lineWidth = 10; x.strokeStyle = '#5A3420'; x.stroke();
            P.clock(x, -300, -460, 70, lt, { rim: '#6B4123' }); rr(x, -1200, -620, 520, 760, 6); L.ink(x, '#5A3420', 6); for (let r = 0; r < 4; r++) for (let b = 0; b < 9; b++) { rr(x, -1180 + b * 54, -600 + r * 185 + hash(r * 9 + b) * 40, 46, 140 - hash(r * 9 + b) * 40, 3); L.ink(x, ['#7A2E2E', '#2E4A6A', '#4A6A3A', '#8A6A3A'][(r + b) % 4], 3); } }],
        [1, x => { L.planks(x, -2400, 300, 4800, 900, '#7A5A3A', { pw: 44 });
            toon(x, 340, 310, 1.65, LOOKS.candler, lt < kV ? 'arms' : 'shrug', lt < kV ? 'smug' : 'think', { t: lt, look: lt > kV ? [-0.8, 0.2] : [-0.3, 0] });
            rr(x, -260, 150, 1160, 36, 8); L.ink(x, '#6B4123', 6); rr(x, -230, 186, 1100, 220, 6); L.ink(x, '#5A3420', 6); for (let i = 0; i < 3; i++) { rr(x, -200 + i * 360, 210, 320, 170, 8); L.ink(x, '#6B4123', 4); }
            P.bills(x, 760, 140, 0.5, 2); K.inkwell(x, 620, 140, 0.4); }],
        [1.15, x => { const lx = lerp(-1400, -330, E.out(walk));
            toon(x, lx - 400, 400, 1.75, LOOKS.lawyerB, walk < 1 ? 'walk' : 'point', 'happy', { t: lt });
            const hA = toon(x, lx, 420, 1.8, LOOKS.lawyerA, walk < 1 ? 'walk' : 'present', lt > kV ? 'grin' : 'happy', { t: lt + 0.5 }).hand;
            if (walk >= 1) { K.contract(x, hA[0] + 90, hA[1] - 70, 0.3 + glow * 0.04, 0.12, { glow }); x.beginPath(); x.arc(hA[0], hA[1], 14 * 1.8, 0, 6.27); L.ink(x, LOOKS.lawyerA.skin, 5); }
            if (glow > 0) P.sparkles(x, hA[0] + 90, hA[1] - 70, 200, lt, 8); }]]);
      L.dateCard(ctx, '1899', 300, 160, pop(t, at('h3', 'owners')));
      L.word(ctx, 'ONE OF THE MOST VALUABLE IDEAS', 1120, 150, pop(t, at('h3', 'valuable')), { size: 64, col: CREAM, maxW: 1250 });
    } },
  { name: 'top-down desk: a $1 bill slaps onto the contract', t0: t11, era: 'sepia', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const ks = tOne - t11, inU = E.out(clamp((lt - 0.2) / (ks - 0.35))), lift = clamp((lt - ks - 0.25) / 0.5);
      const c = shakeCam(EN.cam([[0, 0, 0, 0.95, 0.12], [ks, 0, -20, 1.1, 0.04], [2.4, 0, -20, 1.16, 0.02]], lt), lt, [ks], 22);
      EN.layers(ctx, c, [[1, x => { K.deskTop(x, -2400, -1600, 4800, 3200);
          K.inkwell(x, -640, -330, 1.0); K.pocketWatch(x, 650, -330, 1.0, lt); K.specs(x, 640, 330, 1.0, 0.3); K.pen(x, -660, 300, 1.0, -0.6); P.bills(x, -620, 40, 0.9, 3);
          K.contract(x, 0, 40, 1.1, -0.05, { sign: clamp((lt - ks - 0.5) / 0.9) });
          // Candler's hands from below (dark suit, white cuffs)
          K.bigHand(x, -330, 430, 0.95, Math.PI / 2 - 0.25, { skin: LOOKS.candler.skin, sleeve: '#3A3F4A', cuff: '#F4F0E6' });
          if (lt > ks + 0.4) { const sx = 160 + Math.sin(lt * 9) * 6; K.bigHand(x, sx + 60, 420, 0.9, Math.PI / 2 + 0.25, { skin: LOOKS.candler.skin, sleeve: '#3A3F4A', cuff: '#F4F0E6' }); }
          const by = lerp(-1100, -70, inU), bs = lt < ks ? lerp(1.35, 1.25, inU) : lerp(1.25, 1.0, E.out(clamp((lt - ks) / 0.12)));
          P.burst(x, 20, -70, 300, clamp((lt - ks) / 0.4), YELLOW); K.dollarBill(x, 20, by, bs, -0.08); if (lt > ks) P.sparkles(x, 20, -70, 300, lt, 8, YELLOW);
          if (lift < 1) K.bigHand(x, 30, by - 150 - lift * 900, 1.0 * bs, -Math.PI / 2 + 0.08, { skin: LOOKS.lawyerA.skin, sleeve: '#4A4F5C', cuff: '#F4F0E6', fist: false });
          }]]);
      L.plate(ctx, '$1', 1600, 210, pop(t, tOne, 0.3), { size: 160, bg: YELLOW, rot: 0.05 });
    } },
  { name: '1985: the recipe gets crossed out, NEW stamped (scientist peeks)', t0: t12, era: 'tense', out: { type: 'cut' }, draw(ctx, t, lt) {
      const kC = at('h3', 'changed') - t12, kR = at('h3', 'recipe') - t12;
      const c = EN.cam([[0, -80, 0, 1.12, 0.07], [1.9, 30, -20, 1.24, 0.04]], lt);
      EN.layers(ctx, c, [
        [0.55, x => { L.skyGrad(x, -2400, -1400, 4800, 2400, ['#1E2A44', '#3A3050']); for (let i = 0; i < 6; i++) K.beaker(x, -1500 + i * 210, 160, 1.2 + (i % 2) * 0.3, ['#D93A35', '#2F8A6A', '#F7C548', '#9C6AA8', '#2F6DB5', '#E07A3A'][i], lt + i);
            rr(x, -2400, 160, 4800, 40, 0); L.ink(x, '#4A4F5C', 4); for (let i = 0; i < 4; i++) { const on = Math.sin(lt * 8 + i) > 0; x.beginPath(); x.arc(900 + i * 120, -500, 24, 0, 6.27); L.ink(x, on ? '#FF5A4A' : '#5A2A2A', 4); if (on) L.glow(x, 900 + i * 120, -500, 80, '#FF5A4A', 0.4); } }],
        [1, x => { x.save(); x.translate(-120, 30); x.rotate(-0.04); rr(x, -380, -430, 760, 860, 8); L.ink(x, '#F4ECD8', 6); fitText(x, 'THE RECIPE', 0, -350, 70, INK, 640, { font: L.F.type }); fitText(x, 'SINCE 1886', 0, -278, 34, RED, 500);
            for (let i = 0; i < 10; i++) { x.beginPath(); x.moveTo(-300, -190 + i * 52); x.lineTo(300 - (i % 3) * 80, -190 + i * 52); x.lineWidth = 7; x.strokeStyle = '#A8987C'; x.stroke(); }
            const xu = clamp((lt - kC + 0.1) / 0.5); K.markerPath(x, Array.from({ length: 30 }, (_, k) => [-320 + k * 22, -230 + k * 20 + Math.sin(k) * 6]), xu, RED, 16); K.markerPath(x, Array.from({ length: 30 }, (_, k) => [320 - k * 22, -230 + k * 20 + Math.cos(k) * 6]), clamp(xu * 2 - 1), RED, 16);
            x.restore(); K.stamp(x, 'NEW!', -100, 260, clamp((lt - kR) / 0.3), { size: 130, rot: -0.12 });
            K.toonHead(x, 640, -40, 2.4, SCI, 'hold', lt > kR ? 'grin' : 'smug', { t: lt, look: [-0.8, 0.3], itemR: g => { g.rotate(-0.6); rr(g, -14, -120, 28, 140, 8); L.ink(g, RED, 4); } }); }]]);
      L.dateCard(ctx, '1985', 330, 160, pop(t, t12 + 0.1), { bg: RED });
    } },
  { name: 'yelled at by an entire country: a yelling face → pull back to a huge crowd', t0: t13, era: 'tense', out: { type: 'whip', dur: 0.3, dir: 1 }, draw(ctx, t, lt) {
      const kE = at('h3', 'entire') - t13, YS = 1.7, hy = 760 - 236 * YS;
      const c = shakeCam(EN.cam([[0, 0, hy + 20, 2.7, 0.05], [kE - 0.15, 0, hy + 10, 2.4, 0.03], [kE + 0.6, 0, 60, 0.62, -0.02, 'out'], [3.0, 0, 40, 0.6, -0.03]], lt), lt, [0.3, 0.9], 10);
      EN.layers(ctx, c, [
        [0.5, x => { L.skyGrad(x, -3000, -1900, 6000, 2200, ['#2A3A64', '#8A5A7A']); K.skyline(x, -3200, 3200, 0, 7, true); K.hq(x, 0, 0, 560, 640); }],
        [1, x => { x.fillStyle = '#3A3F4D'; x.fillRect(-3200, -10, 6400, 1800);
            const SIGNS = ['BRING IT BACK!', 'WE WANT|THE OLD ONE', 'CHANGE IT|BACK!', 'NOT MY|COLA!', 'OLD TASTE|PLEASE'];
            for (let r = 0; r < 7; r++) { const y = 10 + r * 95, s = 0.3 + r * 0.16, n = 26 - r * 2, span = 2900 - r * 120;
              if (r < 5) P.crowd(x, -span, span, y, s, n, lt + r, { react: 'angry', seed: r * 13 + 1 });
              else { P.crowd(x, -span, -440, y, s, Math.round(n / 2) - 1, lt + r, { react: 'angry', seed: r * 13 + 1 }); P.crowd(x, 440, span, y, s, Math.round(n / 2) - 1, lt + r, { react: 'angry', seed: r * 13 + 7 }); }
              for (let k = 0; k < 4; k++) { const sx = -span * 0.8 + k * span * 0.53 + (r % 2) * 120; if (r >= 5 && Math.abs(sx) < 500) continue; K.sign(x, sx, y - 330 * s + Math.sin(lt * 8 + k + r) * 10 * s, 380 * s, 150 * s, SIGNS[(k + r) % SIGNS.length], { rot: Math.sin(lt * 5 + k * 2 + r) * 0.08, stick: 220 * s }); } }
            toon(x, 0, 760, YS, { skin: L.SKIN[0], hair: { style: 'short', col: '#A4462A' }, top: '#2F6DB5', pants: '#3A3A48' }, { la: [0.3, 0.1], ra: [2.5, -1.2] }, YELL, { t: lt, blink: false, look: [0, -0.1] });
            const yl = 0.8 + Math.abs(Math.sin(lt * 11)) * 0.25; x.save(); x.translate(0, hy + 30 * YS); x.scale(YS, YS * yl); rr(x, -26, -14, 52, 44, 18); L.ink(x, '#5A1A1A', 4.5); rr(x, -20, -12, 40, 9, 3); L.ink(x, '#FFFFFF', 0); ell(x, 0, 22, 14, 7); L.ink(x, '#D9606A', 0); x.restore();
            for (let k = 0; k < 3; k++) { const ph = (lt * 2.2 + k / 3) % 1; x.save(); x.globalAlpha = 1 - ph; x.lineCap = 'round'; for (const [a0, a1] of [[-0.9, -0.2], [Math.PI + 0.2, Math.PI + 0.9]]) { x.beginPath(); x.arc(0, hy + 40, 160 + ph * 320, a0, a1); x.lineWidth = 22; x.strokeStyle = INK; x.stroke(); x.lineWidth = 12; x.strokeStyle = CREAM; x.stroke(); } x.restore(); } }]]);
      L.word(ctx, 'AN ENTIRE COUNTRY', 960, 150, pop(t, at('h3', 'entire')), { size: 96, col: CREAM });
    } },
  { name: 'a whole bottling plant on a crane → pan to the ship to the war', t0: t14, era: 'war', out: { type: 'cut' }, draw(ctx, t, lt) {
      const kW = at('h3', 'world') - t14, kP = at('h3', 'plants') - t14, lift = E.inOut(clamp((lt - 0.25) / 1.3)), sw = Math.sin(lt * 2.4) * 0.05 * lift;
      const c = EN.cam([[0, -200, -260, 0.86, -0.07], [kW - 0.35, -150, -330, 0.84, -0.05], [kW + 0.3, 2550, -140, 0.92, 0.0], [3.4, 2650, -130, 0.96, 0.01]], lt);
      const fy = 300 - lift * 330, fx = 0;
      EN.layers(ctx, c, [
        [0.3, x => { L.skyGrad(x, -3000, -1800, 7000, 2200, ['#8FA3A8', '#D9CFB0']); L.cloud(x, -800, -700, 1.6, '#EDE9DC'); L.cloud(x, 900, -820, 1.2, '#EDE9DC'); L.cloud(x, 2200, -700, 1.5, '#EDE9DC');
            for (let i = 0; i < 3; i++) K.plane(x, 400 + ((lt * 260 + i * 700) % 2600), -620 + i * 90, 0.7); }],
        [0.7, x => { K.sea(x, -400, 200, 5200, 1000, lt); for (let i = 0; i < 4; i++) K.warship(x, 1100 + i * 700, 230, 0.55, lt + i, ['#7E868C', '#6E767C'][i % 2]); }],
        [1, x => { K.sea(x, 800, 330, 4400, 900, lt * 1.3, '#4F6E80');
            rr(x, -2600, 300, 3400, 900, 0); L.ink(x, '#9A958C', 0); for (let i = 0; i < 16; i++) { rr(x, -2600 + i * 212, 300, 210, 30, 2); L.ink(x, '#B5AFA4', 3); } rr(x, 780, 280, 40, 120, 6); L.ink(x, '#5A4A3A', 4);
            K.crane(x, -1000, 300, 1260, 1600, fx, fy - 0.85 * 820 - 20);
            x.save(); x.translate(fx, fy - 350); x.rotate(sw); K.factory(x, 0, 350, 0.85, lt, { straps: true }); x.restore();
            P.crowd(x, -720, 620, 330, 0.85, 4, lt, { react: 'shock', look: { top: '#6E7650', pants: '#5E6640', hat: 'army', hatCol: '#5E6640' }, seed: 8 });
            // the ship at sea, already carrying a plant, soldiers on deck
            K.cargoShip(x, 2650, 380, 1.3, lt); K.factory(x, 2380, 276, 0.6, lt); toon(x, 2830, 276, 0.8, LOOKS.soldier, 'wave', 'happy', { t: lt }); toon(x, 3010, 276, 0.8, LOOKS.soldier, 'cheer', 'grin', { t: lt + 1, itemR: g => P.bottle(g, 0, 10, 0.3, { open: true }) });
            for (let i = 0; i < 12; i++) { const ph = (lt * 0.8 + i / 12) % 1; x.save(); x.globalAlpha = 1 - ph; x.beginPath(); x.arc(1860 - ph * 400, 380 + Math.sin(i) * 20, 18 + ph * 20, 0, 6.27); L.ink(x, '#E9EEF2', 3); x.restore(); } }],
        [1.2, x => { toon(x, -620, 470, 1.7, { ...LOOKS.soldier, skin: L.SKIN[1] }, 'shock', 'shock', { t: lt, look: [0.4, -1] }); toon(x, 520, 490, 1.6, LOOKS.worker, { la: [0.3, 0.1], ra: [2.9, -0.3] }, 'shock', { t: lt + 1, look: [-0.3, -1] }); }]]);
      const pan = clamp((lt - kW + 0.35) / 0.65); if (pan > 0.05 && pan < 0.95) P.speedLines(ctx, 0, 0, W, H, lt, -1, 0.6 * Math.sin(pan * Math.PI));
      if (lt < kW - 0.3) L.word(ctx, 'WHOLE BOTTLING PLANTS', 960, 150, pop(t, at('h3', 'plants') - 0.1), { size: 84, col: CREAM });
      L.word(ctx, 'TO A WORLD WAR', 960, 150, pop(t, at('h3', 'world')), { size: 92, col: YELLOW });
    } },
  // h4 ------------------------------------------------------------------------------------------------
  { name: 'so how did a drink that sold nine glasses a day...', t0: t16, era: 'gaslight', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const kN = at('h4', 'nine') - t16, kS = at('h4', 'sold') - t16;
      const c = EN.cam([[0, -260, -60, 1.12], [3.0, 160, -40, 1.22]], lt);
      EN.layers(ctx, c, [
        [0.5, x => { K.drugWall(x, lt, { seed: 11, signs: [null, "JACOBS' PHARMACY", null, null, null] }); x.fillStyle = 'rgba(30,14,10,0.3)'; x.fillRect(-2600, -1300, 5200, 2600); }],
        [1, x => { K.toonHead(x, -430, -150, 2.2, PEM_APRON, 'stand', lt > kN ? 'happy' : 'think', { t: lt, look: [0.8, 0.5] });
            K.counter(x, -2000, 240, 4000);
            for (let i = 0; i < 9; i++) { const bump = lt > kN ? Math.max(0, Math.sin((lt - kN - i * 0.06) * 14)) * Math.exp(-(lt - kN - i * 0.06) * 4) * 30 : 0; P.glassCup(x, -40 + i * 112, 242 - bump, 1.0, { fill: 0.8, fizz: lt + i * 0.3 });
              if (lt > kN + i * 0.06) fitText(x, String(i + 1), -40 + i * 112, 310, 46, CREAM, 60, { outline: 8 }); }
            L.glow(x, 400, 60, 700, '#FFC870', 0.3); }]]);
      L.plate(ctx, '9 GLASSES A DAY', 960, 150, pop(t, at('h4', 'nine')), { size: 74 });
    } },
  { name: '...take over the planet? a giant bottle lands on Earth', t0: t17, era: 'pop', out: { type: 'cut' }, draw(ctx, t, lt) {
      const kP = at('h4', 'planet') - t17, fall = clamp((lt - kP + 0.38) / 0.38), hit = lt > kP, sq = hit ? Math.exp(-(lt - kP) * 6) * Math.sin((lt - kP) * 22) * 0.07 : 0;
      const c = shakeCam(EN.cam([[0, 0, 40, 1.15, 0.06], [kP, 0, -20, 0.95, 0.0], [1.8, 0, -20, 0.9, -0.02]], lt), lt, [kP], 26);
      EN.layers(ctx, c, [
        [0.2, x => { L.skyGrad(x, -2600, -1600, 5200, 3200, ['#0B1430', '#26346A']); K.stars(x, -2400, -1400, 4800, 2800, lt, 160); }],
        [1, x => { x.save(); x.translate(0, 260); x.scale(1 + sq, 1 - sq); K.planet(x, 0, 0, 330, lt); x.restore();
            if (hit) for (let i = 0; i < 18; i++) { const a = -Math.PI / 2 + (i - 8.5) * 0.17, u = E.back(clamp((lt - kP - 0.1 - Math.abs(i - 8.5) * 0.025) / 0.25), 2); if (u > 0) { x.save(); x.translate(Math.cos(a) * 330, 260 + Math.sin(a) * 330); x.rotate(a + Math.PI / 2); x.scale(u, u); P.bottle(x, 0, 6, 0.24, { label: '' }); x.restore(); } }
            const by = lerp(-1500, 260 - 330 + 40, E.in(fall)); if (fall > 0) { x.save(); x.translate(0, by); x.rotate(hit ? 0 : 0.1 * (1 - fall)); P.bottle(x, 0, 0, 2.3, { kind: 'contour' }); x.restore(); }
            if (fall > 0 && !hit) P.speedLines(x, -200, by - 900, 400, 700, lt, 1, 0.5);
            P.burst(x, 0, -30, 420, clamp((lt - kP) / 0.5), YELLOW);
            if (hit) { const u = clamp((lt - kP) / 0.8); x.save(); x.globalAlpha = 1 - u; x.beginPath(); x.ellipse(0, -50, 200 + u * 700, 40 + u * 140, 0, 0, 6.28); x.lineWidth = 14; x.strokeStyle = CREAM; x.stroke(); x.restore(); } }]]);
      L.word(ctx, 'THE PLANET?', 1500, 300, pop(t, at('h4', 'planet') + 0.25), { size: 110, col: YELLOW, rot: 0.06 });
      L.word(ctx, '?', 400, 420, pop(t, at('h4', 'planet') + 0.45), { size: 300, col: YELLOW, rot: -0.12 });
    } },
  { name: 'it starts with a wounded soldier (low angle, smoke, respectful)', t0: t18, era: 'sepia', out: { type: 'cut' }, draw(ctx, t, lt) {
      const kW = at('h4', 'wounded') - t18, kS = at('h4', 'soldier') - t18, hit = lt > kW;
      const c = EN.cam([[0, -140, -20, 1.0, -0.05], [2.2, -40, -70, 1.16, -0.03]], lt);
      EN.layers(ctx, c, [
        [0.25, x => { L.skyGrad(x, -2600, -1600, 5200, 2200, ['#8C8478', '#CFC4AE']); L.glow(x, 600, -300, 600, '#F2D6A0', 0.35); }],
        [0.5, x => { x.fillStyle = '#7A7564'; x.fillRect(-2600, 200, 5200, 900); for (let i = 0; i < 7; i++) { const tx = -1800 + i * 600; poly(x, [[tx - 90, 210], [tx, 100], [tx + 90, 210]]); L.ink(x, '#B9B2A2', 3); } for (let i = 0; i < 3; i++) { rr(x, -1200 + i * 1100, -200, 10, 400, 3); L.ink(x, '#5A4A3A', 3); x.save(); x.translate(-1195 + i * 1100, -190); x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(70, 20 + Math.sin(lt * 4 + i) * 12, 140, 0); x.lineTo(140, 70); x.quadraticCurveTo(70, 90 + Math.sin(lt * 4 + i) * 12, 0, 70); x.closePath(); L.ink(x, '#9A8E78', 3); x.restore(); } }],
        [0.75, x => K.smoke(x, lt, 9, '#A8A296', 0.7, 2)],
        [1, x => { K.toonHead(x, 80, -90, 2.4, PEM_WAR, hit ? { la: [0.3, 0.2], ra: [0.85, -2.1] } : 'stand', !hit ? 'determined' : lt < kW + 0.7 ? 'shock' : 'sad', { t: lt, look: hit ? [0.3, 0.4] : [0.6, -0.2] });
            if (lt > kS) { x.save(); x.globalAlpha = clamp((lt - kS) / 0.3); K.sling(x, 80, -90 + 236 * 2.4, 2.4); x.restore(); }
            P.burst(x, 520, -200, 260, clamp((lt - kW) / 0.45), '#FFF7DA'); }],
        [1.35, x => K.smoke(x, lt * 1.6, 5, '#C9C3B6', 0.55, 7)]]);
      flash(ctx, clamp((lt - kW) / 0.35), '#FFFFFF', 0.6);
      K.desat(ctx, 0.85, W, H);
      L.word(ctx, 'A WOUNDED SOLDIER', 960, 150, pop(t, at('h4', 'wounded')), { size: 88, col: CREAM });
    } },
  { name: '...and a jug of syrup + title', t0: t19, era: 'gaslight', out: { type: 'cut' }, finish: { vignette: 0.45 }, draw(ctx, t, lt) {
      const kJ = at('h4', 'jug') - t19, kS = at('h4', 'syrup') - t19, tt = clamp((lt - kJ) / 0.45);
      const c = EN.cam([[0, -40, -40, 1.12], [2.3, 50, -20, 1.24]], lt);
      EN.layers(ctx, c, [
        [0.5, x => { K.drugWall(x, lt, { seed: 21 }); x.fillStyle = 'rgba(30,14,10,0.42)'; x.fillRect(-2600, -1300, 5200, 2600); }],
        [1, x => { K.toonHead(x, -480, -150, 2.0, PEM_APRON, 'stand', lt > kS ? 'smug' : 'think', { t: lt, look: [0.8, 0.5] });
            K.counter(x, -2000, 250, 4000); L.glow(x, 180, 40, 650 + Math.sin(lt * 7) * 15, '#FFC870', 0.35 + clamp((lt - kS) / 0.5) * 0.2);
            P.jug(x, 180, 252, 2.3); rr(x, 80, 40, 190, 80, 8); L.ink(x, CREAM, 4); fitText(x, 'SYRUP', 175, 82, 46, '#7A2E1E', 170);
            for (let i = 0; i < 2; i++) { const ph = (lt * 0.7 + i * 0.5) % 1; x.beginPath(); x.ellipse(150 + i * 40, -130 + ph * 360, 10, 14 + ph * 6, 0, 0, 6.28); x.fillStyle = '#3B1F12'; x.fill(); }
            rr(x, -840, 160, 46, 92, 6); L.ink(x, '#F4F0E6', 4); const fl = Math.sin(lt * 11) * 4; x.beginPath(); x.moveTo(-817, 160); x.quadraticCurveTo(-837 + fl, 120, -817, 90); x.quadraticCurveTo(-797 + fl, 120, -817, 160); L.ink(x, '#FFD25A', 3); L.glow(x, -817, 120, 360, '#FFC870', 0.4); }]]);
      if (tt > 0) { ctx.save(); ctx.globalAlpha = clamp(tt * 2); const k = E.back(tt, 1.6); ctx.translate(960, 900); ctx.scale(k, k); ctx.rotate(-0.015);
        rr(ctx, -700, -95, 1400, 190, 20); L.ink(ctx, 'rgba(28,26,31,0.9)', 6); rr(ctx, -700, 62, 1400, 30, 12); L.ink(ctx, RED, 0);
        fitText(ctx, 'HOW COCA-COLA TOOK OVER THE WORLD', 0, -12, 76, CREAM, 1320); ctx.restore(); }
    } },
];

EN.run({ module, dir: __dirname, TL, scenes, card: null,
  cues: () => {
    const kO = at('h1', 'opening') + 0.08, s1 = at('h1', 'someone', 2) - 0.08, s2 = at('h1', 'else', 1) - 0.06;
    const nine = []; { const kN = at('h2', 'nine'), kD = at('h2', 'day'); for (let i = 0; i < 9; i++) nine.push(['clink', kN - 0.35 + i * (kD - kN + 0.3) / 9, 0.45]); }
    return [
      ['thump', 0.0, 1.0], ['pop', 0.0, 0.9], ['rumble', 0.05, 0.7], ['splash', 0.5, 0.45], ['flap', 0.3, 0.4], ['gasp', 0.9, 0.5],
      ['whoosh', t2 - 0.1, 0.4], ['pop', kO, 1.0], ['fizz', kO + 0.02, 1.1], ['sparkle', at('h1', 'Coca-Cola'), 0.4],
      ['whoosh', t3 - 0.15, 0.5], ['rumble', t3 + 0.05, 0.3], ['clink', t3 + 0.6, 0.5],
      ['whoosh', t4 - 0.15, 0.5], ['pop', s1, 0.6], ['pop', s2, 0.6], ['pop', s2 + 0.35, 0.7], ['fizz', s2 + 0.4, 0.4],
      ['whoosh', t5 - 0.15, 0.5], ['pop', t5 + 0.6, 0.4], ['pop', t5 + 0.9, 0.4], ['pop', t5 + 1.2, 0.4], ['murmur', t5 + 0.2, 0.35], ['rise', t5 + 1.3, 0.4],
      ['whoosh', t6 - 0.15, 0.6], ['stamp', tTwo, 0.9], ['boom', tTwo + 0.02, 0.35], ['sparkle', at('h1', 'servings'), 0.5],
      ['tear', t7 - 0.25, 0.6], ['fizz', t7 + 0.3, 0.6], ['stamp', at('h2', '1886'), 0.6],
      ['ding', t8 + 0.3, 0.4], ...nine, ['pop', at('h2', 'day'), 0.6],
      ['whoosh', t9 + 0.05, 0.4], ['steps', t9 + 0.3, 0.4], ['ding', at('h2', 'pharmacy') + 0.1, 0.5],
      ['whoosh', t10 - 0.15, 0.5], ['steps', t10 + 0.2, 0.5], ['stamp', at('h3', 'owners'), 0.5], ['sparkle', at('h3', 'valuable'), 0.6],
      ['whoosh', t11 - 0.1, 0.4], ['paper', t11 + 0.5, 0.5], ['slam', tOne, 0.9], ['kaching', tOne + 0.12, 0.6], ['coins', tOne + 0.2, 0.4], ['scratch', tOne + 0.55, 0.4],
      ['stamp', t12 + 0.1, 0.5], ['scratch', at('h3', 'changed'), 0.6], ['stamp', at('h3', 'recipe'), 0.8],
      ['crowdboo', t13, 0.8], ['whoosh', at('h3', 'entire') - 0.1, 0.6], ['crowdboo', at('h3', 'entire') + 0.4, 0.7],
      ['clank', t14 + 0.2, 0.6], ['machine', t14 + 0.4, 0.4], ['clank', at('h3', 'plants'), 0.5], ['whoosh', at('h3', 'world') - 0.35, 0.7], ['horn', at('h3', 'world') + 0.1, 0.6], ['plane', at('h3', 'world') + 0.3, 0.35],
      ['whoosh', t16 - 0.1, 0.5], ['clink', at('h4', 'sold'), 0.5], ['ding', at('h4', 'nine'), 0.5], ['glassclink', at('h4', 'nine') + 0.2, 0.5],
      ['fall', at('h4', 'planet') - 0.4, 0.6], ['boom', at('h4', 'planet'), 0.8], ['pop', at('h4', 'planet') + 0.45, 0.5],
      ['wind', t18, 0.4], ['thump', at('h4', 'wounded'), 0.5], ['heartbeat', at('h4', 'soldier'), 0.4],
      ['splash', at('h4', 'jug'), 0.3], ['stamp', at('h4', 'jug') + 0.05, 0.7], ['bell', at('h4', 'syrup') + 0.3, 0.3]];
  },
  music: [[0, 'modern'], [t7, 'gaslight'], [t10, 'ragtime'], [t12, 'tension'], [t14, 'march'], [t16, 'build'], [t18, 'dark'], [t19, 'gaslight']] });
