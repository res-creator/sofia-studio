// Episode 2 — BLOCK 1 scenes: hook (kitchen), title slam, waiting room, exam room part 1.
// Inside a scene every shot change is a HARD CUT (no flash, no blend). Scene-to-scene transitions are in render.js (ep1 style).
// Eye-lines: Sofia (front view) turns head + eyes toward the partner; Gus (profile) faces the partner; Dr. Max turns + looks at the partner.
const { TL, mk, talk, life, mouthFor, clamp, lerp, ease, seg, noise1 } = require('./engine');
const { drawSofia } = require('../lib/sofia');
const { drawGus } = require('../lib/gus');
const { drawDrMax, drawClipboard, drawPen } = require('../lib/drmax');
const P = require('../lib/props');
const { OL, paint, line, roundRect, hash } = require('../lib/draw');
const U = require('../lib/ui');
const F = require('../lib/fonts');
const BG = require('../lib/bg');
const B2 = require('./bg2');

const cache = {};
const bgImg = n => (cache[n] = cache[n] || (n === 'kitchen' ? BG.kitchen() : B2[n]()));
function drawBg(ctx, n) {
  if (n === 'kitchen') ctx.drawImage(bgImg(n), BG.X0, 0, BG.WW, 1920);
  else ctx.drawImage(bgImg(n), 0, 0, B2.WW, B2.HH);
}
const L = id => TL.lines.find(l => l.id === id);
const wordT = (id, i, k = 't0') => { const w = L(id).words; return (w[Math.min(i, w.length - 1)] || { t0: L(id).t0 })[k]; };

// ---- shot list camera: [{t, c:[cx,cy,z], to?:[cx,cy,z], d?, delay?, ease?, shake?}] — each entry starts with a hard cut
function shotCam(shots, t) {
  let s = shots[0];
  for (const x of shots) if (t >= x.t) s = x;
  const a = s.c, b = s.to || s.c;
  const dur = s.d || ((shots[shots.indexOf(s) + 1] || { t: s.t + 3 }).t - s.t);
  const u = (ease[s.ease || 'inOut'])(clamp((t - s.t - (s.delay || 0)) / dur));
  return { c: [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u), 0], shake: typeof s.shake === 'function' ? s.shake(t) : (s.shake || 0) };
}
function applyCam(ctx, cam, t) {
  const [cx, cy, z] = cam.c, sh = cam.shake;
  const sx = sh ? noise1(t * 25) * sh : 0, sy = sh ? noise1(t * 25 + 50) * sh : 0;
  ctx.translate(960 + sx, 540 + sy); ctx.scale(z * 0.72, z * 0.72); ctx.translate(-cx, -cy);
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
function gus(ctx, x, footY, s, p, t) {
  const lvl = talk('gus', t);
  drawGus(ctx, x, footY, s, Object.assign({}, p, { honk: Math.max(p.honk || 0, lvl * 0.75) }));
}
function drmax(ctx, x, floorY, s, pose, t, seed = 7) {
  const lf = life(t, seed), lvl = talk('drmax', t), p = Object.assign({}, pose);
  p.blink = Math.max(p.blink || 0, lf.blink); p.bob = (p.bob || 0) + lf.bob;
  const m = Object.assign({ open: 0, smile: 0.3, w: 1 }, pose.mouth || {});
  if (lvl > 0.02) { m.open = Math.max(m.open, clamp(lvl * 0.62)); m.w = (m.w || 1) * (1 - 0.12 * Math.max(0, noise1(t * 9))); }
  p.mouth = m;
  if (lvl > 0.05) p.tilt = (p.tilt || 0) + noise1(t * 1.5 + 3) * 0.04;
  drawDrMax(ctx, x, floorY - 280 * s, s, p);
}

// ---- props ----
function wrapper(ctx, X, Y, s = 1, rot = 0, seed = 1) { // crumpled burger wrapper
  ctx.save(); ctx.translate(X, Y); ctx.rotate(rot); ctx.scale(s, s);
  const pts = []; for (let i = 0; i < 11; i++) { const a = i / 11 * Math.PI * 2, r = 46 * (0.78 + 0.35 * hash(seed * 13 + i)); pts.push([Math.cos(a) * r * 1.25, Math.sin(a) * r * 0.8]); }
  const shape = c => { pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); };
  paint(ctx, shape, '#FFE07A', { shade: '#E8B640', sx: 6, sy: 6, lw: 5 });
  ctx.save(); ctx.beginPath(); shape(ctx); ctx.clip(); ctx.fillStyle = '#E5484D'; ctx.fillRect(-80, -8, 160, 18); ctx.restore();
  line(ctx, [[-20, -24], [-6, -10], [10, -28]], 3, 'rgba(58,34,29,0.45)'); line(ctx, [[12, 18], [26, 8]], 3, 'rgba(58,34,29,0.45)');
  ctx.restore();
}
function kitchenTable(ctx) {
  for (const lx of [690, 1150]) paint(ctx, c => roundRect(c, lx - 14, 1350, 28, 250, 8), '#8A5A38', { lw: 5 });
  paint(ctx, c => roundRect(c, 650, 1300, 540, 70, 10), '#E86A5A', { shade: '#C9503F', sx: 0, sy: -10, lw: 6 }); // cloth front
  ctx.save(); ctx.beginPath(); roundRect(ctx, 650, 1300, 540, 70, 10); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,0.55)';
  for (let x = 650; x < 1190; x += 40) ctx.fillRect(x, 1300, 20, 70); ctx.restore();
  paint(ctx, c => roundRect(c, 630, 1272, 580, 36, 12), '#F2E7D8', { lw: 6 }); // top
}
const WRAPS = [[700, 1268, -0.3], [760, 1262, 0.5], [1080, 1266, 0.2], [1140, 1270, -0.6], [1010, 1258, 0.9]];
function wrappers(ctx, n = 5) { WRAPS.slice(0, n).forEach(([x, y, r], i) => wrapper(ctx, x, y, 0.8, r, i + 1)); }

