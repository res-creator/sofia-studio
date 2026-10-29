// Episode 16 "The Monopoly Inside Man" (How It's Run) — a story told through the hero's actions, no cards: the security chief of the company that handled
// McDonald's Monopoly pieces pulls the winners and hands them to friends and family; the FBI finds out, asks McDonald's to keep the game running,
// collects evidence, arrests begin in 2001, dozens plead guilty or are convicted, Jacobson gets about three years; the man who could see the whole game was playing it.
// Built on hirkit (rig, light, collage, edit). Re-enactment with generic figures; shots cut on voice-over words. 1080x1920, 30 fps.
// Usage: node episode.js video out.mp4 | still t1,t2,... out.png | frame t out.png | cues | srt out.srt | shots
const { createCanvas } = require('@napi-rs/canvas');
const { spawn } = require('child_process');
const fs = require('fs');
const K = require('../tests/mcd_collage/kit');
const EN = require('../mcd_ep1/engine');            // voice timings + subtitle drawing only (read-only use)
const R = require('../hirkit/rig');
const LT = require('../hirkit/light');
const CL = require('../hirkit/collage');
const { makeEdit } = require('../hirkit/edit');
const CK = require('../subscription_ep13/callkit'); // layer, txt, fitTxt, sheet, chair, cord (read-only use)
const P = require('./pepsikit');
const M = require('./monkit');
const { C, F, clamp, lerp, seg, E, rr, hash } = K;
const { INK, ell } = R;
const { W, H, layer, txt, fitTxt } = CK;
const { JOHN, KID1, KID2, INV1, INV2, CLERKP, JUDGE, poly } = P;
const FPS = 30;
const k = (t, a, b, e = E.inOut) => e(seg(t, a, b));

// ---------- voice timeline (natural speed; real speech start/end from vo/speech.json, gaps only) ----------
const VOD = fs.existsSync(`${__dirname}/vo/speech.json`) ? 'vo' : 'vo_draft';
const LINES = JSON.parse(fs.readFileSync(`${__dirname}/script.json`));
const SP = JSON.parse(fs.readFileSync(`${__dirname}/${VOD}/speech.json`));
const GAP = { s01: 0.4, s02: 0.35, s03: 0.35, s04: 0.25, s05: 0.35, s06: 0.35, s07: 0.35, s08: 0.35, s09: 0.35, s10: 0.35, s11: 0.35, s12: 0.35, s13: 0.35, s14: 2.0 };
const ST = {}; let T = 0.15; for (const L of LINES) { ST[L.id] = +(T - SP[L.id][0]).toFixed(3); T += SP[L.id][1] - SP[L.id][0] + GAP[L.id]; } T = +T.toFixed(2);
const V = EN.voice(`${__dirname}/${VOD}`, ST), at = (id, w, n = 0) => V.at(id, w, n), end = id => ST[id] + SP[id][1];

