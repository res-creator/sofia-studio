// "He's on his phone all evening" — short TikTok test format (60-75 s, hard_cut): node phone.js start end out.mp4 | --png=f1,f2
// Restaurant set from restaurant.js (the "reggie" station: curtains, mirror, chandelier), phone inserts as in wrongchat.js.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, shade, rgba, paint, rr, items, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/phone/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SC, SP, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf, EV, put } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2, ev = k => EV(k);
const INTRO = 0.6;   // short format: level intro plays at 1.15/0.6 speed

// ---------------- cast & layout (both seated: drawn lower, the table hides the legs)
const HER = BASE.her_restaurant, TOM = BASE.tom;
const G = { her: geom(HER), tom: geom(TOM) };
const FY = 60, SEAT = 330, SY = FY + SEAT, TB = FY - 410, HERX = -330, TOMX = 330;
const herHY = SY + G.her.headY, tomHY = SY + G.tom.headY, TABLE_L = TB - SY;   // table top in the characters' local coords
function txt(c, s, x, y, size, col, font = 'Unb9', align = 'center') { c.font = `${size}px ${font}`; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
const win = (t, a, b, inD = 0.3) => eBack(P(t, a, a + inD), 1.6) * (1 - eIn(P(t, b - 0.22, b)));

// ---------------- restaurant set (station drawing copied from restaurant.js, one station)
const BX0 = -1500, BY0 = -2700, BW = 3000, BH = 3500, BS = 0.5, FLOOR = -380;
function pendant(c, x, y, len, col) { c.strokeStyle = '#4A3A2E'; c.lineWidth = 5; c.beginPath(); c.moveTo(x, -2700); c.lineTo(x, y - len); c.stroke(); paint(c, q => { q.m(x - 90, y); q.l(x + 90, y); q.l(x + 50, y - len * 0.5); q.l(x - 50, y - len * 0.5); q.z(); }, col, { sd: 6, hd: 4 }); c.fillStyle = 'rgba(255,240,170,.7)'; c.beginPath(); c.ellipse(x, y + 4, 70, 12, 0, 0, TAU); c.fill(); }
function farTable(c, x, y, i) { c.fillStyle = '#FFFDF8'; c.fillRect(x - 130, y, 260, 22); c.fillStyle = ['#C2504A', '#3C6FB4', '#2F8A4A'][i % 3]; c.fillRect(x - 110, y + 22, 220, 150); c.fillStyle = '#6A4630'; c.fillRect(x - 8, y + 170, 16, 100);
  for (const s of [-1, 1]) { c.fillStyle = ['#5A4632', '#8A5A6A', '#3A4A5C', '#B0643E'][(i + (s > 0 ? 1 : 0)) % 4]; c.beginPath(); c.arc(x + s * 80, y - 140, 52, 0, TAU); c.fill(); c.fillRect(x + s * 80 - 60, y - 90, 120, 90); } }
function station(c, x0, i) {
  const [a, b] = ['#E5B0B8', '#C98591'], L = x0 - 1500, Wd = 3000;
  const g = c.createLinearGradient(0, -2700, 0, FLOOR); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(L, -2700, Wd, FLOOR + 2700);
  c.fillStyle = shade(b, 0.82); c.fillRect(L, -950, Wd, FLOOR + 950); c.fillStyle = '#FFFDF8'; c.fillRect(L, -962, Wd, 18);
  c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 4; for (let k = 0; k < 16; k++) c.strokeRect(L + 40 + k * 190, -900, 160, 480);
  for (let k = 0; k < 3; k++) farTable(c, L + 450 + k * 1000, -700, i + k);
  for (let k = 0; k < 3; k++) pendant(c, L + 400 + k * 1100 + hash(i * 7 + k) * 200, -1900 + (k % 2) * 140, 420, ['#E0474C', '#F2C14E', '#2F5A48'][(i + k) % 3]);
  c.fillStyle = '#8A1C2E'; c.fillRect(x0 - 760, -2700, 380, 2300); c.fillRect(x0 + 380, -2700, 380, 2300); c.fillStyle = 'rgba(0,0,0,.2)'; for (let k = 0; k < 6; k++) { c.fillRect(x0 - 760 + k * 64, -2700, 20, 2300); c.fillRect(x0 + 380 + k * 64, -2700, 20, 2300); }
  c.fillStyle = '#C9A040'; rr(c, x0 - 260, -2050, 560, 800, 30); c.fill(); const mg = c.createLinearGradient(x0 - 230, -2020, x0 + 270, -1280); mg.addColorStop(0, '#E6F3FA'); mg.addColorStop(1, '#9CC0D8'); c.fillStyle = mg; rr(c, x0 - 230, -2020, 500, 740, 20); c.fill();
  c.strokeStyle = '#C9A040'; c.lineWidth = 10; c.beginPath(); c.moveTo(x0 + 20, -2700); c.lineTo(x0 + 20, -2300); c.stroke(); for (let k = 0; k < 8; k++) { const a2 = k / 8 * TAU; c.strokeStyle = '#C9A040'; c.lineWidth = 6; c.beginPath(); c.moveTo(x0 + 20, -2300); c.lineTo(x0 + 20 + Math.cos(a2) * 190, -2300 + Math.sin(a2) * 60 + 90); c.stroke(); c.fillStyle = 'rgba(255,240,170,.9)'; c.beginPath(); c.arc(x0 + 20 + Math.cos(a2) * 190, -2300 + Math.sin(a2) * 60 + 80, 22, 0, TAU); c.fill(); }
}
function drawRoom(c) {
  c.fillStyle = '#F3E6D0'; c.fillRect(BX0, BY0, BW, BH); station(c, 0, 5);
  const fg = c.createLinearGradient(0, FLOOR, 0, 800); fg.addColorStop(0, '#A8734A'); fg.addColorStop(1, '#8A5A38'); c.fillStyle = fg; c.fillRect(BX0, FLOOR, BW, 800 - FLOOR);
  c.fillStyle = '#6A4630'; c.fillRect(BX0, FLOOR - 14, BW, 24);
  c.strokeStyle = 'rgba(0,0,0,.14)'; c.lineWidth = 3; for (let y = FLOOR + 40; y < 800; y += 60) { c.beginPath(); c.moveTo(BX0, y); c.lineTo(BX0 + BW, y); c.stroke(); }
}
const BGS = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); { const c = BGS.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); drawRoom(c); }
const BGB = createCanvas(BGS.width, BGS.height); { const c = BGB.getContext('2d'); c.filter = 'blur(2.5px)'; c.drawImage(BGS, 0, 0); }

