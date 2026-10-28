// "I don't like your boyfriend" episode renderer: node kyle.js start end out.mp4 | --png=f1,f2
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, items, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/kyle/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SC, SP, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf, EV, put } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2, ev = k => EV(k);
function txt(c, s, x, y, size, col, font = 'Unb9', align = 'center') { c.font = `${size}px ${font}`; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
const FY = 60;
// ---------------- restaurant (prerendered)
const BX0 = -1600, BY0 = -3000, BW = 3400, BH = 3700, BS = 0.5;
function drawRest(c) {
  c.fillStyle = '#5A2A3A'; c.fillRect(BX0, BY0, BW, BH); c.fillStyle = 'rgba(255,200,150,.07)'; for (let x = BX0; x < BX0 + BW; x += 160) c.fillRect(x, BY0, 70, BH);
  c.fillStyle = '#3A1A26'; c.fillRect(BX0, -620, BW, 680); c.fillStyle = '#C9A06A'; c.fillRect(BX0, -640, BW, 22);
  for (const [x, w] of [[-1250, 520], [450, 560]]) { c.fillStyle = '#C9A06A'; c.fillRect(x - 16, -2200, w + 32, 980); c.fillStyle = '#1E2A4A'; c.fillRect(x, -2184, w, 948); c.fillStyle = 'rgba(255,240,200,.9)'; for (let i = 0; i < 26; i++) { c.beginPath(); c.arc(x + 20 + hash(i * 7 + x) * (w - 40), -2160 + hash(i * 3 + x) * 600, 3 + hash(i) * 3, 0, TAU); c.fill(); }
    c.fillStyle = '#2B2F4A'; for (let i = 0; i < 6; i++) { const bw = w / 6, bh = 160 + hash(i + x) * 380; c.fillRect(x + i * bw, -1236 - bh, bw - 8, bh); } c.fillStyle = '#C9A06A'; c.fillRect(x + w / 2 - 8, -2184, 16, 948); }
  txt(c, 'Chez Amour', -1600 + 1700, -2480, 90, '#F2C14E', 'Unb9');
  for (const x of [-900, -150, 600, 1350]) { c.strokeStyle = '#C9A06A'; c.lineWidth = 5; c.beginPath(); c.moveTo(x, BY0); c.lineTo(x, -2620); c.stroke(); c.fillStyle = 'rgba(255,220,140,.25)'; c.beginPath(); c.arc(x, -2560, 130, 0, TAU); c.fill(); paint(c, q => q.e(x, -2580, 60, 44), '#F2C14E', { sd: 4, hd: 2, lw: 3 }); }
  const fg = c.createLinearGradient(0, FY, 0, 700); fg.addColorStop(0, '#7A4A3A'); fg.addColorStop(1, '#5A3428'); c.fillStyle = fg; c.fillRect(BX0, FY, BW, BY0 + BH - FY); c.fillStyle = 'rgba(0,0,0,.14)'; for (let x = BX0; x < BX0 + BW; x += 120) c.fillRect(x, FY, 6, 700);
}
const BGB = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); { const c = BGB.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); c.filter = 'blur(1.5px)'; drawRest(c); }

function cloth(c, x0, x1, top, h) { paint(c, q => { q.m(x0 - 50, top); q.l(x1 + 50, top); q.l(x1 + 70, top + h); q.l(x0 - 70, top + h); q.z(); }, '#FFFDF8', { sd: 6, hd: 3, lw: 3, inner: k => { k.strokeStyle = 'rgba(200,60,80,.25)'; k.lineWidth = 4; for (let x = x0 - 40; x < x1 + 60; x += 50) { k.beginPath(); k.moveTo(x, top + 10); k.lineTo(x + 6, top + h); k.stroke(); } } }); }
function candle(c, x, y, t) { c.fillStyle = '#F7F2E8'; c.fillRect(x - 10, y - 70, 20, 70); const f = 1 + 0.12 * Math.sin(t * 17 + x); c.fillStyle = 'rgba(255,200,90,.25)'; c.beginPath(); c.arc(x, y - 86, 40 * f, 0, TAU); c.fill(); paint(c, q => { q.m(x, y - 112 * f); q.q(x + 14, y - 84, x, y - 72); q.q(x - 14, y - 84, x, y - 112 * f); q.z(); }, '#F2A03B', { sd: 0, hd: 0, lw: 2 }); }

