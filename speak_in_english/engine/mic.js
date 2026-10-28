// "When you think your mic is off" episode renderer (hard_cut camera): node mic.js start end out.mp4 | --png=f1,f2
// Her lines are shot in her room (world camera). Everyone else lives in the video-call app, drawn in screen space:
// shots tagged 'ui:<view>' (meet, slide, boss, priya, duo, grid, mic, sharebtn, share, hertile) replace the world.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/mic/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf, EV } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2, ev = k => EV(k);

// ---------------- cast (her at home in a hoodie; Mr Grant = the boss from WRONG CHAT, with reading glasses; Priya & Tom = colleagues)
const HER = { ...BASE.her_lift, top: { type: 'hoodie', col: '#B9A6E0' }, bottom: { type: 'joggers', col: '#6B6F86' } };
const GRANT = { ...BASE.greg, top: { type: 'blazer', col: '#2B3A67', tie: '#F2C14E' }, bottom: { type: 'trousers', col: '#2B3A67' }, shoes: { col: '#1A1A1A', acc: null } };
const PRIYA = { ...BASE.priya }, TOM = { ...BASE.tom };
const G = { her: geom(HER), grant: geom(GRANT), priya: geom(PRIYA), tom: geom(TOM) };
const HF = 420, DESK = -400;                       // her feet are hidden below the desk: she "sits" behind it
const herHY = HF + G.her.headY;
function txt(c, s, x, y, size, col, font = 'Unb9', align = 'center') { c.font = `${size}px ${font}`; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
const sceneOf = t => sceneAt(t).id;

// ---------------- props
const mugItem = (rot = 0) => (ctx, a, side) => { ctx.rotate(rot * side); ctx.translate(0, -10);
  ctx.strokeStyle = '#C8508A'; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(46 * side, -10, 24, -1.3, 1.3); ctx.stroke();
  paint(ctx, q => { q.m(-44, -62); q.l(44, -62); q.l(40, 46); q.q(0, 58, -40, 46); q.z(); }, '#EE5E9A', { sd: 8, hd: 4, lw: 4 });
  ctx.fillStyle = '#FFFDF8'; ctx.font = '22px Unb9'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('BOSS', 0, -8); ctx.fillText('MODE', 0, 18);
  ctx.fillStyle = '#6B3E26'; ctx.beginPath(); ctx.ellipse(0, -60, 40, 8, 0, 0, TAU); ctx.fill(); };
function micIcon(c, x, y, s, on) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#FFFFFF'; rr(c, -9, -22, 18, 30, 9); c.fill(); c.strokeStyle = '#FFFFFF'; c.lineWidth = 4; c.lineCap = 'round';
  c.beginPath(); c.arc(0, -4, 15, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke(); c.beginPath(); c.moveTo(0, 11); c.lineTo(0, 20); c.moveTo(-8, 20); c.lineTo(8, 20); c.stroke();
  if (!on) { c.strokeStyle = '#FFFFFF'; c.lineWidth = 5; c.beginPath(); c.moveTo(-18, 18); c.lineTo(18, -22); c.stroke(); } c.restore(); }
function camIcon(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#FFFFFF'; rr(c, -20, -12, 28, 24, 6); c.fill(); c.beginPath(); c.moveTo(10, -2); c.lineTo(22, -10); c.lineTo(22, 10); c.lineTo(10, 2); c.fill(); c.restore(); }

// ---------------- her room (prerendered, softly blurred) + desk/laptop in front
const BX0 = -1500, BY0 = -2600, BW = 3000, BH = 3400, BS = 0.5;
function drawRoom(c) {
  c.fillStyle = '#EBDDCB'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = 'rgba(255,255,255,.18)'; for (let x = BX0; x < BX0 + BW; x += 160) c.fillRect(x, BY0, 70, BH);
  // window with daylight
  c.fillStyle = '#FFFDF8'; rr(c, 260, -2050, 820, 980, 20); c.fill(); c.fillStyle = '#BFE3F7'; rr(c, 290, -2020, 760, 920, 10); c.fill();
  c.fillStyle = '#9ED39A'; c.beginPath(); c.ellipse(560, -1150, 420, 160, 0, 0, TAU); c.fill(); c.fillStyle = '#FFFDF8'; c.fillRect(662, -2020, 16, 920); c.fillRect(290, -1570, 760, 16);
  c.fillStyle = '#F7B6CF'; c.fillRect(220, -2090, 140, 1080); c.fillRect(980, -2090, 140, 1080);
  // shelf with books and a plant (left)
  c.fillStyle = '#B07A4E'; c.fillRect(-1250, -1700, 760, 34); c.fillRect(-1250, -1260, 760, 34);
  const BK = ['#E0474C', '#3C8FE0', '#F2C14E', '#4CAF6A', '#8E5BD6', '#EE5E9A', '#2B2F3A'];
  for (const sy of [-1700, -1260]) for (let i = 0; i < 9; i++) { const h = 170 + hash(i + sy) * 120; c.fillStyle = BK[(i * 3 + (sy & 3)) % BK.length]; rr(c, -1230 + i * 62, sy - h, 54, h, 6); c.fill(); }
  c.fillStyle = '#C98B5A'; rr(c, -720, -1420, 120, 130, 14); c.fill(); c.fillStyle = '#4CAF6A'; for (let k = 0; k < 7; k++) { c.beginPath(); c.ellipse(-660 + Math.cos(k) * 50, -1460 - k * 14, 26, 70, k * 0.5 - 1.5, 0, TAU); c.fill(); }
  // framed poster
  c.fillStyle = '#FFFDF8'; rr(c, -420, -2050, 420, 300, 12); c.fill(); c.fillStyle = '#EE5E9A'; rr(c, -395, -2025, 370, 250, 8); c.fill(); txt(c, 'GOOD', -210, -1940, 60, '#FFFDF8'); txt(c, 'VIBES', -210, -1860, 60, '#FFFDF8');
  // floor
  c.fillStyle = '#C9A57E'; c.fillRect(BX0, -260, BW, 1060);
}
const BGB = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); { const c = BGB.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); c.filter = 'blur(1.6px)'; drawRoom(c); }
function desk(c) {
  paint(c, q => { q.m(-900, DESK); q.l(900, DESK); q.l(900, DESK + 60); q.l(-900, DESK + 60); q.z(); }, '#B98556', { sd: 6, hd: 3, lw: 4 });
  paint(c, q => { q.m(-860, DESK + 60); q.l(860, DESK + 60); q.l(860, 900); q.l(-860, 900); q.z(); }, '#9C6A42', { sd: 10, hd: 4, lw: 4 });
  // laptop (back of the lid faces us)
  paint(c, q => { q.m(-250, DESK - 330); q.l(250, DESK - 330); q.l(262, DESK - 8); q.l(-262, DESK - 8); q.z(); }, '#C9CED6', { sd: 8, hd: 4, lw: 4 });
  c.fillStyle = '#AEB4BE'; rr(c, -280, DESK - 14, 560, 22, 8); c.fill();
  c.save(); c.translate(0, DESK - 180); c.fillStyle = '#EE5E9A'; c.beginPath(); c.moveTo(0, 26); c.bezierCurveTo(-60, -10, -30, -60, 0, -30); c.bezierCurveTo(30, -60, 60, -10, 0, 26); c.fill(); c.restore();
  c.fillStyle = '#FFFFFF'; rr(c, 120, DESK - 120, 90, 60, 10); c.fill(); txt(c, 'EN', 165, DESK - 90, 28, '#3C8FE0');
  // notepad + pen
  c.save(); c.translate(520, DESK + 4); c.rotate(-0.08); c.fillStyle = '#FFF4B8'; c.fillRect(-110, -20, 220, 24); c.restore();
}

