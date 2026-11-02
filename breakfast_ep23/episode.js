// Episode 23 "Who said breakfast matters?" (How It's Run) — "Breakfast is the most important meal of the day": first printed in 1917 in
// Good Health, the magazine of the Battle Creek Sanitarium (J. H. Kellogg, co-inventor of corn flakes). In the 1920s Beech-Nut Packing hired
// PR man Edward Bernays to sell more bacon: one doctor said "heavy breakfast", wrote to 5,000 physicians, ~4,500 agreed (as Bernays told it),
// newspapers ran it, Bernays put bacon and eggs on the plate. Twist: the doctors never picked the menu — the bacon seller did; his sales went up.
// Look: howitsrun_style/ (style reference lawnchair_ep17 / emu_ep12): full-body profile people in real places, flat sets, paper plates.
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
const S = require('./bfkit');
const { C, F, clamp, lerp, seg, E, rr, hash } = K;
const { W, H, FPS, PAL, layer, cam, shake, pop, blink, label, txt, fitTxt } = ST;
const { DAD, SANMAN, PACKER, PRMAN, DOCTOR, NEWSBOY, ACC, cerealBox, boxArm } = S.CS;

// ---------- voice timeline (natural speed; real speech start/end from vo/speech.json, gaps only) ----------
const LINES = JSON.parse(fs.readFileSync(`${__dirname}/script.json`));
const SP = JSON.parse(fs.readFileSync(`${__dirname}/vo/speech.json`));
const GAP = { s01: 0.3, s02: 0.3, s03: 0.3, s04: 0.3, s05: 0.3, s06: 0.3, s07: 0.3, s08: 0.3, s09: 0.3, s10: 0.3 };
const STt = {}; let T = 0.05; for (const L of LINES) { STt[L.id] = +(T - SP[L.id][0]).toFixed(3); T += SP[L.id][1] - SP[L.id][0] + GAP[L.id]; }
const V = EN.voice(`${__dirname}/vo`, STt), at = (id, w, n = 0) => V.at(id, w, n), end = id => STt[id] + SP[id][1];
const tEnd = +(end('s10') + 0.15).toFixed(2);
T = +(tEnd + 2.2).toFixed(2);
const Z = STt;

// ---------- helpers ----------
const FACE = (n, look = [1, 0], t = 0, o = 0) => R.expr(n, { look, blink: blink(t, 3.2, o) });
const talking = (t, id) => (t > Z[id] + SP[id][0] && t < end(id)) ? Math.abs(Math.sin(t * 17)) * 0.8 : 0;

// ================= SHOTS =================
const SH = []; const shot = (id, t0, t1, draw, out) => SH.push({ id, t0, t1, draw, out });

// A1 (frame 0, s01 quote): the cereal box in a suit at the press podium, camera flashes; headline WHO SAID / BREAKFAST MATTERS?
const tGuess = at('s01', 'guess');
const FLASH = [[0.0, 250, 1180], [0.35, 820, 1100], [0.9, 180, 900], [1.5, 880, 1250], [2.1, 300, 1050], [2.6, 760, 950]];
function podiumScene(ctx, t, lt, o = {}) {
  const c = cam([[0, 0, -600, 1.0], [4, 0, -600, 1.12]], lt);
  layer(ctx, c, 1, w => {
    S.pressRoom(w, t);
    w.save(); w.translate(0, -360); cerealBox(w, 1, { talk: o.talk || 0, face: o.face || 'smile', look: o.look || [0, 0.3], blink: blink(t, 2.9) }); boxArm(w, 1, -1, -200, -50); boxArm(w, 1, 1, 200, -50); w.restore();
    S.podium(w, 1); w.save(); w.translate(0, -410); S.mics(w, 0.6); w.restore();
    // two press photographers in the foreground (closer: floor at y = 230)
    P.person(w, -400, 230, 0.9, 1, PACKER, { face: FACE('surprised', [1, -0.6], t), armN: { hand: [150, -440], grip: 'hold', item: S.pressCam }, armF: { hand: [120, -430], grip: 'hold' } }, { hat: ['#5A5F6A', '#2A1E16'] });
    P.person(w, 360, 230, 0.9, -1, NEWSBOY, { face: FACE('grin', [1, -0.6], t, 1), armN: { hand: [150, -440], grip: 'hold', item: S.pressCam }, armF: { hand: [120, -430], grip: 'hold' } }, ACC.NEWSBOY);
  });
  for (const [ft, x, y] of FLASH) { const u = seg(lt % 3.2, ft, ft + 0.22); S.flash(ctx, x, y, 90, u); }
}
shot('A1 podium', 0, tGuess - 0.12, (ctx, t, lt) => { podiumScene(ctx, t, lt, { talk: talking(t, 's01') }); ST.grade(ctx, 'office', 0.2); }, { type: 'cut' });

