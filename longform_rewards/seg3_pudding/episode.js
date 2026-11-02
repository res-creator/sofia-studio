process.env.HIR_WIDE = '1';
// Long-form "When Paying People Backfired" (How It's Run, YouTube 16:9) — segment 3, CHAPTER 3 · USA, 1999 · The Pudding Guy.
// Script rows 14–17: flip it around; Healthy Choice paid airline miles for barcodes (500 miles per 10 barcodes, doubled if mailed early);
// engineer David Phillips found the cheapest barcode: 25-cent chocolate pudding; 12,000+ cups, Salvation Army volunteers peeled the barcodes,
// the pudding went to people in need; ~$3,000 -> over a million miles; a tax write-off; Hollywood borrowed the plan (Adam Sandler film);
// he didn't cheat — the company paid for barcodes. Look: howitsrun_style (full-body profile people, flat sets, paper plates), NOT pudding_ep18.
// David Phillips = generic man with glasses, no likeness. Brands as plain text only.
// Usage: node episode.js cues | srt out.srt | still t1,t2,... out.png | frame t out.png [nosubs] | video out.mp4 | shots
const { createCanvas } = require('@napi-rs/canvas');
const { spawn } = require('child_process');
const fs = require('fs');
const K = require('../../tests/mcd_collage/kit');
const EN = require('../../mcd_ep1/engine');            // voice timings + subtitle drawing only (read-only use)
const R = require('../../hirkit/rig');
const CL = require('../../hirkit/collage');
const { makeEdit } = require('../../hirkit/edit');
const ST = require('../../howitsrun_style/style');
const P = require('../../howitsrun_style/people');
const SE = require('../../howitsrun_style/sets');
const X = require('./p3kit');
const RK = require('../../rats_ep26/ratkit');
const HK = require('../../hoover_ep19/hoovkit');
const PK = X.PK;
const { C, F, clamp, lerp, seg, E, rr, hash } = K;
const { W, H, FPS, PAL, layer, cam, shake, pop, blink, label, txt, fitTxt } = ST;
const { DAVID, EXEC, VOLS, SHOPPER } = X;
const INK = R.INK;

// ---------- voice timeline: chapter card 0–3 s, first line at 3.0 s, 0.7 s between lines, end = last voice + 0.6 s ----------
const LINES = JSON.parse(fs.readFileSync(`${__dirname}/script.json`));
const SP = JSON.parse(fs.readFileSync(`${__dirname}/vo/speech.json`));
const GAP = 0.7, CARD = 3.0;
const STt = {}; let T = CARD; for (const L of LINES) { STt[L.id] = +(T - SP[L.id][0]).toFixed(3); T += SP[L.id][1] - SP[L.id][0] + GAP; }
const V = EN.voice(`${__dirname}/vo`, STt), at = (id, w, n = 0) => V.at(id, w, n), end = id => STt[id] + SP[id][1];
const LAST = LINES[LINES.length - 1].id;
T = +(end(LAST) + 0.6).toFixed(3);
const Z = STt;

// ---------- helpers ----------
const FACE = (n, look = [1, 0], t = 0, o = 0) => R.expr(n, { look, blink: blink(t, 3.2, o) });
const world = (ctx, keys, lt, fn) => layer(ctx, cam(keys, lt), 1, fn);
function paperBg(ctx, col = 'rgba(201,135,74,0.10)') { ST.bg(ctx, PAL.paper); ctx.fillStyle = col; for (let i = 0; i < 20; i++) ctx.fillRect(0, i * 60 + 20, W, 3); }
function bigPlate(ctx, s, x, y, u, size = 110, col = C.red, fg = PAL.cream, sh = 0) { if (u <= 0) return; ctx.save(); ctx.translate(x + sh, y); ctx.scale(u, u); ctx.rotate(-0.02); ctx.font = `${size}px ${F.black}`; const w = ctx.measureText(s).width + 80;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -size * 0.8, w, size * 1.45, 20), col, { elev: 2 }); txt(ctx, s, 0, size * 0.36, size, fg); ctx.restore(); }
const cupItem = (s = 0.5, o = {}) => g => { g.save(); g.translate(10, 30); X.cup(g, s, o); g.restore(); };
function store(ctx, t, o = {}) { SE.room(ctx, t, { wall: '#EFE9DC', floor: 'tile' }); ctx.fillStyle = 'rgba(255,255,255,0.5)'; for (let i = -6; i < 7; i++) ctx.fillRect(i * 420 - 80, -1500, 160, 26); }

// ---------- overlays ----------
function overlays(ctx, t) { ST.stampLabel(ctx); }

// ================= SHOTS =================
const SH = []; const shot = (id, t0, t1, draw, out) => SH.push({ id, t0, t1, draw, out });
// CARD (0–3 s): CHAPTER 3 · The Pudding Guy · USA · 1999
shot('CARD', 0, Z.s01 - 0.1, (ctx, t) => {
  X.chapterCard(ctx, t, 'CHAPTER 3', 'The Pudding Guy', 'USA · 1999', g => { g.translate(0, 120); X.cup(g, 1.9); }, g => { g.rotate(-0.05); PK.barcode(g, 300, 150); });
  ST.grade(ctx, 'day', 0.12);
});

