// Episode 22 "Your ring is an ad" (How It's Run) — the diamond engagement ring as an ad campaign: late 1930s, US diamond sales falling;
// the diamond giant (De Beers) hires an ad agency (N.W. Ayer) to make a diamond mean love; a copywriter writes "A diamond is forever";
// brides with a diamond ring ~10% (1940) -> ~80% (1980); the ads put a price on love (one month's salary, later two);
// money twist: bought for $2,000, a dealer might offer $600 — "forever" meant: never sell it.
// Look: howitsrun_style/ (style reference lawnchair_ep17 / emu_ep12): full-body profile people in real places, flat sets, paper plates.
// Usage: node episode.js video out.mp4 | still t1,t2,... out.png | frame t out.png [nosubs] | cues | srt out.srt | shots | carousel dir
const { createCanvas } = require('@napi-rs/canvas');
const { spawn } = require('child_process');
const fs = require('fs');
const K = require('../tests/mcd_collage/kit');
const EN = require('../mcd_ep1/engine');            // voice timings + subtitle drawing only (read-only use)
const R = require('../hirkit/rig');
const CL = require('../hirkit/collage');
const LT = require('../hirkit/light');
const { makeEdit } = require('../hirkit/edit');
const ST = require('../howitsrun_style/style');
const P = require('../howitsrun_style/people');
const SE = require('../howitsrun_style/sets');
const S = require('./diakit');
const { C, F, clamp, lerp, seg, E, rr, hash } = K;
const { W, H, FPS, PAL, layer, cam, shake, pop, blink, label, txt, fitTxt } = ST;
const { GUY, GIRL, ADMAN, BOSS, WRITER, DEALER, BRIDES, lady, megaphone } = S.CS;

// ---------- voice timeline (natural speed; real speech start/end from vo/speech.json, gaps only) ----------
const LINES = JSON.parse(fs.readFileSync(`${__dirname}/script.json`));
const SP = JSON.parse(fs.readFileSync(`${__dirname}/vo/speech.json`));
const GAP = { s01: 0.3, s02: 0.3, s03: 0.3, s04: 0.3, s05: 0.3, s06: 0.4, s07: 0.3, s08: 0.35, s09: 0.2 };
const STt = {}; let T = 0.05; for (const L of LINES) { STt[L.id] = +(T - SP[L.id][0]).toFixed(3); T += SP[L.id][1] - SP[L.id][0] + GAP[L.id]; }
const V = EN.voice(`${__dirname}/vo`, STt), at = (id, w, n = 0) => V.at(id, w, n), end = id => STt[id] + SP[id][1];
const tEnd = +(end('s09') + 0.15).toFixed(2);
T = +(tEnd + 2.3).toFixed(2);
const Z = { ...STt, s09: STt.s09 + SP.s09[0] };   // shot boundaries on the real speech start

// ---------- helpers ----------
const FACE = (n, look = [1, 0], t = 0, o = 0) => R.expr(n, { look, blink: blink(t, 3.2, o) });
const KNEEL = { hip: [-10, -170], legN: { foot: [120, 0] }, legF: { foot: [-170, 0] } };
const flipTxt = f => g => { if (f < 0) g.scale(-1, 1); };

