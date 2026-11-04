// "U up?" — rubric «Ответ на вопрос из комментариев» (hard_cut camera, ~34 s): node uup.js start end out.mp4 | --png=f1,f2
// Dark bedroom at night: she sits up in bed in pyjamas, bedside clock 03:04, the phone buzzes on the pillow.
// The ex (Mark) is seen only as the contact photo in the chat. Shots tagged 'ui:chat' replace the world with a full-screen phone on a solid backdrop.
// Flow: hook (title overlay on the live scene, chat "Hey... you up?", comment plate) -> 1 · ХОЛОДНО (No. -> he is typing at once)
// -> 2 · С ЮМОРОМ (Yes. Still not interested. -> phone face down, blanket over her head) -> 3 · КАК НОСИТЕЛЬ (lose my number + Bella tip)
// -> beat -> his reply "Wrong chat. That was for my mum." -> her offended face -> end screen (1 / 2 / 3, СОХРАНИ, ПОДПИСАТЬСЯ + cursor).
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas, human } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/uup/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];

// ---------------- cast: her in pyjamas (light-blue, white dots); Mark only as the contact photo
const HER = { ...BASE.her_lift, earrings: null, top: { type: 'longsleeve', col: '#8FB8E8', dots: 'rgba(255,255,255,.75)' }, bottom: { type: 'joggers', col: '#8FB8E8' }, shoes: { col: '#F4EFE6', acc: null } };
const MARK = BASE.mark;
const G = { her: geom(HER), mark: geom(MARK) };
const SEAT = 330, HX = 0, PILX = 360, PILY = -610;     // she sits up in bed (upper body dropped by SEAT); second pillow (phone) on her right
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function brokenHeart(c, x, y, s, col = '#E0474C') {   // drawn icon (no emoji glyphs): a heart split by a zig-zag crack, halves pushed apart
  const heart = () => { c.beginPath(); c.moveTo(x, y + s * 0.95); c.bezierCurveTo(x - s * 1.5, y - s * 0.05, x - s * 0.75, y - s * 1.25, x, y - s * 0.5); c.bezierCurveTo(x + s * 0.75, y - s * 1.25, x + s * 1.5, y - s * 0.05, x, y + s * 0.95); c.closePath(); };
  const crack = [[0, -0.6], [-0.18, -0.15], [0.16, 0.2], [-0.08, 0.55], [0, 1.0]];
  for (const sd of [-1, 1]) { c.save(); c.translate(sd * s * 0.12, 0); c.translate(x, y + s); c.rotate(sd * 0.12); c.translate(-x, -(y + s));
    c.beginPath(); c.moveTo(x + sd * s * 2, y - s * 2); for (const [a, b] of crack) c.lineTo(x + a * s, y + b * s); c.lineTo(x + sd * s * 2, y + s * 2); c.closePath(); c.clip();
    heart(); c.fillStyle = col; c.fill(); c.restore(); } }

