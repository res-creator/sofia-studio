// Chapter 1 — "The Pharmacist" (p1–p8): Pemberton in Georgia, the war wound, coca wine, Atlanta goes dry, the syrup,
// May 8 1886 at Jacobs' Pharmacy, Robinson names it, nine drinks a day, pieces sold off, 1888.
const L = require('../../../kit/look'), P = require('../../../kit/props'), { toon, LOOKS } = require('../../../kit/toon'), EN = require('../../../kit/engine');
const K = require('./pembkit');
const { W, H, INK, CREAM, RED, YELLOW, BLUE, ERA, ink, rr, ell, poly, clamp, lerp, seg, E, hash, fitText } = L;
const TL = EN.timeline(__dirname, { start: 3.0, gap: 0.55, gaps: { p5: 0.8, p6: 0.75, p8: 0.7 } }), at = TL.at, begin = TL.begin, end = TL.end;
const pop = (t, t0, d = 0.35) => clamp((t - t0) / d);
const PEM = LOOKS.pemberton, ROB = LOOKS.robinson;
const PEM_WAR = { ...PEM, hair: { style: 'side', col: '#6B5A48' }, beardCol: '#7A6650', top: '#7E8288', top2: null, bow: null, pants: '#6E7278', hat: 'cap', hatCol: '#7E8288', buttons: 1 };
const PEM_APRON = { ...PEM, apron: '#F4F0E6' };
const CLERK = LOOKS.pharmacist;
const GENT = { skin: '#E8B58A', hair: { style: 'short', col: '#5A3A22' }, stache: 1, top: '#4A5A3A', top2: '#F4F0E6', bow: '#D93A35', pants: '#3A3A30', hat: 'bowler', hatCol: '#3A2A24' };
const LADY = { skin: '#8E5A36', hair: { style: 'bun', col: '#151313' }, top: '#8A3A5A', pants: '#5A2A3A' };

// ---------- helpers ----------
function desat(ctx, a, tint = '#CFC6B4') { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'saturation'; ctx.globalAlpha = a; ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = a * 0.6; ctx.fillStyle = tint; ctx.fillRect(0, 0, W, H); ctx.restore(); }
function flash(ctx, u, col = '#FFFFFF') { if (u <= 0 || u >= 1) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = (1 - u) * 0.8; ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); ctx.restore(); }
function shakeCam(c, lt, hits, amp = 16) { const s = EN.shake(lt, hits, amp); c.x += s.x / c.z; c.y += s.y / c.z; return c; }
function sidewalk(ctx, y, col = '#9A7A55') { L.planks(ctx, -2600, y, 5200, 900, col, { pw: 40 }); ctx.beginPath(); ctx.moveTo(-2600, y); ctx.lineTo(2600, y); ink(ctx, null, 5); }
function road(ctx, y, h, col = '#B59A70') { P.street(ctx, -2800, y, 5600, h, { col, curb: '#C9BFA8' }); }
function smoke(ctx, t, n = 10, col = '#B9B4AA', a = 0.55, seed = 0) { for (let i = 0; i < n; i++) { const v = hash(i * 5.1 + seed), x = -1800 + ((v * 3600 + t * (30 + v * 40)) % 3600), y = -500 + hash(i * 2.7 + seed) * 700; ctx.save(); ctx.globalAlpha = a * (0.5 + v * 0.5); L.cloud(ctx, x, y, 1.6 + v * 2, col); ctx.restore(); } }
function windowFrame(ctx, x, y, w, h, sky) { rr(ctx, x - 16, y - 16, w + 32, h + 32, 6); ink(ctx, '#5A3420', 6); ctx.save(); rr(ctx, x, y, w, h, 4); ctx.clip(); sky(ctx, x, y, w, h); ctx.restore(); rr(ctx, x, y, w, h, 4); ink(ctx, null, 5);
  ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + h); ctx.moveTo(x, y + h / 2); ctx.lineTo(x + w, y + h / 2); ctx.lineWidth = 10; ctx.strokeStyle = '#5A3420'; ctx.stroke(); rr(ctx, x - 26, y + h + 8, w + 52, 22, 5); ink(ctx, '#7A4A2A', 5); }
function bandage(ctx, x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.12); rr(ctx, -52, -138, 104, 26, 8); ink(ctx, '#F4F0E6', 4); ctx.beginPath(); ctx.moveTo(-30, -136); ctx.lineTo(-24, -114); ctx.moveTo(10, -136); ctx.lineTo(16, -114); ctx.lineWidth = 2.5; ctx.strokeStyle = '#C9C0AE'; ctx.stroke(); ctx.restore(); }
function sling(ctx, x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(-40, -170); ctx.lineTo(48, -90); ctx.lineTo(30, -76); ctx.lineTo(-52, -156); ctx.closePath(); ink(ctx, '#F4F0E6', 4); ctx.restore(); }
function headBand(ctx, x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(ctx, -64, -300, 128, 22, 9); ink(ctx, '#F4F0E6', 4); ctx.restore(); }
const SEPIA_SKY = ['#F6E2B8', '#EAB979'];

// ---------- scene times (cut on the stressed word) ----------
const tWar = at('p1', 'In', 1) - 0.14, tVet = at('p1', 'and') - 0.12, tMor = at('p1', 'ended') - 0.3,
  tShop = begin('p2') - 0.2, tLab = at('p2', 'He', 1) - 0.12, tBest = at('p2', 'His') - 0.12,
  tDry = begin('p3') - 0.2, tOver = at('p3', 'Overnight') - 0.12,
  tKet = begin('p4') - 0.2, tIng = at('p4', 'dropped') - 0.3, tSug = at('p4', 'nut') + 0.25, tSyr = at('p4', 'result') - 0.3,
  tMay = begin('p5') - 0.2, tWalk = at('p5', 'he') - 0.12, tMix = at('p5', 'There') - 0.12, tFount = at('p5', 'sold') - 0.12, tFive = at('p5', 'Five') - 0.12,
  tRob = begin('p6') - 0.2, tName = at('p6', 'came') - 0.12, tScript = at('p6', 'also') - 0.3,
  tNine = begin('p7') - 0.2, tAds = at('p7', 'By') - 0.12,
  tTime = begin('p8') - 0.2, tSick = at('p8', 'Sick') - 0.12, tSold = at('p8', 'sold') - 0.15, t1888 = at('p8', 'In') - 0.15, tNever = at('p8', 'never') - 0.25;

