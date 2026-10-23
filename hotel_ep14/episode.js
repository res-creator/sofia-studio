// Episode 14 "The $1,400 Hotel Room" (How It's Run) — Nassau, the Bahamas (reported by NBC Bay Area, March 2026): a prepaid room, "sold out" at
// the desk, a midnight walk with the suitcases, the last room at Margaritaville for $1,400, the emails, NBC, the professor and Marriott's site,
// the repayment, and the hotel slang word "walked". Built on hirkit (rig, light, collage, edit). Re-enactment with generic figures.
// Through-lines: the suitcases (they roll through every outdoor shot) and the $1,400 tag, which ends up on the suitcase in the last shot.
// Shots cut on voice-over words. 1080x1920, 30 fps.
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
const S = require('./hotelkit');
const { C, F, clamp, lerp, seg, E, rr } = K;
const { INK, ell } = R;
const { W, H, layer, txt, fitTxt, KRIS, JIM, CLERK, PROF } = S;
const FPS = 30;
const k = (t, a, b, e = E.inOut) => e(seg(t, a, b));

// ---------- voice timeline (natural speed; real speech start/end from vo/speech.json, gaps only) ----------
// vo/ = the real voice. Until it exists, vo_draft/ (estimated timings, no audio) lays the shots out; build.sh builds the no-voice cut from it.
const VOD = fs.existsSync(`${__dirname}/vo/speech.json`) ? 'vo' : 'vo_draft';
const LINES = JSON.parse(fs.readFileSync(`${__dirname}/script.json`));
const SP = JSON.parse(fs.readFileSync(`${__dirname}/${VOD}/speech.json`));
const GAP = { h01: 0.2, h02: 0.25, h03: 0.4, s04: 0.3, s05: 0.3, s06: 0.3, s07: 0.35, s08: 0.35, s09: 0.3, s10: 0.25, s11: 0.45, s12: 0.25, s13: 0.35, s14: 0.3, s15: 0.3, s16: 0.35, s17: 0.4, s18: 0.3, s19: 1.6 };
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
const RIM_W = { dir: [-1, -0.35], color: '#FFD9A0', w: 8, a: 0.9 }, RIM_MOON = { dir: [1, -0.5], color: '#CFE0FF', w: 8, a: 0.85 };
const pop = (t, t0, d = 0.3, s = 2.2) => t < t0 ? 0 : E.back(seg(t, t0, t0 + d), s);
function label(ctx, s, x, y, u, o = {}) { // a paper label with an optional arrow (names, places)
  if (u <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.03); ctx.scale(u, u); const size = o.size || 56;
  ctx.font = `${size}px ${F.black}`; const w = Math.min(ctx.measureText(s).width + 50, o.maxW || 980);
  CL.cutout(ctx, () => rr(ctx, -w / 2, -size * 0.85, w, size * 1.35, 12), o.col || '#FFFDF8', { elev: 1.4 }); fitTxt(ctx, s, 0, size * 0.28, size, o.fg || INK, w - 40);
  if (o.arrow) { ctx.fillStyle = o.col || '#FFFDF8'; const ax = o.arrowX || 0; ctx.beginPath(); ctx.moveTo(ax - 22, size * 0.5); ctx.lineTo(ax + 22, size * 0.5); ctx.lineTo(ax + o.arrow * 30, size * 1.25); ctx.closePath(); ctx.fill(); ctx.lineWidth = R.px(ctx, 4); ctx.strokeStyle = INK; ctx.stroke(); }
  ctx.restore();
}
function note(ctx, s, y, u = 1, x = W / 2) { // small source note (whose words / where from), dark chip
  if (u <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(u); ctx.translate(x, y); ctx.font = `28px ${F.black}`; const w = ctx.measureText(s).width + 40;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -26, w, 48, 10), '#2E3A59', { elev: 0.6, tex: 0 }); txt(ctx, s, 0, 9, 28, '#FFFDF8'); ctx.restore();
}
function priceTag(ctx, lab, col = C.red, fg = '#FFFDF8', size = 64) { // paper price tag centred, string hole at the right end
  ctx.save(); ctx.font = `${size}px ${F.black}`; const w = ctx.measureText(lab).width + size * 1.1, h = size * 1.55;
  CL.cutout(ctx, () => { ctx.beginPath(); ctx.moveTo(w / 2 - h * 0.34, -h / 2); ctx.lineTo(-w / 2, -h / 2); ctx.lineTo(-w / 2, h / 2); ctx.lineTo(w / 2 - h * 0.34, h / 2); ctx.lineTo(w / 2, 0); ctx.closePath(); }, col, { elev: 1.3 });
  ell(ctx, w / 2 - h * 0.3, 0, size * 0.14, size * 0.14); ctx.fillStyle = 'rgba(40,25,10,0.5)'; ctx.fill(); txt(ctx, lab, -size * 0.25, size * 0.35, size, fg); ctx.restore();
  return w;
}
// a red rubber-stamp word (screen space), lands with a squash at t0
function stampWord(ctx, s, x, y, t, t0, o = {}) {
  if (t < t0) return; const u = seg(t, t0, t0 + 0.18), sc = lerp(2.2, 1, E.out(u)), size = o.size || 92;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.12); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(u * 3);
  ctx.font = `${size}px ${F.black}`; const w = ctx.measureText(s).width + 60; ctx.fillStyle = 'rgba(255,253,248,0.75)'; rr(ctx, -w / 2, -size * 0.75, w, size * 1.3, 14); ctx.fill();
  ctx.strokeStyle = o.col || C.red; ctx.lineWidth = 12; rr(ctx, -w / 2, -size * 0.75, w, size * 1.3, 14); ctx.stroke(); txt(ctx, s, 0, size * 0.33, size, o.col || C.red); ctx.restore();
}

// ---------- the couple walking with suitcases (world space, street level y = 0) ----------
// the far hand pulls the suitcase behind: the suitcase's wheels stay on the ground, its handle meets the hand
function walker(w, x, L, ph, o = {}) {
  const s = o.s ?? 1, f = o.facing ?? 1, P = R.walk(ph, { stride: o.stride ?? 62 }), hand = [-96, -300];
  P.armF = { hand, grip: 'fist' }; P.face = o.face || R.expr('neutral', { look: [0.6, 0], blink: blink(ph, 2.9) }); P.headTilt = o.tilt ?? 0;
  if (o.armN) P.armN = o.armN;
  const hw = [x + hand[0] * s * f, hand[1] * s], ss = 0.78 * s, Lh = 400 * ss, a = Math.acos(clamp(-hw[1] / Lh, -1, 1)) * f;
  const base = [hw[0] - Math.sin(a) * Lh, 0];
  w.save(); w.translate(...base); w.rotate(a); S.suitcase(w, ss, o.bag || C.red); if (o.tag) { w.save(); w.translate(0, -300 * ss); o.tag(w); w.restore(); } w.restore();
  LT.lit(w, g => R.figure(g, x, 0, s, f, L, P), { rim: o.rim || RIM_MOON });
}

