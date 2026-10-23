// Episode 13 "The Comcast Call That Wouldn't End" (How It's Run) — July 2014: Veronica Belmont calls Comcast to disconnect, the retention
// employee keeps asking why, she hands the phone to Ryan Block, he records, 18 minutes, the store check, the recording goes viral, Comcast's
// apology, Ryan's "don't fire him", the leaked COO memo, and the system behind the employee. Built on hirkit (rig, light, collage, edit).
// Two through-lines: the call timer (HUD + phone) and the employee's headset cord, which runs off-frame until the last shot follows it.
// Shots cut on voice-over words. 1080x1920, 30 fps. Re-enactment: generic figures, the employee is never shown from the front.
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
const S = require('./callkit');
const { C, F, clamp, lerp, seg, E, rr } = K;
const { INK, ell } = R;
const { W, H, layer, txt, fitTxt, VER, RYAN, CLERK } = S;
const FPS = 30;
const k = (t, a, b, e = E.inOut) => e(seg(t, a, b));

// ---------- voice timeline (natural speed; real speech start/end from vo/speech.json, gaps only) ----------
// vo/ = the real voice. Until it exists, vo_draft/ (estimated timings, no audio) lets the shots be laid out; build.sh refuses to run without vo/.
const VOD = fs.existsSync(`${__dirname}/vo/speech.json`) ? 'vo' : 'vo_draft';
const LINES = JSON.parse(fs.readFileSync(`${__dirname}/script.json`));
const SP = JSON.parse(fs.readFileSync(`${__dirname}/${VOD}/speech.json`));
const GAP = { s01: 0.2, s02: 0.35, s03: 0.3, s04: 0.3, s05: 0.35, s06: 0.3, s07: 0.45, s08: 0.35, s09: 0.3, s10: 0.35, s11: 0.3, s12: 0.5, s13: 0.25, s14: 0.35, s15: 0.45, s16: 0.3, s17: 2.3 };
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
function halfPass(ctx, blur, draw) { // a softer (half-res, blurred) background plane
  hx.setTransform(1, 0, 0, 1, 0, 0); hx.clearRect(0, 0, W / 2, H / 2); hx.setTransform(0.5, 0, 0, 0.5, 0, 0);
  R.LINE.dev = 0.5; draw(hx); R.LINE.dev = 1;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); if (blur > 0.3) ctx.filter = `blur(${blur.toFixed(1)}px)`; ctx.drawImage(HALF, 0, 0, W, H); ctx.restore();
}
const blink = (t, p = 3.3, o = 0) => ((t + o) % p) > p - 0.11 ? 1 : 0;
const talk = (t, on = 1) => on * (0.5 + 0.5 * Math.sin(t * 17) * Math.sin(t * 5.3));
const RIM_W = { dir: [-1, -0.35], color: '#FFD9A0', w: 8, a: 0.9 }, RIM_COOL = { dir: [1, -0.4], color: '#D8F0FF', w: 8, a: 0.85 }, RIM_DAY = { dir: [-1, -0.4], color: '#FFF6E0', w: 8, a: 0.9 };
const pop = (t, t0, d = 0.3, s = 2.2) => t < t0 ? 0 : E.back(seg(t, t0, t0 + d), s);
function label(ctx, s, x, y, u, o = {}) { // a paper label with an optional arrow (names, places)
  if (u <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.03); ctx.scale(u, u); const size = o.size || 56;
  ctx.font = `${size}px ${F.black}`; const w = Math.min(ctx.measureText(s).width + 50, o.maxW || 980);
  CL.cutout(ctx, () => rr(ctx, -w / 2, -size * 0.85, w, size * 1.35, 12), o.col || '#FFFDF8', { elev: 1.4 }); fitTxt(ctx, s, 0, size * 0.28, size, o.fg || INK, w - 40);
  if (o.arrow) { ctx.fillStyle = o.col || '#FFFDF8'; const ax = o.arrowX || 0; ctx.beginPath(); ctx.moveTo(ax - 22, size * 0.5); ctx.lineTo(ax + 22, size * 0.5); ctx.lineTo(ax + o.arrow * 30, size * 1.25); ctx.closePath(); ctx.fill(); ctx.lineWidth = R.px(ctx, 4); ctx.strokeStyle = INK; ctx.stroke(); }
  ctx.restore();
}
function note(ctx, s, y, u = 1) { // small source note (what is a quote / where it is from), dark chip
  if (u <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(u); ctx.translate(W / 2, y); ctx.font = `28px ${F.black}`; const w = ctx.measureText(s).width + 40;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -26, w, 48, 10), '#2E3A59', { elev: 0.6, tex: 0 }); txt(ctx, s, 0, 9, 28, '#FFFDF8'); ctx.restore();
}

// ---------- the call timer (call minutes as a function of video time) ----------
const tAsks = at('s04', 'asks'), tTen = at('s04', 'ten'), tHands = at('s04', 'hands'), tHusband = at('s04', 'husband'), tRyan = at('s04', 'ryan');
const tRec = at('s05', 'record'), tAll = at('s08', 'all'), tFinally = at('s08', 'finally'), tDisc = at('s08', 'disconnected');
const MINK = [[0, 0], [ST.s03, 0.7], [ST.s04, 1.6], [tTen - 0.15, 9.6], [tTen + 0.35, 10.0], [ST.s06, 10.3], [ST.s07, 12.1], [ST.s08, 15.2], [tAll + 0.1, 18.0]];
function callMin(t) { if (t <= 0) return 0; for (let i = 1; i < MINK.length; i++) if (t < MINK[i][0]) return lerp(MINK[i - 1][1], MINK[i][1], seg(t, MINK[i - 1][0], MINK[i][0])); return 18.0; }
const ended = t => t > tAll + 0.15;
function timerHUD(ctx, t) { // top chip during the call: phone glyph, mm:ss, REC once Ryan records
  if (t < ST.s03 - 0.1 || t > ST.s09 - 0.12) return;
  const m = callMin(t), rec = t > tRec, en = ended(t), y = 352, tick = Math.floor(m * 60) !== Math.floor(callMin(t - 1 / FPS) * 60);
  ctx.save(); ctx.translate(W / 2, y); const big = t > tTen - 0.2 && t < tTen + 0.6 ? 1 + 0.25 * Math.sin(seg(t, tTen - 0.2, tTen + 0.6) * Math.PI) : en ? 1 + 0.2 * Math.sin(seg(t, tAll, tAll + 0.6) * Math.PI) : 1; ctx.scale(big, big);
  const w = rec ? 330 : 240; CL.cutout(ctx, () => rr(ctx, -w / 2, -40, w, 80, 40), en ? C.red : '#171717', { elev: 1, tex: 0 });
  ctx.save(); ctx.translate(-w / 2 + 44, 0); ctx.rotate(-0.7); ctx.strokeStyle = '#FFFDF8'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, 0, 14, -1.0, 1.0); ctx.stroke(); ctx.restore();
  txt(ctx, S.mmss(m), -w / 2 + 160, 18, 50, '#FFFDF8'); if (tick && !en) { ctx.globalAlpha = 0.25; txt(ctx, S.mmss(m), -w / 2 + 160, 18, 50, C.yellow); ctx.globalAlpha = 1; }
  if (rec) { const bl = Math.sin(t * 6) > -0.3 ? 1 : 0.35; ell(ctx, w / 2 - 82, 0, 11, 11); ctx.fillStyle = en ? '#FFFDF8' : `rgba(230,57,70,${bl})`; ctx.fill(); txt(ctx, 'REC', w / 2 - 38, 11, 30, en ? '#FFFDF8' : C.red); }
  ctx.restore();
}
function stampLabel(ctx, t) { // the honesty label, small, top of the 3:4 crop, always on
  ctx.save(); ctx.translate(W / 2, 262); ctx.font = `28px ${F.black}`; const s = 'REAL STORY · JULY 2014 · RE-ENACTMENT', w = ctx.measureText(s).width + 40;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -26, w, 50, 10), '#171717', { elev: 0.8, tex: 0 }); txt(ctx, s, 0, 10, 28, C.yellow); ctx.restore();
}
function headline(ctx, t) { // frame-0 hook: CANCEL INTERNET -> "WHY?" (stays through the first two lines)
  const a = 1 - seg(t, ST.s03 - 0.3, ST.s03 - 0.05); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2, 450);
  CL.cutout(ctx, () => rr(ctx, -420, -72, 840, 112, 16), '#FFFDF8', { elev: 1.4 }); txt(ctx, 'CANCEL INTERNET', 0, 12, 82, INK);
  const p = t > at('s02', 'why') ? E.back(seg(t, at('s02', 'why'), at('s02', 'why') + 0.3), 2.4) : 1;
  ctx.translate(0, 132); ctx.rotate(0.03); ctx.scale(p, p); CL.cutout(ctx, () => rr(ctx, -250, -58, 500, 104, 14), C.red, { elev: 1.2 });
  txt(ctx, '“WHY?”', 0, 20, 70, '#FFFDF8');
  ctx.restore();
}

