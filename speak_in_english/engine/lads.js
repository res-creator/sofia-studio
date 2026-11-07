// "Муж хочет в отпуск с друзьями. Без меня" — rubric «Ответ на вопрос из комментариев» (live scene + 4 answers), hard_cut camera: node lads.js start end out.mp4 | --png=f1,f2
// Living room: the heroine (arms folded) on the left; her husband Brian (holiday cap, sunglasses on the cap, fishing rod, blue cooler box at his feet) on the right.
// hook: "The lads and I are going to Spain..." -> he flips his sunglasses down; her glare; comment plate.
// 1 · ХОЛОДНО: "Fine. Go." (open palm to the door) -> he hugs the cooler box, shaking + sweat. 2 · С ЮМОРОМ: she holds up his credit card + Paris postcard;
// insert (postcard + card) -> "How about we all go to Spain?" he drops the rod, grabs for the card, she lifts it out of reach.
// 3 · КАК НОСИТЕЛЬ: calm answer -> "Deal." handshake + hearts + Bella tip. 4 · КОРОЛЕВСКИЙ ОТВЕТ: five-star spa brochure; insert: «PAID BY: BRIAN» stamp -> "...Both?" -> wallet: a moth flies out.
// Twist (music silent): his phone buzzes; group-chat insert LADS TRIP (sun + flag drawn): Dave / Mike / Tom drop out -> "So, Paris?" -> she shows the Paris postcard (beret), he carries her pink suitcase -> moral. End screen 1/2/3/4.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/lads/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];

// ---------------- cast
const HER = { ...BASE.her_lift, top: { type: 'cardigan', col: '#EF7FAA', col2: '#FFF6F0' }, bottom: { type: 'jeans', col: '#5E7CA8' } };
const HUS = { ...BASE.tom, cap: { col: '#3FA9F5' }, top: { type: 'tee', col: '#F2C14E' }, bottom: { type: 'shorts', col: '#5A7A4A' }, shoes: { col: '#F4EFE6', acc: '#3FA9F5' } };
const G = { her: geom(HER), husband: geom(HUS) };
const X = { her: -270, hus: 290 }, COOLX = 640, DOORX = -1250, SHAKEX = 20;
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function heart(c, x, y, r, col = '#E0474C') { c.save(); c.translate(x, y); c.fillStyle = col; c.beginPath(); c.moveTo(0, r * 0.9); c.bezierCurveTo(-r * 1.5, -r * 0.1, -r * 0.7, -r * 1.2, 0, -r * 0.45); c.bezierCurveTo(r * 0.7, -r * 1.2, r * 1.5, -r * 0.1, 0, r * 0.9); c.fill(); c.restore(); }
function star(c, x, y, r, col) { c.save(); c.translate(x, y); c.fillStyle = col; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr_ = i % 2 ? r * 0.45 : r; c.lineTo(Math.cos(a) * rr_, Math.sin(a) * rr_); } c.closePath(); c.fill(); c.restore(); }
function sunIcon(c, x, y, r) { c.save(); c.translate(x, y); c.strokeStyle = '#F2B33D'; c.lineWidth = r * 0.22; c.lineCap = 'round'; for (let i = 0; i < 8; i++) { const a = i * TAU / 8; c.beginPath(); c.moveTo(Math.cos(a) * r * 1.2, Math.sin(a) * r * 1.2); c.lineTo(Math.cos(a) * r * 1.6, Math.sin(a) * r * 1.6); c.stroke(); } c.fillStyle = '#FFD040'; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill(); c.restore(); }
function flagES(c, x, y, w) { const h = w * 0.66; c.save(); c.translate(x, y); c.fillStyle = '#C8383E'; rr(c, -w / 2, -h / 2, w, h, w * 0.08); c.fill(); c.fillStyle = '#F2C14E'; c.fillRect(-w / 2, -h / 4, w, h / 2); c.restore(); }

// ---------------- props (paths only; English only on the props)
// fishing rod held in the hand: grip at the wrist, the rod goes up and to the right; the line hangs from the tip with a red/white float
function rod(c, t, sw = 0) { c.save(); c.rotate(Math.sin(t * 7) * 0.03 * sw);
  c.strokeStyle = '#3A3A44'; c.lineCap = 'round'; c.lineWidth = 22; c.beginPath(); c.moveTo(-20, 90); c.lineTo(30, -60); c.stroke();
  c.strokeStyle = '#2B2F3A'; c.lineWidth = 12; c.beginPath(); c.moveTo(30, -60); c.quadraticCurveTo(170, -500, 420 + Math.sin(t * 3) * 8, -1000); c.stroke();
  c.fillStyle = '#C9D2DA'; c.strokeStyle = '#6A7480'; c.lineWidth = 4; c.beginPath(); c.arc(24, 40, 34, 0, TAU); c.fill(); c.stroke(); c.fillStyle = '#6A7480'; c.fillRect(20, 6, 8, 30);
  c.strokeStyle = 'rgba(40,40,50,.6)'; c.lineWidth = 3; const tx = 420 + Math.sin(t * 3) * 8, ty = -1000, fy = -560 + Math.sin(t * 2.2) * 14; c.beginPath(); c.moveTo(tx, ty); c.lineTo(tx + Math.sin(t * 2) * 10, fy); c.stroke();
  c.save(); c.translate(tx + Math.sin(t * 2) * 10, fy); c.fillStyle = '#E0474C'; c.beginPath(); c.arc(0, 0, 20, Math.PI, 0); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(0, 0, 20, 0, Math.PI); c.fill(); c.restore();
  c.restore(); }
const rodItem = (t, sw) => ctx => rod(ctx, t, sw);
// rod lying on the floor (after he drops it)
function rodFloor(c, x) { c.save(); c.translate(x, -12); c.strokeStyle = '#2B2F3A'; c.lineCap = 'round'; c.lineWidth = 12; c.beginPath(); c.moveTo(-60, 0); c.lineTo(900, -6); c.stroke(); c.strokeStyle = '#3A3A44'; c.lineWidth = 22; c.beginPath(); c.moveTo(-200, 0); c.lineTo(-40, 0); c.stroke(); c.fillStyle = '#C9D2DA'; c.beginPath(); c.arc(-80, -26, 30, 0, TAU); c.fill(); c.restore(); }
// blue cooler box; (0,0) = bottom centre
function cooler(c, s = 1) { c.save(); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(0, 4, 190, 22, 0, 0, TAU); c.fill();
  paint(c, q => { q.m(-160, -250); q.l(160, -250); q.l(150, 0); q.l(-150, 0); q.z(); }, '#3F86D0', { sd: 8, hd: 4, lw: 4 });
  paint(c, q => { q.m(-175, -300); q.l(175, -300); q.l(170, -240); q.l(-170, -240); q.z(); }, '#F4F6FA', { sd: 5, hd: 3, lw: 4 });
  c.strokeStyle = '#F4F6FA'; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(-90, -300); c.quadraticCurveTo(0, -390, 90, -300); c.stroke();
  c.fillStyle = '#FFFFFF'; rr(c, -110, -190, 220, 84, 16); c.fill(); fitTxt(c, 'COOL', 0, -148, 50, '#3F86D0', 190);
  c.restore(); }
