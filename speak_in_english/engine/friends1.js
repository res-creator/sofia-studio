// #1millionstories — «Друзья»: десять сезонов вместо курсов (1st person, Sonya). hard_cut camera: node friends1.js start end out.mp4 | --png=f1,f2
// Locations: a London café (0) and Sonya's rented room (20000); UI inserts: the laptop (the show, no characters drawn) + quote stickers, the study montage.
// Russian narrator captions + small English subtitles under them (the challenge asks for English subtitles).
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/friends1/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
for (const sp of TL.speech) { if (sp.who === 'nar' || sp.who === 'tip') continue; const sc = TL.scenes.find(x => sp.t >= x.s && sp.t < x.e); sp.id = sc.id + '_' + sp.id; }
const HOLD = {}; for (const [k, v] of Object.entries({ bar: -0.1, col1: -0.2, col2: -0.25, her1: -0.2, col3: -0.2 })) HOLD[SP[k].id] = v;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
{ const _bub = UI.bubble; UI.bubble = (ctx, sp, t, an, side, name) => _bub(ctx, sp.hold < 0.05 ? { ...sp, d: sp.d + sp.hold - 0.05 } : sp, t, an, side, name); }
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function hand(c, s, x, y, size, col, maxW) { c.save(); c.font = `italic ${size}px Nun9`; const w = c.measureText(s).width; if (w > maxW) c.font = `italic ${size * maxW / w}px Nun9`; c.fillStyle = col; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s, x, y); c.restore(); }

// ---------------- cast
const HER = { ...BASE.her_lift, top: { type: 'hoodie', col: '#E07A9A' }, bottom: { type: 'jeans', col: '#3E4F7A' } };
const BAR = { ...BASE.rita, top: { type: 'tee', col: '#2F6F5E' }, hair: { style: 'highpony', col: '#B5652E' } };
const TOM = { ...BASE.mark, top: { type: 'sweater', col: '#4E7FC0' } };
const AMY = { ...BASE.priya, top: { type: 'cardigan', col: '#F2B33D' } };
const BEN = { ...BASE.max, cap: null, top: { type: 'hoodie', col: '#58A57A' } };
const G = { her: geom(HER), bar: geom(BAR), tom: geom(TOM), amy: geom(AMY), ben: geom(BEN) };
const OX = { cafe: 0, room: 20000 };
const LOC = { hook: 'cafe', office: 'cafe', alone: 'room', show: 'room', study: 'room', joke: 'cafe', bday: 'room' };

// ---------------- backgrounds
const BX0 = -2800, BY0 = -4400, BW = 5600, BH = 5600, BS = 0.5;
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.3px)'; d.drawImage(a, 0, 0); return b; };
function drawCafe(c) {
  c.fillStyle = '#3E5A52'; c.fillRect(BX0, BY0, BW, BH); c.fillStyle = '#C9A06A'; c.fillRect(BX0, -1500, BW, 1500);
  c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 6; for (let x = BX0; x < BX0 + BW; x += 120) { c.beginPath(); c.moveTo(x, -1500); c.lineTo(x, 0); c.stroke(); }
  // window onto a rainy London street with a red bus
  c.fillStyle = '#F4F1E4'; c.fillRect(-2500, -3600, 1600, 1700); c.fillStyle = '#AFC4D6'; c.fillRect(-2450, -3550, 1500, 1600);
  c.fillStyle = '#8A8F9A'; c.fillRect(-2450, -2400, 1500, 450); c.fillStyle = '#C8102E'; rr(c, -2300, -2650, 900, 500, 40); c.fill(); c.fillStyle = '#BFE0F0'; for (let i = 0; i < 5; i++) c.fillRect(-2250 + i * 170, -2600, 130, 140); c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(-2150, -2150, 60, 0, TAU); c.arc(-1550, -2150, 60, 0, TAU); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 3; for (let i = 0; i < 60; i++) { const x = -2450 + (i * 137) % 1500, y = -3550 + (i * 211) % 1600; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 10, y + 40); c.stroke(); }
  c.fillStyle = '#F4F1E4'; c.fillRect(-1720, -3550, 30, 1600);
  // menu board + espresso machine + the counter (live front)
  c.fillStyle = '#1E2A26'; rr(c, 300, -3500, 1500, 900, 20); c.fill(); fitTxt(c, 'COFFEE', 1050, -3380, 90, '#F7E7A8', 1300); ['FLAT WHITE  £3.40', 'OAT LATTE  £3.80', 'TEA  £2.50', 'CROISSANT  £2.90'].forEach((s, i) => fitTxt(c, s, 1050, -3200 + i * 130, 60, '#FFFFFF', 1300, 'Nun9'));
  c.fillStyle = '#B9C1CA'; rr(c, 1900, -2100, 600, 500, 30); c.fill(); c.fillStyle = '#6A7480'; c.fillRect(1950, -1650, 500, 60);
  c.fillStyle = '#E9E3D6'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(-600 + i * 180, -1900, 60, 0, TAU); c.fill(); }   // cups on a shelf
  c.fillStyle = '#5A3E2E'; c.fillRect(BX0, -10, BW, 2000); }
