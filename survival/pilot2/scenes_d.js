// Full pilot, part 4: the deal, day 17 (who listens), day 20 (the cutter), day 24 (the crawler), days 26-29, day 30 (the bridge), outro.
const C = require('./common'), { L, P, at, end, sc, pop, blink, win, sm, shot, shake, dark, glow, day, fade, burst, waves, FLOOR } = C;
const { clamp, lerp, ease, fillR, stroke, circle, hash, hero, rosa, zombie, pill, stat, cross, check, tape, talkAmt } = L;
const W = 1920, H = 1080, HS = 1.25, TL = C.TL;
const S = {};
const RL = ['b1', 'f2', 'f3', 'f5', 'c2', 'd3', 'd6', 's12_4', 's13_1', 's13_2', 's13_5'];   // Rosa's lines (mouth)
const rTalk = t => talkAmt(TL, RL, t);
const seat = (ctx, x) => L.crate(ctx, x, FLOOR, 160, 120);
const grid = (ctx, bg = '#16304a') => { ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H); ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 2; for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); } };
function paHorn(ctx, x, y, live, t) { ctx.save(); ctx.translate(x, y); ctx.fillStyle = '#9aa3ab'; ctx.beginPath(); ctx.moveTo(-40, -26); ctx.lineTo(40, -50); ctx.lineTo(40, 50); ctx.lineTo(-40, 26); ctx.closePath(); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = L.OL; ctx.stroke(); fillR(ctx, -70, -24, 32, 48, 6, '#6a727a'); ctx.restore(); if (live) waves(ctx, x + 40, y, t, 50, 'rgba(255,230,200,0.6)', 1); }

// ------------------------------------------------------------------ the deal: she drives, you cook
S.deal = { draw(ctx, t) {
  const s = sc('deal'), tB = at('b1'), tFed = at('b1', /fed/), t1 = at('s12_1'), tKit = at('s12_1', /kitchen/), tEng = at('s12_1', /engine/), t2 = at('s12_2'), tYou = at('s12_2', /You/);
  if (t < t1 - 0.2) {
    ctx.save(); shot(ctx, t, [[s.t0, 1250, 560, 1.15], [s.t0 + 0.1, 1260, 540, 1.3, 'm', 4]]);
    C.engine(ctx, t, { running: true, hatchOpen: false, fuel: 0.55, tally: 14 });
    seat(ctx, 1420);
    const give = clamp((t - tFed + 0.4) / 0.6), took = t > tFed + 0.4;
    rosa(ctx, 1420, FLOOR, HS, { dir: -1, pose: 'sit', seat: 96, lamp: true, hands: took ? { near: [70, -230], far: [56, -200] } : { near: [70, -200], far: [56, -196] }, talk: rTalk(t), brow: 'flat', bags: true, blink: blink(t, 1), t, smile: t > end('b1'),
      prop: took ? (q, hn) => L.plate(q, hn[0] + 6, hn[1] - 2, 1.0) : null });
    hero(ctx, 1000, FLOOR, HS, { dir: 1, hands: { near: took ? [70, -200] : [lerp(80, 128, give), -236], far: [60, -200] }, look: 0.6, brow: 'up', smile: true, blink: blink(t), t, prop: !took ? (q, hn) => L.plate(q, hn[0] + 8, hn[1] - 2, 1.0) : null });
    ctx.restore(); dark(ctx, 0.3, [{ x: 1250, y: 560, r: 800 }]); return; }
  // split screen: one kitchen | one engine room
  const half = (fn, x0, w) => { ctx.save(); ctx.beginPath(); ctx.rect(x0, 0, w, H); ctx.clip(); fn(); ctx.restore(); };
  half(() => { ctx.save(); ctx.translate(-380, 0); C.galley(ctx, t, { cart: 1260, tally: 15 }); P.lamp(ctx, 900, t, 0.04);
    hero(ctx, 900, FLOOR, HS, { dir: -1, hands: { near: [120, -250], far: [80, -230] }, look: 0.4, brow: 'flat', smile: true, blink: blink(t), t, prop: (q, hn, hf) => { L.pan(q, hn, 0.05, 150, -1); for (let i = 0; i < 3; i++) { const u = ((t * 0.8 + i / 3) % 1); q.fillStyle = `rgba(240,240,240,${0.4 * (1 - u)})`; q.beginPath(); q.arc(hn[0] - 170 + Math.sin(u * 6 + i) * 10, hn[1] - 30 - u * 140, 16 + u * 16, 0, 7); q.fill(); } } });
    ctx.restore(); }, 0, W / 2);
  half(() => { ctx.save(); C.engine(ctx, t, { running: true, fuel: 0.5, throttle: 1 }); rosa(ctx, 1290, FLOOR, HS, { dir: -1, lamp: true, hands: { near: [(1290 - 1130) / HS, (680 - FLOOR) / HS] }, brow: 'flat', blink: blink(t, 1), t }); ctx.restore(); }, W / 2, W / 2);
  stroke(ctx, [[W / 2, 0], [W / 2, H]], 12, '#16181d');
  pill(ctx, 480, 160, 'ONE KITCHEN', '#e0a530', pop(t, tKit), '#1e2026', 40); pill(ctx, 1440, 160, 'ONE ENGINE ROOM', '#e8792f', pop(t, tEng), '#fff', 40);
  pill(ctx, 1440, 960, 'SHE KEEPS THE SHIP ALIVE', '#efe6cf', pop(t, t2), '#1e2026', 32); pill(ctx, 480, 960, 'YOU KEEP HER FED', '#efe6cf', pop(t, tYou), '#1e2026', 32);
} };