// sunglasses (black, his); (0,0) = bridge
function shades(c, s = 1, rot = 0) { c.save(); c.scale(s, s); c.rotate(rot);
  for (const sx of [-1, 1]) { c.fillStyle = '#1E2030'; c.strokeStyle = '#111'; c.lineWidth = 6; c.beginPath(); rr(c, sx > 0 ? 10 : -86, -26, 76, 52, 18); c.fill(); c.stroke(); c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 5; c.beginPath(); c.moveTo(sx * 48 - 14, -10); c.lineTo(sx * 48 + 4, -18); c.stroke(); }
  c.strokeStyle = '#111'; c.lineWidth = 7; c.beginPath(); c.moveTo(-12, -12); c.quadraticCurveTo(0, -20, 12, -12); c.stroke(); c.restore(); }
// his credit card (blue, chip, name)
function card(c, s = 1, rot = 0) { c.save(); c.scale(s, s); c.rotate(rot);
  c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -84, -50, 176, 110, 14); c.fill();
  const g = c.createLinearGradient(-90, -55, 90, 55); g.addColorStop(0, '#2F5E9E'); g.addColorStop(1, '#5BB6E8'); c.fillStyle = g; rr(c, -90, -55, 180, 110, 14); c.fill();
  c.fillStyle = '#F2C14E'; rr(c, -66, -24, 40, 30, 6); c.fill(); c.strokeStyle = '#B88A2A'; c.lineWidth = 2; c.strokeRect(-60, -18, 28, 18);
  c.fillStyle = 'rgba(255,255,255,.8)'; for (let i = 0; i < 4; i++) rr(c, -66 + i * 36, 18, 28, 8, 4), c.fill();
  fitTxt(c, 'BRIAN', 50, 38, 16, '#FFFFFF', 70, 'Unb9'); c.fillStyle = '#E0474C'; c.beginPath(); c.arc(54, -30, 14, 0, TAU); c.fill(); c.fillStyle = '#F2B33D'; c.beginPath(); c.arc(70, -30, 14, 0, TAU); c.fill();
  c.restore(); }
const cardItem = (s = 1.15) => ctx => { ctx.save(); ctx.translate(0, -60); card(ctx, s, -0.15); ctx.restore(); };
// Eiffel tower postcard; (0,0) = centre
function eiffel(c, x, y, s, col) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col;
  c.beginPath(); c.moveTo(-6, -200); c.lineTo(6, -200); c.lineTo(24, -60); c.lineTo(40, -60); c.lineTo(38, -46); c.lineTo(30, -46); c.lineTo(80, 70); c.lineTo(46, 70); c.quadraticCurveTo(0, 10, -46, 70); c.lineTo(-80, 70); c.lineTo(-30, -46); c.lineTo(-38, -46); c.lineTo(-40, -60); c.lineTo(-24, -60); c.closePath(); c.fill();
  c.fillRect(-56, 0, 112, 12); c.restore(); }
function postcard(c, s = 1, rot = 0) { c.save(); c.scale(s, s); c.rotate(rot);
  c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -146, -96, 300, 204, 12); c.fill(); c.fillStyle = '#FFFDF6'; rr(c, -150, -100, 300, 200, 12); c.fill();
  const g = c.createLinearGradient(0, -86, 0, 60); g.addColorStop(0, '#F7A8C0'); g.addColorStop(1, '#FCE3C0'); c.fillStyle = g; rr(c, -136, -86, 272, 150, 8); c.fill();
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(80, -46, 22, 0, TAU); c.fill();
  eiffel(c, -30, 30, 0.55, '#5A4A6A'); fitTxt(c, 'PARIS', 0, 84, 30, '#D9467E', 200, 'Unb9');
  c.restore(); }
const postcardItem = (s = 1) => ctx => { ctx.save(); ctx.translate(0, -70); postcard(ctx, s, 0.08); ctx.restore(); };
// five-star spa brochure (folded leaflet); (0,0) = centre
function brochure(c, s = 1, rot = 0, stampK = 0) { c.save(); c.scale(s, s); c.rotate(rot);
  c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -146, -196, 300, 400, 14); c.fill();
  c.fillStyle = '#FFFFFF'; rr(c, -150, -200, 300, 400, 14); c.fill(); c.strokeStyle = '#C9A85A'; c.lineWidth = 6; rr(c, -138, -188, 276, 376, 10); c.stroke();
  c.fillStyle = '#2E8C86'; rr(c, -126, -176, 252, 150, 8); c.fill();
  c.fillStyle = '#7CD3E0'; c.beginPath(); c.ellipse(0, -60, 110, 26, 0, 0, TAU); c.fill();
  c.fillStyle = '#F4F6FA'; for (const a of [-0.6, 0, 0.6]) { c.save(); c.translate(0, -100); c.rotate(a); c.beginPath(); c.ellipse(0, -16, 14, 34, 0, 0, TAU); c.fill(); c.restore(); }
  fitTxt(c, 'LUXURY SPA', 0, 14, 40, '#2E5A58', 250, 'Unb9');
  for (let i = 0; i < 5; i++) star(c, -96 + i * 48, 66, 20, '#F2B33D');
  fitTxt(c, '7 NIGHTS', 0, 116, 30, '#2E5A58', 250, 'Unb9'); fitTxt(c, '£4,800', 0, 160, 44, '#E0474C', 250, 'Unb9');
  if (stampK > 0) { const k = lerp(2.2, 1, eOut(stampK)); c.save(); c.translate(0, 40); c.rotate(-0.25); c.scale(k, k); c.globalAlpha = clamp(stampK * 3); c.strokeStyle = '#D8383E'; c.lineWidth = 8; rr(c, -130, -48, 260, 96, 12); c.stroke(); fitTxt(c, 'PAID BY:', 0, -16, 30, '#D8383E', 230); fitTxt(c, 'BRIAN', 0, 22, 44, '#D8383E', 230); c.restore(); }
  c.restore(); }
const brochItem = (s = 0.75) => ctx => { ctx.save(); ctx.translate(-10, -150 * s * 1.4); brochure(ctx, s, -0.06); ctx.restore(); };
// his wallet: closed / open (empty)
function wallet(c, s = 1, open = 0) { c.save(); c.scale(s, s);
  if (open < 0.5) { paint(c, q => { q.m(-70, -48); q.l(70, -48); q.l(70, 48); q.l(-70, 48); q.z(); }, '#6A4A34', { sd: 4, hd: 2, lw: 4 }); c.strokeStyle = 'rgba(255,255,255,.3)'; c.setLineDash([8, 6]); c.lineWidth = 3; c.strokeRect(-60, -38, 120, 76); c.setLineDash([]); }
  else { for (const sx of [-1, 1]) paint(c, q => { q.m(0, -48); q.l(sx * 130, -56); q.l(sx * 130, 44); q.l(0, 48); q.z(); }, sx < 0 ? '#6A4A34' : '#7E5A40', { sd: 4, hd: 2, lw: 4 }); c.fillStyle = '#3A2A20'; c.fillRect(8, -30, 110, 16); c.fillRect(8, 0, 110, 16); }
  c.restore(); }
