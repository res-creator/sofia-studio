// "1% батареи — как попросить зарядку в кафе" — rubric «Полезное» (scene + 4 answers, worst -> best), hard_cut camera: node battery.js start end out.mp4 | --png=f1,f2
// A small café: the heroine (pink jumper) in front of the counter holds up her phone — red 1% blinking. The barista (Lily, apron) behind the counter guards
// the ONLY socket (on the back wall, STAFF ONLY): a double adapter feeds the coffee machine and — absurd detail — a cactus in a pot labelled «100%».
// o1 «В ЛОБ»: "Give charge! Now!" -> "Charge? That's four pounds fifty." the till rings, a receipt shoots out and unrolls to the floor; insert: the receipt.
// o2 «ВЕЖЛИВО»: "...give me electricity?" -> "We've only got oat milk." she gets a carton; insert: her cable stuck into the carton, still 1%.
// o3 «КАК НОСИТЕЛЬ»: "I'm on one percent. Is there anywhere I can charge my phone?" -> "Oh, go on then. Pass it here." the barista carries the phone
//    swaddled in a tea towel like a baby to the socket; insert: charging; tip.
// o4 «КОРОЛЕВСКИЙ ОТВЕТ»: the drama speech (she swoons at "dead"), the barista melts: "...Fine. But I'm telling your mum it was me."
// Twist (music silent): the barista yanks the coffee machine's plug, the machine dies, the queue is horrified: "Coffee can wait. Her mum can't."
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/battery/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];
// handovers: a negative per-line hold (bubble gone BEFORE the line ends) — ui_v2 clamps hold to >= 0.05, so shorten the bubble's span instead
{ const _bub = UI.bubble; UI.bubble = (ctx, sp, t, an, side, name) => _bub(ctx, sp.hold < 0.05 ? { ...sp, d: sp.d + sp.hold - 0.05 } : sp, t, an, side, name); }

// ---------------- cast
const HER = { ...BASE.her_lift };
const BAR = { ...BASE.rita, top: { type: 'tee', col: '#2E6B5A' }, bottom: { type: 'trousers', col: '#2B2F3A' } };
const Q1 = { ...BASE.ben, top: { type: 'sweater', col: '#C9A04A' } }, Q2 = { ...BASE.linda };
const G = { her: geom(HER), bar: geom(BAR), q1: geom(Q1), q2: geom(Q2) };
const HX = -260, BX = 330, BXS = 640, CT = -760;              // her / barista feet x, barista at the socket, counter top height
const SOX = 960, SOY = -1170;                                  // the only socket (back wall)
const MX0 = 470, MX1 = 760;                                    // coffee machine on the counter
const CAX = 1150;                                              // cactus pot on the counter end
const TILL = 150;                                              // till (left end of the counter)
const QX = [-980, -1330];                                      // the queue behind her
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function apron(cc, g) { paint(cc, q => { q.m(-g.sw * 0.75, g.ySh + 30); q.l(g.sw * 0.75, g.ySh + 30); q.l(g.sw * 1.0, g.ySh + 560); q.l(-g.sw * 1.0, g.ySh + 560); q.z(); }, '#7A4E2E', { sd: 6, hd: 3, lw: 4 }); cc.fillStyle = '#F2C14E'; rr(cc, -90, g.ySh + 230, 180, 110, 14); cc.fill(); }

// ---------------- the phone screen (also used by the inserts): mode 'low' (red 1%, blinking) / 'charge' (green bolt) ; w x h screen box at (0,0)
function battIcon(c, x, y, w, h, fill, col) { c.save(); c.translate(x, y); c.strokeStyle = col; c.lineWidth = Math.max(3, w * 0.07); rr(c, -w / 2, -h / 2, w, h, h * 0.22); c.stroke(); c.fillStyle = col; rr(c, w / 2 + w * 0.03, -h * 0.22, w * 0.09, h * 0.44, w * 0.03); c.fill();
  const pad = w * 0.09; if (fill > 0) { rr(c, -w / 2 + pad, -h / 2 + pad, Math.max(w * 0.05, (w - 2 * pad) * fill), h - 2 * pad, h * 0.1); c.fill(); } c.restore(); }
function bolt(c, x, y, s, col) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.beginPath(); c.moveTo(12, -60); c.lineTo(-30, 8); c.lineTo(-2, 8); c.lineTo(-14, 60); c.lineTo(32, -10); c.lineTo(4, -10); c.closePath(); c.fill(); c.restore(); }
function screen(c, w, h, mode, t, pct = 1) {
  c.fillStyle = mode === 'charge' ? '#12261C' : '#1E1414'; c.fillRect(0, 0, w, h);
  if (mode === 'low') { const on = Math.sin(t * 9) > -0.3; c.fillStyle = 'rgba(224,71,76,' + (on ? 0.28 : 0.1) + ')'; c.fillRect(0, 0, w, h);
    battIcon(c, w / 2, h * 0.42, w * 0.62, w * 0.3, 0.04, on ? '#FF4A4F' : '#A8343A'); UI.textFit(c, 'Unb9', w * 0.36, '1%', w * 0.8); c.fillStyle = on ? '#FF5A5F' : '#B8444A'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('1%', w / 2, h * 0.7); }
  else { const g = 0.55 + 0.45 * Math.sin(t * 6); battIcon(c, w / 2, h * 0.42, w * 0.62, w * 0.3, clamp(pct / 100, 0.05, 1), '#5BE08A'); c.save(); c.globalAlpha = g; bolt(c, w / 2, h * 0.42, w / 300, '#F2E14E'); c.restore();
    UI.textFit(c, 'Unb9', w * 0.3, pct + '%', w * 0.8); c.fillStyle = '#5BE08A'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(pct + '%', w / 2, h * 0.7); } }
// phone in a hand: (0,0) = hand, the phone stands upright above it, screen to the camera
function phoneShape(c, s, mode, t, pct) { c.save(); c.scale(s, s); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -62 + 6, -250 + 8, 124, 250, 20); c.fill(); c.fillStyle = '#2B2F3A'; rr(c, -62, -250, 124, 250, 20); c.fill();
  c.save(); c.beginPath(); rr(c, -54, -240, 108, 228, 14); c.clip(); c.translate(-54, -240); screen(c, 108, 228, mode, t, pct); c.restore(); c.restore(); }
const phoneItem = (t, mode = 'low', s = 1.15, glow = 0) => ctx => { ctx.save(); ctx.translate(0, 40);
  if (glow > 0 && mode === 'low') { const a = (0.35 + 0.3 * Math.sin(t * 9)) * glow; ctx.fillStyle = `rgba(255,70,80,${a})`; ctx.beginPath(); ctx.arc(0, -150 * s, 190 * s, 0, TAU); ctx.fill(); }
  phoneShape(ctx, s, mode, t, 1); ctx.restore(); };
// oat milk carton (gable top); (0,0) = bottom centre
function carton(c, s = 1) { c.save(); c.scale(s, s);
  paint(c, q => { q.m(-70, 0); q.l(70, 0); q.l(70, -260); q.l(-70, -260); q.z(); }, '#F7F2E6', { sd: 4, hd: 2, lw: 4 });
  paint(c, q => { q.m(-70, -260); q.l(0, -330); q.l(70, -260); q.z(); }, '#E8DCC0', { sd: 3, hd: 1, lw: 4 }); c.fillStyle = '#C9B48A'; c.fillRect(-8, -350, 16, 30);
  c.fillStyle = '#7FB0D8'; c.fillRect(-70, -200, 140, 90); fitTxt(c, 'OAT', 0, -172, 38, '#FFFFFF', 120); fitTxt(c, 'MILK', 0, -132, 34, '#FFFFFF', 120);
  c.fillStyle = '#E8B04A'; for (const [x, y] of [[-30, -60], [0, -75], [30, -60], [-15, -40], [15, -40]]) { c.beginPath(); c.ellipse(x, y, 12, 20, 0.3, 0, TAU); c.fill(); } c.restore(); }
