// "Asking for directions in London" episode renderer: node london.js start end out.mp4 | --png=f1,f2
const fs = require('fs');
const Hq = require('./hq'); const { CAST } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, noise1, mix, shade, rgba, dark, paint, rr, softShadow, human, catChar, pug, items, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/london/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SC, SP, sceneAt, C, LVCOL } = UI;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS);
const talk = (who, t) => { let a = 0; for (const s of TL.speech) if (s.who === who && t >= s.t && t < s.t + s.d) { const i = Math.floor((t - s.t) * FPS); a = Math.max(a, s.env[Math.min(i, s.env.length - 1)] || 0); } return a; };
const speaking = (id, t, pre = 0, post = 0) => SP[id] && t >= SP[id].t - pre && t < SP[id].t + SP[id].d + post;
const endOf = id => SP[id].t + SP[id].d;
const TAU = Math.PI * 2;
const lvEv = L => (SC[L] && SC[L].ev) || {};

// ---------------- layout
const WHO = { A1: 'albert', A2: 'kai', B1: 'agnes', B2: 'oliver', C1: 'reggie', C2: 'leo', hook: 'albert', outro: 'leo' };
const ST = { albert: 0, kai: 2600, agnes: 5200, oliver: 7800, reggie: 10400, leo: 13000 };
const NAMES = { albert: ['ALBERT', '#8A6A4A'], kai: ['KAI', '#2E9E6E'], agnes: ['AGNES', '#8E78C8'], oliver: ['OLIVER', '#2F3E5C'], reggie: ['REGGIE', '#8A1C2E'], leo: ['LEO', '#3C8FE0'] };
const HERX = 540, NBX = -60, FY = 60; // feet line on the near pavement
const G = {}; for (const k of ['her_london', 'albert', 'kai', 'agnes', 'oliver', 'reggie', 'leo']) G[k] = geom(CAST[k]);