const walletItem = (open) => ctx => { ctx.save(); ctx.translate(0, -50); wallet(ctx, 1.05, open); ctx.restore(); };
function moth(c, x, y, s, t) { c.save(); c.translate(x, y); c.scale(s, s); const f = Math.sin(t * 40) * 0.5 + 0.6; c.fillStyle = '#B8AC98'; c.strokeStyle = '#6A6050'; c.lineWidth = 3;
  for (const sx of [-1, 1]) { c.save(); c.scale(sx, 1); c.rotate(-0.3 * f); c.beginPath(); c.ellipse(28, -8, 30, 20 * f + 4, -0.4, 0, TAU); c.fill(); c.stroke(); c.beginPath(); c.ellipse(22, 14, 18, 12 * f + 3, 0.4, 0, TAU); c.fill(); c.stroke(); c.restore(); }
  c.fillStyle = '#5A5040'; c.beginPath(); c.ellipse(0, 0, 8, 22, 0, 0, TAU); c.fill(); c.strokeStyle = '#5A5040'; c.lineWidth = 2; c.beginPath(); c.moveTo(-3, -20); c.lineTo(-12, -36); c.moveTo(3, -20); c.lineTo(12, -36); c.stroke(); c.restore(); }
// his phone in the hand (screen glowing)
const phoneItem = ctx => { ctx.save(); ctx.translate(0, -60); ctx.rotate(-0.1); ctx.fillStyle = '#2B2F3A'; rr(ctx, -44, -80, 88, 160, 16); ctx.fill(); ctx.fillStyle = '#8FD0FF'; rr(ctx, -36, -70, 72, 140, 10); ctx.fill(); ctx.fillStyle = '#FFFFFF'; for (let i = 0; i < 3; i++) rr(ctx, -28 + (i % 2) * 14, -54 + i * 38, 42, 24, 8), ctx.fill(); ctx.restore(); };
// her pink suitcase with a PARIS sticker; (0,0) = handle top
function suitcase(c, s = 1) { c.save(); c.scale(s, s); c.strokeStyle = '#3A3A44'; c.lineWidth = 12; c.beginPath(); c.moveTo(-40, 0); c.lineTo(-40, -50); c.lineTo(40, -50); c.lineTo(40, 0); c.stroke();
  paint(c, q => { q.m(-150, 0); q.l(150, 0); q.l(150, 400); q.l(-150, 400); q.z(); }, '#EE5E9A', { sd: 8, hd: 4, lw: 4 });
  c.strokeStyle = 'rgba(0,0,0,.15)'; c.lineWidth = 8; for (const x of [-70, 0, 70]) { c.beginPath(); c.moveTo(x, 30); c.lineTo(x, 370); c.stroke(); }
  c.fillStyle = '#FFFDF6'; rr(c, -90, 140, 180, 100, 14); c.fill(); fitTxt(c, 'PARIS', 0, 192, 40, '#D9467E', 160); c.fillStyle = '#2B2F3A'; for (const x of [-110, 110]) { c.beginPath(); c.arc(x, 412, 18, 0, TAU); c.fill(); } c.restore(); }
const caseItem = ctx => { ctx.save(); ctx.translate(0, 20); suitcase(ctx, 0.9); ctx.restore(); };
function beret(c, gg, g) { const x = gg.head.x, y = gg.head.y - g.hh * 0.78; c.save(); c.translate(x - g.hw * 0.1, y); c.rotate(-0.22);
  paint(c, q => { q.m(-g.hw * 1.05, 10); q.q(-g.hw * 1.1, -g.hh * 0.55, 0, -g.hh * 0.55); q.q(g.hw * 1.15, -g.hh * 0.5, g.hw * 1.0, 10); q.q(0, 34, -g.hw * 1.05, 10); q.z(); }, '#C8383E', { sd: 6, hd: 3, lw: 4 });
  c.fillStyle = '#8A2A30'; c.fillRect(-6, -g.hh * 0.68, 12, 26); c.restore(); }
function sweat(c, hd, t, k) { if (k <= 0 || !hd || Math.abs(hd.x) > 1e4) return; c.save(); c.globalAlpha = k; for (let i = 0; i < 3; i++) { const u = ((t * 1.4 + i * 0.33) % 1), x = hd.x + (i - 1) * hd.hh * 0.9 + (i === 1 ? hd.hh * 1.3 : 0), y = hd.y - hd.hh * 0.9 + u * hd.hh * 0.9;
  c.fillStyle = '#7CC7F2'; c.strokeStyle = '#2E7AB0'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - hd.hh * 0.16); c.quadraticCurveTo(x + hd.hh * 0.09, y, x, y + hd.hh * 0.06); c.quadraticCurveTo(x - hd.hh * 0.09, y, x, y - hd.hh * 0.16); c.fill(); c.stroke(); } c.restore(); }

