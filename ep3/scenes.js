// Episode 3 — "Gus at the Airport". Inside a scene every shot change is a HARD CUT; scene-to-scene transitions live in render.js.
// Eye-lines: Sofia (front view) turns head + eyes toward the partner; Gus (profile) faces the partner; crew turn + look at the partner.
const { TL, mk, talk, life, mouthFor, clamp, lerp, ease, seg, noise1 } = require('./engine');
const { drawSofia } = require('../lib/sofia');
const { drawGus } = require('../lib/gus');
const { drawCrew } = require('../lib/crew');
const P = require('../lib/props');
const { OL, paint, line, curve, roundRect, hash } = require('../lib/draw');
const U = require('../lib/ui');
const F = require('../lib/fonts');
const BG = require('../lib/bg');
const B3 = require('./bg3');
const PR = require('./props3');
const U3 = require('./ui3');

const cache = {};
const img = n => (cache[n] = cache[n] || (n === 'hallway' ? BG.hallway(true) : B3[n]()));
function drawBg(ctx, n) { if (n === 'hallway') ctx.drawImage(img(n), BG.X0, 0, BG.WW, 1920); else ctx.drawImage(img(n), 0, 0, B3.WW, B3.HH); }
const L = id => TL.lines.find(l => l.id === id);
const wordT = (id, i, k = 't0') => { const w = L(id).words; return (w[Math.min(i, w.length - 1)] || { t0: L(id).t0 })[k]; };

// ---- shot list camera: [{t, c:[cx,cy,z], to?, d?, delay?, ease?, shake?, rot?}] — each entry starts with a hard cut
function shotCam(shots, t) {
  let s = shots[0];
  for (const x of shots) if (t >= x.t) s = x;
  const a = s.c, b = s.to || s.c, nxt = shots[shots.indexOf(s) + 1];
  const dur = s.d || ((nxt || { t: s.t + 3 }).t - s.t);
  const u = (ease[s.ease || 'inOut'])(clamp((t - s.t - (s.delay || 0)) / dur));
  return { c: [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u), s.rot || 0], shake: typeof s.shake === 'function' ? s.shake(t) : (s.shake || 0) };
}
function applyCam(ctx, cam, t) {
  const [cx, cy, z, r] = cam.c, sh = cam.shake;
  const sx = sh ? noise1(t * 25) * sh : 0, sy = sh ? noise1(t * 25 + 50) * sh : 0;
  ctx.translate(960 + sx, 540 + sy); ctx.scale(z * 0.72, z * 0.72); if (r) ctx.rotate(r); ctx.translate(-cx, -cy);
}

// ---- character wrappers (lip-sync from the real voice envelope, blink, breathing) ----
function sofia(ctx, x, hipY, s, pose, t, seed = 1) {
  const lf = life(t, seed), lvl = talk('sofia', t), p = Object.assign({}, pose);
  p.blink = Math.max(p.blink || 0, lf.blink); p.bob = (p.bob || 0) + lf.bob;
  p.mouth = pose.mouthLock ? pose.mouth : mouthFor(lvl, pose.mouth || {}, t);
  if (lvl > 0.05) p.tilt = (p.tilt || 0) + noise1(t * 1.7) * 0.05;
  drawSofia(ctx, x, hipY, s, p);
}
const standHip = (floorY, s) => floorY - 262 * s;
function gus(ctx, x, footY, s, p, t, who = 'gus') {
  const lvl = talk(who, t);
  drawGus(ctx, x, footY, s, Object.assign({}, p, { honk: Math.max(p.honk || 0, lvl * 0.75) }));
}
const garyRig = (ctx, x, footY, s, p, t) => gus(ctx, x, footY, s, Object.assign({ tie: false, lids: 0.7, hold: PR.gary }, p), t, 'gary');
// crew: hip = floor − 280·s. talkKey = which voice drives the mouth. NOTE: legs:'walk' splays like Dr. Max — use stand + hop instead.
function crew(ctx, x, floorY, s, pose, t, who, talkKey, seed = 7) {
  const lf = life(t, seed), lvl = talk(talkKey || who, t), p = Object.assign({}, pose);
  p.blink = Math.max(p.blink || 0, lf.blink); p.bob = (p.bob || 0) + lf.bob;
  const m = Object.assign({ open: 0, smile: 0.4, w: 1 }, pose.mouth || {});
  if (lvl > 0.02) { m.open = Math.max(m.open, clamp(lvl * 0.62)); m.w = (m.w || 1) * (1 - 0.12 * Math.max(0, noise1(t * 9))); }
  p.mouth = m;
  if (lvl > 0.05) p.tilt = (p.tilt || 0) + noise1(t * 1.5 + 3) * 0.04;
  drawCrew(ctx, x, floorY - 280 * s - (pose.hop || 0), s, p, who);
}
// natural arm target: side -1/+1, deg from hanging-down (0) via horizontal (90) to straight up (180), ext 0.75..0.95 of full arm length.
// Near-straight arms avoid the 'chicken wing' (elbow up, hand down) that short IK reaches give. rig 'c' = crew (longer arms).
const A = (side, deg, ext = 0.9, rig = 's') => { const sh = rig === 'c' ? [95, -250] : [90, -236], len = rig === 'c' ? 243 : 230, a = deg * Math.PI / 180; return [side * sh[0] + side * Math.sin(a) * len * ext, sh[1] + Math.cos(a) * len * ext]; };
const sunset = (ctx, a) => { ctx.fillStyle = `rgba(10,8,20,${a})`; ctx.fillRect(0, 0, 1920, 1080); };

