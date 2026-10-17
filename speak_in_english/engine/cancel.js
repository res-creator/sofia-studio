// "Cancel the gym subscription" episode renderer: node cancel.js start end out.mp4 | --png=f1,f2
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, rgba, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/cancel/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SC, SP, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf, EV, put } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;

const HER = { ...BASE.her_london };
const BRICK = { ...BASE.mike, top: { type: 'tank', col: '#E0474C', text: 'FIT\nMAX', textSize: 50, textCol: '#FFFDF8' } };
const CHAD = { ...BASE.oliver, top: { type: 'blazer', col: '#6A3FB0', shirt: '#F7F9FC', tie: '#F2C14E' } };
const G = { her: geom(HER), brick: geom(BRICK), chad: geom(CHAD) };
const FY = 60, SOFA = { x0: -480, x1: 240 }, HERX = -110, BRX = 760, DOORX = -900;
function txt(c, s, x, y, size, col, font = 'Unb9', align = 'center') { c.font = `${size}px ${font}`; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- room (prerendered)
const BX0 = -1700, BY0 = -3400, BW = 3800, BH = 4100, BS = 0.5;
function drawRoom(c) {
  c.fillStyle = '#CFE7DD'; c.fillRect(BX0, BY0, BW, BH); c.fillStyle = 'rgba(255,255,255,.3)'; for (let x = BX0; x < BX0 + BW; x += 180) c.fillRect(x, BY0, 70, BH);
  c.fillStyle = '#B9D6CB'; c.fillRect(BX0, -520, BW, 580);
  c.fillStyle = '#FFFDF8'; c.fillRect(60, -1800, 560, 700); c.fillStyle = '#A9D8F2'; c.fillRect(80, -1780, 520, 660); c.fillStyle = '#FFFDF8'; c.fillRect(330, -1780, 20, 660); c.fillRect(80, -1460, 520, 20);
  for (const s of [-1, 1]) paint(c, q => { const x = s < 0 ? 0 : 560; q.m(x, -1860); q.l(x + 120, -1860); q.q(x + 80 + s * 20, -1400, x + 110, -1060); q.l(x, -1060); q.z(); }, '#F2C14E', { sd: 8, hd: 4, lw: 3 });
  // door (left)
  c.fillStyle = '#FFFDF8'; c.fillRect(DOORX - 170, -1500, 340, 1560); c.fillStyle = '#8A5A3A'; c.fillRect(DOORX - 150, -1480, 300, 1540); c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(DOORX + 110, -700, 16, 0, TAU); c.fill();
  // lamp + plant
  c.fillStyle = '#C9A06A'; c.fillRect(1250, -1300, 14, 1360); paint(c, q => { q.m(1170, -1300); q.l(1344, -1300); q.l(1300, -1450); q.l(1214, -1450); q.z(); }, '#F7B6CF', { sd: 6, hd: 4, lw: 3 });
  paint(c, q => { q.m(-1400, -260); q.l(-1220, -260); q.l(-1240, 40); q.l(-1380, 40); q.z(); }, '#C96A3A', { sd: 4, hd: 2, lw: 3 }); for (let i = 0; i < 6; i++) paint(c, q => q.e(-1310 + Math.cos(i) * 80, -380 - Math.sin(i * 1.7) * 90, 70, 34), '#4CAF6A', { sd: 3, hd: 2, lw: 2 });
  const fg = c.createLinearGradient(0, FY, 0, 700); fg.addColorStop(0, '#C99A6A'); fg.addColorStop(1, '#A87A4E'); c.fillStyle = fg; c.fillRect(BX0, FY, BW, BY0 + BH - FY); c.strokeStyle = 'rgba(0,0,0,.1)'; c.lineWidth = 3; for (let y = FY + 40; y < 700; y += 60) { c.beginPath(); c.moveTo(BX0, y); c.lineTo(BX0 + BW, y); c.stroke(); }
}
const BGB = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); { const c = BGB.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); c.filter = 'blur(1.5px)'; drawRoom(c); }