// ---------------- bedroom (prerendered, softly blurred)
const BX0 = -2400, BY0 = -2800, BW = 4800, BH = 4200, BS = 0.5;
function drawRoom(c) {
  c.fillStyle = '#1D2340'; c.fillRect(BX0, BY0, BW, BH); c.fillStyle = 'rgba(255,255,255,.025)'; for (let x = BX0; x < BX0 + BW; x += 180) c.fillRect(x, BY0, 80, BH);
  // window with the moon and city lights (right)
  c.fillStyle = '#2E3658'; rr(c, 880, -2150, 900, 1050, 16); c.fill(); c.fillStyle = '#0F1430'; rr(c, 910, -2120, 840, 990, 10); c.fill();
  c.fillStyle = '#FFF4C8'; c.beginPath(); c.arc(1500, -1900, 80, 0, TAU); c.fill(); c.fillStyle = '#0F1430'; c.beginPath(); c.arc(1540, -1930, 74, 0, TAU); c.fill();
  for (let i = 0; i < 16; i++) { c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(930 + hash(i) * 800, -2100 + hash(i + 7) * 500, 6, 6); }
  for (let i = 0; i < 7; i++) { const x = 930 + i * 120, h = 160 + hash(i + 3) * 220; c.fillStyle = '#1A2148'; c.fillRect(x, -1130 - h, 100, h); c.fillStyle = 'rgba(255,225,120,.55)'; for (let k = 0; k < 4; k++) if (hash(i * 5 + k) > 0.5) c.fillRect(x + 20 + (k % 2) * 40, -1110 - h + 30 + Math.floor(k / 2) * 50, 18, 22); }
  c.fillStyle = '#2E3658'; c.fillRect(1320, -2120, 18, 990);
  // framed picture (left)
  c.fillStyle = '#3A4166'; rr(c, -1500, -2050, 420, 320, 10); c.fill(); c.fillStyle = '#4E5A8A'; rr(c, -1475, -2025, 370, 270, 6); c.fill(); c.fillStyle = '#6E7FB0'; c.beginPath(); c.moveTo(-1475, -1755); c.lineTo(-1350, -1900); c.lineTo(-1250, -1820); c.lineTo(-1170, -1890); c.lineTo(-1105, -1755); c.fill();
  c.fillStyle = '#262C4E'; c.fillRect(BX0, -260, BW, 1700); c.fillStyle = '#2E3560'; c.beginPath(); c.ellipse(0, 260, 1500, 200, 0, 0, TAU); c.fill();   // floor + rug
}
const mkBG = fn => { const b = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = b.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); c.filter = 'blur(1.2px)'; fn(c); return b; };
const BG = mkBG(drawRoom);
function bedBack(c) {   // headboard + mattress + her pillow (behind her)
  paint(c, q => { q.m(-640, -1420); q.q(0, -1540, 640, -1420); q.l(640, -300); q.l(-640, -300); q.z(); }, '#5B4A7A', { sd: 12, hd: 6, lw: 4 });
  c.strokeStyle = 'rgba(255,255,255,.08)'; c.lineWidth = 10; for (const x of [-480, -160, 160, 480]) { c.beginPath(); c.moveTo(x, -1440); c.lineTo(x, -620); c.stroke(); }
  paint(c, q => { q.m(-660, -560); q.l(700, -560); q.l(720, -120); q.l(-660, -120); q.z(); }, '#E8E2F0', { sd: 8, hd: 4, lw: 4 });
  c.save(); c.translate(HX - 30, -900); c.rotate(-0.04); paint(c, q => { q.m(-330, -150); q.q(0, -190, 330, -150); q.q(380, 0, 330, 150); q.q(0, 190, -330, 150); q.q(-380, 0, -330, -150); q.z(); }, '#F4F0FA', { sd: 8, hd: 4, lw: 4 }); c.restore();
}
function pillow2(c) { c.save(); c.translate(PILX, PILY); c.rotate(0.08); paint(c, q => { q.m(-190, -90); q.q(0, -120, 190, -90); q.q(230, 0, 190, 90); q.q(0, 120, -190, 90); q.q(-230, 0, -190, -90); q.z(); }, '#F4F0FA', { sd: 8, hd: 4, lw: 4 }); c.restore(); }
// nightstand + digital clock 03:04 (left)
function nightstand(c, t) { const x = -790;
  paint(c, q => { q.m(x - 170, -620); q.l(x + 170, -620); q.l(x + 170, 0); q.l(x - 170, 0); q.z(); }, '#6A4E7A', { sd: 10, hd: 5, lw: 4 });
  c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(x - 140, -420, 280, 6); c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(x, -330, 12, 0, TAU); c.fill();
  c.fillStyle = '#14161E'; rr(c, x - 150, -800, 300, 170, 22); c.fill(); c.strokeStyle = '#3A3F55'; c.lineWidth = 6; c.stroke();
  c.save(); c.shadowColor = 'rgba(255,70,70,.9)'; c.shadowBlur = 24; fitTxt(c, '03:04', x, -712, 96, '#FF5A5A', 270, 'Unb9'); c.restore(); }
// blanket over her lap; k = 0..1 pulls it over her head (lump), wobble after
function blanket(c, t, k) { const top = lerp(-560, -1260, eIO(k)), wob = k >= 1 ? Math.sin(t * 3) * 8 : 0;
  paint(c, q => { q.m(-680, -120); q.l(-670, -470); q.q(-520, top + 80, -260, top + wob); q.q(HX, top - 90 * eIO(k) - wob, 260, top + wob); q.q(560, top + 80, 720, -470); q.l(740, -120); q.z(); }, '#B48ED8', { sd: 12, hd: 6, lw: 4 });
  c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 8; for (let i = 0; i < 5; i++) { const x = -600 + i * 300; c.beginPath(); c.moveTo(x, Math.max(top + 120, -520)); c.lineTo(x - 20, -150); c.stroke(); } }
