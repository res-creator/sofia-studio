// Episode 21 "Sugar paid scientists" (How It's Run) — USA 1965–67: the Sugar Research Foundation paid Harvard scientists ($6,500, ≈ $48,000
// in 2016 dollars) for a review of diet and heart disease; it set the goal and sent the studies it wanted challenged; the review ran in a top
// medical journal in 1967, played sugar down and put the focus on fat; the funding was not disclosed; found in archive letters in 2016
// (JAMA Internal Medicine). Honest ending: no one proved the money changed a word — but the science had a sponsor, and nobody was told.
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
const S = require('./sugarkit');
const { C, F, clamp, lerp, seg, E, rr, hash } = K;
const { W, H, FPS, PAL, layer, cam, shake, pop, blink, label, txt, fitTxt } = ST;
const { EXEC, SCI, RESEARCHER, READER, ACC, scientist } = S.CS;

// ---------- voice timeline (natural speed; real speech start/end from vo/speech.json, gaps only) ----------
const LINES = JSON.parse(fs.readFileSync(`${__dirname}/script.json`));
const SP = JSON.parse(fs.readFileSync(`${__dirname}/vo/speech.json`));
const GAP = { s01: 0.3, s02: 0.3, s03: 0.3, s04: 0.3, s05: 0.3, s06: 0.3, s07: 0.3, s08: 0.3, s09: 0.4, s10: 0 };
const STt = {}; let T = 0.05; for (const L of LINES) { STt[L.id] = +(T - SP[L.id][0]).toFixed(3); T += SP[L.id][1] - SP[L.id][0] + GAP[L.id]; }
const V = EN.voice(`${__dirname}/vo`, STt), at = (id, w, n = 0) => V.at(id, w, n), end = id => STt[id] + SP[id][1];
const tEnd = +(end('s10') + 0.15).toFixed(2);
T = +(tEnd + 2.3).toFixed(2);
const Z = STt;

// ---------- helpers ----------
const FACE = (n, look = [1, 0], t = 0, o = 0) => R.expr(n, { look, blink: blink(t, 3.2, o) });
const envItem = (rot = 0.5, o = {}) => g => { g.save(); g.translate(30, -30); g.rotate(rot); S.envelope(g, 0.5, o); g.restore(); };
function wallBg(ctx, col = '#EFE3CB') { ST.bg(ctx, col); ctx.fillStyle = 'rgba(160,120,80,0.08)'; for (let x = 0; x < W; x += 110) ctx.fillRect(x, 0, 6, H); }
// frame 0 / end card picture: the sugar man hands the envelope to the scientist on the campus lawn; sugar cubes pour out
function handoff(ctx, t, lt, z0, z1) {
  const c = cam([[0, 0, -560, z0], [4, 10, -580, z1]], lt);
  layer(ctx, c, 1, w => {
    S.campus(w, t);
    S.cubeRain(w, t, -70, -330, 9, { p: 1.1, a: 30, dir: 0.6, pile: 8 });
    P.person(w, -330, 0, 1.1, 1, EXEC, { face: FACE('smug', [1, -0.1], t), armN: { hand: [160, -310], grip: 'hold', item: envItem(0.55) } }, ACC.EXEC);
    scientist(w, 270, 0, 1.1, -1, { face: FACE(t % 4 < 2 ? 'surprised' : 'grin', [1, 0.1], t, 1), armN: { hand: [140, -300], grip: 'open' }, headTilt: Math.sin(t * 2) * 0.03 });
  });
}

// ---------- overlays ----------
function overlays(ctx, t) {
  const a = 1 - seg(t, tQuiet - 0.3, tQuiet - 0.08);
  if (a > 0) { const u = t < 0.02 ? 0.6 : E.back(seg(t, 0, 0.32), 2.2); ctx.save(); ctx.translate(540, 480); ctx.scale(lerp(0.6, 1, u), lerp(0.6, 1, u)); ctx.translate(-540, -480); ST.headline2(ctx, 'SUGAR PAID', 'SCIENTISTS', a, 420); ctx.restore(); }
  if (t < tQuiet - 0.1) label(ctx, 'USA · 1960s', W / 2, 680, pop(t, 0.15), { size: 40, col: '#171717', fg: C.yellow, rot: 0.02 });
  ST.stampLabel(ctx);
  if (t >= tEnd) ST.questionCard(ctx, t, ["WHAT FOOD 'FACT'", 'DO YOU'], 'NOT TRUST ANYMORE?', E.back(seg(t, tEnd, tEnd + 0.35), 2), { arrow: true, y: 560 });
}

