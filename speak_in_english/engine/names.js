// "Forgot a name at a wedding" episode renderer: node names.js start end out.mp4 | --png=f1,f2
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, shade, rgba, paint, rr, human, items, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/names/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SC, SP, sceneAt, C, LVCOL } = UI;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS);
const talk = (who, t) => { let a = 0; for (const s of TL.speech) if (s.who === who && t >= s.t && t < s.t + s.d) { const i = Math.floor((t - s.t) * FPS); a = Math.max(a, s.env[Math.min(i, s.env.length - 1)] || 0); } return a; };
const speaking = (id, t, pre = 0, post = 0) => SP[id] && t >= SP[id].t - pre && t < SP[id].t + SP[id].d + post;
const endOf = id => SP[id].t + SP[id].d;
const TAU = Math.PI * 2;
const lvEv = L => (SC[L] && SC[L].ev) || {};
const wordT = (id, w) => { const s = SP[id]; if (!s) return null; const x = s.words.find(q => q[0].toLowerCase().replace(/[«»!?.,:]/g, '').startsWith(w)); return x ? s.t + x[1] : null; };

// ---------------- cast: wedding outfits
const CAST = { ...BASE };
CAST.her_wedding = { ...BASE.her_restaurant, top: { type: 'longsleeve', col: '#E86A9A' }, bottom: { type: 'skirt', col: '#F7B6CF' }, necklace: true };
CAST.tom = { ...BASE.tom, top: { type: 'blazer', col: '#2E4A7A', shirt: '#FFFFFF', tie: '#F2C14E' }, bottom: { type: 'trousers', col: '#2E4A7A' } };
CAST.priya = { ...BASE.priya, top: { type: 'blazer', col: '#2F8A7E', shirt: '#FFFFFF', tie: '#FFFFFF' }, bottom: { type: 'skirt', col: '#2F8A7E' } };
CAST.greg = { ...BASE.greg, top: { type: 'blazer', col: '#7A1C2E', shirt: '#FFFFFF', tie: '#F2C14E' }, bottom: { type: 'trousers', col: '#3A2A2E' } };
CAST.ben = { ...BASE.ben, top: { type: 'blazer', col: '#5A5F6C', shirt: '#F7F9FC', tie: '#8E5BD6' }, bottom: { type: 'trousers', col: '#4A4F5C' } };
CAST.rita = { ...BASE.rita, top: { type: 'sweater', col: '#8E5BD6' }, bottom: { type: 'skirt', col: '#6A3FB0' } };
CAST.reggie = { ...BASE.reggie, top: { type: 'blazer', col: '#1E1E24', shirt: '#FFFFFF', tie: '#1E1E24' }, bottom: { type: 'trousers', col: '#1E1E24' } };

const WHO = { A1: 'tom', A2: 'priya', B1: 'greg', B2: 'ben', C1: 'rita', C2: 'reggie', hook: 'tom', outro: 'reggie' };
const ST = { tom: 0, priya: 2600, greg: 5200, ben: 7800, rita: 10400, reggie: 13000 };
const NAMES = { tom: ['DAVE', '#3C6FB4'], priya: ['PRIYA', '#2F8A7E'], greg: ['GREG', '#8A1C2E'], ben: ['BEN', '#8E5BD6'], rita: ['ALEX', '#8E5BD6'], reggie: ['REGGIE', '#1E1E24'] };
const HERX = 600, NBX = -180, FY = 60;
const HER = CAST.her_wedding;
const G = { her: geom(HER) }; for (const k of Object.keys(ST)) G[k] = geom(CAST[k]);

