// "Overweight suitcase at the airport" episode renderer: node airport.js start end out.mp4 | --png=f1,f2
const fs = require('fs');
const Hq = require('./hq'); const { CAST } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, noise1, mix, shade, rgba, paint, rr, softShadow, human, items, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/airport/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SC, SP, sceneAt, C, LVCOL } = UI;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS);
const talk = (who, t) => { let a = 0; for (const s of TL.speech) if (s.who === who && t >= s.t && t < s.t + s.d) { const i = Math.floor((t - s.t) * FPS); a = Math.max(a, s.env[Math.min(i, s.env.length - 1)] || 0); } return a; };
const speaking = (id, t, pre = 0, post = 0) => SP[id] && t >= SP[id].t - pre && t < SP[id].t + SP[id].d + post;
const endOf = id => SP[id].t + SP[id].d;
const TAU = Math.PI * 2;
const lvEv = L => (SC[L] && SC[L].ev) || {};
const wordT = (id, w) => { const s = SP[id]; if (!s) return null; const x = s.words.find(q => q[0].toLowerCase().replace(/[«»!?.,:]/g, '').startsWith(w)); return x ? s.t + x[1] : null; };

// ---------------- cast: airline uniforms
const NAVY = '#1F3A6B';
const UNI = (k, extra = {}) => Object.assign({}, CAST[k], { top: { type: 'blazer', col: NAVY, shirt: '#F7F9FC', tie: '#E0474C' }, bottom: { type: 'trousers', col: NAVY }, shoes: { col: '#1E1612', acc: null } }, extra);
const AG = { tom: UNI('tom'), linda: UNI('linda'), mark: UNI('mark'), priya: UNI('priya'), margot: UNI('margot'), rocky: UNI('rocky', { top: { type: 'blazer', col: NAVY, shirt: '#22252E', tie: '#E0474C' } }) };
const HER = Object.assign({}, CAST.her_london, { top: { type: 'longsleeve', col: '#F28C82' }, bottom: { type: 'joggers', col: '#6A6F80' }, shoes: { col: '#FFFFFF', acc: '#EE5E9A' } });
const WHO = { A1: 'tom', A2: 'linda', B1: 'mark', B2: 'priya', C1: 'margot', C2: 'rocky', hook: 'tom', outro: 'rocky' };
const ST = { tom: 0, linda: 2600, mark: 5200, priya: 7800, margot: 10400, rocky: 13000 };
const NAMES = { tom: ['TOM', '#4E7FB8'], linda: ['LINDA', '#3FA7A0'], mark: ['MARK', '#2F3E5C'], priya: ['PRIYA', '#3FB6A8'], margot: ['MARGOT', '#8A1C2E'], rocky: ['ROCKY', '#E0474C'] };
const HERX = 640, NBX = -200, FY = 60, SXO = 310, BELT = -150;
const G = { her: geom(HER) }; for (const k in AG) G[k] = geom(AG[k]);

// ---------------- background: terminal (prerendered, blurred)
const BX0 = -1800, BY0 = -4200, BW = 18400, BH = 5000, BS = 0.5;
const WALL = -520;
function plane(c, x, y, s, col) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = '#F4F6FA'; rr(c, -420, -60, 840, 120, 60); c.fill();
  c.fillStyle = col; c.beginPath(); c.moveTo(300, -50); c.lineTo(420, -230); c.lineTo(470, -230); c.lineTo(430, -40); c.fill();
  c.fillStyle = '#D8DEE6'; c.beginPath(); c.moveTo(-60, 10); c.lineTo(120, 10); c.lineTo(-40, 170); c.lineTo(-120, 170); c.fill();
  c.fillStyle = '#5E7FA0'; for (let i = 0; i < 12; i++) c.fillRect(-300 + i * 50, -24, 22, 22); c.fillStyle = col; c.fillRect(-420, 18, 840, 12);
  c.restore();
}
function drawTerminal(c) {
  // ceiling
  c.fillStyle = '#E9ECF2'; c.fillRect(BX0, BY0, BW, 1400);
  for (let x = BX0; x < BX0 + BW; x += 600) { c.fillStyle = '#FFFFFF'; c.fillRect(x + 60, BY0 + 900, 420, 40); c.fillStyle = 'rgba(0,0,0,.06)'; c.fillRect(x, BY0 + 1050, 600, 6); }
  // big windows onto the apron
  const wy0 = -2800, wy1 = WALL - 40;
  const sg = c.createLinearGradient(0, wy0, 0, wy1); sg.addColorStop(0, '#7EC0EC'); sg.addColorStop(0.75, '#CFE8F6'); sg.addColorStop(1, '#F4E7CF'); c.fillStyle = sg; c.fillRect(BX0, wy0, BW, wy1 - wy0);
  for (let i = 0; i < 30; i++) { const x = BX0 + hash(i) * BW, y = -2550 + hash(i * 3) * 400; c.fillStyle = 'rgba(255,255,255,.8)'; for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(x + k * 70, y - (k % 2) * 30, 64, 0, TAU); c.fill(); } }
  c.fillStyle = '#9AA3B2'; c.fillRect(BX0, -1150, BW, 600); c.fillStyle = '#F2C14E'; for (let x = BX0; x < BX0 + BW; x += 300) c.fillRect(x, -880, 150, 14);
  for (let k = 0; k < 9; k++) plane(c, BX0 + 900 + k * 1900, -1180, 1.2, ['#E0474C', '#1F3A6B', '#3FB6A8'][k % 3]);
  for (let k = 0; k < 3; k++) { const tx = BX0 + 3200 + k * 6000; c.fillStyle = '#B8C2D0'; c.fillRect(tx - 40, -2100, 80, 1000); c.fillStyle = '#5E7FA0'; rr(c, tx - 150, -2280, 300, 200, 40); c.fill(); }
  // mullions
  c.fillStyle = '#C9D1DC'; for (let x = BX0; x < BX0 + BW; x += 700) c.fillRect(x, wy0, 40, wy1 - wy0); c.fillRect(BX0, -1700, BW, 30); c.fillRect(BX0, wy0, BW, 50);
  // departure screens hanging between window bays
  for (let x = BX0 + 1300; x < BX0 + BW; x += 2600) {
    c.fillStyle = '#2B2F3A'; c.fillRect(x - 6, -3300, 12, 400); rr(c, x - 420, -2950, 840, 520, 20); c.fill();
    c.fillStyle = '#F2C14E'; c.font = '54px Unb9'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText('DEPARTURES', x - 380, -2890);
    for (let r = 0; r < 6; r++) { c.fillStyle = r % 2 ? '#353A46' : '#2F333E'; c.fillRect(x - 400, -2840 + r * 62, 800, 58); c.fillStyle = '#FFE6A0'; c.font = '36px Unb9'; c.fillText(['LONDON', 'PARIS', 'ROME', 'DUBAI', 'NEW YORK', 'TOKYO'][(r + x) % 6], x - 380, -2810 + r * 62); c.fillStyle = r === 2 ? '#7CF29A' : '#FFE6A0'; c.fillText(r === 2 ? 'BOARDING' : 'ON TIME', x + 120, -2810 + r * 62); }
  }
  // wall base + floor
  c.fillStyle = '#B8C2D0'; c.fillRect(BX0, WALL - 40, BW, 60);
  const fg = c.createLinearGradient(0, WALL, 0, 800); fg.addColorStop(0, '#D9DEE6'); fg.addColorStop(1, '#C3CAD6'); c.fillStyle = fg; c.fillRect(BX0, WALL + 20, BW, 800 - WALL);
  c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 4; for (let y = WALL + 80, k = 0; y < 800; y += 60 + k * 18, k++) { c.beginPath(); c.moveTo(BX0, y); c.lineTo(BX0 + BW, y); c.stroke(); }
  c.fillStyle = 'rgba(255,255,255,.18)'; for (let x = BX0; x < BX0 + BW; x += 700) c.fillRect(x + 100, WALL + 60, 120, 700);
}
const BGS = createCanvas(Math.round(BW * BS), Math.round(BH * BS)), bgc = BGS.getContext('2d');
bgc.scale(BS, BS); bgc.translate(-BX0, -BY0); drawTerminal(bgc);
const BGB = createCanvas(BGS.width, BGS.height); { const c = BGB.getContext('2d'); c.filter = 'blur(2.5px)'; c.drawImage(BGS, 0, 0); }

