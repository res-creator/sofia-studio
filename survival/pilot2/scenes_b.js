// Full pilot, part 2: night 1 .. night 10 (galley, cold room, night visitor, ice machine run, Coast Guard, the speakers).
const C = require('./common'), { L, P, at, end, sc, pop, blink, win, sm, shot, shake, dark, glow, day, fade, burst, waves, FLOOR, COLD, TALLY } = C;
const { clamp, lerp, ease, fillR, stroke, circle, hash, hero, rosa, zombie, pill, stat, cross, check, tape } = L;
const W = 1920, H = 1080, HS = 1.25, HX = 600;   // hero scale in the galley; where his crate stands
const S = {};
// silhouette of the night visitor (Rosa, unrecognisable): near-black body, headlamp on
const SIL = { skin: '#0b0d12', shirt: '#0c0e13', shirt2: '#0a0b10', pants: '#0b0c11', wrap: '#0c0e13', bags: false, belt: false, coverall: false };
const crateSeat = (ctx, x) => L.crate(ctx, x, FLOOR, 160, 120);   // 120 px = 96 local units at scale 1.25
const SEAT = 96;

// ------------------------------------------------------------------ NIGHT 1: the bangs stop; the engines stop; the lights stay on
S.night1 = { draw(ctx, t) {
  const s = sc('night1'), t4 = at('s04_4'), tStop = at('s04_4', /stop/), tLight = at('s04_4', /lights/i), tNob = at('s04_4', /Nobody/);
  const swing = t < tStop ? 0.05 : 0.05 * Math.max(0, 1 - (t - tStop) / 1.5);
  ctx.save(); shot(ctx, t, [[s.t0, 960, 560, 1.0], [s.t0 + 0.1, 980, 520, 1.12, 'm', s.t1 - s.t0]]);
  C.galley(ctx, t, { cart: 1260, tally: 1 });
  P.lamp(ctx, 900, t, swing);
  crateSeat(ctx, HX);
  hero(ctx, HX, FLOOR, HS, { dir: 1, pose: 'sit', seat: SEAT, hands: { near: [70, -200], far: [60, -196] }, look: t > tStop ? -0.2 : 0.5, lookUp: t > tStop && t < tNob, brow: 'worried', blink: blink(t), shut: t < tStop, t });
  ctx.restore();
  dark(ctx, 0.45, [{ x: 900, y: 700, r: 700, a: 0.9 }, { x: 1570, y: 330, r: 200 }]);
  tape(ctx, 250, 140, 'NIGHT 1', null, pop(t, s.t0 + 0.2));
  pill(ctx, 1500, 200, 'ENGINES: OFF', '#ff5a4f', pop(t, tStop), '#fff', 40);
  pill(ctx, 1500, 300, 'LIGHTS: ON', '#efe6cf', pop(t, tLight), '#1e2026', 36);
  pill(ctx, 960, 960, 'NO ANNOUNCEMENT', '#3b404c', pop(t, tNob), '#efe6cf', 34);
} };

