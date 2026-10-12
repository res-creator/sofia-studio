// Episode 4 — "Gus at the Hotel". Inside a scene every shot change is a HARD CUT; scene-to-scene transitions live in render.js.
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
const B3 = require('../ep3/bg3');
const B4 = require('./bg4');
const PR = require('./props3');
const VOC = require('./vocab');
const U3 = require('./ui3');

const cache = {};
const img = n => (cache[n] = cache[n] || B4[n]());
function drawBg(ctx, n) { ctx.drawImage(img(n), 0, 0, B4.WW, B4.HH); }
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
  p.tilt = (p.tilt || 0) + Math.sin(t * 0.9 + seed * 1.7) * 0.012; // alive even when silent
  drawSofia(ctx, x, hipY, s, p);
}
const standHip = (floorY, s) => floorY - 262 * s;
function gus(ctx, x, footY, s, p, t, who = 'gus') {
  const lvl = talk(who, t);
  const sq = (p.squash || 1) * (1 + Math.sin(t * 1.9) * 0.006) * (1 - 0.025 * Math.max(0, lvl - 0.6) / 0.4);
  drawGus(ctx, x, footY, s, Object.assign({}, p, { honk: Math.max(p.honk || 0, lvl * 0.75), squash: sq }));
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
  p.tilt = (p.tilt || 0) + Math.sin(t * 0.8 + seed) * 0.01;
  drawCrew(ctx, x, floorY - 280 * s - (pose.hop || 0), s, p, who);
}
// natural arm target: side -1/+1, deg from hanging-down (0) via horizontal (90) to straight up (180), ext 0.75..0.95 of full arm length.
// Near-straight arms avoid the 'chicken wing' (elbow up, hand down) that short IK reaches give. rig 'c' = crew (longer arms).
const A = (side, deg, ext = 0.9, rig = 's') => { const sh = rig === 'c' ? [95, -250] : [90, -236], len = rig === 'c' ? 243 : 230, a = deg * Math.PI / 180; return [side * sh[0] + side * Math.sin(a) * len * ext, sh[1] + Math.cos(a) * len * ext]; };
const GS = require('../lib/anim/gestures');
const W2 = (t, a, b) => GS.win(t, a, b, 0.25);
const sunset = (ctx, a) => { ctx.fillStyle = `rgba(10,8,20,${a})`; ctx.fillRect(0, 0, 1920, 1080); };


// ---- little props (ep4)
function keyCard(c, X, Y, s = 1, rot = 0) { c.save(); c.translate(X, Y); c.rotate(rot); c.scale(s, s); paint(c, q => roundRect(q, -50, -32, 100, 64, 8), '#2E6FD8', { shade: '#2459B2', sx: 4, sy: 4, lw: 6 }); c.fillStyle = '#F2C744'; c.fillRect(-36, -18, 22, 18); line(c, [[-36, 18], [36, 18]], 5, '#FFFFFF'); c.restore(); }
function cart(c, X, Y, s = 1, bags = 2) { // luggage cart, bottom centre
  c.save(); c.translate(X, Y); c.scale(s, s);
  for (let i = 0; i < bags; i++) PR.suitcase(c, -50 + i * 100, -150, 0.34, { open: 0, col: i ? '#2E6FD8' : '#E5484D', sh: i ? '#2459B2' : '#B8323A' });
  line(c, [[-170, -300], [-170, -40]], 9, '#C79A2A'); line(c, [[170, -300], [170, -40]], 9, '#C79A2A'); line(c, [[-170, -300], [170, -300]], 9, '#C79A2A');
  paint(c, q => roundRect(q, -190, -160, 380, 22, 8), '#C79A2A', { lw: 6 });
  for (const wx of [-130, 130]) paint(c, q => q.arc(wx, -20, 22, 0, 7), '#3A3F4A', { lw: 6 });
  c.restore();
}
const lerp2 = (a, b, k) => a + (b - a) * clamp(k);
const walkK = (t, a, b) => { const k = clamp((t - a) / (b - a)); return { k, e: ease.inOut(k), on: k > 0 && k < 0.98 }; };
function sweat(ctx, X, Y, t, k) { if (k <= 0) return; for (let i = 0; i < 3; i++) { const ph = (t * 1.3 + i / 3) % 1; ctx.save(); ctx.globalAlpha = k * Math.sin(ph * Math.PI); ctx.translate(X + (i - 1) * 46, Y + ph * 70); ctx.fillStyle = '#7FD0FF'; ctx.beginPath(); ctx.moveTo(0, -16); ctx.quadraticCurveTo(10, 4, 0, 10); ctx.quadraticCurveTo(-10, 4, 0, -16); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = OL; ctx.stroke(); ctx.restore(); } }
function insert(ctx, t, k, kind) { // full-screen close-up of the booking screen / the bill
  ctx.fillStyle = '#F4E4C8'; ctx.fillRect(0, 0, 1920, 1080);
  ctx.fillStyle = '#E9D2A8'; for (let i = 0; i < 12; i++) ctx.fillRect(0, i * 100 + 40, 1920, 6);
  const z = 1 + 0.04 * k; ctx.save(); ctx.translate(960, 540); ctx.scale(z, z); ctx.rotate(-0.02);
  if (kind === 'screen') {
    paint(ctx, q => roundRect(q, -700, -400, 1400, 800, 34), '#2B2F3A', { lw: 9 }); paint(ctx, q => roundRect(q, -660, -360, 1320, 720, 14), '#EAF3FB', { lw: 0 });
    ctx.fillStyle = '#7A2432'; ctx.fillRect(-660, -360, 1320, 90); ctx.fillStyle = '#F2C744'; ctx.font = `800 54px ${F.EN}`; ctx.textAlign = 'left'; ctx.fillText('HOTEL PATO REAL - BOOKING', -620, -298);
    const rows = [['NAME', 'GUS GOOSE'], ['ROOM', '404 - 2 NIGHTS'], ['GUESTS', '1 PERSON + 1 GOOSE'], ['EXTRA', '+ 20 BURGERS']];
    rows.forEach(([a, b], i) => { const y = -170 + i * 120, on = clamp((t - 0.3 * i) / 0.4) ; ctx.globalAlpha = 0.25 + 0.75 * on; ctx.fillStyle = '#8A6A5C'; ctx.font = `700 40px ${F.EN}`; ctx.fillText(a, -620, y); ctx.fillStyle = i === 3 ? '#E5484D' : OL; ctx.font = `800 62px ${F.EN}`; ctx.fillText(b, -300, y + 4); ctx.globalAlpha = 1; });
    const blink = Math.sin(t * 8) > 0 ? 1 : 0; ctx.fillStyle = OL; ctx.fillRect(250 + 0, 150, 6 * blink, 0);
    PR.burger(ctx, 540, 280, 1.6 + 0.08 * Math.sin(t * 6), 0.15);
  } else {
    ctx.rotate(0.03); paint(ctx, q => roundRect(q, -420, -430, 840, 860, 20), '#FFFFFF', { shade: '#EFE6D8', sx: 8, sy: 8, lw: 8 });
    ctx.fillStyle = '#7A2432'; ctx.font = `800 60px ${F.EN}`; ctx.textAlign = 'center'; ctx.fillText('BILL', 0, -340); line(ctx, [[-360, -310], [360, -310]], 6, OL);
    const rows = [['1 key card', '(eaten)'], ['50 breakfasts', '(eaten)'], ['20 burgers', '(not eaten!)']];
    rows.forEach(([a, b], i) => { const y = -200 + i * 130, on = clamp((t - 0.5 * i) / 0.4); ctx.globalAlpha = 0.2 + 0.8 * on; ctx.fillStyle = OL; ctx.font = `800 58px ${F.EN}`; ctx.textAlign = 'left'; ctx.fillText(a, -360, y); ctx.fillStyle = '#E5484D'; ctx.font = `700 44px ${F.EN}`; ctx.textAlign = 'right'; ctx.fillText(b, 360, y + 52); ctx.globalAlpha = 1; });
    line(ctx, [[-360, 210], [360, 210]], 6, OL); ctx.fillStyle = OL; ctx.font = `800 64px ${F.EN}`; ctx.textAlign = 'left'; ctx.fillText('TOTAL', -360, 300); ctx.fillStyle = '#E5484D'; ctx.textAlign = 'right'; ctx.fillText('A LOT!', 360, 300);
  }
  ctx.restore();
}
const gusSit = (ctx, x, footY, p, t) => gus(ctx, x, footY, 0.86, Object.assign({ face: 1 }, p), t);

