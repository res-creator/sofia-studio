// Episode 12 "The Great Emu War" (How It's Run) — Western Australia, 1932: wheat farmers, ~20,000 emus, a small army unit with two
// Lewis guns and 10,000 rounds, the ambush at the dam, the jam, the truck, the Major's neat report, and the bounty that did what the guns didn't.
// Story world: the gun on the horizon -> the emu's stare -> the map -> the farm -> the emus arrive -> the army truck -> the guns, the crate
// -> day 3 at the dam -> the jam -> the truck chase -> the report -> the math -> the emus still there -> the stage -> the bounty -> the claims
// -> the abandoned gun -> the pay envelope. Built on hirkit (rig, light, collage, edit). Shots cut on voice-over words. 1080x1920, 30 fps.
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
const S = require('./emukit');
const { C, F, clamp, lerp, seg, E, rr, hash } = K;
const { INK, ell } = R;
const { W, H, txt, fitTxt } = S;
const FPS = 30;

// ---------- voice timeline (natural speed; real speech start/end from vo/speech.json, gaps only) ----------
const LINES = JSON.parse(fs.readFileSync(`${__dirname}/script.json`));
const SP = JSON.parse(fs.readFileSync(`${__dirname}/vo/speech.json`));
const GAP = { s01: 0.35, s02: 0.3, s03: 0.3, s04: 0.35, s05: 0.3, s06: 0.4, s07: 0.35, s08: 0.4, s09: 0.4, s10: 0.3, s11: 0.4, s12: 1.3 };
const ST = {}; let T = 0.15; for (const L of LINES) { ST[L.id] = +(T - SP[L.id][0]).toFixed(3); T += SP[L.id][1] - SP[L.id][0] + GAP[L.id]; } T = +T.toFixed(2);
const V = EN.voice(`${__dirname}/vo`, ST), at = (id, w, n = 0) => V.at(id, w, n), end = id => ST[id] + SP[id][1];

// ---------- helpers ----------
const HALF = createCanvas(W / 2, H / 2), hx = HALF.getContext('2d');
function halfPass(ctx, blur, draw) { // a softer (half-res, blurred) background plane
  hx.setTransform(1, 0, 0, 1, 0, 0); hx.clearRect(0, 0, W / 2, H / 2); hx.setTransform(0.5, 0, 0, 0.5, 0, 0);
  R.LINE.dev = 0.5; draw(hx); R.LINE.dev = 1;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); if (blur > 0.3) ctx.filter = `blur(${blur.toFixed(1)}px)`; ctx.drawImage(HALF, 0, 0, W, H); ctx.restore();
}
const blink = (t, p = 3.3, o = 0) => ((t + o) % p) > p - 0.12 ? 1 : 0;
const RIM = { dir: [1, -0.5], color: '#FFF0C8', w: 8, a: 0.9 };
const pop = (t, t0, d = 0.3, s = 2.2) => t < t0 ? 0 : E.back(seg(t, t0, t0 + d), s);
const shake = (t, t0, a = 14) => (t > t0 && t < t0 + 0.35) ? Math.sin((t - t0) * 70) * a * (1 - seg(t, t0, t0 + 0.35)) : 0;
const zoomAt = (ctx, x, y, z) => { ctx.translate(x, y); ctx.scale(z, z); ctx.translate(-x, -y); };
// a paper label (names, places, numbers)
function label(ctx, s, x, y, u, o = {}) {
  if (u <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.03); ctx.scale(u, u); const size = o.size || 56;
  ctx.font = `${size}px ${F.black}`; const w = ctx.measureText(s).width + 50;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -size * 0.85, w, size * 1.35, 12), o.col || '#FFFDF8', { elev: 1.4 }); txt(ctx, s, 0, size * 0.28, size, o.fg || INK);
  if (o.arrow) { ctx.fillStyle = o.col || '#FFFDF8'; ctx.beginPath(); ctx.moveTo(o.arrow * 20 - 22, size * 0.5); ctx.lineTo(o.arrow * 20 + 22, size * 0.5); ctx.lineTo(o.arrow * 60, size * 1.2); ctx.closePath(); ctx.fill(); ctx.lineWidth = R.px(ctx, 4); ctx.strokeStyle = INK; ctx.stroke(); }
  ctx.restore();
}
// backgrounds
const fieldBg = (o = {}, blur = 9) => (c, t) => { c.fillStyle = '#E9D2A0'; c.fillRect(0, 0, W, H); halfPass(c, blur, g => S.land(g, t, o)); LT.haze(c, 'golden', 0.08); };
const paperBg = (c, col = '#E9E2D2') => { c.fillStyle = col; c.fillRect(0, 0, W, H); };
function stage(ctx, t, warm = 0) { // a dark paper stage with a spotlight (the "what worked?" beat)
  ctx.fillStyle = '#2A2620'; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(540, 980, 60, 540, 980, 760); g.addColorStop(0, warm ? '#F7E2B0' : '#E9E2D2'); g.addColorStop(1, 'rgba(42,38,32,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(0, 1360, W, H - 1360); ell(ctx, 540, 1360, 420, 50); ctx.fillStyle = 'rgba(255,240,200,0.18)'; ctx.fill();
}
function tarp(ctx) { // army canvas the guns are laid on
  ctx.fillStyle = '#7A7A4E'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(40,40,20,0.12)'; ctx.lineWidth = 2; for (let y = 0; y < H; y += 9) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y + 4); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(255,250,220,0.35)'; ctx.lineWidth = 4; ctx.setLineDash([18, 14]); for (const y of [300, 1640]) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); } ctx.setLineDash([]);
}
// emu crowds (deterministic)
function crowd(n, seed, x0, x1, y0, y1, s0, s1, face = -1) {
  const out = []; for (let i = 0; i < n; i++) { const d = hash(seed + i * 7.3), y = lerp(y0, y1, d * d); out.push({ i, x: lerp(x0, x1, hash(seed + i * 3.1)), y, s: lerp(s0, s1, (y - y0) / Math.max(1, y1 - y0)), face, ph: hash(seed + i) * 6.3, pk: hash(seed + i * 1.7) }); }
  return out;
}

// ================= SHOTS =================
const SH = []; const shot = (id, t0, t1, draw, out) => SH.push({ id, t0, t1, draw, out });

// gunner kneeling behind the Lewis gun on sandbags, figure-local (feet at 0, facing +x); returns nothing
function gunner(ctx, x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // sandbags
  for (let i = 0; i < 5; i++) { const bx = 170 + (i % 3) * 110 + (i > 2 ? 55 : 0), by = i > 2 ? -150 : -60; ctx.save(); ctx.translate(bx, by); CL.cutout(ctx, () => rr(ctx, -62, -48, 124, 96, 40), '#C9B48A', { elev: 0.8 }); ctx.restore(); }
  const rec = o.recoil || 0;
  ctx.save(); ctx.translate(190 - rec * 10, -318); ctx.rotate(o.aim || -0.03); ctx.scale(0.55, 0.55); S.lewisGun(ctx, { bipod: 210, flash: o.flash || 0, smoke: o.smoke || 0 }); ctx.restore();
  S.person(ctx, 0, 0, 1, 1, o.L || S.SOL, { hip: [-6, -176], lean: 0.32, legN: { foot: [96, 0] }, legF: { foot: [-118, 0] }, armN: { hand: [118 - rec * 6, -284], grip: 'fist' }, armF: { hand: [96, -330], grip: 'fist' },
    face: o.face || R.expr('squint', { look: [1, 0] }), headTilt: 0.05 }, S.HAT_ARMY);
  ctx.restore();
}

