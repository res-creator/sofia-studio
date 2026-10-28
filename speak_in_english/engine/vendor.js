// "Street vendor: how to say no" episode renderer: node vendor.js start end out.mp4 | --png=f1,f2
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, shade, rgba, paint, rr, human, items, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/vendor/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SC, SP, sceneAt, C, LVCOL } = UI;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS);
const talk = (who, t) => { let a = 0; for (const s of TL.speech) if (s.who === who && t >= s.t && t < s.t + s.d) { const i = Math.floor((t - s.t) * FPS); a = Math.max(a, s.env[Math.min(i, s.env.length - 1)] || 0); } return a; };
const speaking = (id, t, pre = 0, post = 0) => SP[id] && t >= SP[id].t - pre && t < SP[id].t + SP[id].d + post;
const endOf = id => SP[id].t + SP[id].d;
const TAU = Math.PI * 2;
const lvEv = L => (SC[L] && SC[L].ev) || {};
const wordT = (id, w) => { const s = SP[id]; if (!s) return null; const x = s.words.find(q => q[0].toLowerCase().replace(/[«»!?.,:]/g, '').startsWith(w)); return x ? s.t + x[1] : null; };
const EV = k => { for (const L of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']) { const e = lvEv(L)[k]; if (e !== undefined) return e; } return 1e9; };

// ---------------- cast
const CAST = { ...BASE };
CAST.her_v = { ...BASE.her_london };
CAST.rico = { ...BASE.jay };
CAST.rosa = { ...BASE.nana };
CAST.kevin = { ...BASE.mark, top: { type: 'tee', col: '#4CAF6A', text: 'SAVE\nPIGEONS', textCol: '#FFFDF8' } };
CAST.marco = { ...BASE.tony, top: { type: 'tee', col: '#F2C14E' } };
CAST.zora = { ...BASE.margot, top: { type: 'cardigan', col: '#8E5BD6', col2: '#F2C14E' } };
CAST.bigtony = { ...BASE.greg, top: { type: 'tee', col: '#1E1E24' } };
CAST.tourist = { ...BASE.albert, top: { type: 'tee', col: '#EE5E9A' }, bottom: { type: 'shorts', col: '#C9A06A' } };
const WHO = { A1: 'rico', A2: 'rosa', B1: 'kevin', B2: 'marco', C1: 'zora', C2: 'bigtony', hook: 'rico', outro: 'bigtony' };
const ST = { rico: 0, rosa: 2600, kevin: 5200, marco: 7800, zora: 10400, bigtony: 13000 };
const NAMES = { rico: ['RICO', '#3C6FB4'], rosa: ['ROSA', '#E0474C'], kevin: ['KEVIN', '#2F8A4A'], marco: ['MARCO', '#E9A23B'], parrot: ['PARROT', '#2F9A5A'], zora: ['MADAME ZORA', '#8E5BD6'], bigtony: ['BIG TONY', '#1E1E24'], tourist: ['TOURIST', '#EE5E9A'] };
const HERX = 600, NBX = -180, FY = 60;
const HER = CAST.her_v;
const G = { her: geom(HER) }; for (const k of [...Object.keys(ST), 'tourist']) G[k] = geom(CAST[k]);

// ---------------- background: a touristy London street (prerendered, blurred)
const BX0 = -1800, BY0 = -4300, BW = 17400, BH = 5100, BS = 0.5, KERB = -380;
function terrace(c, x, w, i) {
  const cols = ['#F4B8C8', '#9CCBE8', '#F6DB8A', '#A8DCC4', '#C9B4E8', '#F7C29A'];
  const col = cols[i % cols.length], top = -2900 + (i % 2) * 120, base = KERB - 40;
  c.fillStyle = col; c.fillRect(x, top, w, base - top); c.fillStyle = '#FFFDF8'; c.fillRect(x - 6, top - 40, w + 12, 50);
  for (let r = 0; r < 3; r++) for (let k = 0; k < 2; k++) { const wx = x + 110 + k * (w - 360), wy = top + 140 + r * 470; if (wy > base - 900) continue; c.fillStyle = '#FFFDF8'; c.fillRect(wx - 16, wy - 16, 172, 292); c.fillStyle = '#7EA2C4'; c.fillRect(wx, wy, 140, 260); }
  const dx = x + w / 2 - 80; c.fillStyle = ['#1E2A4A', '#8A1C2E', '#2F5A48'][i % 3]; c.fillRect(dx, base - 560, 160, 560);
  c.fillStyle = '#E0474C'; c.fillRect(x + 40, base - 760, w - 80, 120); c.fillStyle = '#FFFDF8'; c.font = '60px Unb9'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(['SOUVENIRS', 'GIFTS', 'LONDON', 'CAFE', 'TICKETS', 'FUDGE'][i % 6], x + w / 2, base - 700);
}
function drawStreet(c) {
  const sg = c.createLinearGradient(0, BY0, 0, -1500); sg.addColorStop(0, '#7FBDE6'); sg.addColorStop(1, '#D8EDF7'); c.fillStyle = sg; c.fillRect(BX0, BY0, BW, 3000);
  let i = 0; for (let x = BX0; x < BX0 + BW; x += 760, i++) terrace(c, x, 760, i);
  for (let x = BX0; x < BX0 + BW; x += 1400) { c.strokeStyle = '#6A4630'; c.lineWidth = 5; c.beginPath(); c.moveTo(x, -2300); c.quadraticCurveTo(x + 700, -2050, x + 1400, -2300); c.stroke(); for (let f = 0; f < 12; f++) { const u = (f + 0.5) / 12, fx = x + u * 1400, fy = -2300 + 4 * 250 * u * (1 - u); c.fillStyle = ['#E0474C', '#FFFDF8', '#3C6FB4'][f % 3]; c.beginPath(); c.moveTo(fx - 40, fy); c.lineTo(fx + 40, fy); c.lineTo(fx, fy + 90); c.fill(); } }
  c.fillStyle = '#9A9488'; c.fillRect(BX0, KERB - 40, BW, 60);
  const pg = c.createLinearGradient(0, KERB, 0, 800); pg.addColorStop(0, '#B8B0A2'); pg.addColorStop(1, '#A39A8A'); c.fillStyle = pg; c.fillRect(BX0, KERB + 20, BW, 800 - KERB);
  c.strokeStyle = 'rgba(0,0,0,.1)'; c.lineWidth = 3; for (let y = KERB + 60, r = 0; y < 800; y += 46 + r * 6, r++) for (let x = BX0 + (r % 2) * 40; x < BX0 + BW; x += 90 + r * 4) { c.beginPath(); c.ellipse(x, y, 38 + r * 2, 16 + r, 0, 0, TAU); c.stroke(); }
}
const BGS = createCanvas(Math.round(BW * BS), Math.round(BH * BS)), bgc = BGS.getContext('2d');
bgc.scale(BS, BS); bgc.translate(-BX0, -BY0); drawStreet(bgc);
const BGB = createCanvas(BGS.width, BGS.height); { const c = BGB.getContext('2d'); c.filter = 'blur(2.5px)'; c.drawImage(BGS, 0, 0); }

// ---------------- props
function sparkleAt(c, x, y, k, t, col = '#FFE9A0') { if (k <= 0 || k >= 1) return; c.save(); c.globalAlpha = 1 - k; c.fillStyle = col; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + t * 2, r = 30 + 120 * k; UI.star(c, x + Math.cos(a) * r, y + Math.sin(a) * r, 20, a); } c.restore(); }
function pigeon(c, x, y, s = 1, t = 0) { c.save(); c.translate(x, y); c.scale(s, s); c.rotate(Math.sin(t * 5) * 0.06); paint(c, q => q.e(0, 0, 70, 46), '#8A8F9A', { sd: 6, hd: 4, lw: 3 }); paint(c, q => q.e(-58, -34, 30, 28), '#9AA0AA', { sd: 3, hd: 2, lw: 3 }); c.fillStyle = '#4FA88A'; c.fillRect(-70, -14, 26, 10); c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(-66, -40, 5, 0, TAU); c.fill(); c.fillStyle = '#E9A23B'; c.beginPath(); c.moveTo(-86, -32); c.lineTo(-104, -28); c.lineTo(-86, -24); c.fill(); c.fillStyle = '#E07A7A'; c.fillRect(-14, 40, 6, 18); c.fillRect(10, 40, 6, 18); c.restore(); }
function parrot(c, x, y, s = 1, t = 0, open = 0) { c.save(); c.translate(x, y); c.scale(s, s); c.rotate(Math.sin(t * 6) * 0.05); paint(c, q => { q.m(30, 10); q.l(70, 120); q.l(40, 120); q.z(); }, '#3C6FB4', { sd: 3, hd: 2, lw: 3 }); paint(c, q => q.e(0, 0, 52, 70), '#2F9A5A', { sd: 6, hd: 4, lw: 3 }); paint(c, q => q.e(-6, -70, 40, 38), '#E0474C', { sd: 4, hd: 3, lw: 3 }); c.fillStyle = '#FFFDF8'; c.beginPath(); c.arc(-18, -78, 12, 0, TAU); c.fill(); c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(-20, -78, 6, 0, TAU); c.fill(); c.fillStyle = '#F2C14E'; c.beginPath(); c.moveTo(-40, -70); c.quadraticCurveTo(-64, -60 + open * 6, -44, -48 + open * 14); c.lineTo(-36, -60); c.fill(); c.restore(); }
function rose(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); c.strokeStyle = '#2F8A4A'; c.lineWidth = 8; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -160); c.stroke(); c.fillStyle = '#4FA86A'; c.beginPath(); c.ellipse(12, -70, 22, 10, 0.5, 0, TAU); c.fill(); paint(c, q => q.e(0, -180, 34, 30), '#E0474C', { sd: 4, hd: 3, lw: 3, inner: k => { k.strokeStyle = 'rgba(120,0,20,.5)'; k.lineWidth = 3; k.beginPath(); k.arc(0, -182, 14, 0.5, 5); k.stroke(); } }); c.restore(); }
function tarot(c, x, y, s = 1, rot = 0, txt = 'NO') { c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); c.fillStyle = '#FFFDF8'; c.strokeStyle = '#8E5BD6'; c.lineWidth = 6; rr(c, -50, -80, 100, 160, 10); c.fill(); c.stroke(); c.fillStyle = '#8E5BD6'; c.font = '46px Unb9'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, 0, 4); c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(0, -50, 10, 0, TAU); c.fill(); c.restore(); }
const braceletItem = (n = 3) => (ctx) => { for (let i = 0; i < n; i++) { ctx.strokeStyle = ['#E0474C', '#F2C14E', '#3C8FE0', '#4CAF6A', '#EE5E9A'][i % 5]; ctx.lineWidth = 9; ctx.beginPath(); ctx.ellipse(0, -36 + i * 13, 34, 11, 0, 0, TAU); ctx.stroke(); } };
const roseItem = () => (ctx) => { rose(ctx, 0, 40, 0.7); };
const clipboard = () => (ctx) => { ctx.rotate(-0.15); paint(ctx, q => { q.m(-60, -90); q.l(60, -90); q.l(60, 70); q.l(-60, 70); q.z(); }, '#C9A06A', { sd: 4, hd: 2, lw: 3, inner: k => { k.fillStyle = '#FFFDF8'; k.fillRect(-48, -70, 96, 130); k.fillStyle = '#9AA0AA'; for (let i = 0; i < 5; i++) k.fillRect(-38, -56 + i * 22, 76, 6); } }); };
const camera = () => (ctx) => { paint(ctx, q => { q.m(-60, -50); q.l(60, -50); q.l(60, 30); q.l(-60, 30); q.z(); }, '#2B2F3A', { sd: 4, hd: 2, lw: 3 }); ctx.fillStyle = '#6A707A'; ctx.beginPath(); ctx.arc(0, -10, 28, 0, TAU); ctx.fill(); ctx.fillStyle = '#9FD8F2'; ctx.beginPath(); ctx.arc(0, -10, 16, 0, TAU); ctx.fill(); };
const card = (txt) => (ctx) => { tarot(ctx, 0, -40, 0.8, -0.2, txt); };
function put(c, cfg, st, x, y = FY, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); const r = human(c, cfg, st); c.restore(); return { x: x + r.head.x * s, y: y + r.head.y * s, hh: r.hh * s, r }; }