// ==================================================================== 1. HOME — hallway, the suitcase that moves
const home = (() => {
  const { m, k } = mk('home');
  const FL = 1520, CX = 1120, CS = 1.3, burst0 = () => m('burst');
  const NB = 20, bur = i => ({ vx: (hash(i * 7) - 0.5) * 900 - 120, vy: -(520 + hash(i * 3) * 520), land: FL - 20 + hash(i * 5) * 50, rot: hash(i) * 6, d: i * 0.035 });
  const burgerPos = (i, u) => {
    const b = bur(i); u -= b.d; if (u < 0) return null; const g = 1900, y0 = FL - 230 * CS;
    const tl = (-b.vy + Math.sqrt(b.vy * b.vy + 2 * g * (b.land - y0))) / g, uu = Math.min(u, tl);
    return { x: CX + b.vx * uu, y: y0 + b.vy * uu + 0.5 * g * uu * uu, rot: b.rot + uu * 5 };
  };
  return {
    sfx: [['burst', 0, 'boing'], ['burst', 0.12, 'thud'], ['l03', 0.1, 'shudder'], ['l08', 0.9, 'whoosh']],
    sfxAt: () => [0, 6, 12, 18].map(i => ({ t: burst0() + 0.15 + i * 0.035, name: 'pop', g: 0.6 })),
    draw(ctx, t) {
      const u = t - burst0(), burst = u >= 0;
      const l08w = wordT('l08', 3);
      const shots = [
        { t: 0, c: [640, 1130, 1.0], to: [660, 1130, 1.04] },
        { t: m('l01'), c: [760, 1150, 1.45], to: [790, 1150, 1.5] },
        { t: m('l02'), c: [1060, 1020, 2.2], to: [1070, 1010, 2.35] },
        { t: m('l03'), c: [780, 1180, 1.7], to: [840, 1180, 1.5], d: 2 },
        { t: m('l03') + 2.4, c: [1120, 1330, 2.3], to: [1120, 1330, 2.6], shake: tt => tt > burst0() - 0.3 && tt < burst0() + 0.25 ? 9 : 0 },
        { t: burst0() + 0.3, c: [800, 1180, 1.25] },
        { t: m('l04'), c: [620, 1100, 2.0], to: [650, 1090, 2.15] },
        { t: m('l05'), c: [1000, 1020, 2.3], to: [1010, 1020, 2.4] },
        { t: m('l06'), c: [600, 1090, 2.0], to: [620, 1090, 2.1] },
        { t: m('l07'), c: [1000, 1020, 2.3] },
        { t: m('l08'), c: [760, 1150, 1.3], to: [740, 1140, 1.1] },
      ];
      const cam = shotCam(shots, t);
      ctx.save(); applyCam(ctx, cam, t);
      drawBg(ctx, 'hallway');
      // suitcase wobbles more and more until it bursts
      const wob = t < burst0() ? clamp((t - m('l03') + 0.2) / 3) : 0;
      const wx = Math.sin(t * 38) * 6 * wob, wr = Math.sin(t * 31) * 0.035 * wob;
      const lid = burst ? ease.out(clamp(u / 0.25)) : 0;
      PR.suitcase(ctx, CX + wx, FL, CS, { open: burst ? 1 : 0, rot: wr });
      if (burst) PR.suitcaseLid(ctx, CX, FL, CS, lid);
      // burgers
      if (burst) for (let i = 0; i < NB; i++) { const p = burgerPos(i, u); if (p) PR.burger(ctx, p.x, p.y, 0.8, p.rot); }
      // Gus sits on the case, then is thrown off
      const l04on = t >= m('l04'), off = burst;
      const air = burst ? clamp(u / 0.9) : 0, hop = burst ? Math.sin(Math.min(1, air) * Math.PI) * 180 : 0;
      const gx = off ? lerp(CX, 880, ease.out(air)) : CX - 10, gy = off ? lerp(FL - 230 * CS, FL, ease.in(air)) - hop : FL - 230 * CS + 4;
      const proud = t >= m('l02') && t < m('l03'), calm = t >= m('l05');
      gus(ctx, gx, gy, 0.86, {
        face: -1, tie: true, lids: u > 0 && u < 0.7 ? 0.05 : proud ? 0.2 : calm ? 0.55 : 0.4,
        neck: proud ? -0.3 : l04on ? 0.1 : 0, look: 0.6, wing: u > 0 && u < 0.8 ? 0.8 : proud ? 0.5 : calm ? 0.2 : 0.1,
        squash: !off && wob > 0.05 ? 1 + Math.sin(t * 35) * 0.012 * wob : 1,
      }, t);
      // Sofia: a small travel bag, stands left of the door and turns to Gus
      const shock = l04on ? clamp(1 - Math.max(0, t - m('l04') - 1.0) / 0.8) : 0, firm = t >= m('l06') && t < m('l07'), taxi = t >= l08w;
      const sx = 430;
      sofia(ctx, sx, standHip(FL, 0.74), 0.74, {
        legs: 'stand', turn: taxi ? 0 : 0.38, look: taxi ? [0, -0.2] : [0.8, -0.2],
        brow: { l: 0.25, r: 0.25, worry: t > m('l03') && !burst ? 0.8 : 0, angry: firm ? 0.5 : 0 }, wide: shock * 0.9,
        mouth: { smile: t < m('l03') ? 0.7 : firm ? -0.1 : 0 }, sleepy: t >= m('l08') && t < l08w ? 0.5 : 0,
        armL: firm ? A(-1, 65, 0.9) : taxi ? A(-1, 150 + Math.sin(t * 10) * 12, 0.92) : shock > 0.3 ? A(-1, 95, 0.85) : null, handL: shock > 0.3 || firm || taxi ? 'open' : 'mitten',
        armR: firm ? A(1, 55, 0.9) : shock > 0.3 ? A(1, 95, 0.85) : null, handR: firm || shock > 0.3 ? 'open' : 'mitten', armsFront: firm || shock > 0.3 || taxi,
      }, t);
      ctx.restore();
      if (burst && u < 1.6) P.burst(ctx, 1420, 280, 'POP!', clamp(u / 1.0), '#FFD23F', 0.08, 0.9);
      if (taxi) P.burst(ctx, 500, 300, 'TAXI!', clamp((t - l08w) / 1.2), '#FFD23F', -0.08, 0.9);
    },
  };
})();

// ==================================================================== TITLE SLAM
const title = (() => {
  const { m } = mk('title');
  return {
    sfx: [['slam', 0.05, 'slam'], ['slam', 0.5, 'whoosh']],
    draw(ctx, t) {
      const u = t - m('slam');
      ctx.fillStyle = '#1F5FC8'; ctx.fillRect(0, 0, 1920, 1080);
      ctx.save(); ctx.translate(960, 560); ctx.rotate(t * 0.25);
      for (let i = 0; i < 16; i++) { ctx.rotate(Math.PI / 8); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(1400, -170); ctx.lineTo(1400, 170); ctx.closePath(); ctx.fillStyle = i % 2 ? '#2E6FD8' : '#2765CC'; ctx.fill(); }
      ctx.restore();
      // plane crossing behind the title
      const pk = clamp((u - 0.2) / 1.8); ctx.save(); ctx.translate(lerp(-300, 2200, ease.out(pk)), 240 - pk * 120); ctx.rotate(-0.12); B3.plane(ctx, 0, 0, 0.9); ctx.restore();
      // Gus with a suitcase of burgers
      const gk = ease.back(clamp((u - 0.15) / 0.35));
      ctx.save(); ctx.translate(1480, 980 + (1 - gk) * 700); PR.suitcase(ctx, 300, 0, 0.6, { open: 1 }); PR.burger(ctx, 290, -160, 0.9, 0.2); PR.burger(ctx, 340, -190, 0.8, -0.3);
      drawGus(ctx, 0, 0, 1.0, { face: -1, lids: 0.3, honk: 0.2, wing: 0.3 + 0.2 * Math.sin(t * 8), neck: -0.2 }); ctx.restore();
      const sk = clamp(u / 0.28), sc = lerp(2.6, 1, ease.out(sk)), shake = u < 0.45 ? (1 - u / 0.45) * 14 : 0;
      ctx.save(); ctx.translate(780 + noise1(t * 30) * shake, 500 + noise1(t * 30 + 9) * shake); ctx.rotate(-0.05); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sk * 3);
      U.textOutlined(ctx, 'GUS', 0, -40, 190, '#FFFFFF', { olw: 30 });
      U.textOutlined(ctx, 'AT THE AIRPORT', 0, 120, 112, U.ORANGE, { olw: 22 });
      ctx.restore();
      U.logo(ctx, clamp((u - 0.5) / 0.3));
    },
  };
})();