// phone lying on the pillow: screen up (buzzing, glowing, broken-heart notification) or face down
function phoneOnPillow(c, t, faceUp, buzz) { const sh = buzz ? Math.sin(t * 70) * 7 : 0; c.save(); c.translate(PILX + 10 + sh, PILY - 40); c.rotate((faceUp ? -0.25 : 1.42) + (buzz ? Math.sin(t * 55) * 0.05 : 0));
  if (faceUp) { const g = c.createRadialGradient(0, 0, 20, 0, 0, 340); g.addColorStop(0, 'rgba(170,205,255,.55)'); g.addColorStop(1, 'rgba(170,205,255,0)'); c.fillStyle = g; c.fillRect(-340, -340, 680, 680); }
  c.fillStyle = '#20232E'; rr(c, -62, -112, 124, 224, 20); c.fill();
  if (faceUp) { c.fillStyle = '#CFE2FF'; rr(c, -52, -100, 104, 200, 14); c.fill(); c.fillStyle = '#FFFFFF'; rr(c, -44, -70, 88, 50, 10); c.fill(); brokenHeart(c, -22, -46, 11); c.fillStyle = '#9AA3B8'; c.fillRect(-4, -54, 40, 7); c.fillRect(-4, -40, 30, 7); }
  else { c.fillStyle = '#3A3F55'; c.beginPath(); c.arc(-30, -80, 12, 0, TAU); c.fill(); }
  c.restore();
  if (buzz) { c.save(); c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 9; c.lineCap = 'round'; const a = (t * 4) % 1; for (const s of [-1, 1]) for (let i = 0; i < 2; i++) { const r = 150 + i * 46 + a * 18; c.globalAlpha = 0.9 - i * 0.35; c.beginPath(); c.arc(PILX + 10, PILY - 40, r, s < 0 ? Math.PI * 0.8 : -Math.PI * 0.2, s < 0 ? Math.PI * 1.2 : Math.PI * 0.2); c.stroke(); } c.restore(); } }
const phoneBack = ctx => { ctx.save(); ctx.rotate(-0.12); ctx.fillStyle = '#20232E'; rr(ctx, -40, -150, 80, 150, 14); ctx.fill(); ctx.fillStyle = '#3A3F55'; ctx.beginPath(); ctx.arc(-18, -128, 8, 0, TAU); ctx.arc(2, -128, 8, 0, TAU); ctx.fill(); ctx.restore(); };

// ---------------- state helpers
const phase = t => { const L = sceneAt(t).id;
  const inHand = !(L === 'hook' && t < hev('face') - 0.05) && !(L === 'o2' && t > ev('o2', 'flip') + 0.18);
  return { L, inHand, onPillow: !inHand, faceUp: L === 'hook', buzz: L === 'hook' && t < 1.1, cover: L === 'o2' ? clamp(P(t, ev('o2', 'blanket'), ev('o2', 'blanket') + 0.45)) : 0 }; };
