// Episode 24 "Floor cleaner → mouthwash" (How It's Run) — Listerine: a surgical antiseptic (1880s), also sold as a floor cleaner; as a mouthwash
// it barely sold until Gerard Lambert (the boss's son) and his team picked up the old medical word "halitosis" (~1921) and the ads made bad
// breath a "condition" — "Often a bridesmaid, never a bride" (Edna). Revenue reportedly $115,000 → over $8 million in seven years.
// Twist: they didn't sell a cure, they sold the fear.
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
const S = require('./listkit');
const CS = require('./cast');
const { C, F, clamp, lerp, seg, E, rr, hash } = K;
const { W, H, FPS, PAL, layer, cam, shake, pop, blink, label, txt, fitTxt } = ST;
const { INK } = R;
const { JANITOR, GARGLER, SURGEON, PHARMACIST, LAMBERT, ADMAN1, ADMAN2, EDNA, BRIDE, GROOM, FRIENDS } = CS;

// ---------- voice timeline (natural speed; real speech start/end from vo/speech.json, gaps only) ----------
const LINES = JSON.parse(fs.readFileSync(`${__dirname}/script.json`));
const SP = JSON.parse(fs.readFileSync(`${__dirname}/vo/speech.json`));
const GAP = { s01: 0.3, s02: 0.3, s03: 0.3, s04: 0.3, s05: 0.35, s06: 0.3, s07: 0.3, s08: 0.3, s09: 0.35 };
const STt = {}; let T = 0.05; for (const L of LINES) { STt[L.id] = +(T - SP[L.id][0]).toFixed(3); T += SP[L.id][1] - SP[L.id][0] + (GAP[L.id] || 0); }
const V = EN.voice(`${__dirname}/vo`, STt), at = (id, w, n = 0) => V.at(id, w, n), end = id => STt[id] + SP[id][1];
const tEnd = +(end('s10') + 0.15).toFixed(2);
T = +(tEnd + 2.2).toFixed(2);
const Z = STt;

// ---------- helpers ----------
const FACE = (n, look = [1, 0], t = 0, o = 0, x = {}) => R.expr(n, { look, blink: blink(t, 3.2, o), ...x });
const mouthOf = (x, y, s, f, r) => [x + f * (r.hd[0] + 62) * s, y + (r.hd[1] + 28) * s];
// janitor mopping (facing f), mop swing with t
function mopper(w, x, s, t, face, f = 1) {
  const sw = Math.sin(t * 5) * 34;
  w.save(); w.translate(x, 0); w.scale(s * f, s); S.mop(w, 40 + sw, -450, 330 + sw); w.restore();
  return P.person(w, x, 0, s, f, JANITOR, { face, armF: { hand: [70 + sw, -400], grip: 'hold' }, armN: { hand: [128 + sw, -300], grip: 'hold' }, lean: 0.06 }, { cap: ['#5A606B', null] });
}
// the man gargling (facing f), glass at the mouth, head back, bubbles
function gargler(w, x, s, t, f = -1) {
  const r = P.person(w, x, 0, s, f, GARGLER, { face: FACE('squint', [1, -0.7], t, 1), headTilt: -0.28 + Math.sin(t * 9) * 0.03, armN: { hand: [96, -470], grip: 'hold', item: g => CS.glass(g, 0.8) } }, { tie: C.red });
  const [mx, my] = mouthOf(x, 0, s, f, r); S.bubbles(w, mx, my - 30, t, 6);
}
// the frame-0 picture (also the end card): one bottle, two uses
function hookScene(ctx, t, lt, z0, z1) {
  const c = cam([[0, 0, -600, z0], [3, 0, -610, z1]], lt);
  layer(ctx, c, 1, w => {
    S.washroom(w, t); S.sink(w, 720);
    S.puddle(w, -60, 180, t);
    mopper(w, -420, 0.95, t, FACE('neutral', [1, 0.4], t));
    w.save(); w.translate(80, 0); w.rotate(Math.sin(t * 2) * 0.02); CS.bottle(w, 1.4, { name: 'LISTERINE' }); w.restore();
    gargler(w, 320, 0.95, t, -1);
  });
}
// party scene: the man (cloud) + friends
function partyScene(ctx, t, lt, away, cloudU, keys) {
  const c = cam(keys, lt);
  layer(ctx, c, 1, w => {
    S.party(w, t);
    const r = P.person(w, -330, 0, 1.0, 1, GARGLER, { face: FACE(away > 0.5 ? 'grin' : 'smile', [1, -0.1], t), armN: { hand: [130, -300], grip: 'hold', item: g => CS.glass(g, 0.8) } }, { tie: C.red });
    const fr = [[60, 0], [330, 1], [600, 2]];
    for (const [x, i] of fr) { const f = away > 0.5 ? 1 : -1, L = FRIENDS[i];
      P.person(w, x + away * 40, 0, 0.98, f, L, { face: FACE(away > 0.5 ? (i === 1 ? 'skeptical' : 'squint') : 'smile', away > 0.5 ? [-1, 0] : [1, 0], t, i), headTilt: away > 0.5 ? -0.08 : 0, lean: away > 0.5 ? 0.05 : 0 });
      if (L.hairStyle !== 'short') CS.skirt(w, x + away * 40, 0, 0.98, f, L.top); }
    const [mx, my] = mouthOf(-330, 0, 1.0, 1, r); S.breathCloud(w, mx + 10, my, 0.75, cloudU, t);
  });
}

