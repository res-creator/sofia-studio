// "How to turn down a date" episode renderer: node date.js start end out.mp4 | --png=f1,f2
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, items, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/date/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SC, SP, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf, EV, put } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2, ev = k => EV(k);
const HER = { ...BASE.her_london, top: { type: 'sweater', col: '#7FB8E8' }, bottom: { type: 'jeans', col: '#3B4A6A' } };
const BRAD = { ...BASE.oliver, hair: { style: 'quiff', col: '#2A1A10' }, brow: '#2A1A10', top: { type: 'blazer', col: '#8A2440', shirt: '#1E1E24', tie: null }, bottom: { type: 'trousers', col: '#1E1E24' } };
const JESS = { ...BASE.priya, hair: { style: 'long', col: '#2A1A10', len: 1.6 }, top: { type: 'cardigan', col: '#4CA6A0', col2: '#F7F2E8' }, bottom: { type: 'skirt', col: '#2B2F3A' } };
const WAIT = { ...BASE.reggie, top: { type: 'blazer', col: '#1E1E24', shirt: '#FFFFFF', tie: '#1E1E24' }, bottom: { type: 'trousers', col: '#1E1E24' } };
const VIO = { ...BASE.albert, glasses: null, top: { type: 'blazer', col: '#1E1E24', shirt: '#FFFFFF', tie: '#B8302E' }, bottom: { type: 'trousers', col: '#1E1E24' } };
const G = { her: geom(HER), brad: geom(BRAD), jess: geom(JESS, 330), wait: geom(WAIT), vio: geom(VIO), kneel: geom(BRAD, 380) };
const FY = 60, HERX = -380, BX = 300, JX = 960, VX = -40, VS = 0.85, WX = 650, TABLE = { x0: -200, x1: 120, top: -760 }, ROSE = '#D9304A';
function txt(c, s, x, y, size, col, font = 'Unb9', align = 'center') { c.font = `${size}px ${font}`; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function note(c, x, y, two) { c.fillStyle = '#F2C14E'; c.strokeStyle = '#F2C14E'; c.lineWidth = 6; for (let i = 0; i <= (two ? 1 : 0); i++) { c.beginPath(); c.ellipse(x + i * 40, y + i * -8, 16, 12, -0.4, 0, TAU); c.fill(); c.beginPath(); c.moveTo(x + 14 + i * 40, y - 4 - i * 8); c.lineTo(x + 14 + i * 40, y - 70 - i * 8); c.stroke(); } c.beginPath(); c.moveTo(x + 14, y - 70); c.lineTo(x + (two ? 54 : 34), y - (two ? 78 : 50)); c.stroke(); }
function heart(c, x, y, r, col) { c.save(); c.translate(x, y); c.fillStyle = col; c.beginPath(); c.moveTo(0, r * 0.9); c.bezierCurveTo(-r * 1.4, -r * 0.1, -r * 0.7, -r * 1.2, 0, -r * 0.45); c.bezierCurveTo(r * 0.7, -r * 1.2, r * 1.4, -r * 0.1, 0, r * 0.9); c.fill(); c.restore(); }

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

// ---------------- props
function cloth(c, x0, x1, top, h) { paint(c, q => { q.m(x0 - 50, top); q.l(x1 + 50, top); q.l(x1 + 70, top + h); q.l(x0 - 70, top + h); q.z(); }, '#FFFDF8', { sd: 6, hd: 3, lw: 3, inner: k => { k.strokeStyle = 'rgba(200,60,80,.25)'; k.lineWidth = 4; for (let x = x0 - 40; x < x1 + 60; x += 50) { k.beginPath(); k.moveTo(x, top + 10); k.lineTo(x + 6, top + h); k.stroke(); } } }); }
function candle(c, x, y, t) { c.fillStyle = '#F7F2E8'; c.fillRect(x - 10, y - 70, 20, 70); const f = 1 + 0.12 * Math.sin(t * 17 + x); c.fillStyle = 'rgba(255,200,90,.25)'; c.beginPath(); c.arc(x, y - 86, 40 * f, 0, TAU); c.fill(); paint(c, q => { q.m(x, y - 112 * f); q.q(x + 14, y - 84, x, y - 72); q.q(x - 14, y - 84, x, y - 112 * f); q.z(); }, '#F2A03B', { sd: 0, hd: 0, lw: 2 }); }
function napkin(c, t) { const k = eBack(P(t, ev('napkin'), ev('napkin') + 0.3), 2); if (k <= 0) return; c.save(); c.translate(0, TABLE.top - 4); c.rotate(-0.08); c.scale(k, k); c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(-96, -26, 200, 30); c.fillStyle = '#FFFFFF'; c.fillRect(-100, -30, 200, 30); c.restore(); }
function napkinBig(c, t, L) { if (L !== 'A2' || t < ev('napkin') + 0.2 || t > SP.a2_tip.t) return; const k = eBack(P(t, ev('napkin') + 0.2, ev('napkin') + 0.55), 1.8) * (1 - P(t, SP.a2_tip.t - 0.3, SP.a2_tip.t)); c.save(); c.translate(790, 1270); c.rotate(0.07); c.scale(k, k);
  c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(-190, -150, 400, 320); c.fillStyle = '#FFFFFF'; c.fillRect(-200, -160, 400, 320); c.strokeStyle = '#E9E4DA'; c.lineWidth = 3; c.strokeRect(-185, -145, 370, 290);
  c.save(); c.strokeStyle = ROSE; c.lineWidth = 8; heart(c, 0, -10, 120, 'rgba(217,48,74,.12)'); c.restore(); txt(c, 'YOU', 0, -40, 60, ROSE, 'Unb9'); txt(c, '+ ME', 0, 30, 60, ROSE, 'Unb9'); for (let i = 0; i < 6; i++) heart(c, -150 + i * 60, 120, 14, ROSE); c.restore(); }
function ringBox(c, open, s = 1) { c.save(); c.scale(s, s); paint(c, q => { q.m(-40, -46); q.l(40, -46); q.l(40, 0); q.l(-40, 0); q.z(); }, '#B8203E', { sd: 3, hd: 2, lw: 3 }); if (open > 0) { paint(c, q => { q.m(-40, -46); q.l(40, -46); q.l(40, -46 - 50 * open); q.l(-40, -46 - 50 * open); q.z(); }, '#8A1830', { sd: 2, hd: 1, lw: 3 }); c.strokeStyle = '#F2C14E'; c.lineWidth = 7; c.beginPath(); c.arc(0, -56, 16, 0, TAU); c.stroke(); paint(c, q => { q.m(0, -88); q.l(12, -74); q.l(0, -66); q.l(-12, -74); q.z(); }, '#CFF2FF', { sd: 2, hd: 1, lw: 2 }); c.fillStyle = 'rgba(255,255,255,.9)'; for (let i = 0; i < 4; i++) { const a = i * TAU / 4; c.fillRect(Math.cos(a) * 34 - 2, -76 + Math.sin(a) * 34 - 2, 4, 4); } } c.restore(); }
const roseItem = (ctx, a) => { ctx.rotate(a - Math.PI / 2 + Math.PI * 0.85); ctx.strokeStyle = '#3C8A4A'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(0, 150); ctx.stroke(); paint(ctx, q => q.e(-14, 60, 20, 9), '#4CAF6A', { sd: 1, hd: 1, lw: 2 }); paint(ctx, q => q.e(0, 170, 30, 30), ROSE, { sd: 4, hd: 2, lw: 3, inner: k => { k.strokeStyle = 'rgba(0,0,0,.25)'; k.lineWidth = 3; k.beginPath(); k.arc(0, 170, 14, 0, 5); k.stroke(); } }); };
const violin = (t) => (ctx, a) => { ctx.rotate(-0.5); paint(ctx, q => { q.m(-34, -60); q.q(-60, -30, -30, 0); q.q(-62, 30, -34, 64); q.l(34, 64); q.q(62, 30, 30, 0); q.q(60, -30, 34, -60); q.z(); }, '#B8682E', { sd: 4, hd: 2, lw: 3 }); ctx.fillStyle = '#2B1A10'; ctx.fillRect(-6, -150, 12, 110); };

// ---------------- characters
function gestTalk(st, g, who, t, side) { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; const arm = side < 0 ? 'armL' : 'armR'; st[arm] = reach(g, side, side * (g.sw * 1.7 + Math.sin(u) * 22), g.ySh + 210 + Math.cos(u) * 22); } }
function herState(t, L) { const g = G.her, st = { t, talk: talk('her', t), mood: 'neutral', turn: 0.35, look: 0.8, armL: reach(g, -1, -g.sw * 0.5, g.ySh + 330), armR: reach(g, 1, g.sw * 1.2, g.ySh + 360), items: { R: items.wine(0.5) } };
  if (speaking('a1_her', t) || speaking('a2_her', t) || speaking('b1_her', t) || speaking('b2_her', t) || speaking('c1_her', t)) { const u = t * 4.5; st.armL = reach(g, -1, -g.sw * 1.5 + Math.sin(u) * 18, g.ySh + 220); }
  if (L === 'hook') st.mood = t > 1.0 ? 'shock' : 'neutral';
  if (L === 'A1') st.mood = t > ev('hearts') ? 'skeptical' : 'neutral';
  if (L === 'A2') st.mood = t > ev('napkin') ? 'worried' : 'neutral';
  if (L === 'B1') st.mood = t > ev('bow') ? 'annoyed' : 'neutral';
  if (L === 'B2') st.mood = t > ev('violin') ? 'shock' : 'worried';
  if (L === 'C1') { st.mood = t > ev('ring') ? 'shock' : 'annoyed'; if (t > ev('ring')) { st.armL = reach(g, -1, -g.sw * 0.2, g.ySh + 40); } }
  if (L === 'C2') { st.mood = speaking('c2_her', t, 0.1) ? 'smug' : 'neutral'; if (t > ev('stand')) { st.mood = 'surprised'; st.turn = 0.5; st.look = 1; } if (SP.c2_y && t > SP.c2_y.t) { st.mood = 'annoyed'; st.squint = Math.floor(t * 5) % 4 === 0; } }
  return st; }