const lap = (g, s) => reach(g, s, s * g.sw * 0.55, g.ySh + 300);
const holdPhone = g => reach(g, 1, g.sw * 0.25, g.ySh + 170);
function gest(st, g, t, side, base) { const u = t * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.45 + Math.sin(u) * 18), g.ySh + base + Math.cos(u) * 18, { planar: true }); }
function herState(t) { const g = G.her, ph = phase(t), L = ph.L, e = k => ev(L, k);
  const st = { t, talk: talk('her', t), mood: 'tired', turn: 0, look: 0, lookY: 0.45, drop: SEAT, legs: false, legPose: 'sit', floorShadow: false, armL: lap(g, -1), armR: lap(g, 1), items: {} };
  if (ph.inHand) { st.items = { R: phoneBack }; st.armR = holdPhone(g); }
  if (L === 'hook') { if (t < hev('face') - 0.05) { st.mood = 'tired'; st.turn = 0.45; st.look = 0.9; st.lookY = 0.35; st.blink = t < 0.25 ? 0.5 : 0; st.tilt = 0.05; }
    else { st.mood = 'skeptical'; st.lookY = 0.5; if (t > hev('three') - 0.1) { st.mood = 'smug'; st.lookY = 0; st.look = 0.1; } } }
  if (L === 'o1') { st.mood = 'neutral'; if (t > e('dots') - 0.05) { st.mood = 'shock'; st.blink = 0; } if (t > e('face') + 0.5) { st.mood = 'annoyed'; st.lookY = 0.45; st.tilt = -0.06; } }
  if (L === 'o2') { st.mood = 'bored'; if (t > e('flip') - 0.2) { st.mood = 'annoyed'; st.lookY = 0.3; st.turn = 0.3; st.look = 0.7; }
    const f = e('flip'); if (t > f - 0.15 && t < f + 0.3) { st.armR = reach(g, 1, PILX - HX - 40, PILY - SEAT * 0 - 20 + 60 * Math.sin(P(t, f - 0.15, f + 0.2) * Math.PI)); st.items = t < f + 0.18 ? { R: phoneBack } : {}; }
    if (t > e('blanket') - 0.15) { const top = lerp(-560, -1260, eIO(ph.cover)); st.armL = reach(g, -1, -g.sw * 0.6, Math.min(top + 40, -560)); st.armR = reach(g, 1, g.sw * 0.6, Math.min(top + 40, -560)); st.items = {}; st.mood = 'happy'; st.blink = 1; st.lookY = 0; st.turn = 0; st.look = 0; } }
  if (L === 'o3') { st.mood = 'smug'; st.lookY = 0; st.look = 0.15; st.turn = 0.1; if (speaking('o3_h', t, 0.05, 0.1)) gest(st, g, t, -1, 120); if (t > endOf('o3_h') + 0.3) { st.mood = 'happy'; st.lookY = 0.4; } }
  if (L === 'end') { st.mood = 'neutral'; st.lookY = 0.5; if (t > e('reply') + 0.3) { st.mood = 'skeptical'; } if (t > e('face') - 0.05) { st.mood = 'shock'; st.blink = 0; st.lookY = 0.3; } if (t > e('face') + 0.45) { st.mood = 'annoyed'; st.lookY = 0; st.look = 0.2; st.turn = 0.1; st.tilt = -0.08; st.headX = -8; } }
  return st; }

// ---------------- world (one set; the phone light lifts her face out of the dark)
function world(c, t, L, tag) { const heads = {}, ph = phase(t);
  c.drawImage(BG, BX0, BY0, BW, BH); nightstand(c, t); bedBack(c); pillow2(c);
  const hd = K.put(c, HER, herState(t), HX, 0); heads.her = hd;
  if (ph.onPillow && ph.faceUp) phoneOnPillow(c, t, ph.faceUp, ph.buzz);
  blanket(c, t, ph.cover);
  if (ph.onPillow && !ph.faceUp) phoneOnPillow(c, t, false, false);
  K.mark(c, ph.inHand ? 'face' : 'phone', ph.inHand ? HX : PILX, ph.inHand ? hd.y : PILY - 40, ph.inHand ? 200 : 170);
  // night tint, then the phone light
  c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = '#7F8AC4'; c.fillRect(BX0, BY0, BW, BH); c.restore();
  const lit = ph.inHand && ph.cover < 0.5, lx = ph.inHand ? hd.x + 40 : PILX, ly = ph.inHand ? hd.y + 120 : PILY - 40;
  if (lit || ph.faceUp) { c.save(); c.globalCompositeOperation = 'screen'; const g = c.createRadialGradient(lx, ly, 30, lx, ly, ph.inHand ? 520 : 420); g.addColorStop(0, 'rgba(120,150,210,.55)'); g.addColorStop(1, 'rgba(120,150,210,0)'); c.fillStyle = g; c.fillRect(lx - 600, ly - 600, 1200, 1200); c.restore(); }
  c.save(); c.globalCompositeOperation = 'screen'; c.save(); c.shadowColor = 'rgba(255,70,70,.9)'; c.shadowBlur = 20; fitTxt(c, '03:04', -790, -712, 96, 'rgba(255,90,90,.85)', 270, 'Unb9'); c.restore(); c.restore();   // the clock glows through the tint
  return heads; }

// ---------------- shots (hard cuts; face of a single at ~900-1050 px)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const hY = SEAT + G.her.headY;
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(-220, -830, 0.74, 'room'), ROOM: S(-220, -820, 0.74, 'room'),
  HER: S(HX + 40, fy(hY, 1.0, 960), 1.0, 'room'), HER_R: S(HX + 40, fy(hY, 1.0, 1000), 1.0, 'room'), HER_CU: S(HX + 30, fy(hY, 1.45, 1060), 1.45, 'room'), HER_O3: S(HX + 60, fy(hY, 0.95, 1040), 0.95, 'room'),
  CHAT: U('chat', 1) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.ROOM;
  if (L === 'hook') { if (t < hev('chat')) return SH.COVER; if (t < hev('face')) return f(SH.CHAT); return f(SH.HER_CU); }
  if (L === 'o1') return t < e('face') ? f(SH.CHAT) : f(SH.HER_R);
  if (L === 'o2') return t < e('flip') - 0.1 ? f(SH.CHAT) : f(SH.ROOM);
  if (L === 'o3') { if (t < e('sent') - 0.02) return f(SH.HER_O3); if (t < SP.o3_nar.t + 1.15) return f(SH.CHAT); return f(SH.HER_R); }
  if (L === 'end') return t < e('face') - 0.03 ? f(SH.CHAT) : f(SH.HER_CU);
  return SH.ROOM; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['thud', 'rimshot']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- the chat insert (English UI only, dark mode at 3 a.m.)