// ==================================================================== 2. CHECK-IN
const checkin = (() => {
  const { m } = mk('checkin');
  const SCALE = { x: 1240, y: 1452 };
  const kgAt = t => { const e = m('eat'); if (t < m('weigh')) return null; if (t < e) return 32; const i = Math.floor((t - e) / 1.0); return Math.max(23, 32 - 3 * Math.min(3, (t - e - 0.8) >= 0 ? Math.floor((t - e - 0.8) / 1.0) + 1 : 0)); };
  const eatT = i => m('eat') + i * 1.0;
  return {
    sfx: [['weigh', 0.05, 'thud'], ['weigh', 0.3, 'beep'], ['egg', 0, 'record'], ['l19', 0.1, 'correct'], ['l21', 1.0, 'tick']],
    sfxAt: () => [0, 1, 2].flatMap(i => [{ t: eatT(i) + 0.45, name: 'chomp' }, { t: eatT(i) + 0.85, name: 'tick' }]),
    draw(ctx, t) {
      const inTL = id => t >= m(id);
      if (t >= m('egg') && t < m('l13')) { PR.passportInsert(ctx, t, (t - m('egg')) / (m('l13') - m('egg'))); return; }
      const kg = kgAt(t);
      const shots = [
        { t: 0, c: [1150, 1150, 1.42], to: [1165, 1150, 1.48] },
        { t: m('l09') + 1.5, c: [1640, 1050, 2.3], to: [1640, 1045, 2.45] },
        { t: m('e1'), c: [1150, 1150, 1.45], to: [1160, 1150, 1.5] },
        { t: m('l10'), c: [1100, 1150, 1.6], to: [1120, 1150, 1.7] },
        { t: m('l11'), c: [1640, 1050, 2.3] },
        { t: m('l12'), c: [1080, 1110, 2.4], to: [1085, 1100, 2.5] },
        { t: m('l13'), c: [1640, 1050, 2.3], to: [1640, 1045, 2.45] },
        { t: m('l14'), c: [1080, 1100, 2.4], to: [1085, 1090, 2.6] },
        { t: m('l15'), c: [1640, 1050, 2.2] },
        { t: m('weigh'), c: [1250, 1220, 1.7] },
        { t: m('weigh') + 0.9, c: [1350, 1180, 2.7] },
        { t: m('l16'), c: [1640, 1050, 2.3] },
        { t: m('e2'), c: [1150, 1150, 1.45], to: [1160, 1150, 1.5] },
        { t: m('l17'), c: [700, 1100, 2.0], to: [720, 1100, 2.15] },
        { t: m('l18'), c: [1080, 1100, 2.4], to: [1085, 1090, 2.6] },
        { t: m('eat'), c: [1120, 1150, 1.9], to: [1180, 1150, 2.0], d: 3 },
        { t: m('l19'), c: [1640, 1050, 2.3] },
        { t: m('l20'), c: [1080, 1100, 2.4] },
        { t: m('l21'), c: [1640, 1050, 2.3], to: [1640, 1045, 2.45] },
        { t: m('e6'), c: [1100, 1150, 1.45], to: [1110, 1150, 1.5] },
        { t: m('l22'), c: [1100, 1150, 1.45] },
      ];
      const cam = shotCam(shots, t);
      ctx.save(); applyCam(ctx, cam, t);
      drawBg(ctx, 'checkin');
      // Anna behind the desk
      const sad = t >= m('l13') && t < m('l16'), apol = t >= m('l16') && t < m('l17'), amazed = t >= m('l19') && t < m('l20'), give = t >= m('l21');
      const pass = t >= m('l12') && t < m('l15') + 1.0;
      crew(ctx, 1700, 1436, 0.72, {
        turn: -0.3, look: sad ? [0.1, 0.6] : amazed ? [0, 0.7] : [-0.75, 0.05],
        browL: sad ? -0.35 : apol ? 0.6 : 0.3, browR: sad ? 0.25 : apol ? 0.6 : 0.3, surprise: amazed ? 0.8 : 0,
        mouth: { smile: sad ? -0.1 : apol ? -0.3 : 0.8, w: 1 },
        armR: pass || give ? A(1, 40, 0.8, 'c') : t >= m('l15') && t < m('weigh') + 1 ? A(-1, 65, 0.9, 'c') : [120, -60], armL: [-120, -70], armsFront: pass || give,
        holdR: pass ? (c => PR.passport(c, 1.1, 0.2)) : give ? (c => PR.boardingPass(c, 1.2, 0.2)) : null,
      }, t, 'anna', 'anna', 4);
      // bag on the scale (drops in at 'weigh'); lid opens while Gus eats
      const bagIn = t >= m('weigh'), drop = bagIn ? 1 - ease.out(clamp((t - m('weigh')) / 0.25)) : 1;
      const eatEnd = m('eat') + 3.0, lidK = t >= m('eat') && t < eatEnd ? ease.out(clamp((t - m('eat')) / 0.3)) * (1 - clamp((t - eatEnd + 0.3) / 0.3)) : 0;
      if (bagIn) { const sh = t >= m('l16') && t < m('eat') ? Math.sin(t * 40) * 2 : 0; PR.suitcase(ctx, SCALE.x + sh, SCALE.y - drop * 500, 0.7, { open: lidK > 0 ? 1 : 0 }); if (lidK > 0) PR.suitcaseLid(ctx, SCALE.x, SCALE.y, 0.7, lidK); }
      // Gus
      const gk = ease.out(clamp((t - 0.2) / 2.4)), gx = lerp(560, 1010, gk), gw = gk > 0 && gk < 0.98;
      const eating = t >= m('eat') && t < eatEnd, ci = Math.floor((t - m('eat')) / 1.0), cp = (t - m('eat')) % 1.0;
      const inBeak = t < m('egg') && t > 1.6 && t < m('l12') + 0.2;
      const proud = t >= m('l18') && t < m('eat');
      const chew = eating ? (cp > 0.4 && cp < 0.8 ? 0.5 + 0.4 * Math.sin(cp * 40) : 0) : 0;
      gus(ctx, gx, 1500, 0.92, {
        face: 1, walking: gw, walk: t * 2.1, lids: proud || eating ? 0.1 : t >= m('l13') && t < m('l15') ? 0.45 : 0.3,
        neck: eating ? (cp < 0.4 ? 0.4 : -0.1) : proud ? -0.35 : 0.05, look: 0.6, honk: Math.max(chew, t < m('l12') ? 0.1 : 0),
        wing: eating ? 0.2 : proud ? 0.55 : 0.1, squash: t >= m('l20') && t < m('l21') ? 1.03 : 1,
        hold: inBeak ? ((c, f, h) => { c.translate(h.hx + 120, h.hy + 30); PR.passport(c, 1.05, 1.35); }) : null,
      }, t);
      // flying burgers: case → beak
      if (eating) for (let i = 0; i < 3; i++) { const u = (t - eatT(i)) / 0.4; if (u > 0 && u < 1) { const e = ease.in(u); PR.burger(ctx, lerp(SCALE.x, gx + 105, e), lerp(SCALE.y - 190, 1067, e) - Math.sin(u * Math.PI) * 140, 0.7, u * 6); } }
      // Sofia walks in and stands behind Gus
      const wk = ease.out(clamp(t / 2.2)), sx = lerp(260, 560, wk) - (t >= m('l12') && t < m('l15') || t >= m('l18') && t < m('l19') || t >= m('l20') && t < m('l21') ? 280 : 0), walking = wk > 0 && wk < 0.98;
      const palm = t >= m('l17') && t < m('l18') + 0.5, here = t >= m('l10') && t < m('l11');
      sofia(ctx, sx, standHip(1500, 0.72), 0.72, {
        legs: walking ? 'walk' : 'stand', walk: t * 1.9, turn: 0.35, look: palm ? [0.3, 0.4] : [0.8, -0.2],
        blink: palm ? 0.5 : 0, brow: { l: 0.2, r: 0.2, worry: palm ? 0.7 : 0 }, mouth: { smile: palm ? -0.2 : 0.55 },
        armR: palm ? [40, -470] : here ? A(1, 60, 0.85) : null, handR: palm ? 'open' : 'mitten', armsFront: palm || here,
        holdR: here ? (c => PR.passport(c, 1.0, 0.1)) : null,
      }, t, 1);
      B3.desk(ctx, kg);
      ctx.restore();
      if (bagIn && t < m('weigh') + 1.0) P.burst(ctx, 1500, 260, 'THUD', clamp((t - m('weigh')) / 0.8), '#FFD23F', -0.06, 0.7);
      if (kg === 23 && t < m('l20')) P.burst(ctx, 1500, 270, '23 KG!', clamp((t - eatEnd + 1) / 0.9), '#6FE39B', 0.06, 0.8);
    },
  };
})();