// A2 (s01 "Guess who said it first?"): the 1950s dad at breakfast under the framed slogan; deadpan look at us
shot('A2 kitchen', tGuess - 0.12, Z.s02 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 40, -600, 0.95], [2, 60, -600, 1.0]], lt);
  layer(ctx, c, 1, w => {
    S.kitchen(w, t); w.save(); w.translate(150, -1060); S.sampler(w, ['BREAKFAST IS THE MOST', 'IMPORTANT MEAL', 'OF THE DAY'], 860, 380, { hl: 1 }); w.restore();
    const sp = (Math.sin(lt * 5) + 1) / 2;
    P.seated(w, -230, 0, 1.0, 1, DAD, { face: FACE(lt > 0.5 ? 'skeptical' : 'smile', lt > 0.5 ? [-0.3, 0] : [1, -0.3], t), armN: { hand: [lerp(150, 120, sp), lerp(-330, -420, sp)], grip: 'hold', item: S.spoon }, headTilt: lt > 0.5 ? 0.06 : 0 }, ACC.DAD);
    S.table(w, 170, 560, -300); w.save(); w.translate(150, -300); S.bowl(w, 0.8); w.restore(); w.save(); w.translate(360, -300); S.milk(w, 0.8); w.restore();
  });
  label(ctx, 'WHO SAID IT FIRST?', 540, 1360, pop(t, tGuess - 0.05), { size: 64, col: C.yellow });
  ST.grade(ctx, 'day', 0.18);
});

// B1 (s02 "Not a doctor."): a doctor shrugs; his label is crossed out
const tNotDoc = at('s02', 'doctor'), tA2 = at('s02', 'a', 1), tHealth = at('s02', 'health'), t1917 = at('s02', '1917');
shot('B1 not doctor', Z.s02 - 0.12, tA2 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -560, 0.95], [1.5, 0, -560, 1.0]], lt);
  layer(ctx, c, 1, w => { S.office(w, t, { wall: '#DCE6EE', window: 600 }); P.person(w, -60, 0, 1.1, 1, DOCTOR, { ...P.POSE.shrug(FACE('thinking', [0.4, -0.6], t)), headTilt: -0.05 }, ACC.DOCTOR); });
  label(ctx, 'A DOCTOR?', 540, 560, pop(t, Z.s02), { size: 78 });
  ctx.save(); ctx.translate(540, 540); ST.bigX(ctx, 110, seg(t, tNotDoc - 0.05, tNotDoc + 0.25)); ctx.restore();
  ST.grade(ctx, 'office', 0.2);
});
// B2 (s02 "A health magazine, printed in 1917..."): the magazine slaps onto the desk; 1917 card
shot('B2 magazine', tA2 - 0.12, Z.s03 - 0.12, (ctx, t, lt) => {
  const land = tHealth, u = E.in(seg(t, land - 0.35, land));
  ctx.save(); ctx.translate(shake(t, land, 8), shake(t, land + 0.02, 10)); S.deskTop(ctx, 0);
  ctx.save(); ctx.translate(560, lerp(-500, 990, u)); ctx.rotate(lerp(0.3, -0.04, u)); const z = lerp(1.4, 1.08, u) * (1 + seg(t, land, land + 3) * 0.04); ctx.scale(z, z); S.magazine(ctx, 1); ctx.restore(); ctx.restore();
  ctx.save(); ctx.translate(840, 450); ctx.rotate(0.08); const k = pop(t, t1917 - 0.08, 0.35); if (k > 0) { ctx.scale(k, k); ST.calCard(ctx, 'PRINTED IN', '1917', { w: 330, h: 300 }); } ctx.restore();
  label(ctx, 'A HEALTH MAGAZINE', 360, 440, pop(t, at('s02', 'magazine') - 0.05), { size: 48, rot: -0.05 });
  ST.grade(ctx, 'office', 0.18);
});