const cartonItem = ctx => { ctx.save(); ctx.translate(0, 120); carton(ctx, 0.9); ctx.restore(); };
// receipt strip in a hand
const rcptItem = ctx => { ctx.save(); ctx.translate(0, 30); ctx.rotate(0.08); ctx.fillStyle = '#FFFDF8'; ctx.strokeStyle = '#B9B2A8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-40, -40); ctx.lineTo(40, -40); ctx.lineTo(46, 420); for (let i = 0; i < 8; i++) ctx.lineTo(46 - (i + 0.5) * 11.5, 420 + (i % 2 ? 0 : 12)); ctx.lineTo(-46, 420); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#9A948A'; for (let i = 0; i < 12; i++) ctx.fillRect(-30, -10 + i * 34, i % 3 === 2 ? 30 : 60, 8); ctx.restore(); };
function sweat(c, hd, t, k) { if (k <= 0) return; c.save(); c.globalAlpha = k; for (let i = 0; i < 3; i++) { const u = ((t * 1.4 + i * 0.33) % 1), x = hd.x + (i - 1) * hd.hh * 0.9 + (i === 1 ? hd.hh * 1.3 : 0), y = hd.y - hd.hh * 0.9 + u * hd.hh * 0.9;
  c.fillStyle = '#7CC7F2'; c.strokeStyle = '#2E7AB0'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - hd.hh * 0.16); c.quadraticCurveTo(x + hd.hh * 0.09, y, x, y + hd.hh * 0.06); c.quadraticCurveTo(x - hd.hh * 0.09, y, x, y - hd.hh * 0.16); c.fill(); c.stroke(); } c.restore(); }
function heart(c, x, y, s, col) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.beginPath(); c.moveTo(0, 30); c.bezierCurveTo(-60, -10, -40, -60, 0, -30); c.bezierCurveTo(40, -60, 60, -10, 0, 30); c.fill(); c.restore(); }
function cupIcon(c, x, y, s, col) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.beginPath(); c.moveTo(-30, -30); c.lineTo(30, -30); c.lineTo(24, 40); c.lineTo(-24, 40); c.fill(); rr(c, -36, -44, 72, 16, 5); c.fill();
  c.strokeStyle = col; c.lineWidth = 6; c.lineCap = 'round'; for (const dx of [-12, 8]) { c.beginPath(); c.moveTo(dx, -56); c.quadraticCurveTo(dx + 10, -70, dx, -84); c.stroke(); } c.restore(); }