// ---------------- living room (prerendered, softly blurred)
const BX0 = -2800, BY0 = -3800, BW = 6000, BH = 5600, BS = 0.5;
function drawRoom(c) {
  c.fillStyle = '#E7F0EA'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = 'rgba(120,170,150,.14)'; for (let x = BX0; x < BX0 + BW; x += 150) c.fillRect(x, BY0, 55, 3800);
  c.fillStyle = '#C9A88A'; c.fillRect(BX0, -200, BW, 30);
  // the front door on the left (she points at it in o1)
  c.fillStyle = '#F7F4EE'; c.fillRect(DOORX - 330, -2250, 660, 2080); c.fillStyle = '#7A5A40'; rr(c, DOORX - 280, -2200, 560, 2030, 10); c.fill();
  c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 8; for (const [x, y, w, h] of [[-230, -2120, 200, 800], [30, -2120, 200, 800], [-230, -1200, 200, 900], [30, -1200, 200, 900]]) c.strokeRect(DOORX + x, y, w, h);
  c.fillStyle = '#E3C060'; c.beginPath(); c.arc(DOORX + 210, -1150, 24, 0, TAU); c.fill();
  // window with a grey London sky
  c.fillStyle = '#FBF5EC'; rr(c, 1350, -2450, 900, 1200, 18); c.fill(); const g = c.createLinearGradient(0, -2420, 0, -1280); g.addColorStop(0, '#9AA6B8'); g.addColorStop(1, '#C9D2DA'); c.fillStyle = g; rr(c, 1380, -2420, 840, 1140, 10); c.fill();
  c.fillStyle = 'rgba(255,255,255,.5)'; for (const [x, y] of [[1500, -2200], [1800, -2050], [2050, -2300]]) { c.beginPath(); c.arc(x, y, 70, 0, TAU); c.arc(x + 80, y - 20, 90, 0, TAU); c.arc(x + 170, y, 70, 0, TAU); c.fill(); }
  c.strokeStyle = 'rgba(120,140,160,.6)'; c.lineWidth = 4; for (let i = 0; i < 24; i++) { const x = 1400 + (i * 97) % 800, y = -2380 + (i * 173) % 1050; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 10, y + 50); c.stroke(); }
  c.fillStyle = '#FBF5EC'; c.fillRect(1790, -2420, 18, 1140); c.fillRect(1380, -1870, 840, 16); c.fillStyle = '#C96A7A'; rr(c, 1240, -2520, 160, 1360, 30); c.fill(); rr(c, 2200, -2520, 160, 1360, 30); c.fill();
  // framed pictures: a fish (his) and a heart (hers)
  c.fillStyle = '#6A4A34'; rr(c, -560, -2350, 420, 320, 12); c.fill(); c.fillStyle = '#BFE3F5'; rr(c, -530, -2320, 360, 260, 8); c.fill();
  c.fillStyle = '#5A8FC9'; c.beginPath(); c.ellipse(-360, -2190, 110, 50, 0, 0, TAU); c.fill(); c.beginPath(); c.moveTo(-260, -2190); c.lineTo(-200, -2240); c.lineTo(-200, -2140); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(-420, -2200, 12, 0, TAU); c.fill();
  c.fillStyle = '#6A4A34'; rr(c, 120, -2380, 320, 380, 12); c.fill(); c.fillStyle = '#FCE3EC'; rr(c, 150, -2350, 260, 320, 8); c.fill(); heart(c, 280, -2200, 70, '#EE5E9A');
  // sofa against the back wall
  paint(c, q => { q.m(-700, -1050); q.q(0, -1100, 900, -1050); q.l(900, -500); q.l(-700, -500); q.z(); }, '#6A7FC0', { sd: 12, hd: 6, lw: 3 });
  paint(c, q => { q.m(-760, -620); q.l(960, -620); q.l(960, -260); q.l(-760, -260); q.z(); }, '#7C90D0', { sd: 10, hd: 5, lw: 3 });
  for (const x of [-830, 960]) paint(c, q => { q.m(x, -820); q.q(x + 60, -880, x + 130, -820); q.l(x + 130, -260); q.l(x, -260); q.z(); }, '#6A7FC0', { sd: 10, hd: 5, lw: 3 });
  c.fillStyle = '#F2C14E'; rr(c, -560, -940, 260, 240, 50); c.fill(); c.fillStyle = '#EE5E9A'; rr(c, 560, -940, 260, 240, 50); c.fill();
  c.fillStyle = '#4A3A2A'; c.fillRect(-740, -260, 30, 90); c.fillRect(920, -260, 30, 90);
  // floor lamp + plant
  c.fillStyle = '#3A3A44'; c.fillRect(-2005, -1500, 14, 1500); paint(c, q => { q.m(-2130, -1500); q.l(-1870, -1500); q.l(-1930, -1720); q.l(-2070, -1720); q.z(); }, '#F7E6B0', { sd: 4, hd: 2, lw: 4 });
  c.fillStyle = '#6A9E5A'; for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(2580 + i * 30, -700 - i * 60, 60, 170, -0.6 + i * 0.22, 0, TAU); c.fill(); } c.fillStyle = '#C9733A'; rr(c, 2500, -320, 240, 320, 20); c.fill();
  // floor + rug
  c.fillStyle = '#B88A60'; c.fillRect(BX0, -170, BW, 2000); c.fillStyle = 'rgba(0,0,0,.08)'; for (let x = BX0; x < BX0 + BW; x += 220) c.fillRect(x, -170, 8, 2000);
  c.fillStyle = '#E8D3B0'; c.beginPath(); c.ellipse(100, 60, 1300, 140, 0, 0, TAU); c.fill(); c.strokeStyle = '#C96A7A'; c.lineWidth = 10; c.beginPath(); c.ellipse(100, 60, 1220, 115, 0, 0, TAU); c.stroke();
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawRoom);

// ---------------- character helpers (standing)
const gest = (st, g, who, t, side, base) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20, { planar: true }); } };
const down = (g, s) => reach(g, s, s * g.sw * 1.08, g.ySh + 540, { planar: true });
const open = (g, s, k = 1.7, dy = 90) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const hold = (g, s, dy = 330, k = 0.75) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const folded = (g, st) => { st.armL = reach(g, -1, g.sw * 0.32, g.ySh + 270, { planar: true }); st.armR = reach(g, 1, -g.sw * 0.32, g.ySh + 290, { planar: true }); };
const base = (g, t, who) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, armL: down(g, -1), armR: down(g, 1), items: {} });
const rodHand = (g, st, t, sw = 0) => { st.armR = reach(g, 1, g.sw * 1.15, g.ySh + 330, { planar: true }); st.items = { ...st.items, R: rodItem(t, sw) }; };
// holding something at the chest with both hands (drawn after the torso, under the hands)
const holdFront = (g, st, fn, dy = 260, k = 0.8) => { st.armL = reach(g, -1, -g.sw * k, g.ySh + dy, { planar: true }); st.armR = reach(g, 1, g.sw * k, g.ySh + dy, { planar: true }); st.afterTorso = (c, gg) => { c.save(); c.translate(0, gg.ySh + dy + 120); fn(c); c.restore(); }; };