// ---------- overlays ----------
function stampLabel(ctx, t) { // the honesty label, small, top of the 3:4 crop, always on
  ctx.save(); ctx.translate(W / 2, 262); ctx.font = `27px ${F.black}`; const s = 'REAL STORY · NASSAU · REPORTED MAR 2026 · RE-ENACTMENT', w = ctx.measureText(s).width + 40;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -26, w, 50, 10), '#171717', { elev: 0.8, tex: 0 }); txt(ctx, s, 0, 10, 27, C.yellow); ctx.restore();
}
const tPrepaid = at('h01', 'prepaid'), tSold = at('h02', 'sold'), tFourteen = at('h03', 'fourteen');
function headline(ctx, t) { // frame-0 hook: PREPAID ROOM -> SOLD OUT, then -> $1,400 NIGHT (stays through the first three lines)
  const a = 1 - seg(t, ST.s04 - 0.3, ST.s04 - 0.05); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2, 420);
  CL.cutout(ctx, () => rr(ctx, -380, -72, 760, 112, 16), '#FFFDF8', { elev: 1.4 }); txt(ctx, 'PREPAID ROOM', 0, 12, 84, INK);
  ctx.save(); ctx.strokeStyle = '#2FA37E'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(318, -10); ctx.lineTo(338, 12); ctx.lineTo(372, -34); ctx.stroke(); ctx.restore();
  const money = t >= tFourteen - 0.05, key = money ? tFourteen - 0.05 : tSold - 0.05, p = t >= key ? E.back(seg(t, key, key + 0.3), 2.4) : 1;
  ctx.translate(0, 136); ctx.rotate(0.03); ctx.scale(p, p);
  const s = money ? '$1,400 / NIGHT' : 'SOLD OUT', w = money ? 640 : 470;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -60, w, 108, 14), C.red, { elev: 1.2 }); txt(ctx, s, 0, 22, 78, '#FFFDF8');
  ctx.restore();
}

// ---------- backgrounds ----------
const streetBg = (cx, cy, z, blur, o = {}) => (c, t) => { c.fillStyle = '#141B36'; c.fillRect(0, 0, W, H); halfPass(c, blur, g => layer(g, { x: cx, y: cy, z }, 1, w => S.street(w, t, o))); LT.haze(c, 'dark', 0.1); };
const lobbyBg = (cx, cy, z, blur, o = {}) => (c, t) => { c.fillStyle = '#CBBFAE'; c.fillRect(0, 0, W, H); halfPass(c, blur, g => layer(g, { x: cx, y: cy, z }, 1, w => S.lobby(w, t, o))); LT.haze(c, 'evening', 0.08); };
const paperBg = (col = '#E9E2D2') => c => { c.fillStyle = col; c.fillRect(0, 0, W, H); };
function bust(ctx, lt, bg, L, o) { // front bust over a background, slow push-in
  bg(ctx);
  const push = 1 + lt * (o.push ?? 0.03), nx = o.x ?? 540, ny = o.ny ?? 1470; ctx.save(); ctx.translate(nx, ny); ctx.scale(push, push); ctx.translate(-nx, -ny);
  LT.lit(ctx, c => R.bust(c, nx, ny, o.s ?? 2.7, L, { face: o.face, hands: o.hands || [], headTilt: o.tilt || 0, lean: o.lean || 0 }),
    { rim: o.rim ?? RIM_W, tint: { x0: nx, y0: 0, x1: nx + 540, y1: 0, color: o.shadeCol || 'rgb(170,175,220)', a: 1 }, ...(o.glow ? { glow: o.glow } : {}) });
  ctx.restore();
}
// the clerk behind the desk (world, lobby): side figure facing the guests (left), arms on the counter
function clerkAt(w, x, t, face, o = {}) {
  LT.lit(w, g => R.figure(g, x, 0, 1, -1, CLERK, { hip: [0, -256], lean: o.lean ?? 0.04, armN: o.armN || { hand: [150, -440], grip: 'relax' }, armF: o.armF || { hand: [120, -446], grip: 'relax' }, face, headTilt: o.tilt ?? 0 }), { rim: RIM_W });
}
// the couple standing at the desk (world, lobby), side view facing right
function coupleAtDesk(w, t, lt, fk, fj, o = {}) {
  const x = o.x ?? -560;
  LT.lit(w, g => R.figure(g, x - 260, 0, 1, 1, JIM, { lean: 0.02, armN: o.jArm || { hand: [60, -330], grip: 'relax' }, armF: { hand: [-20, -300] }, face: fj }), { rim: RIM_W });
  w.save(); w.translate(x - 130, 0); S.suitcase(w, 0.72, C.red); w.restore(); w.save(); w.translate(x - 470, 0); S.suitcase(w, 0.78, '#4D8DFF'); w.restore();
  LT.lit(w, g => R.figure(g, x, 0, 1, 1, KRIS, { lean: o.kLean ?? 0.04, armN: o.kArm || { hand: [150, -400], grip: 'relax' }, armF: { hand: [40, -300] }, face: fk, headTilt: o.kTilt ?? 0 }), { rim: RIM_W });
}

// ================= SHOTS =================
const SH = []; const shot = (id, t0, t1, draw, out) => SH.push({ id, t0, t1, draw, out });

// A1 (h01 "They prepaid this hotel room."): Jimmy's hand holds the phone: BOOKING CONFIRMED, the green PREPAID stamp lands on the word
shot('A1 prepaid', 0, ST.h02 - 0.1, (ctx, t, lt) => {
  lobbyBg(-200, -1100, 0.75, 12, { sign: 'COURTYARD' })(ctx, t);
  const z = 1 + lt * 0.03; ctx.save(); ctx.translate(540, 1010); ctx.scale(z, z); ctx.rotate(-0.04);
  LT.lit(ctx, c => { R.hand(c, [30, 300], -1.75, JIM.skin, 'hold', { size: 2.6 }); S.phone(c, (g, w, h) => S.bookingScreen(g, w, h, { paid: seg(t, tPrepaid - 0.05, tPrepaid + 0.25) }), 1.55); }, { rim: RIM_W });
  ctx.restore();
  LT.grade(ctx, 'evening', { vignette: 0.2 });
});
// A2 (h02 "The front desk said: 'We're sold out.'"): at the desk; the clerk shakes his head behind the monitor, the SOLD OUT stamp slams over the counter
shot('A2 sold out', ST.h02 - 0.1, ST.h03 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 140, -470, 0.86], [3, 170, -470, 0.92]], lt), sh = shake(t, tSold, 12);
  ctx.fillStyle = '#CBBFAE'; ctx.fillRect(0, 0, W, H);
  layer(ctx, { ...c, shx: sh }, 1, w => {
    S.lobby(w, t, { sign: 'COURTYARD', empty: t > tSold ? 24 : 0 });
    clerkAt(w, 560, t, R.expr(t > tSold - 0.3 ? 'tired' : 'neutral', { look: [0.5, 0.1], blink: blink(lt, 2.6), mouth: t > ST.h02 + 0.3 && t < end('h02') ? 'talk' : 'flat', talk: talk(t, 0.6) }), { tilt: Math.sin(t * 6) * 0.06 * (t > tSold ? 1 : 0) });
    S.deskMonitor(w, 330, -560, 0.7, (g, ww, hh) => S.roomsScreen(g, ww, hh, seg(t, ST.h02, tSold)));
    S.desk(w, 380, 820, { label: 'FRONT DESK' });
    coupleAtDesk(w, t, lt, R.expr(t > tSold ? 'surprised' : 'smile', { look: [0.8, -0.2], blink: blink(lt, 3.1) }), R.expr(t > tSold ? 'shocked' : 'smile', { look: [0.8, -0.2], blink: blink(lt, 2.8, 1) }), { x: -140 });
  });
  stampWord(ctx, 'SOLD OUT', 560, 1010, t, tSold, { size: 110 });
  LT.grade(ctx, 'evening', { vignette: 0.2 });
});
// A3 (h03 "That same night, their new room cost $1,400."): Kristine, shocked, under the moon; the $1,400 tag drops on a string and swings
shot('A3 1400', ST.h03 - 0.12, ST.s04 - 0.12, (ctx, t, lt) => {
  bust(ctx, lt, c => streetBg(400, -1300, 0.6, 12)(c, t), KRIS, { x: 560, ny: 1500, s: 2.6, rim: RIM_MOON, shadeCol: 'rgb(140,150,210)',
    face: R.expr(t > tFourteen ? 'shocked' : 'worried', { look: t > tFourteen ? [-0.4, -0.6] : [0.2, 0], blink: blink(lt, 2.7) }), tilt: t > tFourteen ? -0.06 : 0 });
  if (t > tFourteen - 0.15) { const d = E.out(seg(t, tFourteen - 0.15, tFourteen + 0.15)), sw = Math.sin((t - tFourteen) * 6) * 0.1 * (1 - seg(t, tFourteen, tFourteen + 2));
    ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(840, 640); ctx.lineTo(lerp(840, 760, d), lerp(500, 770, d)); ctx.stroke();
    ctx.translate(lerp(560, 520, d), lerp(560, 790, d)); ctx.rotate(sw - 0.05); priceTag(ctx, '$1,400', C.red, '#FFFDF8', 110); ctx.restore(); }
  LT.grade(ctx, 'dark', { vignette: 0.22 });
});

