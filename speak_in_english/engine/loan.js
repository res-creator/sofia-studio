// "Friend asks for a loan" episode renderer: node loan.js start end out.mp4 | --png=f1,f2
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/loan/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SC, SP, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf, EV, put } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2, ev = k => EV(k);
const HER = { ...BASE.her_london };
const TYLER = { ...BASE.kai, top: { type: 'hoodie', col: '#4CAF6A' }, bottom: { type: 'jeans', col: '#3B4A6A' } };
const G = { her: geom(HER), tyler: geom(TYLER) };
const FY = 60, HERX = -330, TYX = 330, TABLE = { x0: -170, x1: 170, top: -760 };
function txt(c, s, x, y, size, col, font = 'Unb9', align = 'center') { c.font = `${size}px ${font}`; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- café (prerendered)
const BX0 = -1600, BY0 = -3000, BW = 3200, BH = 3700, BS = 0.5;
function drawCafe(c) {
  c.fillStyle = '#E9D2B4'; c.fillRect(BX0, BY0, BW, BH); c.fillStyle = 'rgba(180,90,60,.12)'; for (let y = BY0; y < 0; y += 70) for (let x = BX0 + ((y / 70) % 2) * 70; x < BX0 + BW; x += 140) c.fillRect(x, y, 130, 60);
  c.fillStyle = '#6A4630'; c.fillRect(BX0, -560, BW, 620); c.fillStyle = '#7A5238'; for (let x = BX0; x < BX0 + BW; x += 120) c.fillRect(x, -540, 8, 600);
  c.fillStyle = '#2B2F3A'; rr(c, -1300, -2000, 620, 820, 20); c.fill(); c.fillStyle = '#C9A06A'; c.lineWidth = 0; txt(c, 'MENU', -990, -1890, 54, '#F7F2E8', 'Unb9'); ['FLAT WHITE £3', 'LATTE £3.5', 'CROISSANT £2', 'TOAST £4', 'CAKE £5'].forEach((s, i) => txt(c, s, -990, -1770 + i * 100, 38, '#F7F2E8', 'Nun9'));
  c.fillStyle = '#FFFDF8'; c.fillRect(400, -2100, 900, 1000); c.fillStyle = '#9FC8E8'; c.fillRect(430, -2070, 840, 940); c.fillStyle = '#C9B4E8'; c.fillRect(470, -1500, 300, 370); c.fillStyle = '#F4B8C8'; c.fillRect(800, -1650, 340, 520); c.fillStyle = '#FFFDF8'; c.fillRect(840, -2070, 20, 940); c.fillStyle = '#E0474C'; for (let i = 0; i < 8; i++) { c.beginPath(); c.moveTo(430 + i * 110, -2070); c.lineTo(540 + i * 110, -2070); c.lineTo(485 + i * 110, -1970); c.fill(); }
  for (const x of [-600, 0, 600]) { c.strokeStyle = '#2B2F3A'; c.lineWidth = 6; c.beginPath(); c.moveTo(x, BY0); c.lineTo(x, -2300); c.stroke(); paint(c, q => { q.m(x - 90, -2300); q.l(x + 90, -2300); q.l(x + 50, -2400); q.l(x - 50, -2400); q.z(); }, '#F2C14E', { sd: 4, hd: 2, lw: 3 }); }
  const fg = c.createLinearGradient(0, FY, 0, 700); fg.addColorStop(0, '#B98A62'); fg.addColorStop(1, '#9A6E4A'); c.fillStyle = fg; c.fillRect(BX0, FY, BW, BY0 + BH - FY); c.fillStyle = 'rgba(0,0,0,.12)'; for (let x = BX0; x < BX0 + BW; x += 160) for (let y = FY; y < 700; y += 80) if (((x / 160) + (y / 80)) % 2 < 1) c.fillRect(x, y, 160, 80);
}
const BGB = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); { const c = BGB.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); c.filter = 'blur(1.5px)'; drawCafe(c); }

