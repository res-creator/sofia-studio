// "Stepped on my foot on the Tube" episode renderer: node sorry.js start end out.mp4 | --png=f1,f2
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, shade, rgba, paint, rr, human, items, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/sorry/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SC, SP, sceneAt, C, LVCOL } = UI;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS);
const talk = (who, t) => { let a = 0; for (const s of TL.speech) if (s.who === who && t >= s.t && t < s.t + s.d) { const i = Math.floor((t - s.t) * FPS); a = Math.max(a, s.env[Math.min(i, s.env.length - 1)] || 0); } return a; };
const speaking = (id, t, pre = 0, post = 0) => SP[id] && t >= SP[id].t - pre && t < SP[id].t + SP[id].d + post;
const endOf = id => SP[id].t + SP[id].d;
const TAU = Math.PI * 2;
const lvEv = L => (SC[L] && SC[L].ev) || {};
const wordT = (id, w) => { const s = SP[id]; if (!s) return null; const x = s.words.find(q => q[0].toLowerCase().replace(/[«»!?.,:]/g, '').startsWith(w)); return x ? s.t + x[1] : null; };

// ---------------- cast (original characters, loosely inspired by familiar archetypes)
const CAST = { ...BASE };
CAST.her_sorry = { ...BASE.her_restaurant, top: { type: 'sweater', col: '#2E4A7A' }, bottom: { type: 'jeans', col: '#2B2F3A' }, necklace: false };
CAST.bruno = { ...BASE.mike };
CAST.thorn = { kind: 'human', h: 1500, seed: 60, skin: '#F4E4DA', iris: '#2A2A3A', lashes: true, lips: '#5A2A3A', brow: '#14101A', hair: { style: 'long', col: '#14101A' }, build: { shoulder: 0.82, arm: 0.9 }, top: { type: 'longsleeve', col: '#15151A' }, bottom: { type: 'skirt', col: '#15151A' }, shoes: { col: '#0E0E12', acc: null } };
CAST.peggy = { ...BASE.agnes };
CAST.hollis = { ...BASE.albert, top: { type: 'coat', col: '#9A7E50' }, bottom: { type: 'trousers', col: '#3A3228' } };
CAST.otto = { ...BASE.oliver, top: { type: 'coat', col: '#2E5AA6' }, bottom: { type: 'trousers', col: '#3A3F4B' } };
CAST.reggie = { ...BASE.reggie };
const WHO = { A1: 'bruno', A2: 'thorn', B1: 'peggy', B2: 'hollis', C1: 'otto', C2: 'reggie', hook: 'bruno', outro: 'reggie' };
const ST = { bruno: 0, thorn: 2600, peggy: 5200, hollis: 7800, otto: 10400, reggie: 13000 };
const NAMES = { bruno: ['BRUNO', '#E0474C'], thorn: ['THORN', '#2B2F3A'], peggy: ['PEGGY', '#8E78C8'], hollis: ['HOLLIS', '#9A7E50'], otto: ['OTTO', '#2E5AA6'], reggie: ['REGGIE', '#1E1E24'] };
const HERX = 600, NBX = -180, FY = 60;
const HER = CAST.her_sorry;
const G = { her: geom(HER) }; for (const k of Object.keys(ST)) G[k] = geom(CAST[k]);

// ---------------- background: a London Underground carriage (prerendered, blurred)
const BX0 = -1800, BY0 = -2700, BW = 17400, BH = 3500, BS = 0.5, FLOOR = -380;
const LINE = { bruno: '#E0474C', thorn: '#2B2F3A', peggy: '#3C8FE0', hollis: '#8A8F9A', otto: '#2F9A5A', reggie: '#3C6FB4' };
function seatRow(c, x, y, w, col) { c.fillStyle = col; rr(c, x, y - 320, w, 330, 40); c.fill(); c.fillStyle = shade(col, 0.82); c.fillRect(x, y - 20, w, 30); c.fillStyle = 'rgba(255,255,255,.18)'; for (let k = 0; k < Math.floor(w / 70); k++) { c.beginPath(); c.arc(x + 35 + k * 70, y - 200 + (k % 2) * 70, 10, 0, TAU); c.fill(); } }
function station(c, who, x0, i) {
  const L = x0 - 1300, lc = LINE[who];
  c.fillStyle = '#E9E5DB'; c.fillRect(L, -2700, 2600, FLOOR + 2700);
  c.fillStyle = shade('#E9E5DB', 0.92); c.fillRect(L, -2700, 2600, 480); // ceiling band
  c.fillStyle = lc; c.fillRect(L, -2230, 2600, 40);
  // windows with tunnel lights streaking
  for (let k = 0; k < 4; k++) { const wx = L + 80 + k * 640; c.fillStyle = '#C9CED6'; rr(c, wx - 14, -2060, 600, 640, 30); c.fill(); c.fillStyle = '#10141F'; rr(c, wx, -2046, 572, 612, 22); c.fill();
    for (let s = 0; s < 7; s++) { c.fillStyle = ['#FFE9A0', '#FFFFFF', '#8EC8EE'][s % 3]; c.globalAlpha = 0.7; c.fillRect(wx + hash(i * 9 + k * 3 + s) * 480, -2000 + s * 80 + hash(s + k) * 30, 70 + hash(s) * 80, 10); } c.globalAlpha = 1; }
  // line map poster
  c.fillStyle = '#FFFDF8'; rr(c, x0 - 360, -1380, 720, 130, 14); c.fill(); c.strokeStyle = lc; c.lineWidth = 14; c.beginPath(); c.moveTo(x0 - 320, -1315); c.lineTo(x0 + 320, -1315); c.stroke(); for (let k = 0; k < 7; k++) { c.fillStyle = '#FFFDF8'; c.strokeStyle = '#2B2F3A'; c.lineWidth = 5; c.beginPath(); c.arc(x0 - 300 + k * 100, -1315, 14, 0, TAU); c.fill(); c.stroke(); }
  // hanging straps
  for (let k = 0; k < 9; k++) { const sx = L + 120 + k * 280; c.strokeStyle = '#6A6F7A'; c.lineWidth = 8; c.beginPath(); c.moveTo(sx, -2190); c.lineTo(sx, -1900); c.stroke(); c.strokeStyle = '#B8BCC6'; c.lineWidth = 12; c.beginPath(); c.arc(sx, -1840, 56, 0, TAU); c.stroke(); }
  // seats at the sides
  seatRow(c, L + 20, -700, 700, '#2E4A9A'); seatRow(c, L + 1880, -700, 700, '#2E4A9A');
  // poles
  for (const px of [x0 - 620, x0 + 700]) { c.fillStyle = '#F2C14E'; c.fillRect(px, -2230, 22, 1860); c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(px + 4, -2230, 6, 1860); }
  // floor
  c.fillStyle = '#6A6F7A'; c.fillRect(L, FLOOR, 2600, 1200); c.fillStyle = '#F2C14E'; c.fillRect(L, FLOOR + 10, 2600, 14);
  c.fillStyle = 'rgba(255,255,255,.08)'; for (let k = 0; k < 12; k++) c.fillRect(L + k * 220, FLOOR + 30, 90, 800);
}
function drawRoom(c) { c.fillStyle = '#E9E5DB'; c.fillRect(BX0, BY0, BW, BH); Object.keys(ST).forEach((w, i) => station(c, w, ST[w], i)); }
const BGS = createCanvas(Math.round(BW * BS), Math.round(BH * BS)), bgc = BGS.getContext('2d');
bgc.scale(BS, BS); bgc.translate(-BX0, -BY0); drawRoom(bgc);
const BGB = createCanvas(BGS.width, BGS.height); { const c = BGB.getContext('2d'); c.filter = 'blur(2.5px)'; c.drawImage(BGS, 0, 0); }