// ---------- backgrounds ----------
const aptBg = (cx, cy, z, blur, o = {}) => (c, t) => { c.fillStyle = '#E9DCC6'; c.fillRect(0, 0, W, H); halfPass(c, blur, g => layer(g, { x: cx, y: cy, z }, 1, w => S.apartment(w, t, o))); LT.haze(c, 'evening', 0.12); };
const ccBg = (cx, cy, z, blur, o = {}) => (c, t) => { c.fillStyle = '#D6DEE8'; c.fillRect(0, 0, W, H); halfPass(c, blur, g => layer(g, { x: cx, y: cy, z }, 1, w => S.callCentre(w, t, o))); LT.haze(c, 'office', 0.1); };

// the employee at his desk, from behind (screen space). o: { x, y, s, slump, talk, cordTo: [[x,y]...] off-frame points, why: [...] }
function repShot(ctx, t, lt, o) {
  const cx = o.x ?? 540, cy = o.y ?? 1180, s = o.s ?? 1.5;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  S.repDesk(ctx, 0, 330, t, { glow: 1, cancelled: o.cancelled });
  ctx.restore();
  let cs; LT.lit(ctx, g => { cs = S.repBack(g, cx, cy - 20 * s, s * 0.92, { slump: o.slump || 0, talk: o.talk ?? 1, t }); }, { rim: { dir: [0, -1], color: '#D8E8FF', w: 7, a: 0.85 }, glow: { x: cx, y: cy - 300 * s, r: 700, color: 'rgb(150,190,240)', a: 0.25 } });
  // the headset cord: down past his left shoulder and out of the frame (the system it leads to is not shown yet)
  const pts = [cs, [cs[0] - 70 * s, cs[1] + 90 * s], [cs[0] - 150 * s, cs[1] + 260 * s], ...(o.cordTo || [[cx - 330 * s, cy + 500 * s], [-200, H + 200]])];
  S.cord(ctx, pts, { w: 11 * s / 1.5, coil: 3, col: '#E9EDF3' });
  return cs;
}
// a pile of WHY? bubbles (screen space), n visible, growing; deterministic positions in a region
function whyPile(ctx, t, n, region, o = {}) {
  const [x0, y0, x1, y1] = region;
  for (let i = 0; i < n; i++) { const u = pop(t, (o.t0 ?? 0) + i * (o.dt ?? 0.18), 0.3, 2.4); if (u <= 0) continue;
    const x = lerp(x0, x1, K.hash(i * 7 + 1)), y = lerp(y0, y1, K.hash(i * 11 + 3)), sz = (0.45 + K.hash(i * 5) * 0.45) * (o.s ?? 1) * u, fall = o.fall ? E.in(clamp((t - o.fall - K.hash(i) * 0.3) / 0.6)) : 0;
    ctx.save(); ctx.translate(x + fall * (K.hash(i + 2) - 0.5) * 200, y + fall * 900); ctx.rotate((K.hash(i * 3) - 0.5) * 0.4 + fall * 2); S.whyBubble(ctx, { s: sz, squash: o.squash || 0, col: i % 5 === 4 ? C.red : undefined, fg: i % 5 === 4 ? '#FFFDF8' : undefined }); ctx.restore(); }
}

// Veronica / Ryan front busts with the phone at the ear
const phoneAtEar = (side = 1, rot = 0.15, s = 0.22) => c => { c.save(); c.translate(-14, -22); c.rotate(rot); S.phone(c, s, { back: true }); c.restore(); };
const EARH = { side: 1, hand: [104, -66], elbow: [232, 320], grip: 'hold' }; // hand holding the phone against the ear (front bust)
const earPhone = c => { c.save(); c.translate(-14, -34); c.rotate(-0.25); S.phone(c, 0.14, { back: true }); c.restore(); }; // same, side-view figure
function verBust(ctx, lt, bg, o) {
  bg(ctx);
  const push = 1 + lt * (o.push ?? 0.03), nx = o.x ?? 540, ny = o.ny ?? 1460; ctx.save(); ctx.translate(nx, ny); ctx.scale(push, push); ctx.translate(-nx, -ny);
  LT.lit(ctx, c => R.bust(c, nx, ny, o.s ?? 2.7, o.L || VER, { face: o.face, hands: o.hands || [], headTilt: o.tilt || 0, lean: o.lean || 0 }),
    { rim: o.rim ?? RIM_W, tint: { x0: nx, y0: 0, x1: nx + 540, y1: 0, color: 'rgb(190,180,225)', a: 1 }, ...(o.glow ? { glow: o.glow } : {}) });
  ctx.restore();
}

// ================= SHOTS =================
const SH = []; const shot = (id, t0, t1, draw, out) => SH.push({ id, t0, t1, draw, out });

// A1 (s01 "They wanted to cancel their internet."): Veronica, phone at her ear, polite and determined; dusk apartment behind
shot('A1 veronica', 0, ST.s02 - 0.1, (ctx, t, lt) => {
  verBust(ctx, lt, c => aptBg(-700, -900, 1.1, 12)(c, t), { x: 560, ny: 1500, s: 2.65, push: 0.025,
    face: R.expr('neutral', { look: [-0.2, 0], blink: blink(lt, 2.6, 1), mouth: 'talk', talk: talk(t, t > 0.4 && t < 1.9 ? 0.7 : 0), brow: [0.25, 0.25] }), tilt: -0.05,
    hands: [{ ...EARH, item: phoneAtEar() }] });
  LT.grade(ctx, 'evening', { vignette: 0.2 });
});
// A2 (s02 "The employee wouldn't stop asking why."): the employee from behind at his desk; WHY? bubbles keep popping up from his headset; the cord leaves the frame
shot('A2 why', ST.s02 - 0.1, ST.s03 - 0.12, (ctx, t, lt) => {
  ccBg(0, -1200, 0.9, 10)(ctx, t);
  const z = 1 + lt * 0.04; ctx.save(); ctx.translate(540, 1100); ctx.scale(z, z); ctx.translate(-540, -1100);
  repShot(ctx, t, lt, { x: 600, y: 1240, s: 1.45 });
  ctx.restore();
  const tW = at('s02', 'why'); whyPile(ctx, t, 6, [180, 620, 900, 1150], { t0: ST.s02 + 0.05, dt: (tW - ST.s02) / 6, s: 1.1 });
  const u = pop(t, tW, 0.3, 2.6); if (u > 0) { ctx.save(); ctx.translate(560, 900); ctx.scale(u * 1.7, u * 1.7); ctx.rotate(-0.06); S.whyBubble(ctx, { col: C.red, fg: '#FFFDF8' }); ctx.restore(); }
  LT.grade(ctx, 'office', { vignette: 0.22 });
});