// ==================================================================== HOOK — kitchen
const hook = (() => {
  const { m, k } = mk('hook');
  const GX = 920, GY = 1330, GS = 0.95, SX = 300, SFL = 1600, SS = 0.72;
  const counts = () => [0, 1, 2, 3, 4].map(i => m('insert') + 0.12 + i * 0.16);
  return {
    sfx: [['light', 0, 'click'], ['light', 0.25, 'run'], ['l04', 0.15, 'honk'], ['l04', 0.35, 'tornado']],
    sfxAt: () => counts().map(t => ({ t, name: 'pop' })),
    draw(ctx, t) {
      const noT = wordT('l04', 2); // "No no no"
      const shots = [
        { t: 0, c: [620, 1140, 1.0], to: [600, 1140, 1.04] },                                  // wide establishing
        { t: m('l01'), c: [640, 1130, 1.5], to: [650, 1120, 1.56] },                          // medium two-shot
        { t: m('l02'), c: [900, 950, 2.9], to: [905, 960, 3.15] },                            // CU Gus (pain), slow push
        { t: m('insert'), c: [930, 1230, 2.7] },                                              // insert: wrappers on the table
        { t: m('l03'), c: [520, 1120, 1.85], to: [470, 1100, 2.15], delay: 0.9, d: 0.35, ease: 'out' }, // Sofia medium, punch-in on "doctor"
        { t: m('l04'), c: [900, 960, 2.6], to: [640, 1120, 1.2], delay: noT - m('l04') - 0.05, d: 0.3, ease: 'out', shake: tt => tt > noT ? 7 : 0 }, // Gus CU → snap wide
      ];
      const cam = shotCam(shots, t);
      ctx.save(); applyCam(ctx, cam, t);
      drawBg(ctx, 'kitchen');
      // Gus behind the table, facing Sofia (left)
      const panic = t > noT ? 1 : 0, l04on = t > m('l04');
      const jump = panic ? Math.abs(Math.sin((t - noT) * 11)) * 46 : 0;
      const pain = t < m('l04');
      gus(ctx, GX, GY - jump, GS, {
        face: -1, tie: true,
        lids: l04on ? 0.02 : t > m('l03') ? 0.25 : 0.78,
        neck: l04on ? -0.35 : pain ? 0.45 : 0,
        look: t > m('l01') - 0.2 ? 0.6 : 0,
        wing: panic ? 0.5 + 0.5 * Math.sin(t * 34) : l04on ? 0.6 : 0.15 + 0.05 * Math.sin(t * 2),
        squash: pain && !l04on ? 0.95 + 0.012 * Math.sin(t * 3) : 1,
      }, t);
      kitchenTable(ctx);
      // wrappers: in the insert they pop one by one; Sofia picks one up for l03
      const cs = counts(); const n = t < m('insert') ? 5 : cs.filter(c => t >= c).length;
      if (t < m('insert') || t >= m('l03')) wrappers(ctx, t >= m('l03') ? 4 : 5);
      else { wrappers(ctx, Math.max(0, n)); }
      // Sofia walks in from the left, stops, looks at Gus
      const wk = ease.out(seg(t, m('light') + 0.2, m('l01') + 0.25)), sx = lerp(-380, SX, wk), walking = wk > 0 && wk < 0.98;
      const shock = t > m('l03') ? clamp(1 - Math.max(0, t - wordT('l03', 2, 't1') - 0.4) / 0.6) : 0, firm = t > wordT('l03', 3);
      const lift = t > m('l03') - 0.1;
      sofia(ctx, sx, standHip(SFL, SS), SS, {
        legs: walking ? 'walk' : 'stand', walk: t * 1.9,
        turn: walking ? 0.2 : 0.38, look: [0.75, -0.35],
        brow: { l: 0.25, r: 0.25, worry: t < m('l03') ? 0.8 : 0, angry: firm ? 0.5 : 0 },
        wide: shock * 0.9, mouth: { smile: t < m('l03') ? -0.25 : firm ? -0.1 : 0 },
        armR: lift ? (firm ? [150, -120] : [215, -300]) : null, handR: lift ? 'open' : 'mitten',
        armL: firm ? [-170, -360] : t < m('l03') && t > m('l01') ? [-90, -170] : null, handL: firm ? 'open' : 'mitten',
        holdR: lift && !firm ? (c => wrapper(c, 0, 34, 1.05, 0.2, 5)) : null,
        armsFront: lift,
      }, t);
      // insert overlay: count bubbles over the wrappers
      if (t >= m('insert') && t < m('l03')) cs.forEach((c, i) => { if (t >= c) { const [x, y] = WRAPS[i]; U.textOutlined(ctx, String(i + 1), x, y - 60 - ease.out(clamp((t - c) / 0.2)) * 20, 56, '#FFD23F', { olw: 9 }); } });
      ctx.restore();
      if (t >= m('insert') && t < m('l03')) P.burst(ctx, 1450, 260, 'x5', clamp((t - cs[4]) / 0.9), '#FFD23F', 0.1, 0.8);
      if (panic) P.burst(ctx, 1450, 270, 'HONK!', clamp((t - noT) / 1.2), '#FFD23F', -0.08, 0.9);
      // dark open
      const dk = 1 - k(t, 'light', 0.35);
      if (dk > 0) { ctx.fillStyle = `rgba(10,8,20,${0.95 * dk})`; ctx.fillRect(0, 0, 1920, 1080); }
    },
  };
})();