// ---------------- props
function sparkleAt(c, x, y, k, t, col = '#FFE9A0') { if (k <= 0 || k >= 1) return; c.save(); c.globalAlpha = 1 - k; c.fillStyle = col; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + t * 2, r = 30 + 120 * k; UI.star(c, x + Math.cos(a) * r, y + Math.sin(a) * r, 20, a); } c.restore(); }
function shoe(c, x, y, s = 1, col = '#2B2F3A') { c.save(); c.translate(x, y); c.scale(s, s); paint(c, q => { q.m(-110, 0); q.l(80, 0); q.q(150, -10, 150, -60); q.q(150, -110, 60, -110); q.l(-70, -150); q.l(-110, -150); q.z(); }, col, { sd: 8, hd: 5, lw: 4 }); c.fillStyle = '#1A1C22'; c.fillRect(-110, -4, 260, 18); c.restore(); }
function bolt(c, x, y, k, t) { if (k <= 0) return; c.save(); c.translate(x, y); c.scale(1 + 0.1 * Math.sin(t * 30), 1 + 0.1 * Math.sin(t * 30)); c.globalAlpha = clamp(1.3 - k); c.fillStyle = '#FFE15A'; c.strokeStyle = '#E0474C'; c.lineWidth = 6; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; c.beginPath(); c.moveTo(Math.cos(a) * 40, Math.sin(a) * 40); c.lineTo(Math.cos(a + 0.2) * (110 + 50 * k), Math.sin(a + 0.2) * (110 + 50 * k)); c.lineTo(Math.cos(a - 0.2) * 70, Math.sin(a - 0.2) * 70); c.closePath(); c.fill(); c.stroke(); } c.restore(); }
function hatDeer(c, g, head) { const x = head.x, y = head.y - g.hh * 0.55, hw = g.hw; paint(c, q => { q.m(x - hw * 1.1, y); q.b(x - hw * 1.2, y - 160, x + hw * 1.2, y - 160, x + hw * 1.1, y); q.q(x, y + 30, x - hw * 1.1, y); q.z(); }, '#8A6A3A', { sd: 8, hd: 4, inner: k => { k.strokeStyle = 'rgba(0,0,0,.22)'; k.lineWidth = 3; for (let i = -5; i <= 5; i++) { k.beginPath(); k.moveTo(x + i * hw * 0.2, y - 140); k.lineTo(x + i * hw * 0.2, y + 10); k.stroke(); } } }); paint(c, q => { q.m(x - hw * 1.25, y + 6); q.l(x - hw * 0.4, y + 6); q.l(x - hw * 0.5, y - 20); q.l(x - hw * 1.2, y - 20); q.z(); }, '#6A4E26', { sd: 3, hd: 2, lw: 3 }); }
function hatRed(c, g, head) { const x = head.x, y = head.y - g.hh * 0.6, hw = g.hw; paint(c, q => q.e(x, y + 6, hw * 1.7, 30), '#C23A3A', { sd: 5, hd: 3 }); paint(c, q => { q.m(x - hw * 0.95, y); q.b(x - hw, y - 160, x + hw, y - 160, x + hw * 0.95, y); q.z(); }, '#C23A3A', { sd: 8, hd: 4, inner: k => { k.fillStyle = '#2B2F3A'; k.fillRect(x - hw, y - 30, hw * 2, 22); } }); }
function bowler(c, g, head) { const x = head.x, y = head.y, hw = g.hw, hh = g.hh; paint(c, q => { q.m(x - hw * 1.25, y - hh * 0.62); q.q(x, y - hh * 0.5, x + hw * 1.25, y - hh * 0.62); q.q(x + hw * 1.3, y - hh * 0.75, x + hw * 1.1, y - hh * 0.75); q.l(x - hw * 1.1, y - hh * 0.75); q.q(x - hw * 1.3, y - hh * 0.75, x - hw * 1.25, y - hh * 0.62); q.z(); }, '#1E1612', { sd: 4, hd: 3, lw: 3 }); paint(c, q => { q.m(x - hw * 0.85, y - hh * 0.72); q.b(x - hw * 0.9, y - hh * 1.55, x + hw * 0.9, y - hh * 1.55, x + hw * 0.85, y - hh * 0.72); q.z(); }, '#2A221C', { sd: 10, hd: 6 }); }
const sandwich = () => (ctx) => { ctx.translate(-10, -10); paint(ctx, q => { q.m(-60, 0); q.l(60, 0); q.l(52, 28); q.l(-52, 28); q.z(); }, '#E8C98A', { sd: 3, hd: 2, lw: 3 }); ctx.fillStyle = '#C2504A'; ctx.fillRect(-56, -10, 112, 12); paint(ctx, q => { q.m(-58, -10); q.l(58, -10); q.l(50, -38); q.l(-50, -38); q.z(); }, '#E8C98A', { sd: 3, hd: 2, lw: 3 }); };
const umbrellaItem = () => (ctx) => { ctx.rotate(0.2); ctx.fillStyle = '#6A4630'; rr(ctx, -8, -240, 16, 300, 6); ctx.fill(); paint(ctx, q => { q.m(-70, -240); q.q(0, -330, 70, -240); q.l(-70, -240); q.z(); }, '#2B2F3A', { sd: 3, hd: 2, lw: 3 }); };
const magnifier = () => (ctx) => { ctx.rotate(-0.6); ctx.fillStyle = '#5A3A22'; rr(ctx, -12, -10, 24, 120, 8); ctx.fill(); ctx.strokeStyle = '#C9A040'; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(0, -70, 56, 0, TAU); ctx.stroke(); ctx.fillStyle = 'rgba(200,230,255,.45)'; ctx.fill(); };
function trolley(c, x, y, roll) { c.save(); c.translate(x, y); paint(c, q => { q.m(-70, 0); q.l(70, 0); q.l(60, -330); q.l(-60, -330); q.z(); }, '#8E78C8', { sd: 8, hd: 4, lw: 4 }); c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(-40, 14, 24, 0, TAU); c.arc(40, 14, 24, 0, TAU); c.fill(); c.strokeStyle = '#6A6F7A'; c.lineWidth = 8; c.beginPath(); c.moveTo(-30, -330); c.lineTo(-30, -520); c.lineTo(30, -520); c.lineTo(30, -330); c.stroke(); c.restore(); }
function suitcase(c, x, y) { c.save(); c.translate(x, y); paint(c, q => { q.m(-120, 0); q.l(120, 0); q.l(120, -300); q.l(-120, -300); q.z(); }, '#8A4A2A', { sd: 10, hd: 5, lw: 4, inner: k => { k.fillStyle = '#C9A040'; k.fillRect(-120, -190, 240, 22); k.fillStyle = '#FFFDF8'; k.fillRect(-60, -250, 120, 40); } }); c.restore(); }
function put(c, cfg, st, x, y = FY, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); const r = human(c, cfg, st); c.restore(); return { x: x + r.head.x * s, y: y + r.head.y * s, hh: r.hh * s, r }; }

