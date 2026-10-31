// "That was my idea: how to take credit back from a colleague" episode renderer (hard_cut camera): node idea.js start end out.mp4 | --png=f1,f2
// Meeting room: projector screen on the right wall, "star of the week" board on the left wall, the boss sits behind the table in the middle (applauds),
// Ryan (smug colleague) stands at the right, she stands at the left. Running gag: every level the boss gives Ryan another gold star (1,2,3,4,5...).
// C2: the boss has had her Tuesday email since 9:01; the stars fall off the board, Ryan walks out with a box. No black card anywhere.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/idea/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];

// ---------------- cast
const HER = { ...BASE.her_lift, top: { type: 'blazer', col: '#C2504A', shirt: '#F5EBDD', tie: null }, bottom: { type: 'trousers', col: '#3A4254' }, shoes: { col: '#2B2F3A', acc: null } };
const RYAN = { ...BASE.oliver, hair: { style: 'quiff', col: '#B8864A' }, top: { type: 'blazer', col: '#6E7F95', shirt: '#F7F9FC', tie: '#1FA7A0' }, bottom: { type: 'trousers', col: '#6E7F95' } };
const BOSS = { ...BASE.reggie, top: { type: 'blazer', col: '#3B3F4D', shirt: '#FFFFFF', tie: '#E6B422' } };
const G = { her: geom(HER), ryan: geom(RYAN), boss: geom(BOSS) };
const HX = -560, RX = 540, BXX = -40, BY = 330, CT = -760;     // her / Ryan feet x, boss x (sits: drawn BY lower, legs hidden by the table), table top
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- props + small drawings
const big = f => ctx => { ctx.scale(1.5, 1.5); f(ctx); };
const markerItem = ctx => { ctx.save(); ctx.rotate(0.5); ctx.fillStyle = '#1B1E26'; rr(ctx, -16, -150, 32, 150, 8); ctx.fill(); ctx.fillStyle = '#E0474C'; rr(ctx, -20, -170, 40, 44, 10); ctx.fill(); ctx.restore(); };
const boxItem = ctx => { ctx.save(); ctx.fillStyle = '#C79A5E'; rr(ctx, -150, -210, 300, 210, 10); ctx.fill(); ctx.strokeStyle = '#8A6232'; ctx.lineWidth = 7; ctx.stroke(); ctx.fillStyle = '#E3C292'; ctx.fillRect(-150, -210, 300, 46); ctx.fillStyle = '#8A6232'; ctx.fillRect(-26, -210, 52, 46);
  ctx.fillStyle = '#FFD21F'; for (const [x, y, r] of [[-70, -240, 26], [20, -262, 30], [90, -236, 24]]) star(ctx, x, y, r, '#FFD21F', 0.3); ctx.fillStyle = '#FFFDF8'; rr(ctx, -70, -150, 140, 70, 6); ctx.fill(); fitTxt(ctx, 'MY STUFF', 0, -114, 30, '#6A4A22', 124); ctx.restore(); };
const marker = big(markerItem), box = boxItem;
function heart(c, x, y, r, col) { c.fillStyle = col; c.beginPath(); c.moveTo(x, y + r * 0.9); c.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.7, y - r * 1.3, x, y - r * 0.4); c.bezierCurveTo(x + r * 0.7, y - r * 1.3, x + r * 1.6, y - r * 0.2, x, y + r * 0.9); c.fill(); }
function star(c, x, y, r, col, rot = 0, out = true) { c.beginPath(); for (let k = 0; k < 10; k++) { const a = rot + k * Math.PI / 5 - Math.PI / 2, r2 = k % 2 ? r * 0.45 : r; c.lineTo(x + Math.cos(a) * r2, y + Math.sin(a) * r2); } c.closePath(); c.fillStyle = col; c.fill(); if (out) { c.strokeStyle = '#B8860B'; c.lineWidth = Math.max(3, r * 0.1); c.lineJoin = 'round'; c.stroke(); } }
function bulb(c, x, y, r, a) { c.save(); c.globalAlpha = a; const g = c.createRadialGradient(x, y, r * 0.3, x, y, r * 2.2); g.addColorStop(0, 'rgba(255,240,120,.55)'); g.addColorStop(1, 'rgba(255,240,120,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r * 2.2, 0, TAU); c.fill();
  c.fillStyle = '#FFE15A'; c.strokeStyle = '#C79A1E'; c.lineWidth = 5; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.stroke(); c.fillStyle = '#9AA3B2'; rr(c, x - r * 0.45, y + r * 0.85, r * 0.9, r * 0.55, 6); c.fill(); c.restore(); }
function sweat(c, hd, k, side = 1) { if (k <= 0) return; const x = hd.x + side * hd.hh * 0.75, y = hd.y - hd.hh * 0.55 + (1 - k) * -20; c.save(); c.globalAlpha = k; c.fillStyle = '#8FD3F7'; c.strokeStyle = '#3C8FE0'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - 34); c.quadraticCurveTo(x + 22, y, x, y + 14); c.quadraticCurveTo(x - 22, y, x, y - 34); c.fill(); c.stroke(); c.restore(); }