function backdrop(c) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, '#2A2F48'); g.addColorStop(1, '#141724'); c.fillStyle = g; c.fillRect(0, 0, W, HH); c.fillStyle = 'rgba(255,255,255,.03)'; for (let k = 0; k < 12; k++) c.fillRect(0, k * 180, W, 70); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'chat' }); }
function avatar(c, x, y, r) { c.save(); c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = '#9CB4D8'; c.fill(); c.clip(); const g = G.mark, s = r * 1.55 / (g.hh * 2);
  c.translate(x, y + r * 0.15 - g.headY * s); c.scale(s, s); human(c, MARK, { t: 0, mood: 'happy', turn: 0, look: 0, armL: reach(g, -1, -g.sw * 0.8, g.ySh + 330), armR: reach(g, 1, g.sw * 0.8, g.ySh + 330), floorShadow: false }); c.restore();
  c.strokeStyle = '#FFFFFF'; c.lineWidth = 3; c.beginPath(); c.arc(x, y, r, 0, TAU); c.stroke(); }
function wrapLines(c, s, maxW) { const out = []; let cur = ''; for (const w of s.split(' ')) { const tr = cur ? cur + ' ' + w : w; if (c.measureText(tr).width > maxW && cur) { out.push(cur); cur = w; } else cur = tr; } if (cur) out.push(cur); return out; }
function msg(c, w, y, s, mine, k, fs = 30) { if (k <= 0) return y; c.font = `${fs}px Nun9`; const lines = wrapLines(c, s, w * 0.72), bw = Math.max(...lines.map(l => c.measureText(l).width)) + 44, bh = lines.length * fs * 1.22 + 30;
  const x = mine ? w - 18 - bw : 18; c.save(); c.translate(mine ? x + bw : x, y + bh); c.scale(k, k); c.translate(-(mine ? x + bw : x), -(y + bh));
  c.fillStyle = mine ? '#3D7BF2' : '#2E3347'; rr(c, x, y, bw, bh, 24); c.fill();
  c.fillStyle = '#FFFFFF'; c.textAlign = 'left'; c.textBaseline = 'top'; lines.forEach((l, i) => c.fillText(l, x + 22, y + 15 + i * fs * 1.22));
  c.restore(); return y + bh + 16; }
function typingBubble(c, y, t, k) { if (k <= 0) return; c.save(); c.translate(18, y + 64); c.scale(k, k); c.fillStyle = '#2E3347'; rr(c, 0, -64, 120, 64, 24); c.fill();
  for (let i = 0; i < 3; i++) { const a = 0.35 + 0.65 * Math.max(0, Math.sin(t * 9 - i * 0.9)); c.fillStyle = `rgba(255,255,255,${a})`; c.beginPath(); c.arc(32 + i * 28, -32 - 6 * Math.max(0, Math.sin(t * 9 - i * 0.9)), 9, 0, TAU); c.fill(); } c.restore(); }
