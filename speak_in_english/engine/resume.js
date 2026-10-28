// "When you lie on your resume" episode renderer (hard_cut camera): node resume.js start end out.mp4 | --png=f1,f2
// A modern interview room seen from the side: she (left) and Mr Grant (right) sit at one long desk; laptop, resume folder,
// paper + pencil, the job posting on the desk. Shots tagged 'ui:<view>' replace the world: the resume close-up (cover), the
// spreadsheet, the hand-drawn chart, the group chat, the lemonade-stand flashback, the CEO line, the job posting and its last edit.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, mix, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/resume/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SC, SP, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf, EV, put } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2, ev = k => EV(k);
const hev = k => SC.hook.ev[k];

// ---------------- cast: her in an interview blazer; Mr Grant (the boss from WRONG CHAT); the 12-year-old her + a customer (flashback)
const HER = { ...BASE.her_lift, top: { type: 'blazer', col: '#EE5E9A', shirt: '#FFFFFF', tie: '#FFFFFF' }, bottom: { type: 'trousers', col: '#2B2F3A' } };
const GRANT = { ...BASE.greg, top: { type: 'blazer', col: '#2B3A67', tie: '#F2C14E' }, bottom: { type: 'trousers', col: '#2B3A67' }, shoes: { col: '#1A1A1A', acc: null } };
const KID = { ...BASE.her_lift, h: 1150, headScale: 1.32, eyeSize: 0.22, earrings: null, top: { type: 'kidtee', col: '#F7B6CF', col2: '#FFFFFF' }, bottom: { type: 'shorts', col: '#7E9CC4' } };
const BUYER = { ...BASE.tom };
const DH = 330, DG = 400;                                   // seated: upper body dropped behind the desk
const G = { her: geom(HER, DH), herUp: geom(HER), grant: geom(GRANT, DG), kid: geom(KID), buyer: geom(BUYER) };
const HERX = -330, GX = 350, DESK = { x0: -640, x1: 640, top: -520 };
const HY = { her: G.her.headY, grant: G.grant.headY, herUp: G.herUp.headY };
function txt(c, s, x, y, size, col, font = 'Unb9', align = 'center') { c.font = `${size}px ${font}`; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- props held in hand (drawn upright at the wrist)
const sheet = (ctx, w, h, col, deco) => { ctx.save(); ctx.rotate(-0.08); paint(ctx, q => { q.m(-w / 2, -h); q.l(w / 2, -h); q.l(w / 2, 0); q.l(-w / 2, 0); q.z(); }, col, { sd: 3, hd: 2, lw: 3 }); if (deco) deco(ctx, w, h); ctx.restore(); };
const fakeLines = (ctx, w, h, y0, n, col = '#C9CED6') => { ctx.fillStyle = col; for (let i = 0; i < n; i++) ctx.fillRect(-w / 2 + 16, y0 + i * 20, (w - 32) * (0.6 + 0.4 * hash(i * 3.3)), 7); };
const folderItem = (open = true) => ctx => { ctx.save(); ctx.rotate(-0.08); if (open) { paint(ctx, q => { q.m(-96, -230); q.l(96, -230); q.l(96, 0); q.l(-96, 0); q.z(); }, '#FFFDF8', { sd: 3, hd: 2, lw: 3 }); ctx.fillStyle = '#EE5E9A'; ctx.fillRect(-96, -230, 192, 34); fakeLines(ctx, 192, 230, -180, 8); }
  else { paint(ctx, q => { q.m(-100, -236); q.l(100, -236); q.l(100, 0); q.l(-100, 0); q.z(); }, '#E9B23B', { sd: 4, hd: 2, lw: 3 }); txt(ctx, 'CV', 0, -120, 40, '#7A5A2A'); } ctx.restore(); };
const chartItem = ctx => sheet(ctx, 170, 200, '#FFFDF8', (c) => { c.strokeStyle = '#4A4F5C'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(-60, -170); c.lineTo(-62, -30); c.lineTo(70, -28); c.stroke();
  c.lineWidth = 5; for (const [x, h] of [[-40, 50], [-5, 90], [30, 60]]) { c.beginPath(); c.moveTo(x, -30); c.lineTo(x + 2, -30 - h); c.lineTo(x + 22, -32 - h); c.lineTo(x + 20, -30); c.stroke(); } c.strokeStyle = '#E0474C'; c.beginPath(); c.moveTo(-50, -60); c.lineTo(0, -140); c.lineTo(20, -110); c.lineTo(60, -170); c.stroke(); });
const pencilItem = ctx => { ctx.save(); ctx.rotate(0.5); ctx.fillStyle = '#F2C14E'; ctx.fillRect(-7, -110, 14, 90); ctx.fillStyle = '#F7D9B0'; ctx.beginPath(); ctx.moveTo(-7, -20); ctx.lineTo(7, -20); ctx.lineTo(0, 0); ctx.fill(); ctx.fillStyle = '#EE5E9A'; ctx.fillRect(-7, -124, 14, 16); ctx.restore(); };
const phoneItem = ctx => { ctx.save(); ctx.rotate(-0.1); ctx.fillStyle = '#2B2F3A'; rr(ctx, -34, -116, 68, 120, 12); ctx.fill(); ctx.fillStyle = '#9FD3FF'; rr(ctx, -27, -108, 54, 104, 8); ctx.fill(); ctx.restore(); };
const postingItem = ctx => sheet(ctx, 180, 230, '#FFF6D6', (c, w, h) => { c.fillStyle = '#2B3A67'; c.fillRect(-w / 2, -h, w, 30); fakeLines(c, w, h, -180, 5, '#D9CFA8'); c.save(); c.translate(10, -50); c.rotate(-0.2); c.strokeStyle = '#E0474C'; c.lineWidth = 4; rr(c, -60, -20, 120, 40, 8); c.stroke(); txt(c, 'UNPAID', 0, 1, 22, '#E0474C'); c.restore(); });
const bagItem = ctx => { ctx.save(); ctx.strokeStyle = '#7A3A4A'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(0, 40, 50, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); paint(ctx, q => { q.m(-90, 30); q.l(90, 30); q.l(100, 170); q.l(-100, 170); q.z(); }, '#A0475A', { sd: 6, hd: 3, lw: 3 }); ctx.fillStyle = '#F2C14E'; ctx.fillRect(-14, 60, 28, 16); ctx.restore(); };
const cupItem = ctx => { ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.moveTo(-28, -90); ctx.lineTo(28, -90); ctx.lineTo(22, 0); ctx.lineTo(-22, 0); ctx.fill(); ctx.fillStyle = '#F7E36A'; ctx.beginPath(); ctx.moveTo(-26, -70); ctx.lineTo(26, -70); ctx.lineTo(22, -4); ctx.lineTo(-22, -4); ctx.fill(); };
function sweat(c, hd, k) { if (k <= 0) return; const x = hd.x + hd.hh * 0.75, y = hd.y - hd.hh * 0.55 + (1 - k) * -20; c.save(); c.globalAlpha = k; c.fillStyle = '#8FD3F7'; c.strokeStyle = '#3C8FE0'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - 34); c.quadraticCurveTo(x + 22, y, x, y + 14); c.quadraticCurveTo(x - 22, y, x, y - 34); c.fill(); c.stroke(); c.restore(); }