// ---- s01 "Now flip it around. What if the person on the other side reads the rules better than the company?"
const tFlip = at('s01', 'flip'), tWhat = at('s01', 'what'), tOther = at('s01', 'other'), tReads = at('s01', 'reads'), tBetter = at('s01', 'better');
// P1: the two-sided sign flips: the company's side -> the customer's side
shot('P1 flip', Z.s01 - 0.1, tWhat - 0.12, (ctx, t, lt) => {
  paperBg(ctx);
  ctx.save(); ctx.translate(W / 2, 470); const z = 1 + lt * 0.02; ctx.scale(z, z);
  X.flipSign(ctx, seg(t, tFlip - 0.05, tFlip + 0.45), { col: PAL.cream, top: 'CHAPTER 2', big: 'THE COMPANY', sub: 'GOT IT WRONG' }, { col: C.yellow, top: 'NOW', big: 'THE CUSTOMER', sub: 'GETS IT RIGHT' }); ctx.restore();
  ST.grade(ctx, 'day', 0.12);
});
// P2: the company man and the customer on either side of the rules board; the customer reads them closely
shot('P2 rules', tWhat - 0.12, Z.s02 - 0.12, (ctx, t, lt) => {
  world(ctx, [[0, 0, -470, 0.9], [3.5, 0, -480, 0.96]], lt, w => {
    store(w, t);
    w.save(); w.translate(0, -620); CL.cutout(w, () => rr(w, -230, -300, 460, 600, 10), '#FFFDF6', { elev: 1.4 }); fitTxt(w, 'THE RULES', 0, -220, 54, INK, 400, 'center', ST.FONT.type);
    w.fillStyle = 'rgba(0,0,0,0.2)'; for (let i = 0; i < 9; i++) w.fillRect(-180, -150 + i * 45, 360 - hash(i) * 120, 12); w.restore();
    R.tube(w, [[-150, 0], [-120, -330]], 14, '#8A5A34', 4); R.tube(w, [[150, 0], [120, -330]], 14, '#8A5A34', 4);
    P.person(w, -620, 0, 1.05, 1, EXEC, { face: FACE(t > tBetter ? 'worried' : 'smug', [1, -0.2], t), armN: { hand: [130, -300], grip: 'open' } }, { tie: C.red });
    P.person(w, 560, 0, 1.05, -1, DAVID, { face: FACE(t > tBetter ? 'smug' : 'thinking', [1, -0.4], t), lean: 0.05, armN: { hand: [170, -420], grip: 'hold', item: g => { g.save(); g.rotate(-0.3); RK.magnifier(g, 0.7); g.restore(); } } });
  });
  label(ctx, 'THE COMPANY', 420, 200, pop(t, tWhat), { size: 48 });
  label(ctx, 'THE OTHER SIDE', 1500, 200, pop(t, tOther - 0.05), { size: 48, col: C.yellow });
  label(ctx, 'READS THE RULES BETTER', 1460, 860, pop(t, tBetter - 0.05), { size: 50, col: C.red, fg: PAL.cream, rot: 0.03 });
  ST.grade(ctx, 'office', 0.18);
});

// ---- s02 "In 1999, Healthy Choice offered airline miles for barcodes from its products: five hundred miles for ten barcodes, doubled if you
//          mailed them early. Engineer David Phillips looked for the cheapest barcode in the store. Chocolate pudding. Twenty-five cents a cup."
const t1999 = at('s02', '1999'), tHealthy = at('s02', 'healthy'), tMiles = at('s02', 'miles'), tBarcodes = at('s02', 'barcodes'), tFive = at('s02', 'five'), tTen = at('s02', 'ten'), tDoubled = at('s02', 'doubled'),
  tEarly = at('s02', 'early'), tEng = at('s02', 'engineer'), tDavid = at('s02', 'david'), tCheapest = at('s02', 'cheapest'), tStore = at('s02', 'store'), tChoc = at('s02', 'chocolate'), tPud = at('s02', 'pudding'), t25 = at('s02', 'twenty');
