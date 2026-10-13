// "Haggling at a London flea market" episode renderer: node market.js start end out.mp4 | --png=f1,f2
const fs = require('fs');
const Hq = require('./hq'); const { CAST } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, noise1, mix, shade, rgba, paint, rr, softShadow, human, pug, items, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/market/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SC, SP, sceneAt, C, LVCOL } = UI;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS);
const talk = (who, t) => { let a = 0; for (const s of TL.speech) if (s.who === who && t >= s.t && t < s.t + s.d) { const i = Math.floor((t - s.t) * FPS); a = Math.max(a, s.env[Math.min(i, s.env.length - 1)] || 0); } return a; };
const speaking = (id, t, pre = 0, post = 0) => SP[id] && t >= SP[id].t - pre && t < SP[id].t + SP[id].d + post;
const endOf = id => SP[id].t + SP[id].d;
const TAU = Math.PI * 2;
const lvEv = L => (SC[L] && SC[L].ev) || {};
const wordT = (id, w) => { const s = SP[id]; if (!s) return null; const x = s.words.find(q => q[0].toLowerCase().replace(/[«»!?.,:]/g, '').startsWith(w)); return x ? s.t + x[1] : null; };

const WHO = { A1: 'del', A2: 'nana', B1: 'agnes', B2: 'rocky', C1: 'reggie', C2: 'barnaby', hook: 'del', outro: 'barnaby' };
const ST = { del: 0, nana: 2600, agnes: 5200, rocky: 7800, reggie: 10400, barnaby: 13000 };
const NAMES = { del: ['DEL', '#2F5A48'], nana: ['NANA', '#C2504A'], agnes: ['AGNES', '#8E78C8'], rocky: ['ROCKY', '#E0474C'], reggie: ['REGGIE', '#8A1C2E'], barnaby: ['BARNABY', '#7A5A3A'] };
const HERX = 600, NBX = -180, FY = 60, TOP = -680, ITX = 170;
const HER = CAST.her_market;
const G = { her: geom(HER) }; for (const k of ['del', 'nana', 'agnes', 'rocky', 'reggie', 'barnaby']) G[k] = geom(CAST[k]);

// ---------------- background: pastel terraces of a market street (prerendered, blurred)
const BX0 = -1800, BY0 = -4300, BW = 17400, BH = 5100, BS = 0.5;
const KERB = -380;
function terrace(c, x, w, i) {
  const cols = ['#F4B8C8', '#9CCBE8', '#F6DB8A', '#A8DCC4', '#C9B4E8', '#F7C29A'];
  const col = cols[i % cols.length], top = -2900 + (i % 2) * 120, base = KERB - 40;
  c.fillStyle = col; c.fillRect(x, top, w, base - top);
  c.fillStyle = '#FFFDF8'; c.fillRect(x - 6, top - 40, w + 12, 50); c.fillRect(x, base - 620, w, 26);
  for (let r = 0; r < 3; r++) for (let k = 0; k < 2; k++) { const wx = x + 110 + k * (w - 360), wy = top + 140 + r * 470; if (wy > base - 900) continue;
    c.fillStyle = '#FFFDF8'; c.fillRect(wx - 16, wy - 16, 172, 292); const g = c.createLinearGradient(wx, wy, wx + 140, wy + 260); g.addColorStop(0, '#BFDDF0'); g.addColorStop(1, '#6E8EAE'); c.fillStyle = g; c.fillRect(wx, wy, 140, 260); c.fillStyle = '#FFFDF8'; c.fillRect(wx + 64, wy, 12, 260); c.fillRect(wx, wy + 124, 140, 12);
    c.fillStyle = '#6EA86A'; c.fillRect(wx - 20, wy + 270, 180, 34); for (let f = 0; f < 6; f++) { c.fillStyle = ['#E0474C', '#F2C14E', '#EE5E9A'][f % 3]; c.beginPath(); c.arc(wx - 6 + f * 32, wy + 270, 12, 0, 6.3); c.fill(); } }
  // door
  const dx = x + w / 2 - 80; c.fillStyle = ['#1E2A4A', '#8A1C2E', '#2F5A48'][i % 3]; c.fillRect(dx, base - 560, 160, 560); c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(dx + 130, base - 280, 10, 0, 6.3); c.fill(); c.fillStyle = '#FFFDF8'; c.beginPath(); c.arc(dx + 80, base - 560, 80, Math.PI, 0); c.fill(); c.fillStyle = '#BFDDF0'; c.beginPath(); c.arc(dx + 80, base - 560, 64, Math.PI, 0); c.fill();
}
function drawStreet(c) {
  const sg = c.createLinearGradient(0, BY0, 0, -1500); sg.addColorStop(0, '#7FBDE6'); sg.addColorStop(1, '#D8EDF7'); c.fillStyle = sg; c.fillRect(BX0, BY0, BW, 3000);
  for (let i = 0; i < 26; i++) { const x = BX0 + hash(i) * BW, y = -3500 + hash(i * 3) * 400; c.fillStyle = 'rgba(255,255,255,.8)'; for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(x + k * 70, y - (k % 2) * 30, 66, 0, TAU); c.fill(); } }
  let i = 0; for (let x = BX0; x < BX0 + BW; x += 760, i++) terrace(c, x, 760, i);
  // distant stall awnings along the far pavement
  for (let x = BX0 + 200, k = 0; x < BX0 + BW; x += 1300, k++) { const ac = ['#E0474C', '#3C6FB4', '#2F5A48', '#E9A23B'][k % 4]; for (let s = 0; s < 8; s++) { c.fillStyle = s % 2 ? '#FFFDF8' : ac; c.fillRect(x + s * 100, KERB - 520, 100, 120); } c.fillStyle = '#6A4630'; c.fillRect(x + 20, KERB - 400, 16, 380); c.fillRect(x + 760, KERB - 400, 16, 380); c.fillStyle = ['#F2C14E', '#8CB369', '#EE5E9A'][k % 3]; c.fillRect(x, KERB - 200, 800, 160); }
  // bunting across the street
  for (let x = BX0; x < BX0 + BW; x += 1400) { c.strokeStyle = '#6A4630'; c.lineWidth = 5; c.beginPath(); c.moveTo(x, -2300); c.quadraticCurveTo(x + 700, -2050, x + 1400, -2300); c.stroke(); for (let f = 0; f < 12; f++) { const u = (f + 0.5) / 12, fx = x + u * 1400, fy = -2300 + 4 * 250 * u * (1 - u) * 1.0; c.fillStyle = ['#E0474C', '#FFFDF8', '#3C6FB4', '#F2C14E'][f % 4]; c.beginPath(); c.moveTo(fx - 40, fy); c.lineTo(fx + 40, fy); c.lineTo(fx, fy + 90); c.fill(); } }
  // street + cobbles
  c.fillStyle = '#9A9488'; c.fillRect(BX0, KERB - 40, BW, 60);
  const pg = c.createLinearGradient(0, KERB, 0, 800); pg.addColorStop(0, '#B8B0A2'); pg.addColorStop(1, '#A39A8A'); c.fillStyle = pg; c.fillRect(BX0, KERB + 20, BW, 800 - KERB);
  c.strokeStyle = 'rgba(0,0,0,.1)'; c.lineWidth = 3; for (let y = KERB + 60, r = 0; y < 800; y += 46 + r * 6, r++) for (let x = BX0 + (r % 2) * 40; x < BX0 + BW; x += 90 + r * 4) { c.beginPath(); c.ellipse(x, y, 38 + r * 2, 16 + r, 0, 0, TAU); c.stroke(); }
}
const BGS = createCanvas(Math.round(BW * BS), Math.round(BH * BS)), bgc = BGS.getContext('2d');
bgc.scale(BS, BS); bgc.translate(-BX0, -BY0); drawStreet(bgc);
const BGB = createCanvas(BGS.width, BGS.height); { const c = BGB.getContext('2d'); c.filter = 'blur(2.5px)'; c.drawImage(BGS, 0, 0); }

