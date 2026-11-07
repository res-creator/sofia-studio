// "Сосед по квартире съел мой торт" — rubric «Как ответить, когда…» (scene + 4 answers, worst -> best), hard_cut camera: node cake.js start end out.mp4 | --png=f1,f2
// A shared flat kitchen: the heroine (pink jumper) on the left, flatmate Tom (blue sweater) by the OPEN fridge on the right, holding the EMPTY cake
// plate (pink icing smears, crumbs) and a fork, crumbs on his chin. A pizza box sits on top of the fridge, a wall calendar between them, a smoke alarm.
// hook: insert of the empty plate on «Весь.»; Tom shuts the fridge on «Четыре ответа».
// o1 «В ЛОБ»: "Because it was delicious. Thank you!" — he pats his belly and hands her the empty plate; she facepalms (hand in front of the forehead).
// o2 «ВЕЖЛИВО»: "Can I eat your pizza, then?" — he eyes the pizza box; insert: the lid lifts, his fork sneaks in, her hands slam it; she hugs the box.
// o3 «КАК НОСИТЕЛЬ»: sheepish, he writes sticky notes and slaps them on the fridge (insert: ASK FIRST! / I OWE YOU A CAKE – TOM); tip.
// o4 «КОРОЛЕВСКИЙ ОТВЕТ»: the grand line; on "Tomorrow." insert of the wall calendar TOMORROW: MY BIRTHDAY; he sweats and drops the fork.
// Twist (next day): smoke alarm blinking, Tom brings a burnt black cake with candles and smoke: "I used your flour..."; she looks into the camera,
// blows the candles -> a black puff, alarm; moral: she slaps a MINE! label on the fridge. End screen 1/2/3/4.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/cake/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
// handovers: a negative per-line hold (bubble gone BEFORE the line ends) — ui_v2 clamps hold to >= 0.05, so shorten the bubble's span instead
{ const _bub = UI.bubble; UI.bubble = (ctx, sp, t, an, side, name) => _bub(ctx, sp.hold < 0.05 ? { ...sp, d: sp.d + sp.hold - 0.05 } : sp, t, an, side, name); }
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];

// ---------------- cast
const HER = { ...BASE.her_lift };
const TOM = { ...BASE.tom };
const G = { her: geom(HER), flatmate: geom(TOM) };
const X = { her: -330, tom: 330 };
const CT = -780, CAB0 = -2400, CAB1 = 640;                            // worktop height, counter run (left .. fridge)
const FX0 = 650, FX1 = 1130, FTY = -1950;                             // fridge (left, right, top)
const PZX = 890, PZY = FTY;                                           // pizza box on top of the fridge (centre x, bottom y)
const CALX = 0, CALY = -1860;                                         // wall calendar (centre)
const ALX = -60, ALY = -2420;                                         // smoke alarm on the ceiling
const TOMIN = 1750;                                                   // twist: Tom walks in from here
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- props
// the (empty) cake plate: white plate, pink icing smears, crumbs; (0,0) = centre of the plate
function plateDraw(c, s = 1, crumbs = 1) { c.save(); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(6, 12, 150, 40, 0, 0, TAU); c.fill();
  c.fillStyle = '#FFFFFF'; c.strokeStyle = '#B9C2CC'; c.lineWidth = 5; c.beginPath(); c.ellipse(0, 0, 150, 40, 0, 0, TAU); c.fill(); c.stroke();
  c.strokeStyle = '#E3E8EE'; c.lineWidth = 4; c.beginPath(); c.ellipse(0, -2, 100, 24, 0, 0, TAU); c.stroke();
  c.fillStyle = '#F49AC1'; for (const [x, y, rx, ry] of [[-40, -4, 30, 8], [30, 4, 24, 6], [60, -8, 14, 5]]) { c.beginPath(); c.ellipse(x, y, rx, ry, 0.2, 0, TAU); c.fill(); }
  if (crumbs > 0) { c.fillStyle = '#C98A4A'; for (let i = 0; i < 14; i++) { const a = i * 2.39, r = 20 + (i * 37) % 80; c.beginPath(); c.arc(Math.cos(a) * r, Math.sin(a) * r * 0.25, 4 + (i % 3) * 2, 0, TAU); c.fill(); } }
  c.restore(); }
const plateItem = () => ctx => { ctx.save(); ctx.translate(0, -12); plateDraw(ctx, 1.15); ctx.restore(); };
function forkDraw(c, s = 1, rot = 0) { c.save(); c.scale(s, s); c.rotate(rot); c.fillStyle = '#C9D2DA'; c.strokeStyle = '#6A7480'; c.lineWidth = 3;
  rr(c, -8, -40, 16, 150, 8); c.fill(); c.stroke(); rr(c, -22, -110, 44, 76, 10); c.fill(); c.stroke();
  for (const x of [-15, -5, 5, 15]) { c.fillRect(x - 3, -160, 6, 56); } c.fillStyle = '#F49AC1'; c.beginPath(); c.arc(-4, -128, 9, 0, TAU); c.fill(); c.restore(); }
const forkItem = (rot = 0) => ctx => { ctx.save(); ctx.translate(0, 0); forkDraw(ctx, 0.9, rot); ctx.restore(); };
// pizza box (closed, lid up to `lid`) ; (0,0) = bottom centre
function pizzaBox(c, s = 1, lid = 0, t = 0) { c.save(); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -176, -6, 360, 16, 6); c.fill();
  if (lid > 0) { c.fillStyle = '#E3B860'; c.beginPath(); c.ellipse(0, -70, 150, 26, 0, 0, TAU); c.fill(); c.fillStyle = '#E0474C'; for (const [x, y] of [[-70, -72], [10, -66], [80, -74], [-20, -80]]) { c.beginPath(); c.ellipse(x, y, 22, 8, 0, 0, TAU); c.fill(); } }
  paint(c, q => { q.m(-180, 0); q.l(180, 0); q.l(180, -70); q.l(-180, -70); q.z(); }, '#E9D3A8', { sd: 4, hd: 2, lw: 4 });
  c.save(); c.translate(0, -70); c.scale(1, 1 - lid * 1.9); paint(c, q => { q.m(-184, 0); q.l(184, 0); q.l(184, -16); q.l(-184, -16); q.z(); }, '#F3E2BC', { sd: 3, hd: 1, lw: 4 }); c.restore();
  fitTxt(c, 'PIZZA', 0, -34, 46, '#C8383E', 300); c.restore(); }
// burnt cake with candles; (0,0) = bottom centre of the cake board
function burntCake(c, t, s = 1, lit = 1) { c.save(); c.scale(s, s);
  c.fillStyle = '#FFFFFF'; c.strokeStyle = '#B9C2CC'; c.lineWidth = 4; c.beginPath(); c.ellipse(0, 0, 190, 34, 0, 0, TAU); c.fill(); c.stroke();
  paint(c, q => { q.m(-150, 0); q.q(-160, -120, -120, -150); q.q(-40, -175, 0, -170); q.q(60, -178, 120, -150); q.q(162, -120, 150, 0); q.z(); }, '#2E2622', { sd: 6, hd: 3, lw: 4 });
  c.strokeStyle = '#5A4038'; c.lineWidth = 6; c.beginPath(); c.moveTo(-90, -140); c.lineTo(-60, -100); c.lineTo(-70, -60); c.moveTo(50, -150); c.lineTo(30, -110); c.lineTo(60, -80); c.stroke();
  c.fillStyle = '#4A3A30'; for (const [x, y] of [[-110, -40], [90, -30], [0, -60]]) { c.beginPath(); c.arc(x, y, 12, 0, TAU); c.fill(); }
  for (const [i, x] of [[0, -70], [1, 0], [2, 70]]) { c.fillStyle = ['#7FB0D8', '#F49AC1', '#F2C14E'][i]; c.fillRect(x - 9, -250, 18, 86); c.strokeStyle = '#FFFFFF'; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 9, -230); c.lineTo(x + 9, -215); c.moveTo(x - 9, -200); c.lineTo(x + 9, -185); c.stroke();
    if (lit > 0) { const f = 1 + 0.15 * Math.sin(t * 23 + i * 2); c.save(); c.translate(x, -262); c.scale(lit * f, lit * f); c.fillStyle = '#FFB020'; c.beginPath(); c.moveTo(0, -38); c.quadraticCurveTo(16, -10, 0, 6); c.quadraticCurveTo(-16, -10, 0, -38); c.fill(); c.fillStyle = '#FFF2A0'; c.beginPath(); c.ellipse(0, -6, 5, 10, 0, 0, TAU); c.fill(); c.restore(); } }
  c.restore(); }