function drawRoom(c) {
  c.fillStyle = '#E9D6C0'; c.fillRect(BX0, BY0, BW, BH); c.fillStyle = 'rgba(255,255,255,.25)'; for (let x = BX0; x < BX0 + BW; x += 150) c.fillRect(x, BY0, 60, BH);
  c.fillStyle = '#FFFFFF'; c.fillRect(-1900, -3300, 1200, 1400); const g = c.createLinearGradient(0, -3260, 0, -1940); g.addColorStop(0, '#2A3A6A'); g.addColorStop(1, '#E08A6A'); c.fillStyle = g; c.fillRect(-1860, -3260, 1120, 1320);
  c.fillStyle = '#1E2236'; for (const [x, w, h] of [[-1860, 200, 500], [-1640, 160, 760], [-1460, 240, 420], [-1200, 120, 900], [-1060, 300, 560]]) c.fillRect(x, -1940 - h, w, h);
  c.fillStyle = '#1E2236'; c.fillRect(-1230, -2900, 60, 300); c.beginPath(); c.arc(-1200, -2930, 50, 0, TAU); c.fill();   // a clock tower silhouette
  c.fillStyle = 'rgba(255,214,140,.7)'; for (let i = 0; i < 12; i++) c.fillRect(-1840 + (i * 97) % 1050, -2400 + (i * 131) % 380, 22, 30);
  c.fillStyle = '#FFFFFF'; c.fillRect(-1320, -3260, 30, 1320); c.fillRect(-1860, -2620, 1120, 30);
  paint(c, q => { q.m(-700, -700); q.l(1700, -700); q.l(1700, 0); q.l(-700, 0); q.z(); }, '#8E7AB8', { sd: 8, hd: 4, lw: 5 }); c.fillStyle = '#F4F1EC'; rr(c, -680, -860, 2360, 200, 60); c.fill(); c.fillStyle = '#FFFFFF'; rr(c, 1150, -1040, 480, 220, 60); c.fill();
  c.fillStyle = '#C9774A'; c.fillRect(1900, -2500, 600, 2500); c.fillStyle = '#B5652E'; c.fillRect(1950, -2450, 500, 2440); c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(2400, -1250, 26, 0, TAU); c.fill();   // the door (right)
  c.fillStyle = '#B48A60'; c.fillRect(BX0, -10, BW, 2000); }
const BG = { cafe: mkBG(drawCafe), room: mkBG(drawRoom) };

