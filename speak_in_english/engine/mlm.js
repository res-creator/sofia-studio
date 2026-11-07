// "Подруга зовёт в «бизнес»" — rubric «Как ответить, когда…» (scene + 4 answers, worst -> best), hard_cut camera: node mlm.js start end out.mp4 | --png=f1,f2
// A cosy corner café, a table for two: the heroine (pink jumper) seated on the left with her coffee, friend Mia (purple "boss" blazer) seated on the right,
// glossy brochures fanned on the table, a pink SHAKE bottle and Mia's phone face down. Hook: Mia waves the BE YOUR OWN BOSS flyer (insert: START £300).
// o1 «В ЛОБ»: "It's a triangle of opportunity!" — she flips up a chart board; insert: TRIANGLE OF OPPORTUNITY (YOU at the bottom, £ arrows up to ME); facepalm.
// o2 «ВЕЖЛИВО»: "...I will drive a Tesla." — she rolls a toy car (tag MY TESLA) across the table into the heroine's cup; deadpan.
// o3 «КАК НОСИТЕЛЬ»: Mia deflates, "can I add you to the group chat?" — phone insert BOSS BABES (2,431 members, "Hey hun!" flood, ADD TO GROUP? YES / NO); tip.
// o4 «КОРОЛЕВСКИЙ ОТВЕТ»: sweet smile, she lifts her phone "Shall I invite her?"; Mia sweats.
// Twist (music off): Mia's phone buzzes on the table; insert "Upline: You owe me £900"; her shock; a forced grin and she holds out the shake bottle.
// The heroine looks into the camera. End screen 1/2/3/4, СОХРАНИ, ПОДПИСАТЬСЯ (cursor).
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/mlm/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];

// ---------------- cast: heroine as usual; Mia = blonde high pony, purple "boss" blazer, black skirt
const HER = { ...BASE.her_lift };
const MIA = { ...BASE.chloe, necklace: true, earrings: '#F2C14E', top: { type: 'blazer', col: '#7A4FC4', shirt: '#FFFFFF', tie: '#FFFFFF' }, bottom: { type: 'skirt', col: '#2B2F3A' }, shoes: { col: '#2B2F3A', acc: null } };
const MIA_COL = '#7A4FC4';
const G = { her: geom(HER), mia: geom(MIA) };
const SEAT = 330, TOP = -500;                 // seated upper body dropped by SEAT; table top at y = TOP
const HX = -330, MX = 330;                    // her / Mia seat x
const CUPX = HX + 175, SHX = MX + 215, PHX = MX - 150, BRX = 10;   // her cup, the shake bottle, Mia's phone (face down), brochures
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- props (local coords: (0,0) = bottom centre unless noted)
function cup(c, x, y, t, wob = 0) { c.save(); c.translate(x, y); c.rotate(Math.sin(t * 30) * 0.12 * wob);
  c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(0, 4, 110, 20, 0, 0, TAU); c.fill();
  c.fillStyle = '#F4F6FA'; c.beginPath(); c.ellipse(0, 0, 100, 18, 0, 0, TAU); c.fill(); c.strokeStyle = '#C9D0DA'; c.lineWidth = 4; c.stroke();
  paint(c, q => { q.m(-62, -150); q.l(62, -150); q.q(60, -10, 0, -8); q.q(-60, -10, -62, -150); q.z(); }, '#F7F2E8', { sd: 6, hd: 3, lw: 4 });
  c.strokeStyle = '#E6DCCB'; c.lineWidth = 14; c.beginPath(); c.arc(70, -95, 30, -1.2, 1.2); c.stroke();
  c.fillStyle = '#EE5E9A'; c.fillRect(-60, -110, 120, 16);
  c.fillStyle = '#6A4A32'; c.beginPath(); c.ellipse(0, -150, 60, 12, 0, 0, TAU); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 7; c.lineCap = 'round'; for (let i = 0; i < 3; i++) { const ph = t * 2 + i * 2.1; c.globalAlpha = 0.5 + 0.3 * Math.sin(ph); c.beginPath(); c.moveTo(-30 + i * 30, -175); c.bezierCurveTo(-50 + i * 30, -215, -10 + i * 30, -240, -30 + i * 30 + Math.sin(ph) * 8, -285); c.stroke(); } c.globalAlpha = 1; c.lineCap = 'butt';
  c.restore(); }
// the pink shake bottle (lid, lightning bolt, SHAKE label); (0,0) = bottom centre
function shake(c, s = 1, rot = 0) { c.save(); c.scale(s, s); c.rotate(rot);
  paint(c, q => { q.m(-52, 0); q.l(52, 0); q.l(58, -230); q.q(58, -260, 30, -265); q.l(-30, -265); q.q(-58, -260, -58, -230); q.z(); }, '#F58AB8', { sd: 8, hd: 4, lw: 4 });
  c.fillStyle = 'rgba(255,255,255,.35)'; rr(c, -40, -240, 18, 220, 9); c.fill();
  c.fillStyle = '#2B2F3A'; rr(c, -46, -305, 92, 44, 12); c.fill(); rr(c, -14, -335, 28, 34, 8); c.fill();
  c.fillStyle = '#FFFFFF'; rr(c, -50, -170, 100, 92, 10); c.fill();
  c.fillStyle = '#F2C14E'; c.beginPath(); c.moveTo(6, -165); c.lineTo(-22, -122); c.lineTo(-2, -122); c.lineTo(-10, -84); c.lineTo(22, -132); c.lineTo(2, -132); c.closePath(); c.fill();
  fitTxt(c, 'SHAKE', 0, -52, 30, '#C2407A', 96); c.restore(); }
const shakeItem = (rot = 0) => ctx => { ctx.save(); ctx.translate(0, 150); shake(ctx, 0.95, rot); ctx.restore(); };
// glossy brochures fanned on the table (seen from the front, slightly tilted)
function brochures(c, x, y) { c.save(); c.translate(x, y);
  const B = [['#EE5E9A', 'SUCCESS', -0.18, -120], ['#F2C14E', 'FREEDOM', 0.04, 0], ['#7A4FC4', '£££', 0.22, 120]];
  for (const [col, s, r, dx] of B) { c.save(); c.translate(dx, 0); c.rotate(r); c.fillStyle = 'rgba(0,0,0,.18)'; rr(c, -78, -32, 160, 36, 6); c.fill(); c.fillStyle = col; rr(c, -82, -38, 160, 36, 6); c.fill(); c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(-70, -32, 60, 6); fitTxt(c, s, 2, -18, 22, '#FFFFFF', 130); c.restore(); }
  c.restore(); }