// A1 (0 - "birds"): golden wheatbelt, a gunner behind a Lewis gun; tiny emus on the horizon. Frame 0 = the conflict.
const tBirds = at('s01', 'birds'), tMach = at('s01', 'machine'), t1932 = at('s01', '1932');
const HZ = crowd(9, 3, 640, 1040, 0, 30, 0.13, 0.16);
shot('A1 gun vs horizon', 0, tBirds - 0.08, (ctx, t, lt) => {
  ctx.save(); zoomAt(ctx, 760, 1050, 1 + lt * 0.025);
  S.land(ctx, t, { hy: 1040, windmill: { x: 140, s: 0.45 }, rows: 8, wheatDy: 20, sun: true });
  S.emuCrowd(ctx, HZ.map(e => ({ x: e.x - lt * 14, y: 1048 + e.y, s: e.s, face: -1, phase: lt * 5 + e.ph, stride: 0.3 })));
  LT.lit(ctx, c => gunner(c, 150, 1500, 1.15, t, { face: R.expr('squint', { look: [1, -0.1], blink: blink(lt, 2.4) }) }), { rim: RIM });
  ctx.restore();
  LT.grade(ctx, 'golden', { vignette: 0.2 });
});

// A2 ("birds" - s02): the emu's deadpan stare; on "machine guns" a barrel slides in, it glances at it ... and back at us, unimpressed
shot('A2 emu stare', tBirds - 0.08, ST.s02 - 0.1, (ctx, t, lt) => {
  fieldBg({ hy: 1150, rows: 7 }, 10)(ctx, t);
  const gu = E.out(seg(t, tMach - 0.15, tMach + 0.35)), lookL = t > tMach + 0.1 && t < tMach + 0.75;
  ctx.save(); const z = 1 + lt * 0.03; zoomAt(ctx, 540, 900, z);
  ctx.translate(560, 880); ctx.scale(2.7, 2.7);
  LT.lit(ctx, c => S.emuFace(c, { lid: t > tMach + 0.75 ? 0.55 : 0.4, look: lookL ? [-1, 0.2] : [0, 0.1], blink: blink(lt + 0.6, 2.2), tilt: lookL ? -0.06 : 0.04 }), { rim: RIM });
  ctx.restore();
  if (gu > 0) { ctx.save(); ctx.translate(lerp(-760, -230, gu), 1260); ctx.rotate(-0.06); ctx.scale(1.5, 1.5); LT.lit(ctx, c => S.lewisGun(c, {}), { rim: RIM }); ctx.restore(); }
  LT.grade(ctx, 'golden', { vignette: 0.24 });
});

// B1 (s02 "Western Australia"): the map; WA turns red, the pin drops on the wheatbelt; zoom into the pin
const tWA = ST.s02, tAus = at('s02', 'australia'), tWheat = at('s02', 'wheat');
shot('B1 map', ST.s02 - 0.1, tWheat - 0.1, (ctx, t, lt) => {
  paperBg(ctx, '#E5DCC8');
  ctx.strokeStyle = 'rgba(80,110,160,0.15)'; ctx.lineWidth = 3; for (let x = 0; x < W; x += 90) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = 0; y < H; y += 90) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  const z = lerp(1, 2.1, E.in(seg(t, tWheat - 0.75, tWheat - 0.1))), px0 = 540 + S.CAMPION[0] * 1.25, py0 = 900 + S.CAMPION[1] * 1.25;
  ctx.save(); zoomAt(ctx, px0, py0, z); ctx.translate(540, 900); ctx.scale(1.25, 1.25);
  S.ausMap(ctx, E.out(seg(t, tWA + 0.05, tWA + 0.45)));
  S.pin(ctx, S.CAMPION[0], S.CAMPION[1], seg(t, tAus + 0.2, tAus + 0.55));
  ctx.restore();
  label(ctx, 'THE WHEATBELT', 380, 1290, pop(t, tAus + 0.45), { size: 52, col: C.yellow, rot: -0.04 });
  LT.grade(ctx, 'day', { vignette: 0.15 });
});

// B2 ("wheat farmers ... the Depression"): the farmer by his fence; WWI medal; WHEAT PRICES arrow crashes down
const tFarm = at('s02', 'farmers'), tVet = at('s02', 'veterans'), tHit = at('s02', 'hit'), tDep = at('s02', 'depression');
shot('B2 farmer', tWheat - 0.1, ST.s03 - 0.1, (ctx, t, lt) => {
  ctx.save(); zoomAt(ctx, 600, 1200, 1 + lt * 0.02);
  S.land(ctx, t, { hy: 980, house: { x: 260, s: 0.5 }, windmill: { x: 860, s: 0.55 }, fence: { dy: 90 }, rows: 8, wheatDy: 140, px: lt * 20 });
  const worried = t > tHit;
  LT.lit(ctx, c => { S.person(c, 620, 1480, 1.45, -1, S.FARMER, { armN: { hand: [40, -130], grip: 'relax' }, armF: { hand: [-20, -120] }, face: R.expr(worried ? 'worried' : 'neutral', { look: worried ? [-0.6, -0.6] : [0.4, 0], blink: blink(lt, 2.9) }), headTilt: worried ? -0.08 : 0 }, S.HAT_FARM);
    const m = pop(t, tVet, 0.35); if (m > 0) { c.save(); c.translate(620 - 30 * 1.45, 1480 - 360 * 1.45); c.scale(m * 1.3, m * 1.3); c.fillStyle = C.red; c.fillRect(-12, -40, 24, 30); R.ell(c, 0, 0, 20, 20); R.fillStroke(c, C.yellow, 4); c.restore(); } }, { rim: RIM });
  ctx.restore();
  label(ctx, 'WHEAT FARMERS', 540, 440, pop(t, tFarm), { size: 60 });
  label(ctx, 'MANY: WWI VETERANS', 540, 560, pop(t, tVet + 0.05), { size: 48, col: C.yellow });
  if (t > tDep - 0.35) { const u = E.in(seg(t, tDep - 0.35, tDep + 0.1)), sh = shake(t, tDep + 0.1, 10); ctx.save(); ctx.translate(250 + sh, lerp(-200, 900, u)); ctx.rotate(0.08);
    CL.cutout(ctx, () => { ctx.beginPath(); ctx.moveTo(-60, -200); ctx.lineTo(60, -200); ctx.lineTo(60, 0); ctx.lineTo(120, 0); ctx.lineTo(0, 140); ctx.lineTo(-120, 0); ctx.lineTo(-60, 0); ctx.closePath(); }, C.red, { elev: 1.8 });
    ctx.rotate(-Math.PI / 2); fitTxt(ctx, 'WHEAT PRICES', 60, 16, 40, '#FFFDF8', 250); ctx.restore(); }
  LT.grade(ctx, 'golden', { vignette: 0.2 });
});

// C1 (s03 "twenty thousand emus showed up"): the horizon fills with emus; the 20,000 counter
const tTwenty = at('s03', 'twenty'), tShowed = at('s03', 'showed'), tAte = at('s03', 'ate');
const ARR = crowd(46, 21, -40, 1120, 0, 430, 0.12, 0.5);
shot('C1 arrival', ST.s03 - 0.1, tAte - 0.1, (ctx, t, lt) => {
  ctx.save(); zoomAt(ctx, 540, 1000, 1.02 + lt * 0.03);
  S.land(ctx, t, { hy: 930, windmill: { x: 900, s: 0.4 }, house: { x: 160, s: 0.35 }, rows: 9, wheatDy: 30 });
  const n = Math.floor(lerp(3, ARR.length, E.out(seg(t, tTwenty - 0.2, tShowed + 0.4))));
  S.emuCrowd(ctx, ARR.slice(0, n).map(e => { const tIn = lerp(tTwenty - 0.2, tShowed + 0.4, e.i / ARR.length), u = E.back(seg(t, tIn, tIn + 0.35), 1.6);
    return { x: e.x - lt * 30 * e.s, y: 940 + e.y + (1 - u) * 80 * e.s, s: e.s, face: e.face, phase: lt * 6 + e.ph, stride: 0.35, lid: 0.3 }; }));
  ctx.restore();
  const u = pop(t, tTwenty, 0.35), cnt = Math.round(20000 * E.out(seg(t, tTwenty, tShowed + 0.2)) / 100) * 100;
  if (u > 0) { ctx.save(); ctx.translate(540, 520); ctx.scale(u, u); ctx.rotate(-0.03); ctx.font = `120px ${F.black}`; const s = '≈ ' + cnt.toLocaleString('en-US'), w = Math.max(560, ctx.measureText('≈ 20,000').width + 70);
    CL.cutout(ctx, () => rr(ctx, -w / 2, -100, w, 150, 18), C.red, { elev: 1.8 }); txt(ctx, s, 0, 38, 120, '#FFFDF8'); ctx.restore(); label(ctx, 'EMUS', 540, 660, u, { size: 60, col: '#FFFDF8' }); }
  LT.grade(ctx, 'golden', { vignette: 0.2 });
});