// ------------------------------------------------------------------ DAY 3: the rhythm; rationing; a mark for every day
S.rhythm = { draw(ctx, t) {
  const s = sc('rhythm'), tFoot = at('s05_2', /Footsteps/), tDrag = at('s05_2', /dragging/), tSil = at('s05_2', /silences/), tA = at('a1'), tCan = at('a1', /can/), tWat = at('a1', /bottle/), tMark = at('a1', /mark/);
  const night = win(t, tDrag - 0.2, tSil);
  const keys = [[s.t0, 960, 560, 1.0], [tFoot, 960, 420, 1.15, 'm', 1.2], [tSil, 960, 560, 1.0, 'cut'], [tA, 680, 560, 1.35, 'cut'], [tMark, TALLY[0] + 260, TALLY[1] + 80, 2.4, 'cut']];
  ctx.save(); shot(ctx, t, keys);
  C.galley(ctx, t, { cart: 1260, tally: t < tMark + 0.6 ? 3 : 4 });
  P.lamp(ctx, 900, t, 0, night ? 0.2 : 1);
  // dust falling from the ceiling with the footsteps
  if (win(t, tFoot, tDrag)) for (let i = 0; i < 5; i++) { const st = tFoot + i * 0.45; if (t > st) { const d = t - st; for (let k = 0; k < 8; k++) { ctx.fillStyle = `rgba(235,230,215,${Math.max(0, 0.8 - d * 0.45)})`; ctx.fillRect(500 + i * 220 + k * 9, d * 280 + k * 16, 5, 5); } } }
  crateSeat(ctx, HX);
  const eat = t > tA, sip = win(t, tWat - 0.2, tWat + 1.4), spoonUp = eat && !sip && Math.max(0, Math.sin((t - tA) * 3.2)) > 0.5;
  const hands = !eat ? { near: [70, -200], far: [60, -196] } : sip ? { near: [44, -330], far: [48, -222] } : { near: spoonUp ? [40, -320] : [66, -236], far: [56, -222] };
  hero(ctx, HX, FLOOR, HS, { dir: 1, pose: 'sit', seat: SEAT, hands, t, look: eat ? 0.3 : 0.1, lookUp: win(t, tFoot, tSil + 1.5), brow: 'worried', blink: blink(t), shut: win(t, tSil, tA), chew: eat && !sip && !spoonUp, squint: win(t, tSil, tA),
    prop: eat ? (q, hn, hf) => { if (sip) L.bottle(q, [hn[0] + 4, hn[1] + 12], 0.5, -1.9); else { L.can(q, [hf[0] + 6, hf[1] + 6]); L.spoon(q, hn, spoonUp ? -1.9 : -0.8); } } : null });
  if (t > tMark) {   // his hand adds today's mark
    const u = clamp((t - tMark - 0.1) / 0.5), mx = TALLY[0] + 41, my = TALLY[1] + 14 + u * 32;
    if (u > 0 && u < 1) stroke(ctx, [[mx, TALLY[1] + 14], [mx, my]], 4, '#1e2026');
    stroke(ctx, [[mx + 14, my + 10], [mx + 220, my + 160], [mx + 420, my + 190]], 34, L.OL); stroke(ctx, [[mx + 14, my + 10], [mx + 220, my + 160], [mx + 420, my + 190]], 26, L.HERO.shirt);
    stroke(ctx, [[mx, my], [mx + 16, my + 18]], 9, '#1e2026'); circle(ctx, mx + 18, my + 16, 15, L.OL); circle(ctx, mx + 18, my + 16, 12, L.HERO.skin); }
  ctx.restore();
  if (night) dark(ctx, 0.78, [{ x: 1570, y: 330, r: 160 }]);
  day(ctx, t, at('s05_1'), 3);
  pill(ctx, 1450, 220, '12:00  FOOTSTEPS', '#efe6cf', pop(t, tFoot) * (t < tDrag ? 1 : 0), '#1e2026', 34);
  if (night) { pill(ctx, 1450, 220, '00:00  DRAGGING', '#3b404c', pop(t, tDrag), '#efe6cf', 34); stroke(ctx, [[300, 90], [300 + clamp((t - tDrag) / 2) * 1300, 90]], 10, 'rgba(255,255,255,0.35)'); }
  pill(ctx, 1450, 220, 'SILENCE', '#efe6cf', pop(t, tSil) * (t < tA ? 1 : 0), '#1e2026', 36);
  if (t > tA && t < tMark + 0.3) { stat(ctx, 1380, 300, '1', 'CAN A DAY', pop(t, tCan)); stat(ctx, 1380, 520, '1/2', 'BOTTLE A DAY', pop(t, tWat), '#d6ecf6'); }
} };

// ------------------------------------------------------------------ DAY 5: a handprint on the cold room handle; half the bread is gone
S.cold = { draw(ctx, t) {
  const s = sc('cold'), t3 = at('s05_3'), tCold = at('s05_3', /cold/), t4 = at('s05_4'), tInf = at('s05_4', /infected/), open = t > t4 - 0.3;
  const hx = lerp(HX, 770, sm((t - s.t0) / 1.4)), walking = t < s.t0 + 1.4;
  const keys = [[s.t0, 960, 560, 1.0], [tCold, COLD.x + COLD.w - 30, 510, 2.6, 's'], [t4, COLD.x + 125, 450, 1.9, 'cut'], [tInf, 1100, 520, 1.25, 'cut']];
  ctx.save(); shot(ctx, t, keys);
  C.galley(ctx, t, { cart: 1260, tally: 5, coldOpen: open, bread: 0.5, print: !open });
  P.lamp(ctx, 900, t, 0);
  const hand = open ? [110, -300] : t > tCold - 0.2 ? [150, -300] : null;
  hero(ctx, hx, FLOOR, HS, { dir: 1, walk: walking ? (t - s.t0) * 7 : null, hands: hand ? { near: hand } : {}, look: 0.6, brow: 'worried', scared: t > tInf, blink: blink(t), t });
  ctx.restore();
  day(ctx, t, t3, 5);
  pill(ctx, 1500, 160, 'SOMEONE WAS HERE', '#ff5a4f', pop(t, tCold), '#fff', 34);
  if (open) { pill(ctx, 700, 300, 'HALF THE BREAD: GONE', '#efe6cf', pop(t, t4 + 0.2), '#1e2026', 34); cross(ctx, 1000, 300, 34, pop(t, t4 + 0.4)); }
  if (t > tInf) { pill(ctx, 1460, 860, "INFECTED DON'T CLOSE DOORS", '#3b404c', pop(t, tInf), '#efe6cf', 34); pill(ctx, 1460, 960, 'SOMEONE ALIVE', '#3fae63', pop(t, tInf + 1.2), '#fff', 36); }
} };

