// "Встречаемся неделю, а он уже с чемоданом" — rubric «Ответ на вопрос из комментариев» (live scene + 4 answers), hard_cut camera: node movein.js start end out.mp4 | --png=f1,f2
// Her flat, front door open: the heroine (home sweater, mug) inside; her boyfriend of one week in the doorway with a huge suitcase and a toothbrush. Her cat sits on the sofa.
// hook: "Surprise! Let's move in together!" — she freezes; comment plate. 1 · ХОЛОДНО: "No." -> he plants his toothbrush in a cup on her shelf anyway.
// 2 · С ЮМОРОМ: "...without a hat." -> he takes off the beanie: bald -> she drops her mug. 3 · КАК НОСИТЕЛЬ: "I can do slow." -> he backs out in slow motion + Bella tip.
// 4 · КОРОЛЕВСКИЙ ОТВЕТ: "my cat has to approve" -> the cat arches and hisses -> "...She hates me."
// Twist: he lifts the suitcase, it bursts open: food containers labelled MUM -> "Mum packed for a month." -> the cat eats from one -> moral. End screen 1/2/3/4.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/movein/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];

// ---------------- cast
const HER = { ...BASE.her_lift, top: { type: 'sweater', col: '#9C7BD0' }, bottom: { type: 'leggings', col: '#4A4060' }, shoes: { col: '#F2B8C8', acc: '#FFFFFF' } };
const BF = { ...BASE.tom, hair: { style: 'baldsides', col: '#6A4126' }, top: { type: 'hoodie', col: '#3F8F7A' }, bottom: { type: 'jeans', col: '#3B4A6C' }, shoes: { col: '#FFFFFF', acc: '#E0474C' } };
const G = { her: geom(HER), bf: geom(BF) };
const X = { her: -300, bf: 520 }, CASEX = 820, DOOR0 = 300, DOOR1 = 1000, SHX = 120, SHY = -1060, SOFAX = -1350, CATX = -1250, CATY = -430;
const OUTX = 1500;     // o3: where he ends up after backing out (behind the door jamb)
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function star(c, x, y, r, a = 1, col = '#FFF6C8') { c.save(); c.globalAlpha *= a; c.translate(x, y); c.fillStyle = col; c.beginPath(); for (let i = 0; i < 8; i++) { const rr_ = i % 2 ? r * 0.28 : r, an = i * Math.PI / 4; c.lineTo(Math.cos(an) * rr_, Math.sin(an) * rr_); } c.closePath(); c.fill(); c.restore(); }

// ---------------- props (all drawn with paths; English only on the props)
// big suitcase standing on its wheels; (0,0) = floor centre. open = 0..1 (front lid swings open to the right), handle = extended handle 0..1
function suitcase(c, open = 0, handle = 1, tilt = 0) { c.save(); c.rotate(tilt);
  const w = 330, h = 520, y0 = -h - 30;
  c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(0, 4, w * 0.62, 22, 0, 0, TAU); c.fill();
  if (handle > 0) { const hy = y0 - 260 * handle; c.fillStyle = '#4A4F5C'; c.fillRect(-90, hy, 16, y0 - hy + 10); c.fillRect(74, hy, 16, y0 - hy + 10); paint(c, q => { q.m(-104, hy - 34); q.l(104, hy - 34); q.l(104, hy + 6); q.l(-104, hy + 6); q.z(); }, '#2B2F3A', { sd: 3, hd: 2, lw: 3 }); }
  for (const s of [-1, 1]) { c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(s * (w / 2 - 40), -18, 22, 0, TAU); c.fill(); c.fillStyle = '#8A8F9C'; c.beginPath(); c.arc(s * (w / 2 - 40), -18, 8, 0, TAU); c.fill(); }
  // shell (back half)
  paint(c, q => { q.m(-w / 2, y0 + 30); q.q(-w / 2, y0, -w / 2 + 30, y0); q.l(w / 2 - 30, y0); q.q(w / 2, y0, w / 2, y0 + 30); q.l(w / 2, -60); q.q(w / 2, -30, w / 2 - 30, -30); q.l(-w / 2 + 30, -30); q.q(-w / 2, -30, -w / 2, -60); q.z(); }, '#E0474C', { sd: 10, hd: 5, lw: 4 });
  if (open > 0) { // inside: stacked food containers
    c.fillStyle = '#7A2430'; rr(c, -w / 2 + 16, y0 + 16, w - 32, h - 32, 18); c.fill();
    for (let r = 0; r < 4; r++) for (let k = 0; k < 2; k++) { c.save(); c.translate(-72 + k * 144, y0 + 80 + r * 118); box(c, 0.52, (r * 2 + k) % 4); c.restore(); } }
  if (open < 1) { // front lid: hinge on the right edge, swings towards the camera
    const sx = Math.cos(open * Math.PI * 0.85); c.save(); c.translate(w / 2, 0); c.scale(sx, 1); c.translate(-w / 2, 0);
    paint(c, q => { q.m(-w / 2, y0 + 30); q.q(-w / 2, y0, -w / 2 + 30, y0); q.l(w / 2 - 30, y0); q.q(w / 2, y0, w / 2, y0 + 30); q.l(w / 2, -60); q.q(w / 2, -30, w / 2 - 30, -30); q.l(-w / 2 + 30, -30); q.q(-w / 2, -30, -w / 2, -60); q.z(); }, sx > 0 ? '#EE5E5E' : '#B8343E', { sd: 10, hd: 5, lw: 4 });
    if (sx > 0) { c.strokeStyle = 'rgba(0,0,0,.15)'; c.lineWidth = 8; for (const x of [-80, 0, 80]) { c.beginPath(); c.moveTo(x, y0 + 30); c.lineTo(x, -60); c.stroke(); }
      c.fillStyle = '#F2C14E'; rr(c, -60, y0 + h * 0.42, 120, 70, 12); c.fill(); fitTxt(c, 'HIS', 0, y0 + h * 0.42 + 37, 40, '#7A2430', 100); }
    c.restore(); }
  c.restore(); }