// C2 ("and ate their crops"): emus pecking the wheat bare; the farmer's face in the foreground
shot('C2 eating', tAte - 0.1, ST.s04 - 0.12, (ctx, t, lt) => {
  const eaten = lerp(0.15, 0.75, seg(t, tAte - 0.1, tAte + 1.2));
  ctx.save(); zoomAt(ctx, 700, 1100, 1 + lt * 0.04);
  S.land(ctx, t, { hy: 760, windmill: { x: 120, s: 0.4 }, rows: 9, wheatDy: 20, eaten, sun: false });
  S.emuCrowd(ctx, [{ x: 520, y: 1180, s: 0.55, face: 1, peck: 0.5 + 0.5 * Math.sin(lt * 7), eat: 1 }, { x: 860, y: 1260, s: 0.7, face: -1, peck: 0.5 + 0.5 * Math.sin(lt * 6 + 2), eat: 1 }, { x: 980, y: 1050, s: 0.38, face: -1, peck: 0.5 + 0.5 * Math.sin(lt * 8 + 1) }]);
  for (let i = 0; i < 6; i++) { const p = ((lt * 1.6 + i / 6) % 1); ctx.save(); ctx.translate(560 + i * 70 - p * 40, 1150 - p * 260); ctx.rotate(p * 6 + i); ctx.globalAlpha = 1 - p; R.ell(ctx, 0, 0, 10, 24); ctx.fillStyle = S.WHEAT; ctx.fill(); ctx.restore(); }
  ctx.restore();
  LT.lit(ctx, c => S.personBust(c, 250, 1420, 1.45, S.FARMER, { face: R.expr('shocked', { look: [0.8, -0.2] }), headTilt: -0.05 }, S.HAT_FARM), { rim: RIM });
  LT.grade(ctx, 'golden', { vignette: 0.22 });
});

// D1 (s04 "So the government sent soldiers"): the army truck rolls in; the Major stands on the bed
const tSoldiers = at('s04', 'soldiers'), tTwo = at('s04', 'two'), tLewis = at('s04', 'lewis'), tMg = at('s04', 'machine'), tTen = at('s04', 'ten'), tRounds = at('s04', 'rounds');
shot('D1 truck arrives', ST.s04 - 0.12, tTwo - 0.1, (ctx, t, lt) => {
  const u = E.out(seg(t, ST.s04 - 0.1, ST.s04 + 1.3)), x = lerp(-800, 520, u), bob = (1 - u) * Math.sin(lt * 18) * 5;
  S.land(ctx, t, { hy: 900, windmill: { x: 900, s: 0.45 }, fence: { dy: 80 }, rows: 6, wheatDy: 520, px: u * 140 });
  ctx.save(); ctx.fillStyle = '#C9A06E'; ctx.beginPath(); ctx.moveTo(0, 1240); ctx.lineTo(W, 1200); ctx.lineTo(W, 1400); ctx.lineTo(0, 1440); ctx.closePath(); ctx.fill(); ctx.restore(); // dirt road
  for (let i = 0; i < 5; i++) { const p = (lt * 2 + i / 5) % 1; if (u < 0.98) { ctx.save(); ctx.globalAlpha = (1 - p) * 0.6 * (1 - u); R.ell(ctx, x - 420 - p * 200, 1330 - p * 60, 40 + p * 80, 30 + p * 50); ctx.fillStyle = '#E4CFA6'; ctx.fill(); ctx.restore(); } }
  ctx.save(); ctx.translate(x - 20, 1360 + bob); ctx.scale(0.95, 0.95);
  LT.lit(ctx, c => S.truck(c, { rot: x * 0.02, bed: b => { S.person(b, -110, 0, 0.62, 1, S.SOL2, { legN: { foot: [30, 0] }, face: R.expr('neutral', { look: [1, 0] }) }, S.HAT_ARMY);
    S.person(b, 120, 0, 0.66, 1, S.MAJOR, { armN: { hand: [60, -260], grip: 'point' }, face: R.expr('smug', { look: [1, -0.2] }) }, S.HAT_ARMY); } }), { rim: RIM });
  ctx.restore();
  label(ctx, 'MAJOR MEREDITH', 600, 640, pop(t, tSoldiers + 0.1), { size: 54, arrow: 0.4 });
  label(ctx, 'ROYAL AUSTRALIAN ARTILLERY', 540, 470, pop(t, tSoldiers + 0.35), { size: 40, col: C.yellow });
  LT.grade(ctx, 'golden', { vignette: 0.18 });
});

// D2 ("Two Lewis machine guns"): two guns drop onto army canvas
shot('D2 two guns', tTwo - 0.1, tTen - 0.1, (ctx, t, lt) => {
  tarp(ctx);
  const g1 = E.out(seg(t, tTwo - 0.1, tTwo + 0.18)), g2 = E.out(seg(t, tLewis - 0.1, tLewis + 0.18));
  for (const [g, y, tt] of [[g1, 760, tTwo], [g2, 1130, tLewis]]) { if (g <= 0) continue; const sh = shake(t, tt + 0.18, 8);
    ctx.save(); ctx.translate(600 + sh, y); ctx.scale(lerp(2.0, 1.35, g), lerp(2.0, 1.35, g)); ctx.rotate(lerp(-0.2, -0.04, g)); ctx.globalAlpha = clamp(g * 3);
    LT.lit(ctx, c => S.lewisGun(c, {}), { rim: RIM }); ctx.restore(); }
  label(ctx, 'LEWIS GUN × 2', 540, 1380, pop(t, tMg), { size: 72, col: C.yellow });
  LT.grade(ctx, 'day', { vignette: 0.22 });
});

// D3 ("Ten thousand rounds"): the ammo crate slams down, the lid opens, the stamp
shot('D3 crate', tTen - 0.1, ST.s05 - 0.12, (ctx, t, lt) => {
  tarp(ctx);
  const d = E.in(seg(t, tTen - 0.1, tTen + 0.15)), sh = shake(t, tTen + 0.15, 12);
  ctx.save(); ctx.translate(540 + sh, lerp(-300, 1330, d)); ctx.scale(1.5, 1.5);
  const lid = E.out(seg(t, tTen + 0.4, tTen + 0.9)); if (lid > 0.2) S.rounds(ctx, 9, seg(t, tTen + 0.6, tRounds + 0.2));
  S.crate(ctx, lid * 0.82, 'AMMUNITION'); ctx.restore();
  if (t > at('s04', 'thousand') - 0.05) { ctx.save(); ctx.translate(540, 600); S.stampWord(ctx, '10,000 ROUNDS', 96, seg(t, at('s04', 'thousand') - 0.05, at('s04', 'thousand') + 0.25)); ctx.restore(); }
  LT.grade(ctx, 'day', { vignette: 0.22 });
});

// E1 (s05 "Day three"): the calendar flips 1 -> 2 -> 3 over the dam
const tDay = ST.s05, tThree = at('s05', 'three'), tOver = at('s05', 'over'), tThou = at('s05', 'thousand'), tDam = at('s05', 'dam'), tPerf = at('s05', 'perfect');
shot('E1 day three', ST.s05 - 0.12, tOver - 0.1, (ctx, t, lt) => {
  fieldBg({ hy: 900, dam: { x: 560, y: 1120, w: 900 }, rows: 6, wheatDy: 520 }, 12)(ctx, t);
  const k = t < tDay + 0.2 ? 1 : t < tThree - 0.05 ? 2 : 3, f = t > tThree - 0.05 ? E.out(seg(t, tThree - 0.05, tThree + 0.2)) : 1;
  ctx.save(); ctx.translate(540, 820); ctx.rotate(-0.03); ctx.scale(1.5, 1.5);
  if (k === 3 && f < 1) { ctx.save(); ctx.translate(0, f * 500); ctx.rotate(f * 0.4); ctx.globalAlpha = 1 - f; S.calCard(ctx, 'NOV 1932', 'DAY 2'); ctx.restore(); }
  S.calCard(ctx, 'NOV 1932', 'DAY ' + k);
  ctx.restore();
  LT.grade(ctx, 'golden', { vignette: 0.2 });
});

