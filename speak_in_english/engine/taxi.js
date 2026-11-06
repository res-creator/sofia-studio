// "Taxi: £45 for 10 minutes" (rubric «A1 vs C2», compact form, as halves) renderer, hard_cut camera: node taxi.js start end out.mp4 | --png=f1,f2
// London at night: a black cab at the kerb, George the cabbie in the driver's seat behind the open window (right), her on the pavement
// with a suitcase (left); the HOTEL neon sign 200 m behind. The taxi meter on the dashboard is the running prop: £45.00 and ticking,
// + £2 RECEIPT on B1 (a long receipt strip hangs out of the window), £10.00 after "Fair enough" (C1), £0.00 after her C2 speech.
// Inserts on solid backdrops: METER close-up, the cab window with Big Ben passing twice (A2), her phone: ride app £10 (C1), photo of the meter + licence (C2).
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/taxi/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C, LVCOL } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];

// ---------------- cast
const HER = { ...BASE.her_london, top: { type: 'hoodie', col: '#F7B6CF' }, scarf: undefined };
const CABBIE = { ...BASE.del, cap: { col: '#3A3F4B' }, top: { type: 'sweater', col: '#5A6A48' } };
const HX = -380, DX = 470, DY = -60, DS = 0.92, SEAT = 330;
const G = { her: geom(HER), cabbie: geom(CABBIE) };
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- the meter: value over time
const B1_EXTRA = ev('B1', 'meter') + 0.2, PAT = ev('B2', 'pat'), C1_FLIP = ev('C1', 'flip'), C2_FLIP = ev('C2', 'flip');
function fare(t) { if (t >= C2_FLIP) return 0; if (t >= C1_FLIP && t < SC.C2.s) return 10;   // levels are alternative answers: C2 starts again from the running meter
  return 45 + 0.1 * Math.floor(t / 2) + (t >= B1_EXTRA ? 2 : 0) + (t >= PAT ? 0.4 : 0); }
const money = v => '£' + v.toFixed(2);
// time of the last change of the displayed value (for the flip animation)
function lastChange(t) { const v = fare(t); let a = t; for (let k = 0; k < 60; k++) { if (a - 1 / FPS < 0) return -9; if (fare(a - 1 / FPS) !== v) return a; a -= 1 / FPS; } return -9; }
function led(c, txt, x, y, size, col = '#FF3B30', glow = 22) { c.save(); UI.font(c, 'Unb9', size); c.textAlign = 'center'; c.textBaseline = 'middle'; c.shadowColor = col; c.shadowBlur = glow; c.fillStyle = col; c.fillText(txt, x, y); c.shadowBlur = 0; c.restore(); }
// small meter on the dashboard (world, local origin = centre)
function meterSmall(c, x, y, t, sc = 1) { c.save(); c.translate(x, y); c.scale(sc, sc);
  c.fillStyle = '#0B0B0E'; rr(c, -92, -44, 184, 88, 12); c.fill(); c.strokeStyle = '#3A3F4B'; c.lineWidth = 5; c.stroke();
  c.fillStyle = '#1A0606'; rr(c, -80, -32, 160, 52, 8); c.fill();
  const v = fare(t), u = t - lastChange(t), sy = u < 0.12 ? Math.max(0.15, u / 0.12) : 1; c.save(); c.translate(0, -6); c.scale(1, sy); led(c, money(v), 0, 0, 40, v === 0 ? '#5BFF7A' : '#FF3B30', 14); c.restore();
  c.fillStyle = '#F2C14E'; UI.font(c, 'Unb9', 15); c.textAlign = 'center'; c.fillText('FARE', 0, 33); c.restore(); }
// full-screen METER close-up (insert on a solid backdrop)
function meterView(c, t) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, '#141A2C'); g.addColorStop(1, '#07090F'); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'meter' });
  const st = CAM_AT(t), k0 = eBack(clamp((t - st) / 0.25), 1.6), v = fare(t), u = t - lastChange(t);
  c.save(); c.translate(540, 930); c.rotate(-0.02); c.scale(lerp(0.9, 1, k0), lerp(0.9, 1, k0));
  c.fillStyle = 'rgba(0,0,0,.45)'; rr(c, -430 + 14, -300 + 20, 860, 600, 46); c.fill();
  c.fillStyle = '#16171C'; rr(c, -430, -300, 860, 600, 46); c.fill(); c.strokeStyle = '#4A505E'; c.lineWidth = 8; c.stroke();
  c.fillStyle = '#F2C14E'; rr(c, -150, -270, 300, 64, 20); c.fill(); fitTxt(c, 'TAXI METER', 0, -237, 34, '#16171C', 270);
  c.fillStyle = '#220707'; rr(c, -380, -180, 760, 240, 24); c.fill();
  c.fillStyle = 'rgba(255,59,48,.07)'; for (let x = -360; x < 370; x += 24) c.fillRect(x, -170, 3, 220);
  const sy = u < 0.14 ? Math.max(0.1, u / 0.14) : 1, pk = u < 0.5 ? 1 + 0.08 * Math.sin(u / 0.5 * Math.PI) : 1;
  c.save(); c.translate(0, -60); c.scale(pk, sy * pk); led(c, money(v), 0, 0, 190, v === 0 ? '#5BFF7A' : '#FF3B30', 40); c.restore();
  fitTxt(c, 'FARE', -300, 105, 34, '#9AA3B2', 200, 'Unb9', 'left');
  const ex = t >= B1_EXTRA && t < C1_FLIP; if (ex) { const e = eBack(clamp((t - B1_EXTRA) / 0.3), 2.2); c.save(); c.translate(0, 190); c.scale(e, e);
    c.fillStyle = '#F2C14E'; rr(c, -380, -48, 760, 96, 22); c.fill(); fitTxt(c, '+ £2.00  RECEIPT', 0, 2, 60, '#16171C', 700); c.restore(); }
  else { c.fillStyle = '#26282F'; rr(c, -380, 142, 760, 96, 22); c.fill(); fitTxt(c, v === 0 ? 'NO CHARGE' : 'EXTRAS  £0.00', 0, 192, 46, v === 0 ? '#5BFF7A' : '#6E7684', 700); }
  for (const [x, col] of [[-300, '#E0474C'], [-200, '#F2C14E'], [200, '#4CAF6A'], [300, '#9AA3B2']]) { c.fillStyle = col; c.beginPath(); c.arc(x, 262, 16, 0, TAU); c.fill(); }
  c.restore(); }

