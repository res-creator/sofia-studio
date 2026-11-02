process.env.HIR_WIDE = '1';
// Long-form "When Paying People Backfired" — segment 0: the cold open (16:9, rows 1–3 of script.md). No chapter card.
// Frame 0: a hand with scissors over a cartoon rat, a coin on the table + "PAID PER / RAT TAIL", slam + ding at 0.0, push-in from frame 0.
// Re-uses the drawn world of rats_ep26 (via ../seg1_hanoi/hanoikit.js). Picture + voice/SFX stems only; the lead adds music.
// Usage: node episode.js cues | srt out.srt | still t1,t2,... out.png | frame t out.png [nosubs] | video out.mp4 | shots
const K = require('../../tests/mcd_collage/kit');
const R = require('../../hirkit/rig');
const ST = require('../../howitsrun_style/style');
const SE = require('../../howitsrun_style/sets');
const P = require('../../howitsrun_style/people');
const HK = require('../seg1_hanoi/hanoikit');
const core = require('../seg1_hanoi/core');
const IK = require('./introkit');
const { S, CS, FACE, coinItem } = HK;
const { C, clamp, lerp, seg, E, rr } = K;
const { W, H, PAL, layer, cam, shake, pop, label, fitTxt } = ST;

const TL = core.timeline(__dirname, 0.3);
const { Z, at, T } = TL;
const SH = []; const shot = (id, t0, t1, draw, out) => SH.push({ id, t0, t1, draw, out });

// ================= s01 =================
const t1902 = at('s01', '1902'), tCutting = at('s01', 'cutting'), tOff = at('s01', 'off'), tLive = at('s01', 'live'), tLetting = at('s01', 'letting'), tGo = at('s01', 'go'),
  tBecause = at('s01', 'because'), tPaying = at('s01', 'paying'), tTails = at('s01', 'tails', 1);
// A1 frame 0: the table, the rat, the hand with scissors, the coin; snip on "off"; the rat runs off on "letting them go"
shot('A1 cold open', 0, tBecause - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -250, 1.0], [3.0, -40, -240, 1.12], [5.8, -20, -240, 1.16]], lt);
  const snip = E.inOut(seg(t, tOff - 0.25, tOff)), cut = t > tOff, run = seg(t, tLetting - 0.1, tGo + 0.6);
  layer(ctx, c, 1, w => {
    HK.tableSet(w, t);
    // the coin on the table (stands, spins slowly) + a small stack
    for (let i = 0; i < 3; i++) { R.ell(w, 760, -40 - i * 12, 62, 16); R.fillStroke(w, S.COPPER, 4); }
    w.save(); w.translate(560, -110); S.coin(w, 70, '1¢', { spin: 0.4 + Math.sin(t * 1.6) * 0.5 }); w.restore();
    // the rat: worried at the scissors, shocked at the snip, then runs off to the right
    const rx = lerp(60, 1500, E.in(run));
    w.save(); w.translate(rx, -40); S.rat(w, { s: 1.7, tail: cut ? 'stub' : true, mood: cut ? 'shock' : 'happy', look: cut ? [1, 0] : [-0.8, -0.5], phase: t * 14, run: run > 0 ? 1 : 0, blush: cut ? 1 : 0 }); w.restore();
    if (cut) { const f = seg(t, tOff, tOff + 0.5); w.save(); w.translate(-230 - f * 30, -60 + E.in(f) * 30); S.tailFlat(w, 280, 0.1 + f * 0.25, 2); w.restore(); }
    // the hand with scissors (hovers, then snips)
    const hov = Math.sin(t * 3) * 10 * (1 - snip);
    w.save(); w.translate(-320 + snip * 30, -220 + hov + snip * 40); w.rotate(0.62); HK.handScissors(w, 1.15, lerp(0.9 + Math.sin(t * 6) * 0.08, 0, snip)); w.restore();
    w.save(); w.translate(-190, -110); S.snipStar(w, seg(t, tOff - 0.02, tOff + 0.5)); w.restore();
  });
  const ha = 1 - seg(t, tLive - 0.3, tLive - 0.05);
  if (ha > 0) { ctx.save(); const u = 0.85 + 0.15 * E.back(seg(t, 0, 0.3), 2); ctx.translate(W / 2, 230); ctx.scale(u, u); ctx.translate(-W / 2, -230); ST.headline2(ctx, 'PAID PER', 'RAT TAIL', ha); ctx.restore();
    label(ctx, 'HANOI · 1902', W / 2, 430, pop(t, t1902 - 0.05) * ha, { size: 40, col: '#171717', fg: C.yellow, rot: 0.02 }); }
  label(ctx, 'LIVE RATS', 760, 190, pop(t, tLive - 0.05), { size: 72, col: C.yellow, rot: -0.03 });
  label(ctx, '…AND LET GO', 1200, 300, pop(t, tLetting - 0.05), { size: 64, col: PAL.green, fg: PAL.cream, rot: 0.03 });
  ST.grade(ctx, 'golden', 0.2);
}, { type: 'cut' });
// A2 "Because the city was paying for tails.": the exchange at the bounty table
shot('A2 exchange', tBecause - 0.12, Z.s02 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -330, 0.92], [2.6, 0, -340, 0.98]], lt);
  layer(ctx, c, 1, w => HK.exchangeWide(w, t, { pay: E.inOut(seg(t, tTails - 0.3, tTails + 0.3)) }));
  label(ctx, 'THE CITY PAID', 290, 420, pop(t, tPaying - 0.3), { size: 50, rot: -0.03 });
  label(ctx, 'FOR TAILS', 1620, 330, pop(t, tTails - 0.08), { size: 76, col: C.yellow, rot: 0.04 });
  ST.grade(ctx, 'golden', 0.2);
});

