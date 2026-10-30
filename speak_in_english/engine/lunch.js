// "How to say 'that's my lunch'" episode renderer (hard_cut camera): node lunch.js start end out.mp4 | --png=f1,f2
// Office kitchenette: Anna (pink sweater) at the left, Dan (green polo) at the open fridge on the right, a little table with her pink mug between them.
// Shots tagged 'ui:<view>' (label, black) replace the world with a full-screen insert.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/lunch/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];

// ---------------- cast
const HER = { ...BASE.her_lift, top: { type: 'sweater', col: '#EF7FAA' }, bottom: { type: 'trousers', col: '#3B3550' }, shoes: { col: '#2B2F3A', acc: '#EE5E9A' } };
const DAN = { ...BASE.tom, top: { type: 'polo', col: '#6FA68C', col2: '#FFFFFF' }, bottom: { type: 'trousers', col: '#4A4F5C' }, shoes: { col: '#3A2A20', acc: null } };
const G = { her: geom(HER), coll: geom(DAN) };
const HX = -380, DX = 430, TX = -40, TABLE = -640;          // her / Dan feet x, bistro table centre + top height
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- props held in a hand (origin = hand, drawn upwards)
const boxItem = (ctx) => { ctx.save(); ctx.rotate(-0.06); ctx.fillStyle = '#EE5E9A'; rr(ctx, -100, -130, 200, 36, 8); ctx.fill(); fitTxt(ctx, 'ANNA', 0, -112, 24, '#FFFDF8', 160);
  ctx.fillStyle = '#F4F6F8'; ctx.strokeStyle = '#B9C0C8'; ctx.lineWidth = 4; rr(ctx, -96, -92, 192, 92, 12); ctx.fill(); ctx.stroke();
  ['#E8A24A', '#C9473A', '#F2D27A', '#C9473A', '#E8A24A'].forEach((col, i) => { ctx.fillStyle = col; ctx.fillRect(-84, -84 + i * 15, 168, 12); }); ctx.restore(); };
const forkItem = (ctx, bite = true) => { ctx.save(); ctx.rotate(0.12); ctx.strokeStyle = '#9AA3B2'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 20); ctx.lineTo(0, -150); ctx.stroke();
  for (const dx of [-16, 0, 16]) { ctx.beginPath(); ctx.moveTo(dx, -150); ctx.lineTo(dx, -210); ctx.stroke(); }
  if (bite) { ctx.fillStyle = '#E8A24A'; rr(ctx, -34, -250, 68, 56, 12); ctx.fill(); ctx.fillStyle = '#C9473A'; ctx.fillRect(-30, -226, 60, 14); } ctx.restore(); };
