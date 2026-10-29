// Episode 15 "The Pepsi Fighter Jet" (How It's Run) — a story told through the hero's actions, no cards: the ad (a Harrier hovers over a school,
// 7,000,000 PEPSI POINTS), John Leonard sees it, reads the rules (extra points: 10 cents each), finds investors, collects 15 real points, mails
// a $700,008.50 check with an order form for "1 HARRIER JET", a Pepsi employee opens it and sends the check back, John goes to court, the judge
// sides with Pepsi (NOT A LEGALLY BINDING OFFER), the dream jet pops, and he stands outside the courthouse holding the ad.
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
const { C, F, clamp, lerp, seg, E, rr, hash } = K;
const { INK, ell } = R;
const { W, H, layer, txt, fitTxt } = CK;
const { JOHN, KID1, KID2, INV1, INV2, CLERKP, JUDGE } = P;
const FPS = 30;
const k = (t, a, b, e = E.inOut) => e(seg(t, a, b));

// ---------- voice timeline (natural speed; real speech start/end from vo/speech.json, gaps only) ----------
const VOD = fs.existsSync(`${__dirname}/vo/speech.json`) ? 'vo' : 'vo_draft';
const LINES = JSON.parse(fs.readFileSync(`${__dirname}/script.json`));
const SP = JSON.parse(fs.readFileSync(`${__dirname}/${VOD}/speech.json`));
const GAP = { s01: 0.35, s02: 0.35, s03: 0.5, s04: 0.35, s05: 0.4, s06: 0.3, s07: 0.35, s08: 0.35, s09: 0.35, s10: 0.35, s11: 0.35, s12: 0.4, s13: 0.35, s14: 0.35, s15: 0.35, s16: 0.35, s17: 0.35, s18: 0.35, s19: 2.0 };
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
  LT.lit(ctx, c => { R.tube(c, [from, to], 130, JOHN.top, 5); R.hand(c, to, Math.atan2(to[1] - from[1], to[0] - from[0]), JOHN.skin, grip, { size: o.size || 3.2, over: o.over }); }, { rim: RIM_W });
}
function stampLabel(ctx, t) { // honesty label, small, top of the 3:4 crop, always on
  ctx.save(); ctx.translate(W / 2, 262); ctx.font = `28px ${F.black}`; const s = t < ST.s15 - 0.2 ? 'REAL STORY · 1996 · RE-ENACTMENT' : 'REAL STORY · COURT CASE · RE-ENACTMENT', w = ctx.measureText(s).width + 40;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -26, w, 50, 10), '#171717', { elev: 0.8, tex: 0 }); txt(ctx, s, 0, 10, 28, C.yellow); ctx.restore();
}
function headline(ctx, t) { // frame 0: the hook in big words, gone by "Seven million"
  const a = 1 - seg(t, ST.s02 - 0.25, ST.s02 - 0.02); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2, 430);
  CL.cutout(ctx, () => rr(ctx, -460, -70, 920, 118, 16), '#FFFDF8', { elev: 1.4 }); txt(ctx, 'A PEPSI AD OFFERED', 0, 14, 66, INK);
  ctx.translate(0, 124); ctx.rotate(0.025); CL.cutout(ctx, () => rr(ctx, -330, -62, 660, 110, 14), C.red, { elev: 1.2 }); txt(ctx, 'A FIGHTER JET', 0, 24, 78, '#FFFDF8');
  ctx.restore();
}

// ================= SHOTS =================
const SH = []; const shot = (id, t0, t1, draw, out) => SH.push({ id, t0, t1, draw, out });