// ---------------- helpers
const down = (g, s) => reach(g, s, s * g.sw * 1.05, g.ySh + 520, { planar: true });
const chest = (g, s, dy = 260, k = 0.5) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const open = (g, s, k = 1.7, dy = 90) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const handItem = draw => (ctx, a) => { ctx.save(); ctx.rotate(a - Math.PI / 2); ctx.translate(0, 40); draw(ctx); ctx.restore(); };
const cup = handItem(q => { paint(q, z => { z.m(-32, -50); z.l(32, -50); z.l(26, 40); z.l(-26, 40); z.z(); }, '#FFFFFF', { sd: 4, hd: 2, lw: 3 }); q.fillStyle = '#7A4A2A'; q.fillRect(-30, -20, 60, 14); });
const phone = handItem(q => { paint(q, z => { z.m(-40, -72); z.l(40, -72); z.l(40, 72); z.l(-40, 72); z.z(); }, '#2B2F3A', { sd: 5, hd: 2, lw: 3 }); q.fillStyle = '#BFE6FF'; rr(q, -33, -64, 66, 128, 8); q.fill(); });
const cakeItem = handItem(q => { paint(q, z => { z.m(-110, -60); z.l(110, -60); z.l(110, 40); z.l(-110, 40); z.z(); }, '#F7C6D9', { sd: 5, hd: 2, lw: 4 }); q.fillStyle = '#FFFFFF'; q.fillRect(-110, -70, 220, 18); for (let i = 0; i < 3; i++) { q.fillStyle = '#5BA0E0'; q.fillRect(-50 + i * 50, -120, 12, 50); q.fillStyle = '#F2B33D'; q.beginPath(); q.ellipse(-44 + i * 50, -130, 8, 14, 0, 0, TAU); q.fill(); } });
const gest = (st, g, who, t, side, b = 120) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + b + Math.cos(u) * 20, { planar: true }); } };
const base = (g, t, who) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, armL: down(g, -1), armR: down(g, 1), items: {} });

// ---------------- states
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { ...base(g, t, 'her'), turn: 0.2, look: 0.6 };
  if (L === 'hook') { st.mood = 'worried'; st.blink = 0; st.look = 0.7; st.lookY = -0.1; }
  if (L === 'office') { st.mood = 'neutral'; st.look = 0.5; st.items = { R: cup }; st.armR = chest(g, 1, 200, 0.6); if (t > e('late')) { st.mood = 'happy'; st.laugh = true; } if (t > SP.col1.t) { st.mood = 'worried'; st.laugh = false; st.blink = 0; } }
  if (L === 'alone') { st.mood = 'sad'; st.turn = 0; st.look = 0; st.lookY = 0.35; st.items = { R: phone }; st.armR = chest(g, 1, 150, 0.6); }
  if (L === 'show' || L === 'study') { st.turn = 0; st.look = 0; st.lookY = 0.3; st.items = { R: phone }; st.armR = chest(g, 1, 150, 0.6); st.mood = L === 'study' ? 'happy' : 'neutral'; st.laugh = L === 'study' && Math.sin(t * 1.3) > 0.6; if (L === 'study') st.talk = 0.4 + 0.4 * Math.sin(t * 9); }
  if (L === 'joke') { st.mood = 'smug'; st.look = 0.7; st.items = { R: cup }; st.armR = chest(g, 1, 200, 0.6); if (speaking('her1', t, 0.05, 0.1)) { st.mood = 'smug'; st.blink = 1; gest(st, g, 'her', t, -1, 120); } if (t > e('laugh')) { st.mood = 'happy'; st.laugh = true; } }
  if (L === 'bday') { st.mood = 'surprised'; st.turn = 0.3; st.look = 0.8; st.blink = 0; if (t > SP.col3.t + 0.6) { st.mood = 'happy'; st.laugh = true; st.armL = open(g, -1, 1.6, 60); st.armR = open(g, 1, 1.6, 60); } }
  return st; }
