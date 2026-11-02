// Episode 13 "Why the McDonald's ice cream machine is always broken" (How It's Run) — the nightly heat-cleaning cycle (~4 hours),
// a step that runs too long fails the cycle, cryptic error codes, the wait for an authorized technician, and the 2024 U.S. Copyright Office
// repair exemption. Twist: the problem wasn't the ice cream, it was who's allowed to fix the machine.
// Story world: "you" at the counter (angry, frame 0) -> the crew member -> the machine (not broken: cleaning) -> the store at night
// (heat 151°F, germs pop, frost) -> the clock (4 hours) -> the cycle bar overruns -> HEAT CYCLE FAIL -> the error code -> the shrug ->
// the service ticket -> calendar days -> the exemption + OCT 2024 stamp -> the padlock opens -> the cup -> the wrench -> back to "you" + question.
// Built on hirkit (rig, light, collage, edit). Shots cut on voice-over words. 1080x1920, 30 fps.
// Usage: node episode.js video out.mp4 | still t1,t2,... out.png | frame t out.png [nosubs] | cues | srt out.srt | shots | carousel dir
const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
const { spawn } = require('child_process');
const fs = require('fs');
const K = require('../tests/mcd_collage/kit');
const EN = require('../mcd_ep1/engine');            // voice timings + subtitle drawing only (read-only use)
const R = require('../hirkit/rig');
const LT = require('../hirkit/light');
const CL = require('../hirkit/collage');
const { makeEdit } = require('../hirkit/edit');
const S = require('./mcfkit');
const { C, F, clamp, lerp, seg, E, rr } = K;
const { INK } = R;
const { W, H, layer, txt, fitTxt, MONO, CUST, CREW, TECH, ANGRY } = S;
try { GlobalFonts.registerFromPath('/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf', 'Emoji'); } catch (e) {}
const FPS = 30;

// ---------- voice timeline (natural speed; real speech start/end from vo/speech.json, gaps only) ----------
const LINES = JSON.parse(fs.readFileSync(`${__dirname}/script.json`));
const SP = JSON.parse(fs.readFileSync(`${__dirname}/vo/speech.json`));
const GAP = { s01: 0.35, s02: 0.3, s03: 0.7, s04: 0.3, s05: 0.35, s06: 0.35, s07: 0.2 };
const ST = {}; let T = 0.05; for (const L of LINES) { ST[L.id] = +(T - SP[L.id][0]).toFixed(3); T += SP[L.id][1] - SP[L.id][0] + GAP[L.id]; }
const V = EN.voice(`${__dirname}/vo`, ST), at = (id, w, n = 0) => V.at(id, w, n), end = id => ST[id] + SP[id][1];
const tEnd = +(end('s07') + 0.15).toFixed(2);   // the end card (question to the viewer) holds 2 s+
T = +(tEnd + 2.2).toFixed(2);

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
const RIM = { dir: [-1, -0.35], color: '#FFF3D8', w: 8, a: 0.9 }, RIM_COOL = { dir: [1, -0.4], color: '#D8F0FF', w: 8, a: 0.85 };
const pop = (t, t0, d = 0.3, s = 2.2) => t < t0 ? 0 : E.back(seg(t, t0, t0 + d), s);
function label(ctx, s, x, y, u, o = {}) {
  if (u <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.03); ctx.scale(u, u); const size = o.size || 56;
  ctx.font = `${size}px ${F.black}`; const w = Math.min(ctx.measureText(s).width, o.maxW || 940) + 50;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -size * 0.85, w, size * 1.35, 12), o.col || '#FFFDF8', { elev: 1.4 }); fitTxt(ctx, s, 0, size * 0.28, size, o.fg || INK, w - 50);
  ctx.restore();
}
function stampMark(ctx, s, x, y, u, o = {}) {
  if (u <= 0) return; const size = o.size || 96, sc = lerp(o.from ?? 1.8, 1, E.out(clamp(u))), rot = o.rot ?? -0.1, col = o.col || C.red;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(u * 3);
  ctx.font = `${size}px ${F.black}`; const w = ctx.measureText(s).width + 70, h = size * 1.45;
  ctx.fillStyle = 'rgba(255,253,246,0.9)'; rr(ctx, -w / 2, -h / 2, w, h, 16); ctx.fill();
  ctx.strokeStyle = col; ctx.lineWidth = 12; rr(ctx, -w / 2, -h / 2, w, h, 16); ctx.stroke(); ctx.lineWidth = 4; rr(ctx, -w / 2 + 16, -h / 2 + 16, w - 32, h - 32, 10); ctx.stroke();
  txt(ctx, s, 0, size * 0.36, size, col); ctx.restore();
}
function footnote(ctx, s, y = 1400, a = 1) { // a small source / company-position note
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.font = `30px ${F.xb}`; const w = Math.min(ctx.measureText(s).width, 900) + 40;
  ctx.fillStyle = 'rgba(23,23,23,0.78)'; rr(ctx, 540 - w / 2, y - 30, w, 46, 10); ctx.fill(); fitTxt(ctx, s, 540, y + 2, 30, '#FFFDF8', 900, 'center', F.xb); ctx.restore();
}
// a cartoon anger mark (four red arcs), pulsing
function angerMark(ctx, x, y, r, t) {
  const p = 1 + 0.12 * Math.sin(t * 14); ctx.save(); ctx.translate(x, y); ctx.scale(p, p); ctx.lineCap = 'round';
  for (const [w, col] of [[r * 0.34, INK], [r * 0.22, C.red]]) { ctx.lineWidth = w; ctx.strokeStyle = col;
    for (let i = 0; i < 4; i++) { ctx.save(); ctx.rotate(i * Math.PI / 2); ctx.beginPath(); ctx.moveTo(r * 0.25, -r); ctx.quadraticCurveTo(r * 0.25, -r * 0.25, r, -r * 0.25); ctx.stroke(); ctx.restore(); } }
  ctx.restore();
}
// a person's front bust over a background, slow push
function bust(ctx, lt, bg, L, o) {
  bg(ctx);
  const push = 1 + lt * (o.push ?? 0.03), nx = o.x ?? 540, ny = o.ny ?? 1450, s = o.s ?? 2.7;
  ctx.save(); ctx.translate(nx, ny); ctx.scale(push, push); ctx.translate(-nx, -ny);
  LT.lit(ctx, c => { R.bust(c, nx, ny, s, L, { face: o.face, hands: o.hands || [], headTilt: o.tilt || 0, lean: o.lean || 0 }); if (L === CREW) S.badge(c, nx, ny, s); },
    { rim: o.rim ?? RIM, tint: { x0: nx, y0: 0, x1: nx + 540, y1: 0, color: 'rgb(214,205,226)', a: 1 } });
  ctx.restore();
}
const counterBg = (blur, mo = {}, t = 0) => c => { c.fillStyle = '#F1E3C8'; c.fillRect(0, 0, W, H); halfPass(c, blur, g => layer(g, { x: 0, y: -700, z: 0.95 }, 1, w => S.counter(w, t, { machineO: mo }))); };
const nightBg = c => { c.fillStyle = '#1B2236'; c.fillRect(0, 0, W, H); c.fillStyle = 'rgba(255,255,255,0.04)'; for (let x = 0; x < W; x += 120) c.fillRect(x, 0, 4, H); };

