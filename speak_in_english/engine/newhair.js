// "New hair: how to say you dislike a friend's hairdo" episode renderer (hard_cut camera): node newhair.js start end out.mp4 | --png=f1,f2
// Café (togo layout): she stands at the left of a high table, her friend with the huge pink hair at the right. No black card anywhere.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/newhair/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];

// ---------------- cast
const HER = { ...BASE.her_lift, top: { type: 'coat', col: '#C2504A', col2: '#F5EBDD' }, bottom: { type: 'jeans', col: '#4A5A7A' }, shoes: { col: '#2B2F3A', acc: null } };
const BAR = { ...BASE.chloe, hair: { style: 'bouffant', col: '#EE5E9A' }, top: { type: 'sweater', col: '#7A5BD6' }, bottom: { type: 'jeans', col: '#2F3A55' }, shoes: { col: '#F2F2F2', acc: null } };
const BAR2 = { ...BAR, hair: { style: 'bun', col: '#6A4126' } };   // under the wig
const G = { her: geom(HER), friend: geom(BAR) };
const HX = -380, BX = 380, CT = -760;                       // her / officer feet x, counter top height
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function apron(cc, g) { }

// ---------------- props
const big = f => ctx => { ctx.scale(1.5, 1.5); f(ctx); };
const wigItem0 = ctx => { ctx.fillStyle = '#EE5E9A'; for (const [x, y, r] of [[-60, -70, 55], [0, -110, 70], [60, -70, 55], [-30, -40, 50], [35, -40, 50]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); } ctx.strokeStyle = '#B83C78'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, -90, 80, 0.2, Math.PI - 0.2); ctx.stroke(); };
const wigItem = big(wigItem0);
function puff(c, g, x, t) { const hy = g.headY - g.hh * 0.35, R = g.hh * 1.55; c.save(); c.translate(x, hy); const bob = Math.sin(t * 3) * 4;
  c.fillStyle = '#D93F86'; for (const [dx, dy, r] of [[-1.15, 0.1, 0.75], [1.15, 0.1, 0.75], [-0.8, -0.95, 0.85], [0.8, -0.95, 0.85], [0, -1.35, 0.95], [-1.3, 0.8, 0.6], [1.3, 0.8, 0.6]]) { c.beginPath(); c.arc(dx * R, dy * R + bob, r * R, 0, TAU); c.fill(); }
  c.fillStyle = '#EE5E9A'; for (const [dx, dy, r] of [[-1.05, 0.0, 0.65], [1.05, 0.0, 0.65], [-0.75, -0.9, 0.75], [0.75, -0.9, 0.75], [0, -1.3, 0.85], [0, -0.3, 1.0]]) { c.beginPath(); c.arc(dx * R, dy * R + bob, r * R, 0, TAU); c.fill(); }
  c.fillStyle = 'rgba(255,255,255,.22)'; c.beginPath(); c.ellipse(-0.5 * R, -1.5 * R + bob, 0.45 * R, 0.22 * R, -0.5, 0, TAU); c.fill(); c.restore(); }
