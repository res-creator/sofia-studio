// Episode 25 "More Doctors Smoke Camels" (How It's Run) — USA, 1946: R.J. Reynolds' ads said more doctors smoked its cigarette than any
// other, "proved" by a survey of 113,597 doctors. The survey was run by the company's own ad agency (William Esty), at medical conventions and
// doctors' offices, apparently right after handing out free cartons. Medical journals took cigarette ad money too; JAMA stopped only in 1953.
// Twist: the doctors weren't selling cigarettes — the money was.
// RULE for this episode: never show anyone smoking, no lit cigarette, no smoke — only sealed packs / cartons without logos.
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
const S = require('./camelkit');
const { C, F, clamp, lerp, seg, E, rr, hash } = K;
const { W, H, FPS, PAL, layer, cam, shake, pop, blink, label, txt, fitTxt } = ST;
const CS = S.CS; const { DOCTOR, AGENT, DOCS } = CS;

// ---------- voice timeline (natural speed; real speech start/end from vo/speech.json, gaps only) ----------
const LINES = JSON.parse(fs.readFileSync(`${__dirname}/script.json`));
const SP = JSON.parse(fs.readFileSync(`${__dirname}/vo/speech.json`));
const GAP = { s01: 0.3, s02: 0.3, s03: 0.3, s04: 0.25, s05: 0.25, s06: 0.35, s07: 0.3, s08: 0.4, s09: 0.2 };
const STt = {}; let T = 0.05; for (const L of LINES) { STt[L.id] = +(T - SP[L.id][0]).toFixed(3); T += SP[L.id][1] - SP[L.id][0] + GAP[L.id]; }
const V = EN.voice(`${__dirname}/vo`, STt), at = (id, w, n = 0) => V.at(id, w, n), end = id => STt[id] + SP[id][1];
const tEnd = +(end('s09') + 0.15).toFixed(2);
T = +(tEnd + 2.3).toFixed(2);
const Z = STt;

// ---------- helpers ----------
const FACE = (n, look = [1, 0], t = 0, o = 0) => R.expr(n, { look, blink: blink(t, 3.2, o) });
const cartonHold = (s = 0.6) => ({ hand: [120, -250], grip: 'hold', item: g => CS.carton(g, s) });
const PASSER = { ...P.LOOKS.casual, top: '#8A6A4A', cuff: '#76583C', pants: '#4A4F57' };
const cartonHoldF = { hand: [96, -245], grip: 'hold' };

// ---------- overlays ----------
function overlays(ctx, t) {
  const hA = 1 - seg(t, tMore - 0.2, tMore - 0.05);
  if (hA > 0) { ctx.save(); const u = pop(t, -0.12, 0.32, 2.2); ctx.translate(540, 420); ctx.scale(lerp(0.6, 1, u), lerp(0.6, 1, u)); ctx.translate(-540, -420); ST.headlineVs(ctx, 'DOCTORS', 'YOUR LUNGS', hA * clamp(u * 2), 420); ctx.restore(); }
  ST.stampLabel(ctx);
  if (t >= tEnd) ST.questionCard(ctx, t, ['WHAT AD FROM TODAY', 'WILL LOOK CRAZY'], 'IN 50 YEARS?', E.back(seg(t, tEnd, tEnd + 0.35), 2), { arrow: true, y: 600 });
}