// ==================================================================== TITLE SLAM
const title = (() => {
  const { m, k, t0, t1 } = mk('title');
  return {
    sfx: [['slam', 0.05, 'slam']],
    draw(ctx, t) {
      const u = t - m('slam');
      // rays background
      ctx.fillStyle = '#1F5FC8'; ctx.fillRect(0, 0, 1920, 1080);
      ctx.save(); ctx.translate(960, 560); ctx.rotate(t * 0.25);
      for (let i = 0; i < 16; i++) { ctx.rotate(Math.PI / 8); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(1400, -170); ctx.lineTo(1400, 170); ctx.closePath(); ctx.fillStyle = i % 2 ? '#2E6FD8' : '#2765CC'; ctx.fill(); }
      ctx.restore();
      // panicking Gus on the right
      const gk = ease.back(clamp((u - 0.15) / 0.35));
      ctx.save(); ctx.translate(1480, 980 + (1 - gk) * 700); drawGus(ctx, 0, 0, 1.05, { face: -1, lids: 0.02, honk: 0.4 + 0.4 * Math.abs(Math.sin(t * 9)), wing: 0.5 + 0.5 * Math.sin(t * 30), neck: -0.3 }); ctx.restore();
      // title text slam
      const sk = clamp(u / 0.28), sc = lerp(2.6, 1, ease.out(sk)), shake = u < 0.45 ? (1 - u / 0.45) * 14 : 0;
      ctx.save(); ctx.translate(720 + noise1(t * 30) * shake, 460 + noise1(t * 30 + 9) * shake); ctx.rotate(-0.05); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sk * 3);
      U.textOutlined(ctx, 'GUS', 0, -40, 190, '#FFFFFF', { olw: 30 });
      U.textOutlined(ctx, 'AT THE DOCTOR', 0, 120, 128, U.ORANGE, { olw: 24 });
      ctx.restore();
      // red-cross stamp
      const st = clamp((u - 0.35) / 0.25);
      if (st > 0) { ctx.save(); ctx.translate(1150, 230); ctx.rotate(0.2); const s = lerp(2, 1, ease.out(st)); ctx.scale(s, s); ctx.globalAlpha = st;
        paint(ctx, c => roundRect(c, -70, -70, 140, 140, 26), '#FFFFFF', { lw: 8 }); ctx.fillStyle = U.RED; ctx.fillRect(-22, -50, 44, 100); ctx.fillRect(-50, -22, 100, 44); ctx.restore(); }
      U.logo(ctx, clamp((u - 0.5) / 0.3));
    },
  };
})();

// ==================================================================== WAITING ROOM
const wait = (() => {
  const { m, t0 } = mk('wait');
  const SX = 480, SHIP = 1262, SS = 0.72, GX = 1030, GY = 1282, GS = 0.9;
  return {
    sfx: [['l05', 0, 'shudder']],
    draw(ctx, t) {
      const shots = [
        { t: t0, c: [1330, 1040, 1.0], to: [1300, 1040, 1.05] },          // wide establishing: chairs, plant, "Dr. Max" door
        { t: m('l05'), c: [1080, 880, 2.8], to: [1085, 880, 2.95] },      // MCU Gus (Sofia only as a sliver at the left edge)
        { t: m('l06'), c: [700, 1000, 1.9] },                             // Sofia medium, Gus at right
        { t: m('l07'), c: [1060, 870, 3.05], to: [1055, 865, 3.3] },        // CU Gus, suspicious squint, slow push
      ];
      const cam = shotCam(shots, t);
      ctx.save(); applyCam(ctx, cam, t);
      drawBg(ctx, 'waiting'); B2.doorLeaf(ctx, 0, 'Dr. Max');
      B2.chair(ctx, SX, '#2E6FD8'); B2.chair(ctx, GX, '#2E6FD8');
      const fidget = t < m('l05') ? noise1(t * 3) : 0;
      sofia(ctx, SX, SHIP, SS, {
        legs: 'sit', turn: 0.36, look: [0.75, -0.3],
        brow: { l: 0.2, r: 0.2, worry: t < m('l06') ? 0.3 : 0 },
        mouth: { smile: t >= m('l06') ? 0.55 : 0.35 },
        armR: t >= m('l06') ? [180, -250] : [70, 10], handR: t >= m('l06') ? 'open' : 'mitten', armL: [-60, 10], armsFront: t >= m('l06'),
      }, t, 2);
      const sus = t >= m('l07');
      gus(ctx, GX, GY, GS, {
        face: -1, lids: sus ? 0.82 : t >= m('l05') ? 0.1 : 0.5,
        neck: sus ? -0.4 : t >= m('l05') ? 0.25 : fidget * 0.4, look: sus ? 0.9 : 0.6,
        wing: t >= m('l05') && !sus ? 0.35 + 0.15 * Math.sin(t * 20) : 0.1 + fidget * 0.15,
        squash: t >= m('l05') && t < m('l06') ? 0.97 : 1,
      }, t);
      ctx.restore();
    },
  };
})();

