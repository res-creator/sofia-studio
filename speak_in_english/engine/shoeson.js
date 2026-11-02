// "Shoes on? (London hostess)" episode renderer (hard_cut camera): node shoeson.js start end out.mp4 | --png=f1,f2
// London flat: hallway door + doormat on the left, a snow-white carpet across the room, Margot (hostess) on the carpet,
// three guests (tom, linda, ben) on the sofa on the right, the wardrobe full of slippers between them (opens in C2).
// Footprint counter (icon + number) in the top-left corner: A1 Margot's heels -> 3, B2 her boots -> 6, C2 the robot vacuum -> 0.
// Shots tagged 'ui:<view>' (sock, heel) replace the world with a full-screen close-up insert. No black card.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/shoeson/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];
const ORDER = ['hook', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'outro'], idx = L => ORDER.indexOf(L);

// ---------------- cast: heroine dressed for a visit (sweater dress + boots), Margot as is (red heels), guests on the sofa
const SOCK = '#E9E4DA';
const HER = { ...BASE.her_lift, top: { type: 'sweater', col: '#8E5BD6' }, bottom: { type: 'skirt', col: '#3E3550' }, shoes: { col: '#6A4632', acc: '#C98B5A' } };
const HER_S = { ...HER, shoes: { col: SOCK, acc: null } };
const MAR = BASE.margot;
const GUESTS = [['tom', 980], ['linda', 1190], ['ben', 1400]].map(([k, x]) => ({ k, x, cfg: BASE[k], sock: { ...BASE[k], shoes: { col: SOCK, acc: null } } }));
const G = { her: geom(HER), hostess: geom(MAR) };
const HX = -420, MX = 330, DOORX = -820, CLOSX = 720;
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- props
const cupItem = ctx => { ctx.fillStyle = '#FFFDF8'; rr(ctx, -26, -70, 52, 64, 10); ctx.fill(); ctx.strokeStyle = '#C9A13A'; ctx.lineWidth = 4; ctx.stroke(); ctx.beginPath(); ctx.arc(30, -40, 14, -1.4, 1.4); ctx.stroke(); };
function bootDraw(c, s = 1, col = '#6A4632') { c.save(); c.scale(s, s); paint(c, q => { q.m(-40, -150); q.l(30, -150); q.l(34, -40); q.q(110, -30, 120, 0); q.l(-44, 0); q.z(); }, col, { sd: 6, hd: 3, lw: 4 }); c.fillStyle = '#2B1E16'; c.fillRect(-46, -8, 168, 12); c.fillStyle = '#C98B5A'; for (let k = 0; k < 4; k++) c.fillRect(-10, -132 + k * 24, 34, 6); c.restore(); }
const bootItem = ctx => { ctx.save(); ctx.translate(-20, 60); ctx.rotate(-0.5); bootDraw(ctx, 1.0); ctx.restore(); };
const bootsItem = ctx => { ctx.save(); ctx.translate(-40, 70); bootDraw(ctx, 0.9); ctx.translate(50, 10); bootDraw(ctx, 0.9); ctx.restore(); };
function vacDraw(c, s = 1) { c.save(); c.scale(s, s); c.fillStyle = '#2B2F3A'; c.fillRect(-14, -720, 28, 600); rr(c, -60, -750, 120, 50, 18); c.fill();
  paint(c, q => { q.m(-70, -520); q.l(70, -520); q.l(80, -180); q.l(-80, -180); q.z(); }, '#E0474C', { sd: 8, hd: 4, lw: 5 }); c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(0, -420, 26, 0, TAU); c.fill();
  paint(c, q => { q.m(-80, -180); q.l(80, -180); q.l(90, -40); q.l(-90, -40); q.z(); }, '#C23C4A', { sd: 8, hd: 4, lw: 4 }); c.fillStyle = '#2B2F3A'; rr(c, -120, -40, 240, 40, 12); c.fill(); c.restore(); }
function robotDraw(c, s = 1, t = 0) { c.save(); c.scale(s, s); c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(0, 4, 150, 22, 0, 0, TAU); c.fill();
  paint(c, q => { q.m(-140, 0); q.l(140, 0); q.q(150, -40, 120, -60); q.l(-120, -60); q.q(-150, -40, -140, 0); q.z(); }, '#F7F9FC', { sd: 8, hd: 4, lw: 4 });
  c.fillStyle = '#2B2F3A'; rr(c, -60, -78, 120, 20, 8); c.fill(); c.fillStyle = (Math.floor(t * 6) % 2) ? '#7CF29A' : '#2E9E4A'; c.beginPath(); c.arc(0, -68, 7, 0, TAU); c.fill();
  c.strokeStyle = '#8C93A0'; c.lineWidth = 6; for (const sx of [-1, 1]) { c.save(); c.translate(sx * 120, 0); c.rotate(t * 20 * sx); c.beginPath(); for (let k = 0; k < 3; k++) { c.moveTo(0, 0); c.lineTo(Math.cos(k * 2.1) * 30, Math.sin(k * 2.1) * 12); } c.stroke(); c.restore(); } c.restore(); }
