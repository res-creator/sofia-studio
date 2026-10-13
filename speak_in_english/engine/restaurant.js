// "Wrong dish at a London restaurant" episode renderer: node restaurant.js start end out.mp4 | --png=f1,f2
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, noise1, mix, shade, rgba, paint, rr, human, items, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/restaurant/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SC, SP, sceneAt, C, LVCOL } = UI;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS);
const talk = (who, t) => { let a = 0; for (const s of TL.speech) if (s.who === who && t >= s.t && t < s.t + s.d) { const i = Math.floor((t - s.t) * FPS); a = Math.max(a, s.env[Math.min(i, s.env.length - 1)] || 0); } return a; };
const speaking = (id, t, pre = 0, post = 0) => SP[id] && t >= SP[id].t - pre && t < SP[id].t + SP[id].d + post;
const endOf = id => SP[id].t + SP[id].d;
const TAU = Math.PI * 2;
const lvEv = L => (SC[L] && SC[L].ev) || {};
const wordT = (id, w) => { const s = SP[id]; if (!s) return null; const x = s.words.find(q => q[0].toLowerCase().replace(/[«»!?.,:]/g, '').startsWith(w)); return x ? s.t + x[1] : null; };

// ---------------- cast: restaurant outfits (faces/hair stay as in earlier episodes)
const CAST = { ...BASE };
CAST.tom = { ...BASE.tom, top: { type: 'blazer', col: '#22252E', shirt: '#FFFFFF', tie: '#8A1C2E' }, bottom: { type: 'trousers', col: '#22252E' } };
CAST.rita = { ...BASE.rita, top: { type: 'longsleeve', col: '#FFFFFF' }, bottom: { type: 'trousers', col: '#22252E' } };
CAST.ben = { ...BASE.ben, top: { type: 'blazer', col: '#2B2F3A', shirt: '#F7F9FC', tie: '#EE5E9A' }, bottom: { type: 'trousers', col: '#2B2F3A' } };
CAST.tony = { ...BASE.tony, headband: undefined, top: { type: 'longsleeve', col: '#FFFFFF' }, bottom: { type: 'trousers', col: '#7A828E' }, stubble: undefined, mustache: '#2A1A10' };
CAST.priya = { ...BASE.priya, top: { type: 'blazer', col: '#2E3A4A', shirt: '#FFFFFF', tie: '#3FB6A8' }, bottom: { type: 'trousers', col: '#2E3A4A' } };
CAST.reggie = { ...BASE.reggie, top: { type: 'blazer', col: '#1E1E24', shirt: '#FFFFFF', tie: '#8A1C2E' }, bottom: { type: 'trousers', col: '#1E1E24' } };

const WHO = { A1: 'tom', A2: 'rita', B1: 'ben', B2: 'tony', C1: 'priya', C2: 'reggie', hook: 'tom', outro: 'reggie' };
const ST = { tom: 0, rita: 2600, ben: 5200, tony: 7800, priya: 10400, reggie: 13000 };
const NAMES = { tom: ['TOM', '#3C6FB4'], rita: ['RITA', '#8E5BD6'], ben: ['BEN', '#E27D3C'], tony: ['CHEF TONY', '#C2504A'], priya: ['PRIYA', '#2F8A7E'], reggie: ['REGGIE', '#8A1C2E'] };
const HERX = 600, NBX = -180, FY = 60, SEAT = 330, TB = FY - 410;
const HER = CAST.her_restaurant;
const G = { her: geom(HER) }; for (const k of Object.keys(ST)) G[k] = geom(CAST[k]);

// ---------------- background: a London bistro, one "station" per level (prerendered, blurred)
const BX0 = -1800, BY0 = -2700, BW = 17400, BH = 3500, BS = 0.5, FLOOR = -380;
const WALL = { tom: ['#F4D7B5', '#E7B98B'], rita: ['#BFD9C9', '#9CC2AE'], ben: ['#C9B8E0', '#A894CC'], tony: ['#F2B8A0', '#E39477'], priya: ['#A9D2D8', '#86BAC4'], reggie: ['#E5B0B8', '#C98591'] };
function pendant(c, x, y, len, col) { c.strokeStyle = '#4A3A2E'; c.lineWidth = 5; c.beginPath(); c.moveTo(x, -2700); c.lineTo(x, y - len); c.stroke(); paint(c, q => { q.m(x - 90, y); q.l(x + 90, y); q.l(x + 50, y - len * 0.5); q.l(x - 50, y - len * 0.5); q.z(); }, col, { sd: 6, hd: 4 }); c.fillStyle = 'rgba(255,240,170,.7)'; c.beginPath(); c.ellipse(x, y + 4, 70, 12, 0, 0, TAU); c.fill(); }
function farTable(c, x, y, i) { c.fillStyle = '#FFFDF8'; c.fillRect(x - 130, y, 260, 22); c.fillStyle = ['#C2504A', '#3C6FB4', '#2F8A4A'][i % 3]; c.fillRect(x - 110, y + 22, 220, 150); c.fillStyle = '#6A4630'; c.fillRect(x - 8, y + 170, 16, 100);
  for (const s of [-1, 1]) { c.fillStyle = ['#5A4632', '#8A5A6A', '#3A4A5C', '#B0643E'][(i + (s > 0 ? 1 : 0)) % 4]; c.beginPath(); c.arc(x + s * 80, y - 140, 52, 0, TAU); c.fill(); c.fillRect(x + s * 80 - 60, y - 90, 120, 90); } }