// A1 (s01 "Pepsi put a fighter jet in a commercial."): the ad — a Harrier drops out of the sky and hovers over an American high school; two students shield their eyes
shot('A1 ad jet', 0, ST.s02 - 0.1, (ctx, t, lt) => {
  const c = cam([[0, 0, -900, 0.55], [2.4, 0, -560, 0.72]], lt), d = E.out(seg(lt, 0.0, 1.9)), jy = lerp(-1900, -640, d) + Math.sin(lt * 2.3) * 8 * d, noz = lerp(0.1, 1, k(lt, 0.4, 1.5)), kidsU = k(lt, 0.9, 1.5);
  ctx.fillStyle = '#7FB6F2'; ctx.fillRect(0, 0, W, H);
  layer(ctx, c, 1, w => {
    P.school(w, t, { wind: 1 });
    // downwash streaks and a ground ring of dust
    const fl = clamp(d * 1.6); w.save(); w.strokeStyle = 'rgba(255,255,255,0.7)'; w.lineWidth = 7; w.lineCap = 'round';
    for (let i = 0; i < 16; i++) { const x = -200 + i * 40 + 10 * Math.sin(lt * 30 + i), l0 = (lt * 900 + i * 173) % 560, y0 = jy + 120 + l0 * 0.9; if (y0 > -20) continue; w.globalAlpha = 0.5 * fl * (1 - l0 / 560); w.beginPath(); w.moveTo(x, y0); w.lineTo(x + (i % 2 ? 10 : -10), Math.min(-4, y0 + 90)); w.stroke(); } w.restore();
    w.save(); w.translate(40, jy); w.rotate(-0.03 + 0.05 * (1 - d)); P.harrier(w, 0.95, { noz, flame: 0.4 + 0.6 * d, t }); w.restore();
    // students
    for (const [x, L, s0, ex] of [[-420, KID1, 1.05, 'shocked'], [-230, KID2, 0.98, 'surprised']]) {
      LT.castShadow(w, g => R.figure(g, x, 40, s0, 1, L, {}), { x, floorY: 40, a: 0.18, blur: 3 });
      LT.lit(w, g => R.figure(g, x, 40, s0, 1, L, { hip: [0, -256 + 8 * kidsU], lean: -0.12 * kidsU, armN: { hand: [lerp(14, 60, kidsU), lerp(-60, -520, kidsU)], grip: 'relax' }, armF: { hand: [lerp(-14, 30, kidsU), lerp(-64, -480, kidsU)], grip: 'relax' },
        face: R.expr(kidsU > 0.5 ? ex : 'neutral', { look: [0.5, -1], blink: blink(lt, 2.7, x) }), headTilt: -0.2 * kidsU }), { rim: RIM_DAY });
    }
  });
  LT.grade(ctx, 'day', { vignette: 0.16 });
});
// A2 (s02 "Seven million Pepsi Points."): close on the jet; a banner slaps onto the fuselage and the big number lands
const tSeven = at('s02', 'seven'), tPts = at('s02', 'points');
shot('A2 7M', ST.s02 - 0.1, ST.s03 - 0.12, (ctx, t, lt) => {
  const z = 1 + lt * 0.05; bg(ctx, '#7FB6F2'); halfPass(ctx, 12, g => layer(g, { x: 0, y: -700, z: 0.8 }, 1, w => P.school(w, t, { wind: 1 })));
  LT.glow(ctx, 540, 1100, 900, 'rgba(255,255,255,1)', 0.2);
  ctx.save(); ctx.translate(560, 1160 + Math.sin(t * 2.3) * 8); ctx.scale(z * 0.96, z * 0.96); ctx.rotate(-0.045); P.harrier(ctx, 1, { noz: 0.95, flame: 0.9, t, plate: pop(t, tSeven + 0.3, 0.3) > 0.5 ? '7,000,000 PEPSI POINTS' : null }); ctx.restore();
  const u = pop(t, tSeven, 0.35, 2.2); if (u > 0) { ctx.save(); ctx.translate(540, 560); ctx.rotate(-0.035); ctx.scale(u, u);
    CL.cutout(ctx, () => rr(ctx, -440, -150, 880, 300, 24), '#171717', { elev: 2, tex: 0 }); fitTxt(ctx, '7,000,000', 0, 40, 190, C.yellow, 820); ctx.restore(); }
  const v = pop(t, tPts - 0.1, 0.3, 2.4); if (v > 0) { ctx.save(); ctx.translate(540, 770); ctx.rotate(0.03); ctx.scale(v, v); CL.cutout(ctx, () => rr(ctx, -330, -58, 660, 110, 14), C.red, { elev: 1.4 }); txt(ctx, 'PEPSI POINTS', 0, 26, 78, '#FFFDF8'); ctx.restore(); }
  LT.grade(ctx, 'day', { vignette: 0.16 });
});
// A3 (s03 "Obviously a joke... right?"): John laughs at the TV — the ad is playing — then the smile slips: wait... right?
const tJoke = at('s03', 'joke'), tRight = at('s03', 'right');
shot('A3 tv', ST.s03 - 0.12, ST.s04 - 0.12, (ctx, t, lt) => {
  const sus = k(t, tRight - 0.05, tRight + 0.45), laugh = k(t, tJoke - 0.25, tJoke + 0.15);
  const flick = 0.9 + 0.1 * Math.sin(t * 40);
  bustShot(ctx, lt, c => { bg(c, '#3A3548'); halfPass(c, 10, g => layer(g, { x: 0, y: -600, z: 0.9 }, 1, w => P.den(w, t, { lamp: 0.2 }))); c.fillStyle = 'rgba(25,25,50,0.45)'; c.fillRect(0, 0, W, H);
    c.save(); c.translate(540, 600); P.tv(c, 720, 470, (q, w, h) => { q.save(); q.translate(w / 2, h * 0.82); q.scale(0.3, 0.3); P.school(q, t, { wind: 1 }); q.save(); q.translate(40, -560 + Math.sin(t * 2.3) * 8); q.rotate(-0.03); P.harrier(q, 0.95, { noz: 1, flame: 1, t }); q.restore(); q.restore(); }); c.restore();
    LT.glow(c, 540, 600, 800, 'rgba(160,200,255,1)', 0.3 * flick); },
  { x: 540, ny: 1620, s: 2.45, push: 0.02, rim: RIM_COOL, tint: { x0: 0, y0: 1000, x1: 1080, y1: 1000, color: 'rgb(170,200,255)', a: 1 },
    face: R.exprMix(R.expr('grin', { look: [0, -0.7], blink: blink(lt, 2.9) }), R.expr('squint', { look: [0, -0.8] }), sus), tilt: lerp(-0.05, 0.06, sus) + Math.sin(t * 22) * 0.012 * laugh * (1 - sus) });
  LT.grade(ctx, 'dark', { vignette: 0.2 });
});
// A4 (s04 "Not to John Leonard."): the lamp comes on; the camera pushes into his face, eyes narrowing — he is not laughing
const tJohn = at('s04', 'john');
shot('A4 john', ST.s04 - 0.12, ST.s05 - 0.12, (ctx, t, lt) => {
  const lamp = k(t, ST.s04 - 0.05, ST.s04 + 0.3), grin = k(t, tJohn + 0.35, tJohn + 0.8);
  bustShot(ctx, lt, c => denBg(500, -700, 1.2, 12, { lamp })(c, t), { x: 540, ny: 1700, s: 3.15, push: 0.045,
    face: R.exprMix(R.expr('squint', { look: [0, 0.05], blink: blink(lt, 3.2, 1) }), R.expr('grin', { look: [0, 0], blink: blink(lt, 3.2, 1) }), grin), tilt: lerp(0.05, -0.04, grin) });
  label(ctx, 'JOHN LEONARD', 540, 520, pop(t, tJohn + 0.05), { arrow: 1, arrowX: 0, size: 72, col: C.yellow });
  LT.grade(ctx, 'evening', { vignette: 0.22 });
});