// Mia's phone lying face down; buzz = vibrating
function phoneFlat(c, x, y, t, buzz = 0) { c.save(); c.translate(x + Math.sin(t * 90) * 6 * buzz, y); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -82, -10, 170, 18, 8); c.fill(); c.fillStyle = '#2B2F3A'; rr(c, -86, -24, 172, 24, 8); c.fill(); c.fillStyle = '#4A5060'; rr(c, -40, -22, 40, 6, 3); c.fill();
  if (buzz > 0) { c.strokeStyle = `rgba(43,47,58,${0.8 * buzz})`; c.lineWidth = 6; c.lineCap = 'round'; for (const s of [-1, 1]) for (let i = 0; i < 2; i++) { c.beginPath(); c.arc(s * 100, -14, 22 + i * 20, s < 0 ? Math.PI * 0.7 : -Math.PI * 0.3, s < 0 ? Math.PI * 1.3 : Math.PI * 0.3); c.stroke(); } c.lineCap = 'butt'; }
  c.restore(); }
// a small phone in the hand (screen facing the camera); (0,0) = bottom centre
function phoneHand(c, s = 1, scr = 'call') { c.save(); c.scale(s, s); c.fillStyle = '#2B2F3A'; rr(c, -62, -230, 124, 230, 18); c.fill();
  c.fillStyle = scr === 'call' ? '#4CAF6A' : '#F4F1EC'; rr(c, -52, -218, 104, 206, 12); c.fill();
  if (scr === 'call') { c.fillStyle = '#FFFFFF'; c.save(); c.translate(0, -120); c.rotate(-0.6); rr(c, -34, -12, 68, 24, 12); c.fill(); rr(c, -40, -22, 22, 34, 8); c.fill(); rr(c, 18, -22, 22, 34, 8); c.fill(); c.restore(); }
  else { c.fillStyle = '#7A4FC4'; c.fillRect(-52, -218, 104, 40); for (let i = 0; i < 4; i++) { c.fillStyle = i % 2 ? '#E9E3F7' : '#FFFFFF'; rr(c, -44 + (i % 2) * 20, -168 + i * 38, 70, 28, 10); c.fill(); } }
  c.restore(); }
const phoneItem = scr => ctx => { ctx.save(); ctx.translate(0, 120); phoneHand(ctx, 1, scr); ctx.restore(); };
// the BE YOUR OWN BOSS flyer (portrait); (0,0) = centre
function flyer(c, s = 1, rot = 0, big = false) { c.save(); c.scale(s, s); c.rotate(rot);
  c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -150 + 8, -210 + 12, 300, 420, 14); c.fill();
  const g = c.createLinearGradient(0, -210, 0, 210); g.addColorStop(0, '#FF7FB4'); g.addColorStop(1, '#C24FA0'); c.fillStyle = g; rr(c, -150, -210, 300, 420, 14); c.fill(); c.strokeStyle = '#F2C14E'; c.lineWidth = 8; c.stroke();
  fitTxt(c, 'BE YOUR', 0, -150, 56, '#FFFFFF', 260); fitTxt(c, 'OWN BOSS', 0, -92, 60, '#FFE15A', 270);
  c.fillStyle = '#FFE15A'; UI.star(c, 0, 0, 52, 0);
  if (big) { fitTxt(c, 'WORK FROM YOUR PHONE!', 0, 82, 22, '#FFFFFF', 260, 'Nun9'); }
  c.fillStyle = '#FFFFFF'; rr(c, -110, 112, 220, 70, 35); c.fill(); fitTxt(c, 'START: £300', 0, 148, 34, '#C2407A', 190);
  c.restore(); }
const flyerItem = (t, sw = 1) => ctx => { ctx.save(); ctx.translate(0, -150); ctx.rotate(Math.sin(t * 7) * 0.08 * sw); flyer(ctx, 0.9, -0.06); ctx.restore(); };
// the chart board Mia flips up (o1): small version of the insert; (0,0) = centre
function triangle(c, w, h, t, k = 1) { // TRIANGLE OF OPPORTUNITY: YOU at the bottom, ME at the top, £ arrows going up
  const tiers = [['ME', '#F2C14E'], ['MY UPLINE', '#EE9A5E'], ['YOU', '#8EC6E8']];
  for (let i = 0; i < 3; i++) { const y0 = -h / 2 + i * h / 3, y1 = y0 + h / 3, xa = w / 2 * (i / 3), xb = w / 2 * ((i + 1) / 3);
    c.fillStyle = tiers[i][1]; c.beginPath(); c.moveTo(-xa, y0); c.lineTo(xa, y0); c.lineTo(xb, y1); c.lineTo(-xb, y1); c.closePath(); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = Math.max(3, w / 90); c.stroke();
    if (i > 0) fitTxt(c, tiers[i][0], 0, (y0 + y1) / 2 + 4, h * 0.09, '#2B2F3A', xb * 1.4 + 10); }
  // crown on top for ME
  c.fillStyle = '#2B2F3A'; fitTxt(c, 'ME', 0, -h / 2 + h / 3 * 0.7, h * 0.07, '#2B2F3A', w * 0.1);
  if (k > 0) { for (let i = 0; i < 3; i++) { const u = ((t * 0.9 + i / 3) % 1), x = (i - 1) * w * 0.36, y = h / 2 - 20 - u * h * 0.75; c.save(); c.globalAlpha = k * Math.sin(u * Math.PI); c.translate(x, y); fitTxt(c, '£', 0, 0, h * 0.1, '#2E8A4A', h * 0.1); c.fillStyle = '#2E8A4A'; c.beginPath(); c.moveTo(-h * 0.04, -h * 0.07); c.lineTo(h * 0.04, -h * 0.07); c.lineTo(0, -h * 0.12); c.fill(); c.restore(); } } }
function board(c, s = 1, t = 0) { c.save(); c.scale(s, s); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -190 + 8, -150 + 12, 380, 300, 12); c.fill(); c.fillStyle = '#FFFFFF'; rr(c, -190, -150, 380, 300, 12); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 6; c.stroke();
  fitTxt(c, 'OPPORTUNITY', 0, -118, 40, '#7A4FC4', 330); c.save(); c.translate(0, 30); triangle(c, 300, 210, t, 0); c.restore(); c.restore(); }