function crewState(who, t, L) { const g = G[who], e = k => ev(L, k), st = { ...base(g, t, who), mood: 'happy', turn: -0.2, look: -0.6 };
  if (L === 'office') { st.laugh = t < e('late') + 0.5; st.items = { R: cup }; st.armR = chest(g, 1, 200, 0.6); if (who === 'tom' && speaking('col1', t, 0.05, 0.1)) { st.laugh = false; st.mood = 'surprised'; } if (t > SP.col1.t + 0.4) { st.laugh = false; st.mood = 'neutral'; } }
  if (L === 'joke') { st.items = { R: cup }; st.armR = chest(g, 1, 200, 0.6); st.mood = 'neutral';
    if (who === 'tom') { const k = eOut(clamp((t - e('run')) / 0.6)); st.mood = 'worried'; st.blink = 0; st.items = { L: cup, R: cup }; st.armL = chest(g, -1, 150, 0.9); st.armR = chest(g, 1, 150, 0.9); if (t > SP.her1.t + 0.2) st.mood = 'shock'; }
    if (t > e('beat')) { st.mood = 'surprised'; st.blink = 0; } if (t > e('laugh')) { st.mood = 'happy'; st.laugh = true; st.headY = Math.abs(Math.sin(t * 9)) * 8; } }
  if (L === 'bday') { st.mood = 'happy'; st.turn = -0.3; st.look = -0.8; if (who === 'tom') { st.items = { R: cakeItem }; st.armR = chest(g, 1, 180, 0.9); st.armL = chest(g, -1, 180, 0.9); } else st.armL = open(g, -1, 1.6, 40 + Math.sin(t * 7) * 20); }
  return st; }
function barState(t) { const g = G.bar, st = { ...base(g, t, 'barista9'), mood: 'happy', turn: -0.25, look: -0.7 }; gest(st, g, 'barista9', t, -1, 100); return st; }

// ---------------- world
function cafe(c, t, L) { const heads = {}, ox = OX.cafe; c.drawImage(BG.cafe, ox + BX0, BY0, BW, BH);
  if (L === 'hook') { heads.barista9 = K.put(c, BAR, barState(t), ox + 800, 0);
    paint(c, q => { q.m(ox + 200, -1000); q.l(ox + 2700, -1000); q.l(ox + 2700, 0); q.l(ox + 200, 0); q.z(); }, '#7A5236', { sd: 6, hd: 3, lw: 5 }); c.fillStyle = '#E9E3D6'; c.fillRect(ox + 150, -1060, 2600, 70);
    heads.her = K.put(c, HER, herState(t, L), ox - 500, 0);
    // the letter cloud over her head
    const k = eOut(clamp((t - ev('hook', 'cloud')) / 0.4)); if (k > 0) { const hd = heads.her; c.save(); c.translate(hd.x + 60, hd.y - hd.hh * 2.6); c.scale(k, k); c.fillStyle = 'rgba(255,255,255,.92)'; for (const [dx, dy, r] of [[-180, 0, 150], [0, -60, 190], [190, 0, 150], [0, 70, 160]]) { c.beginPath(); c.arc(dx, dy, r, 0, TAU); c.fill(); }
      'qwXz?!kL#@yb&%'.split('').forEach((ch, i) => { const a = i / 14 * TAU + t * 0.6; fitTxt(c, ch, Math.cos(a) * (120 + (i % 3) * 40), Math.sin(a) * 90, 64, ['#E0474C', '#3E73B8', '#2B2F3A', '#F2B33D'][i % 4], 100); }); c.restore(); } }
  else { // the office crowd at a café table
    const tx = L === 'joke' ? 300 : 0;
    heads.amy = K.put(c, AMY, crewState('amy', t, L), ox + 650, 0); heads.ben = K.put(c, BEN, crewState('ben', t, L), ox + 1150, 0);
    if (L === 'office') heads.colleague9 = K.put(c, TOM, crewState('tom', t, L), ox + 150, 0);
    if (L === 'joke') { const k = eOut(clamp((t - ev('joke', 'run')) / 0.7)); heads.colleague9 = K.put(c, TOM, crewState('tom', t, L), ox + lerp(2600, 1700, k), 0); }
    paint(c, q => { q.m(ox - 1100, -720); q.l(ox + 1500, -720); q.l(ox + 1500, -660); q.l(ox - 1100, -660); q.z(); }, '#E9E3D6', { sd: 4, hd: 2, lw: 4 }); c.fillStyle = '#6A4126'; c.fillRect(ox - 1000, -660, 60, 660); c.fillRect(ox + 1340, -660, 60, 660);
    heads.her = K.put(c, HER, herState(t, L), ox - 550 + tx * 0, 0);
    if (L === 'office' && t > ev('office', 'blush')) { const hd = heads.her; c.fillStyle = 'rgba(232,51,63,.35)'; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(hd.x + s * hd.hh * 0.55, hd.y + hd.hh * 0.35, hd.hh * 0.3, hd.hh * 0.18, 0, 0, TAU); c.fill(); } } }
  return heads; }
