// "Answer in 3 seconds" renderer: node pingpong.js start end out.mp4 | node pingpong.js 0 0 --png=f1,f2
// A ball-launcher cannon fires a phrase. The ball hangs in the middle of the screen as a real 3-second countdown, then the natural answer pops up.
// One voice, one character (the cannon), screen space only (no world camera).
process.env.LAYOUT = process.env.LAYOUT || 'v1';
const fs = require('fs');
const Hq = require('./hq'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, rr } = Hq;
const _paint = Hq.paint;   // let shapes use roundRect/arc/ellipse too
Hq.paint = (ctx, fn, base, o) => _paint(ctx, q => fn(Object.assign({ roundRect(x, y, w, h, r) { q.m(x + r, y); q.l(x + w - r, y); q.q(x + w, y, x + w, y + r); q.l(x + w, y + h - r); q.q(x + w, y + h, x + w - r, y + h); q.l(x + r, y + h); q.q(x, y + h, x, y + h - r); q.l(x, y + r); q.q(x, y, x + r, y); q.z(); } }, q)), base, o);
const TL = JSON.parse(fs.readFileSync('eps/pingpong/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const fit = (c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') => { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); };
const outl = (c, s, x, y, size, fill, line, sw, maxW, font = 'Unb9') => { UI.textFit(c, font, size, s, maxW); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, s, x, y, fill, line, sw); };

// ---------------- characters / props
const FLOOR = 1790, CS = 1.25, CX0 = 340;
function ball(c, x, y, r, rot = 0) { c.save(); c.translate(x, y); c.rotate(rot);
  c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.arc(8, 10, r, 0, TAU); c.fill();
  c.fillStyle = '#D7E84A'; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill(); c.strokeStyle = '#3E471E'; c.lineWidth = Math.max(3, r * 0.05); c.stroke();
  c.save(); c.beginPath(); c.arc(0, 0, r, 0, TAU); c.clip(); c.strokeStyle = '#FFFDF8'; c.lineWidth = r * 0.1; for (const s of [-1, 1]) { c.beginPath(); c.arc(s * r * 1.35, 0, r * 0.95, 0, TAU); c.stroke(); } c.restore();
  c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(-r * 0.35, -r * 0.4, r * 0.22, r * 0.14, -0.6, 0, TAU); c.fill(); c.restore(); }