// ---------------- characters
function gest(st, g, who, t, side, base) { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } }
const kb = (g, side, k = 0) => reach(G.her, side, side * 120 + k, DESK - HF - 60);                      // hands on the keyboard (behind the lid)
function herState(t0, L) { const g = G.her; let t = t0;
  if (L === 'C2' && t0 > ev('freeze')) t = ev('freeze') + 0.2;                                                 // frozen "bad connection": time stops for her
  const st = { t, talk: talk('her', t0), mood: 'neutral', turn: 0, look: 0, armL: kb(g, -1), armR: kb(g, 1) };
  const sip = () => { st.armR = reach(g, 1, g.sw * 0.35, g.headY + g.hh * 0.75); st.items = { R: mugItem(-0.2) }; };
  const holdMug = () => { st.armR = reach(g, 1, g.sw * 1.15, DESK - HF - 150); st.items = { R: mugItem(0) }; };
  if (L === 'hook') { st.mood = 'smug'; holdMug(); st.turn = 0.1; if (speaking('hook_her', t, 0.1)) { st.mood = 'happy'; gest(st, g, 'her', t, -1, 160); } }
  if (L === 'A1') { st.mood = 'bored'; holdMug();
    if (speaking('a1_her', t, 0.1)) { st.mood = 'tired'; st.lookY = -0.5; st.look = 0.4; }
    if (speaking('a1_her2', t, 0.1)) { st.mood = 'bored'; st.turn = 0.25; st.look = 0.8; gest(st, g, 'her', t, -1, 200); }
    if (t > ev('sip') - 0.1) { sip(); st.mood = 'neutral'; st.blink = 0.6; } if (t > ev('a1_nar') + 1.6) { holdMug(); st.mood = 'smug'; } }
  if (L === 'A2') { st.mood = 'bored'; holdMug();
    if (t > ev('notice') - 0.1) st.mood = 'shock';
    if (speaking('a2_her', t, 0.1)) { st.mood = t < SP.a2_her.t + 1.2 ? 'shock' : 'annoyed'; st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 60 + Math.sin(t * 9) * 20, { planar: true }); }
    if (t > ev('shrug') - 0.05) { st.mood = 'bored'; st.turn = 0.35; st.look = 1; st.armL = reach(g, -1, -g.sw * 1.7, g.ySh + 120, { planar: true }); st.armR = reach(g, 1, g.sw * 1.7, g.ySh + 120, { planar: true }); st.items = {}; st.lookY = -0.2; }
    if (t > ev('a2_nar')) { st.mood = 'bored'; holdMug(); st.armL = kb(g, -1); st.turn = 0.2; st.look = 0.8; } }
  if (L === 'B1') { st.mood = 'bored'; holdMug();
    if (speaking('b1_her', t, 0.1)) { st.mood = 'skeptical'; st.lookY = 0; }
    if (speaking('b1_her2', t, 0.1, 0.6)) { st.mood = 'happy'; gest(st, g, 'her', t, -1, 160); }
    if (t > ev('b1_nar')) { st.mood = 'smug'; } }
  if (L === 'B2') { st.mood = 'happy'; holdMug(); const m = ev('msg');
    if (t > m + 0.25) { st.mood = 'shock'; st.blink = 0; }
    if (t > ev('lookmic') - 0.1) { st.mood = 'shock'; st.lookY = 0.5; }
    if (speaking('b2_her', t, 0.1)) { st.mood = 'shock'; st.lookY = 0; st.items = {}; st.armL = reach(g, -1, -g.sw * 1.3, g.ySh - 160, { planar: true }); st.armR = reach(g, 1, g.sw * 1.3, g.ySh - 160, { planar: true }); }
    if (t > SP.b2_x.t) { st.mood = 'worried'; st.items = {}; st.armR = kb(g, 1); st.armL = kb(g, -1); }
    if (t > SP.b2_her2.t - 0.15 && t < ev('mash')) { st.mood = 'worried'; st.armL = reach(g, -1, -g.hw * 0.7, g.headY + 20); st.armR = reach(g, 1, g.hw * 0.7, g.headY + 20); st.headFirst = false; }
    if (t > ev('mash') && t < SP.b2_x2.t) { st.mood = 'shock'; const u = t * 18; st.armL = reach(g, -1, -150 + Math.sin(u) * 30, DESK - HF - 120 - Math.max(0, Math.sin(u)) * 180, { planar: true }); st.armR = reach(g, 1, 150 + Math.sin(u + 2) * 30, DESK - HF - 120 - Math.max(0, Math.sin(u + 2)) * 180, { planar: true }); }
    if (t > SP.b2_x2.t) { st.mood = 'shock'; st.hairSway = 0.35 + 0.15 * Math.sin(t * 30); st.blink = speaking('b2_x2', t) ? 1 : 0; st.armL = kb(g, -1); st.armR = kb(g, 1); }
    if (t > ev('b2_nar')) { st.hairSway = 0; st.blink = 0; st.mood = 'worried'; st.armL = reach(g, -1, -g.hw * 0.7, g.headY + 20); st.armR = reach(g, 1, g.hw * 0.7, g.headY + 20); st.headFirst = false; } }
  if (L === 'C1') { st.mood = 'worried'; const f = ev('fix');
    if (t > f && t < f + 0.6) { st.armL = reach(g, -1, -g.hw * 1.05, g.headY - g.hh * 0.6); st.mood = 'neutral'; }
    if (t > f + 0.6) st.mood = 'happy';
    if (speaking('c1_her', t, 0)) { st.mood = 'happy'; gest(st, g, 'her', t, -1, 200); }
    if (t > SP.c1_x.t) st.mood = 'worried';
    if (speaking('c1_her2', t, 0.05)) { st.mood = t < SP.c1_her2.t + 2.2 ? 'neutral' : 'smug'; st.turn = 0.1; gest(st, g, 'her', t, -1, 200); }
    if (t > endOf('c1_her2') + 0.3) st.mood = 'neutral';
    if (t > ev('nod') && t < ev('del')) { st.lookY = 0.3 * Math.sin((t - ev('nod')) * 14); st.mood = 'happy'; }
    if (t > ev('del')) st.mood = 'happy'; if (t > ev('awk')) { st.mood = 'worried'; st.look = 0.5; st.turn = 0.2; } }
  if (L === 'C2') { st.mood = 'worried';
    if (t > ev('calm')) st.mood = 'neutral';
    if (speaking('c2_her', t, 0, 0.3)) { st.mood = 'smug'; gest(st, g, 'her', t, -1, 200); }
    if (t > endOf('c2_her') + 0.3) st.mood = 'smug';
    if (speaking('c2_her2', t, 0.1, 0.3)) { st.mood = 'happy'; st.armL = reach(g, -1, -g.sw * 1.5, g.ySh - 140, { planar: true }); }
    if (t > ev('share') - 0.1 && t < ev('freeze')) { st.mood = 'happy'; st.armR = kb(g, 1); }
    if (t >= ev('freeze') - 0.01) { st.mood = 'shock'; st.blink = 0; st.turn = 0.12; st.look = 0.3; st.lookY = -0.3; st.talk = 0.55; st.armL = reach(g, -1, -g.sw * 1.4, g.ySh - 90, { planar: true }); st.armR = kb(g, 1); } }
  return st; }