// C1 (s03): the sanitarium; push in to the man in the white suit pouring corn flakes; stamp CORN FLAKES GUY
const tResort = at('s03', 'resort'), tMan = at('s03', 'man'), tCorn = at('s03', 'corn');
shot('C1 sanitarium', Z.s03 - 0.12, Z.s04 - 0.12, (ctx, t, lt) => {
  const lm = tMan - Z.s03 + 0.12;
  const c = cam([[0, 0, -760, 0.58], [lm - 0.15, 60, -740, 0.62], [lm + 0.7, 330, -380, 0.86], [6, 360, -380, 0.9]], lt);
  layer(ctx, c, 1, w => {
    SE.sky(w, t, { clouds: 3 }); SE.ground(w, 'lawn'); S.tree(w, -1150, 1.3); S.tree(w, 1150, 1.2); S.sanitarium(w);
    CL.cutout(w, () => rr(w, -520, -1160, 1040, 110, 10), '#2F6E5A', { elev: 0.8 }); fitTxt(w, 'BATTLE CREEK SANITARIUM', 0, -1082, 64, PAL.cream, 980);
    w.save(); w.translate(0, 300);
    S.table(w, 260, 420, -330, '#F4F1E8'); w.save(); w.translate(250, -330); S.bowl(w, 0.75, 1); w.restore();
    const pour = clamp((lt - 0.6) / 0.6);
    P.person(w, 600, 0, 1.5, -1, SANMAN, { face: FACE('smile', [1, 0.5], t), armN: { hand: [150, -310], grip: 'hold', item: g => { g.save(); g.rotate(lerp(0, -2.0, pour)); g.translate(0, 60); S.plainBox(g, 0.55); g.restore(); } }, armF: { hand: [110, -280], grip: 'hold' } }, ACC.SANMAN);
    if (pour > 0.9) for (let i = 0; i < 10; i++) { const ph = (lt * 1.6 + i / 10) % 1; S.flake(w, 330 + (hash(i) - 0.5) * 40, lerp(-640, -370, ph), 14, i); }
    w.restore();
  });
  label(ctx, 'A HEALTH RESORT · MICHIGAN', 540, 520, pop(t, tResort - 0.05), { size: 50, col: C.yellow });
  ctx.save(); ctx.translate(330, 790); ST.stampWord(ctx, 'CORN FLAKES GUY', 58, seg(t, tCorn - 0.05, tCorn + 0.35)); ctx.restore();
  ST.grade(ctx, 'day', 0.18);
});

// D1 (s04): 1920s office; the meatpacker and the PR man shake hands over a crate of bacon; stamp SELL MORE BACON
const t1920 = at('s04', '1920s'), tPacker = at('s04', 'meatpacker'), tHired = at('s04', 'hired'), tPR = at('s04', 'pr'), tSell = at('s04', 'sell');
shot('D1 handshake', Z.s04 - 0.12, Z.s05 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -500, 0.92], [4.5, 0, -500, 1.0]], lt);
  const hs = seg(t, tHired - 0.3, tHired), sh = Math.sin(t * 14) * 14 * (t > tHired ? 1 : 0);
  layer(ctx, c, 1, w => {
    S.office(w, t, { frame: { x: 0, y: -1060, draw: g => fitTxt(g, 'EST. 1891', 0, 10, 40, '#6A4024', 220, 'center', ST.FONT.type) } });
    const arm = { hand: [lerp(40, 168, hs), lerp(-150, -315 + sh, hs)], grip: hs > 0.9 ? 'fist' : 'relax' };
    P.person(w, -180, 0, 1.0, 1, PACKER, { face: FACE(t > tHired ? 'grin' : 'smile', [1, 0], t), armN: arm }, ACC.PACKER);
    P.person(w, 180, 0, 1.0, -1, PRMAN, { face: FACE('smug', [1, 0], t, 1), armN: arm }, ACC.PRMAN);
    w.save(); w.translate(0, 40); S.crate(w, 0.75); w.restore();
  });
  const k = pop(t, t1920 - 0.1, 0.35) * (1 - seg(t, tPacker - 0.3, tPacker - 0.1));
  if (k > 0) { ctx.save(); ctx.translate(540, 560); ctx.rotate(-0.04); ctx.scale(k, k); ST.calCard(ctx, 'THEN, IN THE', '1920s', { w: 380, h: 300 }); ctx.restore(); }
  label(ctx, 'MEATPACKER: BEECH-NUT', 380, 470, pop(t, tPacker - 0.05), { size: 42, arrow: 1, arrowX: -60 });
  label(ctx, 'PR MAN: EDWARD BERNAYS', 640, 600, pop(t, tPR - 0.05), { size: 42, col: PAL.navy, fg: PAL.cream, rot: 0.03, arrow: 1, arrowX: 80 });
  ctx.save(); ctx.translate(540, 1300); ST.stampWord(ctx, 'SELL MORE BACON', 66, seg(t, tSell - 0.05, tSell + 0.35)); ctx.restore();
  ST.grade(ctx, 'office', 0.2);
});

