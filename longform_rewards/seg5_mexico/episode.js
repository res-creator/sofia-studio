process.env.HIR_WIDE = '1';
// Long-form "When Paying People Backfired" — CHAPTER 5 · MEXICO CITY, 1989 · The License Plates (16:9, 1920x1080, 30 fps).
// Nov 20, 1989: "Hoy No Circula" keeps most cars home one weekday a week by the last digit of the plate; the aim: ~1 car in 5 off the road
// every weekday; some families bought a second (often older, dirtier) car with a different last digit; economist Lucas Davis (JPE 2008)
// found no evidence of cleaner air and evidence of more vehicles in use. Look: howitsrun_style (thin full-body profile people, flat sets,
// paper plates, stamps). Respectful, generic Mexican townspeople in normal proportions; Davis = a name on a paper.
// Usage: node episode.js cues | srt out.srt | still t1,t2,... out.png | frame t out.png [nosubs] | video out.mp4 | shots
const { createCanvas } = require('@napi-rs/canvas');
const { spawn } = require('child_process');
const fs = require('fs');
const K = require('../../tests/mcd_collage/kit');
const EN = require('../../mcd_ep1/engine');            // voice timings + subtitle drawing only (read-only use)
const R = require('../../hirkit/rig');
const LT = require('../../hirkit/light');
const CL = require('../../hirkit/collage');
const { makeEdit } = require('../../hirkit/edit');
const ST = require('../../howitsrun_style/style');
const S = require('./mexkit');
const { C, F, clamp, lerp, seg, E, rr, hash } = K;
const { W, H, FPS, PAL, layer, cam, shake, pop, blink, label, txt, fitTxt } = ST;

// ---------- voice timeline: chapter card 0–3 s, first line at 3.0 s, 0.7 s between lines, end = last voice end + 0.6 s ----------
const LINES = JSON.parse(fs.readFileSync(`${__dirname}/script.json`));
const SP = JSON.parse(fs.readFileSync(`${__dirname}/vo/speech.json`));
const GAP = 0.7;
const Z = {}; let T = 3.0; for (const L of LINES) { Z[L.id] = +(T - SP[L.id][0]).toFixed(3); T += SP[L.id][1] - SP[L.id][0] + GAP; }
const V = EN.voice(`${__dirname}/vo`, Z), at = (id, w, n = 0) => V.at(id, w, n), end = id => Z[id] + SP[id][1];
const LAST = LINES[LINES.length - 1].id, tEnd = end(LAST);
T = +(tEnd + 0.6).toFixed(2);

// ---------- helpers ----------
const FACE = (n, look = [1, 0], t = 0, o = 0) => R.expr(n, { look, blink: blink(t, 3.2, o) });
const camFloor = (x, z, floorY = 880) => ({ x, y: -(floorY - H / 2) / z, z });  // world floor (y 0) lands at screen floorY
const keysAt = (arr) => arr.map(([t, x, z, fy]) => { const c = camFloor(x, z, fy); return [t, c.x, c.y, c.z]; });
const sparkle = (ctx, x, y, u) => { if (u <= 0 || u >= 1) return; for (let i = 0; i < 5; i++) { const a = i / 5 * 6.28 + 0.4, r = 30 + E.out(u) * 70; K.sparkle(ctx, x + Math.cos(a) * r, y + Math.sin(a) * r, 18 * (1 - u)); } };
const TRAFFIC = ['#C94F3D', '#4D8DFF', '#2FA37E', '#E8B04A', '#7A6A9A', '#E9EDF0', '#5A606B', '#3E8A5A', '#D9785A'];
const KINDS = ['sedan', 'bug', 'sedan', 'old', 'bug', 'sedan', 'sedan', 'bug', 'old'];

// ================= SHOTS =================
const SH = []; const shot = (id, t0, t1, draw, out) => SH.push({ id, t0, t1, draw, out });

