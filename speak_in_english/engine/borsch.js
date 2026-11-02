// "Mother-in-law tastes your borscht" renderer (hard_cut camera): node borsch.js start end out.mp4 | node borsch.js 0 0 --png=f1,f2
// Hook like the channel's hits ("named after the ex", "boring date"): pink striped card, one giant prop (the bowl), small characters, title, stamp.
// Dining room: the heroine stands with the pot, Margot (the posh British lady from «Соседи») sits at the table with her huge handbag, the husband (Tom)
// silently eats in the background and his plates pile up. Running gags: the red stain on the white tablecloth (A1 on), ЛОЖКИ counter (1 -> 3),
// the handbag (C2: a three-litre jar comes out of it — she came for the borscht all along).
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/borsch/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C, LVCOL, LVNAME } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const LVS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- cast
const HER = { ...BASE.her_lift, top: { type: 'longsleeve', col: '#EE5E9A' }, bottom: { type: 'jeans', col: '#4A5A7A' }, shoes: { col: '#F4EFE6', acc: '#C98B5A' } };
const MRG = { ...BASE.margot }, TOM = { ...BASE.tom };
const G = { her: geom(HER), margot: geom(MRG), tom: geom(TOM) };
const HX = -470, MX = 170, TX = 800, CT = -640, T0 = -180, T1 = 1150;   // her (standing), Margot, husband, table top + edges
const BOWL = { x: MX - 10, y: CT + 8 }, BAG = { x: 470, y: CT + 4 };

// ---------------- props
const big = (f, k = 1.5) => ctx => { ctx.scale(k, k); f(ctx); };
const apron = (c, gg) => { const g = G.her, x = gg.head.x, y0 = gg.ySh + 40; c.save(); c.fillStyle = '#FFFDF8'; c.beginPath(); c.moveTo(x - g.sw * 0.7, y0); c.lineTo(x + g.sw * 0.7, y0); c.lineTo(x + g.sw * 0.9, y0 + 560); c.lineTo(x - g.sw * 0.9, y0 + 560); c.closePath(); c.fill(); c.strokeStyle = '#C23C76'; c.lineWidth = 6; c.stroke();
  c.fillStyle = '#EE5E9A'; c.beginPath(); const hx = x, hy = y0 + 200; c.moveTo(hx, hy + 30); c.bezierCurveTo(hx - 60, hy - 20, hx - 30, hy - 60, hx, hy - 25); c.bezierCurveTo(hx + 30, hy - 60, hx + 60, hy - 20, hx, hy + 30); c.fill(); c.restore(); };
const ladleItem = (full) => Hq.items.ladle(full ? (c, x, y) => { c.fillStyle = '#B5122E'; c.beginPath(); c.ellipse(x, y + 30, 58, 26, 0, 0, TAU); c.fill(); } : null);
const spoonItem = (full) => ctx => { ctx.save(); ctx.rotate(-0.4); ctx.fillStyle = '#C9CED6'; rr(ctx, -6, -150, 12, 140, 6); ctx.fill(); ctx.beginPath(); ctx.ellipse(0, -170, 22, 32, 0, 0, TAU); ctx.fill(); if (full) { ctx.fillStyle = '#B5122E'; ctx.beginPath(); ctx.ellipse(0, -168, 15, 22, 0, 0, TAU); ctx.fill(); } ctx.restore(); };
const saltItem = ctx => { ctx.save(); ctx.rotate(Math.PI * 0.85); ctx.fillStyle = '#FFFDF8'; rr(ctx, -28, -120, 56, 110, 12); ctx.fill(); ctx.strokeStyle = '#9AA3B2'; ctx.lineWidth = 4; ctx.stroke(); ctx.fillStyle = '#9AA3B2'; rr(ctx, -28, -140, 56, 26, 8); ctx.fill(); ctx.restore(); };
const teabagItem = ctx => { ctx.save(); ctx.strokeStyle = '#FFFDF8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 120); ctx.stroke(); ctx.fillStyle = '#E8D3B0'; rr(ctx, -26, 120, 52, 64, 6); ctx.fill(); ctx.fillStyle = '#E0474C'; rr(ctx, -14, -26, 28, 26, 4); ctx.fill(); ctx.restore(); };
function jarDraw(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); c.globalAlpha = 0.85; c.fillStyle = '#DCEFF7'; rr(c, -110, -330, 220, 330, 40); c.fill(); c.globalAlpha = 1; c.strokeStyle = '#7A9AB0'; c.lineWidth = 6; rr(c, -110, -330, 220, 330, 40); c.stroke();
  c.fillStyle = '#C9CED6'; rr(c, -96, -372, 192, 50, 10); c.fill(); c.fillStyle = '#FFFDF8'; rr(c, -80, -230, 160, 90, 10); c.fill(); fitTxt(c, '3 L', 0, -186, 52, '#E0474C', 140); c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 8; c.beginPath(); c.moveTo(-80, -300); c.lineTo(-80, -60); c.stroke(); c.restore(); }