// ---------- overlays ----------
// frame-0 hook: ICE CREAM MACHINE / BROKEN. AGAIN. (a stamp already readable at frame 0, settling with a bounce)
const tSorry = at('s01', 'sorry'), tAgain = at('s01', 'again'), tMcf = at('s01', 'mcflurry');
function headline(ctx, t) {
  const a = 1 - seg(t, ST.s02 - 0.3, ST.s02 - 0.05); if (a <= 0 || t >= tEnd) return;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2, 330);
  ctx.save(); ctx.rotate(-0.02); CL.cutout(ctx, () => rr(ctx, -400, -66, 800, 104, 16), '#FFFDF8', { elev: 1.4 }); fitTxt(ctx, 'THE ICE CREAM MACHINE', 0, 12, 64, INK, 740); ctx.restore();
  const land = 0.9 + 0.1 * E.back(seg(t, 0, 0.3), 3), again = t > tAgain - 0.05 ? 1 + 0.18 * Math.sin(seg(t, tAgain - 0.05, tAgain + 0.35) * Math.PI) : 1;
  ctx.translate(shake(t, 0.02, 10) + shake(t, tAgain, 14), 150); ctx.rotate(-0.05); ctx.scale(land * again * 1.1, land * again * 1.1);
  ctx.font = `100px ${F.black}`; const w = ctx.measureText('BROKEN. AGAIN.').width + 70;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -72, w, 140, 16), C.red, { elev: 2 }); txt(ctx, 'BROKEN. AGAIN.', 0, 36, 100, '#FFFDF8');
  ctx.restore();
}
// the end card: the question to the viewer (2 s+), over the echo of frame 0
function endCard(ctx, t) {
  if (t < tEnd) return; const u = E.back(seg(t, tEnd, tEnd + 0.35), 2);
  ctx.save(); ctx.translate(W / 2, 520); ctx.rotate(-0.02); ctx.scale(u, u);
  CL.cutout(ctx, () => rr(ctx, -470, -250, 940, 500, 30), '#FFFDF8', { elev: 2.2 });
  txt(ctx, 'IS THE MACHINE', 0, -130, 76, INK); txt(ctx, 'BROKEN AT', 0, -40, 76, INK);
  ctx.save(); ctx.translate(0, 70); ctx.rotate(0.02); CL.cutout(ctx, () => rr(ctx, -380, -70, 760, 124, 16), C.red, { elev: 1.4 }); fitTxt(ctx, "YOUR McDONALD'S?", 0, 22, 78, '#FFFDF8', 720); ctx.restore();
  const b = Math.sin(t * 7) * 10; ctx.font = '120px Emoji'; ctx.textAlign = 'center'; ctx.fillText('👇', 0, 240 + b);
  ctx.restore();
}

// ================= SHOTS =================
const SH = []; const shot = (id, t0, t1, draw, out) => SH.push({ id, t0, t1, draw, out });