// ================= SHOTS =================
const SH = []; const shot = (id, t0, t1, draw, out) => SH.push({ id, t0, t1, draw, out });
// A1 (s01 "In 1946, ads"): frame 0 — the street billboard: a doctor in a white coat holding up a sealed pack; a passer-by looks up, worried
const t1946 = at('s01', '1946'), tTold = at('s01', 'told'), tAmerica = at('s01', 'america'), tMore = at('s01', 'more'), tDocs1 = at('s01', 'doctors'), tSmoke1 = at('s01', 'smoke'), tThan = at('s01', 'than');
function billboardScene(ctx, t, lt, zoom, passer = true) {
  const c = cam([[0, 0, -780, zoom[0]], [2.2, 0, -800, zoom[1]]], lt);
  layer(ctx, c, 1, w => {
    S.street(w, t); S.billboard(w, t, 0.95, { face: R.expr('smile', { look: [0, 0], blink: blink(t, 2.8) }) });
    if (passer) { const Pz = { face: FACE(t < 0.35 ? 'surprised' : 'worried', [0.8, -0.9], t), headTilt: -0.12 }; const r = P.person(w, -340, 160, 1.1, 1, PASSER, Pz); w.save(); w.translate(-340, 160); w.scale(1.1, 1.1); CS.fedora(w, r, Pz, '#5A4A3A'); w.restore(); }
  });
}
shot('A1 billboard', 0, tMore - 0.12, (ctx, t, lt) => {
  billboardScene(ctx, t, lt, [0.86, 0.95]);
  label(ctx, 'USA · 1946', 540, 610, pop(t, Math.max(0.15, t1946 - 0.05)), { size: 44, col: '#171717', fg: C.yellow, rot: 0.02 });
  label(ctx, 'ADS ALL OVER AMERICA', 540, 1380, pop(t, tAmerica - 0.05), { size: 50, col: C.yellow });
  ST.grade(ctx, 'day', 0.2);
}, { type: 'cut' });
// A2 (s01 "told America: more doctors smoke this cigarette than any other."): the 1946 newspaper, the slogan pops word group by word group
shot('A2 paper', tMore - 0.12, Z.s02 - 0.12, (ctx, t, lt) => {
  ST.bg(ctx, '#B98A5A'); ctx.fillStyle = 'rgba(70,40,20,0.18)'; for (let y = 0; y < H; y += 70) ctx.fillRect(0, y, W, 3);
  const z = 0.92 + lt * 0.012; ctx.save(); ctx.translate(540, 930); ctx.scale(z, z);
  S.newspaper(ctx, t, { words: 4, wordsU: [seg(t, tMore - 0.1, tMore + 0.2), seg(t, tSmoke1 - 0.15, tSmoke1 + 0.15), seg(t, tThan - 0.1, tThan + 0.2), seg(t, tThan + 0.25, tThan + 0.5)], face: R.expr('smile', { look: [0, 0], blink: blink(t, 2.8) }) }); ctx.restore();
  ST.grade(ctx, 'office', 0.18);
});
// B1 (s02 "The proof? The ads claimed"): the magnifier finds the small print under the ad
const tClaimed = at('s02', 'claimed'), tSurvey = at('s02', 'survey'), tNum = at('s02', '113'), tDoctors2 = at('s02', 'doctors');
shot('B1 proof', Z.s02 - 0.12, tSurvey - 0.12, (ctx, t, lt) => {
  ST.bg(ctx, '#B98A5A');
  const z = lerp(1.3, 1.6, E.inOut(seg(lt, 0, 2))); ctx.save(); ctx.translate(540, 980); ctx.scale(z, z); ctx.translate(-140, -540);
  S.newspaper(ctx, t, { foot: true, face: R.expr('smile', { look: [0, 0] }) }); ctx.restore();
  const m = E.out(seg(t, Z.s02 + 0.1, tClaimed)); ctx.save(); ctx.translate(lerp(1100, 540, m), lerp(1500, 980, m)); S.magnifier(ctx, 240); ctx.restore();
  label(ctx, 'THE PROOF?', 540, 1380, pop(t, Z.s02), { size: 76, col: C.yellow });
  ST.grade(ctx, 'office', 0.18);
});
// B2 (s02 "a survey of 113,597 doctors."): the counter rolls up while rows of doctors fill the frame; SURVEY stamp
shot('B2 count', tSurvey - 0.12, Z.s03 - 0.12, (ctx, t, lt) => {
  ST.bg(ctx, PAL.paper); ctx.fillStyle = 'rgba(77,141,255,0.10)'; for (let i = 0; i < 30; i++) ctx.fillRect(0, i * 70, W, 3);
  const z = 1 + lt * 0.015; ctx.save(); ctx.translate(540, 1100); ctx.scale(z, z); ctx.translate(-540, -1100);
  const rows = 4, cols = 7; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const k = r * cols + c, tt = tSurvey + 0.1 + k * 0.1; if (t < tt) continue; const u = E.back(seg(t, tt, tt + 0.25), 2);
    const sc = 0.32 + r * 0.06, x = 90 + c * 150 + (r % 2) * 40, y = 880 + r * 150 + r * r * 20; ctx.save(); ctx.translate(x, y); ctx.scale(sc * u, sc * u); ctx.drawImage(S.docSprite(k % 10), -130, -640); ctx.restore(); }
  ctx.restore();
  const cu = seg(t, tNum, tDoctors2 - 0.1); ctx.save(); ctx.translate(540 + shake(t, tDoctors2 + 0.05, 8), 520); S.counter(ctx, 113597 * E.out(cu), pop(t, tSurvey + 0.05, 0.3)); ctx.restore();
  label(ctx, 'DOCTORS "SURVEYED"', 400, 700, pop(t, tDoctors2 - 0.1), { size: 52 });
  ctx.save(); ctx.translate(810, 712); ST.stampWord(ctx, 'AD CLAIM', 42, seg(t, tDoctors2 + 0.1, tDoctors2 + 0.4), C.red, -0.06); ctx.restore();
  ST.grade(ctx, 'office', 0.15);
});
// C1 (s03): the hallway: "INDEPENDENT?" stamp on the lab door gets an X; the camera pans to the AD AGENCY door; the ad man steps out
const tWho = at('s03', 'who'), tNot = at('s03', 'not'), tCig3 = at('s03', 'cigarette'), tAgency = at('s03', 'agency'), tOwn3 = at('s03', 'own');
shot('C1 agency', Z.s03 - 0.12, Z.s04 - 0.12, (ctx, t, lt) => {
  const p = E.inOut(seg(t, tCig3 - 0.4, tCig3 + 0.5));
  const c = cam([[0, 0, -500, 1.12], [5, 0, -520, 1.18]], lt); c.x = lerp(-360, 370, p);
  layer(ctx, c, 1, w => { SE.room(w, t, { wall: '#E8E2D0', floor: 'tile' });
    w.save(); w.translate(-360, 0); S.glassDoor(w, 'RESEARCH LAB', 'INDEPENDENT SCIENTISTS', { col: '#6E8A9A' }); w.restore();
    w.save(); w.translate(300, 0); S.glassDoor(w, 'AD AGENCY', "THE CIGARETTE MAKER'S", { col: '#8A5A34' }); w.restore();
    const u = E.out(seg(t, tOwn3 - 0.2, tAgency + 0.2)); if (u > 0) CS.adman(w, lerp(300, 570, u), 0, 1.05, -1, AGENT, { face: FACE('smug', [1, -0.1], t), armN: { hand: [130, -330], grip: 'hold', item: g => CS.clipboard(g, 0.5) }, ...(u < 1 ? { legN: { foot: [30 * Math.sin(t * 9), 0] }, legF: { foot: [-30 * Math.sin(t * 9), 0] } } : {}) });
    w.save(); w.translate(-360, -220); ST.stampWord(w, 'INDEPENDENT?', 50, seg(t, tWho - 0.05, tWho + 0.25), PAL.navy, -0.1); ST.bigX(w, 150, seg(t, tNot - 0.05, tNot + 0.25)); w.restore();
  });
  label(ctx, 'WHO RAN THE SURVEY?', 540, 480, pop(t, Z.s03) * (1 - seg(t, tCig3 - 0.2, tCig3)), { size: 60, col: C.yellow });
  label(ctx, 'NOT SCIENTISTS', 540, 600, pop(t, tNot) * (1 - seg(t, tCig3 - 0.2, tCig3)), { size: 52, col: C.red, fg: PAL.cream });
  label(ctx, "THE COMPANY'S OWN AD AGENCY", 540, 480, pop(t, tAgency - 0.1), { size: 50, col: C.yellow });
  ST.grade(ctx, 'office', 0.2);
});
// D1 (s04 "Its people showed up at medical conventions"): the ad men walk into the convention hall with cartons
const tConv = at('s04', 'conventions'), tDocs4 = at('s04', 'doctors');
shot('D1 convention', Z.s04 - 0.12, tDocs4 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 40, -600, 0.92], [2.2, 80, -600, 0.97]], lt);
  layer(ctx, c, 1, w => { S.hall(w, t);
    CS.doctor(w, 220, 0, 1.0, -1, DOCS[1], { face: FACE('smile', [1, 0], t, 1) });
    CS.doctor(w, 450, 0, 1.0, -1, DOCS[3], { face: FACE('neutral', [1, 0], t, 2) });
    for (let i = 0; i < 2; i++) { const x = -480 + (t - Z.s04) * 200 + i * -330; CS.adman(w, x, 0, 1.0, 1, i ? { ...AGENT, top: '#4A4F57', cuff: '#3E4248', pants: '#4A4F57' } : AGENT, { ...R.walk(t * 7 + i * 2), face: FACE('grin', [1, 0], t, i), armN: cartonHold(0.55), armF: cartonHoldF }, { tie: i ? C.red : C.yellow }); }
  });
  ST.grade(ctx, 'office', 0.2);
});
// D2 (s04 "and doctors' offices."): the ad man with a carton knocks at a doctor's office door
shot('D2 office', tDocs4 - 0.12, Z.s05 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 100, -600, 0.9], [1.4, 120, -600, 0.94]], lt);
  layer(ctx, c, 1, w => { S.office(w, t); w.save(); w.translate(420, 0); S.glassDoor(w, "DOCTOR'S OFFICE", 'PRIVATE', { col: '#8A5A34' }); w.restore();
    const knock = Math.max(0, Math.sin((t - tDocs4) * 18)) * (t > tDocs4 + 0.2 ? 1 : 0);
    CS.adman(w, 60, 0, 1.05, 1, AGENT, { face: FACE('grin', [1, 0], t), armN: { hand: [150 + knock * 20, -400], grip: 'fist' }, armF: { hand: [96, -245], grip: 'hold', item: g => CS.carton(g, 0.55) } }); });
  label(ctx, "+ DOCTORS' OFFICES", 540, 480, pop(t, tDocs4 + 0.05), { size: 60, col: C.yellow });
  ST.grade(ctx, 'office', 0.2);
});
// E1 (s05 "First, they handed out free cartons."): the booth, the ad man hands a sealed carton to the first doctor in the queue; FREE stamp
const tHanded = at('s05', 'handed'), tFree = at('s05', 'free');
shot('E1 handout', Z.s05 - 0.12, Z.s06 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -600, 0.86], [2, 0, -600, 0.9]], lt);
  const give = seg(t, tHanded - 0.05, tHanded + 0.35);
  layer(ctx, c, 1, w => { S.hall(w, t); w.save(); w.translate(-560, 0); S.booth(w, 6, 0); w.restore();
    for (let i = 2; i >= 1; i--) CS.doctor(w, 260 + i * 260, 0, 1.0, -1, DOCS[(i + 1) % 5], { face: FACE(i === 1 ? 'smile' : 'neutral', [1, 0], t, i) });
    CS.adman(w, -330, 0, 1.0, 1, AGENT, give < 1 ? { face: FACE('grin', [1, 0], t), armN: { hand: [lerp(120, 200, give), -260], grip: 'hold', item: g => CS.carton(g, 0.55) }, armF: { hand: [lerp(96, 176, give), -255], grip: 'hold' } } : { face: FACE('grin', [1, 0], t), armN: { hand: [150, -330], grip: 'open' } });
    CS.doctor(w, 170, 0, 1.0, -1, DOCTOR, give >= 1 ? { face: FACE('grin', [1, 0], t), armN: cartonHold(0.55), armF: cartonHoldF } : { face: FACE('surprised', [1, 0], t), armN: { hand: [140, -280], grip: 'open' } }, { mirror: true });
  });
  ctx.save(); ctx.translate(540, 780); ST.stampWord(ctx, 'FREE', 120, seg(t, tFree - 0.05, tFree + 0.25), C.red, -0.1); ctx.restore();
  ST.grade(ctx, 'office', 0.2);
});
// F1 (s06 "Then they asked: so... which brand do you smoke?"): the ad man with the clipboard, the doctor holding the gift; big "?"
const tAsked = at('s06', 'asked'), tSo = at('s06', 'so'), tWhich = at('s06', 'which'), tBrand = at('s06', 'brand'), tSmoke6 = at('s06', 'smoke');
shot('F1 question', Z.s06 - 0.12, Z.s07 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -560, 1.05], [3.5, 0, -580, 1.14]], lt);
  layer(ctx, c, 1, w => { S.hall(w, t, { banner: false });
    CS.adman(w, -260, 0, 1.0, 1, AGENT, { face: FACE(t > tSo ? 'smug' : 'smile', [1, 0], t), armN: { hand: [140, -330], grip: 'hold', item: g => CS.clipboard(g, 0.5, seg(t, tSmoke6 + 0.2, tSmoke6 + 0.6)) }, headTilt: t > tWhich ? 0.06 : 0 });
    const lookDown = t > tBrand - 0.1 && t < tSmoke6 + 0.1;
    CS.doctor(w, 260, 0, 1.0, -1, DOCTOR, { face: FACE(t > tSmoke6 + 0.1 ? 'skeptical' : lookDown ? 'thinking' : 'smile', lookDown ? [0.8, 1] : t > tSmoke6 + 0.1 ? [-0.6, 0] : [1, 0], t), armN: cartonHold(0.55), armF: cartonHoldF, headTilt: lookDown ? 0.1 : 0 }, { mirror: true });
  });
  label(ctx, 'RIGHT AFTER THE GIFT...', 540, 480, pop(t, tSo - 0.05), { size: 52 });
  label(ctx, 'WHICH BRAND DO YOU SMOKE?', 540, 600, pop(t, tWhich - 0.05), { size: 52, col: C.yellow });
  const q = pop(t, tSmoke6 - 0.05, 0.35); if (q > 0) { ctx.save(); ctx.translate(540, 1460 - 680 + Math.sin(t * 6) * 6); ctx.scale(q, q); ctx.rotate(0.08); ctx.font = `220px ${F.black}`; ctx.textAlign = 'center'; ctx.lineWidth = 16; ctx.strokeStyle = INK_; ctx.strokeText('?', 0, 80); ctx.fillStyle = C.yellow; ctx.fillText('?', 0, 80); ctx.restore(); }
  ST.grade(ctx, 'office', 0.2);
});
const INK_ = R.INK;
// G1 (s07 "And medical journals? They were taking cigarette ad money too."): a medical journal opens on a cigarette ad; bills poke out; AD REVENUE
const tThey7 = at('s07', 'they'), tMoney7 = at('s07', 'money'), tCig7 = at('s07', 'cigarette');
function desk(ctx) { ST.bg(ctx, '#8A5A34'); ctx.fillStyle = 'rgba(40,20,10,0.18)'; for (let y = 0; y < H; y += 90) ctx.fillRect(0, y + (y / 90 % 2) * 20, W, 4); }
shot('G1 journal', Z.s07 - 0.12, Z.s08 - 0.12, (ctx, t, lt) => {
  desk(ctx); const u = E.inOut(seg(t, tThey7 - 0.1, tThey7 + 0.45)), s = 0.88 + lt * 0.015;
  ctx.save(); ctx.translate(lerp(540 - 260 * s, 540, u), 1000); ctx.scale(s, s); S.journal(ctx, { open: u, bills: seg(t, tMoney7 - 0.2, tMoney7 + 0.5), title: 'MEDICAL JOURNAL' }); ctx.restore();
  label(ctx, 'MEDICAL JOURNALS?', 540, 480, pop(t, Z.s07), { size: 64, col: C.yellow });
  ctx.save(); ctx.translate(540, 1400); ST.stampWord(ctx, 'AD REVENUE', 76, seg(t, tMoney7 - 0.05, tMoney7 + 0.25), C.red, -0.08); ctx.restore();
  ST.grade(ctx, 'office', 0.2);
});
// H1 (s08 "Even JAMA, the doctors' own journal, only stopped in 1953."): JAMA open on the ad, then it closes; NO MORE ADS · 1953
const tJama = at('s08', 'jama'), tOwn8 = at('s08', 'own'), tStopped = at('s08', 'stopped'), t1953 = at('s08', '1953');
shot('H1 jama', Z.s08 - 0.12, Z.s09 - 0.12, (ctx, t, lt) => {
  desk(ctx); const u = 1 - E.inOut(seg(t, tStopped - 0.15, tStopped + 0.35)), s = 0.88;
  ctx.save(); ctx.translate(lerp(540 - 260 * s, 540, u), 1000); ctx.scale(s, s); S.journal(ctx, { open: u, title: 'JAMA', sub: 'JOURNAL OF THE AMERICAN MEDICAL ASSN.', col: '#7A2E3A', cover2: 'NO CIGARETTE ADS' }); ctx.restore();
  label(ctx, 'JAMA', 540, 480, pop(t, tJama - 0.05) * (1 - seg(t, tOwn8 - 0.25, tOwn8 - 0.1)), { size: 90, col: '#7A2E3A', fg: PAL.cream });
  label(ctx, "THE DOCTORS' OWN JOURNAL", 540, 480, pop(t, tOwn8 - 0.1), { size: 52, col: C.yellow });
  const d = pop(t, t1953 - 0.05, 0.3); if (d > 0) { ctx.save(); ctx.translate(800, 640); ctx.rotate(0.06); ctx.scale(d * 0.62, d * 0.62); ST.calCard(ctx, 'ADS STOPPED', '1953'); ctx.restore(); }
  ST.grade(ctx, 'office', 0.2);
});
// I1 (s09 "The doctors weren't selling cigarettes. The money was."): the white coat on the rack; bills rise out of its pocket
const tMoney9 = at('s09', 'money'), tWas = at('s09', 'was');
shot('I1 coat', Z.s09 - 0.12, tEnd, (ctx, t, lt) => {
  const c = cam([[0, 0, -660, 0.92], [2.6, 0, -640, 1.0]], lt);
  layer(ctx, c, 1, w => { SE.room(w, t, { wall: '#DCE6EE', floor: 'wood', frame: { x: -560, y: -1000, draw: g => { g.fillStyle = '#4D8DFF'; g.fillRect(-100, -60, 200, 120); } } }); w.save(); w.translate(80, 0); S.coatRack(w, seg(t, tMoney9 - 0.15, tMoney9 + 0.45), t); w.restore(); });
  label(ctx, "NOT THE DOCTORS...", 540, 480, pop(t, Z.s09 + 0.05) * (1 - seg(t, tMoney9 - 0.2, tMoney9 - 0.05)), { size: 56 });
  label(ctx, 'THE MONEY WAS.', 540, 480, pop(t, tMoney9 - 0.05), { size: 80, col: C.red, fg: PAL.cream });
  ST.grade(ctx, 'office', 0.2);
});
// K (end card, 2 s+): the billboard again (echo of frame 0) + the question
shot('K end', tEnd, T + 0.01, (ctx, t, lt) => { billboardScene(ctx, t, lt + 2.2, [0.95, 0.97], true); ST.grade(ctx, 'day', 0.2); }, { type: 'cut' });

