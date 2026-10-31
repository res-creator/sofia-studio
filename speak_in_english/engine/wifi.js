// "How to ask for the Wi-Fi password" episode renderer (hard_cut camera): node wifi.js start end out.mp4 | --png=f1,f2
// Coffee shop (togo layout): Anna in front of the counter on the left, the barista behind it on the right; the Wi-Fi sign with the password hangs on the wall BEHIND Anna from the first frame (revealed in C2).
// Shots tagged 'ui:<view>' (cup, black) replace the world with a full-screen insert.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/wifi/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];

// ---------------- cast
const HER = { ...BASE.her_lift, top: { type: 'coat', col: '#C2504A', col2: '#F5EBDD' }, bottom: { type: 'jeans', col: '#4A5A7A' }, shoes: { col: '#2B2F3A', acc: null } };
const BAR = { ...BASE.rita, top: { type: 'tee', col: '#2B2F3A' }, bottom: { type: 'trousers', col: '#2B2F3A' } };
const G = { her: geom(HER), barista: geom(BAR) };
const HX = -420, BX = 430, CT = -760;                       // her / barista feet x, counter top height
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function apron(cc, g) { paint(cc, q => { q.m(-g.sw * 0.75, g.ySh + 30); q.l(g.sw * 0.75, g.ySh + 30); q.l(g.sw * 1.0, g.ySh + 560); q.l(-g.sw * 1.0, g.ySh + 560); q.z(); }, '#7A4E2E', { sd: 6, hd: 3, lw: 4 }); cc.fillStyle = '#F2C14E'; rr(cc, -90, g.ySh + 230, 180, 120, 14); cc.fill(); }

// ---------------- paper cup (also drawn on the counter and in the full-screen insert)
function cupDraw(c, name = '', k = 1) { c.save(); c.scale(k, k); c.fillStyle = '#FFFDF8'; c.strokeStyle = '#B9B2A8'; c.lineWidth = 4; c.beginPath(); c.moveTo(-48, -150); c.lineTo(48, -150); c.lineTo(36, 0); c.lineTo(-36, 0); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#C98B5A'; c.beginPath(); c.moveTo(-44, -108); c.lineTo(44, -108); c.lineTo(40, -52); c.lineTo(-40, -52); c.closePath(); c.fill(); if (name) fitTxt(c, name, 0, -80, 26, '#2B2F3A', 76, 'Cav7');
  c.fillStyle = '#E8E2D6'; rr(c, -54, -170, 108, 26, 8); c.fill(); c.stroke(); c.restore(); }
const big = f => ctx => { ctx.scale(1.5, 1.5); f(ctx); };
const routerItem0 = ctx => { ctx.save(); ctx.fillStyle = '#2B2F3A'; rr(ctx, -120, -70, 240, 64, 12); ctx.fill(); ctx.fillRect(-90, -150, 12, 84); ctx.fillRect(78, -150, 12, 84); ctx.fillStyle = '#7CF29A'; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(-70 + k * 34, -38, 7, 0, TAU); ctx.fill(); } ctx.strokeStyle = '#2B2F3A'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-40, -6); ctx.bezierCurveTo(-60, 60, 40, 40, 60, 110); ctx.stroke(); ctx.restore(); };
const slipItem0 = ctx => { ctx.save(); ctx.rotate(-0.08); ctx.fillStyle = '#FFFDF8'; rr(ctx, -80, -170, 160, 160, 6); ctx.fill(); ctx.strokeStyle = '#B9B2A8'; ctx.lineWidth = 4; ctx.stroke(); fitTxt(ctx, 'WI-FI', 0, -140, 28, '#2B2F3A', 120); fitTxt(ctx, 'Latte', 0, -98, 30, '#E0474C', 130, 'Cav7'); fitTxt(ctx, '4ever', 0, -62, 30, '#E0474C', 130, 'Cav7'); ctx.fillStyle = '#8A8A8A'; ctx.fillRect(-56, -34, 112, 5); ctx.restore(); };
const netItem0 = ctx => { ctx.save(); ctx.rotate(0.06); ctx.fillStyle = '#2B3A2E'; rr(ctx, -130, -170, 260, 140, 14); ctx.fill(); ctx.strokeStyle = '#F2C14E'; ctx.lineWidth = 5; ctx.stroke(); fitTxt(ctx, 'Coffee Co', 0, -135, 34, '#F2C14E', 220); fitTxt(ctx, 'Guest_5G', 0, -100, 34, '#F7F2E8', 220); fitTxt(ctx, '_Free_2', 0, -66, 34, '#F7F2E8', 220); ctx.restore(); };
const routerItem = big(routerItem0), slipItem = big(slipItem0), netItem = big(netItem0);
function wifiMark(c, x, y, k, col) { c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 12 * k; c.lineCap = 'round'; for (let r = 1; r <= 3; r++) { c.beginPath(); c.arc(x, y, 38 * r * k, Math.PI * 1.25, Math.PI * 1.75); c.stroke(); } c.beginPath(); c.arc(x, y, 8 * k, 0, TAU); c.fill(); }

