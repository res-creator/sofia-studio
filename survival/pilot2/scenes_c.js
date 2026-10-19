// Full pilot, part 3: day 12 (the lighthouse), the choice, the service tunnel, engine control (Rosa).
const C = require('./common'), { L, P, at, end, sc, pop, blink, win, sm, shot, shake, dark, glow, day, fade, burst, waves, FLOOR, COLD } = C;
const { clamp, lerp, ease, fillR, stroke, circle, hash, hero, rosa, zombie, pill, stat, cross, check, tape, talkAmt } = L;
const W = 1920, H = 1080, HS = 1.25;
const S = {};
const grid = (ctx, bg = '#16304a') => { ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H); ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 2; for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); } };
// top-view ship icon at (x, y) heading angle a
function shipIcon(ctx, x, y, a, s = 1) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(-110, -30); ctx.lineTo(70, -30); ctx.quadraticCurveTo(120, -28, 130, 0); ctx.quadraticCurveTo(120, 28, 70, 30); ctx.lineTo(-110, 30); ctx.closePath(); ctx.fillStyle = '#f7f4ec'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#1e2026'; ctx.stroke(); fillR(ctx, -40, -14, 50, 28, 6, '#c8473b'); ctx.restore(); }
function coast(ctx) { ctx.fillStyle = '#5f7a52'; ctx.beginPath(); ctx.moveTo(W, 0); ctx.lineTo(1380, 0); ctx.quadraticCurveTo(1260, 320, 1420, 540); ctx.quadraticCurveTo(1540, 780, 1380, H); ctx.lineTo(W, H); ctx.closePath(); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#3f5a36'; ctx.stroke(); }
const lhIcon = (ctx, x, y, t) => { ctx.save(); ctx.translate(x, y); ctx.scale(2, 2); ctx.translate(-x, -y); lhIcon1(ctx, x, y, t); ctx.restore(); }, lhIcon1 = (ctx, x, y, t) => { fillR(ctx, x - 12, y - 60, 24, 60, 4, '#efe6cf'); fillR(ctx, x - 16, y - 76, 32, 18, 4, Math.cos(t * 3) > 0 ? '#ffe680' : '#8a7a40'); if (Math.cos(t * 3) > 0) glow(ctx, x, y - 68, 90, 'rgba(255,240,170,0.6)'); };

// ------------------------------------------------------------------ DAY 12: the lighthouse; the flashlight he doesn't switch on; the engines; the turn
function porthole(ctx, t, rot, z = 1) {   // big screen-space porthole view: night sea, the lighthouse sliding away as the ship turns
  ctx.fillStyle = '#5d6b78'; ctx.fillRect(0, 0, W, H); ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 3; for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); circle(ctx, 0, 0, 420, '#7f8c97'); circle(ctx, 0, 0, 380, '#4a5560'); for (let i = 0; i < 10; i++) circle(ctx, Math.cos(i * 0.628) * 400, Math.sin(i * 0.628) * 400, 12, '#5d6b78');
  ctx.beginPath(); ctx.arc(0, 0, 350, 0, 7); ctx.clip();
  const g = ctx.createLinearGradient(0, -350, 0, 350); g.addColorStop(0, '#05070f'); g.addColorStop(0.55, '#0e1630'); g.addColorStop(0.56, '#0b1426'); g.addColorStop(1, '#04070e'); ctx.fillStyle = g; ctx.fillRect(-360, -360, 720, 720);
  ctx.fillStyle = 'rgba(255,255,255,0.7)'; for (let i = 0; i < 40; i++) ctx.fillRect(-340 + hash(i) * 680, -340 + hash(i + 1) * 300, 3, 3);
  ctx.strokeStyle = 'rgba(150,180,230,0.2)'; ctx.lineWidth = 3; for (let i = 0; i < 16; i++) { const yy = 60 + i * 18, xx = ((hash(i) * 700 + t * 30) % 760) - 380; ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx + 80, yy); ctx.stroke(); }
  C.lighthouse(ctx, -60 + rot * 760, 40, t, 1.4);
  ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.beginPath(); ctx.arc(-80, -120, 260, 3.4, 4.6); ctx.lineTo(-80, -120); ctx.fill();
  ctx.restore();
}
S.light = { draw(ctx, t) {
  const s = sc('light'), t1 = at('s09_1'), tLh = at('s09_1', /lighthouse/i), tDrift = at('s09_1', /drifted/), t2 = at('s09_2'), tEng = at('s09_2', /engines/), t3 = at('s09_3'), tAway = at('s09_3', /away/), t4 = at('s09_4');
  const flash = end('s09_1') + 0.2;   // he grabs a flashlight to signal... and stops
  if (t < tDrift - 0.1) { porthole(ctx, t, 0, lerp(1.0, 1.15, sm((t - s.t0) / 5))); day(ctx, t, t1, 12); pill(ctx, 960, 960, 'A LIGHTHOUSE', '#ffe680', pop(t, tLh), '#1e2026', 44); return; }
  if (t < flash) {   // map: the ship has drifted toward land
    grid(ctx); coast(ctx); lhIcon(ctx, 1400, 520, t); const u = sm((t - tDrift) / 2.2); ctx.setLineDash([16, 14]); stroke(ctx, [[300, 540], [lerp(300, 1050, u), 540]], 6, 'rgba(255,255,255,0.6)'); ctx.setLineDash([]);
    shipIcon(ctx, lerp(300, 1050, u), 540, 0, 1.2); pill(ctx, 1050, 400, 'DRIFTING TOWARD LAND', '#efe6cf', pop(t, tDrift + 0.3), '#1e2026', 34); day(ctx, t, t1, 12); return; }
  if (t >= tAway - 0.6 && t < t4 - 0.4) {   // the porthole view turns; the light slides out of frame; then the map turns
    if (t < tAway + 1.4) { porthole(ctx, t, sm((t - tAway + 0.6) / 1.8), 1.1); return; }
    grid(ctx); coast(ctx); lhIcon(ctx, 1400, 520, t); const u = sm((t - tAway - 1.4) / 1.8), a = lerp(0, -Math.PI * 0.9, u), cx = 1050 + Math.sin(-a) * 160 * 0 - Math.sin(-a) * 160, cy = 540 - (1 - Math.cos(a)) * 160;
    shipIcon(ctx, cx, cy, a, 1.2); pill(ctx, 760, 120, 'TURNING AWAY FROM LAND', '#ff5a4f', pop(t, tAway + 1.4), '#fff', 36); return; }
  if (t >= t4 - 0.4) {   // outside: the dark liner sails away from the lighthouse
    ctx.save(); shot(ctx, t, [[t4 - 0.4, 960, 540, 1.25], [t4 - 0.3, 960, 540, 1.0, 'm', 4]]); C.outside(ctx, t, { sky: 'night' }); C.lighthouse(ctx, 260, 660, t, 1.3);
    C.liner(ctx, 1150 + (t - t4) * 30, 700, 0.62, t, { dark: 0.85 }); ctx.restore();
    pill(ctx, 960, 960, 'SOMEONE ELSE IS ALIVE', '#ff5a4f', pop(t, t4 + 0.2), '#fff', 40); pill(ctx, 960, 860, "AND DOESN'T WANT RESCUE", '#efe6cf', pop(t, at('s09_4', /rescued/)), '#1e2026', 30); return; }
  // galley: at the porthole with a flashlight; the warning; the engines start; the lamp swings again
  const eng = clamp((t - tEng) / 0.5), hes = win(t, flash, t2 + 0.6);
  ctx.save(); shot(ctx, t, [[flash, 1470, 420, 1.7], [t2 + 0.3, 1300, 520, 1.15, 'cut'], [tEng, 1300, 520, 1.2, 'm', 1.6]]); if (eng > 0) shake(ctx, t, eng * 6 * (0.6 + 0.4 * Math.sin(t * 30)));
  C.galley(ctx, t, { cart: 1260, tally: 12, rattle: eng, porthole: c => { c.fillStyle = '#0b1426'; c.fillRect(1500, 260, 140, 140); circle(c, 1580, 330, 6, Math.cos(t * 3) > 0 ? '#ffe680' : '#6a6040'); } });
  P.lamp(ctx, 900, t, 0.06 * eng, 0.4);
  const lift = hes ? 1 : t < t2 + 1.2 ? 1 - clamp((t - t2 - 0.6) / 0.6) : 0;
  hero(ctx, 1440, FLOOR, HS, { dir: 1, hands: { near: [lerp(60, 120, lift), lerp(-200, -330, lift)] }, look: eng > 0 ? -0.2 : 0.6, lookUp: hes, brow: 'worried', scared: eng > 0, sweat: eng > 0, blink: blink(t), shut: hes, t,
    prop: (q, hn) => L.flashlight(q, hn, lerp(1.3, -0.25, lift), false) });
  ctx.restore();
  dark(ctx, 0.6, [{ x: 1570, y: 330, r: 260, a: 0.8 }, { x: 1300, y: 600, r: 600, a: 0.5 }]);
  if (eng > 0) { ctx.fillStyle = `rgba(200,40,40,${0.14 * eng})`; ctx.fillRect(0, 0, W, H); }
  day(ctx, t, s.t0, 12);
  if (hes) { pill(ctx, 760, 220, 'SIGNAL FOR HELP?', '#efe6cf', pop(t, flash + 0.2), '#1e2026', 34); pill(ctx, 760, 320, 'COAST GUARD: WE WILL USE FORCE', '#ff5a4f', pop(t, flash + 1.0), '#fff', 30); }
  if (eng > 0) pill(ctx, 960, 200, 'ENGINES: ON', '#ff5a4f', eng, '#fff', 40);
} };