// ---------------- background: street across the road (prerendered, blurred)
const BX0 = -1800, BY0 = -4400, BW = 17000, BH = 5200, BS = 0.5;
const ROAD_TOP = -600, KERB = -120;
function house(c, x, w, i) {
  const bricks = ['#A8553E', '#B8664A', '#9C4A3A', '#C27A5A', '#8E5A48'], trims = ['#F3EDDF', '#E8DCC8'];
  const top = -2500 - (i % 3) * 120, base = ROAD_TOP - 60; const col = bricks[i % bricks.length];
  c.fillStyle = col; c.fillRect(x, top, w, base - top);
  c.strokeStyle = rgba(shade(col, 0.7), 0.35); c.lineWidth = 3; for (let y = top + 30; y < base; y += 34) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + w, y); c.stroke(); }
  // roof + chimney
  c.fillStyle = '#4A4F5C'; c.beginPath(); c.moveTo(x - 20, top); c.lineTo(x + w + 20, top); c.lineTo(x + w - 60, top - 140); c.lineTo(x + 60, top - 140); c.closePath(); c.fill();
  c.fillStyle = shade(col, 0.85); c.fillRect(x + w * 0.7, top - 260, 90, 140); c.fillStyle = '#C98B5A'; c.fillRect(x + w * 0.7 + 10, top - 290, 26, 34); c.fillRect(x + w * 0.7 + 52, top - 290, 26, 34);
  // windows
  for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) { const wx = x + 90 + k * (w - 180) / 2.6, wy = top + 120 + r * 420; if (wy > base - 700) continue;
    c.fillStyle = trims[i % 2]; c.fillRect(wx - 14, wy - 14, 168, 268); const g = c.createLinearGradient(wx, wy, wx + 140, wy + 240); g.addColorStop(0, '#9CC8E8'); g.addColorStop(1, '#5E7FA0'); c.fillStyle = g; c.fillRect(wx, wy, 140, 240);
    c.fillStyle = trims[i % 2]; c.fillRect(wx + 64, wy, 12, 240); c.fillRect(wx, wy + 112, 140, 12); c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(wx + 8, wy + 8, 20, 90); }
  // shopfront
  const sy = base - 560, names = ['TEA ROOM', 'BOOKS', 'FISH & CHIPS', 'BAKERY', 'FLOWERS', 'THE RED LION'], sc = ['#2F5A48', '#2F3E5C', '#C23C4A', '#E9A23B', '#8E5BD6', '#5A2A2A'];
  c.fillStyle = sc[i % 6]; c.fillRect(x + 30, sy, w - 60, 560); c.fillStyle = '#F3EDDF'; c.fillRect(x + 50, sy + 20, w - 100, 90);
  c.fillStyle = sc[i % 6]; c.font = '58px Unb9'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(names[i % 6], x + w / 2, sy + 68);
  const gg = c.createLinearGradient(0, sy + 140, 0, base); gg.addColorStop(0, '#CFE3EE'); gg.addColorStop(1, '#8EA8BC'); c.fillStyle = gg; c.fillRect(x + 70, sy + 140, w - 300, 400); c.fillStyle = shade(sc[i % 6], 0.8); c.fillRect(x + w - 210, sy + 140, 140, 420);
  // awning stripes
  for (let k = 0; k < 10; k++) { c.fillStyle = k % 2 ? '#FFFDF8' : sc[(i + 2) % 6]; c.beginPath(); const ax = x + 40 + k * (w - 80) / 10; c.moveTo(ax, sy + 120); c.lineTo(ax + (w - 80) / 10, sy + 120); c.lineTo(ax + (w - 80) / 10 + 10, sy + 200); c.lineTo(ax + 10, sy + 200); c.fill(); }
}
function station(c, x0) {
  // grand station facade with arches, clock and huge sign
  const L = x0 - 1700, R = x0 + 1700, base = ROAD_TOP - 60, top = -2950;
  c.fillStyle = '#C9A27A'; c.fillRect(L, top, R - L, base - top);
  c.strokeStyle = 'rgba(90,60,40,.3)'; c.lineWidth = 3; for (let y = top + 40; y < base; y += 40) { c.beginPath(); c.moveTo(L, y); c.lineTo(R, y); c.stroke(); }
  // two giant arches
  for (const ax of [x0 - 820, x0 + 820]) { c.fillStyle = '#E8DCC8'; c.beginPath(); c.moveTo(ax - 640, base); c.lineTo(ax - 640, -1650); c.arc(ax, -1650, 640, Math.PI, 0); c.lineTo(ax + 640, base); c.fill();
    const g = c.createLinearGradient(0, -2250, 0, base); g.addColorStop(0, '#9CC8E8'); g.addColorStop(1, '#4E6A84'); c.fillStyle = g; c.beginPath(); c.moveTo(ax - 590, base); c.lineTo(ax - 590, -1650); c.arc(ax, -1650, 590, Math.PI, 0); c.lineTo(ax + 590, base); c.fill();
    c.strokeStyle = '#E8DCC8'; c.lineWidth = 16; for (let k = 1; k < 6; k++) { c.beginPath(); c.moveTo(ax - 590 + k * 197, base); c.lineTo(ax - 590 + k * 197, -1650 - Math.sqrt(Math.max(0, 590 * 590 - Math.pow(-590 + k * 197, 2)))); c.stroke(); } for (let y = -1500; y < base; y += 260) { c.beginPath(); c.moveTo(ax - 590, y); c.lineTo(ax + 590, y); c.stroke(); } }
  // clock tower in the middle
  c.fillStyle = '#B8906A'; c.fillRect(x0 - 200, top - 600, 400, base - top + 600); c.fillStyle = '#4A4F5C'; c.beginPath(); c.moveTo(x0 - 230, top - 600); c.lineTo(x0, top - 900); c.lineTo(x0 + 230, top - 600); c.fill();
  c.fillStyle = '#FFFDF8'; c.beginPath(); c.arc(x0, top - 330, 150, 0, TAU); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 14; c.stroke(); c.lineWidth = 10; c.beginPath(); c.moveTo(x0, top - 330); c.lineTo(x0, top - 440); c.moveTo(x0, top - 330); c.lineTo(x0 + 70, top - 300); c.stroke();
  // the sign
  c.fillStyle = '#1E2A4A'; rr(c, x0 - 1300, -2660, 2600, 330, 30); c.fill(); c.strokeStyle = '#F2C14E'; c.lineWidth = 14; c.stroke();
  c.fillStyle = '#FFFDF8'; c.font = '230px Unb9'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText("KING'S CROSS", x0, -2490);
  // entrance canopy
  c.fillStyle = '#2B2F3A'; c.fillRect(L + 200, base - 520, R - L - 400, 60); c.fillStyle = '#C23C4A'; for (const s of [-1, 1]) { c.save(); c.translate(x0 + s * 1250, base - 900); c.beginPath(); c.arc(0, 0, 120, 0, TAU); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(0, 0, 70, 0, TAU); c.fill(); c.fillStyle = '#1E2A4A'; c.fillRect(-150, -30, 300, 60); c.fillStyle = '#FFFFFF'; c.font = '34px Unb9'; c.fillText('TRAINS', 0, 2); c.restore(); c.fillStyle = '#C23C4A'; }
}
function drawStreet(c) {
  // sky
  const sg = c.createLinearGradient(0, -4400, 0, -900); sg.addColorStop(0, '#6FB2E0'); sg.addColorStop(0.6, '#A8D4EE'); sg.addColorStop(1, '#F6E6C8'); c.fillStyle = sg; c.fillRect(BX0, -4400, BW, 3800);
  for (let i = 0; i < 26; i++) { const x = BX0 + hash(i) * BW, y = -2900 + hash(i * 3) * 500; c.fillStyle = 'rgba(255,255,255,.75)'; for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(x + k * 70, y - (k % 2) * 30, 70, 0, TAU); c.fill(); } }
  // distant skyline: generic towers, a big wheel, a clock tower
  c.fillStyle = 'rgba(120,140,170,.45)'; for (let x = BX0; x < BX0 + BW; x += 260) { const h = 300 + hash(x) * 700; c.fillRect(x, -1500 - h, 200, h + 600); }
  for (let k = 0; k < 4; k++) { const wx = BX0 + 2300 + k * 4200; c.strokeStyle = 'rgba(120,140,170,.55)'; c.lineWidth = 14; c.beginPath(); c.arc(wx, -2350, 380, 0, TAU); c.stroke(); c.lineWidth = 5; for (let a = 0; a < 16; a++) { c.beginPath(); c.moveTo(wx, -2350); c.lineTo(wx + Math.cos(a / 16 * TAU) * 380, -2350 + Math.sin(a / 16 * TAU) * 380); c.stroke(); } c.beginPath(); c.moveTo(wx - 200, -1700); c.lineTo(wx, -2350); c.lineTo(wx + 200, -1700); c.stroke(); }
  for (let k = 0; k < 4; k++) { const tx = BX0 + 4300 + k * 4200; c.fillStyle = 'rgba(120,140,170,.55)'; c.fillRect(tx - 70, -2700, 140, 1300); c.beginPath(); c.moveTo(tx - 90, -2700); c.lineTo(tx, -2950); c.lineTo(tx + 90, -2700); c.fill(); c.fillStyle = 'rgba(255,250,235,.7)'; c.beginPath(); c.arc(tx, -2580, 45, 0, TAU); c.fill(); }
  // buildings across the road
  let i = 0; for (let x = BX0; x < BX0 + BW; x += 920, i++) { if (Math.abs(x + 460 - ST.leo) < 2300) continue; house(c, x, 900, i); }
  station(c, ST.leo);
  // far pavement + road
  c.fillStyle = '#B9B4AA'; c.fillRect(BX0, ROAD_TOP - 60, BW, 70);
  const rg = c.createLinearGradient(0, ROAD_TOP, 0, KERB); rg.addColorStop(0, '#4A4D55'); rg.addColorStop(1, '#5A5E66'); c.fillStyle = rg; c.fillRect(BX0, ROAD_TOP, BW, KERB - ROAD_TOP);
  c.fillStyle = '#FFFDF8'; for (let x = BX0; x < BX0 + BW; x += 320) c.fillRect(x, (ROAD_TOP + KERB) / 2 - 8, 170, 16);
  c.fillStyle = '#F2C14E'; c.fillRect(BX0, KERB - 30, BW, 8); c.fillRect(BX0, KERB - 16, BW, 8);
  // near pavement
  c.fillStyle = '#8A8478'; c.fillRect(BX0, KERB, BW, 40);
  const pg = c.createLinearGradient(0, KERB + 40, 0, 800); pg.addColorStop(0, '#C9C3B6'); pg.addColorStop(1, '#AFA89A'); c.fillStyle = pg; c.fillRect(BX0, KERB + 40, BW, 800);
  c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 4; for (let y = KERB + 40, k = 0; y < 800; y += 70 + k * 20, k++) { c.beginPath(); c.moveTo(BX0, y); c.lineTo(BX0 + BW, y); c.stroke(); } for (let x = BX0; x < BX0 + BW; x += 240) { c.beginPath(); c.moveTo(x, KERB + 40); c.lineTo(x + (x % 480 ? 40 : -40), 800); c.stroke(); }
}
const BGS = createCanvas(Math.round(BW * BS), Math.round(BH * BS)), bgc = BGS.getContext('2d');
bgc.scale(BS, BS); bgc.translate(-BX0, -BY0); drawStreet(bgc);
const BGB = createCanvas(BGS.width, BGS.height); { const c = BGB.getContext('2d'); c.filter = 'blur(2.5px)'; c.drawImage(BGS, 0, 0); }

// ---------------- live street props (sharp, near pavement)
function phoneBox(c, x) {
  paint(c, q => { q.m(x - 130, -1150); q.l(x + 130, -1150); q.l(x + 130, FY - 30); q.l(x - 130, FY - 30); q.z(); }, '#C8282E', { sd: 12, hd: 6, inner: k => { k.fillStyle = '#F7F2E8'; k.fillRect(x - 100, -1090, 200, 50); k.fillStyle = '#2B2F3A'; k.font = '34px Unb9'; k.textAlign = 'center'; k.textBaseline = 'middle'; k.fillText('TELEPHONE', x, -1064); k.fillStyle = '#9CC8E8'; for (let r = 0; r < 5; r++) for (let q = 0; q < 3; q++) k.fillRect(x - 96 + q * 66, -1010 + r * 130, 58, 118); } });
  paint(c, q => { q.m(x - 150, -1150); q.q(x, -1260, x + 150, -1150); q.z(); }, '#C8282E', { sd: 6, hd: 4 });
}
function lamp(c, x) { c.fillStyle = '#2B2F3A'; c.fillRect(x - 14, -1900, 28, 1900 + FY - 40); c.fillRect(x - 40, FY - 80, 80, 50); paint(c, q => { q.m(x - 70, -2080); q.l(x + 70, -2080); q.l(x + 50, -1900); q.l(x - 50, -1900); q.z(); }, '#2B2F3A', { sd: 4, hd: 3, inner: k => { k.fillStyle = '#FFE6B0'; k.fillRect(x - 46, -2060, 92, 140); } }); }
function postBox(c, x) { paint(c, q => { q.m(x - 90, -700); q.q(x, -800, x + 90, -700); q.l(x + 90, FY - 30); q.l(x - 90, FY - 30); q.z(); }, '#C8282E', { sd: 10, hd: 6, inner: k => { k.fillStyle = '#1E1612'; k.fillRect(x - 60, -600, 120, 18); k.fillStyle = '#F2C14E'; k.font = '26px Unb9'; k.textAlign = 'center'; k.fillText('POST', x, -520); } }); }
function railings(c, x) { c.fillStyle = '#2B2F3A'; for (let k = -10; k <= 10; k++) { const xx = x + k * 70; c.fillRect(xx - 6, -620, 12, 600); c.beginPath(); c.moveTo(xx - 14, -620); c.lineTo(xx, -660); c.lineTo(xx + 14, -620); c.fill(); } c.fillRect(x - 720, -560, 1440, 14); c.fillRect(x - 720, -120, 1440, 14);
  for (let k = -4; k <= 4; k++) { c.fillStyle = k % 2 ? '#4E8A5A' : '#3E7A4A'; c.beginPath(); c.arc(x + k * 170, -900, 230, 0, TAU); c.fill(); } }