const jarItem = ctx => { ctx.save(); ctx.rotate(-0.05); jarDraw(ctx, 0, 40, 0.75); ctx.restore(); };
function bowl(c, x, y, level = 1, s = 1, teabag = 0) { c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,.15)'; c.beginPath(); c.ellipse(6, 8, 190, 30, 0, 0, TAU); c.fill(); c.fillStyle = '#FFFDF8'; c.beginPath(); c.ellipse(0, 0, 184, 30, 0, 0, TAU); c.fill(); c.strokeStyle = '#C9CED6'; c.lineWidth = 4; c.stroke();
  paint(c, q => { q.m(-140, -110); q.q(-130, 0, 0, 0); q.q(130, 0, 140, -110); q.z(); }, '#FFFDF8', { sd: 10, hd: 5, lw: 4, inner: k => { k.fillStyle = '#4C7BD9'; k.fillRect(-150, -80, 300, 12); } });
  c.fillStyle = '#B5122E'; c.beginPath(); c.ellipse(0, -110, 138 * Math.min(1, level), 26, 0, 0, TAU); c.fill(); c.fillStyle = '#FFFDF8'; c.beginPath(); c.ellipse(30, -114, 30, 9, 0.2, 0, TAU); c.fill(); c.fillStyle = '#3E8E55'; for (const [dx, dy] of [[-40, -112], [-10, -104], [60, -108]]) { c.beginPath(); c.ellipse(dx, dy, 8, 4, 0.5, 0, TAU); c.fill(); }
  if (level > 1) { c.fillStyle = '#B5122E'; for (const dx of [-130, 120, 20]) { c.beginPath(); c.moveTo(dx, -112); c.quadraticCurveTo(dx + 14, -60, dx + 4, -20); c.lineTo(dx - 10, -20); c.closePath(); c.fill(); } }
  if (teabag) { c.strokeStyle = '#FFFDF8'; c.lineWidth = 3; c.beginPath(); c.moveTo(70, -110); c.lineTo(150, -260); c.stroke(); c.fillStyle = '#E0474C'; rr(c, 136, -290, 30, 30, 4); c.fill(); }
  c.restore(); }