// ==================================================================== 1. DOOR — revolving door
const door = (() => {
  const { m } = mk('door');
  const D = B4.DOOR, CX = D.x, FL = 1500, R = 150;
  // integrate angular speed once (table, 120 Hz) so the pose is a pure function of t
  const t0 = () => m('spin'), t1 = () => m('stop');
  const omega = t => { if (t < t0()) return 0; const u = t - t0(); const w = 2.2 + 3.2 * clamp(u / 5); return t > t1() ? w * clamp(1 - (t - t1()) / 0.9) : w; };
  const tab = []; (function () { let th = 0; for (let i = 0; i <= 120 * 18; i++) { const t = i / 120; tab.push(th); th += omega(t) / 120; } })();
  const theta = t => tab[Math.min(tab.length - 1, Math.max(0, Math.round(t * 120)))];
  const panels = (ctx, th, front) => {
    for (let i = 0; i < 3; i++) {
      const a = th + i * Math.PI * 2 / 3, x = CX + Math.sin(a) * 250, isFront = Math.cos(a) > 0; if (isFront !== front) continue;
      const w = Math.sin(a) * 250, X0 = Math.min(CX, x), W0 = Math.abs(w);
      ctx.fillStyle = 'rgba(190,225,245,0.22)'; ctx.fillRect(X0, FL - D.h + 20, W0, D.h - 20);
      line(ctx, [[x, FL - D.h + 20], [x, FL]], 12, '#C79A2A'); line(ctx, [[CX, FL - D.h + 20], [CX, FL]], 8, '#C79A2A');
    }
  };
  const gusPos = t => { const th = theta(t), phi = th + Math.PI / 3 - Math.PI / 2; return { x: CX + Math.sin(phi) * 110, front: Math.cos(phi) > 0, face: Math.cos(phi) > 0 ? 1 : -1 }; };
  return {
    sfx: [['spin', 0, 'revolve'], ['spin', 2.6, 'revolve'], ['stop', 0.4, 'poof'], ['l04', 0.1, 'sadhonk']],
    draw(ctx, t) {
      const spinning = t >= t0() && t < t1() + 0.9, out = t >= t1() + 0.6;
      const shots = [{ t: 0, c: [1300, 1130, 1.1], to: [1250, 1130, 1.18] }, { t: m('l01') + 1.0, c: [800, 1150, 1.7], to: [840, 1150, 1.75] }, { t: m('spin'), c: [1440, 1080, 1.55], to: [1440, 1080, 1.85], d: 7 },
        { t: m('l03'), c: [1100, 1130, 1.35], to: [1120, 1130, 1.4], d: 3 }, { t: m('l04'), c: [1440, 1080, 1.9] }, { t: m('stop') + 0.2, c: [1180, 1130, 1.4], to: [1120, 1130, 1.3] }];
      ctx.save(); applyCam(ctx, shotCam(shots, t), t);
      drawBg(ctx, 'entrance');
      const th = theta(t), g = gusPos(t), inDoor = t >= t0() && !out;
      // Gus walks to the door during l01
      const wk = walkK(t, 0.9, m('spin') + 0.0);
      if (!inDoor && !out) gus(ctx, lerp(560, CX - 110, wk.e), FL, 0.7, { face: 1, walking: wk.on, walk: t * 2.2, lids: 0.4, look: 0.5, tie: true }, t);
      if (inDoor) { panels(ctx, th, false); gus(ctx, g.x, FL - 6, 0.66, { face: g.face, walking: true, walk: t * (3 + omega(t)), lids: t > m('l03') ? 0.15 : 0.45, neck: -0.1, wing: t > m('l03') ? 0.5 + 0.5 * Math.sin(t * 9) : 0.1, look: 0.4 }, t); panels(ctx, th, true); }
      else panels(ctx, 0.0 + Math.PI / 3 * 0 + 0.3, false);
      // frame posts + brass top ring (drawn after panels so it looks like a real revolving door)
      paint(ctx, c => roundRect(c, CX - 280, FL - D.h - 30, 560, 40, 16), '#C79A2A', { lw: 8 });
      line(ctx, [[CX - 270, FL - D.h], [CX - 270, FL]], 14, '#C79A2A'); line(ctx, [[CX + 270, FL - D.h], [CX + 270, FL]], 14, '#C79A2A');
      if (out) { const e = ease.out(clamp((t - m('stop') - 0.6) / 1.0)); gus(ctx, lerp(CX, 1020, e), FL, 0.82, { face: -1, walking: e > 0 && e < 0.97, walk: t * 1.6, lids: 0.85, neck: 0.15 + Math.sin(t * 5) * 0.1, wing: 0.3, look: 0.3 }, t); P.stars(ctx, lerp(CX, 1020, e) - 40, FL - 440, t, 120); }
      // Sofia with a small suitcase
      const ex = t < m('l02'), shock = t >= m('l03') && t < m('l04') + 0.5;
      PR.suitcase(ctx, 850, FL, 0.3, { open: 0 });
      sofia(ctx, 640, standHip(FL, 0.78), 0.78, {
        legs: 'stand', turn: 0.4, look: [0.8, -0.1], brow: { l: 0.3, r: 0.3, worry: t >= m('l04') ? 0.6 : 0 }, mouth: { smile: ex ? 0.9 : t >= m('l04') ? 0.2 : 0.7 }, wide: shock ? 0.6 : 0,
        ...GS.compose(t, 3, 's', [{ k: W2(t, m('l01') + 0.1, m('l01') + 2.2), g: k => GS.openArms(t, k) }, { k: W2(t, m('l03'), m('l04') + 1.5), g: k => GS.point(1, k, t, 0, 's', 80) }, { k: GS.smooth((t - m('stop') - 0.2) / 0.3), g: k => GS.shrug(t, k) }]),
      }, t, 3);
      ctx.restore();
      if (t >= m('spin') + 1 && t < m('spin') + 3) P.burst(ctx, 1500, 260, 'WHEEE!', clamp((t - m('spin') - 1) / 2), '#FFD23F', 0.06, 0.7);
    },
  };
})();

