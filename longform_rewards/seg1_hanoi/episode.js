process.env.HIR_WIDE = '1';
// Long-form "When Paying People Backfired" — segment 1: CHAPTER 1 · HANOI, 1902 · The Rat Tails (16:9, rows 4–8 of script.md).
// Re-uses the drawn world of rats_ep26 (ratkit.js, cast.js) re-framed for 1920x1080. Picture + voice/SFX stems only; the lead adds music.
// Usage: node episode.js cues | srt out.srt | still t1,t2,... out.png | frame t out.png [nosubs] | video out.mp4 | shots
const K = require('../../tests/mcd_collage/kit');
const R = require('../../hirkit/rig');
const CL = require('../../hirkit/collage');
const ST = require('../../howitsrun_style/style');
const SE = require('../../howitsrun_style/sets');
const P = require('../../howitsrun_style/people');
const HK = require('./hanoikit');
const core = require('./core');
const { S, CS, FACE, coinItem, tailItem } = HK;
const { C, clamp, lerp, seg, E, rr } = K;
const { W, H, PAL, layer, cam, shake, pop, label, fitTxt } = ST;

const TL = core.timeline(__dirname, 3.0);
const { Z, at, T } = TL;

const SH = []; const shot = (id, t0, t1, draw, out) => SH.push({ id, t0, t1, draw, out });
const runRats = (ctx, t, n, y, speed, o = {}) => { for (let i = 0; i < n; i++) { const x = ((t * speed + i * (2400 / n)) % 2600) - 1300; ctx.save(); ctx.translate(x, y + (i % 2) * 50); S.rat(ctx, { s: o.s || 0.7, phase: t * 14 + i, run: 1, tail: o.stub ? (i % 2 ? 'stub' : true) : true, mood: 'happy' }); ctx.restore(); } };

// ================= K0 chapter card (0.0–3.0, no voice) =================
shot('K0 chapter card', 0, Z.s01 - 0.12, (ctx, t) => {
  ctx.save(); const z = 1 + t * 0.02; ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
  HK.chapterCard(ctx, t, 'CHAPTER 1', 'The Rat Tails', 'HANOI, 1902', seg(t, -0.1, 0.3));
  ctx.restore();
  const u = seg(t, 0.35, 2.7); if (u > 0 && u < 1) { ctx.save(); ctx.translate(lerp(-200, W + 200, u), 850); S.rat(ctx, { s: 0.75, phase: t * 14, run: 1, mood: 'happy' }); ctx.restore(); }
  ST.grade(ctx, 'golden', 0.18);
}, { type: 'cut' });