// ---------------- props
const ST_COL = { tom: 'A1', linda: 'A2', mark: 'B1', priya: 'B2', margot: 'C1', rocky: 'C2' };
function counter(c, x0, who) {
  const L = x0 - 600, R = x0 + 130, top = -790;
  // monitor (back side)
  c.fillStyle = '#5A606C'; c.fillRect(x0 - 495, top - 90, 30, 90); paint(c, q => { q.m(x0 - 590, top - 260); q.l(x0 - 370, top - 260); q.l(x0 - 370, top - 85); q.l(x0 - 590, top - 85); q.z(); }, '#C9CED6', { sd: 8, hd: 4, lw: 3.5 });
  // front face
  paint(c, q => { q.m(L, top + 30); q.l(R, top + 30); q.l(R, FY + 20); q.l(L, FY + 20); q.z(); }, '#EEF1F6', { sd: 16, hd: 6, box: [L, top, R, FY], inner: k => {
    k.fillStyle = NAVY; k.fillRect(L, top + 230, R - L, 120); k.fillStyle = '#E0474C'; k.beginPath(); k.moveTo(L, top + 360); k.quadraticCurveTo((L + R) / 2, top + 300, R, top + 380); k.lineTo(R, top + 400); k.quadraticCurveTo((L + R) / 2, top + 330, L, top + 385); k.fill();
    k.fillStyle = '#FFFDF8'; k.font = '50px Unb9'; k.textAlign = 'center'; k.textBaseline = 'middle'; k.fillText('LEVEL AIRWAYS', x0 - 235, top + 292);
    // desk number pill
    const lv = ST_COL[who]; k.fillStyle = LVCOL[lv]; rr(k, x0 - 570, top + 70, 230, 120, 30); k.fill(); k.strokeStyle = '#2B2F3A'; k.lineWidth = 5; k.stroke(); k.fillStyle = '#FFFDF8'; k.font = '24px Unb9'; k.fillText('CHECK-IN', x0 - 455, top + 100); k.font = '60px Unb9'; k.fillText(lv, x0 - 455, top + 152);
  } });
  paint(c, q => { q.m(L - 20, top); q.l(R + 20, top); q.l(R + 20, top + 34); q.l(L - 20, top + 34); q.z(); }, '#5A606C', { sd: 4, hd: 3, lw: 3.5 });
}
// scale display on the counter front
function display(c, x0, val, col, blink = 1) {
  const x = x0 - 170, y = -700;
  c.fillStyle = '#2B2F3A'; rr(c, x - 10, y - 10, 300, 150, 22); c.fill();
  c.fillStyle = '#10141C'; rr(c, x, y, 280, 130, 16); c.fill();
  c.globalAlpha = blink; c.font = '66px Unb9'; c.textAlign = 'right'; c.textBaseline = 'middle';
  c.fillStyle = rgba(col, 0.22); c.fillText('88.8', x + 212, y + 66); c.fillStyle = col; c.shadowColor = col; c.shadowBlur = 18; c.fillText(val, x + 212, y + 66); c.shadowBlur = 0;
  c.font = '26px Unb9'; c.textAlign = 'left'; c.fillText('KG', x + 222, y + 86); c.globalAlpha = 1;
}
function belt(c, x0) {
  const L = x0 + 140, R = x0 + 490;
  paint(c, q => { q.m(L, BELT); q.l(R, BELT); q.l(R, BELT + 90); q.l(L, BELT + 90); q.z(); }, '#7A808A', { sd: 6, hd: 3, lw: 3.5 });
  c.fillStyle = '#2B2F3A'; c.fillRect(L, BELT - 14, R - L, 18); c.fillStyle = '#4A4F5C'; for (let x = L + 20; x < R; x += 50) { c.beginPath(); c.arc(x, BELT + 40, 16, 0, TAU); c.fill(); }
  c.fillStyle = '#5A606C'; c.fillRect(L + 10, BELT + 90, 30, FY - BELT - 70); c.fillRect(R - 40, BELT + 90, 30, FY - BELT - 70);
}
function stanchions(c, x0) {
  const yb = FY - 260, s = 0.85;
  for (let k = 0; k < 4; k++) { const x = x0 + 560 + k * 260; c.fillStyle = '#9AA3B2'; c.fillRect(x - 8, yb - 600 * s, 16, 600 * s); c.beginPath(); c.ellipse(x, yb, 50, 14, 0, 0, TAU); c.fill(); c.fillStyle = '#C9CED6'; c.beginPath(); c.arc(x, yb - 600 * s, 18, 0, TAU); c.fill();
    if (k < 3) { c.strokeStyle = NAVY; c.lineWidth = 14; c.beginPath(); c.moveTo(x, yb - 560 * s); c.quadraticCurveTo(x + 130, yb - 500 * s, x + 260, yb - 560 * s); c.stroke(); } }
}
function bin(c, x, pile) {
  const yb = FY - 90;
  c.fillStyle = 'rgba(200,225,240,.55)'; c.strokeStyle = '#5E7FA0'; c.lineWidth = 6; rr(c, x - 170, yb - 380, 340, 380, 18); c.fill(); c.stroke();
  c.fillStyle = '#E0474C'; rr(c, x - 150, yb - 450, 300, 70, 14); c.fill(); c.fillStyle = '#FFFDF8'; c.font = '32px Unb9'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('LEFT BEHIND', x, yb - 414);
  if (pile) pile(c, x, yb);
}
// items
function melon(c, x, y, r = 90, face = 0) {
  paint(c, q => q.e(x, y, r * 1.15, r), '#3E8A4A', { sd: 14, hd: 8, inner: k => { k.strokeStyle = '#2A5E30'; k.lineWidth = 12; for (let i = -2; i <= 2; i++) { k.beginPath(); k.ellipse(x + i * r * 0.4, y, r * 0.18, r * 1.05, 0, 0, TAU); k.stroke(); } } });
  if (face > 0) { c.globalAlpha = face; c.fillStyle = '#1E1612'; for (const s of [-1, 1]) { c.beginPath(); c.arc(x + s * 30, y - 10, 9, 0, TAU); c.fill(); } c.strokeStyle = '#1E1612'; c.lineWidth = 6; c.beginPath(); c.arc(x, y + 40, 22, Math.PI + 0.5, TAU - 0.5); c.stroke(); c.fillStyle = '#7FD0FF'; c.beginPath(); c.ellipse(x + 34, y + 18, 8, 13, 0, 0, TAU); c.fill(); c.globalAlpha = 1; }
}
function pan(c, x, y, a = 0) { c.save(); c.translate(x, y); c.rotate(a); c.fillStyle = '#2B2F3A'; rr(c, 70, -14, 160, 28, 12); c.fill(); paint(c, q => q.e(0, 0, 90, 80), '#3A3F4B', { sd: 8, hd: 5, inner: k => { k.fillStyle = '#4A505C'; k.beginPath(); k.ellipse(0, 0, 66, 58, 0, 0, TAU); k.fill(); } }); c.restore(); }
function gnome(c, x, y, a = 0) { c.save(); c.translate(x, y); c.rotate(a);
  paint(c, q => { q.m(-50, 60); q.l(50, 60); q.l(40, -10); q.l(-40, -10); q.z(); }, '#3E7FC0', { sd: 6, hd: 3 });
  paint(c, q => q.e(0, -30, 34, 30), '#F4CDB0', { sd: 5, hd: 3 }); paint(c, q => { q.m(-34, 0); q.q(0, 70, 34, 0); q.q(0, 20, -34, 0); q.z(); }, '#FFFFFF', { sd: 4, hd: 2 });
  paint(c, q => { q.m(-38, -44); q.l(38, -44); q.l(6, -150); q.z(); }, '#E0474C', { sd: 6, hd: 3 }); c.fillStyle = '#E8913A'; c.beginPath(); c.arc(0, -24, 9, 0, TAU); c.fill(); c.restore(); }