// ==================================================================== EXAM ROOM — part 1
const exam = (() => {
  const { m, t0, t1 } = mk('exam');
  const SX = 330, SFL = 1500, SS = 0.72, GX = 800, GS = 0.92, DX = 1400, DS = 0.68, DFL = 1500;
  const GY = B2.TABLE.top;
  const counts = () => [0, 2, 3, 4, 6].map(i => wordT('l11', i));
  return {
    sfx: [['door', 0, 'door'], ['door', 0.45, 'run'], ['react', 0.05, 'record'], ['l13', 0, 'boing']],
    sfxAt: () => counts().map(t => ({ t, name: 'pop' })),
    draw(ctx, t) {
      const cs = counts();
      const step = cs.filter(c => t >= c).length; // 0..5 burgers counted
      const shots = [
        { t: t0, c: [1180, 1050, 1.0] },                                              // wide: Sofia, Gus on the table, door
        { t: m('l08'), c: [1480, 1010, 2.3] },                                        // Dr. Max medium (card on the right)
        { t: m('l09'), c: [960, 900, 2.6] },                                          // Gus MCU (card on the right)
        { t: m('l10'), c: [1440, 1060, 2.3] },                                        // Dr. Max writing on the clipboard
        { t: m('l11'), c: [950, 860, 3.1] },                                          // Gus counting (progressive zoom below)
        { t: m('react'), c: [880, 1050, 1.12] },                                      // wide: Sofia & Dr. Max exchange a look
        { t: m('l12'), c: [560, 1040, 2.2] },                                         // Sofia medium, deadpan
        { t: m('l13'), c: [900, 860, 2.7] },                                          // Gus CU, defensive
        { t: m('turn'), c: [880, 1060, 1.1] },                                        // wide for YOUR TURN
      ];
      const cam = shotCam(shots, t);
      if (t >= m('l11') && t < m('react')) { const z = 3.1 + step * 0.1; cam.c[2] = z; cam.c[1] = 860 - step * 6; } // each count: closer
      ctx.save(); applyCam(ctx, cam, t);
      drawBg(ctx, 'exam');
      B2.doorLeaf(ctx, ease.out(seg(t, m('door'), m('door') + 0.55)), null);
      // Dr. Max walks in from the doorway
      const wk = seg(t, m('door') + 0.35, m('door') + 1.75), dx = lerp(2150, DX, ease.inOut(wk)), dWalk = wk > 0 && wk < 1;
      const stepBob = dWalk ? -Math.abs(Math.sin(t * Math.PI * 3.4)) * 14 : 0; // walk read via step bounce (rig walk-legs not used)
      const talking = t >= m('l08'), writing = t >= m('l10') && t < m('react');
      const react = t >= m('react') && t < m('l12'), yt = t >= m('turn');
      const dLookGus = { turn: -0.32, look: [-0.65, -0.2] };
      let dp;
      if (t < m('l08')) dp = { turn: wk < 1 ? -0.1 : -0.25, look: [-0.5, 0], mouth: { smile: 0.55 }, lean: dWalk ? -0.03 : 0 };
      else if (t < m('l10')) dp = Object.assign({}, dLookGus, { mouth: { smile: 0.6 }, browL: 0.35, browR: 0.35, armL: t < wordT('l08', 1, 't1') + 0.5 ? [-190, -350] : null, handL: 'open' });
      else if (writing) dp = Object.assign({}, dLookGus, { look: t > m('l10_end') ? [-0.5, 0.35] : [-0.65, -0.2], browL: 0.65, browR: 0.2, mouth: { smile: 0.3 }, clipboard: false, armsFront: true, armR: [50, -80], holdR: (c, s, a) => drawClipboard(c, s, a), armL: [-20, -100], holdL: (c, s, a) => drawPen(c, s, a) });
      else if (react) dp = { turn: -0.45, look: [-1, -0.05], browL: 0.9, browR: 0.9, mouth: { smile: 0.1 }, clipboard: true };
      else if (yt) dp = { turn: 0, look: [0, 0], mouth: { smile: 0.75 }, browL: 0.3, browR: 0.3 };
      else dp = Object.assign({}, dLookGus, { mouth: { smile: 0.2 }, browL: 0.5, browR: 0.5 });
      if (t >= m('door') + 0.3) drmax(ctx, dx, DFL + stepBob, DS, dp, t);
      // exam table + Gus on it
      B2.examTable(ctx);
      const toSofia = t >= m('l12') && !yt;
      const dram = t >= m('l09') && t < m('l10');
      const guilty = t >= m('l11') && t < m('l13');
      const def = t >= m('l13') && !yt;
      const countLift = guilty && t < m('react') ? clamp(1 - (t - (cs[step - 1] || 0)) / 0.35) * (step > 0) : 0;
      gus(ctx, GX, GY, GS, {
        face: toSofia ? -1 : 1,
        lids: dram ? 0.08 : def ? 0.2 : guilty ? 0.72 : yt ? 0.55 : 0.5,
        neck: dram ? -0.25 : def ? -0.35 : guilty ? 0.35 : 0,
        look: t < m('l08') ? 0.7 : toSofia ? 0.85 : guilty ? -0.4 : yt ? 0 : 0.6,
        wing: dram ? 0.55 + 0.1 * Math.sin(t * 18) : def ? 0.9 : guilty ? 0.15 + countLift * 0.6 : 0.1,
        squash: dram ? 0.97 : 1,
      }, t);
      // Sofia standing at the left, watching Gus (he is up on the table → eyes up)
      const cross = t >= m('l12') && !yt;
      sofia(ctx, SX, standHip(SFL, SS), SS, {
        turn: yt ? 0 : react ? 0.45 : t < m('l08') ? 0.42 : 0.32,
        look: yt ? [0, 0] : react ? [1, -0.05] : t < m('l08') ? [0.85, 0] : [0.6, -0.45],
        brow: { l: react ? 0.9 : 0.15, r: react ? 0.9 : 0.15 },
        sleepy: cross ? 0.42 : 0, mouth: { smile: cross ? -0.12 : react ? 0.05 : yt ? 0.85 : 0.45 },
        armL: cross ? [75, -105] : null, armR: cross ? [-70, -95] : null, armsFront: cross,
      }, t, 3);
      ctx.restore();
      // big count numbers while Gus counts (screen space, next to his head)
      if (t >= m('l11') && t < m('react') && step > 0) {
        const c = cs[step - 1], kk = clamp((t - c) / 0.25);
        ctx.save(); ctx.translate(1500, 330); ctx.rotate(0.06); const s = lerp(1.8, 1, ease.out(kk)); ctx.scale(s, s);
        U.textOutlined(ctx, String(step), 0, 60, 190, step === 5 ? U.RED : '#FFD23F', { olw: 26 });
        ctx.restore();
        for (let i = 0; i < step; i++) { ctx.save(); ctx.translate(1340 + i * 84, 600); wrapper(ctx, 0, 0, 0.62, i * 0.7, i + 1); ctx.restore(); }
      }
    },
  };
})();

