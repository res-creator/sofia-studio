// "When you try to look rich" episode renderer (hard_cut camera): node rich.js start end out.mp4 | --png=f1,f2
// Parking outside a cafe: Kevin (white suit, sunglasses, fake gold watch) on the left, his friend Steve (= the owner of the rental company) on the right,
// the red rental sports car behind them, Kevin's own tiny old hatchback parked on the right.
// Shots tagged 'ui:<view>' (key, watch, phone, plate, doc, black) replace the world with a full-screen insert on a dark backdrop.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/rich/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;     // per level (PHONE / FREEZE repeat across levels)
const hev = k => SC.hook.ev[k];

// ---------------- cast
const RICH = { ...BASE.oliver, top: { type: 'blazer', col: '#F3EDDF', shirt: '#EE5E9A', tie: '#F2C14E' }, bottom: { type: 'trousers', col: '#F3EDDF' }, shoes: { col: '#8A5A36', acc: null }, watch: '#F2C14E' };
const OWNER = { ...BASE.ben, top: { type: 'polo', col: '#3E7A4A', col2: '#F3EDDF' }, bottom: { type: 'trousers', col: '#4A4F5C' } };
const PASSER = { ...BASE.greg };
const G = { rich: geom(RICH), owner: geom(OWNER), passer: geom(PASSER) };
const RX = -300, OX = 330, PX = 760;
const HY = who => G[who].headY;
function txt(c, s, x, y, size, col, font = 'Unb9', align = 'center') { c.font = `${size}px ${font}`; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- props
const keyItem = (ctx) => { ctx.save(); ctx.rotate(-0.2); ctx.fillStyle = '#1E2128'; rr(ctx, -26, -70, 52, 74, 18); ctx.fill(); ctx.fillStyle = '#E0474C'; ctx.beginPath(); ctx.arc(0, -46, 9, 0, TAU); ctx.fill();
  ctx.fillStyle = '#FFE15A'; ctx.save(); ctx.translate(30, -10); ctx.rotate(0.5); rr(ctx, 0, -14, 56, 28, 6); ctx.fill(); ctx.restore(); ctx.restore(); };
const phoneItem = (ctx) => { ctx.save(); ctx.rotate(-0.1); ctx.fillStyle = '#2B2F3A'; rr(ctx, -34, -96, 68, 120, 12); ctx.fill(); ctx.fillStyle = '#7FB0D8'; rr(ctx, -26, -88, 52, 104, 8); ctx.fill(); ctx.restore(); };
const shadesItem = (ctx) => { ctx.fillStyle = '#1A1C24'; rr(ctx, -62, -40, 54, 34, 12); ctx.fill(); rr(ctx, 8, -40, 54, 34, 12); ctx.fill(); ctx.fillRect(-10, -32, 20, 6); };
function shades(c, gg, g, turn) { const hx = gg.head.x + turn * g.hw * 0.2, ey = gg.head.y + g.hh * 0.06;
  c.save(); c.fillStyle = '#16181F'; for (const s of [-1, 1]) { rr(c, hx + s * g.hw * 0.42 - g.hw * 0.31, ey - g.hh * 0.11, g.hw * 0.62, g.hh * 0.22, g.hh * 0.08); c.fill(); }
  c.fillRect(hx - g.hw * 0.14, ey - g.hh * 0.07, g.hw * 0.28, g.hh * 0.035);
  c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 5; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(hx + s * g.hw * 0.42 - g.hw * 0.18, ey - g.hh * 0.05); c.lineTo(hx + s * g.hw * 0.42 - g.hw * 0.06, ey - g.hh * 0.08); c.stroke(); } c.restore(); }
function sweat(c, hd, k, side = 1) { if (k <= 0) return; const x = hd.x + side * hd.hh * 0.75, y = hd.y - hd.hh * 0.55 + (1 - k) * -20; c.save(); c.globalAlpha = k; c.fillStyle = '#8FD3F7'; c.strokeStyle = '#3C8FE0'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - 34); c.quadraticCurveTo(x + 22, y, x, y + 14); c.quadraticCurveTo(x - 22, y, x, y - 34); c.fill(); c.stroke(); c.restore(); }

// ---------------- the cars (side view, cartoon proportions)
function wheel(c, x, r, rim) { c.fillStyle = '#1E2128'; c.beginPath(); c.arc(x, -r, r, 0, TAU); c.fill(); c.fillStyle = rim; c.beginPath(); c.arc(x, -r, r * 0.55, 0, TAU); c.fill(); c.fillStyle = '#1E2128'; c.beginPath(); c.arc(x, -r, r * 0.16, 0, TAU); c.fill(); }
function sportsCar(c, x, t, lit = 0) { c.save(); c.translate(x, 0);
  c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(0, 0, 1250, 50, 0, 0, TAU); c.fill();
  paint(c, q => { q.m(-1180, -170); q.q(-1200, -420, -1000, -470); q.l(-520, -520); q.q(-300, -820, 60, -830); q.q(420, -820, 640, -540); q.l(1080, -470); q.q(1220, -430, 1200, -170); q.z(); }, '#E0474C', { sd: 14, hd: 7, lw: 5 });
  paint(c, q => { q.m(-430, -540); q.q(-260, -780, 40, -790); q.q(360, -780, 540, -540); q.z(); }, '#2B3448', { sd: 6, hd: 3, lw: 4 });
  c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.moveTo(-300, -560); c.lineTo(-120, -760); c.lineTo(-40, -760); c.lineTo(-220, -560); c.fill();
  c.fillStyle = '#E0474C'; c.fillRect(40, -790, 26, 250);                                                        // door pillar
  c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 5; c.beginPath(); c.moveTo(-460, -520); c.lineTo(-480, -200); c.moveTo(560, -520); c.lineTo(580, -200); c.stroke();
  c.fillStyle = '#FFF4B8'; rr(c, 1080, -430, 110, 60, 20); c.fill(); c.fillStyle = '#B8283E'; rr(c, -1190, -420, 70, 70, 16); c.fill();
  if (lit > 0) { c.save(); c.globalAlpha = lit; c.fillStyle = '#FFE15A'; c.beginPath(); c.arc(1150, -400, 90, 0, TAU); c.fill(); c.beginPath(); c.arc(-1160, -385, 80, 0, TAU); c.fill(); c.restore(); }
  c.fillStyle = 'rgba(255,255,255,.4)'; rr(c, -900, -440, 1700, 18, 9); c.fill();
  wheel(c, -720, 190, '#F2C14E'); wheel(c, 720, 190, '#F2C14E'); c.restore(); }
