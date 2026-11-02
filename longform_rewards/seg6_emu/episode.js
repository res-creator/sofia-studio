process.env.HIR_WIDE = '1';
// Long-form "When Paying People Backfired" — CHAPTER 6 · AUSTRALIA, 1932 · The Emu Exception (16:9, 1920x1080, 30 fps).
// Facts as in emu_ep12 (upload_kit): ~20,000 emus in the WA wheatbelt, soldiers with two Lewis guns, the ambush at the dam, the jam,
// the truck chase, the Major's own count 986 / 9,860; 1934: no more soldiers, a cash bounty per emu, 57,000+ claims in six months.
// The world of emu_ep12/emukit.js re-framed for a wide screen (emuwide.js). No gore: counts are on paper. Real people = generic figures.
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
const X = require('./emuwide');
const S = X.S;
const { C, F, clamp, lerp, seg, E, rr, hash } = K;
const { W, H, FPS, PAL, shake, pop, blink, label, txt, fitTxt } = ST;

// ---------- voice timeline: chapter card 0–3 s, first line at 3.0 s, 0.7 s between lines, end = last voice end + 0.6 s ----------
const LINES = JSON.parse(fs.readFileSync(`${__dirname}/script.json`));
const SP = JSON.parse(fs.readFileSync(`${__dirname}/vo/speech.json`));
const GAP = 0.7;
const Z = {}; let T = 3.0; for (const L of LINES) { Z[L.id] = +(T - SP[L.id][0]).toFixed(3); T += SP[L.id][1] - SP[L.id][0] + GAP; }
const V = EN.voice(`${__dirname}/vo`, Z), at = (id, w, n = 0) => V.at(id, w, n), end = id => Z[id] + SP[id][1];
const LAST = LINES[LINES.length - 1].id, tEnd = end(LAST);
T = +(tEnd + 0.6).toFixed(2);
const S1 = id => Z[id] + SP[id][0];   // real speech start of a line

// ---------- helpers ----------
const bl = (t, p = 3.3, o = 0) => blink(t, p, o);
const zoomAt = (ctx, x, y, z) => { ctx.translate(x, y); ctx.scale(z, z); ctx.translate(-x, -y); };
const paperBg = (c, col = '#E5DCC8') => { c.fillStyle = col; c.fillRect(0, 0, W, H); c.fillStyle = 'rgba(120,90,50,0.07)'; for (let i = 0; i < 30; i++) c.fillRect(0, i * 40, W, 3); };
const fieldBg = (o = {}, blur = 9) => (c, t) => { c.fillStyle = '#E9D2A0'; c.fillRect(0, 0, W, H); X.halfPass(c, blur, g => X.landW(g, t, o)); LT.haze(c, 'golden', 0.08); };
const RIM = X.RIM;

// ================= SHOTS =================
const SH = []; const shot = (id, t0, t1, draw, out) => SH.push({ id, t0, t1, draw, out });

// CARD (0–3 s, no voice): CHAPTER 6 · The Emu Exception · AUSTRALIA · 1932; an emu strolls in
shot('CARD', 0, Z.s01, (ctx, t, lt) => {
  X.chapterCard(ctx, t, 'CHAPTER 6', 'The Emu Exception', 'AUSTRALIA · 1932', (g, tt) => {
    const u = E.out(seg(tt, 0.2, 1.6)); g.save(); g.translate(lerp(700, 0, u), 0); g.scale(-0.2, 0.2); S.emu(g, { phase: tt * 9, stride: u < 1 ? 0.8 : 0, look: [0.4, 0], blink: bl(tt, 2.5) }); g.restore();
  });
  ST.grade(ctx, 'golden', 0.15);
});

// A1 (s01 "So is paying people always a mistake? Not at all. Here's when it worked."): the stage, a pay envelope + ?; NOT AT ALL; an emu walks in
const tPaying = at('s01', 'paying'), tMistake = at('s01', 'mistake'), tNot1 = at('s01', 'not'), tHeres = at('s01', 'here'), tWorked = at('s01', 'worked');
shot('A1 stage', Z.s01, Z.s02 - 0.12, (ctx, t, lt) => {
  X.stage(ctx, t, t > tNot1 - 0.1 ? 1 : 0);
  const u = pop(t, tPaying - 0.1, 0.35); if (u > 0) { ctx.save(); ctx.translate(W / 2 - 40, 600); ctx.scale(u * 0.85, u * 0.85); ctx.rotate(-0.04 + Math.sin(lt * 2) * 0.02); S.payEnv(ctx, 1, 1); ctx.restore(); }
  const q = pop(t, tMistake - 0.1, 0.3); if (q > 0 && t < tNot1 - 0.05) { ctx.save(); ctx.translate(W / 2 + 280, 330); ctx.scale(q, q); ctx.rotate(0.12); txt(ctx, '?', 0, 60, 220, C.yellow); ctx.restore(); }
  label(ctx, 'PAYING PEOPLE = A MISTAKE?', W / 2, 160, pop(t, tMistake - 0.2) * (t < tNot1 - 0.05 ? 1 : 0), { size: 60 });
  label(ctx, 'NOT AT ALL', W / 2, 160, pop(t, tNot1 - 0.05), { size: 80, col: PAL.green, fg: PAL.cream });
  // the emu walks into the light from the right
  const wu = seg(t, tHeres - 0.3, tWorked + 0.2);
  if (wu > 0) { ctx.save(); ctx.translate(lerp(2150, 1420, E.out(wu)), 860); ctx.scale(-0.62, 0.62); LT.lit(ctx, c => S.emu(c, { phase: lt * 10, stride: wu < 1 ? 0.7 : 0, look: [1, 0], blink: bl(t, 2.8) }), { rim: RIM }); ctx.restore(); }
  label(ctx, "HERE'S WHEN IT WORKED", 560, 330, pop(t, tWorked - 0.15), { size: 54, col: C.yellow, rot: -0.04 });
  ST.grade(ctx, 'golden', 0.22);
});

