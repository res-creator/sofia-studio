// "Pay rise" episode renderer: node raise.js start end out.mp4 | --png=f1,f2
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, shade, rgba, paint, rr, human, pug, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/raise/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SC, SP, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI);
const { talk, speaking, endOf, EV, put } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;

// ---------------- cast & layout
const HER = { ...BASE.her_london };
const GRANT = { ...BASE.greg, top: { type: 'blazer', col: '#2B3A67', tie: '#F2C14E' }, bottom: { type: 'trousers', col: '#2B3A67' }, shoes: { col: '#1A1A1A', acc: null } };
const WHIT = { ...BASE.margot, top: { type: 'blazer', col: '#1E1E24', tie: '#F5EBDD' } };
const G = { her: geom(HER), grant: geom(GRANT), whit: geom(WHIT) };
const FY = 60, HERX = -20, GX = 830, DESK = { x0: 120, x1: 560, top: -500 }, UF = -1850, RISE_H = FY - UF, WX = 760, PLAT = { x0: -420, x1: 640 };
const C2E = () => ({ rise: EV('rise'), ceil: EV('ceil') });
function riseY(t) { const { rise, ceil } = C2E(); if (t < rise) return 0; const a = 330 * eIO(P(t, rise, ceil)); const b = (RISE_H - 330) * eBack(P(t, ceil, ceil + 0.7), 1.3); return -(a + b); }