function cheapCar(c, x, t, blink = 0) { c.save(); c.translate(x, 0);
  c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(0, 0, 640, 40, 0, 0, TAU); c.fill();
  paint(c, q => { q.m(-620, -170); q.l(-630, -520); q.q(-600, -620, -440, -640); q.l(-300, -1000); q.l(380, -1000); q.q(450, -980, 520, -640); q.q(640, -600, 620, -170); q.z(); }, '#D9C9A0', { sd: 12, hd: 6, lw: 5 });
  c.fillStyle = '#9FC8E4'; c.beginPath(); c.moveTo(-250, -950); c.lineTo(20, -950); c.lineTo(20, -660); c.lineTo(-380, -660); c.closePath(); c.fill(); c.beginPath(); c.moveTo(60, -950); c.lineTo(350, -950); c.lineTo(440, -660); c.lineTo(60, -660); c.closePath(); c.fill();
  c.fillStyle = '#B98E5A'; c.beginPath(); c.ellipse(250, -380, 70, 40, 0.3, 0, TAU); c.fill();                       // rust patch
  c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 6; c.beginPath(); c.moveTo(30, -640); c.lineTo(40, -220); c.stroke();
  c.fillStyle = '#FFFDF8'; rr(c, 260, -1050, 120, 40, 8); c.fill(); txt(c, 'L', 320, -1030, 30, '#E0474C');         // learner plate on the roof rack
  const on = blink > 0 && Math.sin(blink * 22) > 0; c.fillStyle = on ? '#FFB020' : '#E9A23B'; rr(c, 560, -460, 60, 50, 12); c.fill(); rr(c, -620, -460, 50, 50, 12); c.fill();
  if (on) { c.save(); c.globalAlpha = 0.6; c.fillStyle = '#FFE15A'; c.beginPath(); c.arc(600, -435, 80, 0, TAU); c.fill(); c.beginPath(); c.arc(-600, -435, 80, 0, TAU); c.fill(); c.restore(); }
  wheel(c, -380, 150, '#BFC5CC'); wheel(c, 380, 150, '#BFC5CC'); c.restore(); }

// ---------------- parking outside a cafe (prerendered, softly blurred)
const BX0 = -2400, BY0 = -2900, BW = 5200, BH = 4700, BS = 0.5;
function drawLotBg(c) {
  c.fillStyle = '#BFE3F7'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = '#E3D2B8'; c.fillRect(BX0, -2700, BW, 2460);
  c.fillStyle = 'rgba(0,0,0,.05)'; for (let y = -2700; y < -240; y += 70) c.fillRect(BX0, y, BW, 5);
  for (const wx of [-2200, -1600, 1500, 2100]) { c.fillStyle = '#FFFDF8'; rr(c, wx, -2500, 380, 520, 12); c.fill(); c.fillStyle = '#9FC8E4'; rr(c, wx + 18, -2482, 344, 484, 8); c.fill(); c.fillStyle = '#FFFDF8'; c.fillRect(wx + 182, -2482, 16, 484); }
  c.fillStyle = '#2F3E5C'; c.fillRect(-1250, -1900, 2500, 1660);                                              // cafe front
  c.fillStyle = '#FFE7B8'; rr(c, -1160, -1500, 1400, 1000, 14); c.fill();
  c.fillStyle = 'rgba(158,98,56,.35)'; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(-1000 + i * 280, -620, 70, Math.PI, 0); c.fill(); c.fillRect(-1040 + i * 280, -620, 80, 120); }
  c.fillStyle = '#F2C14E'; for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(-940 + i * 360, -1360, 26, 0, TAU); c.fill(); }
  c.fillStyle = '#8A5A36'; rr(c, 420, -1500, 360, 1260, 10); c.fill(); c.fillStyle = '#FFE7B8'; rr(c, 470, -1440, 260, 520, 8); c.fill();
  for (let i = 0; i < 13; i++) { c.fillStyle = i % 2 ? '#FFFDF8' : '#3C8FE0'; c.beginPath(); c.moveTo(-1300 + i * 200, -1900); c.lineTo(-1100 + i * 200, -1900); c.lineTo(-1100 + i * 200, -1700); c.quadraticCurveTo(-1200 + i * 200, -1640, -1300 + i * 200, -1700); c.fill(); }
  c.fillStyle = '#3E471E'; rr(c, -560, -2160, 1120, 200, 30); c.fill(); txt(c, 'CAFÉ ROYAL', 0, -2058, 104, '#F3EDDF', 'Unb9');
  // parking sign + small rental office far right (the payoff for C2)
  c.fillStyle = '#6A6F78'; c.fillRect(-1820, -1500, 26, 1260); c.fillStyle = '#3C6FB4'; rr(c, -1950, -1760, 290, 290, 30); c.fill(); txt(c, 'P', -1805, -1612, 200, '#FFFFFF');
  c.fillStyle = '#FFFDF8'; rr(c, 1500, -1500, 900, 1260, 16); c.fill(); c.fillStyle = '#E0474C'; rr(c, 1500, -1620, 900, 160, 16); c.fill(); txt(c, "STEVE'S RENTALS", 1950, -1540, 62, '#FFFFFF');
  c.fillStyle = '#9FC8E4'; rr(c, 1560, -1400, 780, 600, 10); c.fill();
  // sidewalk + road + parking bay lines
  c.fillStyle = '#D8D2C6'; c.fillRect(BX0, -240, BW, 260); c.fillStyle = '#B9B2A4'; c.fillRect(BX0, 20, BW, 30);
  c.fillStyle = '#6A6F78'; c.fillRect(BX0, 50, BW, 1800); c.fillStyle = '#F3EDDF'; for (const x of [-1550, 950, 2050]) c.fillRect(x, 60, 22, 800);
}
const BGB = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); { const c = BGB.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); c.filter = 'blur(1.4px)'; drawLotBg(c); }
const CARX = -250, CHEAPX = 1500;
// DRIVE: the friend gets in and the red car leaves to the left
const carX = (t, L) => L === 'C2' ? CARX - 4200 * eIn(P(t, ev('C2', 'drive') + 0.25, ev('C2', 'drive') + 1.35)) : CARX;
const ownerGone = (t, L) => L === 'C2' && t > ev('C2', 'drive');