// ================= s01 =================
// A1 "Hanoi, French colonial Vietnam.": the old postcard, labels on the right
const tRats = at('s01', 'rats'), tFr = at('s01', 'french'), tViet = at('s01', 'vietnam'), tThe = at('s01', 'the'), tNew = at('s01', 'new'), tSewers = at('s01', 'sewers'), tUnder = at('s01', 'under'), tTown = at('s01', 'town');
shot('A1 postcard', Z.s01 - 0.12, tThe - 0.12, (ctx, t, lt) => {
  ST.bg(ctx, '#E9DFC8'); ctx.fillStyle = 'rgba(120,90,50,0.07)'; for (let i = 0; i < 18; i++) ctx.fillRect(0, i * 64, W, 3);
  const z = 1.0 + lt * 0.02; ctx.save(); ctx.translate(700, 480); ctx.scale(z, z); S.postcard(ctx, t, { caption: 'HANOI' }); ctx.restore();
  label(ctx, 'HANOI', 1490, 300, pop(t, Z.s01), { size: 96, col: C.yellow });
  label(ctx, 'FRENCH COLONIAL', 1490, 470, pop(t, tFr - 0.05), { size: 56, rot: 0.02 });
  label(ctx, 'VIETNAM', 1490, 600, pop(t, tViet - 0.05), { size: 64, col: '#171717', fg: C.yellow, rot: -0.03 });
  ST.grade(ctx, 'golden', 0.2);
});
// A2 "The French built new sewers under their part of town.": the street section, the camera tilts down to the new pipes
const VX = [-650, 650];
function section(w, t, shine, inside) { SE.sky(w, t, { warm: true, clouds: 3, hills: false }); S.tree(w, -1500, 1); S.tree(w, 0, 0.9); VX.forEach(x => S.villa(w, x, 0.85)); S.tree(w, 1550, 0.95); S.sewers(w, t, [...VX, -1800, 1800], { shine, inside }); }
shot('A2 sewers', tThe - 0.12, tRats - 0.12, (ctx, t, lt) => {
  const k = E.inOut(seg(t, tSewers - 0.6, tSewers + 0.4)); const c = cam([[0, 0, -420, 0.82], [4, 0, -430, 0.84]], lt); c.y = lerp(-430, 40, k);
  layer(ctx, c, 1, w => section(w, t, seg(t, tNew - 0.1, tNew + 0.4)));
  label(ctx, 'FRENCH QUARTER', 960, 150, pop(t, tThe), { size: 56 });
  label(ctx, 'NEW SEWERS', 560, 330, pop(t, tSewers - 0.05), { size: 74, col: C.yellow, rot: -0.03, arrow: 1 });
  label(ctx, 'UNDER THEIR PART OF TOWN', 1340, 330, pop(t, tUnder - 0.05), { size: 50, rot: 0.02, arrow: -1 });
  ST.grade(ctx, 'golden', 0.2);
});
// A3 "Rats loved them.": inside the pipe, rats running, hearts pop
const tThey = at('s01', 'they'), tToilets = at('s01', 'toilets'), tAnd = at('s01', 'and'), tPlague = at('s01', 'plague'), tSpread = at('s01', 'spreading'), tAcross = at('s01', 'across'), tAsia = at('s01', 'asia');
shot('A3 rats in pipe', tRats - 0.12, tThey - 0.12, (ctx, t, lt) => {
  const c = cam([[0, -100, 230, 1.35], [1.8, 40, 240, 1.45]], lt);
  layer(ctx, c, 1, w => section(w, t, 0.5, g => { for (let i = 0; i < 8; i++) { const x = ((t * 420 + i * 330) % 2600) - 1300; g.save(); g.translate(x, 392); S.rat(g, { s: 0.62, phase: t * 14 + i, run: 1, mood: 'happy' }); g.restore(); } }));
  for (let i = 0; i < 6; i++) HK.heart(ctx, 420 + i * 220, 760 - (i % 2) * 50, 0.9, (t - (tRats + i * 0.18)) / 1.0);
  label(ctx, 'RATS LOVED THEM', 960, 190, pop(t, tRats - 0.05), { size: 80, col: C.yellow });
  ST.grade(ctx, 'office', 0.24);
});
// A4 "They came up through the toilets,": the bathroom, a rat pops out of the bowl
shot('A4 toilet', tThey - 0.12, tAnd - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 280, -500, 0.95], [1.4, 280, -490, 1.0]], lt);
  layer(ctx, c, 1, w => { S.bathroom(w, t); S.toilet(w, seg(t, tToilets - 0.45, tToilets), t); });
  label(ctx, 'UP THROUGH', 1420, 360, pop(t, tThey + 0.1), { size: 56, rot: -0.02 });
  label(ctx, 'THE TOILETS', 1420, 500, pop(t, tToilets - 0.05), { size: 80, col: C.yellow, rot: 0.03 });
  ST.grade(ctx, 'office', 0.2);
});
// A5 "and plague was spreading across Asia.": PLAGUE notices slap onto the wall, more and more of them
shot('A5 plague', tAnd - 0.12, Z.s02 - 0.12, (ctx, t, lt) => {
  ST.bg(ctx, '#CDBB98'); ctx.fillStyle = 'rgba(90,60,30,0.10)'; for (let y = 0; y < H; y += 60) for (let x = (y / 60) % 2 * 60; x < W; x += 120) ctx.fillRect(x, y, 116, 56);
  const pos = [[tSpread, 1250, 420, 0.5, 0.08], [tAcross, 1560, 470, 0.45, -0.07], [tAsia, 380, 440, 0.45, 0.05]];
  for (const [t0, x, y, s, r] of pos) { const u = pop(t, t0 - 0.1, 0.3, 1.6); if (u <= 0) continue; ctx.save(); ctx.translate(x, y); ctx.scale(s * u, s * u); S.plagueNotice(ctx, { rot: r }); ctx.restore(); }
  const u = pop(t, tPlague - 0.15, 0.3, 1.6); if (u > 0) { ctx.save(); ctx.translate(860 + shake(t, tPlague + 0.1, 10), 470); const z = (0.95 + lt * 0.02) * u; ctx.scale(z, z); S.plagueNotice(ctx); ctx.restore(); }
  label(ctx, 'SPREADING ACROSS ASIA', 960, 860, pop(t, tAsia - 0.1), { size: 54, col: '#171717', fg: C.yellow });
  ST.grade(ctx, 'office', 0.28);
});

// ================= s02 =================
const tApril = at('s02', 'april'), tCity2 = at('s02', 'city'), tHunt = at('s02', 'hunt'), tEvery = at('s02', 'everyone'), tBring = at('s02', 'bring'), tPaid = at('s02', 'paid'),
  tRep = at('s02', 'reportedly'), tCent = at('s02', 'cent'), tJust = at('s02', 'just'), tNobody = at('s02', 'nobody'), tPiles = at('s02', 'piles'), tDead = at('s02', 'dead'), tPolice = at('s02', 'police');