function station(c, who, x0, i) {
  const [a, b] = WALL[who], L = x0 - 1300, Wd = 2600;
  const g = c.createLinearGradient(0, -2700, 0, FLOOR); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(L, -2700, Wd, FLOOR + 2700);
  c.fillStyle = shade(b, 0.82); c.fillRect(L, -950, Wd, FLOOR + 950); c.fillStyle = '#FFFDF8'; c.fillRect(L, -962, Wd, 18);
  c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 4; for (let k = 0; k < 14; k++) c.strokeRect(L + 40 + k * 190, -900, 160, 480);
  for (let k = 0; k < 3; k++) farTable(c, L + 450 + k * 800 + (i % 2) * 120, -700, i + k);
  for (let k = 0; k < 3; k++) pendant(c, L + 300 + k * 900 + hash(i * 7 + k) * 200, -1900 + (k % 2) * 140, 420, ['#E0474C', '#F2C14E', '#2F5A48'][(i + k) % 3]);
  if (who === 'tom') { // big arched window onto a street
    const wx = x0 - 330, wy = -2150; c.fillStyle = '#FFFDF8'; rr(c, wx - 30, wy - 30, 700, 1000, 40); c.fill(); const sg = c.createLinearGradient(0, wy, 0, wy + 940); sg.addColorStop(0, '#8EC8EE'); sg.addColorStop(1, '#E8F4FA'); c.fillStyle = sg; rr(c, wx, wy, 640, 940, 30); c.fill();
    for (let k = 0; k < 4; k++) { c.fillStyle = ['#D96A6A', '#E9A23B', '#6A8AD9', '#8CB369'][k]; c.fillRect(wx + 20 + k * 150, wy + 520 - (k % 2) * 90, 130, 420 + (k % 2) * 90); c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(wx + 50 + k * 150, wy + 580, 28, 40); c.fillRect(wx + 100 + k * 150, wy + 580, 28, 40); }
    c.fillStyle = '#FFFDF8'; c.fillRect(wx + 308, wy, 24, 940); c.fillRect(wx, wy + 440, 640, 24);
    c.fillStyle = '#C2504A'; c.beginPath(); c.moveTo(wx - 80, wy - 40); c.quadraticCurveTo(wx + 20, wy + 400, wx - 20, wy + 960); c.lineTo(wx - 130, wy + 960); c.closePath(); c.fill(); c.beginPath(); c.moveTo(wx + 720, wy - 40); c.quadraticCurveTo(wx + 620, wy + 400, wx + 660, wy + 960); c.lineTo(wx + 770, wy + 960); c.closePath(); c.fill(); }
  if (who === 'rita') { const fr = [[-520, -1900, 300, 380, '#E9A23B'], [-130, -2050, 360, 260, '#8E5BD6'], [300, -1850, 260, 340, '#3C6FB4'], [640, -2000, 320, 240, '#EE5E9A']]; for (const [dx, dy, w, h, col] of fr) { c.fillStyle = '#6A4630'; c.fillRect(x0 + dx - 14, dy - 14, w + 28, h + 28); c.fillStyle = col; c.fillRect(x0 + dx, dy, w, h); c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.arc(x0 + dx + w * 0.7, dy + h * 0.3, w * 0.12, 0, TAU); c.fill(); c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.moveTo(x0 + dx, dy + h); c.lineTo(x0 + dx + w * 0.4, dy + h * 0.5); c.lineTo(x0 + dx + w * 0.7, dy + h * 0.8); c.lineTo(x0 + dx + w, dy + h * 0.55); c.lineTo(x0 + dx + w, dy + h); c.fill(); }
    c.fillStyle = '#2B2F3A'; rr(c, x0 + 700, -1560, 400, 520, 18); c.fill(); c.fillStyle = '#FFFDF8'; c.font = '46px Unb9'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('SPECIALS', x0 + 900, -1470); c.font = '38px Cav7'; ['fish & chips', 'pasta', 'soup'].forEach((s, k) => c.fillText(s, x0 + 900, -1340 + k * 90)); }
  if (who === 'ben') { c.fillStyle = '#5A3A22'; c.fillRect(x0 - 560, -1700, 1500, 40); c.fillRect(x0 - 560, -1380, 1500, 40);
    for (let r = 0; r < 2; r++) for (let k = 0; k < 15; k++) { const bx = x0 - 520 + k * 98, by = -1700 + r * 320 - 6; c.fillStyle = ['#2F8A4A', '#E0474C', '#8E5BD6', '#E9A23B', '#3C6FB4'][(k + r) % 5]; c.fillRect(bx, by - 200, 40, 200); c.fillRect(bx + 10, by - 260, 20, 70); c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(bx + 6, by - 150, 10, 110); }
    c.fillStyle = '#6A4630'; c.fillRect(x0 - 600, -1020, 1700, 70); c.fillStyle = '#4A2E1C'; c.fillRect(x0 - 600, -950, 1700, 560); }
  if (who === 'tony') { c.fillStyle = '#C9CED6'; c.fillRect(x0 - 560, -1500, 1500, 60); c.fillStyle = '#FFB347'; c.globalAlpha = 0.85; c.fillRect(x0 - 560, -1420, 1500, 420); c.globalAlpha = 1; c.fillStyle = '#B9BFC8'; c.fillRect(x0 - 560, -1000, 1500, 60);
    for (let k = 0; k < 7; k++) { const px = x0 - 480 + k * 220; c.strokeStyle = '#7A828E'; c.lineWidth = 8; c.beginPath(); c.moveTo(px, -2000); c.lineTo(px, -1760); c.stroke(); c.fillStyle = '#3A3F4B'; c.beginPath(); c.arc(px, -1640, 100, 0, TAU); c.fill(); c.fillStyle = '#9AA0AA'; c.beginPath(); c.arc(px, -1640, 70, 0, TAU); c.fill(); }
    c.fillStyle = 'rgba(255,255,255,.9)'; c.fillRect(x0 + 40, -1300, 120, 40); c.fillRect(x0 + 60, -1400, 80, 100); c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.arc(x0 + 100, -1250, 56, 0, TAU); c.fill(); }
  if (who === 'priya') { c.fillStyle = '#5A3A22'; c.fillRect(x0 - 600, -1020, 900, 640); c.fillStyle = '#7A5636'; c.fillRect(x0 - 620, -1060, 940, 50); c.fillStyle = '#FFFDF8'; rr(c, x0 - 420, -1180, 260, 130, 10); c.fill(); c.fillStyle = '#2B2F3A'; c.font = '34px Unb9'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('BOOKINGS', x0 - 290, -1115);
    c.fillStyle = '#6A4630'; c.fillRect(x0 + 450, -1900, 500, 520); for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) { c.fillStyle = '#2B1A1A'; c.beginPath(); c.arc(x0 + 520 + k * 120, -1830 + r * 120, 48, 0, TAU); c.fill(); c.fillStyle = ['#8A1C2E', '#B8303A', '#2F5A48'][(r + k) % 3]; c.fillRect(x0 + 505 + k * 120, -1860 + r * 120, 30, 60); }
    c.fillStyle = '#7A4A2A'; c.fillRect(x0 + 480, -1220, 120, 190); c.fillStyle = '#4FA86A'; for (let k = 0; k < 7; k++) { c.beginPath(); c.ellipse(x0 + 540 + Math.cos(k) * 80, -1330 - k * 38, 90, 36, k * 0.6, 0, TAU); c.fill(); } }
  if (who === 'reggie') { c.fillStyle = '#8A1C2E'; c.fillRect(x0 - 760, -2700, 380, 2300); c.fillRect(x0 + 380, -2700, 380, 2300); c.fillStyle = 'rgba(0,0,0,.2)'; for (let k = 0; k < 6; k++) { c.fillRect(x0 - 760 + k * 64, -2700, 20, 2300); c.fillRect(x0 + 380 + k * 64, -2700, 20, 2300); }
    c.fillStyle = '#C9A040'; rr(c, x0 - 260, -2050, 560, 800, 30); c.fill(); const mg = c.createLinearGradient(x0 - 230, -2020, x0 + 270, -1280); mg.addColorStop(0, '#E6F3FA'); mg.addColorStop(1, '#9CC0D8'); c.fillStyle = mg; rr(c, x0 - 230, -2020, 500, 740, 20); c.fill();
    c.strokeStyle = '#C9A040'; c.lineWidth = 10; c.beginPath(); c.moveTo(x0 + 20, -2700); c.lineTo(x0 + 20, -2300); c.stroke(); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; c.strokeStyle = '#C9A040'; c.lineWidth = 6; c.beginPath(); c.moveTo(x0 + 20, -2300); c.lineTo(x0 + 20 + Math.cos(a) * 190, -2300 + Math.sin(a) * 60 + 90); c.stroke(); c.fillStyle = 'rgba(255,240,170,.9)'; c.beginPath(); c.arc(x0 + 20 + Math.cos(a) * 190, -2300 + Math.sin(a) * 60 + 80, 22, 0, TAU); c.fill(); } }
}
function drawRoom(c) {
  c.fillStyle = '#F3E6D0'; c.fillRect(BX0, BY0, BW, 3500);
  Object.keys(ST).forEach((w, i) => station(c, w, ST[w], i));
  const fg = c.createLinearGradient(0, FLOOR, 0, 800); fg.addColorStop(0, '#A8734A'); fg.addColorStop(1, '#8A5A38'); c.fillStyle = fg; c.fillRect(BX0, FLOOR, BW, 800 - FLOOR);
  c.fillStyle = '#6A4630'; c.fillRect(BX0, FLOOR - 14, BW, 24);
  c.strokeStyle = 'rgba(0,0,0,.14)'; c.lineWidth = 3; for (let y = FLOOR + 40; y < 800; y += 60) { c.beginPath(); c.moveTo(BX0, y); c.lineTo(BX0 + BW, y); c.stroke(); } for (let r = 0, y = FLOOR; y < 800; y += 60, r++) for (let x = BX0 + (r % 2) * 150; x < BX0 + BW; x += 300) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 60); c.stroke(); }
}
const BGS = createCanvas(Math.round(BW * BS), Math.round(BH * BS)), bgc = BGS.getContext('2d');
bgc.scale(BS, BS); bgc.translate(-BX0, -BY0); drawRoom(bgc);
const BGB = createCanvas(BGS.width, BGS.height); { const c = BGB.getContext('2d'); c.filter = 'blur(2.5px)'; c.drawImage(BGS, 0, 0); }