const boardItem = (t, k) => ctx => { ctx.save(); ctx.translate(-30, -110); ctx.scale(1, lerp(0.05, 1, k)); board(ctx, 0.85, t); ctx.restore(); };
// the toy car (o2): small red sports car with a paper tag MY TESLA; (0,0) = bottom centre, facing left
function toyCar(c, s = 1, t = 0, spin = 0) { c.save(); c.scale(s, s);
  paint(c, q => { q.m(-110, -20); q.q(-115, -52, -80, -56); q.l(-40, -60); q.q(-10, -98, 30, -98); q.l(60, -96); q.q(92, -80, 104, -56); q.q(118, -50, 114, -20); q.z(); }, '#E0474C', { sd: 5, hd: 2, lw: 4 });
  c.fillStyle = '#9CCBE4'; c.beginPath(); c.moveTo(-28, -62); c.quadraticCurveTo(-4, -90, 26, -90); c.lineTo(28, -62); c.closePath(); c.fill(); c.beginPath(); c.moveTo(40, -62); c.lineTo(40, -90); c.lineTo(58, -88); c.quadraticCurveTo(80, -76, 88, -62); c.closePath(); c.fill();
  c.fillStyle = '#FFF6C0'; c.beginPath(); c.ellipse(-104, -40, 8, 6, 0, 0, TAU); c.fill();
  for (const wx of [-66, 72]) { c.save(); c.translate(wx, -18); c.rotate(spin); c.fillStyle = '#22252E'; c.beginPath(); c.arc(0, 0, 22, 0, TAU); c.fill(); c.fillStyle = '#C9D2DA'; c.beginPath(); c.arc(0, 0, 9, 0, TAU); c.fill(); c.fillStyle = '#22252E'; c.fillRect(-2, -9, 4, 18); c.restore(); }
  // paper tag on a string
  c.strokeStyle = '#8A8480'; c.lineWidth = 3; c.beginPath(); c.moveTo(60, -94); c.quadraticCurveTo(90, -130, 120, -128); c.stroke();
  c.save(); c.translate(150, -128); c.rotate(0.12); c.fillStyle = '#FFFDF2'; rr(c, -40, -22, 96, 44, 6); c.fill(); c.strokeStyle = '#C9BBA8'; c.lineWidth = 3; c.stroke(); fitTxt(c, 'MY TESLA', 8, 1, 20, '#E0474C', 84); c.restore();
  c.restore(); }
function sweat(c, hd, t, k) { if (k <= 0) return; c.save(); c.globalAlpha = k; for (let i = 0; i < 3; i++) { const u = ((t * 1.4 + i * 0.33) % 1), x = hd.x + (i - 1) * hd.hh * 0.9 + (i === 1 ? hd.hh * 1.3 : 0), y = hd.y - hd.hh * 0.9 + u * hd.hh * 0.9;
  c.fillStyle = '#7CC7F2'; c.strokeStyle = '#2E7AB0'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - hd.hh * 0.16); c.quadraticCurveTo(x + hd.hh * 0.09, y, x, y + hd.hh * 0.06); c.quadraticCurveTo(x - hd.hh * 0.09, y, x, y - hd.hh * 0.16); c.fill(); c.stroke(); } c.restore(); }

// ---------------- café (prerendered, softly blurred)
const BX0 = -2800, BY0 = -3600, BW = 5600, BH = 5400, BS = 0.5;
function drawCafe(c) {
  c.fillStyle = '#F3E3C8'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = 'rgba(200,150,110,.10)'; for (let x = BX0; x < BX0 + BW; x += 180) c.fillRect(x, BY0, 70, 3400);   // wallpaper stripes
  // big windows to the street (left + right)
  for (const [x, w] of [[-2600, 1250], [1350, 1250]]) { c.fillStyle = '#6A4A32'; c.fillRect(x - 30, -2900, w + 60, 1760); const g = c.createLinearGradient(0, -2870, 0, -1170); g.addColorStop(0, '#9ED4F2'); g.addColorStop(1, '#D9EFFA'); c.fillStyle = g; c.fillRect(x, -2870, w, 1700);
    c.fillStyle = '#C98A5A'; c.fillRect(x, -2300, w, 900); c.fillStyle = '#F7F4EE'; for (let i = 0; i < 3; i++) c.fillRect(x + 80 + i * 400, -2150, 240, 380);
    c.fillStyle = '#8CB8D8'; for (let i = 0; i < 3; i++) c.fillRect(x + 100 + i * 400, -2130, 200, 340);
    c.fillStyle = '#5E636E'; c.fillRect(x, -1400, w, 230);
    c.fillStyle = 'rgba(255,255,255,.25)'; c.beginPath(); c.moveTo(x + 100, -2870); c.lineTo(x + 330, -2870); c.lineTo(x + 60, -1170); c.lineTo(x - 0, -1170); c.fill();
    c.fillStyle = '#6A4A32'; c.fillRect(x + w / 2 - 14, -2870, 28, 1700); c.fillRect(x, -2040, w, 22);
    // striped awning band at the top of the window
    for (let i = 0; i < 10; i++) { c.fillStyle = i % 2 ? '#FFFFFF' : '#2E7A6A'; c.fillRect(x + i * w / 10, -2870, w / 10, 120); } }
  // chalkboard menu in the middle (English only)
  c.fillStyle = '#6A4A32'; rr(c, -720, -3000, 1440, 1000, 26); c.fill(); c.fillStyle = '#2E3A36'; rr(c, -680, -2960, 1360, 920, 18); c.fill();
  fitTxt(c, 'CORNER CAFE', 0, -2830, 110, '#F7F4EE', 1100);
  c.strokeStyle = 'rgba(247,244,238,.7)'; c.lineWidth = 6; c.beginPath(); c.moveTo(-500, -2730); c.lineTo(500, -2730); c.stroke();
  for (const [s, p, y] of [['FLAT WHITE', '£3.20', -2620], ['TEA', '£2.50', -2480], ['CAKE', '£4.00', -2340], ['TOASTIE', '£5.50', -2200]]) { fitTxt(c, s, -560, y, 70, '#F7F4EE', 700, 'Unb9', 'left'); fitTxt(c, p, 560, y, 70, '#F2C14E', 300, 'Unb9', 'right'); }
  // pendant lamps
  for (const x of [-1400, 0, 1400]) { c.strokeStyle = '#2B2F3A'; c.lineWidth = 8; c.beginPath(); c.moveTo(x, BY0); c.lineTo(x, -3100 + (x === 0 ? -300 : 200)); c.stroke(); }
  // shelf with cups + plants (behind the table, at head height)
  c.fillStyle = '#8A5A3A'; c.fillRect(-2600, -1060, 5200, 26);
  // wood panelling below
  c.fillStyle = '#B07A4E'; c.fillRect(BX0, -1150, BW, 960); c.fillStyle = '#9A6640'; c.fillRect(BX0, -1170, BW, 30);
  c.fillStyle = 'rgba(0,0,0,.08)'; for (let x = BX0; x < BX0 + BW; x += 220) c.fillRect(x, -1140, 8, 940);
  for (let x = BX0 + 60; x < BX0 + BW; x += 220) { c.fillStyle = 'rgba(255,255,255,.06)'; rr(c, x, -1080, 160, 800, 10); c.fill(); }
  // plants in pots on the left and right
  for (const [x, s] of [[-2100, 1], [2150, 1.1]]) { c.fillStyle = '#C8683E'; rr(c, x - 150 * s, -560, 300 * s, 360, 30); c.fill(); c.fillStyle = '#4E9A4A'; for (let i = 0; i < 7; i++) { c.beginPath(); c.ellipse(x - 120 * s + i * 40 * s, -700 - (i % 3) * 120, 70 * s, 210, -0.6 + i * 0.2, 0, TAU); c.fill(); } }
  // floor: chequered tiles
  c.fillStyle = '#E9E1D2'; c.fillRect(BX0, -200, BW, BY0 + BH + 200); c.fillStyle = '#B9AE9A';
  for (let y = -200, r = 0; y < BY0 + BH; y += 160, r++) for (let x = BX0 + (r % 2) * 160; x < BX0 + BW; x += 320) c.fillRect(x, y, 160, 160);
  c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(BX0, -200, BW, 18);
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawCafe);
function lamp(c, x, y, t) { c.fillStyle = '#2B2F3A'; c.beginPath(); c.moveTo(x - 150, y); c.lineTo(x + 150, y); c.lineTo(x + 60, y - 120); c.lineTo(x - 60, y - 120); c.closePath(); c.fill();
  const g = c.createRadialGradient(x, y + 20, 10, x, y + 20, 320); g.addColorStop(0, 'rgba(255,220,140,.55)'); g.addColorStop(1, 'rgba(255,220,140,0)'); c.fillStyle = g; c.fillRect(x - 320, y - 300, 640, 640); c.fillStyle = '#FFE7A0'; c.beginPath(); c.arc(x, y + 6, 36, 0, Math.PI); c.fill(); }
