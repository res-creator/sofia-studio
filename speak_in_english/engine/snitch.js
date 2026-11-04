// "Коллега настучал в общий чат" — rubric «Как ответить, когда…» (scene + 4 answers, worst -> best), hard_cut camera: node snitch.js start end out.mp4 | --png=f1,f2
// Open-plan office seen from the front: the heroine (Anna) at her laptop on the left, Ryan (smug colleague) at the next desk on the right,
// the boss in a glass office in the background between them. Shots tagged 'ui:chat' replace the world with the full-screen work chat (#team, English UI).
// hook: Ryan types with a smug smile -> his message pops in #team -> "Seen by Boss" -> the boss's head turns behind the glass.
// o1 «В ЛОБ»: her angry message -> the glass door slides open: "Anna. My office." -> she sinks in her chair.
// o2 «ВЕЖЛИВО»: sorry -> "Ryan is typing..." -> "she was late on Monday" -> a sticky note LATE 09:07 slaps onto her laptop.
// o3 «КАК НОСИТЕЛЬ»: calm facts + a doc link card "Report — with Sarah" -> the boss just nods -> Ryan's smile drops; Bella tip.
// o4 «КОРОЛЕВСКИЙ ОТВЕТ»: "your quarterly report? It was due in March." -> Ryan sweats, his drawer pops open and the Q1 REPORT folder falls out.
// Twist: beat (music off) -> the boss: "Ryan. My office." -> Ryan walks into the glass office, the door shuts. End screen: 1/2/3/4, СОХРАНИ, ПОДПИСАТЬСЯ (cursor).
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas, human } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/snitch/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];

// ---------------- cast
const HER = { ...BASE.her_lift, top: { type: 'blazer', col: '#E86A9A', shirt: '#FFFFFF', tie: '#FFFFFF' }, bottom: { type: 'trousers', col: '#3A3F55' }, shoes: { col: '#2B1A22', acc: null } };
const RYAN = BASE.oliver;
const BOSS = BASE.reggie;
const G = { her: geom(HER), ryan2: geom(RYAN), boss2: geom(BOSS) };
const SEAT = 330, TOP = -480;                       // seated drop; front desk top
const X = { her: -330, ryan2: 360 };
const BFY = -640, BSC = 0.55, BX = -150, DX = 150;   // glass office: back floor line, depth scale, boss seat x, doorway x
const GX0 = -480, GX1 = 440, GY0 = -1880, DOOR0 = 25, DOOR1 = 280;
const LXH = X.her + 20, LXR = X.ryan2 - 20;        // laptops
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- office background (prerendered, softly blurred)
const BX0 = -2400, BY0 = -3200, BW = 4800, BH = 4200, BS = 0.5;
function drawOffice(c) {
  c.fillStyle = '#E9E4DA'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = '#F4F1EA'; c.fillRect(BX0, BY0, BW, 420);                                     // ceiling band
  for (let x = BX0 + 300; x < BX0 + BW; x += 700) { c.fillStyle = '#FFFFFF'; rr(c, x, BY0 + 300, 380, 40, 12); c.fill(); }   // ceiling lights
  // big windows with a city on both sides of the glass office
  for (const [x0, x1] of [[-2300, -560], [520, 2300]]) {
    c.fillStyle = '#D9DEE6'; c.fillRect(x0 - 30, -2500, x1 - x0 + 60, 1900);
    const g = c.createLinearGradient(0, -2470, 0, -640); g.addColorStop(0, '#9FCBEA'); g.addColorStop(1, '#E3F1F8'); c.fillStyle = g; c.fillRect(x0, -2470, x1 - x0, 1830);
    for (let i = 0; i < 12; i++) { const bx = x0 + hash(i * 5 + x0) * (x1 - x0 - 160), bh = 300 + hash(i * 9 + x0) * 700, bw = 120 + hash(i * 3) * 160; c.fillStyle = i % 2 ? '#B9CCDB' : '#A8BDCF'; c.fillRect(bx, -640 - bh, bw, bh);
      c.fillStyle = 'rgba(255,255,255,.45)'; for (let yy = -620 - bh + 30; yy < -660; yy += 60) for (let xx = bx + 16; xx < bx + bw - 20; xx += 40) c.fillRect(xx, yy, 18, 26); }
    c.fillStyle = '#D9DEE6'; for (let x = x0 + 420; x < x1; x += 440) c.fillRect(x, -2470, 22, 1830); }
  // plants + a wall clock (9:41)
  for (const px of [-1900, 1950]) { c.fillStyle = '#5E8F55'; for (let i = 0; i < 7; i++) { c.beginPath(); c.ellipse(px + (i - 3) * 34, -900 - i % 3 * 60, 46, 170, (i - 3) * 0.28, 0, TAU); c.fill(); } c.fillStyle = '#C98B5A'; rr(c, px - 110, -780, 220, 160, 18); c.fill(); }
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(1400, -2780, 120, 0, TAU); c.fill(); c.strokeStyle = '#3A3F4B'; c.lineWidth = 14; c.stroke();
  c.lineCap = 'round'; c.lineWidth = 12; c.beginPath(); c.moveTo(1400, -2780); c.lineTo(1400 + Math.cos(-2.4) * 60, -2780 + Math.sin(-2.4) * 60); c.stroke(); c.lineWidth = 8; c.beginPath(); c.moveTo(1400, -2780); c.lineTo(1400 + Math.cos(-0.5) * 90, -2780 + Math.sin(-0.5) * 90); c.stroke();
  c.fillStyle = '#B9AE9C'; c.fillRect(BX0, -640, BW, 1700);                                     // carpet
  c.fillStyle = 'rgba(0,0,0,.05)'; for (let x = BX0; x < BX0 + BW; x += 240) c.fillRect(x, -640, 6, 1700);
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawOffice);