// food container with a "MUM" label; (0,0) = centre; kind 0..3 = what's inside
const FOOD = [['#E8A13A', '#C9733A'], ['#8BC34A', '#5E9A2A'], ['#F2D27A', '#D9A040'], ['#D9534F', '#A83A36']];
function box(c, s = 1, kind = 0, lbl = 'MUM') { c.save(); c.scale(s, s); const [f1, f2] = FOOD[kind % 4];
  paint(c, q => { q.m(-120, -40); q.l(120, -40); q.l(108, 60); q.l(-108, 60); q.z(); }, '#EEF4F8', { sd: 4, hd: 2, lw: 4 });
  c.fillStyle = f1; rr(c, -104, -18, 208, 70, 10); c.fill(); c.fillStyle = f2; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(-80 + i * 40, 10 + (i % 2) * 14, 13, 0, TAU); c.fill(); }
  paint(c, q => { q.m(-130, -62); q.l(130, -62); q.l(130, -36); q.l(-130, -36); q.z(); }, ['#3FA9F5', '#EE5E9A', '#5EC27A', '#F2B33D'][kind % 4], { sd: 3, hd: 2, lw: 4 });
  c.fillStyle = '#FFFDF4'; c.save(); c.rotate(-0.06); rr(c, -62, -8, 124, 46, 6); c.fill(); fitTxt(c, lbl, 0, 16, 34, '#2B2F3A', 110); c.restore();
  c.restore(); }
// toothbrush; (0,0) = grip centre, pointing up
function brush(c, s = 1) { c.save(); c.scale(s, s); paint(c, q => { q.m(-9, 70); q.l(9, 70); q.l(7, -60); q.l(-7, -60); q.z(); }, '#3FA9F5', { sd: 3, hd: 2, lw: 3 });
  c.fillStyle = '#FFFFFF'; rr(c, -12, -100, 24, 42, 5); c.fill(); c.fillStyle = '#7FD0F5'; for (let i = 0; i < 4; i++) c.fillRect(-10, -96 + i * 10, 20, 5); c.restore(); }
const brushItem = (up = 1) => ctx => { ctx.save(); ctx.translate(0, -30); ctx.rotate(-0.15 * up); brush(ctx, 1.25); ctx.restore(); };
function mug(c, s = 1) { c.save(); c.scale(s, s); c.strokeStyle = '#E8D9C8'; c.lineWidth = 12; c.beginPath(); c.arc(46, 6, 24, -1.3, 1.3); c.stroke();
  paint(c, q => { q.m(-44, -50); q.l(44, -50); q.l(40, 50); q.l(-40, 50); q.z(); }, '#FFF6EA', { sd: 4, hd: 2, lw: 3 }); c.fillStyle = '#EE5E9A'; c.beginPath(); c.arc(0, 2, 15, 0, TAU); c.fill(); c.restore(); }
const mugItem = ctx => { ctx.save(); ctx.translate(0, -24); mug(ctx, 1.1); ctx.restore(); };
const boxItem = ctx => { ctx.save(); ctx.translate(0, -50); box(ctx, 0.75, 1); ctx.restore(); };
// woolly beanie on his head (in the human's local coords), or in the hand (beanieDraw at the origin)
function beanieDraw(c, hw, hh) { const col = '#E3A33A';
  paint(c, q => { q.m(-hw * 1.08, -hh * 0.38); q.b(-hw * 1.12, -hh * 1.45, hw * 1.12, -hh * 1.45, hw * 1.08, -hh * 0.38); q.z(); }, col, { sd: 10, hd: 5, lw: 4, inner: k => { k.strokeStyle = 'rgba(0,0,0,.12)'; k.lineWidth = 6; for (let i = -3; i <= 3; i++) { k.beginPath(); k.moveTo(i * hw * 0.25, -hh * 0.4); k.quadraticCurveTo(i * hw * 0.2, -hh * 0.9, i * hw * 0.1, -hh * 1.2); k.stroke(); } } });
  paint(c, q => { q.m(-hw * 1.14, -hh * 0.62); q.q(0, -hh * 0.74, hw * 1.14, -hh * 0.62); q.l(hw * 1.14, -hh * 0.3); q.q(0, -hh * 0.42, -hw * 1.14, -hh * 0.3); q.z(); }, '#C9822A', { sd: 6, hd: 3, lw: 4 });
  paint(c, q => q.a(0, -hh * 1.32, hw * 0.3), '#F7E6B0', { sd: 5, hd: 3, lw: 4 }); }