// P3: a grocery store front, USA 1999
shot('P3 store 1999', Z.s02 - 0.12, tHealthy - 0.12, (ctx, t, lt) => {
  world(ctx, [[0, 100, -470, 0.86], [2, 140, -470, 0.9]], lt, w => { SE.sky(w, t, { clouds: 3 }); SE.ground(w, 'road'); SE.houses(w, -2700, 3);
    SE.shopFront(w, 300, 1300, 'GROCERY', { awn: PAL.blue, signCol: PAL.navy });
    P.person(w, -400, 0, 0.95, 1, SHOPPER, { ...R.walk(t * 6), face: FACE('smile', [1, 0], t), armN: { hand: [110, -200], grip: 'hold', item: g => { g.save(); g.translate(0, 40); rr(g, -60, -100, 120, 110, 10); R.fillStroke(g, '#C9A06A', 4); g.restore(); } } }); });
  const u = pop(t, t1999 - 0.08, 0.35); if (u > 0) { ctx.save(); ctx.translate(380, 420); ctx.rotate(-0.04); ctx.scale(u, u); ST.calCard(ctx, 'USA', '1999', { w: 420, h: 380 }); ctx.restore(); }
  ST.grade(ctx, 'day', 0.18);
});
// P4: the flyer: HEALTHY CHOICE — mail in barcodes, get airline miles
shot('P4 flyer', tHealthy - 0.12, tFive - 0.12, (ctx, t, lt) => {
  paperBg(ctx);
  const u0 = E.back(seg(t, tHealthy - 0.1, tHealthy + 0.25), 1.8), z = 1 + lt * 0.015; ctx.save(); ctx.translate(560, 500); ctx.scale(0.92 * z * u0, 0.92 * z * u0); ctx.rotate(-0.03); X.flyer(ctx); ctx.restore();
  label(ctx, 'AIRLINE MILES', 1380, 280, pop(t, tMiles - 0.05), { size: 70, col: C.yellow });
  label(ctx, 'FOR BARCODES', 1380, 470, pop(t, tBarcodes - 0.05), { size: 70, col: C.red, fg: PAL.cream, rot: 0.03 });
  const ub = pop(t, tBarcodes + 0.1, 0.35); if (ub > 0) { ctx.save(); ctx.translate(1380, 700); ctx.rotate(-0.04); ctx.scale(ub, ub); PK.barcode(ctx, 440, 190); ctx.restore(); }
  ST.grade(ctx, 'day', 0.12);
});
// P5: the deal: 500 MILES for 10 BARCODES, x2 if mailed early
shot('P5 deal', tFive - 0.12, tEng - 0.12, (ctx, t, lt) => {
  paperBg(ctx, 'rgba(77,141,255,0.10)');
  bigPlate(ctx, '500 MILES', 1420, 260, pop(t, tFive - 0.05), 96, PAL.navy, PAL.cream);
  for (let i = 0; i < 10; i++) { const u = pop(t, tTen - 0.25 + i * 0.06, 0.3); if (u <= 0) continue; ctx.save(); ctx.translate(180 + (i % 5) * 190, 230 + Math.floor(i / 5) * 160); ctx.rotate((hash(i) - 0.5) * 0.12); ctx.scale(u, u); PK.barcode(ctx, 170, 110, { seed: i + 3 }); ctx.restore(); }
  label(ctx, '10 BARCODES', 560, 560, pop(t, tTen + 0.25), { size: 64, col: C.yellow });
  ctx.save(); ctx.translate(1420, 520); ST.stampWord(ctx, '× 2', 120, seg(t, tDoubled - 0.05, tDoubled + 0.3), C.red, -0.1); ctx.restore();
  const ue = pop(t, tEarly - 0.1, 0.35); if (ue > 0) { ctx.save(); ctx.translate(1000, 780); ctx.scale(ue, ue); label(ctx, 'IF MAILED EARLY', 0, 0, 1, { size: 56 }); ctx.restore();
    ctx.save(); ctx.translate(lerp(560, 640, seg(t, tEarly, tEarly + 1)), 780); ctx.scale(ue * 1.2, ue * 1.2); HK.envelope(ctx, 1, 2); ctx.restore(); }
  ST.grade(ctx, 'day', 0.12);
});
// P6: engineer David Phillips in the aisle, looking for the cheapest barcode
shot('P6 aisle', tEng - 0.12, tChoc - 0.12, (ctx, t, lt) => {
  world(ctx, [[0, 100, -520, 0.84], [4.5, 240, -520, 0.88]], lt, w => { store(w, t);
    w.save(); w.translate(400, 0); X.aisle(w, 1500, { tags: [[-420, 2, '$$$', seg(t, tCheapest - 0.2, tCheapest + 0.1), C.red], [80, 2, '$$', seg(t, tCheapest + 0.15, tCheapest + 0.45), C.yellow], [520, 1, '$', seg(t, tStore - 0.1, tStore + 0.2), '#7CE0A0']] }); w.restore();
    const u = seg(t, tEng - 0.1, tEng + 1.6);
    P.person(w, lerp(-1100, -700, E.out(u)), 0, 1.05, 1, DAVID, u < 1 ? { ...R.walk(t * 6), face: FACE('thinking', [1, -0.2], t) } : { face: FACE('thinking', [1, -0.4], t), armN: { hand: [100, -470], grip: 'relax' }, headTilt: 0.05 }); });
  label(ctx, 'ENGINEER DAVID PHILLIPS', 520, 190, pop(t, tDavid - 0.05), { size: 50 });
  label(ctx, 'THE CHEAPEST BARCODE?', 1380, 190, pop(t, tCheapest - 0.05), { size: 52, col: C.yellow });
  ST.grade(ctx, 'office', 0.18);
});
// P7: chocolate pudding, 25¢ a cup
shot('P7 pudding 25c', tChoc - 0.12, Z.s03 - 0.12, (ctx, t, lt) => {
  world(ctx, [[0, 200, -520, 1.0], [3.4, 230, -520, 1.06]], lt, w => { store(w, t);
    w.save(); w.translate(560, 0); X.aisle(w, 1000, { cups: [1, -600, 600], tags: [[0, 1, '25¢', seg(t, t25 - 0.1, t25 + 0.2), C.yellow]] }); w.restore();
    P.person(w, -380, 0, 1.08, 1, DAVID, { face: FACE(t > t25 ? 'grin' : 'surprised', [1, -0.1], t), armN: { hand: [150, -400], grip: 'hold', item: cupItem(0.55) }, lean: 0.03 }); });
  label(ctx, 'CHOCOLATE PUDDING', 520, 190, pop(t, tPud - 0.1), { size: 56, col: '#7A4A2E', fg: PAL.cream });
  bigPlate(ctx, '25¢ A CUP', 1480, 230, pop(t, t25 - 0.05), 92, C.yellow, K.C.ink);
  ST.grade(ctx, 'office', 0.18);
});