// ---------------- glass office
function doorK(t, L) { if (L === 'o1') return eIO(P(t, ev('o1', 'door'), ev('o1', 'door') + 0.45)); if (L === 'end') return eIO(P(t, ev('end', 'door'), ev('end', 'door') + 0.45)) * (1 - eIO(P(t, ev('end', 'shut'), ev('end', 'shut') + 0.4))); return 0; }
function officeBack(c) {   // interior: back wall, a shelf, the boss's desk is drawn later (in front of him)
  c.fillStyle = '#D6D0C4'; c.fillRect(GX0, GY0, GX1 - GX0, BFY - GY0); c.fillStyle = '#C4BCAE'; c.fillRect(GX0, BFY - 120, GX1 - GX0, 120);
  c.fillStyle = '#8A6A4A'; c.fillRect(GX0 + 40, -1640, 260, 18); c.fillRect(GX0 + 40, -1480, 260, 18);
  for (let i = 0; i < 6; i++) { c.fillStyle = ['#4E7FB8', '#E0474C', '#F2B33D', '#4CAF6A', '#3A3F4B', '#8E5BD6'][i]; c.fillRect(GX0 + 56 + i * 38, -1640 - 90 - (i % 2) * 14, 28, 90 + (i % 2) * 14); }
  c.fillStyle = '#FFFFFF'; rr(c, 120, -1720, 230, 160, 10); c.fill(); c.strokeStyle = '#4CAF6A'; c.lineWidth = 10; c.beginPath(); c.moveTo(140, -1590); c.lineTo(200, -1630); c.lineTo(250, -1610); c.lineTo(330, -1690); c.stroke();   // chart on the wall
}
function bossDesk(c) { const s = BSC, x = BX, top = BFY - 470 * s;
  c.fillStyle = '#6A4A34'; rr(c, x - 330 * s, top, 660 * s, 470 * s, 10); c.fill(); c.fillStyle = '#7E5A40'; c.fillRect(x - 350 * s, top - 26 * s, 700 * s, 30 * s);
  c.fillStyle = '#2B2F3A'; rr(c, x + 110 * s, top - 300 * s, 260 * s, 190 * s, 8); c.fill(); c.fillRect(x + 225 * s, top - 110 * s, 30 * s, 90 * s); }
function glassFront(c, t, L) { const dk = doorK(t, L), dx = -dk * (DOOR1 - DOOR0 - 20);
  const pane = (x0, x1) => { c.fillStyle = 'rgba(190,225,245,.20)'; c.fillRect(x0, GY0, x1 - x0, BFY - GY0);
    c.save(); c.beginPath(); c.rect(x0, GY0, x1 - x0, BFY - GY0); c.clip(); c.fillStyle = 'rgba(255,255,255,.28)'; for (const o of [0, 160]) { c.beginPath(); c.moveTo(x0 + 40 + o, GY0); c.lineTo(x0 + 120 + o, GY0); c.lineTo(x0 - 200 + o, BFY); c.lineTo(x0 - 280 + o, BFY); c.closePath(); c.fill(); } c.restore();
    c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(x0, -1080, x1 - x0, 46); };   // frosted band
  pane(GX0, DOOR0); pane(DOOR0 + dx, DOOR1 + dx);
  c.fillStyle = '#9AA3B2'; for (const x of [GX0, DOOR0, GX1]) c.fillRect(x - 8, GY0, 16, BFY - GY0); c.fillRect(GX0 - 8, GY0 - 16, GX1 - GX0 + 16, 22); c.fillRect(GX0 - 8, BFY - 10, GX1 - GX0 + 16, 16);
  c.fillStyle = '#C9CED6'; c.fillRect(DOOR0 + dx + 20, -1300, 12, 300);   // door handle
  c.fillStyle = '#2B2F3A'; rr(c, DOOR0 + dx + 60, -1240, 180, 52, 8); c.fill(); fitTxt(c, 'MANAGER', DOOR0 + dx + 150, -1213, 30, '#FFFFFF', 160, 'Unb9'); }

// ---------------- front desks, laptops, props
function laptop(c, x, col, sticker) { paint(c, q => { q.m(x - 200, TOP - 300); q.l(x + 200, TOP - 300); q.l(x + 196, TOP - 14); q.l(x - 196, TOP - 14); q.z(); }, col, { sd: 4, hd: 2, lw: 4 });
  c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.arc(x, TOP - 160, 26, 0, TAU); c.fill(); if (sticker) { c.fillStyle = sticker; c.beginPath(); c.arc(x - 120, TOP - 230, 30, 0, TAU); c.fill(); c.fillStyle = '#FFFFFF'; UI.star(c, x - 120, TOP - 230, 18); }
  c.fillStyle = '#9AA3B2'; rr(c, x - 220, TOP - 22, 440, 18, 6); c.fill(); }
function mug(c, x) { paint(c, q => { q.m(x - 44, TOP - 120); q.l(x + 44, TOP - 120); q.l(x + 38, TOP - 14); q.l(x - 38, TOP - 14); q.z(); }, '#F7F2E8', { sd: 3, hd: 2, lw: 4 }); c.strokeStyle = '#F7F2E8'; c.lineWidth = 12; c.beginPath(); c.arc(x + 50, TOP - 70, 26, -1.2, 1.2); c.stroke(); c.fillStyle = '#E86A9A'; c.fillRect(x - 40, TOP - 90, 80, 20); }
function plant(c, x) { c.fillStyle = '#5E8F55'; for (let i = 0; i < 5; i++) { c.beginPath(); c.ellipse(x + (i - 2) * 22, TOP - 150 - (i % 2) * 30, 22, 80, (i - 2) * 0.35, 0, TAU); c.fill(); } c.fillStyle = '#C98B5A'; rr(c, x - 50, TOP - 90, 100, 80, 12); c.fill(); }
// the sticky note LATE 09:07 (o2): flies in from Ryan's side and slaps onto her laptop lid
function stickyNote(c, x, y, s, rot) { c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(-80 + 6, -80 + 8, 160, 160); c.fillStyle = '#FFE066'; c.fillRect(-80, -80, 160, 160); c.fillStyle = '#F2CC3D'; c.fillRect(-80, -80, 160, 26);
  fitTxt(c, 'LATE', 0, -18, 50, '#C0392B', 140, 'Unb9'); fitTxt(c, '09:07', 0, 42, 42, '#2B2F3A', 140, 'Unb9'); c.restore(); }
function noteState(t, L) { if (L !== 'o2') return null; const a = ev('o2', 'note'), b = ev('o2', 'slap'); if (t < a) return null; const k = clamp((t - a) / (b - a)), e = eIn(k);
  const x1 = LXH + 70, y1 = TOP - 170; return { x: lerp(X.ryan2 - 80, x1, e), y: lerp(TOP - 520, y1, e) - Math.sin(k * Math.PI) * 120, s: lerp(1.5, 1, e) * (k >= 1 ? 1 + 0.1 * Math.exp(-(t - b) * 12) * Math.sin((t - b) * 40) : 1), rot: lerp(0.9, -0.1, e) }; }