// ---------------- coffee shop (prerendered, softly blurred); the counter itself is drawn in front of the barista
function signBoard(c, cx, cy) { c.fillStyle = '#8A5A36'; rr(c, cx - 390, cy - 320, 780, 640, 22); c.fill(); c.fillStyle = '#25302A'; rr(c, cx - 360, cy - 290, 720, 580, 12); c.fill(); wifiMark(c, cx, cy - 120, 1.5, '#F2C14E'); fitTxt(c, 'FREE WI-FI', cx, cy + 5, 84, '#F7F2E8', 640); fitTxt(c, 'PASSWORD:', cx, cy + 120, 52, '#BFE3F7', 640, 'Cav7'); fitTxt(c, 'coffee123', cx, cy + 210, 88, '#7CF29A', 640, 'Cav7'); }
const BX0 = -2200, BY0 = -3400, BW = 4400, BH = 4800, BS = 0.5;
function drawShop(c) {
  c.fillStyle = '#F1E4CE'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = '#C9A57A'; c.fillRect(BX0, -1250, BW, 990); c.strokeStyle = 'rgba(0,0,0,.08)'; c.lineWidth = 5; for (let x = BX0; x < BX0 + BW; x += 220) { c.beginPath(); c.moveTo(x, -1250); c.lineTo(x, -260); c.stroke(); }
  signBoard(c, -290, -1940);
  c.fillStyle = '#2B3A2E'; rr(c, -1200, -2500, 1160, 150, 20); c.fill(); fitTxt(c, 'COFFEE & CO.', -620, -2425, 100, '#F2C14E', 1050);
  // chalkboard menu behind the barista
  c.fillStyle = '#8A5A36'; rr(c, 200, -2400, 1000, 1100, 18); c.fill(); c.fillStyle = '#25302A'; rr(c, 230, -2370, 940, 1040, 10); c.fill();
  fitTxt(c, 'MENU', 700, -2250, 110, '#F7F2E8', 800); ['LATTE  £3.50', 'CAPPUCCINO  £3.20', 'FLAT WHITE  £3.40', 'OAT MILK  +50p'].forEach((t, i) => fitTxt(c, t, 700, -2050 + i * 160, 64, i === 3 ? '#F2C14E' : '#F7F2E8', 860, 'Cav7'));
  // shelf with mugs
  c.fillStyle = '#8A5A36'; c.fillRect(-2100, -1650, 900, 36); for (let i = 0; i < 6; i++) { c.fillStyle = ['#EE5E9A', '#7FB0D8', '#F2C14E', '#7CC45A', '#E0474C', '#B9A2E6'][i]; rr(c, -2060 + i * 140, -1770, 90, 120, 14); c.fill(); }
  // pastry case (left, behind her)
  c.fillStyle = '#E9F2F7'; rr(c, -1900, -1050, 800, 400, 20); c.fill(); c.strokeStyle = '#9AA3B2'; c.lineWidth = 6; c.stroke(); for (let i = 0; i < 4; i++) { c.fillStyle = ['#E8A24A', '#C9473A', '#F2D27A', '#8A5A36'][i]; c.beginPath(); c.arc(-1780 + i * 200, -760, 60, Math.PI, 0); c.fill(); }
  c.fillStyle = '#C9B896'; c.fillRect(BX0, -260, BW, 1700); c.fillStyle = 'rgba(0,0,0,.06)'; for (let y = -260; y < 1400; y += 160) for (let x = BX0 + ((y / 160) % 2) * 160; x < BX0 + BW; x += 320) c.fillRect(x, y, 160, 160);
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };   // drawn sharp, blurred once
const BGK = mkBG(drawShop);
// cups on the counter: how many at time t, and the tray with the 4th one sliding in
const cupCount = (t, L) => L === 'C1' && t > ev('C1', 'tea') ? 1 : 0;
function counter(c, t, L) {
  paint(c, q => { q.m(60, CT); q.l(1250, CT); q.l(1250, CT + 70); q.l(60, CT + 70); q.z(); }, '#E9DCC6', { sd: 6, hd: 3, lw: 4 });
  paint(c, q => { q.m(80, CT + 70); q.l(1230, CT + 70); q.l(1230, 700); q.l(80, 700); q.z(); }, '#7A4E2E', { sd: 10, hd: 4, lw: 4 }); c.strokeStyle = 'rgba(0,0,0,.15)'; c.lineWidth = 5; for (let x = 360; x < 1230; x += 290) { c.beginPath(); c.moveTo(x, CT + 70); c.lineTo(x, 700); c.stroke(); }
  c.fillStyle = '#8A8F9A'; rr(c, 760, CT - 330, 330, 330, 18); c.fill(); c.fillStyle = '#2B2F3A'; rr(c, 790, CT - 300, 270, 80, 10); c.fill(); c.fillStyle = '#E0474C'; c.beginPath(); c.arc(1000, CT - 260, 14, 0, TAU); c.fill(); c.fillStyle = '#5A606E'; rr(c, 830, CT - 150, 210, 150, 8); c.fill();   // espresso machine
  c.fillStyle = '#2B2F3A'; rr(c, 480, CT - 120, 170, 120, 12); c.fill(); c.fillStyle = '#7CF29A'; rr(c, 500, CT - 105, 130, 40, 6); c.fill();                                                                                          // till
  const n = cupCount(t, L); for (let i = 0; i < n; i++) { c.save(); c.translate(150 + i * 100, CT - 6); cupDraw(c, 'ANNA', 1); c.restore(); }
  if (L === 'A1' && t > ev('A1', 'rob')) { const u = t - ev('A1', 'rob'); for (let k = 0; k < 9; k++) { const v = clamp(u - k * 0.07, 0, 3); if (v <= 0) continue; c.save(); c.globalAlpha = clamp(1.3 - v * 0.5); c.translate(565 + Math.sin(k * 2.3 + v * 4) * 80 + k * 6, CT - 120 - v * (260 + k * 25)); c.rotate(Math.sin(k + v * 6) * 0.6); c.fillStyle = '#7CC45A'; rr(c, -46, -24, 92, 48, 6); c.fill(); c.strokeStyle = '#2E6B2E'; c.lineWidth = 4; c.stroke(); fitTxt(c, '$', 0, 0, 30, '#2E6B2E', 40); c.restore(); } } }