// Mr Grant
function grantState(t, L) { const g = G.grant, st = { t, talk: talk('grant', t), mood: 'neutral', turn: 0, look: 0, armL: reach(g, -1, -g.sw * 0.7, g.ySh + 330), armR: reach(g, 1, g.sw * 0.7, g.ySh + 330) };
  const glassesOn = (L === 'hook' || L === 'A1' || L === 'A2' || (L === 'B1' && t < ev('glasses') + 0.45));
  st.cfg = glassesOn ? { ...GRANT, glasses: { col: '#2B2F3A', lw: 7 } } : GRANT;
  const present = () => { st.mood = 'happy'; st.turn = -0.25; st.look = -0.6; gest(st, g, 'grant', t, 1, 160); };
  if (L === 'hook' || L === 'A1' || L === 'A2' || L === 'B1') present();
  if (L === 'A1') { if (t > ev('stare')) { st.mood = 'neutral'; st.turn = 0; st.look = 0; st.armR = reach(g, 1, g.sw * 0.7, g.ySh + 330); } if (t > ev('brow')) st.mood = 'skeptical'; }
  if (L === 'A2') { if (t > endOf('a2_her') - 0.4) { st.mood = 'skeptical'; st.turn = 0; st.look = 0; } if (t > ev('a2_nar')) st.mood = 'annoyed'; }
  if (L === 'B1') { if (t > SP.b1_her.t + 0.3) { st.mood = 'skeptical'; st.turn = 0; st.look = 0; }
    if (t > ev('glasses') - 0.1 && t < ev('glasses') + 0.6) { const k = eIO(P(t, ev('glasses'), ev('glasses') + 0.5)); st.armR = reach(g, 1, g.hw * lerp(0.4, 1.6, k), g.headY + lerp(10, 160, k)); }
    if (t > ev('glasses') + 0.6) { st.mood = 'skeptical'; st.armR = reach(g, 1, g.sw * 0.9, g.ySh + 120); } }
  if (L === 'B2') { st.mood = 'annoyed'; if (speaking('b2_x', t, 0.1, 0.2)) st.mood = 'smug'; if (speaking('b2_x2', t, 0.05)) st.mood = 'annoyed'; }
  if (L === 'C1') { st.mood = 'skeptical'; const cross = () => { st.armL = reach(g, -1, g.sw * 0.55, g.ySh + 230); st.armR = reach(g, 1, -g.sw * 0.55, g.ySh + 250); };
    cross(); if (speaking('c1_x2', t, 0.05, 0.5)) st.mood = 'surprised';
    if (t > ev('look47') - 0.05 && t < SP.c1_x2.t) { st.turn = -0.4; st.look = -1; st.lookY = 0.3; st.mood = 'neutral'; }
    if (t > ev('del') - 0.2) { st.turn = -0.4; st.look = -1; st.lookY = 0.4; st.mood = 'annoyed'; st.armR = reach(g, 1, g.sw * 1.6, g.ySh + 300); } }
  if (L === 'C2') { st.mood = 'skeptical'; if (speaking('c2_x', t, 0.1, 0.3)) st.mood = 'smug';
    if (t > endOf('c2_x') + 0.3) st.mood = 'neutral'; if (t > SP.c2_her.t + 4) st.mood = 'surprised';
    if (t > SP.c2_x2.t - 0.3) { st.mood = 'happy'; gest(st, g, 'grant', t, 1, 160); }
    if (t > ev('tab')) { st.mood = 'surprised'; st.armR = reach(g, 1, g.sw * 0.7, g.ySh + 330); }
    if (t > SP.c2_x4.t - 0.2) st.mood = 'skeptical'; if (t > SP.c2_x5.t - 0.2) st.mood = 'bored'; }
  return st; }
// lean towards the camera (scale inside his tile)
function grantLean(t, L) { if (L === 'B2' && speaking('b2_x', t, 0.2, 0.3)) return 1.15; if (L !== 'C2') return 1;
  if (t < SP.c2_x.t + 0.4) return lerp(1, 1.2, eOut(P(t, ev('lean'), ev('lean') + 0.4)));
  if (t < ev('tab')) return 1.2; if (t > SP.c2_x4.t - 0.2 && t < SP.c2_x5.t - 0.3) return 1.55; return 1; }