// ================= SHOTS =================
const SH = []; const shot = (id, t0, t1, draw, out) => SH.push({ id, t0, t1, draw, out });
// A (frame 0 + s01, and the end card): the proposal in the wedding hall; the ad man shouts into a megaphone behind the boyfriend
const tAncient = at('s01', 'ancient'), tSales = at('s01', 'sales');
function proposal(ctx, t, lt, keys, o = {}) {
  const c = cam(keys, lt);
  layer(ctx, c, 1, w => {
    S.hall(w, t);
    const ax = -430, as = 0.95;
    P.person(w, ax, 0, as, 1, ADMAN, { face: FACE(o.adFace || 'grin', [1, 0], t), lean: 0.05 + Math.sin(t * 9) * 0.015, armN: { hand: [140, -420], grip: 'hold', item: g => megaphone(g, 0.9) }, armF: { hand: [60, -300], grip: 'fist' } }, { tie: C.yellow });
    S.shout(w, ax + 330 * as, -470 * as, as, t);
    const glow = 0.6 + 0.4 * Math.sin(t * 5);
    P.person(w, -30, 0, 0.95, 1, GUY, { ...KNEEL, face: FACE('grin', [1, -0.5], t), armN: { hand: [150, -300 + Math.sin(t * 2) * 6], grip: 'hold', item: g => S.ringBox(g, 0.55, 1, glow, t) }, armF: { hand: [110, -290], grip: 'hold' } });
    lady(w, 360, 0, 0.95, -1, GIRL, { face: FACE(o.girlFace || 'surprised', [1, 0.35], t, 1), armN: { hand: [80, -430], grip: 'open' }, armF: { hand: [60, -320], grip: 'relax' } });
  });
}
shot('A1 proposal', 0, Z.s02 - 0.12, (ctx, t, lt) => {
  proposal(ctx, t, lt, [[0, -20, -600, 0.9], [3.6, -10, -620, 0.98]]);
  ctx.save(); ctx.translate(540, 760); stampW(ctx, 'NOT ANCIENT', 74, seg(t, tAncient - 0.05, tAncient + 0.3)); ctx.restore();
  label(ctx, "IT'S A SALES PITCH", 540, 880, pop(t, tSales - 0.08), { size: 54, col: C.yellow, rot: 0.03 });
  ST.grade(ctx, 'golden', 0.18);
}, { type: 'cut' });
function stampW(ctx, s, size, u) { ST.stampWord(ctx, s, size, u); }

// B (s02): 1938 office: the diamond boss behind a sack of diamonds; the sales chart falls; he is worried
const t1930 = at('s02', '1930s'), tFalling = at('s02', 'falling'), tGiant = at('s02', 'giant'), tWorried = at('s02', 'worried');
shot('B1 sales fall', Z.s02 - 0.12, Z.s03 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, -60, -640, 0.84], [5.5, -20, -640, 0.9]], lt);
  layer(ctx, c, 1, w => {
    S.office30(w, t, { window: -1200 });
    w.save(); w.translate(220, 0); S.chartBoard(w, seg(t, at('s02', 'diamond') - 0.1, tFalling + 0.4)); w.restore();
    const wor = t > tWorried - 0.1;
    P.person(w, -430, 0, 1.0, 1, BOSS, { face: FACE(t > tFalling ? 'worried' : 'neutral', [1, -0.4], t), headTilt: wor ? 0.08 : 0, armN: { hand: [130, -330], grip: 'open' } }, { stache: '#B8B8BE', tie: C.red });
    if (wor) { w.save(); w.translate(-430 + 110, -560 + seg(t, tWorried, tWorried + 1) * 30); R.ell(w, 0, 0, 10, 16); R.fillStroke(w, '#BFE0FA', 3); w.restore(); }
    w.save(); w.translate(-90, 0); S.sack(w, 0.75, t); w.restore();
  });
  const u = pop(t, t1930 - 0.1); if (u > 0) { ctx.save(); ctx.translate(200, 640); ctx.rotate(-0.05); ctx.scale(u * 0.55, u * 0.55); ST.calCard(ctx, 'USA', '1938'); ctx.restore(); }
  label(ctx, 'THE DIAMOND GIANT: DE BEERS', 540, 410, pop(t, tGiant - 0.1), { size: 46 });
  label(ctx, 'SALES FALLING', 690, 960, pop(t, tFalling - 0.05), { size: 50, col: C.red, fg: PAL.cream, rot: 0.04 });
  ST.grade(ctx, 'office', 0.2);
});