// ==================================================================== shared exam-room staging (parts 2 + diagnosis)
// Dr. Max now stands right next to the table so his hand can hover at Gus's tummy.
const EX = { SX: 330, SFL: 1500, SS: 0.72, GX: 800, GS: 0.92, DX: 1130, DS: 0.68, DFL: 1500 };
function examRoom(ctx, t, cam, dp, gp, sp, cheat = 0) { // cheat: in Gus close-ups Dr. Max/Sofia are nudged out of frame (classic CU cheat)
  ctx.save(); applyCam(ctx, cam, t);
  drawBg(ctx, 'exam'); B2.doorLeaf(ctx, 1, null);
  B2.examTable(ctx);
  gus(ctx, EX.GX, B2.TABLE.top, EX.GS, gp, t);
  drmax(ctx, EX.DX + cheat * 170, EX.DFL, EX.DS, dp, t);
  sofia(ctx, EX.SX - cheat * 60, standHip(EX.SFL, EX.SS), EX.SS, sp, t, 3);
  ctx.restore();
}
// local arm target for Dr. Max that puts his hand at a world point
const drTarget = (wx, wy) => [(wx - EX.DX) / EX.DS, (wy - (EX.DFL - 280 * EX.DS)) / EX.DS];
const BELLY = [990, 1120]; // just in front of Gus's tummy — the hand hovers here and never touches
const sofiaWatch = { turn: 0.32, look: [0.6, -0.45], mouth: { smile: 0.45 } };
const drAtGus = { turn: -0.32, look: [-0.7, -0.15] };

const exam2 = (() => {
  const { m, t0 } = mk('exam2');
  return {
    sfx: [['mouth', 0, 'boing'], ['poke', 0, 'slide'], ['l18', 0, 'honk'], ['beat', 0.1, 'tick'], ['beat', 0.6, 'tick'], ['reaction', 0.2, 'sadhonk']],
    draw(ctx, t) {
      const shots = [
        { t: t0, c: [1060, 1030, 2.1] },                                         // Dr. Max asks, Gus in frame left
        { t: m('mouth'), c: [830, 840, 3.1], to: [830, 820, 3.6], d: 0.35, ease: 'out' }, // HUGE beak, fast push
        { t: m('l15'), c: [1190, 1000, 2.6] },                                   // Dr. Max surprised lean-back
        { t: m('l16'), c: [420, 1010, 2.6] },                                    // Sofia laughing
        { t: m('l17'), c: [1000, 1080, 2.0] },                                   // two-shot: hand moves toward the tummy
        { t: m('l18'), c: [830, 840, 3.3], shake: tt => tt < m('l18_end') ? 10 : 0 }, // Gus screams
        { t: m('beat'), c: [1050, 1040, 2.5], to: [1060, 1030, 2.62], d: 2.4 },  // hold still on Dr. Max + hovering hand, then the line
        { t: m('reaction'), c: [860, 1060, 1.12] },                              // wide reaction
      ];
      const cam = shotCam(shots, t);
      const open = t >= m('mouth') && t < m('l16') + 0.4;
      const reach = seg(t, m('poke'), m('poke') + 0.5), retract = seg(t, m('reaction') + 0.2, m('reaction') + 0.8);
      const hover = ease.inOut(reach) * (1 - ease.inOut(retract));
      const scream = t >= m('l18') && t < m('beat') + 0.3, frozen = t >= m('beat');
      const laugh = t >= m('l16') && t < m('l17');
      const dp = Object.assign({}, drAtGus, { mouth: { smile: 0.35 }, browL: 0.3, browR: 0.3 });
      if (t < m('mouth')) Object.assign(dp, { armL: [-165, -235], handL: 'open', armsFront: true }); // open-palm 'please' gesture, not touching
      if (t >= m('mouth') && t < m('l16')) Object.assign(dp, { surprise: 1, lean: 0.07, browL: 1, browR: 1, wide: 0.5, mouth: { open: 0.35, smile: 0, w: 1.1 } });
      if (hover > 0) Object.assign(dp, { armL: [lerp(-150, drTarget(...BELLY)[0], hover), lerp(-20, drTarget(...BELLY)[1], hover)], handL: 'open', armsFront: true, clipboard: true });
      if (frozen && t < m('reaction')) Object.assign(dp, { mouth: { smile: -0.05, w: 0.75 }, browL: 0.15, browR: 0.15, blink: t < m('l19') ? 0.25 : 0 });
      if (t >= m('reaction')) Object.assign(dp, { mouth: { smile: 0.55 }, browL: 0.35, browR: 0.35 });
      const gp = { face: 1, look: 0.6, lids: 0.5, neck: 0, wing: 0.1 };
      if (open) Object.assign(gp, { honk: 2.3, lids: 0.0, neck: -0.2 });
      if (t >= m('l17') && t < m('l18')) Object.assign(gp, { lids: 0.3, look: 0.2, neck: -0.1 });
      if (scream) Object.assign(gp, { lids: 0, honk: 1.2, wing: 0.6 + 0.4 * Math.sin(t * 36), neck: -0.5, squash: 0.96 });
      if (frozen && !scream) Object.assign(gp, { lids: 0.02, wing: 0.35, neck: -0.45, look: 0.9 });
      if (t >= m('turn')) Object.assign(gp, { lids: 0.55, wing: 0.1, neck: 0, look: 0 });
      const sp = Object.assign({}, sofiaWatch);
      if (laugh || (t >= m('reaction') && t < m('turn'))) Object.assign(sp, { happyEyes: 1, mouth: { smile: 1, open: laugh ? 0.5 : 0.2 }, armL: [-40, -330], handL: 'mitten', armsFront: true, bob: Math.sin(t * 14) * 4 });
      if (open && !laugh) Object.assign(sp, { wide: 0.5, brow: { l: 0.7, r: 0.7 } });
      if (t >= m('turn')) Object.assign(sp, { turn: 0, look: [0, 0], happyEyes: 0, mouth: { smile: 0.85 }, armL: null, armsFront: false });
      const gusCU = (t >= m('mouth') && t < m('l15')) || (t >= m('l18') && t < m('beat'));
      examRoom(ctx, t, cam, dp, gp, sp, gusCU ? 1 : 0);
      if (open && t < m('l15')) P.burst(ctx, 1450, 260, 'AAAH', clamp((t - m('mouth')) / 1.1), '#FFD23F', -0.06, 0.8);
    },
  };
})();