// B1 (s04 "Nassau, the Bahamas. Kristine and Jimmy Dworkin, from California."): crane down from the moon to the street; a taxi pulls away, the couple with their bags
const tKris = at('s04', 'kristine'), tCal = at('s04', 'california');
shot('B1 nassau', ST.s04 - 0.12, ST.s05 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 200, -2000, 0.55], [1.6, 0, -700, 0.62], [4.5, 60, -640, 0.7]], lt);
  ctx.fillStyle = '#141B36'; ctx.fillRect(0, 0, W, H);
  layer(ctx, c, 1, w => {
    S.street(w, t, {});
    w.save(); w.translate(lerp(250, 1500, E.in(seg(lt, 0.3, 2.5))), 300); S.taxi(w, 1, -lt * 6); w.restore();
    const ph = lt * 0.3;
    LT.lit(w, g => R.figure(g, -380, 60, 1, 1, KRIS, { armN: { hand: [40, -260] }, face: R.expr('happy', { blink: blink(lt, 3) }), headTilt: -0.05 }), { rim: RIM_MOON });
    walker(w, -40, JIM, ph, { stride: 4, face: R.expr('smile', { look: [-0.6, -0.4], blink: blink(lt, 2.7, 1) }), bag: '#4D8DFF', facing: -1 });
    w.save(); w.translate(-560, 60); S.suitcase(w, 0.78, C.red); w.restore();
  });
  LT.grade(ctx, 'dark', { vignette: 0.18 });
  const u = pop(t, ST.s04 + 0.05, 0.3, 2.6), fade = 1 - seg(t, tKris - 0.3, tKris); if (u > 0 && fade > 0) { ctx.save(); ctx.globalAlpha = fade; ctx.translate(540, 560); ctx.rotate(-0.04); ctx.scale(u * 1.05, u * 1.05);
    CL.cutout(ctx, () => rr(ctx, -420, -74, 840, 124, 14), '#171717', { elev: 1.4, tex: 0 }); txt(ctx, 'NASSAU, THE BAHAMAS', 0, 22, 70, C.yellow); ctx.restore(); }
  label(ctx, 'KRISTINE', 330, 840, pop(t, tKris), { arrow: 1, size: 54, col: C.yellow });
  label(ctx, 'JIMMY', 700, 860, pop(t, tKris + 0.4), { arrow: -1, size: 54, col: C.yellow, rot: 0.03 });
  label(ctx, 'FROM CALIFORNIA', 540, 620, pop(t, tCal), { size: 50 });
});
// B2 (s05 "Night one of an eight-day trip:"): the luggage tag on the handle: eight nights, the first one PAID
const tEight = at('s05', 'eight'), tCourt = at('s05', 'courtyard'), tPre2 = at('s05', 'prepaid');
shot('B2 trip tag', ST.s05 - 0.12, tCourt - 0.12, (ctx, t, lt) => {
  streetBg(-300, -500, 1.4, 14)(ctx, t);
  ctx.save(); ctx.translate(540, 1080 + Math.sin(lt * 2) * 6); ctx.rotate(-0.05 + Math.sin(lt * 1.7) * 0.02);
  ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(470, -900); ctx.quadraticCurveTo(520, -400, 450, -100); ctx.stroke();
  LT.lit(ctx, c => S.tripTag(c, 1.08, seg(t, ST.s05 + 0.1, tEight + 0.9)), { rim: RIM_W });
  ctx.restore();
  LT.grade(ctx, 'dark', { vignette: 0.2 });
});
// B3 (s05 "a Courtyard by Marriott. Prepaid."): the hotel's facade at night; they roll their bags to the door
shot('B3 hotel', tCourt - 0.12, ST.s06 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, -250, -560, 0.66], [3, -150, -560, 0.72]], lt);
  ctx.fillStyle = '#141B36'; ctx.fillRect(0, 0, W, H);
  layer(ctx, c, 1, w => {
    S.nightSky(w, t, -2500, 2500, -3000, 0, { moonAt: [800, -1800], moonR: 110 });
    S.facade(w, 0, 0, 1700, 1300, '#D9CBB8', 3, { litP: 0.6, night: 0.25, sign: { text: 'COURTYARD BY MARRIOTT', w: 1100, col: '#2E3A59', fg: '#FFFDF8', glow: 'rgba(255,230,180,1)' }, balcony: false, shutter: '#5A6E8A' });
    w.fillStyle = '#4A4E5C'; w.fillRect(-2500, 0, 5000, 600); S.lamp(w, -950, 0); S.palm(w, 1000, 0, 0.9, Math.sin(t) * 0.05);
    const x = lerp(-900, -250, seg(lt, 0, 3.2)), ph = lt * 7;
    walker(w, x - 280, JIM, ph, { bag: '#4D8DFF', rim: RIM_W, face: R.expr('smile', { blink: blink(lt, 2.7) }) });
    walker(w, x, KRIS, ph + 1.3, { bag: C.red, rim: RIM_W, face: R.expr('happy', { blink: blink(lt, 3.1) }) });
  });
  LT.grade(ctx, 'evening', { vignette: 0.2 });
  label(ctx, 'NIGHT 1 · PREPAID ✓', 540, 600, pop(t, tPre2 - 0.05), { size: 62, col: '#2FA37E', fg: '#FFFDF8' });
});

