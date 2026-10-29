// "When you forget your password" episode renderer (hard_cut camera): node password.js start end out.mp4 | --png=f1,f2
// Her lines are shot in her room behind the laptop (world camera, room from mic.js). The system lives on the laptop screen:
// shots tagged 'ui:<view>' (screen, phone, keys, black) replace the world.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/password/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;     // per level: the same event names repeat across levels here

// ---------------- cast (her at home in a mustard jumper)
const HER = { ...BASE.her_lift, top: { type: 'sweater', col: '#E9A23B' }, bottom: { type: 'joggers', col: '#6B6F86' } };
const G = { her: geom(HER) };
const HF = 420, DESK = -400;                       // her feet are hidden below the desk: she "sits" behind it
const herHY = HF + G.her.headY;
function txt(c, s, x, y, size, col, font = 'Unb9', align = 'center') { c.font = `${size}px ${font}`; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- room (same flat as mic.js, evening lamp instead of the poster)
const BX0 = -2000, BY0 = -2700, BW = 4000, BH = 3800, BS = 0.5;
function drawRoom(c) {
  c.fillStyle = '#E3E6D6'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = 'rgba(255,255,255,.18)'; for (let x = BX0; x < BX0 + BW; x += 160) c.fillRect(x, BY0, 70, BH);
  c.fillStyle = '#FFFDF8'; rr(c, 260, -2050, 820, 980, 20); c.fill(); c.fillStyle = '#BFE3F7'; rr(c, 290, -2020, 760, 920, 10); c.fill();
  c.fillStyle = '#9ED39A'; c.beginPath(); c.ellipse(560, -1150, 420, 160, 0, 0, TAU); c.fill(); c.fillStyle = '#FFFDF8'; c.fillRect(662, -2020, 16, 920); c.fillRect(290, -1570, 760, 16);
  c.fillStyle = '#8CB369'; c.fillRect(220, -2090, 140, 1080); c.fillRect(980, -2090, 140, 1080);
  c.fillStyle = '#B07A4E'; c.fillRect(-1250, -1700, 760, 34); c.fillRect(-1250, -1260, 760, 34);
  const BK = ['#E0474C', '#3C8FE0', '#F2C14E', '#4CAF6A', '#8E5BD6', '#EE5E9A', '#2B2F3A'];
  for (const sy of [-1700, -1260]) for (let i = 0; i < 9; i++) { const h = 170 + hash(i + sy) * 120; c.fillStyle = BK[(i * 3 + (sy & 3)) % BK.length]; rr(c, -1230 + i * 62, sy - h, 54, h, 6); c.fill(); }
  c.fillStyle = '#FFFDF8'; rr(c, -420, -2050, 420, 300, 12); c.fill(); c.fillStyle = '#3C8FE0'; rr(c, -395, -2025, 370, 250, 8); c.fill(); txt(c, 'KEEP', -210, -1940, 60, '#FFFDF8'); txt(c, 'CALM', -210, -1860, 60, '#FFFDF8');
  c.fillStyle = '#C9A57E'; c.fillRect(BX0, -260, BW, 1060);
}
const BGB = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); { const c = BGB.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); c.filter = 'blur(1.6px)'; drawRoom(c); }
function desk(c, t, L) {
  paint(c, q => { q.m(-900, DESK); q.l(900, DESK); q.l(900, DESK + 60); q.l(-900, DESK + 60); q.z(); }, '#B98556', { sd: 6, hd: 3, lw: 4 });
  paint(c, q => { q.m(-860, DESK + 60); q.l(860, DESK + 60); q.l(860, 900); q.l(-860, 900); q.z(); }, '#9C6A42', { sd: 10, hd: 4, lw: 4 });
  paint(c, q => { q.m(-250, DESK - 330); q.l(250, DESK - 330); q.l(262, DESK - 8); q.l(-262, DESK - 8); q.z(); }, '#C9CED6', { sd: 8, hd: 4, lw: 4 });
  c.fillStyle = '#AEB4BE'; rr(c, -280, DESK - 14, 560, 22, 8); c.fill();
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(0, DESK - 180, 34, 0, TAU); c.fill(); c.fillStyle = '#C9CED6'; c.beginPath(); c.arc(0, DESK - 180, 20, 0, TAU); c.fill(); c.fillRect(-8, DESK - 214, 16, 30);   // padlock logo
  // sticky note "password?" + mug
  c.save(); c.translate(-520, DESK - 40); c.rotate(-0.1); c.fillStyle = '#FFF4B8'; c.fillRect(-90, -90, 180, 160); txt(c, 'password', 0, -30, 34, '#3E471E', 'Cav7'); txt(c, '= ???', 0, 20, 40, '#E0474C', 'Cav7'); c.restore();
  if (L === 'C2' || L === 'B2' || L === 'C1') { c.fillStyle = '#EE5E9A'; rr(c, 480, DESK - 120, 90, 110, 12); c.fill(); c.strokeStyle = '#C8508A'; c.lineWidth = 10; c.beginPath(); c.arc(580, DESK - 70, 22, -1.3, 1.3); c.stroke(); }
}

