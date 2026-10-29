// "When you pretend to be busy" episode renderer (hard_cut camera): node busy.js start end out.mp4 | --png=f1,f2
// Open-plan office: Sam (blue polo) sits behind his desk (monitor on the left, paper piles, hourglass), the boss (Mark, navy suit) stands on the right.
// C2 ends on a seminar stage (separate set). Shots tagged 'ui:<view>' (monitor, todo, glass, black) replace the world with a full-screen insert.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/busy/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];

// ---------------- cast
const WORKER = { ...BASE.jay, top: { type: 'polo', col: '#7FB0D8', col2: '#FFFFFF' }, bottom: { type: 'trousers', col: '#3B4A5C' }, shoes: { col: '#3A2A20', acc: null } };
const BOSS = { ...BASE.mark };
const G = { worker: geom(WORKER), boss: geom(BOSS) };
const WX = -170, BX = 470, HF = 420, DESK = -400;         // worker sits behind the desk: his feet are HF below the floor line (hidden by the desk)
const STX = -260, SBX = 380;                               // stage positions (C2 ending)
function txt(c, s, x, y, size, col, font = 'Unb9', align = 'center') { c.font = `${size}px ${font}`; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function sweat(c, hd, k, side = 1) { if (k <= 0) return; const x = hd.x + side * hd.hh * 0.75, y = hd.y - hd.hh * 0.55 + (1 - k) * -20; c.save(); c.globalAlpha = k; c.fillStyle = '#8FD3F7'; c.strokeStyle = '#3C8FE0'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - 34); c.quadraticCurveTo(x + 22, y, x, y + 14); c.quadraticCurveTo(x - 22, y, x, y - 34); c.fill(); c.stroke(); c.restore(); }
const paperItem = (ctx) => { ctx.save(); ctx.rotate(-0.15); ctx.fillStyle = '#FFFDF8'; ctx.strokeStyle = '#C9C3B4'; ctx.lineWidth = 3; for (let i = 3; i >= 0; i--) { ctx.fillRect(-60 + i * 6, -150 - i * 6, 120, 160); ctx.strokeRect(-60 + i * 6, -150 - i * 6, 120, 160); } ctx.fillStyle = '#C9C3B4'; for (let k = 0; k < 5; k++) ctx.fillRect(-44, -130 + k * 26, 88, 6); ctx.restore(); };
const micItem = (ctx) => { ctx.fillStyle = '#2B2F3A'; rr(ctx, -12, -40, 24, 110, 10); ctx.fill(); ctx.fillStyle = '#9AA3B2'; ctx.beginPath(); ctx.arc(0, -60, 30, 0, TAU); ctx.fill(); ctx.strokeStyle = '#6A6F78'; ctx.lineWidth = 3; ctx.stroke(); };

// ---------------- monitor content (shared by the desk monitor and the full-screen insert); w x h display
function lines(n) { return Array.from({ length: n }, () => 'I AM WORKING'); }
function screenMode(t, L) { if (L === 'hook') return t < hev('close') ? 'game' : 'type';
  if (L === 'B2') return t > ev('B2', 'report') ? 'report' : 'type'; if (L === 'C1') return t > ev('C1', 'scroll') ? 'scroll' : 'report'; if (L === 'C2') return 'report'; return 'type'; }
function screenContent(c, w, h, t, L) { const mode = screenMode(t, L);
  if (mode === 'game') { c.fillStyle = '#1B1F3A'; c.fillRect(0, 0, w, h); for (let i = 0; i < 30; i++) { c.fillStyle = 'rgba(255,255,255,.6)'; c.fillRect(hash(i) * w, hash(i + 9) * h, 4, 4); }
    for (let i = 0; i < 4; i++) { const x = w * (0.2 + i * 0.2) + Math.sin(t * 3 + i) * w * 0.04, y = h * 0.28; c.fillStyle = ['#7CF29A', '#EE5E9A', '#F2C14E', '#7FB0D8'][i]; rr(c, x - w * 0.05, y - h * 0.05, w * 0.1, h * 0.08, 6); c.fill(); }
    const px = w * 0.5 + Math.sin(t * 2) * w * 0.25; c.fillStyle = '#FFFDF8'; c.beginPath(); c.moveTo(px, h * 0.72); c.lineTo(px - w * 0.06, h * 0.84); c.lineTo(px + w * 0.06, h * 0.84); c.fill();
    c.fillStyle = '#F2C14E'; c.fillRect(px - 3, h * 0.45 + ((t * 600) % (h * 0.25)), 6, h * 0.05); fitTxt(c, 'SCORE 99,999', w * 0.5, h * 0.08, h * 0.07, '#F2C14E', w * 0.8); return; }
  c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, w, h); c.fillStyle = '#2F5A9E'; c.fillRect(0, 0, w, h * 0.1); fitTxt(c, mode === 'type' ? 'Document1' : 'PROJECT_REPORT.doc', w * 0.04, h * 0.05, h * 0.05, '#FFFFFF', w * 0.8, 'Nun9', 'left');
  if (mode === 'type') { const t0 = L === 'hook' ? hev('type') : -99, n = L === 'hook' ? Math.min(9, Math.floor(Math.max(0, t - t0) * 7)) : 9;
    lines(n).forEach((s, i) => fitTxt(c, s, w * 0.08, h * (0.2 + i * 0.085), h * 0.06, '#2B2F3A', w * 0.84, 'Unb9', 'left'));
    if (Math.sin(t * 12) > 0) { c.fillStyle = '#2B2F3A'; c.fillRect(w * 0.08, h * (0.2 + n * 0.085) - h * 0.03, 4, h * 0.06); } return; }
  if (mode === 'report') { fitTxt(c, 'PROJECT REPORT', w / 2, h * 0.38, h * 0.11, '#2B2F3A', w * 0.84); fitTxt(c, '200 PAGES', w / 2, h * 0.56, h * 0.13, '#E0474C', w * 0.84); fitTxt(c, 'by Sam', w / 2, h * 0.72, h * 0.07, '#8A8480', w * 0.6, 'Cav7'); return; }
  // scroll: pages fly by, every page says the same thing
  const s0 = ev('C1', 'scroll'), sc = clamp((t - s0) / 2.0) ** 1.6 * 199, page = Math.floor(sc) + 1, off = (sc % 1) * h * 0.9;
  for (let p = 0; p < 2; p++) { const y = h * 0.12 - off + p * h * 0.9; c.fillStyle = '#F1F3F7'; c.fillRect(w * 0.05, y, w * 0.9, h * 0.85); lines(8).forEach((s, i) => fitTxt(c, s, w * 0.1, y + h * (0.08 + i * 0.095), h * 0.06, '#2B2F3A', w * 0.8, 'Unb9', 'left')); }
  c.fillStyle = '#2F5A9E'; c.fillRect(0, 0, w, h * 0.1); fitTxt(c, 'PROJECT_REPORT.doc', w * 0.04, h * 0.05, h * 0.05, '#FFFFFF', w * 0.6, 'Nun9', 'left');
  c.fillStyle = '#2B2F3A'; rr(c, w * 0.66, h * 0.88, w * 0.31, h * 0.09, 10); c.fill(); fitTxt(c, `PAGE ${Math.min(200, page)} / 200`, w * 0.815, h * 0.925, h * 0.045, '#FFFFFF', w * 0.28); }

