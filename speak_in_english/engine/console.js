// "Подарил приставку себе" — rubric «Ответ на вопрос из комментариев» (live scene + 4 answers), hard_cut camera: node console.js start end out.mp4 | --png=f1,f2
// Her birthday, living room: the heroine (party dress + party hat) and her boyfriend on the sofa; open gift box on the floor, TV on the right.
// hook: he proudly holds up the console ("for us"), she freezes; comment plate. 1 · ХОЛОДНО: "Thanks. Keep it." -> he hugs the console (hearts).
// 2 · С ЮМОРОМ: she hands him a hair-dryer box -> "...Fair." -> he tries the dryer on his hair. 3 · КАК НОСИТЕЛЬ: he hopefully pats the cushion next to the TV + Bella tip.
// 4 · КОРОЛЕВСКИЙ ОТВЕТ: she holds his controller; TV: PASSWORD CHANGED; he gasps, mashes the 2nd controller -> WRONG PASSWORD.
// Twist: she plays happily with BOTH controllers, he sits on the edge of the sofa: "...Can I at least watch?" -> she wins -> moral. End screen 1/2/3/4.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/console/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];

// ---------------- cast
const HER = { ...BASE.her_lift, necklace: true, top: { type: 'sweater', col: '#D9467E' }, bottom: { type: 'skirt', col: '#D9467E' }, shoes: { col: '#2B1A22', acc: null } };
const BF = { ...BASE.tom };
const G = { her: geom(HER), bf: geom(BF) };
const SEAT = 330;
const X = { her: -330, bf: 170 }, FREE = 520, EDGE = 650, TVX = 1190, BOXX = -60;
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function heart(c, x, y, r, col = '#E0474C') { c.save(); c.translate(x, y); c.fillStyle = col; c.beginPath(); c.moveTo(0, r * 0.9); c.bezierCurveTo(-r * 1.5, -r * 0.1, -r * 0.7, -r * 1.2, 0, -r * 0.45); c.bezierCurveTo(r * 0.7, -r * 1.2, r * 1.5, -r * 0.1, 0, r * 0.9); c.fill(); c.restore(); }
function lockIcon(c, x, y, s, col) { c.save(); c.translate(x, y); c.scale(s, s); c.strokeStyle = col; c.lineWidth = 16; c.beginPath(); c.arc(0, -40, 42, Math.PI, 0); c.lineTo(42, 0); c.moveTo(-42, 0); c.lineTo(-42, -40); c.stroke(); c.fillStyle = col; rr(c, -70, -10, 140, 110, 16); c.fill(); c.fillStyle = 'rgba(0,0,0,.45)'; c.beginPath(); c.arc(0, 35, 14, 0, TAU); c.fill(); c.fillRect(-5, 35, 10, 34); c.restore(); }

// ---------------- props (all drawn with paths; English only on the props)
// game console unit; (0,0) = centre
function consoleDraw(c, s = 1) { c.save(); c.scale(s, s);   // upright white console: white side panels, black core, blue light
  paint(c, q => { q.m(-34, -150); q.l(34, -150); q.l(40, 150); q.l(-40, 150); q.z(); }, '#1E2230', { sd: 4, hd: 2, lw: 4 });
  for (const sg of [-1, 1]) paint(c, q => { q.m(sg * 30, -160); q.q(sg * 110, -150, sg * 100, -60); q.l(sg * 80, 150); q.l(sg * 40, 150); q.z(); }, '#F4F6FA', { sd: 5, hd: 3, lw: 4 });
  c.fillStyle = '#3FA9F5'; c.fillRect(-4, -140, 8, 280); c.fillStyle = '#2A2E3E'; rr(c, -60, 150, 120, 16, 6); c.fill(); c.restore(); }
// gamepad; (0,0) = centre
function padDraw(c, s = 1, col = '#2A2E3E') { c.save(); c.scale(s, s);
  paint(c, q => { q.m(-70, -34); q.q(0, -48, 70, -34); q.q(112, -30, 110, 26); q.q(104, 64, 70, 40); q.q(0, 18, -70, 40); q.q(-104, 64, -110, 26); q.q(-112, -30, -70, -34); q.z(); }, col, { sd: 5, hd: 3, lw: 4 });
  c.fillStyle = '#C9CED6'; c.fillRect(-72, -6, 38, 12); c.fillRect(-59, -19, 12, 38);
  for (const [dx, dy, cc] of [[56, -16, '#5EC27A'], [72, 0, '#E0474C'], [40, 0, '#3FA9F5'], [56, 16, '#F2C14E']]) { c.fillStyle = cc; c.beginPath(); c.arc(dx, dy, 8, 0, TAU); c.fill(); }
  c.restore(); }
// hair-dryer box: blue box with a drawn dryer and English text; (0,0) = centre
function dryerBox(c, s = 1) { c.save(); c.scale(s, s);
  paint(c, q => { q.m(-120, -95); q.l(120, -95); q.l(120, 95); q.l(-120, 95); q.z(); }, '#5BB6E8', { sd: 6, hd: 3, lw: 4 });
  c.fillStyle = '#FFFFFF'; rr(c, -100, -78, 200, 44, 10); c.fill(); fitTxt(c, 'HAIR DRYER', 0, -55, 30, '#1E5A8A', 180, 'Unb9');
  dryerShape(c, 10, 30, 0.8, '#F4F6FA'); c.restore(); }