function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { ...base(g, t, 'her'), mood: 'skeptical', turn: 0.25, look: 0.7 };
  folded(g, st);
  if (L === 'hook') { if (speaking('hook_m', t, 0, 0)) { st.mood = t > hev('wink') ? 'annoyed' : 'skeptical'; } if (t > endOf('hook_m')) { st.mood = 'annoyed'; } if (t > hev('her') - 0.1) { st.mood = 'angry'; st.turn = 0.1; st.look = 0.25; st.blink = 0; st.breathe = 0; } if (t > hev('wide')) { st.turn = 0.25; st.look = 0.7; } }
  if (L === 'o1') { st.mood = 'bored'; if (speaking('o1_h', t, 0.05, 0.1)) st.mood = 'annoyed';
    if (t > e('door')) { st.armL = reach(g, -1, -g.sw * 2.3, g.ySh + 40, { planar: true }); st.turn = 0.15; st.look = 0.3; }
    if (t > SP.o1_m.t + 0.2) { st.mood = 'bored'; st.blink = 0; }
    if (t > SP.o1_nar.t) { folded(g, st); st.mood = 'annoyed'; } }
  if (L === 'o2') { st.mood = 'neutral';
    if (speaking('o2_h', t, 0.05, 0.1)) { st.mood = 'happy'; gest(st, g, 'her', t, -1, 160); st.armR = down(g, 1); }
    if (t > e('card')) { const k = eBack(P(t, e('card'), e('card') + 0.3), 1.6); st.armR = reach(g, 1, g.sw * 1.35, lerp(g.ySh + 400, g.ySh - 30, k), { planar: true }); st.items = { R: cardItem() }; st.armL = hold(g, -1, 300, 0.9); st.items.L = postcardItem(0.8); st.mood = 'happy'; }
    if (t > endOf('o2_h') + 0.05) { st.mood = 'smug'; st.blink = 1; }
    if (t > e('grab')) { const k = eOut(P(t, e('grab'), e('grab') + 0.25)); st.armR = reach(g, 1, g.sw * lerp(1.35, 1.0, k), lerp(g.ySh - 30, g.headY - g.hh * 1.1, k), { planar: true }); st.turn = 0.1; st.look = 0.4; st.mood = 'happy'; st.laugh = true; st.blink = 0; } }
  if (L === 'o3') { st.mood = 'neutral';
    if (speaking('o3_h', t, 0.05, 0.1)) { st.mood = 'happy'; st.armL = open(g, -1, 1.6, 150 + Math.sin(t * 5) * 12); st.armR = open(g, 1, 1.6, 150 + Math.cos(t * 5) * 12); }
    if (t > SP.o3_m.t) { st.mood = 'happy'; folded(g, st); st.armR = down(g, 1); st.armL = down(g, -1); }
    if (t > e('shake')) { const k = eOut(P(t, e('shake'), e('shake') + 0.25)), bob = Math.sin((t - e('shake')) * 14) * 18 * (1 - P(t, e('shake') + 0.8, e('shake') + 1.2)); st.armR = reach(g, 1, lerp(g.sw * 1.0, SHAKEX - X.her, k), g.ySh + lerp(500, 330, k) + bob, { planar: true }); st.mood = 'happy'; st.blink = 1; }
    if (t > SP.o3_tip.t - 0.2) { st.blink = 0; st.turn = 0.15; st.look = 0.3; } }
  if (L === 'o4') { st.mood = 'smug'; st.armR = down(g, 1);
    if (speaking('o4_h', t, 0.05, 0.1)) { st.mood = 'happy'; gest(st, g, 'her', t, -1, 120); st.armL = st.armL; }
    if (t > e('broch')) { const k = eBack(P(t, e('broch'), e('broch') + 0.3), 1.5); st.armR = reach(g, 1, g.sw * 1.1, lerp(g.ySh + 420, g.ySh + 60, k), { planar: true }); st.items = { R: brochItem() }; }
    if (t > endOf('o4_h') + 0.05) { st.mood = 'smug'; st.blink = 1; }
    if (t > e('moth')) { st.mood = 'happy'; st.laugh = true; st.blink = 0; } }
  if (L === 'end') { st.mood = 'skeptical';
    if (t > ev('end', 'm2')) { st.mood = 'smug'; st.blink = 1; }
    if (t > e('so')) { st.mood = 'skeptical'; st.blink = 0; st.tilt = 0.06; }
    if (t > e('paris')) { const k = eBack(P(t, e('paris'), e('paris') + 0.3), 1.6); st.tilt = 0.04; st.mood = 'happy'; st.laugh = t < SP.moral.t; st.blink = 0; st.armR = reach(g, 1, g.sw * 1.35, lerp(g.ySh + 400, g.ySh - 40, k), { planar: true }); st.items = { R: postcardItem(1.0) }; st.armL = open(g, -1, 1.5, 200);
      st.front = (c, gg) => beret(c, gg, g); } }
  return st; }

function husState(t, L) { const g = G.husband, e = k => ev(L, k), st = { ...base(g, t, 'husband'), mood: 'happy', turn: -0.25, look: -0.7 };
  rodHand(g, st, t);
  const shadesUp = (c, gg) => { c.save(); c.translate(gg.head.x + g.hw * 0.05, gg.head.y - g.hh * 1.02); shades(c, g.hw / 120, -0.06); c.restore(); };
  const shadesOn = (c, gg) => { c.save(); c.translate(gg.head.x - g.hw * 0.06, gg.head.y + g.hh * 0.02); shades(c, g.hw / 92, 0.02); c.restore(); };
  st.front = shadesUp;
  if (L === 'hook') { st.mood = 'happy'; rodHand(g, st, t, 1);
    if (speaking('hook_m', t, 0, 0.1)) { gest(st, g, 'husband', t, -1, 150); st.laugh = t > hev('wink') + 0.6; if (t > hev('wink')) st.tilt = -0.08; }
    if (t > hev('shades')) { const k = P(t, hev('shades'), hev('shades') + 0.2); st.front = k < 0.5 ? shadesUp : shadesOn; st.mood = 'smug'; st.turn = 0.05; st.look = 0.1; st.armL = reach(g, -1, -g.sw * 1.6, g.ySh + 120 + Math.sin(t * 6) * 15, { planar: true }); st.headY = Math.sin(t * 6) * 5; } }
  if (L === 'o1') { st.mood = 'happy';
    if (speaking('o1_h', t, 0.05, 0.1)) { st.mood = 'surprised'; st.blink = 0; }
    if (t > SP.o1_m.t - 0.05) { st.mood = 'surprised'; st.blink = 0; }
    if (t > e('hug')) { st.items = {}; holdFront(g, st, c => cooler(c, 0.95), 250, 0.62); st.mood = 'worried'; st.blink = 0; st.headX = Math.sin(t * 30) * 4; st.tilt = 0.05; st.lookY = 0.1; st.rodLean = true; }
    if (t > SP.o1_nar.t) { st.mood = 'worried'; st.turn = -0.2; st.look = -0.6; } }
  if (L === 'o2') { st.mood = 'happy';
    if (speaking('o2_h', t, 0, 0)) st.mood = t > e('card') ? 'shock' : 'happy';
    if (t > e('card')) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; }
    if (t > e('drop') - 0.05) { st.items = {}; st.armR = open(g, 1, 1.7, 80 + Math.sin(t * 8) * 15); st.armL = open(g, -1, 1.7, 80 + Math.cos(t * 8) * 15); st.mood = 'happy'; st.laugh = false; st.tilt = -0.06; }
    if (t > e('grab')) { const k = eOut(P(t, e('grab'), e('grab') + 0.25)); st.armL = reach(g, -1, lerp(-g.sw * 1.7, -(X.hus - X.her) + G.her.sw * 1.0, k), lerp(g.ySh + 80, g.headY + 40, k) + Math.sin(t * 16) * 15 * k, { planar: true }); st.armR = down(g, 1); st.mood = 'worried'; st.tilt = 0; st.lean = -0.3 * k; } }
  if (L === 'o3') { st.mood = 'neutral'; st.armL = down(g, -1);
    if (speaking('o3_h', t, 0.05, 0.1)) { st.mood = 'worried'; }
    if (t > SP.o3_m.t - 0.05) { st.mood = 'happy'; st.blink = 1; st.armL = open(g, -1, 1.6, 120); st.headY = -4; }
    if (t > e('shake')) { const k = eOut(P(t, e('shake'), e('shake') + 0.25)), bob = Math.sin((t - e('shake')) * 14) * 18 * (1 - P(t, e('shake') + 0.8, e('shake') + 1.2)); st.armL = reach(g, -1, lerp(-g.sw * 1.0, SHAKEX - X.hus, k), g.ySh + lerp(500, 330, k) - 30 + bob, { planar: true }); st.mood = 'happy'; st.laugh = true; st.blink = 1; } }
  if (L === 'o4') { st.mood = 'happy';
    if (speaking('o4_h', t, 0, 0)) st.mood = t > e('broch') + 1.0 ? 'shock' : (t > e('broch') ? 'worried' : 'happy');
    if (t > endOf('o4_h')) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; }
    if (t > SP.o4_m.t - 0.05) { st.mood = 'worried'; }
    if (t > e('wallet') - 0.3) { st.armL = reach(g, -1, -g.sw * 0.55, g.ySh + 300, { planar: true }); st.items = { ...st.items, L: walletItem(t > e('wallet') ? 1 : 0) }; st.lookY = 0.35; st.look = -0.1; st.turn = -0.05; }
    if (t > e('moth')) { st.mood = 'sad'; st.blink = 0; st.lookY = t > e('moth') + 0.4 ? -0.3 : 0.35; } }
  if (L === 'end') { st.mood = 'happy';
    if (t > e('buzz')) { st.armL = reach(g, -1, -g.sw * 0.45, g.ySh + 230, { planar: true }); st.items = { ...st.items, L: phoneItem }; st.lookY = 0.4; st.look = -0.05; st.turn = -0.05; st.mood = 'surprised'; }
    if (t > e('m1')) st.mood = 'worried'; if (t > e('m3')) st.mood = 'sad';
    if (t > e('so')) { st.mood = 'happy'; st.lookY = 0; st.look = -0.7; st.turn = -0.25; st.tilt = -0.08; st.armL = reach(g, -1, -g.sw * 0.9, g.ySh + 180, { planar: true }); }
    if (t > e('case')) { st.items = { R: caseItem }; st.armR = reach(g, 1, g.sw * 1.15, g.ySh + 470, { planar: true }); st.armL = down(g, -1); st.mood = 'happy'; st.laugh = false; st.tilt = 0; st.rodDown = true; } }
  return st; }