// ---------------- dishes (drawn on the table line y = 0 in local coords)
function plate(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); paint(c, q => q.e(0, -12, 175, 30), '#FFFDF8', { sd: 8, hd: 5, lw: 4 }); c.fillStyle = 'rgba(0,0,0,.08)'; c.beginPath(); c.ellipse(0, -14, 125, 18, 0, 0, TAU); c.fill(); c.restore(); }
function fish(c, x, y, s = 1, wig = 0) { plate(c, x, y, s); c.save(); c.translate(x, y - 56 * s); c.scale(s, s);
  paint(c, q => { q.m(100, 0); q.l(165, -42 + wig); q.l(160, 42 + wig); q.z(); }, '#7FA4BC', { sd: 3, hd: 2, lw: 3 });
  paint(c, q => q.e(0, 0, 112, 44), '#93B9D1', { sd: 8, hd: 5, lw: 4, inner: k => { k.fillStyle = 'rgba(255,255,255,.35)'; k.fillRect(-100, 6, 200, 28); k.strokeStyle = 'rgba(40,70,100,.4)'; k.lineWidth = 3; for (let i = -2; i < 4; i++) { k.beginPath(); k.arc(i * 28, -8, 16, 0.3, 2.3); k.stroke(); } } });
  c.fillStyle = '#FFFDF8'; c.beginPath(); c.arc(-76, -10, 11, 0, TAU); c.fill(); c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(-73, -9, 6, 0, TAU); c.fill();
  c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(40, 52, 22, 0, TAU); c.fill(); c.strokeStyle = '#E0A82E'; c.lineWidth = 4; c.stroke(); c.restore(); }
function pasta(c, x, y, s = 1) { plate(c, x, y, s); c.save(); c.translate(x, y - 40 * s); c.scale(s, s);
  paint(c, q => q.e(0, 0, 105, 44), '#F2D27A', { sd: 8, hd: 5, lw: 4, inner: k => { k.strokeStyle = 'rgba(190,140,40,.7)'; k.lineWidth = 5; for (let i = 0; i < 4; i++) { k.beginPath(); k.ellipse(0, -2 + i * 2, 90 - i * 18, 32 - i * 6, 0, 0.2, TAU - 0.3); k.stroke(); } } });
  paint(c, q => q.e(0, -26, 52, 18), '#D9483B', { sd: 3, hd: 2, lw: 3 }); paint(c, q => { q.m(-6, -40); q.q(30, -72, 62, -38); q.q(30, -30, -6, -40); q.z(); }, '#4FA86A', { sd: 3, hd: 2, lw: 3 }); c.restore(); }
function cloche(c, x, y, lift, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); paint(c, q => q.e(0, -12, 180, 32), '#C9CED6', { sd: 8, hd: 5, lw: 4 }); c.translate(0, -lift);
  paint(c, q => { q.m(-165, -22); q.b(-165, -190, 165, -190, 165, -22); q.z(); }, '#DCE1E8', { sd: 12, hd: 7, lw: 5, inner: k => { k.fillStyle = 'rgba(255,255,255,.7)'; k.beginPath(); k.ellipse(-80, -110, 22, 54, 0.5, 0, TAU); k.fill(); } }); c.fillStyle = '#C9CED6'; c.beginPath(); c.arc(0, -184, 18, 0, TAU); c.fill(); c.strokeStyle = UI.C.oliveD; c.lineWidth = 4; c.stroke(); c.restore(); }
function steam(c, x, y, t, a = 1) { c.save(); c.strokeStyle = rgba('#FFFFFF', 0.7 * a); c.lineWidth = 9; c.lineCap = 'round'; for (let i = 0; i < 3; i++) { const ph = (t * 0.8 + i / 3) % 1; c.globalAlpha = a * (1 - ph); c.beginPath(); c.moveTo(x + (i - 1) * 60, y - ph * 200); c.quadraticCurveTo(x + (i - 1) * 60 + 22, y - ph * 200 - 40, x + (i - 1) * 60, y - ph * 200 - 80); c.stroke(); } c.restore(); }