// ------------------------------------------------------------------ DAY 17: who's been listening? Only the bridge can open the PA
function profile(ctx, t, hl) {   // ship side profile with the bridge highlighted and PA lines to every deck
  grid(ctx);
  ctx.beginPath(); ctx.moveTo(160, 520); ctx.lineTo(1760, 520); ctx.lineTo(1680, 860); ctx.lineTo(260, 860); ctx.closePath(); ctx.fillStyle = '#e8e3d6'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = '#1e2026'; ctx.stroke();
  for (let d = 0; d < 4; d++) fillR(ctx, 360 + d * 50, 440 - d * 80, 1100 - d * 120, 80, 6, d % 2 ? '#d4cdbd' : '#e8e3d6');
  fillR(ctx, 1260, 180, 220, 80, 10, hl ? '#ffd23f' : '#c4bca8'); ctx.fillStyle = '#26314a'; for (let i = 0; i < 4; i++) ctx.fillRect(1276 + i * 50, 200, 36, 26);
  if (hl) for (let d = 0; d < 6; d++) { const y = 300 + d * 95; ctx.setLineDash([10, 10]); stroke(ctx, [[1370, 260], [lerp(500, 1300, d / 5), y]], 4, 'rgba(255,90,79,0.8)'); ctx.setLineDash([]); circle(ctx, lerp(500, 1300, d / 5), y, 12, '#ff5a4f'); }
}
S.clue = { draw(ctx, t) {
  const s = sc('clue'), t1 = at('f1'), tClick = at('f1', /click/i), tBr = at('f1', /breathing/), t2 = at('f2'), tBridge = at('f2', /bridge/i), t3 = at('f3'), tTank = at('f3', /water/), tPan = at('f3', /pantry/), tOne = at('f3', /one/), tMonth = at('f3', /month/), t4 = at('f4'), t5 = at('f5');
  if (win(t, tBridge - 0.3, t4)) {   // the infographic
    profile(ctx, t, true); pill(ctx, 1370, 120, 'THE BRIDGE', '#ffd23f', pop(t, tBridge), '#1e2026', 44); pill(ctx, 760, 960, 'THE ONLY PA CONTROL', '#ff5a4f', pop(t, tBridge + 0.4), '#fff', 34);
    if (t > t3) { ctx.fillStyle = 'rgba(10,14,24,0.6)'; ctx.fillRect(0, 0, W, H); stat(ctx, 520, 460, 'TANK', 'OWN WATER', pop(t, tTank), '#d6ecf6'); stat(ctx, 960, 460, 'PANTRY', "CAPTAIN'S FOOD", pop(t, tPan)); stat(ctx, 1400, 460, '1 / 30', 'PERSON / DAYS', pop(t, tOne), '#f6d6d2'); }
    return; }
  const keys = [[s.t0, 1250, 560, 1.15], [t2 - 0.3, 1360, 470, 1.9, 'cut'], [t4, 1150, 470, 2.0, 'cut'], [t5, 1370, 470, 2.0, 'cut']];
  ctx.save(); shot(ctx, t, keys);
  C.engine(ctx, t, { running: true, fuel: 0.45, tally: 17 });
  seat(ctx, 1080); seat(ctx, 1420);
  const point = win(t, tClick - 0.3, t2);
  rosa(ctx, 1420, FLOOR, HS, { dir: -1, pose: 'sit', seat: 96, lamp: true, hands: { near: [70, -230], far: [56, -200] }, talk: rTalk(t), brow: t > t5 ? 'up' : 'flat', smile: t > end('f5') - 0.3, blink: blink(t, 1), t, lookUp: win(t, tClick, t2), prop: (q, hn) => L.can(q, [hn[0], hn[1] + 4], '#e0a530') });
  hero(ctx, 1080, FLOOR, HS, { dir: 1, pose: 'sit', seat: 96, hands: point ? { near: [60, -420], far: [56, -200] } : { near: [70, -230], far: [56, -200] }, look: 0.6, lookUp: point, brow: 'worried', scared: win(t, t4, t5), sweat: t > t4, blink: blink(t), t,
    prop: point ? null : (q, hn) => L.can(q, [hn[0], hn[1] + 4], '#e0a530') });
  ctx.restore(); dark(ctx, 0.35, [{ x: 1260, y: 560, r: 700 }]);
  day(ctx, t, t1, 17);
  pill(ctx, 1500, 200, 'CLICK', '#efe6cf', pop(t, tClick) * (t < t2 ? 1 : 0), '#1e2026', 40); pill(ctx, 1500, 300, 'BREATHING', '#ff5a4f', pop(t, tBr) * (t < t2 ? 1 : 0), '#fff', 36);
  if (t > t4) pill(ctx, 960, 960, '1 PERSON · 30 DAYS', '#ff5a4f', pop(t, t4), '#fff', 40);
} };

