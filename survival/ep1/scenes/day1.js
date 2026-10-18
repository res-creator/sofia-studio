// DAY 1 — news on TV, empty fridge, supermarket chaos, the rubber duck, Gary at the end of the aisle, run.
const C = require('../lib/core'), K = require('../lib/cast'), SE = require('../lib/sets'), A = require('../lib/act');
const { clamp, lerp, kf, ease, back, cam, shake, win, hash } = C, F = SE.FLOOR, R = K.R, P = K.P, S = K.D2;
// ---- props
function bowl(ctx, x, y) { R.paint(ctx, S, c => { c.moveTo(x - 46, y - 10); c.quadraticCurveTo(x, y + 50, x + 46, y - 10); c.closePath(); }, '#f2eee4'); ctx.fillStyle = '#e0a530'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(x - 28 + i * 14, y - 12 - (i % 2) * 4, 7, 0, 7); ctx.fill(); } }
function spoon(ctx, a, b) { R.line(ctx, [a, b], 7, S.ink); R.line(ctx, [a, b], 3.5, '#c9cfd6'); R.paint(ctx, S, c => c.ellipse(b[0], b[1], 11, 8, Math.atan2(b[1] - a[1], b[0] - a[0]), 0, 7), '#c9cfd6'); }
function brainCells(ctx, t, x, y, u) {   // two tiny brain cells bump fists
  const bump = Math.max(0, Math.sin(clamp(u) * Math.PI * 2)) * 30;
  for (const k of [-1, 1]) { const cx = x + k * (70 - bump), cy = y + Math.sin(t * 6 + k) * 6;
    R.paint(ctx, S, c => c.ellipse(cx, cy, 44, 34, 0, 0, 7), '#f59ab0'); ctx.strokeStyle = '#d06a86'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx - 20, cy - 10); ctx.quadraticCurveTo(cx, cy - 26, cx + 18, cy - 8); ctx.stroke();
    for (const ex of [-12, 12]) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx + ex, cy + 2, 8, 0, 7); ctx.fill(); ctx.fillStyle = S.ink; ctx.beginPath(); ctx.arc(cx + ex - k * 3, cy + 3, 4, 0, 7); ctx.fill(); }
    R.line(ctx, [[cx - k * 40, cy + 10], [cx - k * 62, cy - 10 + bump * 0.3]], 8, S.ink); }
  if (bump > 25) C.outlined(ctx, '!', x, y - 80, 70, '#ffd23f');
}
// a shopper hugging a giant pickle jar / TP stack (absurd background gags)
function pickle(ctx, x, y) { R.paint(ctx, S, c => c.roundRect(x - 60, y - 160, 120, 160, 20), '#bfe3a0'); ctx.fillStyle = '#5e9a3a'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(x - 30 + i * 20, y - 70 + (i % 2) * 30, 12, 40, 0.2, 0, 7); ctx.fill(); } R.paint(ctx, S, c => c.rect(x - 64, y - 176, 128, 24), '#d6413a'); }
const SHOPPER = { S: K.ZB.jogger.S, C: Object.assign({}, K.ZB.jogger.C, { skin: '#e8b48a', torn: 0, top: '#3f8fd0', top2: '#2f70a8', hair: '#5a3418' }) };
const LADY = { S: K.SARAH.S, C: Object.assign({}, K.SARAH.C, { skin: '#f0c8a0', top: '#d65a8a', top2: '#b04670', hair: '#c9a24a' }) };