function slipperDraw(c, s = 1, col = '#F7B6CF') { c.save(); c.scale(s, s); paint(c, q => { q.m(-70, 0); q.q(-80, -40, -30, -46); q.l(60, -40); q.q(85, -20, 70, 0); q.z(); }, col, { sd: 4, hd: 2, lw: 3 }); c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.ellipse(30, -38, 34, 14, 0, 0, TAU); c.fill(); c.restore(); }
// footprints on the carpet (world): [x, kind, appears at]
function prints() { const P_ = [];
  for (const [i, x] of [440, 560, 680].entries()) P_.push({ x, y: 120 + (i % 2) * 70, k: 'heel', t: ev('A1', 'walk') + 0.15 + 0.2 * i });
  for (const [i, x] of [-190, -50, 80].entries()) P_.push({ x, y: 150 + (i % 2) * 70, k: 'boot', t: ev('B2', 'stroll') + 0.75 + 1.2 * i });
  return P_; }
const PRINTS = prints();
const robotX = t => { const r = ev('C2', 'robot'); return r > 1e8 ? 1e9 : lerp(1500, -400, clamp((t - r) / 1.5)); };
function printsDraw(c, t) { const rx = robotX(t); for (const p of PRINTS) { if (t < p.t || p.x > rx) continue; c.save(); c.translate(p.x, p.y); c.fillStyle = 'rgba(110,80,50,.55)';
  if (p.k === 'heel') { c.beginPath(); c.ellipse(0, 0, 26, 40, 0.3, 0, TAU); c.fill(); c.beginPath(); c.arc(30, 50, 10, 0, TAU); c.fill(); }
  else { c.beginPath(); c.ellipse(0, 0, 34, 58, 0.25, 0, TAU); c.fill(); c.fillStyle = 'rgba(244,240,232,.9)'; for (let k = 0; k < 4; k++) c.fillRect(-20, -34 + k * 20, 40, 7); }
  c.restore(); } }
const count = t => { const rx = robotX(t); return PRINTS.filter(p => t >= p.t && p.x <= rx).length; };

// ---------------- the flat (prerendered, softly blurred): hallway + living room; carpet, wardrobe and guests are drawn live
const BX0 = -2200, BY0 = -3400, BW = 4400, BH = 4800, BS = 0.5;
function drawFlat(c) {
  c.fillStyle = '#EFE6D6'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = '#D9C7A8'; c.fillRect(BX0, -900, BW, 640); c.fillStyle = '#B79A70'; c.fillRect(BX0, -900, BW, 22);   // panelled lower wall
  c.strokeStyle = 'rgba(0,0,0,.07)'; c.lineWidth = 6; for (let x = BX0; x < BX0 + BW; x += 300) { c.strokeRect(x + 30, -860, 240, 560); }
  // hallway: door, coat rack, mirror
  c.fillStyle = '#FFFDF8'; rr(c, DOORX - 320, -2350, 640, 2100, 10); c.fill(); c.fillStyle = '#2F4F6F'; rr(c, DOORX - 270, -2300, 540, 2040, 8); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.22)'; c.lineWidth = 10; c.strokeRect(DOORX - 210, -2200, 420, 760); c.strokeRect(DOORX - 210, -1300, 420, 900);
  c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(DOORX + 190, -1300, 22, 0, TAU); c.fill(); fitTxt(c, '7', DOORX, -2100, 110, '#F2C14E', 200);
  c.fillStyle = '#7A4E2E'; c.fillRect(-1700, -2200, 30, 1900); for (const [y, col] of [[-2050, '#C23C4A'], [-1950, '#5E9E6E']]) { c.fillStyle = col; rr(c, -1800, y, 180, 420, 40); c.fill(); }
  // living room: window with London view, framed picture, lamp, plant
  c.fillStyle = '#FFFDF8'; rr(c, 300, -2500, 900, 1150, 14); c.fill(); c.fillStyle = '#A9D2EC'; rr(c, 340, -2460, 820, 1070, 8); c.fill();
  c.fillStyle = '#8CA3B8'; for (const [x, w, h] of [[360, 120, 380], [500, 90, 520], [610, 160, 300], [790, 70, 640], [880, 140, 420], [1040, 110, 340]]) c.fillRect(x, -1390 - h, w, h);
  c.fillStyle = '#6A7F94'; c.fillRect(805, -2150, 40, 120); c.beginPath(); c.arc(825, -2150, 34, 0, TAU); c.fill();   // Big Ben silhouette
  c.strokeStyle = '#FFFDF8'; c.lineWidth = 16; c.beginPath(); c.moveTo(750, -2460); c.lineTo(750, -1390); c.moveTo(340, -1925); c.lineTo(1160, -1925); c.stroke();
  c.fillStyle = '#C9A13A'; rr(c, 1450, -2300, 520, 400, 12); c.fill(); c.fillStyle = '#F7B6CF'; rr(c, 1480, -2270, 460, 340, 6); c.fill(); c.fillStyle = '#EE5E9A'; c.beginPath(); c.arc(1710, -2100, 90, 0, TAU); c.fill();
  // floor: dark parquet
  c.fillStyle = '#9A6B44'; c.fillRect(BX0, -260, BW, 1700); c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 4; for (let y = -260; y < 1400; y += 70) { c.beginPath(); c.moveTo(BX0, y); c.lineTo(BX0 + BW, y); c.stroke(); }
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };   // drawn sharp, blurred once
const BGK = mkBG(drawFlat);
function carpet(c, t) {
  c.fillStyle = 'rgba(0,0,0,.12)'; rr(c, -255, -95, 1880, 400, 30); c.fill();
  c.fillStyle = '#FFFFFF'; rr(c, -260, -110, 1880, 400, 30); c.fill(); c.strokeStyle = '#E3DCCF'; c.lineWidth = 6; rr(c, -230, -85, 1820, 350, 24); c.stroke();
  c.fillStyle = 'rgba(230,224,212,.5)'; for (let k = 0; k < 40; k++) { const x = -240 + (k * 137) % 1840, y = -90 + (k * 53) % 360; c.fillRect(x, y, 3, 14); }
  // doormat in the hallway
  c.fillStyle = '#8A5A3A'; rr(c, -720, -70, 380, 200, 16); c.fill(); fitTxt(c, 'WELCOME', -530, 30, 46, '#F2C14E', 340);
  printsDraw(c, t); }