// ---------------- what the heroine is "wearing" by time t (the accumulating gag)
function loot(t) { return { brace: t > EV('brace'), rose: t > EV('rose'), stick: t > EV('stick'), pigeon: t > EV('pigeon'), parrot: t > EV('parrot'), card: t > EV('cardno') + 1.6 }; }
const ALL = { brace: true, rose: true, stick: true, pigeon: true, parrot: true, card: true };
function dressHer(st, g, t, lo) {
  if (lo.brace) st.items = { ...(st.items || {}), L: braceletItem(3 + (lo.card ? 3 : 0)) };
  if (lo.rose) st.items = { ...(st.items || {}), R: roseItem() };
  const prevAfter = st.afterTorso; st.afterTorso = cc => { if (prevAfter) prevAfter(cc); if (lo.stick) { cc.save(); cc.translate(g.sw * 0.35, g.ySh + 170); cc.rotate(-0.12); cc.fillStyle = '#F2C14E'; cc.beginPath(); cc.arc(0, 0, 56, 0, TAU); cc.fill(); cc.strokeStyle = '#2B2F3A'; cc.lineWidth = 4; cc.stroke(); cc.fillStyle = '#2B2F3A'; cc.font = '18px Unb9'; cc.textAlign = 'center'; cc.textBaseline = 'middle'; cc.fillText('I SAVED', 0, -12); cc.fillText('A PIGEON', 0, 12); cc.restore(); } if (lo.pigeon && lo.parrot) pigeon(cc, -g.sw * 0.95, g.ySh - 40, 0.75, t); };
  st.front = (cc, gg) => { const hx = gg.head.x, hy = gg.head.y - g.hh * 0.95; if (lo.card) tarot(cc, hx + g.hw * 0.9, gg.head.y - g.hh * 0.35, 0.55, 0.4); if (lo.parrot) parrot(cc, hx, hy - 50, 0.95, t, talk('parrot', t)); else if (lo.pigeon) pigeon(cc, hx, hy - 10, 0.9, t); };
}
function vendorActor(c, t, L, who, x) {
  const g = G[who], cfg = CAST[who], ev = lvEv(L), l = (L || '').toLowerCase();
  const st = { t, talk: talk(who, t), mood: 'happy', turn: 0.35, look: 0.8, armL: reach(g, -1, -g.sw * 0.35, g.ySh + 330), armR: reach(g, 1, g.sw * 0.35, g.ySh + 330) };
  const mine = TL.speech.filter(s => s.who === who && s.id.startsWith(l + '_')); const sp = mine.find(s => t >= s.t - 0.05 && t < s.t + s.d);
  if (sp) { const u = (t - sp.t) * 4; st.armR = reach(g, 1, g.sw * 1.6 + Math.sin(u) * 30, g.ySh + 280 + Math.cos(u) * 30); }
  if (who === 'rico') { st.items = { L: braceletItem(5) }; if (L === 'A1') { if (speaking('a1_x', t, 0.05, 0.6)) { st.armR = reach(g, 1, g.sw * 2.8, g.ySh + 200); st.laugh = true; } if (ev.card && t > ev.card - 0.2) { st.items = { ...st.items, R: items.terminal('£10.00') }; st.armR = reach(g, 1, g.sw * 2.4, g.ySh + 120); st.mood = 'smug'; } } }
  if (who === 'rosa') { st.items = { L: (ctx) => { for (let i = 0; i < 5; i++) rose(ctx, -30 + i * 15, 30, 0.5); } }; if (L === 'A2' && speaking('a2_x2', t, 0.05, 0.4)) { st.mood = 'happy'; st.armR = reach(g, 1, g.sw * 2.6, g.ySh + 140); } }
  if (who === 'kevin') { st.items = { L: clipboard() }; if (L === 'B1' && speaking('b1_x2', t, 0.05, 0.4)) { st.mood = 'happy'; st.laugh = true; st.armL = reach(g, -1, g.sw * 0.4, g.ySh + 140); } }
  if (who === 'marco') { st.items = { L: camera() }; const onShoulder = t < EV('parrot'); if (onShoulder) { const prev = st.front; st.front = (cc, gg) => parrot(cc, gg.head.x + g.sw * 0.9, g.ySh - 70, 0.8, t, 0); } if (L === 'B2' && speaking('b2_x2', t, 0.05, 0.3)) { st.armR = reach(g, 1, g.sw * 2.6, g.ySh + 60); st.mood = 'smug'; } }
  if (who === 'zora') { st.front = (cc, gg) => { paint(cc, q => { q.m(gg.head.x - g.hw * 1.15, gg.head.y - g.hh * 0.2); q.b(gg.head.x - g.hw * 1.3, gg.head.y - g.hh * 1.5, gg.head.x + g.hw * 1.3, gg.head.y - g.hh * 1.5, gg.head.x + g.hw * 1.15, gg.head.y - g.hh * 0.2); q.q(gg.head.x, gg.head.y - g.hh * 0.75, gg.head.x - g.hw * 1.15, gg.head.y - g.hh * 0.2); q.z(); }, '#8E5BD6', { sd: 6, hd: 4, inner: k => { k.fillStyle = '#F2C14E'; for (let i = 0; i < 7; i++) { k.beginPath(); k.arc(gg.head.x - g.hw + i * g.hw * 0.33, gg.head.y - g.hh * 0.45, 8, 0, TAU); k.fill(); } } }); };
    st.mood = 'smug'; if (L === 'C1') { const cT = Math.min(ev.cardno || 1e9, (wordT('c1_x2', 'saw') || 1e9)); if (t > cT - 0.2 && t < EV('cardno') + 1.6) { st.items = { R: card('NO') }; st.armR = reach(g, 1, g.sw * 2.2, g.ySh + 20); } if (speaking('c1_x2', t, 0.05, 0.3)) st.mood = 'neutral'; } }
  if (who === 'bigtony') { st.mood = 'neutral'; st.afterTorso = cc => { cc.strokeStyle = '#F2C14E'; cc.lineWidth = 12; cc.beginPath(); cc.arc(0, g.ySh + 30, g.hw * 0.75, 0.3, Math.PI - 0.3); cc.stroke(); }; st.front = (cc, gg) => { cc.fillStyle = '#14141A'; rr(cc, gg.head.x - g.hw * 0.85, gg.head.y - g.hh * 0.22, g.hw * 0.8, g.hh * 0.3, 10); cc.fill(); rr(cc, gg.head.x + g.hw * 0.05, gg.head.y - g.hh * 0.22, g.hw * 0.8, g.hh * 0.3, 10); cc.fill(); cc.fillRect(gg.head.x - g.hw * 0.1, gg.head.y - g.hh * 0.14, g.hw * 0.2, 8); };
    if (L === 'C2') { if (SP.c2_her && t > SP.c2_her.t + 2.5) st.mood = 'skeptical'; if (speaking('c2_x2', t, 0.1, 1.2)) { st.mood = 'smug'; st.armR = reach(g, 1, g.sw * 2.3, g.ySh + 40); } } }
  return put(c, cfg, st, x);
}
function herState(t, L, lo) {
  const g = G.her;
  const st = { t, talk: talk('her', t), mood: 'worried', turn: -0.45, look: -0.7, armL: reach(g, -1, -g.sw * 0.6, g.ySh + 300), armR: reach(g, 1, g.sw * 0.6, g.ySh + 280) };
  const l = (L || '').toLowerCase(); const mine = TL.speech.filter(s => s.who === 'her' && s.id.startsWith(l + '_')); const sp = mine.find(s => t >= s.t - 0.05 && t < s.t + s.d);
  if (sp) { const gg = Math.sin((t - sp.t) * 4.5); st.armL = reach(g, -1, -g.sw * 1.6 + gg * 40, g.ySh + 200 - Math.abs(gg) * 50); st.mood = 'neutral'; }
  if (L === 'A1' && speaking('a1_her', t, 0.05)) { st.mood = 'angry'; st.armL = reach(g, -1, -g.sw * 2.4, g.ySh + 60 + Math.sin(t * 12) * 30); }
  if (L === 'B2' && SP.b2_p && t > SP.b2_p.t - 0.2 && t < endOf('b2_p') + 1.0) { st.mood = 'shock'; st.look = 0; st.lookY = -0.8; }
  if (L === 'C1' && speaking('c1_x2', t, 0.05, 0.6)) st.mood = 'shock';
  if (L === 'C2') { if (speaking('c2_her', t, 0.1)) { st.mood = 'smug'; st.tilt = -0.04; } if (SP.c2_t && t > SP.c2_t.t) { st.mood = 'surprised'; st.turn = 0.35; st.look = 0.8; } if (SP.c2_her2 && t > SP.c2_her2.t - 0.1) { st.mood = 'smug'; st.armR = reach(g, 1, g.sw * 2.2, g.ySh + 40); } }
  if (L === 'outro' || L === 'hook') { st.mood = L === 'hook' ? 'worried' : 'happy'; st.turn = 0; st.look = 0; }
  dressHer(st, g, t, lo);
  return st;
}
function drawHer(c, t, L, x, s = 1, y = FY, lo = null) { return put(c, HER, herState(t, L, lo || loot(t)), x, y, s); }