// ---------------- her
function gest(st, g, who, t, side, base) { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } }
const kb = (side, k = 0) => reach(G.her, side, side * 120 + k, DESK - HF - 60);
const typing = (st, t) => { const u = t * 18; st.armL = reach(G.her, -1, -130 + Math.sin(u) * 20, DESK - HF - 60 - Math.max(0, Math.sin(u)) * 40); st.armR = reach(G.her, 1, 130 + Math.sin(u + 2) * 20, DESK - HF - 60 - Math.max(0, Math.sin(u + 2)) * 40); };
const fists = (st, g) => { st.armL = reach(g, -1, -g.sw * 1.4, g.ySh - 120, { planar: true, fist: true }); st.armR = reach(g, 1, g.sw * 1.4, g.ySh - 120, { planar: true, fist: true }); };
// head on the desk: she sinks behind the laptop lid (HEAD .. RISE)
const sink = (t, L) => L === 'C2' ? eIO(P(t, ev('C2', 'head') - 0.2, ev('C2', 'head') + 0.15)) * (1 - eIO(P(t, ev('C2', 'rise'), ev('C2', 'rise') + 0.35))) : 0;
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { t, talk: talk('her', t), mood: 'neutral', turn: 0, look: 0, armL: kb(-1), armR: kb(1) };
  if (L === 'hook') { st.mood = 'angry'; fists(st, g); if (t > SP.hook_x.t) { st.mood = 'annoyed'; st.armL = kb(-1); st.armR = kb(1); } }
  if (L === 'A1') { st.mood = 'neutral';
    if (t > e('type') && t < e('enter') + 0.2) { typing(st, t); st.lookY = 0.3; st.mood = 'smug'; }
    if (t > SP.a1_x.t) st.mood = 'surprised'; if (speaking('a1_her2', t, 0.05, 0.2)) { st.mood = 'annoyed'; gest(st, g, 'her', t, -1, 200); }
    if (t > e('type2') && t < SP.a1_x2.t) { typing(st, t); st.lookY = 0.3; st.mood = 'annoyed'; }
    if (speaking('a1_her3', t, 0.05, 0.4)) { st.mood = 'angry'; fists(st, g); st.lookY = -0.3; }
    if (t > e('attempts')) { st.mood = 'worried'; } }
  if (L === 'A2') { st.mood = 'worried';
    if (speaking('a2_her', t, 0.05, 0.3)) { st.mood = 'happy'; gest(st, g, 'her', t, -1, 200); }
    if (t > e('type') && t < SP.a2_x2.t) { typing(st, t); st.mood = 'happy'; st.lookY = 0.3; }
    if (t > e('stare')) { st.mood = 'tired'; st.lookY = 0; }
    if (speaking('a2_her2', t, 0.05, 0.3)) { st.mood = 'annoyed'; st.armL = reach(g, -1, -g.sw * 1.7, g.ySh - 160, { planar: true }); st.armR = reach(g, 1, g.sw * 1.7, g.ySh - 160, { planar: true }); } }
  if (L === 'B1') { st.mood = 'neutral'; st.armR = reach(g, 1, g.sw * 1.2, g.ySh - 40, { planar: true });
    if (speaking('b1_her', t, 0.05, 0.3)) { st.mood = 'happy'; st.armL = reach(g, -1, -g.sw * 1.9, g.ySh - 300, { planar: true }); }
    if (t > e('code') - 0.05 && t < SP.b1_x2.t) { typing(st, t); st.mood = 'smug'; }
    if (t > SP.b1_x2.t) { st.mood = 'shock'; st.armL = kb(-1); st.armR = kb(1); }
    if (speaking('b1_her2', t, 0.05, 0.3)) { st.mood = 'angry'; st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 200, { planar: true }); st.armR = reach(g, 1, g.sw * 1.6, g.ySh - 200, { planar: true }); }
    if (speaking('b1_her3', t, 0.05, 0.3)) { st.mood = 'angry'; fists(st, g); }
    if (t > e('eyes')) { st.mood = 'tired'; st.blink = clamp(P(t, e('eyes'), e('eyes') + 0.5)); st.armL = kb(-1); st.armR = kb(1); } }
  if (L === 'B2') { st.mood = 'tired';
    if (speaking('b2_her', t, 0.05, 0.3)) { st.mood = 'tired'; st.lookY = 0.1; }
    if (t > e('captcha') && t < SP.b2_x2.t) { st.mood = 'skeptical'; st.lookY = 0.3; st.armR = reach(g, 1, 160, DESK - HF - 70); }
    if (speaking('b2_her2', t, 0.05, 0.3)) { st.mood = 'angry'; st.armL = reach(g, -1, -g.sw * 1.8, g.ySh - 260, { planar: true }); st.armR = reach(g, 1, g.sw * 1.8, g.ySh - 260, { planar: true }); }
    if (t > e('stare')) { st.mood = 'shock'; st.blink = 0; }
    if (speaking('b2_her3', t, 0.05, 0.4)) { st.mood = 'shock'; st.armL = reach(g, -1, -g.hw * 1.0, g.headY + 80); st.armR = reach(g, 1, g.hw * 1.0, g.headY + 80); st.headFirst = true; } }
  if (L === 'C1') { st.mood = 'tired';
    if (speaking('c1_her', t, 0.05, 0.2)) { st.mood = 'smug'; gest(st, g, 'her', t, -1, 200); st.turn = 0.1; }
    if ((t > e('banana') && t < SP.c1_x2.t) || (t > e('banana2') && t < SP.c1_x3.t)) { typing(st, t); st.mood = 'happy'; st.lookY = 0.3; }
    if (t > SP.c1_x3.t) st.mood = 'angry';
    if (speaking('c1_her2', t, 0.05, 0.3)) { st.mood = 'angry'; fists(st, g); }
    if (t > e('lookcam')) { st.mood = 'tired'; st.turn = 0; st.look = 0; st.lookY = 0; st.blink = 0; } }
  if (L === 'C2') { st.mood = 'smug';
    if (t > e('type') && t < endOf('c2_her')) { typing(st, t); st.mood = 'smug'; }
    if (t > e('save')) { st.armR = reach(g, 1, 170, DESK - HF - 70); st.mood = 'happy'; }
    if (t > e('error')) { st.mood = 'surprised'; }
    if (t > e('freeze')) { st.mood = 'shock'; st.blink = 0; st.armL = kb(-1); st.armR = kb(1); }
    if (speaking('c2_her2', t, 0.05, 0.2)) { st.mood = 'shock'; st.armL = reach(g, -1, -g.hw * 1.0, g.headY + 80); st.armR = reach(g, 1, g.hw * 1.0, g.headY + 80); st.headFirst = true; }
    if (speaking('c2_her3', t, 0.05, 0.3)) { st.mood = 'angry'; fists(st, g); }
    if (t > e('silence')) { st.mood = 'worried'; st.lookY = 0.4; }
    if (t > e('head') - 0.2) { st.mood = 'tired'; st.blink = 1; st.tilt = 0.2 * sink(t, L); st.armL = kb(-1); st.armR = kb(1); }
    if (t > e('rise')) { st.mood = 'tired'; st.blink = 0; st.tilt = 0; st.lookY = 0; }
    if (speaking('c2_her4', t, 0.05, 0.6)) { st.mood = 'angry'; st.turn = 0; st.look = 0; } }
  return st; }