// ==================================================================== TITLE
const title = (() => {
  const { m } = mk('title');
  return {
    sfx: [['slam', 0.05, 'slam'], ['slam', 0.5, 'whoosh'], ['slam', 0.9, 'bell']],
    draw(ctx, t) {
      const u = t - m('slam');
      ctx.fillStyle = '#7A2432'; ctx.fillRect(0, 0, 1920, 1080);
      ctx.save(); ctx.translate(960, 560); ctx.rotate(t * 0.25);
      for (let i = 0; i < 16; i++) { ctx.rotate(Math.PI / 8); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(1400, -170); ctx.lineTo(1400, 170); ctx.closePath(); ctx.fillStyle = i % 2 ? '#8E2C3C' : '#852838'; ctx.fill(); }
      ctx.restore();
      // golden key sweeping across behind the title
      const pk = clamp((u - 0.2) / 1.8); ctx.save(); ctx.translate(lerp(-300, 2200, ease.out(pk)), 240 - pk * 100); ctx.rotate(-0.2);
      ctx.beginPath(); ctx.arc(0, 0, 60, 0, 7); ctx.lineWidth = 26; ctx.strokeStyle = OL; ctx.stroke(); ctx.lineWidth = 14; ctx.strokeStyle = '#F2C744'; ctx.stroke();
      line(ctx, [[60, 0], [260, 0]], 28, OL); line(ctx, [[60, 0], [260, 0]], 14, '#F2C744'); line(ctx, [[200, 0], [200, 50]], 22, OL); line(ctx, [[200, 0], [200, 50]], 10, '#F2C744'); ctx.restore();
      const gk = ease.back(clamp((u - 0.15) / 0.35));
      ctx.save(); ctx.translate(1480, 980 + (1 - gk) * 700);
      cart(ctx, 330, 0, 0.8, 2);
      drawGus(ctx, 0, 0, 1.0, { face: -1, lids: 0.3, honk: 0.2, wing: 0.3 + 0.2 * Math.sin(t * 8), neck: -0.2 }); ctx.restore();
      const sk = clamp(u / 0.28), sc = lerp(2.6, 1, ease.out(sk)), shake = u < 0.45 ? (1 - u / 0.45) * 14 : 0;
      ctx.save(); ctx.translate(780 + noise1(t * 30) * shake, 500 + noise1(t * 30 + 9) * shake); ctx.rotate(-0.05); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sk * 3);
      U.textOutlined(ctx, 'GUS', 0, -40, 190, '#FFFFFF', { olw: 30 });
      U.textOutlined(ctx, 'AT THE HOTEL', 0, 120, 112, U.ORANGE, { olw: 22 });
      ctx.restore();
      U.logo(ctx, clamp((u - 0.5) / 0.3));
    },
  };
})();

// ==================================================================== 2. RECEPTION
const reception = (() => {
  const { m } = mk('reception');
  const CX0 = 2300, SX = 1000, GX0 = 1400;
  return {
    sfx: [['l05', 0, 'bell'], ['l15', 0.9, 'cardswipe'], ['eat', 0.15, 'whoosh'], ['eat', 0.45, 'gulp'], ['eat', 0.9, 'chomp'], ['l17', 0.6, 'tick'], ['l18', 0.9, 'cardswipe'], ['booking', 0, 'record'], ['l23', 0.2, 'sadhonk']],
    draw(ctx, t) {
      if (t >= m('booking') && t < m('l12')) { insert(ctx, t - m('booking'), (t - m('booking')) / (m('l12') - m('booking')), 'screen'); return; }
      const shots = [
        { t: 0, c: [1650, 1150, 1.28], to: [1700, 1150, 1.34] },
        { t: m('l05') + 1.0, c: [2260, 1080, 2.2], to: [2260, 1075, 2.35] },
        { t: m('l06'), c: [1050, 1120, 2.0], to: [1060, 1120, 2.15] },
        { t: m('e1'), c: [1250, 1150, 1.5], to: [1260, 1150, 1.55] },
        { t: m('l07'), c: [2260, 1080, 2.3] },
        { t: m('l08'), c: [1050, 1120, 2.1] },
        { t: m('l09'), c: [2260, 1080, 2.2], to: [2250, 1075, 2.4] },
        { t: m('l10'), c: [1400, 1060, 2.4], to: [1410, 1055, 2.55] },
        { t: m('l12'), c: [1050, 1120, 2.2], to: [1060, 1110, 2.35] },
        { t: m('l13'), c: [2260, 1080, 2.3] },
        { t: m('l14'), c: [1050, 1120, 2.1] },
        { t: m('e2'), c: [1250, 1150, 1.5] },
        { t: m('l15'), c: [1900, 1250, 1.8], to: [1960, 1250, 1.95] },
        { t: m('eat'), c: [1560, 1120, 2.3], to: [1580, 1130, 2.1], d: 2 },
        { t: m('l16'), c: [1050, 1120, 2.1] },
        { t: m('l17'), c: [1400, 1060, 2.5] },
        { t: m('l18'), c: [2260, 1080, 2.3] },
        { t: m('l19'), c: [1050, 1120, 2.1] },
        { t: m('e3'), c: [1250, 1150, 1.5] },
        { t: m('l20'), c: [2260, 1080, 2.2] },
        { t: m('l21'), c: [1400, 1060, 2.5], to: [1410, 1055, 2.65] },
        { t: m('l22'), c: [2260, 1080, 2.3] },
        { t: m('l23'), c: [1420, 1060, 2.5], to: [1430, 1060, 2.7] },
      ];
      ctx.save(); applyCam(ctx, shotCam(shots, t), t);
      drawBg(ctx, 'lobby');
      const eatT = m('eat') + 0.4, ate = t >= eatT, giveT = m('l15') + 0.8;
      const cards = t >= giveT && t < eatT + 0.2 ? 2 : t >= eatT + 0.2 && t < m('l18') + 0.8 ? 1 : 0;
      const sorry = t >= m('l11') && t < m('l13'), shocked = t >= m('eat') + 0.7 && t < m('l18'), tired = t >= m('l18') && t < m('l19'), laugh = t >= m('l23');
      crew(ctx, CX0, 1436, 0.74, {
        turn: -0.3, look: sorry ? [0, 0.5] : shocked ? [-0.8, 0.2] : [-0.7, 0.05],
        browL: sorry ? 0.5 : shocked ? 0.9 : 0.3, browR: sorry ? 0.1 : shocked ? 0.9 : 0.3, surprise: shocked ? 0.9 : 0,
        mouth: { smile: sorry ? -0.1 : shocked ? -0.2 : tired ? -0.3 : 0.85, w: 1 },
        ...GS.compose(t, 4, 'c', [
          { k: W2(t, m('l05'), m('l05') + 2.6), g: k => GS.openArms(t, k, 0, 'c') },
          { k: W2(t, m('l15') - 0.3, m('l15') + 1.6), g: k => GS.reachOut(-1, k, t, 0, 'c') },
          { k: W2(t, m('l18'), m('l18') + 1.4), g: k => GS.reachOut(-1, k, t, 0, 'c') },
          { k: W2(t, m('l20'), m('l21') - 0.2), g: k => GS.point(-1, k, t, 0, 'c') },
          { k: W2(t, m('l07'), m('l09')), g: k => GS.hold(-1, k, t, 0, 'c') },
        ], { L: [-120, -70], R: [120, -60] }),
      }, t, 'carmen', 'carmen', 4);
      // Gus walks in from the left and stops by the desk; leans over and eats a card
      const gk = ease.out(clamp((t - 0.2) / 2.2)), gx = lerp(520, GX0, gk), gw = gk > 0 && gk < 0.98;
      const eating = t >= m('eat') && t < m('eat') + 1.5, lean = eating ? Math.sin(clamp((t - m('eat')) / 0.45) * Math.PI) * 0.9 : 0;
      const proud = t >= m('l10') && t < m('l11'), gl = t >= m('l17') && t < m('l18');
      gus(ctx, gx, 1500, 0.92, {
        face: 1, walking: gw, walk: t * 2.1, lids: eating ? 0.1 : proud ? 0.2 : t >= m('l23') ? 0.5 : 0.4, neck: eating ? 0.4 + lean * 0.5 : proud ? -0.3 : t >= m('l21') && t < m('l22') ? -0.35 : 0.05,
        look: 0.6, honk: eating && t > m('eat') + 0.5 ? 0.6 : 0, wing: proud ? 0.55 : 0.1, squash: ate && t < eatT + 0.5 ? 1 + 0.06 * Math.sin((t - eatT) * 8) : 1,
      }, t);
      if (gl && t < m('l17') + 1.4) P.burst(ctx, 1420, 520, 'CRUNCH!', clamp((t - m('l17')) / 1.2), '#FFD23F', -0.06, 0.55);
      // Sofia walks in, stands next to Gus
      const sk = ease.out(clamp(t / 2.0)), sx = lerp(260, SX, sk), sw = sk > 0 && sk < 0.98;
      const emb = t >= m('l12') && t < m('l13'), shk = t >= m('l16') && t < m('l17');
      sofia(ctx, sx, standHip(1500, 0.74), 0.74, {
        legs: sw ? 'walk' : 'stand', walk: t * 1.9, turn: 0.35, look: shk ? [0.8, 0.1] : [0.8, -0.2],
        brow: { l: 0.2, r: 0.2, worry: emb ? 0.7 : 0 }, mouth: { smile: emb ? -0.2 : shk ? -0.1 : 0.6 }, wide: shk ? 0.9 : 0, blink: emb ? 0.4 : 0,
        ...GS.compose(t, 1, 's', [{ k: W2(t, m('l06'), m('l06') + 1.6), g: k => GS.reachOut(1, k, t) }, { k: W2(t, m('l16'), m('l17')), g: k => GS.point(1, k, t, 0, 's', 80) }, { k: W2(t, m('l12'), m('l13')), g: k => GS.shrug(t, k) }]),
      }, t, 1);
      B4.desk4(ctx, { bellHit: t > m('l05') && t < m('l05') + 0.5 ? t - m('l05') : 0 });
      // key cards on the counter
      for (let i = 0; i < cards; i++) keyCard(ctx, 2110 - i * 120, 1262, 1.0, i ? -0.2 : 0.1);
      ctx.restore();
    },
  };
})();

