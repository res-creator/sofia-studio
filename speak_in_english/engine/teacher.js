// "When your teacher tries to be cool" episode renderer (hard_cut camera): node teacher.js start end out.mp4 | --png=f1,f2
// A maths classroom seen from the side: the teacher (sunglasses) in front of the board, a ring light with his phone,
// students at desks on the right, the door on the left (the principal appears there behind his back).
// Shots tagged 'ui:<view>' (phone, black) replace the world: the live stream on a phone screen, the cut to black.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/teacher/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf, EV } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2, ev = k => EV(k);
const hev = k => SC.hook.ev[k];

// ---------------- cast: Mr Mark the maths teacher (gold chain), Jay & Chloe (students), Rita & Max (back row), the principal (Reggie)
const TEACH = { ...BASE.mark, necklace: true, top: { type: 'blazer', col: '#3C6FB4', shirt: '#FFFFFF', tie: '#EE5E9A' }, bottom: { type: 'trousers', col: '#2F3E5C' } };
const JAY = { ...BASE.jay };
const CHLOE = { ...BASE.chloe, top: { type: 'sweater', col: '#F2C14E' }, bottom: { type: 'jeans', col: '#7E9CC4' } };
const RITA = { ...BASE.rita, top: { type: 'hoodie', col: '#4CAF6A' } };
const MAX = { ...BASE.max };
const PRIN = { ...BASE.reggie };
const G = { teacher: geom(TEACH), stu: geom(JAY), stu2: geom(CHLOE), rita: geom(RITA), max: geom(MAX), prin: geom(PRIN) };
const TX = -300, PX = -1240, PY = -60, SF = 250, BACKF = 70, BACKS = 0.88, DESK = -550, BDESK = -690;
const POS = { teacher: [TX, 0], stu: [520, SF], stu2: [1010, SF], rita: [770, BACKF], max: [1240, BACKF], prin: [PX, PY] };
const HY = who => POS[who][1] + G[who].headY * (who === 'rita' || who === 'max' ? BACKS : 1);
function txt(c, s, x, y, size, col, font = 'Unb9', align = 'center') { c.font = `${size}px ${font}`; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- props held in hand (drawn upright at the wrist)
const phoneItem = (ctx) => { ctx.save(); ctx.rotate(-0.1); ctx.fillStyle = '#2B2F3A'; rr(ctx, -34, -96, 68, 120, 12); ctx.fill(); ctx.fillStyle = '#EE5E9A'; rr(ctx, -26, -88, 52, 104, 8); ctx.fill(); ctx.restore(); };
const pphoneItem = (ctx) => { ctx.save(); ctx.rotate(0.12); ctx.fillStyle = '#1E2128'; rr(ctx, -36, -104, 72, 128, 12); ctx.fill(); ctx.fillStyle = '#4A5068'; ctx.beginPath(); ctx.arc(-14, -84, 7, 0, TAU); ctx.fill(); ctx.restore(); };   // back of the principal's phone: the screen stays hidden
const eraserItem = (ctx) => { ctx.fillStyle = '#C98B5A'; rr(ctx, -50, -64, 100, 44, 10); ctx.fill(); ctx.fillStyle = '#E9E6E2'; rr(ctx, -50, -28, 100, 16, 6); ctx.fill(); };
const shadesItem = (ctx) => { ctx.fillStyle = '#1A1C24'; rr(ctx, -62, -40, 54, 34, 12); ctx.fill(); rr(ctx, 8, -40, 54, 34, 12); ctx.fill(); ctx.fillRect(-10, -32, 20, 6); };
const thumbItem = (skin) => (ctx) => paint(ctx, q => { q.m(-16, -18); q.q(-22, -104, 0, -112); q.q(22, -104, 16, -18); q.z(); }, skin, { sd: 3, hd: 2, lw: 3 });
// sunglasses on the face; slide = how far they slid down the nose (0..1)
function shades(c, gg, g, turn, slide = 0) { const hx = gg.head.x + turn * g.hw * 0.2, ey = gg.head.y + g.hh * (0.06 + 0.16 * slide);
  c.save(); c.fillStyle = '#16181F'; c.strokeStyle = '#0C0D12'; c.lineWidth = 5;
  for (const s of [-1, 1]) { rr(c, hx + s * g.hw * 0.42 - g.hw * 0.31, ey - g.hh * 0.11, g.hw * 0.62, g.hh * 0.22, g.hh * 0.08); c.fill(); }
  c.fillRect(hx - g.hw * 0.14, ey - g.hh * 0.07, g.hw * 0.28, g.hh * 0.035);
  c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 5; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(hx + s * g.hw * 0.42 - g.hw * 0.18, ey - g.hh * 0.05); c.lineTo(hx + s * g.hw * 0.42 - g.hw * 0.06, ey - g.hh * 0.08); c.stroke(); }
  c.restore(); }

// ---------------- classroom (prerendered, softly blurred): wall, board, door, teacher's desk; front desks + ring light drawn sharp
const BX0 = -2000, BY0 = -2700, BW = 4000, BH = 3700, BS = 0.5;
function board(c, t, L) { // two panels: HOMEWORK (left, erased in A2) | TOMORROW'S TEST — ANSWER KEY (right)
  paint(c, q => { q.m(-930, -2010); q.l(450, -2010); q.l(450, -1150); q.l(-930, -1150); q.z(); }, '#8A5A36', { sd: 6, hd: 3, lw: 4 });
  c.fillStyle = '#2F5A48'; c.fillRect(-900, -1980, 1320, 800); c.fillStyle = 'rgba(255,255,255,.05)'; c.fillRect(-900, -1980, 1320, 260);
  c.fillStyle = '#7A4E2E'; c.fillRect(-240, -1980, 8, 800); c.fillStyle = '#C9A57E'; c.fillRect(-930, -1172, 1380, 26);
  const er = L === undefined ? 0 : (L === 'A2' ? clamp(P(t, ev('erase'), ev('erase') + 0.9)) : ['hook', 'A1'].includes(L) ? 0 : 1);
  if (er < 1) { c.save(); c.globalAlpha = 1 - er; txt(c, 'HOMEWORK', -570, -1800, 92, '#F4F1EC', 'Cav7'); txt(c, '20 EXERCISES', -570, -1660, 78, '#F2C14E', 'Cav7');
    txt(c, 'p. 47–52', -570, -1530, 56, '#F4F1EC', 'Cav7'); c.restore(); }
  if (er > 0.95) { txt(c, 'NO HOMEWORK!', -570, -1700, 70, '#F7B6CF', 'Cav7'); c.strokeStyle = 'rgba(244,241,236,.25)'; c.lineWidth = 30; c.beginPath(); c.moveTo(-820, -1560); c.bezierCurveTo(-650, -1620, -500, -1520, -330, -1590); c.stroke(); }
  txt(c, "TOMORROW'S TEST", 90, -1880, 58, '#F4F1EC', 'Cav7'); txt(c, 'ANSWER KEY', 90, -1800, 64, '#F2C14E', 'Cav7');
  ['1) B    5) 12', '2) x = 7    6) C', '3) 42    7) 3/4', '4) A    8) 90°'].forEach((s, i) => txt(c, s, 90, -1700 + i * 100, 54, '#F4F1EC', 'Cav7')); }