function wardrobe(c, t) { const o = idx(sceneAt(t).id) === idx('C2') ? eOut(clamp((t - ev('C2', 'closet')) / 0.35)) : 0, x0 = CLOSX - 230, y0 = -1950;
  paint(c, q => { q.m(x0, y0); q.l(x0 + 460, y0); q.l(x0 + 460, -40); q.l(x0, -40); q.z(); }, '#C9A880', { sd: 10, hd: 4, lw: 4 });
  if (o > 0) { c.fillStyle = '#6A4A30'; c.fillRect(x0 + 20, y0 + 20, 420, 1870);
    const cols = ['#F7B6CF', '#7FB0D8', '#F2C14E', '#8CB369', '#FFFDF8', '#E9A23B'];
    for (let r = 0; r < 6; r++) { c.fillStyle = '#B79A70'; c.fillRect(x0 + 20, y0 + 300 + r * 290, 420, 16); for (let k = 0; k < 3; k++) { c.save(); c.translate(x0 + 95 + k * 135, y0 + 300 + r * 290); slipperDraw(c, 0.85, cols[(r * 3 + k) % 6]); c.restore(); } } }
  // doors swing open
  for (const sd of [-1, 1]) { const w = 230 * (1 - o * 0.85), x = sd < 0 ? x0 - (230 * o * 0.6) : x0 + 460 - w + 230 * o * 0.6;
    paint(c, q => { q.m(x, y0); q.l(x + w, y0); q.l(x + w, -40); q.l(x, -40); q.z(); }, '#D9BE95', { sd: 6, hd: 3, lw: 4 }); c.fillStyle = '#C9A13A'; c.beginPath(); c.arc(sd < 0 ? x + w - 30 : x + 30, -1000, 14, 0, TAU); c.fill(); }
  // tumbling slippers
  if (o > 0) { const u = t - ev('C2', 'closet'); for (let k = 0; k < 3; k++) { const a = clamp((u - k * 0.12) / 0.5); if (a <= 0) continue; c.save(); c.translate(CLOSX - 120 + k * 120 + a * (k - 1) * 120, lerp(-700, 40, eIn(a))); c.rotate(a * (k + 1) * 2); slipperDraw(c, 0.9, ['#F7B6CF', '#7FB0D8', '#F2C14E'][k]); c.restore(); } } }
function sofaBack(c) { paint(c, q => { q.m(840, -760); q.l(1620, -760); q.l(1620, -300); q.l(840, -300); q.z(); }, '#5E9E6E', { sd: 10, hd: 4, lw: 4 }); }
function sofaFront(c) { paint(c, q => { q.m(820, -330); q.l(1640, -330); q.l(1640, -120); q.l(820, -120); q.z(); }, '#4E8A5E', { sd: 10, hd: 4, lw: 4 });
  for (const x of [800, 1620]) paint(c, q => { q.m(x - 30, -560); q.l(x + 30, -560); q.l(x + 30, -120); q.l(x - 30, -120); q.z(); }, '#3E7A4E', { sd: 6, hd: 3, lw: 4 }); }
function guests(c, t, L) { const u = L === 'C2' ? t - ev('C2', 'kick') : -1, sw = !!(idx(L) > idx('C2') || u > 0.15);
  for (const [i, gq] of GUESTS.entries()) { const g = geom(gq.cfg), cfg = sw ? gq.sock : gq.cfg;
    const st = { t, mood: 'neutral', turn: -0.35, look: -0.6, armL: hang(g, -1), armR: chest(g, 1, 0.5), items: { R: cupItem } };
    if (L === 'hook') { st.mood = 'surprised'; st.turn = -0.5; st.look = -0.9; }
    if (L === 'A1' && t > ev('A1', 'walk')) st.mood = 'worried';
    if (L === 'B1' && t > ev('B1', 'sock')) { st.mood = 'shock'; st.blink = 0; }
    if (L === 'B2' && t > ev('B2', 'stroll')) { st.mood = 'worried'; st.lookY = 0.5; }
    if (L === 'C2' && t > ev('C2', 'closet')) { st.mood = 'surprised'; }
    if (sw) { st.mood = 'happy'; st.blink = 1; st.armL = reach(g, -1, -g.sw * 1.6, g.ySh + 60, { planar: true }); }
    K.put(c, cfg, st, gq.x, -150, 0.8);
    if (L === 'C2' && u > 0 && u < 1.2) { for (const sd of [-1, 1]) { const a = clamp((u - i * 0.15) / 0.8); if (a <= 0 || a >= 1) continue; c.save(); c.translate(gq.x + sd * 40 + sd * a * 260, -170 - Math.sin(a * Math.PI) * 520); c.rotate(a * 8 * sd); bootDraw(c, 0.55, gq.cfg.shoes ? gq.cfg.shoes.col : '#2B2F3A'); c.restore(); } } }
}