// ---------------- props
function txt(c, s, x, y, size, col, font = 'Unb9', align = 'center') { c.font = `${size}px ${font}`; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function nameplate(c, x, y, s = 1, dust = 0) { c.save(); c.translate(x, y); c.scale(s, s); paint(c, q => { q.m(-150, -40); q.l(150, -40); q.l(170, 30); q.l(-170, 30); q.z(); }, '#F2C14E', { sd: 6, hd: 3, lw: 3 }); txt(c, 'SENIOR CHIEF', 0, -14, 24, '#2B2F3A'); txt(c, 'GALAXY MANAGER', 0, 14, 24, '#2B2F3A'); if (dust > 0) { c.globalAlpha = dust; c.strokeStyle = '#EDEDED'; c.lineWidth = 2; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(-170, -40); c.lineTo(-170 + i * 30, 30 - i * 10); c.stroke(); } for (let r = 20; r < 90; r += 22) { c.beginPath(); c.arc(-170, -40, r, 0, Math.PI / 2); c.stroke(); } c.globalAlpha = 1; } c.restore(); }
function jar(c, x, y, coins) { c.save(); c.translate(x, y); c.globalAlpha = 0.85; paint(c, q => { q.m(-55, -150); q.l(55, -150); q.q(65, -140, 62, -20); q.q(60, 0, 0, 0); q.q(-60, 0, -62, -20); q.q(-65, -140, -55, -150); q.z(); }, '#DDEFF6', { sd: 0, hd: 0, lw: 3, line: '#7A8A9A' }); c.globalAlpha = 1; c.fillStyle = '#FFFDF8'; c.fillRect(-48, -110, 96, 44); txt(c, 'RAISE', 0, -98, 20, '#2B2F3A'); txt(c, 'FUND', 0, -78, 20, '#2B2F3A'); if (coins) { c.fillStyle = '#F2C14E'; c.beginPath(); c.ellipse(4, -10, 18, 7, 0, 0, TAU); c.fill(); c.strokeStyle = '#B07A20'; c.lineWidth = 2; c.stroke(); } c.restore(); }
function mug(c, x, y, mould = 0) { c.save(); c.translate(x, y); paint(c, q => { q.m(-40, -100); q.l(40, -100); q.l(36, 0); q.l(-36, 0); q.z(); }, '#FFFDF8', { sd: 4, hd: 2, lw: 3 }); c.strokeStyle = '#2B2F3A'; c.lineWidth = 6; c.beginPath(); c.arc(46, -55, 18, -1.3, 1.3); c.stroke(); txt(c, "WORLD'S", 0, -70, 13, '#C2507A'); txt(c, 'OKAYEST', 0, -52, 13, '#C2507A'); txt(c, 'EMPLOYEE', 0, -34, 13, '#C2507A'); if (mould > 0) { c.globalAlpha = mould; c.fillStyle = '#7FB04A'; for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(-34 + i * 8.5, -100 - Math.abs(Math.sin(i * 1.7)) * 26 * mould, 12, 0, TAU); c.fill(); } c.globalAlpha = 1; } c.restore(); }
function folders(c, x, y, n) { for (let i = 0; i < n; i++) { c.save(); c.translate(x + Math.sin(i * 2.1) * 14, y - i * 34); c.rotate(Math.sin(i * 1.3) * 0.05); paint(c, q => { q.m(-120, -30); q.l(120, -30); q.l(120, 0); q.l(-120, 0); q.z(); }, ['#F2C14E', '#8FB4D9', '#E0474C', '#4CAF6A', '#C9A06A'][i % 5], { sd: 3, hd: 2, lw: 3 }); c.restore(); } }
function golfBag(c, x, y) { c.save(); c.translate(x, y); c.rotate(0.18); paint(c, q => { q.m(-50, -420); q.l(50, -420); q.l(56, 0); q.l(-56, 0); q.z(); }, '#2F5A48', { sd: 8, hd: 4, lw: 3 }); c.strokeStyle = '#C9CED6'; c.lineWidth = 8; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-20 + i * 20, -420); c.lineTo(-30 + i * 26, -560); c.stroke(); paint(c, q => q.e(-34 + i * 26, -570, 22, 12), '#C9CED6', { sd: 2, hd: 1, lw: 2 }); } c.restore(); }
function cactus(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); paint(c, q => { q.m(-40, -60); q.l(40, -60); q.l(32, 0); q.l(-32, 0); q.z(); }, '#C96A3A', { sd: 4, hd: 2, lw: 3 }); paint(c, q => { q.m(-18, -60); q.q(-22, -160, 0, -170); q.q(22, -160, 18, -60); q.z(); }, '#4CAF6A', { sd: 4, hd: 2, lw: 3 }); paint(c, q => { q.m(14, -110); q.q(50, -112, 46, -140); q.l(36, -140); q.q(36, -122, 14, -122); q.z(); }, '#4CAF6A', { sd: 2, hd: 1, lw: 2 }); c.restore(); }
function payslip(c, x, y, s, crumple = 0) { c.save(); c.translate(x, y); c.scale(s * (1 - crumple * 0.7), s * (1 - crumple * 0.7)); c.rotate(-0.06 + crumple * 2); c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(-170 + 8, -230 + 10, 340, 460); c.fillStyle = '#FFFDF8'; c.fillRect(-170, -230, 340, 460); txt(c, 'PAYSLIP', 0, -180, 40, '#2B2F3A'); c.fillStyle = '#C9CED6'; for (let i = 0; i < 4; i++) c.fillRect(-130, -120 + i * 34, 260, 12); txt(c, 'NET PAY', -60, 40, 26, '#2B2F3A', 'Nun9'); txt(c, '£1,900', 0, 110, 76, '#E0474C'); c.save(); c.translate(90, 170); c.rotate(0.12); c.fillStyle = '#F7E36A'; c.fillRect(-90, -60, 180, 120); txt(c, '3 YEARS.', 0, -20, 26, '#2B2F3A'); txt(c, 'NO RAISE.', 0, 16, 26, '#E0474C'); c.restore(); c.restore(); }
function shredder(c, x, y, k) { c.save(); c.translate(x, y); if (k > 0 && k < 1) { c.save(); c.translate(0, -150 + 120 * k); c.fillStyle = '#FFFDF8'; c.fillRect(-70, -100, 140, 110); txt(c, 'PAY RISE', 0, -50, 26, '#2F8A4A'); c.restore(); c.fillStyle = '#FFFDF8'; for (let i = 0; i < 8; i++) c.fillRect(-60 + i * 16, 20, 8, 40 + 60 * k); } paint(c, q => { q.m(-90, -40); q.l(90, -40); q.l(80, 20); q.l(-80, 20); q.z(); }, '#3A3F4B', { sd: 4, hd: 2, lw: 3 }); paint(c, q => { q.m(-80, 20); q.l(80, 20); q.l(80, 180); q.l(-80, 180); q.z(); }, '#9AA3B2', { sd: 4, hd: 2, lw: 3 }); c.restore(); }
function heelsWalk(c, t, t0) { const k = P(t, t0, t0 + 1.8); if (k <= 0 || k >= 1) return; const sx = lerp(-700, 300, k), sy = lerp(FY, -1750, k); for (const s of [0, 1]) { const ph = Math.sin((t - t0) * 12 + s * Math.PI); c.save(); c.translate(sx + s * 60, sy - 10 + ph * 14); c.scale(1.7, 1.7); c.fillStyle = '#1E1E24'; c.fillRect(-26, -250, 52, 80); c.fillStyle = '#F2CDB8'; c.fillRect(-12, -180, 24, 170); c.fillStyle = '#8A1C2E'; c.beginPath(); c.moveTo(-14, -12); c.lineTo(46, -6); c.lineTo(46, 4); c.lineTo(-14, 4); c.fill(); c.fillRect(-14, -4, 8, 26); c.restore(); } }
function calendar(c, x, y, t, L) { const M = ['OCT', 'JAN', 'APR', 'JUL']; const i = L === 'B1' && inB1Dream(t) ? Math.floor((t - EV('feel')) / 0.45) % 4 : 0; c.save(); c.translate(x, y); c.fillStyle = '#FFFDF8'; c.fillRect(-70, -90, 140, 170); c.fillStyle = '#E0474C'; c.fillRect(-70, -90, 140, 46); txt(c, M[i], 0, -66, 28, '#FFFDF8'); txt(c, String(17 + i * 3), 0, 20, 60, '#2B2F3A'); c.restore(); }
function clockFace(c, x, y, mins) { c.save(); c.translate(x, y); paint(c, q => q.e(0, 0, 80, 80), '#FFFDF8', { sd: 4, hd: 2, lw: 4 }); c.strokeStyle = '#2B2F3A'; c.lineCap = 'round'; c.lineWidth = 8; const h = (15 + mins / 60) / 12 * TAU, m = mins / 60 * TAU; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.sin(h) * 40, -Math.cos(h) * 40); c.stroke(); c.lineWidth = 5; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.sin(m) * 62, -Math.cos(m) * 62); c.stroke(); c.restore(); }