// ---------------- props
const phoneItem = (lit = '#9FD3FF', s = 1, caseCol = '#2B2F3A') => ctx => { ctx.save(); ctx.scale(s, s); ctx.fillStyle = caseCol; rr(ctx, -30, -118, 60, 112, 10); ctx.fill(); ctx.fillStyle = lit; rr(ctx, -24, -110, 48, 92, 6); ctx.fill(); ctx.restore(); };
function table(c) { const L = -640, R = 640, top = TB;
  paint(c, q => { q.m(L - 24, top); q.l(R + 24, top); q.l(R + 40, top + 90); q.l(L - 40, top + 90); q.z(); }, '#FFFDF8', { sd: 8, hd: 5, lw: 4 });
  c.fillStyle = '#E0474C'; c.fillRect(L - 36, top + 62, R - L + 72, 28);
  paint(c, q => { q.m(L - 40, top + 90); q.l(R + 40, top + 90); q.l(R + 60, 900); q.l(L - 60, 900); q.z(); }, '#F6F0E6', { sd: 12, hd: 6, lw: 4, inner: k => { k.fillStyle = 'rgba(224,71,76,.35)'; for (let ix = 0; ix < 30; ix++) for (let iy = 0; iy < 14; iy++) if ((ix + iy) % 2 === 0) k.fillRect(L - 60 + ix * 46, top + 90 + iy * 46, 46, 46); } }); }
function candle(c, x, y, t) { c.save(); c.translate(x, y); paint(c, q => { q.m(-16, -130); q.l(16, -130); q.l(16, 0); q.l(-16, 0); q.z(); }, '#FFF6E0', { sd: 3, hd: 2, lw: 3 }); paint(c, q => q.e(0, 0, 40, 10), '#C9A040', { sd: 3, hd: 2, lw: 3 });
  const f = 1 + 0.12 * Math.sin(t * 17) + 0.06 * Math.sin(t * 29); const gl = c.createRadialGradient(0, -160, 4, 0, -160, 120); gl.addColorStop(0, 'rgba(255,214,120,.55)'); gl.addColorStop(1, 'rgba(255,214,120,0)'); c.fillStyle = gl; c.beginPath(); c.arc(0, -160, 120, 0, TAU); c.fill();
  c.fillStyle = '#FFB347'; c.beginPath(); c.moveTo(0, -190 * f + 25); c.quadraticCurveTo(14, -150, 0, -136); c.quadraticCurveTo(-14, -150, 0, -190 * f + 25); c.fill(); c.restore(); }
function rose(c, x, y) { c.save(); c.translate(x, y); paint(c, q => { q.m(-30, -110); q.l(30, -110); q.l(22, 0); q.l(-22, 0); q.z(); }, '#CFE6EE', { sd: 3, hd: 2, lw: 3 }); c.strokeStyle = '#3C8A4A'; c.lineWidth = 6; c.beginPath(); c.moveTo(0, -100); c.lineTo(4, -200); c.stroke(); c.fillStyle = '#E0474C'; c.beginPath(); c.arc(4, -214, 26, 0, TAU); c.fill(); c.strokeStyle = '#A8202A'; c.lineWidth = 3; c.beginPath(); c.arc(4, -214, 13, 0.5, 5); c.stroke(); c.restore(); }
function glass(c, x, y) { c.save(); c.translate(x, y); c.translate(0, -30); items.wine(0.55)(c, 0); c.restore(); }
function plate(c, x, y) { paint(c, q => q.e(x, y - 12, 150, 26), '#FFFDF8', { sd: 8, hd: 5, lw: 4 }); c.fillStyle = 'rgba(0,0,0,.08)'; c.beginPath(); c.ellipse(x, y - 14, 105, 15, 0, 0, TAU); c.fill(); }
// the phone lying face down on the table (C1); vib = 0..1 shake
function phoneDown(c, x, y, t, vib) { c.save(); c.translate(x + (vib > 0 ? Math.sin(t * 90) * 7 * vib : 0), y); paint(c, q => { q.m(-80, -22); q.l(80, -22); q.l(70, 0); q.l(-70, 0); q.z(); }, '#2B2F3A', { sd: 3, hd: 2, lw: 3 });
  if (vib > 0) { c.strokeStyle = rgba('#2B2F3A', 0.7 * vib); c.lineWidth = 6; c.lineCap = 'round'; for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(s * 100, -14, 20 + k * 20, s > 0 ? -0.7 : Math.PI - 0.7, s > 0 ? 0.7 : Math.PI + 0.7); c.stroke(); }
    c.fillStyle = rgba('#9FD3FF', 0.5 * vib * (0.5 + 0.5 * Math.sin(t * 20))); c.beginPath(); c.ellipse(0, 2, 110, 16, 0, 0, TAU); c.fill(); }
  c.restore(); }