// B1 (s02 "In 1932, wheat farmers"): the wheatbelt; the farmer at his fence; 1932 card
const s2 = 's02';
const t1932 = at(s2, '1932'), tWheat = at(s2, 'wheat'), tWestern = at(s2, 'western'), tMany = at(s2, 'many'), tWar = at(s2, 'war'), tDep = at(s2, 'depression'), tWatched = at(s2, 'watched');
const tTwenty = at(s2, 'twenty'), tEat = at(s2, 'eat'), tArmy = at(s2, 'army'), tTwo = at(s2, 'two'), tGuns = at(s2, 'guns'), tAt = at(s2, 'at'), tDam = at(s2, 'dam'), tOver = at(s2, 'over');
const tPerfect = at(s2, 'perfect'), tGun = at(s2, 'gun', 1), tDozen = at(s2, 'dozen'), tAnd = at(s2, 'and'), tJam = at(s2, 'jammed'), tThey = at(s2, 'they'), tTruck = at(s2, 'truck');
const tEmusOut = at(s2, 'emus', 2), tOutran = at(s2, 'outran'), tMajor = at(s2, 'major'), tRep = at(s2, 'reported'), t986 = at(s2, '986'), t9860 = at(s2, '9860'), tHis = at(s2, 'his'), tOwn = at(s2, 'own');
shot('B1 wheatbelt', Z.s02 - 0.12, tWestern - 0.12, (ctx, t, lt) => {
  ctx.save(); zoomAt(ctx, 960, 700, 1.0 + lt * 0.02);
  X.landW(ctx, t, { hy: 520, house: { x: 1500, s: 0.5 }, windmill: { x: 1200, s: 0.45 }, fence: { dy: 60 }, rows: 8, wheatDy: 160 });
  X.litP(ctx, c => S.person(c, 640, 860, 0.95, 1, S.FARMER, { face: R.expr('neutral', { look: [1, 0], blink: bl(t, 3.1) }), armN: { hand: [120, -250], grip: 'relax' }, armF: { hand: [90, -240], grip: 'relax' } }, S.HAT_FARM));
  ctx.restore();
  ctx.save(); ctx.translate(330, 330); ctx.rotate(-0.05); const u = pop(t, t1932 - 0.1, 0.3); ctx.scale(u * 0.75, u * 0.75); if (u > 0) ST.calCard(ctx, 'YEAR', '1932'); ctx.restore();
  label(ctx, 'WHEAT FARMERS', 1150, 170, pop(t, tWheat - 0.05), { size: 64, col: C.yellow });
  ST.grade(ctx, 'golden', 0.18);
});
// B2 ("in Western Australia"): the map; WA turns red; the pin drops on the wheatbelt
shot('B2 map', tWestern - 0.12, tMany - 0.12, (ctx, t, lt) => {
  paperBg(ctx, '#BFD3DA');
  ctx.save(); ctx.translate(W / 2, 470); const z = 0.9 + lt * 0.04; ctx.scale(z, z); S.ausMap(ctx, seg(t, tWestern, tWestern + 0.4)); S.pin(ctx, S.CAMPION[0], S.CAMPION[1], seg(t, tWestern + 0.4, tWestern + 0.8)); ctx.restore();
  ST.grade(ctx, 'day', 0.14);
});
// B3 ("many of them war veterans, already hit by the Depression"): the farmer, medal; WAR VETERANS; WHEAT PRICES ↓
shot('B3 veterans', tMany - 0.12, tWatched - 0.12, (ctx, t, lt) => {
  fieldBg({ hy: 520, house: { x: 1300, s: 0.6 }, fence: { dy: 60 }, rows: 7, wheatDy: 200 }, 8)(ctx, t);
  ctx.save(); zoomAt(ctx, 700, 880, 1.0 + lt * 0.015);
  X.litP(ctx, c => { const r = S.person(c, 700, 880, 1.25, 1, S.FARMER, { face: R.expr(t > tDep ? 'worried' : 'neutral', { look: [1, 0.1], blink: bl(t, 3.1) }), headTilt: t > tDep ? 0.05 : 0, armN: { hand: [120, -250], grip: 'relax' } }, S.HAT_FARM);
    // the war medal on his chest
    const mu = pop(t, tWar - 0.1); if (mu > 0) { c.save(); c.translate(700 + 40 * 1.25, 880 - 400 * 1.25); c.scale(mu * 1.25, mu * 1.25); c.fillStyle = '#C94F3D'; c.fillRect(-10, -34, 20, 30); R.ell(c, 0, 4, 18, 18); fillStrokeSafe(c, '#E8B04A'); c.restore(); } });
  ctx.restore();
  label(ctx, 'WAR VETERANS', 1300, 200, pop(t, tWar - 0.05), { size: 66 });
  const du = pop(t, tDep - 0.1, 0.35); if (du > 0) { ctx.save(); ctx.translate(1300, 420); ctx.scale(du, du); ctx.rotate(0.02); CL.cutout(ctx, () => rr(ctx, -330, -90, 660, 180, 16), PAL.cream, { elev: 1.6 });
    fitTxt(ctx, 'THE DEPRESSION', 0, -26, 50, INK, 600); fitTxt(ctx, 'WHEAT PRICES ↓', 0, 52, 54, C.red, 600); ctx.restore(); }
  ST.grade(ctx, 'golden', 0.2);
});
function fillStrokeSafe(c, col) { R.fillStroke(c, col, 3); }
// C1 ("watched around twenty thousand emus eat their crops"): the horizon fills with emus; ≈ 20,000; they eat the wheat
shot('C1 emus arrive', tWatched - 0.12, tArmy - 0.25, (ctx, t, lt) => {
  const fill = E.out(seg(t, tWatched, tTwenty + 0.8)), eat = seg(t, tEat - 0.2, tEat + 1.4);
  X.landW(ctx, t, { hy: 520, windmill: { x: 1650, s: 0.45 }, fence: { dy: 50 }, rows: 8, wheatDy: 70, eaten: eat * 0.6 });
  const em = X.crowd(46, 11, -100, W + 100, 0, 360, 0.08, 0.3).filter(e => hash(e.i * 5.1) < fill + 0.05);
  S.emuCrowd(ctx, em.map(e => ({ x: e.x + (1 - fill) * 300, y: 540 + e.y, s: e.s, face: -1, phase: lt * 10 + e.ph, stride: eat > 0 ? 0 : 0.6, peck: eat > 0 ? 0.5 + 0.5 * Math.sin(lt * 6 + e.ph) : 0, eat: eat > 0 })));
  // the farmer watching, foreground left
  X.litP(ctx, c => S.person(c, 230, 900, 1.05, 1, S.FARMER, { face: R.expr(t > tEat ? 'shocked' : 'worried', { look: [1, 0], blink: bl(t, 3.1) }), armN: { hand: [80, -420], grip: 'relax' } }, S.HAT_FARM));
  const u = pop(t, tTwenty - 0.1, 0.35); if (u > 0) { ctx.save(); ctx.translate(1100 + shake(t, tTwenty + 0.2, 6), 180); ctx.scale(u, u); ctx.rotate(-0.03); ctx.font = `110px ${F.black}`; const s = '≈ 20,000 EMUS', w = ctx.measureText(s).width + 70;
    CL.cutout(ctx, () => rr(ctx, -w / 2, -92, w, 136, 18), C.red, { elev: 1.8 }); txt(ctx, s, 0, 36, 110, PAL.cream); ctx.restore(); }
  label(ctx, 'EATING THE CROPS', 1100, 350, pop(t, tEat - 0.05), { size: 54, col: C.yellow });
  ST.grade(ctx, 'golden', 0.18);
});
// D1 ("The army sent soldiers with two machine guns."): the army truck rolls in; THE ARMY; 2 MACHINE GUNS
shot('D1 army', tArmy - 0.25, tAt - 0.12, (ctx, t, lt) => {
  X.landW(ctx, t, { hy: 520, windmill: { x: 1650, s: 0.45 }, fence: { dy: 50 }, rows: 7, wheatDy: 300 });
  ctx.fillStyle = '#C9A06E'; ctx.fillRect(0, 640, W, 230);
  const u = E.out(seg(t, tArmy - 0.25, tArmy + 1.2)), bump = Math.abs(Math.sin(lt * 9)) * 6 * (1 - u);
  ctx.save(); ctx.translate(lerp(-600, 860, u), 860 - bump); ctx.scale(0.8, 0.8);
  X.litP(ctx, c => S.truck(c, { rot: u * 14, bed: b => { for (let i = 0; i < 3; i++) S.person(b, -150 + i * 150, 0, 0.55, 1, i % 2 ? S.SOL2 : S.SOL, { face: R.expr(i === 1 ? 'smug' : 'neutral', { look: [1, 0], blink: bl(t, 3, i) }) }, S.HAT_ARMY); },
    driver: d => S.person(d, 120, -100, 0.42, 1, S.SOL2, { face: R.expr('neutral', { look: [1, 0] }) }, S.HAT_ARMY) }));
  ctx.restore();
  label(ctx, 'THE ARMY', 520, 170, pop(t, tArmy - 0.05), { size: 70 });
  const g = pop(t, tTwo - 0.1, 0.35); if (g > 0) { for (let i = 0; i < 2; i++) { ctx.save(); ctx.translate(1180 + i * 360, 200 + i * 20); ctx.scale(g * 0.42, g * 0.42); ctx.rotate(-0.06); S.lewisGun(ctx, {}); ctx.restore(); } }
  label(ctx, '2 MACHINE GUNS', 1360, 360, pop(t, tGuns - 0.1), { size: 60, col: C.yellow });
  ST.grade(ctx, 'golden', 0.18);
});
// E1 ("At a farm dam, over a thousand emus walked into a perfect ambush."): the dam; a column of emus; the gunner waits in front
shot('E1 dam', tAt - 0.12, tGun - 0.25, (ctx, t, lt) => {
  ctx.save(); zoomAt(ctx, 960, 700, 1.0 + lt * 0.02);
  X.landW(ctx, t, { hy: 500, dam: { x: 1250, y: 640, w: 900 }, rows: 6, wheatDy: 330 });
  const walk = seg(t, tOver - 0.4, tPerfect + 1.2);
  const em = X.crowd(30, 5, 0, 1, 0, 1, 0, 1).map(e => { const k = e.i / 30, x = lerp(2000, 950, clamp(walk * 1.6 - k * 0.6)) + e.x * 500; return { x, y: 560 + e.y * 90, s: 0.11 + e.y * 0.06, face: -1, phase: lt * 10 + e.ph, stride: 0.6 }; });
  S.emuCrowd(ctx, em);
  X.litP(ctx, c => X.gunner(c, 160, 900, 1.05, t, { face: R.expr(t > tPerfect ? 'smug' : 'squint', { look: [1, 0], blink: bl(t, 2.6) }) }));
  ctx.restore();
  label(ctx, 'FARM DAM', 1250, 760, pop(t, tDam - 0.1), { size: 50 });
  label(ctx, '1,000+ EMUS', 1250, 200, pop(t, tOver - 0.05), { size: 72, col: C.yellow });
  label(ctx, 'PERFECT AMBUSH', 1250, 350, pop(t, tPerfect - 0.05), { size: 64, col: C.red, fg: PAL.cream, rot: 0.03 });
  ST.grade(ctx, 'golden', 0.2);
});
// F1 ("The gun killed about a dozen..."): the gunner fires; a tally card counts to ≈ 12 (no gore: the count is on paper)
shot('F1 firing', tGun - 0.25, tAnd - 0.05, (ctx, t, lt) => {
  const firing = t > tGun - 0.1, fl = firing ? (Math.floor(t * 18) % 2 ? 1 : 0.5) : 0;
  ctx.save(); zoomAt(ctx, 600, 800, 1.05 + lt * 0.03); ctx.translate(shake(t, tGun - 0.1, 4) * (firing ? 1 : 0), 0);
  X.landW(ctx, t, { hy: 520, rows: 7, wheatDy: 40 });
  S.emuCrowd(ctx, X.crowd(14, 77, 1100, 1800, 0, 40, 0.12, 0.16).map(e => ({ x: e.x + lt * 80, y: 530 + e.y, s: e.s, face: 1, phase: lt * 12 + e.ph, stride: 1 })));
  X.litP(ctx, c => X.gunner(c, 160, 900, 1.15, t, { flash: fl, recoil: firing ? Math.sin(t * 113) : 0 }));
  ctx.restore();
  const u = pop(t, tGun, 0.3); if (u > 0) { const n = Math.floor(12 * seg(t, tGun + 0.1, tDozen + 0.35)); ctx.save(); ctx.translate(1380, 260); ctx.scale(u, u); ctx.rotate(-0.03);
    CL.cutout(ctx, () => rr(ctx, -330, -110, 660, 220, 16), PAL.cream, { elev: 1.6 }); ctx.lineCap = 'round'; ctx.strokeStyle = R.INK; ctx.lineWidth = 12;
    for (let i = 0; i < n; i++) { const g = Math.floor(i / 5), j = i % 5, x0 = -270 + g * 170; ctx.beginPath(); if (j < 4) { ctx.moveTo(x0 + j * 30, -60); ctx.lineTo(x0 + j * 30, 60); } else { ctx.moveTo(x0 - 16, 50); ctx.lineTo(x0 + 106, -50); } ctx.stroke(); }
    txt(ctx, '≈ 12', 220, 30, 96, C.red); ctx.restore(); }
  ST.grade(ctx, 'golden', 0.2);
});
// F2 ("... and jammed."): close on the gun: smoke, JAMMED; the emus scatter behind
shot('F2 jam', tAnd - 0.05, tThey - 0.12, (ctx, t, lt) => {
  ctx.fillStyle = '#E9D2A0'; ctx.fillRect(0, 0, W, H);
  X.halfPass(ctx, 10, g => { X.landW(g, t, { hy: 560, rows: 6, wheatDy: 40 }); S.emuCrowd(g, X.crowd(16, 91, 500, 1800, 0, 80, 0.16, 0.24).map(e => ({ x: e.x + (t > tJam ? (t - tJam) * 600 * (e.i % 2 ? 1 : -1) : 0), y: 580 + e.y, s: e.s, face: e.i % 2 ? 1 : -1, phase: lt * 14 + e.ph, stride: t > tJam ? 1 : 0.2 }))); });
  LT.haze(ctx, 'golden', 0.06);
  const firing = t < tJam - 0.05, sh = shake(t, tJam, 10);
  ctx.save(); ctx.translate(820 + sh, 640); ctx.rotate(-0.05); ctx.scale(1.55, 1.55);
  LT.lit(ctx, c => S.lewisGun(c, { flash: firing ? (Math.floor(t * 18) % 2 ? 1 : 0.5) : 0, smoke: t > tJam ? seg(t, tJam, tJam + 1.2) : 0 }), { rim: RIM }); ctx.restore();
  if (t > tJam) { ctx.save(); ctx.translate(960, 260); ST.stampWord(ctx, 'JAMMED', 140, seg(t, tJam, tJam + 0.25)); ctx.restore(); }
  ST.grade(ctx, 'golden', 0.22);
});
// G ("They mounted a gun on a truck. The emus outran the truck."): tracking shot; the emus overtake; TOO SLOW
shot('G truck chase', tThey - 0.12, tMajor - 0.3, (ctx, t, lt) => {
  const pan = lt * 520, bump = Math.abs(Math.sin(lt * 9)) * 12 + Math.sin(lt * 23) * 3, rock = Math.sin(lt * 9) * 0.02;
  X.landW(ctx, t, { hy: 480, windmill: { x: 1200, s: 0.4 }, fence: { dy: 50 }, rows: 6, wheatDy: 300, px: pan * 2 });
  ctx.save(); ctx.fillStyle = '#C9A06E'; ctx.fillRect(0, 700, W, 200); ctx.fillStyle = 'rgba(120,80,40,0.25)'; for (let i = 0; i < 20; i++) { const x = ((i * 160 - pan * 2.2) % 2240 + 2240) % 2240 - 160; R.ell(ctx, x, 740 + (i % 3) * 50, 40, 10); ctx.fill(); } ctx.restore();
  const em = X.crowd(7, 33, 0, 1, 0, 1, 0, 1).map(e => { const tt = t - tEmusOut + 0.4 - e.x * 0.25; return { x: -300 + Math.max(0, tt) * 1100, y: 720 + e.y * 140, s: 0.3 + e.y * 0.08, face: 1, phase: lt * 16 + e.ph, stride: 1, lid: 0.45 }; });
  S.emuCrowd(ctx, em.filter(e => e.y < 790));
  for (let i = 0; i < 6; i++) { const p = (lt * 2.4 + i / 6) % 1; ctx.save(); ctx.globalAlpha = (1 - p) * 0.55; R.ell(ctx, 640 - p * 300, 850 - p * 80, 40 + p * 90, 30 + p * 50); ctx.fillStyle = '#E4CFA6'; ctx.fill(); ctx.restore(); }
  ctx.save(); ctx.translate(1000, 875 - bump); ctx.rotate(rock); ctx.scale(0.62, 0.62);
  LT.lit(ctx, c => S.truck(c, { rot: lt * 9, bed: b => { b.save(); b.translate(-60, -150); b.rotate(-0.12 + Math.sin(lt * 11) * 0.12); b.scale(0.6, 0.6); S.lewisGun(b, { bipod: 250, flash: t > tTruck && t < tOutran && Math.floor(t * 14) % 2 ? 0.7 : 0 }); b.restore();
    S.person(b, -200, 0, 0.6, 1, S.SOL, { hip: [-6, -176], lean: 0.25, legN: { foot: [96, 0] }, legF: { foot: [-118, 0] }, armN: { hand: [150, -250], grip: 'fist' }, armF: { hand: [-80, -200], grip: 'fist' }, face: R.expr(t > tOutran ? 'shocked' : 'squint', { look: [1, 0] }) }, S.HAT_ARMY); },
    driver: d => S.person(d, 120, -100, 0.42, 1, S.SOL2, { face: R.expr(t > tOutran ? 'worried' : 'neutral', { look: [1, 0] }) }, S.HAT_ARMY) }), { rim: RIM });
  ctx.restore();
  S.emuCrowd(ctx, em.filter(e => e.y >= 790));
  label(ctx, 'GUN ON A TRUCK', 960, 170, pop(t, tTruck - 0.1) * (1 - seg(t, tOutran - 0.15, tOutran)), { size: 64 });
  label(ctx, 'TOO SLOW', 960, 170, pop(t, tOutran), { size: 90, col: C.red, fg: PAL.cream });
  ST.grade(ctx, 'golden', 0.2);
});
// H ("The Major reported 986 kills with 9,860 rounds — his own count."): the Major (generic) + his typed report; HIS OWN COUNT
shot('H report', tMajor - 0.3, Z.s03 + SP.s03[0] - 0.12, (ctx, t, lt) => {
  fieldBg({ hy: 560, rows: 6, wheatDy: 260, windmill: { x: 1700, s: 0.4 }, dusk: 1 }, 12)(ctx, t);
  X.litP(ctx, c => S.person(c, 400, 900, 1.15, 1, S.MAJOR, { face: R.expr(t > tHis ? 'smug' : 'neutral', { look: [1, -0.1], blink: bl(t, 2.4) }), headTilt: 0.04, armN: { hand: [150, -340], grip: 'point' } }, S.HAT_ARMY));
  const u = pop(t, tRep - 0.15, 0.35); if (u > 0) { ctx.save(); ctx.translate(1180, 450); ctx.scale(u * 0.82, u * 0.82);
    ST.report(ctx, 'REPORT', 'THE MAJOR · DEC 1932', [['KILLS', '986', seg(t, t986 - 0.1, t986 + 0.3)], ['ROUNDS', '9,860', seg(t, t9860 - 0.1, t9860 + 0.3)]], { w: 820, h: 700 }); ctx.restore(); }
  ctx.save(); ctx.translate(1240, 790); ST.stampWord(ctx, 'HIS OWN COUNT', 64, seg(t, tOwn - 0.05, tOwn + 0.3), C.red, -0.06); ctx.restore();
  label(ctx, 'THE MAJOR', 400, 170, pop(t, tMajor - 0.05), { size: 56 });
  ST.grade(ctx, 'golden', 0.2);
});