// ---------------- building: ground floor office + owner's floor upstairs (prerendered, softly blurred)
const BX0 = -1600, BY0 = -3700, BW = 3900, BH = 4500, BS = 0.5;
function drawBuilding(c) {
  // upstairs: owner's office
  c.fillStyle = '#5A3A2A'; c.fillRect(BX0, BY0, BW, UF - BY0); c.fillStyle = 'rgba(255,255,255,.06)'; for (let x = BX0; x < BX0 + BW; x += 160) c.fillRect(x, BY0, 6, UF - BY0);
  c.fillStyle = '#C9E6F7'; c.fillRect(-500, -3350, 900, 900); const sg = c.createLinearGradient(0, -3350, 0, -2450); sg.addColorStop(0, '#6FA8DC'); sg.addColorStop(1, '#F7C9A0'); c.fillStyle = sg; c.fillRect(-490, -3340, 880, 880);
  c.fillStyle = '#3A4A6A'; for (let i = 0; i < 9; i++) { const h = 200 + hash(i * 3) * 420; c.fillRect(-480 + i * 98, -2460 - h, 80, h); } c.fillStyle = '#5A3A2A'; c.fillRect(-60, -3350, 20, 900); c.fillRect(-500, -2920, 900, 20);
  c.fillStyle = '#C9A06A'; c.fillRect(900, -3300, 300, 360); c.fillStyle = '#F2EBDD'; c.fillRect(920, -3280, 260, 320); txt(c, 'FOUNDER', 1050, -3000, 30, '#5A3A2A'); paint(c, q => q.e(1050, -3150, 70, 90), '#E8C9B0', { sd: 0, hd: 0, lw: 2 });
  c.fillStyle = '#7A1C2E'; c.fillRect(BX0, UF - 30, BW, 30); // skirting
  // floor slab between floors
  c.fillStyle = '#E9E4DA'; c.fillRect(BX0, UF, BW, 100); c.fillStyle = '#C9C2B4'; c.fillRect(BX0, UF + 100, BW, 20);
  // ground floor wall
  c.fillStyle = '#DCE6EE'; c.fillRect(BX0, UF + 120, BW, FY - UF - 120); c.fillStyle = 'rgba(255,255,255,.4)'; for (let x = BX0; x < BX0 + BW; x += 240) c.fillRect(x, UF + 120, 120, FY - UF - 120);
  // staircase rising to the owner's floor (stringer + steps)
  c.save(); c.fillStyle = '#9A9488'; c.beginPath(); c.moveTo(-700, FY); c.lineTo(300, -1750); c.lineTo(300, -1650); c.lineTo(-640, FY); c.fill();
  c.fillStyle = '#C9C2B4'; for (let i = 0; i < 18; i++) { const u = i / 18, x = lerp(-700, 300, u), y = lerp(FY, -1750, u); c.fillRect(x, y - 30, 56, 30); } c.strokeStyle = '#6A6A6A'; c.lineWidth = 8; c.beginPath(); c.moveTo(-700, FY - 400); c.lineTo(300, -2150); c.stroke(); c.restore();
  // sign to the owner
  c.fillStyle = '#2B2F3A'; rr(c, 60, -1640, 400, 110, 14); c.fill(); txt(c, '↑ MS WHITMORE', 260, -1605, 34, '#F2C14E'); txt(c, 'OWNER', 260, -1563, 28, '#FFFDF8');
  // Grant's glass office (luxury)
  c.fillStyle = '#F7EAD8'; c.fillRect(700, -1700, 1500, 1760);
  c.fillStyle = '#2B6A8A'; c.fillRect(1250, -1350, 450, 330); c.fillStyle = '#5FB0D8'; c.fillRect(1262, -1338, 426, 306); paint(c, q => { q.m(1340, -1200); q.q(1420, -1260, 1500, -1200); q.q(1420, -1150, 1340, -1200); q.z(); q.m(1500, -1200); q.l(1540, -1235); q.l(1540, -1165); q.z(); }, '#8A9AA8', { sd: 3, hd: 2, lw: 3 }); paint(c, q => { q.m(1410, -1240); q.l(1430, -1275); q.l(1445, -1238); q.z(); }, '#8A9AA8', { sd: 2, hd: 1, lw: 2 });
  c.fillStyle = '#E0B040'; c.fillRect(1150, -560, 520, 40); c.fillRect(1180, -520, 30, 580); c.fillRect(1610, -520, 30, 580); // gold desk
  paint(c, q => { q.m(1500, -740); q.l(1560, -740); q.l(1550, -560); q.l(1510, -560); q.z(); }, '#3A6A3A', { sd: 3, hd: 2, lw: 3 }); paint(c, q => { q.m(1440, -620); q.l(1620, -620); q.l(1600, -560); q.l(1460, -560); q.z(); }, '#C9CED6', { sd: 3, hd: 2, lw: 3 });
  paint(c, q => { q.m(1800, -900); q.l(2050, -900); q.l(2060, -300); q.l(1790, -300); q.z(); }, '#1E1E24', { sd: 8, hd: 4, lw: 3 }); txt(c, 'MASSAGE', 1925, -600, 30, '#F2C14E');
  c.fillStyle = '#FFFDF8'; rr(c, 1250, -1640, 420, 180, 12); c.fill(); txt(c, 'OUR PEOPLE ARE', 1460, -1585, 34, '#2B3A67'); txt(c, 'OUR GREATEST ASSET', 1460, -1530, 34, '#E0474C');
  c.fillStyle = '#E0B040'; rr(c, 1250, -680, 300, 70, 10); c.fill(); txt(c, 'MR GRANT', 1400, -660, 24, '#2B2F3A'); txt(c, 'CEO OF VIBES', 1400, -632, 18, '#2B2F3A');
  c.strokeStyle = '#C9A040'; c.lineWidth = 6; c.beginPath(); c.moveTo(1450, -1700); c.lineTo(1450, -1560); c.stroke(); for (let i = 0; i < 7; i++) { const x = 1330 + i * 40; paint(c, q => q.e(x, -1500 + Math.abs(i - 3) * 14, 16, 26), '#FFF4C0', { sd: 2, hd: 1, lw: 2 }); } paint(c, q => q.e(1450, -1540, 140, 30), '#E0B040', { sd: 3, hd: 2, lw: 3 });
  paint(c, q => { q.m(1300, -650); q.l(1400, -650); q.l(1390, -560); q.l(1310, -560); q.z(); }, '#C9CED6', { sd: 3, hd: 2, lw: 3 }); paint(c, q => { q.m(1335, -760); q.l(1365, -760); q.l(1372, -640); q.l(1328, -640); q.z(); }, '#2F5A3A', { sd: 3, hd: 2, lw: 2 }); c.fillStyle = '#F2C14E'; c.fillRect(1338, -780, 24, 22);
  c.fillStyle = '#E0B040'; c.fillRect(1760, -1660, 300, 360); c.fillStyle = '#2B3A67'; c.fillRect(1780, -1640, 260, 320); paint(c, q => q.e(1910, -1520, 70, 86), '#EBB896', { sd: 0, hd: 0, lw: 2 }); c.fillStyle = '#5A4030'; c.fillRect(1870, -1470, 80, 14); txt(c, 'GRANT', 1910, -1360, 30, '#F2C14E');
  // glass wall + door frame
  c.fillStyle = 'rgba(180,220,240,.28)'; c.fillRect(700, -1700, 1500, 1760); c.strokeStyle = '#9AA3B2'; c.lineWidth = 10; c.strokeRect(700, -1700, 1500, 1760); c.beginPath(); c.moveTo(1050, -1700); c.lineTo(1050, FY); c.stroke();
  // floor
  const fg = c.createLinearGradient(0, FY, 0, 800); fg.addColorStop(0, '#9AA3B2'); fg.addColorStop(1, '#7A8290'); c.fillStyle = fg; c.fillRect(BX0, FY, BW, BY0 + BH - FY);
}
const BGB = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); { const c = BGB.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); c.filter = 'blur(1.5px)'; drawBuilding(c); }
function seasonsWindow(c, t) { // B1 exaggeration: the window in Grant's office cycles seasons
  const x = 140, y = -1260, w = 360, h = 260, f = EV('feel'), sn = EV('snap'), on = t > f && t < sn; c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  const ph = on ? ((t - f) / 0.7) % 4 : 2; const cols = ['#BFE3F7', '#F7C27A', '#E9EEF2', '#8FD08A']; c.fillStyle = cols[Math.floor(ph)]; c.fillRect(x, y, w, h);
  const s = Math.floor(ph); if (s === 1) { c.fillStyle = '#E0743B'; for (let i = 0; i < 14; i++) { const yy = y + ((t * 240 + i * 50) % h); c.beginPath(); c.ellipse(x + hash(i) * w, yy, 12, 7, i, 0, TAU); c.fill(); } } if (s === 2 && on) { c.fillStyle = '#FFFFFF'; for (let i = 0; i < 30; i++) { c.beginPath(); c.arc(x + hash(i * 3) * w, y + ((t * 160 + i * 37) % h), 6, 0, TAU); c.fill(); } } if (s === 0 || s === 3) { c.fillStyle = '#F7D84A'; c.beginPath(); c.arc(x + w - 70, y + 70, 40, 0, TAU); c.fill(); }
  c.restore(); c.strokeStyle = '#FFFDF8'; c.lineWidth = 12; c.strokeRect(x, y, w, h); c.beginPath(); c.moveTo(x + w / 2, y); c.lineTo(x + w / 2, y + h); c.stroke(); }