function dryerShape(c, x, y, s, col = '#F07CA8') { c.save(); c.translate(x, y); c.scale(s, s);
  paint(c, q => { q.m(-70, -34); q.l(40, -34); q.q(70, -34, 70, 0); q.q(70, 34, 40, 34); q.l(-70, 34); q.z(); }, col, { sd: 4, hd: 2, lw: 4 });
  c.fillStyle = '#3A4056'; rr(c, -90, -24, 26, 48, 6); c.fill(); paint(c, q => { q.m(0, 20); q.l(30, 20); q.l(22, 90); q.l(4, 90); q.z(); }, col, { sd: 4, hd: 2, lw: 4 }); c.restore(); }
// item at the wrist: dryer pointing at his hair (nozzle to the left = towards his head)
const dryerItem = ctx => { ctx.save(); ctx.translate(-30, -70); ctx.rotate(0.15); ctx.scale(-1, 1); dryerShape(ctx, 0, 0, 0.9); ctx.restore(); };
const boxItem = ctx => { ctx.save(); ctx.translate(0, -90); dryerBox(ctx, 1.0); ctx.restore(); };
const padItem = (ctx, ha, side) => { ctx.save(); ctx.translate(side * 10, -8); padDraw(ctx, 0.62); ctx.restore(); };
function partyHat(c, gg, g, col = '#EE5E9A') { const x = gg.head.x, y = gg.head.y - g.hh * 0.95; c.save(); c.translate(x, y); c.rotate(-0.15);
  paint(c, q => { q.m(-g.hw * 0.42, 0); q.l(0, -g.hh * 0.85); q.l(g.hw * 0.42, 0); q.z(); }, col, { sd: 6, hd: 3, lw: 4, inner: k => { k.fillStyle = '#FFE38A'; for (const [a, b] of [[-0.18, -0.2], [0.12, -0.42], [-0.05, -0.62], [0.2, -0.12]]) { k.beginPath(); k.arc(g.hw * a, g.hh * b, 9, 0, TAU); k.fill(); } } });
  c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(0, -g.hh * 0.85, 16, 0, TAU); c.fill(); c.restore(); }
// the big gift box (open) with the bow on the leaning lid; (0,0) = floor centre; pad2 = second controller still inside
function giftBox(c, pad2) {
  c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(0, 4, 230, 26, 0, 0, TAU); c.fill();
  if (pad2) { c.save(); c.translate(-30, -235); c.rotate(-0.12); padDraw(c, 0.95); c.restore(); }
  paint(c, q => { q.m(-170, -230); q.l(170, -230); q.l(160, 0); q.l(-160, 0); q.z(); }, '#EE5E9A', { sd: 8, hd: 4, lw: 4 });
  c.fillStyle = '#F2C14E'; c.fillRect(-22, -230, 44, 230);
  c.save(); c.translate(250, -10); c.rotate(-0.32); paint(c, q => { q.m(-60, -230); q.l(60, -230); q.l(60, 0); q.l(-60, 0); q.z(); }, '#F27AAE', { sd: 6, hd: 3, lw: 4 }); c.fillStyle = '#F2C14E'; c.fillRect(-14, -230, 28, 230);
  paint(c, q => { q.m(0, -230); q.q(-90, -330, -80, -240); q.q(-60, -210, 0, -230); q.q(60, -330, 80, -240); q.q(60, -210, 0, -230); q.z(); }, '#F2C14E', { sd: 4, hd: 2, lw: 4 }); c.restore(); }