// ---------------- props
function visitsBoard(c, n, k) { c.save(); c.translate(820, -1250); c.rotate(0.03); c.fillStyle = '#FFFDF8'; c.strokeStyle = '#2B2F3A'; c.lineWidth = 5; rr(c, -170, -130, 340, 260, 16); c.fill(); c.stroke(); c.fillStyle = '#E0474C'; rr(c, -170, -130, 340, 70, 16); c.fill(); txt(c, 'FITMAX', 0, -95, 40, '#FFFDF8'); txt(c, 'VISITS:', 0, -10, 40, '#2B2F3A'); c.save(); c.translate(0, 70); c.scale(1 + 0.4 * k, 1 + 0.4 * k); txt(c, String(n), 0, 0, 70, n === 0 ? '#2B2F3A' : '#E0474C'); c.restore(); c.restore(); }
function sofa(c, x, t) { paint(c, q => { q.m(x + SOFA.x0, -760); q.l(x + SOFA.x1, -760); q.l(x + SOFA.x1, -300); q.l(x + SOFA.x0, -300); q.z(); }, '#E0743B', { sd: 12, hd: 6, lw: 3 }); paint(c, q => { q.m(x + SOFA.x0 - 50, -420); q.l(x + SOFA.x1 + 50, -420); q.l(x + SOFA.x1 + 50, -80); q.l(x + SOFA.x0 - 50, -80); q.z(); }, '#F08A50', { sd: 10, hd: 5, lw: 3 }); c.fillStyle = '#6A4630'; c.fillRect(x + SOFA.x0 - 30, -80, 30, 140); c.fillRect(x + SOFA.x1 + 0, -80, 30, 140); }
function coffeeTable(c) { paint(c, q => { q.m(400, -330); q.l(720, -330); q.l(720, -300); q.l(400, -300); q.z(); }, '#B98A62', { sd: 3, hd: 2, lw: 3 }); c.fillStyle = '#8A6A4A'; c.fillRect(420, -300, 22, 360); c.fillRect(678, -300, 22, 360); paint(c, q => q.e(560, -360, 70, 30), '#F2C14E', { sd: 3, hd: 2, lw: 3 }); }
function rack(c, k) { c.save(); c.translate(560, FY); c.scale(1, eBack(k, 1.6)); c.fillStyle = '#3A3F4B'; c.fillRect(-180, -520, 24, 520); c.fillRect(156, -520, 24, 520); for (let r = 0; r < 3; r++) { c.fillRect(-190, -480 + r * 160, 380, 18); for (let i = 0; i < 4; i++) { const x = -130 + i * 86, y = -500 + r * 160; c.fillStyle = '#9AA3B2'; c.fillRect(x - 20, y - 6, 40, 12); c.fillStyle = '#2B2F3A'; c.fillRect(x - 30, y - 22, 14, 44); c.fillRect(x + 16, y - 22, 14, 44); c.fillStyle = '#3A3F4B'; } } c.restore(); }
function mat(c, k) { const w = 700 * eOut(k); c.fillStyle = '#7A3FB0'; rr(c, 300, FY - 4, Math.max(40, w), 40, 18); c.fill(); if (k < 1) { c.fillStyle = '#5A2F90'; c.beginPath(); c.arc(300 + w, FY + 10, 40 * (1 - k) + 14, 0, TAU); c.fill(); } }
function treadmill(c, x) { c.save(); c.translate(x, FY); paint(c, q => { q.m(-340, -120); q.l(340, -120); q.l(360, 0); q.l(-360, 0); q.z(); }, '#2B2F3A', { sd: 6, hd: 3, lw: 3 }); c.fillStyle = '#4A4F5B'; c.fillRect(-320, -110, 640, 30); c.fillStyle = '#9AA3B2'; c.fillRect(260, -760, 24, 640); c.fillRect(-10, -760, 290, 24); paint(c, q => { q.m(150, -860); q.l(330, -860); q.l(320, -740); q.l(160, -740); q.z(); }, '#3A3F4B', { sd: 4, hd: 2, lw: 3 }); c.fillStyle = '#7CF29A'; c.fillRect(180, -840, 120, 60); txt(c, 'GO!', 240, -810, 30, '#1A2A1A'); c.restore(); }
function crisps(ctx) { ctx.rotate(-0.2); paint(ctx, q => { q.m(-50, -150); q.l(50, -150); q.l(60, 20); q.l(-60, 20); q.z(); }, '#F2C14E', { sd: 4, hd: 2, lw: 3 }); txt(ctx, 'CRISPS', 0, -60, 22, '#E0474C'); }
function poof(c, x, y, k) { if (k <= 0 || k >= 1) return; c.save(); c.globalAlpha = 1 - k; c.fillStyle = '#FFFFFF'; for (let i = 0; i < 9; i++) { const a = i / 9 * TAU, r = 60 + 220 * k; c.beginPath(); c.arc(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.6, 70 * (1 - k * 0.5), 0, TAU); c.fill(); } c.restore(); }