// ---------------- characters
const gest = (st, g, who, t, side, base) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } };
const hang = (g, s) => reach(g, s, s * g.sw * 0.8, g.ySh + 330);
const chest = (g, s, k = 0.6) => reach(g, s, s * g.sw * k, g.ySh + 230);
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { t, talk: talk('her', t), mood: 'neutral', turn: 0.3, look: 0.7, armL: hang(g, -1), armR: hang(g, 1), items: {} };
  if (L === 'hook') { st.mood = 'happy'; if (t > hev('panic') - 0.05) { st.mood = 'worried'; st.blink = 0; st.armL = chest(g, -1); st.armR = chest(g, 1); } }
  if (L === 'A1') { st.mood = 'annoyed'; if (speaking('a1_h', t, 0.05, 0.3)) { st.mood = 'angry'; st.armR = reach(g, 1, g.sw * 2.0, g.ySh - 60, { planar: true }); } if (t > e('rob') - 0.1) { st.mood = 'surprised'; st.blink = 0; st.armR = hang(g, 1); } }
  if (L === 'A2') { st.mood = 'happy'; if (speaking('a2_h', t, 0.05, 0.3)) { st.armL = chest(g, -1, 0.3); st.armR = chest(g, 1, 0.3); } if (t > e('router') - 0.05) { st.mood = 'surprised'; st.blink = 0; st.armL = hang(g, -1); st.armR = hang(g, 1); } }
  if (L === 'B1') { st.mood = 'neutral'; if (speaking('b1_h', t, 0.05, 0.3)) { st.mood = 'happy'; gest(st, g, 'her', t, -1, 160); } if (t > e('slip') + 0.3) { st.mood = 'skeptical'; st.blink = 0; } }
  if (L === 'B2') { st.mood = 'smug'; if (speaking('b2_h', t, 0.05, 0.3)) gest(st, g, 'her', t, -1, 150); if (t > e('net') - 0.05) { st.mood = 'skeptical'; st.blink = 0; } }
  if (L === 'C1') { st.mood = 'happy'; if (speaking('c1_h', t, 0.05, 0.3)) { st.mood = 'happy'; gest(st, g, 'her', t, -1, 160); } if (t > e('tea') - 0.05) { st.mood = 'annoyed'; st.blink = 0; } if (speaking('c1_h2', t, 0.05, 0.3)) st.mood = 'sad'; }
  if (L === 'C2') { st.mood = 'happy'; st.turn = 0.4; st.look = 0.6;
    if (speaking('c2_h', t, 0.05, 0.1)) { st.mood = 'smug'; st.armL = chest(g, -1, 0.3); st.armR = chest(g, 1, 0.3); }
    if (t > endOf('c2_h') + 0.1) { st.mood = 'neutral'; st.blink = 0; }
    if (t > e('sign') + 0.2) { st.turn = -0.5; st.look = -0.9; st.mood = 'surprised'; st.blink = 0; }
    if (t > e('stare') - 0.05) { st.turn = 0.4; st.look = 0.6; st.mood = 'shock'; st.blink = 0; st.armL = reach(g, -1, -g.hw * 0.5, g.headY + g.hh * 0.6); st.armR = reach(g, 1, g.hw * 0.5, g.headY + g.hh * 0.6); }
    if (speaking('c2_h2', t, 0.05, 0.6)) { st.mood = 'sad'; st.blink = 1; st.armL = hang(g, -1); st.armR = hang(g, 1); } }
  return st; }