// ---------------- office (prerendered, softly blurred)
const BX0 = -2200, BY0 = -2800, BW = 4400, BH = 4200, BS = 0.5;
function drawOffice(c) {
  c.fillStyle = '#E6E9EE'; c.fillRect(BX0, BY0, BW, BH);
  for (const wx of [-2000, -900, 200, 1300]) { c.fillStyle = '#FFFDF8'; rr(c, wx, -2400, 700, 1000, 14); c.fill(); c.fillStyle = '#BFE3F7'; rr(c, wx + 24, -2376, 652, 952, 8); c.fill();
    c.fillStyle = '#9FB8CC'; for (let i = 0; i < 4; i++) { const bh = 300 + hash(wx + i) * 400; c.fillRect(wx + 60 + i * 150, -1424 - bh, 110, bh); } c.fillStyle = '#FFFDF8'; c.fillRect(wx + 342, -2376, 16, 952); }
  c.fillStyle = '#3E7A4A'; rr(c, -1650, -1250, 600, 380, 16); c.fill(); txt(c, 'TEAM GOALS', -1350, -1180, 50, '#FFFDF8'); c.fillStyle = '#FFFDF8'; for (let i = 0; i < 3; i++) c.fillRect(-1590, -1110 + i * 70, 300 + i * 60, 30);
  c.fillStyle = '#FFFDF8'; c.beginPath(); c.arc(1100, -1100, 150, 0, TAU); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 14; c.stroke(); c.beginPath(); c.moveTo(1100, -1100); c.lineTo(1100, -1210); c.moveTo(1100, -1100); c.lineTo(1180, -1060); c.stroke();
  // background cubicles
  for (const dx of [-1900, 1300]) { c.fillStyle = '#B7C2CF'; c.fillRect(dx, -760, 700, 520); c.fillStyle = '#2B2F3A'; rr(c, dx + 220, -980, 280, 200, 10); c.fill(); c.fillStyle = '#7FB0D8'; rr(c, dx + 236, -964, 248, 168, 6); c.fill(); }
  c.fillStyle = '#C98B5A'; rr(c, 1850, -700, 200, 460, 20); c.fill(); c.fillStyle = '#4CAF6A'; for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(1880 + i * 30, -780 - (i % 2) * 70, 60, 120, (i - 2.5) * 0.25, 0, TAU); c.fill(); }
  c.fillStyle = '#B8BDC6'; c.fillRect(BX0, -260, BW, 1700); c.fillStyle = 'rgba(0,0,0,.05)'; for (let x = BX0; x < BX0 + BW; x += 240) c.fillRect(x, -260, 6, 1700);
}
const BGB = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); { const c = BGB.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); c.filter = 'blur(1.4px)'; drawOffice(c); }
// seminar stage
function drawStage(c) {
  c.fillStyle = '#1C1F2E'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = '#6A2A4A'; for (let i = 0; i < 14; i++) { c.fillRect(BX0 + i * 330, BY0, 200, 2800); }
  c.fillStyle = 'rgba(255,240,200,.08)'; for (const x of [-1200, 0, 1200]) { c.beginPath(); c.moveTo(x - 80, BY0); c.lineTo(x + 80, BY0); c.lineTo(x + 600, 0); c.lineTo(x - 600, 0); c.fill(); }
  c.fillStyle = '#8A5A36'; c.fillRect(BX0, -40, BW, 260); c.fillStyle = '#6A4426'; c.fillRect(BX0, 200, BW, 1400);
}
const BGS = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); { const c = BGS.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); c.filter = 'blur(1.4px)'; drawStage(c); }
function stageScreen(c, t) { const s0 = ev('C2', 'stage'); c.fillStyle = '#0E1018'; rr(c, -900, -2500, 1800, 1050, 20); c.fill(); c.fillStyle = '#F3EDDF'; rr(c, -870, -2470, 1740, 990, 12); c.fill();
  if (t < SP.c2_w3.t - 0.3) { fitTxt(c, 'CORPORATE PRODUCTIVITY', 0, -2200, 100, '#2F3E5C', 1620); fitTxt(c, 'SEMINAR', 0, -2060, 150, '#EE5E9A', 1620); c.fillStyle = '#2F3E5C'; rr(c, -460, -1880, 920, 150, 75); c.fill(); fitTxt(c, 'AUDIENCE: 500 PEOPLE', 0, -1805, 64, '#FFFDF8', 860); }
  else { fitTxt(c, 'HOW TO LOOK BUSY', 0, -2160, 120, '#2F3E5C', 1620); fitTxt(c, 'WITHOUT WORKING', 0, -1990, 120, '#E0474C', 1620); fitTxt(c, 'by our new productivity expert', 0, -1800, 60, '#8A8480', 1500, 'Cav7'); } }