// ---------------- interview room (prerendered, softly blurred)
const BX0 = -1900, BY0 = -3300, BW = 3800, BH = 4300, BS = 0.5;
function drawRoom(c) {
  c.fillStyle = '#E8ECEF'; c.fillRect(BX0, BY0, BW, BH); c.fillStyle = 'rgba(255,255,255,.4)'; for (let x = BX0; x < BX0 + BW; x += 300) c.fillRect(x, BY0, 140, 3300);
  // glass wall with the city behind her
  c.fillStyle = '#FFFFFF'; c.fillRect(-1500, -2600, 1000, 1700); const sg = c.createLinearGradient(0, -2580, 0, -920); sg.addColorStop(0, '#8FC3EA'); sg.addColorStop(1, '#DCEFF8'); c.fillStyle = sg; c.fillRect(-1480, -2580, 960, 1660);
  c.fillStyle = '#A9BED2'; for (let i = 0; i < 9; i++) { const h = 260 + hash(i * 7) * 520; c.fillRect(-1470 + i * 106, -920 - h, 90, h); } c.fillStyle = '#FFFFFF'; c.fillRect(-1010, -2580, 14, 1660);
  // company logo wall + plant
  c.fillStyle = '#2B3A67'; rr(c, -260, -2350, 820, 260, 26); c.fill(); txt(c, 'MEGACORP', 150, -2250, 92, '#F2C14E'); txt(c, 'WE VALUE HONESTY', 150, -2150, 34, '#FFFDF8', 'Nun9');
  c.fillStyle = '#FFFDF8'; rr(c, 760, -2300, 540, 380, 18); c.fill(); c.strokeStyle = '#9AA3B2'; c.lineWidth = 8; rr(c, 760, -2300, 540, 380, 18); c.stroke(); txt(c, 'WE ARE HIRING!', 1030, -2230, 40, '#E0474C'); fakeLines(c, 0, 0, 0, 0);
  c.fillStyle = '#C9CED6'; for (let i = 0; i < 5; i++) c.fillRect(800, -2160 + i * 44, 460 * (0.6 + 0.4 * hash(i * 2.7)), 14);
  for (const px of [1500]) { c.fillStyle = '#C96A3A'; c.fillRect(px - 90, -300, 180, 300); c.fillStyle = '#3C8A4A'; for (let i = 0; i < 9; i++) { c.beginPath(); c.ellipse(px + Math.cos(i * 2.4) * 90, -470 + Math.sin(i * 2.4) * 130, 80, 36, i, 0, TAU); c.fill(); } }
  // wall clock
  c.fillStyle = '#FFFDF8'; c.beginPath(); c.arc(-180, -1750, 90, 0, TAU); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 10; c.stroke(); c.lineWidth = 8; c.beginPath(); c.moveTo(-180, -1750); c.lineTo(-180, -1815); c.moveTo(-180, -1750); c.lineTo(-135, -1730); c.stroke();
  const fg = c.createLinearGradient(0, 0, 0, 900); fg.addColorStop(0, '#9C928A'); fg.addColorStop(1, '#7C746E'); c.fillStyle = fg; c.fillRect(BX0, 0, BW, BY0 + BH);
  c.fillStyle = '#C7CDD4'; c.fillRect(BX0, -90, BW, 90); c.fillStyle = '#B4BCC6'; c.fillRect(BX0, -90, BW, 10);
}
const BGB = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); { const c = BGB.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); c.filter = 'blur(1.4px)'; drawRoom(c); }
function chair(c, x, dir) { // dir = side of the backrest (-1 left, +1 right)
  c.fillStyle = '#2B2F3A'; c.fillRect(x - 12, -420, 24, 330); c.fillRect(x - 130, -20, 260, 20);
  paint(c, q => { q.m(x + dir * 150 - 30, -1080); q.l(x + dir * 150 + 30, -1080); q.l(x + dir * 150 + 34, -440); q.l(x + dir * 150 - 34, -440); q.z(); }, '#3A3F4A', { sd: 4, hd: 2, lw: 3 });
  paint(c, q => { q.m(x - 170, -470); q.l(x + 170, -470); q.l(x + 170, -410); q.l(x - 170, -410); q.z(); }, '#3A3F4A', { sd: 4, hd: 2, lw: 3 }); }
function desk(c, t, L) {
  paint(c, q => { q.m(DESK.x0, DESK.top); q.l(DESK.x1, DESK.top); q.l(DESK.x1, DESK.top + 34); q.l(DESK.x0, DESK.top + 34); q.z(); }, '#F4F1EC', { sd: 4, hd: 2, lw: 3 });
  paint(c, q => { q.m(DESK.x0 + 30, DESK.top + 34); q.l(DESK.x1 - 30, DESK.top + 34); q.l(DESK.x1 - 30, -10); q.l(DESK.x0 + 30, -10); q.z(); }, '#B98A62', { sd: 10, hd: 4, lw: 4 });
  c.fillStyle = 'rgba(0,0,0,.07)'; for (let x = DESK.x0 + 80; x < DESK.x1 - 40; x += 160) c.fillRect(x, DESK.top + 34, 6, 476);
}
// things on the desk top (drawn after the desk)
function deskProps(c, t, L) { const y = DESK.top;
  // laptop on his side (open in A2)
  const lop = L === 'A2' ? eOut(P(t, ev('laptop'), ev('laptop') + 0.35)) : 0;
  c.fillStyle = '#9AA3B2'; rr(c, 120, y - 16, 260, 16, 4); c.fill();
  c.save(); c.translate(140, y - 12); c.rotate(-lerp(0.02, 1.25, lop)); c.fillStyle = '#7A8290'; rr(c, 0, -14, 250, 14, 4); c.fill(); c.restore();
  if (lop > 0.5) { c.fillStyle = 'rgba(160,220,180,.35)'; c.beginPath(); c.ellipse(180, y - 140, 60, 120, 0.3, 0, TAU); c.fill(); }
  // her blank paper + pencil (A2, before she draws)
  if (L === 'hook' || L === 'A1' || (L === 'A2' && t < ev('draw'))) { c.fillStyle = '#FFFDF8'; c.fillRect(-300, y - 8, 160, 8); c.fillStyle = '#F2C14E'; c.fillRect(-120, y - 12, 90, 10); }
  if (L === 'A2' && t > ev('draw') && t < SP.a2_her2.t - 0.1) { c.fillStyle = '#FFFDF8'; c.fillRect(-150, y - 8, 160, 8); }
  // the job posting (yellow sheet) in front of her
  const post = !((L === 'C2' && t > ev('take') + 0.25 && t < ev('rise') + 0.1)); if (post) { const px = L === 'C2' && t > ev('rise') ? -40 : -280; c.fillStyle = '#FFF6D6'; c.fillRect(px - 80, y - 10, 170, 10); c.fillStyle = '#2B3A67'; c.fillRect(px - 80, y - 10, 30, 10); }
  // resume folder when it is on the desk
  const folderDown = (L === 'B2' && t > ev('close') + 0.25) || (L === 'C1' && t > ev('aside') && t < ev('turn')) || (L === 'C2');
  if (folderDown) { const fx = L === 'C1' || L === 'C2' ? 470 : 230; c.fillStyle = '#E9B23B'; c.fillRect(fx - 100, y - 14, 200, 14); }
  if (L === 'C1' && t > ev('turn')) { const k = eIO(P(t, ev('turn'), ev('turn') + 0.6)); const fx = lerp(330, 30, k); c.fillStyle = '#FFFDF8'; c.fillRect(fx - 100, y - 10, 200, 10); c.fillStyle = '#EE5E9A'; c.fillRect(fx - 100, y - 10, 34, 10); }
  // coffee cup
  c.fillStyle = '#FFFDF8'; rr(c, 520, y - 90, 70, 90, 10); c.fill(); c.fillStyle = '#2B3A67'; c.fillRect(520, y - 60, 70, 18);
}