function barState(t, L) { const g = G.barista, e = k => ev(L, k), st = { t, talk: talk('barista', t), mood: 'happy', turn: -0.35, look: -0.8, armL: hang(g, -1), armR: hang(g, 1), items: {}, headX: 0, afterTorso: cc => apron(cc, g) };
  if (L === 'hook') { st.turn = -0.2; st.look = -0.5; if (t > hev('panic') - 0.05) { st.mood = 'neutral'; } }
  if (L === 'A1') { st.mood = 'surprised'; if (t > e('rob') - 0.3) { st.mood = 'shock'; st.blink = 0; st.armL = reach(g, -1, -g.sw * 1.2, g.ySh - 330, { planar: true }); st.armR = reach(g, 1, g.sw * 1.2, g.ySh - 330 + Math.sin(t * 30) * 20, { planar: true }); } }
  if (L === 'A2') { st.mood = 'happy'; if (t > e('router') - 0.05) { st.items = { R: routerItem }; st.armR = reach(g, 1, g.sw * 0.5, g.ySh + 140); st.lookY = 0.4; } }
  if (L === 'B1') { st.mood = 'happy'; if (t > e('slip') - 0.05) { st.items = { R: slipItem }; st.armR = reach(g, 1, g.sw * 0.5, g.ySh + 140); st.lookY = 0.4; } }
  if (L === 'B2') { st.mood = 'happy'; if (t > e('net') - 0.05) { st.items = { R: netItem }; st.armR = reach(g, 1, g.sw * 0.5, g.ySh + 140); st.lookY = 0.4; } }
  if (L === 'C1') { st.mood = 'happy'; if (t > e('tea') - 0.05) { st.mood = 'smug'; } }
  if (L === 'C2') { st.mood = 'happy';
    if (t > e('think') - 0.05) { st.mood = 'neutral'; st.blink = 0; st.armR = reach(g, 1, g.hw * 0.5, g.headY + g.hh * 0.8); st.lookY = -0.3; }
    if (speaking('c2_b', t, 0.05, 0.1)) { st.mood = 'happy'; st.lookY = 0; st.armR = hang(g, 1); }
    if (t > e('sign') - 0.3) { st.mood = 'happy'; st.armR = hang(g, 1); st.armL = reach(g, -1, -g.sw * 1.9, g.ySh - 140, { planar: true }); }
    if (speaking('c2_b2', t, 0.05, 0.3)) st.mood = 'smug'; if (t > e('stare')) { st.mood = 'smug'; st.laugh = true; } }
  return st; }