function audience(c, t) { const cl = t > ev('C2', 'clap') && t < ev('C2', 'silent'); for (let row = 0; row < 2; row++) for (let i = 0; i < 9; i++) { const x = -2000 + i * 500 + row * 250, y = 760 + row * 260, bob = cl ? Math.abs(Math.sin(t * 14 + i)) * 26 : 0;
  c.fillStyle = row ? '#0E1018' : '#171A26'; c.beginPath(); c.arc(x, y - 260 - bob, 110, 0, TAU); c.fill(); rr(c, x - 190, y - 170 - bob, 380, 400, 120); c.fill();
  if (cl && (i + row) % 2 === 0) { c.fillStyle = '#2A2E40'; c.beginPath(); c.arc(x - 60 + Math.sin(t * 20 + i) * 30, y - 420, 40, 0, TAU); c.arc(x + 60 - Math.sin(t * 20 + i) * 30, y - 420, 40, 0, TAU); c.fill(); } } }

// ---------------- desk + props (in front of the worker)
function pileH(t, L) { return { hook: 3, A1: 3, A2: 4, B1: 14, B2: 14, C1: 14, C2: 14 }[L] || 3; }
function hourglass(c, x, y, t, L) { const f = L === 'A2' ? eIO(P(t, ev('A2', 'flip'), ev('A2', 'flip') + 0.4)) : ['B1', 'B2', 'C1', 'C2'].includes(L) ? 1 : 0;
  c.save(); c.translate(x, y - 110); c.rotate(Math.PI * f); c.fillStyle = '#8A5A36'; c.fillRect(-70, -110, 140, 20); c.fillRect(-70, 90, 140, 20);
  c.fillStyle = 'rgba(200,230,255,.6)'; c.beginPath(); c.moveTo(-55, -90); c.lineTo(55, -90); c.lineTo(8, 0); c.lineTo(55, 90); c.lineTo(-55, 90); c.lineTo(-8, 0); c.fill(); c.strokeStyle = '#5E6B2F'; c.lineWidth = 4; c.stroke();
  c.fillStyle = '#F2C14E'; c.beginPath(); c.moveTo(-40, 90); c.lineTo(40, 90); c.lineTo(0, 40); c.fill(); c.restore(); }
function monitor(c, t, L) { const x = -720, y = DESK; c.fillStyle = '#EE5E9A'; rr(c, -1020, y - 120, 90, 110, 12); c.fill(); c.strokeStyle = '#C8508A'; c.lineWidth = 10; c.beginPath(); c.arc(-930, y - 70, 22, -1.3, 1.3); c.stroke(); c.fillStyle = '#5A606E'; c.fillRect(x - 20, y - 120, 40, 120); rr(c, x - 120, y - 24, 240, 24, 8); c.fill();
  c.fillStyle = '#2B2F3A'; rr(c, x - 300, y - 520, 600, 420, 22); c.fill(); c.save(); c.translate(x - 276, y - 496); c.beginPath(); c.rect(0, 0, 552, 372); c.clip(); screenContent(c, 552, 372, t, L); c.restore(); K.mark(c, 'monitor', x, y - 310, 300); }
// paper flying off the pile at DROP, landing on the floor in front of the desk
function droppedSheet(c, t, L) { if (!['B1'].includes(L)) return; const d = ev('B1', 'drop'), u = P(t, d, d + 0.9); if (t < d) return;
  const x = lerp(-80, 280, eOut(u)) + Math.sin(u * 9) * 40, y = lerp(DESK - 820, 700, u), r = Math.sin(u * 7) * 0.6 + (u >= 1 ? 0.2 : 0);
  c.save(); c.translate(x, y); c.rotate(r); c.fillStyle = '#FFF4B8'; c.fillRect(-90, -60, 180, 120); c.fillStyle = '#C9A040'; for (let k = 0; k < 3; k++) c.fillRect(-70, -30 + k * 26, 140, 8); c.restore(); }