// ---------------- characters
function gest(st, g, who, t, side, base) { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.4 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } }
function grantState(t, L) { const g = G.grant, st = { t, talk: talk('grant', t), mood: 'skeptical', turn: -0.35, look: -0.8, legPose: 'sit', drop: DG, legs: false,
    armL: reach(g, -1, -g.sw * 0.9, g.ySh + 420), armR: reach(g, 1, -g.sw * 0.1, g.ySh + 440) };
  const read = (up = 1) => { st.armL = reach(g, -1, -g.sw * 1.3, g.ySh + lerp(400, 170, up)); st.armR = reach(g, 1, -g.sw * 0.2, g.ySh + lerp(430, 260, up)); st.items = { L: folderItem(true) }; st.lookY = lerp(0.2, 0.35, up); };
  const cross = () => { st.armL = reach(g, -1, g.sw * 0.55, g.ySh + 230); st.armR = reach(g, 1, -g.sw * 0.55, g.ySh + 250); };
  if (L === 'hook') { read(1); st.mood = 'neutral'; if (t > hev('brows') - 0.05) { st.mood = 'surprised'; st.browUp = 1; st.lookY = 0.1; } if (t > SP.hook_her.t + 0.4) { st.mood = 'happy'; st.browUp = 0; } }
  if (L === 'A1') { read(1); st.mood = 'neutral'; gest(st, g, 'grant', t, 1, 250); if (t > SP.a1_x3.t - 0.1) st.mood = 'skeptical'; if (t > ev('lower') - 0.05) { const k = eIO(P(t, ev('lower'), ev('lower') + 1.1)); read(1 - k); st.mood = 'bored'; st.lookY = lerp(0.3, 0, k); st.look = -0.9; } }
  if (L === 'A2') { const lp = ev('laptop'); if (t > lp - 0.1 && t < endOf('a2_x') + 0.2) { st.armL = reach(g, -1, -g.sw * 0.6, g.ySh + 330); st.armR = reach(g, 1, -g.sw * 0.1, g.ySh + 380); st.lookY = 0.4; st.look = -0.4; st.mood = 'neutral'; }
    if (t > ev('draw')) { st.mood = 'surprised'; st.lookY = 0.3; } if (t > SP.a2_x2.t - 0.15) { st.items = { L: chartItem }; st.armL = reach(g, -1, -g.sw * 1.2, g.ySh + 190); st.mood = 'bored'; st.lookY = 0.3; st.look = -0.5; }
    if (t > SP.a2_her3.t) { st.mood = 'skeptical'; st.lookY = 0; st.look = -0.8; } if (t > ev('chart')) { st.mood = 'skeptical'; st.armL = reach(g, -1, -g.sw * 0.9, g.ySh + 400); } }
  if (L === 'B1') { read(1); st.mood = 'neutral'; if (t > SP.b1_x2.t - 0.1) { read(0.4); st.mood = 'skeptical'; st.lookY = 0; } if (t > ev('stun') - 0.05) { st.mood = 'shock'; st.blink = 0; st.items = {}; st.armL = reach(g, -1, -g.sw * 1.5, g.ySh + 120, { planar: true }); st.armR = reach(g, 1, g.sw * 1.0, g.ySh + 160, { planar: true }); }
    if (t > SP.b1_her3.t + 0.6) { st.mood = 'worried'; st.blink = undefined; st.armL = reach(g, -1, -g.sw * 0.9, g.ySh + 420); st.armR = reach(g, 1, -g.sw * 0.1, g.ySh + 440); } }
  if (L === 'B2') { read(0.6); if (t > ev('point') - 0.05 && t < endOf('b2_x') + 0.2) { st.armR = reach(g, 1, -g.sw * 0.9, g.ySh + 300); } st.mood = 'neutral'; if (speaking('b2_x2', t, 0.1, 0.3)) { st.mood = 'skeptical'; st.browUp = 0.6; }
    if (t > SP.b2_x3.t - 0.1) st.mood = 'skeptical'; if (t > ev('back') - 0.05) { read(1); st.mood = 'bored'; st.lookY = 0.3; } if (t > ev('close') - 0.05) { const k = eIO(P(t, ev('close'), ev('close') + 0.35)); st.items = { L: folderItem(false) }; st.armL = reach(g, -1, -g.sw * lerp(1.3, 0.8, k), g.ySh + lerp(170, 410, k)); st.mood = 'tired'; st.lookY = 0.2; } }
  if (L === 'C1') { const a = ev('aside'); if (t < a + 0.4) { st.items = { L: folderItem(false) }; const k = eIO(P(t, a, a + 0.4)); st.armL = reach(g, -1, lerp(-g.sw * 0.8, g.sw * 1.6, k), g.ySh + 400); }
    gest(st, g, 'grant', t, -1, 260); if (t > SP.c1_her.t) st.mood = 'surprised'; if (t > ev('brow') - 0.05) { st.mood = 'skeptical'; st.browUp = eOut(P(t, ev('brow'), ev('brow') + 0.4)); }
    const tu = ev('turn'); if (t > tu - 0.1 && t < tu + 0.7) { st.armL = reach(g, -1, -g.sw * lerp(0.4, 2.0, eIO(P(t, tu, tu + 0.6))), g.ySh + 440); st.mood = 'smug'; st.lookY = 0.4; st.browUp = 0.4; } if (t > tu + 0.7) { st.mood = 'smug'; st.browUp = 0.5; } }
  if (L === 'C2') { cross(); st.mood = 'annoyed'; if (t > SP.c2_her.t + 1.5) st.mood = 'skeptical'; if (t > SP.c2_her.t + 5) st.mood = 'surprised'; if (t > ev('freeze') - 0.05) { st.mood = 'shock'; st.blink = 0; }
    if (t > ev('tie') - 0.05) { st.mood = 'worried'; st.blink = undefined; st.armL = reach(g, -1, -g.sw * 0.6, g.ySh + 420); st.armR = reach(g, 1, g.sw * 0.12 + Math.sin(t * 14) * 10, g.ySh + 30); st.headFirst = false; }
    if (t > endOf('c2_x2') + 0.2) { st.armR = reach(g, 1, -g.sw * 0.1, g.ySh + 440); st.mood = 'surprised'; st.look = -0.9; } if (t > ev('leave')) { st.look = -1; st.turn = -0.5; st.mood = 'sad'; }
    if (t > ev('alone')) { st.mood = 'tired'; st.turn = -0.35; st.look = -0.6; st.lookY = 0.2; } if (t > ev('look') - 0.05) { st.mood = 'smug'; st.lookY = 0.65; st.look = -0.6; st.armL = reach(g, -1, -g.sw * 1.5, g.ySh + 400); } }
  return st; }
function herPos(t, L) { // x, standing amount (0 seated .. 1 standing), walking
  if (L !== 'C2' && L !== 'outro') return { x: HERX, up: 0, walk: false };
  const r = ev('rise'), lv = ev('leave'); const up = eIO(P(t, r, r + 0.55)); if (t < lv) return { x: HERX, up, walk: false };
  return { x: lerp(HERX, -1700, P(t, lv, lv + 1.6)), up: 1, walk: true }; }