// ---------------- meeting room (prerendered, softly blurred); table + screen + board are drawn live
const BX0 = -2200, BY0 = -3400, BW = 4400, BH = 4800, BS = 0.5;
const SCX0 = 150, SCX1 = 1050, SCY0 = -2400, SCY1 = -1800;      // projector screen
const BDX0 = -1000, BDX1 = -420, BDY0 = -2400, BDY1 = -1800;    // star board
function drawRoom(c) {
  c.fillStyle = '#DDE5EC'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = '#B8C7D6'; c.fillRect(BX0, -1250, BW, 990); c.strokeStyle = 'rgba(0,0,0,.07)'; c.lineWidth = 5; for (let x = BX0; x < BX0 + BW; x += 260) { c.beginPath(); c.moveTo(x, -1250); c.lineTo(x, -260); c.stroke(); }
  c.fillStyle = '#7F8EA1'; c.fillRect(BX0, -1262, BW, 24);                                   // wall stripe
  c.fillStyle = '#2B3A55'; rr(c, -250, -2640, 1000, 130, 22); c.fill(); fitTxt(c, 'MEETING ROOM 3', 250, -2575, 80, '#F2C14E', 900);
  c.fillStyle = '#8FC8F0'; rr(c, 1250, -2350, 760, 1050, 22); c.fill(); c.fillStyle = '#CFEAFB'; c.fillRect(1280, -2320, 700, 560); c.fillStyle = '#9ED7A0'; c.fillRect(1280, -1760, 700, 430); c.strokeStyle = '#FFFDF8'; c.lineWidth = 22; c.strokeRect(1250, -2350, 760, 1050); c.beginPath(); c.moveTo(1630, -2350); c.lineTo(1630, -1300); c.stroke();
  c.fillStyle = '#A9B4C2'; c.fillRect(BX0, -260, BW, 1700); c.fillStyle = 'rgba(0,0,0,.06)'; for (let y = -260; y < 1400; y += 160) for (let x = BX0 + ((y / 160) % 2) * 160; x < BX0 + BW; x += 320) c.fillRect(x, y, 160, 160);
  c.fillStyle = '#F2C14E'; c.fillRect(BX0, 120, BW, 30);
  for (const px of [-1700, -1520]) { c.fillStyle = '#B5684A'; rr(c, px - 70, -520, 140, 200, 14); c.fill(); c.fillStyle = '#4C9A5A'; for (const [x, y, r] of [[-30, -620, 70], [40, -660, 80], [0, -740, 70], [-60, -700, 50]]) { c.beginPath(); c.arc(px + x, y, r, 0, TAU); c.fill(); } }
  c.fillStyle = '#FFFDF8'; c.strokeStyle = '#2B3A55'; c.lineWidth = 12; c.beginPath(); c.arc(-250, -2000, 150, 0, TAU); c.fill(); c.stroke();       // wall clock (9:01)
  c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(-250, -2000); c.lineTo(-250, -2105); c.stroke(); c.beginPath(); c.moveTo(-250, -2000); c.lineTo(-230, -1985); c.stroke(); c.fillStyle = '#2B3A55'; c.beginPath(); c.arc(-250, -2000, 12, 0, TAU); c.fill();
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };   // drawn sharp, blurred once
const BGK = mkBG(drawRoom);

// ---------------- running gag: gold stars on Ryan's board
const LORD = ['A1', 'A2', 'B1', 'B2', 'C1'];
const slotXY = k => [(BDX0 + BDX1) / 2 + (k % 3 - 1) * 175, -2130 + Math.floor(k / 3) * 165 + (k > 2 ? 0 : 0)];
function starsAt(t) { const out = { landed: [], fly: [] };
  LORD.forEach((L, k) => { const ts = ev(L, 'star'); if (ts > 1e8) return; if (t >= ts + 0.6) out.landed.push(k); else if (t >= ts) out.fly.push([k, (t - ts) / 0.6]); }); return out; }
function board(c, t) {
  c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, BDX0 + 12, BDY0 + 16, BDX1 - BDX0, BDY1 - BDY0, 26); c.fill(); c.fillStyle = '#A8764A'; rr(c, BDX0, BDY0, BDX1 - BDX0, BDY1 - BDY0, 26); c.fill(); c.fillStyle = '#F4E7CE'; rr(c, BDX0 + 24, BDY0 + 24, BDX1 - BDX0 - 48, BDY1 - BDY0 - 48, 14); c.fill();
  const cx = (BDX0 + BDX1) / 2; fitTxt(c, 'STAR OF THE WEEK', cx, BDY0 + 90, 56, '#7A4E22', 480); c.fillStyle = '#2A7FB8'; rr(c, cx - 150, BDY0 + 135, 300, 80, 14); c.fill(); fitTxt(c, 'RYAN', cx, BDY0 + 177, 56, '#FFFFFF', 260);
  const st = starsAt(t), fallT = ev('C2', 'fall');
  for (let k = 0; k < 9; k++) { const [x, y] = slotXY(k); star(c, x, y, 62, 'rgba(120,90,50,.10)', 0, false); }
  for (const k of st.landed) { const [x, y] = slotXY(k), L = LORD[k], u = t - ev(L, 'star') - 0.6;
    if (t >= fallT) { const f = t - fallT, vx = (hash(k * 7 + 1) - 0.5) * 520, vy = -200 - hash(k * 5 + 2) * 150; const px = x + vx * f, py = y + vy * f + 1900 * f * f; if (py < 1200) star(c, px, py, 62, '#FFD21F', f * (3 + k)); }
    else { const s = 1 + 0.35 * Math.max(0, 1 - u / 0.35) * Math.sin(u * 28 + 1.2); star(c, x, y, 62 * s, '#FFD21F', 0); if (u < 0.5) { c.strokeStyle = 'rgba(255,225,90,' + (1 - u / 0.5) + ')'; c.lineWidth = 8; c.beginPath(); c.arc(x, y, 62 + u * 220, 0, TAU); c.stroke(); } } }
  const n = t >= fallT ? 0 : st.landed.length; fitTxt(c, '×' + n, cx + 150, BDY1 - 95, 90, n ? '#C79A1E' : '#9AA3B2', 200);
  return st; }