// ---- s03 "He bought over twelve thousand cups, had Salvation Army volunteers peel the barcodes, and gave the pudding to people in need. About three
//          thousand dollars turned into over a million miles. The donation even got him a tax write-off, and Hollywood later borrowed his pudding
//          plan for an Adam Sandler movie."
const tTwelve = at('s03', 'twelve'), tHad = at('s03', 'had'), tSalv = at('s03', 'salvation'), tVol = at('s03', 'volunteers'), tPeel = at('s03', 'peel'), tAnd3 = at('s03', 'and'), tGave = at('s03', 'gave'), tNeed = at('s03', 'need'),
  tAbout = at('s03', 'about'), tThree = at('s03', 'three'), tTurned = at('s03', 'turned'), tMillion = at('s03', 'million'), tThe3 = at('s03', 'the', 2), tTax = at('s03', 'tax'), tWrite = at('s03', 'write-off'),
  tAnd3b = at('s03', 'and', 1), tHolly = at('s03', 'hollywood'), tPlan = at('s03', 'plan'), tAdam = at('s03', 'adam'), tMovie = at('s03', 'movie');
// P8: the checkout: David with a cart full of cups and a hand truck of cases
shot('P8 12000', Z.s03 - 0.12, tHad - 0.12, (ctx, t, lt) => {
  world(ctx, [[0, 100, -470, 0.82], [2.2, 160, -470, 0.86]], lt, w => { store(w, t);
    w.save(); w.translate(860, 0); rr(w, -260, -300, 520, 300, 8); R.fillStroke(w, '#5A606B', 5); rr(w, -280, -320, 560, 30, 8); R.fillStroke(w, '#8E959E', 5); fitTxt(w, 'CHECKOUT', 0, -360, 50, INK, 400); w.restore();
    for (let i = 0; i < 4; i++) { w.save(); w.translate(-1150 + i * 40, 0); PK.handTruck(w, 3 + (i % 2), 0.85); w.restore(); }
    P.person(w, -250, 0, 1.05, 1, DAVID, { face: FACE('grin', [1, 0], t), armN: { hand: [150, -330], grip: 'fist' }, armF: { hand: [130, -335], grip: 'fist' }, lean: 0.08 });
    w.save(); w.translate(220, 0); X.cart(w, 0.9, { load: 1 }); w.save(); w.translate(40, -440); X.cupPile(w, 3, 0.62); w.restore(); w.restore(); });
  bigPlate(ctx, '12,000+ CUPS', 960, 230, pop(t, tTwelve - 0.05), 96, C.red, PAL.cream);
  ST.grade(ctx, 'office', 0.18);
});
// P9: the volunteers' table: barcodes peeled off, into the mail sack
shot('P9 volunteers', tHad - 0.12, tAnd3 - 0.12, (ctx, t, lt) => {
  world(ctx, [[0, 0, -470, 0.84], [3.6, 60, -480, 0.9]], lt, w => { SE.room(w, t, { wall: '#E8E2D0', floor: 'wood' });
    w.save(); w.translate(-1050, 0); X.cupPile(w, 4, 0.75); w.restore();
    VOLS.forEach((L, i) => { const x = -450 + i * 420, ph = t * 3 + i; P.person(w, x, 0, 0.98, 1, L, { face: FACE(i === 1 ? 'smile' : 'happy', [1, 0.4], t, i), armN: { hand: [150 + Math.sin(ph) * 20, -300], grip: 'pinch', item: g => { g.save(); g.translate(14, -10); PK.barcode(g, 46, 30, { digits: false, seed: i }); g.restore(); } }, armF: { hand: [120, -290], grip: 'hold', item: cupItem(0.42, { peeled: true }) } }); });
    w.save(); w.translate(0, -300); PK.table(w, 1500); for (let i = 0; i < 6; i++) { w.save(); w.translate(-560 + i * 200, -20); X.cup(w, 0.55, { peeled: t > tPeel + i * 0.2 }); w.restore(); } w.restore();
    w.save(); w.translate(900, 0); PK.sack(w, 1.1, 0.6 + 0.4 * seg(t, tPeel, tAnd3)); w.restore();
    for (let i = 0; i < 10; i++) { const tt = tPeel + i * 0.25, u = seg(t, tt, tt + 0.6); if (u <= 0 || u >= 1) continue; w.save(); w.translate(lerp(-300 + (i % 3) * 400, 880, u), lerp(-420, -360, u) - Math.sin(u * Math.PI) * 300); w.rotate(u * 6); PK.barcode(w, 70, 46, { digits: false, seed: i }); w.restore(); } });
  label(ctx, 'SALVATION ARMY VOLUNTEERS', 620, 180, pop(t, tSalv - 0.05), { size: 50 });
  label(ctx, 'PEEL THE BARCODES', 1420, 180, pop(t, tPeel - 0.05), { size: 52, col: C.yellow, rot: 0.03 });
  ST.grade(ctx, 'office', 0.18);
});
// P10: the pudding goes to people in need: the donation van
shot('P10 donation', tAnd3 - 0.12, tAbout - 0.12, (ctx, t, lt) => {
  world(ctx, [[0, 0, -420, 0.84], [2.6, 60, -420, 0.88]], lt, w => { SE.sky(w, t, { clouds: 3 }); SE.ground(w, 'road'); SE.houses(w, -2600, 9);
    const u = seg(t, tNeed + 0.2, tAbout); w.save(); w.translate(lerp(150, 700, E.in(u)), 0); w.scale(1.2, 1.2); PK.van(w, 'DONATION'); w.restore();
    P.person(w, -650, 0, 1.0, 1, VOLS[0], { face: FACE('happy', [1, 0], t), armN: { hand: [110, -240], grip: 'hold', item: g => { g.save(); g.translate(0, 60); PK.caseBox(g, 0.7); g.restore(); } }, armF: { hand: [90, -240], grip: 'hold' } }); });
  label(ctx, 'THE PUDDING → PEOPLE IN NEED', W / 2, 180, pop(t, tGave - 0.05), { size: 56, col: C.yellow });
  ST.grade(ctx, 'day', 0.18);
});
// P11: about $3,000 turned into over a million miles
shot('P11 miles', tAbout - 0.12, tThe3 - 0.12, (ctx, t, lt) => {
  ST.bg(ctx, '#DCE6EE'); ctx.fillStyle = 'rgba(46,58,89,0.06)'; for (let i = 0; i < 12; i++) ctx.fillRect(i * 170, 0, 6, H);
  const u1 = pop(t, tThree - 0.1, 0.35); if (u1 > 0) { ctx.save(); ctx.translate(480, 300); ctx.scale(0.8 * u1, 0.8 * u1); ctx.rotate(-0.03); PK.check(ctx, '≈ $3,000'); ctx.restore(); }
  const u2 = pop(t, tTurned - 0.1, 0.35); if (u2 > 0) { ctx.save(); ctx.translate(960, 300); ctx.scale(u2, u2); ctx.fillStyle = C.red; ctx.beginPath(); ctx.moveTo(-60, -30); ctx.lineTo(20, -30); ctx.lineTo(20, -70); ctx.lineTo(90, 0); ctx.lineTo(20, 70); ctx.lineTo(20, 30); ctx.lineTo(-60, 30); ctx.closePath(); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = K.C.ink; ctx.stroke(); ctx.restore(); }
  const v = Math.round(lerp(0, 1253000, E.out(seg(t, tTurned, tMillion + 0.3)))); const u3 = pop(t, tTurned - 0.05, 0.35);
  if (u3 > 0) { ctx.save(); ctx.translate(1440, 320); ctx.scale(0.9 * u3, 0.9 * u3); PK.milesCounter(ctx, v); ctx.restore(); }
  label(ctx, 'OVER A MILLION MILES', 1440, 620, pop(t, tMillion - 0.05), { size: 64, col: C.yellow });
  for (let i = 0; i < 12; i++) { const tt = tTurned + i * 0.2, u = seg(t, tt, tt + 2.0); if (u <= 0 || u >= 1) continue; ctx.save(); ctx.translate(lerp(-200, W + 200, u), 760 - Math.sin(u * 3) * 20 + (i % 3) * 30); ctx.rotate(-0.04); PK.plane(ctx, 0.22, [PAL.blue, C.red, '#2FA37E'][i % 3]); ctx.restore(); }
  ST.grade(ctx, 'day', 0.12);
});
// P12: the donation got him a tax write-off
shot('P12 tax', tThe3 - 0.12, tAnd3b - 0.12, (ctx, t, lt) => {
  world(ctx, [[0, -260, -470, 0.92], [2.6, -240, -470, 0.96]], lt, w => { SE.room(w, t, { wall: '#EFE3CB', floor: 'wood', window: -1200 });
    P.person(w, -560, 0, 1.08, 1, DAVID, { face: FACE(t > tTax ? 'smug' : 'smile', [1, -0.2], t), armN: { hand: [150, -360], grip: 'pinch', item: g => { g.save(); g.translate(20, -10); g.rotate(0.1); rr(g, -50, -70, 100, 130, 4); R.fillStroke(g, '#FBF6EA', 3); g.restore(); } } }); });
  ctx.save(); ctx.translate(1240, 480); ctx.scale(0.88, 0.88); X.taxForm(ctx, seg(t, tWrite - 0.05, tWrite + 0.3)); ctx.restore();
  label(ctx, 'THE DONATION', 520, 190, pop(t, tThe3), { size: 52, col: C.yellow });
  ST.grade(ctx, 'office', 0.18);
});
// P13: Hollywood borrowed the pudding plan: the cinema marquee
shot('P13 movie', tAnd3b - 0.12, Z.s04 - 0.12, (ctx, t, lt) => {
  world(ctx, [[0, 100, -560, 0.86], [3.8, 160, -560, 0.92]], lt, w => {
    const g = w.createLinearGradient(0, -2000, 0, 0); g.addColorStop(0, '#2E3A59'); g.addColorStop(1, '#6A6A9A'); w.fillStyle = g; w.fillRect(-4000, -2400, 8000, 2400); SE.ground(w, 'road');
    rr(w, -300, -1200, 1300, 1200, 8); R.fillStroke(w, '#8A3A3A', 5); rr(w, 150, -420, 400, 420, 8); R.fillStroke(w, '#3A2418', 5);
    w.save(); w.translate(350, -820); w.scale(1.05, 1.05); PK.marquee(w, t, [['NOW SHOWING', 48, '#4A4A48'], ['PUNCH-DRUNK LOVE', 72, C.red], ['ADAM SANDLER · 2002', 50]]); w.restore();
    P.person(w, -700, 0, 1.05, 1, DAVID, { face: FACE(t > tPlan ? 'grin' : 'surprised', [0.8, -0.8], t), headTilt: -0.08, armN: { hand: [150, -440], grip: 'point' } }); });
  label(ctx, 'HOLLYWOOD', 400, 190, pop(t, tHolly - 0.05), { size: 60, col: C.yellow });
  label(ctx, 'BORROWED HIS PUDDING PLAN', 560, 860, pop(t, tPlan - 0.05), { size: 50 });
  ST.grade(ctx, 'evening', 0.2);
});