function bradPos(t, L) { if (L === 'hook') return lerp(1300, BX, eOut(P(t, 0.0, 0.95))); if (L === 'C2' && t > ev('stand')) return lerp(BX, JX - 260, eIO(P(t, ev('stand'), ev('stand') + 0.9))); if (L === 'outro' || L === 'C2end') return JX - 260; return BX; }
function bradState(t, L) { const kneel = L === 'C2' && SP.c2_x2 && t > SP.c2_x2.t - 0.4, g = kneel ? G.kneel : G.brad;
  const st = { t, talk: talk('brad', t), mood: 'happy', turn: -0.4, look: -0.8, armL: reach(g, -1, -g.sw * 0.5, g.ySh + 240), armR: reach(g, 1, g.sw * 0.6, g.ySh + 340), items: { L: roseItem } };
  gestTalk(st, g, 'brad', t, 1);
  if (L === 'hook') { st.mood = 'smug'; st.legPose = t < 0.95 ? 'walk' : 'stand'; st.armL = reach(g, -1, -g.sw * 1.9, g.ySh + 120); }
  if (L === 'A1' && t > ev('hearts') - 0.2) { st.mood = 'happy'; st.armR = reach(g, 1, g.sw * 0.3, g.ySh + 120, { fist: true }); }
  if (L === 'A2' && t > ev('napkin') - 0.3 && t < ev('napkin') + 0.6) { st.armL = reach(g, -1, -(BX - 0) - 40 + Math.sin(t * 30) * 12, TABLE.top - 20 - FY); st.lookY = 0.7; }
  if (L === 'B1' && t > ev('bow') - 0.2 && t < SP.b1_nar.t + 0.6) { const k = Math.sin(clamp((t - ev('bow') + 0.2) / 1.2) * Math.PI); st.headY = 60 * k; st.tilt = -0.18 * k; st.armL = reach(g, -1, -g.sw * 2.3, g.ySh + 60); st.armR = reach(g, 1, g.sw * 2.3, g.ySh + 60); }
  if (L === 'B2' && t > ev('violin') - 0.2) st.mood = 'happy';
  if (L === 'C1' && t > SP.c1_x.t + 0.3) { st.mood = 'smug'; st.armR = reach(g, 1, g.sw * 2.2, g.ySh - 40); }
  if (L === 'C2') { st.mood = speaking('c2_her', t) ? 'happy' : 'smug'; if (t > ev('stand') - 0.3) { st.items = { L: ctx => { ctx.rotate(0); ringBox(ctx, kneel ? 1 : 0, 0.9); } }; st.armL = reach(g, -1, -g.sw * 1.6, g.ySh + 240); }
    if (t > ev('stand')) { st.turn = 0.45; st.look = 0.8; st.legPose = t < ev('stand') + 0.9 ? 'walk' : 'stand'; st.armR = reach(g, 1, g.sw * 1.9, g.ySh + 200); st.items = { R: ctx => ringBox(ctx, kneel ? 1 : 0, 0.9) }; st.armL = reach(g, -1, -g.sw * 0.5, g.ySh + 330); }
    if (kneel) { st.legPose = 'squat'; st.drop = 380; st.mood = 'happy'; st.armR = reach(g, 1, g.sw * 2.4, g.ySh + 60); } }
  return st; }