// ---------------- state
function inB1Dream(t) { return t > EV('feel') && t < EV('snap'); }
function deskThings(c, t, L) { // everything on her desk, in platform coordinates
  const ev = k => EV(k), mould = inB1Dream(t) ? P(t, ev('feel'), ev('feel') + 1.6) : 0;
  paint(c, q => { q.m(DESK.x0, DESK.top); q.l(DESK.x1, DESK.top); q.l(DESK.x1, DESK.top + 34); q.l(DESK.x0, DESK.top + 34); q.z(); }, '#B98A62', { sd: 4, hd: 2, lw: 3 }); c.fillStyle = '#8A6A4A'; c.fillRect(DESK.x0 + 20, DESK.top + 34, 26, FY - DESK.top - 34); c.fillRect(DESK.x1 - 46, DESK.top + 34, 26, FY - DESK.top - 34);
  if (t > ev('dump')) golfBag(c, DESK.x1 + 40, FY);
  if (t > ev('dump')) folders(c, 470, DESK.top, Math.min(9, 2 + Math.floor(P(t, ev('dump'), ev('dump') + 0.6) * 7)));
  mug(c, 350, DESK.top, mould);
  if (t > ev('cactus')) cactus(c, 262, DESK.top, eBack(P(t, ev('cactus'), ev('cactus') + 0.3), 2));
  const jarFall = L === 'C2' && t > ev('rise') + 0.6; if (!jarFall) jar(c, 175, DESK.top, t > ev('jar'));
  if (t > ev('plate')) nameplate(c, 340, DESK.top + 80, 1.25 * eBack(P(t, ev('plate'), ev('plate') + 0.3), 2), mould);
}
function herState(t, L) {
  const g = G.her, st = { t, talk: talk('her', t), mood: 'neutral', turn: 0.4, look: 0.8, armL: reach(g, -1, -g.sw * 0.6, g.ySh + 300), armR: reach(g, 1, g.sw * 0.6, g.ySh + 300) };
  const mine = TL.speech.find(s => s.who === 'her' && t >= s.t - 0.05 && t < s.t + s.d); if (mine) { const u = (t - mine.t) * 4.5; st.armR = reach(g, 1, g.sw * 1.6 + Math.sin(u) * 30, g.ySh + 220 + Math.cos(u) * 30); }
  const coinT = EV('coin'), jarT = EV('jar');
  if (L === 'A1') { st.mood = speaking('a1_her', t) ? 'worried' : 'neutral'; if (t > coinT - 0.1 && t < jarT + 0.3) { st.mood = 'skeptical'; st.armR = reach(g, 1, g.sw * 1.4, g.ySh + 180); st.items = { R: ctx => { ctx.fillStyle = '#F2C14E'; ctx.beginPath(); ctx.arc(0, -10, 16, 0, TAU); ctx.fill(); } }; } if (t > jarT - 0.3 && t < jarT + 0.3) st.armR = reach(g, 1, 200, DESK.top - 200); }
  if (L === 'A2') { st.mood = t > EV('plate') ? 'skeptical' : (speaking('a2_her', t) ? 'angry' : 'neutral'); if (t > EV('shred') && t < EV('plate')) { st.mood = 'shock'; st.lookY = 0.3; } }
  if (L === 'B1') { st.mood = speaking('b1_her', t) ? 'happy' : 'neutral'; if (inB1Dream(t)) { st.mood = 'tired'; } if (t > EV('snap')) { st.mood = 'annoyed'; } }
  if (L === 'B2') { st.mood = speaking('b2_her', t) ? 'neutral' : 'shock'; if (t > EV('dog') + 0.3) { st.mood = 'happy'; st.look = -0.6; st.lookY = 0.7; st.turn = 0.1; } if (t > EV('heels')) { st.look = 0; st.lookY = -1; st.mood = 'surprised'; } }
  if (L === 'C1') { st.mood = 'smug'; if (t > EV('chart') - 0.1 && t < EV('cactus')) { st.armR = reach(g, 1, g.sw * 1.8, g.ySh + 120); st.items = { R: ctx => { ctx.fillStyle = '#FFFDF8'; ctx.fillRect(-90, -200, 180, 140); ctx.strokeStyle = '#4CAF6A'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-70, -80); ctx.lineTo(-20, -110); ctx.lineTo(20, -100); ctx.lineTo(70, -180); ctx.stroke(); } }; } if (t > EV('cactus')) st.mood = 'annoyed'; }
  if (L === 'C2') { st.mood = speaking('c2_her', t, 0.1) ? 'smug' : 'neutral'; if (t > EV('rise')) { st.mood = 'shock'; st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 40); st.armR = reach(g, 1, g.sw * 1.6, g.ySh - 40); } if (t > EV('ceil') + 0.8) { st.mood = 'surprised'; st.turn = 0.5; st.look = 0.9; st.armL = reach(g, -1, -g.sw * 0.6, g.ySh + 300); st.armR = reach(g, 1, g.sw * 0.6, g.ySh + 300); } if (t > SP.c2_ceo2.t + 0.6) { st.mood = 'happy'; st.laugh = true; } }
  if (L === 'hook') { st.mood = 'annoyed'; st.armR = reach(g, 1, g.sw * 1.3, g.ySh + 200); st.items = { R: ctx => { ctx.fillStyle = '#FFFDF8'; ctx.beginPath(); ctx.arc(0, -10, 34, 0, TAU); ctx.fill(); ctx.strokeStyle = '#C9CED6'; ctx.lineWidth = 3; ctx.stroke(); } }; }
  return st;
}
function grantState(t, L) {
  const g = G.grant, st = { t, talk: talk('grant', t), mood: 'happy', turn: -0.4, look: -0.8, armL: reach(g, -1, -g.sw * 0.6, g.ySh + 300), armR: reach(g, 1, g.sw * 0.6, g.ySh + 300) };
  const mine = TL.speech.find(s => s.who === 'grant' && t >= s.t - 0.05 && t < s.t + s.d); if (mine) { const u = (t - mine.t) * 4; st.armL = reach(g, -1, -g.sw * 1.7 + Math.sin(u) * 30, g.ySh + 200 + Math.cos(u) * 30); }
  if (L === 'A1' && t > EV('coin') - 0.6 && t < EV('coin') + 0.1) { st.armL = reach(g, -1, -g.sw * 2.4, g.ySh + 180); st.items = { L: ctx => { ctx.fillStyle = '#F2C14E'; ctx.beginPath(); ctx.arc(0, -10, 16, 0, TAU); ctx.fill(); } }; }
  if (L === 'A2') { if (t > EV('shred') - 0.2 && t < EV('shred') + 0.9) { st.armL = reach(g, -1, -g.sw * 1.9, g.ySh + 360); st.mood = 'smug'; } if (t > EV('plate') - 0.4 && t < EV('plate') + 0.2) st.armL = reach(g, -1, -g.sw * 2.6, g.ySh + 330); if (t > EV('confetti') - 0.1 && t < EV('confetti') + 0.6) { st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 160); st.laugh = true; } }
  if (L === 'B1') { if (t > EV('feel') - 0.3 && t < EV('feel') + 0.2) { st.armL = reach(g, -1, -g.sw * 1.8, g.ySh + 60); st.items = { L: ctx => { ctx.fillStyle = '#2B2F3A'; rr(ctx, -22, -90, 44, 110, 10); ctx.fill(); ctx.fillStyle = '#E0474C'; ctx.beginPath(); ctx.arc(0, -66, 9, 0, TAU); ctx.fill(); } }; } if (inB1Dream(t)) { st.mood = 'happy'; st.talk = 0; } }
  if (L === 'B2' && t > EV('dump') - 0.8 && t < EV('dump') + 0.2) { st.armL = reach(g, -1, -g.sw * 2.5, g.ySh + 140); st.mood = 'happy'; st.laugh = true; }
  if (L === 'C1') { if (speaking('c1_her', t)) st.mood = 'neutral'; if (t > SP.c1_x.t - 0.9 && t < SP.c1_x.t) st.mood = 'surprised'; if (t > EV('cactus') - 0.2 && t < EV('cactus') + 0.4) st.armL = reach(g, -1, -g.sw * 2.5, g.ySh + 240); if (t > EV('growl')) { st.mood = 'shock'; st.lookY = 0.7; } }
  if (L === 'C2') { st.mood = speaking('c2_her', t) ? 'skeptical' : 'smug'; if (t > SP.c2_x.t + SP.c2_x.d - 0.2 && t < EV('rise') + 0.4) { st.armL = reach(g, -1, -g.sw * 1.7, g.ySh + 80); st.items = { L: ctx => { ctx.fillStyle = '#2B2F3A'; rr(ctx, -22, -90, 44, 110, 10); ctx.fill(); ctx.fillStyle = '#E0474C'; ctx.beginPath(); ctx.arc(0, -66, 9, 0, TAU); ctx.fill(); } }; } if (t > EV('rise') + 0.4) { st.mood = 'smug'; st.lookY = -1; st.look = -0.3; } if (t > EV('down') - 0.1) { st.mood = 'shock'; st.lookY = -1; st.look = -0.3; st.armL = reach(g, -1, -g.sw * 0.5, g.ySh + 200); st.armR = reach(g, 1, g.sw * 0.5, g.ySh + 200); st.items = { R: ctx => jar(ctx, 0, 60, true) }; } }
  return st;
}
function whitState(t) { const g = G.whit, st = { t, talk: talk('whitmore', t), mood: 'skeptical', turn: -0.4, look: -0.8, armL: reach(g, -1, -g.sw * 0.5, g.ySh + 300), armR: reach(g, 1, g.sw * 0.5, g.ySh + 300) }; if (speaking('c2_ceo2', t, 0.05, 0.5)) { st.mood = 'smug'; st.armL = reach(g, -1, -g.sw * 2.2, g.ySh + 260); } return st; }