// C (s03): the ad agency: the boss hands the folder to the ad man; THE JOB: MAKE DIAMOND = LOVE; a heart with a diamond
const tHire = at('s03', 'hire'), tJob = at('s03', 'job'), tLove = at('s03', 'love');
shot('C1 agency', Z.s03 - 0.12, Z.s04 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -620, 0.84], [4.5, 20, -620, 0.9]], lt);
  layer(ctx, c, 1, w => {
    S.office30(w, t, { wall: '#DCE6EE', window: 1100 });
    CL.cutout(w, () => rr(w, -520, -1250, 1040, 120, 12), '#171717', { elev: 1.2 }); fitTxt(w, 'N.W. AYER · AD AGENCY', 0, -1168, 64, C.yellow, 980);
    const hand = seg(t, tHire, tHire + 0.8);
    P.person(w, -380, 0, 1.0, 1, BOSS, { face: FACE('smile', [1, 0], t), armN: { hand: [lerp(110, 170, hand), -330], grip: 'hold', item: g => { g.save(); flipTxt(1)(g); g.translate(40, -40); S.folder(g, 0.35, 'JOB:', '= LOVE'); g.restore(); } } }, { stache: '#B8B8BE', tie: C.red });
    P.person(w, 360, 0, 1.0, -1, ADMAN, { face: FACE(t > tLove - 0.1 ? 'grin' : 'thinking', [1, -0.2], t), armN: { hand: [130, -330], grip: 'open' } }, { tie: C.yellow });
  });
  const u = pop(t, tJob - 0.15, 0.35); if (u > 0) { ctx.save(); ctx.translate(540, 720); ctx.rotate(-0.03); ctx.scale(u * 1.1, u * 1.15); S.folder(ctx, 1, 'THE ONE JOB:', 'MAKE DIAMOND = LOVE'); ctx.restore(); }
  const h = pop(t, tLove - 0.08, 0.35); if (h > 0) { ctx.save(); ctx.translate(850, 640 + Math.sin(t * 4) * 6); ctx.scale(h, h); S.heart(ctx, 75); S.gem(ctx, 28, 0.6); ctx.restore(); }
  ST.grade(ctx, 'office', 0.2);
});

// D (s04): night: the copywriter types late; the sheet: A DIAMOND IS FOREVER
const tLate = at('s04', 'late'), tFour = at('s04', 'four'), tA = V.words('s04')[11].t0, tDia4 = at('s04', 'diamond'), tIs4 = at('s04', 'is'), tFor = at('s04', 'forever');
const WORDS4 = ['A DIAMOND', 'IS FOREVER'];
const typed = t => t < tA - 0.05 ? 0 : t < tDia4 ? 2 : t < tIs4 ? 10 : t < tFor ? 13 : 20;
shot('D1 night', Z.s04 - 0.12, tA - 0.12, (ctx, t, lt) => {
  const c = cam([[0, -40, -620, 0.86], [3.6, 0, -620, 0.95]], lt);
  layer(ctx, c, 1, w => {
    S.nightOffice(w, t);
    P.seated(w, -260, 0, 1.05, 1, WRITER, { face: FACE(t > tFour - 0.1 ? 'smile' : 'thinking', [1, 0.2], t), armN: { hand: [180 + Math.sin(t * 25) * 6, -300], grip: 'relax' }, armF: { hand: [160 + Math.cos(t * 23) * 6, -292], grip: 'relax' } });
    SE.desk(w, 160, 620, -300, '#6A4024');
    w.save(); w.translate(80, -300); S.typewriter(w, 0.75, ['', ''], 0, t); w.restore();
    w.save(); w.translate(400, -300); S.lamp(w, 0.9); w.restore();
    for (let i = 0; i < 5; i++) { w.save(); w.translate(-40 + i * 70, 10 - (i % 2) * 6); w.rotate(i * 0.7); R.ell(w, 0, 0, 34, 26); R.fillStroke(w, '#FFFDF8', 3); w.restore(); }   // crumpled drafts on the floor
  });
  label(ctx, 'AFTER THE WAR · LATE 1940s', 540, 470, pop(t, Z.s04), { size: 46, col: C.yellow });
  label(ctx, 'THE COPYWRITER (FRANCES GERETY)', 540, 580, pop(t, at('s04', 'copywriter') - 0.05), { size: 36 });
  label(ctx, '4 WORDS', 760, 720, pop(t, tFour - 0.05), { size: 60, col: C.red, fg: PAL.cream, rot: 0.05 });
  ST.grade(ctx, 'office', 0.25);
}, { type: 'cut' });
shot('D2 sheet', tA - 0.12, Z.s05 - 0.12, (ctx, t, lt) => {
  ST.bg(ctx, '#2A2F45'); LT.glow(ctx, 760, 520, 900, 'rgba(255,230,160,1)', 0.45);
  const z = 2.3 + lt * 0.06; ctx.save(); ctx.translate(540, 1240); ctx.scale(z, z); S.typewriter(ctx, 1, WORDS4, typed(t), t); ctx.restore();
  ST.grade(ctx, 'office', 0.25);
});