// B1 (s05 "In 1996, he spotted something in the rules."): at his desk, the Pepsi Stuff catalog open; he reads, hunched, then freezes: wait
const t1996 = at('s05', '1996'), tSpotted = at('s05', 'spotted');
shot('B1 desk', ST.s05 - 0.12, ST.s06 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 40, -560, 0.82], [2.0, 40, -540, 0.88], [2.7, 110, -500, 1.12]], lt), lean = lerp(0.18, 0.04, k(t, tSpotted - 0.1, tSpotted + 0.3)), sp = k(t, tSpotted - 0.1, tSpotted + 0.35);
  bg(ctx, '#D8C6A6');
  layer(ctx, c, 1, w => {
    P.den(w, t, {});
    CK.chair(w, -300, 0, 1);
    w.save(); w.translate(-20, -560); w.rotate(-0.04); P.catalog(w, 420, 320, { hl: k(t, tSpotted + 0.1, tSpotted + 0.7) }); w.restore();
    const scan = Math.sin(lt * 2.2) * 40 * (1 - sp);
    LT.castShadow(w, g => R.figure(g, -300, 0, 1, 1, JOHN, { hip: [0, -240], lean }), { x: -300, floorY: 0, a: 0.18, blur: 3 });
    LT.lit(w, g => R.figure(g, -300, 0, 1, 1, JOHN, { hip: [0, -240], lean, legN: { foot: [100, 0] }, legF: { foot: [74, 0] },
      armN: { hand: [lerp(250 + scan, 200, sp), lerp(-420, -470, sp)], grip: 'point' }, armF: { hand: [120, -330], grip: 'relax' },
      face: R.exprMix(R.expr('squint', { look: [0.9, 0.4 + 0.2 * Math.sin(lt * 3)], blink: blink(lt, 2.8) }), R.expr('surprised', { look: [0.9, 0.2] }), sp), headTilt: lerp(0.08, -0.06, sp) }), { rim: RIM_W });
  });
  const u = pop(t, t1996 - 0.02, 0.3, 2.6), fade = 1 - seg(t, t1996 + 1.6, t1996 + 1.9); if (u > 0 && fade > 0) { ctx.save(); ctx.globalAlpha = fade; ctx.translate(540, 560); ctx.rotate(-0.04); ctx.scale(u * 1.3, u * 1.3); CL.cutout(ctx, () => rr(ctx, -190, -64, 380, 116, 14), '#171717', { elev: 1.4, tex: 0 }); txt(ctx, '1996', 0, 24, 88, C.yellow); ctx.restore(); }
  LT.grade(ctx, 'evening', { vignette: 0.2 });
});
// B2 (s06 "You could BUY extra Pepsi Points."): extreme close-up of the rules; his finger stops on the line; the marker sweeps across it; BUY lands
const tBuy = at('s06', 'buy'), tExtra = at('s06', 'extra');
shot('B2 rules', ST.s06 - 0.12, ST.s07 - 0.12, (ctx, t, lt) => {
  denBg(0, -600, 1.3, 16)(ctx, t); ctx.fillStyle = 'rgba(40,25,10,0.3)'; ctx.fillRect(0, 0, W, H);
  const z = 1.0 + lt * 0.04, hl = k(t, tBuy - 0.05, tExtra + 0.45);
  ctx.save(); ctx.translate(540, 1060); ctx.scale(z, z); ctx.rotate(-0.03); P.catalog(ctx, 940, 1000, { hl }); ctx.restore();
  const fy = lerp(1400, 1105, k(t, ST.s06, tBuy)) + Math.sin(lt * 5) * 4; reach(ctx, [1500, 1900], [lerp(1050, 800, k(t, ST.s06, tBuy)), fy + 90], 'point', { size: 3.0 });
  const u = pop(t, tBuy, 0.3, 2.6); if (u > 0) { ctx.save(); ctx.translate(540, 560); ctx.rotate(-0.05); ctx.scale(u * 1.4, u * 1.4); CL.cutout(ctx, () => rr(ctx, -190, -72, 380, 130, 14), C.red, { elev: 1.8 }); txt(ctx, 'BUY', 0, 28, 100, '#FFFDF8'); ctx.restore(); }
  LT.grade(ctx, 'evening', { vignette: 0.24 });
});
// B3 (s07 "For ten cents each."): his face lights up; a huge $0.10 PER POINT tag lands; dimes rain down
const tTen = at('s07', 'ten'), tCents = at('s07', 'cents');
shot('B3 ten cents', ST.s07 - 0.12, ST.s08 - 0.12, (ctx, t, lt) => {
  const up = k(t, ST.s07 - 0.05, tTen + 0.25);
  bustShot(ctx, lt, c => denBg(300, -700, 1.2, 13)(c, t), { x: 540, ny: 1600, s: 2.6, push: 0.03,
    face: R.exprMix(R.expr('surprised', { look: [0, -0.1] }), R.expr('grin', { look: [0, -0.3], blink: blink(lt, 3, 1) }), up), tilt: lerp(0.05, -0.07, up), hands: [{ side: 1, hand: [160, 250 - 120 * up], grip: 'fist' }] });
  for (let i = 0; i < 9; i++) { const t0 = tTen + i * 0.07 + hash(i) * 0.1, u = (t - t0) / 0.9; if (u < 0 || u > 1.2) continue; const x = 140 + hash(i + 3) * 800, y = lerp(-100, 1250, E.in(clamp(u))); ctx.save(); ctx.translate(x, y); ctx.rotate(u * 7); ctx.scale(Math.cos(u * 14) * 0.9 + 0.1 * Math.sign(Math.cos(u * 14) || 1), 1);
    ell(ctx, 0, 0, 52, 52); R.fillStroke(ctx, '#C9CED6', 4); ell(ctx, 0, 0, 38, 38); ctx.strokeStyle = '#8E96A4'; ctx.lineWidth = R.px(ctx, 3); ctx.stroke(); txt(ctx, '10¢', 0, 14, 36, '#4A5060'); ctx.restore(); }
  const u = pop(t, tTen, 0.35, 2.2); if (u > 0) { ctx.save(); ctx.translate(540, 600); ctx.rotate(-0.04); ctx.scale(u, u); CL.cutout(ctx, () => rr(ctx, -430, -150, 860, 300, 26), '#171717', { elev: 2, tex: 0 });
    fitTxt(ctx, '$0.10', 0, 36, 190, C.yellow, 760); ctx.translate(0, 170); ctx.rotate(0.05); CL.cutout(ctx, () => rr(ctx, -320, -58, 640, 108, 14), C.red, { elev: 1.4 }); txt(ctx, 'PER POINT', 0, 26, 76, '#FFFDF8'); ctx.restore(); }
  LT.grade(ctx, 'evening', { vignette: 0.2 });
});