// ------------------------------------------------------------------ the choice: safe, fed, blind... or find out who's driving
S.choice = { draw(ctx, t) {
  const s = sc('choice'), tSafe = at('s10_1', /Safe/), tFed = at('s10_1', /Fed/), tBlind = at('s10_1', /blind/), t2 = at('s10_2'), tDrive = at('s10_2', /driving/);
  const up = clamp((t - t2) / 0.6), go = t > tDrive;
  ctx.save(); shot(ctx, t, [[s.t0, 760, 560, 1.15], [t2, 860, 540, 1.0, 'm', 1.2]]);
  C.galley(ctx, t, { cart: 1260, tally: 12 }); P.lamp(ctx, 900, t, 0.05);
  if (up < 1) L.crate(ctx, 600, FLOOR, 160, 120);
  const hx = go ? lerp(640, 760, sm((t - tDrive) / 1.0)) : 600;
  hero(ctx, hx, FLOOR, HS, up < 0.5 ? { dir: 1, pose: 'sit', seat: 96, hands: { near: [80, -196], far: [56, -200] }, look: 0.2, brow: 'flat', blink: blink(t), t, prop: (q, hn) => L.pan(q, hn, 0.25, 150) }
    : { dir: 1, walk: go ? t * 6 : null, hands: { near: [70, -236], far: [64, -230] }, look: 0.8, brow: 'angry', blink: blink(t), t, prop: (q, hn, hf) => { L.pan(q, hf, 1.25, 150); L.flashlight(q, hn, 0.05, false); } });
  if (up >= 1) L.crate(ctx, 520, FLOOR, 160, 120);
  ctx.restore(); dark(ctx, 0.35, [{ x: 800, y: 600, r: 700 }]);
  pill(ctx, 1480, 220, 'SAFE', '#efe6cf', pop(t, tSafe), '#1e2026', 40); check(ctx, 1600, 220, 30, pop(t, tSafe + 0.15));
  pill(ctx, 1480, 320, 'FED', '#efe6cf', pop(t, tFed), '#1e2026', 40); check(ctx, 1580, 320, 30, pop(t, tFed + 0.15));
  pill(ctx, 1480, 420, 'BLIND', '#efe6cf', pop(t, tBlind), '#1e2026', 40); cross(ctx, 1610, 420, 30, pop(t, tBlind + 0.15));
  pill(ctx, 960, 960, "WHO'S DRIVING?", '#ff5a4f', pop(t, tDrive), '#fff', 46);
} };