// B1 "So in April 1902 the city opened a hunt for everyone:": street, the official pins up the notice, people come over
shot('B1 april', Z.s02 - 0.12, tBring - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 100, -420, 0.8], [3.6, 140, -430, 0.84]], lt);
  layer(ctx, c, 1, w => { S.street(w, t, { n: 14, x0: -2800, trees: false }); S.tree(w, 1500, 1);
    // notice board with the RAT HUNT notice
    R.tube(w, [[420, 0], [420, -560]], 22, '#6E4528', 4); R.tube(w, [[760, 0], [760, -560]], 22, '#6E4528', 4); rr(w, 360, -760, 460, 300, 8); R.fillStroke(w, '#8A5A34', 5);
    const nu = E.back(seg(t, tCity2 - 0.2, tCity2 + 0.2), 1.6); if (nu > 0) { w.save(); w.translate(590, -600); w.scale(0.4 * nu, 0.4 * nu); S.bountyNotice(w, { rot: 0.02 }); w.restore(); }
    if (t > tHunt - 0.05) { w.save(); w.translate(590, -330); ST.stampWord(w, 'RAT HUNT', 80, seg(t, tHunt - 0.05, tHunt + 0.3), C.red, -0.06); w.restore(); }
    CS.cast(w, 1000, 0, 1.08, -1, 'official', { face: FACE('smile', [1, -0.1], t), armN: { hand: [150, -380], grip: 'point' } });
    const come = E.out(seg(t, tEvery - 0.9, tEvery + 0.5));
    [['hunter', {}], ['woman', {}], ['elder', {}], ['youth', {}]].forEach(([who, o], i) => { const x = lerp(-1500 - i * 320, -40 - i * 290, come);
      CS.cast(w, x, 0, 1.0, 1, who, come > 0 && come < 1 ? { ...R.walk(t * 4 + i), face: FACE('smile', [1, 0], t, i) } : { face: FACE(i % 2 ? 'surprised' : 'smile', [1, -0.1], t, i) }, o); }); });
  ctx.save(); ctx.translate(300, 300); const u = pop(t, tApril - 0.1, 0.35); ctx.scale(0.62 * u, 0.62 * u); ctx.rotate(-0.05); if (u > 0) ST.calCard(ctx, 'APRIL', '1902'); ctx.restore();
  label(ctx, 'A HUNT FOR EVERYONE', 960, 150, pop(t, tEvery - 0.1), { size: 60, col: C.yellow });
  ST.grade(ctx, 'golden', 0.2);
});
// B2 "bring in a rat tail, get paid —": the exchange at the bounty table
shot('B2 exchange', tBring - 0.12, tRep - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -330, 0.95], [2.4, 0, -340, 1.0]], lt);
  layer(ctx, c, 1, w => HK.exchangeWide(w, t, { pay: E.inOut(seg(t, tPaid - 0.2, tPaid + 0.4)), }));
  label(ctx, 'BRING A TAIL', 330, 230, pop(t, tBring - 0.05), { size: 60, col: C.yellow, rot: -0.04 });
  label(ctx, 'GET PAID', 1600, 230, pop(t, tPaid - 0.05), { size: 70, col: PAL.green, fg: PAL.cream, rot: 0.04 });
  ST.grade(ctx, 'golden', 0.2);
});
// B3 "reportedly one cent a tail.": the bounty notice, BOUNTY stamp, 1¢ = 1 TAIL
shot('B3 notice', tRep - 0.12, tJust - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -600, 0.9], [3, 0, -610, 0.94]], lt);
  layer(ctx, c, 1, w => S.street(w, t, { n: 14, x0: -2800, trees: false }));
  ctx.save(); ctx.translate(720, 470); const z = 0.95 * pop(t, tRep - 0.15, 0.3, 1.6); ctx.scale(z, z); S.bountyNotice(ctx); ctx.restore();
  label(ctx, 'REPORTEDLY', 1420, 230, pop(t, tRep - 0.05), { size: 44, col: '#171717', fg: C.yellow, rot: 0.05 });
  label(ctx, '1¢ = 1 TAIL', 1420, 420, pop(t, tCent - 0.1), { size: 96, col: C.yellow, rot: -0.04 });
  ctx.save(); ctx.translate(1420, 650); ST.stampWord(ctx, 'BOUNTY', 100, seg(t, tCent + 0.35, tCent + 0.65), C.red, -0.12); ctx.restore();
  ST.grade(ctx, 'golden', 0.2);
});
// B4 "Just the tail.": punch-in on the hands: the tail for the coin
shot('B4 just tail', tJust - 0.12, tNobody - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -420, 2.0], [1.4, 0, -425, 2.1]], lt);
  layer(ctx, c, 1, w => HK.exchangeWide(w, t, { pay: 0.5 }));
  label(ctx, 'JUST THE TAIL', 960, 170, pop(t, tJust - 0.05), { size: 84, col: C.yellow });
  ST.grade(ctx, 'golden', 0.22);
});
// B5 "Nobody wanted piles of dead rats at the police station.": the police station; the officer pictures a heap of rats: NO
shot('B5 police', tNobody - 0.12, Z.s03 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -440, 0.82], [3, 20, -450, 0.86]], lt);
  layer(ctx, c, 1, w => { S.street(w, t, { n: 14, x0: -2800, trees: false }); HK.policeStation(w, -300, t);
    CS.cast(w, 380, 0, 1.08, -1, 'official', { face: FACE(t > tDead ? 'shocked' : 'skeptical', [1, -0.2], t), lean: -0.06, armN: { hand: [170, -400], grip: 'open' } }); });
  ctx.save(); ctx.translate(1600, 330); ctx.scale(0.68, 0.68); HK.ratPileBubble(ctx, t, seg(t, tPiles - 0.25, tPiles + 0.15)); ST.bigX(ctx, 180, seg(t, tDead + 0.05, tDead + 0.4)); ctx.restore();
  label(ctx, 'NOBODY WANTED THIS', 1600, 110, pop(t, tNobody - 0.05), { size: 52, rot: 0.02 });
  ST.grade(ctx, 'golden', 0.2);
});