// ---- s04 "He didn't cheat. He did exactly what the rules paid for. The company wanted people to buy its food. It paid for barcodes.
//          And a barcode is just a barcode. Phillips later put it simply: "Companies still make mistakes like this all the time.""
const tCheat = at('s04', 'cheat'), tExactly = at('s04', 'exactly'), tRules = at('s04', 'rules'), tPaid1 = at('s04', 'paid'), tThe4 = at('s04', 'the', 1), tWanted = at('s04', 'wanted'), tFood = at('s04', 'food'),
  tIt4 = at('s04', 'paid', 1) - 0.17, tBar4 = at('s04', 'barcodes'), tAnd4 = at('s04', 'and'), tJust = at('s04', 'just'), tPhil = at('s04', 'phillips'), tComp = at('s04', 'companies');
// P14: he didn't cheat: the flyer rules, ticked one by one
shot('P14 no cheat', Z.s04 - 0.12, tThe4 - 0.12, (ctx, t, lt) => {
  world(ctx, [[0, -300, -470, 0.92], [3.8, -280, -470, 0.96]], lt, w => { SE.room(w, t, { wall: '#EFE3CB', floor: 'wood' });
    P.person(w, -620, 0, 1.08, 1, DAVID, { face: FACE(t > tExactly ? 'smug' : 'neutral', [-0.3, -0.1], t), armN: { hand: [60, -250], grip: 'relax' }, headTilt: 0.04 }); });
  ctx.save(); ctx.translate(1180, 480); ctx.scale(0.86, 0.86); ctx.rotate(0.02); X.flyer(ctx, { ticks: [[0, seg(t, tExactly - 0.05, tExactly + 0.25)], [0, seg(t, tRules - 0.05, tRules + 0.25)], [0, seg(t, tPaid1 - 0.05, tPaid1 + 0.25)]] }); ctx.restore();
  ctx.save(); ctx.translate(560, 220); ST.stampWord(ctx, 'NOT CHEATING', 76, seg(t, tCheat - 0.05, tCheat + 0.25), '#1F8A5A', -0.08); ctx.restore();
  label(ctx, 'EXACTLY WHAT THE RULES PAID FOR', 1180, 880, pop(t, tPaid1 - 0.05), { size: 44, col: C.yellow });
  ST.grade(ctx, 'office', 0.18);
});
// P15: the company wanted customers — it paid for barcodes
shot('P15 wanted/paid', tThe4 - 0.12, tAnd4 - 0.12, (ctx, t, lt) => {
  world(ctx, [[0, -300, -470, 0.92], [4, -280, -470, 0.95]], lt, w => { store(w, t); w.save(); w.translate(600, 0); X.aisle(w, 1800, { cups: [1, -300, 300] }); w.restore();
    P.person(w, -640, 0, 1.08, 1, EXEC, { face: FACE(t > tBar4 ? 'worried' : 'smile', [1, -0.2], t), armN: { hand: [150, -380], grip: 'point' } }, { tie: C.red }); });
  ctx.save(); ctx.translate(1200, 420); X.wantedPaid(ctx, 'CUSTOMERS', 'BARCODES', seg(t, tWanted - 0.05, tWanted + 0.3), seg(t, tBar4 - 0.05, tBar4 + 0.3)); ctx.restore();
  label(ctx, 'TO BUY ITS FOOD', 1200, 720, pop(t, tFood - 0.1), { size: 46 });
  ST.grade(ctx, 'office', 0.18);
});
// P16: a barcode is just a barcode (peeled off the cup; the pudding is gone)
shot('P16 just barcode', tAnd4 - 0.12, tPhil - 0.12, (ctx, t, lt) => {
  paperBg(ctx);
  const u = E.out(seg(t, tAnd4, tJust)), z = 1 + lt * 0.02;
  ctx.save(); ctx.translate(560, 640); ctx.scale(1.6, 1.6); X.cup(ctx, 1, { peeled: true }); ctx.restore();
  ctx.save(); ctx.translate(lerp(640, 1280, u), lerp(560, 430, u)); ctx.rotate(lerp(0, -0.06, u)); ctx.scale(lerp(0.4, 2.0, u) * z, lerp(0.4, 2.0, u) * z); PK.barcode(ctx, 280, 150); ctx.restore();
  label(ctx, 'A BARCODE IS JUST A BARCODE', W / 2, 180, pop(t, tJust - 0.1), { size: 64, col: C.yellow });
  ST.grade(ctx, 'day', 0.12);
});
// P17: Phillips later put it simply — the quote (hold to the segment end)
shot('P17 quote', tPhil - 0.12, T + 0.01, (ctx, t, lt) => {
  world(ctx, [[0, -500, -470, 0.92], [5, -480, -470, 0.95]], lt, w => { SE.sky(w, t, { clouds: 3 }); SE.ground(w, 'road'); SE.houses(w, -2600, 4);
    P.person(w, -820, 0, 1.08, 1, DAVID, { face: FACE(t > tComp + 1 ? 'smile' : 'neutral', [-0.4, -0.1], t), armN: { hand: [150, -340], grip: 'open' }, headTilt: 0.03 }); });
  ctx.save(); ctx.translate(1180, 470); X.quoteCard(ctx, ['Companies still make', 'mistakes like this', 'all the time.'], '— DAVID PHILLIPS', seg(t, tComp - 0.1, tComp + 0.3)); ctx.restore();
  label(ctx, 'PHILLIPS, LATER:', 1000, 170, pop(t, tPhil - 0.05), { size: 46 });
  ST.grade(ctx, 'day', 0.18);
});