// ==================================================================== 3. LIFT
const lift = (() => {
  const { m } = mk('lift');
  const L0 = B4.LIFT, CXL = 1440;
  const flo = t => t < m('up') ? 0 : Math.min(4, Math.floor((t - m('up')) / 0.5));
  return {
    sfx: [['doors', 0, 'ding'], ['doors', 0.2, 'slide'], ['up', 0.0, 'slide'], ['up', 0.1, 'rumble'], ['ding', 0, 'dingdong'], ['ding', 0.1, 'slide']],
    sfxAt: () => [1, 2, 3].map(i => ({ t: m('up') + i * 0.5, name: 'tick' })),
    draw(ctx, t) {
      const closing = t >= m('up') - 0.3 && t < m('ding'), arrived = t >= m('ding');
      const open0 = clamp((t - m('doors')) / 0.7), closeK = clamp((t - (m('up') - 0.4)) / 0.6), openK = clamp((t - m('ding')) / 0.7);
      const open = t < m('up') - 0.4 ? open0 : t < m('ding') ? 1 - closeK : openK;
      const shots = [{ t: 0, c: [1440, 1150, 1.25], to: [1440, 1150, 1.32] }, { t: m('l24'), c: [1250, 1080, 2.0] }, { t: m('doors') + 0.6, c: [1440, 1150, 1.4] }, { t: m('l25'), c: [1440, 1050, 2.2] }, { t: m('l26'), c: [1700, 1060, 2.2] },
        { t: m('up'), c: [1440, 1000, 1.2], shake: tt => tt < m('ding') ? 3 : 0 }, { t: m('ding'), c: [1440, 1150, 1.4] }];
      ctx.save(); applyCam(ctx, shotCam(shots, t), t);
      drawBg(ctx, 'liftWall');
      // inside: cabin or corridor
      ctx.save(); ctx.beginPath(); ctx.rect(L0.x0, L0.top, L0.x1 - L0.x0, 1420 - L0.top); ctx.clip();
      if (arrived) B4.corridor4(ctx); else B4.liftInterior(ctx);
      // doors: two halves
      const half = (L0.x1 - L0.x0) / 2, w = half * (1 - open);
      for (const s of [-1, 1]) { const X = s < 0 ? L0.x0 : L0.x1 - w; paint(ctx, c => c.rect(X, L0.top, w, 1420 - L0.top), '#C9D1DC', { shade: '#9DA7B6', sx: 8, sy: 0, lw: 7 }); if (w > 30) line(ctx, [[X + (s < 0 ? w - 20 : 20), L0.top + 40], [X + (s < 0 ? w - 20 : 20), 1380]], 6, 'rgba(255,255,255,0.6)'); }
      ctx.restore();
      // display
      const f = flo(t); const txt = arrived ? '4' : t >= m('up') ? String(Math.max(1, f)) : 'G';
      ctx.fillStyle = '#FF7A2F'; ctx.font = `800 100px ${F.EN}`; ctx.textAlign = 'center'; ctx.fillText(txt, 1440, 400);
      if (t >= m('up') && !arrived) { ctx.fillStyle = '#FF7A2F'; ctx.beginPath(); ctx.moveTo(1590, 400); ctx.lineTo(1630, 400); ctx.lineTo(1610, 358); ctx.closePath(); ctx.fill(); }
      // characters
      const talkP = t >= m('l24') && t < m('doors'), pk = clamp((t - 0.1) / 1.3);
      crew(ctx, lerp(900, 1150, ease.out(pk)), 1500, 0.74, { turn: 0.3, look: [0.6, 0.1], mouth: { smile: 0.9 }, ...GS.compose(t, 6, 'c', [{ k: W2(t, m('l24'), m('l24') + 2), g: k => GS.point(1, k, t, 0, 'c', 100) }]) }, t, 'pablo', 'pablo', 6);
      cart(ctx, lerp(760, 1010, ease.out(pk)), 1500, 0.8, 3);
      const gp = clamp((t - 0.3) / 1.2), hop = t >= m('up') && t < m('up') + 0.3 ? Math.sin((t - m('up')) / 0.3 * Math.PI) * 24 : 0;
      gus(ctx, lerp(1000, 1440, ease.out(gp)), 1500 - hop, 0.9, { face: 1, walking: gp > 0 && gp < 0.98, walk: t * 2.1, lids: t >= m('up') && t < m('ding') ? 0.15 : 0.4, neck: t >= m('l25') && t < m('l26') ? -0.3 : 0, look: t >= m('up') ? -0.2 : 0.5, wing: t >= m('up') && t < m('ding') ? 0.5 + 0.4 * Math.sin(t * 20) : 0.1 }, t);
      sofia(ctx, lerp(500, 1730, ease.out(gp)), standHip(1500, 0.76), 0.76, { legs: gp < 0.98 ? 'walk' : 'stand', walk: t * 1.9, turn: -0.35, look: [-0.7, -0.1], mouth: { smile: 0.7 }, ...GS.compose(t, 2, 's', [{ k: W2(t, m('l26'), m('l26') + 2.4), g: k => GS.shrug(t, k) }]) }, t, 2);
      ctx.restore();
    },
  };
})();