// E2 ("over a thousand emus walk up to a dam"): the wide dam; a column of emus walks in from the right
const DAMC = crowd(40, 51, 0, 1, 0, 1, 0, 1);
const damEmus = (t, lt, t0) => DAMC.map(e => { const y = 1010 + e.y * 300, s = lerp(0.14, 0.42, e.y), x = lerp(1300, 380, E.out(clamp((t - t0) / 3.2 + e.x * 0.6 - 0.2))) + e.x * 520 + Math.sin(e.i) * 40;
  return { x, y, s, face: -1, phase: lt * 6 + e.ph, stride: 0.35, peck: x < 900 && e.pk > 0.6 ? 0.6 : 0 }; });
shot('E2 dam', tOver - 0.1, tPerf - 0.1, (ctx, t, lt) => {
  ctx.save(); zoomAt(ctx, 540, 1100, 1 + lt * 0.03);
  S.land(ctx, t, { hy: 900, dam: { x: 520, y: 1110, w: 860 }, rows: 6, wheatDy: 520, windmill: { x: 120, s: 0.4 } });
  S.emuCrowd(ctx, damEmus(t, lt, tOver - 0.4));
  ctx.restore();
  label(ctx, '1,000+ EMUS', 540, 520, pop(t, tThou), { size: 84, col: C.red, fg: '#FFFDF8' });
  label(ctx, 'THE DAM', 520, 1290, pop(t, tDam + 0.05), { size: 46 });
  LT.grade(ctx, 'golden', { vignette: 0.2 });
});

// E3 ("Perfect ambush"): the soldier's smug face in the foreground, the gun barrel, the emus at the dam behind
shot('E3 ambush', tPerf - 0.1, ST.s06 - 0.1, (ctx, t, lt) => {
  ctx.fillStyle = '#E9D2A0'; ctx.fillRect(0, 0, W, H);
  halfPass(ctx, 9, g => { S.land(g, t, { hy: 900, dam: { x: 520, y: 1110, w: 860 }, rows: 6, wheatDy: 520 }); S.emuCrowd(g, damEmus(t, lt, tOver - 0.4)); });
  LT.haze(ctx, 'golden', 0.08);
  ctx.save(); ctx.translate(-120, 1400); ctx.rotate(-0.12); ctx.scale(1.7, 1.7); LT.lit(ctx, c => S.lewisGun(c, {}), { rim: RIM }); ctx.restore();
  LT.lit(ctx, c => S.personBust(c, 760, 1420, 1.6, S.SOL, { face: R.expr(t > tPerf + 0.25 ? 'smug' : 'squint', { look: [-0.6, 0], blink: blink(lt, 2.6) }), headTilt: 0.05 }, S.HAT_ARMY), { rim: { ...RIM, dir: [-1, -0.4] } });
  LT.grade(ctx, 'golden', { vignette: 0.24 });
});

// F1 (s06 "The gun kills about a dozen..."): the gunner fires; a tally card counts to 12 (no gore: the count is on paper)
const tGun = at('s06', 'gun'), tDozen = at('s06', 'dozen'), tAnd6 = at('s06', 'and'), tJam = at('s06', 'jams');
shot('F1 firing', ST.s06 - 0.1, tAnd6 - 0.05, (ctx, t, lt) => {
  const firing = t > tGun - 0.1, fl = firing ? (Math.floor(t * 18) % 2 ? 1 : 0.5) : 0;
  ctx.save(); zoomAt(ctx, 500, 1200, 1.05 + lt * 0.03); ctx.translate(shake(t, tGun - 0.1, 4) * (firing ? 1 : 0), 0);
  S.land(ctx, t, { hy: 1000, rows: 7, wheatDy: 30, sun: true });
  S.emuCrowd(ctx, crowd(12, 77, 700, 1100, 0, 40, 0.14, 0.18).map(e => ({ x: e.x + lt * 60, y: 1010 + e.y, s: e.s, face: 1, phase: lt * 12 + e.ph, stride: 1 })));
  LT.lit(ctx, c => gunner(c, 120, 1480, 1.3, t, { flash: fl, recoil: firing ? Math.sin(t * 113) : 0, face: R.expr('squint', { look: [1, 0] }) }), { rim: RIM });
  ctx.restore();
  // tally card: 12 marks drawn while the line plays
  const u = pop(t, tGun, 0.3); if (u > 0) { const n = Math.floor(12 * seg(t, tGun + 0.1, tDozen + 0.35)); ctx.save(); ctx.translate(540, 470); ctx.scale(u, u); ctx.rotate(-0.03);
    CL.cutout(ctx, () => rr(ctx, -330, -110, 660, 220, 16), '#FFFDF8', { elev: 1.6 }); ctx.lineCap = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = 12;
    for (let i = 0; i < n; i++) { const g = Math.floor(i / 5), j = i % 5, x0 = -270 + g * 170; ctx.beginPath(); if (j < 4) { ctx.moveTo(x0 + j * 30, -60); ctx.lineTo(x0 + j * 30, 60); } else { ctx.moveTo(x0 - 16, 50); ctx.lineTo(x0 + 106, -50); } ctx.stroke(); }
    txt(ctx, '≈ 12', 220, 30, 96, C.red); ctx.restore(); }
  LT.grade(ctx, 'golden', { vignette: 0.2 });
});

// F2 ("... and JAMS"): close on the gun; click, smoke, the JAMMED stamp; the emus scatter behind
shot('F2 jam', tAnd6 - 0.05, ST.s07 - 0.1, (ctx, t, lt) => {
  ctx.fillStyle = '#E9D2A0'; ctx.fillRect(0, 0, W, H);
  halfPass(ctx, 10, g => { S.land(g, t, { hy: 1000, rows: 7, wheatDy: 30 }); S.emuCrowd(g, crowd(14, 91, 300, 1100, 0, 80, 0.2, 0.3).map(e => ({ x: e.x + (t > tJam ? (t - tJam) * 500 * (e.i % 2 ? 1 : -1) : 0), y: 1010 + e.y, s: e.s, face: e.i % 2 ? 1 : -1, phase: lt * 14 + e.ph, stride: t > tJam ? 1 : 0.2 }))); });
  LT.haze(ctx, 'golden', 0.06);
  const firing = t < tJam - 0.05, sh = shake(t, tJam, 10);
  ctx.save(); ctx.translate(380 + sh, 1050); ctx.rotate(-0.05); ctx.scale(2.0, 2.0);
  LT.lit(ctx, c => S.lewisGun(c, { flash: firing ? (Math.floor(t * 18) % 2 ? 1 : 0.5) : 0, smoke: t > tJam ? seg(t, tJam, tJam + 1.2) : 0 }), { rim: RIM }); ctx.restore();
  if (t > tJam) { ctx.save(); ctx.translate(560, 640); S.stampWord(ctx, 'JAMMED', 150, seg(t, tJam, tJam + 0.25)); ctx.restore(); }
  LT.grade(ctx, 'golden', { vignette: 0.22 });
});