function suitcase(c, x, yb, o = {}) {
  const sx = o.sx ?? 1, sy = o.sy ?? 1, w = 300 * sx, h = 560 * sy, lift = o.lift || 0, bul = o.bulge ?? 1;
  const y0 = yb - h - lift, he = o.handle ?? 110;
  c.save(); c.translate(x, 0); c.rotate(o.rot || 0);
  // telescopic handle
  c.fillStyle = '#9AA3B2'; c.fillRect(-62, y0 - he, 14, he + 10); c.fillRect(48, y0 - he, 14, he + 10);
  c.fillStyle = '#2B2F3A'; rr(c, -76, y0 - he - 34, 152, 40, 16); c.fill();
  // wheels
  c.fillStyle = '#2B2F3A'; for (const s of [-1, 1]) { c.beginPath(); c.arc(s * (w / 2 - 34), yb - lift - 4, 22, 0, TAU); c.fill(); }
  // body
  const col = o.col || '#F2C14E';
  paint(c, q => { q.m(-w / 2 + 26, y0); q.l(w / 2 - 26, y0); q.q(w / 2 + 22 * bul, y0 + 6, w / 2 + 16 * bul, y0 + h * 0.5); q.q(w / 2 + 22 * bul, y0 + h - 6, w / 2 - 26, y0 + h - 10); q.l(-w / 2 + 26, y0 + h - 10); q.q(-w / 2 - 22 * bul, y0 + h - 6, -w / 2 - 16 * bul, y0 + h * 0.5); q.q(-w / 2 - 22 * bul, y0 + 6, -w / 2 + 26, y0); q.z(); }, col, { sd: 18, hd: 9, box: [-w / 2, y0, w / 2, y0 + h], inner: k => {
    k.strokeStyle = rgba(shade(col, 0.7), 0.5); k.lineWidth = 6; for (const xx of [-w * 0.25, 0, w * 0.25]) { k.beginPath(); k.moveTo(xx, y0 + 30); k.lineTo(xx, y0 + h - 30); k.stroke(); }
    // stickers
    k.fillStyle = '#E0474C'; k.beginPath(); k.arc(-w * 0.2, y0 + h * 0.72, 44 * sx, 0, TAU); k.fill(); k.fillStyle = '#FFFDF8'; k.font = `${Math.round(26 * sx)}px Unb9`; k.textAlign = 'center'; k.textBaseline = 'middle'; k.fillText('LDN', -w * 0.2, y0 + h * 0.72);
    k.fillStyle = '#3FB6A8'; rr(k, w * 0.04, y0 + h * 0.78, 100 * sx, 56 * sx, 12); k.fill(); k.fillStyle = '#FFFDF8'; k.font = `${Math.round(22 * sx)}px Unb9`; k.fillText('PARIS', w * 0.04 + 50 * sx, y0 + h * 0.78 + 29 * sx);
  } });
  // strap
  if (o.strap !== false) { c.fillStyle = '#8A1C2E'; c.fillRect(-w / 2 - 18 * bul, y0 + h * 0.42, w + 36 * bul, 38); c.fillStyle = '#C9CED6'; rr(c, -26, y0 + h * 0.42 - 6, 52, 50, 8); c.fill(); }
  // clothes sticking out of the zip
  if (bul > 0.4 && !o.open) { c.fillStyle = '#7FB0D8'; c.beginPath(); c.moveTo(w / 2 + 8, y0 + 90); c.quadraticCurveTo(w / 2 + 70, y0 + 120, w / 2 + 50, y0 + 190); c.lineTo(w / 2 + 14, y0 + 170); c.fill(); c.fillStyle = '#EE5E9A'; c.beginPath(); c.moveTo(-w / 2 - 8, y0 + 60); c.quadraticCurveTo(-w / 2 - 60, y0 + 40, -w / 2 - 70, y0 + 100); c.lineTo(-w / 2 - 12, y0 + 110); c.fill(); }
  // open top: clothes bulging out
  if (o.open) { const k2 = o.open; c.fillStyle = '#2B2F3A'; c.beginPath(); c.ellipse(0, y0 + 14, w * 0.42 * k2, 26 * k2, 0, 0, TAU); c.fill(); for (let i = 0; i < 4; i++) { c.fillStyle = ['#7FB0D8', '#EE5E9A', '#F7F2E8', '#8CB369'][i]; c.beginPath(); c.arc(-w * 0.3 + i * w * 0.2, y0 + 4 - 20 * k2, 34 * k2, 0, TAU); c.fill(); } }
  // HEAVY tag
  if (o.heavy > 0) { const k2 = o.heavy; c.save(); c.translate(20, y0 - he - 20); c.rotate(-0.12 + Math.sin((o.t || 0) * 4) * 0.06); c.scale(k2, k2); c.strokeStyle = '#2B2F3A'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, 0); c.lineTo(20, 60); c.stroke(); c.fillStyle = '#F28C28'; rr(c, -60, 60, 190, 100, 14); c.fill(); c.lineWidth = 5; c.stroke(); c.fillStyle = '#FFFDF8'; c.font = '50px Unb9'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '44px Unb9'; c.fillText('HEAVY', 35, 112); c.restore(); }
  c.restore();
  return { top: y0, handleY: y0 - he - 14 };
}