// ---------------- stall + goods
const STALL = { del: ['#2F5A48', '#E9A23B'], nana: ['#C2504A', '#F7E6EC'], agnes: ['#8E78C8', '#F3EDDF'], rocky: ['#22252E', '#E0474C'], reggie: ['#8A1C2E', '#F3EDDF'], barnaby: ['#5A4632', '#F2C14E'] };
function awning(c, x0, who) {
  const [a, b] = STALL[who]; const L = x0 - 760, R = x0 + 460, y = -2050;
  c.fillStyle = '#6A4630'; c.fillRect(L + 20, y, 26, FY - y - 20); c.fillRect(R - 46, y, 26, FY - y - 20);
  for (let s = 0; s < 12; s++) { const xx = L + s * (R - L) / 12, w = (R - L) / 12; c.fillStyle = s % 2 ? '#FFFDF8' : a; c.beginPath(); c.moveTo(xx, y - 220); c.lineTo(xx + w, y - 220); c.lineTo(xx + w, y); c.arc(xx + w / 2, y, w / 2, 0, Math.PI); c.closePath(); c.fill(); }
  c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 4; c.strokeRect(L, y - 220, R - L, 220);
  // name board
  c.fillStyle = b; rr(c, x0 - 420, y - 330, 560, 100, 20); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 5; c.stroke(); c.fillStyle = a; c.font = '52px Unb9'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText({ del: "DEL'S LAMPS", nana: 'NANA HATS', agnes: 'TEA & POTS', rocky: 'ROCK SHOP', reggie: 'FINE ART', barnaby: 'ANTIQUES' }[who], x0 - 140, y - 278);
}
function table(c, x0, who) {
  const [a, b] = STALL[who]; const L = x0 - 640, R = x0 + 340;
  paint(c, q => { q.m(L, TOP); q.l(R, TOP); q.l(R + 20, TOP + 420); for (let k = 0; k <= 10; k++) { const xx = lerp(R + 20, L - 20, k / 10); q.q(xx + (R - L) / 20, TOP + 470, xx, TOP + 420); } q.l(L - 20, TOP + 420); q.z(); }, a, { sd: 16, hd: 6, box: [L, TOP, R, TOP + 450], inner: k => { k.fillStyle = rgba(b, 0.85); for (let i = 0; i < 9; i++) k.fillRect(L + 40 + i * (R - L) / 9, TOP + 10, 22, 420); } });
  c.fillStyle = '#5A3A22'; c.fillRect(L + 30, TOP + 440, 22, FY - TOP - 460); c.fillRect(R - 50, TOP + 440, 22, FY - TOP - 460);
}
function lamp(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); paint(c, q => { q.m(-70, 0); q.l(70, 0); q.l(40, -40); q.l(-40, -40); q.z(); }, '#C9A040', { sd: 5, hd: 3 }); c.fillStyle = '#B88A30'; c.fillRect(-10, -240, 20, 200); paint(c, q => { q.m(-120, -220); q.l(120, -220); q.l(70, -380); q.l(-70, -380); q.z(); }, '#E8485C', { sd: 8, hd: 5, inner: k => { k.fillStyle = '#F2C14E'; k.fillRect(-120, -236, 240, 18); } }); c.restore(); }
function teapot(c, x, y, col, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); c.strokeStyle = shade(col, 0.7); c.lineWidth = 14; c.beginPath(); c.arc(95, -80, 40, -1.4, 1.4); c.stroke(); paint(c, q => { q.m(-80, -80); q.q(-150, -110, -160, -170); q.l(-130, -170); q.q(-120, -110, -70, -100); q.z(); }, col, { sd: 4, hd: 3 }); paint(c, q => q.e(0, -80, 100, 80), col, { sd: 10, hd: 6, inner: k => { k.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 5; i++) { k.beginPath(); k.arc(-60 + i * 30, -80 + (i % 2) * 20, 9, 0, TAU); k.fill(); } } }); paint(c, q => q.e(0, -158, 50, 14), shade(col, 0.9), { sd: 3, hd: 2, lw: 3 }); c.fillStyle = shade(col, 0.8); c.beginPath(); c.arc(0, -178, 14, 0, TAU); c.fill(); c.restore(); }
function hat(c, x, y, col, band, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); paint(c, q => q.e(0, 0, 130, 34), col, { sd: 6, hd: 3 }); paint(c, q => { q.m(-70, 0); q.b(-75, -130, 75, -130, 70, 0); q.z(); }, col, { sd: 8, hd: 4, inner: k => { k.fillStyle = band; k.fillRect(-75, -36, 150, 26); } }); c.fillStyle = '#EE5E9A'; c.beginPath(); c.arc(54, -40, 18, 0, TAU); c.fill(); c.restore(); }
function guitar(c, x, y, s = 1, rot = 0) { c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.fillStyle = '#3A2A1E'; c.fillRect(-16, -720, 32, 480); c.fillStyle = '#22252E'; rr(c, -30, -800, 60, 100, 10); c.fill(); c.fillStyle = '#C9CED6'; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(-36, -780 + i * 30, 7, 0, TAU); c.arc(36, -780 + i * 30, 7, 0, TAU); c.fill(); }
  paint(c, q => { q.m(0, -270); q.b(110, -290, 130, -190, 90, -150); q.b(170, -110, 180, 0, 0, 10); q.b(-180, 0, -170, -110, -90, -150); q.b(-130, -190, -110, -290, 0, -270); q.z(); }, '#E0474C', { sd: 12, hd: 6, inner: k => { k.fillStyle = '#FFFDF8'; k.beginPath(); k.moveTo(-20, -200); k.lineTo(90, -80); k.lineTo(60, -40); k.lineTo(-60, -150); k.fill(); } });
  c.fillStyle = '#22252E'; c.fillRect(-60, -110, 120, 24); c.strokeStyle = '#E8E2DA'; c.lineWidth = 2; for (let i = -2; i <= 3; i++) { c.beginPath(); c.moveTo(i * 5, -720); c.lineTo(i * 5, -100); c.stroke(); } c.restore(); }