// ---------------- props
function chair(c, x, side) { c.fillStyle = '#3A2A1A'; c.fillRect(x - 120, -330, 240, 26); c.fillRect(x - 110, -304, 18, 364); c.fillRect(x + 92, -304, 18, 364); const bx = x + side * 120; c.fillRect(bx - 9, -800, 18, 500); }
function table(c, t, L) { paint(c, q => { q.m(TABLE.x0 - 40, TABLE.top); q.l(TABLE.x1 + 40, TABLE.top); q.l(TABLE.x1 + 40, TABLE.top + 30); q.l(TABLE.x0 - 40, TABLE.top + 30); q.z(); }, '#C99A64', { sd: 4, hd: 2, lw: 3 }); c.fillStyle = '#2B2F3A'; c.fillRect(-14, TABLE.top + 30, 28, FY - TABLE.top - 30); c.fillRect(-120, FY - 20, 240, 20);
  for (const x of [-120, 120]) { paint(c, q => { q.m(x - 34, TABLE.top - 70); q.l(x + 34, TABLE.top - 70); q.l(x + 28, TABLE.top); q.l(x - 28, TABLE.top); q.z(); }, '#FFFDF8', { sd: 3, hd: 2, lw: 3 }); c.strokeStyle = '#2B2F3A'; c.lineWidth = 5; c.beginPath(); c.arc(x + 40 * Math.sign(x), TABLE.top - 40, 14, -1.3, 1.3); c.stroke(); }
  notebook(c, -20, TABLE.top, t, L);
  if (L === 'B1' && t > ev('coin') - 1.4) laptop(c, 80, TABLE.top, t);
  if (L === 'C2' && t > ev('iou')) { c.save(); c.translate(70, TABLE.top - 6); c.rotate(-0.1); c.fillStyle = '#FFFDF8'; c.fillRect(-90, -50, 180, 50); txt(c, 'IOU £50', 0, -34, 22, '#E0474C'); txt(c, '(to pay back £50)', 0, -12, 14, '#2B2F3A', 'Nun9'); c.restore(); }
}
function notebook(c, x, y, t, L) { c.save(); c.translate(x, y); c.fillStyle = '#E0474C'; rr(c, -70, -24, 140, 24, 4); c.fill(); c.fillStyle = '#FFFDF8'; c.fillRect(-64, -22, 128, 6); c.restore();
  if (L === 'C1' && t > ev('list')) { const k = eOut(P(t, ev('list'), ev('list') + 0.8)); const len = 40 + (FY - y + 200) * k; c.fillStyle = '#FFFDF8'; c.fillRect(x - 60, y - 4, 120, len); c.strokeStyle = '#C9D6E8'; c.lineWidth = 2; for (let yy = y + 20; yy < y + len; yy += 30) { c.beginPath(); c.moveTo(x - 56, yy); c.lineTo(x + 56, yy); c.stroke(); } const M = ['MAR £50', 'APR £20', 'MAY £35', 'JUN £15', 'JUL £60', 'AUG £5', 'SEP £40', 'OCT £25', 'NOV £10']; M.forEach((m, i) => { if (y + 18 + i * 60 < y + len) txt(c, m, x, y + 14 + i * 60, 20, '#2B2F3A', 'Nun9'); }); } }