// ================= s03 =================
const tWorked = at('s03', 'worked'), tPaper = at('s03', 'paper'), tPeak = at('s03', 'peak'), tOver = at('s03', 'over'), tTwenty = at('s03', 'twenty'), tSingle = at('s03', 'single');
// C1 "It worked...": the queue with baskets of tails
shot('C1 queue', Z.s03 - 0.12, tPaper - 0.25, (ctx, t, lt) => {
  const c = cam([[0, -200, -430, 0.72], [1.6, -120, -430, 0.75]], lt);
  layer(ctx, c, 1, w => HK.queueWide(w, t));
  label(ctx, 'IT WORKED…', 960, 150, pop(t, tWorked - 0.05), { size: 84, col: PAL.green, fg: PAL.cream });
  ST.grade(ctx, 'golden', 0.2);
});
// C2 "on paper.": the ledger fills with tally marks
shot('C2 ledger', tPaper - 0.25, tPeak - 0.3, (ctx, t, lt) => {
  ST.bg(ctx, '#7E5532'); ctx.fillStyle = 'rgba(70,40,20,0.15)'; for (let y = 20; y < H; y += 60) ctx.fillRect(0, y, W, 4);
  ctx.save(); ctx.translate(960, 500); const z = 1.0 + lt * 0.05; ctx.scale(z, z); HK.ledger(ctx, Math.floor(lerp(4, 48, seg(t, tPaper - 0.3, tPeak - 0.3))), t); ctx.restore();
  label(ctx, '…ON PAPER', 960, 130, pop(t, tPaper - 0.05), { size: 72, col: C.yellow, rot: -0.02 });
  ST.grade(ctx, 'office', 0.2);
});
// C3 "At the peak, over twenty thousand tails came in a single day.": the heap grows; 20,000+
shot('C3 20000', tPeak - 0.3, Z.s04 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 250, -430, 0.8], [4, 300, -440, 0.86]], lt);
  const n = Math.floor(lerp(20, 230, E.out(seg(t, tOver - 0.4, tSingle + 0.4))));
  layer(ctx, c, 1, w => { S.street(w, t, { n: 14, x0: -2800 }); w.save(); w.translate(150, -10); S.tailHeap(w, n, 1000, 420); w.restore();
    CS.cast(w, 980, 0, 1.05, -1, 'official', { face: FACE('shocked', [-1, -0.3], t), headTilt: -0.05 });
    for (let i = 0; i < 3; i++) { w.save(); w.translate(-760 + i * 220, 0); S.basket(w, 0.9, 12, i + 4); w.restore(); } });
  label(ctx, 'AT THE PEAK', 420, 160, pop(t, tPeak - 0.05), { size: 50 });
  const u = pop(t, tTwenty - 0.1, 0.35); if (u > 0) { ctx.save(); ctx.translate(960 + shake(t, tTwenty + 0.2, 8), 230); ctx.scale(u, u); S.bigPlate(ctx, '20,000+', 120); ctx.restore(); }
  label(ctx, 'TAILS IN ONE DAY', 960, 420, pop(t, tSingle - 0.1), { size: 60, col: C.yellow });
  ST.grade(ctx, 'golden', 0.2);
});

// ================= s04 =================
const tOff = at('s04', 'officials'), tSee = at('s04', 'seeing'), tRats4 = at('s04', 'rats'), tNo = at('s04', 'no'), tPeople = at('s04', 'people'), tFig = at('s04', 'figured'),
  tCut = at('s04', 'cut'), tTail4 = at('s04', 'tail'), tLet = at('s04', 'let'), tGo = at('s04', 'go'), tLet2 = at('s04', 'let', 1), tMake = at('s04', 'make'), tMore = at('s04', 'more'), tMore2 = at('s04', 'more', 1),
  tInsp = at('s04', 'inspectors'), tFound = at('s04', 'found'), tFarms = at('s04', 'farms'), tOutside = at('s04', 'outside');