// Ryan's drawer + the Q1 folder (o4)
const PEDX = X.ryan2 + 330;
function folderDraw(c, x, y, rot, s = 1) { c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -160 + 8, -110 + 10, 320, 220, 10); c.fill();
  c.fillStyle = '#C0392B'; rr(c, -160, -110, 320, 220, 10); c.fill(); c.fillStyle = '#A93226'; rr(c, -160, -130, 120, 30, 8); c.fill();
  c.fillStyle = '#FFFFFF'; rr(c, -130, -78, 260, 156, 8); c.fill(); fitTxt(c, 'Q1 REPORT', 0, -32, 46, '#2B2F3A', 230, 'Unb9'); c.fillStyle = '#C0392B'; c.fillRect(-110, 0, 220, 5); fitTxt(c, 'DUE: MARCH', 0, 40, 36, '#C0392B', 230, 'Unb9'); c.restore(); }
function pedestal(c, t, L) { const x0 = PEDX - 140, x1 = PEDX + 140, op = L === 'o4' ? eBack(P(t, ev('o4', 'drawer'), ev('o4', 'drawer') + 0.2), 2) : 0;
  for (let i = 0; i < 3; i++) { const y0 = TOP + 40 + i * 140; if (i === 0 && op > 0) continue; c.fillStyle = '#D9D2C4'; rr(c, x0, y0, 280, 120, 8); c.fill(); c.fillStyle = '#9AA3B2'; rr(c, PEDX - 50, y0 + 50, 100, 16, 8); c.fill(); }
  if (op > 0) { const y0 = TOP + 40, d = op * 60; c.fillStyle = '#5A5246'; rr(c, x0, y0, 280, 120, 8); c.fill();
    c.fillStyle = '#C9C1B1'; c.beginPath(); c.moveTo(x0, y0 + 120); c.lineTo(x1, y0 + 120); c.lineTo(x1 + 20 * op, y0 + 120 + d); c.lineTo(x0 - 20 * op, y0 + 120 + d); c.closePath(); c.fill();
    c.fillStyle = '#E3DCCD'; rr(c, x0 - 20 * op, y0 + d, 280 + 40 * op, 120, 8); c.fill(); c.fillStyle = '#9AA3B2'; rr(c, PEDX - 55, y0 + d + 50, 110, 16, 8); c.fill(); } }
function folderState(t, L) { if (L !== 'o4' || t < ev('o4', 'fall')) return null; const a = ev('o4', 'fall'), b = ev('o4', 'land'), k = clamp((t - a) / (b - a)), e = eIn(k);
  return { x: lerp(PEDX, PEDX + 60, k), y: lerp(TOP + 60, -190, e), rot: lerp(-0.5, 0.12, eOut(k)) + (k >= 1 ? 0.03 * Math.exp(-(t - b) * 10) * Math.sin((t - b) * 50) : 0), k }; }
function papers(c, t, L) { if (L !== 'o4') return; const a = ev('o4', 'fall'); const u = t - a; if (u < 0) return;
  for (let i = 0; i < 5; i++) { const k = clamp((u - i * 0.06) / 0.9); if (k <= 0) continue; const x = PEDX - 60 + (hash(i * 7) - 0.5) * 500 * k, y = lerp(TOP + 60, 260 + hash(i) * 60, eIn(k)), r = (hash(i * 3) - 0.5) * 2.5 * k;
    c.save(); c.translate(x, y); c.rotate(r); c.fillStyle = '#FFFFFF'; c.fillRect(-70, -90, 140, 180); c.fillStyle = 'rgba(60,70,90,.35)'; for (let j = 0; j < 6; j++) c.fillRect(-50, -66 + j * 24, 100, 7); c.restore(); } }
function deskFront(c, t, L, tag) {
  c.fillStyle = 'rgba(0,0,0,.22)'; c.fillRect(-1500, -10, 3200, 30);
  paint(c, q => { q.m(-1400, TOP); q.l(1500, TOP); q.l(1500, -10); q.l(-1400, -10); q.z(); }, '#8C9AA8', { sd: 6, hd: 3, lw: 4, inner: k => { k.fillStyle = 'rgba(255,255,255,.08)'; for (let x = -1380; x < 1500; x += 120) k.fillRect(x, TOP + 20, 6, 440); } });
  paint(c, q => { q.m(-1440, TOP - 30); q.l(1540, TOP - 30); q.l(1520, TOP + 12); q.l(-1420, TOP + 12); q.z(); }, '#E9E4DA', { sd: 4, hd: 2, lw: 4 });
  c.fillStyle = '#6A7682'; c.fillRect(-12, TOP - 260, 24, 240); rr(c, -60, TOP - 300, 120, 50, 12); c.fill();   // desk divider post
  pedestal(c, t, L);
  if (tag === 'boss') return;
  mug(c, X.her - 330); plant(c, X.ryan2 + 300);
  laptop(c, LXH, '#C9CED6', '#E86A9A'); laptop(c, LXR, '#3A3F4B', '#4E7FB8');
  K.mark(c, 'laptop', LXH, TOP - 160, 200);
  const n = noteState(t, L); if (n) stickyNote(c, n.x, n.y, n.s, n.rot);
  papers(c, t, L); const f = folderState(t, L); if (f) { folderDraw(c, f.x, f.y, f.rot, lerp(0.8, 1.3, f.k)); K.mark(c, 'folder', f.x, f.y, 170); }
}