// ---------------- table
const TXL = 230, TXR = 1050;
function table(c, x0) {
  const L = x0 + TXL, R = x0 + TXR, top = TB;
  paint(c, q => { q.m(L - 24, top); q.l(R + 24, top); q.l(R + 40, top + 90); q.l(L - 40, top + 90); q.z(); }, '#FFFDF8', { sd: 8, hd: 5, lw: 4 });
  c.fillStyle = '#E0474C'; c.fillRect(L - 36, top + 62, R - L + 72, 28);
  paint(c, q => { q.m(L - 40, top + 90); q.l(R + 40, top + 90); q.l(R + 60, 900); q.l(L - 60, 900); q.z(); }, '#F6F0E6', { sd: 12, hd: 6, lw: 4, inner: k => { k.fillStyle = 'rgba(224,71,76,.35)'; for (let ix = 0; ix < 20; ix++) for (let iy = 0; iy < 14; iy++) if ((ix + iy) % 2 === 0) k.fillRect(L - 60 + ix * 46, top + 90 + iy * 46, 46, 46); } });
}
// what is on the table at time t (fish stays at the left, extras appear on events)
function dishes(c, t, L, x0) {
  const ev = lvEv(L), fx = x0 + 440, sx = x0 + 800, y = TB;
  if (L === 'B1' && ev.swap) { const k = P(t, ev.swap, ev.swap + 0.45), k2 = P(t, ev.swap + 0.5, ev.swap + 0.95);
    if (k < 1) fish(c, lerp(fx, x0 - 260, eIn(k)), y - 4 - 200 * Math.sin(k * Math.PI) * 0.4, 1); else if (k2 > 0) pasta(c, lerp(x0 - 260, fx, eOut(k2)), y - 4 - 120 * Math.sin(k2 * Math.PI), 1); return; }
  const wig = Math.sin(t * 9) * 4;
  if (L === 'C2' && ev.both && t > ev.both - 0.5) { const k = eBack(P(t, ev.both - 0.35, ev.both + 0.05), 2.2), k2 = eBack(P(t, ev.both + 0.15, ev.both + 0.55), 2.2); fish(c, fx, y - 4, 1); pasta(c, sx, y - 4 - (1 - k) * 600, 1); if (k2 > 0) { c.save(); c.translate(x0 + 620, y - 4 - (1 - k2) * 500); c.scale(0.7, 0.7); c.fillStyle = '#E9B23B'; c.beginPath(); c.ellipse(0, -20, 80, 40, 0, 0, TAU); c.fill(); c.strokeStyle = '#8A6A2A'; c.lineWidth = 5; c.stroke(); c.restore(); } return; }
  fish(c, fx, y - 4, 1, wig);
  if (L === 'A1' && ev.fish) { const k = P(t, ev.fish - 0.1, ev.fish + 0.4); if (k > 0) fish(c, sx, y - 4 - (1 - eBack(k, 1.6)) * 700, 1, wig); }
}

// ---------------- characters
function chefHat(c, g, head) { const x = head.x, y = head.y - g.hh * 0.62, hw = g.hw; paint(c, q => { q.m(x - hw * 0.95, y); q.b(x - hw * 1.5, y - 170, x - hw * 0.6, y - 300, x - hw * 0.2, y - 230); q.b(x + hw * 0.1, y - 340, x + hw * 0.9, y - 280, x + hw * 0.55, y - 200); q.b(x + hw * 1.4, y - 150, x + hw * 1.0, y - 20, x + hw * 0.95, y); q.z(); }, '#FFFDF8', { sd: 8, hd: 5 }); c.fillStyle = '#EDE6DA'; c.fillRect(x - hw * 0.97, y - 30, hw * 1.94, 40); }
function bowTie(cc, g) { const y = g.ySh + 40; cc.fillStyle = '#8A1C2E'; cc.beginPath(); cc.moveTo(0, y); cc.lineTo(-34, y - 22); cc.lineTo(-34, y + 22); cc.closePath(); cc.fill(); cc.beginPath(); cc.moveTo(0, y); cc.lineTo(34, y - 22); cc.lineTo(34, y + 22); cc.closePath(); cc.fill(); }
function apron(cc, g, col = '#FFFDF8', text = null) { const y = g.ySh + 140; paint(cc, q => { q.m(-g.sw * 0.62, y); q.l(g.sw * 0.62, y); q.l(g.sw * 0.78, y + 560); q.l(-g.sw * 0.78, y + 560); q.z(); }, col, { sd: 8, hd: 4, inner: k => { if (text) { k.fillStyle = '#2B2F3A'; k.font = '34px Unb9'; k.textAlign = 'center'; k.textBaseline = 'middle'; k.fillText(text, 0, y + 90); } } }); cc.strokeStyle = shade(col, 0.8); cc.lineWidth = 8; cc.beginPath(); cc.moveTo(-g.sw * 0.55, y); cc.lineTo(-g.hw * 0.5, g.ySh + 10); cc.moveTo(g.sw * 0.55, y); cc.lineTo(g.hw * 0.5, g.ySh + 10); cc.stroke(); }
function badge(cc, g, text) { cc.fillStyle = '#F2C14E'; rr(cc, g.sw * 0.1, g.ySh + 110, 150, 44, 8); cc.fill(); cc.fillStyle = '#2B2F3A'; cc.font = '19px Unb9'; cc.textAlign = 'center'; cc.textBaseline = 'middle'; cc.fillText(text, g.sw * 0.1 + 75, g.ySh + 133); }
function sweat(cc, head, hh, hw, t, k) { if (k <= 0) return; cc.fillStyle = rgba('#7FD0FF', 0.9 * k); for (let i = 0; i < 3; i++) { const ph = (t * 1.3 + i / 3) % 1, x = head.x + (i - 1) * hw * 0.8, y = head.y - hh * 0.6 + ph * hh * 1.2; cc.beginPath(); cc.moveTo(x, y - 22); cc.quadraticCurveTo(x + 14, y + 4, x, y + 12); cc.quadraticCurveTo(x - 14, y + 4, x, y - 22); cc.fill(); } }
function put(c, cfg, st, x, y = FY, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); const r = human(c, cfg, st); c.restore(); return { x: x + r.head.x * s, y: y + r.head.y * s, hh: r.hh * s, r }; }
const tray = () => (ctx) => { ctx.translate(-10, -30); paint(ctx, q => q.e(0, 0, 150, 18), '#C9CED6', { sd: 6, hd: 3, lw: 3 }); };