// ---------------- café (prerendered, softly blurred); the counter, machine, socket and cactus are live
const BX0 = -3400, BY0 = -3800, BW = 6600, BH = 5600, BS = 0.5;
function drawCafe(c) {
  c.fillStyle = '#F1E4CE'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = 'rgba(201,165,122,.25)'; for (let x = BX0; x < BX0 + BW; x += 260) c.fillRect(x, BY0, 120, BH);   // wallpaper stripes
  c.fillStyle = '#C9A57A'; c.fillRect(BX0, -1150, BW, 890); c.strokeStyle = 'rgba(0,0,0,.08)'; c.lineWidth = 5; for (let x = BX0; x < BX0 + BW; x += 220) { c.beginPath(); c.moveTo(x, -1150); c.lineTo(x, -260); c.stroke(); }
  c.fillStyle = '#8A5A36'; c.fillRect(BX0, -1170, BW, 30);
  // sign over the counter
  c.fillStyle = '#2B3A2E'; rr(c, -300, -2700, 1300, 170, 24); c.fill(); cupIcon(c, -160, -2600, 1.2, '#F2C14E'); fitTxt(c, 'COFFEE', 470, -2615, 120, '#F2C14E', 900);
  // chalkboard menu behind the barista
  c.fillStyle = '#8A5A36'; rr(c, -250, -2420, 1050, 980, 18); c.fill(); c.fillStyle = '#25302A'; rr(c, -220, -2390, 990, 920, 10); c.fill();
  fitTxt(c, 'MENU', 275, -2280, 100, '#F7F2E8', 800); ['LATTE  £3.50', 'FLAT WHITE  £3.40', 'TEA  £2.20', 'CROISSANT  £2.80'].forEach((t, i) => fitTxt(c, t, 275, -2110 + i * 150, 60, '#F7F2E8', 880, 'Cav7'));
  // shelf with mugs (right, behind the counter)
  c.fillStyle = '#8A5A36'; c.fillRect(1250, -1900, 900, 36); for (let i = 0; i < 6; i++) { c.fillStyle = ['#EE5E9A', '#7FB0D8', '#F2C14E', '#7CC45A', '#E0474C', '#B9A2E6'][i]; rr(c, 1290 + i * 140, -2020, 90, 120, 14); c.fill(); }
  // big window on the left (street), plant, a framed poster
  c.fillStyle = '#8A5A36'; rr(c, -3100, -2700, 1500, 1500, 20); c.fill(); const g = c.createLinearGradient(0, -2660, 0, -1240); g.addColorStop(0, '#BFE3F5'); g.addColorStop(1, '#E4F2F8'); c.fillStyle = g; c.fillRect(-3060, -2660, 1420, 1420);
  c.fillStyle = '#C9D2DA'; c.fillRect(-3060, -1700, 1420, 460); c.fillStyle = '#A8B4C0'; for (let x = -3000; x < -1650; x += 260) c.fillRect(x, -2100, 180, 400);
  c.fillStyle = '#8A5A36'; c.fillRect(-2370, -2660, 30, 1420); c.fillRect(-3060, -1960, 1420, 30);
  c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.moveTo(-3000, -2660); c.lineTo(-2800, -2660); c.lineTo(-3060, -2300); c.fill();
  c.fillStyle = '#EE5E9A'; rr(c, -1300, -2500, 600, 760, 14); c.fill(); c.fillStyle = '#FFF4F8'; rr(c, -1260, -2460, 520, 680, 8); c.fill(); cupIcon(c, -1000, -2200, 3, '#EE5E9A'); fitTxt(c, 'OPEN', -1000, -1900, 80, '#EE5E9A', 440);
  // pastry case + a small table (left)
  c.fillStyle = '#7A4E2E'; c.fillRect(-2900, -720, 60, 460); c.fillRect(-2100, -720, 60, 460); c.fillStyle = '#E9DCC6'; rr(c, -3000, -760, 1060, 60, 16); c.fill();
  c.fillStyle = '#FFFDF8'; c.beginPath(); c.moveTo(-2700, -760); c.lineTo(-2620, -760); c.lineTo(-2630, -880); c.lineTo(-2690, -880); c.fill();
  // floor
  c.fillStyle = '#C9B896'; c.fillRect(BX0, -260, BW, BY0 + BH + 260); c.fillStyle = 'rgba(0,0,0,.06)'; for (let y = -260; y < BY0 + BH; y += 160) for (let x = BX0 + ((y / 160) % 2) * 160; x < BX0 + BW; x += 320) c.fillRect(x, y, 160, 160);
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGK = mkBG(drawCafe);

// ---------------- live props: socket, coffee machine, cactus, counter, till + receipt
const machineOn = (t, L) => !(L === 'end' && t > ev('end', 'yank'));
const herPhoneAtSocket = (t, L) => (L === 'o3' && t > ev('o3', 'plug')) || (L === 'end' && t > ev('end', 'yank') + 0.35);
function socket(c, t, L) {
  // STAFF ONLY sign
  c.fillStyle = '#E0474C'; rr(c, SOX - 150, SOY - 250, 300, 80, 12); c.fill(); fitTxt(c, 'STAFF ONLY', SOX, SOY - 209, 40, '#FFFFFF', 270);
  c.fillStyle = '#FFFFFF'; c.strokeStyle = '#B9B2A8'; c.lineWidth = 5; rr(c, SOX - 70, SOY - 70, 140, 140, 18); c.fill(); c.stroke();
  // the double adapter
  c.fillStyle = '#F4EFE6'; c.strokeStyle = '#8A8F9A'; c.lineWidth = 4; rr(c, SOX - 60, SOY - 50, 120, 110, 12); c.fill(); c.stroke();
  c.fillStyle = '#2B2F3A'; for (const dx of [-28, 28]) { c.fillRect(SOX + dx - 6, SOY - 20, 12, 30); }
  // plugs: left = coffee machine (unless yanked), right = cactus
  c.lineCap = 'round'; c.lineJoin = 'round';
  const on = machineOn(t, L);
  if (on) { c.strokeStyle = '#2B2F3A'; c.lineWidth = 14; c.beginPath(); c.moveTo(SOX - 28, SOY + 40); c.bezierCurveTo(SOX - 40, SOY + 240, MX1 - 40, SOY + 120, MX1 - 30, CT - 200); c.stroke(); c.fillStyle = '#3A3F4C'; rr(c, SOX - 46, SOY - 6, 36, 56, 8); c.fill(); }
  c.strokeStyle = '#3E8A4E'; c.lineWidth = 10; c.beginPath(); c.moveTo(SOX + 28, SOY + 40); c.bezierCurveTo(SOX + 40, SOY + 200, CAX - 20, SOY + 150, CAX - 10, CT - 150); c.stroke(); c.fillStyle = '#3E8A4E'; rr(c, SOX + 12, SOY - 6, 34, 56, 8); c.fill();
  // her phone on the little shelf under the socket, on charge
  c.fillStyle = '#8A5A36'; c.fillRect(SOX - 180, SOY + 120, 220, 18);
  if (herPhoneAtSocket(t, L)) { const plugged = L === 'o3' || t > ev('end', 'yank') + 0.5; c.save(); c.translate(SOX - 110, SOY + 120); phoneShape(c, 0.55, plugged ? 'charge' : 'low', t, 2); c.restore();
    if (plugged) { c.strokeStyle = '#FFFFFF'; c.lineWidth = 8; c.beginPath(); c.moveTo(SOX - 110, SOY + 118); c.bezierCurveTo(SOX - 110, SOY + 170, SOX - 40, SOY + 120, SOX - 28, SOY + 40); c.stroke(); c.fillStyle = '#FFFFFF'; rr(c, SOX - 42, SOY - 4, 28, 50, 6); c.fill(); } }
}
function steam(c, t, x, y, k) { if (k <= 0) return; c.save(); c.strokeStyle = `rgba(255,255,255,${0.7 * k})`; c.lineWidth = 12; c.lineCap = 'round'; for (let i = 0; i < 3; i++) { const u = (t * 0.8 + i / 3) % 1; c.globalAlpha = (1 - u) * k; c.beginPath(); c.moveTo(x + (i - 1) * 40, y - u * 160); c.quadraticCurveTo(x + (i - 1) * 40 + 30 * Math.sin(t * 3 + i), y - u * 160 - 50, x + (i - 1) * 40, y - u * 160 - 100); c.stroke(); } c.restore(); }
function machine(c, t, L) { const on = machineOn(t, L), u = L === 'end' ? t - ev('end', 'yank') : -1, shk = u > 0 && u < 0.4 ? Math.sin(u * 60) * 6 * (1 - u / 0.4) : 0;
  c.save(); c.translate(shk, 0);
  paint(c, q => { q.m(MX0, CT); q.l(MX1, CT); q.l(MX1, CT - 340); q.l(MX0, CT - 340); q.z(); }, '#B8BEC8', { sd: 6, hd: 3, lw: 4 });
  c.fillStyle = '#2B2F3A'; rr(c, MX0 + 25, CT - 315, MX1 - MX0 - 50, 80, 10); c.fill();
  c.fillStyle = on ? '#7CF29A' : '#3A4A40'; c.beginPath(); c.arc(MX1 - 60, CT - 275, 14, 0, TAU); c.fill(); c.fillStyle = on ? '#E0474C' : '#4A3030'; c.beginPath(); c.arc(MX1 - 100, CT - 275, 14, 0, TAU); c.fill();
  c.fillStyle = '#5A606E'; rr(c, MX0 + 60, CT - 210, MX1 - MX0 - 120, 30, 8); c.fill(); c.fillRect((MX0 + MX1) / 2 - 14, CT - 180, 28, 50);
  c.fillStyle = '#FFFDF8'; c.beginPath(); c.moveTo((MX0 + MX1) / 2 - 40, CT - 10); c.lineTo((MX0 + MX1) / 2 + 40, CT - 10); c.lineTo((MX0 + MX1) / 2 + 32, CT - 100); c.lineTo((MX0 + MX1) / 2 - 32, CT - 100); c.fill();
  c.restore(); steam(c, t, MX0 + 60, CT - 350, on ? 1 : clamp(1 - u / 0.5)); }
function cactus(c, t) { c.save(); c.translate(CAX, CT);
  paint(c, q => { q.m(-95, 0); q.l(95, 0); q.l(115, -170); q.l(-115, -170); q.z(); }, '#D9764A', { sd: 5, hd: 2, lw: 4 }); c.fillStyle = '#C0623A'; rr(c, -125, -195, 250, 40, 10); c.fill();
  // the 100% label + a full battery
  c.fillStyle = '#FFFDF8'; rr(c, -82, -150, 164, 110, 12); c.fill(); fitTxt(c, '100%', 0, -112, 52, '#2E8A4E', 150); battIcon(c, -6, -64, 70, 30, 1, '#2E8A4E');
  const sw = Math.sin(t * 1.5) * 0.02; c.rotate(sw);
  paint(c, q => { q.m(-48, -190); q.q(-55, -470, 0, -480); q.q(55, -470, 48, -190); q.z(); }, '#5AAE5A', { sd: 5, hd: 2, lw: 4 });
  paint(c, q => { q.m(-40, -300); q.q(-120, -300, -110, -400); q.q(-100, -430, -80, -400); q.q(-80, -340, -40, -340); q.z(); }, '#5AAE5A', { sd: 3, hd: 1, lw: 4 });
  paint(c, q => { q.m(40, -340); q.q(120, -340, 112, -430); q.q(100, -460, 80, -430); q.q(80, -380, 40, -380); q.z(); }, '#5AAE5A', { sd: 3, hd: 1, lw: 4 });
  c.strokeStyle = 'rgba(40,90,40,.55)'; c.lineWidth = 3; for (const [x, y] of [[-20, -260], [15, -320], [-10, -400], [25, -220], [-95, -380], [95, -410]]) { c.beginPath(); c.moveTo(x - 8, y - 8); c.lineTo(x + 8, y + 8); c.moveTo(x + 8, y - 8); c.lineTo(x - 8, y + 8); c.stroke(); }
  c.fillStyle = '#EE5E9A'; for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; c.beginPath(); c.ellipse(Math.cos(a) * 16, -484 + Math.sin(a) * 12, 14, 9, a, 0, TAU); c.fill(); } c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(0, -484, 9, 0, TAU); c.fill();
  c.restore(); K.mark(c, 'cactus', CAX, CT - 250, 260); }
// the receipt: shoots up out of the till and unrolls over the counter edge down to the floor
function receipt(c, t, L) { if (L !== 'o1' || t < ev('o1', 'print')) return; const u = t - ev('o1', 'print'), len = 1400 * eOut(clamp(u / 0.8));
  const x0 = TILL, y0 = CT - 120; c.save(); c.fillStyle = '#FFFDF8'; c.strokeStyle = '#B9B2A8'; c.lineWidth = 3;
  // a strip: up 120, over the till front, down to the floor and curling on it
  const pts = []; for (let s = 0; s <= len; s += 20) { let x, y; if (s < 160) { x = x0 - s * 0.6; y = y0 - Math.sin(s / 160 * Math.PI) * 90 - s * 0.2; } else if (s < 160 + 760) { const v = s - 160; x = x0 - 96 - v * 0.1; y = y0 - 32 + v; } else { const v = s - 920; x = x0 - 172 - v * 0.9; y = y0 + 728 + Math.sin(v / 60) * 10; } pts.push([x, Math.min(y, -10)]); }
  const wd = 50; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x - wd / 2, y) : c.moveTo(x - wd / 2, y)); for (let i = pts.length - 1; i >= 0; i--) c.lineTo(pts[i][0] + wd / 2, pts[i][1]); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#9A948A'; pts.forEach(([x, y], i) => { if (i % 3 === 1) c.fillRect(x - 16, y - 3, 30, 6); }); c.restore(); }