// per-character look/behaviour. ev flags: ev.stomp (the step), ev.wheel, ev.rim
function actor(c, t, L, who, x, opt = {}) {
  const g = G[who], cfg = CAST[who], ev = lvEv(L), l = (L || '').toLowerCase();
  const st = { t, talk: talk(who, t), mood: 'happy', turn: 0.35, look: 0.8, armL: reach(g, -1, -g.sw * 0.35, g.ySh + 330), armR: reach(g, 1, g.sw * 0.35, g.ySh + 330) };
  if (speaking(l + '_x', t, 0.05)) { const u = (t - SP[l + '_x'].t) * 4; st.armR = reach(g, 1, g.sw * 1.6 + Math.sin(u) * 30, g.ySh + 280 + Math.cos(u) * 30); }
  if (who === 'bruno') { st.items = { R: items.bottle('#7CF29A') }; st.afterTorso = cc => { cc.fillStyle = '#2B2F3A'; rr(cc, -g.sw * 2.1, g.ySh + 120, 180, 330, 30); cc.fill(); cc.fillStyle = '#E0474C'; cc.fillRect(-g.sw * 2.1 + 20, g.ySh + 180, 140, 24); };
    if (L === 'A1' && speaking('a1_x', t, 0.05, 0.3)) { st.mood = 'worried'; st.armR = reach(g, 1, g.sw * 2.4, g.ySh - 100 + Math.sin(t * 9) * 30); } }
  if (who === 'thorn') { st.mood = 'neutral'; st.look = 0.5; st.afterTorso = cc => { cc.fillStyle = '#F4F0EA'; cc.beginPath(); cc.moveTo(-g.hw * 0.7, g.ySh + 6); cc.lineTo(0, g.ySh + 70); cc.lineTo(g.hw * 0.7, g.ySh + 6); cc.lineTo(g.hw * 0.6, g.ySh - 10); cc.lineTo(-g.hw * 0.6, g.ySh - 10); cc.closePath(); cc.fill(); for (const sd of [-1, 1]) { cc.strokeStyle = '#14101A'; cc.lineWidth = 34; cc.lineCap = 'round'; cc.beginPath(); cc.moveTo(sd * g.hw * 0.95, g.headY + g.hh * 0.5); cc.lineTo(sd * g.sw * 0.95, g.ySh + 230); cc.stroke(); cc.fillStyle = '#EE5E9A'; cc.beginPath(); cc.arc(sd * g.sw * 0.95, g.ySh + 236, 18, 0, TAU); cc.fill(); } };
    st.items = { R: () => (ctx) => { paint(ctx, q => { q.m(-50, -10); q.l(50, -10); q.l(50, 90); q.l(-50, 90); q.z(); }, '#4A2A5A', { sd: 3, hd: 2, lw: 3 }); } };
    if (L === 'A2') { if (speaking('a2_x2', t, 0.05, 0.2)) st.mood = 'smug'; if (SP.a2_x2 && t > endOf('a2_x2')) st.mood = 'neutral'; }
    if (L === 'C2' && SP.c2_c5 && t > SP.c2_c5.t - 0.1) st.mood = 'worried'; }
  if (who === 'peggy') { st.items = { L: umbrellaItem() }; if (L === 'B1') { if (speaking('b1_x', t, 0.05, 0.2)) { st.mood = 'worried'; st.armR = reach(g, 1, g.sw * 1.8 + Math.sin(t * 16) * 40, g.ySh + 20); } } }
  if (who === 'hollis') { st.front = (cc, gg) => hatDeer(cc, g, gg.head); st.items = { R: magnifier() }; if (L === 'B2') { if (speaking('b2_x', t, 0.05, 0.2)) { st.mood = 'smug'; st.armR = reach(g, 1, g.sw * 1.4, g.ySh + 60); } if (ev.rim && t > ev.rim) { st.mood = 'smug'; st.laugh = true; } } }
  if (who === 'otto') { st.front = (cc, gg) => hatRed(cc, g, gg.head); st.items = { R: sandwich() }; if (L === 'C1' && speaking('c1_x', t, 0.05, 0.1)) { st.armR = reach(g, 1, g.sw * 2.6, g.ySh + 60 + Math.sin(t * 10) * 20); } }
  if (who === 'reggie') { st.front = (cc, gg) => bowler(cc, g, gg.head); st.mood = 'neutral'; if (L === 'C2') { const he = endOf('c2_her'); if (SP.c2_her && t > SP.c2_her.t + 2.0) st.mood = 'worried'; if (speaking('c2_x', t, 0.05, 0.3)) { st.mood = 'surprised'; st.tilt = 0.05; } if (SP.c2_her2 && t > SP.c2_her2.t) st.mood = 'worried'; } }
  return put(c, cfg, st, x, FY, opt.s || 1);
}
function herState(t, L) {
  const g = G.her, ev = lvEv(L);
  const st = { t, talk: talk('her', t), mood: 'neutral', turn: -0.45, look: -0.7, armL: reach(g, -1, -g.sw * 0.5, g.ySh + 300), armR: reach(g, 1, g.sw * 0.3, g.ySh + 230) };
  const l = (L || '').toLowerCase(); const hs = SP[l + '_her'];
  if (hs && speaking(l + '_her', t, 0.1)) { st.mood = 'angry'; st.armL = reach(g, -1, -g.sw * 1.9, g.ySh + 140 + Math.sin(t * 12) * 30); }
  if (L === 'A1') { if (hs && t > hs.t - 0.3 && t < hs.t + 0.9) st.mood = 'shock'; }
  if (L === 'A2') { if (SP.a2_x && t > SP.a2_x.t + 0.3) st.mood = 'worried'; if (SP.a2_x2 && t > SP.a2_x2.t) st.mood = 'shock'; }
  if (L === 'B1') { if (SP.b1_x && t > SP.b1_x.t) st.mood = 'worried'; }
  if (L === 'B2') { if (ev.rim && t > ev.rim) st.mood = 'surprised'; }
  if (L === 'C1') { if (speaking('c1_her', t, 0.1)) st.mood = 'worried'; if (speaking('c1_her2', t, 0.1, 0.5)) st.mood = 'worried'; }
  if (L === 'C2') {
    if (speaking('c2_her', t, 0.1)) { st.mood = 'smug'; st.tilt = -0.04; st.armL = reach(g, -1, -g.sw * 1.7 + Math.sin(t * 2.4) * 40, g.ySh + 60 + Math.cos(t * 2.4) * 30); st.items = { L: items.wine(0.0) }; }
    if (t > endOf('c2_her') + 0.2) st.mood = 'neutral';
    if (SP.c2_x && t > SP.c2_x.t + 0.4) st.mood = 'shock';
    if (SP.c2_her2 && t > SP.c2_her2.t - 0.1) st.mood = 'worried';
  }
  if (L === 'outro') { st.mood = 'happy'; st.turn = 0; st.look = 0; st.armL = reach(g, -1, -g.sw * 1.5 + Math.sin(t * 8) * 40, g.headY - 220); st.armR = reach(g, 1, g.sw * 1.0, g.ySh + 300); }
  return st;
}
function drawHer(c, t, L, x, s = 1, y = FY) { return put(c, HER, herState(t, L), x, y, s); }