// her cat (simple sitting cat, front view); (0,0) = where it sits; mode: 'calm' | 'look' | 'hiss' | 'smug' | 'eat'
function cat(c, t, mode = 'calm', s = 1) { c.save(); c.scale(s, s); const fur = '#7E8594', furD = '#596070', furL = '#E8E6EE', hiss = mode === 'hiss';
  const puff = hiss ? 1.12 : 1, br = Math.sin(t * 2.4) * 3;
  c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(0, 4, 170, 22, 0, 0, TAU); c.fill();
  // tail
  c.save(); c.translate(110, -40); c.strokeStyle = furD; c.lineCap = 'round'; c.lineWidth = hiss ? 52 : 38; c.beginPath();
  if (hiss) { c.moveTo(0, 0); c.quadraticCurveTo(80, -60, 60, -230); c.stroke(); c.strokeStyle = fur; c.lineWidth = 36; c.stroke(); for (let i = 0; i < 9; i++) { const u = i / 8, x = lerp(20, 60, u) + 30 * Math.sin(u * 3), y = lerp(-20, -220, u); c.strokeStyle = furD; c.lineWidth = 6; c.beginPath(); c.moveTo(x - 30, y); c.lineTo(x - 50, y - 8); c.moveTo(x + 30, y); c.lineTo(x + 50, y - 8); c.stroke(); } }
  else { const w_ = Math.sin(t * 2) * 20; c.moveTo(0, 0); c.quadraticCurveTo(120, 10, 110 + w_, -120); c.stroke(); c.strokeStyle = fur; c.lineWidth = 24; c.stroke(); }
  c.restore();
  // body
  c.save(); c.scale(puff, puff);
  paint(c, q => { q.m(-120, -10); q.b(-150, -150, -110, -270, 0, -280 + br); q.b(110, -270, 150, -150, 120, -10); q.q(0, 6, -120, -10); q.z(); }, fur, { sd: 14, hd: 7, lw: 4, inner: k => { k.fillStyle = furL; k.beginPath(); k.ellipse(0, -110, 60, 110, 0, 0, TAU); k.fill(); k.strokeStyle = furD; k.lineWidth = 10; k.lineCap = 'round'; for (const sg of [-1, 1]) for (let i = 0; i < 3; i++) { k.beginPath(); k.moveTo(sg * 128, -200 + i * 55); k.lineTo(sg * 92, -192 + i * 55); k.stroke(); } } });
  if (hiss) { c.strokeStyle = furD; c.lineWidth = 5; for (let i = 0; i < 14; i++) { const a = Math.PI * (1.05 + i / 13 * 0.9), x = Math.cos(a) * 140, y = -140 + Math.sin(a) * 150; c.beginPath(); c.moveTo(x, y); c.lineTo(x * 1.18, y * 1.08 - 6); c.stroke(); } }
  for (const sg of [-1, 1]) paint(c, q => q.e(sg * 55, -18, 48, 26), furL, { sd: 4, hd: 2, lw: 3 });
  c.restore();
  // head
  const eat = mode === 'eat'; c.save(); c.translate(eat ? 30 : 0, (eat ? -150 : -330) + br + (hiss ? -20 : 0)); c.rotate(eat ? 0.5 : (hiss ? -0.05 : Math.sin(t * 1.3) * 0.04));
  for (const sg of [-1, 1]) { c.save(); c.translate(sg * 78, -78); c.rotate(sg * (hiss ? 1.0 : 0.25)); paint(c, q => { q.m(-40, 30); q.l(0, -70); q.l(40, 30); q.z(); }, fur, { sd: 6, hd: 3, lw: 4, inner: k => { k.fillStyle = '#F4B8C0'; k.beginPath(); k.moveTo(-20, 22); k.lineTo(0, -38); k.lineTo(20, 22); k.fill(); } }); c.restore(); }
  paint(c, q => q.e(0, 0, 125, 105), fur, { sd: 14, hd: 7, lw: 4, inner: k => { k.fillStyle = furL; k.beginPath(); k.ellipse(0, 50, 70, 45, 0, 0, TAU); k.fill(); k.strokeStyle = furD; k.lineWidth = 10; k.lineCap = 'round'; for (const dx of [-30, 0, 30]) { k.beginPath(); k.moveTo(dx, -100); k.lineTo(dx * 0.8, -62); k.stroke(); } } });
  // eyes
  const look = mode === 'look' || hiss ? 10 : 0;
  for (const sg of [-1, 1]) { const ex = sg * 50, ey = -8;
    if (mode === 'smug' || mode === 'eat' || (mode === 'calm' && (t % 3.2) < 0.15)) { c.strokeStyle = '#1E2030'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(ex - 24, ey); c.quadraticCurveTo(ex, ey + (mode === 'smug' ? -12 : 10), ex + 24, ey); c.stroke(); continue; }
    c.fillStyle = '#C8E05A'; c.beginPath(); c.ellipse(ex, ey, 26, hiss ? 22 : 28, 0, 0, TAU); c.fill(); c.strokeStyle = '#1E2030'; c.lineWidth = 4; c.stroke();
    c.fillStyle = '#1E2030'; c.beginPath(); c.ellipse(ex + look, ey, hiss ? 5 : 9, 22, 0, 0, TAU); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(ex - 9, ey - 10, 6, 0, TAU); c.fill();
    if (hiss) { c.strokeStyle = '#1E2030'; c.lineWidth = 8; c.beginPath(); c.moveTo(ex + sg * 30, ey - 48); c.lineTo(ex - sg * 24, ey - 28); c.stroke(); } }
  c.fillStyle = '#E87A92'; c.beginPath(); c.moveTo(-14, 30); c.lineTo(14, 30); c.lineTo(0, 44); c.closePath(); c.fill();
  if (hiss) { c.fillStyle = '#5A1A26'; c.beginPath(); c.ellipse(0, 70, 40, 26, 0, 0, TAU); c.fill(); c.fillStyle = '#FFFFFF'; for (const sg of [-1, 1]) { c.beginPath(); c.moveTo(sg * 24, 50); c.lineTo(sg * 16, 72); c.lineTo(sg * 8, 50); c.fill(); } }
  else { c.strokeStyle = '#1E2030'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, 44); c.quadraticCurveTo(-14, 60, -28, 50); c.moveTo(0, 44); c.quadraticCurveTo(14, 60, 28, 50); c.stroke(); }
  c.strokeStyle = 'rgba(40,40,50,.7)'; c.lineWidth = 3; for (const sg of [-1, 1]) for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(sg * 50, 46 + i * 10); c.lineTo(sg * 150, 30 + i * 22); c.stroke(); }
  c.restore(); c.restore(); }
const catMode = (t, L) => { if (L === 'o4') { if (t > ev('o4', 'smug')) return 'smug'; if (t > ev('o4', 'hiss')) return 'hiss'; if (t > SP.o4_h.t + 2.2) return 'look'; } if (L === 'hook' && t > hev('freeze')) return 'look'; return 'calm'; };