// ---------------- money counter (spent so far; at the sale it flips to earned)
const PAYS = [['A1', 10], ['A2', 5], ['B1', 3], ['B2', 10], ['C1', 5]].map(([L, v]) => ({ t: lvEv(L).pay, v })).filter(p => p.t !== undefined);
function money(t) { let s = 0, last = -9; for (const p of PAYS) if (t >= p.t) { s += p.v; last = p.t; } const sale = EV('sale'); return { spent: s, last: Math.max(last, t >= sale ? sale : -9), sold: t >= sale }; }
function drawMoney(c, t, x = 190, y = 345, force) { const o = force || money(t); const pulse = 1 + 0.28 * Math.exp(-(t - o.last) * 9); c.save(); c.translate(x, y); c.scale(pulse, pulse); const txt = o.sold ? 'ЗАРАБОТАНО +£15' : 'ПОТРАЧЕНО £' + o.spent; UI.font(c, 'Unb9', 30); const w = Math.max(260, c.measureText(txt).width + 60); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -w / 2 + 5, -36 + 6, w, 72, 36); c.fill(); c.fillStyle = o.sold ? '#4CAF6A' : '#F2C14E'; rr(c, -w / 2, -36, w, 72, 36); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 5; c.stroke(); c.fillStyle = o.sold ? C.white : C.oliveD; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, 0, 3); c.restore(); }