function drawRoomBg(c) {
  c.fillStyle = '#E6DCC6'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = '#CFE0D2'; c.fillRect(BX0, -900, BW, 640); c.fillStyle = '#B9CBBE'; c.fillRect(BX0, -900, BW, 18);   // wainscot
  // windows on the right wall part
  for (const wx of [700, 1350]) { c.fillStyle = '#FFFDF8'; rr(c, wx, -2150, 520, 900, 16); c.fill(); c.fillStyle = '#BFE3F7'; rr(c, wx + 24, -2126, 472, 852, 10); c.fill(); c.fillStyle = '#9ED39A'; c.beginPath(); c.ellipse(wx + 260, -1330, 240, 90, 0, 0, TAU); c.fill(); c.fillStyle = '#FFFDF8'; c.fillRect(wx + 252, -2126, 16, 852); }
  // clock + poster
  c.fillStyle = '#FFFDF8'; c.beginPath(); c.arc(-1000, -2330, 90, 0, TAU); c.fill(); c.strokeStyle = '#3E471E'; c.lineWidth = 10; c.stroke(); c.lineWidth = 8; c.beginPath(); c.moveTo(-1000, -2330); c.lineTo(-1000, -2390); c.moveTo(-1000, -2330); c.lineTo(-955, -2310); c.stroke();
  c.fillStyle = '#F2C14E'; rr(c, 520, -2560, 520, 300, 14); c.fill(); txt(c, 'π = 3.14', 780, -2445, 84, '#3E471E', 'Cav7'); txt(c, 'MATHS IS FUN', 780, -2340, 46, '#3E471E');
  // door frame (left)
  paint(c, q => { q.m(-1450, -1960); q.l(-1030, -1960); q.l(-1030, -250); q.l(-1450, -250); q.z(); }, '#B07A4E', { sd: 6, hd: 3, lw: 4 });
  c.fillStyle = '#5C6B7A'; c.fillRect(-1420, -1930, 360, 1680);   // corridor behind the door
  c.fillStyle = '#7C8B9A'; c.fillRect(-1420, -700, 360, 450);
  // floor
  c.fillStyle = '#C9A57E'; c.fillRect(BX0, -260, BW, 1260); c.fillStyle = 'rgba(0,0,0,.05)'; for (let x = BX0; x < BX0 + BW; x += 220) c.fillRect(x, -260, 8, 1260);
}
const BGB = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); { const c = BGB.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); c.filter = 'blur(1.4px)'; drawRoomBg(c); }
function doorPanel(c, t, L) { const open = ['C1', 'C2'].includes(L) ? 1 : L === 'B2' ? eOut(P(t, ev('door'), ev('door') + 0.45)) : 0;
  const w = 360 * (1 - open * 0.82); paint(c, q => { q.m(-1420, -1930); q.l(-1420 + w, -1930 + open * 40); q.l(-1420 + w, -250 - open * 40); q.l(-1420, -250); q.z(); }, '#C98B5A', { sd: 6, hd: 3, lw: 4 });
  if (open < 0.6) { c.fillStyle = '#E9E6E2'; c.beginPath(); c.arc(-1420 + w - 40, -1080, 18, 0, TAU); c.fill(); c.fillStyle = '#FFFDF8'; rr(c, -1420 + w * 0.2, -1800, w * 0.6, 260, 8); c.fill(); fitTxt(c, '7B', -1420 + w * 0.5, -1670, 90, '#3E471E', w * 0.5); } }
// teacher's desk + notebook stack (flies in B2)
const NB = Array.from({ length: 9 }, (_, i) => ({ col: ['#E0474C', '#3C8FE0', '#F2C14E', '#4CAF6A', '#8E5BD6', '#EE5E9A'][i % 6], vx: -420 + hash(i * 3.1) * 1100, vy: -1500 - hash(i * 7.7) * 900, rot: (hash(i * 5.3) - 0.5) * 14 }));
function teacherDesk(c, t, L) { paint(c, q => { q.m(-1000, -800); q.l(-540, -800); q.l(-540, -760); q.l(-1000, -760); q.z(); }, '#B98556', { sd: 6, hd: 3, lw: 4 });
  paint(c, q => { q.m(-980, -760); q.l(-560, -760); q.l(-560, -60); q.l(-980, -60); q.z(); }, '#9C6A42', { sd: 10, hd: 4, lw: 4 });
  c.fillStyle = '#E0474C'; c.beginPath(); c.arc(-900, -850, 46, 0, TAU); c.fill(); c.fillStyle = '#4CAF6A'; c.fillRect(-904, -906, 10, 20);   // apple
  const hit = L === 'B2' ? ev('hit') : ['C1', 'C2'].includes(L) ? -1e9 : 1e9, u = t - hit;
  NB.forEach((n, i) => { if (u < 0) { c.save(); c.translate(-680 + (i % 2) * 6, -810 - i * 22); c.fillStyle = n.col; rr(c, -80, -10, 160, 22, 4); c.fill(); c.restore(); return; }
    const k = Math.min(u, 1.1), x = -680 + n.vx * k, y = -810 - i * 22 + n.vy * k + 2600 * k * k;
    const land = Math.min(y, -40 - (i % 3) * 30); c.save(); c.translate(x, land); c.rotate(y >= -40 ? n.rot * 0.1 : n.rot * k); c.fillStyle = n.col; rr(c, -80, -10, 160, 22, 4); c.fill(); c.fillStyle = '#FFFDF8'; c.fillRect(-70, -6, 140, 5); c.restore(); }); }