// ================= s02 =================
const tThis = Z.s02, tOne = at('s02', 'one'), tStrange = at('s02', 'strange'), tRule = at('s02', 'rule'), tEvery = at('s02', 'every'), tPays = at('s02', 'pays'), tNumber = at('s02', 'number'),
  tPeople = at('s02', 'people'), tCheap = at('s02', 'cheapest'), tMake = at('s02', 'make'), tNumber2 = at('s02', 'number', 1);
// B1 "This video is about one strange rule.": the rule card; the rat peeks from behind it
shot('B1 rule', tThis - 0.12, tEvery - 0.12, (ctx, t, lt) => {
  ST.bg(ctx, '#EADFC6'); ctx.fillStyle = 'rgba(120,90,50,0.07)'; for (let i = 0; i < 18; i++) ctx.fillRect(0, i * 64, W, 3);
  const pk = E.back(seg(t, tRule - 0.2, tRule + 0.3), 1.6); if (pk > 0) { ctx.save(); ctx.translate(1380, 330 - pk * 150); S.ratPeek(ctx, 0.9, { look: [-0.6, 0.3] }); ctx.restore(); }
  ctx.save(); ctx.translate(960, 460); const z = 1 + lt * 0.015; ctx.scale(z, z);
  IK.card(ctx, 1000, 420, seg(t, tThis - 0.1, tThis + 0.25), g => {
    if (t < tOne - 0.05) fitTxt(g, '?', 0, 0, 220, C.red, 800); else { const u = E.back(seg(t, tOne - 0.05, tOne + 0.2), 2); g.save(); g.translate(0, -100); g.scale(u, u); fitTxt(g, 'ONE', 0, 40, 120, '#171717', 800); g.restore(); }
    g.save(); g.translate(0, 90); g.rotate(0.02); const u = E.back(seg(t, tStrange - 0.1, tStrange + 0.2), 2); if (u > 0) { g.scale(u, u); require('../../hirkit/collage').cutout(g, () => rr(g, -400, -64, 800, 120, 14), C.red, { elev: 1.2 }); fitTxt(g, 'STRANGE RULE', 0, 30, 92, PAL.cream, 740); } g.restore();
  }); ctx.restore();
  label(ctx, 'THIS VIDEO:', 960, 160, pop(t, tThis - 0.05), { size: 50, col: '#171717', fg: C.yellow });
  ST.grade(ctx, 'office', 0.18);
});
// B2 "Every time someone pays for a number... people find the cheapest way to make the number.": the counter on the wall
shot('B2 counter', tEvery - 0.12, Z.s03 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -400, 0.8], [5.5, 0, -410, 0.85]], lt);
  const fly = seg(t, tPays - 0.1, tNumber - 0.05), spin = seg(t, tCheap - 0.3, tNumber2);
  const val = t < tNumber ? 0 : (t < tCheap - 0.3 ? 1 : Math.floor(lerp(1, 99999, E.in(spin))));
  layer(ctx, c, 1, w => { SE.room(w, t, { wall: '#DCE6EE', floor: 'wood' });
    w.save(); w.translate(0, -620); IK.counter(w, val, t); w.restore();
    P.person(w, -720, 0, 1.05, 1, P.LOOKS.office, { face: FACE(t > tCheap ? 'surprised' : 'smile', [1, -0.3], t), armN: t < tPays + 0.2 ? { hand: [150, -330], grip: 'pinch', item: g => { if (fly <= 0) { g.save(); g.translate(18, -20); S.coin(g, 32, '1¢', { spin: t * 3 }); g.restore(); } } } : { hand: [140, -300], grip: 'open' } }, { tie: C.red });
    if (fly > 0 && fly < 1) { const x = lerp(-560, 0, fly), y = lerp(-370, -790, fly) - Math.sin(fly * Math.PI) * 200; w.save(); w.translate(x, y); S.coin(w, 32, '1¢', { spin: t * 9 }); w.restore(); }
    const busy = t > tCheap - 0.3 && t < tNumber2;
    P.person(w, 640, 0, 1.05, -1, P.LOOKS.casual, { face: FACE(t > tPeople ? 'smug' : 'neutral', [1, -0.4], t, 1), lean: busy ? 0.1 : 0, armN: { hand: busy ? [170 + Math.sin(t * 30) * 12, -500] : [120, -300], grip: busy ? 'point' : 'relax' } });
  });
  label(ctx, 'PAY FOR A NUMBER', 560, 150, pop(t, tPays - 0.05), { size: 62 });
  label(ctx, 'CHEAPEST WAY', 960, 660, pop(t, tCheap - 0.05), { size: 50, col: '#171717', fg: C.yellow, rot: 0.03 });
  label(ctx, '→ GET THE NUMBER', 1380, 150, pop(t, tNumber2 - 0.05), { size: 62, col: C.yellow });
  ST.grade(ctx, 'office', 0.18);
});