function room(c, t, L) { const heads = {}, ox = OX.room; c.drawImage(BG.room, ox + BX0, BY0, BW, BH);
  if (L === 'alone' || L === 'show' || L === 'study') heads.her = K.put(c, HER, herState(t, L), ox + 300, 0);
  if (L === 'bday') { const k = eOut(clamp((t - ev('bday', 'door')) / 0.5));
    heads.colleague9 = K.put(c, TOM, crewState('tom', t, L), ox + lerp(2700, 1700, k), 0); heads.amy = K.put(c, AMY, crewState('amy', t, L), ox + lerp(3100, 2200, k), 0);
    heads.her = K.put(c, HER, herState(t, L), ox + 700, 0); }
  return heads; }
function world(c, t, L) { return LOC[L] === 'room' ? room(c, t, L) : cafe(c, t, L); }

// ---------------- shots
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const HY = G.her.headY, fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(150, fy(HY, 0.5, 1020), 0.5, 'cover'), BAR: S(800, fy(G.bar.headY, 1.15, 880), 1.15, 'bar'), HER_C: S(-450, fy(HY, 0.9, 1000), 0.9, 'herc'),
  TABLE: S(300, fy(HY, 0.5, 1050), 0.5, 'table'), TOM: S(150, fy(G.tom.headY, 1.15, 880), 1.15, 'tom'), HER_CU: S(-530, fy(HY, 1.25, 900), 1.25, 'her'),
  ROOM: S(OX.room + 300, fy(HY, 0.75, 950), 0.75, 'room'), RUN: S(1650, fy(G.tom.headY, 0.75, 900), 0.75, 'run'), JOKE: S(-500, fy(HY, 1.2, 900), 1.2, 'her'), WIDE: S(400, fy(HY, 0.48, 1060), 0.48, 'wide'),
  DOOR: S(OX.room + 1300, fy(HY, 0.55, 1000), 0.55, 'door'), BDAY_CU: S(OX.room + 700, fy(HY, 1.15, 900), 1.15, 'her'),
  WATCH: S(OX.room + 300, fy(HY, 1.25, 900), 1.25, 'watch'), LAPTOP: U('laptop', 1) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < 0.4) return SH.COVER; if (t < SP.bar.t + SP.bar.d - 0.1) return f(SH.BAR); return f(SH.HER_C); }
  if (L === 'office') { if (t < SP.col1.t - 0.1) return f(SH.TABLE); if (t < e('blush') - 0.05) return f(SH.TOM); return f(SH.HER_CU); }
  if (L === 'alone') return f(SH.ROOM);
  if (L === 'show' || L === 'study') { if (L === 'show' && t > ev('show', 'stickers') - 0.3) return f(SH.LAPTOP); return (Math.floor((t - sc.s) / 3.2) % 3 === 2) ? f(SH.WATCH) : f(SH.LAPTOP); }
  if (L === 'joke') { if (t < SP.col2.t - 0.1) return f(SH.RUN); if (t < SP.her1.t - 0.1) return f(SH.RUN); if (t < e('beat')) return f(SH.JOKE); return f(SH.WIDE); }
  if (L === 'bday') { if (t < SP.n9.t) return f(SH.DOOR); return f(SH.BDAY_CU); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact']);
function drawWorld(c, t, L, cam, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- the laptop insert: the show (a living room: orange sofa, a coffee table with six cups), season counter, quote stickers, study montage
function laptopView(c, t) { const L = sceneAt(t).id; const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, '#3A2A3E'); g.addColorStop(1, '#1A141E'); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  const k = eBack(clamp((t - SC.show.s + 0.05) / 0.35), 1.4) * (1 + 0.04 * Math.sin((t - SC.show.s) * 0.4)); c.save(); c.translate(540, 600); c.scale(k, k);
  c.fillStyle = '#2B2F3A'; rr(c, -460, -320, 920, 600, 30); c.fill(); c.fillStyle = '#6A7480'; rr(c, -540, 280, 1080, 50, 20); c.fill();
  c.save(); c.beginPath(); rr(c, -430, -290, 860, 540, 14); c.clip();
  c.fillStyle = '#7A5A8E'; c.fillRect(-430, -290, 860, 540); c.fillStyle = '#5A3E6A'; c.fillRect(-430, 80, 860, 170);
  c.fillStyle = '#4A6A9A'; c.fillRect(-120, -250, 240, 180); c.fillStyle = '#F4F1E4'; c.fillRect(-110, -240, 220, 160); c.fillStyle = '#7A5A8E'; c.fillRect(-12, -240, 24, 160);   // window
  paint(c, q => { q.m(-330, 20); q.l(330, 20); q.l(330, 140); q.l(-330, 140); q.z(); }, '#E07A2E', { sd: 5, hd: 2, lw: 4 }); paint(c, q => { q.m(-360, -40); q.l(-300, -40); q.l(-300, 160); q.l(-360, 160); q.z(); }, '#C8661E', { sd: 4, hd: 2, lw: 3 }); paint(c, q => { q.m(300, -40); q.l(360, -40); q.l(360, 160); q.l(300, 160); q.z(); }, '#C8661E', { sd: 4, hd: 2, lw: 3 });
  c.fillStyle = '#C08A50'; c.fillRect(-200, 170, 400, 30); for (let i = 0; i < 6; i++) { c.fillStyle = ['#E0474C', '#F2B33D', '#4CAF6A', '#3E73B8', '#8E5BD0', '#F06AA6'][i]; c.fillRect(-170 + i * 62, 130, 40, 44); }
  c.restore();
  const seasons = L === 'study' ? Math.min(10, 1 + Math.floor((t - SC.study.s) / 0.7)) : 1, ep = L === 'study' ? 1 + Math.floor((t * 7) % 24) : 1;
  c.fillStyle = 'rgba(0,0,0,.6)'; rr(c, -420, -280, 330, 60, 14); c.fill(); fitTxt(c, `SEASON ${seasons} · EP ${ep}`, -255, -250, 32, '#FFFFFF', 300, 'Nun9');
  c.restore();
  // quote stickers
  const ST = [["How you doin'?", '#F2C14E', -0.08, 280, 1060], ['We were on a break!', '#7FC8F0', 0.06, 770, 1170], ['Could it BE any', '#F7A8C8', -0.04, 380, 1300]];
  if (L === 'show') ST.forEach(([s, col, rot, x, y], i) => { const kk = eBack(clamp((t - ev('show', 'st' + i)) / 0.3), 2); if (kk <= 0) return; c.save(); c.translate(x, y); c.rotate(rot); c.scale(kk, kk); c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(-250 + 10, -80 + 12, 500, 160); c.fillStyle = col; c.fillRect(-250, -80, 500, 160); hand(c, i === 2 ? 'Could it BE any more…?' : s, 0, 0, 52, '#2B2F3A', 460); c.restore(); });
  // study montage: a notebook getting thicker and a pile of mugs
  if (L === 'study') { const u = clamp((t - SC.study.s) / (SC.study.e - SC.study.s)); c.save(); c.translate(280, 1250); for (let i = 0; i < 2 + u * 12; i++) { c.fillStyle = i % 2 ? '#F4F1E4' : '#E9E3D6'; c.fillRect(-170, -i * 14, 340, 14); } c.fillStyle = '#E07A9A'; c.fillRect(-170, -(2 + u * 12) * 14 - 20, 340, 24); c.restore();
    c.save(); c.translate(780, 1250); for (let i = 0; i < 1 + Math.floor(u * 7); i++) { const x = ((i % 3) - 1) * 110, y = -Math.floor(i / 3) * 110; c.fillStyle = '#FFFFFF'; c.fillRect(x - 45, y - 90, 90, 90); c.strokeStyle = '#FFFFFF'; c.lineWidth = 12; c.beginPath(); c.arc(x + 55, y - 45, 26, -1.3, 1.3); c.stroke(); } c.restore(); } }
const VIEWS = { 'ui:laptop': laptopView };

// ---------------- overlays
function title(c, t) { const a = 1 - P(t, 0.25, 0.4); if (a <= 0) return; const lines = TL.cfg.hook_title;
  c.save(); c.globalAlpha = a; c.translate(540, 300); c.rotate(-0.03); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 66, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -100);
  UI.textFit(c, 'Unb9', 120, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 6, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 60, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 110); c.restore(); }