// ------------------------------------------------------------------ DAY 7: he waits in the dark; the night visitor; the wristband
S.visitor = { draw(ctx, t) {
  const s = sc('visitor'), t1 = at('s06_1'), tA2 = at('a2'), tFl = at('a2', /flashlight/), tCov = at('a2', /coveralls/), tDrop = at('a2', /dropped/), t2 = at('s06_2');
  const hatch = tA2 - 4.2, out = tA2 - 3.2, sw0 = tA2 - 1.8, sw1 = tA2 + 0.2, back = tCov + 0.7, gone = back + 2.2;   // the visit happens in the silent gap
  const VX0 = COLD.x + COLD.w - 62, VX1 = 1180, vx = t < out ? VX0 : t < back ? lerp(VX0, VX1, sm((t - out) / 1.1)) : lerp(VX1, VX0, sm((t - back) / 1.1));
  const visible = win(t, hatch, gone), beamOn = win(t, out + 1.1, back);
  const beamA = Math.PI + 0.12 - Math.sin(clamp((t - sw0) / (sw1 - sw0)) * Math.PI) * 0.35;
  const duck = win(t, sw0 + 0.3, sw1 + 0.2), pick = t > t2;
  const keys = [[s.t0, 600, 520, 1.6], [s.t0 + 0.1, 700, 540, 1.3, 'm', 3.5], [hatch - 0.5, 960, 560, 1.0, 'cut'], [sw0 + 0.4, 560, 470, 2.6, 'cut'], [sw1, 960, 560, 1.0, 'cut'], [tDrop, 1080, 860, 2.6, 's'], [t2, 960, 560, 1.05, 'cut'], [t2 + 1.5, 1020, 640, 1.8, 'm', 1.6]];
  ctx.save(); shot(ctx, t, keys);
  C.galley(ctx, t, { cart: 1260, tally: 7, coldOpen: win(t, hatch - 0.3, gone + 0.4) || pick, bread: t > back ? 0.25 : 0.5, hatchOpen: win(t, hatch, gone) });
  P.lamp(ctx, 900, t, 0, 0);
  if (win(t, back + 0.4, t2 + 1.9)) L.band(ctx, 1080, FLOOR - 10, 1.0, 0.05);
  // the visitor
  let tip = null;
  if (visible) { const em = clamp((t - hatch) / 0.8), walkV = win(t, out, back + 1.2); ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, FLOOR + 6); ctx.clip();
    rosa(ctx, vx, FLOOR + (1 - em) * 300, HS, Object.assign({}, SIL, t > tCov - 0.1 ? { shirt: '#4a2614', shirt2: '#3a1e10', pants: '#40200f' } : {}, { tag: 'visitor', dir: t < out + 1.1 ? 1 : -1, lamp: true, walk: win(t, out, out + 1.1) || win(t, back, back + 1.1) ? (t - out) * 6 : null, hands: { near: [96, -240] }, t,
      prop: (q, hn) => { tip = [hn[0], hn[1]]; L.flashlight(q, hn, t < out + 1.1 ? 0 : Math.PI, false); } }));
    ctx.restore(); }
  // hero behind the counter: feet behind it (farther back), head over the counter top
  const hx = pick ? lerp(560, 970, sm((t - t2) / 1.4)) : 560, behind = !pick || t < t2 + 0.3;
  if (behind) { hero(ctx, 560, 772, 1.1, { dir: 1, pose: 'crouch', crouch: duck ? 0.95 : 0.55, hands: { near: [70, -250] }, look: 0.8, brow: 'worried', scared: duck, sweat: duck, blink: !duck && blink(t), shut: !duck, t,
      prop: (q, hn) => L.pan(q, [hn[0], hn[1]], -1.35, 150) });
    fillR(ctx, 40, 600, 700, 40, 6, '#c9d1d8'); fillR(ctx, 60, 640, 660, 140, 4, '#a7b1ba'); ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(80, 660, 300, 8); }
  else { const kneel = t > t2 + 1.4; hero(ctx, hx, FLOOR, HS, { dir: 1, walk: kneel ? null : (t - t2) * 7, pose: kneel ? 'crouch' : 'stand', crouch: 0.7, hands: kneel ? { near: [96, -150 + clamp((t - t2 - 1.6) / 0.6) * -90] } : {}, look: 0.6, brow: 'up', blink: blink(t), t,
      prop: kneel && t > t2 + 1.9 ? (q, hn) => L.band(q, hn[0] + 50, hn[1] + 4, 1.0, 0) : null }); }
  // light: total dark; the porthole, the headlamp, the flashlight cone
  const lights = [{ x: 1570, y: 330, r: 220, a: 0.7 }];
  if (visible) { const vy = FLOOR - 465 * HS * 0.86; lights.push({ x: vx - 30, y: vy, r: 130, a: 0.9 }); if (beamOn && t > out + 1.1) lights.push({ cone: [vx - 130, FLOOR - 300, beamA, 0.18, 1300], a: 0.95 }); }
  if (pick) lights.push({ x: 1000, y: 700, r: 650, a: 0.75 });
  ctx.restore();
  ctx.save(); shot(ctx, t, keys); dark(ctx, 0.9, lights); ctx.restore();
  if (beamOn && duck) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const u = (t - sw0 - 0.3) / (sw1 - sw0 - 0.1), bx = lerp(-300, W + 300, u), g = ctx.createLinearGradient(bx - 260, 0, bx + 260, 0); g.addColorStop(0, 'rgba(255,240,200,0)'); g.addColorStop(0.5, 'rgba(255,240,200,0.45)'); g.addColorStop(1, 'rgba(255,240,200,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  day(ctx, t, t1, 7);
  pill(ctx, 1450, 180, 'FLASHLIGHT', '#efe6cf', pop(t, tFl) * (t < t2 ? 1 : 0), '#1e2026', 34);
  pill(ctx, 1450, 280, 'ORANGE COVERALLS', '#e8792f', pop(t, tCov) * (t < t2 ? 1 : 0), '#fff', 34);
  if (t > t2 + 2.2) pill(ctx, 960, 960, 'ENGINEERING - R. OKAFOR', '#c8402e', pop(t, t2 + 2.2), '#fff', 38);
} };