// ---------------- characters
const gest = (st, g, who, t, side, base) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } };
const hang = (g, s) => reach(g, s, s * g.sw * 0.8, g.ySh + 330);
const chest = (g, s, k = 0.6) => reach(g, s, s * g.sw * k, g.ySh + 230);
const open = (g, s, k = 1.7) => reach(g, s, s * g.sw * k, g.ySh + 90, { planar: true });
function herX(t, L) { if (L === 'B2') return lerp(HX, 60, eIO(clamp((t - ev('B2', 'stroll')) / 3.6))); return HX; }
function herCfg(t, L) { if (L === 'B1' && t > ev('B1', 'unshoe')) return HER_S; if (L === 'C1' && t > ev('C1', 'park')) return HER_S; if (L === 'C2' || L === 'outro') return HER_S; return HER; }
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { t, talk: talk('her', t), mood: 'neutral', turn: 0.35, look: 0.7, armL: hang(g, -1), armR: hang(g, 1), items: {} };
  if (L === 'hook') { st.mood = 'shock'; st.blink = 0; st.legPose = 'walk'; st.items = { R: bootItem }; st.armR = chest(g, 1, 0.9); st.armL = open(g, -1);
    st.t = 0.196; st.lean = t > hev('wobble') ? Math.sin(t * 7) * 0.35 : 0; }
  if (L === 'A1') { st.mood = 'worried'; if (speaking('a1_h', t, 0.05, 0.3)) { st.mood = 'shock'; st.armR = reach(g, 1, g.sw * 0.4, 40 - 200 + Math.sin(t * 12) * 30); st.armL = open(g, -1, 1.5); }
    if (t > e('vac')) { st.mood = 'sad'; st.armR = reach(g, 1, 190, -700); st.armL = hang(g, -1); } }
  if (L === 'A2') { st.mood = 'happy'; if (speaking('a2_h', t, 0.05, 0.3)) gest(st, g, 'her', t, -1, 160); if (t > e('thought')) { st.mood = 'surprised'; st.blink = 0; } }
  if (L === 'B1') { st.mood = 'happy'; if (speaking('b1_h', t, 0.05, 0.3)) { gest(st, g, 'her', t, -1, 160); } if (t > e('unshoe') - 0.3 && t < e('unshoe') + 0.4) { st.armR = reach(g, 1, g.sw * 0.6, -120); } if (t > e('sock')) { st.mood = 'shock'; st.blink = 0; st.armL = chest(g, -1, 0.3); st.armR = chest(g, 1, 0.3); } }
  if (L === 'B2') { st.mood = 'neutral'; if (t > e('stroll') && t < e('stroll') + 3.6) { st.legPose = 'walk'; st.mood = 'worried'; st.turn = 0.5; } if (speaking('b2_h', t, 0.05, 0.3)) gest(st, g, 'her', t, -1, 160); if (t > endOf('b2_m')) { st.mood = 'surprised'; st.blink = 0; } }
  if (L === 'C1') { st.mood = 'happy'; if (speaking('c1_h', t, 0.05, 0.3)) gest(st, g, 'her', t, 1, 160); if (t > e('park') - 0.5 && t < e('park')) { st.items = { L: bootsItem }; st.armL = reach(g, -1, -g.sw * 1.6, g.ySh + 300); } }
  if (L === 'C2') { st.mood = 'neutral'; st.turn = 0.4; st.look = 0.6;
    if (speaking('c2_h', t, 0.05, 0.1)) { st.mood = 'smug'; st.armL = chest(g, -1, 0.3); st.armR = reach(g, 1, g.sw * 1.6, g.ySh + 60 + Math.sin(t * 2) * 30); }
    if (t > endOf('c2_h') + 0.1) { st.mood = 'neutral'; st.blink = 0; } if (t > e('closet')) { st.mood = 'surprised'; st.blink = 0; } if (t > e('kick')) { st.mood = 'happy'; st.laugh = true; } }
  return st; }