// ================= s03 =================
const tNot = Z.s03, tWanted = at('s03', 'wanted'), tJust = at('s03', 'just'), tNum3 = at('s03', 'number'), tWell = at('s03', "we'll"), tRats = at('s03', 'rats'), tVac = at('s03', 'vacuum'),
  tChoc = at('s03', 'chocolate'), tBiggest = at('s03', 'biggest'), tTraffic = at('s03', 'traffic'), tCity = at('s03', 'city'), tOnce = at('s03', 'once'), tEmus = at('s03', 'emus'), tWhere = at('s03', 'where'), tWorked = at('s03', 'worked');
// C1 "Not the thing you wanted. Just the number.": the target (struck out) vs the counter (ticked)
shot('C1 not the thing', tNot - 0.12, tWell - 0.12, (ctx, t, lt) => {
  ST.bg(ctx, PAL.paper); ctx.fillStyle = 'rgba(201,135,74,0.12)'; for (let i = 0; i < 18; i++) ctx.fillRect(0, i * 64, W, 3);
  ctx.save(); ctx.translate(540, 470); IK.card(ctx, 640, 600, seg(t, tNot - 0.12, tNot + 0.2), g => {
    g.save(); g.translate(0, -50); IK.target(g, 170); g.restore(); fitTxt(g, 'THE THING YOU WANTED', 0, 250, 46, '#171717', 580);
    g.save(); g.translate(0, -50); ST.bigX(g, 190, seg(t, tWanted - 0.05, tWanted + 0.3)); g.restore(); }, { rot: -0.03 }); ctx.restore();
  ctx.save(); ctx.translate(1380, 470); IK.card(ctx, 640, 600, seg(t, tJust - 0.15, tJust + 0.15), g => {
    g.save(); g.translate(0, -60); g.scale(0.72, 0.72); IK.counter(g, 99999, t); g.restore(); fitTxt(g, 'JUST THE NUMBER', 0, 250, 52, '#171717', 580);
    g.save(); g.translate(210, 120); HK.tick(g, 80, seg(t, tNum3 - 0.05, tNum3 + 0.3)); g.restore(); }, { rot: 0.025 }); ctx.restore();
  ST.grade(ctx, 'day', 0.15);
});
// C2 "We'll see it with rats, with vacuum cleaners, with chocolate pudding, with one of the biggest banks in America, and with the traffic of a
// whole city. And once — with emus — where paying people actually worked.": the six chapter cards fly in on the words
const CARDS = [['rat', 'RATS', tRats], ['vacuum', 'VACUUMS', tVac], ['pudding', 'PUDDING', tChoc], ['bank', 'A BANK', tBiggest], ['plate', 'CAR PLATES', tTraffic], ['emu', 'EMUS', tEmus]];
shot('C2 six cards', tWell - 0.12, T + 0.01, (ctx, t, lt) => {
  ST.bg(ctx, '#EADFC6'); ctx.fillStyle = 'rgba(120,90,50,0.07)'; for (let i = 0; i < 18; i++) ctx.fillRect(0, i * 64, W, 3);
  const z = 1 + lt * 0.006; ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
  const dim = seg(t, tOnce - 0.2, tOnce + 0.3), hero = E.inOut(seg(t, tWhere - 0.2, tWhere + 0.5));
  CARDS.forEach(([kind, cap, t0], i) => {
    const isEmu = kind === 'emu', x = 960 + (i - 2.5) * 292, y = 500 + (i % 2 ? 18 : -18) + Math.sin(t * 1.3 + i) * 5;
    ctx.save(); ctx.translate(isEmu ? lerp(x, x - 40, hero) : x, isEmu ? lerp(y, 470, hero) : y); if (isEmu) ctx.scale(1 + 0.18 * hero, 1 + 0.18 * hero);
    IK.iconCard(ctx, kind, cap, t, seg(t, t0 - 0.25, t0 + 0.2), { dir: i % 2 ? -1 : 1, rot: (i % 2 ? 0.03 : -0.03), dim: isEmu ? 0 : dim * 0.9, bg: isEmu ? '#F2E2B8' : undefined });
    if (isEmu) { ctx.save(); ctx.translate(0, 210); ST.stampWord(ctx, 'IT WORKED', 44, seg(t, tWorked - 0.1, tWorked + 0.25), PAL.green, -0.06); ctx.restore(); }
    ctx.restore(); });
  ctx.restore();
  label(ctx, "WE'LL SEE IT WITH…", 960, 160, pop(t, tWell - 0.05), { size: 56 });
  label(ctx, 'A WHOLE CITY', 960 + 1.5 * 292, 300, pop(t, tCity - 0.05), { size: 40, col: '#171717', fg: C.yellow, rot: 0.04 });
  const bu = seg(t, tOnce - 0.1, tOnce + 0.25); if (bu > 0) { ctx.save(); ctx.globalAlpha = clamp(bu * 3); ctx.strokeStyle = '#171717'; ctx.lineWidth = 6; ctx.lineCap = 'round'; const x0 = 960 - 2.5 * 292 - 110, x1 = 960 + 1.5 * 292 + 110, y = 712;
    ctx.beginPath(); ctx.moveTo(x0, y - 24); ctx.lineTo(x0, y); ctx.lineTo(lerp(x0, x1, E.out(bu)), y); if (bu > 0.95) ctx.lineTo(x1, y - 24); ctx.stroke(); ctx.restore(); }
  label(ctx, 'ALL PAID FOR A NUMBER', 960 - 0.5 * 292, 790, pop(t, tOnce + 0.1), { size: 50, col: C.red, fg: PAL.cream, rot: -0.02 });
  ST.grade(ctx, 'office', 0.15);
});