// ---------------- background: a wedding hall, one "station" per level (prerendered, blurred)
const BX0 = -1800, BY0 = -2700, BW = 17400, BH = 3500, BS = 0.5, FLOOR = -380;
const WALL = { tom: ['#FBE3E6', '#F3C4CF'], priya: ['#E8F2E0', '#C9E2BC'], greg: ['#2E2A5A', '#1E1B3E'], ben: ['#E6DDF4', '#C9B8E6'], rita: ['#FFF1DA', '#F6D9A8'], reggie: ['#F4DCE0', '#E3B4BE'] };
function lights(c, x0) { c.strokeStyle = '#6A4630'; c.lineWidth = 4; c.beginPath(); c.moveTo(x0 - 1300, -2150); c.quadraticCurveTo(x0, -1850, x0 + 1300, -2150); c.stroke(); for (let k = 0; k < 26; k++) { const u = k / 25, x = x0 - 1300 + u * 2600, y = -2150 + 4 * 150 * u * (1 - u); c.fillStyle = k % 2 ? '#FFE9A0' : '#FFD2E0'; c.beginPath(); c.arc(x, y + 20, 15, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,240,170,.25)'; c.beginPath(); c.arc(x, y + 20, 38, 0, TAU); c.fill(); } }
function flowers(c, x, y, r, n) { for (let k = 0; k < n; k++) { const a = hash(k + x) * TAU, d = hash(k * 3 + y) * r; c.fillStyle = ['#FFFFFF', '#F7B6CF', '#FFF1B0', '#EE5E9A'][k % 4]; c.beginPath(); c.arc(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.8, 22 + hash(k) * 18, 0, TAU); c.fill(); c.fillStyle = '#4FA86A'; c.beginPath(); c.ellipse(x + Math.cos(a) * d * 1.05, y + Math.sin(a) * d * 0.85 + 30, 20, 9, a, 0, TAU); c.fill(); } }
function station(c, who, x0) {
  const [a, b] = WALL[who], L = x0 - 1300;
  const g = c.createLinearGradient(0, -2700, 0, FLOOR); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(L, -2700, 2600, FLOOR + 2700);
  c.fillStyle = shade(b, 0.9); c.fillRect(L, -900, 2600, FLOOR + 900); c.fillStyle = '#FFFDF8'; c.fillRect(L, -912, 2600, 16);
  lights(c, x0);
  if (who === 'tom') { c.strokeStyle = '#FFFDF8'; c.lineWidth = 40; c.beginPath(); c.arc(x0 + 100, -1250, 520, Math.PI, 0); c.stroke(); c.fillStyle = '#FFFDF8'; c.fillRect(x0 - 440, -1250, 40, 860); c.fillRect(x0 + 600, -1250, 40, 860); flowers(c, x0 + 100, -1770, 520, 26); flowers(c, x0 - 420, -1000, 160, 10); flowers(c, x0 + 620, -1000, 160, 10);
    c.fillStyle = '#C9A040'; rr(c, x0 - 180, -1500, 560, 130, 20); c.fill(); c.fillStyle = '#FFFDF8'; c.font = '60px Cav7'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Jo & Sam', x0 + 100, -1432); }
  if (who === 'priya') { c.fillStyle = '#FFFDF8'; c.fillRect(x0 - 560, -1020, 1500, 640); c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(x0 - 560, -1020, 1500, 40); const food = ['#E0474C', '#F2C14E', '#8CB369', '#EE5E9A', '#E9A23B']; for (let k = 0; k < 9; k++) { c.fillStyle = '#E8E2DA'; c.beginPath(); c.ellipse(x0 - 480 + k * 170, -1030, 70, 16, 0, 0, TAU); c.fill(); c.fillStyle = food[k % 5]; c.beginPath(); c.ellipse(x0 - 480 + k * 170, -1060, 48, 28, 0, 0, TAU); c.fill(); }
    for (let k = 0; k < 6; k++) { c.strokeStyle = '#6A4630'; c.lineWidth = 3; c.beginPath(); c.moveTo(x0 - 380 + k * 240, -1750); c.lineTo(x0 - 380 + k * 240, -1450); c.stroke(); c.fillStyle = ['#EE5E9A', '#F2C14E', '#7FD0FF', '#8CB369'][k % 4]; c.beginPath(); c.ellipse(x0 - 380 + k * 240, -1850, 90, 120, 0, 0, TAU); c.fill(); } }
  if (who === 'greg') { for (let ix = 0; ix < 20; ix++) for (let iy = 0; iy < 4; iy++) { c.fillStyle = ['#EE5E9A', '#7FD0FF', '#F2C14E', '#8E5BD6'][(ix + iy) % 4]; c.globalAlpha = 0.5; c.fillRect(L + ix * 130, FLOOR + iy * 90 + 10, 130, 90); } c.globalAlpha = 1;
    c.strokeStyle = '#C9CED6'; c.lineWidth = 6; c.beginPath(); c.moveTo(x0 + 100, -2700); c.lineTo(x0 + 100, -1900); c.stroke(); const bg = c.createRadialGradient(x0 + 60, -1850, 10, x0 + 100, -1800, 180); bg.addColorStop(0, '#FFFFFF'); bg.addColorStop(1, '#8E8EA8'); c.fillStyle = bg; c.beginPath(); c.arc(x0 + 100, -1800, 170, 0, TAU); c.fill();
    for (let k = 0; k < 10; k++) { c.fillStyle = ['rgba(238,94,154,.25)', 'rgba(127,208,255,.25)', 'rgba(242,193,78,.25)'][k % 3]; c.beginPath(); c.moveTo(x0 + 100, -1800); c.lineTo(x0 - 900 + k * 200, FLOOR); c.lineTo(x0 - 700 + k * 200, FLOOR); c.closePath(); c.fill(); } }
  if (who === 'ben') { c.fillStyle = '#5A3A22'; c.fillRect(x0 - 560, -1700, 1500, 40); c.fillRect(x0 - 560, -1400, 1500, 40);
    for (let r = 0; r < 2; r++) for (let k = 0; k < 15; k++) { const bx = x0 - 520 + k * 98, by = -1700 + r * 300 - 6; c.fillStyle = ['#2F8A4A', '#E0474C', '#8E5BD6', '#E9A23B', '#3C6FB4'][(k + r) % 5]; c.fillRect(bx, by - 200, 40, 200); c.fillRect(bx + 10, by - 260, 20, 70); c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(bx + 6, by - 150, 10, 110); }
    c.fillStyle = '#6A4630'; c.fillRect(x0 - 600, -1020, 1700, 70); c.fillStyle = '#4A2E1C'; c.fillRect(x0 - 600, -950, 1700, 560); c.fillStyle = '#FFFDF8'; c.font = '60px Unb9'; c.textAlign = 'center'; c.fillText('BAR', x0 + 100, -1100); }
  if (who === 'rita') { const cx = x0 + 100; c.fillStyle = '#FFFDF8'; c.fillRect(cx - 520, -960, 1040, 580); for (let k = 0; k < 3; k++) { const w = 460 - k * 120, y = -980 - k * 190; paint(c, q => { q.m(cx - w / 2, y); q.l(cx + w / 2, y); q.l(cx + w / 2, y - 180); q.l(cx - w / 2, y - 180); q.z(); }, ['#FFFDF8', '#F7D6E0', '#FFF1D0'][k], { sd: 8, hd: 4, lw: 4 }); c.fillStyle = '#EE5E9A'; for (let f = 0; f < 6; f++) { c.beginPath(); c.arc(cx - w / 2 + 40 + f * (w - 80) / 5, y - 170, 14, 0, TAU); c.fill(); } }
    c.fillStyle = '#EE5E9A'; c.beginPath(); c.arc(cx - 20, -1700, 22, 0, TAU); c.arc(cx + 20, -1700, 22, 0, TAU); c.fill(); }
  if (who === 'reggie') { c.fillStyle = '#8A1C2E'; c.fillRect(x0 - 760, -2700, 340, 2300); c.fillRect(x0 + 420, -2700, 340, 2300); c.fillStyle = 'rgba(0,0,0,.2)'; for (let k = 0; k < 5; k++) { c.fillRect(x0 - 760 + k * 70, -2700, 18, 2300); c.fillRect(x0 + 420 + k * 70, -2700, 18, 2300); }
    c.fillStyle = '#FFFDF8'; c.beginPath(); c.ellipse(x0 + 100, -960, 560, 80, 0, 0, TAU); c.fill(); c.fillRect(x0 - 560, -960, 1120, 560); flowers(c, x0 + 100, -1080, 200, 14); for (let k = 0; k < 2; k++) { c.fillStyle = '#C9A040'; c.fillRect(x0 - 360 + k * 920 - 10, -1180, 20, 220); c.fillStyle = '#FFB347'; c.beginPath(); c.ellipse(x0 - 360 + k * 920, -1210, 14, 30, 0, 0, TAU); c.fill(); } }
}
function drawRoom(c) { c.fillStyle = '#F3E6D0'; c.fillRect(BX0, BY0, BW, BH); Object.keys(ST).forEach(w => station(c, w, ST[w]));
  const fg = c.createLinearGradient(0, FLOOR, 0, 800); fg.addColorStop(0, '#C9A06A'); fg.addColorStop(1, '#A87C4A'); c.fillStyle = 'rgba(0,0,0,0)'; c.save(); c.globalCompositeOperation = 'destination-over'; c.restore();
  c.fillStyle = fg; c.fillRect(BX0, FLOOR, BW, 800 - FLOOR); // floor first, dance tiles are drawn above in station order
  Object.keys(ST).forEach(w => { if (w === 'greg') { const x0 = ST[w], L = x0 - 1300; for (let ix = 0; ix < 20; ix++) for (let iy = 0; iy < 6; iy++) { c.fillStyle = ['#EE5E9A', '#7FD0FF', '#F2C14E', '#8E5BD6'][(ix + iy) % 4]; c.globalAlpha = 0.55; c.fillRect(L + ix * 130, FLOOR + iy * 70, 130, 70); } c.globalAlpha = 1; } });
  c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 3; for (let y = FLOOR + 60; y < 800; y += 70) { c.beginPath(); c.moveTo(BX0, y); c.lineTo(BX0 + BW, y); c.stroke(); } }
const BGS = createCanvas(Math.round(BW * BS), Math.round(BH * BS)), bgc = BGS.getContext('2d');
bgc.scale(BS, BS); bgc.translate(-BX0, -BY0); drawRoom(bgc);
const BGB = createCanvas(BGS.width, BGS.height); { const c = BGB.getContext('2d'); c.filter = 'blur(2.5px)'; c.drawImage(BGS, 0, 0); }

// ---------------- props
function sparkleAt(c, x, y, k, t, col = '#FFE9A0') { if (k <= 0 || k >= 1) return; c.save(); c.globalAlpha = 1 - k; c.fillStyle = col; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + t * 2, r = 30 + 120 * k; UI.star(c, x + Math.cos(a) * r, y + Math.sin(a) * r, 20, a); } c.restore(); }
function nameTag(c, x, y, s, rot, name, col = '#E0474C') { c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -150 + 8, -105 + 10, 300, 210, 18); c.fill(); c.fillStyle = '#FFFDF8'; c.strokeStyle = '#2B2F3A'; c.lineWidth = 6; rr(c, -150, -105, 300, 210, 18); c.fill(); c.stroke(); c.fillStyle = col; rr(c, -150, -105, 300, 78, 18); c.fill(); c.fillStyle = '#FFFFFF'; c.font = '34px Unb9'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('HELLO', 0, -80); c.font = '22px Nun9'; c.fillText('my name is', 0, -48); c.fillStyle = '#2B2F3A'; c.font = '86px Cav7'; c.fillText(name, 0, 38); c.restore(); }
const mirror = () => (ctx) => { ctx.translate(-6, -20); ctx.strokeStyle = '#B9BFC8'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -90); ctx.stroke(); ctx.fillStyle = '#E6F3FA'; ctx.strokeStyle = '#B9BFC8'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(0, -120, 34, 0, TAU); ctx.fill(); ctx.stroke(); };
function put(c, cfg, st, x, y = FY, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); const r = human(c, cfg, st); c.restore(); return { x: x + r.head.x * s, y: y + r.head.y * s, hh: r.hh * s, r }; }