// rising smoke wisps from (x, y) upwards (world); k = strength
function smoke(c, t, x, y, k, h = 900, n = 6) { if (k <= 0) return; for (let i = 0; i < n; i++) { const u = ((t * 0.55 + i / n) % 1), r = 40 + u * 140;
  c.fillStyle = `rgba(70,70,78,${0.5 * (1 - u) * k})`; c.beginPath(); c.arc(x + Math.sin(i * 1.7 + t * 2) * 30 + u * 520, y - u * h, r, 0, TAU); c.fill(); } }
function sweat(c, hd, t, k) { if (k <= 0) return; c.save(); c.globalAlpha = k; for (let i = 0; i < 3; i++) { const u = ((t * 1.4 + i * 0.33) % 1), x = hd.x + (i - 1) * hd.hh * 0.9 + (i === 1 ? hd.hh * 1.3 : 0), y = hd.y - hd.hh * 0.9 + u * hd.hh * 0.9;
  c.fillStyle = '#7CC7F2'; c.strokeStyle = '#2E7AB0'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - hd.hh * 0.16); c.quadraticCurveTo(x + hd.hh * 0.09, y, x, y + hd.hh * 0.06); c.quadraticCurveTo(x - hd.hh * 0.09, y, x, y - hd.hh * 0.16); c.fill(); c.stroke(); } c.restore(); }
function ring(c, x, y, r, k, t) { if (k <= 0) return; c.save(); c.globalAlpha = k; c.strokeStyle = '#FFE15A'; c.lineWidth = 12; c.setLineDash([26, 16]); c.lineDashOffset = -t * 120; c.beginPath(); c.arc(x, y, r * (1 + 0.06 * Math.sin(t * 10)), 0, TAU); c.stroke(); c.setLineDash([]); c.restore(); }
// sticky note (world or insert); (0,0) = centre
function note(c, txt, col, s = 1, rot = 0, k = 1) { if (k <= 0) return; c.save(); c.scale(s * k, s * k); c.rotate(rot); c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(-150 + 8, -150 + 10, 300, 300); c.fillStyle = col; c.fillRect(-150, -150, 300, 300);
  c.fillStyle = 'rgba(0,0,0,.06)'; c.fillRect(-150, -150, 300, 50); const L = Array.isArray(txt) ? txt : [txt]; L.forEach((s_, i) => fitTxt(c, s_, 0, (i - (L.length - 1) / 2) * 70 + 10, 56, '#2B2F3A', 260)); c.restore(); }