// G (s07 "They mounted a gun on a truck. The emus outran the truck."): tracking shot; the emus overtake
const tTruck = at('s07', 'truck'), tEmus7 = at('s07', 'emus'), tOutran = at('s07', 'outran');
shot('G truck chase', ST.s07 - 0.1, ST.s08 - 0.12, (ctx, t, lt) => {
  const pan = lt * 520, bump = Math.abs(Math.sin(lt * 9)) * 14 + Math.sin(lt * 23) * 4, rock = Math.sin(lt * 9) * 0.02;
  S.land(ctx, t, { hy: 860, windmill: { x: 600, s: 0.4 }, fence: { dy: 60 }, rows: 7, wheatDy: 560, px: pan * 2 });
  ctx.save(); ctx.fillStyle = '#C9A06E'; ctx.fillRect(0, 1180, W, 230); ctx.fillStyle = 'rgba(120,80,40,0.25)'; for (let i = 0; i < 14; i++) { const x = ((i * 160 - pan * 2.2) % 1400 + 1400) % 1400 - 160; R.ell(ctx, x, 1250 + (i % 3) * 50, 40, 10); ctx.fill(); } ctx.restore();
  // emus overtaking (they enter from the left on "The emus")
  const em = crowd(6, 33, 0, 1, 0, 1, 0, 1).map((e, i) => { const tt = t - tEmus7 + 0.3 - e.x * 0.25; return { x: -300 + Math.max(0, tt) * 900, y: 1210 + e.y * 160, s: 0.36 + e.y * 0.1, face: 1, phase: lt * 16 + e.ph, stride: 1, lid: 0.45 }; });
  S.emuCrowd(ctx, em.filter(e => e.y < 1290));
  for (let i = 0; i < 6; i++) { const p = (lt * 2.4 + i / 6) % 1; ctx.save(); ctx.globalAlpha = (1 - p) * 0.55; R.ell(ctx, 160 - p * 260, 1330 - p * 80, 40 + p * 90, 30 + p * 50); ctx.fillStyle = '#E4CFA6'; ctx.fill(); ctx.restore(); }
  ctx.save(); ctx.translate(520, 1360 - bump); ctx.rotate(rock); ctx.scale(0.74, 0.74);
  LT.lit(ctx, c => S.truck(c, { rot: lt * 9, bed: b => { b.save(); b.translate(-60, -150); b.rotate(-0.12 + Math.sin(lt * 11) * 0.12); b.scale(0.6, 0.6); S.lewisGun(b, { bipod: 250, flash: t > tTruck && t < tOutran && Math.floor(t * 14) % 2 ? 0.7 : 0 }); b.restore();
    S.person(b, -200, 0, 0.6, 1, S.SOL, { hip: [-6, -176], lean: 0.25, legN: { foot: [96, 0] }, legF: { foot: [-118, 0] }, armN: { hand: [150, -250], grip: 'fist' }, armF: { hand: [-80, -200], grip: 'fist' }, face: R.expr(t > tOutran ? 'shocked' : 'squint', { look: [1, 0] }) }, S.HAT_ARMY); },
    driver: d => S.person(d, 120, -100, 0.42, 1, S.SOL2, { face: R.expr(t > tOutran ? 'worried' : 'neutral', { look: [1, 0] }) }, S.HAT_ARMY) }), { rim: RIM });
  ctx.restore();
  S.emuCrowd(ctx, em.filter(e => e.y >= 1290));
  label(ctx, 'GUN ON A TRUCK', 540, 520, pop(t, tTruck - 0.1) * (1 - seg(t, tEmus7 - 0.1, tEmus7 + 0.1)), { size: 60 });
  label(ctx, 'TOO SLOW', 540, 520, pop(t, tOutran + 0.3), { size: 84, col: C.red, fg: '#FFFDF8' });
  LT.grade(ctx, 'golden', { vignette: 0.2 });
});

// H1 (s08 "By December, the Major"): December on the calendar, the Major pleased with himself
const tDec = at('s08', 'december'), tRep = at('s08', 'reported'), t986 = at('s08', '986'), t9860 = at('s08', '9860'), tExact = at('s08', 'exactly'), tTen8 = at('s08', 'ten'), tBird = at('s08', 'bird');
shot('H1 major', ST.s08 - 0.12, tRep - 0.1, (ctx, t, lt) => {
  fieldBg({ hy: 1000, rows: 6, wheatDy: 400, windmill: { x: 820, s: 0.4 }, dusk: 1 }, 12)(ctx, t);
  LT.lit(ctx, c => S.personBust(c, 600, 1440, 1.7, S.MAJOR, { face: R.expr('smug', { look: [0, 0], blink: blink(lt, 2.4) }), headTilt: 0.04 }, S.HAT_ARMY), { rim: { ...RIM, dir: [-1, -0.4] } });
  ctx.save(); ctx.translate(250, 560); ctx.rotate(-0.06); const u = pop(t, tDec - 0.05, 0.3); ctx.scale(u * 1.05, u * 1.05); if (u > 0) S.calCard(ctx, '1932', 'DEC'); ctx.restore();
  LT.grade(ctx, 'golden', { vignette: 0.22 });
});

// H2 ("reported 986 kills with 9,860 rounds"): the typed report; the numbers stamp in
shot('H2 report', tRep - 0.1, tExact - 0.1, (ctx, t, lt) => {
  paperBg(ctx, '#3E3A32');
  ctx.save(); ctx.translate(540, 900); const z = 1.06 + lt * 0.02; ctx.scale(z, z);
  S.report(ctx, [['EMUS KILLED', '986', seg(t, t986 - 0.05, t986 + 0.3)], ['ROUNDS USED', '9,860', seg(t, t9860 - 0.05, t9860 + 0.3)]], { note: "HIS OWN COUNT. OTHER ACCOUNTS WERE LOWER.", w: 820, h: 860 });
  ctx.restore();
  LT.grade(ctx, 'office', { vignette: 0.25 });
});