// ---------------- characters
const typing = (g, s, t, on) => reach(g, s, s * g.sw * 0.55 + (on ? Math.sin(t * 31 + s) * 9 : 0), g.ySh + SEAT + 330 + (on ? Math.abs(Math.sin(t * 27 + s * 2)) * -14 : 0), { planar: true });
const open = (g, s, k = 1.7, dy = 40) => reach(g, s, s * g.sw * k, g.ySh + SEAT + dy, { planar: true });
const gest = (st, g, t, side, base = 30) => { const u = t * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.25 + Math.sin(u) * 16), g.ySh + SEAT + base - 40 + Math.cos(u) * 16, { planar: true }); };
const seated = (g, t, who, ty) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, legPose: 'sit', drop: SEAT, legs: false, armL: typing(g, -1, t, ty), armR: typing(g, 1, t, ty), items: {} });
function herState(t, L) { const g = G.her, e = k => ev(L, k), sp = id => speaking(id, t, 0.05, 0.1);
  const st = { ...seated(g, t, 'her', false), mood: 'neutral', turn: 0.1, look: 0.2, lookY: 0.35 };
  if (L === 'hook') { st.armL = typing(g, -1, t, t < 2.6); st.armR = typing(g, 1, t, t < 2.6); if (t > hev('face') - 0.1) { st.mood = 'shock'; st.blink = 0; st.lookY = 0; st.turn = 0.3; st.look = 0.9; st.breathe = 0; } if (t > hev('wide')) { st.mood = 'worried'; st.look = 0.4; st.turn = 0.15; } }
  if (L === 'o1') { st.mood = 'angry'; st.lookY = 0.4; st.armL = typing(g, -1, t, t < endOf('o1_h')); st.armR = typing(g, 1, t, t < endOf('o1_h')); st.headY = Math.sin(t * 30) * 3;
    if (t > e('chat')) { st.mood = 'smug'; st.headY = 0; } if (t > e('door')) { st.mood = 'surprised'; st.lookY = -0.3; st.look = 0.2; st.turn = 0.05; }
    if (t > e('sink') - 0.1) { st.mood = 'shock'; st.blink = 0; st.headY = 40 * eOut(P(t, e('sink'), e('sink') + 0.4)); st.lookY = -0.2; st.breathe = 0; } }
  if (L === 'o2') { st.mood = 'worried'; if (sp('o2_h')) { st.lookY = 0.15; st.look = 0.1; st.armL = typing(g, -1, t, true); st.armR = typing(g, 1, t, true); }
    if (t > SP.o2_r.t) { st.mood = 'surprised'; st.lookY = 0; st.turn = 0.3; st.look = 0.9; }
    if (t > e('slap') - 0.05) { st.mood = 'sad'; st.look = 0.2; st.turn = 0.1; st.lookY = 0.6; st.blink = 0; } }
  if (L === 'o3') { st.mood = 'neutral'; if (sp('o3_h')) { st.mood = 'happy'; st.lookY = 0; st.look = 0.1; st.armL = typing(g, -1, t, true); st.armR = typing(g, 1, t, true); }
    if (t > e('chat')) { st.mood = 'happy'; st.lookY = 0; } if (t > e('drop')) { st.mood = 'smug'; st.turn = 0.25; st.look = 0.8; } if (t > SP.o3_tip.t - 0.1) { st.mood = 'happy'; st.turn = 0; st.look = 0; st.blink = 1; } }
  if (L === 'o4') { st.mood = 'happy'; st.squint = true; if (sp('o4_h')) { st.lookY = 0; st.turn = 0.25; st.look = 0.8; st.armL = typing(g, -1, t, true); st.armR = typing(g, 1, t, true); }
    if (t > e('chat')) { st.mood = 'smug'; st.squint = false; st.turn = 0.3; st.look = 0.9; st.lookY = 0; } if (t > e('land')) { st.mood = 'happy'; st.laugh = true; } }
  if (L === 'end') { st.mood = 'smug'; st.turn = 0.3; st.look = 0.9; st.lookY = -0.1; if (t > e('walk')) { st.mood = 'happy'; st.turn = 0.2; st.look = 0.5; st.lookY = -0.3; } if (t > e('smile')) { st.mood = 'happy'; st.blink = 1; st.turn = 0; st.look = 0; st.lookY = 0; } }
  return st; }
function ryanState(t, L) { const g = G.ryan2, e = k => ev(L, k), sp = id => speaking(id, t, 0.05, 0.1);
  const st = { ...seated(g, t, 'ryan2', false), mood: 'smug', turn: -0.25, look: -0.7, lookY: 0.1 };
  if (L === 'hook') { const ty = t < 2.6; st.armL = typing(g, -1, t, ty); st.armR = typing(g, 1, t, ty); if (ty) { st.turn = 0; st.look = 0; st.lookY = 0.4; st.squint = true; } }
  if (L === 'o1') { st.mood = 'smug'; if (t > e('door')) { st.mood = 'happy'; st.laugh = true; st.squint = true; } }
  if (L === 'o2') { if (t > e('typing') - 0.3 && t < endOf('o2_r') + 0.1) { st.armL = typing(g, -1, t, true); st.armR = typing(g, 1, t, true); st.turn = 0; st.look = 0; st.lookY = sp('o2_r') ? 0.1 : 0.4; st.squint = true; } if (t > e('slap')) { st.mood = 'happy'; st.laugh = true; } }
  if (L === 'o3') { if (t > e('drop')) { st.mood = 'annoyed'; st.lookY = 0.4; st.turn = -0.1; st.look = -0.2; } }
  if (L === 'o4') { if (t > e('chat') - 0.05) { st.mood = 'surprised'; st.lookY = 0.4; st.look = 0; st.turn = 0; }
    if (t > e('sweat')) { st.mood = 'worried'; st.lookY = 0; st.look = -0.4; st.turn = -0.2; st.browUp = 1;  }
    if (t > e('drawer')) { st.mood = 'shock'; st.blink = 0; st.turn = 0.3; st.look = 0.9; st.lookY = 0.6; st.breathe = 0; } }
  if (L === 'end') { st.mood = 'worried'; st.turn = -0.15; st.look = -0.3; st.lookY = -0.4; st.browUp = 1; }
  return st; }
// Ryan's walk into the glass office (twist): returns {x, y, s, k} or null while seated
function ryanWalk(t, L) { if (L !== 'end' || t < ev('end', 'walk')) return null; const a = ev('end', 'walk'), b = ev('end', 'shut') - 0.15, k = clamp((t - a) / (b - a)), e = eIO(k);
  return { x: lerp(X.ryan2, DX + 10, e), y: lerp(0, BFY, e), s: lerp(1, BSC, e), k }; }
function ryanWalkState(t, w) { const g = G.ryan2; return { t, talk: 0, mood: 'sad', turn: -0.35, look: -0.6, lookY: 0.5, legPose: w.k < 0.08 ? 'stand' : 'walk', armL: reach(g, -1, -g.sw * 0.9 + Math.sin(t * 8) * 20, g.ySh + 330), armR: reach(g, 1, g.sw * 0.9 - Math.sin(t * 8) * 20, g.ySh + 330), headY: Math.abs(Math.sin(t * 8)) * 6, items: {} }; }
// the boss: seated inside, or standing in the doorway
function bossPlace(t, L) { const e = k => ev(L, k);
  if (L === 'o1' && t > e('door') + 0.05) return { mode: 'door', x: DX };
  if (L === 'end' && t > e('stand')) { const w = t > e('walk') ? eIO(P(t, e('walk'), e('walk') + 0.6)) : 0; return { mode: 'door', x: lerp(lerp(BX + 120, DX, eIO(P(t, e('stand'), e('door') + 0.35))), DX - 150, w), walking: t < e('door') + 0.35 || (w > 0 && w < 1) }; }
  return { mode: 'seat', x: BX }; }