// C1 (s06 "At check-in... no room."): the clerk types; the room grid on the screen turns red, one tile after another; 0 AVAILABLE
const tNo = at('s06', 'no'), tOver = at('s06', 'overbooked');
shot('C1 no room', ST.s06 - 0.12, tOver - 0.12, (ctx, t, lt) => {
  lobbyBg(500, -1000, 0.9, 12, { sign: 'COURTYARD' })(ctx, t);
  const z = 1 + lt * 0.04; ctx.save(); ctx.translate(540, 900); ctx.scale(z, z);
  ctx.save(); ctx.translate(-20, 0); S.monitor(ctx, 760, 480, (g, ww, hh) => S.roomsScreen(g, ww, hh, seg(t, ST.s06 + 0.2, tNo + 0.2))); ctx.restore();
  ctx.restore();
  // the clerk's hands on the keyboard (foreground)
  const ty = Math.sin(t * 16) * 8 * (t < tNo ? 1 : 0);
  ctx.save(); ctx.translate(0, 1500); rr(ctx, 160, -40, 760, 120, 18); R.fillStroke(ctx, '#3A3F48', 5); ctx.fillStyle = '#5A606C'; for (let i = 0; i < 24; i++) ctx.fillRect(190 + (i % 12) * 60, -20 + Math.floor(i / 12) * 46, 48, 36);
  R.hand(ctx, [380, 30 + ty], -1.5, CLERK.skin, 'relax', { size: 2.4 }); R.hand(ctx, [700, 30 - ty], -1.7, CLERK.skin, 'relax', { size: 2.4, mirror: true }); ctx.restore();
  LT.grade(ctx, 'office', { vignette: 0.22 });
});
// C2 (s06 "The hotel was overbooked."): the key wall behind the desk: every hook empty; OVERBOOKED stamps across it
shot('C2 overbooked', tOver - 0.12, ST.s07 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 1130, -1440, 1.0], [2, 1130, -1440, 1.08]], lt);
  ctx.fillStyle = '#CBBFAE'; ctx.fillRect(0, 0, W, H);
  layer(ctx, { ...c, shx: shake(t, tOver + 0.1, 10) }, 1, w => S.lobby(w, t, { sign: 'COURTYARD', empty: 24 }));
  stampWord(ctx, 'OVERBOOKED', 540, 980, t, tOver + 0.1, { size: 110, rot: -0.1 });
  LT.grade(ctx, 'evening', { vignette: 0.22 });
});
// C3 (s07 "Kristine says the staff were 'pretty rude about it.'"): Kristine, unimpressed, the quote in a paper bubble; the source note under it
const tRude = at('s07', 'pretty');
shot('C3 rude', ST.s07 - 0.12, ST.s08 - 0.12, (ctx, t, lt) => {
  bust(ctx, lt, c => lobbyBg(300, -1100, 0.8, 14, { sign: 'COURTYARD' })(c, t), KRIS, { x: 600, ny: 1390, s: 2.3, push: 0.02,
    face: R.expr('squint', { lid: [0.3, 0.3], look: [-0.5, 0], blink: blink(lt, 2.4), mouth: 'frown' }), tilt: 0.05 });
  const u = pop(t, tRude - 0.1, 0.35, 2.2); if (u > 0) { ctx.save(); ctx.translate(430, 640); ctx.scale(u, u); ctx.rotate(-0.04);
    CL.cutout(ctx, () => { rr(ctx, -340, -110, 680, 200, 30); ctx.moveTo(120, 88); ctx.lineTo(200, 190); ctx.lineTo(210, 88); }, '#FFFDF8', { elev: 1.6 });
    txt(ctx, '“pretty rude', 0, -18, 70, INK); txt(ctx, 'about it.”', 0, 58, 70, C.red); ctx.restore(); }
  note(ctx, 'KRISTINE, TO NBC BAY AREA', 820, pop(t, tRude + 0.3));
  LT.grade(ctx, 'evening', { vignette: 0.2 });
});
// C4 (s08 "Hotels often overbook on purpose: some guests never show up."): EXAMPLE — 8 hooks, 9 bookings slide in; one no-show fades, so a 9th
// booking is taken; when everybody comes, the last card has nowhere to go and drops (the Dworkins' card)
const tSome = at('s08', 'some'), tShow = at('s08', 'show');
shot('C4 mechanism', ST.s08 - 0.12, ST.s09 - 0.12, (ctx, t, lt) => {
  paperBg('#E9DCC6')(ctx);
  const x0 = 100, cw = 110;
  ctx.save(); ctx.translate(0, 0);
  CL.cutout(ctx, () => rr(ctx, x0 - 30, 760, 8 * cw + 60, 300, 14), '#6B4A2B', { elev: 1.2 });
  for (let i = 0; i < 8; i++) { const x = x0 + i * cw; rr(ctx, x + 8, 780, cw - 16, 260, 6); ctx.fillStyle = '#3E2A1E'; ctx.fill(); ell(ctx, x + cw / 2, 812, 12, 12); ctx.fillStyle = '#E8C66A'; ctx.fill(); }
  txt(ctx, '8 ROOMS', 540, 720, 64, INK);
  for (let i = 0; i < 9; i++) { // booking cards slide down into the slots
    const t0 = ST.s08 + 0.1 + i * 0.16, u = E.out(seg(t, t0, t0 + 0.4)); if (u <= 0) continue;
    const noShow = i === 3 && t > tSome, last = i === 8, slot = last ? 3 : i, x = x0 + slot * cw + cw / 2;
    let y = lerp(420, 920, u), a = 1, rot = 0;
    if (last) { const v = seg(t, tShow - 0.1, tShow + 0.6); if (t < tSome) y = lerp(420, 560, u); else if (v > 0) { y = lerp(920, 1420, E.in(v)); rot = v * 1.2; } else y = lerp(560, 920, E.out(seg(t, tSome, tSome + 0.4))); }
    if (noShow) a = 1 - seg(t, tSome, tSome + 0.3) * (t < tShow - 0.1 ? 1 : 0) - 0; // the no-show fades ... then (everyone shows) comes back
    if (i === 3 && t > tShow - 0.1) a = seg(t, tShow - 0.1, tShow + 0.2);
    ctx.save(); ctx.globalAlpha = clamp(a); ctx.translate(x + (last && t > tSome && t < tShow - 0.1 ? 0 : 0), y); ctx.rotate(rot);
    CL.cutout(ctx, () => rr(ctx, -44, -64, 88, 128, 8), last ? C.red : '#FFFDF8', { elev: 1 }); txt(ctx, last ? 'D' : '✓', 0, 18, 50, last ? '#FFFDF8' : '#2FA37E'); ctx.restore();
  }
  ctx.restore();
  label(ctx, 'SOME GUESTS NEVER SHOW UP', 540, 560, pop(t, tSome - 0.05), { size: 58, col: C.yellow });
  label(ctx, '9 BOOKINGS', 540, 1300, pop(t, ST.s08 + 1.0), { size: 50, rot: 0.03 });
  note(ctx, 'EXAMPLE · NOT THIS HOTEL\'S NUMBERS', 1400, 1);
});