// --- the "SORRY" counter: counts every "sorry" word spoken so far; the C2 chorus ramps it to 100
const SORRY = []; for (const s of TL.speech) if (s.who !== 'nar' && s.who !== 'tip') for (const w of s.words) if (/sorry/i.test(w[0])) SORRY.push({ t: s.t + w[1], id: s.id });
const CH0 = SP.c2_c1 ? SP.c2_c1.t : 1e9, BOOM = SP.c2_c5 ? SP.c2_c5.t + 0.5 : 1e9;
function sorryN(t) { let n = 0, last = -9; for (const q of SORRY) if (q.t <= t && !q.id.startsWith('c2_c')) { n++; last = q.t; } const base = n;
  if (t >= BOOM) return { n: 100, last: BOOM }; if (t >= CH0) return { n: Math.round(lerp(base, 99, eIn(P(t, CH0, BOOM)))), last: Math.max(last, t - ((t * 12) % 1) / 12) }; return { n, last }; }
function drawCounter(c, t, x = 175, y = 345, force) { const o = force || sorryN(t); const pulse = 1 + 0.28 * Math.exp(-(t - o.last) * 9); c.save(); c.translate(x, y); c.scale(pulse, pulse); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -130 + 5, -36 + 6, 260, 72, 36); c.fill(); c.fillStyle = o.n >= 100 ? '#E0474C' : '#F2C14E'; rr(c, -130, -36, 260, 72, 36); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 5; c.stroke(); UI.font(c, 'Unb9', 34); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('SORRY ×' + o.n, 0, 3); c.restore(); }