function guest(c, t, L, who, x, out) {
  const g = G[who], cfg = CAST[who], ev = lvEv(L), l = (L || '').toLowerCase();
  const st = { t, talk: talk(who, t), mood: 'happy', turn: 0.35, look: 0.8, armL: reach(g, -1, -g.sw * 0.35, g.ySh + 330), armR: reach(g, 1, g.sw * 0.35, g.ySh + 330) };
  if (speaking(l + '_x', t, 0.05)) { const u = (t - SP[l + '_x'].t) * 4; st.armR = reach(g, 1, g.sw * 1.6 + Math.sin(u) * 30, g.ySh + 280 + Math.cos(u) * 30); }
  let gx = x;
  if (who === 'tom') { if (L === 'A1') { if (SP.a1_her && t > SP.a1_her.t - 0.1 && t < SP.a1_x.t) { st.armL = reach(g, -1, -g.sw * 2.8, g.ySh + 20); st.armR = reach(g, 1, g.sw * 2.8, g.ySh + 20); st.laugh = true; }
      if (speaking('a1_x', t, 0.05, 0.1)) { st.armL = reach(g, -1, -g.sw * 2.8, g.ySh + 20); st.armR = reach(g, 1, g.sw * 2.8, g.ySh + 20); st.mood = 'happy'; st.laugh = true; }
      if (ev.hug && t > ev.hug) { const k = eOut(P(t, ev.hug, ev.hug + 0.5)); gx = x + 150 * k; st.armL = reach(g, -1, g.sw * 1.55, g.ySh + 150); st.armR = reach(g, 1, g.sw * 2.45, g.ySh + 110); st.tilt = 0.06 * Math.sin(t * 8) * k; } } }
  if (who === 'priya' && L === 'A2') { if (SP.a2_her && t > SP.a2_her.t + 0.9 && t < SP.a2_x.t) st.mood = 'skeptical'; if (speaking('a2_x', t, 0.2, 0.9)) { st.mood = 'smug'; st.armR = reach(g, 1, g.sw * 1.3, g.ySh + 300); st.armL = reach(g, -1, -g.sw * 1.3, g.ySh + 300); st.tilt = 0.05; } }
  if (who === 'greg' && L === 'B1') { if (speaking('b1_x', t, 0.05)) st.mood = 'happy'; if (ev.flex && t > ev.flex - 0.15 && t < ev.flex + 1.4) { const w = Math.sin(t * 14) * 14; st.armL = reach(g, -1, -g.sw * 2.0, g.ySh - 40 + w); st.armR = reach(g, 1, g.sw * 2.0, g.ySh - 40 - w); st.mood = 'smug'; st.laugh = true; } }
  if (who === 'ben' && L === 'B2') { if (SP.b2_her && t > SP.b2_her.t + 1.0 && t < SP.b2_x.t) st.mood = 'skeptical'; if (speaking('b2_x', t, 0.05, 0.1)) { st.mood = 'smug'; } if (ev.rim && t > ev.rim - 0.9 && t < ev.rim + 1.6) { st.items = { R: mirror() }; st.armR = reach(g, 1, g.sw * 1.0, g.headY + 130); st.mood = 'happy'; st.laugh = true; } }
  if (who === 'rita') { if (L === 'C1') { if (SP.c1_x && t > SP.c1_x.t - 0.2) st.mood = 'happy'; if (ev.tag && t > ev.tag) { const k = eBack(P(t, ev.tag, ev.tag + 0.3), 2.4); st.afterTorso = cc => nameTag(cc, g.sw * 0.1, g.ySh + 150, 0.38 * k, -0.08, 'Alex'); } } }
  if (who === 'reggie') { st.afterTorso = cc => { const y = g.ySh + 40; cc.fillStyle = '#1E1E24'; cc.beginPath(); cc.moveTo(0, y); cc.lineTo(-34, y - 22); cc.lineTo(-34, y + 22); cc.closePath(); cc.fill(); cc.beginPath(); cc.moveTo(0, y); cc.lineTo(34, y - 22); cc.lineTo(34, y + 22); cc.closePath(); cc.fill(); cc.fillStyle = '#F7B6CF'; cc.beginPath(); cc.arc(g.sw * 0.5, y + 60, 16, 0, TAU); cc.fill(); }; st.mood = 'neutral'; st.armL = reach(g, -1, -g.sw * 1.1, g.ySh + 430); st.armR = reach(g, 1, g.sw * 1.1, g.ySh + 430);
    if (L === 'C2') { const he = endOf('c2_her'); if (SP.c2_her && t > SP.c2_her.t + 2.0) st.mood = 'worried'; if (t > he - 0.2) { st.mood = 'worried'; st.look = 0.4; st.lookY = 0.6; }
      if (speaking('c2_x', t, 0.05, 0.4)) { const u = (t - SP.c2_x.t) / SP.c2_x.d; st.mood = u > 0.35 ? 'happy' : 'shock'; if (ev.ring && t > ev.ring - 0.6) st.armL = reach(g, -1, -g.sw * 1.5, g.ySh + 30); }
      if (ev.ring && t > ev.ring - 0.6 && t < ev.ring + 2.2) st.armL = reach(g, -1, -g.sw * 1.5, g.ySh + 30);
      if (SP.c2_her2 && t > SP.c2_her2.t - 0.3) st.mood = 'happy'; } }
  const r = put(c, cfg, st, gx); if (out) out.ring = { x: gx - g.sw * 1.5, y: FY + g.ySh + 30 }; return r;
}
function herState(t, L) {
  const g = G.her, ev = lvEv(L);
  const st = { t, talk: talk('her', t), mood: 'worried', turn: -0.45, look: -0.7, armL: reach(g, -1, -g.sw * 0.5, g.ySh + 300), armR: reach(g, 1, g.sw * 0.3, g.ySh + 230) };
  const l = (L || '').toLowerCase(); const hs = SP[l + '_her'];
  if (hs && speaking(l + '_her', t, 0.05)) { const gg = Math.sin((t - hs.t) * 4.5); st.armL = reach(g, -1, -g.sw * 1.5 + gg * 40, g.ySh + 230 - Math.abs(gg) * 50); st.mood = 'neutral'; }
  if (L === 'hook') st.mood = 'worried';
  if (L === 'A1') { if (speaking('a1_her', t, 0.05)) st.mood = 'worried'; if (ev.hug && t > ev.hug) st.mood = 'shock'; }
  if (L === 'A2') { if (SP.a2_x && t > SP.a2_x.t + 0.5) st.mood = 'worried'; }
  if (L === 'B1') { if (ev.flex && t > ev.flex) st.mood = 'surprised'; }
  if (L === 'B2') { if (ev.rim && t > ev.rim) st.mood = 'surprised'; }
  if (L === 'C1') { if (ev.tag && t > ev.tag) st.mood = 'happy'; }
  if (L === 'C2') {
    if (speaking('c2_her', t, 0.1)) { st.mood = 'smug'; st.tilt = -0.04; st.armL = reach(g, -1, -g.sw * 1.6 + Math.sin(t * 2.4) * 40, g.ySh + 60 + Math.cos(t * 2.4) * 30); st.items = { L: items.wine(0.6) }; }
    if (t > endOf('c2_her') + 0.2) st.mood = 'neutral';
    if (SP.c2_x && t > SP.c2_x.t + 0.6) st.mood = 'shock';
    if (ev.ring && t > ev.ring + 0.2) { st.mood = 'shock'; st.armL = reach(g, -1, -g.sw * 2.1, g.ySh + 90); }
    if (SP.c2_her2 && t > SP.c2_her2.t - 0.2) { st.mood = 'smug'; st.armL = reach(g, -1, -g.sw * 2.1, g.ySh + 90); }
  }
  if (L === 'outro') { st.mood = 'happy'; st.turn = 0; st.look = 0; st.armL = reach(g, -1, -g.sw * 1.5 + Math.sin(t * 8) * 40, g.headY - 220); st.armR = reach(g, 1, g.sw * 1.0, g.ySh + 300); }
  return st;
}
function drawHer(c, t, L, x, s = 1, y = FY) { return put(c, HER, herState(t, L), x, y, s); }