// ---------------- world + which characters each shot draws (clean singles: only the tagged character)
const DRAW = { wide: ['her', 'husband'], cover: ['her', 'husband'], two: ['her', 'husband'], her: ['her'], hus: ['husband'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGR, BX0, BY0, BW, BH);
  const hs = husState(t, L), hst = herState(t, L);
  // cooler box on the floor (unless he hugs it)
  if (!(L === 'o1' && t > ev('o1', 'hug'))) { c.save(); c.translate(COOLX, 0); cooler(c, 1); c.restore(); }
  K.mark(c, 'cooler', COOLX, -150, 170);
  // rod on the floor after he drops it (o2), leaning on the sofa while he hugs the cooler (o1), dropped in the twist
  if ((L === 'o2' && t > ev('o2', 'drop')) || (L === 'end' && t > ev('end', 'case'))) rodFloor(c, X.hus + 120);
  if (hs.rodLean) { c.save(); c.translate(X.hus + 440, 0); c.rotate(0.22); c.strokeStyle = '#2B2F3A'; c.lineCap = 'round'; c.lineWidth = 12; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -1500); c.stroke(); c.strokeStyle = '#3A3A44'; c.lineWidth = 22; c.beginPath(); c.moveTo(0, -20); c.lineTo(0, -200); c.stroke(); c.restore(); }
  if (who.includes('husband')) heads.husband = K.put(c, HUS, hs, X.hus, 0);
  if (who.includes('her')) heads.her = K.put(c, HER, hst, X.her, 0);
  // o1: sweat while he hugs the cooler
  if (L === 'o1' && heads.husband) sweat(c, heads.husband, t, clamp((t - ev('o1', 'hug')) / 0.3));
  if (L === 'o4' && heads.husband) sweat(c, heads.husband, t, clamp((t - ev('o4', 'broch') - 1.0) / 0.3));
  // o3: hearts over the handshake
  if (L === 'o3' && t > ev('o3', 'shake') + 0.15 && (who.includes('her') && who.includes('husband'))) { const y0 = G.her.ySh + 330 - 40; for (let i = 0; i < 5; i++) { const u = ((t - ev('o3', 'shake')) * 0.8 + i / 5) % 1, a = -Math.PI / 2 + (i - 2) * 0.5; c.save(); c.globalAlpha = 1 - u; heart(c, SHAKEX + Math.cos(a) * (90 + u * 160), y0 + Math.sin(a) * (80 + u * 260), 30 + 12 * u, i % 2 ? '#EE5E9A' : '#E0474C'); c.restore(); } }
  // o4: a moth flies out of his open wallet
  if (L === 'o4' && heads.husband && t > ev('o4', 'moth')) { const u = t - ev('o4', 'moth'), wx = X.hus - G.husband.sw * 0.55, wy = G.husband.ySh + 300 - 70; moth(c, wx + Math.sin(u * 5) * 60 + u * 40, wy - u * 330, 1.3, t); }
  if (!heads.her) heads.her = OFFL; if (!heads.husband) heads.husband = OFF;
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const HY = k => G[k].headY, fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(60, fy(HY('husband'), 0.5, 1010), 0.5, 'cover'), WIDE: S(60, fy(HY('husband'), 0.52, 900), 0.52, 'wide'), TWO: S(20, fy(HY('husband'), 0.74, 860), 0.74, 'two'),
  HER: S(X.her + 40, fy(HY('her'), 1.0, 900), 1.0, 'her'), HER_CU: S(X.her + 10, fy(HY('her'), 1.4, 960), 1.4, 'her'),
  HUS: S(X.hus + 40, fy(HY('husband'), 0.95, 880), 0.95, 'hus'), HUS_CU: S(X.hus - 10, fy(HY('husband'), 1.3, 940), 1.3, 'hus'),
  CARD: U('card', 1), SPA: U('spa', 2), CHAT: U('chat', 3) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < hev('nar') - 0.02) return SH.COVER; if (t < hev('her') - 0.02) return f(SH.HUS); if (t < hev('wide') - 0.02) return f(SH.HER_CU); return f(SH.WIDE); }
  if (L === 'o1') { if (t < SP.o1_h.t - 0.1) return f(SH.WIDE); if (t < SP.o1_m.t - 0.12) return f(SH.HER); if (t < SP.o1_nar.t + 0.2) return f(SH.HUS); return f(SH.TWO); }
  if (L === 'o2') { if (t < SP.o2_h.t - 0.1) return f(SH.WIDE); if (t < e('ins') - 0.02) return f(SH.HER); if (t < SP.o2_m.t - 0.12) return f(SH.CARD); if (t < e('grab') - 0.02) return f(SH.HUS); return f(SH.TWO); }
  if (L === 'o3') { if (t < SP.o3_h.t - 0.1) return f(SH.WIDE); if (t < SP.o3_m.t - 0.12) return f(SH.HER); if (t < e('shake') - 0.02) return f(SH.HUS); return f(SH.TWO); }
  if (L === 'o4') { if (t < SP.o4_h.t - 0.1) return f(SH.WIDE); if (t < e('ins') - 0.02) return f(SH.HER); if (t < SP.o4_m.t - 0.12) return f(SH.SPA); return f(SH.HUS_CU); }
  if (L === 'end') { if (t < e('chat') - 0.02) return f(SH.HUS); if (t < e('so') - 0.02) return f(SH.CHAT); if (t < e('paris') - 0.02) return f(SH.HUS); if (t < SP.moral.t - 0.02) return f(SH.HER); return f(SH.TWO); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- inserts on a solid backdrop
function backdrop(c, t, a, b) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.08)'; for (let i = -12; i < 12; i++) c.fillRect(-1600, i * 160 + (t * 40) % 160, 3200, 60); c.restore(); }
// o2: the Paris postcard with his credit card on top
function cardView(c, t) { backdrop(c, t, '#F7B8CC', '#E37FA0'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'card' });
  const t0 = ev('o2', 'ins'), k = eBack(clamp((t - t0 + 0.05) / 0.3), 1.6), k2 = eBack(clamp((t - t0 - 0.25) / 0.3), 1.8);
  c.save(); c.translate(540, 860); c.scale(k, k); postcard(c, 2.9, -0.06); c.restore();
  if (k2 > 0) { c.save(); c.translate(640 + (1 - k2) * 400, 1360); c.scale(k2, k2); card(c, 2.4, 0.18); c.restore(); }
  for (let i = 0; i < 6; i++) { const u = clamp((t - t0 - 0.3) / 0.6), a = i * TAU / 6 + t; if (u > 0 && u < 1) star(c, 640 + Math.cos(a) * 330 * u, 1360 + Math.sin(a) * 200 * u, 22, 'rgba(255,255,255,' + (1 - u) + ')'); } }