// ==================================================================== 3. SECURITY
const security = (() => {
  const { m } = mk('security');
  const GX = { a: 760, b: 1900, back: 1480 };
  const gusX = t => {
    const w0 = wordT('l27', 1);
    if (t < w0) return GX.a;
    if (t < m('beep')) return lerp(GX.a, GX.b, ease.inOut(clamp((t - w0) / (m('beep') - w0 - 0.1))));
    if (t < m('beep2')) return GX.b;
    if (t < m('tie')) return lerp(GX.back, GX.b, ease.inOut(clamp((t - m('beep2')) / 0.9)));
    return GX.b;
  };
  return {
    sfx: [['beep', 0, 'beep'], ['beep2', 0, 'beep'], ['tie', 0.4, 'click'], ['l34', 0.0, 'tick']],
    draw(ctx, t) {
      const shots = [
        { t: 0, c: [1180, 1150, 1.1], to: [1200, 1150, 1.15] },
        { t: m('l24'), c: [500, 1150, 1.8] },
        { t: m('l25'), c: [1450, 1060, 2.4], to: [1450, 1050, 2.5] },
        { t: m('l26'), c: [800, 1040, 2.5] },
        { t: m('look'), c: [1450, 1060, 2.2], to: [1450, 1260, 2.6], d: 0.9 },
        { t: m('look') + 0.9, c: [800, 1380, 3.2] },
        { t: m('l27'), c: [1300, 1100, 1.5], to: [1650, 1100, 1.5] },
        { t: m('beep'), c: [1800, 1000, 1.8], shake: tt => tt < m('beep') + 0.8 ? 5 : 0 },
        { t: m('l28'), c: [1440, 1060, 2.4] },
        { t: m('l29'), c: [1900, 1060, 2.4] },
        { t: m('beep2') - 0.3, c: [1700, 1050, 1.7], shake: tt => tt > m('beep2') + 0.8 ? 5 : 0 },
        { t: m('l30'), c: [1440, 1060, 2.4] },
        { t: m('l31'), c: [1850, 1130, 2.9], to: [1850, 1100, 3.1] },
        { t: m('l32'), c: [1440, 1060, 2.4] },
        { t: m('tie'), c: [1850, 1100, 2.2] },
        { t: m('l33'), c: [1850, 1090, 2.7] },
        { t: m('l34'), c: [1500, 1150, 1.3], to: [1560, 1150, 1.35] },
      ];
      const cam = shotCam(shots, t);
      ctx.save(); applyCam(ctx, cam, t);
      drawBg(ctx, 'security');
      const gx = gusX(t), arch = Math.abs(gx - 1900) < 130;
      const alarm = (t >= m('beep') && t < m('l29')) || (t >= m('beep2') + 0.8 && t < m('l31'));
      B3.lamp(ctx, alarm, t);
      // Sofia puts her bag on the belt (bag slides toward the x-ray)
      const bagK = clamp((t - m('l24')) / 1.2);
      const bagX = lerp(240, 430, ease.out(bagK)) + (t > m('l26') ? (t - m('l26')) * 90 : 0);
      if (bagX < 640) { ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 640, 2000); ctx.clip(); PR.suitcase(ctx, bagX, 1272, 0.28, { col: '#5BB8F0', sh: '#3C8CC0' }); ctx.restore(); }
      // Bob
      const looking = t >= m('look') && t < m('l27'), stern = t >= m('l28'), tie = t >= m('tie');
      crew(ctx, 1450, 1500, 0.7, {
        turn: -0.3, look: looking ? [-0.3, 0.8] : [-0.8, 0.05], browL: -0.5, browR: -0.5, mouth: { smile: -0.3 }, bob: 0,
        armL: [-70, -50], armR: tie && t < m('l33') ? A(1, 40, 0.8, 'c') : [70, -50], armsFront: true,
        holdR: tie && t < m('l33') ? (c => { PR.tieClip(c, 0, 0, 1.1, 0.5); paint(c, q => { q.moveTo(-10, 4); q.lineTo(10, 4); q.lineTo(14, 56); q.lineTo(0, 70); q.lineTo(-14, 56); q.closePath(); }, '#2E6FD8', { lw: 4 }); }) : null,
        hop: 0,
      }, t, 'bob', 'bob', 3);
      // Gus
      const walking = t >= wordT('l27', 1) && t < m('beep') || (t >= m('beep2') && t < m('beep2') + 0.9);
      const clip = t < m('tie'), cover = t >= m('tie');
      gus(ctx, gx, 1500, 0.9, {
        face: 1, tie: !cover, walking, walk: t * 2.4, lids: cover ? 0.15 : t >= m('l31') && t < m('l32') ? 0.05 : 0.5, neck: cover ? 0.3 : t >= m('l31') && t < m('l32') ? -0.3 : 0, look: 0.5,
        wing: cover ? 1.0 : t >= m('l31') ? 0.4 : 0.1,
        hold: (c, f, h) => { if (clip && t >= m('l31') - 1.2) PR.tieClip(c, h.hx + 14, h.hy + 178, 1.1, -0.15); },
      }, t);
      // everyone is looking
      if (t >= m('l34') - 0.2) for (let i = 0; i < 7; i++) { const k = ease.back(clamp((t - m('l34') + 0.2 - i * 0.12) / 0.25)); if (k <= 0) continue; const ex = 1250 + (i % 4) * 260 + hash(i) * 60, ey = 900 + (i % 2) * 240 - Math.floor(i / 4) * 160; ctx.save(); ctx.translate(ex, ey); ctx.scale(k * 0.9, k * 0.9); for (const sx of [-24, 24]) { paint(ctx, q => q.ellipse(sx, 0, 22, 28, 0, 0, 7), '#FFFFFF', { lw: 5 }); ctx.fillStyle = OL; ctx.beginPath(); ctx.arc(sx + 6 * Math.sin(t * 2 + i), 6, 8, 0, 7); ctx.fill(); } ctx.restore(); }
      // Sofia (behind the belt, left of Gus)
      const wh = t >= m('l34');
      sofia(ctx, 560 + (arch ? 0 : 0), standHip(1500, 0.74), 0.74, {
        turn: 0.3, look: wh ? [0.8, 0.1] : [0.8, -0.2], legs: 'stand', brow: { l: 0.2, r: 0.2, worry: wh ? 0.8 : 0 }, mouth: { smile: wh ? -0.1 : 0.55 }, sweat: wh ? 1 : 0,
        armL: wh ? A(-1, 50, 0.85) : null, handL: wh ? 'open' : 'mitten', armsFront: wh,
      }, t, 2);
      ctx.restore();
      if (alarm && Math.floor(t * 6) % 2 === 0) P.burst(ctx, 1450, 270, 'BEEP BEEP!', clamp(((t - m('beep')) % 1.4) / 0.6), '#FF5A5A', -0.06, 0.8);
    },
  };
})();

// ==================================================================== 4a. CORRIDOR
const corridor = (() => {
  const { m, t1 } = mk('corridor');
  return {
    sfx: [['l36', 0.4, 'run']],
    draw(ctx, t) {
      const shots = [{ t: 0, c: [1000, 1100, 1.15], to: [1100, 1100, 1.2] }, { t: m('l36'), c: [1100, 1050, 1.7], to: [1500, 1050, 1.7], d: 2 }];
      const cam = shotCam(shots, t);
      ctx.save(); applyCam(ctx, cam, t); drawBg(ctx, 'corridor');
      const go = clamp((t - wordT('l36', 1)) / 3);
      const gx = lerp(1250, 2000, ease.in(go)), sx = lerp(850, 1560, ease.in(clamp((t - wordT('l36', 1) - 0.3) / 3)));
      gus(ctx, gx, 1500, 0.9, { face: 1, walking: go > 0, walk: t * 3, lids: t >= m('l36') ? 0.2 : 0.5, neck: t >= m('l36') ? -0.2 : 0, look: 0.6, wing: t >= m('l36') ? 0.6 : 0.1 }, t);
      const w = t < m('l35') + 1.0 ? 0 : 1;
      sofia(ctx, sx, standHip(1500, 0.74), 0.74, { legs: go > 0.05 ? 'walk' : 'stand', walk: t * 2.4, turn: 0.3, look: [0.7, -0.2], brow: { l: 0.2, r: 0.2, worry: 0.9 }, mouth: { smile: -0.2 }, armL: t > m('l35') && t < m('l36') ? A(-1, 100, 0.85) : null, handL: 'open', armsFront: t > m('l35') && t < m('l36') }, t, 2);
      ctx.restore();
    },
  };
})();