function miniCake(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#FFFFFF'; rr(c, -90, -30, 180, 90, 16); c.fill(); c.fillStyle = '#E0474C'; rr(c, -90, -40, 180, 30, 14); c.fill(); c.fillStyle = '#7FB0D8'; c.fillRect(-8, -100, 16, 60); c.fillStyle = '#FFB020'; c.beginPath(); c.moveTo(0, -140); c.quadraticCurveTo(14, -112, 0, -98); c.quadraticCurveTo(-14, -112, 0, -140); c.fill(); c.restore(); }
// small drawn icons for the twist: flour sack, eggs, oven (no text)
function icon(c, kind, x, y, s, k) { if (k <= 0) return; c.save(); c.translate(x, y); c.scale(s * k, s * k); c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.arc(6, 10, 92, 0, TAU); c.fill(); c.fillStyle = '#FFFFFF'; c.strokeStyle = C.oliveD; c.lineWidth = 7; c.beginPath(); c.arc(0, 0, 92, 0, TAU); c.fill(); c.stroke();
  if (kind === 'flour') { paint(c, q => { q.m(-42, 52); q.l(42, 52); q.q(52, -10, 34, -40); q.l(-34, -40); q.q(-52, -10, -42, 52); q.z(); }, '#F4EEDF', { sd: 3, hd: 1, lw: 4 }); c.strokeStyle = '#C9A13A'; c.lineWidth = 5; c.beginPath(); c.moveTo(-30, -40); c.lineTo(-20, -56); c.lineTo(0, -46); c.lineTo(20, -56); c.lineTo(30, -40); c.stroke();
    c.strokeStyle = '#C9A13A'; c.lineWidth = 5; c.beginPath(); c.moveTo(0, 36); c.lineTo(0, -16); c.stroke(); for (let i = 0; i < 3; i++) { c.fillStyle = '#E3B860'; c.beginPath(); c.ellipse(-10, -6 + i * 14, 9, 5, -0.6, 0, TAU); c.fill(); c.beginPath(); c.ellipse(10, -6 + i * 14, 9, 5, 0.6, 0, TAU); c.fill(); } }
  if (kind === 'eggs') { for (const [ex, ey] of [[-30, 10], [30, 10], [0, -30]]) { c.fillStyle = '#F7E9D2'; c.strokeStyle = '#B89A70'; c.lineWidth = 4; c.beginPath(); c.ellipse(ex, ey, 26, 34, 0, 0, TAU); c.fill(); c.stroke(); } }
  if (kind === 'oven') { c.fillStyle = '#C9D2DA'; c.strokeStyle = '#5A606E'; c.lineWidth = 5; rr(c, -56, -52, 112, 104, 10); c.fill(); c.stroke(); c.fillStyle = '#2B2F3A'; rr(c, -40, -20, 80, 58, 8); c.fill(); c.fillStyle = 'rgba(255,120,40,.7)'; rr(c, -32, -12, 64, 42, 6); c.fill();
    c.fillStyle = '#5A606E'; for (const kx of [-30, -10, 10, 30]) { c.beginPath(); c.arc(kx, -36, 6, 0, TAU); c.fill(); } }
  c.restore(); }

// ---------------- the kitchen (prerendered, softly blurred)
const BX0 = -3000, BY0 = -4300, BW = 6600, BH = 6200, BS = 0.5;
function drawKitchen(c) {
  c.fillStyle = '#F3E6D2'; c.fillRect(BX0, BY0, BW, BH);
  // ceiling + cornice
  c.fillStyle = '#FBF6EE'; c.fillRect(BX0, BY0, BW, -2560 - BY0); c.fillStyle = '#E3D6C0'; c.fillRect(BX0, -2580, BW, 40);
  c.fillStyle = 'rgba(255,255,255,.35)'; for (let x = BX0; x < BX0 + BW; x += 240) c.fillRect(x, -2540, 120, 2540 - 800 - 1000);
  // splashback tiles behind the worktop
  c.fillStyle = '#CFE3E0'; c.fillRect(CAB0, -1420, CAB1 - CAB0, 640);
  c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 5; for (let y = -1420; y < -780; y += 80) { c.beginPath(); c.moveTo(CAB0, y); c.lineTo(CAB1, y); c.stroke(); } for (let x = CAB0; x < CAB1; x += 80) { c.beginPath(); c.moveTo(x, -1420); c.lineTo(x, -780); c.stroke(); }
  // upper cupboards on the left
  for (let i = 0; i < 3; i++) { const x = CAB0 + i * 400; paint(c, q => { q.m(x + 10, -2200); q.l(x + 390, -2200); q.l(x + 390, -1460); q.l(x + 10, -1460); q.z(); }, '#7FB8A8', { sd: 6, hd: 3, lw: 4 });
    c.fillStyle = '#E9EDF1'; rr(c, x + (i % 2 ? 40 : 330), -1560, 26, 80, 10); c.fill(); }
  // window with a plant
  c.fillStyle = '#FFFFFF'; c.fillRect(-1180, -2200, 640, 760); c.fillStyle = '#9FD3F0'; c.fillRect(-1140, -2160, 560, 680); c.fillStyle = '#FFFFFF'; c.fillRect(-870, -2160, 22, 680); c.fillRect(-1140, -1840, 560, 18);
  c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.arc(-1000, -2050, 60, 0, TAU); c.arc(-930, -2070, 70, 0, TAU); c.fill();
  c.fillStyle = '#E0784C'; rr(c, -700, -1520, 100, 90, 10); c.fill(); c.fillStyle = '#4E9A4A'; for (const [dx, dy, r] of [[0, -40, 44], [-34, -70, 34], [34, -74, 36], [0, -100, 30]]) { c.beginPath(); c.arc(-650 + dx, -1520 + dy, r, 0, TAU); c.fill(); }
  // worktop + lower cupboards (behind the people)
  c.fillStyle = '#6FA898'; c.fillRect(CAB0, -780, CAB1 - CAB0, 780); c.fillStyle = 'rgba(0,0,0,.12)'; for (let x = CAB0; x < CAB1; x += 400) c.fillRect(x, -760, 8, 760);
  c.fillStyle = '#E9EDF1'; for (let x = CAB0; x < CAB1; x += 400) rr(c, x + 170, -700, 70, 20, 10), c.fill();
  c.fillStyle = '#C9B08A'; c.fillRect(CAB0 - 20, -830, CAB1 - CAB0 + 20, 60); c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(CAB0 - 20, -830, CAB1 - CAB0 + 20, 10);
  // kettle + toaster on the worktop
  paint(c, q => { q.m(-1950, -830); q.l(-1730, -830); q.l(-1760, -1060); q.q(-1840, -1110, -1920, -1060); q.z(); }, '#E0474C', { sd: 4, hd: 2, lw: 4 });
  paint(c, q => { q.m(-1500, -830); q.l(-1260, -830); q.l(-1260, -990); q.q(-1380, -1010, -1500, -990); q.z(); }, '#C9D2DA', { sd: 4, hd: 2, lw: 4 });
  // the wall right of the fridge: a door frame (the hallway)
  c.fillStyle = '#FFFDF8'; c.fillRect(1420, -2300, 700, 2300); c.fillStyle = '#C9B89E'; c.fillRect(1470, -2250, 600, 2250); c.fillStyle = '#B5A388'; c.fillRect(1470, -420, 600, 420);
  // floor
  c.fillStyle = '#D8C3A0'; c.fillRect(BX0, -10, BW, BY0 + BH + 10); c.fillStyle = 'rgba(0,0,0,.07)'; for (let y = -10, r = 0; y < BY0 + BH; y += 160, r++) for (let x = BX0 + (r % 2) * 160; x < BX0 + BW; x += 320) c.fillRect(x, y, 160, 160);
  c.fillStyle = 'rgba(0,0,0,.1)'; c.fillRect(BX0, -20, BW, 14);
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGK = mkBG(drawKitchen);

// ---------------- live set pieces: calendar, smoke alarm, fridge (door open in the hook), pizza box
function calendar(c, s = 1) { c.save(); c.translate(CALX, CALY); c.scale(s, s); c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(-150 + 8, -190 + 10, 300, 380); c.fillStyle = '#FFFFFF'; c.fillRect(-150, -190, 300, 380); c.fillStyle = '#E0474C'; c.fillRect(-150, -190, 300, 80);
  c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(0, -205, 10, 0, TAU); c.fill(); c.fillStyle = '#C9D2DA'; for (let r = 0; r < 4; r++) for (let q = 0; q < 5; q++) c.fillRect(-130 + q * 54, -90 + r * 64, 40, 40);
  c.strokeStyle = '#E0474C'; c.lineWidth = 8; c.beginPath(); c.ellipse(-130 + 3 * 54 + 20, -90 + 2 * 64 + 20, 36, 32, 0, 0, TAU); c.stroke(); c.restore(); }
function alarm(c, t, on) { c.save(); c.translate(ALX, ALY); c.scale(1.4, 1.4); c.fillStyle = 'rgba(0,0,0,.12)'; c.beginPath(); c.ellipse(6, 10, 120, 40, 0, 0, TAU); c.fill();
  paint(c, q => { q.m(-110, -40); q.l(110, -40); q.q(116, 30, 0, 36); q.q(-116, 30, -110, -40); q.z(); }, '#FFFFFF', { sd: 4, hd: 2, lw: 4 });
  c.strokeStyle = '#C9D2DA'; c.lineWidth = 4; for (const r of [40, 70]) { c.beginPath(); c.arc(0, -40, r, 0.3, Math.PI - 0.3); c.stroke(); }
  const b = on && Math.sin(t * 16) > 0; c.fillStyle = b ? '#FF3B3B' : '#7A2A2A'; c.beginPath(); c.arc(70, 4, 14, 0, TAU); c.fill();
  if (b) { c.fillStyle = 'rgba(255,60,60,.3)'; c.beginPath(); c.arc(70, 4, 48, 0, TAU); c.fill(); c.strokeStyle = '#FF3B3B'; c.lineWidth = 8; c.lineCap = 'round'; for (const a of [0.3, 1.0, 1.7, 2.4]) { c.beginPath(); c.moveTo(Math.cos(a) * 140, 20 + Math.sin(a) * 90); c.lineTo(Math.cos(a) * 190, 20 + Math.sin(a) * 120); c.stroke(); } }
  c.restore(); }
const doorOpen = (t, L) => L === 'hook' ? 1 - eIO(clamp((t - hev('wide') - 0.1) / 0.3)) : 0;
const pizzaOnFridge = (t, L) => !(L === 'o2' && t > ev('o2', 'slam'));
function fridge(c, t, L) { const o = doorOpen(t, L);
  c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse((FX0 + FX1) / 2, 0, (FX1 - FX0) / 2 + 30, 24, 0, 0, TAU); c.fill();
  if (o > 0) { // interior: light, shelves, milk, eggs, the empty cake spot
    c.fillStyle = '#FFF8D8'; c.fillRect(FX0 + 20, FTY + 20, FX1 - FX0 - 40, -FTY - 40); c.fillStyle = 'rgba(255,240,170,.35)'; c.fillRect(FX0 - 120, FTY - 60, FX1 - FX0 + 240, -FTY + 60);
    c.fillStyle = '#DDE6EE'; for (const y of [-1500, -1100, -700]) c.fillRect(FX0 + 20, y, FX1 - FX0 - 40, 16);
    c.fillStyle = '#FFFFFF'; rr(c, FX0 + 60, -1760, 90, 260, 16); c.fill(); c.fillStyle = '#4E7FB8'; c.fillRect(FX0 + 60, -1660, 90, 50);
    c.fillStyle = '#F7E9D2'; for (let i = 0; i < 4; i++) { c.beginPath(); c.ellipse(FX0 + 220 + i * 50, -735, 20, 26, 0, 0, TAU); c.fill(); }
    c.fillStyle = 'rgba(201,138,74,.8)'; for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(FX0 + 230 + (i * 47) % 180, -1112 - (i % 3) * 4, 5, 0, TAU); c.fill(); }
    c.fillStyle = '#7FB86A'; rr(c, FX0 + 280, -1440, 140, 90, 20); c.fill(); }
  else paint(c, q => { q.m(FX0, FTY); q.l(FX1, FTY); q.l(FX1, 0); q.l(FX0, 0); q.z(); }, '#E6ECF2', { sd: 8, hd: 4, lw: 4 });
  // frame / body edges
  c.strokeStyle = '#9AA6B4'; c.lineWidth = 8; c.strokeRect(FX0, FTY, FX1 - FX0, -FTY);
  if (o <= 0) { c.fillStyle = '#9AA6B4'; c.fillRect(FX0, -1250, FX1 - FX0, 10); c.fillStyle = '#B8C2CC'; rr(c, FX0 + 40, -1500, 24, 200, 12); c.fill(); rr(c, FX0 + 40, -1180, 24, 200, 12); c.fill();
    // magnets
    for (const [x, y, col] of [[FX0 + 300, -1620, '#E0474C'], [FX0 + 380, -1500, '#F2C14E'], [FX0 + 260, -900, '#4CAF6A']]) { c.fillStyle = col; c.beginPath(); c.arc(x, y, 22, 0, TAU); c.fill(); } }
  else { // the open door, swung towards the camera on the right hinge
    const w = 260 * o; paint(c, q => { q.m(FX1, FTY); q.l(FX1 + w, FTY + 60); q.l(FX1 + w, -40); q.l(FX1, 0); q.z(); }, '#E6ECF2', { sd: 6, hd: 3, lw: 4 });
    c.fillStyle = '#DDE6EE'; for (const y of [-1500, -1000, -500]) c.fillRect(FX1 + 20 * o, y, w - 40 * o, 14);
    c.fillStyle = '#F2C14E'; rr(c, FX1 + 60 * o, -1100, 60 * o, 120, 10); c.fill(); }
  if (pizzaOnFridge(t, L)) { c.save(); c.translate(PZX, PZY); pizzaBox(c, 1.0, 0, t); c.restore(); }
  K.mark(c, 'fridge', (FX0 + FX1) / 2, -1000, 400); }

// ---------------- characters
const gest = (st, g, who, t, side, base, drop = 0) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + drop + base + Math.cos(u) * 20, { planar: true }); } };
const down = (g, s, drop = 0) => reach(g, s, s * g.sw * 1.08, g.ySh + drop + 540, { planar: true });
const open = (g, s, k = 1.7, dy = 90, drop = 0) => reach(g, s, s * g.sw * k, g.ySh + drop + dy, { planar: true });
const forehead = (g, s = 1) => reach(g, s, s * g.hw * 0.15, g.headY - g.hh * 0.42, { planar: true });
const hold = (g, s, dy = 330, k = 0.75) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const hip = (g, s) => reach(g, s, s * g.sw * 0.95, g.ySh + 470, { planar: true });
const belly = (g, s, w = 0) => reach(g, s, s * g.sw * 0.35 + w, g.ySh + 400, { planar: true });
const base = (g, t, who) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, armL: down(g, -1), armR: down(g, 1), items: {} });
const HUGY = G.her.ySh + 150;   // the pizza box she hugs (world y of its centre)
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { ...base(g, t, 'her'), mood: 'neutral', turn: 0.25, look: 0.7 };
  if (L === 'hook') { st.mood = 'shock'; st.blink = 0; st.armL = open(g, -1, 1.5, 60); st.armR = open(g, 1, 1.5, 60);
    if (t > hev('nar') + 0.3) { st.mood = 'angry'; st.armL = hip(g, -1); st.armR = hip(g, 1); }
    if (t > hev('wide')) { st.mood = 'angry'; st.look = 0.6; } }
  if (L === 'o1') { st.mood = 'angry'; st.armL = hip(g, -1); st.armR = hip(g, 1);
    if (speaking('o1_h', t, 0.05, 0.15)) { st.mood = 'angry'; st.armL = open(g, -1, 2.0, 40 + Math.sin(t * 9) * 25); st.armR = reach(g, 1, g.sw * 2.1, g.ySh + 60 + Math.sin(t * 9) * 20, { planar: true }); }
    if (t > SP.o1_t.t) { st.mood = 'surprised'; st.armL = hip(g, -1); st.armR = hip(g, 1); }
    if (t > e('give') + 0.3) { st.mood = 'shock'; st.blink = 0; st.armR = hold(g, 1, 330, 0.9); st.items = { R: plateItem() }; st.lookY = 0.4; st.look = 0.3; }
    if (t > e('palm')) { st.armR = hold(g, 1, 190, 0.9); st.mood = 'tired'; st.blink = 1; st.headFirst = true; st.armL = forehead(g, -1); st.headY = 6; st.look = 0; st.turn = 0.1; st.lookY = 0; } }
  if (L === 'o2') { st.mood = 'neutral';
    if (speaking('o2_h', t, 0.05, 0.15)) { st.mood = 'happy'; gest(st, g, 'her', t, -1, 160); st.armR = open(g, 1, 1.6, 200); }
    if (t > SP.o2_t.t) { st.mood = 'happy'; st.armR = open(g, 1, 1.6, 200); }
    if (t > e('eye')) { st.mood = 'surprised'; st.blink = 0; }
    if (t > e('slam')) { st.mood = 'angry'; st.blink = 0; st.turn = 0.05; st.look = 0.15; st.armL = reach(g, -1, -175, HUGY + 10, { planar: true }); st.armR = reach(g, 1, 175, HUGY + 10, { planar: true }); st.hugBox = true; } }
  if (L === 'o3') { st.mood = 'neutral';
    if (speaking('o3_h', t, 0.05, 0.15)) { st.mood = 'happy'; gest(st, g, 'her', t, -1, 140); }
    if (t > SP.o3_t.t) { st.mood = 'happy'; st.look = 0.7; }
    if (t > e('write')) { st.mood = 'surprised'; st.look = 0.8; }
    if (t > e('relief')) { st.mood = 'happy'; st.blink = 1; st.look = 0.6; st.turn = 0.25; st.armL = open(g, -1, 1.6, 60); st.armR = down(g, 1); }
    if (t > SP.o3_nar.t) { st.blink = 0; } }
  if (L === 'o4') { st.mood = 'smug'; st.armL = hip(g, -1); st.armR = hip(g, 1);
    if (speaking('o4_h', t, 0.05, 0.1)) { const u = t - SP.o4_h.t; st.mood = 'happy'; st.look = 0.8;
      if (t < e('cal')) { st.armR = reach(g, 1, g.sw * (1.6 + 0.2 * Math.sin(u * 3)), g.ySh + 160 + Math.cos(u * 3) * 30, { planar: true }); }
      else if (t < e('smug') - 0.15) { st.mood = 'smug'; st.armL = hip(g, -1); st.armR = reach(g, 1, g.sw * 0.4, g.ySh + 140, { planar: true }); st.blink = 0.6; }
      else { st.mood = 'smug'; st.blink = 1; st.armR = hip(g, 1); st.tilt = -0.05; } }
    if (t > endOf('o4_h') + 0.05) { st.mood = 'smug'; st.blink = 1; } }
  if (L === 'end') { st.mood = 'neutral'; st.armL = hold(g, -1, 360, 0.6); st.armR = hold(g, 1, 360, 0.6);
    if (t > e('enter') + 0.3) { st.mood = 'surprised'; st.blink = 0; st.look = 0.9; }
    if (t > SP.end_t.t + 1.0) { st.mood = 'worried'; }
    if (t > e('look')) { st.mood = 'tired'; st.turn = 0; st.look = 0; st.blink = 0.45; st.lookY = 0; }
    if (t > e('blow') - 0.25 && t < e('blow') + 0.45) { st.mood = 'shock'; st.blink = 0.3; st.turn = 0.3; st.look = 0.8; }
    if (t > e('blow') + 0.45) { st.mood = 'annoyed'; st.turn = 0.2; st.look = 0.6; }
    if (t > e('mine') - 0.3) { st.mood = 'smug'; st.armR = reach(g, 1, g.sw * 2.3, g.ySh + 120, { planar: true }); st.turn = 0.4; st.look = 1; } }
  return st; }