// I1 (s03 "When farmers asked for soldiers again in 1934, the answer was no."): the farmers' request letter; stamp NO
const s3 = 's03';
const tAsked = at(s3, 'asked'), tSoldiers3 = at(s3, 'soldiers'), t1934a = at(s3, '1934'), tAnswer = at(s3, 'answer'), tNo3 = at(s3, 'no'), tWhat = at(s3, 'what'), tOlder = at(s3, 'older'), tCheaper = at(s3, 'cheaper');
const tCash = at(s3, 'cash'), tBounty = at(s3, 'bounty'), tPaid = at(s3, 'paid'), tEach = at(s3, 'each'), tEmu3 = at(s3, 'emu'), tIn3 = at(s3, 'in', 1), tSix = at(s3, 'six'), t1934b = at(s3, '1934', 1);
const tFiled = at(s3, 'filed'), t57 = at(s3, 'fifty'), tClaims = at(s3, 'claims');
shot('I1 request', S1('s03') - 0.12, tWhat - 0.12, (ctx, t, lt) => {
  paperBg(ctx);
  X.litP(ctx, c => S.person(c, 330, 880, 1.05, 1, S.FARMER, { face: R.expr(t > tNo3 ? 'worried' : 'smile', { look: [1, -0.1], blink: bl(t, 3.1) }), armN: { hand: [150, -330], grip: 'point' } }, S.HAT_FARM));
  const u = pop(t, S1('s03') - 0.05, 0.35); if (u > 0) { ctx.save(); ctx.translate(1060, 460); ctx.scale(u, u); ctx.rotate(0.02); const w = 640, h = 560;
    CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 8), '#FBF6EA', { elev: 1.8 });
    fitTxt(ctx, 'REQUEST', 0, -h / 2 + 80, 64, R.INK, w - 60, 'center', ST.FONT.type); fitTxt(ctx, 'FROM: THE FARMERS', 0, -h / 2 + 140, 32, '#4A4A48', w - 60, 'center', ST.FONT.type);
    fitTxt(ctx, 'SEND SOLDIERS', 0, -10, 60, R.INK, w - 80); ctx.strokeStyle = 'rgba(23,23,23,0.35)'; ctx.lineWidth = 3; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-w / 2 + 60, 70 + i * 50); ctx.lineTo(w / 2 - 60 - (i % 2) * 140, 70 + i * 50); ctx.stroke(); }
    ctx.restore(); }
  ctx.save(); ctx.translate(1600, 250); ctx.rotate(0.05); const cu = pop(t, t1934a - 0.1, 0.3); ctx.scale(cu * 0.6, cu * 0.6); if (cu > 0) ST.calCard(ctx, 'YEAR', '1934'); ctx.restore();
  ctx.save(); ctx.translate(1080 + shake(t, tNo3 + 0.1, 8), 520); ST.stampWord(ctx, 'NO', 200, seg(t, tNo3 - 0.05, tNo3 + 0.25), C.red, -0.14); ctx.restore();
  ST.grade(ctx, 'day', 0.15);
});
// J1 ("What actually worked was older and cheaper: a cash bounty,"): the bounty notice on a fence post; OLDER · CHEAPER
shot('J1 bounty notice', tWhat - 0.12, tPaid - 0.12, (ctx, t, lt) => {
  ctx.save(); zoomAt(ctx, 960, 700, 1 + lt * 0.02);
  X.landW(ctx, t, { hy: 520, windmill: { x: 1500, s: 0.45 }, house: { x: 1750, s: 0.45 }, fence: { dy: 60 }, rows: 7, wheatDy: 300 });
  ctx.save(); ctx.translate(960, 980); rr(ctx, -20, -900, 40, 900, 4); R.fillStroke(ctx, '#8A6440', 5); ctx.translate(0, -560); ctx.rotate(-0.03); const pu = pop(t, tCash - 0.4, 0.35); ctx.scale(0.62 * pu, 0.62 * pu); if (pu > 0) S.poster(ctx); ctx.restore();
  ctx.restore();
  label(ctx, 'WHAT WORKED?', 960, 170, pop(t, tWhat - 0.05) * (1 - seg(t, tCash - 0.5, tCash - 0.4)), { size: 60 });
  label(ctx, 'OLDER', 420, 300, pop(t, tOlder - 0.05), { size: 72 });
  label(ctx, 'CHEAPER', 1500, 300, pop(t, tCheaper - 0.05), { size: 72, col: C.yellow, rot: 0.03 });
  ST.grade(ctx, 'golden', 0.18);
});
// J2 ("paid to farmers for each emu."): a pound note into the farmer's hand; CASH PER EMU; an emu behind
shot('J2 cash per emu', tPaid - 0.12, tIn3 - 0.12, (ctx, t, lt) => {
  X.landW(ctx, t, { hy: 520, windmill: { x: 1650, s: 0.45 }, fence: { dy: 60 }, rows: 7, wheatDy: 260 });
  ctx.save(); ctx.translate(1450, 600); ctx.scale(-0.22, 0.22); S.emu(ctx, { phase: lt * 3, stride: 0, peck: 0.5 + 0.5 * Math.sin(lt * 4), eat: 1 }); ctx.restore();
  const give = E.out(seg(t, tPaid - 0.1, tPaid + 0.5)), got = t > tFarmersGot();
  X.litP(ctx, c => S.person(c, 600, 900, 1.05, 1, S.FARMER, { armN: { hand: got ? [80, -380] : [lerp(20, 140, give), lerp(-120, -300, give)], grip: 'pinch' }, armF: { hand: [-10, -120] },
    face: R.expr(got ? 'grin' : 'smile', { look: [1, -0.3], blink: bl(t, 3.1) }), headTilt: got ? -0.06 : 0 }, S.HAT_FARM));
  if (!got) { const hx0 = lerp(1300, 860, give); ctx.save(); ctx.translate(hx0, 640); rr(ctx, 0, -40, 500, 80, 30); R.fillStroke(ctx, '#3A4A6A', 5); R.hand(ctx, [0, 0], Math.PI, '#E8B898', 'pinch', { size: 1.4 }); ctx.translate(-70, -36); S.pound(ctx, 0.62, { rot: 0.1 }); ctx.restore(); }
  else { ctx.save(); ctx.translate(600 + 80 * 1.05 + 30, 900 - 380 * 1.05 - 70); ctx.rotate(-0.12 + Math.sin(lt * 6) * 0.06); S.pound(ctx, 0.66); ctx.restore(); }
  label(ctx, 'CASH PER EMU', 1180, 180, pop(t, tEach - 0.1), { size: 74, col: C.yellow });
  ST.grade(ctx, 'golden', 0.18);
});
function tFarmersGot() { return at(s3, 'farmers', 1) + 0.15; }
// K ("In six months of 1934, farmers filed over fifty-seven thousand bounty claims."): JAN..JUN flips; claim slips pile up; 57,000+
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'];
shot('K claims', tIn3 - 0.12, Z.s04 - 0.12, (ctx, t, lt) => {
  paperBg(ctx);
  const k = Math.min(5, Math.floor(6 * seg(t, tSix - 0.1, t1934b + 0.9))), u = pop(t, tIn3 - 0.1, 0.3);
  ctx.save(); ctx.translate(380, 440); ctx.rotate(-0.03); ctx.scale(u * 0.95, u * 0.95); if (u > 0) ST.calCard(ctx, '1934', MON[k]); ctx.restore();
  label(ctx, `${k + 1} OF 6 MONTHS`, 380, 760, pop(t, tSix), { size: 50, col: C.yellow });
  const p = E.out(seg(t, tFiled - 0.3, t57 + 0.9)), n = Math.floor(lerp(0, 66, p));
  for (let i = 0; i < n; i++) { const col = i % 4, row = Math.floor(i / 4); ctx.save(); ctx.translate(900 + col * 250 + (hash(i) - 0.5) * 50, 860 - row * 22); S.slip(ctx, 0.72, (hash(i + 4) - 0.5) * 0.3, i); ctx.restore(); }
  const cnt = Math.round(57000 * E.out(seg(t, tFiled, t57 + 0.4)) / 100) * 100, cu = pop(t, tFiled - 0.1, 0.3);
  if (cu > 0) { ctx.save(); ctx.translate(1270, 180); ctx.scale(cu, cu); ctx.rotate(-0.03); ctx.font = `120px ${F.black}`; const s = cnt.toLocaleString('en-US') + (t > t57 + 0.4 ? '+' : ''), w = ctx.measureText('57,000+').width + 80;
    CL.cutout(ctx, () => rr(ctx, -w / 2, -100, w, 150, 18), C.red, { elev: 1.8 }); txt(ctx, s, 0, 40, 120, PAL.cream); ctx.restore(); }
  label(ctx, 'BOUNTY CLAIMS', 1270, 340, pop(t, tClaims - 0.25), { size: 58 });
  ST.grade(ctx, 'day', 0.15);
});