// H3 ("EXACTLY ten bullets per bird"): the division on paper; = 10 in a red circle; a skeptical emu peeks in
shot('H3 math', tExact - 0.1, ST.s09 - 0.12, (ctx, t, lt) => {
  paperBg(ctx, '#F1EADB');
  ctx.strokeStyle = 'rgba(80,110,160,0.18)'; ctx.lineWidth = 3; for (let y = 120; y < H; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  label(ctx, '9,860 ÷ 986', 540, 560, pop(t, tExact - 0.05), { size: 110 });
  const u = pop(t, tTen8 - 0.05, 0.35, 2.6);
  if (u > 0) { ctx.save(); ctx.translate(540, 880); ctx.scale(u, u); txt(ctx, '= 10', 0, 70, 220, INK); ctx.strokeStyle = C.red; ctx.lineWidth = 16; ctx.beginPath(); ctx.ellipse(70, 0, 190, 150, -0.1, 0, Math.PI * 2 * seg(t, tTen8, tTen8 + 0.4)); ctx.stroke(); ctx.restore(); }
  label(ctx, 'BULLETS PER BIRD', 540, 1160, pop(t, at('s08', 'bullets')), { size: 64, col: C.yellow });
  const pk = E.out(seg(t, tBird - 0.3, tBird + 0.2));
  if (pk > 0) { ctx.save(); ctx.translate(880, lerp(1950, 1460, pk)); ctx.rotate(-0.15); ctx.scale(1.4, 1.4); LT.lit(ctx, c => S.emuFace(c, { lid: [0.55, 0.15], look: [-0.7, -0.6], tilt: -0.1 }), { rim: RIM }); ctx.restore(); }
  LT.grade(ctx, 'day', { vignette: 0.15 });
});

// I1 (s09 "And the emu problem?"): the wide paddock, still full of emus
const tStill = at('s09', 'still'), tThere = at('s09', 'there');
const STAY = crowd(30, 141, -40, 1120, 0, 520, 0.14, 0.62);
shot('I1 still there wide', ST.s09 - 0.12, tStill - 0.1, (ctx, t, lt) => {
  ctx.save(); zoomAt(ctx, 540, 1100, 1.0 + lt * 0.04);
  S.land(ctx, t, { hy: 900, windmill: { x: 860, s: 0.45 }, house: { x: 200, s: 0.4 }, rows: 9, wheatDy: 30, eaten: 0.5 });
  S.emuCrowd(ctx, STAY.map(e => ({ x: e.x + Math.sin(lt + e.i) * 10, y: 910 + e.y, s: e.s, face: e.face * (e.i % 3 ? 1 : -1), peck: e.pk > 0.4 ? 0.5 + 0.5 * Math.sin(lt * 5 + e.ph) : 0, eat: 1 })));
  ctx.restore();
  LT.grade(ctx, 'golden', { vignette: 0.2 });
});
// I2 ("Still there."): the emu from the opening, chewing, staring at us
shot('I2 still there face', tStill - 0.1, ST.s10 - 0.12, (ctx, t, lt) => {
  fieldBg({ hy: 1150, rows: 7, eaten: 0.5 }, 10)(ctx, t);
  ctx.save(); zoomAt(ctx, 540, 900, 1 + lt * 0.04); ctx.translate(560, 880); ctx.scale(2.7, 2.7);
  LT.lit(ctx, c => { S.emuFace(c, { lid: 0.5, look: [0, 0.1], chew: lt, blink: blink(lt + 1.2, 2.0) }); c.strokeStyle = S.WHEATD; c.lineWidth = 5; c.beginPath(); c.moveTo(14, 84); c.lineTo(70, 130); c.stroke(); R.ell(c, 76, 140, 10, 20, -0.7); c.fillStyle = S.WHEAT; c.fill(); }, { rim: RIM });
  ctx.restore();
  LT.grade(ctx, 'golden', { vignette: 0.24 });
});

// J (s10 "So what actually worked? Not soldiers. Money."): the stage; a big ?; hat + gun get the red X; the pound note slams in
const tWorked = at('s10', 'worked'), tNot = at('s10', 'not'), tSold10 = at('s10', 'soldiers'), tMoney = at('s10', 'money');
shot('J stage', ST.s10 - 0.12, ST.s11 - 0.12, (ctx, t, lt) => {
  stage(ctx, t, t > tMoney);
  if (t < tNot - 0.05) { const u = pop(t, ST.s10 + 0.1, 0.4); ctx.save(); ctx.translate(540, 900); ctx.scale(u, u); ctx.rotate(Math.sin(lt * 2) * 0.05); txt(ctx, '?', 0, 180, 520, C.yellow); ctx.lineWidth = 10; ctx.strokeStyle = INK; ctx.strokeText('?', 0, 180); ctx.restore();
    label(ctx, 'WHAT WORKED?', 540, 1300, pop(t, tWorked - 0.2), { size: 70 }); }
  else if (t < tMoney - 0.05) {
    const u = pop(t, tNot - 0.05, 0.3);
    ctx.save(); ctx.translate(540, 1080); ctx.scale(u * 1.3, u * 1.3); ctx.rotate(-0.05); LT.lit(ctx, c => S.lewisGun(c, { bipod: 170 }), { rim: RIM }); ctx.restore();
    ctx.save(); ctx.translate(540, 760); ctx.scale(u * 2.1, u * 2.1); S.hatFront(ctx, S.HAT_ARMY); ctx.restore();
    ctx.save(); ctx.translate(540, 960); S.bigX(ctx, 340, seg(t, tSold10 - 0.05, tSold10 + 0.25)); ctx.restore();
  } else {
    for (let i = 0; i < 10; i++) { const p = seg(t, tMoney + i * 0.06, tMoney + 1.2 + i * 0.06); if (p <= 0) continue; ctx.save(); ctx.translate(100 + hash(i) * 880, lerp(-150, 1300 + hash(i + 3) * 80, E.out(p))); ctx.rotate((hash(i + 7) - 0.5) * 1.2 + p * (hash(i) - 0.5)); S.pound(ctx, 0.6); ctx.restore(); }
    const u = E.in(seg(t, tMoney - 0.05, tMoney + 0.12)), sh = shake(t, tMoney + 0.12, 12); ctx.save(); ctx.translate(540 + sh, lerp(-300, 940, u)); ctx.rotate(-0.06); S.pound(ctx, 2.1, { elev: 2.4 }); ctx.restore();
    label(ctx, 'MONEY', 540, 1320, pop(t, tMoney + 0.15), { size: 90, col: C.yellow });
  }
  LT.grade(ctx, 'day', { vignette: 0.3 });
});

// K1 (s11 "The government kept paying farmers a cash bounty per emu."): the notice on the fence; a pound note changes hands
const tKept = at('s11', 'kept'), tCash = at('s11', 'cash'), tBounty = at('s11', 'bounty'), tIn = at('s11', 'in'), tSix = at('s11', 'six'), t1934 = at('s11', '1934'), tThey = at('s11', 'they'), t57 = at('s11', '57000'), tClaims = at('s11', 'claims');
shot('K1 bounty', ST.s11 - 0.12, tIn - 0.1, (ctx, t, lt) => {
  ctx.save(); zoomAt(ctx, 540, 1100, 1 + lt * 0.02);
  S.land(ctx, t, { hy: 940, windmill: { x: 900, s: 0.45 }, fence: { dy: 70 }, rows: 6, wheatDy: 520 });
  ctx.save(); ctx.translate(250, 1460); rr(ctx, -20, -900, 40, 900, 4); R.fillStroke(ctx, '#8A6440', 5); ctx.translate(0, -620); ctx.rotate(-0.03); ctx.scale(0.62 * pop(t, ST.s11 - 0.1, 0.35), 0.62 * pop(t, ST.s11 - 0.1, 0.35)); S.poster(ctx); ctx.restore();
  const give = E.out(seg(t, tCash - 0.3, tCash + 0.3)), got = t > tBounty + 0.2;
  LT.lit(ctx, c => S.person(c, 640, 1480, 1.35, 1, S.FARMER, { armN: { hand: got ? [80, -380] : [lerp(20, 140, give), lerp(-120, -300, give)], grip: 'pinch' }, armF: { hand: [-10, -120] },
    face: R.expr(got ? 'grin' : 'smile', { look: [1, -0.3], blink: blink(lt, 3.1) }), headTilt: got ? -0.06 : 0 }, S.HAT_FARM), { rim: RIM });
  // the clerk's hand with the note (from the right) / the note in the farmer's hand
  if (!got) { const hx0 = lerp(1250, 900, give); ctx.save(); ctx.translate(hx0, 1080); ctx.fillStyle = '#2E3A59'; rr(ctx, 0, -40, 400, 80, 30); R.fillStroke(ctx, '#3A4A6A', 5); R.hand(ctx, [0, 0], Math.PI, '#E8B898', 'pinch', { size: 1.6 }); ctx.translate(-80, -40); S.pound(ctx, 0.75, { rot: 0.1 }); ctx.restore(); }
  else { const hp = [640 + 80 * 1.35, 1480 - 380 * 1.35]; ctx.save(); ctx.translate(hp[0] + 40, hp[1] - 90); ctx.rotate(-0.12 + Math.sin(lt * 6) * 0.06); S.pound(ctx, 0.85); ctx.restore(); }
  ctx.restore();
  label(ctx, 'CASH PER EMU', 640, 460, pop(t, tBounty + 0.1), { size: 70, col: C.yellow });
  LT.grade(ctx, 'golden', { vignette: 0.2 });
});

// K2 ("In six months of 1934"): the 1934 calendar flips JAN..JUN
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'];
shot('K2 six months', tIn - 0.1, tThey - 0.1, (ctx, t, lt) => {
  paperBg(ctx, '#E5DCC8');
  const k = Math.min(5, Math.floor(6 * seg(t, tSix - 0.1, t1934 + 0.9))), u = pop(t, tIn - 0.1, 0.3);
  ctx.save(); ctx.translate(540, 900); ctx.rotate(-0.03); ctx.scale(1.7 * u, 1.7 * u);
  for (let i = 5; i > k; i--) ; S.calCard(ctx, '1934', MON[k]); ctx.restore();
  label(ctx, `${k + 1} OF 6 MONTHS`, 540, 1340, pop(t, tSix), { size: 56, col: C.yellow });
  LT.grade(ctx, 'day', { vignette: 0.15 });
});

// K3 ("they filed over 57,000 bounty claims"): claim slips pile up; the counter runs to 57,000+
shot('K3 claims', tThey - 0.1, ST.s12 - 0.12, (ctx, t, lt) => {
  paperBg(ctx, '#E5DCC8');
  const p = E.out(seg(t, tThey, t57 + 0.6)), n = Math.floor(lerp(1, 60, p));
  for (let i = 0; i < n; i++) { const col = i % 3, row = Math.floor(i / 3); ctx.save(); ctx.translate(300 + col * 240 + (hash(i) - 0.5) * 50, 1340 - row * 24); S.slip(ctx, 0.75, (hash(i + 4) - 0.5) * 0.3, i); ctx.restore(); }
  const cnt = Math.round(57000 * E.out(seg(t, tThey + 0.1, t57 + 0.1)) / 100) * 100, u = pop(t, tThey, 0.3);
  if (u > 0) { ctx.save(); ctx.translate(540, 470); ctx.scale(u, u); ctx.rotate(-0.03); ctx.font = `130px ${F.black}`; const s = cnt.toLocaleString('en-US') + (t > t57 ? '+' : ''), w = ctx.measureText('57,000+').width + 80;
    CL.cutout(ctx, () => rr(ctx, -w / 2, -110, w, 160, 18), C.red, { elev: 1.8 }); txt(ctx, s, 0, 42, 130, '#FFFDF8'); ctx.restore(); }
  label(ctx, 'BOUNTY CLAIMS', 540, 640, pop(t, tClaims - 0.25), { size: 62 });
  LT.grade(ctx, 'day', { vignette: 0.15 });
});

// L1 (s12 "Turns out the deadliest weapon in that war..."): the Lewis gun lying in the wheat; an emu strolls past and looks down at it
const tDead = at('s12', 'deadliest'), tWasnt = at('s12', 'wasn'), tGun12 = at('s12', 'gun'), tIt = at('s12', 'it'), tPay = at('s12', 'paycheck');
shot('L1 abandoned gun', ST.s12 - 0.12, tWasnt - 0.1, (ctx, t, lt) => {
  ctx.save(); zoomAt(ctx, 540, 1200, 1 + lt * 0.03);
  S.land(ctx, t, { hy: 860, windmill: { x: 860, s: 0.45 }, rows: 7, wheatDy: 30, eaten: 0.6 });
  ctx.save(); ctx.translate(480, 1300); ctx.rotate(0.06); ctx.scale(1.25, 1.25); LT.lit(ctx, c => S.lewisGun(c, {}), { rim: RIM }); ctx.restore();
  const ex = lerp(1200, 760, E.out(seg(t, ST.s12, ST.s12 + 1.4)));
  ctx.save(); ctx.translate(ex, 1290); ctx.scale(-0.7, 0.7); S.emu(ctx, { phase: lt * 6, stride: ex > 770 ? 0.35 : 0, peck: t > tDead + 0.4 ? 0.45 : 0, lid: 0.5, look: [1, 0.6] }); ctx.restore();
  ctx.restore();
  label(ctx, 'THE DEADLIEST WEAPON?', 540, 520, pop(t, tDead), { size: 62 });
  LT.grade(ctx, 'golden', { vignette: 0.2 });
});

// L2 ("wasn't a gun. It was a paycheck."): the gun gets the X; the pay envelope takes the spotlight; the final card echoes the hook
shot('L2 paycheck', tWasnt - 0.1, T + 0.1, (ctx, t, lt) => {
  stage(ctx, t, t > tIt);
  if (t < tIt - 0.05) {
    ctx.save(); ctx.translate(540, 980); ctx.scale(1.4, 1.4); ctx.rotate(-0.05); LT.lit(ctx, c => S.lewisGun(c, { bipod: 170 }), { rim: RIM }); ctx.restore();
    ctx.save(); ctx.translate(540, 980); S.bigX(ctx, 330, seg(t, tGun12 - 0.05, tGun12 + 0.25)); ctx.restore();
  } else {
    const u = E.out(seg(t, tIt - 0.05, tIt + 0.35)), notes = E.back(seg(t, tPay, tPay + 0.4), 2);
    ctx.save(); ctx.translate(540, lerp(1500, 1000, u)); ctx.scale(1.7, 1.7); ctx.rotate(-0.04); S.payEnv(ctx, 1, notes); ctx.restore();
    // the emu from the opening peeks in, deadpan
    const pk = E.out(seg(t, tPay + 0.5, tPay + 1.0)); if (pk > 0) { ctx.save(); ctx.translate(lerp(-260, 170, pk), 1330); ctx.rotate(0.2); ctx.scale(1.2, 1.2); LT.lit(ctx, c => S.emuFace(c, { lid: 0.55, look: [-0.8, -0.3], blink: blink(lt, 1.9) }), { rim: RIM }); ctx.restore(); }
  }
  LT.grade(ctx, 'day', { vignette: 0.3 });
});

// ---------- overlays ----------
// frame-0 hook card: ARMY vs. 20,000 EMUS (through s01); the last frames echo it: ARMY is struck out, CASH written in
function headline(ctx, t) {
  const first = t < ST.s02, last = t > tPay + 0.15; if (!first && !last) return;
  const a = first ? 1 - seg(t, ST.s02 - 0.3, ST.s02 - 0.1) : seg(t, tPay + 0.15, tPay + 0.4); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2, 420); ctx.rotate(-0.02);
  const HS = 80; ctx.font = `${HS}px ${F.black}`; const wa = ctx.measureText('ARMY').width, wv = ctx.measureText(' vs. ').width, we = ctx.measureText('20,000 EMUS').width + 28, x0 = -(wa + wv + we) / 2, cw = wa + wv + we + 70;
  CL.cutout(ctx, () => rr(ctx, -cw / 2, -84, cw, 124, 18), '#FFFDF8', { elev: 1.6 });
  txt(ctx, 'ARMY', x0, 6, HS, INK, 'left'); txt(ctx, ' vs. ', x0 + wa, 6, HS, '#6A6A68', 'left');
  ctx.save(); ctx.translate(x0 + wa + wv + we / 2, -22); CL.cutout(ctx, () => rr(ctx, -we / 2, -56, we, 88, 12), C.red, { elev: 0.8 }); txt(ctx, '20,000 EMUS', 0, 28, HS, '#FFFDF8'); ctx.restore();
  if (last) { const s = seg(t, tPay + 0.3, tPay + 0.55); ctx.strokeStyle = C.red; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x0 - 10, -20); ctx.lineTo(x0 - 10 + (wa + 20) * s, -26); ctx.stroke();
    const u = pop(t, tPay + 0.55, 0.3); if (u > 0) { ctx.save(); ctx.translate(x0 + wa / 2, -150); ctx.rotate(-0.08); ctx.scale(u, u); CL.cutout(ctx, () => rr(ctx, -150, -62, 300, 100, 14), C.yellow, { elev: 1.4 }); txt(ctx, 'CASH', 0, 22, 80, INK); ctx.restore(); } }
  ctx.restore();
}
function stampPlace(ctx, t) { // historical label, small, top of the 3:4 crop (hidden on the map, where the place is the picture)
  if ((t > ST.s02 - 0.1 && t < tWheat - 0.1) || t > tPay + 0.3) return;
  const s = t > tIn - 0.1 && t < ST.s12 - 0.12 ? 'WESTERN AUSTRALIA · 1934' : 'WESTERN AUSTRALIA · 1932';
  ctx.save(); ctx.translate(W / 2, 262); ctx.font = `30px ${F.black}`; const w = ctx.measureText(s).width + 44;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -28, w, 54, 10), '#171717', { elev: 0.8, tex: 0 }); txt(ctx, s, 0, 11, 30, C.yellow); ctx.restore();
}