// C1 (s08 "So he found investors."): the handshake — two investors, a briefcase of cash, a firm shake; he is in business
const tInv = at('s08', 'investors');
shot('C1 investors', ST.s08 - 0.12, ST.s09 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -520, 0.88], [1.4, 20, -500, 0.96]], lt), sh = Math.sin(lt * 20) * 12 * (lt > 0.35 ? 1 : 0), meet = [-165, -300 + sh];
  bg(ctx, '#D8C6A6');
  layer(ctx, c, 1, w => {
    P.den(w, t, {});
    const jx = -330, ix = -10, i2 = 270, ap = k(t, ST.s08, ST.s08 + 0.35);
    LT.castShadow(w, g => { R.figure(g, jx, 0, 1, 1, JOHN, {}); R.figure(g, ix, 0, 1, -1, INV1, {}); R.figure(g, i2, 0, 1, -1, INV2, {}); }, { x: 0, floorY: 0, a: 0.16, blur: 3 });
    LT.lit(w, g => R.figure(g, jx, 0, 1, 1, JOHN, { lean: 0.05, armN: { hand: R.toLocal(jx, 0, 1, 1, meet), grip: 'open' }, armF: { hand: [-30, -300], grip: 'relax' }, face: R.expr('grin', { look: [1, 0], blink: blink(lt, 3.1) }), headTilt: -0.05 }), { rim: RIM_W });
    LT.lit(w, g => R.figure(g, ix, 0, 1, -1, INV1, { lean: 0.04, armN: { hand: R.toLocal(ix, 0, 1, -1, meet), grip: 'open' }, armF: { hand: [-30, -300], grip: 'relax' }, face: R.expr('smile', { look: [1, 0], blink: blink(lt, 2.6, 1) }) }), { rim: RIM_W });
    const caseItem = c2 => { c2.save(); c2.translate(0, 26); rr(c2, -90, 0, 180, 120, 10); R.fillStroke(c2, '#6E4630', 5); c2.fillStyle = '#C9A24A'; c2.fillRect(-14, 40, 28, 18);
      c2.strokeStyle = INK; c2.lineWidth = R.px(c2, 6); c2.beginPath(); c2.arc(0, 0, 36, Math.PI, 0); c2.stroke(); c2.restore(); };
    LT.lit(w, g => R.figure(g, i2, 0, 1, -1, INV2, { armN: { hand: [60, -120], grip: 'hold', item: caseItem }, armF: { hand: [-20, -300], grip: 'relax' }, face: R.expr('smile', { look: [1, 0.1], blink: blink(lt, 3.4) }) }), { rim: RIM_W });
  });
  label(ctx, 'INVESTORS', 640, 620, pop(t, tInv - 0.02), { arrow: 1, arrowX: -40, size: 64, col: C.yellow });
  LT.grade(ctx, 'evening', { vignette: 0.2 });
});
// C2 (s09 "Collected fifteen real Pepsi Points."): top-down on the desk: the points drop in one by one, a counter races to 15
const t15 = at('s09', 'fifteen'), tReal = at('s09', 'real');
shot('C2 fifteen', ST.s09 - 0.12, ST.s10 - 0.12, (ctx, t, lt) => {
  woodTop(ctx, t);
  const n = Math.min(15, Math.floor(Math.max(0, (t - (ST.s09 - 0.05)) / ((tReal + 0.25 - ST.s09) / 15)) + 1e-6)), done = n >= 15;
  for (let i = 0; i < 15; i++) { const t0 = ST.s09 - 0.05 + i * ((tReal + 0.25 - ST.s09) / 15), u = (t - t0) / 0.28; if (u < 0) continue; const col = i % 5, row = Math.floor(i / 5);
    const x = 190 + col * 175 + (hash(i) - 0.5) * 20, y = 790 + row * 140 + (hash(i + 5) - 0.5) * 16, d = E.out(clamp(u)), bounce = Math.sin(clamp(u) * Math.PI) * 30;
    ctx.save(); ctx.translate(x, lerp(-150, y, d) - bounce * (1 - d)); ctx.globalAlpha = 0.28; ctx.fillStyle = '#000'; ctx.restore();
    ctx.save(); ctx.translate(x, lerp(-150, y, d)); P.ptsTag(ctx, 1.12, { rot: (hash(i + 9) - 0.5) * 0.3 }); ctx.restore(); }
  // cans on the sides (top view)
  for (const [x, y] of [[90, 1130], [990, 1150], [120, 1330]]) { ell(ctx, x, y, 70, 70); R.fillStroke(ctx, P.PBLUE, 5); ell(ctx, x, y, 50, 50); ctx.fillStyle = '#C9CED6'; ctx.fill(); }
  ctx.save(); ctx.translate(540, 520); const pulseK = done ? 1 + 0.2 * Math.sin(seg(t, tReal, tReal + 0.5) * Math.PI) : 1; ctx.scale(pulseK, pulseK);
  CL.cutout(ctx, () => rr(ctx, -270, -120, 540, 220, 30), done ? C.red : '#171717', { elev: 2, tex: 0 }); txt(ctx, `${n}`, -50, 60, 190, done ? '#FFFDF8' : C.yellow, 'right'); txt(ctx, '/ 15', 30, 60, 100, '#FFFDF8', 'left'); ctx.restore();
  label(ctx, 'REAL PEPSI POINTS', 540, 1420, pop(t, tReal), { size: 62, col: C.yellow });
  LT.grade(ctx, 'evening', { vignette: 0.24 });
});
// C3a (s10 "And mailed Pepsi a check"): the street mailbox: his hand pushes the fat envelope into the slot
const tMailed = at('s10', 'mailed'), tCheck = at('s10', 'check');
shot('C3a mail', ST.s10 - 0.12, tCheck - 0.1, (ctx, t, lt) => {
  const push = k(t, tMailed - 0.2, tMailed + 0.5, E.in), thunk = shake(t, tMailed + 0.5, 10);
  bg(ctx, '#CFE6FA'); halfPass(ctx, 12, g => layer(g, { x: 300, y: -500, z: 0.9 }, 1, w => P.school(w, t, { wind: 0 })));
  ctx.save(); ctx.translate(thunk, 0);
  ctx.save(); ctx.translate(640, 1660); ctx.scale(2.3, 2.3);
  P.mailbox(ctx, 0, 0, 1);
  ctx.restore();
  // the envelope slides into the slot (slot centre ~ (640, 1500 - 2.6*380))
  const sx = 640, sy = 1660 - 2.3 * 380; const ex = lerp(220, sx, push), ey = lerp(sy - 40, sy, push), vis = 1 - clamp((push - 0.62) / 0.38);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, sy + 20); ctx.restore();
  ctx.save(); ctx.translate(ex, ey); ctx.rotate(lerp(-0.2, 0, push)); const sc = lerp(1.0, 0.8, push); ctx.scale(sc, sc * vis + 0.001); P.envelope(ctx, 0.75, {}); ctx.restore();
  reach(ctx, [-300, 1300], [ex - 120, ey + 40], 'hold', { size: 2.8 });
  ctx.restore();
  if (t > tMailed + 0.5) { const u = clamp((t - tMailed - 0.5) / 0.4); for (let i = 0; i < 6; i++) { ctx.save(); ctx.globalAlpha = 1 - u; ctx.translate(640 + (i - 2.5) * 70 * u, sy + 20 - u * 60); ell(ctx, 0, 0, 20 + 30 * u, 14 + 20 * u); ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fill(); ctx.restore(); } }
  LT.grade(ctx, 'day', { vignette: 0.2 });
});
// C3b (s10 "...a check for over seven hundred thousand dollars."): inside the envelope: the check, signed, the number rolls up
const tSeven2 = at('s10', 'seven'), tDollars = at('s10', 'dollars');
const fmt = v => '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
shot('C3b check', tCheck - 0.1, ST.s11 - 0.12, (ctx, t, lt) => {
  woodTop(ctx, t); const sg = k(t, tCheck - 0.05, tCheck + 0.55), roll = k(t, tSeven2 - 0.05, tDollars + 0.1, E.out);
  const z = 1.0 + lt * 0.035; ctx.save(); ctx.translate(540, 1080); ctx.scale(1.5 * z, 1.5 * z); ctx.rotate(-0.04); P.checkSlip(ctx, 1, { sign: sg, amount: roll > 0.02 ? fmt(Math.round(700008.5 * roll * 100) / 100) : '$' }); ctx.restore();
  const u = pop(t, tSeven2 - 0.02, 0.35, 2.2); if (u > 0) { ctx.save(); ctx.translate(540, 560 + shake(t, tDollars - 0.05, 6)); ctx.rotate(-0.03); ctx.scale(u, u);
    CL.cutout(ctx, () => rr(ctx, -470, -110, 940, 210, 24), '#171717', { elev: 2, tex: 0 }); fitTxt(ctx, fmt(Math.round(700008.5 * roll * 100) / 100), 0, 40, 124, C.yellow, 880); ctx.restore(); }
  LT.grade(ctx, 'evening', { vignette: 0.24 });
});
// C4 (s11 "His order form?"): the order form slides onto the desk; a big question mark rises
const tForm = at('s11', 'form');
shot('C4 form', ST.s11 - 0.12, ST.s12 - 0.12, (ctx, t, lt) => {
  woodTop(ctx, t); const sl = E.out(seg(lt, 0, 0.5));
  ctx.save(); ctx.translate(540, 1080); ctx.scale(1.5, 1.5); ctx.rotate(-0.04); P.checkSlip(ctx, 1, { sign: 1, amount: '$700,008.50', elev: 1 }); ctx.restore();
  ctx.save(); ctx.translate(lerp(1500, 540, sl), 1060); ctx.rotate(lerp(0.3, 0.025, sl)); P.orderForm(ctx, 760, 980, { write: 0 }); ctx.restore();
  const u = pop(t, tForm - 0.05, 0.35, 2.4); if (u > 0) { ctx.save(); ctx.translate(840, 560 - 10 * Math.sin(lt * 4)); ctx.rotate(0.1); ctx.scale(u * 1.4, u * 1.4); CL.cutout(ctx, () => rr(ctx, -80, -100, 160, 190, 24), C.red, { elev: 1.8 }); txt(ctx, '?', 0, 56, 170, '#FFFDF8'); ctx.restore(); }
  LT.grade(ctx, 'evening', { vignette: 0.24 });
});
// C5 (s12 "ONE HARRIER JET."): the item line is written in his hand, the pen circles it in red
const tOne = at('s12', 'one'), tHarrier = at('s12', 'harrier'), tJet = at('s12', 'jet');
shot('C5 harrier', ST.s12 - 0.12, ST.s13 - 0.12, (ctx, t, lt) => {
  woodTop(ctx, t); const wr = k(t, tOne - 0.05, tJet + 0.1, E.out), rg = k(t, tJet + 0.05, tJet + 0.55), z = 1.0 + lt * 0.04;
  ctx.save(); ctx.translate(540, 1050); ctx.scale(z, z); ctx.rotate(0.01); P.orderForm(ctx, 800, 1030, { write: wr, ring: rg }); ctx.restore();
  const px0 = lerp(300, 880, wr) , py0 = 880 + Math.sin(lt * 14) * 8; reach(ctx, [1500, 1850], [px0 + 240, py0 + 220], 'hold', { size: 3.0, over: null });
  const u = pop(t, tJet + 0.2, 0.3, 2.4); if (u > 0) { ctx.save(); ctx.translate(540, 520); ctx.rotate(-0.03); ctx.scale(u * 1.3, u * 1.3); CL.cutout(ctx, () => rr(ctx, -330, -64, 660, 116, 14), C.red, { elev: 1.8 }); txt(ctx, '1 HARRIER JET', 0, 28, 76, '#FFFDF8'); ctx.restore(); }
  LT.grade(ctx, 'evening', { vignette: 0.24 });
}, { type: 'tear', dur: 0.4, at: () => [540, 1000] });

