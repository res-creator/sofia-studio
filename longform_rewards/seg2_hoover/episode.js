process.env.HIR_WIDE = '1';
// Long-form "When Paying People Backfired" (How It's Run, YouTube 16:9) — segment 2, CHAPTER 2 · BRITAIN, 1992 · The Free Flights.
// Script rows 9–13: Hoover's offer (spend £100, get two free return flights; then New York and Orlando), the £119 vacuum vs the tickets,
// ~200,000 claims by March 1993, the twist (people were buying flights, not vacuums), the fallout (agents swamped, a customer in Iowa,
// "grossly miscalculated", charter planes, three bosses removed, ~$60M charges, Hoover Europe sold, court cases until 1998).
// Look: howitsrun_style (hoover_ep19 world re-framed for 16:9): full-body profile people in real places, flat sets, paper plates.
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
const X = require('./h2kit');
const S = X.HK;
const { C, F, clamp, lerp, seg, E, rr, hash } = K;
const { W, H, FPS, PAL, layer, cam, shake, pop, blink, label, txt, fitTxt } = ST;
const { CUSTOMER, MANAGER, AGENT, vacBox, PHONE } = S.CS;
const OFFICER = { ...P.LOOKS.office, skin: '#D9A27E', hair: '#3A2418', top: '#5A6B4A', cuff: '#4A5A3C', pants: '#3A3A44', glasses: 1 };

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
const boxArm = (flip = 1) => ({ hand: [120, -200], grip: 'hold', item: g => vacBox(g, 0.62, flip) });
function walker(ctx, x, y, s, L, t, ph, f = 1, face) { P.person(ctx, x, y, s, f, L, { ...R.walk(ph), armN: boxArm(f), armF: { hand: [100, -195], grip: 'hold' }, face: face || FACE('grin', [1, 0], t, ph) }); }
function paperBg(ctx, col = 'rgba(77,141,255,0.10)') { ST.bg(ctx, PAL.paper); ctx.fillStyle = col; for (let i = 0; i < 20; i++) ctx.fillRect(0, i * 60 + 20, W, 3); }
function bigPlate(ctx, s, x, y, u, size = 110, col = C.red, fg = PAL.cream, sh = 0) { if (u <= 0) return; ctx.save(); ctx.translate(x + sh, y); ctx.scale(u, u); ctx.rotate(-0.02); ctx.font = `${size}px ${F.black}`; const w = ctx.measureText(s).width + 80;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -size * 0.8, w, size * 1.45, 20), col, { elev: 2 }); txt(ctx, s, 0, size * 0.36, size, fg); ctx.restore(); }
function clock(ctx, t, r = 90) { ell2(ctx, r); const a = t * 6, b = t * 0.5; ctx.strokeStyle = K.C.ink; ctx.lineCap = 'round'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(a) * r * 0.75, -Math.cos(a) * r * 0.75); ctx.stroke(); ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(b) * r * 0.5, -Math.cos(b) * r * 0.5); ctx.stroke(); }
function ell2(ctx, r) { R.ell(ctx, 0, 0, r, r); R.fillStroke(ctx, '#FFFDF8', 6); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ctx.fillStyle = K.C.ink; ctx.fillRect(Math.sin(a) * r * 0.8 - 3, -Math.cos(a) * r * 0.8 - 3, 6, 6); } }

// ---------- overlays ----------
function overlays(ctx, t) { if (t >= CARD - 0.1) ST.stampLabel(ctx); else ST.stampLabel(ctx); }

// ================= SHOTS =================
const SH = []; const shot = (id, t0, t1, draw, out) => SH.push({ id, t0, t1, draw, out });
const cut = (id, w, n = 0) => at(id, w, n) - 0.12;

// CARD (0–3 s): CHAPTER 2 · The Free Flights · BRITAIN · 1992
shot('CARD', 0, Z.s01 - 0.1, (ctx, t) => {
  X.chapterCard(ctx, t, 'CHAPTER 2', 'The Free Flights', 'BRITAIN · 1992', g => { g.translate(0, 200); S.vacuum(g, 1.0); }, g => { g.translate(-80, 60); g.rotate(-0.15); S.airliner(g, 0.3, { stairs: false }); });
  ST.grade(ctx, 'day', 0.12);
});

// ---- s01 "Ninety years later, in Britain, a company made the same mistake with something far more expensive: airplane tickets."
const tLater = at('s01', 'later'), tBritain = at('s01', 'britain'), tCompany = at('s01', 'company'), tSame = at('s01', 'same'), tSomething = at('s01', 'something'), tFar = at('s01', 'far'), tExp = at('s01', 'expensive'), tPlane = at('s01', 'airplane');
// A1: the rat tail and its 1-cent coin (Hanoi) — the calendar flips 1902 -> 1992, BRITAIN
shot('A1 1902->1992', Z.s01 - 0.1, tCompany - 0.12, (ctx, t, lt) => {
  paperBg(ctx, 'rgba(201,135,74,0.10)');
  ctx.save(); ctx.translate(560, 330); ctx.rotate(-0.3 + Math.sin(t * 2) * 0.05); X.RK.tail(ctx, 360, t * 3, 22); ctx.restore();
  ctx.save(); ctx.translate(560, 760); X.RK.coin(ctx, 70, '1¢', { spin: t * 2 }); ctx.restore();
  label(ctx, 'HANOI · 1902', 560, 220, pop(t, Z.s01 - 0.05), { size: 50, col: '#171717', fg: C.yellow });
  const f = seg(t, tLater - 0.1, tLater + 0.2), sx = Math.abs(Math.cos(f * Math.PI)) || 0.02, late = f > 0.5;
  ctx.save(); ctx.translate(1340, 520); ctx.scale(Math.max(0.03, sx), 1); ctx.rotate(0.03); ST.calCard(ctx, late ? 'BRITAIN' : 'HANOI', late ? '1992' : '1902', { w: 480, h: 440 }); ctx.restore();
  label(ctx, '90 YEARS LATER', 1340, 850, pop(t, tLater - 0.05), { size: 50, col: C.yellow });
  ST.grade(ctx, 'day', 0.15);
});
// A2: a British high street, the Hoover shop, the boss outside — "a company made the same mistake"
shot('A2 company', tCompany - 0.12, tSomething - 0.12, (ctx, t, lt) => {
  world(ctx, [[0, -100, -470, 0.86], [2, -40, -480, 0.92]], lt, w => {
    SE.sky(w, t, { clouds: 3 }); SE.ground(w, 'road'); SE.houses(w, -2400, 3); SE.houses(w, 1100, 3); SE.shopFront(w, 350, 900, 'HOOVER', { awn: S.HRED, signCol: S.HRED });
    P.person(w, -420, 0, 1.0, 1, MANAGER, { face: FACE('smug', [1, -0.2], t), armN: { hand: [140, -300], grip: 'open' } }, { tie: C.red });
  });
  label(ctx, 'A COMPANY', 380, 200, pop(t, tCompany - 0.05), { size: 56 });
  label(ctx, 'THE SAME MISTAKE', 1440, 200, pop(t, tSame - 0.05), { size: 60, col: C.red, fg: PAL.cream, rot: 0.03 });
  ST.grade(ctx, 'day', 0.18);
});
// A3: something far more expensive: the tail flips into a pair of airplane tickets
shot('A3 tail->tickets', tSomething - 0.12, Z.s02 - 0.12, (ctx, t, lt) => {
  paperBg(ctx);
  const f = seg(t, tPlane - 0.15, tPlane + 0.2), sx = Math.max(0.03, Math.abs(Math.cos(f * Math.PI))), z = 1 + lt * 0.02;
  ctx.save(); ctx.translate(W / 2, 500); ctx.scale(sx * z, z);
  if (f < 0.5) { ctx.save(); ctx.rotate(-1.35); ctx.translate(0, -200); X.RK.tail(ctx, 400, t * 3, 24); ctx.restore(); label(ctx, 'A RAT TAIL · 1¢', 0, 200, 1, { size: 46 }); }
  else { S.tickets(ctx, 1.25, E.back(seg(t, tPlane, tPlane + 0.4), 2), 'NEW YORK'); }
  ctx.restore();
  if (t > tPlane) { const u = seg(t, tPlane, tPlane + 1.6); ctx.save(); ctx.translate(lerp(-300, W + 300, u), 300 - u * 60); ctx.rotate(-0.05); S.airliner(ctx, 0.22, { stairs: false }); ctx.restore(); }
  label(ctx, 'FAR MORE EXPENSIVE', 1500, 800, pop(t, tFar - 0.05), { size: 54, col: C.yellow, rot: 0.03 });
  label(ctx, 'AIRPLANE TICKETS', 420, 800, pop(t, tPlane - 0.02), { size: 56, col: PAL.navy, fg: PAL.cream, rot: -0.03 });
  ST.grade(ctx, 'day', 0.12);
});

