// "03:15, the neighbour is drilling" renderer (hard_cut camera): node drill.js start end out.mp4 | node drill.js 0 0 --png=f1,f2
// Sequel to the hit «Соседи»: the heroine in her polka-dot pyjamas + sleep mask (her_party), Rocky (flat 13) in a robe with a headlamp and a drill.
// Two zones of one world: the landing (Rocky's door on the left, her on the right) and her bedroom (x = BX) where the drill tip comes through the wall.
// Running gags: ДЫРКИ counter (1 -> 2 -> 3), the plush giraffe on Rocky's crooked shelf, which in C2 looks out of the hole by her pillow at 06:00.
// Owner's doc «Формат A1–C2 с диктором»: level intros ~0.5 s, no black card before C2, the narrator does not read the card.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/drill/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C, LVCOL, LVNAME } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => (SC.hook.ev || {})[k] ?? 1e9;
const LVS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- cast: the hit's heroine look (pyjamas + sleep mask) and Rocky in a robe
const HER = { ...BASE.her_party };
const RCK = { ...BASE.rocky, top: { type: 'cardigan', col: '#5E9E6E', col2: '#22252E' }, bottom: { type: 'joggers', col: '#3A4050' }, shoes: { col: '#C98B5A', acc: null } };
const G = { her: geom(HER), rocky: geom(RCK) };
const RX = -430, HX = 380, BX = 6000;                       // Rocky in his doorway, her on the landing, bedroom zone
const DOOR = { x: RX, w: 700, h: 2050 };

// ---------------- props
const big = (f, k = 1.5) => ctx => { ctx.scale(k, k); f(ctx); };
const drillDraw = (spin = 0) => ctx => { ctx.save(); ctx.rotate(-0.2);
  paint(ctx, q => { q.m(-30, -20); q.l(30, -20); q.l(26, 110); q.l(-26, 110); q.z(); }, '#2B2F3A', { sd: 4, hd: 2, lw: 3 });                  // grip
  paint(ctx, q => { q.m(-60, -110); q.l(150, -110); q.l(150, -20); q.l(-60, -20); q.z(); }, '#F2C14E', { sd: 8, hd: 4, lw: 3 });             // body
  ctx.fillStyle = '#2B2F3A'; rr(ctx, -50, -100, 50, 70, 10); ctx.fill(); ctx.fillStyle = '#9AA3B2'; rr(ctx, 150, -84, 40, 38, 6); ctx.fill();
  ctx.save(); ctx.translate(190, -65); ctx.fillStyle = '#C9CED6'; ctx.fillRect(0, -6, 120, 12); ctx.strokeStyle = '#6F7886'; ctx.lineWidth = 3;
  for (let x = 6; x < 118; x += 16) { const o = (spin * 40) % 16; ctx.beginPath(); ctx.moveTo(x + o, -6); ctx.lineTo(x + o + 8, 6); ctx.stroke(); } ctx.restore();
  if (spin) { ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 4; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(320, -65, 20 + k * 14, -0.6, 0.6); ctx.stroke(); } }
  ctx.restore(); };
const plugsDraw = ctx => { ctx.save(); ctx.fillStyle = '#F28C28'; for (const dx of [-22, 22]) { ctx.beginPath(); ctx.ellipse(dx, -40, 16, 26, 0.3, 0, TAU); ctx.fill(); } ctx.restore(); };
const cookieDraw = ctx => { ctx.save(); ctx.fillStyle = '#C98B5A'; ctx.beginPath(); ctx.arc(0, -40, 46, 0, TAU); ctx.fill(); ctx.strokeStyle = '#9C6238'; ctx.lineWidth = 4; ctx.stroke(); ctx.fillStyle = '#5A3A22'; for (const [x, y] of [[-16, -54], [14, -30], [8, -64], [-20, -24], [24, -50]]) { ctx.beginPath(); ctx.arc(x, y, 7, 0, TAU); ctx.fill(); } ctx.restore(); };
const ropeDraw = ctx => { ctx.save(); ctx.strokeStyle = '#C9A26A'; ctx.lineWidth = 16; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.ellipse(0, -90, 90 - k * 6, 70 - k * 4, 0.2, 0, TAU); ctx.stroke(); } ctx.strokeStyle = 'rgba(122,78,46,.6)'; ctx.lineWidth = 3; for (let a = 0; a < TAU; a += 0.35) { ctx.beginPath(); ctx.moveTo(Math.cos(a) * 80, -90 + Math.sin(a) * 62); ctx.lineTo(Math.cos(a + 0.12) * 96, -90 + Math.sin(a + 0.12) * 74); ctx.stroke(); }
  ctx.strokeStyle = '#C9A26A'; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(70, -40); ctx.quadraticCurveTo(140, 60, 90, 160); ctx.stroke(); ctx.restore(); };
