// "Свекровь: ты поправилась?" — rubric «Как ответить, когда…» (scene + 3 answers, worst -> best), hard_cut camera: node gained.js start end out.mp4 | --png=f1,f2
// Family dinner at home: one long table seen from the front, everyone seated behind it facing the camera:
// Tom (husband, silent until the twist) | the heroine (teal dinner dress) | Rose (mother-in-law, cardigan + pearls, leans in) | Nana | Greg.
// The big pink cake on a stand in the middle of the table is the key prop.
// o1 «В ЛОБ»: relatives gasp, Greg drops his fork, Rose's jaw drops, the chandelier goes out (room dims).
// o2 «ВЕЖЛИВО»: Rose pushes a HUGE slice of cake in front of her. o3 «КАК НОСИТЕЛЬ»: Rose deflates (squash + air puffs, "pfff").
// Twist: Tom: "Mum... you've put on a bit too." -> Rose chokes on her cake, the heroine smiles. End screen: 1 / 2 / 3, СОХРАНИ, ПОДПИСАТЬСЯ (cursor).
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/gained/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];

// ---------------- cast
const HER = { ...BASE.her_lift, necklace: true, top: { type: 'sweater', col: '#2E8C8A' }, bottom: { type: 'skirt', col: '#2E8C8A' }, shoes: { col: '#2B1A22', acc: null } };
const ROSE = { ...BASE.rose, necklace: true, top: { type: 'cardigan', col: '#B8457A', col2: '#F7E6EC' }, bottom: { type: 'skirt', col: '#6A3A5A' }, shoes: { col: '#5A2A3A', acc: null } };
const TOM = BASE.tom, NANA = BASE.nana, GREG = BASE.greg;
const G = { her: geom(HER), mil2: geom(ROSE), son2: geom(TOM), nana: geom(NANA), greg: geom(GREG) };
const SEAT = 330, TOP = -500;
const X = { son2: -660, her: -260, mil2: 330, nana: 760, greg: 1140 }, CAKEX = 40;
const PIV = TOP + 140;   // Rose leans / deflates around this point (hidden behind the table front)
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- props
function plateDraw(c, s = 1) { c.save(); c.scale(s, s); c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(0, 6, 130, 24, 0, 0, TAU); c.fill(); c.fillStyle = '#F4F6FA'; c.beginPath(); c.ellipse(0, 0, 122, 22, 0, 0, TAU); c.fill(); c.strokeStyle = '#C9D0DA'; c.lineWidth = 4; c.stroke(); c.beginPath(); c.ellipse(0, -2, 78, 13, 0, 0, TAU); c.stroke(); c.restore(); }
function glassDraw(c, x, y) { c.fillStyle = 'rgba(200,40,70,.75)'; rr(c, x - 22, y - 70, 44, 44, 8); c.fill(); c.fillStyle = 'rgba(220,235,245,.45)'; rr(c, x - 26, y - 110, 52, 86, 12); c.fill(); c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 3; c.stroke(); c.fillStyle = 'rgba(220,235,245,.8)'; c.fillRect(x - 3, y - 26, 6, 26); c.fillRect(x - 20, y - 4, 40, 5); }
// the big layered cake on a stand; (0,0) = stand foot centre; cut = slice missing (after o2)
function cakeDraw(c, s = 1, cut = 0) { c.save(); c.scale(s, s);
  c.fillStyle = '#E8E2D8'; rr(c, -24, -70, 48, 70, 8); c.fill(); paint(c, q => q.e(0, -78, 190, 26), '#F4F0EA', { sd: 4, hd: 2, lw: 4 });   // stand
  const tier = (y0, w, h, col) => { paint(c, q => { q.m(-w, y0); q.l(w, y0); q.l(w, y0 - h); q.l(-w, y0 - h); q.z(); }, col, { sd: 8, hd: 4, lw: 4 });
    c.fillStyle = '#FFFDF8'; c.beginPath(); c.moveTo(-w - 6, y0 - h - 4); c.lineTo(w + 6, y0 - h - 4); c.lineTo(w + 6, y0 - h + 18);
    for (let i = 0; i <= 8; i++) { const x = w + 6 - i * (2 * w + 12) / 8; c.quadraticCurveTo(x - (w + 6) / 8, y0 - h + 46 + (i % 2) * 8, x - (2 * w + 12) / 8, y0 - h + 18); } c.closePath(); c.fill(); };
  tier(-90, 165, 120, '#F49AB8'); tier(-210, 120, 100, '#F7B6CF');
  if (cut > 0) { c.fillStyle = '#8A4A3A'; c.beginPath(); c.moveTo(20, -210); c.lineTo(120, -210); c.lineTo(120, -310); c.lineTo(20, -310); c.closePath(); c.fill(); c.fillStyle = '#FFF1C9'; c.fillRect(20, -268, 100, 14); }
  for (const [x, y] of [[-70, -322], [0, -330], [70, -322], [-35, -340], [35, -340]]) { c.fillStyle = '#E0474C'; c.beginPath(); c.arc(x, y, 18, 0, TAU); c.fill(); c.fillStyle = '#5EA65A'; c.beginPath(); c.ellipse(x + 4, y - 18, 9, 5, 0.4, 0, TAU); c.fill(); }
  c.fillStyle = '#FFFDF8'; for (let i = 0; i < 7; i++) { c.beginPath(); c.arc(-140 + i * 46, -100, 12, 0, TAU); c.fill(); }
  c.restore(); }