// ==================================================================== 4. ROOM 404
const room = (() => {
  const { m } = mk('room');
  const temp = t => { if (t < m('fan')) return 35; if (t < m('l32')) return 35 - 8 * clamp((t - m('fan')) / 2.6); const u = clamp((t - m('l32') - 1.6) / 1.8); return t < m('l32') + 1.6 ? 27 : 27 - 6 * u; };
  const AC_FIXED = () => m('l32') + 1.6;
  return {
    sfx: [['l28', 0.3, 'tick'], ['fan', 0, 'fan'], ['fan', 0.1, 'honk'], ['l32', 1.5, 'ac'], ['l32', 1.6, 'sparkle'], ['l35', 0.2, 'honk']],
    draw(ctx, t) {
      const shots = [{ t: 0, c: [1500, 1150, 1.2], to: [1500, 1150, 1.28] }, { t: m('l27'), c: [1000, 1100, 1.8] }, { t: m('l28'), c: [1500, 1080, 2.3] }, { t: m('l29'), c: [1000, 1100, 2.1] },
        { t: m('e5'), c: [1400, 1150, 1.45] }, { t: m('l30'), c: [1500, 1080, 2.2] }, { t: m('fan'), c: [1500, 1000, 1.6], to: [1600, 980, 1.5], d: 2.8 }, { t: m('l31'), c: [1000, 1100, 2.1] },
        { t: m('l32'), c: [1950, 1150, 1.55], to: [2050, 1150, 1.6] }, { t: m('l33'), c: [1050, 1100, 2.0] }, { t: m('e4'), c: [1400, 1150, 1.45] }, { t: m('l34'), c: [2100, 1150, 2.0] }, { t: m('l35'), c: [1550, 1070, 2.4] }];
      ctx.save(); applyCam(ctx, shotCam(shots, t), t);
      drawBg(ctx, 'room');
      const fixed = t >= AC_FIXED(), tmp = temp(t), hot = clamp((tmp - 21) / 14);
      // heat tint
      B4.acUnit(ctx, !fixed, t);
      // thermometer on the wall
      ctx.save(); ctx.translate(2270, 540); paint(ctx, c => roundRect(c, -34, -150, 68, 320, 34), '#FFFFFF', { lw: 8 }); ctx.fillStyle = tmp > 28 ? '#E5484D' : tmp > 24 ? '#FF9D2F' : '#2E9BE8';
      const hgt = 40 + hot * 200; ctx.fillRect(-11, 130 - hgt, 22, hgt); ctx.beginPath(); ctx.arc(0, 150, 38, 0, 7); ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = OL; ctx.stroke(); U.textOutlined(ctx, Math.round(tmp) + '°', 0, 250, 56, '#FFFFFF', { olw: 10 }); ctx.restore();
      // cool breeze after the fix
      if (fixed) for (let i = 0; i < 14; i++) { const ph = ((t - AC_FIXED()) * 0.9 + i / 14) % 1; ctx.save(); ctx.globalAlpha = Math.sin(ph * Math.PI) * 0.8; ctx.translate(1300 + (i % 7) * 100 + Math.sin(ph * 6 + i) * 20, 460 + ph * 420); ctx.fillStyle = '#9FDCFF'; ctx.beginPath(); ctx.arc(0, 0, 8 + (i % 3) * 3, 0, 7); ctx.fill(); ctx.restore(); }
      // luggage + Pablo
      const pin = walkK(t, 0.0, 1.2), pgo = t >= m('l32') ? walkK(t, m('l32') - 0.2, m('l32') + 1.0) : { e: 0, on: false };
      const PX = t < m('l32') - 0.2 ? lerp(2350, 2250, pin.e) : lerp(2250, 1950, pgo.e) + (t > m('l34') - 0.2 ? 150 : 0);
      PR.suitcase(ctx, 2020, 1500, 0.4, { open: 0 }); PR.suitcase(ctx, 2130, 1500, 0.38, { open: 0, col: '#2E6FD8', sh: '#2459B2' });
      const wifi = t >= m('l34') - 0.3;
      crew(ctx, PX, 1500, 0.76, {
        turn: t >= m('l34') - 0.5 ? -0.35 : -0.25, look: [-0.7, 0.1], browL: t >= m('l32') && t < m('l32') + 1.2 ? 0.7 : 0.2, browR: t >= m('l32') && t < m('l32') + 1.2 ? 0.7 : 0.2, mouth: { smile: 0.8 }, hop: pgo.on ? Math.abs(Math.sin(t * 9)) * 12 : 0,
        ...GS.compose(t, 8, 'c', [{ k: W2(t, m('l32') + 0.9, m('l32') + 2.0), g: k => GS.raise(-1, k, t, 0, 'c', 120) }, { k: W2(t, m('l34') - 0.3, m('l34') + 2.2), g: k => GS.hold(-1, k, t, 0, 'c') }]),
        holdL: wifi ? (c => { paint(c, q => roundRect(q, -50, -36, 100, 72, 6), '#FFFFFF', { lw: 5 }); c.fillStyle = '#2E6FD8'; c.font = `800 18px ${F.EN}`; c.textAlign = 'center'; c.fillText('WI-FI', 0, -6); c.fillStyle = OL; c.font = `700 14px ${F.EN}`; c.fillText('burgers123', 0, 20); }) : null,
      }, t, 'pablo', 'pablo', 8);
      // Gus
      const gk = clamp((t - 0.2) / 1.6), fan = t >= m('fan') && t < m('l31') + 0.4, flap = fan ? 0.5 + 0.5 * Math.sin(t * 26) : 0;
      const hotLook = t >= m('l28') && t < m('fan');
      gus(ctx, lerp(1000, 1500, ease.out(gk)), 1500, 0.92, { face: 1, walking: gk > 0 && gk < 0.98, walk: t * 2.1, lids: fan ? 0.05 : hotLook || t < m('fan') ? 0.7 : 0.4, honk: hotLook ? 0.5 + 0.3 * Math.sin(t * 9) : 0, neck: fan ? -0.4 : hotLook ? 0.2 : 0, wing: fan ? flap : 0.1, look: 0.4, squash: fan ? 1.04 : 1 }, t);
      if (hotLook || t < m('l30')) sweat(ctx, 1560, 1060, t, t >= m('l28') && t < m('l30') ? 1 : 0.5 * (t >= m('l30') ? 1 : 0));
      if (fan) for (let i = 0; i < 8; i++) { const ph = ((t - m('fan')) * 2.2 + i / 8) % 1; ctx.save(); ctx.globalAlpha = Math.sin(ph * Math.PI) * 0.7; line(ctx, [[1560 + ph * 520, 780 + (i % 4) * 90], [1620 + ph * 520, 780 + (i % 4) * 90]], 6, '#FFFFFF'); ctx.restore(); }
      // Sofia
      const sk = ease.out(clamp((t - 0.1) / 1.4)), conc = t >= m('l29') && t < m('l30'), lau = t >= m('l31') && t < m('l32');
      sofia(ctx, lerp(300, 1000, sk), standHip(1500, 0.76), 0.76, {
        legs: sk > 0 && sk < 0.98 ? 'walk' : 'stand', walk: t * 1.9, turn: 0.3, look: [0.7, -0.1], brow: { l: 0.2, r: 0.2, worry: conc ? 0.8 : 0 }, mouth: { smile: conc ? -0.3 : t < m('l28') ? 0.95 : 0.55 }, sleepy: 0, wipe: 0,
        ...GS.compose(t, 2, 's', [{ k: W2(t, m('l27'), m('l27') + 2.0), g: k => GS.openArms(t, k) }, { k: W2(t, m('l29'), m('l29') + 1.6), g: k => GS.point(1, k, t, 0, 's', 85) }, { k: W2(t, m('l33'), m('l33') + 1.4), g: k => GS.reachOut(1, k, t) }, { k: lau ? 1 : 0, g: k => GS.shrug(t, k) }]),
      }, t, 2);
      ctx.restore();
      if (t >= m('fan') && t < m('fan') + 1.2) P.burst(ctx, 1420, 280, 'FLAP FLAP!', clamp((t - m('fan')) / 1.1), '#FFD23F', -0.07, 0.7);
    },
  };
})();