// A1 (s01 "You want a McFlurry."): YOU at the counter, annoyed, push in; a thought bubble with the dessert pops on "McFlurry"
shot('A1 you', 0, tSorry - 0.1, (ctx, t, lt) => {
  const z = 1.0 + E.out(seg(lt, 0, 1.2)) * 0.06;
  ctx.save(); ctx.translate(540, 1150); ctx.scale(z, z); ctx.translate(-540, -1150);
  bust(ctx, lt, counterBg(8, { led: C.red, screen: S.scr.text(['ERROR'], '#FF6B6B', 50) }), CUST, { face: { ...ANGRY, look: [0.15, 0], blink: blink(t, 2.8, 0.5) }, ny: 1530, s: 3.15, push: 0.02 });
  angerMark(ctx, 330, 960, 48, t);
  const u = pop(t, tMcf - 0.1, 0.35); if (u > 0) { ctx.save(); ctx.translate(860, 760); ctx.scale(u * 0.62, u * 0.62); S.bubble(ctx, 360, 380, g => { g.save(); g.translate(0, 150); g.scale(0.8, 0.8); S.cup(g, 1); g.restore(); }, [-0.8, 1]); ctx.restore(); }
  ctx.restore();
  LT.grade(ctx, 'office', { vignette: 0.2 });
}, { type: 'cut' });
// A2 (s01 "'Sorry, the machine is broken.'"): the crew member, apologetic; the machine behind her blinks red
shot('A2 crew', tSorry - 0.1, tAgain - 0.1, (ctx, t, lt) => {
  const led = Math.floor(t * 4) % 2 ? C.red : '#7A1E26';
  bust(ctx, lt, c => { c.fillStyle = '#F1E3C8'; c.fillRect(0, 0, W, H); halfPass(c, 5, g => layer(g, { x: 260, y: -560, z: 1.05 }, 1, w => S.counter(w, t, { machineO: { led, screen: S.scr.text(['ERROR'], '#FF6B6B', 50) } }))); },
    CREW, { face: R.expr('worried', { look: [-0.2, 0.05], blink: blink(t, 2.4) }), x: 420, hands: [{ side: 1, hand: [150, -60], grip: 'open' }], tilt: 0.05 });
  LT.grade(ctx, 'office', { vignette: 0.2 });
});
// A3 (s01 "AGAIN."): extreme close-up of YOU: the eye twitches, the camera jolts
shot('A3 again', tAgain - 0.1, ST.s02 - 0.12, (ctx, t, lt) => {
  const sh = shake(t, tAgain, 18);
  ctx.save(); ctx.translate(sh, 0);
  bust(ctx, lt, counterBg(12, { led: C.red }), CUST, { face: { ...ANGRY, lid: [0.45, Math.sin(t * 40) > 0 ? 0.55 : 0.35], look: [0, 0] }, ny: 1640, s: 3.5, push: 0.05 });
  angerMark(ctx, 270, 900, 60, t);
  ctx.restore();
  LT.grade(ctx, 'office', { vignette: 0.3 });
});

// B1 (s02 "Usually, it's not broken. It's cleaning itself."): the machine; the BROKEN? note gets crossed out, the screen shows HEAT MODE, steam
const tNot = at('s02', 'not'), tClean = at('s02', 'cleaning');
shot('B1 machine', ST.s02 - 0.12, ST.s03 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -420, 1.15], [2.8, 0, -440, 1.25]], lt), cl = t > tClean - 0.1;
  ctx.fillStyle = '#F1E3C8'; ctx.fillRect(0, 0, W, H); halfPass(ctx, 8, g => layer(g, { x: 0, y: -900, z: 0.8 }, 1, w => S.counter(w, t, { machine: false })));
  layer(ctx, c, 1, w => { LT.lit(w, g => S.machine(g, { led: cl ? C.yellow : C.red, screen: cl ? S.scr.heat(seg(t, tClean, tClean + 2.5) * 0.4) : S.scr.text(['ERROR'], '#FF6B6B', 50), steam: cl ? t : undefined, heat: cl ? 0.4 * seg(t, tClean, tClean + 0.6) : 0 }), { rim: RIM });
    // the note taped on the face plate
    w.save(); w.translate(0, -380); w.rotate(-0.05); CL.cutout(w, () => rr(w, -170, -60, 340, 120, 6), '#FFFDF6', { elev: 1.2 }); txt(w, 'BROKEN?', 0, 22, 66, C.red); CL.tape(w, 0, -62, 120, 0);
    const x = seg(t, tNot - 0.05, tNot + 0.25); if (x > 0) { w.strokeStyle = INK; w.lineWidth = 14; w.lineCap = 'round'; w.beginPath(); w.moveTo(-150, 0); w.lineTo(lerp(-150, 150, x), 0); w.stroke(); }
    w.restore(); });
  label(ctx, 'IT\'S CLEANING ITSELF', 540, 600, pop(t, tClean - 0.05), { size: 64, col: C.yellow });
  LT.grade(ctx, 'office', { vignette: 0.2 });
});