function waiter(c, t, L, who, x) {
  const g = G[who], cfg = CAST[who], ev = lvEv(L);
  const st = { t, talk: talk(who, t), mood: 'happy', turn: 0.35, look: 0.8, armL: reach(g, -1, -g.sw * 0.35, g.ySh + 330), armR: reach(g, 1, g.sw * 0.35, g.ySh + 330) };
  const l = (L || '').toLowerCase();
  if (speaking(l + '_x', t, 0.05)) { const u = (t - SP[l + '_x'].t) * 4; st.armR = reach(g, 1, g.sw * 1.6 + Math.sin(u) * 30, g.ySh + 280 + Math.cos(u) * 30); }
  if (who === 'tom') { st.afterTorso = cc => apron(cc, g, '#FFFDF8'); st.items = {};
    if (L === 'A1') { if (SP.a1_her && t > SP.a1_her.t + 0.3 && t < SP.a1_x.t) { st.mood = 'worried'; st.look = 0.4; } if (speaking('a1_x', t, 0.05, 0.3)) { st.mood = 'happy'; st.laugh = true; st.armR = reach(g, 1, g.sw * 2.4, g.ySh - 260 + Math.sin(t * 8) * 25); } if (ev.fish && t > ev.fish) { st.mood = 'smug'; st.armR = reach(g, 1, g.sw * 2.2, g.ySh + 20); } } }
  if (who === 'rita') { st.afterTorso = cc => apron(cc, g, '#2B2F3A'); st.front = (cc, gg) => { cc.fillStyle = '#EE5E9A'; cc.beginPath(); cc.arc(gg.head.x + g.hw * 0.2, gg.head.y - g.hh * 0.95, 26, 0, TAU); cc.fill(); };
    if (L === 'A2') { if (SP.a2_her && t > SP.a2_her.t + 0.9 && t < SP.a2_x.t) st.mood = 'skeptical'; if (speaking('a2_x', t, 0.2, 0.9)) { st.mood = 'smug'; st.armR = reach(g, 1, g.sw * 1.3, g.ySh + 300); st.armL = reach(g, -1, -g.sw * 1.3, g.ySh + 300); st.tilt = 0.05; } } }
  if (who === 'ben') { st.afterTorso = cc => apron(cc, g, '#EDEAE3');
    if (L === 'B1') { if (SP.b1_her && t > SP.b1_her.t + 0.5) st.mood = 'worried'; if (speaking('b1_x', t, 0.05)) { st.mood = 'worried'; st.armL = reach(g, -1, -g.sw * 0.1, g.ySh + 100); st.armR = reach(g, 1, g.sw * 0.1, g.ySh + 100); }
      if (ev.swap && t > ev.swap - 0.1 && t < ev.swap + 1.0) { st.mood = 'happy'; st.armR = reach(g, 1, g.sw * 3.0, g.ySh + 380 + Math.sin(P(t, ev.swap, ev.swap + 1.0) * Math.PI) * 120); } } }
  if (who === 'tony') { st.afterTorso = cc => { apron(cc, g, '#FFFDF8'); cc.fillStyle = '#E0474C'; cc.beginPath(); cc.moveTo(-g.hw * 0.6, g.ySh + 20); cc.lineTo(g.hw * 0.6, g.ySh + 20); cc.lineTo(0, g.ySh + 110); cc.closePath(); cc.fill(); }; st.front = (cc, gg) => chefHat(cc, g, gg.head);
    if (L === 'B2') { const hs = SP.b2_her; if (hs && t > hs.t + 1.0) st.mood = 'skeptical'; if (speaking('b2_x', t, 0.05, 0.2)) { const u = (t - SP.b2_x.t) / SP.b2_x.d; st.mood = u < 0.55 ? 'angry' : 'worried'; if (u < 0.55) { st.armL = reach(g, -1, -g.sw * 1.7, g.ySh + 20); st.armR = reach(g, 1, g.sw * 1.9, g.ySh + 20); } else { st.armR = reach(g, 1, g.sw * 0.6, g.headY + 200); st.look = 0.2; } }
      if (ev.rim && t > ev.rim && t < ev.rim + 1.2) { st.mood = 'smug'; st.laugh = true; } } }
  if (who === 'priya') { st.afterTorso = cc => badge(cc, g, 'MANAGER');
    if (L === 'C1') { if (SP.c1_her && t > SP.c1_her.t + 1.5 && t < SP.c1_x.t) st.mood = 'neutral'; if (speaking('c1_x', t, 0.05, 1.5)) { st.mood = 'happy'; st.armL = reach(g, -1, -g.sw * 2.4, g.ySh + 100); st.armR = reach(g, 1, g.sw * 2.4, g.ySh + 100); } } }
  if (who === 'reggie') { st.afterTorso = cc => { bowTie(cc, g); cc.fillStyle = '#FFFDF8'; cc.fillRect(-g.sw * 1.45, g.ySh + 300, 120, 190); };
    st.mood = 'neutral';
    if (L === 'C2') { const he = endOf('c2_her'); if (SP.c2_her && t > SP.c2_her.t + 2.0) st.mood = 'worried'; if (t > he - 0.2) { st.mood = 'worried'; st.look = 0.4; st.lookY = 0.6; }
      if (speaking('c2_x', t, 0.05, 0.4)) { const u = (t - SP.c2_x.t) / SP.c2_x.d; st.mood = u > 0.35 ? 'happy' : 'shock'; st.armR = reach(g, 1, g.sw * 0.5, g.ySh + 140); st.tilt = 0.05; }
      if (SP.c2_her2 && t > SP.c2_her2.t - 0.3) { st.mood = 'happy'; st.armR = reach(g, 1, g.sw * 2.0, g.ySh + 20); }
      const swK = SP.c2_her ? P(t, SP.c2_her.t + 3, SP.c2_her.t + 4) : 0; st.front = (cc, gg) => sweat(cc, gg.head, g.hh, g.hw, t, swK); } }
  return put(c, cfg, st, x);
}
function herState(t, L) {
  const g = G.her, ev = lvEv(L); const rest = { l: reach(g, -1, -g.sw * 1.2, -760), r: reach(g, 1, g.sw * 1.2, -760) };
  const st = { t, talk: talk('her', t), mood: 'happy', turn: -0.45, look: -0.7, armL: rest.l, armR: rest.r };
  const l = (L || '').toLowerCase(); const hs = SP[l + '_her'];
  if (hs && speaking(l + '_her', t, 0.05)) { const gg = Math.sin((t - hs.t) * 4.5); st.armL = reach(g, -1, -g.sw * 1.9 + gg * 40, -900 - Math.abs(gg) * 90); }
  if (L === 'hook') st.mood = 'smug';
  if (L === 'A1') { if (speaking('a1_her', t, 0.05)) { st.armL = reach(g, -1, -g.sw * 2.8, -980 + Math.sin(t * 9) * 40); st.mood = 'annoyed'; } if (ev.fish && t > ev.fish) st.mood = t < ev.fish + 1.0 ? 'shock' : 'worried'; else if (SP.a1_x && t > SP.a1_x.t) st.mood = 'surprised'; }
  if (L === 'A2') { if (speaking('a2_her', t, 0.05)) { st.mood = 'annoyed'; } if (SP.a2_x && t > SP.a2_x.t + 0.5) st.mood = 'worried'; }
  if (L === 'B1') { if (speaking('b1_her', t, 0.05)) st.mood = 'neutral'; if (ev.swap && t > ev.swap + 0.5) st.mood = 'happy'; }
  if (L === 'B2') { if (speaking('b2_her', t, 0.05)) st.mood = 'neutral'; if (SP.b2_x && t > SP.b2_x.t + 0.5) st.mood = 'skeptical'; if (ev.rim && t > ev.rim) st.mood = 'surprised'; }
  if (L === 'C1') { if (SP.c1_x && t > SP.c1_x.t - 0.2) st.mood = 'happy'; }
  if (L === 'C2') {
    if (speaking('c2_her', t, 0.1)) { st.mood = 'smug'; st.tilt = -0.04; st.armL = reach(g, -1, -g.sw * 1.7 + Math.sin(t * 2.4) * 40, -960 + Math.cos(t * 2.4) * 40); st.items = { L: items.wine(0.6) }; }
    if (t > endOf('c2_her') + 0.2) st.mood = 'neutral';
    if (SP.c2_x && t > SP.c2_x.t + 0.6) st.mood = 'shock';
    if (SP.c2_her2 && t > SP.c2_her2.t - 0.3) { st.mood = 'smug'; st.armL = reach(g, -1, -g.sw * 1.2, -900); st.armR = reach(g, 1, g.sw * 1.6, -900); st.items = { R: items.fork(false) }; }
    if (ev.both && t > ev.both + 0.4) { st.mood = 'happy'; st.items = { R: items.fork(true) }; }
  }
  if (L === 'outro') { st.mood = 'happy'; st.turn = 0; st.look = 0; st.armL = reach(g, -1, -g.sw * 1.5 + Math.sin(t * 8) * 40, g.headY - 220); st.armR = reach(g, 1, g.sw * 1.0, g.ySh + 300); }
  return st;
}
function drawHer(c, t, L, x, s = 1, y = FY + SEAT) { return put(c, HER, herState(t, L), x, y, s); }