// ---------------- her flat (prerendered, softly blurred): living room on the left, hallway shelf, open front door on the right
const BX0 = -3300, BY0 = -3700, BW = 6600, BH = 5300, BS = 0.5;
function drawRoom(c) {
  c.fillStyle = '#F3E3CF'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = 'rgba(200,150,110,.10)'; for (let x = BX0; x < BX0 + BW; x += 160) c.fillRect(x, BY0, 60, 3700);
  // landing outside the door (cool, darker): wall, stair rail, lamp
  c.fillStyle = '#9FB0C2'; c.fillRect(DOOR0, -2150, DOOR1 - DOOR0, 2150); c.fillStyle = '#8A9CB0'; c.fillRect(DOOR0, -700, DOOR1 - DOOR0, 700);
  c.strokeStyle = '#5A6A7C'; c.lineWidth = 16; c.beginPath(); c.moveTo(DOOR0, -900); c.lineTo(DOOR1, -1150); c.stroke(); c.lineWidth = 8; for (let x = DOOR0 + 60; x < DOOR1; x += 90) { c.beginPath(); c.moveTo(x, -900 - (x - DOOR0) * 0.357); c.lineTo(x, -420 - (x - DOOR0) * 0.2); c.stroke(); }
  c.fillStyle = '#FFF2C0'; c.beginPath(); c.arc(650, -1900, 60, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,240,190,.25)'; c.beginPath(); c.arc(650, -1900, 160, 0, TAU); c.fill();
  // door frame + the open door leaf against the wall on the right
  c.fillStyle = '#FFFDF6'; c.fillRect(DOOR0 - 60, -2230, 60, 2230); c.fillRect(DOOR1, -2230, 60, 2230); c.fillRect(DOOR0 - 60, -2230, DOOR1 - DOOR0 + 120, 80);
  c.fillStyle = '#6C8EBF'; c.beginPath(); c.moveTo(DOOR1 + 60, -2150); c.lineTo(DOOR1 + 330, -2260); c.lineTo(DOOR1 + 330, 110); c.lineTo(DOOR1 + 60, 0); c.closePath(); c.fill();
  c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(DOOR1 + 290, -1000, 22, 0, TAU); c.fill();
  // doormat (English)
  c.fillStyle = '#B88A5A'; c.beginPath(); c.moveTo(DOOR0 - 40, 40); c.lineTo(DOOR1 + 40, 40); c.lineTo(DOOR1 + 90, 190); c.lineTo(DOOR0 - 90, 190); c.closePath(); c.fill();
  c.fillStyle = '#6A4A2A'; c.font = '70px Unb9'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('HOME', (DOOR0 + DOOR1) / 2, 118);
  // hallway: coat hooks with a scarf, framed picture, light switch
  c.fillStyle = '#8A6A4A'; c.fillRect(-520, -1640, 420, 26); for (const x of [-480, -360, -240, -140]) { c.fillStyle = '#5A4030'; c.beginPath(); c.arc(x, -1600, 14, 0, TAU); c.fill(); }
  c.fillStyle = '#EE5E9A'; c.fillRect(-370, -1600, 36, 520); c.fillStyle = '#F7A8C8'; c.fillRect(-370, -1160, 36, 60);
  c.fillStyle = '#FFFFFF'; c.fillRect(-120 + 0, -1700, 0, 0);
  c.fillStyle = '#C98B6A'; rr(c, -1000, -2300, 420, 320, 12); c.fill(); c.fillStyle = '#9FD0E8'; rr(c, -975, -2275, 370, 270, 8); c.fill(); c.fillStyle = '#6AA05A'; c.beginPath(); c.moveTo(-975, -2010); c.lineTo(-850, -2150); c.lineTo(-760, -2060); c.lineTo(-690, -2120); c.lineTo(-605, -2010); c.closePath(); c.fill();
  c.fillStyle = '#FFFFFF'; rr(c, 200, -1300, 50, 80, 8); c.fill();
  // living room: window with curtains, floor lamp, plant
  const g = c.createLinearGradient(0, -2600, 0, -1500); g.addColorStop(0, '#8EC9F0'); g.addColorStop(1, '#D8EEF8');
  c.fillStyle = '#FFFDF6'; rr(c, -2650, -2650, 860, 1180, 18); c.fill(); c.fillStyle = g; rr(c, -2620, -2620, 800, 1120, 10); c.fill(); c.fillStyle = '#FFFDF6'; c.fillRect(-2232, -2620, 18, 1120); c.fillRect(-2620, -2070, 800, 18);
  c.fillStyle = '#E8889E'; rr(c, -2780, -2720, 170, 1320, 30); c.fill(); rr(c, -1830, -2720, 170, 1320, 30); c.fill();
  c.fillStyle = '#3A3A44'; c.fillRect(-1620, -1500, 14, 1500); paint(c, q => { q.m(-1740, -1500); q.l(-1490, -1500); q.l(-1550, -1720); q.l(-1680, -1720); q.z(); }, '#F7E6B0', { sd: 4, hd: 2, lw: 4 });
  c.fillStyle = '#6A9E5A'; for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(-2900 + i * 30, -700 - i * 60, 60, 170, -0.6 + i * 0.22, 0, TAU); c.fill(); } c.fillStyle = '#C9733A'; rr(c, -2980, -320, 240, 320, 20); c.fill();
  // skirting + floor + rug
  c.fillStyle = '#E2CDB2'; c.fillRect(BX0, -90, DOOR0 - 60 - BX0, 90); c.fillRect(DOOR1 + 330, -90, BX0 + BW - DOOR1 - 330, 90);
  c.fillStyle = '#B07C52'; c.fillRect(BX0, 0, BW, 1600); c.fillStyle = 'rgba(0,0,0,.07)'; for (let x = BX0; x < BX0 + BW; x += 220) c.fillRect(x, 0, 8, 1600);
  c.fillStyle = '#D9C2E8'; c.beginPath(); c.ellipse(-1300, 140, 1000, 110, 0, 0, TAU); c.fill();
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawRoom);
// the wall right of the door frame is drawn again in FRONT of him when he backs out (o3), so he disappears behind the jamb
function jambFront(c) { c.fillStyle = '#FFFDF6'; c.fillRect(DOOR1, -2230, 60, 2230); c.fillStyle = '#6C8EBF'; c.beginPath(); c.moveTo(DOOR1 + 60, -2150); c.lineTo(DOOR1 + 330, -2260); c.lineTo(DOOR1 + 330, 110); c.lineTo(DOOR1 + 60, 0); c.closePath(); c.fill();
  c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(DOOR1 + 290, -1000, 22, 0, TAU); c.fill(); c.fillStyle = '#F3E3CF'; c.fillRect(DOOR1 + 330, -2700, 2200, 2700); c.fillStyle = '#E2CDB2'; c.fillRect(DOOR1 + 330, -90, 2200, 90); }
// sofa (behind the cat) + the hallway shelf with the toothbrush cup
function sofa(c) { const x0 = SOFAX - 620, x1 = SOFAX + 620;
  paint(c, q => { q.m(x0 + 40, -900); q.q(SOFAX, -940, x1 - 40, -900); q.l(x1 - 40, -420); q.l(x0 + 40, -420); q.z(); }, '#D9767E', { sd: 12, hd: 6, lw: 3 });
  paint(c, q => { q.m(x0, -470); q.l(x1, -470); q.l(x1, -110); q.l(x0, -110); q.z(); }, '#E8868E', { sd: 10, hd: 5, lw: 3 });
  for (const s of [-1, 1]) paint(c, q => { const x = s < 0 ? x0 - 70 : x1 - 50; q.m(x, -660); q.q(x + 60, -720, x + 120, -660); q.l(x + 120, -110); q.l(x, -110); q.z(); }, '#C9606A', { sd: 10, hd: 5, lw: 3 });
  c.fillStyle = '#4A3A2A'; c.fillRect(x0 - 40, -110, 30, 110); c.fillRect(x1 + 10, -110, 30, 110);
  c.fillStyle = '#F7E6B0'; c.save(); c.translate(SOFAX + 330, -560); c.rotate(0.12); rr(c, -110, -90, 220, 180, 30); c.fill(); c.restore(); }