function world(c, t, L) {
  c.drawImage(BGB, BX0, BY0, BW, BH);
  const heads = {};
  if (L !== 'C2' || t < EV('ceil')) { c.fillStyle = '#EDEAE4'; c.fillRect(BX0, BY0, BW, UF + 120 - BY0); c.fillStyle = '#D6D0C6'; for (let x = BX0; x < BX0 + BW; x += 300) c.fillRect(x, BY0, 6, UF + 120 - BY0); c.fillStyle = '#FFFFFF'; for (let x = BX0 + 100; x < BX0 + BW; x += 600) c.fillRect(x, UF + 60, 200, 30); }
  if (L === 'B1') seasonsWindow(c, t);
  // clock above her desk: 15:05 -> 15:07 after the B1 snap (the dream doesn't move real time)
  calendar(c, 610, -900, t, L);
  clockFace(c, 610, -1180, (L === 'B1' && t > EV('snap')) || ['B2', 'C1', 'C2'].includes(L) ? 7 : 5);
  if (L === 'B2') heelsWalk(c, t, EV('heels'));
  if (L === 'A2') shredder(c, 640, -120, P(t, EV('shred'), EV('shred') + 0.9));
  // Whitmore upstairs (the owner's floor is only revealed in C2)
  if (L === 'C2' && t >= EV('ceil')) { heads.whitmore = put(c, WHIT, whitState(t), WX, UF);
  paint(c, q => { q.m(WX - 260, UF - 520); q.l(WX + 300, UF - 520); q.l(WX + 300, UF - 480); q.l(WX - 260, UF - 480); q.z(); }, '#7A4A2A', { sd: 4, hd: 2, lw: 3 }); c.fillStyle = '#5A3A2A'; c.fillRect(WX - 240, UF - 480, 40, 480); c.fillRect(WX + 240, UF - 480, 40, 480); c.fillStyle = '#F2C14E'; rr(c, WX - 120, UF - 590, 240, 70, 10); c.fill(); txt(c, 'OWNER', WX, UF - 555, 30, '#2B2F3A'); }
  // Grant
  const gx = L === 'C2' && t > EV('down') - 0.1 ? 230 : L === 'hook' ? 1500 : GX;
  if (L !== 'hook') heads.grant = put(c, GRANT, grantState(t, L), gx, FY);
  // her platform (rises in C2)
  const ry = L === 'C2' ? riseY(t) : 0;
  if (ry < 0) { c.fillStyle = '#B9BFC8'; c.fillRect(70, FY + ry + 40, 120, -ry); c.fillStyle = '#6A707A'; c.fillRect(90, FY + ry + 40, 80, -ry); }
  c.save(); c.translate(0, ry);
  if (ry < 0) { c.fillStyle = '#7A8290'; c.fillRect(PLAT.x0, FY, PLAT.x1 - PLAT.x0, 60); }
  if (t > EV('dog') - 0.2 && ['B2', 'C1', 'C2'].includes(L)) { const k = L === 'B2' ? eOut(P(t, EV('dog') - 0.2, EV('dog') + 0.5)) : 1; c.save(); c.translate(lerp(GX, -270, k), FY + 10); c.scale(-0.8, 0.8); pug(c, { t, tilt: Math.sin(t * 2) * 0.08, tongue: !(L === 'C1' && t > EV('growl')) }); c.restore(); if (L === 'C1' && t > EV('growl') && t < SP.c1_nar.t + 0.5) K.pop(c, t, 'Р-Р-Р!', EV('growl'), SP.c1_nar.t, -270, -330, '#E0474C', -0.1, 60); }
  heads.her = put(c, HER, herState(t, L), HERX, FY);
  deskThings(c, t, L);
  c.restore();
  if (L === 'C2' && t > EV('rise') + 0.6 && t < EV('down') + 3) { const k = P(t, EV('rise') + 0.6, EV('rise') + 1.6); const jy = lerp(DESK.top + ry, -460, eIn(k)); jar(c, lerp(180, gx + 40, k), jy, true); }
  // slab in front when the platform is below it; hole + debris after CEIL
  if (L === 'C2' && t > EV('ceil')) { const k = P(t, EV('ceil'), EV('ceil') + 1.2); c.fillStyle = '#E9E4DA'; for (let i = 0; i < 14; i++) { const a = hash(i) * TAU, r = 200 + 500 * k; c.globalAlpha = 1 - k; c.fillRect(110 + Math.cos(a) * r, UF + 50 + Math.sin(a) * r * 0.5 + 900 * k * k, 34, 22); } c.globalAlpha = 1; }
  else { c.fillStyle = '#E9E4DA'; c.fillRect(PLAT.x0 - 20, UF, PLAT.x1 - PLAT.x0 + 40, 100); c.fillStyle = '#C9C2B4'; c.fillRect(PLAT.x0 - 20, UF + 100, PLAT.x1 - PLAT.x0 + 40, 20); }
  if (L === 'C2' && t > EV('ceil')) { c.fillStyle = '#3A3A3A'; c.fillRect(PLAT.x0 - 20, UF, 20, 120); c.fillRect(PLAT.x1, UF, 20, 120); }
  if (ry < 0) { heads.her = { ...heads.her, y: heads.her.y + ry }; }
  return heads;
}