// ------------------------------------------------------------------ DAY 20: a Coast Guard cutter; the ship goes dark for an hour; then turns around
S.cutter = { draw(ctx, t) {
  const s = sc('cutter'), t1 = at('c1'), t2 = at('c2'), tKill = at('c2', /Kill/), t3 = at('c3'), tFire = at('c3', /fire/), t4 = at('c4'), tHour = at('c4', /hour/), t5 = at('c5'), tAgain = at('c5', /Again/);
  const off = t > tKill + 0.3, darkness = off ? clamp((t - tKill - 1.2) / 2.6) : 0;
  if (win(t, t2 - 0.2, tKill + 1.2)) {   // engine room: Rosa pulls the main breaker
    ctx.save(); shot(ctx, t, [[t2 - 0.2, 1290, 560, 1.5], [tKill, 1290, 640, 2.2, 's']]);
    C.engine(ctx, t, { running: true, fuel: 0.4, breaker: off, tally: 20 });
    rosa(ctx, 1390, FLOOR, HS, { dir: -1, lamp: true, hands: { near: [(1390 - 1285) / HS, (690 + (off ? 20 : 0) - FLOOR) / HS] }, talk: rTalk(t), brow: 'angry', blink: blink(t, 1), t });
    hero(ctx, 1030, FLOOR, HS, { dir: 1, look: 0.8, brow: 'worried', scared: true, t });
    ctx.restore(); if (off) { ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = 'rgba(200,30,30,0.15)'; ctx.fillRect(0, 0, W, H); }
    pill(ctx, 960, 960, 'KILL THE LIGHTS', '#ff5a4f', pop(t, tKill), '#fff', 44); return; }
  if (win(t, t4 - 0.3, t5 - 0.3)) {   // the hour in the dark
    ctx.save(); shot(ctx, t, [[t4 - 0.3, 1200, 600, 1.4], [t4, 1220, 580, 1.6, 'm', 5]]);
    C.engine(ctx, t, { running: false, fuel: 0.4, breaker: true, tally: 20 });
    hero(ctx, 1120, FLOOR, HS, { dir: 1, pose: 'crouch', crouch: 0.8, look: -0.4, lookUp: true, brow: 'worried', shut: true, sweat: true, blink: blink(t), t });
    rosa(ctx, 1330, FLOOR, HS, { dir: -1, pose: 'crouch', crouch: 0.8, lamp: false, lookUp: true, brow: 'worried', shut: true, blink: blink(t, 1), t });
    ctx.restore(); dark(ctx, 0.9, [{ x: 1220, y: 520, r: 360, a: 0.55 }]); ctx.fillStyle = 'rgba(200,30,30,0.12)'; ctx.fillRect(0, 0, W, H);
    const left = Math.max(0, 3600 - Math.floor((t - t4) * 700)); stat(ctx, 960, 200, `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`, 'ONE LONG HOUR', pop(t, tHour), '#efe6cf'); return; }
  if (t >= t5 - 0.3) {   // the map: she turns it around, again
    grid(ctx); ctx.fillStyle = '#5f7a52'; ctx.beginPath(); ctx.moveTo(W, 0); ctx.lineTo(1380, 0); ctx.quadraticCurveTo(1260, 320, 1420, 540); ctx.quadraticCurveTo(1540, 780, 1380, H); ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    for (const y of [300, 640]) fillR(ctx, 1180, y, 70, 30, 12, '#9aa6b1');
    for (let k = 0; k < 3; k++) { ctx.setLineDash([12, 12]); stroke(ctx, [[320, 400 + k * 120], [900, 400 + k * 120], [980, 360 + k * 120], [900, 320 + k * 120]], 4, 'rgba(255,255,255,0.25)'); ctx.setLineDash([]); }
    const u = sm((t - t5) / 2.2), a = -u * Math.PI, x = 900 + Math.sin(-a) * 140 * 0 - Math.sin(-a) * 0, cx = 1000 - Math.sin(u * Math.PI) * 0;
    ctx.save(); ctx.translate(lerp(800, 860, u) + Math.sin(u * Math.PI) * 120, 760 - (1 - Math.cos(u * Math.PI)) * 120); ctx.rotate(-u * Math.PI); ctx.beginPath(); ctx.moveTo(-110, -30); ctx.lineTo(70, -30); ctx.quadraticCurveTo(120, -28, 130, 0); ctx.quadraticCurveTo(120, 28, 70, 30); ctx.lineTo(-110, 30); ctx.closePath(); ctx.fillStyle = '#f7f4ec'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#1e2026'; ctx.stroke(); fillR(ctx, -40, -14, 50, 28, 6, '#c8473b'); ctx.restore();
    pill(ctx, 960, 160, 'TURNED AROUND', '#efe6cf', pop(t, t5), '#1e2026', 40); pill(ctx, 960, 260, 'AGAIN', '#ff5a4f', pop(t, tAgain), '#fff', 48); return; }
  // outside at night: the liner, the cutter on the horizon, windows going dark deck by deck; the searchlight
  const beam = t > t3 - 0.5 ? Math.PI - 0.06 + Math.sin((t - t3) * 0.7) * 0.07 : null;
  ctx.save(); shot(ctx, t, [[s.t0, 960, 540, 1.0], [s.t0 + 0.1, 900, 560, 1.12, 'm', 6], [t3 - 0.5, 1100, 560, 1.0, 'cut'], [t3, 1000, 560, 1.15, 'm', 5]]);
  C.outside(ctx, t, { sky: 'night' }); C.cutter(ctx, 1560, 650, 0.55, t, beam);
  C.liner(ctx, 700, 760, 0.75, t, { dark: darkness });
  ctx.restore();
  if (t > t3 - 0.4) waves(ctx, 1540, 520, t, 40, 'rgba(255,255,255,0.5)');
  day(ctx, t, t1, 20);
  pill(ctx, 1540, 420, 'COAST GUARD', '#9aa6b1', pop(t, at('c1', /gray/)), '#1e2026', 34);
  if (t > t3) pill(ctx, 960, 960, 'TURN AROUND OR WE OPEN FIRE', '#ff5a4f', pop(t, tFire - 1.0), '#fff', 38);
} };