function laptop(c, x, y, t) { c.save(); c.translate(x, y); paint(c, q => { q.m(-90, -10); q.l(90, -10); q.l(100, 0); q.l(-100, 0); q.z(); }, '#9AA3B2', { sd: 2, hd: 1, lw: 3 }); c.save(); c.rotate(0.1); paint(c, q => { q.m(-85, -150); q.l(85, -150); q.l(85, -14); q.l(-85, -14); q.z(); }, '#2B2F3A', { sd: 2, hd: 1, lw: 3 }); c.restore(); c.restore(); }
function gill(c, w, h, t) { // phone: Bubbles with a bandage
  c.fillStyle = '#BFE3F7'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,255,.5)'; for (let i = 0; i < 8; i++) { c.beginPath(); c.arc(60 + hash(i) * 300, 600 - ((t * 120 + i * 90) % 600), 10, 0, TAU); c.fill(); }
  c.save(); c.translate(w / 2, 360); c.rotate(Math.sin(t * 2) * 0.08); paint(c, q => { q.m(90, 0); q.l(170, -70); q.l(170, 70); q.z(); }, '#F2A03B', { sd: 4, hd: 2, lw: 3 }); paint(c, q => q.e(0, 0, 120, 80), '#F2A03B', { sd: 6, hd: 3, lw: 3 }); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(-60, -16, 18, 0, TAU); c.fill(); c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(-64, -16, 9, 0, TAU); c.fill();
  c.fillStyle = '#FFFDF8'; c.save(); c.rotate(-0.4); c.fillRect(-70, -76, 120, 26); c.restore(); c.fillStyle = '#E0474C'; c.fillRect(-26, -86, 8, 22); c.fillRect(-33, -79, 22, 8); c.restore();
  c.fillStyle = '#2B2F3A'; rr(c, 30, 560, w - 60, 100, 18); c.fill(); txt(c, 'BUBBLES · SURGERY', w / 2, 595, 26, '#F2C14E'); txt(c, '£50', w / 2, 630, 28, '#FFFFFF'); }
function coinChart(c, w, h, t, k) { c.fillStyle = '#121826'; c.fillRect(0, 0, w, h); txt(c, 'TYLERCOIN', w / 2, 50, 40, '#F2C14E'); c.strokeStyle = 'rgba(255,255,255,.1)'; c.lineWidth = 2; for (let y = 120; y < h; y += 80) { c.beginPath(); c.moveTo(20, y); c.lineTo(w - 20, y); c.stroke(); } c.strokeStyle = '#E0474C'; c.lineWidth = 8; c.beginPath(); c.moveTo(30, 160); const n = 12; for (let i = 1; i <= n; i++) { const u = i / n; if (u > k) break; c.lineTo(30 + u * (w - 60), 160 + Math.pow(u, 2.2) * (h + 200) + Math.sin(i * 2) * 20); } c.stroke(); txt(c, '-' + Math.round(99.9 * k) + '%', w / 2, h - 60, 56, '#E0474C'); }

// ---------------- characters
const seat = {};
function herState(t, L) { const g = G.her, st = { t, talk: talk('her', t), mood: 'neutral', turn: 0.45, look: 0.8, ...seat, armL: reach(g, -1, -g.sw * 0.5, g.ySh + 330), armR: reach(g, 1, g.sw * 1.6, g.ySh + 330) };
  const sp = TL.speech.find(s => s.who === 'her' && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st.armR = reach(g, 1, g.sw * 1.6 + Math.sin(u) * 20, g.ySh + 230 + Math.cos(u) * 20); }
  if (L === 'A1' && t > ev('tag')) st.mood = 'skeptical'; if (L === 'A2') st.mood = t > ev('fish') ? 'worried' : 'neutral'; if (L === 'B1' && t > ev('coin')) st.mood = 'shock'; if (L === 'B2' && t > ev('bow')) st.mood = 'annoyed';
  if (L === 'C1') { st.mood = 'smug'; if (t > ev('list') - 0.3 && t < ev('list') + 1.0) st.armR = reach(g, 1, g.sw * 2.4, g.ySh + 300); }
  if (L === 'C2') { st.mood = speaking('c2_her', t, 0.1) ? 'smug' : 'neutral'; if (t > ev('iou')) { st.mood = 'annoyed'; st.squint = Math.floor(t * 6) % 4 === 0; } }
  if (L === 'hook') st.mood = 'skeptical';
  return st; }