function shotFor(t) {
  const sc = sceneAt(t), L = sc.id;
  const herHY = FY + G.her.headY, gHY = FY + G.grant.headY;
  const two = { x: 490, y: herHY + 140, z: 0.74, r: 0 };
  if (L === 'hook' || L === 'outro') return two;
  const u = t - sc.s; if (u < 1.15) return { ...two, z: 0.76, cut: u < 0.85 };
  const l = L.toLowerCase(), herC = { x: HERX + 260, y: herHY + 260, z: 1.05, r: 0.4 }, grC = { x: GX - 230, y: gHY + 240, z: 1.05, r: -0.4 };
  const nar = SP[l + '_nar'];
  if (L === 'A1' && t > EV('coin') - 0.3 && t < nar.t - 0.1) return { x: 330, y: herHY + 130, z: 0.82, r: 0 };
  if (L === 'A2' && t > EV('shred') - 0.2 && t < nar.t - 0.1) return { x: 560, y: herHY + 130, z: 0.76, r: 0 };
  if (L === 'B1' && inB1Dream(t)) return { x: 420, y: herHY + 380, z: 0.72, r: 0 };
  if (L === 'B1' && t >= EV('snap') && t < nar.t - 0.1) return { x: 430, y: herHY + 130, z: 0.82, r: 0, cut: t < EV('snap') + 0.05 };
  if (L === 'B2' && t > EV('dump') - 0.3 && t < EV('heels') - 0.1) return { x: 380, y: herHY + 130, z: 0.8, r: 0 };
  if (L === 'B2' && t > EV('heels') - 0.4 && t < nar.t + 0.2) return { x: -280, y: -900, z: 0.66, r: 0 };
  if (L === 'C1' && t > EV('cactus') - 0.2 && t < nar.t - 0.1) return { x: 330, y: herHY + 130, z: 0.8, r: 0 };
  if (L === 'C2') { const ry = riseY(t); if (t < EV('rise') - 0.05) { if (speaking('c2_her', t, 0.2, 0.4)) return { ...herC, y: herHY - 40, z: lerp(0.9, 0.98, P(t, SP.c2_her.t, endOf('c2_her'))) }; return grC; }
    if (t < EV('ceil')) return { x: 300, y: -1150, z: 0.62, r: 0 };
    if (t < EV('down') - 0.1) return { x: 300, y: herHY + 300 + ry * 0.98, z: t < EV('ceil') + 0.8 ? 0.7 : 0.78, r: 0 };
    if (t < nar.t - 0.1) return { x: 300, y: gHY + 250, z: 0.82, r: 0, cut: t < EV('down') + 0.05 }; return { x: 300, y: gHY + 250, z: 0.78, r: 0 }; }
  if (nar && t >= nar.t - 0.15) return two;
  const cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.3 && t < s.t + s.d + 0.2);
  if (cur) return cur.who === 'her' ? herC : grC;
  return two;
}
const CAM = E.simulateCamera(TL, shotFor, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);