// what the chat shows at time t
function chatState(t) { const L = sceneAt(t).id, e = k => ev(L, k), o = { inK: 1, mine: null, mineK: 0, typed: '', dots: 0, reply: 0, read: false };
  const HEY = 'Hey... you up?';
  if (L === 'hook') o.inK = eBack(P(t, hev('chat') - 0.05, hev('chat') + 0.2), 1.6);
  const typing = (txt, a, b) => { o.typed = txt.slice(0, Math.round(clamp(P(t, a, b)) * txt.length)); };
  if (L === 'o1') { const s = 'No.'; if (t < e('sent')) typing(s, e('type0'), e('sent') - 0.12); else { o.mine = s; o.mineK = eBack(P(t, e('sent'), e('sent') + 0.2), 1.6); o.read = true; } o.dots = t > e('dots') ? eBack(P(t, e('dots'), e('dots') + 0.2), 1.8) : 0; }
  if (L === 'o2') { const s = 'Yes. Still not interested.'; if (t < e('sent')) typing(s, e('type0'), e('sent') - 0.15); else { o.mine = s; o.mineK = eBack(P(t, e('sent'), e('sent') + 0.2), 1.6); o.read = true; } }
  if (L === 'o3' || L === 'end') { o.mine = "It's 3 a.m. Go to sleep — and lose my number."; o.mineK = L === 'o3' ? eBack(P(t, ev('o3', 'sent'), ev('o3', 'sent') + 0.2), 1.6) : 1; o.read = L === 'end' || t > ev('o3', 'sent') + 0.6; }
  if (L === 'end') { o.dots = t < e('reply') ? eBack(P(t, e('dots'), e('dots') + 0.2), 1.8) : 0; o.reply = eBack(P(t, e('reply'), e('reply') + 0.22), 1.6); }
  o.HEY = HEY; return o; }
function chatScreen(c, w, h, t) { const o = chatState(t);
  c.fillStyle = '#0E1018'; c.fillRect(0, 0, w, h);
  // status bar + header with the contact photo and the drawn broken heart
  fitTxt(c, '3:04', 30, 22, 18, '#FFFFFF', 80, 'Nun9', 'left'); c.fillStyle = '#FFFFFF'; rr(c, w - 56, 14, 34, 16, 4); c.fill();
  c.fillStyle = '#171A26'; c.fillRect(0, 40, w, 92); c.strokeStyle = '#8FA0C8'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(30, 70); c.lineTo(18, 86); c.lineTo(30, 102); c.stroke();
  avatar(c, 72, 86, 32);
  c.font = '30px Nun9'; c.fillStyle = '#FFFFFF'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText('Mark (ex)', 118, 74); const nw = c.measureText('Mark (ex)').width; brokenHeart(c, 118 + nw + 24, 72, 14);
  fitTxt(c, o.dots > 0.5 && !o.reply ? 'typing...' : 'online', 118, 106, 22, o.dots > 0.5 && !o.reply ? '#5BD38A' : '#8E96AE', 200, 'Nun8', 'left');
  // day chip + messages
  c.fillStyle = '#1F2333'; rr(c, w / 2 - 70, 150, 140, 30, 15); c.fill(); fitTxt(c, 'Today 3:04 AM', w / 2, 165, 15, '#8E96AE', 130, 'Nun8');
  let y = 200; y = msg(c, w, y, o.HEY, false, o.inK, 40);
  if (o.mine) { y = msg(c, w, y, o.mine, true, o.mineK, 36); if (o.read && o.mineK > 0.9) { fitTxt(c, 'Read 3:04 AM', w - 22, y - 4, 15, '#8E96AE', 160, 'Nun8', 'right'); y += 18; } }
  if (o.dots > 0) typingBubble(c, y, t, o.dots);
  if (o.reply > 0) y = msg(c, w, y, '...Sorry. Wrong chat. That was for my mum.', false, o.reply, 36);
  // input bar with the typed text + caret
  c.fillStyle = '#171A26'; c.fillRect(0, h - 76, w, 76); c.fillStyle = '#262A3A'; rr(c, 14, h - 62, w - 92, 48, 24); c.fill();
  if (o.typed) { fitTxt(c, o.typed, 32, h - 38, 26, '#FFFFFF', w - 140, 'Nun9', 'left'); } else fitTxt(c, 'Message', 32, h - 38, 22, '#5E6478', w - 140, 'Nun8', 'left');
  if (o.typed && Math.floor(t * 4) % 2 === 0) { UI.textFit(c, 'Nun9', 26, o.typed, w - 140); const tw = c.measureText(o.typed).width; c.fillStyle = '#3D7BF2'; c.fillRect(34 + tw, h - 52, 3, 28); }
  c.fillStyle = o.typed ? '#3D7BF2' : '#2E3347'; c.beginPath(); c.arc(w - 40, h - 38, 24, 0, TAU); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(w - 50, h - 48); c.lineTo(w - 28, h - 38); c.lineTo(w - 50, h - 28); c.lineTo(w - 46, h - 38); c.fill(); }
function chatView(c, t, L) { backdrop(c); const hook = L === 'hook', x = 540, y = hook ? 1085 : 905, s = hook ? 1.1 : 1.42;
  const k = hook ? eBack(P(t, hev('chat') - 0.02, hev('chat') + 0.22), 1.5) : 1; c.save(); c.translate(x, y); c.scale(k, k); K.phone(c, 0, 0, s, (cc, w, h) => chatScreen(cc, w, h, t)); c.restore(); }