// ---------------- TV screen content
function screenMode(t, L) {
  if (L === 'hook') return t < hev('self') ? 'menu' : 'game';
  if (L === 'o4') { if (t >= ev('o4', 'wrong')) return 'wrong'; if (t >= ev('o4', 'lock')) return 'pass'; return 'menu'; }
  if (L === 'end') return t >= ev('end', 'win') ? 'win' : 'game';
  if (L === 'outro') return 'win';
  return 'game';
}
function tvScreen(c, w, h, t, L) { const m = screenMode(t, L);
  c.save(); c.beginPath(); c.rect(-w / 2, -h / 2, w, h); c.clip();
  if (m === 'pass' || m === 'wrong') { const red = m === 'wrong'; c.fillStyle = red ? '#5A1020' : '#141A3A'; c.fillRect(-w / 2, -h / 2, w, h);
    const k = eBack(P(t, red ? ev('o4', 'wrong') : ev('o4', 'lock'), (red ? ev('o4', 'wrong') : ev('o4', 'lock')) + 0.25), 2.2), sh = red ? Math.sin(t * 60) * 6 * (1 - P(t, ev('o4', 'wrong'), ev('o4', 'wrong') + 0.4)) : 0;
    c.save(); c.translate(sh, 0); c.scale(k, k); lockIcon(c, 0, -h * 0.12, h / 520, red ? '#FF6A7A' : '#F2C14E');
    fitTxt(c, red ? 'WRONG PASSWORD' : 'PASSWORD CHANGED', 0, h * 0.28, h * 0.11, '#FFFFFF', w * 0.86); c.restore(); c.restore(); return; }
  // game / menu / win: little platformer world
  const g = c.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, '#3B6FE0'); g.addColorStop(1, '#8FD0FF'); c.fillStyle = g; c.fillRect(-w / 2, -h / 2, w, h);
  const sc = (t * 120) % w;
  c.fillStyle = '#5EC27A'; for (let i = -1; i < 4; i++) { const x = -w / 2 + i * w * 0.45 - sc * 0.5 % (w * 0.45); c.beginPath(); c.ellipse(x, h * 0.32, w * 0.28, h * 0.32, 0, Math.PI, 0); c.fill(); }
  c.fillStyle = '#8A5A2A'; c.fillRect(-w / 2, h * 0.3, w, h * 0.2); c.fillStyle = '#C9873A'; for (let x = -w / 2 - (sc % 60); x < w / 2; x += 60) c.fillRect(x, h * 0.3, 30, 12);
  if (m !== 'menu') { const jy = -Math.abs(Math.sin(t * 5)) * h * 0.25; c.fillStyle = '#E0474C'; c.fillRect(-w * 0.18, h * 0.3 - h * 0.18 + jy, h * 0.14, h * 0.18); c.fillStyle = '#FFFFFF'; c.fillRect(-w * 0.18 + h * 0.08, h * 0.3 - h * 0.15 + jy, h * 0.035, h * 0.035);
    c.fillStyle = '#F2C14E'; for (let i = 0; i < 4; i++) { const x = ((i * w * 0.3 - t * 160) % (w * 1.2) + w * 1.2) % (w * 1.2) - w * 0.5; c.beginPath(); c.ellipse(x, -h * 0.05, h * 0.035, h * 0.05, 0, 0, TAU); c.fill(); } }
  if (m === 'menu' && Math.floor(t * 2.5) % 2 === 0) { c.fillStyle = 'rgba(0,0,0,.35)'; rr(c, -w * 0.32, -h * 0.16, w * 0.64, h * 0.2, 14); c.fill(); fitTxt(c, 'PRESS START', 0, -h * 0.06, h * 0.1, '#FFFFFF', w * 0.6); }
  if (m === 'win') { const k = eBack(P(t, ev('end', 'win'), ev('end', 'win') + 0.3), 2.2); c.save(); c.scale(k, k); c.fillStyle = 'rgba(0,0,0,.35)'; rr(c, -w * 0.38, -h * 0.3, w * 0.76, h * 0.3, 18); c.fill(); fitTxt(c, 'PLAYER 2 WINS!', 0, -h * 0.15, h * 0.13, '#FFE38A', w * 0.7); c.restore(); }
  c.restore(); }
function tvDraw(c, t, L) { const w = 560, h = 330, y = -820;
  c.fillStyle = '#6A4A34'; rr(c, TVX - 300, -470, 600, 470, 14); c.fill(); c.fillStyle = '#7E5A40'; for (const x of [TVX - 280, TVX + 10]) { rr(c, x, -440, 270, 420, 10); c.fill(); }
  c.fillStyle = '#1A1C24'; c.fillRect(TVX - 40, -530, 80, 60); rr(c, TVX - 140, -490, 280, 24, 8); c.fill();
  c.fillStyle = '#14161E'; rr(c, TVX - w / 2 - 22, y - h / 2 - 22, w + 44, h + 44, 18); c.fill();
  c.save(); c.translate(TVX, y); tvScreen(c, w, h, t, L); c.restore();
  K.mark(c, 'tv', TVX, y, 300); }