// ---------------- the cab window with Big Ben passing twice (A2 insert)
function bigBen(c, x, base, s) { c.save(); c.translate(x, base); c.scale(s, s);
  const st = '#C9A86A', sd = '#8A6A3A'; c.fillStyle = st; c.fillRect(-70, -900, 140, 900); c.fillStyle = sd; for (let y = -880; y < 0; y += 60) c.fillRect(-70, y, 140, 8);
  c.fillStyle = st; c.fillRect(-90, -1150, 180, 260); c.fillStyle = '#FFF4D0'; c.beginPath(); c.arc(0, -1030, 70, 0, TAU); c.fill(); c.strokeStyle = sd; c.lineWidth = 8; c.stroke();
  c.strokeStyle = '#2B2F3A'; c.lineWidth = 8; c.beginPath(); c.moveTo(0, -1030); c.lineTo(0, -1085); c.moveTo(0, -1030); c.lineTo(36, -1030); c.stroke();
  c.fillStyle = '#4A6A5A'; c.beginPath(); c.moveTo(-90, -1150); c.lineTo(0, -1420); c.lineTo(90, -1150); c.fill(); c.fillStyle = '#C9A13A'; c.fillRect(-6, -1480, 12, 70); c.restore(); }
function windowView(c, t) { if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'window' });
  c.fillStyle = '#0C0D12'; c.fillRect(0, 0, W, HH);
  const x0 = 90, y0 = 470, w = 900, h = 820, a = ev('A2', 'bigben');
  c.save(); rr(c, x0, y0, w, h, 60); c.clip();
  const g = c.createLinearGradient(0, y0, 0, y0 + h); g.addColorStop(0, '#13204A'); g.addColorStop(1, '#3A3060'); c.fillStyle = g; c.fillRect(x0, y0, w, h);
  c.fillStyle = 'rgba(255,255,255,.8)'; for (let i = 0; i < 30; i++) { c.beginPath(); c.arc(x0 + hash(i * 3) * w, y0 + hash(i * 7) * 360, 2 + hash(i) * 2, 0, TAU); c.fill(); }
  const sp = 1500, scroll = (t - a) * sp;
  for (let i = 0; i < 14; i++) { const bx = ((i * 230 - scroll * 0.35) % 3220 + 3220) % 3220 - 600, bh = 200 + hash(i * 5) * 260; c.fillStyle = '#1C2140'; c.fillRect(bx, y0 + h - bh, 210, bh); c.fillStyle = 'rgba(255,214,120,.55)'; for (let k = 0; k < 6; k++) c.fillRect(bx + 20 + (k % 3) * 64, y0 + h - bh + 40 + Math.floor(k / 3) * 70, 34, 40); }
  for (const p of [0, 0.68]) { const u = (t - a - p) / 0.62; if (u < -0.1 || u > 1.1) continue; bigBen(c, lerp(1500, -420, u), y0 + h + 30, 0.72); }
  c.fillStyle = 'rgba(255,214,120,.5)'; for (let i = 0; i < 8; i++) { const lx = ((i * 260 - scroll) % 2080 + 2080) % 2080 - 200; c.fillRect(lx, y0 + h - 70, 120, 10); }
  c.fillStyle = 'rgba(255,255,255,.06)'; c.beginPath(); c.moveTo(x0 + 120, y0); c.lineTo(x0 + 330, y0); c.lineTo(x0 + 80, y0 + h); c.lineTo(x0 - 130, y0 + h); c.fill();
  c.restore();
  c.strokeStyle = '#2A2C34'; c.lineWidth = 40; rr(c, x0, y0, w, h, 60); c.stroke(); c.strokeStyle = '#3A3D48'; c.lineWidth = 6; rr(c, x0 - 22, y0 - 22, w + 44, h + 44, 74); c.stroke();
  c.fillStyle = '#1A1C24'; rr(c, 60, y0 + h + 60, 960, 300, 30); c.fill(); c.fillStyle = '#2A2C34'; rr(c, 120, y0 + h + 110, 260, 36, 18); c.fill();
  const n = t > a + 0.68 + 0.25 ? 2 : t > a + 0.25 ? 1 : 0;
  if (n > 1) { const k = eBack(clamp((t - a - 0.93) / 0.25), 2.4); c.save(); c.translate(820, 400); c.rotate(0.08); c.scale(k, k); UI.font(c, 'Unb9', 130); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, '×' + n, 0, 0, C.gold, C.oliveD, 16); c.restore(); } }