function world(c, t, L) {
  c.drawImage(BGB, BX0, BY0, BW, BH);
  const who = WHO[L], x0 = ST[who]; const heads = {}; const ev = lvEv(L);
  if (who === 'zora') { c.fillStyle = '#5A2A6A'; rr(c, x0 + NBX + 300, FY - 560, 280, 560, 20); c.fill(); paint(c, q => q.e(x0 + NBX + 440, FY - 650, 90, 90), '#BFE3F7', { sd: 6, hd: 4, lw: 4 }); }
  heads[who] = vendorActor(c, t, L, who, x0 + NBX);
  heads.her = drawHer(c, t, L, x0 + HERX);
  heads.parrot = { x: heads.her.x, y: heads.her.y - 260, hh: heads.her.hh * 0.5 };
  if (L === 'C2' && SP.c2_t && t > SP.c2_t.t - 0.8) { const k = eOut(P(t, SP.c2_t.t - 0.8, SP.c2_t.t)); const g = G.tourist; const st = { t, talk: talk('tourist', t), mood: 'happy', turn: -0.45, look: -0.8, armL: reach(g, -1, -g.sw * 1.6, g.ySh + 120), armR: reach(g, 1, g.sw * 0.4, g.ySh + 300), items: { R: camera() } }; heads.tourist = put(c, CAST.tourist, st, x0 + HERX + lerp(900, 420, k)); }
  if (L === 'A1' && ev.brace) sparkleAt(c, x0 + HERX - 240, -700, P(t, ev.brace, ev.brace + 0.8), t);
  if (L === 'C2' && ev.sale) sparkleAt(c, x0 + HERX + 160, -900, P(t, ev.sale, ev.sale + 1.0), t, '#7CF29A');
  return heads;
}