// a slice of cake on a plate (huge for the o2 gag); (0,0) = plate centre
function sliceDraw(c, s = 1) { c.save(); plateDraw(c, s * 1.2); c.scale(s, s);
  paint(c, q => { q.m(-110, -8); q.l(120, -8); q.l(120, -190); q.l(-110, -150); q.z(); }, '#F49AB8', { sd: 6, hd: 3, lw: 4 });
  c.fillStyle = '#FFF1C9'; c.beginPath(); c.moveTo(-110, -78); c.lineTo(120, -96); c.lineTo(120, -112); c.lineTo(-110, -92); c.closePath(); c.fill();
  c.fillStyle = '#FFFDF8'; c.beginPath(); c.moveTo(-114, -150); c.lineTo(124, -194); c.lineTo(124, -170); c.lineTo(-114, -132); c.closePath(); c.fill();
  c.fillStyle = '#E0474C'; c.beginPath(); c.arc(60, -200, 22, 0, TAU); c.fill(); c.fillStyle = '#5EA65A'; c.beginPath(); c.ellipse(66, -222, 10, 6, 0.4, 0, TAU); c.fill();
  c.restore(); }
const forkItem = ctx => { ctx.save(); ctx.rotate(0.25); ctx.strokeStyle = '#C9CED6'; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -100); ctx.stroke(); for (const dx of [-11, 0, 11]) { ctx.beginPath(); ctx.moveTo(dx, -100); ctx.lineTo(dx, -138); ctx.stroke(); } ctx.restore(); };
const forkCake = ctx => { forkItem(ctx); ctx.save(); ctx.rotate(0.25); ctx.fillStyle = '#F49AB8'; ctx.beginPath(); ctx.moveTo(-24, -136); ctx.lineTo(26, -136); ctx.lineTo(0, -184); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#FFFDF8'; ctx.fillRect(-14, -160, 28, 6); ctx.restore(); };

// ---------------- dining room (prerendered, softly blurred)
const BX0 = -2600, BY0 = -3400, BW = 5200, BH = 4800, BS = 0.5;
function drawRoom(c) {
  c.fillStyle = '#F2D9C4'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = 'rgba(200,120,110,.16)'; for (let x = BX0; x < BX0 + BW; x += 160) c.fillRect(x, BY0, 60, 3400);   // striped wallpaper
  for (let x = BX0 + 80; x < BX0 + BW; x += 160) for (let y = BY0 + 120; y < -900; y += 220) { c.fillStyle = 'rgba(210,120,130,.22)'; c.beginPath(); c.arc(x, y, 12, 0, TAU); c.fill(); }
  c.fillStyle = '#9C6238'; c.fillRect(BX0, -900, BW, 30); c.fillStyle = '#E8C9AE'; c.fillRect(BX0, -870, BW, 700);   // dado rail + lower wall
  c.fillStyle = 'rgba(0,0,0,.05)'; for (let x = BX0; x < BX0 + BW; x += 300) rr(c, x + 30, -820, 240, 560, 16), c.fill();
  // window with an evening sky
  c.fillStyle = '#F7F2E8'; rr(c, -1900, -2500, 900, 1250, 18); c.fill(); const g = c.createLinearGradient(0, -2470, 0, -1280); g.addColorStop(0, '#2B3360'); g.addColorStop(1, '#C97A6A'); c.fillStyle = g; rr(c, -1870, -2470, 840, 1190, 10); c.fill();
  c.fillStyle = '#F7F2E8'; c.fillRect(-1460, -2470, 20, 1190); c.fillRect(-1870, -1890, 840, 20);
  c.fillStyle = 'rgba(255,240,200,.9)'; for (let i = 0; i < 14; i++) { c.beginPath(); c.arc(-1850 + hash(i * 3) * 800, -2450 + hash(i * 7) * 500, 3 + hash(i) * 3, 0, TAU); c.fill(); }
  c.fillStyle = '#B8457A'; rr(c, -2020, -2560, 180, 1360, 30); c.fill(); rr(c, -1060, -2560, 180, 1360, 30); c.fill();   // curtains
  // family photos on the wall
  for (const [x, y, w, h, bg] of [[-500, -2350, 300, 380, '#BFE3F5'], [-120, -2250, 240, 300, '#F7D9E4'], [1250, -2400, 360, 300, '#DDEFD0'], [1700, -2300, 260, 340, '#F5E6C8']]) {
    c.fillStyle = '#9C6238'; rr(c, x - 16, y - 16, w + 32, h + 32, 10); c.fill(); c.fillStyle = bg; c.fillRect(x, y, w, h);
    c.fillStyle = 'rgba(80,60,60,.35)'; for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(x + w * (0.25 + k * 0.25), y + h * 0.45, w * 0.09, 0, TAU); c.fill(); c.fillRect(x + w * (0.25 + k * 0.25) - w * 0.08, y + h * 0.58, w * 0.16, h * 0.3); } }
  // sideboard on the right
  c.fillStyle = '#8A5434'; rr(c, 1500, -1150, 900, 980, 20); c.fill(); c.fillStyle = '#A8693F'; for (const x of [1540, 1970]) { rr(c, x, -1080, 390, 860, 14); c.fill(); }
  c.fillStyle = '#F7F2E8'; for (const x of [1650, 1800, 2150]) { rr(c, x, -1290, 70, 140, 10); c.fill(); }
  c.fillStyle = '#6A8E5A'; for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(-2350 + i * 30, -1300 - i * 60, 60, 170, -0.6 + i * 0.22, 0, TAU); c.fill(); } c.fillStyle = '#B86A3A'; rr(c, -2420, -500, 220, 300, 20); c.fill();
  c.fillStyle = '#7A4A30'; c.fillRect(BX0, -170, BW, 1600); c.fillStyle = 'rgba(0,0,0,.1)'; for (let x = BX0; x < BX0 + BW; x += 220) c.fillRect(x, -170, 8, 1600);   // floor
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawRoom);
const dimK = t => sceneAt(t).id === 'o1' ? eIO(clamp((t - ev('o1', 'dim')) / 0.35)) : 0;
function chandelier(c, t) { const on = 1 - dimK(t), x = CAKEX, y = -2350;
  c.strokeStyle = '#6A4A2A'; c.lineWidth = 8; c.beginPath(); c.moveTo(x, -3400); c.lineTo(x, y - 60); c.stroke();
  if (on > 0) { const gl = c.createRadialGradient(x, y + 40, 20, x, y + 40, 700); gl.addColorStop(0, `rgba(255,220,140,${0.5 * on})`); gl.addColorStop(1, 'rgba(255,220,140,0)'); c.fillStyle = gl; c.fillRect(x - 700, y - 660, 1400, 1400); }
  paint(c, q => { q.m(x - 260, y); q.q(x, y + 120, x + 260, y); q.l(x + 200, y - 30); q.q(x, y + 60, x - 200, y - 30); q.z(); }, '#C9A13A', { sd: 6, hd: 3, lw: 4 });
  for (const dx of [-220, -110, 0, 110, 220]) { c.fillStyle = '#F7F2E8'; c.fillRect(x + dx - 12, y - 110, 24, 90); c.fillStyle = on > 0.5 ? '#FFD86A' : '#6A6050'; c.beginPath(); c.ellipse(x + dx, y - 130, 12, 20, 0, 0, TAU); c.fill(); } }