function counter(c, t, L) {
  paint(c, q => { q.m(40, CT); q.l(1260, CT); q.l(1260, CT + 70); q.l(40, CT + 70); q.z(); }, '#E9DCC6', { sd: 6, hd: 3, lw: 4 });
  paint(c, q => { q.m(60, CT + 70); q.l(1240, CT + 70); q.l(1240, -10); q.l(60, -10); q.z(); }, '#7A4E2E', { sd: 10, hd: 4, lw: 4 }); c.strokeStyle = 'rgba(0,0,0,.15)'; c.lineWidth = 5; for (let x = 360; x < 1240; x += 290) { c.beginPath(); c.moveTo(x, CT + 70); c.lineTo(x, -10); c.stroke(); }
  machine(c, t, L);
  // till (rings in o1: the drawer pops)
  const ring = L === 'o1' ? clamp((t - ev('o1', 'till')) / 0.15) : 0;
  c.fillStyle = '#2B2F3A'; rr(c, TILL - 90, CT - 130, 180, 130, 12); c.fill(); c.fillStyle = '#7CF29A'; rr(c, TILL - 70, CT - 115, 140, 44, 6); c.fill(); if (ring > 0) fitTxt(c, '£4.50', TILL, CT - 93, 34, '#1E3A28', 120);
  c.fillStyle = '#4A505E'; rr(c, TILL - 90 - 20 * ring, CT - 60, 180, 50, 8); c.fill();
  // oat milk cartons on the counter (o2: one is handed over)
  if (!(L === 'o2' && t > ev('o2', 'milk') - 0.1)) { c.save(); c.translate(330 + 60, CT); carton(c, 0.55); c.restore(); }
  c.save(); c.translate(330 - 20, CT); carton(c, 0.55); c.restore();
  cactus(c, t); receipt(c, t, L); }

// ---------------- characters
const down = (g, s, drop = 0) => reach(g, s, s * g.sw * 1.08, g.ySh + drop + 540, { planar: true });
const open = (g, s, k = 1.7, dy = 90) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const hold = (g, s, dy = 330, k = 0.75) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const forehead = (g, s = 1) => reach(g, s, s * g.hw * 0.25, g.headY - g.hh * 0.35, { planar: true });
const hang = (g, s) => reach(g, s, s * g.sw * 0.8, g.ySh + 330);
const base = (g, t, who) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, armL: down(g, -1), armR: down(g, 1), items: {} });
const gest = (st, g, who, t, side, base_) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base_ + Math.cos(u) * 20, { planar: true }); } };
// her phone: up at face height, screen to the camera
const phoneUp = (st, g, t, k = 1.25, dy = 250, glow = 0, mode = 'low') => { st.armR = reach(g, 1, g.sw * k, g.ySh + dy, { planar: true }); st.items = { ...st.items, R: phoneItem(t, mode, 1.15, glow) }; };
const herHasPhone = (t, L) => !((L === 'o3' && t > ev('o3', 'take') + 0.35) || L === 'end');
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { ...base(g, t, 'her'), mood: 'worried', turn: 0.25, look: 0.7 };
  if (herHasPhone(t, L)) phoneUp(st, g, t, 1.25, 260, L === 'hook' ? 1 : 0);
  if (L === 'hook') st.items = { R: phoneItem(t, 'low', 1.4, 1) };
  if (L === 'hook') { st.mood = 'worried'; st.armL = open(g, -1, 1.5, 330 + Math.sin(t * 7) * 25);
    if (speaking('hook_b', t, 0, 0)) { st.mood = 'shock'; st.blink = 0; }
    if (t > endOf('hook_b') + 0.1) { st.mood = 'sad'; st.armL = hold(g, -1, 300, 0.4); }
    if (t > hev('wide')) { st.mood = 'worried'; } }
  if (L === 'o1') { st.mood = 'angry';
    if (speaking('o1_h', t, 0.05, 0.15)) { const u = t - SP.o1_h.t, hit = Math.abs(Math.sin(u * 6)); st.armL = reach(g, -1, -g.sw * 0.4 + 260, g.ySh + 420 - hit * 140, { planar: true }); phoneUp(st, g, t, 1.9, 120); st.headY = hit * 10; }
    if (t > SP.o1_b.t) { st.mood = 'surprised'; st.blink = 0; st.armL = hold(g, -1, 330, 0.5); }
    if (t > e('print') + 0.2) { st.mood = 'shock'; st.look = 0.5; st.lookY = 0.5; }
    if (t > e('back') - 0.1) { st.mood = 'tired'; st.blink = 1; st.lookY = 0; st.look = 0; st.turn = 0.1; st.armL = hold(g, -1, 200, 0.6); st.items = { ...st.items, L: rcptItem }; } }
  if (L === 'o2') { st.mood = 'neutral';
    if (speaking('o2_h', t, 0.05, 0.15)) { st.mood = 'worried'; st.tilt = 0.06; st.lookY = 0.15; st.armL = hold(g, -1, 260, 0.35); }
    if (t > SP.o2_b.t) { st.mood = 'surprised'; st.tilt = 0; st.lookY = 0; }
    if (t > e('milk') + 0.3) { st.mood = 'skeptical'; st.blink = 0; st.armL = hold(g, -1, 300, 0.9); st.items = { ...st.items, L: cartonItem }; st.look = 0.2; }
    if (t > e('back') - 0.1) { st.mood = 'tired'; st.blink = 1; st.look = 0; st.turn = 0.1; } }
  if (L === 'o3') { st.mood = 'happy';
    if (speaking('o3_h', t, 0.05, 0.15)) { st.mood = 'happy'; gest(st, g, 'her', t, -1, 150); }
    if (t > e('take') - 0.1 && t < e('take') + 0.35) { st.armR = reach(g, 1, g.sw * 2.4, g.ySh + 150, { planar: true }); }
    if (t > e('take') + 0.35) { st.mood = 'happy'; st.armR = hold(g, 1, 300, 0.5); st.armL = hold(g, -1, 300, 0.5); st.look = 0.9; st.turn = 0.35; }
    if (t > e('back') - 0.1) { st.mood = 'happy'; st.laugh = true; st.blink = 1; st.look = 0.6; st.armL = open(g, -1, 1.7, 80); } }
  if (L === 'o4') { st.mood = 'sad';
    if (speaking('o4_h', t, 0.05, 0.1)) { st.mood = 'worried'; st.tilt = 0.05 * Math.sin(t * 2);
      if (t > e('mum') - 0.1) { st.armR = hold(g, 1, 260, 0.2); st.items = { R: phoneItem(t, 'low', 1.0) }; st.mood = 'sad'; }
      if (t > e('dead') - 0.1 && t < e('plug1') - 0.1) { const k = eOut(clamp((t - e('dead') + 0.1) / 0.25)); st.headFirst = true; st.armL = forehead(g, -1); st.tilt = -0.15 * k; st.blink = 1; st.mood = 'sad'; }
      if (t >= e('plug1') - 0.1) { st.mood = 'happy'; st.tilt = 0; st.blink = 0; st.armL = open(g, -1, 1.8, 40 + Math.sin(t * 6) * 20); phoneUp(st, g, t, 1.3, 220); } }
    if (t > endOf('o4_h') + 0.05) { st.mood = 'smug'; st.blink = 1; }
    if (t > e('palm')) { st.mood = 'happy'; st.blink = 0; st.armR = reach(g, 1, g.sw * 2.3, g.ySh + 160, { planar: true }); } }
  if (L === 'end') { st.mood = 'surprised'; st.blink = 0; st.armL = hold(g, -1, 330, 0.5); st.armR = hold(g, 1, 330, 0.5);
    if (t > e('yank') + 0.1) { st.mood = 'shock'; st.armL = open(g, -1, 1.7, 100); st.armR = open(g, 1, 1.7, 100); }
    if (t > e('zap')) { st.mood = 'happy'; st.laugh = true; st.armL = open(g, -1, 2.0, -40 + Math.sin(t * 8) * 25); st.armR = open(g, 1, 2.0, -40 + Math.sin(t * 8 + 1) * 25); }
    if (t > e('moral')) { st.laugh = false; st.mood = 'happy'; } }
  return st; }