// D1 (s13 "Pepsi sent the check back."): the mailroom: a Pepsi employee slits the envelope, pulls out the order, goes wide-eyed; the check flicks back stamped RETURNED
const tSent = at('s13', 'sent'), tBack = at('s13', 'back');
shot('D1 mailroom', ST.s13 - 0.12, ST.s14 - 0.12, (ctx, t, lt) => {
  const rd = k(t, ST.s13 + 0.25, ST.s13 + 0.65), sh = k(t, ST.s13 + 0.55, ST.s13 + 0.8), fl = k(t, tBack - 0.15, tBack + 0.35, E.in);
  bustShot(ctx, lt, c => { bg(c, '#E6EAF0'); halfPass(c, 8, g => layer(g, { x: 150, y: -520, z: 1.05 }, 1, w => P.mailroom(w, t))); LT.haze(c, 'office', 0.1); },
    { L: CLERKP, x: 520, ny: 1560, s: 2.5, push: 0.025, rim: RIM_DAY,
      face: R.exprMix(R.exprMix(R.expr('neutral', { look: [0.2, 0.6], blink: blink(lt, 3.1) }), R.expr('squint', { look: [0, 0.7] }), rd), R.expr('shocked', { look: [0, 0.6] }), sh), tilt: lerp(0, -0.05, sh),
      hands: [{ side: -1, hand: [-150, lerp(120, -30, rd)], grip: 'hold', item: c2 => { c2.save(); c2.translate(10, -90); c2.rotate(-0.05); P.orderForm(c2, 190, 250, { write: 1 }); c2.restore(); } },
              { side: 1, hand: [lerp(100, 150 + fl * 500, fl), lerp(250, 220 - fl * 140, fl)], grip: 'hold', item: c2 => { c2.save(); c2.translate(0, 60); c2.rotate(fl * -0.4); if (!(fl > 0.5)) P.checkSlip(c2, 0.28, { sign: 1 }); c2.restore(); } }] });
  // the flicked check flies off to the right with a stamp on it
  if (fl > 0.05) { ctx.save(); ctx.translate(lerp(700, 1250, fl), lerp(1200, 900, fl)); ctx.rotate(fl * 0.8); ctx.scale(0.9, 0.9); P.checkSlip(ctx, 1, { sign: 1 }); ctx.save(); ctx.translate(0, 0); P.mark(ctx, 'RETURNED', { size: 70, a: clamp(fl * 2) }); ctx.restore(); ctx.restore(); }
  const mk = pop(t, tBack, 0.2, 2.6); if (mk > 0) { ctx.save(); ctx.translate(540, 600); ctx.scale(mk * 1.7, mk * 1.7); P.mark(ctx, 'RETURNED', { size: 76, rot: -0.1 }); ctx.restore(); }
  LT.grade(ctx, 'office', { vignette: 0.2 });
});
// D2 (s14 "They said the jet wasn't a real prize."): John at home with the returned envelope; the letter says it: not a real prize
const tReal14 = at('s14', 'real'), tPrize = at('s14', 'prize');
shot('D2 returned', ST.s14 - 0.12, ST.s15 - 0.12, (ctx, t, lt) => {
  const wr = k(t, ST.s14 + 0.15, ST.s14 + 0.5), dn = k(t, tReal14 - 0.05, tReal14 + 0.4);
  bustShot(ctx, lt, c => denBg(-200, -700, 1.2, 13)(c, t), { x: 540, ny: 1650, s: 2.55, push: 0.03,
    face: R.exprMix(R.exprMix(R.expr('happy', { look: [0, 0.5] }), R.expr('worried', { look: [0.3, 0.6], brow: [0.7, 0.7] }), wr), R.expr('skeptical', { look: [0, 0.2] }), dn), tilt: lerp(0, 0.07, dn),
    hands: [{ side: 1, hand: [150, 250], grip: 'hold', item: c2 => { c2.save(); c2.translate(0, -60); c2.rotate(0.1); P.checkSlip(c2, 0.34, { sign: 1 }); c2.restore(); } }, { side: -1, hand: [-150, 300], grip: 'hold' }] });
  const dropU = E.out(seg(t, ST.s14 - 0.05, ST.s14 + 0.45)); ctx.save(); ctx.translate(540, lerp(-300, 640, dropU)); ctx.rotate(lerp(-0.4, 0.02, dropU));
  CK.sheet(ctx, 820, 500, [{ s: 'RE: YOUR ORDER', y: -170, size: 34, col: '#5A5450' }, { s: 'THE JET IS', y: -50, size: 78 }, { s: 'NOT A REAL PRIZE', y: 80, size: 88, hl: C.yellow, hlT: k(t, tReal14 - 0.1, tPrize) }]); ctx.restore();
  LT.grade(ctx, 'evening', { vignette: 0.22 });
});
// D3 (s15 "John took them to court."): he walks up to the federal courthouse, folder under his arm
const tCourt = at('s15', 'court');
shot('D3 to court', ST.s15 - 0.12, tCourt + 0.1, (ctx, t, lt) => {
  const wk = k(t, ST.s15 - 0.1, tCourt - 0.05, E.out), jx = lerp(-1050, -250, wk), stop = wk > 0.97, c = cam([[0, jx * 0.5 - 200, -640, 0.6], [1.6, -130, -600, 0.72]], lt);
  bg(ctx, '#F2E2C0');
  layer(ctx, c, 1, w => {
    P.courthouse(w, t, {});
    const pose = stop ? { hip: [0, -254], lean: 0.05, legN: { foot: [24, 0] }, legF: { foot: [-22, 0] }, armN: { hand: [60, -300], grip: 'hold', item: c2 => { c2.save(); rr(c2, -20, -10, 150, 200, 8); R.fillStroke(c2, '#E9D7B0', 5); c2.restore(); } }, armF: { hand: [-10, -200] } } : R.walk(t * 7.5);
    LT.castShadow(w, g => R.figure(g, jx, 330, 1.5, 1, JOHN, pose), { x: jx, floorY: 330, a: 0.22, blur: 3 });
    LT.lit(w, g => R.figure(g, jx, 330, 1.5, 1, JOHN, { ...pose, face: R.expr(stop ? 'squint' : 'neutral', { look: [1, -0.1], blink: blink(lt, 2.9) }), headTilt: 0.03 }), { rim: RIM_DAY });
  });
  label(ctx, 'FEDERAL COURT', 540, 720, pop(t, tCourt - 0.1), { size: 64, col: '#171717', fg: C.yellow });
  LT.grade(ctx, 'golden', { vignette: 0.2 });
});