function marX(t, L) { if (L !== 'A1') return MX; const w = ev('A1', 'walk'), u = t - w; if (u < 0) return MX; if (u < 0.6) return lerp(MX, 760, eIO(u / 0.6)); if (u < 0.75) return 760; return lerp(760, HX + 330, eIO(clamp((u - 0.75) / 0.4))); }
function marState(t, L) { const g = G.hostess, e = k => ev(L, k), st = { t, talk: talk('hostess', t), mood: 'happy', turn: -0.35, look: -0.8, armL: hang(g, -1), armR: hang(g, 1), items: {} };
  if (L === 'hook') { st.mood = 'happy'; st.laugh = speaking('hook_m', t); st.armL = open(g, -1, 2.0); st.armR = open(g, 1, 1.6); }
  if (L === 'A1') { if (speaking('a1_m', t, 0.05, 0.1)) { st.mood = 'happy'; st.armL = open(g, -1, 1.8); }
    const u = t - e('walk'); if (u > 0 && u < 1.15) { st.legPose = 'walk'; if (u < 0.6) { st.turn = 0.5; st.look = 0.9; } } if (u > 0.7 && u < 1.15) { st.armL = reach(g, -1, -170, -700); }
    if (u > 1.15) { st.mood = 'happy'; st.armL = open(g, -1, 1.5); } }
  if (L === 'A2') { if (speaking('a2_m', t, 0.05, 0.3)) { st.mood = 'surprised'; gest(st, g, 'hostess', t, -1, 120); } if (t > e('thought')) { st.mood = 'happy'; st.lookY = -0.4; st.look = -0.2; st.blink = 1; st.armR = reach(g, 1, g.hw * 0.5, g.headY + g.hh * 0.9); } }
  if (L === 'B1') { if (speaking('b1_m', t, 0.05, 0.3)) st.armL = open(g, -1, 1.6); if (t > e('sock')) { st.mood = 'shock'; st.blink = 0; st.lookY = 0.6; st.armL = chest(g, -1, 0.3); } }
  if (L === 'B2') { if (t > e('stroll')) { st.mood = 'worried'; st.lookY = 0.6; } if (speaking('b2_m', t, 0.05, 0.3)) { st.mood = 'skeptical'; st.lookY = 0; } }
  if (L === 'C1') { st.mood = 'happy'; if (speaking('c1_m', t, 0.05, 0.3)) gest(st, g, 'hostess', t, -1, 120); if (t > e('heeloff')) { st.blink = 1; st.mood = 'happy'; } }
  if (L === 'C2') { st.mood = 'neutral'; if (t > e('think')) { st.mood = 'worried'; st.blink = 0; st.armR = chest(g, 1, 0.3); }
    if (t > e('closet') - 0.3) { st.mood = 'happy'; st.turn = 0.3; st.look = 0.5; st.armR = reach(g, 1, CLOSX - MX - 260, -1000); }
    if (speaking('c2_m', t, 0.05, 0.1)) { st.mood = 'happy'; st.turn = -0.35; st.look = -0.8; }
    if (t > e('kick')) { st.mood = 'happy'; st.laugh = true; st.armL = open(g, -1, 1.8); st.armR = hang(g, 1); } }
  return st; }

// ---------------- the world + which characters a shot draws (clean singles: only the tagged character)
const DRAW = { wide: ['her', 'hostess'], card: ['her', 'hostess'], two: ['her', 'hostess'], her: ['her'], hostess: ['hostess'], cover: ['her', 'hostess'], room: ['her', 'hostess'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGK, BX0, BY0, BW, BH);
  wardrobe(c, t); guests(c, t, L); carpet(c, t);
  if (idx(L) >= idx('C1') && (L !== 'C1' || t > ev('C1', 'park'))) { c.save(); c.translate(-600, 40); bootDraw(c, 0.8); c.translate(90, 6); bootDraw(c, 0.8); c.restore(); }   // her boots on the doormat
  if (L === 'B1' && t > ev('B1', 'unshoe')) { c.save(); c.translate(HX - 210, 30); bootDraw(c, 0.8); c.translate(80, 6); bootDraw(c, 0.8); c.restore(); }
  if (who.includes('hostess')) heads.hostess = K.put(c, MAR, marState(t, L), marX(t, L), 0);
  if (who.includes('her')) heads.her = K.put(c, herCfg(t, L), herState(t, L), herX(t, L), 0);
  const vh = vacHolder(t, L); if (vh) { c.save(); c.translate(vh.x, 0); vacDraw(c, 1.0); c.restore(); }
  if (L === 'C2' && t > ev('C2', 'robot')) { c.save(); c.translate(robotX(t), 200); robotDraw(c, 0.9, t); c.restore(); }
  if (L === 'A2' && t > ev('A2', 'thought')) thought(c, t);
  K.mark(c, 'carpet', 600, 100, 160);
  if (!heads.hostess) heads.hostess = OFF; if (!heads.her) heads.her = OFFL;
  return heads; }