// Russian translation of a chat line, under the phone
function ruLine(c, t, id, y) { const sp = SP[id]; if (!sp) return; const a = P(t, sp.t - 0.05, sp.t + 0.15), nar = TL.speech.find(x => (x.who === 'nar' || x.who === 'tip') && x.t > sp.t), end = Math.min(sp.t + sp.d + 0.45, nar ? nar.t - 0.12 : 1e9), b = 1 - P(t, end - 0.12, end);
  const k = Math.min(a, b); if (k <= 0) return; c.save(); c.globalAlpha = k; UI.textFit(c, 'Nun9', 50, sp.ru, 960); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, sp.ru, 540, y, C.pinkL, C.oliveD, 10); c.restore();
  if (global.__QA) global.__QA.ui(c, 'captions', { x: 60, y: y - 40, w: 960, h: 80, k, id: id + '_ru' }); }

// ---------------- overlays: title, comment plate, option plates
function commentPlate(c, t) { const a = hev('plate'), k = eBack(P(t, a, a + 0.3), 1.8) * (1 - P(t, SC.hook.e - 0.25, SC.hook.e - 0.05)); if (k <= 0) return;
  c.save(); c.translate(540, 470); c.rotate(-0.025); c.scale(k, k);
  c.fillStyle = 'rgba(0,0,0,.28)'; rr(c, -440 + 8, -125 + 12, 880, 250, 34); c.fill(); c.fillStyle = '#FFFFFF'; rr(c, -440, -125, 880, 250, 34); c.fill();
  c.fillStyle = '#EE5E9A'; c.beginPath(); c.moveTo(-330, 120); c.lineTo(-290, 168); c.lineTo(-270, 120); c.fill();   // sticker tail
  // generic reply-sticker header: speech-bubble icon + label (no username, no avatar)
  c.fillStyle = '#EE5E9A'; rr(c, -440, -125, 880, 70, [34, 34, 0, 0]); c.fill(); c.fillStyle = '#FFFFFF'; rr(c, -400, -108, 46, 34, 10); c.fill(); c.beginPath(); c.moveTo(-392, -78); c.lineTo(-396, -62); c.lineTo(-376, -76); c.fill();
  fitTxt(c, 'Вопрос из комментариев:', -335, -90, 36, '#FFFFFF', 700, 'Nun9', 'left');
  fitTxt(c, 'что ответить бывшему', 0, -2, 54, '#1E2030', 800, 'Unb9'); fitTxt(c, 'в 3 ночи?', 0, 66, 54, '#1E2030', 800, 'Unb9');
  c.restore(); if (global.__QA) global.__QA.ui(c, 'card', { x: 100, y: 345, w: 880, h: 260, k, id: 'comment' }); }
const OPT = { o1: ['1', 'ХОЛОДНО', '#5B8DEF'], o2: ['2', 'С ЮМОРОМ', '#F2A33A'], o3: ['3', 'КАК НОСИТЕЛЬ', '#EE5E9A'] };
function optionPlate(c, t, L) { const o = OPT[L]; if (!o) return; const s = SC[L].s, nar = SP[L + '_nar'], end = L === 'o2' ? ev('o2', 'flip') - 0.1 : nar.t, k = eBack(P(t, s, s + 0.3), 2.0), al = 1 - P(t, end - 0.15, end - 0.01); if (k <= 0 || al <= 0) return;
  c.save(); c.globalAlpha = al; c.translate(540, 262); c.rotate(-0.03); c.scale(k, k); UI.font(c, 'Unb9', 58); const tw = c.measureText(o[1]).width, w = tw + 200, x0 = -w / 2;
  c.fillStyle = 'rgba(0,0,0,.3)'; rr(c, x0 + 8, -55 + 10, w, 110, 55); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, x0, -55, w, 110, 55); c.fill(); c.stroke();
  c.fillStyle = o[2]; c.beginPath(); c.arc(x0 + 58, 0, 42, 0, TAU); c.fill(); fitTxt(c, o[0], x0 + 58, 3, 58, C.white, 60); fitTxt(c, o[1], x0 + 118, 3, 58, C.oliveD, tw + 4, 'Unb9', 'left');
  c.restore(); if (global.__QA) global.__QA.ui(c, 'card', { x: 540 - w / 2, y: 205, w, h: 115, k, id: 'option' }); }