function handbag(c, x, y, s = 1, open = 0) { c.save(); c.translate(x, y); c.scale(s, s); c.strokeStyle = '#4A2E1A'; c.lineWidth = 14; c.beginPath(); c.arc(0, -330, 110, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
  paint(c, q => { q.m(-200, -320); q.l(200, -320); q.l(170, 0); q.l(-170, 0); q.z(); }, '#8A1C2E', { sd: 12, hd: 6, lw: 4 }); c.fillStyle = '#F2C14E'; rr(c, -30, -300, 60, 40, 8); c.fill(); if (open) { c.fillStyle = '#4A0E1A'; c.beginPath(); c.ellipse(0, -320, 180 * open, 26 * open, 0, 0, TAU); c.fill(); } c.restore(); }
function plates(c, x, y, n) { for (let i = 0; i < n; i++) { c.save(); c.translate(x + Math.sin(i * 2.3) * 8, y - i * 26); c.fillStyle = '#FFFDF8'; c.beginPath(); c.ellipse(0, 0, 150, 26, 0, 0, TAU); c.fill(); c.strokeStyle = '#C9CED6'; c.lineWidth = 4; c.stroke(); c.fillStyle = 'rgba(181,18,46,.35)'; c.beginPath(); c.ellipse(0, -2, 90, 12, 0, 0, TAU); c.fill(); c.restore(); } }

// ---------------- dining room (prerendered, softly blurred): bright wallpaper, window with garden, dresser with plates, wall clock
const BX0 = -2200, BY0 = -3400, BWW = 4400, BHH = 4800, BS = 0.5;
function drawRoom(c) {
  c.fillStyle = '#FFF1D6'; c.fillRect(BX0, BY0, BWW, BHH); c.fillStyle = '#FBE3B8'; for (let x = BX0; x < BX0 + BWW; x += 220) for (let y = -3300; y < -900; y += 220) { c.beginPath(); c.arc(x + ((y / 220) % 2 ? 110 : 0), y, 26, 0, TAU); c.fill(); }
  c.fillStyle = '#F7B6CF'; c.fillRect(BX0, -900, BWW, 640); c.fillStyle = '#EE9AB8'; c.fillRect(BX0, -920, BWW, 26);
  c.fillStyle = '#C9A27A'; c.fillRect(BX0, -260, BWW, 1700); c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 4; for (let y = -260; y < 1400; y += 120) { c.beginPath(); c.moveTo(BX0, y); c.lineTo(BX0 + BWW, y); c.stroke(); }
  c.fillStyle = '#FFFDF8'; rr(c, 300, -2500, 1000, 1200, 20); c.fill(); c.fillStyle = '#BFE3F7'; rr(c, 330, -2470, 940, 1140, 10); c.fill(); c.fillStyle = '#8CB369'; c.fillRect(330, -1700, 940, 370); c.fillStyle = '#5E9E6E'; for (const x of [420, 640, 980, 1180]) { c.beginPath(); c.arc(x, -1700, 110, Math.PI, 0); c.fill(); }
  c.fillStyle = '#FFE15A'; c.beginPath(); c.arc(1100, -2250, 90, 0, TAU); c.fill(); c.strokeStyle = '#FFFDF8'; c.lineWidth = 20; c.beginPath(); c.moveTo(800, -2470); c.lineTo(800, -1330); c.moveTo(330, -1900); c.lineTo(1270, -1900); c.stroke();
  c.fillStyle = '#EE5E9A'; c.fillRect(260, -2560, 140, 1300); c.fillRect(1200, -2560, 140, 1300);
  // dresser with plates (left)
  c.fillStyle = '#9C6238'; rr(c, -1500, -2300, 760, 2040, 20); c.fill(); c.fillStyle = '#B67A48'; for (let k = 0; k < 3; k++) c.fillRect(-1470, -2200 + k * 420, 700, 22);
  for (let k = 0; k < 3; k++) for (let j = 0; j < 3; j++) { c.fillStyle = ['#FFFDF8', '#BFE3F7', '#F7B6CF'][(k + j) % 3]; c.beginPath(); c.arc(-1360 + j * 230, -2310 + k * 420 + 220, 90, 0, TAU); c.fill(); c.strokeStyle = '#4C7BD9'; c.lineWidth = 6; c.stroke(); }
  // wall clock + framed photo
  c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(-300, -2300, 140, 0, TAU); c.fill(); c.fillStyle = '#FFFDF8'; c.beginPath(); c.arc(-300, -2300, 120, 0, TAU); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 10; c.beginPath(); c.moveTo(-300, -2300); c.lineTo(-300, -2390); c.moveTo(-300, -2300); c.lineTo(-240, -2290); c.stroke();
  c.fillStyle = '#C98B5A'; rr(c, -560, -1900, 380, 300, 12); c.fill(); c.fillStyle = '#FFE9C2'; rr(c, -536, -1876, 332, 252, 8); c.fill(); c.fillStyle = '#EE5E9A'; c.beginPath(); c.moveTo(-370, -1700); c.bezierCurveTo(-470, -1770, -420, -1830, -370, -1790); c.bezierCurveTo(-320, -1830, -270, -1770, -370, -1700); c.fill();
}
const mkBG = fn => { const a = createCanvas(Math.round(BWW * BS), Math.round(BHH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawRoom);

// ---------------- state helpers
function stainK(t) { const s = ev('A1', 'spill'); if (t < s) return 0; return 0.35 + 0.65 * eOut(clamp((t - s) / 2.5)) + 0.25 * clamp((t - s - 3) / 60); }
function plateN(t) { let n = 1; for (const L of ['A2', 'B1', 'C1']) if (t > ev(L, 'plate')) n++; return n; }
function spoonN(t) { let n = 1; if (t > ev('C1', 'spoon2')) n = 2; if (t > ev('C1', 'spoon3')) n = 3; return n; }
function bowlLevel(t, L) { if (L === 'A1' && t > ev('A1', 'pour')) return 1 + clamp((t - ev('A1', 'pour')) / 1.5) * 0.4; return 1; }

// ---------------- table
function table(c, t, L) {
  c.fillStyle = 'rgba(0,0,0,.14)'; c.beginPath(); c.ellipse((T0 + T1) / 2, 16, (T1 - T0) / 2, 30, 0, 0, TAU); c.fill();
  paint(c, q => { q.m(T0 + 20, CT + 40); q.l(T1 - 20, CT + 40); q.l(T1 - 50, 0); q.l(T0 + 50, 0); q.z(); }, '#FFFDF8', { sd: 8, hd: 3, lw: 4 });
  c.strokeStyle = '#F7B6CF'; c.lineWidth = 10; c.beginPath(); c.moveTo(T0 + 40, -60); c.lineTo(T1 - 40, -60); c.stroke();
  paint(c, q => { q.m(T0, CT); q.l(T1, CT); q.l(T1 - 20, CT + 46); q.l(T0 + 20, CT + 46); q.z(); }, '#FFFDF8', { sd: 8, hd: 3, lw: 4 });
  const sk = stainK(t); if (sk > 0) { c.save(); c.fillStyle = 'rgba(181,18,46,.75)'; c.beginPath(); c.ellipse(BOWL.x - 20, CT + 22, 140 + 220 * sk, 16 + 10 * sk, 0, 0, TAU); c.fill();
    for (let k = 0; k < 5; k++) { const x = BOWL.x - 150 * sk + k * 75 * sk, len = (40 + 90 * sk) * (0.6 + 0.4 * Math.sin(k * 2.1 + 1)); c.beginPath(); c.moveTo(x - 16, CT + 40); c.lineTo(x - 12, CT + 40 + len); c.arc(x, CT + 40 + len, 12 + 4 * sk, Math.PI, 0, true); c.lineTo(x + 16, CT + 40); c.closePath(); c.fill(); } c.fill(); c.restore(); }
  bowl(c, BOWL.x, BOWL.y, bowlLevel(t, L), 1, L === 'B2' && t > ev('B2', 'teabag') ? 1 : 0);
  plates(c, TX - 20, CT + 10, plateN(t));
  // salt shaker on the table (in Margot's hand during B1)
  if (!(L === 'B1' && t > ev('B1', 'salt') - 0.3 && t < ev('B1', 'salt') + 1.6)) { c.save(); c.translate(BOWL.x + 260, CT + 4); c.fillStyle = '#FFFDF8'; rr(c, -24, -100, 48, 100, 10); c.fill(); c.strokeStyle = '#9AA3B2'; c.lineWidth = 4; c.stroke(); c.fillStyle = '#9AA3B2'; rr(c, -24, -118, 48, 22, 6); c.fill(); c.restore(); }
  // Margot's huge handbag
  const jarOut = L === 'C2' && t > ev('C2', 'jar') - 0.3; handbag(c, BAG.x, BAG.y, 0.95, jarOut ? 1 : 0);
}

// ---------------- characters
const gest = (st, g, who, t, side, base) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } };
const hang = (g, s) => reach(g, s, s * g.sw * 0.8, g.ySh + 330);
const chest = (g, s, k = 0.6) => reach(g, s, s * g.sw * k, g.ySh + 230);
const cross = g => ({ armL: reach(g, -1, g.sw * 0.5, g.ySh + 240), armR: reach(g, 1, -g.sw * 0.5, g.ySh + 270) });
const hand2head = (g, s, k = 0.5) => reach(g, s, s * g.hw * k, g.headY + g.hh * 0.8);
const mouth = (g, s) => reach(g, s, s * g.hw * 0.15, g.headY + g.hh * 0.72);
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { t, talk: talk('her', t), mood: 'happy', turn: 0.35, look: 0.8, armL: hang(g, -1), armR: reach(g, 1, g.sw * 1.2, g.ySh + 160), items: { R: ladleItem(false) }, afterTorso: apron };
  if (L === 'A1') { st.mood = 'happy'; if (speaking('a1_h', t, 0.05, 0.2)) { st.laugh = true; st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 100 + Math.sin(t * 10) * 30, { planar: true }); }
    if (t > e('pour') - 0.2 && t < e('spill') + 0.6) { st.items = { R: ladleItem(true) }; st.armR = reach(g, 1, g.sw * 2.4, CT - 120 - g.ySh * 0 + 0, { planar: true }); }
    if (t > e('spill') + 0.6) { st.mood = 'shock'; st.blink = 0; st.armL = hand2head(g, -1, 0.9); } if (t > e('react')) { st.mood = 'worried'; st.armL = chest(g, -1, 0.4); } }
  if (L === 'A2') { if (speaking('a2_h', t, 0.05, 0.3)) { st.mood = 'happy'; gest(st, g, 'her', t, -1, 120); } if (speaking('a2_m', t, 0, 0.2)) { st.mood = 'surprised'; st.blink = 0; } if (t > e('react')) { st.mood = 'skeptical'; Object.assign(st, cross(g)); st.items = {}; } }
  if (L === 'B1') { if (speaking('b1_h', t, 0.05, 0.2)) { st.mood = 'happy'; st.armL = chest(g, -1, 0.3); } if (t > e('salt') - 0.2) { st.mood = 'surprised'; st.blink = 0; } if (t > e('twitch')) { st.mood = 'annoyed'; st.tilt = 0.03 * Math.sin(t * 40) * (t < e('twitch') + 0.8 ? 1 : 0); } }
  if (L === 'B2') { if (speaking('b2_h', t, 0.05, 0.2)) { st.mood = 'smug'; gest(st, g, 'her', t, -1, 130); } if (t > e('teabag')) { st.mood = 'shock'; st.blink = 0; } if (t > e('react')) { st.mood = 'bored'; Object.assign(st, cross(g)); st.items = {}; } }
  if (L === 'C1') { st.mood = 'neutral'; st.items = {}; st.armR = chest(g, 1, 0.3); st.armL = chest(g, -1, 0.3); if (speaking('c1_h', t, 0.05, 0.2)) { st.mood = 'happy'; gest(st, g, 'her', t, -1, 160); }
    if (t > e('spoon2')) { st.mood = 'surprised'; st.blink = 0; } if (speaking('c1_m', t, 0, 0.3)) { st.mood = 'happy'; st.laugh = t > SP.c1_m.t + SP.c1_m.d * 0.5; } }
  if (L === 'C2') { st.mood = 'neutral'; st.items = {}; st.armR = chest(g, 1, 0.3); if (speaking('c2_h', t, 0.05, 0.1)) { st.mood = 'smug'; gest(st, g, 'her', t, -1, 140); }
    if (t > e('think') - 0.1) { st.mood = 'neutral'; Object.assign(st, cross(g)); } if (t > e('jar')) { st.mood = 'shock'; st.blink = 0; } if (speaking('c2_h2', t, 0.05, 0.8)) { st.mood = 'bored'; Object.assign(st, cross(g)); st.turn = 0; st.look = 0; } }
  return st; }