// ---------------- characters
function gest(st, g, who, t, side, base) { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } }
const hang = (g, s) => reach(g, s, s * g.sw * 0.8, g.ySh + 330);
const pocket = (g, s) => reach(g, s, s * g.sw * 0.7, g.ySh + 380);
const wrist = g => reach(g, 1, g.sw * 0.9, g.ySh + 40, { planar: true });           // shows off the watch
const fob = g => reach(g, 1, g.sw * 2.3, g.ySh + 30, { planar: true });              // key fob pointed at a car (right)
const fobL = g => reach(g, -1, -g.sw * 2.3, g.ySh + 30, { planar: true });           // ... at the red car (left)
const ear = g => reach(g, 1, g.hw * 0.9, g.headY + g.hh * 0.2);                     // phone at the ear
function richState(t, L) { const g = G.rich, e = k => ev(L, k), st = { t, talk: talk('rich', t), mood: 'smug', turn: 0.35, look: 0.8, armL: pocket(g, -1), armR: hang(g, 1), items: {} };
  let gl = 'on';
  gest(st, g, 'rich', t, -1, 160);
  if (L === 'hook') { st.armL = reach(g, -1, -g.sw * 2.1, g.ySh + 120, { planar: true }); st.turn = 0.15; st.look = 0.3;   // leaning on the car
    if (speaking('hook_m2', t, 0.05, 0.3)) { st.armR = wrist(g); st.mood = 'smug'; }
    if (t > hev('hide')) { st.items = { R: keyItem }; st.armR = reach(g, 1, g.sw * 0.4, g.ySh + 300); st.mood = 'worried'; st.laugh = true; } }
  if (L === 'A1') { if (speaking('a1_m2', t, 0.05, 0.3)) st.armR = reach(g, 1, g.sw * 1.6, g.ySh - 200, { planar: true });
    if (t > e('press') - 0.1 && t < e('hide')) { st.items = { L: keyItem }; st.armL = fobL(g); st.mood = 'smug'; st.turn = -0.2; st.look = -0.4; }
    if (t > e('alarm')) { st.mood = 'shock'; st.blink = 0; st.turn = 0.6; st.look = 1; }
    if (t > e('hide')) { st.mood = 'worried'; st.laugh = true; st.armR = reach(g, 1, g.sw * 0.2, g.ySh + 330); st.items = {}; st.turn = 0.35; st.look = 0.8; } }
  if (L === 'A2') { if (t > e('watch') - 0.05) { st.armR = wrist(g); st.mood = 'smug'; }
    if (t > SP.a2_m3.t - 0.3) { st.mood = 'worried'; st.laugh = true; st.armR = reach(g, 1, g.sw * 0.4, g.ySh + 260); } }
  if (L === 'B1') { if (speaking('b1_m', t, 0.05, 0.3)) { st.mood = 'smug'; st.armR = reach(g, 1, g.sw * 1.9, g.ySh - 240, { planar: true }); }
    if (speaking('b1_m2', t, 0.05, 0.2)) { st.mood = 'worried'; st.turn = 0.1; st.look = 0.3; }
    if (t > e('ring') - 0.05) { st.mood = 'surprised'; st.items = { R: phoneItem }; st.armR = reach(g, 1, g.sw * 1.1, g.ySh + 20, { planar: true }); st.lookY = 0.4; }
    if (t > e('answer')) { st.armR = ear(g); st.lookY = 0; st.mood = 'worried'; st.turn = 0.1; }
    if (speaking('b1_m3', t, 0.05, 0.4)) { st.mood = 'angry'; st.armL = reach(g, -1, -g.hw * 0.4, g.headY + g.hh * 0.75); } }
  if (L === 'B2') { if (speaking('b2_m', t, 0.05, 0.3)) { st.armL = reach(g, -1, -g.sw * 2.1, g.ySh + 120, { planar: true }); }
    if (t > e('notif') - 0.1 && t < SP.b2_m3.t) { st.items = { R: phoneItem }; st.armR = reach(g, 1, g.sw * 1.1, g.ySh + 20, { planar: true }); st.lookY = 0.4; st.mood = 'worried'; }
    if (t > SP.b2_m3.t - 0.1) { st.mood = 'happy'; st.laugh = true; st.armR = hang(g, 1); } }
  if (L === 'C1') { st.mood = 'smug'; if (t > e('straight') - 0.05) { st.headY = -14; st.turn = 0.25; st.look = 0.6; }
    if (t > e('relief')) { st.mood = 'happy'; st.headY = 0; }
    if (t > e('freeze') - 0.05) { st.mood = 'shock'; st.blink = 0; } }
  if (L === 'C2') { st.mood = 'smug';
    if (speaking('c2_m', t, 0.05, 0.3)) st.mood = 'worried';
    if (t > e('freeze') - 0.05) { st.mood = 'shock'; st.blink = 0; st.armR = hang(g, 1); }
    if (t > e('shades') - 0.05) { const k = eIO(P(t, e('shades'), e('shades') + 0.6)); gl = k < 0.5 ? 'on' : 'off'; st.armR = reach(g, 1, lerp(g.hw * 0.6, g.sw * 1.2, k), lerp(g.headY + g.hh * 0.1, g.ySh + 160, k)); if (k >= 0.5) st.items = { R: shadesItem }; st.mood = 'sad'; }
    if (t > SP.c2_m3.t) { st.mood = 'worried'; st.laugh = speaking('c2_m3', t); }
    if (speaking('c2_m4', t, 0.05, 0.3)) { st.mood = 'sad'; st.armL = reach(g, -1, -g.sw * 1.5, g.ySh - 80, { planar: true }); }
    if (t > e('keys') - 0.05) { const k = eIO(P(t, e('keys'), e('keys') + 0.4)); st.items = { R: k < 0.7 ? keyItem : shadesItem }; st.armR = reach(g, 1, lerp(g.sw * 1.0, g.sw * 2.6, k), g.ySh + 60, { planar: true }); st.mood = 'sad'; }
    if (t > e('drive')) { st.armR = hang(g, 1); st.items = {}; st.turn = -0.5; st.look = -1; st.mood = 'sad'; }
    if (t > e('pass') - 0.1) { st.turn = 0.4; st.look = 0.9; st.mood = 'surprised'; }
    if (t > e('look')) { st.mood = 'sad'; st.turn = 0.6; st.look = 1; }
    if (t > e('fob') - 0.05) { st.items = { R: keyItem }; st.armR = fob(g); st.mood = 'sad'; } }
  if (gl !== 'off') { const tn = st.turn || 0; st.front = (cc, gg) => shades(cc, gg, g, tn); }
  return st; }