function flyingStars(c, t, st, from) { for (const [k, u] of st.fly) { const [x1, y1] = slotXY(k), e = eIO(clamp(u)); const x = lerp(from.x, x1, e), y = lerp(from.y, y1, e) - Math.sin(Math.PI * e) * 380; star(c, x, y, lerp(95, 62, e), '#FFD21F', u * 12); } }

// ---------------- projector screen (live content per level)
function screen(c, t, L) {
  c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, SCX0 + 10, SCY0 + 14, SCX1 - SCX0, SCY1 - SCY0, 18); c.fill(); c.fillStyle = '#2B2F3A'; rr(c, SCX0 - 22, SCY0 - 22, SCX1 - SCX0 + 44, SCY1 - SCY0 + 44, 20); c.fill();
  c.save(); c.beginPath(); c.rect(SCX0, SCY0, SCX1 - SCX0, SCY1 - SCY0); c.clip(); const cx = (SCX0 + SCX1) / 2, w = SCX1 - SCX0, h = SCY1 - SCY0;
  let mode = 'title'; if (L === 'A2' && t >= ev('A2', 'clock')) mode = 'clock'; if (L === 'B1') mode = t >= ev('B1', 'mark') - 0.1 ? 'marked' : 'draft'; if (L === 'C2' && t >= ev('C2', 'mail')) mode = 'mail';
  const g = c.createLinearGradient(0, SCY0, 0, SCY1); g.addColorStop(0, '#2A55A8'); g.addColorStop(1, '#173A7A'); c.fillStyle = mode === 'mail' ? '#EEF2F7' : g; c.fillRect(SCX0, SCY0, w, h);
  if (mode === 'title') { const p = 0.5 + 0.5 * Math.sin(t * 4); bulb(c, cx, SCY0 + 190, 85, 0.9 + 0.1 * p); fitTxt(c, 'THE BIG IDEA', cx, SCY0 + 405, 112, '#FFFDF8', w - 80); fitTxt(c, 'by RYAN', cx, SCY0 + 520, 74, '#FFE15A', w - 200); }
  if (mode === 'clock') { const u = t - ev('A2', 'clock'), k = eBack(clamp(u / 0.3), 1.8); c.save(); c.translate(cx, SCY0 + 270); c.scale(k, k); c.fillStyle = '#10151F'; rr(c, -330, -140, 660, 280, 26); c.fill(); c.strokeStyle = '#FFE15A'; c.lineWidth = 8; rr(c, -330, -140, 660, 280, 26); c.stroke(); fitTxt(c, '9:01', 0, 6, 210, '#7CF29A', 600); c.restore();
    const k2 = eBack(clamp((u - 0.35) / 0.3), 2); c.save(); c.translate(cx, SCY0 + 520); c.rotate(-0.05); c.scale(k2, k2); fitTxt(c, 'ANNA ARRIVED FIRST!', 0, 0, 62, '#FFE15A', w - 80); c.restore(); }
  if (mode === 'draft' || mode === 'marked') { fitTxt(c, 'IDEA BY:', cx, SCY0 + 190, 100, '#FFFDF8', w - 80); fitTxt(c, 'ANNA', cx, SCY0 + 370, 170, '#FFE15A', w - 160);
    if (mode === 'marked') { const u = t - ev('B1', 'mark'), sw = eOut(clamp(u / 0.8)), x0 = cx - 300; c.fillStyle = '#0B0B0F'; c.save(); c.translate(0, 0); for (let r = 0; r < 3; r++) { c.beginPath(); const yy = SCY0 + 335 + r * 36; c.moveTo(x0, yy); c.lineTo(x0 + 600 * sw, yy + (r % 2 ? 4 : -4)); c.lineWidth = 46; c.lineCap = 'round'; c.strokeStyle = '#0B0B0F'; c.stroke(); } c.restore();
      const k = eBack(clamp((u - 0.85) / 0.3), 2); if (k > 0) { c.save(); c.translate(cx, SCY0 + 520); c.rotate(-0.06); c.scale(k, k); fitTxt(c, 'RYAN', 0, 0, 130, '#FF7A59', w - 200); c.restore(); } } }
  if (mode === 'mail') { const u = t - ev('C2', 'mail'), k = eBack(clamp(u / 0.35), 1.6); c.save(); c.translate(cx, SCY0 + 300); c.scale(k, k);
    c.fillStyle = '#FFFFFF'; c.strokeStyle = '#B9C3D1'; c.lineWidth = 6; rr(c, -400, -250, 800, 500, 22); c.fill(); c.stroke(); c.fillStyle = '#2A55A8'; rr(c, -400, -250, 800, 80, 22); c.fill(); fitTxt(c, 'INBOX', -280, -210, 46, '#FFFFFF', 200);
    fitTxt(c, 'From: Anna', -360, -110, 56, '#2B2F3A', 560, 'Nun9', 'left'); fitTxt(c, 'Tuesday 9:01', -360, -30, 56, '#2A7F4A', 560, 'Nun9', 'left'); fitTxt(c, 'MY BIG IDEA', -360, 80, 82, '#C23C4A', 720, 'Unb9', 'left');
    const k2 = eBack(clamp((u - 0.7) / 0.3), 2.4); if (k2 > 0) { c.save(); c.translate(200, 170); c.rotate(-0.12); c.scale(k2, k2); c.strokeStyle = '#2E9E4A'; c.lineWidth = 8; rr(c, -150, -42, 300, 84, 14); c.stroke(); fitTxt(c, 'READ ✓✓', 0, 4, 52, '#2E9E4A', 260); c.restore(); } c.restore(); }
  c.restore(); }