// ---------------- phone screens (inserts and the small phone in her hand)
function appScreen(c, w, h) { c.fillStyle = '#F4F1EC'; c.fillRect(0, 0, w, h);
  c.fillStyle = '#DDE6D6'; c.fillRect(0, 60, w, 380); c.strokeStyle = '#FFFFFF'; c.lineWidth = 18; for (const [a, b, cc, d] of [[0, 150, w, 120], [0, 330, w, 360], [120, 60, 150, 440], [300, 60, 280, 440]]) { c.beginPath(); c.moveTo(a, b); c.lineTo(cc, d); c.stroke(); }
  c.strokeStyle = '#2F7DE1'; c.lineWidth = 10; c.beginPath(); c.moveTo(110, 300); c.lineTo(150, 250); c.lineTo(230, 230); c.stroke();
  c.fillStyle = '#2F7DE1'; c.beginPath(); c.arc(110, 300, 14, 0, TAU); c.fill(); c.fillStyle = '#E0474C'; c.beginPath(); c.arc(230, 230, 16, 0, TAU); c.fill();
  fitTxt(c, 'HOTEL', 260, 196, 26, '#2B2F3A', 140);
  c.fillStyle = '#2B2F3A'; c.fillRect(0, 0, w, 60); fitTxt(c, 'RIDE', w / 2, 32, 30, '#FFFFFF', 200);
  fitTxt(c, 'YOUR TRIP', 30, 480, 30, '#7A7F8C', 300, 'Unb9', 'left'); fitTxt(c, '0.2 miles · 3 min', 30, 525, 30, '#2B2F3A', 360, 'Nun9', 'left');
  c.fillStyle = '#4CAF6A'; rr(c, 24, 570, w - 48, 130, 26); c.fill(); fitTxt(c, 'FARE', 50, 605, 28, '#E8F6EA', 200, 'Unb9', 'left'); fitTxt(c, '£10.00', w / 2, 655, 74, '#FFFFFF', w - 90); }
function photoScreen(c, w, h, t) { c.fillStyle = '#111317'; c.fillRect(0, 0, w, h);
  c.save(); c.translate(w / 2, 220); c.scale(1.5, 1.5); meterSmall(c, 0, 0, 0.5); c.restore();
  c.fillStyle = '#E9E2C8'; rr(c, 34, 380, w - 68, 200, 18); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 4; c.stroke();
  c.fillStyle = '#9AA3B2'; rr(c, 56, 404, 100, 130, 10); c.fill(); c.fillStyle = '#EBB896'; c.beginPath(); c.arc(106, 450, 28, 0, TAU); c.fill(); c.fillStyle = '#3A3F4B'; c.fillRect(70, 414, 72, 18);
  fitTxt(c, 'LICENCE No.', 170, 430, 28, '#2B2F3A', 210, 'Unb9', 'left'); fitTxt(c, '48213', 170, 488, 54, '#C8102E', 210, 'Unb9', 'left'); fitTxt(c, 'LONDON TAXI', 170, 540, 22, '#5A6A48', 210, 'Unb9', 'left');
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(w / 2, h - 50, 32, 0, TAU); c.fill(); c.strokeStyle = '#111317'; c.lineWidth = 6; c.beginPath(); c.arc(w / 2, h - 50, 25, 0, TAU); c.stroke();
  fitTxt(c, 'SAVED  2 PHOTOS', w / 2, 618, 28, '#5BFF7A', w - 60);
  const f = t - ev('C2', 'photo') - 0.1; if (f > 0 && f < 0.3) { c.fillStyle = `rgba(255,255,255,${0.9 * (1 - f / 0.3)})`; c.fillRect(0, 0, w, h); } }
function phoneView(c, t, which) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, '#1C2440'); g.addColorStop(1, '#0B0F1C'); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: which });
  const st = CAM_AT(t), k0 = eBack(clamp((t - st) / 0.25), 1.6);
  K.phone(c, 540, 1085, 0.9 * lerp(0.9, 1, k0), (cc, w, h) => which === 'app' ? appScreen(cc, w, h) : photoScreen(cc, w, h, t), -0.03); }
const phoneItem = which => ctx => { ctx.save(); ctx.rotate(-0.1); ctx.translate(-10, -70); ctx.fillStyle = '#2B2F3A'; rr(ctx, -46, -80, 92, 160, 14); ctx.fill(); ctx.fillStyle = which === 'app' ? '#4CAF6A' : '#16171C'; rr(ctx, -38, -70, 76, 140, 8); ctx.fill();
  if (which === 'app') { ctx.fillStyle = '#FFFFFF'; UI.font(ctx, 'Unb9', 22); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('£10', 0, 0); } else { ctx.fillStyle = '#FF3B30'; UI.font(ctx, 'Unb9', 18); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('£45', 0, -20); ctx.fillStyle = '#E9E2C8'; ctx.fillRect(-30, 14, 60, 34); }
  ctx.restore(); };