const barX = (t, L) => { if (L === 'o3') { const a = ev('o3', 'take') + 0.45, b = ev('o3', 'plug') - 0.1; if (t > a) return lerp(BX, BXS, eIO(clamp((t - a) / (b - a)))); } if (L === 'end') return BXS; return BX; };
// the swaddled phone (o3): tea towel bundle at her chest, rocking
function bundle(c, x, y, t, s = 1) { c.save(); c.translate(x, y); c.rotate(Math.sin(t * 5) * 0.18); c.scale(s, s);
  paint(c, q => { q.m(-150, -20); q.q(-150, -110, -40, -110); q.l(120, -90); q.q(170, -60, 150, 20); q.q(120, 80, -20, 80); q.q(-150, 70, -150, -20); q.z(); }, '#F2D0DC', { sd: 4, hd: 2, lw: 4 });
  c.strokeStyle = '#E58AAA'; c.lineWidth = 6; for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(-120, i * 30 + 10); c.lineTo(130, i * 30 + 4); c.stroke(); }
  c.save(); c.translate(-60, -40); c.rotate(-1.2); c.fillStyle = '#2B2F3A'; rr(c, -40, -70, 80, 140, 12); c.fill(); c.save(); c.beginPath(); rr(c, -34, -64, 68, 128, 8); c.clip(); c.translate(-34, -64); screen(c, 68, 128, 'low', t); c.restore(); c.restore();
  c.restore(); }
function barState(t, L) { const g = G.bar, e = k => ev(L, k), st = { ...base(g, t, 'barista2'), mood: 'happy', turn: -0.35, look: -0.8, armL: hang(g, -1), armR: hang(g, 1), afterTorso: cc => apron(cc, g) };
  if (L === 'hook') { st.mood = 'smug'; st.blink = 0;
    if (speaking('hook_b', t, 0.05, 0.2)) { st.mood = 'worried'; const u = t - SP.hook_b.t; st.armL = reach(g, -1, -g.sw * 1.9, g.ySh + 280 + Math.sin(u * 4) * 20, { planar: true }); st.armR = reach(g, 1, g.sw * 1.9, g.ySh + 300, { planar: true }); st.turn = -0.35; }
    if (t > endOf('hook_b') + 0.2) { st.mood = 'smug'; st.armL = hold(g, -1, 300, 0.4); st.armR = hold(g, 1, 300, 0.4); } }
  if (L === 'o1') { st.mood = 'neutral';
    if (speaking('o1_h', t, 0.1, 0.1)) { st.mood = 'surprised'; st.blink = 0; }
    if (speaking('o1_b', t, 0.05, 0.1)) { st.mood = 'happy'; gest(st, g, 'barista2', t, -1, 160); }
    if (t > e('till') - 0.1) { st.mood = 'happy'; st.laugh = true; st.turn = -0.5; st.look = -0.9; st.armL = reach(g, -1, TILL - BX + 40, CT - 90 + (t < e('till') + 0.15 ? -50 : 0), { planar: true }); }
    if (t > e('print') + 0.4) { st.laugh = false; st.mood = 'smug'; st.blink = 1; st.armL = hold(g, -1, 300, 0.5); } }
  if (L === 'o2') { st.mood = 'neutral';
    if (speaking('o2_h', t, 0.1, 0.1)) { st.mood = 'skeptical'; st.lookY = 0.1; }
    if (speaking('o2_b', t, 0.05, 0.1)) { st.mood = 'surprised'; st.lookY = 0; gest(st, g, 'barista2', t, -1, 140); }
    if (t > e('milk') - 0.1 && t < e('milk') + 0.5) { const k = eOut(clamp((t - e('milk') + 0.1) / 0.3)); st.mood = 'happy'; st.armL = reach(g, -1, lerp(-g.sw, -g.sw * 2.6, k), g.ySh + lerp(330, 180, k), { planar: true }); st.items = { L: cartonItem }; }
    if (t > e('milk') + 0.5) { st.mood = 'happy'; st.blink = 1; st.armL = hold(g, -1, 300, 0.5); } }
  if (L === 'o3') { st.mood = 'neutral';
    if (speaking('o3_h', t, 0.1, 0.1)) { st.mood = 'happy'; st.blink = 0; }
    if (speaking('o3_b', t, 0.05, 0.1)) { st.mood = 'happy'; st.laugh = false; st.armL = reach(g, -1, -g.sw * 2.0, g.ySh + 150, { planar: true }); }
    if (t > e('take') - 0.1 && t < e('take') + 0.35) { st.armL = reach(g, -1, -g.sw * 2.6, g.ySh + 160, { planar: true }); if (t > e('take') + 0.33) st.items = { L: phoneItem(t, 'low', 1.0) }; }
    if (t > e('take') + 0.35) { st.mood = 'happy'; st.blink = 1; st.turn = 0.25; st.look = 0.3; st.lookY = 0.5; st.armL = reach(g, -1, -g.sw * 0.25, g.ySh + 300, { planar: true }); st.armR = reach(g, 1, g.sw * 0.45, g.ySh + 280, { planar: true }); st.bundle = true; }
    if (t > e('plug') - 0.15) { st.bundle = false; st.blink = 0; st.turn = 0.4; st.look = 0.9; st.lookY = 0; st.armR = reach(g, 1, SOX - BXS - 60, SOY - g.ySh + g.ySh + 120 - 0, { planar: true }); st.armL = hang(g, -1); }
    if (t > e('plug') + 0.4) { st.mood = 'happy'; st.armR = hang(g, 1); st.turn = -0.2; st.look = -0.6; } }
  if (L === 'o4') { st.mood = 'skeptical';
    if (t > SP.o4_h.t + 1.5) st.mood = 'worried';
    if (t > endOf('o4_h') - 0.2) { st.mood = 'sad'; st.blink = 1; st.armR = reach(g, 1, g.sw * 0.3, g.ySh + 200, { planar: true }); st.headY = 8; }   // hand on her heart
    if (speaking('o4_b', t, 0.05, 0.1)) { st.mood = 'smug'; st.blink = t < SP.o4_b.t + 0.6 ? 1 : 0; st.headY = 0; }
    if (t > e('palm')) { st.mood = 'happy'; st.armL = reach(g, -1, -g.sw * 2.3, g.ySh + 160, { planar: true }); st.armR = hang(g, 1); } }
  if (L === 'end') { st.mood = 'neutral'; st.turn = 0.4; st.look = 0.9; st.armL = hold(g, -1, 280, 0.35); st.items = { L: phoneItem(t, 'low', 0.9) };
    if (t > e('look') + 0.2) { st.mood = 'angry'; st.blink = 0; st.armR = reach(g, 1, SOX - 28 - BXS - 10, SOY + 20 - g.ySh + g.ySh, { planar: true }); }
    if (t > e('yank')) { const u = t - e('yank'); st.mood = 'angry'; st.armR = reach(g, 1, g.sw * 1.6, g.ySh - 120 + Math.max(0, 0.3 - u) * 300, { planar: true }); st.items = { ...st.items, R: plugItem }; }
    if (t > e('yank') + 0.35) { st.armL = reach(g, -1, SOX - 110 - BXS + 30, SOY + 60 - g.ySh + g.ySh, { planar: true }); if (t > e('yank') + 0.5) { st.items = { R: plugItem }; } }
    if (t > SP.end_b.t - 0.05) { st.mood = 'smug'; st.turn = -0.35; st.look = -0.8; st.armL = hold(g, -1, 280, 0.35); st.armR = reach(g, 1, g.sw * 1.8, g.ySh - 60, { planar: true }); }
    if (t > e('wide')) { st.mood = 'happy'; st.laugh = true; st.armR = reach(g, 1, g.sw * 1.6, g.ySh + 40, { planar: true }); } }
  return st; }