function bossState(t, L, pl) { const g = G.boss2, e = k => ev(L, k), sp = id => speaking(id, t, 0.05, 0.1);
  const st = { t, talk: talk('boss2', t), mood: 'neutral', turn: 0.45, look: 0.8, lookY: 0.2, armL: reach(g, -1, -g.sw * 0.5, g.ySh + SEAT + 330, { planar: true }), armR: reach(g, 1, g.sw * 0.5, g.ySh + SEAT + 330, { planar: true }), items: {} };
  if (pl.mode === 'seat') { st.legPose = 'sit'; st.drop = SEAT; st.legs = false; } else { st.legPose = pl.walking ? 'walk' : 'stand'; st.armL = reach(g, -1, -g.sw * 0.8, g.ySh + 560); st.armR = reach(g, 1, g.sw * 0.8, g.ySh + 560); }
  const watch = (tt, lk = -0.5) => { const k = eIO(P(t, tt, tt + 0.3)); st.turn = lerp(0.45, -0.1, k); st.look = lerp(0.8, lk, k); st.lookY = lerp(0.2, 0, k); if (k > 0.5) st.mood = 'skeptical'; };
  if (L === 'hook') { watch(hev('boss') + 0.1); }
  if (L === 'o1') { watch(ev('o1', 'chat') + 0.4); if (pl.mode === 'door') { st.mood = 'angry'; st.turn = -0.15; st.look = -0.6; st.lookY = 0;  } }
  if (L === 'o2') { if (t > ev('o2', 'chat')) watch(ev('o2', 'chat') + 0.2); if (t > ev('o2', 'slap')) st.mood = 'annoyed'; }
  if (L === 'o3') { if (t > ev('o3', 'seen') - 0.2) { st.turn = 0.45; st.look = 0.8; st.lookY = 0.2; st.mood = 'neutral'; } if (t > ev('o3', 'boss') - 0.1 && t < ev('o3', 'wide') + 0.4) { st.turn = 0.05; st.look = -0.3; st.lookY = 0; st.mood = 'happy';
      const u = t - ev('o3', 'boss'); st.headY = u > 0 && u < 1.4 ? Math.max(0, Math.sin(u * 9)) * 14 : 0; } }
  if (L === 'o4') { if (t > ev('o4', 'seen')) watch(ev('o4', 'seen'), 0.5); if (t > ev('o4', 'land')) { st.mood = 'annoyed'; st.browUp = 0; } }
  if (L === 'end') { st.mood = 'annoyed'; st.turn = 0.1; st.look = 0.5; st.lookY = 0; if (pl.mode === 'door') { st.mood = 'annoyed'; st.turn = 0.15; st.look = 0.4; } }
  return st; }
function sweat(c, hd, t, a) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.fillStyle = '#7FC8F2'; c.strokeStyle = '#2E7DB8'; c.lineWidth = 3;
  for (let i = 0; i < 3; i++) { const u = ((t * 1.4 + i * 0.37) % 1), s = i % 2 ? 1 : -1, x = hd.x + s * hd.hh * (0.85 + 0.1 * i), y = hd.y - hd.hh * 0.5 + u * hd.hh * 0.9, r = hd.hh * 0.09;
    c.beginPath(); c.moveTo(x, y - r * 2.2); c.quadraticCurveTo(x + r * 1.2, y, x, y + r); c.quadraticCurveTo(x - r * 1.2, y, x, y - r * 2.2); c.fill(); c.stroke(); } c.restore(); }

// ---------------- world + which characters each shot draws (clean singles: only the tagged character)
const DRAW = { wide: ['her', 'ryan2', 'boss2'], her: ['her'], ryan: ['ryan2'], ryanw: ['ryan2'], boss: ['boss2'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGR, BX0, BY0, BW, BH);
  officeBack(c); const pl = bossPlace(t, L), w = ryanWalk(t, L);
  if (who.includes('boss2') && pl.mode === 'seat') heads.boss2 = K.put(c, BOSS, bossState(t, L, pl), pl.x, BFY, BSC);
  bossDesk(c);
  if (w && w.k > 0.92 && who.includes('ryan2')) heads.ryan2 = K.put(c, RYAN, ryanWalkState(t, w), w.x, w.y, w.s);
  glassFront(c, t, L);
  if (who.includes('boss2') && pl.mode === 'door') heads.boss2 = K.put(c, BOSS, bossState(t, L, pl), pl.x, BFY, BSC);
  if (w && w.k <= 0.92 && who.includes('ryan2')) heads.ryan2 = K.put(c, RYAN, ryanWalkState(t, w), w.x, w.y, w.s);
  if (!w && who.includes('ryan2')) heads.ryan2 = K.put(c, RYAN, ryanState(t, L), X.ryan2, 0);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), X.her, 0);
  deskFront(c, t, L, tag);
  if (heads.ryan2 && L === 'o4' && !w) sweat(c, heads.ryan2, t, clamp((t - ev('o4', 'sweat')) / 0.3));
  if (heads.ryan2 && L === 'end' && !w) sweat(c, heads.ryan2, t, 1);
  if (!heads.her) heads.her = OFFL; for (const k of ['ryan2', 'boss2']) if (!heads[k]) heads[k] = OFF;
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const HY = k => G[k].headY + SEAT, fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const BHY = BFY + BSC * (G.boss2.headY + SEAT);
const SH = { WIDE: S(20, -900, 0.78, 'wide'),
  HER: S(X.her + 30, fy(HY('her'), 1.12, 900), 1.12, 'her'), HER_CU: S(X.her + 10, fy(HY('her'), 1.45, 880), 1.45, 'her'),
  RYAN: S(X.ryan2 - 30, fy(HY('ryan2'), 1.12, 900), 1.12, 'ryan'), RYAN_W: S(X.ryan2 + 190, fy(HY('ryan2'), 0.8, 640), 0.8, 'ryanw'),
  BOSS: S(BX + 60, fy(BHY, 1.75, 1000), 1.75, 'boss'), BOSS_D: S(DX - 90, fy(BFY + BSC * G.boss2.headY, 1.75, 1000), 1.75, 'boss'), CHAT: U('chat', 1) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < hev('chat')) return SH.WIDE; if (t < hev('face')) return f(SH.CHAT); if (t < hev('boss') - 0.05) return f(SH.HER_CU); if (t < hev('wide') - 0.05) return f(SH.BOSS); return f(SH.WIDE); }
  if (L === 'o1') { if (t < e('chat')) return f(SH.HER); if (t < e('boss')) return f(SH.CHAT); if (t < e('door') - 0.05) return f(SH.BOSS); if (t < e('sink')) return f(SH.BOSS_D); if (t < SP.o1_nar.t + 0.75) return f(SH.HER); return f(SH.WIDE); }
  if (L === 'o2') { if (t < e('chat')) return f(SH.HER); if (t < e('ryan')) return f(SH.CHAT); if (t < e('note') - 0.05) return f(SH.RYAN); if (t < SP.o2_nar.t + 0.9) return f(SH.HER); return f(SH.WIDE); }
  if (L === 'o3') { if (t < e('chat')) return f(SH.HER); if (t < e('boss')) return f(SH.CHAT); if (t < e('wide')) return f(SH.BOSS); if (t < SP.o3_tip.t - 0.1) return f(SH.WIDE); return f(SH.HER); }
  if (L === 'o4') { if (t < e('chat')) return f(SH.HER); if (t < e('ryan')) return f(SH.CHAT); if (t < e('drawer') - 0.05) return f(SH.RYAN); return f(SH.RYAN_W); }
  if (L === 'end') { if (t < e('stand')) return f(SH.BOSS); if (t < e('wide')) return f(SH.BOSS_D); if (t < e('smile') - 0.05) return f(SH.WIDE); return f(SH.HER); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'clank']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- the work chat insert (English UI only; icons drawn with paths)