function world(c, t, L) {
  c.drawImage(BGB, BX0, BY0, BW, BH);
  const who = WHO[L], x0 = ST[who]; const heads = {}, o = {};
  heads[who] = guest(c, t, L, who, x0 + NBX, o);
  heads.her = drawHer(c, t, L, x0 + HERX);
  const ev = lvEv(L);
  if (L === 'A1' && ev.hug && t > ev.hug) sparkleAt(c, x0 + 420, -1000, P(t, ev.hug, ev.hug + 1.0), t, '#F7B6CF');
  if (L === 'B1' && ev.flex) sparkleAt(c, x0 - 100, -1200, P(t, ev.flex, ev.flex + 1.0), t, '#FFE9A0');
  if (L === 'B2' && ev.rim) { const k = P(t, ev.rim + 0.3, ev.rim + 1.2); sparkleAt(c, heads.ben.x + 40, heads.ben.y + 40, k, t, '#FFFFFF'); }
  if (L === 'C2' && ev.ring && o.ring) { const k = P(t, ev.ring, ev.ring + 1.1); sparkleAt(c, x0 + NBX + (o.ring.x - (x0 + NBX)) , o.ring.y - 40, k, t, '#FFE9A0'); }
  return heads;
}

function shotFor(t) {
  const sc = sceneAt(t), L = sc.id; const who = WHO[L], x0 = ST[who];
  const herHY = FY + G.her.headY, nbHY = FY + G[who].headY;
  const hx = x0 + HERX, nx = x0 + NBX;
  const two = { x: x0 + 210, y: Math.min(herHY, nbHY) + 160, z: 0.9, r: 0 };
  if (L === 'hook' || L === 'outro') return { x: x0 + 240, y: -1000, z: 0.9, r: 0 };
  const u = t - sc.s; const ev = sc.ev || {};
  if (u < 1.15) return { ...two, z: 0.86, cut: u < 0.85 };
  const l = L.toLowerCase(); const her = l + '_her', oth = l + '_x', nar = l + '_nar';
  const herC = { x: hx - 40, y: herHY + 120, z: 1.45, r: -0.5 }, othC = { x: nx + 40, y: nbHY + 120, z: L === 'C2' ? 1.55 : 1.4, r: 0.5 };
  if (L === 'A1' && ev.hug && t > ev.hug - 0.3 && t < SP.a1_nar.t - 0.1) return { ...two, z: 0.98 };
  if (L === 'B1' && ev.flex && t > ev.flex - 0.4 && t < SP.b1_nar.t - 0.1) return { ...two, z: 0.95 };
  if (L === 'B2' && ev.rim && t > ev.rim - 0.9 && t < SP.b2_nar.t - 0.1) return { ...othC, z: 1.2 };
  if (L === 'A2' && speaking('a2_her', t, 0.3) && t > SP.a2_her.t + SP.a2_her.d * 0.4) return { ...two, z: 0.95 };
  if (L === 'C2') {
    const he = endOf('c2_her');
    if (t < SP.c2_her.t - 0.2) return { ...two, z: 1.0 };
    if (t < he + 0.1) return { ...herC, z: lerp(1.35, 1.75, P(t, SP.c2_her.t, he)), y: lerp(herHY + 125, herHY + 95, P(t, SP.c2_her.t, he)) };
    if (ev.ring && t > ev.ring - 0.4 && t < ev.ring + 1.6) return { ...two, z: 1.15, x: x0 + 40, y: nbHY + 300 };
    if (t < SP.c2_x.t + 1.2) return { ...othC, cut: t < he + 0.15 };
    if (t < SP.c2_her2.t - 0.2) return { ...two, z: 0.95 };
    if (t < SP.c2_nar.t - 0.1) return { ...herC, z: 1.35, y: herHY + 150 };
    return { ...two, z: 0.85, y: two.y + 40 };
  }
  if (speaking(her, t, 0.3, 0.1)) return herC;
  if (SP[nar] && t >= SP[nar].t - 0.15) return { ...two, z: 0.9 };
  if (speaking(oth, t, 0.3, 0.3)) return othC;
  return two;
}
const CAM = E.simulateCamera(TL, shotFor, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft']);

// ---------------- NEW opener: a giant "HELLO my name is ???" sticker + arms-wide Dave and a blank-faced heroine
function drawHook(c, t) {
  c.save(); c.translate(540, 960); c.scale(0.62, 0.62); c.translate(-(ST.tom + 300), 1100); c.drawImage(BGB, BX0, BY0, BW, BH); c.restore();
  c.fillStyle = 'rgba(255,236,235,.3)'; c.fillRect(0, 0, W, HH);
  for (let k = 0; k < 24; k++) { const x = (hash(k) * W + t * (20 + k)) % W, y = (hash(k * 5) * 900 + t * (60 + k * 3)) % 1000 + 120; c.save(); c.translate(x, y); c.rotate(t * 2 + k); c.fillStyle = ['#EE5E9A', '#F2C14E', '#7FD0FF', '#FFFFFF'][k % 4]; c.fillRect(-8, -14, 16, 28); c.restore(); }
  const sw = Math.sin(t * 2.2) * 0.04;
  c.save(); c.translate(540, 560); c.rotate(-0.06 + sw); const s0 = 2.6; c.scale(s0, s0); nameTag(c, 0, 0, 1, 0, '', '#E0474C'); c.restore();
  // handwritten ??? on the sticker
  c.save(); c.translate(540, 560 + 34 * 2.6 / 2.6 * 1.3); c.rotate(-0.06 + sw); const qk = 1 + 0.06 * Math.sin(t * 7); c.scale(qk, qk); c.fillStyle = '#E0474C'; c.font = '300px Cav7'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('???', 0, 40); c.restore();
  { const g = G.her, st = { t, talk: 0, mood: 'worried', turn: 0.35, look: 0.6, armL: reach(g, -1, -g.sw * 0.4, g.ySh + 290), armR: reach(g, 1, g.sw * 0.4, g.ySh + 290) }; c.save(); c.translate(300, 2420); c.scale(0.62, 0.62); human(c, HER, st); c.restore(); }
  { const g = G.tom, a = Math.sin(t * 5) * 18, st = { t, talk: 0, mood: 'happy', turn: -0.35, look: -0.6, laugh: true, armL: reach(g, -1, -g.sw * 2.8, g.ySh + 20 + a), armR: reach(g, 1, g.sw * 2.8, g.ySh + 20 - a) }; c.save(); c.translate(800, 2480); c.scale(0.6, 0.6); human(c, CAST.tom, st); c.restore(); }
  const rk = lerp(0.92, 1, eBack(P(t, 0, 0.35), 1.8)) * (1 + 0.012 * Math.sin(t * 5));
  c.save(); c.translate(540, 1255); c.rotate(-0.05); c.scale(rk, rk);
  const lines = TL.cfg.hook_title; c.fillStyle = 'rgba(0,0,0,.22)'; UI.rr(c, -500 + 10, -150 + 14, 1000, 300, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; UI.rr(c, -500, -150, 1000, 300, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 900); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -78); UI.textFit(c, 'Unb9', 110, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 8, C.pink, C.white, 12); UI.textFit(c, 'Unb9', 64, lines[2][0], 900); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 98);
  c.restore();
  UI.levelBar(c, t, { id: 'hook' });
  const stT = SC.hook.stamp_t, sk = P(t, stT - 0.02, stT + 0.15);
  if (sk > 0) { const s2 = lerp(2.6, 1, eOut(sk)); c.save(); c.translate(540, 1740); c.rotate(-0.13); c.scale(s2, s2); c.globalAlpha = clamp(sk * 3); c.fillStyle = 'rgba(255,253,248,.92)'; UI.rr(c, -380, -90, 760, 180, 24); c.fill(); c.strokeStyle = C.pink; c.lineWidth = 14; UI.rr(c, -380, -90, 760, 180, 24); c.stroke(); UI.textFit(c, 'Unb9', 110, TL.cfg.stamp, 700); c.fillStyle = C.pink; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(TL.cfg.stamp, 0, 6); c.restore(); }
}
// ---------------- outro: a save-worthy cheat sheet + SAVE / SEND buttons
function drawOutro(c, t) {
  const s = SC.outro.s, u = t - s, o = SP.outro; const { textFit, strokeText, font, rr: R } = UI;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  c.save(); c.translate(150, lerp(2900, 2480, eBack(P(u, 0.4, 0.9), 1.4))); c.scale(0.46, 0.46); drawHer(c, t, 'outro', 0, 1, 0); c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const q = eBack(P(u, 0.25, 0.6), 2.2);
  c.save(); c.translate(540, 300); c.scale(q, q); font(c, 'Unb9', 62); strokeText(c, 'А КАК СПРОСИШЬ', 0, -50, C.oliveD, C.white, 14); strokeText(c, 'ТЫ?', 0, 36, C.pink, C.white, 14); c.restore();
  const k = eBack(P(u, 0.7, 1.1), 1.8);
  if (k > 0) { c.save(); c.translate(540, 760); c.scale(k, k); c.fillStyle = 'rgba(0,0,0,.14)'; R(c, -470 + 8, -340 + 12, 940, 700, 34); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; R(c, -470, -340, 940, 700, 34); c.fill(); c.stroke();
    font(c, 'Unb9', 38); c.fillStyle = C.pink; c.textAlign = 'left'; c.fillText('ШПАРГАЛКА', -420, -295);
    const rows = [['A2', "Sorry, what's your name again?"], ['B1', "I'm terrible with names."], ['B2', "It's slipped my mind."], ['C1', "It's on the tip of my tongue."], ['C2', 'Of course, darling.']];
    rows.forEach(([lv, ph], i) => { const y = -200 + i * 110, kk = eBack(P(u, 1.0 + i * 0.18, 1.35 + i * 0.18), 2.2); if (kk <= 0) return; c.save(); c.translate(0, y); c.scale(kk, kk); c.fillStyle = LVCOL[lv]; R(c, -430, -34, 82, 68, 18); c.fill(); font(c, 'Unb9', 30); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(lv, -389, 3); textFit(c, 'Nun9', 44, ph, 740); c.fillStyle = C.oliveD; c.textAlign = 'left'; c.fillText(ph, -320, 3); c.restore(); });
    c.restore(); }
  const bk = eBack(P(u, 2.4, 2.8), 2.2);
  if (bk > 0) { c.save(); c.translate(540, 1240); c.scale(bk, bk); c.fillStyle = C.gold; R(c, -450, -50, 420, 100, 50); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke(); font(c, 'Unb9', 34); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.fillText('СОХРАНИ', -240, 3);
    c.fillStyle = '#4CAF6A'; R(c, 10, -50, 440, 100, 50); c.fill(); c.strokeStyle = C.oliveD; c.stroke(); c.fillStyle = C.white; font(c, 'Unb9', 26); c.fillText('ОТПРАВЬ ТОМУ,', 230, -12); c.fillText('КТО ЗАБЫВАЕТ ИМЕНА', 230, 20); c.restore(); }
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
  if (sc.id === 'hook') { drawHook(c, t); Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  if (sc.id === 'outro') { drawOutro(c, t); Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
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
  if (sc.id === 'A1' && ev.hug) pop('ЭТО БРАТ!', ev.hug + 0.1, SP.a1_nar.t + 0.6, 540, 1250, C.gold);
  if (sc.id === 'B2' && ev.rim) pop('БА-ДУМ-ТСС!', ev.rim, ev.rim + 1.3, 540, 1250, C.gold);
  if (sc.id === 'C2') {
    const a = endOf('c2_her') + 0.3, b = SP.c2_x.t - 0.1;
    if (t > a && t < b) { const dots = Math.min(3, Math.floor((t - a) / 0.55) + 1); c.save(); c.globalAlpha = clamp((t - a) / 0.2) * clamp((b - t) / 0.15); UI.font(c, 'Unb9', 150); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, '.'.repeat(dots).padEnd(3, ' '), 540, 1450, C.white, C.oliveD, 16); UI.font(c, 'Nun9', 40); UI.strokeText(c, '*метрдотель в восторге*'.replace('метрдотель в восторге', 'он ждёт'), 540, 1560, C.white, C.oliveD, 10); c.restore(); }
    if (ev.ring) pop('МУЖ!', ev.ring + 0.1, SP.c2_nar.t + 0.4, 540, 1180, '#EE5E9A', -0.08, 120);
  }
  UI.card(c, t, sc); UI.captions(c, t); UI.sparkles(c, t);
  Hq.grain(c, W, HH, t, 0.04);
  UI.levelBar(c, t, sc, 1); UI.watermark(c); UI.levelIntro(c, t, sc); UI.levelIntroNext(c, t);
}
E.run('names', NF, renderFrame);