// ------------------------------------------------------------------ DAY 24: the crawler comes out of the tunnel; the dinner bell; the storeroom
S.crawler = { draw(ctx, t) {
  const s = sc('crawler'), t1 = at('d1'), tTimer = at('d1', /timer/), t2 = at('d2'), tOut = at('d2', /way/), t3 = at('d3'), t4 = at('d4'), t5 = at('d5'), tPan = at('d5', /pan/), tStore = at('d5', /storeroom/), tBell = at('d5', /bell/), t6 = at('d6');
  const hatch = tOut - 0.2, land = hatch + 1.6, open = t > tStore - 0.2, bang0 = tBell - 0.3, slam = t6 - 1.3;
  // the crawler: drops from the hatch, stands, turns to the sound, walks into the storeroom
  const walk0 = bang0 + 0.4, zx = t < walk0 ? 895 : lerp(895, 1770, clamp((t - walk0) / (slam - walk0 - 0.3)));
  const zy = t < hatch ? null : t < land ? lerp(330 + 120, FLOOR, ease.in(clamp((t - hatch) / (land - hatch)))) : FLOOR, inStore = t > slam - 0.3;
  // the hero: by the storeroom with the pan; bangs it in the doorway; steps behind the open door; slams it
  const hx = t < tStore - 0.6 ? 1560 : t < bang0 + 2.6 ? lerp(1560, 1760, sm((t - tStore + 0.6) / 0.6)) : t < slam - 0.2 ? lerp(1760, 1580, sm((t - bang0 - 2.6) / 0.6)) : lerp(1580, 1640, sm((t - slam + 0.2) / 0.3));
  const banging = win(t, bang0, bang0 + 2.6), hit = banging && Math.sin((t - bang0) * 14) > 0.6;
  const keys = [[s.t0, 1240, 560, 1.0], [hatch - 0.5, 900, 360, 1.7, 'cut'], [land + 0.2, 1240, 560, 1.0, 'cut'], [t3, 1290, 460, 2.0, 'cut'], [t4, 1240, 560, 1.0, 'cut'], [tBell, 1500, 560, 1.15, 'm', 2], [slam, 1700, 520, 1.6, 's'], [t6, 1450, 520, 1.5, 'cut']];
  ctx.save(); shot(ctx, t, keys); if (win(t, slam, slam + 0.25)) shake(ctx, t, 12);
  C.engine(ctx, t, { running: true, fuel: 0.25, hatchOpen: t > hatch - 0.4, storeOpen: open && t < slam, tally: 24 });
  if (open && t < slam) { fillR(ctx, 1460, 300, 190, 460, 6, '#7f8c97'); }   // the door leaf swung open
  // Rosa frozen at the console
  rosa(ctx, 1290, FLOOR, HS, { dir: -1, lamp: true, hands: t < land ? { near: [(1290 - 1130) / HS, (680 - FLOOR) / HS] } : { near: [60, -200], far: [50, -196] }, talk: rTalk(t), brow: 'worried', scared: win(t, land, slam), shut: !rTalk(t) && t > land, sweat: t > land, blink: blink(t, 1), t, lean: win(t, walk0 + 1.2, walk0 + 3.2) ? -0.1 : 0 });
  if (zy != null && !inStore) zombie(ctx, zx, zy, HS, 1, { dir: t < walk0 ? (t < land + 0.6 ? 1 : -1 * -1) : 1, walk: t > walk0 ? t * 4 : null, t, redEyes: true, pose: t < land + 0.5 ? 'crouch' : 'stand', crouch: 0.8 });
  const behindLeaf = win(t, bang0 + 2.8, slam - 0.2);
  const hp = { dir: t < slam ? -1 : 1, walk: Math.abs(hx - (hx)) > 0 ? null : null, hands: banging ? { near: [100, hit ? -300 : -360], far: [96, -250] } : { near: [70, -240], far: [56, -200] }, look: 0.6, brow: 'worried', scared: t > land && t < slam, sweat: t > land, shut: behindLeaf, blink: blink(t), t, smile: t > t6 + 0.4,
    prop: (q, hn, hf) => { L.pan(q, hf, banging ? -1.2 : 0.9, 150, 1); if (banging) { stroke(q, [hn, [hn[0] + 70, hn[1] + 40]], 9, '#c9d1d8'); } } };
  if (t > slam) hp.hands = { near: [130, -260], far: [56, -200] };
  if (behindLeaf) { hero(ctx, hx, FLOOR, HS, hp); fillR(ctx, 1460, 300, 190, 460, 6, '#7f8c97'); stroke(ctx, [[1470, 520], [1470, 580]], 8, '#3d4650'); }
  else if (t < t3 - 0.1 && t < land) { seat(ctx, 1560); hero(ctx, 1560, FLOOR, HS, { dir: -1, pose: 'sit', seat: 96, hands: { near: [70, -200], far: [56, -196] }, look: 0.4, brow: 'flat', blink: blink(t), t, prop: (q, hn) => L.pan(q, hn, 0.3, 150, 1), scared: t > hatch }); }
  else hero(ctx, hx, FLOOR, HS, hp);
  if (hit) burst(ctx, hx - 60, 480, 120, 6, '#fff', 10);
  ctx.restore();
  dark(ctx, 0.3, [{ x: 1240, y: 560, r: 900 }]);
  day(ctx, t, t1, 24);
  pill(ctx, 1500, 200, 'TIMER: SILENT', '#3b404c', pop(t, tTimer) * (t < t2 ? 1 : 0), '#efe6cf', 34);
  if (t > tOut && t < t3) pill(ctx, 960, 960, 'IT FOUND THE WAY OUT', '#ff5a4f', pop(t, tOut), '#fff', 40);
  pill(ctx, 1500, 200, 'SOUND', '#efe6cf', pop(t, t4) * (t < t5 ? 1 : 0), '#1e2026', 40);
  if (t > t5 && t < slam) { pill(ctx, 760, 160, 'FRYING PAN', '#efe6cf', pop(t, tPan), '#1e2026', 32); pill(ctx, 760, 250, 'EMPTY STOREROOM', '#efe6cf', pop(t, tStore), '#1e2026', 32); pill(ctx, 760, 340, 'DINNER BELL', '#ff5a4f', pop(t, tBell), '#fff', 36); }
  if (t > slam) pill(ctx, 1500, 160, 'LOCKED', '#3fae63', pop(t, slam + 0.1), '#fff', 44);
} };