// D1 (s09 "So around midnight, they walked the streets of Nassau."): side tracking shot: the couple drags the bags under the lamps, the moon follows
const tMid = at('s09', 'midnight'), tWalked = at('s09', 'walked');
shot('D1 walk', ST.s09 - 0.12, ST.s10 - 0.12, (ctx, t, lt) => {
  const x = -1600 + lt * 260, c = cam([[0, x + 120, -560, 0.82], [4, x + 140, -560, 0.82]], lt);
  ctx.fillStyle = '#141B36'; ctx.fillRect(0, 0, W, H);
  const cc = { ...c, x: -1600 + lt * 260 + 140 };
  layer(ctx, cc, 1, w => {
    S.street(w, t, { litP: 0.1 });
    walker(w, -1600 + lt * 260 - 300, JIM, lt * 6.5, { bag: '#4D8DFF', face: R.expr('tired', { look: [0.3, -0.4], blink: blink(lt, 2.6) }) });
    walker(w, -1600 + lt * 260, KRIS, lt * 6.5 + 1.4, { bag: C.red, face: R.expr('worried', { look: [0.9, -0.3], blink: blink(lt, 3.0) }), tilt: Math.sin(lt * 2) * 0.05 });
  });
  LT.grade(ctx, 'dark', { vignette: 0.24 });
  const u = pop(t, tMid - 0.1, 0.3, 2.6); if (u > 0) { ctx.save(); ctx.translate(540, 560); ctx.rotate(-0.04); ctx.scale(u * 1.2, u * 1.2);
    CL.cutout(ctx, () => rr(ctx, -320, -70, 640, 118, 14), '#171717', { elev: 1.4, tex: 0 }); txt(ctx, 'AROUND MIDNIGHT', 0, 20, 64, C.yellow); ctx.restore(); }
});
// D2 (s10 "One room left: a suite at Margaritaville."): the street ends at the resort; Kristine points; one window lights up: 1 LEFT
const tOne = at('s10', 'one'), tSuite = at('s10', 'suite'), tMarg = at('s10', 'margaritaville');
shot('D2 resort', ST.s10 - 0.12, ST.s11 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 2900, -930, 0.4], [2.6, 3050, -950, 0.44]], lt);
  ctx.fillStyle = '#141B36'; ctx.fillRect(0, 0, W, H);
  layer(ctx, c, 1, w => {
    S.street(w, t, { resort: [3500], resortO: { oneLeft: seg(t, tOne - 0.05, tOne + 0.3) } });
    walker(w, 2050, JIM, 0, { stride: 2, bag: '#4D8DFF', face: R.expr('surprised', { look: [1, -0.6], blink: blink(lt, 2.6) }) });
    walker(w, 2330, KRIS, 0, { stride: 2, bag: C.red, face: R.expr('happy', { look: [1, -0.7] }), armN: { hand: [180, -560], grip: 'point' } });
  });
  LT.grade(ctx, 'dark', { vignette: 0.2 });
  label(ctx, '1 ROOM LEFT', 760, 880, pop(t, tOne), { arrow: 1, arrowX: 60, size: 64, col: C.yellow });
  label(ctx, 'A SUITE', 760, 1020, pop(t, tSuite), { size: 54, rot: 0.03 });
});
// D3 (s11 "Fourteen hundred dollars."): the resort desk; the terminal prints the bill: SUITE · 1 NIGHT · $1,400
const tF2 = at('s11', 'fourteen'), tFor = at('s11', 'for'), tOneN = at('s11', 'one');
shot('D3 bill', ST.s11 - 0.12, tFor - 0.1, (ctx, t, lt) => {
  lobbyBg(0, -1100, 0.8, 12, { resort: 1, sign: 'MARGARITAVILLE' })(ctx, t);
  const len = lerp(0, 700, E.out(seg(t, ST.s11 - 0.1, tF2 + 0.35))), sh = shake(t, tF2 + 0.1, 10);
  ctx.save(); ctx.translate(540 + sh, 1250); ctx.scale(1.25, 1.25);
  ctx.save(); ctx.beginPath(); ctx.rect(-400, -1200, 800, 1200); ctx.clip(); ctx.translate(0, -len - 30);
  S.receiptStrip(ctx, 560, 700, [['SUITE · 1 NIGHT', '', false]], { title: 'MARGARITAVILLE', lh: 160, top: 130, total: '$1,400', amtSize: 60, labSize: 48 }); ctx.restore();
  S.terminal(ctx, 1); ctx.restore();
  LT.grade(ctx, 'evening', { vignette: 0.2 });
});
// D4 (s11 "For ONE night."): Jimmy holds the long receipt and looks at us, deadpan
shot('D4 deadpan', tFor - 0.1, ST.s12 - 0.12, (ctx, t, lt) => {
  bust(ctx, lt, c => lobbyBg(-600, -1100, 0.8, 14, { resort: 1, sign: 'MARGARITAVILLE' })(c, t), JIM, { x: 400, ny: 1500, s: 2.5, push: 0.02,
    face: R.expr('tired', { look: [0, 0.1], blink: blink(lt, 2.2, 0.8) }), tilt: -0.04 });
  ctx.save(); ctx.translate(850, 700 + Math.sin(lt * 3) * 6); ctx.rotate(0.08); S.receiptStrip(ctx, 300, 640, [['SUITE · 1 NIGHT', '', false]], { lh: 150, top: 40, total: '$1,400', amtSize: 40, labSize: 28 }); ctx.restore();
  const u = pop(t, tOneN - 0.05, 0.3, 2.6); if (u > 0) { ctx.save(); ctx.translate(540, 540); ctx.rotate(-0.05); ctx.scale(u * 1.3, u * 1.3);
    CL.cutout(ctx, () => rr(ctx, -300, -70, 600, 120, 14), C.red, { elev: 1.4 }); txt(ctx, 'FOR 1 NIGHT', 0, 22, 74, '#FFFDF8'); ctx.restore(); }
  LT.grade(ctx, 'evening', { vignette: 0.2 });
});