// ------------------------------------------------------------------ the service tunnel: 200 ft, something behind, the timer decoy
function tunnelSide(ctx, t, scroll, o = {}) {   // side view of a low steel tunnel (floor 860, ceiling 380)
  ctx.fillStyle = '#2a2e34'; ctx.fillRect(0, 0, W, H); fillR(ctx, -20, 330, W + 40, 50, 0, '#4a5058'); fillR(ctx, -20, 860, W + 40, 220, 0, '#3a3f46');
  for (let i = -1; i < 9; i++) { const x = ((i * 260 - scroll) % 2340 + 2340) % 2340 - 210; fillR(ctx, x, 380, 22, 480, 4, '#3b4048'); for (const y of [420, 820]) circle(ctx, x + 11, y, 6, '#5d6b78'); }
  for (const [y, c] of [[400, '#5a6a7a'], [440, '#7a3a34']]) fillR(ctx, -20, y, W + 40, 18, 9, c);
  if (o.duct != null) { const dx = o.duct - scroll; fillR(ctx, dx - 70, 740, 140, 110, 8, '#16181c'); stroke(ctx, [[dx - 70, 740], [dx + 70, 740]], 8, '#5d6b78'); }
  ctx.fillStyle = '#ffd23f'; ctx.font = '30px Anton'; ctx.textAlign = 'center'; const sx = ((1200 - scroll) % 2340 + 2340) % 2340 - 210; ctx.fillText('ENGINE CONTROL >', sx, 520); ctx.textAlign = 'left';
}
function cutaway(ctx, t, u) {   // ship profile: galley -> tunnel -> engine room
  grid(ctx);
  ctx.beginPath(); ctx.moveTo(160, 380); ctx.lineTo(1760, 380); ctx.lineTo(1680, 760); ctx.lineTo(260, 760); ctx.closePath(); ctx.fillStyle = '#e8e3d6'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = '#1e2026'; ctx.stroke();
  for (let d = 0; d < 4; d++) fillR(ctx, 360 + d * 60, 300 - d * 70, 1100 - d * 140, 70, 6, d % 2 ? '#d4cdbd' : '#e8e3d6');
  for (let y = 470; y < 760; y += 95) stroke(ctx, [[220, y], [1720, y]], 3, '#9aa3ab');
  fillR(ctx, 1080, 400, 220, 140, 10, '#e0a530'); fillR(ctx, 360, 600, 300, 140, 10, '#c8473b');
  ctx.setLineDash([16, 12]); const pts = [[1190, 540], [1190, 690], [520, 690]], L1 = 150, L2 = 670, d = (L1 + L2) * u; stroke(ctx, d < L1 ? [pts[0], [1190, 540 + d]] : [pts[0], pts[1], [1190 - (d - L1), 690]], 8, '#1e2026'); ctx.setLineDash([]);
  const p = d < L1 ? [1190, 540 + d] : [1190 - (d - L1), 690]; circle(ctx, p[0], p[1], 20, '#1e2026'); circle(ctx, p[0], p[1], 14, '#e0a530');
}
S.tunnel = { draw(ctx, t) {
  const s = sc('tunnel'), tA5 = at('a5'), tTun = at('a5', /tunnel/), tFeet = at('a5', /feet/), tNo = at('a5', /lights/), tA6 = at('a6'), tStop = at('a6', /^stop\./), tA7 = at('a7'), tSlide = at('a7', /slide/), tR = at('s10_3'), tRule = end('s10_3');
  if (t < tNo) {   // the cutaway
    cutaway(ctx, t, sm((t - tTun) / 3.4)); pill(ctx, 1190, 330, 'GALLEY', '#e0a530', pop(t, s.t0), '#1e2026', 30); pill(ctx, 510, 560, 'ENGINE ROOM', '#c8473b', pop(t, tTun), '#fff', 30); pill(ctx, 850, 790, '200 FT · SERVICE TUNNEL', '#efe6cf', pop(t, tFeet), '#1e2026', 32); return; }
  if (win(t, tA7 - 0.1, tSlide)) {   // insert: he winds the kitchen timer
    ctx.fillStyle = '#1a1d22'; ctx.fillRect(0, 0, W, H); glow(ctx, W / 2, H / 2, 700, 'rgba(255,240,200,0.18)');
    ctx.save(); ctx.translate(W / 2 - 40, H / 2 + 120); L.timer(ctx, 0, 0, 4.2, 0, t); ctx.restore();
    const a = -(t - tA7) * 5, kx = W / 2 - 40 + Math.cos(a) * 30, ky = H / 2 - 40 + Math.sin(a) * 12; circle(ctx, kx + 170, ky, 46, L.OL); circle(ctx, kx + 170, ky, 40, L.HERO.skin); stroke(ctx, [[kx + 210, ky + 20], [W, ky + 200]], 70, L.OL); stroke(ctx, [[kx + 210, ky + 20], [W, ky + 200]], 58, L.HERO.shirt);
    pill(ctx, 960, 960, 'TICK  TICK  TICK', '#efe6cf', 1, '#1e2026', 40); return; }
  const tTurn = at('a6', /Something/), tGo = end('s10_3') - 0.6;
  const moving = t < tStop - 0.2 || t > tGo, scroll = (Math.min(t, tStop - 0.2) - tNo) * 160 + (t > tGo ? (t - tGo) * 160 : 0);
  const hx = 1100, back = win(t, tTurn - 0.2, tGo), DX = 840;   // the side duct is just behind him when he stops
  const ductX = DX + (tStop - 0.2 - tNo) * 160;   // in tunnel coordinates
  const slid = t > tSlide, ring = slid ? clamp(1 - (t - tSlide) / 7) : 0, follow = clamp((t - tSlide - 0.8) / 3.2);
  const zx = t < tSlide ? lerp(80, 560, sm((t - tTurn) / (tSlide - tTurn))) : lerp(560, DX + 10, follow), zA = 1 - clamp((follow - 0.7) / 0.3);
  ctx.save(); shot(ctx, t, [[tNo, 960, 600, 1.0], [tStop, 860, 600, 1.12, 'm', 1.2], [tSlide, 860, 720, 1.4, 'cut'], [tR, 760, 620, 1.1, 'cut'], [tGo, 960, 600, 1.0, 'm', 1.2]]);
  tunnelSide(ctx, t, scroll, { duct: ductX });
  if (t > tTurn - 0.5 && zA > 0) { ctx.save(); ctx.globalAlpha = zA; zombie(ctx, zx, FLOOR - 40 + follow * 30, 0.95, 2, { dir: 1, pose: 'crouch', crouch: 1, lean: 0.55, walk: (t < tSlide && t > tTurn) || (follow > 0 && follow < 1) ? t * 3 : null, t, redEyes: true, hands: { near: [96, -170], far: [40, -175] } }); ctx.restore(); }
  if (slid) { const u = clamp((t - tSlide) / 0.6), tx = lerp(hx - 110, DX, u); if (u < 1) L.timer(ctx, tx, 820, 1.2, 1, t); const wx = DX - (t - tSlide - 0.6) * 60; if (u >= 1) waves(ctx, wx, 790, t, 40, `rgba(255,255,255,${0.75 * ring})`); }
  let tip = null;
  hero(ctx, hx, FLOOR - 40, 1.15, { dir: back ? -1 : 1, pose: 'crouch', crouch: 0.7, walk: moving ? t * 6 : null, lean: 0.2, hands: win(t, tSlide - 0.3, tSlide + 0.4) ? { near: [100, -160], far: [70, -230] } : { near: [110, -250], far: [70, -230] }, look: back ? 0.6 : 0.4, brow: 'worried', scared: back && t < tSlide, sweat: back, shut: !back || t > tSlide, blink: blink(t), t,
    prop: (q, hn, hf) => { const m = q.getTransform(), p = m.transformPoint({ x: hn[0] + (back ? -50 : 50), y: hn[1] }); tip = [p.x, p.y]; L.flashlight(q, hn, back ? 0.1 : 0.06, false); L.pan(q, hf, 1.2, 140); } });
  ctx.restore();
  dark(ctx, 0.86, tip ? [{ cone: [tip[0], tip[1], back ? Math.PI - 0.06 : 0.06, 0.22, 1300], a: 0.92 }, { x: tip[0], y: tip[1], r: 240, a: 0.6 }] : []);
  pill(ctx, 960, 180, 'NO LIGHTS', '#3b404c', pop(t, tNo) * (t < tA6 ? 1 : 0), '#efe6cf', 34);
  if (back && t < tA7) pill(ctx, 960, 180, 'SOMETHING BEHIND YOU', '#ff5a4f', pop(t, tTurn), '#fff', 36);
  if (t > tR) tape(ctx, 960, 900, 'RULE #2', 'WORKS BOTH WAYS', pop(t, tR), 0.03);
} };