// ---------------- state
const ev = k => EV(k);
const gearOn = t => t < ev('cancel') || t > 1e8; // equipment exists until the cancellation
function herPos(t, L) { // where she is: 'sofa' | 'stand' | 'tread'
  if (L === 'hook' || L === 'outro') return 'sofa';
  if (t > ev('cancel') + 0.35) return 'sofa';
  if (L === 'C2') return 'tread';
  if (t > ev('tread') - 0.1) return 'stand';
  return 'sofa';
}
function herState(t, L) {
  const g = G.her, pos = herPos(t, L);
  const st = { t, talk: talk('her', t), mood: 'neutral', turn: 0.4, look: 0.7, armL: reach(g, -1, -g.sw * 0.6, g.ySh + 300), armR: reach(g, 1, g.sw * 1.0, g.ySh + 140), items: { R: ctx => { ctx.fillStyle = '#2B2F3A'; rr(ctx, -26, -100, 52, 100, 10); ctx.fill(); ctx.fillStyle = '#9FD8F2'; ctx.fillRect(-20, -92, 40, 82); } } };
  if (pos === 'sofa') { st.legPose = 'sit'; st.drop = 330; }
  if (L === 'hook' || (t > ev('cancel') + 0.35 && L === 'C2')) { st.items = { R: crisps }; st.armR = reach(g, 1, g.sw * 1.2, g.ySh + 200); st.mood = 'happy'; }
  if (L === 'hook') st.mood = 'neutral';
  if (L === 'A1') st.mood = t > ev('mat') ? 'shock' : 'neutral';
  if (L === 'A2') st.mood = t > ev('rack') ? 'shock' : (t > ev('del') ? 'skeptical' : 'neutral');
  if (L === 'B1') { st.mood = t > ev('brick') ? 'surprised' : 'neutral'; if (t > ev('visits')) st.mood = 'worried'; }
  if (L === 'B2') { st.mood = t > ev('tread') ? 'shock' : 'neutral'; }
  if (L === 'C1') { st.mood = t > ev('cry') ? 'worried' : 'neutral'; }
  if (L === 'C2') { st.mood = speaking('c2_her', t, 0.1) ? 'smug' : 'neutral'; if (t > ev('cancel')) { st.mood = 'happy'; st.laugh = t < ev('cancel') + 1.0; } if (t > ev('back')) { st.mood = 'shock'; st.turn = -0.4; st.look = -0.9; } }
  if (L === 'outro') { st.mood = 'happy'; st.turn = 0; st.look = 0; }
  return st;
}
function brickState(t, L) {
  const g = G.brick, st = { t, talk: talk('brick', t), mood: 'happy', turn: -0.4, look: -0.8, armL: reach(g, -1, -g.sw * 0.6, g.ySh + 320), armR: reach(g, 1, g.sw * 0.6, g.ySh + 320) };
  const flex = () => { st.armL = reach(g, -1, -g.sw * 1.7, g.ySh - 60, { fist: true }); st.armR = reach(g, 1, g.sw * 1.7, g.ySh - 60, { fist: true }); };
  if (speaking('b1_x2', t, 0.05, 0.3) || speaking('c2_b', t, 0.05, 0.6)) flex();
  if ((L === 'B2' || (L === 'B1' && t > ev('visits') + 0.6)) && !speaking('b1_x2', t)) { const sq = Math.sin(t * 5) > 0; st.legPose = sq ? 'squat' : 'stand'; st.armL = reach(g, -1, -g.sw * 1.3, g.ySh + 60); st.armR = reach(g, 1, g.sw * 1.3, g.ySh + 60); }
  if (L === 'C1' && t > ev('cry')) { st.mood = 'sad'; st.front = (cc, gg) => { cc.fillStyle = '#7FC6F2'; for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const k = ((t * 1.4 + i / 3) % 1); cc.globalAlpha = 1 - k; cc.beginPath(); cc.ellipse(gg.head.x + s * 40, gg.head.y + 30 + k * 120, 9, 14, 0, 0, TAU); cc.fill(); } cc.globalAlpha = 1; }; }
  if (L === 'C2') st.mood = 'surprised';
  if (L === 'C2' && t > ev('back')) { st.mood = 'happy'; st.turn = 0.4; st.look = 0.8; }
  return st;
}
function brickX(t, L) { if (L === 'B1') return lerp(DOORX, BRX, eIO(P(t, ev('brick'), ev('brick') + 1.0))); if (L === 'C2' && t > ev('back') - 0.5) return DOORX + 120; return BRX; }
const brickVisible = (t, L) => (L === 'B1' && t > ev('brick')) || L === 'B2' || L === 'C1' || (L === 'C2' && (t < ev('cancel') || t > ev('back') - 0.45));
function chadState(t, L) { const g = G.chad, st = { t, talk: talk('chad', t), mood: 'happy', turn: 0, look: 0, armL: reach(g, -1, -g.sw * 0.6, g.ySh + 300), armR: reach(g, 1, g.sw * 0.6, g.ySh + 300) };
  if (L === 'A2' && t > ev('del') - 0.1 && t < ev('wink') + 0.6) { st.mood = 'smug'; st.look = 0.6; st.lookY = 0.8; if (t > ev('wink')) { st.look = 0; st.lookY = 0; st.squint = true; st.mood = 'happy'; } }
  if (L === 'C1' && t > ev('cry')) st.mood = 'sad';
  if (L === 'C2' && t > SP.c2_x.t - 0.3 && t < ev('cancel')) st.mood = 'sad';
  st.front = (cc, gg) => { cc.strokeStyle = '#2B2F3A'; cc.lineWidth = 10; cc.beginPath(); cc.arc(gg.head.x, gg.head.y - 10, G.chad.hw * 1.05, Math.PI * 1.1, Math.PI * 1.9); cc.stroke(); cc.fillStyle = '#2B2F3A'; cc.fillRect(gg.head.x - G.chad.hw * 1.1, gg.head.y - 20, 22, 60); cc.lineWidth = 6; cc.beginPath(); cc.moveTo(gg.head.x - G.chad.hw * 1.0, gg.head.y + 30); cc.quadraticCurveTo(gg.head.x - G.chad.hw * 0.8, gg.head.y + 110, gg.head.x - 20, gg.head.y + 110); cc.stroke();
    if (L === 'C1' && t > ev('cry')) { cc.fillStyle = '#7FC6F2'; for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const k = ((t * 1.4 + i / 3) % 1); cc.globalAlpha = 1 - k; cc.beginPath(); cc.ellipse(gg.head.x + s * 40, gg.head.y + 30 + k * 120, 9, 14, 0, 0, TAU); cc.fill(); } cc.globalAlpha = 1; } };
  return st; }