const diag = (() => {
  const { m, t0 } = mk('diag');
  return {
    sfx: [['l23', 0.1, 'sadhonk']],
    draw(ctx, t) {
      const shots = [
        { t: t0, c: [1190, 1000, 2.3] },                         // Dr. Max: diagnosis
        { t: m('l21'), c: [830, 840, 3.3], to: [830, 835, 3.45] }, // Gus hopeful
        { t: m('l22'), c: [1190, 1000, 2.3] },                   // Dr. Max: "No." head shake
        { t: m('l23'), c: [830, 840, 3.3], to: [830, 825, 3.7], d: 0.4, ease: 'out', shake: tt => tt < m('l23') + 1.2 ? 8 : 0 }, // Gus horrified
      ];
      const cam = shotCam(shots, t);
      const shake = t >= m('l22') && t < wordT('l22', 0, 't1') + 0.5 ? Math.sin((t - m('l22')) * 18) * 0.28 : 0;
      const dp = Object.assign({}, drAtGus, { clipboard: false, mouth: { smile: 0.25 }, browL: 0.25, browR: 0.25, armR: [130, -120], handR: 'open', armL: t < m('l21') ? drTarget(980, 1060) : null, handL: 'open', armsFront: true });
      dp.turn += shake;
      const gp = { face: 1, look: 0.6, lids: 0.6, neck: 0.25, wing: 0.1 };
      if (t >= m('l21') && t < m('l22')) Object.assign(gp, { lids: 0.0, neck: 0.1, look: 0.8 });
      if (t >= m('l22') && t < m('l23')) Object.assign(gp, { lids: 0.35, neck: 0, look: 0.6 });
      if (t >= m('l23')) Object.assign(gp, { lids: 0.0, wing: 1, neck: -0.5, honk: 0.6, look: 0.4 });
      const gusCU = (t >= m('l21') && t < m('l22')) || t >= m('l23');
      examRoom(ctx, t, cam, dp, gp, sofiaWatch, gusCU ? 1 : 0);
    },
  };
})();

// ==================================================================== OUTSIDE — sunny street, Gus feels better
const outside = (() => {
  const { m, t0 } = mk('outside');
  return {
    sfx: [['honk', 0, 'honk'], ['l27', 0, 'thud']],
    draw(ctx, t) {
      const shots = [
        { t: t0, c: [1150, 1060, 1.0], to: [1300, 1060, 1.05] },            // wide: walking away from the clinic
        { t: m('l24'), c: [1230, 1090, 1.7] },                              // two-shot
        { t: m('l26'), c: [1060, 1050, 3.0], to: [1070, 1045, 3.3] },         // Gus leans in, push
        { t: m('honk'), c: [1230, 1090, 1.7] },                             // snap back on the honk
        { t: m('l27'), c: [1470, 1000, 2.4], to: [1470, 980, 2.9], d: 0.25, ease: 'out' }, // Sofia facepalm, quick zoom
      ];
      const cam = shotCam(shots, t);
      ctx.save(); applyCam(ctx, cam, t);
      drawBg(ctx, 'street');
      const wk = ease.out(seg(t, t0, m('l24') - 0.1)), walking = wk < 0.98;
      const gx = lerp(480, 1000, wk), sx = lerp(820, 1460, wk);
      const lean = t >= m('l26') && t < m('honk') + 0.1, hk = t >= m('honk') ? clamp(1.2 - (t - m('honk')) * 1.6) : 0;
      const happy = t >= m('l25') && t < m('l26');
      gus(ctx, gx, 1500 - (happy ? Math.abs(Math.sin(t * 8)) * 26 : 0), 0.92, {
        face: 1, walking, walk: t * 2.2, look: 0.7, lids: lean ? 0.62 : happy ? 0.2 : 0.45,
        neck: lean ? 0.75 : 0, wing: happy ? 0.5 : hk, honk: hk,
      }, t);
      const palm = t >= m('l27');
      const cheatS = t >= m('l26') && t < m('honk') ? 240 : 0; // Gus CU: keep Sofia's face out of frame
      sofia(ctx, sx + cheatS, standHip(1500, 0.74), 0.74, {
        legs: walking ? 'walk' : 'stand', walk: t * 1.9,
        turn: -0.36, look: [-0.75, -0.2], mouth: { smile: palm ? -0.3 : 0.7 },
        brow: palm ? { l: 0.2, r: 0.2, angry: 0.6 } : { l: 0.2, r: 0.2 }, sleepy: palm ? 0.6 : 0,
        armR: palm ? [40, -430] : null, handR: palm ? 'open' : 'mitten', armsFront: palm,
      }, t, 4);
      ctx.restore();
      if (t >= m('honk') && t < m('l27') + 0.4) P.burst(ctx, 560, 260, 'HONK!', clamp((t - m('honk')) / 1.0), '#FFD23F', -0.08, 0.85);
    },
  };
})();