// ---- s02 "Hoover's British business was struggling. In August 1992, it made an offer to customers in Britain and Ireland: spend 100 pounds on its
//          products, get two free return flights to Europe. Then it added New York and Orlando."
const tStrug = at('s02', 'struggling'), tIn2 = at('s02', 'in'), tAug = at('s02', 'august'), tOffer = at('s02', 'offer'), tCust = at('s02', 'customers'), tBrit2 = at('s02', 'britain'), tIrel = at('s02', 'ireland'),
  tSpend = at('s02', 'spend'), tTwo = at('s02', 'two'), tFlights2 = at('s02', 'flights'), tEurope = at('s02', 'europe'), tThen = at('s02', 'then'), tNY = at('s02', 'new'), tOrl = at('s02', 'orlando');
// B1/B2: the Hoover office: the falling sales board, the boss worried -> the August 1992 idea
function office(ctx, t, lt, keys, face, board, idea) {
  world(ctx, keys, lt, w => {
    SE.room(w, t, { wall: '#E8E2D0', floor: 'tile', window: 900 });
    w.save(); w.translate(160, -820); X.salesBoard(w, board); w.restore();
    P.person(w, -380, 0, 1.05, 1, MANAGER, idea ? { face: FACE('smug', [1, -0.4], t), armN: { hand: [130, -470], grip: 'point' } } : { face: FACE('worried', [1, -0.3], t), headTilt: 0.06, armN: { hand: [60, -470], grip: 'relax' } }, { tie: C.red });
  });
}
shot('B1 struggling', Z.s02 - 0.12, tIn2 - 0.12, (ctx, t, lt) => {
  office(ctx, t, lt, [[0, -80, -560, 0.88], [2.5, -40, -560, 0.95]], 'worried', seg(t, Z.s02, tStrug + 0.4), false);
  label(ctx, "HOOVER'S BRITISH BUSINESS", 520, 190, pop(t, Z.s02), { size: 46 });
  label(ctx, 'STRUGGLING', 1450, 860, pop(t, tStrug - 0.05), { size: 64, col: C.red, fg: PAL.cream, rot: 0.03 });
  ST.grade(ctx, 'office', 0.2);
});
shot('B2 august', tIn2 - 0.12, tOffer - 0.12, (ctx, t, lt) => {
  office(ctx, t, lt, [[0, -120, -560, 0.95], [2.2, -150, -560, 1.0]], 'smug', 1, t > tAug + 0.4);
  const u = pop(t, tAug - 0.05, 0.35); if (u > 0) { ctx.save(); ctx.translate(1450, 480); ctx.rotate(0.04); ctx.scale(u, u); ST.calCard(ctx, 'AUGUST', '1992', { w: 440, h: 400 }); ctx.restore(); }
  ST.grade(ctx, 'office', 0.2);
});
// B3: the offer goes out on the high street: the poster on its easel, customers stop and look; BRITAIN + IRELAND
shot('B3 offer street', tOffer - 0.12, tSpend - 0.12, (ctx, t, lt) => {
  world(ctx, [[0, 100, -500, 0.86], [2.6, 160, -500, 0.9]], lt, w => {
    SE.sky(w, t, { clouds: 3 }); SE.ground(w, 'road'); SE.houses(w, -2600, 3); SE.shopFront(w, -700, 900, 'HOOVER', { awn: S.HRED, signCol: S.HRED });
    w.save(); w.translate(0, 0); R.tube(w, [[-120, 0], [-60, -460]], 14, '#8A5A34', 4); R.tube(w, [[120, 0], [60, -460]], 14, '#8A5A34', 4); w.translate(0, -560); w.scale(0.6, 0.6); S.poster(w, { title: 'HOOVER · SPEND £100', sub: 'GET 2 FREE FLIGHTS!' }); w.restore();
    for (let i = 0; i < 3; i++) { const tt = tCust - 0.4 + i * 0.25, u = E.out(seg(t, tt, tt + 1.0)), x = lerp(1600 + i * 300, 480 + i * 290, u);
      P.person(w, x, 0, 0.95, -1, S.CROWD[i + 1], u < 1 ? { ...R.walk(t * 7 + i), face: FACE('smile', [1, -0.1], t, i) } : { face: FACE(i === 1 ? 'surprised' : 'grin', [1, -0.3], t, i), lean: 0.05 }); }
  });
  label(ctx, 'AN OFFER', 300, 190, pop(t, tOffer - 0.05), { size: 56, col: C.yellow });
  label(ctx, 'BRITAIN', 1300, 190, pop(t, tBrit2 - 0.05), { size: 52, col: PAL.navy, fg: PAL.cream, rot: -0.04 });
  label(ctx, '+ IRELAND', 1640, 200, pop(t, tIrel - 0.05), { size: 52, col: '#2FA37E', fg: PAL.cream, rot: 0.04 });
  ST.grade(ctx, 'day', 0.18);
});
// B4: the poster close-up: SPEND £100 -> 2 FREE RETURN FLIGHTS -> EUROPE
shot('B4 terms', tSpend - 0.12, tThen - 0.12, (ctx, t, lt) => {
  paperBg(ctx);
  const z = 1 + lt * 0.015; ctx.save(); ctx.translate(560, 520); ctx.scale(0.88 * z, 0.88 * z); ctx.rotate(-0.03); S.poster(ctx, { title: 'HOOVER · SPEND £100', sub: 'GET 2 FREE FLIGHTS!' }); ctx.restore();
  bigPlate(ctx, 'SPEND £100', 1350, 230, pop(t, tSpend - 0.05), 90, C.yellow, K.C.ink);
  label(ctx, '→ 2 FREE RETURN FLIGHTS', 1350, 420, pop(t, tTwo - 0.05), { size: 56 });
  const u = seg(t, tFlights2 - 0.1, tFlights2 + 0.4); if (u > 0) { ctx.save(); ctx.translate(1350, 640); ctx.rotate(0.04); S.tickets(ctx, 0.85 * E.back(u, 2), u, 'PARIS'); ctx.restore(); }
  label(ctx, 'TO EUROPE', 1350, 840, pop(t, tEurope - 0.05), { size: 60, col: PAL.navy, fg: PAL.cream, rot: 0.03 });
  ST.grade(ctx, 'day', 0.12);
});
// B5: the departures board: Europe ... then NEW YORK and ORLANDO flip in
shot('B5 departures', tThen - 0.12, Z.s03 - 0.12, (ctx, t, lt) => {
  ST.bg(ctx, '#DCE6EE'); ctx.fillStyle = 'rgba(46,58,89,0.06)'; for (let i = 0; i < 12; i++) ctx.fillRect(i * 170, 0, 6, H);
  const z = 0.88 + lt * 0.02; ctx.save(); ctx.translate(W / 2, 530); ctx.scale(z, z);
  X.departures(ctx, [['PARIS', 1], ['ROME', 1], ['MADRID', 1], ['NEW YORK', seg(t, tNY - 0.1, tNY + 0.25), 'FREE!'], ['ORLANDO', seg(t, tOrl - 0.1, tOrl + 0.25), 'FREE!']], t); ctx.restore();
  label(ctx, 'THEN IT ADDED', 300, 190, pop(t, tThen - 0.05), { size: 46, col: C.yellow });
  ST.grade(ctx, 'office', 0.15);
});