function desk(c, t, L) {
  paint(c, q => { q.m(-1050, DESK); q.l(420, DESK); q.l(420, DESK + 60); q.l(-1050, DESK + 60); q.z(); }, '#B98556', { sd: 6, hd: 3, lw: 4 });
  paint(c, q => { q.m(-1010, DESK + 60); q.l(380, DESK + 60); q.l(380, 900); q.l(-1010, 900); q.z(); }, '#9C6A42', { sd: 10, hd: 4, lw: 4 });
  monitor(c, t, L);
  c.fillStyle = '#E9ECF1'; rr(c, -420, DESK - 30, 360, 34, 8); c.fill();                                         // keyboard
  const n = pileH(t, L), hug = L === 'B1' && t > ev('B1', 'hug') - 0.1 && t < ev('B1', 'drop') + 0.6;
  if (!hug) for (let i = 0; i < n; i++) { c.fillStyle = i % 2 ? '#FFFDF8' : '#F1EDE2'; c.save(); c.translate(80 + Math.sin(i * 1.7) * 10, DESK - 18 - i * 52); c.rotate(Math.sin(i * 2.3) * 0.04); c.fillRect(-120, -26, 240, 52); c.strokeStyle = '#C9C3B4'; c.lineWidth = 3; c.strokeRect(-120, -26, 240, 52); c.restore(); }
  hourglass(c, 310, DESK, t, L);
  droppedSheet(c, t, L); }

// ---------------- characters
const stageAt = (t, L) => L === 'C2' && t > ev('C2', 'stage') - 0.05;
const standing = (t, L) => L === 'C2' && t > ev('C2', 'stand');
const wFeetY = (t, L) => stageAt(t, L) ? 0 : standing(t, L) ? lerp(HF, 0, eOut(P(t, ev('C2', 'stand'), ev('C2', 'stand') + 0.35))) : HF;
function gest(st, g, who, t, side, base) { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } }
const hang = (g, s) => reach(g, s, s * g.sw * 0.8, g.ySh + 330);
const KBX = -240 - WX;                                     // keyboard centre relative to his feet
const kb = (side) => reach(G.worker, side, KBX + side * 110, DESK - HF - 50);
const typing = (st, t, fast = 18) => { const u = t * fast, g = G.worker; st.armL = reach(g, -1, KBX - 110 + Math.sin(u) * 20, DESK - HF - 50 - Math.max(0, Math.sin(u)) * 40); st.armR = reach(g, 1, KBX + 110 + Math.sin(u + 2) * 20, DESK - HF - 50 - Math.max(0, Math.sin(u + 2)) * 40); };
function workerState(t, L) { const g = G.worker, e = k => ev(L, k), st = { t, talk: talk('worker', t), mood: 'neutral', turn: 0.3, look: 0.7, armL: kb(-1), armR: kb(1), items: {} };
  if (L === 'hook') { st.turn = -0.4; st.look = -0.9; st.mood = 'happy'; st.armR = reach(g, 1, -160, DESK - HF - 40);   // gaming, hand on the mouse
    if (t > 0.3 && t < hev('close')) { st.mood = 'shock'; st.turn = 0.5; st.look = 1; }
    if (t > hev('close') - 0.05) { typing(st, t, 26); st.mood = 'worried'; st.turn = -0.3; st.look = -0.8; }
    if (speaking('hook_w', t, 0.05, 0.3)) { st.mood = 'happy'; st.laugh = true; st.turn = 0.4; st.look = 0.9; } }
  if (L === 'A1') { typing(st, t); if (speaking('a1_w', t, 0.05, 0.2) || speaking('a1_w2', t, 0.05, 0.2)) { st.mood = 'happy'; st.laugh = true; }
    if (t > e('shuffle') - 0.05) { const s = Math.sin((t - e('shuffle')) * 9); st.items = { R: paperItem }; st.armR = reach(g, 1, lerp(-200, 260, (s + 1) / 2), DESK - HF - 120); st.armL = reach(g, -1, lerp(-260, 120, (s + 1) / 2), DESK - HF - 100); st.mood = 'smug'; st.turn = 0; st.look = 0; } }
  if (L === 'A2') { typing(st, t); if (t > e('back') - 0.1 && t < e('leave')) { st.armL = kb(-1); st.armR = kb(1); }
    if (speaking('a2_w', t, 0.05, 0.3) || speaking('a2_w2', t, 0.05, 0.3)) { st.mood = 'worried'; gest(st, g, 'worker', t, -1, 120); }
    if (t > e('sigh') - 0.05) { st.mood = 'happy'; st.turn = 0; st.look = 0; st.armL = kb(-1); st.armR = reach(g, 1, g.sw * 1.8, DESK - HF - 120); } }
  if (L === 'B1') { if (speaking('b1_w', t, 0.05, 0.3)) { st.mood = 'smug'; st.armR = reach(g, 1, g.sw * 1.5, DESK - HF - 340, { planar: true }); }
    if (t > e('hug') - 0.1 && t < e('drop') + 0.6) { st.items = { L: paperItem, R: paperItem }; st.armL = reach(g, -1, -g.sw * 0.4, g.ySh + 160); st.armR = reach(g, 1, g.sw * 0.4, g.ySh + 170); st.mood = 'worried'; }
    if (t > e('drop')) { st.mood = 'shock'; st.lookY = 0.4; }
    if (t > e('notice')) { st.mood = 'worried'; st.laugh = true; st.lookY = 0; } }
  if (L === 'B2') { if (speaking('b2_w', t, 0.05, 0.3)) { st.mood = 'smug'; st.armR = reach(g, 1, -200, DESK - HF - 40); }
    if (speaking('b2_w2', t, 0.05, 0.3)) { st.mood = 'smug'; st.armL = reach(g, -1, -g.sw * 0.9, g.ySh + 40); st.armR = reach(g, 1, g.sw * 1.6, DESK - HF - 300, { planar: true }); }
    if (t > e('mouse') - 0.05) { st.mood = 'worried'; st.turn = 0.5; st.look = 0.9; st.armL = kb(-1); st.armR = kb(1); } }
  if (L === 'C1') { st.mood = 'worried'; st.turn = 0.4; st.look = 0.9; if (t > e('scroll') && t < SP.c1_w.t) { st.turn = -0.3; st.look = -0.9; st.mood = 'shock'; }
    if (speaking('c1_w', t, 0.05, 0.3) || speaking('c1_w2', t, 0.05, 0.3)) { st.mood = 'smug'; gest(st, g, 'worker', t, -1, 60); }
    if (t > e('stare') - 0.05) { st.mood = 'smug'; st.laugh = true; } }
  if (L === 'C2') { st.mood = 'worried'; st.turn = 0.4; st.look = 0.9;
    if (t > e('stand') - 0.05) { st.mood = 'smug'; st.armL = hang(g, -1); st.armR = hang(g, 1); }
    if (speaking('c2_w', t, 0.05, 0.2)) { st.mood = 'smug'; gest(st, g, 'worker', t, 1, 100); st.armL = reach(g, -1, -g.sw * 0.9, g.ySh + 60); }
    if (t > e('think') - 0.05) { st.mood = 'neutral'; st.blink = 0; }
    if (t > e('hope') - 0.05) { st.mood = 'happy'; st.laugh = true; st.armL = reach(g, -1, -g.sw * 0.5, g.ySh + 120, { fist: true }); st.armR = reach(g, 1, g.sw * 0.5, g.ySh + 120, { fist: true }); }
    if (stageAt(t, L)) { st.items = { R: micItem }; st.armR = reach(g, 1, g.hw * 0.6, g.headY + g.hh * 0.9); st.armL = hang(g, -1); st.mood = 'shock'; st.turn = 0.1; st.look = 0.2; st.blink = 1;
      if (t > e('clap')) { st.mood = 'worried'; st.laugh = true; } if (speaking('c2_w3', t, 0.05, 0.6)) { st.mood = 'sad'; st.laugh = false; st.turn = 0; st.look = 0; } } }
  return st; }