function priyaState(t, L) { const g = G.priya, st = { t, talk: 0, mood: 'neutral', turn: 0.1, look: 0.2, armL: reach(g, -1, -g.sw * 0.7, g.ySh + 330), armR: reach(g, 1, g.sw * 1.0, g.ySh + 200), items: { R: Hq.items.coffee() } };
  if (L === 'B1') { if (t > ev('choke') && t < SP.b1_x.t + 0.4) { st.mood = 'shock'; st.armL = reach(g, -1, -g.hw * 0.3, g.headY + g.hh * 0.75); st.lookY = 0.2; }
    if (t > ev('point')) { st.mood = 'worried'; st.items = {}; const u = Math.sin(t * 16); st.armR = reach(g, 1, g.hw * (0.9 + 0.3 * u), g.headY + g.hh * 0.6 + u * 20, { planar: true }); st.armL = reach(g, -1, -g.sw * 1.3, g.ySh - 180 + u * 40, { planar: true }); st.turn = 0; st.look = 0; } }
  if (L === 'B2') st.mood = 'worried';
  if (L === 'C1') st.mood = 'worried';
  if (L === 'C2') { st.mood = t > SP.c2_her.t + 3 ? 'surprised' : 'worried';
    if (t > ev('clap')) { st.items = {}; st.mood = 'happy'; const slow = t < ev('tom'); const ph = slow ? (t - ev('clap')) / 0.5 : (t - ev('tom')) / 0.19; const k = Math.abs(Math.cos(ph * Math.PI));
      st.armL = reach(g, -1, -20 - k * 110, g.ySh + 120, { planar: true }); st.armR = reach(g, 1, 20 + k * 110, g.ySh + 120, { planar: true }); }
    if (t > ev('stopclap')) { st.mood = 'shock'; st.armL = reach(g, -1, -130, g.ySh + 120, { planar: true }); st.armR = reach(g, 1, 130, g.ySh + 120, { planar: true }); } }
  return st; }
function tomState(t, L) { const g = G.tom, st = { t, talk: 0, mood: 'bored', turn: -0.1, look: -0.2, armL: reach(g, -1, -g.sw * 0.7, g.ySh + 330), armR: reach(g, 1, g.sw * 0.7, g.ySh + 330) };
  if (L === 'C2' && t > ev('tom')) { st.mood = 'happy'; const k = Math.abs(Math.cos((t - ev('tom')) / 0.17 * Math.PI)); st.armL = reach(g, -1, -20 - k * 110, g.ySh + 100, { planar: true }); st.armR = reach(g, 1, 20 + k * 110, g.ySh + 100, { planar: true }); }
  if (L === 'C2' && t > ev('stopclap')) { st.mood = 'shock'; st.armL = reach(g, -1, -130, g.ySh + 100, { planar: true }); st.armR = reach(g, 1, 130, g.ySh + 100, { planar: true }); }
  return st; }

// ---------------- video-call tiles (screen space). Returns the speaker head in screen coords for bubbles.
const ROOMS = { grant: ['#C9D3E3', '#9AA9C4'], priya: ['#F6E2C8', '#E8C9A0'], tom: ['#D8E8D2', '#A9C9A0'], her: ['#EBDDCB', '#F7B6CF'] };
const NAMES = { grant: 'MR GRANT', priya: 'PRIYA', tom: 'TOM', her: 'YOU' };
function tileBg(c, who, w, h) { const [a, b] = ROOMS[who]; c.fillStyle = a; c.fillRect(0, 0, w, h);
  if (who === 'grant') { c.fillStyle = '#7A5A3E'; c.fillRect(w * 0.06, h * 0.16, w * 0.3, h * 0.02); for (let i = 0; i < 6; i++) { c.fillStyle = ['#2B3A67', '#E0474C', '#F2C14E', '#4CAF6A'][i % 4]; c.fillRect(w * 0.07 + i * w * 0.045, h * 0.16 - h * (0.08 + 0.03 * (i % 3)), w * 0.035, h * (0.08 + 0.03 * (i % 3))); }
    c.fillStyle = b; rr(c, w * 0.64, h * 0.08, w * 0.28, h * 0.22, 8); c.fill(); c.fillStyle = '#FFFDF8'; rr(c, w * 0.66, h * 0.1, w * 0.24, h * 0.18, 6); c.fill(); fitTxt(c, 'TEAM', w * 0.78, h * 0.16, h * 0.045, '#2B3A67', w * 0.2); fitTxt(c, 'OF THE YEAR', w * 0.78, h * 0.22, h * 0.03, '#2B3A67', w * 0.2); }
  if (who === 'priya') { c.fillStyle = b; c.fillRect(0, h * 0.55, w, h * 0.45); c.fillStyle = '#FFFDF8'; for (let i = 0; i < 4; i++) { rr(c, w * 0.08 + i * w * 0.12, h * 0.12, w * 0.09, h * 0.16, 6); c.fill(); } }
  if (who === 'tom') { c.fillStyle = b; rr(c, w * 0.62, h * 0.08, w * 0.3, h * 0.36, 8); c.fill(); fitTxt(c, '★', w * 0.77, h * 0.26, h * 0.14, '#FFFDF8', w * 0.2); }
  if (who === 'her') { c.fillStyle = '#BFE3F7'; rr(c, w * 0.62, h * 0.06, w * 0.34, h * 0.4, 6); c.fill(); c.fillStyle = b; c.fillRect(w * 0.58, h * 0.04, w * 0.06, h * 0.5); c.fillStyle = '#EE5E9A'; rr(c, w * 0.04, h * 0.08, w * 0.22, h * 0.17, 6); c.fill(); } }
function personIn(c, who, t, L, w, h, s0 = 1) { const cfg = { grant: GRANT, priya: PRIYA, tom: TOM, her: HER }[who], g = G[who];
  const st = who === 'grant' ? grantState(t, L) : who === 'priya' ? priyaState(t, L) : who === 'tom' ? tomState(t, L) : herState(t, L);
  const lean = who === 'grant' ? grantLean(t, L) : 1, s = 0.16 * h / g.hh * s0 * lean, hx = w / 2, hy = h * (0.42 + (lean - 1) * 0.12);
  const fx = hx, fy = hy - g.headY * s;
  if (who === 'her') { c.save(); c.translate(fx, fy); c.scale(s, s); Hq.human(c, st.cfg || cfg, st); c.restore();          // desk edge + laptop glow in her webcam
    c.fillStyle = '#B98556'; c.fillRect(0, fy + (DESK - HF + 120) * s, w, h); }
  else { c.save(); c.translate(fx, fy); c.scale(s, s); Hq.human(c, st.cfg || cfg, st); c.restore(); }
  return { x: fx + 0, y: hy, hh: g.hh * s }; }