// ---------------- her: neck pillow, puffed layers for C2
function pillowBack(cc, g) { const y = g.ySh - 6; paint(cc, q => { q.m(-g.hw * 1.0, y - 30); q.q(0, y - 60, g.hw * 1.0, y - 30); q.l(g.hw * 0.9, y + 10); q.q(0, y - 20, -g.hw * 0.9, y + 10); q.z(); }, '#EE5E9A', { sd: 6, hd: 3, lw: 3.5 }); }
function pillowFront(cc, head, hh, hw) { for (const s of [-1, 1]) paint(cc, q => { q.m(head.x + s * hw * 1.05, head.y + hh * 0.35); q.q(head.x + s * hw * 1.25, head.y + hh * 1.15, head.x + s * hw * 0.35, head.y + hh * 1.3); q.q(head.x + s * hw * 0.2, head.y + hh * 1.05, head.x + s * hw * 0.6, head.y + hh * 0.95); q.q(head.x + s * hw * 0.85, head.y + hh * 0.75, head.x + s * hw * 0.75, head.y + hh * 0.45); q.z(); }, '#EE5E9A', { sd: 7, hd: 4, lw: 3.5, inner: k => { k.fillStyle = 'rgba(255,255,255,.75)'; for (let i = 0; i < 6; i++) { k.beginPath(); k.arc(head.x + s * hw * (0.55 + 0.12 * (i % 3)), head.y + hh * (0.55 + 0.18 * Math.floor(i / 2)), 7, 0, TAU); k.fill(); } } }); }
const LAYERS = 8;
function puffCfg(n) {
  const p = n / LAYERS; const cfg = Object.assign({}, HER);
  cfg.build = { shoulder: 0.84 + 0.62 * p, hip: 1.0 + 0.55 * p, arm: 0.95 + 1.0 * p, belly: 1.4 * p, leg: 1 + 0.25 * p };
  if (n >= 1) cfg.top = { type: 'sweater', col: '#5E9E6E' };
  if (n >= 2) cfg.top = { type: 'sweater', col: '#8E5BD6' };
  if (n >= 3) cfg.top = { type: 'hoodie', col: '#F28C28' };
  return cfg;
}
function puffFront(cc, n, head, hh, hw, t) {
  // scarves, hats, sunglasses on top of the head
  if (n >= 4) { const y = head.y + hh * 0.98; paint(cc, q => { q.m(head.x - hw * 1.15, y - 40); q.q(head.x, y - 10, head.x + hw * 1.15, y - 40); q.l(head.x + hw * 1.2, y + 50); q.q(head.x, y + 80, head.x - hw * 1.2, y + 50); q.z(); }, '#E0474C', { sd: 8, hd: 5, inner: k => { k.fillStyle = 'rgba(255,255,255,.85)'; for (let i = -3; i <= 3; i++) k.fillRect(head.x + i * hw * 0.3, y - 40, 16, 140); } });
    paint(cc, q => { q.m(head.x + hw * 0.4, y + 30); q.l(head.x + hw * 0.75, y + 30); q.l(head.x + hw * 0.85 + Math.sin(t * 6) * 10, y + 300); q.l(head.x + hw * 0.5 + Math.sin(t * 6) * 10, y + 300); q.z(); }, '#E0474C', { sd: 6, hd: 3 }); }
  if (n >= 5) { const y = head.y + hh * 0.55; paint(cc, q => { q.m(head.x - hw * 1.12, y - 30); q.q(head.x, y - 4, head.x + hw * 1.12, y - 30); q.l(head.x + hw * 1.15, y + 45); q.q(head.x, y + 70, head.x - hw * 1.15, y + 45); q.z(); }, '#3C6FB4', { sd: 8, hd: 5, inner: k => { k.strokeStyle = 'rgba(255,255,255,.6)'; k.lineWidth = 5; for (let i = 0; i < 3; i++) { k.beginPath(); k.moveTo(head.x - hw * 1.2, y - 12 + i * 22); k.quadraticCurveTo(head.x, y + 12 + i * 22, head.x + hw * 1.2, y - 12 + i * 22); k.stroke(); } } }); }
  if (n >= 6) { const y = head.y - hh * 0.55; paint(cc, q => { q.m(head.x - hw * 1.08, y + 30); q.b(head.x - hw * 1.1, y - hh * 0.9, head.x + hw * 1.1, y - hh * 0.9, head.x + hw * 1.08, y + 30); q.z(); }, '#F2C14E', { sd: 8, hd: 5, inner: k => { k.fillStyle = '#E9A23B'; k.fillRect(head.x - hw * 1.1, y - 10, hw * 2.2, 40); } }); paint(cc, q => q.a(head.x, y - hh * 0.72, 34), '#FFFDF8', { sd: 4, hd: 2 }); }
  if (n >= 7) { const y = head.y - hh * 1.35; paint(cc, q => q.e(head.x, y + 30, hw * 1.9, 34), '#E8D3A0', { sd: 5, hd: 3 }); paint(cc, q => { q.m(head.x - hw * 0.8, y + 30); q.b(head.x - hw * 0.8, y - 110, head.x + hw * 0.8, y - 110, head.x + hw * 0.8, y + 30); q.z(); }, '#E8D3A0', { sd: 6, hd: 3, inner: k => { k.fillStyle = '#EE5E9A'; k.fillRect(head.x - hw * 0.85, y - 10, hw * 1.7, 30); } }); }
  if (n >= 8) { const y = head.y - hh * 1.35 - 90; cc.save(); cc.translate(head.x, y); cc.rotate(-0.25); paint(cc, q => { q.m(-hw * 0.6, 10); q.b(-hw * 0.6, -90, hw * 0.6, -90, hw * 0.6, 10); q.z(); }, '#3C8FE0', { sd: 5, hd: 3 }); paint(cc, q => { q.m(hw * 0.5, 0); q.q(hw * 1.2, -6, hw * 1.25, 18); q.q(hw * 0.9, 22, hw * 0.5, 14); q.z(); }, '#2E6FB0', { sd: 3, hd: 2, lw: 3 }); cc.restore();
    // sunglasses
    cc.fillStyle = '#1A1A1A'; for (const s of [-1, 1]) { rr(cc, head.x + s * hw * 0.4 - 42, head.y - hh * 0.12, 84, 54, 18); cc.fill(); } cc.fillRect(head.x - 20, head.y - hh * 0.1, 40, 10); cc.fillStyle = 'rgba(255,255,255,.4)'; for (const s of [-1, 1]) cc.fillRect(head.x + s * hw * 0.4 - 26, head.y - hh * 0.06, 14, 14); }
}
const GARM = ['#5E9E6E', '#8E5BD6', '#F28C28', '#E0474C', '#3C6FB4', '#F2C14E', '#E8D3A0', '#3C8FE0'];
function dressN(t) { const ev = lvEv('C2'); if (!ev.dress) return 0; let n = 0; for (let k = 0; k < LAYERS; k++) if (t >= ev.dress + 0.36 * (k + 1)) n = k + 1; return n; }

function herX(t, L) { const x0 = ST[WHO[L]]; let x = x0 + HERX; const ev = lvEv('C2'); if (L === 'C2' && ev.waddle && t > ev.waddle) x += (t - ev.waddle) * 170; return x; }
function herState(t, L, cfgOut) {
  const ev = lvEv(L); let cfg = HER, g = G.her;
  const st = { t, talk: talk('her', t), mood: 'neutral', turn: -0.45, look: -0.7 };
  // default: hand on the suitcase handle
  const hand = (lift = 0) => reach(g, -1, -(HERX - SXO) - 10, BELT - 560 - 110 - 14 - lift - FY);
  st.armL = hand(); st.armR = reach(g, 1, g.sw * 0.5, g.ySh + 300);
  let pillow = true, n = 0;
  const l = (L || '').toLowerCase(); const hs = SP[l + '_her'];
  if (hs && speaking(l + '_her', t, 0.05)) { const gg = Math.sin((t - hs.t) * 4.5); st.armR = reach(g, 1, g.sw * 0.8 + gg * 40, g.ySh + 200 - Math.abs(gg) * 50); }
  if (L === 'hook') { st.mood = 'worried'; }
  if (L === 'A1') {
    if (ev.lift && t > ev.lift && t < ev.drop) { st.mood = 'smug'; st.armL = hand(liftAmt(t)); st.tilt = -0.05; st.armR = reach(g, 1, g.sw * 0.6, g.ySh + 280); }
    if (SP.a1_x && t > SP.a1_x.t + 0.4 && t < ev.drop) { st.mood = 'worried'; st.look = -0.3; st.lookY = 0.7; }
    if (ev.drop && t > ev.drop) { st.mood = t < ev.drop + 0.8 ? 'shock' : 'happy'; }
  }
  if (L === 'A2') { if (ev.price && t > ev.price) { st.mood = 'shock'; st.armR = reach(g, 1, g.sw * 0.35, g.headY + 140); } if (SP.a2_nar && t > SP.a2_nar.t + 1.2) st.mood = 'worried'; }
  if (L === 'B1') {
    if (SP.b1_x && t > SP.b1_x.t + 0.3) st.mood = 'happy';
    if (ev.open && t > ev.open - 0.1 && t < ev.open + 2.3) { const k = Math.floor((t - ev.open - 0.35) / 0.55), u = ((t - ev.open - 0.35) % 0.55) / 0.55; st.mood = 'happy';
      st.armL = reach(g, -1, -(HERX - SXO) + 20 + Math.sin(t * 20) * 20, BELT - 560 - FY + 40 + Math.cos(t * 17) * 20); if (k >= 0 && k < 3 && u < 0.4) st.armR = reach(g, 1, g.sw * 1.2, g.headY - 120); }
    const sadT = wordT('b1_nar', 'арбуз'); if (sadT && t > sadT - 0.2 && t < sadT + 1.6) { const w = Math.sin(t * 12); st.mood = 'worried'; st.turn = 0.3; st.look = 0.8; st.armR = reach(g, 1, g.sw * 1.9 + w * 50, g.ySh + 60); }
  }
  if (L === 'B2') { if (SP.b2_x && t > SP.b2_x.t + 0.4) { st.mood = 'shock'; } if (ev.rim && t > ev.rim - 0.1) { st.mood = 'bored'; st.turn = -0.05; st.look = 0.1; } if (SP.b2_nar && t > SP.b2_nar.t + 1.5) { st.mood = 'neutral'; st.turn = -0.45; st.look = -0.7; } }
  if (L === 'C1') { if (SP.c1_x && t > SP.c1_x.t + 0.4) st.mood = 'worried'; if (ev.stamp && t > ev.stamp) st.mood = t < ev.stamp + 0.9 ? 'shock' : 'worried'; }
  if (L === 'C2') {
    if (speaking('c2_her', t, 0.1)) { st.mood = 'smug'; st.tilt = -0.04; st.armR = reach(g, 1, g.sw * 1.5 + Math.sin(t * 2.4) * 40, g.ySh + 50 + Math.cos(t * 2.4) * 30); st.items = { R: items.teacup() }; }
    if (t > endOf('c2_her') + 0.2) st.mood = 'neutral';
    if (SP.c2_x && t > endOf('c2_x') + 0.1) { st.mood = 'happy'; st.look = 0; st.turn = -0.1; }
    n = dressN(t);
    if (ev.dress && t > ev.dress) { pillow = false; cfg = puffCfg(n); g = geom(cfg); const bounce = n > 0 ? 1 + 0.06 * Math.sin(P(t, ev.dress + 0.36 * n, ev.dress + 0.36 * n + 0.25) * Math.PI) : 1; st.scaleB = bounce; st.mood = n >= 5 ? 'happy' : 'happy';
      if (n < 3) { st.armL = reach(g, -1, -(HERX - SXO) + 30 + Math.sin(t * 18) * 25, BELT - 560 - FY + 60); st.armR = reach(g, 1, g.sw * 1.1, g.ySh + 120 + Math.sin(t * 14) * 40); }
      else { const wob = Math.sin(t * 3) * 0.04; st.armL = reach(g, -1, -g.sw * 1.9, g.ySh + 330 + wob * 200); st.armR = reach(g, 1, g.sw * 1.9, g.ySh + 330 - wob * 200); }
      st.turn = -0.15; st.look = -0.2; }
    if (ev.waddle && t > ev.waddle) { const ph = (t - ev.waddle) * 6.5; st.tilt = Math.sin(ph) * 0.09; st.turn = 0.35; st.look = 0.6; st.legPose = 'walk'; st.headY = -Math.abs(Math.sin(ph)) * 10; }
    if (SP.c2_her2 && speaking('c2_her2', t)) st.talk = 0;
  }
  if (L === 'outro') { pillow = true; st.mood = 'happy'; st.turn = 0; st.look = 0; st.armL = reach(g, -1, -g.sw * 1.5 + Math.sin(t * 8) * 40, g.headY - 220); st.armR = reach(g, 1, g.sw * 1.0, g.ySh + 300); }
  if (pillow) { st.afterTorso = (cc) => pillowBack(cc, g); }
  const prevFront = st.front; st.front = (cc, gg) => { if (pillow) pillowFront(cc, gg.head, g.hh, g.hw); if (n > 0) puffFront(cc, n, gg.head, g.hh, g.hw, t); };
  if (cfgOut) cfgOut.cfg = cfg;
  return st;
}
function liftAmt(t) { const ev = lvEv('A1'); if (!ev.lift) return 0; return 40 * eOut(P(t, ev.lift, ev.lift + 0.3)) * (1 - P(t, ev.drop, ev.drop + 0.08)) + Math.sin(t * 23) * 4 * (t > ev.lift && t < ev.drop ? 1 : 0); }
function put(c, cfg, st, x, y = FY, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); const r = human(c, cfg, st); c.restore(); return { x: x + r.head.x * s, y: y + r.head.y * s, hh: r.hh * s, r }; }
function drawHer(c, t, L, x, s = 1, y = FY) { const o = {}; const st = herState(t, L, o); return put(c, o.cfg, st, x, y, s); }