// ---------- helpers ----------
function cam(keys, lt) {
  let c; if (lt <= keys[0][0]) c = keys[0]; else if (lt >= keys[keys.length - 1][0]) c = keys[keys.length - 1];
  else for (let i = 1; i < keys.length; i++) if (lt < keys[i][0]) { const a = keys[i - 1], b = keys[i], u = E.inOut(seg(lt, a[0], b[0])); c = [lt, lerp(a[1], b[1], u), lerp(a[2], b[2], u), Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), u)), lerp(a[4] || 0, b[4] || 0, u)]; break; }
  return { x: c[1] + Math.sin(lt * 0.9) * 4 / c[3], y: c[2] + Math.cos(lt * 0.7) * 3 / c[3], z: c[3], r: (c[4] || 0) + Math.sin(lt * 0.6) * 0.003 };
}
const shake = (t, t0, a = 14) => (t > t0 && t < t0 + 0.35) ? Math.sin((t - t0) * 70) * a * (1 - seg(t, t0, t0 + 0.35)) : 0;
const HALF = createCanvas(W / 2, H / 2), hx = HALF.getContext('2d');
function halfPass(ctx, blur, draw) {
  hx.setTransform(1, 0, 0, 1, 0, 0); hx.clearRect(0, 0, W / 2, H / 2); hx.setTransform(0.5, 0, 0, 0.5, 0, 0);
  R.LINE.dev = 0.5; draw(hx); R.LINE.dev = 1;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); if (blur > 0.3) ctx.filter = `blur(${blur.toFixed(1)}px)`; ctx.drawImage(HALF, 0, 0, W, H); ctx.restore();
}
const blink = (t, p = 3.3, o = 0) => ((t + o) % p) > p - 0.11 ? 1 : 0;
const talk = (t, on = 1) => on * (0.5 + 0.5 * Math.sin(t * 17) * Math.sin(t * 5.3));
const RIM_W = { dir: [-1, -0.35], color: '#FFD9A0', w: 8, a: 0.9 }, RIM_COOL = { dir: [1, -0.4], color: '#D8F0FF', w: 8, a: 0.85 }, RIM_DAY = { dir: [-1, -0.4], color: '#FFF6E0', w: 8, a: 0.9 };
const pop = (t, t0, d = 0.3, s = 2.2) => t < t0 ? 0 : E.back(seg(t, t0, t0 + d), s);
function label(ctx, s, x, y, u, o = {}) {
  if (u <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.03); ctx.scale(u, u); const size = o.size || 56;
  ctx.font = `${size}px ${F.black}`; const w = Math.min(ctx.measureText(s).width + 50, o.maxW || 980);
  CL.cutout(ctx, () => rr(ctx, -w / 2, -size * 0.85, w, size * 1.35, 12), o.col || '#FFFDF8', { elev: 1.4 }); fitTxt(ctx, s, 0, size * 0.28, size, o.fg || INK, w - 40);
  if (o.arrow) { ctx.fillStyle = o.col || '#FFFDF8'; const ax = o.arrowX || 0; ctx.beginPath(); ctx.moveTo(ax - 22, size * 0.5); ctx.lineTo(ax + 22, size * 0.5); ctx.lineTo(ax + o.arrow * 30, size * 1.25); ctx.closePath(); ctx.fill(); ctx.lineWidth = R.px(ctx, 4); ctx.strokeStyle = INK; ctx.stroke(); }
  ctx.restore();
}
const bg = (c, col) => { c.fillStyle = col; c.fillRect(0, 0, W, H); };
// a front bust shot: bg(ctx) first, slow push, rim light; o: { L, x, ny, s, push, face, tilt, hands, rim, glow, tint }
function bustShot(ctx, lt, bgFn, o) {
  bgFn(ctx);
  const push = 1 + lt * (o.push ?? 0.03), nx = o.x ?? 540, ny = o.ny ?? 1500; ctx.save(); ctx.translate(nx, ny); ctx.scale(push, push); ctx.translate(-nx, -ny);
  LT.lit(ctx, c => R.bust(c, nx, ny, o.s ?? 2.6, o.L || JOHN, { face: o.face, hands: o.hands || [], headTilt: o.tilt || 0, lean: o.lean || 0 }),
    { rim: o.rim ?? RIM_W, ...(o.tint ? { tint: o.tint } : {}), ...(o.glow ? { glow: o.glow } : {}) });
  ctx.restore();
}
const denBg = (cx, cy, z, blur, o = {}) => (c, t) => { bg(c, '#D8C6A6'); halfPass(c, blur, g => layer(g, { x: cx, y: cy, z }, 1, w => P.den(w, t, o))); LT.haze(c, 'evening', 0.1); };
const woodTop = (c, t) => { // top-down wooden desk surface
  bg(c, '#8A5A34'); c.save(); c.strokeStyle = 'rgba(60,30,10,0.18)'; c.lineWidth = 3; for (let y = -40; y < H + 80; y += 90) { c.beginPath(); c.moveTo(0, y); for (let x = 0; x <= W; x += 60) c.lineTo(x, y + Math.sin(x / 130 + y) * 8); c.stroke(); } c.restore();
  const g = c.createRadialGradient(W / 2, H * 0.5, 200, W / 2, H * 0.5, 1300); g.addColorStop(0, 'rgba(255,225,160,0.2)'); g.addColorStop(1, 'rgba(40,20,5,0.35)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
};
// a hand from the screen edge (top-down desk shots): arm tube + hand, pointing / holding / pinching
function reach(ctx, from, to, grip = 'point', o = {}) {
  LT.lit(ctx, c => { R.tube(c, [from, to], 130, (o.L || M.JAC).top, 5); R.hand(c, to, Math.atan2(to[1] - from[1], to[0] - from[0]), (o.L || M.JAC).skin, grip, { size: o.size || 3.2, over: o.over }); }, { rim: RIM_W });
}
function stampLabel(ctx, t) { // honesty label, small, top of the 3:4 crop, always on
  ctx.save(); ctx.translate(W / 2, 262); ctx.font = `28px ${F.black}`; const s = 'REAL STORY · RE-ENACTMENT', w = ctx.measureText(s).width + 40;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -26, w, 50, 10), '#171717', { elev: 0.8, tex: 0 }); txt(ctx, s, 0, 10, 28, C.yellow); ctx.restore();
}
function headline(ctx, t) { // frame 0: the hook in big words
  const a = 1 - seg(t, ST.s02 - 0.4, ST.s02 - 0.15); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2, 430);
  CL.cutout(ctx, () => rr(ctx, -470, -70, 940, 118, 16), '#FFFDF8', { elev: 1.4 }); txt(ctx, "MCDONALD'S MONOPOLY", 0, 14, 70, INK);
  ctx.translate(0, 124); ctx.rotate(0.025); CL.cutout(ctx, () => rr(ctx, -330, -62, 660, 110, 14), C.red, { elev: 1.2 }); txt(ctx, 'AN INSIDE JOB', 0, 24, 78, '#FFFDF8');
  ctx.restore();
}

// ================= SHOTS =================
const SH = []; const shot = (id, t0, t1, draw, out) => SH.push({ id, t0, t1, draw, out });
const tRig = at('s01', 'rigging'), tJac = at('s02', 'jacobson'), tSec = at('s02', 'security'), tGame = at('s02', 'game'), tWin = at('s03', 'winners'), tPull = at('s04', 'pulled');
const tFr = at('s05', 'friends'), tFam = at('s05', 'family'), tTrust = at('s05', 'trusted'), tPrizes = at('s06', 'prizes'), tAgain = at('s06', 'again'), tAgain2 = at('s06', 'again', 1);
const tTwenty = at('s07', 'twenty'), tFbi = at('s08', 'fbi'), tFound = at('s08', 'found'), tPlan = at('s09', 'plan'), tAsk = at('s09', 'ask'), tKeep = at('s09', 'keep'), tRunning = at('s09', 'running');
const tWatched = at('s10', 'watched'), tColl = at('s10', 'collected'), t2001 = at('s11', '2001'), tArrests = at('s11', 'arrests'), tBegan = at('s11', 'began');
const tPleaded = at('s12', 'pleaded'), tGuilty = at('s12', 'guilty'), tConv = at('s12', 'convicted'), tThree = at('s13', 'three'), tPrison = at('s13', 'prison'), tPlaying = at('s14', 'playing'), tWhole = at('s14', 'whole');
const tapeBg = (c, col = '#E8D9A8') => { c.fillStyle = col; c.fillRect(0, 0, W, H); };
function cup(c, x, y, s, rot = 0) { c.save(); c.translate(x, y); c.scale(s, s); c.rotate(rot); poly(c, [[-170, -300], [170, -300], [130, 300], [-130, 300]], '#FFFDF8', 6); c.fillStyle = C.red; c.fillRect(-160, -190, 320, 150); c.save(); c.beginPath(); c.moveTo(-170, -300); c.lineTo(170, -300); c.lineTo(130, 300); c.lineTo(-130, 300); c.closePath(); c.clip(); c.fillStyle = C.red; c.fillRect(-200, -190, 400, 150); c.restore(); rr(c, -190, -330, 380, 60, 20); R.fillStroke(c, '#E8E8EE', 5); c.restore(); }