function chair(c, x) { c.strokeStyle = '#4A2E1E'; c.lineWidth = 34; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - 150, -380); c.lineTo(x - 160, -1000); c.quadraticCurveTo(x, -1090, x + 160, -1000); c.lineTo(x + 150, -380); c.stroke();
  c.lineWidth = 20; for (const dy of [-880, -760]) { c.beginPath(); c.moveTo(x - 155, dy); c.quadraticCurveTo(x, dy - 40, x + 155, dy); c.stroke(); } c.lineCap = 'butt'; }

// ---------------- what lies on the table at time t
const toyX = (t, L) => { if (L !== 'o2') return null; const a = ev('o2', 'toy'), b = ev('o2', 'bump'); if (t < a) return null; return lerp(MX - 160, CUPX + 250, eOut(clamp((t - a) / (b - a)))) + (t > b ? Math.sin((t - b) * 30) * 6 * Math.exp(-(t - b) * 6) : 0); };
const shakeInHand = (t, L) => L === 'end' && t > ev('end', 'offer');
const phoneInHand = (t, L) => (L === 'o3' && t > wAt('o3_m', 'add', 1e9) - 0.25) || (L === 'end' && t > ev('end', 'msg') && t < ev('end', 'offer'));
function tableFront(c, t, L) {
  c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(-780, -20, 1560, 40);
  paint(c, q => { q.m(-720, TOP); q.l(720, TOP); q.l(750, -10); q.l(-750, -10); q.z(); }, '#FFFDF8', { sd: 6, hd: 3, lw: 4, inner: k => { k.fillStyle = 'rgba(46,122,106,.16)'; for (let x = -760; x < 760; x += 120) k.fillRect(x, TOP, 60, 520); for (let y = TOP + 30; y < 0; y += 120) k.fillRect(-760, y, 1520, 60); } });
  c.fillStyle = '#2E7A6A'; c.fillRect(-740, -80, 1480, 22);
  paint(c, q => { q.m(-760, TOP - 40); q.l(760, TOP - 40); q.l(730, TOP + 12); q.l(-730, TOP + 12); q.z(); }, '#F4EAD8', { sd: 4, hd: 2, lw: 4 });   // table top
  brochures(c, BRX, TOP - 6);
  cup(c, CUPX, TOP - 14, t, L === 'o2' ? clamp((t - ev('o2', 'bump')) / 0.05) * Math.exp(-Math.max(0, t - ev('o2', 'bump')) * 5) : 0);
  if (!shakeInHand(t, L)) { c.save(); c.translate(SHX, TOP - 12); shake(c, 0.95); c.restore(); }
  if (!phoneInHand(t, L) && !(L === 'end' && t > ev('end', 'msg'))) phoneFlat(c, PHX, TOP - 6, t, L === 'end' && t > ev('end', 'buzz') ? (Math.sin((t - ev('end', 'buzz')) * 9) > -0.2 ? 1 : 0.2) : 0);
  if (L === 'end' && t > ev('end', 'offer')) phoneFlat(c, PHX, TOP - 6, t, 0);
  const tx = toyX(t, L); if (tx !== null) { c.save(); c.translate(tx, TOP - 10); toyCar(c, 1.7, t, t < ev('o2', 'bump') ? -t * 30 : 0); c.restore(); }
  K.mark(c, 'table', 0, TOP - 100, 420); }

