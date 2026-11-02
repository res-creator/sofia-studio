process.env.HIR_WIDE = '1';
// Long-form "When Paying People Backfired" (How It's Run, YouTube 16:9) — segment 7, THE RULE · Goodhart's Law (script rows 29–30)
// + the 6 s end card. Card 0–3 s; s01: the five "paid for" things → the GOODHART'S LAW card + the quote (a gauge that becomes a
// target and cracks); s02: a reward envelope ("ask what it's really paying for"), then the echo of the cold open — a hand with scissors
// over the cartoon rat, a coin: the scissors pull away, the coin spins, PAY FOR THE RESULT. / NOT THE NUMBER.; end card: the rat runs
// off, the coin spins, the question "What reward at YOUR job do people game?" with a drawn arrow.
// Usage: node episode.js cues | srt out.srt | still t1,t2,... out.png | frame t out.png [nosubs] | video out.mp4 | shots
const { createCanvas } = require('@napi-rs/canvas');
const { spawn } = require('child_process');
const fs = require('fs');
const K = require('../../tests/mcd_collage/kit');
const EN = require('../../mcd_ep1/engine');
const R = require('../../hirkit/rig');
const CL = require('../../hirkit/collage');
const { makeEdit } = require('../../hirkit/edit');
const ST = require('../../howitsrun_style/style');
const SE = require('../../howitsrun_style/sets');
const S = require('./rulekit');
const { RK, HK, B } = S;
const { C, F, clamp, lerp, seg, E, rr, hash } = K;
const { W, H, FPS, PAL, layer, cam, shake, pop, label, txt, fitTxt } = ST;