function tylerState(t, L) { const g = G.tyler, st = { t, talk: talk('tyler', t), mood: 'happy', turn: -0.45, look: -0.8, ...seat, armL: reach(g, -1, -g.sw * 1.6, g.ySh + 330), armR: reach(g, 1, g.sw * 0.5, g.ySh + 330) };
  const sp = TL.speech.find(s => s.who === 'tyler' && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st.armL = reach(g, -1, -g.sw * 1.8 + Math.sin(u) * 25, g.ySh + 200 + Math.cos(u) * 25); }
  if (L === 'A2' && t > ev('fish') - 0.2 && t < SP.a2_nar.t) { st.mood = 'sad'; st.armL = reach(g, -1, -g.sw * 2.2, g.ySh + 60); }
  if (L === 'B2' && t > ev('bow') - 0.1) { st.armL = reach(g, -1, -g.sw * 2.4, g.ySh + 250); st.items = { L: ctx => { ctx.fillStyle = '#E0474C'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 22, -40, 22, 12, s * 0.5, 0, TAU); ctx.fill(); } ctx.beginPath(); ctx.arc(0, -40, 8, 0, TAU); ctx.fill(); } }; }
  if (L === 'C1' && t > ev('list')) { st.mood = 'shock'; st.lookY = 0.8; }
  if (L === 'C2') { st.mood = speaking('c2_her', t) ? 'worried' : 'happy'; if (t > SP.c2_x.t) st.mood = 'neutral'; if (t > SP.c2_x2.t) { st.mood = 'happy'; } if (t > ev('iou') - 0.4 && t < ev('iou') + 0.3) st.armL = reach(g, -1, -g.sw * 2.6, g.ySh + 330); }
  return st; }
function world(c, t, L) {
  c.drawImage(BGB, BX0, BY0, BW, BH);
  const heads = {};
  heads.her = put(c, HER, herState(t, L), HERX, FY);
  heads.tyler = put(c, TYLER, tylerState(t, L), TYX, FY);
  table(c, t, L);
  if (L === 'A1' || L === 'hook') { const k = L === 'A1' && t > ev('tag') ? 1 : 0; c.save(); c.translate(TYX + 300, -1450); c.rotate(0.08); c.fillStyle = '#F2C14E'; rr(c, -90, -50, 180, 100, 14); c.fill(); txt(c, k ? '£40?' : '£50?', 0, 2, 48, '#2B2F3A'); if (k) { c.strokeStyle = '#E0474C'; c.lineWidth = 6; c.beginPath(); c.moveTo(-120, -80); c.lineTo(-40, -20); c.stroke(); txt(c, '£50', -130, -100, 30, '#E0474C'); } c.restore(); }
  return heads;
}
function shotFor(t) { const sc = sceneAt(t), L = sc.id, two = { x: 0, y: -1000, z: 0.78, r: 0 }; if (L === 'hook' || L === 'outro') return two; const u = t - sc.s; if (u < 1.15) return { ...two, z: 0.74, cut: u < 0.85 };
  if (L === 'C1' && t > ev('list') - 0.2 && t < SP.c1_nar.t) return { x: 0, y: -850, z: 0.68, r: 0 };
  if (L === 'C2' && speaking('c2_her', t, 0.2, 0.3)) return { x: HERX + 200, y: -1250, z: 0.85, r: 0 };
  const l = L.toLowerCase(), cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.3 && t < s.t + s.d + 0.2);
  if (cur) return cur.who === 'her' ? { x: HERX + 230, y: -1180, z: 0.95, r: 0.3 } : { x: TYX - 230, y: -1220, z: 0.95, r: -0.3 };
  return two; }