const mugItem = (ctx) => { ctx.fillStyle = '#EE5E9A'; rr(ctx, -38, -96, 76, 96, 14); ctx.fill(); ctx.strokeStyle = '#EE5E9A'; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(46, -50, 26, -1.2, 1.2); ctx.stroke(); fitTxt(ctx, 'ANNA', 0, -52, 22, '#FFFDF8', 64); };
function bagItem(ctx, t = 0, stink = 0) { ctx.save(); ctx.rotate(0.05); ctx.fillStyle = '#C9A878'; ctx.strokeStyle = '#8A6A44'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-70, 0); ctx.lineTo(-80, -170); ctx.lineTo(80, -170); ctx.lineTo(70, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(90,70,30,.35)'; for (const [x, y, r] of [[-30, -60, 22], [28, -110, 16], [10, -30, 12]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
  ctx.fillStyle = '#B8935E'; ctx.beginPath(); ctx.moveTo(-82, -170); ctx.lineTo(-60, -205); ctx.lineTo(60, -205); ctx.lineTo(82, -170); ctx.closePath(); ctx.fill(); ctx.stroke();
  if (stink > 0) { ctx.globalAlpha = Math.min(1, stink); ctx.strokeStyle = '#7CC45A'; ctx.lineWidth = 12; ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i++) { ctx.beginPath(); for (let k = 0; k <= 10; k++) { const y = -215 - k * 30, x = i * 55 + Math.sin(k * 0.9 + t * 7 + i) * 22; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
    ctx.fillStyle = 'rgba(124,196,90,.45)'; for (const [x, y, r] of [[-60, -330, 52], [30, -400, 64], [70, -300, 42], [-10, -280, 36]]) { ctx.beginPath(); ctx.arc(x + Math.sin(t * 3 + x) * 8, y, r, 0, TAU); ctx.fill(); }
    const fx = Math.sin(t * 5) * 120, fy = -440 + Math.cos(t * 7) * 40; ctx.fillStyle = '#2B2F3A'; ctx.beginPath(); ctx.ellipse(fx, fy, 12, 8, 0, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(200,230,255,.7)'; ctx.beginPath(); ctx.ellipse(fx - 8, fy - 12, 12, 6, -0.6, 0, TAU); ctx.ellipse(fx + 8, fy - 12, 12, 6, 0.6, 0, TAU); ctx.fill(); }
  ctx.restore(); }

// ---------------- kitchenette (prerendered, softly blurred)
const BX0 = -2200, BY0 = -3400, BW = 4400, BH = 4800, BS = 0.5;
function drawKitchen(c) {
  c.fillStyle = '#DCEBE2'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = '#EEF6F1'; c.fillRect(BX0, -1750, BW, 880); c.strokeStyle = 'rgba(0,0,0,.07)'; c.lineWidth = 4; for (let x = BX0; x < BX0 + BW; x += 140) { c.beginPath(); c.moveTo(x, -1750); c.lineTo(x, -870); c.stroke(); } for (let y = -1750; y < -860; y += 140) { c.beginPath(); c.moveTo(BX0, y); c.lineTo(BX0 + BW, y); c.stroke(); }
  c.fillStyle = '#FFFDF8'; rr(c, -430, -2350, 520, 640, 16); c.fill(); c.fillStyle = '#BFE3F7'; rr(c, -406, -2326, 472, 592, 10); c.fill(); c.fillStyle = '#FFFDF8'; c.fillRect(-176, -2326, 16, 592);
  c.fillStyle = '#9FB8CC'; for (let i = 0; i < 3; i++) c.fillRect(-380 + i * 130, -1734 - 220 - i * 60, 100, 220 + i * 60);
  // poster: LABEL YOUR FOOD
  c.save(); c.translate(-1250, -1500); c.rotate(-0.03); c.fillStyle = '#FFF4B8'; rr(c, -260, -320, 520, 640, 10); c.fill(); fitTxt(c, 'KITCHEN', 0, -220, 78, '#2B2F3A', 460); fitTxt(c, 'RULES', 0, -130, 78, '#2B2F3A', 460); fitTxt(c, '1. LABEL', 0, 0, 62, '#E0474C', 460); fitTxt(c, 'YOUR FOOD', 0, 80, 62, '#E0474C', 460); fitTxt(c, '2. BE NICE', 0, 200, 56, '#2B2F3A', 460); c.restore();
  // upper cabinets + counter (left)
  c.fillStyle = '#C98B5A'; for (let i = 0; i < 3; i++) { rr(c, -2100 + i * 400 + (i > 0 ? 60 : 0), -2100, 380, 520, 12); c.fill(); c.fillStyle = '#E3B58A'; c.fillRect(-1760 + i * 400 + (i > 0 ? 60 : 0), -1820, 14, 90); c.fillStyle = '#C98B5A'; }
  c.fillStyle = '#B87A4A'; c.fillRect(-2100, -860, 1400, 600); c.fillStyle = '#F3EDDF'; c.fillRect(-2120, -900, 1440, 50); c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 5; for (let x = -2100; x <= -700; x += 350) { c.beginPath(); c.moveTo(x, -850); c.lineTo(x, -260); c.stroke(); }
  c.fillStyle = '#2B2F3A'; rr(c, -1650, -1230, 260, 330, 14); c.fill(); c.fillStyle = '#E0474C'; c.fillRect(-1600, -1180, 160, 40); c.fillStyle = '#5A606E'; c.fillRect(-1560, -1100, 80, 120);              // coffee machine
  c.fillStyle = '#9AA3B2'; rr(c, -1200, -1170, 360, 270, 14); c.fill(); c.fillStyle = '#2B2F3A'; rr(c, -1170, -1140, 220, 210, 8); c.fill(); c.fillStyle = '#4CAF6A'; c.beginPath(); c.arc(-900, -1000, 20, 0, TAU); c.fill();   // microwave
  // floor
  c.fillStyle = '#C9B896'; c.fillRect(BX0, -260, BW, 1700); c.fillStyle = 'rgba(0,0,0,.06)'; for (let y = -260; y < 1400; y += 160) for (let x = BX0 + ((y / 160) % 2) * 160; x < BX0 + BW; x += 320) c.fillRect(x, y, 160, 160);
  // fridge (open): body, lit interior, shelves, the door swung towards the viewer's left
  c.fillStyle = '#DDE3EA'; rr(c, 300, -2080, 700, 1840, 24); c.fill(); c.strokeStyle = '#9AA3B2'; c.lineWidth = 8; c.stroke();
  const gl = c.createLinearGradient(0, -2000, 0, -300); gl.addColorStop(0, '#FFFFFF'); gl.addColorStop(1, '#E6F3FA'); c.fillStyle = gl; rr(c, 360, -2010, 580, 1700, 14); c.fill();
  c.strokeStyle = '#B9C6D2'; c.lineWidth = 12; for (const y of [-1560, -1130, -700]) { c.beginPath(); c.moveTo(360, y); c.lineTo(940, y); c.stroke(); }
  c.fillStyle = '#FFFDF8'; rr(c, 400, -1760, 90, 200, 10); c.fill(); fitTxt(c, 'MILK', 445, -1660, 28, '#3C6FB4', 80);                                                                                             // milk
  for (let i = 0; i < 3; i++) { c.fillStyle = ['#F2B6B0', '#F2C14E', '#C9DDB0'][i]; rr(c, 560 + i * 90, -1660, 74, 100, 10); c.fill(); }
  c.fillStyle = '#FFFDF8'; rr(c, 760, -1730, 130, 170, 10); c.fill(); fitTxt(c, 'GREG', 825, -1670, 30, '#E0474C', 110); fitTxt(c, 'DON\'T', 825, -1625, 22, '#E0474C', 110);
  c.fillStyle = '#7CC45A'; rr(c, 410, -1260, 300, 70, 30); c.fill(); fitTxt(c, 'SAD CUCUMBER', 560, -1225, 24, '#2B2F3A', 280);
  c.fillStyle = '#F4E3B0'; rr(c, 760, -1290, 150, 160, 10); c.fill();
  c.fillStyle = '#C23C4A'; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(430 + i * 62, -770, 28, 0, TAU); c.fill(); }
  c.fillStyle = '#C9473A'; rr(c, 700, -840, 220, 130, 10); c.fill(); fitTxt(c, 'KETCHUP', 810, -775, 28, '#FFFDF8', 190);
  paint(c, q => { q.m(200, -2060); q.l(310, -2040); q.l(310, -250); q.l(200, -230); q.z(); }, '#C9D1DA', { sd: 6, hd: 3, lw: 4 });                                                                                          // open door edge
  c.fillStyle = '#EE5E9A'; rr(c, 218, -1700, 56, 56, 8); c.fill(); c.fillStyle = '#F2C14E'; rr(c, 222, -1500, 48, 48, 8); c.fill();
  // cold light on the floor
  const fl = c.createRadialGradient(560, -240, 40, 560, -240, 900); fl.addColorStop(0, 'rgba(255,255,255,.55)'); fl.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = fl; c.beginPath(); c.ellipse(560, -80, 900, 260, 0, 0, TAU); c.fill();
  // bistro table
  c.fillStyle = '#8A6A44'; c.fillRect(TX - 14, TABLE, 28, -TABLE); c.fillStyle = '#6A4A2A'; c.beginPath(); c.ellipse(TX, 0, 150, 30, 0, 0, TAU); c.fill(); c.fillStyle = '#B98556'; c.beginPath(); c.ellipse(TX, TABLE, 200, 44, 0, 0, TAU); c.fill(); c.strokeStyle = '#8A6A44'; c.lineWidth = 6; c.stroke();
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };   // drawn sharp, blurred once
const BGK = mkBG(drawKitchen);

// ---------------- characters
const gest = (st, g, who, t, side, base) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } };
const hang = (g, s) => reach(g, s, s * g.sw * 0.8, g.ySh + 330);
const chest = (g, s, k = 0.6) => reach(g, s, s * g.sw * k, g.ySh + 230);
const mouth = (g, s) => reach(g, s, s * g.hw * 1.35, g.headY + g.hh * 1.7);
const mugTaken = t => t > ev('B2', 'mug') + 0.35 && !(t < ev('B2', 'mug'));
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { t, talk: talk('her', t), mood: 'neutral', turn: 0.3, look: 0.7, armL: hang(g, -1), armR: hang(g, 1), items: {} };
  if (L === 'hook') { st.mood = 'neutral'; if (t > hev('shock') - 0.05) { st.mood = 'shock'; st.blink = 0; st.armL = chest(g, -1); st.armR = chest(g, 1); } }
  if (L === 'A1') { st.mood = 'annoyed'; if (speaking('a1_h', t, 0.05, 0.3)) { st.mood = 'angry'; gest(st, g, 'her', t, -1, 150); } if (t > ev('A1', 'offer')) st.mood = 'worried'; }
  if (L === 'A2') { st.mood = 'annoyed'; if (speaking('a2_h', t, 0.05, 0.3)) { st.mood = 'angry'; st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 80, { planar: true, fist: true }); st.armR = reach(g, 1, g.sw * 1.6, g.ySh - 80, { planar: true, fist: true }); } if (speaking('a2_c', t, 0.05, 0.8)) st.mood = 'skeptical'; }
  if (L === 'B1') { st.mood = 'neutral'; if (speaking('b1_h', t, 0.05, 0.3)) { st.mood = 'smug'; gest(st, g, 'her', t, -1, 160); } if (speaking('b1_h2', t, 0.05, 0.3)) st.mood = 'annoyed'; if (t > SP.b1_c2.t) { st.mood = 'bored'; st.blink = 0; } }
  if (L === 'B2') { st.mood = 'annoyed'; if (speaking('b2_h', t, 0.05, 0.3)) { st.mood = 'angry'; gest(st, g, 'her', t, -1, 120); } if (t > e('mug')) { st.mood = 'shock'; st.turn = 0.5; st.look = 1; } }
  if (L === 'C1') { st.mood = 'neutral'; if (speaking('c1_h', t, 0.05, 0.3)) { st.mood = 'smug'; gest(st, g, 'her', t, -1, 160); } if (t > SP.c1_c.t) st.mood = 'annoyed'; if (t > e('stare') - 0.05) { st.mood = 'annoyed'; st.blink = 0; st.armL = hang(g, -1); } }
  if (L === 'C2') { st.mood = 'angry'; st.turn = 0.4; st.look = 0.6;
    if (speaking('c2_h', t, 0.05, 0.1)) { st.mood = 'angry'; st.armL = reach(g, -1, -g.sw * 1.7, g.ySh - 120, { planar: true, fist: true }); st.armR = reach(g, 1, g.sw * 1.7, g.ySh - 120, { planar: true, fist: true }); }
    if (t > endOf('c2_h') + 0.1) { st.mood = 'neutral'; st.blink = 0; }
    if (t > SP.c2_c.t) st.mood = 'surprised'; if (speaking('c2_h2', t, 0.05, 0.3)) { st.mood = 'happy'; st.armL = chest(g, -1); st.armR = chest(g, 1); }
    if (t > e('stink') - 0.05) { st.mood = 'shock'; st.blink = 0; st.turn = 0.1; st.look = 0.3; st.armL = reach(g, -1, -g.hw * 0.5, g.headY + g.hh * 0.6); st.armR = reach(g, 1, g.hw * 0.5, g.headY + g.hh * 0.6); }
    if (speaking('c2_h3', t, 0.05, 0.6)) { st.mood = 'sad'; st.blink = 1; } }
  return st; }