// E1a (s16 "The judge ..."): the courtroom, wide: the judge above everyone; John at the left table with the ad, Pepsi's side at the right
const tJudge = at('s16', 'judge'), tSided = at('s16', 'sided'), tPepsi16 = at('s16', 'pepsi');
const COURT_W = (w, t, lt, o = {}) => { // the whole room in world space, with both tables and the judge as a small bust behind the bench
  P.courtroom(w, t, {});
  const sx = 0, jb = (g, s2) => R.bust(g, 0, -330, s2, JUDGE, { face: R.expr('neutral', { look: [0, 0.3], blink: blink(lt, 3.3) }), hands: [{ side: 1, hand: [150, 220], grip: 'hold', item: c2 => { c2.save(); c2.translate(10, 0); c2.rotate(-0.4 - (o.gav || 0) * 1.1); P.gavel(c2, 0.28); c2.restore(); } }] });
  w.save(); w.beginPath(); w.rect(-400, -1000, 800, 530); w.clip(); LT.lit(w, g => jb(g, 0.82), { rim: RIM_W }); w.restore();
  rr(w, -430, -470, 860, 400, 8); R.fillStroke(w, '#7A4A2A', 5); w.fillStyle = 'rgba(40,20,10,0.35)'; for (let i = 0; i < 4; i++) w.fillRect(-380 + i * 200, -420, 160, 300); rr(w, -480, -500, 960, 44, 8); R.fillStroke(w, '#5A3320', 5);
  const lose = o.lose || 0;
  LT.lit(w, g => R.figure(g, -860, 0, 1, 1, JOHN, { hip: [0, -256], lean: -0.05 * lose, armN: { hand: [46, -240], grip: 'hold', item: c2 => { c2.save(); c2.translate(0, -10); P.adPoster(c2, 150, 190, t); c2.restore(); } }, armF: { hand: [-14, -64] }, face: R.exprMix(R.expr('squint', { look: [1, -0.2], blink: blink(lt, 2.9) }), R.expr('worried', { look: [1, 0.3] }), lose), headTilt: 0.03 * lose }), { rim: RIM_W });
  LT.lit(w, g => R.figure(g, 860, 0, 1, -1, CLERKP, { hip: [0, -256], face: R.exprMix(R.expr('neutral', { look: [1, -0.2], blink: blink(lt, 3.4, 1) }), R.expr('smile', { look: [1, 0], blink: blink(lt, 3.4, 1) }), lose) }), { rim: RIM_W });
  // table fronts cover the legs
  for (const x of [-860, 860]) { rr(w, x - 300, -250, 600, 36, 6); R.fillStroke(w, '#8A5A34', 5); w.fillStyle = '#6E4630'; w.fillRect(x - 280, -214, 560, 214); w.strokeStyle = INK; w.lineWidth = R.px(w, 5); w.strokeRect(x - 280, -214, 560, 214); }
};
shot('E1a court', tCourt + 0.1, tSided - 0.1, (ctx, t, lt) => {
  const c = cam([[0, 0, -700, 0.62], [1.2, 0, -650, 0.7]], lt); bg(ctx, '#C8B48C');
  layer(ctx, c, 1, w => COURT_W(w, t, lt, {}));
  LT.grade(ctx, 'golden', { vignette: 0.24 });
});
// E1b (s16 "...sided with Pepsi."): the judge, close; the gavel comes down on PEPSI; the whole screen jolts
shot('E1b gavel', tSided - 0.1, ST.s17 - 0.12, (ctx, t, lt) => {
  const dn = k(t, tPepsi16 - 0.25, tPepsi16 + 0.0, E.in), up = 1 - k(t, tPepsi16 + 0.1, tPepsi16 + 0.5), sk = shake(t, tPepsi16 + 0.0, 16);
  ctx.save(); ctx.translate(sk, Math.abs(sk) * 0.6);
  bustShot(ctx, lt, c => { bg(c, '#C8B48C'); halfPass(c, 12, g => layer(g, { x: 0, y: -900, z: 1.1 }, 1, w => P.courtroom(w, t, {}))); },
    { L: JUDGE, x: 540, ny: 1480, s: 2.5, push: 0.03, rim: RIM_W, face: R.expr('neutral', { look: [0, 0.1], blink: blink(lt, 3.3), lid: [0.3, 0.3], brow: [-0.1, -0.1] }), tilt: 0.02,
      hands: [{ side: 1, hand: [160, lerp(150, 330, dn) - 200 * (1 - dn) * up], grip: 'hold', item: c2 => { c2.save(); c2.rotate(-0.3 + dn * 0.6); P.gavel(c2, 0.9); c2.restore(); } }] });
  // bench front in the foreground
  ctx.fillStyle = '#7A4A2A'; ctx.fillRect(-20, 1630, W + 40, 400); ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.strokeRect(-20, 1630, W + 40, 400); rr(ctx, -30, 1604, W + 60, 40, 8); R.fillStroke(ctx, '#5A3320', 5);
  ctx.restore();
  if (t > tPepsi16) { const u = clamp((t - tPepsi16) / 0.35); ctx.save(); ctx.globalAlpha = 1 - u; ell(ctx, 780, 1620, 90 + 260 * u, 20 + 60 * u); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fill(); ctx.restore(); }
  LT.grade(ctx, 'golden', { vignette: 0.24 });
});
// E2a (s17 "No reasonable person would think"): the judge reads the ad; one eyebrow, glasses down; then the stamp
const tReasonable = at('s17', 'reasonable'), tOffering = at('s17', 'offering');
shot('E2a judge reads', ST.s17 - 0.12, tOffering - 0.15, (ctx, t, lt) => {
  const sk = k(t, tReasonable - 0.1, tReasonable + 0.4);
  bustShot(ctx, lt, c => { bg(c, '#C8B48C'); halfPass(c, 12, g => layer(g, { x: -300, y: -900, z: 1.1 }, 1, w => P.courtroom(w, t, {}))); },
    { L: JUDGE, x: 540, ny: 1600, s: 2.6, push: 0.03, rim: RIM_W, face: R.exprMix(R.expr('squint', { look: [0, 0.6], blink: blink(lt, 3.6) }), R.expr('skeptical', { look: [0, 0.2] }), sk), tilt: lerp(0, -0.06, sk),
      hands: [{ side: -1, hand: [-120, 330], grip: 'hold', item: c2 => { c2.save(); c2.translate(300, -40); c2.rotate(0.06); P.adPoster(c2, 250, 320, t); c2.restore(); } }, { side: 1, hand: [130, 340], grip: 'hold' }] });
  LT.grade(ctx, 'golden', { vignette: 0.24 });
});
// E2b (s17 "...the ad was offering a real fighter jet."): the ad on the bench; the stamp slams over it: NOT A LEGALLY BINDING OFFER
const tRealJet = at('s17', 'real'), tJet17 = at('s17', 'jet');
shot('E2b stamp', tOffering - 0.15, ST.s18 - 0.12, (ctx, t, lt) => {
  woodTop(ctx, t); ctx.fillStyle = 'rgba(70,40,15,0.35)'; ctx.fillRect(0, 0, W, H); const z = 1 + lt * 0.03, st = E.in(seg(t, tOffering - 0.12, tOffering + 0.04)), sk = shake(t, tOffering + 0.04, 14);
  ctx.save(); ctx.translate(540 + sk, 1020); ctx.scale(z, z); ctx.rotate(-0.025); P.adPoster(ctx, 800, 1000, t); ctx.restore();
  if (t > tOffering - 0.12) { ctx.save(); ctx.translate(540 + sk, lerp(300, 1000, st)); ctx.rotate(-0.1); ctx.scale(lerp(2.4, 1.0, st), lerp(2.4, 1.0, st)); ctx.globalAlpha = clamp(st * 1.4);
    ctx.fillStyle = 'rgba(255,255,255,0.0)'; P.mark(ctx, 'NOT A', { size: 120, rot: 0 }); ctx.translate(0, 150); P.mark(ctx, 'LEGALLY BINDING', { size: 74, rot: 0 }); ctx.translate(0, 130); P.mark(ctx, 'OFFER', { size: 120, rot: 0 }); ctx.restore(); }
  LT.grade(ctx, 'golden', { vignette: 0.26 });
});
// E3 (s18 "John never got the plane."): John in the courtroom with the dream jet in a thought bubble; the bubble pops, the jet falls apart, he looks down
const tNever = at('s18', 'never'), tPlane = at('s18', 'plane');
shot('E3 pop', ST.s18 - 0.12, ST.s19 - 0.12, (ctx, t, lt) => {
  const pp = t > tNever - 0.02, fall = pp ? E.in(clamp((t - tNever) / 0.9)) : 0, sad = k(t, tNever, tPlane);
  bustShot(ctx, lt, c => { bg(c, '#C8B48C'); halfPass(c, 12, g => layer(g, { x: -400, y: -800, z: 1.1 }, 1, w => P.courtroom(w, t, {}))); },
    { x: 540, ny: 1720, s: 2.7, push: 0.025, face: R.exprMix(R.expr('happy', { look: [0, -0.8], blink: blink(lt, 3.1) }), R.expr('tired', { look: [0, 0.7] }), sad), tilt: lerp(-0.04, 0.08, sad) });
  if (!pp) { ctx.save(); ctx.translate(500, 1000); const bob = Math.sin(t * 3) * 8; ctx.translate(0, bob); P.thought(ctx, 40, -340, 760, 520, c2 => { c2.save(); c2.translate(0, 30); c2.rotate(-0.08); P.harrier(c2, 0.34, { noz: 1, flame: 0.8, t }); c2.restore(); }); ctx.restore(); }
  else { // the bubble pops into paper bits; the jet drops and fades
    const u = clamp((t - tNever) / 0.9); for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, d = E.out(clamp(u * 1.4)) * (160 + 140 * hash(i)); ctx.save(); ctx.globalAlpha = 1 - clamp(u * 1.2); ctx.translate(540 + Math.cos(a) * d, 660 + Math.sin(a) * d * 0.8 + u * 140); ctx.rotate(a + u * 4); ctx.fillStyle = '#FFFDF8'; ctx.fillRect(-18, -12, 36, 24); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.strokeRect(-18, -12, 36, 24); ctx.restore(); }
    ctx.save(); ctx.globalAlpha = 1 - clamp(u * 1.1); ctx.translate(540, lerp(700, 1250, fall)); ctx.rotate(lerp(-0.08, 1.2, fall)); P.harrier(ctx, 0.34, { noz: 0, flame: 0 }); ctx.restore(); }
  LT.grade(ctx, 'golden', { vignette: 0.26 });
});