// ---------------- props
function spoon(c, x, y, rot, s = 1) { c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); c.fillStyle = '#C9CED6'; c.fillRect(-5, -10, 10, 110); c.beginPath(); c.ellipse(0, -28, 18, 26, 0, 0, TAU); c.fill(); c.restore(); }
function fork(c, x, y, rot, s = 1) { c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); c.fillStyle = '#C9CED6'; c.fillRect(-5, -10, 10, 110); c.fillRect(-18, -40, 36, 34); c.fillStyle = '#E9E4DA'; for (let i = 0; i < 3; i++) c.fillRect(-12 + i * 10, -44, 4, 22); c.restore(); }
function knife(c, x, y, rot, s = 1) { c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); c.fillStyle = '#C9CED6'; c.fillRect(-5, 0, 10, 100); paint(c, q => { q.m(-8, 0); q.l(8, 0); q.l(8, -80); q.q(0, -96, -8, -80); q.z(); }, '#DDE2EA', { sd: 1, hd: 1, lw: 2 }); c.restore(); }
function salt(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); paint(c, q => { q.m(-26, 0); q.l(26, 0); q.l(22, -90); q.l(-22, -90); q.z(); }, '#F7F9FC', { sd: 3, hd: 2, lw: 3 }); c.fillStyle = '#C9CED6'; c.fillRect(-24, -110, 48, 22); c.restore(); }
function chairBack(c, x, k = 0) { c.save(); c.translate(x, 0); c.fillStyle = '#5A2A1A'; c.fillRect(-150, -1050, 24, 1110); c.fillRect(126, -1050, 24, 1110); c.fillRect(-150, -1050, 300, 40); c.fillRect(-150, -880, 300, 24); c.restore(); }
function carriedChair(c, x, y) { c.save(); c.translate(x, y); c.fillStyle = '#5A2A1A'; c.fillRect(-130, -1000, 24, 1000); c.fillRect(106, -1000, 24, 1000); c.fillRect(-130, -1000, 260, 40); c.fillRect(-130, -830, 260, 24); c.fillRect(-150, -360, 300, 30); c.restore(); }
const coatLining = (g, k) => cc => { if (k <= 0) return; const w = g.sw * 1.0 * k; paint(cc, q => { q.m(-w, g.ySh + 40); q.l(w, g.ySh + 40); q.l(w * 1.05, g.ySh + 520); q.l(-w * 1.05, g.ySh + 520); q.z(); }, '#7A1830', { sd: 6, hd: 3, lw: 3 }); for (let r = 0; r < 3; r++) for (let i = 0; i < 4; i++) { const x = -w * 0.8 + i * w * 0.53, y = g.ySh + 150 + r * 140; (i + r) % 3 === 0 ? spoon(cc, x, y, 0, 0.8) : (i + r) % 3 === 1 ? fork(cc, x, y, 0, 0.8) : knife(cc, x, y, 0, 0.8); } };

// ---------------- characters
const SEAT = 330;
const HER = { ...BASE.her_london, top: { type: 'sweater', col: '#4CA6A0' } };
const MIA = { ...BASE.chloe, hair: { style: 'long', col: '#E8C27A', len: 1.5 }, top: { type: 'cardigan', col: '#F4B8C8', col2: '#FFFFFF' }, bottom: { type: 'skirt', col: '#5A4A6A' } };
const KYLE = { ...BASE.dan, cap: null, hair: { style: 'quiff', col: '#1E1612' }, top: { type: 'coat', col: '#3A3F4A', col2: '#F5EBDD' }, bottom: { type: 'jeans', col: '#2B2F3A' } };
const G = { her: geom(HER, SEAT), mia: geom(MIA, SEAT), kyle: geom(KYLE, SEAT), kyleS: geom(KYLE) };
const HERX = -440, MX = 0, KX = 440, TOP = -470;
function gest(st, g, who, t, side, base) { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.4 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } }
function herState(t, L) { const g = G.her, st = { t, talk: talk('her', t), mood: 'worried', turn: 0.35, look: 0.7, legPose: 'sit', drop: SEAT, legs: false, armL: reach(g, -1, -g.sw * 0.4, TOP - 30 - FY), armR: reach(g, 1, g.sw * 0.6, TOP - 30 - FY) };
  gest(st, g, 'her', t, 1, 140);
  if (L === 'hook') st.mood = 'shock';
  if (L === 'A1' && t > ev('spoon')) { st.mood = 'shock'; st.look = 1.2; }
  if (L === 'A2' && t > ev('coat')) st.mood = 'shock';
  if (L === 'B1' && t > ev('salt')) st.mood = 'tired';
  if (L === 'B2' && t > ev('candle')) { st.mood = 'shock'; st.look = 1.2; }
  if (L === 'C1') st.mood = t > ev('drop') ? 'smug' : 'worried';
  if (L === 'C2') { st.mood = speaking('c2_her', t, 0.1) ? 'smug' : 'neutral'; if (t > ev('chair')) { st.mood = 'shock'; st.look = 1.3; } }
  return st; }