// ==================================================================== 5. BREAKFAST
const breakfast = (() => {
  const { m } = mk('breakfast');
  const CLK = { x: 1000, y: 470 };
  const eatenAt = i => m('buffet') + 0.25 + i * (2.2 / 10);
  const clockMin = t => { if (t < m('clock')) return 0; const u = clamp((t - m('clock')) / 3.0); return u * 60; };
  const GXs = t => lerp(1200, 2700, ease.inOut(clamp((t - m('buffet')) / 2.4)));
  return {
    sfx: [['clock', 0, 'revolve'], ['open', 0, 'whoosh'], ['open', 0.1, 'bell'], ['l38', 0.2, 'sadhonk']],
    sfxAt: () => [...Array(10).keys()].flatMap(i => [{ t: eatenAt(i), name: 'chomp', g: 0.7 }]).concat([...Array(20).keys()].map(i => ({ t: m('clock') + i * 0.15, name: 'tick', g: 0.5 }))),
    draw(ctx, t) {
      const shots = [{ t: 0, c: [1550, 1150, 1.25] }, { t: m('l36'), c: [800, 1100, 2.0] }, { t: m('l37'), c: [1250, 1050, 2.3] }, { t: m('clock'), c: [1020, 600, 2.2], to: [1020, 560, 2.6], d: 2.2 },
        { t: m('clock') + 2.3, c: [1250, 1150, 1.6] }, { t: m('open'), c: [1900, 1100, 1.5] }, { t: m('buffet'), c: [1500, 1150, 1.4], to: [2300, 1150, 1.4], d: 2.4 }, { t: m('buffet') + 2.4, c: [1750, 1150, 1.5] },
        { t: m('l38'), c: [1100, 1100, 2.0] }, { t: m('l39'), c: [2550, 1080, 2.2] }, { t: m('l40'), c: [1900, 1080, 2.3] }];
      ctx.save(); applyCam(ctx, shotCam(shots, t), t);
      drawBg(ctx, 'restaurant');
      const mins = clockMin(t); B4.clockFace(ctx, CLK.x, CLK.y, 120, t < m('clock') ? 6 : 6 + mins / 60, mins % 60);
      // dim + yawn light before opening
      // food on the buffet; hidden when Gus passed
      const gx = GXs(t);
      B4.BUF.forEach(([X, kind], i) => { if (t >= eatenAt(i)) return; B4.food(ctx, X, 985, kind, 1.25); });
      // roller shutter over the buffet until 'open'
      const sh = t < m('open') ? 0 : ease.out(clamp((t - m('open')) / 0.9));
      if (sh < 1) { ctx.save(); ctx.beginPath(); ctx.rect(1380, 700, 1480, 740); ctx.clip(); const ty = 700 - sh * 760; ctx.fillStyle = '#B9C0CC'; ctx.fillRect(1380, ty, 1480, 740); for (let i = 0; i < 12; i++) line(ctx, [[1380, ty + i * 62], [2860, ty + i * 62]], 4, '#8E96A3'); ctx.fillStyle = '#E5484D'; ctx.font = `800 90px ${F.EN}`; ctx.textAlign = 'center'; ctx.fillText('CLOSED', 2120, ty + 400); ctx.restore(); }
      // characters
      const buf = t >= m('buffet') && t < m('buffet') + 2.5, after = t >= m('buffet') + 2.5, here = t >= m('open') && t < m('buffet');
      const carmenX = lerp(3100, 2650, ease.out(clamp((t - m('open') + 0.6) / 0.7)));
      if (t >= m('open') - 0.6) crew(ctx, carmenX, 1500, 0.78, { turn: -0.3, look: [-0.7, 0.1], browL: after ? 0.8 : 0.3, browR: after ? 0.8 : 0.3, mouth: { smile: after ? -0.3 : 0.9 }, ...GS.compose(t, 4, 'c', [{ k: W2(t, m('open'), m('buffet')), g: k => GS.openArms(t, k, 0, 'c') }, { k: after ? 1 : 0, g: k => GS.shrug(t, k, 0, 'c') }]) }, t, 'carmen', 'carmen', 4);
      const gposX = t < m('buffet') ? 1250 : buf ? gx : lerp(2700, 1650, ease.out(clamp((t - m('buffet') - 2.5) / 1.0)));
      const fat = t >= m('buffet') ? 1 + 0.18 * clamp((t - m('buffet')) / 2.4) : 1;
      gus(ctx, gposX, 1500, 0.92, { face: t >= m('buffet') + 2.5 && t < m('buffet') + 3.5 ? -1 : 1, walking: buf || (t > m('buffet') + 2.5 && t < m('buffet') + 3.5), walk: t * (buf ? 4.2 : 2), lids: after ? 0.9 : here ? 0.1 : 0.45, honk: buf ? 0.5 : 0, neck: buf ? 0.5 + 0.3 * Math.sin(t * 22) : 0, wing: buf ? 0.5 + 0.4 * Math.sin(t * 18) : 0.1, look: 0.5, squash: fat * (t >= m('l40') ? 1 + Math.sin(t * 2) * 0.01 : 1) }, t);
      if (buf) for (let i = 0; i < 5; i++) { const ph = ((t - m('buffet')) * 3 + i / 5) % 1; ctx.save(); ctx.globalAlpha = 1 - ph; ctx.fillStyle = '#E8A04A'; ctx.beginPath(); ctx.arc(gx - 60 - ph * 150, 1100 - 40 + ph * 260 + (i % 2) * 30, 7, 0, 7); ctx.fill(); ctx.restore(); }
      const sleepy = t < m('open');
      sofia(ctx, 780, standHip(1500, 0.76), 0.76, { legs: 'stand', turn: 0.35, look: sleepy ? [0.5, 0.3] : [0.8, -0.2], sleepy: sleepy ? 0.8 : 0, brow: { l: 0.1, r: 0.1, worry: after ? 0.8 : 0 }, wide: after && t < m('l39') ? 0.9 : 0, mouth: { smile: sleepy ? 0.1 : after ? -0.2 : 0.5, open: t >= m('l36') && t < m('l36') + 0.8 ? 0.5 : 0 },
        ...GS.compose(t, 2, 's', [{ k: W2(t, m('l38'), m('l39') - 0.2), g: k => GS.point(1, k, t, 0, 's', 85) }, { k: W2(t, m('l36'), m('l36') + 1.6), g: k => GS.raise(-1, k, t, 0, 's', 125) }]) }, t, 2);
      if (sleepy) P.zzz(ctx, 840, 800, t);
      ctx.restore();
      if (t >= m('open') && t < m('open') + 1.2) P.burst(ctx, 1500, 280, 'DING!', clamp((t - m('open')) / 1.1), '#FFD23F', -0.07, 0.7);
    },
  };
})();