function backdrop(c) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, '#4A5A8A'); g.addColorStop(1, '#2A3358'); c.fillStyle = g; c.fillRect(0, 0, W, HH); c.fillStyle = 'rgba(255,255,255,.04)'; for (let k = 0; k < 14; k++) c.fillRect(0, k * 160, W, 60);
  if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'chat' }); }
function avatar(c, x, y, r, cfg, g, bg, mood = 'happy') { c.save(); c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = bg; c.fill(); c.clip(); const s = r * 1.55 / (g.hh * 2);
  c.translate(x, y + r * 0.2 - g.headY * s); c.scale(s, s); human(c, cfg, { t: 0, mood, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 0.8, g.ySh + 330), armR: reach(g, 1, g.sw * 0.8, g.ySh + 330), floorShadow: false }); c.restore();
  c.strokeStyle = '#FFFFFF'; c.lineWidth = 3; c.beginPath(); c.arc(x, y, r, 0, TAU); c.stroke(); }
function eyeIcon(c, x, y, s, col) { c.save(); c.translate(x, y); c.scale(s, s); c.strokeStyle = col; c.lineWidth = 4; c.beginPath(); c.moveTo(-22, 0); c.quadraticCurveTo(0, -20, 22, 0); c.quadraticCurveTo(0, 20, -22, 0); c.closePath(); c.stroke(); c.fillStyle = col; c.beginPath(); c.arc(0, 0, 7, 0, TAU); c.fill(); c.restore(); }
function docIcon(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#4E7FB8'; c.beginPath(); c.moveTo(-26, -34); c.lineTo(12, -34); c.lineTo(26, -20); c.lineTo(26, 34); c.lineTo(-26, 34); c.closePath(); c.fill();
  c.fillStyle = '#9FC0E8'; c.beginPath(); c.moveTo(12, -34); c.lineTo(12, -20); c.lineTo(26, -20); c.closePath(); c.fill(); c.fillStyle = '#FFFFFF'; for (let i = 0; i < 4; i++) c.fillRect(-16, -12 + i * 11, i === 3 ? 20 : 32, 5); c.restore(); }
function wrapLines(c, s, maxW) { const out = []; let cur = ''; for (const w of s.split(' ')) { const tr = cur ? cur + ' ' + w : w; if (c.measureText(tr).width > maxW && cur) { out.push(cur); cur = w; } else cur = tr; } if (cur) out.push(cur); return out; }
const WX = 50, WY = 345, WW = 980, WH = 1075;
const PEOPLE = { ryan2: ['Ryan', RYAN, G.ryan2, '#9CB4D8'], her: ['Anna', HER, G.her, '#F7C9DA'] };
function msg(c, y, who, time, text, k, hi, doc) { if (k <= 0) return y; const [name, cfg, g, bg] = PEOPLE[who]; c.font = '48px Nun8'; const lines = wrapLines(c, text, WW - 230), h = 92 + lines.length * 60 + (doc ? 140 : 0);
  c.save(); c.globalAlpha = clamp(k); c.translate(0, (1 - clamp(k)) * 40);
  if (hi > 0) { c.fillStyle = `rgba(255,224,102,${0.35 * hi})`; c.fillRect(WX, y - 10, WW, h + 10); }
  avatar(c, WX + 78, y + 50, 50, cfg, g, bg);
  c.font = '44px Nun9'; c.fillStyle = '#1E2030'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(name, WX + 150, y + 26); const nw = c.measureText(name).width;
  c.font = '30px Nun8'; c.fillStyle = '#8A90A2'; c.fillText(time, WX + 168 + nw, y + 28);
  c.font = '48px Nun8'; c.fillStyle = '#2B2F3A'; lines.forEach((l, i) => c.fillText(l, WX + 150, y + 90 + i * 60));
  if (doc) { const dy = y + 80 + lines.length * 60, dk = eBack(clamp(doc), 1.6); c.save(); c.translate(WX + 150, dy + 60); c.scale(dk, dk); c.fillStyle = '#F4F6FA'; c.strokeStyle = '#C9D0DA'; c.lineWidth = 3; rr(c, 0, -56, 720, 116, 18); c.fill(); c.stroke();
    docIcon(c, 56, 0, 1.2); c.font = '42px Nun9'; c.fillStyle = '#1E2030'; c.textAlign = 'left'; c.fillText('Report — with Sarah', 110, -18); c.font = '30px Nun8'; c.fillStyle = '#4CAF6A'; c.fillText('In review  ·  approval pending', 110, 28); c.restore(); }
  c.restore(); return y + h + 26; }
function seenRow(c, y, k) { if (k <= 0) return y; c.save(); c.globalAlpha = clamp(k); const x = WX + WW - 40; c.translate(x, y + 20); c.scale(eBack(clamp(k), 2), eBack(clamp(k), 2)); c.translate(-x, -(y + 20));
  c.font = '40px Nun9'; c.textAlign = 'right'; c.textBaseline = 'middle'; c.fillStyle = '#E0474C'; c.fillText('Seen by Boss', x - 70, y + 26); const tw = c.measureText('Seen by Boss').width; eyeIcon(c, x - 70 - tw - 44, y + 26, 1.3, '#E0474C');
  avatar(c, x - 22, y + 26, 32, BOSS, G.boss2, '#D6D0C4', 'skeptical'); c.restore(); return y + 76; }