// ------------------------------------------------------------------ engine control: the drop, the flare gun, the deal begins
function insertBridge(ctx, t, t0, tDead, tDoor) {   // infographic: the bridge ordered all stop; the line went dead; the door sealed
  grid(ctx, '#1c2638');
  fillR(ctx, 260, 300, 520, 360, 20, '#e8e3d6'); ctx.fillStyle = '#1e2026'; ctx.font = '54px Anton'; ctx.textAlign = 'center'; ctx.fillText('BRIDGE', 520, 380); fillR(ctx, 320, 410, 400, 90, 10, '#26314a'); for (let i = 0; i < 4; i++) fillR(ctx, 340 + i * 96, 425, 80, 60, 6, '#3b4a63');
  fillR(ctx, 1140, 300, 520, 360, 20, '#e8e3d6'); ctx.fillText('ENGINE ROOM', 1400, 380);
  ctx.setLineDash([18, 14]); stroke(ctx, [[780, 480], [1140, 480]], 8, t > tDead ? '#ff5a4f' : '#1e2026'); ctx.setLineDash([]);
  pill(ctx, 960, 420, 'ALL STOP', '#efe6cf', pop(t, t0 + 0.4), '#1e2026', 36); cross(ctx, 960, 540, 40, pop(t, tDead));
  if (t > tDoor) { fillR(ctx, 470, 520, 100, 130, 8, '#7f8c97'); circle(ctx, 550, 590, 8, '#1e2026'); pill(ctx, 520, 720, 'SEALED SINCE DAY 1', '#ff5a4f', pop(t, tDoor), '#fff', 30); }
  ctx.textAlign = 'left';
}
function insertCoast(ctx, t, t0, tLand, tEng) {   // the drift-and-turn routine
  grid(ctx); coast(ctx);
  for (let i = 0; i < 3; i++) { const y = 260 + i * 260; fillR(ctx, 1180, y, 70, 30, 12, '#9aa6b1'); }
  pill(ctx, 1220, 160, 'COAST GUARD', '#9aa6b1', pop(t, t0 + 0.3), '#1e2026', 30); shipIcon(ctx, 1420, 920, -0.3, 0.8); cross(ctx, 1420, 860, 30, pop(t, t0 + 1.2));
  const u = sm((t - tLand + 1.0) / 2.0), v = sm((t - tEng) / 2.4), a = v * Math.PI; const x = lerp(300, 950, u) - Math.sin(a) * 180, y = 520 + (1 - Math.cos(a)) * 160;
  shipIcon(ctx, x, y, a, 1.1); if (t > tEng) pill(ctx, 960, 960, 'ENGINES ON - BACK OUT TO SEA', '#ff5a4f', pop(t, tEng), '#fff', 34);
}
S.engine = { draw(ctx, t) {
  const s = sc('engine'), t1 = at('s11_1'), tHands = at('s11_1', /Hands/), tBoth = at('s11_1', /Both/), t2 = at('s11_2'), t3 = at('s11_3'), tHum = at('s11_3', /hums/), t4 = at('s11_4'), t5 = at('s11_5'), tDead = at('s11_5', /dead/), tDoor = at('s11_5', /door/), t6 = at('s11_6'), tLand = at('s11_6', /land/), tEng = at('s11_6', /engines/), tBack = at('s11_6', /back/), t7 = at('s11_7'), tTired = at('s11_7', /tired/), tE1 = at('e1');
  if (win(t, t5, t6 - 0.2)) { insertBridge(ctx, t, t5, tDead, tDoor); return; }
  if (win(t, t6 - 0.2, tBack + 0.2)) { insertCoast(ctx, t, t6, tLand, tEng); return; }
  const drop = s.t0 + 0.6, land = s.t0 + 2.4, sit = t > t7 + 0.8;
  const keys = [[s.t0, 900, 420, 1.2], [land, 1060, 560, 1.0, 'cut'], [t2, 1000, 460, 1.7, 'cut'], [t3, 1060, 560, 1.0, 'cut'], [t4, 860, 450, 1.9, 'cut'], [tBack + 0.2, 1240, 600, 1.35, 'cut'], [t7, 1100, 560, 1.0, 'cut'], [tE1, 1250, 520, 1.5, 'cut']];
  ctx.save(); shot(ctx, t, keys); if (win(t, land - 0.1, land + 0.2)) shake(ctx, t, 10);
  C.engine(ctx, t, { running: true, hatchOpen: t > drop, rudder: 0.1, fuel: 0.55, throttle: t > tBack + 0.4 ? 1 : 0, tally: 12 });
  // hero: climbs out of the hatch and down the ladder, lands, raises his hands, shows the band, relaxes, sits
  let hy = FLOOR, hx = 895, ho = { dir: 1 };
  if (t < land) { const u = clamp((t - drop) / (land - drop)); hy = lerp(330 + 1.25 * 280, FLOOR, ease.in(u)); ho = { dir: -1, hands: { near: [30, -420], far: [20, -400] } }; }
  const up = t > tHands - 0.2 && t < tHum + 1.2, both = t > tBoth - 0.1 && t < tHum + 1.2, band = win(t, t2 - 0.3, t3);
  if (t >= land) ho = { dir: 1, hands: sit ? {} : up ? { near: [band ? 150 : 90, band ? -300 : -420], far: both ? [-70, -400] : [60, -200] } : {}, prop: band ? (q, hn) => L.band(q, hn[0] + 60, hn[1] + 4, 1.0) : null };
  if (sit) { L.crate(ctx, 880, FLOOR, 160, 120); ho = { dir: 1, pose: 'sit', seat: 96, hands: { near: [70, -200], far: [56, -196] } }; }
  hero(ctx, hx, hy, HS, Object.assign({ look: 0.6, brow: t < t3 ? 'worried' : 'up', scared: t > t1 && t < tHum, sweat: t > t1 && t < t4, smile: win(t, t4, t5), blink: blink(t), t }, ho));
  // Rosa: flare gun on him; lowers it at "hums"; at the console for the engines; sits for her last line
  const lower = clamp((t - tHum) / 0.6), atCon = win(t, tBack + 0.2, t7), rx = atCon ? 1290 : 1600;
  if (t > land - 0.4) { const ro = { dir: -1, lamp: true, brow: t < tHum ? 'angry' : 'flat', squint: t < tHum, talk: talkAmt(C.TL, ['s11_1', 's11_2', 's11_3', 's11_5', 's11_6', 'e1'], t), blink: blink(t, 1), t };
    if (sit) { L.crate(ctx, 1300, FLOOR, 160, 120); Object.assign(ro, { dir: -1, pose: 'sit', seat: 96, hands: { near: [70, -200], far: [56, -196] }, smile: win(t, tE1 + 2.2, s.t1) }); rosa(ctx, 1300, FLOOR, HS, ro); }
    else if (atCon) rosa(ctx, rx, FLOOR, HS, Object.assign(ro, { hands: { near: [(rx - 1130) / HS, (650 + clamp((t - tBack - 0.2) / 0.4) * 30 - FLOOR) / HS] } }));   // hand on the throttle
    else rosa(ctx, rx, FLOOR, HS, Object.assign(ro, { hands: { near: [lerp(118, 70, lower), lerp(-262, -170, lower)], far: lower < 0.5 ? [94, -250] : [56, -196] }, prop: (q, hn) => L.flareGun(q, [hn[0] - 6, hn[1] + 4], lower * 0.9, -1) })); }
  ctx.restore();
  dark(ctx, 0.3, [{ x: 1100, y: 560, r: 800 }]); ctx.fillStyle = 'rgba(200,40,30,0.12)'; ctx.fillRect(0, 0, W, H);
  if (t > t1 && t < tHum) pill(ctx, 1460, 180, 'FLARE GUN', '#f07a2e', pop(t, t1), '#fff', 34);
  if (band) pill(ctx, 960, 960, 'ENGINEERING - R. OKAFOR', '#c8402e', pop(t, t2), '#fff', 36);
  if (win(t, t4, t5)) pill(ctx, 960, 960, 'HUMMING: DETECTED', '#efe6cf', pop(t, t4 + 0.3), '#1e2026', 38);
  if (t > tTired) pill(ctx, 1240, 200, 'ROSA OKAFOR · ENGINEER', '#e8792f', pop(t, tTired), '#fff', 36);
  if (t > tE1) pill(ctx, 1240, 300, 'SHIFT ENDED: 8:00 AM, DAY 1', '#efe6cf', pop(t, at('e1', /eight/)), '#1e2026', 30);
} };

module.exports = S;