// tile at (x, y, w, h); o: { mic: bool, k: scale-in, label }
function tile(c, x, y, w, h, who, t, L, o = {}) { const k = o.k === undefined ? 1 : o.k; if (k <= 0) return null;
  if (global.__QA) global.__QA.ui(c, 'window', { x, y, w, h, k, id: who });
  c.save(); c.translate(x + w / 2, y + h / 2); c.scale(k, k); c.translate(-w / 2, -h / 2);
  c.fillStyle = 'rgba(0,0,0,.35)'; rr(c, 8, 12, w, h, 26); c.fill();
  const speak = who !== 'her' && talk(who, t) > 0.05; c.fillStyle = speak ? '#2FBF71' : '#3A3F4E'; rr(c, -6, -6, w + 12, h + 12, 30); c.fill();
  c.save(); c.beginPath(); rr(c, 0, 0, w, h, 24); c.clip(); tileBg(c, who, w, h); const hd = personIn(c, who, t, L, w, h, o.s || 1);
  if (o.over) o.over(c, w, h); c.restore();
  // name tag with mic state
  const on = who === 'her' || who === 'grant', nm = o.label || NAMES[who]; c.font = `${Math.round(Math.min(34, h * 0.07))}px Unb9`; const tw = c.measureText(nm).width, th = Math.min(54, h * 0.11);
  c.fillStyle = 'rgba(20,22,30,.78)'; rr(c, 16, h - th - 16, tw + th + 30, th, th / 2); c.fill(); c.fillStyle = on ? '#2FBF71' : '#E0474C'; c.beginPath(); c.arc(16 + th / 2, h - 16 - th / 2, th * 0.4, 0, TAU); c.fill();
  micIcon(c, 16 + th / 2, h - 16 - th / 2 + 1, th / 70, on); c.fillStyle = '#FFFFFF'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(nm, 16 + th + 8, h - 16 - th / 2 + 2);
  c.restore();
  return { x: x + w / 2 + (hd.x - w / 2) * k, y: y + h / 2 + (hd.y - h / 2) * k, hh: hd.hh * k }; }

// ---------------- slides
function slideN(t, L) { if (L === 'hook') return 1; if (L === 'A1') return t < ev('click1') ? 1 : 2; if (L === 'A2') return 2; return 12; }
function slideTotal(t, L) { return (L === 'C1' && t > ev('del') + 0.25) || L === 'C2' ? 46 : 47; }
function slide(c, x, y, w, h, t, L, hi = 0) { c.save(); c.translate(x, y);
  c.fillStyle = '#FFFFFF'; rr(c, 0, 0, w, h, 14); c.fill(); c.save(); c.beginPath(); rr(c, 0, 0, w, h, 14); c.clip();
  c.fillStyle = '#2B3A67'; c.fillRect(0, 0, w, h * 0.06); c.fillStyle = '#F2C14E'; c.fillRect(0, h * 0.06, w, h * 0.012);
  const n = slideN(t, L), tot = slideTotal(t, L);
  if (n === 1) { fitTxt(c, 'MONDAY MEETING', w / 2, h * 0.42, h * 0.15, '#2B3A67', w * 0.86); fitTxt(c, `How to make meetings shorter · 1/${tot}`, w / 2, h * 0.62, h * 0.055, '#7A8094', w * 0.8, 'Nun9'); }
  if (n === 2) { fitTxt(c, 'AGENDA', w * 0.08, h * 0.2, h * 0.09, '#2B3A67', w * 0.6, 'Unb9', 'left');
    ['Why meetings are too long', 'Why meetings are still too long', 'History of meetings (1900–today)', 'Questions (30 min)'].forEach((s, i) => { c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(w * 0.1, h * (0.36 + i * 0.13), h * 0.018, 0, TAU); c.fill(); fitTxt(c, s, w * 0.14, h * (0.36 + i * 0.13), h * 0.055, '#2B2F3A', w * 0.78, 'Nun9', 'left'); }); }
  if (n === 12) { fitTxt(c, 'WHY MEETINGS FEEL LONG', w * 0.08, h * 0.2, h * 0.075, '#2B3A67', w * 0.84, 'Unb9', 'left');
    [0.35, 0.55, 0.8, 0.95].forEach((v, i) => { c.fillStyle = ['#3C8FE0', '#4CAF6A', '#F2C14E', '#E0474C'][i]; const bx = w * (0.12 + i * 0.2), bh = h * 0.5 * v; c.fillRect(bx, h * 0.86 - bh, w * 0.13, bh); });
    fitTxt(c, '(too many slides)', w * 0.5, h * 0.92, h * 0.04, '#7A8094', w * 0.6, 'Nun8'); }
  c.restore();
  // counter
  const cs = h * (h > 700 ? 0.075 : 0.05); c.fillStyle = 'rgba(43,58,103,.92)'; rr(c, w - 330 * cs / 28, h - cs * 1.9, 310 * cs / 28, cs * 1.5, cs * 0.4); c.fill();
  fitTxt(c, `SLIDE ${n} OF ${tot}`, w - 175 * cs / 28, h - cs * 1.15, cs, '#FFFFFF', 280 * cs / 28, 'Nun9');
  if (hi > 0) { c.strokeStyle = '#E0474C'; c.lineWidth = 8; c.beginPath(); c.ellipse(w - 95 * cs / 28, h - cs * 1.15, 70 * cs / 28 * (0.6 + 0.4 * hi), cs * 1.2, -0.1, 0, TAU * hi); c.stroke(); }
  c.restore(); }

// ---------------- app chrome
function appBg(c) { if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'app' }); const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, '#262A38'); g.addColorStop(1, '#171A24'); c.fillStyle = g; c.fillRect(0, 0, W, HH);
 }