function jessState(t, L) { const g = G.jess, closed = L === 'C2' && t > ev('book'); const st = { t, talk: talk('jess', t), mood: 'neutral', turn: -0.2, look: -0.3, lookY: 0.6, legPose: 'sit', drop: 330, legs: false,
  armL: reach(g, -1, -g.sw * 0.9, g.ySh + 150), armR: reach(g, 1, g.sw * 0.9, g.ySh + 150), items: { L: ctx => { if (!closed) { paint(ctx, q => { q.m(0, -100); q.l(110, -90); q.l(110, 20); q.l(0, 10); q.z(); }, '#2F6A8A', { sd: 2, hd: 1, lw: 3 }); ctx.fillStyle = '#FFFDF8'; ctx.fillRect(4, -92, 100, 98); } } } };
  const watch = (Math.floor(t / 7) % 2 === 1) && (t % 7) < 1.2 && !closed; if (watch) { st.armR = reach(g, 1, g.sw * 0.3, g.ySh + 20); st.lookY = 0.2; st.look = 0.2; st.mood = 'annoyed'; }
  if (L === 'C2' && t > ev('stand') + 0.6) { st.lookY = 0; st.look = -0.8; st.mood = 'skeptical'; }
  if (closed) { st.mood = 'happy'; st.items = {}; st.armL = reach(g, -1, -g.sw * 1.6, g.ySh + 300); st.armR = reach(g, 1, -g.sw * 0.4, g.ySh + 220); }
  return st; }