const phoneDraw = ctx => { ctx.save(); ctx.rotate(-0.1); ctx.fillStyle = '#1B1E26'; rr(ctx, -70, -230, 140, 240, 18); ctx.fill(); ctx.fillStyle = '#F7B6CF'; rr(ctx, -58, -216, 116, 212, 10); ctx.fill(); ctx.fillStyle = '#FFFDF8'; rr(ctx, -46, -130, 92, 52, 18); ctx.fill(); ctx.fillStyle = '#9AA3B2'; ctx.beginPath(); ctx.moveTo(0, -150); ctx.lineTo(16, -110); ctx.lineTo(-16, -110); ctx.fill(); ctx.restore(); };
const drillItem = s => big(drillDraw(s), 1.1), plugsItem = big(plugsDraw, 1.2), cookieItem = big(cookieDraw, 1.2), ropeItem = big(ropeDraw, 1.25), phoneItem = big(phoneDraw, 0.9);
// headlamp (st.front): strap + lamp + soft beam towards where he looks
const headlamp = (on = true) => (c, gg) => { const g = G.rocky, x = gg.head.x, y = gg.head.y - g.hh * 0.42; c.save(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 16; c.beginPath(); c.ellipse(x, y, g.hw * 0.52, g.hh * 0.1, 0, Math.PI * 1.05, Math.PI * 1.95, true); c.stroke();
  if (on) { const gr = c.createRadialGradient(x + 30, y, 10, x + 300, y + 80, 360); gr.addColorStop(0, 'rgba(255,240,170,.55)'); gr.addColorStop(1, 'rgba(255,240,170,0)'); c.fillStyle = gr; c.beginPath(); c.moveTo(x + 20, y - 20); c.lineTo(x + 620, y - 160); c.lineTo(x + 620, y + 260); c.closePath(); c.fill(); }
  c.fillStyle = '#2B2F3A'; rr(c, x - 44, y - 34, 88, 64, 18); c.fill(); c.fillStyle = on ? '#FFF6B0' : '#C9CED6'; c.beginPath(); c.arc(x, y - 2, 22, 0, TAU); c.fill(); c.restore(); };

// ---------------- landing set (prerendered + softly blurred): bright hallway, Rocky's flat seen through door 13
const BX0 = -2200, BY0 = -3400, BWW = 4400, BHH = 4800, BS = 0.5;
function giraffe(c, x, y, s = 1, rot = 0) { c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  paint(c, q => { q.m(-60, 0); q.l(60, 0); q.l(50, -110); q.l(-50, -110); q.z(); }, '#F2C14E', { sd: 8, hd: 4, lw: 4 });
  paint(c, q => { q.m(10, -100); q.l(40, -100); q.l(46, -250); q.l(16, -250); q.z(); }, '#F2C14E', { sd: 6, hd: 3, lw: 4 });
  paint(c, q => q.e(40, -270, 52, 36), '#F2C14E', { sd: 6, hd: 3, lw: 4 }); c.fillStyle = '#C98B5A'; for (const [px, py] of [[-30, -60], [20, -40], [26, -170], [30, -210], [-10, -80]]) { c.beginPath(); c.arc(px, py, 12, 0, TAU); c.fill(); }
  c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(56, -280, 6, 0, TAU); c.fill(); c.fillStyle = '#C98B5A'; for (const dx of [18, 40]) { c.fillRect(dx, -330, 8, 30); c.beginPath(); c.arc(dx + 4, -332, 9, 0, TAU); c.fill(); } c.restore(); }
function drawLanding(c) {
  c.fillStyle = '#F6E7D2'; c.fillRect(BX0, BY0, BWW, BHH); c.fillStyle = '#F0DCC0'; for (let x = BX0; x < BX0 + BWW; x += 240) c.fillRect(x, -3000, 120, 2740);
  c.fillStyle = '#9EC9B8'; c.fillRect(BX0, -900, BWW, 640); c.fillStyle = '#7FB0A0'; c.fillRect(BX0, -920, BWW, 30);
  c.fillStyle = '#C9A27A'; c.fillRect(BX0, -260, BWW, 1700); c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 4; for (let y = -260; y < 1400; y += 120) { c.beginPath(); c.moveTo(BX0, y); c.lineTo(BX0 + BWW, y); c.stroke(); }
  // ceiling lamp (warm, bright)
  c.strokeStyle = '#4A4F5C'; c.lineWidth = 7; c.beginPath(); c.moveTo(0, -3300); c.lineTo(0, -2900); c.stroke(); c.fillStyle = '#FFE6A0'; c.beginPath(); c.arc(0, -2860, 70, 0, TAU); c.fill();
  // Rocky's flat through the doorway: warm lit room, crooked shelf with the giraffe, toolbox, drill holes
  const x0 = RX - DOOR.w / 2, x1 = RX + DOOR.w / 2, top = -DOOR.h;
  c.save(); c.beginPath(); c.rect(x0, top, DOOR.w, DOOR.h); c.clip(); c.fillStyle = '#FFE9C2'; c.fillRect(x0, top, DOOR.w, DOOR.h); c.fillStyle = '#F5D79E'; c.fillRect(x0, -560, DOOR.w, 560);
  c.save(); c.translate(RX - 230, -1180); c.rotate(-0.14); c.fillStyle = '#9C6238'; c.fillRect(-120, 0, 240, 26); c.restore(); giraffe(c, RX - 250, -1190, 0.7, -0.14);
  c.fillStyle = '#2B2F3A'; for (const [hx, hy] of [[RX - 180, -1640], [RX - 120, -1660], [RX + 210, -1700], [RX - 60, -1180], [RX + 160, -1260]]) { c.beginPath(); c.arc(hx, hy, 9, 0, TAU); c.fill(); }
  c.fillStyle = '#E0474C'; rr(c, RX + 90, -170, 170, 110, 12); c.fill(); c.fillStyle = '#8A1C2E'; c.fillRect(RX + 140, -200, 70, 30); c.restore();
  // door frame + number
  c.fillStyle = '#7A4E2E'; c.fillRect(x0 - 40, top - 40, DOOR.w + 80, 40); c.fillRect(x0 - 40, top, 40, DOOR.h); c.fillRect(x1, top, 40, DOOR.h);
  c.fillStyle = '#FFFDF8'; rr(c, RX - 70, top - 160, 140, 90, 14); c.fill(); fitTxt(c, '13', RX, top - 114, 64, '#2B2F3A', 120);
  // her door (right, ajar) + doormat
  c.fillStyle = '#7A4E2E'; c.fillRect(1100, -2050, 520, 2050); c.fillStyle = '#EE5E9A'; c.fillRect(1130, -2020, 460, 2020); c.fillStyle = '#FFFDF8'; rr(c, 1300, -2200, 140, 90, 14); c.fill(); fitTxt(c, '14', 1370, -2154, 64, '#2B2F3A', 120);
  c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(1180, -1000, 18, 0, TAU); c.fill();
  // potted plant + framed picture on the landing
  c.fillStyle = '#FFFDF8'; rr(c, 360, -2000, 420, 300, 16); c.fill(); c.fillStyle = '#BFE3F7'; rr(c, 384, -1976, 372, 252, 8); c.fill(); c.fillStyle = '#8CB369'; c.beginPath(); c.moveTo(384, -1724); c.lineTo(520, -1880); c.lineTo(640, -1760); c.lineTo(756, -1840); c.lineTo(756, -1724); c.fill();
}
const mkBG = (fn, x0, y0, w, h) => { const a = createCanvas(Math.round(w * BS), Math.round(h * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-x0, -y0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGL = mkBG(drawLanding, BX0, BY0, BWW, BHH);

// ---------------- bedroom (x = BX): pink wall shared with Rocky, bed + pillow on the left, plant shelf, window, alarm clock
const PIL = { x: BX - 520, y: -720 }, HOLE = { x: BX - 640, y: -940 };
function bedroom(c, t, L) { const morning = L === 'C2' && t > ev('C2', 'morning');
  c.fillStyle = morning ? '#FCE3EC' : '#F7CFE0'; c.fillRect(BX - 2400, -3400, 4800, 3200); c.fillStyle = morning ? '#F9D4E2' : '#F2BED4'; for (let x = BX - 2400; x < BX + 2400; x += 260) c.fillRect(x, -3400, 120, 3140);
  c.fillStyle = '#C9A27A'; c.fillRect(BX - 2400, -260, 4800, 1700);
  // window
  c.fillStyle = '#FFFDF8'; rr(c, BX + 160, -2300, 800, 900, 18); c.fill(); c.fillStyle = morning ? '#BFE3F7' : '#3A4A8A'; rr(c, BX + 190, -2270, 740, 840, 10); c.fill();
  if (morning) { c.fillStyle = '#FFE15A'; c.beginPath(); c.arc(BX + 760, -2050, 90, 0, TAU); c.fill(); } else { c.fillStyle = '#FFF6DC'; c.beginPath(); c.arc(BX + 760, -2080, 70, 0, TAU); c.fill(); c.fillStyle = '#3A4A8A'; c.beginPath(); c.arc(BX + 730, -2100, 62, 0, TAU); c.fill(); c.fillStyle = '#FFFDF8'; for (const [sx, sy] of [[BX + 300, -2150], [BX + 450, -1900], [BX + 620, -1700], [BX + 860, -1560]]) { c.beginPath(); c.arc(sx, sy, 6, 0, TAU); c.fill(); } }
  c.strokeStyle = '#FFFDF8'; c.lineWidth = 18; c.beginPath(); c.moveTo(BX + 560, -2270); c.lineTo(BX + 560, -1430); c.stroke();
  // shelf + plant (hook: slides to the edge and falls)
  c.fillStyle = '#9C6238'; c.fillRect(BX - 300, -1700, 420, 26);
  const pu = L === 'hook' ? clamp((t - hev('bed')) / (hev('plant') - hev('bed'))) : 1, fall = L === 'hook' ? clamp((t - hev('plant')) / 0.4) : 1;
  const shake = (L === 'hook' && t > hev('bed') && t < hev('plant')) ? Math.sin(t * 60) * 6 : 0;
  const px = lerp(BX - 160, BX + 60, eIO(pu)) + shake, py = -1700 + eIn(fall) * 1440, pr = fall * 1.6;
  if (L === 'hook' || true) { c.save(); c.translate(px, py); c.rotate(pr); paint(c, q => { q.m(-50, 0); q.l(50, 0); q.l(40, -90); q.l(-40, -90); q.z(); }, '#E27D3C', { sd: 6, hd: 3, lw: 3 }); c.fillStyle = '#3E8E55'; for (let i = 0; i < 5; i++) { c.beginPath(); c.ellipse((i - 2) * 22, -150, 18, 70, (i - 2) * 0.35, 0, TAU); c.fill(); } c.restore(); }
  // holes + drill tips through the shared wall above the pillow
  const holes = holeCount(t); const tipOut = (L === 'A1' && t > ev('A1', 'tip') - 0.1 && t < ev('A1', 'tip') + 0.6) || (L === 'B1' && t > ev('B1', 'hole') - 0.1 && t < ev('B1', 'hole') + 0.6);
  [[HOLE.x, HOLE.y], [HOLE.x + 150, HOLE.y - 120], [HOLE.x + 290, HOLE.y + 30]].slice(0, Math.max(0, holes - 1)).forEach(([hx, hy], i) => { c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(hx, hy, i === 0 && morning ? 95 : 22, 0, TAU); c.fill(); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 6; c.stroke();
    for (let k = 0; k < 6; k++) { const a = k * 1.1; c.strokeStyle = 'rgba(80,60,60,.5)'; c.lineWidth = 4; c.beginPath(); c.moveTo(hx + Math.cos(a) * 26, hy + Math.sin(a) * 26); c.lineTo(hx + Math.cos(a) * 46, hy + Math.sin(a) * 46); c.stroke(); } });
  if (tipOut) { const k = L === 'A1' ? 0 : 1, [hx, hy] = [[HOLE.x, HOLE.y], [HOLE.x + 150, HOLE.y - 120]][k], sp = Math.sin(t * 80) * 4; c.save(); c.translate(hx + sp, hy); c.fillStyle = '#C9CED6'; c.beginPath(); c.moveTo(-18, 0); c.lineTo(18, 0); c.lineTo(0, 90); c.closePath(); c.fill(); c.strokeStyle = '#6F7886'; c.lineWidth = 3; for (let y = 10; y < 80; y += 16) { c.beginPath(); c.moveTo(-14 + y * 0.15, y); c.lineTo(14 - y * 0.15, y + 8); c.stroke(); } c.restore();
    c.fillStyle = 'rgba(255,255,255,.8)'; for (let k2 = 0; k2 < 10; k2++) { const a = k2 * 0.63 + t * 7, d = 30 + ((t * 300 + k2 * 31) % 80); c.beginPath(); c.arc(hx + Math.cos(a) * d, hy + Math.sin(a) * d, 5, 0, TAU); c.fill(); } }
  // bed: headboard, mattress, pink pillow, duvet
  c.fillStyle = '#9C6238'; rr(c, BX - 860, -820, 120, 560, 24); c.fill();
  paint(c, q => { q.m(BX - 760, -560); q.l(BX + 600, -560); q.l(BX + 600, -260); q.l(BX - 760, -260); q.z(); }, '#FFFDF8', { sd: 10, hd: 4, lw: 4 });
  paint(c, q => q.e(PIL.x, PIL.y + 70, 200, 80), '#F7B6CF', { sd: 10, hd: 5, lw: 4 });
  // sleeping heroine in the twist (her head on the pillow, mask down), duvet over her
  if (morning) { c.save(); c.translate(PIL.x - G.her.headY * 0.9, PIL.y + 30); c.rotate(-Math.PI / 2); c.scale(0.9, 0.9); K.put(c, HER, { t, talk: 0, mood: 'happy', turn: 0, look: 0, maskDown: 1, armL: hang(G.her, -1), armR: hang(G.her, 1), items: {}, legs: false }, 0, 0); c.restore(); }
  paint(c, q => { q.m(BX - 560, -600); q.q(BX + 100, -680, BX + 640, -580); q.l(BX + 640, -260); q.l(BX - 560, -260); q.z(); }, '#8CB4E8', { sd: 12, hd: 6, lw: 4, inner: k => { k.fillStyle = 'rgba(255,255,255,.4)'; for (let x = BX - 520; x < BX + 640; x += 90) for (let y = -560; y < -280; y += 90) { k.beginPath(); k.arc(x, y, 10, 0, TAU); k.fill(); } } });
  // nightstand + alarm clock 03:15 / 06:00
  c.fillStyle = '#E8C9A0'; rr(c, BX + 700, -620, 320, 360, 16); c.fill(); c.fillStyle = '#2B2F3A'; rr(c, BX + 740, -800, 240, 170, 26); c.fill(); c.fillStyle = '#FFFDF8'; rr(c, BX + 760, -780, 200, 120, 16); c.fill();
  fitTxt(c, morning ? '06:00' : '03:15', BX + 860, -720, 70, morning ? '#4CAF6A' : '#E0474C', 180);
  // twist: the giraffe peeks out of the big hole with a note
  if (morning) { const k = eBack(P(t, ev('C2', 'giraffe') - 0.05, ev('C2', 'giraffe') + 0.4), 1.8); if (k > 0) { c.save(); c.beginPath(); c.arc(HOLE.x, HOLE.y, 95, 0, TAU); c.clip(); c.fillStyle = '#FFE9C2'; c.fillRect(HOLE.x - 100, HOLE.y - 100, 200, 200);
      giraffe(c, HOLE.x - 60, HOLE.y + 420 - 320 * k, 1.2, 0.1); c.restore();
      c.save(); c.translate(HOLE.x + 120, HOLE.y + 150); c.rotate(0.12); c.scale(k, k); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -120 + 6, -60 + 8, 260, 140, 10); c.fill(); c.fillStyle = '#FFF6B0'; rr(c, -120, -60, 260, 140, 10); c.fill();
      fitTxt(c, 'Sorry!', 10, -22, 42, '#2B4FA8', 220, 'Cav7'); fitTxt(c, 'Coffee at 10?', 10, 32, 38, '#2B4FA8', 230, 'Cav7'); c.restore(); } } }

// ---------------- running counter
function holeCount(t) { let n = 1; if (t > ev('A1', 'tip')) n = 2; if (t > ev('B1', 'hole')) n = 3; return n; }

// ---------------- characters
const gest = (st, g, who, t, side, base) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } };
const hang = (g, s) => reach(g, s, s * g.sw * 0.8, g.ySh + 330);
const chest = (g, s, k = 0.6) => reach(g, s, s * g.sw * k, g.ySh + 230);
const cross = g => ({ armL: reach(g, -1, g.sw * 0.5, g.ySh + 240), armR: reach(g, 1, -g.sw * 0.5, g.ySh + 270) });
const hand2head = (g, s, k = 0.5) => reach(g, s, s * g.hw * k, g.headY + g.hh * 0.8);
const drilling = t => (t > hev('drill') && t < hev('drill') + 1.0) || (t > ev('A1', 'drill') && t < ev('A1', 'drill') + 1.0);
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { t, talk: talk('her', t), mood: 'tired', turn: -0.3, look: -0.7, armL: hang(g, -1), armR: hang(g, 1), items: {} };
  if (L === 'hook') { st.mood = 'annoyed'; Object.assign(st, cross(g)); if (t > hev('drill')) { st.mood = 'shock'; st.blink = 0; st.armL = hand2head(g, -1, 0.95); st.armR = hand2head(g, 1, 0.95); } }
  if (L === 'A1') { if (speaking('a1_h', t, 0.05, 0.3)) { st.mood = 'angry'; st.armL = reach(g, -1, -g.sw * 2.0, g.ySh - 200 + Math.sin(t * 12) * 30, { planar: true }); }
    if (speaking('a1_r', t, 0, 0.1)) { st.mood = 'shock'; st.blink = 0; } if (t > e('drill')) { st.mood = 'shock'; st.blink = 0; st.armL = hand2head(g, -1, 0.95); st.armR = hand2head(g, 1, 0.95); } if (t > e('react')) { st.mood = 'tired'; Object.assign(st, cross(g)); } }
  if (L === 'A2') { if (speaking('a2_h', t, 0.05, 0.3)) { st.mood = 'angry'; gest(st, g, 'her', t, -1, 100); } if (speaking('a2_r', t, 0, 0.2)) { st.mood = 'surprised'; st.blink = 0; } if (t > e('react')) { st.mood = 'bored'; Object.assign(st, cross(g)); } }
  if (L === 'B1') { st.mood = 'tired'; if (speaking('b1_h', t, 0.05, 0.2)) { st.mood = 'worried'; gest(st, g, 'her', t, -1, 150); }
    if (t > e('gift')) { st.items = { L: plugsItem }; st.armL = reach(g, -1, -g.sw * 1.2, g.ySh + 60); st.mood = 'surprised'; } if (t > e('cookie')) { st.items = { L: plugsItem, R: cookieItem }; st.armR = reach(g, 1, g.sw * 0.9, g.ySh + 80); }
    if (t > e('close')) { st.mood = 'bored'; } if (t > e('drill')) { st.mood = 'tired'; st.lookY = -0.3; } }
  if (L === 'B2') { if (speaking('b2_h', t, 0.05, 0.3)) { st.mood = 'sad'; st.armL = hand2head(g, -1, 0.8); } if (t > e('rope')) { st.items = { L: ropeItem }; st.armL = reach(g, -1, -g.sw * 1.0, g.ySh + 120); st.mood = 'shock'; st.blink = 0; } if (t > e('react')) { st.mood = 'bored'; } }
  if (L === 'C1') { st.mood = 'neutral'; if (t > e('phone') - 0.2 && t < e('tiptoe') + 0.8) { st.items = { L: phoneItem }; st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 140, { planar: true }); } if (t > e('gulp')) st.mood = 'skeptical'; if (t > e('tiptoe')) { st.mood = 'happy'; } }
  if (L === 'C2') { st.mood = 'neutral'; st.turn = -0.4; if (speaking('c2_h', t, 0.05, 0.1)) { st.mood = 'smug'; gest(st, g, 'her', t, -1, 140); st.armR = chest(g, 1, 0.3); }
    if (t > e('think') - 0.1 && t < SP.c2_h2.t) { st.mood = 'neutral'; Object.assign(st, cross(g)); } if (speaking('c2_h2', t, 0.05, 0.6)) { st.mood = 'bored'; Object.assign(st, cross(g)); st.turn = 0; st.look = 0; } }
  return st; }