// ---- s03 "The cheapest vacuum that qualified cost 119 pounds. The tickets were worth a lot more. People did the math. Stores sold out, and reportedly a
//          market for barely-used vacuums appeared. By March 1993, about two hundred thousand people had claimed flights."
const tCheap = at('s03', 'cheapest'), t119 = at('s03', '119'), tTk = at('s03', 'tickets'), tLot = at('s03', 'lot'), tPeople3 = at('s03', 'people'), tMath = at('s03', 'math'), tStores = at('s03', 'stores'),
  tSold3 = at('s03', 'sold'), tAnd3 = at('s03', 'and'), tRep = at('s03', 'reportedly'), tMarket = at('s03', 'market'), tBarely = at('s03', 'barely'), tVacs3 = at('s03', 'vacuums'), tAppeared = at('s03', 'appeared'),
  tBy = at('s03', 'by'), tMarch = at('s03', 'march'), t200 = at('s03', 'two'), tClaimed = at('s03', 'claimed');
function shopInside(ctx, t, lt, keys, gone, cust) {
  world(ctx, keys, lt, w => {
    SE.room(w, t, { wall: '#F2E6D2', floor: 'tile' });
    w.save(); w.translate(260, 0); X.vacDisplay(w, 4, 300, [null, null, null, gone ? null : (t > t119 - 0.1 ? ['£119', C.yellow] : null)], { s: 0.85, gone }); w.restore();
    if (cust) cust(w);
  });
}
// C1: the shop display; the customer studies the cheapest model: £119
shot('C1 cheapest', Z.s03 - 0.12, tTk - 0.12, (ctx, t, lt) => {
  shopInside(ctx, t, lt, [[0, -60, -420, 0.86], [4, 40, -400, 0.95]], null, w => P.person(w, -700, 0, 1.05, 1, CUSTOMER, { face: FACE('thinking', [1, 0.1], t), armN: { hand: [90, -470], grip: 'relax' } }));
  label(ctx, 'THE CHEAPEST ONE THAT QUALIFIED', 960, 190, pop(t, tCheap - 0.05), { size: 50 });
  bigPlate(ctx, '£119', 1560, 400, pop(t, t119 - 0.05), 100, C.yellow, K.C.ink);
  ST.grade(ctx, 'office', 0.18);
});
// C2: the balance: the £119 vacuum vs two tickets — it tips on "LOT"
shot('C2 balance', tTk - 0.12, tPeople3 - 0.12, (ctx, t, lt) => {
  paperBg(ctx);
  const tilt = lerp(-0.3, 0.95, E.back(seg(t, tLot - 0.1, tLot + 0.3), 1.6));
  ctx.save(); ctx.translate(W / 2, 300); ctx.scale(0.85, 0.85); S.balance(ctx, tilt, g => S.vacuum(g, 0.55), g => { g.save(); g.translate(0, -70); S.tickets(g, 0.5, 1); g.restore(); }); ctx.restore();
  label(ctx, '£119', 360, 560, 1, { size: 80, col: C.yellow });
  label(ctx, 'WORTH A LOT MORE', 1540, 560, pop(t, tLot - 0.05), { size: 52, col: C.red, fg: PAL.cream, rot: 0.04 });
  ST.grade(ctx, 'day', 0.12);
});
// C3: "People did the math." — the customer outside the shop, box under the arm, tickets in hand
shot('C3 math', tPeople3 - 0.12, tStores - 0.12, (ctx, t, lt) => {
  world(ctx, [[0, 250, -470, 1.0], [1.4, 270, -470, 1.06]], lt, w => { SE.sky(w, t, { clouds: 2 }); SE.ground(w, 'road'); SE.shopFront(w, -300, 1100, 'HOOVER', { awn: S.HRED, signCol: S.HRED });
    P.person(w, 520, 0, 1.05, 1, CUSTOMER, { face: FACE('grin', [1, -0.4], t), armN: { hand: [140, -390], grip: 'pinch', item: g => { g.save(); g.translate(30, -40); S.tickets(g, 0.32, 1); g.restore(); } }, armF: boxArm(1) }); });
  label(ctx, '£119 → 2 FLIGHTS', 560, 200, pop(t, tMath - 0.15), { size: 66, col: C.yellow });
  ST.grade(ctx, 'day', 0.18);
});
// C4: "Stores sold out" — the display is empty, SOLD OUT stamp
shot('C4 sold out', tStores - 0.12, tAnd3 - 0.12, (ctx, t, lt) => {
  shopInside(ctx, t, lt, [[0, 260, -400, 0.95], [1.2, 260, -400, 0.98]], i => t > tSold3 - 0.3 + i * 0.08, w => P.person(w, -380, 0, 1.0, 1, S.CROWD[2], { face: FACE(t > tSold3 ? 'shocked' : 'smile', [1, 0], t), lean: t > tSold3 ? -0.05 : 0, armN: { hand: [130, -330], grip: 'open' } }));
  ctx.save(); ctx.translate(1000, 480); ST.stampWord(ctx, 'SOLD OUT', 130, seg(t, tSold3 - 0.05, tSold3 + 0.3)); ctx.restore();
  ST.grade(ctx, 'office', 0.18);
});
// C5: the classifieds: barely-used vacuums for sale (reportedly)
shot('C5 classifieds', tAnd3 - 0.12, tBy - 0.12, (ctx, t, lt) => {
  paperBg(ctx, 'rgba(0,0,0,0.04)');
  const z = 0.98 + lt * 0.015; ctx.save(); ctx.translate(W / 2 + 80, 480); ctx.scale(z, z);
  X.classifieds(ctx, [['VACUUM · BARELY USED', 'CHEAP!', seg(t, tMarket - 0.05, tMarket + 0.3)], ['VACUUM · STILL IN BOX', 'BEST OFFER', seg(t, tBarely - 0.05, tBarely + 0.3)], ['VACUUM · USED ONCE', 'MAKE AN OFFER', seg(t, tVacs3 - 0.05, tVacs3 + 0.3)]], t); ctx.restore();
  label(ctx, 'REPORTEDLY', 250, 180, pop(t, tRep - 0.05), { size: 40, col: '#171717', fg: C.yellow, rot: -0.04 });
  ST.grade(ctx, 'day', 0.12);
});
// C6: the claims pour in: MARCH 1993, ≈ 200,000
shot('C6 claims', tBy - 0.12, Z.s04 - 0.12, (ctx, t, lt) => {
  world(ctx, [[0, 0, -380, 0.9], [4, 0, -390, 0.96]], lt, w => { SE.room(w, t, { wall: '#DCE6EE', floor: 'tile' });
    for (let i = 0; i < 90; i++) { const tt = tBy + i * 0.04; if (t < tt) break; const f = clamp((t - tt) / 0.4), x = (hash(i) - 0.5) * 1300 * (0.4 + i / 130), y = lerp(-1600, -20 - (i / 90) * 420 * (1 - Math.abs(x) / 900), E.in(f));
      w.save(); w.translate(x + 200, y); S.envelope(w, 0.9, i); w.restore(); } });
  const u = pop(t, tMarch - 0.05, 0.35); if (u > 0) { ctx.save(); ctx.translate(330, 420); ctx.rotate(-0.04); ctx.scale(u * 0.85, u * 0.85); ST.calCard(ctx, 'MARCH', '1993', { w: 420, h: 380 }); ctx.restore(); }
  const u2 = pop(t, t200 - 0.1, 0.35); if (u2 > 0) { ctx.save(); ctx.translate(1300 + shake(t, t200 + 0.2, 8), 260); ctx.scale(u2, u2); CL.cutout(ctx, () => rr(ctx, -360, -95, 720, 170, 20), C.red, { elev: 2 }); txt(ctx, '≈ 200,000', 0, 30, 110, PAL.cream); ctx.restore(); }
  label(ctx, 'PEOPLE CLAIMED FLIGHTS', 1300, 420, pop(t, tClaimed - 0.05), { size: 48 });
  ST.grade(ctx, 'office', 0.18);
});