// A1 (s01 ... "was the one rigging it."): a game piece on a cup; a hand in a security sleeve peels it off
shot('A1 peel', 0, tRig - 0.1, (ctx, t, lt) => {
  const pl = k(t, 1.3, tRig - 0.4);
  bg(ctx, '#E8D9A8'); halfPass(ctx, 14, g => layer(g, { x: 200, y: -500, z: 0.9 }, 1, w => M.counter(w, t)));
  const z = 1 + lt * 0.03; ctx.save(); ctx.translate(540, 1150); ctx.scale(z, z); cup(ctx, 0, 0, 1.45); ctx.save(); ctx.translate(0, 40); ctx.rotate(-0.04 + pl * 0.2); ctx.translate(pl * 60, -pl * 30); M.gamePiece(ctx, 1.25, { gold: true, text: 'WINNER', t, curl: pl }); ctx.restore(); ctx.restore();
  reach(ctx, [1500, 1500], [lerp(900, 800 - pl * 40, k(t, 0.3, 1.4)), lerp(1250, 1140 - pl * 30, k(t, 0.3, 1.4))], 'hold', { size: 3.0 });
  const sm = k(t, 1.9, 2.4); if (sm > 0) { ctx.save(); ctx.translate(880, 1000); ctx.scale(sm * 0.9, sm * 0.9); M.securityBadge(ctx, 1.2); ctx.restore(); }
  LT.grade(ctx, 'day', { vignette: 0.2 });
});
// A2 (…"rigging"): the RIGGED stamp slams onto the piece
shot('A2 rigged', tRig - 0.1, ST.s02 - 0.1, (ctx, t, lt) => {
  const st = E.in(seg(t, tRig - 0.12, tRig + 0.04)), sk = shake(t, tRig + 0.04, 16);
  bg(ctx, '#E8D9A8'); halfPass(ctx, 14, g => layer(g, { x: 200, y: -500, z: 0.9 }, 1, w => M.counter(w, t)));
  ctx.save(); ctx.translate(540 + sk, 1050); ctx.scale(2.6, 2.6); ctx.rotate(-0.04); M.gamePiece(ctx, 1, { gold: true, text: 'WINNER', t }); ctx.restore();
  if (t > tRig - 0.12) { ctx.save(); ctx.translate(540 + sk, lerp(260, 1050, st)); ctx.rotate(-0.12); ctx.scale(lerp(2.6, 1.2, st), lerp(2.6, 1.2, st)); ctx.globalAlpha = clamp(st * 1.5); P.mark(ctx, 'RIGGED', { size: 150, rot: 0 }); ctx.restore(); }
  LT.grade(ctx, 'day', { vignette: 0.22 });
});
// B1 (s02): the handling room: Jerome Jacobson stands over the table of sheets; monitors and boxes of game pieces behind him
shot('B1 security', ST.s02 - 0.1, ST.s03 - 0.1, (ctx, t, lt) => {
  const c = cam([[0, -300, -620, 0.7], [3.8, -140, -600, 0.82]], lt);
  bg(ctx, '#9AA6B6');
  layer(ctx, c, 1, w => {
    M.secRoom(w, t, {});
    for (let i = 0; i < 3; i++) { w.save(); w.translate(-380 + i * 330, -340 - 8); w.rotate((i - 1) * 0.04); w.scale(1, 0.3); M.pieceSheet(w, 240, 300, { t, goldIdx: -1 }); w.restore(); }
    LT.castShadow(w, g => R.figure(g, -820, 0, 1.05, 1, M.JAC, {}), { x: -820, floorY: 0, a: 0.2, blur: 3 });
    LT.lit(w, g => R.figure(g, -820, 0, 1.05, 1, M.JAC, { lean: 0.06, armN: { hand: [170, -310], grip: 'relax' }, armF: { hand: [-14, -64] }, face: R.expr('neutral', { look: [1, 0.3], blink: blink(lt, 3.2) }), headTilt: 0.02 }), { rim: RIM_COOL });
  });
  label(ctx, 'JEROME JACOBSON', 400, 1010, pop(t, tJac), { arrow: 1, arrowX: -160, size: 56, col: C.yellow });
  label(ctx, 'SECURITY', 400, 1170, pop(t, tSec), { size: 50, col: '#171717', fg: C.yellow, rot: 0.03 });
  const gm = pop(t, tGame, 0.3, 2.4); if (gm > 0) { ctx.save(); ctx.translate(850, 700); ctx.scale(gm * 0.8, gm * 0.8); ctx.rotate(0.05); M.gamePiece(ctx, 1, { gold: false, text: 'GAME PIECE', top: 'WIN' }); ctx.restore(); }
  LT.grade(ctx, 'office', { vignette: 0.22 });
});
// B2 (s03 "He knew which ones were winners."): close on him; the sheet in his hand; one piece glows gold
shot('B2 knew', ST.s03 - 0.1, ST.s04 - 0.1, (ctx, t, lt) => {
  const sm = k(t, tWin - 0.1, tWin + 0.3);
  bustShot(ctx, lt, c => { bg(c, '#9AA6B6'); halfPass(c, 12, g => layer(g, { x: 0, y: -700, z: 1.0 }, 1, w => M.secRoom(w, t))); }, { L: M.JAC, x: 440, ny: 1620, s: 2.5, push: 0.03, rim: RIM_COOL,
    face: R.exprMix(R.expr('neutral', { look: [0.9, 0.5], blink: blink(lt, 3.1) }), R.expr('smug', { look: [0.8, 0.5] }), sm), tilt: lerp(0, -0.05, sm),
    hands: [{ side: 1, hand: [200, 260], grip: 'hold', item: c2 => { c2.save(); c2.translate(20, -170); c2.rotate(0.05); M.pieceSheet(c2, 230, 300, { t, goldIdx: 4 }); c2.restore(); } }] });
  LT.grade(ctx, 'office', { vignette: 0.22 });
});
// B3 (s04 "So he pulled them out."): the sheet fills the frame; his fingers peel the gold piece
shot('B3 pull', ST.s04 - 0.1, ST.s05 - 0.1, (ctx, t, lt) => {
  woodTop(ctx, t); const pu = k(t, tPull - 0.1, tPull + 0.45, E.out);
  ctx.save(); ctx.translate(540, 1050); ctx.scale(2.5, 2.5); ctx.rotate(-0.02); M.pieceSheet(ctx, 330, 410, { t, goldIdx: 4, pulled: pu }); ctx.restore();
  reach(ctx, [1500, 1900], [lerp(1000, 700, k(t, ST.s04, tPull)), lerp(1500, 1130 - pu * 150, k(t, ST.s04, tPull))], 'hold', { size: 3.0 });
  LT.grade(ctx, 'office', { vignette: 0.25 });
});
// C1 (s05): the parking lot at dusk: he hands envelopes to friends, family and people he trusted; each one lights up
shot('C1 handoff', ST.s05 - 0.1, ST.s06 - 0.1, (ctx, t, lt) => {
  const c = cam([[0, 100, -560, 0.66], [2.6, 220, -540, 0.74]], lt); bg(ctx, '#4A4A8A');
  const R3 = [[-120, P.INV1, tFr, 'FRIENDS'], [230, P.INV2, tFam, 'FAMILY'], [590, P.KID1, tTrust, 'PEOPLE HE TRUSTED']];
  layer(ctx, c, 1, w => {
    M.lot(w, t, {});
    LT.castShadow(w, g => R.figure(g, -560, 20, 1.05, 1, M.JAC, {}), { x: -560, floorY: 20, a: 0.2, blur: 3 });
    LT.lit(w, g => R.figure(g, -560, 20, 1.05, 1, M.JAC, { lean: 0.05, armN: { hand: [150, -320], grip: 'hold', item: c2 => { c2.save(); c2.rotate(0.1); P.envelope(c2, 0.2); c2.restore(); } }, armF: { hand: [-14, -64] }, face: R.expr('smile', { look: [1, 0], blink: blink(lt, 3.3) }) }), { rim: RIM_W });
    R3.forEach(([x, L, t0, nm], i) => { const got = k(t, t0, t0 + 0.4, E.out);
      LT.lit(w, g => R.figure(g, x, 20, 1.0, -1, L, { lean: 0.04, armN: { hand: [lerp(40, 120, got), lerp(-60, -330, got)], grip: got > 0.5 ? 'hold' : 'open', item: got > 0.5 ? (c2 => { c2.save(); c2.rotate(0.1); P.envelope(c2, 0.2); c2.restore(); }) : null }, armF: { hand: [-14, -64] }, face: R.exprMix(R.expr('neutral', { look: [1, 0] }), R.expr('grin', { look: [1, 0.1] }), got) }), { rim: RIM_W });
      const fl = clamp((t - t0 + 0.35) / 0.45); if (fl > 0 && fl < 1) { const x0 = -400, y0 = -330, x1 = x - 90, y1 = -320; w.save(); w.translate(lerp(x0, x1, fl), lerp(y0, y1, fl) - Math.sin(fl * Math.PI) * 140); w.rotate(fl * 6); P.envelope(w, 0.2); w.restore(); } });
  });
  R3.forEach(([x, L, t0, nm], i) => label(ctx, nm, [300, 580, 800][i], [700, 560, 700][i], pop(t, t0), { size: i === 2 ? 40 : 52, col: i === 2 ? '#FFFDF8' : C.yellow, rot: (i - 1) * 0.05 }));
  LT.grade(ctx, 'evening', { vignette: 0.24 });
});
// D1 (s06): "They claimed the prizes. Again... and again.": winners slide in, the cash pile grows; AGAIN stamps pile on
shot('D1 claim', ST.s06 - 0.1, ST.s07 - 0.1, (ctx, t, lt) => {
  woodTop(ctx, t); const n = Math.min(26, Math.floor(Math.max(0, t - tPrizes + 0.3) / 0.14));
  for (let i = 0; i < 8; i++) { const per = 1.4, ph = ((t - ST.s06 + i * per / 8) % per) / per, x = lerp(-160, 700, E.inOut(ph)), y = 560 + (i % 4) * 150; ctx.save(); ctx.translate(x, y); ctx.rotate((i - 4) * 0.05); M.gamePiece(ctx, 0.62, { gold: true, text: 'WINNER', top: 'WIN', t }); ctx.restore(); }
  ctx.save(); ctx.translate(820, 1450); M.cashStack(ctx, n, { s: 0.95, dy: 22 }); ctx.restore();
  const a1 = pop(t, tAgain, 0.25, 2.4), a2 = pop(t, tAgain2, 0.25, 2.4);
  if (a1 > 0) { ctx.save(); ctx.translate(300, 1230); ctx.rotate(-0.08); ctx.scale(a1 * 1.2, a1 * 1.2); P.mark(ctx, 'AGAIN', { size: 96, rot: 0 }); ctx.restore(); }
  if (a2 > 0) { ctx.save(); ctx.translate(380, 1030); ctx.rotate(0.07); ctx.scale(a2 * 1.5, a2 * 1.5); P.mark(ctx, 'AND AGAIN', { size: 96, rot: 0 }); ctx.restore(); }
  LT.grade(ctx, 'office', { vignette: 0.26 });
});
// D2 (s07): the pile becomes a mountain and the total rolls up: $20,000,000+
shot('D2 total', ST.s07 - 0.1, ST.s08 - 0.1, (ctx, t, lt) => {
  woodTop(ctx, t); const roll = k(t, tTwenty - 0.2, tTwenty + 1.0, E.out), shk = shake(t, tTwenty + 1.0, 8);
  for (let i = 0; i < 7; i++) { ctx.save(); ctx.translate(100 + i * 140, 1650 - (i % 3) * 40); M.cashStack(ctx, 6 + Math.floor(roll * 14) + (i % 3) * 3, { s: 0.55, dy: 16 }); ctx.restore(); }
  const u = pop(t, ST.s07 + 0.05, 0.3, 2.2); if (u > 0) { ctx.save(); ctx.translate(540, 520); ctx.scale(u, u); ctx.rotate(-0.04); CL.cutout(ctx, () => rr(ctx, -270, -60, 540, 110, 14), C.red, { elev: 1.4 }); txt(ctx, 'MORE THAN', 0, 24, 66, '#FFFDF8'); ctx.restore(); }
  ctx.save(); ctx.translate(540 + shk, 760); ctx.rotate(0.02); CL.cutout(ctx, () => rr(ctx, -470, -120, 940, 240, 24), '#171717', { elev: 2, tex: 0 }); fitTxt(ctx, `$${Math.round(20000000 * roll).toLocaleString('en-US')}+`, 0, 44, 140, C.yellow, 880); ctx.restore();
  LT.grade(ctx, 'office', { vignette: 0.26 });
});
// E1 (s08 "Then the FBI found out."): a dark van, screens glowing; an agent in a headset turns to us
shot('E1 fbi', ST.s08 - 0.1, ST.s09 - 0.1, (ctx, t, lt) => {
  const f = k(t, tFound - 0.1, tFound + 0.35);
  bustShot(ctx, lt, c => M.vanInterior(c, t), { L: M.AG1, x: 540, ny: 1640, s: 2.4, push: 0.03, rim: { dir: [1, -0.3], color: '#9FFFD8', w: 8, a: 0.9 },
    face: R.exprMix(R.expr('squint', { look: [-0.5, -0.2], blink: blink(lt, 3.3) }), R.expr('smug', { look: [0, 0] }), f), tilt: lerp(0.06, -0.03, f) });
  ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 16; ctx.beginPath(); ctx.arc(540, 1330, 205, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); ctx.strokeStyle = '#4A4F57'; ctx.lineWidth = 8; ctx.stroke(); for (const sx of [-1, 1]) { rr(ctx, 540 + sx * 196 - 28, 1290, 56, 100, 22); R.fillStroke(ctx, '#2E3340', 5); } ctx.restore();
  const u = pop(t, tFbi, 0.3, 2.4); if (u > 0) { ctx.save(); ctx.translate(540, 760); ctx.rotate(-0.04); ctx.scale(u * 1.3, u * 1.3); CL.cutout(ctx, () => rr(ctx, -200, -80, 400, 150, 18), '#171717', { elev: 1.8, tex: 0 }); txt(ctx, 'FBI', 0, 40, 120, C.yellow); ctx.restore(); }
  LT.grade(ctx, 'dark', { vignette: 0.28 });
});
// E2a (s09 "Their plan?"): a corkboard of clues with strings; a big question mark
shot('E2 plan', ST.s09 - 0.1, tAsk - 0.1, (ctx, t, lt) => {
  bg(ctx, '#1B1E2A'); ctx.save(); ctx.translate(540, 1000); const z = 1 + lt * 0.04; ctx.scale(z, z);
  CL.cutout(ctx, () => rr(ctx, -470, -560, 940, 1120, 14), '#C99A64', { elev: 2, tex: 0.6 });
  const pts = [[-250, -300], [230, -380], [-100, 120], [280, 160]]; ctx.strokeStyle = C.red; ctx.lineWidth = 7; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
  pts.forEach(([x, y], i) => { ctx.save(); ctx.translate(x, y); ctx.rotate((i - 1.5) * 0.08); if (i % 2) M.gamePiece(ctx, 0.5, { gold: true, text: 'WINNER', top: 'WIN', t }); else { CL.cutout(ctx, () => rr(ctx, -80, -100, 160, 200, 8), '#F4F1E8', { elev: 0.8 }); ell(ctx, 0, -30, 40, 44); R.fillStroke(ctx, '#8796AA', 4); } ell(ctx, 0, -110, 12, 12); R.fillStroke(ctx, C.red, 3); ctx.restore(); });
  const u = pop(t, tPlan - 0.05, 0.3, 2.4); if (u > 0) { ctx.save(); ctx.translate(20, 40); ctx.scale(u * 1.6, u * 1.6); ctx.rotate(0.06); CL.cutout(ctx, () => rr(ctx, -140, -150, 280, 300, 30), C.red, { elev: 2 }); txt(ctx, '?', 0, 90, 260, '#FFFDF8'); ctx.restore(); }
  ctx.restore(); LT.grade(ctx, 'dark', { vignette: 0.28 });
});
// E2b (s09 "Ask McDonald's to keep the game running."): a phone call split in two: the agent asks, the executive nods; GAME ON
shot('E3 ask', tAsk - 0.1, ST.s10 - 0.1, (ctx, t, lt) => {
  const nod = Math.sin((t - tKeep) * 7) * 0.06 * k(t, tKeep - 0.2, tKeep), ph = (c2, rot) => { c2.save(); c2.translate(-14, -30); c2.rotate(rot); rr(c2, -16, -50, 34, 100, 8); R.fillStroke(c2, '#20232A', 4); c2.restore(); };
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, 960); ctx.clip(); M.vanInterior(ctx, t);
  LT.lit(ctx, c => R.bust(c, 540, 1280, 1.8, M.AG2, { face: R.expr('neutral', { look: [0, 0.1], blink: blink(lt, 3.1), mouth: 'talk', talk: talk(t, t < tKeep ? 1 : 0.2) }), hands: [{ side: 1, hand: [104, -66], elbow: [232, 320], grip: 'hold', item: c2 => ph(c2, 0.15) }] }), { rim: { dir: [1, -0.3], color: '#9FFFD8', w: 7, a: 0.9 } }); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(0, 960, W, H - 960); ctx.clip(); bg(ctx, '#D6DEE8'); halfPass(ctx, 8, g => layer(g, { x: 0, y: -600, z: 1 }, 1, w => P.mailroom(w, t)));
  LT.lit(ctx, c => R.bust(c, 540, 1680, 1.8, M.EXEC, { face: R.exprMix(R.expr('worried', { look: [0, 0.2], blink: blink(lt, 2.9) }), R.expr('smile', { look: [0, 0] }), k(t, tKeep - 0.1, tKeep + 0.3)), headTilt: nod, hands: [{ side: 1, hand: [104, -66], elbow: [232, 320], grip: 'hold', item: c2 => ph(c2, 0.15) }] }), { rim: RIM_DAY }); ctx.restore();
  ctx.fillStyle = '#171717'; ctx.fillRect(0, 950, W, 20);
  const u = pop(t, tRunning - 0.05, 0.3, 2.4); if (u > 0) { ctx.save(); ctx.translate(540, 960); ctx.rotate(-0.04); ctx.scale(u * 1.2, u * 1.2); CL.cutout(ctx, () => rr(ctx, -330, -70, 660, 130, 20), '#171717', { elev: 2, tex: 0 }); txt(ctx, 'KEEP IT RUNNING', 0, 28, 66, C.yellow); ctx.restore(); }
  LT.grade(ctx, 'dark', { vignette: 0.2 });
});
// F1 (s10 "Agents watched."): binocular view of the lot: Jacobson hands an envelope; F2 (…"And collected evidence."): the piece goes into an evidence bag
shot('F1 watch', ST.s10 - 0.1, tColl - 0.1, (ctx, t, lt) => {
  bg(ctx, '#05060A'); const sh = Math.sin(lt * 1.3) * 10;
  for (const sx of [-1, 1]) { ctx.save(); ctx.beginPath(); ctx.arc(540 + sx * 255, 1050, 330, 0, 7); ctx.clip(); layer(ctx, { x: 150 + sx * 40 + sh, y: -420, z: 0.9 }, 1, w => { M.lot(w, t, {});
      LT.lit(w, g => R.figure(g, -200, 20, 1, 1, M.JAC, { armN: { hand: [150, -320], grip: 'hold', item: c2 => { c2.save(); c2.rotate(0.1); P.envelope(c2, 0.2); c2.restore(); } }, face: R.expr('smile', { look: [1, 0] }) }), { rim: RIM_W });
      LT.lit(w, g => R.figure(g, 150, 20, 1, -1, P.INV1, { armN: { hand: [110, -320], grip: 'open' }, face: R.expr('grin', { look: [1, 0] }) }), { rim: RIM_W }); });
    ctx.fillStyle = 'rgba(40,255,180,0.08)'; ctx.fillRect(0, 0, W, H); ctx.restore(); ell(ctx, 540 + sx * 255, 1050, 336, 336); ctx.lineWidth = 16; ctx.strokeStyle = '#05060A'; ctx.stroke(); }
  ctx.fillStyle = '#05060A'; ctx.fillRect(540 - 30, 800, 60, 500);
  const u = pop(t, tWatched - 0.05, 0.3, 2.2); if (u > 0) { ctx.save(); ctx.translate(540, 560); ctx.scale(u, u); label(ctx, 'AGENTS WATCHED', 0, 0, 1, { size: 58, col: '#171717', fg: C.yellow }); ctx.restore(); }
  LT.grade(ctx, 'dark', { vignette: 0.3 });
});
shot('F2 evidence', tColl - 0.1, ST.s11 - 0.1, (ctx, t, lt) => {
  woodTop(ctx, t); ctx.fillStyle = 'rgba(30,20,10,0.35)'; ctx.fillRect(0, 0, W, H); const d = E.out(seg(t, tColl - 0.1, tColl + 0.4)), fl = Math.max(0, 1 - (t - (tColl + 0.35)) * 5) * (t > tColl + 0.35 ? 1 : 0);
  ctx.save(); ctx.translate(540, lerp(-300, 1020, d)); ctx.rotate(lerp(0.3, -0.03, d)); ctx.scale(2.0, 2.0); M.evidenceBag(ctx, 1, { t }); ctx.restore();
  ctx.save(); ctx.translate(540, 1500); rr(ctx, -380, -80, 760, 170, 14); R.fillStroke(ctx, '#C9A56A', 5); fitTxt(ctx, 'CASE FILE', 0, 30, 70, '#5A3A18', 640); ctx.restore();
  if (fl > 0) { ctx.save(); ctx.globalAlpha = fl * 0.8; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  LT.grade(ctx, 'office', { vignette: 0.28 });
});
// G1 (s11 "In 2001,"): the front door in a dark hallway, light under it; G2: "...the arrests began.": the door bursts open; the cuffs snap on
shot('G1 door', ST.s11 - 0.1, tArrests - 0.1, (ctx, t, lt) => {
  bg(ctx, '#171A24'); const z = 1 + lt * 0.05; ctx.save(); ctx.translate(540, 1050); ctx.scale(z, z); rr(ctx, -320, -560, 640, 1120, 12); R.fillStroke(ctx, '#6E4630', 6); ctx.fillStyle = '#5A3A28'; for (const [x, y] of [[-170, -330], [170, -330], [-170, 40], [170, 40]]) { ctx.fillRect(x - 110, y - 160, 220, 300); } ell(ctx, 240, 40, 22, 22); R.fillStroke(ctx, M.GOLD, 4); ctx.fillStyle = 'rgba(255,240,200,0.9)'; ctx.fillRect(-320, 556, 640, 14); ctx.restore();
  LT.glow(ctx, 540, 1600, 800, 'rgba(255,240,200,1)', 0.25);
  const u = pop(t, t2001 - 0.02, 0.3, 2.4); if (u > 0) { ctx.save(); ctx.translate(540, 520); ctx.rotate(-0.04); ctx.scale(u * 1.4, u * 1.4); CL.cutout(ctx, () => rr(ctx, -190, -66, 380, 124, 14), '#171717', { elev: 1.4, tex: 0 }); txt(ctx, '2001', 0, 28, 92, C.yellow); ctx.restore(); }
  LT.grade(ctx, 'dark', { vignette: 0.3 });
});
shot('G2 cuffs', tArrests - 0.1, ST.s12 - 0.1, (ctx, t, lt) => {
  const op = 1 - k(t, tBegan - 0.1, tBegan + 0.15, E.in), sh = shake(t, tBegan + 0.15, 14), fl = clamp(1 - (t - tArrests + 0.1) / 0.5) * 0.9;
  bg(ctx, '#171A24'); LT.glow(ctx, 540, 600, 1200, 'rgba(255,240,200,1)', 0.35); ctx.save(); ctx.translate(sh, 0);
  const sp = lerp(40, 150, op); reach(ctx, [-200, 1500], [540 - sp - 70, 1150], 'fist', { L: M.JAC, size: 3.2 }); reach(ctx, [1300, 1500], [540 + sp + 70, 1150], 'fist', { L: M.JAC, size: 3.2 });
  ctx.save(); ctx.translate(540, 1150); ctx.scale(2.2, 2.2); M.cuffs(ctx, 1, { open: op }); ctx.restore(); ctx.restore();
  if (fl > 0) { ctx.save(); ctx.globalAlpha = fl * 0.5; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  const u = pop(t, tArrests, 0.3, 2.4); if (u > 0) { ctx.save(); ctx.translate(540, 560); ctx.rotate(0.03); ctx.scale(u * 1.2, u * 1.2); label(ctx, 'ARRESTED', 0, 0, 1, { size: 90, col: C.red, fg: '#FFFDF8' }); ctx.restore(); }
  LT.grade(ctx, 'dark', { vignette: 0.28 });
});
// H (s12): a wall of faces; GUILTY stamps land on them one by one
shot('H faces', ST.s12 - 0.1, ST.s13 - 0.1, (ctx, t, lt) => {
  bg(ctx, '#C8B48C'); const cols = 4, rows = 5, cw = 250, ch = 245;
  for (let i = 0; i < cols * rows; i++) { const x = 540 + (i % cols - 1.5) * cw, y = 540 + Math.floor(i / cols) * ch, t0 = ST.s12 - 0.05 + i * 0.07, u = pop(t, t0, 0.25, 2.2); if (u <= 0) continue;
    ctx.save(); ctx.translate(x, y); ctx.scale(u, u); CL.cutout(ctx, () => rr(ctx, -112, -112, 224, 224, 10), '#F4F1E8', { elev: 0.8 }); ctx.save(); rr(ctx, -112, -112, 224, 224, 10); ctx.clip(); R.bust(ctx, 0, 130, 0.62, M.CROWD[i % M.CROWD.length], { face: R.expr(t > tGuilty + i * 0.05 ? 'tired' : 'neutral', { look: [0, 0.2] }) }); ctx.restore();
    const g = pop(t, tPleaded + i * 0.06, 0.2, 2.6); if (g > 0 && t > tPleaded) { ctx.save(); ctx.rotate(-0.25 + (i % 3) * 0.1); ctx.scale(g * 0.75, g * 0.75); P.mark(ctx, 'GUILTY', { size: 56, rot: 0 }); ctx.restore(); } ctx.restore(); }
  LT.grade(ctx, 'golden', { vignette: 0.26 });
});
// I (s13): Jacobson behind bars; the sentence lands
shot('I prison', ST.s13 - 0.1, ST.s14 - 0.1, (ctx, t, lt) => {
  bustShot(ctx, lt, c => { bg(c, '#3A4258'); c.fillStyle = 'rgba(10,12,24,0.35)'; c.fillRect(0, 0, W, H); LT.glow(c, 800, 500, 800, 'rgba(180,210,255,1)', 0.22); }, { L: M.JAC, x: 540, ny: 1640, s: 2.5, push: 0.03, rim: RIM_COOL, face: R.expr('tired', { look: [0, 0.5], blink: blink(lt, 3.5) }), tilt: 0.05 });
  M.bars(ctx); const u = pop(t, tThree - 0.05, 0.3, 2.4); if (u > 0) { ctx.save(); ctx.translate(540, 560); ctx.rotate(-0.04); ctx.scale(u * 1.2, u * 1.2); CL.cutout(ctx, () => rr(ctx, -330, -120, 660, 230, 22), '#171717', { elev: 2, tex: 0 }); fitTxt(ctx, '3 YEARS', 0, 34, 150, C.yellow, 600); ctx.restore(); }
  LT.grade(ctx, 'dark', { vignette: 0.3 });
});
// J (s14): the empty security room: the monitors, the empty chair, one gold piece on the table; at "playing" every screen turns to WINNER
shot('J ending', ST.s14 - 0.1, T + 0.01, (ctx, t, lt) => {
  const c = cam([[0, 0, -520, 0.85], [4.5, 90, -400, 1.25]], lt), win = k(t, tPlaying - 0.05, tPlaying + 0.25);
  bg(ctx, '#9AA6B6');
  layer(ctx, c, 1, w => { M.secRoom(w, t, { win });
    w.save(); w.translate(-380, 0); rr(w, -120, -330, 240, 40, 10); R.fillStroke(w, '#2A2F3A', 5); R.tube(w, [[0, -290], [0, -40]], 24, '#2A2F3A', 5); rr(w, -160, -40, 320, 40, 12); R.fillStroke(w, '#2A2F3A', 5); w.restore();
    w.save(); w.translate(200, -352); w.rotate(-0.05 + 0.02 * Math.sin(t * 4 * win)); w.scale(1, 0.75); M.gamePiece(w, 1.3, { gold: true, text: 'WINNER', top: 'WIN', t }); w.restore();
    w.save(); w.translate(-100, -330); M.securityBadge(w, 0.5); w.restore(); });
  LT.grade(ctx, 'office', { vignette: 0.24 });
});

// ---------- edit, global overlays, subtitles ----------
SH.sort((a, b) => a.t0 - b.t0);
const ED = makeEdit(SH, W, H);
const SPLIT = { s01: [7, 7], s02: [6, 6], s03: [6], s04: [5], s05: [5, 5], s06: [4, 1, 2], s07: [7], s08: [5], s09: [2, 7], s10: [2, 3], s11: [2, 3], s12: [4, 4], s13: [3, 4], s14: [8, 6] };
function subs() {
  const G = [];
  Object.keys(ST).forEach(id => { const ws = V.words(id); let k0 = 0; SPLIT[id].forEach(n => { G.push({ id, words: ws.slice(k0, k0 + n) }); k0 += n; }); if (k0 !== ws.length) throw new Error(`subtitle split ${id}: ${k0} vs ${ws.length}`); });
  G.forEach((g, i) => { const nx = G[i + 1], e0 = Math.min(g.words[g.words.length - 1].t1, end(g.id)) + 0.4; g.t0 = g.words[0].t0 - 0.05;
    g.t1 = nx ? (nx.id === g.id ? nx.words[0].t0 - 0.05 : Math.min(e0, nx.words[0].t0 - 0.05)) : Math.min(T, e0 + 0.6);
    g.text = g.words.map(x => x.w).join(' '); });
  return G;
}
const SUBS = subs();
const TEX = K.paperTexture(W, H);
function frame(ctx, t) {
  ED.frame(ctx, t);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  headline(ctx, t); stampLabel(ctx, t);
  ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.26; ctx.drawImage(TEX, 0, 0); ctx.restore();
  EN.drawSubtitles(ctx, t, SUBS, { y: 1565, size: 62, maxW: 820, x: 540, highlight: ['rigging', 'security', 'winners', 'pulled', 'friends', 'family', 'trusted', 'prizes', 'again...', 'again.', 'million', 'fbi', 'plan?', 'evidence.', '2001,', 'arrests', 'guilty', 'convicted.', 'years', 'prison.', 'playing'] });
}

// ---------- sound cues (for mix.py) ----------
function cues() {
  const c = [['room', 0, 0.6], ['paper', 1.2, 0.5], ['cut', tRig - 0.1, 0.35], ['stamp', tRig, 1.0], ['thump', tRig, 0.5]];
  c.push(['cut', ST.s02 - 0.1, 0.35], ['office', ST.s02 - 0.1, 0.7], ['tag', tJac + 0.05, 0.5], ['stamp', tSec, 0.5], ['pop', tGame, 0.5]);
  c.push(['cut', ST.s03 - 0.1, 0.35], ['sparkle', tWin, 0.6], ['cut', ST.s04 - 0.1, 0.3], ['flutter', tPull - 0.05, 0.6], ['snap', tPull + 0.3, 0.5]);
  c.push(['cut', ST.s05 - 0.1, 0.35], ['wind', ST.s05 - 0.1, 0.4]); for (const t0 of [tFr, tFam, tTrust]) c.push(['whoosh', t0 - 0.3, 0.3], ['tag', t0, 0.45], ['pop', t0 + 0.35, 0.4]);
  c.push(['cut', ST.s06 - 0.1, 0.35]); for (let i = 0; i < 24; i++) c.push(['tick', tPrizes - 0.3 + i * 0.14, 0.3]); c.push(['stamp', tAgain, 0.7], ['stamp', tAgain2, 0.9]);
  c.push(['cut', ST.s07 - 0.1, 0.35], ['kaching', tTwenty + 0.9, 0.9], ['rise', tTwenty - 0.2, 0.5]);
  c.push(['cut', ST.s08 - 0.1, 0.35], ['hum', ST.s08 - 0.1, 0.8], ['stamp', tFbi, 0.8]);
  c.push(['cut', ST.s09 - 0.1, 0.35], ['pop', tPlan, 0.6], ['cut', tAsk - 0.1, 0.3], ['ring', tAsk - 0.2, 0.4], ['stamp', tRunning, 0.8]);
  c.push(['cut', ST.s10 - 0.1, 0.35], ['scan', ST.s10, 0.5], ['cut', tColl - 0.1, 0.3], ['thump', tColl + 0.3, 0.6], ['shutter', tColl + 0.35, 0.6]);
  c.push(['cut', ST.s11 - 0.1, 0.35], ['stamp', t2001, 0.6], ['slam', tArrests - 0.12, 0.9], ['clank', tBegan, 0.9], ['click', tBegan + 0.05, 0.7]);
  c.push(['cut', ST.s12 - 0.1, 0.35]); for (let i = 0; i < 20; i++) c.push(['pop', ST.s12 - 0.05 + i * 0.07, 0.25]); for (let i = 0; i < 12; i++) c.push(['stamp', tPleaded + i * 0.08, 0.35]);
  c.push(['cut', ST.s13 - 0.1, 0.35], ['clank', tThree - 0.05, 0.9], ['gavel', tThree, 0.7], ['boom', tPrison, 0.5]);
  c.push(['cut', ST.s14 - 0.1, 0.35], ['office', ST.s14 - 0.1, 0.6], ['sparkle', tPlaying, 0.7], ['boop', tPlaying + 0.1, 0.4]);
  return c;
}
const MUSIC = { b0: 0, story: ST.s02, scheme: ST.s05, fbi: ST.s08, arrests: ST.s11, prison: ST.s13, end: ST.s14, hit: tPlaying - 0.1, T };

// ---------- CLI ----------
const [mode, a1, a2] = process.argv.slice(2);
if (mode === 'cues') { fs.writeFileSync(`${__dirname}/cues.json`, JSON.stringify({ T, vo: Object.entries(ST), sfx: cues(), music: MUSIC })); console.log('cues ok, T =', T, VOD); }
else if (mode === 'srt') {
  const f = s => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  fs.writeFileSync(a1, SUBS.map((g, i) => `${i + 1}\n${f(g.t0)} --> ${f(g.t1)}\n${g.text}\n`).join('\n')); console.log('srt ok', SUBS.length);
}
else if (mode === 'still') {
  const ts = a1.split(',').map(Number), tw = 270, th = 480, cols = Math.min(ts.length, 8), rows = Math.ceil(ts.length / cols);
  const sheetC = createCanvas(tw * cols, th * rows), sc = sheetC.getContext('2d'), cv = createCanvas(W, H), ctx = cv.getContext('2d');
  ts.forEach((t, i) => { frame(ctx, t); sc.drawImage(cv, (i % cols) * tw, Math.floor(i / cols) * th, tw, th); sc.fillStyle = '#E63946'; sc.font = '20px sans-serif'; sc.fillText(t.toFixed(2), (i % cols) * tw + 6, Math.floor(i / cols) * th + 22); });
  fs.writeFileSync(a2, sheetC.toBuffer('image/png'));
} else if (mode === 'frame') { const cv = createCanvas(W, H), ctx = cv.getContext('2d'); frame(ctx, +a1); fs.writeFileSync(a2, cv.toBuffer('image/png')); }
else if (mode === 'shots') console.log(SH.map(s => `${s.id}\t${s.t0.toFixed(2)}–${s.t1.toFixed(2)}\t${(s.t1 - s.t0).toFixed(2)}s`).join('\n'), '\nT', T, VOD);
else if (mode === 'video') (async () => {
  const cv = createCanvas(W, H), ctx = cv.getContext('2d');
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', a1], { stdio: ['pipe', 'inherit', 'inherit'] });
  const N = Math.round(T * FPS), T0 = Date.now();
  for (let f = 0; f < N; f++) { frame(ctx, f / FPS); const buf = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); if (f % 150 === 0) process.stderr.write(`${f}/${N} ${((Date.now() - T0) / 1000).toFixed(0)}s\n`); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
})();
module.exports = { T, ST, SH };