// ---------------- what is on the table at time t
function sliceState(t, L) { if (L !== 'o2') return null; const a = ev('o2', 'push'), b = ev('o2', 'land'); if (t < a) return null; const k = eIO(clamp((t - a) / (b - a))); return { x: lerp(X.mil2 - 60, X.her + 30, k), s: lerp(0.8, 1.35, k), k }; }
let FORK = null;   // Greg's falling fork (o1)
function tableFront(c, t, L) {
  c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(-1150, -20, 2700, 40);
  paint(c, q => { q.m(-1100, TOP); q.l(1500, TOP); q.l(1530, -10); q.l(-1130, -10); q.z(); }, '#FFFDF8', { sd: 6, hd: 3, lw: 4, inner: k => { k.strokeStyle = 'rgba(200,120,140,.2)'; k.lineWidth = 6; for (let x = -1060; x < 1500; x += 90) { k.beginPath(); k.moveTo(x, TOP + 30); k.quadraticCurveTo(x + 12, TOP + 260, x + 4, -20); k.stroke(); } } });
  c.fillStyle = '#F49AB8'; c.fillRect(-1100, TOP + 340, 2600, 26);
  paint(c, q => { q.m(-1140, TOP - 40); q.l(1540, TOP - 40); q.l(1510, TOP + 12); q.l(-1110, TOP + 12); q.z(); }, '#F4EAD8', { sd: 4, hd: 2, lw: 4 });   // table top
  for (const who of ['son2', 'her', 'mil2', 'nana', 'greg']) { const x = X[who] + (who === 'her' ? -60 : 0); c.save(); c.translate(x, TOP - 18); plateDraw(c, 0.9); c.restore(); glassDraw(c, X[who] + 150, TOP - 18); }
  const cut = (L === 'o2' && t > ev('o2', 'push') - 0.2) || L === 'o3' || L === 'end' ? 1 : 0;
  c.save(); c.translate(CAKEX, TOP - 18); cakeDraw(c, 0.82, cut); c.restore();
  K.mark(c, 'cake', CAKEX, TOP - 220, 200);
  const sl = sliceState(t, L); if (sl) { c.save(); c.translate(sl.x, TOP - 10); sliceDraw(c, sl.s); c.restore(); K.mark(c, 'slice', sl.x, TOP - 120, 160); }
  if (FORK) { const u = FORK.u; c.save(); c.translate(FORK.x + u * 60, lerp(FORK.y, TOP - 20, eIn(clamp(u / 0.3)))); c.rotate(0.25 + u * 9); forkItem(c); c.restore(); }
}