// ==================================================================== RECAP (ep1 layout, 4 phrases)
const recap = (() => {
  const { m } = mk('recap');
  const U2 = require('./ui2');
  const items = [["What's the problem?", 'question'], ['My stomach hurts.', 'tummy'], ['Does it hurt here?', 'point'], ['I feel better!', 'smile']];
  return {
    sfx: [['l28', 0, 'quizjingle'], ...[1, 2, 3, 4].map(i => ['r' + i, 0, 'pop'])],
    draw(ctx, t) {
      const g = ctx.createLinearGradient(0, 0, 0, 1080); g.addColorStop(0, '#E4F2EE'); g.addColorStop(1, '#CDEBD3'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1920, 1080);
      ctx.save(); ctx.globalAlpha = 0.5; for (let i = 0; i < 14; i++) { ctx.beginPath(); ctx.arc(hash(i) * 1920, (hash(i + 3) * 1080 + t * 25 * (0.5 + hash(i))) % 1080, 30 + hash(i + 7) * 50, 0, 7); ctx.fillStyle = ['#FFE08A', '#FFFFFF', '#FFD0DB'][i % 3]; ctx.fill(); } ctx.restore();
      U.textOutlined(ctx, 'AT THE DOCTOR', 960, 125, 96, U.ORANGE, { olw: 18 });
      ctx.font = '700 42px ' + F.EN; ctx.fillStyle = OL; ctx.textAlign = 'center'; ctx.fillText('Say it with Sofia!', 960, 188);
      items.forEach(([txt, ic], i) => {
        const id = 'r' + (i + 1), Ln = L(id); const ak = ease.back(clamp((t - Ln.t0 + 0.7) / 0.25)); if (ak <= 0) return;
        const nextT = i < 3 ? L('r' + (i + 2)).t0 : Ln.t1 + 4;
        const active = t >= Ln.t0 - 0.7 && t < nextT - 0.7;
        const y = 300 + i * 165;
        ctx.save(); ctx.translate(960 + (1 - ak) * 900, y); const s = active ? 1.05 : 0.95; ctx.scale(s, s);
        paint(ctx, c => roundRect(c, -440, -64, 880, 128, 40), active ? '#FFFFFF' : 'rgba(255,255,255,0.75)', { lw: 6 });
        paint(ctx, c => c.arc(-370, 0, 44, 0, 7), active ? U.ORANGE : '#F3EAE2', { lw: 5 });
        ctx.font = '700 44px ' + F.EN; ctx.fillStyle = active ? '#fff' : OL; ctx.textAlign = 'center'; ctx.fillText(String(i + 1), -370, 16);
        U2.icon(ctx, ic, 370, 0, 0.8);
        ctx.font = '700 60px ' + F.EN; ctx.fillStyle = OL; ctx.textAlign = 'left'; ctx.fillText(txt, -300, 21);
        if (t > Ln.t1 && t < nextT - 0.7) { paint(ctx, c => roundRect(c, 150, -100, 210, 50, 25), U.GREEN, { lw: 4 }); ctx.font = '700 30px ' + F.EN; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText('YOUR TURN', 255, -64); }
        ctx.restore();
      });
      sofia(ctx, 170, 1230, 0.72, { armR: [200, -380], handR: 'open', mouth: { smile: 0.9 }, look: [0.6, -0.5], turn: 0.2 }, t, 10);
      gus(ctx, 1780, 1110, 0.72, { face: -1, lids: 0.55, neck: Math.sin(t * 3) * 0.2, look: -0.6 }, t);
    },
  };
})();