// D1 "Then officials started seeing rats running around with no tails.": the inspector with a magnifier; tailless rats run past
shot('D1 no tails', Z.s04 - 0.12, tPeople - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -300, 0.92], [3.5, 40, -300, 0.98]], lt);
  layer(ctx, c, 1, w => { S.street(w, t, { n: 14, x0: -2800 });
    const shocked = t > tNo - 0.1;
    CS.cast(w, -350, 0, 1.15, 1, 'inspector', { face: FACE(shocked ? 'shocked' : 'squint', [1, 0.5], t), lean: 0.08, armN: { hand: [160, -300], grip: 'hold', item: g => S.magnifier(g, 0.9) } });
    for (let i = 0; i < 4; i++) { const u = seg(t, tRats4 - 0.6 + i * 0.4, tRats4 + 1.5 + i * 0.4); if (u <= 0 || u >= 1) continue;
      w.save(); w.translate(lerp(1300, -1400, u), 10 + (i % 2) * 50); w.scale(-1, 1); S.rat(w, { s: 0.8, phase: t * 14 + i, run: 1, tail: 'stub', blush: 1, mood: i === 0 ? 'shock' : 'happy' }); w.restore(); } });
  label(ctx, 'OFFICIALS NOTICE…', 420, 150, pop(t, tOff - 0.05), { size: 50 });
  label(ctx, 'NO TAILS?!', 1450, 220, pop(t, tNo - 0.05), { size: 84, col: C.red, fg: PAL.cream, rot: 0.04 });
  ST.grade(ctx, 'golden', 0.2);
});
// D2 "People had figured it out:": the hunter, a sly grin, a light bulb
shot('D2 figured', tPeople - 0.12, tCut - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 150, -480, 1.2], [1.8, 170, -490, 1.28]], lt);
  layer(ctx, c, 1, w => { S.street(w, t, { n: 14, x0: -2800 }); w.save(); w.translate(560, 0); S.crate(w, 220, 150, 1, 2, t); w.restore();
    CS.cast(w, 80, 0, 1.15, 1, 'hunter', { face: FACE(t > tFig ? 'smug' : 'thinking', [1, -0.3], t), headTilt: -0.06, armN: { hand: [150, -260], grip: 'pinch', item: tailItem(t, 120) } }); });
  ctx.save(); ctx.translate(560, 260); HK.bulb(ctx, seg(t, tFig - 0.1, tFig + 0.2), t); ctx.restore();
  label(ctx, 'THEY FIGURED IT OUT', 1360, 180, pop(t, tFig - 0.05), { size: 60, col: C.yellow });
  ST.grade(ctx, 'golden', 0.2);
});
// D3 "cut off the tail, let the rat go, let it make more rats — and more tails.": three comic panels side by side CUT / FREE / BREED
function panel(ctx, x, y, w, h, u, title, col, draw) {
  if (u <= 0) return; ctx.save(); ctx.translate(x, y); const k = E.back(clamp(u), 1.6); ctx.scale(k, k); ctx.rotate((title.length % 2 ? -1 : 1) * 0.012);
  CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 16), '#FBF6EA', { elev: 1.6 });
  ctx.save(); rr(ctx, -w / 2, -h / 2, w, h, 16); ctx.clip(); ctx.fillStyle = '#E2D3B4'; ctx.fillRect(-w / 2, h / 2 - 110, w, 110); ctx.translate(0, h / 2 - 110); ctx.scale(1.3, 1.3); draw(ctx); ctx.restore();
  rr(ctx, -w / 2, -h / 2, w, h, 16); ctx.lineWidth = R.px(ctx, 5); ctx.strokeStyle = '#171717'; ctx.stroke();
  label(ctx, title, -w / 2 + 120, -h / 2 + 56, 1, { size: 50, col, fg: col === C.yellow ? '#171717' : PAL.cream, rot: -0.03 });
  ctx.restore();
}
shot('D3 trick', tCut - 0.12, tInsp - 0.12, (ctx, t, lt) => {
  ST.bg(ctx, '#3E4A5C'); ctx.fillStyle = 'rgba(255,255,255,0.05)'; for (let i = 0; i < 14; i++) ctx.fillRect(0, i * 90, W, 30);
  const PW = 540, PH = 480, PY = 470, gr = 0;
  panel(ctx, 370, PY, PW, PH, seg(t, tCut - 0.12, tCut + 0.15), '1 CUT', C.red, g => {
    const snip = seg(t, tTail4 - 0.2, tTail4), cut = t > tTail4; g.translate(50, 0); g.scale(0.85, 0.85);
    g.save(); g.translate(40, gr); S.rat(g, { s: 1.0, tail: cut ? 'stub' : true, mood: cut ? 'shock' : 'happy', look: [-0.8, 0] }); g.restore();
    if (cut) { const f = seg(t, tTail4, tTail4 + 0.7); g.save(); g.translate(-180 - f * 40, gr - 40 + E.in(f) * 34); S.tailFlat(g, 170, 0.1 + f * 0.4, 1); g.restore(); }
    g.save(); g.translate(-140, gr - 70); S.scissors(g, 0.9, 1 - snip); g.restore();
    g.save(); g.translate(-60, gr - 40); S.snipStar(g, seg(t, tTail4 - 0.05, tTail4 + 0.5)); g.restore(); });
  panel(ctx, 960, PY, PW, PH, seg(t, tLet - 0.15, tLet + 0.15), '2 FREE', PAL.green, g => {
    const u = seg(t, tLet - 0.1, tGo + 0.5);
    g.save(); g.translate(-160, gr); S.crate(g, 180, 130, 0, 0, t); g.restore();
    g.save(); g.translate(lerp(-120, 330, E.inOut(u)), gr); S.rat(g, { s: 0.9, tail: 'stub', phase: t * 14, run: u > 0 && u < 1 ? 1 : 0, mood: 'happy' }); g.restore();
    if (t > tGo - 0.1) fitTxt(g, 'GO!', 60, -190, 80, C.red, 200); });
  panel(ctx, 1550, PY, PW, PH, seg(t, tLet2 - 0.15, tLet2 + 0.15), '3 BREED', C.yellow, g => {
    g.save(); g.translate(-150, gr); S.rat(g, { s: 0.62, tail: 'stub', mood: 'sly' }); g.restore();
    for (let i = 0; i < 4; i++) { const u = seg(t, tMake + i * 0.18, tMake + i * 0.18 + 0.3); if (u <= 0) continue;
      g.save(); g.translate(10 + i * 50, gr); const k = E.back(u, 2); g.scale(k, k); S.rat(g, { s: 0.36, phase: t * 6 + i, look: [0.3, -0.2] }); g.restore();
      const cu = seg(t, tMore2 + i * 0.15, tMore2 + i * 0.15 + 0.3); if (cu > 0) { g.save(); g.translate(-110 + i * 80, -120 - E.out(cu) * 20); g.scale(E.back(cu, 2), E.back(cu, 2)); S.coin(g, 34, '1¢'); g.restore(); } } });
  label(ctx, '= MORE TAILS = MORE MONEY', 960, 820, pop(t, tMore2 - 0.05), { size: 50, col: C.yellow });
  ST.grade(ctx, 'office', 0.2);
});
// D4 "Inspectors even found rat farms outside the city.": the shed full of crates; the inspector
shot('D4 farm', tInsp - 0.12, Z.s05 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -560, 0.62], [3.4, 40, -560, 0.66]], lt);
  layer(ctx, c, 1, w => { SE.sky(w, t, { warm: true, clouds: 3 }); SE.ground(w, 'dirt'); w.fillStyle = '#A9C46E'; w.fillRect(-4000, -40, 8000, 40);
    w.save(); w.translate(420, 0); w.scale(0.8, 0.8); S.shed(w, t, { rats: true }); w.restore();
    CS.cast(w, -820, 0, 1.25, 1, 'inspector', { face: FACE(t > tFound - 0.1 ? 'shocked' : 'squint', [1, 0], t), lean: -0.06, armN: t > tFound - 0.1 ? { hand: [150, -360], grip: 'point' } : { hand: [160, -300], grip: 'hold', item: g => S.magnifier(g, 0.9) } }); });
  ctx.save(); ctx.translate(1180, 200); ST.stampWord(ctx, 'RAT FARM', 120, seg(t, tFarms - 0.05, tFarms + 0.3), C.red, -0.1); ctx.restore();
  label(ctx, 'OUTSIDE THE CITY', 1180, 400, pop(t, tOutside - 0.05), { size: 54, col: C.yellow });
  ST.grade(ctx, 'golden', 0.2);
});