const plugItem = ctx => { ctx.save(); ctx.fillStyle = '#3A3F4C'; rr(ctx, -20, -40, 40, 60, 8); ctx.fill(); ctx.fillStyle = '#C9D2DA'; ctx.fillRect(-12, -62, 8, 24); ctx.fillRect(4, -62, 8, 24); ctx.strokeStyle = '#2B2F3A'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 20); ctx.bezierCurveTo(0, 160, -120, 120, -160, 260); ctx.stroke(); ctx.restore(); };
function qState(t, L, k) { const g = G[k], who = k, st = { t, talk: 0, mood: 'tired', turn: 0.3, look: 0.7, armL: down(g, -1), armR: down(g, 1), items: {}, blink: Math.sin(t * 0.7 + (k === 'q1' ? 0 : 2)) > 0.97 ? 1 : 0 };
  if (k === 'q2') { st.armR = hold(g, 1, 300, 0.6); st.items = { R: ctx => { ctx.save(); ctx.translate(0, 40); phoneShape(ctx, 0.8, 'charge', t, 64); ctx.restore(); } }; st.lookY = 0.4; st.look = 0.4; st.mood = 'neutral'; }
  if (L === 'end' && t > ev('end', 'yank') + 0.15) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; st.lookY = 0; st.look = 0.8; st.armL = open(g, -1, 1.8, 60); st.armR = k === 'q2' ? st.armR : open(g, 1, 1.8, 60); if (k === 'q1') st.headY = -8; }
  return st; }

// ---------------- world + which characters each shot draws
const DRAW = { wide: ['her', 'bar', 'q'], cover: ['her', 'bar'], two: ['her', 'bar'], her: ['her'], bar: ['bar'], sock: ['bar'], queue: ['her', 'q'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGK, BX0, BY0, BW, BH); socket(c, t, L);
  if (who.includes('bar')) { const st = barState(t, L), x = barX(t, L); heads.barista2 = K.put(c, BAR, st, x, 0); if (st.bundle) bundle(c, x - 30, G.bar.ySh + 300, t, 0.9); }
  counter(c, t, L);
  if (who.includes('q')) { K.put(c, Q2, qState(t, L, 'q2'), QX[1], 0); K.put(c, Q1, qState(t, L, 'q1'), QX[0], 0); }
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), HX, 0);
  if (L === 'o4' && heads.barista2 && t > endOf('o4_h') - 0.2 && t < SP.o4_b.t + 0.5) { const u = t - endOf('o4_h') + 0.2; for (let i = 0; i < 3; i++) { const v = (u * 0.8 + i / 3) % 1; c.save(); c.globalAlpha = 1 - v; heart(c, heads.barista2.x + (i - 1) * 90, heads.barista2.y - heads.barista2.hh * 1.2 - v * 220, 1.3, '#EE5E9A'); c.restore(); } }
  if (L === 'end' && heads.her && t > ev('end', 'yank') + 0.1 && t < ev('end', 'zap')) sweat(c, heads.her, t, 1);
  if (!heads.her) heads.her = OFFL; if (!heads.barista2) heads.barista2 = OFF;
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const HY = k => G[k].headY, fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(345, fy(HY('bar'), 0.6, 1000), 0.6, 'cover'), WIDE: S(-60, fy(HY('bar'), 0.4, 830), 0.4, 'wide'),
  TWO: S(80, fy(HY('bar'), 0.72, 700), 0.72, 'two'),
  HER: S(HX + 40, fy(HY('her'), 1.0), 1.0, 'her'), HER_R: S(HX + 40, fy(HY('her'), 1.0, 640), 1.0, 'her'), HER_CU: S(HX + 30, fy(HY('her'), 1.35, 860), 1.35, 'her'),
  BAR: S(BX + 20, fy(HY('bar'), 1.0), 1.0, 'bar'), BAR_CU: S(BX + 10, fy(HY('bar'), 1.3, 880), 1.3, 'bar'),
  SOCK: S(SOX - 30, SOY + 40, 1.6, 'sock'), BARS: S((BXS + SOX) / 2 + 20, fy(HY('bar'), 0.85, 760), 0.85, 'sock'), BARS1: S(BXS + 60, fy(HY('bar'), 1.0, 860), 1.0, 'bar'),
  QUEUE: S(-760, fy(HY('q1'), 0.6, 760), 0.6, 'queue'),
  PHONE: U('phone', 1), RCPT: U('rcpt', 2), MILK: U('milk', 3), CHARGE: U('charge', 4) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < 2.45) return SH.COVER; if (t < hev('phone')) return f(SH.BAR); if (t < hev('socket') - 0.03) return f(SH.PHONE); if (t < hev('wide') - 0.03) return f(SH.SOCK); return f(SH.WIDE); }
  if (L === 'o1') { if (t < SP.o1_h.t - 0.1) return f(SH.WIDE); if (t < SP.o1_b.t - 0.1) return f(SH.HER); if (t < e('till') - 0.05) return f(SH.BAR); if (t < e('rcpt') - 0.02) return f(SH.TWO); if (t < e('back') - 0.02) return f(SH.RCPT); return f(SH.HER_R); }
  if (L === 'o2') { if (t < SP.o2_h.t - 0.1) return f(SH.WIDE); if (t < SP.o2_b.t - 0.1) return f(SH.HER); if (t < e('milk') - 0.05) return f(SH.BAR); if (t < e('plug') - 0.02) return f(SH.TWO); if (t < e('back') - 0.02) return f(SH.MILK); return f(SH.HER_R); }
  if (L === 'o3') { if (t < SP.o3_h.t - 0.1) return f(SH.WIDE); if (t < SP.o3_b.t - 0.1) return f(SH.HER); if (t < e('take') - 0.05) return f(SH.BAR); if (t < e('take') + 0.5) return f(SH.TWO); if (t < e('charge') - 0.02) return f(SH.BARS); if (t < e('back') - 0.02) return f(SH.CHARGE); return f(SH.HER_R); }
  if (L === 'o4') { if (t < SP.o4_h.t - 0.1) return f(SH.WIDE); if (t < e('dead') - 0.15) return f(SH.HER); if (t < e('plug1') - 0.1) return f(SH.HER_CU); if (t < endOf('o4_h') + 0.05) return f(SH.HER); if (t < e('palm') - 0.05) return f(SH.BAR_CU); return f(SH.TWO); }
  if (L === 'end') { if (t < e('queue') - 0.02) return f(SH.BARS); if (t < SP.end_b.t - 0.1) return f(SH.QUEUE); if (t < e('zap') - 0.02) return f(SH.BARS1); if (t < e('wide') - 0.02) return f(SH.CHARGE); return f(SH.WIDE); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'thud', 'stamp']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- inserts on a solid backdrop
function backdrop(c, t, a, b) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.08)'; for (let i = -12; i < 12; i++) c.fillRect(-1600, i * 160 + (t * 40) % 160, 3200, 60); c.restore(); }
const pop = (t, t0) => eBack(clamp((t - t0 + 0.05) / 0.3), 1.6);
function bigPhone(c, t, x, y, s, mode, pct) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -230 + 14, -420 + 18, 460, 840, 60); c.fill(); c.fillStyle = '#2B2F3A'; rr(c, -230, -420, 460, 840, 60); c.fill();
  c.save(); c.beginPath(); rr(c, -206, -392, 412, 784, 36); c.clip(); c.translate(-206, -392); screen(c, 412, 784, mode, t, pct); c.restore(); c.fillStyle = '#2B2F3A'; rr(c, -60, -412, 120, 26, 13); c.fill(); c.restore(); }