function toolbar(c, y, t, o = {}) { const btn = (x, col, draw, label) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, 46, 0, TAU); c.fill(); draw(x); txt(c, label, x, y + 74, 20, 'rgba(255,255,255,.75)', 'Nun9'); };
  c.fillStyle = 'rgba(10,12,18,.6)'; rr(c, 60, y - 70, 960, 180, 40); c.fill();
  btn(200, '#2FBF71', x => micIcon(c, x, y + 2, 1.2, true), 'MIC ON'); btn(370, '#3A3F4E', x => camIcon(c, x, y, 1.2), 'CAMERA');
  const sh = o.share || 0; btn(540, sh > 0 ? '#3C8FE0' : '#3A3F4E', x => { c.strokeStyle = '#FFFFFF'; c.lineWidth = 5; rr(c, x - 22, y - 16, 44, 32, 5); c.stroke(); c.beginPath(); c.moveTo(x, y + 8); c.lineTo(x, y - 8); c.moveTo(x - 7, y - 2); c.lineTo(x, y - 9); c.lineTo(x + 7, y - 2); c.stroke(); }, 'SHARE');
  btn(710, '#3A3F4E', x => { for (let i = -1; i <= 1; i++) { c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(x + i * 14, y, 5, 0, TAU); c.fill(); } }, 'CHAT');
  c.fillStyle = '#E0474C'; rr(c, 810, y - 34, 170, 68, 34); c.fill(); txt(c, 'LEAVE', 895, y + 2, 26, '#FFFFFF'); }
// big MICROPHONE ON button (hook + B2)
function micBig(c, t, t0) { appBg(c); const p = 1 + 0.05 * Math.sin((t - t0) * 9), k = eBack(P(t, t0, t0 + 0.25), 2);
  c.save(); c.translate(540, 900); c.scale(k * p, k * p); c.fillStyle = 'rgba(47,191,113,.25)'; c.beginPath(); c.arc(0, 0, 300 + 30 * Math.sin((t - t0) * 9), 0, TAU); c.fill();
  c.fillStyle = '#2FBF71'; c.beginPath(); c.arc(0, 0, 230, 0, TAU); c.fill(); micIcon(c, 0, 10, 6, true); c.restore();
  const q = eBack(P(t, t0 + 0.15, t0 + 0.4), 2); if (q > 0) { c.save(); c.translate(540, 1270); c.scale(q, q); c.fillStyle = '#2FBF71'; rr(c, -360, -64, 720, 128, 64); c.fill(); fitTxt(c, 'MICROPHONE ON', 0, 4, 64, '#FFFFFF', 640); c.restore(); } }

// ---------------- views (screen space)
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
const DUO = { A1: ['grant', 'her'], A2: ['grant', 'her'], B1: ['priya', 'her'], B2: ['grant', 'her'], C1: ['grant', 'her'], C2: ['grant', 'her'] };
function excellent(c, x, y, k) { if (k <= 0) return; c.save(); c.translate(x, y); c.scale(k, k); c.fillStyle = '#2FBF71'; rr(c, -250, -40, 500, 80, 40); c.fill();
  c.fillStyle = '#FFFFFF'; for (let i = 0; i < 4; i++) c.fillRect(-215 + i * 16, 14 - i * 12, 11, 12 + i * 12); fitTxt(c, 'CONNECTION: EXCELLENT', 30, 3, 32, '#FFFFFF', 400); c.restore(); }
function drawView(c, v, t, L) { const heads = {}; appBg(c);
  const ex = L === 'C2' && t > ev('excellent') ? eBack(P(t, ev('excellent'), ev('excellent') + 0.3), 2) : 0;
  if (v === 'meet') { slide(c, 40, 330, 1000, 562, t, L); heads.grant = tile(c, 40, 930, 640, 560, 'grant', t, L); tile(c, 710, 930, 330, 270, 'priya', t, L); tile(c, 710, 1220, 330, 270, 'her', t, L); }
  if (v === 'slide') { const hiA = L === 'A2' ? ev('notice') : L === 'C1' ? ev('look47') + 0.3 : 1e9; slide(c, 30, 520, 1020, 880, t, L, clamp(P(t, hiA, hiA + 0.35)));
    if (L === 'C1' && t > ev('del')) { const k = eBack(P(t, ev('del') + 0.2, ev('del') + 0.45), 2.4); c.save(); c.translate(700, 1120); c.rotate(-0.12); c.scale(k, k); UI.font(c, 'Unb9', 110); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, '47', -150, 0, '#E0474C', C.white, 14); c.strokeStyle = C.oliveD; c.lineWidth = 14; c.beginPath(); c.moveTo(-230, 10); c.lineTo(-70, -10); c.stroke(); UI.strokeText(c, '→ 46', 90, 0, C.gold, C.oliveD, 16); c.restore(); } }
  if (v === 'boss') heads.grant = tile(c, 40, 470, 1000, 1080, 'grant', t, L);
  if (v === 'priya') tile(c, 40, 470, 1000, 1080, 'priya', t, L);
  if (v === 'duo') { const [a, b] = DUO[L]; const r = tile(c, 40, 850, 490, 540, a, t, L); heads[a] = r; heads.her = tile(c, 550, 850, 490, 540, b, t, L); if (a !== 'grant') heads.grant = OFF; excellent(c, 795, 1300, ex * 0.68); }
  if (v === 'grid') { heads.grant = tile(c, 40, 470, 490, 520, 'grant', t, L); tile(c, 550, 470, 490, 520, 'priya', t, L); tile(c, 40, 1010, 490, 520, 'tom', t, L); heads.her = tile(c, 550, 1010, 490, 520, 'her', t, L); }
  if (v === 'hertile') { heads.her = tile(c, 40, 470, 1000, 1000, 'her', t, L, { label: 'YOU' }); excellent(c, 540, 1560, ex * 1.35); }
  if (v === 'mic') micBig(c, t, L === 'hook' ? endOf('hook_her') + 0.15 : ev('lookmic'));
  if (v === 'sharebtn') { const a = ev('share'); toolbar(c, 1000, t, { share: t > a + 0.25 ? 1 : 0 }); const mv = eIO(P(t, a, a + 0.25)); UI.tapCursor(c, lerp(820, 560, mv), lerp(1250, 1030, mv), 1.3, P(t, a + 0.25, a + 0.6));
    fitTxt(c, 'SHARE SCREEN?', 540, 760, 64, '#FFFFFF', 900); }
  if (v === 'share') share(c, t);
  if (!heads.grant) heads.grant = OFF; if (!heads.her) heads.her = OFFL;
  return heads; }