// ================= s05 =================
const tWanted = at('s05', 'wanted'), tPaid5 = at('s05', 'paid'), tGot = at('s05', 'got'), tHunt5 = at('s05', 'hunt'), tFailed = at('s05', 'failed'), tPlague5 = at('s05', 'plague'), tAnyway = at('s05', 'anyway'),
  tHist = at('s05', 'historian'), tVann = at('s05', 'vann'), tDug = at('s05', 'dug'), tArch = at('s05', 'archives'), tCalls = at('s05', 'calls'), tAbs = at('s05', 'absolutely'), tDis = at('s05', 'disaster');
// E1 "The city wanted fewer rats. It paid for tails. So it got tails.": WANTED / PAID FOR board + the balance (coins vs tails), rats run below
shot('E1 wanted', Z.s05 - 0.12, tHunt5 - 0.3, (ctx, t, lt) => {
  ST.bg(ctx, PAL.paper); ctx.fillStyle = 'rgba(201,135,74,0.12)'; for (let i = 0; i < 18; i++) ctx.fillRect(0, i * 64, W, 3);
  ctx.save(); ctx.translate(560, 300); HK.wantBoard(ctx, [['WANTED:', 'FEWER RATS', seg(t, tWanted - 0.1, tWanted + 0.2), PAL.green], ['PAID FOR:', 'TAILS', seg(t, tPaid5 - 0.1, tPaid5 + 0.2), C.yellow], ['GOT:', 'TAILS', seg(t, tGot - 0.1, tGot + 0.2), C.red]]); ctx.restore();
  const n = Math.floor(lerp(4, 46, E.out(seg(t, tPaid5, tGot + 0.6)))), tilt = lerp(-0.4, 0.9, E.back(seg(t, tGot - 0.1, tGot + 0.4), 1.6));
  ctx.save(); ctx.translate(1330, 250); ctx.scale(0.68, 0.68); S.balance(ctx, tilt, g => S.sack(g, 0.75), g => { g.save(); g.translate(0, -10); S.tailHeap(g, n, 190, 160); g.restore(); }); ctx.restore();
  for (let i = 0; i < 6; i++) { const x = ((t * 300 + i * 360) % 2300) - 180; ctx.save(); ctx.translate(x, 850 + (i % 2) * 20); S.rat(ctx, { s: 0.5, phase: t * 14 + i, run: 1, tail: i % 2 ? 'stub' : true, mood: 'happy' }); ctx.restore(); }
  ST.grade(ctx, 'day', 0.15);
});
// E2 "The hunt failed, and the plague came anyway.": THE RAT HUNT — FAILED; the plague notice slides in
shot('E2 failed', tHunt5 - 0.3, tHist - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -330, 0.86], [2.5, 0, -340, 0.9]], lt);
  layer(ctx, c, 1, w => { S.street(w, t, { n: 14, x0: -2800 }); S.bountyTable(w, -200);
    for (let i = 0; i < 5; i++) { const x = ((t * 380 + i * 560) % 2800) - 1400; w.save(); w.translate(x, 10 + (i % 2) * 40); S.rat(w, { s: 0.7, phase: t * 14 + i, run: 1, tail: i % 2 ? 'stub' : true, mood: 'happy' }); w.restore(); } });
  ctx.save(); ctx.translate(620, 190); CL.cutout(ctx, () => rr(ctx, -380, -80, 760, 150, 18), PAL.cream, { elev: 1.6 }); fitTxt(ctx, 'THE RAT HUNT', 0, 26, 86, '#171717', 700);
  ctx.translate(0, 190); ST.stampWord(ctx, 'FAILED', 120, seg(t, tFailed - 0.05, tFailed + 0.3), C.red, -0.08); ctx.restore();
  const u = seg(t, tPlague5 - 0.25, tPlague5 + 0.15); if (u > 0) { ctx.save(); ctx.translate(lerp(2300, 1440, E.out(u)), 420); ctx.scale(0.8, 0.8); S.plagueNotice(ctx, { rot: 0.06 }); ctx.restore(); }
  label(ctx, 'ANYWAY', 1440, 790, pop(t, tAnyway - 0.05), { size: 60, col: C.red, fg: PAL.cream, rot: -0.04 });
  ST.grade(ctx, 'golden', 0.24);
});
// F1 "Historian Michael Vann, who dug the story out of the colonial archives, calls it "absolutely a disaster."": the archive room, a generic
// historian (no likeness) pulls the old file; the quote card lands
shot('F1 archive', tHist - 0.12, T + 0.01, (ctx, t, lt) => {
  const c = cam([[0, 520, -400, 0.85], [4, 520, -410, 0.88], [8, 540, -420, 0.9]], lt);
  const lift = E.inOut(seg(t, tDug - 0.2, tDug + 0.5));
  layer(ctx, c, 1, w => { HK.archive(w, t); SE.desk(w, 260, 760, -300, '#8A5A34');
    w.save(); w.translate(120, -300); HK.fileFolder(w, 0.9, 'COLONIAL FILES'); w.restore();
    P.person(w, -160, 0, 1.25, 1, HK.HISTORIAN, { face: FACE(t > tAbs ? 'worried' : (t > tDug ? 'surprised' : 'thinking'), [1, lift > 0.5 ? -0.2 : 0.3], t), lean: 0.04,
      armN: { hand: [lerp(160, 180, lift), lerp(-280, -420, lift)], grip: 'hold', item: g => { if (lift > 0.02) HK.fileFolder(g, 0.8, 'HANOI 1902'); } }, armF: { hand: [140, -300], grip: 'relax' } });
    HK.dust(w, seg(t, tDug, tDug + 0.9), 40, -480); });
  label(ctx, 'HISTORIAN · MICHAEL VANN', 560, 140, pop(t, tHist + 0.1), { size: 46, col: '#171717', fg: C.yellow });
  label(ctx, 'COLONIAL ARCHIVES', 1380, 250, pop(t, tArch - 0.05), { size: 50, rot: 0.03 });
  ctx.save(); ctx.translate(1270, 540); HK.quoteCard(ctx, 'ABSOLUTELY A DISASTER.”', '— MICHAEL VANN, HISTORIAN', seg(t, tAbs - 0.2, tAbs + 0.15), { w: 1000, h: 320 }); ctx.restore();
  ctx.save(); ctx.translate(1560, 790); ST.stampWord(ctx, 'DISASTER', 80, seg(t, tDis + 0.1, tDis + 0.45), C.red, -0.1); ctx.restore();
  ST.grade(ctx, 'office', 0.22);
});