// hook: her phone at 1% (red, blinking)
function phoneView(c, t) { backdrop(c, t, '#3A2A30', '#1E1418'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'phone' });
  const k = pop(t, hev('phone')), sh = Math.sin(t * 40) * 6 * (Math.sin(t * 9) > 0.6 ? 1 : 0); c.save(); c.globalAlpha = 0.25 + 0.2 * Math.sin(t * 9); c.fillStyle = '#FF4A4F'; c.beginPath(); c.arc(540, 860, 520 * k, 0, TAU); c.fill(); c.restore();
  bigPhone(c, t, 540 + sh, 860, k * 1.0, 'low'); }
// o1: the receipt
function rcptView(c, t) { backdrop(c, t, '#F7E3B0', '#E3B860'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'rcpt' });
  const k = pop(t, ev('o1', 'rcpt')); c.save(); c.translate(540, 860); c.scale(k, k); c.rotate(-0.04);
  c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(-300 + 14, -560 + 18, 600, 1120); c.fillStyle = '#FFFDF8'; c.beginPath(); c.moveTo(-300, -560); c.lineTo(300, -560); c.lineTo(300, 560); for (let i = 0; i < 12; i++) c.lineTo(300 - (i + 0.5) * 50, 560 + (i % 2 ? 0 : 26)); c.lineTo(-300, 560); c.closePath(); c.fill();
  fitTxt(c, 'COFFEE', 0, -470, 70, '#2B2F3A', 500); c.fillStyle = '#B9B2A8'; c.fillRect(-250, -410, 500, 4);
  fitTxt(c, '1 x CHARGE', -240, -300, 56, '#2B2F3A', 330, 'Cav7', 'left'); fitTxt(c, '£4.50', 240, -300, 56, '#2B2F3A', 200, 'Cav7', 'right');
  fitTxt(c, '1 x SOCKET', -240, -200, 56, '#9A948A', 330, 'Cav7', 'left'); fitTxt(c, '£0.00', 240, -200, 56, '#9A948A', 200, 'Cav7', 'right');
  c.fillStyle = '#B9B2A8'; c.fillRect(-250, -120, 500, 4); fitTxt(c, 'TOTAL', -240, -30, 58, '#2B2F3A', 220, 'Unb9', 'left'); fitTxt(c, '£4.50', 240, -30, 64, '#E0474C', 210, 'Unb9', 'right');
  fitTxt(c, 'THANK YOU!', 0, 120, 56, '#2B2F3A', 500, 'Cav7'); c.fillStyle = '#2B2F3A'; for (let i = 0; i < 26; i++) c.fillRect(-250 + i * 19, 240, i % 3 ? 8 : 14, 140);
  c.restore(); const st = eBack(clamp((t - ev('o1', 'rcpt') - 0.25) / 0.25), 2); if (st > 0) { c.save(); c.translate(560, 1290); c.rotate(-0.18); c.scale(st, st); c.strokeStyle = '#E0474C'; c.lineWidth = 12; rr(c, -230, -70, 460, 140, 24); c.stroke(); fitTxt(c, 'PAID?', 0, 4, 90, '#E0474C', 400); c.restore(); } }
// o2: her cable stuck into the oat milk carton — still 1%
function milkView(c, t) { backdrop(c, t, '#BFE0F0', '#7FB4D8'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'milk' });
  const k = pop(t, ev('o2', 'plug')), u = t - ev('o2', 'plug'), push = eOut(clamp((u - 0.15) / 0.3));
  c.save(); c.translate(540, 960); c.scale(k, k);
  c.save(); c.translate(250, 520); carton(c, 1.9); c.restore();
  c.strokeStyle = '#FFFFFF'; c.lineWidth = 18; c.lineCap = 'round'; c.beginPath(); c.moveTo(-200, 300); c.bezierCurveTo(-200, 520, 120, 520, 170, 330 - 150 * 0 + lerp(60, 0, push) - 300); c.stroke();
  c.fillStyle = '#FFFFFF'; c.save(); c.translate(250, -120 + lerp(-60, 0, push)); rr(c, -24, -60, 48, 80, 8); c.fill(); c.restore();
  bigPhone(c, t, -200, -60, 0.72, 'low'); c.restore();
  if (u > 0.9) { const q = eBack(clamp((u - 0.9) / 0.25), 2); c.save(); c.translate(540 - 200 * k, 1420); c.scale(q, q); c.strokeStyle = '#E0474C'; c.lineWidth = 26; c.lineCap = 'round'; c.beginPath(); c.moveTo(-70, -70); c.lineTo(70, 70); c.moveTo(70, -70); c.lineTo(-70, 70); c.stroke(); c.restore(); } }
// o3 / twist: on charge
function chargeView(c, t) { backdrop(c, t, '#C9EED8', '#5FB884'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'charge' });
  const t0 = sceneAt(t).id === 'end' ? ev('end', 'zap') : ev('o3', 'charge'), k = pop(t, t0), u = t - t0, pct = 1 + Math.floor(clamp((u - 0.4) / 0.5) * (sceneAt(t).id === 'end' ? 4 : 1));
  c.save(); c.globalAlpha = 0.3 + 0.15 * Math.sin(t * 6); c.fillStyle = '#F2E14E'; c.beginPath(); c.arc(540, 860, 500 * k, 0, TAU); c.fill(); c.restore();
  c.strokeStyle = '#FFFFFF'; c.lineWidth = 22; c.lineCap = 'round'; c.beginPath(); c.moveTo(540, 860 + 420 * k); c.bezierCurveTo(540, 1500, 900, 1400, 1000, 1920); c.stroke();
  bigPhone(c, t, 540, 860, k, 'charge', pct);
  if (sceneAt(t).id === 'end') for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + t, r = 560 + 30 * Math.sin(t * 8 + i); c.save(); c.translate(540 + Math.cos(a) * r * k, 860 + Math.sin(a) * r * k); c.rotate(a); bolt(c, 0, 0, 0.7, '#F2E14E'); c.restore(); } }

// ---------------- overlays
function title(c, t) { const a = 1 - P(t, 2.25, 2.5); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 300); c.rotate(-0.04); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  // rubric tab «ПОЛЕЗНОЕ» on the card's top edge
  c.fillStyle = C.olive; rr(c, -440, -205, 300, 64, 32); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 5; rr(c, -440, -205, 300, 64, 32); c.stroke(); fitTxt(c, 'ПОЛЕЗНОЕ', -290, -172, 32, C.white, 250);
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -98);
  UI.textFit(c, 'Unb9', 130, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 10, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 64, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 116); c.restore();
  if (global.__QA) global.__QA.ui(c, 'card', { x: 50, y: 95, w: 980, h: 370, k: a, id: 'title' }); }
const PLATES = { o1: ['1', 'В ЛОБ', '#E0474C'], o2: ['2', 'ВЕЖЛИВО', '#F2B33D'], o3: ['3', 'КАК НОСИТЕЛЬ', '#4CAF6A'], o4: ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', '#8E5BD0'] };
function plate(c, t, sc) { const p = PLATES[sc.id]; if (!p) return; const u = t - sc.s, out = P(t, sc.e - 0.15, sc.e);
  const k = eBack(P(u, 0, 0.25), 2.2) * (1 - eIn(out)), big = 1 - eIO(P(u, 0.3, 0.5)); if (k <= 0) return;
  UI.font(c, 'Unb9', 54); const tw = c.measureText(p[1]).width, w = tw + 200, h = 100, smax = Math.min(1, 760 / w), s = k * lerp(smax, Math.min(1.4, 880 / w), big), y = 215;
  c.save(); c.translate(540, y); c.scale(s, s); c.rotate(-0.025);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -h / 2 + 9, w, h, 50); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 50); c.fill(); c.stroke();
  c.fillStyle = p[2]; c.beginPath(); c.arc(-w / 2 + 50, 0, 50, 0, TAU); c.fill(); c.stroke(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p[0], -w / 2 + 50, 4);
  c.fillStyle = C.oliveD; c.textAlign = 'left'; c.fillText(p[1], -w / 2 + 120, 4); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w / 2 * s, y: y - 50 * s, w: w * s, h: 100 * s, k, id: 'plate_' + sc.id }); }