// ---------------- the world + which characters a shot draws (clean singles: only the tagged character)
const DRAW = { wide: ['her', 'barista'], card: ['her', 'barista'], two: ['her', 'barista'], her: ['her'], barista: ['barista'], cover: ['her', 'barista'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGK, BX0, BY0, BW, BH);
  if (who.includes('barista')) heads.barista = K.put(c, BAR, barState(t, L), BX, 0);
  counter(c, t, L);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), HX, 0);
  if (!heads.barista) heads.barista = OFF; if (!heads.her) heads.her = OFFL;
  return heads; }

// ---------------- shots (world coordinates; face of a single at ~900 px)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const hHY = G.her.headY, dHY = G.barista.headY;
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const SH = { COVER: S(20, fy((hHY + dHY) / 2, 0.8, 1120), 0.8, 'cover'), WIDE: S(20, -1000, 0.5, 'wide'), CARD: S(20, fy(dHY, 0.66, 980), 0.66, 'card'), TWO: S(20, fy(dHY, 0.75, 820), 0.75, 'two'),
  HER: S(HX + 40, fy(hHY, 1.0), 1.0, 'her'), HER_R: S(HX + 40, fy(hHY, 1.0, 1120), 1.0, 'her'), HER_CU: S(HX + 30, fy(hHY, 1.6, 960), 1.6, 'her'),
  BAR: S(BX - 20, fy(dHY, 1.0), 1.0, 'barista'), BAR_H: S(BX - 20, fy(dHY, 1.0, 1230), 1.0, 'barista'), HER_H: S(HX + 40, fy(hHY, 1.35, 1280), 1.35, 'her'), BAR_CU: S(BX - 20, fy(dHY, 1.6, 960), 1.6, 'barista'),
  SIGN: U('sign', 1), BLACK: U('black', 2) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  const sp = id => speaking(id, t, 0.1, 0.15);
  if (L === 'hook') { if (t < SP.hook_b.t - 0.12) return SH.COVER; if (t < hev('panic') - 0.05) return f(SH.BAR_H); if (t < SP.hook.t - 0.1) return f(SH.HER_H); return f(SH.COVER); }
  const u = t - sc.s, l = L.toLowerCase(), nar = SP[l + '_nar'];
  if (u < 1.15) return f(SH.WIDE);
  if (L === 'C2' && t > e('black') - 0.03 && t < nar.t + 0.05) return f(SH.BLACK);
  if (nar && t >= nar.t - 0.1) return f(SH.CARD);
  if (L === 'A1' && t > e('rob') - 0.3) return f(SH.WIDE);
  if (L === 'A2' && t > e('router') - 0.05) return f(SH.WIDE);
  if (L === 'B1' && t > e('slip') - 0.05 && !sp('b1_h2')) return f(SH.WIDE);
  if (L === 'B2' && t > e('net') - 0.05 && !sp('b2_h2')) return f(SH.WIDE);
  if (L === 'C1' && t > e('tea') - 0.05 && !sp('c1_h2')) return f(SH.WIDE);
  if (L === 'C2') { if (sp('c2_h')) { const ch = (TL.cfg.chunks || {}).c2_h, p = SP.c2_h, w = p.words || [], cnt = ch.map(([en]) => en.trim().split(/\s+/).length), tot = cnt.reduce((a, b) => a + b, 0); let wi = 0, i = 0;
      ch.forEach((q, k) => { const a = w.length === tot ? p.t + w[wi][1] : p.t + p.d * k / ch.length; if (t >= a - 0.05) i = k; wi += cnt[k]; }); return f([SH.HER, SH.HER_CU, SH.HER, SH.HER_CU][i] || SH.HER); }
    if (t > endOf('c2_h') && t < e('think') + 0.9) return f(SH.WIDE); if (t >= e('think') + 0.9 && t < SP.c2_b.t - 0.1) return f(SH.BAR_CU);
    if (t > e('sign') - 0.05 && t < SP.c2_b2.t - 0.05) return f(SH.SIGN); if (t >= SP.c2_b2.t - 0.05 && t < SP.c2_h2.t - 0.1) return f(SH.WIDE); if (sp('c2_b')) return f(SH.BAR); if (sp('c2_h2')) return f(SH.HER_CU); }
  const cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.1 && t < s.t + s.d + 0.25);
  const single = who => who === 'her' ? SH.HER : SH.BAR;
  if (cur) return f(single(cur.who));
  const next = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.6 && t < s.t);
  if (next) return f(single(next.who));
  return SH.TWO; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- cover badge + frame