// ring light + phone on a tripod in front of the teacher
const RLX = 130, RLY = -1430;
function ringLight(c, t, L) { const on = ['B1', 'B2', 'C1', 'C2'].includes(L) && !(L === 'B1' && t < ev('live'));
  c.strokeStyle = '#2B2F3A'; c.lineWidth = 14; c.lineCap = 'round'; c.beginPath(); c.moveTo(RLX, RLY + 140); c.lineTo(RLX, -60); c.moveTo(RLX, -260); c.lineTo(RLX - 120, -10); c.moveTo(RLX, -260); c.lineTo(RLX + 120, -10); c.stroke();
  if (on) { c.fillStyle = 'rgba(255,248,220,.35)'; c.beginPath(); c.arc(RLX, RLY, 190, 0, TAU); c.fill(); }
  c.strokeStyle = on ? '#FFF8DC' : '#DCD6CC'; c.lineWidth = 34; c.beginPath(); c.arc(RLX, RLY, 125, 0, TAU); c.stroke(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 4; c.beginPath(); c.arc(RLX, RLY, 143, 0, TAU); c.stroke(); c.beginPath(); c.arc(RLX, RLY, 107, 0, TAU); c.stroke();
  const hasPhone = !(L === 'hook' || L === 'A1' || L === 'A2' || (L === 'B1' && t < ev('phone') + 0.25));
  if (hasPhone) { c.fillStyle = '#1E2128'; rr(c, RLX - 44, RLY - 80, 88, 160, 14); c.fill(); c.fillStyle = '#4A5068'; c.beginPath(); c.arc(RLX - 18, RLY - 56, 9, 0, TAU); c.fill();
    if (on) { c.fillStyle = '#E0474C'; rr(c, RLX - 40, RLY + 96, 80, 34, 10); c.fill(); txt(c, 'LIVE', RLX, RLY + 114, 22, '#FFFFFF'); } } }
function studentDesks(c, back) { if (back) { paint(c, q => { q.m(560, BDESK); q.l(1480, BDESK); q.l(1480, BDESK + 36); q.l(560, BDESK + 36); q.z(); }, '#C49464', { sd: 5, hd: 3, lw: 4 }); c.fillStyle = '#A97A4C'; c.fillRect(580, BDESK + 36, 880, 330); return; }
  for (const [a, b] of [[300, 760], [790, 1250]]) { paint(c, q => { q.m(a, DESK); q.l(b, DESK); q.l(b, DESK + 44); q.l(a, DESK + 44); q.z(); }, '#B98556', { sd: 6, hd: 3, lw: 4 });
    paint(c, q => { q.m(a + 20, DESK + 44); q.l(b - 20, DESK + 44); q.l(b - 20, 760); q.l(a + 20, 760); q.z(); }, '#9C6A42', { sd: 10, hd: 4, lw: 4 }); }
  c.fillStyle = '#FFFDF8'; rr(c, 380, DESK - 18, 150, 18, 4); c.fill(); rr(c, 880, DESK - 18, 150, 18, 4); c.fill(); }

// ---------------- characters
function gest(st, g, who, t, side, base) { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } }
const hang = (g, s) => reach(g, s, s * g.sw * 0.8, g.ySh + 330);
// teacher: glasses = 'on' | 'off' | 'slide'
function teacherState(t, L) { const g = G.teacher; const st = { t, talk: talk('teacher', t), mood: 'smug', turn: 0.3, look: 0.5, armL: hang(g, -1), armR: hang(g, 1) };
  let gl = 'on', slide = 0; const skin = TEACH.skin;
  const wave = (side, f = 7) => { st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * g.sw * 1.9, g.ySh - 330 + Math.sin(t * f) * 40, { planar: true }); };
  const thumbs = () => { st.armL = reach(g, -1, -g.sw * 1.5, g.ySh + 40, { planar: true, fist: true }); st.armR = reach(g, 1, g.sw * 1.5, g.ySh + 40, { planar: true, fist: true }); st.items = { L: thumbItem(skin), R: thumbItem(skin) }; };
  const dance = (k = 1) => { const u = t * 7.5; st.headX = Math.sin(u) * 40 * k; st.tilt = Math.sin(u) * 0.08 * k; st.armL = reach(g, -1, -g.sw * (1.6 + 0.5 * Math.sin(u)), g.ySh - 200 + Math.cos(u) * 200 * k, { planar: true }); st.armR = reach(g, 1, g.sw * (1.6 + 0.5 * Math.cos(u)), g.ySh - 100 - Math.sin(u) * 220 * k, { planar: true }); st.legPose = 'wide'; st.mood = 'happy'; };
  if (L === 'hook') { st.mood = 'smug'; wave(1, 3); if (speaking('hook_t', t, 0.1)) { st.mood = 'happy'; st.armL = reach(g, -1, -g.sw * 2.1, g.ySh - 260, { planar: true }); st.armR = reach(g, 1, g.sw * 2.1, g.ySh - 260, { planar: true }); }
    if (t > SP.hook_s.t - 0.1) { st.mood = 'smug'; st.armR = hang(g, 1); st.armL = reach(g, -1, -g.sw * 0.4, g.ySh + 250); }
    if (t > hev('phone') - 0.1) { st.armR = reach(g, 1, g.sw * 1.3, g.ySh - 120, { planar: true }); st.items = { R: phoneItem }; st.mood = 'happy'; } }
  if (L === 'A1') { const s0 = ev('strut'), off = ev('off');
    if (t > s0 && t < endOf('a1_t') + 0.4) { const u = (t - s0) * 6; st.legPose = 'walk'; st.t = t; st.headX = Math.sin(u) * 25; st.tilt = Math.sin(u) * 0.05; st.mood = 'happy'; wave(1, 8); st.armL = reach(g, -1, -g.sw * 1.2, g.ySh + 200 + Math.sin(u) * 60, { planar: true }); }
    if (speaking('a1_t2', t, 0.1, 0.4)) { thumbs(); st.mood = 'smug'; st.turn = 0.15; }
    if (t > SP.a1_s2.t) { st.mood = 'surprised'; }
    if (t > off - 0.05) { const k = eIO(P(t, off, off + 0.5)); gl = k < 0.5 ? 'on' : 'off'; st.armR = reach(g, 1, lerp(g.hw * 0.6, g.sw * 1.3, k), lerp(g.headY + g.hh * 0.1, g.ySh + 140, k)); if (k >= 0.5) st.items = { R: shadesItem }; st.mood = 'sad'; st.turn = 0.1; st.look = 0.2; } }
  if (L === 'A2') { gl = 'off'; st.items = { R: shadesItem }; st.mood = 'happy'; st.armR = reach(g, 1, g.sw * 1.0, g.ySh + 200);
    const e0 = ev('erase'); if (t > e0 - 0.1 && t < e0 + 1.0) { st.turn = -0.5; st.look = -0.8; st.armL = reach(g, -1, -g.sw * 1.6 + Math.sin(t * 16) * 60, g.headY - 40 + Math.cos(t * 16) * 50, { planar: true }); st.items = { L: eraserItem, R: shadesItem }; }
    if (speaking('a2_t', t, 0.05, 0.3)) { st.mood = 'happy'; st.armL = reach(g, -1, -g.sw * 1.7, g.ySh - 360, { planar: true }); st.armR = reach(g, 1, g.sw * 1.7, g.ySh - 360, { planar: true }); }
    if (speaking('a2_t2', t, 0.1)) { st.mood = 'smug'; gest(st, g, 'teacher', t, -1, 120); }
    if (t > SP.a2_s2.t) { st.mood = 'happy'; st.turn = 0.4; st.look = 0.6; }
    if (t > ev('thumbs') - 0.05) { thumbs(); st.mood = 'smug'; st.turn = 0.2; st.look = 0.3; } }
  if (L === 'B1') { const ph = ev('phone'); st.mood = 'happy'; st.items = { R: phoneItem }; st.armR = reach(g, 1, g.sw * 1.3, g.ySh - 120, { planar: true });
    if (t > ph - 0.1 && t < ph + 0.4) { st.armR = reach(g, 1, g.sw * 2.1, g.ySh - 160, { planar: true }); }
    if (t > ph + 0.3) { st.items = {}; st.armR = hang(g, 1); gl = 'on'; }
    if (t > ph + 0.3 && t < SP.b1_t.t) { st.armR = reach(g, 1, g.hw * 0.7, g.headY + g.hh * 0.05); }   // glasses back on
    if (speaking('b1_t', t, 0.05)) { st.mood = 'happy'; st.turn = 0.35; st.look = 0.7; gest(st, g, 'teacher', t, 1, 60); gest(st, g, 'teacher', t, -1, 100); }
    if (speaking('b1_t2', t, 0.05, 0.3)) { st.mood = 'smug'; st.armL = reach(g, -1, -g.sw * 0.4, g.ySh + 250); st.armR = reach(g, 1, g.sw * 0.5, g.ySh + 200); }
    if (t > ev('stare')) { st.mood = 'happy'; st.turn = 0.4; st.look = 0.7; } }
  if (L === 'B2') { st.mood = 'happy';
    if (t > ev('music') - 0.1 && t < ev('dance')) { st.armR = reach(g, 1, g.sw * 2.2, g.ySh - 100, { planar: true }); st.turn = 0.5; st.look = 0.8; }
    if (t > ev('dance')) dance(1);
    const h = ev('hit'); if (t > h - 0.25 && t < h + 0.4) { st.armL = reach(g, -1, -g.sw * 2.3, g.ySh + 200, { planar: true }); st.mood = 'shock'; }
    if (t > h + 0.4 && t < SP.b2_t2.t - 0.2) { st.mood = 'worried'; st.headX = 0; st.tilt = 0; st.legPose = 'stand'; st.armL = hang(g, -1); st.armR = hang(g, 1); st.turn = -0.3; st.look = -0.7; }
    if (t > SP.b2_t2.t - 0.2) dance(0.8); }
  if (L === 'C1') { const s0 = ev('stop');
    if (t < s0 + 0.05) dance(0.8);
    else { st.mood = 'shock'; st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 250, { planar: true }); st.armR = reach(g, 1, g.sw * 1.6, g.ySh - 180, { planar: true }); st.turn = -0.6; st.look = -0.9; st.legPose = 'wide'; }
    if (t > ev('straight') - 0.05) { st.mood = 'worried'; st.legPose = 'stand'; st.armL = hang(g, -1); st.armR = hang(g, 1); st.turn = -0.5; st.look = -0.8; }
    if (speaking('c1_t', t, 0.05)) { st.mood = 'neutral'; gest(st, g, 'teacher', t, 1, 160); }
    if (t > ev('scared') - 0.05) { st.mood = 'shock'; st.turn = 0.5; st.look = 0.9; st.armL = hang(g, -1); st.armR = hang(g, 1); }
    if (t > ev('pphone')) { st.mood = 'worried'; st.turn = -0.5; st.look = -0.8; }
    if (speaking('c1_t2', t, 0.1, 0.5)) { st.mood = 'happy'; gest(st, g, 'teacher', t, -1, 160); }
    if (t > ev('fade') + 0.3) { st.mood = 'worried'; } }
  if (L === 'C2') { st.mood = 'worried'; st.turn = -0.5; st.look = -0.8;
    if (t > ev('freeze') - 0.05) { st.mood = 'shock'; st.blink = 0; st.armL = reach(g, -1, -g.sw * 1.5, g.ySh - 200, { planar: true }); st.armR = reach(g, 1, g.sw * 1.5, g.ySh - 160, { planar: true }); }
    if (t > ev('turn') - 0.05) { st.mood = 'shock'; st.turn = lerp(-0.5, 0.5, eIO(P(t, ev('turn'), ev('turn') + 0.9))); st.look = st.turn * 1.5; st.armL = hang(g, -1); st.armR = hang(g, 1); }
    if (t > SP.c2_t2.t) { st.mood = 'sad'; st.turn = 0.1; st.look = 0.1; }
    if (t > SP.c2_p2.t) { st.mood = 'worried'; st.turn = -0.5; st.look = -0.8; }
    if (speaking('c2_t3', t, 0.05, 0.3)) { st.mood = 'shock'; st.armL = reach(g, -1, -g.sw * 1.4, g.ySh - 160, { planar: true }); st.armR = reach(g, 1, g.sw * 1.4, g.ySh - 160, { planar: true }); }
    if (t > ev('comments')) { st.mood = 'worried'; st.turn = -0.4; st.look = -0.6; }
    if (t > ev('face') - 0.05) { st.mood = 'sad'; st.armL = reach(g, -1, -g.hw * 1.05, g.headY + 90, { planar: true }); st.armR = reach(g, 1, g.hw * 1.05, g.headY + 90, { planar: true }); st.headFirst = true; st.turn = 0; st.look = 0; }
    if (speaking('c2_t4', t, 0.05)) { st.mood = 'angry'; st.headFirst = true; st.turn = -0.1; st.lookY = -0.4; st.armL = reach(g, -1, -g.sw * 1.3, g.ySh - 60, { planar: true, fist: true }); st.armR = reach(g, 1, g.sw * 1.3, g.ySh - 60, { planar: true, fist: true }); }
    if (t > endOf('c2_t4') + 0.1) { st.mood = 'sad'; st.headFirst = true; st.lookY = 0; st.turn = 0.25; st.look = 0.6; st.armL = hang(g, -1); st.armR = hang(g, 1); }
    if (t > ev('slide') - 0.05) { st.mood = 'sad'; st.turn = 0.05; st.look = 0.1; st.lookY = 0.3; slide = eIO(P(t, ev('slide'), ev('slide') + 1.0)); gl = 'slide'; } }
  if (gl !== 'off') { const tn = st.turn || 0; st.front = (cc, gg) => shades(cc, gg, g, tn, slide); }
  return st; }
