// Episode 20 "The lightbulb cartel" (How It's Run) — Geneva, 1924: the world's biggest bulb makers (Phoebus) agreed to cap bulb life
// at 1,000 hours (good bulbs had burned up to ~2,000); factories mailed sample bulbs to a test lab in Switzerland and paid a fine if a bulb
// lasted too long; average bulb life fell by about a third (1,800 h in 1926 -> 1,205 h in 1933-34); costs fell, prices barely moved;
// the deal died in 1940 in the war. Twist: every bulb that burns out is a bulb you buy again — your bulb was scheduled to burn out.
// Look: howitsrun_style/ (style reference lawnchair_ep17 / emu_ep12): full-body profile people in real places, flat sets, paper plates.
// Voice: vo/ (as generated) -> trim.py shortens only the long pauses inside lines -> vo_cut/ (used here and in mix.py).
// Usage: node episode.js video out.mp4 | still t1,t2,... out.png | frame t out.png [nosubs] | cues | srt out.srt | shots | carousel dir
const { createCanvas } = require('@napi-rs/canvas');
const { spawn } = require('child_process');
const fs = require('fs');
const K = require('../tests/mcd_collage/kit');
const EN = require('../mcd_ep1/engine');            // voice timings + subtitle drawing only (read-only use)
const R = require('../hirkit/rig');
const CL = require('../hirkit/collage');
const { makeEdit } = require('../hirkit/edit');
const ST = require('../howitsrun_style/style');
const P = require('../howitsrun_style/people');
const SE = require('../howitsrun_style/sets');
const S = require('./bulbkit');
const { C, F, clamp, lerp, seg, E, rr, hash } = K;
const { W, H, FPS, PAL, layer, cam, shake, pop, blink, label, txt, fitTxt } = ST;
const CS = S.CS;
const VO = `${__dirname}/vo_cut`;

// ---------- voice timeline (natural speed; real speech start/end from vo_cut/speech.json, gaps only) ----------
const LINES = JSON.parse(fs.readFileSync(`${__dirname}/script.json`));
const SP = JSON.parse(fs.readFileSync(`${VO}/speech.json`));
const GAP = { s01: 0.3, s02: 0.25, s03: 0.25, s04: 0.25, s05: 0.2, s06: 0.25, s07: 0.25, s08: 0.2, s09: 0.25, s10: 0 };
const STt = {}; let T = 0.05; for (const L of LINES) { STt[L.id] = +(T - SP[L.id][0]).toFixed(3); T += SP[L.id][1] - SP[L.id][0] + GAP[L.id]; }
const V = EN.voice(VO, STt), at = (id, w, n = 0) => V.at(id, w, n), end = id => STt[id] + SP[id][1];
const tEnd = +(end('s10') + 0.15).toFixed(2);
T = +(tEnd + 2.2).toFixed(2);
const Z = STt;

// ---------- helpers ----------
const FACE = (n, look = [1, 0], t = 0, o = 0) => R.expr(n, { look, blink: blink(t, 3.2, o) });
const fmt = n => Math.round(n).toLocaleString('en-US');

// ---------- overlays ----------
const tSecret = at('s01', 'secret'), tMake = at('s01', 'make', 1), tBulb1 = at('s01', 'bulb'), tWorse = at('s01', 'worse');
function overlays(ctx, t) {
  const hA = 1 - seg(t, tSecret - 0.35, tSecret - 0.14);
  ST.headline2(ctx, 'SECRET DEAL:', 'WORSE BULBS', hA, 400);
  if (hA > 0) label(ctx, 'GENEVA · 1924', W / 2, 650, hA, { size: 38, col: '#171717', fg: C.yellow, rot: 0.02 });
  ST.stampLabel(ctx);
  if (t >= tEnd) ST.questionCard(ctx, t, ['WHAT ELSE DO YOU THINK'], 'BREAKS ON PURPOSE?', E.back(seg(t, tEnd, tEnd + 0.35), 2), { arrow: true, y: 560 });
}