// ---------------- London street at night (prerendered, softly blurred)
const BX0 = -3200, BY0 = -3800, BW = 6400, BH = 5600, BS = 0.5;
const HOTEL = { x: -500, y0: -2190, y1: -1600 };
function drawStreet(c) {
  const g = c.createLinearGradient(0, BY0, 0, -700); g.addColorStop(0, '#0B1230'); g.addColorStop(1, '#2A3366'); c.fillStyle = g; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = 'rgba(255,255,255,.75)'; for (let i = 0; i < 90; i++) { c.beginPath(); c.arc(BX0 + hash(i * 3 + 1) * BW, BY0 + hash(i * 7 + 2) * 1500, 3 + hash(i) * 4, 0, TAU); c.fill(); }
  c.fillStyle = '#F4EED6'; c.beginPath(); c.arc(1500, -3050, 120, 0, TAU); c.fill(); c.fillStyle = '#2A3366'; c.beginPath(); c.arc(1450, -3080, 105, 0, TAU); c.fill();
  // far terraces (other side of the road)
  for (let i = 0; i < 26; i++) { const bx = BX0 + i * 250, bh = 900 + hash(i * 11) * 900, bw = 250; c.fillStyle = i % 2 ? '#1A1F3E' : '#20264A'; c.fillRect(bx, -700 - bh, bw, bh);
    c.fillStyle = '#151A34'; c.beginPath(); c.moveTo(bx - 10, -700 - bh); c.lineTo(bx + bw / 2, -760 - bh - 60); c.lineTo(bx + bw + 10, -700 - bh); c.fill();
    for (let r = 0; r < Math.floor(bh / 170); r++) for (let k = 0; k < 2; k++) { const lit = hash(i * 31 + r * 7 + k) > 0.45; c.fillStyle = lit ? 'rgba(255,208,120,.75)' : 'rgba(80,90,140,.5)'; c.fillRect(bx + 40 + k * 100, -700 - bh + 60 + r * 170, 64, 96); } }
  // the hotel tower 200 m away: neon HOTEL sign (vertical)
  c.fillStyle = '#2C2450'; c.fillRect(HOTEL.x - 330, -2600, 560, 1900); c.fillStyle = '#231C44'; c.fillRect(HOTEL.x - 330, -2640, 560, 60);
  for (let r = 0; r < 10; r++) for (let k = 0; k < 3; k++) { c.fillStyle = hash(r * 9 + k * 4 + 77) > 0.35 ? 'rgba(255,214,140,.85)' : 'rgba(90,90,150,.5)'; c.fillRect(HOTEL.x - 290 + k * 90 + (k > 0 ? 180 : 0) - (k > 0 ? 90 : 0), -2540 + r * 180, 56, 90); }
  c.fillStyle = 'rgba(255,90,160,.18)'; c.fillRect(HOTEL.x - 120, HOTEL.y0 - 60, 240, HOTEL.y1 - HOTEL.y0 + 120);
  c.fillStyle = '#3A1030'; rr(c, HOTEL.x - 78, HOTEL.y0, 156, HOTEL.y1 - HOTEL.y0, 20); c.fill(); c.strokeStyle = '#FF5FA8'; c.lineWidth = 8; rr(c, HOTEL.x - 78, HOTEL.y0, 156, HOTEL.y1 - HOTEL.y0, 20); c.stroke();
  c.save(); c.shadowColor = '#FF5FA8'; c.shadowBlur = 30; c.fillStyle = '#FFD2E8'; UI.font(c, 'Unb9', 92); c.textAlign = 'center'; c.textBaseline = 'middle'; 'HOTEL'.split('').forEach((ch, i) => c.fillText(ch, HOTEL.x, HOTEL.y0 + 64 + i * 116)); c.restore();
  c.fillStyle = '#FFE8A0'; c.fillRect(HOTEL.x - 200, -900, 400, 40); c.fillStyle = 'rgba(255,214,140,.35)'; c.fillRect(HOTEL.x - 200, -860, 400, 160);
  // road + wet reflections
  c.fillStyle = '#23252E'; c.fillRect(BX0, -700, BW, 660); c.fillStyle = 'rgba(255,214,140,.10)'; for (let i = 0; i < 40; i++) c.fillRect(BX0 + hash(i * 13) * BW, -680 + hash(i * 5) * 600, 30 + hash(i) * 80, 8);
  c.fillStyle = '#E9E2C8'; for (let x = BX0; x < BX0 + BW; x += 420) c.fillRect(x, -420, 200, 14);
  // street lamps
  for (const lx of [-2500, -1500, 1700, 2800]) { c.fillStyle = '#14161E'; c.fillRect(lx - 14, -2300, 28, 2260); c.fillRect(lx - 14, -2300, 120, 24);
    const gl = c.createRadialGradient(lx + 100, -2260, 10, lx + 100, -2260, 420); gl.addColorStop(0, 'rgba(255,214,140,.55)'); gl.addColorStop(1, 'rgba(255,214,140,0)'); c.fillStyle = gl; c.fillRect(lx - 330, -2690, 860, 860); c.fillStyle = '#FFE8A0'; c.beginPath(); c.arc(lx + 100, -2260, 26, 0, TAU); c.fill(); }
  // kerb + pavement (her side)
  c.fillStyle = '#8A8C94'; c.fillRect(BX0, -60, BW, 50); c.fillStyle = '#6E7078'; c.fillRect(BX0, -14, BW, 14);
  c.fillStyle = '#5E6170'; c.fillRect(BX0, 0, BW, BH + BY0); c.strokeStyle = 'rgba(0,0,0,.22)'; c.lineWidth = 6; for (let x = BX0; x < BX0 + BW; x += 300) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x - 200, 1800); c.stroke(); }
  for (let y = 180; y < 1800; y += 260) { c.beginPath(); c.moveTo(BX0, y); c.lineTo(BX0 + BW, y); c.stroke(); }
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.2px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawStreet);

// ---------------- the black cab (side view, front to the LEFT; the driver's window is open)
const WIN = { x0: 120, x1: 760, y0: -1400, y1: -840 }, MTR = { x: 250, y: -930 };
function cabInterior(c) { c.fillStyle = '#101219'; c.fillRect(WIN.x0 - 40, WIN.y0 - 20, 1250, WIN.y1 - WIN.y0 + 80);
  c.fillStyle = '#2A2C34'; rr(c, 620, -1260, 200, 520, 40); c.fill(); c.fillStyle = '#34363F'; rr(c, 650, -1380, 150, 130, 30); c.fill();   // driver seat + headrest
  c.fillStyle = '#1C1E26'; c.fillRect(WIN.x0, -1010, 260, 170); }