// ---------------- characters
const gest = (st, g, who, t, side, base) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20, { planar: true }); } };
const onTable = (g, s) => reach(g, s, s * g.sw * 0.7, g.ySh + 335, { planar: true });
const toW = (g, s, x0, wx, wy, o = { planar: true }) => reach(g, s, wx - x0, wy - SEAT, o);   // seated: world target -> body-local target
const open = (g, s, k = 1.7, dy = 90) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const forehead = (g, s = 1) => reach(g, s, s * g.hw * 0.15, g.headY - g.hh * 0.42, { planar: true });
const seated = (g, t, who) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, legPose: 'sit', drop: SEAT, legs: false, armL: onTable(g, -1), armR: onTable(g, 1), items: {} });
const wAt = (id, w, fb) => K.wordT(id, w) ?? fb;
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { ...seated(g, t, 'her'), mood: 'neutral', turn: 0.3, look: 0.7 };
  const cupHold = () => { st.armR = toW(g, 1, HX, CUPX - 40, TOP - 70); };
  if (L === 'hook') { st.mood = 'skeptical'; cupHold(); st.lookY = -0.15;
    if (t > hev('nar')) { st.mood = 'annoyed'; st.look = 0.8; }
    if (t > hev('wide')) { st.mood = 'skeptical'; } }
  if (L === 'o1') { st.mood = 'skeptical'; cupHold();
    if (speaking('o1_h', t, 0.05, 0.15)) { st.mood = 'angry'; st.armL = open(g, -1, 2.0, 40 + Math.sin(t * 9) * 25); st.armR = reach(g, 1, g.sw * 2.0, g.ySh + 60 + Math.sin(t * 9) * 20, { planar: true }); }
    if (t > SP.o1_m.t) { st.mood = 'surprised'; }
    if (t > e('palm')) { st.mood = 'tired'; st.blink = 1; st.headFirst = true; st.armL = forehead(g, -1); st.headY = 6; st.look = 0; st.turn = 0.1; cupHold(); } }
  if (L === 'o2') { st.mood = 'neutral'; cupHold();
    if (speaking('o2_h', t, 0.05, 0.15)) { st.mood = 'happy'; gest(st, g, 'her', t, -1, 160); }
    if (t > SP.o2_m.t) { st.mood = 'skeptical'; }
    if (t > e('toy')) { st.mood = 'surprised'; st.look = 0.4; st.lookY = 0.5; st.armR = onTable(g, 1); }
    if (t > e('bump')) { st.mood = 'shock'; st.blink = 0; st.lookY = 0.6; st.look = 0.5; }
    if (t > e('dead')) { st.mood = 'bored'; st.blink = 0.45; st.look = 0; st.lookY = 0; st.turn = 0.05; st.armL = onTable(g, -1); } }
  if (L === 'o3') { st.mood = 'neutral'; cupHold();
    if (speaking('o3_h', t, 0.05, 0.15)) { st.mood = 'happy'; gest(st, g, 'her', t, -1, 140); }
    if (t > SP.o3_m.t) { st.mood = 'happy'; st.look = 0.7; }
    if (t > e('nope')) { st.mood = 'happy'; st.blink = 1; st.look = 0.4; st.armL = open(g, -1, 1.6, 120); st.armR = open(g, 1, 1.6, 120); }
    if (t > SP.o3_nar.t) { st.blink = 0; st.mood = 'happy'; } }
  if (L === 'o4') { st.mood = 'smug'; cupHold();
    if (speaking('o4_h', t, 0.05, 0.1)) { const u = t - SP.o4_h.t; st.mood = 'happy'; st.look = 0.8; st.armL = reach(g, -1, -g.sw * (1.5 + 0.2 * Math.sin(u * 3)), g.ySh + 200 + Math.cos(u * 3) * 25, { planar: true }); }
    if (t > e('phone') - 0.1) { const k = eOut(clamp((t - e('phone') + 0.1) / 0.3)); st.armR = toW(g, 1, HX, lerp(CUPX - 40, HX + 230, k), lerp(TOP - 70, -1000, k)); st.items = { R: phoneItem('call') }; st.mood = 'smug'; }
    if (t > endOf('o4_h') + 0.05) { st.mood = 'smug'; st.blink = 1; } }
  if (L === 'end') { st.mood = 'smug'; cupHold();
    if (t > ev('end', 'buzz')) { st.mood = 'surprised'; st.look = 0.8; st.lookY = 0.4; }
    if (t > ev('end', 'offer')) { st.mood = 'skeptical'; st.lookY = 0; st.look = 0.8; }
    if (t > ev('end', 'look')) { st.mood = 'bored'; st.blink = 0.4; st.look = 0; st.lookY = 0; st.turn = 0; st.armL = onTable(g, -1); }
    if (t > SP.moral.t + 0.8) { st.mood = 'smug'; st.blink = 0.2; } }
  return st; }
function miaState(t, L) { const g = G.mia, e = k => ev(L, k), st = { ...seated(g, t, 'mia'), mood: 'happy', turn: -0.3, look: -0.7 };
  if (L === 'hook') { st.mood = 'happy'; st.laugh = !speaking('hook_m', t); st.armL = toW(g, -1, MX, MX - 300, -830 + Math.sin(t * 6) * 18); st.items = { L: flyerItem(t, 1) };
    if (speaking('hook_m', t, 0.05, 0.1)) gest(st, g, 'mia', t, 1, 120);
    if (t > hev('nar')) { st.mood = 'happy'; st.laugh = true; st.blink = 1; } }
  if (L === 'o1') { st.mood = 'happy';
    if (speaking('o1_h', t, 0.1, 0.1)) { st.mood = 'shock'; st.blink = 0; }
    if (speaking('o1_m', t, 0.05, 0.1)) { st.mood = 'annoyed'; st.turn = -0.35; }
    const b = e('board'); if (t > b - 0.15) { const k = eBack(clamp((t - b + 0.15) / 0.3), 1.6); st.armL = toW(g, -1, MX, MX - 200, -800); st.armR = toW(g, 1, MX, MX + 120, -800); st.items = { L: boardItem(t, clamp(k)) }; st.mood = 'happy'; st.look = -0.6; }
    if (t > endOf('o1_m')) { st.mood = 'smug'; st.blink = 1; } }
  if (L === 'o2') { st.mood = 'neutral';
    if (speaking('o2_h', t, 0.1, 0.1)) { st.mood = 'surprised'; }
    if (speaking('o2_m', t, 0.05, 0.1)) { st.mood = 'happy'; st.lookY = -0.6; st.look = -0.2; st.turn = -0.15; st.headFirst = true; st.armL = reach(g, -1, -g.hw * 0.45, g.headY + g.hh * 1.25 + Math.sin(t * 3) * 6, { planar: true }); st.armR = reach(g, 1, g.hw * 0.45, g.headY + g.hh * 1.25 + Math.sin(t * 3) * 6, { planar: true });   // dreamy: hands clasped under the chin, in front st.blink = t > wAt('o2_m', 'now', 1e9) ? 1 : 0;
      if (t > wAt('o2_m', 'well', 1e9) - 0.1) { st.headFirst = false; st.armL = onTable(g, -1); st.armR = onTable(g, 1); st.mood = 'worried'; st.blink = 0; st.lookY = 0; st.look = -0.6; } }
    if (t > e('toy') - 0.2) { const k = eOut(clamp((t - e('toy') + 0.2) / 0.5)); st.armL = toW(g, -1, MX, lerp(MX - 120, MX - 300, k), TOP - 60); st.mood = 'happy'; st.laugh = true; st.look = -0.8; st.lookY = 0.4; }
    if (t > e('dead')) { st.mood = 'happy'; st.laugh = false; st.lookY = 0; st.look = -0.7; st.armL = onTable(g, -1); } }
  if (L === 'o3') { st.mood = 'happy';
    if (speaking('o3_h', t, 0.1, 0.1)) { st.mood = 'surprised'; }
    if (t > e('deflate')) { const k = eOut(clamp((t - e('deflate')) / 0.4)); st.mood = 'sad'; st.headY = 24 * k; st.tilt = 0.08 * k; st.lookY = 0.3; st.look = -0.5; }
    if (t > wAt('o3_m', 'can', 1e9)) { st.mood = 'worried'; st.tilt = 0.04; st.lookY = 0; st.look = -0.7; }
    if (phoneInHand(t, L)) { st.armL = toW(g, -1, MX, MX - 230, -960); st.items = { L: phoneItem('chat') }; st.mood = 'happy'; }
    if (t > e('nope')) { st.mood = 'sad'; st.headY = 20; st.items = {}; st.armL = onTable(g, -1); } }
  if (L === 'o4') { st.mood = 'happy';
    if (speaking('o4_h', t, 0, 0)) { st.mood = t > SP.o4_h.t + 3.0 ? 'worried' : 'happy'; if (t > ev('o4', 'phone')) st.mood = 'shock'; }
    if (t > e('gasp')) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; }
    if (t > SP.o4_m.t) { st.mood = 'worried'; st.armL = reach(g, -1, -g.sw * 0.45, g.ySh + 300, { planar: true }); st.armR = reach(g, 1, g.sw * 0.45, g.ySh + 300, { planar: true }); st.tilt = Math.sin(t * 10) * 0.03; } }
  if (L === 'end') { st.mood = 'worried';
    if (t > ev('end', 'buzz')) { st.mood = 'surprised'; st.lookY = 0.5; st.look = -0.2; }
    if (phoneInHand(t, L)) { st.armR = toW(g, 1, MX, MX + 60, -900); st.items = { R: phoneItem('dark') }; st.lookY = 0.3; st.look = 0.1; }
    if (t > ev('end', 'shock')) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; }
    if (t > ev('end', 'offer')) { const k = eOut(clamp((t - ev('end', 'offer')) / 0.4)); st.mood = 'happy'; st.blink = 0; st.lookY = 0; st.look = -0.8; st.turn = -0.3; st.armR = onTable(g, 1);
      st.armL = toW(g, -1, MX, lerp(SHX, MX - 420, k), lerp(TOP - 120, -820, k)); st.items = { L: shakeItem(-0.1) }; } }
  return st; }