function painting(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); c.strokeStyle = '#6A4630'; c.lineWidth = 16; c.beginPath(); c.moveTo(-120, 0); c.lineTo(0, -620); c.lineTo(120, 0); c.moveTo(0, -620); c.lineTo(0, 30); c.stroke();
  paint(c, q => { q.m(-210, -620); q.l(210, -620); q.l(210, -260); q.l(-210, -260); q.z(); }, '#C9A040', { sd: 8, hd: 5, inner: k => { const g = k.createLinearGradient(0, -590, 0, -290); g.addColorStop(0, '#9CC8E8'); g.addColorStop(1, '#F6E6C8'); k.fillStyle = g; k.fillRect(-180, -590, 360, 300); k.fillStyle = '#6EA86A'; k.beginPath(); k.moveTo(-180, -290); k.quadraticCurveTo(-60, -400, 60, -330); k.quadraticCurveTo(130, -300, 180, -360); k.lineTo(180, -290); k.fill(); k.fillStyle = '#C98B5A'; k.beginPath(); k.ellipse(20, -380, 46, 30, 0, 0, TAU); k.fill(); k.beginPath(); k.arc(-20, -410, 22, 0, TAU); k.fill(); k.fillStyle = '#F2C14E'; k.beginPath(); k.arc(120, -520, 30, 0, TAU); k.fill(); } }); c.restore(); }
function vase(c, x, y, s = 1, rot = 0) { c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  paint(c, q => { q.m(-40, -300); q.l(40, -300); q.q(30, -250, 70, -200); q.b(150, -130, 120, -20, 60, 0); q.l(-60, 0); q.b(-120, -20, -150, -130, -70, -200); q.q(-30, -250, -40, -300); q.z(); }, '#7FAE9A', { sd: 10, hd: 6, inner: k => { k.strokeStyle = '#B0643E'; k.lineWidth = 8; k.beginPath(); k.moveTo(-100, -120); k.quadraticCurveTo(0, -90, 100, -120); k.stroke(); k.fillStyle = '#C9A040'; for (let i = 0; i < 4; i++) { k.beginPath(); k.arc(-60 + i * 40, -60, 10, 0, TAU); k.fill(); } k.strokeStyle = '#3E5A4A'; k.lineWidth = 4; k.beginPath(); k.moveTo(30, -260); k.lineTo(10, -200); k.lineTo(40, -150); k.stroke(); } });
  paint(c, q => q.e(0, -300, 48, 12), '#5E8E7A', { sd: 3, hd: 2, lw: 3 }); c.restore(); }
function note(c, x, y, s = 1, rot = 0) { c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); c.fillStyle = '#C9A04A'; c.strokeStyle = '#6A4630'; c.lineWidth = 4; rr(c, -90, -48, 180, 96, 10); c.fill(); c.stroke(); c.fillStyle = '#8A6A2A'; c.font = '44px Unb9'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('£10', 0, 2); c.restore(); }
// price tag (string + kraft card). old/new prices: new appears with a red strike on the old
function tag(c, x, y, old, neu, k, t, opt = {}) {
  const sw = Math.sin(t * 2.4 + x) * 0.06 + (opt.jolt || 0); c.save(); c.translate(x, y); c.rotate(sw);
  c.strokeStyle = '#6A4630'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 60); c.stroke();
  const w = 230, h = 150 + (neu ? 0 : 0); c.fillStyle = 'rgba(0,0,0,.18)'; rr(c, -w / 2 + 6, 66, w, h, 16); c.fill();
  c.fillStyle = '#E2BE86'; c.strokeStyle = '#8A6A3A'; c.lineWidth = 5; rr(c, -w / 2, 60, w, h, 16); c.fill(); c.stroke(); c.fillStyle = '#FFFDF8'; c.beginPath(); c.arc(0, 82, 10, 0, TAU); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  if (!neu || k <= 0) { c.fillStyle = '#2B2F3A'; c.font = '78px Cav7'; c.fillText(old, 0, 150); }
  else { c.fillStyle = '#6A6A6A'; c.font = '52px Cav7'; c.fillText(old, -48, 128); c.strokeStyle = '#E0474C'; c.lineWidth = 7; c.beginPath(); c.moveTo(-100, 132); c.lineTo(-100 + 105 * clamp(k * 2), 120); c.stroke();
    const k2 = eBack(P(k, 0.4, 1), 2.4); if (k2 > 0) { c.save(); c.translate(42, 165); c.scale(k2, k2); c.rotate(-0.08); c.fillStyle = opt.newCol || '#E0474C'; c.font = '74px Cav7'; c.fillText(neu, 0, 0); c.restore(); } }
  c.restore();
}

// ---------------- characters
function flatCap(c, g, head, turn) { const x = head.x, y = head.y, hw = g.hw, hh = g.hh;
  paint(c, q => { q.m(x - hw * 1.05, y - hh * 0.45); q.b(x - hw * 1.1, y - hh * 1.25, x + hw * 1.1, y - hh * 1.25, x + hw * 1.05, y - hh * 0.45); q.q(x, y - hh * 0.62, x - hw * 1.05, y - hh * 0.45); q.z(); }, '#5A5048', { sd: 8, hd: 5, inner: k => { k.strokeStyle = 'rgba(0,0,0,.18)'; k.lineWidth = 3; for (let i = -4; i <= 4; i++) { k.beginPath(); k.moveTo(x + i * hw * 0.22, y - hh * 1.05); k.lineTo(x + i * hw * 0.24, y - hh * 0.5); k.stroke(); } } });
  paint(c, q => { q.m(x - hw * 0.9 + turn * hw * 0.4, y - hh * 0.5); q.q(x + turn * hw * 0.5, y - hh * 0.28, x + hw * 0.9 + turn * hw * 0.4, y - hh * 0.5); q.q(x + turn * hw * 0.4, y - hh * 0.6, x - hw * 0.9 + turn * hw * 0.4, y - hh * 0.5); q.z(); }, '#4A4038', { sd: 4, hd: 3, lw: 3 }); }