function cannon(c, x, y, s, st) { c.save(); c.translate(x, y); c.scale(s * (1 + (st.squash || 0)), s * (1 - (st.squash || 0))); c.rotate(st.tilt || 0);
  c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(0, 0, 210, 26, 0, 0, TAU); c.fill();
  // barrel (behind the chassis)
  c.save(); c.translate(60 - (st.recoil || 0) * Math.cos(st.aim), -300 - (st.recoil || 0) * Math.sin(st.aim)); c.rotate(st.aim);
  Hq.paint(c, q => { q.m(-20, -62); q.l(250, -52); q.l(250, 52); q.l(-20, 62); q.z(); }, '#2E3A6E', { sd: 10, hd: 5, lw: 6 });
  Hq.paint(c, q => { q.m(236, -70); q.l(276, -76); q.l(276, 76); q.l(236, 70); q.z(); }, '#F2A33C', { sd: 6, hd: 4, lw: 6 }); c.restore();
  // wheels
  for (const wx of [-110, 120]) { c.save(); c.translate(wx, -66); c.rotate(st.wheel || 0); c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(0, 0, 66, 0, TAU); c.fill(); c.fillStyle = '#F2A33C'; c.beginPath(); c.arc(0, 0, 30, 0, TAU); c.fill(); c.strokeStyle = '#171717'; c.lineWidth = 7; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(i * Math.PI / 2) * 60, Math.sin(i * Math.PI / 2) * 60); c.stroke(); } c.restore(); }
  // chassis + face
  Hq.paint(c, q => q.roundRect(-190, -330, 380, 270, 90), '#3FB6A8', { sd: 16, hd: 8, lw: 7, box: [-190, -330, 190, -60] });
  const t = st.t, bl = (t * 0.9 + 0.3) % 3.2 < 0.12 ? 0.9 : 0, eo = st.mood === 'shock' ? 1.15 : 1;
  for (const sx of [-1, 1]) { const ex = sx * 70, ey = -235; c.fillStyle = '#FFFDF8'; c.beginPath(); c.ellipse(ex, ey, 50 * eo, 54 * eo * (1 - bl), 0, 0, TAU); c.fill(); c.strokeStyle = '#171717'; c.lineWidth = 6; c.stroke();
    if (!bl) { c.fillStyle = '#171717'; c.beginPath(); c.arc(ex + (st.look ? st.look[0] : 0) * 18, ey + (st.look ? st.look[1] : 0) * 18, st.mood === 'shock' ? 11 : 22, 0, TAU); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(ex + 7 + (st.look ? st.look[0] : 0) * 18, ey - 8 + (st.look ? st.look[1] : 0) * 18, 6, 0, TAU); c.fill(); }
    c.strokeStyle = '#171717'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); const by = ey - 74 * eo, sm = st.mood === 'smug' ? 14 : st.mood === 'sad' ? -18 : st.mood === 'worried' ? -20 : 0; c.moveTo(ex - 36, by + (sx < 0 ? sm : 0) * -1 + (st.mood === 'worried' ? sx * 10 : 0)); c.lineTo(ex + 36, by + (sx > 0 ? sm : 0) * -1 - (st.mood === 'worried' ? sx * 10 : 0)); c.stroke(); }
  if (st.blush) { c.fillStyle = `rgba(240,100,120,${0.55 * st.blush})`; for (const sx of [-1, 1]) { c.beginPath(); c.ellipse(sx * 130, -160, 34, 20, 0, 0, TAU); c.fill(); } }
  const mo = (st.talk || 0) * 46 + (st.mood === 'shock' ? 30 : 0), sm2 = st.mood === 'happy' || st.mood === 'smug' ? 1 : st.mood === 'sad' || st.mood === 'worried' ? -1 : 0.3;
  c.fillStyle = '#5A1E26'; c.strokeStyle = '#171717'; c.lineWidth = 6; c.beginPath(); c.moveTo(-60, -135); c.quadraticCurveTo(0, -135 + 40 * sm2 + mo, 60, -135); c.quadraticCurveTo(0, -135 - 18 * sm2 + mo * 1.6, -60, -135); c.fill(); c.stroke();
  if (st.sweat) { c.fillStyle = '#7FB0D8'; c.beginPath(); c.moveTo(165, -300); c.quadraticCurveTo(190, -258, 165, -240); c.quadraticCurveTo(140, -258, 165, -300); c.fill(); }
  c.restore(); }
function stool(c, x, floor, k) { c.save(); c.translate(x, floor); const dx = lerp(34, 150, k), L = 150, seatY = -Math.sqrt(L * L - dx * dx) - 14;
  c.strokeStyle = '#6A4A2A'; c.lineWidth = 16; c.lineCap = 'round'; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 34, seatY + 8); c.lineTo(s * (34 + (dx - 34)), 0); c.stroke(); }
  Hq.paint(c, q => q.roundRect(-70, seatY - 24, 140, 30, 10), '#E0474C', { sd: 5, hd: 3, lw: 5 }); c.restore(); return floor - (Math.sqrt(L * L - dx * dx) + 14) - 24; }
function cloud(c, x, y, s, a = 1) { c.save(); c.globalAlpha = a; c.fillStyle = '#FFFFFF'; for (const [dx, dy, r] of [[-40, 0, 36], [0, -20, 46], [44, 0, 36], [0, 10, 40]]) { c.beginPath(); c.arc(x + dx * s, y + dy * s, r * s, 0, TAU); c.fill(); } c.restore(); }

// ---------------- background: a sports hall
function bg(c, t) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, '#CFE8F2'); g.addColorStop(0.7, '#EAF6FA'); g.addColorStop(0.7, '#C9A06A'); g.addColorStop(1, '#A87C4A'); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  c.fillStyle = 'rgba(255,255,255,.55)'; for (let x = 40; x < W; x += 190) c.fillRect(x, 1090, 120, 260);
  c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 8; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(0, 1360 + i * 110); c.lineTo(W, 1360 + i * 110); c.stroke(); }
  c.fillStyle = '#FFFDF8'; c.fillRect(0, 1355, W, 10); }