// ---------------- living room (prerendered, softly blurred)
const BX0 = -2400, BY0 = -3300, BW = 5000, BH = 4600, BS = 0.5;
function drawRoom(c) {
  c.fillStyle = '#F4E1D2'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = 'rgba(230,150,160,.18)'; for (let x = BX0; x < BX0 + BW; x += 150) c.fillRect(x, BY0, 55, 3300);
  c.fillStyle = '#C98B6A'; c.fillRect(BX0, -200, BW, 30);
  // window
  c.fillStyle = '#FBF5EC'; rr(c, -1950, -2350, 820, 1100, 18); c.fill(); const g = c.createLinearGradient(0, -2320, 0, -1280); g.addColorStop(0, '#2B3360'); g.addColorStop(1, '#D9897A'); c.fillStyle = g; rr(c, -1920, -2320, 760, 1040, 10); c.fill();
  c.fillStyle = '#FBF5EC'; c.fillRect(-1550, -2320, 18, 1040); c.fillStyle = '#5A8FC9'; rr(c, -2060, -2420, 160, 1250, 30); c.fill(); rr(c, -1180, -2420, 160, 1250, 30); c.fill();
  // bunting across the wall
  c.strokeStyle = '#8A6A5A'; c.lineWidth = 5; c.beginPath(); c.moveTo(-900, -2250); c.quadraticCurveTo(250, -1900, 1500, -2250); c.stroke();
  const cols = ['#EE5E9A', '#F2C14E', '#5EC27A', '#3FA9F5', '#8E5BD8'];
  for (let i = 0; i < 14; i++) { const u = (i + 0.5) / 14, x = lerp(-900, 1500, u), y = -2250 + 4 * u * (1 - u) * 175 * 2 * 0.5 * 2; c.fillStyle = cols[i % 5]; c.beginPath(); c.moveTo(x - 60, y); c.lineTo(x + 60, y); c.lineTo(x, y + 130); c.closePath(); c.fill(); }
  // HAPPY BIRTHDAY garland
  const word = 'HAPPY BIRTHDAY'; c.font = '90px Unb9'; c.textAlign = 'center'; c.textBaseline = 'middle';
  for (let i = 0; i < word.length; i++) { if (word[i] === ' ') continue; const x = -620 + i * 125, y = -1650 + Math.sin(i * 0.9) * 14; c.fillStyle = cols[i % 5]; rr(c, x - 52, y - 60, 104, 120, 14); c.fill(); c.fillStyle = '#FFFFFF'; c.fillText(word[i], x, y + 4); }
  // balloons
  for (const [x, y, col] of [[-1000, -1500, '#EE5E9A'], [-860, -1640, '#F2C14E'], [-1090, -1720, '#3FA9F5'], [1720, -1560, '#8E5BD8'], [1860, -1700, '#EE5E9A'], [1600, -1760, '#5EC27A']]) {
    c.strokeStyle = 'rgba(80,60,60,.5)'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y + 120); c.quadraticCurveTo(x + 30, y + 400, x - 10, y + 700); c.stroke();
    c.fillStyle = col; c.beginPath(); c.ellipse(x, y, 95, 120, 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.4)'; c.beginPath(); c.ellipse(x - 35, y - 45, 18, 30, 0.5, 0, TAU); c.fill(); }
  // floor lamp + plant
  c.fillStyle = '#3A3A44'; c.fillRect(-1595, -1300, 14, 1300); paint(c, q => { q.m(-1720, -1300); q.l(-1460, -1300); q.l(-1520, -1520); q.l(-1660, -1520); q.z(); }, '#F7E6B0', { sd: 4, hd: 2, lw: 4 });
  c.fillStyle = '#6A9E5A'; for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(1980 + i * 30, -700 - i * 60, 60, 170, -0.6 + i * 0.22, 0, TAU); c.fill(); } c.fillStyle = '#C9733A'; rr(c, 1900, -320, 240, 320, 20); c.fill();
  // floor + rug
  c.fillStyle = '#A0704A'; c.fillRect(BX0, -170, BW, 1600); c.fillStyle = 'rgba(0,0,0,.08)'; for (let x = BX0; x < BX0 + BW; x += 220) c.fillRect(x, -170, 8, 1600);
  c.fillStyle = '#E8C9D8'; c.beginPath(); c.ellipse(0, 60, 1100, 120, 0, 0, TAU); c.fill();
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawRoom);
const SX0 = -800, SX1 = 800;
function sofaBack(c) { paint(c, q => { q.m(SX0 + 40, -820); q.q(0, -860, SX1 - 40, -820); q.l(SX1 - 40, -300); q.l(SX0 + 40, -300); q.z(); }, '#3C8F7A', { sd: 12, hd: 6, lw: 3 });
  c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 6; for (const x of [-270, 270]) { c.beginPath(); c.moveTo(x, -800); c.lineTo(x, -420); c.stroke(); } }
function sofaFront(c) { paint(c, q => { q.m(SX0, -440); q.l(SX1, -440); q.l(SX1, -80); q.l(SX0, -80); q.z(); }, '#4FA88A', { sd: 10, hd: 5, lw: 3 });
  for (const s of [-1, 1]) paint(c, q => { const x = s < 0 ? SX0 - 70 : SX1 - 50; q.m(x, -620); q.q(x + 60, -680, x + 120, -620); q.l(x + 120, -80); q.l(x, -80); q.z(); }, '#3C8F7A', { sd: 10, hd: 5, lw: 3 });
  c.fillStyle = '#4A3A2A'; c.fillRect(SX0 - 40, -80, 30, 80); c.fillRect(SX1 + 10, -80, 30, 80); }