function typingRow(c, y, t, k) { if (k <= 0) return; c.save(); c.globalAlpha = clamp(k); for (let i = 0; i < 3; i++) { const a = 0.35 + 0.65 * Math.max(0, Math.sin(t * 9 - i * 0.9)); c.fillStyle = `rgba(90,100,130,${a})`; c.beginPath(); c.arc(WX + 50 + i * 24, y + 20 - 5 * Math.max(0, Math.sin(t * 9 - i * 0.9)), 8, 0, TAU); c.fill(); }
  c.font = '40px Nun9'; c.fillStyle = '#5A6482'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText('Ryan is typing...', WX + 150, y + 20); c.restore(); }
const RYMSG = 'Friendly reminder: Anna, the report was due yesterday!';
const HERMSG = { o1: 'Shut up, snitch!', o2: "Sorry, I'll send it today.", o3: "Thanks for the reminder — it's with Sarah for approval, as agreed.", o4: "Thank you, Ryan! Since you're so on top of deadlines, could you share your quarterly report? It was due in March." };
function chatView(c, t, L) { backdrop(c); const pop = a => eOut(P(t, a, a + 0.25));
  c.fillStyle = 'rgba(0,0,0,.3)'; rr(c, WX + 10, WY + 16, WW, WH, 30); c.fill(); c.fillStyle = '#FFFFFF'; rr(c, WX, WY, WW, WH, 30); c.fill();
  // title bar + channel header
  c.fillStyle = '#3F2A56'; rr(c, WX, WY, WW, 120, [30, 30, 0, 0]); c.fill();
  for (const [i, col] of [['#FF5F57'], ['#FEBC2E'], ['#28C840']].entries()) { c.fillStyle = col[0]; c.beginPath(); c.arc(WX + 40 + i * 34, WY + 34, 11, 0, TAU); c.fill(); }
  fitTxt(c, '# team', WX + 40, WY + 84, 44, '#FFFFFF', 300, 'Unb9', 'left');
  c.fillStyle = 'rgba(255,255,255,.75)'; for (let i = 0; i < 2; i++) { const px = WX + WW - 260 + i * 28; c.beginPath(); c.arc(px, WY + 72, 11, 0, TAU); c.fill(); c.beginPath(); c.arc(px, WY + 100, 18, Math.PI, 0); c.fill(); }
  fitTxt(c, '5 members', WX + WW - 40, WY + 84, 32, 'rgba(255,255,255,.85)', 170, 'Nun9', 'right');
  c.fillStyle = '#E3E6EE'; c.fillRect(WX, WY + 120, WW, 2);
  // day divider
  fitTxt(c, 'Today', WX + WW / 2, WY + 160, 24, '#8A90A2', 200, 'Nun9'); c.fillStyle = '#E3E6EE'; c.fillRect(WX + 40, WY + 160, WW / 2 - 100, 2); c.fillRect(WX + WW / 2 + 60, WY + 160, WW / 2 - 100, 2);
  let y = WY + 200;
  const ryK = L === 'hook' ? eOut(P(t, hev('chat') - 0.02, hev('chat') + 0.25)) : 1;
  y = msg(c, y, 'ryan2', '9:41 AM', RYMSG, ryK, L === 'hook' ? 1 - P(t, hev('chat') + 0.8, hev('chat') + 1.4) : 0);
  if (L === 'hook') { seenRow(c, y, eOut(P(t, hev('seen'), hev('seen') + 0.25))); }
  else if (HERMSG[L]) { const a = ev(L, 'chat'), mk = pop(a);
    if (mk < 1) y = seenRow(c, y, 1 - mk); else y += 0;
    y = msg(c, y, 'her', '9:43 AM', HERMSG[L], mk, mk * (1 - P(t, a + 0.8, a + 1.3)), L === 'o3' ? P(t, ev('o3', 'doc'), ev('o3', 'doc') + 0.3) : 0);
    if (L === 'o2') typingRow(c, y, t, pop(ev('o2', 'typing'))); else seenRow(c, y, pop(ev(L, 'seen'))); }
  // input bar
  const iy = WY + WH - 110; c.fillStyle = '#F4F6FA'; c.strokeStyle = '#C9D0DA'; c.lineWidth = 3; rr(c, WX + 30, iy, WW - 60, 80, 20); c.fill(); c.stroke();
  fitTxt(c, 'Message #team', WX + 60, iy + 40, 30, '#9AA0B0', 500, 'Nun8', 'left');
  c.fillStyle = '#4CAF6A'; rr(c, WX + WW - 110, iy + 12, 56, 56, 14); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(WX + WW - 96, iy + 26); c.lineTo(WX + WW - 64, iy + 40); c.lineTo(WX + WW - 96, iy + 54); c.lineTo(WX + WW - 90, iy + 40); c.closePath(); c.fill(); }
// Russian translation of Ryan's chat line (hook), under the window
function ruLine(c, t) { const sp = SP.hook_r, a = P(t, hev('chat') - 0.02, hev('chat') + 0.15), end = Math.min(sp.t + sp.d + 0.3, SP.hook.t - 0.12), b = 1 - P(t, end - 0.12, end), k = Math.min(a, b); if (k <= 0) return;
  c.save(); c.globalAlpha = k; UI.textFit(c, 'Nun9', 48, sp.ru, 960); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, sp.ru, 540, 1470, C.pinkL, C.oliveD, 10); c.restore();
  if (global.__QA) global.__QA.ui(c, 'captions', { x: 60, y: 1430, w: 960, h: 80, k, id: 'hook_r_ru' }); }

// ---------------- overlays: title, option plates
function title(c, t) { const a = 1 - P(t, hev('title_out') - 0.3, hev('title_out') - 0.02); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 360); c.rotate(-0.04); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -102);
  UI.textFit(c, 'Unb9', 120, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 6, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 64, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 112); c.restore();
  if (global.__QA) global.__QA.ui(c, 'card', { x: 50, y: 195, w: 980, h: 330, k: a, id: 'title' }); }