function danState(t, L) { const g = G.coll, e = k => ev(L, k), st = { t, talk: talk('coll', t), mood: 'happy', turn: -0.35, look: -0.8, armL: mouth(g, -1), armR: reach(g, 1, g.sw * 0.9, g.ySh + 170), items: { L: forkItem, R: boxItem }, headX: 0 };
  if (L === 'hook') { st.turn = 0.15; st.look = 0.2; if (t > hev('shock') - 0.05) { st.turn = -0.4; st.look = -0.8; st.armL = reach(g, -1, -g.sw * 0.5, g.ySh + 180); } }
  if (L === 'A1') { st.mood = 'surprised'; st.armL = reach(g, -1, -g.sw * 0.5, g.ySh + 180); if (t > e('offer') - 0.4) { st.mood = 'happy'; st.armL = reach(g, -1, -g.sw * 2.0, g.ySh - 40, { planar: true }); } }
  if (L === 'A2') { st.mood = 'neutral'; st.armL = reach(g, -1, -g.sw * 0.5, g.ySh + 180); if (t > e('shrug') - 0.05) { st.mood = 'smug'; st.armL = reach(g, -1, -g.sw * 1.4, g.ySh + 20); st.armR = reach(g, 1, g.sw * 1.4, g.ySh + 20); st.tilt = Math.sin(P(t, e('shrug'), e('shrug') + 0.5) * TAU) * 0.06; } }
  if (L === 'B1') { st.mood = 'neutral'; st.armL = reach(g, -1, -g.sw * 0.5, g.ySh + 180); if (speaking('b1_c', t, 0.05, 0.3)) { st.mood = 'worried'; st.lookY = 0.4; } if (speaking('b1_c2', t, 0.05, 0.3)) { st.mood = 'happy'; st.laugh = true; } }
  if (L === 'B2') { st.mood = 'happy'; st.armL = reach(g, -1, -g.sw * 0.5, g.ySh + 180); const m = e('mug'), s = e('sip');
    if (t > m - 0.2) { st.items = { L: t > m + 0.35 ? mugItem : forkItem, R: boxItem }; st.armL = reach(g, -1, TX - DX + 40, TABLE - 40, { planar: true }); }
    if (t > m + 0.45) st.armL = reach(g, -1, lerp(TX - DX + 40, -g.hw * 0.7, eOut(P(t, m + 0.45, s))), lerp(TABLE - 40, g.headY + g.hh * 0.9, eOut(P(t, m + 0.45, s))), { planar: true });
    if (t > s) { st.armL = mouth(g, -1); st.mood = 'smug'; st.blink = 0; } }
  if (L === 'C1') { st.mood = 'happy'; st.items = { L: mugItem, R: boxItem }; st.armL = mouth(g, -1); if (speaking('c1_c', t, 0.05, 0.3)) { st.mood = 'happy'; st.armL = reach(g, -1, -g.sw * 0.9, g.ySh + 20); } if (t > e('stare') - 0.05) { st.mood = 'neutral'; st.armL = reach(g, -1, -g.sw * 0.5, g.ySh + 180); } }
  if (L === 'C2') { st.items = { L: mugItem, R: boxItem }; st.mood = 'happy'; st.armL = reach(g, -1, -g.sw * 0.5, g.ySh + 180);
    if (t > e('think') - 0.05) { st.mood = 'neutral'; st.blink = 0; st.armL = reach(g, -1, -g.hw * 0.5, g.headY + g.hh * 0.8); st.lookY = -0.3; }
    if (speaking('c2_c', t, 0.05, 0.1)) { st.mood = 'worried'; st.lookY = 0; st.armL = reach(g, -1, -g.sw * 0.5, g.ySh + 180); }
    if (t > e('open') - 0.05) { const k = clamp(eOut(P(t, e('open'), e('open') + 0.4))), s = clamp(eOut(P(t, e('stink'), e('stink') + 0.6))); st.items = { L: ctx => bagItem(ctx, t, s), R: boxItem }; st.armL = reach(g, -1, -g.sw * lerp(0.5, 2.0, k), g.ySh + lerp(180, -60, k), { planar: true }); st.mood = 'happy';
      if (t > e('stink') - 0.05) { st.mood = 'smug'; st.laugh = true; } } }
  return st; }