// E (s05): the line of 10 brides; 1 ring sparkles (1940, ~10%), then 8 (1980, ~80%)
const tBrides = at('s05', 'brides'), tTen = at('s05', 'ten'), t1940 = at('s05', '1940'), t1980 = at('s05', '1980'), tEighty = at('s05', 'eighty');
const LIT80 = [0, 1, 3, 4, 5, 6, 7, 9];   // 8 of 10 (no. 3 is lit since 1940)
shot('E1 brides', Z.s05 - 0.12, Z.s06 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -470, 0.8], [6, 0, -470, 0.84]], lt);
  layer(ctx, c, 1, w => {
    S.chapel(w, t);
    const lit = i => { const j = LIT80.indexOf(i); return i === 3 ? t > tTen - 0.1 : (j >= 0 && t > t1980 + j * 0.07); };
    for (let i = 0; i < 10; i++) {
      const x = -504 + i * 112, on = lit(i);
      const L = BRIDES[i]; const hx = 100, hy = -310;
      lady(w, x, 0, 0.72, 1, L, { face: FACE(on ? 'happy' : 'neutral', [1, 0], t, i * 0.7), armN: { hand: [hx, hy], grip: 'hold' }, armF: { hand: [hx - 20, hy + 4], grip: 'hold' } }, { veil: 1 });
    }
    for (let i = 0; i < 10; i++) { const x = -504 + i * 112, j = LIT80.indexOf(i), t0 = i === 3 ? tTen - 0.1 : t1980 + j * 0.07, u = lit(i) ? E.back(seg(t, t0, t0 + 0.3), 2) : 0;
      w.save(); w.translate(x + 10, -560); if (u > 0) { w.scale(u, u); S.gem(w, 34, 1); S.sparkles(w, t + i * 0.3, 50, 2, 0.9, i); } else { w.globalAlpha = 0.35; R.ell(w, 0, 0, 22, 22); w.setLineDash([6, 6]); w.lineWidth = 3; w.strokeStyle = '#171717'; w.stroke(); w.setLineDash([]); } w.restore(); }
  });
  label(ctx, 'BRIDES WITH A DIAMOND RING', 540, 440, pop(t, tBrides - 0.05), { size: 50 });
  label(ctx, '1940: ~10%', 300, 600, pop(t, tTen - 0.08), { size: 74, col: C.yellow, rot: -0.04 });
  label(ctx, '1980: ~80%', 780, 720, pop(t, t1980 - 0.08), { size: 74, col: C.red, fg: PAL.cream, rot: 0.04 });
  ST.grade(ctx, 'day', 0.18);
});

// F (s06): the scale: the ring vs the pay envelope: 1 MONTH -> 2 MONTHS; stamp PRICE OF LOVE
const tPrice = at('s06', 'price'), tOne6 = at('s06', 'one'), tLater = at('s06', 'later'), tTwo6 = at('s06', 'two');
shot('F1 price', Z.s06 - 0.12, Z.s07 - 0.12, (ctx, t, lt) => {
  ST.bg(ctx, PAL.paper); ctx.fillStyle = 'rgba(230,57,70,0.07)'; for (let i = 0; i < 30; i++) ctx.fillRect(0, i * 70, W, 3);
  const tilt = t < tOne6 ? -0.7 : t < tTwo6 ? lerp(-0.7, -0.3, E.back(seg(t, tOne6, tOne6 + 0.4), 1.6)) : lerp(-0.3, 0.05, E.back(seg(t, tTwo6 - 0.05, tTwo6 + 0.35), 1.6));
  ctx.save(); ctx.translate(540, 640); S.balance(ctx, tilt, g => { g.save(); g.translate(0, -10); S.ring(g, 70, 0.7); g.restore(); },
    g => { if (t > tOne6 - 0.15) { g.save(); S.payEnvelope(g, 0.9, '1 MONTH', 'SALARY'); g.restore(); } if (t > tTwo6 - 0.1) { g.save(); g.translate(10, -150 + (1 - E.out(seg(t, tTwo6 - 0.1, tTwo6 + 0.15))) * -160); g.rotate(0.06); S.payEnvelope(g, 0.9, '+1 MONTH', 'SALARY'); g.restore(); } }); ctx.restore();
  label(ctx, 'THE ADS SET A PRICE', 540, 440, pop(t, Z.s06 + 0.1), { size: 56 });
  label(ctx, t > tLater - 0.1 ? 'LATER: 2 MONTHS' : "1 MONTH'S SALARY", 760, 1330, pop(t, tOne6 - 0.05), { size: 50, col: C.yellow, rot: 0.03 });
  ctx.save(); ctx.translate(290, 1330); ST.stampWord(ctx, 'PRICE OF LOVE', 54, seg(t, tPrice - 0.05, tPrice + 0.3)); ctx.restore();
  ST.grade(ctx, 'day', 0.15);
});