const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L) { c.drawImage(BGB, BX0, BY0, BW, BH); const heads = { machine: OFF };
  heads.her = K.put(c, HER, herState(t, L), 0, HF + 250 * sink(t, L)); desk(c, t, L); return heads; }
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const SH = { HER: { x: 40, y: herHY + 60, z: 1.0, r: 0, tag: 'her' }, HER_R: { x: 30, y: herHY - 150, z: 1.05, r: 0, tag: 'her' }, HER_CU: { x: 20, y: herHY + 20, z: 1.6, r: 0, tag: 'her' },
  ROOM: { x: 0, y: -760, z: 0.62, r: 0, tag: 'her' }, CARD: { x: 0, y: herHY + (960 - 1180) / 0.82, z: 0.82, r: 0, tag: 'her' },
  SCREEN: U('screen', 1), PHONE: U('phone', 2), KEYS: U('keys', 3), BLACK: U('black', 4) };
// object views per level: [from, to, view]
function views(L) { const e = k => ev(L, k), x = id => endOf(id) + 0.15;
  if (L === 'hook') return [[-1, SP.hook_her.t - 0.1, 'screen'], [hev('blink') - 0.05, 99, 'screen']];
  if (L === 'A1') return [[e('enter') - 0.05, x('a1_x'), 'screen'], [e('type2') + 0.4, x('a1_x2'), 'screen'], [e('attempts') - 0.05, e('a1_nar') - 0.1, 'screen']];
  if (L === 'A2') return [[e('forgot') - 0.05, x('a2_x'), 'screen'], [e('type') - 0.05, x('a2_x2'), 'screen'], [e('mail') - 0.05, e('stare') - 0.05, 'screen']];
  if (L === 'B1') return [[e('sms') - 0.05, x('b1_x'), 'phone'], [e('code') + 0.3, x('b1_x2'), 'screen'], [SP.b1_x3.t - 0.1, x('b1_x3'), 'screen'], [e('sent') - 0.05, e('eyes') - 0.05, 'screen']];
  if (L === 'B2') return [[SP.b2_x.t - 0.1, x('b2_x'), 'screen'], [e('captcha') - 0.05, x('b2_x2'), 'screen'], [e('self9') - 0.05, e('stare') - 0.05, 'screen']];
  if (L === 'C1') return [[e('newpw') - 0.05, x('c1_x'), 'screen'], [e('banana') + 0.2, x('c1_x3'), 'screen'], [e('roman') - 0.05, e('lookcam') - 0.05, 'screen']];
  if (L === 'C2') return [[e('save') - 0.05, e('freeze') - 0.05, 'screen'], [SP.c2_x.t - 0.1, x('c2_x'), 'screen'], [e('caps') - 0.05, e('head') - 0.25, 'keys'], [SP.c2_x3.t - 0.1, e('rise') - 0.05, 'screen'], [e('black') - 0.03, SP.c2_nar.t + 0.05, 'black']];
  return []; }