function vacHolder(t, L) { if (L !== 'A1') return null; const u = t - ev('A1', 'walk'); if (u > 0.7 && u < 1.15) return { x: marX(t, L) - 170 }; if (u >= 1.15) return { x: HX + 190 }; return null; }
// A2: Margot imagines an office where everybody sits barefoot (no words)
function thought(c, t) { const k = eBack(clamp((t - ev('A2', 'thought')) / 0.3), 2) * (1 - clamp((t - SP.a2_nar.t + 0.3) / 0.25)); if (k <= 0) return; const g = G.hostess, x = MX + 60, y = g.headY - 620;
  c.save(); c.translate(x, y); c.scale(k * 1.3, k * 1.3); c.fillStyle = '#FFFDF8'; c.strokeStyle = C.oliveD; c.lineWidth = 7;
  for (const [dx, dy, r] of [[-200, 40, 150], [0, -40, 190], [200, 30, 160], [0, 120, 170]]) { c.beginPath(); c.arc(dx, dy, r, 0, TAU); c.fill(); c.stroke(); }
  c.fillStyle = '#FFFDF8'; c.beginPath(); c.ellipse(0, 40, 330, 170, 0, 0, TAU); c.fill();
  for (const [dx, dy, r] of [[-170, 280, 34], [-220, 350, 20]]) { c.beginPath(); c.arc(dx, dy, r, 0, TAU); c.fill(); c.stroke(); }
  for (const dx of [-170, 40]) { c.fillStyle = '#7A4E2E'; c.fillRect(dx, 40, 170, 18); c.fillRect(dx + 10, 58, 12, 90); c.fillRect(dx + 148, 58, 12, 90); c.fillStyle = '#2B2F3A'; rr(c, dx + 50, -40, 80, 60, 6); c.fill(); c.fillStyle = '#9CC8F0'; rr(c, dx + 56, -34, 68, 44, 4); c.fill();
    c.fillStyle = '#7FB0D8'; rr(c, dx + 60, 20, 50, 60, 16); c.fill(); c.fillStyle = '#F6D2B6'; c.beginPath(); c.arc(dx + 85, 0, 22, 0, TAU); c.fill();
    for (const fx of [dx + 60, dx + 100]) { c.fillStyle = '#F6D2B6'; c.beginPath(); c.ellipse(fx, 150, 24, 12, 0, 0, TAU); c.fill(); for (let q = 0; q < 4; q++) { c.beginPath(); c.arc(fx + 14 + q * 5, 140 - q * 2, 5, 0, TAU); c.fill(); } } }
  c.restore(); }
// full-screen close-up inserts (on a solid backdrop): the sock with a hole (B1), Margot's foot out of her heel (C1)
function insert(c, t, view) { c.fillStyle = '#F4EFE6'; c.fillRect(0, 0, W, HH); c.fillStyle = '#FFFFFF'; c.fillRect(0, 1050, W, 870);
  c.save(); c.translate(540, 1250);
  if (view === 'sock') { const w = Math.sin(t * 10) * 0.12; c.scale(1.25, 1.25); c.translate(-40, 0);
    c.fillStyle = '#8E5BD6'; rr(c, -360, -620, 230, 320, 30); c.fill();   // dress hem / leg above the sock
    paint(c, q => { q.m(-340, -340); q.l(-150, -340); q.l(-150, -90); q.q(120, -130, 300, -60); q.q(400, -20, 390, 60); q.q(380, 130, 270, 130); q.l(-310, 130); q.q(-360, 130, -360, 80); q.z(); }, SOCK, { sd: 14, hd: 6, lw: 6 });
    c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 8; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(-330, -320 + k * 26); c.lineTo(-170, -320 + k * 26); c.stroke(); }
    c.fillStyle = '#5E5A53'; c.beginPath(); c.ellipse(330, 10, 92, 100, 0, 0, TAU); c.fill();
    c.save(); c.translate(372, -10); c.rotate(w); paint(c, q => q.e(0, 0, 92, 96), '#F6D2B6', { sd: 10, hd: 5, lw: 6 }); c.fillStyle = '#F7C9D6'; c.beginPath(); c.ellipse(42, -24, 36, 40, 0.2, 0, TAU); c.fill(); c.strokeStyle = '#C98B8B'; c.lineWidth = 4; c.stroke(); c.restore();
    c.strokeStyle = '#5E5A53'; c.lineWidth = 8; for (let k = 0; k < 9; k++) { const a = k / 9 * TAU; c.beginPath(); c.moveTo(330 + Math.cos(a) * 92, 10 + Math.sin(a) * 100); c.lineTo(330 + Math.cos(a) * 118, 10 + Math.sin(a) * 128); c.stroke(); } }
  if (view === 'heel') { const w = Math.sin(t * 12) * 0.12; c.scale(1.2, 1.2);
    // the red pump lying on the carpet
    paint(c, q => { q.m(60, 60); q.q(200, 40, 330, 70); q.l(330, 110); q.l(40, 110); q.z(); }, '#8A1C2E', { sd: 8, hd: 4, lw: 5 });
    paint(c, q => { q.m(-60, 110); q.q(-40, -20, 60, 60); q.l(60, 110); q.z(); }, '#8A1C2E', { sd: 6, hd: 3, lw: 5 }); c.fillStyle = '#5A0E1C'; c.fillRect(-58, 110, 22, 120); c.fillRect(-36, 106, 370, 12);
    // her foot (nylon) out of the shoe, toes wiggling
    c.save(); c.translate(-80, -120); c.rotate(-0.12);
    paint(c, q => { q.m(-360, -180); q.l(-200, -180); q.l(-190, -40); q.q(80, -70, 230, -10); q.q(290, 20, 280, 70); q.q(260, 110, 180, 110); q.l(-300, 110); q.q(-370, 100, -360, 20); q.z(); }, '#F2CBB4', { sd: 12, hd: 6, lw: 5 });
    for (let k = 0; k < 5; k++) { c.save(); c.translate(250 - k * 34, 30 - k * 14); c.rotate(Math.sin(t * 12 + k) * 0.25); paint(c, q => q.e(0, -10, 26 - k * 2, 30 - k * 2), '#F2CBB4', { sd: 4, hd: 2, lw: 4 }); c.fillStyle = '#C8283E'; c.beginPath(); c.ellipse(8, -26, 10 - k, 8 - k * 0.6, 0.3, 0, TAU); c.fill(); c.restore(); }
    c.restore();
    for (let k = 0; k < 4; k++) { const a = t * 3 + k * 1.6; c.fillStyle = C.gold; UI.star(c, 120 + Math.cos(a) * 300, -420 + Math.sin(a) * 110, 34); } }
  c.restore(); }