function hearts(c, x, y, t, t0, k) { if (k <= 0) return; for (let i = 0; i < 6; i++) { const ph = ((t - t0) * 0.7 + i / 6) % 1, hx = x + Math.sin(i * 2.1 + t * 2) * 90 + (i - 2.5) * 30, hy = y - ph * 380; c.save(); c.globalAlpha = k * (1 - ph) * clamp(ph * 6); c.translate(hx, hy); c.scale(1.4 - ph * 0.4, 1.4 - ph * 0.4); heart(c, 0, 0, 22, C.pink); c.restore(); } }
function heart(c, x, y, r, col) { c.fillStyle = col; c.beginPath(); c.moveTo(x, y + r * 0.9); c.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.8, y - r * 1.4, x, y - r * 0.5); c.bezierCurveTo(x + r * 0.8, y - r * 1.4, x + r * 1.6, y - r * 0.2, x, y + r * 0.9); c.fill(); }
function crown(c, x, y, s, col = C.gold) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.beginPath(); c.moveTo(-20, 10); c.lineTo(-22, -12); c.lineTo(-10, -2); c.lineTo(0, -16); c.lineTo(10, -2); c.lineTo(22, -12); c.lineTo(20, 10); c.closePath(); c.fill(); c.restore(); }
// phone light on his face
function glow(c, hd, k) { if (k <= 0) return; c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(hd.x - 10, hd.y + hd.hh * 0.25, 10, hd.x - 10, hd.y + hd.hh * 0.25, hd.hh * 1.5); g.addColorStop(0, `rgba(90,170,255,${0.16 * k})`); g.addColorStop(1, 'rgba(90,170,255,0)'); c.fillStyle = g; c.beginPath(); c.arc(hd.x - 10, hd.y + hd.hh * 0.25, hd.hh * 1.5, 0, TAU); c.fill(); c.restore(); }

// ---------------- characters
const onTable = (g, side, dx) => reach(g, side, dx, TABLE_L - 20);
function gest(st, g, who, t, side, base) { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } }
// does Tom hold a lit phone right now? (used for the glow and his pose)
function tomPhone(t, L) {
  if (L === 'A1') return t < ev('hand') - 0.1;
  if (L === 'B1') return t < ev('pocket') - 0.1 || t > ev('second') - 0.1;
  if (L === 'C1') return t < ev('down') - 0.2;
  return L !== 'outro';
}
function herState(t, L) { const g = G.her, st = { t, talk: talk('her', t), mood: 'neutral', turn: 0.35, look: 0.8, armL: onTable(g, -1, -g.sw * 0.9), armR: onTable(g, 1, g.sw * 1.1) };
  gest(st, g, 'her', t, 1, 230);
  if (L === 'hook') { const u = t * 5; st.talk = 0.35 + 0.35 * Math.abs(Math.sin(t * 11)) * (Math.sin(t * 3) > -0.6 ? 1 : 0.1); st.mood = 'happy';   // she tells a story, nobody listens
    st.armR = reach(g, 1, g.sw * 1.6 + Math.sin(u) * 40, g.ySh + 180 + Math.cos(u * 0.8) * 50); st.armL = reach(g, -1, -g.sw * 1.3 - Math.sin(u * 0.7) * 30, g.ySh + 230); }
  if (L === 'A1') { st.mood = speaking('a1_her', t, 0.1) ? 'annoyed' : 'neutral'; if (speaking('a1_her', t, 0.05)) st.armR = reach(g, 1, g.sw * 2.6, g.ySh + 200 + Math.sin(t * 9) * 20);
    const h = ev('hand'); if (t > h + 0.35) { st.mood = 'shock'; st.armR = reach(g, 1, g.sw * 1.3, g.ySh + 120); st.items = { R: phoneItem() }; st.lookY = 0.35; st.look = 0.4; } if (t > h + 1.3) st.mood = 'skeptical'; }
  if (L === 'A2') { st.mood = speaking('a2_her', t, 0.1) ? 'annoyed' : 'skeptical'; if (t > SP.a2_x.t + 0.5) st.mood = 'tired'; }
  if (L === 'B1') { st.mood = 'neutral'; if (t > ev('pocket')) st.mood = 'happy'; if (t > ev('second') + 0.15) { st.mood = 'shock'; } if (t > ev('second') + 0.9) st.mood = 'annoyed'; }
  if (L === 'B2') { st.mood = speaking('b2_her', t, 0.1) ? 'sad' : 'skeptical'; if (t > ev('cats')) st.mood = 'annoyed'; }
  if (L === 'C1') { st.mood = 'neutral'; if (speaking('c1_her', t, 0.1)) { st.mood = 'happy'; st.armR = reach(g, 1, g.sw * 0.4, g.ySh + 140); }
    const d = ev('down'), m = ev('melt'), v = ev('vibe'); if (t > d) st.mood = 'surprised'; if (t > m) { st.mood = 'happy'; st.squint = true; st.armL = reach(g, -1, -g.sw * 0.2, g.headY + 220); st.armR = reach(g, 1, g.sw * 0.25, g.headY + 230); st.tilt = -0.06; }
    if (t > v) { st.mood = 'shock'; st.squint = false; st.tilt = 0; st.lookY = 0.55; st.look = 0.5; st.armL = onTable(g, -1, -g.sw * 0.9); st.armR = onTable(g, 1, g.sw * 1.1); } if (t > v + 0.8) { st.mood = 'annoyed'; st.lookY = 0; st.look = 0.8; } }
  if (L === 'C2') { const sp = speaking('c2_her', t, 0.1); st.mood = sp ? 'smug' : 'neutral'; if (sp) { st.tilt = -0.03; st.armR = reach(g, 1, g.sw * 1.7 + Math.sin(t * 2.4) * 40, g.ySh + 160 + Math.cos(t * 2.4) * 30); st.items = { R: items.wine(0.6) }; }
    const tu = ev('turn'), hr = ev('hair'); if (t > tu) { st.mood = 'surprised'; st.lookY = 0.2; } if (t > hr) { st.mood = 'happy'; st.turn = 0; st.look = 0; st.lookY = 0; st.armL = reach(g, -1, -g.sw * 0.55, g.headY - 40); }
    if (t > SP.c2_nar.t) { st.mood = 'smug'; st.armL = onTable(g, -1, -g.sw * 0.9); } }
  return st; }