// E1 (s05 "He didn't buy ads."): the PR man wags a finger; the bacon ad is crossed out
const tDidnt = at('s05', 'didn'), tAds = at('s05', 'ads'), tHe2 = at('s05', 'he', 1), tOne = at('s05', 'one'), tLight = at('s05', 'light'), tHeavy = at('s05', 'heavy'), tHeavy2 = at('s05', 'heavy', 1);
shot('E1 no ads', Z.s05 - 0.12, tHe2 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -560, 0.95], [1.3, 0, -560, 1.0]], lt);
  layer(ctx, c, 1, w => { S.office(w, t, { window: 900 });
    tubeEasel(w, 120); w.save(); w.translate(120, -620); w.scale(0.8, 0.8); S.billboard(w); w.restore();
    P.person(w, -360, 0, 1.05, 1, PRMAN, { face: FACE('smug', [1, -0.2], t), armN: { hand: [150 + Math.sin(t * 16) * 18, -390], grip: 'point' } }, ACC.PRMAN); });
  ctx.save(); ctx.translate(654, 860); ST.bigX(ctx, 170, seg(t, tDidnt, tDidnt + 0.3)); ctx.restore();
  label(ctx, 'NO ADS', 540, 470, pop(t, tAds - 0.05), { size: 74, col: C.red, fg: PAL.cream });
  ST.grade(ctx, 'office', 0.2);
});
function tubeEasel(w, x) { R.tube(w, [[x - 150, 0], [x - 70, -700]], 14, '#8A5A34', 4); R.tube(w, [[x + 150, 0], [x + 70, -700]], 14, '#8A5A34', 4); }
// E2 (s05 "He asked one doctor: light breakfast, or heavy? 'Heavy.'"): toast vs the heavy mountain; the doctor points: HEAVY
shot('E2 light or heavy', tHe2 - 0.12, Z.s06 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, -80, -470, 1.08], [3.7, -80, -480, 1.14]], lt);
  layer(ctx, c, 1, w => { S.office(w, t, { wall: '#DCE6EE', window: 300 });
    P.person(w, -480, 0, 1.0, 1, PRMAN, { face: FACE(t > tHeavy2 ? 'smug' : 'neutral', [1, 0], t), armN: { hand: [120, -330], grip: 'open' } }, ACC.PRMAN);
    P.seated(w, 230, 0, 1.0, -1, DOCTOR, { face: FACE(t > tHeavy2 ? 'grin' : 'thinking', [1, 0.3], t), ...(t > tHeavy2 - 0.1 ? { armN: { hand: [160, -330], grip: 'point' } } : {}) }, ACC.DOCTOR);
    SE.desk(w, -60, 600, -300, '#8A5A34');
    w.save(); w.translate(-220, -300); S.lightPlate(w, 0.8); w.restore();
    w.save(); w.translate(60, -300); S.mountain(w, 0.55, t < tHeavy - 0.1 ? 0.25 : seg(t, tHeavy - 0.1, tHeavy + 0.25) * 0.75 + 0.25); w.restore(); });
  if (t < tHeavy2 - 0.05) label(ctx, 'ONE DOCTOR', 540, 470, pop(t, tOne - 0.05), { size: 60 });
  label(ctx, 'LIGHT?', 300, 690, pop(t, tLight - 0.05), { size: 56, col: PAL.cream, rot: -0.05 });
  label(ctx, 'HEAVY?', 700, 690, pop(t, tHeavy - 0.05), { size: 56, col: C.yellow, rot: 0.04 });
  ctx.save(); ctx.translate(540, 490); ST.stampWord(ctx, 'HEAVY', 110, seg(t, tHeavy2 - 0.05, tHeavy2 + 0.3)); ctx.restore();
  ST.grade(ctx, 'office', 0.2);
});

// F1 (s06): the mail sack bursts: letters to 5,000 physicians
const tFive = at('s06', 'five'), tPhys = at('s06', 'physicians');
shot('F1 mail', Z.s06 - 0.12, Z.s07 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -520, 0.95], [2.6, 0, -540, 1.02]], lt);
  layer(ctx, c, 1, w => { S.office(w, t, { wall: '#E8E2D0', window: -800 });
    P.seated(w, -420, 0, 0.95, 1, DOCTOR, { face: FACE('smile', [1, 0.2], t), armN: { hand: [140, -300], grip: 'pinch', item: g => R.tube(g, [[0, 0], [10, -60]], 8, '#2A2A30', 3) } }, ACC.DOCTOR);
    w.save(); w.translate(120, 0); S.mailSack(w, 1.15, seg(t, tFive - 0.2, tFive)); w.restore();
    for (let i = 0; i < 40; i++) { const t0 = tFive - 0.1 + i * 0.035; if (t < t0) break; const f = clamp((t - t0) / 1.1), a = -Math.PI / 2 + (hash(i) - 0.5) * 2.4, v = 900 + hash(i + 7) * 700;
      const x = 120 + Math.cos(a) * v * f, y = -470 + Math.sin(a) * v * f + 900 * f * f; w.save(); w.translate(x, y); w.rotate(f * 6 * (hash(i + 2) - 0.5)); S.envelope(w, 0.7, i); w.restore(); } });
  const u = pop(t, tFive - 0.08, 0.35); if (u > 0) { ctx.save(); ctx.translate(540 + shake(t, tFive + 0.2, 8), 480); ctx.scale(u, u); CL.cutout(ctx, () => rr(ctx, -270, -95, 540, 170, 20), C.red, { elev: 2 }); txt(ctx, '5,000', 0, 34, 120, PAL.cream); ctx.restore(); }
  label(ctx, 'LETTERS TO PHYSICIANS', 540, 650, pop(t, tPhys - 0.05), { size: 50 });
  ST.grade(ctx, 'office', 0.2);
});