function bowler(c, g, head) { const x = head.x, y = head.y, hw = g.hw, hh = g.hh;
  paint(c, q => { q.m(x - hw * 1.25, y - hh * 0.62); q.q(x, y - hh * 0.5, x + hw * 1.25, y - hh * 0.62); q.q(x + hw * 1.3, y - hh * 0.75, x + hw * 1.1, y - hh * 0.75); q.l(x - hw * 1.1, y - hh * 0.75); q.q(x - hw * 1.3, y - hh * 0.75, x - hw * 1.25, y - hh * 0.62); q.z(); }, '#1E1612', { sd: 4, hd: 3, lw: 3 });
  paint(c, q => { q.m(x - hw * 0.85, y - hh * 0.72); q.b(x - hw * 0.9, y - hh * 1.55, x + hw * 0.9, y - hh * 1.55, x + hw * 0.85, y - hh * 0.72); q.z(); }, '#2A221C', { sd: 10, hd: 6, inner: k => { k.fillStyle = '#5A2A2A'; k.fillRect(x - hw * 0.9, y - hh * 0.92, hw * 1.8, hh * 0.14); } }); }
function bigHat(c, g, head) { const x = head.x, y = head.y - g.hh * 0.7, hw = g.hw; paint(c, q => q.e(x, y, hw * 2.0, 40), '#8E5BD6', { sd: 6, hd: 3 }); paint(c, q => { q.m(x - hw * 1.0, y); q.b(x - hw * 1.05, y - 190, x + hw * 1.05, y - 190, x + hw * 1.0, y); q.z(); }, '#8E5BD6', { sd: 8, hd: 4, inner: k => { k.fillStyle = '#F2C14E'; k.fillRect(x - hw * 1.1, y - 50, hw * 2.2, 32); } }); for (let i = 0; i < 4; i++) { c.fillStyle = ['#EE5E9A', '#FFFDF8', '#E0474C', '#F7B6CF'][i]; c.beginPath(); c.arc(x + hw * (0.3 + i * 0.22), y - 60 - (i % 2) * 20, 26, 0, TAU); c.fill(); } }
function apron(cc, g) { const y = g.ySh + 80; paint(cc, q => { q.m(-g.sw * 0.6, y); q.l(g.sw * 0.6, y); q.l(g.sw * 0.75, y + 620); q.l(-g.sw * 0.75, y + 620); q.z(); }, '#2F5A48', { sd: 10, hd: 4, inner: k => { k.fillStyle = '#F2C14E'; k.font = '44px Unb9'; k.textAlign = 'center'; k.textBaseline = 'middle'; k.fillText("DEL'S", 0, y + 120); } }); cc.strokeStyle = '#2F5A48'; cc.lineWidth = 10; cc.beginPath(); cc.moveTo(-g.sw * 0.55, y); cc.lineTo(-g.hw * 0.5, g.ySh - 10); cc.moveTo(g.sw * 0.55, y); cc.lineTo(g.hw * 0.5, g.ySh - 10); cc.stroke(); }
function sweat(cc, head, hh, hw, t, k) { if (k <= 0) return; cc.fillStyle = rgba('#7FD0FF', 0.9 * k); for (let i = 0; i < 3; i++) { const ph = (t * 1.3 + i / 3) % 1, x = head.x + (i - 1) * hw * 0.8, y = head.y - hh * 0.6 + ph * hh * 1.2; cc.beginPath(); cc.moveTo(x, y - 22); cc.quadraticCurveTo(x + 14, y + 4, x, y + 12); cc.quadraticCurveTo(x - 14, y + 4, x, y - 22); cc.fill(); } }
function put(c, cfg, st, x, y = FY, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); const r = human(c, cfg, st); c.restore(); return { x: x + r.head.x * s, y: y + r.head.y * s, hh: r.hh * s, r }; }
const magnifier = () => (ctx, a) => { ctx.rotate(-0.6); ctx.fillStyle = '#5A3A22'; rr(ctx, -12, -10, 24, 120, 8); ctx.fill(); ctx.strokeStyle = '#C9A040'; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(0, -70, 56, 0, TAU); ctx.stroke(); ctx.fillStyle = 'rgba(200,230,255,.45)'; ctx.fill(); };
const cash = () => (ctx, a) => { ctx.rotate(a - Math.PI / 2 - 0.4); ctx.translate(0, 40); for (let i = 0; i < 3; i++) { ctx.save(); ctx.rotate(-0.15 + i * 0.12); ctx.fillStyle = ['#C9A04A', '#8CB3D9', '#C9A04A'][i]; ctx.strokeStyle = '#6A4630'; ctx.lineWidth = 3; rr(ctx, -30, -10, 60, 110, 6); ctx.fill(); ctx.stroke(); ctx.restore(); } };
const vaseItem = () => (ctx) => { ctx.translate(-40, 40); vase(ctx, 0, 0, 0.62); };
const noteItem = () => (ctx) => { note(ctx, 30, -20, 0.7, -0.3); };