// ---------- edit, overlays, subtitles ----------
SH.sort((a, b) => a.t0 - b.t0);
const ED = makeEdit(SH, W, H);
const SPLIT = { s01: [5, 8], s02: [2, 8], s03: [4, 2, 6], s04: [6, 4], s05: [6], s06: [3, 6], s07: [3, 7], s08: [6, 4], s09: [5, 3] };
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
  if (!o.nosubs) EN.drawSubtitles(ctx, t, SUBS, { ...ST.SUBS, highlight: ['1946,', 'doctors', '113,597', 'own', 'agency.', 'free', 'brand', 'money', '1953.', 'was.'] });
}

// ---------- sound cues (for mix.py) ----------
function cues() {
  const c = [['slam', 0.0, 2.0], ['ding', 0.02, 1.4], ['pop', 0.1, 1.2], ['pop', Math.max(0.15, t1946 - 0.05), 0.6]];
  c.push(['cut', tMore - 0.12, 0.35], ['paper', tMore - 0.1, 0.8], ['pop', tAmerica - 0.05, 0.5], ['pop', tMore - 0.1, 0.45], ['pop', tSmoke1 - 0.15, 0.45], ['pop', tThan - 0.1, 0.45], ['pop', tThan + 0.25, 0.4]);
  c.push(['cut', Z.s02 - 0.12, 0.35], ['pop', Z.s02, 0.5], ['whoosh', Z.s02 + 0.1, 0.4], ['cut', tSurvey - 0.12, 0.35], ['stamp', tSurvey + 0.05, 0.7]);
  // counter ticks only after the spoken number (they masked "five hundred" for STT and viewers)
  for (let k = 0; k < 8; k++) c.push(['tick', end('s02') + 0.05 + k * 0.08, 0.25]);
  c.push(['stamp', end('s02') + 0.1, 0.6]);
  c.push(['cut', Z.s03 - 0.12, 0.35], ['pop', Z.s03, 0.45], ['stamp', tWho, 0.6], ['buzzer', tNot, 0.5], ['whoosh', tCig3 - 0.3, 0.5], ['steps', tOwn3 - 0.2, 0.5], ['pop', tAgency - 0.1, 0.5]);
  c.push(['cut', Z.s04 - 0.12, 0.35], ['steps', Z.s04, 0.5], ['applause', Z.s04 + 0.2, 0.15], ['cut', tDocs4 - 0.12, 0.35], ['tap', tDocs4 + 0.25, 0.8], ['tap', tDocs4 + 0.42, 0.8], ['tap', tDocs4 + 0.6, 0.8], ['pop', tDocs4 + 0.05, 0.4]);
  c.push(['cut', Z.s05 - 0.12, 0.35], ['whoosh', tHanded - 0.05, 0.4], ['stamp', tFree, 0.9]);
  c.push(['cut', Z.s06 - 0.12, 0.35], ['pop', tSo - 0.05, 0.4], ['pop', tWhich - 0.05, 0.45], ['boop', tSmoke6 - 0.05, 0.6], ['snip', tSmoke6 + 0.3, 0.4]);
  c.push(['cut', Z.s07 - 0.12, 0.35], ['pop', Z.s07, 0.4], ['flip', tThey7 - 0.1, 0.8], ['kaching', tMoney7, 0.5], ['stamp', tMoney7 + 0.05, 0.7]);
  c.push(['cut', Z.s08 - 0.12, 0.35], ['pop', tJama - 0.05, 0.45], ['pop', tOwn8 - 0.1, 0.4], ['thump', tStopped + 0.25, 0.7], ['stamp', t1953, 0.9]);
  c.push(['cut', Z.s09 - 0.12, 0.35], ['pop', Z.s09 + 0.05, 0.35], ['coins', tMoney9, 0.5], ['slam', tMoney9 + 0.02, 0.5], ['cut', tEnd, 0.4], ['pop', tEnd + 0.05, 0.6], ['blip', tEnd + 0.4, 0.4]);
  return c;
}
const MUSIC = { b0: 0, proof: Z.s02, agency: Z.s03, carton: Z.s04, journals: Z.s07, twist: Z.s09, hit: tEnd, end: T };

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
  const KEY = [['01_hook', 0.7], ['02_slogan_1946', tThan + 0.55], ['03_113597_doctors', tDoctors2 + 0.6], ['04_free_carton', tFree + 0.6], ['05_jama_1953', t1953 + 0.6], ['06_question', tEnd + 1.0]];
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