function heart(c, x, y, r, col) { c.fillStyle = col; c.beginPath(); c.moveTo(x, y + r * 0.9); c.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.7, y - r * 1.3, x, y - r * 0.4); c.bezierCurveTo(x + r * 0.7, y - r * 1.3, x + r * 1.6, y - r * 0.2, x, y + r * 0.9); c.fill(); }
function star(c, x, y, r, col, rot) { c.fillStyle = col; c.beginPath(); for (let k = 0; k < 10; k++) { const a = rot + k * Math.PI / 5 - Math.PI / 2, rr2 = k % 2 ? r * 0.45 : r; c.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); } c.closePath(); c.fill(); }
// gags drawn in world space on top of the characters, anchored to the friend's head {x, y, hh}
function headGags(c, t, L, hd) { if (!hd || hd.y < -2000) return; const hh = hd.hh;
  if (L === 'A1' && t > ev('A1', 'cloud')) { const u = t - ev('A1', 'cloud'), k = eBack(clamp(u / 0.4), 1.6), cx = hd.x, cy = hd.y - hh * 3.6;
    c.save(); c.translate(cx, cy); c.scale(k, k); c.fillStyle = '#6F7C92'; for (const [x, y, r] of [[-110, 10, 70], [-30, -30, 90], [60, -10, 80], [130, 25, 60], [0, 30, 80]]) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); } c.restore();
    c.strokeStyle = '#6FB6F0'; c.lineWidth = 9; c.lineCap = 'round'; for (let n = 0; n < 12; n++) { const ph = ((t * 1.6 + n * 0.37) % 1), x = cx - 130 + (n % 6) * 52 + (n > 5 ? 20 : 0), y = cy + 80 + ph * hh * 2.6; c.globalAlpha = 1 - ph * 0.6; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 6, y + 34); c.stroke(); } c.globalAlpha = 1; }
  if (L === 'A2' && t > ev('A2', 'nose')) { const u = t - ev('A2', 'nose'), k = eBack(clamp(u / 0.25), 2.2); c.save(); c.translate(hd.x + 16, hd.y + hh * 0.18); c.scale(k, k); c.fillStyle = '#E0302C'; c.beginPath(); c.arc(0, 0, hh * 0.19, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.arc(-8, -9, hh * 0.05, 0, TAU); c.fill(); c.restore(); }
  if (L === 'B1' && t > ev('B1', 'hearts')) { const u = t - ev('B1', 'hearts'); for (let n = 0; n < 7; n++) { const ph = clamp(u * 0.7 - n * 0.09, 0, 1.2); if (ph <= 0 || ph > 1) continue; heart(c, hd.x - 220 + n * 75 + Math.sin(u * 4 + n) * 25, hd.y - hh * 1.2 - ph * 700, 34 + (n % 3) * 8, n % 2 ? '#F0507A' : '#FF8FB0'); } }
  if (L === 'B2' && t > ev('B2', 'tea')) { const u = t - ev('B2', 'tea'), k = eBack(clamp(u / 0.35), 1.8), top = hd.y - hh * 3.9; c.save(); c.translate(hd.x, top - (1 - k) * 200); c.fillStyle = '#FFFDF8'; c.strokeStyle = '#9AA3B2'; c.lineWidth = 6; c.beginPath(); c.ellipse(0, 36, 120, 22, 0, 0, TAU); c.fill(); c.stroke(); rr(c, -76, -50, 152, 90, 30); c.fill(); c.stroke(); c.beginPath(); c.arc(86, -8, 30, -1.4, 1.4); c.stroke(); c.fillStyle = '#9B5A2E'; c.beginPath(); c.ellipse(0, -48, 70, 12, 0, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 8; for (let n = 0; n < 3; n++) { const ph = (t * 0.9 + n * 0.33) % 1; c.globalAlpha = 1 - ph; c.beginPath(); c.moveTo(-34 + n * 34, -60 - ph * 40); c.quadraticCurveTo(-48 + n * 34, -100 - ph * 40, -34 + n * 34, -130 - ph * 40); c.stroke(); } c.globalAlpha = 1; c.restore(); }
  if (L === 'C1' && t > ev('C1', 'model')) { const u = t - ev('C1', 'model'); for (let n = 0; n < 8; n++) { const a = n * TAU / 8 + u * 1.5, rad = 330 + Math.sin(u * 5 + n) * 40; star(c, hd.x + Math.cos(a) * rad, hd.y + hh * 0.5 + Math.sin(a) * rad * 0.9, 34 + (n % 3) * 10, n % 2 ? '#FFE15A' : '#FFFFFF', u * 2); } }
}

// ---------------- café (prerendered, softly blurred); the high table is drawn in front of the characters' legs
const BX0 = -2200, BY0 = -3400, BW = 4400, BH = 4800, BS = 0.5;
function drawShop(c) {
  c.fillStyle = '#F3E2C8'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = '#D9B98C'; c.fillRect(BX0, -1250, BW, 990); c.strokeStyle = 'rgba(0,0,0,.08)'; c.lineWidth = 5; for (let x = BX0; x < BX0 + BW; x += 260) { c.beginPath(); c.moveTo(x, -1250); c.lineTo(x, -260); c.stroke(); }
  c.fillStyle = '#5A3A22'; rr(c, -700, -2560, 1900, 170, 22); c.fill(); fitTxt(c, 'COFFEE & CAKE', 250, -2475, 110, '#FFE15A', 1700);
  c.fillStyle = '#8FC8F0'; rr(c, -1500, -2300, 1000, 1000, 22); c.fill(); c.fillStyle = '#CFEAFB'; c.fillRect(-1470, -2270, 940, 520); c.fillStyle = '#9ED7A0'; c.fillRect(-1470, -1750, 940, 420); c.strokeStyle = '#FFFDF8'; c.lineWidth = 22; c.strokeRect(-1500, -2300, 1000, 1000); c.beginPath(); c.moveTo(-1000, -2300); c.lineTo(-1000, -1300); c.moveTo(-1500, -1800); c.lineTo(-500, -1800); c.stroke();
  c.fillStyle = '#3F5A46'; rr(c, 300, -2380, 1000, 1080, 18); c.fill(); fitTxt(c, 'TODAY', 800, -2250, 100, '#FFFDF8', 800); ['LATTE', 'CAPPUCCINO', 'CHEESECAKE', 'HOT TEA'].forEach((t, i) => fitTxt(c, t, 800, -2040 + i * 170, 62, i === 2 ? '#FFE15A' : '#F7F2E8', 860, 'Cav7'));
  c.fillStyle = '#B58A5A'; c.fillRect(BX0, -260, BW, 1700); c.fillStyle = 'rgba(0,0,0,.07)'; for (let y = -260; y < 1400; y += 120) c.fillRect(BX0, y, BW, 6); for (let x = BX0; x < BX0 + BW; x += 380) { c.fillRect(x, -260, 6, 1700); }
  for (const px of [-1900, -1750]) { c.fillStyle = '#B5684A'; rr(c, px - 70, -520, 140, 200, 14); c.fill(); c.fillStyle = '#4C9A5A'; for (const [x, y, r] of [[-30, -620, 70], [40, -660, 80], [0, -740, 70], [-60, -700, 50]]) { c.beginPath(); c.arc(px + x, y, r, 0, TAU); c.fill(); } }
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };   // drawn sharp, blurred once
const BGK = mkBG(drawShop);
function cup(c, x, y, col) { c.fillStyle = col; rr(c, x - 38, y - 80, 76, 80, 14); c.fill(); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 5; c.stroke(); c.beginPath(); c.arc(x + 44, y - 42, 20, -1.3, 1.3); c.stroke(); }
function counter(c, t, L) {
  paint(c, q => { q.m(-1100, CT); q.l(1250, CT); q.l(1250, CT + 70); q.l(-1100, CT + 70); q.z(); }, '#E8D3B0', { sd: 6, hd: 3, lw: 4 });
  paint(c, q => { q.m(-1080, CT + 70); q.l(1230, CT + 70); q.l(1230, 700); q.l(-1080, 700); q.z(); }, '#7A5A3A', { sd: 10, hd: 4, lw: 4 }); c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 5; for (let x = -800; x < 1230; x += 290) { c.beginPath(); c.moveTo(x, CT + 70); c.lineTo(x, 700); c.stroke(); }
  cup(c, -180, CT, '#FFFDF8'); cup(c, 140, CT, '#F28C8C');
  c.fillStyle = '#F7F2E8'; rr(c, -40, CT - 60, 110, 60, 10); c.fill(); c.fillStyle = '#C23C4A'; c.beginPath(); c.arc(15, CT - 66, 14, 0, TAU); c.fill(); }   // cake

// ---------------- characters
const gest = (st, g, who, t, side, base) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } };
const hang = (g, s) => reach(g, s, s * g.sw * 0.8, g.ySh + 330);
const chest = (g, s, k = 0.6) => reach(g, s, s * g.sw * k, g.ySh + 230);
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { t, talk: talk('her', t), mood: 'neutral', turn: 0.3, look: 0.7, armL: hang(g, -1), armR: hang(g, 1), items: {} };
  if (L === 'hook') { st.mood = 'happy'; if (t > hev('panic') - 0.05) { st.mood = 'worried'; st.blink = 0; st.armL = chest(g, -1); st.armR = chest(g, 1); } }
  if (L === 'A1') { st.mood = 'smug'; if (speaking('a1_h', t, 0.05, 0.3)) gest(st, g, 'her', t, -1, 150); if (t > e('cloud') - 0.05) { st.mood = 'shock'; st.blink = 0; st.armL = hang(g, -1); st.armR = hang(g, 1); } }
  if (L === 'A2') { st.mood = 'happy'; if (speaking('a2_h', t, 0.05, 0.3)) { st.laugh = true; gest(st, g, 'her', t, -1, 150); } if (t > e('nose') - 0.05) { st.mood = 'surprised'; st.blink = 0; st.laugh = false; st.armL = hang(g, -1); st.armR = hang(g, 1); } }
  if (L === 'B1') { st.mood = 'neutral'; if (speaking('b1_h', t, 0.05, 0.3)) { st.mood = 'happy'; gest(st, g, 'her', t, -1, 160); } if (t > e('hearts') - 0.05) { st.mood = 'happy'; st.laugh = true; } }
  if (L === 'B2') { st.mood = 'neutral'; if (speaking('b2_h', t, 0.05, 0.3)) { st.mood = 'smug'; gest(st, g, 'her', t, -1, 150); } if (t > e('tea') - 0.05) { st.mood = 'surprised'; st.blink = 0; } }
  if (L === 'C1') { st.mood = 'neutral'; if (speaking('c1_h', t, 0.05, 0.3)) { st.mood = 'happy'; gest(st, g, 'her', t, -1, 160); } if (t > e('model') - 0.05) { st.mood = 'happy'; st.laugh = true; } }
  if (L === 'C2') { st.mood = 'happy'; st.turn = 0.4; st.look = 0.6;
    if (speaking('c2_h', t, 0.05, 0.1)) { st.mood = 'smug'; st.armL = chest(g, -1, 0.3); st.armR = chest(g, 1, 0.3); }
    if (t > endOf('c2_h') + 0.1) { st.mood = 'neutral'; st.blink = 0; }
    if (t > e('wig') - 0.05) { st.mood = 'surprised'; st.blink = 0; }
    if (t > e('stare') - 0.05) { st.mood = 'shock'; st.blink = 0; st.armL = hang(g, -1); st.armR = hang(g, 1); }
    if (speaking('c2_h2', t, 0.05, 0.6)) { st.mood = 'sad'; st.blink = 1; st.armL = hang(g, -1); st.armR = hang(g, 1); } }
  return st; }