// ------------------------------------------------------------------ DAYS 26-29: lessons, peaches, fuel for one more day
S.days = { draw(ctx, t) {
  const s = sc('days'), t1 = at('e2'), tEng = at('e2', /engines/), tPeach = at('e2', /peaches/), t3 = at('s12_3'), tFuel = at('s12_3', /Fuel/), t4 = at('s12_4');
  if (win(t, t3 - 0.3, t4 - 0.3)) {   // the fuel gauge, close
    ctx.save(); shot(ctx, t, [[t3 - 0.3, 1440, 640, 2.4], [t3, 1440, 670, 3.0, 'm', 3]]); C.engine(ctx, t, { running: true, fuel: lerp(0.12, 0.06, clamp((t - t3) / 2)), tally: 29 }); ctx.restore();
    day(ctx, t, t3, 29); stat(ctx, 520, 760, '1 DAY', 'OF FUEL LEFT', pop(t, tFuel), '#f6d6d2'); return; }
  const lesson = t < tPeach - 0.4, two = t > t4 - 0.3;
  const keys = [[s.t0, 1240, 560, 1.0], [tPeach - 0.4, 1260, 560, 1.25, 'cut'], [t4 - 0.3, 1270, 500, 1.7, 'cut'], [t4, 1270, 490, 1.9, 'm', 3]];
  ctx.save(); shot(ctx, t, keys);
  C.engine(ctx, t, { running: true, fuel: two ? 0.06 : 0.2, tally: two ? 29 : 26 });
  if (lesson) {
    rosa(ctx, 1500, FLOOR, HS, { dir: -1, lamp: true, hands: { near: [(1500 - 1440) / HS + 30, (560 - FLOOR) / HS] }, talk: Math.max(0, Math.sin(t * 9)) * 0.5, brow: 'flat', blink: blink(t, 1), t });
    hero(ctx, 1100, FLOOR, HS, { dir: 1, look: 0.7, brow: 'up', blink: blink(t), t, hands: { near: [70, -250], far: [60, -236] }, prop: (q, hn) => { fillR(q, hn[0] - 10, hn[1] - 60, 90, 70, 6, '#efe6cf'); q.fillStyle = '#1e2026'; q.font = '16px Anton'; q.fillText('NOTES', hn[0] + 6, hn[1] - 30); } });
  } else {
    seat(ctx, 1080); seat(ctx, 1420);
    const eat = (q, hn, hf) => { L.can(q, [hf[0] + 6, hf[1] + 6], '#f0a020'); L.spoon(q, hn, Math.max(0, Math.sin(t * 3)) > 0.5 ? -1.9 : -0.8); };
    const up1 = Math.max(0, Math.sin(t * 3)) > 0.5, up2 = Math.max(0, Math.sin(t * 3 + 1.6)) > 0.5;
    rosa(ctx, 1420, FLOOR, HS, { dir: -1, pose: 'sit', seat: 96, lamp: true, hands: two ? { near: [70, -230], far: [56, -200] } : { near: up2 ? [40, -320] : [66, -236], far: [56, -222] }, talk: rTalk(t), chew: !two && !up2, smile: !two, brow: two ? 'worried' : 'up', blink: blink(t, 1), t,
      prop: two ? null : (q, hn, hf) => { L.can(q, [hf[0] + 6, hf[1] + 6], '#f0a020'); L.spoon(q, hn, up2 ? -1.9 : -0.8); } });
    hero(ctx, 1080, FLOOR, HS, { dir: 1, pose: 'sit', seat: 96, hands: two ? { near: [70, -200], far: [56, -196] } : { near: up1 ? [40, -320] : [66, -236], far: [56, -222] }, chew: !two && !up1, look: 0.6, brow: two ? 'worried' : 'up', blink: blink(t), t, prop: two ? null : eat });
  }
  ctx.restore(); dark(ctx, 0.3, [{ x: 1260, y: 560, r: 800 }]);
  day(ctx, t, t1, two ? 29 : 26);
  if (lesson) pill(ctx, 760, 200, 'LESSON: ENGINES', '#e8792f', pop(t, tEng), '#fff', 34);
  if (!lesson && !two) { pill(ctx, 960, 960, 'CANNED PEACHES = DESSERT', '#f0a020', pop(t, tPeach), '#1e2026', 38); check(ctx, 1330, 960, 30, pop(t, tPeach + 0.4)); }
} };