// ---------------- composition
function world(c, t, L) {
  c.drawImage(BGB, BX0, BY0, BW, BH);
  const who = WHO[L], x0 = ST[who]; const heads = {};
  heads[who] = waiter(c, t, L, who, x0 + NBX);
  heads.her = drawHer(c, t, L, x0 + HERX);
  table(c, x0);
  dishes(c, t, L, x0);
  const ev = lvEv(L);
  if (L === 'C2' && ev.both && t > ev.both) { c.fillStyle = C.gold; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + t, r = 90 + 160 * P(t, ev.both, ev.both + 0.8); c.globalAlpha = 1 - P(t, ev.both + 0.3, ev.both + 1.0); UI.star(c, x0 + 620 + Math.cos(a) * r, TB - 300 + Math.sin(a) * r, 24, a); } c.globalAlpha = 1; }
  if (L === 'B2' && ev.rim && t > ev.rim && t < ev.rim + 1.4) { c.fillStyle = C.gold; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU, r = 60 + 140 * P(t, ev.rim, ev.rim + 0.8); c.globalAlpha = 1 - P(t, ev.rim + 0.3, ev.rim + 1.2); UI.star(c, x0 - 100 + Math.cos(a) * r, -1200 + Math.sin(a) * r, 22, a); } c.globalAlpha = 1; }
  return heads;
}

// ---------------- camera
function shotFor(t) {
  const sc = sceneAt(t), L = sc.id; const who = WHO[L], x0 = ST[who];
  const herHY = FY + SEAT + G.her.headY, nbHY = FY + G[who].headY;
  const hx = x0 + HERX, nx = x0 + NBX;
  const two = { x: x0 + 250, y: Math.min(herHY, nbHY) + 230, z: 0.88, r: 0 };
  if (L === 'hook' || L === 'outro') return { x: x0 + 240, y: -1000, z: 0.9, r: 0 };
  const u = t - sc.s; const ev = sc.ev || {};
  if (u < 1.15) return { ...two, z: 0.84, cut: u < 0.85 };
  const l = L.toLowerCase(); const her = l + '_her', oth = l + '_x', nar = l + '_nar';
  const herC = { x: hx - 40, y: herHY + 120, z: 1.45, r: -0.5 }, othC = { x: nx + 40, y: nbHY + 120, z: L === 'C2' ? 1.55 : 1.4, r: 0.5 };
  const tableShot = { x: x0 + 420, y: TB - 200, z: 1.05, r: 0 };
  if (L === 'A1' && ev.fish && t > ev.fish - 0.5 && t < SP.a1_nar.t - 0.1) return tableShot;
  if (L === 'B1' && ev.swap && t > ev.swap - 0.4 && t < SP.b1_nar.t - 0.1) return tableShot;
  if (L === 'B2' && ev.rim && t > ev.rim - 0.5 && t < SP.b2_nar.t - 0.1) return { ...two, z: 0.92 };
  if (L === 'A2' && speaking('a2_her', t, 0.3) && t > SP.a2_her.t + SP.a2_her.d * 0.4) return { ...two, z: 0.95 };
  if (L === 'C2') {
    const he = endOf('c2_her');
    if (t < SP.c2_her.t - 0.2) return { ...two, z: 1.0 };
    if (t < he + 0.1) return { ...herC, z: lerp(1.35, 1.75, P(t, SP.c2_her.t, he)), y: lerp(herHY + 125, herHY + 95, P(t, SP.c2_her.t, he)) };
    if (t < SP.c2_x.t + 1.2) return { ...othC, cut: t < he + 0.15 };
    if (t < SP.c2_her2.t - 0.2) return { ...two, z: 0.95 };
    if (ev.both && t > ev.both - 0.6 && t < SP.c2_nar.t + 1.0) return tableShot;
    if (t < SP.c2_nar.t - 0.1) return { ...herC, z: 1.35, y: herHY + 150 };
    return { ...two, z: 0.85, y: two.y + 40 };
  }
  if (speaking(her, t, 0.3, 0.1)) return herC;
  if (SP[nar] && t >= SP[nar].t - 0.15) return { ...two, z: 0.9 };
  if (speaking(oth, t, 0.3, 0.3)) return othC;
  return two;
}
const CAM = E.simulateCamera(TL, shotFor, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'clank']);