function tomState(t, L) { const g = G.tom, st = { t, talk: talk('tom', t), mood: 'neutral', turn: -0.35, look: -0.3, lookY: 0.65, armL: onTable(g, -1, -g.sw * 1.1), armR: onTable(g, 1, g.sw * 0.9) };
  const holding = () => { const s = Math.sin(t * 7) * 6; st.armR = reach(g, 1, -g.sw * 0.15, g.ySh + 300 + s); st.armL = reach(g, -1, -g.sw * 0.55, g.ySh + 330); st.items = { R: phoneItem() }; };
  if (tomPhone(t, L)) holding();
  if (L === 'hook') st.mood = 'bored';
  if (L === 'A1') { const h = ev('hand'); if (t > h - 0.4 && t < h + 0.45) { const k = eIO(P(t, h - 0.4, h + 0.1)); st.armL = reach(g, -1, lerp(-g.sw * 0.6, -g.sw * 2.7, k), g.ySh + lerp(300, 200, k)); st.items = { L: phoneItem() }; st.armR = onTable(g, 1, g.sw * 0.9); }
    if (t > h + 0.45) { st.armL = reach(g, -1, -g.sw * 0.5, g.ySh + 320); st.armR = reach(g, 1, -g.sw * 0.1, g.ySh + 310); st.mood = 'neutral'; } }   // he keeps staring at his empty hands
  if (L === 'A2') { if (speaking('a2_x', t, 0.15, 0.3)) { st.lookY = 0; st.look = -0.8; st.mood = 'smug'; } const s0 = ev('sit'); if (t > s0 - 0.1 && t < s0 + 0.7) { st.lookY = 0.1; st.look = -0.6; st.mood = 'happy'; st.armL = reach(g, -1, -g.sw * 1.25, g.ySh + 520); } }
  if (L === 'B1') { const p = ev('pocket'), s = ev('second');
    if (t > p - 0.15 && t < s - 0.1) { const k = eIO(P(t, p - 0.15, p + 0.25)); st.armR = reach(g, 1, lerp(-g.sw * 0.15, g.sw * 1.05, k), g.ySh + lerp(300, 560, k)); st.items = k < 0.8 ? { R: phoneItem() } : {}; st.armL = onTable(g, -1, -g.sw * 1.1); if (t > p + 0.25) { st.lookY = 0; st.look = -0.8; st.mood = 'happy'; } }
    if (t > s - 0.1 && t < s + 0.35) { const k = eOut(P(t, s - 0.1, s + 0.3)); st.armL = reach(g, -1, lerp(-g.sw * 1.0, -g.sw * 0.55, k), g.ySh + lerp(560, 330, k)); st.armR = reach(g, 1, -g.sw * 0.15, g.ySh + 300); st.items = { R: phoneItem(), L: phoneItem('#FFE7A8', 1, '#EE5E9A') }; }
    if (t > s + 0.35) { st.items = { R: phoneItem(), L: phoneItem('#FFE7A8', 1, '#EE5E9A') }; st.armL = reach(g, -1, -g.sw * 0.75, g.ySh + 300 + Math.sin(t * 6) * 6); st.mood = 'happy'; } }
  if (L === 'B2') { if (t > SP.b2_x.t - 0.1) st.mood = 'happy'; if (t > endOf('b2_x')) st.laugh = true; }
  if (L === 'C1') { const d = ev('down'), v = ev('vibe');
    if (t > d - 0.2 && t < d + 0.15) { st.armR = reach(g, 1, -g.sw * 0.5, TABLE_L - 40); st.items = { R: phoneItem('#2B2F3A') }; }
    if (t > d + 0.15) { st.armR = onTable(g, 1, g.sw * 0.9); st.lookY = 0; st.look = -0.8; st.mood = 'happy'; }
    if (t > v) { st.lookY = 0.6; st.look = -0.2; st.mood = 'worried'; } if (t > v + 0.5) { st.armR = reach(g, 1, -g.sw * 0.6, TABLE_L - 30); st.mood = 'happy'; } }
  if (L === 'C2') { const tu = ev('turn'); st.mood = speaking('c2_her', t) ? 'bored' : 'neutral';
    if (t > endOf('c2_her') + 0.4) { st.lookY = 0.2; st.look = -0.6; }
    if (t > tu - 0.3) { const k = eIO(P(t, tu - 0.3, tu + 0.3)); st.armR = reach(g, 1, lerp(-g.sw * 0.15, -g.sw * 1.6, k), g.ySh + lerp(300, 180, k)); st.items = { R: phoneItem('#FF5A6E', 1.25) }; st.mood = 'happy'; st.lookY = 0; st.look = -0.8; } }
  return st; }