// ------------------------------------------------------------------ DAY 30: steering switches to the bridge; the camera; the voice
S.bridge = { draw(ctx, t) {
  const s = sc('bridge'), flip = s.t0 + 1.6, t1 = at('s13_1'), t2 = at('s13_2'), cc = end('s13_2') + 0.5, stat0 = at('s13_3') - 1.6, tClick = stat0 + 0.6, t3 = at('s13_3'), t4 = at('s13_4'), tTake = at('s13_4', /take/), t5 = at('s13_5'), roar = end('s13_5') + 0.2;
  if (win(t, cc, tClick)) {   // CCTV: slow push on the monitor; the figure begins to turn; static
    const u = clamp((t - cc) / (stat0 - cc)), z = lerp(1.0, 1.8, ease.inOut(u)); ctx.fillStyle = '#0a0b0d'; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2); fillR(ctx, 360, 150, 1200, 780, 24, '#16181c');
    if (t < stat0) C.cctvBridge(ctx, t, 400, 190, 1120, 700, clamp((t - stat0 + 1.8) / 1.8)); else C.cctvStatic(ctx, t, 400, 190, 1120, 700);
    ctx.restore(); ctx.save(); ctx.globalAlpha = 0.12; ctx.fillStyle = '#000'; for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 2); ctx.restore(); return; }
  const ovr = t > flip, rud = ovr ? ease.inOut(clamp((t - flip - 0.4) / 2.5)) * 0.9 + (t > roar ? Math.sin((t - roar) * 2) * 0.1 : 0) : 0, live = win(t, tClick, end('s13_4') + 0.4);
  const keys = [[s.t0, 1240, 560, 1.0], [flip - 0.3, 1211, 560, 2.6, 'cut'], [flip + 0.7, 1440, 560, 3.2, 's'], [t1, 1560, 440, 2.0, 'cut'], [t2, 1300, 560, 1.15, 'cut'], [t2 + 0.2, 1320, 540, 1.35, 'm', 4],
    [tClick, 1180, 520, 1.05, 'cut'], [t4, 1180, 500, 1.25, 'm', 3.4], [tTake + 0.8, 1080, 450, 2.2, 'cut'], [t5, 1560, 440, 2.2, 'cut'], [roar, 1240, 560, 1.0, 'cut'], [roar + 0.3, 1240, 560, 1.15, 'm', 1.5]];
  ctx.save(); shot(ctx, t, keys); if (t > roar) shake(ctx, t, 5);
  C.engine(ctx, t, { running: true, fuel: 0.04, override: ovr, rudder: rud, tally: 30, throttle: 1, cctv: t > tClick ? C.cctvStatic : (c, tt, x, y, w, h) => C.cctvBridge(c, tt, x, y, w, h, 0) });
  paHorn(ctx, 1000, 230, live, t);
  const slam = win(t, t2 + 0.6, t2 + 2.8) ? Math.abs(Math.sin((t - t2) * 8)) : 0;
  rosa(ctx, 1560, FLOOR, HS, { dir: -1, lamp: true, hands: t < t1 + 0.2 ? { near: [(1560 - 1450) / HS, (600 - FLOOR) / HS] } : win(t, t2 + 0.6, t2 + 2.8) ? { near: [(1560 - 1460) / HS, (600 + slam * 40 - FLOOR) / HS] } : { near: [60, -200], far: [50, -196] },
    talk: rTalk(t), brow: ovr ? 'worried' : 'flat', scared: ovr && !rTalk(t), sweat: ovr, lookUp: live, look: live ? 0.6 : 0, blink: blink(t, 1), t });
  const grip = t > tClick;
  hero(ctx, 1030, FLOOR, HS, { dir: 1, hands: grip ? { near: [70, -260], far: [60, -240] } : {}, look: 0.6, lookUp: live || t > roar + 0.6, brow: t > roar ? 'angry' : 'worried', scared: ovr && t < roar, sweat: ovr, blink: blink(t), t, prop: grip ? (q, hn, hf) => L.pan(q, hn, -0.6, 150) : null });
  ctx.restore();
  dark(ctx, 0.4, [{ x: 1220, y: 560, r: 800 }]); if (ovr) { ctx.fillStyle = `rgba(200,30,30,${0.1 + 0.08 * Math.sin(t * 4)})`; ctx.fillRect(0, 0, W, H); }
  day(ctx, t, s.t0 + 0.2, 30);
  if (live) pill(ctx, 1500, 200, 'THE BRIDGE', '#ffd23f', pop(t, t3), '#1e2026', 40);
  if (t > t5) pill(ctx, 960, 960, 'NOT THE CAPTAIN', '#ff5a4f', pop(t, t5 + 0.4), '#fff', 44);
  if (t > roar) pill(ctx, 960, 200, 'ENGINES: FULL AHEAD', '#ff5a4f', pop(t, roar), '#fff', 40);
} };