// CARD (0–3 s, no voice): CHAPTER 5 · The License Plates · MEXICO CITY · 1989; a little car rolls in
shot('CARD', 0, Z.s01, (ctx, t, lt) => {
  S.chapterCard(ctx, t, 'CHAPTER 5', 'The License Plates', 'MEXICO CITY · 1989', (g, tt) => {
    const u = E.out(seg(tt, 0.2, 1.3)); g.save(); g.translate(lerp(-700, 0, u), 0); g.scale(0.34, 0.34); S.car(g, { col: '#2FA37E', kind: 'bug', plate: 'LMX 213', rot: u * 8, smoke: u < 1 ? tt : undefined }); g.restore();
  });
  ST.grade(ctx, 'day', 0.15);
});

// A1 (s01 "Sometimes it isn't a reward at all. It's a rule. Same trap."): a parked car on a street; REWARD? gets an X; A RULE; SAME TRAP
const tReward = at('s01', 'reward'), tAll = at('s01', 'all'), tRule1 = at('s01', 'rule'), tSame = at('s01', 'same');
shot('A1 rule', Z.s01, Z.s02 - 0.12, (ctx, t, lt) => {
  const c = cam(keysAt([[0, 80, 0.85, 680], [4.6, 120, 0.92, 680]]), lt);
  layer(ctx, c, 1, w => { S.street(w, t, {}); w.save(); w.translate(120, 200); S.car(w, { col: '#C94F3D', plate: 'LMX 213' }); w.restore();
    S.person(w, -560, 40, 0.95, 1, S.LK.walker, { ...R.walk(t * 4), face: FACE('neutral', [1, 0], t) }); });
  // REWARD? (a coin) -> X ; A RULE (a rule sign) ; SAME TRAP
  const ru = pop(t, tReward - 0.08); if (ru > 0) { ctx.save(); ctx.translate(720, 270); ctx.scale(ru, ru); ctx.translate(0, -10); CL.coin(ctx, 70); ctx.restore(); label(ctx, 'REWARD?', 720, 410, ru, { size: 60 });
    ctx.save(); ctx.translate(720, 330); ST.bigX(ctx, 120, seg(t, tAll - 0.1, tAll + 0.2)); ctx.restore(); }
  label(ctx, 'A RULE', 1300, 300, pop(t, tRule1 - 0.08), { size: 90, col: C.yellow, rot: 0.03 });
  label(ctx, 'SAME TRAP', 1300, 470, pop(t, tSame - 0.08), { size: 70, col: C.red, fg: PAL.cream, rot: -0.04 });
  ST.grade(ctx, 'day', 0.18);
});