const crumbsK = (t, L) => (L === 'hook' || L === 'o1' || L === 'o2' || L === 'o4') ? 1 : 0;
function tomState(t, L) { const g = G.flatmate, e = k => ev(L, k), st = { ...base(g, t, 'flatmate'), mood: 'happy', turn: -0.25, look: -0.7 };
  const plateL = () => { st.armL = hold(g, -1, 300, 0.95); st.items.L = plateItem(); };
  const forkR = (rot = 0) => { st.armR = hold(g, 1, 230, 0.55); st.items.R = forkItem(rot); };
  if (L === 'hook') { st.items = {}; plateL(); forkR(); st.mood = 'happy';
    if (speaking('hook_t', t, 0.05, 0.1)) { st.mood = 'surprised'; st.blink = 0; }
    if (t > hev('nar') - 0.1 && t < hev('plate')) { st.armL = hold(g, -1, 110, 0.95); st.mood = 'happy'; st.blink = 1; st.armR = reach(g, 1, g.hw * 0.55, g.headY + g.hh * 0.95, { planar: true }); st.items.R = forkItem(-0.5); st.laugh = true; }
    if (t > hev('wide')) { st.mood = 'happy'; st.blink = 0; st.laugh = false; st.armR = reach(g, 1, FX1 + 100 - X.tom, -1000, { planar: true }); delete st.items.R; st.turn = 0.3; st.look = 0.8;
      if (t > hev('wide') + 0.5) { forkR(); st.turn = -0.25; st.look = -0.7; } } }
  if (L === 'o1') { st.items = {}; plateL(); forkR();
    if (speaking('o1_h', t, 0.1, 0.1)) { st.mood = 'surprised'; st.blink = 0; }
    if (speaking('o1_t', t, 0.05, 0.1)) { st.mood = 'happy'; }
    if (t > e('rub') && t < e('give')) { st.armR = belly(g, 1, Math.sin(t * 12) * 30); delete st.items.R; st.laugh = t > SP.o1_t.t + 1.0; }
    if (t > e('give')) { const k = eOut(clamp((t - e('give')) / 0.3)); st.armL = reach(g, -1, lerp(-g.sw * 0.95, X.her + 210 - X.tom, k), g.ySh + 300, { planar: true }); st.turn = -0.4; st.look = -0.9; delete st.items.R; st.mood = 'happy'; st.laugh = true;
      if (t > e('give') + 0.3) { st.items = {}; st.armL = down(g, -1); } } }
  if (L === 'o2') { st.items = {}; forkR(); st.mood = 'neutral';
    if (speaking('o2_t', t, 0.05, 0.1)) { st.mood = 'happy'; gest(st, g, 'flatmate', t, -1, 160); }
    if (t > e('eye')) { st.mood = 'happy'; st.turn = 0.35; st.look = 0.9; st.lookY = -0.7; st.laugh = true; } }
  if (L === 'o3') { st.items = {}; forkR(); st.mood = 'happy';
    if (speaking('o3_h', t, 0.1, 0.1)) { st.mood = 'surprised'; }
    if (t > SP.o3_t.t - 0.05) { st.mood = 'worried'; st.blink = 0; st.items = {}; st.armL = reach(g, -1, -g.sw * 0.25, g.ySh + 270, { planar: true }); st.armR = reach(g, 1, g.sw * 0.25, g.ySh + 280, { planar: true }); st.tilt = 0.08; st.lookY = 0.2; }
    if (t > e('write')) { st.tilt = 0; st.lookY = 0.5; st.look = 0; st.turn = 0; st.mood = 'neutral'; st.armL = hold(g, -1, 300, 0.4); st.armR = reach(g, 1, g.sw * 0.1 + Math.sin(t * 20) * 14, g.ySh + 270, { planar: true }); st.items = { L: ctx => { ctx.save(); ctx.translate(30, -30); note(ctx, '', '#FFE15A', 0.4); ctx.restore(); } }; }
    if (t > e('relief')) { st.items = {}; st.lookY = 0; st.turn = -0.25; st.look = -0.6; st.mood = 'happy'; st.laugh = true; st.armL = open(g, -1, 1.6, 40); st.armR = open(g, 1, 1.6, 40); } }
  if (L === 'o4') { st.items = {}; forkR(); st.mood = 'happy';
    if (speaking('o4_h', t, 0, 0)) { st.mood = t > e('cal') ? 'worried' : 'happy'; if (t > e('smug')) st.mood = 'shock'; }
    if (t > e('gasp')) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; }
    if (t > SP.o4_t.t) { st.mood = 'sad'; st.armL = reach(g, -1, -g.sw * 0.4, g.ySh + 300, { planar: true }); st.lookY = 0.3; }
    if (t > e('drop')) { st.armR = open(g, 1, 1.4, 260); delete st.items.R; } }
  if (L === 'end') { const walking = t < e('stop'); st.mood = 'happy'; st.turn = walking ? -0.5 : -0.25; st.look = -0.7; st.legPose = walking ? 'walk' : 'stand';
    const cy = cakeY(t, L); st.armL = reach(g, -1, -160, cy - 30, { planar: true }); st.armR = reach(g, 1, 160, cy - 30, { planar: true });
    if (speaking('end_t', t, 0.05, 0.1)) { st.mood = 'happy'; st.laugh = t > e('hb'); }
    if (t > e('blow') + 0.1) { st.mood = 'shock'; st.blink = 0.4; st.laugh = false; }
    if (t > e('blow') + 0.5) { st.mood = 'worried'; st.blink = 1; st.tilt = Math.sin(t * 14) * 0.04; } }
  return st; }