// G1 (s07 "About 4,500 agreed."): reply cards pile up; ≈ 4,500 + stamp AGREED
const t4500 = at('s07', '4500'), tAgreed = at('s07', 'agreed'), tAt = at('s07', 'at'), tLeast = at('s07', 'least'), tTold = at('s07', 'told');
function plate4500(ctx, t, star) { const u = pop(t, t4500 - 0.1, 0.35); if (u <= 0) return; ctx.save(); ctx.translate(540, 480); ctx.scale(u, u); CL.cutout(ctx, () => rr(ctx, -290, -95, 580, 170, 20), C.red, { elev: 2 }); txt(ctx, star ? '≈ 4,500*' : '≈ 4,500', 0, 34, 116, PAL.cream); ctx.restore(); }
shot('G1 replies', Z.s07 - 0.12, tAt - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -500, 0.9], [2.6, 0, -520, 0.96]], lt);
  layer(ctx, c, 1, w => { SE.room(w, t, { wall: '#EFE3CB', floor: 'wood' });
    for (let i = 0; i < 60; i++) { const tt = Z.s07 + i * 0.03; if (t < tt) break; const f = clamp((t - tt) / 0.4), x = (hash(i) - 0.5) * 900 * (0.4 + i / 90), y = lerp(-1700, -30 - (i / 60) * 420 * (1 - Math.abs(x) / 700), E.in(f));
      w.save(); w.translate(x, y); S.reply(w, 0.9, i); w.restore(); } });
  plate4500(ctx, t, false);
  ctx.save(); ctx.translate(540, 760); ST.stampWord(ctx, 'AGREED', 110, seg(t, tAgreed - 0.05, tAgreed + 0.3), PAL.green, -0.08); ctx.restore();
  ST.grade(ctx, 'office', 0.2);
});
// G2 (s07 "At least, that's how he told it."): the PR man, smug, tells the story; footnote
shot('G2 told it', tAt - 0.12, Z.s08 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, -60, -560, 1.0], [2, -60, -580, 1.08]], lt);
  layer(ctx, c, 1, w => { S.office(w, t, { window: 500 });
    P.person(w, -160, 0, 1.15, 1, PRMAN, { face: FACE(t > tTold ? 'smug' : 'smile', t > tLeast ? [-0.3, 0] : [1, -0.2], t), armN: { hand: [130 + Math.sin(t * 6) * 20, -380], grip: 'open' }, headTilt: 0.05 }, ACC.PRMAN); });
  plate4500(ctx, t, true);
  label(ctx, '* AS BERNAYS TOLD IT', 600, 660, pop(t, tLeast - 0.05), { size: 50, col: C.yellow, rot: 0.03 });
  ST.grade(ctx, 'office', 0.2);
});

// H1 (s08 "Newspapers ran it."): the newsboy shouts; the front page DOCTORS URGE BIG BREAKFAST
const tAnd8 = at('s08', 'and'), tHeartiest = at('s08', 'heartiest'), tBacon8 = at('s08', 'bacon'), tEggs = at('s08', 'eggs');
shot('H1 newspapers', Z.s08 - 0.12, tAnd8 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, -40, -560, 0.95], [1.5, -40, -560, 1.0]], lt);
  layer(ctx, c, 1, w => { SE.sky(w, t, { clouds: 2 }); SE.ground(w, 'road'); SE.houses(w, -1800, 6, { cols: ['#E8DCC4', '#E8C8B0', '#D9D0C0', '#E6D8C8'] });
    P.person(w, -300, 0, 1.15, 1, NEWSBOY, { face: { ...FACE('grin', [1, -0.4], t), talk: Math.abs(Math.sin(t * 9)) }, armN: { hand: [150, -420 + Math.sin(t * 8) * 10], grip: 'hold', item: S.paperItem } }, ACC.NEWSBOY); });
  const u = pop(t, Z.s08 + 0.15, 0.35); if (u > 0) { ctx.save(); ctx.translate(650, 720); ctx.rotate(0.04); ctx.scale(u * 0.56, u * 0.56); S.newspaper(ctx, 1); ctx.restore(); }
  ST.grade(ctx, 'day', 0.2);
});
// H2 (s08 "And the heartiest breakfast? Bacon and eggs."): the frying pan sizzles, then rushes at the camera
shot('H2 pan', tAnd8 - 0.12, Z.s09 - 0.12, (ctx, t, lt) => {
  ST.bg(ctx, '#E7D9BE'); ctx.fillStyle = 'rgba(255,255,255,0.25)'; for (let y = 0; y < 900; y += 80) ctx.fillRect(0, y, W, 4);
  ctx.fillStyle = '#3A3A40'; ctx.fillRect(0, 900, W, 1020); ctx.fillStyle = '#55555C'; ctx.fillRect(0, 900, W, 30);
  const z = lerp(0.95, 1.65, E.out(seg(t, tBacon8 - 0.1, tBacon8 + 0.4))) * (1 + lt * 0.02);
  ctx.save(); ctx.translate(500 + shake(t, tBacon8 + 0.1, 6), lerp(1060, 1000, seg(t, tBacon8 - 0.1, tBacon8 + 0.4))); ctx.scale(z, z); S.pan(ctx, 1, t); ctx.restore();
  label(ctx, 'THE HEARTIEST BREAKFAST?', 540, 470, pop(t, tHeartiest - 0.05), { size: 56 });
  label(ctx, 'BACON & EGGS', 540, 1370, pop(t, tBacon8 - 0.02), { size: 84, col: C.yellow, rot: 0.03 });
  ST.grade(ctx, 'golden', 0.2);
});