function stuState(t, L) { const g = G.stu, st = { t, talk: talk('stu', t), mood: 'bored', turn: -0.35, look: -0.6, armL: reach(g, -1, -g.sw * 0.9, DESK - SF - 40), armR: reach(g, 1, g.sw * 0.9, DESK - SF - 40) }; let dy = 0;
  if (L === 'hook') { st.mood = 'skeptical'; if (t > SP.hook_t.t + 0.3) st.mood = 'surprised'; if (speaking('hook_s', t, 0.1)) st.mood = 'skeptical'; if (t > SP.hook_t2.t) st.mood = 'bored'; }
  if (L === 'A1') { const lift = ev('lift'); if (t < lift + 0.6) { const k = eIO(P(t, lift, lift + 0.6)); dy = lerp(110, 0, k); st.lookY = lerp(0.8, 0, k); st.mood = 'tired'; st.headFirst = false; st.armL = reach(g, -1, -g.sw * 0.4, DESK - SF - 120); st.armR = reach(g, 1, g.sw * 0.4, DESK - SF - 120); }
    else st.mood = 'bored'; if (speaking('a1_s2', t, 0.1, 0.3)) st.mood = 'annoyed'; if (t > ev('off')) st.mood = 'skeptical'; }
  if (L === 'A2') { const ch = ev('cheer'); if (t > ch && t < SP.a2_s2.t) { dy = -Math.abs(Math.sin((t - ch) * 7)) * 140; st.mood = 'happy'; st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 420, { planar: true }); st.armR = reach(g, 1, g.sw * 1.6, g.ySh - 420, { planar: true }); }
    if (speaking('a2_s', t, 0.05)) st.mood = 'surprised'; if (t > SP.a2_s2.t) { st.mood = 'skeptical'; } }
  if (L === 'B1') { if (t > ev('buzz') && t < SP.b1_s.t) { st.mood = 'surprised'; dy = -40; } if (speaking('b1_s', t, 0.1, 0.3)) st.mood = 'skeptical'; if (t > ev('stare')) { st.mood = 'skeptical'; st.blink = 0; } }
  if (L === 'B2') { st.mood = 'skeptical'; if (t > ev('dance')) st.mood = 'shock'; if (speaking('b2_s', t, 0.1)) st.mood = 'surprised'; if (speaking('b2_s2', t, 0.1, 0.3)) st.mood = 'annoyed'; if (t > ev('door')) { st.mood = 'shock'; st.look = -1; } }
  if (L === 'C1') { st.mood = 'skeptical'; const hd = ev('hand'); if (t > hd - 0.05 && t < endOf('c1_s') + 0.2) { st.armR = reach(g, 1, g.sw * 1.1, g.headY - 220, { planar: true }); st.mood = 'smug'; } if (t > endOf('c1_s') + 0.2) st.mood = 'smug'; }
  if (L === 'C2') { st.mood = 'surprised'; if (t > SP.c2_t3.t) st.mood = 'shock'; if (t > ev('comments')) st.mood = 'smug';
    if (speaking('c2_s', t, 0.1, 2.5)) { st.mood = 'bored'; st.turn = -0.3; st.look = -0.4; } }
  return { st, dy }; }