// C1 (s03 "Every night it heats up to kill bacteria, then cools down."): the closed store at night; the thermometer rises to 151°F,
// germs pop; then frost, the thermometer falls
const tNight = at('s03', 'night'), tHeats = at('s03', 'heats'), tKill = at('s03', 'kill'), tCools = at('s03', 'cools'), tAbout = at('s03', 'about'), tFour = at('s03', 'four');
shot('C1 heat', ST.s03 - 0.12, tAbout - 0.12, (ctx, t, lt) => {
  const hot = seg(t, tHeats - 0.1, tKill + 0.2), cold = seg(t, tCools - 0.1, tCools + 0.5), c = cam([[0, 40, -560, 0.9], [3.6, 40, -580, 0.98]], lt);
  nightBg(ctx);
  layer(ctx, c, 1, w => {
    w.save(); w.translate(170, -1080); S.nightWindow(w, 700, 520, t); w.restore();
    w.fillStyle = '#2A3046'; w.fillRect(-1200, 0, 2400, 900); w.fillStyle = '#3A4058'; w.fillRect(-1200, 0, 2400, 30);
    w.save(); w.translate(170, 0); S.machine(w, { led: cold > 0.5 ? C.blue : C.yellow, heat: hot * (1 - cold), frost: cold, screen: cold > 0.3 ? S.scr.heat(0.4 + 0.5 * cold, 'COOLING') : S.scr.heat(0.05 + 0.35 * hot, 'HEATING') }); w.restore();
    if (hot > 0 && cold < 1) LT.glow(w, 170, -400, 600, 'rgba(255,90,60,1)', 0.25 * hot * (1 - cold));
    // germs around the machine pop when it gets hot
    for (let i = 0; i < 6; i++) { const gx = 170 + Math.cos(i * 1.1 + 0.4) * 360, gy = -420 + Math.sin(i * 1.7) * 320, p = seg(t, tKill + i * 0.07, tKill + 0.25 + i * 0.07);
      if (t > tNight) { w.save(); w.translate(gx + Math.sin(t * 3 + i) * 8, gy); S.germ(w, 50, t + i, p); w.restore(); } }
    w.save(); w.translate(-330, 40); S.thermo(w, cold > 0 ? lerp(0.9, 0.12, E.inOut(cold)) * (hot > 0 ? 1 : 0) + (hot > 0 ? 0 : 0.15) : lerp(0.15, 0.9, E.inOut(hot)), { col: cold > 0.4 ? C.blue : C.red }); w.restore();
  });
  // big readable numbers as objects in the scene
  const tag = cold > 0.4 ? 'COOLS DOWN' : '151°F';
  label(ctx, tag, 300, 650, hot > 0.6 ? pop(t, cold > 0.4 ? tCools - 0.05 : tHeats + 0.3) : 0, { size: cold > 0.4 ? 66 : 110, col: cold > 0.4 ? '#D8F0FF' : C.red, fg: cold > 0.4 ? INK : '#FFFDF8', rot: -0.05 });
  if (cold > 0) { ctx.save(); ctx.translate(820, 640); ctx.rotate(t * 0.8); ctx.scale(cold, cold); S.snowflake(ctx, 90); ctx.restore(); }
  label(ctx, 'EVERY NIGHT', 540, 420, pop(t, tNight - 0.1), { size: 60, col: C.yellow });
  footnote(ctx, 'to kill bacteria: heated, then cooled again', 1400, seg(t, tKill, tKill + 0.3) * (1 - cold));
  LT.grade(ctx, 'evening', { vignette: 0.3 });
});
// C2 (s03 "About FOUR hours."): the wall clock sweeps 4 hours; the big 4 HOURS card
shot('C2 clock', tAbout - 0.12, ST.s04 - 0.12, (ctx, t, lt) => {
  nightBg(ctx);
  const h = 4 * E.inOut(seg(t, tAbout, tFour + 0.5)), z = 1 + lt * 0.04;
  ctx.save(); ctx.translate(540, 900); ctx.scale(z, z); LT.lit(ctx, g => S.clock(g, 300, h, 0), { rim: RIM_COOL }); ctx.restore();
  const u = pop(t, tAbout + 0.05, 0.35), big = 1 + 0.15 * Math.sin(seg(t, tFour - 0.05, tFour + 0.35) * Math.PI); if (u > 0) { ctx.save(); ctx.translate(540 + shake(t, tFour + 0.2, 8), 450); ctx.scale(big, big); ctx.rotate(-0.04); ctx.scale(u, u);
    CL.cutout(ctx, () => rr(ctx, -330, -95, 660, 170, 20), C.yellow, { elev: 2 }); txt(ctx, '≈ 4 HOURS', 0, 30, 110, INK); ctx.restore(); }
  label(ctx, 'NO ICE CREAM WHILE IT RUNS', 540, 1340, pop(t, tFour + 0.3), { size: 46, col: '#FFFDF8' });
  LT.grade(ctx, 'evening', { vignette: 0.28 });
});