// ---------------- NEW opener: a big restaurant menu, PASTA crossed out, "FISH?!" under a cloche
function drawHook(c, t) {
  c.save(); c.translate(540, 960); c.scale(0.62, 0.62); c.translate(-(ST.tom + 300), 1100); c.drawImage(BGB, BX0, BY0, BW, BH); c.restore();
  c.fillStyle = 'rgba(255,236,205,.35)'; c.fillRect(0, 0, W, HH);
  // gingham band at the top
  for (let ix = 0; ix < 24; ix++) for (let iy = 0; iy < 3; iy++) { c.fillStyle = (ix + iy) % 2 ? '#FFFDF8' : '#E0474C'; c.fillRect(ix * 46, iy * 46, 46, 46); }
  c.strokeStyle = 'rgba(0,0,0,.2)'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, 138); c.lineTo(W, 138); c.stroke();
  const rv = (SP.hook.words.find(w => /^рыб/.test(w[0].toLowerCase())) || [0, 4.0])[1] + SP.hook.t;
  const jolt = Math.sin(P(t, rv, rv + 0.6) * Math.PI * 5) * 0.06 * (1 - P(t, rv, rv + 0.6));
  const ang = Math.sin(t * 2.0) * 0.025 + jolt;
  // the menu card
  c.save(); c.translate(540, 610); c.rotate(ang);
  const mw = 700, mh = 780; c.fillStyle = 'rgba(0,0,0,.25)'; UI.rr(c, -mw / 2 + 14, -mh / 2 + 18, mw, mh, 36); c.fill();
  c.fillStyle = '#FFF8E8'; c.strokeStyle = C.oliveD; c.lineWidth = 10; UI.rr(c, -mw / 2, -mh / 2, mw, mh, 36); c.fill(); c.stroke();
  c.strokeStyle = '#C9A040'; c.lineWidth = 4; UI.rr(c, -mw / 2 + 24, -mh / 2 + 24, mw - 48, mh - 48, 24); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.font(c, 'Unb9', 84); c.fillStyle = C.oliveD; c.fillText('MENU', 0, -mh / 2 + 100); c.fillStyle = '#C9A040'; c.fillRect(-180, -mh / 2 + 170, 360, 6);
  // PASTA, crossed out
  c.save(); c.translate(0, -90); UI.font(c, 'Unb9', 116); c.fillStyle = '#5A4A3A'; c.fillText('PASTA', 0, 0); c.strokeStyle = '#E0474C'; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(-290, 12); c.lineTo(290, -16); c.stroke(); c.restore();
  c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(-250, 20, 500, 4);
  // FISH?!, circled
  c.save(); c.translate(0, 150); c.rotate(-0.04); const pk = 1 + 0.045 * Math.sin(t * 6); c.scale(pk, pk); UI.font(c, 'Unb9', 150); UI.strokeText(c, 'FISH?!', 0, 0, C.pink, C.white, 14); c.strokeStyle = C.pink; c.lineWidth = 10; c.beginPath(); c.ellipse(0, 6, 330, 118, 0, 0.25, TAU + 0.1); c.stroke(); c.restore();
  c.fillStyle = 'rgba(0,0,0,.18)'; UI.font(c, 'Nun9', 40); c.fillText('SOUP . SALAD . CAKE', 0, mh / 2 - 100);
  c.restore();
  // the cloche with a fish tail peeking out
  const lift = 70 * eOut(P(t, rv, rv + 0.35)) * (1 - 0.0) + Math.abs(Math.sin(t * 3.0)) * 12;
  c.save(); c.translate(540, 1075); c.scale(0.8, 0.8); const bob = Math.sin(t * 4) * 6; c.translate(0, bob);
  const tail = P(t, rv, rv + 0.3); if (tail > 0) { c.save(); c.translate(130, -110); c.rotate(Math.sin(t * 14) * 0.25); paint(c, q => { q.m(0, 0); q.l(90, -50); q.l(80, 50); q.z(); }, '#7FA4BC', { sd: 3, hd: 2, lw: 3 }); c.restore(); }
  cloche(c, 0, 0, lift, 1); steam(c, 0, -200 - lift, t); c.restore();
  const kk = eBack(P(t, rv, rv + 0.25), 2.4) * (1 - P(t, rv + 1.4, rv + 1.6));
  if (kk > 0) { c.save(); c.translate(870, 400); c.rotate(0.2); c.scale(kk, kk); UI.font(c, 'Unb9', 70); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, 'РЫБА?!', 0, 0, C.gold, C.oliveD, 14); c.restore(); }
  // two characters at the bottom: her with a fork, Tom holding a tray with a cloche
  { const g = G.her, st = { t, talk: 0, mood: 'annoyed', turn: 0.35, look: 0.6, armL: reach(g, -1, -g.sw * 0.4, g.ySh + 290), armR: reach(g, 1, g.sw * 2.3, g.ySh + 60 + Math.sin(t * 3) * 15), items: { R: items.fork(false) } }; c.save(); c.translate(280, 2420); c.scale(0.62, 0.62); human(c, HER, st); c.restore(); }
  { const g = G.tom, st = { t, talk: 0, mood: 'happy', turn: -0.35, look: -0.6, armL: reach(g, -1, -g.sw * 0.3, g.ySh + 200), armR: reach(g, 1, g.sw * 0.2, g.ySh + 210), afterTorso: cc => apron(cc, g, '#FFFDF8') }; c.save(); c.translate(820, 2480); c.scale(0.6, 0.6); human(c, CAST.tom, st); c.restore(); }
  const rk = lerp(0.92, 1, eBack(P(t, 0, 0.35), 1.8)) * (1 + 0.012 * Math.sin(t * 5));
  c.save(); c.translate(540, 1255); c.rotate(-0.05); c.scale(rk, rk);
  const lines = TL.cfg.hook_title; c.fillStyle = 'rgba(0,0,0,.22)'; UI.rr(c, -500 + 10, -150 + 14, 1000, 300, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; UI.rr(c, -500, -150, 1000, 300, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 900); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -78); UI.textFit(c, 'Unb9', 110, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 8, C.pink, C.white, 12); UI.textFit(c, 'Unb9', 64, lines[2][0], 900); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 98);
  c.restore();
  UI.levelBar(c, t, { id: 'hook' });
  const stT = SC.hook.stamp_t, sk = P(t, stT - 0.02, stT + 0.15);
  if (sk > 0) { const s2 = lerp(2.6, 1, eOut(sk)); c.save(); c.translate(540, 1740); c.rotate(-0.13); c.scale(s2, s2); c.globalAlpha = clamp(sk * 3); c.fillStyle = 'rgba(255,253,248,.92)'; UI.rr(c, -380, -90, 760, 180, 24); c.fill(); c.strokeStyle = C.pink; c.lineWidth = 14; UI.rr(c, -380, -90, 760, 180, 24); c.stroke(); UI.textFit(c, 'Unb9', 110, TL.cfg.stamp, 700); c.fillStyle = C.pink; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(TL.cfg.stamp, 0, 6); c.restore(); }
}
function drawOutro(c, t) {
  const s = SC.outro.s, u = t - s, o = SP.outro;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  const { textFit, strokeText, font, rr: R } = UI;
  c.save(); c.translate(210, lerp(2900, 2420, eBack(P(u, 0.4, 0.9), 1.4))); c.scale(0.6, 0.6); drawHer(c, t, 'outro', 0, 1, 0); c.restore();
  c.save(); c.translate(570, lerp(2800, 2330, eBack(P(u, 0.6, 1.1), 1.4))); c.scale(0.56, 0.56); waiter(c, t, 'outro', 'rita', 0); c.restore();
  c.save(); c.translate(900, lerp(3000, 2560, eBack(P(u, 0.5, 1.0), 1.4))); c.scale(0.55, 0.55); waiter(c, t, 'outro', 'tom', 0); c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const q = eBack(P(u, 0.35, 0.7), 2.2);
  c.save(); c.translate(540, 450); c.scale(q, q); font(c, 'Unb9', 74); strokeText(c, 'А КАК СКАЖЕШЬ', 0, -66, C.oliveD, C.white, 16); strokeText(c, 'ТЫ?', 0, 40, C.pink, C.white, 16); c.restore();
  const ex = [['Not this. Pasta! Pasta!', true], ["I think there's been a mistake.", false], ["There's been a mix-up.", false], ['Would it be possible to swap it?', false]];
  ex.forEach(([e, bad], i) => { const k = eBack(P(u, 1.05 + i * 0.22, 1.4 + i * 0.22), 2.2); if (k <= 0) return; c.save(); c.translate(540 + (i % 2 ? 30 : -30), 660 + i * 115 + Math.sin(t * 3 + i) * 5); c.scale(k, k); textFit(c, 'Nun9', 50, e, 800); const w = c.measureText(e).width + 70; c.fillStyle = 'rgba(0,0,0,.12)'; R(c, -w / 2 + 6, -44 + 8, w, 88, 44); c.fill(); c.fillStyle = bad ? '#B9B2A4' : [LVCOL.B1, LVCOL.B2, LVCOL.C1][i - 1]; R(c, -w / 2, -44, w, 88, 44); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke(); c.fillStyle = C.white; c.fillText(e, 0, 3); if (bad) { c.strokeStyle = C.red; c.lineWidth = 9; c.beginPath(); c.moveTo(-w / 2 + 20, 4); c.lineTo(w / 2 - 20, 0); c.stroke(); } c.restore(); });
  const ak = eOut(P(t, o.t + 1.3, o.t + 1.6));
  if (ak > 0) { c.save(); c.globalAlpha = ak; c.translate(540, 1170 + Math.sin(t * 7) * 10); font(c, 'Unb9', 46); c.fillStyle = C.oliveD; c.fillText('ПИШИ В КОММЕНТЫ', 0, 0); c.fillStyle = C.pink; c.beginPath(); c.moveTo(-40, 50); c.lineTo(40, 50); c.lineTo(0, 100); c.fill(); c.restore(); }
  const subT = (wordT('outro', 'подпиш') || o.t + 4.0) - 0.35;
  const sk = eBack(P(t, subT, subT + 0.3), 2);
  if (sk > 0) { const click = P(t, subT + 0.8, subT + 0.95), pressed = t > subT + 0.9; c.save(); c.translate(540, 1420); const ss = sk * (1 - 0.08 * Math.sin(click * Math.PI)); c.scale(ss, ss); c.fillStyle = pressed ? C.olive : C.pink; R(c, -250, -62, 500, 124, 62); c.fill(); font(c, 'Unb9', 44); c.fillStyle = C.white; c.fillText(pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4); c.restore();
    const mv = eIO(P(t, subT + 0.2, subT + 0.8)); UI.tapCursor(c, lerp(840, 610, mv), lerp(1700, 1440, mv), 1, P(t, subT + 0.85, subT + 1.4));
    if (pressed) { c.fillStyle = C.gold; for (let i = 0; i < 10; i++) { const a = i / 10 * 6.28, r = 120 + 200 * P(t, subT + 0.9, subT + 1.4); c.globalAlpha = 1 - P(t, subT + 0.9, subT + 1.6); UI.star(c, 540 + Math.cos(a) * r * 1.6, 1420 + Math.sin(a) * r, 16, a); } c.globalAlpha = 1; } }
  for (let ix = 0; ix < 24; ix++) for (let iy = 0; iy < 2; iy++) { c.fillStyle = (ix + iy) % 2 ? '#FFFDF8' : '#E0474C'; c.fillRect(ix * 46, iy * 46, 46, 46); }
}