// ---------------- the world + which characters a shot draws (clean singles: only the tagged character)
const DRAW = { wide: ['her', 'coll'], card: ['her', 'coll'], two: ['her', 'coll'], her: ['her'], coll: ['coll'], cover: ['her', 'coll'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGK, BX0, BY0, BW, BH);
  if (!(mugTaken(t) && L !== 'hook') && !(L === 'B2' && t > ev('B2', 'mug') + 0.35) && !['C1', 'C2'].includes(L)) { c.save(); c.translate(TX, TABLE - 8); mugItem(c); c.restore(); }
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), HX, 0);
  if (who.includes('coll')) heads.coll = K.put(c, DAN, danState(t, L), DX, 0);
  if (!heads.coll) heads.coll = OFF; if (!heads.her) heads.her = OFFL;
  return heads; }

// ---------------- shots (world coordinates; face of a single at ~900 px)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const hHY = G.her.headY, dHY = G.coll.headY;
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const SH = { COVER: S(150, fy((hHY + dHY) / 2, 0.78, 1120), 0.78, 'cover'), WIDE: S(20, -1000, 0.5, 'wide'), CARD: S(30, fy(dHY, 0.66, 980), 0.66, 'card'), TWO: S(30, fy(dHY, 0.75, 820), 0.75, 'two'),
  HER: S(HX + 40, fy(hHY, 1.0), 1.0, 'her'), HER_R: S(HX + 40, fy(hHY, 1.0, 1120), 1.0, 'her'), HER_CU: S(HX + 30, fy(hHY, 1.6, 960), 1.6, 'her'),
  DAN: S(DX - 40, fy(dHY, 1.0), 1.0, 'coll'), DAN_H: S(DX - 40, fy(dHY, 1.0, 1230), 1.0, 'coll'), HER_H: S(HX + 40, fy(hHY, 1.35, 1280), 1.35, 'her'), DAN_R: S(DX - 40, fy(dHY, 1.0, 1120), 1.0, 'coll'), DAN_CU: S(DX - 30, fy(dHY, 1.6, 960), 1.6, 'coll'),
  LABEL: U('label', 1), BLACK: U('black', 2) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  const sp = id => speaking(id, t, 0.1, 0.15);
  if (L === 'hook') { if (t < SP.hook_c.t - 0.12) return SH.COVER; if (t < hev('shock') - 0.05) return f(SH.DAN_H); if (t < SP.hook.t - 0.1) return f(SH.HER_H); return f(SH.COVER); }
  const u = t - sc.s, l = L.toLowerCase(), nar = SP[l + '_nar'];
  if (u < 1.15) return f(SH.WIDE);
  if (L === 'C2' && t > e('black') - 0.03 && t < nar.t + 0.05) return f(SH.BLACK);
  if (nar && t >= nar.t - 0.1) return f(SH.CARD);
  if (L === 'A1' && t > e('offer') - 0.05) return f(SH.WIDE);
  if (L === 'A2' && t > e('shrug') - 0.05) return f(SH.WIDE);
  if (L === 'B1') { if (t > e('label') - 0.05 && t < SP.b1_c2.t - 0.1) return f(SH.LABEL); }
  if (L === 'B2' && t > e('mug') - 0.05) return f(SH.WIDE);
  if (L === 'C1' && t > e('stare') - 0.05) return f(SH.HER_CU);
  if (L === 'C2') { if (sp('c2_h')) { const ch = (TL.cfg.chunks || {}).c2_h, p = SP.c2_h, w = p.words || [], cnt = ch.map(([en]) => en.trim().split(/\s+/).length), tot = cnt.reduce((a, b) => a + b, 0); let wi = 0, i = 0;
      ch.forEach((q, k) => { const a = w.length === tot ? p.t + w[wi][1] : p.t + p.d * k / ch.length; if (t >= a - 0.05) i = k; wi += cnt[k]; }); return f([SH.HER, SH.HER_CU, SH.HER, SH.HER_CU, SH.HER][i] || SH.HER); }
    if (t > endOf('c2_h') && t < e('think') + 0.9) return f(SH.WIDE); if (t >= e('think') + 0.9 && t < SP.c2_c.t - 0.1) return f(SH.DAN_CU);
    if (t > e('open') - 0.05 && t < SP.c2_h2.t - 0.1) return f(SH.WIDE); if (t > e('stink') - 0.05 && t < SP.c2_h3.t - 0.1) return f(SH.WIDE); if (sp('c2_h3')) return f(SH.HER_CU); }
  const cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.1 && t < s.t + s.d + 0.25);
  const single = who => who === 'her' ? SH.HER : SH.DAN;
  if (cur) return f(single(cur.who));
  const next = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.6 && t < s.t);
  if (next) return f(single(next.who));
  return SH.TWO; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- full-screen insert: the lunch box lid with the label