// E1 (s12 "They started emailing for help."): Kristine's phone: emails fly out of it as paper planes, one after another
shot('E1 emails', ST.s12 - 0.12, ST.s13 - 0.12, (ctx, t, lt) => {
  paperBg('#DCE6F2')(ctx);
  const n = Math.min(4, Math.floor(seg(t, ST.s12, end('s12') + 0.2) * 4.99));
  for (let i = 0; i < 6; i++) { const t0 = ST.s12 + 0.2 + i * 0.32, u = seg(t, t0, t0 + 1.1); if (u <= 0 || u >= 1) continue;
    ctx.save(); ctx.translate(lerp(560, 1250, E.in(u)) - i * 30, lerp(980, 260 + i * 60, E.out(u))); ctx.rotate(-0.4); S.paperPlane(ctx, 1.2); ctx.restore(); }
  ctx.save(); ctx.translate(500, 1050); ctx.rotate(0.05);
  LT.lit(ctx, c => { R.hand(c, [30, 330], -1.6, KRIS.skin, 'hold', { size: 3 }); S.phone(c, (g, w, h) => S.inboxScreen(g, w, h, n), 2.0); }, { rim: RIM_W }); ctx.restore();
  label(ctx, 'HELP?', 300, 520, pop(t, ST.s12 + 0.3), { size: 70, col: C.yellow, rot: -0.06 });
});
// E2 (s13 "Kristine says Marriott did... nothing."): the inbox: REPLIES: 0; a tumbleweed rolls across; Kristine, tired
const tNothing = at('s13', 'nothing');
shot('E2 nothing', ST.s13 - 0.12, ST.s14 - 0.12, (ctx, t, lt) => {
  bust(ctx, lt, paperBg('#DCE6F2'), KRIS, { x: 760, ny: 1470, s: 1.9, push: 0.015, face: R.expr('tired', { look: [-0.8, 0.3], blink: blink(lt, 2.9) }), tilt: 0.08 });
  ctx.save(); ctx.translate(340, 860); ctx.rotate(-0.06); S.phone(ctx, (g, w, h) => S.inboxScreen(g, w, h, 4, { replies: 0 }), 1.7); ctx.restore();
  if (t > tNothing - 0.2) { const u = seg(t, tNothing - 0.2, tNothing + 1.6), x = lerp(-150, 1250, u), y = 1250 - Math.abs(Math.sin(u * 9)) * 70;
    ctx.save(); ctx.translate(x, y); ctx.rotate(u * 14); ctx.strokeStyle = '#8A6A3A'; ctx.lineWidth = 5; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(Math.sin(i) * 10, Math.cos(i * 1.3) * 10, 40 + (i % 3) * 10, i, i + 3.5); ctx.stroke(); } ctx.restore(); }
  note(ctx, 'KRISTINE\'S ACCOUNT', 1380, pop(t, ST.s13 + 0.2), 360);
});
// E3 (s14 "So they contacted NBC Bay Area."): a news camera on its tripod turns to the couple; REC
const tNBC = at('s14', 'nbc');
shot('E3 nbc', ST.s14 - 0.12, ST.s15 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, -40, -400, 0.98], [2, 0, -400, 1.04]], lt);
  ctx.fillStyle = '#2E3A59'; ctx.fillRect(0, 0, W, H);
  layer(ctx, c, 1, w => {
    w.fillStyle = '#3E4A6E'; w.fillRect(-2000, -2400, 4000, 2400); LT.glow(w, 200, -700, 900, 'rgba(255,240,210,1)', 0.25);
    w.fillStyle = '#5A647E'; w.fillRect(-2000, 0, 4000, 900);
    LT.lit(w, g => R.figure(g, 240, 0, 1, -1, JIM, { armN: { hand: [40, -300] }, face: R.expr('neutral', { look: [0.6, 0], blink: blink(lt, 2.7) }) }), { rim: RIM_W });
    LT.lit(w, g => R.figure(g, 470, 0, 1, -1, KRIS, { armN: { hand: [160, -420], grip: 'open' }, face: R.expr('neutral', { look: [0.6, 0], mouth: 'talk', talk: talk(t, 0.6), blink: blink(lt, 3) }) }), { rim: RIM_W });
    w.save(); w.translate(-330, 0); S.tvCamera(w, 0.95, t, { label: 'NBC BAY AREA' }); w.restore();
  });
  label(ctx, 'NBC BAY AREA', 540, 600, pop(t, tNBC), { size: 64, col: C.yellow });
  LT.grade(ctx, 'office', { vignette: 0.22 });
});