function bossX(t, L) { if (L === 'hook') return lerp(BX + 900, BX, eOut(P(t, 0.25, 1.4)));
  if (L === 'A2') { const b = ev('A2', 'back'), l = ev('A2', 'leave'); return lerp(BX + 1300, BX, eOut(P(t, b - 0.6, b + 0.1))) + 1300 * eIn(P(t, l, l + 0.7)); }
  return stageAt(t, L) ? SBX : BX; }
const bossWalking = (t, L) => (L === 'hook' && t > 0.25 && t < 1.4) || (L === 'A2' && ((t > ev('A2', 'back') - 0.6 && t < ev('A2', 'back') + 0.1) || t > ev('A2', 'leave')));
function bossState(t, L) { const g = G.boss, e = k => ev(L, k), st = { t, talk: talk('boss', t), mood: 'neutral', turn: -0.35, look: -0.8, armL: hang(g, -1), armR: hang(g, 1) };
  gest(st, g, 'boss', t, -1, 140);
  if (bossWalking(t, L)) { st.legPose = 'walk'; st.t = t * 1.2; }
  if (L === 'hook') { st.mood = 'skeptical'; if (t > hev('mon')) { st.lookY = 0.3; st.turn = -0.6; st.look = -1; } }
  if (L === 'A1') { st.mood = 'skeptical'; if (t > e('nod') - 0.05) { st.mood = 'neutral'; st.tilt = Math.sin(P(t, e('nod'), e('nod') + 0.6) * TAU * 2) * 0.05; } }
  if (L === 'A2') { st.mood = 'happy'; if (speaking('a2_b', t, 0.05, 0.2)) st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 120, { planar: true }); if (t > e('leave')) { st.turn = 0.6; st.look = 1; } }
  if (L === 'B1') { st.mood = 'surprised'; if (t > e('pile') - 0.05 && t < SP.b1_w.t) st.armL = reach(g, -1, -g.sw * 2.1, g.ySh - 200, { planar: true }); if (speaking('b1_b2', t, 0.05, 0.3)) { st.mood = 'happy'; st.armL = reach(g, -1, -g.sw * 1.8, g.ySh + 20, { planar: true }); }
    if (t > e('notice') - 0.05) { st.mood = 'skeptical'; st.lookY = 0.6; st.turn = -0.2; st.look = -0.4; } }
  if (L === 'B2') { st.mood = 'neutral'; if (speaking('b2_b2', t, 0.05, 0.4)) { st.mood = 'surprised'; st.blink = 0; }
    if (t > e('mouse') - 0.05) { st.mood = 'smug'; st.armL = reach(g, -1, -g.sw * 2.4, DESK + 20, { planar: true }); } }
  if (L === 'C1') { st.mood = 'skeptical'; st.armL = reach(g, -1, -g.sw * 2.4, DESK + 20, { planar: true }); st.lookY = 0.3;
    if (speaking('c1_b2', t, 0.05, 0.3)) { st.mood = 'annoyed'; st.lookY = 0; st.armL = hang(g, -1); }
    if (t > e('stare') - 0.05) { st.mood = 'annoyed'; st.lookY = 0; st.armL = hang(g, -1); st.blink = 0; } }
  if (L === 'C2') { st.mood = 'annoyed';
    if (t > e('arms') - 0.05) { st.armL = reach(g, -1, g.sw * 0.55, g.ySh + 230); st.armR = reach(g, 1, -g.sw * 0.55, g.ySh + 250); }
    if (t > e('think') - 0.05) { st.mood = 'neutral'; st.armR = reach(g, 1, g.hw * 0.5, g.headY + g.hh * 0.8); st.lookY = -0.3; }
    if (t > SP.c2_b3.t - 0.1) { st.mood = 'smug'; st.armR = hang(g, 1); st.lookY = 0; st.armL = hang(g, -1); }
    if (speaking('c2_b4', t, 0.05, 0.4)) { st.mood = 'smug'; st.armL = reach(g, -1, -g.sw * 1.4, g.ySh - 60, { planar: true }); }
    if (stageAt(t, L)) { st.mood = 'happy'; st.turn = -0.3; st.look = -0.6; st.armL = reach(g, -1, -g.sw * 1.7, g.ySh - 320, { planar: true }); st.armR = hang(g, 1);
      if (t > e('clap')) { st.armL = reach(g, -1, -g.sw * 0.3, g.ySh + 20 + Math.abs(Math.sin(t * 14)) * 40); st.armR = reach(g, 1, g.sw * 0.3, g.ySh + 20 + Math.abs(Math.sin(t * 14)) * 40); st.laugh = true; } } }
  return st; }