function chadWindow(c, t, L) { // video call, screen space
  const show = !['hook', 'outro'].includes(L) && t > (SP.a1_her.t - 0.2) && t < endOf('c2_x2') + 0.5; if (!show) return null;
  const k = L === 'A1' ? eBack(P(t, SP.a1_her.t - 0.2, SP.a1_her.t + 0.2), 1.6) : 1, x = 30, y = 1230, w = 380, h = 450;
  K.callWindow(c, x, y, w, h, 'CHAD · FITMAX', '#6A3FB0', k, (cc, ww, hh) => {
    cc.fillStyle = '#EDE6F7'; cc.fillRect(0, 0, ww, hh); cc.fillStyle = '#6A3FB0'; cc.fillRect(0, 40, ww, 50); txt(cc, 'RETENTION DEPT.', ww / 2, 65, 26, '#FFFDF8');
    cc.save(); cc.translate(ww / 2, hh + 620); cc.scale(0.6, 0.6); Hq.human(cc, CHAD, chadState(t, L)); cc.restore();
    // his monitor with her words (A2: he deletes "cancel")
    if (L === 'A2' && t > SP.a2_her.t) { const d = P(t, ev('del'), ev('del') + 0.72); const full = 'I want cancel my membership', cut = 'I want ' + 'cancel'.slice(0, Math.round(6 * (1 - d))) + ' my membership'; cc.fillStyle = '#2B2F3A'; rr(cc, 20, hh - 190, ww - 40, 110, 12); cc.fill(); cc.fillStyle = '#9FE0B8'; cc.font = '24px Nun9'; cc.textAlign = 'left'; cc.textBaseline = 'middle'; cc.fillText(t > ev('del') ? cut : full, 36, hh - 150); if (Math.floor(t * 4) % 2 && d < 1 && t > ev('del')) cc.fillRect(36 + cc.measureText(cut.slice(0, 7 + Math.round(6 * (1 - d)))).width, hh - 168, 4, 36); txt(cc, '(she said CANCEL)', ww / 2, hh - 105, 20, '#F2C14E', 'Nun9'); }
  });
  return { x: x + w / 2, y: y };
}
function mailCard(c, t) { // phone emails in C2: cancelled, then free year
  const a = ev('cancel') + 0.4, b = ev('free'); if (t < a) return;
  const k = eBack(P(t, a, a + 0.3), 1.6) * (1 - P(t, SP.c2_nar.t + 1.5, SP.c2_nar.t + 1.9)); if (k <= 0) return;
  K.phone(c, 600, 1470, 0.5 * k, (cc, w, h) => { txt(cc, 'Mail', w / 2, 40, 30, '#2B2F3A');
    const card = (y, title, l1, l2, col) => { cc.fillStyle = '#FFFFFF'; rr(cc, 20, y, w - 40, 210, 20); cc.fill(); cc.fillStyle = col; rr(cc, 20, y, w - 40, 60, 20); cc.fill(); txt(cc, title, w / 2, y + 32, 28, '#FFFFFF'); txt(cc, l1, w / 2, y + 105, 30, '#2B2F3A', 'Nun9'); txt(cc, l2, w / 2, y + 155, 26, '#6A707A', 'Nun9'); };
    card(90, 'MEMBERSHIP CANCELLED', '£0.00 / month', 'no further payments', '#2F8A4A');
    if (t > b) card(330, 'GOODBYE GIFT!', 'FREE YEAR · £0.00', 'no card needed', '#6A3FB0'); }, -0.06);
}