// ------------------------------------------------------------------ outro: dawn; the liner heads for an unknown horizon; the title
S.outro = { draw(ctx, t) {
  const s = sc('outro'), t6 = at('s13_6'), t7 = at('s13_7'), tWhere = at('s13_7', /where/), title = end('s13_7') + 0.6;
  ctx.save(); shot(ctx, t, [[s.t0, 1100, 560, 1.6], [s.t0 + 0.2, 960, 540, 1.0, 'm', 3], [tWhere, 960, 540, 1.0, 'cut'], [tWhere + 0.1, 1060, 520, 1.12, 'm', 6]]);
  C.outside(ctx, t, { sky: 'dawn' }); glow(ctx, 1700, 640, 500, 'rgba(255,200,140,0.5)'); circle(ctx, 1700, 650, 70, '#ffd08a');
  C.liner(ctx, 860 + (t - s.t0) * 22, 760, 0.8, t, {});
  ctx.fillStyle = '#ffd98a'; ctx.save(); ctx.translate(860 + (t - s.t0) * 22, 760 + Math.sin(t * 0.9) * 4); ctx.scale(0.8, 0.8); ctx.fillRect(300, -222, 70, 22); ctx.restore();   // the bridge windows, lit
  ctx.restore();
  pill(ctx, 960, 160, 'DAY 30', '#efe6cf', pop(t, t6) * (t < title ? 1 : 0), '#1e2026', 40);
  if (t > tWhere && t < title) pill(ctx, 1400, 420, 'WHERE IS HE TAKING YOU?', '#ff5a4f', pop(t, tWhere + 0.5), '#fff', 34);
  const u = clamp((t - title) / 0.6);
  if (u > 0) { ctx.fillStyle = `rgba(10,10,14,${0.82 * u})`; ctx.fillRect(0, 0, W, H); ctx.save(); ctx.globalAlpha = u; ctx.textAlign = 'center';
    ctx.fillStyle = '#e0a530'; ctx.font = '900 44px Nunito'; ctx.fillText('ZOMBIE OUTBREAK', W / 2, 410); ctx.fillStyle = '#fff'; ctx.font = '130px Anton'; ctx.fillText('30 DAYS TRAPPED', W / 2, 560); ctx.font = '80px Anton'; ctx.fillStyle = '#ff5a4f'; ctx.fillText('ON A CRUISE SHIP', W / 2, 660); ctx.restore(); }
  fade(ctx, clamp((t - s.t1 + 1.2) / 1.2));
} };

module.exports = S;