// ---------------- character states (both seated on the sofa; legs hidden by the sofa front)
const lap = (g, s, dy = 360, k = 0.45) => reach(g, s, s * g.sw * k, g.ySh + dy);
const open = (g, s, k = 1.7, dy = 90) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const seated = (g, t, who) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, legPose: 'sit', drop: SEAT, legs: false, armL: lap(g, -1), armR: lap(g, 1), items: {} });
const gest = (st, g, who, t, side, base) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20, { planar: true }); } };
// holding something at the chest with both hands (drawn after the torso, under the hands)
const holdFront = (g, st, fn, dy = 200, k = 0.8) => { st.armL = reach(g, -1, -g.sw * k, g.ySh + dy, { planar: true }); st.armR = reach(g, 1, g.sw * k, g.ySh + dy, { planar: true }); st.afterTorso = (c, gg) => { c.save(); c.translate(0, gg.ySh + dy - 20); c.rotate(-0.1); fn(c); c.restore(); }; };
const playPad = (g, st, t, dy = 250) => { const j = Math.sin(t * 14) * 6; st.armL = reach(g, -1, -g.sw * 0.42, g.ySh + dy + j, { planar: true }); st.armR = reach(g, 1, g.sw * 0.42, g.ySh + dy - j, { planar: true }); st.afterTorso = (c, gg) => { c.save(); c.translate(0, gg.ySh + dy - 14); padDraw(c, 0.9); c.restore(); }; };
const consoleInHands = (t, L) => (L === 'hook' && t < hev('self')) || L === 'o1';
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { ...seated(g, t, 'her'), mood: 'happy', turn: 0.25, look: 0.6 };
  st.front = (c, gg) => partyHat(c, gg, g);
  if (L === 'hook') { if (t > hev('freeze') - 0.05) { st.mood = 'annoyed'; st.blink = 0; st.turn = 0.05; st.look = 0.1; st.breathe = 0; if (t > hev('self')) { st.mood = 'skeptical'; st.turn = 0.3; st.look = 0.8; } } }
  if (L === 'o1') { st.mood = 'bored'; st.turn = 0.1; st.look = 0.2; if (speaking('o1_h', t, 0.1, 0.1)) { st.mood = 'annoyed'; } if (t > e('joy')) { st.mood = 'skeptical'; st.turn = 0.3; st.look = 0.8; } if (t > SP.o1_nar.t + 0.8) { st.mood = 'bored'; st.turn = 0; st.look = 0; } }
  if (L === 'o2') { st.mood = 'smug'; st.turn = 0.3; st.look = 0.7; if (speaking('o2_h', t, 0.1, 0.1)) gest(st, g, 'her', t, -1, 120);
    if (t > e('box') && t < e('give')) { st.armR = reach(g, 1, g.sw * 1.3, g.ySh + 120, { planar: true }); st.items = { R: boxItem }; }
    if (t >= e('give') && t < e('land')) { const k = eOut(P(t, e('give'), e('give') + 0.2)); st.armR = reach(g, 1, lerp(g.sw * 1.3, g.sw * 2.6, k), g.ySh + 150, { planar: true }); }
    if (t > e('land')) { st.mood = 'smug'; st.blink = 1; } if (t > e('dry')) { st.mood = 'happy'; st.laugh = true; st.blink = 1; } }
  if (L === 'o3') { st.mood = 'happy'; st.turn = 0.3; st.look = 0.7; st.tilt = 0.06; if (speaking('o3_h', t, 0.1, 0.1)) { st.armL = open(g, -1, 1.6, 140 + Math.sin(t * 5) * 12); st.armR = open(g, 1, 1.6, 140 + Math.cos(t * 5) * 12); }
    if (t > SP.o3_b.t + 0.2) { st.mood = 'skeptical'; st.tilt = 0; st.blink = 0; } if (t > SP.o3_tip.t - 0.2) { st.mood = 'happy'; st.blink = 1; st.turn = 0.05; st.look = 0.1; } }
  if (L === 'o4') { st.mood = 'smug'; st.turn = 0.2; st.look = 0.5; st.armR = reach(g, 1, g.sw * 0.6, g.ySh + 230, { planar: true }); st.items = { R: padItem };
    if (speaking('o4_h', t, 0.1, 0.1)) { gest(st, g, 'her', t, -1, 110); st.mood = 'happy'; } if (t > e('gasp') - 0.1) { st.mood = 'smug'; st.blink = 1; st.armL = lap(g, -1); } }
  if (L === 'end' || L === 'outro') { st.mood = 'happy'; st.laugh = true; st.turn = 0.35; st.look = 0.9; const j = Math.sin(t * 14) * 8;
    st.armL = reach(g, -1, -g.sw * 0.9, g.ySh + 220 + j, { planar: true }); st.armR = reach(g, 1, g.sw * 0.9, g.ySh + 220 - j, { planar: true }); st.items = { L: padItem, R: padItem };
    st.headY = Math.sin(t * 7) * 6;
    if (speaking('end_b', t, 0, 0.2)) { st.laugh = false; st.mood = 'happy'; }
    if (t > e('dance')) { const u = t - e('dance'); st.armL = reach(g, -1, -g.sw * 1.7, g.ySh - 60 + Math.sin(u * 9) * 30, { planar: true }); st.armR = reach(g, 1, g.sw * 1.7, g.ySh - 60 + Math.cos(u * 9) * 30, { planar: true }); st.blink = 1; } }
  return st; }