// ---------- edit, subtitles ----------
SH.sort((a, b) => a.t0 - b.t0);
const ED = makeEdit(SH, W, H);
const SPLIT = { s01: [2, 5, 2, 3], s02: [2, 7, 6], s03: [5, 6], s04: [5, 4, 3], s05: [2, 9, 2], s06: [6, 2], s07: [7, 5], s08: [5, 5, 5], s09: [4, 2], s10: [4, 3], s11: [7, 3, 5, 6], s12: [8, 3, 4] };
const REPL = [[/twenty thousand/i, '20,000'], [/Ten thousand/i, '10,000'], [/a thousand/i, '1,000'], [/\bTwo\b/, '2'], [/\bthree:/, '3:'], [/\bten\b/i, '10'], [/six months/i, '6 months']];
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
  headline(ctx, t); stampPlace(ctx, t);
  ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.26; ctx.drawImage(TEX, 0, 0); ctx.restore();
  EN.drawSubtitles(ctx, t, SUBS, { y: 1565, size: 62, maxW: 820, x: 540, highlight: ['BIRDS.', 'machine', 'guns.', '20,000', '2', '10,000', '1,000', 'JAMS.', '986', '9,860', 'EXACTLY', '10', 'Money.', 'bounty', '57,000', 'paycheck.'] });
}