// ---------------- agents
function stampItem(up) { return (ctx, a) => { ctx.rotate(Math.PI); paint(ctx, q => { q.m(-18, -10); q.l(18, -10); q.l(14, 70); q.l(-14, 70); q.z(); }, '#8A5A3A', { sd: 4, hd: 2, lw: 3 }); paint(ctx, q => { q.m(-50, 70); q.l(50, 70); q.l(50, 110); q.l(-50, 110); q.z(); }, '#2B2F3A', { sd: 4, hd: 2, lw: 3 }); ctx.fillStyle = '#E0474C'; ctx.fillRect(-46, 106, 92, 10); }; }
function badgeOn(cc, g, gg, name) { const x = g.sw * 0.42, y = gg.ySh + 150; cc.fillStyle = '#FFFDF8'; rr(cc, x - 54, y - 20, 108, 40, 8); cc.fill(); cc.strokeStyle = '#2B2F3A'; cc.lineWidth = 3; cc.stroke(); cc.fillStyle = NAVY; cc.font = '22px Unb9'; cc.textAlign = 'center'; cc.textBaseline = 'middle'; cc.fillText(name, x, y + 1); cc.fillStyle = '#F2C14E'; cc.beginPath(); cc.arc(-g.sw * 0.45, y - 6, 14, 0, TAU); cc.fill(); }
function agent(c, t, L, who, x) {
  const g = G[who], cfg = AG[who]; const ev = lvEv(L); const ct = -850;
  const st = { t, talk: talk(who, t), mood: 'happy', turn: 0.35, look: 0.8, armL: reach(g, -1, -g.sw * 1.05, ct), armR: reach(g, 1, g.sw * 1.0, ct) };
  const l = (L || '').toLowerCase();
  if (speaking(l + '_x', t, 0.05)) { const u = (t - SP[l + '_x'].t) * 4; st.armR = reach(g, 1, g.sw * 1.6 + Math.sin(u) * 30, g.ySh + 260 + Math.cos(u) * 30); }
  if (who === 'tom' && L === 'A1') {
    if (t > SP.a1_her.t + 0.4) { st.mood = 'skeptical'; st.look = 1; st.lookY = 0.5; }
    if (speaking('a1_x', t, 0.15, 0.6)) { st.armR = reach(g, 1, g.sw * 3.2, g.ySh + 180); st.tilt = 0.06; }
    if (ev.drop && t > ev.drop + 0.2) { st.mood = 'happy'; st.armR = reach(g, 1, g.sw * 1.0, ct); }
  }
  if (who === 'linda' && L === 'A2') { if (ev.price && t > ev.price - 0.1) { st.mood = 'happy'; st.armR = reach(g, 1, g.sw * 1.4, g.ySh + 120); st.items = { R: items.terminal('£75.00') }; } }
  if (who === 'mark' && L === 'B1') { if (speaking('b1_x', t, 0, 1.2)) { st.armR = reach(g, 1, g.sw * 2.2, g.ySh - 330); st.armL = reach(g, -1, -g.sw * 1.05, ct); } if (ev.open && t > ev.open) { st.mood = 'shock'; st.look = 1; st.lookY = -0.6; } if (SP.b1_nar && t > SP.b1_nar.t) st.mood = 'happy'; }
  if (who === 'priya' && L === 'B2') { st.mood = 'neutral'; if (speaking('b2_x', t, 0.05, 0.3)) { st.mood = 'bored'; st.armR = reach(g, 1, g.sw * 1.0, ct); } if (ev.rim && t > ev.rim) { st.mood = 'smug'; st.turn = 0.05; st.look = 0.1; } }
  if (who === 'margot' && L === 'C1') {
    st.mood = 'neutral'; if (SP.c1_her && t > SP.c1_her.t + 1.5) st.mood = 'skeptical';
    const up = ev.stamp ? P(t, ev.stamp - 1.1, ev.stamp - 0.6) * (1 - P(t, ev.stamp - 0.08, ev.stamp)) : 0;
    if (ev.stamp && t > ev.stamp - 1.2 && t < ev.stamp + 1.0) { st.items = { R: stampItem() }; st.armR = reach(g, 1, g.sw * 1.9, lerp(ct + 20, g.ySh - 60, eOut(up))); st.mood = t > ev.stamp ? 'smug' : 'skeptical'; }
  }
  if (who === 'rocky' && L === 'C2') {
    st.mood = 'bored';
    if (SP.c2_her && t > endOf('c2_her') - 0.2) { st.mood = 'skeptical'; st.look = 0.2; st.lookY = 0.9; }
    if (speaking('c2_x', t, 0.05, 0.3)) { st.mood = 'neutral'; st.armR = reach(g, 1, g.sw * 2.2, g.ySh + 330); st.look = 0.9; st.lookY = 0.3; }
    if (ev.dress && t > ev.dress) { st.mood = 'shock'; st.look = 1; st.lookY = 0; }
    if (SP.c2_x2 && t > SP.c2_x2.t - 0.3) { st.mood = 'happy'; }
    if (SP.c2_her2 && t > SP.c2_her2.t) { const w = Math.sin(t * 10); st.armR = reach(g, 1, g.sw * 1.7 + w * 40, g.headY - 120); }
  }
  st.front = (cc, gg) => badgeOn(cc, g, gg, who.toUpperCase());
  return put(c, cfg, st, x);
}