function herState(t, L) { const p = herPos(t, L), drop = lerp(DH, 0, p.up), g = p.up > 0 ? geom(HER, drop) : G.her;
  const st = { t, talk: talk('her', t), mood: 'neutral', turn: 0.35, look: 0.8, legPose: p.up > 0.5 ? (p.walk ? 'walk' : 'stand') : 'sit', drop, legs: p.up > 0.5,
    armL: reach(g, -1, g.sw * 0.1, g.ySh + 320), armR: reach(g, 1, g.sw * 0.9, g.ySh + 310) };
  gest(st, g, 'her', t, 1, 220);
  if (L === 'hook') { st.mood = 'neutral'; if (speaking('hook_her', t, 0.1)) { st.mood = 'smug'; st.lookY = -0.15; st.armR = reach(g, 1, g.sw * 0.3, g.ySh + 140); }
    if (t > hev('gulp') - 0.05) { const k = Math.sin(clamp((t - hev('gulp')) / 0.45) * Math.PI); st.mood = 'worried'; st.headY = 14 * k; st.lookY = 0.2; st.look = 0.4; st.armR = reach(g, 1, g.sw * 0.9, g.ySh + 310); } }
  if (L === 'A1') { st.mood = 'happy'; if (speaking('a1_her', t, 0.1, 0.3)) { st.mood = 'smug'; st.lookY = -0.25; st.headY = -10; } if (speaking('a1_her2', t, 0.05, 0.2)) st.mood = 'happy';
    if (t > SP.a1_x3.t) st.mood = 'surprised'; if (speaking('a1_her3', t, 0.05, 0.4)) { st.mood = 'happy'; st.armR = reach(g, 1, g.sw * 1.6, g.ySh - 160 + Math.sin(t * 14) * 40, { planar: true }); }
    if (t > ev('meter')) { st.mood = 'happy'; st.lookY = -0.1; } }
  if (L === 'A2') { if (speaking('a2_her', t, 0.1)) st.mood = 'smug'; const d = ev('draw');
    if (t > d - 0.05 && t < SP.a2_her2.t - 0.1) { st.mood = 'smug'; st.lookY = 0.75; st.look = 0.3; st.turn = 0.2; st.armR = reach(g, 1, g.sw * 1.1 + Math.sin(t * 22) * 30, g.ySh + 290 + Math.cos(t * 17) * 12); st.items = { R: pencilItem }; st.armL = reach(g, -1, g.sw * 0.5, g.ySh + 315); }
    if (speaking('a2_her2', t, 0.1, 0.3)) { st.mood = 'happy'; st.armR = reach(g, 1, g.sw * 1.9, g.ySh + 110, { planar: true }); st.items = { R: chartItem }; }
    if (t > SP.a2_x2.t) st.mood = 'surprised'; if (speaking('a2_her3', t, 0.05, 0.3)) st.mood = 'happy'; if (t > ev('chart')) st.mood = 'smug'; }
  if (L === 'B1') { if (speaking('b1_her', t, 0.1, 0.3)) st.mood = 'smug'; if (speaking('b1_her2', t, 0.1, 0.3)) st.mood = 'happy';
    if (t > endOf('b1_her2') - 0.2 && t < ev('stun')) { st.armR = reach(g, 1, g.sw * 1.7, g.ySh + 120, { planar: true }); st.items = { R: phoneItem }; st.mood = 'happy'; }
    if (speaking('b1_her3', t, 0.1, 0.5)) { st.mood = 'neutral'; st.headY = Math.sin(t * 6) * 6; } }
  if (L === 'B2') { st.mood = 'neutral'; const n = ev('nod'); if (t > n - 0.05 && t < SP.b2_x2.t) { st.mood = 'smug'; st.headY = Math.abs(Math.sin((t - n) * 9)) * 18; st.lookY = 0.1; }
    if (t > SP.b2_x2.t) st.mood = 'surprised'; if (speaking('b2_her', t, 0.05, 0.2)) st.mood = 'smug'; if (speaking('b2_her2', t, 0.05, 0.4)) { st.mood = 'happy'; st.lookY = -0.2; }
    if (t > ev('back')) { st.mood = 'worried'; } }
  if (L === 'C1') { st.mood = 'worried'; if (t > ev('straight') - 0.05) { st.mood = 'smug'; st.headY = -16; st.armL = reach(g, -1, g.sw * 0.4, g.ySh + 300); } if (speaking('c1_her', t, 0.05)) st.mood = 'neutral';
    if (t > SP.c1_x2.t) st.mood = 'surprised'; if (speaking('c1_her2', t, 0.05, 0.3)) { st.mood = 'worried'; st.headY = 0; } if (t > ev('turn')) { st.mood = 'surprised'; st.lookY = 0.5; st.look = 0.5; }
    if (t > ev('grin') - 0.05) { st.mood = 'happy'; st.lookY = 0; st.look = 0.8; st.headY = 0; } }
  if (L === 'C2') { st.mood = 'worried'; const tk = ev('take');
    if (t > tk - 0.05) { st.mood = 'neutral'; st.lookY = 0.7; st.look = 0.2; const k = eIO(P(t, tk, tk + 0.5)); st.armR = reach(g, 1, g.sw * lerp(1.0, 1.5, k), g.ySh + lerp(310, 170, k)); if (t > tk + 0.25) st.items = { R: postingItem }; }
    if (t > ev('up') - 0.05) { st.mood = 'smug'; st.lookY = 0; st.look = 0.8; st.headY = -14; }
    if (speaking('c2_her', t, 0.05)) { st.mood = 'smug'; st.armR = reach(g, 1, g.sw * 1.6, g.ySh + 140 + Math.sin(t * 4) * 20, { planar: true }); st.items = { R: postingItem }; gest(st, g, 'her', t, -1, 240); }
    if (t > endOf('c2_her') && t < ev('rise')) { st.mood = 'smug'; st.armR = reach(g, 1, g.sw * 1.5, g.ySh + 180); st.items = { R: postingItem }; }
    if (t > ev('rise') - 0.05) { st.mood = 'smug'; st.items = {}; st.headY = 0; st.armR = reach(g, 1, g.sw * 0.7, g.ySh + 330); st.armL = reach(g, -1, -g.sw * 0.7, g.ySh + 330); }
    if (t > ev('bag') - 0.05) { st.armL = reach(g, -1, -g.sw * 0.9, g.ySh + 300); st.items = { L: bagItem }; }
    if (t > ev('leave') - 0.05) { st.turn = -0.5; st.look = -0.8; st.mood = 'smug'; } }
  return { st, p }; }
// flashback: the 12-year-old her at the lemonade stand
function kidState(t) { const g = G.kid, st = { t, talk: 0, mood: 'happy', turn: 0.3, look: 0.6, armL: reach(g, -1, -g.sw * 0.6, g.ySh + 300), armR: reach(g, 1, g.sw * 0.9, g.ySh + 260) };
  const b = ev('buy'), s = ev('sale'); if (t > b + 0.2 && t < s) { const k = eIO(P(t, b + 0.2, b + 0.6)); st.armR = reach(g, 1, g.sw * lerp(0.9, 2.6, k), g.ySh + lerp(260, 150, k), { planar: true }); st.items = { R: cupItem }; st.mood = 'smug'; }
  if (t > s) { st.mood = 'happy'; st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 260, { planar: true }); st.armR = reach(g, 1, g.sw * 1.6, g.ySh - 260, { planar: true }); } return st; }
function buyerState(t) { const g = G.buyer, b = ev('buy'), s = ev('sale'); const st = { t, talk: 0, mood: 'neutral', turn: -0.4, look: -0.7, legPose: t < b ? 'walk' : 'stand', armL: reach(g, -1, -g.sw * 0.8, g.ySh + 330), armR: reach(g, 1, g.sw * 0.8, g.ySh + 330) };
  if (t > b + 0.5) { st.armL = reach(g, -1, -g.sw * 1.6, g.ySh + 200); st.mood = 'happy'; } if (t > s - 0.1) { st.items = { L: cupItem }; st.armL = reach(g, -1, -g.sw * 0.9, g.ySh + 120); } return st; }

// ---------------- the world + which characters a shot draws (clean singles: only the tagged character)
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { c.drawImage(BGB, BX0, BY0, BW, BH); const heads = {};
  const drawHer = tag !== 'grant', drawGrant = tag !== 'her';
  chair(c, HERX - 30, -1); chair(c, GX + 40, 1);
  if (drawGrant) heads.grant = put(c, GRANT, grantState(t, L), GX, 0);
  if (drawHer) { const r = herState(t, L); heads.her = put(c, HER, r.st, r.p.x, 0); }
  desk(c, t, L); deskProps(c, t, L);
  if (!heads.grant) heads.grant = OFF; if (!heads.her) heads.her = OFFL;
  return heads; }

// ---------------- shots (world coordinates; face of a single at ~900 px)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const fy = (who, z, sy = 900) => HY[who] + (960 - sy) / z;
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const midY = (z, sy) => (HY.her + HY.grant) / 2 + (960 - sy) / z;
const SH = { WIDE: S(10, -790, 0.55, 'wide'), CARD: S(10, midY(0.74, 1080), 0.74, 'card'), HOOKW: S(10, midY(0.72, 1180), 0.72, 'card'),
  HER: S(HERX + 90, fy('her', 1.0), 1.0, 'her'), HER_R: S(HERX + 60, fy('her', 1.05, 1110), 1.05, 'her'), HER_UP: S(HERX + 90, fy('herUp', 0.92, 920), 0.92, 'her'),
  GRANT: S(GX - 90, fy('grant', 0.98), 0.98, 'grant'), GRANT_R: S(GX - 60, fy('grant', 1.02, 1110), 1.02, 'grant'),
  HOOKG: S(GX - 40, fy('grant', 1.1, 1320), 1.1, 'grant'), HOOKH: S(HERX + 40, fy('her', 1.15, 1320), 1.15, 'her'),
  RESUME: U('resume', 1), EXCEL: U('excel', 2), PAPER: U('paper', 3), CHART: U('chart', 4), CHAT: U('chat', 5), FLASH: U('flash', 6), CEO: U('ceo', 7), POSTING: U('posting', 8), EDIT: U('edit', 9), BLACK: U('black', 10) };