// G (s07): the pawn shop: the boyfriend walks in with the ring box and puts it on the counter; the dealer behind it
const tTry = at('s07', 'try'), tBack = at('s07', 'back');
function shop(ctx, t, keys, lt, guy, o = {}) {
  const c = cam(keys, lt);
  layer(ctx, c, 1, w => {
    S.pawnShop(w, t, { sign: o.sign });
    P.person(w, 470, 0, 1.0, -1, DEALER, { face: FACE(t > at('s08', 'six') - 0.1 ? 'smug' : 'skeptical', [1, 0.3], t), armN: { hand: [120, -330], grip: 'relax' } });
    S.counter(w, 330, 820, -380);
    guy(w);
  });
}
shot('G1 pawn', Z.s07 - 0.12, Z.s08 - 0.12, (ctx, t, lt) => {
  const u = seg(t, Z.s07 - 0.12, tTry + 0.5), stand = u >= 1, x = lerp(-1000, -150, E.out(u));
  shop(ctx, t, [[0, 0, -560, 0.85], [3.5, 40, -560, 0.9]], lt, w => {
    const box = t < tBack - 0.1;
    P.person(w, x, 0, 1.0, 1, GUY, { ...(stand ? {} : R.walk(t * 7)), face: FACE(t > tBack ? 'smile' : 'neutral', [1, 0], t), armN: box ? { hand: [130 + (stand ? 40 : 0), -310], grip: 'hold', item: g => S.ringBox(g, 0.4, 0, 0, t) } : { hand: [220, -330], grip: 'open' } });
    if (!box) { w.save(); w.translate(-150 + 260, -380); S.ringBox(w, 0.45, 1, 0.7, t); w.restore(); }
  });
  label(ctx, 'THE MONEY PART', 540, 540, pop(t, Z.s07 + 0.05), { size: 64, col: C.yellow });
  label(ctx, 'SELL IT BACK?', 540, 660, pop(t, tTry - 0.05), { size: 50 });
  ST.grade(ctx, 'office', 0.2);
});
// H (s08): closer at the counter: PAID $2,000 struck out; the dealer slides the $600 slip; RESALE stamp
const t2000 = at('s08', 'two'), tDealer = at('s08', 'dealer'), tSix = at('s08', 'six'), tHund = at('s08', 'hundred');
shot('H1 offer', Z.s08 - 0.12, Z.s09 - 0.12, (ctx, t, lt) => {
  shop(ctx, t, [[0, 200, -560, 1.08], [3.4, 220, -560, 1.14]], lt, w => {
    P.person(w, -60, 0, 1.0, 1, GUY, { face: FACE(t > tSix + 0.05 ? 'shocked' : 'smile', [1, 0], t), armN: { hand: [130, -330], grip: 'open' }, headTilt: t > tSix + 0.05 ? -0.06 : 0 });
    w.save(); w.translate(180, -380); S.ringBox(w, 0.45, 1, 0.5, t); w.restore();
  }, { sign: false });
  const u = pop(t, t2000 - 0.1); if (u > 0) { ctx.save(); ctx.translate(320, 520); ctx.rotate(-0.04); ctx.scale(u, u); S.slip(ctx, 0.85, 'PAID $2,000', PAL.cream, INK0, seg(t, tDealer - 0.1, tDealer + 0.25)); ctx.restore(); }
  const v = E.out(seg(t, tSix - 0.2, tSix + 0.15)); if (v > 0) { ctx.save(); ctx.translate(lerp(1300, 720, v), 680); ctx.rotate(0.04); S.slip(ctx, 1.0, 'OFFER: $600', C.yellow, INK0); ctx.restore(); }
  ctx.save(); ctx.translate(380, 800); ST.stampWord(ctx, 'RESALE', 58, seg(t, tHund + 0.15, tHund + 0.45)); ctx.restore();
  ST.grade(ctx, 'office', 0.2);
});
const INK0 = '#171717';