function drawWorld(c, t, L, cam, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L); const M = c.getTransform(); c.restore(); return { heads, M }; }
function drawHook(c, t) {
  const herHY = FY + G.her.headY, wipe = eIO(P(t, 1.9, 2.6));
  if (wipe < 1) { // split screen: £1,900 vs the boss's aquarium
    const split = lerp(540, 1080, wipe);
    c.save(); c.beginPath(); c.rect(0, 0, split, HH); c.clip(); drawWorld(c, t, 'hook', { x: 520, y: -900, z: 0.6, r: 0 }); payslip(c, split / 2 - 10, 1300, 0.8, P(t, 1.6, 2.4)); c.restore();
    c.save(); c.beginPath(); c.rect(split, 0, HH, HH); c.clip(); drawWorld(c, t, 'hook', { x: 1140, y: -820, z: 0.82, r: 0 }); c.fillStyle = 'rgba(255,215,120,.12)'; c.fillRect(split, 0, 1080, HH); c.restore();
    c.fillStyle = C.white; c.fillRect(split - 6, 0, 12, HH);
    if (t > 0.25) { const k = eBack(P(t, 0.25, 0.5), 2.2) * (1 - wipe); c.save(); c.translate(810 + 540 * wipe, 1500); c.rotate(0.06); c.scale(k, k); UI.font(c, 'Unb9', 56); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, 'ЕГО КАБИНЕТ', 0, 0, C.gold, C.oliveD, 12); c.restore(); }
  } else drawWorld(c, t, 'hook', { x: 430, y: herHY + 420, z: 0.8, r: 0 });
  Hq.vignette(c, W, HH, 0.3);
  K.titleRibbon(c, t, 540, 330);
  UI.levelBar(c, t, { id: 'hook' });
  K.stamp(c, t);
}
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1;
  const sc = sceneAt(t);
  if (sc.id === 'hook') { drawHook(c, t); Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  if (sc.id === 'outro') { K.outro(c, t, { q: ['А КАК БЫ ТЫ ПОПРОСИЛ', 'ПРИБАВКУ?'], rows: [['B1', 'Could we talk about my salary?'], ['A2', "I'd like a pay rise."], ['B2', "I've taken on more responsibility."], ['C1', 'Based on my results, a pay rise would be fair.']], cta: ['ОТПРАВЬ ТОМУ, КТО', 'ТРИ ГОДА БЕЗ ПРИБАВКИ'], hero: (cc, tt) => put(cc, HER, { t: tt, mood: 'happy', turn: 0, look: 0, armL: reach(G.her, -1, -G.her.sw * 0.6, G.her.ySh + 300), armR: reach(G.her, 1, G.her.sw * 1.4, G.her.ySh + 100), items: { R: ctx => nameplate(ctx, 0, -40, 0.7) } }, 0, 0) }); Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const f = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[f], sh = shake(t);
  const { heads, M } = drawWorld(c, t, sc.id, cam, sh);
  Hq.vignette(c, W, HH, 0.26);
  const proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f });
  const ev = sc.ev || {};
  if (sc.id === 'B1' && inB1Dream(t)) { const k = eBack(P(t, ev.feel, ev.feel + 0.3), 1.8); c.save(); c.strokeStyle = 'rgba(255,253,248,.95)'; c.lineWidth = 34; c.setLineDash([50, 26]); c.strokeRect(40, 260, 1000, 1400); c.setLineDash([]); c.translate(540, 1560); c.scale(k, k); c.rotate(-0.03); UI.font(c, 'Unb9', 64); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, 'ОЩУЩАЕТСЯ КАК…', 0, 0, C.white, C.oliveD, 14); c.restore(); }
  if (sc.id === 'B2' && ev.heels) K.pop(c, t, 'ЦОК-ЦОК', ev.heels + 0.1, ev.heels + 1.4, 300, 1150, C.white, -0.1, 60);
  if (sc.id === 'B1' && ev.snap) K.pop(c, t, 'ПРОШЛО 2 МИНУТЫ', ev.snap + 0.05, SP.b1_nar.t + 0.3, 540, 1450, C.gold, -0.05, 64);
  K.bubbles(c, t, sc, heads, proj, { names: { grant: ['MR GRANT', '#2B3A67'], whitmore: ['MS WHITMORE', '#8A1C2E'] }, hold: { c2_her: 0.25 } });
  if (sc.id === 'A2' && ev.confetti) { const k = P(t, ev.confetti, ev.confetti + 1.6); if (k > 0 && k < 1) for (let i = 0; i < 40; i++) { c.fillStyle = ['#E0474C', '#F2C14E', '#3C8FE0', '#4CAF6A', '#EE5E9A'][i % 5]; c.save(); c.translate(540 + (hash(i) - 0.5) * 1000 * Math.min(1, k * 3), 500 + hash(i * 3) * 200 + k * 1200); c.rotate(i + k * 8); c.fillRect(-10, -5, 20, 10); c.restore(); } }
  if (sc.id === 'C2') { K.dots(c, t, endOf('c2_her') + 0.3, SP.c2_x.t - 0.1); if (ev.down) K.pop(c, t, 'БА-ДУМ-ТСС!', endOf('c2_x2') + 0.1, SP.c2_nar.t + 0.6, 540, 1350); }
  K.hud(c, t, sc);
}
E.run('raise', NF, renderFrame);