function ownerState(t, L) { const g = G.owner, e = k => ev(L, k), st = { t, talk: talk('owner', t), mood: 'happy', turn: -0.35, look: -0.8, armL: hang(g, -1), armR: hang(g, 1) };
  gest(st, g, 'owner', t, 1, 160);
  if (L === 'hook') { st.mood = 'surprised'; st.turn = -0.6; st.look = -1; st.lookY = 0.2; if (t > SP.hook_m2.t) { st.mood = 'skeptical'; st.turn = -0.35; st.look = -0.8; st.lookY = 0; } }
  if (L === 'A1') { if (speaking('a1_f', t, 0.05, 0.2)) { st.armL = reach(g, -1, -g.sw * 2.0, g.ySh - 160, { planar: true }); st.turn = -0.6; st.look = -1; }
    if (t > ev('A1', 'alarm')) { st.mood = 'surprised'; st.turn = 0.5; st.look = 1; } if (t > ev('A1', 'hide')) { st.mood = 'skeptical'; st.turn = -0.35; st.look = -0.8; } }
  if (L === 'A2') { if (t > e('watch') - 0.05 && t < SP.a2_m2.t) { st.mood = 'surprised'; st.armL = reach(g, -1, -g.sw * 1.3, g.ySh - 40, { planar: true }); st.lookY = 0.4; }
    if (t > e('toy')) { st.mood = 'skeptical'; st.lookY = 0.3; } }
  if (L === 'B1') { st.mood = 'neutral'; if (t > e('ring')) st.mood = 'surprised'; if (t > e('stare') - 0.05) { st.mood = 'skeptical'; st.blink = 0; } }
  if (L === 'B2') { if (speaking('b2_f2', t, 0.05, 0.3)) { st.mood = 'happy'; st.armL = reach(g, -1, -g.sw * 1.9, g.ySh - 200, { planar: true }); }
    if (t > e('notif')) { st.mood = 'skeptical'; } }
  if (L === 'C1') { st.mood = 'skeptical'; if (t > e('squint') - 0.05) st.squint = 0.5;
    if (speaking('c1_f2', t, 0.05, 0.2)) { st.mood = 'neutral'; st.squint = 0; }
    if (t > e('phone')) { st.mood = 'smug'; st.squint = 0; st.items = { R: phoneItem }; st.armR = reach(g, 1, g.sw * 1.1, g.ySh + 20, { planar: true }); st.lookY = 0.35; } }
  if (L === 'C2') { st.mood = 'smug';
    if (t > e('turn') - 0.05 && t < SP.c2_m.t) { st.turn = 0.5; st.look = 0.9; st.armL = reach(g, -1, -g.sw * 2.2, g.ySh - 80, { planar: true }); }
    if (speaking('c2_f2', t, 0.05, 0.4)) { st.mood = 'smug'; st.armL = reach(g, -1, g.sw * 0.3, g.ySh + 120); }
    if (t > e('doc') - 0.1 && t < SP.c2_f4.t) { st.items = { R: phoneItem }; st.armR = reach(g, 1, g.sw * 1.2, g.ySh - 40, { planar: true }); }
    if (t > e('hand') - 0.05) { st.mood = 'neutral'; st.armL = reach(g, -1, -g.sw * 2.4, g.ySh + 40, { planar: true }); }
    if (t > e('keys') + 0.3) { st.mood = 'happy'; st.items = { L: keyItem }; st.armL = reach(g, -1, -g.sw * 1.0, g.ySh + 120); st.turn = 0.4; st.look = 0.9; } }
  return st; }
function passerX(t) { const p = ev('C2', 'pass'); return lerp(PX + 900, PX, eOut(P(t, p - 0.9, p))); }
function passerState(t) { const g = G.passer, p = ev('C2', 'pass'), st = { t, talk: talk('passer', t), mood: 'happy', turn: -0.4, look: -0.8, armL: hang(g, -1), armR: hang(g, 1) };
  if (t < p) st.legPose = 'walk';
  if (t > p - 0.1) st.armR = reach(g, 1, g.sw * 2.2, g.ySh - 120, { planar: true });   // points at the old hatchback
  if (t > p - 0.1 && t < endOf('c2_p')) { st.turn = 0.5; st.look = 1; }
  return st; }