const CHAP = { alone: 'ВЕЧЕРОМ', joke: 'ГОД СПУСТЯ', bday: 'ДЕНЬ РОЖДЕНИЯ' };
function chapter(c, txt) { c.save(); UI.font(c, 'Unb9', 40); const w = c.measureText(txt).width + 60; c.fillStyle = 'rgba(43,47,58,.82)'; rr(c, 540 - w / 2, 150, w, 70, 35); c.fill(); c.fillStyle = '#FFFFFF'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, 540, 187); c.restore(); }
// small English subtitle under the Russian narrator captions (and translations of the tip quotes)
function enSub(c, t) { const sp = TL.speech.find(s => (s.who === 'nar') && t >= s.t && t < s.t + s.d + 0.15); if (!sp || !sp.ru) return; c.save(); UI.font(c, 'Nun9', 32); const lines = UI.wrap(c, sp.ru, 900); const h = lines.length * 42 + 20; c.fillStyle = 'rgba(0,0,0,.5)'; rr(c, 540 - 470, 1610 - 10, 940, h, 16); c.fill(); c.fillStyle = '#FFFFFF'; c.textAlign = 'center'; c.textBaseline = 'top'; lines.forEach((l, i) => c.fillText(l, 540, 1610 + i * 42)); c.restore(); }