function friState(t, L) { const g = G.friend, e = k => ev(L, k), st = { t, talk: talk('friend', t), mood: 'happy', turn: -0.35, look: -0.8, armL: hang(g, -1), armR: hang(g, 1), items: {}, headX: 0 };
  if (L === 'hook') { st.turn = -0.2; st.look = -0.5; st.mood = 'happy'; st.armR = reach(g, 1, g.hw * 1.7, g.headY + g.hh * 0.2); if (t > hev('panic') - 0.05) st.mood = 'neutral'; }
  if (L === 'A1') { st.mood = 'happy'; if (speaking('a1_f', t, 0.0, 0.3)) st.mood = 'sad'; if (t > e('cloud') - 0.05) { st.mood = 'sad'; st.blink = 0; } }
  if (L === 'A2') { st.mood = 'neutral'; if (speaking('a2_f', t, 0.0, 0.3)) st.mood = 'surprised'; if (t > e('nose') - 0.05) { st.mood = 'surprised'; st.blink = 0; st.armR = reach(g, 1, g.hw * 0.3, g.headY + g.hh * 0.4); } }
  if (L === 'B1') { st.mood = 'neutral'; if (speaking('b1_f', t, 0.0, 0.3)) { st.mood = 'happy'; st.laugh = true; } if (t > e('hearts') - 0.05) { st.mood = 'happy'; st.laugh = true; st.armL = chest(g, -1, 0.3); st.armR = chest(g, 1, 0.3); } }
  if (L === 'B2') { st.mood = 'neutral'; if (speaking('b2_f', t, 0.0, 0.3)) st.mood = 'skeptical'; if (t > e('tea') - 0.05) { st.mood = 'skeptical'; st.blink = 0; } }
  if (L === 'C1') { st.mood = 'neutral'; if (speaking('c1_f', t, 0.0, 0.3)) st.mood = 'happy'; if (t > e('model') - 0.05) { st.mood = 'smug'; st.armR = reach(g, 1, g.sw * 1.5, g.ySh + 230, { planar: true }); st.armL = reach(g, -1, -g.sw * 1.1, g.ySh + 200, { planar: true }); } }
  if (L === 'C2') { st.mood = 'happy';
    if (t > e('think') - 0.05) { st.mood = 'neutral'; st.blink = 0; st.armR = reach(g, 1, g.hw * 0.5, g.headY + g.hh * 0.8); st.lookY = -0.3; }
    if (speaking('c2_f', t, 0.05, 0.1)) { st.mood = 'happy'; st.lookY = 0; st.armR = hang(g, 1); }
    if (t > e('wig') - 0.05) { st.mood = 'happy'; st.laugh = true; st.armR = hang(g, 1); st.armL = reach(g, -1, -g.sw * 1.7, g.ySh - 60, { planar: true }); st.items = { L: wigItem }; }
    if (t > e('stare')) st.mood = 'smug'; }
  return st; }