// B1 (s02 "In November 1989,"): the calendar card over the hazy city
const tMexico = at('s02', 'mexico'), tClean = at('s02', 'clean'), tAir2 = at('s02', 'air'), tSimple = at('s02', 'simple'), tOne2 = at('s02', 'one'), tStays = at('s02', 'stays'), tHome = at('s02', 'home');
const tDecided = at('s02', 'decided'), tLast2 = at('s02', 'last'), tDigit = at('s02', 'digit'), tPlate2 = at('s02', 'plate');
shot('B1 november', Z.s02 - 0.12, tMexico - 0.12, (ctx, t, lt) => {
  const c = cam(keysAt([[0, 0, 0.55, 760], [2, 30, 0.57, 760]]), lt);
  layer(ctx, c, 1, w => S.city(w, t, {}));
  ctx.save(); ctx.translate(W / 2, 450); ctx.rotate(-0.03); const u = pop(t, Z.s02 - 0.1, 0.35); ctx.scale(u * 1.1, u * 1.1); if (u > 0) ST.calCard(ctx, 'NOV 1989', '20'); ctx.restore();
  label(ctx, 'NOV 20, 1989', W / 2, 760, pop(t, at('s02', '1989') - 0.05), { size: 54, col: C.yellow });
  ST.grade(ctx, 'golden', 0.18);
});
// B2 ("Mexico City tried to clean up its air"): the wide smoggy skyline, traffic below; MEXICO CITY; CLEAN UP THE AIR
shot('B2 city', tMexico - 0.12, tSimple - 0.25, (ctx, t, lt) => {
  const c = cam(keysAt([[0, -300, 0.6, 640], [3, 100, 0.64, 640]]), lt);
  layer(ctx, c, 1, w => { S.city(w, t, { smog: 1 });
    w.fillStyle = '#6A6E76'; w.fillRect(-6000, 60, 12000, 400); w.fillStyle = '#E9D36A'; for (let x = -6000; x < 6000; x += 260) w.fillRect(x, 250, 140, 12);
    for (let i = 0; i < 16; i++) { const x = ((t * 260 + i * 520) % 8000) - 4000; w.save(); w.translate(x, 210 + (i % 2) * 160); w.scale(0.5, 0.5); S.car(w, { col: TRAFFIC[i % 9], kind: KINDS[i % 9], rot: t * 6, smoke: t + i }); w.restore(); } });
  label(ctx, 'MEXICO CITY', 520, 170, pop(t, tMexico - 0.05), { size: 74 });
  label(ctx, 'CLEAN UP THE AIR', 1360, 300, pop(t, tClean - 0.05), { size: 64, col: C.yellow, rot: 0.03 });
  ST.grade(ctx, 'golden', 0.2);
});
// B3 ("with a simple rule: one weekday a week, your car stays home"): the family car parked, NOT TODAY tag; the dad walks off
shot('B3 stays home', tSimple - 0.25, tDecided - 0.12, (ctx, t, lt) => {
  const c = cam(keysAt([[0, 0, 0.85, 680], [3.5, 60, 0.9, 680]]), lt);
  const tagged = t > tStays - 0.1;
  layer(ctx, c, 1, w => { S.street(w, t, {}); w.save(); w.translate(200, 200); S.car(w, { col: '#2FA37E', kind: 'bug', plate: 'LMX 213', tag: tagged ? 'NOT TODAY' : null }); w.restore();
    const wk = seg(t, tStays, tStays + 3); S.person(w, -420 - wk * 500, 40, 0.95, -1, S.LK.dad, { ...(wk > 0 ? R.walk(t * 4.2) : {}), face: FACE(wk > 0 ? 'tired' : 'neutral', [1, 0], t), armN: { hand: [40, -230], grip: 'hold', item: S.briefcase } }); });
  label(ctx, 'A SIMPLE RULE', 560, 170, pop(t, tSimple - 0.05), { size: 64 });
  label(ctx, '1 WEEKDAY A WEEK', 1340, 170, pop(t, tOne2 - 0.05), { size: 60, col: C.yellow, rot: 0.03 });
  label(ctx, 'YOUR CAR STAYS HOME', 1180, 330, pop(t, tHome - 0.1), { size: 56, col: C.red, fg: PAL.cream, rot: -0.03 });
  ST.grade(ctx, 'day', 0.18);
});
// B4 ("decided by the last digit of your license plate"): Mon–Fri cards with the digit pairs; the plate, last digit circled -> WED
shot('B4 week', tDecided - 0.12, Z.s03 - 0.12, (ctx, t, lt) => {
  ST.bg(ctx, '#E5DCC8'); ctx.fillStyle = 'rgba(120,90,50,0.07)'; for (let i = 0; i < 30; i++) ctx.fillRect(0, i * 40, W, 3);
  label(ctx, 'NO-DRIVING DAY', W / 2, 140, pop(t, tDecided - 0.1), { size: 60 });
  ctx.save(); ctx.translate(W / 2, 430); ctx.scale(1.0 + lt * 0.01, 1.0 + lt * 0.01);
  S.weekCards(ctx, [0, 1, 2, 3, 4].map(i => seg(t, tDecided + i * 0.14, tDecided + i * 0.14 + 0.3)), { hl: t > tDigit + 0.5 ? 2 : -1 }); ctx.restore();
  const pu = pop(t, tLast2 - 0.1, 0.35); if (pu > 0) { ctx.save(); ctx.translate(W / 2, 760); ctx.scale(pu, pu); S.plate(ctx, 'LMX 213', 1, { hl: seg(t, tDigit, tDigit + 0.4), rot: -0.02 }); ctx.restore(); }
  ST.grade(ctx, 'day', 0.14);
});