function world(c, t, L) {
  c.drawImage(BGB, BX0, BY0, BW, BH);
  const heads = {};
  const vis = L === 'C2' && t > ev('visits2') ? 365 : (t > ev('visits') && !['hook'].includes(L) && !(L === 'C2' && t > ev('cancel') && t < ev('visits2'))) ? '1?' : 0;
  visitsBoard(c, vis, L === 'B1' ? Math.exp(-(t - ev('visits')) * 6) * (t > ev('visits') ? 1 : 0) : (L === 'C2' ? Math.exp(-(t - ev('visits2')) * 6) * (t > ev('visits2') ? 1 : 0) : 0));
  if (L === 'C2' && t > ev('back') - 0.5) { c.fillStyle = '#3A2A1A'; c.fillRect(DOORX - 150, -1480, 300, 1540); }
  const gear = !(L === 'C2' && t > ev('cancel'));
  const pk = L === 'C2' ? P(t, ev('cancel'), ev('cancel') + 0.6) : 0;
  // coffee table -> dumbbell rack
  if (t > ev('rack') && gear) rack(c, L === 'A2' ? P(t, ev('rack'), ev('rack') + 0.4) : 1); else coffeeTable(c);
  // sofa: pushed out by the treadmill in B2, slides back after the cancellation
  let sx = 0; if (L === 'B2' && t > ev('tread')) sx = -1500 * eIn(P(t, ev('tread'), ev('tread') + 0.9)); if (L === 'C1') sx = -1500; if (L === 'C2') sx = t > ev('cancel') ? lerp(-1500, 0, eOut(P(t, ev('cancel'), ev('cancel') + 0.4))) : -1500;
  sofa(c, sx, t);
  const tx = L === 'B2' ? lerp(1800, 300, eOut(P(t, ev('tread') - 0.4, ev('tread') + 0.5))) : 300;
  if (gear && (L === 'C1' || L === 'C2' || (L === 'B2' && t > ev('tread') - 0.4))) treadmill(c, tx);
  if (gear && t > ev('mat') && !['hook'].includes(L)) mat(c, L === 'A1' ? P(t, ev('mat'), ev('mat') + 0.5) : 1);
  if (brickVisible(t, L)) heads.brick = put(c, BRICK, brickState(t, L), brickX(t, L), FY);
  const pos = herPos(t, L); const hx = pos === 'sofa' ? HERX : pos === 'tread' ? 300 : -250, hy = pos === 'tread' ? FY - 120 : FY;
  heads.her = put(c, HER, herState(t, L), L === 'B2' && t > ev('tread') - 0.1 ? lerp(HERX, -250, eOut(P(t, ev('tread') - 0.1, ev('tread') + 0.4))) : hx, hy);
  if (pk > 0) { poof(c, 300, -300, pk); poof(c, 560, -300, pk); poof(c, BRX, -900, pk); }
  return heads;
}
function shotFor(t) {
  const sc = sceneAt(t), L = sc.id, room = { x: 200, y: -820, z: 0.7, r: 0 };
  if (L === 'hook' || L === 'outro') return room;
  const u = t - sc.s; if (u < 1.15) return { ...room, z: 0.66, cut: u < 0.85 };
  if (L === 'B2' && t > ev('tread') - 0.5 && t < SP.b2_nar.t) return { x: 300, y: -800, z: 0.62, r: 0 };
  if (L === 'C2' && speaking('c2_her', t, 0.2, 0.3)) return { x: 300, y: -1650, z: 0.72, r: 0 };
  if (L === 'C2' && t > ev('back') - 0.15 && t < SP.c2_nar.t) return { x: -500, y: -1300, z: 0.75, r: 0 };
  if (speaking('b1_x2', t, 0.2, 0.3)) return { x: 600, y: -1450, z: 0.8, r: 0 };
  return room;
}
const CAM = E.simulateCamera(TL, shotFor, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L); const M = c.getTransform(); c.restore(); return { heads, M }; }
function drawHook(c, t) {
  drawWorld(c, t, 'hook', { x: 200, y: -680, z: 0.7, r: 0 }); Hq.vignette(c, W, HH, 0.3);
  // the endless bank statement unrolling from the top
  const L = 2600, off = Math.min(L - 1100, t * 420); c.save(); c.translate(770, 520); c.rotate(0.05); c.beginPath(); c.rect(-200, 0, 400, 1250); c.clip(); c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(-190, 8, 400, 1250); c.fillStyle = '#FFFDF8'; c.fillRect(-200, 0, 400, 1250);
  const M = ['OCT', 'SEP', 'AUG', 'JUL', 'JUN', 'MAY', 'APR', 'MAR', 'FEB', 'JAN', 'DEC', 'NOV']; for (let i = 0; i < 12; i++) { const y = 80 + i * 200 - (L - 1100 - off) * 0; const yy = y + off - (L - 1100); if (yy < -80 || yy > 1300) continue; txt(c, '01 ' + M[i], -170, yy, 26, '#6A707A', 'Nun9', 'left'); txt(c, 'FITMAX GYM', -170, yy + 40, 30, '#2B2F3A', 'Unb9', 'left'); txt(c, '-£39.99', 170, yy + 6, 34, '#E0474C', 'Unb9', 'right'); c.fillStyle = '#E3DED4'; c.fillRect(-180, yy + 85, 360, 3); }
  c.restore(); const sk = eBack(P(t, 1.2, 1.5), 2.2); if (sk > 0) { c.save(); c.translate(820, 1500); c.rotate(-0.12); c.scale(sk, sk); c.fillStyle = '#F7E36A'; c.fillRect(-150, -60, 300, 120); txt(c, 'VISITS: 0', 0, 0, 46, '#E0474C'); c.restore(); }
  K.titleRibbon(c, t, 540, 330); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t);
}
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1;
  const sc = sceneAt(t);
  if (sc.id === 'hook') { drawHook(c, t); Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  if (sc.id === 'outro') { K.outro(c, t, { q: ['А ТЕБЕ УДАВАЛОСЬ', 'ОТМЕНИТЬ ПОДПИСКУ?'], rows: [['B1', "I'd like to cancel my subscription."], ['B2', "I'm not interested in any offers."], ['C1', 'Could you confirm the cancellation in writing?'], ['A2', 'I want to cancel my membership.']], cta: ['ОТПРАВЬ ТОМУ, КТО ПЛАТИТ', 'ЗА СПОРТЗАЛ И НЕ ХОДИТ'], hero: (cc, tt) => put(cc, HER, { t: tt, mood: 'happy', turn: 0, look: 0, armL: reach(G.her, -1, -G.her.sw * 0.6, G.her.ySh + 300), armR: reach(G.her, 1, G.her.sw * 1.2, G.her.ySh + 200), items: { R: crisps } }, 0, 0) }); Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const f = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[f], sh = shake(t);
  const { heads, M } = drawWorld(c, t, sc.id, cam, sh);
  Hq.vignette(c, W, HH, 0.26);
  const proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f });
  const win = chadWindow(c, t, sc.id);
  K.bubbles(c, t, sc, heads, proj, { names: { brick: ['BRICK', '#E0474C'] }, hold: { c2_her: 0.25 } });
  if (win) { const l = sc.id.toLowerCase(); for (const sp of TL.speech.filter(x => x.who === 'chad' && x.id.startsWith(l + '_'))) UI.bubble(c, { ...sp, hold: 0.6 }, t, win, 'right', ['CHAD', '#6A3FB0']); }
  if (sc.id === 'C2') { K.dots(c, t, endOf('c2_her') + 0.3, SP.c2_x.t - 0.1); mailCard(c, t); K.pop(c, t, 'БА-ДУМ-ТСС!', endOf('c2_b') + 0.15, SP.c2_nar.t + 0.6, 540, 900); }
  K.hud(c, t, sc);
}
E.run('cancel', NF, renderFrame);