// ---------------- table
function table(c) {
  paint(c, q => { q.m(-430, CT); q.l(370, CT); q.l(370, CT + 70); q.l(-430, CT + 70); q.z(); }, '#C99A63', { sd: 6, hd: 3, lw: 4 });
  paint(c, q => { q.m(-410, CT + 70); q.l(350, CT + 70); q.l(350, 700); q.l(-410, 700); q.z(); }, '#8A5F3A', { sd: 10, hd: 4, lw: 4 });
  c.fillStyle = '#FFFDF8'; rr(c, -330, CT - 22, 120, 22, 4); c.fill(); rr(c, 140, CT - 26, 130, 26, 4); c.fill(); c.fillStyle = '#2B3A55'; rr(c, -120, CT - 14, 140, 14, 4); c.fill(); }

// ---------------- characters
const gest = (st, g, who, t, side, base) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } };
const hang = (g, s) => reach(g, s, s * g.sw * 0.8, g.ySh + 330);
const chest = (g, s, k = 0.6) => reach(g, s, s * g.sw * k, g.ySh + 230);
const clapWin = t => { const wins = [[SP.hook_b.t - 0.1, SP.hook_b.t + 1.9]]; for (const [L, id] of [['A1', 'a1_b'], ['A2', 'a2_b'], ['B2', 'b2_b'], ['C1', 'c1_b']]) wins.push([SP[id].t - 0.1, SP[id].t + SP[id].d + 0.2]); wins.push([SP.b1_h2.t, SP.b1_h2.t + 1.6]); return wins.some(([a, b]) => t >= a && t < b); };
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { t, talk: talk('her', t), mood: 'neutral', turn: 0.3, look: 0.7, armL: hang(g, -1), armR: hang(g, 1), items: {} };
  if (L === 'hook') { st.mood = 'happy'; if (t > hev('panic') - 0.05) { st.mood = 'shock'; st.blink = 0; st.armL = chest(g, -1); st.armR = chest(g, 1); } }
  if (L === 'A1') { st.mood = 'neutral'; if (speaking('a1_h', t, 0.05, 0.3)) { st.mood = 'angry'; st.armR = reach(g, 1, g.sw * 2.0, g.ySh - 100 + Math.sin(t * 14) * 40, { planar: true }); st.armL = reach(g, -1, -g.sw * 2.0, g.ySh - 100 + Math.cos(t * 14) * 40, { planar: true }); } if (t > e('star') - 0.05) { st.mood = 'shock'; st.blink = 0; } if (speaking('a1_h2', t, 0.0, 0.3)) { st.mood = 'sad'; st.blink = 1; st.armL = hang(g, -1); st.armR = hang(g, 1); } }
  if (L === 'A2') { st.mood = 'smug'; if (speaking('a2_h', t, 0.05, 0.3)) { st.mood = 'happy'; gest(st, g, 'her', t, -1, 150); } if (t > e('clock') - 0.05) { st.mood = 'surprised'; st.blink = 0; } if (speaking('a2_h2', t, 0.0, 0.4)) { st.mood = 'worried'; st.blink = 0; st.armL = chest(g, -1, 0.3); st.armR = chest(g, 1, 0.3); } }
  if (L === 'B1') { st.mood = 'neutral'; if (speaking('b1_h', t, 0.05, 0.3)) { st.mood = 'smug'; gest(st, g, 'her', t, -1, 160); } if (t > SP.b1_r.t - 0.05) { st.mood = 'skeptical'; } if (t > e('mark') + 0.5) { st.mood = 'shock'; st.blink = 0; st.armL = chest(g, -1); st.armR = chest(g, 1); } }
  if (L === 'B2') { st.mood = 'neutral'; if (speaking('b2_h', t, 0.05, 0.3)) { st.mood = 'smug'; gest(st, g, 'her', t, -1, 150); } if (t > e('heart') - 0.05) { st.mood = 'skeptical'; } if (speaking('b2_h2', t, 0.0, 0.4)) { st.mood = 'angry'; st.blink = 0; st.armL = reach(g, -1, -g.sw * 1.2, g.ySh - 40, { planar: true }); st.armR = reach(g, 1, g.sw * 1.2, g.ySh - 40, { planar: true }); } }
  if (L === 'C1') { st.mood = 'neutral'; if (speaking('c1_h', t, 0.05, 0.3)) { st.mood = 'smug'; gest(st, g, 'her', t, -1, 160); } if (t > SP.c1_r.t) st.mood = 'skeptical'; if (speaking('c1_h2', t, 0.0, 0.5)) { st.mood = 'bored'; st.blink = 0.4; } }
  if (L === 'C2') { st.mood = 'happy'; st.turn = 0.4; st.look = 0.6;
    if (speaking('c2_h', t, 0.05, 0.1)) { st.mood = 'smug'; st.armL = chest(g, -1, 0.3); st.armR = chest(g, 1, 0.3); }
    if (t > endOf('c2_h') + 0.1) { st.mood = 'neutral'; st.blink = 0; }
    if (t > e('mail') - 0.05) { st.mood = 'smug'; st.blink = 0.5; }
    if (t > e('stare') - 0.05) { st.mood = 'happy'; st.blink = 0; st.armL = hang(g, -1); st.armR = hang(g, 1); }
    if (speaking('c2_h2', t, 0.05, 0.6)) { st.mood = 'smug'; st.laugh = true; st.blink = 1; st.armL = reach(g, -1, -g.sw * 1.3, g.ySh - 140, { planar: true }); st.armR = hang(g, 1); } }
  return st; }