// C1 (s03 "The idea: take about one car in five off the road every weekday."): the jam; every fifth car lifts off; 1 IN 5
const tIdea = at('s03', 'idea'), tOne3 = at('s03', 'one'), tFive = at('s03', 'five'), tOff = at('s03', 'off'), tEvery = at('s03', 'every');
shot('C1 one in five', Z.s03 - 0.12, Z.s04 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -40, 0.5], [3.6, 60, -40, 0.52]], lt);
  layer(ctx, c, 1, w => { S.street(w, t, { dash: t * 30 });
    for (const [lane, y] of [[0, 210], [1, 520]]) for (let i = 0; i < 9; i++) {
      const x = -2300 + i * 600 + lane * 260 + t * 30, five = (i + lane * 2) % 5 === 2, u = five ? E.inOut(seg(t, tOne3 + (i * 0.11), tOne3 + i * 0.11 + 1.0)) : 0;
      w.save(); w.translate(x, y - u * 1300); w.globalAlpha *= 1 - seg(u, 0.75, 1); S.car(w, { col: TRAFFIC[(i + lane * 4) % 9], kind: KINDS[(i + lane * 3) % 9], plate: lane ? null : 'ABC 12' + (i % 10), lift: u > 0 ? 1 : 0, rot: t * 0.5 }); w.restore();
      if (five) sparkle(w, x, y - 150, seg(t, tOne3 + i * 0.11, tOne3 + i * 0.11 + 0.6)); } });
  label(ctx, 'THE IDEA', 380, 150, pop(t, Z.s03), { size: 56 });
  const u = pop(t, tFive - 0.1, 0.35); if (u > 0) { ctx.save(); ctx.translate(1450, 190); ctx.scale(u * 0.95, u * 0.95); S.plate(ctx, '1 IN 5', 1, { top: 'OFF THE ROAD', rot: 0.03 }); ctx.restore(); }
  label(ctx, 'EVERY WEEKDAY', 1450, 360, pop(t, tEvery - 0.05), { size: 52, col: C.yellow });
  ST.grade(ctx, 'day', 0.16);
});