// ---------------- world + which characters each shot draws
const DRAW = { wide: ['her', 'mia'], cover: ['her', 'mia'], two: ['her', 'mia'], her: ['her'], mia: ['mia'], table: [] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGR, BX0, BY0, BW, BH); for (const x of [-1400, 1400]) lamp(c, x, -2900, t); lamp(c, 0, -3400, t);
  chair(c, HX); chair(c, MX);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), HX, 0);
  if (who.includes('mia')) heads.mia = K.put(c, MIA, miaState(t, L), MX, 0);
  tableFront(c, t, L);
  if (heads.mia && ((L === 'o4' && t > SP.o4_h.t + 3.0) || (L === 'end' && t > ev('end', 'shock') && t < ev('end', 'offer') + 0.3))) sweat(c, heads.mia, t, clamp((t - (L === 'o4' ? SP.o4_h.t + 3.0 : ev('end', 'shock'))) / 0.3));
  if (!heads.her) heads.her = OFFL; if (!heads.mia) heads.mia = OFF;
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const hHY = G.her.headY + SEAT, mHY = G.mia.headY + SEAT;
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(0, fy(mHY, 0.74, 1060), 0.74, 'cover'), WIDE: S(0, fy(mHY, 0.58, 780), 0.58, 'wide'), TWO: S(40, fy(hHY, 0.72, 760), 0.72, 'two'),
  HER: S(HX + 30, fy(hHY, 1.0), 1.0, 'her'), HER_R: S(HX + 20, fy(hHY, 1.15, 820), 1.15, 'her'),
  MIA: S(MX - 30, fy(mHY, 1.0), 1.0, 'mia'), MIA_CU: S(MX - 20, fy(mHY, 1.25, 860), 1.25, 'mia'),
  PHONE: S(PHX + 60, TOP - 140, 2.0, 'table'),
  FLYER: U('flyer', 1), CHART: U('chart', 2), CHAT: U('chat', 3), UPLINE: U('upline', 4) };
const HO = 0.12;   // handover: cut to the next speaker this long before the line starts
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < hev('nar') - 0.02) return SH.COVER; if (t < hev('flyer') - 0.05) return f(SH.HER_R); if (t < hev('wide') - 0.05) return f(SH.FLYER); return f(SH.WIDE); }
  if (L === 'o1') { if (t < SP.o1_h.t - HO) return f(SH.WIDE); if (t < SP.o1_m.t - HO) return f(SH.HER); if (t < e('chart')) return f(SH.MIA); if (t < e('palm') - 0.02) return f(SH.CHART); return f(SH.HER_R); }
  if (L === 'o2') { if (t < SP.o2_h.t - HO) return f(SH.WIDE); if (t < SP.o2_m.t - HO) return f(SH.HER); if (t < e('toy') - 0.02) return f(SH.MIA); if (t < e('dead') - 0.02) return f(SH.TWO); return f(SH.HER_R); }
  if (L === 'o3') { if (t < SP.o3_h.t - HO) return f(SH.WIDE); if (t < SP.o3_m.t - HO) return f(SH.HER); if (t < e('chat')) return f(SH.MIA); if (t < e('nope') - 0.02) return f(SH.CHAT); return f(SH.HER_R); }
  if (L === 'o4') { if (t < SP.o4_h.t - HO) return f(SH.WIDE); if (t < SP.o4_m.t - HO) return f(SH.HER); return f(SH.MIA_CU); }
  if (L === 'end') { if (t < e('msg') - 0.02) return f(SH.PHONE); if (t < e('shock') - 0.02) return f(SH.UPLINE); if (t < e('look') - 0.02) return f(SH.MIA); if (t < SP.moral.t - 0.02) return f(SH.HER_R); return f(SH.WIDE); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake_ = E.makeShake(TL, ['impact', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- inserts on a solid backdrop
function backdrop(c, t, a, b) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.08)'; for (let i = -12; i < 12; i++) c.fillRect(-1600, i * 160 + (t * 40) % 160, 3200, 60); c.restore(); }
const QA = (c, id) => { if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id }); };
// hook: the flyer, START: £300 gets a red ring
function flyerView(c, t) { backdrop(c, t, '#F7E3B0', '#E3B860'); QA(c, 'flyer'); const t0 = hev('flyer'), u = t - t0, k = eBack(clamp((u + 0.05) / 0.3), 1.6);
  c.save(); c.translate(540, 800); c.rotate(-0.04); c.scale(2.35 * k, 2.35 * k); flyer(c, 1, 0, true);
  const rk = eBack(clamp((u - 0.7) / 0.25), 2); if (rk > 0) { c.save(); c.translate(0, 148); c.scale(rk, rk); c.strokeStyle = '#E0474C'; c.lineWidth = 7; c.beginPath(); c.ellipse(0, 0, 135, 50, -0.05, 0, TAU); c.stroke(); c.restore(); }
  c.restore(); }