function stu2State(t, L) { const g = G.stu2, st = { t, talk: talk('stu2', t), mood: 'neutral', turn: -0.4, look: -0.7, armL: reach(g, -1, -g.sw * 0.9, DESK - SF - 40), armR: reach(g, 1, g.sw * 0.9, DESK - SF - 40) }; let dy = 0;
  if (L === 'hook') st.mood = t > SP.hook_t.t + 0.3 ? 'surprised' : 'neutral';
  if (L === 'A1') st.mood = t > SP.a1_t.t ? 'skeptical' : 'neutral';
  if (L === 'A2') { const ch = ev('cheer'); if (t > ch && t < SP.a2_s2.t - 0.2) { dy = -Math.abs(Math.sin((t - ch) * 7 + 1)) * 130; st.mood = 'happy'; st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 420, { planar: true }); st.armR = reach(g, 1, g.sw * 1.6, g.ySh - 420, { planar: true }); }
    if (t > SP.a2_s2.t - 0.2) { st.mood = 'skeptical'; st.turn = -0.2; } }
  if (L === 'B1') st.mood = t > ev('stare') ? 'skeptical' : t > ev('buzz') ? 'happy' : 'neutral';
  if (L === 'B2') st.mood = t > ev('dance') ? 'shock' : 'skeptical';
  if (L === 'C1' || L === 'C2') st.mood = t > ev('comments') ? 'happy' : 'worried';
  return { st, dy }; }
function extraState(who, t, L) { const g = G[who], st = { t, talk: 0, mood: 'bored', turn: -0.3, look: -0.6, armL: reach(g, -1, -g.sw * 0.9, BDESK - BACKF - 40), armR: reach(g, 1, g.sw * 0.9, BDESK - BACKF - 40) }; let dy = 0;
  if (L === 'A2') { const ch = ev('cheer'); if (t > ch && t < SP.a2_s2.t) { dy = -Math.abs(Math.sin((t - ch) * 7 + (who === 'rita' ? 2 : 3))) * 110; st.mood = 'happy'; st.armL = reach(g, -1, -g.sw * 1.5, g.ySh - 380, { planar: true }); st.armR = reach(g, 1, g.sw * 1.5, g.ySh - 380, { planar: true }); } else if (t > SP.a2_s2.t) st.mood = 'skeptical'; }
  if (L === 'A1') st.mood = 'skeptical'; if (L === 'B1') st.mood = t > ev('stare') ? 'bored' : t > ev('buzz') ? 'happy' : 'bored';
  if (L === 'B2') { st.mood = t > ev('dance') ? (who === 'max' ? 'happy' : 'shock') : 'bored'; if (t > ev('hit') && who === 'max') { st.mood = 'shock'; } }
  if (L === 'C1' || L === 'C2') { st.mood = t > ev('comments') ? 'happy' : 'worried'; if (L === 'C2' && t > SP.c2_s.t + 0.6) st.mood = 'smug'; }
  return { st, dy }; }