// ---------------- the world + which characters a shot draws (clean singles: only the tagged character)
const DRAW = { wide: ['rich', 'owner', 'passer'], card: ['rich', 'owner', 'passer'], two: ['rich', 'owner', 'passer'], rich: ['rich'], owner: ['owner'], passer: ['passer'], cover: ['rich', 'owner'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { c.drawImage(BGB, BX0, BY0, BW, BH); const who = DRAW[tag] || DRAW.wide, heads = {};
  const blink = (L === 'A1' && t > ev('A1', 'alarm') && t < ev('A1', 'alarm') + 1.6) ? t : (L === 'C2' && t > ev('C2', 'fob') && t < ev('C2', 'fob') + 0.9) ? t : 0;
  cheapCar(c, CHEAPX, t, blink); K.mark(c, 'cheapcar', CHEAPX, -500, 500);
  sportsCar(c, carX(t, L), t, (L === 'A1' && t > ev('A1', 'press') && t < ev('A1', 'press') + 0.3) ? 1 : 0); K.mark(c, 'car', CARX, -500, 700);
  if (who.includes('owner') && !ownerGone(t, L)) heads.owner = K.put(c, OWNER, ownerState(t, L), OX, 0);
  if (who.includes('passer') && L === 'C2' && t > ev('C2', 'pass') - 0.9) heads.passer = K.put(c, PASSER, passerState(t), passerX(t), 0);
  if (who.includes('rich')) heads.rich = K.put(c, RICH, richState(t, L), RX, 0);
  if (L === 'B1' && heads.rich && t > ev('B1', 'answer')) { const g = G.rich; heads.mom = { x: RX + g.hw * 0.9 + 60, y: g.headY - 40, hh: 60 }; }
  for (const k of ['owner', 'passer', 'mom']) if (!heads[k]) heads[k] = OFF; if (!heads.rich) heads.rich = OFFL;
  return heads; }

// ---------------- shots (world coordinates; face of a single at ~900 px)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const fy = (who, z, sy = 900) => HY(who) + (960 - sy) / z;
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const SH = { COVER: S(-200, -1000, 0.56, 'cover'), WIDE: S(0, -900, 0.6, 'wide'), FAR: S(700, -1000, 0.42, 'wide'), CARD: S(0, fy('owner', 0.72, 1000), 0.72, 'card'),
  TWO: S(0, fy('owner', 0.8, 800), 0.8, 'two'), TWO_LOW: S(0, fy('owner', 0.8, 1150), 0.8, 'two'), END: S(420, fy('rich', 0.62, 1000), 0.62, 'wide'),
  R: S(RX, fy('rich', 1.0), 1.0, 'rich'), R_LOW: S(RX, fy('rich', 1.0, 1230), 1.0, 'rich'), O_LOW: S(OX, fy('owner', 1.0, 1230), 1.0, 'owner'), R_R: S(RX, fy('rich', 1.0, 1120), 1.0, 'rich'), R_CU: S(RX, fy('rich', 1.7, 960), 1.7, 'rich'),
  O: S(OX, fy('owner', 1.0), 1.0, 'owner'), O_R: S(OX, fy('owner', 1.0, 1120), 1.0, 'owner'), O_CU: S(OX, fy('owner', 1.6, 960), 1.6, 'owner'),
  P: S(PX, fy('passer', 1.0), 1.0, 'passer'),
  KEY: U('key', 1), WATCH: U('watch', 2), PHONE: U('phone', 3), PLATE: U('plate', 4), DOC: U('doc', 5), BLACK: U('black', 6) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  const sp = id => speaking(id, t, 0.1, 0.15);
  if (L === 'hook') { if (t < SP.hook_m.t - 0.1) return SH.COVER; if (t < SP.hook_f.t - 0.1) return f(SH.R_LOW); if (t < SP.hook_m2.t - 0.1) return f(SH.O_LOW);
    if (t < hev('key') - 0.05) return f(SH.R_LOW); if (t < hev('hide') + 0.6) return f(SH.KEY); return f(SH.TWO_LOW); }
  const u = t - sc.s, l = L.toLowerCase(), nar = SP[l + '_nar'];
  if (u < 1.15) return f(L === 'C2' ? SH.O : SH.WIDE);
  if (L === 'C2' && t > e('black') - 0.03 && t < nar.t + 0.05) return f(SH.BLACK);
  if (nar && t >= nar.t - 0.1) return f(SH.CARD);
  if (L === 'A1') { if (t > e('press') - 0.1 && t < e('alarm') - 0.05) return f(SH.WIDE); if (t > e('alarm') - 0.05 && t < e('hide') - 0.05) return f(SH.FAR); if (t > e('hide') - 0.05) return f(SH.R_R); }
  if (L === 'A2') { if (t > e('watch') - 0.05 && t < SP.a2_m.t - 0.1) return f(SH.TWO); if (t > e('close') - 0.05 && t < SP.a2_m3.t - 0.1) return f(SH.WATCH); if (sp('a2_m3')) return f(SH.R_CU); }
  if (L === 'B1') { if (t > e('ring') - 0.05 && t < e('answer') + 0.25) return f(SH.PHONE); if (sp('b1_mom')) return f(SH.TWO); if (sp('b1_m3')) return f(SH.R_CU); if (t > e('stare') - 0.05) return f(SH.O_R); }
  if (L === 'B2') { if (t > e('notif') - 0.05 && t < SP.b2_f3.t - 0.1) return f(SH.PHONE); if (sp('b2_m3')) return f(SH.R_CU); }
  if (L === 'C1') { if (t > e('relief') - 0.05 && t < SP.c1_f3.t - 0.1) return f(SH.TWO); if (t > e('plate') - 0.05 && t < e('freeze') - 0.05) return f(SH.PLATE); if (t > e('freeze') - 0.05) return f(SH.R_CU); }
  if (L === 'C2') { if (t > e('turn') - 0.05 && t < SP.c2_m.t - 0.1) return f(SH.WIDE); if (t > e('pause') - 0.05 && t < SP.c2_f2.t - 0.1) return f(SH.TWO);
    if (sp('c2_f2')) return f(SH.O_CU); if (t > e('freeze') - 0.05 && t < SP.c2_f3.t - 0.1) return f(SH.R_CU);
    if (t > e('doc') - 0.05 && t < e('shades') - 0.05) return f(SH.DOC); if (t > e('shades') - 0.05 && t < SP.c2_m3.t - 0.1) return f(SH.R);
    if (t > e('hand') - 0.05 && t < SP.c2_f5.t - 0.1) return f(SH.TWO); if (t > e('keys') - 0.05 && t < e('drive') - 0.05) return f(SH.TWO);
    if (t > e('drive') - 0.05 && t < e('pass') - 0.9) return f(SH.FAR); if (t > e('pass') - 0.9 && t < e('fob') - 0.05) return f(sp('c2_m5') ? SH.R : SH.END);
    if (t > e('fob') - 0.05) return f(SH.FAR); }
  const cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.1 && t < s.t + s.d + 0.25);
  const single = who => who === 'rich' ? SH.R : who === 'passer' ? SH.P : who === 'mom' ? SH.TWO : SH.O;
  if (cur) return f(single(cur.who));
  const next = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.6 && t < s.t);
  if (next) return f(single(next.who));
  return SH.TWO; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- full-screen inserts on a dark backdrop
function backdrop(c, id) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, '#2B3040'); g.addColorStop(1, '#171A24'); c.fillStyle = g; c.fillRect(0, 0, W, HH); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id }); }
function caption(c, s, k = 1, y = 1560, col = C.pinkL) { if (k <= 0) return; c.save(); c.globalAlpha = k; UI.textFit(c, 'Nun9', 46, s, 960); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, s, 540, y, col, C.oliveD, 10); c.restore(); }
function keyView(c, t) { backdrop(c, 'key'); const a = hev('key'), h = hev('hide'), sw = Math.sin(t * 3) * 0.06;
  c.save(); c.translate(540, 760); c.rotate(-0.15 + sw); c.scale(2.6, 2.6);
  c.fillStyle = '#1E2128'; rr(c, -60, -160, 120, 170, 40); c.fill(); c.fillStyle = '#3A3F4B'; rr(c, -40, -130, 80, 50, 14); c.fill(); c.fillStyle = '#E0474C'; c.beginPath(); c.arc(0, -30, 20, 0, TAU); c.fill();
  c.strokeStyle = '#BFC5CC'; c.lineWidth = 8; c.beginPath(); c.arc(0, 40, 34, 0, TAU); c.stroke();
  c.save(); c.translate(0, 80); c.rotate(0.12 + sw * 2); c.strokeStyle = '#8A8480'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -10); c.lineTo(0, 30); c.stroke();
  c.fillStyle = '#FFE15A'; rr(c, -110, 30, 220, 130, 12); c.fill(); c.strokeStyle = '#C9A040'; c.lineWidth = 4; rr(c, -110, 30, 220, 130, 12); c.stroke();
  fitTxt(c, 'RENTAL', 0, 70, 40, '#E0474C', 190); fitTxt(c, 'RETURN BY 6 PM', 0, 120, 22, '#3E471E', 190); c.restore(); c.restore();
  const k = eIO(P(t, h - 0.15, h + 0.25)); if (k > 0) { c.save(); c.translate(lerp(1500, 600, k), 1080); c.rotate(-0.4); paint(c, q => { q.m(-420, -170); q.q(-60, -240, 120, -150); q.q(220, -40, 140, 120); q.q(-60, 200, -420, 170); q.z(); }, RICH.skin, { sd: 10, hd: 6, lw: 5 }); c.strokeStyle = 'rgba(120,70,50,.45)'; c.lineWidth = 7; for (const y of [-80, -10, 60]) { c.beginPath(); c.moveTo(-60, y); c.quadraticCurveTo(40, y + 10, 110, y + 30); c.stroke(); } c.restore(); }
  caption(c, k > 0.5 ? '*прячет бирку*' : '«АРЕНДА — ВЕРНУТЬ ДО 18:00»', clamp(P(t, a + 0.15, a + 0.4))); }