// ------------------------------------------------------------------ DAY 9: the last bottle; forty steps to the ice machine (map)
S.water = { draw(ctx, t) {
  const s = sc('water'), t1 = at('s07_1'), t2 = at('s07_2'), tIce = at('s07_2', /ice/), tF = at('s07_2', /Forty/);
  if (t < t2 + 0.2) {   // the last bottle, almost empty, shaken
    ctx.save(); shot(ctx, t, [[s.t0, 640, 520, 1.5], [s.t0 + 0.1, 650, 500, 1.7, 'm', 2.6]]);
    C.galley(ctx, t, { cart: 1260, tally: 9 }); P.lamp(ctx, 900, t, 0); crateSeat(ctx, HX);
    const shk = Math.sin(t * 14) * 10;
    hero(ctx, HX, FLOOR, HS, { dir: 1, pose: 'sit', seat: SEAT, hands: { near: [80, -300 + shk], far: [66, -230] }, look: 0.6, lookUp: true, brow: 'worried', blink: blink(t), t, prop: (q, hn) => L.bottle(q, [hn[0] + 6, hn[1] + 16], 0.08, Math.sin(t * 14) * 0.15) });
    ctx.restore(); dark(ctx, 0.35, [{ x: 900, y: 600, r: 700 }]);
    day(ctx, t, t1, 9); stat(ctx, 1480, 300, '0', 'DAYS OF WATER', pop(t, t1 + 0.6), '#f6d6d2'); return; }
  // deck plan: galley -> crew mess, forty steps
  ctx.save(); shot(ctx, t, [[t2, 960, 540, 1.0], [t2 + 0.1, 960, 560, 1.08, 'm', 5]]);
  ctx.fillStyle = '#16304a'; ctx.fillRect(0, 0, W, H); ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 2; for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  fillR(ctx, 200, 340, 1520, 420, 40, '#e8e3d6'); ctx.lineWidth = 8; ctx.strokeStyle = '#1e2026'; ctx.strokeRect(200, 340, 1520, 420);
  fillR(ctx, 260, 420, 360, 260, 14, '#d4cdbd'); fillR(ctx, 1240, 420, 400, 260, 14, '#d4cdbd'); fillR(ctx, 620, 520, 620, 70, 8, '#c4bca8');
  pill(ctx, 440, 400, 'GALLEY', '#e0a530', pop(t, t2), '#1e2026', 32); pill(ctx, 1440, 400, 'CREW MESS', '#6fb4d8', pop(t, tIce), '#1e2026', 32);
  fillR(ctx, 1500, 470, 90, 120, 10, '#9fd6ff'); ctx.fillStyle = '#1e2026'; ctx.font = '36px Anton'; ctx.textAlign = 'center'; ctx.fillText('ICE', 1545, 545); ctx.textAlign = 'left';
  const pu = clamp((t - tF) / 2.4); if (t > tF) { ctx.setLineDash([18, 16]); ctx.lineDashOffset = -t * 40; stroke(ctx, [[520, 555], [lerp(520, 1460, pu), 555]], 8, '#e0a530'); ctx.setLineDash([]); circle(ctx, lerp(520, 1460, pu), 555, 18, '#e0a530'); }
  for (let i = 0; i < 4; i++) { const zx = 760 + i * 130, zy = 535 + (i % 2) * 40; circle(ctx, zx, zy, 14, '#5f7a52'); }
  pill(ctx, 960, 470, '40 STEPS', '#efe6cf', pop(t, tF), '#1e2026', 36); pill(ctx, 960, 680, 'DARK CORRIDOR', '#3b404c', pop(t, tF + 0.8), '#efe6cf', 30);
  ctx.restore();
} };