function vioState(t, L) { const g = G.vio, u = t * 5; return { t, talk: 0, mood: 'happy', turn: 0.2, look: -0.6, squint: true, armL: reach(g, -1, -g.sw * 0.7, g.ySh + 30), armR: reach(g, 1, g.sw * (1.4 + Math.sin(u) * 0.5), g.ySh + 90), items: { L: violin(t), R: ctx => { ctx.rotate(-0.9); ctx.fillStyle = '#C9A06A'; ctx.fillRect(-3, -200, 6, 220); } } }; }
function waitPos(t, L) { if (L !== 'C1') return null; const t0 = SP.c1_x.t - 0.2; if (t < t0) return null; return lerp(1400, WX, eOut(P(t, t0, t0 + 0.9))); }
function waitState(t, L) { const g = G.wait, t0 = SP.c1_x.t - 0.2, st = { t, talk: 0, mood: 'neutral', turn: -0.4, look: -0.6, legPose: t < t0 + 0.9 ? 'walk' : 'stand', armL: reach(g, -1, -g.sw * 1.7, g.ySh + 200), armR: reach(g, 1, g.sw * 0.6, g.ySh + 330) };
  const lifted = t > ev('ring'); st.items = { L: ctx => { ctx.rotate(0); ctx.fillStyle = '#C9CED6'; ctx.fillRect(-110, -8, 220, 12); ringBox(ctx, lifted ? eOut(P(t, ev('ring'), ev('ring') + 0.4)) : 0, 1); if (!lifted) paint(ctx, q => { q.m(-90, -4); q.q(-90, -120, 0, -124); q.q(90, -120, 90, -4); q.z(); }, '#D8DEE6', { sd: 4, hd: 2, lw: 3 }); } };
  if (lifted) { st.armR = reach(g, 1, g.sw * 1.8, g.ySh - 160); st.items.R = ctx => { ctx.rotate(0.3); paint(ctx, q => { q.m(-90, -4); q.q(-90, -120, 0, -124); q.q(90, -120, 90, -4); q.z(); }, '#D8DEE6', { sd: 4, hd: 2, lw: 3 }); }; st.mood = 'smug'; }
  return st; }