function miaState(t, L) { const g = G.mia, st = { t, talk: talk('mia', t), mood: 'happy', turn: -0.35, look: -0.8, legPose: 'sit', drop: SEAT, legs: false, armL: reach(g, -1, -g.sw * 0.6, TOP - 30 - FY), armR: reach(g, 1, g.sw * 0.6, TOP - 30 - FY) };
  gest(st, g, 'mia', t, -1, 140);
  if (L === 'A1' || L === 'hook') { st.mood = 'happy'; if (t < SP.a1_her.t || L === 'hook') { st.turn = 0.4; st.look = 0.9; } }
  if (L === 'B1' && t > ev('salt') - 0.4 && t < SP.b1_nar.t + 2.5) { st.armR = reach(g, 1, g.sw * 0.4, g.ySh - 60); st.items = { R: ctx => salt(ctx, 0, -10, 1.1) }; st.mood = 'happy'; }
  if (L === 'C1') { st.mood = t > SP.c1_x.t - 0.3 ? 'skeptical' : 'worried'; if (t > SP.c1_x.t - 0.3) { st.turn = 0.4; st.look = 0.9; } if (t > ev('drop')) st.mood = 'shock'; }
  if (L === 'C2') { st.mood = speaking('c2_her', t) ? 'sad' : 'angry'; if (t > SP.c2_x.t - 0.2) { st.turn = 0.4; st.look = 0.9; } if (t > ev('chair') + 0.4) { st.mood = 'shock'; st.look = 1.4; } }
  return st; }
function kyleWalk(t, L) { return L === 'C2' && t > ev('chair') - 0.3; }
function kyleState(t, L) { const walk = kyleWalk(t, L), g = walk ? G.kyleS : G.kyle;
  const st = { t, talk: talk('kyle', t), mood: 'smug', turn: -0.3, look: -0.7, armL: reach(g, -1, -g.sw * 0.6, TOP - 30 - FY), armR: reach(g, 1, g.sw * 0.7, TOP - 30 - FY) };
  if (!walk) { st.legPose = 'sit'; st.drop = SEAT; st.legs = false; }
  gest(st, g, 'kyle', t, -1, 140);
  const sneak = (k, d) => t > ev(k) - d && t < ev(k) + 0.3;
  if (L === 'hook') { st.armL = reach(g, -1, -g.sw * 0.4, TOP - 40 - FY); st.lookY = 0.6; st.look = -0.3; st.mood = 'smug'; }
  if (L === 'A1' && sneak('spoon', 0.8)) { st.armR = reach(g, 1, g.sw * 0.9, g.ySh + 260); st.items = { R: ctx => spoon(ctx, 0, -40, 0.3, 0.9) }; st.look = 0.3; }
  if (L === 'A2' && t > ev('coat') - 0.2 && t < SP.a2_nar.t + 2.5) { const k = eOut(P(t, ev('coat') - 0.2, ev('coat') + 0.3)); st.armL = reach(g, -1, -g.sw * (1.2 + k * 0.8), g.ySh + 200); st.armR = reach(g, 1, g.sw * (1.2 + k * 0.8), g.ySh + 200); st.afterTorso = coatLining(g, k); st.mood = 'happy'; }
  if (L === 'B2' && t > ev('candle') - 0.6) { st.mood = 'smug'; if (t < ev('candle') + 0.4) { st.armL = reach(g, -1, -g.sw * 1.6, TOP - 40 - FY); } }
  if (L === 'C1') { st.mood = t > ev('drop') ? 'worried' : 'happy'; }
  if (L === 'C2') { st.mood = speaking('c2_her', t) ? 'worried' : 'tired'; if (t > ev('pile') - 0.3 && t < ev('pile') + 0.3) st.armL = reach(g, -1, -g.sw * 1.4, TOP - 30 - FY);
    if (walk) { st.legPose = t < ev('chair') + 0.2 ? 'stand' : 'walk'; st.turn = 0.5; st.look = 0.6; st.mood = 'smug'; st.armR = reach(g, 1, g.sw * 1.9, g.ySh + 300); } }
  return st; }