function draw(ctx, t, TL) {
  const s = TL.s, e = TL.e, w = TL.w, B = TL.blocks.day1;
  if (t >= s('d1_card')) { C.dayCard(ctx, t, s('d1_card'), B.t1, 'DAY 1 — SURVIVED', 'BAD DECISIONS: 1'); return { noCaps: true }; }
  if (t < s('d1_08')) return home(ctx, t, TL);
  return market(ctx, t, TL);
}
// ------------------------------------------------------------------ home
function home(ctx, t, TL) {
  const s = TL.s, e = TL.e, w = TL.w, t0 = TL.blocks.day1.t0;
  // TV full screen (news footage of the supermarket) on "So naturally..."
  if (t >= s('d1_03') - 0.1 && t < s('d1_04') - 0.1) {
    ctx.save(); C.cam(ctx, t, [[s('d1_03') - 0.1, 1200, 560, 1.1], [w('d1_03', 'shopping'), 1300, 560, 1.4, 's']]); SE.market(ctx, t); SE.crowd(ctx, t, 300, 2400, 12, 5, 0.8);
    pickle(ctx, 1500 + Math.sin(t * 3) * 30, F - 140); ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,0.05)'; for (let i = 0; i < C.H; i += 5) ctx.fillRect(0, i, C.W, 2);
    ctx.fillStyle = '#d6413a'; ctx.fillRect(0, C.H - 150, C.W, 70); C.outlined(ctx, 'LIVE · PANIC BUYING DOWNTOWN', 40, C.H - 115, 50, '#fff', { align: 'left', lw: 0, shadow: false });
    ctx.fillStyle = '#ffd23f'; ctx.fillRect(0, C.H - 80, C.W, 80); C.outlined(ctx, 'OFFICIALS: "PLEASE STAY HOME"', 40, C.H - 40, 44, '#111', { align: 'left', lw: 0, shadow: false });
    C.outlined(ctx, '● LIVE', 140, 70, 52, '#ff3b30', { lw: 8 });
    return { vig: 0.6 };
  }
  // fridge POV
  if (t >= s('d1_06') - 0.05 && t < s('d1_grab')) {
    ctx.save(); const lt = t - s('d1_06'); ctx.translate(C.W / 2, C.H / 2); ctx.scale(1 + lt * 0.01, 1 + lt * 0.01); ctx.translate(-C.W / 2, -C.H / 2); ctx.translate(C.W / 2, C.H / 2); ctx.scale(1.5, 1.5); ctx.translate(-C.W / 2 - 120, -C.H / 2 + 40); SE.fridgeInside(ctx, t); ctx.restore(); ctx.save();
    // hero peering in from the right, lit by the fridge light
    const turn = clamp((t - s('d1_07') + 0.2) / 0.4), ex = t < s('d1_07') ? { eyes: 'open', brow: 'up', mouth: 'flat', look: [-0.9, 0.2] } : C.talk(TL, 'd1_07', t, { eyes: 'half', brow: 'flat', mouth: 'flat', look: [lerp(-0.9, 0.9, turn), 0] });
    ctx.save(); ctx.translate(1640, 640); ctx.scale(3.4, 3.4); A.headCU(ctx, K.HERO, [0, 0], lerp(0.1, -0.05, turn), C.blink(ex, t, 0.2), { t }); ctx.restore(); ctx.restore();
    if (t > w('d1_06', 'eleven')) C.stamp(ctx, t, w('d1_06', 'eleven'), 'FOOD SUPPLY: 11 MIN', 560, 200, { col: '#d6413a', size: 66 });
    return { vig: 0.55 };
  }
  const tg = s('d1_grab');
  const keys = [[t0, 2400, 520, 0.85], [s('d1_02'), 2080, 520, 1.9, 'm', 2.6], [s('d1_04') - 0.1, 2560, 470, 2.6], [s('d1_05'), 2560, 455, 3.1, 'm', 4.5], [s('d1_fridge'), 1500, 560, 1.15, 'w'], [tg, 1100, 560, 1.0, 's']];
  ctx.save(); cam(ctx, t, keys);
  SE.apartment(ctx, t, { tv: (c, tt, x, y, w2, h) => SE.tvNews(c, tt, x, y, w2, h, { title: t > s('d1_02') ? 'STAY INDOORS' : 'BREAKING NEWS', crawl: 'STAY INDOORS  •  DO NOT GO SHOPPING  •  ' }), fridgeOpen: t > s('d1_fridge') + 0.5 && t < tg });
  // backpack on the coat hook until grabbed
  const grabbed = t > tg + 0.45;
  if (!grabbed) A.packFloor(ctx, 775, 470, { s: 0.8 });
  if (t < s('d1_fridge')) {   // on the sofa with cereal
    const sx = 2640, pose = { x: sx, ground: F, hop: 56, footN: [sx - 120, F - 12], footF: [sx - 90, F - 12], lean: -0.05, tilt: 0 };
    const J0 = R.solve(K.HERO.S, pose), chew = t > s('d1_04') - 0.3;
    const bw = [J0.shN[0] - 90, J0.shN[1] + 120], sp = Math.max(0, Math.sin((t - t0) * 2.4)) ;
    const nearT = [bw[0] + 10 - sp * 30, bw[1] - 30 - sp * 110];
    const ex = t < s('d1_04') ? { eyes: 'open', brow: 'neutral', mouth: Math.sin(t * 9) > 0 ? 'closed' : 'small', open: 0.2, look: [-0.8, -0.1] }
      : t < s('d1_05') ? C.talk(TL, 'd1_04', t, { eyes: 'half', brow: 'flat', mouth: 'flat', look: [-0.7, 0] })
      : { eyes: lerp(0, 1, ease((t - s('d1_05')) / 2)) > 0.5 ? 'squint' : 'half', brow: 'flat', mouth: Math.sin(t * 8) > 0 ? 'closed' : 'flat', look: [0.6, 0] };
    const nod = t > s('d1_05') ? Math.sin((t - s('d1_05')) * 3) * 0.06 : 0;
    pose.tilt = nod;
    A.hero(ctx, { pose, grips: { far: [bw[0] + 40, bw[1] + 6], near: nearT }, e: C.blink(ex, t, 1.1), t, hold: (c) => bowl(c, bw[0], bw[1]), front: (c, J) => spoon(c, J.wN, [J.wN[0] - 30, J.wN[1] - 30]) });
    SE.aptNight; // day scene
    ctx.restore();
    if (t > s('d1_05') + 0.4 && t < s('d1_fridge')) { ctx.save(); ctx.translate(560, 300); ctx.scale(1.7, 1.7); brainCells(ctx, t, 0, 0, (t - w('d1_05', 'together')) / 0.7); ctx.restore(); }
    A.tag(ctx, t, t0 + 0.1, s('d1_02'), 'DAY 1');
    return {};
  }
  // walk to the fridge, then grab the backpack and run out of the door
  const path = [[s('d1_fridge'), 1600], [s('d1_fridge') + 0.8, 1180], [tg, 1180], [tg + 0.4, 900], [tg + 1.2, 380]];
  const wp = A.walkPath(t, path, t > tg ? 150 : 100);
  const run = t > tg;
  const pose = { x: wp.x, ground: F, walk: wp.walk, lean: run ? 0.32 : 0.05, crouch: run ? 0.15 : 0 };
  const J0 = R.solve(K.HERO.S, pose);
  const reachPack = t > tg && t < tg + 0.45 && wp.x < 1000 ? [775 + 20, 420] : null;
  A.hero(ctx, { pose, grips: { near: reachPack || (t > s('d1_fridge') + 0.5 && t < tg ? [1080, 560] : null) }, e: run ? { eyes: 'wide', brow: 'angry', mouth: 'grin', look: [-1, 0] } : { eyes: 'half', brow: 'flat', mouth: 'flat' }, pack: grabbed, t });
  ctx.restore();
  return {};
}
// ------------------------------------------------------------------ supermarket
function market(ctx, t, TL) {
  const s = TL.s, e = TL.e, w = TL.w;
  const t8 = s('d1_08'), t9 = s('d1_09'), t10 = s('d1_10'), fr = s('d1_freeze'), turn = s('d1_turn'), runT = s('d1_run');
  // freeze frame for the stamp: time stands still inside the picture
  const tt = t >= fr && t < s('d1_13') ? fr : t;
  // hero pushes the cart left along the aisle while items go in on the words
  const path = [[t8, 3000], [t8 + 3.2, 2500], [t9, 2500], [e('d1_09'), 1500], [t10, 1500]];
  const wp = A.walkPath(tt, path, 100);
  const hx = wp.x, cartX = hx - 330;
  const grabs = [['water', w('d1_09', 'Water')], ['can', w('d1_09', 'Canned')], ['battery', w('d1_09', 'Batteries')], ['bat', w('d1_09', 'defend')]];
  const items = []; let nearT = null, carry = null;
  const J0 = R.solve(K.HERO.S, { x: hx, ground: F, walk: wp.walk, lean: 0.12 });
  grabs.forEach(([k, g], i) => { const u = (tt - g + 0.25) / 0.7; if (u >= 1) items.push(k); else if (u > 0) { const shelfP = [J0.shN[0] - 60, J0.shN[1] - 40], drop = [cartX + 170 - i * 25, F - 290];
    const p = u < 0.4 ? C.A([cartX + 196, F - 258], shelfP, ease(u / 0.4)) : C.A(shelfP, drop, ease((u - 0.4) / 0.6)); nearT = p; if (u > 0.35) carry = [k, p]; } });
  const duckIn = tt > s('d1_11') - 0.6 && tt < s('d1_13'), packDuck = tt > TL.s('d1_turn') - 1.0, pushing = tt < s('d1_13');
  const handle = [cartX + 196, F - 258];
  // camera
  const duckP = [cartX - 10, F - 300];
  const keys = [[t8, 3000, 480, 0.8], [t8 + 0.01, 2900, 520, 1.0, 'm', 3], [t9, 2350, 520, 1.15], [t9 + 0.6, 1950, 520, 1.15, 'm', e('d1_09') - t9 - 0.6], [t10, 1560, 430, 1.9, 's'],
    [s('d1_11'), duckP[0], duckP[1], 2.0, 'w'], [s('d1_12'), duckP[0], duckP[1] - 10, 2.6, 'm', 1.6], [s('d1_13'), hx - 60, 400, 2.3, 's'], [s('d1_14'), hx - 120, 470, 1.5, 'm', 1.2],
    [turn, 300, 470, 1.25, 'w'], [turn + 0.3, 330, 450, 1.55, 'm', 2.2], [s('d1_15'), hx - 50, 420, 2.4, 's'], [s('d1_16'), 330, 440, 1.7, 's'], [s('d1_17'), 360, 470, 1.4, 'm', 1.0],
    [s('d1_stare'), hx - 50, 420, 2.7, 's'], [s('d1_18'), hx - 40, 430, 2.4], [runT, 0, 520, 1.1, 'cut']];
  ctx.save(); const cm = cam(ctx, t, keys, { drift: tt === fr && t >= fr ? 0 : 0.01 });
  if (t >= runT) return marketRun(ctx, t, TL);
  SE.market(ctx, tt);
  // sugar sign + Gary at the far end of the aisle
  SE.rr(ctx, 160, 250, 300, 60, 8, '#f2eee2'); ctx.save(); ctx.fillStyle = '#d6413a'; ctx.font = '40px Anton'; ctx.textAlign = 'center'; ctx.fillText('SUGAR', 310, 295); ctx.restore();
  // background chaos (silhouettes) until the music cut
  if (tt < turn) { SE.crowd(ctx, tt, -400, 3800, 10, 1, 0.5); }
  // absurd gags: TP tower runner, pickle-jar lady
  if (tt < turn) { const gx = 3600 - ((tt - t8) * 380) % 3400; const ph = tt * 10;
    K.person(ctx, SHOPPER, { pose: { x: gx, ground: F, walk: { w: 1, u: (3600 - gx) / 150, stride: 150 }, lean: 0.2 }, grips: { near: null }, e: { eyes: 'wide', brow: 'worried', mouth: 'wide', open: 0.6 }, t: tt,
      front: (c, J) => { for (let i = 0; i < 5; i++) SE.ITEMS.tp(c, J.head[0] + 10, J.head[1] - 90 - i * 52, 0.9); } }, 'shopper');
    const lx = 600 + Math.sin(tt * 0.8) * 120; K.person(ctx, LADY, { pose: { x: lx, ground: F, lean: -0.08 }, grips: { near: [lx - 80, F - 240], far: [lx - 40, F - 260] }, e: { eyes: 'happy', mouth: 'biggrin' }, t: tt, hold: c => pickle(c, lx - 80, F - 160) }, 'lady'); }
  // Gary (appears for the turn)
  if (tt >= turn - 0.05) {
    const gt = tt - turn, wave = tt > s('d1_16') - 0.2 && tt < s('d1_17');
    const J0g = R.solve(K.GARY.S, { x: 330, ground: F, lean: 0.06 }), m = P.mug([J0g.head[0] - 150, J0g.head[1] + 70], 1.25);
    const far = wave ? [J0g.head[0] + 110 + Math.sin(tt * 13) * 20, J0g.head[1] - 60] : null;
    // somebody collapses behind him on "sugar aisle"
    const fallT = w('d1_17', 'aisle'); if (tt > fallT - 1.5) { const u = clamp((tt - fallT) / 0.5); ctx.save(); ctx.translate(60, F); ctx.rotate(-ease(u) * 1.45); ctx.translate(-60, -F);
      K.person(ctx, SHOPPER, { pose: { x: 60, ground: F, lean: -0.1 * u, tilt: 0.3 * u }, e: { eyes: u > 0.6 ? 'closed' : 'half', mouth: 'o' }, t: tt }, 'faller'); ctx.restore(); }
    A.gary(ctx, { pose: { x: 330, ground: F, lean: 0.06, tilt: Math.sin(tt * 1.3) * 0.04 }, flip: true, grips: { near: m.grip, far }, farHand: wave ? 'wave' : 'fist', farFront: !wave, holdNear: c => A.mug(c, m, true),
      e: C.blink(C.talk(TL, ['d1_16', 'd1_17'], tt, { eyes: 'open', brow: 'up', mouth: 'biggrin', look: [0.8, 0], blood: 1 }), tt, 0.4), t: tt });
  }
  // cart + items
  const itemDraw = { water: (c, x, y) => SE.ITEMS.water(c, x, y + 50, 0.9), can: (c, x, y) => SE.ITEMS.can(c, x, y + 40), battery: (c, x, y) => SE.ITEMS.battery(c, x, y + 40, 0.8), bat: (c, x, y) => P.drawBat(c, S, P.bat([x - 40, y + 40], -1.2, 240)) };
  SE.cartDraw(ctx, cartX, F, items.map(k => itemDraw[k]).concat(duckIn ? [(c, x, y) => K.duck(c, x, y - 10 - 30 * (1 - back(clamp((tt - s('d1_11') + 0.6) / 0.4))), 0.8)] : []));
  // the hero
  let ex, grips = { near: nearT || handle, far: handle };
  if (tt < t10) ex = { eyes: 'open', brow: tt < t9 ? 'worried' : 'neutral', mouth: tt < t9 ? 'frown' : 'flat', look: nearT ? [-0.6, -0.6] : [-0.9, 0], sweat: tt < t9 };
  else if (tt < s('d1_11')) { ex = { eyes: 'happy', brow: 'up', mouth: 'biggrin' }; grips = { near: [J0.hip[0] - 40, J0.hip[1] - 30], far: handle }; }
  else if (tt < s('d1_13')) ex = { eyes: 'half', brow: 'skeptic', mouth: 'smirk', look: [0.8, 0] };
  else if (tt < turn) ex = C.talk(TL, 'd1_13', tt, { eyes: 'open', brow: 'worried', mouth: 'smile', look: [-0.9, 0.3] });
  else if (tt < s('d1_stare')) ex = C.talk(TL, 'd1_15', tt, { eyes: 'open', brow: 'up', mouth: 'flat', look: [-1, 0] });
  else ex = C.talk(TL, 'd1_18', tt, { eyes: 'tiny', brow: 'worried', mouth: 'flat', look: [-1, 0], sweat: 1 });
  // holding the duck up next to the face ("He looked lonely")
  let holdDuck = null;
  if (tt >= s('d1_13') && tt < turn - 1.0) { const J1 = R.solve(K.HERO.S, { x: hx, ground: F, lean: 0.05 }); const dp = [J1.head[0] - 150, J1.head[1] + 70 - Math.sin(tt * 4) * 6]; grips = { near: [dp[0] + 30, dp[1] + 40], far: handle };
    holdDuck = c => K.duck(c, dp[0], dp[1], 0.9, Math.sin(tt * 3) * 0.1); }
  const bendNear = tt >= t10 && tt < s('d1_11') ? 1 : undefined;
  A.hero(ctx, { pose: { x: hx, ground: F, walk: wp.walk, lean: tt < t10 ? 0.12 : 0.04, bendNear }, grips, e: C.blink(ex, tt, 0.3), t: tt, pack: true, packDuck, holdNear: holdDuck, front: carry ? (c) => itemDraw[carry[0]](c, carry[1][0] + 20, carry[1][1] - 40) : null });
  C.grade(ctx, 'store');
  ctx.restore();
  if (t >= fr && t < s('d1_13')) { C.flash(ctx, 1 - (t - fr) / 0.12); ctx.save(); ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = 'rgba(128,128,128,0.6)'; ctx.fillRect(0, 0, C.W, C.H); ctx.restore(); C.stamp(ctx, t, fr + 0.1, 'ESSENTIAL ITEM', C.W / 2, 330, { col: '#3fae63', size: 90, rot: -0.06, check: true }); }
  if (tt >= turn && tt < turn + 0.25) C.speedLines(ctx, t, 0.5);
  return { noCaps: t >= fr && t < s('d1_13') };
}
// smash cut: hero sprints out through the exit, duck sticking out of the side pocket
function marketRun(ctx, t, TL) {
  const s = TL.s, t0 = s('d1_run'), x = lerp(1400, -500, (t - t0) / 1.6);
  SE.market(ctx, t);
  SE.rr(ctx, -700, 160, 400, F - 160, 10, '#9fd6ff'); C.outlined(ctx, 'EXIT', -500, 120, 70, '#3fae63');
  SE.cartDraw(ctx, 1700, F, [], { tilt: -0.3 });
  A.hero(ctx, { pose: { x, ground: F, walk: { w: 1, u: (1400 - x) / 210, stride: 210 }, lean: 0.42, crouch: 0.2, hop: -Math.abs(Math.sin((1400 - x) / 210 * Math.PI * 2)) * 22 }, e: { eyes: 'wide', brow: 'worried', mouth: 'wide', open: 0.7, look: [-1, 0], sweat: 1 }, pack: true, packDuck: true, t });
  C.speedLines(ctx, t, 0.0);
  C.grade(ctx, 'store'); ctx.restore();
  return {};
}
const capTop = (t, TL) => (t > TL.s('d1_08') && t < TL.s('d1_card')) || (t > TL.s('d1_03') - 0.1 && t < TL.s('d1_04') - 0.1);
const cues = TL => { const s = TL.s, w = TL.w; return [
  ['sfx/tvnews', s('d1_01') - 0.2, 0.35], ['sfx/crowd', s('d1_03') - 0.1, 0.55], ['../ep01/sfx/whoosh', s('d1_03') - 0.15, 0.4], ['sfx/ding', w('d1_05', 'together'), 0.4],
  ['sfx/fridge', s('d1_fridge') + 0.4, 0.6], ['sfx/stamp', w('d1_06', 'eleven'), 0.6], ['../ep01/sfx/whoosh', s('d1_grab'), 0.5], ['sfx/zip', s('d1_grab') + 0.4, 0.5], ['sfx/slamdoor', s('d1_grab') + 1.3, 0.6],
  ['sfx/crowd', s('d1_08') - 0.3, 0.45], ['../sfx/cart', s('d1_08'), 0.4], ['sfx/crowd', s('d1_08') + 7.5, 0.35],
  ['../ep01/sfx/pop', w('d1_09', 'Water') + 0.45, 0.6], ['../ep01/sfx/pop', w('d1_09', 'Canned') + 0.45, 0.6], ['../ep01/sfx/pop', w('d1_09', 'Batteries') + 0.45, 0.6], ['../ep01/sfx/pop', w('d1_09', 'defend') + 0.45, 0.6],
  ['../ep01/sfx/squeak', s('d1_11') - 0.3, 0.7], ['sfx/stamp', s('d1_freeze') + 0.1, 0.7], ['sfx/ding', s('d1_freeze') + 0.15, 0.4], ['../ep01/sfx/squeak', s('d1_14') + 0.6, 0.5],
  ['../ep01/sfx/whoosh', s('d1_turn'), 0.5], ['sfx/sting', s('d1_turn') + 0.1, 0.45], ['sfx/thud', TL.w('d1_17', 'aisle') + 0.45, 0.7], ['../ep01/sfx/run', s('d1_run'), 0.7], ['sfx/crash', s('d1_run') + 0.1, 0.4], ['sfx/slamdoor', s('d1_card'), 0.55]]; };
const music = TL => [['../ep01/sfx/music', TL.s('d1_01'), TL.s('d1_turn'), 0.22], ['sfx/music4', TL.s('d1_run') - 0.1, TL.s('d1_card'), 0.3]];
module.exports = { draw, capTop, cues, music };