function vioK(t, L) { if (L === 'C1' || L === 'C2' || L === 'outro') return 1; if (L === 'B2') return eBack(P(t, ev('violin'), ev('violin') + 0.4), 1.6); return 0; }
function world(c, t, L) {
  c.drawImage(BGB, BX0, BY0, BW, BH);
  const heads = {};
  // Jessica's table (background right)
  heads.jess = put(c, JESS, jessState(t, L), JX, FY);
  cloth(c, JX - 150, JX + 110, -470, 260); c.fillStyle = '#3A1A26'; c.fillRect(JX - 30, -210, 60, 270); candle(c, JX + 70, -470, t);
  const vk = vioK(t, L); if (vk > 0) { c.save(); c.translate(VX, FY - 60 + (1 - vk) * 500); c.globalAlpha = clamp(vk * 2); put(c, VIO, vioState(t, L), 0, 0, VS); c.restore(); if (vk > 0.5) { c.fillStyle = 'rgba(255,240,200,.9)'; for (let i = 0; i < 3; i++) { const k = (t * 0.6 + i / 3) % 1; c.globalAlpha = 1 - k; note(c, VX - 160 - k * 120 + i * 40, -1300 - k * 260, i % 2); } c.globalAlpha = 1; } }
  const bx = bradPos(t, L);
  heads.her = put(c, HER, herState(t, L), HERX, FY);
  // main table
  cloth(c, TABLE.x0, TABLE.x1, TABLE.top, 120); c.fillStyle = '#3A1A26'; c.fillRect((TABLE.x0 + TABLE.x1) / 2 - 18, TABLE.top + 120, 36, FY - TABLE.top - 120); c.fillRect((TABLE.x0 + TABLE.x1) / 2 - 130, FY - 20, 260, 20);
  candle(c, -40, TABLE.top, t); napkin(c, t);
  heads.brad = put(c, BRAD, bradState(t, L), bx, FY);
  const wx = waitPos(t, L); if (wx !== null) put(c, WAIT, waitState(t, L), wx, FY);
  if (L === 'A1' && t > ev('hearts')) { const k = P(t, ev('hearts'), ev('hearts') + 2.2); for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + k * 2; c.globalAlpha = 1 - k; heart(c, bx + Math.cos(a) * (260 + k * 220), -1600 + Math.sin(a) * 200 - k * 300, 30 + hash(i) * 20, ROSE); } c.globalAlpha = 1; }
  if (L === 'C2' && SP.c2_y && t > ev('book')) { const k = P(t, ev('book'), ev('book') + 2.5); for (let i = 0; i < 7; i++) { c.globalAlpha = 1 - k; heart(c, JX - 140 + hash(i) * 220, -1100 - k * 500 - hash(i * 5) * 200, 26 + hash(i * 2) * 16, ROSE); } c.globalAlpha = 1; }
  return heads;
}
function shotFor(t) { const sc = sceneAt(t), L = sc.id, two = { x: 180, y: -1000, z: 0.66, r: 0 }; if (L === 'hook' || L === 'outro') return two; const u = t - sc.s; if (u < 1.15) return { ...two, z: 0.64, cut: u < 0.85 };
  if (L === 'C1' && t > SP.c1_x.t - 0.2 && t < SP.c1_nar.t + 1.0) return { x: 300, y: -1020, z: 0.68, r: 0 };
  if (L === 'C2' && speaking('c2_her', t, 0.2, 0.3)) return { x: HERX + 200, y: -1250, z: 0.85, r: 0 };
  if (L === 'C2' && t > ev('stand')) return { x: JX - 300, y: -1050, z: 0.78, r: 0 };
  if (L === 'B2' && t > ev('violin') - 0.2) return { x: 0, y: -1050, z: 0.72, r: 0 };
  const l = L.toLowerCase(), cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.3 && t < s.t + s.d + 0.2);
  if (cur) return cur.who === 'her' ? { x: HERX + 240, y: -1180, z: 0.92, r: 0.3 } : { x: BX - 200, y: -1280, z: 0.9, r: -0.3 };
  return two; }