function shotFor(t) {
  const sc = sceneAt(t), L = sc.id; const who = WHO[L], x0 = ST[who];
  const herHY = FY + G.her.headY, nbHY = FY + G[who].headY;
  const hx = x0 + HERX, nx = x0 + NBX;
  const two = { x: x0 + 210, y: Math.min(herHY, nbHY) + 160, z: 0.9, r: 0 };
  if (L === 'hook' || L === 'outro') return { x: x0 + 240, y: -1000, z: 0.9, r: 0 };
  const u = t - sc.s; if (u < 1.15) return { ...two, z: 0.86, cut: u < 0.85 };
  const l = L.toLowerCase(); const ev = sc.ev || {};
  const herC = { x: hx - 150, y: herHY + 170, z: 1.22, r: -0.5 }, othC = { x: nx + 200, y: nbHY + 170, z: L === 'C2' ? 1.3 : 1.22, r: 0.5 };
  const nar = SP[l + '_nar'];
  if (L === 'C2') { const he = endOf('c2_her'); if (t < SP.c2_her.t - 0.2) return speaking('c2_x', t, 0.3, 0.2) ? othC : { ...two, z: 1.0 }; if (t < he + 0.1) return { ...herC, z: lerp(1.3, 1.6, P(t, SP.c2_her.t, he)), y: lerp(herHY + 140, herHY + 110, P(t, SP.c2_her.t, he)) }; if (t < SP.c2_t.t - 0.9) return { ...othC, cut: t < he + 0.15 }; if (t < SP.c2_her2.t - 0.1) return { x: hx + 230, y: herHY + 200, z: 1.15, r: 0 }; if (t < SP.c2_x2.t - 0.2) return { x: hx - 100, y: herHY + 200, z: 1.05, r: 0 }; if (t < nar.t - 0.1) return { x: x0 + 330, y: herHY + 260, z: 0.92, r: 0 }; return { ...two, z: 0.85, y: two.y + 40 }; }
  if (L === 'B2' && SP.b2_p && t > SP.b2_p.t - 0.3 && t < nar.t - 0.1) return { x: hx - 20, y: herHY - 60, z: 1.25, r: 0 };
  if (nar && t >= nar.t - 0.15) return { ...two, z: 0.9 };
  const cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.3 && t < s.t + s.d + 0.2);
  if (cur) return cur.who === 'her' ? herC : othC;
  return two;
}
const CAM = E.simulateCamera(TL, shotFor, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft']);

// ---------------- opener: the final look (covered in stuff) REWINDS to the start
function vhs(c, t, k) { if (k <= 0) return; c.save(); c.globalAlpha = 0.18 * k; c.fillStyle = '#000'; for (let y = 0; y < HH; y += 8) c.fillRect(0, y, W, 3); c.restore(); c.save(); for (let i = 0; i < 6; i++) { const y = hash(i + Math.floor(t * 20)) * HH, h = 14 + hash(i * 3) * 40; c.globalAlpha = 0.45 * k; c.fillStyle = i % 2 ? '#FFFFFF' : '#7FD0FF'; c.fillRect(0, y, W, h); } c.restore(); }
function drawHook(c, t) {
  const REW = 2.4, k = clamp(t / REW);
  c.save(); c.translate(540, 960); c.scale(0.62, 0.62); c.translate(-(ST.rico + 300), 1100); c.drawImage(BGB, BX0, BY0, BW, BH); c.restore();
  c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(0, 0, W, HH);
  // items vanish in reverse order while rewinding
  const order = ['card', 'parrot', 'pigeon', 'stick', 'rose', 'brace']; const lo = {}; order.forEach((n, i) => { lo[n] = t < REW * (i + 1) / 7 || (n === 'brace' && t > REW); });
  const g = G.her; const st = { t, talk: 0, mood: t < REW ? 'worried' : 'shock', turn: 0.2, look: 0.4, armL: reach(g, -1, -g.sw * 1.2, g.ySh + 240), armR: reach(g, 1, g.sw * 1.2, g.ySh + 240) }; dressHer(st, g, t, lo);
  c.save(); c.translate(560, 2560); c.scale(0.82, 0.82); human(c, HER, st); c.restore();
  { const gr = G.rico; const s2 = { t, talk: 0, mood: 'happy', laugh: true, turn: -0.35, look: -0.6, armL: reach(gr, -1, -gr.sw * 0.4, gr.ySh + 290), armR: reach(gr, 1, gr.sw * 0.4, gr.ySh + 290), items: { L: braceletItem(5) } }; c.save(); c.translate(140, 2600); c.scale(0.62, 0.62); human(c, CAST.rico, s2); c.restore(); }
  drawMoney(c, t, 540, 400, { spent: Math.round(33 * (1 - eIO(k))), last: -9, sold: false });
  c.save(); c.textAlign = 'center'; c.textBaseline = 'middle'; c.globalAlpha = 1 - P(t, REW - 0.2, REW + 0.2); UI.font(c, 'Unb9', 62); UI.strokeText(c, 'КАК ОНА ДО ЭТОГО', 540, 560, C.white, C.oliveD, 14); UI.strokeText(c, 'ДОШЛА?', 540, 640, C.pink, C.white, 14);
  const rk = 1 - P(t, REW - 0.1, REW + 0.2); if (rk > 0) { c.globalAlpha = rk * (0.6 + 0.4 * Math.sin(t * 14)); UI.font(c, 'Unb9', 84); UI.strokeText(c, '◀◀ REW', 200, 800, C.red, C.white, 12); } c.restore();
  vhs(c, t, 1 - P(t, REW - 0.3, REW + 0.2));
  const rk2 = lerp(0.92, 1, eBack(P(t, 0, 0.35), 1.8)) * (1 + 0.012 * Math.sin(t * 5));
  c.save(); c.translate(540, 1080); c.rotate(-0.05); c.scale(rk2, rk2);
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
  c.save(); c.translate(170, lerp(2600, 2200, eBack(P(u, 0.4, 0.9), 1.4))); c.scale(0.46, 0.46); drawHer(c, t, 'outro', 0, 1, 0, ALL); c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const q = eBack(P(u, 0.25, 0.6), 2.2);
  c.save(); c.translate(540, 300); c.scale(q, q); font(c, 'Unb9', 56); strokeText(c, 'А КАК ОТКАЗЫВАЕШЬ', 0, -50, C.oliveD, C.white, 14); strokeText(c, 'ТЫ?', 0, 36, C.pink, C.white, 14); c.restore();
  const k = eBack(P(u, 0.7, 1.1), 1.8);
  if (k > 0) { c.save(); c.translate(540, 760); c.scale(k, k); c.fillStyle = 'rgba(0,0,0,.14)'; R(c, -470 + 8, -340 + 12, 940, 700, 34); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; R(c, -470, -340, 940, 700, 34); c.fill(); c.stroke();
    font(c, 'Unb9', 38); c.fillStyle = C.pink; c.textAlign = 'left'; c.fillText('ШПАРГАЛКА', -420, -295);
    const rows = [['A2', "I don't need anything."], ['B1', "No, thank you. I'm just looking."], ['B2', "Thanks, but I'll pass."], ['C1', "That's kind of you, but I'm not interested."], ['C2', 'No, thanks. Have a nice day!']];
    rows.forEach(([lv, ph], i) => { const y = -200 + i * 110, kk = eBack(P(u, 1.0 + i * 0.18, 1.35 + i * 0.18), 2.2); if (kk <= 0) return; c.save(); c.translate(0, y); c.scale(kk, kk); c.fillStyle = LVCOL[lv]; R(c, -430, -34, 82, 68, 18); c.fill(); font(c, 'Unb9', 30); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(lv, -389, 3); textFit(c, 'Nun9', 44, ph, 740); c.fillStyle = C.oliveD; c.textAlign = 'left'; c.fillText(ph, -320, 3); c.restore(); });
    c.restore(); }
  const bk = eBack(P(u, 2.4, 2.8), 2.2);
  if (bk > 0) { c.save(); c.translate(540, 1240); c.scale(bk, bk); c.fillStyle = C.gold; R(c, -450, -50, 420, 100, 50); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke(); font(c, 'Unb9', 34); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.fillText('СОХРАНИ', -240, 3);
    c.fillStyle = '#4CAF6A'; R(c, 10, -50, 440, 100, 50); c.fill(); c.strokeStyle = C.oliveD; c.stroke(); c.fillStyle = C.white; font(c, 'Unb9', 24); c.fillText('ОТПРАВЬ ТОМУ, КТО', 230, -12); c.fillText('НЕ УМЕЕТ ОТКАЗЫВАТЬ', 230, 20); c.restore(); }
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
  const loopK = clamp((t - (TL.dur - 0.6)) / 0.5);
  if (sc.id === 'hook') { drawHook(c, t); Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  if (sc.id === 'outro') { drawOutro(c, t); Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); if (loopK > 0) { c.save(); c.globalAlpha = loopK; drawHook(c, 0); c.restore(); } return; }
  const f = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[f], sh = shake(t);
  c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y);
  const heads = world(c, t, sc.id);
  const M = c.getTransform(); c.restore();
  const gr = c.createLinearGradient(0, 0, 0, HH); gr.addColorStop(0, 'rgba(255,230,190,.08)'); gr.addColorStop(1, 'rgba(60,40,80,.08)'); c.fillStyle = gr; c.fillRect(0, 0, W, HH);
  Hq.vignette(c, W, HH, 0.28);
  const proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f });
  const l = sc.id.toLowerCase(); const ev = sc.ev || {};
  const lineIds = TL.speech.filter(x => x.id.startsWith(l + '_') && x.who !== 'nar' && x.who !== 'tip');
  const holdFor = sp => { if (sp.id === 'c2_her') return 0.0; const i = lineIds.indexOf(sp); const nx = lineIds[i + 1]; return nx ? Math.max(0.05, Math.min(0.9, nx.t - (sp.t + sp.d) - 0.25)) : 0.9; };
  for (const sp of lineIds) {
    const hd = sp.who === 'her' ? heads.her : heads[sp.who]; if (!hd) continue;
    if (sp.who === 'her') UI.bubble(c, { ...sp, hold: holdFor(sp) }, t, proj({ x: hd.x - 30, y: hd.y - hd.hh * 1.25 }), 'left');
    else UI.bubble(c, { ...sp, hold: holdFor(sp) }, t, proj({ x: hd.x + 30, y: hd.y - hd.hh * 1.25 }), 'right', NAMES[sp.who]);
  }
  const pop = (txt, t0, t1, x, y, col, rot = -0.08, sz = 84) => { const k = eBack(P(t, t0, t0 + 0.25), 2.4) * (1 - P(t, t1, t1 + 0.3)); if (k > 0) { c.save(); c.translate(x, y); c.rotate(rot); c.scale(k, k); UI.font(c, 'Unb9', sz); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, txt, 0, 0, col, C.oliveD, 16); c.restore(); } };
  if (sc.id === 'B2' && ev.rim) pop('БА-ДУМ-ТСС!', ev.rim, ev.rim + 1.3, 540, 1250, C.gold);
  if (sc.id === 'C2') { const a = endOf('c2_her') + 0.3, b = SP.c2_t.t - 0.9; if (t > a && t < b) { const dots = Math.min(3, Math.floor((t - a) / 0.55) + 1); c.save(); c.globalAlpha = clamp((t - a) / 0.2) * clamp((b - t) / 0.15); UI.font(c, 'Unb9', 150); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, '.'.repeat(dots).padEnd(3, ' '), 540, 1450, C.white, C.oliveD, 16); c.restore(); } if (ev.sale) pop('+£15', ev.sale + 0.1, SP.c2_nar.t + 0.6, 800, 1180, '#7CF29A', -0.1, 110); }
  drawMoney(c, t);
  UI.card(c, t, sc); UI.captions(c, t); UI.sparkles(c, t);
  Hq.grain(c, W, HH, t, 0.04);
  UI.levelBar(c, t, sc, 1); UI.watermark(c); UI.levelIntro(c, t, sc); UI.levelIntroNext(c, t);
}
E.run('vendor', NF, renderFrame);