const friCfg = (t, L) => (L === 'C2' && t > ev('C2', 'wig') - 0.05) ? BAR2 : BAR;

// ---------------- the world + which characters a shot draws (clean singles: only the tagged character)
const DRAW = { wide: ['her', 'friend'], card: ['her', 'friend'], two: ['her', 'friend'], her: ['her'], friend: ['friend'], cover: ['her', 'friend'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGK, BX0, BY0, BW, BH);
  if (who.includes('friend')) { if (friCfg(t, L) === BAR) puff(c, G.friend, BX, t); heads.friend = K.put(c, friCfg(t, L), friState(t, L), BX, 0); }
  counter(c, t, L);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), HX, 0);
  if (!heads.friend) heads.friend = OFF; if (!heads.her) heads.her = OFFL;
  return heads; }

// ---------------- shots (world coordinates; face of a single at ~900 px)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const hHY = G.her.headY, dHY = G.friend.headY;
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(100, -1950 + 320 / 0.78, 0.78, 'cover'), WIDE: S(20, -1000, 0.5, 'wide'), CARD: S(20, fy(dHY, 0.66, 980), 0.66, 'card'), TWO: S(20, fy(dHY, 0.75, 820), 0.75, 'two'),
  HER: S(HX + 40, fy(hHY, 1.0), 1.0, 'her'), HER_R: S(HX + 40, fy(hHY, 1.0, 1120), 1.0, 'her'), HER_CU: S(HX + 30, fy(hHY, 1.6, 960), 1.6, 'her'),
  FRI: S(BX - 20, fy(dHY, 0.8, 1000), 0.8, 'friend'), FRI_H: S(BX - 20, fy(dHY, 0.8, 1230), 0.8, 'friend'), HER_H: S(HX + 40, fy(hHY, 1.35, 1280), 1.35, 'her'), FRI_CU: S(BX - 20, fy(dHY, 1.3, 960), 1.3, 'friend') };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  const sp = id => speaking(id, t, 0.1, 0.15);
  if (L === 'hook') { if (t < SP.hook_f.t - 0.12) return SH.COVER; if (t < hev('panic') - 0.05) return f(SH.FRI_H); if (t < SP.hook.t - 0.1) return f(SH.HER_H); return f(SH.COVER); }
  const u = t - sc.s, l = L.toLowerCase(), nar = SP[l + '_nar'];
  if (u < 1.15) return f(SH.WIDE);
  if (L === 'C2' && t > SP.c2_h2.t - 0.1 && t < nar.t - 0.1) return f(SH.HER_CU);   // no black card: stay on her face through the pause
  if (nar && t >= nar.t - 0.1) return f(SH.CARD);
  if (L === 'A1' && t > e('cloud') - 0.05) return f(SH.WIDE);
  if (L === 'A2' && t > e('nose') - 0.05) return f(SH.WIDE);
  if (L === 'B1' && t > e('hearts') - 0.05) return f(SH.WIDE);
  if (L === 'B2' && t > e('tea') - 0.05) return f(SH.WIDE);
  if (L === 'C1' && t > e('model') - 0.05) return f(SH.WIDE);
  if (L === 'C2') { if (sp('c2_h')) { const ch = (TL.cfg.chunks || {}).c2_h, p = SP.c2_h, w = p.words || [], cnt = ch.map(([en]) => en.trim().split(/\s+/).length), tot = cnt.reduce((a, b) => a + b, 0); let wi = 0, i = 0;
      ch.forEach((q, k) => { const a = w.length === tot ? p.t + w[wi][1] : p.t + p.d * k / ch.length; if (t >= a - 0.05) i = k; wi += cnt[k]; }); return f([SH.HER, SH.HER_CU, SH.HER, SH.HER_CU][i] || SH.HER); }
    if (t > endOf('c2_h') && t < e('think') + 0.9) return f(SH.WIDE); if (t >= e('think') + 0.9 && t < SP.c2_f.t - 0.1) return f(SH.FRI_CU);
    if (t > e('wig') - 0.05 && t < SP.c2_h2.t - 0.1) return f(SH.WIDE); if (sp('c2_f')) return f(SH.FRI); }
  const cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.1 && t < s.t + s.d + 0.25);
  const single = who => who === 'her' ? SH.HER : SH.FRI;
  if (cur) return f(single(cur.who));
  const next = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.6 && t < s.t);
  if (next) return f(single(next.who));
  return SH.TWO; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- cover badge + frame