// ------------------------------------------------------------------ the walk (POV) and the ice machine: the roar, the radio
function corridorPOV(ctx, t, z, lit = 0.62) {
  const vx = 960, vy = 470, bw = 150, bh = 200, poly = (pts, c) => { ctx.beginPath(); ctx.moveTo(...pts[0]); pts.slice(1).forEach(p => ctx.lineTo(...p)); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); };
  ctx.fillStyle = '#20232b'; ctx.fillRect(0, 0, W, H);
  poly([[0, 0], [W, 0], [vx + bw, vy - bh], [vx - bw, vy - bh]], '#c9c0aa'); poly([[0, H], [W, H], [vx + bw, vy + bh], [vx - bw, vy + bh]], '#6a2a33');
  poly([[0, 0], [vx - bw, vy - bh], [vx - bw, vy + bh], [0, H]], '#bfb39a'); poly([[W, 0], [vx + bw, vy - bh], [vx + bw, vy + bh], [W, H]], '#b5a98f'); ctx.fillStyle = '#121418'; ctx.fillRect(vx - bw, vy - bh, bw * 2, bh * 2);
  for (let i = 0; i < 7; i++) { const u = ((i / 7 + z) % 1), k = Math.pow(u, 2.2); for (const sd of [-1, 1]) { const x0 = lerp(vx + sd * bw, sd > 0 ? W + 200 : -200, k), x1 = lerp(vx + sd * bw, sd > 0 ? W + 200 : -200, Math.pow(Math.min(1, u + 0.06), 2.2)), y0 = lerp(vy - bh * 0.7, -100, k), y1 = lerp(vy + bh, H + 100, k);
    poly([[x0, y0], [x1, lerp(vy - bh * 0.7, -100, Math.pow(Math.min(1, u + 0.06), 2.2))], [x1, lerp(vy + bh, H + 100, Math.pow(Math.min(1, u + 0.06), 2.2))], [x0, y1]], '#6b4c36'); } }
  // the ones standing still: dark backs, swaying slightly
  for (const [d, sd] of [[0.35, -1], [0.55, 1], [0.72, -1]]) { const u = clamp(d + z * 0.5), k = Math.pow(u, 2.2), sx = lerp(vx + sd * 60, vx + sd * 520, k), fy = lerp(vy + bh, H + 120, k), s2 = lerp(0.18, 1.6, k);
    if (u < 0.95) { ctx.save(); ctx.translate(sx + Math.sin(t * 1.3 + d * 9) * 6 * s2, fy); ctx.scale(s2, s2); ctx.fillStyle = '#0b0a0e'; ctx.beginPath(); ctx.ellipse(0, -360, 58, 62, 0, 0, 7); ctx.fill(); fillR(ctx, -60, -300, 120, 170, 30, '#0b0a0e'); ctx.fillRect(-50, -140, 40, 140); ctx.fillRect(10, -140, 40, 140); ctx.restore(); } }
  dark(ctx, lit, [{ x: vx, y: vy + 100, r: 700, a: 0.7 }]);
}
S.mess = { draw(ctx, t) {
  const s = sc('mess'), t3 = at('s07_3'), tLoud = at('s07_3', /loudest/), press = end('s07_3') + 0.2, tA3 = at('a3'), tRad = at('a3', /radio/);
  if (t < t3 - 0.3) { corridorPOV(ctx, t, (t - s.t0) * 0.12); ctx.save(); ctx.translate(0, Math.sin(t * 5) * 8); ctx.restore(); return; }
  const roar = t > press, cutZ = roar && t < press + 1.0;
  if (cutZ && t > press + 0.45) {   // cut: back in the corridor, the heads snap toward the sound
    ctx.save(); C.hall(ctx, t, 300); shake(ctx, t, 6);
    for (let i = 0; i < 3; i++) zombie(ctx, 640 + i * 360, FLOOR, 1.15, i, { dir: -1, t, redEyes: true, lean: 0.1, headTilt: -0.2 });
    ctx.restore(); dark(ctx, 0.5, [{ x: 960, y: 500, r: 900 }]); pill(ctx, 960, 180, 'THEY HEARD IT', '#ff5a4f', pop(t, press + 0.45), '#fff', 44); return; }
  const tA3e = at('a3'), walk2 = win(t, tA3e, tA3e + 1.2), grab = t > tA3e, hasRadio = t > tRad + 0.2;
  const keys = [[t3 - 0.3, 1100, 560, 1.05], [t3, 1500, 560, 1.35, 'm', 2.2], [press, 1600, 560, 1.9, 's'], [press + 1.0, 1450, 560, 1.3, 'cut'], [tA3e + 1.2, 1250, 440, 1.8, 'm', 1.4]];
  ctx.save(); shot(ctx, t, keys); if (roar && t < press + 0.45) shake(ctx, t, 14);
  C.mess(ctx, t, { iceOn: roar && !grab, radioTaken: hasRadio });
  const hx = !grab ? (t < t3 + 1.5 ? lerp(900, 1420, sm((t - t3 + 0.3) / 1.8)) : 1420) : lerp(1420, 1300, sm((t - tA3e) / 1.2));
  const fill = roar ? clamp((t - press) / 3.4) : 0;
  let hands = {}, prop = null, dir = 1;
  if (!grab && t >= t3 + 1.5) { hands = { near: [150, -240], far: [96, -310] }; prop = (q, hn) => L.bottle(q, [hn[0], hn[1] + 10], fill); }
  else if (!grab) prop = null;
  else { dir = -1; const reachR = win(t, tRad - 0.5, tRad + 0.2);
    hands = { near: reachR ? [80, -384] : [70, -250], far: [60, -226] };
    prop = (q, hn, hf) => { if (hasRadio) L.radio(q, [hn[0], hn[1] + 20]); L.bottle(q, [hf[0], hf[1] + 30], 1); }; }
  hero(ctx, hx, FLOOR, HS, { dir, walk: (!grab && t < t3 + 1.5) || walk2 ? t * 6 : null, hands, prop, look: 0.5, brow: 'worried', scared: roar, sweat: roar, blink: !roar && blink(t), shut: !roar, t });
  if (roar && !grab) burst(ctx, 1615, 330, 150, 7, '#fff', 12);
  ctx.restore();
  dark(ctx, 0.35, [{ x: 1500, y: 500, r: 800 }]);
  pill(ctx, 1460, 180, 'LOUDEST THING ON THE SHIP', '#ff5a4f', pop(t, tLoud) * (t < press + 2 ? 1 : 0), '#fff', 32);
  if (roar && t < press + 0.45) pill(ctx, 960, 300, 'GRRRRRRRR', '#efe6cf', 1, '#1e2026', 70);
  pill(ctx, 1220, 180, 'LIFEBOAT RADIO', '#f0c020', pop(t, tRad), '#1e2026', 36);
} };