const fy = (z, d = 0) => 330 - 420 / z + d; // camera y that puts the floor (y = 330) near the bottom of the frame
const scenes = [
  // p1 ---------------------------------------------------------------------------------------------------
  { name: 'Georgia: the druggist on his street', t0: 0, era: 'sepia', out: { type: 'tear', dur: 0.5 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -260, fy(1.05), 1.05], [3, -170, fy(1.12), 1.12], [6.2, -80, fy(1.24), 1.24]], lt);
      EN.layers(ctx, c, [
        [0.25, x => { L.skyGrad(x, -2400, -1400, 4800, 1800, SEPIA_SKY); L.glow(x, 700, -380, 400, '#FFF0C8', 0.5); L.cloud(x, -700 + lt * 10, -420, 1.3, '#FBF1DC'); L.cloud(x, 500 + lt * 7, -520, 1.0, '#FBF1DC'); L.cloud(x, 1500 + lt * 8, -380, 1.2, '#FBF1DC'); }],
        [0.5, x => K.skyline(x, lt, { col: '#C9A07A' })],
        [0.8, x => { K.streetRow(x, -2300, 200, [{ sign: 'FEED & SEED', col: '#9A6A4A', awning: ['#2F6DB5', CREAM] }, { sign: 'HARDWARE', col: '#B86B4B', awning: [YELLOW, CREAM] }, { sign: 'DRY GOODS', col: '#A9693E', h: 600 }, { sign: 'BARBER', col: '#C98E5A', awning: [RED, CREAM], w: 380 }, { sign: 'BAKERY', col: '#B86B4B', awning: ['#2F8A6A', CREAM] }, { sign: 'POST OFFICE', col: '#8A6A5A', h: 620 }, { sign: 'GENERAL STORE', col: '#A9693E', awning: [RED, CREAM] }, { sign: 'HOTEL', col: '#9A5B44', h: 640 }]);
            road(x, 200, 260); P.crowd(x, 700, 1150, 215, 0.42, 3, lt, { hats: ['bowler', 'boater', null], seed: 3 }); K.horseBuggy(x, -1700 + lt * 340, 300, 0.75, lt); }],
        [1, x => { sidewalk(x, 300);
            P.storefront(x, -1250, 330, { w: 720, h: 960, col: '#B86B4B', sign: 'DRUGS & MEDICINES', signCol: '#2A3A2E', awning: [RED, CREAM], upper: 3, display: (g, dx, dy, dw, dh) => { K.showGlobe(g, dx + 70, dy + dh - 10, 0.5, '#D93A35', lt); K.showGlobe(g, dx + 200, dy + dh - 10, 0.5, '#2F8A6A', lt + 1); K.showGlobe(g, dx + 330, dy + dh - 10, 0.5, '#2F6DB5', lt + 2); } });
            P.crate(x, -380, 330, 0.8, { n: 3, text: 'TONICS' }); K.jar(x, -420, 262, 60, 80, '#E3C77D', 'SODA'); K.jar(x, -340, 262, 50, 64, '#B7D7C9', 'ZINC');
            toon(x, -60, 335, 1.3, PEM_APRON, t < at('p1', 'pharmacist') - 0.1 ? 'wave' : 'present', t < at('p1', 'Georgia') ? 'happy' : 'grin', { t: lt, itemL: g => K.mortar(g, 0, 20, 0.4, lt) });
            K.dog(x, 330, 330, 0.9, lt, { walk: false }); P.lamppost(x, 560, 330, 1.05, false); }],
        [1.3, x => { P.lamppost(x, 1450 - lt * 20, 520, 1.4, false); P.crate(x, -1500, 560, 1.3, { n: 3, kind: 'straight' }); }]]);
      L.plate(ctx, 'PHARMACIST', 1420, 210, pop(t, at('p1', 'pharmacist') - 0.05), { size: 70 });
      L.plate(ctx, 'GEORGIA', 1420, 330, pop(t, at('p1', 'Georgia')), { size: 56, bg: RED, fg: CREAM, rot: 0.03 });
    } },
  { name: 'Civil War flashback: smoke, saber flash, bandage', t0: tWar, era: 'sepia', out: { type: 'cut' }, draw(ctx, t, lt) {
      const tS = at('p1', 'saber') - 0.28 - tWar, hit = tS + 0.12;
      const c = shakeCam(EN.cam([[0, 160, fy(1.4), 1.4], [tS, 60, fy(1.5), 1.5], [hit + 0.6, 0, fy(1.7, -20), 1.7], [5, -20, fy(1.75, -20), 1.75]], lt), lt, [hit], 22);
      EN.layers(ctx, c, [
        [0.25, x => { L.skyGrad(x, -2400, -1400, 4800, 1800, ['#8C8478', '#CFC4AE']); L.glow(x, -500, -200, 500, '#F2D6A0', 0.35); }],
        [0.45, x => { for (let i = 0; i < 16; i++) { const tx = -2000 + i * 260; ell(x, tx, 120, 150, 120 + hash(i) * 80); ink(x, '#6A6A5E', 0); } x.fillStyle = '#7A7564'; x.fillRect(-2400, 120, 4800, 600); for (let i = 0; i < 6; i++) { const tx = -1500 + i * 600; poly(x, [[tx - 80, 130], [tx, 40], [tx + 80, 130]]); ink(x, '#B9B2A2', 3); } }],
        [0.7, x => { smoke(x, lt, 9, '#A8A296', 0.7, 1); for (let i = 0; i < 9; i++) { const fx = -1600 + i * 360; rr(x, fx, 120, 16, 160, 3); ink(x, '#6B5A48', 3); if (i % 3 !== 1) { x.save(); x.translate(fx, 160); x.rotate(i % 2 ? 0.2 : -0.15); rr(x, 0, -6, 360, 14, 3); ink(x, '#7A6650', 3); x.restore(); } } }],
        [1, x => { x.fillStyle = '#8A8270'; x.fillRect(-2400, 260, 4800, 800); for (let i = 0; i < 30; i++) { x.beginPath(); x.moveTo(-2000 + i * 140, 300 + hash(i) * 300); x.lineTo(-1990 + i * 140, 280 + hash(i) * 300); x.lineWidth = 4; x.strokeStyle = '#6B6454'; x.stroke(); }
            const hurt = lt > hit, pose = !hurt ? 'stand' : { la: [0.3, 0.2], ra: [0.85, -2.1], lean: -0.06 };
            toon(x, 0, 330, 1.25, PEM_WAR, pose, !hurt ? 'determined' : (lt < hit + 1.2 ? 'shock' : 'sad'), { t: lt, look: [0.6, -0.2] });
            if (lt > hit + 1.0) { x.save(); x.globalAlpha = clamp((lt - hit - 1.0) / 0.4); bandage(x, 0, 330, 1.25); x.restore(); }
            const u = clamp((lt - tS) / 0.3); if (u > 0 && u < 1) { x.save(); x.translate(260, -60); x.rotate(-1.4 + u * 2.2); rr(x, 0, -8, 440, 16, 8); ink(x, '#E9EEF2', 4); rr(x, -60, -14, 60, 28, 6); ink(x, '#8A6A3A', 4); x.restore();
              x.save(); x.globalAlpha = 0.6 * (1 - u); x.beginPath(); x.arc(260, -60, 440, -1.4, -1.4 + u * 2.2); x.lineWidth = 60; x.strokeStyle = '#FFFFFF'; x.stroke(); x.restore(); }
            P.burst(x, 250, 40, 150, clamp((lt - hit) / 0.45), '#FFF7DA'); }],
        [1.35, x => smoke(x, lt * 1.6, 5, '#C9C3B6', 0.5, 7)]]);
      flash(ctx, clamp((lt - hit) / 0.35));
      desat(ctx, 0.88);
      L.dateCard(ctx, '1865', 300, 170, pop(t, at('p1', 'Civil')), { bg: '#E9DFC6' });
      L.word(ctx, 'CIVIL WAR', 1500, 170, pop(t, at('p1', 'Civil') + 0.15), { size: 90, col: CREAM });
    } },
  { name: 'like many veterans: the bench of bandages', t0: tVet, era: 'sepia', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -420, fy(1.4), 1.4], [2.4, 260, fy(1.4), 1.4]], lt);
      EN.layers(ctx, c, [
        [0.5, x => { L.planks(x, -2400, -1200, 4800, 1500, '#C8B08A', { vertical: true, pw: 90 }); for (let i = 0; i < 5; i++) { rr(x, -1700 + i * 800, -460, 260, 300, 6); ink(x, '#E9DDBE', 6); x.beginPath(); x.moveTo(-1570 + i * 800, -460); x.lineTo(-1570 + i * 800, -160); x.moveTo(-1700 + i * 800, -310); x.lineTo(-1440 + i * 800, -310); ink(x, null, 5); }
            for (let i = 0; i < 8; i++) { rr(x, -1800 + i * 480, -40, 140, 70, 6); ink(x, '#F4F0E6', 4); rr(x, -1800 + i * 480, -10, 140, 50, 6); ink(x, '#B9C4C8', 4); } }],
        [1, x => { L.planks(x, -2400, 300, 4800, 800, '#8C6A44', { pw: 44 }); rr(x, -1500, 262, 3000, 30, 8); ink(x, '#6B4123', 5); for (let i = 0; i < 7; i++) { rr(x, -1450 + i * 480, 292, 24, 50, 4); ink(x, '#5A3420', 4); }
            const vets = [[-1000, { skin: '#D39A6A', hair: { style: 'short', col: '#2B1E16' }, top: '#7E8288', pants: '#6E7278' }, 'sling'], [-640, { skin: '#F2C9A0', hair: { style: 'side', col: '#A4462A' }, stache: 1, top: '#5A6A7A', pants: '#4A4F5C' }, 'head'],
              [-280, PEM_WAR, 'band'], [80, { skin: '#B97A4E', hair: { style: 'curly', col: '#151313' }, top: '#7E8288', pants: '#6E7278' }, 'head'], [440, { skin: '#E8B58A', hair: { style: 'bald', col: '#8A8378' }, beard: 'full', beardCol: '#8A8378', top: '#6A6E74', pants: '#5A5E64' }, 'sling'], [800, { skin: '#F6D3B3', hair: { style: 'short', col: '#D9B25A' }, top: '#7E8288', pants: '#6E7278', build: 'thin' }, 'band']];
            vets.forEach(([vx, lk, b], i) => { const look = { ...lk, hat: null }, s = 1.1; toon(x, vx, 330, s, look, 'sit', i === 2 ? 'sad' : ['sleepy', 'sad', 'neutral', 'worried', 'sleepy', 'sad'][i], { t: lt + i, seed: i, look: [Math.sin(lt + i) * 0.3, 0] });
              if (b === 'sling') sling(x, vx, 330 + 40 * s, s); if (b === 'head') headBand(x, vx, 330 + 40 * s, s); if (b === 'band') bandage(x, vx, 330 + 40 * s, s); });
            x.save(); x.translate(1120, 330); x.rotate(-0.25); rr(x, -10, -340, 20, 340, 6); ink(x, '#8A6A44', 4); rr(x, -40, -360, 80, 24, 10); ink(x, '#8A6A44', 4); x.restore(); }],
        [1.3, x => { rr(x, -1700 + lt * 60, -900, 140, 2000, 0); ink(x, '#5A3420', 6); }]]);
      desat(ctx, 0.65);
      L.word(ctx, 'VETERANS', 1520, 170, pop(t, at('p1', 'veterans')), { size: 80, col: CREAM });
    } },
  { name: 'the dark cloud: fighting morphine (respectful)', t0: tMor, era: 'gaslight', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, fy(1.15), 1.15], [3.2, 40, fy(1.38, -30), 1.38]], lt), kF = at('p1', 'fighting') - tMor, kA = at('p1', 'addiction') - tMor;
      EN.layers(ctx, c, [
        [0.5, x => { L.wallpaper(x, -2000, -1200, 4000, 1500, '#4A3040', '#583848'); windowFrame(x, 420, -420, 360, 380, (g, wx, wy, ww, wh) => { L.skyGrad(g, wx, wy, ww, wh, ['#1A1A30', '#3A3050']); g.beginPath(); g.arc(wx + 260, wy + 100, 40, 0, 6.27); ink(g, '#F2E8C8', 0);
              g.save(); g.strokeStyle = 'rgba(180,200,230,0.5)'; g.lineWidth = 3; for (let i = 0; i < 14; i++) { const ph = (lt * 1.4 + hash(i)) % 1; g.beginPath(); g.moveTo(wx + hash(i * 3) * ww, wy + ph * wh); g.lineTo(wx + hash(i * 3) * ww - 8, wy + ph * wh + 30); g.stroke(); } g.restore(); });
            P.clock(x, -560, -300, 70, lt * 0.5, { rim: '#6B4123' }); P.shelves(x, -1500, -560, 600, 520, { rows: 3, seed: 5 }); }],
        [1, x => { L.planks(x, -2400, 300, 4800, 900, '#5A3A24', { pw: 44 });
            const pushed = lt > kA - 0.1; const bx = pushed ? lerp(-150, -380, E.out(clamp((lt - kA + 0.1) / 0.5))) : -150;
            toon(x, 0, 330, 1.3, PEM, pushed ? { la: [0.4, -0.5], ra: [1.25, -0.2] } : 'think', pushed ? 'determined' : 'sad', { t: lt, look: pushed ? [-0.6, 0.3] : [-0.6, 0.6] });
            // desk (front panel hides the legs)
            rr(x, -620, 160, 1240, 36, 8); ink(x, '#6B4123', 6); rr(x, -590, 196, 1180, 200, 6); ink(x, '#5A3420', 6); for (let i = 0; i < 3; i++) { rr(x, -560 + i * 390, 220, 340, 150, 8); ink(x, '#6B4123', 4); }
            P.bottle(x, bx, 162, 0.55, { kind: 'straight', label: 'MORPHINE', fill: 0.4 });
            rr(x, 300, 90, 60, 72, 10); ink(x, '#C9A44A', 4); x.beginPath(); x.moveTo(302, 90); x.quadraticCurveTo(270, -10, 330, -30); x.quadraticCurveTo(390, -10, 358, 90); x.closePath(); ink(x, 'rgba(255,240,200,0.5)', 4); L.glow(x, 330, 40, 460 + Math.sin(lt * 7) * 10, '#FFC870', 0.45);
            P.bottle(x, 420, 162, 0.3, { kind: 'straight', label: '', fill: 0.6 }); rr(x, -480, 130, 200, 30, 4); ink(x, '#E9E1CC', 3);
            const cu = clamp((lt - kF + 0.6) / 0.6); if (cu > 0) { x.save(); x.globalAlpha = cu; K.cloudDark(x, 10, -230 - (1 - cu) * 30, 0.9 + cu * 0.12, lt, { col: '#3E3A48' }); x.restore(); } }]]);
    } },
  // p2 ---------------------------------------------------------------------------------------------------
  { name: 'what pharmacists did in the 1880s', t0: tShop, era: 'gaslight', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -520, fy(1.25), 1.25], [3.4, 140, fy(1.15), 1.15]], lt);
      EN.layers(ctx, c, [
        [0.6, x => K.drugWall(x, lt, { seed: 3, signs: ['TINCTURES', 'PRESCRIPTIONS', 'EXTRACTS', 'POWDERS'] })],
        [1, x => { K.floorTiles(x, 330); toon(x, 0, 290, 1.25, PEM_APRON, 'hold', 'happy', { t: lt, itemR: g => K.mortar(g, -20, 30, 0.45, lt * 1.5) });
            K.counter(x, -1600, 200, 3200); K.showGlobe(x, -1150, 190, 0.9, '#D93A35', lt); K.showGlobe(x, 1150, 190, 0.9, '#2F6DB5', lt + 2); K.register(x, 560, 190, 0.9, '$');
            K.jar(x, -480, 190, 90, 120, '#B7D7C9', 'PILLS'); K.jar(x, -360, 190, 70, 90, '#E3C77D', 'TONIC'); K.flask(x, 320, 190, 0.75, '#9C6AA8', lt);
            toon(x, -640, 380, 1.3, GENT, lt < 1.6 ? { la: [0.18, 0.1], ra: [1.3, -0.4] } : 'hold', lt < 1.6 ? 'worried' : 'happy', { t: lt, itemR: lt > 1.6 ? g => P.bottle(g, 0, 30, 0.45, { kind: 'straight', label: 'TONIC' }) : null });
            if (lt < 1.6) { x.save(); x.globalAlpha = 0.7; L.cloud(x, -560 + Math.sin(lt * 9) * 6, -40, 0.4, '#F4F0E6'); x.restore(); } }],
        [1.35, x => { P.crate(x, 1350, 560, 1.2, { n: 3, text: 'GLASS - FRAGILE', bottles: false }); }]]);
      L.dateCard(ctx, '1880s', 320, 170, pop(t, at('p2', '1880s') - 0.05));
    } },
  { name: 'tonics as cures: the lab bench', t0: tLab, era: 'gaslight', out: { type: 'cut' }, draw(ctx, t, lt) {
      const kT = at('p2', 'tonics') - tLab, kC = at('p2', 'cures') - tLab;
      const c = EN.cam([[0, 200, fy(1.3), 1.3], [kC, -60, fy(1.16), 1.16], [3.2, -100, fy(1.2), 1.2]], lt);
      EN.layers(ctx, c, [
        [0.6, x => { L.bricks(x, -2000, -1200, 4000, 1500, '#8A5040'); P.shelves(x, 200, -560, 700, 460, { rows: 3, seed: 7 }); P.shelves(x, 1000, -560, 600, 460, { rows: 3, seed: 11 });
            const pu = pop(lt, kC - 0.05, 0.4); if (pu > 0) { P.poster(x, -560, -310 - (1 - E.back(pu, 2)) * 60, 520, 360, { rot: -0.04, bg: '#F2E2B8', title: 'CURES EVERYTHING!', sub: 'HEADACHE · NERVES · GLOOM · GOUT', draw: (g, w, h) => { K.wineBottle(g, -150, 120, 0.42, { label: ['DR. P', 'TONIC', 'No. 7'] }); K.wineBottle(g, 150, 120, 0.42, { col: '#3A5A4A', label: ['DR. P', 'TONIC', 'No. 9'] }); fitText(g, '★ ★ ★', 0, 20, 50, '#C9A44A', 300); } }); } }],
        [1, x => { K.floorTiles(x, 330, 700, '#D9CDB4', '#5A3A2A');
            toon(x, 60, 290, 1.25, PEM_APRON, 'pour', lt > kC ? 'smug' : 'happy', { t: lt, itemR: g => { g.rotate(-1.0 - Math.sin(lt * 3) * 0.1); K.flask(g, 0, 40, 0.42, '#9C6AA8', lt, { steam: false }); } });
            K.counter(x, -1600, 200, 3200, { top: '#8A6A4A' });
            const cols = ['#D93A35', '#2F8A6A', '#F7C548', '#9C6AA8', '#2F6DB5', '#E07A3A']; cols.forEach((col, i) => K.flask(x, -1000 + i * 170 + (i > 2 ? 820 : 0), 195, 0.7 + (i % 2) * 0.15, col, lt * 1.3, { seed: i }));
            const ru = clamp((lt - kT) / 1.2); if (ru > 0 && ru < 1) { x.save(); x.globalAlpha = 1 - ru; x.beginPath(); x.ellipse(360 + ru * 40, -30 - ru * 260, 40 + ru * 60, 18 + ru * 24, 0, 0, 6.28); x.lineWidth = 20; x.strokeStyle = '#E6DFF0'; x.stroke(); x.restore(); }
            K.wineBottle(x, 360, 195, 0.5, { label: ['DR. P', 'TONIC', ''] }); P.burst(x, 360, 40, 160, clamp((lt - kT) / 0.4), '#E6DFF0'); }]]);
    } },
  { name: 'best seller: coca wine', t0: tBest, era: 'gaslight', out: { type: 'whip', dur: 0.3, dir: 1 }, draw(ctx, t, lt) {
      const kW = at('p2', 'wine', 1) - tBest, kB = at('p2', 'best') - tBest;
      const c = EN.cam([[0, -420, fy(1.18), 1.18], [kW - 0.3, -340, fy(1.12), 1.12], [kW + 0.4, 830, fy(1.12, -30), 1.12], [6, 880, fy(1.16, -30), 1.16]], lt);
      EN.layers(ctx, c, [
        [0.6, x => { K.drugWall(x, lt, { seed: 21, lamps: false }); }],
        [1, x => { K.floorTiles(x, 330);
            toon(x, -160, 290, 1.25, PEM_APRON, 'present', 'grin', { t: lt });
            K.counter(x, -1600, 200, 1900, {});
            const gone = Math.floor(clamp((lt - 0.4) / (kW - 0.6)) * 6); let k = 0;
            for (let r = 0; r < 4; r++) for (let i = 0; i < 4 - r; i++, k++) { if (k < gone) continue; K.wineBottle(x, -820 + i * 100 + r * 50, 198 - r * 132, 0.48); }
            for (let j = 0; j < 3; j++) { const ph = ((lt - 0.4) * 1.5 + j * 0.33) % 1; if (lt > 0.4 && lt < kW - 0.2) { const hx = -1420 + Math.sin(ph * Math.PI) * 480, hy = -150 + j * 110; x.beginPath(); x.moveTo(-1800, hy + 60); x.lineTo(hx, hy); x.lineWidth = 50; x.strokeStyle = INK; x.lineCap = 'round'; x.stroke(); x.lineWidth = 40; x.strokeStyle = ['#2F6DB5', '#8A3A5A', '#4A5A3A'][j]; x.stroke(); x.beginPath(); x.arc(hx, hy, 30, 0, 6.27); ink(x, L.SKIN[j * 2], 5); if (ph > 0.5) K.wineBottle(x, hx, hy + 40, 0.3); } }
            const bu = pop(lt, kB, 0.4); if (bu > 0) { x.save(); x.translate(-650, -420); x.rotate(-0.08); const s = E.back(bu, 2.2); x.scale(s, s); poly(x, [[-260, -50], [260, -50], [230, 0], [260, 50], [-260, 50], [-230, 0]]); ink(x, RED, 6); fitText(x, 'BEST SELLER', 0, 2, 56, CREAM, 440); x.restore(); }
            // chalkboard recipe on an easel
            for (const lx of [460, 1300]) { x.beginPath(); x.moveTo(lx, -100); x.lineTo(lx + (lx < 900 ? -40 : 40), 330); x.lineWidth = 22; x.strokeStyle = INK; x.stroke(); x.lineWidth = 14; x.strokeStyle = '#7A4A2A'; x.stroke(); }
            rr(x, 380, -470, 1000, 560, 12); ink(x, '#7A4A2A', 8); rr(x, 410, -440, 940, 500, 6); ink(x, '#2E3A34', 4); fitText(x, 'COCA WINE', 880, -380, 60, '#F2EEE4', 800, { font: L.F.type });
            const a1 = pop(lt, kW - 0.1, 0.4), a2 = pop(lt, at('p2', 'coca', 1) - tBest - 0.1, 0.4), a3 = pop(lt, at('p2', 'leaf') - tBest + 0.2, 0.4);
            if (a1 > 0) { x.save(); x.translate(560, -60); x.scale(E.back(a1), E.back(a1)); K.wineBottle(x, 0, 30, 0.62, { col: '#6A2A3A', label: ['RED', 'WINE', ''] }); x.restore(); fitText(x, 'WINE', 560, 20, 34, '#F2EEE4', 200, { font: L.F.type }); }
            if (a2 > 0) { fitText(x, '+', 720, -150, 110, '#F2EEE4', 200); x.save(); x.translate(880, -170); x.scale(E.back(a2), E.back(a2)); K.leaf(x, 0, 0, 1.0, 0.4); x.restore(); fitText(x, 'COCA LEAF', 880, 20, 34, '#F2EEE4', 260, { font: L.F.type }); }
            if (a3 > 0) { fitText(x, '=', 1040, -150, 110, '#F2EEE4', 200); x.save(); x.translate(1200, -50); x.scale(E.back(a3), E.back(a3)); K.wineBottle(x, 0, 60, 0.62, { face: 'look' }); x.restore(); P.sparkles(x, 1200, -180, 150, lt, 6); } }]]);
    } },
  // p3 ---------------------------------------------------------------------------------------------------
  { name: 'Atlanta votes, the DRY stamp', t0: tDry, era: 'sepia', out: { type: 'cut' }, draw(ctx, t, lt) {
      const kA = at('p3', 'Atlanta') - tDry, kD = at('p3', 'dry') - tDry - 0.1;
      const c = shakeCam(EN.cam([[0, -40, 120, 1.7], [kA, -20, fy(1.12), 1.12], [kD, 0, fy(1.02), 1.02], [3.6, 0, fy(1.06), 1.06]], lt), lt, [kD], 26);
      EN.layers(ctx, c, [
        [0.25, x => { L.skyGrad(x, -2400, -1400, 4800, 1800, SEPIA_SKY); L.cloud(x, -800 + lt * 12, -480, 1.3, '#FBF1DC'); L.cloud(x, 700 + lt * 8, -560, 1.0, '#FBF1DC'); }],
        [0.5, x => K.skyline(x, lt, { col: '#C9A07A' })],
        [0.8, x => { const shut = lt > kD + 0.15; K.streetRow(x, -2100, 200, [{ sign: 'ATLANTA HOTEL', col: '#9A5B44', h: 640 }, { sign: 'SALOON', col: '#8A5A3A', awning: ['#7A2E2E', CREAM], after: (g, sx, sy) => { if (shut) { g.save(); g.translate(sx + 290, sy - 170); for (const r of [-0.4, 0.4]) { g.save(); g.rotate(r); rr(g, -110, -14, 220, 28, 4); ink(g, '#C8954F', 4); g.restore(); } g.restore(); rr(g, sx + 60, sy - 330, 200, 60, 6); ink(g, CREAM, 4); fitText(g, 'CLOSED', sx + 160, sy - 300, 40, RED, 180); } } }, { sign: 'BAR & BILLIARDS', col: '#A9693E', awning: [YELLOW, '#7A2E1E'] }, { sign: 'WINE & SPIRITS', col: '#8A5A3A', awning: [RED, CREAM] }, { sign: 'CITY HALL', col: '#B9A890', h: 700, brick: false }]); road(x, 200, 400); }],
        [1, x => { rr(x, -120, 150, 240, 180, 10); ink(x, '#8A5A33', 6); rr(x, -60, 140, 120, 20, 5); ink(x, INK, 0); fitText(x, 'BALLOTS', 0, 240, 40, CREAM, 200); rr(x, -150, 320, 300, 20, 6); ink(x, '#6B4123', 5);
            for (let i = 0; i < 4; i++) { const ph = (lt * 1.2 + i * 0.25) % 1; if (lt < kD) { x.save(); x.translate(-20 + i * 14, 60 + ph * 90); x.rotate(0.2 * Math.sin(i + lt)); x.globalAlpha = 1 - ph * 0.5; rr(x, -26, -18, 52, 36, 3); ink(x, CREAM, 3); x.restore(); } }
            const jump = lt > kD ? Math.max(0, Math.sin((lt - kD) * 12) * 30 * Math.exp(-(lt - kD) * 3)) : 0;
            P.crowd(x, -820, -320, 360 - jump, 1.0, 3, lt, { hats: ['bowler', 'boater', null], seed: 11, react: lt > kD ? 'shock' : null, pose: lt > kD ? null : 'hold' });
            P.crowd(x, 320, 820, 360 - jump, 1.0, 3, lt, { hats: ['bowler', null, 'boater'], seed: 5, react: lt > kD ? 'shock' : null, pose: lt > kD ? null : 'point' });
            const su = clamp((lt - kD + 0.25) / 0.25), up = clamp((lt - kD - 0.35) / 0.4); if (su > 0) { const sy = lerp(-1400, -330, E.in(su)) - E.inOut(up) * 1100;
              if (lt > kD) { x.save(); x.translate(0, -230); x.rotate(-0.08); x.globalAlpha = 0.92; fitText(x, 'DRY', 0, 0, 380, RED, 1200, { outline: 18, oc: '#7A1E1A' }); x.restore(); }
              x.save(); x.translate(0, sy); rr(x, -460, -60, 920, 120, 14); ink(x, '#7A2E1E', 7); rr(x, -380, -200, 760, 140, 12); ink(x, '#8A5A33', 7); rr(x, -70, -560, 140, 360, 30); ink(x, '#6B4123', 7); ell(x, 0, -580, 130, 70); ink(x, '#8A5A33', 7); x.restore(); }
            P.burst(x, 0, -100, 700, clamp((lt - kD) / 0.5), YELLOW); }]]);
      L.dateCard(ctx, '1886', 300, 170, pop(t, at('p3', '1886')));
      L.plate(ctx, 'ATLANTA', 1560, 170, pop(t, at('p3', 'Atlanta')), { size: 64, bg: CREAM });
    } },
  { name: 'overnight: the best seller sweats', t0: tOver, era: 'gaslight', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const kP = at('p3', 'problem') - tOver, sw = clamp((lt - 0.6) / 1.0);
      const c = EN.cam([[0, 0, fy(1.08, -30), 1.08], [kP, 0, fy(1.22, -40), 1.22], [3, 0, fy(1.28, -40), 1.28]], lt);
      EN.layers(ctx, c, [
        [0.55, x => { L.wallpaper(x, -2000, -1200, 4000, 1500, '#6E3A2C', '#84483A'); const day = clamp((lt - 0.2) / 0.6);
            windowFrame(x, -1050, -520, 380, 400, (g, wx, wy, ww, wh) => { L.skyGrad(g, wx, wy, ww, wh, day < 0.5 ? ['#1A1A30', '#3A3050'] : SEPIA_SKY); const a = lerp(-0.2, 3.3, E.inOut(day)); g.beginPath(); g.arc(wx + ww / 2 + Math.cos(a) * 150, wy + wh * 0.8 - Math.sin(a) * 240, 44, 0, 6.27); ink(g, day < 0.5 ? '#F2E8C8' : '#FFD25A', 4); });
            P.clock(x, 960, -330, 80, lt * 14, { rim: '#6B4123' }); }],
        [1, x => { K.floorTiles(x, 330); rr(x, -760, -60, 1520, 30, 4); ink(x, '#8A5A33', 5); for (const bx of [-740, 720]) { rr(x, bx, -30, 20, 50, 4); ink(x, '#6B4123', 4); }
            for (let i = 0; i < 6; i++) K.wineBottle(x, -600 + i * 240, -62, 0.62, { face: sw > 0.3 ? 'worried' : 'look', sweat: sw > 0 ? lt + i * 0.3 : 0 });
            toon(x, 0, 380, 1.3, PEM_APRON, lt > kP - 0.2 ? 'facepalm' : 'shock', lt > kP - 0.2 ? 'worried' : 'shock', { t: lt });
            K.counter(x, -1600, 230, 3200); K.wineBottle(x, 460, 228, 0.55, { face: 'worried', sweat: lt }); }]]);
      L.word(ctx, 'OVERNIGHT', 400, 170, pop(t, at('p3', 'Overnight')), { size: 84, col: CREAM });
      L.word(ctx, 'PROBLEM.', 1500, 170, pop(t, at('p3', 'problem')), { size: 110, col: RED, rot: 0.04 });
    } },
  // p4 ---------------------------------------------------------------------------------------------------
  { name: 'back to the kettle', t0: tKet, era: 'gaslight', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -380, fy(1.12), 1.12], [2.2, -40, fy(1.28), 1.28]], lt), wx = lerp(-1100, -360, E.out(clamp(lt / 1.6)));
      EN.layers(ctx, c, [
        [0.55, x => { L.bricks(x, -2200, -1200, 4400, 1500, '#9A5B44'); P.shelves(x, -1600, -560, 700, 420, { rows: 3, seed: 13 }); windowFrame(x, 780, -520, 380, 320, (g, wx2, wy, ww, wh) => L.skyGrad(g, wx2, wy, ww, wh, ['#2E2440', '#7A4B5A']));
            for (let i = 0; i < 5; i++) { x.save(); x.translate(-300 + i * 80, -620); x.rotate(Math.sin(lt + i) * 0.05); x.beginPath(); x.moveTo(0, 0); x.lineTo(0, 80); ink(x, null, 3); K.leaf(x, 0, 120, 0.45, 0.3, '#5F8F5F'); x.restore(); } }],
        [1, x => { L.planks(x, -2400, 300, 4800, 900, '#6B4A30', { pw: 44 }); for (let i = 0; i < 3; i++) K.sugarSack(x, 900 + i * 150, 335, 0.95, (i - 1) * 0.08);
            rr(x, 0, 160, 600, 190, 14); ink(x, '#3A3438', 7); rr(x, 170, 210, 260, 110, 10); ink(x, '#1E1A1C', 5); for (let i = 0; i < 5; i++) { const fh = 50 + Math.sin(lt * 14 + i * 2) * 18; poly(x, [[195 + i * 48, 310], [219 + i * 48, 310 - fh], [243 + i * 48, 310]]); ink(x, i % 2 ? '#F7C548' : '#E8622E', 3); } L.glow(x, 300, 270, 260, '#FF9A40', 0.4);
            rr(x, 470, -700, 70, 760, 6); ink(x, '#3A3438', 6); P.kettle(x, 300, 165, 1.5, lt);
            toon(x, wx, 330, 1.25, PEM_APRON, lt < 1.6 ? 'walk' : 'fist', lt < 1.6 ? 'determined' : 'grin', { t: lt }); }],
        [1.35, x => { rr(x, -2000 + lt * 80, -900, 120, 2000, 0); ink(x, '#4A2A18', 6); }]]);
      L.word(ctx, 'BACK TO THE KETTLE', 1300, 160, pop(t, at('p4', 'kettle') - 0.1), { size: 74, col: CREAM });
    } },
  { name: 'drop the wine, keep the leaf, add kola nut', t0: tIng, era: 'gaslight', out: { type: 'cut' }, draw(ctx, t, lt) {
      const kD = at('p4', 'dropped') - tIng, kL = at('p4', 'coca') - tIng, kK = at('p4', 'kola') - tIng, MY = 165 - 138 * 1.6;
      const c = EN.cam([[0, -120, fy(1.32), 1.32], [4, 0, fy(1.4), 1.4]], lt);
      EN.layers(ctx, c, [
        [0.55, x => { L.bricks(x, -2200, -1200, 4400, 1500, '#9A5B44'); P.shelves(x, 700, -620, 700, 420, { rows: 3, seed: 17 }); }],
        [1, x => { L.planks(x, -2400, 300, 4800, 900, '#6B4A30', { pw: 44 }); rr(x, -40, 160, 580, 190, 14); ink(x, '#3A3438', 7); L.glow(x, 250, 270, 260, '#FF9A40', 0.4); P.kettle(x, 250, 165, 1.6, lt);
            const tu = clamp((lt - kD) / 0.9); const throwing = lt > kD - 0.3 && lt < kD + 0.2;
            toon(x, -430, 330, 1.25, PEM_APRON, throwing ? { la: [0.2, 0.1], ra: [2.9, -0.4] } : lt > kK ? 'point' : 'hold', lt > kD + 0.2 ? 'grin' : 'determined', { t: lt, itemR: lt < kD ? g => K.wineBottle(g, 0, 70, 0.32) : null });
            if (tu > 0 && tu < 1) { x.save(); x.translate(-420 - tu * 900, -300 - Math.sin(tu * Math.PI) * 260 + tu * 300); x.rotate(tu * 9); K.wineBottle(x, 0, 120, 0.42); x.restore(); }
            const lu = clamp((lt - kL + 0.3) / 0.9); if (lu > 0 && lu < 1) K.leaf(x, 250 + Math.sin(lu * 9) * 90 * (1 - lu), -620 + lu * (MY + 620), 0.7, Math.sin(lu * 9) * 0.8);
            const nu = clamp((lt - kK + 0.25) / 0.45); if (nu > 0 && nu < 1) K.kolaNut(x, 290, -700 + E.in(nu) * (MY + 700), 0.8, nu * 4);
            for (const k0 of [kL + 0.6, kK + 0.2]) { const su = clamp((lt - k0) / 0.6); if (su > 0 && su < 1) for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.35; x.beginPath(); x.arc(250 + Math.cos(a) * 200 * su, MY + Math.sin(a) * 220 * su + su * su * 200, 14 * (1 - su) + 3, 0, 6.27); ink(x, '#5A2E18', 3); } } }]]);
      const ws = pop(t, at('p4', 'wine')); if (t < at('p4', 'kept')) { L.plate(ctx, 'WINE', 420, 180, ws, { size: 56, bg: '#B8B2A8' }); if (ws >= 1) { ctx.save(); ctx.translate(420, 180); ctx.rotate(-0.12); rr(ctx, -120, -9, 240, 18, 6); ink(ctx, RED, 3); ctx.restore(); } }
      L.plate(ctx, '✓ COCA LEAF', 420, 180, pop(t, at('p4', 'coca')), { size: 56, bg: '#B7D7A9' });
      L.plate(ctx, '+ KOLA NUT', 420, 300, pop(t, at('p4', 'kola')), { size: 56, bg: '#E3B77D', rot: 0.03 });
    } },
  { name: 'a LOT of sugar: avalanche', t0: tSug, era: 'gaslight', out: { type: 'cut' }, draw(ctx, t, lt) {
      const pile = clamp((lt - 0.2) / 1.2), hits = [0.45, 0.6, 0.75, 0.9, 1.05, 1.2];
      const c = shakeCam(EN.cam([[0, -100, fy(1.35), 1.35], [1.8, -60, fy(1.15), 1.15]], lt), lt, hits, 10);
      EN.layers(ctx, c, [
        [0.55, x => { L.bricks(x, -2200, -1200, 4400, 1500, '#9A5B44'); P.shelves(x, -1500, -560, 700, 420, { rows: 3, seed: 13 }); }],
        [1, x => { L.planks(x, -2400, 300, 4800, 900, '#6B4A30', { pw: 44 }); rr(x, 300, 160, 500, 190, 14); ink(x, '#3A3438', 7); P.kettle(x, 550, 165, 1.4, lt);
            toon(x, -260, 330, 1.25, PEM_APRON, 'shock', lt > 1.0 ? 'laugh' : 'shock', { t: lt });
            const ph = 30 + pile * 205; x.beginPath(); x.moveTo(-1000, 340); x.quadraticCurveTo(-640, 340 - ph * 0.5, -300, 340 - ph); x.quadraticCurveTo(80, 340 - ph * 0.8, 360, 340); x.closePath(); ink(x, '#FBF7EE', 6);
            x.save(); x.globalAlpha = 0.25; for (let i = 0; i < 40; i++) { x.beginPath(); x.arc(-900 + hash(i) * 1200, 340 - hash(i * 3) * ph * 0.7, 4, 0, 6.27); x.fillStyle = '#C9C0AE'; x.fill(); } x.restore();
            for (let i = 0; i < 7; i++) { const t0 = 0.05 + i * 0.16, u = clamp((lt - t0) / 0.35); if (u <= 0) continue; const sx = (i % 2 ? -880 : 120) + hash(i * 4.1) * 260, sy = lerp(-900, 340 - ph * (0.35 + hash(i) * 0.2) - 30, E.in(u)); K.sugarSack(x, sx, sy, 0.8, (hash(i * 2) - 0.5) * 0.8 + (u < 1 ? u * 2 : 0)); if (u >= 1) P.puff(x, sx, sy - 40, clamp((lt - t0 - 0.35) / 0.5), 1.5, '#FFFFFF'); }
            x.save(); x.globalAlpha = 0.9; rr(x, -640, -900, 60 + Math.sin(lt * 20) * 6, 1100, 30); ink(x, '#FBF7EE', 0); x.restore(); }]]);
      L.word(ctx, 'A LOT OF SUGAR', 1360, 170, pop(t, at('p4', 'sugar') - 0.05), { size: 90, col: '#FFFFFF' });
    } },
  { name: 'the result: syrup', t0: tSyr, era: 'gaslight', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const kS = at('p4', 'syrup') - tSyr, fill = clamp((lt - 0.2) / 1.3);
      const c = EN.cam([[0, 160, fy(1.55), 1.55], [2.2, 60, fy(1.38), 1.38]], lt);
      EN.layers(ctx, c, [
        [0.55, x => { L.bricks(x, -2200, -1200, 4400, 1500, '#9A5B44'); L.glow(x, 0, -200, 700, '#FFC870', 0.3); P.shelves(x, -1300, -520, 600, 420, { rows: 3, seed: 19 }); }],
        [1, x => { L.planks(x, -2400, 300, 4800, 900, '#6B4A30', { pw: 44 }); rr(x, 220, 160, 520, 190, 14); ink(x, '#3A3438', 7); P.kettle(x, 420, 165, 1.5, lt);
            const sx = 420 - 108 * 1.5, sy = 165 - 80 * 1.5; rr(x, sx - 60, sy - 12, 70, 24, 8); ink(x, '#C9A44A', 4);
            x.beginPath(); x.moveTo(sx - 50, sy); x.bezierCurveTo(sx - 70 + Math.sin(lt * 6) * 5, sy + 60, 160, 100, 160, 150); x.lineWidth = 22; x.strokeStyle = INK; x.stroke(); x.lineWidth = 14; x.strokeStyle = '#3B1F12'; x.stroke();
            P.jug(x, 160, 335, 1.05); x.save(); x.beginPath(); x.arc(160 - 6, 335 - 70, 30 + fill * 4, 0, 6.27); x.fillStyle = 'rgba(59,31,18,0.0)'; x.fill(); x.restore();
            for (let i = 0; i < 3; i++) { const ph = (lt * 0.9 + i / 3) % 1; x.beginPath(); x.ellipse(120 + i * 30, 190 + ph * 60, 7, 10 + ph * 8, 0, 0, 6.28); x.fillStyle = '#3B1F12'; x.fill(); }
            toon(x, -340, 330, 1.25, PEM_APRON, lt > kS ? 'cheer' : 'present', lt > kS ? 'laugh' : 'happy', { t: lt });
            for (let i = 0; i < 9; i++) { x.beginPath(); x.arc(-400 + hash(i) * 120, 330 - 1.25 * 290 - hash(i * 2) * 20, 6, 0, 6.27); ink(x, '#FFFFFF', 2); } }]]);
      L.word(ctx, 'SYRUP', 1450, 250, pop(t, at('p4', 'syrup')), { size: 140, col: '#C77A3A' });
    } },
  // p5 ---------------------------------------------------------------------------------------------------
  { name: 'calendar: May 8, 1886', t0: tMay, era: 'gaslight', out: { type: 'cut' }, draw(ctx, t, lt) {
      const k8 = at('p5', '8th') - tMay, flips = clamp(lt / (k8 + 0.1));
      const c = EN.cam([[0, 0, -80, 1.0], [2.6, -80, -150, 1.3]], lt);
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY'];
      EN.layers(ctx, c, [
        [0.6, x => { L.wallpaper(x, -2000, -1200, 4000, 1500, '#6E3A2C', '#84483A'); P.shelves(x, 520, -640, 900, 560, { rows: 4, seed: 23 }); K.gasLamp(x, -820, -640, lt); P.clock(x, -1200, -340, 70, lt, { rim: '#6B4123' }); }],
        [1, x => { L.planks(x, -2400, 300, 4800, 900, '#5A3A24', { pw: 44 }); rr(x, -1000, 140, 1500, 40, 8); ink(x, '#7A4A2A', 6); L.planks(x, -1000, 180, 1500, 400, '#6B4123', { vertical: true, pw: 70 });
            P.jug(x, 220, 140, 1.0); fitText(x, 'SYRUP', 216, 70, 30, CREAM, 120); K.mortar(x, -600, 140, 0.6, 0);
            const mi = Math.min(4, Math.floor(flips * 5)); P.calendar(x, -80, -230, 1.6, '1886', months[mi], mi < 4 ? String(1 + Math.floor(hash(Math.floor(lt * 12)) * 28)) : '8');
            for (let i = 0; i < 6; i++) { const ph = clamp((lt - i * k8 / 6) / 0.6); if (ph > 0 && ph < 1) { x.save(); x.translate(-80 + ph * 500 + i * 30, -300 + ph * ph * 500); x.rotate(ph * 3 + i); x.globalAlpha = 1 - ph; rr(x, -120, -80, 240, 160, 8); ink(x, CREAM, 4); x.restore(); } } }]]);
      L.dateCard(ctx, 'MAY 8, 1886', 1420, 220, pop(t, at('p5', '1886') - 0.1), { size: 96 });
    } },
  { name: 'down the street to Jacobs\' Pharmacy', t0: tWalk, era: 'sepia', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const kP = at('p5', 'Pharmacy') - tWalk, dur = tMix - tWalk, px = -800 + E.out(clamp(lt / (kP + 0.3))) * 1450;
      const c = EN.cam([[0, -560, fy(1.12), 1.12], [kP + 0.3, 420, fy(1.16), 1.16], [dur, 470, fy(1.22), 1.22]], lt);
      EN.layers(ctx, c, [
        [0.25, x => { L.skyGrad(x, -2400, -1400, 4800, 1800, SEPIA_SKY); L.cloud(x, -300 + lt * 12, -480, 1.3, '#FBF1DC'); L.cloud(x, 900 + lt * 8, -560, 1.0, '#FBF1DC'); }],
        [0.45, x => K.skyline(x, lt, { col: '#C9A07A' })],
        [0.75, x => { road(x, 120, 400); K.horseBuggy(x, 1900 - lt * 420, 300, 0.85, lt, { flip: true, horse: '#5A3A22' }); P.crowd(x, -1200, -500, 150, 0.4, 3, lt, { hats: ['bowler', 'boater', null], seed: 9 }); }],
        [1, x => { sidewalk(x, 300);
            K.streetRow(x, -1830, 330, [{ sign: 'POST OFFICE', col: '#8A6A5A', h: 900, w: 440 }, { sign: 'HARDWARE', col: '#B86B4B', awning: [YELLOW, CREAM], h: 880, w: 440 }, { sign: 'BARBER', col: '#C98E5A', awning: [RED, CREAM], w: 420, h: 860 }, { sign: 'BAKERY', col: '#A9693E', awning: ['#2F8A6A', CREAM], h: 900, w: 440 },
              { sign: 'JACOBS\' PHARMACY', col: '#9A5B44', w: 760, h: 980, signCol: '#1F3A2C', awning: [RED, CREAM], display: (g, dx, dy, dw, dh) => { K.showGlobe(g, dx + 80, dy + dh - 10, 0.55, '#D93A35', lt); K.showGlobe(g, dx + 230, dy + dh - 10, 0.55, '#2F8A6A', lt + 1); K.showGlobe(g, dx + 380, dy + dh - 10, 0.55, '#F7C548', lt + 2); } }]);
            const arrived = lt > kP + 0.3; if (arrived) P.sparkles(x, 50 + 380, 330 - 980 + 222, 380, lt, 8);
            K.dog(x, px - 330, 335, 0.85, lt, { sniff: true, walk: !arrived });
            toon(x, px, 335, 1.25, PEM, arrived ? 'present' : 'walk', arrived ? 'happy' : 'determined', { t: lt, itemR: g => P.jug(g, 0, 70, 0.55) }); }],
        [1.35, x => { P.lamppost(x, -500, 600, 1.5, false); P.lamppost(x, 1500, 600, 1.5, false); }]]);
    } },
  { name: 'mixed with carbonated water', t0: tMix, era: 'gaslight', out: { type: 'cut' }, draw(ctx, t, lt) {
      const kC = at('p5', 'carbonated') - tMix, pour = clamp((lt - 0.2) / 0.8), fz = clamp((lt - kC) / 0.8);
      const c = EN.cam([[0, 0, -60, 1.25], [kC, 0, -80, 1.32], [3, 0, -90, 1.36]], lt);
      EN.layers(ctx, c, [
        [0.5, x => { rr(x, -2000, -1300, 4000, 1600, 0); ink(x, '#3A2A2A', 0); rr(x, -900, -800, 1800, 600, 120); ink(x, '#8FB0B8', 8); x.save(); x.globalAlpha = 0.3; for (let i = 0; i < 6; i++) { poly(x, [[-700 + i * 260, -780], [-600 + i * 260, -780], [-760 + i * 260, -220], [-860 + i * 260, -220]]); x.fillStyle = '#FFF'; x.fill(); } x.restore();
            for (let i = 0; i < 12; i++) P.bottle(x, -820 + i * 150, -220, 0.55, { kind: 'straight', label: '', fill: 0.3 + hash(i) * 0.6 }); K.gasLamp(x, -1100, -700, lt); K.gasLamp(x, 1100, -700, lt + 3); P.shelves(x, -1900, -700, 800, 900, { rows: 4, seed: 33 }); P.shelves(x, 1100, -700, 800, 900, { rows: 4, seed: 34 }); }],
        [1, x => { rr(x, -1600, 60, 3200, 50, 10); ink(x, '#E8E1D2', 6); L.tiles(x, -1600, 110, 3200, 500, '#F1EBDD', '#DCD3C0', 40);
            rr(x, 150, -520, 40, 360, 10); ink(x, '#C9CDD2', 5); x.beginPath(); x.arc(170, -540, 34, 0, 6.27); ink(x, '#D8B04A', 5); rr(x, 60, -200, 140, 34, 10); ink(x, '#C9CDD2', 5); rr(x, 200, -420, 150, 44, 8); ink(x, CREAM, 4); fitText(x, 'SODA WATER', 275, -398, 20, INK, 136);
            x.save(); x.translate(170, -570); x.rotate(lt > kC - 0.1 ? 0.6 : 0); rr(x, -12, -110, 24, 110, 10); ink(x, '#2E2A28', 4); x.restore();
            if (fz > 0) { x.beginPath(); x.moveTo(75, -166); x.lineTo(75, 40 - 160 * fz); x.lineWidth = 12; x.strokeStyle = 'rgba(220,240,255,0.8)'; x.stroke(); }
            P.glassCup(x, 75, 60, 1.6, { fill: 0.25 + pour * 0.25 + fz * 0.35, fizz: fz > 0 ? lt * 3 : 0 });
            if (fz > 0) { for (let i = 0; i < 18; i++) { const ph = (lt * 1.5 + hash(i)) % 1; x.beginPath(); x.arc(75 + (hash(i * 3) - 0.5) * 220 * ph, -180 - ph * 320, 6 + hash(i) * 8, 0, 6.27); ink(x, 'rgba(255,248,235,0.85)', 3); } P.burst(x, 75, -200, 260, clamp((lt - kC) / 0.5), CREAM); }
            if (lt < kC + 0.2) { const jx = -480 + pour * 80, jy = -300; x.beginPath(); x.moveTo(-1300, 0); x.lineTo(jx - 40, jy + 40); x.lineWidth = 64; x.strokeStyle = INK; x.lineCap = 'round'; x.stroke(); x.lineWidth = 52; x.strokeStyle = '#F4F0E6'; x.stroke();
              x.save(); x.translate(jx, jy); x.rotate(0.9 * pour); P.jug(x, 0, 80, 0.9); x.restore(); x.beginPath(); x.arc(jx - 40, jy + 40, 34, 0, 6.27); ink(x, CLERK.skin, 5);
              if (pour > 0.4) { x.beginPath(); x.moveTo(jx + 100, jy - 40); x.quadraticCurveTo(60, -260, 70, -60); x.lineWidth = 12; x.strokeStyle = '#3B1F12'; x.stroke(); } } }]]);
      L.plate(ctx, 'SYRUP', 420, 840, pop(t, at('p5', 'mixed') - 0.1), { size: 60, bg: '#C77A3A', fg: CREAM });
      L.plate(ctx, '+ CARBONATED WATER', 1340, 840, pop(t, at('p5', 'carbonated')), { size: 60 });
    } },
  { name: 'Jacobs\' soda fountain', t0: tFount, era: 'gaslight', out: { type: 'cut' }, draw(ctx, t, lt) {
      const kS = at('p5', 'soda') - tFount;
      const c = EN.cam([[0, 0, -20, 1.3], [2.1, 0, -40, 1.04]], lt);
      EN.layers(ctx, c, [
        [0.55, x => { K.drugWall(x, lt, { seed: 31, signs: ['TOILET ARTICLES', 'PRESCRIPTIONS', 'PATENT MEDICINES', 'CIGARS'] }); rr(x, -700, -720, 1400, 560, 80); ink(x, '#5A3420', 8); rr(x, -660, -680, 1320, 500, 70); ink(x, '#9DBCC4', 5);
            for (let i = 0; i < 9; i++) P.bottle(x, -560 + i * 140, -200, 0.5, { kind: 'straight', label: '' });
            const su = pop(lt, kS - 0.05, 0.4); rr(x, -520, -860, 1040, 120, 14); ink(x, '#1F3A2C', 6); if (su > 0) { x.save(); x.translate(0, -800); x.scale(E.back(su), E.back(su)); fitText(x, 'SODA FOUNTAIN', 0, 0, 80, '#F2D27A', 980); x.restore(); } }],
        [1, x => { K.floorTiles(x, 300); toon(x, 0, 120, 1.05, CLERK, 'pour', 'happy', { t: lt, itemR: g => { g.rotate(-1.3); P.glassCup(g, 0, 30, 0.4, { fill: 0.8, fizz: lt }); } });
            P.fountain(x, 0, 300, 1.0, { w: 2000, taps: 5 });
            P.crowd(x, -720, -320, 300, 0.95, 2, lt, { hats: ['bowler', null], seed: 2, pose: 'drink', expr: 'happy' }); toon(x, 520, 300, 0.95, LADY, 'drink', 'happy', { t: lt, flip: true, itemR: g => { g.rotate(2.6); P.glassCup(g, 0, 40, 0.4, { fill: 0.7 }); } }); }],
        [1.35, x => { K.showGlobe(x, -1350, 700, 1.3, '#D93A35', lt); K.showGlobe(x, 1350, 700, 1.3, '#2F8A6A', lt + 1); }]]);
    } },
  { name: 'five cents a glass: the first sip', t0: tFive, era: 'gaslight', out: { type: 'whip', dur: 0.3, dir: 1 }, draw(ctx, t, lt) {
      const k5 = 0.12, kSip = 0.95, cu = clamp((lt - k5) / 0.5);
      const c = EN.cam([[0, -40, fy(1.3), 1.3], [2.1, 20, fy(1.42), 1.42]], lt);
      EN.layers(ctx, c, [
        [0.55, x => { K.drugWall(x, lt, { seed: 41, lamps: false }); K.gasLamp(x, -500, -560, lt); }],
        [1, x => { K.floorTiles(x, 330); rr(x, -1700, 170, 1880, 40, 10); ink(x, '#E8E1D2', 6); L.tiles(x, -1700, 210, 1880, 400, '#F1EBDD', '#DCD3C0', 40); rr(x, -1700, 210, 1880, 400, 0); ink(x, null, 5);
            const sip = lt > kSip; toon(x, 380, 330, 1.3, GENT, sip ? 'drink' : 'point', !sip ? 'neutral' : lt < kSip + 0.5 ? 'shock' : 'laugh', { t: lt, flip: true, itemR: sip ? g => { g.rotate(2.7); P.glassCup(g, 0, 40, 0.42, { fill: 0.6, fizz: lt }); } : null });
            K.jar(x, -700, 172, 80, 110, '#E3C77D', 'STRAWS'); K.jar(x, -560, 172, 70, 90, '#B7D7C9', 'MINT'); P.glassCup(x, -1000, 172, 0.6, { fill: 0.1 }); P.glassCup(x, -900, 172, 0.6, { fill: 0.1 }); if (!sip) P.glassCup(x, -40, 172, 0.8, { fill: 0.85, fizz: lt });
            P.coin(x, -260, lerp(-200, 140, E.out(cu)), 36, lt * 14 * (1 - cu), '5¢'); P.burst(x, -260, 140, 120, clamp((lt - k5 - 0.5) / 0.4));
            if (lt > kSip + 0.5) { P.sparkles(x, 380, -110, 190, lt, 8); for (let i = 0; i < 6; i++) { const ph = (lt * 1.2 + i / 6) % 1; x.save(); x.globalAlpha = 1 - ph; x.beginPath(); x.arc(380 + Math.sin(i * 2 + ph * 4) * 90, -150 - ph * 200, 8, 0, 6.27); ink(x, 'rgba(255,248,235,0.9)', 3); x.restore(); } } }]]);
      L.plate(ctx, '5¢ A GLASS', 520, 200, pop(t, at('p5', 'Five')), { size: 96, bg: RED, fg: CREAM });
    } },
  // p6 ---------------------------------------------------------------------------------------------------
  { name: 'Frank Robinson, bookkeeper', t0: tRob, era: 'gaslight', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 240, fy(1.4), 1.4], [2.4, 80, fy(1.28), 1.28]], lt);
      EN.layers(ctx, c, [
        [0.55, x => { L.wallpaper(x, -2000, -1200, 4000, 1500, '#3E5A4A', '#4A6A58');
            rr(x, -1400, -600, 700, 600, 8); ink(x, '#6B4123', 6); for (let r = 0; r < 5; r++) for (let q = 0; q < 6; q++) { rr(x, -1380 + q * 113, -580 + r * 116, 100, 100, 4); ink(x, '#4A2A18', 3); if (hash(r * 6 + q) > 0.3) { rr(x, -1370 + q * 113, -530 + r * 116, 80, 48, 3); ink(x, CREAM, 3); } }
            windowFrame(x, 600, -520, 400, 400, (g, wx, wy, ww, wh) => { L.skyGrad(g, wx, wy, ww, wh, SEPIA_SKY); g.save(); g.translate(wx + ww / 2, wy + wh); g.scale(0.4, 0.4); K.skyline(g, lt); g.restore(); }); P.clock(x, -60, -460, 60, lt * 2, { rim: '#6B4123' }); }],
        [1, x => { L.planks(x, -2400, 300, 4800, 900, '#5A3A24', { pw: 44 });
            toon(x, 0, 290, 1.25, ROB, { la: [0.6, -1.0], ra: [0.9, -0.9] }, 'think', { t: lt, look: [0, 0.8] });
            rr(x, -640, 200, 1280, 40, 8); ink(x, '#6B4123', 6); rr(x, -610, 240, 1220, 200, 6); ink(x, '#5A3420', 6); for (let i = 0; i < 3; i++) { rr(x, -580 + i * 400, 265, 360, 150, 8); ink(x, '#6B4123', 4); }
            x.save(); x.translate(0, 200); poly(x, [[-330, 0], [0, 10], [330, 0], [290, -46], [0, -40], [-290, -46]]); ink(x, '#F4EEDC', 5); x.beginPath(); x.moveTo(0, 10); x.lineTo(0, -40); ink(x, null, 3); x.scale(1, 0.32);
            const n = Math.floor(lt * 4); for (let i = 0; i < Math.min(8, n); i++) { const side = i < 4 ? -1 : 1, row = i % 4; fitText(x, ['12.50', '3.75', '0.45', '9.10', '1.05', '22.00', '0.90', '4.40'][i], side * 150, -100 + row * 26, 20, INK, 200, { font: L.F.type }); } x.restore();
            rr(x, 420, 150, 60, 50, 8); ink(x, '#2E2A28', 4); x.save(); x.translate(Math.sin(lt * 9) * 40 + 100, 180); x.rotate(0.5); rr(x, -4, -90, 8, 90, 3); ink(x, '#E9E1CC', 3); x.restore(); }]]);
      L.plate(ctx, 'FRANK ROBINSON', 1440, 200, pop(t, at('p6', 'Frank')), { size: 70 });
      L.plate(ctx, 'BOOKKEEPER', 1440, 315, pop(t, at('p6', 'bookkeeper') + 0.3), { size: 46, bg: '#B7D7C9', rot: 0.03 });
    } },
  { name: 'COCA + KOLA = the name', t0: tName, era: 'gaslight', out: { type: 'cut' }, draw(ctx, t, lt) {
      const kN = at('p6', 'Coca-Cola') - tName, kT = at('p6', 'two') - tName, m = E.inOut(clamp((lt - kN + 0.4) / 0.5));
      const c = EN.cam([[0, -240, fy(1.3), 1.3], [kN, 0, fy(1.12), 1.12], [4.6, 0, fy(1.16), 1.16]], lt);
      EN.layers(ctx, c, [
        [0.55, x => { L.wallpaper(x, -2000, -1200, 4000, 1500, '#3E5A4A', '#4A6A58'); L.glow(x, -520, -320, 600, '#FFE38A', clamp(lt * 2) * 0.35); rr(x, 900, -560, 500, 600, 8); ink(x, '#6B4123', 6); for (let r = 0; r < 5; r++) for (let q = 0; q < 4; q++) { rr(x, 915 + q * 120, -545 + r * 116, 105, 100, 4); ink(x, '#4A2A18', 3); } }],
        [1, x => { L.planks(x, -2400, 300, 4800, 900, '#5A3A24', { pw: 44 });
            toon(x, -600, 330, 1.3, ROB, lt < kN ? 'think' : 'present', lt < 0.4 ? 'think' : lt < kN ? 'happy' : 'grin', { t: lt });
            K.bulb(x, -600, -150, 0.8, clamp((lt - 0.15) / 0.4));
            const card = (cx, label, draw) => { x.save(); x.translate(cx, -170); x.rotate(Math.sin(lt * 2 + cx) * 0.03); rr(x, -160, -160, 320, 320, 18); ink(x, CREAM, 6); draw(); fitText(x, label, 0, 110, 64, RED, 280); x.restore(); };
            const ax = lerp(-40, 150, m), bx = lerp(640, 470, m);
            card(ax, 'COCA', () => K.leaf(x, 0, -30, 0.85, 0.4)); card(bx, 'KOLA', () => K.kolaNut(x, 0, -30, 1.15, 0.2));
            if (lt > kT) { P.sparkles(x, ax, -170, 200, lt, 5); P.sparkles(x, bx, -170, 200, lt + 0.5, 5); } }]]);
      L.plate(ctx, 'COCA-COLA', 1180, 850, pop(t, at('p6', 'Coca-Cola') + 0.05, 0.4), { size: 120, bg: RED, fg: CREAM });
      L.word(ctx, '2 INGREDIENTS', 1640, 690, pop(t, at('p6', 'two')), { size: 52, col: YELLOW, rot: 0.06 });
    } },
  { name: 'the flowing pen (abstract flourishes, not the logo)', t0: tScript, era: 'gaslight', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const kT = at('p6', 'today') - tScript, u = clamp((lt - 0.2) / (kT - 0.4));
      const path = s => { const pts = []; for (let i = 0; i <= 260 * s; i++) { const a = i / 260; pts.push([-600 + a * 1200 + Math.sin(a * 40) * 55, 90 + Math.sin(a * 6.5) * 60 - Math.cos(a * 40) * 55]); } return pts; };
      const pts = path(u), tip = pts[pts.length - 1] || [-600, 90];
      const c = EN.cam([[0, -300, 0, 1.3], [kT - 0.2, 300, 0, 1.25], [kT + 1.5, 0, -40, 1.02]], lt);
      EN.layers(ctx, c, [
        [0.6, x => { L.planks(x, -2400, -1400, 4800, 2800, '#6B4123', { pw: 60 }); K.gasLamp(x, -900, -560, lt); }],
        [1, x => { x.save(); x.rotate(-0.03); rr(x, -760, -340, 1520, 700, 6); ink(x, '#F4EEDC', 6); for (let i = 0; i < 8; i++) { x.beginPath(); x.moveTo(-700, -200 + i * 70); x.lineTo(700, -200 + i * 70); x.lineWidth = 2; x.strokeStyle = '#C9D8E8'; x.stroke(); }
            fitText(x, 'COCA-COLA', 0, -240, 76, INK, 1000);
            x.beginPath(); pts.forEach(([px, py], i) => i ? x.lineTo(px, py) : x.moveTo(px, py)); x.lineWidth = 12; x.strokeStyle = '#7A1E1A'; x.lineCap = 'round'; x.lineJoin = 'round'; x.stroke();
            // pen + hand from the lower right
            x.save(); x.translate(tip[0], tip[1]); x.beginPath(); x.moveTo(120, 220); x.lineTo(900, 900); x.lineWidth = 120; x.strokeStyle = INK; x.lineCap = 'round'; x.stroke(); x.lineWidth = 106; x.strokeStyle = ROB.top; x.stroke();
            x.rotate(-0.75); poly(x, [[0, 0], [-11, 40], [11, 40]]); ink(x, '#C9A44A', 3); rr(x, -12, 38, 24, 250, 8); ink(x, '#2E2A28', 4); x.rotate(0.75); x.beginPath(); x.arc(90, 150, 56, 0, 6.27); ink(x, ROB.skin, 5); x.restore();
            rr(x, -700, 200, 110, 110, 14); ink(x, '#2E2A28', 5); x.restore(); }]]);
      L.word(ctx, 'STILL USED TODAY', 960, 930, pop(t, at('p6', 'still') - 0.05), { size: 84, col: YELLOW });
    } },
  // p7 ---------------------------------------------------------------------------------------------------
  { name: 'first year: about nine a day (tumbleweed)', t0: tNine, era: 'gaslight', out: { type: 'cut' }, draw(ctx, t, lt) {
      const kN = at('p7', 'nine') - tNine, n = Math.min(9, Math.floor(clamp((lt - kN + 1.2) / 1.2) * 9));
      const c = EN.cam([[0, -320, 40, 1.42], [4.4, 200, 30, 1.32]], lt);
      EN.layers(ctx, c, [
        [0.55, x => { K.drugWall(x, lt, { seed: 51, signs: ['SODA', 'PRESCRIPTIONS', 'EXTRACTS', 'CIGARS'] }); P.clock(x, -300, -560, 90, lt * 16, { rim: '#6B4123' }); }],
        [1, x => { K.floorTiles(x, 300); toon(x, -520, 140, 1.25, CLERK, { la: [0.5, -2.0], ra: [0.55, -2.35], lean: 0.08 }, 'sleepy', { t: lt });
            P.fountain(x, 0, 300, 1.0, { w: 2400, taps: 4, stools: false });
            K.register(x, 520, 42, 1.1, String(n), { label: 'DRINKS TODAY' });
            for (let i = 0; i < n; i++) P.glassCup(x, -1050 + i * 70, 44, 0.45, { fill: 0.1 });
            const fx = -200 + Math.sin(lt * 3) * 220, fy2 = -250 + Math.sin(lt * 6.3) * 80; x.beginPath(); x.arc(fx, fy2, 8, 0, 6.27); x.fillStyle = INK; x.fill(); ell(x, fx - 5, fy2 - 10, 8, 4, -0.5 + Math.sin(lt * 60)); ink(x, 'rgba(255,255,255,0.7)', 2);
            const tx = -1500 + lt * 560, ty = 260 - Math.abs(Math.sin(lt * 4)) * 70; x.save(); x.translate(tx, ty); x.rotate(lt * 6); x.strokeStyle = '#8A6A3A'; x.lineWidth = 6; for (let i = 0; i < 9; i++) { x.beginPath(); x.ellipse(0, 0, 70, 40 + i * 4, i * 0.7, 0, 6.28); x.stroke(); } x.restore(); }]]);
      L.plate(ctx, 'FIRST YEAR', 330, 170, pop(t, at('p7', 'first')), { size: 56, bg: CREAM });
      L.plate(ctx, '≈ 9 DRINKS A DAY', 1460, 170, pop(t, at('p7', 'nine')), { size: 70, bg: RED, fg: CREAM });
    } },
  { name: 'the scale: advertising vs what it earned', t0: tAds, era: 'gaslight', out: { type: 'cut' }, draw(ctx, t, lt) {
      const kA = at('p7', 'advertising') - tAds, kE = at('p7', 'earned') - tAds, tilt = 0.3 * E.back(clamp((lt - kA) / 0.5), 3) + 0.04 * Math.sin(lt * 2) * (lt < kA ? 1 : 0);
      const c = shakeCam(EN.cam([[0, -100, fy(1.3, -60), 1.3], [kA, 0, fy(1.0, -40), 1.0], [5, 0, fy(0.96, -40), 0.96]], lt), lt, [kA + 0.2], 18);
      EN.layers(ctx, c, [
        [0.5, x => { K.drugWall(x, lt, { seed: 61, lamps: false }); x.save(); x.globalAlpha = 0.45; x.fillStyle = '#1A1012'; x.fillRect(-2400, -1400, 4800, 2800); x.restore(); L.glow(x, 0, -200, 900, '#FFD58A', 0.35); }],
        [1, x => { K.floorTiles(x, 330); const nAds = Math.floor(clamp((lt - 0.2) / kA) * 7) + (lt > kA ? 3 : 0);
            K.balanceScale(x, -120, 330, 1.3, tilt, {
              left: g => { for (let i = 0; i < nAds; i++) { g.save(); g.translate(-110 + (i % 3) * 110, 190 - Math.floor(i / 3) * 70); g.rotate((hash(i) - 0.5) * 0.4); const kind = i % 3;
                  if (kind === 0) P.poster(g, 0, -40, 150, 110, { title: 'DRINK', sub: 'COCA-COLA', bg: CREAM }); else if (kind === 1) { rr(g, -80, -80, 160, 90, 4); ink(g, '#EDE6D6', 4); fitText(g, 'NEWS', 0, -64, 22, INK, 140); for (let r = 0; r < 3; r++) { g.beginPath(); g.moveTo(-60, -40 + r * 14); g.lineTo(60, -40 + r * 14); g.lineWidth = 3; g.strokeStyle = '#9A9488'; g.stroke(); } } else { rr(g, -80, -80, 160, 80, 6); ink(g, RED, 4); fitText(g, 'COCA-COLA', 0, -40, 26, CREAM, 140); }
                  g.restore(); } },
              right: g => { for (let i = 0; i < 3; i++) P.coin(g, -50 + i * 50, 190 - (lt > kA + 0.2 ? Math.max(0, Math.sin((lt - kA - 0.2) * 7) * 80 * Math.exp(-(lt - kA) * 2)) : 0), 26, i, '5¢'); } });
            toon(x, 780, 330, 1.2, PEM, lt > kE ? 'shrug' : 'think', lt > kE ? 'worried' : 'think', { t: lt });
            for (let i = 0; i < 3; i++) { const u = clamp((lt - 0.2 - i * 0.5) / 0.5); if (u > 0 && u < 1) { x.save(); x.translate(-640 + i * 30, lerp(-900, -330, E.in(u))); x.rotate(u * 3); P.poster(x, 0, 0, 150, 110, { title: 'DRINK', sub: 'COCA-COLA' }); x.restore(); } } }]]);
      L.plate(ctx, 'ADVERTISING', 420, 900, pop(t, at('p7', 'advertising')), { size: 64, bg: RED, fg: CREAM });
      L.plate(ctx, 'EARNED', 1180, 200, pop(t, at('p7', 'earned')), { size: 56, bg: '#B7D7A9', rot: 0.04 });
    } },
  // p8 ---------------------------------------------------------------------------------------------------
  { name: 'running out of time', t0: tTime, era: 'gaslight', out: { type: 'cut' }, finish: { vignette: 0.5 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -100, fy(1.15), 1.15], [2.3, 200, fy(1.4, -30), 1.4]], lt);
      EN.layers(ctx, c, [
        [0.55, x => { L.wallpaper(x, -2000, -1200, 4000, 1500, '#4A3040', '#583848'); x.save(); x.translate(-760, -200); rr(x, -110, -200, 220, 640, 20); ink(x, '#5A3420', 6); P.clock(x, 0, -80, 90, lt * 3, { rim: '#C9A44A' }); const sw = Math.sin(lt * 4) * 0.35; x.save(); x.translate(0, 40); x.rotate(sw); x.beginPath(); x.moveTo(0, 0); x.lineTo(0, 260); ink(x, null, 5); x.beginPath(); x.arc(0, 270, 32, 0, 6.27); ink(x, '#D8B04A', 5); x.restore(); x.restore();
            windowFrame(x, 520, -480, 360, 380, (g, wx, wy, ww, wh) => L.skyGrad(g, wx, wy, ww, wh, ['#2E2440', '#C86A4A'])); P.shelves(x, -260, -560, 560, 380, { rows: 2, seed: 81 }); }],
        [1, x => { L.planks(x, -2400, 300, 4800, 900, '#5A3A24', { pw: 44 }); toon(x, -150, 330, 1.28, PEM, { la: [0.5, -0.9], ra: [0.6, -2.3], lean: 0.05 }, 'sleepy', { t: lt });
            rr(x, -640, 160, 1280, 40, 8); ink(x, '#6B4123', 6); rr(x, -610, 200, 1220, 200, 6); ink(x, '#5A3420', 6);
            K.hourglass(x, 320, 162, 1.2, clamp(lt / 2.4)); rr(x, -520, 130, 220, 30, 4); ink(x, '#E9E1CC', 3); }]]);
    } },
  { name: 'sick and short on money', t0: tSick, era: 'gaslight', out: { type: 'cut' }, finish: { vignette: 0.5 }, draw(ctx, t, lt) {
      const kM = at('p8', 'money') - tSick;
      const c = EN.cam([[0, 0, fy(1.3), 1.3], [2, 120, fy(1.38), 1.38]], lt);
      EN.layers(ctx, c, [
        [0.55, x => { L.wallpaper(x, -2000, -1200, 4000, 1500, '#4A3040', '#583848'); K.gasLamp(x, 600, -620, lt, 0.9); P.shelves(x, -1300, -560, 700, 500, { rows: 3, seed: 71 }); }],
        [1, x => { L.planks(x, -2400, 300, 4800, 900, '#5A3A24', { pw: 44 }); K.chair(x, -100, 330, 1.2);
            toon(x, -100, 300, 1.1, PEM, 'sit', 'sad', { t: lt, look: [0.4, 0.4] });
            x.beginPath(); x.moveTo(-240, 262); x.bezierCurveTo(-180, 240, -20, 240, 40, 262); x.lineTo(50, 345); x.quadraticCurveTo(-95, 360, -250, 345); x.closePath(); ink(x, '#8A6A9A', 5); for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(-200 + i * 64, 256); x.lineTo(-205 + i * 64, 345); x.lineWidth = 4; x.strokeStyle = '#6A4A7A'; x.stroke(); }
            rr(x, 260, 120, 300, 30, 6); ink(x, '#6B4123', 5); rr(x, 395, 150, 30, 180, 5); ink(x, '#5A3420', 4); for (let i = 0; i < 3; i++) P.bottle(x, 290 + i * 50, 120, 0.32, { kind: 'straight', label: '', fill: 0.3 }); x.save(); x.translate(330, 100); x.rotate(0.3); rr(x, -40, -6, 80, 12, 6); ink(x, '#E8E1D2', 3); x.restore();
            const mu = clamp((lt - kM + 0.4) / 0.5); x.save(); x.translate(500, 118); x.rotate(0.2 * mu); x.beginPath(); x.moveTo(-50, 0); x.quadraticCurveTo(-60, -60, 0, -60); x.quadraticCurveTo(60, -60, 50, 0); x.closePath(); ink(x, '#9A3A3A', 4); rr(x, -26, -70, 52, 12, 5); ink(x, '#D8B04A', 3); fitText(x, '0', 0, -25, 30, CREAM, 40); x.restore();
            if (mu > 0) P.coin(x, 540 + mu * 40 + Math.max(0, lt - kM) * 120, 100 + Math.min(1, Math.max(0, lt - kM - 0.2) * 2) * 210, 18, lt * 8, '¢'); }]]);
      L.word(ctx, 'SICK', 380, 170, pop(t, at('p8', 'Sick')), { size: 80, col: CREAM });
      L.word(ctx, 'SHORT ON MONEY', 1440, 170, pop(t, at('p8', 'short')), { size: 72, col: YELLOW });
    } },
  { name: 'pieces of the business to different partners', t0: tSold, era: 'gaslight', out: { type: 'whip', dur: 0.35, dir: -1 }, finish: { vignette: 0.45 }, draw(ctx, t, lt) {
      const kP = at('p8', 'pieces') - tSold, kD = at('p8', 'different') - tSold, tu = clamp((lt - kP) / 0.3);
      const c = EN.cam([[0, -380, fy(1.4), 1.4], [kP, -300, fy(1.35), 1.35], [kD, 100, fy(1.15), 1.15], [3.6, 140, fy(1.12), 1.12]], lt);
      EN.layers(ctx, c, [
        [0.55, x => { L.wallpaper(x, -2000, -1200, 4000, 1500, '#4A3040', '#583848'); K.gasLamp(x, -200, -650, lt, 0.9); K.gasLamp(x, 900, -650, lt + 1, 0.9); P.shelves(x, -1500, -560, 700, 500, { rows: 3, seed: 91 }); }],
        [1, x => { L.planks(x, -2400, 300, 4800, 900, '#5A3A24', { pw: 44 });
            toon(x, -620, 330, 1.25, PEM, tu < 1 ? 'hold' : 'present', 'sad', { t: lt });
            if (tu <= 0) K.deed(x, -440, -60, 0.6, -0.05); else {
              const tg = [[160, -130], [520, -150], [880, -130], [-460, -30]];
              for (let q = 0; q < 4; q++) { const mu = q < 3 ? E.inOut(clamp((lt - kP - 0.2 - q * 0.25) / 0.7)) : 0; const sx = -440 + (q % 2 ? 60 : -60) * tu, sy = -60 + (q > 1 ? 70 : -70) * tu;
                K.deed(x, lerp(sx, tg[q][0], mu), lerp(sy, tg[q][1], mu), 0.5, (q - 1.5) * 0.25 * tu + mu * 0.3, { piece: q }); } P.burst(x, -440, -60, 220, clamp((lt - kP) / 0.4), CREAM); }
            const ps = [LOOKS.lawyerA, LOOKS.banker, LOOKS.lawyerB]; ps.forEach((lk, i) => { const got = lt > kP + 0.9 + i * 0.25; toon(x, 160 + i * 360, 330, 1.15, lk, got ? 'hold' : 'point', got ? ['smug', 'grin', 'happy'][i] : 'neutral', { t: lt + i, seed: i, flip: true }); }); }]]);
      L.word(ctx, 'PARTNERS', 1400, 960, pop(t, at('p8', 'partners')), { size: 70, col: CREAM });
    } },
  { name: '1888: the empty chair at sunset (respectful)', t0: t1888, era: 'gaslight', out: { type: 'cut' }, finish: { vignette: 0.5 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, fy(1.12), 1.12], [3.4, 0, fy(1.26, -20), 1.26]], lt);
      EN.layers(ctx, c, [
        [0.45, x => { L.wallpaper(x, -2000, -1200, 4000, 1500, '#5A3A3A', '#664444');
            windowFrame(x, -320, -560, 640, 560, (g, wx, wy, ww, wh) => { L.skyGrad(g, wx, wy, ww, wh, ['#3A2A50', '#F09A5A']); g.beginPath(); g.arc(wx + ww / 2, wy + wh * 0.8 + lt * 12, 90, 0, 6.27); ink(g, '#FFD07A', 0); g.save(); g.translate(wx + ww / 2, wy + wh + 40); g.scale(0.5, 0.5); K.skyline(g, lt, { col: '#5A3A4A' }); g.restore(); });
            L.glow(x, 0, -200, 900, '#FFB070', 0.35); P.shelves(x, -1500, -560, 700, 500, { rows: 3, seed: 5 }); P.shelves(x, 800, -560, 700, 500, { rows: 3, seed: 6 }); }],
        [1, x => { L.planks(x, -2400, 300, 4800, 900, '#5A3A24', { pw: 44 }); x.save(); x.globalAlpha = 0.25; poly(x, [[-320, 300], [320, 300], [700, 900], [-700, 900]]); x.fillStyle = '#FFC890'; x.fill(); x.restore();
            K.chair(x, 0, 330, 1.25); rr(x, -110, 160, 220, 40, 10); ink(x, '#8A6A9A', 4);
            // coat stand: his frock coat, apron and hat
            rr(x, 650, -260, 20, 590, 6); ink(x, '#5A3420', 5); rr(x, 600, 310, 120, 20, 6); ink(x, '#5A3420', 4);
            for (const sx of [-1, 1]) { x.beginPath(); x.moveTo(660, -230); x.quadraticCurveTo(660 + sx * 50, -250, 660 + sx * 70, -210); ink(x, null, 6); } x.beginPath(); x.moveTo(600, -215); x.quadraticCurveTo(630, -235, 650, -215); x.lineTo(660, 40); x.lineTo(590, 30); x.closePath(); ink(x, '#4A3A30', 5); rr(x, 690, -200, 70, 200, 10); ink(x, '#F4F0E6', 4);
            rr(x, -720, 120, 260, 30, 6); ink(x, '#6B4123', 5); rr(x, -605, 150, 30, 180, 5); ink(x, '#5A3420', 4); K.mortar(x, -640, 120, 0.6, 0); ell(x, -520, 112, 60, 9); ink(x, '#2E2A28', 4); x.beginPath(); x.moveTo(-558, 112); x.bezierCurveTo(-558, 60, -482, 60, -482, 112); x.closePath(); ink(x, '#2E2A28', 4); }]]);
      L.dateCard(ctx, '1888', 1600, 180, pop(t, at('p8', '1888')), { bg: '#E9DFC6' });
    } },
  { name: 'he never saw: the jug\'s shadow becomes the future', t0: tNever, era: 'gaslight', out: { type: 'cut' }, finish: { vignette: 0.55 }, draw(ctx, t, lt) {
      const kB = at('p8', 'become') - tNever, g = E.inOut(clamp((lt - 0.4) / (kB + 0.2)));
      const c = EN.cam([[0, -80, fy(1.45, -60), 1.45], [kB + 1, 40, fy(1.06, -120), 1.06]], lt);
      EN.layers(ctx, c, [
        [0.5, x => { L.wallpaper(x, -2000, -1200, 4000, 1500, '#3A2A3A', '#443244');
            windowFrame(x, -1050, -500, 400, 440, (gg, wx, wy, ww, wh) => { L.skyGrad(gg, wx, wy, ww, wh, ['#141428', '#2E2848']); for (let i = 0; i < 24; i++) { gg.beginPath(); gg.arc(wx + hash(i) * ww, wy + hash(i * 3) * wh * 0.7, 2 + (Math.sin(lt * 3 + i) + 1) * 1.5, 0, 6.27); gg.fillStyle = '#F6EBD3'; gg.fill(); } }); }],
        [1, x => { // the shadow on the wall behind the counter: the jug's shape stretches into a tall bottle silhouette
            x.save(); x.translate(280, 160);
            if (g < 0.6) { x.save(); x.globalAlpha = 0.5 * (1 - g / 0.6); x.scale(1.4, 1.4); x.beginPath(); x.moveTo(-50, 0); x.bezierCurveTo(-70, -60, -60, -120, -22, -130); x.lineTo(-18, -165); x.lineTo(18, -165); x.lineTo(22, -130); x.bezierCurveTo(60, -120, 70, -60, 50, 0); x.closePath(); x.fillStyle = '#140C12'; x.fill(); x.restore(); }
            if (g > 0.2) { const sc = lerp(1.2, 3.4, g); x.globalAlpha = 0.5 * clamp((g - 0.2) * 2.5); x.scale(sc * 0.9, sc); x.beginPath(); x.moveTo(-30, 0); x.bezierCurveTo(-36, -30, -24, -50, -27, -75); x.bezierCurveTo(-30, -100, -40, -120, -34, -140); x.bezierCurveTo(-26, -168, -12, -175, -11, -200); x.lineTo(-11, -224); x.lineTo(11, -224); x.lineTo(11, -200); x.bezierCurveTo(12, -175, 26, -168, 34, -140); x.bezierCurveTo(40, -120, 30, -100, 27, -75); x.bezierCurveTo(24, -50, 36, -30, 30, 0); x.closePath(); x.fillStyle = '#140C12'; x.fill(); }
            x.restore();
            L.planks(x, -2400, 300, 4800, 900, '#4A3020', { pw: 44 }); K.counter(x, -1500, 160, 3000, {}); P.jug(x, -60, 162, 1.1); fitText(x, 'SYRUP', -66, 80, 30, CREAM, 120);
            rr(x, -500, 70, 40, 92, 6); ink(x, '#F4F0E6', 4); const fl = Math.sin(lt * 11) * 4; x.beginPath(); x.moveTo(-480, 70); x.quadraticCurveTo(-500 + fl, 30, -480, 0); x.quadraticCurveTo(-460 + fl, 30, -480, 70); ink(x, '#FFD25A', 3); L.glow(x, -480, 30, 460, '#FFC870', 0.45); }]]);
    } },
];