const hev = k => SC.hook.ev[k];
const viewAt = (t, L) => views(L).find(([a, b]) => t >= a && t < b);
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }); if (L === 'outro') return SH.ROOM;
  const v = viewAt(t, L); if (v) return f(SH[v[2].toUpperCase()]);
  if (L === 'hook') return f(SH.HER_R);
  const u = t - sc.s, l = L.toLowerCase(), nar = SP[l + '_nar'], e = k => ev(L, k);
  if (u < 1.15) return f(L === 'C2' ? SH.HER : SH.ROOM);
  if (nar && t >= nar.t - 0.1) return f(SH.CARD);
  if (L === 'A1' && speaking('a1_her3', t, 0.3, 0.3)) return f(SH.HER_CU);
  if (L === 'A2' && t > e('stare') - 0.05 && t < SP.a2_her2.t - 0.1) return f(SH.HER_R);
  if (L === 'B1' && (speaking('b1_her3', t, 0.3, 0.2))) return f(SH.HER_CU); if (L === 'B1' && t > e('eyes') - 0.05) return f(SH.HER_R);
  if (L === 'B2' && t < SP.b2_x.t - 0.1) return f(SH.ROOM); if (L === 'B2' && speaking('b2_her2', t, 0.3, 0.2)) return f(SH.HER_CU); if (L === 'B2' && t > e('stare') - 0.05 && t < SP.b2_her3.t - 0.1) return f(SH.HER_R);
  if (L === 'C1' && speaking('c1_her2', t, 0.3, 0.2)) return f(SH.HER_CU); if (L === 'C1' && t > e('lookcam') - 0.05) return f(SH.HER_CU);
  if (L === 'C2') { if (t > e('freeze') - 0.05 && t < endOf('c2_her2') + 0.15) return f(SH.HER_CU); if (speaking('c2_her3', t, 0.3, 0.2)) return f(SH.HER_CU);
    if (t > e('silence') - 0.05 && t < e('caps') - 0.05) return f(SH.HER_R); if (t > e('head') - 0.25 && t < SP.c2_x3.t - 0.1) return f(SH.ROOM);
    if (t > e('rise') - 0.05 && t < SP.c2_her4.t - 0.1) return f(SH.HER_R); if (t > SP.c2_her4.t - 0.1) return f(SH.HER_CU); }
  return f(SH.HER); }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- laptop screen (object view on a dark backdrop)
const RED = '#E0474C', BLUE = '#2F6FD8', GREEN = '#2FBF71';
function backdrop(c) { if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'screen' }); const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, '#2B3040'); g.addColorStop(1, '#171A24'); c.fillStyle = g; c.fillRect(0, 0, W, HH); }
function field(c, x, y, w, label, val, o = {}) { txt(c, label, x, y - 34, 24, '#6B7080', 'Nun9', 'left'); c.fillStyle = '#FFFFFF'; c.strokeStyle = o.err ? RED : o.ok ? GREEN : '#C9CED6'; c.lineWidth = 4; rr(c, x, y, w, 70, 14); c.fill(); c.stroke();
  fitTxt(c, val + (o.cursor ? '|' : ''), x + 20, y + 36, o.size || 34, '#2B2F3A', w - 40, o.font || 'Nun9', 'left'); }
function button(c, x, y, w, label, col = BLUE, k = 0) { c.save(); c.translate(x + w / 2, y + 35); c.scale(1 - 0.06 * k, 1 - 0.06 * k); c.fillStyle = col; rr(c, -w / 2, -35, w, 70, 35); c.fill(); fitTxt(c, label, 0, 2, 28, '#FFFFFF', w - 30); c.restore(); }
function mark(c, x, y, r, ok, col = '#FFFFFF') { c.save(); c.strokeStyle = col; c.lineWidth = r * 0.32; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath();
  if (ok) { c.moveTo(x - r * 0.7, y); c.lineTo(x - r * 0.15, y + r * 0.55); c.lineTo(x + r * 0.75, y - r * 0.6); } else { c.moveTo(x - r * 0.6, y - r * 0.6); c.lineTo(x + r * 0.6, y + r * 0.6); c.moveTo(x + r * 0.6, y - r * 0.6); c.lineTo(x - r * 0.6, y + r * 0.6); } c.stroke(); c.restore(); }
function alertBar(c, x, y, w, s, col = RED, k = 1) { if (k <= 0) return; const ic = s[0] === '✓' ? 1 : s[0] === '✗' ? 0 : -1; if (ic >= 0) s = s.slice(2);
  c.save(); c.globalAlpha = clamp(k * 2); c.fillStyle = col; rr(c, x, y, w, 64, 14); c.fill(); if (ic >= 0) mark(c, x + 40, y + 32, 18, ic === 1); fitTxt(c, s, x + w / 2 + (ic >= 0 ? 24 : 0), y + 33, 28, '#FFFFFF', w - (ic >= 0 ? 110 : 30)); c.restore(); }
function star(c, x, y, r, col) { c.fillStyle = col; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr2 = i % 2 ? r * 0.45 : r; c.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); } c.closePath(); c.fill(); }
const dots = n => '•'.repeat(Math.max(0, n));
const typed = (t, a, b, n) => Math.floor(clamp(P(t, a, b)) * n);
function trafficTile(c, x, y, s, kind) { c.fillStyle = ['#BFE3F7', '#CFE8C4', '#E9E1D2'][kind % 3]; c.fillRect(x, y, s, s);
  if (kind === 0 || kind === 3 || kind === 7) { c.fillStyle = '#2B2F3A'; rr(c, x + s * 0.36, y + s * 0.12, s * 0.28, s * 0.62, 10); c.fill(); c.fillRect(x + s * 0.47, y + s * 0.74, s * 0.06, s * 0.26);
    [RED, '#F2C14E', GREEN].forEach((col, i) => { c.fillStyle = col; c.beginPath(); c.arc(x + s * 0.5, y + s * (0.22 + i * 0.2), s * 0.07, 0, TAU); c.fill(); }); }
  else if (kind % 2) { c.fillStyle = '#4CAF6A'; c.beginPath(); c.arc(x + s * 0.5, y + s * 0.45, s * 0.25, 0, TAU); c.fill(); c.fillStyle = '#8A5A36'; c.fillRect(x + s * 0.46, y + s * 0.6, s * 0.08, s * 0.3); }
  else { c.fillStyle = '#3C8FE0'; rr(c, x + s * 0.18, y + s * 0.5, s * 0.64, s * 0.22, 12); c.fill(); c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(x + s * 0.32, y + s * 0.74, s * 0.07, 0, TAU); c.arc(x + s * 0.68, y + s * 0.74, s * 0.07, 0, TAU); c.fill(); } }