// D1 (s04 "If one step runs too long... the cycle fails."): the cycle bar HEAT -> HOLD -> COOL; one step overruns, the screen slams FAIL
const tStep = at('s04', 'step'), tLong = at('s04', 'long'), tFails = at('s04', 'fails'), tCodes = at('s04', 'error');
shot('D1 fail', ST.s04 - 0.12, tCodes - 0.12, (ctx, t, lt) => {
  nightBg(ctx);
  const steps = ['HEAT', 'HOLD', 'COOL'], fill = [1, Math.min(1.45, seg(t, tStep - 0.2, tLong + 0.6) * 1.45), 0], over = fill[1] > 1, failed = t > tFails - 0.05;
  ctx.save(); ctx.translate(540, 760);
  steps.forEach((s, i) => { const x = (i - 1) * 310; ctx.save(); ctx.translate(x, 0); CL.cutout(ctx, () => rr(ctx, -140, -120, 280, 240, 20), i === 1 && over ? '#FFE3E5' : '#FFFDF8', { elev: 1.4 });
    txt(ctx, s, 0, -40, 62, INK); rr(ctx, -110, 20, 220, 50, 12); ctx.fillStyle = '#DDD8CC'; ctx.fill();
    const f = Math.min(1, fill[i]); if (f > 0) { rr(ctx, -110, 20, 220 * f, 50, 12); ctx.fillStyle = i === 1 && over ? C.red : '#2FA37E'; ctx.fill(); }
    if (i === 1 && over) { const ex = (fill[1] - 1) * 220; rr(ctx, 110, 20, ex, 50, 10); ctx.fillStyle = C.red; ctx.fill(); txt(ctx, 'TOO LONG', 0, 112, 40, C.red); }
    ctx.restore(); if (i < 2) txt(ctx, '→', x + 155, 18, 60, '#FFFDF8'); });
  ctx.restore();
  // the machine screen slams HEAT CYCLE FAIL
  ctx.save(); ctx.translate(540 + shake(t, tFails, 14), 1150); const u = failed ? E.back(seg(t, tFails - 0.05, tFails + 0.2), 2) : 0;
  ctx.globalAlpha = failed ? 1 : 0.35; ctx.scale(lerp(0.85, 1, u), lerp(0.85, 1, u));
  CL.cutout(ctx, () => rr(ctx, -380, -120, 760, 240, 22), '#2A2E36', { elev: 2 }); rr(ctx, -350, -95, 700, 190, 12); ctx.fillStyle = '#10261C'; ctx.fill();
  if (failed) { fitTxt(ctx, 'HEAT CYCLE', 0, -14, 70, '#FF6B6B', 640, 'center', MONO); fitTxt(ctx, 'FAIL', 0, 66, 76, '#FF6B6B', 640, 'center', MONO); LT.glow(ctx, 0, 0, 500, 'rgba(255,60,60,1)', 0.18); }
  else fitTxt(ctx, 'RUNNING...', 0, 24, 60, '#7CFFB2', 640, 'center', MONO);
  ctx.restore();
  LT.grade(ctx, 'evening', { vignette: 0.28 });
});
// D2 (s04 "Error codes like this."): the display, close: a real-world example code types itself; the crew member squints at it
const CODE = ['R BRL > 41F', 'AFTER SL'];
shot('D2 code', tCodes - 0.12, ST.s05 - 0.12, (ctx, t, lt) => {
  bust(ctx, lt, counterBg(10, { led: C.red }), CREW, { face: R.expr('squint', { look: [0, -0.7], blink: blink(t, 2.7) }), ny: 1560, s: 2.05, x: 540, hands: [{ side: 1, hand: [60, -150], grip: 'relax', elbow: [180, 300] }] });
  const n = Math.floor(seg(t, tCodes, tCodes + 0.7) * 20), u = pop(t, tCodes - 0.1, 0.3);
  ctx.save(); ctx.translate(540, 650); ctx.rotate(-0.02); ctx.scale(u, u);
  CL.cutout(ctx, () => rr(ctx, -440, -170, 880, 340, 24), '#2A2E36', { elev: 2 }); rr(ctx, -410, -140, 820, 280, 14); ctx.fillStyle = '#10261C'; ctx.fill();
  let k = n; CODE.forEach((s, i) => { const part = s.slice(0, Math.max(0, Math.min(s.length, k))); k -= s.length; fitTxt(ctx, part, -370, -20 + i * 100, 84, '#FF6B6B', 760, 'left', MONO); });
  if (Math.floor(t * 3) % 2) { ctx.fillStyle = '#FF6B6B'; ctx.fillRect(250, 50, 40, 70); }
  ctx.restore();
  label(ctx, '???', 860, 1000, pop(t, tCodes + 0.6), { size: 80, col: C.yellow, rot: 0.08 });
  footnote(ctx, 'an error message shown on CBS News', 900, seg(t, tCodes + 0.3, tCodes + 0.6));
  LT.grade(ctx, 'office', { vignette: 0.22 });
});