function margotState(t, L) { const g = G.margot, e = k => ev(L, k), st = { t, talk: talk('margot', t), mood: 'neutral', turn: -0.3, look: -0.7, armL: reach(g, -1, -g.sw * 1.0, CT + 40, { planar: true }), armR: reach(g, 1, g.sw * 1.0, CT + 40, { planar: true }), items: {} };
  const tasting = (t0, dur = 0.9) => { const u = (t - t0) / dur; if (u >= 0 && u < 1) { st.items = { L: spoonItem(u < 0.5) }; st.armL = u < 0.5 ? mouth(g, -1) : reach(g, -1, -g.sw * 0.6, CT - 40, { planar: true }); return true; } return false; };
  if (L === 'hook') { tasting(0.0, 2.5); st.mood = 'skeptical'; }
  if (L === 'A1') { st.mood = 'neutral'; st.items = { L: spoonItem(true) }; st.armL = mouth(g, -1); if (t > e('spill')) { st.mood = 'shock'; st.blink = 0; st.armL = chest(g, -1, 0.4); st.items = {}; } if (speaking('a1_m', t, 0, 0.3)) { st.mood = 'smug'; st.look = -0.9; } }
  if (L === 'A2') { st.mood = 'skeptical'; if (speaking('a2_m', t, 0, 0.3)) { st.mood = 'smug'; st.armR = reach(g, 1, g.sw * 1.4, g.ySh + 20, { planar: true }); } }
  if (L === 'B1') { st.mood = 'neutral'; if (speaking('b1_m', t, 0, 0.1)) st.mood = 'skeptical'; const s = e('salt'); if (t > s - 0.3 && t < s + 1.6) { st.items = { R: saltItem }; st.armR = reach(g, 1, g.sw * 0.6 + Math.sin(t * 22) * 20, CT - 260, { planar: true }); st.lookY = 0.6; st.mood = 'smug'; } }
  if (L === 'B2') { st.mood = 'surprised'; if (speaking('b2_m', t, 0, 0.6)) { st.mood = 'smug'; } if (t > e('teabag') - 0.3 && t < e('teabag') + 1.2) { st.items = { R: teabagItem }; st.armR = reach(g, 1, g.sw * 0.5, CT - 330, { planar: true }); st.lookY = 0.6; } }
  if (L === 'C1') { st.mood = 'neutral'; if (speaking('c1_h', t, 0, 0.2)) { st.mood = 'surprised'; st.blink = 0; } tasting(e('spoon2') - 0.2, 0.45) || tasting(e('spoon3') - 0.2, 0.5); if (t > e('spoon3') + 0.3) st.mood = 'happy';
    if (speaking('c1_m', t, 0, 0.3)) { st.mood = 'happy'; st.laugh = true; st.armL = chest(g, -1, 0.3); } }
  if (L === 'C2') { st.mood = 'surprised'; if (t > e('think') - 0.05) { st.mood = 'skeptical'; st.armR = reach(g, 1, g.hw * 0.2, g.headY + g.hh * 0.95); st.lookY = -0.3; }
    if (speaking('c2_m', t, 0.05, 0.3)) { st.mood = 'smug'; st.lookY = 0; } if (t > e('jar') - 0.3) { st.items = { L: jarItem }; st.armL = reach(g, -1, -g.sw * 1.4, g.ySh + 60, { planar: true }); st.mood = 'happy'; st.laugh = !speaking('c2_m', t); } }
  return st; }