// o1: the chart (big)
function chartView(c, t) { backdrop(c, t, '#E9E3F7', '#B9A2E6'); QA(c, 'chart'); const t0 = ev('o1', 'chart'), u = t - t0, k = eBack(clamp((u + 0.05) / 0.3), 1.6);
  c.save(); c.translate(540, 860); c.rotate(-0.03); c.scale(k, k);
  c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -440 + 12, -520 + 16, 880, 1000, 30); c.fill(); c.fillStyle = '#FFFFFF'; rr(c, -440, -520, 880, 1000, 30); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 10; c.stroke();
  fitTxt(c, 'TRIANGLE OF', 0, -440, 64, '#2B2F3A', 760); fitTxt(c, 'OPPORTUNITY', 0, -360, 92, '#7A4FC4', 800);
  c.save(); c.translate(0, 70); triangle(c, 720, 640, t, clamp((u - 0.3) / 0.2)); c.restore();
  // a tiny crown over ME
  c.fillStyle = '#F2C14E'; c.strokeStyle = '#2B2F3A'; c.lineWidth = 5; c.beginPath(); c.moveTo(-34, -262); c.lineTo(-34, -290); c.lineTo(-17, -274); c.lineTo(0, -298); c.lineTo(17, -274); c.lineTo(34, -290); c.lineTo(34, -262); c.closePath(); c.fill(); c.stroke();
  c.restore(); }
// o3: the BOSS BABES group chat flood + ADD TO GROUP? YES / NO
function chatView(c, t) { backdrop(c, t, '#E9E3F7', '#B9A2E6'); QA(c, 'chat'); const t0 = ev('o3', 'chat'), u = t - t0, k = eBack(clamp((u + 0.05) / 0.3), 1.6);
  K.phone(c, 540, 930, 1.45 * k, (q, w, h) => { q.fillStyle = '#F4F1EC'; q.fillRect(0, 0, w, h); q.fillStyle = '#7A4FC4'; q.fillRect(0, 0, w, 130);
    q.fillStyle = '#F2C14E'; q.beginPath(); q.arc(58, 66, 34, 0, TAU); q.fill(); q.fillStyle = '#7A4FC4'; UI.star(q, 58, 66, 20, 0);
    fitTxt(q, 'BOSS BABES', 108, 50, 40, '#FFFFFF', w - 130, 'Unb9', 'left'); fitTxt(q, '2,431 members', 108, 96, 24, '#E9E3F7', w - 130, 'Nun9', 'left');
    const msgs = ['Hey hun!', 'Hey hun!!', 'Babe, DM me', 'Hey hun!', 'Join my team!'];
    msgs.forEach((m, i) => { const a = eBack(clamp((u - 0.25 - i * 0.2) / 0.2), 2); if (a <= 0) return; const y = 180 + i * 84, left = i % 2 === 0; q.save(); q.translate(left ? 30 : w - 30, y); q.scale(a, a);
      q.fillStyle = left ? '#FFFFFF' : '#E3D8F7'; UI.font(q, 'Nun9', 30); const tw = q.measureText(m).width + 40; rr(q, left ? 0 : -tw, -30, tw, 60, 26); q.fill(); q.fillStyle = '#2B2F3A'; q.textAlign = left ? 'left' : 'right'; q.textBaseline = 'middle'; q.fillText(m, left ? 20 : -20, 2); q.restore(); });
    const b = eBack(clamp((u - 0.95) / 0.25), 2); if (b > 0) { q.save(); q.translate(w / 2, h - 110); q.scale(b, b); q.fillStyle = '#FFFFFF'; rr(q, -180, -80, 360, 160, 24); q.fill(); q.strokeStyle = '#7A4FC4'; q.lineWidth = 4; q.stroke();
      fitTxt(q, 'ADD TO GROUP?', 0, -40, 32, '#2B2F3A', 320); q.fillStyle = '#4CAF6A'; rr(q, -160, 0, 150, 60, 30); q.fill(); fitTxt(q, 'YES', -85, 31, 28, '#FFFFFF', 120); q.fillStyle = '#E0474C'; rr(q, 10, 0, 150, 60, 30); q.fill(); fitTxt(q, 'NO', 85, 31, 28, '#FFFFFF', 120); q.restore(); } });
  // notification counter bubble on the phone corner
  const n = Math.min(99, Math.floor(clamp((u - 0.2) / 1.0) * 99)); if (n > 0) { c.save(); c.translate(540 + 300 * 1.45 * k * 0.72, 930 - 400 * 1.45 * k * 0.92); c.fillStyle = '#E0474C'; c.beginPath(); c.arc(0, 0, 58, 0, TAU); c.fill(); c.strokeStyle = '#FFFFFF'; c.lineWidth = 6; c.stroke(); fitTxt(c, n >= 99 ? '99+' : String(n), 0, 3, 44, '#FFFFFF', 90); c.restore(); } }
// twist: Mia's lock screen, the upline's message
function uplineView(c, t) { backdrop(c, t, '#2F3A4A', '#1C232E'); QA(c, 'upline'); const t0 = ev('end', 'msg'), u = t - t0, k = eBack(clamp((u + 0.05) / 0.3), 1.6);
  K.phone(c, 540, 930, 1.45 * k, (q, w, h) => { const g = q.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#C24FA0'); g.addColorStop(1, '#5A2E8A'); q.fillStyle = g; q.fillRect(0, 0, w, h);
    fitTxt(q, '12:41', w / 2, 120, 96, '#FFFFFF', w - 40); fitTxt(q, 'Saturday', w / 2, 190, 30, '#F4E6F7', w - 40, 'Nun9');
    const a = eBack(clamp((u - 0.2) / 0.25), 2); if (a > 0) { q.save(); q.translate(w / 2, 330); q.scale(a, a); q.fillStyle = 'rgba(255,255,255,.95)'; rr(q, -190, -80, 380, 170, 26); q.fill();
      q.fillStyle = '#7A4FC4'; rr(q, -168, -60, 48, 48, 12); q.fill(); q.fillStyle = '#FFFFFF'; q.beginPath(); q.moveTo(-160, -50); q.lineTo(-128, -50); q.quadraticCurveTo(-124, -50, -124, -44); q.lineTo(-124, -28); q.quadraticCurveTo(-124, -22, -130, -22); q.lineTo(-146, -22); q.lineTo(-156, -14); q.lineTo(-154, -22); q.quadraticCurveTo(-164, -22, -164, -30); q.lineTo(-164, -44); q.quadraticCurveTo(-164, -50, -160, -50); q.fill();
      fitTxt(q, 'Upline', -108, -36, 30, '#2B2F3A', 180, 'Unb9', 'left'); fitTxt(q, 'now', 170, -36, 22, '#8A93A2', 80, 'Nun9', 'right');
      fitTxt(q, 'You owe me £900', -168, 32, 40, '#E0474C', 340, 'Unb9', 'left'); q.restore(); } });
  const sh = u > 0.2 && u < 0.6 ? Math.sin(u * 80) * 6 : 0; if (sh) { c.save(); c.globalAlpha = 0.6; c.strokeStyle = '#FFFFFF'; c.lineWidth = 8; c.lineCap = 'round'; for (const s of [-1, 1]) { c.beginPath(); c.arc(540 + s * 380, 930, 60, s < 0 ? Math.PI * 0.75 : -Math.PI * 0.25, s < 0 ? Math.PI * 1.25 : Math.PI * 0.25); c.stroke(); } c.restore(); } }

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