function share(c, t) { const k = eOut(P(t, ev('tab'), ev('tab') + 0.2));
  c.fillStyle = '#2FBF71'; rr(c, 120, 300, 840, 64, 32); c.fill(); fitTxt(c, '● YOU ARE SHARING YOUR SCREEN', 540, 334, 30, '#FFFFFF', 780);
  c.save(); c.globalAlpha = clamp(k * 1.5); c.translate(0, (1 - k) * 60);
  c.fillStyle = '#DDE1E8'; rr(c, 30, 410, 1020, 1100, 22); c.fill(); c.fillStyle = '#FFFFFF'; rr(c, 60, 430, 470, 60, 14); c.fill(); fitTxt(c, 'How to fake bad wifi…', 90, 461, 26, '#2B2F3A', 420, 'Nun9', 'left');
  c.fillStyle = '#FFFFFF'; c.fillRect(30, 500, 1020, 1010); c.fillStyle = '#F1F3F6'; rr(c, 70, 530, 940, 64, 32); c.fill(); fitTxt(c, '🔍  how to fake bad wifi to leave a meeting', 110, 563, 28, '#5A6070', 860, 'Nun9', 'left');
  fitTxt(c, 'HOW TO FAKE', 540, 700, 84, '#E0474C', 920); fitTxt(c, 'BAD WIFI', 540, 800, 96, '#E0474C', 920);
  fitTxt(c, 'SO YOU CAN LEAVE', 540, 905, 54, '#2B2F3A', 920); fitTxt(c, 'A WORK MEETING', 540, 970, 54, '#2B2F3A', 920);
  // video thumbnail: broken wifi + frozen face
  c.fillStyle = '#2B2F3A'; rr(c, 140, 1040, 800, 400, 18); c.fill(); c.strokeStyle = '#F2C14E'; c.lineCap = 'round'; c.lineWidth = 22;
  for (let i = 1; i <= 3; i++) { c.globalAlpha = i === 3 ? 0.35 : 1; c.beginPath(); c.arc(540, 1330, 70 * i, -Math.PI * 0.78, -Math.PI * 0.22); c.stroke(); } c.globalAlpha = clamp(k * 1.5);
  c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(540, 1330, 18, 0, TAU); c.fill(); c.strokeStyle = '#E0474C'; c.lineWidth = 16; c.beginPath(); c.moveTo(650, 1110); c.lineTo(780, 1250); c.moveTo(780, 1110); c.lineTo(650, 1250); c.stroke();
  c.fillStyle = 'rgba(0,0,0,.7)'; rr(c, 820, 1390, 100, 38, 8); c.fill(); fitTxt(c, '12:47', 870, 1409, 24, '#FFFFFF', 90, 'Nun9');
  c.restore(); }

// ---------------- world (her room) + the hard_cut shot list
function world(c, t, L) { c.drawImage(BGB, BX0, BY0, BW, BH); const heads = { grant: OFF };
  heads.her = K.put(c, HER, herState(t, L), 0, HF); desk(c); return heads; }
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const SH = { HER: { x: 40, y: herHY + 60, z: 1.0, r: 0, tag: 'her' }, HER_R: { x: 30, y: herHY - 150, z: 1.05, r: 0, tag: 'her' }, ROOM: { x: 0, y: -760, z: 0.62, r: 0, tag: 'her' },
  MEET: U('meet', 1), SLIDE: U('slide', 2), BOSS: U('boss', 3), PRIYA: U('priya', 4), DUO: U('duo', 5), GRID: U('grid', 6), MIC: U('mic', 7), SHAREBTN: U('sharebtn', 8), SHARE: U('share', 9), HERTILE: U('hertile', 10) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }); if (L === 'outro') return SH.ROOM;
  if (L === 'hook') { if (t < SP.hook_her.t - 0.1) return SH.HER; if (t < endOf('hook_her') + 0.15) return f(SH.HER_R); return f(SH.MIC); }
  const u = t - sc.s, l = L.toLowerCase(), nar = SP[l + '_nar'];
  if (u < 1.15) return f({ A1: SH.MEET, A2: SH.MEET, B1: SH.MEET, B2: SH.HER, C1: SH.HER, C2: SH.BOSS }[L]);
  if (nar && t >= nar.t - 0.1) return f(SH.DUO);
  const sp = id => speaking(id, t, 0.1, 0.2);
  if (L === 'A1') { if (t < SP.a1_her.t - 0.1) return f(SH.MEET); if (t > ev('click1') - 0.05 && t < SP.a1_her2.t - 0.1) return f(SH.MEET); if (t > ev('stare') - 0.05 && t < ev('sip') - 0.05) return f(SH.BOSS); return f(SH.HER); }
  if (L === 'A2') { if (t < ev('slide2') - 0.05) return f(SH.MEET); if (t < SP.a2_her.t - 0.1) return f(SH.SLIDE); if (sp('a2_x')) return f(SH.BOSS); return f(SH.HER); }
  if (L === 'B1') { if (t < SP.b1_her.t - 0.1) return f(SH.MEET); if (t > ev('choke') - 0.05 && t < ev('glasses') - 0.05) return f(SH.PRIYA); if (t > ev('glasses') - 0.05 && t < endOf('b1_x') + 0.15) return f(SH.BOSS); if (t > ev('point') - 0.05) return f(SH.PRIYA); return f(SH.HER); }
  if (L === 'B2') { if (t > ev('lookmic') - 0.05 && t < SP.b2_her.t - 0.1) return f(SH.MIC); if (sp('b2_x')) return f(SH.BOSS); if (t > SP.b2_x2.t - 0.1) return f(SH.HER_R); return f(SH.HER); }
  if (L === 'C1') { if (sp('c1_x') || sp('c1_x2')) return f(SH.BOSS); if (t > ev('look47') - 0.05 && t < SP.c1_x2.t - 0.1) return f(SH.SLIDE); if (t > ev('del') - 0.05 && t < ev('awk') - 0.05) return f(SH.SLIDE); if (t > ev('awk') - 0.05) return f(SH.HER_R); return f(SH.HER); }
  if (L === 'C2') { if (t < SP.c2_x.t + SP.c2_x.d + 0.2) return f(SH.BOSS);
    const ch = SP.c2_her, c1 = ch.words && ch.words.length > 4 ? ch.t + ch.words[4][1] : ch.t + 1.6, c2 = ch.words && ch.words.length > 15 ? ch.t + ch.words[15][1] : ch.t + 6.2;
    if (t > c1 - 0.1 && t < c2 - 0.1) return f(SH.BOSS);                                             // his face while she lays it out
    if (t < ev('clap') - 0.05) return f(SH.HER);
    if (t < ev('tom') - 0.05) return f(SH.PRIYA); if (t < SP.c2_x2.t - 0.1) return f(SH.GRID);
    if (t < SP.c2_her2.t - 0.1) return f(SH.BOSS); if (t < ev('share') - 0.05) return f(SH.HER);
    if (t < ev('tab') - 0.05) return f(SH.SHAREBTN); if (t < ev('stopclap') - 0.05) return f(SH.SHARE); if (t < SP.c2_x4.t - 0.1) return f(SH.GRID);
    if (t < ev('freeze') - 0.05) return f(SH.BOSS); if (t < ev('excellent') - 0.05) return f(SH.HER); if (t < SP.c2_x5.t - 0.1) return f(SH.HERTILE); return f(SH.DUO); }
  return SH.HER; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft']);