// ================= SHOTS =================
const SH = []; const shot = (id, t0, t1, draw, out) => SH.push({ id, t0, t1, draw, out });
// A1 (s01): frame 0 — the envelope full of sugar cubes changes hands on the campus lawn
const tHarvard = at('s01', 'harvard'), tQuiet = at('s01', 'quietly');
shot('A1 handoff', 0, Z.s02 - 0.12, (ctx, t, lt) => {
  handoff(ctx, t, lt, 0.98, 1.1);
  label(ctx, 'QUIETLY HIRED', 540, 420, pop(t, tQuiet - 0.05), { size: 50, col: C.yellow, rot: 0.03 });
  label(ctx, 'HARVARD SCIENTISTS', 540, 540, pop(t, tHarvard - 0.05), { size: 60, rot: -0.02 });
  ST.grade(ctx, 'day', 0.2);
});
// B1 (s02): the scientist at his desk behind piles of journals; the paper heart with a "?"
const tJob = at('s02', 'job'), tReview2 = at('s02', 'review'), tHeart = at('s02', 'heart');
shot('B1 job', Z.s02 - 0.12, Z.s03 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, -40, -560, 0.92], [3.5, 0, -580, 0.98]], lt);
  layer(ctx, c, 1, w => { S.office(w, t, { window: 700, frameX: -650 });
    P.seated(w, -380, 0, 1.1, 1, SCI, { face: FACE(t > tHeart ? 'worried' : 'thinking', [1, -0.2], t), armN: { hand: [150, -360], grip: 'hold', item: g => { g.save(); g.translate(10, -40); S.journal(g, 0.22, { sub: false, lines: 4 }); g.restore(); } }, armF: { hand: [120, -350], grip: 'hold' } });
    SE.desk(w, 220, 700, -300, '#8A5A34'); w.save(); w.translate(80, -300); S.stack(w, 9, 1); w.restore(); w.save(); w.translate(420, -300); S.stack(w, 12, 4); w.restore();
    const u = pop(t, tHeart - 0.1, 0.35); if (u > 0) { w.save(); w.translate(250, -900 + Math.sin(t * 3) * 10); w.scale(u, u); S.heart(w, 1.1); w.restore(); } });
  label(ctx, 'THEIR JOB:', 540, 420, pop(t, tJob - 0.05), { size: 54, col: C.yellow });
  label(ctx, 'REVIEW WHAT CAUSES HEART DISEASE', 540, 530, pop(t, tReview2 - 0.05), { size: 44 });
  ST.grade(ctx, 'office', 0.2);
});
// C1 (s03 "Early studies were starting to point at sugar."): studies on a corkboard, a red arrow grows to the sugar bowl
const tEarly = Z.s03, tPoint = at('s03', 'point'), tThe3 = at('s03', 'the'), tWorried = at('s03', 'worried');
shot('C1 studies', Z.s03 - 0.12, tThe3 - 0.12, (ctx, t, lt) => {
  wallBg(ctx, '#DCE6EE'); const z = 1 + lt * 0.02; ctx.save(); ctx.translate(540, 900); ctx.scale(z, z); ctx.translate(-540, -900);
  ctx.save(); ctx.translate(540, 760); ctx.scale(0.86, 0.86); S.board(ctx);
  for (let i = 0; i < 3; i++) { const u = pop(t, tEarly + 0.1 + i * 0.25); if (u > 0) { ctx.save(); ctx.translate(-300 + i * 300, -20); ctx.rotate((hash(i) - 0.5) * 0.12); ctx.scale(u, u); S.study(ctx, 1, 'STUDY ' + (i + 1)); ctx.restore(); } }
  ctx.restore();
  // the arrow from the studies down to the sugar bowl
  const g = E.out(seg(t, tPoint - 0.1, tPoint + 0.45)); if (g > 0) { const x0 = 540, y0 = 960, x1 = lerp(x0, 720, g), y1 = lerp(y0, 1200, g);
    ctx.lineCap = 'round'; ctx.strokeStyle = '#171717'; ctx.lineWidth = 30; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.strokeStyle = C.red; ctx.lineWidth = 20; ctx.stroke();
    const an = Math.atan2(y1 - y0, x1 - x0); ctx.save(); ctx.translate(x1, y1); ctx.rotate(an); ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(-30, -36); ctx.lineTo(-30, 36); ctx.closePath(); ctx.fillStyle = C.red; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#171717'; ctx.stroke(); ctx.restore(); }
  ctx.save(); ctx.translate(800, 1440); S.sugarBowl(ctx, 1.05); ctx.restore();
  ctx.restore();
  label(ctx, 'EARLY STUDIES', 540, 400, pop(t, tEarly), { size: 60, col: C.yellow });
  label(ctx, 'POINTING AT SUGAR', 330, 1330, pop(t, tPoint + 0.2), { size: 46, rot: -0.04 });
  ST.grade(ctx, 'office', 0.15);
});
// C2 (s03 "The industry was worried."): the sugar man in his office, tugging at his tie
shot('C2 worried', tThe3 - 0.12, Z.s04 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 60, -620, 1.15], [1.4, 60, -640, 1.24]], lt);
  layer(ctx, c, 1, w => { S.office(w, t, { window: 500, frameX: -560 });
    const j = Math.sin(t * 40) * 3; P.person(w, -40 + j, 0, 1.2, 1, EXEC, { face: FACE('worried', [1, -0.1], t), armN: { hand: [70, -420], grip: 'pinch' }, headTilt: -0.04 }, ACC.EXEC);
    const d = (lt * 0.8) % 1; w.save(); w.translate(170, -760 + d * 80); w.globalAlpha = 1 - d; w.beginPath(); w.moveTo(0, -24); w.quadraticCurveTo(16, 0, 0, 12); w.quadraticCurveTo(-16, 0, 0, -24); R.fillStroke(w, '#8FC7F2', 3); w.restore(); });
  label(ctx, 'THE SUGAR INDUSTRY', 540, 420, pop(t, tThe3), { size: 52 });
  label(ctx, 'WORRIED', 540, 530, pop(t, tWorried - 0.05), { size: 64, col: C.red, fg: PAL.cream });
  ST.grade(ctx, 'office', 0.22);
});
// D1 (s04): the sugar man sends envelopes of studies to the scientist's desk; PLEASE REVIEW
const tPicked = at('s04', 'picked'), tMailed = at('s04', 'mailed'), tChall = at('s04', 'challenged');
shot('D1 mailed', Z.s04 - 0.12, Z.s05 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -560, 0.84], [3.5, 30, -570, 0.88]], lt);
  layer(ctx, c, 1, w => { S.office(w, t, { window: 1500, frameX: 0 });
    P.person(w, -470, 0, 1.05, 1, EXEC, { face: FACE(t > tMailed ? 'smug' : 'neutral', [1, -0.1], t), armN: t < tPicked ? { hand: [60, -300], grip: 'relax' } : { hand: [170, -330], grip: 'point' } }, ACC.EXEC);
    P.seated(w, 480, 0, 1.0, -1, SCI, { face: FACE(t > tChall ? 'skeptical' : 'neutral', [1, 0.1], t) });
    SE.desk(w, 200, 360, -300, '#8A5A34');
    for (let i = 0; i < 4; i++) { const t0 = tMailed - 0.15 + i * 0.22, u = E.inOut(seg(t, t0, t0 + 0.55)); if (t < t0) continue;
      const x = lerp(-300, 200, u), y = lerp(-380, -330 - i * 26, u) - Math.sin(u * Math.PI) * 220; w.save(); w.translate(x, y); w.rotate((1 - u) * 0.6); S.envelope(w, 0.55, { cubes: false, mark: false, text: 'STUDIES', col: '#F4EEDF', open: 0 }); w.restore(); } });
  label(ctx, 'IT PICKED THE QUESTION', 540, 420, pop(t, tPicked - 0.05), { size: 54, col: C.yellow });
  label(ctx, 'MAILED: STUDIES TO CHALLENGE', 540, 530, pop(t, tMailed + 0.2), { size: 44 });
  const u = seg(t, tChall - 0.05, tChall + 0.35); if (u > 0) { ctx.save(); ctx.translate(560 + shake(t, tChall + 0.2, 8), 1160); ST.stampWord(ctx, 'PLEASE REVIEW', 66, u); ctx.restore(); }
  ST.grade(ctx, 'office', 0.2);
});
// E1 (s05 "One scientist wrote back:"): the scientist at the typewriter
const tWe = at('s05', 'we'), tInterest = at('s05', 'interest');
shot('E1 typing', Z.s05 - 0.12, tWe - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 40, -560, 1.05], [2, 60, -570, 1.12]], lt);
  layer(ctx, c, 1, w => { S.office(w, t, { window: 700, frameX: -500 });
    const k = Math.sin(t * 22) * 8; P.seated(w, -180, 0, 1.1, 1, SCI, { face: FACE('smile', [1, 0.3], t), armN: { hand: [215, -330 + k], grip: 'relax' }, armF: { hand: [190, -330 - k], grip: 'relax' } });
    SE.desk(w, 280, 560, -300, '#8A5A34'); w.save(); w.translate(160, -300); S.typewriter(w, 0.9, t, 1); w.restore(); });
  label(ctx, 'THE REPLY · 1965', 540, 420, pop(t, Z.s05 + 0.1), { size: 54, col: C.yellow });
  ST.grade(ctx, 'office', 0.2);
});
// E2 (s05 the quote): the typed letter, the quote types in with the voice, highlighted on "interest"
const QUOTE = ['"We are well aware', 'of your particular', 'interest."'];
shot('E2 letter', tWe - 0.12, Z.s06 - 0.12, (ctx, t, lt) => {
  wallBg(ctx, '#8A5A34'); ctx.fillStyle = 'rgba(0,0,0,0.12)'; for (let y = 0; y < H; y += 90) ctx.fillRect(0, y, W, 4);
  const z = 0.92 + lt * 0.015, n = Math.round(lerp(0, QUOTE.join('').length, seg(t, tWe - 0.05, end('s05') - 0.1)));
  ctx.save(); ctx.translate(540, 930); ctx.scale(z, z); S.letter(ctx, { quote: QUOTE, n, hl: seg(t, tInterest, tInterest + 0.5) }); ctx.restore();
  ST.grade(ctx, 'office', 0.2);
});
// F1 (s06 "The review ran in a top medical journal."): the journal cover, 1967
const tTop = at('s06', 'top'), tJournal = at('s06', 'journal'), tSugar6 = at('s06', 'sugar'), tPlayed = at('s06', 'played'), tFat = at('s06', 'fat'), tTarget = at('s06', 'target');
shot('F1 journal', Z.s06 - 0.12, tSugar6 - 0.12, (ctx, t, lt) => {
  wallBg(ctx, '#5E7A8C'); ctx.fillStyle = 'rgba(255,255,255,0.06)'; for (let i = 0; i < 20; i++) ctx.fillRect(0, i * 100, W, 40);
  const u = E.back(seg(t, Z.s06 - 0.12, Z.s06 + 0.3), 1.6); ctx.save(); ctx.translate(540, lerp(1500, 930, u)); ctx.rotate(-0.03); S.journal(ctx, 1.05, { footer: 'FUNDING: —' }); ctx.restore();
  label(ctx, 'A TOP MEDICAL JOURNAL', 540, 420, pop(t, tTop - 0.05), { size: 54, col: C.yellow });
  label(ctx, '1967', 830, 1330, pop(t, tJournal - 0.05), { size: 80, col: C.red, fg: PAL.cream, rot: 0.05 });
  ST.grade(ctx, 'office', 0.15);
});
// F2 (s06 "Sugar? Played down. Fat? The main target."): the open review: the sugar bowl shrinks, a target lands on the butter
shot('F2 spread', tSugar6 - 0.12, Z.s07 - 0.12, (ctx, t, lt) => {
  wallBg(ctx, '#5E7A8C'); ctx.fillStyle = 'rgba(255,255,255,0.06)'; for (let i = 0; i < 20; i++) ctx.fillRect(0, i * 100, W, 40);
  ctx.save(); ctx.translate(540, 900); ctx.scale(1.0, 1.0);
  S.spread(ctx, { left: g => { const k = lerp(1.0, 0.45, E.inOut(seg(t, tPlayed, tPlayed + 0.5))); g.save(); g.translate(0, 180); S.sugarBowl(g, k); g.restore(); },
    right: g => { const u = pop(t, tFat - 0.05); if (u > 0) { g.save(); g.translate(0, 170); S.butter(g, 0.95 * u); g.restore(); }
      const d = E.out(seg(t, tTarget - 0.2, tTarget + 0.15)); if (d > 0) { g.save(); g.translate(0, lerp(-500, 40, d)); g.globalAlpha = 0.9; S.target(g, 110); g.restore(); } } });
  ctx.restore();
  label(ctx, 'SUGAR? PLAYED DOWN', 540, 420, pop(t, tPlayed - 0.05), { size: 54, col: PAL.cream });
  label(ctx, 'FAT? THE MAIN TARGET', 540, 1340, pop(t, tTarget - 0.1), { size: 54, col: C.red, fg: PAL.cream, rot: 0.03 });
  ST.grade(ctx, 'office', 0.15);
});
// G1 (s07 "Nobody told readers who paid for it."): a reader in his armchair; FUNDING: ??? stamp
const tPaid = at('s07', 'paid');
shot('G1 reader', Z.s07 - 0.12, Z.s08 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 40, -600, 1.0], [2, 60, -610, 1.06]], lt);
  layer(ctx, c, 1, w => { SE.room(w, t, { wall: '#E6D8C0', floor: 'carpet', carpet: '#6E5A4A', window: -650 }); w.save(); w.translate(420, 0); S.lamp(w); w.restore();
    w.save(); w.translate(-120, 0); S.armchair(w); w.restore();
    P.seated(w, -110, 0, 1.15, 1, READER, { chair: false, face: FACE('neutral', [1, 0.3], t), armN: { hand: [180, -390], grip: 'hold', item: g => { g.save(); g.translate(20, -40); S.journal(g, 0.32, { lines: 4 }); g.restore(); } }, armF: { hand: [150, -380], grip: 'hold' } }, ACC.READER); });
  const u = seg(t, tPaid - 0.05, tPaid + 0.35); if (u > 0) { ctx.save(); ctx.translate(540 + shake(t, tPaid + 0.2, 8), 520); ST.stampWord(ctx, 'FUNDING: ???', 96, u); ctx.restore(); }
  label(ctx, 'NOBODY TOLD READERS', 540, 380, pop(t, Z.s07), { size: 46 });
  ST.grade(ctx, 'golden', 0.22);
});
// H1 (s08): 50 years later, 2016: the researcher finds the letters in the archive boxes
const t2016 = at('s08', '2016'), tLetters = at('s08', 'letters'), tFound = at('s08', 'found');
shot('H1 archive', Z.s08 - 0.12, Z.s09 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, -40, -620, 0.9], [4.5, 40, -640, 1.0]], lt);
  layer(ctx, c, 1, w => { SE.room(w, t, { wall: '#DCE6EE', floor: 'tile' }); S.shelves(w, -1400, -250, 0); S.shelves(w, 600, 1700, 2);
    w.save(); w.translate(330, -2); S.archiveBox(w, 1.1, '1965', { lidOpen: seg(t, tFound - 0.4, tFound) }); w.restore();
    const up = t > tFound; P.person(w, 0, 0, 1.15, 1, RESEARCHER, { face: FACE(t > tLetters ? 'surprised' : 'thinking', up ? [1, -0.5] : [1, 0.6], t), lean: up ? 0 : 0.18,
      armN: up ? { hand: [160, -440], grip: 'pinch', item: g => { g.save(); g.translate(30, -80); g.rotate(0.05); g.scale(0.22, 0.22); S.letter(g, { quote: QUOTE }); g.restore(); } } : { hand: [230, -230], grip: 'open' } }, ACC.RESEARCHER); });
  label(ctx, '50 YEARS LATER', 540, 400, pop(t, Z.s08), { size: 56 });
  label(ctx, '2016', 540, 520, pop(t, t2016 - 0.05), { size: 80, col: C.yellow, rot: 0.03 });
  label(ctx, 'THE OLD LETTERS', 540, 650, pop(t, tLetters - 0.05), { size: 50, col: C.red, fg: PAL.cream });
  ST.grade(ctx, 'office', 0.2);
});
// I1 (s09): the price of the review: the envelope with a price tag; $6,500 (≈ $48,000 in 2016 dollars)
const tPrice = at('s09', 'price'), tSix = at('s09', 'six');
shot('I1 price', Z.s09 - 0.12, Z.s10 - 0.12, (ctx, t, lt) => {
  wallBg(ctx, '#E8DCC4'); ctx.fillStyle = '#8A5A34'; ctx.fillRect(0, 1250, W, 700); ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(0, 1250, W, 16);
  const z = 1 + lt * 0.02; ctx.save(); ctx.translate(540, 1000); ctx.scale(z, z); ctx.translate(-540, -1000);
  ctx.save(); ctx.translate(430, 1130); S.envelope(ctx, 1.4, { rot: -0.05 }); ctx.restore();
  for (let i = 0; i < 6; i++) { ctx.save(); ctx.translate(140 + i * 50 + hash(i) * 20, 1270 + (i % 2) * 10); S.cube(ctx, 44, hash(i + 3) - 0.5); ctx.restore(); }
  const u = pop(t, tPrice - 0.05); if (u > 0) { ctx.save(); ctx.translate(690, 920); ctx.scale(u, u); S.priceTag(ctx, 0.9, t < tSix - 0.05 ? 'PRICE' : '$6,500', Math.sin(t * 3) * 0.12 * Math.exp(-(t - tPrice) * 0.8)); ctx.restore(); }
  ctx.restore();
  const v = pop(t, tSix - 0.05, 0.35); if (v > 0) { ctx.save(); ctx.translate(540 + shake(t, tSix + 0.25, 8), 470); ctx.scale(v, v); CL.cutout(ctx, () => rr(ctx, -330, -100, 660, 180, 20), C.red, { elev: 2 }); txt(ctx, '$6,500', 0, 40, 130, PAL.cream); ctx.restore(); }
  label(ctx, '≈ $48,000 IN 2016 DOLLARS', 540, 650, pop(t, tSix + 0.8), { size: 40 });
  label(ctx, 'THE PRICE OF THE REVIEW', 540, 380, pop(t, tPrice - 0.05) * (t < tSix - 0.05 ? 1 : 0), { size: 48, col: C.yellow });
  ST.grade(ctx, 'office', 0.18);
});
// J1 (s10 "No one proved the money changed a word."): the scientist shrugs at us
const tProved = at('s10', 'proved'), tBut = at('s10', 'but'), tSponsor = at('s10', 'sponsor'), tTold = at('s10', 'told');
shot('J1 shrug', Z.s10 - 0.12, tBut - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 40, -620, 1.08], [2.4, 40, -630, 1.14]], lt);
  layer(ctx, c, 1, w => { S.office(w, t, { window: 600, frameX: -560 }); scientist(w, 40, 0, 1.2, 1, { face: FACE('skeptical', [-0.2, 0], t), headTilt: 0.05, armN: { hand: [110, -330], grip: 'open' }, armF: { hand: [70, -330], grip: 'open' } }); });
  label(ctx, 'NO PROOF IT CHANGED A WORD', 540, 420, pop(t, tProved - 0.05), { size: 50, col: PAL.cream });
  ST.grade(ctx, 'office', 0.2);
});
// J2 (s10 "But the science had a sponsor, and nobody was told."): the journal + the envelope beside it; NOT DISCLOSED
shot('J2 sponsor', tBut - 0.12, tEnd, (ctx, t, lt) => {
  wallBg(ctx, '#E8DCC4'); ctx.fillStyle = '#8A5A34'; ctx.fillRect(0, 1300, W, 700); ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(0, 1300, W, 16);
  ctx.save(); ctx.translate(380, 930); S.journal(ctx, 0.95, { rot: -0.04, footer: 'FUNDING: —' }); ctx.restore();
  const u = E.out(seg(t, tSponsor - 0.35, tSponsor + 0.1)); if (u > 0) { ctx.save(); ctx.translate(lerp(1300, 800, u), 1210); S.envelope(ctx, 0.95, { rot: 0.06 }); ctx.restore(); }
  label(ctx, 'THE SPONSOR', 800, 1000, pop(t, tSponsor + 0.05), { size: 46, col: C.yellow, arrow: 1, rot: 0.03 });
  const v = seg(t, tTold - 0.1, tTold + 0.3); if (v > 0) { ctx.save(); ctx.translate(390 + shake(t, tTold + 0.15, 8), 900); ST.stampWord(ctx, 'NOT DISCLOSED', 74, v); ctx.restore(); }
  ST.grade(ctx, 'office', 0.18);
});
// K (end card, >= 2 s): the frame-0 handoff again + the question
shot('K end', tEnd, T + 0.01, (ctx, t, lt) => { handoff(ctx, t, lt + 4, 1.1, 1.12); ST.grade(ctx, 'day', 0.2); });