// ---------- sound cues (for mix.py) ----------
function cues() {
  const c = [['wind', 0.0, 0.5], ['boom', 0.25, 0.25], ['click', 0.6, 0.6], ['click', 0.75, 0.5], ['stamp', t1932 - 0.02, 0.4]];
  c.push(['cut', tBirds - 0.1, 0.4], ['emuboom', tBirds + 0.05, 0.7], ['whoosh', tMach - 0.15, 0.4], ['clank', tMach + 0.3, 0.6], ['blip', tMach + 0.8, 0.3]);
  c.push(['cut', ST.s02 - 0.1, 0.4], ['paper', ST.s02 + 0.1, 0.6], ['tag', tAus + 0.5, 0.6], ['zoom', tWheat - 0.6, 0.4]);
  c.push(['wind', tWheat - 0.1, 0.4], ['tag', tFarm, 0.5], ['clink', tVet, 0.9], ['tag', tVet + 0.05, 0.4], ['fall', tDep - 0.4, 0.6], ['slam', tDep + 0.1, 0.7]);
  c.push(['cut', ST.s03 - 0.1, 0.35], ['emuboom', tTwenty, 0.7], ['tick', tTwenty + 0.1, 0.3], ['tick', tTwenty + 0.3, 0.3], ['tick', tTwenty + 0.5, 0.3], ['emuboom', tShowed + 0.1, 0.6], ['steps', tShowed, 0.5]);
  c.push(['cut', tAte - 0.1, 0.35], ['peck', tAte, 0.6], ['peck', tAte + 0.3, 0.5], ['peck', tAte + 0.55, 0.5], ['pop', tAte + 0.7, 0.4]);
  c.push(['cut', ST.s04 - 0.12, 0.35], ['engine', ST.s04 - 0.1, 0.6], ['brake', ST.s04 + 1.0, 0.4], ['tag', tSoldiers + 0.1, 0.5], ['tag', tSoldiers + 0.35, 0.4]);
  c.push(['cut', tTwo - 0.1, 0.35], ['clank', tTwo + 0.18, 0.8], ['clank', tLewis + 0.18, 0.8], ['tag', tMg, 0.5]);
  c.push(['cut', tTen - 0.1, 0.35], ['slam', tTen + 0.15, 0.9], ['creak', tTen + 0.4, 0.5], ['stamp', at('s04', 'thousand') - 0.02, 0.8]);
  c.push(['cut', ST.s05 - 0.12, 0.35], ['flip', ST.s05 + 0.2, 0.6], ['flip', tThree - 0.05, 0.6], ['cut', tOver - 0.1, 0.35], ['steps', tOver, 0.5], ['emuboom', tThou, 0.6], ['tag', tThou, 0.5], ['water', tDam, 0.5]);
  c.push(['cut', tPerf - 0.1, 0.35], ['clank', tPerf + 0.1, 0.4], ['blip', tPerf + 0.3, 0.3]);
  c.push(['cut', ST.s06 - 0.1, 0.3], ['mg', tGun - 0.1, 0.55, tAnd6 - tGun + 0.25], ['cut', tAnd6 - 0.05, 0.3], ['mg', tAnd6, 0.5, tJam - tAnd6 - 0.05], ['click', tJam, 0.9], ['click', tJam + 0.12, 0.7], ['twang', tJam + 0.08, 0.6], ['stamp', tJam + 0.02, 0.7], ['puff', tJam + 0.1, 0.6], ['steps', tJam + 0.2, 0.5]);
  c.push(['cut', ST.s07 - 0.1, 0.35], ['engine', ST.s07 - 0.1, 0.6], ['engine', ST.s07 + 1.4, 0.6], ['tag', tTruck - 0.1, 0.4], ['mg', tTruck + 0.05, 0.3, tOutran - tTruck - 0.1], ['steps', tEmus7 - 0.2, 0.6], ['steps', tEmus7 + 0.5, 0.6], ['whoosh', tEmus7 + 0.1, 0.4], ['wah', tOutran + 0.35, 0.6]);
  c.push(['cut', ST.s08 - 0.12, 0.35], ['tag', tDec - 0.05, 0.5], ['cut', tRep - 0.1, 0.35], ['typing', tRep, 0.5], ['stamp', t986, 0.7], ['typing', t986 + 0.4, 0.4], ['stamp', t9860, 0.7]);
  c.push(['cut', tExact - 0.1, 0.35], ['tag', tExact - 0.05, 0.5], ['scratch', tTen8, 0.8], ['slam', tTen8 + 0.05, 0.5], ['tag', at('s08', 'bullets'), 0.4], ['rise', tBird - 0.3, 0.4]);
  c.push(['cut', ST.s09 - 0.12, 0.35], ['wind', ST.s09, 0.5], ['peck', ST.s09 + 0.5, 0.4], ['peck', ST.s09 + 0.9, 0.4], ['cut', tStill - 0.1, 0.35], ['chew', tStill + 0.1, 0.6], ['emuboom', tThere + 0.2, 0.5]);
  c.push(['cut', ST.s10 - 0.12, 0.35], ['rise', ST.s10 + 0.05, 0.4], ['tag', tWorked - 0.2, 0.5], ['cut', tNot - 0.05, 0.3], ['thump', tNot, 0.5], ['buzzer', tSold10 + 0.05, 0.5], ['slam', tMoney + 0.12, 0.7], ['kaching', tMoney + 0.15, 0.6], ['flutter', tMoney + 0.2, 0.6], ['flutter', tMoney + 0.6, 0.5]);
  c.push(['cut', ST.s11 - 0.12, 0.35], ['paper', ST.s11, 0.5], ['tag', tBounty + 0.1, 0.5], ['flutter', tCash - 0.2, 0.5], ['clink', tBounty + 0.2, 0.6]);
  c.push(['cut', tIn - 0.1, 0.35]); for (let i = 0; i < 6; i++) c.push(['flip', lerp(tSix - 0.1, t1934 + 0.9, i / 6), 0.45]);
  c.push(['cut', tThey - 0.1, 0.35]); for (let i = 0; i < 14; i++) c.push(['paper', lerp(tThey, t57 + 0.5, i / 14), 0.35]); c.push(['stamp', t57 + 0.1, 0.6], ['tag', tClaims - 0.25, 0.5]);
  c.push(['cut', ST.s12 - 0.12, 0.35], ['steps', ST.s12, 0.4], ['tag', tDead, 0.5], ['cut', tWasnt - 0.1, 0.35], ['buzzer', tGun12, 0.5], ['whoosh', tIt - 0.1, 0.4], ['kaching', tPay + 0.05, 0.7], ['flutter', tPay + 0.05, 0.6], ['emuboom', tPay + 0.6, 0.5], ['scratch', tPay + 0.35, 0.5], ['tag', tPay + 0.55, 0.5]);
  return c;
}
const MUSIC = { b0: 0, story: ST.s02, army: ST.s04, battle: ST.s05, report: ST.s08, still: ST.s09, twist: ST.s10, bounty: ST.s11, fin: ST.s12, hit: tPay + 0.1, end: T };

// ---------- CLI ----------
const [mode, a1, a2] = process.argv.slice(2);
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