function bfX(t, L) { if (L !== 'end') return X.bf; return lerp(X.bf, EDGE, eIO(P(t, ev('end', 'edge'), ev('end', 'edge') + 0.6))); }
function bfState(t, L) { const g = G.bf, e = k => ev(L, k), st = { ...seated(g, t, 'bf'), mood: 'happy', turn: -0.2, look: -0.5 };
  if (L === 'hook') { if (t < hev('self')) { holdFront(g, st, c => consoleDraw(c, 1.3), 230, 0.62); st.mood = 'happy'; st.look = 0; st.turn = -0.1; if (speaking('hook_b', t, 0, 0.1)) st.laugh = false; else st.laugh = true;
      if (t > hev('bf') - 0.05) { st.mood = 'happy'; st.blink = 1; st.tilt = -0.1; st.armL = reach(g, -1, g.sw * 0.3, g.ySh + 200, { planar: true }); st.armR = reach(g, 1, -g.sw * 0.3, g.ySh + 200, { planar: true }); } }
    else { playPad(g, st, t); st.mood = 'happy'; st.laugh = true; st.turn = 0.3; st.look = 0.9; } }
  if (L === 'o1') { holdFront(g, st, c => consoleDraw(c, 1.3), 240, 0.62); st.mood = 'happy'; st.turn = -0.2; st.look = -0.6;
    if (speaking('o1_h', t, 0.05, 0)) { st.mood = 'surprised'; }
    if (t > e('joy')) { st.mood = 'happy'; st.laugh = true; st.headY = -6; }
    if (speaking('o1_b', t, 0, 0)) st.laugh = false;
    if (t > e('hug')) { const k = eOut(P(t, e('hug'), e('hug') + 0.25)); st.armL = reach(g, -1, lerp(-g.sw * 0.8, g.sw * 0.35, k), g.ySh + 190, { planar: true }); st.armR = reach(g, 1, lerp(g.sw * 0.8, -g.sw * 0.35, k), g.ySh + 210, { planar: true }); st.tilt = -0.12 * k; st.blink = 1; st.turn = 0; st.look = 0; st.headY = Math.sin(t * 6) * 5; } }
  if (L === 'o2') { playPad(g, st, t); st.mood = 'happy'; st.turn = 0.3; st.look = 0.9;
    if (t > SP.o2_h.t + 0.3) { st.mood = 'surprised'; st.turn = -0.25; st.look = -0.7; }
    if (t > e('land') - 0.05) { st.afterTorso = null; holdFront(g, st, c => dryerBox(c, 0.95), 230, 0.75); st.mood = 'worried'; st.look = -0.2; st.lookY = 0.4; }
    if (speaking('o2_b', t, 0, 0.1)) { st.mood = 'sad'; st.headY = Math.sin((t - SP.o2_b.t) * 14) * 9; st.lookY = 0; }
    if (t > e('dry')) { st.afterTorso = null; st.mood = 'happy'; st.blink = 1; st.headFirst = true; st.lookY = 0; st.look = 0; st.turn = 0; st.armR = reach(g, 1, g.hw * 1.5, g.headY + 30 + Math.sin(t * 9) * 8, { planar: true }); st.items = { R: dryerItem }; st.armL = lap(g, -1, 330, 0.6); st.headX = Math.sin(t * 20) * 3; } }
  if (L === 'o3') { playPad(g, st, t); st.mood = 'happy'; st.turn = 0.25; st.look = 0.8;
    if (speaking('o3_h', t, 0, 0.1)) { st.mood = 'neutral'; st.turn = -0.2; st.look = -0.7; }
    if (t > SP.o3_b.t - 0.05) { st.afterTorso = null; st.mood = 'happy'; st.turn = -0.25; st.look = -0.8; st.armL = lap(g, -1); st.armR = lap(g, 1); }
    if (t > e('pat')) { const u = t - e('pat'), bump = Math.abs(Math.sin(u * Math.PI / 0.3)); st.armR = reach(g, 1, g.sw * 1.55, g.ySh + 300 - bump * 70, { planar: true }); st.mood = 'happy'; st.laugh = !speaking('o3_b', t); st.lean = 0.25; } }
  if (L === 'o4') { st.mood = 'happy'; st.turn = -0.2; st.look = -0.6;
    if (speaking('o4_h', t, 0, 0)) { st.mood = t > SP.o4_h.t + SP.o4_h.d * 0.6 ? 'surprised' : 'happy'; }
    if (t > e('gasp') - 0.05) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; st.armL = open(g, -1, 1.6, 60); st.armR = open(g, 1, 1.6, 60); st.headY = -10; st.turn = -0.1; st.look = -0.3; }
    if (t > e('mash')) { playPad(g, st, t * 2.2, 200); st.mood = 'angry'; st.turn = 0.3; st.look = 0.9; st.headY = 0; } }
  if (L === 'end') { st.mood = 'sad'; st.turn = -0.25; st.look = -0.6; st.armL = lap(g, -1, 330, 0.75); st.armR = lap(g, 1, 330, 0.75); st.headY = 14; st.breathe = 0.4;
    if (t < e('edge')) { st.mood = 'worried'; st.headY = 0; } if (t > e('dance')) { st.mood = 'sad'; st.lookY = 0.3; } }
  return st; }