function cabBody(c, t, L) {
  const body = '#23252F', hi = '#3A3E50';
  c.save(); c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(500, -40, 1400, 50, 0, 0, TAU); c.fill();
  c.beginPath();   // body outline (clockwise) with the window holes (even-odd)
  c.moveTo(-780, -260); c.lineTo(-780, -620); c.quadraticCurveTo(-770, -760, -560, -780); c.lineTo(-90, -800); c.quadraticCurveTo(60, -1380, 160, -1440); c.lineTo(1600, -1450);
  c.quadraticCurveTo(1760, -1440, 1790, -1200); c.lineTo(1810, -620); c.quadraticCurveTo(1810, -280, 1760, -200); c.lineTo(-740, -200); c.quadraticCurveTo(-780, -210, -780, -260); c.closePath();
  c.roundRect(WIN.x0, WIN.y0, WIN.x1 - WIN.x0, WIN.y1 - WIN.y0, 30);   // open driver's window (hole)
  c.fillStyle = body; c.fill('evenodd');
  c.strokeStyle = '#6A7290'; c.lineWidth = 10; c.stroke(); c.strokeStyle = '#000'; c.lineWidth = 4; c.stroke();
  c.fillStyle = hi; c.fillRect(-760, -600, 2560, 14); c.fillStyle = 'rgba(255,255,255,.06)'; c.fillRect(-700, -760, 2400, 60);
  // windscreen (glass), rear windows (tinted glass)
  c.fillStyle = 'rgba(120,150,200,.28)'; c.beginPath(); c.moveTo(-60, -820); c.quadraticCurveTo(60, -1340, 100, -1400); c.lineTo(100, -840); c.closePath(); c.fill();
  c.fillStyle = '#2B3550'; rr(c, 810, -1400, 520, 560, 30); c.fill(); rr(c, 1370, -1390, 330, 520, 30); c.fill(); c.fillStyle = 'rgba(255,255,255,.10)'; c.beginPath(); c.moveTo(860, -1400); c.lineTo(980, -1400); c.lineTo(880, -840); c.lineTo(810, -840); c.fill();
  c.strokeStyle = '#000'; c.lineWidth = 6; c.beginPath(); c.moveTo(785, -1440); c.lineTo(785, -210); c.moveTo(1350, -1440); c.lineTo(1350, -210); c.stroke();   // door lines
  c.fillStyle = '#9AA3B2'; rr(c, 660, -760, 90, 20, 8); c.fill(); rr(c, 1230, -760, 90, 20, 8); c.fill();   // handles
  // roof TAXI light (lit)
  c.save(); c.shadowColor = '#FFC02A'; c.shadowBlur = 40; c.fillStyle = '#FFC02A'; rr(c, 560, -1530, 260, 86, 18); c.fill(); c.restore(); fitTxt(c, 'TAXI', 690, -1486, 56, '#15161B', 220);
  // headlight + bumper + wheels
  c.fillStyle = '#FFF4C0'; c.beginPath(); c.ellipse(-760, -560, 26, 60, 0, 0, TAU); c.fill(); const hl = c.createRadialGradient(-780, -560, 10, -780, -560, 300); hl.addColorStop(0, 'rgba(255,240,180,.5)'); hl.addColorStop(1, 'rgba(255,240,180,0)'); c.fillStyle = hl; c.fillRect(-1080, -860, 600, 600);
  c.fillStyle = '#C9CED6'; rr(c, -800, -320, 260, 60, 20); c.fill(); rr(c, 1640, -320, 200, 60, 20); c.fill();
  c.fillStyle = '#E9E2C8'; rr(c, 1680, -560, 110, 70, 10); c.fill(); fitTxt(c, '48213', 1735, -525, 30, '#2B2F3A', 100);
  for (const wx of [-420, 1400]) { c.fillStyle = '#0A0A0C'; c.beginPath(); c.arc(wx, -230, 220, Math.PI, TAU); c.fill(); c.fillStyle = '#1C1D22'; c.beginPath(); c.arc(wx, -200, 190, 0, TAU); c.fill(); c.fillStyle = '#9AA3B2'; c.beginPath(); c.arc(wx, -200, 90, 0, TAU); c.fill(); c.fillStyle = '#5A606C'; c.beginPath(); c.arc(wx, -200, 40, 0, TAU); c.fill(); }
  c.restore(); }
// steering wheel + the meter (in front of the driver) + the receipt strip (B1) hanging out of the window over the door
const PRINT = ev('B1', 'print');
function dashFront(c, t) {
  c.save(); c.translate(250, -1050); c.rotate(-0.3); c.strokeStyle = '#0A0A0C'; c.lineWidth = 26; c.beginPath(); c.ellipse(0, 0, 40, 150, 0, 0, TAU); c.stroke(); c.restore();
  meterSmall(c, MTR.x, MTR.y, t, 1.4);
  if (t > PRINT) { const L = 560 * eOut(clamp((t - PRINT) / 1.2)), sw = Math.sin(t * 2.3) * 14; c.save(); c.translate(MTR.x - 50, MTR.y + 60);
    c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(-26, 8, 66, L); c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(-34, 0); c.lineTo(34, 0); c.quadraticCurveTo(34 + sw, L * 0.5, 34 + sw * 1.6, L); for (let k = 0; k <= 6; k++) c.lineTo(34 + sw * 1.6 - k * 11.3, L + (k % 2 ? 8 : 0)); c.quadraticCurveTo(-34 + sw, L * 0.5, -34, 0); c.fill();
    c.fillStyle = 'rgba(60,60,70,.45)'; for (let y = 24; y < L - 10; y += 22) c.fillRect(-24 + sw * y / L * 1.4, y, 26 + ((y / 22) % 3) * 9, 5); c.restore(); }
  K.mark(c, 'meter', MTR.x, MTR.y, 100); }
function suitcase(c, x) { c.save(); c.translate(x, 0); c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(0, 4, 150, 22, 0, 0, TAU); c.fill();
  paint(c, q => { q.m(-120, -20); q.l(120, -20); q.l(120, -560); q.l(-120, -560); q.z(); }, '#3FA7A0', { sd: 6, hd: 3, lw: 5 });
  c.fillStyle = 'rgba(0,0,0,.15)'; for (const xx of [-60, 0, 60]) c.fillRect(xx - 6, -540, 12, 500);
  c.fillStyle = '#2B2F3A'; c.fillRect(-70, -760, 16, 200); c.fillRect(54, -760, 16, 200); rr(c, -80, -790, 160, 40, 16); c.fill();
  c.fillStyle = '#F2C14E'; rr(c, -60, -420, 120, 80, 10); c.fill(); c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(-80, -10, 16, 0, TAU); c.arc(80, -10, 16, 0, TAU); c.fill(); c.restore(); }