function prinState(t, L) { const g = G.prin, st = { t, talk: talk('prin', t), mood: 'skeptical', turn: 0.45, look: 0.8, armL: hang(g, -1), armR: hang(g, 1) };
  const cross = () => { st.armL = reach(g, -1, g.sw * 0.55, g.ySh + 230); st.armR = reach(g, 1, -g.sw * 0.55, g.ySh + 250); };
  if (L === 'B2') { st.mood = 'shock'; if (t > ev('door') + 0.6) { st.mood = 'annoyed'; cross(); } }
  if (L === 'C1') { st.mood = 'annoyed'; cross(); if (speaking('c1_p', t, 0.1, 0.3)) { st.mood = 'annoyed'; st.armL = hang(g, -1); gest(st, g, 'prin', t, 1, 120); }
    if (t > ev('hand')) { st.mood = 'skeptical'; st.turn = 0.6; st.look = 1; }
    const pp = ev('pphone'); if (t > pp - 0.05) { st.armL = hang(g, -1); st.armR = reach(g, 1, g.sw * 0.6, g.ySh + 20); st.items = { R: pphoneItem }; st.mood = 'smug'; st.lookY = 0.45; st.turn = 0.3; st.look = 0.3; }
    if (speaking('c1_p2', t, 0.1, 0.3)) { st.mood = 'smug'; st.lookY = 0.3; }
    if (t > ev('fade')) { const k = P(t, ev('fade'), ev('fade') + 0.9); st.mood = k < 0.4 ? 'happy' : k < 0.8 ? 'neutral' : 'annoyed'; st.lookY = 0.5; } }
  if (L === 'C2') { st.mood = 'annoyed'; st.items = { R: pphoneItem }; st.armR = reach(g, 1, g.sw * 0.6, g.ySh + 20); st.lookY = 0;
    if (t > ev('show') - 0.05) { st.armR = reach(g, 1, g.sw * 2.0, g.ySh - 60, { planar: true }); }
    if (speaking('c2_p', t, 0.1, 0.2)) { st.mood = 'skeptical'; gest(st, g, 'prin', t, -1, 160); }
    if (t > SP.c2_p2.t - 0.1) { st.mood = 'smug'; st.armR = reach(g, 1, g.sw * 0.6, g.ySh + 20); st.lookY = 0.4; }
    if (t > ev('comments') - 0.1) { st.armR = reach(g, 1, g.sw * 2.0, g.ySh - 60, { planar: true }); st.lookY = 0; st.mood = 'bored'; } }
  return st; }

// ---------------- the world + which characters a shot draws (clean singles: only the tagged character)
const DRAW = { wide: ['rita', 'max', 'stu', 'stu2', 'teacher', 'prin'], card: ['stu', 'stu2', 'teacher', 'prin'], pt: ['teacher', 'prin'], teacher: ['teacher'], stu: ['stu'], stu2: ['stu2'], prin: ['prin'], class: ['rita', 'max', 'stu', 'stu2'], board: [] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { c.drawImage(BGB, BX0, BY0, BW, BH); const who = DRAW[tag] || DRAW.wide, heads = {};
  board(c, t, L); doorPanel(c, t, L);
  const prinIn = (L === 'B2' && t > ev('door') + 0.15) || L === 'C1' || L === 'C2';
  if (who.includes('prin') && prinIn) { const k = L === 'B2' ? eOut(P(t, ev('door') + 0.15, ev('door') + 0.6)) : 1; heads.prin = K.put(c, PRIN, prinState(t, L), lerp(PX - 260, PX, k), PY); }
  if (tag !== 'board') teacherDesk(c, t, L);
  for (const x of ['rita', 'max']) if (who.includes(x)) { const r = extraState(x, t, L); K.put(c, x === 'rita' ? RITA : MAX, r.st, POS[x][0], POS[x][1] + r.dy, BACKS); }
  if (who.includes('rita') || who.includes('max') || who.includes('stu')) studentDesks(c, true);
  if (who.includes('stu')) { const r = stuState(t, L); heads.stu = K.put(c, JAY, r.st, POS.stu[0], SF + r.dy); }
  if (who.includes('stu2')) { const r = stu2State(t, L); heads.stu2 = K.put(c, CHLOE, r.st, POS.stu2[0], SF + r.dy); }
  if (who.includes('stu') || who.includes('stu2')) studentDesks(c, false);
  if (tag !== 'board') ringLight(c, t, L);
  if (who.includes('teacher')) heads.teacher = K.put(c, TEACH, teacherState(t, L), TX, 0);
  if (tag === 'wide' || tag === 'card' || tag === 'teacher') if (L === 'B2' && t > ev('hit') - 0.05) teacherDesk(c, t, L);   // flying notebooks in front of him
  for (const k of ['stu', 'stu2', 'prin']) if (!heads[k]) heads[k] = OFF; if (!heads.teacher) heads.teacher = OFFL;
  return heads; }

// ---------------- shots (world coordinates; face of a single at ~900 px)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const fy = (who, z, sy = 900) => HY(who) + (960 - sy) / z;
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const SH = { WIDE: S(200, -760, 0.5, 'wide'), DWIDE: S(-80, -840, 0.43, 'wide'), CARD: S(110, fy('teacher', 0.7, 980), 0.7, 'card'), PT: S(-760, fy('teacher', 0.8, 1010), 0.8, 'pt'),
  HOOK: S(TX + 60, fy('teacher', 1.05, 1170), 1.05, 'teacher'), STU_H: S(520, fy('stu', 1.0, 1170), 1.0, 'stu'), TEACH: S(TX, fy('teacher', 1.0), 1.0, 'teacher'), TEACH_R: S(TX, fy('teacher', 1.0, 1120), 1.0, 'teacher'), TEACH_CU: S(TX, fy('teacher', 1.6, 980), 1.6, 'teacher'),
  STU: S(POS.stu[0], fy('stu', 1.0), 1.0, 'stu'), STU_R: S(POS.stu[0], fy('stu', 1.0, 1120), 1.0, 'stu'), STU2: S(POS.stu2[0], fy('stu2', 1.0), 1.0, 'stu2'),
  CLASS: S(880, fy('stu', 0.7, 1150), 0.7, 'class'), PRIN: S(PX + 60, fy('prin', 1.0), 1.0, 'prin'), PRIN_R: S(PX + 60, fy('prin', 1.0, 1120), 1.0, 'prin'), BOARD: S(-240, -1580, 0.78, 'board'),
  PHONE: U('phone', 1), BLACK: U('black', 2) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }); if (L === 'outro') return SH.WIDE;
  const sp = id => speaking(id, t, 0.1, 0.15);
  if (L === 'hook') { if (t < SP.hook_s.t - 0.1) return SH.HOOK; if (t < SP.hook_t2.t - 0.1) return f(SH.STU_H); return f(SH.HOOK); }
  const u = t - sc.s, l = L.toLowerCase(), nar = SP[l + '_nar'];
  if (u < 1.15) return f({ A1: SH.WIDE, A2: SH.WIDE, B1: SH.WIDE, B2: SH.WIDE, C1: SH.DWIDE, C2: SH.PRIN }[L]);
  if (L === 'C2' && t > ev('black') - 0.03 && t < nar.t + 0.05) return f(SH.BLACK);
  if (nar && t >= nar.t - 0.1) return f(L === 'C1' || L === 'C2' ? SH.PT : SH.CARD);
  if (L === 'A1') { if (t < SP.a1_s.t - 0.1) return f(SH.WIDE); if (sp('a1_s') || sp('a1_s2')) return f(SH.STU); if (t > ev('off') - 0.05) return f(SH.TEACH); return f(SH.TEACH); }
  if (L === 'A2') { if (t < SP.a2_t.t - 0.1) return f(SH.WIDE); if (sp('a2_t')) return f(SH.TEACH); if (t < SP.a2_s.t - 0.1) return f(SH.CLASS); if (sp('a2_s')) return f(SH.STU); if (sp('a2_t2')) return f(SH.TEACH); if (sp('a2_s2')) return f(SH.STU2); return f(SH.TEACH); }
  if (L === 'B1') { if (t < SP.b1_t.t - 0.1) return f(SH.WIDE); if (sp('b1_t')) return f(SH.TEACH); if (t < SP.b1_s.t - 0.1) return f(SH.CLASS); if (sp('b1_s')) return f(SH.STU); if (sp('b1_t2')) return f(SH.TEACH);
    if (t > ev('like') - 0.05 && t < ev('stare') - 0.05) return f(SH.PHONE); if (t > ev('stare') - 0.05) return f(SH.CLASS); return f(SH.TEACH); }
  if (L === 'B2') { if (t < SP.b2_s.t - 0.1) return f(SH.WIDE); if (sp('b2_s')) return f(SH.STU); if (sp('b2_t')) return f(SH.TEACH); if (t < SP.b2_s2.t - 0.1) return f(SH.WIDE); if (sp('b2_s2')) return f(SH.STU_R); if (sp('b2_t2')) return f(SH.TEACH);
    if (t > ev('door') - 0.05) return f(SH.DWIDE); return f(SH.TEACH); }
  if (L === 'C1') { if (sp('c1_p')) return f(SH.PRIN); if (sp('c1_t')) return f(SH.TEACH); if (t > ev('hand') - 0.05 && t < endOf('c1_s') + 0.1) return f(SH.STU); if (t > ev('scared') - 0.05 && t < ev('pphone') - 0.05) return f(SH.TEACH_R);
    if (t > ev('pphone') - 0.05 && t < SP.c1_t2.t - 0.1) return f(SH.PRIN); if (sp('c1_t2')) return f(SH.TEACH); if (t > ev('fade') - 0.05) return f(SH.PRIN_R); return f(SH.TEACH); }
  if (L === 'C2') { const p = SP.c2_p, w = p.words, c2 = w && w.length > 4 ? p.t + w[4][1] : p.t + 2.4, c3 = w && w.length > 11 ? p.t + w[11][1] : p.t + 5;
    if (t < c2 - 0.1) return f(SH.PRIN); if (t < c3 - 0.1) return f(SH.TEACH_R); if (t < endOf('c2_p') + 0.1) return f(SH.PRIN);
    if (t < ev('live2') - 0.05) return f(SH.TEACH); if (t < ev('turn') - 0.05) return f(SH.PHONE); if (t < SP.c2_t2.t - 0.1) return f(SH.BOARD); if (sp('c2_t2')) return f(SH.TEACH);
    if (sp('c2_p2')) return f(SH.PRIN); if (sp('c2_t3')) return f(SH.TEACH); if (t > ev('comments') - 0.05 && t < ev('face') - 0.05) return f(SH.PHONE);
    if (t < SP.c2_s.t - 0.1) return f(SH.TEACH); if (sp('c2_s')) return f(SH.STU); return f(SH.TEACH_CU); }
  return SH.TEACH; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- phone screen inserts (the live stream)