// ---- s04 "Hoover wanted to sell vacuums. It rewarded buying a vacuum. But the reward was bigger than the thing it was attached to — so people weren't
//          buying vacuums anymore. They were buying flights."
const tWanted = at('s04', 'wanted'), tRewarded = at('s04', 'rewarded'), tBut = at('s04', 'but'), tBigger = at('s04', 'bigger'), tAttached = at('s04', 'attached'), tSo = at('s04', 'so'),
  tVacs4 = at('s04', 'vacuums', 1), tThey = at('s04', 'they'), tFlights4 = at('s04', 'flights');
function posterShot(ctx, t, lt, flip, pose, L, acc, keys) {
  world(ctx, keys || [[0, -80, -560, 0.92], [3, -40, -560, 0.97]], lt, w => { SE.room(w, t, { wall: '#EFE3CB', floor: 'wood' });
    w.save(); w.translate(320, -560); w.scale(0.85, 0.85); S.poster(w, { flip, title: 'HOOVER', sub: flip > 0.5 ? 'FREE FLIGHTS! (+ A VACUUM)' : 'VACUUMS! (+ FREE FLIGHTS)' }); w.restore();
    P.person(w, -420, 0, 1.08, 1, L, pose, acc); });
}
// D1: the plan: the boss presents the poster — WANTED: TO SELL VACUUMS / REWARDED: BUYING A VACUUM
shot('D1 plan', Z.s04 - 0.12, tBut - 0.12, (ctx, t, lt) => {
  posterShot(ctx, t, lt, 0, { face: FACE('smug', [1, -0.3], t), armN: { hand: [150, -380], grip: 'point' } }, MANAGER, { tie: C.red });
  label(ctx, 'WANTED: TO SELL VACUUMS', 560, 190, pop(t, tWanted - 0.05), { size: 50 });
  label(ctx, 'REWARDED: BUYING A VACUUM', 1380, 860, pop(t, tRewarded - 0.05), { size: 50, col: C.yellow });
  ST.grade(ctx, 'office', 0.18);
});
// D2: the reward is bigger than the thing: the poster flips (vacuum small, plane huge)
shot('D2 flip', tBut - 0.12, tSo - 0.12, (ctx, t, lt) => {
  posterShot(ctx, t, lt, seg(t, tBigger - 0.15, tBigger + 0.6), { face: FACE(t > tBigger + 0.2 ? 'shocked' : 'smug', [1, -0.3], t), lean: t > tBigger + 0.2 ? -0.05 : 0, armN: { hand: [150, -380], grip: t > tBigger + 0.2 ? 'open' : 'point' } }, MANAGER, { tie: C.red }, [[0, 150, -560, 1.0], [3.5, 180, -560, 1.06]]);
  label(ctx, 'THE REWARD > THE PRODUCT', 430, 200, pop(t, tBigger - 0.05), { size: 60, col: C.red, fg: PAL.cream });
  ST.grade(ctx, 'office', 0.18);
});
// D3: "people weren't buying vacuums anymore" — the vacuum box left on the pavement, struck out
shot('D3 not vacuums', tSo - 0.12, tThey - 0.12, (ctx, t, lt) => {
  world(ctx, [[0, 0, -440, 0.95], [2.6, 40, -440, 1.0]], lt, w => { SE.sky(w, t, { clouds: 2 }); SE.ground(w, 'road'); SE.houses(w, -1700, 7);
    w.save(); w.translate(-260, 0); vacBox(w, 1.2); w.translate(0, -180); ST.bigX(w, 170, seg(t, tVacs4 - 0.05, tVacs4 + 0.3)); w.restore();
    P.person(w, 380, 0, 1.05, 1, CUSTOMER, { ...R.walk(t * 6), face: FACE('smug', [-1, -0.2], t) }); });
  label(ctx, 'NOT BUYING VACUUMS', 1450, 190, pop(t, tVacs4 - 0.05), { size: 54 });
  ST.grade(ctx, 'day', 0.18);
});
// D4: "They were buying flights." — the queue with vacuum boxes climbing the air stairs
const AS = 0.62;
function boarding(ctx, t, lt, keys) {
  world(ctx, keys, lt, w => {
    S.apron(w, t); S.airliner(w, AS, {});
    for (let i = 0; i < 5; i++) { const u = ((t * 0.12 + i * 0.2) % 1), L = S.CROWD[i % 5];
      if (u < 0.45) { const x = lerp(-1400, 150 - 330 * AS - 40, u / 0.45); walker(w, x, 0, 0.62, L, t, t * 7 + i, 1); }
      else { const k = (u - 0.45) / 0.55, [x, y] = S.stairPt(0, AS, k); walker(w, x - 40, y + 10, 0.62, L, t, t * 6 + i, 1); } }
  });
}
shot('D4 flights', tThey - 0.12, Z.s05 - 0.12, (ctx, t, lt) => {
  boarding(ctx, t, lt, [[0, -100, -380, 0.95], [2.5, -60, -390, 1.02]]);
  bigPlate(ctx, 'THEY WERE BUYING FLIGHTS', W / 2, 200, pop(t, tFlights4 - 0.1), 72, C.yellow, K.C.ink);
  ST.grade(ctx, 'day', 0.18);
});