// ---------------- passers-by (behind, small)
const PASS = ['joe', 'ben', 'jay', 'doris'];
function passers(c, t, x0, L) {
  if (L === 'C2') return;
  const cyc = 10.5, ph = ((t + hash(x0) * 10) % cyc) / cyc; if (ph > 0.42) return;
  const k = ph / 0.42, who = PASS[Math.floor((t + hash(x0) * 10) / cyc + x0) % 4], dir = Math.floor((t + hash(x0) * 10) / cyc) % 2 ? 1 : -1;
  const x = x0 + (dir > 0 ? lerp(-900, 1600, k) : lerp(1600, -900, k)), s = 0.5, y = WALL + 60;
  const cfg = CAST[who], g = geom(cfg); const sw = Math.sin(t * 8);
  c.save(); c.translate(x, y); c.scale(s * (dir > 0 ? 1 : -1), s);
  // rolling bag behind
  c.fillStyle = '#4A4F5C'; rr(c, -360, -420, 160, 380, 20); c.fill(); c.fillStyle = '#9AA3B2'; c.fillRect(-290, -620, 12, 210); c.strokeStyle = '#2B2F3A'; c.lineWidth = 8; c.beginPath(); c.moveTo(-284, -620); c.lineTo(-g.sw * 1.1, g.ySh + 420); c.stroke();
  human(c, cfg, { t, mood: 'happy', turn: 0.6, look: 0.8, legPose: 'walk', armL: reach(g, -1, -g.sw * 1.1, g.ySh + 420), armR: reach(g, 1, g.sw * 0.9 + sw * 40, g.ySh + 380) });
  c.restore();
}

// ---------------- composition
function world(c, t, L) {
  c.drawImage(BGB, BX0, BY0, BW, BH);
  const who = WHO[L], x0 = ST[who]; const heads = {}; const ev = lvEv(L);
  passers(c, t, x0, L);
  stanchions(c, x0);
  if (L === 'B1') bin(c, x0 + 960, (cc, x, yb) => { const o = ev.open || 1e9; if (t > o + 0.9) melon(cc, x - 40, yb - 100, 90, P(t, (wordT('b1_nar', 'арбуз') || 1e9) - 0.3, (wordT('b1_nar', 'арбуз') || 1e9))); if (t > o + 1.45) pan(cc, x + 60, yb - 150, -0.5); if (t > o + 2.0) gnome(cc, x + 10, yb - 230, 0.3); });
  heads[who] = agent(c, t, L, who, x0 + NBX);
  // suitcase on the belt (drawn before the counter so it can slide behind it)
  let sxp = x0 + SXO, sx = 1, sy = 1, bul = 1, open = 0, rot = 0, lift = 0;
  if (L === 'A1') lift = liftAmt(t);
  if (L === 'B1' && ev.open && t > ev.open) { open = eOut(P(t, ev.open, ev.open + 0.25)); bul = lerp(1, 0.55, P(t, ev.open, ev.open + 2.2)); }
  if (L === 'C2' && ev.dress && t > ev.dress) { const n = dressN(t); open = t < ev.dress + 0.36 * LAYERS + 0.2 ? eOut(P(t, ev.dress, ev.dress + 0.2)) : 0; sx = lerp(1, 0.66, n / LAYERS); sy = lerp(1, 0.78, n / LAYERS); bul = lerp(1, 0, n / LAYERS); }
  if (L === 'C2' && ev.waddle && t > ev.waddle) { sxp -= eIn(P(t, ev.waddle, ev.waddle + 1.6)) * 900; }
  if (L === 'A1' && ev.drop) rot = Math.sin(P(t, ev.drop, ev.drop + 0.5) * Math.PI * 3) * 0.03 * (1 - P(t, ev.drop, ev.drop + 0.5));
  const heavy = L === 'C1' && ev.stamp ? eBack(P(t, ev.stamp + 0.15, ev.stamp + 0.45), 2) : 0;
  belt(c, x0);
  if (L !== 'outro') suitcase(c, sxp, BELT - 4, { sx, sy, bulge: bul, open, rot, lift, heavy, t });
  counter(c, x0, who);
  // scale reading
  if (L !== 'hook') { const [v, col, bl] = reading(t, L); display(c, x0, v, col, bl); }
  // A2 price popup
  if (L === 'A2' && ev.price && t > ev.price) { const k = eBack(P(t, ev.price, ev.price + 0.3), 2.2); c.save(); c.translate(x0 + 10, -1010 + Math.sin(t * 5) * 8); c.scale(k, k); c.rotate(-0.08); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -140, -70, 300, 150, 30); c.fill(); c.fillStyle = C.gold; c.strokeStyle = C.oliveD; c.lineWidth = 8; rr(c, -150, -80, 300, 150, 30); c.fill(); c.stroke(); c.fillStyle = C.oliveD; c.font = '96px Unb9'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('£75', 0, 0); c.restore(); }
  heads.her = drawHer(c, t, L, herX(t, L));
  // B1 flying items
  if (L === 'B1' && ev.open) for (let k = 0; k < 3; k++) { const a = ev.open + 0.5 + 0.55 * k, u = P(t, a, a + 0.4); if (u <= 0 || u >= 1) continue; const x = lerp(x0 + SXO, x0 + 960 + [-40, 60, 10][k], u), y = lerp(-760, [-130, -180, -260][k] + FY - 90, u) - Math.sin(u * Math.PI) * 1500; const r = u * 9; if (k === 0) melon(c, x, y, 90); else if (k === 1) pan(c, x, y, r); else gnome(c, x, y, r); }
  // C2 flying garments
  if (L === 'C2' && ev.dress) for (let k = 0; k < LAYERS; k++) { const a = ev.dress + 0.36 * (k + 1) - 0.3, u = P(t, a, a + 0.3); if (u <= 0 || u >= 1) continue; const x = lerp(x0 + SXO, x0 + HERX, u), y = lerp(-760, -1250 - (k > 4 ? 250 : 0), u) - Math.sin(u * Math.PI) * 420; c.save(); c.translate(x, y); c.rotate(u * 8); paint(c, q => { q.m(-80, -50); q.q(0, -80, 80, -50); q.l(70, 50); q.q(0, 70, -70, 50); q.z(); }, GARM[k], { sd: 8, hd: 4 }); c.restore(); }
  return heads;
}
function reading(t, L) {
  const ev = lvEv(L); const RED = '#FF4A5A', GRN = '#5CFF8A', blink = 0.75 + 0.25 * Math.sin(t * 9);
  if (L === 'A1') { if (ev.lift && t > ev.lift + 0.15 && t < ev.drop) return [(23 + Math.sin(t * 23) * 0.15).toFixed(1), GRN, 1]; return ['29.0', RED, t > (ev.drop || 0) ? blink : 1]; }
  if (L === 'B1' && ev.open) { const v = [29.0, 26.4, 24.9, 23.0]; let i = 0; for (let k = 0; k < 3; k++) if (t > ev.open + 0.5 + 0.55 * k) i = k + 1; return [v[i].toFixed(1), i === 3 && t > ev.open + 2.3 ? GRN : RED, 1]; }
  if (L === 'C2') { if (ev.waddle && t > ev.waddle + 1.2) return ['0.0', GRN, 1]; const n = dressN(t); const v = [29.0, 28.2, 27.3, 26.1, 25.4, 24.7, 24.1, 23.6, 23.0]; return [v[n].toFixed(1), n === LAYERS && t > ev.dress + 0.36 * LAYERS + 0.05 ? GRN : RED, 1]; }
  return ['29.0', RED, 1];
}