// ---------------- characters (seated behind the table)
const gest = (st, g, who, t, side, base) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + SEAT + base + Math.cos(u) * 20, { planar: true }); } };
const onTable = (g, s) => reach(g, s, s * g.sw * 0.7, g.ySh + SEAT + 335, { planar: true });
const open = (g, s, k = 1.7, dy = 90) => reach(g, s, s * g.sw * k, g.ySh + SEAT + dy, { planar: true });
const forkUp = (g, s, dy = 170) => reach(g, s, s * g.sw * 0.9, g.ySh + SEAT + dy, { planar: true });
const seated = (g, t, who) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, legPose: 'sit', drop: SEAT, legs: false, armL: onTable(g, -1), armR: onTable(g, 1), items: {} });
const after = (t, a) => t >= a;
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { ...seated(g, t, 'her'), mood: 'happy', turn: 0.25, look: 0.7 };
  st.armR = forkUp(g, 1); st.items = { R: forkItem };
  if (L === 'hook') { if (t < hev('freeze') - 0.05) { st.mood = 'happy'; } else { st.mood = 'shock'; st.blink = 0; st.breathe = 0; st.turn = 0.3; st.look = 0.9; st.headY = -8; if (t > hev('wide')) st.mood = 'worried'; } }
  if (L === 'o1') { st.mood = 'worried'; if (speaking('o1_h', t, 0.1, 0.2)) { st.mood = 'angry'; st.items = {}; gest(st, g, 'her', t, 1, 120); st.armL = onTable(g, -1); }
    if (t > endOf('o1_h') + 0.2) { st.mood = 'shock'; st.blink = 0; st.look = 0.2; st.turn = 0.05; st.items = {}; st.armR = onTable(g, 1); } }
  if (L === 'o2') { st.mood = 'neutral'; if (speaking('o2_h', t, 0.1, 0.2)) { st.mood = 'neutral'; st.items = {}; st.armL = open(g, -1, 1.3, 230); st.armR = open(g, 1, 1.3, 230); }
    if (t > SP.o2_r.t) { st.mood = 'surprised'; st.look = 0.8; }
    if (t > e('land') - 0.1) { st.mood = 'worried'; st.blink = 0; st.lookY = 0.55; st.look = 0.2; st.turn = 0.1; st.items = {}; st.armR = onTable(g, 1); } }
  if (L === 'o3') { st.mood = 'happy'; if (speaking('o3_h', t, 0.1, 0.2)) { st.laugh = true; st.items = {}; st.armL = open(g, -1, 1.9, 60 + Math.sin(t * 5) * 15); st.armR = open(g, 1, 1.9, 60 + Math.cos(t * 5) * 15); st.look = 0.6; }
    if (t > endOf('o3_h') + 0.2) { st.mood = 'happy'; st.blink = 1; st.look = 0.7; } if (t > SP.o3_nar.t) { st.blink = 0; st.laugh = false; } }
  if (L === 'end') { st.mood = 'neutral'; st.look = 0.3; if (t > SP.end_t.t + 0.2) { st.mood = 'surprised'; st.turn = -0.3; st.look = -0.8; } if (t > e('smile')) { st.mood = 'happy'; st.blink = 1; st.turn = 0.15; st.look = 0.2; } }
  return st; }