function tomState(t, L) { const g = G.tom, st = { t, talk: 0, mood: 'happy', turn: -0.2, look: -0.4, lookY: 0.4, armL: reach(g, -1, -g.sw * 0.9, CT + 30, { planar: true }), armR: hang(g, 1), items: {} };
  const u = (t * 1.3) % 1; st.items = { L: spoonItem(u < 0.5) }; st.armL = u < 0.5 ? mouth(g, -1) : reach(g, -1, -g.sw * 0.9, CT + 10, { planar: true });
  if (L === 'C1' && t > ev('C1', 'freeze') - 0.1) { st.items = { L: spoonItem(true) }; st.armL = mouth(g, -1); st.mood = 'shock'; st.blink = 0; st.look = -0.8; st.lookY = 0; }
  if (L === 'C2' && t > ev('C2', 'jar')) { st.mood = 'surprised'; st.blink = 0; st.look = -0.9; st.lookY = 0; }
  return st; }

// ---------------- world
const DRAW = { wide: ['her', 'margot', 'tom'], card: ['her', 'margot', 'tom'], two: ['her', 'margot', 'tom'], her: ['her'], margot: ['margot'], tom: ['tom'], prop: ['her', 'margot', 'tom'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGR, BX0, BY0, BWW, BHH);
  if (who.includes('tom')) heads.tom = K.put(c, TOM, tomState(t, L), TX, 0);
  if (who.includes('margot')) heads.margot = K.put(c, MRG, margotState(t, L), MX, 0);
  table(c, t, L);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), HX, 0);
  if (!heads.margot) heads.margot = OFF; if (!heads.her) heads.her = OFFL;
  return heads; }