// F (s19 "But he turned a soda commercial into a federal court case."): outside the courthouse at golden hour: John holds the ad (the jet we saw at the start), deadpan; the case file stamp
const tSoda = at('s19', 'soda'), tFederal = at('s19', 'federal');
shot('F outside', ST.s19 - 0.12, T + 0.01, (ctx, t, lt) => {
  const dp = k(t, tFederal, tFederal + 0.6);
  bustShot(ctx, lt, c => { bg(c, '#F2E2C0'); halfPass(c, 5, g => layer(g, { x: 0, y: -520, z: 0.7 }, 1, w => P.courthouse(w, t, {}))); LT.haze(c, 'golden', 0.14); },
    { x: 790, ny: 1640, s: 2.3, push: 0.02, rim: { dir: [-1, -0.3], color: '#FFD9A0', w: 9, a: 0.95 },
      face: R.exprMix(R.expr('neutral', { look: [0, 0.4], blink: blink(lt, 3.3), lid: [0.25, 0.25] }), R.expr('smug', { look: [0, 0], blink: blink(lt, 3.3) }), dp), tilt: lerp(-0.02, 0.03, dp),
      hands: [{ side: -1, hand: [-150, 130], grip: 'hold', item: c2 => { c2.save(); c2.translate(-90, -90); c2.rotate(-0.06); P.adPoster(c2, 270, 340, t); c2.restore(); } }, { side: 1, hand: [135, 340], grip: 'relax' }] });
  LT.grade(ctx, 'golden', { vignette: 0.24 });
});