// ---------- edit, overlays, subtitles ----------
SH.sort((a, b) => a.t0 - b.t0);
const ED = makeEdit(SH, W, H);
const SPLIT = { s01: [4, 8, 7], s02: [7, 5, 6, 6, 5, 6, 2, 4], s03: [6, 7, 8, 10, 8, 7, 5], s04: [3, 8, 8, 4, 7, 5, 4, 5] };
const REPL = [[/twelve thousand/, '12,000'], [/three thousand dollars/, '$3,000'], [/five hundred miles/, '500 miles'], [/ten barcodes/, '10 barcodes'], [/Twenty-five cents/, '25 cents']];
function subs() {
  const G = [];
  Object.keys(Z).forEach(id => { const ws = V.words(id); let k0 = 0; SPLIT[id].forEach(n => { G.push({ id, words: ws.slice(k0, k0 + n) }); k0 += n; }); if (k0 !== ws.length) throw new Error(`subtitle split ${id}: ${k0} vs ${ws.length}`); });
  G.forEach((g, i) => { const nx = G[i + 1], e0 = Math.min(g.words[g.words.length - 1].t1, end(g.id)) + 0.4; g.t0 = g.words[0].t0 - 0.05;
    g.t1 = nx ? (nx.id === g.id ? nx.words[0].t0 - 0.05 : Math.min(e0, nx.words[0].t0 - 0.05)) : Math.min(e0, T);
    let s = g.words.map(x => x.w).join(' '); for (const [a, b] of REPL) s = s.replace(a, b); g.text = s; });
  return G;
}
const SUBS = subs();
const HL = ['flip', 'better', '1999', 'miles', 'barcodes', '500', '10', 'doubled', 'cheapest', 'pudding', '25', '12000', 'peel', '3000', 'million', 'write-off', 'hollywood', 'cheat', 'barcode'];
function frame(ctx, t, o = {}) {
  ED.frame(ctx, t);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); overlays(ctx, t); ctx.restore();
  ST.paper(ctx);
  if (!o.nosubs) EN.drawSubtitles(ctx, t, SUBS, { ...ST.SUBS, highlight: HL });
}