// I1 (s09 "The doctors never picked the menu."): the empty menu board; the doctor shrugs
const tThe2 = at('s09', 'the', 2), tSeller = at('s09', 'seller'), tDid = at('s09', 'did'), tAnd9 = at('s09', 'and'), tSaid = at('s09', 'said'), tSales = at('s09', 'sales'), tUp = at('s09', 'up');
function menuSet(w, t, items) { S.office(w, t, { wall: '#E8DCC4', window: -1100 }); w.save(); w.translate(110, -760); w.scale(0.74, 0.74); S.menuBoard(w, items); w.restore(); }
shot('I1 menu', Z.s09 - 0.12, tThe2 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -580, 0.95], [1.8, 0, -580, 1.0]], lt);
  layer(ctx, c, 1, w => { menuSet(w, t, [['', 0], ['', 0], ['', 0]]); P.person(w, -340, 0, 1.05, 1, DOCTOR, { ...P.POSE.shrug(FACE('worried', [1, -0.3], t)) }, ACC.DOCTOR); });
  label(ctx, 'DOCTORS: "HEAVY." THAT\'S ALL.', 540, 440, pop(t, Z.s09 + 0.05), { size: 50 });
  ST.grade(ctx, 'office', 0.2);
});
// I2 (s09 "The bacon seller did."): the bacon seller chalks BACON & EGGS on the menu
shot('I2 seller writes', tThe2 - 0.12, tAnd9 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -580, 1.0], [2.2, 30, -580, 1.05]], lt);
  const wr = seg(t, tSeller - 0.3, tDid + 0.3);
  layer(ctx, c, 1, w => { menuSet(w, t, [['BACON & EGGS', wr], ['', 0], ['', 0]]);
    P.person(w, -330, 0, 1.05, 1, PACKER, { face: FACE(wr > 0.9 ? 'smug' : 'smile', wr > 0.9 ? [-0.3, 0] : [1, -0.4], t), armN: { hand: [lerp(160, 200, wr) + Math.sin(t * 20) * 6 * (wr > 0 && wr < 1), -440], grip: 'pinch', item: S.chalk } }, ACC.PACKER); });
  label(ctx, 'MENU BY: THE BACON SELLER', 540, 440, pop(t, tSeller - 0.05), { size: 50, col: C.yellow });
  ST.grade(ctx, 'office', 0.2);
});
// I3 (s09 "And, he said, his sales went up."): the sales line climbs, the register rings, SOLD
shot('I3 sales', tAnd9 - 0.12, Z.s10 - 0.12, (ctx, t, lt) => {
  ST.bg(ctx, '#F1E6CF'); ctx.fillStyle = 'rgba(77,141,255,0.10)'; for (let i = 0; i < 30; i++) ctx.fillRect(0, i * 70, W, 3);
  ctx.fillStyle = '#9A6A40'; ctx.fillRect(0, 1420, W, 500);
  ctx.save(); ctx.translate(470, 660); ctx.rotate(-0.02); ctx.scale(0.86, 0.86); S.chart(ctx, seg(t, tSales - 0.3, tUp + 0.2)); ctx.restore();
  ctx.save(); ctx.translate(300, 1440); S.register(ctx, 0.7, seg(t, tSales - 0.05, tSales + 0.3)); ctx.restore();
  P.person(ctx, 800, 1450, 0.95, -1, PACKER, { face: FACE(t > tSales ? 'grin' : 'smile', [1, -0.3], t), armN: { hand: [140, -380], grip: 'point' } }, ACC.PACKER);
  label(ctx, '(HE SAID)', 330, 1010, pop(t, tSaid - 0.05), { size: 46, col: PAL.navy, fg: PAL.cream, rot: -0.04 });
  ctx.save(); ctx.translate(310, 1230); ST.stampWord(ctx, 'SOLD', 90, seg(t, tUp - 0.05, tUp + 0.3)); ctx.restore();
  ST.grade(ctx, 'office', 0.18);
});