// ---------------- end screen
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, wt = (w, d) => K.wordT('outro', w) ?? (sp.t + d);
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // heroine bottom-left, waving (kept clear of the buttons)
  { const g = G.her, hy = lerp(2350, 1985, eBack(P(u, 0.3, 0.8), 1.4)); c.save(); c.translate(150, hy); c.scale(0.34, 0.34);
    K.put(c, HER, { t, mood: 'smug', turn: 0.15, look: 0.2, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(t * 8) * 30, { planar: true }), armR: holdPhone(g), items: { R: phoneBack } }, 0, 0); c.restore(); }
  const q = eBack(P(u, 0.15, 0.5), 2.2);
  if (q > 0) { c.save(); c.translate(540, 300); c.scale(q, q); UI.font(c, 'Unb9', 76); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, 'КАКОЙ ОТВЕТ', 0, -48, C.oliveD, C.white, 14); UI.strokeText(c, 'ТВОЙ?', 0, 48, C.pink, C.white, 14); c.restore(); }
  const rows = [['1', 'ХОЛОДНО', 'No.', '#5B8DEF', 'один'], ['2', 'С ЮМОРОМ', 'Yes. Still not interested.', '#F2A33A', 'два'], ['3', 'КАК НОСИТЕЛЬ', 'Go to sleep — and lose my number.', '#EE5E9A', 'три']];
  rows.forEach(([n, ru, en, col, w], i) => { const a = wt(w, 0.9 + i * 0.3) - 0.1, k = eBack(P(t, a, a + 0.28), 2.0); if (k <= 0) return; const y = 560 + i * 190;
    c.save(); c.translate(540, y); c.scale(k, k); c.fillStyle = 'rgba(0,0,0,.16)'; rr(c, -450 + 8, -78 + 12, 900, 156, 40); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -450, -78, 900, 156, 40); c.fill(); c.stroke();
    c.fillStyle = col; c.beginPath(); c.arc(-360, 0, 58, 0, TAU); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 5; c.stroke(); fitTxt(c, n, -360, 4, 80, C.white, 80);
    fitTxt(c, ru, -270, -26, 44, C.oliveD, 680, 'Unb9', 'left'); fitTxt(c, en, -270, 30, 36, C.pinkD, 680, 'Nun9', 'left'); c.restore(); });
  const bk = eBack(P(t, wt('пиши', 2.3) - 0.2, wt('пиши', 2.3) + 0.15), 2.2), by = 1185;
  if (bk > 0) { c.save(); c.translate(540, by); c.scale(bk, bk); c.fillStyle = C.gold; rr(c, -450, -55, 420, 110, 55); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke(); fitTxt(c, 'СОХРАНИ', -240, 4, 40, C.oliveD, 360);
    const subT = sp.t + 2.75, click = P(t, subT + 0.55, subT + 0.7), pressed = t > subT + 0.65, ss = 1 - 0.08 * Math.sin(click * Math.PI);
    c.save(); c.translate(240, 0); c.scale(ss, ss); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -210, -55, 420, 110, 55); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke(); fitTxt(c, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4, 40, C.white, 360); c.restore(); c.restore();
    const mv = eIO(P(t, subT, subT + 0.55)); UI.tapCursor(c, lerp(1000, 800, mv), lerp(by + 330, by + 10, mv), 1, P(t, subT + 0.6, subT + 1.1)); }
  Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') return endScreen(c, t);
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'room';
  let heads = { her: { x: -1e5, y: -3000, hh: 100 } }, proj = p => p;
  if (tag === 'ui:chat') { c.save(); c.translate(sh.x, sh.y); chatView(c, t, L); c.restore(); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.3, '8,10,24'); }
  if (tag === 'ui:chat') { const y = L === 'hook' ? 1585 : 1490; for (const id of ['hook_e', 'o1_h', 'o2_h', 'end_e']) ruLine(c, t, id, y); }
  if (L === 'o3' && tag !== 'ui:chat') K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, hold: { o3_h: 0.05 } });
  if (L === 'hook') { if (t < hev('title_out')) { c.save(); c.globalAlpha = 1 - P(t, hev('title_out') - 0.15, hev('title_out')); K.titleRibbon(c, t + 0.45, 540, 470); c.restore(); } commentPlate(c, t); }
  optionPlate(c, t, L);
  UI.captions(c, t);
  Hq.grain(c, W, HH, t, 0.04);
}
E.run('uup', NF, renderFrame);