// ==================================================================== 6. CHECK-OUT
const checkout = (() => {
  const { m } = mk('checkout');
  return {
    sfx: [['l41', 0, 'bell'], ['bill', 0, 'slip'], ['l47', 0.6, 'sadhonk']],
    draw(ctx, t) {
      if (t >= m('bill') && t < m('l47')) { insert(ctx, t - m('bill'), (t - m('bill')) / (m('l47') - m('bill')), 'bill'); return; }
      const shots = [{ t: 0, c: [1450, 1150, 1.2], to: [1500, 1150, 1.3] }, { t: m('l41'), c: [1250, 1100, 1.8] }, { t: m('e6'), c: [1250, 1150, 1.45] }, { t: m('l42'), c: [2260, 1080, 2.2] }, { t: m('l43'), c: [450, 1150, 1.9] },
        { t: m('l44'), c: [1250, 1100, 2.0] }, { t: m('l45'), c: [450, 1150, 2.0], to: [450, 1140, 2.2] }, { t: m('l46'), c: [2260, 1080, 2.3] }, { t: m('l47'), c: [1350, 1130, 1.6] }];
      ctx.save(); applyCam(ctx, shotCam(shots, t), t);
      drawBg(ctx, 'lobby');
      const alarm = t >= m('l43') && t < m('l44'), smug = t >= m('l45') && t < m('l46'), pay = t >= m('l47');
      crew(ctx, 2300, 1436, 0.74, { turn: -0.3, look: [-0.7, 0.05], browL: 0.3, browR: 0.3, mouth: { smile: 0.8 }, ...GS.compose(t, 4, 'c', [{ k: W2(t, m('l42'), m('l43')), g: k => GS.point(-1, k, t, 0, 'c') }, { k: W2(t, m('l46'), m('l47') + 0.5), g: k => GS.reachOut(-1, k, t, 0, 'c') }], { L: [-120, -70], R: [120, -60] }) }, t, 'carmen', 'carmen', 4);
      // Gus on the sofa (seat front drawn over his legs)
      const gx = pay ? lerp(330, 1500, ease.inOut(clamp((t - m('l47') - 0.2) / 1.6))) : 330, up = pay ? 1 : 0;
      gus(ctx, gx, pay ? 1500 : 1385, 0.86, { face: 1, walking: pay && gx < 1495, walk: t * 2, lids: alarm ? 0.0 : smug ? 0.8 : 0.5, neck: alarm ? -0.45 : 0, wing: alarm ? 0.8 : 0.1, honk: alarm ? 0.4 : 0, look: 0.4, squash: pay ? 1 : 0.9 }, t);
      if (!pay) { ctx.save(); paint(ctx, c => roundRect(c, 30, 1380, 580, 140, 36), '#3C82F0', { shade: '#2E6FD8', sx: 0, sy: -10, lw: 8 }); ctx.restore(); }
      if (alarm) P.burst(ctx, 640, 500, 'ELEVEN?!', clamp((t - m('l43')) / 1.2), '#FFD23F', -0.07, 0.55);
      sofia(ctx, 1220, standHip(1500, 0.76), 0.76, { legs: 'stand', turn: 0.3, look: [0.8, -0.1], mouth: { smile: t >= m('l44') ? 0.8 : 0.6 }, brow: { l: 0.2, r: 0.2, worry: 0 },
        ...GS.compose(t, 2, 's', [{ k: W2(t, m('l41'), m('l41') + 1.5), g: k => GS.reachOut(1, k, t) }, { k: W2(t, m('l44'), m('l44') + 1.6), g: k => GS.shrug(t, k) }]),
        holdL: null }, t, 2);
      PR.suitcase(ctx, 1000, 1500, 0.32, { open: 0 });
      B4.desk4(ctx, {});
      ctx.restore();
    },
  };
})();