function drawWorld(c, t, L, cam, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L); const M = c.getTransform(); c.restore(); return { heads, M }; }

// overlays on her shots
function msgPopup(c, t) { const a = ev('msg'), k = eBack(P(t, a, a + 0.3), 1.8) * (1 - eIn(P(t, SP.b2_her.t + 0.6, SP.b2_her.t + 0.9))); if (k <= 0) return; c.save(); c.translate(540, 470); c.scale(k, k);
  c.fillStyle = 'rgba(0,0,0,.3)'; rr(c, -440 + 8, -110 + 12, 880, 220, 30); c.fill(); c.fillStyle = '#FFFDF8'; rr(c, -440, -110, 880, 220, 30); c.fill(); c.strokeStyle = '#E0474C'; c.lineWidth = 8; rr(c, -440, -110, 880, 220, 30); c.stroke();
  c.fillStyle = '#3FB6A8'; c.beginPath(); c.arc(-360, -40, 40, 0, TAU); c.fill(); txt(c, 'P', -360, -38, 40, '#FFFFFF'); fitTxt(c, 'PRIYA · CHAT', -300, -50, 30, '#5A6070', 500, 'Nun9', 'left');
  fitTxt(c, 'YOUR MIC IS ON!!!', 0, 45, 78, '#E0474C', 820); c.restore(); }
function volHud(c, t) { const a = ev('vol'), b = SP.b2_x2.t + SP.b2_x2.d + 0.2; if (t < a || t > b) return; const k = eBack(P(t, a, a + 0.2), 2), lv = clamp(P(t, a, a + 0.45));
  c.save(); c.translate(540, 1420); c.scale(k, k); c.fillStyle = 'rgba(20,22,30,.85)'; rr(c, -360, -70, 720, 140, 40); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(-300, -16); c.lineTo(-280, -16); c.lineTo(-255, -38); c.lineTo(-255, 38); c.lineTo(-280, 16); c.lineTo(-300, 16); c.fill();
  c.fillStyle = 'rgba(255,255,255,.2)'; rr(c, -220, -14, 330, 28, 14); c.fill(); c.fillStyle = lv > 0.9 ? '#E0474C' : '#FFFFFF'; rr(c, -220, -14, 330 * Math.max(0.08, lv), 28, 14); c.fill(); fitTxt(c, `VOLUME: ${Math.round(lerp(20, 100, lv))}%`, 240, 2, 32, '#FFFFFF', 220); c.restore(); }

// ---------------- hook & frame
function coverBadge(c, t) { const p = 1 + 0.04 * Math.sin(t * 8); c.save(); c.translate(540, 1530); c.scale(p, p); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -300 + 6, -60 + 10, 600, 120, 60); c.fill(); c.fillStyle = '#2FBF71'; rr(c, -300, -60, 600, 120, 60); c.fill();
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(-225, 0, 40, 0, TAU); c.fill(); c.save(); c.translate(-225, 2); c.fillStyle = '#2FBF71'; rr(c, -9, -22, 18, 30, 9); c.fill(); c.strokeStyle = '#2FBF71'; c.lineWidth = 4; c.beginPath(); c.arc(0, -4, 15, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke(); c.beginPath(); c.moveTo(0, 11); c.lineTo(0, 20); c.stroke(); c.restore();
  fitTxt(c, 'MIC ON', 50, 4, 64, '#FFFFFF', 380); c.restore(); }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { K.outro(c, t, { q: ['А ЧТО БЫ ТЫ СКАЗАЛ(А)', 'НАЧАЛЬНИКУ?'], rows: [['A2', 'Can we finish earlier?'], ['B1', 'This could have been an email.'], ['B2', 'I thought I was muted.'], ['C2', 'With all due respect…']], cta: ['ОТПРАВЬ КОЛЛЕГЕ,', 'КТО ЗАБЫЛ ПРО МИКРОФОН'],
    hero: (cc, tt) => K.put(cc, HER, { t: tt, mood: 'happy', turn: 0, look: 0, armL: reach(G.her, -1, -G.her.sw * 2.0, G.her.ySh - 260 + Math.sin(tt * 8) * 30, { planar: true }), armR: reach(G.her, 1, G.her.sw * 1.1, G.her.ySh + 260), items: { R: mugItem(0) } }, 0, 0) });
    Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const f = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[f], sh = shake(t), tag = cam.tag || 'her';
  let heads, proj;
  if (tag.startsWith('ui:')) { c.save(); c.translate(sh.x, sh.y); heads = drawView(c, tag.slice(3), t, L); c.restore(); proj = p => p; }
  else { const r = drawWorld(c, t, L, cam, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26);
    if (L === 'B2') { msgPopup(c, t); volHud(c, t); } }
  if (L === 'hook') { if (t < endOf('hook_her') + 0.15) coverBadge(c, t);
    K.bubbles(c, t, { id: 'hook' }, heads, proj, { hold: { hook_her: 0.15 } }); K.titleRibbon(c, t, 540, 455); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); UI.captions(c, t);
    Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  K.bubbles(c, t, sc, heads, proj, { names: { grant: ['MR GRANT', '#2B3A67'] }, hold: { c2_her: 0.3, c1_her2: 0.3, a1_her2: 0.25, c2_x5: 0.9 } });
  if (L === 'C2') K.dots(c, t, ev('freeze') + 0.15, ev('excellent') - 0.1, 1480);
  K.hud(c, t, sc);
}
E.run('mic', NF, renderFrame);