function selfTile(c, x, y, s, t, i) { c.save(); c.beginPath(); c.rect(x, y, s, s); c.clip(); c.fillStyle = '#F7B6CF'; c.fillRect(x, y, s, s);
  const g = G.her; c.translate(x + s / 2, y + s * 0.62 - g.headY * 0.2); c.scale(0.2, 0.2); K.put(c, HER, { t, mood: 'neutral', turn: 0, look: 0, armL: kb(-1), armR: kb(1) }, 0, 0); c.restore(); }
function screen(c, w, h, t, L) { const e = k => ev(L, k);
  c.fillStyle = '#F4F6FA'; c.fillRect(0, 0, w, h); c.fillStyle = '#E3E7EF'; c.fillRect(0, 0, w, 56);
  [RED, '#F2C14E', GREEN].forEach((col, i) => { c.fillStyle = col; c.beginPath(); c.arc(30 + i * 30, 28, 9, 0, TAU); c.fill(); });
  c.fillStyle = '#FFFFFF'; rr(c, 140, 12, w - 280, 32, 16); c.fill(); fitTxt(c, 'account.login', w / 2, 29, 18, '#6B7080', 300, 'Nun9');
  const cx = 70, cw = w - 140; let title = 'SIGN IN';
  const login = (pw, err, cursor) => { title = 'SIGN IN'; field(c, cx, 150, cw, 'Email', 'me@mail.com'); field(c, cx, 280, cw, 'Password', pw, { err, cursor, size: 40 }); button(c, cx, 390, cw, 'LOG IN'); fitTxt(c, 'Forgot password?', w / 2, 500, 24, BLUE, 300, 'Nun9'); };
  if (L === 'hook') { login(dots(8), true); alertBar(c, cx, 540, cw, 'INCORRECT PASSWORD', RED, L === 'hook' && t > hev('blink') && Math.sin(t * 16) < 0 ? 0.3 : 1); }
  else if (L === 'A1') { const n1 = typed(t, e('type'), e('enter'), 8), n2 = typed(t, e('type2'), SP.a1_x2.t - 0.1, 8);
    if (t < e('type2')) { login(dots(n1), t > SP.a1_x.t - 0.1, t < e('enter')); if (t > SP.a1_x.t - 0.1) alertBar(c, cx, 540, cw, 'WRONG PASSWORD'); }
    else { login(dots(n2), t > SP.a1_x2.t - 0.1, t < SP.a1_x2.t); if (t > SP.a1_x2.t - 0.1) alertBar(c, cx, 540, cw, 'WRONG PASSWORD'); }
    if (t > e('attempts')) { const k = eBack(P(t, e('attempts'), e('attempts') + 0.3), 2), bl = Math.sin(t * 10) > -0.3; c.save(); c.translate(w / 2, h / 2 + 40); c.scale(k, k); c.fillStyle = 'rgba(20,22,30,.85)'; rr(c, -300, -90, 600, 180, 24); c.fill(); fitTxt(c, 'ATTEMPTS REMAINING:', 0, -30, 34, '#FFFFFF', 540); txt(c, '1', 0, 40, 80, bl ? RED : '#7A1F2A'); c.restore(); } }
  else if (L === 'A2') { title = 'RESET PASSWORD';
    if (t < e('type')) { login(dots(8), false); if (t > e('forgot')) { c.fillStyle = 'rgba(255,255,255,.92)'; c.fillRect(0, 56, w, h - 56); fitTxt(c, 'FORGOT PASSWORD?', w / 2, 140, 40, '#2B2F3A', cw); field(c, cx, 250, cw, 'Please enter your email', ''); button(c, cx, 370, cw, 'SEND CODE'); } }
    else if (t < e('mail')) { const em = 'me@mail.com', n = typed(t, e('type'), SP.a2_x2.t - 0.15, em.length); fitTxt(c, 'FORGOT PASSWORD?', w / 2, 140, 40, '#2B2F3A', cw); field(c, cx, 250, cw, 'Please enter your email', em.slice(0, n), { cursor: n < em.length }); button(c, cx, 370, cw, 'SEND CODE', BLUE, P(t, SP.a2_x2.t - 0.2, SP.a2_x2.t));
      if (t > SP.a2_x2.t - 0.1) alertBar(c, cx, 480, cw, '✓ WE SENT YOU A CODE', GREEN); }
    else { c.fillStyle = '#FFFFFF'; c.fillRect(0, 56, w, h - 56); c.fillStyle = RED; rr(c, cx, 100, 120, 80, 12); c.fill(); txt(c, 'MAIL', cx + 60, 140, 26, '#FFFFFF');
      fitTxt(c, 'Inbox', cx + 150, 140, 34, '#2B2F3A', 300, 'Nun9', 'left'); if (t > e('login')) { const k = eBack(P(t, e('login'), e('login') + 0.3), 2); c.save(); c.translate(w / 2, 360); c.scale(k, k); c.fillStyle = '#2B2F3A'; rr(c, -320, -110, 640, 220, 24); c.fill(); fitTxt(c, 'TO OPEN YOUR EMAIL,', 0, -40, 34, '#FFFFFF', 580); fitTxt(c, 'PLEASE LOG IN.', 0, 10, 40, '#F2C14E', 580); button(c, -150, 50, 300, 'LOG IN'); c.restore(); } } }
  else if (L === 'B1') { const code = '482916'; fitTxt(c, 'ENTER VERIFICATION CODE', w / 2, 130, 36, '#2B2F3A', cw);
    const n = t > e('sent') ? 0 : typed(t, e('code'), SP.b1_x2.t - 0.15, 6), err = t > SP.b1_x2.t - 0.1 && t < e('sent');
    for (let i = 0; i < 6; i++) { const bx = cx + 10 + i * (cw - 20) / 6; c.fillStyle = '#FFFFFF'; c.strokeStyle = err ? RED : '#C9CED6'; c.lineWidth = 4; rr(c, bx, 190, (cw - 20) / 6 - 16, 100, 14); c.fill(); c.stroke(); if (i < n) txt(c, code[i], bx + ((cw - 20) / 6 - 16) / 2, 242, 54, '#2B2F3A'); }
    if (err && t < SP.b1_x3.t - 0.1) alertBar(c, cx, 330, cw, 'YOUR CODE HAS EXPIRED');
    if (t > SP.b1_x3.t - 0.1 && t < e('sent')) { alertBar(c, cx, 330, cw, 'YOUR CODE HAS EXPIRED'); fitTxt(c, 'Would you like a new code?', w / 2, 450, 30, '#2B2F3A', cw, 'Nun9'); button(c, cx + cw / 2 - 120, 490, 240, 'YES', GREEN, P(t, endOf('b1_x3'), endOf('b1_x3') + 0.2)); }
    if (t > e('sent')) alertBar(c, cx, 330, cw, '✓ NEW CODE SENT', GREEN);
    if (t > e('toomany')) { const k = eBack(P(t, e('toomany'), e('toomany') + 0.3), 2); c.save(); c.translate(w / 2, 470); c.scale(k, k); c.fillStyle = RED; rr(c, -330, -90, 660, 180, 24); c.fill(); fitTxt(c, 'TOO MANY REQUESTS.', 0, -28, 40, '#FFFFFF', 600); fitTxt(c, 'TRY AGAIN TOMORROW.', 0, 30, 34, '#FFE15A', 600); c.restore(); } }
  else if (L === 'B2') {
    if (t < e('captcha')) { fitTxt(c, 'SECURITY CHECK', w / 2, 160, 44, '#2B2F3A', cw); fitTxt(c, 'We need to verify your identity.', w / 2, 240, 30, '#6B7080', cw, 'Nun9'); button(c, cx + 100, 320, cw - 200, 'START', BLUE); }
    else { const self = t > e('self9') - 0.1, gs = 116, gx = (w - gs * 3 - 16) / 2, gy = 130;
      c.fillStyle = BLUE; rr(c, cx, 62, cw, 60, 10); c.fill(); fitTxt(c, self ? 'SELECT ALL IMAGES OF YOURSELF' : 'SELECT ALL IMAGES WITH TRAFFIC LIGHTS', w / 2, 92, 28, '#FFFFFF', cw - 30);
      for (let i = 0; i < 9; i++) { const x = gx + (i % 3) * (gs + 8), y = gy + Math.floor(i / 3) * (gs + 8);
        if (self) selfTile(c, x, y, gs, t, i); else { trafficTile(c, x, y, gs, i); const sel = [0, 3, 7].indexOf(i), tk = e('captcha') + 0.65 + 0.3 * sel; if (sel >= 0 && t > tk) { c.strokeStyle = BLUE; c.lineWidth = 8; c.strokeRect(x + 4, y + 4, gs - 8, gs - 8); c.fillStyle = BLUE; c.beginPath(); c.arc(x + 20, y + 20, 14, 0, TAU); c.fill(); mark(c, x + 20, y + 20, 9, true); } } }
      if (!self && t > SP.b2_x2.t - 0.1) alertBar(c, gx - 40, gy + gs * 1.5 - 32, gs * 3 + 96, '✗ VERIFICATION FAILED'); } }
  else if (L === 'C1') { fitTxt(c, 'CREATE A NEW PASSWORD', w / 2, 130, 40, '#2B2F3A', cw);
    const p1 = 'Banana123', p2 = 'Banana123!@#', two = t > e('banana2') - 0.1, n = two ? p1.length + typed(t, e('banana2'), SP.c1_x3.t - 0.15, 3) : typed(t, e('banana'), SP.c1_x2.t - 0.15, p1.length);
    field(c, cx, 220, cw, 'New password', t < e('banana') ? '' : (two ? p2 : p1).slice(0, n), { cursor: true, size: 40, err: t > SP.c1_x2.t - 0.1 });
    const rules = [[t > SP.c1_x2.t - 0.1, '✗ PASSWORD TOO WEAK'], [t > SP.c1_x3.t - 0.1, '✗ MUST CONTAIN A SPECIAL CHARACTER'], [t > e('roman'), '✗ MUST CONTAIN A ROMAN NUMERAL']];
    let y = 330; for (const [on, s] of rules) if (on) { alertBar(c, cx, y, cw, s); y += 72; }
    if (t > SP.c1_x2.t - 0.1) { c.fillStyle = '#E3E7EF'; rr(c, cx, 310, cw, 10, 5); c.fill(); c.fillStyle = RED; rr(c, cx, 310, cw * 0.12, 10, 5); c.fill(); } }
  else if (L === 'C2') {
    if (t < SP.c2_x3.t - 0.1) { fitTxt(c, 'CREATE A NEW PASSWORD', w / 2, 130, 40, '#2B2F3A', cw); field(c, cx, 220, cw, 'New password', 'B@nana_XIV!#Q7', { size: 40, ok: t < e('error') });
      button(c, cx, 330, cw, t > e('save') + 0.15 && t < e('error') ? '…' : 'SAVE NEW PASSWORD', GREEN, P(t, e('save'), e('save') + 0.2));
      if (t > e('save') + 0.15 && t < e('error')) { c.strokeStyle = BLUE; c.lineWidth = 8; c.beginPath(); c.arc(w / 2, 500, 34, t * 8, t * 8 + 4.2); c.stroke(); }
      if (t > e('error')) { const k = eBack(P(t, e('error'), e('error') + 0.3), 2); c.save(); c.translate(w / 2, 500); c.scale(k, k); c.fillStyle = RED; rr(c, -340, -100, 680, 200, 24); c.fill(); txt(c, 'ERROR', 0, -50, 44, '#FFE15A'); fitTxt(c, 'NEW PASSWORD CANNOT BE THE SAME', 0, 6, 28, '#FFFFFF', 640); fitTxt(c, 'AS YOUR OLD PASSWORD.', 0, 50, 28, '#FFFFFF', 640); c.restore(); } }
    else { fitTxt(c, 'PASSWORD UPDATED', w / 2, 150, 40, GREEN, cw); fitTxt(c, 'How was your experience?', w / 2, 260, 34, '#2B2F3A', cw, 'Nun9');
      for (let i = 0; i < 5; i++) { const k = eBack(P(t, SP.c2_x3.t + 0.2 + i * 0.12, SP.c2_x3.t + 0.45 + i * 0.12), 2); c.save(); c.translate(w / 2 + (i - 2) * 110, 380); c.scale(k, k); star(c, 0, 0, 46, '#F2C14E'); c.restore(); } } }
  return title; }