function rockyState(t, L) { const g = G.rocky, e = k => ev(L, k), st = { t, talk: talk('rocky', t), mood: 'happy', turn: 0.35, look: 0.8, armL: hang(g, -1), armR: reach(g, 1, g.sw * 1.6, g.ySh + 40), items: { R: drillItem(0) }, front: headlamp(true) };
  if (drilling(t)) { st.items = { R: drillItem(t) }; st.armR = reach(g, 1, g.sw * 1.6 + Math.sin(t * 50) * 8, g.ySh - 160, { planar: true }); st.mood = 'happy'; st.laugh = true; st.turn = -0.6; st.look = -0.9; }
  if (L === 'hook') { if (speaking('hook_r', t, 0, 0.2)) { st.mood = 'happy'; st.armL = reach(g, -1, -g.sw * 1.2, g.ySh - 220, { planar: true }); } }
  if (L === 'A1') { if (speaking('a1_r', t, 0, 0.2)) { st.mood = 'happy'; st.laugh = true; gest(st, g, 'rocky', t, -1, 120); } }
  if (L === 'A2') { if (t > e('bow') && t < endOf('a2_r') + 0.6) { const u = clamp((t - e('bow')) / 0.3); st.tilt = -0.25 * Math.sin(u * Math.PI) - 0.1 * u; st.mood = 'happy'; st.laugh = true; st.armL = chest(g, -1, 0.4); } else if (t > e('bow')) st.mood = 'smug'; }
  if (L === 'B1') { if (speaking('b1_h', t, 0, 0.2)) st.mood = 'worried'; if (speaking('b1_r', t, 0, 0.3)) { st.mood = 'worried'; st.armL = reach(g, -1, g.sw * 1.6, g.ySh - 40, { planar: true }); } }
  if (L === 'B2') { if (speaking('b2_h', t, 0, 0.1)) st.mood = 'surprised'; if (t > e('rope') - 0.3) { st.mood = 'happy'; st.laugh = speaking('b2_r', t); if (t < e('rope') + 0.5) st.armL = reach(g, -1, g.sw * 1.8, g.ySh, { planar: true }); } }
  if (L === 'C1') { if (t > e('phone')) { st.mood = 'surprised'; st.blink = 0; } if (t > e('gulp')) { st.mood = 'worried'; st.lookY = 0.3; } if (speaking('c1_r', t, 0, 0.2)) { st.mood = 'worried'; st.armL = chest(g, -1, 0.3); st.front = headlamp(false); }
    if (t > e('tiptoe')) { st.mood = 'worried'; st.turn = -0.8; st.front = headlamp(false); } }
  if (L === 'C2') { if (speaking('c2_h', t, 0, 0.1)) { st.mood = 'surprised'; st.blink = 0; } if (t > e('think') - 0.05) { st.mood = 'skeptical'; st.armL = reach(g, -1, -g.hw * 0.2, g.headY + g.hh * 0.95); st.lookY = -0.4; }
    if (speaking('c2_r', t, 0.05, 0.2)) { st.mood = 'skeptical'; st.lookY = 0; } if (t > endOf('c2_r') + 0.3) { st.mood = 'shock'; st.blink = 0; } }
  return st; }