// ------------------------------------------------------------------ the run back: forty steps, the last twenty at a sprint
S.run = { draw(ctx, t) {
  const s = sc('run'), tA = at('a4'), tBack = at('a4', /back/), t20 = at('a4', /twenty/), sprint = t > t20;
  const scroll = (t - s.t0) * (sprint ? 1400 : 700) + (sprint ? (t20 - s.t0) * -700 : 0);
  ctx.save(); shot(ctx, t, [[s.t0, 960, 560, 1.0], [t20, 900, 560, 1.12, 's']]);
  C.hall(ctx, t, scroll);
  const hx = 820;
  for (let i = 0; i < 3; i++) { const zx = hx + 520 + i * 240 - (sprint ? clamp((t - t20) / 2) * 140 : 0); zombie(ctx, zx, FLOOR, 1.2, i, { dir: -1, walk: t * 6 + i, t, redEyes: true }); }
  hero(ctx, hx, FLOOR, HS, { dir: -1, walk: t * (sprint ? 13 : 9), stride: sprint ? 78 : 60, lean: sprint ? 0.22 : 0.1, hands: { near: [70, -250], far: [60, -230] }, scared: true, sweat: true, brow: 'worried', t,
    prop: (q, hn, hf) => { L.radio(q, [hn[0], hn[1] + 20]); L.bottle(q, [hf[0], hf[1] + 30], 1); } });
  if (sprint) { ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 5; for (let i = 0; i < 9; i++) { const y = 200 + i * 80, x0 = (hash(i) * W + t * 2400) % (W + 400) - 200; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + 200, y); ctx.stroke(); } }
  ctx.restore(); dark(ctx, 0.3, [{ x: 900, y: 560, r: 900 }]);
  const steps = t < tBack ? 40 : t < t20 ? Math.max(20, Math.round(40 - (t - tBack) * 10)) : Math.max(0, Math.round(20 - (t - t20) * 9));
  stat(ctx, 1640, 180, String(steps), t < tBack ? 'STEPS THERE' : 'STEPS BACK', pop(t, tA), sprint ? '#f6d6d2' : '#efe6cf');
  if (sprint) pill(ctx, 960, 960, 'FULL SPRINT', '#ff5a4f', pop(t, t20), '#fff', 44);
} };