// B1 (s03 "July 2014. Veronica Belmont calls Comcast to disconnect."): wide — the apartment at dusk; Veronica on the sofa with the phone, Ryan at his desk
const t2014 = at('s03', '2014'), tVer = at('s03', 'veronica'), tCalls = at('s03', 'calls');
function verSofa(w, t, lt, face, o = {}) { // Veronica sitting on the sofa (world), phone at her ear
  LT.lit(w, g => R.figure(g, o.x ?? -520, 0, 1, 1, VER, { hip: [0, -245], lean: o.lean ?? -0.05, legN: { foot: [80, 0] }, legF: { foot: [56, 0] },
    armN: o.armN || { hand: [34, -462], grip: 'hold', item: earPhone }, armF: o.armF || { hand: [80, -330], grip: 'relax' },
    face, headTilt: o.tilt ?? 0.08 }), { rim: RIM_W });
}
function ryanDesk(w, t, lt, face, o = {}) { // Ryan on his chair at the desk (world), typing
  S.chair(w, 760, 0, 1);
  const ty = Math.sin(t * 14) * 6 * (o.typing ?? 1);
  LT.lit(w, g => R.figure(g, 760, 0, 1, 1, RYAN, { hip: [0, -240], lean: 0.12, legN: { foot: [100, 0] }, legF: { foot: [74, 0] },
    armN: o.armN || { hand: [170, -440 + ty], grip: 'relax' }, armF: o.armF || { hand: [150, -440 - ty], grip: 'relax' }, face, headTilt: o.tilt ?? 0.05 }), { rim: RIM_W, glow: o.glow });
}
shot('B1 apartment', ST.s03 - 0.12, ST.s04 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 200, -720, 0.5], [4, 120, -700, 0.56]], lt);
  ctx.fillStyle = '#E9DCC6'; ctx.fillRect(0, 0, W, H);
  layer(ctx, c, 1, w => {
    S.apartment(w, t, { clock: callMin(t), sofa: true, desk: true, table: true });
    verSofa(w, t, lt, R.expr('neutral', { look: [0.3, 0], blink: blink(lt, 2.8), mouth: 'talk', talk: talk(t, 0.6) }));
    ryanDesk(w, t, lt, R.expr('neutral', { look: [1, 0.2], blink: blink(lt, 3.1, 1) }));
  });
  LT.grade(ctx, 'evening', { vignette: 0.18 });
  const u = pop(t, t2014 - 0.05, 0.3, 2.6), fade = 1 - seg(t, t2014 + 1.1, t2014 + 1.4); if (u > 0 && fade > 0) { ctx.save(); ctx.globalAlpha = fade; ctx.translate(540, 560); ctx.rotate(-0.05); ctx.scale(u * 1.4, u * 1.4); CL.cutout(ctx, () => rr(ctx, -250, -70, 500, 120, 14), '#171717', { elev: 1.4, tex: 0 }); txt(ctx, 'JULY 2014', 0, 20, 76, C.yellow); ctx.restore(); }
  label(ctx, 'VERONICA BELMONT', 330, 820, pop(t, tVer + 0.05), { arrow: 1, arrowX: -80, size: 54, col: C.yellow });
  label(ctx, 'CALLING COMCAST', 330, 960, pop(t, tCalls), { size: 40, rot: 0.03 });
});
// B2 (s04 "She explains."): Veronica, medium, explaining with her free hand
shot('B2 explains', ST.s04 - 0.12, tAsks - 0.35, (ctx, t, lt) => {
  const g = Math.sin(lt * 6) * 30;
  verBust(ctx, lt, c => aptBg(-900, -900, 1.2, 12, { clock: callMin(t) })(c, t), { x: 600, ny: 1480, s: 2.4, push: 0.03,
    face: R.expr('smile', { look: [-0.3, 0], blink: blink(lt, 2.2), mouth: 'talk', talk: talk(t), brow: [0.4, 0.4] }), tilt: -0.04,
    hands: [{ ...EARH, item: phoneAtEar() }, { side: -1, hand: [-150 + g, 60 - g * 0.5], grip: 'open' }] });
  LT.grade(ctx, 'evening', { vignette: 0.2 });
});
// B3 (s04 "He asks again."): the employee again, one more WHY?; his cord sways out of frame
shot('B3 again', tAsks - 0.35, tTen - 0.12, (ctx, t, lt) => {
  ccBg(300, -1150, 1.0, 11)(ctx, t);
  repShot(ctx, t, lt, { x: 500, y: 1260, s: 1.6, talk: 1 });
  const u = pop(t, tAsks, 0.3, 2.4); if (u > 0) { ctx.save(); ctx.translate(520, 760); ctx.scale(u * 1.25, u * 1.25); ctx.rotate(0.05); S.whyBubble(ctx, {}); ctx.restore(); }
  LT.grade(ctx, 'office', { vignette: 0.22 });
});
// B4 (s04 "Ten minutes in,"): time-lapse on the sofa — the clock spins, the tea goes cold, WHY? bubbles pile up around her, she sinks
shot('B4 ten minutes', tTen - 0.12, tHands - 0.25, (ctx, t, lt) => {
  const c = cam([[0, -380, -640, 0.85], [1.4, -380, -620, 0.95]], lt), sink = k(t, tTen - 0.1, tHands - 0.3);
  ctx.fillStyle = '#E9DCC6'; ctx.fillRect(0, 0, W, H);
  layer(ctx, c, 1, w => {
    S.apartment(w, t, { clock: callMin(t), steam: 1 - sink, lamp: 1, desk: false });
    verSofa(w, t, lt, R.exprMix('neutral', R.expr('tired', { look: [0.2, 0.5] }), sink), { lean: lerp(-0.05, -0.18, sink), tilt: lerp(0.08, 0.25, sink) });
  });
  whyPile(ctx, t, 14, [100, 560, 980, 1350], { t0: tTen - 0.12, dt: 0.06, s: 0.85 });
  ctx.fillStyle = `rgba(40,30,70,${0.18 * sink})`; ctx.fillRect(0, 0, W, H);
  LT.grade(ctx, 'evening', { vignette: 0.22 + 0.1 * sink });
});
// B5 (s04 "she hands the phone to her husband, Ryan Block."): two-shot — she holds the phone out at arm's length, he swivels and takes it
const tGive = tHusband + 0.05;
shot('B5 handoff', tHands - 0.25, ST.s05 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 500, -520, 1.05], [2.5, 520, -520, 1.12]], lt);
  ctx.fillStyle = '#E9DCC6'; ctx.fillRect(0, 0, W, H);
  halfPass(ctx, 4, g => layer(g, c, 1, w => S.apartment(w, t, { sofa: false, table: false, desk: false, clock: callMin(t) })));
  const meet = [515, -430], out = k(t, tHands - 0.25, tGive - 0.25, E.out), take = k(t, tHands, tGive - 0.1, E.out), back = k(t, tGive + 0.1, tGive + 0.7);
  layer(ctx, c, 1, w => {
    S.desk(w, 1150, 0, t, {});
    // Veronica (standing, left): phone from her ear to arm's length, then her arm drops and she folds her arms
    const vEar = [34, -505], vMeet = R.toLocal(330, 0, 1, 1, meet), vHand = t < tGive ? R.mix(vEar, vMeet, out) : R.mix(vMeet, [60, -330], back);
    const phoneIt = c2 => { c2.save(); c2.translate(0, -20); c2.rotate(-0.2); S.phone(c2, 0.14, { min: callMin(t) }); c2.restore(); };
    LT.castShadow(w, g => R.figure(g, 330, 0, 1, 1, VER, {}), { x: 330, floorY: 0, a: 0.18, blur: 3 });
    LT.lit(w, g => R.figure(g, 330, 0, 1, 1, VER, { lean: lerp(0, 0.1, out) * (1 - back), legN: { foot: [40, 0] }, legF: { foot: [-30, 0] },
      armN: { hand: vHand, grip: t < tGive ? 'hold' : 'relax', item: t < tGive ? phoneIt : null }, armF: { hand: [30 + back * 20, -330 + back * 20], grip: 'relax' },
      face: t < tGive ? R.expr('tired', { look: [1, 0], blink: blink(lt, 2.4) }) : R.expr('skeptical', { look: [1, -0.1] }), headTilt: 0.06 }), { rim: RIM_W });
    // Ryan (chair, facing her): reaches, takes it, brings it to his ear
    S.chair(w, 700, 0, -1);
    const rKey = [-160, -420], rMeet = R.toLocal(700, 0, 1, -1, meet), rEar = [34, -470];
    const rHand = t < tGive ? R.mix(rKey, rMeet, take) : R.mix(rMeet, rEar, back);
    LT.lit(w, g => R.figure(g, 700, 0, 1, -1, RYAN, { hip: [0, -240], lean: lerp(0.02, 0.15, take) * (1 - back), legN: { foot: [100, 0] }, legF: { foot: [74, 0] },
      armN: { hand: rHand, grip: t >= tGive ? 'hold' : 'open', item: t >= tGive ? phoneIt : null }, armF: { hand: [80, -300], grip: 'relax' },
      face: R.expr(t < tGive ? 'thinking' : 'neutral', { look: [1, t < tGive ? 0.4 : 0], blink: blink(lt, 3) }), headTilt: -0.04 }), { rim: RIM_W });
  });
  label(ctx, 'RYAN BLOCK', 720, 760, pop(t, tRyan + 0.05), { arrow: 1, arrowX: 40, size: 58, col: C.yellow });
  LT.grade(ctx, 'evening', { vignette: 0.2 });
});