function rockyX(t, L) { if (L === 'C1' && t > ev('C1', 'tiptoe')) return RX - 300 * eIO(clamp((t - ev('C1', 'tiptoe')) / 1.2)); return RX; }
function doorK(t, L) { if (L === 'B1') return eIO(P(t, ev('B1', 'close') - 0.25, ev('B1', 'close'))); if (L === 'C1') return eIO(P(t, ev('C1', 'tiptoe') + 1.0, ev('C1', 'tiptoe') + 1.5)); return 0; }
function doorLeaf(c, k) { if (k <= 0) return; const x0 = RX - DOOR.w / 2, w = DOOR.w * k; c.save(); paint(c, q => { q.m(x0, -DOOR.h); q.l(x0 + w, -DOOR.h); q.l(x0 + w, 0); q.l(x0, 0); q.z(); }, '#2F6DB5', { sd: 10, hd: 4, lw: 4 }); if (k > 0.6) { c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(x0 + w - 60, -1000, 20, 0, TAU); c.fill(); fitTxt(c, '13', x0 + w / 2, -1500, 90, '#FFFDF8', 200); } c.restore(); }

// ---------------- world
const DRAW = { wide: ['her', 'rocky'], card: ['her', 'rocky'], two: ['her', 'rocky'], her: ['her'], rocky: ['rocky'], cover: ['her', 'rocky'], bed: [] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  if (tag === 'bed') { bedroom(c, t, L); return { her: OFF, rocky: OFFL }; }
  c.drawImage(BGL, BX0, BY0, BWW, BHH);
  const dk = doorK(t, L);
  if (who.includes('rocky') && dk < 0.98) heads.rocky = K.put(c, RCK, rockyState(t, L), rockyX(t, L), 0);
  doorLeaf(c, dk);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), HX, 0);
  if (!heads.rocky) heads.rocky = OFFL; if (!heads.her) heads.her = OFF;
  return heads; }