// ---------------- shots
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const hHY = G.her.headY, mHY = G.margot.headY;
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { WIDE: S(80, -1000, 0.5, 'wide'), CARD: S(60, fy(mHY, 0.6, 1020), 0.6, 'card'), TWO: S(-120, fy(hHY, 0.72, 860), 0.72, 'two'),
  HER: S(HX + 20, fy(hHY, 1.0), 1.0, 'her'), HER_CU: S(HX + 20, fy(hHY, 1.6, 960), 1.6, 'her'), MG: S(MX + 30, fy(mHY, 1.0), 1.0, 'margot'), MG_CU: S(MX + 20, fy(mHY, 1.6, 960), 1.6, 'margot'),
  TOM: S(TX - 40, fy(G.tom.headY, 1.2, 900), 1.2, 'tom'), STAIN: S(BOWL.x, CT - 60, 1.1, 'prop'), JAR: S(-40, fy(mHY, 0.85, 900), 0.85, 'two') };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro' || L === 'hook') return SH.WIDE;
  const sp = id => speaking(id, t, 0.1, 0.15), u = t - sc.s, l = L.toLowerCase(), nar = SP[l + '_nar'];
  if (u < 0.5) return f(SH.WIDE);
  if (nar && t >= nar.t - 0.1) return f(SH.CARD);
  if (L === 'A1') { if (t > e('react') - 0.05) return f(SH.HER_CU); if (t > e('pour') - 0.2 && t < SP.a1_m.t - 0.1) return f(SH.TWO); }
  if (L === 'A2') { if (t > e('react') - 0.05) return f(SH.TOM); }
  if (L === 'B1') { if (t > e('plate') - 0.1) return f(SH.TOM); if (t > e('twitch') - 0.1) return f(SH.HER_CU); if (t > e('salt') - 0.3) return f(SH.TWO); }
  if (L === 'B2') { if (t > e('react') - 0.05) return f(SH.HER_CU); if (t > e('teabag') - 0.3) return f(SH.TWO); }
  if (L === 'C1') { if (t > e('freeze') - 0.1) return f(SH.TOM); if (t > e('spoon2') - 0.3 && t < SP.c1_m.t - 0.1) return f(SH.MG_CU); }
  if (L === 'C2') { if (sp('c2_h')) { const ch = (TL.cfg.chunks || {}).c2_h, p = SP.c2_h, i = Math.min(ch.length - 1, Math.floor((t - p.t) / p.d * ch.length)); return f([SH.HER, SH.HER_CU, SH.HER, SH.HER_CU][i] || SH.HER); }
    if (t > endOf('c2_h') && t < e('think') + 0.8) return f(SH.WIDE); if (t < SP.c2_m.t - 0.1) return f(SH.MG_CU); if (t > e('jar') - 0.35 && t < e('react') - 0.05) return f(SH.JAR); if (sp('c2_m')) return f(SH.MG); if (t > e('react') - 0.05) return f(SH.HER_CU); }
  const cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.1 && t < s.t + s.d + 0.25);
  const single = who => who === 'her' ? SH.HER : SH.MG;
  if (cur) return f(single(cur.who));
  const next = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.6 && t < s.t);
  if (next) return f(single(next.who));
  return SH.TWO; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- hook card (screen space, like the hits): pink stripes, big title, giant bowl, small heroine + Margot, bubble, stamp