function busStop(c, x) { c.fillStyle = '#2B2F3A'; c.fillRect(x - 10, -1500, 20, 1500 + FY - 40); c.save(); c.translate(x, -1550); c.fillStyle = '#C8282E'; c.beginPath(); c.arc(0, 0, 110, 0, TAU); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(0, 0, 70, 0, TAU); c.fill(); c.fillStyle = '#1E2A4A'; c.fillRect(-140, -26, 280, 52); c.fillStyle = '#FFFFFF'; c.font = '34px Unb9'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('BUS STOP', 0, 2); c.restore(); }
function coffeeCart(c, x) { paint(c, q => { q.m(x - 220, -820); q.l(x + 220, -820); q.l(x + 220, FY - 80); q.l(x - 220, FY - 80); q.z(); }, '#2F5A48', { sd: 10, hd: 6, inner: k => { k.fillStyle = '#F3EDDF'; k.fillRect(x - 190, -790, 380, 90); k.fillStyle = '#2F5A48'; k.font = '50px Unb9'; k.textAlign = 'center'; k.textBaseline = 'middle'; k.fillText('COFFEE', x, -742); } }); for (const s of [-1, 1]) { c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(x + s * 150, FY - 60, 50, 0, TAU); c.fill(); } paint(c, q => { q.m(x - 260, -900); q.l(x + 260, -900); q.l(x + 230, -820); q.l(x - 230, -820); q.z(); }, '#E9A23B', { sd: 4, hd: 3 }); }
function propsFor(c, who, x0) {
  if (who === 'albert') { phoneBox(c, x0 - 520); lamp(c, x0 + 980); }
  if (who === 'kai') railings(c, x0 - 200);
  if (who === 'agnes') { busStop(c, x0 - 560); }
  if (who === 'oliver') coffeeCart(c, x0 - 600);
  if (who === 'reggie') { lamp(c, x0 - 560); postBox(c, x0 + 950); }
  if (who === 'leo') { lamp(c, x0 + 980); }
}
// passing traffic on the road behind the characters
function bus(c, x, y, t) {
  c.save(); c.translate(x, y);
  paint(c, q => { q.m(-700, -980); q.q(-700, -1030, -650, -1030); q.l(650, -1030); q.q(700, -1030, 700, -980); q.l(700, -60); q.l(-700, -60); q.z(); }, '#D62E2E', { sd: 14, hd: 8, inner: k => {
    k.fillStyle = '#2B3540'; for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) { rr(k, -660 + i * 222, -960 + r * 440, 190, 230, 18); k.fill(); }
    k.fillStyle = '#F2C14E'; k.fillRect(-700, -520, 1400, 26); k.fillStyle = '#1E1612'; k.fillRect(-640, -470, 300, 70); k.fillStyle = '#FFE15A'; k.font = '54px Unb9'; k.textAlign = 'center'; k.textBaseline = 'middle'; k.fillText('73', -490, -434);
    k.fillStyle = 'rgba(255,255,255,.18)'; for (let i = 0; i < 6; i++) k.fillRect(-650 + i * 222, -950, 30, 200); } });
  for (const s of [-1, 1]) { c.fillStyle = '#1E1612'; c.beginPath(); c.arc(s * 470, -60, 80, 0, TAU); c.fill(); c.fillStyle = '#9AA3B2'; c.beginPath(); c.arc(s * 470, -60, 34, 0, TAU); c.fill(); }
  c.restore();
}
function cab(c, x, y) {
  c.save(); c.translate(x, y);
  paint(c, q => { q.m(-380, -380); q.q(-350, -560, -150, -580); q.l(170, -580); q.q(340, -560, 370, -380); q.l(420, -340); q.l(420, -80); q.l(-420, -80); q.l(-420, -340); q.z(); }, '#1E1E24', { sd: 12, hd: 8, inner: k => { k.fillStyle = '#5E7FA0'; k.beginPath(); k.moveTo(-300, -380); k.quadraticCurveTo(-280, -520, -140, -530); k.lineTo(-20, -530); k.lineTo(-20, -380); k.fill(); k.beginPath(); k.moveTo(20, -380); k.lineTo(20, -530); k.lineTo(160, -530); k.quadraticCurveTo(300, -520, 310, -380); k.fill(); k.fillStyle = '#F2C14E'; k.fillRect(-60, -620, 120, 40); k.fillStyle = '#1E1E24'; k.font = '26px Unb9'; k.textAlign = 'center'; k.textBaseline = 'middle'; k.fillText('TAXI', 0, -599); } });
  for (const s of [-1, 1]) { c.fillStyle = '#111'; c.beginPath(); c.arc(s * 270, -80, 70, 0, TAU); c.fill(); c.fillStyle = '#9AA3B2'; c.beginPath(); c.arc(s * 270, -80, 28, 0, TAU); c.fill(); }
  c.restore();
}
function traffic(c, t, x0, L) {
  if (L === 'C2') return;
  // a bus and a cab drive through every few seconds (behind the characters)
  const cyc = 9.5, ph = ((t + hash(x0) * 9) % cyc) / cyc;
  if (ph < 0.28) { const k = ph / 0.28; bus(c, x0 + lerp(2600, -2600, k), -300, t); }
  const ph2 = ((t + 4.6 + hash(x0 + 1) * 5) % 7.3) / 7.3; if (ph2 < 0.22) { const k = ph2 / 0.22; cab(c, x0 + lerp(-2400, 2400, k), -170); }
}
function pigeons(c, t, x0, scare = 0) {
  for (let i = 0; i < 3; i++) { const bx = x0 + 820 + i * 130 + (i % 2) * 40, peck = Math.max(0, Math.sin(t * 5 + i * 2)) ** 3, fly = scare > 0 ? eIn(clamp(scare - i * 0.1)) : 0;
    c.save(); c.translate(bx + fly * 600, FY + 120 - fly * 1500); c.scale(i % 2 ? -1 : 1, 1); c.rotate(peck * 0.5 * (1 - fly));
    paint(c, q => q.e(0, -40, 60, 38), '#8C939E', { sd: 6, hd: 4, lw: 3, inner: k => { k.fillStyle = '#6A7A8A'; k.beginPath(); k.ellipse(-20, -40, 40, 22, 0, 0, TAU); k.fill(); } });
    paint(c, q => q.a(48, -78, 24), '#7A8290', { sd: 4, hd: 2, lw: 3, inner: k => { k.fillStyle = '#5ABF8A'; k.fillRect(30, -64, 30, 10); } });
    c.fillStyle = '#E8913A'; c.beginPath(); c.moveTo(70, -80); c.lineTo(86, -74); c.lineTo(70, -70); c.fill(); c.fillStyle = '#111'; c.beginPath(); c.arc(54, -84, 4, 0, TAU); c.fill();
    if (fly > 0) { c.fillStyle = '#8C939E'; c.beginPath(); c.ellipse(-10, -70, 60, 18, -0.6 + Math.sin(t * 30) * 0.5, 0, TAU); c.fill(); }
    c.restore(); }
}