const CAM = E.simulateCamera(TL, shotFor, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud', 'boom']);
function drawWorld(c, t, L, cam, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L); const M = c.getTransform(); c.restore(); return { heads, M }; }
function drawHook(c, t) { drawWorld(c, t, 'hook', { x: 0, y: -1000, z: 0.78, r: 0 }); Hq.vignette(c, W, HH, 0.3);
  const k = 1 - eIO(P(t, 2.3, 2.9)); if (k > 0) { c.save(); c.globalAlpha = Math.min(1, k * 1.4); c.translate(540, 1250); c.rotate(-0.05); c.scale(0.9 + 0.1 * k, 0.9 + 0.1 * k); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(-330, -290, 680, 600); c.fillStyle = '#FFFDF8'; c.fillRect(-340, -300, 680, 600); c.fillStyle = '#E0474C'; c.fillRect(-340, -300, 40, 600); c.strokeStyle = '#C9D6E8'; c.lineWidth = 3; for (let y = -200; y < 300; y += 70) { c.beginPath(); c.moveTo(-280, y); c.lineTo(320, y); c.stroke(); } txt(c, 'TYLER OWES ME:', 20, -240, 50, '#2B2F3A', 'Unb9'); ['£20 — pizza', '£35 — concert', '£50 — "emergency"'].forEach((s, i) => txt(c, s, -250, -150 + i * 90, 46, '#3C6FB4', 'Nun9', 'left')); c.restore(); }
  K.titleRibbon(c, t, 540, 330); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t);
  if (sc.id === 'hook') { drawHook(c, t); Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  if (sc.id === 'outro') { K.outro(c, t, { q: ['А ТЕБЕ', 'ВОЗВРАЩАЮТ ДОЛГИ?'], rows: [['A2', "I can't lend you money."], ['B1', "I'm a bit short this month."], ['B2', "I'd rather not lend money to friends."], ['C1', 'You still owe me fifty pounds.']], cta: ['ОТПРАВЬ ТОМУ, КТО', 'ДОЛЖЕН ТЕБЕ ДЕНЕГ'], hero: (cc, tt) => put(cc, HER, { t: tt, mood: 'smug', turn: 0, look: 0, armL: reach(G.her, -1, -G.her.sw * 0.6, G.her.ySh + 300), armR: reach(G.her, 1, G.her.sw * 1.2, G.her.ySh + 160), items: { R: ctx => { ctx.fillStyle = '#E0474C'; rr(ctx, -50, -120, 100, 130, 6); ctx.fill(); } } }, 0, 0) }); Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const f = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[f], sh = shake(t);
  const { heads, M } = drawWorld(c, t, sc.id, cam, sh); Hq.vignette(c, W, HH, 0.26);
  const proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }), e = sc.ev || {};
  if (sc.id === 'A2' && e.fish) { const k = eBack(P(t, e.fish, e.fish + 0.3), 1.8) * (1 - P(t, SP.a2_nar.t + 1.2, SP.a2_nar.t + 1.5)); if (k > 0) K.phone(c, 780, 1250, 0.62 * k, (cc, w, h) => gill(cc, w, h, t), 0.06); }
  if (sc.id === 'B1' && e.coin) { const k = eBack(P(t, e.coin - 1.4, e.coin - 1.1), 1.8) * (1 - P(t, SP.b1_nar.t + 2.0, SP.b1_nar.t + 2.3)); if (k > 0) { c.save(); c.translate(540, 1300); c.scale(k, k); c.fillStyle = '#2B2F3A'; rr(c, -330, -230, 660, 440, 26); c.fill(); c.save(); c.beginPath(); rr(c, -310, -210, 620, 400, 14); c.clip(); c.translate(-310, -210); coinChart(c, 620, 400, t, P(t, e.coin - 1.0, e.coin + 0.2)); c.restore(); c.fillStyle = '#9AA3B2'; rr(c, -380, 210, 760, 30, 10); c.fill(); c.restore(); } }
  K.bubbles(c, t, sc, heads, proj, { names: { tyler: ['TYLER', '#2F8A4A'] }, hold: { c2_her: 0.25 } });
  if (sc.id === 'C2') K.dots(c, t, endOf('c2_her') + 0.3, SP.c2_x.t - 0.1);
  K.hud(c, t, sc);
}
E.run('loan', NF, renderFrame);