function coverBadge(c, t) { const p = 1 + 0.04 * Math.sin(t * 8); c.save(); c.translate(540, 1640); c.scale(p, p); c.rotate(-0.03); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -330 + 6, -62 + 10, 660, 124, 62); c.fill(); c.fillStyle = '#FFE15A'; rr(c, -330, -62, 660, 124, 62); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; rr(c, -330, -62, 660, 124, 62); c.stroke();
  fitTxt(c, 'WI-FI PASSWORD?', 0, 4, 54, '#E0474C', 600); c.restore(); }
function signView(c, t) { const a = ev('C2', 'sign'), k = eBack(clamp((t - a) / 0.3), 1.6), u = t - a; const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, '#2B3040'); g.addColorStop(1, '#171A24'); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 880); c.scale(k * 1.2, k * 1.2); c.rotate(-0.02); signBoard(c, 0, 0); c.strokeStyle = '#FFE15A'; c.lineWidth = 10; c.globalAlpha = 0.55 + 0.45 * Math.sin(u * 12); rr(c, -330, 160, 660, 120, 30); c.stroke(); c.restore();
  if (u > 0.25) { c.save(); c.translate(540, 1500 + Math.sin(u * 8) * 10); c.fillStyle = '#FFE15A'; c.beginPath(); c.moveTo(0, -60); c.lineTo(60, 10); c.lineTo(20, 10); c.lineTo(20, 70); c.lineTo(-20, 70); c.lineTo(-20, 10); c.lineTo(-60, 10); c.closePath(); c.fill(); c.restore(); } }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { K.outro(c, t, { q: ['А КАК БЫ ТЫ СПРОСИЛ', 'ПАРОЛЬ ОТ WI-FI?'], rows: [['A2', "What's the Wi-Fi password?"], ['B1', 'Could I have the Wi-Fi password?'], ['B2', 'Do you have Wi-Fi, by any chance?'], ['C1', "I'd be really grateful if you could…"]], cta: ['ОТПРАВЬ ДРУГУ,', 'КОТОРЫЙ ВЕЧНО БЕЗ ИНТЕРНЕТА'], heroX: 190, heroS: 0.42,
    hero: (cc, tt) => { const g = G.her, gd = G.barista; K.put(cc, BAR, { t: tt, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, armL: reach(gd, -1, -gd.sw * 2.0, gd.ySh - 330 + Math.sin(tt * 8) * 30, { planar: true }), armR: hang(gd, 1), items: { R: routerItem }, afterTorso: c2 => apron(c2, gd) }, 1500, 60);
      K.put(cc, HER, { t: tt, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(tt * 8) * 30, { planar: true }), armR: hang(g, 1), items: {} }, 0, 0); } });
    Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag === 'ui:black') { c.fillStyle = '#000000'; c.fillRect(0, 0, W, HH); UI.watermark(c); return; }
  if (tag.startsWith('ui:')) { c.save(); c.translate(sh.x, sh.y); signView(c, t); c.restore(); heads = { her: OFFL, barista: OFF }; proj = p => p; }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26); }
  const names = { barista: ['BARISTA', '#7A4E2E'] };
  if (L === 'hook') { if (tag === 'cover') coverBadge(c, t);
    const hookProj = p => { const q = proj(p); return q.x < 0 || q.x > W ? { x: q.x < 0 ? 60 : W - 60, y: 1050 } : q; };
    K.bubbles(c, t, { id: 'hook' }, heads, hookProj, { cleanChunks: true, names, hold: { hook_b: 0.05, hook_h: 0.3 } }); K.titleRibbon(c, t, 540, 455); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); UI.captions(c, t);
    Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  const e = k => ev(L, k), narT = (SP[L.toLowerCase() + '_nar'] || { t: 1e9 }).t;
  if (L === 'A1' && t > e('rob') && t < narT - 0.1) K.pop(c, t, 'ОГРАБЛЕНИЕ?!', e('rob') + 0.05, narT - 0.2, 540, 1330, C.gold, -0.06, 80);
  if (L === 'A2' && t > e('router') && t < narT - 0.1) K.pop(c, t, 'РОУТЕР?!', e('router') + 0.05, narT - 0.2, 540, 1330, C.gold, -0.06, 84);
  if (L === 'B1' && t > e('slip') && t < SP.b1_h2.t - 0.05) K.pop(c, t, 'ПАРОЛЬ НА ЧЕКЕ!', e('slip') + 0.05, SP.b1_h2.t - 0.1, 540, 1330, C.gold, -0.06, 70);
  if (L === 'B2' && t > e('net') && t < SP.b2_h2.t - 0.05) K.pop(c, t, 'КАКАЯ СЕТЬ?!', e('net') + 0.05, SP.b2_h2.t - 0.1, 540, 1330, C.gold, -0.06, 80);
  if (L === 'C1' && t > e('tea') && t < SP.c1_h2.t - 0.05) K.pop(c, t, 'СНАЧАЛА ЗАКАЖИ!', e('tea') + 0.05, SP.c1_h2.t - 0.1, 540, 1330, C.gold, -0.06, 72);
  if (L === 'C2') { if (t > e('think') && t < SP.c2_b.t - 0.05) K.dots(c, t, e('think') + 0.05, SP.c2_b.t - 0.05, 1450);
    if (t > e('sign') && t < SP.c2_h2.t - 0.05) { K.pop(c, t, 'ПАРОЛЬ ЗА СПИНОЙ!', e('sign') + 0.1, SP.c2_h2.t - 0.1, 540, 1330, C.gold, -0.06, 68); } }
  K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names, hold: { a1_b: 0.4, b1_h2: 0.05, b1_b: 0.05, b2_b: 0.05, b2_h2: 0.4, c1_b: 0.05, c1_h2: 0.4, c2_b: 0.3, c2_b2: 0.4, c2_h2: 0.6 } });
  K.hud(c, t, sc);
}
E.run('wifi', NF, renderFrame);