function roseState(t, L) { const g = G.mil2, e = k => ev(L, k), st = { ...seated(g, t, 'mil2'), mood: 'happy', turn: -0.3, look: -0.8 };
  if (L === 'hook') { st.mood = 'happy'; st.armL = reach(g, -1, -g.sw * 1.4, g.ySh + SEAT + 200, { planar: true }); if (speaking('hook_r', t, 0.05, 0.1)) gest(st, g, 'mil2', t, -1, 160); if (t > endOf('hook_r') + 0.1) { st.mood = 'smug'; } }
  if (L === 'o1') { st.mood = 'smug'; if (speaking('o1_h', t, 0.1, 0)) { st.mood = 'surprised'; } if (t > endOf('o1_h') + 0.05) { st.mood = 'shock'; st.blink = 0; st.headY = 10; st.talk = 1; st.breathe = 0; st.armL = open(g, -1, 1.5, 120); st.armR = open(g, 1, 1.5, 120); } }
  if (L === 'o2') { st.mood = 'smug'; if (speaking('o2_r', t, 0.05, 0.1)) { st.mood = 'happy'; gest(st, g, 'mil2', t, 1, 160); }
    const sl = sliceState(t, L); if (sl && sl.k < 1) { st.mood = 'happy'; st.armL = reach(g, -1, sl.x - X.mil2 + 90, TOP - 60, { planar: true }); }
    if (t > e('land')) { st.mood = 'happy'; st.blink = 1; st.armL = reach(g, -1, -g.sw * 1.2, g.ySh + SEAT + 260, { planar: true }); } }
  if (L === 'o3') { st.mood = 'smug'; if (speaking('o3_h', t, 0.1, 0.1)) { st.mood = 'surprised'; }
    if (t > SP.o3_r.t - 0.05) { st.mood = 'surprised'; } if (t > e('deflate') - 0.1) { st.mood = 'sad'; st.look = -0.4; st.lookY = 0.3; st.armL = onTable(g, -1); st.armR = onTable(g, 1); } }
  if (L === 'end') { st.mood = 'happy'; st.look = -0.2; st.armR = reach(g, 1, g.sw * 0.6, g.ySh + SEAT + 60 + Math.sin(t * 3) * 25, { planar: true }); st.items = { R: forkCake }; st.headFirst = false;
    if (t > SP.end_t.t + 0.3) { st.mood = 'surprised'; st.look = -0.9; st.turn = -0.35; st.armR = reach(g, 1, g.sw * 0.8, g.ySh + SEAT + 90, { planar: true }); st.breathe = 0; }
    if (t > e('choke')) { const u = t - e('choke'); st.mood = 'shock'; st.blink = u % 0.5 < 0.25 ? 1 : 0; st.look = 0; st.turn = 0; st.headY = Math.sin(u * 30) * 8 * (u < 0.7 ? 1 : 0.3); st.talk = 0; st.items = {}; st.headFirst = true;
      st.armR = reach(g, 1, g.hw * 0.4, g.headY + SEAT + g.hh * 1.2, { planar: true }); } }
  return st; }
function tomState(t, L) { const g = G.son2, e = k => ev(L, k), st = { ...seated(g, t, 'son2'), mood: 'neutral', turn: 0.2, look: 0.5 };
  st.armR = forkUp(g, 1, 200); st.items = { R: forkItem };
  if (L === 'hook') { st.mood = 'neutral'; if (t > hev('freeze')) { st.mood = 'worried'; st.look = 0.8; } }
  if (L === 'o1' && t > endOf('o1_h')) { st.mood = 'shock'; st.blink = 0; st.items = {}; st.armR = onTable(g, 1); }
  if (L === 'o2' && t > ev('o2', 'land')) { st.mood = 'surprised'; st.lookY = 0.4; st.look = 0.6; }
  if (L === 'o3') { st.mood = 'happy'; st.look = 0.6; if (t > ev('o3', 'deflate')) { st.mood = 'surprised'; st.look = 0.9; } }
  if (L === 'end') { st.mood = 'neutral'; st.look = 0.4; if (speaking('end_t', t, 0.05, 0.1)) { st.mood = 'neutral'; st.turn = 0.35; st.look = 0.9; st.items = {}; st.armR = onTable(g, 1); }
    if (t > endOf('end_t') + 0.1) { st.mood = 'smug'; st.turn = 0.3; st.look = 0.9; st.items = {}; st.armR = onTable(g, 1); } }
  return st; }
function relState(t, L, who) { const g = G[who], e = k => ev(L, k), st = { ...seated(g, t, who), mood: 'neutral', turn: -0.3, look: -0.8 };
  if (who === 'greg') { st.armR = forkUp(g, 1, 150); st.items = { R: forkCake }; }
  if (L === 'hook') { st.mood = t > 1.2 ? 'surprised' : 'neutral'; if (t > hev('freeze')) { st.mood = 'shock'; st.blink = 0; } }
  if (L === 'o1' && t > e('gasp') - 0.1) { st.mood = 'shock'; st.blink = 0; st.breathe = 0;
    if (who === 'nana') { st.headFirst = true; st.armL = reach(g, -1, -g.hw * 1.05, g.headY + SEAT + g.hh * 0.5, { planar: true }); st.armR = reach(g, 1, g.hw * 1.05, g.headY + SEAT + g.hh * 0.5, { planar: true }); }
    if (who === 'greg' && t > e('fork')) { st.items = {}; st.armR = open(g, 1, 1.4, 150); } }
  if (L === 'o2') { st.mood = 'neutral'; if (t > e('land')) { st.mood = 'surprised'; st.lookY = 0.3; } }
  if (L === 'o3') { st.mood = 'happy'; if (t > e('deflate')) { st.mood = 'surprised'; st.look = -0.4; } if (t > SP.o3_nar.t) st.mood = 'happy'; }
  if (L === 'end') { st.mood = 'neutral'; if (t > SP.end_t.t + 0.3) { st.mood = 'surprised'; st.look = -0.6; } if (t > e('choke') + 0.15) { st.mood = 'happy'; st.laugh = true; st.blink = 1; } }
  return st; }