const PLATES = { o1: ['1', 'В ЛОБ', '#E0474C'], o2: ['2', 'ВЕЖЛИВО', '#F2B33D'], o3: ['3', 'КАК НОСИТЕЛЬ', '#4CAF6A'], o4: ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', '#8E5BD6'] };
function optionPlate(c, t, L) { const o = PLATES[L]; if (!o) return; const s = SC[L].s, nar = SP[L + '_nar'], end = nar ? nar.t : ev('o4', 'ryan'), k = eBack(P(t, s, s + 0.3), 2.0), al = 1 - P(t, end - 0.15, end - 0.01); if (k <= 0 || al <= 0) return;
  c.save(); c.globalAlpha = al; c.translate(540, 262); c.rotate(-0.03); c.scale(k, k); const fs = UI.textFit(c, 'Unb9', 58, o[1], 640); const tw = c.measureText(o[1]).width, w = tw + 200, x0 = -w / 2;
  c.fillStyle = 'rgba(0,0,0,.3)'; rr(c, x0 + 8, -55 + 10, w, 110, 55); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, x0, -55, w, 110, 55); c.fill(); c.stroke();
  c.fillStyle = o[2]; c.beginPath(); c.arc(x0 + 58, 0, 42, 0, TAU); c.fill(); fitTxt(c, o[0], x0 + 58, 3, 58, C.white, 60); fitTxt(c, o[1], x0 + 118, 3, fs, C.oliveD, tw + 4, 'Unb9', 'left');
  c.restore(); if (global.__QA) global.__QA.ui(c, 'card', { x: 540 - w / 2, y: 205, w, h: 115, k, id: 'option' }); }

// ---------------- end screen: question, 1 / 2 / 3 / 4, СОХРАНИ, ПОДПИСАТЬСЯ clicked by the cursor (every button inside x 60..940)
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, wt = (w, d) => K.wordT('outro', w) ?? (sp.t + d);
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // heroine + Ryan with his Q1 folder (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34, 2nd character at local x 640)
  { const g = G.her, gr = G.ryan2, hy = lerp(2350, 1985, eBack(P(u, 0.3, 0.8), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
    K.put(c, RYAN, { t, mood: 'worried', browUp: 1, turn: -0.2, look: -0.4, armL: reach(gr, -1, -gr.sw * 0.4, gr.ySh + 300), armR: reach(gr, 1, gr.sw * 0.4, gr.ySh + 300), items: {} }, 640, 0);
    c.save(); c.translate(640, gr.ySh + 360); folderDraw(c, 0, 0, 0.05, 1.05); c.restore();
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(t * 8) * 30, { planar: true }), armR: reach(g, 1, g.sw * 0.8, g.ySh + 330), items: {} }, 0, 0); c.restore(); }
  const q = eBack(P(u, 0.15, 0.5), 2.2);
  if (q > 0) { c.save(); c.translate(500, 300); c.scale(q, q); UI.font(c, 'Unb9', 70); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, 'А ТЫ БЫ', 0, -48, C.oliveD, C.white, 14); UI.textFit(c, 'Unb9', 70, 'ОТВЕТИЛА КАК?', 840); UI.strokeText(c, 'ОТВЕТИЛА КАК?', 0, 44, C.pink, C.white, 14); c.restore(); }
  const rows = [['1', 'В ЛОБ', 'Shut up, snitch!', '#E0474C', 'один'], ['2', 'ВЕЖЛИВО', "Sorry, I'll send it today.", '#F2B33D', 'два'], ['3', 'КАК НОСИТЕЛЬ', "It's with Sarah, as agreed.", '#4CAF6A', 'три'], ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', 'Could you share your report?', '#8E5BD6', 'четыре']];
  rows.forEach(([n, ru, en, col, w], i) => { const a = wt(w, 1.0 + i * 0.3) - 0.1, k = eBack(P(t, a, a + 0.28), 2.0); if (k <= 0) return; const y = 530 + i * 168;
    c.save(); c.translate(500, y); c.scale(k, k); c.fillStyle = 'rgba(0,0,0,.16)'; rr(c, -430 + 8, -70 + 12, 860, 140, 38); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -430, -70, 860, 140, 38); c.fill(); c.stroke();
    c.fillStyle = col; c.beginPath(); c.arc(-350, 0, 52, 0, TAU); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 5; c.stroke(); fitTxt(c, n, -350, 4, 72, C.white, 70);
    fitTxt(c, ru, -270, -24, 42, C.oliveD, 660, 'Unb9', 'left'); fitTxt(c, en, -270, 30, 34, C.pinkD, 660, 'Nun9', 'left'); c.restore();
    if (global.__QA) global.__QA.ui(c, 'button', { x: 70, y: y - 70, w: 860, h: 140, k, id: 'row' + n }); });
  const bk = eBack(P(t, wt('пиши', 2.4) - 0.2, wt('пиши', 2.4) + 0.15), 2.2), by = 1235;
  if (bk > 0) { c.save(); c.translate(500, by); c.scale(bk, bk); c.fillStyle = C.gold; rr(c, -430, -55, 400, 110, 55); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke();
    c.fillStyle = C.oliveD; c.beginPath(); c.moveTo(-385, -30); c.lineTo(-347, -30); c.lineTo(-347, 30); c.lineTo(-366, 14); c.lineTo(-385, 30); c.closePath(); c.fill();   // bookmark icon
    fitTxt(c, 'СОХРАНИ', -205, 4, 40, C.oliveD, 260);
    const subT = endOf('outro') - 0.05, click = P(t, subT + 0.55, subT + 0.7), pressed = t > subT + 0.65, ss = 1 - 0.08 * Math.sin(click * Math.PI);
    c.save(); c.translate(225, 0); c.scale(ss, ss); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -205, -55, 410, 110, 55); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke(); fitTxt(c, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4, 40, C.white, 350); c.restore(); c.restore();
    if (global.__QA) global.__QA.ui(c, 'button', { x: 70, y: by - 55, w: 860, h: 110, k: bk, id: 'cta' });
    const mv = eIO(P(t, subT, subT + 0.55)); UI.tapCursor(c, lerp(1000, 760, mv), lerp(by + 330, by + 10, mv), 1, P(t, subT + 0.6, subT + 1.1)); }
  Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') return endScreen(c, t);
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads = { her: OFFL, ryan2: OFF, boss2: OFF }, proj = p => p;
  if (tag === 'ui:chat') { c.save(); c.translate(sh.x, sh.y); chatView(c, t, L); c.restore(); Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26); }
  const names = { ryan2: ['RYAN', '#2F3E5C'], boss2: ['BOSS', '#4A4F5C'] };
  if (tag !== 'ui:chat' && L !== 'hook') K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names, hold: { o1_h: -0.2, o1_b: -0.1, o2_h: -0.2, o2_r: -0.2, o3_h: -0.2, o3_b: -0.2, o4_h: -0.2, o4_r: -0.15, end_b: -0.2 } });
  if (L === 'hook') { title(c, t); if (tag === 'ui:chat') ruLine(c, t); }
  optionPlate(c, t, L);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  // the end screen wipes in from the twist
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('snitch', NF, renderFrame);