// ---------------- the world + which characters a shot draws (clean singles: only the tagged character)
const DRAW = { wide: ['worker', 'boss'], card: ['worker', 'boss'], two: ['worker', 'boss'], worker: ['worker'], boss: ['boss'], cover: ['worker'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  if (stageAt(t, L)) { c.drawImage(BGS, BX0, BY0, BW, BH); stageScreen(c, t); K.mark(c, 'screen', 0, -1980, 800);
    if (who.includes('boss')) heads.boss = K.put(c, BOSS, bossState(t, L), SBX, 0);
    if (who.includes('worker')) heads.worker = K.put(c, WORKER, workerState(t, L), STX, 0);
    audience(c, t); }
  else { c.drawImage(BGB, BX0, BY0, BW, BH);
    if (who.includes('boss') && (L !== 'A2' || (t > ev('A2', 'back') - 0.7 && t < ev('A2', 'leave') + 0.8)) && (L !== 'hook' || t > 0.25)) heads.boss = K.put(c, BOSS, bossState(t, L), bossX(t, L), 0);
    if (who.includes('worker')) heads.worker = K.put(c, WORKER, workerState(t, L), WX, wFeetY(t, L));
    desk(c, t, L); }
  if (!heads.boss) heads.boss = OFF; if (!heads.worker) heads.worker = OFFL;
  return heads; }

// ---------------- shots (world coordinates; face of a single at ~900 px)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const wHY = HF + G.worker.headY, wHYs = G.worker.headY, bHY = G.boss.headY;
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const SH = { COVER: S(-450, fy(wHY, 0.85, 1080), 0.85, 'cover'), W_LOW: S(WX - 60, fy(wHY, 1.0, 1200), 1.0, 'worker'), B_LOW: S(BX, fy(bHY, 1.0, 1200), 1.0, 'boss'), WIDE: S(0, -780, 0.6, 'wide'), CARD: S(60, fy(bHY, 0.66, 980), 0.66, 'card'), TWO: S(60, fy(bHY, 0.75, 820), 0.75, 'two'),
  W: S(WX - 60, fy(wHY, 1.0), 1.0, 'worker'), W_R: S(WX - 60, fy(wHY, 1.0, 1120), 1.0, 'worker'), W_CU: S(WX, fy(wHY, 1.6, 960), 1.6, 'worker'), W_DESK: S(-420, fy(wHY, 0.8, 760), 0.8, 'worker'),
  W_UP: S(WX, fy(wHYs, 1.0), 1.0, 'worker'),
  B: S(BX, fy(bHY, 1.0), 1.0, 'boss'), B_R: S(BX, fy(bHY, 1.0, 1120), 1.0, 'boss'), B_CU: S(BX, fy(bHY, 1.6, 960), 1.6, 'boss'),
  ST_WIDE: S(0, -1100, 0.45, 'wide'), ST_W: S(STX, fy(wHYs, 1.0), 1.0, 'worker'), ST_B: S(SBX, fy(bHY, 1.0), 1.0, 'boss'), ST_TWO: S(60, fy(bHY, 0.7, 1050), 0.7, 'two'),
  MON: U('monitor', 1), TODO: U('todo', 2), GLASS: U('glass', 3), BLACK: U('black', 4) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  const sp = id => speaking(id, t, 0.1, 0.15);
  if (L === 'hook') { if (t < 0.3) return SH.COVER; if (t < hev('close') - 0.05) return f(SH.W_CU); if (t < SP.hook_b.t - 0.1) return f(SH.W_DESK); if (sp('hook_b')) return f(SH.B_LOW); if (t < hev('mon') - 0.05) return f(SH.W_LOW); return f(SH.MON); }
  const u = t - sc.s, l = L.toLowerCase(), nar = SP[l + '_nar'];
  if (u < 1.15) return f(SH.WIDE);
  if (L === 'C2' && t > e('black') - 0.03 && t < nar.t + 0.05) return f(SH.BLACK);
  if (nar && t >= nar.t - 0.1) return f(stageAt(t, L) ? SH.ST_TWO : SH.CARD);
  if (L === 'A1' && t > e('nod') - 0.05) return f(t < e('shuffle') - 0.05 ? SH.B_R : SH.W_DESK);
  if (L === 'A2') { if (t > e('back') - 0.6 && t < SP.a2_b.t - 0.1) return f(SH.WIDE); if (t > e('leave') - 0.05 && t < e('sigh') - 0.05) return f(SH.WIDE); if (t > e('sigh') - 0.05 && t < e('flip') - 0.05) return f(SH.W); if (t > e('flip') - 0.05) return f(SH.GLASS); }
  if (L === 'B1') { if (t > e('pile') - 0.05 && t < SP.b1_w.t - 0.1) return f(SH.WIDE); if (t > endOf('b1_w2') + 0.1 && t < e('todo') - 0.05) return f(SH.WIDE); if (t > e('todo') - 0.05 && t < e('notice') - 0.05) return f(SH.TODO); if (t > e('notice') - 0.05) return f(SH.B_R); }
  if (L === 'B2') { if (t > e('open') - 0.05 && t < SP.b2_w2.t - 0.1) return f(t < e('report') - 0.05 ? SH.W_DESK : sp('b2_b2') ? SH.B_CU : SH.MON); if (t > e('mouse') - 0.05) return f(t < e('sweat') - 0.05 ? SH.WIDE : SH.W_CU); }
  if (L === 'C1') { if (t > e('scroll') - 0.05 && t < SP.c1_b.t - 0.1) return f(SH.MON); if (t > e('stare') - 0.05) return f(SH.B_CU); }
  if (L === 'C2') { if (stageAt(t, L)) { if (t < SP.c2_b5.t - 0.1) return f(SH.ST_WIDE); if (sp('c2_b5')) return f(SH.ST_B); if (t < SP.c2_w3.t - 0.1) return f(SH.ST_WIDE); return f(SH.ST_W); }
    if (t > e('stand') - 0.05 && t < SP.c2_w.t - 0.1) return f(SH.WIDE);
    if (sp('c2_w')) { const p = SP.c2_w, w = p.words, a = w && w.length > 12 ? p.t + w[12][1] : p.t + p.d * 0.5; return f(t < a ? SH.W_UP : t < endOf('c2_w') - 1.2 ? SH.B_R : SH.W_UP); }
    if (t > e('think') - 0.05 && t < SP.c2_b2.t - 0.1) return f(SH.B_CU); if (sp('c2_w2')) return f(SH.W_UP); }
  const cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.1 && t < s.t + s.d + 0.25);
  const single = who => who === 'worker' ? (standing(t, L) ? SH.W_UP : SH.W) : SH.B;
  if (cur) return f(single(cur.who));
  const next = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.6 && t < s.t);
  if (next) return f(single(next.who));
  return SH.TWO; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- full-screen inserts