// D1 (s04 "But people still had to get to work."): the dad by his tagged car, briefcase, watch: 8:00
const tWork = at('s04', 'work'), tSo4 = at('s04', 'so'), tFamilies = at('s04', 'families'), tSecond = at('s04', 'second'), tDifferent = at('s04', 'different'), tLast4 = at('s04', 'last');
const tOften = at('s04', 'often'), tOlder = at('s04', 'older'), tCheaper = at('s04', 'cheaper'), tPolluted = at('s04', 'polluted');
shot('D1 work', Z.s04 - 0.12, tSo4 - 0.12, (ctx, t, lt) => {
  const c = cam(keysAt([[0, -60, 0.95, 660], [2, -40, 1.0, 660]]), lt);
  layer(ctx, c, 1, w => { S.street(w, t, {}); w.save(); w.translate(220, 200); S.car(w, { col: '#2FA37E', kind: 'bug', plate: 'LMX 213', tag: 'NOT TODAY' }); w.restore();
    S.person(w, -380, 40, 1.0, 1, S.LK.dad, { face: FACE('worried', [1, 0.2], t), headTilt: 0.05, armN: { hand: [40, -230], grip: 'hold', item: S.briefcase }, armF: { hand: [70, -330], grip: 'open' } }); });
  label(ctx, 'STILL HAD TO GET TO WORK', W / 2, 160, pop(t, tWork - 0.25), { size: 60, col: C.yellow });
  ctx.save(); ctx.translate(380, 380); const u = pop(t, Z.s04 + 0.1); ctx.scale(u, u); if (u > 0) { CL.cutout(ctx, () => { ctx.beginPath(); ctx.arc(0, 0, 90, 0, 7); }, PAL.cream, { elev: 1.4 });
    ctx.strokeStyle = R.INK; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -62); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(-2.6 + lt * 0.4) * 46, Math.sin(-2.6 + lt * 0.4) * 46); ctx.stroke(); } ctx.restore();
  ST.grade(ctx, 'day', 0.18);
});
// D2 ("So some families bought a second car — with a different last digit."): the used-car lot; the family by an old car; plates …3 / …8
shot('D2 car lot', tSo4 - 0.12, tOften - 0.12, (ctx, t, lt) => {
  const c = cam(keysAt([[0, 60, 0.88, 690], [4, 120, 0.92, 680]]), lt);
  layer(ctx, c, 1, w => { S.carLot(w, t, { office: 760 });
    w.save(); w.translate(450, 180); S.car(w, { col: '#4F8A8B', kind: 'old', plate: 'RTV 478', tag: t > tSecond ? 'SOLD' : 'CHEAP', tagCol: t > tSecond ? C.red : C.yellow }); w.restore();
    S.person(w, -650, 180, 1.0, 1, S.LK.dad, { face: FACE(t > tDifferent ? 'smile' : 'thinking', [1, 0], t), armN: { hand: [150, -330], grip: 'point' } }, { stache: '#241A14' });
    S.person(w, -330, 180, 0.95, 1, S.LK.mom, { face: FACE('smile', [1, -0.1], t, 1), armN: { hand: [60, -240], grip: 'relax' } });
    S.person(w, -110, 180, 0.62, 1, S.LK.kid, { face: FACE('grin', [1, -0.4], t, 2), armN: { hand: [110, -380], grip: 'open' } }); });
  label(ctx, 'A SECOND CAR', 470, 150, pop(t, tSecond - 0.08), { size: 64, col: C.yellow });
  const u1 = pop(t, tDifferent - 0.1, 0.35), u2 = pop(t, tLast4 - 0.1, 0.35);
  if (u1 > 0) { ctx.save(); ctx.translate(1000, 400); ctx.scale(u1 * 0.8, u1 * 0.8); S.plate(ctx, '…3', 1, { top: 'CAR 1', rot: -0.04 }); ctx.restore(); }
  if (u2 > 0) { ctx.save(); ctx.translate(1380, 400); ctx.scale(u2 * 0.8, u2 * 0.8); S.plate(ctx, '…8', 1, { top: 'CAR 2', rot: 0.04, hl: seg(t, tLast4 + 0.2, tLast4 + 0.6) }); ctx.restore(); }
  ST.grade(ctx, 'golden', 0.16);
});
// D3 ("Often an older, cheaper one that polluted more."): close on the old car idling; cartoon grey puffs; OLDER · CHEAPER · MORE SMOKE
shot('D3 smoky', tOften - 0.12, Z.s05 - 0.12, (ctx, t, lt) => {
  const c = cam(keysAt([[0, 60, 1.2, 600], [3, 20, 1.28, 590]]), lt);
  layer(ctx, c, 1, w => { S.carLot(w, t, { office: 1500 }); w.save(); w.translate(220 + Math.sin(t * 40) * 1.5, 180 + Math.abs(Math.sin(t * 22)) * 3); S.car(w, { col: '#4F8A8B', kind: 'old', plate: 'RTV 478', smoke: t > tPolluted - 0.4 ? t * 1.8 : t * 0.6 }); w.restore(); });
  label(ctx, 'OLDER', 420, 170, pop(t, tOlder - 0.06), { size: 66 });
  label(ctx, 'CHEAPER', 800, 170, pop(t, tCheaper - 0.06), { size: 66, col: C.yellow, rot: 0.03 });
  label(ctx, 'MORE SMOKE', 1450, 200, pop(t, tPolluted - 0.06), { size: 74, col: C.red, fg: PAL.cream, rot: -0.04 });
  ST.grade(ctx, 'golden', 0.18);
});