function watchView(c, t) { backdrop(c, 'watch'); const a = ev('A2', 'close'), bt = ev('A2', 'bt'), toy = ev('A2', 'toy'), sh = t > toy ? Math.sin(t * 60) * 10 : 0;
  c.save(); c.translate(540 + sh, 860); c.fillStyle = RICH.skin; rr(c, -560, -170, 1120, 340, 160); c.fill();                         // wrist
  c.fillStyle = '#C9A040'; rr(c, -150, -420, 300, 840, 60); c.fill(); c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(0, 0, 250, 0, TAU); c.fill(); c.strokeStyle = '#A8862E'; c.lineWidth = 14; c.stroke();
  c.fillStyle = '#14161E'; c.beginPath(); c.arc(0, 0, 205, 0, TAU); c.fill();
  if (t < bt) { const on = Math.sin(t * 9) > -0.2; fitTxt(c, 'LOW', 0, -70, 52, on ? '#E0474C' : '#7A2A30', 300); fitTxt(c, 'BATTERY', 0, -10, 52, on ? '#E0474C' : '#7A2A30', 320); c.strokeStyle = '#E0474C'; c.lineWidth = 8; rr(c, -70, 60, 130, 64, 10); c.stroke(); c.fillStyle = '#E0474C'; c.fillRect(64, 78, 14, 28); c.fillRect(-60, 70, 8, 44); fitTxt(c, '1%', 0, 160, 44, '#E0474C', 200); }
  else if (t < toy) { fitTxt(c, 'BLUETOOTH', 0, -40, 46, '#7FB0D8', 330); fitTxt(c, 'DISCONNECTED', 0, 20, 40, '#7FB0D8', 340); c.strokeStyle = '#E0474C'; c.lineWidth = 10; c.beginPath(); c.moveTo(-60, 80); c.lineTo(60, 150); c.stroke(); }
  else { const hue = Math.floor(t * 8) % 4; fitTxt(c, 'TOY', 0, -50, 86, ['#F2C14E', '#EE5E9A', '#7CF29A', '#7FB0D8'][hue], 330); fitTxt(c, 'MODE', 0, 40, 70, '#FFFDF8', 330); }
  c.restore();
  if (t > toy) for (let i = 0; i < 5; i++) { const u = ((t - toy) * 0.9 + i * 0.2) % 1, x = 540 + Math.sin(i * 2.1 + t * 2) * 360, y = 560 - u * 380; c.save(); c.globalAlpha = 1 - u; c.fillStyle = ['#F2C14E', '#EE5E9A', '#7CF29A'][i % 3]; c.beginPath(); c.ellipse(x, y, 26, 20, -0.4, 0, TAU); c.fill(); c.fillRect(x + 18, y - 90, 9, 90); c.restore(); }
  caption(c, t < bt ? '«НИЗКИЙ ЗАРЯД — 1%»' : t < toy ? '«BLUETOOTH ОТКЛЮЧЁН»' : 'ПИ-ПИ-ПИ-ПИ!', clamp(P(t, a + 0.15, a + 0.4)), 1500); if (t > toy) K.pop(c, t, 'ДЗЫНЬ-ДЗЫНЬ!', toy + 0.05, toy + 2, 540, 1280, C.gold, -0.08, 80); }