const tomX = (t, L) => L === 'end' ? lerp(TOMIN, X.tom, eOut(clamp((t - ev('end', 'enter')) / (ev('end', 'stop') - ev('end', 'enter'))))) : X.tom;
const cakeY = (t, L) => G.flatmate.ySh + 420 - (L === 'end' ? 90 * eBack(clamp((t - ev('end', 'hb')) / 0.3), 2) * (1 - clamp((t - ev('end', 'blow')) / 0.4)) : 0);
const candlesLit = (t, L) => L === 'end' ? 1 - clamp((t - ev('end', 'blow') - 0.1) / 0.15) : 0;

// ---------------- world + which characters each shot draws
const DRAW = { wide: ['her', 'flatmate'], cover: ['her', 'flatmate'], two: ['her', 'flatmate'], her: ['her'], tom: ['flatmate'], three: ['her', 'flatmate'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function overlayFace(c, hd, g, t, L, who) { if (!hd || hd.x > 1e4 || hd.x < -1e4) return; const hw = hd.hh * g.hw / g.hh;
  if (who === 'flatmate' && crumbsK(t, L) > 0) { c.save(); c.fillStyle = '#C98A4A'; for (const [dx, dy, r] of [[-0.35, 0.62, 0.05], [0.28, 0.66, 0.045], [0.05, 0.74, 0.04], [-0.12, 0.7, 0.035], [0.42, 0.55, 0.035]]) { c.beginPath(); c.arc(hd.x + dx * hw, hd.y + dy * hd.hh, r * hd.hh, 0, TAU); c.fill(); }
    c.fillStyle = '#F49AC1'; c.beginPath(); c.ellipse(hd.x + 0.3 * hw, hd.y + 0.5 * hd.hh, 0.1 * hw, 0.04 * hd.hh, 0.3, 0, TAU); c.fill(); c.restore(); }
  if (who === 'flatmate' && L === 'end' && t > ev('end', 'blow') + 0.2) { c.save(); c.globalAlpha = clamp((t - ev('end', 'blow') - 0.2) / 0.3) * 0.75; c.fillStyle = '#3A3A40'; for (const [dx, dy, r] of [[-0.4, 0.1, 0.16], [0.35, 0.2, 0.13], [0.1, -0.5, 0.15], [-0.1, 0.5, 0.1]]) { c.beginPath(); c.arc(hd.x + dx * hw, hd.y + dy * hd.hh, r * hd.hh, 0, TAU); c.fill(); } c.restore(); } }
function world(c, t, L, tag) { const who = DRAW[tag] || ['her', 'flatmate'], heads = {};
  c.drawImage(BGK, BX0, BY0, BW, BH); calendar(c); alarm(c, t, L === 'end' && t > ev('end', 'enter')); fridge(c, t, L);
  if (L === 'o3' && t > ev('o3', 'notes') + 0.4) { c.save(); c.translate(FX0 + 170, -1450); note(c, ['ASK', 'FIRST!'], '#FFE15A', 0.55, -0.06); c.restore(); if (t > ev('o3', 'notes') + 0.9) { c.save(); c.translate(FX0 + 330, -1180); note(c, '', '#F7A8C8', 0.55, 0.05); miniCake(c, 0, 10, 0.55); c.restore(); } }
  if (L === 'end' && t > ev('end', 'mine')) { const k = eBack(clamp((t - ev('end', 'mine')) / 0.25), 2.4); c.save(); c.translate(FX0 + 240, -1380); note(c, 'MINE!', '#FFE15A', 0.9, -0.08, k); c.restore(); }
  if (L === 'end' && who.includes('flatmate')) smoke(c, t, tomX(t, L) + 60, cakeY(t, L) - 200, clamp((t - ev('end', 'enter')) / 0.4), 1500);
  if (who.includes('flatmate')) heads.flatmate = K.put(c, TOM, tomState(t, L), tomX(t, L), 0);
  if (L === 'end' && who.includes('flatmate')) { const x = tomX(t, L), y = cakeY(t, L); c.save(); c.translate(x, y + 30); burntCake(c, t, 1, candlesLit(t, L)); c.restore();
    { const sk = clamp((t - ev('end', 'enter')) / 0.4); for (let i = 0; i < 3; i++) { const u = ((t * 0.9 + i / 3) % 1); c.fillStyle = `rgba(70,70,78,${0.45 * (1 - u) * sk})`; c.beginPath(); c.arc(x + 20 + u * 200, y - 260 - u * 160, 26 + u * 40, 0, TAU); c.fill(); } }
    const bk = clamp((t - ev('end', 'blow') - 0.1) / 0.2) * (1 - clamp((t - ev('end', 'blow') - 1.6) / 0.8)); if (bk > 0) { c.save(); for (let i = 0; i < 9; i++) { const a = i / 9 * TAU, r = 120 + 260 * clamp((t - ev('end', 'blow')) / 0.8); c.fillStyle = `rgba(40,40,46,${0.55 * bk})`; c.beginPath(); c.arc(x + 160 + Math.cos(a) * r * 0.6, y - 200 + Math.sin(a) * r * 0.35, 90, 0, TAU); c.fill(); } c.restore(); } }
  if (who.includes('her')) { const st = herState(t, L); heads.her = K.put(c, HER, st, X.her, 0);
    if (st.hugBox) { c.save(); c.translate(X.her, HUGY + 40); pizzaBox(c, 1.0, 0, t); c.restore(); } }
  overlayFace(c, heads.flatmate, G.flatmate, t, L, 'flatmate');
  if (L === 'o4' && heads.flatmate) sweat(c, heads.flatmate, t, clamp((t - ev('o4', 'guilt')) / 0.3));
  if (L === 'o4' && t > ev('o4', 'drop')) { const u = t - ev('o4', 'drop'), y = G.flatmate.ySh + 260 + Math.min(1, u / 0.35) ** 2 * 1050; if (u < 1.2) { c.save(); c.translate(X.tom + G.flatmate.sw * 1.1, Math.min(-30, y)); forkDraw(c, 0.9, u * 7); c.restore(); } }
  if (!heads.her) heads.her = OFFL; if (!heads.flatmate) heads.flatmate = OFF;
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const HY = k => G[k].headY, fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(390, fy(HY('flatmate'), 0.51, 960), 0.51, 'cover'), WIDE: S(400, fy(HY('flatmate'), 0.46, 860), 0.46, 'wide'),
  TWO: S((X.her + X.tom) / 2 + 20, fy(HY('flatmate'), 0.74, 860), 0.74, 'two'),
  HER: S(X.her + 30, fy(HY('her'), 1.0), 1.0, 'her'), HER_R: S(X.her + 20, fy(HY('her'), 1.15, 880), 1.15, 'her'),
  TOM: S(X.tom + 60, fy(HY('flatmate'), 1.0), 1.0, 'tom'), TOM_PZ: S(X.tom + 190, fy(HY('flatmate'), 0.9, 980), 0.9, 'tom'), TOM_CU: S(X.tom + 10, fy(HY('flatmate'), 1.2, 900), 1.2, 'tom'),
  THREE: S(20, fy(HY('flatmate'), 0.56, 860), 0.56, 'three'), TOM_END: S(X.tom + 40, fy(HY('flatmate'), 0.92, 880), 0.92, 'tom'),
  ENDW: S(330, fy(HY('flatmate'), 0.5, 900), 0.5, 'three'), PLATE: U('plate', 1), PIZZA: U('pizza', 2), NOTES: U('notes', 3), CAL: U('cal', 4) };
const HO = 0.12;   // cut to the next speaker this long before the line starts
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < hev('nar') - 0.02) return SH.COVER; if (t < hev('plate') - 0.05) return f(SH.TOM_CU); if (t < hev('wide') - 0.05) return f(SH.PLATE); return f(SH.WIDE); }
  if (L === 'o1') { if (t < SP.o1_h.t - HO) return f(SH.WIDE); if (t < SP.o1_t.t - HO) return f(SH.HER); if (t < e('give')) return f(SH.TOM); if (t < e('palm') - 0.02) return f(SH.TWO); return f(SH.HER_R); }
  if (L === 'o2') { if (t < SP.o2_h.t - HO) return f(SH.WIDE); if (t < SP.o2_t.t - HO) return f(SH.HER); if (t < e('pizza')) return f(SH.TOM_PZ); if (t < e('horror') - 0.02) return f(SH.PIZZA); return f(SH.HER_R); }
  if (L === 'o3') { if (t < SP.o3_h.t - HO) return f(SH.WIDE); if (t < SP.o3_t.t - HO) return f(SH.HER); if (t < e('notes')) return f(SH.TOM); if (t < e('relief') - 0.02) return f(SH.NOTES); return f(SH.TWO); }
  if (L === 'o4') { if (t < SP.o4_h.t - HO) return f(SH.WIDE); if (t < e('cal') - 0.02) return f(SH.THREE); if (t < e('guilt') - 0.08) return f(SH.CAL); if (t < SP.o4_t.t - HO) return f(SH.THREE); return f(SH.TOM_CU); }
  if (L === 'end') { if (t < SP.end_t.t - HO) return f(SH.ENDW); if (t < e('look') - 0.02) return f(SH.TOM_END); if (t < e('blow') - 0.05) return f(SH.HER_R); return f(SH.ENDW); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- inserts on a solid backdrop
function backdrop(c, t, a, b) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.1)'; for (let i = -12; i < 12; i++) c.fillRect(-1600, i * 160 + (t * 40) % 160, 3200, 60); c.restore(); }
const sleeve = (c, col, x0, y0, x1, y1, w = 70) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); c.fillStyle = '#F2C9A8'; c.beginPath(); c.arc(x1, y1, w * 0.62, 0, TAU); c.fill(); };
// hook: the empty plate, a fork scrapes up the last crumb
function plateView(c, t) { backdrop(c, t, '#F7D7E3', '#E9A8C0'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'plate' });
  const u = t - hev('plate'), k = eBack(clamp((u + 0.05) / 0.3), 1.6); c.save(); c.translate(540, 900); c.scale(k * 3.2, k * 3.2); plateDraw(c, 1, 1); c.restore();
  const fx = lerp(1150, 640, eOut(clamp((u - 0.1) / 0.3))), fy_ = 880 - Math.max(0, Math.sin(clamp((u - 0.4) / 0.25) * Math.PI)) * 30;
  c.save(); c.translate(fx, fy_); c.rotate(-1.2); forkDraw(c, 2.4); c.restore(); sleeve(c, '#4E7FB8', 1300, 1180, fx + 220, fy_ + 260, 120); }