// ---------------- shots (world coordinates; face of a single at ~900 px)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const hHY = G.her.headY, mHY = G.hostess.headY;
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(-40, fy((hHY + mHY) / 2, 0.52, 820), 0.52, 'cover'), WIDE: S(320, -1000, 0.5, 'wide'), CARD: S(-45, fy(mHY, 0.7, 1000), 0.7, 'card'), CARD_B2: S(195, fy(mHY, 0.66, 1020), 0.66, 'card'), TWO: S(-45, fy(mHY, 0.72, 880), 0.72, 'two'),
  HER: S(HX + 40, fy(hHY, 1.0), 1.0, 'her'), HER_H: S(HX + 40, fy(hHY, 1.25, 1150), 1.25, 'her'), MAR: S(MX - 20, fy(mHY, 1.0), 1.0, 'hostess'), MAR_CU: S(MX - 20, fy(mHY, 1.5, 960), 1.5, 'hostess'),
  GUESTS: S(1230, -900, 0.85, 'hostess'), CARPET: S(450, 40, 1.1, 'hostess'), THOUGHT: S(MX + 40, fy(mHY, 0.66, 1250), 0.66, 'hostess'), CLOSET: S(560, fy(mHY, 0.62, 1100), 0.62, 'hostess'),
  SOCK: U('sock', 1), HEEL: U('heel', 2) };
const C2Z = [1.0, 1.15, 1.3, 1.45].map(z => S(HX + 40, fy(hHY, z, 940), z, 'her'));
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  const sp = id => speaking(id, t, 0.1, 0.15);
  if (L === 'hook') { if (t < hev('cu')) return SH.COVER; if (t < hev('wobble') + 0.3) return f(SH.MAR_CU); if (t < hev('cover')) return f(SH.HER_H);
    const h = t - hev('cover'); if (h < 2.2) return f(SH.COVER); if (h < 3.6) return f(SH.GUESTS); if (h < 5.7) return f(SH.COVER); if (h < 7.0) return f(SH.CARPET); return f(SH.COVER); }
  const u = t - sc.s, l = L.toLowerCase(), nar = SP[l + '_nar'];
  if (u < 1.15) return f(SH.WIDE);
  if (nar && t >= nar.t - 0.1) return f(L === 'B2' ? SH.CARD_B2 : SH.CARD);
  if (L === 'A1' && t > e('walk') - 0.05) return f(SH.WIDE);
  if (L === 'A2' && t > e('thought') - 0.05) return f(SH.THOUGHT);
  if (L === 'B1' && t > e('sock') - 0.05) return f(SH.SOCK);
  if (L === 'B2' && t > e('stroll') - 0.05 && !sp('b2_m')) return f(SH.WIDE);
  if (L === 'C1' && t > e('heeloff') - 0.05) return f(SH.HEEL);
  if (L === 'C2') { if (sp('c2_h')) { const ch = (TL.cfg.chunks || {}).c2_h, p = SP.c2_h, w = p.words || [], cnt = ch.map(([en]) => en.trim().split(/\s+/).length), tot = cnt.reduce((a, b) => a + b, 0); let wi = 0, i = 0;
      ch.forEach((q, k) => { const a = w.length === tot ? p.t + w[wi][1] : p.t + p.d * k / ch.length; if (t >= a - 0.05) i = k; wi += cnt[k]; }); return f(C2Z[i] || SH.HER); }
    if (t > endOf('c2_h') && t < e('closet') - 0.05) return f(SH.MAR_CU);
    if (t >= e('closet') - 0.05 && t < e('kick') - 0.05) return f(SH.CLOSET);
    if (t >= e('kick') - 0.05) return f(SH.WIDE); }
  const cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.1 && t < s.t + s.d + 0.25);
  const single = who => who === 'her' ? (L === 'B2' ? S(herX(t, L) + 40, fy(hHY, 1.0), 1.0, 'her') : SH.HER) : SH.MAR;
  if (cur) return f(single(cur.who));
  const next = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.6 && t < s.t);
  if (next) return f(single(next.who));
  return SH.TWO; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- overlays: title ribbon (big pink line), cover badge, footprint counter
function title(c, t) { const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.translate(540, 470); c.rotate(-0.05); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -175 + 14, 980, 350, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -175, 980, 350, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 74, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -112);
  UI.textFit(c, 'Unb9', 150, lines[1][0], 900); UI.strokeText(c, lines[1][0], 0, 4, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 66, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 122); c.restore(); }
function coverBadge(c, t) { const p = 1 + 0.04 * Math.sin(t * 8); c.save(); c.translate(540, 1745); c.scale(p, p); c.rotate(-0.03); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -280 + 6, -60 + 10, 560, 120, 60); c.fill(); c.fillStyle = '#FFE15A'; rr(c, -280, -60, 560, 120, 60); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; rr(c, -280, -60, 560, 120, 60); c.stroke();
  fitTxt(c, 'SHOES ON?!', 0, 4, 60, '#E0474C', 500); c.restore(); }