// ---------------- characters
const gest = (st, g, who, t, side, base) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20, { planar: true }); } };
const hang = (g, s) => reach(g, s, s * g.sw * 0.8, g.ySh + 330);
const frac = (id, t) => (t - SP[id].t) / SP[id].d;
// cabbie local coordinates: world = (DX, DY) + local * DS, with the seated drop SEAT inside the local frame
const toCab = (g, s, wx, wy, o = { planar: true }) => reach(G.cabbie, s, (wx - DX) / DS, (wy - DY) / DS - SEAT, o);
const sill = s => toCab(G.cabbie, s, WIN.x0 + 70, WIN.y1 - 30);
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { t, talk: talk('her', t), mood: 'annoyed', turn: 0.35, look: 0.8, armL: hang(g, -1), armR: hang(g, 1), items: {} };
  const phoneUp = (which) => { st.armR = reach(g, 1, g.sw * 1.55, g.ySh - 40, { planar: true }); st.items = { R: phoneItem(which) }; };
  if (L === 'hook') { st.mood = 'shock'; st.blink = 0; st.look = 0.8; st.lookY = 0.15; if (t > hev('stun')) { st.look = 0.9; } if (t > hev('hotel') - 0.1 && t < hev('back')) { st.mood = 'annoyed'; st.look = -0.9; st.turn = -0.2; } if (t > hev('back')) { st.mood = 'annoyed'; } }
  if (L === 'A1') { st.mood = 'annoyed'; if (speaking('a1_h', t, 0.05, 0.2)) { st.mood = 'shock'; const f = frac('a1_h', t);
      if (f < 0.6) { st.armL = reach(g, -1, -g.sw * 2.2, g.ySh - 70 + Math.sin(t * 9) * 12, { planar: true }); st.look = -0.4; } else st.armR = reach(g, 1, g.sw * 1.7, g.ySh + 100, { planar: true }); }
    if (t > e('point')) { st.mood = 'skeptical'; st.look = 0.9; } if (t > e('meter')) { st.mood = 'shock'; st.blink = 0; } }
  if (L === 'A2') { st.mood = 'annoyed'; if (speaking('a2_h', t, 0.05, 0.2)) gest(st, g, 'her', t, 1, 160); if (t > SP.a2_d.t + 0.3) { st.mood = 'skeptical'; } }
  if (L === 'B1') { st.mood = 'happy'; if (speaking('b1_h', t, 0.05, 0.2)) { gest(st, g, 'her', t, 1, 160); st.armR = reach(g, 1, g.sw * 1.9, g.ySh + 140, { planar: true }); } if (t > SP.b1_d.t + 0.8) { st.mood = 'shock'; st.blink = 0; st.lookY = 0.3; } }
  if (L === 'B2') { st.mood = 'skeptical'; if (speaking('b2_h', t, 0.05, 0.2)) { st.mood = 'skeptical'; st.armR = reach(g, 1, g.sw * 1.6, g.ySh + 230, { planar: true }); st.armL = reach(g, -1, -g.sw * 1.6, g.ySh + 230, { planar: true }); } if (t > SP.b2_d.t + 0.3) { st.mood = 'shock'; st.blink = 0; } }
  if (L === 'C1') { st.mood = 'neutral'; if (t > SP.c1_h.t - 0.1 && t < e('nod') + 0.4) { st.mood = 'happy'; phoneUp('app'); } if (t > e('nod')) { st.mood = 'happy'; st.look = 0.8; } }
  if (L === 'C2') { st.mood = 'smug'; st.turn = 0.25; st.look = 0.6;
    if (t > SP.c2_h.t - 0.1 && t < endOf('c2_h') + 0.6) phoneUp('photo');
    if (t > endOf('c2_h') + 0.6) { st.mood = 'smug'; st.blink = 1; }
    if (t > SP.c2_d.t) { st.mood = 'happy'; st.blink = 0; st.look = 0.9; } }
  return st; }
function cabState(t, L) { const g = G.cabbie, e = k => ev(L, k), st = { t, talk: talk('cabbie', t), mood: 'smug', turn: -0.35, look: -0.8, legPose: 'sit', drop: SEAT, legs: false, armL: sill(-1), armR: toCab(g, 1, 330, -900), items: {} };
  if (L === 'hook') { st.mood = 'happy'; st.armL = toCab(g, -1, WIN.x0 + 40, -1000 + Math.sin(t * 3) * 6); if (t > hev('stun')) { st.mood = 'smug'; st.blink = 1; } }
  if (L === 'A1') { st.mood = 'smug'; if (speaking('a1_h', t, 0.05, 0.2)) { st.mood = 'surprised'; }
    if (speaking('a1_d', t, 0.05, 0.1)) { st.mood = 'happy'; st.headY = frac('a1_d', t) < 0.25 ? Math.abs(Math.sin((t - SP.a1_d.t) * 9)) * 14 : 0; }
    if (t > e('point') - 0.1) { st.mood = 'happy'; st.blink = t > endOf('a1_d') ? 1 : 0; st.armL = toCab(g, -1, WIN.x0 + 30, -1230); } }
  if (L === 'A2') { st.mood = 'smug'; if (speaking('a2_h', t, 0.05, 0.2)) st.mood = 'surprised'; if (speaking('a2_d', t, 0.05, 0.3)) { st.mood = 'happy'; st.lookY = -0.3; st.armL = toCab(g, -1, WIN.x0 + 40, -1180 + Math.sin(t * 6) * 20); } }
  if (L === 'B1') { st.mood = 'neutral'; if (speaking('b1_h', t, 0.05, 0.2)) st.mood = 'surprised'; if (speaking('b1_d', t, 0.05, 0.2)) { st.mood = 'happy'; st.blink = frac('b1_d', t) > 0.4 ? 1 : 0; }
    if (t > e('print') - 0.2) { st.armL = toCab(g, -1, MTR.x + 60, MTR.y - 10); st.mood = 'happy'; } if (t > endOf('b1_d') + 0.2) st.mood = 'smug'; }
  if (L === 'B2') { st.mood = 'neutral'; if (speaking('b2_h', t, 0.05, 0.2)) { st.mood = 'surprised'; }
    if (speaking('b2_d', t, 0.05, 0.2)) { st.mood = 'happy'; st.headY = Math.abs(Math.sin((t - SP.b2_d.t) * 8)) * 12; }
    if (t > e('pat') - 0.1 && t < e('pat') + 1.2) { const u = t - e('pat'); st.mood = 'happy'; st.blink = 1; st.armL = toCab(g, -1, MTR.x + 40, MTR.y - 50 - Math.abs(Math.sin(u * 9)) * 40); } }
  if (L === 'C1') { st.mood = 'neutral'; if (speaking('c1_h', t, 0.05, 0.2)) { st.mood = 'worried'; st.look = -0.9; }
    if (t > e('nod')) { const u = t - e('nod'); st.mood = 'sad'; st.blink = 0; st.look = -0.6; st.lookY = 0.3; st.headY = u < 0.9 ? Math.abs(Math.sin(u * 7)) * 26 : 18; st.armL = sill(-1); } }
  if (L === 'C2') { st.mood = 'smug'; if (speaking('c2_h', t, 0.05, 0.1)) { const f = frac('c2_h', t); st.mood = f < 0.3 ? 'smug' : f < 0.65 ? 'surprised' : 'worried'; st.look = -0.9; }
    if (t > endOf('c2_h')) { st.mood = 'shock'; st.blink = 0; st.look = -0.7; }
    if (t > e('meter') - 0.1) { st.armL = toCab(g, -1, MTR.x + 50, MTR.y - 30); }
    if (t > SP.c2_d.t - 0.15) { st.mood = 'worried'; st.look = -0.8; st.lookY = 0; const u = t - SP.c2_d.t; st.armL = toCab(g, -1, WIN.x0 + 50, -1160 + Math.sin(u * 10) * 22); }
    if (t > endOf('c2_d') + 0.1) { st.mood = 'happy'; st.blink = 0; } }
  return st; }