const CAM = E.simulateCamera(TL, shotFor, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L); const M = c.getTransform(); c.restore(); return { heads, M }; }
function drawHook(c, t) { const tf = Math.min(t, 1.0); drawWorld(c, tf, 'hook', { x: 250, y: -1000, z: 0.62, r: 0 }); Hq.vignette(c, W, HH, 0.3);
  if (t > 1.0) { const k = P(t, 1.0, 1.15); c.fillStyle = `rgba(30,20,40,${0.28 * k})`; c.fillRect(0, 0, W, HH); if (t < 1.12) { c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(0, 0, W, HH); }
    const kk = eBack(P(t, 1.05, 1.35), 2); c.save(); c.translate(560, 1420); c.rotate(-0.05); c.scale(kk, kk); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -440 + 8, -60 + 10, 880, 120, 20); c.fill(); c.fillStyle = '#FFFDF8'; rr(c, -440, -60, 880, 120, 20); c.fill(); UI.textFit(c, 'Unb9', 56, 'ВИЖУ ЕГО ПЕРВЫЙ РАЗ', 800); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = C.oliveD; c.fillText('ВИЖУ ЕГО ПЕРВЫЙ РАЗ', 0, 4); c.restore(); }
  K.titleRibbon(c, t, 540, 330); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t);
  if (sc.id === 'hook') { drawHook(c, t); Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  if (sc.id === 'outro') { K.outro(c, t, { q: ['А КАК ТЫ ОТКАЗЫВАЕШЬ', 'НАСТОЙЧИВЫМ?'], rows: [['A2', "I'm not interested."], ['B1', "I'm seeing someone."], ['B2', "I'm flattered, but..."], ['C1', "I'm sorry, but the answer is no."]], cta: ['ОТПРАВЬ ТОМУ, КТО НЕ', 'ПОНИМАЕТ СЛОВА «НЕТ»'], hero: (cc, tt) => put(cc, HER, { t: tt, mood: 'smug', turn: 0, look: 0, armL: reach(G.her, -1, -G.her.sw * 0.6, G.her.ySh + 300), armR: reach(G.her, 1, G.her.sw * 1.4, G.her.ySh + 200), items: { R: items.wine(0.5) } }, 0, 0) }); Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const f = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[f], sh = shake(t);
  const { heads, M } = drawWorld(c, t, sc.id, cam, sh); Hq.vignette(c, W, HH, 0.26);
  const proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f });
  napkinBig(c, t, sc.id);
  K.bubbles(c, t, sc, heads, proj, { names: { brad: ['BRAD', '#A8324A'], jess: ['JESSICA', '#2F8A8A'] }, hold: { c2_her: 0.25 } });
  if (sc.id === 'C2') { K.dots(c, t, endOf('c2_her') + 0.3, SP.c2_x.t - 0.1); }
  K.hud(c, t, sc);
}
E.run('date', NF, renderFrame);