// o2: pizza box: the lid lifts, his fork sneaks in, her hands slam it shut
function pizzaView(c, t) { backdrop(c, t, '#FFE6B8', '#F2B860'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'pizza' });
  const t0 = ev('o2', 'pizza'), sl = ev('o2', 'slam'), u = t - t0, k = eBack(clamp((u + 0.05) / 0.3), 1.6);
  const lid = t < sl ? 0.35 * eOut(clamp((u - 0.15) / 0.35)) : 0.35 * (1 - clamp((t - sl) / 0.08)), sh = t > sl && t < sl + 0.3 ? Math.sin((t - sl) * 60) * 12 : 0;
  c.save(); c.translate(540 + sh, 1060); c.scale(k * 2.5, k * 2.5); pizzaBox(c, 1, lid, t); c.restore();
  if (t < sl + 0.1) { const fx = lerp(1180, 760, eOut(clamp((u - 0.35) / 0.35))); c.save(); c.translate(fx, 860); c.rotate(-1.75); forkDraw(c, 2.2); c.restore(); sleeve(c, '#4E7FB8', 1300, 760, fx + 200, 800, 120); }
  if (t > sl - 0.12) { const hk = eOut(clamp((t - sl + 0.12) / 0.12)); for (const s of [-1, 1]) { const hx = 540 + s * 250, hy = lerp(380, 830, hk); sleeve(c, '#EF7FAA', 540 + s * 620, hy - 520, hx, hy, 110); } }
  if (t > sl) UI.sparkles && 0; }