// E1 (s05 "Economist Lucas Davis later studied years of readings from the city's air monitors."): the rooftop station + the study note
const tDavis = at('s05', 'davis'), tYears = at('s05', 'years'), tMonitors = at('s05', 'monitors'), tHe = at('s05', 'he'), tNo5 = at('s05', 'no'), tCleaner5 = at('s05', 'cleaner');
const tAnd5 = at('s05', 'and'), tMore5 = at('s05', 'more'), tRoad5 = at('s05', 'road');
shot('E1 station', Z.s05 - 0.12, tHe - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 330, -380, 0.8], [4.5, 300, -390, 0.85]], lt);
  layer(ctx, c, 1, w => { S.sky(w, t, { smog: 0.9 }); w.save(); w.translate(0, 300); w.scale(0.7, 0.7); S.towers(w, t, { x0: -3600, n: 36 }); w.restore(); S.smog(w, 0.7, -900); S.station(w, t); });
  const u = pop(t, tDavis - 0.15, 0.35); if (u > 0) { ctx.save(); ctx.translate(1440, 360); ctx.scale(u * 0.95, u * 0.95); S.studyNote(ctx); ctx.restore(); }
  label(ctx, 'YEARS OF READINGS', 1440, 640, pop(t, tYears - 0.05), { size: 54, col: C.yellow });
  label(ctx, 'AIR MONITORS', 520, 160, pop(t, tMonitors - 0.1), { size: 56 });
  ST.grade(ctx, 'day', 0.16);
});
// E2 ("He found no evidence the rule made the air any cleaner — and evidence that it put more cars on the road."): the chart
shot('E2 chart', tHe - 0.12, Z.s06 - 0.12, (ctx, t, lt) => {
  ST.bg(ctx, '#E5DCC8'); ctx.fillStyle = 'rgba(120,90,50,0.07)'; for (let i = 0; i < 30; i++) ctx.fillRect(0, i * 40, W, 3);
  const u = pop(t, tHe - 0.12, 0.35); ctx.save(); ctx.translate(W / 2, 460); ctx.scale(u * (1 + lt * 0.005), u * (1 + lt * 0.005));
  S.chart(ctx, seg(t, tHe, tCleaner5 + 0.3), seg(t, tMore5 - 0.3, tRoad5 + 0.3)); ctx.restore();
  ctx.save(); ctx.translate(620, 330); ST.stampWord(ctx, 'NO EVIDENCE', 80, seg(t, tNo5, tNo5 + 0.3), C.red, -0.1); ctx.restore();
  for (let i = 0; i < 9; i++) { const ti = tMore5 + i * 0.16, uu = E.out(seg(t, ti, ti + 0.5)); if (uu <= 0) continue; ctx.save(); ctx.translate(lerp(-200, 250 + i * 175, uu), 870); ctx.scale(0.24, 0.24); S.car(ctx, { col: TRAFFIC[i % 9], kind: KINDS[i % 9], rot: uu * 8 }); ctx.restore(); }
  ST.grade(ctx, 'day', 0.14);
});

// F1 (s06 "The city wanted cleaner air. It targeted license plates."): WANTED: CLEAN AIR / TARGETED: PLATES over the hazy city
const tWanted = at('s06', 'wanted'), tTargeted = at('s06', 'targeted'), tSo6 = at('s06', 'so'), tBought = at('s06', 'bought'), tWith6 = at('s06', 'with'), tAttached = at('s06', 'attached');
shot('F1 wanted', Z.s06 - 0.12, tSo6 - 0.12, (ctx, t, lt) => {
  const c = cam(keysAt([[0, 0, 0.55, 820], [4, 60, 0.58, 820]]), lt);
  layer(ctx, c, 1, w => S.city(w, t, { smog: 1 }));
  label(ctx, 'WANTED: CLEAN AIR', W / 2, 330, pop(t, tWanted - 0.1), { size: 96 });
  label(ctx, 'TARGETED: PLATES', W / 2, 520, pop(t, tTargeted - 0.1), { size: 96, col: C.red, fg: PAL.cream, rot: 0.02 });
  const u = pop(t, at('s06', 'license') - 0.05, 0.35); if (u > 0) { ctx.save(); ctx.translate(W / 2, 730); ctx.scale(u * 0.7, u * 0.7); S.plate(ctx, 'LMX 213', 1, { rot: -0.03 }); ctx.restore(); }
  ST.grade(ctx, 'golden', 0.18);
});
// F2 ("So people bought license plates — with a car attached."): close on a plate with a SOLD tag; pull back: the plate has a smoky car attached
shot('F2 car attached', tSo6 - 0.12, T + 0.01, (ctx, t, lt) => {
  const k = E.inOut(seg(t, tWith6 - 0.2, tAttached + 0.2)), z = Math.exp(lerp(Math.log(2.6), Math.log(0.86), k));
  const fx = lerp(220 - 205, 150, k), fy = lerp(180 - 122, 180 - 150, k);
  const c = { x: fx, y: lerp(fy, -(685 - H / 2) / z, k), z, r: 0 };
  layer(ctx, c, 1, w => { S.carLot(w, t, { office: 2600 }); w.save(); w.translate(220, 180); S.car(w, { col: '#4F8A8B', kind: 'old', plate: 'RTV 478', smoke: k > 0.3 ? t * 1.5 : undefined }); w.restore();
    if (k > 0.2) { S.person(w, 760, 180, 1.0, -1, S.LK.dad, { face: FACE('grin', [1, 0], t), armN: { hand: [170, -300], grip: 'open' } }, { stache: '#241A14' }); S.person(w, 1050, 180, 0.62, -1, S.LK.kid, { face: FACE('grin', [1, -0.3], t, 2), armN: { hand: [120, -390], grip: 'open' } }); } });
  const su = pop(t, tBought - 0.05); if (su > 0 && k < 0.6) { ctx.save(); ctx.translate(1290, 300); ctx.rotate(0.08); ctx.scale(su, su); CL.cutout(ctx, () => rr(ctx, -150, -60, 300, 120, 14), C.red, { elev: 1.4 }); fitTxt(ctx, 'SOLD!', 0, 26, 76, PAL.cream, 260); ctx.restore(); }
  label(ctx, '+ A CAR ATTACHED', 1350, 200, pop(t, tAttached - 0.2), { size: 70, col: C.yellow, rot: -0.03 });
  ST.grade(ctx, 'golden', 0.18);
});