function shelf(c, t, L, withBrush) { c.fillStyle = '#8A6A4A'; rr(c, SHX - 170, SHY, 340, 26, 6); c.fill(); c.fillStyle = '#6A4A34'; c.fillRect(SHX - 140, SHY + 26, 16, 50); c.fillRect(SHX + 124, SHY + 26, 16, 50);
  // a single pink toothbrush (hers) in the cup; his blue one lands next to it in o1
  if (withBrush) { c.save(); c.translate(SHX + 14, SHY - 120); c.rotate(0.18); brush(c, 1.0); c.restore(); }
  c.save(); c.translate(SHX - 16, SHY - 150); c.rotate(-0.12); c.save(); c.scale(1, 1); paint(c, q => { q.m(-9, 70); q.l(9, 70); q.l(7, -60); q.l(-7, -60); q.z(); }, '#EE5E9A', { sd: 3, hd: 2, lw: 3 }); c.fillStyle = '#FFFFFF'; rr(c, -12, -100, 24, 42, 5); c.fill(); c.restore(); c.restore();
  paint(c, q => { q.m(SHX - 55, SHY - 120); q.l(SHX + 55, SHY - 120); q.l(SHX + 45, SHY); q.l(SHX - 45, SHY); q.z(); }, '#5BB6E8', { sd: 4, hd: 2, lw: 4 });
  c.fillStyle = '#F7F2E8'; rr(c, SHX + 70, SHY - 60, 70, 60, 8); c.fill(); }

// ---------------- characters (standing)
const down = (g, s) => reach(g, s, s * g.sw * 1.08, g.ySh + 540, { planar: true });
const open = (g, s, k = 1.7, dy = 90) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const hold = (g, s, dy = 330, k = 0.75) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const forehead = (g, s = 1) => reach(g, s, s * g.hw * 0.15, g.headY - g.hh * 0.42, { planar: true });
const base = (g, t, who) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, armL: down(g, -1), armR: down(g, 1), items: {} });
const gest = (st, g, who, t, side, b) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + b + Math.cos(u) * 20, { planar: true }); } };
// mug falls out of her hand in o2: world position of the falling mug
const mugFall = t => { const a = ev('o2', 'drop'), b = ev('o2', 'crash'); if (t < a) return null; const k = clamp((t - a) / (b - a)); return { k, x: X.her + G.her.sw * 0.95 + 40 * k, y: lerp(G.her.ySh + 300, -40, k * k), r: k * 2.4 }; };
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { ...base(g, t, 'her'), mood: 'happy', turn: 0.25, look: 0.7 };
  const mugR = (dy = 300) => { st.armR = hold(g, 1, dy, 0.95); st.items = { R: mugItem }; };
  mugR();
  if (L === 'hook') { st.mood = 'happy'; if (t > SP.hook_b.t + 0.3) { st.mood = 'surprised'; st.blink = 0; } if (t > hev('freeze') - 0.05) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; mugR(210); }
    if (t > hev('case')) { st.mood = 'worried'; st.look = 0.9; st.turn = 0.35; } }
  if (L === 'o1') { st.mood = 'bored'; st.turn = 0.2; st.look = 0.5; if (speaking('o1_h', t, 0.1, 0.1)) { st.mood = 'annoyed'; st.turn = 0.25; }
    if (t > e('plant')) { st.mood = 'skeptical'; st.look = 0.9; st.turn = 0.35; } if (t > SP.o1_nar.t + 0.7) { st.mood = 'tired'; st.look = 0.9; st.blink = 1; } }
  if (L === 'o2') { st.mood = 'smug'; st.turn = 0.25; st.look = 0.7; if (speaking('o2_h', t, 0.1, 0.1)) { st.mood = 'happy'; gest(st, g, 'her', t, -1, 120); }
    if (t > e('off')) { st.mood = 'surprised'; st.blink = 0; }
    if (t > e('stare')) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; st.armR = open(g, 1, 1.5, 230); st.items = {}; }
    if (t > e('drop')) { st.items = {}; }
    if (t > SP.o2_nar.t + 0.4) { st.mood = 'shock'; st.armL = open(g, -1, 1.3, 260); st.headY = 6; } }
  if (L === 'o3') { st.mood = 'happy'; st.turn = 0.25; st.look = 0.7; st.tilt = 0.05;
    if (speaking('o3_h', t, 0.1, 0.1)) { st.armL = open(g, -1, 1.6, 140 + Math.sin(t * 5) * 12); }
    if (t > SP.o3_b.t) { st.mood = 'surprised'; st.tilt = 0; } if (t > e('slow') + 0.5) { st.mood = 'skeptical'; st.look = 1; st.turn = 0.4; }
    if (t > SP.o3_nar.t + 0.9) { st.mood = 'happy'; st.blink = 1; st.turn = 0.05; st.look = 0.1; st.tilt = 0.06; } }
  if (L === 'o4') { st.mood = 'happy'; st.turn = 0.2; st.look = 0.5;
    if (speaking('o4_h', t, 0.1, 0.1)) { const u = t - SP.o4_h.t; st.mood = u > 2.0 ? 'smug' : 'happy'; if (u > 2.0 && u < 4.4) { st.armL = reach(g, -1, -g.sw * 2.3, g.ySh + 120 + Math.sin(u * 3) * 10, { planar: true }); st.turn = -0.15; st.look = -0.6; } else gest(st, g, 'her', t, -1, 120); }
    if (t > endOf('o4_h') + 0.1) { st.mood = 'smug'; st.blink = 1; } }
  if (L === 'end') { st.mood = 'neutral'; st.look = 0.8; st.turn = 0.3;
    if (t > e('burst')) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; }
    if (t > e('face')) { st.mood = 'tired'; st.blink = 1; st.headFirst = true; st.armL = forehead(g, -1); st.headY = 6; st.look = 0; st.turn = 0.1; }
    if (t > e('eat')) { st.headFirst = false; st.armL = down(g, -1); st.mood = 'happy'; st.laugh = true; st.blink = 1; st.headY = 0; st.look = -0.3; st.turn = 0; } }
  return st; }