function backdrop(c, id) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, '#2B3040'); g.addColorStop(1, '#171A24'); c.fillStyle = g; c.fillRect(0, 0, W, HH); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id }); }
function caption(c, s, k = 1, y = 1530, col = C.pinkL) { if (k <= 0) return; c.save(); c.globalAlpha = k; UI.textFit(c, 'Nun9', 46, s, 960); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, s, 540, y, col, C.oliveD, 10); c.restore(); }
function monitorView(c, t, L) { backdrop(c, 'monitor'); const y0 = 650; c.fillStyle = '#2B2F3A'; rr(c, 40, y0, 1000, 720, 34); c.fill(); c.fillStyle = '#5A606E'; c.fillRect(500, y0 + 720, 80, 90); rr(c, 360, y0 + 800, 360, 34, 12); c.fill();
  c.save(); c.translate(70, y0 + 30); c.beginPath(); c.rect(0, 0, 940, 640); c.clip(); screenContent(c, 940, 640, t, L); c.restore();
  const m = screenMode(t, L); if (L !== 'hook') caption(c, m === 'report' ? '«ОТЧЁТ ПО ПРОЕКТУ — 200 СТРАНИЦ»' : m === 'scroll' ? '«Я РАБОТАЮ» × 200 СТРАНИЦ' : '«Я РАБОТАЮ. Я РАБОТАЮ. Я РАБОТАЮ.»', 1, 1580); }
function todoView(c, t) { backdrop(c, 'todo'); const a = ev('B1', 'todo'), k = eBack(P(t, a, a + 0.3), 1.6); c.save(); c.translate(540, 900); c.rotate(-0.05); c.scale(k, k);
  c.fillStyle = '#FFF4B8'; c.fillRect(-380, -480, 760, 900); c.fillStyle = 'rgba(0,0,0,.08)'; for (let i = 0; i < 9; i++) c.fillRect(-380, -330 + i * 90, 760, 4);
  fitTxt(c, 'TO-DO LIST:', -320, -400, 64, '#E0474C', 620, 'Unb9', 'left');
  ['1. LOOK BUSY', '2. DRINK COFFEE', '3. LOOK BUSIER'].forEach((s, i) => { const kk = clamp(P(t, a + 0.3 + i * 0.35, a + 0.5 + i * 0.35)); c.globalAlpha = kk; fitTxt(c, s, -320, -220 + i * 170, 78, '#2B2F3A', 660, 'Cav7', 'left'); c.globalAlpha = 1; });
  c.restore(); const kc = clamp(P(t, a + 1.2, a + 1.4)); caption(c, '«1. ВЫГЛЯДЕТЬ ЗАНЯТЫМ  2. ПИТЬ КОФЕ', kc, 1470); caption(c, '3. ВЫГЛЯДЕТЬ ЕЩЁ ЗАНЯТЕЕ»', kc, 1545); }