// I (s09): the ring box snaps shut: FOREVER = DON'T SELL
const tForever9 = Z.s09, tMeant = at('s09', 'meant'), tNever2 = at('s09', 'never', 1), tSell = at('s09', 'sell');
shot('I1 forever', Z.s09 - 0.12, tEnd, (ctx, t, lt) => {
  ST.bg(ctx, '#4A1622'); LT.glow(ctx, 540, 1000, 900, 'rgba(255,200,210,1)', 0.25);
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; for (let i = 0; i < 24; i++) ctx.fillRect(i * 90, 0, 40, H);
  const shut = seg(t, tNever2 - 0.05, tNever2 + 0.2), z = 2.9 + lt * 0.05;
  ctx.save(); ctx.translate(540 + shake(t, tNever2 + 0.2, 10), 1330); ctx.scale(z, z); S.ringBox(ctx, 1, 1 - E.in(shut), 1 - shut, t); ctx.restore();
  label(ctx, '"FOREVER"', 540, 470, pop(t, tForever9 - 0.05), { size: 80, col: PAL.cream });
  label(ctx, "= DON'T SELL", 540, 610, pop(t, tMeant - 0.05), { size: 80, col: C.red, fg: PAL.cream, rot: 0.03 });
  ST.grade(ctx, 'office', 0.25);
}, { type: 'cut' });
// K (end card, 2 s+): the proposal again (echo of frame 0) + the question
shot('K end', tEnd, T + 0.01, (ctx, t, lt) => { proposal(ctx, t, lt + 3.6, [[0, -10, -620, 0.98], [4, -10, -620, 1.0]], { girlFace: 'skeptical', adFace: 'smug' }); ST.grade(ctx, 'golden', 0.18); }, { type: 'cut' });

// ---------- overlays ----------
function overlays(ctx, t) {
  const a = 1 - seg(t, tAncient - 0.35, tAncient - 0.1);
  if (a > 0) { const k = 1 + 0.08 * (1 - E.out(seg(t, 0, 0.45))) + 0.012 * Math.sin(t * 6); ctx.save(); ctx.translate(540, 470); ctx.scale(k, k); ctx.translate(-540, -470); ST.headline2(ctx, 'YOUR RING =', 'AN AD', a, 410); ctx.restore();
    label(ctx, 'USA · SINCE 1938', W / 2, 680, a, { size: 38, col: '#171717', fg: C.yellow, rot: 0.02 }); }
  ST.stampLabel(ctx);
  if (t >= tEnd) ST.questionCard(ctx, t, ['WOULD YOU SPEND', "3 MONTHS' SALARY"], 'ON A RING?', E.back(seg(t, tEnd, tEnd + 0.35), 2), { arrow: true, y: 600 });
}

// ---------- edit, overlays, subtitles ----------
SH.sort((a, b) => a.t0 - b.t0);
const ED = makeEdit(SH, W, H);
const SPLIT = { s01: [4, 4, 4], s02: [2, 6, 6], s03: [6, 3, 5], s04: [7, 4, 4], s05: [5, 5, 4], s06: [8, 5], s07: [5, 5], s08: [5, 7], s09: [5, 5] };
const REPL = [[/ten percent/, '10%'], [/eighty\./, '80%.'], [/two thousand dollars/, '$2,000'], [/six hundred/, '$600']];
function subs() {
  const G = [];
  LINES.map(l => l.id).forEach(id => { const ws = V.words(id); let k0 = 0; SPLIT[id].forEach(n => { G.push({ id, words: ws.slice(k0, k0 + n) }); k0 += n; }); if (k0 !== ws.length) throw new Error(`subtitle split ${id}: ${k0} vs ${ws.length}`); });
  G.forEach((g, i) => { const nx = G[i + 1], e0 = Math.min(g.words[g.words.length - 1].t1, end(g.id)) + 0.4; g.t0 = g.words[0].t0 - 0.05;
    g.t1 = nx ? (nx.id === g.id ? nx.words[0].t0 - 0.05 : Math.min(e0, nx.words[0].t0 - 0.05)) : Math.min(e0, tEnd);
    let s = g.words.map(x => x.w).join(' '); for (const [a, b] of REPL) s = s.replace(a, b); g.text = s; });
  return G;
}
const SUBS = subs();
function frame(ctx, t, o = {}) {
  ED.frame(ctx, t);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); overlays(ctx, t); ctx.restore();
  ST.paper(ctx);
  if (!o.nosubs) EN.drawSubtitles(ctx, t, SUBS, { ...ST.SUBS, highlight: ['ancient', 'pitch.', '1930s.', 'falling,', 'love.', 'forever."', '10%', '1940.', '1980,', '80%.', 'price', 'two.', 'money', '$2,000,', '$600.', 'never'] });
}