// ---------------- end screen
function endScreen(c, t) { const s = SC.outro.s, u = t - s, { textFit, strokeText, font } = UI; c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34); { const g = G.her, gt = G.tom; K.put(c, TOM, { t, mood: 'happy', turn: -0.2, look: -0.4, armL: open(gt, -1, 1.6, 60), armR: down(gt, 1), items: { R: cup } }, 640, 0); K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 160 + Math.sin(t * 8) * 30, { planar: true }), armR: down(g, 1), items: { R: cup } }, 0, 0); } c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const q = eBack(P(u, 0.1, 0.45), 2.2); if (q > 0) { c.save(); c.translate(540, 330); c.scale(q, q); textFit(c, 'Unb9', 58, 'КАКОЙ СЕРИАЛ', 900); strokeText(c, 'КАКОЙ СЕРИАЛ', 0, -80, C.oliveD, C.white, 12); textFit(c, 'Unb9', 58, 'СПАС ТЕБЯ', 900); strokeText(c, 'СПАС ТЕБЯ', 0, -5, C.oliveD, C.white, 12); textFit(c, 'Unb9', 66, 'ОТ ОДИНОЧЕСТВА?', 940); strokeText(c, 'ОТ ОДИНОЧЕСТВА?', 0, 75, C.pink, C.white, 12); c.restore(); }
  const pk = eBack(P(t, s + 0.4, s + 0.7), 2); if (pk > 0) { c.save(); c.translate(540, 680); c.scale(pk, pk); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 5; rr(c, -430, -110, 860, 220, 30); c.fill(); c.stroke(); textFit(c, 'Nun9', 30, 'ФРАЗА РОЛИКА', 700); c.fillStyle = C.pink; c.fillText('ФРАЗА РОЛИКА', 0, -70); textFit(c, 'Unb9', 50, 'Could it BE any…?', 780); c.fillStyle = C.oliveD; c.fillText('Could it BE any…?', 0, -10); textFit(c, 'Nun9', 32, 'ирония: «ещё сильнее уже некуда»', 780); c.fillText('ирония: «ещё сильнее уже некуда»', 0, 55); c.restore(); }
  const svT = s + 1.0, sk = eBack(P(t, svT, svT + 0.3), 2.2); if (sk > 0) { c.save(); c.translate(540, 960); c.scale(sk, sk); c.fillStyle = C.gold; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -260, -60, 520, 120, 60); c.fill(); c.stroke(); c.fillStyle = C.oliveD; c.beginPath(); c.moveTo(-190, -32); c.lineTo(-146, -32); c.lineTo(-146, 34); c.lineTo(-168, 16); c.lineTo(-190, 34); c.closePath(); c.fill(); textFit(c, 'Unb9', 50, 'СОХРАНИ', 330); c.fillStyle = C.oliveD; c.fillText('СОХРАНИ', 40, 4); c.restore(); }
  const subT = svT + 0.6, bk = eBack(P(t, subT, subT + 0.3), 2), sy = 1140;
  if (bk > 0) { const pressed = t > subT + 0.9; c.save(); c.translate(560, sy); c.scale(bk, bk); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -250, -58, 500, 116, 58); c.fill(); textFit(c, 'Unb9', 42, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 440); c.fillStyle = C.white; c.fillText(pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4); c.restore();
    const mv = eIO(P(t, subT + 0.2, subT + 0.8)); UI.tapCursor(c, lerp(900, 620, mv), lerp(sy + 260, sy + 20, mv), 1, P(t, subT + 0.85, subT + 1.4)); }
  Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads = {}, proj = p => p;
  if (tag.startsWith('ui:')) { VIEWS[tag](c, t); Hq.vignette(c, W, HH, 0.25); }
  else { const r = drawWorld(c, t, L, cam, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.22);
    if (LOC[L] === 'room' && L !== 'bday') { c.fillStyle = 'rgba(20,24,60,.28)'; c.fillRect(0, 0, W, HH); if (L !== 'alone') { const gg = c.createRadialGradient(540, 900, 50, 540, 900, 700); gg.addColorStop(0, 'rgba(160,200,255,.28)'); gg.addColorStop(1, 'rgba(160,200,255,0)'); c.fillStyle = gg; c.fillRect(0, 0, W, HH); } } }
  const names = { barista9: ['BARISTA', '#2F6F5E'], colleague9: ['TOM', '#4E7FC0'] }, onScr = {};
  for (const k in heads) { const p = proj(heads[k]); if (p.x > 40 && p.x < W - 40) onScr[k] = heads[k]; }
  if (!tag.startsWith('ui:')) K.bubbles(c, t, sc, onScr, proj, { cleanChunks: true, names, hold: HOLD });
  if (L === 'hook') title(c, t);
  if (CHAP[L] && t < sc.s + 1.4 && !tag.startsWith('ui:')) chapter(c, CHAP[L]);
  UI.captions(c, t); enSub(c, t); if (!TL.speech.some(s_ => s_.who === 'nar' && t >= s_.t && t < s_.t + s_.d + 0.15)) UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  const d = sc.e - t; if (L === 'bday' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('friends1', NF, renderFrame);