// Rose: lean in (hook / o2 push) and deflate (o3 squash) around a pivot hidden behind the table
function rosePose(t, L) { let rot = 0, sx = 1, sy = 1;
  if (L === 'hook') rot = -0.19 + 0.012 * Math.sin(t * 2);
  if (L === 'o2') { const sl = sliceState(t, L); rot = sl && sl.k < 1 ? -0.12 * Math.sin(sl.k * Math.PI) : 0; }
  if (L === 'o3') { const d = clamp((t - ev('o3', 'deflate')) / 0.7); const k = eOut(d); sy = 1 - 0.13 * k + (d > 0 && d < 1 ? 0.02 * Math.sin(d * 40) : 0); sx = 1 + 0.06 * k; rot = 0.05 * k; }
  if (L === 'end' && t > SP.end_t.t + 0.3 && t < ev('end', 'choke')) rot = 0.04;
  return { rot, sx, sy }; }
function putR(c, cfg, st, x, p) { c.save(); c.translate(x, PIV); c.rotate(p.rot); c.scale(p.sx, p.sy); c.translate(0, -PIV); const r = K.put(c, cfg, st, 0, 0); c.restore();
  const dx = r.x * p.sx, dy = (r.y - PIV) * p.sy, cs = Math.cos(p.rot), sn = Math.sin(p.rot); return { x: x + dx * cs - dy * sn, y: PIV + dx * sn + dy * cs, hh: r.hh * p.sy, r: r.r }; }

// ---------------- world + which characters each shot draws (clean singles: only the tagged character)
const ALL = ['son2', 'her', 'mil2', 'nana', 'greg'];
const DRAW = { wide: ALL, cover: ['her', 'mil2'], two: ['her', 'mil2'], her: ['her'], mil2: ['mil2'], son2: ['son2'], rel: ['nana', 'greg'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const who = DRAW[tag] || ALL, heads = {};
  c.drawImage(BGR, BX0, BY0, BW, BH); chandelier(c, t);
  FORK = null; if (L === 'o1' && t > ev('o1', 'fork')) { const u = t - ev('o1', 'fork'); if (u < 0.5) { const g = G.greg; FORK = { u, x: X.greg + g.sw * 0.9, y: g.ySh + SEAT + 150 - 140 }; } }
  if (who.includes('greg')) heads.greg = K.put(c, GREG, relState(t, L, 'greg'), X.greg, 0);
  if (who.includes('nana')) heads.nana = K.put(c, NANA, relState(t, L, 'nana'), X.nana, 0);
  if (who.includes('son2')) heads.son2 = K.put(c, TOM, tomState(t, L), X.son2, 0);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), X.her, 0);
  if (who.includes('mil2')) heads.mil2 = putR(c, ROSE, roseState(t, L), X.mil2, rosePose(t, L));
  if (!who.includes('greg')) FORK = null;
  tableFront(c, t, L);
  // o3 deflate: little air puffs leaving Rose
  if (who.includes('mil2') && L === 'o3') { const u = t - ev('o3', 'deflate'); if (u > 0 && u < 0.9) { const hd = heads.mil2; c.save(); c.globalAlpha = 1 - u / 0.9; c.strokeStyle = '#FFFFFF'; c.lineWidth = 10; c.lineCap = 'round';
      for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.45, r0 = hd.hh * 1.3 + u * 260, r1 = r0 + 70; c.beginPath(); c.moveTo(hd.x + Math.cos(a) * r0, hd.y + Math.sin(a) * r0); c.lineTo(hd.x + Math.cos(a) * r1, hd.y + Math.sin(a) * r1); c.stroke(); } c.restore(); } }
  // twist: Rose's cheeks go red while she chokes
  if (who.includes('mil2') && L === 'end' && t > ev('end', 'choke')) { const hd = heads.mil2, k = clamp((t - ev('end', 'choke')) / 0.2); c.save(); c.globalAlpha = 0.35 * k; c.fillStyle = '#E0474C'; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(hd.x + s * hd.hh * 0.5, hd.y + hd.hh * 0.25, hd.hh * 0.22, hd.hh * 0.14, 0, 0, TAU); c.fill(); } c.restore(); }
  // o1: the room goes dark (the chandelier went out)
  const dk = dimK(t); if (dk > 0) { c.save(); c.fillStyle = `rgba(20,14,40,${0.5 * dk})`; c.fillRect(BX0, BY0, BW, BH); c.restore(); }
  if (!heads.her) heads.her = OFFL; for (const k of ['mil2', 'son2', 'nana', 'greg']) if (!heads[k]) heads[k] = OFF;
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const HY = k => G[k].headY + SEAT, fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S((X.her + X.mil2) / 2, fy(HY('her'), 1.0, 1110), 1.0, 'cover'), WIDE: S(250, fy(HY('her'), 0.48, 1040), 0.48, 'wide'), TWO: S((X.her + X.mil2) / 2, fy(HY('her'), 0.95, 1060), 0.95, 'two'),
  HER: S(X.her + 20, fy(HY('her'), 1.0), 1.0, 'her'), HER_CU: S(X.her + 10, fy(HY('her'), 1.4, 900), 1.4, 'her'), HER_R: S(X.her + 20, fy(HY('her'), 1.0, 1050), 1.0, 'her'),
  ROSE: S(X.mil2 - 40, fy(HY('mil2'), 1.0), 1.0, 'mil2'), ROSE_CU: S(X.mil2 - 70, fy(HY('mil2'), 1.35, 950), 1.35, 'mil2'), TOM: S(X.son2 + 20, fy(HY('son2'), 1.0), 1.0, 'son2'),
  REL: S((X.nana + X.greg) / 2, fy((HY('nana') + HY('greg')) / 2, 0.8, 1000), 0.8, 'rel'), CAKE: U('cake', 1) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  const sp = (id, pre = 0.1, post = 0.15) => speaking(id, t, pre, post);
  if (L === 'hook') { if (t < hev('freeze') - 0.02) return SH.COVER; if (t < hev('nar') + 0.95) return f(SH.HER_CU); if (t < hev('cake') - 0.05) return f(SH.ROSE_CU); if (t < hev('rel') - 0.05) return f(SH.CAKE); if (t < hev('wide') - 0.05) return f(SH.REL); return f(SH.WIDE); }
  if (L === 'o1') { if (t < SP.o1_h.t - 0.1) return f(SH.WIDE); if (t < endOf('o1_h') + 0.27) return f(SH.HER); if (t < endOf('o1_h') + 0.8) return f(SH.REL); if (t < SP.o1_nar.t + 0.7) return f(SH.ROSE_CU); return f(SH.WIDE); }
  if (L === 'o2') { if (t < SP.o2_h.t - 0.1) return f(SH.WIDE); if (sp('o2_h', 0.1, 0.27)) return f(SH.HER); if (t < SP.o2_nar.t - 0.05) return f(SH.TWO); return f(SH.HER_R); }
  if (L === 'o3') { if (t < SP.o3_h.t - 0.1) return f(SH.WIDE); if (sp('o3_h', 0.1, 0.27)) return f(SH.HER); if (t < SP.o3_nar.t - 0.05) return f(SH.ROSE); if (t < SP.o3_tip.t - 0.1) return f(SH.TWO); return f(SH.HER_R); }
  if (L === 'end') { if (t < SP.end_t.t - 0.1) return f(SH.WIDE); if (t < e('choke') - 0.05) return f(SH.TOM); if (t < e('choke') + 0.6) return f(SH.ROSE_CU); return f(SH.TWO); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'thud', 'clank']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- cake insert (hook): the big cake on a solid backdrop