function crowd(c, t, x0, alpha = 1) { // the whole car, for the hook and the final chorus
  c.save(); c.globalAlpha = alpha; const who = ['bruno', 'peggy', 'otto', 'hollis', 'thorn'];
  who.forEach((w, i) => { const g = G[w]; const xx = x0 - 560 + i * 300; const open = talk(w, t) > 0.2; const st = { t, talk: talk(w, t), mood: open ? 'shock' : 'worried', turn: i % 2 ? -0.35 : 0.35, look: 0, armL: reach(g, -1, -g.sw * 0.5, g.ySh + 300), armR: reach(g, 1, g.sw * 0.5, g.ySh + 300) }; if (w === 'hollis') st.front = (cc, gg) => hatDeer(cc, g, gg.head); if (w === 'otto') st.front = (cc, gg) => hatRed(cc, g, gg.head); put(c, CAST[w], st, xx, FY + 30, 0.86); }); c.restore(); }

function world(c, t, L) {
  c.drawImage(BGB, BX0, BY0, BW, BH);
  const who = WHO[L], x0 = ST[who]; const heads = {}; const ev = lvEv(L); const l = L.toLowerCase();
  if (who === 'peggy') trolley(c, x0 + NBX - 200 + (ev.wheel && t > ev.wheel ? 340 * eIn(P(t, ev.wheel, ev.wheel + 0.5)) : 0), FY, 0);
  if (who === 'otto') suitcase(c, x0 + NBX - 230, FY);
  heads[who] = actor(c, t, L, who, x0 + NBX);
  heads.her = drawHer(c, t, L, x0 + HERX);
  // the stomp: the offender's shoe lands on her foot
  const hs = SP[l + '_her']; const sw = hs ? hs.t - 0.25 : null;
  if (sw !== null && t > sw - 0.05 && L !== 'C2') { const k = P(t, sw - 0.05, sw + 0.08); const drop = (1 - eOut(k)) * 260; const fade = 1 - P(t, endOf(l + '_x') + 1.2, endOf(l + '_x') + 1.8); c.save(); c.globalAlpha = clamp(fade); shoe(c, x0 + HERX - 150 + 20, FY - drop - 6, 0.62, who === 'thorn' ? '#14101A' : '#4A4F5C'); c.restore(); bolt(c, x0 + HERX - 80, FY - 70, P(t, sw, sw + 0.6), t); }
  if (L === 'C2' && SP.c2_c1 && t > CH0 - 0.2) crowd(c, t, x0 + 150, clamp((t - CH0 + 0.2) / 0.3));
  if (L === 'C2' && t > BOOM) { for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, r = 120 + 520 * P(t, BOOM, BOOM + 1.0); c.globalAlpha = 1 - P(t, BOOM + 0.2, BOOM + 1.2); c.fillStyle = C.gold; UI.star(c, x0 + 200 + Math.cos(a) * r, -1000 + Math.sin(a) * r * 0.8, 26, a); } c.globalAlpha = 1; }
  return heads;
}