const ryanX = t => { const tb = ev('C2', 'box'); return t < tb ? RX : RX + 1500 * eIn(clamp((t - tb) / 2.6)); };
function ryanState(t, L) { const g = G.ryan, e = k => ev(L, k), st = { t, talk: talk('ryan', t), mood: 'smug', turn: -0.35, look: -0.8, armL: hang(g, -1), armR: hang(g, 1), items: {}, headX: 0 };
  if (L === 'hook') { st.turn = -0.25; st.look = -0.5; st.armR = reach(g, 1, g.sw * 2.1, g.ySh - 380 + Math.sin(t * 5) * 30, { planar: true }); if (t > hev('panic') - 0.05) { st.mood = 'neutral'; st.armR = hang(g, 1); } }
  if (L === 'A1') { st.mood = 'smug'; if (t > e('star') - 0.05) { st.mood = 'happy'; st.laugh = true; st.armL = chest(g, -1, 0.5); st.armR = chest(g, 1, 0.5); } }
  if (L === 'A2') { st.mood = 'happy'; if (speaking('a2_r', t, 0.05, 0.3)) { st.laugh = true; gest(st, g, 'ryan', t, 1, 120); } if (t > e('star') - 0.05) { st.mood = 'smug'; st.armL = chest(g, -1, 0.5); st.armR = chest(g, 1, 0.5); } }
  if (L === 'B1') { st.mood = 'smug'; if (speaking('b1_r', t, 0.0, 0.3)) st.mood = 'neutral'; if (t > SP.b1_r.t) { st.armR = reach(g, 1, g.sw * 1.3, g.ySh - 520 + Math.sin(t * 9) * 25); st.items = { R: marker }; } if (t > e('mark') + 0.9) { st.mood = 'smug'; st.armR = reach(g, 1, g.sw * 0.7, g.ySh + 60); } }
  if (L === 'B2') { st.mood = 'happy'; if (speaking('b2_r', t, 0.0, 0.3)) { st.mood = 'happy'; st.armL = chest(g, -1, 0.3); st.armR = chest(g, 1, 0.3); } if (t > e('star') - 0.05) { st.laugh = true; } }
  if (L === 'C1') { st.mood = 'smug'; if (speaking('c1_r', t, 0.0, 0.3)) { st.mood = 'worried'; st.blink = 0; gest(st, g, 'ryan', t, 1, 160); } if (t > e('star') - 0.05) { st.mood = 'smug'; st.laugh = true; } }
  if (L === 'C2') { st.mood = 'smug';
    if (t > endOf('c2_h') - 0.5) { st.mood = 'worried'; st.blink = 0; }
    if (t > e('fall') - 0.05) { st.mood = 'sad'; st.blink = 1; st.armL = hang(g, -1); st.armR = hang(g, 1); }
    if (t > e('box') - 0.1) { st.mood = 'sad'; st.turn = 0.8; st.look = 0.9; st.items = { R: box }; st.armR = reach(g, 1, g.sw * 0.9, g.ySh + 250); st.armL = reach(g, -1, -g.sw * 0.3, g.ySh + 250); st.legPose = 'walk'; st.t = t * 1.2; } }
  return st; }