// E1 (s05 "Staff often can't fix it."): the crew member shrugs; OUT OF ORDER goes on the machine behind her
const tCant = at('s05', 'can'), tWait = at('s05', 'wait'), tTech = at('s05', 'technician'), tThat5 = at('s05', 'that'), tDays = at('s05', 'days');
shot('E1 shrug', ST.s05 - 0.12, tWait - 0.12, (ctx, t, lt) => {
  bust(ctx, lt, c => { c.fillStyle = '#F1E3C8'; c.fillRect(0, 0, W, H); halfPass(c, 5, g => layer(g, { x: 260, y: -560, z: 1.05 }, 1, w => S.counter(w, t, { machineO: { led: C.red, sign: seg(t, tCant, tCant + 0.3), screen: S.scr.text(['FAIL'], '#FF6B6B', 50) } }))); },
    CREW, { face: R.expr('tired', { look: [0, 0.05], blink: blink(t, 2.4) }), x: 420, hands: [{ side: 1, hand: [230, -40], grip: 'open' }, { side: -1, hand: [-230, -40], grip: 'open' }], tilt: -0.06 });
  LT.grade(ctx, 'office', { vignette: 0.2 });
});
// E2 (s05 "They wait for a technician."): the phone: SERVICE REQUEST, authorized technician, ETA dots
shot('E2 ticket', tWait - 0.12, tThat5 - 0.12, (ctx, t, lt) => {
  ctx.fillStyle = '#F1E3C8'; ctx.fillRect(0, 0, W, H); halfPass(ctx, 10, g => layer(g, { x: 260, y: -560, z: 1.05 }, 1, w => S.counter(w, t, { machineO: { led: C.red, sign: 1 } })));
  const u = E.out(seg(t, tWait - 0.15, tWait + 0.3)); ctx.save(); ctx.translate(540, lerp(1700, 900, u)); ctx.rotate(-0.03 + lt * 0.01);
  S.phone(ctx, g => { g.fillStyle = C.blue; g.fillRect(-240, -420, 480, 150); txt(g, 'SERVICE', 0, -350, 52, '#FFFDF8'); txt(g, 'REQUEST', 0, -296, 52, '#FFFDF8');
    txt(g, 'Soft-serve machine', 0, -190, 36, '#3A3A40', 'center', F.xb); txt(g, 'status: DOWN', 0, -140, 40, C.red);
    g.save(); g.translate(0, 30); S.toolbox(g, 0.6); g.restore();
    const tu = pop(t, tTech - 0.05, 0.3); if (tu > 0) { g.save(); g.translate(0, 120); g.scale(tu, tu); CL.cutout(g, () => rr(g, -200, -40, 400, 80, 14), C.yellow, { elev: 1 }); fitTxt(g, 'AUTHORIZED TECH', 0, 14, 40, INK, 370); g.restore(); }
    txt(g, 'ETA', 0, 250, 46, INK); const d = Math.floor(t * 3) % 4; txt(g, '•'.repeat(d) + ' '.repeat(3 - d), 0, 330, 90, C.red); });
  ctx.restore();
  LT.grade(ctx, 'office', { vignette: 0.22 });
});
// E3 (s05 "That can take days."): the tear-off calendar flies: MON, TUE, WED...; the machine is still OUT OF ORDER
shot('E3 days', tThat5 - 0.12, ST.s06 - 0.12, (ctx, t, lt) => {
  ctx.fillStyle = '#F1E3C8'; ctx.fillRect(0, 0, W, H); halfPass(ctx, 9, g => layer(g, { x: 260, y: -560, z: 1.05 }, 1, w => S.counter(w, t, { machineO: { led: C.red, sign: 1 } })));
  const days = [['MON', 1], ['TUE', 2], ['WED', 3], ['THU', 4]], p = seg(t, tThat5, tDays + 0.6) * 3;
  ctx.save(); ctx.translate(540, 820); ctx.scale(1.15, 1.15);
  for (let i = days.length - 1; i >= 0; i--) { const off = clamp(p - i); if (off >= 1) continue; ctx.save(); if (off > 0) { ctx.translate(off * -500, -off * 700); ctx.rotate(-off * 0.8); } S.dayPage(ctx, ...days[i]); ctx.restore(); }
  ctx.restore();
  label(ctx, 'CAN TAKE DAYS', 540, 1260, pop(t, tDays - 0.05), { size: 64, col: C.red, fg: '#FFFDF8' });
  footnote(ctx, 'Taylor (the maker): repairs are handled by independent distributors', 1400, seg(t, tThat5 + 0.2, tThat5 + 0.5));
  LT.grade(ctx, 'office', { vignette: 0.22 });
});

// F1 (s06 "Then in 2024, the U.S. made it legal"): the exemption lands, OCT 2024 stamp; LEGAL TO REPAIR stamp on "made"
const t2024 = at('s06', '2024'), tMade = at('s06', 'made'), tLegal = at('s06', 'legal'), tUnlock = at('s06', 'unlock'), tRepair = at('s06', 'repair');
shot('F1 exemption', ST.s06 - 0.12, tUnlock - 0.12, (ctx, t, lt) => {
  ctx.fillStyle = '#5E7A8C'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = 'rgba(255,255,255,0.06)'; for (let i = 0; i < 20; i++) ctx.fillRect(0, i * 100, W, 40);
  const u = E.back(seg(t, ST.s06 - 0.1, ST.s06 + 0.3), 1.4), z = 1.0 + lt * 0.03;
  ctx.save(); ctx.translate(540, lerp(1500, 900, u)); ctx.rotate(lerp(0.3, -0.03, u)); ctx.scale(z * 1.1, z * 1.1); S.doc(ctx); ctx.restore();
  ctx.save(); ctx.translate(shake(t, t2024 + 0.1, 12), 0); stampMark(ctx, 'OCT 2024', 760, 560, seg(t, t2024 - 0.05, t2024 + 0.15), { size: 90, rot: 0.12 }); ctx.restore();
  stampMark(ctx, 'LEGAL TO REPAIR', 540, 1260, seg(t, tMade - 0.05, tMade + 0.15), { size: 76, rot: -0.06, col: '#2FA37E' });
  LT.grade(ctx, 'office', { vignette: 0.2 });
});
// F2 (s06 "to unlock these machines for repair."): the padlock on the machine clicks open; the wrench swings in; the screen turns READY
shot('F2 unlock', tUnlock - 0.12, ST.s07 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -440, 1.2], [2.2, 0, -460, 1.3]], lt), op = seg(t, tUnlock, tUnlock + 0.35), ok = t > tRepair;
  ctx.fillStyle = '#F1E3C8'; ctx.fillRect(0, 0, W, H); halfPass(ctx, 8, g => layer(g, { x: 0, y: -900, z: 0.8 }, 1, w => S.counter(w, t, { machine: false })));
  layer(ctx, c, 1, w => { LT.lit(w, g => S.machine(g, { lock: op, led: ok ? '#2FD27E' : C.red, screen: ok ? S.scr.text(['READY'], '#7CFFB2', 54) : S.scr.text(['LOCKED'], '#FFC857', 50) }), { rim: RIM });
    const wu = E.back(seg(t, tRepair - 0.2, tRepair + 0.25), 1.6); if (wu > 0) { w.save(); w.translate(lerp(600, 230, wu), lerp(-100, -260, wu)); w.rotate(lerp(1.4, 0.5, wu) + Math.sin(t * 6) * 0.04); S.wrench(w, 0.8); w.restore(); } });
  label(ctx, 'UNLOCKED FOR REPAIR', 540, 520, pop(t, tUnlock + 0.15), { size: 60, col: '#8EF0A8' });
  footnote(ctx, 'covers retail food-prep equipment like soft-serve machines', 1400, seg(t, tUnlock + 0.3, tUnlock + 0.6));
  LT.grade(ctx, 'office', { vignette: 0.2 });
});