// ---------- edit, global overlays, subtitles ----------
SH.sort((a, b) => a.t0 - b.t0);
const ED = makeEdit(SH, W, H);
const SPLIT = { s01: [4, 4], s02: [4], s03: [4], s04: [4], s05: [2, 6], s06: [3, 3], s07: [4], s08: [4], s09: [5], s10: [5, 6], s11: [3], s12: [3], s13: [5], s14: [4, 4], s15: [5], s16: [5], s17: [4, 4, 5], s18: [5], s19: [5, 6] };
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
  EN.drawSubtitles(ctx, t, SUBS, { y: 1565, size: 62, maxW: 820, x: 540, highlight: ['million', 'buy', 'cents', 'fifteen', 'check', 'harrier', 'back', 'court', 'judge', 'jet', 'jet.', 'plane.'] });
}

// ---------- sound cues (for mix.py) ----------
function cues() {
  const c = [['jet', 0.05, 0.9], ['wind', 0, 0.8], ['cut', ST.s02 - 0.1, 0.35], ['stamp', tSeven, 0.7], ['tag', tPts, 0.5], ['whoosh', tSeven + 0.3, 0.4]];
  c.push(['cut', ST.s03 - 0.12, 0.35], ['room', ST.s03 - 0.1, 0.7], ['laugh', tJoke - 0.2, 0.0], ['tick', tRight, 0.6], ['cut', ST.s04 - 0.12, 0.35], ['click', ST.s04, 0.6], ['tag', tJohn + 0.05, 0.5], ['sparkle', tJohn + 0.4, 0.4]);
  c.push(['cut', ST.s05 - 0.12, 0.35], ['paper', ST.s05 + 0.1, 0.5], ['stamp', t1996, 0.5], ['sparkle', tSpotted, 0.55], ['marker', tSpotted + 0.15, 0.5]);
  c.push(['cut', ST.s06 - 0.12, 0.35], ['marker', tBuy - 0.1, 0.55], ['stamp', tBuy, 0.8], ['cut', ST.s07 - 0.12, 0.35], ['stamp', tTen, 0.8]); for (let i = 0; i < 9; i++) c.push(['clink', tTen + 0.25 + i * 0.07, 0.3]);
  c.push(['cut', ST.s08 - 0.12, 0.35], ['grab', ST.s08 + 0.3, 0.6], ['tag', tInv, 0.5], ['cut', ST.s09 - 0.12, 0.35]); for (let i = 0; i < 15; i++) c.push(['tap', ST.s09 - 0.05 + i * ((tReal + 0.25 - ST.s09) / 15) + 0.12, 0.45]);
  c.push(['stamp', tReal, 0.6], ['cut', ST.s10 - 0.12, 0.35], ['whoosh', tMailed - 0.15, 0.4], ['thump', tMailed + 0.5, 0.7], ['cut', tCheck - 0.1, 0.3], ['marker', tCheck, 0.5], ['kaching', tSeven2 + 0.25, 0.9]);
  for (let i = 0; i < 8; i++) c.push(['tick', tSeven2 + i * 0.1, 0.35]);
  c.push(['cut', ST.s11 - 0.12, 0.3], ['slide', ST.s11 - 0.1, 0.6], ['pop', tForm, 0.5], ['cut', ST.s12 - 0.12, 0.3], ['marker', tOne, 0.6], ['marker', tHarrier, 0.6], ['marker', tJet, 0.5], ['stamp', tJet + 0.25, 0.7], ['tear', ST.s13 - 0.25, 0.7]);
  c.push(['cut', ST.s13 - 0.12, 0.3], ['office', ST.s13 - 0.1, 0.7], ['paper', ST.s13 + 0.2, 0.7], ['sparkle', ST.s13 + 0.55, 0.3], ['whoosh', tBack - 0.15, 0.4], ['stamp', tBack, 0.9]);
  c.push(['cut', ST.s14 - 0.12, 0.3], ['room', ST.s14 - 0.1, 0.6], ['slide', ST.s14, 0.5], ['marker', tReal14 - 0.05, 0.55], ['deflate', tReal14 + 0.2, 0.4]);
  c.push(['cut', ST.s15 - 0.12, 0.3], ['wind', ST.s15 - 0.1, 0.5], ['steps', ST.s15 - 0.05, 0.6], ['tag', tCourt - 0.1, 0.5]);
  c.push(['cut', ST.s16 - 0.12, 0.3], ['court', ST.s16 - 0.1, 0.9], ['cut', tSided - 0.1, 0.3], ['gavel', tPepsi16, 1.0], ['boom', tPepsi16, 0.4]);
  c.push(['cut', ST.s17 - 0.12, 0.3], ['paper', tReasonable, 0.4], ['cut', tOffering - 0.15, 0.3], ['whoosh', tOffering - 0.14, 0.4], ['stamp', tOffering + 0.02, 1.0], ['stamp', tOffering + 0.3, 0.6], ['stamp', tOffering + 0.6, 0.9], ['gavel', tJet17, 0.6]);
  c.push(['cut', ST.s18 - 0.12, 0.3], ['balloonpop', tNever, 0.9], ['deflate', tNever + 0.15, 0.5], ['fall', tNever + 0.1, 0.5]);
  c.push(['cut', ST.s19 - 0.12, 0.35], ['wind', ST.s19, 0.4], ['tag', tFederal, 0.4]);
  return c.filter(x => x[2] > 0);
}
const MUSIC = { b0: 0, story: ST.s04, rules: ST.s05, plan: ST.s08, mail: ST.s10, conflict: ST.s13, court: ST.s15, gavel: tPepsi16, end: ST.s19, T };

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