// o4: the spa brochure, PAID BY: BRIAN stamp
function spaView(c, t) { backdrop(c, t, '#BFE7E2', '#6FB8B0'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'spa' });
  const t0 = ev('o4', 'ins'), k = eBack(clamp((t - t0 + 0.05) / 0.3), 1.6), sk = clamp((t - t0 - 0.45) / 0.18);
  c.save(); c.translate(540, 960); c.scale(k, k); brochure(c, 2.5, -0.04, sk); c.restore(); }
// twist: his phone, group chat LADS TRIP (sun + flag drawn), the lads drop out one by one
function chatView(c, t) { backdrop(c, t, '#CFE3F2', '#8FB4D2'); const t0 = ev('end', 'chat'), k = eBack(clamp((t - t0 + 0.05) / 0.3), 1.6);
  const msgs = [['me', 'Spain next week, lads!', -10], ['DAVE', "Can't come, sorry", ev('end', 'm1')], ['MIKE', "Can't come", ev('end', 'm2')], ['TOM', 'My wife said no', ev('end', 'm3')]];
  K.phone(c, 540, 930, 2.0 * k, (q, w, h) => { q.fillStyle = '#F2F5F8'; q.fillRect(0, 0, w, h); q.fillStyle = '#2E8C5A'; q.fillRect(0, 0, w, 110);
    q.fillStyle = '#FFFFFF'; q.beginPath(); q.arc(52, 60, 30, 0, TAU); q.fill(); sunIcon(q, 52, 60, 14);
    fitTxt(q, 'LADS TRIP', 96, 48, 30, '#FFFFFF', 200, 'Unb9', 'left'); flagES(q, 340, 52, 54); fitTxt(q, '4 members', 96, 84, 18, 'rgba(255,255,255,.8)', 200, 'Nun9', 'left');
    let y = 140; for (const [who, txt, ta] of msgs) { const kk = eBack(clamp((t - ta) / 0.25), 1.8); if (kk <= 0) { y += 0; continue; } const me = who === 'me', bw = 300, bh = me ? 64 : 92, x = me ? w - bw - 14 : 14;
      q.save(); q.translate(x + bw / 2, y + bh / 2); q.scale(kk, kk); q.translate(-(x + bw / 2), -(y + bh / 2));
      q.fillStyle = me ? '#C9F2C0' : '#FFFFFF'; rr(q, x, y, bw, bh, 18); q.fill(); q.strokeStyle = 'rgba(0,0,0,.08)'; q.lineWidth = 2; q.stroke();
      if (!me) fitTxt(q, who, x + 18, y + 24, 20, ['#D8383E', '#7A5BC6', '#E3A33A'][msgs.findIndex(m => m[0] === who) - 1], 200, 'Unb9', 'left');
      fitTxt(q, txt, x + 18, y + (me ? 32 : 62), 26, '#1E2030', bw - 36, 'Nun9', 'left'); q.restore(); y += bh + 18; }
  }); }

// ---------------- overlays: title, comment plate, option plates
function title(c, t) { const a = 1 - P(t, hev('title_out') - 0.25, hev('title_out')); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 300); c.rotate(-0.04); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -102);
  UI.textFit(c, 'Unb9', 120, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 6, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 64, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 112); c.restore();
  if (global.__QA) global.__QA.ui(c, 'card', { x: 50, y: 135, w: 980, h: 330, k: a, id: 'title' }); }
function commentPlate(c, t) { const a = hev('plate'), k = eBack(P(t, a, a + 0.3), 1.8) * (1 - P(t, SC.hook.e - 0.25, SC.hook.e - 0.05)); if (k <= 0) return;
  c.save(); c.translate(540, 360); c.rotate(-0.025); c.scale(k, k);
  c.fillStyle = 'rgba(0,0,0,.28)'; rr(c, -440 + 8, -130 + 12, 880, 260, 34); c.fill(); c.fillStyle = '#FFFFFF'; rr(c, -440, -130, 880, 260, 34); c.fill();
  c.fillStyle = '#EE5E9A'; c.beginPath(); c.moveTo(-330, 125); c.lineTo(-290, 173); c.lineTo(-270, 125); c.fill();
  c.fillStyle = '#EE5E9A'; rr(c, -440, -130, 880, 70, [34, 34, 0, 0]); c.fill(); c.fillStyle = '#FFFFFF'; rr(c, -400, -113, 46, 34, 10); c.fill(); c.beginPath(); c.moveTo(-392, -83); c.lineTo(-396, -67); c.lineTo(-376, -81); c.fill();
  fitTxt(c, 'Вопрос из комментариев:', -335, -95, 36, '#FFFFFF', 700, 'Nun9', 'left');
  fitTxt(c, 'муж собрался в отпуск с друзьями.', 0, -4, 50, '#1E2030', 820, 'Unb9'); fitTxt(c, 'Без меня. Что сказать?', 0, 66, 50, '#1E2030', 820, 'Unb9');
  c.restore(); if (global.__QA) global.__QA.ui(c, 'card', { x: 100, y: 230, w: 880, h: 260, k, id: 'comment' }); }