// ---------------- state
const qIdx = L => +L[1];
function cannonState(t, L) { const st = { t, talk: K.talk('cannon', t), mood: 'neutral', aim: -1.0, recoil: 0, look: [0.5, -0.4], x: CX0, y: FLOOR, sweat: false, blush: 0, wheel: 0, squash: 0, tilt: 0 };
  if (L === 'FIN') { const hop = ev('FIN', 'hop'), fold = ev('FIN', 'fold'); st.aim = -0.5; st.look = [0, 0.4];
    const roll = P(t, SC.FIN.s, hop - 0.4); st.x = lerp(CX0 + 250, 700, eIO(roll)); st.wheel = roll * 6;
    const j = P(t, hop - 0.4, hop + 0.2); st.mood = t > fold ? 'shock' : 'smug';
    const stk = P(t, fold, fold + 0.25), seatTop = FLOOR - 170;
    if (t < hop - 0.4) st.y = FLOOR; else if (t < fold) st.y = lerp(FLOOR, seatTop, eOut(j)) - Math.sin(j * Math.PI) * 140; else st.y = lerp(seatTop, FLOOR, eIn(stk));
    if (t >= fold) { st.squash = 0.16 * Math.exp(-(t - fold - 0.25) * 6) * (t > fold + 0.2 ? 1 : 0); st.tilt = 0.12 * clamp((t - fold) * 4) * Math.exp(-(t - fold) * 1.2); st.mood = 'shock'; if (t > SP.fin.t - 0.1) st.mood = 'sad'; }
    return st; }
  const i = qIdx(L), tm0 = ev(L, 'tm0'), tm1 = ev(L, 'tm1'), ans = ev(L, 'ans'), qs = SP['q' + i + '_q'];
  const toBall = Math.atan2(800 - (FLOOR - 300 * CS), 640 - (CX0 + 60 * CS)); st.aim = toBall;
  if (t < tm0) { st.mood = 'smug'; st.recoil = 30 * Math.exp(-Math.max(0, t - (qs.t + 0.05)) * 10) * (t > qs.t + 0.05 ? 1 : 0); }
  else if (t < ans) { st.mood = 'neutral'; st.look = [0.2, -0.5]; st.sweat = t > tm0 + 1.6; if (t > tm1) st.mood = 'shock'; }
  else { st.mood = 'happy'; st.look = [0, 0]; st.blush = i === 1 ? clamp((t - ans) * 3) : 0; }
  if (i === 2 && t < ans) { st.aim = -1.45; st.look = [0, -1]; }               // "What's up?" -> looks straight up
  if (i === 2 && t >= ans) st.aim = lerp(-1.45, toBall, clamp((t - ans) * 3));
  if (i === 3 && t > ev('Q3', 'gag')) { const r = P(t, ev('Q3', 'gag'), ev('Q3', 'gag') + 1.0); st.x = lerp(CX0, CX0 + 250, eIO(r)); st.wheel = r * 6; }
  if (i === 3 && t >= ans) st.mood = 'smug';
  return st; }