function phoneScreen(L, t) { return (cc, w, h) => { cc.fillStyle = '#1E2230'; cc.fillRect(0, 0, w, h);
  if (L === 'B1') { const ans = t > ev('B1', 'answer'); fitTxt(cc, ans ? '00:01' : 'INCOMING CALL', w / 2, 90, 26, '#BFC5CC', w - 40); cc.fillStyle = '#F7B6CF'; cc.beginPath(); cc.arc(w / 2, 250, 90, 0, TAU); cc.fill(); fitTxt(cc, 'M', w / 2, 254, 90, '#FFFFFF', 160);
    fitTxt(cc, 'MOM', w / 2, 400, 64, '#FFFFFF', w - 40); fitTxt(cc, 'CALLING…', w / 2, 460, 30, '#F7B6CF', w - 40);
    if (!ans) { cc.fillStyle = '#E0474C'; cc.beginPath(); cc.arc(110, h - 120, 52, 0, TAU); cc.fill(); const p = 1 + 0.12 * Math.sin(t * 12); cc.fillStyle = '#4CAF6A'; cc.beginPath(); cc.arc(w - 110, h - 120, 52 * p, 0, TAU); cc.fill(); cc.strokeStyle = '#FFFFFF'; cc.lineWidth = 8; cc.beginPath(); cc.moveTo(92, h - 138); cc.lineTo(128, h - 102); cc.moveTo(128, h - 138); cc.lineTo(92, h - 102); cc.stroke(); }
    else { cc.fillStyle = '#E0474C'; cc.beginPath(); cc.arc(w / 2, h - 120, 52, 0, TAU); cc.fill(); } return; }
  if (L === 'B2') { const n = ev('B2', 'notif'), s = ev('B2', 'swipe'); fitTxt(cc, '12:45', w / 2, 200, 110, '#FFFFFF', w - 40); fitTxt(cc, 'Saturday', w / 2, 290, 30, '#BFC5CC', w - 40);
    const k = eBack(P(t, n, n + 0.3), 1.6), out = eIn(P(t, s, s + 0.3)); if (k > 0) { cc.save(); cc.translate(-out * w * 1.2, (1 - k) * -200); cc.fillStyle = '#FFFDF8'; rr(cc, 14, 360, w - 28, 230, 22); cc.fill();
      cc.fillStyle = '#E0474C'; rr(cc, 34, 380, 56, 56, 14); cc.fill(); fitTxt(cc, 'R', 62, 410, 34, '#FFFFFF', 50); fitTxt(cc, 'CAR RENTAL', 108, 410, 26, '#3E471E', w - 150, 'Unb9', 'left');
      fitTxt(cc, 'Your rental ends', 34, 480, 30, '#2B2F3A', w - 70, 'Nun9', 'left'); fitTxt(cc, 'in 15 minutes.', 34, 524, 30, '#E0474C', w - 70, 'Nun9', 'left'); cc.restore(); } return; }
  if (L === 'C2') { cc.fillStyle = '#FFFDF8'; cc.fillRect(0, 0, w, h); cc.fillStyle = '#E0474C'; cc.fillRect(0, 0, w, 120); fitTxt(cc, "STEVE'S RENTALS", w / 2, 62, 30, '#FFFFFF', w - 40);
    fitTxt(cc, 'BOOKING CONFIRMED', w / 2, 175, 26, '#4CAF6A', w - 40);
    [['CUSTOMER:', 'KEVIN BROWN'], ['CAR:', 'RED SPORTS'], ['RENTAL:', '3 HOURS'], ['PRICE:', '$49.99']].forEach(([a, b], i) => { const y = 250 + i * 88; fitTxt(cc, a, 30, y, 24, '#8A8480', 160, 'Unb9', 'left'); fitTxt(cc, b, 30, y + 36, 32, i === 3 ? '#E0474C' : '#2B2F3A', w - 60, 'Unb9', 'left'); });
    cc.save(); cc.translate(w - 110, h - 130); cc.rotate(-0.25); cc.strokeStyle = '#4CAF6A'; cc.lineWidth = 6; rr(cc, -90, -40, 180, 80, 12); cc.stroke(); fitTxt(cc, 'APPROVED', 0, -8, 24, '#4CAF6A', 160); fitTxt(cc, 'by Steve', 0, 22, 20, '#4CAF6A', 160, 'Cav7'); cc.restore(); } }; }
function phoneView(c, t, L) { backdrop(c, 'phone'); const rot = L === 'B1' && t < ev('B1', 'answer') ? Math.sin(t * 40) * 0.03 : 0;
  K.phone(c, 540, 860, 1.4, phoneScreen(L, t), rot);
  if (L === 'B1') caption(c, t < ev('B1', 'answer') ? '«МАМА ЗВОНИТ…»' : '*берёт трубку*', 1, 1530);
  if (L === 'B2') caption(c, '«АРЕНДА ЗАКАНЧИВАЕТСЯ ЧЕРЕЗ 15 МИНУТ»', clamp(P(t, ev('B2', 'notif') + 0.3, ev('B2', 'notif') + 0.5)) * (1 - P(t, ev('B2', 'swipe'), ev('B2', 'swipe') + 0.2)), 1530);
  if (L === 'C2') caption(c, '«КЛИЕНТ: КЕВИН. АРЕНДА: 3 ЧАСА. $49.99»', clamp(P(t, ev('C2', 'doc') + 0.3, ev('C2', 'doc') + 0.5)), 1530); }
function plateView(c, t) { backdrop(c, 'plate'); const a = ev('C1', 'plate'), k = eBack(P(t, a, a + 0.3), 1.6);
  c.save(); c.translate(540, 800); c.scale(k, k); c.fillStyle = '#E0474C'; rr(c, -520, -260, 1040, 520, 40); c.fill();                // car rear
  c.fillStyle = '#FFFDF8'; rr(c, -380, -110, 760, 220, 20); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 10; rr(c, -380, -110, 760, 220, 20); c.stroke();
  fitTxt(c, 'RENT 001', 0, -8, 130, '#2B2F3A', 680); fitTxt(c, "STEVE'S RENTALS", 0, 80, 30, '#E0474C', 680); c.restore();
  caption(c, '«ПРОКАТ STEVE\'S RENTALS»', clamp(P(t, a + 0.3, a + 0.5)), 1300); }