// ==================================================================== QUIZ (ep1 layout)
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
      paint(ctx, c => roundRect(c, 410, 180, 1100, 150, 40), '#FFFFFF', { lw: 8 });
      ctx.font = '700 60px ' + F.EN; ctx.fillStyle = OL; ctx.textAlign = 'center'; ctx.fillText("Why does Gus's stomach hurt?", 960, 278);
      ctx.restore();
      const ans = t > m('answer');
      [['A', 'He ate too much.', 0], ['B', 'He has a headache.', 0.4]].forEach(([Lt, txt, d], i) => {
        const ok = ease.back(clamp((t - m('opts') - d) / 0.35)); if (ok <= 0) return;
        const good = i === 0, y = 470 + i * 190;
        ctx.save(); ctx.translate(960, y); const s = ok * 0.9 * (ans ? (good ? 1.08 + 0.03 * Math.sin(t * 8) : 0.9) : 1); ctx.scale(s, s);
        paint(ctx, c => roundRect(c, -460, -85, 920, 170, 44), ans ? (good ? '#7BD88F' : '#E8DCD2') : '#FFFFFF', { lw: 8 });
        paint(ctx, c => c.arc(-370, 0, 58, 0, 7), i ? '#5BB8F0' : U.ORANGE, { lw: 7 });
        U.textOutlined(ctx, Lt, -370, 24, 72, '#FFFFFF', { olw: 10 });
        ctx.font = '700 60px ' + F.EN; ctx.fillStyle = ans && !good ? '#A39188' : OL; ctx.textAlign = 'left'; ctx.fillText(txt, -280, 21);
        if (ans && good) paint(ctx, c => { c.moveTo(330, 0); c.lineTo(365, 38); c.lineTo(425, -40); }, 'rgba(0,0,0,0)', { lw: 16, ol: '#1E7A3A' });
        ctx.restore();
      });
      if (t > m('count') && t < m('answer')) {
        const n = 3 - Math.floor(t - m('count')), f = (t - m('count')) % 1;
        ctx.save(); ctx.translate(1600, 560); const s = 1.4 - ease.out(Math.min(1, f * 3)) * 0.4; ctx.scale(s, s);
        paint(ctx, c => c.arc(0, 0, 90, 0, 7), '#FFFFFF', { lw: 8 }); U.textOutlined(ctx, String(Math.max(1, n)), 0, 38, 110, U.RED, { olw: 14 });
        ctx.restore();
      }
      sofia(ctx, 230, 1230, 0.72, { armR: [200, -400], handR: 'open', armL: [-130, -80], mouth: { smile: 0.9 }, brow: { l: 0.5, r: 0.5 }, look: [0.8, -0.4], turn: 0.2 }, t, 5);
      const sad = ans ? clamp((t - m('answer') - 0.3) / 0.4) : 0;
      // Gus votes B (of course) — sign text un-mirrored with scale(face,1)
      gus(ctx, 1700, 1110, 0.75, { face: -1, lids: lerp(0.6, 0.8, sad), look: -0.5, neck: -sad * 0.6, hold: (c, face, H) => { c.translate(H.hx + 128, H.hy + 26); c.rotate(sad * 0.35 + Math.sin(t * 3) * 0.05); line(c, [[0, 0], [0, 40]], 5, OL); c.scale(face, 1); paint(c, q => roundRect(q, -66, 40, 132, 132, 14), '#FFFFFF', { lw: 6 }); U.textOutlined(c, 'B', 0, 140, 96, '#5BB8F0', { olw: 12 }); } }, t);
      if (ans) for (let i = 0; i < 80; i++) { const ph = (t - m('answer')) * (0.5 + hash(i) * 0.5); if (ph > 2.5) continue; const x = hash(i * 3) * 1920, y = -50 + ph * 450 + hash(i * 5) * 150; ctx.save(); ctx.translate(x + Math.sin(ph * 6 + i) * 30, y); ctx.rotate(ph * 8 + i); ctx.fillStyle = ['#FF7A2F', '#3DAA6E', '#5BB8F0', '#E5484D', '#FFD23F'][i % 5]; ctx.fillRect(-10, -5, 20, 10); ctx.restore(); }
    },
  };
})();

// ==================================================================== OUTRO + end screen
const outro = (() => {
  const { m, t1 } = mk('outro');
  return {
    sfx: [['l29', 0.3, 'pop'], ['honk', 0, 'honk'], ['l30', 0.6, 'click'], ['endscreen', 0, 'sparkle']],
    draw(ctx, t) {
      const end = t >= m('endscreen');
      const shots = [{ t: m('l29'), c: [1150, 1100, 1.25], to: [1140, 1100, 1.32], d: 8 }, { t: m('endscreen'), c: [900, 1060, 1.0] }];
      ctx.save(); applyCam(ctx, shotCam(shots, t), t);
      drawBg(ctx, 'street');
      const bye = t >= m('l30');
      const hk = t > m('honk') ? clamp(1.2 - (t - m('honk')) * 1.4) : 0;
      gus(ctx, 1060, 1500, 0.92, { face: 1, lids: 0.55, look: t >= m('l31') ? 0 : 0.6, honk: hk, wing: hk + (t >= m('l31') ? 0.4 + 0.3 * Math.sin(t * 12) : 0) }, t);
      sofia(ctx, 1420, standHip(1500, 0.76), 0.76, { turn: bye ? 0 : -0.15, look: bye ? [0, 0] : [0, 0], armR: bye ? [210 + Math.sin(t * 10) * 40, -420] : [160, -150], handR: 'open', armL: [-150, -80], mouth: { smile: 0.95 }, brow: { l: 0.4, r: 0.4 } }, t, 11);
      ctx.restore();
      if (end) { ctx.fillStyle = `rgba(255,246,230,${0.55 * clamp((t - m('endscreen')) / 0.5)})`; ctx.fillRect(0, 0, 1920, 1080); }
      // fill-in comment bubble
      const ck = ease.back(clamp((t - m('l29') - 0.3) / 0.4)) * (end ? 1 - clamp((t - m('endscreen')) / 0.3) : 1);
      if (ck > 0) {
        ctx.save(); ctx.translate(560, 300); ctx.scale(ck * 0.8, ck * 0.8);
        paint(ctx, c => roundRect(c, -440, -170, 880, 330, 50), '#FFFFFF', { lw: 8 });
        ctx.font = '700 84px ' + F.EN; ctx.fillStyle = OL; ctx.textAlign = 'center'; ctx.fillText('My ______ hurts.', 0, -20);
        U.textOutlined(ctx, 'Write your answer in the comments!', 0, 90, 46, U.ORANGE, { olw: 8 });
        ctx.restore();
      }
      if (bye && !end) {
        const sk = ease.back(clamp((t - m('l30')) / 0.4)), pressed = t > m('l30') + 0.6;
        ctx.save(); ctx.translate(470, 760); ctx.scale(sk * 0.85, sk * 0.85);
        paint(ctx, c => roundRect(c, -260, -70, 520, 140, 70), pressed ? '#9C8A82' : U.RED, { lw: 8 });
        U.textOutlined(ctx, pressed ? 'SUBSCRIBED' : 'SUBSCRIBE', 0, 22, 66, '#FFFFFF', { olw: 10 });
        ctx.restore();
        const ck2 = clamp((t - m('l30') - 0.2) / 0.4);
        U.tapCursor(ctx, lerp(800, 550, ease.out(ck2)), lerp(1000, 790, ease.out(ck2)), 1, clamp((t - m('l30') - 0.6) / 0.3));
      }
      if (end) { // end screen: empty slots where YouTube puts the "next video" + subscribe elements
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

module.exports = { hook, title, wait, exam, exam2, diag, outside, recap, quiz, outro };