function shotFor(t) {
  const sc = sceneAt(t), L = sc.id; const who = WHO[L], x0 = ST[who];
  const herHY = FY + G.her.headY, nbHY = FY + G[who].headY;
  const hx = x0 + HERX, nx = x0 + NBX;
  const two = { x: x0 + 210, y: Math.min(herHY, nbHY) + 160, z: 0.9, r: 0 };
  if (L === 'hook' || L === 'outro') return { x: x0 + 240, y: -1000, z: 0.9, r: 0 };
  const u = t - sc.s;
  if (u < 1.15) return { ...two, z: 0.86, cut: u < 0.85 };
  const l = L.toLowerCase(); const her = l + '_her', oth = l + '_x', nar = l + '_nar';
  const herC = { x: hx - 40, y: herHY + 120, z: 1.45, r: -0.5 }, othC = { x: nx + 40, y: nbHY + 120, z: L === 'C2' ? 1.55 : 1.4, r: 0.5 };
  if (L === 'C2') {
    const he = endOf('c2_her');
    if (t < SP.c2_her.t - 0.2) return { ...two, z: 1.0 };
    if (t < he + 0.1) return { ...herC, z: lerp(1.35, 1.75, P(t, SP.c2_her.t, he)), y: lerp(herHY + 125, herHY + 95, P(t, SP.c2_her.t, he)) };
    if (t < SP.c2_x.t + 1.2) return { ...othC, cut: t < he + 0.15 };
    if (t < SP.c2_her2.t - 0.2) return { ...two, z: 0.95 };
    if (t < SP.c2_c1.t - 0.2) return { ...herC, z: 1.35, y: herHY + 150 };
    if (t < SP.c2_nar.t - 0.1) return { x: x0 + 150, y: -950, z: 0.62, r: 0 };
    return { ...two, z: 0.85, y: two.y + 40 };
  }
  if (L === 'B2' && lvEv(L).rim && t > lvEv(L).rim - 0.3 && t < SP.b2_nar.t - 0.1) return { ...two, z: 0.95 };
  if (speaking(her, t, 0.3, 0.1)) return herC;
  if (SP[nar] && t >= SP[nar].t - 0.15) return { ...two, z: 0.9 };
  if (speaking(oth, t, 0.3, 0.3) || (SP[oth + '2'] && speaking(oth + '2', t, 0.3, 0.3)) || (L === 'C1' && speaking('c1_her2', t, 0.2, 0.2))) return L === 'C1' && speaking('c1_her2', t, 0.2, 0.2) ? herC : othC;
  return two;
}
const CAM = E.simulateCamera(TL, shotFor, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'clank', 'thud']);

// ---------------- NEW opener: the final chaos (SORRY x100) REWINDS to the first step
function vhs(c, t, k) { // k 0..1 rewind intensity
  c.save(); c.globalAlpha = 0.18 * k; c.fillStyle = '#000'; for (let y = 0; y < HH; y += 8) c.fillRect(0, y, W, 3); c.restore();
  c.save(); for (let i = 0; i < 6; i++) { const y = (hash(i + Math.floor(t * 20)) * HH), h = 14 + hash(i * 3) * 40; c.globalAlpha = 0.5 * k; c.fillStyle = i % 2 ? '#FFFFFF' : '#7FD0FF'; c.fillRect(0, y, W, h); c.drawImage(c.canvas, 0, y, W, h, 24 * (hash(i + 5) - 0.5) * 2, y, W, h); } c.restore(); }