function laptopView(c, t, L) { backdrop(c); const SS = 1.2, w = 820 * SS, h = 600 * SS, x = (W - w) / 2, y = 610;
  c.fillStyle = 'rgba(0,0,0,.35)'; rr(c, x - 30 + 14, y - 30 + 20, w + 60, h + 60, 36); c.fill(); c.fillStyle = '#2B2F3A'; rr(c, x - 30, y - 30, w + 60, h + 60, 36); c.fill();
  c.save(); c.translate(x, y); c.beginPath(); rr(c, 0, 0, w, h, 10); c.clip(); c.scale(SS, SS); screen(c, w / SS, h / SS, t, L); c.restore();
  paint(c, q => { q.m(x - 90, y + h + 30); q.l(x + w + 90, y + h + 30); q.l(x + w + 40, y + h + 80); q.l(x - 40, y + h + 80); q.z(); }, '#AEB4BE', { sd: 6, hd: 3, lw: 4 });
  // Russian notes for on-screen text that nobody reads aloud
  const e = k => ev(L, k); let ru = null;
  if (L === 'A1' && t > e('attempts')) ru = 'осталась 1 попытка';
  if (L === 'A2' && t > e('login')) ru = 'чтобы открыть почту, войдите в аккаунт';
  if (L === 'B1' && t > e('toomany')) ru = 'слишком много запросов. попробуйте завтра';
  if (L === 'B2' && t > e('captcha') && t < e('self9')) ru = 'выберите все картинки со светофорами';
  if (L === 'B2' && t > e('self9')) ru = 'выберите все фото, на которых вы';
  if (L === 'C1' && t > e('roman')) ru = 'должен содержать римскую цифру';
  if (L === 'C2' && t > e('error') && t < SP.c2_x3.t) ru = 'новый пароль не может совпадать со старым';
  if (ru) { c.save(); UI.font(c, 'Nun9', 44); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, '«' + ru + '»', 540, 1500, C.pinkL, C.oliveD, 10); c.restore(); } }