// does he still wear the beanie?
const hatOn = (t, L) => !(L === 'o2' && t > ev('o2', 'off'));
function bfX(t, L) { if (L === 'o3') { const a = ev('o3', 'slow'); return lerp(X.bf, OUTX, clamp((t - a) / 2.6)); } return X.bf; }
const caseX = (t, L) => L === 'o3' ? CASEX + (bfX(t, L) - X.bf) : CASEX;
function bfState(t, L) { const g = G.bf, e = k => ev(L, k), st = { ...base(g, t, 'bf4'), mood: 'happy', turn: -0.25, look: -0.7 };
  const brushUp = () => { st.armL = reach(g, -1, -g.sw * 1.6, g.ySh + 60 + Math.sin(t * 5) * 8, { planar: true }); st.items = { L: brushItem() }; };
  const onCase = () => { st.armR = reach(g, 1, CASEX - X.bf - 60, -880, { planar: true }); };
  onCase(); st.items = { L: brushItem() }; st.armL = hold(g, -1, 330, 0.8);
  if (L === 'hook') { brushUp(); st.mood = 'happy'; st.laugh = !speaking('hook_b', t, 0, 0) || t < SP.hook_b.t; if (speaking('hook_b', t, 0, 0.1)) st.laugh = false;
    if (t > hev('freeze')) { st.laugh = true; st.blink = 1; }
    if (t > hev('case')) { const u = t - hev('case'), pat = Math.abs(Math.sin(u * Math.PI / 0.25)); st.armR = reach(g, 1, CASEX - X.bf - 40, -880 - 60 * pat * (u < 0.6 ? 1 : 0), { planar: true }); st.laugh = true; st.blink = 1; } }
  if (L === 'o1') { brushUp(); st.mood = 'happy'; st.look = -0.7;
    if (t > e('sink')) { st.mood = 'sad'; st.armL = hold(g, -1, 300, 0.7); st.headY = 10; }
    if (speaking('o1_b', t, 0.05, 0)) { st.mood = 'worried'; st.headY = 0; brushUp(); }
    if (t > e('plant')) { const k = eIO(clamp((t - e('plant')) / 0.55)); st.armL = reach(g, -1, lerp(-g.sw * 1.6, SHX + 20 - X.bf, k), lerp(g.ySh + 60, SHY - 80 + 30, k), { planar: true }); st.lean = -0.25 * k; st.turn = -0.4; st.look = -1; st.mood = 'happy';
      if (t > e('cup')) { st.items = {}; const k2 = eIO(clamp((t - e('cup')) / 0.35)); st.armL = reach(g, -1, lerp(SHX + 20 - X.bf, -g.sw * 1.1, k2), lerp(SHY - 50, g.ySh + 330, k2), { planar: true }); st.lean = -0.25 * (1 - k2); } }
    if (t > e('grin')) { st.mood = 'happy'; st.laugh = !speaking('o1_nar', t, 0, 0) || true; st.blink = 1; st.turn = -0.2; st.look = -0.5; } }
  if (L === 'o2') { st.mood = 'happy';
    if (speaking('o2_h', t, 0, 0.1)) { st.mood = t > SP.o2_h.t + 1.2 ? 'worried' : 'happy'; }
    if (t > e('grab')) { st.mood = 'worried'; st.headFirst = true; const k = eIO(clamp((t - e('grab')) / 0.35)), up = eIO(clamp((t - e('off')) / 0.3));
      st.armR = reach(g, 1, lerp(CASEX - X.bf - 60, g.hw * 0.7 + up * g.hw * 1.2, k), lerp(-880, g.headY - g.hh * 1.0 + up * g.hh * 0.4, k), { planar: true }); st.lookY = -0.3; }
    if (t > e('off')) { st.items = { L: brushItem(), R: ctx => { ctx.save(); ctx.translate(0, 40); ctx.rotate(0.4); beanieDraw(ctx, G.bf.hw * 0.95, G.bf.hh * 0.95); ctx.restore(); } }; st.mood = 'sad'; st.lookY = 0; st.look = -0.6; }
    if (speaking('o2_b', t, 0.05, 0.05)) { st.mood = 'sad'; }
    if (t > endOf('o2_b') + 0.1) { st.mood = 'worried'; st.blink = 0; } }
  if (L === 'o3') { st.mood = 'happy'; st.look = -0.7;
    if (speaking('o3_h', t, 0, 0.1)) { st.mood = 'surprised'; }
    if (speaking('o3_b', t, 0.05, 0.05)) { st.mood = 'worried'; st.headY = Math.abs(Math.sin((t - SP.o3_b.t) * 6)) * 14; }
    if (t > e('slow')) { const u = t - e('slow'); st.mood = 'worried'; st.blink = 0; st.legPose = 'walk'; st.t = e('slow') + u * 0.3; st.turn = -0.25; st.look = -0.8; st.headY = Math.sin(u * 1.6) * 6;
      st.armR = reach(g, 1, CASEX - X.bf - 60, -880, { planar: true }); st.armL = reach(g, -1, -g.sw * 1.3, g.ySh + 120 + Math.sin(u * 1.5) * 20, { planar: true }); st.items = {}; } }
  if (L === 'o4') { st.mood = 'happy'; st.look = -0.7;
    if (speaking('o4_h', t, 0, 0)) { const u = t - SP.o4_h.t; st.mood = u > 3.0 ? 'worried' : 'happy'; if (u > 2.2) { st.look = -1; st.turn = -0.4; } }
    if (t > endOf('o4_h')) { st.mood = 'worried'; st.blink = 0; }
    if (t > SP.o4_b.t - 0.1) { st.mood = 'sad'; st.headY = 12; st.armL = hold(g, -1, 360, 0.6); st.breathe = 0.4; st.lookY = 0.3; } }
  if (L === 'end') { st.mood = 'sad'; st.look = -0.4; st.armL = hold(g, -1, 360, 0.6); st.headY = 10;
    if (t > e('lift')) { st.armR = reach(g, 1, CASEX - X.bf - 60, -980, { planar: true }); st.lean = 0.12; }
    if (t > e('burst')) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; st.headY = -6; st.lean = 0; st.armL = open(g, -1, 1.6, 60); st.armR = open(g, 1, 1.6, 60); st.items = {}; }
    if (t > SP.end_b.t - 0.15) { st.mood = 'worried'; st.headY = 4; st.armL = hold(g, -1, 260, 0.45); st.armR = hold(g, 1, 260, 0.45); st.items = {}; st.afterTorso = (c, gg) => { c.save(); c.translate(0, gg.ySh + 250); box(c, 0.75, 1); c.restore(); }; }
    if (t > e('eat')) { st.mood = 'happy'; st.laugh = true; st.blink = 1; st.headY = 0; } }
  if (hatOn(t, L)) st.front = (c, gg) => { c.save(); c.translate(gg.head.x, gg.head.y); c.rotate(st.tilt || 0); beanieDraw(c, G.bf.hw, G.bf.hh); c.restore(); };
  return st; }