// ==================================================================== 4b. TOILET DOOR + DR. MAX
const wc = (() => {
  const { m } = mk('wc');
  const RUN = () => wordT('l44', 0);
  return {
    sfx: [['l37', -0.05, 'tick'], ['turn', 0, 'pop'], ['l44', 0.5, 'run'], ['l44', 0.6, 'whoosh']],
    draw(ctx, t) {
      const shots = [
        { t: 0, c: [1900, 1150, 1.3] },
        { t: m('l38'), c: [1840, 1060, 2.5] },
        { t: m('l39'), c: [1650, 1100, 1.7], to: [1500, 1100, 1.6] },
        { t: m('turn'), c: [1300, 1100, 1.5], to: [1250, 1100, 1.6] },
        { t: m('l40'), c: [1180, 1000, 2.5] },
        { t: m('e3'), c: [1500, 1100, 1.5] },
        { t: m('l41'), c: [1700, 1080, 2.2] },
        { t: m('l42'), c: [1180, 1000, 2.5] },
        { t: m('l43'), c: [1960, 1050, 2.5] },
        { t: m('l44'), c: [1400, 1130, 1.3], to: [900, 1130, 1.3], d: 2 },
      ];
      const cam = shotCam(shots, t);
      ctx.save(); applyCam(ctx, cam, t); drawBg(ctx, 'corridor');
      const run = clamp((t - RUN()) / 2.4), re = ease.in(run);
      // Dr. Max strolls in at 'turn', stops by the plant
      const mk_ = ease.out(clamp((t - m('turn')) / 0.9)), mx = lerp(300, 1180, mk_), strolling = mk_ > 0 && mk_ < 0.97;
      if (t >= m('turn')) {
        PR.suitcase(ctx, mx + 130, 1480, 0.42, { col: '#2F9466', sh: '#1F6B49' });
        const pt = t >= m('l40') && t < m('l41');
        crew(ctx, mx, 1500, 0.72, {
          turn: 0.15, look: [0.7, 0.05], browL: 0.4, browR: 0.4, mouth: { smile: 0.9, open: 0.2 }, hop: strolling ? Math.abs(Math.sin(t * 9)) * 12 : 0,
          armL: pt ? A(-1, 95, 0.95, 'c') : [-90, -60], handL: pt ? 'open' : 'relax', armR: [70, -70], armsFront: pt,
        }, t, 'maxVac', 'drmax', 9);
      }
      const sx = 1500 - re * 1900, gx = 1760 - re * 1900;
      gus(ctx, gx, 1500, 0.9, { face: run > 0 ? -1 : -1, walking: run > 0, walk: t * 4, lids: t >= m('l43') && t < m('l44') ? 0.9 : t >= m('l38') ? 0.45 : 0.3, neck: t >= m('l43') && t < m('l44') ? 0.6 : 0, look: 0.5, wing: run > 0 ? 0.6 : 0.1 }, t);
      const shout = t >= m('l44'), sur = t >= m('l41') && t < m('l42');
      sofia(ctx, sx, standHip(1500, 0.74), 0.74, {
        legs: run > 0 ? 'walk' : 'stand', walk: t * 4, turn: run > 0 ? -0.4 : -0.35, look: run > 0 ? [-0.9, 0] : [-0.8, -0.1], wide: sur ? 0.9 : 0,
        brow: { l: 0.3, r: 0.3, angry: shout ? 0.5 : 0 }, mouth: { smile: shout ? 0.1 : t >= m('l37') && t < m('l38') ? -0.3 : 0.5 },
        armL: shout && run < 0.05 ? A(-1, 140, 0.9) : null, handL: 'open', armsFront: shout && run < 0.05,
      }, t, 2);
      ctx.restore();
      if (t >= m('l44') && t < m('l44') + 1.4) P.burst(ctx, 1400, 270, 'RUN!', clamp((t - m('l44')) / 1.0), '#FFD23F', -0.08, 0.9);
    },
  };
})();


// ==================================================================== 5. GATE 12 — delayed
const lounge = (() => {
  const { m } = mk('lounge');
  const geese = (ctx, t) => { // wild geese in a V across the window
    const t0 = m('clock') + 1.6, u = (t - t0) / 5.5; if (u < 0 || u > 1) return;
    const x0 = 3000 - u * 3400;
    for (let i = 0; i < 7; i++) { const row = Math.ceil(i / 2), side = i % 2 ? 1 : -1, gx = x0 + row * 120, gy = 470 + row * side * 55 + (i ? 0 : 0);
      ctx.save(); ctx.translate(gx, gy); ctx.scale(-0.9, 0.9);
      paint(ctx, c => c.ellipse(0, 0, 38, 16, 0, 0, 7), '#FFFFFF', { lw: 4 }); paint(ctx, c => c.ellipse(34, -8, 14, 10, 0, 0, 7), '#FFFFFF', { lw: 4 }); paint(ctx, c => { c.moveTo(46, -8); c.lineTo(62, -4); c.lineTo(46, 0); c.closePath(); }, '#FF9A2E', { lw: 3 });
      const fl = Math.sin(t * 9 + i) * 40; paint(ctx, c => { c.moveTo(-6, 0); c.quadraticCurveTo(-30, -fl - 30, -64, -fl); c.quadraticCurveTo(-30, -fl * 0.2, 14, 4); c.closePath(); }, '#FFFFFF', { lw: 4 }); ctx.restore(); }
  };
  return {
    sfx: [['ding', 0, 'dingdong'], ['clock', 0, 'tick'], ['clock', 0.5, 'tick'], ['clock', 1.0, 'tick'], ['clock', 1.5, 'tick'], ['clock', 2.0, 'tick'], ['clock', 2.5, 'tick'], ['l51', -0.8, 'tweet']],
    draw(ctx, t) {
      const shots = [
        { t: 0, c: [1500, 1100, 1.05] },
        { t: m('ding'), c: [1450, 700, 1.6], to: [1450, 760, 1.7], d: 1.6 },
        { t: m('l45') + 2.2, c: [1480, 1000, 1.7] },
        { t: m('e4'), c: [1900, 1150, 1.3] },
        { t: m('l46'), c: [1850, 1130, 2.3], to: [1860, 1130, 2.4] },
        { t: m('l47'), c: [2150, 1100, 2.4] },
        { t: m('l48'), c: [1850, 1130, 2.3] },
        { t: m('l49'), c: [2150, 1100, 2.4] },
        { t: m('l50'), c: [1950, 1150, 1.6] },
        { t: m('clock'), c: [1500, 1050, 1.1], to: [1700, 1050, 1.3], d: 3.2 },
        { t: m('l51'), c: [2150, 1100, 2.4] },
        { t: m('l52'), c: [1950, 1150, 1.6], to: [1900, 1130, 1.4] },
      ];
      const cam = shotCam(shots, t);
      ctx.save(); applyCam(ctx, cam, t);
      drawBg(ctx, 'lounge');
      B3.boardGate(ctx, t >= m('ding') + 0.5, t);
      const mins = t < m('clock') ? 5 : 5 + ease.inOut(clamp((t - m('clock')) / 3.2)) * 120;
      B3.wallClock(ctx, 880, 960, 90, mins);
      geese(ctx, t);
      if (t >= m('ding') && t < m('l45') + 3) { const k = clamp((t - m('ding')) / 0.3); ctx.save(); ctx.translate(1450, 420); ctx.scale(k, k); paint(ctx, c => roundRect(c, -110, -50, 220, 100, 24), '#FFFFFF', { lw: 7 });
        for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-50, 0, 24 + i * 22 + (Math.floor(t * 4) % 3) * 6, -0.6, 0.6); ctx.lineWidth = 7; ctx.strokeStyle = OL; ctx.stroke(); ctx.save(); ctx.scale(-1, 1); ctx.restore(); }
        U.textOutlined(ctx, 'PA', 50, 18, 56, U.ORANGE, { olw: 8 }); ctx.restore(); }
      // sitting trick: characters lowered behind the seat front
      const nap = t >= m('clock') && t < m('l51') - 0.2, asleepG = nap, look = t >= m('l51');
      const sad = t >= m('l46') && t < m('l47'), firm = t >= m('l48') && t < m('l49');
      gus(ctx, 2250, 1440, 0.9, { face: -1, lids: asleepG ? 0.95 : t >= m('l47') ? 0.4 : 0.5, neck: asleepG ? 0.5 + 0.05 * Math.sin(t * 2) : look ? -0.3 : t >= m('l47') && t < m('l48') ? -0.2 : 0, look: look ? -0.3 : -0.6, wing: 0.1 }, t);
      sofia(ctx, 1900, 1300, 0.74, {
        legs: 'stand', turn: -0.35, look: look ? [0.6, -0.4] : [0.8, 0], blink: nap ? 0.8 : 0, sleepy: nap ? 0.7 : 0,
        brow: { l: 0.2, r: 0.2, worry: sad ? 0.9 : 0, angry: firm ? 0.6 : 0 }, mouth: { smile: sad ? -0.4 : firm ? -0.1 : t >= m('l50') && !nap ? 0.5 : 0.1 },
        tilt: nap ? 0.18 : 0, armL: sad ? A(-1, 50, 0.85) : null, handL: 'open', armsFront: sad,
      }, t, 2);
      B3.seatFront(ctx, 1620, 850);
      if (nap) P.zzz(ctx, 2250, 1000, t);
      ctx.restore();
      if (t >= m('ding') + 0.5 && t < m('l45') + 3.5) P.burst(ctx, 480, 290, 'DELAYED', clamp((t - m('ding') - 0.5) / 1.2), '#FF5A5A', -0.06, 0.9);
    },
  };
})();