// F1 (s15 "A hospitality professor told NBC big hotels usually pay for your first night elsewhere."): the professor at a board;
// the diagram draws: FULL hotel -> taxi -> another hotel, 1ST NIGHT PAID. Labelled as his view of usual practice.
const tProf = at('s15', 'professor'), tUsually = at('s15', 'usually'), tFirst = at('s15', 'first');
shot('F1 professor', ST.s15 - 0.12, ST.s16 - 0.12, (ctx, t, lt) => {
  paperBg('#2F4A3E')(ctx);
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 3; for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.moveTo(0, 300 + i * 120); ctx.lineTo(W, 300 + i * 120 + 40); ctx.stroke(); } ctx.restore();
  // diagram (chalk)
  const d = seg(t, tUsually - 0.2, tFirst + 0.6);
  const hotel = (x, lab, col) => { ctx.save(); ctx.translate(x, 860); rr(ctx, -110, -200, 220, 200, 6); R.fillStroke(ctx, col, 5); for (let i = 0; i < 6; i++) { ctx.fillStyle = '#FFE3A0'; ctx.fillRect(-80 + (i % 3) * 60, -170 + Math.floor(i / 3) * 70, 40, 44); } txt(ctx, lab, 0, 60, 40, '#FFFDF8'); ctx.restore(); };
  if (d > 0) { hotel(220, 'FULL', '#B85A4A'); ctx.save(); ctx.globalAlpha = clamp(d * 2 - 0.6); hotel(860, 'NEARBY', '#4D8DFF'); ctx.restore();
    ctx.save(); ctx.strokeStyle = '#FFFDF8'; ctx.setLineDash([18, 14]); ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(340, 780); ctx.lineTo(lerp(340, 740, clamp(d * 1.6)), 780); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.translate(lerp(330, 640, clamp(d * 1.6)), 760); S.taxi(ctx, 0.3, -t * 8); ctx.restore(); }
  if (t > tFirst - 0.1) label(ctx, '1ST NIGHT PAID', 540, 1010, pop(t, tFirst - 0.1), { size: 54, col: C.yellow });
  bust(ctx, lt, () => {}, PROF, { x: 540, ny: 1500, s: 1.7, push: 0.01, rim: RIM_W, face: R.expr('neutral', { look: [0.4, -0.3], mouth: 'talk', talk: talk(t, t > ST.s15 && t < end('s15') ? 0.5 : 0), blink: blink(lt, 2.8) }) });
  label(ctx, 'HOSPITALITY PROFESSOR · UCF', 540, 560, pop(t, tProf), { size: 46, col: '#FFFDF8' });
  note(ctx, 'HIS VIEW OF USUAL PRACTICE — NOT A LAW', 1110, pop(t, tUsually + 0.3));
});
// F2 (s16 "Marriott's website, NBC found, only promises a new room... to elite members."): the site, as NBC summed it up
const tElite = at('s16', 'elite');
shot('F2 website', ST.s16 - 0.12, ST.s17 - 0.12, (ctx, t, lt) => {
  paperBg('#E9E2D2')(ctx);
  ctx.save(); ctx.translate(540, 940 + (1 - E.out(seg(t, ST.s16 - 0.1, ST.s16 + 0.4))) * 300); ctx.rotate(-0.02); S.website(ctx, 1.05, seg(t, tElite - 0.4, tElite + 0.6), t); ctx.restore();
});
// G1 (s17 "Then Marriott agreed to pay them back: the fourteen hundred, plus the original room."): the reply card fills in, AGREED TO REPAY
const tPay = at('s17', 'pay'), tOrig = at('s17', 'original');
shot('G1 repay', ST.s17 - 0.12, ST.s18 - 0.12, (ctx, t, lt) => {
  bust(ctx, lt, paperBg('#DDEFE6'), KRIS, { x: 320, ny: 1420, s: 1.3, push: 0.01, face: R.expr(t > tOrig ? 'happy' : 'surprised', { look: [0.6, -0.5], blink: blink(lt, 3) }) });
  bust(ctx, lt, () => {}, JIM, { x: 770, ny: 1430, s: 1.3, push: 0.01, face: R.expr(t > tOrig ? 'grin' : 'surprised', { look: [-0.6, -0.5], blink: blink(lt, 2.6, 1) }) });
  const u = seg(t, tPay - 0.2, end('s17') + 0.2);
  ctx.save(); ctx.translate(540, 760 + (1 - E.out(seg(t, ST.s17, ST.s17 + 0.4))) * -900); ctx.rotate(0.02); S.refundCard(ctx, 0.95, u); ctx.restore();
});
// G2 (s18 "In hotel slang, being sent to another hotel is called getting 'walked.'"): the slang card; under it a little hotel -> hotel hop
const tWalked2 = at('s18', 'walked'), tSent = at('s18', 'sent');
shot('G2 slang', ST.s18 - 0.12, ST.s19 - 0.12, (ctx, t, lt) => {
  paperBg('#E9DCC6')(ctx);
  ctx.save(); ctx.translate(540, 700); ctx.rotate(-0.02); S.slangCard(ctx, 1.0, seg(t, tSent - 0.1, tSent + 0.8)); ctx.restore();
  if (t > tWalked2 - 0.05) stampWord(ctx, 'WALKED', 540, 1160, t, tWalked2 - 0.05, { size: 120, col: '#2E3A59', rot: 0.06 });
});
// G3 (s19 "Usually, the hotel arranges the walk."): on the street: a taxi labelled HOTEL ARRANGES IT carries a guest from a full hotel to the next one
const tThis = at('s19', 'this'), tFoot = at('s19', 'foot');
shot('G3 usually', ST.s19 - 0.12, tThis - 0.12, (ctx, t, lt) => {
  const c = cam([[0, -400, -700, 0.5], [2, 400, -700, 0.5]], lt);
  ctx.fillStyle = '#141B36'; ctx.fillRect(0, 0, W, H);
  layer(ctx, c, 1, w => {
    S.street(w, t, { bulbs: false });
    w.save(); w.translate(lerp(-1200, 900, E.inOut(seg(lt, 0.1, 2.2))), 330); S.taxi(w, 1.2, -lt * 8, { label: 'THE HOTEL ARRANGES IT' }); w.restore();
  });
  LT.grade(ctx, 'dark', { vignette: 0.2 });
  label(ctx, 'USUALLY', 540, 600, pop(t, ST.s19), { size: 70, col: C.yellow });
});
// G4 (s19 "This time, the family did it... on foot."): back to the couple dragging their bags; the camera drops to their feet and wheels;
// the $1,400 tag hangs on the red suitcase; last frame echoes the first (PREPAID ROOM -> $1,400 / NIGHT)
shot('G4 on foot', tThis - 0.12, T + 0.1, (ctx, t, lt) => {
  const z = lerp(0.8, 1.35, E.inOut(seg(t, tFoot - 0.6, tFoot + 0.4))), x = -900 + lt * 240, yc = lerp(-560, -230, E.inOut(seg(t, tFoot - 0.6, tFoot + 0.4)));
  const cc = { x: x + 120, y: yc, z, r: 0 };
  ctx.fillStyle = '#141B36'; ctx.fillRect(0, 0, W, H);
  const walking = t < T - 0.9, ph = (walking ? lt : (T - 0.9 - (tThis - 0.12))) * 6.5;
  layer(ctx, cc, 1, w => {
    S.street(w, t, { litP: 0.1 });
    walker(w, x - 300, JIM, ph, { bag: '#4D8DFF', face: R.expr('tired', { look: [0.3, -0.2], blink: blink(lt, 2.6) }) });
    walker(w, x, KRIS, ph + 1.4, { bag: C.red, face: R.expr('squint', { look: [0.9, 0], blink: blink(lt, 3.0) }),
      tag: g => { g.save(); g.translate(-60, -40); g.rotate(-0.9 + Math.sin(t * 5) * 0.08); priceTag(g, '$1,400', C.red, '#FFFDF8', 64); g.restore(); } });
  });
  LT.grade(ctx, 'dark', { vignette: 0.24 });
  // the loop: the hook headline comes back on the last beat
  if (t > T - 1.3) { const a = seg(t, T - 1.3, T - 1.0); ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2, 420);
    CL.cutout(ctx, () => rr(ctx, -380, -72, 760, 112, 16), '#FFFDF8', { elev: 1.4 }); txt(ctx, 'PREPAID ROOM', 0, 12, 84, INK);
    ctx.translate(0, 136); ctx.rotate(0.03); CL.cutout(ctx, () => rr(ctx, -320, -60, 640, 108, 14), C.red, { elev: 1.2 }); txt(ctx, '$1,400 / NIGHT', 0, 22, 78, '#FFFDF8'); ctx.restore(); }
});

// ---------- edit, global overlays, subtitles ----------
SH.sort((a, b) => a.t0 - b.t0);
const ED = makeEdit(SH, W, H);
const SPLIT = { h01: [5], h02: [4, 3], h03: [3, 4, 3], s04: [3, 4, 2], s05: [6, 5], s06: [4, 4], s07: [5, 4], s08: [5, 5], s09: [3, 6], s10: [3, 4], s11: [3, 3], s12: [5], s13: [5], s14: [6],
  s15: [4, 5, 5], s16: [4, 5, 3], s17: [7, 3, 4], s18: [6, 6], s19: [6, 6, 2] };
const REPL = [[/fourteen hundred dollars/i, '$1,400'], [/the fourteen hundred/i, 'the $1,400'], [/Fourteen hundred dollars/i, '$1,400'], [/eight-day/i, '8-day'], [/\bONE night/, '1 night']];
function subs() {
  const G = [];
  Object.keys(ST).forEach(id => { const ws = V.words(id); let k0 = 0; SPLIT[id].forEach(n => { G.push({ id, words: ws.slice(k0, k0 + n) }); k0 += n; }); if (k0 !== ws.length) throw new Error(`subtitle split ${id}: ${k0} vs ${ws.length}`); });
  G.forEach((g, i) => { const nx = G[i + 1], e0 = Math.min(g.words[g.words.length - 1].t1, end(g.id)) + 0.4; g.t0 = g.words[0].t0 - 0.05;
    g.t1 = nx ? (nx.id === g.id ? nx.words[0].t0 - 0.05 : Math.min(e0, nx.words[0].t0 - 0.05)) : T;
    let s = g.words.map(x => x.w).join(' '); for (const [a, b] of REPL) s = s.replace(a, b); g.text = s; });
  return G;
}
const SUBS = subs();
const TEX = K.paperTexture(W, H);
function frame(ctx, t) {
  ED.frame(ctx, t);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  headline(ctx, t); stampLabel(ctx, t);
  ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.26; ctx.drawImage(TEX, 0, 0); ctx.restore();
  EN.drawSubtitles(ctx, t, SUBS, { y: 1565, size: 62, maxW: 820, x: 540, highlight: ['$1,400', 'prepaid', 'sold', 'overbooked', 'rude', 'midnight', 'one', 'nothing', 'elite', 'walked', 'foot'] });
}