function hookCard(c, t) {
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH); c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  c.fillStyle = 'rgba(255,255,255,.6)'; 
  c.textAlign = 'center'; c.textBaseline = 'middle'; const L1 = TL.cfg.hook_title; const k = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.translate(540, 470); c.scale(k, k); c.rotate(-0.03); UI.textFit(c, 'Unb9', 66, L1[0][0], 940); UI.strokeText(c, L1[0][0], 0, -110, C.oliveD, C.white, 14); UI.textFit(c, 'Unb9', 118, L1[1][0], 960); UI.strokeText(c, L1[1][0], 0, -10, C.pink, C.white, 16); UI.textFit(c, 'Unb9', 66, L1[2][0], 940); UI.strokeText(c, L1[2][0], 0, 92, C.oliveD, C.white, 14); c.restore();
  // giant bowl with steam + spoon
  const by = 1130 + Math.sin(t * 3) * 6; c.save(); c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 12; c.lineCap = 'round'; for (let s = -1; s <= 1; s++) { c.beginPath(); for (let y = 0; y < 220; y += 10) { const x = 540 + s * 90 + Math.sin(y / 30 + t * 3 + s) * 20; y === 0 ? c.moveTo(x, by - 300 - y) : c.lineTo(x, by - 300 - y); } c.stroke(); } c.restore();
  bowl(c, 540, by, 1, 2.1); c.save(); c.translate(760, by - 300); c.rotate(0.7); c.fillStyle = '#C9CED6'; rr(c, -12, -320, 24, 300, 10); c.fill(); c.beginPath(); c.ellipse(0, -340, 44, 62, 0, 0, TAU); c.fill(); c.restore();
  // small characters at the bottom: heroine (left), Margot with the spoon (right)
  const g = G.her, gm = G.margot; const heads = {};
  heads.her = K.put(c, HER, { t, talk: 0, mood: 'worried', turn: 0.3, look: 0.8, armL: chest(g, -1, 0.4), armR: chest(g, 1, 0.4), items: {}, afterTorso: apron }, 230, 1980, 0.45);
  heads.margot = K.put(c, MRG, { t, talk: talk('margot', t), mood: 'skeptical', turn: -0.3, look: -0.6, armL: mouth(gm, -1), armR: hang(gm, 1), items: { L: spoonItem(true) } }, 860, 1990, 0.45);
  return heads; }
function spoonHud(c, t) { const n = spoonN(t), last = [ev('C1', 'spoon2'), ev('C1', 'spoon3')].reduce((a, q) => Math.max(a, 1 - clamp(Math.abs(t - q - 0.15) / 0.35)), 0);
  c.save(); c.translate(200, 1555); c.scale(1 + 0.15 * last, 1 + 0.15 * last); c.rotate(-0.04); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -150 + 6, -38 + 8, 300, 76, 38); c.fill(); c.fillStyle = C.red; rr(c, -150, -38, 300, 76, 38); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke(); fitTxt(c, 'ЛОЖКИ: ' + n, 0, 3, 38, C.white, 270); c.restore(); }
function levelIntroFast(c, t, sc) { const L = sc.id, i = LVS.indexOf(L); if (i < 0) return; const u = (t - sc.s) * (1.15 / 0.5); if (u > 1.2 || u < 0) return;
  const col = LVCOL[L], pw = 128, gap = 14, x0 = (W - (6 * pw + 5 * gap)) / 2, px = x0 + i * (pw + gap) + pw / 2, py = 253;
  const inK = eOut(P(u, 0, 0.3)), outK = eIO(P(u, 0.82, 1.15)), cx = lerp(540, px, outK), cy = lerp(960, py, outK), R = lerp(0, 1300, inK) * (1 - outK) + 40 * outK; if (R < 2) return;
  c.save(); c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.clip(); c.fillStyle = col; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(cx, cy); c.rotate(u * 0.6); c.fillStyle = 'rgba(255,255,255,.13)'; for (let k = 0; k < 18; k++) { c.rotate(TAU / 18); c.beginPath(); c.moveTo(0, 0); c.lineTo(1400, -60); c.lineTo(1400, 60); c.fill(); } c.restore();
  const s = eBack(P(u, 0.12, 0.45), 2.2) * lerp(1, 0.18, outK); c.translate(cx, cy); c.scale(s, s); c.rotate(lerp(-0.2, -0.05, eOut(P(u, .12, .5)))); c.textAlign = 'center'; c.textBaseline = 'middle';
  UI.font(c, 'Unb9', 400); c.fillStyle = 'rgba(0,0,0,.18)'; c.fillText(L, 14, 24); UI.strokeText(c, L, 0, 0, C.white, C.oliveD, 22); c.globalAlpha = clamp(P(u, .3, .5)); UI.font(c, 'Unb7', 54); c.fillStyle = C.white; c.fillText(LVNAME[L], 0, 250); UI.font(c, 'Nun9', 44); c.fillText('уровень', 0, -250); c.restore(); }