function streamPic(c, w, h, t, L, wide) {   // what the phone camera sees: the teacher in front of the board (answer key on the right)
  c.fillStyle = '#E6DCC6'; c.fillRect(0, 0, w, h); const s = wide ? 0.17 : 0.28;
  c.save(); c.translate(w * 0.42, 50 + 1660 * s + (wide ? 70 : 0)); c.scale(s, s); c.translate(-TX, 0);
  board(c, t, wide ? 'C2' : L); const st = teacherState(t, L); st.turn = -0.15; st.look = -0.3; st.talk = 0;
  if (!wide) { st.mood = 'happy'; } K.put(c, TEACH, st, TX, 0); c.restore();
  if (wide) { c.strokeStyle = '#F2C14E'; c.lineWidth = 6; c.beginPath(); c.ellipse(w * 0.76, h * 0.38, w * 0.22, h * 0.26, -0.05, 0, TAU * clamp(P(t, ev('live2') + 0.5, ev('live2') + 0.9))); c.stroke(); } }
function phoneView(c, t, L) { const ins = (cc, w, h) => {
    const wide = L === 'C2'; cc.fillStyle = '#14161E'; cc.fillRect(0, 0, w, h);
    cc.save(); cc.beginPath(); cc.rect(0, 70, w, 330); cc.clip(); cc.translate(0, 70); streamPic(cc, w, 330, t, L, wide); cc.restore();
    cc.fillStyle = '#E0474C'; rr(cc, 16, 86, 82, 34, 8); cc.fill(); txt(cc, 'LIVE', 57, 104, 20, '#FFFFFF');
    const viewers = wide ? '12,847' : '1'; cc.fillStyle = 'rgba(0,0,0,.6)'; rr(cc, 106, 86, wide ? 200 : 120, 34, 8); cc.fill(); txt(cc, viewers + ' 👀'.replace(' 👀', ' viewer' + (wide ? 's' : '')), wide ? 206 : 166, 104, 20, '#FFFFFF', 'Nun9');
    fitTxt(cc, '@mr.mark.maths', 20, 40, 22, '#FFFFFF', 300, 'Nun9', 'left');
    if (wide) { const k = eBack(P(t, ev('live2') + 0.1, ev('live2') + 0.4), 2); if (k > 0) { cc.save(); cc.translate(w / 2, 470); cc.scale(k, k); cc.fillStyle = '#E0474C'; rr(cc, -190, -50, 380, 100, 22); cc.fill(); fitTxt(cc, 'LIVE — 12,847', 0, -14, 34, '#FFFFFF', 350); fitTxt(cc, 'VIEWERS', 0, 24, 26, '#FFFFFF', 300); cc.restore(); } }
    else { const k = eBack(P(t, ev('like'), ev('like') + 0.35), 2.2); if (k > 0) { cc.save(); cc.translate(w / 2, 470); cc.scale(k, k); cc.fillStyle = '#EE5E9A'; cc.beginPath(); cc.moveTo(-120, 4); cc.bezierCurveTo(-170, -30, -150, -70, -120, -50); cc.bezierCurveTo(-90, -70, -70, -30, -120, 4); cc.fill(); fitTxt(cc, '1 LIKE', 30, -22, 52, '#FFFFFF', 260); cc.restore(); } }
    const a = wide ? ev('comments') : ev('comment'); const k2 = eBack(P(t, a, a + 0.3), 2); if (k2 > 0) { cc.save(); cc.translate(0, 560); cc.scale(1, k2);
      cc.fillStyle = '#2B2F3A'; rr(cc, 14, -40, w - 28, wide ? 160 : 130, 20); cc.fill(); cc.fillStyle = '#F7B6CF'; cc.beginPath(); cc.arc(52, -2, 24, 0, TAU); cc.fill(); txt(cc, 'M', 52, 0, 24, '#8A1C4A');
      fitTxt(cc, 'MOM', 88, -12, 22, '#F7B6CF', 120, 'Unb9', 'left');
      if (wide) { fitTxt(cc, "Sweetheart, you're not cool.", 88, 22, 22, '#FFFFFF', w - 110, 'Nun9', 'left'); fitTxt(cc, 'Please come home.', 88, 52, 22, '#FFFFFF', w - 110, 'Nun9', 'left'); fitTxt(cc, '❤ 3', w - 40, -12, 20, '#F7B6CF', 60, 'Nun9', 'right'); }
      else { fitTxt(cc, 'Proud of you, sweetheart!', 88, 22, 24, '#FFFFFF', w - 110, 'Nun9', 'left'); fitTxt(cc, '❤', w - 40, -12, 20, '#F7B6CF', 60, 'Nun9', 'right'); }
      cc.restore(); }
    cc.fillStyle = 'rgba(255,255,255,.12)'; rr(cc, 14, h - 70, w - 28, 50, 25); cc.fill(); fitTxt(cc, 'Add comment…', 40, h - 45, 20, 'rgba(255,255,255,.55)', 300, 'Nun9', 'left'); };
  const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, '#2B3040'); g.addColorStop(1, '#171A24'); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'phone' });
  K.phone(c, 540, 830, 1.5, ins);
  // Russian translation of the visible comment, under the phone
  const a = L === 'C2' ? ev('comments') : ev('comment'), k = clamp(P(t, a + 0.2, a + 0.45));
  if (k > 0 && !(L === 'B1' && t < ev('comment'))) { c.save(); c.globalAlpha = k; UI.font(c, 'Nun9', 44); c.textAlign = 'center'; c.textBaseline = 'middle';
    const ru = L === 'C2' ? ['«Дорогой, ты не крутой.', 'Пожалуйста, иди домой»'] : ['«Горжусь тобой, дорогой!»']; ru.forEach((s, i) => UI.strokeText(c, s, 540, 1480 + i * 56, C.pinkL, C.oliveD, 10)); c.restore(); } }