// L1 (s04 "The difference? The bounty paid for the thing the farmers actually wanted gone: the emu."): the field, an emu eating; circled; THE EMU
const s4 = 's04';
const tDiff = at(s4, 'difference'), tBounty4 = at(s4, 'bounty'), tThing = at(s4, 'thing'), tWanted = at(s4, 'wanted'), tGone = at(s4, 'gone'), tEmu4 = at(s4, 'emu');
const tTail = at(s4, 'tail'), tBarcode = at(s4, 'barcode'), tAccount = at(s4, 'account'), tReal = at(s4, 'real'), tResult = at(s4, 'result'), tNot4 = at(s4, 'not');
shot('L1 the emu', Z.s04 - 0.12, tNot4 - 0.12, (ctx, t, lt) => {
  ctx.save(); zoomAt(ctx, 1250, 760, 1 + 0.12 * E.inOut(seg(t, tWanted, tEmu4 + 0.4)));
  X.landW(ctx, t, { hy: 500, windmill: { x: 300, s: 0.45 }, house: { x: 560, s: 0.4 }, fence: { dy: 60 }, rows: 7, wheatDy: 140, eaten: 0.35 });
  ctx.save(); ctx.translate(1250, 860); ctx.scale(-0.72, 0.72); LT.lit(ctx, c => S.emu(c, { phase: lt * 3, stride: 0, peck: t > tEmu4 - 0.2 ? 0 : 0.5 + 0.5 * Math.sin(lt * 4), eat: t < tEmu4 - 0.2, look: [1, 0], blink: bl(t, 2.7) }), { rim: RIM }); ctx.restore();
  X.litP(ctx, c => S.person(c, 480, 900, 1.0, 1, S.FARMER, { face: R.expr('squint', { look: [1, 0], blink: bl(t, 3.1) }), armN: { hand: [150, -360], grip: 'point' } }, S.HAT_FARM));
  // the red circle around the emu (marked, no crosshair)
  const cu = seg(t, tGone - 0.1, tGone + 0.5); if (cu > 0) { ctx.save(); ctx.translate(1250, 650); ctx.strokeStyle = C.red; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.ellipse(0, 0, 300, 290, -0.1, -1.6, -1.6 + 6.4 * E.out(cu)); ctx.stroke(); ctx.restore(); }
  ctx.restore();
  label(ctx, 'THE DIFFERENCE?', 960, 160, pop(t, tDiff - 0.1) * (1 - seg(t, tBounty4 - 0.2, tBounty4 - 0.1)), { size: 66 });
  label(ctx, 'THE BOUNTY PAID FOR…', 760, 160, pop(t, tBounty4 - 0.1), { size: 58 });
  label(ctx, 'THE EMU', 1560, 300, pop(t, tEmu4 - 0.1), { size: 90, col: C.yellow, rot: 0.04 });
  ST.grade(ctx, 'golden', 0.18);
});
// L2 ("Not a tail. Not a barcode. Not an account. The real result."): the five plates TAIL ✗ · BARCODE ✗ · ACCOUNT ✗ · PLATE ✗ · EMU ✓
const PL = [['TAIL', X.iconTail, false, tTail], ['BARCODE', X.iconBarcode, false, tBarcode], ['ACCOUNT', X.iconAccount, false, tAccount], ['PLATE', X.iconPlate, false, tAccount + 0.75], ['EMU', X.iconEmu, true, tReal]];
shot('L2 five plates', tNot4 - 0.12, T + 0.01, (ctx, t, lt) => {
  paperBg(ctx);
  PL.forEach(([w, ic, ok, tt], i) => { ctx.save(); ctx.translate(W / 2 + (i - 2) * 340, 450 + (ok ? -10 * seg(t, tReal, tReal + 0.3) : 0)); const sc = ok ? 1 + 0.12 * E.back(seg(t, tReal, tReal + 0.35), 2) : 1; ctx.scale(sc, sc);
    if (ok && t > tReal) LT.glow(ctx, 0, 0, 320, 'rgba(255,230,150,1)', 0.45);
    X.choicePlate(ctx, w, ic, ok, seg(t, tt - 0.35, tt - 0.05), seg(t, tt + 0.05, tt + 0.35), t); ctx.restore(); });
  label(ctx, 'THE REAL RESULT', W / 2, 760, pop(t, tResult - 0.15), { size: 76, col: PAL.green, fg: PAL.cream });
  ST.grade(ctx, 'day', 0.14);
});