function phoneView(c, t) { backdrop(c); const a = ev('B1', 'sms');
  K.phone(c, 540, 1000, 1.4, (cc, w, h) => { cc.fillStyle = '#F4F1EC'; cc.fillRect(0, 0, w, h); fitTxt(cc, 'Messages', w / 2, 50, 26, '#2B2F3A', 300);
    const k = eBack(P(t, a + 0.1, a + 0.4), 2); if (k > 0) { cc.save(); cc.translate(30, 160); cc.scale(k, k); cc.fillStyle = '#E3E7EF'; rr(cc, 0, 0, w - 90, 170, 26); cc.fill(); fitTxt(cc, 'Your verification code is', 24, 50, 24, '#2B2F3A', w - 140, 'Nun9', 'left'); txt(cc, '482916', (w - 90) / 2, 115, 64, BLUE); cc.restore(); } }); }
function keysView(c, t) { backdrop(c); const a = ev('C2', 'caps'), on = Math.sin(t * 6) > -0.6;
  c.save(); c.translate(540, 1000); c.rotate(-0.06); c.fillStyle = '#AEB4BE'; rr(c, -560, -330, 1120, 660, 40); c.fill();
  const rows = [['TAB', 'Q', 'W', 'E', 'R', 'T'], ['CAPS', 'A', 'S', 'D', 'F', 'G'], ['SHIFT', 'Z', 'X', 'C', 'V', 'B']];
  rows.forEach((r, j) => { let x = -520; r.forEach((k, i) => { const kw = i === 0 ? 300 : 150, y = -290 + j * 200; const caps = k === 'CAPS';
    c.fillStyle = caps ? '#FFFDF8' : '#E9ECF1'; rr(c, x, y, kw - 16, 180, 22); c.fill(); if (caps) { c.strokeStyle = '#F2C14E'; c.lineWidth = 8 + 4 * Math.sin(t * 8); rr(c, x, y, kw - 16, 180, 22); c.stroke(); }
    fitTxt(c, caps ? 'CAPS LOCK' : k, x + (kw - 16) / 2, y + 110, caps ? 40 : 54, '#2B2F3A', kw - 40);
    if (caps) { c.fillStyle = on ? GREEN : '#1E5A38'; c.beginPath(); c.arc(x + 40, y + 40, 18, 0, TAU); c.fill(); if (on) { c.fillStyle = 'rgba(47,191,113,.35)'; c.beginPath(); c.arc(x + 40, y + 40, 36, 0, TAU); c.fill(); } }
    x += kw; }); }); c.restore();
  const k = eBack(P(t, a + 0.2, a + 0.45), 2); if (k > 0) { c.save(); c.translate(540, 1500); c.rotate(-0.03); c.scale(k, k); c.fillStyle = GREEN; rr(c, -300, -60, 600, 120, 30); c.fill(); txt(c, 'CAPS LOCK', -40, 4, 60, '#FFFFFF'); c.fillStyle = '#B8FFD6'; c.beginPath(); c.arc(220, 2, 22, 0, TAU); c.fill(); c.restore(); } }