// ---------------- the world + which characters a shot draws (clean singles: only the tagged character)
const DRAW = { hotel: [], wide: ['her', 'cabbie'], card: ['her', 'cabbie'], two: ['her', 'cabbie'], cover: ['her', 'cabbie'], her: ['her'], cabbie: ['cabbie'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGR, BX0, BY0, BW, BH);
  cabInterior(c);
  if (who.includes('cabbie')) heads.cabbie = K.put(c, CABBIE, cabState(t, L), DX, DY, DS);
  cabBody(c, t, L); dashFront(c, t);
  suitcase(c, HX - 290);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), HX, 0);
  K.mark(c, 'hotel', HOTEL.x, (HOTEL.y0 + HOTEL.y1) / 2, 200);
  if (!heads.cabbie) heads.cabbie = OFF; if (!heads.her) heads.her = OFFL;
  return heads; }

// ---------------- shots (world coordinates; face of a single at ~900 px)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const hHY = G.her.headY, dHY = DY + (G.cabbie.headY + SEAT) * DS;
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(80, fy(hHY, 0.72, 1250), 0.72, 'cover'), WIDE: S(160, -1380, 0.5, 'wide'), CARD: S(60, -1430, 0.6, 'card'), TWO: S(60, fy(hHY, 0.72, 1020), 0.72, 'two'),
  HOTEL: S(-470, -1900, 0.85, 'hotel'),
  HER: S(HX - 10, fy(hHY, 1.0), 1.0, 'her'), HER_CU: S(HX - 10, fy(hHY, 1.3, 960), 1.3, 'her'),
  CAB: S(DX - 60, fy(dHY, 1.0), 1.0, 'cabbie'), CAB_CU: S(DX - 50, fy(dHY, 1.3, 900), 1.3, 'cabbie'),
  METER: U('meter', 1), WINDOW: U('window', 2), APP: U('app', 3), PHOTO: U('photo', 4) };
const C2Z = [SH.PHOTO, S(HX + 10, fy(hHY, 1.15, 900), 1.15, 'her'), S(HX + 10, fy(hHY, 1.35, 900), 1.35, 'her')];
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  const sp = id => speaking(id, t, 0.1, 0.15);
  if (L === 'hook') { if (t < endOf('hook_d') + 0.25) return SH.COVER; if (t < hev('meter')) return f(SH.HER_CU); if (t < hev('hotel')) return f(SH.METER); if (t < hev('back')) return f(SH.HOTEL); return f(SH.TWO); }
  const u = t - sc.s, l = L.toLowerCase(), nar = SP[l + '_nar'];
  if (u < 0.6) return f(SH.WIDE);
  if (nar && t >= nar.t - 0.1) return f(SH.CARD);
  if ((L === 'A1' || L === 'B1') && t > e('meter') - 0.05) return f(SH.METER);
  if (L === 'A1' && t > e('point') - 0.2) return f(SH.TWO);
  if (L === 'A2' && t > e('bigben') - 0.05) return f(SH.WINDOW);
  if (L === 'B1' && t > e('print') - 0.2) return f(SH.TWO);
  if (L === 'C1') { if (t > e('flip') - 0.05) return f(SH.METER); if (t > e('app') - 0.05 && t < e('app') + 1.9) return f(SH.APP); }
  if (L === 'C2') { if (sp('c2_h')) { const ch = (TL.cfg.chunks || {}).c2_h, p = SP.c2_h, w = p.words || [], cnt = ch.map(([en]) => en.trim().split(/\s+/).length), tot = cnt.reduce((a, b) => a + b, 0); let wi = 0, i = 0;
      ch.forEach((q, k) => { const a = w.length === tot ? p.t + w[wi][1] : p.t + p.d * k / ch.length; if (t >= a - 0.05) i = k; wi += cnt[k]; }); return f(C2Z[i] || SH.HER); }
    if (t < endOf('c2_h') + 0.25) return f(C2Z[2]);
    if (t < e('meter') - 0.05) return f(SH.CAB);
    if (t < SP.c2_d.t - 0.1) return f(SH.METER);
    if (t < endOf('c2_d') + 0.25) return f(SH.CAB_CU);
    return f(SH.TWO); }
  const cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.1 && t < s.t + s.d + 0.25);
  const single = who => who === 'her' ? SH.HER : SH.CAB;
  if (cur) return f(single(cur.who));
  const next = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.6 && t < s.t);
  if (next) return f(single(next.who));
  return SH.TWO; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