// J1 (s10): eat it or skip it — the slogan with a price tag on IMPORTANT
const tSkip = at('s10', 'skip'), tJust = at('s10', 'just'), tWrote = at('s10', 'wrote');
shot('J1 slogan', Z.s10 - 0.12, tEnd, (ctx, t, lt) => {
  ST.bg(ctx, '#CFE8DC'); ctx.fillStyle = 'rgba(255,255,255,0.35)'; for (let y = 0; y < 1100; y += 60) ctx.fillRect(0, y, W, 4);
  ctx.fillStyle = '#E9474F'; ctx.fillRect(0, 1100, W, 820); ctx.fillStyle = '#C9CED6'; ctx.fillRect(0, 1100, W, 14);
  ctx.save(); ctx.translate(540, 1240); S.plate(ctx, 1.3); S.baconStrip(ctx, -70, -40, 0.9, -0.1, 0); S.baconStrip(ctx, -50, 6, 0.9, 0.05, 1); S.egg(ctx, 110, -20, 0.8); ctx.restore();
  label(ctx, 'EAT IT', 250, 1410, pop(t, Z.s10), { size: 60, col: PAL.green, fg: PAL.cream, rot: -0.05 });
  label(ctx, 'SKIP IT', 800, 1410, pop(t, tSkip - 0.05), { size: 60, col: PAL.navy, fg: PAL.cream, rot: 0.05 });
  const u = pop(t, tJust - 0.1, 0.35); if (u > 0) { ctx.save(); ctx.translate(540, 580); ctx.rotate(-0.02); ctx.scale(u, u); S.sampler(ctx, ['BREAKFAST IS THE MOST', 'IMPORTANT', 'MEAL OF THE DAY'], 900, 400, { hl: 1 });
    const v = seg(t, tWrote - 0.15, tWrote + 0.2); if (v > 0) { ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 8; ctx.beginPath(); ctx.ellipse(0, 22, 190, 52, -0.03, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamp(v * 1.4)); ctx.stroke(); ctx.restore();
      ctx.save(); ctx.translate(0, 196); ctx.scale(E.back(v, 2), E.back(v, 2)); S.priceTag(ctx, 'WHO PAID?', Math.sin((t - tWrote) * 5) * 0.12 * Math.exp(-(t - tWrote) * 1.5)); ctx.restore(); } ctx.restore(); }
  ST.grade(ctx, 'day', 0.18);
});
// K (end card, 2 s+): the cereal box at the podium again (echo of frame 0) + the question
shot('K end', tEnd, T + 0.01, (ctx, t, lt) => { podiumScene(ctx, t, lt + 2.5, { face: 'smug', look: [0, 1] }); ST.grade(ctx, 'office', 0.2); }, { type: 'cut' });

// ---------- overlays ----------
function overlays(ctx, t) {
  const hk = lerp(0.82, 1, E.back(seg(t, 0, 0.3), 2.2)), hu = 1 - seg(t, tGuess - 0.3, tGuess - 0.12);
  if (hu > 0) { ctx.save(); ctx.translate(540, 480); ctx.scale(hk, hk); ctx.translate(-540, -480); ST.headline2(ctx, 'WHO SAID', 'BREAKFAST MATTERS?', 1 - seg(t, tGuess - 0.3, tGuess - 0.12), 420); ctx.restore(); }
  if (t < tGuess - 0.12) label(ctx, 'USA · 1917 / 1920s', W / 2, 676, 1, { size: 38, col: '#171717', fg: C.yellow, rot: 0.02 });
  ST.stampLabel(ctx);
  if (t >= tEnd) ST.questionCard(ctx, t, ['DO YOU EAT BREAKFAST'], '— OR SKIP IT?', E.back(seg(t, tEnd, tEnd + 0.35), 2), { arrow: true, y: 560 });
}

// ---------- edit, overlays, subtitles ----------
SH.sort((a, b) => a.t0 - b.t0);
const ED = makeEdit(SH, W, H);
const SPLIT = { s01: [9, 5], s02: [3, 6], s03: [5, 5], s04: [4, 6, 4], s05: [4, 4, 4, 1], s06: [3, 5], s07: [3, 7], s08: [3, 4, 3], s09: [6, 4, 7], s10: [5, 6] };
const REPL = [[/five thousand/, '5,000']];
function subs() {
  const G = [];
  Object.keys(Z).forEach(id => { const ws = V.words(id); let k0 = 0; SPLIT[id].forEach(n => { G.push({ id, words: ws.slice(k0, k0 + n) }); k0 += n; }); if (k0 !== ws.length) throw new Error(`subtitle split ${id}: ${k0} vs ${ws.length}`); });
  G.forEach((g, i) => { const nx = G[i + 1], e0 = Math.min(g.words[g.words.length - 1].t1, end(g.id)) + 0.4; g.t0 = Math.max(0, g.words[0].t0 - 0.05);
    g.t1 = nx ? (nx.id === g.id ? nx.words[0].t0 - 0.05 : Math.min(e0, nx.words[0].t0 - 0.05)) : Math.min(e0, tEnd);
    let s = g.words.map(x => x.w).join(' '); for (const [a, b] of REPL) s = s.replace(a, b); g.text = s; });
  return G;
}
const SUBS = subs();
function frame(ctx, t, o = {}) {
  ED.frame(ctx, t);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); overlays(ctx, t); ctx.restore();
  ST.paper(ctx);
  if (!o.nosubs) EN.drawSubtitles(ctx, t, SUBS, { ...ST.SUBS, highlight: ['important', '1917', 'corn', 'bacon', 'heavy', '5000', '4500', 'agreed', 'eggs', 'menu', 'sales', 'slogan'] });
}