function backdrop(c, id) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, '#2B3040'); g.addColorStop(1, '#171A24'); c.fillStyle = g; c.fillRect(0, 0, W, HH); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id }); }
function caption(c, s, k = 1, y = 1530, col = C.pinkL) { if (k <= 0) return; c.save(); c.globalAlpha = k; UI.textFit(c, 'Nun9', 46, s, 960); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, s, 540, y, col, C.oliveD, 10); c.restore(); }
function labelView(c, t) { backdrop(c, 'label'); const a = ev('B1', 'label'), k = eBack(P(t, a, a + 0.3), 1.6);
  c.save(); c.translate(540, 1280); c.scale(k * 2.4, k * 2.4); c.rotate(-0.04); boxItem(c); c.translate(0, -30);
  c.fillStyle = '#FFF4B8'; c.save(); c.rotate(0.08); rr(c, -80, -150, 160, 110, 6); c.fill(); fitTxt(c, 'ANNA', 0, -92, 54, '#E0474C', 140, 'Cav7'); c.restore(); c.restore();
  caption(c, '«НА КРЫШКЕ НАПИСАНО: «ANNA»»', clamp(P(t, a + 0.3, a + 0.5)), 1500); }

// ---------------- cover badge + frame
function coverBadge(c, t) { const p = 1 + 0.04 * Math.sin(t * 8); c.save(); c.translate(540, 1640); c.scale(p, p); c.rotate(-0.03); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -330 + 6, -62 + 10, 660, 124, 62); c.fill(); c.fillStyle = '#FFE15A'; rr(c, -330, -62, 660, 124, 62); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; rr(c, -330, -62, 660, 124, 62); c.stroke();
  fitTxt(c, 'WHOSE LUNCH?', 0, 4, 60, '#E0474C', 600); c.restore(); }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { K.outro(c, t, { q: ['А КАК БЫ ТЫ СКАЗАЛ', 'КОЛЛЕГЕ?'], rows: [['A2', 'Why did you eat my lunch?'], ['B1', "I think that's my lunch."], ['B2', "Don't help yourself to my food."], ['C1', "I'd appreciate it if you could ask first."]], cta: ['ОТПРАВЬ КОЛЛЕГЕ,', 'КОТОРЫЙ ЕСТ ЧУЖОЕ'], heroX: 190, heroS: 0.42,
    hero: (cc, tt) => { const g = G.her, gd = G.coll; K.put(cc, DAN, { t: tt, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, armL: reach(gd, -1, -gd.sw * 2.0, gd.ySh - 330 + Math.sin(tt * 8) * 30, { planar: true }), armR: hang(gd, 1), items: { R: boxItem } }, 1500, 60);
      K.put(cc, HER, { t: tt, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(tt * 8) * 30, { planar: true }), armR: hang(g, 1), items: { R: mugItem } }, 0, 0); } });
    Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag === 'ui:black') { c.fillStyle = '#000000'; c.fillRect(0, 0, W, HH); UI.watermark(c); return; }
  if (tag.startsWith('ui:')) { c.save(); c.translate(sh.x, sh.y); labelView(c, t); c.restore(); heads = { her: OFFL, coll: OFF }; proj = p => p; }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26); }
  const names = { coll: ['DAN', '#6FA68C'] };
  if (L === 'hook') { if (tag === 'cover') coverBadge(c, t);
    const hookProj = p => { const q = proj(p); return q.x < 0 || q.x > W ? { x: q.x < 0 ? 60 : W - 60, y: 1050 } : q; };
    K.bubbles(c, t, { id: 'hook' }, heads, hookProj, { cleanChunks: true, names, hold: { hook_c: 0.05, hook_h: 0.3 } }); K.titleRibbon(c, t, 540, 455); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); UI.captions(c, t);
    Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  const e = k => ev(L, k), narT = (SP[L.toLowerCase() + '_nar'] || { t: 1e9 }).t;
  if (L === 'A1' && t > e('offer') && t < narT - 0.1) K.pop(c, t, 'ХОЧЕШЬ?', e('offer') + 0.05, narT - 0.2, 540, 1330, C.gold, -0.06, 80);
  if (L === 'B2' && t > e('mug') && t < narT - 0.1) K.pop(c, t, 'ЭТО ЖЕ МОЁ КОФЕ!', e('mug') + 0.1, narT - 0.2, 540, 1330, C.gold, -0.06, 66);
  if (L === 'C1' && t > e('stare') && t < narT - 0.05) K.dots(c, t, e('stare') + 0.05, narT - 0.05, 1450);
  if (L === 'C2') { if (t > e('think') && t < SP.c2_c.t - 0.05) K.dots(c, t, e('think') + 0.05, SP.c2_c.t - 0.05, 1450);
    if (t > e('stink') && t < SP.c2_h3.t - 0.05) K.pop(c, t, 'ФУУУ!', e('stink') + 0.1, SP.c2_h3.t - 0.1, 540, 1330, C.gold, -0.06, 90); }
  K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names, hold: { a1_c: 0.4, b1_h2: 0.05, b1_c2: 0.4, b2_c: 0.05, c1_c: 0.4, c2_c: 0.3, c2_h2: 0.4, c2_h3: 0.6 } });
  K.hud(c, t, sc);
}
E.run('lunch', NF, renderFrame);