// ------------------------------------------------------------------ the radio: the Coast Guard on channel 16
S.radio = { draw(ctx, t) {
  const s = sc('radio'), tCG = at('s07_4'), tPorts = at('s07_4', /ports/), tInf = at('s07_4', /infected/), tForce = at('s07_4', /force/), slam = s.t0;
  const mapOn = t > tInf - 0.2;
  if (mapOn) {   // the coast: ports closed, cutters on patrol, a ship stopped by force
    ctx.save(); shot(ctx, t, [[tInf - 0.2, 960, 540, 1.0], [tInf, 960, 560, 1.06, 'm', 5]]);
    ctx.fillStyle = '#16304a'; ctx.fillRect(0, 0, W, H); ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 2; for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    ctx.fillStyle = '#5f7a52'; ctx.beginPath(); ctx.moveTo(W, 0); ctx.lineTo(1300, 0); ctx.quadraticCurveTo(1200, 300, 1360, 520); ctx.quadraticCurveTo(1480, 760, 1300, H); ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    for (const [x, y] of [[1420, 300], [1460, 760]]) { fillR(ctx, x, y, 120, 40, 8, '#d4cdbd'); cross(ctx, x + 60, y - 30, 26, pop(t, tInf)); }
    for (let i = 0; i < 4; i++) { const y = 160 + i * 230 + Math.sin(t + i) * 20; fillR(ctx, 1150, y, 60, 26, 10, '#9aa6b1'); }
    ctx.setLineDash([16, 14]); stroke(ctx, [[1120, 60], [1120, 1020]], 6, '#ff5a4f'); ctx.setLineDash([]);
    const sx = lerp(300, 960, sm((t - tInf) / 3.5)); fillR(ctx, sx - 130, 515, 260, 60, 26, '#f7f4ec'); fillR(ctx, sx - 30, 490, 50, 34, 6, '#c8473b'); for (let i = 0; i < 6; i++) circle(ctx, sx - 100 + i * 34, 545, 7, '#3b4a63'); pill(ctx, sx, 620, 'INFECTED ON BOARD', '#efe6cf', pop(t, tInf + 0.4), '#1e2026', 24);
    if (t > tForce) { burst(ctx, 1080, 542, 70, 7, '#ff5a4f', 10); cross(ctx, 1080, 470, 40, pop(t, tForce)); }
    ctx.restore();
    pill(ctx, 960, 120, 'ANY VESSEL WITH INFECTED', '#efe6cf', pop(t, tInf), '#1e2026', 34); pill(ctx, 960, 960, 'WILL BE STOPPED BY FORCE', '#ff5a4f', pop(t, tForce), '#fff', 40);
    return; }
  ctx.save(); shot(ctx, t, [[s.t0, 1100, 560, 1.15], [s.t0 + 0.6, 960, 560, 1.0, 'm', 1], [tCG + 0.8, 920, 420, 1.9, 'm', 2.4]]); if (t < slam + 0.3) shake(ctx, t, 16);
  C.galley(ctx, t, { cart: 1260, tally: 9 }); P.lamp(ctx, 900, t, t < slam + 1.5 ? 0.1 : 0.01); crateSeat(ctx, HX);
  const on = t > tCG - 0.2;
  hero(ctx, HX, FLOOR, HS, { dir: 1, pose: 'sit', seat: SEAT, lean: 0.12, hands: { near: on ? [60, -330] : [70, -220], far: [56, -200] }, look: 0.4, brow: 'worried', sweat: t < tCG, scared: t > tPorts, t, blink: blink(t),
    prop: (q, hn, hf) => { L.radio(q, [hn[0], hn[1] + 20], on ? 1 : 0, t); L.bottle(q, [hf[0], hf[1] + 30], 1); } });
  if (on) waves(ctx, 940, 330, t, 60, 'rgba(255,255,255,0.7)', 1);
  if (t < slam + 0.4) burst(ctx, 1570, 420, 260, 6, '#fff', 12);
  ctx.restore(); dark(ctx, 0.35, [{ x: 900, y: 500, r: 700 }]);
  pill(ctx, 1460, 200, 'CH 16 - COAST GUARD', '#f0c020', pop(t, tCG), '#1e2026', 36);
  pill(ctx, 1460, 300, 'ALL PORTS CLOSED', '#ff5a4f', pop(t, tPorts), '#fff', 36);
} };