// ==================================================================== RECAP — six phrases
const recap = (() => {
  const { m } = mk('recap');
  const items = [['I have a reservation.', 'reserve'], ['Can I have a key card, please?', 'keycard'], ['What time is breakfast?', 'toast'], ["The air conditioning doesn't work.", 'snow'], ["What's the Wi-Fi password?", 'wifi'], ['What time is check-out?', 'exit']];
  return {
    sfx: [['l48', 0, 'quizjingle'], ...[1, 2, 3, 4, 5, 6].map(i => ['r' + i, 0, 'pop'])],
    draw(ctx, t) {
      const g = ctx.createLinearGradient(0, 0, 0, 1080); g.addColorStop(0, '#DCEBFA'); g.addColorStop(1, '#C4E2F4'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1920, 1080);
      ctx.save(); ctx.globalAlpha = 0.6; for (let i = 0; i < 12; i++) B3.cloud(ctx, (hash(i) * 2400 - t * 30 * (0.5 + hash(i + 2)) + 2400) % 2400 - 240, 80 + hash(i + 5) * 900, 30 + hash(i + 7) * 40); ctx.restore();
      U.textOutlined(ctx, 'AT THE HOTEL', 960, 100, 84, U.ORANGE, { olw: 16 });
      ctx.font = '700 38px ' + F.EN; ctx.fillStyle = OL; ctx.textAlign = 'center'; ctx.fillText('Say it with Sofia!', 960, 150);
      items.forEach(([txt, ic], i) => {
        const Ln = L('r' + (i + 1)); const ak = ease.back(clamp((t - Ln.t0 + 0.7) / 0.25)); if (ak <= 0) return;
        const nextT = i < 5 ? L('r' + (i + 2)).t0 : Ln.t1 + 4, active = t >= Ln.t0 - 0.7 && t < nextT - 0.7, y = 235 + i * 130;
        ctx.save(); ctx.translate(960 + (1 - ak) * 900, y); const s = active ? 1.04 : 0.94; ctx.scale(s, s);
        paint(ctx, c => roundRect(c, -440, -50, 880, 100, 34), active ? '#FFFFFF' : 'rgba(255,255,255,0.75)', { lw: 6 });
        paint(ctx, c => c.arc(-380, 0, 36, 0, 7), active ? U.ORANGE : '#F3EAE2', { lw: 5 });
        ctx.font = '700 38px ' + F.EN; ctx.fillStyle = active ? '#fff' : OL; ctx.textAlign = 'center'; ctx.fillText(String(i + 1), -380, 13);
        U3.icon(ctx, ic, 390, 0, 0.7);
        ctx.font = '700 46px ' + F.EN; ctx.fillStyle = OL; ctx.textAlign = 'left'; ctx.fillText(txt, -325, 16);
        if (t > Ln.t1 && t < nextT - 0.7) { paint(ctx, c => roundRect(c, 215, -80, 190, 40, 20), U.GREEN, { lw: 4 }); ctx.font = '700 26px ' + F.EN; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText('YOUR TURN', 310, -51); }
        ctx.restore();
      });
      sofia(ctx, 170, 1230, 0.72, { ...GS.compose(t, 10, 's', [{ k: 1, g: k => GS.raise(1, k, t, 0, 's', 120) }]), mouth: { smile: 0.9 }, look: [0.6, -0.5], turn: 0.2 }, t, 10);
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
      ctx.font = '700 58px ' + F.EN; ctx.fillStyle = OL; ctx.textAlign = 'center'; ctx.fillText('What did Gus eat for breakfast?', 960, 278);
      ctx.restore();
      const ans = t > m('answer');
      [['A', 'One toast.', 0], ['B', 'The whole buffet.', 0.4]].forEach(([Lt, txt, d], i) => {
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
      sofia(ctx, 230, 1230, 0.72, { ...GS.compose(t, 5, 's', [{ k: 1, g: k => GS.raise(1, k, t, 0, 's', 115) }]), mouth: { smile: 0.9 }, brow: { l: 0.5, r: 0.5 }, look: [0.8, -0.4], turn: 0.2 }, t, 5);
      const sad = ans ? clamp((t - m('answer') - 0.3) / 0.4) : 0;
      // Gus votes A (innocent face); a burger falls out from behind the sign when the truth is told
      gus(ctx, 1700, 1110, 0.75, { face: -1, lids: lerp(0.45, 0.8, sad), look: -0.5, neck: -sad * 0.6, hold: (c, face, H) => { c.translate(H.hx + 128, H.hy + 26); c.rotate(sad * 0.35 + Math.sin(t * 3) * 0.05); line(c, [[0, 0], [0, 40]], 5, OL); c.scale(face, 1); paint(c, q => roundRect(q, -66, 40, 132, 132, 14), '#FFFFFF', { lw: 6 }); U.textOutlined(c, 'A', 0, 140, 96, U.ORANGE, { olw: 12 }); } }, t);
      if (ans) { const u = clamp((t - m('answer') - 0.3) / 0.7); B4.food(ctx, 1500 - 40 * u, 700 + 460 * u * u, 'croissant', 1.2); }
      if (ans) for (let i = 0; i < 80; i++) { const ph = (t - m('answer')) * (0.5 + hash(i) * 0.5); if (ph > 2.5) continue; const x = hash(i * 3) * 1920, y = -50 + ph * 450 + hash(i * 5) * 150; ctx.save(); ctx.translate(x + Math.sin(ph * 6 + i) * 30, y); ctx.rotate(ph * 8 + i); ctx.fillStyle = ['#FF7A2F', '#3DAA6E', '#5BB8F0', '#E5484D', '#FFD23F'][i % 5]; ctx.fillRect(-10, -5, 20, 10); ctx.restore(); }
    },
  };
})();

// ==================================================================== OUTRO + end screen
const outro = (() => {
  const { m, t1 } = mk('outro');
  return {
    sfx: [['l49', 0.3, 'pop'], ['l50', 0.6, 'click'], ['bye', 1.5, 'whoosh'], ['endscreen', 0, 'sparkle']],
    draw(ctx, t) {
      const end = t >= m('endscreen');
      const shots = [{ t: m('l49'), c: [1450, 1100, 1.25], to: [1440, 1100, 1.32], d: 8 }, { t: m('endscreen'), c: [1450, 1060, 1.0] }];
      ctx.save(); applyCam(ctx, shotCam(shots, t), t);
      drawBg(ctx, 'lobby');
      const bye = t >= m('l50'), fly = 0, fe = 0;
      PR.suitcase(ctx, 1960, 1500, 0.38, { open: 0 });
      gus(ctx, 1120, 1500, 0.92, { face: 1, lids: 0.55, look: 0.5, neck: bye ? 0.1 : 0, wing: t >= m('l51') ? 0.4 + 0.3 * Math.sin(t * 12) : 0.1 }, t);
      sofia(ctx, 700, standHip(1500, 0.76), 0.76, { turn: bye ? 0.1 : 0.25, look: [0.4, -0.1], ...GS.compose(t, 11, 's', [{ k: GS.smooth((t - m('l50')) / 0.3), g: k => GS.wave(t, 1, k) }, { k: 1 - GS.smooth((t - m('l50')) / 0.3), g: k => GS.hold(1, k, t) }]), mouth: { smile: 0.95 }, brow: { l: 0.4, r: 0.4 } }, t, 11);
      ctx.restore();
      if (end) { ctx.fillStyle = `rgba(255,246,230,${0.85 * clamp((t - m('endscreen')) / 0.5)})`; ctx.fillRect(0, 0, 1920, 1080); }
      const ck = ease.back(clamp((t - m('l49') - 0.3) / 0.4)) * (bye ? 1 - clamp((t - m('l50')) / 0.3) : 1);
      if (ck > 0) {
        ctx.save(); ctx.translate(1400, 330); ctx.scale(ck * 0.8, ck * 0.8);
        paint(ctx, c => roundRect(c, -440, -170, 880, 330, 50), '#FFFFFF', { lw: 8 });
        ctx.font = '700 70px ' + F.EN; ctx.fillStyle = OL; ctx.textAlign = 'center'; ctx.fillText('I want to stay at ______', 0, -20);
        U.textOutlined(ctx, 'hotel, hostel or tent? Comment!', 0, 90, 46, U.ORANGE, { olw: 8 });
        ctx.restore();
      }
      if (bye && !end) {
        const sk = ease.back(clamp((t - m('l50')) / 0.4)), pressed = t > m('l50') + 0.6;
        ctx.save(); ctx.translate(470, 760); ctx.scale(sk * 0.85, sk * 0.85);
        paint(ctx, c => roundRect(c, -260, -70, 520, 140, 70), pressed ? '#9C8A82' : U.RED, { lw: 8 });
        U.textOutlined(ctx, pressed ? 'SUBSCRIBED' : 'SUBSCRIBE', 0, 22, 66, '#FFFFFF', { olw: 10 });
        ctx.restore();
        const ck2 = clamp((t - m('l50') - 0.2) / 0.4);
        U.tapCursor(ctx, lerp(800, 550, ease.out(ck2)), lerp(1000, 790, ease.out(ck2)), 1, clamp((t - m('l50') - 0.6) / 0.3));
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

module.exports = { door, title, reception, lift, room, breakfast, checkout, recap, quiz, outro };