// ---------- sound cues (SFX for mix.py) ----------
function cues() {
  const c = [['slam', 0.0, 2.0], ['ding', 0.02, 1.4], ['pop', t1902 - 0.05, 0.6], ['squeak', 1.0, 0.5], ['snip', tCutting, 0.3]];
  c.push(['snip', tOff - 0.02, 0.9], ['squeak', tOff + 0.05, 0.8], ['pop', tLive - 0.05, 0.5], ['pop', tLetting - 0.05, 0.4], ['whoosh', tLetting, 0.5], ['squeak', tGo, 0.5]);
  c.push(['cut', tBecause - 0.12, 0.35], ['steps', tBecause, 0.4], ['pop', tPaying - 0.3, 0.4], ['pop', tTails - 0.08, 0.5], ['clink', tTails, 0.9], ['kaching', tTails + 0.3, 0.5]);
  c.push(['cut', tThis - 0.12, 0.35], ['pop', tThis - 0.05, 0.4], ['paper', tOne - 0.15, 0.6], ['pop', tOne, 0.4], ['stamp', tStrange + 0.05, 0.6], ['squeak', tRule, 0.5]);
  c.push(['cut', tEvery - 0.12, 0.35], ['pop', tPays - 0.05, 0.4], ['whoosh', tPays, 0.3], ['clink', tNumber - 0.05, 0.8], ['tick', tNumber, 0.6]);
  for (let i = 0; i < 12; i++) c.push(['tick', tCheap - 0.2 + i * 0.13, 0.5]); c.push(['pop', tCheap - 0.05, 0.4], ['ding', tNumber2, 0.6], ['pop', tNumber2 - 0.05, 0.5]);
  c.push(['cut', tNot - 0.12, 0.35], ['paper', tNot - 0.1, 0.6], ['buzzer', tWanted + 0.1, 0.5], ['paper', tJust - 0.15, 0.6], ['ding', tNum3 + 0.05, 0.6]);
  c.push(['cut', tWell - 0.12, 0.35], ['pop', tWell - 0.05, 0.4]);
  CARDS.forEach(([k, cap, t0]) => c.push(['whoosh', t0 - 0.3, 0.45], ['pop', t0, 0.5]));
  c.push(['pop', tCity - 0.05, 0.3]); for (let i = 0; i < 5; i++) c.push(['stamp', tOnce + 0.1 + i * 0.08, 0.25]);
  c.push(['rise', tWhere - 0.2, 0.5], ['sparkle', tWorked, 0.6], ['stamp', tWorked + 0.05, 0.6]);
  return c;
}
const MUSIC = [[0, 'light'], [Z.s02 - 0.12, 'calm'], [tWell - 0.12, 'up']];

core.run({ module, dir: __dirname, TL, SH, cues, music: MUSIC,
  highlight: ['1902', 'hanoi', 'tails', 'rule', 'number', 'cheapest', 'rats', 'vacuum', 'pudding', 'banks', 'traffic', 'emus', 'worked'] });
module.exports = { T, Z, SH };