// ---------------- shots
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const hHY = G.her.headY, rHY = G.rocky.headY;
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(-20, -1180, 0.62, 'cover'), WIDE: S(-20, -1000, 0.5, 'wide'), CARD: S(-20, fy(rHY, 0.62, 1000), 0.62, 'card'), TWO: S(-20, fy(rHY, 0.68, 860), 0.68, 'two'),
  HER: S(HX + 20, fy(hHY, 1.0), 1.0, 'her'), HER_CU: S(HX + 20, fy(hHY, 1.6, 960), 1.6, 'her'), RK: S(RX + 20, fy(rHY, 0.95), 0.95, 'rocky'), RK_H: S(RX + 20, fy(rHY, 0.95, 1200), 0.95, 'rocky'), RK_CU: S(RX + 20, fy(rHY, 1.5, 960), 1.5, 'rocky'),
  BED: S(BX - 250, -950, 0.72, 'bed'), TIP: S(HOLE.x + 120, HOLE.y + 80, 1.1, 'bed'), GIR: S(HOLE.x + 160, HOLE.y + 60, 0.95, 'bed'), DOOR: S(RX + 300, -1050, 0.62, 'two') };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  const sp = id => speaking(id, t, 0.1, 0.15);
  if (L === 'hook') { if (t < SP.hook_r.t - 0.1) return SH.COVER; if (t < hev('bed') - 0.05) return f(SH.RK_H); if (t < hev('plant') + 0.9) return f(SH.BED); return f(SH.COVER); }
  const u = t - sc.s, l = L.toLowerCase(), nar = SP[l + '_nar'];
  if (u < 0.5) return f(SH.WIDE);
  if (L === 'C2' && t > e('morning') - 0.05) return f(t > e('giraffe') - 0.1 ? SH.GIR : SH.BED);
  if (nar && t >= nar.t - 0.1) return f(SH.CARD);
  if (L === 'A1') { if (t > e('react') - 0.05) return f(SH.HER_CU); if (t > e('tip') - 0.1) return f(SH.TIP); if (t > e('drill') - 0.05) return f(SH.RK); }
  if (L === 'A2') { if (t > e('react') - 0.05) return f(SH.HER_CU); if (t > e('bow') - 0.1 && t < endOf('a2_r') + 0.3) return f(SH.TWO); }
  if (L === 'B1') { if (t > e('hole') - 0.1) return f(SH.TIP); if (t > e('close') - 0.4) return f(SH.DOOR); if (t > e('gift') - 0.2 && t < endOf('b1_r') + 0.2) return f(SH.TWO); }
  if (L === 'B2') { if (t > e('react') - 0.05) return f(SH.HER_CU); if (t > e('rope') - 0.2) return f(SH.TWO); }
  if (L === 'C1') { if (t > e('tiptoe') - 0.1) return f(SH.TWO); if (t > e('gulp') - 0.05) return f(SH.RK_CU); }
  if (L === 'C2') { if (sp('c2_h')) { const ch = (TL.cfg.chunks || {}).c2_h, p = SP.c2_h, i = Math.min(ch.length - 1, Math.floor((t - p.t) / p.d * ch.length)); return f([SH.HER, SH.HER_CU, SH.HER, SH.HER_CU][i] || SH.HER); }
    if (t > endOf('c2_h') && t < e('think') + 0.8) return f(SH.WIDE); if (t < SP.c2_r.t - 0.1) return f(SH.RK_CU); if (sp('c2_r')) return f(SH.RK); if (t > e('react') - 0.05) return f(SH.HER_CU); }
  const cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.1 && t < s.t + s.d + 0.25);
  const single = who => who === 'her' ? SH.HER : SH.RK;
  if (cur) return f(single(cur.who));
  const next = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.6 && t < s.t);
  if (next) return f(single(next.who));
  return SH.TWO; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud', 'drill']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- HUD: fast level intro (~0.5 s, owner's doc), hole counter, phone photo insert