function cakeView(c, t) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, '#F7D9E4'); g.addColorStop(1, '#E9A9BF'); c.fillStyle = g; c.fillRect(0, 0, W, HH); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'cake' });
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -12; i < 12; i++) c.fillRect(-1600, i * 160 + (t * 40) % 160, 3200, 60); c.restore();
  const k = eBack(clamp((t - hev('cake') + 0.05) / 0.3), 1.6); c.save(); c.translate(540, 1300); c.scale(2.3 * k, 2.3 * k); cakeDraw(c, 1, 0); c.restore();
  for (let i = 0; i < 5; i++) { const a = t * 2.5 + i * 1.3; c.fillStyle = C.gold; UI.star(c, 540 + Math.cos(a) * 380, 820 + Math.sin(a * 1.2) * 180, 24); } }

// ---------------- overlays
function title(c, t) { const a = 1 - P(t, 2.45, 2.75); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 360); c.rotate(-0.04); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -102);
  UI.textFit(c, 'Unb9', 120, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 6, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 64, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 112); c.restore(); }
const PLATES = { o1: ['1', 'В ЛОБ', '#E0474C'], o2: ['2', 'ВЕЖЛИВО', '#F2B33D'], o3: ['3', 'КАК НОСИТЕЛЬ', '#4CAF6A'] };
// option plate: pops big at the start of the option (<= 0.6 s), then stays as a small label at the top
function plate(c, t, sc) { const p = PLATES[sc.id]; if (!p) return; const u = t - sc.s, out = P(t, sc.e - 0.15, sc.e);
  const k = eBack(P(u, 0, 0.25), 2.2) * (1 - eIn(out)), big = 1 - eIO(P(u, 0.3, 0.5)); if (k <= 0) return;
  const s = k * lerp(1, 1.4, big), y = 215;
  c.save(); c.translate(540, y); c.scale(s, s); c.rotate(-0.025);
  UI.font(c, 'Unb9', 54); const tw = c.measureText(p[1]).width, w = tw + 200, h = 100;
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -h / 2 + 9, w, h, 50); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 50); c.fill(); c.stroke();
  c.fillStyle = p[2]; c.beginPath(); c.arc(-w / 2 + 50, 0, 50, 0, TAU); c.fill(); c.stroke(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p[0], -w / 2 + 50, 4);
  c.fillStyle = C.oliveD; c.textAlign = 'left'; c.fillText(p[1], -w / 2 + 120, 4); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - 300 * s, y: y - 50 * s, w: 600 * s, h: 100 * s, k, id: 'plate_' + sc.id }); }