function seller(c, t, L, who, x) {
  const g = G[who], cfg = CAST[who], ev = lvEv(L); const tt = TOP - FY - 30;
  const st = { t, talk: talk(who, t), mood: 'happy', turn: 0.35, look: 0.8, armL: reach(g, -1, -g.sw * 1.05, tt), armR: reach(g, 1, g.sw * 1.0, tt) };
  const l = (L || '').toLowerCase();
  if (speaking(l + '_x', t, 0.05)) { const u = (t - SP[l + '_x'].t) * 4; st.armR = reach(g, 1, g.sw * 1.6 + Math.sin(u) * 30, g.ySh + 280 + Math.cos(u) * 30); }
  if (who === 'del') { st.afterTorso = cc => apron(cc, g); st.front = (cc, gg) => flatCap(cc, g, gg.head, st.turn);
    if (L === 'A1') { if (SP.a1_her && t > SP.a1_her.t + 0.4) { st.mood = 'smug'; } if (ev.tag && t > ev.tag - 0.3 && t < ev.tag + 1.4) { st.armR = reach(g, 1, g.sw * 2.4, g.ySh - 260); st.mood = 'happy'; st.laugh = true; } } }
  if (who === 'nana') { st.front = (cc, gg) => bigHat(cc, g, gg.head);
    if (L === 'A2') { if (SP.a2_her && t > SP.a2_her.t + 1.0) { st.mood = 'shock'; } if (speaking('a2_x', t, 0.2, 0.8)) { st.mood = 'shock'; st.armL = reach(g, -1, -g.sw * 0.2, g.ySh + 140); st.armR = reach(g, 1, g.sw * 0.25, g.ySh + 140); } } }
  if (who === 'agnes') { st.items = {}; if (L === 'B1' && ev.tag && t > ev.tag - 0.3 && t < ev.tag + 0.9) { st.armR = reach(g, 1, g.sw * 2.6, g.ySh + 60); st.mood = 'happy'; } }
  if (who === 'rocky' && L === 'B2') {
    if (SP.b2_her && t > SP.b2_her.t + 0.8) st.mood = 'skeptical';
    if (speaking('b2_x', t, 0.05)) st.mood = 'happy';
    const rk = wordT('b2_x', 'rock'); if (rk && t > rk - 0.1 && t < rk + 1.6) { const s2 = Math.sin(t * 22); st.mood = 'happy'; st.laugh = true; st.armL = reach(g, -1, -g.sw * 1.7, g.ySh + 40); st.armR = reach(g, 1, g.sw * 0.5, g.ySh + 420 + s2 * 40, { fist: true }); st.tilt = 0.1; st.headY = Math.abs(s2) * 14;
      st.afterTorso = cc => guitar(cc, 70, g.ySh + 620, 0.78, -1.1); } }
  if (who === 'reggie') { st.front = (cc, gg) => bowler(cc, g, gg.head);
    if (L === 'C1') { if (SP.c1_her && t > SP.c1_her.t + 1.5) st.mood = 'neutral'; if (speaking('c1_x', t, 0.05, 1.5)) st.mood = 'happy'; if (ev.shake && t > ev.shake - 0.35 && t < ev.shake + 1.0) { const w = Math.sin(t * 16) * 18; st.armR = reach(g, 1, 430, -1110 + w); } } }
  if (who === 'barnaby') {
    st.mood = 'smug'; st.items = { R: magnifier() };
    if (L === 'C2') {
      const he = endOf('c2_her');
      if (SP.c2_her && t > SP.c2_her.t + 2.0) { st.mood = 'worried'; st.items = {}; }
      if (t > he - 0.2) { st.mood = 'worried'; st.look = 0.4; st.lookY = 0.6; }
      if (speaking('c2_x', t, 0.05, 0.4)) { st.mood = 'shock'; st.items = { R: noteItem() }; const u = (t - SP.c2_x.t) / SP.c2_x.d; st.armR = reach(g, 1, g.sw * (u > 0.4 ? 3.2 : 1.6), g.ySh + (u > 0.4 ? 200 : 300)); }
      if (SP.c2_her2 && t > SP.c2_her2.t - 0.3) { st.mood = 'worried'; st.items = {}; st.armL = reach(g, -1, -g.hw * 1.2, g.headY + 60); st.armR = reach(g, 1, g.hw * 1.2, g.headY + 60); }
      const swK = SP.c2_her ? P(t, SP.c2_her.t + 3, SP.c2_her.t + 4) : 0; const prev = st.front; st.front = (cc, gg) => sweat(cc, gg.head, g.hh, g.hw, t, swK);
    }
  }
  return put(c, cfg, st, x);
}
function tote(cc, g) { const x = g.sw * 0.95, y = g.ySh + 320; cc.strokeStyle = '#B88A60'; cc.lineWidth = 9; cc.beginPath(); cc.moveTo(g.sw * 0.6, g.ySh - 4); cc.lineTo(x - 50, y); cc.moveTo(g.sw * 0.75, g.ySh + 10); cc.lineTo(x + 60, y); cc.stroke(); paint(cc, q => { q.m(x - 90, y); q.l(x + 90, y); q.l(x + 100, y + 210); q.l(x - 100, y + 210); q.z(); }, '#F3EDDF', { sd: 10, hd: 4, inner: k => { k.fillStyle = '#EE5E9A'; k.font = '30px Unb9'; k.textAlign = 'center'; k.textBaseline = 'middle'; k.fillText('I', x - 52, y + 105); k.fillText('LDN', x + 30, y + 105); const hx = x - 22, hy = y + 100; k.beginPath(); k.moveTo(hx, hy + 14); k.bezierCurveTo(hx - 22, hy - 2, hx - 10, hy - 18, hx, hy - 6); k.bezierCurveTo(hx + 10, hy - 18, hx + 22, hy - 2, hx, hy + 14); k.fill(); } }); }
function beret(cc, g, head) { const x = head.x + g.hw * 0.15, y = head.y - g.hh * 0.78; paint(cc, q => { q.m(x - g.hw * 1.15, y + 20); q.b(x - g.hw * 1.2, y - 110, x + g.hw * 1.2, y - 110, x + g.hw * 1.15, y + 20); q.q(x, y + 40, x - g.hw * 1.15, y + 20); q.z(); }, '#E0474C', { sd: 8, hd: 5 }); cc.fillStyle = '#B8303A'; cc.beginPath(); cc.arc(x, y - 82, 12, 0, TAU); cc.fill(); }
function herState(t, L) {
  const g = G.her, ev = lvEv(L);
  const st = { t, talk: talk('her', t), mood: 'happy', turn: -0.45, look: -0.7, armL: reach(g, -1, -g.sw * 0.5, g.ySh + 300), armR: reach(g, 1, g.sw * 0.3, g.ySh + 230) };
  const l = (L || '').toLowerCase(); const hs = SP[l + '_her'];
  if (hs && speaking(l + '_her', t, 0.05)) { const gg = Math.sin((t - hs.t) * 4.5); st.armL = reach(g, -1, -g.sw * 1.5 + gg * 40, g.ySh + 230 - Math.abs(gg) * 50); }
  let extra = null;
  if (L === 'hook') st.mood = 'smug';
  if (L === 'A1') { if (speaking('a1_her', t, 0.05)) { st.armL = reach(g, -1, -g.sw * 2.8, g.ySh + 120 + Math.sin(t * 9) * 30); st.mood = 'happy'; } if (ev.tag && t > ev.tag) st.mood = t < ev.tag + 1.0 ? 'shock' : 'worried'; }
  if (L === 'A2') { if (speaking('a2_her', t, 0.05)) { const u = (t - SP.a2_her.t) / SP.a2_her.d; st.mood = u > 0.45 ? 'smug' : 'shock'; if (u > 0.45) { st.armL = reach(g, -1, -g.sw * 2.4, g.ySh + 100); st.items = { L: cash() }; } } if (SP.a2_x && t > SP.a2_x.t + 0.5) { st.mood = 'worried'; } }
  if (L === 'B1') { if (ev.tag && t > ev.tag) st.mood = 'happy'; }
  if (L === 'B2') { if (speaking('b2_her', t, 0.05, 2.0)) { st.items = { L: cash() }; } if (speaking('b2_her', t, 0.05)) { const u = (t - SP.b2_her.t) / SP.b2_her.d; if (u > 0.4) st.armL = reach(g, -1, -g.sw * 2.2, g.ySh + 150); } if (ev.tag && t > ev.tag) st.mood = 'happy'; }
  if (L === 'C1') { if (ev.shake && t > ev.shake - 0.35 && t < ev.shake + 1.0) { const w = Math.sin(t * 16) * 18; st.armL = reach(g, -1, -350, -1110 + w); st.mood = 'happy'; } }
  if (L === 'C2') {
    if (speaking('c2_her', t, 0.1)) { st.mood = 'smug'; st.tilt = -0.04; st.armL = reach(g, -1, -g.sw * 1.6 + Math.sin(t * 2.4) * 40, g.ySh + 60 + Math.cos(t * 2.4) * 30); st.items = { L: magnifier() }; }
    if (t > endOf('c2_her') + 0.2) st.mood = 'neutral';
    if (SP.c2_x && t > SP.c2_x.t + 0.6) { st.mood = 'shock'; }
    const hand = SP.c2_x ? SP.c2_x.t + SP.c2_x.d * 0.6 : 1e9;
    if (t > hand) { st.mood = t > SP.c2_her2.t - 0.3 ? 'smug' : 'shock'; st.armL = reach(g, -1, -g.sw * 0.8, g.ySh + 220); st.armR = reach(g, 1, g.sw * 1.3, g.ySh + 120); st.items = { L: vaseItem(), R: noteItem() }; }
  }
  if (L === 'outro') { st.mood = 'happy'; st.turn = 0; st.look = 0; st.armL = reach(g, -1, -g.sw * 1.5 + Math.sin(t * 8) * 40, g.headY - 220); st.armR = reach(g, 1, g.sw * 1.0, g.ySh + 300); }
  st.afterTorso = cc => tote(cc, g);
  st.front = (cc, gg) => beret(cc, g, gg.head);
  return st;
}
function drawHer(c, t, L, x, s = 1, y = FY) { return put(c, HER, herState(t, L), x, y, s); }