const PLATES = { o1: ['1', 'ХОЛОДНО', '#E0474C'], o2: ['2', 'С ЮМОРОМ', '#F2B33D'], o3: ['3', 'КАК НОСИТЕЛЬ', '#4CAF6A'], o4: ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', '#8E5BD8'] };
function plate(c, t, sc) { const p = PLATES[sc.id]; if (!p) return; const u = t - sc.s, out = P(t, sc.e - 0.15, sc.e);
  const k = eBack(P(u, 0, 0.25), 2.2) * (1 - eIn(out)), big = 1 - eIO(P(u, 0.3, 0.5)); if (k <= 0) return;
  c.save(); UI.font(c, 'Unb9', 54); const tw = c.measureText(p[1]).width, w = tw + 200, h = 100, s = k * Math.min(lerp(1, 1.4, big), 900 / w), y = 215;
  c.translate(540, y); c.scale(s, s); c.rotate(-0.025);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -h / 2 + 9, w, h, 50); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 50); c.fill(); c.stroke();
  c.fillStyle = p[2]; c.beginPath(); c.arc(-w / 2 + 50, 0, 50, 0, TAU); c.fill(); c.stroke(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p[0], -w / 2 + 50, 4);
  c.fillStyle = C.oliveD; c.textAlign = 'left'; c.fillText(p[1], -w / 2 + 120, 4); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w * s / 2, y: y - 50 * s, w: w * s, h: 100 * s, k, id: 'plate_' + sc.id }); }

// ---------------- end screen: «КАКОЙ ОТВЕТ ТВОЙ?», 1 / 2 / 3 / 4, СОХРАНИ, ПОДПИСАТЬСЯ clicked by the cursor (all inside x 60–940)
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, wt = (w, d) => K.wordT('outro', w) ?? (sp.t + d), CX = 500;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // heroine + husband (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34; 2nd character at local x 640)
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gb = G.husband;
    K.put(c, HUS, { t, mood: 'happy', turn: -0.2, look: -0.5, armL: reach(gb, -1, -gb.sw * 1.08, gb.ySh + 540, { planar: true }), armR: reach(gb, 1, gb.sw * 1.15, gb.ySh + 470, { planar: true }), items: { R: caseItem }, front: (cc, gg) => { cc.save(); cc.translate(gg.head.x + gb.hw * 0.05, gg.head.y - gb.hh * 1.02); shades(cc, gb.hw / 120, -0.06); cc.restore(); } }, 640, 60);
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0.15, look: 0.3, armL: reach(g, -1, -g.sw * 1.5, g.ySh + 200, { planar: true }), armR: reach(g, 1, g.sw * 1.35, g.ySh - 40 + Math.sin(t * 6) * 15, { planar: true }), items: { R: postcardItem(1.0) }, front: (cc, gg) => beret(cc, gg, g) }, 0, 0); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const q = eBack(P(u, 0.15, 0.5), 2.2);
  if (q > 0) { c.save(); c.translate(CX, 290); c.scale(q, q); UI.font(c, 'Unb9', 76); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, 'КАКОЙ ОТВЕТ', 0, -48, C.oliveD, C.white, 14); UI.strokeText(c, 'ТВОЙ?', 0, 48, C.pink, C.white, 14); c.restore(); }
  const rows = [['1', 'ХОЛОДНО', 'Fine. Go.', '#E0474C', 'один'], ['2', 'С ЮМОРОМ', "Then I'm going to Paris.", '#F2B33D', 'два'], ['3', 'КАК НОСИТЕЛЬ', 'Sure, as long as...', '#4CAF6A', 'три'], ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', "I'll be at the spa. You're paying.", '#8E5BD8', 'четыре']];
  rows.forEach(([n, ru, en, col, w], i) => { const a = wt(w, 1.3 + i * 0.35) - 0.1, k = eBack(P(t, a, a + 0.28), 2.0); if (k <= 0) return; const y = 520 + i * 160;
    c.save(); c.translate(CX, y); c.scale(k, k); c.fillStyle = 'rgba(0,0,0,.16)'; rr(c, -420 + 8, -66 + 12, 840, 132, 36); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -420, -66, 840, 132, 36); c.fill(); c.stroke();
    c.fillStyle = col; c.beginPath(); c.arc(-340, 0, 50, 0, TAU); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 5; c.stroke(); fitTxt(c, n, -340, 4, 70, C.white, 70);
    fitTxt(c, ru, -265, -24, 40, C.oliveD, 650, 'Unb9', 'left'); fitTxt(c, en, -265, 28, 34, C.pinkD, 650, 'Nun9', 'left'); c.restore(); });
  const bt = wt('пиши', 3.55) - 0.2, bk = eBack(P(t, bt, bt + 0.35), 2.2), by = 1185;
  if (bk > 0) { c.save(); c.translate(CX, by); c.scale(bk, bk); c.fillStyle = C.gold; rr(c, -420, -55, 400, 110, 55); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke();
    c.fillStyle = C.oliveD; c.beginPath(); c.moveTo(-370, -30); c.lineTo(-330, -30); c.lineTo(-330, 32); c.lineTo(-350, 16); c.lineTo(-370, 32); c.closePath(); c.fill(); fitTxt(c, 'СОХРАНИ', -200, 4, 40, C.oliveD, 250);
    const subT = bt + 0.6, click = P(t, subT + 0.55, subT + 0.7), pressed = t > subT + 0.65, ss = 1 - 0.08 * Math.sin(click * Math.PI);
    c.save(); c.translate(220, 0); c.scale(ss, ss); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -200, -55, 400, 110, 55); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke(); fitTxt(c, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4, 40, C.white, 340); c.restore(); c.restore();
    const mv = eIO(P(t, subT, subT + 0.55)); UI.tapCursor(c, lerp(930, CX + 260, mv), lerp(by + 330, by + 10, mv), 1, P(t, subT + 0.6, subT + 1.1)); }
  Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag.startsWith('ui:')) { if (tag === 'ui:card') cardView(c, t); else if (tag === 'ui:spa') spaView(c, t); else chatView(c, t); heads = { her: OFFL, husband: OFF }; proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.24); }
  const names = { husband: ['BRIAN', '#3F86D0'] };
  if (!tag.startsWith('ui:')) K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names, hold: { hook_m: -0.2, o1_h: -0.22, o1_m: 0.3, o2_h: -0.22, o2_m: -0.2, o3_h: -0.22, o3_m: 0.05, o4_h: -0.22, o4_m: 0.3, end_m: -0.2 } });
  if (L === 'hook') { title(c, t); commentPlate(c, t); }
  plate(c, t, sc);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  // the end screen wipes in from the twist
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('lads', NF, renderFrame);