function kyleX(t, L) { return kyleWalk(t, L) ? lerp(KX, KX + 900, P(t, ev('chair') + 0.2, ev('chair') + 6.0)) : KX; }
function tableTop(c, t, L) { cloth(c, -720, 720, TOP, 520);
  candleOn(c, t, L); for (const x of [-440, 0, 440]) { paint(c, q => q.e(x, TOP - 8, 120, 20), '#FFFFFF', { sd: 3, hd: 2, lw: 3 }); }
  for (const x of [-440, 0]) { fork(c, x - 150, TOP - 4, 1.57); knife(c, x + 150, TOP - 4, -1.57); }
  if (L === 'hook' && t < 1.0) fork(c, 290, TOP - 4, 1.57);
  if (L !== 'B1' || t < ev('salt') - 0.4) { if (!(['B1', 'B2', 'C1'].includes(L) || (L === 'C2' && t < ev('pile')))) salt(c, 200, TOP); }
  if (L === 'C1' && t > ev('drop')) { const k = eIn(P(t, ev('drop'), ev('drop') + 0.25)); spoon(c, KX - 120, lerp(TOP - 400, TOP - 4, k), lerp(0.5, 1.57, k)); }
  if (L === 'C2' && t > ev('pile')) { const k = eOut(P(t, ev('pile'), ev('pile') + 0.5)); c.save(); c.translate(KX - 60, TOP); c.scale(1, k); for (let i = 0; i < 14; i++) { const f = [spoon, fork, knife][i % 3]; f(c, -150 + hash(i) * 300, -10 - hash(i * 3) * 120, -1.2 + hash(i * 7) * 2.4, 0.9); } salt(c, 140, -40); c.fillStyle = '#F7F2E8'; c.fillRect(-190, -110, 20, 70); c.restore(); } }
function candleOn(c, t, L) { const gone = (L === 'B2' && t > ev('candle')) || ['C1'].includes(L) || (L === 'C2' && t < ev('pile')); if (!gone) candle(c, -200, TOP, t); else if (L === 'B2' && t < ev('candle') + 0.6) { c.fillStyle = 'rgba(200,200,200,.5)'; for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(-200 + Math.sin(t * 5 + i) * 20, TOP - 100 - (t - ev('candle')) * 200 - i * 30, 14, 0, TAU); c.fill(); } } }
function world(c, t, L) {
  c.drawImage(BGB, BX0, BY0, BW, BH);
  const heads = {}, kx = kyleX(t, L), walk = kyleWalk(t, L);
  chairBack(c, HERX); chairBack(c, MX); if (!walk) chairBack(c, KX);
  heads.her = put(c, HER, herState(t, L), HERX, FY);
  heads.mia = put(c, MIA, miaState(t, L), MX, FY);
  if (!walk) heads.kyle = put(c, KYLE, kyleState(t, L), kx, FY);
  tableTop(c, t, L);
  if (walk) { heads.kyle = put(c, KYLE, kyleState(t, L), kx, FY); carriedChair(c, kx + 260, FY - 60 + Math.abs(Math.sin(t * 8)) * -20); }
  return heads;
}
function shotFor(t) { const sc = sceneAt(t), L = sc.id, two = { x: 0, y: -850, z: 0.68, r: 0 }; if (L === 'hook') return t < 1.4 ? { x: KX - 120, y: -560, z: 1.5, r: 0 } : two; if (L === 'outro') return two; const u = t - sc.s; if (u < 1.15) return { ...two, z: 0.66, cut: u < 0.85 };
  if (L === 'A2' && t > ev('coat') - 0.3 && t < SP.a2_nar.t + 2) return { x: KX - 60, y: -850, z: 0.95, r: 0 };
  if (L === 'C2' && speaking('c2_her', t, 0.2, 0.3)) return { x: HERX + 200, y: -1050, z: 0.92, r: 0 };
  if (L === 'C2' && t > ev('pile') - 0.3) return { x: 250, y: -900, z: 0.66, r: 0 };
  const l = L.toLowerCase(), cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.3 && t < s.t + s.d + 0.2);
  if (cur) { if (cur.who === 'her') return { x: HERX + 280, y: -930, z: 0.9, r: 0.3 }; if (cur.who === 'mia') return { x: MX + 150, y: -930, z: 0.9, r: 0 }; return { x: KX - 200, y: -950, z: 0.9, r: -0.3 }; }
  return two; }