function footIcon(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#7A5A3A'; c.beginPath(); c.ellipse(0, 4, 13, 20, 0.2, 0, TAU); c.fill(); for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(-8 + k * 6, -20 - (k === 0 ? 2 : 0), 4.5 - k * 0.4, 0, TAU); c.fill(); } c.restore(); }
function counter(c, t, sc) { return; /* owner: no corner counter/icons in the video */ const L = sc.id; if (L === 'outro') return; const nar = SP[L.toLowerCase() + '_nar'], u = t - sc.s;
  if (L !== 'hook' && (u < 1.2 || (nar && t > nar.t - 0.2))) return; if (L === 'hook' && sceneTag(t) !== 'cover') return;
  const n = count(t); let ch = -1; for (const p of PRINTS) if (t >= p.t && p.t > ch) ch = p.t; const rz = ev('C2', 'robot') + 1.5; if (L === 'C2' && t > rz) ch = rz;
  const since = t - ch, bump = since > 0 && since < 0.4 ? 1 + 0.3 * Math.sin(since / 0.4 * Math.PI) : 1, label = since > 0.1 && since < 2.0 && L !== 'hook';
  const k = (L === 'hook' ? 1 : eBack(P(u, 1.2, 1.5), 1.6)) * bump; const w = label ? 300 : 170, h = label ? 128 : 84;
  c.save(); c.translate(70, 1530); c.scale(k, k);
  c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, 6, 8, w, h, 22); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 5; rr(c, 0, 0, w, h, 22); c.fill(); c.stroke();
  const iy = label ? 88 : 42; if (label) c.translate(0, -44); footIcon(c, 46, iy, 1.3); UI.font(c, 'Unb9', 50); c.fillStyle = n ? '#C23C4A' : C.green; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(String(n), 92, iy + 2);
  if (label) { UI.textFit(c, 'Unb9', 32, 'СЛЕДЫ', w - 40); c.fillStyle = C.oliveD; c.fillText('СЛЕДЫ', 22, 34); }
  c.restore(); }
let CUR_TAG = 'wide'; const sceneTag = () => CUR_TAG;
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { const rows = [['A1', 'No! Shoes! Off! Dirty!'], ['B1', 'Do you mind if I take my shoes off?'], ['B2', 'When in Rome, do as the Romans do.'], ['C1', "It's just a habit from home."]];
    K.outro(c, t, { q: ['А ТЫ РАЗУВАЕШЬСЯ', 'В ГОСТЯХ?'], rows, cta: ['ОТПРАВЬ ТОМУ, КТО', 'ВСЕГДА РАЗУВАЕТСЯ'], heroX: 95, heroS: 0.34, heroY: [2350, 1985], ctaFit: true,
      hero: (cc, tt) => { const g = G.her, gd = G.hostess; K.put(cc, MAR, { t: tt, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, armL: reach(gd, -1, -gd.sw * 2.0, gd.ySh - 330 + Math.sin(tt * 8) * 30, { planar: true }), armR: hang(gd, 1), items: {} }, 640, 60);
        K.put(cc, HER_S, { t: tt, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(tt * 8) * 30, { planar: true }), armR: hang(g, 1), items: {} }, 0, 0); } });
    const u = t - SC.outro.s, kk = P(u, 1.35, 1.7); if (kk > 0) { const bh = 140 + rows.length * 115, y = 740 - bh / 2 + 150; UI.textFit(c, 'Nun9', 46, rows[0][1], 740); const wd = c.measureText(rows[0][1]).width;
      c.save(); c.globalAlpha = 0.55 * kk; c.fillStyle = C.white; c.fillRect(214, y - 34, wd + 16, 68); c.restore(); c.strokeStyle = C.red; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(212, y + 2); c.lineTo(212 + (wd + 16) * eOut(kk), y + 2); c.stroke(); }
    Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide'; CUR_TAG = tag;
  let heads, proj;
  if (tag.startsWith('ui:')) { insert(c, t, tag.slice(3)); heads = {}; proj = p => ({ x: -1e5, y: 0 }); Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26); }
  const names = { hostess: ['MARGOT', '#8A1C2E'] };
  if (L === 'hook') { const cover = tag === 'cover'; if (cover) { title(c, t); if (t < SP.hook_m.t) coverBadge(c, t); }
    const hookProj = p => { const q = proj(p); return q.x < 0 || q.x > W ? { x: q.x < 0 ? 60 : W - 60, y: 1050 } : q; };
    K.bubbles(c, t, { id: 'hook' }, heads, hookProj, { cleanChunks: true, names, hold: { hook_m: 0.1 } }); if (cover && t < SP.hook_m.t) counter(c, t, sc); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); UI.captions(c, t);
    Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  if (L === 'C2') { const e = k => ev(L, k); if (t > e('think') && t < e('closet') - 0.1) K.pop(c, t, '*МАРГО ДУМАЕТ*', e('think') + 0.05, e('closet') - 0.25, 540, 1450, C.white, -0.04, 60); }
  if (!tag.startsWith('ui:')) K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names, hold: { a1_m: 0.02, a2_m: 0.02, b1_m: 0.02, b2_m: 0.3, c1_m: 0.02, c2_h: 0.05, c2_m: 0.1 } });
  counter(c, t, sc);
  K.hud(c, t, sc);
}
E.run('shoeson', NF, renderFrame);