// C1 (s05 "Ryan hits record."): extreme close-up — his finger comes down on a big red REC button; the red light fills the frame
shot('C1 record', ST.s05 - 0.12, ST.s06 - 0.12, (ctx, t, lt) => {
  ctx.fillStyle = '#2A2438'; ctx.fillRect(0, 0, W, H);
  halfPass(ctx, 16, g => layer(g, { x: 600, y: -800, z: 1.2 }, 1, w => S.apartment(w, t, { sofa: false, table: false })));
  ctx.fillStyle = 'rgba(30,20,50,0.45)'; ctx.fillRect(0, 0, W, H);
  const press = k(t, tRec - 0.3, tRec, E.in), on = t > tRec, z = 1 + lt * 0.05;
  ctx.save(); ctx.translate(540, 1080); ctx.scale(z, z);
  CL.cutout(ctx, () => rr(ctx, -330, -230, 660, 460, 50), '#3A3F48', { elev: 2, tex: 0.2 });
  ell(ctx, 0, 10, 200, 200); R.fillStroke(ctx, '#20232A', 6);
  const dn = press * 16; ell(ctx, 0, 10 + dn, 170, 170); R.fillStroke(ctx, on ? '#FF4455' : C.red, 6); ell(ctx, -50, -40 + dn, 60, 36, -0.5); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fill();
  txt(ctx, 'REC', 0, 44 + dn, 100, '#FFFDF8');
  ctx.restore();
  if (on) { LT.glow(ctx, 540, 1090, 900, 'rgba(255,60,70,1)', 0.35 * (1 - 0.5 * seg(t, tRec, tRec + 0.8))); }
  // his finger (from the upper right)
  const fy = lerp(560, 930, press), fx = lerp(930, 640, press);
  LT.lit(ctx, c => { R.tube(c, [[1250, 200], [fx + 140, fy - 160]], 120, RYAN.top, 5); R.hand(c, [fx + 90, fy - 110], 2.3, RYAN.skin, 'point', { size: 3.2 }); }, { rim: RIM_W });
  LT.grade(ctx, 'evening', { vignette: 0.25 });
});
// C2a (s06 "Why is it that you're not wanting to have..."): the employee's side: the question leaves his headset as a big bubble
const tNumber = at('s06', 'number');
const Q6 = ['“Why is it that you’re', 'not wanting to have the', 'number one rated', 'internet service?”'];
shot('C2 question', ST.s06 - 0.12, tNumber - 0.12, (ctx, t, lt) => {
  ccBg(-300, -1200, 1.0, 11)(ctx, t);
  repShot(ctx, t, lt, { x: 620, y: 1380, s: 1.35, talk: 1 });
  const u = pop(t, ST.s06, 0.35, 2); if (u > 0) { ctx.save(); ctx.translate(520, 800 - lt * 10); ctx.scale(u, u); ctx.rotate(-0.02); S.quoteBubble(ctx, Q6.slice(0, 2), { w: 900, size: 66, tail: [160, 200] }); ctx.restore(); }
  note(ctx, 'FROM THE RECORDING', 452, u);
  LT.grade(ctx, 'office', { vignette: 0.2 });
});
// C2b (s06 "...number one rated internet service?"): Ryan holds the phone a little away from his ear; a #1 trophy pops out of it; he squints
shot('C2 trophy', tNumber - 0.12, ST.s07 - 0.12, (ctx, t, lt) => {
  const away = k(t, tNumber - 0.1, tNumber + 0.4);
  verBust(ctx, lt, c => aptBg(700, -900, 1.2, 13, { clock: callMin(t) })(c, t), { L: RYAN, x: 440, ny: 1560, s: 2.5, push: 0.02,
    face: R.exprMix('neutral', R.expr('squint', { look: [0.6, -0.3] }), away), tilt: lerp(-0.04, -0.12, away),
    hands: [{ ...EARH, hand: [lerp(104, 190, away), lerp(-66, -40, away)], item: phoneAtEar(1, lerp(0.15, 0.6, away)) }] });
  const tu = pop(t, tNumber + 0.05, 0.4, 2.2); if (tu > 0) { ctx.save(); ctx.translate(820, 1040 - tu * 40); ctx.rotate(0.1 + Math.sin(lt * 3) * 0.03); ctx.scale(tu * 0.85, tu * 0.85); S.trophy(ctx, 1); ctx.restore(); LT.glow(ctx, 820, 800, 300, 'rgba(255,220,120,1)', 0.3 * tu); }
  ctx.save(); ctx.translate(540, 700); ctx.scale(0.82, 0.82); S.quoteBubble(ctx, Q6.slice(2), { w: 900, size: 72, tail: [300, 260], hl: { 0: 'rgba(255,200,87,0.9)' } }); ctx.restore();
  note(ctx, 'FROM THE RECORDING', 452);
  LT.grade(ctx, 'evening', { vignette: 0.2 });
});
// C3a (s07 "Ryan: This phone call is a really, actually,"): Ryan close-up, calm, speaking slowly into the phone
const tAmazing = at('s07', 'amazing'), tWhy7 = at('s07', 'why');
shot('C3 ryan', ST.s07 - 0.12, tAmazing - 0.12, (ctx, t, lt) => {
  verBust(ctx, lt, c => aptBg(800, -1000, 1.3, 14, { clock: callMin(t) })(c, t), { L: RYAN, x: 520, ny: 1520, s: 2.85, push: 0.035,
    face: R.expr('neutral', { look: [-0.3, 0.1], blink: blink(lt, 2.5), mouth: 'talk', talk: talk(t, 0.55), lid: [0.3, 0.3], brow: [-0.1, -0.1] }), tilt: 0.03,
    hands: [{ ...EARH, item: phoneAtEar() }] });
  note(ctx, 'FROM THE RECORDING', 452);
  LT.grade(ctx, 'evening', { vignette: 0.2 });
});
// C3b (s07 "...amazing representative example of"): he turns to us, deadpan; behind him Veronica, arms folded, one eyebrow up
shot('C3 deadpan', tAmazing - 0.12, tWhy7 - 0.12, (ctx, t, lt) => {
  aptBg(400, -1000, 1.2, 14, { clock: callMin(t) })(ctx, t);
  LT.lit(ctx, c => R.bust(c, 850, 1250, 1.6, VER, { face: R.expr('smug', { look: [-0.7, 0], blink: blink(lt, 2.9) }), headTilt: 0.08,
    hands: [{ side: -1, hand: [60, 200], grip: 'relax' }, { side: 1, hand: [-60, 220], grip: 'relax' }] }), { rim: RIM_W });
  ctx.save(); ctx.filter = 'blur(2px)'; ctx.restore();
  verBust(ctx, lt, () => {}, { L: RYAN, x: 420, ny: 1600, s: 2.7, push: 0.02,
    face: R.expr('neutral', { look: [0, 0.05], blink: blink(lt, 3.5), mouth: 'talk', talk: talk(t, 0.5), lid: [0.38, 0.38] }), tilt: 0,
    hands: [{ ...EARH, item: phoneAtEar() }] });
  note(ctx, 'FROM THE RECORDING', 452);
  LT.grade(ctx, 'evening', { vignette: 0.2 });
});
// C3c (s07 "...why I don't want to stay with Comcast."): the employee's WHY? bubble sags... and puffs up again
shot('C3 reinflate', tWhy7 - 0.12, ST.s08 - 0.12, (ctx, t, lt) => {
  ccBg(-200, -1150, 1.0, 11)(ctx, t);
  repShot(ctx, t, lt, { x: 560, y: 1300, s: 1.5, talk: t > end('s07') - 0.2 ? 1 : 0.2 });
  const sag = k(t, tWhy7, tWhy7 + 0.7), re = k(t, end('s07') - 0.15, end('s07') + 0.3, E.out);
  ctx.save(); ctx.translate(560, 820 + sag * 70 * (1 - re)); ctx.scale(1.35 * (1 - 0.35 * sag + 0.45 * re), 1.35 * (1 - 0.35 * sag + 0.45 * re)); S.whyBubble(ctx, { squash: sag * (1 - re), label: 'WHY?' }); ctx.restore();
  LT.grade(ctx, 'office', { vignette: 0.22 });
});

// D1a (s08 "Eighteen minutes in all."): the phone in his hand, the timer races to 18:00 and the call ends
shot('D1 18 minutes', ST.s08 - 0.12, tFinally - 0.12, (ctx, t, lt) => {
  aptBg(-600, -900, 1.3, 16, { clock: callMin(t) })(ctx, t);
  ctx.fillStyle = 'rgba(30,20,50,0.25)'; ctx.fillRect(0, 0, W, H);
  const z = 1 + lt * 0.03, sh = shake(t, tAll + 0.1, 12);
  ctx.save(); ctx.translate(540 + sh, 1060); ctx.scale(z, z);
  LT.lit(ctx, c => { R.tube(c, [[300, 900], [80, 380]], 170, RYAN.top, 5); R.hand(c, [40, 300], -1.75, RYAN.skin, 'hold', { size: 3.4 }); }, { rim: RIM_W });
  S.phone(ctx, 1.75, { min: callMin(t), rec: true, ended: ended(t) });
  ctx.restore();
  if (ended(t)) { const u = pop(t, tAll + 0.15, 0.3, 2.6); ctx.save(); ctx.translate(540, 620); ctx.rotate(-0.05); ctx.scale(u, u); CL.cutout(ctx, () => rr(ctx, -300, -70, 600, 120, 16), C.red, { elev: 1.6 }); txt(ctx, '18 MINUTES', 0, 22, 84, '#FFFDF8'); ctx.restore(); }
  LT.grade(ctx, 'evening', { vignette: 0.22 });
});
// D1b (s08 "Finally... disconnected."): both drop onto the sofa; the WHY? bubbles fall; Veronica squints at the phone — did it really work?
shot('D1 sofa', tFinally - 0.12, ST.s09 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, -330, -600, 0.82], [2, -330, -590, 0.88]], lt), drop = E.out(seg(t, tFinally - 0.1, tFinally + 0.45)), dU = seg(t, tDisc - 0.1, tDisc + 0.4);
  ctx.fillStyle = '#E9DCC6'; ctx.fillRect(0, 0, W, H);
  layer(ctx, c, 1, w => {
    S.apartment(w, t, { clock: 18, steam: 0, desk: false });
    const bump = Math.sin(seg(t, tFinally + 0.2, tFinally + 0.6) * Math.PI) * 20;
    LT.lit(w, g => R.figure(g, -170, bump, 1, -1, RYAN, { hip: [0, lerp(-330, -245, drop)], lean: lerp(0, -0.22, drop), legN: { foot: [80, 0] }, legF: { foot: [56, 0] },
      armN: { hand: [lerp(40, 160, drop), lerp(-560, -260, drop)], grip: 'hold', item: c2 => { c2.save(); c2.translate(0, -20); S.phone(c2, 0.14, { min: 18, ended: true, rec: true }); c2.restore(); } }, armF: { hand: [-120, -500 + drop * 120], grip: 'open' },
      face: R.exprMix('neutral', R.expr('happy', { look: [0, -0.5] }), drop), headTilt: -0.15 * drop }), { rim: RIM_W });
    verSofa(w, t, lt, R.exprMix(R.expr('tired', { look: [0.6, 0.5] }), R.expr('squint', { look: [1, 0.6] }), dU), { x: -640, lean: -0.15, tilt: 0.12 + 0.1 * dU,
      armN: { hand: [110, -330], grip: 'relax' } });
  });
  whyPile(ctx, t, 14, [100, 560, 980, 1350], { t0: -10, dt: 0, s: 0.85, fall: tFinally - 0.1 });
  if (dU > 0) { const u = pop(t, tDisc + 0.25, 0.3, 2.4); ctx.save(); ctx.translate(300, 900); ctx.rotate(0.08); ctx.scale(u * 1.3, u * 1.3); S.whyBubble(ctx, { label: '?', fg: '#2E3A59' }); ctx.restore(); }
  LT.grade(ctx, 'evening', { vignette: 0.2 });
});