// ---------- sound cues (for mix.py) + music moods for the lead ----------
function cues() {
  const c = [['pop', 0.0, 1.4], ['whoosh', 0.02, 0.6], ['pop', 0.2, 0.6], ['stamp', 0.5, 0.9]];
  c.push(['cut', Z.s01 - 0.1, 0.35], ['flip', tFlip - 0.1, 0.8], ['whoosh', tFlip, 0.4], ['cut', tWhat - 0.12, 0.35], ['pop', tWhat, 0.4], ['pop', tOther - 0.05, 0.4], ['sparkle', tBetter, 0.4], ['pop', tBetter - 0.05, 0.4]);
  c.push(['cut', Z.s02 - 0.12, 0.35], ['steps', Z.s02, 0.3], ['pop', t1999 - 0.08, 0.6], ['cut', tHealthy - 0.12, 0.35], ['paper', tHealthy, 0.6], ['pop', tMiles - 0.05, 0.4], ['pop', tBarcodes - 0.05, 0.4], ['scan', tBarcodes + 0.1, 0.5]);
  c.push(['cut', tFive - 0.12, 0.35], ['pop', tFive - 0.05, 0.5]); for (let i = 0; i < 10; i++) c.push(['tick', tTen - 0.25 + i * 0.06, 0.4]); c.push(['stamp', tDoubled + 0.1, 0.8], ['pop', tEarly - 0.1, 0.4], ['whoosh', tEarly, 0.3]);
  c.push(['cut', tEng - 0.12, 0.35], ['steps', tEng, 0.4], ['pop', tDavid - 0.05, 0.4], ['pop', tCheapest - 0.05, 0.4], ['tag', tCheapest, 0.4], ['tag', tCheapest + 0.3, 0.4], ['tag', tStore, 0.4]);
  c.push(['cut', tChoc - 0.12, 0.35], ['pop', tPud - 0.1, 0.4], ['kaching', t25, 0.6], ['tag', t25 - 0.05, 0.5]);
  c.push(['cut', Z.s03 - 0.12, 0.35], ['coins', Z.s03 + 0.1, 0.4], ['stamp', tTwelve + 0.1, 0.8], ['cut', tHad - 0.12, 0.35], ['pop', tSalv - 0.05, 0.4], ['pop', tPeel - 0.05, 0.4]); for (let i = 0; i < 10; i++) c.push(['tear', tPeel + i * 0.25, 0.15]);
  c.push(['cut', tAnd3 - 0.12, 0.35], ['pop', tGave - 0.05, 0.4], ['rev', tNeed + 0.1, 0.4]);
  c.push(['cut', tAbout - 0.12, 0.35], ['tag', tThree - 0.1, 0.5], ['whoosh', tTurned - 0.1, 0.4]); for (let i = 0; i < 8; i++) c.push(['tick', tTurned + i * (tMillion + 0.3 - tTurned) / 8, 0.4]); c.push(['kaching', tMillion + 0.25, 0.7], ['pop', tMillion - 0.05, 0.4]);
  c.push(['cut', tThe3 - 0.12, 0.35], ['paper', tThe3, 0.4], ['stamp', tWrite + 0.1, 0.8], ['cut', tAnd3b - 0.12, 0.35], ['pop', tHolly - 0.05, 0.5], ['sparkle', tHolly + 0.2, 0.4], ['pop', tPlan - 0.05, 0.4]);
  c.push(['cut', Z.s04 - 0.12, 0.35], ['stamp', tCheat + 0.1, 0.8], ['pop', tExactly, 0.4], ['pop', tRules, 0.4], ['pop', tPaid1, 0.4], ['ding', tPaid1 + 0.2, 0.3]);
  c.push(['cut', tThe4 - 0.12, 0.35], ['pop', tWanted - 0.05, 0.5], ['pop', tFood - 0.1, 0.4], ['stamp', tBar4 + 0.1, 0.7]);
  c.push(['cut', tAnd4 - 0.12, 0.35], ['tear', tAnd4 + 0.1, 0.4], ['whoosh', tAnd4 + 0.2, 0.3], ['pop', tJust - 0.1, 0.5], ['cut', tPhil - 0.12, 0.35], ['pop', tPhil - 0.05, 0.4], ['type', tComp - 0.1, 0.6], ['pop', tComp - 0.05, 0.5]);
  return c;
}
const MUSIC = { sections: [[0, 'light'], [Z.s01 - 0.1, 'calm'], [tHealthy - 0.12, 'up'], [Z.s04 - 0.12, 'calm']] };
// ---------- CLI ----------
const [mode, a1, a2, a3] = process.argv.slice(2);
if (mode === 'cues') { fs.writeFileSync(`${__dirname}/cues.json`, JSON.stringify({ T, vo: Object.entries(Z), sfx: cues(), music: MUSIC })); console.log('cues ok, T =', T); }
else if (mode === 'srt') {
  const f = s => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  fs.writeFileSync(a1, SUBS.map((g, i) => `${i + 1}\n${f(g.t0)} --> ${f(g.t1)}\n${g.text}\n`).join('\n')); console.log('srt ok', SUBS.length);
}
else if (mode === 'still') {
  const ts = a1.split(',').map(Number), tw = 480, th = 270, cols = Math.min(ts.length, 4), rows = Math.ceil(ts.length / cols);
  const sheet = createCanvas(tw * cols, th * rows), sc = sheet.getContext('2d'), cv = createCanvas(W, H), ctx = cv.getContext('2d');
  ts.forEach((t, i) => { frame(ctx, t); sc.drawImage(cv, (i % cols) * tw, Math.floor(i / cols) * th, tw, th); sc.fillStyle = '#E63946'; sc.font = '20px sans-serif'; sc.fillText(t.toFixed(2), (i % cols) * tw + 6, Math.floor(i / cols) * th + 22); });
  fs.writeFileSync(a2, sheet.toBuffer('image/png'));
} else if (mode === 'frame') { const cv = createCanvas(W, H), ctx = cv.getContext('2d'); frame(ctx, +a1, { nosubs: a3 === 'nosubs' }); fs.writeFileSync(a2, cv.toBuffer('image/png')); }
else if (mode === 'shots') console.log(SH.map(s => `${s.id}\t${s.t0.toFixed(2)}–${s.t1.toFixed(2)}\t${(s.t1 - s.t0).toFixed(2)}s`).join('\n') + `\nT = ${T}`);
else if (mode === 'video') (async () => {
  const cv = createCanvas(W, H), ctx = cv.getContext('2d');
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(FPS), a1], { stdio: ['pipe', 'inherit', 'inherit'] });
  const N = Math.round(T * FPS), T0 = Date.now();
  for (let f = 0; f < N; f++) { frame(ctx, f / FPS); const buf = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); if (f % 300 === 0) process.stderr.write(`${f}/${N} ${((Date.now() - T0) / 1000).toFixed(0)}s\n`); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
})();
module.exports = { T, ST: Z, SH };