// ---------------- camera
function shotFor(t) {
  const sc = sceneAt(t), L = sc.id; const who = WHO[L], x0 = ST[who];
  const herHY = FY + G.her.headY, nbHY = FY + G[who].headY;
  const hx = x0 + HERX, nx = x0 + NBX;
  const two = { x: x0 + 225, y: Math.min(herHY, nbHY) + 160, z: 0.9, r: 0 };
  const bag = { x: x0 + 260, y: -1020, z: 1.1, r: 0 };
  if (L === 'hook' || L === 'outro') return { x: x0 + 240, y: -1000, z: 0.9, r: 0 };
  const u = t - sc.s; const ev = sc.ev || {};
  if (u < 1.15) return { ...two, z: 0.86, cut: u < 0.85 };
  const l = L.toLowerCase(); const her = l + '_her', oth = l + '_x', nar = l + '_nar';
  const herC = { x: hx - 40, y: herHY + 120, z: 1.45, r: -0.5 }, othC = { x: nx + 40, y: nbHY + 120, z: L === 'C2' ? 1.6 : 1.42, r: 0.5 };
  if (L === 'A1') {
    if (t < SP.a1_x.t - 0.25) return bag;
    if (t < endOf('a1_x') + 0.15) return { ...othC, z: 1.3 };
    if (t < SP.a1_nar.t - 0.1) return { ...bag, cut: t < ev.drop - 0.25 };
    return { ...two, z: 0.93 };
  }
  if (L === 'A2' && ev.price && t > ev.price - 0.15 && t < SP.a2_nar.t + 0.3) return { ...two, z: 0.98 };
  if (L === 'B1' && ev.open && t > ev.open - 0.25 && t < SP.b1_nar.t + 0.4) return { x: x0 + 450, y: -1040, z: 0.72, r: 0 };
  if (L === 'B1' && SP.b1_nar && t > SP.b1_nar.t + 0.4) return { x: x0 + 560, y: -980, z: 0.8, r: 0 };
  if (L === 'B2' && ev.rim && t > ev.rim - 0.15 && t < SP.b2_nar.t) return { ...two, z: 1.0 };
  if (L === 'C1' && ev.stamp && t > ev.stamp - 1.3 && t < SP.c1_nar.t - 0.05) return { x: x0 + 200, y: -1080, z: 1.0, r: 0 };
  if (L === 'C2') {
    const he = endOf('c2_her');
    if (t < SP.c2_her.t - 0.2) return { ...two, z: 1.0 };
    if (t < he + 0.1) return { ...herC, z: lerp(1.35, 1.8, P(t, SP.c2_her.t, he)), y: lerp(herHY + 125, herHY + 90, P(t, SP.c2_her.t, he)) };
    if (t < endOf('c2_x') + 0.15) return { ...othC, cut: t < SP.c2_x.t - 0.2 && t < he + 0.15 };
    if (t < SP.c2_x2.t - 0.2) return { x: x0 + 420, y: -1080, z: 0.9, r: 0 };
    if (t < SP.c2_her2.t - 0.1) return { ...two, z: 0.92 };
    if (t < ev.waddle) return { ...herC, z: 1.3, y: herHY + 160 };
    return { x: x0 + HERX + 120, y: -1120, z: 0.56, r: 0 };
  }
  if (speaking(her, t, 0.3, 0.1)) return herC;
  if (SP[nar] && t >= SP[nar].t - 0.15) return { ...two, z: 0.9 };
  if (speaking(oth, t, 0.3, 0.3)) return othC;
  return two;
}
const CAM = E.simulateCamera(TL, shotFor, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);