// ==================================================================== 6. ON THE PLANE
const plane = (() => {
  const { m } = mk('plane');
  return {
    sfx: [['takeoff', 0, 'rumble'], ['gary', 0, 'honk'], ['cart', 0, 'wheels'], ['l65', 0.9, 'slurp']],
    draw(ctx, t) {
      const tk = t >= m('takeoff') && t < m('gary');
      const shots = [
        { t: 0, c: [1300, 1100, 1.1] },
        { t: m('l53'), c: [2000, 1050, 2.1], to: [2000, 1040, 2.25] },
        { t: m('l54'), c: [1450, 1150, 1.9] },
        { t: m('l55'), c: [2050, 1050, 2.2] },
        { t: m('e5'), c: [1200, 1130, 1.5] },
        { t: m('l56'), c: [1000, 1100, 2.4], to: [1010, 1090, 2.55] },
        { t: m('l57'), c: [1450, 1150, 1.9] },
        { t: m('l58'), c: [1000, 1100, 2.5] },
        { t: m('takeoff'), c: [1250, 1100, 1.3], rot: -0.07, shake: 6 },
        { t: m('gary'), c: [1000, 1020, 2.3], to: [1000, 1010, 2.6] },
        { t: m('l60'), c: [1450, 1150, 1.9] },
        { t: m('cart'), c: [1800, 1120, 1.3], to: [1600, 1120, 1.3], d: 1 },
        { t: m('l61'), c: [2080, 1050, 2.2] },
        { t: m('l62'), c: [1450, 1150, 1.9] },
        { t: m('l63'), c: [1000, 1100, 2.4] },
        { t: m('l64'), c: [2080, 1050, 2.2] },
        { t: m('l65'), c: [1150, 1130, 1.8] },
      ];
      const cam = shotCam(shots, t);
      ctx.save(); applyCam(ctx, cam, t);
      drawBg(ctx, 'cabin');
      // window with clouds (+ Uncle Gary after take-off)
      const restore = B3.windowSky(ctx, 1000, tk ? t * 3 : t, true);
      if (t >= m('gary')) { const gy = 900 + Math.sin(t * 2.2) * 24; garyRig(ctx, 1030, gy + 160, 0.34, { face: -1, wing: 0.5 + 0.5 * Math.sin(t * 9), look: 0.6, honk: t >= m('l59') ? 0.1 : 0.4 }, t); }
      restore();
      // seats: backs behind the characters, fronts over the legs
      for (const sx of [760, 1170]) paint(ctx, c => roundRect(c, sx - 40, 1060, 380, 300, 40), '#2E6FD8', { shade: '#2459B2', sx: 0, sy: -12, lw: 7 });
      const g = t >= m('l56') ? 1 : 0, dpl = t >= m('l56');
      gus(ctx, 1000, 1445, 0.9, { face: 1, lids: t >= m('l56') ? 0.15 : 0.5, neck: dpl ? -0.2 : 0, look: dpl ? 0.9 : 0.3, wing: dpl && t < m('l57') ? 0.5 : 0.1, honk: 0, squash: 1 }, t);
      const conf = t >= m('l57') && t < m('l58'), dead = t >= m('l60') && t < m('cart');
      sofia(ctx, 1380, 1300, 0.74, {
        legs: 'stand', turn: 0.3, look: [-0.7, 0.1], brow: { l: 0.2, r: 0.2, worry: conf ? 0.8 : 0 }, mouth: { smile: conf ? -0.1 : dead ? -0.2 : 0.5 }, sleepy: dead ? 0.6 : 0, tilt: tk ? Math.sin(t * 30) * 0.03 : 0,
      }, t, 2);
      // only the front cushions overlap the legs; the seat backs hide behind the characters, so draw them first (see order above)
      B3.seatFront(ctx, 740, 760);
      // Anna in the aisle (flight attendant), trolley comes in
      const cartK = ease.out(clamp((t - m('cart')) / 1.0)), cx = lerp(2750, 2150, cartK);
      if (t >= m('cart') - 0.2) PR.trolley(ctx, cx, 1500, 1.0);
      const talkA = t >= m('l61') && t < m('l62'), dispens = t >= m('l61');
      crew(ctx, t >= m('cart') ? cx - 300 : 2150, 1500, 0.74, {
        turn: -0.4, look: [-0.8, 0.05], browL: 0.35, browR: 0.35, mouth: { smile: 0.9 }, armR: dispens ? A(1, 40, 0.8, 'c') : [70, -60], armsFront: true, armL: [-60, -60],
        holdR: t >= m('l65') + 0.2 ? (c => PR.plate(c, 20, 10, 'fish')) : null,
      }, t, 'annaFA', 'anna', 4);
      if (t >= m('l65') + 0.6) { ctx.save(); ctx.translate(1000, 1330); ctx.scale(1.8, 1.8); PR.plate(ctx, 0, 0, 'fish'); ctx.restore(); }
      if (t >= m('l62') + 1.4 && t < m('l63')) { ctx.save(); ctx.translate(1380, 1330); PR.plate(ctx, 0, 0, 'chicken'); ctx.restore(); }
      ctx.restore();
      if (tk) P.burst(ctx, 1400, 290, 'WHOOOSH', clamp((t - m('takeoff')) / 1.3), '#FFD23F', -0.06, 0.85);
    },
  };
})();

// ==================================================================== 7. MADRID — baggage claim
const baggage = (() => {
  const { m } = mk('baggage');
  const CASEX = t => 1450 + 300 * (m('l68') - Math.min(t, m('l68'))), CS = 0.95, BY = 1330;
  return {
    sfx: [['belt', 0, 'belt'], ['l68', 0.0, 'thunk'], ['open', 0, 'boing'], ['honk', 0, 'honk'], ['l66', 0, 'dingdong']],
    draw(ctx, t) {
      const bt = Math.min(t, m('l68'));
      const shots = [
        { t: 0, c: [1450, 1100, 1.1] },
        { t: m('l66') + 1, c: [900, 1130, 1.6] },
        { t: m('l67'), c: [800, 1100, 2.2] },
        { t: m('belt'), c: [1500, 1150, 1.4], to: [1450, 1150, 1.5], d: 2.4 },
        { t: m('l68'), c: [1050, 1100, 2.2] },
        { t: m('open') - 0.2, c: [1450, 1130, 2.0], to: [1450, 1100, 2.3], d: 1.5 },
        { t: m('l69'), c: [1000, 1100, 2.3] },
        { t: m('l70'), c: [1450, 1120, 2.5] },
        { t: m('l71'), c: [1000, 1100, 1.7] },
      ];
      const cam = shotCam(shots, t);
      ctx.save(); applyCam(ctx, cam, t);
      drawBg(ctx, 'baggage');
      B3.beltBack(ctx, bt);
      // decor bags ride the belt at belt speed (belt spans x 260..2780; bags loop off-screen only)
      [['#5BB8F0', 300], ['#3DAA6E', 1100], ['#FFD23F', 1900]].forEach(([c, x0]) => { const x = ((x0 - bt * 300 - 260) % 2500 + 2500) % 2500 + 260; if (x < 2700) PR.suitcase(ctx, x, BY, 0.55, { col: c, sh: '#00000044' }); });
      // Gus's case + Uncle Gary inside
      const cx = CASEX(t), opened = t >= m('open'), lid = opened ? ease.out(clamp((t - m('open')) / 0.35)) : 0, ru = t - m('open');
      if (CASEX(t) < 2640) {
        PR.suitcase(ctx, cx, BY, CS, { open: opened ? 1 : 0 });
        if (opened) {
          PR.suitcaseLid(ctx, cx, BY, CS, lid); // lid stands BEHIND Uncle Gary
          ctx.save(); ctx.beginPath(); ctx.rect(cx - 400, 0, 800, BY - 230 * CS + 45); ctx.clip();
          const up = ease.out(clamp((t - m('honk') + 0.2) / 0.5)), sleepy = t < m('honk');
          garyRig(ctx, cx, BY - 230 * CS + 160 - (1 - up) * 150 + 40 * (sleepy ? 1 : 0), 0.62, { face: -1, neck: sleepy ? 0.5 : -0.2, lids: sleepy ? 0.95 : 0.5, wing: t >= m('honk') ? 0.8 : 0.1, honk: t >= m('honk') && t < m('l69') ? 0.5 : 0 }, t);
          ctx.restore();
          for (let i = 0; i < 5; i++) PR.wrapper(ctx, cx - 120 + i * 60, BY - 230 * CS + 52, 0.6, i, i + 1);
          if (!(t >= m('honk'))) P.zzz(ctx, cx + 20, BY - 230 * CS - 120, t);
        }
      }
      B3.beltFront(ctx);
      // Sofia + Gus watch the belt (Gus freezes in shock)
      const arrive = t >= m('l66') + 0.2;
      gus(ctx, 1000, 1500, 0.9, { face: 1, lids: t >= m('l68') && t < m('l69') ? 0.02 : 0.5, neck: t >= m('l68') && t < m('l69') ? -0.4 : 0, look: 0.5, wing: t >= m('l69') && t < m('l70') ? 0.6 : 0.1, squash: t >= m('l68') && t < m('l69') ? 1.03 : 1 }, t);
      const ex = t >= m('l67') && t < m('belt'), lau = t >= m('l71');
      sofia(ctx, 640, standHip(1500, 0.74), 0.74, {
        turn: 0.35, look: [0.8, -0.1], brow: { l: 0.4, r: 0.4 }, mouth: { smile: 0.9 }, armL: ex || lau ? A(-1, 130, 0.9) : null, handL: 'open', armsFront: ex || lau, wide: t >= m('open') && t < m('l69') ? 0.7 : 0,
      }, t, 2);
      ctx.restore();
      if (t >= m('honk') && t < m('l69')) P.burst(ctx, 1500, 270, 'HONK!', clamp((t - m('honk')) / 1.0), '#FFD23F', -0.08, 0.9);
      if (t >= m('l66') && t < m('l66') + 4) { /* PA speaker icon */ ctx.save(); ctx.translate(960, 180); const k = ease.back(clamp((t - m('l66')) / 0.3)); ctx.scale(k * 0.8, k * 0.8); paint(ctx, c => roundRect(c, -110, -50, 220, 100, 24), '#FFFFFF', { lw: 7 }); U.textOutlined(ctx, 'PA', 0, 18, 56, U.ORANGE, { olw: 8 }); ctx.restore(); }
    },
  };
})();