// ---------------- world
const headOf = (who, x) => ({ x, y: SY + G[who].headY, hh: G[who].hh });
function world(c, t, L, solo) {
  c.drawImage(BGB, BX0, BY0, BW, BH); const heads = {};
  heads.tom = solo === 'her' ? headOf('tom', TOMX) : put(c, TOM, tomState(t, L), TOMX, SY);
  heads.her = solo === 'tom' ? headOf('her', HERX) : put(c, HER, herState(t, L), HERX, SY);
  if (solo !== 'her' && tomPhone(t, L)) glow(c, heads.tom, 1);
  table(c); plate(c, HERX + 60, TB + 40); plate(c, TOMX - 60, TB + 40); glass(c, -120, TB + 30); glass(c, 160, TB + 30); candle(c, 20, TB + 34, t); rose(c, -30 + 240, TB + 36);
  if (L === 'C1' && t > ev('down') + 0.15) { const v = ev('vibe'), vib = t > v && t < v + 1.0 ? 1 : 0; phoneDown(c, TOMX - 190, TB + 30, t, vib); K.mark(c, 'phone', TOMX - 190, TB, 120); }
  if (L === 'C1' && solo !== 'tom') hearts(c, heads.her.x + 20, heads.her.y - heads.her.hh * 1.1, t, ev('melt'), (t > ev('melt') ? 1 : 0) * (1 - P(t, ev('vibe'), ev('vibe') + 0.2)));
  return heads;
}

// ---------------- camera (hard_cut: still shots, instant cuts)
// WIDE = both at the table; CARD = both faces under the lesson card; HER / TOM = clean singles (face ~y 900); *_R = reaction singles.
const SH = { WIDE: { x: 0, y: -700, z: 0.8, r: 0 }, CARD: { x: 0, y: -1218, z: 0.82, r: 0 }, HOOK: { x: 0, y: -975, z: 0.8, r: 0 },
  HER: { x: HERX + 120, y: herHY + 60, z: 1.0, r: 0, tag: 'her' }, TOM: { x: TOMX - 120, y: tomHY + 60, z: 0.98, r: 0, tag: 'tom' },
  HER_R: { x: HERX + 60, y: herHY - 135, z: 1.05, r: 0, tag: 'her' }, TOM_R: { x: TOMX - 60, y: tomHY - 140, z: 1.0, r: 0, tag: 'tom' },
  HER_CAM: { x: HERX + 20, y: herHY + 110, z: 1.15, r: 0, tag: 'her' } };
function chunkT(id, i) { const ch = TL.cfg.chunks[id], sp = SP[id], n = ch.slice(0, i).reduce((a, [en]) => a + en.trim().split(/\s+/).length, 0); return sp.words && sp.words[n] ? sp.t + sp.words[n][1] : sp.t + sp.d * i / ch.length; }
function shotFor(t) { const sc = sceneAt(t), L = sc.id; if (L === 'outro') return SH.WIDE; if (L === 'hook') return SH.HOOK;
  const u = t - sc.s; if (u < INTRO) return { ...SH.WIDE, force: true };
  const l = L.toLowerCase(), nar = SP[l + '_nar'], f = s => ({ ...s, force: true });
  if (nar && t >= nar.t - 0.1) return f(SH.CARD);
  if (L === 'A1' && t > ev('hand') - 0.5) return f(SH.WIDE);                                  // the hand-over needs both of them
  if (L === 'A2' && t > ev('sit') - 0.15) return f(SH.WIDE);
  if (L === 'B1' && t > ev('pocket') - 0.3) return f(SH.WIDE);                                // pocket -> second phone
  if (L === 'B2' && t > endOf('b2_x') + 0.1) return f(SH.TOM_R);                              // (under the cat video insert)
  if (L === 'C1' && t > ev('down') - 0.3) return f(SH.WIDE);                                  // phone face down, she melts, it buzzes
  if (L === 'C2') { const tu = ev('turn');
    if (speaking('c2_her', t, 0.1, 0.25)) { if (t > chunkT('c2_her', 1) - 0.1 && t < chunkT('c2_her', 2) - 0.1) return f(SH.TOM_R); return f(SH.HER); }   // he scrolls while she goes on
    if (t < tu - 0.35) return f(SH.WIDE);                                                     // the silence: both, still
    if (t < ev('hair') - 0.05) return f(SH.TOM);                                              // he turns the phone (then the stream insert)
    return f(SH.HER_CAM); }                                                                   // she plays to the stream camera
  const cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.1 && t < s.t + s.d + 0.25);
  if (cur) return f(cur.who === 'her' ? SH.HER : SH.TOM);
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotFor, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, cam.tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- phone inserts
const PH = { x: 540, y: 1080, s: 1.2 }, ZM = 1.3;
const zoom = fn => (c, w, h) => { c.save(); c.scale(ZM, ZM); fn(c, w / ZM, h / ZM); c.restore(); };
function backdrop(c, k) { c.save(); c.globalAlpha = clamp(k * 4); const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, '#3B3550'); g.addColorStop(1, '#1F1B2C'); c.fillStyle = g; c.fillRect(0, 0, W, HH); c.restore(); }
function insert(c, k, screen) { if (k <= 0) return; backdrop(c, k); const s = PH.s * lerp(0.6, 1, k); c.save(); c.globalAlpha = clamp(k * 2); K.phone(c, PH.x, PH.y + (1 - k) * 260, s, zoom(screen)); c.restore(); }
function banner(c, k, en, col, ru, y = 1515) { if (k <= 0) return; c.save(); c.translate(540, y); c.rotate(-0.025); c.scale(k, k); const hh = ru ? 132 : 112;
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -480 + 8, -hh / 2 + 10, 960, hh, 26); c.fill(); c.fillStyle = col; rr(c, -480, -hh / 2, 960, hh, 26); c.fill(); c.strokeStyle = C.white; c.lineWidth = 6; rr(c, -480, -hh / 2, 960, hh, 26); c.stroke();
  UI.textFit(c, 'Unb9', 54, en, 880); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(en, 0, ru ? -18 : 2); if (ru) fitTxt(c, ru, 0, 38, 30, '#FFFFFF', 900, 'Nun9'); c.restore(); }