// ---- s05 the fallout
const tKeep = at('s05', 'keep'), tCustomers5 = at('s05', 'customers'), tWaited = at('s05', 'waited'), tCompl = at('s05', 'complained'), tAnd5 = at('s05', 'and'), tOne = at('s05', 'one'), tWent = at('s05', 'went'),
  tIowa = at('s05', 'iowa'), tConf = at('s05', 'confront'), tShare = at('s05', 'shareholders'), tTrading = at('s05', 'trading'), tNo = at('s05', 'no'), tFraud = at('s05', 'fraud'), tGrossly = at('s05', 'grossly'),
  tHow = at('s05', 'how'), tYes = at('s05', 'yes'), tThe2 = at('s05', 'the', 2), tMaytag = at('s05', 'maytag'), tCharter = at('s05', 'charter'), tRemoved = at('s05', 'removed'), tThree = at('s05', 'three'),
  tAnd5b = at('s05', 'and', 1), t60 = at('s05', '60'), t1993 = at('s05', '1993'), tTwoY = at('s05', 'two'), tSold5 = at('s05', 'sold'), tCourt = at('s05', 'court'), tDragged = at('s05', 'dragged'), t1998 = at('s05', '1998');
// E1: the travel agency: phones ringing, claim envelopes piling up
shot('E1 agency', Z.s05 - 0.12, tCustomers5 - 0.12, (ctx, t, lt) => {
  world(ctx, [[0, -40, -520, 0.9], [2.1, 0, -540, 0.98]], lt, w => { S.agency(w, t);
    P.seated(w, -380, 0, 1.1, 1, AGENT, P.POSE.phone(FACE('worried', [1, 0.2], t), PHONE));
    SE.desk(w, 160, 640, -300, '#8A5A34');
    for (let i = 0; i < 3; i++) { w.save(); w.translate(-20 + i * 150, -300); S.deskPhone(w, (Math.floor(t * 3) + i) % 2, t); w.restore(); }
    for (let i = 0; i < 16; i++) { w.save(); w.translate(390 + (hash(i) - 0.5) * 120, -310 - i * 22); S.envelope(w, 0.55, i + 9); w.restore(); } });
  label(ctx, 'TRAVEL AGENTS', 380, 190, pop(t, Z.s05), { size: 50 });
  label(ctx, "COULDN'T KEEP UP", 1480, 190, pop(t, tKeep - 0.05), { size: 60, col: C.red, fg: PAL.cream, rot: 0.03 });
  ST.grade(ctx, 'office', 0.2);
});
// E2: the queue at the counter: waited, complained (the wall clock spins)
shot('E2 queue', tCustomers5 - 0.12, tAnd5 - 0.12, (ctx, t, lt) => {
  world(ctx, [[0, 0, -470, 0.86], [2, 40, -470, 0.9]], lt, w => { SE.room(w, t, { wall: '#DCE6EE', floor: 'carpet', carpet: '#5E6E8E' });
    w.save(); w.translate(600, -820); clock(w, t); w.restore();
    P.seated(w, 820, 0, 1.0, -1, AGENT, { face: FACE('tired', [1, 0.2], t), armN: { hand: [120, -290], grip: 'relax' } }); SE.desk(w, 640, 420, -330, '#8A5A34');
    for (let i = 0; i < 4; i++) { const L = S.CROWD[(i + 1) % 5], x = 260 - i * 330, angry = t > tCompl - 0.1 && i % 2 === 0;
      P.person(w, x, 0, 0.98, 1, L, { face: FACE(angry ? 'squint' : 'tired', [1, 0], t, i), lean: angry ? 0.06 : 0, headTilt: angry ? -0.05 : 0.04, armN: angry && i === 0 ? { hand: [150, -400], grip: 'point' } : { hand: [30, -260], grip: 'relax' }, armF: i === 1 ? boxArm(1) : undefined }); } });
  label(ctx, 'WAITED...', 420, 190, pop(t, tWaited - 0.05), { size: 56, col: C.yellow });
  label(ctx, 'COMPLAINED', 1000, 200, pop(t, tCompl - 0.05), { size: 56, col: C.red, fg: PAL.cream, rot: 0.03 });
  ST.grade(ctx, 'office', 0.2);
});
// E3: one angry customer flies UK -> Iowa
shot('E3 map', tAnd5 - 0.12, tConf - 0.12, (ctx, t, lt) => {
  ST.bg(ctx, '#2E3A59');
  const z = 1.22 + lt * 0.02; ctx.save(); ctx.translate(W / 2, 500); ctx.scale(z, z); X.mapRoute(ctx, seg(t, tWent - 0.1, tIowa + 0.1), t); ctx.restore();
  label(ctx, 'ONE ANGRY CUSTOMER', 520, 140, pop(t, tOne - 0.05), { size: 50, col: C.yellow });
  label(ctx, 'UK → IOWA, USA', 1440, 860, pop(t, tIowa - 0.05), { size: 56 });
  ST.grade(ctx, 'day', 0.15);
});
// E4: the shareholders' meeting: the customer stands up and points at the stage
shot('E4 meeting', tConf - 0.12, tTrading - 0.12, (ctx, t, lt) => {
  world(ctx, [[0, 0, -250, 0.7], [3, 120, -240, 0.76]], lt, w => { S.meeting(w, t); w.save(); w.translate(0, -260); S.lectern(w); w.restore();
    P.person(w, 0, -260, 0.75, -1, MANAGER, { face: FACE('worried', [1, 0.2], t), armN: { hand: [100, -340], grip: 'open' } }, { tie: C.red });
    for (let r = 0; r < 2; r++) for (let i = -6; i <= 6; i++) { const x = i * 190 + r * 90, y = 300 + r * 140; R.ell(w, x, y - 150, 60, 70); R.fillStroke(w, ['#5A3A22', '#2A1E16', '#8A8A88', '#D9B26A'][Math.abs(i + r) % 4], 5); rr(w, x - 80, y - 90, 160, 120, 30); R.fillStroke(w, ['#3E4F78', '#6A4024', '#4A4F57', '#7A3A3A'][Math.abs(i * 3 + r) % 4], 5); }
    P.person(w, 520, 300, 1.1, -1, CUSTOMER, { face: FACE('squint', [1, -0.5], t), armN: { hand: [160, -440], grip: 'point' }, lean: 0.06 }); });
  label(ctx, "MAYTAG · SHAREHOLDERS' MEETING", 560, 180, pop(t, tShare - 0.05), { size: 54, col: C.yellow });
  ST.grade(ctx, 'office', 0.22);
});
// E5: trading standards: no fraud — Hoover had "grossly miscalculated"
shot('E5 finding', tTrading - 0.12, tHow - 0.12, (ctx, t, lt) => {
  world(ctx, [[0, -300, -480, 0.95], [5, -280, -480, 1.0]], lt, w => { SE.room(w, t, { wall: '#E8E2D0', floor: 'tile' });
    P.person(w, -560, 0, 1.05, 1, OFFICER, { face: FACE(t > tGrossly ? 'skeptical' : 'neutral', [1, -0.1], t), armN: { hand: [150, -330], grip: 'hold' }, armF: { hand: [120, -330], grip: 'hold' } }, { badge: 'OFFICER' }); });
  ctx.save(); ctx.translate(1240, 470); ctx.scale(0.95, 0.95); X.finding(ctx, seg(t, tNo - 0.05, tNo + 0.3), seg(t, tGrossly - 0.1, tGrossly + 0.3)); ctx.restore();
  label(ctx, 'TRADING STANDARDS OFFICERS', 560, 170, pop(t, tTrading - 0.05), { size: 44 });
  ST.grade(ctx, 'office', 0.18);
});
// E6: how many people would say yes: EXPECTED vs SAID YES
shot('E6 chart', tHow - 0.12, tThe2 - 0.12, (ctx, t, lt) => {
  paperBg(ctx);
  ctx.save(); ctx.translate(W / 2 - 200, 500); X.yesChart(ctx, 0.12 * E.out(seg(t, tHow, tHow + 0.4)), 0.95 * E.back(seg(t, tYes - 0.15, tYes + 0.35), 1.5)); ctx.restore();
  label(ctx, 'HOW MANY WOULD SAY YES?', W / 2 - 200, 160, pop(t, tHow - 0.05), { size: 50 });
  ctx.save(); ctx.translate(1540, 520); ST.stampWord(ctx, 'OOPS', 110, seg(t, tYes + 0.2, tYes + 0.5)); ctx.restore();
  ST.grade(ctx, 'day', 0.12);
});
// E7: the owner, Maytag, pays for charter planes
shot('E7 charter', tThe2 - 0.12, tRemoved - 0.12, (ctx, t, lt) => {
  world(ctx, [[0, -100, -20, 0.62], [2.6, 100, -20, 0.66]], lt, w => { S.apron(w, t); for (let i = 0; i < 3; i++) { w.save(); w.translate(-1700 + i * 1350, 200); S.airliner(w, 0.6, { stairs: false, stripe: [PAL.navy, '#26A69A', C.red][i] }); w.restore(); } });
  label(ctx, 'THE OWNER: MAYTAG', 480, 180, pop(t, tMaytag - 0.05), { size: 52 });
  label(ctx, 'PAID FOR CHARTER PLANES', 1380, 860, pop(t, tCharter - 0.05), { size: 56, col: C.yellow });
  ST.grade(ctx, 'day', 0.18);
});
// E8: three Hoover bosses removed: name plates struck out, one walks off with his box
const DOORS = ['PRESIDENT · HOOVER EUROPE', 'VP · MARKETING', 'MARKETING SERVICES'];
shot('E8 bosses', tRemoved - 0.12, tAnd5b - 0.12, (ctx, t, lt) => {
  world(ctx, [[0, 0, -420, 0.82], [2, 40, -420, 0.86]], lt, w => { SE.room(w, t, { wall: '#E8E2D0', floor: 'tile' });
    DOORS.forEach((d, i) => { w.save(); w.translate(-560 + i * 520, 0); S.door(w, d, seg(t, tThree - 0.1 + i * 0.25, tThree + 0.15 + i * 0.25)); w.restore(); });
    const u = seg(t, tRemoved, tAnd5b + 0.3); P.person(w, lerp(-300, 760, u), 60, 1.0, 1, MANAGER, { ...R.walk(t * 6), face: FACE('tired', [1, 0.2], t), armN: { hand: [120, -230], grip: 'hold', item: g => S.officeBox(g, 0.7) }, armF: { hand: [100, -225], grip: 'hold' } }, { tie: C.red }); });
  label(ctx, '3 HOOVER BOSSES REMOVED', W / 2, 160, pop(t, tThree - 0.05), { size: 58, col: C.red, fg: PAL.cream });
  ST.grade(ctx, 'office', 0.2);
});
// E9: about $60 million in charges in 1993
shot('E9 charges', tAnd5b - 0.12, tTwoY - 0.12, (ctx, t, lt) => {
  ST.bg(ctx, '#5E7A8C'); ctx.fillStyle = 'rgba(255,255,255,0.06)'; for (let i = 0; i < 12; i++) ctx.fillRect(0, i * 100, W, 40);
  const z = 1 + lt * 0.02; ctx.save(); ctx.translate(780, 480); ctx.scale(0.72 * z, 0.72 * z);
  ST.report(ctx, 'MAYTAG · 1993', 'COST OF THE FREE FLIGHTS', [['CHARGES', '$60M', seg(t, t60 - 0.1, t60 + 0.2)], ['YEAR', '1993', seg(t, t1993 - 0.1, t1993 + 0.2)]], { note: '(about, pretax charges)', h: 760 }); ctx.restore();
  bigPlate(ctx, '≈ $60 MILLION', 1500, 380, pop(t, t60 + 0.15), 80, C.red, PAL.cream, shake(t, t60 + 0.3, 6));
  ST.grade(ctx, 'office', 0.18);
});
// E10: two years later Maytag sold Hoover Europe
shot('E10 sold', tTwoY - 0.12, tCourt - 0.12, (ctx, t, lt) => {
  world(ctx, [[0, -300, -560, 0.78], [2.6, -300, -560, 0.82]], lt, w => { SE.sky(w, t, { clouds: 3 }); SE.ground(w, 'road'); SE.houses(w, -2600, 3); SE.houses(w, 900, 3); S.building(w, seg(t, tSold5 - 0.1, tSold5 + 0.25)); });
  label(ctx, 'TWO YEARS LATER', 330, 300, pop(t, tTwoY), { size: 56, col: C.yellow });
  ST.grade(ctx, 'day', 0.18);
});
// E11: court cases over the flights dragged on until 1998 (hold to the segment end)
shot('E11 court', tCourt - 0.12, T + 0.01, (ctx, t, lt) => {
  world(ctx, [[0, 0, -420, 0.95], [4, 30, -430, 1.0]], lt, w => { SE.room(w, t, { wall: '#C9B48E', floor: 'wood' });
    w.save(); w.translate(0, -1050); CL.cutout(w, () => rr(w, -300, -60, 600, 110, 12), '#5A3A22', { elev: 1 }); fitTxt(w, 'COURT', 0, 22, 64, PAL.cream, 540); w.restore();
    rr(w, -900, -300, 1300, 300, 8); R.fillStroke(w, '#6A4024', 5); rr(w, -940, -340, 1380, 50, 8); R.fillStroke(w, '#8A5A34', 5);
    const n = Math.floor(lerp(2, 11, seg(t, tCourt, t1998 + 0.2))); w.save(); w.translate(-500, -340); X.caseFiles(w, n, t); w.restore();
    w.save(); w.translate(180, -340); X.gavel(w, t > t1998 - 0.1 && t < t1998 + 0.15 ? 0.6 : 0); w.restore(); });
  const yr = Math.min(1998, 1993 + Math.floor(seg(t, tDragged - 0.2, t1998) * 5.999)); ctx.save(); ctx.translate(1480, 430); ctx.rotate(0.04); ST.calCard(ctx, 'COURT CASES', String(yr), { w: 440, h: 400 }); ctx.restore();
  label(ctx, 'UNTIL 1998', 1480, 760, pop(t, t1998 - 0.05), { size: 60, col: C.red, fg: PAL.cream });
  label(ctx, 'OVER THE FREE FLIGHTS', 480, 160, pop(t, tCourt - 0.05), { size: 48 });
  ST.grade(ctx, 'office', 0.2);
});