// ---------------- end screen: question, 1 / 2 / 3, СОХРАНИ, ПОДПИСАТЬСЯ clicked by the cursor
const wAt = (id, w, fb) => K.wordT(id, w) ?? fb;
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, { textFit, strokeText, font } = UI;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // heroine + Rose (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34)
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gr = G.mil2; K.put(c, ROSE, { t, mood: 'happy', blink: 1, turn: -0.2, look: -0.4, armL: reach(gr, -1, -gr.sw * 1.6, gr.ySh + 160, { planar: true }), armR: reach(gr, 1, gr.sw * 0.8, gr.ySh + 330), items: { L: ctx => { ctx.save(); ctx.translate(-30, 30); sliceDraw(ctx, 0.6); ctx.restore(); } } }, 640, 60);
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(t * 8) * 30, { planar: true }), armR: reach(g, 1, g.sw * 0.8, g.ySh + 330), items: {} }, 0, 0); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const q = eBack(P(u, 0.2, 0.55), 2.2); c.save(); c.translate(540, 330); c.scale(q, q); font(c, 'Unb9', 64); strokeText(c, 'А ТЫ БЫ', 0, -50, C.oliveD, C.white, 14); strokeText(c, 'ОТВЕТИЛА КАК?', 0, 40, C.pink, C.white, 14); c.restore();
  const tw = [wAt('outro', 'один', sp.t + 1.6), wAt('outro', 'два', sp.t + 1.9), wAt('outro', 'три', sp.t + 2.2)];
  ['o1', 'o2', 'o3'].forEach((id, i) => { const p = PLATES[id], kk = eBack(P(t, tw[i] - 0.1, tw[i] + 0.2), 2.2); if (kk <= 0) return; const x = 210 + i * 330, y = 690, bump = 1 + 0.08 * Math.sin(clamp((t - tw[i]) / 0.4) * Math.PI);
    c.save(); c.translate(x, y); c.scale(kk * bump, kk * bump); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -140 + 8, -150 + 12, 280, 300, 40); c.fill(); c.fillStyle = p[2]; c.strokeStyle = C.oliveD; c.lineWidth = 8; rr(c, -140, -150, 280, 300, 40); c.fill(); c.stroke();
    font(c, 'Unb9', 150); c.fillStyle = C.white; c.fillText(p[0], 0, -30); textFit(c, 'Unb9', 34, p[1], 240); c.fillStyle = C.white; c.fillText(p[1], 0, 100); c.restore(); });
  const svT = wAt('outro', 'сохрани', sp.t + 3.0) - 0.1, sk = eBack(P(t, svT, svT + 0.3), 2.2), pulse = 1 + 0.05 * Math.sin(clamp((t - svT - 0.3) / 0.5) * Math.PI);
  if (sk > 0) { c.save(); c.translate(540, 1000); c.scale(sk * pulse, sk * pulse); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -260 + 6, -60 + 10, 520, 120, 60); c.fill(); c.fillStyle = C.gold; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -260, -60, 520, 120, 60); c.fill(); c.stroke();
    // bookmark icon drawn with paths
    c.fillStyle = C.oliveD; c.beginPath(); c.moveTo(-190, -32); c.lineTo(-146, -32); c.lineTo(-146, 34); c.lineTo(-168, 16); c.lineTo(-190, 34); c.closePath(); c.fill();
    textFit(c, 'Unb9', 50, 'СОХРАНИ', 330); c.fillStyle = C.oliveD; c.fillText('СОХРАНИ', 40, 4); c.restore(); }
  const subT = Math.min(svT + 0.7, sp.t + sp.d - 1.1), bk = eBack(P(t, subT, subT + 0.3), 2), sy = 1215;
  if (bk > 0) { const click = P(t, subT + 0.8, subT + 0.95), pressed = t > subT + 0.9; c.save(); c.translate(700, sy); const ss = bk * (1 - 0.08 * Math.sin(click * Math.PI)); c.scale(ss, ss); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -250 + 6, -58 + 10, 500, 116, 58); c.fill(); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -250, -58, 500, 116, 58); c.fill(); textFit(c, 'Unb9', 42, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 440); c.fillStyle = C.white; c.fillText(pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4); c.restore();
    const mv = eIO(P(t, subT + 0.2, subT + 0.8)); UI.tapCursor(c, lerp(980, 760, mv), lerp(sy + 230, sy + 20, mv), 1, P(t, subT + 0.85, subT + 1.4)); }
  UI.captions(c, t); Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag.startsWith('ui:')) { cakeView(c, t); heads = { her: OFFL, mil2: OFF, son2: OFF }; proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26); }
  const names = { mil2: ['ROSE', '#B8457A'], son2: ['TOM', '#4E7FB8'] };
  if (!tag.startsWith('ui:')) K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names, hold: { hook_r: -0.22, o1_h: -0.22, o2_h: -0.15, o2_r: 0.05, o3_h: -0.15, o3_r: 0.05, end_t: -0.2 } });
  if (L === 'hook') title(c, t);
  plate(c, t, sc);
  UI.captions(c, t); Hq.grain(c, W, HH, t, 0.04);
  // the end screen wipes in from the twist
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('gained', NF, renderFrame);