function levelIntroFast(c, t, sc) { const L = sc.id, i = LVS.indexOf(L); if (i < 0) return; const u = (t - sc.s) * (1.15 / 0.5); if (u > 1.2 || u < 0) return;
  const col = LVCOL[L], pw = 128, gap = 14, x0 = (W - (6 * pw + 5 * gap)) / 2, px = x0 + i * (pw + gap) + pw / 2, py = 253;
  const inK = eOut(P(u, 0, 0.3)), outK = eIO(P(u, 0.82, 1.15)), cx = lerp(540, px, outK), cy = lerp(960, py, outK), R = lerp(0, 1300, inK) * (1 - outK) + 40 * outK; if (R < 2) return;
  c.save(); c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.clip(); c.fillStyle = col; c.fillRect(0, 0, W, HH);
  const s = eBack(P(u, 0.12, 0.45), 2.2) * lerp(1, 0.18, outK); c.translate(cx, cy); c.scale(s, s); c.rotate(-0.08); c.textAlign = 'center'; c.textBaseline = 'middle';
  UI.font(c, 'Unb9', 400); c.fillStyle = 'rgba(0,0,0,.18)'; c.fillText(L, 14, 24); UI.strokeText(c, L, 0, 0, C.white, C.oliveD, 22); UI.font(c, 'Unb7', 54); c.fillStyle = C.white; c.fillText(LVNAME[L], 0, 250); c.restore(); }