function drawHook(c, t) {
  const REW = 2.4, k = clamp(t / REW);
  c.save(); c.translate(540, 960); c.scale(0.62, 0.62); c.translate(-(ST.bruno + 300), 1100); c.drawImage(BGB, BX0, BY0, BW, BH); c.restore();
  c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(0, 0, W, HH);
  // the car: crowd disappears one by one as the tape rewinds
  const who = ['reggie', 'thorn', 'hollis', 'otto', 'peggy', 'bruno'];
  const feet = 1560;
  who.forEach((w, i) => { const gone = (1 - k) > (i + 1) / 7 ? 0 : 1; const vis = i === 5 ? 1 : clamp((REW * (0.2 + 0.1 * (5 - i)) - t) / 0.3 + 0.0) ; if (i < 5 && t > REW * (0.25 + 0.12 * (5 - i))) return; const g = G[w]; const xx = 130 + (i % 3) * 400 + (i > 2 ? 110 : 0); const yy = feet + (i > 2 ? 40 : -140); const op = w === 'bruno' ? 1 : 1; const open = t < REW; const st = { t, talk: open ? 0.7 + 0.3 * Math.sin(t * 30 + i) : 0, mood: open ? 'shock' : 'worried', turn: i % 2 ? -0.35 : 0.35, look: 0, armL: reach(g, -1, -g.sw * 0.4, g.ySh + 290), armR: reach(g, 1, g.sw * 0.4, g.ySh + 290) }; if (w === 'hollis') st.front = (cc, gg) => hatDeer(cc, g, gg.head); if (w === 'otto') st.front = (cc, gg) => hatRed(cc, g, gg.head); if (w === 'reggie') st.front = (cc, gg) => bowler(cc, g, gg.head); c.save(); c.translate(xx, yy + 900); c.scale(0.5, 0.5); human(c, CAST[w], st); c.restore(); });
  { const g = G.her; const st = { t, talk: 0.5, mood: 'shock', turn: 0.35, look: 0.6, armL: reach(g, -1, -g.sw * 0.4, g.ySh + 290), armR: reach(g, 1, g.sw * 0.4, g.ySh + 290)}; c.save(); c.translate(540, 2480); c.scale(0.62, 0.62); human(c, HER, st); c.restore(); }
  // the big shoe on her foot at the end of the rewind
  if (t > REW) { const kk = eBack(P(t, REW, REW + 0.25), 1.8); shoe(c, 470, 1930 - (1 - kk) * 120, 0.52, '#4A4F5C'); bolt(c, 520, 1900, P(t, REW + 0.2, REW + 0.9), t); }
  // counter rewinding 100 -> 0
  drawCounter(c, t, 540, 400, { n: Math.round(100 * (1 - eIO(k))), last: -9 });
  // "how did we get here" caption + rewind marker
  c.save(); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.font(c, 'Unb9', 62); c.globalAlpha = 1 - P(t, REW - 0.2, REW + 0.2); UI.strokeText(c, 'КАК МЫ ДО ЭТОГО', 540, 560, C.white, C.oliveD, 14); UI.strokeText(c, 'ДОШЛИ?', 540, 640, C.pink, C.white, 14);
  const rk = 1 - P(t, REW - 0.1, REW + 0.2); if (rk > 0) { c.globalAlpha = rk * (0.6 + 0.4 * Math.sin(t * 14)); UI.font(c, 'Unb9', 84); UI.strokeText(c, '◀◀ REW', 200, 800, C.red, C.white, 12); } c.restore();
  vhs(c, t, 1 - P(t, REW - 0.3, REW + 0.2));
  // title ribbon
  const rk2 = lerp(0.92, 1, eBack(P(t, 0, 0.35), 1.8)) * (1 + 0.012 * Math.sin(t * 5));
  c.save(); c.translate(540, 1255); c.rotate(-0.05); c.scale(rk2, rk2);
  const lines = TL.cfg.hook_title; c.fillStyle = 'rgba(0,0,0,.22)'; UI.rr(c, -500 + 10, -150 + 14, 1000, 300, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; UI.rr(c, -500, -150, 1000, 300, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 900); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -78); UI.textFit(c, 'Unb9', 110, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 8, C.pink, C.white, 12); UI.textFit(c, 'Unb9', 64, lines[2][0], 900); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 98);
  c.restore();
  UI.levelBar(c, t, { id: 'hook' });
  const stT = SC.hook.stamp_t, sk = P(t, stT - 0.02, stT + 0.15);
  if (sk > 0) { const s2 = lerp(2.6, 1, eOut(sk)); c.save(); c.translate(540, 1745); c.rotate(-0.13); c.scale(s2, s2); c.globalAlpha = clamp(sk * 3); c.fillStyle = 'rgba(255,253,248,.92)'; UI.rr(c, -380, -90, 760, 180, 24); c.fill(); c.strokeStyle = C.pink; c.lineWidth = 14; UI.rr(c, -380, -90, 760, 180, 24); c.stroke(); UI.textFit(c, 'Unb9', 110, TL.cfg.stamp, 700); c.fillStyle = C.pink; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(TL.cfg.stamp, 0, 6); c.restore(); }
}
function drawOutro(c, t) {
  const s = SC.outro.s, u = t - s, o = SP.outro; const { textFit, strokeText, font, rr: R } = UI;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  c.save(); c.translate(150, lerp(2900, 2480, eBack(P(u, 0.4, 0.9), 1.4))); c.scale(0.46, 0.46); drawHer(c, t, 'outro', 0, 1, 0); c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const q = eBack(P(u, 0.25, 0.6), 2.2);
  c.save(); c.translate(540, 300); c.scale(q, q); font(c, 'Unb9', 56); strokeText(c, 'А КАК ОТВЕТИШЬ', 0, -50, C.oliveD, C.white, 14); strokeText(c, 'ТЫ?', 0, 36, C.pink, C.white, 14); c.restore();
  const k = eBack(P(u, 0.7, 1.1), 1.8);
  if (k > 0) { c.save(); c.translate(540, 760); c.scale(k, k); c.fillStyle = 'rgba(0,0,0,.14)'; R(c, -470 + 8, -340 + 12, 940, 700, 34); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; R(c, -470, -340, 940, 700, 34); c.fill(); c.stroke();
    font(c, 'Unb9', 38); c.fillStyle = C.pink; c.textAlign = 'left'; c.fillText('ШПАРГАЛКА', -420, -295);
    const rows = [['A2', "You're standing on my foot."], ['B1', 'No worries!'], ['B2', "You're stepping on my toes."], ['C1', 'I hate to make a fuss, but...'], ['C2', "No, no, I'm sorry!"]];
    rows.forEach(([lv, ph], i) => { const y = -200 + i * 110, kk = eBack(P(u, 1.0 + i * 0.18, 1.35 + i * 0.18), 2.2); if (kk <= 0) return; c.save(); c.translate(0, y); c.scale(kk, kk); c.fillStyle = LVCOL[lv]; R(c, -430, -34, 82, 68, 18); c.fill(); font(c, 'Unb9', 30); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(lv, -389, 3); textFit(c, 'Nun9', 44, ph, 740); c.fillStyle = C.oliveD; c.textAlign = 'left'; c.fillText(ph, -320, 3); c.restore(); });
    c.restore(); }
  const bk = eBack(P(u, 2.4, 2.8), 2.2);
  if (bk > 0) { c.save(); c.translate(540, 1240); c.scale(bk, bk); c.fillStyle = C.gold; R(c, -450, -50, 420, 100, 50); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke(); font(c, 'Unb9', 34); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.fillText('СОХРАНИ', -240, 3);
    c.fillStyle = '#4CAF6A'; R(c, 10, -50, 440, 100, 50); c.fill(); c.strokeStyle = C.oliveD; c.stroke(); c.fillStyle = C.white; font(c, 'Unb9', 24); c.fillText('ОТПРАВЬ ТОМУ, КТО', 230, -12); c.fillText('ИЗВИНЯЕТСЯ ПЕРВЫМ', 230, 20); c.restore(); }
  const ak = eOut(P(t, o.t + 1.3, o.t + 1.6));
  if (ak > 0) { c.save(); c.globalAlpha = ak; c.translate(540, 1370 + Math.sin(t * 7) * 8); font(c, 'Unb9', 40); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.fillText('ПИШИ В КОММЕНТЫ', 0, 0); c.fillStyle = C.pink; c.beginPath(); c.moveTo(-34, 40); c.lineTo(34, 40); c.lineTo(0, 84); c.fill(); c.restore(); }
  const subT = (wordT('outro', 'подпиш') || o.t + 4.0) - 0.35;
  const sk = eBack(P(t, subT, subT + 0.3), 2);
  if (sk > 0) { const click = P(t, subT + 0.8, subT + 0.95), pressed = t > subT + 0.9; c.save(); c.translate(640, 1600); const ss = sk * (1 - 0.08 * Math.sin(click * Math.PI)); c.scale(ss, ss); c.fillStyle = pressed ? C.olive : C.pink; R(c, -250, -58, 500, 116, 58); c.fill(); font(c, 'Unb9', 42); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4); c.restore();
    const mv = eIO(P(t, subT + 0.2, subT + 0.8)); UI.tapCursor(c, lerp(900, 710, mv), lerp(1780, 1630, mv), 1, P(t, subT + 0.85, subT + 1.4));
    if (pressed) { c.fillStyle = C.gold; for (let i = 0; i < 10; i++) { const a = i / 10 * 6.28, r = 120 + 200 * P(t, subT + 0.9, subT + 1.4); c.globalAlpha = 1 - P(t, subT + 0.9, subT + 1.6); UI.star(c, 640 + Math.cos(a) * r * 1.4, 1600 + Math.sin(a) * r, 16, a); } c.globalAlpha = 1; } }
}

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1;
  const sc = sceneAt(t);
  const loopK = clamp((t - (TL.dur - 0.6)) / 0.5); // loop ending: cross-fade back into the opening chaos
  if (sc.id === 'hook') { drawHook(c, t); Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  if (sc.id === 'outro') { drawOutro(c, t); Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); if (loopK > 0) { c.save(); c.globalAlpha = loopK; drawHook(c, 0); c.restore(); } return; }
  const ev = sc.ev || {}; const frozen = ev.freeze && t > ev.freeze && t < ev.freeze + 1.15; const tw = frozen ? ev.freeze : t;
  const f = Math.min(CAM.length - 1, Math.round(tw * FPS)), cam = CAM[f], sh = shake(tw);
  c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y);
  const heads = world(c, tw, sc.id);
  const M = c.getTransform(); c.restore();
  if (frozen) { const k = clamp((t - ev.freeze) / 0.1); c.save(); c.globalAlpha = 0.55 * k; c.fillStyle = '#E8DCC0'; c.globalCompositeOperation = 'color'; c.fillRect(0, 0, W, HH); c.restore(); c.save(); c.globalAlpha = 0.18 * k; c.fillStyle = '#000'; for (let y = 0; y < HH; y += 6) c.fillRect(0, y, W, 2); c.restore(); }
  const gr = c.createLinearGradient(0, 0, 0, HH); gr.addColorStop(0, 'rgba(255,230,190,.08)'); gr.addColorStop(1, 'rgba(60,40,80,.08)'); c.fillStyle = gr; c.fillRect(0, 0, W, HH);
  Hq.vignette(c, W, HH, 0.28);
  const proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f });
  const l = sc.id.toLowerCase();
  const lineIds = TL.speech.filter(x => x.id.startsWith(l + '_') && x.who !== 'nar' && x.who !== 'tip' && !x.id.startsWith('c2_c'));
  const holdFor = sp => { if (sp.id === 'c2_her') return 0.0; const i = lineIds.indexOf(sp); const nx = lineIds[i + 1]; return nx ? Math.max(0.05, Math.min(0.9, nx.t - (sp.t + sp.d) - 0.25)) : 0.9; };
  if (!frozen) for (const sp of lineIds) {
    const hd = sp.who === 'her' ? heads.her : heads[sp.who]; if (!hd) continue;
    if (sp.who === 'her') UI.bubble(c, { ...sp, hold: holdFor(sp) }, t, proj({ x: hd.x - 30, y: hd.y - hd.hh * 1.25 }), 'left');
    else UI.bubble(c, { ...sp, hold: holdFor(sp) }, t, proj({ x: hd.x + 30, y: hd.y - hd.hh * 1.25 }), 'right', NAMES[sp.who]);
  }
  const pop = (txt, t0, t1, x, y, col, rot = -0.08, sz = 84) => { const k = eBack(P(t, t0, t0 + 0.25), 2.4) * (1 - P(t, t1, t1 + 0.3)); if (k > 0) { c.save(); c.translate(x, y); c.rotate(rot); c.scale(k, k); UI.font(c, 'Unb9', sz); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, txt, 0, 0, col, C.oliveD, 16); c.restore(); } };
  if (frozen) pop('*СКРИП ПЛАСТИНКИ*', ev.freeze + 0.05, ev.freeze + 1.0, 540, 1250, C.white, -0.04, 58);
  if (sc.id === 'B2' && ev.rim) pop('БА-ДУМ-ТСС!', ev.rim, ev.rim + 1.3, 540, 1250, C.gold);
  if (sc.id === 'C2') {
    const a = endOf('c2_her') + 0.3, b = SP.c2_x.t - 0.1;
    if (t > a && t < b) { const dots = Math.min(3, Math.floor((t - a) / 0.55) + 1); c.save(); c.globalAlpha = clamp((t - a) / 0.2) * clamp((b - t) / 0.15); UI.font(c, 'Unb9', 150); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, '.'.repeat(dots).padEnd(3, ' '), 540, 1450, C.white, C.oliveD, 16); c.restore(); }
    if (t > BOOM) pop('ВЕСЬ ВАГОН!', BOOM + 0.1, SP.c2_nar.t + 0.6, 540, 1180, '#EE5E9A', -0.06, 100);
  }
  drawCounter(c, t);
  UI.card(c, t, sc); UI.captions(c, t); UI.sparkles(c, t);
  Hq.grain(c, W, HH, t, 0.04);
  UI.levelBar(c, t, sc, 1); UI.watermark(c); UI.levelIntro(c, t, sc); UI.levelIntroNext(c, t);
}
E.run('sorry', NF, renderFrame);