// ---------- sound cues (for mix.py) ----------
function cues() {
  const c = [['slam', 0.0, 2.0], ['ding', 0.02, 1.4], ['sparkle', 0.15, 0.8], ['stamp', tAncient + 0.1, 0.9], ['pop', tSales - 0.08, 0.5]];
  c.push(['cut', Z.s02 - 0.12, 0.35], ['tag', t1930 - 0.1, 0.5], ['fall', tFalling - 0.3, 0.6], ['pop', tGiant - 0.1, 0.45], ['pop', tFalling - 0.05, 0.4]);
  c.push(['cut', Z.s03 - 0.12, 0.35], ['paper', tHire + 0.2, 0.5], ['whoosh', tJob - 0.2, 0.45], ['pop', tJob - 0.15, 0.5], ['sparkle', tLove - 0.05, 0.6]);
  c.push(['cut', Z.s04 - 0.12, 0.35]); for (let i = 0; i < 10; i++) c.push(['type', Z.s04 + 0.2 + i * 0.22, 0.35]); c.push(['ding', tFour - 0.05, 0.4], ['cut', tA - 0.12, 0.3]);
  for (const [tt, n] of [[tA - 0.05, 1], [tDia4, 2], [tIs4, 1], [tFor, 3]]) for (let i = 0; i < n; i++) c.push(['type', tt + i * 0.09, 0.6]);
  c.push(['ding', tFor + 0.45, 0.5]);
  c.push(['cut', Z.s05 - 0.12, 0.35], ['pop', tBrides - 0.05, 0.4], ['sparkle', tTen - 0.1, 0.6], ['tag', tTen - 0.08, 0.5], ['tag', t1980 - 0.08, 0.5]); for (let i = 0; i < 8; i++) c.push(['clink', t1980 + i * 0.07, 0.5]); c.push(['sparkle', t1980 + 0.1, 0.7]);
  c.push(['cut', Z.s06 - 0.12, 0.35], ['pop', Z.s06 + 0.1, 0.4], ['stamp', tPrice + 0.1, 0.8], ['thump', tOne6 + 0.1, 0.6], ['paper', tLater, 0.4], ['thump', tTwo6 + 0.1, 0.7], ['kaching', tTwo6 + 0.2, 0.4]);
  c.push(['cut', Z.s07 - 0.12, 0.35], ['steps', Z.s07, 0.5], ['ding', Z.s07 + 0.05, 0.4], ['pop', tTry - 0.05, 0.4], ['tap', tBack, 0.6]);
  c.push(['cut', Z.s08 - 0.12, 0.35], ['tag', t2000 - 0.1, 0.5], ['scratch', tDealer - 0.1, 0.8], ['whoosh', tSix - 0.2, 0.45], ['wah', tHund + 0.1, 0.5], ['stamp', tHund + 0.2, 0.9]);
  c.push(['cut', Z.s09 - 0.12, 0.35], ['pop', tForever9, 0.4], ['pop', tMeant - 0.05, 0.5], ['slam', tNever2 + 0.15, 0.9], ['lock', tNever2 + 0.2, 0.7]);
  c.push(['cut', tEnd, 0.4], ['pop', tEnd + 0.05, 0.6], ['blip', tEnd + 0.4, 0.4]);
  return c;
}
const MUSIC = { b0: 0, history: Z.s02, agency: Z.s03, words: Z.s04, boom: Z.s05, price: Z.s06, money: Z.s07, twist: Z.s09, hit: tEnd, end: T };

// ---------- CLI ----------
const [mode, a1, a2, a3] = process.argv.slice(2);
if (mode === 'cues') { fs.writeFileSync(`${__dirname}/cues.json`, JSON.stringify({ T, vo: Object.entries(STt), sfx: cues(), music: MUSIC })); console.log('cues ok, T =', T); }
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
  const KEY = [['01_hook', 0.6], ['02_1938_sales_fall', tWorried + 0.3], ['03_a_diamond_is_forever', tFor + 0.6], ['04_10_to_80_percent', tEighty + 0.3], ['05_2000_vs_600', Z.s09 - 0.2], ['06_question', tEnd + 1.0]];
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