// ---------- edit, overlays, subtitles ----------
SH.sort((a, b) => a.t0 - b.t0);
const ED = makeEdit(SH, W, H);
const SPLIT = { s01: [5, 6, 7], s02: [5, 3, 10, 6, 7, 7], s03: [8, 7, 4, 3, 8, 3, 8], s04: [5, 5, 13, 6, 4], s05: [5, 3, 10, 8, 8, 6, 6, 7, 4, 10, 7, 9] };
const REPL = [[/100 pounds/, '£100'], [/119 pounds/, '£119'], [/two hundred thousand/, '200,000'], [/60 million dollars/, '$60 million']];
function subs() {
  const G = [];
  Object.keys(Z).forEach(id => { const ws = V.words(id); let k0 = 0; SPLIT[id].forEach(n => { G.push({ id, words: ws.slice(k0, k0 + n) }); k0 += n; }); if (k0 !== ws.length) throw new Error(`subtitle split ${id}: ${k0} vs ${ws.length}`); });
  G.forEach((g, i) => { const nx = G[i + 1], e0 = Math.min(g.words[g.words.length - 1].t1, end(g.id)) + 0.4; g.t0 = g.words[0].t0 - 0.05;
    g.t1 = nx ? (nx.id === g.id ? nx.words[0].t0 - 0.05 : Math.min(e0, nx.words[0].t0 - 0.05)) : Math.min(e0, T);
    let s = g.words.map(x => x.w).join(' '); for (const [a, b] of REPL) s = s.replace(a, b); g.text = s; });
  return G;
}
const SUBS = subs();
const HL = ['britain', 'expensive', 'struggling', '1992', '£100', 'free', 'orlando', '£119', 'lot', 'math', 'sold', '200000', 'bigger', 'flights', 'iowa', 'fraud', 'grossly', 'miscalculated', 'charter', 'three', '$60', '1998'];
function frame(ctx, t, o = {}) {
  ED.frame(ctx, t);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); overlays(ctx, t); ctx.restore();
  ST.paper(ctx);
  if (!o.nosubs) EN.drawSubtitles(ctx, t, SUBS, { ...ST.SUBS, highlight: HL });
}