// ---------------- composition
function goods(c, t, L, who, x0) {
  const ev = lvEv(L), ix = x0 + ITX;
  if (who === 'del') { lamp(c, x0 - 520, TOP, 0.8); lamp(c, x0 - 330, TOP, 0.65); lamp(c, ix, TOP, 1.05); tag(c, ix + 130, TOP - 330, '£20', '£40', ev.tag ? P(t, ev.tag - 0.15, ev.tag + 0.35) : 0, t, { jolt: ev.tag ? Math.sin(P(t, ev.tag, ev.tag + 0.6) * Math.PI * 4) * 0.15 * (1 - P(t, ev.tag, ev.tag + 0.6)) : 0 }); }
  if (who === 'nana') { c.fillStyle = '#6A4630'; c.fillRect(ix - 8, TOP - 400, 16, 400); hat(c, x0 - 520, TOP, '#3C6FB4', '#F2C14E', 0.8); hat(c, x0 - 290, TOP, '#E9B23B', '#E0474C', 0.8); hat(c, ix, TOP - 400, '#EE5E9A', '#FFFDF8', 1.0); tag(c, ix + 120, TOP - 420, '£20', null, 0, t); }
  if (who === 'agnes') { teapot(c, x0 - 520, TOP, '#3C8FE0', 0.75); teapot(c, x0 - 300, TOP, '#8CB369', 0.7); teapot(c, ix, TOP, '#EE5E9A', 1.0); tag(c, ix + 130, TOP - 290, '£20', '£15', ev.tag ? P(t, ev.tag - 0.15, ev.tag + 0.35) : 0, t, { newCol: '#2F8A4A' }); }
  if (who === 'rocky') { const held = L === 'B2' && wordT('b2_x', 'rock') && t > wordT('b2_x', 'rock') - 0.1 && t < wordT('b2_x', 'rock') + 1.6; c.fillStyle = '#2B2F3A'; c.fillRect(ix + 20, TOP - 300, 16, 300); if (!held) guitar(c, ix + 40, TOP, 0.85, 0.08); tag(c, ix + 120, TOP - 640, '£40', '£30', ev.tag ? P(t, ev.tag - 0.15, ev.tag + 0.35) : 0, t, { newCol: '#2F8A4A' }); c.fillStyle = '#2B2F3A'; rr(c, x0 - 560, TOP - 260, 300, 260, 20); c.fill(); for (const [yy, r] of [[-190, 40], [-80, 60]]) { c.fillStyle = '#111'; c.beginPath(); c.arc(x0 - 410, TOP + yy, r, 0, TAU); c.fill(); } }
  if (who === 'reggie') { painting(c, ix + 40, FY - 20, 1.0); tag(c, ix + 260, TOP - 560, '£60', '£40', ev.tag ? P(t, ev.tag - 0.15, ev.tag + 0.35) : 0, t, { newCol: '#2F8A4A' }); c.save(); c.translate(x0 - 430, TOP); c.rotate(-0.05); c.fillStyle = '#C9A040'; c.fillRect(-150, -300, 300, 300); c.fillStyle = '#6E8EAE'; c.fillRect(-120, -270, 240, 240); c.restore(); }
  if (who === 'barnaby') {
    const hand = L === 'C2' && SP.c2_x ? SP.c2_x.t + SP.c2_x.d * 0.6 : 1e9;
    vase(c, x0 - 520, TOP, 0.6); c.fillStyle = '#C9A040'; c.beginPath(); c.arc(x0 - 320, TOP - 70, 70, 0, TAU); c.fill(); c.strokeStyle = '#6A4630'; c.lineWidth = 5; c.stroke();
    if (t < hand) vase(c, ix, TOP, 1.0, L === 'C2' ? Math.sin(t * 30) * 0.03 * P(t, endOf('c2_her') - 0.4, endOf('c2_her')) : 0);
    const k = L === 'C2' && SP.c2_x ? P(t, SP.c2_x.t + 0.2, SP.c2_x.t + 0.7) : 0;
    if (t < hand) tag(c, ix + 140, TOP - 330, '£50', 'FREE', k, t);
  }
}
function world(c, t, L) {
  c.drawImage(BGB, BX0, BY0, BW, BH);
  const who = WHO[L], x0 = ST[who]; const heads = {};
  awning(c, x0, who);
  heads[who] = seller(c, t, L, who, x0 + NBX);
  table(c, x0, who);
  goods(c, t, L, who, x0);
  if (who === 'agnes') { c.save(); c.translate(x0 + 470, FY + 40); c.scale(0.5, 0.5); pug(c, { t, tilt: Math.sin(t * 1.4) * 0.1, tongue: L === 'B1' && SP.b1_x && t > SP.b1_x.t - 0.2 && t < SP.b1_x.t + 0.6 }); c.restore(); }
  heads.her = drawHer(c, t, L, x0 + HERX);
  // C1 handshake sparkle
  const ev = lvEv(L);
  if (L === 'C1' && ev.shake && t > ev.shake && t < ev.shake + 1.0) { c.fillStyle = C.gold; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + t, r = 90 + 160 * P(t, ev.shake, ev.shake + 0.8); c.globalAlpha = 1 - P(t, ev.shake + 0.3, ev.shake + 1.0); UI.star(c, x0 + 260 + Math.cos(a) * r, -1000 + Math.sin(a) * r, 24, a); } c.globalAlpha = 1; }
  return heads;
}