function holeHud(c, t) { const n = holeCount(t), last = [ev('A1', 'tip'), ev('B1', 'hole')].filter(x => x < 1e8).reduce((a, q) => Math.max(a, 1 - clamp(Math.abs(t - q - 0.15) / 0.35)), 0);
  c.save(); c.translate(200, 1555); c.scale(1 + 0.15 * last, 1 + 0.15 * last); c.rotate(-0.04); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -150 + 6, -38 + 8, 300, 76, 38); c.fill(); c.fillStyle = C.red; rr(c, -150, -38, 300, 76, 38); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke(); fitTxt(c, 'ДЫРКИ: ' + n, 0, 3, 38, C.white, 270); c.restore(); }
function phoneInsert(c, t) { const a = ev('C1', 'phone'), b = ev('C1', 'gulp') - 0.1; if (t < a || t > b) return; const k = eBack(P(t, a, a + 0.3), 1.8) * (1 - eIn(P(t, b - 0.25, b))); if (k <= 0) return;
  c.save(); c.translate(560, 1180); c.scale(k, k); c.translate(-560, -1180);
  K.phone(c, 560, 1180, 0.8, (q, w, h) => { q.fillStyle = '#F7CFE0'; q.fillRect(0, 0, w, h); q.fillStyle = '#F7B6CF'; q.beginPath(); q.ellipse(w / 2, h * 0.7, 170, 70, 0, 0, TAU); q.fill(); q.strokeStyle = '#C23C76'; q.lineWidth = 4; q.stroke();
    q.fillStyle = '#2B2F3A'; q.beginPath(); q.arc(w / 2 - 20, h * 0.38, 24, 0, TAU); q.fill(); q.fillStyle = '#C9CED6'; q.beginPath(); q.moveTo(w / 2 - 40, h * 0.38); q.lineTo(w / 2, h * 0.38); q.lineTo(w / 2 - 20, h * 0.38 + 120); q.closePath(); q.fill();
    q.strokeStyle = '#E0474C'; q.lineWidth = 8; q.beginPath(); q.arc(w / 2 - 20, h * 0.45, 110, 0, TAU); q.stroke(); fitTxt(q, '03:15', w / 2, 60, 44, '#3E471E', w - 40); }); c.restore(); }