// o3: the fridge door, sticky notes slapped on
function notesView(c, t) { backdrop(c, t, '#E9F1EE', '#C9DCD6'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'notes' });
  const t0 = ev('o3', 'notes'), u = t - t0, k = eBack(clamp((u + 0.05) / 0.3), 1.6);
  c.save(); c.translate(540, 960); c.scale(k, k); c.fillStyle = 'rgba(0,0,0,.15)'; rr(c, -400 + 14, -760 + 18, 800, 1520, 40); c.fill(); c.fillStyle = '#EEF2F6'; c.strokeStyle = '#9AA6B4'; c.lineWidth = 10; rr(c, -400, -760, 800, 1520, 40); c.fill(); c.stroke();
  c.fillStyle = '#B8C2CC'; rr(c, -360, -400, 34, 460, 17); c.fill(); for (const [x, y, col] of [[260, -640, '#E0474C'], [-200, 600, '#4CAF6A']]) { c.fillStyle = col; c.beginPath(); c.arc(x, y, 36, 0, TAU); c.fill(); } c.restore();
  const n1 = eBack(clamp((u - 0.3) / 0.15), 2.6), n2 = eBack(clamp((u - 0.8) / 0.15), 2.6);
  if (n1 > 0) { c.save(); c.translate(560, 700); note(c, ['ASK', 'FIRST!'], '#FFE15A', 1.35, -0.06, n1); c.restore(); }
  if (n2 > 0) { c.save(); c.translate(500, 1210); note(c, '', '#F7A8C8', 1.35, 0.05, n2); miniCake(c, 0, 10, 1.35 * n2); c.restore(); }
  const hu = u < 0.8 ? clamp((u - 0.2) / 0.15) * (1 - clamp((u - 0.5) / 0.2)) : clamp((u - 0.7) / 0.15) * (1 - clamp((u - 1.0) / 0.2)); if (hu > 0) { const ty = u < 0.8 ? 700 : 1210; sleeve(c, '#4E7FB8', 1300, ty + 300, lerp(1300, 700, hu), ty + 60 * hu, 120); } }
// o4: the wall calendar: TOMORROW: MY BIRTHDAY
function calView(c, t) { backdrop(c, t, '#F7E3B0', '#E3B860'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'cal' });
  const t0 = ev('o4', 'cal'), u = t - t0, k = eBack(clamp((u + 0.05) / 0.3), 1.6);
  c.save(); c.translate(540, 900); c.scale(k, k); c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(-380 + 14, -560 + 18, 760, 1120); c.fillStyle = '#FFFFFF'; c.fillRect(-380, -560, 760, 1120);
  c.fillStyle = '#E0474C'; c.fillRect(-380, -560, 760, 190); fitTxt(c, 'TOMORROW:', 0, -462, 92, '#FFFFFF', 680);
  c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(0, -585, 22, 0, TAU); c.fill();
  // cake icon (paths)
  const ck = eBack(clamp((u - 0.15) / 0.3), 2); c.save(); c.translate(0, -60); c.scale(ck, ck);
  c.fillStyle = '#F49AC1'; rr(c, -170, -40, 340, 150, 24); c.fill(); c.fillStyle = '#FFF4F8'; rr(c, -170, -60, 340, 50, 24); c.fill(); for (let i = 0; i < 5; i++) { c.fillStyle = '#FFF4F8'; c.beginPath(); c.arc(-136 + i * 68, -12, 22, 0, Math.PI); c.fill(); }
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.ellipse(0, 112, 210, 26, 0, 0, TAU); c.fill();
  for (const x of [-80, 0, 80]) { c.fillStyle = '#7FB0D8'; c.fillRect(x - 10, -150, 20, 90); c.fillStyle = '#FFB020'; c.beginPath(); c.moveTo(x, -200); c.quadraticCurveTo(x + 16, -170, x, -152); c.quadraticCurveTo(x - 16, -170, x, -200); c.fill(); }
  c.restore();
  const tk = eBack(clamp((u - 0.35) / 0.3), 2); c.save(); c.translate(0, 300); c.scale(tk, tk); c.rotate(-0.04); fitTxt(c, 'MY BIRTHDAY!', 0, 0, 96, '#E0474C', 680); c.strokeStyle = '#E0474C'; c.lineWidth = 10; c.beginPath(); c.ellipse(0, 0, 350, 95, 0, 0, TAU); c.stroke(); c.restore();
  c.restore(); }

// ---------------- overlays
function title(c, t) { const a = 1 - P(t, 2.25, 2.5); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 300); c.rotate(-0.04); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -102);
  UI.textFit(c, 'Unb9', 120, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 6, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 64, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 112); c.restore();
  if (global.__QA) global.__QA.ui(c, 'card', { x: 50, y: 135, w: 980, h: 330, k: a, id: 'title' }); }
const PLATES = { o1: ['1', 'В ЛОБ', '#E0474C'], o2: ['2', 'ВЕЖЛИВО', '#F2B33D'], o3: ['3', 'КАК НОСИТЕЛЬ', '#4CAF6A'], o4: ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', '#8E5BD0'] };
function plate(c, t, sc) { const p = PLATES[sc.id]; if (!p) return; const u = t - sc.s, out = P(t, sc.e - 0.15, sc.e);
  const k = eBack(P(u, 0, 0.25), 2.2) * (1 - eIn(out)), big = 1 - eIO(P(u, 0.3, 0.5)); if (k <= 0) return;
  UI.font(c, 'Unb9', 54); const tw = c.measureText(p[1]).width, w = tw + 200, h = 100, smax = Math.min(1, 760 / w), s = k * lerp(smax, Math.min(1.4, 880 / w), big), y = 215;
  c.save(); c.translate(540, y); c.scale(s, s); c.rotate(-0.025);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -h / 2 + 9, w, h, 50); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 50); c.fill(); c.stroke();
  c.fillStyle = p[2]; c.beginPath(); c.arc(-w / 2 + 50, 0, 50, 0, TAU); c.fill(); c.stroke(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p[0], -w / 2 + 50, 4);
  c.fillStyle = C.oliveD; c.textAlign = 'left'; c.fillText(p[1], -w / 2 + 120, 4); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w / 2 * s, y: y - 50 * s, w: w * s, h: 100 * s, k, id: 'plate_' + sc.id }); }