function bossState(t, L) { const g = G.boss, e = k => ev(L, k), st = { t, talk: talk('boss', t), mood: 'happy', turn: 0.0, look: 0.0, armL: hang(g, -1), armR: hang(g, 1), items: {}, headX: 0 };
  st.armL = chest(g, -1, 0.9); st.armR = chest(g, 1, 0.9);
  if (clapWin(t)) { st.laugh = true; const cph = 0.5 + 0.5 * Math.sin(t * 17); st.armL = chest(g, -1, 0.12 + 0.55 * cph); st.armR = chest(g, 1, 0.12 + 0.55 * cph); }
  if (L === 'hook') { st.turn = 0.2; st.look = 0.5; }
  if (L === 'B2' && t > e('heart') - 0.05) { st.mood = 'happy'; st.armL = chest(g, -1, 0.2); st.armR = chest(g, 1, 0.2); }
  if (L === 'C1' && speaking('c1_h', t, 0, 0.2)) st.mood = 'neutral';
  if (L === 'C2') { st.mood = 'happy'; st.armL = chest(g, -1, 0.9); st.armR = chest(g, 1, 0.9);
    if (t > endOf('c2_h') + 0.05) { st.mood = 'smug'; st.blink = 0.4; }
    if (t > e('mail') - 0.05) { st.mood = 'smug'; st.armL = chest(g, -1, 0.5); st.armR = chest(g, 1, 0.5); if (speaking('c2_b', t, 0, 0.2)) st.mood = 'neutral'; }
    if (t > e('fall') + 0.4) { st.mood = 'happy'; st.laugh = true; } }
  return st; }

// ---------------- world gags (drawn on top of the characters, in world space)
function worldGags(c, t, L, heads) {
  if (L === 'B2') { const t0 = ev('B2', 'heart'); if (t > t0 && heads.boss) { const u = t - t0, hd = heads.boss; for (let n = 0; n < 7; n++) { const ph = clamp(u * 0.75 - n * 0.1, 0, 1.2); if (ph <= 0 || ph > 1) continue; heart(c, hd.x - 230 + n * 80 + Math.sin(u * 4 + n) * 25, hd.y - hd.hh * 1.2 - ph * 700, 34 + (n % 3) * 8, n % 2 ? '#F0507A' : '#FF8FB0'); }
    for (const sd of [-1, 1]) { const ph = (u * 1.6 + (sd > 0 ? 0.4 : 0)) % 1; c.fillStyle = '#8FD3F7'; c.beginPath(); c.arc(hd.x + sd * hd.hh * 0.42, hd.y + hd.hh * 0.15 + ph * hd.hh * 0.9, 13, 0, TAU); c.fill(); } } }
  if (L === 'C1') { const t0 = ev('C1', 'bulbs'); if (t > t0) for (let n = 0; n < 11; n++) { const u = t - t0 - n * 0.14; if (u < 0 || u > 3.0) continue; const x = -900 + n * 185 + Math.sin(u * 2 + n) * 70, y = -250 - u * 520; bulb(c, x, y, 52 + (n % 3) * 10, clamp(1 - Math.max(0, u - 2.4) / 0.6)); } }
  if (L === 'C2' && heads.ryan && t > endOf('c2_h') + 0.3 && t < ev('C2', 'fall')) { const hd = heads.ryan; for (let n = 0; n < 2; n++) sweat(c, hd, clamp(((t * 1.3 + n * 0.5) % 1) * 3) * (1 - clamp(((t * 1.3 + n * 0.5) % 1) - 0.6) * 2.5), n ? -1 : 1); }
}

// ---------------- the world + which characters a shot draws (clean singles: only the tagged character)
const DRAW = { wide: ['her', 'ryan', 'boss'], card: ['her', 'ryan', 'boss'], two: ['her', 'ryan', 'boss'], scr: ['her', 'ryan', 'boss'], cover: ['her', 'ryan', 'boss'], her: ['her'], ryan: ['ryan'], boss: ['boss'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
const BOSSHAND = { x: BXX, y: CT - 120 };
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGK, BX0, BY0, BW, BH);
  screen(c, t, L); const st = board(c, t);
  if (who.includes('boss')) heads.boss = K.put(c, BOSS, bossState(t, L), BXX, BY);
  table(c);
  if (who.includes('ryan')) heads.ryan = K.put(c, RYAN, ryanState(t, L), ryanX(t), 0);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), HX, 0);
  flyingStars(c, t, st, BOSSHAND);
  heads.boss = heads.boss || OFF; heads.ryan = heads.ryan || OFF; heads.her = heads.her || OFFL;
  return heads; }