const chunkStarts = id => { const ch = (TL.cfg.chunks || {})[id], sp = SP[id]; if (!ch || !sp) return []; const cnt = ch.map(([en]) => en.trim().split(/\s+/).length), tot = cnt.reduce((a, b) => a + b, 0); let wi = 0;
  return ch.map((x, i) => { const v = sp.words && sp.words.length === tot ? sp.t + sp.words[wi][1] : sp.t + sp.d * i / ch.length; wi += cnt[i]; return v; }); };
const C2CH = chunkStarts('c2_her');
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }); if (L === 'outro') return SH.WIDE;
  const sp = id => speaking(id, t, 0.1, 0.15);
  if (L === 'hook') { if (t < hev('brows') - 0.03) return SH.RESUME; if (t < SP.hook_her.t - 0.1) return f(SH.HOOKG); if (t < hev('gulp') + 0.55) return f(SH.HOOKH); return f(SH.HOOKW); }
  const u = t - sc.s, l = L.toLowerCase(), nar = SP[l + '_nar'];
  if (u < 1.15) return f(L === 'C1' || L === 'C2' ? SH.CARD : SH.WIDE);
  if (L === 'C2' && t > ev('look') - 0.05) return f(t < ev('edit') - 0.05 ? SH.GRANT_R : t < ev('black') ? SH.EDIT : SH.BLACK);
  if (nar && t >= nar.t - 0.1) return f(SH.CARD);
  const win = (a, b) => t > a - 0.05 && t < b - 0.05;
  if (L === 'A1') { if (win(ev('meter'), ev('lower'))) return f(SH.HER_R); if (t > ev('lower') - 0.05) return f(SH.GRANT_R); }
  if (L === 'A2') { if (win(ev('laptop'), SP.a2_x.t - 0.05)) return f(SH.GRANT); if (sp('a2_x')) return f(SH.EXCEL); if (win(ev('draw'), ev('draw') + 0.5)) return f(SH.HER_R); if (win(ev('draw') + 0.5, SP.a2_her2.t - 0.05)) return f(SH.PAPER); if (t > ev('chart') - 0.05) return f(SH.CHART); }
  if (L === 'B1') { if (win(ev('chat'), ev('stun'))) return f(SH.CHAT); if (win(ev('stun'), SP.b1_her3.t - 0.05)) return f(SH.GRANT_R); }
  if (L === 'B2') { if (win(ev('nod'), SP.b2_x2.t - 0.05)) return f(SH.HER_R); if (win(ev('flash'), ev('back'))) return f(SH.FLASH); if (t > ev('back') - 0.05) return f(SH.GRANT); }
  if (L === 'C1') { if (win(ev('straight'), SP.c1_her.t - 0.05)) return f(SH.HER); if (win(ev('brow'), SP.c1_x2.t - 0.05)) return f(SH.GRANT_R); if (win(ev('turn'), ev('ceo'))) return f(SH.WIDE); if (win(ev('ceo'), ev('grin'))) return f(SH.CEO); if (t > ev('grin') - 0.05) return f(SH.HER_R); }
  if (L === 'C2') { if (win(ev('take'), SP.c2_her.t - 0.05)) return f(SH.HER);
    if (sp('c2_her')) { if (C2CH.length === 4 && t > C2CH[2] - 0.1 && t < C2CH[3] - 0.1) return f(SH.GRANT_R); return f(SH.HER); }
    if (win(ev('freeze'), ev('posting'))) return f(SH.GRANT_R); if (win(ev('posting'), ev('tie'))) return f(SH.POSTING); if (win(ev('tie'), endOf('c2_x2') + 0.1)) return f(SH.GRANT);
    if (win(ev('rise'), SP.c2_her2.t - 0.05)) return f(SH.WIDE); if (sp('c2_her2')) return f(SH.HER_UP); if (t > ev('bag') - 0.05) return f(SH.WIDE); }
  const cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.1 && t < s.t + s.d + 0.25);
  if (cur) return f(cur.who === 'her' ? SH.HER : SH.GRANT);
  const next = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.6 && t < s.t);
  if (next) return f(next.who === 'her' ? SH.HER : SH.GRANT);
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- full-screen inserts (screen space)
function backdrop(c, wood) { const g = c.createLinearGradient(0, 0, 0, HH); if (wood) { g.addColorStop(0, '#C9986A'); g.addColorStop(1, '#A87A50'); } else { g.addColorStop(0, '#3B3550'); g.addColorStop(1, '#1F1B2C'); } c.fillStyle = g; c.fillRect(0, 0, W, HH);
  if (wood) { c.fillStyle = 'rgba(0,0,0,.06)'; for (let y = 0; y < HH; y += 90) c.fillRect(0, y, W, 6); }
  if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'insert' }); }
function paper(c, x, y, w, h, col = '#FFFDF8', rot = -0.02) { c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = 'rgba(0,0,0,.28)'; rr(c, -w / 2 + 14, -h / 2 + 18, w, h, 12); c.fill(); c.fillStyle = col; rr(c, -w / 2, -h / 2, w, h, 12); c.fill(); return () => c.restore(); }
function ruLine(c, s, y, k = 1) { if (k <= 0) return; c.save(); c.globalAlpha = clamp(k); UI.font(c, 'Nun9', 42); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Nun9', 42, s, 980); UI.strokeText(c, s, 540, y, C.pinkL, C.oliveD, 10); c.restore(); }
function banner(c, k, en, col, ru, y = 1540) { if (k <= 0) return; c.save(); c.translate(540, y); c.rotate(-0.025); c.scale(k, k); const hh = ru ? 132 : 112;
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -480 + 8, -hh / 2 + 10, 960, hh, 26); c.fill(); c.fillStyle = col; rr(c, -480, -hh / 2, 960, hh, 26); c.fill(); c.strokeStyle = C.white; c.lineWidth = 6; rr(c, -480, -hh / 2, 960, hh, 26); c.stroke();
  const ty = ru ? -18 : 2; UI.textFit(c, 'Unb9', 50, en, 760); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; const tw = c.measureText(en).width; c.fillText(en, -36, ty);
  c.fillStyle = C.white; c.beginPath(); c.arc(tw / 2 + 20, ty, 32, 0, TAU); c.fill(); UI.check(c, tw / 2 + 20, ty, 24, col);
  if (ru) fitTxt(c, ru, 0, 38, 30, '#FFFFFF', 900, 'Nun9'); c.restore(); }