// ================= SHOTS =================
const SH = []; const shot = (id, t0, t1, draw, out) => SH.push({ id, t0, t1, draw, out });
// A1 (frame 0, s01 "In 1924, the world's biggest lightbulb makers made a..."): two executives shake hands over a mountain of burnt-out bulbs
function handshake(ctx, t, lt, z0, z1) {
  const c = cam([[0, 0, -520, z0], [4, 0, -530, z1]], lt), pump = Math.sin(t * 11) * 14 * (0.5 + 0.5 * Math.sin(t * 1.3));
  layer(ctx, c, 1, w => {
    S.meetRoom(w, t, { window: 900 });
    P.person(w, -195, 0, 1.0, 1, CS.EXEC_A, { face: FACE('grin', [1, 0], t), armN: { hand: [192, -372 + pump], grip: 'fist' } }, CS.ACC_A);
    P.person(w, 195, 0, 1.0, -1, CS.EXEC_B, { face: FACE('smug', [1, 0], t, 1.1), armN: { hand: [192, -372 - pump], grip: 'fist' }, headTilt: 0.03 }, CS.ACC_B);
    w.save(); w.translate(0, 60); S.bulbPile(w, 700); w.restore();
  });
}
shot('A1 handshake', 0, tSecret - 0.12, (ctx, t, lt) => { handshake(ctx, t, lt, 0.96, 1.08); ST.grade(ctx, 'office', 0.22); }, { type: 'cut' });
// A2 (s01 "...secret deal."): the agreement on the table; pen signatures; the SECRET stamp lands
shot('A2 secret', tSecret - 0.12, tMake - 0.12, (ctx, t, lt) => {
  ST.bg(ctx, '#5A3A22'); ctx.fillStyle = 'rgba(0,0,0,0.12)'; for (let i = 0; i < 12; i++) ctx.fillRect(0, i * 170, W, 8);
  const z = 1.18 + lt * 0.04; ctx.save(); ctx.translate(540 + shake(t, tSecret + 0.15, 10), 860); ctx.scale(z, z); ctx.rotate(-0.03);
  S.agreement(ctx, 1, { stamp: seg(t, tSecret, tSecret + 0.25) }); ctx.restore();
  label(ctx, 'THE BIGGEST BULB MAKERS', 540, 1340, pop(t, tSecret - 0.1), { size: 46, col: C.yellow });
  ST.grade(ctx, 'office', 0.22);
});
// A3 (s01 "Make the bulb... worse."): the lamp over the meeting table flickers and goes dull; the executives look up, pleased
shot('A3 worse', tMake - 0.12, Z.s02 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -640, 0.9], [2.5, 0, -660, 0.98]], lt);
  let on = 1; if (t > tBulb1) on = 0.55 + 0.45 * (Math.sin(t * 47) > 0 ? 1 : 0.2); if (t > tWorse) on = lerp(0.6, 0.12, seg(t, tWorse, tWorse + 0.4));
  layer(ctx, c, 1, w => {
    S.meetRoom(w, t, { window: -900 }); S.table(w, 1000, -300);
    w.save(); w.translate(0, -1080); S.pendant(w, 1.15, -900, on); w.restore();
    P.person(w, -360, 0, 1.0, 1, CS.EXEC_C, { face: FACE('smug', [0.6, -1], t), headTilt: -0.12 }, CS.ACC_C);
    P.person(w, 360, 0, 1.0, -1, CS.EXEC_A, { face: FACE('grin', [0.6, -1], t, 0.7), headTilt: -0.12 }, CS.ACC_A);
  });
  label(ctx, 'MAKE THE BULB...', 540, 470, pop(t, tMake - 0.05), { size: 64 });
  ctx.save(); ctx.translate(540, 1300); ST.stampWord(ctx, 'WORSE', 120, seg(t, tWorse, tWorse + 0.25)); ctx.restore();
  ST.grade(ctx, 'office', 0.24);
});
// B1 (s02): the world map; a pennant pops on every country, then the American giant's arrow across the ocean
const tDE = at('s02', 'germany'), tNL = at('s02', 'netherlands'), tFR = at('s02', 'france'), tGB = at('s02', 'britain'), tJP = at('s02', 'japan'),
  tAm = at('s02', 'american'), tWork = at('s02', 'working'), tOver = at('s02', 'overseas');