// twist: small «НА СЛЕДУЮЩИЙ ДЕНЬ» label
function nextDay(c, t) { const s = SC.end.s, k = eBack(P(t, s + 0.05, s + 0.3), 2.2) * (1 - eIn(P(t, s + 1.5, s + 1.7))); if (k <= 0) return;
  c.save(); c.translate(540, 215); c.scale(k, k); c.rotate(-0.025); UI.font(c, 'Unb9', 48); const w = c.measureText('НА СЛЕДУЮЩИЙ ДЕНЬ').width + 90;
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -46 + 9, w, 92, 46); c.fill(); c.fillStyle = C.oliveD; rr(c, -w / 2, -46, w, 92, 46); c.fill(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('НА СЛЕДУЮЩИЙ ДЕНЬ', 0, 4); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w / 2, y: 169, w, h: 92, k, id: 'nextday' }); }
// twist: flour / eggs / oven icons pop next to Tom as he lists them (no text)
function listIcons(c, t, tag) { if (sceneAt(t).id !== 'end' || tag !== 'tom') return; const out = 1 - P(t, ev('end', 'look') - 0.25, ev('end', 'look') - 0.05);
  [['flour', 'flour'], ['eggs', 'eggs'], ['oven', 'oven']].forEach(([k, kind], i) => icon(c, kind, 900, 1080 + i * 230, 1.05, eBack(P(t, ev('end', k), ev('end', k) + 0.25), 2.4) * out)); }

// ---------------- end screen: question, 1 / 2 / 3 / 4, СОХРАНИ, ПОДПИСАТЬСЯ clicked by the cursor
const wAt = (id, w, fb) => K.wordT(id, w) ?? fb;
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, { textFit, strokeText, font } = UI;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // heroine + Tom with the burnt cake (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34, 2nd character at local x 640)
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gm = G.flatmate, cy = gm.ySh + 420;
    K.put(c, TOM, { t, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, items: {}, armL: reach(gm, -1, -160, cy - 30, { planar: true }), armR: reach(gm, 1, 160, cy - 30, { planar: true }) }, 640, 0);
    c.save(); c.translate(640, cy + 30); burntCake(c, t, 1, 1); c.restore(); smoke(c, t, 640, cy - 160, 0.6, 700, 4);
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 160 + Math.sin(t * 8) * 30, { planar: true }), armR: reach(g, 1, g.sw * 0.8, g.ySh + 330), items: {} }, 0, 0); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const q = eBack(P(u, 0.2, 0.55), 2.2); c.save(); c.translate(540, 300); c.scale(q, q); font(c, 'Unb9', 64); strokeText(c, 'А ТЫ БЫ', 0, -50, C.oliveD, C.white, 14); strokeText(c, 'ОТВЕТИЛА КАК?', 0, 40, C.pink, C.white, 14); c.restore();
  const tw = [wAt('outro', 'один', sp.t + 1.08), wAt('outro', 'два', sp.t + 1.33), wAt('outro', 'три', sp.t + 1.6), wAt('outro', 'четыре', sp.t + 2.0)];
  const LBL = { o1: ['В ЛОБ'], o2: ['ВЕЖЛИВО'], o3: ['КАК', 'НОСИТЕЛЬ'], o4: ['КОРОЛЕВ-', 'СКИЙ'] };
  ['o1', 'o2', 'o3', 'o4'].forEach((id, i) => { const p = PLATES[id], kk = eBack(P(t, tw[i] - 0.1, tw[i] + 0.2), 2.2); if (kk <= 0) return; const x = 290 + (i % 2) * 420, y = 600 + Math.floor(i / 2) * 200, bump = 1 + 0.06 * Math.sin(clamp((t - tw[i]) / 0.4) * Math.PI);
    c.save(); c.translate(x, y); c.scale(kk * bump, kk * bump); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -195 + 8, -80 + 12, 390, 160, 36); c.fill(); c.fillStyle = p[2]; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -195, -80, 390, 160, 36); c.fill(); c.stroke();
    font(c, 'Unb9', 120); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(p[0], -125, 8);
    const ls = LBL[id]; ls.forEach((s_, j) => { textFit(c, 'Unb9', 34, s_, 230); c.fillStyle = C.white; c.textAlign = 'left'; c.fillText(s_, -60, (j - (ls.length - 1) / 2) * 42 + 4); }); c.restore(); });
  const svT = wAt('outro', 'пиши', sp.t + 2.55) - 0.1, sk = eBack(P(t, svT, svT + 0.3), 2.2), pulse = 1 + 0.05 * Math.sin(clamp((t - wAt('outro', 'сохрани', sp.t + 3.17)) / 0.5) * Math.PI);
  if (sk > 0) { c.save(); c.translate(540, 1000); c.scale(sk * pulse, sk * pulse); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -260 + 6, -60 + 10, 520, 120, 60); c.fill(); c.fillStyle = C.gold; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -260, -60, 520, 120, 60); c.fill(); c.stroke();
    c.fillStyle = C.oliveD; c.beginPath(); c.moveTo(-190, -32); c.lineTo(-146, -32); c.lineTo(-146, 34); c.lineTo(-168, 16); c.lineTo(-190, 34); c.closePath(); c.fill();   // bookmark icon
    textFit(c, 'Unb9', 50, 'СОХРАНИ', 330); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.fillText('СОХРАНИ', 40, 4); c.restore(); }
  const subT = Math.min(svT + 0.7, sp.t + sp.d - 1.0), bk = eBack(P(t, subT, subT + 0.3), 2), sy = 1200;
  if (bk > 0) { const click = P(t, subT + 0.8, subT + 0.95), pressed = t > subT + 0.9; c.save(); c.translate(560, sy); const ss = bk * (1 - 0.08 * Math.sin(click * Math.PI)); c.scale(ss, ss); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -250 + 6, -58 + 10, 500, 116, 58); c.fill(); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -250, -58, 500, 116, 58); c.fill(); textFit(c, 'Unb9', 42, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 440); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4); c.restore();
    const mv = eIO(P(t, subT + 0.2, subT + 0.8)); UI.tapCursor(c, lerp(900, 620, mv), lerp(sy + 260, sy + 20, mv), 1, P(t, subT + 0.85, subT + 1.4)); }
  c.save(); c.translate(0, -130); UI.captions(c, t); c.restore(); Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag.startsWith('ui:')) { ({ 'ui:plate': plateView, 'ui:pizza': pizzaView, 'ui:notes': notesView, 'ui:cal': calView })[tag](c, t); heads = { her: OFFL, flatmate: OFF }; proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.24); }
  const names = { flatmate: ['TOM', '#3E6FA8'] }, onScr = {}; for (const k in heads) if (Math.abs(heads[k].x) < 1e4) onScr[k] = heads[k];   // a speaker who is not in the shot never gets a bubble
  if (!tag.startsWith('ui:')) K.bubbles(c, t, sc, onScr, proj, { cleanChunks: true, names, hold: { hook_t: -0.2, o1_h: -0.22, o1_t: -0.2, o2_h: -0.22, o2_t: -0.25, o3_h: -0.22, o3_t: -0.2, o4_h: -0.15, o4_t: 0.2, end_t: -0.2 } });
  listIcons(c, t, tag);
  if (L === 'hook') title(c, t);
  plate(c, t, sc); if (L === 'end') nextDay(c, t);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  // the end screen wipes in from the twist
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('cake', NF, renderFrame);