// ==================================================================== RECAP — six phrases
const recap = (() => {
  const { m } = mk('recap');
  const items = [['Can I see your passport?', 'passport'], ['My bag is too heavy.', 'bag'], ['Where is gate 12?', 'gate'], ['My flight is delayed.', 'delay'], ['Window or aisle seat?', 'seat'], ['Have a nice flight!', 'wave']];
  return {
    sfx: [['l72', 0, 'quizjingle'], ...[1, 2, 3, 4, 5, 6].map(i => ['r' + i, 0, 'pop'])],
    draw(ctx, t) {
      const g = ctx.createLinearGradient(0, 0, 0, 1080); g.addColorStop(0, '#DCEBFA'); g.addColorStop(1, '#C4E2F4'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1920, 1080);
      ctx.save(); ctx.globalAlpha = 0.6; for (let i = 0; i < 12; i++) B3.cloud(ctx, (hash(i) * 2400 - t * 30 * (0.5 + hash(i + 2)) + 2400) % 2400 - 240, 80 + hash(i + 5) * 900, 30 + hash(i + 7) * 40); ctx.restore();
      U.textOutlined(ctx, 'AT THE AIRPORT', 960, 100, 84, U.ORANGE, { olw: 16 });
      ctx.font = '700 38px ' + F.EN; ctx.fillStyle = OL; ctx.textAlign = 'center'; ctx.fillText('Say it with Sofia!', 960, 150);
      items.forEach(([txt, ic], i) => {
        const Ln = L('r' + (i + 1)); const ak = ease.back(clamp((t - Ln.t0 + 0.7) / 0.25)); if (ak <= 0) return;
        const nextT = i < 5 ? L('r' + (i + 2)).t0 : Ln.t1 + 4, active = t >= Ln.t0 - 0.7 && t < nextT - 0.7, y = 235 + i * 130;
        ctx.save(); ctx.translate(960 + (1 - ak) * 900, y); const s = active ? 1.04 : 0.94; ctx.scale(s, s);
        paint(ctx, c => roundRect(c, -440, -50, 880, 100, 34), active ? '#FFFFFF' : 'rgba(255,255,255,0.75)', { lw: 6 });
        paint(ctx, c => c.arc(-380, 0, 36, 0, 7), active ? U.ORANGE : '#F3EAE2', { lw: 5 });
        ctx.font = '700 38px ' + F.EN; ctx.fillStyle = active ? '#fff' : OL; ctx.textAlign = 'center'; ctx.fillText(String(i + 1), -380, 13);
        U3.icon(ctx, ic, 390, 0, 0.7);
        ctx.font = '700 50px ' + F.EN; ctx.fillStyle = OL; ctx.textAlign = 'left'; ctx.fillText(txt, -325, 17);
        if (t > Ln.t1 && t < nextT - 0.7) { paint(ctx, c => roundRect(c, 215, -80, 190, 40, 20), U.GREEN, { lw: 4 }); ctx.font = '700 26px ' + F.EN; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText('YOUR TURN', 310, -51); }
        ctx.restore();
      });
      sofia(ctx, 170, 1230, 0.72, { armR: A(1, 120, 0.9), handR: 'open', mouth: { smile: 0.9 }, look: [0.6, -0.5], turn: 0.2 }, t, 10);
      gus(ctx, 1780, 1110, 0.72, { face: -1, lids: 0.55, neck: Math.sin(t * 3) * 0.2, look: -0.6 }, t);
    },
  };
})();