// ---------- edit, overlays, subtitles ----------
SH.sort((a, b) => a.t0 - b.t0);
const ED = makeEdit(SH, W, H);
const SPLIT = { s01: [3, 4, 3], s02: [2, 6], s03: [8, 4], s04: [5, 8], s05: [4, 8], s06: [8, 3, 4], s07: [7], s08: [5, 7], s09: [6, 6], s10: [8, 6, 4] };
const REPL = [[/six thousand five hundred dollars/, '$6,500']];
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
  if (!o.nosubs) EN.drawSubtitles(ctx, t, SUBS, { ...ST.SUBS, highlight: ['quietly', 'harvard', 'heart', 'worried', 'challenged', 'interest', 'fat', 'paid', '2016', 'letters', '$6500', 'sponsor', 'told'] });
}

// ---------- sound cues (for mix.py) ----------
function cues() {
  const c = [['slam', 0.0, 2.0], ['ding', 0.02, 1.4], ['pop', 0.15, 1.0]];
  for (let i = 0; i < 6; i++) c.push(['clink', 0.5 + i * 0.55, 0.4]);
  c.push(['pop', tQuiet - 0.05, 0.4], ['pop', tHarvard - 0.05, 0.5]);
  c.push(['cut', Z.s02 - 0.12, 0.35], ['pop', tJob - 0.05, 0.5], ['pop', tReview2 - 0.05, 0.4], ['thump', tHeart, 0.6]);
  c.push(['cut', Z.s03 - 0.12, 0.35]); for (let i = 0; i < 3; i++) c.push(['tap', tEarly + 0.1 + i * 0.25, 0.6]); c.push(['rise', tPoint - 0.1, 0.5], ['clink', tPoint + 0.4, 0.6]);
  c.push(['cut', tThe3 - 0.12, 0.35], ['wah', tWorried + 0.1, 0.35]);
  c.push(['cut', Z.s04 - 0.12, 0.35], ['pop', tPicked - 0.05, 0.4]); for (let i = 0; i < 4; i++) c.push(['flip', tMailed - 0.1 + i * 0.22, 0.6]); c.push(['stamp', tChall + 0.15, 0.8]);
  c.push(['cut', Z.s05 - 0.12, 0.35]); for (let i = 0; i < 6; i++) c.push(['type', Z.s05 + 0.1 + i * 0.22, 0.5]);
  c.push(['cut', tWe - 0.12, 0.3]); for (let i = 0; i < 10; i++) c.push(['type', tWe + i * 0.2, 0.35]); c.push(['ding', tInterest + 0.6, 0.35]);
  c.push(['cut', Z.s06 - 0.12, 0.35], ['whoosh', Z.s06 - 0.1, 0.4], ['pop', tTop - 0.05, 0.4], ['stamp', tJournal, 0.5]);
  c.push(['cut', tSugar6 - 0.12, 0.35], ['fall', tPlayed, 0.5], ['pop', tFat - 0.05, 0.5], ['whoosh', tTarget - 0.25, 0.4], ['thump', tTarget + 0.1, 0.7]);
  c.push(['cut', Z.s07 - 0.12, 0.35], ['flip', Z.s07 + 0.2, 0.4], ['stamp', tPaid + 0.15, 0.9]);
  c.push(['cut', Z.s08 - 0.12, 0.35], ['pop', Z.s08, 0.4], ['pop', t2016 - 0.05, 0.5], ['paper', tFound - 0.2, 0.6], ['sparkle', tLetters, 0.5]);
  c.push(['cut', Z.s09 - 0.12, 0.35], ['pop', tPrice - 0.05, 0.4], ['kaching', tSix + 0.1, 0.6], ['stamp', tSix + 0.2, 0.5]);
  c.push(['cut', Z.s10 - 0.12, 0.35], ['pop', tProved - 0.05, 0.35], ['cut', tBut - 0.12, 0.35], ['whoosh', tSponsor - 0.35, 0.4], ['stamp', tTold + 0.1, 0.9]);
  c.push(['cut', tEnd, 0.4], ['pop', tEnd + 0.05, 0.6], ['blip', tEnd + 0.4, 0.4]);
  return c;
}
const MUSIC = { b0: 0, job: Z.s02, worry: Z.s03, deal: Z.s04, journal: Z.s06, reveal: Z.s08, twist: Z.s10, hit: tEnd, end: T };

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
  const KEY = [['01_hook', 0.8], ['02_studies_point_at_sugar', tThe3 - 0.25], ['03_the_letter', end('s05') - 0.05], ['04_sugar_down_fat_target', end('s06') - 0.1], ['05_6500', end('s09') - 0.1], ['06_question', tEnd + 1.0]];
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