// the resume: 'hook' = the three big claims (cover); 'ceo' = the experience line turned to her
function resumeView(c, t, mode) { backdrop(c, true); const end = paper(c, 545, 1150, 900, 1000, '#FFFDF8', -0.025);
  c.fillStyle = '#EE5E9A'; rr(c, -450, -500, 900, 130, 12); c.fill(); txt(c, 'RESUME', -40, -435, 76, '#FFFDF8');
  c.fillStyle = '#F7B6CF'; c.beginPath(); c.arc(370, -435, 50, 0, TAU); c.fill(); c.fillStyle = '#3A2820'; c.beginPath(); c.arc(370, -448, 30, Math.PI, TAU); c.fill(); c.fillStyle = '#F6D2B6'; c.beginPath(); c.arc(370, -440, 22, 0, TAU); c.fill();
  if (mode === 'hook') { txt(c, 'SKILLS & EXPERIENCE', -430, -320, 34, '#9AA3B2', 'Unb9', 'left');
    ['FLUENT IN 5 LANGUAGES', 'EXCEL EXPERT', '10 YEARS OF EXPERIENCE'].forEach((s, i) => { const y = -180 + i * 210, p = 1 + 0.03 * Math.sin(t * 6 + i);
      c.save(); c.translate(-395, y); c.rotate(t * 0.8 + i); c.fillStyle = C.gold; UI.star(c, 0, 0, 34); c.restore(); c.save(); c.translate(45, y); c.scale(p, p); fitTxt(c, s, 0, 0, 92, i === 2 ? '#EE5E9A' : '#2B3A67', 730); c.restore(); });
    fakeLines(c, 760, 0, 400, 3); }
  else { txt(c, 'EXPERIENCE', -370, -310, 40, '#9AA3B2', 'Unb9', 'left'); fitTxt(c, 'CEO — LEMONADE COMPANY', 0, -150, 64, '#2B3A67', 740);
    fitTxt(c, 'TEAM LEADER — 20 PEOPLE', 0, 30, 46, '#7A8290', 720); fitTxt(c, 'SPANISH — FLUENT', 0, 160, 46, '#7A8290', 720); fakeLines(c, 760, 0, 300, 4);
    const k = clamp(P(t, ev('ceo') + 0.25, ev('ceo') + 0.7)); if (k > 0) { c.strokeStyle = '#E0474C'; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.ellipse(0, -150, 400, 85, -0.03, -0.3, -0.3 + TAU * k); c.stroke(); } }
  end();
  if (mode === 'ceo') ruLine(c, '«ГЕНДИРЕКТОР — ЛИМОНАДНАЯ КОМПАНИЯ»', 590, P(t, ev('ceo') + 0.4, ev('ceo') + 0.6)); }
// the spreadsheet on the laptop
function excelView(c, t) { backdrop(c); c.save(); c.translate(540, 1080); c.fillStyle = '#2B2F3A'; rr(c, -470, -330, 940, 620, 30); c.fill(); c.fillStyle = '#FFFFFF'; c.fillRect(-440, -300, 880, 560);
  c.fillStyle = '#2F8C55'; c.fillRect(-440, -300, 880, 70); txt(c, 'SALES_REPORT.xlsx', -410, -265, 30, '#FFFFFF', 'Nun9', 'left'); txt(c, 'MAKE A CHART', 300, -265, 24, '#FFFFFF', 'Unb9');
  const cols = ['', 'A', 'B', 'C', 'D', 'E']; for (let j = 0; j < 6; j++) { c.fillStyle = '#E6EAEE'; c.fillRect(-440 + j * 146, -230, 146, 44); txt(c, cols[j], -440 + j * 146 + 73, -208, 24, '#5A6270', 'Nun9'); }
  for (let i = 0; i < 9; i++) { const y = -186 + i * 48; c.fillStyle = '#E6EAEE'; c.fillRect(-440, y, 146, 48); txt(c, String(i + 1), -367, y + 24, 22, '#5A6270', 'Nun9');
    for (let j = 1; j < 6; j++) { c.strokeStyle = '#D5DAE0'; c.lineWidth = 2; c.strokeRect(-440 + j * 146, y, 146, 48); if (i > 0) txt(c, String(Math.round(100 + hash(i * 9 + j) * 900)), -440 + j * 146 + 130, y + 24, 22, '#2B2F3A', 'Nun8', 'right'); else txt(c, ['Q1', 'Q2', 'Q3', 'Q4', 'TOTAL'][j - 1], -440 + j * 146 + 73, y + 24, 22, '#2B2F3A', 'Nun9'); } }
  c.strokeStyle = '#2F8C55'; c.lineWidth = 5; c.strokeRect(-294, -186, 146 * 5, 48 * 9);
  c.fillStyle = '#3A3F4A'; c.beginPath(); c.moveTo(-520, 290); c.lineTo(520, 290); c.lineTo(560, 340); c.lineTo(-560, 340); c.fill(); c.restore(); }
// the hand-drawn "chart": strokes drawn progressively (k = 0..1)
const STROKES = (() => { const wob = (pts) => pts.map(([x, y], i) => [x + Math.sin(i * 2.1) * 6, y + Math.cos(i * 1.7) * 6]);
  const line = (a, b, n = 8) => Array.from({ length: n + 1 }, (_, i) => [lerp(a[0], b[0], i / n), lerp(a[1], b[1], i / n)]);
  return [wob([...line([-300, -330], [-305, 230]), ...line([-305, 230], [330, 222])]),
    ...[[-230, 150], [-90, 300], [50, 210]].map(([x, h]) => wob([...line([x, 225], [x + 8, 225 - h], 5), ...line([x + 8, 225 - h], [x + 100, 230 - h], 3), ...line([x + 100, 230 - h], [x + 96, 225], 5)])),
    wob([[-260, 0], [-150, -120], [-60, -60], [60, -260], [130, -190], [240, -380]]), wob([[240, -380], [180, -360]]), wob([[240, -380], [250, -320]])]; })();
function drawStrokes(c, k, col = '#4A4F5C') { const lens = STROKES.map(s => s.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - s[i][0], p[1] - s[i][1]), 0)), tot = lens.reduce((a, b) => a + b, 0); let left = tot * k, tip = null;
  c.lineCap = 'round'; c.lineJoin = 'round'; STROKES.forEach((s, si) => { if (left <= 0) return; c.strokeStyle = si === 4 || si > 4 ? '#E0474C' : col; c.lineWidth = 11; c.beginPath(); c.moveTo(...s[0]); tip = s[0];
    for (let i = 1; i < s.length; i++) { const d = Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]); if (left <= 0) break; if (left < d) { const q = left / d; tip = [lerp(s[i - 1][0], s[i][0], q), lerp(s[i - 1][1], s[i][1], q)]; c.lineTo(...tip); left = 0; break; } c.lineTo(...s[i]); tip = s[i]; left -= d; } c.stroke(); });
  return tip; }
function paperView(c, t, done) { backdrop(c, true); const end = paper(c, 540, done ? 1000 : 1080, 820, 900, '#FFFDF8', 0.02); const k = done ? 1 : clamp(P(t, ev('draw') + 0.5, SP.a2_her2.t - 0.2));
  const tip = drawStrokes(c, k); if (k > 0.9) { c.globalAlpha = clamp((k - 0.9) * 10); txt(c, 'MONEY', -330, -380, 52, '#4A4F5C', 'Cav7'); txt(c, 'TIME', 310, 280, 52, '#4A4F5C', 'Cav7'); c.strokeStyle = '#F2C14E'; c.lineWidth = 9; c.beginPath(); c.arc(270, -300 + 0, 0, 0, 0); c.stroke();
    c.save(); c.translate(-240, -300); c.strokeStyle = '#F2C14E'; c.lineWidth = 8; c.beginPath(); c.arc(0, 0, 40, 0, TAU); c.stroke(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; c.beginPath(); c.moveTo(Math.cos(a) * 55, Math.sin(a) * 55); c.lineTo(Math.cos(a) * 75, Math.sin(a) * 75); c.stroke(); } c.restore(); c.globalAlpha = 1; }
  if (!done && tip && k < 1) { c.save(); c.translate(tip[0], tip[1]); c.rotate(-0.6); c.fillStyle = '#F7D9B0'; c.beginPath(); c.moveTo(0, 0); c.lineTo(-16, -40); c.lineTo(16, -40); c.fill(); c.fillStyle = '#F2C14E'; c.fillRect(-16, -260, 32, 220); c.fillStyle = '#EE5E9A'; c.fillRect(-16, -296, 32, 40); c.fillStyle = '#4A4F5C'; c.beginPath(); c.moveTo(0, 0); c.lineTo(-6, -14); c.lineTo(6, -14); c.fill(); c.restore(); }
  end();
  if (done) { const kk = eBack(P(t, ev('tick'), ev('tick') + 0.3), 2.2); if (kk > 0) { c.save(); c.translate(560, 1500); c.rotate(-0.06); c.scale(kk, kk); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -360 + 8, -70 + 10, 720, 140, 26); c.fill(); c.fillStyle = '#2F9E58'; rr(c, -360, -70, 720, 140, 26); c.fill(); c.strokeStyle = C.white; c.lineWidth = 6; rr(c, -360, -70, 720, 140, 26); c.stroke();
    UI.textFit(c, 'Unb9', 60, 'EXCEL EXPERT', 500); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('EXCEL EXPERT', -40, -14); c.fillStyle = C.white; c.beginPath(); c.arc(270, -14, 38, 0, TAU); c.fill(); UI.check(c, 270, -14, 28, '#2F9E58'); fitTxt(c, '«эксперт по Excel»', -40, 42, 30, '#FFFFFF', 560, 'Nun9'); c.restore(); } } }