function laughFace(c, x, y, r) { c.fillStyle = '#F7C948'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.strokeStyle = '#B8860B'; c.lineWidth = 2; c.stroke(); c.strokeStyle = '#5A3A10'; c.lineWidth = r * 0.12; c.beginPath(); c.arc(x - r * 0.35, y - r * 0.15, r * 0.2, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); c.beginPath(); c.arc(x + r * 0.35, y - r * 0.15, r * 0.2, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); c.fillStyle = '#5A3A10'; c.beginPath(); c.moveTo(x - r * 0.55, y + r * 0.1); c.quadraticCurveTo(x, y + r * 0.9, x + r * 0.55, y + r * 0.1); c.fill(); c.fillStyle = '#5FB0E8'; c.beginPath(); c.ellipse(x - r * 0.85, y + r * 0.05, r * 0.14, r * 0.25, 0, 0, TAU); c.ellipse(x + r * 0.85, y + r * 0.05, r * 0.14, r * 0.25, 0, 0, TAU); c.fill(); }
// a cartoon cat sliding off a shelf, looped (the "cats falling" video)
function catVideo(c, x, y, w, h, u) { c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.fillStyle = '#F2D9B8'; c.fillRect(x, y, w, h); c.fillStyle = '#8A5A38'; c.fillRect(x, y + h * 0.42, w * 0.62, 14);
  const ph = (u * 0.8) % 1, slip = eIn(P(ph, 0.25, 0.55)), fall = P(ph, 0.55, 0.9), cx = x + w * 0.3 + slip * w * 0.32 + fall * 30, cy = y + h * 0.42 - 2 + eIn(fall) * h * 0.55, rot = slip * 0.6 + fall * 2.4;
  c.save(); c.translate(cx, cy); c.rotate(rot); c.fillStyle = '#E8A05A'; c.beginPath(); c.ellipse(0, -30, 46, 30, 0, 0, TAU); c.fill(); c.beginPath(); c.arc(38, -58, 24, 0, TAU); c.fill();
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(38 + s * 18, -72); c.lineTo(38 + s * 12, -96); c.lineTo(38 + s * 2, -78); c.fill(); }
  c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(32, -60, 4, 0, TAU); c.arc(46, -60, 4, 0, TAU); c.fill(); c.strokeStyle = '#E8A05A'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(-44, -30); c.quadraticCurveTo(-80, -70 - fall * 20, -60, -100); c.stroke(); c.restore();
  if (fall > 0.9 || ph < 0.1) { c.fillStyle = 'rgba(255,255,255,.9)'; c.font = '40px Unb9'; c.textAlign = 'center'; c.fillText('BOING!', x + w * 0.62, y + h * 0.8); }
  c.restore(); }
function catScreen(t, t0) { return (c, w, h) => { const u = t - t0; c.fillStyle = '#111318'; c.fillRect(0, 0, w, h); catVideo(c, 0, 90, w, 230, u);
  c.fillStyle = '#E0474C'; c.fillRect(0, 316, w * (0.35 + u * 0.05), 5); txt(c, 'CATS FALLING', 16, 352, 24, '#FFFFFF', 'Unb9', 'left'); txt(c, 'compilation #47 · 12M views', 16, 384, 17, '#9AA3B2', 'Nun8', 'left'); laughFace(c, w - 36, 360, 20);
  for (let i = 0; i < 3; i++) { c.fillStyle = '#2A2E38'; rr(c, 12, 416 + i * 96, 120, 80, 10); c.fill(); catVideo(c, 12, 416 + i * 96, 120, 80, u + i * 0.37); c.fillStyle = '#C9CED6'; rr(c, 146, 432 + i * 96, 150, 14, 7); c.fill(); c.fillStyle = '#5A606C'; rr(c, 146, 458 + i * 96, 100, 12, 6); c.fill(); }
  c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, w, 76); txt(c, '▶', 24, 40, 26, '#E0474C', 'Nun9', 'left'); txt(c, 'MeTube', 56, 40, 24, '#2B2F3A', 'Unb9', 'left'); }; }