function coverBadge(c, t) { const p = 1 + 0.04 * Math.sin(t * 8); c.save(); c.translate(540, 1500); c.scale(p * 1.12, p * 1.12); c.rotate(-0.03); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -330 + 6, -62 + 10, 660, 124, 62); c.fill(); c.fillStyle = '#FFE15A'; rr(c, -330, -62, 660, 124, 62); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; rr(c, -330, -62, 660, 124, 62); c.stroke();
  fitTxt(c, 'LIKE MY HAIR?', 0, 4, 54, '#E0474C', 600); c.restore(); }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { K.outro(c, t, { q: ['А КАК БЫ ТЫ СКАЗАЛ', 'ПОДРУГЕ ПРО ПРИЧЁСКУ?'], rows: [['A2', "It's a bold look!"], ['B1', "It's not really my style."], ['B2', "Not my cup of tea."], ['C1', "It suits you, but I couldn't pull it off."]], cta: ['ОТПРАВЬ ПОДРУГЕ,', 'КОТОРАЯ СПРАШИВАЕТ'], heroX: 190, heroS: 0.42,
    hero: (cc, tt) => { const g = G.her, gd = G.friend; K.put(cc, BAR2, { t: tt, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, armL: reach(gd, -1, -gd.sw * 2.0, gd.ySh - 330 + Math.sin(tt * 8) * 30, { planar: true }), armR: hang(gd, 1), items: { L: wigItem } }, 1500, 60);
      K.put(cc, HER, { t: tt, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(tt * 8) * 30, { planar: true }), armR: hang(g, 1), items: {} }, 0, 0); } });
    Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj, WM;
  { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; WM = M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26); }
  const names = { friend: ['FRIEND', '#C23C7A'] };
  if (L === 'hook') { if (tag === 'cover') coverBadge(c, t);
    const hookProj = p => { const q = proj(p); return q.x < 0 || q.x > W ? { x: q.x < 0 ? 60 : W - 60, y: 1050 } : q; };
    K.bubbles(c, t, { id: 'hook' }, heads, hookProj, { cleanChunks: true, names, hold: { hook_f: 0.05, hook_h: 0.3 } }); K.titleRibbon(c, t, 540, 455); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); UI.captions(c, t);
    Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  const e = k => ev(L, k), narT = (SP[L.toLowerCase() + '_nar'] || { t: 1e9 }).t;
  if (L === 'A1' && t > e('cloud') && t < narT - 0.1) K.pop(c, t, 'ДОЖДЬ ИЗ СЛЁЗ!', e('cloud') + 0.05, narT - 0.2, 540, 1330, C.gold, -0.06, 66);
  if (L === 'A2' && t > e('nose') && t < narT - 0.1) K.pop(c, t, 'КЛОУН?!', e('nose') + 0.05, narT - 0.2, 540, 1330, C.gold, -0.06, 90);
  if (L === 'B1' && t > e('hearts') && t < narT - 0.1) K.pop(c, t, 'ЧЕСТНО — И ТЕПЛО!', e('hearts') + 0.05, narT - 0.2, 540, 1330, C.gold, -0.06, 60);
  if (L === 'B2' && t > e('tea') && t < narT - 0.1) K.pop(c, t, 'ЧАЙ?!', e('tea') + 0.1, narT - 0.2, 540, 1330, C.gold, -0.06, 90);
  if (L === 'C1' && t > e('model') && t < narT - 0.1) K.pop(c, t, 'ТОП-МОДЕЛЬ!', e('model') + 0.1, narT - 0.2, 540, 1330, C.gold, -0.06, 80);
  if (L === 'C2') { if (t > e('think') && t < SP.c2_f.t - 0.05) K.dots(c, t, e('think') + 0.05, SP.c2_f.t - 0.05, 1450);
    if (t > e('wig') && t < SP.c2_h2.t - 0.05) K.pop(c, t, 'ЭТО ПАРИК?!', e('wig') + 0.1, SP.c2_h2.t - 0.1, 540, 1330, C.gold, -0.06, 90); }
  K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names, hold: { a1_f: 0, b1_h: 0.05, b1_f: 0, a2_f: 0, b2_f: 0, c1_f: 0, c2_f: 0.3, c2_h2: 0.6 } });
  c.save(); c.setTransform(WM.a, WM.b, WM.c, WM.d, WM.e, WM.f); if (tag !== 'her') headGags(c, t, L, heads.friend); c.restore();   // gags on top of the speech bubbles
  K.hud(c, t, sc);
}
E.run('newhair', NF, renderFrame);