// G1 (s07 "The problem wasn't the ice cream."): the cup alone on the counter, a spotlight; check mark: the ice cream is fine
const tIce = at('s07', 'ice'), tIt7 = at('s07', 'it'), tAllowed = at('s07', 'allowed');
shot('G1 cup', ST.s07 - 0.12, tIt7 - 0.12, (ctx, t, lt) => {
  ctx.fillStyle = '#F1E3C8'; ctx.fillRect(0, 0, W, H); halfPass(ctx, 9, g => layer(g, { x: 0, y: -400, z: 1.1 }, 1, w => S.counter(w, t, { machine: false })));
  LT.glow(ctx, 540, 950, 520, 'rgba(255,248,220,1)', 0.45);
  const z = 1.0 + lt * 0.05; ctx.save(); ctx.translate(540, 1240); ctx.scale(z * 1.7, z * 1.7); LT.lit(ctx, g => S.cup(g, 1), { rim: RIM }); ctx.restore();
  label(ctx, 'NOT THE ICE CREAM', 540, 520, pop(t, tIce - 0.1), { size: 64, col: '#FFFDF8' });
  LT.grade(ctx, 'golden', { vignette: 0.22 });
});
// G2 (s07 "It was who's ALLOWED to fix the machine."): the crew member holds the wrench, looks straight at us; WHO'S ALLOWED? lands
shot('G2 allowed', tIt7 - 0.12, tEnd, (ctx, t, lt) => {
  bust(ctx, lt, c => { c.fillStyle = '#F1E3C8'; c.fillRect(0, 0, W, H); halfPass(c, 6, g => layer(g, { x: 260, y: -560, z: 1.05 }, 1, w => S.counter(w, t, { machineO: { led: C.red, lock: 0, screen: S.scr.text(['LOCKED'], '#FFC857', 50) } }))); },
    CREW, { face: R.expr(t > tAllowed ? 'skeptical' : 'neutral', { look: [0, 0.05], blink: blink(t, 3.0) }), x: 480, hands: [{ side: 1, hand: [170, -60], grip: 'fist', item: g => { g.save(); g.rotate(-1.75); S.wrench(g, 0.42); g.restore(); } }] });
  label(ctx, "WHO'S ALLOWED", 540, 520, pop(t, tAllowed - 0.05), { size: 80, col: C.yellow, rot: -0.04 });
  label(ctx, 'TO FIX IT', 540, 640, pop(t, tAllowed + 0.15), { size: 64, col: '#FFFDF8', rot: 0.03 });
  LT.grade(ctx, 'office', { vignette: 0.2 });
});
// H (end card, 2 s+): back to YOU at the counter (echo of frame 0), the question to the viewer
shot('H end', tEnd, T + 0.01, (ctx, t, lt) => {
  const z = 1.06 - lt * 0.02; ctx.save(); ctx.translate(540, 1150); ctx.scale(z, z); ctx.translate(-540, -1150);
  bust(ctx, lt, counterBg(8, { led: C.red, screen: S.scr.text(['ERROR'], '#FF6B6B', 50) }), CUST, { face: R.expr('skeptical', { look: [0, 0.05], blink: blink(t, 2.6) }), ny: 1600, s: 2.9, push: 0 });
  ctx.restore();
  LT.grade(ctx, 'office', { vignette: 0.2 });
}, { type: 'cut' });