// ---------------- camera
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
  const tagShot = { x: x0 + 150, y: -1060, z: 1.0, r: 0 };
  if ((L === 'A1' || L === 'B1') && ev.tag && t > ev.tag - 0.4 && t < (SP[nar] ? SP[nar].t : 1e9) - 0.1) return tagShot;
  if (L === 'B2' && ev.tag && t > ev.tag - 0.4 && t < SP.b2_nar.t - 0.1) return { ...two, z: 0.92 };
  if (L === 'C1' && ev.tag && t > ev.tag - 0.4 && t < SP.c1_nar.t - 0.1) return { ...two, z: 0.95 };
  if (L === 'A2' && speaking('a2_her', t, 0.3) && t > SP.a2_her.t + SP.a2_her.d * 0.4) return { ...two, z: 0.95 };
  if (L === 'C2') {
    const he = endOf('c2_her');
    if (t < SP.c2_her.t - 0.2) return { ...two, z: 1.0 };
    if (t < he + 0.1) return { ...herC, z: lerp(1.35, 1.75, P(t, SP.c2_her.t, he)), y: lerp(herHY + 125, herHY + 95, P(t, SP.c2_her.t, he)) };
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

// ---------------- NEW opener: a big swinging price tag
function drawHook(c, t) {
  // blurred market street behind, warm tint
  c.save(); c.translate(540, 960); c.scale(0.62, 0.62); c.translate(-(ST.del + 300), 1100); c.drawImage(BGB, BX0, BY0, BW, BH); c.restore();
  c.fillStyle = 'rgba(255,236,205,.35)'; c.fillRect(0, 0, W, HH);
  // awning stripes at the top
  for (let s = 0; s < 9; s++) { const w = W / 8, x = -w / 2 + s * w; c.fillStyle = s % 2 ? '#FFFDF8' : '#E0474C'; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + w, 0); c.lineTo(x + w, 150); c.arc(x + w / 2, 150, w / 2, 0, Math.PI); c.closePath(); c.fill(); }
  c.strokeStyle = 'rgba(0,0,0,.2)'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, 150); c.lineTo(W, 150); c.stroke();
  // the tag
  const bite = (SP.hook.words.find(w => w[0].toLowerCase().startsWith('кусает')) || [0, 3.0])[1] + SP.hook.t;
  const jolt = Math.sin(P(t, bite, bite + 0.6) * Math.PI * 5) * 0.12 * (1 - P(t, bite, bite + 0.6));
  const ang = Math.sin(t * 2.1) * 0.05 + jolt;
  c.save(); c.translate(540, 175); c.rotate(ang);
  c.strokeStyle = '#6A4630'; c.lineWidth = 7; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 150); c.stroke();
  const tw = 620, th = 700, ty = 130;
  c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.moveTo(-tw / 2 + 120 + 16, ty + 18); c.lineTo(tw / 2 - 120 + 16, ty + 18); c.lineTo(tw / 2 + 16, ty + 160); c.lineTo(tw / 2 + 16, ty + th + 18); c.lineTo(-tw / 2 + 16, ty + th + 18); c.lineTo(-tw / 2 + 16, ty + 160); c.closePath(); c.fill();
  c.fillStyle = '#E2BE86'; c.strokeStyle = '#8A6A3A'; c.lineWidth = 9; c.beginPath(); c.moveTo(-tw / 2 + 120, ty); c.lineTo(tw / 2 - 120, ty); c.lineTo(tw / 2, ty + 140); c.lineTo(tw / 2, ty + th); c.lineTo(-tw / 2, ty + th); c.lineTo(-tw / 2, ty + 140); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#FFFDF8'; c.beginPath(); c.arc(0, ty + 60, 26, 0, TAU); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const prices = [['£100', ty + 215], ['£50', ty + 345], ['£20', ty + 470]];
  prices.forEach(([p, y], i) => { c.fillStyle = '#5A4A3A'; c.font = `${150 - i * 8}px Cav7`; c.fillText(p, (i - 1) * 40, y); c.strokeStyle = '#E0474C'; c.lineWidth = 14; c.lineCap = 'round'; c.beginPath(); c.moveTo((i - 1) * 40 - 150, y + 10); c.lineTo((i - 1) * 40 + 150, y - 14); c.stroke(); });
  // the haggled price, circled
  c.save(); c.translate(120, ty + 600); c.rotate(-0.1); const pk = 1 + 0.05 * Math.sin(t * 6); c.scale(pk, pk); c.fillStyle = C.pink; c.font = '140px Cav7'; c.fillText('£5?!', 0, 0); c.strokeStyle = C.pink; c.lineWidth = 10; c.beginPath(); c.ellipse(0, 6, 175, 92, -0.05, 0.2, TAU + 0.05); c.stroke(); c.restore();
  c.restore();
  // "кусь!" when the price bites
  const kk = eBack(P(t, bite, bite + 0.25), 2.4) * (1 - P(t, bite + 1.4, bite + 1.6));
  if (kk > 0) { c.save(); c.translate(880, 520); c.rotate(0.2); c.scale(kk, kk); UI.font(c, 'Unb9', 70); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, 'КУСЬ!', 0, 0, C.gold, C.oliveD, 14); c.restore(); }
  // two characters at the bottom: her with a fiver, Del clutching his chest
  { const g = G.her, st = { t, talk: 0, mood: 'smug', turn: 0.35, look: 0.6, armL: reach(g, -1, -g.sw * 0.4, g.ySh + 290), armR: reach(g, 1, g.sw * 2.3, g.ySh + 60 + Math.sin(t * 3) * 15), items: { R: cash() }, afterTorso: cc => tote(cc, g) }; st.front = (cc, gg) => beret(cc, g, gg.head); c.save(); c.translate(280, 2420); c.scale(0.62, 0.62); human(c, HER, st); c.restore(); }
  { const g = G.del, st = { t, talk: 0, mood: 'shock', turn: -0.35, look: -0.6, armL: reach(g, -1, -g.sw * 0.3, g.ySh + 200), armR: reach(g, 1, g.sw * 0.2, g.ySh + 210), afterTorso: cc => apron(cc, g) }; st.front = (cc, gg) => flatCap(cc, g, gg.head, st.turn); c.save(); c.translate(820, 2480); c.scale(0.6, 0.6); human(c, CAST.del, st); c.restore(); }
  // title ribbon
  const rk = lerp(0.92, 1, eBack(P(t, 0, 0.35), 1.8)) * (1 + 0.012 * Math.sin(t * 5));
  c.save(); c.translate(540, 1205); c.rotate(-0.05); c.scale(rk, rk);
  const lines = TL.cfg.hook_title; c.fillStyle = 'rgba(0,0,0,.22)'; UI.rr(c, -500 + 10, -150 + 14, 1000, 300, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; UI.rr(c, -500, -150, 1000, 300, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 900); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -78); UI.textFit(c, 'Unb9', 110, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 8, C.pink, C.white, 12); UI.textFit(c, 'Unb9', 64, lines[2][0], 900); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 98);
  c.restore();
  UI.levelBar(c, t, { id: 'hook' });
  const stT = SC.hook.stamp_t, sk = P(t, stT - 0.02, stT + 0.15);
  if (sk > 0) { const s2 = lerp(2.6, 1, eOut(sk)); c.save(); c.translate(540, 1730); c.rotate(-0.13); c.scale(s2, s2); c.globalAlpha = clamp(sk * 3); c.fillStyle = 'rgba(255,253,248,.92)'; UI.rr(c, -380, -90, 760, 180, 24); c.fill(); c.strokeStyle = C.pink; c.lineWidth = 14; UI.rr(c, -380, -90, 760, 180, 24); c.stroke(); UI.textFit(c, 'Unb9', 110, TL.cfg.stamp, 700); c.fillStyle = C.pink; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(TL.cfg.stamp, 0, 6); c.restore(); }
}
function drawOutro(c, t) {
  const s = SC.outro.s, u = t - s, o = SP.outro;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  const { textFit, strokeText, font, rr: R } = UI;
  c.save(); c.translate(210, lerp(2900, 2420, eBack(P(u, 0.4, 0.9), 1.4))); c.scale(0.6, 0.6); drawHer(c, t, 'outro', 0, 1, 0); c.restore();
  c.save(); c.translate(570, lerp(2800, 2330, eBack(P(u, 0.6, 1.1), 1.4))); c.scale(0.56, 0.56); seller(c, t, 'outro', 'nana', 0); c.restore();
  c.save(); c.translate(900, lerp(3000, 2560, eBack(P(u, 0.5, 1.0), 1.4))); c.scale(0.55, 0.55); seller(c, t, 'outro', 'del', 0); c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const q = eBack(P(u, 0.35, 0.7), 2.2);
  c.save(); c.translate(540, 450); c.scale(q, q); font(c, 'Unb9', 74); strokeText(c, 'А КАК ТОРГУЕШЬСЯ', 0, -66, C.oliveD, C.white, 16); strokeText(c, 'ТЫ?', 0, 40, C.pink, C.white, 16); c.restore();
  const ex = [['This. Cheap? Cheap?', true], ['Is that your best price?', false], ['Could you knock a bit off?', false], ['Would you take forty?', false]];
  ex.forEach(([e, bad], i) => { const k = eBack(P(u, 1.05 + i * 0.22, 1.4 + i * 0.22), 2.2); if (k <= 0) return; c.save(); c.translate(540 + (i % 2 ? 30 : -30), 660 + i * 115 + Math.sin(t * 3 + i) * 5); c.scale(k, k); textFit(c, 'Nun9', 50, e, 800); const w = c.measureText(e).width + 70; c.fillStyle = 'rgba(0,0,0,.12)'; R(c, -w / 2 + 6, -44 + 8, w, 88, 44); c.fill(); c.fillStyle = bad ? '#B9B2A4' : [LVCOL.B1, LVCOL.B2, LVCOL.C1][i - 1]; R(c, -w / 2, -44, w, 88, 44); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke(); c.fillStyle = C.white; c.fillText(e, 0, 3); if (bad) { c.strokeStyle = C.red; c.lineWidth = 9; c.beginPath(); c.moveTo(-w / 2 + 20, 4); c.lineTo(w / 2 - 20, 0); c.stroke(); } c.restore(); });
  const ak = eOut(P(t, o.t + 1.3, o.t + 1.6));
  if (ak > 0) { c.save(); c.globalAlpha = ak; c.translate(540, 1170 + Math.sin(t * 7) * 10); font(c, 'Unb9', 46); c.fillStyle = C.oliveD; c.fillText('ПИШИ В КОММЕНТЫ', 0, 0); c.fillStyle = C.pink; c.beginPath(); c.moveTo(-40, 50); c.lineTo(40, 50); c.lineTo(0, 100); c.fill(); c.restore(); }
  const subT = (wordT('outro', 'подпиш') || o.t + 4.0) - 0.35;
  const sk = eBack(P(t, subT, subT + 0.3), 2);
  if (sk > 0) { const click = P(t, subT + 0.8, subT + 0.95), pressed = t > subT + 0.9; c.save(); c.translate(540, 1420); const ss = sk * (1 - 0.08 * Math.sin(click * Math.PI)); c.scale(ss, ss); c.fillStyle = pressed ? C.olive : C.pink; R(c, -250, -62, 500, 124, 62); c.fill(); font(c, 'Unb9', 44); c.fillStyle = C.white; c.fillText(pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4); c.restore();
    const mv = eIO(P(t, subT + 0.2, subT + 0.8)); UI.tapCursor(c, lerp(840, 610, mv), lerp(1700, 1440, mv), 1, P(t, subT + 0.85, subT + 1.4));
    if (pressed) { c.fillStyle = C.gold; for (let i = 0; i < 10; i++) { const a = i / 10 * 6.28, r = 120 + 200 * P(t, subT + 0.9, subT + 1.4); c.globalAlpha = 1 - P(t, subT + 0.9, subT + 1.6); UI.star(c, 540 + Math.cos(a) * r * 1.6, 1420 + Math.sin(a) * r, 16, a); } c.globalAlpha = 1; } }
  for (let s2 = 0; s2 < 9; s2++) { const w = W / 8, x = -w / 2 + s2 * w; c.fillStyle = s2 % 2 ? '#FFFDF8' : '#E0474C'; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + w, 0); c.lineTo(x + w, 110); c.arc(x + w / 2, 110, w / 2, 0, Math.PI); c.closePath(); c.fill(); }
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
  if (sc.id === 'C2') {
    const a = endOf('c2_her') + 0.3, b = SP.c2_x.t - 0.1;
    if (t > a && t < b) { const dots = Math.min(3, Math.floor((t - a) / 0.55) + 1); c.save(); c.globalAlpha = clamp((t - a) / 0.2) * clamp((b - t) / 0.15); UI.font(c, 'Unb9', 150); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, '.'.repeat(dots).padEnd(3, ' '), 540, 1450, C.white, C.oliveD, 16); UI.font(c, 'Nun9', 40); UI.strokeText(c, '*антиквар в шоке*', 540, 1560, C.white, C.oliveD, 10); c.restore(); }
    // "+£10" pop when the dealer pays her
    const pk = SP.c2_her2 ? eBack(P(t, SP.c2_her2.t - 0.4, SP.c2_her2.t - 0.1), 2.4) * (1 - P(t, SP.c2_nar.t + 0.4, SP.c2_nar.t + 0.7)) : 0;
    if (pk > 0) { c.save(); c.translate(780, 1180); c.rotate(-0.1); c.scale(pk, pk); UI.font(c, 'Unb9', 96); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, '+£10', 0, 0, '#7CF29A', C.oliveD, 16); c.restore(); }
  }
  UI.card(c, t, sc); UI.captions(c, t); UI.sparkles(c, t);
  Hq.grain(c, W, HH, t, 0.04);
  UI.levelBar(c, t, sc, 1); UI.watermark(c); UI.levelIntro(c, t, sc); UI.levelIntroNext(c, t);
}
E.run('market', NF, renderFrame);