EN.run({ module, dir: __dirname, TL, scenes, card: { n: 'CHAPTER 1', title: 'The Pharmacist', sub: 'Atlanta, 1886', era: 'gaslight' },
  cues: () => [
    ['ding', 0.9, 0.5], ['steps', 3.3, 0.35], ['pop', at('p1', 'pharmacist'), 0.6], ['pop', at('p1', 'Georgia'), 0.5],
    ['tear', tWar - 0.2, 0.6], ['wind', tWar, 0.5], ['whoosh', at('p1', 'saber') - 0.3, 0.8], ['thump', at('p1', 'saber') - 0.15, 0.7],
    ['whoosh', tMor - 0.15, 0.4], ['tick', tMor + 0.4, 0.3], ['tick', tMor + 1.4, 0.3], ['puff', at('p1', 'fighting') - 0.5, 0.4],
    ['whoosh', tShop - 0.15, 0.5], ['ding', tShop + 0.4, 0.5], ['stamp', at('p2', '1880s'), 0.5],
    ['fizz', tLab + 0.2, 0.6], ['puff', at('p2', 'tonics'), 0.6], ['paper', at('p2', 'cures') - 0.05, 0.8], ['pop', at('p2', 'cures'), 0.5],
    ['kaching', tBest + 0.5, 0.45], ['pop', at('p2', 'best'), 0.6], ['whoosh', at('p2', 'wine', 1) - 0.2, 0.5], ['pop', at('p2', 'coca', 1), 0.5], ['sparkle', at('p2', 'leaf') + 0.2, 0.5],
    ['stamp', at('p3', '1886'), 0.5], ['slam', at('p3', 'dry') - 0.1, 1.0], ['crowdboo', at('p3', 'dry') + 0.15, 0.4],
    ['whoosh', tOver - 0.1, 0.5], ['tick', tOver + 0.3, 0.3], ['tick', tOver + 0.5, 0.3], ['gasp', tOver + 0.2, 0.6], ['boing', at('p3', 'problem'), 0.5],
    ['steps', tKet + 0.1, 0.5], ['fizz', tKet + 1.0, 0.3], ['pop', at('p4', 'kettle'), 0.4],
    ['whoosh', at('p4', 'dropped'), 0.5], ['clink', at('p4', 'dropped') + 0.85, 0.8], ['flutter', at('p4', 'coca') - 0.2, 0.6], ['splash', at('p4', 'coca') + 0.3, 0.5], ['splash', at('p4', 'kola') + 0.2, 0.6],
    ['thump', tSug + 0.45, 0.5], ['thump', tSug + 0.7, 0.5], ['thump', tSug + 0.9, 0.5], ['thump', tSug + 1.05, 0.5], ['rumble', tSug + 0.3, 0.6], ['boing', tSug + 1.3, 0.4],
    ['splash', tSyr + 0.3, 0.4], ['pop', at('p4', 'syrup'), 0.7],
    ['flip', tMay + 0.2, 0.5], ['flip', tMay + 0.6, 0.5], ['flip', tMay + 1.0, 0.5], ['stamp', at('p5', '1886'), 0.6],
    ['whoosh', tWalk - 0.15, 0.5], ['steps', tWalk + 0.3, 0.5], ['steps', tWalk + 1.6, 0.5], ['ding', at('p5', 'Pharmacy') + 0.2, 0.6],
    ['clink', tMix + 0.6, 0.4], ['fizz', at('p5', 'carbonated'), 1.0], ['murmur', tFount, 0.4], ['pop', at('p5', 'soda'), 0.5],
    ['coins', tFive + 0.4, 0.4], ['kaching', at('p5', 'Five') + 0.2, 0.6], ['gasp', tFive + 1.0, 0.4],
    ['scratch', tRob + 0.3, 0.5], ['pop', at('p6', 'Frank'), 0.5], ['ding', tName + 0.2, 0.6], ['whoosh', at('p6', 'Coca-Cola') - 0.3, 0.4], ['pop', at('p6', 'Coca-Cola') + 0.05, 0.7], ['sparkle', at('p6', 'two'), 0.5],
    ['scratch', tScript + 0.3, 0.5], ['scratch', tScript + 1.6, 0.5], ['pop', at('p6', 'still'), 0.5],
    ['wind', tNine + 0.2, 0.5], ['tick', at('p7', 'nine') - 0.8, 0.4], ['tick', at('p7', 'nine') - 0.5, 0.4], ['tick', at('p7', 'nine') - 0.2, 0.4], ['ding', at('p7', 'nine') + 0.1, 0.5],
    ['paper', tAds + 0.3, 0.6], ['paper', tAds + 0.8, 0.6], ['slam', at('p7', 'advertising') + 0.15, 0.7], ['coins', at('p7', 'advertising') + 0.3, 0.5], ['slidedown', at('p7', 'earned'), 0.4],
    ['tick', tTime + 0.3, 0.35], ['tick', tTime + 0.8, 0.35], ['tick', tTime + 1.3, 0.35], ['tick', tTime + 1.8, 0.35],
    ['tick', at('p8', 'money') + 0.3, 0.3], ['tear', at('p8', 'pieces'), 0.8], ['paper', at('p8', 'different'), 0.5],
    ['wind', t1888 + 0.3, 0.35]],
  music: [[0, 'gaslight'], [tWar, 'dark'], [tShop, 'ragtime'], [tDry, 'tension'], [tKet, 'ragtime'], [tMay, 'gaslight'], [tAds, 'ragminor'], [tTime, 'sad']] });