// ---------- sound cues (SFX for mix.py) ----------
function cues() {
  const c = [['pop', 0.0, 1.2], ['whoosh', 0.02, 0.8], ['stamp', 0.3, 0.7], ['squeak', 0.6, 0.5], ['squeak', 1.6, 0.4]];
  c.push(['cut', Z.s01 - 0.12, 0.35], ['pop', Z.s01, 0.5], ['pop', tFr - 0.05, 0.4], ['pop', tViet - 0.05, 0.4]);
  c.push(['cut', tThe - 0.12, 0.35], ['pop', tThe, 0.4], ['sparkle', tNew, 0.5], ['whoosh', tSewers - 0.6, 0.5], ['pop', tSewers - 0.05, 0.5], ['pop', tUnder - 0.05, 0.4]);
  c.push(['cut', tRats - 0.12, 0.35]); for (let i = 0; i < 4; i++) c.push(['squeak', tRats + i * 0.2, 0.5]);
  c.push(['cut', tThey - 0.12, 0.35], ['pop', tThey + 0.1, 0.4], ['splash', tToilets - 0.45, 0.6], ['squeak', tToilets, 0.8]);
  c.push(['cut', tAnd - 0.12, 0.35], ['stamp', tPlague + 0.05, 0.7], ['paper', tSpread - 0.05, 0.6], ['paper', tAcross - 0.05, 0.6], ['paper', tAsia - 0.05, 0.6], ['pop', tAsia - 0.1, 0.4]);
  c.push(['cut', Z.s02 - 0.12, 0.35], ['flip', tApril - 0.1, 0.6], ['pop', tApril, 0.4], ['paper', tCity2 - 0.2, 0.6], ['stamp', tHunt + 0.05, 0.6], ['steps', tEvery - 0.9, 0.5], ['pop', tEvery - 0.1, 0.4]);
  c.push(['cut', tBring - 0.12, 0.35], ['pop', tBring - 0.05, 0.4], ['clink', tPaid, 0.9], ['pop', tPaid - 0.05, 0.4]);
  c.push(['cut', tRep - 0.12, 0.35], ['paper', tRep - 0.1, 0.6], ['tag', tRep - 0.05, 0.4], ['pop', tCent - 0.1, 0.5], ['clink', tCent, 0.8], ['stamp', tCent + 0.45, 0.8]);
  c.push(['cut', tJust - 0.12, 0.35], ['pop', tJust - 0.05, 0.5], ['kaching', tJust + 0.3, 0.5]);
  c.push(['cut', tNobody - 0.12, 0.35], ['pop', tNobody - 0.05, 0.4], ['pop', tPiles - 0.2, 0.5], ['buzzer', tDead + 0.1, 0.5]);
  c.push(['cut', Z.s03 - 0.12, 0.35], ['ding', tWorked, 0.5], ['steps', Z.s03, 0.4], ['cut', tPaper - 0.25, 0.35], ['pop', tPaper - 0.05, 0.4]); for (let i = 0; i < 4; i++) c.push(['tick', tPaper + i * 0.2, 0.5]);
  c.push(['cut', tPeak - 0.3, 0.35], ['pop', tPeak - 0.05, 0.4]); for (let i = 0; i < 10; i++) c.push(['paper', tOver + i * 0.2, 0.35]); c.push(['stamp', tTwenty + 0.15, 0.8], ['coins', tSingle, 0.6]);
  c.push(['cut', Z.s04 - 0.12, 0.35], ['pop', tOff - 0.05, 0.4]); for (let i = 0; i < 4; i++) c.push(['squeak', tRats4 - 0.3 + i * 0.4, 0.5]); c.push(['boop', tNo - 0.05, 0.6]);
  c.push(['cut', tPeople - 0.12, 0.35], ['sparkle', tFig - 0.1, 0.5], ['pop', tFig - 0.05, 0.4]);
  c.push(['cut', tCut - 0.12, 0.35], ['pop', tCut - 0.1, 0.4], ['snip', tTail4, 0.8], ['pop', tLet - 0.15, 0.4], ['whoosh', tGo - 0.1, 0.4], ['pop', tLet2 - 0.15, 0.4]);
  for (let i = 0; i < 4; i++) c.push(['squeak', tMake + i * 0.18, 0.35], ['clink', tMore2 + i * 0.15, 0.6]); c.push(['pop', tMore2 - 0.05, 0.4]);
  c.push(['cut', tInsp - 0.12, 0.35], ['stamp', tFarms + 0.1, 0.9], ['pop', tOutside - 0.05, 0.4]);
  c.push(['cut', Z.s05 - 0.12, 0.35], ['pop', tWanted - 0.1, 0.5], ['pop', tPaid5 - 0.1, 0.5]); for (let i = 0; i < 6; i++) c.push(['paper', tPaid5 + i * 0.25, 0.3]); c.push(['pop', tGot - 0.1, 0.5], ['thump', tGot + 0.15, 0.7]);
  c.push(['cut', tHunt5 - 0.3, 0.35], ['stamp', tFailed + 0.1, 0.9], ['whoosh', tPlague5 - 0.25, 0.4], ['thump', tPlague5 + 0.1, 0.5], ['pop', tAnyway - 0.05, 0.4]);
  c.push(['cut', tHist - 0.12, 0.35], ['pop', tHist + 0.1, 0.4], ['paper', tDug, 0.6], ['puff', tDug + 0.05, 0.5], ['pop', tArch - 0.05, 0.4], ['paper', tAbs - 0.2, 0.6], ['pop', tAbs - 0.1, 0.5], ['stamp', tDis + 0.2, 0.8]);
  return c;
}
const MUSIC = [[0, 'calm'], [Z.s02 - 0.12, 'up'], [Z.s04 - 0.12, 'tension'], [Z.s05 - 0.12, 'dark']];

core.run({ module, dir: __dirname, TL, SH, cues, music: MUSIC, repl: [[/twenty thousand/, '20,000']],
  highlight: ['hanoi', 'sewers', 'toilets', 'plague', '1902', 'cent', '20000', 'farms', 'failed', 'disaster'] });
module.exports = { T, Z, SH };