// ==================================================================== QUIZ
const quiz = (() => {
  const { m } = mk('quiz');
  return {
    sfx: [['q01', 0, 'quizjingle'], ['opts', 0, 'pop'], ['opts', 0.4, 'pop'], ['count', 0, 'tick'], ['count', 1, 'tick'], ['count', 2, 'tick'], ['answer', 0, 'correct'], ['answer', 0.3, 'sadhonk']],
    draw(ctx, t) {
      ctx.fillStyle = '#FFE08A'; ctx.fillRect(0, 0, 1920, 1080);
      ctx.save(); ctx.translate(960, 560); ctx.rotate(t * 0.15);
      for (let i = 0; i < 20; i++) { ctx.rotate(Math.PI * 2 / 20); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-160, -1700); ctx.lineTo(160, -1700); ctx.closePath(); ctx.fillStyle = i % 2 ? '#FFD45E' : '#FFE9A8'; ctx.fill(); }
      ctx.restore();
      const qk = ease.back(clamp((t - m('q01')) / 0.4));
      ctx.save(); ctx.translate(960, 130); ctx.scale(qk, qk); ctx.rotate(-0.03); U.textOutlined(ctx, 'QUICK QUIZ!', 0, 0, 110, '#FFFFFF', { olw: 20 }); ctx.restore();
      ctx.save(); ctx.globalAlpha = clamp((t - m('q01') - 0.8) / 0.3);
      paint(ctx, c => roundRect(c, 360, 180, 1200, 150, 40), '#FFFFFF', { lw: 8 });
      ctx.font = '700 58px ' + F.EN; ctx.fillStyle = OL; ctx.textAlign = 'center'; ctx.fillText('What did Gus pack in his bag?', 960, 278);
      ctx.restore();
      const ans = t > m('answer');
      [['A', 'Clothes.', 0], ['B', 'Burgers.', 0.4]].forEach(([Lt, txt, d], i) => {
        const ok = ease.back(clamp((t - m('opts') - d) / 0.35)); if (ok <= 0) return;
        const good = i === 1, y = 470 + i * 190;
        ctx.save(); ctx.translate(960, y); const s = ok * 0.9 * (ans ? (good ? 1.08 + 0.03 * Math.sin(t * 8) : 0.9) : 1); ctx.scale(s, s);
        paint(ctx, c => roundRect(c, -460, -85, 920, 170, 44), ans ? (good ? '#7BD88F' : '#E8DCD2') : '#FFFFFF', { lw: 8 });
        paint(ctx, c => c.arc(-370, 0, 58, 0, 7), i ? '#5BB8F0' : U.ORANGE, { lw: 7 });
        U.textOutlined(ctx, Lt, -370, 24, 72, '#FFFFFF', { olw: 10 });
        ctx.font = '700 64px ' + F.EN; ctx.fillStyle = ans && !good ? '#A39188' : OL; ctx.textAlign = 'left'; ctx.fillText(txt, -280, 21);
        if (ans && good) paint(ctx, c => { c.moveTo(330, 0); c.lineTo(365, 38); c.lineTo(425, -40); }, 'rgba(0,0,0,0)', { lw: 16, ol: '#1E7A3A' });
        ctx.restore();
      });
      if (t > m('count') && t < m('answer')) {
        const n = 3 - Math.floor(t - m('count')), f = (t - m('count')) % 1;
        ctx.save(); ctx.translate(1600, 560); const s = 1.4 - ease.out(Math.min(1, f * 3)) * 0.4; ctx.scale(s, s);
        paint(ctx, c => c.arc(0, 0, 90, 0, 7), '#FFFFFF', { lw: 8 }); U.textOutlined(ctx, String(Math.max(1, n)), 0, 38, 110, U.RED, { olw: 14 });
        ctx.restore();
      }
      sofia(ctx, 230, 1230, 0.72, { armR: A(1, 115, 0.9), handR: 'open', armL: [-130, -80], mouth: { smile: 0.9 }, brow: { l: 0.5, r: 0.5 }, look: [0.8, -0.4], turn: 0.2 }, t, 5);
      const sad = ans ? clamp((t - m('answer') - 0.3) / 0.4) : 0;
      // Gus votes A (innocent face); a burger falls out from behind the sign when the truth is told
      gus(ctx, 1700, 1110, 0.75, { face: -1, lids: lerp(0.45, 0.8, sad), look: -0.5, neck: -sad * 0.6, hold: (c, face, H) => { c.translate(H.hx + 128, H.hy + 26); c.rotate(sad * 0.35 + Math.sin(t * 3) * 0.05); line(c, [[0, 0], [0, 40]], 5, OL); c.scale(face, 1); paint(c, q => roundRect(q, -66, 40, 132, 132, 14), '#FFFFFF', { lw: 6 }); U.textOutlined(c, 'A', 0, 140, 96, U.ORANGE, { olw: 12 }); } }, t);
      if (ans) { const u = clamp((t - m('answer') - 0.3) / 0.7); PR.burger(ctx, 1500 - 40 * u, 700 + 460 * u * u, 0.9, u * 5); }
      if (ans) for (let i = 0; i < 80; i++) { const ph = (t - m('answer')) * (0.5 + hash(i) * 0.5); if (ph > 2.5) continue; const x = hash(i * 3) * 1920, y = -50 + ph * 450 + hash(i * 5) * 150; ctx.save(); ctx.translate(x + Math.sin(ph * 6 + i) * 30, y); ctx.rotate(ph * 8 + i); ctx.fillStyle = ['#FF7A2F', '#3DAA6E', '#5BB8F0', '#E5484D', '#FFD23F'][i % 5]; ctx.fillRect(-10, -5, 20, 10); ctx.restore(); }
    },
  };
})();

// ==================================================================== OUTRO + end screen
const outro = (() => {
  const { m, t1 } = mk('outro');
  return {
    sfx: [['l73', 0.3, 'pop'], ['l74', 0.6, 'click'], ['bye', 1.5, 'whoosh'], ['endscreen', 0, 'sparkle']],
    draw(ctx, t) {
      const end = t >= m('endscreen');
      const shots = [{ t: m('l73'), c: [1450, 1100, 1.25], to: [1440, 1100, 1.32], d: 8 }, { t: m('endscreen'), c: [1450, 1060, 1.0] }];
      ctx.save(); applyCam(ctx, shotCam(shots, t), t);
      drawBg(ctx, 'baggage');
      B3.beltBack(ctx, 0);
      PR.suitcase(ctx, 2250, 1330, 0.95, { open: 1 }); PR.suitcaseLid(ctx, 2250, 1330, 0.95, 1);
      B3.beltFront(ctx);
      const bye = t >= m('l74'), fly = clamp((t - m('bye') - 2.2) / 3.0), fe = ease.in(fly);
      // Uncle Gary stands up out of the case and joins Gus
      garyRig(ctx, lerp(2000, 1700, ease.out(clamp((t - m('l73')) / 1.5))) + fe * 700, 1500 - fe * 1100, 0.9, { face: -1, wing: fly > 0 ? 0.5 + 0.5 * Math.sin(t * 14) : 0.1, lids: 0.7, look: -0.4 }, t);
      gus(ctx, 1120 + fe * 700, 1500 - fe * 1100, 0.92, { face: 1, lids: t >= m('bye') ? 0.55 : 0.55, look: t >= m('bye') ? 0.4 : 0.6, wing: fly > 0 ? 0.5 + 0.5 * Math.sin(t * 14) : t >= m('bye') ? 0.4 + 0.3 * Math.sin(t * 12) : 0.1 }, t);
      sofia(ctx, 700, standHip(1500, 0.76), 0.76, { turn: bye ? 0.1 : 0.25, look: [0.4, -0.1], armR: bye ? A(1, 150 + Math.sin(t * 10) * 15, 0.92) : A(1, 50, 0.9), handR: 'open', armL: [-150, -80], mouth: { smile: 0.95 }, brow: { l: 0.4, r: 0.4 } }, t, 11);
      ctx.restore();
      if (end) { ctx.fillStyle = `rgba(255,246,230,${0.55 * clamp((t - m('endscreen')) / 0.5)})`; ctx.fillRect(0, 0, 1920, 1080); }
      const ck = ease.back(clamp((t - m('l73') - 0.3) / 0.4)) * (bye ? 1 - clamp((t - m('l74')) / 0.3) : 1);
      if (ck > 0) {
        ctx.save(); ctx.translate(560, 300); ctx.scale(ck * 0.8, ck * 0.8);
        paint(ctx, c => roundRect(c, -440, -170, 880, 330, 50), '#FFFFFF', { lw: 8 });
        ctx.font = '700 70px ' + F.EN; ctx.fillStyle = OL; ctx.textAlign = 'center'; ctx.fillText('I want to fly to ______', 0, -20);
        U.textOutlined(ctx, 'Write the city in the comments!', 0, 90, 46, U.ORANGE, { olw: 8 });
        ctx.restore();
      }
      if (bye && !end) {
        const sk = ease.back(clamp((t - m('l74')) / 0.4)), pressed = t > m('l74') + 0.6;
        ctx.save(); ctx.translate(470, 760); ctx.scale(sk * 0.85, sk * 0.85);
        paint(ctx, c => roundRect(c, -260, -70, 520, 140, 70), pressed ? '#9C8A82' : U.RED, { lw: 8 });
        U.textOutlined(ctx, pressed ? 'SUBSCRIBED' : 'SUBSCRIBE', 0, 22, 66, '#FFFFFF', { olw: 10 });
        ctx.restore();
        const ck2 = clamp((t - m('l74') - 0.2) / 0.4);
        U.tapCursor(ctx, lerp(800, 550, ease.out(ck2)), lerp(1000, 790, ease.out(ck2)), 1, clamp((t - m('l74') - 0.6) / 0.3));
      }
      if (end) {
        const ek = ease.back(clamp((t - m('endscreen') - 0.2) / 0.4));
        ctx.save(); ctx.translate(960, 0); ctx.scale(ek, ek); U.textOutlined(ctx, 'Thanks for watching!', 0, 150, 92, U.ORANGE, { olw: 16 }); ctx.restore();
        ctx.save(); ctx.globalAlpha = ek; ctx.setLineDash([22, 14]);
        paint(ctx, c => roundRect(c, 110, 290, 720, 405, 30), 'rgba(255,255,255,0.6)', { lw: 6 });
        paint(ctx, c => c.arc(1690, 470, 150, 0, 7), 'rgba(255,255,255,0.6)', { lw: 6 }); ctx.setLineDash([]);
        ctx.font = '700 46px ' + F.EN; ctx.fillStyle = OL; ctx.textAlign = 'center'; ctx.fillText('NEXT EPISODE', 470, 508); ctx.fillText('SUBSCRIBE', 1690, 485);
        ctx.restore();
        const fade = clamp((t - (t1 - 0.8)) / 0.8); if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, 1920, 1080); }
      }
    },
  };
})();

module.exports = { home, title, checkin, security, corridor, wc, lounge, plane, baggage, recap, quiz, outro };