// live stream: she is on his phone camera, chat flies
const CHAT = [['anna_k', 'C2 QUEEN', true], ['mark77', 'ОНА ГЕНИЙ'], ['lili', 'БРОСАЙ ЕГО'], ['dima', 'remarkable!!'], ['kate.s', 'C2 QUEEN', true], ['bob', 'ЛЕГЕНДА'], ['zoe', 'ОНА ГЕНИЙ'], ['max', 'БРОСАЙ ЕГО'], ['ira', 'commune?! ахах'], ['tim', 'C2 QUEEN', true]];
function chatFeed(c, x, y, w, t, t0, rows = 5, sz = 21) { const n = Math.max(0, Math.floor((t - t0) * 4.5)); for (let i = 0; i < rows; i++) { const j = n - i; if (j < 0) continue; const [nm, msg, cr] = CHAT[j % CHAT.length], yy = y - i * (sz * 1.9), k = i === 0 ? eOut(P(t, t0 + j / 4.5, t0 + j / 4.5 + 0.15)) : 1;
  c.save(); c.globalAlpha = k * (1 - i / (rows + 1)); c.font = `${sz}px Nun9`; const nw = c.measureText(nm + ' ').width, mw = c.measureText(msg).width; c.fillStyle = 'rgba(0,0,0,.45)'; rr(c, x - 8, yy - sz * 0.8, nw + mw + (cr ? sz * 1.6 : 0) + 22, sz * 1.6, sz * 0.8); c.fill();
  txt(c, nm, x + 4, yy, sz, '#FFD36A', 'Nun9', 'left'); txt(c, msg, x + 4 + nw, yy, sz, '#FFFFFF', 'Nun9', 'left'); if (cr) crown(c, x + 4 + nw + mw + sz * 0.8, yy, sz / 22); c.restore(); } }
function liveBadge(c, x, y, s, t) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#E0274C'; rr(c, 0, -20, 92, 40, 10); c.fill(); txt(c, 'LIVE', 46, 1, 24, '#FFFFFF', 'Unb9'); c.fillStyle = 'rgba(0,0,0,.5)'; rr(c, 100, -20, 150, 40, 10); c.fill();
  c.strokeStyle = '#FFFFFF'; c.lineWidth = 3; c.beginPath(); c.ellipse(124, 0, 13, 8, 0, 0, TAU); c.stroke(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(124, 0, 4, 0, TAU); c.fill(); txt(c, '12 400', 146, 1, 22, '#FFFFFF', 'Unb9', 'left'); c.restore(); }
function liveScreen(t, t0) { return (c, w, h) => { c.fillStyle = '#E5B0B8'; c.fillRect(0, 0, w, h); c.fillStyle = '#8A1C2E'; c.fillRect(0, 0, 50, h); c.fillRect(w - 50, 0, 50, h);
  const g = G.her; put(c, HER, { t, talk: 0, mood: 'surprised', turn: 0, look: 0, lookY: 0, armL: reach(g, -1, -g.sw * 0.9, g.ySh + 330), armR: reach(g, 1, g.sw * 0.9, g.ySh + 330) }, w / 2, h + 700, 0.75);
  liveBadge(c, 14, 40, 0.9, t); chatFeed(c, 14, h - 40, w - 30, t, t0, 6, 19);
  for (let i = 0; i < 5; i++) { const ph = ((t - t0) * 0.9 + i / 5) % 1; c.save(); c.globalAlpha = (1 - ph); heart(c, w - 40 + Math.sin(i * 3 + t * 3) * 14, h - 120 - ph * 260, 12, ['#EE5E9A', '#E0474C', '#F2C14E'][i % 3]); c.restore(); } }; }
function overlays(c, t, L, cam) {
  if (L === 'B2') { const a = ev('cats'), k = win(t, a - 0.05, SP.b2_nar.t - 0.1); insert(c, k, catScreen(t, a)); banner(c, k * eBack(P(t, a + 0.3, a + 0.6), 2), 'КОТИКИ ПАДАЮТ', '#E27D3C', 'вот что ему интереснее'); }
  if (L === 'C2') { const tu = ev('turn'), k = win(t, tu + 0.15, ev('hair') - 0.05); insert(c, k, liveScreen(t, tu)); banner(c, k * eBack(P(t, tu + 0.45, tu + 0.75), 2), 'ПРЯМОЙ ЭФИР · 12 400', '#E0274C', 'всё свидание — в эфире');
    if (t > ev('hair') - 0.05 && t < SP.c2_nar.t - 0.1 && cam.tag === 'her') {   // seen through his phone camera
      c.save(); c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 8; const m = 70, L2 = 70; for (const [x, y, sx, sy] of [[m, 330, 1, 1], [W - m, 330, -1, 1], [m, 1560, 1, -1], [W - m, 1560, -1, -1]]) { c.beginPath(); c.moveTo(x, y + sy * L2); c.lineTo(x, y); c.lineTo(x + sx * L2, y); c.stroke(); } c.restore();
      liveBadge(c, 100, 380, 1.3, t); chatFeed(c, 600, 1540, 380, t, ev('hair') - 0.6, 6, 26); } }
}