// ---------------- props held / worn
const prop = {
  map: () => (ctx, a) => { ctx.rotate(-0.08); paint(ctx, q => { q.m(-150, -110); q.l(150, -120); q.l(160, 100); q.l(-140, 110); q.z(); }, '#F7F2E8', { sd: 8, hd: 4, lw: 3, inner: k => { k.strokeStyle = 'rgba(0,0,0,.15)'; k.lineWidth = 3; for (const x of [-50, 50]) { k.beginPath(); k.moveTo(x, -115); k.lineTo(x + 5, 105); k.stroke(); } k.strokeStyle = '#8CB3D9'; k.lineWidth = 12; k.beginPath(); k.moveTo(-150, 30); k.quadraticCurveTo(0, -40, 150, 20); k.stroke(); k.strokeStyle = '#E0474C'; k.lineWidth = 6; k.setLineDash([12, 10]); k.beginPath(); k.moveTo(-110, 80); k.lineTo(-20, -20); k.lineTo(90, -70); k.stroke(); k.setLineDash([]); k.fillStyle = '#E0474C'; k.beginPath(); k.arc(90, -70, 14, 0, TAU); k.fill(); } }); },
  umbrella: (open = 0) => (ctx, a) => { ctx.rotate(open > 0.05 ? Math.PI + 0.12 : a - Math.PI / 2); ctx.strokeStyle = '#2B2F3A'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, -60); ctx.lineTo(0, 430); ctx.stroke(); ctx.beginPath(); ctx.arc(-22, -60, 22, Math.PI, 0, true); ctx.stroke();
    if (open < 0.05) paint(ctx, q => { q.m(-26, 60); q.l(26, 60); q.l(6, 400); q.l(-6, 400); q.z(); }, '#8E5BD6', { sd: 4, hd: 3, lw: 3 });
    else { const r = 330 * open, cy = 330; paint(ctx, q => { q.m(-r, cy); for (let k = 0; k <= 24; k++) { const th = Math.PI - k / 24 * Math.PI; q.l(r * Math.cos(th), cy + 0.85 * r * Math.sin(th)); } for (let k = 6; k > 0; k--) { const x1 = -r + k * r / 3, x0 = x1 - r / 3; q.q((x0 + x1) / 2, cy - 30 * open, x0, cy); } q.z(); }, '#8E5BD6', { sd: 10, hd: 6, lw: 3.5, inner: kk => { kk.strokeStyle = 'rgba(0,0,0,.2)'; kk.lineWidth = 3; for (let k = -2; k <= 2; k++) { kk.beginPath(); kk.moveTo(0, cy + 0.85 * r); kk.lineTo(k * r / 3, cy); kk.stroke(); } } }); } },
  cane: () => (ctx, a) => { ctx.rotate(0); ctx.strokeStyle = '#1E1612'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(10, 900); ctx.stroke(); ctx.beginPath(); ctx.arc(-26, -20, 26, Math.PI, 0); ctx.stroke(); paint(ctx, q => { q.m(-20, 80); q.l(30, 80); q.l(16, 760); q.l(4, 760); q.z(); }, '#2B2F3A', { sd: 4, hd: 2, lw: 3 }); },
};
function flatCap(c, g, head, turn) { const x = head.x, y = head.y, hw = g.hw, hh = g.hh;
  paint(c, q => { q.m(x - hw * 1.05, y - hh * 0.45); q.b(x - hw * 1.1, y - hh * 1.25, x + hw * 1.1, y - hh * 1.25, x + hw * 1.05, y - hh * 0.45); q.q(x, y - hh * 0.62, x - hw * 1.05, y - hh * 0.45); q.z(); }, '#7A6A55', { sd: 8, hd: 5, inner: k => { k.strokeStyle = 'rgba(0,0,0,.18)'; k.lineWidth = 3; for (let i = -4; i <= 4; i++) { k.beginPath(); k.moveTo(x + i * hw * 0.22, y - hh * 1.05); k.lineTo(x + i * hw * 0.24, y - hh * 0.5); k.stroke(); } } });
  paint(c, q => { q.m(x - hw * 0.9 + turn * hw * 0.4, y - hh * 0.5); q.q(x + turn * hw * 0.5, y - hh * 0.28, x + hw * 0.9 + turn * hw * 0.4, y - hh * 0.5); q.q(x + turn * hw * 0.4, y - hh * 0.6, x - hw * 0.9 + turn * hw * 0.4, y - hh * 0.5); q.z(); }, '#6A5A45', { sd: 4, hd: 3, lw: 3 }); }
function bowler(c, g, head, lift = 0) { const x = head.x, y = head.y - lift, hw = g.hw, hh = g.hh;
  paint(c, q => { q.m(x - hw * 1.25, y - hh * 0.62); q.q(x, y - hh * 0.5, x + hw * 1.25, y - hh * 0.62); q.q(x + hw * 1.3, y - hh * 0.75, x + hw * 1.1, y - hh * 0.75); q.l(x - hw * 1.1, y - hh * 0.75); q.q(x - hw * 1.3, y - hh * 0.75, x - hw * 1.25, y - hh * 0.62); q.z(); }, '#1E1612', { sd: 4, hd: 3, lw: 3 });
  paint(c, q => { q.m(x - hw * 0.85, y - hh * 0.72); q.b(x - hw * 0.9, y - hh * 1.55, x + hw * 0.9, y - hh * 1.55, x + hw * 0.85, y - hh * 0.72); q.z(); }, '#2A221C', { sd: 10, hd: 6, inner: k => { k.fillStyle = '#5A2A2A'; k.fillRect(x - hw * 0.9, y - hh * 0.92, hw * 1.8, hh * 0.14); } }); }