// ---------------- world + which characters each shot draws (clean singles: only the tagged character)
const DRAW = { wide: ['her', 'bf'], cover: ['her', 'bf'], two: ['her', 'bf'], edge: ['her', 'bf'], her: ['her'], bf: ['bf'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGR, BX0, BY0, BW, BH);
  tvDraw(c, t, L);
  if (!consoleInHands(t, L)) { c.save(); c.translate(TVX + 200, -575); consoleDraw(c, 0.4); c.restore(); }
  sofaBack(c);
  const bx = bfX(t, L);
  if (who.includes('bf')) heads.bf = K.put(c, BF, bfState(t, L), bx, 0);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), X.her, 0);
  sofaFront(c);
  // o2: the hair-dryer box flies from her hand to his
  if (L === 'o2' && t > ev('o2', 'give') && t < ev('o2', 'land')) { const k = eIO(P(t, ev('o2', 'give'), ev('o2', 'land'))), x = lerp(X.her + 300, X.bf, k), y = lerp(-720, -650, k) - Math.sin(k * Math.PI) * 120; c.save(); c.translate(x, y); c.rotate(k * 0.6); dryerBox(c, 0.75); c.restore(); }
  c.save(); c.translate(BOXX, 0); giftBox(c, !(L === 'end' || L === 'outro' || (L === 'o4' && t > ev('o4', 'mash') - 0.1))); c.restore(); K.mark(c, 'gift', BOXX, -150, 200);
  // o1: hearts around him while he hugs the console
  if (who.includes('bf') && L === 'o1' && t > ev('o1', 'hug')) { const hd = heads.bf; for (let i = 0; i < 5; i++) { const u = ((t - ev('o1', 'hug')) * 0.9 + i / 5) % 1, a = -Math.PI / 2 + (i - 2) * 0.55; c.save(); c.globalAlpha = 1 - u; heart(c, hd.x + Math.cos(a) * hd.hh * (1.3 + u * 1.2), hd.y + Math.sin(a) * hd.hh * (1.2 + u * 1.4) + hd.hh * 0.8, 26 + 12 * u, i % 2 ? '#EE5E9A' : '#E0474C'); c.restore(); } }
  // o3: little puffs where he pats the free cushion
  if (who.includes('bf') && L === 'o3' && t > ev('o3', 'pat')) { const u = ((t - ev('o3', 'pat')) % 0.3) / 0.3, x0 = X.bf + G.bf.sw * 1.55 + 10, y0 = -640; c.save(); c.globalAlpha = 0.8 * (1 - u); c.strokeStyle = '#FFFFFF'; c.lineWidth = 8; c.lineCap = 'round';
    for (const a of [-2.4, -1.57, -0.7]) { c.beginPath(); c.moveTo(x0 + Math.cos(a) * (50 + u * 40), y0 + Math.sin(a) * (50 + u * 40)); c.lineTo(x0 + Math.cos(a) * (80 + u * 40), y0 + Math.sin(a) * (80 + u * 40)); c.stroke(); } c.restore(); }
  // o2: warm air from the dryer at his hair
  if (who.includes('bf') && L === 'o2' && t > ev('o2', 'dry')) { const hd = heads.bf; c.save(); c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 9; c.lineCap = 'round';
    for (let i = 0; i < 4; i++) { const u = ((t * 2.5 + i / 4) % 1), x0 = hd.x + hd.hh * 0.9 - u * hd.hh * 0.8, y0 = hd.y - hd.hh * (0.5 + i * 0.18); c.globalAlpha = 1 - u; c.beginPath(); c.moveTo(x0 + 60, y0); c.quadraticCurveTo(x0 + 30, y0 - 18, x0, y0); c.stroke(); } c.restore(); }
  // twist: a little rain cloud over him on the edge of the sofa
  if (tag === 'edge' && L === 'end' && t > ev('end', 'edge') + 0.7) { const hd = heads.bf, k = eBack(P(t, ev('end', 'edge') + 0.7, ev('end', 'edge') + 1.0), 1.8); c.save(); c.translate(hd.x, hd.y - hd.hh * 2.0); c.scale(k, k); c.fillStyle = '#9AA6B8';
    for (const [dx, dy, r] of [[-60, 0, 50], [0, -25, 62], [60, 0, 50], [0, 18, 48]]) { c.beginPath(); c.arc(dx, dy, r, 0, TAU); c.fill(); }
    c.strokeStyle = '#5BB6E8'; c.lineWidth = 7; c.lineCap = 'round'; for (let i = 0; i < 4; i++) { const u = (t * 2 + i * 0.27) % 1; c.beginPath(); c.moveTo(-60 + i * 40, 60 + u * 80); c.lineTo(-66 + i * 40, 80 + u * 80); c.stroke(); } c.restore(); }
  if (!heads.her) heads.her = OFFL; if (!heads.bf) heads.bf = OFF;
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const HY = k => G[k].headY + SEAT, fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(-60, fy(HY('her'), 0.8, 1130), 0.8, 'cover'), WIDE: S(330, fy(HY('her'), 0.5, 1030), 0.5, 'wide'), TWO: S(-80, fy(HY('her'), 0.92, 1000), 0.92, 'two'),
  HER: S(X.her + 20, fy(HY('her'), 1.0), 1.0, 'her'), HER_CU: S(X.her + 10, fy(HY('her'), 1.4, 990), 1.4, 'her'), HER_R: S(X.her + 20, fy(HY('her'), 1.0, 1000), 1.0, 'her'),
  BF: S(X.bf + 120, fy(HY('bf'), 1.0, 950), 1.0, 'bf'), BF_CU: S(X.bf, fy(HY('bf'), 1.35, 950), 1.35, 'bf'), BF_EDGE: S(EDGE - 60, fy(HY('bf'), 1.05, 950), 1.05, 'bf'),
  EDGE: S((X.her + EDGE) / 2 + 40, fy(HY('her'), 0.68, 1000), 0.68, 'edge'), TV: U('tv', 1) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  const sp = (id, pre = 0.1, post = 0.15) => speaking(id, t, pre, post);
  if (L === 'hook') { if (t < hev('freeze') - 0.02) return SH.COVER; if (t < hev('nar') + 1.2) return f(SH.HER_CU); if (t < hev('bf') - 0.05) return f(SH.TWO); if (t < hev('self') - 0.05) return f(SH.BF_CU); if (t < hev('wide') - 0.05) return f(SH.BF); return f(SH.WIDE); }
  if (L === 'o1') { if (t < SP.o1_h.t - 0.1) return f(SH.WIDE); if (t < endOf('o1_h') + 0.12) return f(SH.HER); if (t < SP.o1_nar.t + 0.9) return f(SH.BF); return f(SH.HER_R); }
  if (L === 'o2') { if (t < SP.o2_h.t - 0.1) return f(SH.WIDE); if (t < e('give') - 0.02) return f(SH.HER); if (t < e('dry') - 0.05) return f(SH.TWO); return f(SH.BF); }
  if (L === 'o3') { if (t < SP.o3_h.t - 0.1) return f(SH.WIDE); if (sp('o3_h', 0.1, 0.12)) return f(SH.HER); if (t < SP.o3_nar.t - 0.05) return f(SH.BF); if (t < SP.o3_tip.t - 0.1) return f(SH.TWO); return f(SH.HER_R); }
  if (L === 'o4') { if (t < SP.o4_h.t - 0.1) return f(SH.WIDE); if (t < e('tv') - 0.02) return f(SH.HER); if (t < e('gasp') - 0.05) return f(SH.TV); if (t < e('wrong') - 0.05) return f(SH.BF_CU); return f(SH.TV); }
  if (L === 'end') { if (t < e('edge') - 0.1) return f(SH.TV); if (t < SP.end_b.t - 0.1) return f(SH.EDGE); if (t < endOf('end_b') + 0.3) return f(SH.BF_EDGE); if (t < SP.moral.t + 0.6) return f(SH.HER); return f(SH.EDGE); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- TV insert: the screen close-up on a solid backdrop
function tvView(c, t, L) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, '#2A2F48'); g.addColorStop(1, '#141724'); c.fillStyle = g; c.fillRect(0, 0, W, HH); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'tv' });
  c.fillStyle = 'rgba(255,255,255,.03)'; for (let k = 0; k < 12; k++) c.fillRect(0, k * 180, W, 70);
  const w = 940, h = 560, y = 900; c.fillStyle = '#0C0D12'; rr(c, 540 - w / 2 - 30, y - h / 2 - 30, w + 60, h + 60, 26); c.fill();
  c.save(); c.translate(540, y); tvScreen(c, w, h, t, L); c.restore();
  // hands with the controllers in the twist (hers)
  if (L === 'end') { for (const s of [-1, 1]) { c.save(); c.translate(540 + s * 230, 1420 + Math.sin(t * 14 + s) * 10); c.rotate(-s * 0.15); padDraw(c, 1.6); c.restore(); } } }