// ---------- sound cues (for mix.py) ----------
function cues() {
  const c = [['slam', 0.0, 2.0], ['ding', 0.02, 1.2], ['shutter', 0.03, 1.0]];
  for (const [ft] of FLASH) if (ft > 0) c.push(['shutter', ft, 0.6]);
  c.push(['cut', tGuess - 0.12, 0.35], ['pop', tGuess - 0.05, 0.5], ['clink', tGuess + 0.3, 0.6]);
  c.push(['cut', Z.s02 - 0.12, 0.35], ['pop', Z.s02, 0.4], ['buzzer', tNotDoc, 0.6], ['cut', tA2 - 0.12, 0.35], ['whoosh', tHealth - 0.35, 0.5], ['slam', tHealth, 0.9], ['pop', at('s02', 'magazine') - 0.05, 0.4], ['stamp', t1917 - 0.05, 0.7]);
  c.push(['cut', Z.s03 - 0.12, 0.35], ['pop', tResort - 0.05, 0.4], ['zoom', tMan - 0.2, 0.5], ['flutter', tMan + 0.4, 0.6], ['stamp', tCorn, 0.8]);
  c.push(['cut', Z.s04 - 0.12, 0.35], ['flip', t1920 - 0.1, 0.6], ['pop', tPacker - 0.05, 0.45], ['clink', tHired, 0.5], ['pop', tPR - 0.05, 0.45], ['stamp', tSell, 0.8]);
  c.push(['cut', Z.s05 - 0.12, 0.35], ['buzzer', tDidnt + 0.05, 0.6], ['pop', tAds - 0.05, 0.4], ['cut', tHe2 - 0.12, 0.35], ['pop', tOne - 0.05, 0.4], ['tag', tLight - 0.05, 0.5], ['tag', tHeavy - 0.05, 0.5], ['thump', tHeavy, 0.5], ['stamp', tHeavy2, 0.8]);
  c.push(['cut', Z.s06 - 0.12, 0.35], ['balloonpop', tFive - 0.05, 0.4]); for (let i = 0; i < 10; i++) c.push(['paper', tFive + i * 0.1, 0.4]); c.push(['pop', tPhys - 0.05, 0.4]);
  c.push(['cut', Z.s07 - 0.12, 0.35]); for (let i = 0; i < 12; i++) c.push(['paper', Z.s07 + i * 0.15, 0.35]); c.push(['stamp', t4500, 0.6], ['stamp', tAgreed, 0.8]);
  c.push(['cut', tAt - 0.12, 0.35], ['tag', tLeast - 0.05, 0.5]);
  c.push(['cut', Z.s08 - 0.12, 0.35], ['flip', Z.s08 + 0.1, 0.6], ['cut', tAnd8 - 0.12, 0.35], ['sizzle', tAnd8, 1.0], ['pop', tHeartiest - 0.05, 0.4], ['zoom', tBacon8 - 0.15, 0.6], ['thump', tBacon8 + 0.1, 0.6]);
  c.push(['cut', Z.s09 - 0.12, 0.35], ['pop', Z.s09 + 0.05, 0.4], ['cut', tThe2 - 0.12, 0.35], ['scratch', tSeller - 0.3, 0.7], ['scratch', tSeller + 0.2, 0.7], ['pop', tSeller - 0.05, 0.4]);
  c.push(['cut', tAnd9 - 0.12, 0.35], ['tag', tSaid - 0.05, 0.4], ['kaching', tSales, 0.7], ['rise', tSales + 0.1, 0.5], ['stamp', tUp, 0.8]);
  c.push(['cut', Z.s10 - 0.12, 0.35], ['pop', Z.s10, 0.4], ['pop', tSkip - 0.05, 0.4], ['whoosh', tJust - 0.15, 0.4], ['tag', tWrote, 0.6]);
  c.push(['cut', tEnd, 0.4], ['shutter', tEnd + 0.02, 0.6], ['pop', tEnd + 0.05, 0.6], ['blip', tEnd + 0.4, 0.4]);
  return c;
}
const MUSIC = { b0: 0, magazine: Z.s02, bacon: Z.s04, survey: Z.s06, papers: Z.s08, twist: Z.s09, hit: tEnd, end: T };

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
  const KEY = [['01_hook', 0.9], ['02_1917_magazine', t1917 + 0.5], ['03_sell_more_bacon', tSell + 0.5], ['04_5000_letters', tPhys + 0.4], ['05_4500_agreed', tAgreed + 0.6], ['06_question', tEnd + 1.0]];
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