// ---------------- characters (all arm poses via natural IK)
function nb(who) { return { albert: drawAlbert, kai: drawKai, agnes: drawAgnes, oliver: drawOliver, reggie: drawReggie, leo: drawLeo }[who]; }
function put(c, cfg, st, x, y = FY, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); const r = human(c, cfg, st); c.restore(); return { x: x + r.head.x * s, y: y + r.head.y * s, hh: r.hh * s, r }; }
function drawAlbert(c, t, L, x) {
  const g = G.albert; const st = { t, talk: talk('albert', t), mood: 'neutral', turn: 0.35, look: 0.8, armL: reach(g, -1, -g.sw * 1.05, g.ySh + 480), armR: reach(g, 1, g.sw * 0.4, g.ySh + 330) };
  if (L === 'A1') {
    if (t > SP.a1_her.t + 0.3) { st.mood = 'skeptical'; }
    if (t > endOf('a1_her') + 0.25) { st.mood = 'happy'; st.laugh = speaking('a1_x', t); st.armL = reach(g, -1, -g.sw * 3.0, g.ySh - 60); }
    if (t > SP.a1_nar.t) { st.armL = reach(g, -1, -g.sw * 1.05, g.ySh + 480); }
  }
  st.front = (cc, gg) => flatCap(cc, g, gg.head, st.turn);
  return put(c, CAST.albert, st, x);
}
function drawKai(c, t, L, x) {
  const g = G.kai; const ph = t * 9; const bob = Math.abs(Math.sin(ph)) * 18;
  const st = { t, talk: talk('kai', t), mood: 'happy', turn: 0.3, look: 0.7, legPose: 'walk', headY: -bob * 0.3,
    armL: reach(g, -1, -g.sw * 0.95 + Math.sin(ph) * 40, g.ySh + 300 + Math.cos(ph) * 50, { fist: true }), armR: reach(g, 1, g.sw * 0.95 - Math.sin(ph) * 40, g.ySh + 300 - Math.cos(ph) * 50, { fist: true }) };
  let xx = x;
  if (L === 'A2') { if (speaking('a2_x', t, 0.1, 0.2)) { st.armR = reach(g, 1, g.sw * 2.6, g.ySh - 100); } const ex = P(t, endOf('a2_x') + 0.25, endOf('a2_x') + 1.3); if (ex > 0) { xx = x - eIn(ex) * 1800; st.turn = -0.4; st.look = -0.8; } }
  c.save(); c.translate(0, -bob); const r = put(c, CAST.kai, st, xx); c.restore(); r.y -= bob; return r;
}
function drawAgnes(c, t, L, x) {
  const g = G.agnes; const ev = lvEv('B1');
  const open = L === 'B1' && ev.umb ? eBack(P(t, ev.umb, ev.umb + 0.35), 1.6) : 0;
  const st = { t, talk: talk('agnes', t), mood: 'happy', turn: 0.35, look: 0.8, armL: reach(g, -1, -g.sw * 0.9, g.ySh + 420), armR: reach(g, 1, g.sw * 1.0, g.ySh + 380), items: { R: prop.umbrella(0) } };
  if (L === 'B1') {
    if (speaking('b1_x', t, 0.05)) { const u = (t - SP.b1_x.t) / SP.b1_x.d; st.items = { R: prop.umbrella(0) }; st.armR = u < 0.55 ? reach(g, 1, g.sw * 2.6, g.ySh - 40) : reach(g, 1, -g.sw * 0.3, g.ySh - 120); }
    if (ev.umb && t > ev.umb - 0.05) { st.armR = reach(g, 1, g.sw * 0.7, g.ySh - 260); st.items = { R: prop.umbrella(open) }; st.mood = t < ev.umb + 0.6 ? 'shock' : 'happy'; }
  }
  const r = put(c, CAST.agnes, st, x);
  // pug on a lead
  const px = x - 330; c.save(); c.translate(px, FY + 40); c.scale(0.55, 0.55); pug(c, { t, tilt: Math.sin(t * 1.4) * 0.1, tongue: L === 'B1' && SP.b1_x && t > SP.b1_x.t - 0.3 && t < SP.b1_x.t + 0.4 }); c.restore();
  return r;
}
function drawOliver(c, t, L, x) {
  const g = G.oliver; const st = { t, talk: talk('oliver', t), mood: 'neutral', turn: 0.2, look: 0.2, lookY: 0.6, armL: reach(g, -1, -g.sw * 0.45, g.ySh + 230), armR: reach(g, 1, g.sw * 0.9, g.ySh + 300), items: { L: items.phone('#2B2F3A'), R: items.coffee() } };
  if (L === 'B2') {
    if (t > SP.b2_her.t + 1.0) { st.lookY = 0; st.turn = 0.35; st.look = 0.8; st.mood = 'happy'; }
    if (speaking('b2_x', t, 0.05, 0.6)) { const u = (t - SP.b2_x.t) / SP.b2_x.d; if (u > 0.15 && u < 0.6) { st.armL = reach(g, -1, -g.sw * 3.0, g.ySh - 20); st.armR = reach(g, 1, g.sw * 3.0, g.ySh - 20); } st.mood = 'happy'; }
  }
  return put(c, CAST.oliver, st, x);
}
function drawReggie(c, t, L, x) {
  const g = G.reggie; let lift = 0;
  const st = { t, talk: talk('reggie', t), mood: 'neutral', turn: 0.35, look: 0.8, armL: reach(g, -1, -g.sw * 1.2, g.ySh + 470), armR: reach(g, 1, g.sw * 0.5, g.ySh + 330), items: { L: prop.cane() } };
  if (L === 'C1') {
    if (t > SP.c1_her.t + 1.2) st.mood = 'happy';
    if (speaking('c1_x', t, 0.05, 1.2)) { const u = (t - SP.c1_x.t) / SP.c1_x.d; st.mood = 'happy'; if (u > 0.55) { const k = eIO(P(u, 0.55, 0.75)) * (1 - eIO(P(u, 1.05, 1.25))); lift = 70 * k; st.armR = reach(g, 1, g.hw * 0.6, g.headY - g.hh * 1.0 - lift); st.tilt = 0.08 * k; } }
  }
  const head = {}; st.front = (cc, gg) => bowler(cc, g, gg.head, lift);
  return put(c, CAST.reggie, st, x);
}
function drawLeo(c, t, L, x) {
  const g = G.leo; const ev = lvEv('C2');
  const st = { t, talk: talk('leo', t), mood: 'happy', turn: 0.3, look: 0.8, armL: reach(g, -1, -g.sw * 1.3, g.ySh + 280), armR: reach(g, 1, g.sw * 0.9, g.ySh + 300), items: { L: items.balloon('#E8485C', t) } };
  if (L === 'C2') {
    if (t > SP.c2_her.t + 2.0 && t < endOf('c2_her')) st.mood = 'bored';
    if (t > endOf('c2_her') + 0.3) st.mood = 'skeptical';
    if (speaking('c2_x', t, 0.05, 2.5)) { st.mood = 'neutral'; st.armR = reach(g, 1, g.sw * 2.4, g.ySh - 420); st.look = 0.6; st.lookY = -0.6; }
    if (t > SP.c2_her2.t) st.mood = 'smug';
  }
  return put(c, CAST.leo, st, x);
}
function herState(t, L) {
  const g = G.her_london; const ev = lvEv(L);
  const st = { t, talk: talk('her', t), mood: 'worried', turn: -0.45, look: -0.7, armL: reach(g, -1, -g.sw * 0.45, g.ySh + 290), armR: reach(g, 1, g.sw * 0.45, g.ySh + 290) };
  st.front = (cc, gg) => { if (st.mapOn !== false) { cc.save(); cc.translate(0, gg.ySh + 300); prop.map()(cc, 0); cc.restore(); } };
  const l = (L || '').toLowerCase(); const hs = SP[l + '_her'];
  if (hs && speaking(l + '_her', t, 0.05)) { const gg = Math.sin((t - hs.t) * 5); st.mapOn = false; st.armL = reach(g, -1, -g.sw * 0.15 + gg * 50, g.ySh + 200 - Math.abs(gg) * 40); st.armR = reach(g, 1, g.sw * 0.9, g.ySh + 420); st.items = { R: prop.map() }; st.mood = 'neutral'; }
  if (L === 'hook') { st.mood = 'worried'; st.turn = -0.1; st.look = 0.4; st.lookY = -0.3; }
  if (L === 'A1') { if (speaking('a1_her', t, 0.1, 0.7)) { const w = (t - SP.a1_her.t) * 9; st.mapOn = false; st.items = {}; st.mood = 'happy'; st.armL = reach(g, -1, -g.sw * 0.55 + Math.cos(w) * 60, g.ySh + 270 + Math.sin(w) * 60, { fist: true }); st.armR = reach(g, 1, g.sw * 0.55 + Math.cos(w + Math.PI) * 60, g.ySh + 270 + Math.sin(w + Math.PI) * 60, { fist: true }); } if (t > SP.a1_x.t + 0.3) { st.mood = 'happy'; } }
  if (L === 'A2') { if (t > endOf('a2_x') + 0.3) { st.mood = 'shock'; st.turn = -0.7; st.look = -1; } if (t > SP.a2_nar.t + 1.0) st.mood = 'worried'; }
  if (L === 'B1') { if (t > SP.b1_x.t + 0.3) st.mood = 'happy'; if (ev.umb && t > ev.umb && t < ev.umb + 0.7) st.mood = 'shock'; }
  if (L === 'B2') { if (SP.b2_x && t > SP.b2_x.t + 0.6) { st.mood = 'shock'; st.look = lerp(-1, 1, 0.5 + 0.5 * Math.sin(t * 4)); } if (t > SP.b2_nar.t + 0.4) st.mood = 'worried'; }
  if (L === 'C1') { if (SP.c1_x && t > SP.c1_x.t + 0.3) st.mood = 'happy'; }
  if (L === 'C2') {
    if (speaking('c2_her', t, 0.1)) { st.mapOn = false; st.items = {}; st.mood = 'smug'; st.armL = reach(g, -1, -g.sw * 0.15, g.ySh + 130); st.armR = reach(g, 1, g.sw * 1.55 + Math.sin(t * 2.4) * 40, g.ySh + 40 + Math.cos(t * 2.4) * 30); st.turn = -0.25; }
    if (t > endOf('c2_her') + 0.2) st.mood = 'neutral';
    if (SP.c2_x && t > endOf('c2_x') + 0.2) { st.mood = 'shock'; st.turn = 0.25; st.look = 0.6; st.lookY = -1; }
    if (t > SP.c2_her2.t - 0.15) { st.mood = 'bored'; st.turn = -0.45; st.look = -0.7; st.lookY = 0; }
  }
  if (L === 'outro') { st.mapOn = false; st.mood = 'happy'; st.armL = reach(g, -1, -g.sw * 1.5 + Math.sin(t * 8) * 40, g.headY - 220); st.armR = reach(g, 1, g.sw * 1.0, g.ySh + 300); st.items = { R: prop.map() }; st.turn = 0; st.look = 0; }
  return st;
}
function drawHer(c, t, L, x, s = 1, y = FY) { return put(c, CAST.her_london, herState(t, L), x, y, s); }