// ---------- overlays ----------
function overlays(ctx, t) {
  const hA = 1 - seg(t, Z.s02 - 0.3, Z.s02 - 0.1);
  if (hA > 0) { ctx.save(); const u = E.back(seg(t, 0, 0.3), 2.2); ctx.translate(W / 2, 420); ctx.scale(lerp(0.85, 1, u), lerp(0.85, 1, u)); ctx.translate(-W / 2, -420); S.headlineArrow(ctx, 'FLOOR CLEANER', 'MOUTHWASH', hA, 420); ctx.restore(); }
  if (t < Z.s02 - 0.1) label(ctx, 'USA · 1880s–1920s', W / 2, 600, pop(t, 0.25), { size: 38, col: '#171717', fg: C.yellow, rot: 0.02 });
  ST.stampLabel(ctx);
  if (t >= tEnd) ST.questionCard(ctx, t, ['WHAT “PROBLEM” DO', 'YOU THINK'], 'ADS INVENTED?', E.back(seg(t, tEnd, tEnd + 0.35), 2), { arrow: true, y: 600 });
}

// ================= SHOTS =================
const SH = []; const shot = (id, t0, t1, draw, out) => SH.push({ id, t0, t1, draw, out });
const tScrub = at('s01', 'scrub');
// A (s01, frame 0): janitor mops with the amber bottle, the man next to him gargles the same stuff
shot('A hook', 0, Z.s02 - 0.12, (ctx, t, lt) => {
  hookScene(ctx, t, lt, 1.1, 1.18);
  ST.grade(ctx, 'office', 0.18);
}, { type: 'cut' });
// B1 (s02 "Surgeons used it on wounds."): 1880s operating room, the surgeon pours it on a bandage
const tWounds = at('s02', 'wounds'), tJan = at('s02', 'janitors'), tFloors2 = at('s02', 'floors');
shot('B1 surgeon', Z.s02 - 0.12, tJan - 0.12, (ctx, t, lt) => {
  const c = cam([[0, -120, -560, 1.0], [2, -60, -560, 1.08]], lt);
  const tilt = lerp(0, 1.9, E.inOut(seg(t, Z.s02, Z.s02 + 0.5)));
  layer(ctx, c, 1, w => {
    S.opRoom(w, t); S.opTable(w, 260);
    S.bandageArm(w, -40, -392, seg(t, Z.s02 + 0.5, tWounds + 0.3));
    P.person(w, -480, 0, 1.05, 1, SURGEON, { face: FACE('neutral', [1, 0.6], t), armN: { hand: [200, -400], grip: 'hold', twist: 0, item: g => { g.save(); g.rotate(tilt); g.translate(0, 40); CS.bottle(g, 0.42); g.restore(); } }, armF: { hand: [150, -390], grip: 'relax' } }, { stache: '#7A5A3A' });
    const bx = -480 + 200 * 1.05 + 40, by = -400 * 1.05 - 10; S.pour(w, bx + 60, by + 30, -10, -400, seg(t, Z.s02 + 0.45, Z.s02 + 0.8), t);
  });
  label(ctx, '1880s · SURGERY', 540, 540, pop(t, Z.s02), { size: 50, col: '#171717', fg: C.yellow, rot: -0.03 });
  ctx.save(); ctx.translate(540 + shake(t, tWounds + 0.1, 8), 700); ST.stampWord(ctx, 'ANTISEPTIC', 92, seg(t, tWounds - 0.05, tWounds + 0.3)); ctx.restore();
  ST.grade(ctx, 'office', 0.22);
});
// B2 (s02 "Janitors used it on floors."): the janitor pours it into the bucket, then mops
shot('B2 janitor', tJan - 0.12, Z.s03 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, -200, -540, 1.12], [2, -150, -540, 1.18]], lt);
  const pouring = t < tFloors2 - 0.1;
  layer(ctx, c, 1, w => {
    S.washroom(w, t); S.puddle(w, 40, 200, t);
    w.save(); w.translate(-40, 0); S.bucket(w, 1); w.restore();
    if (pouring) { P.person(w, -360, 0, 1.05, 1, JANITOR, { face: FACE('neutral', [1, 0.7], t), armN: { hand: [190, -330], grip: 'hold', item: g => { g.save(); g.rotate(2.0); g.translate(0, 40); CS.bottle(g, 0.42, { name: 'LISTERINE' }); g.restore(); } }, armF: { hand: [120, -300], grip: 'relax' } }, { cap: ['#5A606B', null] });
      S.pour(w, -360 + 190 * 1.05 + 80, -330 * 1.05 + 40, -40, -150, seg(t, tJan, tJan + 0.3), t); }
    else mopper(w, -420, 1.05, t, FACE('smile', [1, 0.4], t));
  });
  ctx.save(); ctx.translate(540 + shake(t, tFloors2 + 0.1, 8), 600); ST.stampWord(ctx, 'FLOOR CLEANER', 84, seg(t, tFloors2 - 0.05, tFloors2 + 0.3), PAL.navy, 0.08); ctx.restore();
  ST.grade(ctx, 'office', 0.2);
});
// C (s03 "As a mouthwash? Barely anyone cared."): the dusty drugstore, flat sales line, the bored pharmacist
const tBarely = at('s03', 'barely'), tCared = at('s03', 'cared');
shot('C drugstore', Z.s03 - 0.12, Z.s04 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -640, 0.84], [2.5, 0, -640, 0.9]], lt);
  layer(ctx, c, 1, w => {
    S.drugstore(w, t);
    P.person(w, 330, 0, 1.05, -1, PHARMACIST, { face: FACE(t > tCared - 0.2 ? 'tired' : 'neutral', [1, 0], t), lean: t > tCared - 0.2 ? 0.08 : 0, armN: { hand: [150, -330], grip: 'relax' } });
    SE.desk(w, 160, 900, -330, '#8A5A34'); w.save(); w.translate(160, -170); CL.cutout(w, () => rr(w, -300, -60, 600, 110, 10), PAL.navy, { elev: 0.8 }); fitTxt(w, 'DRUGSTORE', 0, 22, 70, PAL.cream, 560); w.restore();
    for (let i = 0; i < 3; i++) { w.save(); w.translate(-180 + i * 150, -330); CS.bottle(w, 0.55); w.restore(); }
  });
  label(ctx, 'AS A MOUTHWASH?', 540, 520, pop(t, Z.s03 + 0.05), { size: 64, col: C.yellow });
  ctx.save(); ctx.translate(540, 760); const u = pop(t, tBarely - 0.1); ctx.scale(u, u); S.salesChart(ctx, seg(t, tBarely, tCared + 0.4)); ctx.restore();
  ST.grade(ctx, 'office', 0.22);
});
// D (s04 "Around 1921, Gerard Lambert, the boss's son, needed people to want it."): the young man in the 1921 office
const t1921 = at('s04', '1921'), tGerard = at('s04', 'gerard'), tBoss = at('s04', "boss's"), tNeeded = at('s04', 'needed'), tWant = at('s04', 'want');
shot('D lambert', Z.s04 - 0.12, Z.s05 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, -20, -560, 1.1], [5.5, 40, -560, 1.18]], lt);
  layer(ctx, c, 1, w => {
    S.office(w, t);
    SE.desk(w, 260, 560, -300, '#8A5A34');
    w.save(); w.translate(260, -300); CS.bottle(w, 0.6, { name: 'LISTERINE' }); w.restore();
    const think = t > tNeeded - 0.1;
    const r = P.person(w, -230, 0, 1.12, 1, LAMBERT, { face: FACE(t > tWant ? 'smug' : think ? 'thinking' : 'neutral', think ? [1, -0.6] : [1, 0], t), armN: think ? { hand: [170, -360], grip: 'point' } : { hand: [30, -60] } }, { tie: C.red });
    if (think) { const u = E.back(seg(t, tNeeded - 0.05, tNeeded + 0.3), 2); w.save(); w.translate(60, -880); w.scale(u * 0.9, u * 0.9);
      for (const [dx, dy, rr2] of [[-40, 170, 14], [-10, 130, 22]]) { R.ell(w, dx, dy, rr2, rr2); R.fillStroke(w, PAL.cream, 4); }
      CL.cutout(w, () => { w.beginPath(); w.ellipse(150, 0, 230, 120, 0, 0, 7); }, PAL.cream, { elev: 1.2 });
      w.save(); w.translate(40, 80); CS.bottle(w, 0.42); w.restore(); fitTxt(w, 'WANT IT!', 210, 12, 54, C.red, 230); R.ell(w, 210, -60, 22, 22); w.restore(); }
  });
  ctx.save(); ctx.globalAlpha = 1 - seg(t, tNeeded - 0.2, tNeeded); ctx.translate(800, 680); ctx.rotate(0.05); const u = pop(t, t1921 - 0.1); ctx.scale(u * 0.5, u * 0.5); if (ctx.globalAlpha > 0) ST.calCard(ctx, 'AROUND', '1921'); ctx.restore();
  const lo = 1 - seg(t, tNeeded - 0.2, tNeeded); if (lo > 0) { ctx.save(); ctx.globalAlpha = lo; label(ctx, 'GERARD LAMBERT', 380, 520, pop(t, tGerard - 0.05), { size: 56 });
  label(ctx, 'THE BOSS’S SON', 340, 630, pop(t, tBoss - 0.05), { size: 42, col: C.yellow, rot: 0.03 }); ctx.restore(); }
  ST.grade(ctx, 'office', 0.2);
});
// E (s05 "His team dug up an old medical word: halitosis."): the ad men open an old medical book; dust; HALITOSIS flies out
const tTeam = at('s05', 'team'), tDug = at('s05', 'dug'), tOld = at('s05', 'old'), tMed = at('s05', 'medical'), tHali = at('s05', 'halitosis');
shot('E word', Z.s05 - 0.12, Z.s06 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -560, 0.92], [1.8, 0, -560, 0.95], [3.6, 0, -640, 1.05]], lt);
  layer(ctx, c, 1, w => {
    S.office(w, t);
    P.person(w, -420, 0, 1.02, 1, ADMAN1, { face: FACE(t > tHali ? 'surprised' : 'thinking', [1, 0.5], t), lean: 0.08 });
    P.person(w, 0, 40, 0.92, 1, LAMBERT, { face: FACE(t > tHali ? 'grin' : 'neutral', [0.6, 0.6], t, 2) }, { tie: C.red });
    P.person(w, 420, 0, 1.02, -1, ADMAN2, { face: FACE(t > tHali ? 'grin' : 'neutral', [1, 0.5], t, 1), lean: 0.08 }, { tie: '#2E3A59' });
    SE.desk(w, 0, 760, -280, '#6A4024');
    const drop = E.out(seg(t, tDug - 0.25, tDug + 0.1)); w.save(); w.translate(0, lerp(-900, -280, drop)); if (drop > 0) S.book(w, 1, seg(t, tOld - 0.05, tOld + 0.25)); w.restore();
    S.dust(w, 0, -320, seg(t, tOld - 0.05, tOld + 1.0));
  });
  label(ctx, 'HIS TEAM', 540, 520, pop(t, tTeam - 0.05), { size: 56, col: C.yellow });
  label(ctx, 'AN OLD MEDICAL WORD', 540, 640, pop(t, tMed - 0.05), { size: 52 });
  ctx.save(); ctx.translate(540 + shake(t, tHali + 0.15, 10), 820); ST.stampWord(ctx, 'HALITOSIS', 120, seg(t, tHali - 0.05, tHali + 0.3)); ctx.restore();
  ST.grade(ctx, 'office', 0.2);
});
// F1 (s06 "Bad breath wasn't a smell anymore."): the party; a little green cloud
const tBad = at('s06', 'bad'), tSmell = at('s06', 'smell'), tAny = at('s06', 'anymore'), tIt = at('s06', 'it'), tCond = at('s06', 'condition'), tAnd6 = at('s06', 'and'), tNever6 = at('s06', 'never');
shot('F1 party', Z.s06 - 0.12, tIt - 0.12, (ctx, t, lt) => {
  partyScene(ctx, t, lt, 0, seg(t, at('s06', 'breath') - 0.1, at('s06', 'breath') + 0.4), [[0, 0, -560, 0.92], [2.5, -100, -560, 1.0]]);
  label(ctx, 'BAD BREATH', 540, 520, pop(t, tBad - 0.05), { size: 64, col: C.yellow });
  ctx.save(); ctx.translate(540, 650); label(ctx, '= JUST A SMELL', 0, 0, pop(t, tSmell - 0.05), { size: 50 }); ctx.translate(0, -10); ST.bigX(ctx, 70, seg(t, tAny, tAny + 0.25)); ctx.restore();
  ST.grade(ctx, 'office', 0.2);
});
// F2 (s06 "It was a condition."): a doctor's chart: DIAGNOSIS: HALITOSIS + red stamp CONDITION
shot('F2 condition', tIt - 0.12, tAnd6 - 0.12, (ctx, t, lt) => {
  ST.bg(ctx, '#5E7A8C'); ctx.fillStyle = 'rgba(255,255,255,0.06)'; for (let i = 0; i < 20; i++) ctx.fillRect(0, i * 100, W, 40);
  const z = 1 + lt * 0.04; ctx.save(); ctx.translate(540, 940); ctx.scale(z, z); ctx.rotate(-0.03);
  rr(ctx, -360, -500, 720, 1000, 20); R.fillStroke(ctx, '#8A5A34', 6); CL.cutout(ctx, () => rr(ctx, -320, -440, 640, 900, 6), '#FBF6EA', { elev: 1 });
  rr(ctx, -120, -530, 240, 80, 14); R.fillStroke(ctx, '#B9BEC2', 5);
  fitTxt(ctx, 'PATIENT CHART', 0, -340, 54, INK, 560, 'center', ST.FONT.type);
  fitTxt(ctx, 'COMPLAINT:', -270, -210, 40, '#4A4A48', 560, 'left', ST.FONT.type); fitTxt(ctx, 'bad breath', -270, -150, 48, INK, 560, 'left', ST.FONT.type);
  fitTxt(ctx, 'DIAGNOSIS:', -270, -40, 40, '#4A4A48', 560, 'left', ST.FONT.type);
  if (t > tIt + 0.15) fitTxt(ctx, 'HALITOSIS', -270, 30, 64, C.red, 560, 'left', ST.FONT.type);
  ctx.save(); ctx.translate(shake(t, tCond + 0.1, 8), 250); ST.stampWord(ctx, 'A CONDITION', 96, seg(t, tCond - 0.05, tCond + 0.3)); ctx.restore();
  ctx.restore(); ST.grade(ctx, 'office', 0.2);
});
// F3 (s06 "And your friends would never tell you."): back at the party, the friends turn away; he keeps smiling
shot('F3 friends', tAnd6 - 0.12, Z.s07 - 0.12, (ctx, t, lt) => {
  partyScene(ctx, t, lt + 2.5, seg(t, at('s06', 'friends') - 0.1, at('s06', 'friends') + 0.2), 1, [[2.5, -100, -560, 1.0], [5, -40, -560, 0.96]]);
  label(ctx, 'YOUR FRIENDS WON’T TELL YOU', 540, 520, pop(t, tNever6 - 0.1), { size: 52, col: C.red, fg: PAL.cream });
  ST.grade(ctx, 'office', 0.2);
});
// G (s07 "Then came Edna. Often a bridesmaid, never a bride."): garden wedding: the bride leaves, Edna stays with her bouquet; the ad headline
const tEdna = at('s07', 'edna'), tOften = at('s07', 'often'), tNeverB = at('s07', 'never');
shot('G wedding', Z.s07 - 0.12, Z.s08 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, -40, -620, 0.86], [3.8, 20, -620, 0.92]], lt);
  layer(ctx, c, 1, w => {
    S.wedding(w, t);
    const u = seg(t, tOften, tOften + 3), wx = lerp(180, 900, u), ph = t * 6;
    P.person(w, wx + 170, 0, 1.0, 1, GROOM, { ...(u > 0 && u < 1 ? R.walk(ph) : {}), face: FACE('smile', [1, 0], t) }, { tie: '#FFFDF8' });
    P.person(w, wx, 0, 1.0, 1, BRIDE, { ...(u > 0 && u < 1 ? R.walk(ph + 1) : {}), face: FACE('happy', [1, 0], t), armN: { hand: [110, -250], grip: 'hold', item: g => CS.bouquet(g, 1) } }); CS.skirt(w, wx, 0, 1.0, 1, BRIDE.top, 20);
    P.person(w, -400, 0, 1.0, 1, EDNA, { face: FACE(t > tNeverB ? 'worried' : 'smile', [1, 0], t, 1), armN: { hand: [110, -250], grip: 'hold', item: g => CS.bouquet(g, 1) }, armF: { hand: [90, -250], grip: 'hold' } }); CS.skirt(w, -400, 0, 1.0, 1, EDNA.top);
  });
  label(ctx, 'EDNA', 300, 900, pop(t, tEdna - 0.05), { size: 56, col: C.yellow, arrow: 1, arrowX: 0 });
  ctx.save(); ctx.translate(540, 600); S.clipping(ctx, 'OFTEN A BRIDESMAID,', 'NEVER A BRIDE', seg(t, tOften - 0.1, tOften + 0.3)); ctx.restore();
  ST.grade(ctx, 'golden', 0.2);
});
// H (s08 "Her problem? Not her looks. Her breath."): Edna close with a hand mirror; looks fine; the green cloud
const tProb = at('s08', 'problem'), tLooks = at('s08', 'looks'), tBreath = at('s08', 'breath');
shot('H edna', Z.s08 - 0.12, Z.s09 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, -40, -620, 1.3], [3, -20, -640, 1.36]], lt);
  layer(ctx, c, 1, w => {
    SE.room(w, t, { wall: '#F2DCE2', floor: 'wood', frame: { x: 420, y: -1000 } });
    const r = P.person(w, -160, 0, 1.15, 1, EDNA, { face: FACE(t > tBreath - 0.1 ? 'shocked' : t > tLooks ? 'smile' : 'worried', [1, -0.1], t), armN: { hand: [170, -470], grip: 'hold', item: g => { R.tube(g, [[0, 10], [0, 60]], 12, '#C9A06A', 3); R.ell(g, 0, -30, 40, 50); R.fillStroke(g, '#C9A06A', 4); R.ell(g, 0, -30, 30, 40); R.fillStroke(g, '#CFE3EE', 3); } } }); CS.skirt(w, -160, 0, 1.15, 1, EDNA.top);
    const [mx, my] = mouthOf(-160, 0, 1.15, 1, r); S.breathCloud(w, mx + 70, my - 10, 0.9, seg(t, tBreath - 0.05, tBreath + 0.35), t);
  });
  label(ctx, 'HER PROBLEM?', 540, 520, pop(t, Z.s08), { size: 60 });
  label(ctx, 'LOOKS: FINE', 330, 650, pop(t, tLooks - 0.05), { size: 54, col: '#2FA37E', fg: PAL.cream, rot: -0.04 });
  label(ctx, 'BREATH: “HALITOSIS”', 560, 780, pop(t, tBreath - 0.05), { size: 58, col: C.red, fg: PAL.cream, rot: 0.03 });
  ST.grade(ctx, 'office', 0.2);
});
// I (s09 "In seven years, revenue reportedly jumped from $115,000 to over $8 million."): two bars; the right one shoots up
const tSeven = at('s09', 'seven'), tRev = at('s09', 'revenue'), tRep = at('s09', 'reportedly'), t115 = at('s09', '115'), tTo = at('s09', 'to'), t8 = at('s09', '8'), tMil = at('s09', 'million');
shot('I revenue', Z.s09 - 0.12, Z.s10 - 0.12, (ctx, t, lt) => {
  ST.bg(ctx, PAL.paper); ctx.fillStyle = 'rgba(77,141,255,0.12)'; for (let i = 0; i < 30; i++) ctx.fillRect(0, i * 70, W, 3);
  const base = 1300;
  ctx.strokeStyle = PAL.ink; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(110, base); ctx.lineTo(970, base); ctx.stroke();
  const u1 = E.back(seg(t, t115 - 0.1, t115 + 0.3), 1.6), hb = 24 * u1; if (u1 > 0) { CL.cutout(ctx, () => rr(ctx, 210, base - hb, 180, hb, 6), C.yellow, { elev: 1 }); }
  const g = E.out(seg(t, tTo, tMil + 0.5)), h2 = lerp(24, 500, g); if (t > tTo - 0.05) { CL.cutout(ctx, () => rr(ctx, 620, base - h2, 220, h2, 8), '#2FA37E', { elev: 1.4 });
    for (let i = 0; i < Math.floor(h2 / 120); i++) { ctx.save(); ctx.translate(730, base - 40 - i * 120); ctx.globalAlpha = 0.9; txt(ctx, '$', 0, 30, 80, 'rgba(255,253,248,0.6)'); ctx.restore(); } }
  label(ctx, '$115,000', 300, base - hb - 80, pop(t, t115 - 0.05), { size: 64, col: C.yellow });
  if (t > tTo - 0.05) { const v = t < t8 ? lerp(115000, 8000000, E.inOut(seg(t, tTo, t8))) : 8000000; const s = '$' + Math.round(v / 1000).toLocaleString('en-US') + ',000' + (t > tMil - 0.1 ? '+' : '');
    label(ctx, s, 680, base - h2 - 80, 1, { size: 64, col: C.red, fg: PAL.cream, rot: 0.03, maxW: 600 }); }
  label(ctx, 'REVENUE', 300, 520, pop(t, tRev - 0.05), { size: 64 });
  label(ctx, 'IN 7 YEARS', 300, 640, pop(t, tSeven - 0.05), { size: 56, col: C.yellow, rot: 0.03 });
  if (t > tRep - 0.05) fitTxt(ctx, '(reported figures)', 540, base + 70, 40, '#6A6A68', 400, 'center', ST.FONT.type);
  ctx.save(); ctx.translate(300, base + 10); ctx.restore();
  ST.grade(ctx, 'office', 0.15);
});
// J (s10 "They didn't sell a cure. They sold the fear."): the bottle on a pedestal in a spotlight, money bags; CURE struck out, FEAR = $
const tCure = at('s10', 'cure'), tSold = at('s10', 'sold'), tFear = at('s10', 'fear');
shot('J fear', Z.s10 - 0.12, tEnd, (ctx, t, lt) => {
  const c = cam([[0, 0, -610, 0.95], [2.6, 0, -615, 0.98]], lt);
  layer(ctx, c, 1, w => {
    SE.room(w, t, { wall: '#3A3F52', floor: 'carpet', carpet: '#5A2E3A' });
    S.spot(w, 0, -1500, 0, 520);
    for (let i = 0; i < 5; i++) { const u = E.back(seg(t, tSold - 0.1 + i * 0.08, tSold + 0.2 + i * 0.08), 2); if (u > 0) { w.save(); w.translate(-480 + i * 240 + (i === 2 ? 0 : 0), i === 2 ? 0 : 0); w.scale(u, u); if (i !== 2) S.moneyBag(w, 1.3 - Math.abs(i - 2) * 0.12); w.restore(); } }
    S.pedestal(w, 1); w.save(); w.translate(0, -460); CS.bottle(w, 1.0, { name: 'LISTERINE' }); w.restore();
  });
  ctx.save(); ctx.translate(540, 560); label(ctx, 'A CURE', 0, 0, pop(t, Z.s10 + 0.1), { size: 70, col: '#2FA37E', fg: PAL.cream }); ctx.translate(0, -10); ST.bigX(ctx, 80, seg(t, tCure, tCure + 0.25)); ctx.restore();
  ctx.save(); ctx.translate(540 + shake(t, tFear + 0.1, 10), 690); ST.stampWord(ctx, 'FEAR = $', 100, seg(t, tFear - 0.05, tFear + 0.3)); ctx.restore();
  ST.grade(ctx, 'office', 0.24);
});
// K (end card, 2 s+): the frame-0 picture again (loop) + the question
shot('K end', tEnd, T + 0.01, (ctx, t, lt) => { hookScene(ctx, t, lt + 1, 1.14, 1.16); ST.grade(ctx, 'office', 0.2); }, { type: 'cut' });