// ---------- edit, overlays, subtitles ----------
SH.sort((a, b) => a.t0 - b.t0);
const ED = makeEdit(SH, W, H);
const SPLIT = { s01: [7, 5], s02: [15, 9, 9], s03: [13], s04: [8, 13, 8], s05: [13, 12, 10], s06: [9, 10] };
const REPL = [[/ —$/, ''], [/^— /, '']];
function subs() {
  const G = [];
  Object.keys(Z).forEach(id => { const ws = V.words(id); let k0 = 0; SPLIT[id].forEach(n => { G.push({ id, words: ws.slice(k0, k0 + n) }); k0 += n; }); if (k0 !== ws.length) throw new Error(`subtitle split ${id}: ${k0} vs ${ws.length}`); });
  G.forEach((g, i) => { const nx = G[i + 1], e0 = Math.min(g.words[g.words.length - 1].t1, end(g.id)) + 0.4; g.t0 = Math.max(3.0, g.words[0].t0 - 0.05);
    g.t1 = nx ? (nx.id === g.id ? nx.words[0].t0 - 0.05 : Math.min(e0, nx.words[0].t0 - 0.05)) : Math.min(e0, T);
    let s = g.words.map(x => x.w).join(' '); for (const [a, b] of REPL) s = s.replace(a, b); g.text = s; });
  return G;
}
const SUBS = subs();
function frame(ctx, t, o = {}) {
  ED.frame(ctx, t);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ST.stampLabel(ctx); ctx.restore();
  ST.paper(ctx);
  if (!o.nosubs) EN.drawSubtitles(ctx, t, SUBS, { ...ST.SUBS, highlight: ['1989', 'rule', 'plate', 'five', 'second', 'polluted', 'no', 'cars', 'plates', 'attached'] });
}