// ---------------- composition
function world(c, t, L) {
  c.drawImage(BGB, BX0, BY0, BW, BH);
  const who = WHO[L], x0 = ST[who]; const heads = {};
  traffic(c, t, x0, L);
  propsFor(c, who, x0);
  const scare = L === 'C2' && SP.c2_x ? P(t, endOf('c2_x') + 0.5, endOf('c2_x') + 1.8) : (L === 'A2' && SP.a2_x ? P(t, endOf('a2_x') + 0.3, endOf('a2_x') + 1.5) : 0);
  pigeons(c, t, x0, scare);
  heads[who] = nb(who)(c, t, L, x0 + NBX);
  heads.her = drawHer(c, t, L, x0 + HERX);
  // steam puffs for the choo-choo
  if (L === 'A1' && speaking('a1_her', t, 0, 0.9)) { const u = t - SP.a1_her.t; for (let i = 0; i < 4; i++) { const ph = (u * 1.2 + i / 4) % 1; c.save(); c.globalAlpha = Math.sin(ph * Math.PI) * 0.9; c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(x0 + HERX + 130 + ph * 150, -1520 - ph * 300, 40 + ph * 50, 0, TAU); c.fill(); c.restore(); }
    c.save(); c.globalAlpha = clamp(Math.sin(u * 4) * 2); c.font = '62px Unb9'; c.textAlign = 'center'; c.lineJoin = 'round'; c.strokeStyle = '#3E471E'; c.lineWidth = 12; c.strokeText('ЧУХ-ЧУХ!', x0 + HERX + 60, -1580); c.fillStyle = '#FFFDF8'; c.fillText('ЧУХ-ЧУХ!', x0 + HERX + 60, -1580); c.restore(); }
  return heads;
}

// ---------------- camera
function shotFor(t) {
  const sc = sceneAt(t), L = sc.id; const who = WHO[L], x0 = ST[who];
  const herHY = FY + G.her_london.headY, nbHY = FY + G[who].headY;
  const hx = x0 + HERX, nx = x0 + NBX;
  const two = { x: x0 + 240, y: Math.min(herHY, nbHY) + 150, z: 0.95, r: 0 };
  if (L === 'hook' || L === 'outro') return { x: x0 + 240, y: -1000, z: 0.9, r: 0 };
  const u = t - sc.s; const ev = sc.ev || {};
  if (u < 1.15) return { ...two, z: 0.9, cut: u < 0.85 };
  const l = L.toLowerCase(); const her = l + '_her', oth = l + '_x', nar = l + '_nar';
  const herC = { x: hx - 40, y: herHY + 115, z: 1.5, r: -0.5 }, othC = { x: nx + 40, y: nbHY + 115, z: L === 'C2' ? 1.7 : 1.45, r: 0.5 };
  if (L === 'C2') {
    const he = endOf('c2_her');
    if (t < SP.c2_her.t - 0.2) return { ...two, z: 1.05, y: two.y + 60 };
    if (t < he + 0.1) return { ...herC, z: lerp(1.4, 1.85, P(t, SP.c2_her.t, he)), y: lerp(herHY + 120, herHY + 85, P(t, SP.c2_her.t, he)) };
    if (t < endOf('c2_x') + 0.15) return { ...othC, cut: t < SP.c2_x.t - 0.2 };
    if (t < SP.c2_her2.t - 0.15) { const k = eIO(P(t, endOf('c2_x') + 0.15, SP.c2_her2.t - 0.4)); return { x: x0 + 120, y: lerp(two.y, -1750, k), z: lerp(1.0, 0.4, k), r: 0 }; }
    if (t < SP.c2_nar.t - 0.1) return { ...herC, z: 1.75, y: herHY + 100, cut: t < SP.c2_her2.t };
    return { x: x0 + 200, y: -1550, z: 0.6, r: 0 };
  }
  if (L === 'A2' && t > endOf('a2_x') + 0.2 && t < SP.a2_nar.t - 0.1) return { ...two, z: 0.9 };
  if (L === 'B1' && ev.umb && t > ev.umb - 0.3 && t < SP.b1_nar.t - 0.1) return { x: nx + 150, y: nbHY - 80, z: 1.1, r: 0 };
  if (L === 'B2' && speaking('b2_x', t, 0.2, 0.3)) return { ...two, z: 0.9 };
  if (speaking(her, t, 0.3, 0.1)) return herC;
  if (SP[nar] && t >= SP[nar].t - 0.15) return { ...two, z: 0.93 };
  if (speaking(oth, t, 0.3, 0.3)) return L === 'C1' ? { ...othC, z: 1.2, y: nbHY + 10 } : othC;
  return two;
}
const CAM = E.simulateCamera(TL, shotFor, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'drop']);