// D2 (s09 "Veronica still went to a Comcast store to double-check."): daylight — she walks up to the counter; the screen turns: DISCONNECTED
const tDouble = at('s09', 'double-check');
shot('D2 store', ST.s09 - 0.12, ST.s10 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, -150, -700, 1.0], [3.2, -170, -680, 1.08]], lt), arrive = lerp(ST.s09, tDouble, 0.55), wk = seg(t, ST.s09 - 0.12, arrive), vx = lerp(-900, -430, wk), stop = t > arrive;
  ctx.fillStyle = '#F2EEE6'; ctx.fillRect(0, 0, W, H);
  halfPass(ctx, 5, g => layer(g, c, 1, w => S.store(w, t)));
  const st = seg(t, tDouble, tDouble + 0.7);
  layer(ctx, c, 1, w => {
    LT.lit(w, g => R.figure(g, 240, -230, 1, -1, CLERK, { armN: { hand: [lerp(70, 180, st), -320], grip: 'open' }, armF: { hand: [-20, -300] }, face: R.expr(st > 0.6 ? 'smile' : 'neutral', { look: [1, 0.1], blink: blink(lt, 2.7) }) }), { rim: RIM_DAY });
    S.storeCounter(w, -40, 0, t, { status: st });
    const P = stop ? { hip: [0, -254], lean: 0.02, legN: { foot: [24, 0] }, legF: { foot: [-22, 0] }, armN: { hand: [100, -280], grip: 'relax' }, armF: { hand: [-10, -200] } } : R.walk(t * 7.5);
    LT.castShadow(w, g => R.figure(g, vx, 0, 1, 1, VER, P), { x: vx, floorY: 0, a: 0.2, blur: 3 });
    LT.lit(w, g => R.figure(g, vx, 0, 1, 1, VER, { ...P, face: st > 0.7 ? R.expr('happy', { look: [1, 0] }) : R.expr('skeptical', { look: [1, 0], blink: blink(lt, 2.3) }), headTilt: st > 0.7 ? -0.08 : 0.04 }), { rim: RIM_DAY });
  });
  LT.grade(ctx, 'day', { vignette: 0.15 });
});

// E1a (s10 "Ryan posted the recording."): the laptop screen, close — the audio clip (8:15) and the POST button; his click sends it off
const tViral = at('s10', 'viral'), tPosted = at('s10', 'posted');
shot('E1 post', ST.s10 - 0.12, tPosted + 0.5, (ctx, t, lt) => {
  ctx.fillStyle = '#2A2438'; ctx.fillRect(0, 0, W, H);
  halfPass(ctx, 14, g => layer(g, { x: 900, y: -900, z: 1.3 }, 1, w => S.apartment(w, t, { sofa: false, table: false })));
  const fly = k(t, tPosted + 0.1, tPosted + 0.5, E.in), z = 1 + lt * 0.03;
  ctx.save(); ctx.translate(540, 1000); ctx.scale(z, z);
  CL.cutout(ctx, () => rr(ctx, -470, -330, 940, 640, 30), '#3A3F48', { elev: 2, tex: 0.1 });
  ctx.save(); rr(ctx, -440, -300, 880, 580, 10); ctx.clip(); ctx.fillStyle = '#EEF1F6'; ctx.fillRect(-440, -300, 880, 580); ctx.fillStyle = '#2E3A59'; ctx.fillRect(-440, -300, 880, 70); txt(ctx, 'NEW POST', -400, -252, 34, '#FFFDF8', 'left');
  txt(ctx, 'Comcastic service', -400, -170, 44, INK, 'left');
  if (fly < 1) { ctx.save(); ctx.translate(lerp(0, 300, fly), lerp(-30, -900, fly)); ctx.scale(1 - 0.5 * fly, 1 - 0.5 * fly); ctx.rotate(-0.2 * fly); ctx.translate(-400, -80); S.audioCard(ctx, 800, 150, t, { prog: 0 }); ctx.restore(); }
  const pr = t > tPosted - 0.05 && t < tPosted + 0.2; rr(ctx, 160, 130, 240, 100, 18); ctx.fillStyle = pr ? '#F2602B' : '#FF7A45'; ctx.fill(); txt(ctx, 'POST', 280, 198, 52, '#FFFDF8');
  ctx.restore(); ctx.restore();
  const cx = lerp(820, 800, k(t, ST.s10, tPosted)), cy = lerp(1500, 1230, k(t, ST.s10, tPosted - 0.05)), dn = t > tPosted - 0.05 && t < tPosted + 0.2 ? 12 : 0;
  ctx.save(); ctx.translate(cx, cy + dn); ctx.rotate(-0.3); ctx.fillStyle = '#FFFDF8'; ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 70); ctx.lineTo(18, 54); ctx.lineTo(32, 84); ctx.lineTo(44, 78); ctx.lineTo(30, 50); ctx.lineTo(54, 50); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  LT.grade(ctx, 'evening', { vignette: 0.22 });
});
// E1b (s10 "It went viral."): the same clip in hand after hand after hand — the grid keeps growing
shot('E1 viral', tPosted + 0.5, ST.s11 - 0.12, (ctx, t, lt) => {
  ctx.fillStyle = '#F7F5F0'; ctx.fillRect(0, 0, W, H);
  const n = 9, z = lerp(1.25, 0.45, k(lt, 0.15, 1.6, E.inOut)), sp = 380;
  ctx.save(); ctx.translate(540, 1000);
  const sk = ['#F0C3A2', '#8D5A3C', '#E8B48F', '#C88A64', '#6E4630', '#F4D2B8'], sl = ['#E63946', '#4D8DFF', '#3E9E8A', '#FFC857', '#9B6BC4', '#2E3A59'];
  ctx.scale(z, z);
  for (let r = -Math.floor(n / 2); r <= Math.floor(n / 2); r++) for (let cI = -Math.floor(n / 2); cI <= Math.floor(n / 2); cI++) {
    const i = (r + 5) * 11 + cI + 5, d = Math.max(Math.abs(r), Math.abs(cI)), u = pop(t, tPosted + 0.5 + (d === 0 ? 0 : 0.25 + d * 0.13) + K.hash(i) * 0.1, 0.3, 2.2); if (u <= 0) continue;
    ctx.save(); ctx.translate(cI * sp * 1.25, r * sp * 1.6); ctx.scale(u * 1.9, u * 1.9); ctx.rotate((K.hash(i) - 0.5) * 0.2);
    S.handPhone(ctx, 1, sk[i % 6], sl[(i * 7) % 6], (c, w, h) => { c.fillStyle = '#EEF1F6'; c.fillRect(0, 0, w, h); c.save(); c.translate(0, h / 2 - 50); S.audioCard(c, w, 100, t, { prog: (t * 0.2 + K.hash(i)) % 1 }); c.restore(); }, t);
    ctx.restore(); }
  ctx.restore();
  LT.grade(ctx, 'day', { vignette: 0.14 });
});