// ---------------- cover badge + frame
function coolBadge(c, t) { const p = 1 + 0.04 * Math.sin(t * 8); c.save(); c.translate(540, 1560); c.scale(p, p); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -330 + 6, -62 + 10, 660, 124, 62); c.fill(); c.fillStyle = '#2B2F3A'; rr(c, -330, -62, 660, 124, 62); c.fill();
  c.fillStyle = '#16181F'; rr(c, -270, -22, 56, 36, 12); c.fill(); rr(c, -204, -22, 56, 36, 12); c.fill(); c.strokeStyle = '#F2C14E'; c.lineWidth = 4; rr(c, -270, -22, 56, 36, 12); c.stroke(); rr(c, -204, -22, 56, 36, 12); c.stroke();
  fitTxt(c, 'COOL MODE: ON', 70, 4, 56, '#F2C14E', 420); c.restore(); }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { K.outro(c, t, { q: ['БЫЛ У ТЕБЯ', 'ТАКОЙ УЧИТЕЛЬ?'], rows: [['A2', 'Are you serious?'], ['B1', "I'll cancel tomorrow's test."], ['C1', 'Would you mind explaining?'], ['C2', 'I appreciate your enthusiasm, but…']], cta: ['РАССКАЖИ', 'В КОММЕНТАХ'], heroX: 170, heroS: 0.4,
    hero: (cc, tt) => { const g = G.teacher, st = { t: tt, mood: 'happy', turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(tt * 8) * 30, { planar: true }), armR: reach(g, 1, g.sw * 1.5, g.ySh + 40, { planar: true, fist: true }), items: { R: thumbItem(TEACH.skin) } };
      st.front = (c2, gg) => shades(c2, gg, g, 0, 0.35); K.put(cc, JAY, { t: tt, mood: 'bored', turn: -0.3, look: -0.5, armL: hang(G.stu, -1), armR: hang(G.stu, 1) }, 1450, 60); K.put(cc, CHLOE, { t: tt, mood: 'happy', turn: -0.2, look: -0.4, armL: hang(G.stu2, -1), armR: reach(G.stu2, 1, G.stu2.sw * 1.9, G.stu2.ySh - 300 + Math.sin(tt * 7) * 30, { planar: true }) }, 1950, 60); K.put(cc, TEACH, st, 0, 0); } });
    Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag === 'ui:black') { c.fillStyle = '#000000'; c.fillRect(0, 0, W, HH); UI.watermark(c); return; }
  if (tag === 'ui:phone') { c.save(); c.translate(sh.x, sh.y); phoneView(c, t, L); c.restore(); heads = { teacher: OFFL, stu: OFF, stu2: OFF, prin: OFF }; proj = p => p; }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26); }
  if (L === 'hook') { coolBadge(c, t);
    K.bubbles(c, t, { id: 'hook' }, heads, proj, { heroine: 'teacher', names: { stu: ['JAY', '#7A5BC6'] }, hold: { hook_t: 0.2, hook_s: 0.2, hook_t2: 0.3 } }); K.titleRibbon(c, t, 540, 455); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); UI.captions(c, t);
    Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  if (L === 'B2' && t > ev('hit') && t < SP.b2_s2.t - 0.05 && tag === 'wide') K.pop(c, t, 'БАЦ!', ev('hit'), SP.b2_s2.t - 0.35, 760, 1250, C.gold, -0.1, 110);
  if (L === 'A1' && t > ev('off') + 0.3 && t < SP.a1_nar.t - 0.1) K.dots(c, t, ev('off') + 0.3, SP.a1_nar.t - 0.1, 1450);
  if (L === 'B1' && tag === 'class') K.dots(c, t, ev('stare') + 0.1, SP.b1_nar.t - 0.1, 1450);
  K.bubbles(c, t, sc, heads, proj, { heroine: 'teacher', names: { stu: ['JAY', '#7A5BC6'], stu2: ['CHLOE', '#E9A23B'], prin: ['PRINCIPAL', '#2B3A67'] }, hold: { a1_s2: 0.6, b1_t2: 0.3, c1_p2: 0.4, c2_t4: 0.3, c2_s: 1.2 } });
  K.hud(c, t, sc);
}
E.run('teacher', NF, renderFrame);