// ---------- edit, global overlays, subtitles ----------
SH.sort((a, b) => a.t0 - b.t0);
const ED = makeEdit(SH, W, H);
const SPLIT = { s01: [4, 5, 1], s02: [4, 3], s03: [8, 3, 3], s04: [6, 3, 4], s05: [5, 5, 4], s06: [7, 7], s07: [6, 4, 4] };
function subs() {
  const G = [];
  Object.keys(ST).forEach(id => { const ws = V.words(id); let k0 = 0; SPLIT[id].forEach(n => { G.push({ id, words: ws.slice(k0, k0 + n) }); k0 += n; }); if (k0 !== ws.length) throw new Error(`subtitle split ${id}: ${k0} vs ${ws.length}`); });
  G.forEach((g, i) => { const nx = G[i + 1], e0 = Math.min(g.words[g.words.length - 1].t1, end(g.id)) + 0.4; g.t0 = g.words[0].t0 - 0.05;
    g.t1 = nx ? (nx.id === g.id ? nx.words[0].t0 - 0.05 : Math.min(e0, nx.words[0].t0 - 0.05)) : Math.min(e0, tEnd);
    g.text = g.words.map(x => x.w).join(' ').replace('"Sorry,', '“Sorry,').replace('broken."', 'broken.”'); });
  return G;
}
const SUBS = subs();
const TEX = K.paperTexture(W, H);
function frame(ctx, t, o = {}) {
  ED.frame(ctx, t);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  headline(ctx, t); endCard(ctx, t);
  ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.26; ctx.drawImage(TEX, 0, 0); ctx.restore();
  if (!o.nosubs) EN.drawSubtitles(ctx, t, SUBS, { y: 1565, size: 62, maxW: 820, x: 540, highlight: ['AGAIN.', 'FOUR', 'hours.', 'fails.', "can't", 'days.', '2024,', 'legal', 'ALLOWED'] });
}

// ---------- sound cues (for mix.py) ----------
function cues() {
  const c = [['error', 0.0, 2.5], ['stamp', 0.02, 0.7], ['zoom', 0.05, 0.4], ['pop', tMcf - 0.1, 0.5]];
  c.push(['cut', tSorry - 0.1, 0.35], ['blip', tSorry + 0.3, 0.3], ['cut', tAgain - 0.1, 0.35], ['slam', tAgain, 0.6]);
  c.push(['cut', ST.s02 - 0.12, 0.35], ['scratch', tNot - 0.05, 0.6], ['hum', tClean - 0.1, 0.7], ['puff', tClean + 0.2, 0.5], ['pop', tClean - 0.05, 0.4]);
  c.push(['cut', ST.s03 - 0.12, 0.35], ['pop', tNight - 0.1, 0.4], ['rise', tHeats, 0.6]); for (let i = 0; i < 6; i++) c.push(['pop', tKill + 0.15 + i * 0.07, 0.35]);
  c.push(['sparkle', tCools - 0.05, 0.5], ['cut', tAbout - 0.12, 0.35]); for (let i = 0; i < 8; i++) c.push(['tick', tAbout + i * (tFour + 0.5 - tAbout) / 8, 0.5]); c.push(['stamp', tFour + 0.15, 0.7]);
  c.push(['cut', ST.s04 - 0.12, 0.35], ['servo', tStep, 0.6], ['buzz', tLong + 0.2, 0.5], ['buzzer', tFails, 0.8], ['slam', tFails + 0.02, 0.5]);
  c.push(['cut', tCodes - 0.12, 0.35]); for (let i = 0; i < 10; i++) c.push(['type', tCodes + i * 0.07, 0.45]); c.push(['boop', tCodes + 0.65, 0.4]);
  c.push(['cut', ST.s05 - 0.12, 0.35], ['tape', tCant + 0.05, 0.6], ['cut', tWait - 0.12, 0.35], ['whoosh', tWait - 0.15, 0.4], ['pop', tTech - 0.05, 0.45]);
  c.push(['cut', tThat5 - 0.12, 0.35]); for (let i = 0; i < 3; i++) c.push(['flip', tThat5 + (i + 0.5) * (tDays + 0.6 - tThat5) / 3, 0.6]); c.push(['tag', tDays, 0.5]);
  c.push(['cut', ST.s06 - 0.12, 0.35], ['paper', ST.s06, 0.6], ['stamp', t2024 + 0.1, 0.9], ['stamp', tMade + 0.1, 0.7]);
  c.push(['cut', tUnlock - 0.12, 0.35], ['lock', tUnlock + 0.05, 0.8], ['whoosh', tRepair - 0.2, 0.4], ['clink', tRepair + 0.1, 0.5], ['ding', tRepair + 0.2, 0.4]);
  c.push(['cut', ST.s07 - 0.12, 0.35], ['sparkle', ST.s07 + 0.1, 0.4], ['cut', tIt7 - 0.12, 0.35], ['stamp', tAllowed + 0.05, 0.7], ['pop', tAllowed + 0.2, 0.4]);
  c.push(['cut', tEnd, 0.4], ['pop', tEnd + 0.05, 0.6], ['blip', tEnd + 0.4, 0.4]);
  return c;
}
const MUSIC = { b0: 0, story: ST.s02, night: ST.s03, fail: ST.s04, wait: ST.s05, turn: ST.s06, fin: ST.s07, hit: tEnd, end: T };

// ---------- CLI ----------
const [mode, a1, a2, a3] = process.argv.slice(2);
if (mode === 'cues') { fs.writeFileSync(`${__dirname}/cues.json`, JSON.stringify({ T, vo: Object.entries(ST), sfx: cues(), music: MUSIC })); console.log('cues ok, T =', T); }
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
else if (mode === 'carousel') { // 6 key frames (1080x1920 PNG, no subtitles) for a TikTok photo carousel
  const KEY = [['01_hook', 0.6], ['02_cleaning', tClean + 0.8], ['03_151F', tKill + 0.1], ['04_four_hours', tFour + 0.6], ['05_error_code', tCodes + 1.0], ['06_question', tEnd + 1.0]];
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
module.exports = { T, ST, SH };