// ---------------- shots (world coordinates; face of a single at ~900 px)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const hHY = G.her.headY, rHY = G.ryan.headY, bHY = G.boss.headY + BY;
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(20, -1480, 0.62, 'cover'), WIDE: S(20, -1450, 0.5, 'wide'), SCR: S(300, -1650, 0.85, 'scr'), CARD: S(20, fy(hHY, 0.6, 980), 0.6, 'card'), TWO: S(20, fy(hHY, 0.62, 860), 0.62, 'two'),
  HER: S(HX + 40, fy(hHY, 1.0), 1.0, 'her'), HER_CU: S(HX + 30, fy(hHY, 1.6, 960), 1.6, 'her'), HER_H: S(HX + 40, fy(hHY, 1.35, 1280), 1.35, 'her'),
  RYAN: S(RX - 20, fy(rHY, 1.0), 1.0, 'ryan'), RYAN_H: S(RX - 20, fy(rHY, 1.0, 1230), 1.0, 'ryan'), RYAN_CU: S(RX - 20, fy(rHY, 1.6, 960), 1.6, 'ryan'),
  BOSS: S(BXX, fy(bHY, 1.0), 1.0, 'boss'), BOSS_H: S(BXX, fy(bHY, 1.0, 1230), 1.0, 'boss'), BOSS_CU: S(BXX, fy(bHY, 1.5, 960), 1.5, 'boss') };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  const sp = id => speaking(id, t, 0.1, 0.15), inW = (a, b) => t >= a && t < b;
  if (L === 'hook') { if (t < SP.hook_r.t - 0.12) return SH.COVER; if (t < SP.hook_b.t - 0.05) return f(SH.RYAN_H); if (t < hev('panic') - 0.05) return f(SH.BOSS_H); if (t < SP.hook.t - 0.1) return f(SH.HER_H); return f(SH.COVER); }
  const u = t - sc.s, l = L.toLowerCase(), nar = SP[l + '_nar'];
  if (u < 1.15) return f(SH.WIDE);
  if (nar && t >= nar.t - 0.1) return f(SH.CARD);
  // gag windows (the object/effect is the point of the shot)
  if (L === 'A1' && inW(e('star') - 0.05, e('star') + 0.9)) return f(SH.WIDE);
  if (L === 'A2') { if (inW(e('clock') - 0.05, Math.min(e('clock') + 1.0, endOf('a2_r') + 0.05))) return f(SH.SCR); if (inW(e('star') - 0.05, e('star') + 0.9)) return f(SH.WIDE); }
  if (L === 'B1') { if (inW(e('mark') - 0.05, SP.b1_h2.t - 0.05)) return f(SH.SCR); if (inW(e('star') - 0.05, e('star') + 0.85)) return f(SH.WIDE); }
  if (L === 'B2') { if (inW(e('heart') - 0.05, SP.b2_b.t + 0.9)) return f(SH.BOSS_CU); if (inW(e('star') - 0.05, e('star') + 0.9)) return f(SH.WIDE); }
  if (L === 'C1') { if (inW(e('bulbs') - 0.05, SP.c1_b.t - 0.05)) return f(SH.WIDE); if (inW(e('star') - 0.05, e('star') + 0.9)) return f(SH.WIDE); }
  if (L === 'C2') { if (sp('c2_h')) { const ch = (TL.cfg.chunks || {}).c2_h, p = SP.c2_h, w = p.words || [], cnt = ch.map(([en]) => en.trim().split(/\s+/).length), tot = cnt.reduce((a, b) => a + b, 0); let wi = 0, i = 0;
      ch.forEach((q, k) => { const a = w.length === tot ? p.t + w[wi][1] : p.t + p.d * k / ch.length; if (t >= a - 0.05) i = k; wi += cnt[k]; }); return f([SH.HER, SH.HER_CU, SH.HER, SH.HER_CU][i] || SH.HER); }
    if (t > endOf('c2_h') && t < endOf('c2_h') + 0.6) return f(SH.WIDE); if (t >= endOf('c2_h') + 0.6 && t < SP.c2_b.t - 0.1) return f(SH.RYAN_CU);
    if (t >= SP.c2_b.t - 0.1 && t < SP.c2_r.t - 0.12) return f(SH.SCR);
    if (t >= SP.c2_r.t - 0.12 && t < endOf('c2_r') + 0.1) return f(SH.RYAN_CU);
    if (t >= endOf('c2_r') + 0.1 && t < SP.c2_h2.t - 0.1) return f(SH.WIDE); if (sp('c2_h2')) return f(SH.HER_CU); }
  const cands = TL.speech.filter(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.1 && t < s.t + s.d + 0.25);
  const single = who => who === 'her' ? SH.HER : who === 'ryan' ? SH.RYAN : SH.BOSS;
  if (cands.length) { cands.sort((a, b) => b.t - a.t); return f(single(cands[0].who)); }
  const next = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.6 && t < s.t);
  if (next) return f(single(next.who));
  return SH.TWO; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); if (tag !== 'x') worldGags(c, t, L, heads); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- screen-space overlays