// the group chat on her phone
const MSGS = [['AUNT ROSE', '#E0474C', "WHERE'S THE CAKE?!", 'ГДЕ ТОРТ?!'], ['COUSIN MAX', '#3C8FE0', 'WHO INVITED GRANDMA?!', 'КТО ПОЗВАЛ БАБУШКУ?!'], ['UNCLE JOE', '#E9A23B', 'WE HAVE NO CHAIRS!', 'У НАС НЕТ СТУЛЬЕВ!']];
function chatView(c, t) { backdrop(c); const c0 = ev('chat'), at = [c0 + 0.3, c0 + 0.8, c0 + 1.3];
  K.phone(c, 540, 900, 1.3, (cc, w, h) => { cc.fillStyle = '#EEF1F5'; cc.fillRect(0, 0, w, h);
    cc.fillStyle = '#FFFFFF'; cc.fillRect(0, 0, w, 104); cc.fillStyle = '#D5DAE0'; cc.fillRect(0, 103, w, 2); cc.fillStyle = '#EE5E9A'; cc.beginPath(); cc.arc(54, 58, 30, 0, TAU); cc.fill(); txt(cc, '20', 54, 60, 24, '#FFFFFF');
    fitTxt(cc, 'BIRTHDAY PARTY', 98, 44, 28, '#2B2F3A', 300, 'Unb9', 'left'); fitTxt(cc, '20 MEMBERS', 98, 78, 20, '#7A8290', 300, 'Nun9', 'left');
    cc.fillStyle = '#3C8FE0'; rr(cc, w - 236, 130, 220, 56, 22); cc.fill(); txt(cc, 'Party at 5! :)', w - 126, 158, 24, '#FFFFFF', 'Nun9');
    MSGS.forEach(([who, col, m], i) => { const k = eBack(P(t, at[i], at[i] + 0.25), 2); if (k <= 0) return; const y = 220 + i * 160; cc.save(); cc.translate(16, y); cc.scale(k, k); cc.fillStyle = '#FFFFFF'; rr(cc, 0, 0, w - 50, 132, 22); cc.fill();
      fitTxt(cc, who, 20, 30, 20, col, 300, 'Unb9', 'left'); fitTxt(cc, m, 20, 82, 34, '#2B2F3A', w - 90, 'Unb9', 'left'); cc.restore(); }); });
  MSGS.forEach(([, , , ru], i) => ruLine(c, ru, 1470 + i * 54, P(t, at[i] + 0.15, at[i] + 0.35))); }
// flashback: lemonade stand, 12 years old
function flashView(c, t) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, '#9FD3F2'); g.addColorStop(0.62, '#E8F4F2'); g.addColorStop(0.62, '#8CC46A'); g.addColorStop(1, '#6FA853'); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'flash' });
  c.fillStyle = '#FFE38A'; c.beginPath(); c.arc(880, 420, 90, 0, TAU); c.fill(); c.fillStyle = '#FFFFFF'; for (const [x, y] of [[200, 520], [620, 380]]) { c.beginPath(); c.ellipse(x, y, 120, 44, 0, 0, TAU); c.ellipse(x + 70, y - 24, 80, 40, 0, 0, TAU); c.fill(); }
  const GY = 1560, s = 0.62, b = ev('buy');
  c.save(); c.translate(370, GY); c.scale(0.8, 0.8); put(c, KID, kidState(t), 0, 0); c.restore();
  // the stand in front of her
  paint(c, q => { q.m(150, 1190); q.l(610, 1190); q.l(610, 1560); q.l(150, 1560); q.z(); }, '#F4E3C3', { sd: 8, hd: 3, lw: 4 }); c.fillStyle = '#E0474C'; for (let i = 0; i < 5; i++) c.fillRect(150 + i * 92, 1190, 46, 370);
  c.fillStyle = '#C98B5A'; c.fillRect(130, 1170, 500, 26); c.fillStyle = 'rgba(255,255,255,.75)'; rr(c, 450, 1080, 70, 92, 10); c.fill(); c.fillStyle = '#F7E36A'; rr(c, 456, 1110, 58, 58, 8); c.fill();
  c.save(); c.translate(380, 1340); c.rotate(-0.04); c.fillStyle = '#FFFDF8'; rr(c, -200, -70, 400, 140, 14); c.fill(); c.strokeStyle = '#3E471E'; c.lineWidth = 5; rr(c, -200, -70, 400, 140, 14); c.stroke(); txt(c, 'LEMONADE', 0, -24, 64, '#E9A23B', 'Cav7'); txt(c, '$1', 0, 36, 60, '#3E471E', 'Cav7'); c.restore();
  const bx = lerp(1250, 830, eOut(P(t, b - 0.8, b))); c.save(); c.translate(bx, GY); c.scale(0.56, 0.56); put(c, BUYER, buyerState(t), 0, 0); c.restore();
  // cash box with the sales counter
  const sk = eBack(P(t, ev('sale'), ev('sale') + 0.3), 2.2); if (sk > 0) { c.save(); c.translate(540, 545); c.rotate(-0.03); c.scale(sk, sk); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -330 + 8, -70 + 10, 660, 140, 22); c.fill(); c.fillStyle = '#2B2F3A'; rr(c, -330, -70, 660, 140, 22); c.fill();
    fitTxt(c, 'TOTAL SALES: $3', 0, -12, 58, '#7CF29A', 600); fitTxt(c, '«всего продаж: 3 доллара»', 0, 42, 28, '#FFFFFF', 600, 'Nun9'); c.restore(); }
  c.fillStyle = 'rgba(255,190,110,.16)'; c.fillRect(0, 0, W, HH); Hq.vignette(c, W, HH, 0.55);
  c.save(); c.translate(540, 385); c.rotate(-0.03); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -260 + 6, -46 + 8, 520, 92, 46); c.fill(); c.fillStyle = '#FFFDF8'; rr(c, -260, -46, 520, 92, 46); c.fill(); fitTxt(c, '10 ЛЕТ НАЗАД · 12 ЛЕТ', 0, 2, 38, '#3E471E', 460); c.restore(); }