// suitcase state: o3 = rolls with him; end = tilts then bursts
const caseState = (t, L) => { if (L === 'end') { const b = ev('end', 'burst'); return { open: eBack(clamp((t - b) / 0.35), 1.5), tilt: t < b ? -0.05 * Math.sin(clamp((t - ev('end', 'lift')) / 0.7) * Math.PI) : 0 }; } return { open: 0, tilt: 0 }; };
// containers flying out of the suitcase in the twist (world)
const SPILL = [[-520, -10, 0, 0.9], [-330, 30, 1, 1.05], [-140, 20, 2, 1.0], [180, 40, 3, 0.95], [360, 10, 0, 1.0], [-690, 40, 2, 0.95]];
function spill(c, t) { const b = ev('end', 'burst'); if (t < b) return;
  SPILL.forEach(([dx, dy, kind, s], i) => { const t0 = b + 0.05 + i * 0.07, k = clamp((t - t0) / 0.5); if (k <= 0) return; const x = CASEX + lerp(0, dx, k), y = lerp(-400, dy - 30, k) - Math.sin(k * Math.PI) * 420; c.save(); c.translate(x, y); c.rotate((1 - k) * (i % 2 ? 3 : -3) + (k >= 1 ? (i - 2.5) * 0.05 : 0)); box(c, 0.95 * s, kind); c.restore(); }); }