const CAM = E.simulateCamera(TL, shotFor, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L); const M = c.getTransform(); c.restore(); return { heads, M }; }
function drawHook(c, t) { const cam = t < 1.4 ? { x: KX - 120, y: -560, z: 1.5 - 0.1 * P(t, 0, 1.4), r: 0 } : { x: 0, y: -850, z: 0.68, r: 0 }; drawWorld(c, t, 'hook', cam); Hq.vignette(c, W, HH, 0.3);
  if (t < 1.4) { c.save(); const k = P(t, 0.2, 1.1); const sx = lerp(620, 760, k), sy = lerp(1080, 990, k); c.translate(sx, sy); c.rotate(-0.5); fork(c, 0, 0, 0, 2.2); c.restore(); c.fillStyle = '#3A3F4A'; c.beginPath(); c.ellipse(820, 960, 110, 150, -0.5, 0, TAU); c.fill(); }
  if (t > 1.4 && t < 1.5) { c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(0, 0, W, HH); }
  if (t > 0.6) { const kk = eBack(P(t, 0.6, 0.9), 2); c.save(); c.translate(540, 1500); c.rotate(-0.05); c.scale(kk, kk); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -440 + 8, -60 + 10, 880, 120, 20); c.fill(); c.fillStyle = '#FFFDF8'; rr(c, -440, -60, 880, 120, 20); c.fill(); UI.textFit(c, 'Unb9', 54, 'ЭТО ПАРЕНЬ МОЕЙ ПОДРУГИ', 800); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ЭТО ПАРЕНЬ МОЕЙ ПОДРУГИ', 0, 4); c.restore(); }
  K.titleRibbon(c, t, 540, 330); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); }
function saltCard(c, t, L) { if (L !== 'B1') return; const k = eBack(P(t, ev('salt'), ev('salt') + 0.3), 1.8) * (1 - P(t, SP.b1_nar.t + 2.0, SP.b1_nar.t + 2.3)); if (k <= 0) return; c.save(); c.translate(540, 1150); c.rotate(-0.05); c.scale(k, k); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -230 + 10, -200 + 14, 460, 400, 30); c.fill(); c.fillStyle = '#FFFDF8'; rr(c, -230, -200, 460, 400, 30); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 6; rr(c, -230, -200, 460, 400, 30); c.stroke(); txt(c, 'A PRESENT!', 0, -150, 44, '#C2507A'); salt(c, 0, 120, 2.2); c.save(); c.translate(0, 40); c.rotate(-0.04); c.fillStyle = '#7A1830'; rr(c, -110, -30, 220, 46, 8); c.fill(); txt(c, 'CHEZ AMOUR', 0, -7, 30, '#F2C14E'); c.restore(); c.restore(); }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t);
  if (sc.id === 'hook') { drawHook(c, t); Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  if (sc.id === 'outro') { K.outro(c, t, { q: ['А ТЕБЕ НРАВИЛИСЬ', 'ПАРНИ ПОДРУГ?'], rows: [['A2', "He's stealing the forks!"], ['B1', "I'm not sure he's right for you."], ['B2', 'Something about him feels off.'], ['C1', "I'm saying this as your friend."]], cta: ['ОТПРАВЬ ПОДРУГЕ', 'С ТАКИМ ПАРНЕМ'], hero: (cc, tt) => put(cc, HER, { t: tt, mood: 'smug', turn: 0, look: 0, armL: reach(geom(HER), -1, -G.her.sw * 0.6, geom(HER).ySh + 300), armR: reach(geom(HER), 1, G.her.sw * 0.6, geom(HER).ySh + 300) }, 0, 0) }); Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const f = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[f], sh = shake(t);
  const { heads, M } = drawWorld(c, t, sc.id, cam, sh); Hq.vignette(c, W, HH, 0.26);
  const proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f });
  saltCard(c, t, sc.id);
  K.bubbles(c, t, sc, heads, proj, { names: { mia: ['MIA', '#C2507A'], kyle: ['KYLE', '#3A3F4A'] }, hold: { c2_her: 0.25 } });
  if (sc.id === 'C2') K.dots(c, t, endOf('c2_her') + 0.3, SP.c2_x.t - 0.1);
  K.hud(c, t, sc);
}
E.run('kyle', NF, renderFrame);