// ---------------- overlays: title, comment plate, option plates
function title(c, t) { const a = 1 - P(t, hev('title_out') - 0.25, hev('title_out')); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 300); c.rotate(-0.04); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -102);
  UI.textFit(c, 'Unb9', 120, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 6, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 64, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 112); c.restore();
  if (global.__QA) global.__QA.ui(c, 'card', { x: 50, y: 135, w: 980, h: 330, k: a, id: 'title' }); }
function commentPlate(c, t) { const a = hev('plate'), k = eBack(P(t, a, a + 0.3), 1.8) * (1 - P(t, SC.hook.e - 0.25, SC.hook.e - 0.05)); if (k <= 0) return;
  c.save(); c.translate(540, 420); c.rotate(-0.025); c.scale(k, k);
  c.fillStyle = 'rgba(0,0,0,.28)'; rr(c, -440 + 8, -130 + 12, 880, 260, 34); c.fill(); c.fillStyle = '#FFFFFF'; rr(c, -440, -130, 880, 260, 34); c.fill();
  c.fillStyle = '#EE5E9A'; c.beginPath(); c.moveTo(-330, 125); c.lineTo(-290, 173); c.lineTo(-270, 125); c.fill();
  c.fillStyle = '#EE5E9A'; rr(c, -440, -130, 880, 70, [34, 34, 0, 0]); c.fill(); c.fillStyle = '#FFFFFF'; rr(c, -400, -113, 46, 34, 10); c.fill(); c.beginPath(); c.moveTo(-392, -83); c.lineTo(-396, -67); c.lineTo(-376, -81); c.fill();
  fitTxt(c, 'Вопрос из комментариев:', -335, -95, 36, '#FFFFFF', 700, 'Nun9', 'left');
  fitTxt(c, 'парень подарил на ДР приставку.', 0, -4, 50, '#1E2030', 820, 'Unb9'); fitTxt(c, 'Себе. Что сказать?', 0, 66, 50, '#1E2030', 820, 'Unb9');
  c.restore(); if (global.__QA) global.__QA.ui(c, 'card', { x: 100, y: 290, w: 880, h: 260, k, id: 'comment' }); }
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
    K.put(c, BF, { t, mood: 'sad', turn: -0.2, look: -0.5, armL: reach(gb, -1, -gb.sw * 0.7, gb.ySh + 330), armR: reach(gb, 1, gb.sw * 0.7, gb.ySh + 330) }, 640, 60);
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(t * 8) * 30, { planar: true }), armR: reach(g, 1, g.sw * 0.8, g.ySh + 300), items: { R: padItem }, front: (cc, gg) => partyHat(cc, gg, g) }, 0, 0); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const q = eBack(P(u, 0.15, 0.5), 2.2);
  if (q > 0) { c.save(); c.translate(CX, 290); c.scale(q, q); UI.font(c, 'Unb9', 76); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, 'КАКОЙ ОТВЕТ', 0, -48, C.oliveD, C.white, 14); UI.strokeText(c, 'ТВОЙ?', 0, 48, C.pink, C.white, 14); c.restore(); }
  const rows = [['1', 'ХОЛОДНО', 'Thanks. Keep it.', '#E0474C', 'один'], ['2', 'С ЮМОРОМ', 'Your present is a hair dryer.', '#F2B33D', 'два'], ['3', 'КАК НОСИТЕЛЬ', "It's the thought that counts.", '#4CAF6A', 'три'], ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', 'I just changed the password.', '#8E5BD8', 'четыре']];
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
  if (tag.startsWith('ui:')) { tvView(c, t, L); heads = { her: OFFL, bf: OFF }; proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26); }
  if (!tag.startsWith('ui:')) K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, hold: { hook_b: -0.22, o1_h: -0.1, o1_b: 0.4, o2_h: -0.15, o2_b: 0.25, o3_h: -0.1, o3_b: 0.3, o4_h: -0.15, o4_b: 0.3, end_b: 0.1 } });
  if (L === 'hook') { title(c, t); commentPlate(c, t); }
  plate(c, t, sc);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  // the end screen wipes in from the twist
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('console', NF, renderFrame);