// ---------------- cover badge + frame
function coverBadge(c, t) { const p = 1 + 0.04 * Math.sin(t * 8); c.save(); c.translate(540, 1630); c.scale(p, p); c.rotate(-0.03); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -330 + 6, -62 + 10, 660, 124, 62); c.fill(); c.fillStyle = '#F2C14E'; rr(c, -330, -62, 660, 124, 62); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; rr(c, -330, -62, 660, 124, 62); c.stroke();
  fitTxt(c, 'MILLIONAIRE?!', 0, 4, 62, C.oliveD, 600); c.restore(); }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { K.outro(c, t, { q: ['А ТЫ ПЫТАЛСЯ', 'КАЗАТЬСЯ БОГАЧЕ?'], rows: [['A2', 'How much did they cost?'], ['B1', 'What do you do for a living?'], ['C1', "I'd prefer to keep it private."], ['C2', 'Technically, I never said that…']], cta: ['ОТПРАВЬ ДРУГУ-', '«МИЛЛИОНЕРУ»'], heroX: 190, heroS: 0.42,
    hero: (cc, tt) => { const g = G.rich, go = G.owner; K.put(cc, OWNER, { t: tt, mood: 'smug', turn: -0.2, look: -0.4, armL: hang(go, -1), armR: reach(go, 1, go.sw * 2.0, go.ySh - 330 + Math.sin(tt * 8) * 30, { planar: true }), items: { R: keyItem } }, 1500, 60);
      K.put(cc, RICH, { t: tt, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(tt * 8) * 30, { planar: true }), armR: hang(g, 1), front: (c2, gg) => shades(c2, gg, g, 0) }, 0, 0); } });
    Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag === 'ui:black') { c.fillStyle = '#000000'; c.fillRect(0, 0, W, HH); UI.watermark(c); return; }
  if (tag.startsWith('ui:')) { c.save(); c.translate(sh.x, sh.y); const v = tag.slice(3);
    if (v === 'key') keyView(c, t); else if (v === 'watch') watchView(c, t); else if (v === 'phone') phoneView(c, t, L); else if (v === 'plate') plateView(c, t); else if (v === 'doc') phoneView(c, t, 'C2');
    c.restore(); heads = { rich: OFFL, owner: OFF, passer: OFF, mom: { x: W - 60, y: 1150, hh: 1 } }; proj = p => p; }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26); }
  const hp = who => heads[who] && Math.abs(heads[who].x) < 1e4 ? { ...proj(heads[who]), hh: heads[who].hh * cam.z } : null;
  const names = { owner: ['STEVE', '#3E7A4A'], passer: ['STRANGER', '#8C9A5A'], mom: ['MOM', '#EE5E9A'] };
  if (L === 'hook') { if (tag === 'cover') coverBadge(c, t);
    const hookProj = p => { const q = proj(p); return q.x < 0 || q.x > W ? { x: q.x < 0 ? 60 : W - 60, y: 1050 } : q; };
    K.bubbles(c, t, { id: 'hook' }, heads, hookProj, { cleanChunks: true, heroine: 'rich', names, hold: { hook_m: 0.2, hook_f: 0.2, hook_m2: 0.05 } }); K.titleRibbon(c, t, 540, 455); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); UI.captions(c, t);
    Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  const e = k => ev(L, k), narT = (SP[L.toLowerCase() + '_nar'] || { t: 1e9 }).t;
  if (L === 'A1' && t > e('alarm') && t < e('hide') - 0.05) K.pop(c, t, 'УИ-У! УИ-У!', e('alarm') + 0.05, e('hide') - 0.3, 700, 1250, C.gold, -0.08, 80);
  if (L === 'B1' && t > e('stare') && t < narT - 0.2) K.pop(c, t, 'ДЕЛОВАЯ ВСТРЕЧА?', e('stare') + 0.05, narT - 0.4, 540, 1520, C.pinkL, -0.06, 64);
  if ((L === 'A2' || L === 'B2') && tag === 'rich') { const id = L === 'A2' ? 'a2_m3' : 'b2_m3', h = hp('rich'); if (h && t > SP[id].t) sweat(c, h, clamp(P(t, SP[id].t + 0.2, SP[id].t + 0.5)), 1); }
  if (L === 'C1' && tag === 'rich' && t > e('freeze')) { const h = hp('rich'); if (h) { sweat(c, h, clamp(P(t, e('freeze'), e('freeze') + 0.3)), 1); sweat(c, { ...h, y: h.y + h.hh * 0.5 }, clamp(P(t, e('freeze') + 0.3, e('freeze') + 0.6)), -1); } }
  if (L === 'C2') { if (t > e('pause') && t < SP.c2_f2.t - 0.05) K.dots(c, t, e('pause') + 0.05, SP.c2_f2.t - 0.05, 1450);
    if (t > e('hand') && t < SP.c2_f5.t - 0.05) K.dots(c, t, e('hand') + 0.05, SP.c2_f5.t - 0.05, 1450);
    if (t > e('drive') && t < e('pass') - 0.9) K.pop(c, t, 'ВЖУХ!', e('drive') + 0.3, e('pass') - 1.1, 420, 1250, C.gold, -0.1, 110);
    if (t > e('fob') && t < e('black') - 0.05) K.pop(c, t, 'пи-пи…', e('fob') + 0.15, e('black') - 0.1, 760, 1250, C.white, -0.06, 80); }
  K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, heroine: 'rich', names, hold: { b1_m2: 0.05, c1_f3: 0.05, c2_f3: 0.05, a2_m2: 0.05, b2_m2: 0.05, a1_m2: 0.4, a2_m3: 0.5, b1_m3: 0.6, b2_m3: 0.5, c2_m2: 0.4, c2_m4: 0.5, c2_m5: 0.4 } });
  K.hud(c, t, sc);
}
E.run('rich', NF, renderFrame);