// ---------------- NEW opener: A1 vs C2 split screen
function bubbleSmall(c, x, y, w, txt, fs, tailX, tailUp, k) {
  if (k <= 0) return; c.save(); c.translate(x, y); c.scale(k, k);
  UI.font(c, 'Nun9', fs); const lines = UI.wrap(c, txt, w - 60); const h = lines.length * fs * 1.15 + 44;
  c.fillStyle = 'rgba(0,0,0,.18)'; UI.rr(c, -w / 2 + 8, -h / 2 + 10, w, h, 34); c.fill();
  c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; UI.rr(c, -w / 2, -h / 2, w, h, 34); c.fill(); c.stroke();
  const ty = tailUp ? -h / 2 : h / 2, td = tailUp ? -60 : 60; c.beginPath(); c.moveTo(tailX - 26, ty); c.lineTo(tailX + 10, ty + td); c.lineTo(tailX + 26, ty); c.fill(); c.beginPath(); c.moveTo(tailX - 26, ty); c.lineTo(tailX + 10, ty + td); c.lineTo(tailX + 26, ty); c.stroke(); c.fillStyle = C.white; c.fillRect(tailX - 24, ty - (tailUp ? 0 : 8), 48, 8);
  c.fillStyle = C.oliveD; c.textAlign = 'center'; c.textBaseline = 'middle'; lines.forEach((ln, i) => c.fillText(ln, 0, -h / 2 + 22 + fs * 0.58 + i * fs * 1.15));
  c.restore();
}
function badge(c, x, y, L, k) { if (k <= 0) return; c.save(); c.translate(x, y); c.scale(k, k); c.rotate(-0.08); c.fillStyle = 'rgba(0,0,0,.2)'; UI.rr(c, -96, -54, 200, 116, 30); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 8; UI.rr(c, -100, -60, 200, 116, 30); c.fill(); c.stroke(); UI.font(c, 'Unb9', 74); c.fillStyle = LVCOL[L]; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(L, 0, 2); c.restore(); }
function halftone(c, x0, y0, w, h, col, t) { c.fillStyle = col; for (let y = y0; y < y0 + h; y += 44) for (let x = x0 + ((y / 44) % 2) * 22; x < x0 + w; x += 44) { const r = 6 + 4 * Math.sin((x + y) * 0.01 + t * 2); c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); } }
function drawHook(c, t) {
  // full composition from frame 0 (it is the cover); motion comes from the characters, bubbles and stickers
  const zin = lerp(1.06, 1, eOut(P(t, 0, 0.5)));
  const yl = 1010, yr = 860, g = G.her_london;
  c.save(); c.translate(540, 960); c.scale(zin, zin); c.translate(-540, -960);
  // top panel: A1
  c.save(); c.beginPath(); c.moveTo(-60, -60); c.lineTo(W + 60, -60); c.lineTo(W + 60, yr); c.lineTo(-60, yl); c.closePath(); c.clip();
  c.fillStyle = '#9CC56E'; c.fillRect(-60, -60, W + 120, HH); halftone(c, -60, -60, W + 120, yl + 60, 'rgba(255,255,255,.18)', t);
  { const w = t * 9; const st = { t, talk: 0, mood: 'happy', laugh: true, turn: -0.1, look: 0.2, armL: reach(g, -1, -g.sw * 0.55 + Math.cos(w) * 60, g.ySh + 270 + Math.sin(w) * 60, { fist: true }), armR: reach(g, 1, g.sw * 0.55 + Math.cos(w + Math.PI) * 60, g.ySh + 270 + Math.sin(w + Math.PI) * 60, { fist: true }) }; c.save(); c.translate(700, 1370); c.scale(0.72, 0.72); human(c, CAST.her_london, st); c.restore(); }
  for (let i = 0; i < 3; i++) { const ph = (t * 1.1 + i / 3) % 1; c.save(); c.globalAlpha = Math.sin(ph * Math.PI) * 0.9; c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(880 + ph * 120, 330 - ph * 150, 30 + ph * 36, 0, TAU); c.fill(); c.restore(); }
  c.restore();
  // bottom panel: C2 (posh, with a teacup)
  c.save(); c.beginPath(); c.moveTo(-60, yl); c.lineTo(W + 60, yr); c.lineTo(W + 60, HH + 60); c.lineTo(-60, HH + 60); c.closePath(); c.clip();
  c.fillStyle = '#9E7BD8'; c.fillRect(-60, 0, W + 120, HH + 60); halftone(c, -60, yr, W + 120, HH - yr + 60, 'rgba(255,255,255,.14)', t + 1);
  { const st = { t, talk: 0, mood: 'smug', turn: 0.2, look: 0.4, tilt: -0.05, armL: reach(g, -1, -g.sw * 0.15, g.ySh + 140), armR: reach(g, 1, g.sw * 1.35 + Math.sin(t * 2.2) * 25, g.ySh + 60 + Math.cos(t * 2.2) * 20), items: { R: items.teacup() } }; c.save(); c.translate(380, 2330); c.scale(0.86, 0.86); human(c, CAST.her_london, st); c.restore(); }
  c.restore();
  // divider
  c.save(); c.lineCap = 'round'; c.strokeStyle = C.white; c.lineWidth = 22; c.beginPath(); c.moveTo(-60, yl + 5); c.lineTo(W + 60, yr - 5); c.stroke(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke(); c.restore();
  c.restore();
  // level badges + bubbles (present from frame 0, small pop for motion)
  const pop = (a) => lerp(0.85, 1, eBack(P(t, a, a + 0.3), 2.2));
  badge(c, 150, 380, 'A1', pop(0));
  badge(c, 930, 1170, 'C2', pop(0.08));
  bubbleSmall(c, 300, 690, 470, 'Station? Choo-choo?', 54, 160, true, pop(0.15));
  bubbleSmall(c, 690, 1500, 660, 'Pardon the intrusion, but might you enlighten me as to the whereabouts of…', 43, -200, true, pop(0.25));
  // title ribbon (the thing to read in one second)
  const rk = lerp(0.9, 1, eBack(P(t, 0, 0.35), 1.8)) * (1 + 0.015 * Math.sin(t * 5));
  c.save(); c.translate(540, 930); c.rotate(-0.07); c.scale(rk, rk);
  const lines = TL.cfg.hook_title; c.fillStyle = 'rgba(0,0,0,.22)'; UI.rr(c, -500 + 10, -150 + 14, 1000, 300, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; UI.rr(c, -500, -150, 1000, 300, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 900); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -78); UI.textFit(c, 'Unb9', 110, lines[1][0], 900); UI.strokeText(c, lines[1][0], 0, 8, C.pink, C.white, 12); UI.textFit(c, 'Unb9', 64, lines[2][0], 900); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 98);
  // VS sticker on the ribbon corner
  c.save(); c.translate(430, -150); const vk = 1 + 0.06 * Math.sin(t * 6); c.scale(vk, vk); c.rotate(0.15); c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.arc(6, 10, 78, 0, TAU); c.fill(); c.fillStyle = C.gold; c.beginPath(); c.arc(0, 0, 78, 0, TAU); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 8; c.stroke(); UI.font(c, 'Unb9', 62); UI.strokeText(c, 'VS', 0, 4, C.white, C.oliveD, 12); c.restore();
  c.restore();
  // tiny double-decker crossing the bottom
  const bx = lerp(-400, 1500, ((t * 0.18 + 0.35) % 1)); c.save(); c.translate(bx, 1890); c.scale(0.16, 0.16); bus(c, 0, 0, t); c.restore();
  UI.levelBar(c, t, { id: 'hook' });
  const stT = SC.hook.stamp_t, sk = P(t, stT - 0.02, stT + 0.15);
  if (sk > 0) { const s2 = lerp(2.6, 1, eOut(sk)); c.save(); c.translate(540, 1730); c.rotate(-0.13); c.scale(s2, s2); c.globalAlpha = clamp(sk * 3); c.fillStyle = 'rgba(255,253,248,.92)'; UI.rr(c, -380, -90, 760, 180, 24); c.fill(); c.strokeStyle = C.pink; c.lineWidth = 14; UI.rr(c, -380, -90, 760, 180, 24); c.stroke(); UI.textFit(c, 'Unb9', 110, TL.cfg.stamp, 700); c.fillStyle = C.pink; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(TL.cfg.stamp, 0, 6); c.restore(); }
}
function drawOutro(c, t) {
  const s = SC.outro.s, u = t - s, o = SP.outro;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  const { textFit, strokeText, font, rr: R } = UI;
  const ck = eBack(P(u, 0.4, 0.9), 1.4);
  c.save(); c.translate(200, lerp(2900, 2420, ck)); c.scale(0.6, 0.6); human(c, CAST.her_london, herState(t, 'outro')); c.restore();
  c.save(); c.translate(560, lerp(2800, 2330, eBack(P(u, 0.6, 1.1), 1.4))); c.scale(0.6, 0.6); drawLeo(c, t, 'outro', 0); c.translate(0, 0); c.restore();
  c.save(); c.translate(900, lerp(3000, 2560, eBack(P(u, 0.5, 1.0), 1.4))); c.scale(0.55, 0.55); drawReggie(c, t, 'outro', 0); c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const q = eBack(P(u, 0.35, 0.7), 2.2);
  c.save(); c.translate(540, 450); c.scale(q, q); font(c, 'Unb9', 74); strokeText(c, 'А КАК СПРОСИШЬ', 0, -66, C.oliveD, C.white, 16); strokeText(c, 'ТЫ?', 0, 40, C.pink, C.white, 16); c.restore();
  const ex = [['Where is station? I need go.', true], ['How do I get to King\'s Cross?', false], ['Could you point me in the right direction?', false], ['Is it within walking distance?', false]];
  ex.forEach(([e, bad], i) => { const k = eBack(P(u, 1.05 + i * 0.22, 1.4 + i * 0.22), 2.2); if (k <= 0) return; c.save(); c.translate(540 + (i % 2 ? 30 : -30), 660 + i * 115 + Math.sin(t * 3 + i) * 5); c.scale(k, k); textFit(c, 'Nun9', 50, e, 800); const w = c.measureText(e).width + 70; c.fillStyle = 'rgba(0,0,0,.12)'; R(c, -w / 2 + 6, -44 + 8, w, 88, 44); c.fill(); c.fillStyle = bad ? '#B9B2A4' : [LVCOL.B1, LVCOL.B2, LVCOL.C1][i - 1]; R(c, -w / 2, -44, w, 88, 44); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke(); c.fillStyle = C.white; c.fillText(e, 0, 3); if (bad) { c.strokeStyle = C.red; c.lineWidth = 9; c.beginPath(); c.moveTo(-w / 2 + 20, 4); c.lineTo(w / 2 - 20, 0); c.stroke(); } c.restore(); });
  const ak = eOut(P(t, o.t + 1.3, o.t + 1.6));
  if (ak > 0) { c.save(); c.globalAlpha = ak; c.translate(540, 1170 + Math.sin(t * 7) * 10); font(c, 'Unb9', 46); c.fillStyle = C.oliveD; c.fillText('ПИШИ В КОММЕНТЫ', 0, 0); c.fillStyle = C.pink; c.beginPath(); c.moveTo(-40, 50); c.lineTo(40, 50); c.lineTo(0, 100); c.fill(); c.restore(); }
  const sk = eBack(P(t, o.t + 4.2, o.t + 4.5), 2);
  if (sk > 0) { const click = P(t, o.t + 5.0, o.t + 5.15), pressed = t > o.t + 5.1; c.save(); c.translate(540, 1420); const ss = sk * (1 - 0.08 * Math.sin(click * Math.PI)); c.scale(ss, ss); c.fillStyle = pressed ? C.olive : C.pink; R(c, -250, -62, 500, 124, 62); c.fill(); font(c, 'Unb9', 44); c.fillStyle = C.white; c.fillText(pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4); c.restore();
    const mv = eIO(P(t, o.t + 4.4, o.t + 5.0)); UI.tapCursor(c, lerp(840, 610, mv), lerp(1700, 1440, mv), 1, P(t, o.t + 5.05, o.t + 5.6));
    if (pressed) { c.fillStyle = C.gold; for (let i = 0; i < 10; i++) { const a = i / 10 * 6.28, r = 120 + 200 * P(t, o.t + 5.1, o.t + 5.6); c.globalAlpha = 1 - P(t, o.t + 5.1, o.t + 5.8); UI.star(c, 540 + Math.cos(a) * r * 1.6, 1420 + Math.sin(a) * r, 16, a); } c.globalAlpha = 1; } }
  const bx = lerp(-400, 1500, ((t * 0.15) % 1)); c.save(); c.translate(bx, 1915); c.scale(0.14, 0.14); bus(c, 0, 0, t); c.restore();
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
  const l = sc.id.toLowerCase();
  const lineIds = TL.speech.filter(x => x.id.startsWith(l + '_') && x.who !== 'nar' && x.who !== 'tip');
  const holdFor = sp => { if (sp.id === 'c2_her') return 0.0; if (sp.id === 'c2_x') return 1.4; const i = lineIds.indexOf(sp); const nx = lineIds[i + 1]; return nx ? Math.max(0.05, Math.min(0.9, nx.t - (sp.t + sp.d) - 0.25)) : 0.9; };
  for (const sp of lineIds) {
    const hd = heads[sp.who]; if (!hd) continue;
    if (sp.who === 'her') UI.bubble(c, { ...sp, hold: holdFor(sp) }, t, proj({ x: hd.x - 30, y: hd.y - hd.hh * 1.25 }), 'left');
    else UI.bubble(c, { ...sp, hold: holdFor(sp) }, t, proj({ x: hd.x + 30, y: hd.y - hd.hh * 1.25 }), 'right', NAMES[sp.who]);
  }
  if (sc.id === 'C2') {
    const a = endOf('c2_her') + 0.3, b = SP.c2_x.t - 0.1;
    if (t > a && t < b) { const dots = Math.min(3, Math.floor((t - a) / 0.55) + 1); c.save(); c.globalAlpha = clamp((t - a) / 0.2) * clamp((b - t) / 0.15); UI.font(c, 'Unb9', 150); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, '.'.repeat(dots).padEnd(3, ' '), 540, 1450, C.white, C.oliveD, 16); UI.font(c, 'Nun9', 40); UI.strokeText(c, '*мальчик думает*', 540, 1560, C.white, C.oliveD, 10); c.restore(); }
    // reveal arrow to the giant sign
    const rv = SP.c2_x ? P(t, endOf('c2_x') + 0.9, endOf('c2_x') + 1.2) : 0;
    if (rv > 0 && t < SP.c2_her2.t + 0.2) { c.save(); c.globalAlpha = clamp(rv * 2) * (1 - P(t, SP.c2_her2.t - 0.1, SP.c2_her2.t + 0.2)); c.translate(540, 900 + Math.sin(t * 9) * 12); UI.font(c, 'Unb9', 64); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, 'ВОТ ЖЕ ОН!', 0, 160, C.gold, C.oliveD, 14); c.fillStyle = C.gold; c.strokeStyle = C.oliveD; c.lineWidth = 8; c.beginPath(); c.moveTo(-40, 90); c.lineTo(40, 90); c.lineTo(40, 30); c.lineTo(80, 30); c.lineTo(0, -40); c.lineTo(-80, 30); c.lineTo(-40, 30); c.closePath(); c.fill(); c.stroke(); c.restore(); }
  }
  UI.card(c, t, sc); UI.captions(c, t); UI.sparkles(c, t);
  Hq.grain(c, W, HH, t, 0.04);
  UI.levelBar(c, t, sc, 1); UI.watermark(c); UI.levelIntro(c, t, sc); UI.levelIntroNext(c, t);
}
E.run('london', NF, renderFrame);