// ---------------- frame
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
  if (sc.id === 'A1' && ev.fish) { const k = eBack(P(t, ev.fish + 0.3, ev.fish + 0.6), 2.4) * (1 - P(t, SP.a1_nar.t + 0.6, SP.a1_nar.t + 0.9)); if (k > 0) { c.save(); c.translate(780, 1200); c.rotate(-0.1); c.scale(k, k); UI.font(c, 'Unb9', 90); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, 'ЕЩЁ РЫБА!', 0, 0, C.gold, C.oliveD, 16); c.restore(); } }
  if (sc.id === 'B2' && ev.rim) { const k = eBack(P(t, ev.rim, ev.rim + 0.2), 2.4) * (1 - P(t, ev.rim + 1.3, ev.rim + 1.6)); if (k > 0) { c.save(); c.translate(540, 1250); c.rotate(-0.08); c.scale(k, k); UI.font(c, 'Unb9', 84); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, 'БА-ДУМ-ТСС!', 0, 0, C.gold, C.oliveD, 16); c.restore(); } }
  if (sc.id === 'C2') {
    const a = endOf('c2_her') + 0.3, b = SP.c2_x.t - 0.1;
    if (t > a && t < b) { const dots = Math.min(3, Math.floor((t - a) / 0.55) + 1); c.save(); c.globalAlpha = clamp((t - a) / 0.2) * clamp((b - t) / 0.15); UI.font(c, 'Unb9', 150); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, '.'.repeat(dots).padEnd(3, ' '), 540, 1450, C.white, C.oliveD, 16); UI.font(c, 'Nun9', 40); UI.strokeText(c, '*метрдотель в восторге*', 540, 1560, C.white, C.oliveD, 10); c.restore(); }
    const pk = ev.both ? eBack(P(t, ev.both + 0.5, ev.both + 0.8), 2.4) * (1 - P(t, SP.c2_nar.t + 0.4, SP.c2_nar.t + 0.7)) : 0;
    if (pk > 0) { c.save(); c.translate(540, 1180); c.rotate(-0.08); c.scale(pk, pk); UI.font(c, 'Unb9', 84); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, 'РЫБА + ПАСТА!', 0, 0, '#7CF29A', C.oliveD, 16); c.restore(); }
  }
  UI.card(c, t, sc); UI.captions(c, t); UI.sparkles(c, t);
  Hq.grain(c, W, HH, t, 0.04);
  UI.levelBar(c, t, sc, 1); UI.watermark(c); UI.levelIntro(c, t, sc); UI.levelIntroNext(c, t);
}
E.run('restaurant', NF, renderFrame);