function CAM_AT(t) { let fr = Math.min(CAM.length - 1, Math.round(t * FPS)); const tag = CAM[fr].tag; while (fr > 0 && CAM[fr - 1].tag === tag) fr--; return fr / FPS; }
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- overlays
function title(c, t) { const lines = TL.cfg.hook_title, a = 1 - clamp((t - 2.3) / 0.2); if (a <= 0) return; const rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 450); c.rotate(-0.05); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -175 + 14, 980, 350, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -175, 980, 350, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 74, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -112);
  UI.textFit(c, 'Unb9', 150, lines[1][0], 900); UI.strokeText(c, lines[1][0], 0, 4, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 66, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 122); c.restore();
  if (global.__QA) global.__QA.ui(c, 'title', { x: 50, y: 275, w: 980, h: 350, k: a, id: 'title' }); }
function miniIntro(c, t, sc) { const u = t - sc.s; if (u > 0.5 || u < 0) return; const L = sc.id, i = UI.LV.indexOf(L); if (i < 0) return;
  const pw = 128, gap = 14, x0 = (W - (6 * pw + 5 * gap)) / 2, px = x0 + i * (pw + gap) + pw / 2, py = 253;
  const k = eIO(P(u, 0.05, 0.45)), cx = lerp(540, px, k), cy = lerp(960, py, k), R = lerp(330, 34, k);
  c.save(); c.globalAlpha = 1 - P(u, 0.4, 0.5); c.fillStyle = LVCOL[L]; c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 8; c.stroke();
  c.translate(cx, cy); const s = lerp(1, 0.2, k); c.scale(s, s); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.font(c, 'Unb9', 230); UI.strokeText(c, L, 0, 10, C.white, C.oliveD, 18); c.restore(); }
function hud(c, t, sc) { UI.card(c, t, sc); UI.captions(c, t); UI.sparkles(c, t); Hq.grain(c, W, HH, t, 0.04); UI.levelBar(c, t, sc, 1); UI.watermark(c); miniIntro(c, t, sc); UI.levelIntroNext(c, t); }
function liveHeads(heads, proj, t) { const out = { ...heads };
  for (const who of Object.keys(out)) { const q = proj(out[who]); if (q.x >= 0 && q.x <= W) continue; const live = TL.speech.some(s => s.who === who && t >= s.t - 0.1 && t < s.t + s.d); if (!live) delete out[who]; }
  return out; }
const names = { cabbie: ['GEORGE', '#2F3E5C'] };
const HOLD = { hook_d: 0.05, a1_h: 0.05, a1_d: 0.05, a2_h: 0.05, a2_d: 0.05, b1_h: 0.05, b1_d: 0.05, b2_h: 0.05, b2_d: 0.05, c1_h: 0.05, c1_d: 0.05, c2_h: 0.05, c2_d: 0.1 };
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { const rows = [['A1', 'No! Hotel there! Close!'], ['A2', 'Why did you take the long way?'], ['B2', 'Are you taking me for a ride?'], ['C1', 'Could we settle on that?']];
    K.outro(c, t, { q: ['ТЕБЯ ОБМАНЫВАЛ', 'ТАКСИСТ?'], qSize: 54, rows, cta: ['ОТПРАВЬ ПОДРУГЕ', 'ПЕРЕД ПОЕЗДКОЙ'], heroX: 95, heroS: 0.34, heroY: [2350, 1985], ctaFit: true,
      hero: (cc, tt) => { const g = G.her, gd = G.cabbie;
        K.put(cc, CABBIE, { t: tt, mood: 'worried', turn: -0.2, look: -0.4, talk: 0, armL: reach(gd, -1, -gd.sw * 1.25, gd.ySh + 200 + Math.sin(tt * 6) * 15, { planar: true }), armR: reach(gd, 1, gd.sw * 1.25, gd.ySh + 200 + Math.sin(tt * 6 + 1) * 15, { planar: true }) }, 600, 0, 0.88);
        cc.save(); cc.translate(600, gd.headY * 0.88 - gd.hh * 1.5); cc.scale(1.5, 1.5); meterSmall(cc, 0, 0, C2_FLIP + 1); cc.restore();
        K.put(cc, HER, { t: tt, mood: 'happy', laugh: true, turn: 0.2, look: 0.3, armL: hang(g, -1), armR: reach(g, 1, g.sw * 1.55, g.ySh - 40, { planar: true }), items: { R: phoneItem('photo') } }, 0, 0); } });
    const u = t - SC.outro.s, kk = P(u, 1.35, 1.7); if (kk > 0) { const bh = 140 + rows.length * 115, y = 740 - bh / 2 + 150; UI.textFit(c, 'Nun9', 46, rows[0][1], 740); const wd = c.measureText(rows[0][1]).width;
      c.save(); c.globalAlpha = 0.55 * kk; c.fillStyle = C.white; c.fillRect(214, y - 34, wd + 16, 68); c.restore(); c.strokeStyle = C.red; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(212, y + 2); c.lineTo(212 + (wd + 16) * eOut(kk), y + 2); c.stroke(); }
    Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag.startsWith('ui:')) { const n = tag.slice(3); if (n === 'meter') meterView(c, t); else if (n === 'window') windowView(c, t); else phoneView(c, t, n);
    heads = { her: OFFL, cabbie: OFF }; proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26); }
  heads = liveHeads(heads, proj, t);
  if (L === 'hook') { title(c, t);
    K.bubbles(c, t, { id: 'hook' }, heads, proj, { cleanChunks: true, names, hold: HOLD }); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); UI.captions(c, t);
    Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.watermark(c); UI.levelIntroNext(c, t); return; }
  K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names, hold: HOLD });
  hud(c, t, sc);
}
E.run('taxi', NF, renderFrame);