// ---------- sound cues (for mix.py) ----------
function cues() {
  const c = [['whoosh', 0.0, 0.8], ['pop', 0.05, 1.0], ['engine', 0.2, 0.5], ['pop', 0.4, 0.6], ['horn', 1.3, 0.35]];
  c.push(['cut', Z.s01, 0.35], ['pop', tReward - 0.08, 0.5], ['clink', tReward, 0.6], ['buzzer', tAll - 0.1, 0.5], ['stamp', tRule1, 0.7], ['pop', tSame - 0.08, 0.5]);
  c.push(['cut', Z.s02 - 0.12, 0.35], ['flip', Z.s02 - 0.05, 0.6], ['pop', at('s02', '1989') - 0.05, 0.4], ['cut', tMexico - 0.12, 0.35], ['engine', tMexico, 0.4], ['horn', tMexico + 0.8, 0.25], ['pop', tClean - 0.05, 0.4]);
  c.push(['cut', tSimple - 0.25, 0.35], ['pop', tSimple - 0.05, 0.4], ['pop', tOne2 - 0.05, 0.4], ['tag', tStays - 0.1, 0.6], ['steps', tStays, 0.5], ['pop', tHome - 0.1, 0.4]);
  c.push(['cut', tDecided - 0.12, 0.35]); for (let i = 0; i < 5; i++) c.push(['flip', tDecided + i * 0.14, 0.4]); c.push(['pop', tLast2 - 0.1, 0.5], ['scratch', tDigit, 0.6], ['ding', tDigit + 0.5, 0.4]);
  c.push(['cut', Z.s03 - 0.12, 0.35], ['engine', Z.s03, 0.4], ['horn', Z.s03 + 0.5, 0.3], ['pop', Z.s03, 0.4]); for (let i = 0; i < 4; i++) c.push(['rise', tOne3 + i * 0.25, 0.4]); c.push(['stamp', tFive, 0.6], ['pop', tEvery - 0.05, 0.4]);
  c.push(['cut', Z.s04 - 0.12, 0.35], ['tick', Z.s04 + 0.2, 0.6], ['tick', Z.s04 + 0.7, 0.6], ['tick', Z.s04 + 1.2, 0.6], ['pop', tWork - 0.25, 0.4]);
  c.push(['cut', tSo4 - 0.12, 0.35], ['pop', tSecond - 0.08, 0.5], ['kaching', tSecond + 0.1, 0.5], ['pop', tDifferent - 0.1, 0.5], ['pop', tLast4 - 0.1, 0.5], ['scratch', tLast4 + 0.2, 0.5]);
  c.push(['cut', tOften - 0.12, 0.35], ['rev', tOften, 0.5], ['pop', tOlder - 0.06, 0.4], ['pop', tCheaper - 0.06, 0.4], ['puff', tPolluted - 0.3, 0.8], ['puff', tPolluted + 0.2, 0.7], ['pop', tPolluted - 0.06, 0.5]);
  c.push(['cut', Z.s05 - 0.12, 0.35], ['hum', Z.s05, 0.5], ['paper', tDavis - 0.15, 0.7], ['pop', tYears - 0.05, 0.4], ['blip', tMonitors, 0.4]);
  c.push(['cut', tHe - 0.12, 0.35], ['paper', tHe - 0.1, 0.6], ['scratch', tHe + 0.2, 0.4], ['stamp', tNo5 + 0.05, 0.9], ['scratch', tMore5 - 0.2, 0.5]); for (let i = 0; i < 5; i++) c.push(['horn', tMore5 + i * 0.3, 0.12]); c.push(['engine', tMore5, 0.4]);
  c.push(['cut', Z.s06 - 0.12, 0.35], ['pop', tWanted - 0.1, 0.6], ['stamp', tTargeted, 0.7], ['pop', at('s06', 'license') - 0.05, 0.4]);
  c.push(['cut', tSo6 - 0.12, 0.35], ['kaching', tBought, 0.6], ['whoosh', tWith6 - 0.2, 0.6], ['rev', tAttached - 0.3, 0.5], ['puff', tAttached, 0.6], ['pop', tAttached - 0.2, 0.5], ['horn', tAttached + 0.6, 0.3]);
  return c;
}
const MUSIC = { sections: [[0, 'calm'], [Z.s02 - 0.12, 'light'], [Z.s04 - 0.12, 'tension'], [Z.s05 - 0.12, 'dark'], [Z.s06 - 0.12, 'tension']] };

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
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', a1], { stdio: ['pipe', 'inherit', 'inherit'] });
  const N = Math.round(T * FPS), T0 = Date.now();
  for (let f = 0; f < N; f++) { frame(ctx, f / FPS); const buf = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); if (f % 150 === 0) process.stderr.write(`${f}/${N} ${((Date.now() - T0) / 1000).toFixed(0)}s\n`); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
})();
module.exports = { T, Z, SH };