// ---------- sound cues (for mix.py) + music moods for the lead ----------
function cues() {
  const c = [['pop', 0.0, 1.4], ['whoosh', 0.02, 0.6], ['pop', 0.2, 0.6], ['stamp', 0.5, 0.9]];
  c.push(['cut', Z.s01 - 0.1, 0.35], ['pop', Z.s01, 0.4], ['flip', tLater - 0.12, 0.7], ['pop', tLater - 0.05, 0.4]);
  c.push(['cut', tCompany - 0.12, 0.35], ['pop', tCompany - 0.05, 0.4], ['pop', tSame - 0.05, 0.4], ['cut', tSomething - 0.12, 0.35], ['tag', tFar - 0.05, 0.5], ['flip', tPlane - 0.15, 0.7], ['sparkle', tPlane, 0.5], ['whoosh', tPlane + 0.2, 0.4]);
  c.push(['cut', Z.s02 - 0.12, 0.35], ['pop', Z.s02, 0.4], ['fall', tStrug - 0.3, 0.6], ['pop', tStrug - 0.05, 0.4], ['cut', tIn2 - 0.12, 0.35], ['pop', tAug - 0.05, 0.6], ['ding', tAug + 0.4, 0.4]);
  c.push(['cut', tOffer - 0.12, 0.35], ['pop', tOffer - 0.05, 0.4], ['steps', tCust - 0.4, 0.4], ['pop', tBrit2 - 0.05, 0.4], ['pop', tIrel - 0.05, 0.4]);
  c.push(['cut', tSpend - 0.12, 0.35], ['tag', tSpend - 0.05, 0.6], ['pop', tTwo - 0.05, 0.4], ['whoosh', tFlights2 - 0.1, 0.4], ['pop', tEurope - 0.05, 0.4]);
  c.push(['cut', tThen - 0.12, 0.35], ['flip', tNY - 0.12, 0.6], ['flip', tNY - 0.02, 0.4], ['flip', tOrl - 0.12, 0.6], ['flip', tOrl - 0.02, 0.4], ['ding', tOrl + 0.3, 0.4]);
  c.push(['cut', Z.s03 - 0.12, 0.35], ['pop', tCheap - 0.05, 0.4], ['tag', t119 - 0.05, 0.6], ['cut', tTk - 0.12, 0.35], ['whoosh', tTk, 0.3], ['thump', tLot + 0.1, 0.7], ['clink', tLot + 0.15, 0.5]);
  c.push(['cut', tPeople3 - 0.12, 0.35], ['kaching', tMath - 0.1, 0.5], ['cut', tStores - 0.12, 0.35], ['stamp', tSold3 + 0.1, 0.8]);
  c.push(['cut', tAnd3 - 0.12, 0.35], ['paper', tAnd3, 0.5], ['pop', tRep - 0.05, 0.3], ['pop', tMarket - 0.05, 0.4], ['pop', tBarely - 0.05, 0.4], ['pop', tVacs3 - 0.05, 0.4]);
  c.push(['cut', tBy - 0.12, 0.35], ['pop', tMarch - 0.05, 0.5]); for (let i = 0; i < 14; i++) c.push(['paper', tBy + i * 0.17, 0.35]); c.push(['stamp', t200 + 0.15, 0.8], ['pop', tClaimed - 0.05, 0.4]);
  c.push(['cut', Z.s04 - 0.12, 0.35], ['pop', tWanted - 0.05, 0.4], ['pop', tRewarded - 0.05, 0.4], ['cut', tBut - 0.12, 0.35], ['whoosh', tBigger - 0.1, 0.5], ['boop', tBigger + 0.3, 0.5], ['pop', tBigger - 0.05, 0.4]);
  c.push(['cut', tSo - 0.12, 0.35], ['steps', tSo, 0.4], ['buzzer', tVacs4, 0.5], ['cut', tThey - 0.12, 0.35], ['sparkle', tFlights4, 0.5], ['pop', tFlights4 - 0.1, 0.5]);
  c.push(['cut', Z.s05 - 0.12, 0.35], ['ring', Z.s05, 0.45], ['ring', Z.s05 + 1.0, 0.35], ['pop', tKeep - 0.05, 0.4], ['cut', tCustomers5 - 0.12, 0.35], ['tick', tWaited, 0.6], ['tick', tWaited + 0.25, 0.6], ['pop', tCompl - 0.05, 0.4]);
  c.push(['cut', tAnd5 - 0.12, 0.35], ['pop', tOne - 0.05, 0.4], ['whoosh', tWent, 0.5], ['ding', tIowa, 0.4], ['cut', tConf - 0.12, 0.35], ['applause', tConf, 0.2], ['pop', tShare - 0.05, 0.4]);
  c.push(['cut', tTrading - 0.12, 0.35], ['pop', tTrading - 0.05, 0.4], ['stamp', tNo + 0.1, 0.8], ['pop', tGrossly - 0.1, 0.5]);
  c.push(['cut', tHow - 0.12, 0.35], ['rise', tYes - 0.2, 0.5], ['stamp', tYes + 0.3, 0.7], ['cut', tThe2 - 0.12, 0.35], ['pop', tMaytag - 0.05, 0.4], ['pop', tCharter - 0.05, 0.4]);
  c.push(['cut', tRemoved - 0.12, 0.35]); for (let i = 0; i < 3; i++) c.push(['scratch', tThree - 0.1 + i * 0.25, 0.5]); c.push(['steps', tRemoved + 0.2, 0.4]);
  c.push(['cut', tAnd5b - 0.12, 0.35], ['stamp', t60 + 0.1, 0.9], ['pop', t1993 - 0.05, 0.4]);
  c.push(['cut', tTwoY - 0.12, 0.35], ['pop', tTwoY, 0.4], ['slam', tSold5 + 0.1, 0.6], ['cut', tCourt - 0.12, 0.35], ['pop', tCourt - 0.05, 0.4]);
  for (let i = 0; i < 5; i++) c.push(['flip', tDragged - 0.2 + i * (t1998 - tDragged + 0.2) / 5, 0.4]); c.push(['thump', t1998, 0.8], ['stamp', t1998 + 0.05, 0.5]);
  return c;
}
const MUSIC = { sections: [[0, 'light'], [Z.s02 - 0.12, 'calm'], [tSpend - 0.12, 'up'], [tStores - 0.12, 'light'], [Z.s04 - 0.12, 'up'], [Z.s05 - 0.12, 'tension'], [tThe2 - 0.12, 'dark']] };

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