// ---------------- hook & frame
function hookBubble(c, x, y, t) { c.save(); c.translate(x, y); const k = 1 + 0.03 * Math.sin(t * 8); c.scale(k, k); c.fillStyle = 'rgba(0,0,0,.15)'; rr(c, -110 + 6, -56 + 8, 220, 112, 56); c.fill(); c.fillStyle = C.white; rr(c, -110, -56, 220, 112, 56); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; rr(c, -110, -56, 220, 112, 56); c.stroke();
  c.beginPath(); c.moveTo(-20, 52); c.lineTo(-58, 96); c.lineTo(10, 54); c.fillStyle = C.white; c.fill(); for (let i = 0; i < 3; i++) { const a = 0.5 + 0.5 * Math.sin(t * 10 - i * 1.1); c.fillStyle = rgba(C.oliveD, 0.35 + 0.65 * a); c.beginPath(); c.arc(-50 + i * 50, -2 - a * 8, 15, 0, TAU); c.fill(); } c.restore(); }
function drawHook(c, t) { const cam = CAM[Math.min(CAM.length - 1, Math.round(t * FPS))], { heads, M } = drawWorld(c, t, 'hook', cam);
  const proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }), hb = proj({ x: heads.her.x + 30, y: heads.her.y - heads.her.hh * 1.5 });
  Hq.vignette(c, W, HH, 0.3); hookBubble(c, hb.x + 40, hb.y, t);
  // swipe marks next to his phone
  const ph = proj({ x: TOMX - G.tom.sw * 0.15, y: SY + G.tom.ySh + 200 }); for (let i = 0; i < 3; i++) { const u = ((t * 2.6) + i / 3) % 1; c.save(); c.globalAlpha = (1 - u) * 0.8; c.strokeStyle = '#9FD3FF'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(ph.x + 110, ph.y + 40 - u * 110); c.lineTo(ph.x + 110, ph.y - 20 - u * 110); c.stroke(); c.restore(); }
  K.titleRibbon(c, t, 540, 455); UI.watermark(c); }
function fastIntro(c, t, sc) { if (!['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(sc.id)) return; UI.levelIntro(c, sc.s + (t - sc.s) * 1.15 / INTRO, sc); }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t);
  if (sc.id === 'hook') { drawHook(c, t); Hq.grain(c, W, HH, t, 0.045); UI.levelIntroNext(c, t); return; }
  if (sc.id === 'outro') { K.outro(c, t, { q: ['ТЕЛЕФОН НА СВИДАНИИ', 'ИЛИ СТРИМ БЕЗ СПРОСА?'], qSize: 50, rows: [['B1', 'Could you put your phone away?'], ['B2', 'Am I boring you?'], ['C1', "I'd appreciate it if…"]], cta: ['ОТПРАВЬ ТОМУ, КТО', 'ВЕСЬ ВЕЧЕР В ТЕЛЕФОНЕ'],
      hero: (cc, tt) => put(cc, HER, { t: tt, mood: 'happy', turn: 0, look: 0, armL: reach(G.her, -1, -G.her.sw * 1.5 + Math.sin(tt * 8) * 40, G.her.headY - 200), armR: reach(G.her, 1, G.her.sw * 1.0, G.her.ySh + 300) }, 0, 0) });
    const u = t - SC.outro.s, q = eBack(P(u, 0.15, 0.5), 2.2); if (q > 0) { c.save(); c.translate(540, 175); c.scale(q, q); UI.font(c, 'Unb9', 58); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, 'ЧТО ХУЖЕ?', 0, 0, C.pink, C.white, 14); c.restore(); }
    Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const f = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[f], sh = shake(t);
  const { heads, M } = drawWorld(c, t, sc.id, cam, sh); Hq.vignette(c, W, HH, 0.26);
  const proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f });
  overlays(c, t, sc.id, cam);
  K.bubbles(c, t, sc, heads, proj, { names: { tom: ['TOM', '#3C6FB4'] }, hold: { c2_her: 0.25, b2_x: 0.1 } });
  if (sc.id === 'A1') K.pop(c, t, 'ОН ДУМАЕТ, ТЫ ОФИЦИАНТКА', ev('hand') + 0.5, SP.a1_nar.t - 0.15, 540, 1400, C.white, -0.05, 40);
  if (sc.id === 'B1') K.pop(c, t, 'ТЕЛЕФОН №2', ev('second') + 0.15, SP.b1_nar.t - 0.15, 540, 1420, C.gold, -0.06, 90);
  if (sc.id === 'C1') K.pop(c, t, 'БЖЖЖ!', ev('vibe') + 0.05, SP.c1_nar.t - 0.15, 700, 1380, C.gold, 0.08, 96);
  if (sc.id === 'C2') K.dots(c, t, endOf('c2_her') + 0.3, ev('turn') - 0.45);
  UI.card(c, t, sc); UI.captions(c, t); UI.sparkles(c, t); Hq.grain(c, W, HH, t, 0.04); UI.levelBar(c, t, sc, 1); UI.watermark(c); fastIntro(c, t, sc); UI.levelIntroNext(c, t);
}
E.run('phone', NF, renderFrame);