shot('B1 map', Z.s02 - 0.12, Z.s03 - 0.12, (ctx, t, lt) => {
  ST.bg(ctx, '#E9E1CE'); ctx.fillStyle = 'rgba(77,141,255,0.10)'; for (let i = 0; i < 30; i++) ctx.fillRect(0, i * 70, W, 3);
  const z = 0.86 + lt * 0.008; ctx.save(); ctx.translate(540, 920); ctx.scale(z, z);
  S.mapBoard(ctx);
  // the arrow from the USA across the ocean to Europe
  const ua = seg(t, tWork - 0.1, tOver + 0.2); if (ua > 0) { const [x0, y0] = S.mapXY('USA'), [x1, y1] = S.mapXY('FRANCE');
    ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.setLineDash([26, 20]); ctx.beginPath();
    const N = 30, k = Math.ceil(N * E.inOut(ua)); for (let i = 0; i <= k; i++) { const u = i / N, x = lerp(x0, x1, u), y = lerp(y0, y1, u) - Math.sin(u * Math.PI) * 170; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.restore(); }
  S.pennant(ctx, 'BRITAIN', PAL.navy, -260, -40, seg(t, tGB - 0.1, tGB + 0.25));
  S.pennant(ctx, 'NETHERLANDS', '#E07B2A', -150, -170, seg(t, tNL - 0.1, tNL + 0.25));
  S.pennant(ctx, 'GERMANY', PAL.cream, 140, -195, seg(t, tDE - 0.1, tDE + 0.25));
  S.pennant(ctx, 'FRANCE', PAL.blue, 120, 120, seg(t, tFR - 0.1, tFR + 0.25));
  S.pennant(ctx, 'JAPAN', C.red, 40, -150, seg(t, tJP - 0.1, tJP + 0.25));
  S.pennant(ctx, 'USA', C.yellow, -20, 150, seg(t, tAm - 0.1, tAm + 0.25));
  ctx.restore();
  label(ctx, 'THE BULB MAKERS', 540, 420, pop(t, Z.s02), { size: 58 });
  label(ctx, 'AN AMERICAN GIANT', 540, 1330, pop(t, tAm - 0.05) * (t < tOver - 0.1 ? 1 : 0), { size: 54, col: C.yellow });
  label(ctx, '...VIA ITS OVERSEAS ARMS', 540, 1330, pop(t, tOver - 0.1), { size: 50, col: C.red, fg: PAL.cream });
  ST.grade(ctx, 'day', 0.16);
});
// C1 (s03): at home, the customer reads under a bright bulb; the hours plate counts up to 2,000
const tGood = at('s03', 'good'), tTwo = at('s03', 'two'), tHours = at('s03', 'hours');
function homeShot(ctx, t, lt, o) {
  const c = cam([[0, 40, -620, o.z0], [3, 40, -640, o.z1]], lt);
  layer(ctx, c, 1, w => {
    S.home(w, t, o.dim || 0);
    w.save(); w.translate(180, -1060); S.pendant(w, 1.0, -900, o.on); w.restore();
    w.save(); w.translate(-110, 0); S.armchair(w, 1.05); w.restore();
    P.seated(w, -120, 0, 1.05, 1, CS.CUSTOMER, { chair: false, face: o.face, headTilt: o.tilt || 0,
      armN: { hand: [175, -360], grip: 'hold', item: g => S.paperNews(g, 0.8) }, armF: { hand: [150, -350], grip: 'hold' } }, {}, 235);
  });
  if (o.dim) { ctx.save(); ctx.fillStyle = `rgba(20,24,40,${0.45 * o.dim})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
}
shot('C1 home', Z.s03 - 0.12, Z.s04 - 0.12, (ctx, t, lt) => {
  homeShot(ctx, t, lt, { z0: 0.9, z1: 0.96, on: 1, face: FACE('smile', [1, -0.1], t) });
  const v = lerp(0, 2000, E.out(seg(t, tGood, tHours + 0.1)));
  ctx.save(); ctx.translate(540, 560); S.hourPlate(ctx, 0.78 * pop(t, Z.s03 + 0.1, 0.3), fmt(Math.round(v / 10) * 10), 'HOURS OF LIGHT'); ctx.restore();
  label(ctx, 'UP TO', 230, 400, pop(t, at('s03', 'up') - 0.05), { size: 46, col: C.yellow, rot: -0.06 });
  ST.grade(ctx, 'golden', 0.2);
});
// D1 (s04 "The new rule: one thousand. Max."): an executive cuts the 2,000 plate in half with giant scissors -> 1,000 + MAX stamp
const tRule = at('s04', 'rule'), tOne = at('s04', 'one'), tMax = at('s04', 'max');
shot('D1 rule', Z.s04 - 0.12, Z.s05 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -560, 0.95], [3, 0, -570, 1.0]], lt);
  layer(ctx, c, 1, w => { S.meetRoom(w, t, { window: 900 });
    P.person(w, -330, 0, 1.0, 1, CS.EXEC_B, { face: FACE(t > tOne ? 'smug' : 'squint', [1, -0.4], t), armN: { hand: [160, -400], grip: 'point' } }, CS.ACC_B); });
  const cu = seg(t, tOne + 0.05, tOne + 0.7);
  ctx.save(); ctx.translate(600, 760);
  if (t < tOne + 0.25) S.hourPlate(ctx, 0.66, '2,000', 'HOURS', { cut: cu });
  else { S.hourPlate(ctx, 0.66, '2,000', 'HOURS', { cut: cu }); const u = pop(t, tOne + 0.25); if (u > 0) { ctx.save(); ctx.scale(u, u); S.hourPlate(ctx, 0.66, '1,000', 'HOURS · MAX', { col: C.red, fg: PAL.cream, fg2: PAL.cream }); ctx.restore(); } }
  ctx.restore();
  // the scissors come down across the plate and snap shut on "one"
  const sIn = seg(t, tRule - 0.2, tOne - 0.15), open = t < tOne ? 1 - 0.3 * Math.abs(Math.sin(t * 6)) : 1 - seg(t, tOne - 0.05, tOne + 0.08);
  if (t < tOne + 0.6) { ctx.save(); ctx.translate(600, lerp(-300, 340, E.out(sIn)) + seg(t, tOne, tOne + 0.5) * -700); ctx.rotate(Math.PI / 2); S.scissors(ctx, 1.5, open); ctx.restore(); }
  label(ctx, 'THE NEW RULE', 540, 440, pop(t, tRule - 0.1), { size: 62, col: C.yellow });
  ctx.save(); ctx.translate(780, 1000); ST.stampWord(ctx, 'MAX', 110, seg(t, tMax, tMax + 0.25)); ctx.restore();
  ST.grade(ctx, 'office', 0.22);
});
// E1 (s05): Swiss Alps, the test lab; parcels of sample bulbs roll in; the technician waits with a stopwatch
const tSample = at('s05', 'sample'), tLab = at('s05', 'lab'), tSwiss = at('s05', 'switzerland');
shot('E1 lab', Z.s05 - 0.12, Z.s06 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 100, -500, 0.84], [3, 160, -500, 0.88]], lt);
  layer(ctx, c, 1, w => { S.alps(w, t); w.save(); w.translate(380, 0); S.lab(w); w.restore();
    for (let i = 0; i < 4; i++) { const u = seg(t, Z.s05 - 0.1 + i * 0.45, Z.s05 + 1.4 + i * 0.45); if (u <= 0 || u >= 1) continue; w.save(); w.translate(lerp(-1500, 300, u), 20 + Math.abs(Math.sin(u * 30)) * -10); S.parcel(w, 1.25, 'SAMPLES'); w.restore(); }
    P.person(w, -260, 0, 1.05, 1, CS.TECH, { face: FACE('squint', [1, -0.2], t), armN: { hand: [130, -390], grip: 'hold', item: g => S.stopwatch(g, 0.5, t * 4) } }); });
  label(ctx, 'SAMPLE BULBS', 540, 440, pop(t, tSample - 0.05), { size: 60, col: C.yellow });
  label(ctx, '→ A LAB IN SWITZERLAND', 540, 560, pop(t, tLab - 0.1), { size: 48 });
  ST.grade(ctx, 'day', 0.2);
});
// F1 (s06 "Bulb lasted too long?"): the test bench: the bulbs burn out at 1,000 hours... one keeps shining
const tThe6 = at('s06', 'the'), tFine = at('s06', 'fine'), tPaid = at('s06', 'paid');
shot('F1 bench', Z.s06 - 0.12, tThe6 - 0.12, (ctx, t, lt) => {
  ST.bg(ctx, '#DCE6EE'); ctx.fillStyle = 'rgba(46,58,89,0.08)'; for (let i = 0; i < 14; i++) ctx.fillRect(i * 90, 0, 40, H);
  const z = 0.68 + lt * 0.02; ctx.save(); ctx.translate(540, 1240); ctx.scale(z, z);
  const on = [0, 1, 2, 3].map(i => t > Z.s06 + 0.15 + i * 0.22 ? -1 : 1).concat([1]);
  S.testRack(ctx, on, [['1,000 h'], ['1,000 h'], ['1,000 h'], ['1,000 h'], ['STILL ON', C.red, PAL.cream]]); ctx.restore();
  ctx.save(); ctx.translate(250, 600); S.stopwatch(ctx, 1.3, t * 5); ctx.restore();
  label(ctx, 'TOO LONG?', 680, 600, pop(t, at('s06', 'too') - 0.05), { size: 70, col: C.yellow, rot: 0.04, arrow: 1, arrowX: 120 });
  ST.grade(ctx, 'office', 0.18);
});
// F2 (s06 "The factory paid a fine."): the factory owner hands over the money, FINED stamp
shot('F2 fine', tThe6 - 0.12, Z.s07 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -600, 0.92], [2, 0, -610, 0.98]], lt);
  layer(ctx, c, 1, w => { S.office(w, t);
    P.person(w, -300, 0, 1.05, 1, CS.OWNER, { face: FACE('worried', [1, 0], t), armN: { hand: [175, -330], grip: 'pinch', item: g => S.note(g, 0.5) } }, CS.ACC_OWNER);
    P.person(w, 330, 0, 1.05, -1, CS.TECH, { face: FACE('skeptical', [1, 0], t), armN: { hand: [150, -320], grip: 'open' } });
    for (let i = 0; i < 6; i++) { const u = seg(t, tPaid - 0.2 + i * 0.12, tPaid + 0.25 + i * 0.12); if (u <= 0) continue; w.save(); w.translate(lerp(-110, 150, u), -330 - Math.sin(u * Math.PI) * 120 - (u >= 1 ? i * 12 : 0)); S.note(w, 0.4, (hash(i) - 0.5) * 0.4); w.restore(); } });
  ctx.save(); ctx.translate(540, 640); ST.stampWord(ctx, 'FINED', 140, seg(t, tFine - 0.05, tFine + 0.2)); ctx.restore();
  ST.grade(ctx, 'office', 0.2);
});
// G1 (s07): "And it worked." — the chart of average bulb life drops: 1,800 h (1926) -> 1,205 h (1933)
const tWorked = at('s07', 'worked'), tReal = at('s07', 'real'), tThird = at('s07', 'third');
shot('G1 chart', Z.s07 - 0.12, Z.s08 - 0.12, (ctx, t, lt) => {
  ST.bg(ctx, '#5E7A8C'); ctx.fillStyle = 'rgba(255,255,255,0.06)'; for (let i = 0; i < 20; i++) ctx.fillRect(0, i * 100, W, 40);
  const z = 0.9 + lt * 0.01; ctx.save(); ctx.translate(540 + shake(t, tThird + 0.1, 8), 880); ctx.scale(z, z); S.chart(ctx, seg(t, tReal - 0.1, tThird), { endU: pop(t, tThird) }); ctx.restore();
  label(ctx, 'IT WORKED', 540, 400, pop(t, tWorked - 0.1), { size: 62, col: C.yellow });
  label(ctx, 'ABOUT 1/3 LESS', 540, 1340, pop(t, tThird), { size: 76, col: C.red, fg: PAL.cream });
  ST.grade(ctx, 'office', 0.2);
});
// H1 (s08): the twist: COST column drops, PRICE stays, the money bag grows in the gap
const tTwist = at('s08', 'twist'), tCheap = at('s08', 'cheaper'), tPrices = at('s08', 'prices'), tMoved = at('s08', 'moved');
shot('H1 twist', Z.s08 - 0.12, Z.s09 - 0.12, (ctx, t, lt) => {
  ST.bg(ctx, PAL.paper); ctx.fillStyle = 'rgba(77,141,255,0.12)'; for (let i = 0; i < 30; i++) ctx.fillRect(0, i * 70, W, 3);
  const base = 1330, hc = lerp(560, 240, E.inOut(seg(t, tCheap - 0.1, tCheap + 0.5))), hp = 560 + Math.sin(t * 9) * 4 * seg(t, tPrices, tPrices + 0.3);
  const tB8 = at('s08', 'bulbs'), cu = pop(t, tB8 - 0.1), pu = pop(t, tB8 + 0.15);
  if (cu > 0) { ctx.save(); ctx.translate(200, base); CL.cutout(ctx, () => rr(ctx, -110, -hc * cu, 220, hc * cu, 12), PAL.blue, { elev: 1.4 }); ctx.restore(); label(ctx, 'COST', 200, base - hc - 60, cu, { size: 54 });
    if (t > tCheap) { ctx.save(); ctx.translate(200, base - hc - 170); ctx.globalAlpha = seg(t, tCheap, tCheap + 0.2); ctx.fillStyle = C.red; ctx.beginPath(); ctx.moveTo(-36, -50); ctx.lineTo(36, -50); ctx.lineTo(36, 0); ctx.lineTo(70, 0); ctx.lineTo(0, 70); ctx.lineTo(-70, 0); ctx.lineTo(-36, 0); ctx.closePath(); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = R.INK; ctx.stroke(); ctx.restore(); } }
  if (pu > 0) { ctx.save(); ctx.translate(820, base); CL.cutout(ctx, () => rr(ctx, -110, -hp * pu, 220, hp * pu, 12), C.red, { elev: 1.4 }); ctx.restore(); label(ctx, 'PRICE', 820, base - hp - 60, pu, { size: 54 }); }
  const mb = E.back(seg(t, tMoved - 0.2, tMoved + 0.4), 1.8); if (mb > 0) { ctx.save(); ctx.translate(510, base); S.moneyBag(ctx, 1.05 * mb); ctx.restore(); label(ctx, 'THE GAP = PROFIT', 510, base - 360 * mb - 40, pop(t, tMoved + 0.2), { size: 44, col: C.yellow }); }
  label(ctx, "HERE'S THE TWIST", 540, 440, pop(t, tTwist - 0.15), { size: 64, col: C.yellow });
  if (t > tPrices) label(ctx, 'BARELY MOVED', 790, 560, pop(t, at('s08', 'barely') - 0.05), { size: 44, rot: 0.04 });
  ST.grade(ctx, 'day', 0.15);
});
// I1 (s09): the shop: the customer buys a bulb again... and again; the register rings each time
const tBuy = [at('s09', 'every'), at('s09', 'burns'), at('s09', 'buy')], tAgain = at('s09', 'again');
shot('I1 shop', Z.s09 - 0.12, Z.s10 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -600, 0.92], [3, 20, -610, 0.98]], lt), n = tBuy.filter(x => t > x).length;
  const reach = Math.max(...tBuy.map(x => Math.max(0, 1 - Math.abs(t - x - 0.15) / 0.3)));
  layer(ctx, c, 1, w => { S.shop(w, t);
    P.person(w, 400, 0, 1.0, -1, CS.CLERK, { face: FACE('smile', [1, 0], t) }, { tie: '#B5304A' });
    SE.desk(w, 230, 640, -320, '#8A5A34');
    w.save(); w.translate(90, -320); S.register(w, 0.85, n ? Math.max(0, 1 - (t - tBuy[n - 1]) * 3) : 0, n ? 'SOLD ×' + n : ''); w.restore();
    P.person(w, -330, 0, 1.0, 1, CS.CUSTOMER, { face: FACE(n >= 3 ? 'tired' : 'neutral', [1, 0.2], t), armN: { hand: [lerp(120, 205, reach), lerp(-300, -350, reach)], grip: 'hold', item: g => S.bulb(g, 0.28, {}) } });
    w.save(); w.translate(-130, 0); for (let i = 0; i < n; i++) { w.save(); w.translate(-40 + i * 50, -10 - (i % 2) * 20); w.rotate(1.2 + i); S.bulb(w, 0.24, { burnt: true }); w.restore(); } w.restore(); });
  label(ctx, 'BURNS OUT → BUY AGAIN', 540, 440, pop(t, tAgain - 0.1), { size: 54, col: C.yellow });
  ST.grade(ctx, 'golden', 0.2);
});
// J1 (s10 "The deal only died in 1940, when war tore it apart."): the agreement tears in two; 1940
const tDied = at('s10', 'died'), t1940 = at('s10', '1940'), tTore = at('s10', 'tore'), tYour = at('s10', 'your'), tBurn = at('s10', 'burn'), tIt2 = at('s10', 'it', 1), tSched = at('s10', 'scheduled');
shot('J1 1940', Z.s10 - 0.12, tYour - 0.12, (ctx, t, lt) => {
  ST.bg(ctx, '#4A5058'); ctx.fillStyle = 'rgba(255,255,255,0.05)'; for (let i = 0; i < 20; i++) ctx.fillRect(0, i * 100, W, 40);
  ctx.save(); ctx.translate(540 + shake(t, tTore, 12), 1060); ctx.rotate(0.02); S.agreement(ctx, 0.92, { stamp: 1, tear: seg(t, tTore - 0.05, tTore + 0.6) }); ctx.restore();
  const u = pop(t, t1940 - 0.1); if (u > 0) { ctx.save(); ctx.translate(540, 560); ctx.scale(u, u); ctx.rotate(-0.04); ST.calCard(ctx, 'THE END', '1940', { w: 400, h: 330 }); ctx.restore(); }
  label(ctx, 'WAR', 820, 820, pop(t, at('s10', 'war') - 0.05), { size: 64, col: C.red, fg: PAL.cream, rot: 0.08 });
  ST.grade(ctx, 'office', 0.24);
});
// J2 (s10 "Your bulb didn't just burn out."): back home: the bulb pops; the room goes dark; she looks up
shot('J2 pop', tYour - 0.12, tIt2 - 0.12, (ctx, t, lt) => {
  const off = seg(t, tBurn + 0.05, tBurn + 0.15), fl = t > tBurn - 0.3 && t < tBurn + 0.05 ? (Math.sin(t * 60) > 0 ? 1 : 0.3) : 1;
  homeShot(ctx, t, lt, { z0: 1.0, z1: 1.05, on: (1 - off) * fl, dim: off, face: FACE(off > 0.5 ? 'surprised' : 'smile', [0.5, -1], t), tilt: off > 0.5 ? -0.12 : 0 });
  ST.grade(ctx, 'golden', 0.24);
});
// J3 (s10 "It was scheduled to."): the dead bulb, the SCHEDULED stamp; she looks at us
shot('J3 scheduled', tIt2 - 0.12, tEnd, (ctx, t, lt) => {
  const c = cam([[0, 180, -900, 1.2], [2, 180, -920, 1.28]], lt);
  layer(ctx, c, 1, w => { S.home(w, t, 1); w.save(); w.translate(180, -1060); S.pendant(w, 1.0, -900, 0); w.restore(); });
  ctx.save(); ctx.fillStyle = 'rgba(20,24,40,0.45)'; ctx.fillRect(0, 0, W, H); ctx.restore();
  P.personBust(ctx, 540, 1490, 1.1, CS.CUSTOMER, { face: FACE('skeptical', [0, 0], t) });
  ctx.save(); ctx.translate(540, 880); ST.stampWord(ctx, 'SCHEDULED', 104, seg(t, tSched - 0.05, tSched + 0.2)); ctx.restore();
  ST.grade(ctx, 'office', 0.24);
});
// K (end card, 2 s+): the handshake over the pile again (echo of frame 0) + the question
shot('K end', tEnd, T + 0.01, (ctx, t, lt) => { handshake(ctx, t, lt + 4, 1.08, 1.1); ST.grade(ctx, 'office', 0.22); }, { type: 'cut' });

// ---------- edit, overlays, subtitles ----------
SH.sort((a, b) => a.t0 - b.t0);
const ED = makeEdit(SH, W, H);
const SPLIT = { s01: [7, 4, 4], s02: [5, 4, 4, 5], s03: [5, 7], s04: [3, 3], s05: [5, 5], s06: [4, 5], s07: [3, 8], s08: [3, 5, 4], s09: [6, 6], s10: [6, 5, 6, 4] };
const REPL = [[/two thousand hours/, '2,000 hours'], [/one thousand\./, '1,000.']];
function subs() {
  const G = [];
  Object.keys(Z).forEach(id => { const ws = V.words(id); let k0 = 0; SPLIT[id].forEach(n => { G.push({ id, words: ws.slice(k0, k0 + n) }); k0 += n; }); if (k0 !== ws.length) throw new Error(`subtitle split ${id}: ${k0} vs ${ws.length}`); });
  G.forEach((g, i) => { const nx = G[i + 1], e0 = Math.min(g.words[g.words.length - 1].t1, end(g.id)) + 0.4; g.t0 = g.words[0].t0 - 0.05;
    g.t1 = nx ? (nx.id === g.id ? nx.words[0].t0 - 0.05 : Math.min(e0, nx.words[0].t0 - 0.05)) : Math.min(e0, tEnd);
    let s = g.words.map(x => x.w).join(' '); for (const [a, b] of REPL) s = s.replace(a, b); g.text = s; });
  return G;
}
const SUBS = subs();
const HL = ['1924', 'secret', 'worse', 'american', '2000', '1000', 'max', 'switzerland', 'fine', 'third', 'twist', 'cheaper', 'barely', 'again', '1940', 'scheduled'];
function frame(ctx, t, o = {}) {
  ED.frame(ctx, t);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); overlays(ctx, t); ctx.restore();
  ST.paper(ctx);
  if (!o.nosubs) EN.drawSubtitles(ctx, t, SUBS, { ...ST.SUBS, highlight: HL });
}

// ---------- sound cues (for mix.py) ----------
function cues() {
  const c = [['slam', 0.0, 2.0], ['ding', 0.02, 1.4], ['pop', 0.1, 1.2], ['clink', 0.5, 0.6], ['clink', 1.3, 0.5]];
  c.push(['cut', tSecret - 0.12, 0.35], ['stamp', tSecret + 0.1, 0.9], ['cut', tMake - 0.12, 0.35], ['pop', tMake - 0.05, 0.5], ['buzz', tBulb1, 0.5], ['buzz', tBulb1 + 0.4, 0.4], ['thump', tWorse + 0.05, 0.8]);
  c.push(['cut', Z.s02 - 0.12, 0.35], ['pop', Z.s02, 0.4]); for (const x of [tDE, tNL, tFR, tGB, tJP, tAm]) c.push(['pop', x - 0.08, 0.5]); c.push(['whoosh', tWork - 0.1, 0.45], ['pop', tOver - 0.1, 0.45]);
  c.push(['cut', Z.s03 - 0.12, 0.35], ['click', Z.s03, 0.6], ['hum', Z.s03, 0.6]); for (let i = 0; i < 10; i++) c.push(['tick', tGood + i * ((tHours - tGood) / 10), 0.5]); c.push(['ding', tHours + 0.1, 0.6]);
  c.push(['cut', Z.s04 - 0.12, 0.35], ['pop', tRule - 0.1, 0.5], ['snip', tOne, 0.9], ['fall', tOne + 0.15, 0.6], ['pop', tOne + 0.25, 0.5], ['stamp', tMax + 0.05, 0.9]);
  c.push(['cut', Z.s05 - 0.12, 0.35]); for (let i = 0; i < 4; i++) c.push(['thump', Z.s05 + 1.4 + i * 0.45, 0.25]); c.push(['pop', tSample - 0.05, 0.4], ['pop', tLab - 0.1, 0.4]);
  c.push(['cut', Z.s06 - 0.12, 0.35]); for (let i = 0; i < 4; i++) c.push(['click', Z.s06 + 0.15 + i * 0.22, 0.7]); c.push(['pop', at('s06', 'too') - 0.05, 0.5]);
  c.push(['cut', tThe6 - 0.12, 0.35], ['paper', tPaid - 0.2, 0.5], ['paper', tPaid, 0.5], ['paper', tPaid + 0.25, 0.5], ['stamp', tFine + 0.05, 1.0]);
  c.push(['cut', Z.s07 - 0.12, 0.35], ['pop', tWorked - 0.1, 0.5], ['fall', tReal, 0.5], ['stamp', tThird + 0.05, 0.8]);
  c.push(['cut', Z.s08 - 0.12, 0.35], ['pop', tTwist - 0.15, 0.5], ['fall', tCheap, 0.5], ['pop', tPrices - 0.15, 0.4], ['coins', tMoved, 0.7], ['kaching', tMoved + 0.2, 0.5]);
  c.push(['cut', Z.s09 - 0.12, 0.35]); for (const x of tBuy) c.push(['kaching', x + 0.15, 0.45]); c.push(['pop', tAgain - 0.1, 0.45]);
  c.push(['cut', Z.s10 - 0.12, 0.35], ['pop', t1940 - 0.1, 0.6], ['boom', tTore - 0.3, 0.5], ['tear', tTore, 0.9]);
  c.push(['cut', tYour - 0.12, 0.35], ['buzz', tBurn - 0.3, 0.4], ['balloonpop', tBurn + 0.05, 0.6], ['cut', tIt2 - 0.12, 0.3], ['stamp', tSched + 0.05, 1.0]);
  c.push(['cut', tEnd, 0.4], ['pop', tEnd + 0.05, 0.6], ['blip', tEnd + 0.4, 0.4]);
  return c;
}
const MUSIC = { b0: 0, map: Z.s02, rule: Z.s03, lab: Z.s05, worked: Z.s07, twist: Z.s08, end10: Z.s10, hit: tEnd, end: T };

// ---------- CLI ----------
const [mode, a1, a2, a3] = process.argv.slice(2);
if (mode === 'cues') { fs.writeFileSync(`${__dirname}/cues.json`, JSON.stringify({ T, vo: Object.entries(Z), sfx: cues(), music: MUSIC })); console.log('cues ok, T =', T); }
else if (mode === 'srt') {
  const f = s => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  fs.writeFileSync(a1, SUBS.map((g, i) => `${i + 1}\n${f(g.t0)} --> ${f(g.t1)}\n${g.text}\n`).join('\n')); console.log('srt ok', SUBS.length);
}
else if (mode === 'still') {
  const ts = a1.split(',').map(Number), tw = 270, th = 480, cols = Math.min(ts.length, 8), rows = Math.ceil(ts.length / cols);
  const sheet = createCanvas(tw * cols, th * rows), sc = sheet.getContext('2d'), cv = createCanvas(W, H), ctx = cv.getContext('2d');
  ts.forEach((t, i) => { frame(ctx, t); sc.drawImage(cv, (i % cols) * tw, Math.floor(i / cols) * th, tw, th); sc.fillStyle = '#E63946'; sc.font = '20px sans-serif'; sc.fillText(t.toFixed(2), (i % cols) * tw + 6, Math.floor(i / cols) * th + 22); });
  fs.writeFileSync(a2, sheet.toBuffer('image/png'));
} else if (mode === 'frame') { const cv = createCanvas(W, H), ctx = cv.getContext('2d'); frame(ctx, +a1, { nosubs: a3 === 'nosubs' }); fs.writeFileSync(a2, cv.toBuffer('image/png')); }
else if (mode === 'carousel') {
  const KEY = [['01_hook', 0.8], ['02_2000_hours', tHours + 0.5], ['03_1000_max', tMax + 0.4], ['04_fined', tFine + 0.4], ['05_twist_profit', tMoved + 0.6], ['06_question', tEnd + 1.0]];
  fs.mkdirSync(a1, { recursive: true }); const cv = createCanvas(W, H), ctx = cv.getContext('2d');
  for (const [n, t] of KEY) { frame(ctx, t, { nosubs: true }); fs.writeFileSync(`${a1}/${n}.png`, cv.toBuffer('image/png')); } console.log('carousel ok', KEY.map(k => k[1].toFixed(2)).join(' '));
}
else if (mode === 'shots') console.log(SH.map(s => `${s.id}\t${s.t0.toFixed(2)}–${s.t1.toFixed(2)}\t${(s.t1 - s.t0).toFixed(2)}s`).join('\n') + `\nT = ${T}`);
else if (mode === 'video') (async () => {
  const cv = createCanvas(W, H), ctx = cv.getContext('2d');
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', a1], { stdio: ['pipe', 'inherit', 'inherit'] });
  const N = Math.round(T * FPS), T0 = Date.now();
  for (let f = 0; f < N; f++) { frame(ctx, f / FPS); const buf = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); if (f % 150 === 0) process.stderr.write(`${f}/${N} ${((Date.now() - T0) / 1000).toFixed(0)}s\n`); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
})();
module.exports = { T, ST: Z, SH };