// ---------- edit, overlays, subtitles ----------
SH.sort((a, b) => a.t0 - b.t0);
const ED = makeEdit(SH, W, H);
const SPLIT = { s01: [7, 7], s02: [8, 11, 8, 8, 13, 8, 12, 12], s03: [12, 7, 9, 12], s04: [2, 13, 9, 3] };
const REPL = [[/ —$/, ''], [/^— /, ''], [/twenty thousand/, '20,000'], [/fifty-seven thousand/, '57,000']];
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
  if (!o.nosubs) EN.drawSubtitles(ctx, t, SUBS, { ...ST.SUBS, highlight: ['1932', '20000', 'jammed', 'outran', '986', '9860', 'no', 'bounty', '57000', 'emu', 'result'] });
}

// ---------- sound cues (for mix.py) ----------
function cues() {
  const c = [['whoosh', 0.0, 0.8], ['pop', 0.05, 1.0], ['pop', 0.4, 0.6], ['steps', 0.5, 0.4], ['boop', 1.6, 0.4]];
  c.push(['cut', Z.s01, 0.35], ['pop', tPaying - 0.1, 0.5], ['pop', tMistake - 0.1, 0.5], ['stamp', tNot1, 0.6], ['steps', tHeres - 0.3, 0.6], ['pop', tWorked - 0.15, 0.5]);
  c.push(['cut', Z.s02 - 0.12, 0.35], ['flip', t1932 - 0.1, 0.5], ['pop', tWheat - 0.05, 0.4], ['cut', tWestern - 0.12, 0.35], ['scratch', tWestern, 0.5], ['thump', tWestern + 0.5, 0.5]);
  c.push(['cut', tMany - 0.12, 0.35], ['ding', tWar - 0.1, 0.4], ['pop', tWar - 0.05, 0.4], ['fall', tDep - 0.1, 0.6]);
  c.push(['cut', tWatched - 0.12, 0.35], ['steps', tWatched, 0.6], ['steps', tWatched + 1.0, 0.6], ['stamp', tTwenty + 0.15, 0.8], ['flap', tEat - 0.2, 0.5], ['pop', tEat - 0.05, 0.4]);
  c.push(['cut', tArmy - 0.25, 0.35], ['engine', tArmy - 0.25, 0.6], ['pop', tArmy - 0.05, 0.4], ['thump', tTwo - 0.05, 0.6], ['thump', tTwo + 0.1, 0.5], ['pop', tGuns - 0.1, 0.4]);
  c.push(['cut', tAt - 0.12, 0.35], ['splash', tDam, 0.4], ['steps', tOver - 0.3, 0.6], ['pop', tOver - 0.05, 0.4], ['stamp', tPerfect, 0.6]);
  c.push(['cut', tGun - 0.25, 0.35], ['machine', tGun - 0.1, 0.6], ['tick', tGun + 0.3, 0.4], ['tick', tGun + 0.6, 0.4]);
  c.push(['cut', tAnd - 0.05, 0.35], ['click', tJam, 1.2], ['click', tJam + 0.2, 1.0], ['stamp', tJam + 0.05, 0.9], ['wah', tJam + 0.35, 0.5], ['flap', tJam + 0.2, 0.6]);
  c.push(['cut', tThey - 0.12, 0.35], ['engine', tThey, 0.6], ['pop', tTruck - 0.1, 0.4], ['steps', tEmusOut - 0.2, 0.6], ['whoosh', tOutran - 0.1, 0.5], ['buzzer', tOutran + 0.05, 0.5]);
  c.push(['cut', tMajor - 0.3, 0.35], ['pop', tMajor - 0.05, 0.4], ['paper', tRep - 0.15, 0.7], ['type', t986 - 0.1, 0.7], ['stamp', t986 + 0.1, 0.6], ['type', t9860 - 0.1, 0.7], ['stamp', t9860 + 0.1, 0.6], ['stamp', tOwn + 0.05, 0.9]);
  c.push(['cut', S1('s03') - 0.12, 0.35], ['paper', S1('s03'), 0.6], ['flip', t1934a - 0.1, 0.4], ['stamp', tNo3 + 0.05, 1.0]);
  c.push(['cut', tWhat - 0.12, 0.35], ['pop', tWhat - 0.05, 0.4], ['pop', tOlder - 0.05, 0.4], ['pop', tCheaper - 0.05, 0.4], ['paper', tCash - 0.4, 0.6], ['thump', tCash - 0.1, 0.6]);
  c.push(['cut', tPaid - 0.12, 0.35], ['paper', tPaid + 0.2, 0.6], ['kaching', tFarmersGot(), 0.6], ['pop', tEach - 0.1, 0.5]);
  c.push(['cut', tIn3 - 0.12, 0.35]); for (let i = 0; i < 6; i++) c.push(['flip', tSix - 0.1 + i * (t1934b + 1.0 - tSix) / 6, 0.4]); for (let i = 0; i < 14; i++) c.push(['paper', tFiled - 0.3 + i * 0.12, 0.3]); c.push(['stamp', t57 + 0.4, 0.8], ['pop', tClaims - 0.25, 0.4]);
  c.push(['cut', Z.s04 - 0.12, 0.35], ['pop', tDiff - 0.1, 0.5], ['pop', tBounty4 - 0.1, 0.4], ['scratch', tGone - 0.1, 0.6], ['pop', tEmu4 - 0.1, 0.6], ['boop', tEmu4 + 0.2, 0.4]);
  c.push(['cut', tNot4 - 0.12, 0.35]); for (const [, , ok, tt] of PL) { c.push(['pop', tt - 0.35, 0.5]); c.push(ok ? ['sparkle', tt + 0.05, 0.8] : ['buzzer', tt + 0.05, 0.35]); }
  c.push(['ding', tReal + 0.1, 0.6], ['pop', tResult - 0.15, 0.6]);
  return c;
}
const MUSIC = { sections: [[0, 'calm'], [Z.s02 - 0.12, 'tension'], [tMajor - 0.3, 'dark'], [S1('s03') - 0.12, 'up'], [Z.s04 - 0.12, 'calm'], [tNot4 - 0.12, 'up']] };

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