// ---------------- NEW opener: split-flap departure board
function flapTile(c, x, y, w, h, ch, col, t, seed) {
  const fl = (() => { if (t < 0.6) return -1; const per = 3.2 + hash(seed) * 3, ph = (t + hash(seed * 7) * per) % per; return ph < 0.16 ? ph / 0.16 : -1; })();
  c.fillStyle = '#1B1F27'; rr(c, x, y, w, h, 10); c.fill();
  c.fillStyle = '#262B35'; rr(c, x + 4, y + 4, w - 8, h / 2 - 6, 8); c.fill(); c.fillStyle = '#20242D'; rr(c, x + 4, y + h / 2 + 2, w - 8, h / 2 - 6, 8); c.fill();
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  c.fillStyle = col; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `${Math.round(h * 0.72)}px Unb9`;
  if (fl >= 0) { c.save(); c.translate(0, y + h / 2); c.scale(1, Math.abs(Math.cos(fl * Math.PI))); c.fillText(ch, x + w / 2, 4); c.restore(); }
  else c.fillText(ch, x + w / 2, y + h / 2 + 4);
  c.restore();
  c.fillStyle = '#0E1116'; c.fillRect(x, y + h / 2 - 2, w, 4);
}
function flapRow(c, txt, cy, tw, th, col, t, seed, gap = 8) {
  const chars = [...txt]; const total = chars.length * tw + (chars.length - 1) * gap; let x = 540 - total / 2;
  chars.forEach((ch, i) => { if (ch !== ' ') flapTile(c, x, cy - th / 2, tw, th, ch, col, t, seed + i * 3.7); x += tw + gap; });
}
function drawHook(c, t) {
  const zin = lerp(1.05, 1, eOut(P(t, 0, 0.5)));
  c.fillStyle = '#16233F'; c.fillRect(0, 0, W, HH);
  // windows strip with a plane taking off behind the board
  const sg = c.createLinearGradient(0, 1030, 0, 1480); sg.addColorStop(0, '#7EC0EC'); sg.addColorStop(1, '#F4E7CF'); c.fillStyle = sg; c.fillRect(0, 1030, W, 450);
  { const k = (t * 0.12 + 0.2) % 1; plane(c, lerp(-300, 1400, k), lerp(1390, 1150, k), 0.42, '#E0474C'); }
  c.fillStyle = '#C9D1DC'; for (let x = 0; x < W; x += 270) c.fillRect(x, 1030, 18, 450);
  const fg = c.createLinearGradient(0, 1480, 0, HH); fg.addColorStop(0, '#D9DEE6'); fg.addColorStop(1, '#B8C2D0'); c.fillStyle = fg; c.fillRect(0, 1480, W, 440);
  c.save(); c.translate(540, 700); c.scale(zin, zin); c.translate(-540, -700);
  // the board
  c.fillStyle = 'rgba(0,0,0,.35)'; rr(c, 44, 316, 1000, 730, 34); c.fill();
  c.fillStyle = '#0E1116'; c.strokeStyle = '#3A4252'; c.lineWidth = 10; rr(c, 36, 300, 1008, 730, 34); c.fill(); c.stroke();
  c.fillStyle = '#F2C14E'; c.font = '44px Unb9'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText('DEPARTURES', 90, 362); c.textAlign = 'right'; c.fillStyle = '#9AA3B2'; c.font = '36px Unb9'; c.fillText('ВЫЛЕТ', 990, 362);
  c.fillStyle = '#3A4252'; c.fillRect(70, 400, 940, 5);
  const HT = TL.cfg.hook_title;
  flapRow(c, HT[0][0], 482, 100, 130, '#FFD54A', t, 1);
  flapRow(c, HT[1][0], 655, 150, 190, '#FF5A7A', t, 40);
  flapRow(c, HT[2][0], 830, 84, 116, '#FFD54A', t, 80);
  flapRow(c, HT[3][0], 965, 72, 100, '#FFD54A', t, 120, 6);
  c.restore();
  // her pushing an enormous suitcase onto the scale
  c.fillStyle = '#5A606C'; rr(c, 160, 1700, 440, 62, 12); c.fill(); c.fillStyle = '#2B2F3A'; c.fillRect(160, 1690, 440, 14);
  c.save(); c.translate(380, 1692); c.scale(0.85, 0.85); suitcase(c, 0, 0, { sx: 1.35, sy: 1.0, bulge: 1.6, rot: Math.sin(t * 7) * 0.02 }); c.restore();
  { const g = G.her, st = { t, talk: 0, mood: 'worried', turn: -0.5, look: -0.6, tilt: -0.06, armL: reach(g, -1, -g.sw * 2.3, g.ySh + 380 + Math.sin(t * 7) * 10), armR: reach(g, 1, -g.sw * 0.2, g.ySh + 330), afterTorso: cc => pillowBack(cc, g) }; st.front = (cc, gg) => pillowFront(cc, gg.head, g.hh, g.hw); c.save(); c.translate(770, 1790); c.scale(0.48, 0.48); human(c, HER, st); c.restore(); }
  // display "29.0 KG" + MAX 23 sign
  c.save(); c.translate(220, 1810); display(c, 0, '29.0', '#FF4A5A', 0.75 + 0.25 * Math.sin(t * 9)); c.restore();
  c.save(); c.translate(948, 1108); c.rotate(0.06); c.fillStyle = '#FFFDF8'; c.strokeStyle = '#2B2F3A'; c.lineWidth = 7; rr(c, -100, -60, 200, 120, 18); c.fill(); c.stroke(); c.fillStyle = '#2B2F3A'; c.font = '30px Unb9'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('MAX', 0, -26); c.fillStyle = '#4CAF6A'; c.font = '50px Unb9'; c.fillText('23 KG', 0, 20); c.restore();
  // question bubble on "договориться"
  const qT = (SP.hook.words.find(w => w[0].toLowerCase().startsWith('договор')) || [0, 4.2])[1] + SP.hook.t;
  const qk = eBack(P(t, qT, qT + 0.3), 2.2) * (1 - P(t, qT + 3.2, qT + 3.4));
  if (qk > 0) { c.save(); c.translate(560, 1090); c.scale(qk, qk); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -150, -55, 300, 110, 40); c.fill(); c.stroke(); c.beginPath(); c.moveTo(60, 52); c.lineTo(130, 100); c.lineTo(100, 50); c.fill(); c.stroke(); c.fillStyle = C.white; c.fillRect(56, 40, 50, 12); c.fillStyle = C.oliveD; c.font = '50px Nun9'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Please…?', 0, -2); c.restore(); }
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
  c.save(); c.translate(570, lerp(2850, 2400, eBack(P(u, 0.6, 1.1), 1.4))); c.scale(0.56, 0.56); agent(c, t, 'outro', 'priya', 0); c.restore();
  c.save(); c.translate(900, lerp(3050, 2600, eBack(P(u, 0.5, 1.0), 1.4))); c.scale(0.53, 0.53); agent(c, t, 'outro', 'rocky', 0); c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const q = eBack(P(u, 0.35, 0.7), 2.2);
  c.save(); c.translate(540, 450); c.scale(q, q); font(c, 'Unb9', 74); strokeText(c, 'А ЧТО СКАЖЕШЬ', 0, -66, C.oliveD, C.white, 16); strokeText(c, 'ТЫ?', 0, 40, C.pink, C.white, 16); c.restore();
  const ex = [['Bag. Good. Twenty-three!', true], ['How much do I have to pay?', false], ['Is there an excess baggage fee?', false], ['Could you let it slide?', false]];
  ex.forEach(([e, bad], i) => { const k = eBack(P(u, 1.05 + i * 0.22, 1.4 + i * 0.22), 2.2); if (k <= 0) return; c.save(); c.translate(540 + (i % 2 ? 30 : -30), 660 + i * 115 + Math.sin(t * 3 + i) * 5); c.scale(k, k); textFit(c, 'Nun9', 50, e, 800); const w = c.measureText(e).width + 70; c.fillStyle = 'rgba(0,0,0,.12)'; R(c, -w / 2 + 6, -44 + 8, w, 88, 44); c.fill(); c.fillStyle = bad ? '#B9B2A4' : [LVCOL.A2, LVCOL.B2, LVCOL.C1][i - 1]; R(c, -w / 2, -44, w, 88, 44); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke(); c.fillStyle = C.white; c.fillText(e, 0, 3); if (bad) { c.strokeStyle = C.red; c.lineWidth = 9; c.beginPath(); c.moveTo(-w / 2 + 20, 4); c.lineTo(w / 2 - 20, 0); c.stroke(); } c.restore(); });
  const ak = eOut(P(t, o.t + 1.3, o.t + 1.6));
  if (ak > 0) { c.save(); c.globalAlpha = ak; c.translate(540, 1170 + Math.sin(t * 7) * 10); font(c, 'Unb9', 46); c.fillStyle = C.oliveD; c.fillText('ПИШИ В КОММЕНТЫ', 0, 0); c.fillStyle = C.pink; c.beginPath(); c.moveTo(-40, 50); c.lineTo(40, 50); c.lineTo(0, 100); c.fill(); c.restore(); }
  const subT = (wordT('outro', 'подпиш') || o.t + 4.6) - 0.35;
  const sk = eBack(P(t, subT, subT + 0.3), 2);
  if (sk > 0) { const click = P(t, subT + 0.8, subT + 0.95), pressed = t > subT + 0.9; c.save(); c.translate(540, 1420); const ss = sk * (1 - 0.08 * Math.sin(click * Math.PI)); c.scale(ss, ss); c.fillStyle = pressed ? C.olive : C.pink; R(c, -250, -62, 500, 124, 62); c.fill(); font(c, 'Unb9', 44); c.fillStyle = C.white; c.fillText(pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4); c.restore();
    const mv = eIO(P(t, subT + 0.2, subT + 0.8)); UI.tapCursor(c, lerp(840, 610, mv), lerp(1700, 1440, mv), 1, P(t, subT + 0.85, subT + 1.4));
    if (pressed) { c.fillStyle = C.gold; for (let i = 0; i < 10; i++) { const a = i / 10 * 6.28, r = 120 + 200 * P(t, subT + 0.9, subT + 1.4); c.globalAlpha = 1 - P(t, subT + 0.9, subT + 1.6); UI.star(c, 540 + Math.cos(a) * r * 1.6, 1420 + Math.sin(a) * r, 16, a); } c.globalAlpha = 1; } }
  const k = (t * 0.15) % 1; plane(c, lerp(-300, 1400, k), lerp(330, 250, k), 0.2, '#E0474C');
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
  const gr = c.createLinearGradient(0, 0, 0, HH); gr.addColorStop(0, 'rgba(255,240,210,.06)'); gr.addColorStop(1, 'rgba(40,50,90,.08)'); c.fillStyle = gr; c.fillRect(0, 0, W, HH);
  Hq.vignette(c, W, HH, 0.26);
  const proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f });
  const l = sc.id.toLowerCase(); const ev = sc.ev || {};
  const lineIds = TL.speech.filter(x => x.id.startsWith(l + '_') && x.who !== 'nar' && x.who !== 'tip');
  const holdFor = sp => { if (sp.id === 'c2_her') return 0.0; if (sp.id === 'b1_x') return 0.1; if (sp.id === 'c2_x') return 0.25; const i = lineIds.indexOf(sp); const nx = lineIds[i + 1]; return nx ? Math.max(0.05, Math.min(0.9, nx.t - (sp.t + sp.d) - 0.25)) : 0.9; };
  for (const sp of lineIds) {
    const hd = sp.who === 'her' ? heads.her : heads[sp.who]; if (!hd) continue;
    if (sp.who === 'her') UI.bubble(c, { ...sp, hold: holdFor(sp) }, t, proj({ x: hd.x - 30, y: hd.y - hd.hh * 1.25 }), 'left');
    else UI.bubble(c, { ...sp, hold: holdFor(sp) }, t, proj({ x: hd.x + 30, y: hd.y - hd.hh * 1.25 }), 'right', NAMES[sp.who]);
  }
  // B2 rimshot burst
  if (sc.id === 'B2' && ev.rim && t > ev.rim && t < ev.rim + 1.4) { const k = eBack(P(t, ev.rim, ev.rim + 0.25), 2.4) * (1 - P(t, ev.rim + 1.15, ev.rim + 1.4)); c.save(); c.translate(560, 1180); c.rotate(-0.08); c.scale(k, k); UI.font(c, 'Unb9', 78); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, 'БА-ДУМ-ТСС!', 0, 0, C.gold, C.oliveD, 16); c.restore(); }
  // C2 thinking dots
  if (sc.id === 'C2') {
    const a = endOf('c2_her') + 0.3, b = SP.c2_x.t - 0.1;
    if (t > a && t < b) { const dots = Math.min(3, Math.floor((t - a) / 0.55) + 1); c.save(); c.globalAlpha = clamp((t - a) / 0.2) * clamp((b - t) / 0.15); UI.font(c, 'Unb9', 150); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, '.'.repeat(dots).padEnd(3, ' '), 540, 1450, C.white, C.oliveD, 16); UI.font(c, 'Nun9', 40); UI.strokeText(c, '*Рокки взвешивает*', 540, 1560, C.white, C.oliveD, 10); c.restore(); }
  }
  UI.card(c, t, sc); UI.captions(c, t); UI.sparkles(c, t);
  Hq.grain(c, W, HH, t, 0.04);
  UI.levelBar(c, t, sc, 1); UI.watermark(c); UI.levelIntro(c, t, sc); UI.levelIntroNext(c, t);
}
E.run('airport', NF, renderFrame);