// ---------- sound cues (for mix.py) ----------
function cues() {
  const c = [['night', 0, 0.5], ['tap', tPrepaid - 0.1, 0.6], ['stamp', tPrepaid + 0.05, 0.6], ['chime', tPrepaid + 0.1, 0.4]];
  c.push(['cut', ST.h02 - 0.12, 0.35], ['typing', ST.h02, 0.5], ['buzzer', tSold - 0.05, 0.5], ['slam', tSold, 0.8]);
  c.push(['cut', ST.h03 - 0.15, 0.35], ['tag', tFourteen - 0.1, 0.8], ['slam', tFourteen + 0.1, 0.6], ['kaching', tFourteen + 0.12, 0.45]);
  c.push(['cut', ST.s04 - 0.15, 0.35], ['night', ST.s04, 1.0], ['engine', ST.s04 + 0.2, 0.4], ['stamp', ST.s04 + 0.05, 0.5], ['tag', tKris, 0.4], ['tag', tKris + 0.4, 0.4], ['paper', tCal, 0.5]);
  c.push(['cut', ST.s05 - 0.12, 0.35]); for (let i = 0; i < 8; i++) c.push(['tick', ST.s05 + 0.15 + i * (tEight + 0.8 - ST.s05) / 8, 0.5]);
  c.push(['cut', tCourt - 0.12, 0.35], ['wheels', tCourt, 0.5], ['sparkle', tPre2, 0.4]);
  c.push(['cut', ST.s06 - 0.12, 0.35], ['typing', ST.s06, 0.6], ['blip', tNo, 0.5], ['buzzer', tNo + 0.15, 0.4], ['cut', tOver - 0.12, 0.35], ['stamp', tOver + 0.1, 0.9]);
  c.push(['cut', ST.s07 - 0.12, 0.35], ['pop', tRude - 0.1, 0.5]);
  c.push(['cut', ST.s08 - 0.12, 0.35]); for (let i = 0; i < 9; i++) c.push(['paper', ST.s08 + 0.1 + i * 0.16, 0.35]); c.push(['puff', tSome, 0.5], ['fall', tShow - 0.1, 0.6], ['thump', tShow + 0.5, 0.4]);
  c.push(['cut', ST.s09 - 0.12, 0.35], ['night', ST.s09, 1.0], ['wheels', ST.s09, 0.8], ['steps', ST.s09 + 0.3, 0.5], ['stamp', tMid - 0.05, 0.5]);
  c.push(['cut', ST.s10 - 0.12, 0.35], ['wheels', ST.s10, 0.4], ['sparkle', tOne, 0.6], ['tag', tSuite, 0.4]);
  c.push(['cut', ST.s11 - 0.12, 0.35], ['print', ST.s11, 0.5], ['print', ST.s11 + 0.55, 0.5], ['slam', tF2 + 0.1, 0.8], ['kaching', tF2 + 0.12, 0.5], ['cut', tFor - 0.12, 0.35], ['stamp', tOneN, 0.6]);
  c.push(['cut', ST.s12 - 0.12, 0.35]); for (let i = 0; i < 6; i++) c.push(['whoosh', ST.s12 + 0.2 + i * 0.32, 0.25]);
  c.push(['cut', ST.s13 - 0.12, 0.35], ['ping', ST.s13 + 0.1, 0.3], ['wind', tNothing - 0.2, 0.7]);
  c.push(['cut', ST.s14 - 0.12, 0.35], ['recbeep', tNBC, 0.5], ['shutter', tNBC + 0.2, 0.5]);
  c.push(['cut', ST.s15 - 0.12, 0.35], ['marker', tUsually - 0.2, 0.5], ['engine', tUsually + 0.2, 0.3], ['tag', tFirst - 0.1, 0.5], ['tag', tProf, 0.4]);
  c.push(['cut', ST.s16 - 0.12, 0.35], ['click', ST.s16 + 0.1, 0.5], ['marker', tElite - 0.4, 0.5], ['tick', tElite + 0.2, 0.5]);
  c.push(['cut', ST.s17 - 0.12, 0.35], ['whoosh', ST.s17, 0.4], ['paper', tPay, 0.5], ['kaching', at('s17', 'fourteen'), 0.35], ['tag', tOrig, 0.5], ['stamp', ST.s17 + (end('s17') + 0.2 - (tPay - 0.2)) * 0.85 + tPay - 0.2 - ST.s17, 0.8]);
  c.push(['cut', ST.s18 - 0.12, 0.35], ['paper', ST.s18, 0.5], ['marker', tSent, 0.5], ['stamp', tWalked2 - 0.05, 0.9]);
  c.push(['cut', ST.s19 - 0.12, 0.35], ['engine', ST.s19, 0.5], ['cut', tThis - 0.12, 0.35], ['night', tThis, 1.0], ['wheels', tThis, 1.0], ['steps', tThis + 0.2, 0.6], ['wheels', tFoot - 0.3, 1.0], ['slam', T - 1.25, 0.5]);
  return c;
}
const MUSIC = { b0: 0, story: ST.s04, desk: ST.s06, street: ST.s09, price: ST.s11, emails: ST.s12, nbc: ST.s15, fin: ST.s17, slang: ST.s18, hit: T - 1.25, end: T };

// ---------- CLI ----------
const [mode, a1, a2] = process.argv.slice(2);
if (mode === 'cues') { fs.writeFileSync(`${__dirname}/cues.json`, JSON.stringify({ T, voiceDir: VOD, vo: Object.entries(ST), speech: Object.fromEntries(Object.entries(SP).map(([id, [a, b]]) => [id, [ST[id] + a, ST[id] + b]])), sfx: cues(), music: MUSIC })); console.log('cues ok, T =', T, VOD); }
else if (mode === 'srt') {
  const f = s => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  fs.writeFileSync(a1, SUBS.map((g, i) => `${i + 1}\n${f(g.t0)} --> ${f(g.t1)}\n${g.text}\n`).join('\n')); console.log('srt ok', SUBS.length);
}
else if (mode === 'still') {
  const ts = a1.split(',').map(Number), tw = 270, th = 480, cols = Math.min(ts.length, 8), rows = Math.ceil(ts.length / cols);
  const sheet = createCanvas(tw * cols, th * rows), sc = sheet.getContext('2d'), cv = createCanvas(W, H), ctx = cv.getContext('2d');
  ts.forEach((t, i) => { frame(ctx, t); sc.drawImage(cv, (i % cols) * tw, Math.floor(i / cols) * th, tw, th); sc.fillStyle = '#E63946'; sc.font = '20px sans-serif'; sc.fillText(t.toFixed(2), (i % cols) * tw + 6, Math.floor(i / cols) * th + 22); });
  fs.writeFileSync(a2, sheet.toBuffer('image/png'));
} else if (mode === 'frame') { const cv = createCanvas(W, H), ctx = cv.getContext('2d'); frame(ctx, +a1); fs.writeFileSync(a2, cv.toBuffer('image/png')); }
else if (mode === 'shots') console.log(SH.map(s => `${s.id}\t${s.t0.toFixed(2)}–${s.t1.toFixed(2)}\t${(s.t1 - s.t0).toFixed(2)}s`).join('\n'));
else if (mode === 'video') (async () => {
  const cv = createCanvas(W, H), ctx = cv.getContext('2d');
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', a1], { stdio: ['pipe', 'inherit', 'inherit'] });
  const N = Math.round(T * FPS), T0 = Date.now();
  for (let f = 0; f < N; f++) { frame(ctx, f / FPS); const buf = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); if (f % 150 === 0) process.stderr.write(`${f}/${N} ${((Date.now() - T0) / 1000).toFixed(0)}s\n`); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
})();
module.exports = { T, ST, SH };