// ---------------- world + which characters each shot draws (clean singles: only the tagged character)
const DRAW = { wide: ['her', 'bf'], cover: ['her', 'bf'], two: ['her', 'bf'], her: ['her'], bf: ['bf'], cat: [], hercat: ['her'], endw: ['her', 'bf'] };
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGR, BX0, BY0, BW, BH);
  sofa(c);
  const cm = catMode(t, L); const catOnSofa = !(L === 'end' && t > ev('end', 'eat') - 0.05);
  if (catOnSofa) { c.save(); c.translate(CATX, CATY); cat(c, t, cm, 1.0); c.restore(); K.mark(c, 'cat', CATX, CATY - 250, 220); }
  shelf(c, t, L, L === 'o1' && t > ev('o1', 'cup'));
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), X.her, 0);
  const cs = caseState(t, L);
  if (who.includes('bf')) heads.bf4 = K.put(c, BF, bfState(t, L), bfX(t, L), 0);
  c.save(); c.translate(caseX(t, L), 0); suitcase(c, cs.open, 1, cs.tilt); c.restore(); K.mark(c, 'case', caseX(t, L), -500, 300);
  if (L === 'o3' && t > ev('o3', 'slow')) jambFront(c);
  // the falling mug (o2)
  const mf = L === 'o2' ? mugFall(t) : null; if (mf && who.includes('her')) { if (mf.k < 1) { c.save(); c.translate(mf.x, mf.y); c.rotate(mf.r); mug(c, 1.1); c.restore(); } else { c.save(); c.translate(mf.x + 20, -20); c.fillStyle = 'rgba(120,70,40,.6)'; c.beginPath(); c.ellipse(20, 14, 260, 34, 0, 0, TAU); c.fill(); for (const [dx, dy, r] of [[-120, -6, 0.6], [-10, -20, -0.4], [110, 4, 1.1], [200, -4, 0.3]]) { c.save(); c.translate(dx, dy); c.rotate(r); paint(c, q => { q.m(-50, -26); q.l(50, -26); q.l(40, 26); q.l(-44, 22); q.z(); }, '#FFF6EA', { sd: 3, hd: 2, lw: 4 }); c.restore(); } c.fillStyle = '#EE5E9A'; c.beginPath(); c.arc(-10, -20, 12, 0, TAU); c.fill(); c.restore(); } }
  if (L === 'end') spill(c, t);
  if (L === 'end' && !catOnSofa) { c.save(); c.translate(CASEX - 520 + 90, 0); cat(c, t, 'eat', 1.1); c.restore(); }
  // o2: the shine on his bald head
  if (L === 'o2' && heads.bf4 && t > ev('o2', 'shine')) { const hd = heads.bf4, u = t - ev('o2', 'shine'), k = eBack(clamp(u / 0.25), 2) * (u < 1.4 ? 1 : 0.6 + 0.4 * Math.sin(t * 6)); star(c, hd.x - hd.hh * 0.35, hd.y - hd.hh * 0.85, 70 * k); star(c, hd.x + hd.hh * 0.3, hd.y - hd.hh * 1.0, 36 * k, 0.9); }
  // o1: sparkle on his toothbrush in her cup
  if (L === 'o1' && t > ev('o1', 'cup')) { const u = t - ev('o1', 'cup'), k = eBack(clamp(u / 0.3), 2); star(c, SHX + 40, SHY - 230, 55 * k * (0.8 + 0.2 * Math.sin(t * 8))); star(c, SHX - 70, SHY - 180, 28 * k, 0.8); }
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const HY = k => G[k].headY, fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(260, fy(HY('bf'), 0.62, 700), 0.62, 'cover'), WIDE: S(120, fy(HY('bf'), 0.5, 610), 0.5, 'wide'), TWO: S(200, fy(HY('bf'), 0.7, 820), 0.7, 'two'),
  HER: S(X.her + 20, fy(HY('her'), 1.0), 1.0, 'her'), HER_CU: S(X.her + 10, fy(HY('her'), 1.35, 980), 1.35, 'her'), HER_W: S(X.her + 60, fy(HY('her'), 0.7, 510), 0.7, 'her'), ENDB: S(400, fy(HY('bf'), 0.62, 560), 0.62, 'two'), HER_R: S(X.her + 20, fy(HY('her'), 1.05, 960), 1.05, 'her'),
  HER_CAT: S(-760, fy(HY('her'), 0.72, 800), 0.72, 'hercat'), CAT: S(CATX, CATY - 260, 1.45, 'cat'),
  BF: S(X.bf + 60, fy(HY('bf'), 0.95, 900), 0.95, 'bf'), BF_CU: S(X.bf + 10, fy(HY('bf'), 1.3, 960), 1.3, 'bf'), CASE: S(X.bf + 150, fy(HY('bf'), 0.62, 520), 0.62, 'bf'), BF_LOW: S(X.bf + 60, fy(HY('bf'), 0.95, 1150), 0.95, 'bf'),
  PLANT: S((X.bf + SHX) / 2 + 40, fy(HY('bf'), 0.85, 800), 0.85, 'two'), DOOR: S(820, fy(HY('bf'), 0.62, 760), 0.62, 'two'),
  ENDW: S(330, -589, 0.56, 'endw'), MUM: U('mum', 1) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < SP.hook_b.t + 1.15) return SH.COVER; if (t < hev('freeze') - 0.02) return f(SH.BF_LOW); if (t < hev('week') - 0.05) return f(SH.HER_CU); if (t < hev('case') - 0.05) return f(SH.TWO); if (t < hev('wide') - 0.05) return f(SH.CASE); return f(SH.WIDE); }
  if (L === 'o1') { if (t < SP.o1_h.t - 0.1) return f(SH.WIDE); if (t < endOf('o1_h') + 0.02) return f(SH.HER); if (t < e('plant') - 0.05) return f(SH.BF); if (t < SP.o1_nar.t + 0.8) return f(SH.PLANT); return f(SH.HER_R); }
  if (L === 'o2') { if (t < SP.o2_h.t - 0.1) return f(SH.WIDE); if (t < endOf('o2_h') + 0.02) return f(SH.HER); if (t < e('stare') - 0.02) return f(SH.BF_CU); if (t < SP.o2_nar.t - 0.05) return f(SH.HER_W); return f(SH.TWO); }
  if (L === 'o3') { if (t < SP.o3_h.t - 0.1) return f(SH.WIDE); if (t < SP.o3_b.t - 0.1) return f(SH.HER); if (t < e('slow') - 0.02) return f(SH.BF); if (t < SP.o3_nar.t + 0.9) return f(SH.DOOR); return f(SH.HER_R); }
  if (L === 'o4') { if (t < SP.o4_h.t - 0.1) return f(SH.WIDE); if (t < e('cat') - 0.02) return f(SH.HER_CAT); if (t < SP.o4_b.t - 0.1) return f(SH.CAT); if (t < e('smug') - 0.02) return f(SH.BF_CU); return f(SH.CAT); }
  if (L === 'end') { if (t < e('insert') - 0.02) return f(SH.ENDB); if (t < SP.end_b.t - 0.1) return f(SH.MUM); if (t < e('face') - 0.02) return f(SH.BF); if (t < e('eat') - 0.02) return f(SH.HER); return f(SH.ENDW); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- insert: the open suitcase full of MUM containers on a solid backdrop
function mumView(c, t) { const a = ev('end', 'insert'), u = t - a; c.fillStyle = '#7A2430'; c.fillRect(0, 0, W, HH); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'mum' });
  c.fillStyle = 'rgba(255,255,255,.04)'; for (let k = 0; k < 12; k++) c.fillRect(0, k * 180, W, 70);
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN', 'MON'];
  for (let r = 0; r < 4; r++) for (let k = 0; k < 2; k++) { const i = r * 2 + k, kk = eBack(clamp((u - i * 0.06) / 0.25), 1.8); if (kk <= 0) continue;
    c.save(); c.translate(300 + k * 480, 520 + r * 240); c.scale(kk, kk); c.rotate((k ? 1 : -1) * 0.03 * (r % 2 ? 1 : -1)); box(c, 1.6, i % 4, 'MUM · ' + days[i]); c.restore(); }
  // sticky note
  const nk = eBack(clamp((u - 0.6) / 0.3), 2); if (nk > 0) { c.save(); c.translate(560, 1470); c.rotate(-0.05); c.scale(nk, nk); c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(-300 + 8, -80 + 10, 600, 160); c.fillStyle = '#FFE38A'; c.fillRect(-300, -80, 600, 160); fitTxt(c, 'EAT WELL, SWEETIE!', 0, -24, 50, '#7A2430', 540, 'Nun9'); fitTxt(c, '— MUM', 120, 40, 44, '#7A2430', 300, 'Nun9'); c.restore(); } }

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
  fitTxt(c, 'встречаемся неделю, а он уже', 0, -4, 50, '#1E2030', 820, 'Unb9'); fitTxt(c, 'с чемоданом. Что ответить?', 0, 66, 50, '#1E2030', 820, 'Unb9');
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
  // heroine + boyfriend (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34; 2nd character at local x 640)
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gb = G.bf;
    K.put(c, BF, { t, mood: 'happy', laugh: true, turn: -0.2, look: -0.5, armL: hold(gb, -1, 260, 0.45), armR: hold(gb, 1, 260, 0.45), afterTorso: (cc, gg) => { cc.save(); cc.translate(0, gg.ySh + 250); box(cc, 0.75, 1); cc.restore(); }, front: (cc, gg) => { cc.save(); cc.translate(gg.head.x, gg.head.y); beanieDraw(cc, gb.hw, gb.hh); cc.restore(); } }, 640, 60);
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(t * 8) * 30, { planar: true }), armR: hold(g, 1, 300, 0.95), items: { R: mugItem } }, 0, 0); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const q = eBack(P(u, 0.15, 0.5), 2.2);
  if (q > 0) { c.save(); c.translate(CX, 290); c.scale(q, q); UI.font(c, 'Unb9', 76); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, 'КАКОЙ ОТВЕТ', 0, -48, C.oliveD, C.white, 14); UI.strokeText(c, 'ТВОЙ?', 0, 48, C.pink, C.white, 14); c.restore(); }
  const rows = [['1', 'ХОЛОДНО', 'No.', '#E0474C', 'один'], ['2', 'С ЮМОРОМ', "I haven't seen you without a hat.", '#F2B33D', 'два'], ['3', 'КАК НОСИТЕЛЬ', "Let's not rush things.", '#4CAF6A', 'три'], ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', 'My cat has to approve.', '#8E5BD8', 'четыре']];
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
  let heads = {}, proj;
  if (tag.startsWith('ui:')) { mumView(c, t); proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26); }
  // bubbles only for characters drawn in this shot (an off-screen speaker never gets a bubble over another shot)
  if (!tag.startsWith('ui:')) K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, hold: { hook_b: -0.2, o1_h: -0.2, o1_b: 0.3, o2_h: -0.2, o2_b: 0.0, o3_h: -0.2, o3_b: -0.2, o4_h: -0.2, o4_b: 0.3, end_b: -0.2 } });
  if (L === 'hook') { title(c, t); commentPlate(c, t); }
  plate(c, t, sc);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  // the end screen wipes in from the twist
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('movein', NF, renderFrame);