function glassView(c, t) { backdrop(c, 'glass'); const a = ev('A2', 'flip'); c.save(); c.translate(540, 860); c.scale(3.2, 3.2); hourglass(c, 0, 110, Math.max(t, a + 0.4), 'B1'); c.restore();
  const k = eBack(P(t, a + 0.15, a + 0.45), 2); if (k > 0) { c.save(); c.translate(540, 1300); c.rotate(-0.04); c.scale(k, k); c.fillStyle = '#4CAF6A'; rr(c, -330, -70, 660, 140, 30); c.fill(); fitTxt(c, 'BREAK TIME', 0, 4, 76, '#FFFFFF', 600); c.restore(); }
  caption(c, '«ВРЕМЯ ПЕРЕРЫВА»', clamp(P(t, a + 0.4, a + 0.6)), 1500); }

// ---------------- cover badge + frame
function coverBadge(c, t) { const p = 1 + 0.04 * Math.sin(t * 8); c.save(); c.translate(540, 1620); c.scale(p, p); c.rotate(-0.03); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -330 + 6, -62 + 10, 660, 124, 62); c.fill(); c.fillStyle = '#FFE15A'; rr(c, -330, -62, 660, 124, 62); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; rr(c, -330, -62, 660, 124, 62); c.stroke();
  fitTxt(c, 'VERY BUSY!', 0, 4, 62, '#E0474C', 600); c.restore(); }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { K.outro(c, t, { q: ['А ТЫ ДЕЛАЛ(А) ВИД,', 'ЧТО ЗАНЯТ(А)?'], rows: [['A2', 'I have a lot to do.'], ['B1', "They're not quite ready yet."], ['C1', 'Would you care to explain?'], ['C2', 'I would argue that…']], cta: ['ОТПРАВЬ КОЛЛЕГЕ', 'С ОТЧЁТОМ'], heroX: 190, heroS: 0.42,
    hero: (cc, tt) => { const g = G.worker, gb = G.boss; K.put(cc, BOSS, { t: tt, mood: 'smug', turn: -0.2, look: -0.4, armL: hang(gb, -1), armR: reach(gb, 1, gb.sw * 2.0, gb.ySh - 330 + Math.sin(tt * 8) * 30, { planar: true }) }, 1500, 60);
      K.put(cc, WORKER, { t: tt, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(tt * 8) * 30, { planar: true }), armR: hang(g, 1), items: { R: paperItem } }, 0, 0); } });
    Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag === 'ui:black') { c.fillStyle = '#000000'; c.fillRect(0, 0, W, HH); UI.watermark(c); return; }
  if (tag.startsWith('ui:')) { c.save(); c.translate(sh.x, sh.y); const v = tag.slice(3);
    if (v === 'monitor') monitorView(c, t, L); else if (v === 'todo') todoView(c, t); else if (v === 'glass') glassView(c, t);
    c.restore(); heads = { worker: OFFL, boss: OFF }; proj = p => p; }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26); }
  const hp = who => heads[who] && Math.abs(heads[who].x) < 1e4 ? { ...proj(heads[who]), hh: heads[who].hh * cam.z } : null;
  const names = { boss: ['BOSS', '#2F3E5C'] };
  if (L === 'hook') { if (tag === 'cover') coverBadge(c, t); if (t > 0.3 && t < hev('close')) K.pop(c, t, 'ТОП-ТОП-ТОП', 0.35, hev('close') - 0.1, 540, 1250, C.gold, -0.06, 80);
    const hookProj = p => { const q = proj(p); return q.x < 0 || q.x > W ? { x: q.x < 0 ? 60 : W - 60, y: 1050 } : q; };
    K.bubbles(c, t, { id: 'hook' }, heads, hookProj, { heroine: 'worker', names, hold: { hook_b: 0.2, hook_w: 0.05 } }); K.titleRibbon(c, t, 540, 455); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); UI.captions(c, t);
    Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  const e = k => ev(L, k), narT = (SP[L.toLowerCase() + '_nar'] || { t: 1e9 }).t;
  if (L === 'A1' && t > e('shuffle')) K.pop(c, t, 'ШУРШ-ШУРШ', e('shuffle') + 0.1, narT - 0.3, 540, 1300, C.white, -0.06, 70);
  if (L === 'B2' && tag === 'worker' && t > e('sweat')) { const h = hp('worker'); if (h) { sweat(c, h, clamp(P(t, e('sweat'), e('sweat') + 0.3)), 1); sweat(c, { ...h, y: h.y + h.hh * 0.5 }, clamp(P(t, e('sweat') + 0.3, e('sweat') + 0.6)), -1); } }
  if (L === 'C1' && t > e('stare') && t < narT - 0.05) K.dots(c, t, e('stare') + 0.05, narT - 0.05, 1450);
  if (L === 'C2') { if (t > e('think') && t < SP.c2_b2.t - 0.05) K.dots(c, t, e('think') + 0.05, SP.c2_b2.t - 0.05, 1450);
    if (t > e('clap') && t < e('silent')) K.pop(c, t, 'АПЛОДИСМЕНТЫ!', e('clap') + 0.05, e('silent') - 0.1, 540, 1250, C.gold, -0.06, 76); }
  K.bubbles(c, t, sc, heads, proj, { heroine: 'worker', names, hold: { a1_w2: 0.4, b2_w: 0.05, b1_w2: 0.05, b2_b2: 0.3, b2_w2: 0.05, c1_w2: 0.5, c2_b4: 0.05, c2_w3: 0.5 } });
  K.hud(c, t, sc);
}
E.run('busy', NF, renderFrame);