// ------------------------------------------------------------------ NIGHT 10: the ceiling speaker clicks on; someone listens
S.speaker = { draw(ctx, t) {
  const s = sc('speaker'), tOn = end('s08_1') - 0.5, tOffW = at('s08_2', /off/), tOff = tOffW + 0.3, live = win(t, tOn, tOff), t2 = at('s08_2'), SPK = [1215, 120];
  const keys = [[s.t0, 960, 520, 1.0], [at('s08_1', /speakers/), SPK[0], 260, 2.0, 'm', 1.6], [tOn + 1.6, 660, 560, 1.6, 'cut'], [t2, SPK[0], 260, 2.0, 'cut'], [t2 + 0.2, SPK[0], 250, 2.3, 'm', 3.5], [tOff + 0.3, 960, 540, 1.0, 'cut']];
  ctx.save(); shot(ctx, t, keys);
  C.galley(ctx, t, { cart: 1260, tally: 10 });
  // ceiling speaker grille high on the wall
  circle(ctx, SPK[0], SPK[1], 84, '#3b404c'); circle(ctx, SPK[0], SPK[1], 68, '#545a68'); for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) if (i * i + j * j < 11) circle(ctx, SPK[0] + i * 17, SPK[1] + j * 17, 5, '#2a2e38');
  circle(ctx, SPK[0] + 74, SPK[1] + 64, 10, live ? '#ff4b3a' : '#4a2a28'); if (live) { glow(ctx, SPK[0] + 74, SPK[1] + 64, 60, 'rgba(255,60,40,0.5)'); waves(ctx, SPK[0], SPK[1], t, 96, 'rgba(255,230,200,0.35)'); }
  crateSeat(ctx, HX);
  const up = clamp((t - tOn - 2.2) / 0.8);   // the frying pan rests on his knees; he lifts it when the breathing starts
  hero(ctx, HX, FLOOR, HS, { dir: 1, pose: 'sit', seat: SEAT, hands: { near: [lerp(80, 60, up), lerp(-196, -300, up)], far: [56, -200] }, lookUp: t > tOn, look: 0.2, brow: 'worried', scared: live, sweat: live, blink: !live && blink(t), shut: !live, t,
    prop: (q, hn) => L.pan(q, [hn[0], hn[1]], lerp(0.25, -1.25, up), 150) });
  ctx.restore();
  dark(ctx, 0.82, [{ x: SPK[0], y: SPK[1] + 20, r: live ? 380 : 160, a: 0.8 }, { x: 640, y: 650, r: 420, a: 0.55 }, { x: 1570, y: 330, r: 160 }]);
  tape(ctx, 250, 140, 'NIGHT 10', null, pop(t, s.t0 + 0.2));
  pill(ctx, 960, 960, 'CLICK', '#efe6cf', pop(t, tOn) * (t < tOn + 1.2 ? 1 : 0), '#1e2026', 50);
  pill(ctx, 960, 960, 'CLICK', '#efe6cf', pop(t, tOff) * (t < tOff + 1.2 ? 1 : 0), '#1e2026', 50);
  pill(ctx, 1460, 860, 'SOMEONE IS LISTENING', '#ff5a4f', pop(t, at('s08_2', /listening/)) * (t < tOff ? 1 : 0), '#fff', 34);
} };

module.exports = S;