function starRain(c, t) { const t0 = ev('C2', 'rain'); if (t < t0 || t > t0 + 3.2) return; for (let n = 0; n < 26; n++) { const u = t - t0 - hash(n * 3 + 1) * 1.2; if (u < 0) continue; const x = 60 + hash(n * 5 + 2) * 960, y = -80 + u * (700 + hash(n) * 400), r = 28 + hash(n * 7) * 26; if (y > 2000) continue; star(c, x, y, r, n % 3 ? '#FFD21F' : '#FFF3A0', u * 4 + n); } }
function coverBadge(c, t) { const p = 1 + 0.04 * Math.sin(t * 8); c.save(); c.translate(540, 1640); c.scale(p, p); c.rotate(-0.03); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -330 + 6, -62 + 10, 660, 124, 62); c.fill(); c.fillStyle = '#FFE15A'; rr(c, -330, -62, 660, 124, 62); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; rr(c, -330, -62, 660, 124, 62); c.stroke();
  fitTxt(c, 'THAT WAS MY IDEA!', 0, 4, 54, '#E0474C', 600); c.restore(); }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { K.outro(c, t, { q: ['А КАК БЫ ТЫ СКАЗАЛ', 'КОЛЛЕГЕ ПРО ИДЕЮ?'], rows: [['A2', 'I thought of it first.'], ['B1', 'Actually, that was my idea.'], ['B2', 'Give credit where credit is due.'], ['C1', "I'd like to clarify that I proposed this."]], cta: ['ОТПРАВЬ КОЛЛЕГЕ,', 'КОТОРЫЙ ПРИСВАИВАЕТ'], heroX: 190, heroS: 0.42,
    hero: (cc, tt) => { const g = G.her, gd = G.ryan; K.put(cc, RYAN, { t: tt, mood: 'sad', turn: -0.2, look: -0.4, armL: reach(gd, -1, -gd.sw * 0.3, gd.ySh + 250), armR: reach(gd, 1, gd.sw * 0.9, gd.ySh + 250), items: { R: box } }, 1500, 60);
      K.put(cc, HER, { t: tt, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(tt * 8) * 30, { planar: true }), armR: hang(g, 1), items: {} }, 0, 0); } });
    Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj, WM;
  { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; WM = M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26); }
  const names = { ryan: ['RYAN', '#2A7FB8'], boss: ['BOSS', '#2F3E5C'] };
  if (L === 'hook') { if (tag === 'cover') coverBadge(c, t);
    const hookProj = p => { const q = proj(p); return q.x < 0 || q.x > W ? { x: q.x < 0 ? 60 : W - 60, y: 1050 } : q; };
    K.bubbles(c, t, { id: 'hook' }, heads, hookProj, { cleanChunks: true, names, hold: { hook_r: 0.05, hook_b: 0.05, hook_h: 0.3 } }); K.titleRibbon(c, t, 540, 455); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); UI.captions(c, t);
    Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  const e = k => ev(L, k), narT = (SP[L.toLowerCase() + '_nar'] || { t: 1e9 }).t;
  if (L === 'A1' && t > e('star') && t < narT - 0.1) K.pop(c, t, 'НАША?! ЗВЕЗДА №1!', e('star') + 0.05, narT - 0.2, 540, 1330, C.gold, -0.06, 64);
  if (L === 'A2' && t > e('clock') && t < narT - 0.1) K.pop(c, t, t < e('star') ? 'ПРИШЛА ПЕРВОЙ!' : 'ЗВЕЗДА №2!', e('clock') + 0.05, narT - 0.2, 540, 1330, C.gold, -0.06, 70);
  if (L === 'B1' && t > e('mark') && t < narT - 0.1) K.pop(c, t, t < e('star') ? 'ИМЯ ЗАКРАШЕНО!' : 'ЗВЕЗДА №3!', e('mark') + 0.1, narT - 0.2, 540, 1330, C.gold, -0.06, 64);
  if (L === 'B2' && t > e('heart') && t < narT - 0.1) K.pop(c, t, t < e('star') ? 'ПРИЗНАТЕЛЕН ШЕФУ!' : 'ЗВЕЗДА №4!', e('heart') + 0.1, narT - 0.2, 540, 1330, C.gold, -0.06, 60);
  if (L === 'C1' && t > e('bulbs') && t < narT - 0.1) K.pop(c, t, t < e('star') ? 'ИДЕИ В ВОЗДУХЕ?!' : 'ЗВЕЗДА №5!', e('bulbs') + 0.1, narT - 0.2, 540, 1330, C.gold, -0.06, 64);
  if (L === 'C2') { if (t > e('think') && t < SP.c2_b.t - 0.05) K.dots(c, t, e('think') + 0.05, SP.c2_b.t - 0.05, 1450);
    if (t > e('mail') && t < SP.c2_r.t - 0.1) K.pop(c, t, 'ПИСЬМО С ВТОРНИКА!', e('mail') + 0.2, SP.c2_r.t - 0.15, 540, 1330, C.gold, -0.06, 64);
    if (t > e('box') && t < SP.c2_h2.t - 0.05) K.pop(c, t, 'ЗВЁЗДЫ ПОСЫПАЛИСЬ!', e('fall') + 0.4, SP.c2_h2.t - 0.1, 540, 1330, C.gold, 0.06, 64); }
  K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names, hold: { a1_b: 0.15, a2_h2: 0.05, a2_b: 0.3, b1_h2: 0.3, c1_h2: 0.4, c2_b: 0.3, c2_r: 0.3, c2_h2: 0.6 } });
  starRain(c, t);
  K.hud(c, t, sc);
}
E.run('idea', NF, renderFrame);