// the job posting: 'show' (C2 close-up) / 'edit' (the last gag, 10 -> 15, big)
function postingView(c, t, mode) { backdrop(c, true); const edit = mode === 'edit', s = edit ? 1.2 : 1;
  c.save(); c.translate(540, edit ? 1060 : 1010); c.scale(edit ? s : 0.9, edit ? s : 0.9); c.translate(0, edit ? 140 : 0); const end = paper(c, 0, 0, 780, 1040, '#FFF6D6', -0.02);
  c.fillStyle = '#2B3A67'; rr(c, -390, -520, 780, 110, 12); c.fill(); txt(c, 'MEGACORP · JOB POSTING', 0, -465, 40, '#F2C14E');
  fitTxt(c, 'ENTRY LEVEL POSITION', 0, -340, 58, '#EE5E9A', 700); txt(c, 'REQUIREMENTS:', -340, -235, 40, '#2B3A67', 'Unb9', 'left');
  const reqs = ['10 YEARS EXPERIENCE', '5 LANGUAGES', 'EXCEL EXPERT']; reqs.forEach((r, i) => { const y = -50 + i * 100; c.fillStyle = '#2B3A67'; c.beginPath(); c.arc(-320, y, 12, 0, TAU); c.fill(); txt(c, r, -285, y, 46, '#2B2F3A', 'Unb9', 'left'); });
  txt(c, 'SALARY:', -340, 285, 44, '#2B3A67', 'Unb9', 'left'); c.save(); c.translate(150, 285); c.rotate(-0.12); c.strokeStyle = '#E0474C'; c.lineWidth = 9; rr(c, -170, -56, 340, 112, 16); c.stroke(); txt(c, 'UNPAID', 0, 4, 72, '#E0474C'); c.restore();
  fakeLines(c, 700, 0, 395, 4, '#D9CFA8');
  if (edit) { const e0 = ev('edit'), k1 = clamp(P(t, e0, e0 + 0.35)), k2 = clamp(P(t, e0 + 0.4, e0 + 0.95)); const x0 = -285, y0 = -50; c.font = '46px Unb9'; const w10 = c.measureText('10').width;
    if (k1 > 0) { c.strokeStyle = '#E0474C'; c.lineWidth = 10; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0 - 8, y0 + 4); c.lineTo(x0 - 8 + (w10 + 16) * k1, y0 - 6); c.stroke(); }
    if (k2 > 0) { c.save(); c.beginPath(); c.rect(x0 - 40, y0 - 160, 190 * k2, 130); c.clip(); txt(c, '15', x0 + 34, y0 - 92, 120, '#E0474C', 'Cav7'); c.restore(); }
    const pk = t < e0 + 1.05 ? 1 : 1 - P(t, e0 + 1.05, e0 + 1.3); if (t > e0 - 0.2 && pk > 0) { const px = k2 > 0 ? x0 - 20 + 190 * k2 : x0 - 8 + (w10 + 16) * k1, py = k2 > 0 ? y0 - 70 + Math.sin(t * 40) * 10 : y0;
      c.save(); c.globalAlpha = pk; c.translate(px, py); c.rotate(-0.5); c.fillStyle = '#2B3A67'; rr(c, -14, -280, 28, 250, 10); c.fill(); c.fillStyle = '#F2C14E'; c.fillRect(-14, -240, 28, 14); c.fillStyle = '#C9CED6'; c.beginPath(); c.moveTo(-14, -30); c.lineTo(14, -30); c.lineTo(0, 0); c.fill(); c.restore(); } }
  end(); c.restore();
  if (!edit) ruLine(c, '«начальная должность · зарплата: БЕЗ ОПЛАТЫ»', 1545, P(t, ev('posting') + 0.2, ev('posting') + 0.4));
  if (edit) { const u = ev('updated'); banner(c, eBack(P(t, u, u + 0.3), 2.2), 'REQUIREMENTS UPDATED', '#2F9E58', '«требования обновлены»', 1520); } }

// ---------------- overlays in the world shots
function meter(c, hd, z, t) { const k = eBack(P(t, ev('meter'), ev('meter') + 0.3), 2.2); if (k <= 0 || t > SP.a1_nar.t - 0.1) return; const x = clamp(hd.x, 300, 780), y = hd.y - hd.hh * z * 2.0 - 40;
  c.save(); c.translate(x, y); c.scale(k, k); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -300 + 6, -70 + 8, 600, 140, 24); c.fill(); c.fillStyle = '#FFFDF8'; rr(c, -300, -70, 600, 140, 24); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; rr(c, -300, -70, 600, 140, 24); c.stroke();
  fitTxt(c, 'SPANISH LEVEL:', -270, -30, 32, '#3E471E', 330, 'Unb9', 'left'); fitTxt(c, '2 WORDS', 270, -30, 32, '#E0474C', 190, 'Unb9', 'right');
  for (let i = 0; i < 10; i++) { c.fillStyle = i < 2 ? '#E0474C' : '#EAE1CB'; rr(c, -270 + i * 55, 8, 46, 40, 8); c.fill(); } c.restore(); }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { K.outro(c, t, { q: ['ПРИУКРАШИВАЛ(А)', 'РЕЗЮМЕ?'], rows: [['A1', 'Say something!'], ['A2', 'Here you go!'], ['B1', 'A lot of responsibility.'], ['C2', 'With all due respect…']], cta: ['РАССКАЖИ', 'В КОММЕНТАХ'], heroX: 180, heroS: 0.42,
    hero: (cc, tt) => put(cc, HER, { t: tt, mood: 'happy', turn: 0, look: 0, armL: reach(G.herUp, -1, -G.herUp.sw * 1.9, G.herUp.ySh - 250 + Math.sin(tt * 8) * 30, { planar: true }), armR: reach(G.herUp, 1, G.herUp.sw * 1.2, G.herUp.ySh + 200), items: { R: folderItem(true) } }, 0, 0) });
    const qk = eBack(P(t - SC.outro.s, 0.45, 0.8), 2); if (qk > 0) { c.save(); c.translate(540, 404); c.scale(qk, qk); UI.textFit(c, 'Unb9', 30, 'HAVE YOU EVER LIED ON YOUR RESUME?', 900); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, 'HAVE YOU EVER LIED ON YOUR RESUME?', 0, 0, C.oliveD, C.white, 8); c.restore(); }
    Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj = p => p;
  if (tag === 'ui:black') { c.fillStyle = '#000000'; c.fillRect(0, 0, W, HH); UI.watermark(c); return; }
  if (tag.startsWith('ui:')) { const v = tag.slice(3); c.save(); c.translate(sh.x, sh.y);
    if (v === 'resume') resumeView(c, t, 'hook'); if (v === 'ceo') resumeView(c, t, 'ceo'); if (v === 'excel') excelView(c, t); if (v === 'paper') paperView(c, t, false); if (v === 'chart') paperView(c, t, true);
    if (v === 'chat') chatView(c, t); if (v === 'flash') flashView(c, t); if (v === 'posting') postingView(c, t, 'show'); if (v === 'edit') postingView(c, t, 'edit');
    c.restore(); heads = { her: OFFL, grant: OFF }; }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26);
    const hp = h => ({ ...proj(h), hh: h.hh * cam.z });
    if (tag !== 'grant') { const hh = hp(heads.her); if (L === 'hook') sweat(c, hh, clamp(P(t, hev('gulp'), hev('gulp') + 0.3))); if (L === 'A2') sweat(c, hh, clamp(P(t, SP.a2_x2.t, SP.a2_x2.t + 0.3)) * (t < SP.a2_her3.t ? 1 : 0)); if (L === 'C1') sweat(c, hh, clamp(P(t, ev('grin'), ev('grin') + 0.3))); if (L === 'A1') meter(c, hh, cam.z, t); }
    if (tag !== 'her' && L === 'C2') sweat(c, hp(heads.grant), clamp(P(t, ev('tie'), ev('tie') + 0.3)) * (t < ev('rise') ? 1 : 0)); }
  if (L === 'hook') { if (tag !== 'ui:resume') { K.bubbles(c, t, { id: 'hook' }, heads, proj, { names: { grant: ['MR GRANT', '#2B3A67'] }, hold: { hook_x: 0.2, hook_her: 0.3 } }); }
    K.titleRibbon(c, t, 540, 455); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); UI.captions(c, t); Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  if (L === 'A1' && t > ev('lower') && t < SP.a1_nar.t - 0.1) K.dots(c, t, ev('lower') + 0.05, SP.a1_nar.t - 0.1, 1450);
  K.bubbles(c, t, sc, heads, proj, { names: { grant: ['MR GRANT', '#2B3A67'] }, hold: { a1_her3: 0.05, a2_her3: 0.5, b1_her3: 0.6, b2_her2: 0.05, c1_her2: 0.5, c2_her2: 0.5 } });
  if (L === 'C2' && t > ev('look') - 0.05) { UI.captions(c, t); Hq.grain(c, W, HH, t, 0.04); UI.levelBar(c, t, sc, 1); UI.watermark(c); return; }   // the last gag: no lesson card on top of it
  K.hud(c, t, sc);
}
E.run('resume', NF, renderFrame);