// ---------------- frame
function renderFrame(c, t) { c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id; bg(c, t);
  const st = cannonState(t, L); let stoolTop = null;
  if (L === 'Q3' || L === 'FIN') { const fk = L === 'FIN' ? eIn(clamp((t - ev('FIN', 'fold')) / 0.22)) : 0; if (t >= ev('Q3', 'tm0') - 0.6 || L === 'FIN') stoolTop = stool(c, 880 + (L === 'FIN' ? -180 : 0), FLOOR, fk); }
  const sh = L === 'FIN' && t > ev('FIN', 'fold') ? Math.exp(-(t - ev('FIN', 'fold')) * 7) * 14 : 0; c.save(); c.translate((hash(Math.floor(t * 60)) - 0.5) * sh, (hash(Math.floor(t * 60) + 7) - 0.5) * sh);
  cannon(c, st.x, st.y, CS, st);
  if (L === 'FIN' && t > ev('FIN', 'fold')) { const u = t - ev('FIN', 'fold'); c.globalAlpha = clamp(1 - u * 1.3) * 0.8; c.fillStyle = '#F5EBDD'; for (let i = 0; i < 6; i++) { const d = u * 220 * (0.6 + hash(i) * 0.6) * (i % 2 ? 1 : -1); c.beginPath(); c.arc(st.x + d, FLOOR - 20 - hash(i + 3) * 30 - u * 40, 26 + u * 40, 0, TAU); c.fill(); } c.globalAlpha = 1; }
  c.restore();
  const muzzle = () => { const px = st.x + 60 * CS, py = st.y - 300 * CS, a = st.aim, l = 276 * CS - (st.recoil || 0); return { x: px + Math.cos(a) * l, y: py + Math.sin(a) * l }; };
  if (L !== 'FIN') { const i = qIdx(L), tm0 = ev(L, 'tm0'), tm1 = ev(L, 'tm1'), ans = ev(L, 'ans'), qs = SP['q' + i + '_q'], mz = muzzle(), BX = 640, BY = 800;
    const fly = P(t, qs.t + 0.05, qs.t + 0.5);
    // the ball: leaves the muzzle, hangs in the middle as the timer, snaps back when the answer comes
    let bx = BX, by = BY, br = 190, show = t > qs.t - 0.4;
    if (t < qs.t + 0.05) { bx = mz.x; by = mz.y; br = 46; } else if (t < qs.t + 0.5) { bx = lerp(mz.x, BX, eOut(fly)); by = lerp(mz.y, BY, eOut(fly)) - Math.sin(fly * Math.PI) * 120; br = lerp(46, 190, eOut(fly)); }
    if (t >= tm1 && t < ans) { const k = P(t, tm1, tm1 + 0.12); br = 190 * (1 + 0.3 * Math.sin(k * Math.PI) + 0.08); }
    if (t >= ans) { const k = eIn(P(t, ans, ans + 0.3)); bx = lerp(BX, mz.x, k); by = lerp(BY, mz.y, k); br = lerp(190, 46, k); if (k >= 1) show = false; }
    if (t < 0.02) show = true;
    if (show) { if (t > qs.t + 0.05 && t < qs.t + 0.5) { c.save(); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 10; c.lineCap = 'round'; for (let k = 1; k <= 3; k++) { c.beginPath(); c.moveTo(lerp(mz.x, bx, 0.2 * k), lerp(mz.y, by, 0.2 * k) + k * 8); c.lineTo(lerp(mz.x, bx, 0.2 * k + 0.12), lerp(mz.y, by, 0.2 * k + 0.12) + k * 8); c.stroke(); } c.restore(); }
      ball(c, bx, by, br, t * 1.5 + i);
      if (t >= qs.t + 0.5 && t < ans) {   // number on the ball
        const n = t < tm0 ? '?' : t >= tm1 ? '0' : String(3 - Math.floor(t - tm0)), pulse = t >= tm0 && t < tm1 ? 1 + 0.12 * Math.pow(1 - ((t - tm0) % 1), 3) : 1;
        c.save(); c.translate(bx, by + 10); c.scale(pulse, pulse); outl(c, n, 0, 0, 230, '#FFFDF8', '#3E471E', 22, 200); c.restore();
        if (t >= tm0 && t < tm1) { c.save(); c.strokeStyle = '#E0474C'; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.arc(bx, by, br + 28, -Math.PI / 2, -Math.PI / 2 + TAU * (1 - (t - tm0) / (tm1 - tm0))); c.stroke(); c.restore(); } } }
    if (t >= tm1 && t < ans) { const k = P(t, tm1, tm1 + 0.15), sh = 1 - P(t, tm1 + 0.3, ans); c.save(); c.globalAlpha = sh; c.strokeStyle = '#FFFDF8'; c.lineWidth = 7; c.lineCap = 'round'; for (let n = 0; n < 9; n++) { const a = n * 0.7 + 0.3, r0 = 210, r1 = 210 + 180 * k * (0.6 + hash(n) * 0.5); c.beginPath(); c.moveTo(BX + Math.cos(a) * r0, BY + Math.sin(a) * r0); c.lineTo(BX + Math.cos(a) * r1, BY + Math.sin(a) * r1 + (n % 2 ? 14 : -14)); c.stroke(); } c.restore();
      const kk = eBack(P(t, tm1, tm1 + 0.2), 2.4); c.save(); c.translate(540, 560); c.rotate(-0.06); c.scale(kk, kk); outl(c, 'ВРЕМЯ!', 0, 0, 120, '#FFE15A', '#3E471E', 18, 800); c.restore(); }
    // the question bubble (stays until the timer starts)
    const bq = { ...SP['q' + i + '_q'], fs: 78, hold: Math.max(0.05, tm0 - (qs.t + qs.d) - 0.25) }; UI.bubble(c, bq, t, { x: st.x + 30, y: st.y - 500 }, 'left');
    // answer card
    const ak = eBack(P(t, ans, ans + 0.3), 2.2), as = SP['q' + i + '_a'], note = { 1: '', 2: 'это просто «привет», а не отчёт', 3: 'Not at all = «нет, не против», можно садиться' }[i];
    if (ak > 0) { c.save(); c.translate(540, 820); c.scale(ak, ak); const h = note ? 420 : 360; c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -470 + 8, -h / 2 + 12, 940, h, 44); c.fill(); c.fillStyle = '#4CAF6A'; rr(c, -470, -h / 2, 940, h, 44); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 8; c.stroke();
      UI.check(c, -400, -h / 2 + 20, 40);
      outl(c, as.text, 0, note ? -85 : -50, 104, '#FFFDF8', '#2A6A3E', 14, 840); fit(c, as.ru, 0, note ? 40 : 70, 52, '#FFF4C2', 840, 'Nun9'); if (note) fit(c, note, 0, 140, 38, '#FFFDF8', 840, 'Nun9'); c.restore(); }
    // short gags after the answer
    if (i === 1 && t > ev('Q1', 'gag')) { const u = t - ev('Q1', 'gag'); for (let n = 0; n < 46; n++) { const a = -1.2 + (hash(n) - 0.5) * 1.6, v = 700 + hash(n + 5) * 700, x = mz.x + Math.cos(a) * v * u * 0.55, y = mz.y + Math.sin(a) * v * u * 0.55 + 900 * u * u * 0.6; c.save(); c.translate(x, y); c.rotate(u * 9 + n); c.fillStyle = ['#EE5E9A', '#F2C14E', '#3FB6A8', '#7FB0D8', '#E0474C'][n % 5]; c.fillRect(-9, -5, 18, 10); c.restore(); } }
    if (i === 2 && t > ev('Q2', 'gag') && t < ans + 2.2) { const k = eBack(P(t, ev('Q2', 'gag') + 0.2, ev('Q2', 'gag') + 0.5), 2.4); c.save(); c.translate(540, 520); c.rotate(0.05); c.scale(k, k); outl(c, 'НЕ БУКВАЛЬНО!', 0, 0, 84, '#FFE15A', '#3E471E', 14, 880); c.restore(); }
    if (i === 2 && t < ans) { const u = t - qs.t; cloud(c, 160 + ((u * 40) % 900), 520, 1.3, 0.9); }
    if (i === 3 && t > ev('Q3', 'gag') + 0.6) { const k = eBack(P(t, ev('Q3', 'gag') + 0.6, ev('Q3', 'gag') + 0.9), 2.4); c.save(); c.translate(540, 520); c.rotate(-0.04); c.scale(k, k); outl(c, 'КУДА ЭТО ОН?', 0, 0, 80, '#FFE15A', '#3E471E', 14, 880); c.restore(); }
    // progress pills + header
    for (let n = 1; n <= 3; n++) { const x = 540 + (n - 2) * 150, on = n <= i; c.fillStyle = on ? '#EE5E9A' : 'rgba(255,255,255,.7)'; rr(c, x - 60, 170, 120, 30, 15); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 5; c.stroke(); }
    if (t < tm0 && i === 1) K.titleRibbon(c, t, 540, 455);
    else { const lab = `ВОПРОС ${i} ИЗ 3`; outl(c, lab, 540, 270, 60, '#FFFDF8', '#3E471E', 12, 700); }
  } else {
    const ak = eBack(P(t, ev('FIN', 'ask'), ev('FIN', 'ask') + 0.35), 2.2);
    if (ak > 0) { c.save(); c.translate(540, 560); c.rotate(-0.05); c.scale(ak, ak); outl(c, 'СКОЛЬКО', 0, -90, 120, '#FFFDF8', '#3E471E', 18, 900); outl(c, 'ИЗ 3?', 0, 60, 230, '#EE5E9A', '#FFFDF8', 20, 900); c.restore();
      const dk = eBack(P(t, ev('FIN', 'ask') + 0.3, ev('FIN', 'ask') + 0.6), 2.2); for (let n = 0; n < 3; n++) { c.save(); c.translate(540 + (n - 1) * 190, 930); c.scale(dk, dk); c.fillStyle = '#FFFDF8'; c.beginPath(); c.arc(0, 0, 70, 0, TAU); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 8; c.stroke(); fit(c, '?', 0, 6, 90, '#EE5E9A', 90); c.restore(); } }
    const fb = { ...SP.fin, fs: 70, hold: 1.2 }; UI.bubble(c, fb, t, { x: st.x + 30, y: st.y - 500 }, 'left'); }
  UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
}
E.run('pingpong', NF, renderFrame);