function hud(c, t, sc) { UI.card(c, t, sc); UI.captions(c, t); UI.sparkles(c, t); Hq.grain(c, W, HH, t, 0.04); UI.levelBar(c, t, sc, 1); spoonHud(c, t); UI.watermark(c); levelIntroFast(c, t, sc); UI.levelIntroNext(c, t); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { K.outro(c, t, { q: ['А КАК БЫ ТЫ СПРОСИЛА', 'МНЕНИЕ СВЕКРОВИ?'], rows: [['A2', 'How does it taste?'], ['B1', "Do you like it? It's my grandma's recipe."], ['B2', "It's not my cup of tea."], ['C1', "I'd really value your honest opinion."]], cta: ['ОТПРАВЬ', 'ПОДРУГЕ'], heroX: 190, heroS: 0.42,
    hero: (cc, tt) => { const g = G.her; K.put(cc, HER, { t: tt, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(tt * 8) * 30, { planar: true }), armR: hang(g, 1), items: {}, afterTorso: apron }, 0, 0); } });
    Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  if (L === 'hook') { const heads = hookCard(c, t); K.bubbles(c, t, { id: 'hook' }, heads, p => p, { cleanChunks: true, names: { margot: ['MARGOT', '#2F3E5C'] }, hold: { hook_m: 1.2 } });
    UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); UI.captions(c, t); spoonHud(c, t); Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  const r = drawWorld(c, t, L, cam, tag, sh), heads = r.heads, M = r.M, proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.22);
  const e = k => ev(L, k), narT = (SP[L.toLowerCase() + '_nar'] || { t: 1e9 }).t;
  if (L === 'A1' && t > e('spill') && t < narT - 0.1) K.pop(c, t, 'СКАТЕРТЬ!', e('spill') + 0.05, narT - 0.2, 540, 1330, C.gold, -0.06, 100);
  if (L === 'A2' && t > e('plate') && t < narT - 0.1) K.pop(c, t, 'МУЖ: ТАРЕЛКА №2', e('plate') + 0.05, narT - 0.2, 540, 1330, C.gold, -0.06, 62);
  if (L === 'B1') { if (t > e('salt') && t < e('twitch')) K.pop(c, t, 'СОЛИТ, НЕ ПОПРОБОВАВ', e('salt') + 0.05, e('twitch') - 0.05, 540, 1330, C.gold, -0.06, 54); if (t > e('plate') && t < narT - 0.1) K.pop(c, t, 'ТАРЕЛКА №3', e('plate') + 0.05, narT - 0.2, 540, 1330, C.gold, -0.06, 84); }
  if (L === 'B2' && t > e('teabag') && t < narT - 0.1) K.pop(c, t, 'ЧАЙ В БОРЩ?!', e('teabag') + 0.05, narT - 0.2, 540, 1330, C.gold, -0.06, 84);
  if (L === 'C1' && t > e('freeze') && t < narT - 0.1) K.pop(c, t, 'ТАРЕЛКА №4…', e('freeze') + 0.05, narT - 0.2, 540, 1330, C.gold, -0.06, 84);
  if (L === 'C2') { if (t > e('think') && t < SP.c2_m.t - 0.05) K.dots(c, t, e('think') + 0.05, SP.c2_m.t - 0.05, 1450); if (t > e('jar') && t < e('react') - 0.05) K.pop(c, t, '3 ЛИТРА!', e('jar') + 0.05, e('react') - 0.3, 540, 1330, C.gold, -0.06, 110); }
  K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names: { margot: ['MARGOT', '#2F3E5C'] }, hold: { a1_h: 0.05, a1_m: 0.3, a2_h: 0.05, a2_m: 0.3, b1_h: 0.05, b1_m: 0.4, b2_h: 0.05, b2_m: 0.3, c1_h: 0.05, c1_m: 0.3, c2_m: 0.3, c2_h2: 0.5 } });
  hud(c, t, sc);
}
E.run('borsch', NF, renderFrame);