function hud(c, t, sc) { UI.card(c, t, sc); UI.captions(c, t); UI.sparkles(c, t); Hq.grain(c, W, HH, t, 0.04); UI.levelBar(c, t, sc, 1); holeHud(c, t); UI.watermark(c); levelIntroFast(c, t, sc); UI.levelIntroNext(c, t); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { K.outro(c, t, { q: ['А ЧТО БЫ ТЫ СКАЗАЛ', 'СОСЕДУ?'], rows: [['A2', "You're making a lot of noise."], ['B1', 'Could you stop drilling, please?'], ['B2', "I'm at the end of my rope."], ['C1', 'I appreciate the effort, but…'], ['C2', 'I must insist…']], cta: ['ОТПРАВЬ', 'ДРУГУ'], heroX: 190, heroS: 0.42,
    hero: (cc, tt) => { const g = G.her, gr = G.rocky; K.put(cc, RCK, { t: tt, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, armL: reach(gr, -1, -gr.sw * 2.0, gr.ySh - 330 + Math.sin(tt * 8) * 30, { planar: true }), armR: reach(gr, 1, gr.sw * 1.6, gr.ySh + 40), items: { R: drillItem(0) }, front: headlamp(true) }, 1500, 60);
      K.put(cc, HER, { t: tt, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(tt * 8) * 30, { planar: true }), armR: hang(g, 1), items: {} }, 0, 0); } });
    Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  const r = drawWorld(c, t, L, cam, tag, sh), heads = r.heads, M = r.M, proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.22);
  const names = { rocky: ['ROCKY', '#E0474C'] };
  if (L === 'hook') { const hookProj = p => { const q = proj(p); return q.x < 0 || q.x > W ? { x: q.x < 0 ? 60 : W - 60, y: 1050 } : q; };
    if (tag === 'bed' && t > hev('bed')) K.pop(c, t, 'ТРЯСЁТСЯ СТЕНА', hev('bed') + 0.1, hev('plant') + 0.85, 540, 1180, C.gold, -0.06, 64);
    K.bubbles(c, t, { id: 'hook' }, heads, hookProj, { cleanChunks: true, names, hold: { hook_r: 0.3 } }); if (tag === 'cover') K.titleRibbon(c, t, 540, 470); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); UI.captions(c, t);
    holeHud(c, t); Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  const e = k => ev(L, k), narT = (SP[L.toLowerCase() + '_nar'] || { t: 1e9 }).t;
  if (L === 'A1' && t > e('tip') && t < narT - 0.1) K.pop(c, t, 'ДЫРКА №2!', e('tip') + 0.05, narT - 0.2, 540, 1330, C.gold, -0.06, 90);
  if (L === 'A2' && t > e('bow') && t < narT - 0.1) K.pop(c, t, 'КОМПЛИМЕНТ?!', e('bow') + 0.1, narT - 0.2, 540, 1330, C.gold, -0.06, 80);
  if (L === 'B1') { if (t > e('gift') && t < e('close') - 0.2) K.pop(c, t, 'БЕРУШИ + ПЕЧЕНЬЕ', e('gift') + 0.05, e('close') - 0.25, 540, 1330, C.gold, -0.06, 62); if (t > e('hole') && t < narT - 0.1) K.pop(c, t, 'ДЫРКА №3!', e('hole') + 0.05, narT - 0.2, 540, 1330, C.gold, -0.06, 90); }
  if (L === 'B2' && t > e('rope') + 0.2 && t < narT - 0.1) K.pop(c, t, 'ВЕРЁВКА?!', e('rope') + 0.25, narT - 0.2, 540, 1330, C.gold, -0.06, 96);
  if (L === 'C1' && t > e('tiptoe') && t < narT - 0.1) K.pop(c, t, 'НА ЦЫПОЧКАХ…', e('tiptoe') + 0.05, narT - 0.2, 540, 1330, C.gold, -0.06, 76);
  if (L === 'C2') { if (t > e('think') && t < SP.c2_r.t - 0.05) K.dots(c, t, e('think') + 0.05, SP.c2_r.t - 0.05, 1450);
    if (t > e('morning') && t < e('giraffe')) K.pop(c, t, '06:00', e('morning') + 0.05, e('giraffe') - 0.05, 540, 1330, C.gold, -0.06, 120); }
  K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names, hold: { a1_h: 0.05, a1_r: 0.3, a2_h: 0.05, a2_r: 0.3, b1_h: 0.05, b1_r: 0.4, b2_h: 0.05, b2_r: 0.4, c1_h: 0.05, c1_r: 0.3, c2_r: 0.3, c2_h2: 0.4 } });
  phoneInsert(c, t);
  hud(c, t, sc);
}
E.run('drill', NF, renderFrame);