// F1 (s11 "Comcast apologized."): under a spotlight at his desk, the employee slumps as the company's statement comes down
const tNot = at('s11', 'not'), tTrain = at('s11', 'train');
shot('F1 apology', ST.s11 - 0.12, tNot - 0.3, (ctx, t, lt) => {
  ccBg(0, -1150, 0.95, 12, { lightA: 0.4 })(ctx, t);
  ctx.fillStyle = 'rgba(20,24,40,0.45)'; ctx.fillRect(0, 0, W, H);
  const sl = k(t, ST.s11 + 0.2, tNot - 0.4);
  repShot(ctx, t, lt, { x: 540, y: 1330, s: 1.45, slump: sl, talk: 0 });
  LT.glow(ctx, 540, 900, 600, 'rgba(255,245,220,1)', 0.25);
  const dropU = E.out(seg(t, ST.s11 - 0.1, ST.s11 + 0.5)); ctx.save(); ctx.translate(560, lerp(-300, 720, dropU)); ctx.rotate(lerp(0.4, -0.04, dropU));
  S.sheet(ctx, 700, 420, [{ s: 'COMCAST STATEMENT', y: -130, size: 52, col: C.red }, { s: '“We are very embarrassed by', y: -30, size: 42 }, { s: 'the way our employee spoke…”', y: 30, size: 42 }, { s: 'JULY 2014', y: 150, size: 30, col: '#5A5450' }]); ctx.restore();
  LT.grade(ctx, 'office', { vignette: 0.26 });
});
// F2 (s11 "How the employee spoke was 'not consistent with how we train.'"): the statement, close: the line lights up word by word
shot('F2 statement', tNot - 0.3, ST.s12 - 0.12, (ctx, t, lt) => {
  ccBg(-300, -1000, 1.3, 16, { lightA: 0.4 })(ctx, t); ctx.fillStyle = 'rgba(20,24,40,0.3)'; ctx.fillRect(0, 0, W, H);
  const z = 1.0 + lt * 0.04; ctx.save(); ctx.translate(540, 930 + Math.sin(lt * 1.2) * 6); ctx.scale(z, z); ctx.rotate(-0.025);
  S.sheet(ctx, 900, 880, [{ s: 'COMCAST STATEMENT · JULY 2014', y: -340, size: 40, col: C.red },
    { s: '“The way in which our', y: -220, size: 56 }, { s: 'representative communicated', y: -150, size: 56 }, { s: 'with them is unacceptable and', y: -80, size: 56 },
    { s: 'not consistent', y: 20, size: 92, hl: C.yellow, hlT: k(t, tNot - 0.05, tNot + 0.35) }, { s: 'with how we train', y: 120, size: 92, hl: C.yellow, hlT: k(t, tTrain - 0.4, tTrain + 0.2) },
    { s: 'our customer service', y: 210, size: 56 }, { s: 'representatives.”', y: 280, size: 56 }, { s: '— Comcast, statement to the press', y: 370, size: 32, col: '#5A5450' }]);
  ctx.restore();
  LT.grade(ctx, 'office', { vignette: 0.2 });
});
// F3 (s12 "Ryan asked them not to fire him."): Ryan types; his public reply flies out: "...and not the termination of the rep."
shot('F3 dont fire', ST.s12 - 0.12, ST.s13 - 0.12, (ctx, t, lt) => {
  const ty = Math.sin(t * 15) * 10 * (1 - seg(t, ST.s12 + 0.9, ST.s12 + 1.1));
  verBust(ctx, lt, c => aptBg(900, -900, 1.2, 14)(c, t), { L: RYAN, x: 540, ny: 1560, s: 2.3, push: 0.02,
    face: R.expr('worried', { look: [0, 0.7], blink: blink(lt, 2.8), brow: [0.4, 0.4] }), tilt: 0.06, glow: { x: 540, y: 1700, r: 700, color: 'rgb(170,200,255)', a: 0.3 },
    hands: [{ side: 1, hand: [110, 420 + ty], grip: 'relax' }, { side: -1, hand: [-110, 420 - ty], grip: 'relax' }] });
  CL.cutout(ctx, () => rr(ctx, 170, 1620, 740, 420, 26), '#B8BEC8', { elev: 2, tex: 0.1 }); ell(ctx, 540, 1780, 46, 46); ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fill();
  const u = pop(t, ST.s12 + 0.25, 0.35, 2); if (u > 0) { ctx.save(); ctx.translate(540, 720 - k(t, ST.s12 + 0.3, ST.s13) * 60); ctx.scale(u, u); ctx.rotate(-0.03);
    S.quoteBubble(ctx, ['“…a thorough evaluation of your', 'culture and policies, and', 'not the termination of the rep.”'], { w: 940, size: 54, tail: [0, 230], hl: { 2: 'rgba(255,200,87,0.9)' } }); ctx.restore(); }
  note(ctx, 'RYAN BLOCK, ON TWITTER · JULY 15, 2014', 452, u);
  LT.grade(ctx, 'evening', { vignette: 0.2 });
});

// G1 (s13 "A week later, an internal memo from Comcast's COO"): the executive office at dusk; an envelope marked INTERNAL on the big desk
const tLeaked = at('s13', 'leaked'), tWeek = at('s13', 'week');
shot('G1 office', ST.s13 - 0.12, tLeaked - 0.2, (ctx, t, lt) => {
  const c = cam([[0, -100, -700, 0.62], [3.4, 120, -560, 0.95]], lt);
  ctx.fillStyle = '#7A5636'; ctx.fillRect(0, 0, W, H);
  layer(ctx, c, 1, w => {
    S.execOffice(w, t);
    // the desk, a lamp, the empty leather chair behind it
    rr(w, -500, -1000, 420, 560, 60); R.fillStroke(w, '#3A2014', 5);
    rr(w, -900, -440, 1200, 70, 12); R.fillStroke(w, '#4A2A18', 5); w.fillStyle = '#3A2014'; w.fillRect(-880, -370, 1160, 370);
    w.save(); w.translate(160, -440); w.strokeStyle = INK; w.lineWidth = 12; w.beginPath(); w.moveTo(0, 0); w.lineTo(0, -260); w.stroke(); w.beginPath(); w.moveTo(-90, -260); w.lineTo(90, -260); w.lineTo(60, -360); w.lineTo(-60, -360); w.closePath(); R.fillStroke(w, '#3E9E6A', 5); w.restore();
    LT.glow(w, 160, -300, 500, 'rgba(255,220,150,1)', 0.35);
    w.save(); w.translate(-300, -470); w.scale(1, 0.45); S.envelope(w, 0.8, { elev: 0.6 }); w.restore();
  });
  label(ctx, 'A WEEK LATER · JULY 21, 2014', 540, 470, pop(t, tWeek - 0.05), { size: 46, col: '#171717', fg: C.yellow });
  label(ctx, 'FROM THE COO', 540, 1180, pop(t, at('s13', 'coo')), { size: 52, col: C.yellow });
  LT.grade(ctx, 'golden', { vignette: 0.24 });
});
// G2 (s13 "...leaked."): the envelope slides across the floor and out under the door, into the light
shot('G2 leak', tLeaked - 0.2, ST.s14 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 900, -200, 1.0], [1.2, 1000, -180, 1.08]], lt), u = E.inOut(seg(t, tLeaked - 0.2, ST.s14 - 0.3));
  ctx.fillStyle = '#7A5636'; ctx.fillRect(0, 0, W, H);
  layer(ctx, c, 1, w => {
    S.execOffice(w, t);
    w.save(); w.translate(lerp(350, 1350, u), -60 * (1 - u) - 8); w.scale(1, lerp(0.75, 0.3, u)); w.rotate(-0.1 + u * 0.1); S.envelope(w, 0.9, { elev: 0.5 }); w.restore();
    w.fillStyle = '#5A3A22'; w.fillRect(770, -1500, 660, 1486); // the door in front of the envelope (it slides under it)
    w.fillStyle = '#FFF4D0'; w.fillRect(770, -14, 660, 14);
  });
  LT.glow(ctx, 1000, 1150, 600, 'rgba(255,240,200,1)', 0.25 + 0.3 * u);
  label(ctx, 'LEAKED', 540, 560, pop(t, tLeaked), { size: 88, col: C.red, fg: '#FFFDF8' });
  LT.grade(ctx, 'golden', { vignette: 0.24 });
}, { type: 'tear', dur: 0.4, at: () => [800, 1150] });
// G3 (s14 "The employee, it said, 'did a lot of what we trained him and paid him... to do.'"): the memo itself; TRAINED and PAID light up and lift off the page
const tTrained = at('s14', 'trained'), tPaid = at('s14', 'paid');
shot('G3 memo', ST.s14 - 0.12, ST.s15 - 0.12, (ctx, t, lt) => {
  ctx.fillStyle = '#4A2A18'; ctx.fillRect(0, 0, W, H); LT.glow(ctx, 540, 700, 1100, 'rgba(255,220,150,1)', 0.3);
  const inU = E.out(seg(lt, 0, 0.6)), z = 0.84 + lt * 0.02, py = lerp(1900, 1075, inU) - lt * 5; ctx.save(); ctx.translate(540 + Math.sin(lt * 0.8) * 8, py); ctx.scale(z, z); ctx.rotate(lerp(0.12, 0.02, inU) + Math.sin(lt * 0.6) * 0.008);
  const tr = k(t, tTrained - 0.05, tTrained + 0.3), pd = k(t, tPaid - 0.05, tPaid + 0.3);
  S.sheet(ctx, 940, 1080, [{ s: 'MEMO', y: -440, size: 70, col: '#2E3A59', align: 'left', x: -420 }, { s: 'FROM: CHIEF OPERATING OFFICER, COMCAST CABLE', y: -380, size: 26, col: '#5A5450', align: 'left', x: -420 },
    { s: 'JULY 21, 2014 · INTERNAL', y: -340, size: 26, col: C.red, align: 'left', x: -420 },
    { s: '“The agent on this call', y: -210, size: 62 }, { s: 'did a lot of what we', y: -130, size: 62 },
    { s: 'TRAINED him', y: -20, size: 104, hl: C.yellow, hlT: tr }, { s: 'and PAID him', y: 100, size: 104, hl: C.yellow, hlT: pd },
    { s: '— and thousands of other', y: 200, size: 40, col: '#5A5450' }, { s: 'Retention agents —', y: 250, size: 40, col: '#5A5450' }, { s: 'to do.”', y: 350, size: 62 }]);
  ctx.restore();
  note(ctx, 'INTERNAL MEMO · AS PUBLISHED IN JULY 2014', 336);
  // the two words lift off the page and park above it (they come back in the reveal)
  const flyW = (s, t0, x) => { const u = k(t, t0 + 0.25, t0 + 0.75, E.out); if (u <= 0) return; ctx.save(); ctx.translate(lerp(540, x, u), lerp(1040, 500, u)); ctx.rotate(lerp(0, x < 540 ? -0.08 : 0.08, u)); label(ctx, s, 0, 0, lerp(1.4, 1, u), { size: 76, col: C.yellow }); ctx.restore(); };
  flyW('TRAINED', tTrained, 330); flyW('PAID', tPaid, 790);
  LT.grade(ctx, 'golden', { vignette: 0.2 });
});
// G4 (s15 "It added: keeping a customer must be done with respect."): the memo pinned up over the call-centre floor; the respect line, highlighted
const tRespect = at('s15', 'respect');
shot('G4 respect', ST.s15 - 0.12, ST.s16 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -1640, 1.1], [3.2, 0, -1500, 0.95]], lt);
  ctx.fillStyle = '#D6DEE8'; ctx.fillRect(0, 0, W, H);
  layer(ctx, c, 1, w => {
    S.callCentre(w, t, { sign: 0, rows: 2 });
    // cork board with the memo
    w.save(); w.translate(0, -1700); CL.cutout(w, () => rr(w, -560, -380, 1120, 760, 16), '#C99A64', { elev: 1.2, tex: 0.6 });
    S.sheet(w, 760, 640, [{ s: 'MEMO · JULY 21, 2014', y: -250, size: 40, col: '#2E3A59' }, { s: '“…saving a customer', y: -120, size: 58 }, { s: 'must always be handled', y: -40, size: 58 },
      { s: 'with the utmost respect.”', y: 50, size: 58, hl: 'rgba(124,226,160,0.85)', hlT: k(t, tRespect - 0.4, tRespect + 0.2) }, { s: '“We fell short.”', y: 190, size: 52, col: C.red }], { elev: 1 });
    for (const [x, y] of [[-360, -300], [360, -300]]) { ell(w, x, y, 18, 18); R.fillStroke(w, C.red, 4); }
    w.restore();
  });
  LT.grade(ctx, 'office', { vignette: 0.18 });
});