// ---------- edit, overlays, subtitles ----------
SH.sort((a, b) => a.t0 - b.t0);
const ED = makeEdit(SH, W, H);
const SPLIT = { s01: [3, 4], s02: [5, 5], s03: [3, 3], s04: [4, 3, 5], s05: [4, 5], s06: [6, 4, 7], s07: [3, 6], s08: [2, 3, 2], s09: [6, 6], s10: [5, 4] };
const REPL = [];
function subs() {
  const G = [];
  Object.keys(Z).forEach(id => { const ws = V.words(id); let k0 = 0; SPLIT[id].forEach(n => { G.push({ id, words: ws.slice(k0, k0 + n) }); k0 += n; }); if (k0 !== ws.length) throw new Error(`subtitle split ${id}: ${k0} vs ${ws.length}`); });
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
  if (!o.nosubs) EN.drawSubtitles(ctx, t, SUBS, { ...ST.SUBS, highlight: ['floors', 'wounds', 'barely', '1921', 'halitosis', 'condition', 'never', 'edna', 'breath', '$115000', '$8', 'million', 'fear'] });
}

// ---------- sound cues (for mix.py) ----------
function cues() {
  const c = [['slam', 0.0, 2.0], ['ding', 0.02, 1.4], ['pop', 0.1, 1.2], ['pop', 0.3, 0.6], ['puff', tScrub, 0.5]];
  c.push(['cut', Z.s02 - 0.12, 0.35], ['clink', Z.s02 + 0.3, 0.5], ['pour', Z.s02 + 0.45, 0.6], ['stamp', tWounds + 0.1, 0.8]);
  c.push(['cut', tJan - 0.12, 0.35], ['pour', tJan, 0.6], ['stamp', tFloors2 + 0.1, 0.8], ['scrub', tFloors2 + 0.2, 0.5]);
  c.push(['cut', Z.s03 - 0.12, 0.35], ['pop', Z.s03 + 0.05, 0.5], ['pop', tBarely - 0.1, 0.5], ['wah', tCared + 0.1, 0.6]);
  c.push(['cut', Z.s04 - 0.12, 0.35], ['flip', t1921 - 0.1, 0.6], ['pop', tGerard - 0.05, 0.5], ['pop', tBoss - 0.05, 0.4], ['sparkle', tNeeded, 0.4]);
  c.push(['cut', Z.s05 - 0.12, 0.35], ['pop', tTeam - 0.05, 0.4], ['thump', tDug + 0.05, 0.8], ['puff', tOld, 0.9], ['pop', tMed - 0.05, 0.4], ['stamp', tHali + 0.1, 1.0]);
  c.push(['cut', Z.s06 - 0.12, 0.35], ['pop', tBad - 0.05, 0.5], ['puff', at('s06', 'breath'), 0.6], ['pop', tSmell - 0.05, 0.4], ['snap', tAny, 0.6]);
  c.push(['cut', tIt - 0.12, 0.35], ['type', tIt + 0.15, 0.6], ['type', tIt + 0.3, 0.6], ['stamp', tCond + 0.1, 0.9]);
  c.push(['cut', tAnd6 - 0.12, 0.35], ['whoosh', at('s06', 'friends') - 0.1, 0.4], ['pop', tNever6 - 0.1, 0.5]);
  c.push(['cut', Z.s07 - 0.12, 0.35], ['ding', Z.s07 + 0.1, 0.4], ['pop', tEdna - 0.05, 0.5], ['flip', tOften - 0.1, 0.6], ['wah', tNeverB + 0.3, 0.5]);
  c.push(['cut', Z.s08 - 0.12, 0.35], ['pop', Z.s08, 0.4], ['sparkle', tLooks - 0.05, 0.4], ['puff', tBreath, 0.8], ['buzzer', tBreath + 0.1, 0.5]);
  c.push(['cut', Z.s09 - 0.12, 0.35], ['pop', tRev - 0.05, 0.4], ['pop', tSeven - 0.05, 0.4], ['tag', t115 - 0.05, 0.5], ['rise', tTo, 0.6], ['kaching', tMil, 0.7], ['coins', tMil + 0.1, 0.6]);
  c.push(['cut', Z.s10 - 0.12, 0.35], ['pop', Z.s10 + 0.1, 0.4], ['snap', tCure, 0.6], ['coins', tSold, 0.5], ['stamp', tFear + 0.1, 1.0]);
  c.push(['cut', tEnd, 0.4], ['pop', tEnd + 0.05, 0.6], ['blip', tEnd + 0.4, 0.4]);
  return c;
}
const MUSIC = { b0: 0, origin: Z.s02, flat: Z.s03, plan: Z.s04, fear: Z.s06, edna: Z.s07, money: Z.s09, twist: Z.s10, hit: tEnd, end: T };

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
  const KEY = [['01_hook', 0.8], ['02_antiseptic', tWounds + 0.25], ['03_halitosis', tHali + 0.7], ['04_edna', tNeverB + 0.5], ['05_8_million', tMil + 0.7], ['06_question', tEnd + 1.0]];
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