// ---------------- end screen: question, 1 / 2 / 3 / 4, СОХРАНИ, ПОДПИСАТЬСЯ clicked by the cursor, then the comment question (ask)
const wAt = (id, w, fb) => K.wordT(id, w) ?? fb;
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, ask = SP.ask, { textFit, strokeText, font } = UI;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // heroine with her phone + the barista (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34, 2nd character at local x 640)
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gb = G.bar; K.put(c, BAR, { t, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, items: {}, afterTorso: cc => apron(cc, gb), armL: reach(gb, -1, -gb.sw * 1.7, gb.ySh + 60 + Math.sin(t * 6) * 15, { planar: true }), armR: reach(gb, 1, gb.sw * 1.7, gb.ySh + 60 + Math.sin(t * 6 + 1) * 15, { planar: true }) }, 640, 0);
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 160 + Math.sin(t * 8) * 30, { planar: true }), armR: reach(g, 1, g.sw * 1.25, g.ySh + 260, { planar: true }), items: { R: phoneItem(t, 'charge', 1.15) } }, 0, 0); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  // the top question: «А ТЫ БЫ ОТВЕТИЛА КАК?» -> on the ask line it flips to the comment question
  const swap = eIO(P(t, ask.t - 0.15, ask.t + 0.15));
  const q = eBack(P(u, 0.2, 0.55), 2.2) * (1 - swap); if (q > 0) { c.save(); c.translate(540, 300); c.scale(q, q); font(c, 'Unb9', 64); strokeText(c, 'А ТЫ БЫ', 0, -50, C.oliveD, C.white, 14); strokeText(c, 'ОТВЕТИЛА КАК?', 0, 40, C.pink, C.white, 14); c.restore(); }
  const q2 = eBack(P(t, ask.t, ask.t + 0.3), 2.2); if (q2 > 0) { c.save(); c.translate(540, 290); c.scale(q2, q2); c.rotate(-0.02);
    c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -480 + 8, -190 + 12, 960, 380, 40); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 8; rr(c, -480, -190, 960, 380, 40); c.fill(); c.stroke();
    textFit(c, 'Unb9', 66, 'СКОЛЬКО ПРОЦЕНТОВ', 880); c.fillStyle = C.oliveD; c.fillText('СКОЛЬКО ПРОЦЕНТОВ', 0, -110); textFit(c, 'Unb9', 66, 'У ТЕБЯ', 880); c.fillText('У ТЕБЯ', 0, -28);
    textFit(c, 'Unb9', 84, 'ПРЯМО СЕЙЧАС?', 880); strokeText(c, 'ПРЯМО СЕЙЧАС?', 0, 66, C.pink, C.white, 12);
    battIcon(c, 0, 148, 120, 50, 0.04 + 0.5 * (0.5 + 0.5 * Math.sin(t * 3)), '#E0474C'); c.restore(); }
  const tw = [wAt('outro', 'один', sp.t + 1.2), wAt('outro', 'два', sp.t + 1.6), wAt('outro', 'три', sp.t + 1.9), wAt('outro', 'четыре', sp.t + 2.3)];
  const LBL = { o1: ['В ЛОБ'], o2: ['ВЕЖЛИВО'], o3: ['КАК', 'НОСИТЕЛЬ'], o4: ['КОРОЛЕВ-', 'СКИЙ'] };
  ['o1', 'o2', 'o3', 'o4'].forEach((id, i) => { const p = PLATES[id], kk = eBack(P(t, tw[i] - 0.1, tw[i] + 0.2), 2.2); if (kk <= 0) return; const x = 290 + (i % 2) * 420, y = 640 + Math.floor(i / 2) * 200, bump = 1 + 0.06 * Math.sin(clamp((t - tw[i]) / 0.4) * Math.PI);
    c.save(); c.translate(x, y); c.scale(kk * bump, kk * bump); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -195 + 8, -80 + 12, 390, 160, 36); c.fill(); c.fillStyle = p[2]; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -195, -80, 390, 160, 36); c.fill(); c.stroke();
    font(c, 'Unb9', 120); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(p[0], -125, 8);
    const ls = LBL[id]; ls.forEach((s_, j) => { textFit(c, 'Unb9', 34, s_, 230); c.fillStyle = C.white; c.textAlign = 'left'; c.fillText(s_, -60, (j - (ls.length - 1) / 2) * 42 + 4); }); c.restore(); });
  const svT = wAt('outro', 'пиши', sp.t + 3.0) - 0.1, sk = eBack(P(t, svT, svT + 0.3), 2.2), pulse = 1 + 0.05 * Math.sin(clamp((t - svT - 0.4) / 0.5) * Math.PI);
  if (sk > 0) { c.save(); c.translate(540, 1040); c.scale(sk * pulse, sk * pulse); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -260 + 6, -60 + 10, 520, 120, 60); c.fill(); c.fillStyle = C.gold; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -260, -60, 520, 120, 60); c.fill(); c.stroke();
    c.fillStyle = C.oliveD; c.beginPath(); c.moveTo(-190, -32); c.lineTo(-146, -32); c.lineTo(-146, 34); c.lineTo(-168, 16); c.lineTo(-190, 34); c.closePath(); c.fill();   // bookmark icon
    textFit(c, 'Unb9', 50, 'СОХРАНИ', 330); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.fillText('СОХРАНИ', 40, 4); c.restore(); }
  const subT = Math.min(svT + 0.7, sp.t + sp.d - 0.9), bk = eBack(P(t, subT, subT + 0.3), 2), sy = 1230;
  if (bk > 0) { const click = P(t, subT + 0.8, subT + 0.95), pressed = t > subT + 0.9; c.save(); c.translate(560, sy); const ss = bk * (1 - 0.08 * Math.sin(click * Math.PI)); c.scale(ss, ss); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -250 + 6, -58 + 10, 500, 116, 58); c.fill(); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -250, -58, 500, 116, 58); c.fill(); textFit(c, 'Unb9', 42, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 440); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4); c.restore();
    const mv = eIO(P(t, subT + 0.2, subT + 0.8)); UI.tapCursor(c, lerp(900, 620, mv), lerp(sy + 260, sy + 20, mv), 1, P(t, subT + 0.85, subT + 1.4)); }
  if (t < ask.t - 0.1) { c.save(); c.translate(0, -60); UI.captions(c, t); c.restore(); }
  Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag.startsWith('ui:')) { ({ 'ui:phone': phoneView, 'ui:rcpt': rcptView, 'ui:milk': milkView, 'ui:charge': chargeView })[tag](c, t); heads = { her: OFFL, barista2: OFF }; proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.24); }
  const names = { barista2: ['BARISTA', '#2E6B5A'] }, onScr = {}; for (const k in heads) if (Math.abs(heads[k].x) < 1e4) onScr[k] = heads[k];   // a speaker who is not in the shot never gets a bubble
  if (!tag.startsWith('ui:')) K.bubbles(c, t, sc, onScr, proj, { cleanChunks: true, names, hold: { hook_b: -0.05, o1_h: -0.22, o1_b: -0.2, o2_h: -0.22, o2_b: -0.2, o3_h: -0.22, o3_b: -0.2, o4_h: -0.15, o4_b: 0.2, end_b: -0.15 } });
  if (L === 'hook') title(c, t);
  plate(c, t, sc);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  // the end screen wipes in from the twist
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('battery', NF, renderFrame);