// ---------------- end screen: question, 1 / 2 / 3 / 4, СОХРАНИ, ПОДПИСАТЬСЯ clicked by the cursor
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, { textFit, strokeText, font } = UI;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // heroine + Mia holding up her shake (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34, 2nd character at local x 640)
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gm = G.mia; K.put(c, MIA, { t, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, items: { L: shakeItem(-0.15) }, armL: reach(gm, -1, -gm.sw * 1.5, gm.ySh + 60 + Math.sin(t * 6) * 15, { planar: true }), armR: reach(gm, 1, gm.sw * 0.9, gm.ySh + 330, { planar: true }) }, 640, 0);
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 160 + Math.sin(t * 8) * 30, { planar: true }), armR: reach(g, 1, g.sw * 0.8, g.ySh + 330), items: {} }, 0, 0); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const q = eBack(P(u, 0.2, 0.55), 2.2); c.save(); c.translate(540, 300); c.scale(q, q); font(c, 'Unb9', 64); strokeText(c, 'А ТЫ БЫ', 0, -50, C.oliveD, C.white, 14); strokeText(c, 'ОТВЕТИЛА КАК?', 0, 40, C.pink, C.white, 14); c.restore();
  const tw = [wAt('outro', 'один', sp.t + 1.14), wAt('outro', 'два', sp.t + 1.41), wAt('outro', 'три', sp.t + 1.62), wAt('outro', 'четыре', sp.t + 2.06)];
  const LBL = { o1: ['В ЛОБ'], o2: ['ВЕЖЛИВО'], o3: ['КАК', 'НОСИТЕЛЬ'], o4: ['КОРОЛЕВ-', 'СКИЙ'] };
  ['o1', 'o2', 'o3', 'o4'].forEach((id, i) => { const p = PLATES[id], kk = eBack(P(t, tw[i] - 0.1, tw[i] + 0.2), 2.2); if (kk <= 0) return; const x = 290 + (i % 2) * 420, y = 600 + Math.floor(i / 2) * 200, bump = 1 + 0.06 * Math.sin(clamp((t - tw[i]) / 0.4) * Math.PI);
    c.save(); c.translate(x, y); c.scale(kk * bump, kk * bump); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -195 + 8, -80 + 12, 390, 160, 36); c.fill(); c.fillStyle = p[2]; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -195, -80, 390, 160, 36); c.fill(); c.stroke();
    font(c, 'Unb9', 120); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(p[0], -125, 8);
    const ls = LBL[id]; ls.forEach((s_, j) => { textFit(c, 'Unb9', 34, s_, 230); c.fillStyle = C.white; c.textAlign = 'left'; c.fillText(s_, -60, (j - (ls.length - 1) / 2) * 42 + 4); }); c.restore(); });
  const svT = wAt('outro', 'пиши', sp.t + 2.43) - 0.1, sk = eBack(P(t, svT, svT + 0.3), 2.2), pulse = 1 + 0.05 * Math.sin(clamp((t - wAt('outro', 'сохрани', sp.t + 3.13)) / 0.5) * Math.PI);
  if (sk > 0) { c.save(); c.translate(540, 1000); c.scale(sk * pulse, sk * pulse); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -260 + 6, -60 + 10, 520, 120, 60); c.fill(); c.fillStyle = C.gold; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -260, -60, 520, 120, 60); c.fill(); c.stroke();
    c.fillStyle = C.oliveD; c.beginPath(); c.moveTo(-190, -32); c.lineTo(-146, -32); c.lineTo(-146, 34); c.lineTo(-168, 16); c.lineTo(-190, 34); c.closePath(); c.fill();   // bookmark icon
    textFit(c, 'Unb9', 50, 'СОХРАНИ', 330); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.fillText('СОХРАНИ', 40, 4); c.restore(); }
  const subT = Math.min(svT + 0.7, sp.t + sp.d - 1.0), bk = eBack(P(t, subT, subT + 0.3), 2), sy = 1200;
  if (bk > 0) { const click = P(t, subT + 0.8, subT + 0.95), pressed = t > subT + 0.9; c.save(); c.translate(560, sy); const ss = bk * (1 - 0.08 * Math.sin(click * Math.PI)); c.scale(ss, ss); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -250 + 6, -58 + 10, 500, 116, 58); c.fill(); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -250, -58, 500, 116, 58); c.fill(); textFit(c, 'Unb9', 42, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 440); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4); c.restore();
    const mv = eIO(P(t, subT + 0.2, subT + 0.8)); UI.tapCursor(c, lerp(900, 620, mv), lerp(sy + 260, sy + 20, mv), 1, P(t, subT + 0.85, subT + 1.4)); }
  c.save(); c.translate(0, -130); UI.captions(c, t); c.restore(); Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

const VIEWS = { 'ui:flyer': flyerView, 'ui:chart': chartView, 'ui:chat': chatView, 'ui:upline': uplineView };
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake_(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag.startsWith('ui:')) { VIEWS[tag](c, t); heads = { her: OFFL, mia: OFF }; proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.24); }
  const names = { mia: ['MIA', MIA_COL] };
  if (!tag.startsWith('ui:')) K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names, hold: { hook_m: -0.2, o1_h: -0.22, o1_m: -0.2, o2_h: -0.22, o2_m: -0.2, o3_h: -0.22, o3_m: -0.2, o4_h: -0.15, o4_m: 0.15, end_m: -0.2 } });
  if (L === 'hook') title(c, t);
  plate(c, t, sc);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  // the end screen wipes in from the twist
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('mlm', NF, renderFrame);