// ---------- voice timeline: card 0–3 s, lines with 0.7 s gaps, +0.6 s hold, then the 6 s end card ----------
const LINES = JSON.parse(fs.readFileSync(`${__dirname}/script.json`));
const SP = JSON.parse(fs.readFileSync(`${__dirname}/vo/speech.json`));
const GAP = 0.7;
const Z = {}; let T = 3.0; for (const L of LINES) { Z[L.id] = +(T - SP[L.id][0]).toFixed(3); T += SP[L.id][1] - SP[L.id][0] + GAP; }
const V = EN.voice(`${__dirname}/vo`, Z), end = id => Z[id] + SP[id][1];
const nrm = x => x.toLowerCase().replace(/[^a-z0-9'-]/g, '');
const at = (id, w, n = 0) => { const ws = V.words(id); let m = ws.filter(x => nrm(x.w) === w); if (!m.length) m = ws.filter(x => nrm(x.w).startsWith(w)); if (!m.length) throw new Error(`no word ${id} ${w}`); return (m[n] || m[m.length - 1]).t0; };
const tVoEnd = +end(LINES[LINES.length - 1].id).toFixed(3);
const tEnd = +(tVoEnd + 0.6).toFixed(2);         // the end card starts here
T = +(tEnd + 6.0).toFixed(2);

const FACE = B.face;
const scene = (ctx, lt, keys, fn) => { const c = cam(keys, lt); layer(ctx, c, 1, fn); return c; };
function paperBg(ctx, col = '#EDE6D6', stripe = 'rgba(46,58,89,0.06)') { ST.bg(ctx, col); ctx.fillStyle = stripe; for (let i = 0; i < 40; i++) ctx.fillRect(0, i * 60, W, 4); }

// ================= SHOTS =================
const SH = []; const shot = (id, t0, t1, draw, out) => SH.push({ id, t0, t1, draw, out });

// CARD (0–3 s): THE RULE · Goodhart's Law
shot('CARD', 0, Z.s01, (ctx, t) => { B.chapterCard(ctx, t, 'THE RULE', 'Goodhart\'s Law', null, { bg: '#2E3A44', icon: (g, tt) => { g.save(); g.translate(-60, -10); S.target(g, seg(tt, 0.5, 1.1), 0.55); g.restore(); } }); ST.grade(ctx, 'office', 0.25); });

// R1 (s01 "Economists have a name for all of this."): the five things that were paid for
const tName = at('s01', 'name'), tAll = at('s01', 'all'), tGood = at('s01', "goodhart's"), tLaw = at('s01', 'law'), tWhen = at('s01', 'when'), tMeas = at('s01', 'measure'), tBecomes = at('s01', 'becomes'), tTarget = at('s01', 'target'),
  tIt = at('s01', 'it'), tStops = at('s01', 'stops'), tGoodM = at('s01', 'good'), tMeas2 = at('s01', 'measure', 1);
const THINGS = [
  ['TAILS', g => { g.save(); g.translate(-10, -120); RK.tail(g, 200, 1.2, 14); g.restore(); }],
  ['FLIGHTS', g => { g.save(); g.translate(0, -30); HK.tickets(g, 0.75, 1, 'NEW YORK'); g.restore(); }],
  ['BARCODES', g => { g.save(); g.translate(0, -30); S.barcode(g, 0.8); g.restore(); }],
  ['ACCOUNTS', g => { g.save(); g.translate(0, -30); B.acctCard(g, 'CHECKING', { s: 0.7 }); g.restore(); }],
  ['PLATES', g => { g.save(); g.translate(0, -30); S.plateIcon(g, 0.72); g.restore(); }]];
shot('R1 things', Z.s01, tGood - 0.12, (ctx, t, lt) => {
  paperBg(ctx); const z = 1 + lt * 0.02; ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
  THINGS.forEach(([cap, draw], i) => { ctx.save(); ctx.translate(280 + i * 340, 520 + (i % 2) * 30); S.thingCard(ctx, seg(t, Z.s01 + 0.05 + i * 0.22, Z.s01 + 0.35 + i * 0.22), cap, draw, { rot: (i % 2 ? 0.04 : -0.04) }); ctx.restore(); });
  ctx.restore();
  label(ctx, 'PAID FOR THE NUMBER', W / 2, 180, pop(t, Z.s01 + 0.1), { size: 60, col: '#171717', fg: C.yellow, rot: -0.02 });
  label(ctx, 'IT HAS A NAME', W / 2, 830, pop(t, tName - 0.05), { size: 56, col: C.yellow, rot: 0.02 });
  ST.grade(ctx, 'day', 0.15);
});
// R2 (s01 "Goodhart's law:"): the paper card lands
function lawCard(ctx, t, y, k = 1) { ctx.save(); ctx.translate(W / 2, y); ctx.rotate(-0.015); ctx.scale(k, k);
  CL.cutout(ctx, () => rr(ctx, -560, -110, 1120, 220, 20), PAL.cream, { elev: 2 }); fitTxt(ctx, 'GOODHART\'S LAW', 0, 42, 128, '#171717', 1040); ctx.restore(); }
shot('R2 law', tGood - 0.12, tWhen - 0.12, (ctx, t, lt) => {
  paperBg(ctx, '#2E3A44', 'rgba(255,255,255,0.035)');
  const u = seg(t, tGood - 0.12, tGood + 0.2); lawCard(ctx, t, lerp(250, 430, E.out(u)), lerp(1.4, 1, E.out(u)) * (1 + shake(t, tGood + 0.2, 0.01)));
  label(ctx, 'NAMED AFTER ECONOMIST CHARLES GOODHART', W / 2, 640, pop(t, tLaw - 0.05), { size: 40, col: '#171717', fg: PAL.cream, rot: 0.015 });
  ST.grade(ctx, 'office', 0.25);
});
// R3 (s01 "when a measure becomes a target, it stops being a good measure."): the quote; the gauge, the target, the crack
shot('R3 quote', tWhen - 0.12, Z.s02 - 0.12, (ctx, t, lt) => {
  paperBg(ctx, '#2E3A44', 'rgba(255,255,255,0.035)');
  lawCard(ctx, t, 170, 0.62);
  const q1 = seg(t, tWhen - 0.1, tTarget + 0.4), q2 = seg(t, tIt - 0.1, tMeas2 + 0.4);
  const line = (s, y, u, col) => { if (u <= 0) return; const n = Math.max(1, Math.round(s.length * clamp(u * 1.4))); ctx.save(); ctx.globalAlpha = clamp(u * 5); fitTxt(ctx, s.slice(0, n), W / 2, y, 64, col, 1500); ctx.restore(); };
  ctx.save(); ctx.translate(W / 2, 400); CL.cutout(ctx, () => rr(ctx, -800, -90, 1600, 200, 16), '#FBF6EA', { elev: 1.4 }); ctx.restore();
  ctx.font = `64px ${F.black}`;
  line('“WHEN A MEASURE BECOMES A TARGET,', 390, q1, '#171717'); line('IT STOPS BEING A GOOD MEASURE.”', 470, q2, C.red);
  // the gauge (MEASURE) on the left, the target on the right; at "stops" the gauge cracks and gets the X
  const gu = pop(t, tMeas - 0.1, 0.35); if (gu > 0) { ctx.save(); ctx.translate(560, 720); ctx.scale(gu, gu); const a = t < tTarget ? Math.sin(t * 2) * 0.2 : lerp(0.2, 1.05, E.out(seg(t, tTarget, tTarget + 0.5))) + (t > tStops ? Math.sin(t * 40) * 0.05 * (1 - seg(t, tStops, tStops + 0.6)) : 0);
    S.gauge(ctx, a, seg(t, tStops - 0.05, tStops + 0.3), 0.95); ctx.restore(); label(ctx, 'MEASURE', 560, 812, gu, { size: 36, col: '#171717', fg: PAL.cream, rot: -0.02 }); }
  const tu = pop(t, tTarget - 0.3, 0.3); if (tu > 0) { ctx.save(); ctx.translate(1380, 660); ctx.scale(tu * 0.85, tu * 0.85); S.target(ctx, seg(t, tTarget - 0.15, tTarget + 0.2), 1); ctx.restore(); label(ctx, 'TARGET', 1380, 812, tu, { size: 36, col: C.red, fg: PAL.cream, rot: 0.02 }); }
  const xu = seg(t, tGoodM - 0.1, tGoodM + 0.3); if (xu > 0) { ctx.save(); ctx.translate(560, 660); ST.bigX(ctx, 120, xu); ctx.restore(); }
  ST.grade(ctx, 'office', 0.25);
});

// R4 (s02 "So next time someone offers you a reward, ask what it's really paying for."): someone holds out a reward; the magnifier
const tOffers = at('s02', 'offers'), tReward = at('s02', 'reward'), tAsk = at('s02', 'ask'), tReally = at('s02', 'really'), tPaying = at('s02', 'paying'), tAnd = at('s02', 'and'), tYoure = at('s02', "you're"),
  tPaying2 = at('s02', 'paying', 1), tPay = at('s02', 'pay'), tResult = at('s02', 'result'), tNot = at('s02', 'not'), tNumber = at('s02', 'number');
shot('R4 reward', Z.s02 - 0.12, tAnd - 0.12, (ctx, t, lt) => {
  const envAt = [150, -330];
  scene(ctx, lt, [[0, 0, -360, 1.0], [4.4, 20, -370, 1.06]], w => { SE.room(w, t, { wall: '#E4DCCB', floor: 'carpet', carpet: '#5E6E8E', window: -1300 });
    const off = t > tOffers - 0.15;
    B.who(w, -340, 0, 1.0, 1, 'clerkB', { face: FACE('grin', [1, 0], t), armN: off ? { hand: [190, -330], grip: 'pinch', item: g => { g.save(); g.translate(130, -80); S.rewardEnv(g, 0.95); g.restore(); } } : { hand: [100, -250], grip: 'relax' } }, { badge: 'BOSS' });
    B.who(w, 380, 0, 1.0, -1, 'customer', { face: FACE(t > tAsk ? 'skeptical' : 'smile', [1, 0], t, 1), armN: t > tAsk - 0.1 ? { hand: [170, -350], grip: 'hold', item: g => { g.save(); g.translate(10, 30); RK.magnifier(g, 0.8); g.restore(); } } : { hand: [80, -240], grip: 'relax' } }, { tie: false }); });
  label(ctx, 'A REWARD', 420, 190, pop(t, tReward - 0.05), { size: 58, col: PAL.green, fg: PAL.cream, rot: -0.03 });
  label(ctx, 'WHAT IS IT REALLY PAYING FOR?', W / 2 + 200, 190, pop(t, tReally - 0.05), { size: 56, col: C.yellow, rot: 0.02 });
  ST.grade(ctx, 'office', 0.2);
});
// R5 (s02 "And if you're the one paying — pay for the result. Not the number."): the echo of the cold open on the table top
function echo(ctx, t, o = {}) {
  S.tableTop(ctx, t, 600);
  // the coin (spins from o.spin0)
  const sp = o.spin0 != null && t > o.spin0 ? (t - o.spin0) * 9 : 0; ctx.save(); ctx.translate(1600, 780); K.contact(ctx, 0, 52, 70, 12, 0.3); RK.coin(ctx, 62, '1¢', { spin: sp }); ctx.restore();
  // the rat: sits, or runs off to the right from o.run0
  const ru = o.run0 != null ? seg(t, o.run0, o.run0 + 1.1) : 0;
  if (ru < 1) { ctx.save(); ctx.translate(lerp(900, 2300, E.in(ru)), 820); RK.rat(ctx, { s: 1.35, phase: t * 14, run: ru > 0 ? 1 : 0, mood: o.ratMood || (ru > 0 ? 'happy' : 'shock'), look: ru > 0 ? [1, 0] : [-0.8, -0.4], up: ru > 0 ? 0 : 0.15 }); ctx.restore(); }
  // the hand with scissors over the tail, pulled back by o.back 0..1; or the scissors lying on the table (o.dropped)
  if (o.dropped) { ctx.save(); ctx.translate(330, 840); ctx.rotate(-0.15); RK.scissors(ctx, 1.0, 0.1); ctx.restore(); }
  else { const b = E.inOut(clamp(o.back || 0)); S.scissorHand(ctx, lerp(560, -260, b), lerp(660, 420, b), 0.35 - b * 0.3, 0.35 + 0.25 * Math.sin(t * 6) * (1 - b)); }
}
shot('R5 echo', tAnd - 0.12, tEnd, (ctx, t, lt) => {
  const z = 1 + lt * 0.012; ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
  echo(ctx, t, { back: seg(t, tPay - 0.15, tPay + 0.5), spin0: tResult - 0.1, ratMood: t > tResult ? 'happy' : 'shock' });
  ctx.restore();
  if (t < tPay - 0.1) label(ctx, 'IF YOU\'RE THE ONE PAYING…', W / 2, 200, pop(t, tYoure - 0.05), { size: 60, rot: -0.02 });
  S.finalPlate(ctx, 'PAY FOR THE RESULT.', 'NOT THE NUMBER.', pop(t, tResult - 0.15, 0.35), pop(t, tNot - 0.08, 0.35), 170);
  ST.grade(ctx, 'golden', 0.2);
});
// END CARD (6 s, no voice): the rat runs off, the coin spins; the question with a drawn arrow
shot('END card', tEnd, T + 0.01, (ctx, t, lt) => {
  echo(ctx, t, { dropped: true, spin0: tResult - 0.1, run0: tEnd + 0.15 });
  ST.questionCard(ctx, t, ['WHAT REWARD AT', 'YOUR JOB'], 'DO PEOPLE GAME?', E.back(seg(t, tEnd + 0.1, tEnd + 0.45), 2), { arrow: true, y: 470 });
  ST.grade(ctx, 'golden', 0.2);
}, { type: 'cut' });

// ---------- edit, overlays, subtitles ----------
SH.sort((a, b) => a.t0 - b.t0);
const ED = makeEdit(SH, W, H);
function overlays(ctx, t) { ST.stampLabel(ctx); }
function subs() {
  const G = [];
  for (const L of LINES) { const ws = V.words(L.id); let cur = [];
    const len = a => a.map(x => x.w).join(' ').length;
    ws.forEach((w, i) => { cur.push(w); const nx = ws[i + 1]; if (!nx) return;
      const punct = /[,.:;!?"”—]$/.test(w.w), L1 = len(cur), rest = ws.slice(i + 1).map(x => x.w).join(' ').length;
      if (rest < 12 && L1 + 1 + rest <= 72) return;
      if ((punct && L1 >= 14) || L1 + 1 + nx.w.length > 62) { G.push({ id: L.id, words: cur }); cur = []; } });
    if (cur.length) G.push({ id: L.id, words: cur }); }
  G.forEach((g, i) => { const nx = G[i + 1], e0 = Math.min(g.words[g.words.length - 1].t1, end(g.id)) + 0.4; g.t0 = g.words[0].t0 - 0.05;
    g.t1 = nx ? (nx.id === g.id ? nx.words[0].t0 - 0.05 : Math.min(e0, nx.words[0].t0 - 0.05)) : Math.min(e0, tEnd); g.text = g.words.map(x => x.w).join(' '); });
  return G;
}
const SUBS = subs();
function frame(ctx, t, o = {}) {
  ED.frame(ctx, t);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); overlays(ctx, t); ctx.restore();
  ST.paper(ctx);
  if (!o.nosubs) EN.drawSubtitles(ctx, t, SUBS, { ...ST.SUBS, highlight: ["goodhart's", 'target', 'reward', 'result', 'number'] });
}

// ---------- sound cues ----------
function cues() {
  const c = [['whoosh', 0.0, 0.8], ['pop', 0.05, 0.6], ['thump', 0.75, 0.5]];
  const cut = t => c.push(['cut', t, 0.3]);
  cut(Z.s01); for (let i = 0; i < 5; i++) c.push(['pop', Z.s01 + 0.05 + i * 0.22, 0.45]); c.push(['tag', Z.s01 + 0.1, 0.4], ['ding', tName - 0.05, 0.4]);
  cut(tGood - 0.12); c.push(['stamp', tGood + 0.15, 1.0], ['pop', tLaw - 0.05, 0.4]);
  cut(tWhen - 0.12); for (let i = 0; i < 6; i++) c.push(['type', tWhen + i * 0.14, 0.4]); c.push(['pop', tMeas - 0.1, 0.4], ['whoosh', tTarget - 0.15, 0.4], ['thump', tTarget + 0.15, 0.6]);
  for (let i = 0; i < 6; i++) c.push(['type', tIt + i * 0.14, 0.4]); c.push(['tear', tStops, 0.5], ['buzzer', tGoodM, 0.4]);
  cut(Z.s02 - 0.12); c.push(['paper', tOffers - 0.1, 0.5], ['pop', tReward - 0.05, 0.4], ['flip', tAsk - 0.1, 0.4], ['pop', tReally - 0.05, 0.4]);
  cut(tAnd - 0.12); c.push(['squeak', tAnd + 0.2, 0.5], ['snip', tAnd + 0.6, 0.4], ['pop', tYoure - 0.05, 0.4], ['whoosh', tPay - 0.1, 0.5], ['slam', tResult - 0.1, 0.8], ['ding', tResult - 0.05, 0.6], ['clink', tResult, 0.6], ['stamp', tNot - 0.05, 0.8]);
  c.push(['pop', tEnd + 0.1, 0.6], ['squeak', tEnd + 0.15, 0.6], ['whoosh', tEnd + 0.3, 0.4], ['clink', tEnd + 0.9, 0.4], ['blip', tEnd + 0.6, 0.4]);
  return c.filter(x => x[1] >= 0 && x[1] < T);
}
const MUSIC = { sections: [[0, 'calm'], [Z.s02, 'up'], [tEnd, 'soft']] };

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
else if (mode === 'subs') console.log(SUBS.map(g => `${g.t0.toFixed(2)}-${g.t1.toFixed(2)} ${g.text}`).join('\n'));
else if (mode === 'video') (async () => {
  const cv = createCanvas(W, H), ctx = cv.getContext('2d');
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', a1], { stdio: ['pipe', 'inherit', 'inherit'] });
  const N = Math.round(T * FPS), T0 = Date.now();
  for (let f = 0; f < N; f++) { frame(ctx, f / FPS); const buf = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); if (f % 150 === 0) process.stderr.write(`${f}/${N} ${((Date.now() - T0) / 1000).toFixed(0)}s\n`); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
})();
module.exports = { T, ST: Z, SH };