// H (s16 "One employee was on the line." + s17 "Behind him... the training. And the pay."): the reveal — the camera follows his cord down
// through the floor: it runs through a giant TRAINING binder and into the PAY envelope; then it pulls back: every desk on the floor is wired the same way.
const tLine = at('s16', 'line'), tBehind = ST.s17, tTraining = at('s17', 'training'), tPay = at('s17', 'pay'), tPull = end('s17') + 0.1, tLoop = end('s17') + 1.25;
const ROWS = [[0, 1], [-330, 0.78], [-620, 0.61], [-880, 0.47]];
function deskMini(ctx, x, y, s, t, i) { // a desk seen from behind (partition, monitor glow), feet line at y
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rr(ctx, -520, -900, 1040, 60, 8); R.fillStroke(ctx, '#8796AA', 4.5); for (const sx of [-1, 1]) { rr(ctx, sx * 520 - 18, -900, 36, 900, 8); R.fillStroke(ctx, '#9AA8BA', 4.5); }
  ctx.save(); ctx.translate(0, -560); rr(ctx, -260, -190, 520, 270, 14); R.fillStroke(ctx, '#20232A', 5); ctx.fillStyle = '#BFD4F2'; rr(ctx, -240, -170, 480, 230, 6); ctx.fill(); ctx.restore();
  rr(ctx, -520, -320, 1040, 44, 8); R.fillStroke(ctx, '#A6B2C2', 5); ctx.fillStyle = '#7F8B9C'; ctx.fillRect(-500, -276, 1000, 276);
  ctx.restore();
}
function revealWorld(w, t, o) {
  // under the floor: a dark cut-away where all the cords run
  const g = w.createLinearGradient(0, 0, 0, 2400); g.addColorStop(0, '#1E2436'); g.addColorStop(1, '#141826'); w.fillStyle = g; w.fillRect(-4000, 0, 8000, 2600);
  w.fillStyle = 'rgba(255,255,255,0.04)'; for (let x = -4000; x < 4000; x += 300) w.fillRect(x, 0, 6, 2600);
  // everyone's cords come down through the floor and converge into one trunk -> through the binder rings -> into the pay envelope
  const xs = []; for (let i = 0; i < 26; i++) xs.push(-2400 + i * 192 + (K.hash(i) - 0.5) * 60);
  xs.forEach((x, i) => { if (Math.abs(x) < 90) return; S.cord(w, [[x, -10], [x, 200], [x * 0.55, 430], [(K.hash(i) - 0.5) * 60, 700], [(K.hash(i) - 0.5) * 50, 950], [(K.hash(i) - 0.5) * 50, 1200], [(K.hash(i) - 0.5) * 70, 1720]], { w: 8, col: '#7D879B' }); });
  w.save(); w.translate(330, 950); S.binder(w, 1.1, { label: 'TRAINING' }); w.restore();
  for (const y of [700, 950, 1200]) S.binderRing(w, 0, y, 70, 1);
  w.save(); w.translate(0, 1930); S.payEnvelope(w, 1.35, { label: 'PAY' }); w.restore();
  // the floor slab (torn paper edge)
  CL.tornSheet(w, -4000, 4000, -30, 70, '#6E7888', 9);
  // the call-centre floor above: back rows first
  w.save(); w.beginPath(); w.rect(-4000, -4000, 8000, 3990); w.clip();
  const ccg = w.createLinearGradient(0, -2600, 0, 0); ccg.addColorStop(0, '#C6D0DC'); ccg.addColorStop(1, '#8C97A6'); w.fillStyle = ccg; w.fillRect(-4000, -2900, 8000, 2900);
  w.save(); w.translate(0, -1650); w.strokeStyle = INK; w.lineWidth = 7; w.beginPath(); w.moveTo(-360, -90); w.lineTo(-360, 0); w.moveTo(360, -90); w.lineTo(360, 0); w.stroke();
  CL.cutout(w, () => rr(w, -520, 0, 1040, 210, 18), S.NAVY, { elev: 1.4, tex: 0.2 }); txt(w, 'RETENTION', 0, 146, 124, '#FFFDF8'); w.restore();
  for (let r = ROWS.length - 1; r >= 0; r--) { const [fy, s] = ROWS[r];
    for (let i = -4; i <= 4; i++) { const x = i * 1120 * s + (r % 2) * 560 * s; if (r === 0 && i === 0) continue;
      deskMini(w, x, fy, s, t, i); const st = S.STAFF[(i + 8 + r * 3) % S.STAFF.length];
      const cs = S.repBack(w, x, fy - 460 * s, 0.92 * s, { top: st[0], hair: st[1], skin: st[2], t: t + i * 0.7, talk: 0.7 });
      S.cord(w, [cs, [cs[0] - 90 * s, cs[1] + 200 * s], [cs[0] - 130 * s, fy - 60 * s], [cs[0] - 100 * s, fy + 20]], { w: 7 * s }); } }
  // our employee, front row centre (in a soft spotlight)
  deskMini(w, 0, 0, 1, t, 0);
  LT.glow(w, 0, -500, 700, 'rgba(255,245,220,1)', 0.3 * (o.spot ?? 1));
  let cs; LT.lit(w, g2 => { cs = S.repBack(g2, 0, -460, 0.92, { t, talk: o.talk ?? 0.6 }); }, { rim: { dir: [0, -1], color: '#FFF3D8', w: 7, a: 0.85 } });
  w.restore();
  S.cord(w, [cs, [cs[0] - 90, cs[1] + 120], [cs[0] - 170, -200], [cs[0] - 120, -20], [-40, 200], [0, 460], [0, 700], [0, 950], [0, 1200], [0, 1720]], { w: 13, coil: 3, col: '#E9EDF3' });
  for (const y of [700, 950, 1200]) { w.save(); w.beginPath(); w.rect(-120, y - 90, 240, 90); w.clip(); S.binderRing(w, 0, y, 70, 1); w.restore(); } // ring fronts over the trunk
}
shot('H reveal', ST.s16 - 0.12, tLoop, (ctx, t, lt) => {
  const L = t - (ST.s16 - 0.12), a = tBehind - (ST.s16 - 0.12), b = tTraining - (ST.s16 - 0.12), c2 = tPay - (ST.s16 - 0.12), d = tPull - (ST.s16 - 0.12);
  const c = cam([[0, 0, -520, 1.5], [a, 0, -480, 1.62], [a + 0.7, -40, 320, 1.55], [b + 0.1, 60, 930, 1.3], [c2 + 0.1, 0, 1800, 1.3], [d + 0.9, 0, 500, 0.6]], L);
  ctx.fillStyle = '#141826'; ctx.fillRect(0, 0, W, H);
  layer(ctx, c, 1, w => revealWorld(w, t, { spot: 1, talk: t < tBehind ? 0.6 : 0.3 }));
  const tu = pop(t, tTraining - 0.05, 0.3), pu = pop(t, tPay - 0.05, 0.3);
  if (t > tPull + 0.35) { const u = pop(t, tPull + 0.35, 0.4, 1.8); note(ctx, '“…and thousands of other Retention agents…” — COO memo', 452, u); }
  LT.grade(ctx, 'dark', { vignette: 0.22 });
  if (tu > 0 && t < tPay - 0.1) { ctx.save(); ctx.globalAlpha = 1 - seg(t, tPay - 0.4, tPay - 0.1); label(ctx, 'TRAINED', 540, 560, tu, { size: 80, col: C.yellow }); ctx.restore(); }
  if (pu > 0 && t < tPull + 0.3) label(ctx, 'PAID', 540, 560, pu, { size: 80, col: C.yellow });
});
// Z (loop): back on the phone: 18:00, the call has ended, REC still lit — the same screen the story started from
shot('Z loop', tLoop, T + 0.01, (ctx, t, lt) => {
  aptBg(-600, -900, 1.3, 16, { clock: 18 })(ctx, t); ctx.fillStyle = 'rgba(30,20,50,0.3)'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.translate(540, 1060); ctx.scale(1 + lt * 0.02, 1 + lt * 0.02); S.phone(ctx, 1.75, { min: 18, rec: true, ended: true }); ctx.restore();
  LT.grade(ctx, 'evening', { vignette: 0.22 });
});