// ---------------- frame
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { K.outro(c, t, { q: ['А ТЫ СКОЛЬКО РАЗ', 'ЗАБЫВАЛ(А) ПАРОЛЬ?'], rows: [['A2', 'We sent you a code.'], ['B1', 'Your code has expired.'], ['C1', "At this point, I'd appreciate…"], ['C2', 'regain access']], cta: ['ОТПРАВЬ ТОМУ, КТО', 'ЖМЁТ «ЗАБЫЛИ ПАРОЛЬ?»'],
    hero: (cc, tt) => { const g = G.her; K.put(cc, HER, { t: tt, mood: 'happy', turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(tt * 8) * 30, { planar: true }), armR: reach(g, 1, g.sw * 0.6, g.ySh + 300) }, 0, 0); } });
    Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'her';
  let heads = { her: OFFL, machine: OFF }, proj = p => p;
  if (tag === 'ui:black') { c.fillStyle = '#000000'; c.fillRect(0, 0, W, HH); UI.watermark(c); return; }
  c.save(); c.translate(sh.x, sh.y);
  if (tag === 'ui:screen') laptopView(c, t, L); else if (tag === 'ui:phone') phoneView(c, t); else if (tag === 'ui:keys') keysView(c, t);
  c.restore();
  if (!tag.startsWith('ui:')) { const r = drawWorld(c, t, L, cam, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26); }
  if (L === 'hook' && tag === 'ui:screen' && t < 1) { const p = 1 + 0.04 * Math.sin(t * 8); c.save(); c.translate(540, 1560); c.scale(p, p); c.rotate(-0.03); c.fillStyle = RED; rr(c, -300, -62, 600, 124, 62); c.fill(); c.strokeStyle = C.white; c.lineWidth = 6; rr(c, -300, -62, 600, 124, 62); c.stroke(); fitTxt(c, 'LOCKED OUT', 50, 4, 60, '#FFFFFF', 400); c.fillStyle = '#FFFFFF'; rr(c, -262, -10, 64, 50, 8); c.fill(); c.strokeStyle = '#FFFFFF'; c.lineWidth = 9; c.beginPath(); c.arc(-230, -12, 20, Math.PI, 0); c.stroke(); c.fillStyle = RED; c.beginPath(); c.arc(-230, 12, 7, 0, TAU); c.fill(); c.restore(); }
  if (L === 'hook') { const hookProj = p => { const q = proj(p); return q.x < 0 || q.x > W ? { x: q.x < 0 ? 60 : W - 60, y: 1050 } : q; };   // hook: off-screen speaker -> bubble below the title ribbon
    K.bubbles(c, t, { id: 'hook' }, heads, hookProj, { names: { machine: ['SYSTEM', BLUE] }, hold: { hook_her: 0.2, hook_x: 0.4 } }); K.titleRibbon(c, t, 540, 455); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); UI.captions(c, t);
    Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  if (L === 'B2' && tag === 'her' && t > ev('B2', 'nextday') && t < SP.b2_x.t - 0.1) { const k = eBack(P(t, ev('B2', 'nextday'), ev('B2', 'nextday') + 0.3), 2); c.save(); c.translate(540, 1250); c.rotate(-0.03); c.scale(k, k); c.fillStyle = C.gold; rr(c, -360, -60, 720, 120, 30); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke(); txt(c, 'НА СЛЕДУЮЩИЙ ДЕНЬ', 0, 4, 50, C.oliveD); c.restore(); }
  if (L === 'C2' && t > ev('C2', 'plop') && t < SP.c2_x3.t - 0.15) K.pop(c, t, 'БУХ!', ev('C2', 'plop'), SP.c2_x3.t - 0.4, 540, 1250, C.gold, -0.08, 110);
  if (L === 'C2' && t > ev('C2', 'silence') && t < ev('C2', 'caps') - 0.05) K.dots(c, t, ev('C2', 'silence'), ev('C2', 'caps') - 0.05, 1450);
  K.bubbles(c, t, sc, heads, proj, { names: { machine: ['SYSTEM', BLUE] }, hold: { a1_her3: 0.4, b1_her3: 0.3, c2_x2: 0.6, c2_her4: 0.5 } });
  K.hud(c, t, sc);
}
E.run('password', NF, renderFrame);