// ---------- edit, global overlays, subtitles ----------
SH.sort((a, b) => a.t0 - b.t0);
const ED = makeEdit(SH, W, H);
const SPLIT = { s01: [3, 3], s02: [6], s03: [2, 3, 3], s04: [2, 3, 3, 4, 5], s05: [3], s06: [6, 3, 6], s07: [5, 4, 4, 7], s08: [4, 2], s09: [5, 4], s10: [4, 3], s11: [2, 5, 6], s12: [7], s13: [3, 3, 4], s14: [4, 7, 6], s15: [4, 6], s16: [6], s17: [2, 2, 3] };
const REPL = [[/^2014\.?/, '2014.']];
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
  headline(ctx, t); stampLabel(ctx, t); timerHUD(ctx, t);
  ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.26; ctx.drawImage(TEX, 0, 0); ctx.restore();
  EN.drawSubtitles(ctx, t, SUBS, { y: 1565, size: 62, maxW: 820, x: 540, highlight: ['why', 'eighteen', 'record', 'viral', 'trained', 'paid', 'respect', 'training', 'pay', 'disconnect'] });
}

// ---------- sound cues (for mix.py) ----------
function cues() {
  const c = [['room', 0, 1], ['ring', 0.05, 0.25], ['earpiece', 0.6, 0.6]];
  c.push(['cut', ST.s02 - 0.1, 0.35], ['office', ST.s02 - 0.1, 1]); for (let i = 0; i < 6; i++) c.push(['pop', ST.s02 + 0.05 + i * (at('s02', 'why') - ST.s02) / 6, 0.5]);
  c.push(['stamp', at('s02', 'why'), 0.7]);
  c.push(['cut', ST.s03 - 0.12, 0.35], ['room', ST.s03 - 0.1, 1], ['stamp', t2014, 0.6], ['tag', tVer + 0.05, 0.5], ['earpiece', tCalls, 0.5]);
  c.push(['cut', ST.s04 - 0.12, 0.3], ['earpiece', tAsks - 0.6, 0.4], ['cut', tAsks - 0.35, 0.3], ['pop', tAsks, 0.6], ['earpiece', tAsks, 0.5]);
  c.push(['cut', tTen - 0.12, 0.35], ['clockspin', tTen - 0.1, 0.7]); for (let i = 0; i < 14; i++) c.push(['pop', tTen - 0.12 + i * 0.06, 0.25]);
  c.push(['tick', tTen + 0.35, 0.8], ['cut', tHands - 0.25, 0.3], ['whoosh', tGive - 0.35, 0.35], ['grab', tGive, 0.7], ['tag', tRyan + 0.05, 0.5]);
  c.push(['cut', ST.s05 - 0.12, 0.3], ['click', tRec - 0.02, 0.9], ['recbeep', tRec + 0.02, 0.8], ['thump', tRec, 0.5]);
  c.push(['cut', ST.s06 - 0.12, 0.3], ['office', ST.s06 - 0.1, 0.8], ['pop', ST.s06, 0.5], ['cut', tNumber - 0.12, 0.3], ['sparkle', tNumber + 0.05, 0.6], ['tag', tNumber + 0.1, 0.4]);
  c.push(['cut', ST.s07 - 0.12, 0.3], ['room', ST.s07 - 0.1, 0.7], ['cut', tAmazing - 0.12, 0.25], ['cut', tWhy7 - 0.12, 0.3], ['deflate', tWhy7 + 0.05, 0.6], ['inflate', end('s07') - 0.15, 0.7]);
  c.push(['cut', ST.s08 - 0.12, 0.3]); for (let i = 0; i < 10; i++) c.push(['tick', ST.s08 + i * (tAll - ST.s08) / 10, 0.35]);
  c.push(['hangup', tAll + 0.12, 0.9], ['slam', tAll + 0.15, 0.5], ['cut', tFinally - 0.12, 0.3], ['sofa', tFinally + 0.25, 0.8]); for (let i = 0; i < 6; i++) c.push(['deflate', tFinally + i * 0.08, 0.25]);
  c.push(['cut', ST.s09 - 0.12, 0.35], ['chime', ST.s09, 0.6], ['steps', ST.s09, 0.5], ['flip', tDouble, 0.6], ['sparkle', tDouble + 0.45, 0.5]);
  c.push(['cut', ST.s10 - 0.12, 0.3], ['click', tPosted - 0.02, 0.7], ['whoosh', tPosted + 0.3, 0.45]); for (let i = 0; i < 8; i++) c.push(['ping', tViral - 0.1 + i * 0.17, 0.45 - i * 0.03]);
  c.push(['cut', ST.s11 - 0.12, 0.35], ['paper', ST.s11 + 0.2, 0.6], ['thump', ST.s11 + 0.45, 0.4], ['cut', tNot - 0.3, 0.3], ['marker', tNot, 0.5], ['marker', tTrain - 0.3, 0.5]);
  c.push(['cut', ST.s12 - 0.12, 0.3], ['typing', ST.s12 - 0.1, 0.6], ['whoosh', ST.s12 + 0.25, 0.35], ['pop', ST.s12 + 0.3, 0.4]);
  c.push(['cut', ST.s13 - 0.12, 0.35], ['clockroom', ST.s13 - 0.1, 0.5], ['tag', tWeek, 0.4], ['cut', tLeaked - 0.2, 0.3], ['slide', tLeaked - 0.15, 0.7], ['stamp', tLeaked, 0.5], ['tear', ST.s14 - 0.25, 0.7]);
  c.push(['marker', tTrained, 0.6], ['marker', tPaid, 0.6]);
  c.push(['cut', ST.s15 - 0.12, 0.3], ['office', ST.s15 - 0.1, 0.6], ['pin', ST.s15 + 0.1, 0.5], ['marker', tRespect - 0.35, 0.5]);
  c.push(['cut', ST.s16 - 0.12, 0.35], ['office', ST.s16 - 0.1, 0.7], ['zip', tBehind - 0.05, 0.7], ['zip', tTraining - 0.3, 0.6], ['clank', tTraining, 0.6], ['zip', tPay - 0.3, 0.6], ['clank', tPay, 0.6], ['rise', tPull - 0.3, 0.7], ['boom', tPull + 0.3, 0.6]);
  c.push(['hangup', tLoop, 0.5], ['recbeep', tLoop + 0.2, 0.4]);
  return c;
}
const MUSIC = { b0: 0, story: ST.s03, ten: tTen, record: ST.s05, end: ST.s08, store: ST.s09, apology: ST.s11, memo: ST.s13, reveal: ST.s16, hit: tPull + 0.3, T };

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
